import { buildLearningEvent, type LearningEventRecord } from '@miuprep/learning';
import type { ErrorNotebookQuestion } from './satPractice';

export interface DiaryEntry {
  text: string;
  mood: string;
  date: string;
}

export type StudentWorkspaceTabId = 'overview' | 'courses' | 'practice' | 'tutor' | 'rewards';

export interface StudentWorkspaceTab {
  id: StudentWorkspaceTabId;
  label: string;
  detail: string;
}

export interface MascotStoreItem {
  key: string;
  label: string;
  price: number;
  desc: string;
}

export interface StudentProgressSnapshot {
  coins: number;
  traps: number;
  diaryList: DiaryEntry[];
}

export type StudyTimeMode = '15' | '30' | '60';
export type DailyLoopStepId = 'diagnostic' | 'lesson' | 'guided' | 'independent' | 'review';
export type DailyLoopStepAction = 'courses' | 'practice' | 'tutor';

export interface StudyTimeModeOption {
  id: StudyTimeMode;
  label: string;
  minutes: number;
  description: string;
}

export interface DailyLoopStep {
  id: DailyLoopStepId;
  title: string;
  durationMinutes: number;
  detail: string;
  action: DailyLoopStepAction;
  actionLabel: string;
  completed: boolean;
}

export interface DailyLearningPlanInput {
  username: string;
  timeMode: StudyTimeMode;
  completedStepIds: DailyLoopStepId[];
  averageMastery: number;
  hasDueErrors: boolean;
  activeErrorCount: number;
  firstErrorStage?: number;
  firstErrorText?: string;
  weakestProgramTitle?: string;
  weakestLabel?: string;
  recommendationKind?: string;
  recommendationReason?: string;
  nextStepLabel?: string;
  nextStepStatus?: string;
  nextStepMastery?: number;
  nextStepUnlocked?: boolean;
  dateKey?: string;
}

export interface DailyLearningPlan {
  username: string;
  dateKey: string;
  timeMode: StudyTimeMode;
  totalMinutes: number;
  completedMinutes: number;
  completionPercent: number;
  completedStepCount: number;
  totalStepCount: number;
  isCompleted: boolean;
  primaryTitle: string;
  primaryDetail: string;
  whyTitle: string;
  whyDetail: string;
  unlockTitle: string;
  unlockDetail: string;
  steps: DailyLoopStep[];
}

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

export type MascotPurchaseResult =
  | { status: 'already_unlocked'; nextCoins: number; nextUnlockedItems: string[] }
  | { status: 'insufficient_coins'; nextCoins: number; nextUnlockedItems: string[] }
  | { status: 'purchased'; nextCoins: number; nextUnlockedItems: string[] };

export interface RetryErrorResult {
  isCorrect: boolean;
  nextErrorQuestions: ErrorNotebookQuestion[];
  nextCoins: number;
  nextTrapCount: number;
  retryAttempts: number;
  retryStatusCode: ErrorNotebookRetryStatusCode;
}

export interface DiaryUpdateResult {
  entry: DiaryEntry;
  nextDiaryList: DiaryEntry[];
  nextCoins: number;
}

export interface DailyLoopStepLearningEventInput {
  username: string;
  stepId: DailyLoopStepId;
  dateKey?: string;
  timeMode?: StudyTimeMode;
  activeErrorCount?: number;
  recommendationKind?: string;
}

export interface ErrorRetryLearningEventInput {
  username: string;
  question: ErrorNotebookQuestion;
  selectedAnswer: string;
  correctAnswer: string;
  result: RetryErrorResult;
  occurredAt?: string;
}

export type LessonTemplateAction = 'open_practice' | 'open_tutor';

export interface LessonTemplateActionLearningEventInput {
  username: string;
  programId: string;
  domainId: string;
  templateId: string;
  templateTitle: string;
  conceptIds?: string[];
  skillIds?: string[];
  estimatedMinutes?: number;
  masteryTarget?: number;
  action: LessonTemplateAction;
  sourceSurface: 'math_lesson_template_panel' | 'english_core_lesson_template_panel';
  occurredAt?: string;
}

export type ErrorNotebookRetryStatusCode = 'new' | 'repairing' | 'prerequisite' | 'stable';
export type ErrorNotebookV2Type = 'knowledge' | 'reading_prompt' | 'calculation' | 'time_strategy';

export interface ErrorNotebookV2Entry {
  question: ErrorNotebookQuestion;
  errorType: ErrorNotebookV2Type;
  errorTypeLabel: string;
  rootCause: string;
  missedStep: string;
  repairLessonTitle: string;
  repairLessonDetail: string;
  dueAt: string;
  dueLabel: string;
  retryStatusCode: ErrorNotebookRetryStatusCode;
  retryStatusLabel: string;
  retryAttempts: number;
  groupKey: string;
  groupLabel: string;
  severityLabel: string;
}

export interface ErrorNotebookV2Group {
  key: string;
  label: string;
  count: number;
  highestStage: number;
  dueCount: number;
  prerequisiteCount: number;
}

export const DEFAULT_STUDENT_COINS = 150;
export const DEFAULT_STUDENT_TRAPS = 4;
export const ERROR_RETRY_REWARD = 10;

export const DAILY_STUDY_TIME_MODES: StudyTimeModeOption[] = [
  { id: '15', label: '15 min', minutes: 15, description: 'Core sprint' },
  { id: '30', label: '30 min', minutes: 30, description: 'Deepen' },
  { id: '60', label: '60 min', minutes: 60, description: 'Full session' },
];

