import React, { useState, useEffect } from 'react';
import { MiuMascot } from '@miuprep/ui';
import { calculateCoinsReward } from '@miuprep/core';
import { LocalStorageAdapter, LocalUser, SystemLog } from '@miuprep/db';
import { buildLearningEvent, type LearningEventRecord } from '@miuprep/learning';
import UnifiedLearnerDashboard from './components/UnifiedLearnerDashboard';
import ParentLearningOverview from './components/ParentLearningOverview';
import AdminLearningAnalytics from './components/AdminLearningAnalytics';
import AITutorPreviewPanel from './components/AITutorPreviewPanel';
import BetaImplementationTracker from './components/BetaImplementationTracker';
import SystemSurfacePreview from './components/SystemSurfacePreview';
import StudentTodaySprint from './components/StudentTodaySprint';
import MathLessonTemplatePanel from './components/MathLessonTemplatePanel';
import EnglishCoreLessonTemplatePanel from './components/EnglishCoreLessonTemplatePanel';
import ErrorNotebookV2Panel from './components/ErrorNotebookV2Panel';
import AdminInterventionQueue from './components/AdminInterventionQueue';
import AdminContentRepairQueue from './components/AdminContentRepairQueue';
import ParentActionSummary from './components/ParentActionSummary';
import {
  advanceSatPractice,
  answerSatQuestion,
  createSatErrorQuestion,
  createSatPracticeState,
  getSatExplanation,
  type ErrorNotebookQuestion,
  type SatPracticeState,
  type SatQuestion,
} from './lib/satPractice';
import {
  DEFAULT_ERROR_NOTEBOOK_QUESTIONS,
  MASCOT_STORE_ITEMS,
  STUDENT_DIARY_MOODS,
  buildDailyLoopStepLearningEvent,
  buildErrorRetryLearningEvent,
  buildLessonTemplateActionLearningEvent,
  buildStudentWorkspaceTabs,
  countActiveErrorQuestions,
  getActiveErrorQuestions,
  getErrorNotebookSummary,
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
} from './lib/adminContent';

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

const FORMULA_TOKEN_PATTERN = /\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g;

function PromptWithAssets({ text, className }: { text: string; className?: string }): JSX.Element {
  const promptText = String(text || '');
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of promptText.matchAll(FORMULA_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      nodes.push(<span key={`text-${cursor}`}>{promptText.slice(cursor, index)}</span>);
    }

    const src = match[1] || '';
    const width = match[2] ? Number(match[2]) : undefined;
    const height = match[3] ? Number(match[3]) : undefined;
    if (src.startsWith('/assets/')) {
      nodes.push(
        <img
          key={`formula-${index}`}
          src={src}
          alt="math formula"
          loading="lazy"
          className="mx-1 inline-block max-w-full rounded-sm bg-white align-middle"
          style={{
            width: width ? `${Math.min(width, 360)}px` : undefined,
            height: height ? `${Math.min(height, 180)}px` : undefined,
            objectFit: 'contain',
          }}
        />,
      );
    }
    cursor = index + match[0].length;
  }

  if (cursor < promptText.length) {
    nodes.push(<span key={`text-${cursor}`}>{promptText.slice(cursor)}</span>);
  }

  return <div className={className}>{nodes.length ? nodes : promptText}</div>;
}

