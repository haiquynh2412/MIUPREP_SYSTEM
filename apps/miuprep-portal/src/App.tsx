import React, { Suspense, useState, useEffect } from 'react';
import type { JSX } from 'react';
import { MiuMascot } from '@miuprep/ui';
import { calculateCoinsReward } from '@miuprep/core';
import { useTranslation, LanguageToggle } from '@miuprep/i18n/src/react';
import { LocalStorageAdapter, LocalUser, SystemLog, hashPassword, verifyPassword } from '@miuprep/db';
import { buildLearningEvent, type LearningEventRecord } from '@miuprep/learning';
import {
  advanceSatPractice,
  answerSatQuestion,
  createSatErrorQuestion,
  createSatPracticeState,
  type ErrorNotebookQuestion,
  type SatPracticeState,
  type SatQuestion,
} from './lib/satPractice';
import {
  DEFAULT_ERROR_NOTEBOOK_QUESTIONS,
  DAILY_PLAN_COMPLETION_REWARD,
  buildDailyLoopStepLearningEvent,
  buildEnglishItemBankPracticeAttemptLearningEvent,
  buildErrorRetryLearningEvent,
  buildLessonTemplateActionLearningEvent,
  buildTemplatePracticeAttemptLearningEvent,
  buildStudentWorkspaceTabs,
  countActiveErrorQuestions,
  getActiveErrorQuestions,
  getTodayPlanDateKey,
  loadStudentProgressSnapshot,
  openErrorNotebookFromOverview,
  persistCoinBalance,
  persistDiaryUpdate,
  persistTrapCount,
  purchaseMascotItem,
  recordStudyDiary,
  resolveErrorRetry,
  toggleMascotItem,
  type DailyLoopStepId,
  type DiaryEntry,
  type LessonTemplateAction,
  type StudentWorkspaceTabId,
} from './lib/studentProgress';
import type {
  TemplatePracticeChoiceKey,
  TemplatePracticeQuestion,
  TemplatePracticeState,
  TemplatePracticeTemplate,
} from './lib/templatePractice';
import type {
  EnglishItemBankPracticeChoiceKey,
  EnglishItemBankPracticeQuestion,
  EnglishItemBankPracticeState,
} from './lib/englishItemBankPractice';
import type { AdminSatQuestion } from './components/AdminSatContentPanel';
import AdminUserDetailModal from './components/AdminUserDetailModal';
import type { SatTaxonomy } from './components/StudentSatBoardWorkspace';
import {
  buildContentExamChangeSet,
  buildContentReviewChangeSetExport,
  countEditableExamQuestions,
  createCasioTip,
  createDemoExam,
  createEditableExamSectionsFromJson,
  createEnglishExam,
  createLatexMathLesson,
  createMathLesson,
  ensureEditableExamSections,
  filterImportedExamsByReviewStatus,
  importExamFromJson,
  loadPersistedImportedExams,
  mergeImportedExamState,
  savePersistedImportedExams,
  summarizeContentReview,
  type ContentExamChangeSet,
  type ContentReviewChangeSetExport,
  type ContentReviewFilter,
  type EditableExamSection,
  type EnglishExamTrack,
  type ImportedExam,
  type MathLesson,
} from './lib/adminContent';

const SystemSurfacePreview = React.lazy(() => import('./components/SystemSurfacePreview'));
const AdminAnalyticsWorkspace = React.lazy(() => import('./components/AdminAnalyticsWorkspace'));
const AdminContentReviewPanel = React.lazy(() => import('./components/AdminContentReviewPanel'));
const AdminExamImportPanel = React.lazy(() => import('./components/AdminExamImportPanel'));
const AdminLogsPanel = React.lazy(() => import('./components/AdminLogsPanel'));
const AdminMathContentPanel = React.lazy(() => import('./components/AdminMathContentPanel'));
const AdminOverviewPanel = React.lazy(() => import('./components/AdminOverviewPanel'));
const AdminSatContentPanel = React.lazy(() => import('./components/AdminSatContentPanel'));
const AdminUsersPanel = React.lazy(() => import('./components/AdminUsersPanel'));
const ParentWorkspace = React.lazy(() => import('./components/ParentWorkspace'));
const StudentDashboardWorkspace = React.lazy(() => import('./components/StudentDashboardWorkspace'));
const StudentSatBoardWorkspace = React.lazy(() => import('./components/StudentSatBoardWorkspace'));

type TemplatePracticeModule = typeof import('./lib/templatePractice');
type EnglishItemBankPracticeModule = typeof import('./lib/englishItemBankPractice');

let templatePracticeModulePromise: Promise<TemplatePracticeModule> | null = null;
let englishItemBankPracticeModulePromise: Promise<EnglishItemBankPracticeModule> | null = null;

function loadTemplatePracticeModule(): Promise<TemplatePracticeModule> {
  if (!templatePracticeModulePromise) {
    templatePracticeModulePromise = import('./lib/templatePractice');
  }
  return templatePracticeModulePromise;
}

function loadEnglishItemBankPracticeModule(): Promise<EnglishItemBankPracticeModule> {
  if (!englishItemBankPracticeModulePromise) {
    englishItemBankPracticeModulePromise = import('./lib/englishItemBankPractice');
  }
  return englishItemBankPracticeModulePromise;
}

const db = new LocalStorageAdapter();

function downloadJsonFile(filename: string, payload: ContentExamChangeSet | ContentReviewChangeSetExport): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function safeFilePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'content';
}

function DeferredPanel({ children, label = 'Loading workspace' }: { children: React.ReactNode; label?: string }): JSX.Element {
  return (
    <Suspense
      fallback={(
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="h-2 w-28 rounded-full bg-emerald-400/70 animate-pulse mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 m-0">{label}</p>
        </section>
      )}
    >
      {children}
    </Suspense>
  );
}

type LessonTemplateActionTemplate = TemplatePracticeTemplate;

const ENGLISH_PROGRAM_ORDER = ['ielts', 'cae', 'cpe', 'sat'] as const;

function resolvePrimaryEnglishProgramId(user: LocalUser): typeof ENGLISH_PROGRAM_ORDER[number] {
  const assignedTracks = user.assignedTracks?.length ? user.assignedTracks : [user.assignedTrack || 'ielts'];
  return ENGLISH_PROGRAM_ORDER.find((programId) => assignedTracks.includes(programId)) || 'ielts';
}

function buildSatPracticeLearningEvent(
  learner: LocalUser,
  question: SatQuestion,
  state: SatPracticeState,
  selectedAnswer: string,
  isCorrect: boolean,
): LearningEventRecord {
  const occurredAt = new Date().toISOString();
  const itemId = question.id || `sat-${safeFilePart(state.bankName)}-${state.currentIndex + 1}`;
  const domainId = inferSatLearningDomain(question, state);
  const conceptIds = inferSatLearningConceptIds(question, state, domainId);
  const skillIds = inferSatLearningSkillIds(question, state, domainId);

  return buildLearningEvent(
    'practice_attempt',
    {
      attemptId: `sat-${learner.username}-${itemId}-${safeFilePart(occurredAt)}`,
      itemId,
      domainId,
      programId: 'sat',
      conceptIds,
      skillIds,
      correct: isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      difficulty: question.difficulty || '',
      mode: 'practice',
      selectedAnswer,
      correctAnswer: question.correctAnswer || '',
      errorCategories: isCorrect ? [] : [inferSatErrorCategory(question, domainId)],
      misconceptionIds: isCorrect ? [] : inferSatMisconceptionIds(question, domainId),
      timeSpentSeconds: 0,
      bankName: state.bankName,
      questionIndex: state.currentIndex,
      sourceSurface: 'sat_practice_board',
    },
    {
      learnerId: learner.username,
      entityType: 'learning_item',
      entityId: itemId,
      occurredAt,
      source: 'miuprep_portal_sat_practice',
    },
  );
}

function inferSatLearningDomain(question: SatQuestion, state: SatPracticeState): string {
  const value = `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''} ${state.domain || ''}`.toLowerCase();
  return value.includes('math') || value.includes('algebra') || value.includes('geometry') ? 'mathematics' : 'english_core';
}

function inferSatLearningConceptIds(question: SatQuestion, state: SatPracticeState, domainId: string): string[] {
  const value = satTopicValue(question, state);
  if (domainId === 'mathematics') {
    if (value.includes('advanced') || value.includes('quadratic') || value.includes('function')) {
      return ['math.quadratic_equation', 'math.functions_graphs', 'math.algebraic_expression'];
    }
    if (value.includes('geometry') || value.includes('trigonometry')) {
      return ['math.plane_geometry', 'math.trigonometry', 'math.spatial_geometry'];
    }
    if (value.includes('data') || value.includes('probability') || value.includes('statistics')) {
      return ['math.statistics', 'math.probability', 'math.word_problem_modeling'];
    }
    return ['math.linear_equation', 'math.algebraic_expression'];
  }
  if (value.includes('standard') || value.includes('grammar') || value.includes('convention')) {
    return ['eng.grammar_accuracy', 'eng.sentence_structure', 'eng.verb_tense_aspect'];
  }
  if (value.includes('craft') || value.includes('structure') || value.includes('vocab')) {
    return ['eng.vocabulary_range', 'eng.reading_argument_structure', 'eng.reading_inference'];
  }
  if (value.includes('expression') || value.includes('ideas')) {
    return ['eng.cohesion_reference', 'eng.reading_argument_structure', 'eng.academic_register'];
  }
  return ['eng.reading_main_idea', 'eng.reading_detail', 'eng.reading_inference'];
}

function inferSatLearningSkillIds(question: SatQuestion, state: SatPracticeState, domainId: string): string[] {
  const value = satTopicValue(question, state);
  if (domainId === 'mathematics') {
    if (value.includes('advanced') || value.includes('quadratic') || value.includes('function')) {
      return ['math.solve_quadratic_by_factor', 'math.analyze_function_graph', 'math.simplify_expression'];
    }
    if (value.includes('geometry') || value.includes('trigonometry')) {
      return ['math.prove_circle_geometry', 'math.use_trig_ratios', 'math.compute_solid_measure'];
    }
    if (value.includes('data') || value.includes('probability') || value.includes('statistics')) {
      return ['math.interpret_statistics', 'math.compute_probability', 'math.model_word_problem'];
    }
    return ['math.solve_linear_equation', 'math.solve_system', 'math.simplify_expression'];
  }
  if (value.includes('standard') || value.includes('grammar') || value.includes('convention')) {
    return ['eng.control_clause_structure', 'eng.edit_sentence_errors', 'eng.control_tense_aspect'];
  }
  if (value.includes('craft') || value.includes('structure') || value.includes('vocab')) {
    return ['eng.use_collocation', 'eng.evaluate_argument_flow', 'eng.infer_implicit_meaning'];
  }
  if (value.includes('expression') || value.includes('ideas')) {
    return ['eng.track_cohesive_reference', 'eng.evaluate_argument_flow', 'eng.choose_register'];
  }
  return ['eng.identify_main_idea', 'eng.identify_specific_detail', 'eng.infer_implicit_meaning'];
}

function inferSatErrorCategory(question: SatQuestion, domainId: string): string {
  const value = `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''}`.toLowerCase();
  if (domainId === 'mathematics') return value.includes('geometry') ? 'reading_prompt' : 'calculation';
  if (value.includes('grammar') || value.includes('standard')) return 'grammar';
  if (value.includes('vocab') || value.includes('word')) return 'vocabulary';
  if (value.includes('inference') || value.includes('evidence')) return 'inference';
  return 'reading_prompt';
}

function inferSatMisconceptionIds(question: SatQuestion, domainId: string): string[] {
  const value = `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''}`.toLowerCase();
  if (domainId === 'mathematics') {
    if (value.includes('algebra')) return ['mis.math.factor_vs_expand'];
    return ['mis.math.calculation_slip'];
  }
  if (value.includes('inference') || value.includes('evidence')) return ['mis.eng.inference_literal_only'];
  return [];
}

function satTopicValue(question: SatQuestion, state: SatPracticeState): string {
  return `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''} ${state.domain || ''} ${state.skill || ''}`.toLowerCase();
}

interface TrackInfo {
  id: 'math' | 'sat' | 'ielts' | 'cpe' | 'cae';
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  colorClass: string;
  buttonText: string;
  bubbleText: string;
}

type AdminWorkspaceTabId = 'overview' | 'analytics' | 'users' | 'content' | 'logs';

interface AdminWorkspaceTabConfig {
  id: AdminWorkspaceTabId;
  label: string;
  detail: string;
}

function isAdminContentAccount(user: LocalUser | Omit<LocalUser, 'passwordHash'> | null | undefined): boolean {
  if (!user || user.role !== 'admin') {
    return false;
  }
  return user.username === 'admincontent' || user.contactInfo === 'admincontent@miuprep.edu.vn';
}

function buildAdminWorkspaceTabs(input: {
  activeTrack: string;
  isAdminContentOnly: boolean;
  logCount: number;
  userCount: number;
}): AdminWorkspaceTabConfig[] {
  if (input.isAdminContentOnly) {
    return [
      { id: 'content', label: 'Content', detail: input.activeTrack.toUpperCase() },
      { id: 'analytics', label: 'Quality', detail: 'Review' }
    ];
  }

  return [
    { id: 'overview', label: 'Overview', detail: 'Signals' },
    { id: 'analytics', label: 'Analytics', detail: 'Quality' },
    { id: 'users', label: 'Users', detail: String(input.userCount) },
    { id: 'content', label: 'Content', detail: input.activeTrack.toUpperCase() },
    { id: 'logs', label: 'Logs', detail: String(input.logCount) }
  ];
}