export const DAILY_LOOP_STEP_IDS: DailyLoopStepId[] = ['diagnostic', 'lesson', 'guided', 'independent', 'review'];

export const STUDENT_DIARY_MOODS = ['😸', '😻', '😿', '💡', '😼', '🥱'];

export const MASCOT_STORE_ITEMS: MascotStoreItem[] = [
  {
    key: '🎓',
    label: 'Mũ Cử Nhân (Grad Cap)',
    price: 100,
    desc: 'Giúp Miu nhìn trí tuệ, đỗ thủ khoa chuyên sâu!',
  },
  {
    key: '👓',
    label: 'Kính Tri Thức (Smart Glass)',
    price: 120,
    desc: 'Đeo kính mát lướt Desmos, giải toán siêu tốc!',
  },
  {
    key: '🎀',
    label: 'Nơ Quý Phái (Royal Ribbon)',
    price: 80,
    desc: 'Lên đồ sang chảnh chuẩn bị thi IELTS meow!',
  },
];

export const DEFAULT_ERROR_NOTEBOOK_QUESTIONS: ErrorNotebookQuestion[] = [
  {
    id: 'err-1',
    text: 'Rút gọn biểu thức chứa căn bậc hai: P = \\frac{2\\sqrt{x}-9}{x-5\\sqrt{x}+6} - \\frac{\\sqrt{x}+3}{\\sqrt{x}-2}',
    stage: 1,
    answer: 'A',
    options: ['A', 'B', 'C', 'D'],
    answerExpl: 'Rút gọn biểu thức bằng cách quy đồng mẫu thức chung (\\sqrt{x}-2)(\\sqrt{x}-3).',
  },
  {
    id: 'err-2',
    text: 'Cho đường tròn (O), dây AB không đi qua tâm. Gọi M là trung điểm AB. Đường kính CD đi qua M. Phát biểu nào sau đây đúng?',
    stage: 2,
    answer: 'C',
    options: ['A', 'B', 'C', 'D'],
    answerExpl: 'Đường kính đi qua trung điểm của một dây không đi qua tâm thì vuông góc với dây ấy.',
  },
  {
    id: 'err-3',
    text: 'IELTS Standard Conventions: Although she studied hard, but she did not pass the exam. (Identify error)',
    stage: 1,
    answer: 'but',
    options: ['Although', 'studied', 'but', 'pass'],
    answerExpl: 'In English, do not use "but" in a sentence starting with "Although/Even though".',
  },
];

export function getStudentStorageKeys(username: string): {
  coinsKey: string;
  trapsKey: string;
  diaryKey: string;
  sharedCoinsKey: string;
} {
  return {
    coinsKey: `miu_math_fish_coins_${username}`,
    trapsKey: `miu_math_traps_${username}`,
    diaryKey: `miuprep_diary_${username}`,
    sharedCoinsKey: 'miu_math_fish_coins',
  };
}

export function parseCoinBalance(value: string | null | undefined, fallback = DEFAULT_STUDENT_COINS): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function buildTrapPayload(count: number): string {
  return JSON.stringify(new Array(Math.max(0, count)).fill(0));
}

export function parseTrapCount(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.length : fallback;
  } catch {
    return fallback;
  }
}

export function createWelcomeDiaryEntry(date = new Date().toLocaleDateString('vi-VN')): DiaryEntry {
  return {
    text: 'Chào mừng bạn đến với MiuPrep! Hãy chăm chỉ làm bài mỗi ngày nhé meow! 🐾',
    mood: '😻',
    date,
  };
}

export function parseDiaryList(value: string | null | undefined, fallbackDate?: string): DiaryEntry[] {
  if (!value) return [createWelcomeDiaryEntry(fallbackDate)];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [createWelcomeDiaryEntry(fallbackDate)];

    const diaryList = parsed.filter((entry): entry is DiaryEntry => {
      return (
        entry &&
        typeof entry.text === 'string' &&
        typeof entry.mood === 'string' &&
        typeof entry.date === 'string'
      );
    });

    return diaryList.length > 0 ? diaryList : [createWelcomeDiaryEntry(fallbackDate)];
  } catch {
    return [createWelcomeDiaryEntry(fallbackDate)];
  }
}

export function loadStudentProgressSnapshot(
  storage: ReadableStorage,
  username: string,
  fallbackDate = new Date().toLocaleDateString('vi-VN'),
): StudentProgressSnapshot {
  const keys = getStudentStorageKeys(username);

  return {
    coins: parseCoinBalance(storage.getItem(keys.coinsKey)),
    traps: parseTrapCount(storage.getItem(keys.trapsKey), DEFAULT_STUDENT_TRAPS),
    diaryList: parseDiaryList(storage.getItem(keys.diaryKey), fallbackDate),
  };
}

export function persistCoinBalance(storage: WritableStorage, username: string, coins: number): void {
  const keys = getStudentStorageKeys(username);
  const value = Math.max(0, coins).toString();
  storage.setItem(keys.coinsKey, value);
  storage.setItem(keys.sharedCoinsKey, value);
}

export function persistTrapCount(storage: WritableStorage, username: string, trapCount: number): void {
  const keys = getStudentStorageKeys(username);
  storage.setItem(keys.trapsKey, buildTrapPayload(trapCount));
}

export function persistDiaryUpdate(storage: WritableStorage, username: string, update: DiaryUpdateResult): void {
  const keys = getStudentStorageKeys(username);
  storage.setItem(keys.diaryKey, JSON.stringify(update.nextDiaryList));
  persistCoinBalance(storage, username, update.nextCoins);
}