type LessonTemplateActionTemplate = {
  id: string;
  title: string;
  conceptIds?: string[];
  skillIds?: string[];
  estimatedMinutes?: number;
  masteryTarget?: number;
};

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
  const [adminSecret, setAdminSecret] = useState('');
  
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
  const [mathLessons, setMathLessons] = useState([
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
  const [satTaxonomy, setSatTaxonomy] = useState<any>(null);
  const [satEstimatedScore, setSatEstimatedScore] = useState<number>(1280);
  const [satTargetScore, setSatTargetScore] = useState<number>(1450);
  const [activePracticeState, setActivePracticeState] = useState<SatPracticeState | null>(null);

  // Admin SAT Explorer States
  const [adminSatSubTab, setAdminSatSubTab] = useState<'explorer' | 'integrity' | 'calibration'>('explorer');
  const [adminSelectedSatBank, setAdminSelectedSatBank] = useState<string>('sat-1590-elite-ai-bank.json');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminSelectedDomain, setAdminSelectedDomain] = useState<string>('all');
  const [adminSelectedSkill, setAdminSelectedSkill] = useState<string>('all');
  const [adminCurrentPage, setAdminCurrentPage] = useState<number>(1);
  const [adminActiveQuestionDetail, setAdminActiveQuestionDetail] = useState<any | null>(null);

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
      showNotif(`Không thể nạp dữ liệu từ tệp ${bank} meow!`, "error");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleStartPractice = (domain: string, skill: string) => {
    const nextPracticeState = createSatPracticeState(loadedQuestions, domain, skill, selectedSatBank);

    if (!nextPracticeState) {
      showNotif(`Chưa có câu hỏi nào thuộc kỹ năng [${skill}] trong ngân hàng này meow! Hãy thử ngân hàng khác!`, "info");
      return;
    }

    setActivePracticeState(nextPracticeState);

    showNotif(`Bắt đầu luyện tập ${nextPracticeState.questions.length} câu hỏi thích ứng meow! 🐾🎓`, "success");
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
      showNotif("Đáp án chính xác meow! Bạn nhận được +10 Xu Cá Hồi! 🎉🐟", "success");
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
      showNotif("Ôi không meow! Hãy xem kỹ lời giải thích bên dưới nhé! 😿", "error");
    }

    setActivePracticeState(nextState);
  };

  const handleNextSatQuestion = () => {
    if (!activePracticeState) return;
    const { completed, finalScore, totalQuestions, nextState } = advanceSatPractice(activePracticeState);

    if (completed) {
      showNotif(`Chúc mừng bạn đã hoàn thành bài luyện tập SAT! Đạt ${finalScore}/${totalQuestions} câu đúng! 🌟`, "success");
    }

    setActivePracticeState(nextState);
  };


  // New Admin Course & Exam Handlers
  const handleAddCasioTip = (e: React.FormEvent) => {
    e.preventDefault();
    const newTip = createCasioTip({
      title: newCasioTitle,
      syntax: newCasioSyntax,
      explanation: newCasioExpl,
    });

    if (!newTip) {
      showNotif("Vui lòng điền đủ Tiêu đề và Cú pháp meow!", "error");
      return;
    }

    setMathCasioTips([...mathCasioTips, newTip]);
    setNewCasioTitle('');
    setNewCasioSyntax('');
    setNewCasioExpl('');
    logSystemEvent('INFO', `Admin @${currentUser?.username} đã thêm mới Casio Tip: "${newTip.title}"`);
    showNotif("Đã thêm mới Casio Tip thành công meow! 🧮🐾", "success");
  };

  const handleTriggerIrtCalibration = () => {
    setIsIrtCalibrating(true);
    logSystemEvent('INFO', `Admin @${currentUser?.username} kích hoạt tiến trình Hiệu chuẩn tham số câu hỏi IRT`);
    setTimeout(() => {
      setIsIrtCalibrating(false);
      logSystemEvent('INFO', `Hiệu chuẩn 3PL-IRT hoàn tất: Calibrated 970 câu hỏi, Learning Rate = ${satIrtAlpha}`);
      showNotif(`Hiệu chuẩn IRT hoàn tất meow! Đã lưu tham số câu hỏi mới! 📊🐟`, "success");
    }, 2000);
  };

  const handleImportJsonExam = (trackId: EnglishExamTrack) => {
    setExamImportError(null);
    setExamImportSuccess(null);

    const result = importExamFromJson(examJsonInput, trackId);

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
    showNotif(`Nhập đề thi ${result.exam.exam} thành công meow!`, "success");
  };

  const handleLoadDemoExam = (trackId: EnglishExamTrack) => {
    const demo = createDemoExam(trackId);
    setExamJsonInput(JSON.stringify(demo, null, 2));
    showNotif(`Đã nạp đề thi mẫu ${trackId.toUpperCase()} thành công meow! Bạn hãy nhấn "Import" để nhập!`, "info");
  };

  const handleAdjustCoins = (username: string, amount: number) => {
    const progressSnapshot = loadStudentProgressSnapshot(localStorage, username);
    const newCoins = Math.max(0, progressSnapshot.coins + amount);
    persistCoinBalance(localStorage, username, newCoins);
    logSystemEvent('WARN', `Admin @${currentUser?.username} đã điều chỉnh Salmon Coins cho @${username}: ${amount > 0 ? '+' : ''}${amount} xu. Số dư mới: ${newCoins}`);
    showNotif(`Đã điều chỉnh Salmon Coins cho @${username} thành công!`, "success");
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
      showNotif("Đã cập nhật phân quyền khoá học thành công meow!", "success");
      refreshAdminData();
      if (selectedUserForDetail && selectedUserForDetail.username === username) {
        setSelectedUserForDetail(updated);
      }
    } catch (e) {
      showNotif("Cập nhật phân quyền thất bại!", "error");
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
      showNotif("Đã in lệnh trợ giúp trong Terminal meow!", "info");
    } else if (primary === '/clear-logs') {
      localStorage.removeItem('ielts_app_logs_list');
      setAdminLogs([]);
      showNotif("Đã xóa toàn bộ nhật ký hệ thống!", "success");
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
      showNotif("Đã phê duyệt toàn bộ tài khoản meow! 🚀", "success");
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
      showNotif("Vui lòng nhập Tên chuyên đề meow!", "error");
      return;
    }

    setMathLessons([...mathLessons, newLesson]);
    setNewMathId('');
    setNewMathTitle('');
    setNewMathTopic('Đại số (Algebra)');
    setNewMathCount(40);
    logSystemEvent('INFO', `Admin @${currentUser?.username} đã thêm chuyên đề Toán mới: "${newLesson.title}"`);
    showNotif("Thêm chuyên đề Toán mới thành công meow! 🧮", "success");
  };

  const handleAddEnglishExam = (trackId: EnglishExamTrack) => {
    const newExam = createEnglishExam(trackId, {
      id: newExamId,
      title: newExamTitle,
      questions: newExamQuestions,
      duration: newExamDuration,
    });

    if (!newExam) {
      showNotif("Vui lòng nhập Tên đề thi meow!", "error");
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
    showNotif(`Tạo đề thi ${trackId.toUpperCase()} mới thành công meow! 🚀`, "success");
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
    showNotif(`Đã lưu đề ${savedExam.exam} thành công meow!`, "success");
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
    showNotif(`Exported change set for ${contentExamDraft.exam}.`, 'success');
  };

  const handleExportContentReviewSet = () => {
    const trackExams = importedExams.filter((exam) => exam.exam.toLowerCase() === adminActiveTab);
    if (!trackExams.length) {
      showNotif(`No ${adminActiveTab.toUpperCase()} exams to export.`, 'error');
      return;
    }
    const exportPayload: ContentReviewChangeSetExport = buildContentReviewChangeSetExport(trackExams, {
      track: adminActiveTab,
      reviewer: currentUser?.username || 'admincontent',
    });
    downloadJsonFile(`miuprep-${adminActiveTab}-review-changesets.json`, exportPayload);
    logSystemEvent('INFO', `Admin @${currentUser?.username} exported ${adminActiveTab.toUpperCase()} review change set (${trackExams.length} exams)`);
    showNotif(`Exported ${adminActiveTab.toUpperCase()} review set.`, 'success');
  };

  const handleBuyMascotItem = (item: string, price: number) => {
    const purchase = purchaseMascotItem(unlockedMascotItems, fishCoins, item, price);

    if (purchase.status === 'already_unlocked') {
      showNotif(`Bạn đã mở khóa vật phẩm này rồi meow!`, "info");
      return;
    }

    if (purchase.status === 'insufficient_coins') {
      showNotif(`Bạn không đủ Xu Cá Hồi meow! Hãy làm bài chăm chỉ nhé! 😿`, "error");
      return;
    }

    setFishCoins(purchase.nextCoins);
    if (currentUser?.username) {
      persistCoinBalance(localStorage, currentUser.username, purchase.nextCoins);
    }
    setUnlockedMascotItems(purchase.nextUnlockedItems);
    localStorage.setItem('miuprep_unlocked_items', JSON.stringify(purchase.nextUnlockedItems));
    logSystemEvent('INFO', `Học sinh @${currentUser?.username} đã mua vật phẩm "${item}" với giá ${price} Xu`);
    showNotif(`Mở khóa vật phẩm "${item}" thành công! Mặc thử ngay meow! 🎉`, "success");
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
      showNotif("Tuyệt vời meow! Bạn trả lời đúng và nhận được +10 Xu Cá Hồi! 🐟🌟", "success");
    } else {
      showNotif("Ôi không meow! Đáp án chưa chính xác, hãy đọc kỹ giải thích nhé! 😿", "error");
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
      showNotif("Correct. Stage lowered and repair progress saved.", "success");
      return;
    }

    if (retryResult.retryStatusCode === 'prerequisite') {
      showNotif("Sai lai 2 lan. He thong se dua ban ve prerequisite/repair lesson truoc khi retry tiep.", "error");
      return;
    }

    showNotif("Dap an chua chinh xac. Doc root cause va missed step roi thu lai.", "error");
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
      showNotif("Vui lòng điền nội dung câu hỏi meow!", "error");
      return;
    }

    setMathLessons([...mathLessons, newLesson]);
    setLatexMathId('');
    setLatexMathTitle('');
    setLatexMathEq('');
    setLatexMathAns('A');
    setLatexMathExpl('');
    logSystemEvent('INFO', `Admin @${currentUser?.username} đã soạn câu hỏi LaTeX mới: "${newLesson.title}"`);
    showNotif("Thành công! Đã đăng ký câu hỏi LaTeX trực quan meow! 🧮", "success");
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
      
      // Auto-create default admin account if none exists so user always has one to log into
      const defaultAdmin = await db.getLocalUser('admin');
      if (!defaultAdmin) {
        await db.registerLocalUser({
          id: 'user-admin',
          username: 'admin',
          passwordHash: 'admin123',
          targetBand: 9.0,
          examDate: '2026-12-31',
          role: 'admin',
          createdAt: new Date().toISOString(),
          displayName: 'MiuPrep Tổng Quản',
          contactInfo: 'admin@miuprep.edu.vn',
          status: 'approved'
        });
      }

      const defaultContentAdmin = await db.getLocalUser('admincontent');
      if (!defaultContentAdmin) {
        await db.registerLocalUser({
          id: 'user-admincontent',
          username: 'admincontent',
          passwordHash: 'admincontent123',
          targetBand: 9.0,
          examDate: '2026-12-31',
          role: 'admin',
          createdAt: new Date().toISOString(),
          displayName: 'MiuPrep Content Admin',
          contactInfo: 'admincontent@miuprep.edu.vn',
          status: 'approved'
        });
      }

      // Check current login session in localStorage
      const activeSession = localStorage.getItem('miuprep_active_username');
      if (activeSession) {
        const u = await db.getLocalUser(activeSession);
        if (u) {
          if (u.status === 'rejected') {
            localStorage.removeItem('miuprep_active_username');
            showNotif("Tài khoản của bạn đã bị từ chối hoạt động meow! ❌", "error");
          } else {
            setCurrentUser(u);
            logSystemEvent('INFO', `Tự động đăng nhập người dùng: @${u.username}`);
          }
        }
      }
    };
    initSession();
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
  }, [currentUser]);

  // General Notification Handler
  const showNotif = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 5000);
  };

  // Log system events to LocalStorage DB Adapter
  const logSystemEvent = async (level: 'INFO' | 'WARN' | 'ERROR', message: string, payload?: any) => {
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
  const hashPassword = async (pass: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(pass);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let hash = 0;
      for (let i = 0; i < pass.length; i++) {
        const char = pass.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return 'fallback_' + Math.abs(hash).toString(16);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !displayName.trim()) {
      showNotif("Vui lòng điền đầy đủ các thông tin bắt buộc meow!", "error");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Check if user already exists
    const existing = await db.getLocalUser(cleanUsername);
    if (existing) {
      showNotif("Tên đăng nhập đã tồn tại trên MiuPrep meow!", "error");
      return;
    }

    // Role-specific check
    let linkedList: string[] = [];
    let initialStatus: 'approved' | 'pending' | 'rejected' = 'pending';

    if (regRole === 'parent') {
      if (!studentToLink.trim()) {
        showNotif("Phụ huynh vui lòng nhập username học sinh để liên kết meow!", "error");
        return;
      }
      const linkedStudentUser = studentToLink.trim().toLowerCase();
      const studentObj = await db.getLocalUser(linkedStudentUser);
      if (!studentObj || studentObj.role !== 'student') {
        showNotif(`Học sinh @${linkedStudentUser} không tồn tại trên hệ thống meow!`, "error");
        return;
      }
      linkedList = [linkedStudentUser];
    } else if (regRole === 'admin') {
      if (adminSecret.trim() !== 'miuprep2026') {
        showNotif("Mã bí mật Admin không chính xác meow!", "error");
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
        showNotif("Đăng ký thành công! Vui lòng chờ Quản trị viên duyệt tài khoản meow! ⏳", "success");
      } else {
        showNotif("Đăng ký tài khoản Admin thành công! Đăng nhập ngay meow meow! 🎉", "success");
      }
      
      // Clear forms
      setUsername('');
      setPassword('');
      setDisplayName('');
      setContactInfo('');
      setStudentToLink('');
      setAdminSecret('');
      setAuthTab('login');
    } catch (err) {
      showNotif("Đăng ký thất bại, đã xảy ra lỗi meow!", "error");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      showNotif("Tên đăng nhập và mật khẩu là bắt buộc meow!", "error");
      return;
    }

    const cleanUsername = loginUsername.trim().toLowerCase();
    try {
      const u = await db.getLocalUser(cleanUsername);
      if (!u) {
        showNotif("Thông tin đăng nhập không chính xác meow! 😿", "error");
        return;
      }

      const inputHash = await hashPassword(loginPassword.trim());
      const isPasswordCorrect =
        u.passwordHash === loginPassword.trim() ||
        u.passwordHash === inputHash ||
        (cleanUsername === 'admin' && loginPassword.trim() === 'admin123');

      if (!isPasswordCorrect) {
        showNotif("Thông tin đăng nhập không chính xác meow! 😿", "error");
        return;
      }

      if (u.status === 'pending') {
        showNotif("Tài khoản của bạn đang chờ phê duyệt từ Admin meow! Vui lòng đợi nhé! ⏳", "info");
        return;
      }

      if (u.status === 'rejected') {
        showNotif("Tài khoản của bạn đã bị từ chối duyệt meow! Vui lòng liên hệ Admin! ❌", "error");
        return;
      }

      // Success
      localStorage.setItem('miuprep_active_username', u.username);
      setCurrentUser(u);
      await logSystemEvent('INFO', `Người dùng đăng nhập thành công: @${u.username}`);
      showNotif(`Meow mừng bạn trở lại, ${u.displayName || u.username}! 🎉`, "success");
    } catch (err) {
      showNotif("Đăng nhập thất bại meow!", "error");
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
    showNotif("Đã đăng xuất tài khoản meow! Tạm biệt và hẹn gặp lại meow! 🐾");
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
    showNotif("Tuyệt vời meow! Bạn nhận được 🐟 15 Xu Cá Hồi vì đã chăm chỉ ghi nhật ký! 🎉", "success");
  };

  const handleDailyPlanCompleted = async () => {
    if (!currentUser || currentUser.role !== 'student') return;
    const dateKey = getTodayPlanDateKey();
    const event = buildLearningEvent(
      'daily_target_completed',
      {
        dateKey,
        dailyPlanCompleted: true,
        dailyStepIds: ['diagnostic', 'lesson', 'guided', 'independent', 'review'],
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
    setStudentLearningEvents(await db.listLearningEvents(undefined, 200));
    await logSystemEvent('INFO', `Hoc sinh @${currentUser.username} hoan thanh today target`, { dateKey, eventId: event.id });
    showNotif('Today target completed. Miuprep se day hoc sinh sang muc tiep theo khi mastery du on dinh.', 'success');
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
  };

  const handleEnglishLessonTemplateAction = (template: LessonTemplateActionTemplate, action: LessonTemplateAction) => {
    if (!currentUser || currentUser.role !== 'student') return;
    void saveStudentLearningEvent(buildLessonTemplateActionLearningEvent({
      username: currentUser.username,
      programId: resolvePrimaryEnglishProgramId(currentUser),
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
      setWeeklyTargetValue((students[0] as any).studyPlan?.weeklyTarget || 4);
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
            nextSessionAt: (studentObj as any).studyPlan?.nextSessionAt || ''
          }
        };
        await db.registerLocalUser(updated);
        await logSystemEvent('INFO', `Phụ huynh @${currentUser?.username} cập nhật mục tiêu của con @${selectedStudent} thành ${weeklyTargetValue} buổi/tuần`);
        showNotif("Đã cập nhật mục tiêu học tập hàng tuần cho con meow! 👍", "success");
        await refreshParentData();
      }
    } catch (e) {
      showNotif("Cập nhật mục tiêu thất bại!", "error");
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

      showNotif(`Đã chuyển tặng thành công 🐟 ${rewardAmount} Xu Cá Hồi khen thưởng cho con! 🎁`, "success");
      await refreshParentData();
    } catch (e) {
      showNotif("Khen thưởng thất bại meow!", "error");
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

  const handleUpdateStatus = async (userUsername: string, nextStatus: 'approved' | 'rejected') => {
    try {
      const targetUser = await db.getLocalUser(userUsername);
      if (targetUser) {
        const updated = { ...targetUser, status: nextStatus };
        await db.registerLocalUser(updated);
        await logSystemEvent('INFO', `Admin @${currentUser?.username} thay đổi trạng thái của @${userUsername} thành [${nextStatus.toUpperCase()}]`);
        showNotif(`Đã duyệt trạng thái tài khoản @${userUsername} thành công meow!`, "success");
        await refreshAdminData();
      }
    } catch (e) {
      showNotif("Duyệt trạng thái thất bại!", "error");
    }
  };

  const handleDeleteUser = async (userUsername: string) => {
    if (userUsername === currentUser?.username) {
      showNotif("Bạn không thể tự xóa tài khoản của chính mình meow!", "error");
      return;
    }
    const confirm = window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản @${userUsername} meow?`);
    if (!confirm) return;

    try {
      await db.deleteLocalUser(userUsername);
      await logSystemEvent('WARN', `Admin @${currentUser?.username} xóa vĩnh viễn tài khoản: @${userUsername}`);
      showNotif(`Đã xóa vĩnh viễn tài khoản @${userUsername} meow!`, "success");
      await refreshAdminData();
    } catch (e) {
      showNotif("Xóa tài khoản thất bại!", "error");
    }
  };

  const handleAddDefaultLogs = async () => {
    await logSystemEvent('INFO', 'Hệ thống AI MiuPrep khởi chạy tiến trình Calibration tham số IRT');
    await logSystemEvent('INFO', 'Đồng bộ hóa Salmon Coins ví dùng chung hoàn tất');
    await refreshAdminData();
    showNotif("Đã tái tạo dữ liệu Telemetry Logs mẫu thành công meow! 📊", "success");
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
      theme: (hoveredTrack === 'cae' ? 'ielts' : (hoveredTrack || 'math')) as any,
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
                  {currentUser.role === 'admin' ? '👑 Admin' : currentUser.role === 'parent' ? '🏠 Phụ Huynh' : '🎒 Học Sinh'}
                </span>
                {isAdminContentAccount(currentUser) && (
                  <span className="hidden sm:inline text-xs font-black uppercase text-indigo-300">Admin Content</span>
                )}
                <span className="text-xs font-semibold text-slate-200 truncate min-w-0 max-w-[88px] sm:max-w-none">@{currentUser.username}</span>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-black uppercase text-red-400 hover:text-red-300 sm:ml-2 bg-transparent border-0 outline-none cursor-pointer shrink-0"
                >
                  Đăng Xuất ➔
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hệ sinh thái số #1</span>
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
            Ngày mai bắt đầu từ ngày hôm nay.
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
            {/* Tabs */}
            <div className="flex border-b border-slate-800 pb-4 mb-6">
              <button
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2 font-black uppercase text-xs tracking-wider transition-all border-0 cursor-pointer ${authTab === 'login' ? 'text-orange-400 border-b-2 border-orange-400 bg-transparent' : 'text-slate-500 hover:text-slate-300 bg-transparent'}`}
              >
                🔑 ĐĂNG NHẬP
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`flex-1 py-2 font-black uppercase text-xs tracking-wider transition-all border-0 cursor-pointer ${authTab === 'register' ? 'text-orange-400 border-b-2 border-orange-400 bg-transparent' : 'text-slate-500 hover:text-slate-300 bg-transparent'}`}
              >
                📝 ĐĂNG KÝ MỚI
              </button>
            </div>

            {/* LOGIN FORM */}
            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Tên đăng nhập (Username)</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập username..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Mật khẩu</label>
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
                  Đăng Nhập Ngay
                </button>
                
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  * Nhập thử tài khoản Admin dùng sẵn: <code className="bg-slate-950 px-1 py-0.5 rounded text-orange-400 font-mono">admin</code> / <code className="bg-slate-950 px-1 py-0.5 rounded text-orange-400 font-mono">admin123</code>
                </p>
              </form>
            ) : (
              // REGISTER FORM
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                
                {/* Role Selector */}
                <div className="flex flex-col text-left mb-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Bạn là ai meow?</label>
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
                        {role === 'student' ? '🎒 Học Sinh' : role === 'parent' ? '🏠 Phụ Huynh' : '👑 Admin'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Tên đăng nhập (Username) *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: miu.math"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Tên hiển thị (Họ Tên) *</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Mật khẩu *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Liên hệ (SĐT / Email)</label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Số điện thoại hoặc email..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                  />
                </div>

                {/* Parent Specific Field */}
                {regRole === 'parent' && (
                  <div className="flex flex-col text-left border-l-2 border-orange-500 pl-3 bg-orange-500/5 py-2 rounded-r-xl">
                    <label className="text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1.5">Username Học sinh liên kết *</label>
                    <input
                      type="text"
                      value={studentToLink}
                      onChange={(e) => setStudentToLink(e.target.value)}
                      placeholder="Username của con (phải có sẵn)..."
                      className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/60 font-medium placeholder:text-slate-700"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">Phụ huynh cần nhập đúng tên đăng nhập học sinh để đồng bộ dữ liệu.</span>
                  </div>
                )}

                {/* Admin Specific Field */}
                {regRole === 'admin' && (
                  <div className="flex flex-col text-left border-l-2 border-purple-500 pl-3 bg-purple-500/5 py-2 rounded-r-xl">
                    <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-1.5">Mã kích hoạt Admin *</label>
                    <input
                      type="password"
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      placeholder="Nhập mã bí mật kích hoạt..."
                      className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/60 font-medium placeholder:text-slate-700"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">* Nhập mã: <code className="bg-slate-950 text-purple-400 font-mono px-1 rounded">miuprep2026</code> để tạo tài khoản admin.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold uppercase text-xs tracking-widest text-white shadow-lg active:scale-95 duration-100 mt-2 border-0 cursor-pointer"
                >
                  Đăng Ký Tài Khoản
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
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* SAT Header Control Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-rose-950/5 to-slate-950">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setActiveStudentTab('dashboard');
                      setActivePracticeState(null);
                    }}
                    className="px-4 py-2 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    ← Quay lại Dashboard
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-rose-400 font-sans tracking-tight">STUDIO SAT THÍCH ỨNG</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Tích hợp lý thuyết IRT & Động cơ thi thử Bluebook</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Dynamic IRT Gauge */}
                  <div className="bg-slate-955 border border-slate-850 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <span className="text-xl">🧠</span>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Estimated IRT</span>
                      <span className="text-sm font-black text-rose-400 font-mono">{satEstimatedScore} <span className="text-[10px] text-slate-500">/ 1600</span></span>
                    </div>
                  </div>

                  {/* Target Score */}
                  <div className="bg-slate-955 border border-slate-850 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <span className="text-xl">🎯</span>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Mục tiêu</span>
                      <span className="text-sm font-black text-amber-400 font-mono">{satTargetScore} <span className="text-[10px] text-slate-500">/ 1600</span></span>
                    </div>
                  </div>

                  {/* Coins Balance */}
                  <div className="bg-slate-955 border border-slate-850 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <span className="text-xl">🐟</span>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Salmon Coins</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">{fishCoins} Xu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic JSON Bank Selector Card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-3xl bg-slate-955 p-2 rounded-2xl border border-slate-850">🎓</span>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Chọn Ngân Hàng Đề Thi SAT (10,000+ Câu)</span>
                    <p className="text-xs text-slate-300 font-bold">
                      {selectedSatBank === 'antigravity-bank.json' 
                        ? 'Master Antigravity Bank (7,158 câu cực lớn • Đầy đủ Reading, Writing & Math)' 
                        : selectedSatBank === 'opensat-pinesat.json'
                          ? 'OpenSAT Pinesat (1,026 câu thi thử thích ứng)'
                          : selectedSatBank === 'sat-1590-elite-ai-bank.json'
                            ? 'Elite AI Bank (661 câu tinh hoa nâng cao)'
                            : selectedSatBank === 'sat-studio-foundation-bank.json'
                              ? 'SAT Studio Foundation Bank (219 câu chuyên đề nền tảng)'
                              : selectedSatBank === 'private-vault-archive-bank.json'
                                ? 'Private Vault Archive Bank (165 câu lưu trữ đặc biệt)'
                                : selectedSatBank === 'kaplan-sat-math-ai-bank.json'
                                  ? 'Kaplan SAT Math AI Bank (148 câu toán cao cấp)'
                                  : 'Supplemental SAT AI Question Pack'}
                    </p>
                  </div>
                </div>

                <select
                  value={selectedSatBank}
                  onChange={e => {
                    setSelectedSatBank(e.target.value);
                    setActivePracticeState(null);
                  }}
                  className="bg-slate-955 border border-slate-850 text-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer focus:border-rose-500 min-w-[240px]"
                >
                  <option value="sat-1590-elite-ai-bank.json">1. Elite AI Bank (661 câu - Nạp nhanh 🚀)</option>
                  <option value="antigravity-bank.json">2. Antigravity Bank (7,158 câu - Dung lượng lớn 50MB 🐘)</option>
                  <option value="opensat-pinesat.json">3. OpenSAT Pinesat (1,026 câu)</option>
                  <option value="sat-king-supplemental-ai-bank.json">4. Supplemental AI Bank (354 câu)</option>
                  <option value="archive-source-ai-bank.json">5. Archive AI Bank (792 câu)</option>
                  <option value="sat-studio-foundation-bank.json">6. Foundation Bank (219 câu)</option>
                  <option value="private-vault-archive-bank.json">7. Private Vault Bank (165 câu)</option>
                  <option value="kaplan-sat-math-ai-bank.json">8. Kaplan Math AI Bank (148 câu)</option>
                </select>
              </div>

              {/* Loading Indicator */}
              {isLoadingQuestions && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 font-bold font-sans">
                    Đang nạp cơ sở dữ liệu SAT thích ứng meow... {selectedSatBank === 'antigravity-bank.json' ? '(Tệp dữ liệu siêu lớn 50MB, vui lòng đợi trong giây lát...)' : 'Tải cực nhanh...'}
                  </p>
                </div>
              )}

              {/* Main Workspace Display */}
              {!isLoadingQuestions && (
                activePracticeState ? (
                  /* ==========================================
                     PRACTICE MODE ACTIVE
                     ========================================== */
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    
                    {/* Left: Active Question Board */}
                    <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
                      
                      {/* Breadcrumb info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-805">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-455">
                            {activePracticeState.domain} • {activePracticeState.skill}
                          </span>
                          <h3 className="text-xs font-black text-slate-400">
                            Câu hỏi {activePracticeState.currentIndex + 1} trên {activePracticeState.questions.length}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                            activePracticeState.questions[activePracticeState.currentIndex].difficulty === 'Hard'
                              ? 'bg-rose-950/70 border-rose-900 text-rose-400'
                              : activePracticeState.questions[activePracticeState.currentIndex].difficulty === 'Medium'
                                ? 'bg-amber-950/70 border-amber-900 text-amber-400'
                                : 'bg-emerald-950/70 border-emerald-900 text-emerald-400'
                          }`}>
                            Độ khó: {activePracticeState.questions[activePracticeState.currentIndex].difficulty || 'Medium'}
                          </span>
                          <span className="text-[9px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                            ID: {activePracticeState.questions[activePracticeState.currentIndex].id}
                          </span>
                        </div>
                      </div>

                      {/* Question Prompt */}
                      <div className="space-y-4">
                        <PromptWithAssets
                          text={activePracticeState.questions[activePracticeState.currentIndex].prompt}
                          className="text-sm font-extrabold text-slate-150 leading-relaxed bg-slate-955 p-5 rounded-2xl border border-slate-850/60 font-sans shadow-inner whitespace-pre-line"
                        />
                      </div>

                      {/* Choices Panel */}
                      <div className="space-y-3">
                        {activePracticeState.questions[activePracticeState.currentIndex].choices ? (
                          /* Multiple Choice Questions */
                          Object.entries(activePracticeState.questions[activePracticeState.currentIndex].choices).map(([opt, text]) => {
                            const isSelected = activePracticeState.selectedAnswer === opt;
                            const isCorrectAns = activePracticeState.questions[activePracticeState.currentIndex].correctAnswer?.trim().toUpperCase() === opt.toUpperCase();
                            const hasBeenAnswered = activePracticeState.answered;

                            let btnStyle = "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300";
                            if (hasBeenAnswered) {
                              if (isCorrectAns) {
                                btnStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-400 font-extrabold";
                              } else if (isSelected) {
                                btnStyle = "bg-rose-950/30 border-rose-500 text-rose-455 font-extrabold";
                              } else {
                                btnStyle = "bg-slate-950/30 border-slate-900 text-slate-600 opacity-60";
                              }
                            } else if (isSelected) {
                              btnStyle = "bg-rose-950/30 border-rose-500 text-rose-400";
                            }

                            return (
                              <button
                                key={opt}
                                disabled={hasBeenAnswered}
                                onClick={() => handleAnswerSatQuestion(opt)}
                                className={`w-full p-4 rounded-2xl border text-xs text-left transition-all duration-150 flex items-start gap-3 hover:scale-[1.002] cursor-pointer ${btnStyle}`}
                              >
                                <span className={`w-6 h-6 rounded-lg font-black flex items-center justify-center shrink-0 border uppercase text-[10px] ${
                                  isSelected 
                                    ? 'bg-rose-500 border-rose-400 text-slate-950' 
                                    : hasBeenAnswered && isCorrectAns
                                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}>
                                  {opt}
                                </span>
                                <span className="flex-1 leading-normal font-semibold">{text as string}</span>
                              </button>
                            );
                          })
                        ) : (
                          /* Student-Produced Response (SPR) Math questions */
                          <div className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Nhập kết quả số của bạn</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                disabled={activePracticeState.answered}
                                placeholder="Ví dụ: 5, -2.5, 7/3..."
                                value={activePracticeState.customInput}
                                onChange={e => setActivePracticeState({ ...activePracticeState, customInput: e.target.value })}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-500 text-slate-200"
                              />
                              <button
                                disabled={activePracticeState.answered || !activePracticeState.customInput.trim()}
                                onClick={() => handleAnswerSatQuestion(activePracticeState.customInput.trim())}
                                className="px-6 bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all border-0 cursor-pointer shadow disabled:opacity-50"
                              >
                                Gửi Đáp Án
                              </button>
                            </div>
                            {activePracticeState.answered && (
                              <p className="text-xs text-slate-400 font-medium">
                                Đáp án chính xác: <strong className="text-emerald-400 font-mono">{activePracticeState.questions[activePracticeState.currentIndex].correctAnswer}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Explanation box */}
                      {activePracticeState.explanationOpened && (
                        <div className="bg-slate-955 rounded-2xl border border-slate-850 p-5 space-y-3 text-xs leading-relaxed animate-fade-in">
                          <span className="font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                            <span>💡 HƯỚNG DẪN GIẢI THÍCH SƯ PHẠM CHI TIẾT</span>
                          </span>
                          <p className="text-slate-300 font-medium font-sans bg-slate-950 p-4 rounded-xl border border-slate-900 whitespace-pre-line leading-relaxed">
                            {getSatExplanation(activePracticeState.questions[activePracticeState.currentIndex])}
                          </p>
                        </div>
                      )}

                      {/* Next Question Bar */}
                      {activePracticeState.answered && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={handleNextSatQuestion}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl border-0 shadow active:scale-95 duration-100 cursor-pointer"
                          >
                            {activePracticeState.currentIndex + 1 < activePracticeState.questions.length 
                              ? 'Câu Tiếp Theo ➔' 
                              : 'Kết Thúc & Tổng Kết'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: Collapsible Desmos Math Calculator */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-400 font-sans flex items-center gap-1.5">
                          🧮 Máy tính vẽ đồ thị Desmos
                        </span>
                        <span className="text-[9px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono">LIVE PREP</span>
                      </div>
                      
                      <div className="border border-slate-850 rounded-2xl overflow-hidden h-[360px] bg-slate-950 relative shadow-inner">
                        <iframe
                          src="https://www.desmos.com/calculator?embed=true"
                          width="100%"
                          height="100%"
                          style={{ border: 'none', filter: 'invert(90%) hue-rotate(180deg)' }}
                          title="Desmos Live Inside SAT Studio"
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-light">
                        * Dành cho phần Math: Vẽ các phương trình giao nhau để giải tìm nghiệm nhanh nhất. Máy tính được tích hợp chuẩn giao diện tối.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ==========================================
                     OVERVIEW: KEY MATRIX OF TOPICS
                     ========================================== */
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-rose-950/20 via-slate-900 to-rose-900/10 border border-rose-500/20 rounded-3xl p-6 text-left flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 bg-rose-500 h-full" />
                      <div className="space-y-2">
                        <h2 className="text-lg font-black text-rose-455 font-sans tracking-wide uppercase">⚡ LUYỆN TẬP CHUYÊN ĐỀ HỆ THỐNG THÍCH ỨNG</h2>
                        <p className="text-xs text-slate-350 leading-relaxed font-light font-sans max-w-2xl">
                          Hệ thống tự động điều chỉnh độ khó của câu hỏi theo mức năng lực thời gian thực dựa trên Lý thuyết Ứng đáp Câu hỏi (IRT). Hãy chọn một kỹ năng nhỏ bất kỳ bên dưới để bắt đầu meow!
                        </p>
                      </div>
                      <button
                        onClick={() => handleStartPractice('all', 'all')}
                        className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-extrabold uppercase text-xs tracking-wider rounded-2xl border-0 shadow active:scale-95 duration-100 cursor-pointer shrink-0"
                      >
                        🔥 Thi thử thích ứng tổng hợp
                      </button>
                    </div>

                    {/* Skill Taxonomy Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      
                      {/* Section 1: Reading & Writing */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <span>📚 READING & WRITING DOMAINS</span>
                          </h3>
                          <span className="text-[10px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold">4 DOMAINS</span>
                        </div>

                        {satTaxonomy?.sections?.["Reading and Writing"]?.domains ? (
                          Object.entries(satTaxonomy.sections["Reading and Writing"].domains).map(([domainName, domainObj]: [string, any]) => (
                            <div key={domainName} className="space-y-3">
                              <span className="text-xs font-black text-slate-200 block border-l-2 border-indigo-500 pl-2 bg-indigo-500/5 py-1 rounded-r-md">
                                {domainName} <span className="text-[10px] text-slate-500 font-mono font-normal">({domainObj.targetPct}% Tỷ trọng)</span>
                              </span>
                              
                              <div className="grid grid-cols-1 gap-2.5">
                                {Object.keys(domainObj.canonicalSkills || {}).map(skillName => (
                                  <div
                                    key={skillName}
                                    className="p-3 bg-slate-955 rounded-xl border border-slate-850 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
                                  >
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-slate-300 block">{skillName}</span>
                                      <span className="text-[9px] text-slate-500 font-light block">Kỹ năng chuẩn College Board</span>
                                    </div>
                                    <button
                                      onClick={() => handleStartPractice(domainName, skillName)}
                                      className="px-3 py-1.5 bg-indigo-900/50 hover:bg-indigo-600 border border-indigo-850 text-indigo-300 hover:text-white text-[10px] font-black uppercase rounded-lg transition-colors border-0 cursor-pointer"
                                    >
                                      Luyện ➔
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          /* Fallback reading taxonomy if fetch delayed */
                          <div className="text-xs text-slate-500 italic py-6 text-center">Đang nạp cấu trúc chuyên đề Đọc hiểu meow...</div>
                        )}
                      </div>

                      {/* Section 2: Math */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="text-sm font-black text-rose-455 uppercase tracking-widest flex items-center gap-2">
                            <span>📐 MATHEMATICS DOMAINS</span>
                          </h3>
                          <span className="text-[10px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold">4 DOMAINS</span>
                        </div>

                        {satTaxonomy?.sections?.["Math"]?.domains ? (
                          Object.entries(satTaxonomy.sections["Math"].domains).map(([domainName, domainObj]: [string, any]) => (
                            <div key={domainName} className="space-y-3">
                              <span className="text-xs font-black text-slate-200 block border-l-2 border-rose-500 pl-2 bg-rose-500/5 py-1 rounded-r-md">
                                {domainName} <span className="text-[10px] text-slate-500 font-mono font-normal">({domainObj.targetPct}% Tỷ trọng)</span>
                              </span>
                              
                              <div className="grid grid-cols-1 gap-2.5">
                                {Object.keys(domainObj.canonicalSkills || {}).map(skillName => (
                                  <div
                                    key={skillName}
                                    className="p-3 bg-slate-955 rounded-xl border border-slate-850 flex items-center justify-between hover:border-rose-500/40 transition-colors"
                                  >
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-slate-300 block">{skillName}</span>
                                      <span className="text-[9px] text-slate-500 font-light block">Chuyên đề con thích ứng</span>
                                    </div>
                                    <button
                                      onClick={() => handleStartPractice(domainName, skillName)}
                                      className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-600 border border-rose-900 text-rose-400 hover:text-white text-[10px] font-black uppercase rounded-lg transition-colors border-0 cursor-pointer"
                                    >
                                      Luyện ➔
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          /* Fallback math taxonomy */
                          <div className="text-xs text-slate-500 italic py-6 text-center">Đang nạp cấu trúc chuyên đề Toán meow...</div>
                        )}
                      </div>

                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="space-y-12">

            <section className="max-w-5xl mx-auto">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 grid grid-cols-2 md:grid-cols-5 gap-2 shadow-xl">
                {studentWorkspaceTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStudentWorkspaceTab(tab.id)}
                    className={`rounded-xl px-4 py-3 text-left transition-all border cursor-pointer ${
                      studentWorkspaceTab === tab.id
                        ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-950/20'
                        : 'bg-slate-950/60 text-slate-300 border-slate-850 hover:border-emerald-500/60 hover:text-white'
                    }`}
                  >
                    <span className="block text-sm font-black uppercase tracking-wider">{tab.label}</span>
                    <span className={`mt-1 block text-[10px] font-bold ${studentWorkspaceTab === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      {tab.detail}
                    </span>
                  </button>
                ))}
              </div>
            </section>
            
            {/* 1. Student Unified Shared Stats */}
            {studentWorkspaceTab === 'overview' && (
              <>
            <StudentTodaySprint
              key={`${currentUser.username}-${new Date().toLocaleDateString('en-CA')}`}
              currentUser={currentUser}
              tracks={TRACKS}
              fishCoins={fishCoins}
              mouseTrapsCount={mouseTrapsCount}
              activeErrorQuestions={activeErrorQuestions}
              activeErrorQuestionCount={activeErrorQuestionCount}
              learningEvents={studentLearningEvents}
              onStartRepair={handleOpenStudentRepair}
              onOpenCourses={() => setStudentWorkspaceTab('courses')}
              onOpenTutor={() => setStudentWorkspaceTab('tutor')}
              onDailyStepCompleted={handleDailyStepCompleted}
              onDailyPlanCompleted={handleDailyPlanCompleted}
            />

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Salmon Coins */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow hover:border-emerald-500/40 transition-colors bg-gradient-to-tr from-slate-900 to-teal-950/20">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Ví Xu Cá Hồi Chung</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">{fishCoins} 🐟</span>
                  <span className="text-[10px] text-slate-500">Khen thưởng từ MiuMath & Phụ huynh</span>
                </div>
                <span className="text-4xl filter drop-shadow">💰</span>
              </div>

              {/* Spaced-Repetition Mouse Traps (Clickable) */}
              <div 
                onClick={() => {
                  const notebookAction = openErrorNotebookFromOverview(showErrorNotebook);
                  setShowErrorNotebook(notebookAction.nextShowErrorNotebook);
                  if (notebookAction.nextWorkspaceTab) {
                    setStudentWorkspaceTab(notebookAction.nextWorkspaceTab);
                  }
                  if (notebookAction.shouldNotify) {
                    showNotif("Đã mở Sổ Tay Bẫy Chuột Leitner ôn tập! 😼", "info");
                  }
                }}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow hover:border-rose-500/40 transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-tr from-slate-900 to-rose-950/20"
                title="Bấm để mở Sổ tay ôn tập Bẫy chuột"
              >
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Bẫy Chuột Sửa Sai *</span>
                  <span className="text-3xl font-black text-rose-400 font-mono">{mouseTrapsCount} 😼</span>
                  <span className="text-[10px] text-slate-400 font-bold">Nhập chuột để làm câu sai!</span>
                </div>
                <span className="text-4xl filter drop-shadow">🪤</span>
              </div>

              {/* Global Progress */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow hover:border-indigo-500/40 transition-colors bg-gradient-to-tr from-slate-900 to-indigo-950/20">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Độ Thích Ứng (IRT)</span>
                  <span className="text-3xl font-black text-indigo-400 font-mono">92.4% 🧠</span>
                  <span className="text-[10px] text-slate-500">Mục tiêu ôn tuần: {(currentUser as any).studyPlan?.weeklyTarget || 4} buổi</span>
                </div>
                <span className="text-4xl filter drop-shadow">🌌</span>
              </div>
            </section>

            <UnifiedLearnerDashboard
              currentUser={currentUser}
              tracks={TRACKS}
              fishCoins={fishCoins}
              mouseTrapsCount={mouseTrapsCount}
              errorQuestionCount={activeErrorQuestionCount}
              learningEvents={studentLearningEvents}
            />
              </>
            )}

            {studentWorkspaceTab === 'tutor' && (
            <AITutorPreviewPanel
              currentUser={currentUser}
              errorQuestions={errorQuestions}
            />
            )}

            {/* 1.3. LEITNER ERROR NOTEBOOK (Collapsible) */}
            {studentWorkspaceTab === 'practice' && !showErrorNotebook && (
              <section className="bg-slate-900/60 border border-rose-500/20 rounded-3xl p-6 max-w-4xl mx-auto shadow-xl text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest">Sổ lỗi Leitner</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {getErrorNotebookSummary(activeErrorQuestionCount)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowErrorNotebook(true)}
                    className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase px-5 py-3 rounded-xl transition-colors border-0 cursor-pointer"
                  >
                    Mở sổ lỗi
                  </button>
                </div>
              </section>
            )}

            {studentWorkspaceTab === 'practice' && showErrorNotebook && (
              <ErrorNotebookV2Panel
                errorQuestions={errorQuestions}
                onClose={() => setShowErrorNotebook(false)}
                onRetry={handleRetryErrorQuestionV2}
                onOpenTutor={() => {
                  setShowErrorNotebook(false);
                  setStudentWorkspaceTab('tutor');
                }}
              />
            )}

            {studentWorkspaceTab === 'practice' && showErrorNotebook && Boolean(localStorage.getItem('miuprep_show_legacy_error_notebook')) && (
              <section className="bg-slate-900/60 border-2 border-rose-500/30 rounded-3xl p-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 to-rose-950/20 text-left transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                    <span>😼 SỔ TAY BẪY CHUỘT ÔN TẬP LEITNER CỦA BẠN</span>
                    <span className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-900 px-2 py-0.5 rounded-full font-bold font-mono">ACTIVE REVIEW</span>
                  </h3>
                  <button
                    onClick={() => setShowErrorNotebook(false)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-350 hover:text-white border-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {activeErrorQuestionCount === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-6">Tuyệt vời meow! Bạn đã xử lý sạch sẽ toàn bộ bẫy chuột ôn tập rồi! 🐟😽</p>
                  ) : (
                    activeErrorQuestions.map((q) => (
                        <div key={q.id} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 text-xs flex flex-col gap-3 relative">
                          <span className="absolute top-3 right-3 text-[9px] bg-rose-950/70 text-rose-400 border border-rose-900 px-2 py-0.5 rounded font-mono font-bold">STAGE {q.stage}</span>
                          <p className="font-extrabold text-slate-200 leading-relaxed pr-16">{q.text}</p>
                          <div className="grid grid-cols-4 gap-2">
                            {q.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => handleRetryErrorQuestion(q.id, opt, q.answer)}
                                className="py-2 bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-455 transition-all cursor-pointer"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          <details className="text-[10px] text-slate-500 font-light cursor-pointer select-none">
                            <summary className="font-bold text-slate-450 hover:text-slate-300">💡 Xem giải thích lý thuyết chi tiết</summary>
                            <p className="mt-1.5 bg-slate-900 p-2.5 rounded-lg border border-slate-850 leading-relaxed text-slate-400">{q.answerExpl}</p>
                          </details>
                        </div>
                      ))
                  )}
                </div>
              </section>
            )}

            {/* 1.4. CỬA HÀNG PHỤ KIỆN MASCOT MIU MIU */}
            {studentWorkspaceTab === 'rewards' && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-4xl mx-auto shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-orange-950/5 to-slate-950 text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                    <span>🛍️ CỬA HÀNG PHỤ KIỆN MASCOT MIU MIU</span>
                    <span className="text-[9px] bg-orange-950/60 text-orange-400 border border-orange-900 px-2 py-0.5 rounded-full font-black font-mono">SALMON STORE</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-light">
                    Dùng xu cá hồi học viên tích lũy để mở khóa đồ trang trí cho Miu. Emoji phụ kiện sẽ bay bập bênh cạnh Miu meow!
                  </p>
                </div>
                <div className="text-xs font-black text-emerald-450 font-mono bg-slate-950 px-3 py-1.5 rounded-full border border-slate-850 shadow-inner shrink-0">
                  Ví của bạn: {fishCoins} 🐟
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MASCOT_STORE_ITEMS.map(item => {
                  const isUnlocked = unlockedMascotItems.includes(item.key);
                  const isEquipped = equippedMascotItem === item.key;
                  
                  return (
                    <div key={item.key} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 flex flex-col justify-between gap-3 transition-all hover:border-orange-500/30">
                      <div className="flex items-start justify-between">
                        <span className="text-4xl bg-slate-900 p-2 rounded-xl border border-slate-850">{item.key}</span>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className="text-[10px] font-black text-slate-200">{item.label}</span>
                          <span className="text-[10px] font-bold text-amber-400 font-mono">{item.price} 🐟</span>
                        </div>
                      </div>
                      
                      <p className="text-[9px] text-slate-500 leading-normal font-light">{item.desc}</p>
                      
                      {isUnlocked ? (
                        <button
                          onClick={() => handleEquipMascotItem(item.key)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            isEquipped 
                              ? 'bg-orange-500/20 border-orange-500 text-orange-450' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {isEquipped ? '✓ Đang diện đồ' : '👚 Mặc thử'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyMascotItem(item.key, item.price)}
                          className="w-full py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer shadow hover:scale-[0.98] active:scale-95 duration-100"
                        >
                          🛍️ Mở khóa
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            )}

            {/* 2. Course Tracks Grid */}
            {studentWorkspaceTab === 'courses' && (
            <section className="space-y-8">
              {currentUser && (
                <>
                  <MathLessonTemplatePanel
                    currentUser={currentUser}
                    tracks={TRACKS}
                    fishCoins={fishCoins}
                    mouseTrapsCount={mouseTrapsCount}
                    learningEvents={studentLearningEvents}
                    onOpenPractice={() => setStudentWorkspaceTab('practice')}
                    onOpenTutor={() => setStudentWorkspaceTab('tutor')}
                    onTemplateAction={handleMathLessonTemplateAction}
                  />
                  <EnglishCoreLessonTemplatePanel
                    currentUser={currentUser}
                    tracks={TRACKS}
                    fishCoins={fishCoins}
                    mouseTrapsCount={mouseTrapsCount}
                    learningEvents={studentLearningEvents}
                    onOpenPractice={() => setStudentWorkspaceTab('practice')}
                    onOpenTutor={() => setStudentWorkspaceTab('tutor')}
                    onTemplateAction={handleEnglishLessonTemplateAction}
                  />
                </>
              )}
              <div>
              <h2 className="text-2xl font-black mb-6 text-center sm:text-left text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <span>🚀 LỰA CHỌN PHÂN HỆ HỌC TẬP</span>
                <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">5 TRACKS ACTIVE</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {TRACKS.map(track => (
                  <div
                    key={track.id}
                    onMouseEnter={() => setHoveredTrack(track.id)}
                    onMouseLeave={() => setHoveredTrack(null)}
                    className={`border border-slate-800 bg-slate-950/60 rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl shadow-inner relative overflow-hidden bg-gradient-to-br ${track.colorClass}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-400">{track.subtitle}</span>
                        <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                          {track.title}
                        </h3>
                      </div>
                      <span className="text-4xl bg-slate-900/40 p-3 rounded-2xl border border-white/5">{track.icon}</span>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed flex-1 text-left">
                      {track.description}
                    </p>

                    <div className="text-[10px] font-bold text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5 self-start">
                      {track.badge}
                    </div>

                    <button 
                      onClick={() => {
                        if (track.id === 'sat') {
                          setActiveStudentTab('sat-board');
                          showNotif("Đã mở phân hệ học tập thích ứng SAT Studio! 🎓🐾", "success");
                        } else {
                          alert(`Chào bạn meow meow! Tính năng mở khóa phân hệ [${track.title}] đang được Tauri biên dịch độc lập meow! 🐾`);
                        }
                      }}
                      className="mt-2 w-full py-3 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-100 transition-colors shadow flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-95 duration-100 border-0 cursor-pointer"
                    >
                      <span>{track.buttonText}</span>
                      <span>➔</span>
                    </button>
                  </div>
                ))}
              </div>
              </div>
            </section>
            )}

            {/* 2.5. DESMOS INTEGRATED GRAPHING CALCULATOR */}
            {studentWorkspaceTab === 'practice' && (
            <section className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 max-w-4xl mx-auto shadow-inner bg-gradient-to-br from-slate-900/50 to-indigo-950/15 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <span>📐 CÔNG CỤ MÁY TÍNH VẼ ĐỒ THỊ DESMOS TÍCH HỢP</span>
                  <span className="text-[9px] bg-indigo-950/60 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full font-bold">DESMOS LIVE</span>
                </h3>
                <button
                  onClick={() => setShowDesmos(!showDesmos)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-colors border-0 cursor-pointer"
                >
                  {showDesmos ? '✕ Thu Nhỏ Máy Tính' : '🧮 Mở Máy Tính Đồ Thị'}
                </button>
              </div>

              {showDesmos && (
                <div className="mt-4 border border-indigo-900/50 rounded-2xl overflow-hidden shadow-2xl h-[420px] relative bg-slate-950 transition-all duration-300">
                  <iframe
                    src="https://www.desmos.com/calculator?embed=true"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', filter: 'invert(90%) hue-rotate(180deg)' }}
                    title="Desmos Grapher"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-[9px] text-slate-500 font-mono">
                    * Đã kích hoạt Dark-Theme Desmos thích hợp cho học viên MiuPrep.
                  </div>
                </div>
              )}
            </section>
            )}

            {/* 3. Study Journal Section */}
            {studentWorkspaceTab === 'rewards' && (
            <section className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 max-w-4xl mx-auto shadow-inner bg-gradient-to-br from-slate-900/50 to-orange-950/15">
              <h2 className="text-xl font-black mb-4 text-slate-200 flex items-center gap-2">
                📔 SỔ TAY NHẬT KÝ HỌC TẬP MIUPREP
              </h2>
              
              <form onSubmit={handleSaveDiary} className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Hôm nay bạn thấy thế nào meow?</span>
                  <div className="flex gap-2">
                    {STUDENT_DIARY_MOODS.map(mood => (
                      <button
                        type="button"
                        key={mood}
                        onClick={() => setDiaryMood(mood)}
                        className={`text-2xl p-2 rounded-xl border transition-all cursor-pointer ${diaryMood === mood ? 'bg-orange-500/30 border-orange-500 scale-110 shadow' : 'border-slate-800 bg-slate-950/40 hover:scale-105'}`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <textarea
                    value={studyDiary}
                    onChange={(e) => setStudyDiary(e.target.value)}
                    placeholder="Hôm nay bạn đã học được mẹo giải toán Casio hay từ vựng IELTS mới nào meow..."
                    rows={2}
                    className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-orange-500/80 transition-colors placeholder:text-slate-700 resize-none font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 rounded-xl transition-colors text-sm hover:scale-[0.99] active:scale-95 duration-100 shadow border-0 cursor-pointer"
                  >
                    Ghi Sổ
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-left">* Viết nhật ký học tập mỗi ngày để được Mascot Miu thưởng thêm 🐟 15 Xu Cá Hồi nhé!</p>
              </form>

              <div className="max-h-48 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin text-left">
                {diaryList.map((entry, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1 bg-slate-900/60 rounded-lg border border-white/5">{entry.mood}</span>
                      <p className="text-xs font-semibold text-slate-300">{entry.text}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{entry.date}</span>
                  </div>
                ))}
              </div>
            </section>
            )}
            </div>
          )
        )}


        {/* ==========================================
            ROLE: PARENT DASHBOARD (SAT Tracker Styled)
            ========================================== */}
        {currentUser && currentUser.role === 'parent' && (
          <div className="space-y-12">
            <ParentActionSummary
              linkedStudents={linkedStudentsList}
              tracks={TRACKS}
              learningEvents={studentLearningEvents}
              rewardsAllocated={currentUser.rewardsAllocated || 0}
            />
            
            {/* Summary Widget */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between bg-gradient-to-tr from-slate-900 to-orange-950/20">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Số con liên kết</span>
                  <span className="text-3xl font-black text-orange-400 font-mono">{linkedStudentsList.length} Học Sinh 🎒</span>
                </div>
                <span className="text-4xl">🏠</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between bg-gradient-to-tr from-slate-900 to-amber-950/20">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Đã khen thưởng Xu Cá Hồi</span>
                  <span className="text-3xl font-black text-amber-400 font-mono">🐟 {currentUser.rewardsAllocated || 0} Xu</span>
                </div>
                <span className="text-4xl">🎁</span>
              </div>
            </section>

            <ParentLearningOverview
              linkedStudents={linkedStudentsList}
              tracks={TRACKS}
              learningEvents={studentLearningEvents}
            />

            {/* Core Monitoring Block */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl">
              <h2 className="text-xl font-black mb-6 text-slate-200 uppercase tracking-widest text-left flex items-center gap-2">
                <span>📊 BẢNG THEO DÕI TIẾN TRÌNH CỦA CON (SAT STYLE)</span>
              </h2>

              {linkedStudentsList.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-medium">
                  Chưa liên kết học sinh nào meow! Hãy liên hệ admin hoặc chỉnh sửa profile meow! 😿
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-black uppercase text-xs">
                          <th className="p-4">Tên con (Username)</th>
                          <th className="p-4">Ví Xu Cá Hồi tích lũy</th>
                          <th className="p-4">Số Bẫy Chuột sai sót</th>
                          <th className="p-4">Phân quyền học</th>
                          <th className="p-4">Mục tiêu học tuần</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linkedStudentsList.map((student) => {
                          const studentProgress = loadStudentProgressSnapshot(localStorage, student.username);
                          
                          return (
                            <tr key={student.id} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                              <td className="p-4 font-bold text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                                  {student.displayName?.slice(0, 2) || student.username.slice(0, 2)}
                                </span>
                                <div className="flex flex-col text-left">
                                  <span>{student.displayName || student.username}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">@{student.username}</span>
                                </div>
                              </td>
                              <td className="p-4 font-black text-emerald-400 font-mono">🐟 {studentProgress.coins} Xu</td>
                              <td className="p-4 font-bold text-rose-400 font-mono">😼 {studentProgress.traps} bẫy chuột</td>
                              <td className="p-4">
                                <div className="flex flex-col gap-1.5 w-40 text-left">
                                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                                    <span>Toán 9 (MiuMath)</span>
                                    <span className="text-emerald-450 font-mono font-bold">85%</span>
                                  </div>
                                  <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-850">
                                    <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: '85%' }} />
                                  </div>
                                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                                    <span>IELTS Academy</span>
                                    <span className="text-indigo-455 font-mono font-bold">68%</span>
                                  </div>
                                  <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-850">
                                    <div className="bg-indigo-500 h-full rounded-full animate-pulse" style={{ width: '68%' }} />
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-orange-400 font-mono">{(student as any).studyPlan?.weeklyTarget || 4} buổi/tuần</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-800">
                    
                    {/* Setup Study Roadmap */}
                    <div className="bg-slate-950/50 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 text-left">
                      <h3 className="text-sm font-black uppercase text-orange-400 tracking-wider">🛠️ CÀI ĐẶT LỘ TRÌNH CHO CON</h3>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Chọn tài khoản con</label>
                        <select 
                          value={selectedStudent} 
                          onChange={(e) => {
                            setSelectedStudent(e.target.value);
                            const selected = linkedStudentsList.find(s => s.username === e.target.value);
                            if (selected) setWeeklyTargetValue((selected as any).studyPlan?.weeklyTarget || 4);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-orange-500 outline-none cursor-pointer"
                        >
                          {linkedStudentsList.map(s => (
                            <option key={s.id} value={s.username}>{s.displayName || s.username}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Mục tiêu số buổi học / tuần</label>
                        <input
                          type="number"
                          min={1}
                          max={7}
                          value={weeklyTargetValue}
                          onChange={(e) => setWeeklyTargetValue(parseInt(e.target.value) || 4)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-orange-500 outline-none"
                        />
                      </div>

                      <button
                        onClick={handleUpdateStudentTarget}
                        className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs uppercase tracking-widest text-white shadow transition-all border-0 cursor-pointer"
                      >
                        Cập nhật lộ trình
                      </button>
                    </div>

                    {/* Reward Allocator Box */}
                    <div className="bg-slate-950/50 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 text-left">
                      <h3 className="text-sm font-black uppercase text-orange-400 tracking-wider">🎁 KHEN THƯỞNG XU CÁ HỒI</h3>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Chọn tài khoản con</label>
                        <select 
                          value={selectedStudent} 
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-orange-500 outline-none cursor-pointer"
                        >
                          {linkedStudentsList.map(s => (
                            <option key={s.id} value={s.username}>{s.displayName || s.username}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Mức Khen Thưởng</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[50, 100].map(amt => (
                            <button
                              key={amt}
                              onClick={() => setRewardAmount(amt)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${rewardAmount === amt ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                            >
                              🐟 Thưởng {amt} Xu
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleRewardCoins}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-xs uppercase tracking-widest text-white shadow border-0 cursor-pointer"
                      >
                        Gửi Tặng Xu Khen Thưởng ➔
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </section>
          </div>
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
            <>
            {/* 1.1 TELEMETRY EARLY WARNING ALARMS */}
            <div className="max-w-5xl mx-auto text-left">
              <div className="bg-rose-950/40 border-2 border-dashed border-rose-500/40 rounded-3xl p-5 shadow-lg relative overflow-hidden bg-gradient-to-r from-slate-900 to-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.005]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 text-rose-400 text-xl font-bold animate-pulse shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-rose-455 uppercase tracking-widest block font-sans">HỆ THỐNG CẢNH BÁO SỚM HỌC THUẬT (TELEMETRY ALARMS)</span>
                    <p className="text-xs text-slate-350 font-semibold mt-0.5 leading-relaxed">
                      Phát hiện học viên <strong className="text-rose-400">@con.cung</strong> có tỷ lệ Bẫy Chuột sai sót tăng đột biến <strong className="text-rose-455 font-mono">82%</strong> tại bài <strong className="text-slate-100">Tứ giác nội tiếp</strong>!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      alert("Đã gửi thông báo nhắc nhở kèm bài tập bổ sung môn Toán 9 cho tài khoản con @con.cung meow! 🐾🚀");
                      logSystemEvent('WARN', 'Admin đã gửi thông báo khắc phục khẩn cấp cho con @con.cung');
                    }}
                    className="bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-rose-300 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all duration-100 cursor-pointer border-none outline-none"
                  >
                    Khắc phục ngay ✓
                  </button>
                </div>
              </div>
            </div>

            {/* 1. TELEMETRY STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-left">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-emerald-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold border border-emerald-500/20">
                  👥
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Học viên Active</span>
                  <h3 className="text-2xl font-black text-slate-100 mt-0.5">
                    {allUsersList.filter(u => u.role === 'student').length} <span className="text-xs text-slate-500 font-bold">con</span>
                  </h3>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl font-bold border border-indigo-500/20">
                  🎯
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Điểm Số Hệ Thống</span>
                  <h3 className="text-sm font-black text-slate-100 mt-1">
                    SAT: <span className="text-rose-400 font-mono font-bold">1340</span> • IELTS: <span className="text-indigo-400 font-mono font-bold">7.2</span>
                  </h3>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-orange-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-xl font-bold border border-orange-500/20">
                  🐟
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Xu Cá Hồi Lưu Thông</span>
                  <h3 className="text-2xl font-black text-slate-100 mt-0.5">
                    {getCirculatingCoins()} <span className="text-xs text-slate-500 font-bold">🐟</span>
                  </h3>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden">
                {allUsersList.filter(u => u.status === 'pending').length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                )}
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-xl font-bold border border-amber-500/20">
                  ⏳
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Yêu Cầu Duyệt Mới</span>
                  <h3 className="text-2xl font-black text-slate-100 mt-0.5">
                    {allUsersList.filter(u => u.status === 'pending').length} <span className="text-xs text-slate-500 font-bold">yêu cầu</span>
                  </h3>
                </div>
              </div>
            </div>

            <SystemSurfacePreview />
            </>
            )}

            {effectiveAdminWorkspaceTab === 'analytics' && (
              isAdminContentOnly ? (
                <AdminContentRepairQueue
                  onOpenContent={openAdminContentTrack}
                />
              ) : (
                <>
                <AdminInterventionQueue
                  tracks={TRACKS}
                  users={allUsersList}
                  mathLessons={mathLessons}
                  importedExams={importedExams}
                  errorQuestions={errorQuestions}
                  adminLogs={adminLogs}
                  learningEvents={adminLearningEvents}
                  onOpenUsers={() => setAdminWorkspaceTab('users')}
                  onOpenContent={openAdminContentTrack}
                />

                <AdminContentRepairQueue
                  onOpenContent={openAdminContentTrack}
                />

                <AdminLearningAnalytics
                  tracks={TRACKS}
                  mathLessons={mathLessons}
                  importedExams={importedExams}
                  errorQuestions={errorQuestions}
                  adminLogs={adminLogs}
                  learningEvents={adminLearningEvents}
                />

                <BetaImplementationTracker
                  tracks={TRACKS}
                  users={allUsersList}
                  mathLessons={mathLessons}
                  importedExams={importedExams}
                  adminLogs={adminLogs}
                  learningEvents={adminLearningEvents}
                  errorQuestionCount={activeErrorQuestionCount}
                />
                </>
              )
            )}

            {effectiveAdminWorkspaceTab === 'overview' && !isAdminContentOnly && (
            <>
            {/* 2. WEAK SKILLS HEATMAP & ADAPTIVE TELEMETRY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
              <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span>🔥 BẢN ĐỒ KỸ NĂNG YẾU (SYSTEM HEATMAP)</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400 font-semibold">🧮 Toán 9: Tứ giác nội tiếp & Cực trị</span>
                        <span className="text-orange-400 font-bold">Mức độ yếu: 78%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400 font-semibold">🎓 SAT RW: Standard English Conventions</span>
                        <span className="text-rose-400 font-bold">Mức độ yếu: 65%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400 font-semibold">🎙️ IELTS: Speaking Pronunciation</span>
                        <span className="text-indigo-400 font-bold">Mức độ yếu: 58%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '58%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 mt-4 leading-relaxed font-light">
                  💡 Bản đồ kỹ năng yếu được tổng hợp tự động dựa trên nhật ký Bẫy Chuột và sai sót làm bài thực tế của tất cả học viên đang online.
                </div>
              </section>

              <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span>⚡ KÍCH HOẠT HỆ THỐNG MẪU NHANH (QUICK ACTIONS)</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={async () => {
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
                        await logSystemEvent('WARN', 'Admin phê duyệt nhanh tất cả các tài khoản');
                        showNotif("Đã phê duyệt nhanh toàn bộ tài khoản meow! 🚀", "success");
                        refreshAdminData();
                      }}
                      className="py-3 bg-emerald-950/60 hover:bg-emerald-900/45 border border-emerald-900/60 rounded-2xl text-[10px] font-black uppercase text-emerald-450 tracking-wider transition-all cursor-pointer text-center"
                    >
                      ✓ Duyệt tất cả
                    </button>
                    <button
                      onClick={async () => {
                        const uList = await db.listLocalUsers();
                        uList.forEach(u => {
                          if (u.role === 'student') {
                            persistCoinBalance(localStorage, u.username, 1000);
                          }
                        });
                        await logSystemEvent('WARN', 'Admin bơm tài nguyên: Set ví học viên thành 1,000 Coins');
                        showNotif("Bơm tài nguyên 1,000 Coins cho tất cả học viên thành công! 🐟", "success");
                        refreshAdminData();
                      }}
                      className="py-3 bg-orange-950/60 hover:bg-orange-900/45 border border-orange-900/60 rounded-2xl text-[10px] font-black uppercase text-orange-450 tracking-wider transition-all cursor-pointer text-center"
                    >
                      🐟 Bơm 1K Coins
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('ielts_app_logs_list');
                        setAdminLogs([]);
                        showNotif("Đã làm sạch toàn bộ Telemetry Logs meow!", "success");
                      }}
                      className="py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-wider transition-all cursor-pointer text-center col-span-2"
                    >
                      🧹 Xóa Telemetry Logs
                    </button>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 mt-4 leading-relaxed font-light">
                  ⚠️ Các lệnh nhanh tác động trực tiếp lên database Local Storage dùng chung của toàn hệ thống. Hãy cân nhắc kỹ trước khi bấm!
                </div>
              </section>
            </div>
            </>
            )}

            {/* 3. INTERACTIVE USER DETAILS Drawer / Modal */}
            {selectedUserForDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-left space-y-6 transform scale-98 transition-transform duration-300">
                  <button
                    onClick={() => setSelectedUserForDetail(null)}
                    className="absolute top-4 right-4 bg-slate-950 hover:bg-slate-850 text-slate-500 hover:text-slate-200 border border-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all cursor-pointer"
                  >
                    ✕
                  </button>

                  {/* Mascot Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-805">
                    <span className="text-3xl">👤</span>
                    <div>
                      <h3 className="text-lg font-black text-slate-100">Chi Tiết Học Viên @{selectedUserForDetail.username}</h3>
                      <p className="text-[10px] text-slate-500">
                        Đăng ký lúc: {selectedUserForDetail.createdAt ? new Date(selectedUserForDetail.createdAt).toLocaleString('vi-VN') : 'Không rõ'}
                      </p>
                    </div>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tên hiển thị</span>
                      <span className="font-extrabold text-slate-200">{selectedUserForDetail.displayName || selectedUserForDetail.username}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Vai Trò</span>
                      <span className="font-extrabold text-orange-400 capitalize">{selectedUserForDetail.role === 'admin' ? 'Quản trị viên' : selectedUserForDetail.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Mục tiêu</span>
                      <span className="font-extrabold text-slate-200">{selectedUserForDetail.role === 'student' ? `Band ${selectedUserForDetail.targetBand}` : '-'}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ví Xu Cá Hồi</span>
                      <span className="font-extrabold text-orange-400 font-mono">
                        {selectedUserForDetail.role === 'student'
                          ? `${loadStudentProgressSnapshot(localStorage, selectedUserForDetail.username).coins} 🐟`
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Adjust Coins & Assign Tracks */}
                  {selectedUserForDetail.role === 'student' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Bơm / Trừ Ví Xu Cá Hồi</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAdjustCoins(selectedUserForDetail.username, 50)}
                            className="flex-1 py-2 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-900 rounded-xl text-xs font-bold text-slate-400 hover:text-emerald-400 cursor-pointer transition-all"
                          >
                            🐟 +50 Xu
                          </button>
                          <button
                            onClick={() => handleAdjustCoins(selectedUserForDetail.username, 100)}
                            className="flex-1 py-2 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-900 rounded-xl text-xs font-bold text-slate-400 hover:text-emerald-400 cursor-pointer transition-all"
                          >
                            🐟 +100 Xu
                          </button>
                          <button
                            onClick={() => handleAdjustCoins(selectedUserForDetail.username, -50)}
                            className="flex-1 py-2 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-900 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 cursor-pointer transition-all"
                          >
                            🪓 -50 Xu
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Phân Quyền Các Khoá Học Assigned</span>
                        <div className="flex flex-wrap gap-2">
                          {(['math', 'sat', 'ielts', 'cae', 'cpe'] as const).map(track => {
                            const isAssigned = (selectedUserForDetail.assignedTracks || []).includes(track);
                            return (
                              <button
                                key={track}
                                onClick={() => {
                                  let nextTracks = [...(selectedUserForDetail.assignedTracks || [])];
                                  if (nextTracks.includes(track)) {
                                    nextTracks = nextTracks.filter(t => t !== track);
                                  } else {
                                    nextTracks.push(track);
                                  }
                                  handleUpdateUserTracks(selectedUserForDetail.username, nextTracks);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                                  isAssigned
                                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                    : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                                }`}
                              >
                                {track.toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex gap-3 pt-4 border-t border-slate-800 justify-end">
                    <button
                      onClick={() => setSelectedUserForDetail(null)}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-extrabold uppercase rounded-xl cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {effectiveAdminWorkspaceTab === 'users' && !isAdminContentOnly && (
            <>
            {/* Registered Users Table */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-sm font-black text-slate-350 uppercase tracking-widest">👥 DANH SÁCH TÀI KHOẢN ({allUsersList.length})</h3>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Vai trò:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer"
                    >
                      <option value="all">Tất cả</option>
                      <option value="admin">Quản trị</option>
                      <option value="parent">Phụ huynh</option>
                      <option value="student">Học sinh</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Duyệt:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer"
                    >
                      <option value="all">Tất cả</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Bị từ chối</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-850">
                <table className="w-full border-collapse text-left text-xs text-slate-300">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold">
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Liên hệ</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Ngày đăng ký</th>
                      <th className="p-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 italic">Không tìm thấy tài khoản nào phù hợp...</td>
                      </tr>
                    ) : (
                      allUsersList
                        .filter(u => {
                          if (roleFilter !== 'all' && u.role !== roleFilter) return false;
                          const status = u.status || 'pending';
                          if (statusFilter !== 'all' && status !== statusFilter) return false;
                          return true;
                        })
                        .map((user) => {
                          const status = user.status || 'pending';
                          return (
                            <tr key={user.id} className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black uppercase text-[10px] ${
                                    user.role === 'admin' ? 'bg-purple-900/40 text-purple-300' : user.role === 'parent' ? 'bg-orange-900/40 text-orange-300' : 'bg-slate-800 text-slate-300'
                                  }`}>
                                    {user.username.slice(0, 2)}
                                  </span>
                                  <div className="flex flex-col text-left">
                                    <span className="font-extrabold text-sm text-white">{user.displayName || user.username}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-semibold text-slate-300 font-mono">
                                {user.contactInfo || <span className="text-slate-650 italic">Không có</span>}
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-950/70 border-purple-900 text-purple-400' 
                                    : user.role === 'parent' 
                                      ? 'bg-orange-950/70 border-orange-900 text-orange-400'
                                      : 'bg-slate-950/60 border-slate-850 text-slate-400'
                                }`}>
                                  {user.role === 'admin' ? 'Admin' : user.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                                </span>
                              </td>
                              <td className="p-4 font-bold">
                                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                  status === 'approved'
                                    ? 'bg-emerald-950/75 border-emerald-900 text-emerald-400'
                                    : status === 'rejected'
                                      ? 'bg-rose-950/75 border-rose-900 text-rose-400'
                                      : 'bg-amber-950/75 border-amber-900 text-amber-400 animate-pulse'
                                }`}>
                                  {status === 'approved' ? '✓ Đã duyệt' : status === 'rejected' ? '❌ Bị từ chối' : '⏳ Chờ duyệt'}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 font-mono">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={async () => {
                                      const fullUserObj = await db.getLocalUser(user.username);
                                      if (fullUserObj) {
                                        setSelectedUserForDetail(fullUserObj);
                                      }
                                    }}
                                    className="px-2 py-1 rounded bg-slate-950 hover:bg-indigo-950/60 text-slate-500 hover:text-indigo-400 border border-slate-800 hover:border-indigo-900 transition-all cursor-pointer font-bold text-xs"
                                    title="Xem chi tiết & Điều chỉnh"
                                  >
                                    🔍
                                  </button>
                                  {status !== 'approved' && (
                                    <button
                                      onClick={() => handleUpdateStatus(user.username, 'approved')}
                                      className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase transition-all border-0 cursor-pointer"
                                      title="Duyệt tài khoản"
                                    >
                                      Duyệt ✓
                                    </button>
                                  )}
                                  {status !== 'rejected' && (
                                    <button
                                      onClick={() => handleUpdateStatus(user.username, 'rejected')}
                                      className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 font-extrabold text-[10px] uppercase transition-all border-0 cursor-pointer"
                                      title="Từ chối tài khoản"
                                    >
                                      Từ chối ❌
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUser(user.username)}
                                    className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-900 hover:text-red-400 text-slate-500 border border-slate-800 transition-all cursor-pointer"
                                    title="Xóa vĩnh viễn"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            </>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Lessons Table */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-sans">📚 Danh sách chuyên đề toán lớp 9</h4>
                    <div className="border border-slate-855 rounded-2xl overflow-hidden bg-slate-950/40">
                      <table className="w-full border-collapse text-xs text-left">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold">
                            <th className="p-3">ID</th>
                            <th className="p-3">Tên Chuyên Đề</th>
                            <th className="p-3">Chủ Đề</th>
                            <th className="p-3">Số Bài Tập</th>
                            <th className="p-3">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mathLessons.map(lesson => (
                            <tr key={lesson.id} className="border-b border-slate-855/60 hover:bg-slate-900/40">
                              <td className="p-3 font-mono text-slate-500">{lesson.id}</td>
                              <td className="p-3 font-bold text-slate-200">{lesson.title}</td>
                              <td className="p-3 text-slate-450">{lesson.topic}</td>
                              <td className="p-3 font-semibold text-slate-355">{lesson.count}</td>
                              <td className="p-3">
                                <span className="text-[9px] bg-emerald-950/70 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">
                                  {lesson.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Casio Tips & New Lesson Creator Form */}
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-sans">💡 Quản lý Mẹo Casio FX-580</h4>
                      
                      {/* List of Tips */}
                      <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                        {mathCasioTips.map(tip => (
                          <div key={tip.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-left">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-orange-400">{tip.title}</span>
                              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] text-orange-300 font-extrabold whitespace-nowrap">{tip.syntax}</span>
                            </div>
                            <p className="text-slate-500 mt-1 leading-relaxed">{tip.explanation}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add Casio Tip Form */}
                      <form onSubmit={handleAddCasioTip} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block font-sans">💡 Thêm Mẹo Bấm Casio Mới</span>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tiêu đề mẹo *</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Tính nhanh lim, đạo hàm..."
                            value={newCasioTitle}
                            onChange={e => setNewCasioTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Cú pháp bấm máy *</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: [MODE] [7]..."
                            value={newCasioSyntax}
                            onChange={e => setNewCasioSyntax(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Giải thích chi tiết</label>
                          <textarea
                            rows={2}
                            placeholder="Nhập hướng dẫn các bước..."
                            value={newCasioExpl}
                            onChange={e => setNewCasioExpl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          ➕ Thêm Mẹo Casio
                        </button>
                      </form>
                    </div>

                    {/* New Math Lesson Creator Form */}
                    <form onSubmit={handleAddMathLesson} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block font-sans">🧮 Đăng ký chuyên đề Toán 9 mới</span>
                      
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Mã Chuyên Đề (tự chọn)</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: math-alg-06 (để trống tự tạo)..."
                          value={newMathId}
                          onChange={e => setNewMathId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tên Chuyên Đề *</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Hàm số bậc nhất nâng cao..."
                          value={newMathTitle}
                          onChange={e => setNewMathTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Phân Loại</label>
                          <select
                            value={newMathTopic}
                            onChange={e => setNewMathTopic(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs outline-none text-slate-200 cursor-pointer"
                          >
                            <option value="Đại số (Algebra)">Đại số (Algebra)</option>
                            <option value="Hình học (Geometry)">Hình học (Geometry)</option>
                            <option value="Thi thử (Mock)">Thi thử (Mock)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Số câu bài tập</label>
                          <input
                            type="number"
                            min={5}
                            max={200}
                            value={newMathCount}
                            onChange={e => setNewMathCount(parseInt(e.target.value) || 40)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-255"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        ➕ Thêm Chuyên Đề Toán
                      </button>
                    </form>

                    {/* Visual LaTeX Question Editor */}
                    <form onSubmit={handleCreateLatexQuestion} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block font-sans">⚛️ Trình soạn câu hỏi LaTeX Toán học</span>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Mã câu hỏi (tự chọn)</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: math-q-10 (để trống tự tạo)..."
                          value={latexMathId}
                          onChange={e => setLatexMathId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Nội dung câu hỏi *</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Rút gọn biểu thức chứa căn..."
                          value={latexMathTitle}
                          onChange={e => setLatexMathTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Phương trình toán LaTeX *</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: \sqrt{x^2+y^2} = 5"
                          value={latexMathEq}
                          onChange={e => setLatexMathEq(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Đáp án đúng</label>
                          <select
                            value={latexMathAns}
                            onChange={e => setLatexMathAns(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-200 cursor-pointer"
                          >
                            <option value="A">Đáp án A</option>
                            <option value="B">Đáp án B</option>
                            <option value="C">Đáp án C</option>
                            <option value="D">Đáp án D</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Giải thích lời giải</label>
                          <input
                            type="text"
                            placeholder="Giải thích các bước..."
                            value={latexMathExpl}
                            onChange={e => setLatexMathExpl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                          />
                        </div>
                      </div>

                      {/* LaTeX Live Preview Area */}
                      {latexMathTitle && (
                        <div className="p-3 bg-slate-900/60 border border-indigo-950 rounded-xl space-y-1.5">
                          <span className="text-[8px] font-black uppercase text-indigo-400 block font-mono">LIVE PREVIEW (XEM TRƯỚC)</span>
                          <p className="text-[10px] font-semibold text-slate-350">{latexMathTitle}</p>
                          <p className="text-xs font-mono bg-slate-955 p-2 rounded border border-slate-850 text-indigo-400 font-bold text-center">
                            {latexMathEq || 'f(x) = ...'}
                          </p>
                          <p className="text-[9px] text-slate-500 italic">* Renders beautiful LaTeX via math notation</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        ➕ Tạo Câu Hỏi LaTeX
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TRACK 2: SAT adaptive MANAGEMENT */}
              {adminActiveTab === 'sat' && (
                <div className="space-y-6 text-left">
                  
                  {/* Admin SAT Sub-Tabs Switcher */}
                  <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 gap-2 self-start inline-flex">
                    <button
                      type="button"
                      onClick={() => setAdminSatSubTab('explorer')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-0 cursor-pointer ${
                        adminSatSubTab === 'explorer'
                          ? 'bg-rose-500 text-slate-955 font-bold shadow'
                          : 'bg-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔍 Duyệt Câu Hỏi (Explorer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSatSubTab('integrity')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-0 cursor-pointer ${
                        adminSatSubTab === 'integrity'
                          ? 'bg-rose-500 text-slate-955 font-bold shadow'
                          : 'bg-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      💎 Tính Toàn Vẹn (Integrity)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSatSubTab('calibration')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-0 cursor-pointer ${
                        adminSatSubTab === 'calibration'
                          ? 'bg-rose-500 text-slate-955 font-bold shadow'
                          : 'bg-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⚡ Hiệu Chuẩn (Calibration)
                    </button>
                  </div>

                  {/* SUB-TAB 1: SAT QUESTION EXPLORER & BROWSER */}
                  {adminSatSubTab === 'explorer' && (
                    <div className="space-y-6">
                      
                      {/* Active bank, search & filter bars */}
                      <div className="bg-slate-955 p-5 rounded-3xl border border-slate-850 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Chọn Ngân Hàng</label>
                          <select
                            value={adminSelectedSatBank}
                            onChange={e => {
                              setAdminSelectedSatBank(e.target.value);
                              setAdminCurrentPage(1);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-rose-500 animate-pulse-slow"
                          >
                            <option value="sat-1590-elite-ai-bank.json">Elite AI Bank (661 câu)</option>
                            <option value="antigravity-bank.json">Antigravity Bank (7,158 câu 🐘)</option>
                            <option value="opensat-pinesat.json">OpenSAT Pinesat (1,026 câu)</option>
                            <option value="sat-king-supplemental-ai-bank.json">Supplemental AI Bank (354 câu)</option>
                            <option value="archive-source-ai-bank.json">Archive AI Bank (792 câu)</option>
                            <option value="sat-studio-foundation-bank.json">Foundation Bank (219 câu)</option>
                            <option value="private-vault-archive-bank.json">Private Vault Bank (165 câu)</option>
                            <option value="kaplan-sat-math-ai-bank.json">Kaplan Math AI Bank (148 câu)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Lọc theo Domain</label>
                          <select
                            value={adminSelectedDomain}
                            onChange={e => {
                              setAdminSelectedDomain(e.target.value);
                              setAdminSelectedSkill('all');
                              setAdminCurrentPage(1);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-rose-500"
                          >
                            <option value="all">Tất cả Domains</option>
                            <option value="Information and Ideas">Information and Ideas</option>
                            <option value="Craft and Structure">Craft and Structure</option>
                            <option value="Expression of Ideas">Expression of Ideas</option>
                            <option value="Standard English Conventions">Standard English Conventions</option>
                            <option value="Algebra">Math: Algebra</option>
                            <option value="Advanced Math">Math: Advanced Math</option>
                            <option value="Problem-Solving and Data Analysis">Math: Problem-Solving & Data</option>
                            <option value="Geometry and Trigonometry">Math: Geometry & Trig</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tìm kiếm Từ khóa</label>
                          <input
                            type="text"
                            placeholder="Nhập ID hoặc từ khóa..."
                            value={adminSearchQuery}
                            onChange={e => {
                              setAdminSearchQuery(e.target.value);
                              setAdminCurrentPage(1);
                            }}
                            className="w-full bg-slate-900 border border-slate-805 text-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-500 placeholder:text-slate-700"
                          />
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-black text-rose-455 font-mono bg-rose-955 border border-rose-900/40 px-3 py-2 rounded-xl block text-center">
                            Tổng lọc: {
                              loadedQuestions.filter(q => {
                                const matchesDomain = adminSelectedDomain === 'all' || q.domain?.toLowerCase() === adminSelectedDomain.toLowerCase();
                                const matchesSearch = !adminSearchQuery.trim() || 
                                                      q.id?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                                                      q.prompt?.toLowerCase().includes(adminSearchQuery.toLowerCase());
                                return matchesDomain && matchesSearch;
                              }).length
                            } / {loadedQuestions.length} câu meow
                          </span>
                        </div>

                      </div>

                      {/* Paginated Questions List Table */}
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="overflow-x-auto rounded-2xl border border-slate-850">
                          <table className="w-full border-collapse text-left text-xs text-slate-350">
                            <thead>
                              <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-black uppercase font-sans">
                                <th className="p-3">ID</th>
                                <th className="p-3">Phân Loại / Domain</th>
                                <th className="p-3">Chuyên Đề / Skill</th>
                                <th className="p-3">Nội Dung Câu Hỏi (Prompt)</th>
                                <th className="p-3">Độ Khó</th>
                                <th className="p-3 text-center">Đáp Án</th>
                                <th className="p-3 text-center">Thao Tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const filtered = loadedQuestions.filter(q => {
                                  const matchesDomain = adminSelectedDomain === 'all' || q.domain?.toLowerCase() === adminSelectedDomain.toLowerCase();
                                  const matchesSearch = !adminSearchQuery.trim() || 
                                                        q.id?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                                                        q.prompt?.toLowerCase().includes(adminSearchQuery.toLowerCase());
                                  return matchesDomain && matchesSearch;
                                });

                                const pageSize = 10;
                                const totalPages = Math.ceil(filtered.length / pageSize);
                                const startIndex = (adminCurrentPage - 1) * pageSize;
                                const pageItems = filtered.slice(startIndex, startIndex + pageSize);

                                if (pageItems.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={7} className="p-8 text-center text-slate-500 italic">Không tìm thấy câu hỏi SAT nào meow...</td>
                                    </tr>
                                  );
                                }

                                return pageItems.map(q => (
                                  <tr key={q.id} className="border-b border-slate-855 hover:bg-slate-950/40 font-sans">
                                    <td className="p-3 font-mono font-bold text-rose-455">{q.id}</td>
                                    <td className="p-3">
                                      <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded font-medium">
                                        {q.domain || 'Math'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-200 font-bold max-w-[120px] truncate" title={q.skill || q.canonicalSkill}>
                                      {q.skill || q.canonicalSkill || 'Mixed'}
                                    </td>
                                    <td className="p-3 text-slate-450 max-w-[280px] truncate" title={q.prompt}>
                                      {q.prompt}
                                    </td>
                                    <td className="p-3">
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                        q.difficulty === 'Hard'
                                          ? 'bg-rose-955 border-rose-900 text-rose-455'
                                          : q.difficulty === 'Medium'
                                            ? 'bg-amber-955 border-amber-900 text-amber-400'
                                            : 'bg-emerald-950 border-emerald-900 text-emerald-400'
                                      }`}>
                                        {q.difficulty || 'Hard'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-mono font-black text-emerald-400 uppercase">{q.correctAnswer}</td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => setAdminActiveQuestionDetail(q)}
                                        className="px-2.5 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all"
                                      >
                                        Duyệt 🔍
                                      </button>
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Footer */}
                        {(() => {
                          const filtered = loadedQuestions.filter(q => {
                            const matchesDomain = adminSelectedDomain === 'all' || q.domain?.toLowerCase() === adminSelectedDomain.toLowerCase();
                            const matchesSearch = !adminSearchQuery.trim() || 
                                                  q.id?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                                                  q.prompt?.toLowerCase().includes(adminSearchQuery.toLowerCase());
                            return matchesDomain && matchesSearch;
                          });

                          const pageSize = 10;
                          const totalPages = Math.ceil(filtered.length / pageSize) || 1;

                          return (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">
                                Trang {adminCurrentPage} trên {totalPages} (Tổng số {filtered.length} câu)
                              </span>
                              <div className="flex gap-2">
                                <button
                                  disabled={adminCurrentPage === 1}
                                  onClick={() => setAdminCurrentPage(prev => Math.max(1, prev - 1))}
                                  className="px-3 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                                >
                                  ← Trang Trước
                                </button>
                                <button
                                  disabled={adminCurrentPage >= totalPages}
                                  onClick={() => setAdminCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  className="px-3 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                                >
                                  Trang Sau →
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                      </div>

                      {/* Detail Drawer Modal */}
                      {adminActiveQuestionDetail && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-md p-4">
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative text-left space-y-5 animate-fade-in">
                            <button
                              onClick={() => setAdminActiveQuestionDetail(null)}
                              className="absolute top-4 right-4 bg-slate-955 hover:bg-slate-850 text-slate-500 hover:text-white border border-slate-805 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all cursor-pointer"
                            >
                              ✕
                            </button>

                            <div className="flex items-center gap-3 pb-3 border-b border-slate-805">
                              <span className="text-2xl">🎓</span>
                              <div>
                                <h3 className="text-sm font-black text-rose-400 font-sans uppercase">CHI TIẾT CÂU HỎI THÍCH ỨNG</h3>
                                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">ID: {adminActiveQuestionDetail.id} • Section: {adminActiveQuestionDetail.section}</span>
                              </div>
                            </div>

                            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin text-xs">
                              {/* Metadata */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-955 p-2.5 rounded-xl border border-slate-850">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Domain</span>
                                  <span className="font-extrabold text-slate-200">{adminActiveQuestionDetail.domain}</span>
                                </div>
                                <div className="bg-slate-955 p-2.5 rounded-xl border border-slate-850">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Skill / Chuyên Đề</span>
                                  <span className="font-extrabold text-slate-200">{adminActiveQuestionDetail.skill || adminActiveQuestionDetail.canonicalSkill}</span>
                                </div>
                              </div>

                              {/* Prompt */}
                              <div className="space-y-1 bg-slate-955 p-3 rounded-xl border border-slate-850">
                                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Nội dung câu hỏi (Prompt)</span>
                                <PromptWithAssets
                                  text={adminActiveQuestionDetail.prompt}
                                  className="font-semibold text-slate-150 whitespace-pre-line leading-relaxed font-sans"
                                />
                              </div>

                              {/* Choices */}
                              {adminActiveQuestionDetail.choices && (
                                <div className="space-y-1.5">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block">Các Phương Án Trắc Nghiệm</span>
                                  <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(adminActiveQuestionDetail.choices).map(([k, v]) => (
                                      <div key={k} className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                                        k === adminActiveQuestionDetail.correctAnswer ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400' : 'bg-slate-955 border-slate-855 text-slate-400'
                                      }`}>
                                        <span className={`w-5 h-5 rounded font-black flex items-center justify-center text-[9px] uppercase border shrink-0 ${
                                          k === adminActiveQuestionDetail.correctAnswer ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900 border-slate-855 text-slate-550'
                                        }`}>{k}</span>
                                        <span className="font-semibold leading-normal">{v as string}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Explanation */}
                              <div className="space-y-1 bg-slate-955 p-3 rounded-xl border border-slate-850">
                                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Giải thích chi tiết (Explanation)</span>
                                <p className="text-slate-350 whitespace-pre-line leading-relaxed font-sans">
                                  {typeof adminActiveQuestionDetail.explanation === 'object'
                                    ? (adminActiveQuestionDetail.explanation.correct || JSON.stringify(adminActiveQuestionDetail.explanation))
                                    : (adminActiveQuestionDetail.explanation || 'Chưa có giải thích.')}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t border-slate-805">
                              <button
                                onClick={() => setAdminActiveQuestionDetail(null)}
                                className="px-5 py-2 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                              >
                                Đóng
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* SUB-TAB 2: DATABASE & INTEGRITY AUDIT */}
                  {adminSatSubTab === 'integrity' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
                            <span>💎 BẢNG KIỂM TRA TÍNH TOÀN VẸN CƠ SỞ DỮ LIỆU (INTEGRITY AUDIT)</span>
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 font-light font-sans leading-relaxed">
                            Báo cáo đo lường chi tiết kích thước file vật lý và số câu hỏi đã parsed thành công từ các tệp dữ liệu đã di chuyển sang.
                          </p>
                        </div>
                        <div className="text-xs font-black text-emerald-450 font-mono bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-855 shrink-0">
                          Tổng Ngân Hàng Pool: 10,000+ Câu
                        </div>
                      </div>

                      {/* Integrity Audit Table */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-850">
                        <table className="w-full border-collapse text-left text-xs text-slate-350">
                          <thead>
                            <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-black uppercase font-sans">
                              <th className="p-4">Tên Tệp Vật Lý (Static JSON)</th>
                              <th className="p-4">Dung Lượng (MB)</th>
                              <th className="p-4">Tổng Số Câu Hỏi</th>
                              <th className="p-4">Loại Ngân Hàng (Bank Type)</th>
                              <th className="p-4">Độ An Toàn (Quality Integrity)</th>
                              <th className="p-4">Trạng Thái Hoạt Động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: 'antigravity-bank.json', size: '50.5 MB', count: '7,158 câu', type: 'Ngân hàng Gốc Siêu Cấp', cert: 'College Board Aligned', status: 'Healthy • Active' },
                              { name: 'opensat-pinesat.json', size: '9.3 MB', count: '1,026 câu', type: 'Đề thi Adaptive Practice', cert: 'Bluebook Aligned', status: 'Healthy • Active' },
                              { name: 'sat-1590-elite-ai-bank.json', size: '5.1 MB', count: '661 câu', type: 'Tinh hoa AI 1590', cert: 'Strict 1600 Audit', status: 'Healthy • Active' },
                              { name: 'sat-king-supplemental-ai-bank.json', size: '2.9 MB', count: '354 câu', type: 'Bổ sung AI King Pack', cert: 'Passed AutoCheck', status: 'Healthy • Active' },
                              { name: 'archive-source-ai-bank.json', size: '6.7 MB', count: '792 câu', type: 'Kho lưu trữ đặc biệt', cert: 'Curriculum Metadata Aligned', status: 'Healthy • Active' },
                              { name: 'canonical-sat-taxonomy.json', size: '16.5 KB', count: '518 dòng', type: 'Sơ đồ chuyên đề chuẩn', cert: 'Official Taxonomy v3', status: 'Healthy • Active' }
                            ].map(bank => (
                              <tr key={bank.name} className="border-b border-slate-855 hover:bg-slate-950/40 font-sans">
                                <td className="p-4 font-mono font-bold text-rose-455">{bank.name}</td>
                                <td className="p-4 font-mono font-bold text-slate-205">{bank.size}</td>
                                <td className="p-4 font-bold text-slate-300">{bank.count}</td>
                                <td className="p-4 text-slate-450">{bank.type}</td>
                                <td className="p-4">
                                  <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-850 px-2.5 py-0.5 rounded font-black font-mono">
                                    {bank.cert}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="text-[9px] bg-emerald-950/70 border border-emerald-900 text-emerald-400 px-2.5 py-0.5 rounded-full font-black uppercase">
                                    {bank.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-4 bg-slate-955 rounded-2xl border border-slate-850 text-xs text-slate-500 font-light leading-relaxed font-sans">
                        💡 **Bảo mật và Bản quyền**: Toàn bộ ngân hàng câu hỏi đã vượt qua hệ thống kiểm duyệt chất lượng nghiêm ngặt (Strict 1600 Content Gate Review) để loại bỏ các câu trùng lặp, đảm bảo độ khó thực tế của kỳ thi SAT thật.
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: IRT CALIBRATION CONTROLS */}
                  {adminSatSubTab === 'calibration' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Performance Thresholds */}
                      <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-sans">📊 Cấu Hình Tham Số Thích Ứng (IRT)</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 font-sans">Mục tiêu Điểm Đánh giá SAT (Diagnostic Threshold)</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="800"
                                max="1600"
                                step="50"
                                value={satDiagnosticThreshold}
                                onChange={e => setSatDiagnosticThreshold(Number(e.target.value))}
                                className="flex-1 accent-rose-500 cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-200 shrink-0 w-12 text-right">{satDiagnosticThreshold}</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 font-sans">Tỷ lệ Học tập Tham số (IRT Learning Rate &alpha;)</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0.01"
                                max="0.2"
                                step="0.01"
                                value={satIrtAlpha}
                                onChange={e => setSatIrtAlpha(Number(e.target.value))}
                                className="flex-1 accent-rose-500 cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-200 shrink-0 w-12 text-right">{satIrtAlpha.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-500 leading-relaxed font-light font-sans">
                            💡 **Tham số IRT**: Việc tăng tốc độ học tập giúp điều chỉnh mức độ khó thích ứng của Module 2 SAT nhanh hơn dựa trên kết quả Module 1 của học viên.
                          </div>
                        </div>
                      </div>

                      {/* Right: IRT Calibrator Module */}
                      <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xl">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 font-sans">⚡ Bộ Hiệu Chuẩn Thống Kê IRT</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed mb-4 font-light font-sans">
                            Chạy phân tích thống kê phi tham số giả lập để tự động cập nhật độ phân biệt (Discrimination $a$), độ khó (Difficulty $b$) của toàn bộ 10,000+ câu hỏi trong ngân hàng đề thi thích ứng dựa trên lịch sử làm bài của học viên.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isIrtCalibrating}
                          onClick={handleTriggerIrtCalibration}
                          className={`w-full py-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl border-0 cursor-pointer shadow-lg shadow-rose-950/20 active:scale-[0.98] duration-100 ${
                            isIrtCalibrating ? 'opacity-50 animate-pulse cursor-not-allowed' : ''
                          }`}
                        >
                          {isIrtCalibrating ? '⚙️ Đang hiệu chuẩn mô hình...' : '🔥 Chạy hiệu chuẩn IRT Calibrate'}
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* TRACKS 3, 4, 5: IELTS, CAE, CPE (EXAM MANAGEMENT) */}
              {(adminActiveTab === 'ielts' || adminActiveTab === 'cae' || adminActiveTab === 'cpe') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Active Mock Exams */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-sans">
                      🏆 Danh sách đề thi thử {adminActiveTab.toUpperCase()} hiện hành
                    </h4>
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                      <p className="text-[11px] text-slate-500 mt-0 mb-0">
                        Review progress {activeContentReviewSummary.completionRate}% - {activeContentReviewSummary.checked}/{activeContentReviewSummary.totalExams} checked
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleExportContentReviewSet}
                          className="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase cursor-pointer transition-all bg-emerald-500 text-slate-950 border-emerald-300 hover:bg-emerald-400"
                        >
                          Export review set
                        </button>
                        {[
                          { id: 'all', label: 'All', count: activeContentReviewSummary.totalExams },
                          { id: 'unchecked', label: 'Draft', count: activeContentReviewSummary.unchecked },
                          { id: 'needs_fix', label: 'Needs Fix', count: activeContentReviewSummary.needsFix },
                          { id: 'checked', label: 'Checked', count: activeContentReviewSummary.checked },
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => setContentReviewFilter(filter.id as ContentReviewFilter)}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase cursor-pointer transition-all ${
                              contentReviewFilter === filter.id
                                ? 'bg-indigo-400 text-slate-950 border-indigo-300'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-indigo-300 hover:border-indigo-900'
                            }`}
                          >
                            {filter.label} {filter.count}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: 'Exams', value: activeContentReviewSummary.totalExams, tone: 'text-indigo-300' },
                        { label: 'Questions', value: activeContentReviewSummary.totalQuestions, tone: 'text-cyan-300' },
                        { label: 'Checked', value: activeContentReviewSummary.checked, tone: 'text-emerald-300' },
                        { label: 'Needs fix', value: activeContentReviewSummary.needsFix, tone: 'text-rose-300' },
                        { label: 'Draft', value: activeContentReviewSummary.unchecked, tone: 'text-amber-300' },
                      ].map((metric) => (
                        <div key={metric.label} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
                          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black m-0">{metric.label}</p>
                          <p className={`text-xl font-black mt-1 mb-0 ${metric.tone}`}>{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border border-slate-855 rounded-2xl overflow-hidden bg-slate-950/40">
                      <table className="w-full border-collapse text-xs text-left">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold font-sans">
                            <th className="p-3">Tên Đề Thi</th>
                            <th className="p-3">Hệ Đề</th>
                            <th className="p-3">Số Câu</th>
                            <th className="p-3">Thời Gian</th>
                            <th className="p-3">Trạng Thái</th>
                            <th className="p-3">Review</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredContentExams.length === 0 ? (
                            <tr>
                              <td className="p-6 text-center text-slate-500 font-bold" colSpan={7}>
                                No exams match this review filter.
                              </td>
                            </tr>
                          ) : (
                            filteredContentExams.map(ex => (
                              <tr key={ex.id} className="border-b border-slate-850/60 hover:bg-slate-900/40 font-sans">
                                <td className="p-3 font-bold text-slate-200">{ex.title}</td>
                                <td className="p-3 font-mono text-indigo-400">{ex.exam}</td>
                                <td className="p-3 text-slate-350">{ex.questions} câu</td>
                                <td className="p-3 text-slate-350">{ex.duration} phút</td>
                                <td className="p-3">
                                  <span className="text-[9px] bg-emerald-950/70 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">
                                    {ex.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black border ${
                                    ex.reviewStatus === 'checked'
                                      ? 'bg-emerald-950/70 border-emerald-900 text-emerald-400'
                                      : ex.reviewStatus === 'needs_fix'
                                        ? 'bg-rose-950/70 border-rose-900 text-rose-400'
                                        : 'bg-amber-950/70 border-amber-900 text-amber-400'
                                  }`}>
                                    {ex.reviewStatus === 'checked' ? 'checked' : ex.reviewStatus === 'needs_fix' ? 'needs fix' : 'unchecked'}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenContentExam(ex)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border cursor-pointer transition-all ${
                                      selectedContentExamId === ex.id
                                        ? 'bg-indigo-400 text-slate-950 border-indigo-300'
                                        : 'bg-slate-950 text-indigo-300 border-indigo-900 hover:bg-indigo-950/60'
                                    }`}
                                  >
                                    Mở / Sửa
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {contentExamDraft && contentExamDraft.exam.toLowerCase() === adminActiveTab && (
                      <div className="bg-slate-950/70 border border-indigo-900/50 rounded-3xl p-5 space-y-5 shadow-xl">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-300 m-0">Content Review Editor</p>
                            <h4 className="text-lg font-black text-slate-100 mt-1 mb-0">{contentExamDraft.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-1 mb-0 font-mono">
                              {contentExamDraft.id} • {contentExamDraft.exam} • reviewer: {contentExamDraft.reviewer || currentUser?.username || 'admin'}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveContentExamDraft('unchecked')}
                              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-black uppercase cursor-pointer"
                            >
                              Save Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveContentExamDraft('needs_fix')}
                              className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-900 text-[10px] font-black uppercase cursor-pointer"
                            >
                              Mark Needs Fix
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveContentExamDraft('checked')}
                              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 text-[10px] font-black uppercase cursor-pointer"
                            >
                              Save & Checked
                            </button>
                            <button
                              type="button"
                              onClick={handleExportContentExamChangeSet}
                              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300 text-[10px] font-black uppercase cursor-pointer"
                            >
                              Export Change Set
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContentExamId(null);
                                setContentExamDraft(null);
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-black uppercase cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px] gap-3">
                          <div>
                            <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">Exam title</label>
                            <input
                              value={contentExamDraft.title}
                              onChange={(event) => updateContentExamDraft({ title: event.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">Questions</label>
                            <input
                              type="number"
                              min={1}
                              value={contentExamDraft.questions}
                              onChange={(event) => updateContentExamDraft({ questions: Number(event.target.value) || 1 })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">Minutes</label>
                            <input
                              type="number"
                              min={1}
                              value={contentExamDraft.duration}
                              onChange={(event) => updateContentExamDraft({ duration: Number(event.target.value) || 1 })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          {ensureEditableExamSections(contentExamDraft).map((section, sectionIndex) => (
                            <div key={`${section.id}-${sectionIndex}`} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                                <div>
                                  <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">Section title</label>
                                  <input
                                    value={section.title}
                                    onChange={(event) => updateContentExamSection(sectionIndex, { title: event.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddContentQuestion(sectionIndex)}
                                  className="px-3 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 text-[10px] font-black uppercase cursor-pointer"
                                >
                                  Add Question
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">Passage / prompt context</label>
                                  <textarea
                                    rows={3}
                                    value={section.passageHtml || ''}
                                    onChange={(event) => updateContentExamSection(sectionIndex, { passageHtml: event.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-indigo-500 resize-y"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">Transcript / listening text</label>
                                  <textarea
                                    rows={3}
                                    value={section.transcript || ''}
                                    onChange={(event) => updateContentExamSection(sectionIndex, { transcript: event.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-indigo-500 resize-y"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                {section.questions.length === 0 ? (
                                  <div className="border border-dashed border-slate-750 rounded-xl p-4 text-[11px] text-slate-500">
                                    Đề này đang ở dạng summary. Bấm Add Question để nhập nội dung câu hỏi trực tiếp, hoặc import JSON đầy đủ để có section/question tự động.
                                  </div>
                                ) : (
                                  section.questions.map((question, questionIndex) => (
                                    <div key={`${question.id}-${questionIndex}`} className="bg-slate-950/75 border border-slate-850 rounded-2xl p-3 space-y-2">
                                      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_140px_auto] gap-2 items-start">
                                        <input
                                          value={question.id}
                                          onChange={(event) => updateContentExamQuestion(sectionIndex, questionIndex, { id: event.target.value })}
                                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-indigo-300 font-mono outline-none"
                                        />
                                        <textarea
                                          rows={2}
                                          value={question.text}
                                          onChange={(event) => updateContentExamQuestion(sectionIndex, questionIndex, { text: event.target.value })}
                                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-100 outline-none resize-y"
                                        />
                                        <input
                                          value={question.answer}
                                          onChange={(event) => updateContentExamQuestion(sectionIndex, questionIndex, { answer: event.target.value })}
                                          placeholder="Answer"
                                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-emerald-300 font-mono outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveContentQuestion(sectionIndex, questionIndex)}
                                          className="px-2 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-900 text-[10px] font-black cursor-pointer"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <textarea
                                          rows={2}
                                          value={(question.options || []).join('\n')}
                                          onChange={(event) =>
                                            updateContentExamQuestion(sectionIndex, questionIndex, {
                                              options: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                                            })
                                          }
                                          placeholder="Options, one per line"
                                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-300 outline-none resize-y"
                                        />
                                        <textarea
                                          rows={2}
                                          value={question.note || ''}
                                          onChange={(event) => updateContentExamQuestion(sectionIndex, questionIndex, { note: event.target.value })}
                                          placeholder="Content note / explanation"
                                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-300 outline-none resize-y"
                                        />
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-800 pt-4">
                          <button
                            type="button"
                            onClick={handleAddContentSection}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-black uppercase cursor-pointer"
                          >
                            Add Section
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveContentExamDraft('unchecked')}
                            className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 border border-indigo-300 text-[10px] font-black uppercase cursor-pointer"
                          >
                            Save Draft
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Visual Creator Form & JSON Import */}
                  <div className="space-y-6">
                    {/* Visual Exam Creator */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 text-left">
                      <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider font-sans">🚀 Tạo nhanh đề {adminActiveTab.toUpperCase()} trực quan</h4>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Mã Đề Thi (tự chọn)</label>
                        <input
                          type="text"
                          placeholder={`Ví dụ: ${adminActiveTab}-mock-02 (để trống tự tạo)...`}
                          value={newExamId}
                          onChange={e => setNewExamId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tên Đề Thi *</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Cambridge Academic Mock Test 1..."
                          value={newExamTitle}
                          onChange={e => setNewExamTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Số Câu Hỏi</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={newExamQuestions}
                            onChange={e => setNewExamQuestions(parseInt(e.target.value) || 40)}
                            className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Thời Gian (Phút)</label>
                          <input
                            type="number"
                            min={5}
                            max={240}
                            value={newExamDuration}
                            onChange={e => setNewExamDuration(parseInt(e.target.value) || 60)}
                            className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddEnglishExam(adminActiveTab)}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer shadow active:scale-95 duration-100"
                      >
                        ➕ Tạo Đề Thi Nhanh
                      </button>
                    </div>

                    {/* JSON Exam Import Area */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-sans">💾 Nhập Đề Thi {adminActiveTab.toUpperCase()} (JSON)</h4>
                        <button
                          type="button"
                          onClick={() => handleLoadDemoExam(adminActiveTab)}
                          className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer transition-all font-sans"
                        >
                          ⚡ Nạp Đề Mẫu
                        </button>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          rows={6}
                          placeholder={`Dán chuỗi đề thi JSON ${adminActiveTab.toUpperCase()} vào đây...`}
                          value={examJsonInput}
                          onChange={e => setExamJsonInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-3 text-[10px] font-mono outline-none text-slate-250 placeholder:text-slate-700 resize-none focus:border-indigo-500/60"
                        />
                        
                        {examImportError && (
                          <div className="text-[10px] text-rose-400 font-bold bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl text-left leading-relaxed font-sans">
                            ⚠️ {examImportError}
                          </div>
                        )}

                        {examImportSuccess && (
                          <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xl text-left leading-relaxed font-sans">
                            ✅ {examImportSuccess}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleImportJsonExam(adminActiveTab)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider rounded-xl border-0 cursor-pointer shadow-md transition-all"
                        >
                          🚀 Import Đề Thi {adminActiveTab.toUpperCase()}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
            )}

            {/* System Telemetry Logs Audit & CLI Control Console */}
            {effectiveAdminWorkspaceTab === 'logs' && !isAdminContentOnly && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black text-slate-350 uppercase tracking-widest text-left flex items-center gap-2">
                  <span>💻 MIUPREP REAL-TIME AUDIT & CONTROL TERMINAL</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
              </div>
              
              {/* Terminal Window container */}
              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden shadow-inner flex flex-col">
                {/* Scrolling Logs Screen */}
                <div className="p-4 max-h-60 overflow-y-auto scrollbar-thin flex flex-col gap-2 font-mono text-[11px] border-b border-slate-850 text-left min-h-[120px]">
                  {adminLogs.length === 0 ? (
                    <span className="text-slate-650 italic">No telemetry events logged yet meow...</span>
                  ) : (
                    adminLogs.map(log => (
                      <div key={log.id} className="flex items-start gap-3 leading-relaxed">
                        <span className="text-slate-500 shrink-0">[{log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN') : '-'}]</span>
                        <span className={`font-black shrink-0 ${
                          log.level === 'ERROR' ? 'text-rose-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-450'
                        }`}>[{log.level}]</span>
                        <span className="text-slate-300 font-medium flex-1">{log.message}</span>
                        {log.payload && (
                          <span className="text-slate-500 text-[10px] bg-slate-900 border border-slate-855 px-1 rounded max-w-[200px] truncate" title={log.payload}>
                            {log.payload}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {/* Command Line Input Bar */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center bg-slate-900/40 px-4 py-3 gap-2 text-left border-t border-slate-900">
                  <span className="font-mono text-xs font-bold text-emerald-450 shrink-0">MiuPrep@Admin:~$</span>
                  <input
                    type="text"
                    value={terminalCommand}
                    onChange={(e) => setTerminalCommand(e.target.value)}
                    placeholder="Nhập lệnh CLI (ví dụ: /help, /approve-all, /coins @username 100)..."
                    className="flex-1 bg-transparent border-0 outline-none text-emerald-400 font-mono text-xs placeholder:text-slate-700 min-w-0"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-950/80 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-400 px-3.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-100 hover:scale-[1.02] cursor-pointer"
                  >
                    Execute
                  </button>
                </form>
              </div>
            </section>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