export default function App() {
  const { t } = useTranslation();
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Registration Form States
  const [regRole, setRegRole] = useState<'student' | 'parent' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [studentToLink, setStudentToLink] = useState(''); // parent link student
  
  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // 2. Student Dashboard States
  const [hoveredTrack, setHoveredTrack] = useState<TrackInfo['id'] | null>(null);
  const [fishCoins, setFishCoins] = useState<number>(150);
  const [mouseTrapsCount, setMouseTrapsCount] = useState<number>(4);
  const [studyDiary, setStudyDiary] = useState<string>("");
  const [diaryMood, setDiaryMood] = useState<string>("😸");
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([]);

  // 3. Parent Dashboard States
  const [linkedStudentsList, setLinkedStudentsList] = useState<LocalUser[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<number>(50);
  const [weeklyTargetValue, setWeeklyTargetValue] = useState<number>(4);
  
  // 4. Admin Dashboard States
  const [allUsersList, setAllUsersList] = useState<Omit<LocalUser, 'passwordHash'>[]>([]);
  const [adminLogs, setAdminLogs] = useState<SystemLog[]>([]);
  const [adminLearningEvents, setAdminLearningEvents] = useState<LearningEventRecord[]>([]);
  const [studentLearningEvents, setStudentLearningEvents] = useState<LearningEventRecord[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'parent' | 'student'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // New Admin Course & Exam Management States
  const [adminWorkspaceTab, setAdminWorkspaceTab] = useState<AdminWorkspaceTabId>('overview');
  const [adminActiveTab, setAdminActiveTab] = useState<'math' | 'sat' | 'ielts' | 'cae' | 'cpe'>('math');
  const [contentReviewFilter, setContentReviewFilter] = useState<ContentReviewFilter>('all');
  const [mathLessons, setMathLessons] = useState<MathLesson[]>([
    // Algebra Components
    { id: 'math-alg-01', title: 'Căn bậc hai và Căn bậc ba nâng cao', topic: 'Đại số (Algebra)', count: 45, status: 'Active' },
    { id: 'math-alg-02', title: 'Rút gọn biểu thức chứa căn thức bậc hai', topic: 'Đại số (Algebra)', count: 55, status: 'Active' },
    { id: 'math-alg-03', title: 'Hàm số và đồ thị y = ax^2', topic: 'Đại số (Algebra)', count: 40, status: 'Active' },
    { id: 'math-alg-04', title: 'Hệ phương trình bậc nhất hai ẩn chứa tham số m', topic: 'Đại số (Algebra)', count: 35, status: 'Active' },
    { id: 'math-alg-05', title: 'Phương trình bậc hai & Định lý Vi-ét cực trị', topic: 'Đại số (Algebra)', count: 50, status: 'Active' },
    // Geometry Components
    { id: 'math-geo-01', title: 'Hệ thức lượng trong tam giác vuông', topic: 'Hình học (Geometry)', count: 30, status: 'Active' },
    { id: 'math-geo-02', title: 'Đường tròn và Cát tuyến nâng cao', topic: 'Hình học (Geometry)', count: 45, status: 'Active' },
    { id: 'math-geo-03', title: 'Tứ giác nội tiếp đường tròn & Chứng minh thẳng hàng', topic: 'Hình học (Geometry)', count: 55, status: 'Active' },
    { id: 'math-geo-04', title: 'Hình trụ - Hình nón - Hình cầu ứng dụng thực tế', topic: 'Hình học (Geometry)', count: 35, status: 'Active' },
    // Mock Tests
    { id: 'math-test-01', title: 'Đề Đánh giá Năng lực Giữa kỳ II - Toán 9', topic: 'Thi thử (Mock)', count: 40, status: 'Active' },
    { id: 'math-test-02', title: 'Đề Đánh giá Năng lực Học kỳ II - Toán 9', topic: 'Thi thử (Mock)', count: 40, status: 'Active' },
    { id: 'math-test-03', title: 'Đề khảo sát lớp 9 vào lớp 10 chuyên (Đề 1)', topic: 'Thi thử (Mock)', count: 40, status: 'Active' }
  ]);
  const [mathCasioTips, setMathCasioTips] = useState([
    { id: 'tip-1', title: 'Bấm máy tìm nhanh nghiệm phương trình bậc 2/3', syntax: '[MODE] [5] [3]', explanation: 'Giúp học sinh kiểm tra nhanh kết quả nghiệm rút gọn.' },
    { id: 'tip-2', title: 'Tìm cực trị parabol bằng phím đỉnh x/y', syntax: '[SHIFT] [SOLVE]', explanation: 'Giải nhanh giá trị lớn nhất/nhỏ nhất đại số lớp 9.' }
  ]);
  const [newCasioTitle, setNewCasioTitle] = useState('');
  const [newCasioSyntax, setNewCasioSyntax] = useState('');
  const [newCasioExpl, setNewCasioExpl] = useState('');

  const [satIrtAlpha, setSatIrtAlpha] = useState(0.05);
  const [satDiagnosticThreshold, setSatDiagnosticThreshold] = useState(1200);
  const [isIrtCalibrating, setIsIrtCalibrating] = useState(false);

  const [importedExams, setImportedExams] = useState<ImportedExam[]>(() => mergeImportedExamState([
    // SAT Component Tests
    { id: 'sat-rw-01', title: 'SAT RW Diagnostic: Information & Ideas', exam: 'SAT', questions: 33, duration: 32, status: 'Active' },
    { id: 'sat-rw-02', title: 'SAT RW Section Test: Craft & Structure', exam: 'SAT', questions: 33, duration: 32, status: 'Active' },
    { id: 'sat-rw-03', title: 'SAT RW Practice: Expression of Ideas', exam: 'SAT', questions: 33, duration: 32, status: 'Active' },
    { id: 'sat-m-01', title: 'SAT Math Diagnostic: Algebra & Geometry', exam: 'SAT', questions: 22, duration: 35, status: 'Active' },
    { id: 'sat-m-02', title: 'SAT Math Section Test: Advanced Math', exam: 'SAT', questions: 22, duration: 35, status: 'Active' },
    { id: 'sat-full-01', title: 'SAT Full-Length Adaptive Practice Test 1', exam: 'SAT', questions: 88, duration: 134, status: 'Active' },
    { id: 'sat-full-02', title: 'SAT Full-Length Diagnostic Test', exam: 'SAT', questions: 88, duration: 134, status: 'Active' },

    // IELTS Component Tests
    { id: 'ielts-read-01', title: 'IELTS Reading: Passage 1 - Golden Ratio', exam: 'IELTS', questions: 13, duration: 20, status: 'Active' },
    { id: 'ielts-read-02', title: 'IELTS Reading: Passage 2 - Marine Ecosystems', exam: 'IELTS', questions: 13, duration: 20, status: 'Active' },
    { id: 'ielts-read-03', title: 'IELTS Reading: Passage 3 - AI in Medicine', exam: 'IELTS', questions: 14, duration: 20, status: 'Active' },
    { id: 'ielts-list-01', title: 'IELTS Listening: Section 1 - Hotel Reservation', exam: 'IELTS', questions: 10, duration: 10, status: 'Active' },
    { id: 'ielts-list-02', title: 'IELTS Listening: Section 3 - Campus Map Tour', exam: 'IELTS', questions: 10, duration: 10, status: 'Active' },
    { id: 'ielts-write-01', title: 'IELTS Writing: Task 2 Essay Grader', exam: 'IELTS', questions: 1, duration: 40, status: 'Active' },
    { id: 'ielts-speak-01', title: 'IELTS Speaking: Parts 1 & 2 Evaluator', exam: 'IELTS', questions: 3, duration: 15, status: 'Active' },
    { id: 'ielts-mock-01', title: 'IELTS Academic Full Practice Test 1', exam: 'IELTS', questions: 80, duration: 165, status: 'Active' },

    // CAE Component Tests
    { id: 'cae-uoe-01', title: 'CAE Use of English Part 1: Multiple-Choice Cloze', exam: 'CAE', questions: 8, duration: 10, status: 'Active' },
    { id: 'cae-uoe-02', title: 'CAE Use of English Part 2: Open Cloze', exam: 'CAE', questions: 8, duration: 10, status: 'Active' },
    { id: 'cae-uoe-03', title: 'CAE Use of English Part 3: Word Formation', exam: 'CAE', questions: 8, duration: 10, status: 'Active' },
    { id: 'cae-uoe-04', title: 'CAE Use of English Part 4: Key Word Transformation', exam: 'CAE', questions: 6, duration: 12, status: 'Active' },
    { id: 'cae-read-01', title: 'CAE Reading Part 5: Multiple Choice', exam: 'CAE', questions: 6, duration: 15, status: 'Active' },
    { id: 'cae-list-01', title: 'CAE Listening Part 1: Multiple Choice', exam: 'CAE', questions: 6, duration: 15, status: 'Active' },
    { id: 'cae-mock-01', title: 'CAE Cambridge C1 Diagnostic Mock Test 1', exam: 'CAE', questions: 38, duration: 50, status: 'Active' },
    { id: 'cae-mock-02', title: 'CAE Cambridge C1 Entry Level Test 2', exam: 'CAE', questions: 38, duration: 50, status: 'Active' },

    // CPE Component Tests
    { id: 'cpe-uoe-01', title: 'CPE Use of English Part 1: Multiple-Choice Cloze', exam: 'CPE', questions: 8, duration: 10, status: 'Active' },
    { id: 'cpe-uoe-02', title: 'CPE Use of English Part 2: Open Cloze', exam: 'CPE', questions: 8, duration: 10, status: 'Active' },
    { id: 'cpe-uoe-03', title: 'CPE Use of English Part 3: Word Formation', exam: 'CPE', questions: 8, duration: 10, status: 'Active' },
    { id: 'cpe-uoe-04', title: 'CPE Use of English Part 4: Key Word Transformation', exam: 'CPE', questions: 6, duration: 12, status: 'Active' },
    { id: 'cpe-read-01', title: 'CPE Reading Part 5: Multiple Choice', exam: 'CPE', questions: 6, duration: 15, status: 'Active' },
    { id: 'cpe-read-02', title: 'CPE Reading Part 6: Gapped Text', exam: 'CPE', questions: 7, duration: 15, status: 'Active' },
    { id: 'cpe-mock-01', title: 'CPE Cambridge C2 Entry Practice Test 1', exam: 'CPE', questions: 35, duration: 45, status: 'Active' },
    { id: 'cpe-mock-02', title: 'CPE Cambridge C2 Book 3 Practice Test 2', exam: 'CPE', questions: 35, duration: 45, status: 'Active' },
    { id: 'cpe-mock-03', title: 'CPE Cambridge C2 Entry Practice Test 3', exam: 'CPE', questions: 35, duration: 45, status: 'Active' }
  ], loadPersistedImportedExams(localStorage)));
  const [selectedContentExamId, setSelectedContentExamId] = useState<string | null>(null);
  const [contentExamDraft, setContentExamDraft] = useState<ImportedExam | null>(null);
  const [examJsonInput, setExamJsonInput] = useState('');
  const [examImportError, setExamImportError] = useState<string | null>(null);
  const [examImportSuccess, setExamImportSuccess] = useState<string | null>(null);

  // Stats & CLI / Detail Drawer States
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<LocalUser | null>(null);
  const [terminalCommand, setTerminalCommand] = useState('');

  // Form states for creating new content
  const [newMathId, setNewMathId] = useState('');
  const [newMathTitle, setNewMathTitle] = useState('');
  const [newMathTopic, setNewMathTopic] = useState('Đại số (Algebra)');
  const [newMathCount, setNewMathCount] = useState(40);

  const [newExamId, setNewExamId] = useState('');
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamQuestions, setNewExamQuestions] = useState(40);
  const [newExamDuration, setNewExamDuration] = useState(60);

  // Phase 4: Advanced Multi-Role Optimizations States
  const [unlockedMascotItems, setUnlockedMascotItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('miuprep_unlocked_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [equippedMascotItem, setEquippedMascotItem] = useState<string>(() => {
    return localStorage.getItem('miuprep_equipped_item') || '';
  });
  const [showDesmos, setShowDesmos] = useState<boolean>(false);
  const [showErrorNotebook, setShowErrorNotebook] = useState<boolean>(false);

  // Spaced-repetition Leitner Questions Notebook
  const [errorQuestions, setErrorQuestions] = useState<ErrorNotebookQuestion[]>(DEFAULT_ERROR_NOTEBOOK_QUESTIONS);

  // Visual LaTeX Creator States
  const [latexMathId, setLatexMathId] = useState('');
  const [latexMathTitle, setLatexMathTitle] = useState('');
  const [latexMathEq, setLatexMathEq] = useState('');
  const [latexMathAns, setLatexMathAns] = useState('A');
  const [latexMathExpl, setLatexMathExpl] = useState('');

  // ==========================================
  // Phase 5: SAT Adaptive Workspace States & Handlers
  // ==========================================
  const [activeStudentTab, setActiveStudentTab] = useState<'dashboard' | 'sat-board'>('dashboard');
  const [studentWorkspaceTab, setStudentWorkspaceTab] = useState<StudentWorkspaceTabId>('overview');
  const [selectedSatBank, setSelectedSatBank] = useState<string>('sat-1590-elite-ai-bank.json');
  const [loadedQuestions, setLoadedQuestions] = useState<SatQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [satTaxonomy, setSatTaxonomy] = useState<SatTaxonomy | null>(null);
  const [satEstimatedScore, setSatEstimatedScore] = useState<number>(1280);
  const [satTargetScore] = useState<number>(1450);
  const [activePracticeState, setActivePracticeState] = useState<SatPracticeState | null>(null);
  const [templatePracticeState, setTemplatePracticeState] = useState<TemplatePracticeState | null>(null);
  const [englishItemBankPracticeState, setEnglishItemBankPracticeState] = useState<EnglishItemBankPracticeState | null>(null);

  // Admin SAT Explorer States
  const [adminSatSubTab, setAdminSatSubTab] = useState<'explorer' | 'integrity' | 'calibration'>('explorer');
  const [adminSelectedSatBank, setAdminSelectedSatBank] = useState<string>('sat-1590-elite-ai-bank.json');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminSelectedDomain, setAdminSelectedDomain] = useState<string>('all');
  const [, setAdminSelectedSkill] = useState<string>('all');
  const [adminCurrentPage, setAdminCurrentPage] = useState<number>(1);
  const [adminActiveQuestionDetail, setAdminActiveQuestionDetail] = useState<AdminSatQuestion | null>(null);

  // Fetch SAT Taxonomy on mount
  useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        const res = await fetch('/data/canonical-sat-taxonomy.json');
        if (res.ok) {
          const data = await res.json();
          if (data) setSatTaxonomy(data);
        }
      } catch (e) {
        console.error("Lỗi nạp taxonomy", e);
      }
    };
    loadTaxonomy();
  }, []);

  // Fetch SAT Questions when active bank changes or student enters SAT board
  useEffect(() => {
    if (activeStudentTab === 'sat-board' || currentUser?.role === 'admin') {
      const targetBank = currentUser?.role === 'admin' ? adminSelectedSatBank : selectedSatBank;
      fetchQuestions(targetBank);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchQuestions chỉ phụ thuộc bank truyền vào; thêm nó vào deps sẽ gây refetch lặp. Sẽ chuyển sang useCallback khi tách App.tsx (task 2.2.3)
  }, [selectedSatBank, adminSelectedSatBank, activeStudentTab, currentUser]);

  const fetchQuestions = async (bank: string) => {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch(`/data/${bank}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      const qList: SatQuestion[] = Array.isArray(data) ? data : (data.questions || []);
      setLoadedQuestions(qList);
      logSystemEvent('INFO', `Đã nạp ${qList.length} câu hỏi SAT thành công từ ${bank}`);
    } catch (e) {
      console.error("Lỗi fetch SAT Questions", e);
      showNotif(t('notif_load_bank_failed', { bank }), "error");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleStartPractice = (domain: string, skill: string) => {
    setTemplatePracticeState(null);
    setEnglishItemBankPracticeState(null);
    const nextPracticeState = createSatPracticeState(loadedQuestions, domain, skill, selectedSatBank);

    if (!nextPracticeState) {
      showNotif(t('notif_no_skill_questions', { skill }), "info");
      return;
    }

    setActivePracticeState(nextPracticeState);

    showNotif(t('notif_start_adaptive', { count: nextPracticeState.questions.length }), "success");
  };

  const handleAnswerSatQuestion = (choice: string) => {
    if (!activePracticeState) return;
    const { currentQuestion, isCorrect, nextState } = answerSatQuestion(activePracticeState, choice);
    if (currentUser?.role === 'student') {
      void saveStudentLearningEvent(buildSatPracticeLearningEvent(currentUser, currentQuestion, activePracticeState, choice, isCorrect));
    }

    if (isCorrect) {
      setFishCoins(prev => {
        const nextCoins = prev + 10;
        if (currentUser?.username) {
          persistCoinBalance(localStorage, currentUser.username, nextCoins);
        }
        return nextCoins;
      });
      
      setSatEstimatedScore(prev => Math.min(1600, prev + 15));
      showNotif(t('notif_answer_correct_10'), "success");
    } else {
      const newErr = createSatErrorQuestion(currentQuestion);
      
      setErrorQuestions(prev => {
        if (prev.some(q => q.text.includes(currentQuestion.prompt.slice(0, 30)))) return prev;
        return [newErr, ...prev];
      });

      const nextTraps = mouseTrapsCount + 1;
      setMouseTrapsCount(nextTraps);
      if (currentUser?.username) {
        persistTrapCount(localStorage, currentUser.username, nextTraps);
      }

      setSatEstimatedScore(prev => Math.max(400, prev - 10));
      showNotif(t('notif_answer_wrong_explain'), "error");
    }

    setActivePracticeState(nextState);
  };

  const startLessonTemplatePractice = async (
    template: LessonTemplateActionTemplate,
    domainId: 'mathematics' | 'english_core',
    programId: string,
    sourceSurface: 'math_lesson_template_panel' | 'english_core_lesson_template_panel',
  ) => {
    const { createTemplatePracticeState } = await loadTemplatePracticeModule();
    const nextState = createTemplatePracticeState({ template, domainId, programId, sourceSurface });
    if (!nextState) {
      showNotif(t('notif_template_no_scorable'), "info");
      return;
    }
    setActivePracticeState(null);
    setEnglishItemBankPracticeState(null);
    setTemplatePracticeState(nextState);
    setShowErrorNotebook(false);
    showNotif(t('notif_start_scored', { count: nextState.questions.length, title: template.title }), "success");
  };

  const startEnglishItemBankPractice = async (
    template: LessonTemplateActionTemplate,
    programId: 'ielts' | 'cae' | 'cpe',
  ): Promise<boolean> => {
    const { createEnglishItemBankPracticeState } = await loadEnglishItemBankPracticeModule();
    const attemptedItemIds = getAttemptedEnglishItemIds(programId);
    const nextState = await createEnglishItemBankPracticeState({
      template,
      programId,
      attemptedItemIds,
      limit: 6,
    });

    if (!nextState) {
      showNotif(t('notif_no_itembank_ready', { program: programId.toUpperCase() }), "info");
      return false;
    }

    setActivePracticeState(null);
    setTemplatePracticeState(null);
    setEnglishItemBankPracticeState(nextState);
    setShowErrorNotebook(false);
    showNotif(t('notif_start_itembank', { program: programId.toUpperCase(), count: nextState.questions.length }), "success");
    return true;
  };

  const getAttemptedEnglishItemIds = (programId: string): string[] => {
    if (!currentUser?.username) return [];
    const username = currentUser.username.toLowerCase();
    return studentLearningEvents
      .filter((event) => String(event.learnerId || '').toLowerCase() === username)
      .filter((event) => event.type === 'practice_attempt')
      .filter((event) => String(event.payload?.programId || '').toLowerCase() === programId)
      .map((event) => String(event.payload?.itemId || ''))
      .filter(Boolean);
  };

  const handleNextSatQuestion = () => {
    if (!activePracticeState) return;
    const { completed, finalScore, totalQuestions, nextState } = advanceSatPractice(activePracticeState);

    if (completed) {
      showNotif(t('notif_sat_complete', { score: finalScore, total: totalQuestions }), "success");
    }

    setActivePracticeState(nextState);
  };

  const handleAnswerTemplatePractice = async (choice: TemplatePracticeChoiceKey) => {
    if (!templatePracticeState) return;
    const { answerTemplatePracticeQuestion } = await loadTemplatePracticeModule();
    const { currentQuestion, isCorrect, nextState } = answerTemplatePracticeQuestion(templatePracticeState, choice);
    if (currentUser?.role === 'student') {
      const selectedMove = currentQuestion.choices.find((item) => item.key === choice)?.text || '';
      void saveStudentLearningEvent(buildTemplatePracticeAttemptLearningEvent({
        username: currentUser.username,
        programId: templatePracticeState.programId,
        domainId: templatePracticeState.domainId,
        itemId: currentQuestion.id,
        itemPrompt: currentQuestion.prompt,
        templateId: templatePracticeState.templateId,
        templateTitle: templatePracticeState.templateTitle,
        stageId: currentQuestion.stageId,
        stageTitle: currentQuestion.stageTitle,
        conceptIds: templatePracticeState.conceptIds,
        skillIds: templatePracticeState.skillIds,
        selectedAnswer: choice,
        selectedMove,
        correctAnswer: currentQuestion.correctAnswer,
        correctMove: currentQuestion.expectedMove,
        correct: isCorrect,
        difficulty: currentQuestion.difficulty,
        questionIndex: templatePracticeState.currentIndex,
        sourceSurface: templatePracticeState.sourceSurface,
      }));
    }

    if (isCorrect) {
      setFishCoins(prev => {
        const nextCoins = prev + 5;
        if (currentUser?.username) {
          persistCoinBalance(localStorage, currentUser.username, nextCoins);
        }
        return nextCoins;
      });
      showNotif(t('notif_learning_move_correct'), "success");
    } else {
      const newErr = createTemplatePracticeErrorQuestion(currentQuestion, templatePracticeState);
      setErrorQuestions(prev => {
        if (prev.some(q => q.id === newErr.id || q.text === newErr.text)) return prev;
        return [newErr, ...prev];
      });
      const nextTraps = mouseTrapsCount + 1;
      setMouseTrapsCount(nextTraps);
      if (currentUser?.username) {
        persistTrapCount(localStorage, currentUser.username, nextTraps);
      }
      showNotif(t('notif_learning_move_wrong'), "error");
    }

    setTemplatePracticeState(nextState);
  };

  const handleNextTemplatePractice = async () => {
    if (!templatePracticeState) return;
    const { advanceTemplatePractice } = await loadTemplatePracticeModule();
    const { completed, finalScore, totalQuestions, nextState } = advanceTemplatePractice(templatePracticeState);
    if (completed) {
      showNotif(t('notif_scored_complete', { score: finalScore, total: totalQuestions }), "success");
    }
    setTemplatePracticeState(nextState);
  };

  const createTemplatePracticeErrorQuestion = (
    question: TemplatePracticeQuestion,
    state: TemplatePracticeState,
  ): ErrorNotebookQuestion => ({
    id: `err-template-${state.templateId}-${state.currentIndex}-${Date.now()}`,
    text: `${state.templateTitle}: ${question.prompt}`,
    stage: 1,
    answer: question.correctAnswer,
    options: question.choices.map((choice) => choice.key),
    answerExpl: `Expected move: ${question.expectedMove}`,
    domainId: state.domainId,
    programId: state.programId,
    conceptIds: state.conceptIds,
    skillIds: state.skillIds,
    errorType: state.domainId === 'english_core' ? 'knowledge' : 'calculation',
    rootCause: 'Template practice move was selected incorrectly.',
    missedStep: question.expectedMove,
    repairLessonId: state.templateId,
    repairLessonTitle: state.templateTitle,
    retryAttempts: 0,
    correctRetryCount: 0,
  });

  const handleAnswerEnglishItemBankPractice = async (choice: EnglishItemBankPracticeChoiceKey) => {
    if (!englishItemBankPracticeState) return;
    const { answerEnglishItemBankPracticeQuestion } = await loadEnglishItemBankPracticeModule();
    const { currentQuestion, isCorrect, nextState } = answerEnglishItemBankPracticeQuestion(englishItemBankPracticeState, choice);
    const selectedChoice = currentQuestion.choices.find((item) => item.key === choice);

    if (currentUser?.role === 'student') {
      void saveStudentLearningEvent(buildEnglishItemBankPracticeAttemptLearningEvent({
        username: currentUser.username,
        programId: englishItemBankPracticeState.programId,
        itemId: currentQuestion.id,
        sourceId: currentQuestion.sourceId,
        source: currentQuestion.source,
        itemPrompt: currentQuestion.prompt,
        conceptIds: currentQuestion.conceptIds,
        skillIds: currentQuestion.skillIds,
        misconceptionIds: currentQuestion.misconceptionIds,
        selectedAnswer: choice,
        selectedValue: selectedChoice?.sourceValue || selectedChoice?.text || '',
        correctAnswer: currentQuestion.correctAnswer,
        correctValue: currentQuestion.correctValue,
        correct: isCorrect,
        difficulty: currentQuestion.difficulty,
        cognitiveLevel: currentQuestion.cognitiveLevel,
        questionType: currentQuestion.type,
        questionIndex: englishItemBankPracticeState.currentIndex,
        templateId: englishItemBankPracticeState.templateId,
        templateTitle: englishItemBankPracticeState.templateTitle,
        metadata: currentQuestion.metadata,
      }));
    }

    if (isCorrect) {
      setFishCoins(prev => {
        const nextCoins = prev + 8;
        if (currentUser?.username) {
          persistCoinBalance(localStorage, currentUser.username, nextCoins);
        }
        return nextCoins;
      });
      showNotif(t('notif_itembank_correct'), "success");
    } else {
      const newErr = createEnglishItemBankPracticeErrorQuestion(currentQuestion, englishItemBankPracticeState);
      setErrorQuestions(prev => {
        if (prev.some(q => q.id === newErr.id || q.text === newErr.text)) return prev;
        return [newErr, ...prev];
      });
      const nextTraps = mouseTrapsCount + 1;
      setMouseTrapsCount(nextTraps);
      if (currentUser?.username) {
        persistTrapCount(localStorage, currentUser.username, nextTraps);
      }
      showNotif(t('notif_itembank_wrong'), "error");
    }

    setEnglishItemBankPracticeState(nextState);
  };

  const handleNextEnglishItemBankPractice = async () => {
    if (!englishItemBankPracticeState) return;
    const { advanceEnglishItemBankPractice } = await loadEnglishItemBankPracticeModule();
    const { completed, finalScore, totalQuestions, nextState } = advanceEnglishItemBankPractice(englishItemBankPracticeState);
    if (completed) {
      showNotif(t('notif_itembank_complete', { score: finalScore, total: totalQuestions }), "success");
    }
    setEnglishItemBankPracticeState(nextState);
  };

  const createEnglishItemBankPracticeErrorQuestion = (
    question: EnglishItemBankPracticeQuestion,
    state: EnglishItemBankPracticeState,
  ): ErrorNotebookQuestion => ({
    id: `err-english-bank-${question.id}-${Date.now()}`,
    text: `${state.programId.toUpperCase()} item-bank: ${question.prompt}`,
    stage: 1,
    answer: question.correctAnswer,
    options: question.choices.map((item) => item.key),
    answerExpl: `Correct value: ${question.correctValue}. ${question.explanation}`,
    domainId: 'english_core',
    programId: state.programId,
    conceptIds: question.conceptIds,
    skillIds: question.skillIds,
    errorType: question.type.includes('listening') ? 'time_strategy' : 'reading_prompt',
    rootCause: 'Item-bank answer did not match the source-keyed answer.',
    missedStep: `Review ${question.type} evidence and source answer ${question.correctValue}.`,
    repairLessonId: state.templateId,
    repairLessonTitle: state.templateTitle,
    retryAttempts: 0,
    correctRetryCount: 0,
  });


  // New Admin Course & Exam Handlers
  const handleAddCasioTip = (e: React.FormEvent) => {
    e.preventDefault();
    const newTip = createCasioTip({
      title: newCasioTitle,
      syntax: newCasioSyntax,
      explanation: newCasioExpl,
    });

    if (!newTip) {
      showNotif(t('notif_fill_title_syntax'), "error");
      return;
    }

    setMathCasioTips([...mathCasioTips, newTip]);
    setNewCasioTitle('');
    setNewCasioSyntax('');
    setNewCasioExpl('');
    logSystemEvent('INFO', `Admin @${currentUser?.username} đã thêm mới Casio Tip: "${newTip.title}"`);
    showNotif(t('notif_casio_added'), "success");
  };

  const handleTriggerIrtCalibration = () => {
    setIsIrtCalibrating(true);
    logSystemEvent('INFO', `Admin @${currentUser?.username} kích hoạt tiến trình Hiệu chuẩn tham số câu hỏi IRT`);
    setTimeout(() => {
      setIsIrtCalibrating(false);
      logSystemEvent('INFO', `Hiệu chuẩn 3PL-IRT hoàn tất: Calibrated 970 câu hỏi, Learning Rate = ${satIrtAlpha}`);
      showNotif(t('notif_irt_done'), "success");
    }, 2000);
  };

  const handleImportJsonExam = async (trackId: EnglishExamTrack) => {
    setExamImportError(null);
    setExamImportSuccess(null);

    const result = await importExamFromJson(examJsonInput, trackId);

    if (!result.ok) {
      setExamImportError(result.error);
      return;
    }

    const editableExam: ImportedExam = {
      ...result.exam,
      editableSections: createEditableExamSectionsFromJson(examJsonInput),
      reviewStatus: result.exam.standardStatus === 'needs_review' ? 'needs_fix' : 'unchecked',
      sourceJson: examJsonInput,
    };

    setImportedExams((items) => {
      const nextExams = [editableExam, ...items.filter((item) => item.id !== editableExam.id)];
      savePersistedImportedExams(localStorage, nextExams);
      return nextExams;
    });
    setExamJsonInput('');
    setExamImportSuccess(result.successMessage);
    logSystemEvent('INFO', `Admin @${currentUser?.username} nhập thành công đề thi JSON: "${result.exam.title}"`);
    showNotif(t('notif_import_exam_ok', { exam: result.exam.exam }), "success");
  };

  const handleLoadDemoExam = (trackId: EnglishExamTrack) => {
    const demo = createDemoExam(trackId);
    setExamJsonInput(JSON.stringify(demo, null, 2));
    showNotif(t('notif_sample_loaded', { track: trackId.toUpperCase() }), "info");
  };

  const handleAdjustCoins = (username: string, amount: number) => {
    const progressSnapshot = loadStudentProgressSnapshot(localStorage, username);
    const newCoins = Math.max(0, progressSnapshot.coins + amount);
    persistCoinBalance(localStorage, username, newCoins);
    logSystemEvent('WARN', `Admin @${currentUser?.username} đã điều chỉnh Salmon Coins cho @${username}: ${amount > 0 ? '+' : ''}${amount} xu. Số dư mới: ${newCoins}`);
    showNotif(t('notif_coins_adjusted', { username }), "success");
    refreshAdminData();
    
    // Auto-update details if active
    if (selectedUserForDetail && selectedUserForDetail.username === username) {
      setSelectedUserForDetail({ ...selectedUserForDetail });
    }
  };

  const handleUpdateUserTracks = async (username: string, tracks: ('math' | 'sat' | 'ielts' | 'cae' | 'cpe')[]) => {
    try {
      const u = await db.getLocalUser(username);
      if (!u) return;
      const updated = {
        ...u,
        assignedTracks: tracks,
        assignedTrack: tracks[0] || 'math'
      };
      await db.registerLocalUser(updated);
      logSystemEvent('WARN', `Admin @${currentUser?.username} đã thay đổi phân quyền khoá học cho @${username}: [${tracks.join(', ')}]`);
      showNotif(t('notif_course_perm_updated'), "success");
      refreshAdminData();
      if (selectedUserForDetail && selectedUserForDetail.username === username) {
        setSelectedUserForDetail(updated);
      }
    } catch {
      showNotif(t('notif_perm_update_failed'), "error");
    }
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;
    const cmd = terminalCommand.trim();
    setTerminalCommand('');
    
    await logSystemEvent('INFO', `Admin CLI: ${cmd}`);

    const parts = cmd.split(' ');
    const primary = parts[0].toLowerCase();

    if (primary === '/help') {
      await logSystemEvent('INFO', 'Lệnh hỗ trợ Admin: /seed (Tái tạo dữ liệu), /clear-logs (Xóa logs), /approve-all (Duyệt tất cả tài khoản), /coins @username [lượng] (Tặng xu)');
      showNotif(t('notif_help_printed'), "info");
    } else if (primary === '/clear-logs') {
      localStorage.removeItem('ielts_app_logs_list');
      setAdminLogs([]);
      showNotif(t('notif_logs_cleared'), "success");
    } else if (primary === '/approve-all') {
      const list = await db.listLocalUsers();
      for (const u of list) {
        if (u.status === 'pending') {
          const fullU = await db.getLocalUser(u.username);
          if (fullU) {
            fullU.status = 'approved';
            await db.registerLocalUser(fullU);
          }
        }
      }
      await logSystemEvent('WARN', 'Admin đã phê duyệt toàn bộ tài khoản đang chờ duyệt thông qua lệnh CLI');
      showNotif(t('notif_all_approved'), "success");
      await refreshAdminData();
    } else if (primary === '/seed') {
      await handleAddDefaultLogs();
    } else if (primary === '/coins' && parts.length >= 3) {
      const targetUser = parts[1].replace('@', '').toLowerCase();
      const amt = parseInt(parts[2]);
      if (!isNaN(amt)) {
        handleAdjustCoins(targetUser, amt);
      } else {
        await logSystemEvent('ERROR', 'Lỗi CLI: Lượng xu không hợp lệ');
      }
    } else {
      await logSystemEvent('ERROR', `Lỗi CLI: Lệnh "${cmd}" không tồn tại. Gõ /help để xem trợ giúp.`);
    }
  };

  const handleAddMathLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const newLesson = createMathLesson({
      id: newMathId,
      title: newMathTitle,
      topic: newMathTopic,
      count: newMathCount,
    });

    if (!newLesson) {
      showNotif(t('notif_enter_topic'), "error");
      return;
    }

    setMathLessons([...mathLessons, newLesson]);
    setNewMathId('');
    setNewMathTitle('');
    setNewMathTopic('Đại số (Algebra)');
    setNewMathCount(40);
    logSystemEvent('INFO', `Admin @${currentUser?.username} đã thêm chuyên đề Toán mới: "${newLesson.title}"`);
    showNotif(t('notif_math_topic_added'), "success");
  };

  const handleAddEnglishExam = (trackId: EnglishExamTrack) => {
    const newExam = createEnglishExam(trackId, {
      id: newExamId,
      title: newExamTitle,
      questions: newExamQuestions,
      duration: newExamDuration,
    });

    if (!newExam) {
      showNotif(t('notif_enter_exam_name'), "error");
      return;
    }

    setImportedExams((items) => {
      const nextExams = [newExam, ...items.filter((item) => item.id !== newExam.id)];
      savePersistedImportedExams(localStorage, nextExams);
      return nextExams;
    });
    setNewExamId('');
    setNewExamTitle('');
    setNewExamQuestions(40);
    setNewExamDuration(60);
    logSystemEvent('INFO', `Admin @${currentUser?.username} đã tạo đề thi ${trackId.toUpperCase()} mới: "${newExam.title}"`);
    showNotif(t('notif_create_exam_ok', { track: trackId.toUpperCase() }), "success");
  };

  const handleOpenContentExam = (exam: ImportedExam) => {
    const editableExam: ImportedExam = {
      ...exam,
      editableSections: ensureEditableExamSections(exam),
      reviewStatus: exam.reviewStatus || 'unchecked',
    };
    setSelectedContentExamId(exam.id);
    setContentExamDraft(editableExam);
  };

  const handleCloseContentExam = () => {
    setSelectedContentExamId(null);
    setContentExamDraft(null);
  };

  const updateContentExamDraft = (patch: Partial<ImportedExam>) => {
    setContentExamDraft((draft) => (draft ? { ...draft, ...patch } : draft));
  };

  const updateContentExamSection = (sectionIndex: number, patch: Partial<EditableExamSection>) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) => (index === sectionIndex ? { ...section, ...patch } : section));
      return { ...draft, editableSections: sections };
    });
  };

  const updateContentExamQuestion = (
    sectionIndex: number,
    questionIndex: number,
    patch: Partial<EditableExamSection['questions'][number]>,
  ) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) => {
        if (index !== sectionIndex) return section;
        const questions = section.questions.map((question, qIndex) => (qIndex === questionIndex ? { ...question, ...patch } : question));
        return { ...section, questions };
      });
      return { ...draft, editableSections: sections };
    });
  };

  const handleAddContentSection = () => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft);
      return {
        ...draft,
        editableSections: [
          ...sections,
          {
            id: `${draft.id}-section-${sections.length + 1}`,
            title: `Section ${sections.length + 1}`,
            questions: [],
          },
        ],
      };
    });
  };

  const handleAddContentQuestion = (sectionIndex: number) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) => {
        if (index !== sectionIndex) return section;
        const nextIndex = section.questions.length + 1;
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `${section.id}-q${nextIndex}`,
              text: `Question ${nextIndex}`,
              answer: '',
            },
          ],
        };
      });
      return { ...draft, editableSections: sections };
    });
  };

  const handleRemoveContentQuestion = (sectionIndex: number, questionIndex: number) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) => {
        if (index !== sectionIndex) return section;
        return { ...section, questions: section.questions.filter((_, qIndex) => qIndex !== questionIndex) };
      });
      return { ...draft, editableSections: sections };
    });
  };

  const handleSaveContentExamDraft = (reviewStatus: ImportedExam['reviewStatus'] = contentExamDraft?.reviewStatus || 'unchecked') => {
    if (!contentExamDraft) return;
    const editableSections = ensureEditableExamSections(contentExamDraft);
    const editedQuestionCount = countEditableExamQuestions(editableSections);
    const savedExam: ImportedExam = {
      ...contentExamDraft,
      title: contentExamDraft.title.trim() || contentExamDraft.title,
      duration: Math.max(1, Number(contentExamDraft.duration) || 1),
      questions: editedQuestionCount || Math.max(1, Number(contentExamDraft.questions) || 1),
      editableSections,
      reviewStatus,
      reviewer: currentUser?.username,
      reviewedAt: new Date().toISOString(),
    };
    setImportedExams((items) => {
      const nextExams = items.map((item) => (item.id === savedExam.id ? savedExam : item));
      savePersistedImportedExams(localStorage, nextExams);
      return nextExams;
    });
    setContentExamDraft(savedExam);
    logSystemEvent('WARN', `Admin @${currentUser?.username} saved content exam ${savedExam.exam}: "${savedExam.title}" [${reviewStatus}]`);
    showNotif(t('notif_save_exam_ok', { exam: savedExam.exam }), "success");
  };

  const handleExportContentExamChangeSet = () => {
    if (!contentExamDraft) {
      showNotif('No open content exam to export.', 'error');
      return;
    }
    const previousExam = importedExams.find((item) => item.id === contentExamDraft.id) || null;
    const changeSet: ContentExamChangeSet = buildContentExamChangeSet(contentExamDraft, {
      previousExam,
      reviewer: currentUser?.username || 'admincontent',
    });
    downloadJsonFile(`miuprep-${contentExamDraft.exam.toLowerCase()}-${safeFilePart(contentExamDraft.id)}-changeset.json`, changeSet);
    logSystemEvent('INFO', `Admin @${currentUser?.username} exported content change set ${contentExamDraft.exam}: "${contentExamDraft.title}"`);
    showNotif(t('notif_exported_changeset', { exam: contentExamDraft.exam }), 'success');
  };

  const handleExportContentReviewSet = () => {
    const trackExams = importedExams.filter((exam) => exam.exam.toLowerCase() === adminActiveTab);
    if (!trackExams.length) {
      showNotif(t('notif_no_exams_export', { tab: adminActiveTab.toUpperCase() }), 'error');
      return;
    }
    const exportPayload: ContentReviewChangeSetExport = buildContentReviewChangeSetExport(trackExams, {
      track: adminActiveTab,
      reviewer: currentUser?.username || 'admincontent',
    });
    downloadJsonFile(`miuprep-${adminActiveTab}-review-changesets.json`, exportPayload);
    logSystemEvent('INFO', `Admin @${currentUser?.username} exported ${adminActiveTab.toUpperCase()} review change set (${trackExams.length} exams)`);
    showNotif(t('notif_exported_review', { tab: adminActiveTab.toUpperCase() }), 'success');
  };

  const handleBuyMascotItem = (item: string, price: number) => {
    const purchase = purchaseMascotItem(unlockedMascotItems, fishCoins, item, price);

    if (purchase.status === 'already_unlocked') {
      showNotif(t('notif_item_already_unlocked'), "info");
      return;
    }

    if (purchase.status === 'insufficient_coins') {
      showNotif(t('notif_not_enough_coins'), "error");
      return;
    }

    setFishCoins(purchase.nextCoins);
    if (currentUser?.username) {
      persistCoinBalance(localStorage, currentUser.username, purchase.nextCoins);
    }
    setUnlockedMascotItems(purchase.nextUnlockedItems);
    localStorage.setItem('miuprep_unlocked_items', JSON.stringify(purchase.nextUnlockedItems));
    logSystemEvent('INFO', `Học sinh @${currentUser?.username} đã mua vật phẩm "${item}" với giá ${price} Xu`);
    showNotif(t('notif_item_unlocked', { item }), "success");
  };

  const handleEquipMascotItem = (item: string) => {
    const nextItem = toggleMascotItem(equippedMascotItem, item);
    setEquippedMascotItem(nextItem);
    localStorage.setItem('miuprep_equipped_item', nextItem);
    logSystemEvent('INFO', `Học sinh @${currentUser?.username} đã thay đổi phụ kiện trang trí: [${nextItem || 'Trống'}]`);
    showNotif(nextItem ? `Đã diện phụ kiện ${nextItem} cho Mascot Miu! 😻` : `Đã cởi bỏ phụ kiện của Mascot Miu meow!`, "success");
  };

  const handleRetryErrorQuestion = (qId: string, choice: string, correctAns: string) => {
    const retryResult = resolveErrorRetry(errorQuestions, qId, choice, correctAns, fishCoins, mouseTrapsCount);
    const attemptedQuestion = errorQuestions.find((question) => question.id === qId);
    if (currentUser?.role === 'student' && attemptedQuestion) {
      void saveStudentLearningEvent(buildErrorRetryLearningEvent({
        username: currentUser.username,
        question: attemptedQuestion,
        selectedAnswer: choice,
        correctAnswer: correctAns,
        result: retryResult,
      }));
    }

    if (retryResult.isCorrect) {
      setErrorQuestions(retryResult.nextErrorQuestions);
      setFishCoins(retryResult.nextCoins);
      setMouseTrapsCount(retryResult.nextTrapCount);
      if (currentUser?.username) {
        persistCoinBalance(localStorage, currentUser.username, retryResult.nextCoins);
        persistTrapCount(localStorage, currentUser.username, retryResult.nextTrapCount);
      }

      logSystemEvent('INFO', `Học sinh @${currentUser?.username} đã giải đúng câu hỏi ôn tập Bẫy Chuột [${qId}], được thưởng +10 Xu`);
      showNotif(t('notif_correct_10_great'), "success");
    } else {
      showNotif(t('notif_wrong_read_explain'), "error");
    }
  };

  const handleRetryErrorQuestionV2 = (qId: string, choice: string, correctAns: string) => {
    const retryResult = resolveErrorRetry(errorQuestions, qId, choice, correctAns, fishCoins, mouseTrapsCount);
    const attemptedQuestion = errorQuestions.find((question) => question.id === qId);
    if (currentUser?.role === 'student' && attemptedQuestion) {
      void saveStudentLearningEvent(buildErrorRetryLearningEvent({
        username: currentUser.username,
        question: attemptedQuestion,
        selectedAnswer: choice,
        correctAnswer: correctAns,
        result: retryResult,
      }));
    }

    setErrorQuestions(retryResult.nextErrorQuestions);
    setMouseTrapsCount(retryResult.nextTrapCount);

    if (currentUser?.username) {
      persistTrapCount(localStorage, currentUser.username, retryResult.nextTrapCount);
    }

    if (retryResult.isCorrect) {
      setFishCoins(retryResult.nextCoins);
      if (currentUser?.username) {
        persistCoinBalance(localStorage, currentUser.username, retryResult.nextCoins);
      }
      logSystemEvent('INFO', `Student @${currentUser?.username} resolved Error Notebook V2 question [${qId}], reward +10 coins`);
      showNotif(t('notif_correct_stage_lowered'), "success");
      return;
    }

    if (retryResult.retryStatusCode === 'prerequisite') {
      showNotif(t('notif_two_fails_prereq'), "error");
      return;
    }

    showNotif(t('notif_wrong_root_cause'), "error");
  };

  const openAdminContentTrack = (track: 'math' | 'sat' | 'ielts' | 'cae' | 'cpe') => {
    setAdminActiveTab(track);
    setContentReviewFilter('all');
    setAdminWorkspaceTab('content');
    setExamJsonInput('');
    setExamImportError(null);
    setExamImportSuccess(null);
    setSelectedContentExamId(null);
    setContentExamDraft(null);
  };

  const handleCreateLatexQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newLesson = createLatexMathLesson({
      id: latexMathId,
      title: latexMathTitle,
      equation: latexMathEq,
    });

    if (!newLesson) {
      showNotif(t('notif_enter_question'), "error");
      return;
    }

    setMathLessons([...mathLessons, newLesson]);
    setLatexMathId('');
    setLatexMathTitle('');
    setLatexMathEq('');
    setLatexMathAns('A');
    setLatexMathExpl('');
    logSystemEvent('INFO', `Admin @${currentUser?.username} đã soạn câu hỏi LaTeX mới: "${newLesson.title}"`);
    showNotif(t('notif_latex_registered'), "success");
  };

  const getCirculatingCoins = () => {
    let sum = 0;
    allUsersList.forEach(u => {
      if (u.role === 'student') {
        sum += loadStudentProgressSnapshot(localStorage, u.username).coins;
      }
    });
    return sum;
  };
  
  // Global message notifications
  const [notif, setNotif] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize DB and fetch active session
  useEffect(() => {
    const initSession = async () => {
      await db.initialize();

      // Default account seeding removed: the first admin account is created through
      // the register form (first admin on a device registers freely).

      // Check current login session in localStorage
      const activeSession = localStorage.getItem('miuprep_active_username');
      if (activeSession) {
        const u = await db.getLocalUser(activeSession);
        if (u) {
          if (u.status === 'rejected') {
            localStorage.removeItem('miuprep_active_username');
            showNotif(t('notif_account_rejected_active'), "error");
          } else {
            setCurrentUser(u);
            logSystemEvent('INFO', `Tự động đăng nhập người dùng: @${u.username}`);
          }
        }
      }
    };
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once session init; t() is only used for a mount-time rejected-account toast and must not re-run on language change
  }, []);

  // Sync data based on current logged in user role
  useEffect(() => {
    if (!currentUser) return;
    
    const syncRoleData = async () => {
      if (currentUser.role === 'student') {
        const progressSnapshot = loadStudentProgressSnapshot(localStorage, currentUser.username);
        setFishCoins(progressSnapshot.coins);
        setMouseTrapsCount(progressSnapshot.traps);
        setDiaryList(progressSnapshot.diaryList);
        setStudentLearningEvents(await db.listLearningEvents(undefined, 200));
      } else if (currentUser.role === 'parent') {
        // Fetch linked students profile and target settings
        await refreshParentData();
        setStudentLearningEvents(await db.listLearningEvents(undefined, 500));
      } else if (currentUser.role === 'admin') {
        // Fetch users lists & logs
        await refreshAdminData();
      }
    };

    syncRoleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh*Data ổn định theo currentUser; thêm vào deps gây vòng lặp sync. Sẽ chuyển sang useCallback khi tách App.tsx (task 2.2.3)
  }, [currentUser]);

  // General Notification Handler
  const showNotif = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 5000);
  };

  // Log system events to LocalStorage DB Adapter
  const logSystemEvent = async (level: 'INFO' | 'WARN' | 'ERROR', message: string, payload?: unknown) => {
    try {
      await db.logSystemEvent({
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        level,
        module: 'SYSTEM',
        message,
        payload: payload ? JSON.stringify(payload) : null,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to log system event", e);
    }
  };

  const saveStudentLearningEvent = async (event: LearningEventRecord) => {
    try {
      await db.saveLearningEvent(event);
      setStudentLearningEvents(await db.listLearningEvents(undefined, 200));
    } catch (e) {
      console.error("Failed to save student learning event", e);
    }
  };

  // ==========================================
  // Auth Functions
  // ==========================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !displayName.trim()) {
      showNotif(t('notif_fill_required'), "error");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Check if user already exists
    const existing = await db.getLocalUser(cleanUsername);
    if (existing) {
      showNotif(t('notif_username_taken'), "error");
      return;
    }

    // Role-specific check
    let linkedList: string[] = [];
    let initialStatus: 'approved' | 'pending' | 'rejected' = 'pending';

    if (regRole === 'parent') {
      if (!studentToLink.trim()) {
        showNotif(t('notif_parent_enter_student'), "error");
        return;
      }
      const linkedStudentUser = studentToLink.trim().toLowerCase();
      const studentObj = await db.getLocalUser(linkedStudentUser);
      if (!studentObj || studentObj.role !== 'student') {
        showNotif(t('notif_student_not_found', { student: linkedStudentUser }), "error");
        return;
      }
      linkedList = [linkedStudentUser];
    } else if (regRole === 'admin') {
      // First-run setup: the very first admin registers freely. Once an admin
      // exists, additional admin accounts must be issued by an existing admin.
      const existingUsers = await db.listLocalUsers();
      if (existingUsers.some(u => u.role === 'admin')) {
        showNotif(t('notif_admin_exists'), "error");
        return;
      }
      initialStatus = 'approved'; // Admins auto-approved
    }

    try {
      const inputHash = await hashPassword(password);
      const newUser: LocalUser = {
        id: `user-${Date.now()}`,
        username: cleanUsername,
        passwordHash: inputHash, // Secure hashed password
        displayName: displayName.trim(),
        contactInfo: contactInfo.trim(),
        role: regRole,
        targetBand: regRole === 'student' ? 6.5 : 9.0,
        examDate: regRole === 'student' ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
        createdAt: new Date().toISOString(),
        status: initialStatus,
        assignedTrack: regRole === 'student' ? 'math' : undefined,
        assignedTracks: regRole === 'student' ? ['math'] : [],
        linkedStudents: linkedList
      };

      await db.registerLocalUser(newUser);
      await logSystemEvent('INFO', `Tài khoản mới đăng ký: @${cleanUsername} [${regRole.toUpperCase()}]`, { username: cleanUsername, role: regRole });
      
      if (initialStatus === 'pending') {
        showNotif(t('notif_register_pending'), "success");
      } else {
        showNotif(t('notif_register_admin_ok'), "success");
      }
      
      // Clear forms
      setUsername('');
      setPassword('');
      setDisplayName('');
      setContactInfo('');
      setStudentToLink('');
      setAuthTab('login');
    } catch {
      showNotif(t('notif_register_failed'), "error");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      showNotif(t('notif_login_required'), "error");
      return;
    }

    const cleanUsername = loginUsername.trim().toLowerCase();
    try {
      const u = await db.getLocalUser(cleanUsername);
      if (!u) {
        showNotif(t('notif_login_incorrect'), "error");
        return;
      }

      const verdict = await verifyPassword(loginPassword.trim(), u.passwordHash);
      if (!verdict.ok) {
        showNotif(t('notif_login_incorrect'), "error");
        return;
      }

      // Transparently upgrade legacy password records to the current hash format
      if (verdict.needsRehash) {
        try {
          await db.registerLocalUser({ ...u, passwordHash: await hashPassword(loginPassword.trim()) });
        } catch (rehashErr) {
          console.warn('Failed to upgrade legacy password hash:', rehashErr);
        }
      }

      if (u.status === 'pending') {
        showNotif(t('notif_login_pending'), "info");
        return;
      }

      if (u.status === 'rejected') {
        showNotif(t('notif_login_rejected'), "error");
        return;
      }

      // Success
      localStorage.setItem('miuprep_active_username', u.username);
      setCurrentUser(u);
      await logSystemEvent('INFO', `Người dùng đăng nhập thành công: @${u.username}`);
      showNotif(t('notif_welcome_back', { name: u.displayName || u.username }), "success");
    } catch {
      showNotif(t('notif_login_failed'), "error");
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logSystemEvent('INFO', `Người dùng đăng xuất: @${currentUser.username}`);
    }
    localStorage.removeItem('miuprep_active_username');
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    showNotif(t('notif_logout_ok'));
  };

  // ==========================================
  // Student Actions
  // ==========================================
  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !studyDiary.trim()) return;

    // Gamification: Reward 15 Salmon Coins for journaling!
    const coinsReward = calculateCoinsReward(true, false); // Returns 15 standard
    const diaryUpdate = recordStudyDiary(diaryList, studyDiary, diaryMood, fishCoins, coinsReward);
    setDiaryList(diaryUpdate.nextDiaryList);
    setStudyDiary("");

    setFishCoins(diaryUpdate.nextCoins);
    persistDiaryUpdate(localStorage, currentUser.username, diaryUpdate);
    
    logSystemEvent('INFO', `Học sinh @${currentUser.username} viết nhật ký học tập, được tặng +15 Xu Cá Hồi`, { journal: studyDiary });
    showNotif(t('notif_diary_reward'), "success");
  };

  const handleDailyPlanCompleted = async () => {
    if (!currentUser || currentUser.role !== 'student') return;
    const dateKey = getTodayPlanDateKey();
    const alreadyRewardedToday = studentLearningEvents.some((event) => {
      return (
        event.type === 'daily_target_completed' &&
        event.learnerId === currentUser.username &&
        (event.payload?.dateKey === dateKey || String(event.entityId || '').endsWith(dateKey))
      );
    });
    if (alreadyRewardedToday) {
      showNotif('Today quest is already completed. Keep the streak alive tomorrow.', 'info');
      return;
    }
    const event = buildLearningEvent(
      'daily_target_completed',
      {
        dateKey,
        dailyPlanCompleted: true,
        dailyStepIds: ['diagnostic', 'lesson', 'guided', 'independent', 'review'],
        rewardCoins: DAILY_PLAN_COMPLETION_REWARD,
        sourceSurface: 'student_today_sprint',
      },
      {
        learnerId: currentUser.username,
        entityType: 'daily_plan',
        entityId: `daily-plan-${currentUser.username}-${dateKey}`,
        source: 'miuprep_portal',
      },
    );
    await db.saveLearningEvent(event);
    setFishCoins(prev => {
      const nextCoins = prev + DAILY_PLAN_COMPLETION_REWARD;
      persistCoinBalance(localStorage, currentUser.username, nextCoins);
      return nextCoins;
    });
    setStudentLearningEvents(await db.listLearningEvents(undefined, 200));
    await logSystemEvent('INFO', `Hoc sinh @${currentUser.username} hoan thanh today target`, { dateKey, eventId: event.id });
    showNotif(t('notif_quest_complete', { reward: DAILY_PLAN_COMPLETION_REWARD }), 'success');
  };

  const handleDailyStepCompleted = (stepId: DailyLoopStepId) => {
    if (!currentUser || currentUser.role !== 'student') return;
    void saveStudentLearningEvent(buildDailyLoopStepLearningEvent({
      username: currentUser.username,
      stepId,
      dateKey: getTodayPlanDateKey(),
      activeErrorCount: activeErrorQuestionCount,
    }));
  };

  const handleMathLessonTemplateAction = (template: LessonTemplateActionTemplate, action: LessonTemplateAction) => {
    if (!currentUser || currentUser.role !== 'student') return;
    void saveStudentLearningEvent(buildLessonTemplateActionLearningEvent({
      username: currentUser.username,
      programId: 'vn_math_6_9',
      domainId: 'mathematics',
      templateId: template.id,
      templateTitle: template.title,
      conceptIds: template.conceptIds,
      skillIds: template.skillIds,
      estimatedMinutes: template.estimatedMinutes,
      masteryTarget: template.masteryTarget,
      action,
      sourceSurface: 'math_lesson_template_panel',
    }));
    if (action === 'open_practice') {
      void startLessonTemplatePractice(template, 'mathematics', 'vn_math_6_9', 'math_lesson_template_panel');
    }
  };

  const handleEnglishLessonTemplateAction = async (template: LessonTemplateActionTemplate, action: LessonTemplateAction) => {
    if (!currentUser || currentUser.role !== 'student') return;
    const programId = resolvePrimaryEnglishProgramId(currentUser);
    void saveStudentLearningEvent(buildLessonTemplateActionLearningEvent({
      username: currentUser.username,
      programId,
      domainId: 'english_core',
      templateId: template.id,
      templateTitle: template.title,
      conceptIds: template.conceptIds,
      skillIds: template.skillIds,
      estimatedMinutes: template.estimatedMinutes,
      masteryTarget: template.masteryTarget,
      action,
      sourceSurface: 'english_core_lesson_template_panel',
    }));
    if (action === 'open_practice') {
      const { isEnglishItemBankProgramId } = await loadEnglishItemBankPracticeModule();
      if (isEnglishItemBankProgramId(programId)) {
        const started = await startEnglishItemBankPractice(template, programId);
        if (started) return;
      }
      await startLessonTemplatePractice(template, 'english_core', programId, 'english_core_lesson_template_panel');
    }
  };

  // ==========================================
  // Parent Actions
  // ==========================================
  const refreshParentData = async () => {
    if (!currentUser || currentUser.role !== 'parent') return;
    
    const students: LocalUser[] = [];
    if (currentUser.linkedStudents) {
      for (const studentUsername of currentUser.linkedStudents) {
        const stud = await db.getLocalUser(studentUsername);
        if (stud) students.push(stud);
      }
    }
    setLinkedStudentsList(students);
    if (students.length > 0) {
      setSelectedStudent(students[0].username);
      setWeeklyTargetValue(students[0].studyPlan?.weeklyTarget || 4);
    }
  };

  const handleUpdateStudentTarget = async () => {
    if (!selectedStudent) return;
    try {
      const studentObj = await db.getLocalUser(selectedStudent);
      if (studentObj) {
        const updated = {
          ...studentObj,
          studyPlan: {
            weeklyTarget: weeklyTargetValue,
            nextSessionAt: studentObj.studyPlan?.nextSessionAt || ''
          }
        };
        await db.registerLocalUser(updated);
        await logSystemEvent('INFO', `Phụ huynh @${currentUser?.username} cập nhật mục tiêu của con @${selectedStudent} thành ${weeklyTargetValue} buổi/tuần`);
        showNotif(t('notif_weekly_target_updated'), "success");
        await refreshParentData();
      }
    } catch {
      showNotif(t('notif_target_update_failed'), "error");
    }
  };

  const handleRewardCoins = async () => {
    if (!selectedStudent) return;
    try {
      const progressSnapshot = loadStudentProgressSnapshot(localStorage, selectedStudent);
      const newCoins = progressSnapshot.coins + rewardAmount;
      persistCoinBalance(localStorage, selectedStudent, newCoins);

      await logSystemEvent('INFO', `Phụ huynh @${currentUser?.username} khen thưởng con @${selectedStudent} thêm +${rewardAmount} Xu Cá Hồi`, { amount: rewardAmount, student: selectedStudent });
      
      // Update parent rewardsAllocated counter
      if (currentUser) {
        const updatedParent = {
          ...currentUser,
          rewardsAllocated: (currentUser.rewardsAllocated || 0) + rewardAmount
        };
        await db.registerLocalUser(updatedParent);
        setCurrentUser(updatedParent);
      }

      showNotif(t('notif_gift_coins', { amount: rewardAmount }), "success");
      await refreshParentData();
    } catch {
      showNotif(t('notif_reward_failed'), "error");
    }
  };

  // ==========================================
  // Admin Actions
  // ==========================================
  const refreshAdminData = async () => {
    try {
      const users = await db.listLocalUsers();
      setAllUsersList(users);
      const logs = await db.listSystemLogs(80);
      setAdminLogs(logs);
      const learningEvents = await db.listLearningEvents(undefined, 200);
      setAdminLearningEvents(learningEvents);
    } catch (e) {
      console.error("Failed to load admin telemetry data", e);
    }
  };

  const handleOpenUserDetail = async (userUsername: string) => {
    const fullUserObj = await db.getLocalUser(userUsername);
    if (fullUserObj) {
      setSelectedUserForDetail(fullUserObj);
    }
  };

  const handleUpdateStatus = async (userUsername: string, nextStatus: 'approved' | 'rejected') => {
    try {
      const targetUser = await db.getLocalUser(userUsername);
      if (targetUser) {
        const updated = { ...targetUser, status: nextStatus };
        await db.registerLocalUser(updated);
        await logSystemEvent('INFO', `Admin @${currentUser?.username} thay đổi trạng thái của @${userUsername} thành [${nextStatus.toUpperCase()}]`);
        showNotif(t('notif_status_approved', { username: userUsername }), "success");
        await refreshAdminData();
      }
    } catch {
      showNotif(t('notif_status_approve_failed'), "error");
    }
  };

  const handleDeleteUser = async (userUsername: string) => {
    if (userUsername === currentUser?.username) {
      showNotif(t('notif_cannot_delete_self'), "error");
      return;
    }
    const confirm = window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản @${userUsername} meow?`);
    if (!confirm) return;

    try {
      await db.deleteLocalUser(userUsername);
      await logSystemEvent('WARN', `Admin @${currentUser?.username} xóa vĩnh viễn tài khoản: @${userUsername}`);
      showNotif(t('notif_account_deleted', { username: userUsername }), "success");
      await refreshAdminData();
    } catch {
      showNotif(t('notif_delete_account_failed'), "error");
    }
  };

  const handleAddDefaultLogs = async () => {
    await logSystemEvent('INFO', 'Hệ thống AI MiuPrep khởi chạy tiến trình Calibration tham số IRT');
    await logSystemEvent('INFO', 'Đồng bộ hóa Salmon Coins ví dùng chung hoàn tất');
    await refreshAdminData();
    showNotif(t('notif_telemetry_seeded'), "success");
  };

  const handleSendEmergencyIntervention = async () => {
    alert("Đã gửi thông báo nhắc nhở kèm bài tập bổ sung môn Toán 9 cho tài khoản con @con.cung meow! 🐾🚀");
    await logSystemEvent('WARN', 'Admin đã gửi thông báo khắc phục khẩn cấp cho con @con.cung');
  };

  const handleApproveAllPendingUsers = async () => {
    const list = await db.listLocalUsers();
    for (const user of list) {
      if (user.status === 'pending') {
        const fullUser = await db.getLocalUser(user.username);
        if (fullUser) {
          fullUser.status = 'approved';
          await db.registerLocalUser(fullUser);
        }
      }
    }
    await logSystemEvent('WARN', 'Admin phê duyệt nhanh tất cả các tài khoản');
    showNotif(t('notif_quick_approve_all'), "success");
    await refreshAdminData();
  };

  const handleBoostAllStudentCoins = async () => {
    const users = await db.listLocalUsers();
    users.forEach((user) => {
      if (user.role === 'student') {
        persistCoinBalance(localStorage, user.username, 1000);
      }
    });
    await logSystemEvent('WARN', 'Admin bơm tài nguyên: Set ví học viên thành 1,000 Coins');
    showNotif(t('notif_boost_all_coins'), "success");
    await refreshAdminData();
  };

  const handleClearTelemetryLogs = () => {
    localStorage.removeItem('ielts_app_logs_list');
    setAdminLogs([]);
    showNotif(t('notif_telemetry_cleared'), "success");
  };

  // ==========================================
  // Constant Course Track Config
  // ==========================================
  const TRACKS: TrackInfo[] = [
    {
      id: 'math',
      title: 'MiuMath Lớp 9 Chuyên',
      subtitle: 'Toán Học & Casio Hacks',
      description: 'Luyện thi Toán Chuyên sâu, rút gọn biểu thức, hệ phương trình nâng cao, hình học không gian thực tế và các mẹo bấm máy Casio FX-580VN X siêu tốc.',
      badge: 'Hình học phẳng • Đại số cực trị • Casio tips',
      icon: '🧮',
      colorClass: 'from-emerald-500/20 via-emerald-600/10 to-teal-900/40 hover:border-emerald-500/60 shadow-emerald-950/20',
      buttonText: 'Vào Học Toán MiuMath',
      bubbleText: 'Học Toán thôi meow! Cùng Miu phá đảo bẫy chuột phương trình nâng cao nhé! 📐🐟'
    },
    {
      id: 'sat',
      title: 'SAT Studio Adaptive',
      subtitle: 'Digital SAT Prep',
      description: 'Động cơ thi thử thích ứng theo module chuẩn Bluebook, tích hợp máy tính vẽ đồ thị Desmos, theo dõi đo lường năng lực học viên bằng lý thuyết IRT.',
      badge: 'Adaptive Testing • Desmos • IRT Calibration',
      icon: '🎓',
      colorClass: 'from-rose-500/20 via-rose-600/10 to-rose-950/40 hover:border-rose-500/60 shadow-rose-950/20',
      buttonText: 'Vào Học SAT Studio',
      bubbleText: 'SAT test day is coming meow! Động cơ thích ứng đã sẵn sàng, cùng Miu lướt Desmos nào! 🎓📊'
    },
    {
      id: 'ielts',
      title: 'IELTS Prep Academy',
      subtitle: 'Tiếng Anh Học Thuật',
      description: 'Cải thiện toàn diện 4 kỹ năng Listening, Reading, và phân hệ chấm điểm AI thông minh thời gian thực cho Writing và Speaking.',
      badge: 'AI Speaking • Essay Grader • Listening player',
      icon: '🎙️',
      colorClass: 'from-indigo-500/20 via-indigo-600/10 to-indigo-950/40 hover:border-indigo-500/60 shadow-indigo-950/20',
      buttonText: 'Vào Học IELTS Prep',
      bubbleText: 'Let\'s boost your band score meow! Luyện nghe và viết luận cùng AI Miu thôi! 👓🎙️'
    },
    {
      id: 'cpe',
      title: 'CPE C2 Proficiency',
      subtitle: 'Tiếng Anh Tối Cao C2',
      description: 'Chinh phục chứng chỉ tiếng Anh học thuật cấp độ C2 Proficiency của Cambridge. Thách thức với các bài Use of English biến đổi câu cực khó.',
      badge: 'Use of English • C2 Reading • Vocabulary Mastery',
      icon: '👑',
      colorClass: 'from-purple-500/20 via-purple-600/10 to-purple-950/40 hover:border-purple-500/60 shadow-purple-950/20',
      buttonText: 'Vào Học CPE Cambridge',
      bubbleText: 'C2 Proficiency is elite meow! Thử thách từ vựng và biến đổi câu nâng cao cùng Miu nhé! 👑🎓'
    },
    {
      id: 'cae',
      title: 'CAE C1 Advanced',
      subtitle: 'Tiếng Anh Nâng Cao C1',
      description: 'Chinh phục chứng chỉ tiếng Anh học thuật cấp độ C1 Advanced của Cambridge. Ôn luyện Use of English và bài đọc nâng cao chuyên sâu.',
      badge: 'C1 Use of English • Reading Comprehension • C1 Level',
      icon: '✨',
      colorClass: 'from-violet-500/20 via-violet-600/10 to-violet-950/40 hover:border-violet-500/60 shadow-violet-950/20',
      buttonText: 'Vào Học CAE Advanced',
      bubbleText: 'C1 Advanced is excellent meow! Cùng Miu ôn luyện Use of English C1 cực đỉnh nào! ✨🎓'
    }
  ];

  const activeErrorQuestions = getActiveErrorQuestions(errorQuestions);
  const activeErrorQuestionCount = countActiveErrorQuestions(errorQuestions);
  const studentWorkspaceTabs = buildStudentWorkspaceTabs(TRACKS.length, mouseTrapsCount, fishCoins);
  const activeContentExams = importedExams.filter((exam) => exam.exam.toLowerCase() === adminActiveTab);
  const activeContentReviewSummary = summarizeContentReview(activeContentExams);
  const filteredContentExams = filterImportedExamsByReviewStatus(activeContentExams, contentReviewFilter);
  const isAdminContentOnly = isAdminContentAccount(currentUser);
  const adminWorkspaceTabs = buildAdminWorkspaceTabs({
    activeTrack: adminActiveTab,
    isAdminContentOnly,
    logCount: adminLogs.length,
    userCount: allUsersList.length
  });
  const effectiveAdminWorkspaceTab: AdminWorkspaceTabId = isAdminContentOnly && adminWorkspaceTab !== 'content' && adminWorkspaceTab !== 'analytics'
    ? 'content'
    : adminWorkspaceTab;

  const handleOpenStudentRepair = () => {
    const notebookAction = openErrorNotebookFromOverview(showErrorNotebook);
    setShowErrorNotebook(notebookAction.nextShowErrorNotebook);
    if (notebookAction.nextWorkspaceTab) {
      setStudentWorkspaceTab(notebookAction.nextWorkspaceTab);
    }
    if (notebookAction.shouldNotify) {
      showNotif('Đã mở sổ lỗi để ôn lại các câu cần sửa hôm nay.', 'info');
    }
  };

  // Helper properties to control dynamic Mascot
  const getActiveMiuParams = () => {
    if (!currentUser) {
      if (authTab === 'login') {
        return {
          theme: 'math' as const,
          state: 'idle' as const,
          bubble: "Chào mừng bạn meow! Đăng nhập ngay để khám phá đa vũ trụ tri thức cùng Miu nhé! 🪐🐾"
        };
      } else {
        const mascotMap = {
          student: { theme: 'math' as const, bubble: "Trở thành Học sinh xuất sắc của MiuPrep để nhận Xu Cá Hồi meow meow! 🎒🐟" },
          parent: { theme: 'parent' as const, bubble: "Chào Phụ huynh meow! Tạo tài khoản để cùng Miu đồng hành trên chặng đường học tập của con! 🏠👓" },
          admin: { theme: 'admin' as const, bubble: "Chào mừng Quản trị viên meow! Điền mã bí mật để kích hoạt quyền Tổng quản hệ thống! 👑🛠️" }
        };
        return {
          theme: mascotMap[regRole].theme,
          state: 'hint' as const,
          bubble: mascotMap[regRole].bubble
        };
      }
    }

    if (isAdminContentAccount(currentUser)) {
      return {
        theme: 'admin' as const,
        state: 'hint' as const,
        bubble: `Chao Content Admin <strong>${currentUser.displayName || currentUser.username}</strong>. Hay review de, sua cau loi va export change set de dong bo nguoc ve source data.`
      };
    }

    if (currentUser.role === 'admin') {
      return {
        theme: 'admin' as const,
        state: 'success' as const,
        bubble: `Chào mừng Tổng Tư Lệnh <strong>${currentUser.displayName || currentUser.username}</strong> meow! Hệ điều hành MiuPrep ổn định 100%! 👑🛠️`
      };
    }

    if (currentUser.role === 'parent') {
      return {
        theme: 'parent' as const,
        state: 'hint' as const,
        bubble: `Kính chào Phụ huynh <strong>${currentUser.displayName || currentUser.username}</strong>! Hôm nay hãy xem điểm và khen thưởng Xu Cá Hồi cho con nhé! 👓☕`
      };
    }

    // Default student
    const activeTrack = TRACKS.find(t => t.id === hoveredTrack);
    return {
      theme: (hoveredTrack === 'cae' ? 'ielts' : (hoveredTrack || 'math')) as 'math' | 'sat' | 'ielts' | 'cpe' | 'cpa',
      state: hoveredTrack ? 'success' as const : 'idle' as const,
      bubble: activeTrack 
        ? activeTrack.bubbleText 
        : `Chào mừng học sinh cưng <strong>${currentUser.displayName || currentUser.username}</strong> meow! Hôm nay chúng mình chinh phục đỉnh cao nào đây? 🐾🐟`
    };
  };

  const activeMiu = getActiveMiuParams();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* Toast Notification */}
      {notif && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 animate-slide-in ${
          notif.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' 
            : notif.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-400'
              : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-400'
        }`}>
          <span className="text-xl font-bold">{notif.type === 'success' ? '😸' : notif.type === 'error' ? '😿' : '💡'}</span>
          <span className="text-sm font-semibold">{notif.text}</span>
        </div>
      )}

      {/* Global Navbar */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow">🪐</span>
            <span className="text-xl font-black bg-gradient-to-r from-orange-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent tracking-wider font-mono">
              MIUPREP
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-950 border border-slate-850 px-2 sm:px-4 py-1.5 rounded-full shadow-inner max-w-[calc(100vw-150px)] sm:max-w-none min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className={`hidden sm:inline text-xs font-black uppercase text-slate-400 ${isAdminContentAccount(currentUser) ? 'sm:hidden' : ''}`}>
                  {currentUser.role === 'admin' ? t('auth_role_admin') : currentUser.role === 'parent' ? t('auth_role_parent') : t('auth_role_student')}
                </span>
                {isAdminContentAccount(currentUser) && (
                  <span className="hidden sm:inline text-xs font-black uppercase text-indigo-300">{t('header_admin_content')}</span>
                )}
                <span className="text-xs font-semibold text-slate-200 truncate min-w-0 max-w-[88px] sm:max-w-none">@{currentUser.username}</span>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-black uppercase text-red-400 hover:text-red-300 sm:ml-2 bg-transparent border-0 outline-none cursor-pointer shrink-0"
                >
                  {t('header_logout')}
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('header_ecosystem_tagline')}</span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Portal Header */}
        <header className="text-center mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 backdrop-blur-md mb-4 text-xs font-black tracking-widest text-orange-400 uppercase">
            🚀 MiuMath Styled Unified System v2.0
          </div>
          <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-white via-orange-200 to-rose-400 bg-clip-text text-transparent tracking-tight">
            MIUPREP UNIVERSE
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-slate-350 font-light tracking-wide italic max-w-2xl opacity-90 font-sans">
            {t('header_subtitle')}
          </p>
        </header>

        {/* Important home signal only before login */}
        {!currentUser && (
          <section className="max-w-4xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {[
              ['Adaptive Core', 'Diagnostic, mastery tracking, next best lesson.'],
              ['Mathematics', 'Vietnam program from lower secondary to high school.'],
              ['English Exams', 'IELTS, SAT, CAE and CPE on one shared skill model.']
            ].map(([label, detail]) => (
              <div key={label} className="bg-slate-900/55 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{label}</span>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{detail}</p>
              </div>
            ))}
          </section>
        )}

        {/* Mascot Box */}
        {currentUser && (
        <section className="mb-10 max-w-3xl mx-auto relative">
          <MiuMascot 
            theme={activeMiu.theme} 
            mascotState={activeMiu.state} 
            bubbleText={activeMiu.bubble} 
            className="shadow-xl border-orange-500/20 bg-slate-900/60 text-slate-200"
          />
          {equippedMascotItem && (
            <div className="absolute top-4 left-6 bg-slate-950/90 border border-orange-500/30 text-xs px-3 py-1.5 rounded-full text-orange-400 font-bold shadow-lg animate-bounce select-none flex items-center gap-1.5 z-10">
              <span>Đồ chơi của Miu:</span>
              <span className="text-lg">{equippedMascotItem}</span>
            </div>
          )}
        </section>
        )}

        {/* ==========================================
            UNAUTHENTICATED: LOGIN / REGISTER CARD
            ========================================== */}
        {!currentUser && (
          <section className="max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="flex justify-end mb-2">
              <LanguageToggle style={{ color: '#fb923c' }} />
            </div>
            {/* Tabs */}
            <div className="flex border-b border-slate-800 pb-4 mb-6">
              <button
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2 font-black uppercase text-xs tracking-wider transition-all border-0 cursor-pointer ${authTab === 'login' ? 'text-orange-400 border-b-2 border-orange-400 bg-transparent' : 'text-slate-500 hover:text-slate-300 bg-transparent'}`}
              >
                {t('auth_tab_login')}
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`flex-1 py-2 font-black uppercase text-xs tracking-wider transition-all border-0 cursor-pointer ${authTab === 'register' ? 'text-orange-400 border-b-2 border-orange-400 bg-transparent' : 'text-slate-500 hover:text-slate-300 bg-transparent'}`}
              >
                {t('auth_tab_register')}
              </button>
            </div>

            {/* LOGIN FORM */}
            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{t('auth_username_label')}</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder={t('auth_username_placeholder')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{t('auth_password_label')}</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-extrabold uppercase text-xs tracking-widest text-white shadow-lg active:scale-95 duration-100 mt-2 border-0 cursor-pointer"
                >
                  {t('auth_login_button')}
                </button>
                
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  {t('auth_first_time_hint')}
                </p>
              </form>
            ) : (
              // REGISTER FORM
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                
                {/* Role Selector */}
                <div className="flex flex-col text-left mb-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">{t('auth_role_question')}</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-955 p-1 rounded-xl border border-slate-850">
                    {(['student', 'parent', 'admin'] as const).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRegRole(role)}
                        className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all border-0 cursor-pointer ${
                          regRole === role 
                            ? 'bg-orange-500 text-white shadow' 
                            : 'text-slate-400 hover:text-slate-200 bg-transparent'
                        }`}
                      >
                        {role === 'student' ? t('auth_role_student') : role === 'parent' ? t('auth_role_parent') : t('auth_role_admin')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{t('auth_username_label_required')}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth_username_placeholder_example')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{t('auth_displayname_label')}</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('auth_displayname_placeholder')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{t('auth_password_label_required')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth_password_placeholder')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{t('auth_contact_label')}</label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder={t('auth_contact_placeholder')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                {/* Parent Specific Field */}
                {regRole === 'parent' && (
                  <div className="flex flex-col text-left border-l-2 border-orange-500 pl-3 bg-orange-500/5 py-2 rounded-r-xl">
                    <label className="text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1.5">{t('auth_link_student_label')}</label>
                    <input
                      type="text"
                      value={studentToLink}
                      onChange={(e) => setStudentToLink(e.target.value)}
                      placeholder={t('auth_link_student_placeholder')}
                      className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">{t('auth_link_student_hint')}</span>
                  </div>
                )}

                {/* Admin Specific Field */}
                {regRole === 'admin' && (
                  <div className="flex flex-col text-left border-l-2 border-purple-500 pl-3 bg-purple-500/5 py-2 rounded-r-xl">
                    <span className="text-[10px] text-purple-300 leading-relaxed">
                      {t('auth_admin_hint')}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold uppercase text-xs tracking-widest text-white shadow-lg active:scale-95 duration-100 mt-2 border-0 cursor-pointer"
                >
                  {t('auth_register_button')}
                </button>
              </form>
            )}
          </section>
        )}


        {/* ==========================================
            ROLE: STUDENT DASHBOARD (MiuMath Styled)
            ========================================== */}
        {currentUser && currentUser.role === 'student' && (
          activeStudentTab === 'sat-board' ? (
            <DeferredPanel>
            <StudentSatBoardWorkspace
              satEstimatedScore={satEstimatedScore}
              satTargetScore={satTargetScore}
              fishCoins={fishCoins}
              selectedSatBank={selectedSatBank}
              setSelectedSatBank={setSelectedSatBank}
              isLoadingQuestions={isLoadingQuestions}
              activePracticeState={activePracticeState}
              setActivePracticeState={setActivePracticeState}
              setTemplatePracticeState={setTemplatePracticeState}
              setEnglishItemBankPracticeState={setEnglishItemBankPracticeState}
              satTaxonomy={satTaxonomy}
              setActiveStudentTab={setActiveStudentTab}
              handleAnswerSatQuestion={handleAnswerSatQuestion}
              handleNextSatQuestion={handleNextSatQuestion}
              handleStartPractice={handleStartPractice}
            />
            </DeferredPanel>
          ) : (
            <DeferredPanel>
            <StudentDashboardWorkspace
              currentUser={currentUser}
              tracks={TRACKS}
              studentWorkspaceTabs={studentWorkspaceTabs}
              studentWorkspaceTab={studentWorkspaceTab}
              setStudentWorkspaceTab={setStudentWorkspaceTab}
              fishCoins={fishCoins}
              mouseTrapsCount={mouseTrapsCount}
              activeErrorQuestions={activeErrorQuestions}
              activeErrorQuestionCount={activeErrorQuestionCount}
              studentLearningEvents={studentLearningEvents}
              handleOpenStudentRepair={handleOpenStudentRepair}
              handleDailyStepCompleted={handleDailyStepCompleted}
              handleDailyPlanCompleted={handleDailyPlanCompleted}
              errorQuestions={errorQuestions}
              englishItemBankPracticeState={englishItemBankPracticeState}
              handleAnswerEnglishItemBankPractice={handleAnswerEnglishItemBankPractice}
              handleNextEnglishItemBankPractice={handleNextEnglishItemBankPractice}
              setEnglishItemBankPracticeState={setEnglishItemBankPracticeState}
              templatePracticeState={templatePracticeState}
              handleAnswerTemplatePractice={handleAnswerTemplatePractice}
              handleNextTemplatePractice={handleNextTemplatePractice}
              setTemplatePracticeState={setTemplatePracticeState}
              showErrorNotebook={showErrorNotebook}
              setShowErrorNotebook={setShowErrorNotebook}
              handleRetryErrorQuestionV2={handleRetryErrorQuestionV2}
              handleRetryErrorQuestion={handleRetryErrorQuestion}
              unlockedMascotItems={unlockedMascotItems}
              equippedMascotItem={equippedMascotItem}
              handleBuyMascotItem={handleBuyMascotItem}
              handleEquipMascotItem={handleEquipMascotItem}
              showDesmos={showDesmos}
              setShowDesmos={setShowDesmos}
              studyDiary={studyDiary}
              setStudyDiary={setStudyDiary}
              diaryMood={diaryMood}
              setDiaryMood={setDiaryMood}
              diaryList={diaryList}
              handleSaveDiary={handleSaveDiary}
              setHoveredTrack={setHoveredTrack}
              setActiveStudentTab={setActiveStudentTab}
              showNotif={showNotif}
              handleMathLessonTemplateAction={handleMathLessonTemplateAction}
              handleEnglishLessonTemplateAction={handleEnglishLessonTemplateAction}
            />
            </DeferredPanel>
          )
        )}


        {/* ==========================================
            ROLE: PARENT DASHBOARD (SAT Tracker Styled)
            ========================================== */}
        {currentUser && currentUser.role === 'parent' && (
          <DeferredPanel>
          <ParentWorkspace
            currentUser={currentUser}
            linkedStudents={linkedStudentsList}
            tracks={TRACKS}
            learningEvents={studentLearningEvents}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            weeklyTargetValue={weeklyTargetValue}
            setWeeklyTargetValue={setWeeklyTargetValue}
            rewardAmount={rewardAmount}
            setRewardAmount={setRewardAmount}
            handleUpdateStudentTarget={handleUpdateStudentTarget}
            handleRewardCoins={handleRewardCoins}
          />
          </DeferredPanel>
        )}


        {/* ==========================================
            ROLE: ADMIN DASHBOARD (Telemetry Audit Styled)
            ========================================== */}
        {currentUser && currentUser.role === 'admin' && (
          <div className="space-y-12">
            
            {/* Controls Header */}
            <section className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
              <h2 className="text-xl font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <span>🔧 CỔNG KIỂM SOÁT HỆ THỐNG TOÀN CỤC</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={refreshAdminData}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border-0 cursor-pointer"
                >
                  🔄 Làm mới dữ liệu
                </button>
                <button
                  onClick={isAdminContentOnly ? undefined : handleAddDefaultLogs}
                  disabled={isAdminContentOnly}
                  className={`bg-purple-900/60 border border-purple-800 hover:bg-purple-900/80 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border-0 ${isAdminContentOnly ? 'hidden' : 'cursor-pointer'}`}
                >
                  📊 Tạo Logs Mẫu
                </button>
              </div>
            </section>

            <section className="max-w-5xl mx-auto">
              {isAdminContentOnly && (
                <div className="mb-3 rounded-2xl border border-indigo-900/60 bg-indigo-950/25 p-4 text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Admin Content Scope</div>
                  <p className="mt-1 text-xs font-semibold text-slate-300">
                    Tai khoan nay chi quan ly noi dung de thi, review loi cau hoi, mo tung de, chinh sua truc tiep va export change set.
                  </p>
                </div>
              )}
              <div className={`bg-slate-900/70 border border-slate-800 rounded-2xl p-2 grid grid-cols-2 ${isAdminContentOnly ? 'md:grid-cols-2' : 'md:grid-cols-5'} gap-2`}>
                {adminWorkspaceTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAdminWorkspaceTab(tab.id)}
                    className={`rounded-xl px-3 py-3 text-left border transition-all cursor-pointer ${
                      effectiveAdminWorkspaceTab === tab.id
                        ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-950/20'
                        : 'bg-slate-950/70 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-black uppercase tracking-widest">{tab.label}</span>
                    <span className={`mt-1 block text-[10px] font-bold ${effectiveAdminWorkspaceTab === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      {tab.detail}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {effectiveAdminWorkspaceTab === 'overview' && !isAdminContentOnly && (
              <DeferredPanel>
              <AdminOverviewPanel
                users={allUsersList}
                circulatingCoins={getCirculatingCoins()}
                onSendEmergencyIntervention={handleSendEmergencyIntervention}
                onApproveAllPendingUsers={handleApproveAllPendingUsers}
                onBoostStudentCoins={handleBoostAllStudentCoins}
                onClearTelemetryLogs={handleClearTelemetryLogs}
                systemPreview={(
                  <DeferredPanel label="Loading system preview">
                    <SystemSurfacePreview />
                  </DeferredPanel>
                )}
              />
              </DeferredPanel>
            )}

            {effectiveAdminWorkspaceTab === 'analytics' && (
              <DeferredPanel>
              <AdminAnalyticsWorkspace
                isAdminContentOnly={isAdminContentOnly}
                tracks={TRACKS}
                users={allUsersList}
                mathLessons={mathLessons}
                importedExams={importedExams}
                errorQuestions={errorQuestions}
                adminLogs={adminLogs}
                learningEvents={adminLearningEvents}
                activeErrorQuestionCount={activeErrorQuestionCount}
                onOpenUsers={() => setAdminWorkspaceTab('users')}
                onOpenContent={openAdminContentTrack}
              />
              </DeferredPanel>
            )}

            {/* 3. INTERACTIVE USER DETAILS Drawer / Modal */}
            {selectedUserForDetail && (
              <AdminUserDetailModal
                user={selectedUserForDetail}
                onClose={() => setSelectedUserForDetail(null)}
                onAdjustCoins={handleAdjustCoins}
                onUpdateUserTracks={handleUpdateUserTracks}
              />
            )}

            {effectiveAdminWorkspaceTab === 'users' && !isAdminContentOnly && (
              <DeferredPanel>
              <AdminUsersPanel
                users={allUsersList}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onOpenUserDetail={handleOpenUserDetail}
                onUpdateStatus={handleUpdateStatus}
                onDeleteUser={handleDeleteUser}
              />
              </DeferredPanel>
            )}

            {/* ==========================================
                ADMIN INTERNAL COURSE & EXAM MANAGEMENT
                ========================================== */}
            {effectiveAdminWorkspaceTab === 'content' && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-350 uppercase tracking-widest font-sans flex items-center gap-2">
                    <span>⚙️ QUẢN LÝ NGHIỆP VỤ & NỘI DUNG KHOÁ HỌC</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-light tracking-wide font-sans">
                    Cấu hình tham số mô hình học tập, quản lý ngân hàng câu hỏi thích ứng và import đề thi JSON nội bộ.
                  </p>
                </div>
                
                {/* Track Switcher */}
                <div className="flex bg-slate-955 p-1 rounded-xl border border-slate-850 gap-1 shrink-0">
                  {(['math', 'sat', 'ielts', 'cae', 'cpe'] as const).map(track => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => {
                        setAdminActiveTab(track);
                        setContentReviewFilter('all');
                        setExamJsonInput('');
                        setExamImportError(null);
                        setExamImportSuccess(null);
                        setSelectedContentExamId(null);
                        setContentExamDraft(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border-0 cursor-pointer ${
                        adminActiveTab === track
                          ? 'bg-orange-500 text-slate-950 shadow-md'
                          : 'bg-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {track === 'math' ? '🧮 MiuMath' : track === 'sat' ? '🎓 SAT' : track === 'ielts' ? '🎙️ IELTS' : track === 'cae' ? '✨ CAE' : '👑 CPE'}
                    </button>
                  ))}
                </div>
              </div>

              {/* TRACK 1: MIUMATH MANAGEMENT */}
              {adminActiveTab === 'math' && (
                <DeferredPanel>
                <AdminMathContentPanel
                  mathLessons={mathLessons}
                  mathCasioTips={mathCasioTips}
                  newCasioTitle={newCasioTitle}
                  newCasioSyntax={newCasioSyntax}
                  newCasioExpl={newCasioExpl}
                  newMathId={newMathId}
                  newMathTitle={newMathTitle}
                  newMathTopic={newMathTopic}
                  newMathCount={newMathCount}
                  latexMathId={latexMathId}
                  latexMathTitle={latexMathTitle}
                  latexMathEq={latexMathEq}
                  latexMathAns={latexMathAns}
                  latexMathExpl={latexMathExpl}
                  onSetNewCasioTitle={setNewCasioTitle}
                  onSetNewCasioSyntax={setNewCasioSyntax}
                  onSetNewCasioExpl={setNewCasioExpl}
                  onSetNewMathId={setNewMathId}
                  onSetNewMathTitle={setNewMathTitle}
                  onSetNewMathTopic={setNewMathTopic}
                  onSetNewMathCount={setNewMathCount}
                  onSetLatexMathId={setLatexMathId}
                  onSetLatexMathTitle={setLatexMathTitle}
                  onSetLatexMathEq={setLatexMathEq}
                  onSetLatexMathAns={setLatexMathAns}
                  onSetLatexMathExpl={setLatexMathExpl}
                  onAddCasioTip={handleAddCasioTip}
                  onAddMathLesson={handleAddMathLesson}
                  onCreateLatexQuestion={handleCreateLatexQuestion}
                />
                </DeferredPanel>
              )}

              {/* TRACK 2: SAT adaptive MANAGEMENT */}
              {adminActiveTab === 'sat' && (
                <DeferredPanel>
                <AdminSatContentPanel
                  adminSatSubTab={adminSatSubTab}
                  adminSelectedSatBank={adminSelectedSatBank}
                  adminSearchQuery={adminSearchQuery}
                  adminSelectedDomain={adminSelectedDomain}
                  adminCurrentPage={adminCurrentPage}
                  loadedQuestions={loadedQuestions}
                  activeQuestionDetail={adminActiveQuestionDetail}
                  satDiagnosticThreshold={satDiagnosticThreshold}
                  satIrtAlpha={satIrtAlpha}
                  isIrtCalibrating={isIrtCalibrating}
                  onSetAdminSatSubTab={setAdminSatSubTab}
                  onSetAdminSelectedSatBank={setAdminSelectedSatBank}
                  onSetAdminSearchQuery={setAdminSearchQuery}
                  onSetAdminSelectedDomain={setAdminSelectedDomain}
                  onSetAdminSelectedSkill={setAdminSelectedSkill}
                  onSetAdminCurrentPage={setAdminCurrentPage}
                  onSetActiveQuestionDetail={setAdminActiveQuestionDetail}
                  onSetSatDiagnosticThreshold={setSatDiagnosticThreshold}
                  onSetSatIrtAlpha={setSatIrtAlpha}
                  onTriggerIrtCalibration={handleTriggerIrtCalibration}
                />
                </DeferredPanel>
              )}

              {/* TRACKS 3, 4, 5: IELTS, CAE, CPE (EXAM MANAGEMENT) */}
              {(adminActiveTab === 'ielts' || adminActiveTab === 'cae' || adminActiveTab === 'cpe') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <DeferredPanel>
                  <AdminContentReviewPanel
                    track={adminActiveTab}
                    currentUser={currentUser}
                    reviewFilter={contentReviewFilter}
                    reviewSummary={activeContentReviewSummary}
                    filteredExams={filteredContentExams}
                    selectedExamId={selectedContentExamId}
                    examDraft={contentExamDraft}
                    onSetReviewFilter={setContentReviewFilter}
                    onExportReviewSet={handleExportContentReviewSet}
                    onOpenExam={handleOpenContentExam}
                    onSaveDraft={handleSaveContentExamDraft}
                    onExportChangeSet={handleExportContentExamChangeSet}
                    onCloseDraft={handleCloseContentExam}
                    onUpdateDraft={updateContentExamDraft}
                    onUpdateSection={updateContentExamSection}
                    onUpdateQuestion={updateContentExamQuestion}
                    onAddSection={handleAddContentSection}
                    onAddQuestion={handleAddContentQuestion}
                    onRemoveQuestion={handleRemoveContentQuestion}
                  />
                  </DeferredPanel>

                  <DeferredPanel>
                  <AdminExamImportPanel
                    track={adminActiveTab}
                    newExamId={newExamId}
                    newExamTitle={newExamTitle}
                    newExamQuestions={newExamQuestions}
                    newExamDuration={newExamDuration}
                    examJsonInput={examJsonInput}
                    examImportError={examImportError}
                    examImportSuccess={examImportSuccess}
                    onSetNewExamId={setNewExamId}
                    onSetNewExamTitle={setNewExamTitle}
                    onSetNewExamQuestions={setNewExamQuestions}
                    onSetNewExamDuration={setNewExamDuration}
                    onSetExamJsonInput={setExamJsonInput}
                    onAddExam={handleAddEnglishExam}
                    onLoadDemoExam={handleLoadDemoExam}
                    onImportJsonExam={handleImportJsonExam}
                  />
                  </DeferredPanel>
                </div>
              )}
            </section>
            )}

            {/* System Telemetry Logs Audit & CLI Control Console */}
            {effectiveAdminWorkspaceTab === 'logs' && !isAdminContentOnly && (
              <DeferredPanel>
              <AdminLogsPanel
                adminLogs={adminLogs}
                terminalCommand={terminalCommand}
                setTerminalCommand={setTerminalCommand}
                handleTerminalSubmit={handleTerminalSubmit}
              />
              </DeferredPanel>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