export function getTodayPlanDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyPlanStorageKey(username: string, dateKey = getTodayPlanDateKey()): string {
  return `miuprep_daily_plan_${username}_${dateKey}`;
}

export function normalizeStudyTimeMode(value: string | null | undefined): StudyTimeMode {
  return value === '30' || value === '60' ? value : '15';
}

export function loadDailyPlanTimeMode(storage: ReadableStorage, username: string): StudyTimeMode {
  return normalizeStudyTimeMode(storage.getItem(`miuprep_daily_plan_time_mode_${username}`));
}

export function persistDailyPlanTimeMode(storage: WritableStorage, username: string, timeMode: StudyTimeMode): void {
  storage.setItem(`miuprep_daily_plan_time_mode_${username}`, timeMode);
}

export function loadDailyPlanCompletedSteps(
  storage: ReadableStorage,
  username: string,
  dateKey = getTodayPlanDateKey(),
): DailyLoopStepId[] {
  const rawValue = storage.getItem(getDailyPlanStorageKey(username, dateKey));
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return normalizeDailyStepIds(parsed);
  } catch {
    return [];
  }
}

export function deriveDailyPlanCompletedStepsFromEvents(
  events: LearningEventRecord[] = [],
  username: string,
  dateKey = getTodayPlanDateKey(),
): DailyLoopStepId[] {
  const completed = new Set<DailyLoopStepId>();
  events
    .filter((event) => eventBelongsToLearner(event, username))
    .filter((event) => eventDateKey(event.occurredAt) === dateKey || String(event.payload?.dateKey || '') === dateKey)
    .forEach((event) => {
      if (event.payload?.dailyPlanCompleted === true || event.type === 'daily_target_completed') {
        DAILY_LOOP_STEP_IDS.forEach((stepId) => completed.add(stepId));
        return;
      }
      const stepId = dailyStepIdFromEvent(event);
      if (stepId) completed.add(stepId);
    });
  return normalizeDailyStepIds([...completed]);
}

export function persistDailyPlanCompletedSteps(
  storage: WritableStorage,
  username: string,
  completedStepIds: DailyLoopStepId[],
  dateKey = getTodayPlanDateKey(),
): void {
  storage.setItem(getDailyPlanStorageKey(username, dateKey), JSON.stringify(normalizeDailyStepIds(completedStepIds)));
}

export function toggleDailyPlanStep(
  completedStepIds: DailyLoopStepId[],
  stepId: DailyLoopStepId,
): DailyLoopStepId[] {
  const normalized = normalizeDailyStepIds(completedStepIds);
  return normalized.includes(stepId)
    ? normalized.filter((id) => id !== stepId)
    : normalizeDailyStepIds([...normalized, stepId]);
}

export function buildDailyLoopStepLearningEvent(input: DailyLoopStepLearningEventInput): LearningEventRecord {
  const dateKey = input.dateKey || getTodayPlanDateKey();
  return buildLearningEvent(
    'daily_step_completed',
    {
      dateKey,
      dailyStepId: input.stepId,
      completed: true,
      timeMode: input.timeMode || '',
      activeErrorCount: input.activeErrorCount || 0,
      recommendationKind: input.recommendationKind || '',
      sourceSurface: 'student_today_sprint',
    },
    {
      learnerId: input.username,
      entityType: 'daily_plan_step',
      entityId: `daily-plan-${input.username}-${dateKey}-${input.stepId}`,
      source: 'miuprep_portal',
    },
  );
}

export function buildLessonTemplateActionLearningEvent(input: LessonTemplateActionLearningEventInput): LearningEventRecord {
  const occurredAt = input.occurredAt || new Date().toISOString();
  const conceptIds = normalizeLearningIds(input.conceptIds, fallbackLessonConceptId(input.domainId));
  const skillIds = normalizeLearningIds(input.skillIds, fallbackLessonSkillId(input.domainId));

  return buildLearningEvent(
    'lesson_template_action',
    {
      programId: input.programId,
      domainId: input.domainId,
      conceptIds,
      skillIds,
      action: input.action,
      templateId: input.templateId,
      templateTitle: input.templateTitle,
      estimatedMinutes: input.estimatedMinutes || 0,
      masteryTarget: input.masteryTarget || 0,
      sourceSurface: input.sourceSurface,
    },
    {
      learnerId: input.username,
      entityType: 'lesson_template',
      entityId: input.templateId,
      occurredAt,
      source: 'miuprep_portal_lesson_template',
    },
  );
}

export function buildErrorRetryLearningEvent(input: ErrorRetryLearningEventInput): LearningEventRecord {
  const occurredAt = input.occurredAt || new Date().toISOString();
  const domainId = inferErrorQuestionDomainId(input.question);
  const programId = input.question.programId || (domainId === 'english_core' ? 'ielts' : 'vn_math_6_9');
  const conceptIds = normalizeLearningIds(input.question.conceptIds, fallbackConceptId(domainId, input.question));
  const skillIds = normalizeLearningIds(input.question.skillIds, fallbackSkillId(domainId, input.question));
  const stageAfter = input.result.nextErrorQuestions.find((question) => question.id === input.question.id)?.stage ?? input.question.stage;

  return buildLearningEvent(
    'review_attempt',
    {
      attemptId: `retry-${input.username}-${input.question.id}-${stableEventPart(occurredAt)}`,
      itemId: input.question.id,
      domainId,
      programId,
      conceptIds,
      skillIds,
      correct: input.result.isCorrect,
      score: input.result.isCorrect ? 1 : 0,
      maxScore: 1,
      difficulty: difficultyFromErrorStage(input.question.stage),
      mode: 'review',
      selectedAnswer: input.selectedAnswer,
      correctAnswer: input.correctAnswer,
      stageBefore: input.question.stage,
      stageAfter,
      retryAttempts: input.result.retryAttempts,
      retryStatusCode: input.result.retryStatusCode,
      errorCategories: input.result.isCorrect ? [] : [errorCategoryFromQuestion(input.question, domainId)],
      misconceptionIds: input.result.isCorrect ? [] : misconceptionIdsFromQuestion(input.question, domainId),
      timeSpentSeconds: 0,
      sourceSurface: 'error_notebook',
    },
    {
      learnerId: input.username,
      entityType: 'learning_item',
      entityId: input.question.id,
      occurredAt,
      source: 'miuprep_portal_error_notebook',
    },
  );
}

export function buildDailyLearningPlan(input: DailyLearningPlanInput): DailyLearningPlan {
  const timeMode = normalizeStudyTimeMode(input.timeMode);
  const mode = DAILY_STUDY_TIME_MODES.find((item) => item.id === timeMode) || DAILY_STUDY_TIME_MODES[0];
  const completed = new Set(normalizeDailyStepIds(input.completedStepIds));
  const weakestProgram = input.weakestProgramTitle || 'chuong trinh dang hoc';
  const weakestLabel = input.weakestLabel || 'muc tieu nen tang';
  const hasDueErrors = input.hasDueErrors || input.activeErrorCount > 0;
  const minutes = dailyPlanMinuteSplit(mode.minutes, hasDueErrors);

  const steps: DailyLoopStep[] = hasDueErrors
    ? [
        {
          id: 'diagnostic',
          title: 'Mini diagnostic loi cu',
          durationMinutes: minutes.diagnostic,
          detail: `Chon 1 loi stage ${input.firstErrorStage || 1} de xac dinh con mac o dau.`,
          action: 'practice',
          actionLabel: 'Mo so loi',
          completed: completed.has('diagnostic'),
        },
        {
          id: 'lesson',
          title: 'Micro lesson sua goc',
          durationMinutes: minutes.lesson,
          detail: `Hoc lai mat xich lien quan den ${weakestLabel}.`,
          action: 'courses',
          actionLabel: 'Mo lesson',
          completed: completed.has('lesson'),
        },
        {
          id: 'guided',
          title: 'Guided practice',
          durationMinutes: minutes.guided,
          detail: 'Lam 2-4 cau cung dang, moi cau tu noi ro buoc sai can tranh.',
          action: 'practice',
          actionLabel: 'Luyen co huong dan',
          completed: completed.has('guided'),
        },
        {
          id: 'independent',
          title: 'Independent check',
          durationMinutes: minutes.independent,
          detail: 'Lam 3-6 cau khong xem goi y de chung minh da on dinh hon.',
          action: 'practice',
          actionLabel: 'Lam bai doc lap',
          completed: completed.has('independent'),
        },
        {
          id: 'review',
          title: 'Error review',
          durationMinutes: minutes.review,
          detail: 'Ghi 1 dong: lan sau thay dau hieu nao thi dung lai kiem tra?',
          action: 'tutor',
          actionLabel: 'Hoi AI Tutor',
          completed: completed.has('review'),
        },
      ]
    : [
        {
          id: 'diagnostic',
          title: 'Mini diagnostic',
          durationMinutes: minutes.diagnostic,
          detail: `Lay baseline nhanh cho ${weakestProgram}.`,
          action: 'courses',
          actionLabel: 'Mo khoa hoc',
          completed: completed.has('diagnostic'),
        },
        {
          id: 'lesson',
          title: 'Micro lesson',
          durationMinutes: minutes.lesson,
          detail: `Hoc trong tam ${weakestLabel}, chi giu 1 y can nam chac.`,
          action: 'courses',
          actionLabel: 'Mo lesson',
          completed: completed.has('lesson'),
        },
        {
          id: 'guided',
          title: 'Guided practice',
          durationMinutes: minutes.guided,
          detail: 'Lam cau mau co loi giai ngan, doi chieu tung buoc.',
          action: 'practice',
          actionLabel: 'Luyen co huong dan',
          completed: completed.has('guided'),
        },
        {
          id: 'independent',
          title: 'Independent practice',
          durationMinutes: minutes.independent,
          detail: 'Lam bo cau rieng de them evidence cho mastery.',
          action: 'practice',
          actionLabel: 'Lam bai doc lap',
          completed: completed.has('independent'),
        },
        {
          id: 'review',
          title: 'Error review',
          durationMinutes: minutes.review,
          detail: 'Chot 1 bay thuong gap va 1 viec can nho cho lan sau.',
          action: 'tutor',
          actionLabel: 'Hoi AI Tutor',
          completed: completed.has('review'),
        },
      ];

  const completedMinutes = steps.reduce((sum, step) => sum + (step.completed ? step.durationMinutes : 0), 0);
  const completionPercent = Math.round((completedMinutes / mode.minutes) * 100);
  const completedStepCount = steps.filter((step) => step.completed).length;
  const targetLabel = input.nextStepLabel || weakestLabel;
  const targetMastery = Math.round(input.nextStepMastery || input.averageMastery || 0);
  const isCompleted = completedStepCount === steps.length;

  return {
    username: input.username,
    dateKey: input.dateKey || getTodayPlanDateKey(),
    timeMode,
    totalMinutes: mode.minutes,
    completedMinutes,
    completionPercent: Math.min(100, Math.max(0, completionPercent)),
    completedStepCount,
    totalStepCount: steps.length,
    isCompleted,
    primaryTitle: isCompleted
      ? 'Today target completed'
      : hasDueErrors
        ? `Sua ${input.activeErrorCount} loi den han`
        : 'Bat dau bai hoc tiep theo',
    primaryDetail: isCompleted
      ? `Da hoan thanh ${completedStepCount}/${steps.length} buoc. Lan tiep theo he thong se day len muc kho hon hoac mo nut tiep theo.`
      : hasDueErrors
        ? 'He thong uu tien sua loi cu truoc khi mo kien thuc moi.'
        : `Tiep tuc voi ${weakestProgram}, lay them evidence cho mastery.`,
    whyTitle: hasDueErrors ? 'Vi sao sua loi truoc?' : 'Vi sao hoc bai nay?',
    whyDetail: hasDueErrors
      ? `Con ${input.activeErrorCount} loi dang den han. Loi dau tien o stage ${input.firstErrorStage || 1}; neu sua on dinh, learning path se bot bi nghen.`
      : `${input.recommendationReason || input.recommendationKind || 'mastery_signal'}: ky nang yeu nhat hien la ${weakestLabel}. He thong can them evidence ngan, dung luc.`,
    unlockTitle: input.nextStepUnlocked ? 'Next is open' : 'Unlock next',
    unlockDetail: `${targetLabel} dang o ${targetMastery}%. Dat khoang 80% va hoan thanh review hom nay de mo mixed challenge tiep theo.`,
    steps,
  };
}

export function getActiveErrorQuestions(errorQuestions: ErrorNotebookQuestion[]): ErrorNotebookQuestion[] {
  return errorQuestions.filter((question) => question.stage > 0);
}

export function countActiveErrorQuestions(errorQuestions: ErrorNotebookQuestion[]): number {
  return getActiveErrorQuestions(errorQuestions).length;
}

export function getErrorNotebookSummary(activeErrorQuestionCount: number): string {
  if (activeErrorQuestionCount === 0) {
    return 'Chưa có câu sai đang cần ôn. Khi học sinh làm sai, lỗi sẽ được đẩy vào đây.';
  }

  return `Có ${activeErrorQuestionCount} câu đang chờ ôn theo spaced repetition.`;
}

export function buildErrorNotebookV2Entries(
  errorQuestions: ErrorNotebookQuestion[],
  now = new Date(),
): ErrorNotebookV2Entry[] {
  return getActiveErrorQuestions(errorQuestions).map((question) => {
    const profile = deriveErrorProfile(question);
    const retryStatus = deriveRetryStatus(question);
    const dueAt = question.dueAt || dueAtForStage(question.stage, now).toISOString();

    return {
      question,
      errorType: profile.errorType,
      errorTypeLabel: errorTypeLabel(profile.errorType),
      rootCause: question.rootCause || profile.rootCause,
      missedStep: question.missedStep || profile.missedStep,
      repairLessonTitle: question.repairLessonTitle || profile.repairLessonTitle,
      repairLessonDetail: profile.repairLessonDetail,
      dueAt,
      dueLabel: dueLabel(dueAt, now),
      retryStatusCode: retryStatus.code,
      retryStatusLabel: retryStatus.label,
      retryAttempts: question.retryAttempts || 0,
      groupKey: profile.groupKey,
      groupLabel: profile.groupLabel,
      severityLabel: severityLabel(question.stage),
    };
  });
}

export function buildErrorNotebookV2Groups(entries: ErrorNotebookV2Entry[], now = new Date()): ErrorNotebookV2Group[] {
  const groups = new Map<string, ErrorNotebookV2Group>();

  entries.forEach((entry) => {
    const current = groups.get(entry.groupKey) || {
      key: entry.groupKey,
      label: entry.groupLabel,
      count: 0,
      highestStage: 0,
      dueCount: 0,
      prerequisiteCount: 0,
    };
    const dueDate = new Date(entry.dueAt);
    current.count += 1;
    current.highestStage = Math.max(current.highestStage, entry.question.stage);
    current.dueCount += dueDate.getTime() <= now.getTime() ? 1 : 0;
    current.prerequisiteCount += entry.retryStatusCode === 'prerequisite' ? 1 : 0;
    groups.set(entry.groupKey, current);
  });

  return Array.from(groups.values()).sort(
    (left, right) =>
      right.prerequisiteCount - left.prerequisiteCount ||
      right.dueCount - left.dueCount ||
      right.highestStage - left.highestStage ||
      right.count - left.count,
  );
}

export function buildStudentWorkspaceTabs(
  trackCount: number,
  trapCount: number,
  coins: number,
): StudentWorkspaceTab[] {
  return [
    { id: 'overview', label: 'Overview', detail: 'Mastery' },
    { id: 'courses', label: 'Courses', detail: `${trackCount} tracks` },
    { id: 'practice', label: 'Practice', detail: `${trapCount} traps` },
    { id: 'tutor', label: 'Tutor', detail: 'AI coach' },
    { id: 'rewards', label: 'Rewards', detail: `${coins} coins` },
  ];
}

export function openErrorNotebookFromOverview(isOpen: boolean): {
  nextShowErrorNotebook: boolean;
  nextWorkspaceTab?: StudentWorkspaceTabId;
  shouldNotify: boolean;
} {
  const nextShowErrorNotebook = !isOpen;

  return {
    nextShowErrorNotebook,
    nextWorkspaceTab: nextShowErrorNotebook ? 'practice' : undefined,
    shouldNotify: nextShowErrorNotebook,
  };
}

export function purchaseMascotItem(
  unlockedItems: string[],
  currentCoins: number,
  item: string,
  price: number,
): MascotPurchaseResult {
  if (unlockedItems.includes(item)) {
    return { status: 'already_unlocked', nextCoins: currentCoins, nextUnlockedItems: unlockedItems };
  }

  if (currentCoins < price) {
    return { status: 'insufficient_coins', nextCoins: currentCoins, nextUnlockedItems: unlockedItems };
  }

  return {
    status: 'purchased',
    nextCoins: currentCoins - price,
    nextUnlockedItems: [...unlockedItems, item],
  };
}

export function toggleMascotItem(currentItem: string, item: string): string {
  return currentItem === item ? '' : item;
}

export function resolveErrorRetry(
  errorQuestions: ErrorNotebookQuestion[],
  questionId: string,
  selectedAnswer: string,
  correctAnswer: string,
  currentCoins: number,
  currentTrapCount: number,
  reward = ERROR_RETRY_REWARD,
): RetryErrorResult {
  const isCorrect = selectedAnswer === correctAnswer;
  const triedAt = new Date();
  const attemptedQuestion = errorQuestions.find((question) => question.id === questionId);
  const nextRetryAttempts = isCorrect ? attemptedQuestion?.retryAttempts || 0 : (attemptedQuestion?.retryAttempts || 0) + 1;
  const nextStage = isCorrect
    ? Math.max(0, (attemptedQuestion?.stage || 0) - 1)
    : Math.min(5, (attemptedQuestion?.stage || 1) + 1);
  const retryStatus = deriveRetryStatus({
    ...(attemptedQuestion || {
      id: questionId,
      text: '',
      stage: nextStage,
      answer: correctAnswer,
      options: [],
      answerExpl: '',
    }),
    stage: nextStage,
    retryAttempts: nextRetryAttempts,
  });

  if (!isCorrect) {
    return {
      isCorrect,
      nextErrorQuestions: errorQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              stage: nextStage,
              retryAttempts: nextRetryAttempts,
              lastTriedAt: triedAt.toISOString(),
              dueAt: dueAtForStage(nextStage, triedAt).toISOString(),
            }
          : question,
      ),
      nextCoins: currentCoins,
      nextTrapCount: currentTrapCount,
      retryAttempts: nextRetryAttempts,
      retryStatusCode: retryStatus.code,
    };
  }

  return {
    isCorrect,
    nextErrorQuestions: errorQuestions.map((question) =>
      question.id === questionId
        ? {
            ...question,
            stage: nextStage,
            correctRetryCount: (question.correctRetryCount || 0) + 1,
            retryAttempts: Math.max(0, nextRetryAttempts - 1),
            lastTriedAt: triedAt.toISOString(),
            dueAt: dueAtForStage(nextStage, triedAt).toISOString(),
          }
        : question,
    ),
    nextCoins: currentCoins + reward,
    nextTrapCount: Math.max(0, currentTrapCount - 1),
    retryAttempts: Math.max(0, nextRetryAttempts - 1),
    retryStatusCode: retryStatus.code,
  };
}

export function recordStudyDiary(
  diaryList: DiaryEntry[],
  text: string,
  mood: string,
  currentCoins: number,
  coinReward: number,
  date = new Date().toLocaleDateString('vi-VN'),
): DiaryUpdateResult {
  const entry = {
    text: text.trim(),
    mood,
    date,
  };

  return {
    entry,
    nextDiaryList: [entry, ...diaryList],
    nextCoins: currentCoins + coinReward,
  };
}

function deriveErrorProfile(question: ErrorNotebookQuestion): {
  errorType: ErrorNotebookV2Type;
  rootCause: string;
  missedStep: string;
  repairLessonTitle: string;
  repairLessonDetail: string;
  groupKey: string;
  groupLabel: string;
} {
  const text = `${question.id} ${question.text} ${question.answerExpl}`.toLowerCase();
  const explicitType = question.errorType as ErrorNotebookV2Type | undefined;

  if (question.repairLessonId === 'math9.algebra_transform.repair' || question.id === 'err-1' || text.includes('sqrt')) {
    return {
      errorType: explicitType || 'knowledge',
      rootCause: 'Chua giu dieu kien va mau chung truoc khi rut gon bieu thuc.',
      missedStep: 'Viet dieu kien xac dinh, tach mau thanh nhan tu, roi moi triet tieu.',
      repairLessonTitle: question.repairLessonTitle || 'Algebra Transform Repair',
      repairLessonDetail: 'Quay lai micro lesson bien doi dai so: dieu kien -> quy dong -> rut gon -> doi chieu.',
      groupKey: 'math.algebra_transform',
      groupLabel: 'Math: algebra transform',
    };
  }

  if (question.repairLessonId === 'math9.geometry_proof.scaffold' || question.id === 'err-2' || text.includes('circle') || text.includes('duong')) {
    return {
      errorType: explicitType || 'knowledge',
      rootCause: 'Chua noi duoc given voi theorem hinh hoc phu hop.',
      missedStep: 'Viet 4 dong: given, need prove, theorem candidates, proof plan.',
      repairLessonTitle: question.repairLessonTitle || 'Geometry Proof Scaffold',
      repairLessonDetail: 'Dung khung chung minh hinh hoc truoc khi viet loi giai day du.',
      groupKey: 'math.geometry_proof',
      groupLabel: 'Math: geometry proof',
    };
  }

  if (question.id === 'err-3' || text.includes('although') || text.includes('grammar')) {
    return {
      errorType: explicitType || 'knowledge',
      rootCause: 'Nhan dien sai cau truc nhuong bo va lien tu.',
      missedStep: 'Khi cau da co Although/Even though, khong them but o menh de sau.',
      repairLessonTitle: question.repairLessonTitle || 'Concession Clause Repair',
      repairLessonDetail: 'On grammar micro lesson ve subordinator/coordinator, sau do lam 3 cau bien doi cau.',
      groupKey: 'eng.grammar_accuracy',
      groupLabel: 'English: grammar accuracy',
    };
  }

  if (question.programId === 'sat' || text.includes('sat ')) {
    const isMath = question.domainId === 'mathematics' || text.includes('math') || text.includes('algebra') || text.includes('geometry');
    const errorType: ErrorNotebookV2Type = explicitType || (isMath ? 'calculation' : 'reading_prompt');
    const firstSkill = question.skillIds?.[0] || 'sat.mixed_skill';
    return {
      errorType,
      rootCause: isMath
        ? 'Cach giai co the dung huong nhung thieu buoc kiem tra nhanh hoac rut gon.'
        : 'Doc cau hoi chua tach claim, evidence va distractor.',
      missedStep: isMath
        ? 'Viet lai equation/constraint truoc khi bam may hoac tinh nhanh.'
        : 'Gach chan yeu cau cau hoi truoc khi nhin dap an.',
      repairLessonTitle: question.repairLessonTitle || (isMath ? 'SAT Math Strategy Repair' : 'SAT Reading Trap Repair'),
      repairLessonDetail: isMath
        ? 'Lam 2 cau cung skill, moi cau ghi equation setup va shortcut hop le.'
        : 'Lam 2 cau evidence/inference, moi cau ghi vi sao distractor bi loai.',
      groupKey: firstSkill,
      groupLabel: firstSkill.replace(/^sat\./, 'SAT: ').replace(/_/g, ' '),
    };
  }

  const firstTarget = question.skillIds?.[0] || question.conceptIds?.[0] || 'mixed_error';
  return {
    errorType: explicitType || 'knowledge',
    rootCause: question.rootCause || 'Chua co du metadata, can doc explanation va gan nhan root cause sau.',
    missedStep: question.missedStep || 'Ghi lai buoc dau tien bi lech truoc khi lam lai cau hoi.',
    repairLessonTitle: question.repairLessonTitle || 'General Repair Lesson',
    repairLessonDetail: 'Lam lai cau, xem explanation, sau do tao 1 cau tuong tu de kiem tra on dinh.',
    groupKey: firstTarget,
    groupLabel: firstTarget.replace(/[._]/g, ' '),
  };
}

function deriveRetryStatus(question: Pick<ErrorNotebookQuestion, 'stage' | 'retryAttempts'>): {
  code: ErrorNotebookRetryStatusCode;
  label: string;
} {
  if (question.stage <= 0) return { code: 'stable', label: 'Stable' };
  if ((question.retryAttempts || 0) >= 2) return { code: 'prerequisite', label: 'Return to prerequisite' };
  if ((question.retryAttempts || 0) > 0) return { code: 'repairing', label: 'Retry again with hint' };
  return { code: 'new', label: 'New repair' };
}

function dueAtForStage(stage: number, now = new Date()): Date {
  const daysByStage: Record<number, number> = {
    0: 14,
    1: 0,
    2: 1,
    3: 3,
    4: 7,
    5: 14,
  };
  const due = new Date(now);
  due.setDate(due.getDate() + (daysByStage[Math.max(0, Math.min(5, stage))] || 0));
  return due;
}

function dueLabel(dueAt: string, now = new Date()): string {
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return 'Due today';
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((startOfDay(due).getTime() - startOfDay(now).getTime()) / dayMs);
  if (diffDays <= 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function errorTypeLabel(errorType: ErrorNotebookV2Type): string {
  if (errorType === 'reading_prompt') return 'Doc de / reading prompt';
  if (errorType === 'calculation') return 'Tinh toan / thao tac';
  if (errorType === 'time_strategy') return 'Chien luoc thoi gian';
  return 'Kien thuc';
}

function severityLabel(stage: number): string {
  if (stage >= 4) return 'High recurrence';
  if (stage >= 2) return 'Needs review';
  return 'Fresh error';
}

function eventBelongsToLearner(event: LearningEventRecord, username: string): boolean {
  const learnerId = String(event.learnerId || '').toLowerCase();
  const expected = String(username || '').toLowerCase();
  return Boolean(expected && (learnerId === expected || learnerId === `user-${expected}` || learnerId.endsWith(`-${expected}`)));
}

function eventDateKey(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : getTodayPlanDateKey(date);
}

function dailyStepIdFromEvent(event: LearningEventRecord): DailyLoopStepId | null {
  const explicitStepId = String(event.payload?.dailyStepId || event.payload?.stepId || '').toLowerCase();
  if (DAILY_LOOP_STEP_IDS.includes(explicitStepId as DailyLoopStepId)) return explicitStepId as DailyLoopStepId;

  const text = normalizePlainText(`${event.type} ${event.entityType} ${event.entityId} ${event.source} ${JSON.stringify(event.payload || {})}`);
  if (text.includes('diagnostic')) return 'diagnostic';
  if (text.includes('lesson') || text.includes('micro_lesson')) return 'lesson';
  if (text.includes('independent')) return 'independent';
  if (text.includes('review') || text.includes('feedback_only') || text.includes('tutor')) return 'review';
  if (text.includes('practice') || text.includes('guided')) return 'guided';
  return null;
}

function inferErrorQuestionDomainId(question: ErrorNotebookQuestion): string {
  if (question.domainId) return question.domainId;
  const text = normalizePlainText(`${question.id} ${question.text} ${question.answerExpl}`);
  if (text.includes('english') || text.includes('grammar') || text.includes('ielts') || text.includes('sat reading')) {
    return 'english_core';
  }
  return 'mathematics';
}

function normalizeLearningIds(values: string[] | undefined, fallback: string): string[] {
  const normalized = (Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return normalized.length ? [...new Set(normalized)] : [fallback];
}

function fallbackLessonConceptId(domainId: string): string {
  return domainId === 'english_core' ? 'eng.core_skill' : 'math.algebraic_expression';
}

function fallbackLessonSkillId(domainId: string): string {
  return domainId === 'english_core' ? 'eng.academic_reading' : 'math.solve_problem';
}

function fallbackConceptId(domainId: string, question: ErrorNotebookQuestion): string {
  if (domainId === 'english_core') {
    const text = normalizePlainText(`${question.text} ${question.answerExpl}`);
    if (text.includes('inference')) return 'eng.reading_inference';
    if (text.includes('grammar') || text.includes('although')) return 'eng.grammar_accuracy';
    return 'eng.core_skill';
  }
  if (question.repairLessonId?.includes('geometry') || normalizePlainText(question.text).includes('duong tron')) {
    return 'math.geometry';
  }
  return 'math.algebraic_expression';
}

function fallbackSkillId(domainId: string, question: ErrorNotebookQuestion): string {
  if (domainId === 'english_core') {
    const text = normalizePlainText(`${question.text} ${question.answerExpl}`);
    if (text.includes('inference')) return 'eng.infer_implicit_meaning';
    if (text.includes('grammar') || text.includes('although')) return 'eng.grammar_accuracy';
    return 'eng.academic_reading';
  }
  if (question.repairLessonId?.includes('geometry') || normalizePlainText(question.text).includes('duong tron')) {
    return 'math.geometry_proof';
  }
  if (normalizePlainText(question.text).includes('sqrt')) return 'math.simplify_expression';
  return 'math.solve_problem';
}

function difficultyFromErrorStage(stage: number): string {
  if (stage >= 3) return 'hard';
  if (stage >= 1) return 'medium';
  return 'easy';
}

function errorCategoryFromQuestion(question: ErrorNotebookQuestion, domainId: string): string {
  if (question.errorType === 'reading_prompt') return 'reading_prompt';
  if (question.errorType === 'time_strategy') return 'time_management';
  if (question.errorType === 'calculation') return 'calculation';
  if (domainId === 'english_core') {
    const text = normalizePlainText(`${question.text} ${question.answerExpl}`);
    if (text.includes('inference')) return 'inference';
    if (text.includes('grammar') || text.includes('although')) return 'grammar';
    return 'reading_prompt';
  }
  const text = normalizePlainText(`${question.text} ${question.answerExpl}`);
  if (text.includes('dieu kien') || text.includes('domain')) return 'missing_condition';
  if (text.includes('sqrt') || text.includes('rut gon')) return 'algebra_transform';
  return 'calculation';
}

function misconceptionIdsFromQuestion(question: ErrorNotebookQuestion, domainId: string): string[] {
  const text = normalizePlainText(`${question.text} ${question.answerExpl}`);
  if (domainId === 'english_core') {
    if (text.includes('inference')) return ['mis.eng.inference_literal_only'];
    if (text.includes('grammar') || text.includes('although')) return ['mis.eng.grammar_connector_confusion'];
    return [];
  }
  if (text.includes('sqrt') || text.includes('rut gon') || text.includes('factor')) return ['mis.math.factor_vs_expand'];
  if (text.includes('dieu kien') || text.includes('domain')) return ['mis.math.missing_domain_condition'];
  return ['mis.math.calculation_slip'];
}

function stableEventPart(value: string): string {
  return String(value || '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'event';
}

function normalizeDailyStepIds(values: unknown[]): DailyLoopStepId[] {
  const allowed = new Set<DailyLoopStepId>(DAILY_LOOP_STEP_IDS);
  return [
    ...new Set(
      values
        .map((value) => String(value || ''))
        .filter((value): value is DailyLoopStepId => allowed.has(value as DailyLoopStepId)),
    ),
  ];
}

function normalizePlainText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function dailyPlanMinuteSplit(totalMinutes: number, repairFirst: boolean): Record<DailyLoopStepId, number> {
  if (totalMinutes >= 60) {
    return repairFirst
      ? { diagnostic: 8, lesson: 14, guided: 14, independent: 16, review: 8 }
      : { diagnostic: 6, lesson: 16, guided: 14, independent: 18, review: 6 };
  }

  if (totalMinutes >= 30) {
    return repairFirst
      ? { diagnostic: 4, lesson: 7, guided: 7, independent: 8, review: 4 }
      : { diagnostic: 3, lesson: 8, guided: 7, independent: 9, review: 3 };
  }

  return repairFirst
    ? { diagnostic: 2, lesson: 4, guided: 4, independent: 3, review: 2 }
    : { diagnostic: 2, lesson: 4, guided: 3, independent: 4, review: 2 };
}
