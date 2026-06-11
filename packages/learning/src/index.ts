export const LEARNING_EVENT_SCHEMA_VERSION = "learning_event_v1";
export const ATTEMPT_SCHEMA_VERSION = "miuprep_attempt_v1";
export const DEFAULT_LEARNING_EVENT_LIMIT = 1000;
export const SHARED_LEARNING_EVENT_STORAGE_PREFIX = "ielts_app_";
export const SHARED_LEARNING_EVENTS_LIST_KEY = `${SHARED_LEARNING_EVENT_STORAGE_PREFIX}learning_events_list`;

export type LearningMode = "diagnostic" | "practice" | "review" | "mock_test" | "lesson" | string;
export type MasteryPolicy = "tracked" | "feedback_only";
export type MasteryScope = "concept" | "skill";
export type MasteryStatus = "collect_evidence" | "repair" | "building" | "hard_proof" | "stable";
export type RecommendationKind = "diagnostic" | "review" | "practice" | "challenge";
export type ErrorNotebookStatus = "due" | "learning" | "retained";

export type ErrorCategory =
  | "none"
  | "wrong_formula"
  | "missing_condition"
  | "algebra_transform"
  | "calculation"
  | "reading_prompt"
  | "vocabulary"
  | "grammar"
  | "inference"
  | "collocation"
  | "time_management"
  | "strategy"
  | "unknown";

export interface LearningItem {
  id: string;
  domainId: string;
  programIds?: string[];
  conceptIds?: string[];
  skillIds?: string[];
  misconceptionIds?: string[];
  difficulty?: "easy" | "medium" | "hard" | string;
  masteryPolicy?: MasteryPolicy;
  feedbackArea?: string;
  tags?: string[];
}

export interface AttemptRecord {
  schemaVersion: typeof ATTEMPT_SCHEMA_VERSION;
  id: string;
  learnerId?: string;
  itemId: string;
  domainId: string;
  programId?: string;
  conceptIds: string[];
  skillIds: string[];
  correct: boolean;
  score?: number;
  maxScore?: number;
  difficulty?: "easy" | "medium" | "hard" | string;
  mode: LearningMode;
  answeredAt: string;
  timeSpentSeconds?: number;
  errorCategories?: ErrorCategory[];
  misconceptionIds?: string[];
  hintUsed?: boolean;
  payload?: Record<string, unknown>;
}

export interface StudentModel {
  schemaVersion: "student_model_v1";
  learnerId: string;
  targetProgramIds: string[];
  attempts: AttemptRecord[];
  learningEvents: LearningEventRecord[];
  updatedAt: string;
}

export interface LearningEventRecord {
  schemaVersion: typeof LEARNING_EVENT_SCHEMA_VERSION;
  id: string;
  eventId: string;
  idempotencyKey: string;
  type: "question_attempt" | "diagnostic_attempt" | "practice_attempt" | "review_attempt" | "learning_update" | string;
  learnerId: string;
  deviceId?: string;
  entityType: string;
  entityId: string;
  occurredAt: string;
  receivedAt: string;
  source: string;
  payloadHash: string;
  payload: Record<string, unknown>;
}

export interface LearningEventSummary {
  schemaVersion: typeof LEARNING_EVENT_SCHEMA_VERSION;
  total: number;
  byType: Record<string, number>;
  firstAt: string;
  lastAt: string;
  revision: string;
}

export interface LearningEventMergeConflict {
  conflictKey: string;
  reason: "same_event_id_different_payload" | "same_idempotency_key_different_payload";
  keptEventId: string;
  incomingEventId: string;
  keptPayloadHash: string;
  incomingPayloadHash: string;
}

export interface LearningEventMergeResult {
  schemaVersion: typeof LEARNING_EVENT_SCHEMA_VERSION;
  events: LearningEventRecord[];
  added: number;
  duplicates: number;
  conflicts: LearningEventMergeConflict[];
}

export interface LearningEventSyncAuditReport {
  schemaVersion: "learning_event_sync_audit_v1";
  generatedAt: string;
  status: "pass" | "watch" | "blocked";
  totalEvents: number;
  duplicateIdempotencyKeys: number;
  missingLearnerIds: number;
  missingEntityIds: number;
  invalidTimestamps: number;
  feedbackOnlyEvents: number;
  conflicts: LearningEventMergeConflict[];
  detail: string;
}

export interface LearningEventSyncAuditOptions {
  generatedAt?: string;
  conflicts?: LearningEventMergeConflict[];
}

export interface StudentModelFromEventsReport {
  schemaVersion: "student_model_from_events_v1";
  generatedAt: string;
  learnerId: string;
  targetProgramIds: string[];
  state: StudentModel;
  acceptedAttempts: number;
  feedbackOnlyEvents: number;
  skippedEvents: number;
  skippedEventIds: string[];
  detail: string;
}

export interface StudentModelFromEventsOptions {
  learnerId?: string;
  targetProgramIds?: string[];
  generatedAt?: string;
}

export interface LearningEventStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ListLearningEventsFromStorageOptions {
  learnerId?: string;
  limit?: number;
  newestFirst?: boolean;
}

export interface MasteryEstimate {
  key: string;
  scope: MasteryScope;
  id: string;
  domainId: string;
  attempts: number;
  correct: number;
  accuracy: number;
  hardAttempts: number;
  hardCorrect: number;
  consecutiveFailures: number;
  confidence: number;
  score: number;
  status: MasteryStatus;
  lastAttemptAt: string;
  lastAttemptDifficulty: string;
  lastCorrectAt: string;
  lastWrongAt: string;
  errorCategories: ErrorCategory[];
  misconceptionIds: string[];
}

export interface MasteryV2ShadowRow {
  key: string;
  scope: MasteryScope;
  id: string;
  domainId: string;
  attempts: number;
  v1Score: number;
  v2Score: number;
  delta: number;
  v1Status: MasteryStatus;
  v2Status: MasteryStatus;
  weightedAccuracy: number;
  evidenceConfidence: number;
  confidenceLevel: "low" | "medium" | "high";
  strongestEvidence: string[];
  weakestEvidence: string[];
  explanation: string;
}

export interface MasteryV2ShadowReport {
  schemaVersion: "mastery_v2_shadow_v1";
  generatedAt: string;
  rows: MasteryV2ShadowRow[];
  summary: {
    trackedRows: number;
    changedStatusRows: number;
    averageDelta: number;
    largestAbsoluteDelta: number;
    protectedFeedbackOnlyEvents: number;
  };
  studentFacingEnabled: false;
  recommendationPolicy: "v1_only";
}

export interface MasteryV2ShadowOptions {
  generatedAt?: string;
  now?: string;
}

export interface EmpiricalDifficultyShadowRow {
  itemId: string;
  programId: string;
  domainId: string;
  priorDifficulty: string;
  empiricalDifficulty: string;
  attempts: number;
  correctRate: number;
  averageTimeSeconds: number;
  hintRate: number;
  reviewRecurrence: number;
  discriminationProxy: number | null;
  eloDelta: number;
  sparse: boolean;
  applied: false;
  reason: string;
}

export interface EmpiricalDifficultyShadowReport {
  schemaVersion: "empirical_difficulty_shadow_v1";
  generatedAt: string;
  status: "pass" | "watch" | "blocked";
  rows: EmpiricalDifficultyShadowRow[];
  summary: {
    totalItems: number;
    calibratedCandidates: number;
    sparseItems: number;
    driftWatchItems: number;
    averageEloDelta: number;
  };
  calibrationPolicy: "shadow_only_prior_preserved";
  highStakesPlacementEnabled: false;
  detail: string;
}

export interface EmpiricalDifficultyShadowOptions {
  generatedAt?: string;
  minAttemptsPerItem?: number;
  driftThreshold?: number;
}

export interface Recommendation {
  kind: RecommendationKind;
  title: string;
  detail: string;
  priority: number;
  domainId?: string;
  difficulty?: string;
  conceptIds: string[];
  skillIds: string[];
  reason: string;
}

export interface DiagnosticOptions {
  limit?: number;
  programId?: string;
  domainId?: string;
  difficulties?: string[];
}

export interface PracticeOptions {
  limit?: number;
  domainId?: string;
  conceptIds?: string[];
  skillIds?: string[];
  difficulty?: string;
}

export interface LearningItemAttemptInput {
  learnerId?: string;
  programId?: string;
  correct: boolean;
  mode: LearningMode;
  answeredAt?: string;
  score?: number;
  maxScore?: number;
  timeSpentSeconds?: number;
  errorCategories?: ErrorCategory[];
  misconceptionIds?: string[];
  hintUsed?: boolean;
  payload?: Record<string, unknown>;
}

export interface LearningFeedbackInput {
  learnerId?: string;
  item?: LearningItem;
  itemId?: string;
  domainId?: string;
  programId?: string;
  conceptIds?: string[];
  skillIds?: string[];
  area: "writing" | "speaking" | string;
  feedback: string;
  rubricScores?: Record<string, number>;
  occurredAt?: string;
  source?: string;
  payload?: Record<string, unknown>;
}

export interface ErrorTaxonomyEntry {
  id: ErrorCategory;
  domainId: "mathematics" | "english_core" | string;
  name: string;
  description: string;
}

export interface ErrorCategoryMisconceptionBridge {
  errorCategory: ErrorCategory;
  domainId: "mathematics" | "english_core" | string;
  misconceptionIds: string[];
  conceptIds?: string[];
  skillIds?: string[];
  priority?: number;
}

export interface ErrorNotebookEntryCore {
  schemaVersion?: "error_notebook_v1";
  id: string;
  userId: string;
  attemptId: string;
  questionId: string;
  questionType: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  domainId?: string;
  programId?: string;
  difficulty?: string;
  conceptIds?: string[];
  skillIds?: string[];
  errorCategories?: ErrorCategory[];
  misconceptionIds?: string[];
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapseCount?: number;
  nextReviewAt: string;
  createdAt: string;
  updatedAt?: string;
  lastReviewedAt?: string;
  srsReason?: string;
}

export interface ErrorNotebookEntryInput {
  id?: string;
  userId: string;
  attemptId: string;
  questionId: string;
  questionType: string;
  userAnswer?: string | string[] | number | boolean | null;
  correctAnswer?: string | string[] | number | boolean | null;
  explanation?: string;
  domainId?: string;
  programId?: string;
  difficulty?: string;
  conceptIds?: string[];
  skillIds?: string[];
  errorCategories?: ErrorCategory[];
  misconceptionIds?: string[];
  createdAt?: string;
  nextReviewAt?: string;
  lapseCount?: number;
  srsReason?: string;
}

export interface ErrorNotebookSummary {
  total: number;
  due: number;
  learning: number;
  retained: number;
  byDomain: Record<string, number>;
  byProgram: Record<string, number>;
  byQuestionType: Record<string, number>;
  byErrorCategory: Record<string, number>;
  nextDueAt: string;
}

export type LearningPathEdgeType =
  | "prerequisite"
  | "supports"
  | "assesses"
  | "remediates"
  | "part_of"
  | "overlaps"
  | string;

export type LearningPathStepStatus = "not_started" | "collect_evidence" | "repair" | "build" | "hard_proof" | "stable";

export interface LearningPathNode {
  id: string;
  domainId: string;
  scope?: MasteryScope | "objective" | "program" | string;
  label?: string;
  programIds?: string[];
}

export interface LearningPathEdge {
  id?: string;
  from: string;
  to: string;
  type: LearningPathEdgeType;
  weight?: number;
}

export interface LearningPathOptions {
  domainId?: string;
  targetIds?: string[];
  maxSteps?: number;
  includeSupportEdges?: boolean;
}

export interface LearningPathStep {
  id: string;
  scope: string;
  domainId: string;
  label: string;
  status: LearningPathStepStatus;
  masteryScore: number;
  attempts: number;
  reason: string;
  prerequisiteIds: string[];
  unlocked: boolean;
  target: boolean;
  rank: number;
}

export interface LearningPathResult {
  targetIds: string[];
  steps: LearningPathStep[];
  blockedBy: string[];
  nextStep: LearningPathStep | null;
  generatedAt: string;
}

interface MasteryAccumulator extends MasteryEstimate {}

export const MATH_ERROR_TAXONOMY: ErrorTaxonomyEntry[] = [
  { id: "wrong_formula", domainId: "mathematics", name: "Wrong formula", description: "The learner selected or recalled the wrong formula." },
  { id: "missing_condition", domainId: "mathematics", name: "Missing condition", description: "The learner ignored a required condition or constraint." },
  { id: "algebra_transform", domainId: "mathematics", name: "Algebra transform", description: "The learner made an invalid transformation step." },
  { id: "calculation", domainId: "mathematics", name: "Calculation", description: "The reasoning path is right but arithmetic or computation is wrong." },
  { id: "reading_prompt", domainId: "mathematics", name: "Reading prompt", description: "The learner misunderstood what the problem asked." },
];

export const ENGLISH_ERROR_TAXONOMY: ErrorTaxonomyEntry[] = [
  { id: "vocabulary", domainId: "english_core", name: "Vocabulary", description: "The learner missed the meaning or register of a word or phrase." },
  { id: "grammar", domainId: "english_core", name: "Grammar", description: "The learner made a grammar or sentence control error." },
  { id: "inference", domainId: "english_core", name: "Inference", description: "The learner failed to infer implicit meaning from evidence." },
  { id: "collocation", domainId: "english_core", name: "Collocation", description: "The learner used or interpreted an unnatural word pairing." },
  { id: "time_management", domainId: "english_core", name: "Time management", description: "The learner likely lost accuracy due to pacing." },
];

export const ERROR_CATEGORY_MISCONCEPTION_BRIDGE: ErrorCategoryMisconceptionBridge[] = [
  {
    errorCategory: "wrong_formula",
    domainId: "mathematics",
    misconceptionIds: ["mis.math.factor_vs_expand"],
    conceptIds: ["math.factorization", "math.quadratic_equation"],
    skillIds: ["math.factor_common_terms", "math.solve_quadratic_by_factor"],
    priority: 8,
  },
  {
    errorCategory: "algebra_transform",
    domainId: "mathematics",
    misconceptionIds: ["mis.math.factor_vs_expand"],
    conceptIds: ["math.factorization", "math.algebraic_expression"],
    skillIds: ["math.factor_common_terms", "math.simplify_expression", "math.solve_quadratic_by_factor"],
    priority: 9,
  },
  {
    errorCategory: "missing_condition",
    domainId: "mathematics",
    misconceptionIds: ["mis.math.missing_domain_condition"],
    conceptIds: ["math.algebraic_expression", "math.functions_graphs"],
    skillIds: ["math.simplify_expression", "math.analyze_function_graph"],
    priority: 8,
  },
  {
    errorCategory: "calculation",
    domainId: "mathematics",
    misconceptionIds: ["mis.math.calculation_slip"],
    conceptIds: ["math.integer_number", "math.fraction_decimal"],
    skillIds: ["math.operate_rational_numbers", "math.convert_fraction_decimal"],
    priority: 4,
  },
  {
    errorCategory: "reading_prompt",
    domainId: "mathematics",
    misconceptionIds: ["mis.math.reading_prompt_to_equation"],
    conceptIds: ["math.word_problem_modeling"],
    skillIds: ["math.model_word_problem"],
    priority: 9,
  },
  {
    errorCategory: "inference",
    domainId: "english_core",
    misconceptionIds: ["mis.eng.inference_literal_only"],
    conceptIds: ["eng.reading_inference"],
    skillIds: ["eng.infer_implicit_meaning"],
    priority: 9,
  },
  {
    errorCategory: "vocabulary",
    domainId: "english_core",
    misconceptionIds: ["mis.eng.word_family_guessing"],
    conceptIds: ["eng.word_formation", "eng.vocabulary_range"],
    skillIds: ["eng.build_word_family"],
    priority: 7,
  },
  {
    errorCategory: "collocation",
    domainId: "english_core",
    misconceptionIds: ["mis.eng.collocation_literal_translation"],
    conceptIds: ["eng.collocation_phraseology", "eng.vocabulary_range"],
    skillIds: ["eng.use_collocation"],
    priority: 9,
  },
  {
    errorCategory: "grammar",
    domainId: "english_core",
    misconceptionIds: ["mis.eng.grammar_role_mismatch"],
    conceptIds: ["eng.grammar_accuracy", "eng.sentence_structure"],
    skillIds: ["eng.control_clause_structure", "eng.edit_sentence_errors"],
    priority: 9,
  },
  {
    errorCategory: "time_management",
    domainId: "english_core",
    misconceptionIds: ["mis.eng.time_pressure_scan_skip"],
    conceptIds: ["eng.reading_detail", "eng.listening_detail"],
    skillIds: ["eng.identify_specific_detail"],
    priority: 6,
  },
];

export function emptyStudentModel(learnerId: string, targetProgramIds: string[] = []): StudentModel {
  return {
    schemaVersion: "student_model_v1",
    learnerId,
    targetProgramIds,
    attempts: [],
    learningEvents: [],
    updatedAt: new Date().toISOString(),
  };
}

export function makeAttempt(input: Omit<AttemptRecord, "schemaVersion" | "id" | "answeredAt"> & Partial<Pick<AttemptRecord, "id" | "answeredAt">>): AttemptRecord {
  const answeredAt = input.answeredAt || new Date().toISOString();
  const base = [input.learnerId || "", input.itemId, input.mode, answeredAt, String(input.correct)].join("|");
  const errorCategories = normalizeErrorCategories(input.errorCategories || (input.correct ? ["none"] : ["unknown"]));
  return {
    ...input,
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    id: input.id || `attempt-${stableChecksum(base)}`,
    answeredAt,
    conceptIds: uniqueStrings(input.conceptIds),
    skillIds: uniqueStrings(input.skillIds),
    errorCategories,
    misconceptionIds: uniqueStrings([
      ...(input.misconceptionIds || []),
      ...(input.correct ? [] : inferMisconceptionIds({
        domainId: input.domainId,
        conceptIds: input.conceptIds,
        skillIds: input.skillIds,
        errorCategories,
      })),
    ]),
  };
}

export function recordAttempt(state: StudentModel, attemptInput: Parameters<typeof makeAttempt>[0]): { state: StudentModel; attempt: AttemptRecord; event: LearningEventRecord } {
  const attempt = makeAttempt({ ...attemptInput, learnerId: attemptInput.learnerId || state.learnerId });
  const event = buildAttemptLearningEvent(attempt);
  const learningEvents = appendLearningEvent(state.learningEvents, event);
  return {
    attempt,
    event,
    state: {
      ...state,
      attempts: [...state.attempts, attempt],
      learningEvents,
      updatedAt: event.occurredAt,
    },
  };
}

export function recordLearningItemAttempt(
  state: StudentModel,
  item: LearningItem,
  input: LearningItemAttemptInput,
): { state: StudentModel; attempt: AttemptRecord; event: LearningEventRecord } {
  return recordAttempt(state, {
    learnerId: input.learnerId || state.learnerId,
    itemId: item.id,
    domainId: item.domainId,
    programId: input.programId || pickProgramId(state, item),
    conceptIds: item.conceptIds || [],
    skillIds: item.skillIds || [],
    correct: input.correct,
    score: input.score,
    maxScore: input.maxScore,
    difficulty: item.difficulty,
    mode: input.mode,
    answeredAt: input.answeredAt,
    timeSpentSeconds: input.timeSpentSeconds,
    errorCategories: input.errorCategories,
    misconceptionIds: input.misconceptionIds || (input.correct ? [] : item.misconceptionIds || []),
    hintUsed: input.hintUsed,
    payload: input.payload,
  });
}

export function recordLearningFeedback(state: StudentModel, input: LearningFeedbackInput): { state: StudentModel; event: LearningEventRecord } {
  const item = input.item;
  const learnerId = input.learnerId || state.learnerId;
  const occurredAt = input.occurredAt || new Date().toISOString();
  const itemId = input.itemId || item?.id || "";
  const domainId = input.domainId || item?.domainId || "";
  const programId = input.programId || (item ? pickProgramId(state, item) : "");
  const conceptIds = uniqueStrings(input.conceptIds || item?.conceptIds || []);
  const skillIds = uniqueStrings(input.skillIds || item?.skillIds || []);
  const event = buildLearningEvent("feedback_only", {
    masteryPolicy: "feedback_only",
    area: input.area,
    itemId,
    domainId,
    programId,
    conceptIds,
    skillIds,
    feedback: input.feedback,
    rubricScores: input.rubricScores || {},
    ...(input.payload || {}),
  }, {
    learnerId,
    entityType: itemId ? "learning_item" : "feedback",
    entityId: itemId || `${input.area}_feedback`,
    occurredAt,
    source: input.source || "miuprep_feedback_core",
  });

  return {
    event,
    state: {
      ...state,
      learningEvents: appendLearningEvent(state.learningEvents, event),
      updatedAt: event.occurredAt,
    },
  };
}

export function inferMisconceptionIds(input: {
  domainId?: string;
  conceptIds?: string[];
  skillIds?: string[];
  errorCategories?: ErrorCategory[];
  limit?: number;
}): string[] {
  const categories = normalizeErrorCategories(input.errorCategories || ["unknown"]).filter((category) => category !== "none") as ErrorCategory[];
  if (!categories.length) return [];
  const categorySet = new Set<ErrorCategory>(categories);

  const domainId = String(input.domainId || "");
  const conceptIds = new Set(uniqueStrings(input.conceptIds || []));
  const skillIds = new Set(uniqueStrings(input.skillIds || []));
  const hasMetadata = conceptIds.size > 0 || skillIds.size > 0;
  const scored = ERROR_CATEGORY_MISCONCEPTION_BRIDGE
    .filter((entry) => categorySet.has(entry.errorCategory))
    .filter((entry) => !domainId || entry.domainId === domainId)
    .map((entry) => {
      const conceptOverlap = countOverlap(entry.conceptIds || [], conceptIds);
      const skillOverlap = countOverlap(entry.skillIds || [], skillIds);
      const metadataScore = conceptOverlap * 2 + skillOverlap * 3;
      return {
        entry,
        score: (entry.priority || 1) + metadataScore + (hasMetadata && metadataScore === 0 ? -4 : 0),
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.errorCategory.localeCompare(b.entry.errorCategory));

  const limit = Math.max(1, Number(input.limit || 3));
  return uniqueStrings(scored.flatMap((candidate) => candidate.entry.misconceptionIds)).slice(0, limit);
}

export function buildErrorNotebookEntry(input: ErrorNotebookEntryInput): ErrorNotebookEntryCore {
  const createdAt = input.createdAt || new Date().toISOString();
  const id =
    input.id ||
    `err-${stableChecksum([input.userId, input.attemptId, input.questionId, createdAt, input.userAnswer ?? ""].join("|"))}`;
  const errorCategories = normalizeErrorCategories(input.errorCategories || ["unknown"]);

  return normalizeErrorNotebookEntry({
    schemaVersion: "error_notebook_v1",
    id,
    userId: input.userId,
    attemptId: input.attemptId,
    questionId: input.questionId,
    questionType: input.questionType,
    userAnswer: stringifyAnswer(input.userAnswer),
    correctAnswer: stringifyAnswer(input.correctAnswer),
    explanation: input.explanation || "",
    domainId: input.domainId || "",
    programId: input.programId || "",
    difficulty: normalizeDifficulty(input.difficulty || "medium"),
    conceptIds: uniqueStrings(input.conceptIds || []),
    skillIds: uniqueStrings(input.skillIds || []),
    errorCategories,
    misconceptionIds: uniqueStrings([
      ...(input.misconceptionIds || []),
      ...inferMisconceptionIds({
        domainId: input.domainId,
        conceptIds: input.conceptIds,
        skillIds: input.skillIds,
        errorCategories,
      }),
    ]),
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    lapseCount: Math.max(0, Math.round(Number(input.lapseCount || 0))),
    nextReviewAt: input.nextReviewAt || createdAt,
    createdAt,
    updatedAt: createdAt,
    srsReason: input.srsReason || "New mistake starts with an immediate review due date.",
  });
}

export function buildErrorNotebookEntryFromAttempt(
  attempt: AttemptRecord,
  input: Omit<ErrorNotebookEntryInput, "userId" | "attemptId" | "questionId" | "questionType" | "domainId" | "programId" | "conceptIds" | "skillIds" | "errorCategories" | "misconceptionIds" | "createdAt"> & {
    userId?: string;
    questionType?: string;
    createdAt?: string;
  } = {},
): ErrorNotebookEntryCore | null {
  if (attempt.correct) return null;
  return buildErrorNotebookEntry({
    ...input,
    userId: input.userId || attempt.learnerId || "",
    attemptId: attempt.id,
    questionId: attempt.itemId,
    questionType: input.questionType || String(attempt.payload?.questionType || attempt.payload?.type || "unknown"),
    domainId: attempt.domainId,
    programId: attempt.programId || "",
    difficulty: attempt.difficulty || "medium",
    conceptIds: attempt.conceptIds,
    skillIds: attempt.skillIds,
    errorCategories: attempt.errorCategories && attempt.errorCategories.length ? attempt.errorCategories : ["unknown"],
    misconceptionIds: attempt.misconceptionIds || [],
    createdAt: input.createdAt || attempt.answeredAt,
  });
}

export function normalizeErrorNotebookEntry(entry: ErrorNotebookEntryCore): ErrorNotebookEntryCore {
  const createdAt = entry.createdAt || new Date().toISOString();
  return {
    ...entry,
    schemaVersion: "error_notebook_v1",
    id: String(entry.id || `err-${stableChecksum([entry.userId, entry.attemptId, entry.questionId, createdAt].join("|"))}`),
    userId: String(entry.userId || ""),
    attemptId: String(entry.attemptId || ""),
    questionId: String(entry.questionId || ""),
    questionType: String(entry.questionType || "unknown"),
    userAnswer: String(entry.userAnswer || ""),
    correctAnswer: String(entry.correctAnswer || ""),
    explanation: String(entry.explanation || ""),
    domainId: String(entry.domainId || ""),
    programId: String(entry.programId || ""),
    difficulty: normalizeDifficulty(entry.difficulty || "medium"),
    conceptIds: uniqueStrings(entry.conceptIds || []),
    skillIds: uniqueStrings(entry.skillIds || []),
    errorCategories: normalizeErrorCategories(entry.errorCategories || ["unknown"]),
    misconceptionIds: uniqueStrings(entry.misconceptionIds || []),
    intervalDays: Math.max(1, Math.round(Number(entry.intervalDays || 1))),
    easeFactor: clamp(Number(entry.easeFactor || 2.5), 1.3, 2.5),
    repetitions: Math.max(0, Math.round(Number(entry.repetitions || 0))),
    lapseCount: Math.max(0, Math.round(Number(entry.lapseCount || 0))),
    nextReviewAt: entry.nextReviewAt || createdAt,
    createdAt,
    updatedAt: entry.updatedAt || createdAt,
    lastReviewedAt: entry.lastReviewedAt || "",
    srsReason: entry.srsReason || "SRS schedule normalized from stored entry.",
  };
}

export function scheduleErrorNotebookReview(entry: ErrorNotebookEntryCore, grade: number, reviewedAt: string = new Date().toISOString()): ErrorNotebookEntryCore {
  const normalized = normalizeErrorNotebookEntry(entry);
  const boundedGrade = clamp(Math.round(Number(grade || 0)), 0, 5);
  let repetitions = normalized.repetitions;
  let intervalDays = normalized.intervalDays;
  let easeFactor = normalized.easeFactor;
  let lapseCount = normalized.lapseCount || 0;
  let baseIntervalDays = intervalDays;
  const misconceptionCount = (normalized.misconceptionIds || []).length;

  if (boundedGrade >= 3) {
    if (repetitions === 0) baseIntervalDays = 1;
    else if (repetitions === 1) baseIntervalDays = 6;
    else baseIntervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    intervalDays = tuneSrsIntervalDays(baseIntervalDays, boundedGrade, normalized.difficulty || "medium", lapseCount, misconceptionCount);
    repetitions += 1;
  } else {
    repetitions = 0;
    intervalDays = 1;
    baseIntervalDays = 1;
    lapseCount += 1;
  }

  easeFactor = clamp(easeFactor + (0.1 - (5 - boundedGrade) * (0.08 + (5 - boundedGrade) * 0.02)), 1.3, 2.5);

  return {
    ...normalized,
    intervalDays,
    easeFactor,
    repetitions,
    lapseCount,
    nextReviewAt: addDaysIso(reviewedAt, intervalDays),
    updatedAt: reviewedAt,
    lastReviewedAt: reviewedAt,
    srsReason: buildSrsReason({
      grade: boundedGrade,
      difficulty: normalized.difficulty || "medium",
      previousLapseCount: normalized.lapseCount || 0,
      nextLapseCount: lapseCount,
      misconceptionCount,
      baseIntervalDays,
      intervalDays,
      repetitions,
    }),
  };
}

function tuneSrsIntervalDays(baseIntervalDays: number, grade: number, difficulty: string, lapseCount: number, misconceptionCount: number = 0): number {
  const difficultyMultiplier = srsDifficultyMultiplier(difficulty);
  const gradeMultiplier = grade >= 5 ? 1.15 : grade === 3 ? 0.85 : 1;
  const lapseMultiplier = Math.pow(0.85, Math.min(3, Math.max(0, lapseCount)));
  const misconceptionMultiplier = misconceptionCount > 0 ? 0.9 : 1;
  return Math.max(1, Math.round(baseIntervalDays * difficultyMultiplier * gradeMultiplier * lapseMultiplier * misconceptionMultiplier));
}

function srsDifficultyMultiplier(difficulty: string): number {
  const normalized = normalizeDifficulty(difficulty);
  if (normalized === "hard") return 0.85;
  if (normalized === "easy") return 1.15;
  return 1;
}

function buildSrsReason(input: {
  grade: number;
  difficulty: string;
  previousLapseCount: number;
  nextLapseCount: number;
  misconceptionCount: number;
  baseIntervalDays: number;
  intervalDays: number;
  repetitions: number;
}): string {
  if (input.grade < 3) {
    return `Grade ${input.grade} reset the card to 1 day; lapse count ${input.previousLapseCount} -> ${input.nextLapseCount}.`;
  }
  const misconceptionDetail = input.misconceptionCount > 0 ? `, misconception signals ${input.misconceptionCount}` : "";
  return `Grade ${input.grade}, difficulty ${normalizeDifficulty(input.difficulty)}, lapse count ${input.previousLapseCount}${misconceptionDetail}, base ${input.baseIntervalDays} days -> ${input.intervalDays} days after SRS tuning; repetitions now ${input.repetitions}.`;
}

export function getDueErrorNotebookEntries(entries: ErrorNotebookEntryCore[], now: string = new Date().toISOString()): ErrorNotebookEntryCore[] {
  return entries
    .map(normalizeErrorNotebookEntry)
    .filter((entry) => entry.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt) || a.createdAt.localeCompare(b.createdAt));
}

export function summarizeErrorNotebook(entries: ErrorNotebookEntryCore[], now: string = new Date().toISOString()): ErrorNotebookSummary {
  const normalized = entries.map(normalizeErrorNotebookEntry);
  const due = normalized.filter((entry) => entry.nextReviewAt <= now);
  const learning = normalized.filter((entry) => entry.nextReviewAt > now && entry.repetitions <= 1);
  const retained = normalized.filter((entry) => entry.nextReviewAt > now && entry.repetitions > 1);
  const sortedFuture = normalized.filter((entry) => entry.nextReviewAt > now).sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));

  return {
    total: normalized.length,
    due: due.length,
    learning: learning.length,
    retained: retained.length,
    byDomain: countBy(normalized.map((entry) => entry.domainId || "unknown")),
    byProgram: countBy(normalized.map((entry) => entry.programId || "unknown")),
    byQuestionType: countBy(normalized.map((entry) => entry.questionType || "unknown")),
    byErrorCategory: countBy(normalized.flatMap((entry) => entry.errorCategories || ["unknown"])),
    nextDueAt: due[0]?.nextReviewAt || sortedFuture[0]?.nextReviewAt || "",
  };
}

export function buildLearningPath(
  mastery: MasteryEstimate[] = [],
  nodes: LearningPathNode[] = [],
  edges: LearningPathEdge[] = [],
  options: LearningPathOptions = {},
): LearningPathResult {
  const validNodes = (Array.isArray(nodes) ? nodes : []).filter((node) => {
    if (!node?.id) return false;
    return !options.domainId || node.domainId === options.domainId;
  });
  const nodeById = new Map(validNodes.map((node) => [node.id, normalizeLearningPathNode(node)]));
  const masteryById = new Map((Array.isArray(mastery) ? mastery : []).map((row) => [row.id, row]));
  const allowedEdgeTypes = new Set<LearningPathEdgeType>(["prerequisite"]);
  if (options.includeSupportEdges !== false) allowedEdgeTypes.add("supports");

  const incoming = new Map<string, LearningPathEdge[]>();
  for (const edge of Array.isArray(edges) ? edges : []) {
    if (!edge?.from || !edge?.to || !allowedEdgeTypes.has(edge.type)) continue;
    if (!nodeById.has(edge.from) || !nodeById.has(edge.to)) continue;
    appendToEdgeMap(incoming, edge.to, edge);
  }

  const targetIds = pickLearningPathTargets(mastery, validNodes, nodeById, options);
  const orderedIds: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (nodeId: string): void => {
    if (!nodeById.has(nodeId) || visited.has(nodeId) || visiting.has(nodeId)) return;
    visiting.add(nodeId);
    const prerequisites = (incoming.get(nodeId) || []).sort(compareLearningPathEdges);
    for (const edge of prerequisites) visit(edge.from);
    visiting.delete(nodeId);
    visited.add(nodeId);
    orderedIds.push(nodeId);
  };

  targetIds.forEach(visit);
  const targetSet = new Set(targetIds);
  const steps = orderedIds.map((id, index) => buildLearningPathStep(nodeById.get(id)!, masteryById, incoming, targetSet, index));
  const maxSteps = Math.max(1, Number(options.maxSteps || steps.length || 1));
  const trimmedSteps = trimLearningPathSteps(steps, maxSteps);
  const blockedBy = trimmedSteps.filter((step) => !step.unlocked).flatMap((step) => step.prerequisiteIds);
  const nextStep = trimmedSteps.find((step) => step.status !== "stable") || trimmedSteps[trimmedSteps.length - 1] || null;

  return {
    targetIds,
    steps: trimmedSteps,
    blockedBy: uniqueStrings(blockedBy),
    nextStep,
    generatedAt: new Date().toISOString(),
  };
}

export function buildAttemptLearningEvent(attempt: AttemptRecord, source = "miuprep_learning_core"): LearningEventRecord {
  return buildLearningEvent(`${attempt.mode}_attempt`, {
    attemptId: attempt.id,
    itemId: attempt.itemId,
    domainId: attempt.domainId,
    programId: attempt.programId || "",
    conceptIds: attempt.conceptIds,
    skillIds: attempt.skillIds,
    correct: attempt.correct,
    score: attempt.score,
    maxScore: attempt.maxScore,
    difficulty: attempt.difficulty || "",
    mode: attempt.mode,
    errorCategories: attempt.errorCategories || [],
    misconceptionIds: attempt.misconceptionIds || [],
    hintUsed: Boolean(attempt.hintUsed),
    timeSpentSeconds: attempt.timeSpentSeconds || 0,
  }, {
    learnerId: attempt.learnerId || "",
    entityType: "learning_item",
    entityId: attempt.itemId,
    occurredAt: attempt.answeredAt,
    source,
  });
}

export function buildLearningEvent(
  type: string = "learning_update",
  payload: Record<string, unknown> = {},
  context: Partial<LearningEventRecord> = {},
): LearningEventRecord {
  const occurredAt = context.occurredAt || new Date().toISOString();
  const receivedAt = context.receivedAt || new Date().toISOString();
  const payloadHash = context.payloadHash || stableChecksum(stableJsonStringify(payload));
  const event: LearningEventRecord = {
    schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
    id: context.id || "",
    eventId: context.eventId || context.id || "",
    idempotencyKey: context.idempotencyKey || "",
    type: normalizeEventType(type),
    learnerId: context.learnerId || "",
    deviceId: context.deviceId || undefined,
    entityType: context.entityType || String(payload.entityType || ""),
    entityId: context.entityId || String(payload.entityId || payload.itemId || payload.attemptId || ""),
    occurredAt,
    receivedAt,
    source: context.source || "miuprep_learning_core",
    payloadHash,
    payload: { ...payload },
  };
  event.idempotencyKey = event.idempotencyKey || buildIdempotencyKey(event);
  event.id = event.id || event.idempotencyKey;
  event.eventId = event.eventId || event.id;
  return event;
}

export function normalizeLearningEvents(events: unknown[] = []): LearningEventRecord[] {
  const seen = new Set<string>();
  return (Array.isArray(events) ? events : [])
    .filter((event): event is Record<string, unknown> => Boolean(event && typeof event === "object" && !Array.isArray(event)))
    .map((event) => {
      const payload = event.payload && typeof event.payload === "object" && !Array.isArray(event.payload) ? { ...(event.payload as Record<string, unknown>) } : {};
      const payloadHash = String(event.payloadHash || stableChecksum(stableJsonStringify(payload)));
      const normalized: LearningEventRecord = {
        schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
        id: String(event.id || event.eventId || ""),
        eventId: String(event.eventId || event.id || ""),
        idempotencyKey: String(event.idempotencyKey || ""),
        type: normalizeEventType(String(event.type || "")),
        learnerId: String(event.learnerId || event.accountId || ""),
        deviceId: String(event.deviceId || "") || undefined,
        entityType: String(event.entityType || ""),
        entityId: String(event.entityId || ""),
        occurredAt: String(event.occurredAt || event.at || ""),
        receivedAt: String(event.receivedAt || event.occurredAt || event.at || ""),
        source: String(event.source || "miuprep_learning_core"),
        payloadHash,
        payload,
      };
      normalized.idempotencyKey = normalized.idempotencyKey || buildIdempotencyKey(normalized);
      normalized.id = normalized.id || normalized.idempotencyKey;
      normalized.eventId = normalized.eventId || normalized.id;
      return normalized;
    })
    .filter((event) => {
      const key = event.idempotencyKey || event.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => String(a.occurredAt || "").localeCompare(String(b.occurredAt || "")));
}

export function mergeLearningEventLogs(
  currentEvents: unknown[] = [],
  incomingEvents: unknown[] = [],
  limit = DEFAULT_LEARNING_EVENT_LIMIT,
): LearningEventMergeResult {
  const merged = normalizeLearningEvents(currentEvents);
  const incoming = normalizeLearningEvents(incomingEvents);
  const byEventId = new Map(merged.map((event) => [event.eventId || event.id, event]));
  const byIdempotencyKey = new Map(merged.map((event) => [event.idempotencyKey || event.id, event]));
  const conflicts: LearningEventMergeConflict[] = [];
  let added = 0;
  let duplicates = 0;

  for (const event of incoming) {
    const sameEventId = byEventId.get(event.eventId || event.id);
    if (sameEventId) {
      if (sameEventId.payloadHash !== event.payloadHash) {
        conflicts.push(buildLearningEventMergeConflict("same_event_id_different_payload", sameEventId, event));
      } else {
        duplicates += 1;
      }
      continue;
    }

    const sameIdempotency = byIdempotencyKey.get(event.idempotencyKey || event.id);
    if (sameIdempotency) {
      if (sameIdempotency.payloadHash !== event.payloadHash) {
        conflicts.push(buildLearningEventMergeConflict("same_idempotency_key_different_payload", sameIdempotency, event));
      } else {
        duplicates += 1;
      }
      continue;
    }

    merged.push(event);
    byEventId.set(event.eventId || event.id, event);
    byIdempotencyKey.set(event.idempotencyKey || event.id, event);
    added += 1;
  }

  const cappedLimit = Math.max(50, Number(limit || DEFAULT_LEARNING_EVENT_LIMIT));
  const normalizedMerged = normalizeLearningEvents(merged);
  const events = normalizedMerged.slice(Math.max(0, normalizedMerged.length - cappedLimit));
  return {
    schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
    events,
    added,
    duplicates,
    conflicts,
  };
}

export function buildLearningEventSyncAuditReport(
  events: unknown[] = [],
  options: LearningEventSyncAuditOptions = {},
): LearningEventSyncAuditReport {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const normalizedWithRepeats = (Array.isArray(events) ? events : [])
    .flatMap((event) => normalizeLearningEvents([event]));
  const normalized = normalizeLearningEvents(events);
  const keyCounts = countBy(normalizedWithRepeats.map((event) => event.idempotencyKey || event.id));
  const duplicateIdempotencyKeys = Object.values(keyCounts).reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  const missingLearnerIds = normalized.filter((event) => !event.learnerId).length;
  const missingEntityIds = normalized.filter((event) => !event.entityId && !event.payload?.itemId && !event.payload?.attemptId).length;
  const invalidTimestamps = normalized.filter((event) => !isValidIsoLike(event.occurredAt) || !isValidIsoLike(event.receivedAt)).length;
  const feedbackOnlyEvents = normalized.filter((event) => event.type === "feedback_only" || event.payload?.masteryPolicy === "feedback_only").length;
  const conflicts = options.conflicts || [];
  const status: LearningEventSyncAuditReport["status"] = conflicts.length || missingLearnerIds || missingEntityIds || invalidTimestamps
    ? "blocked"
    : duplicateIdempotencyKeys
      ? "watch"
      : "pass";

  return {
    schemaVersion: "learning_event_sync_audit_v1",
    generatedAt,
    status,
    totalEvents: normalized.length,
    duplicateIdempotencyKeys,
    missingLearnerIds,
    missingEntityIds,
    invalidTimestamps,
    feedbackOnlyEvents,
    conflicts,
    detail:
      status === "blocked"
        ? "Sync audit found conflicts, missing required identifiers, or invalid timestamps that need review before import."
        : status === "watch"
          ? "Sync audit found duplicate idempotency keys, but no destructive conflict."
          : "Sync audit passed: events are normalized, unique, timestamped, and conflict-free.",
  };
}

export function buildStudentModelFromLearningEvents(
  events: unknown[] = [],
  options: StudentModelFromEventsOptions = {},
): StudentModelFromEventsReport {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const normalized = normalizeLearningEvents(events);
  const learnerId = options.learnerId || normalized.find((event) => event.learnerId)?.learnerId || "unknown_learner";
  const scopedEvents = learnerId === "unknown_learner"
    ? normalized
    : normalized.filter((event) => event.learnerId === learnerId);
  const skippedEventIds: string[] = [];
  const attempts: AttemptRecord[] = [];

  for (const event of scopedEvents) {
    if (!isAttemptEventType(event.type)) continue;
    const attempt = attemptFromLearningEvent(event);
    if (!attempt) {
      skippedEventIds.push(event.id || event.eventId || event.idempotencyKey || "unknown_event");
      continue;
    }
    attempts.push(attempt);
  }

  const targetProgramIds = uniqueStrings([
    ...(options.targetProgramIds || []),
    ...attempts.map((attempt) => attempt.programId || ""),
    ...scopedEvents.map((event) => readString(event.payload?.programId)),
  ].filter(Boolean));
  const feedbackOnlyEvents = scopedEvents.filter((event) => event.type === "feedback_only" || event.payload?.masteryPolicy === "feedback_only").length;
  const updatedAt = attempts[attempts.length - 1]?.answeredAt || scopedEvents[scopedEvents.length - 1]?.occurredAt || generatedAt;
  const state: StudentModel = {
    schemaVersion: "student_model_v1",
    learnerId,
    targetProgramIds,
    attempts,
    learningEvents: scopedEvents,
    updatedAt,
  };

  return {
    schemaVersion: "student_model_from_events_v1",
    generatedAt,
    learnerId,
    targetProgramIds,
    state,
    acceptedAttempts: attempts.length,
    feedbackOnlyEvents,
    skippedEvents: skippedEventIds.length,
    skippedEventIds,
    detail:
      skippedEventIds.length
        ? "StudentModel import kept the normalized event log but skipped attempt events missing item, domain, or correctness evidence."
        : "StudentModel import reconstructed tracked attempts from normalized learning events; feedback-only events stayed protected from mastery.",
  };
}

export function appendLearningEvent(events: unknown[] = [], event: LearningEventRecord, limit = DEFAULT_LEARNING_EVENT_LIMIT): LearningEventRecord[] {
  const cappedLimit = Math.max(50, Number(limit || DEFAULT_LEARNING_EVENT_LIMIT));
  const normalized = normalizeLearningEvents([...events, event]);
  return normalized.slice(Math.max(0, normalized.length - cappedLimit));
}

export function sharedLearningEventStorageKey(eventId: string): string {
  return `${SHARED_LEARNING_EVENT_STORAGE_PREFIX}learning_event_${eventId}`;
}

export function saveLearningEventToStorage(event: LearningEventRecord | null | undefined, storage?: LearningEventStorageLike | null): LearningEventRecord | null {
  return saveLearningEventsToStorage(event ? [event] : [], storage)[0] || null;
}

export function saveLearningEventsToStorage(events: unknown[] = [], storage?: LearningEventStorageLike | null): LearningEventRecord[] {
  const targetStorage = resolveLearningEventStorage(storage);
  if (!targetStorage) return [];

  const normalized = normalizeLearningEvents(events);
  if (!normalized.length) return [];

  const storedIds = safeJsonParse(targetStorage.getItem(SHARED_LEARNING_EVENTS_LIST_KEY), []);
  const nextIds = Array.isArray(storedIds) ? storedIds.map((id) => String(id || "")).filter(Boolean) : [];

  for (const event of normalized) {
    if (!nextIds.includes(event.id)) nextIds.push(event.id);
    targetStorage.setItem(sharedLearningEventStorageKey(event.id), JSON.stringify(event));
  }
  targetStorage.setItem(SHARED_LEARNING_EVENTS_LIST_KEY, JSON.stringify(nextIds));
  return normalized;
}

export function listLearningEventsFromStorage(storage?: LearningEventStorageLike | null, options: ListLearningEventsFromStorageOptions = {}): LearningEventRecord[] {
  const targetStorage = resolveLearningEventStorage(storage);
  if (!targetStorage) return [];

  const storedIds = safeJsonParse(targetStorage.getItem(SHARED_LEARNING_EVENTS_LIST_KEY), []);
  const ids = Array.isArray(storedIds) ? storedIds.map((id) => String(id || "")).filter(Boolean) : [];
  const normalized = normalizeLearningEvents(
    ids
      .map((id) => safeJsonParse(targetStorage.getItem(sharedLearningEventStorageKey(id)), null))
      .filter(Boolean),
  );
  const filtered = options.learnerId ? normalized.filter((event) => event.learnerId === options.learnerId) : normalized;
  const ordered = options.newestFirst === false ? filtered : [...filtered].reverse();
  const limit = Number(options.limit || 0);
  return limit > 0 ? ordered.slice(0, limit) : ordered;
}

export function summarizeLearningEvents(events: unknown[] = []): LearningEventSummary {
  const normalized = normalizeLearningEvents(events);
  const byType = normalized.reduce<Record<string, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
  return {
    schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
    total: normalized.length,
    byType,
    firstAt: normalized[0]?.occurredAt || "",
    lastAt: normalized[normalized.length - 1]?.occurredAt || "",
    revision: stableChecksum(normalized.map((event) => event.id).join("|")),
  };
}

export function computeMastery(input: StudentModel | AttemptRecord[]): MasteryEstimate[] {
  const attempts = Array.isArray(input) ? input : input.attempts;
  const rows = new Map<string, MasteryAccumulator>();

  for (const attempt of attempts) {
    const conceptIds = attempt.conceptIds.length ? attempt.conceptIds : [`${attempt.domainId}.untagged_concept`];
    const skillIds = attempt.skillIds.length ? attempt.skillIds : [`${attempt.domainId}.untagged_skill`];
    for (const conceptId of conceptIds) {
      updateMastery(rows, "concept", conceptId, attempt);
    }
    for (const skillId of skillIds) {
      updateMastery(rows, "skill", skillId, attempt);
    }
  }

  return [...rows.values()]
    .map(finalizeMastery)
    .sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.score - b.score || b.attempts - a.attempts);
}

export function computeMasteryV2ShadowReport(input: StudentModel | AttemptRecord[], options: MasteryV2ShadowOptions = {}): MasteryV2ShadowReport {
  const attempts = Array.isArray(input) ? input : input.attempts;
  const generatedAt = options.generatedAt || new Date().toISOString();
  const now = options.now || generatedAt;
  const v1Rows = computeMastery(attempts);
  const protectedFeedbackOnlyEvents = Array.isArray(input)
    ? 0
    : normalizeLearningEvents(input.learningEvents || []).filter((event) => event.payload?.masteryPolicy === "feedback_only" || event.type === "feedback_only").length;
  const rows = v1Rows
    .map((row) => buildMasteryV2ShadowRow(row, attemptsForMasteryRow(attempts, row), now))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || statusRank(a.v2Status) - statusRank(b.v2Status) || a.id.localeCompare(b.id));
  const changedStatusRows = rows.filter((row) => row.v1Status !== row.v2Status).length;

  return {
    schemaVersion: "mastery_v2_shadow_v1",
    generatedAt,
    rows,
    summary: {
      trackedRows: rows.length,
      changedStatusRows,
      averageDelta: round2(averageNumber(rows.map((row) => row.delta))),
      largestAbsoluteDelta: rows.length ? Math.max(...rows.map((row) => Math.abs(row.delta))) : 0,
      protectedFeedbackOnlyEvents,
    },
    studentFacingEnabled: false,
    recommendationPolicy: "v1_only",
  };
}

export function buildEmpiricalDifficultyShadowReport(
  input: StudentModel | AttemptRecord[],
  options: EmpiricalDifficultyShadowOptions = {},
): EmpiricalDifficultyShadowReport {
  const attempts = Array.isArray(input) ? input : input.attempts;
  const generatedAt = options.generatedAt || new Date().toISOString();
  const minAttempts = Math.max(2, Number(options.minAttemptsPerItem || 5));
  const driftThreshold = Math.max(1, Number(options.driftThreshold || 1));
  const learnerAccuracy = buildLearnerAccuracyMap(attempts);
  const attemptsByItem = groupAttemptsByItem(attempts);
  const rows = [...attemptsByItem.entries()]
    .map(([itemId, itemAttempts]) => buildEmpiricalDifficultyRow(itemId, itemAttempts, learnerAccuracy, minAttempts, driftThreshold))
    .sort((a, b) => Number(a.sparse) - Number(b.sparse) || Math.abs(b.eloDelta) - Math.abs(a.eloDelta) || a.itemId.localeCompare(b.itemId));
  const sparseItems = rows.filter((row) => row.sparse).length;
  const driftWatchItems = rows.filter((row) => !row.sparse && difficultyDistance(row.priorDifficulty, row.empiricalDifficulty) >= driftThreshold).length;
  const status: EmpiricalDifficultyShadowReport["status"] = rows.length === 0
    ? "watch"
    : rows.every((row) => row.sparse)
      ? "watch"
      : "pass";

  return {
    schemaVersion: "empirical_difficulty_shadow_v1",
    generatedAt,
    status,
    rows,
    summary: {
      totalItems: rows.length,
      calibratedCandidates: rows.length - sparseItems,
      sparseItems,
      driftWatchItems,
      averageEloDelta: round2(averageNumber(rows.map((row) => row.eloDelta))),
    },
    calibrationPolicy: "shadow_only_prior_preserved",
    highStakesPlacementEnabled: false,
    detail:
      status === "watch"
        ? "Empirical difficulty is shadow-only and waiting for enough repeated real attempts before calibration can be trusted."
        : "Empirical difficulty has candidate rows, but teacher-authored priors remain preserved and no high-stakes placement uses Elo.",
  };
}

export function recommendNextAction(state: StudentModel, options: { diagnosticMinAttempts?: number; rerouteFailureThreshold?: number } = {}): Recommendation {
  const diagnosticMinAttempts = Math.max(1, Number(options.diagnosticMinAttempts || 8));
  const rerouteFailureThreshold = Math.max(2, Number(options.rerouteFailureThreshold || 5));
  if (state.attempts.length < diagnosticMinAttempts) {
    return {
      kind: "diagnostic",
      title: "Run diagnostic",
      detail: "Collect an initial baseline before assigning focused practice.",
      priority: 100,
      conceptIds: [],
      skillIds: [],
      reason: "not_enough_evidence",
    };
  }

  const mastery = computeMastery(state);
  const stuck = mastery.find((row) => row.consecutiveFailures >= rerouteFailureThreshold);
  if (stuck) {
    return buildRerouteRecommendation(stuck, rerouteFailureThreshold);
  }

  const repair = mastery.find((row) => row.status === "repair");
  if (repair) {
    return {
      kind: "review",
      title: "Repair weakest area",
      detail: `Review recent mistakes for ${repair.id}.`,
      priority: 90,
      domainId: repair.domainId,
      conceptIds: repair.scope === "concept" ? [repair.id] : [],
      skillIds: repair.scope === "skill" ? [repair.id] : [],
      reason: "mastery_repair_needed",
    };
  }

  const collect = mastery.find((row) => row.status === "collect_evidence");
  if (collect) {
    return {
      kind: "practice",
      title: "Collect more evidence",
      detail: `Add more attempts for ${collect.id}.`,
      priority: 70,
      domainId: collect.domainId,
      conceptIds: collect.scope === "concept" ? [collect.id] : [],
      skillIds: collect.scope === "skill" ? [collect.id] : [],
      reason: "low_confidence",
    };
  }

  const hardProof = mastery.find((row) => row.status === "hard_proof" || row.status === "building");
  if (hardProof) {
    return {
      kind: "practice",
      title: "Build hard proof",
      detail: `Assign medium or hard items for ${hardProof.id}.`,
      priority: 60,
      domainId: hardProof.domainId,
      conceptIds: hardProof.scope === "concept" ? [hardProof.id] : [],
      skillIds: hardProof.scope === "skill" ? [hardProof.id] : [],
      reason: "needs_harder_evidence",
    };
  }

  return {
    kind: "challenge",
    title: "Move to challenge set",
    detail: "Current tracked areas are stable enough for mixed or timed challenge practice.",
    priority: 40,
    conceptIds: [],
    skillIds: [],
    reason: "stable_mastery",
  };
}

function buildRerouteRecommendation(row: MasteryEstimate, threshold: number): Recommendation {
  const currentDifficulty = normalizeDifficulty(row.lastAttemptDifficulty || "medium");
  const easierDifficulty = easierPracticeDifficulty(currentDifficulty);
  const scopedIds = row.scope === "concept" ? { conceptIds: [row.id], skillIds: [] } : { conceptIds: [], skillIds: [row.id] };

  if (!easierDifficulty) {
    return {
      kind: "review",
      title: "Relearn prerequisite",
      detail: `${row.id} has ${row.consecutiveFailures} consecutive misses at easy level. Review the prerequisite lesson before assigning more repair attempts.`,
      priority: 95,
      domainId: row.domainId,
      ...scopedIds,
      reason: "consecutive_failures_prerequisite",
    };
  }

  return {
    kind: "practice",
    title: "Reroute to easier practice",
    detail: `${row.id} has ${row.consecutiveFailures} consecutive misses. Move from ${currentDifficulty || "current"} to ${easierDifficulty} practice before retrying repair.`,
    priority: 95,
    domainId: row.domainId,
    difficulty: easierDifficulty,
    ...scopedIds,
    reason: `consecutive_failures_${threshold}`,
  };
}

function easierPracticeDifficulty(difficulty: string): string | null {
  const normalized = normalizeDifficulty(difficulty || "medium");
  if (normalized === "hard") return "medium";
  if (normalized === "medium") return "easy";
  return null;
}

export function buildDiagnosticSet<T extends LearningItem>(items: T[], attempts: AttemptRecord[] = [], options: DiagnosticOptions = {}): T[] {
  const limit = Math.max(1, Number(options.limit || 20));
  const attempted = new Set(attempts.map((attempt) => attempt.itemId));
  const difficulties = new Set((options.difficulties || ["medium", "hard"]).map(normalizeDifficulty));
  const pool = items.filter((item) => {
    if (attempted.has(item.id)) return false;
    if (options.domainId && item.domainId !== options.domainId) return false;
    if (options.programId && !(item.programIds || []).includes(options.programId)) return false;
    if (item.difficulty && difficulties.size && !difficulties.has(normalizeDifficulty(item.difficulty))) return false;
    return true;
  });
  return pickDiverse(pool.length >= limit ? pool : items.filter((item) => !attempted.has(item.id)), limit);
}

export function buildPracticeSet<T extends LearningItem>(items: T[], attempts: AttemptRecord[] = [], options: PracticeOptions = {}): T[] {
  const limit = Math.max(1, Number(options.limit || 10));
  const attempted = new Set(attempts.map((attempt) => attempt.itemId));
  const conceptFilters = new Set(options.conceptIds || []);
  const skillFilters = new Set(options.skillIds || []);
  const pool = items.filter((item) => {
    if (attempted.has(item.id)) return false;
    if (options.domainId && item.domainId !== options.domainId) return false;
    if (options.difficulty && normalizeDifficulty(item.difficulty || "") !== normalizeDifficulty(options.difficulty)) return false;
    if (conceptFilters.size && !(item.conceptIds || []).some((id) => conceptFilters.has(id))) return false;
    if (skillFilters.size && !(item.skillIds || []).some((id) => skillFilters.has(id))) return false;
    return true;
  });
  return pickDiverse(pool, limit);
}

export function buildReviewSet<T extends LearningItem>(items: T[], attempts: AttemptRecord[] = [], limit = 8): T[] {
  const attempted = new Set(attempts.map((attempt) => attempt.itemId));
  const selected: T[] = [];
  const wrongAttempts = attempts.filter((attempt) => !attempt.correct).slice(-25).reverse();

  for (const attempt of wrongAttempts) {
    const candidate = items.find((item) => {
      if (attempted.has(item.id) || selected.some((selectedItem) => selectedItem.id === item.id)) return false;
      const sharesSkill = (item.skillIds || []).some((id) => attempt.skillIds.includes(id));
      const sharesConcept = (item.conceptIds || []).some((id) => attempt.conceptIds.includes(id));
      return item.domainId === attempt.domainId && (sharesSkill || sharesConcept);
    });
    if (candidate) selected.push(candidate);
    if (selected.length >= limit) break;
  }

  return selected;
}

function normalizeLearningPathNode(node: LearningPathNode): LearningPathNode {
  return {
    ...node,
    id: String(node.id || ""),
    domainId: String(node.domainId || ""),
    scope: node.scope || "concept",
    label: String(node.label || node.id || ""),
    programIds: uniqueStrings(node.programIds || []),
  };
}

function pickLearningPathTargets(
  mastery: MasteryEstimate[],
  nodes: LearningPathNode[],
  nodeById: Map<string, LearningPathNode>,
  options: LearningPathOptions,
): string[] {
  const explicitTargets = uniqueStrings(options.targetIds || []).filter((id) => nodeById.has(id));
  if (explicitTargets.length) return explicitTargets;

  const masteryTargets = mastery
    .filter((row) => (!options.domainId || row.domainId === options.domainId) && nodeById.has(row.id) && row.status !== "stable")
    .sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.score - b.score || b.attempts - a.attempts)
    .map((row) => row.id);
  if (masteryTargets.length) return uniqueStrings(masteryTargets).slice(0, 3);

  return nodes.slice(0, 3).map((node) => node.id);
}

function appendToEdgeMap(map: Map<string, LearningPathEdge[]>, key: string, edge: LearningPathEdge): void {
  map.set(key, [...(map.get(key) || []), edge]);
}

function compareLearningPathEdges(left: LearningPathEdge, right: LearningPathEdge): number {
  const typeRank: Record<string, number> = {
    prerequisite: 0,
    supports: 1,
  };
  return (typeRank[left.type] ?? 9) - (typeRank[right.type] ?? 9) || Number(right.weight || 0) - Number(left.weight || 0) || left.from.localeCompare(right.from);
}

function buildLearningPathStep(
  node: LearningPathNode,
  masteryById: Map<string, MasteryEstimate>,
  incoming: Map<string, LearningPathEdge[]>,
  targetSet: Set<string>,
  index: number,
): LearningPathStep {
  const mastery = masteryById.get(node.id);
  const prerequisiteIds = uniqueStrings((incoming.get(node.id) || []).map((edge) => edge.from));
  const status = learningPathStepStatus(mastery);
  const unlocked = prerequisiteIds.every((id) => {
    const prerequisite = masteryById.get(id);
    return prerequisite?.status === "stable" || Number(prerequisite?.score || 0) >= 80;
  });

  return {
    id: node.id,
    scope: String(node.scope || "concept"),
    domainId: node.domainId,
    label: node.label || node.id,
    status,
    masteryScore: mastery?.score || 0,
    attempts: mastery?.attempts || 0,
    reason: learningPathStepReason(status, targetSet.has(node.id), prerequisiteIds.length),
    prerequisiteIds,
    unlocked,
    target: targetSet.has(node.id),
    rank: index + 1,
  };
}

function learningPathStepStatus(mastery?: MasteryEstimate): LearningPathStepStatus {
  if (!mastery) return "not_started";
  if (mastery.status === "building") return "build";
  return mastery.status;
}

function learningPathStepReason(status: LearningPathStepStatus, isTarget: boolean, prerequisiteCount: number): string {
  if (status === "repair") return "Recent mistakes or low accuracy should be repaired before moving on.";
  if (status === "collect_evidence") return "The system needs more attempts before trusting this mastery estimate.";
  if (status === "not_started") return prerequisiteCount ? "Start here because it unlocks downstream topics." : "No learning evidence has been collected yet.";
  if (status === "hard_proof") return "Add medium or hard problems to prove retention.";
  if (status === "stable") return isTarget ? "Target area is stable; move into mixed challenge practice." : "Prerequisite appears stable.";
  return "Continue building accuracy and speed.";
}

function trimLearningPathSteps(steps: LearningPathStep[], maxSteps: number): LearningPathStep[] {
  if (steps.length <= maxSteps) return steps;
  const nextIndex = steps.findIndex((step) => step.status !== "stable");
  if (nextIndex < 0) return steps.slice(Math.max(0, steps.length - maxSteps));
  const start = Math.max(0, Math.min(nextIndex - 2, steps.length - maxSteps));
  return steps.slice(start, start + maxSteps);
}

function isAttemptEventType(type: string): boolean {
  const normalized = String(type || "").toLowerCase();
  return normalized === "question_attempt" || normalized.endsWith("_attempt");
}

function attemptFromLearningEvent(event: LearningEventRecord): AttemptRecord | null {
  const payload = event.payload || {};
  const itemId = readString(payload.itemId) || event.entityId;
  const domainId = readString(payload.domainId);
  const correct = readBoolean(payload.correct ?? payload.isCorrect);
  if (!itemId || !domainId || correct === null) return null;

  const errorCategories = readStringArray(payload.errorCategories) as ErrorCategory[];
  const misconceptionIds = readStringArray(payload.misconceptionIds);
  return makeAttempt({
    id: readString(payload.attemptId) || `${event.id || event.eventId || event.idempotencyKey}-attempt`,
    learnerId: event.learnerId,
    itemId,
    domainId,
    programId: readString(payload.programId) || undefined,
    conceptIds: readStringArray(payload.conceptIds),
    skillIds: readStringArray(payload.skillIds),
    correct,
    score: readOptionalNumber(payload.score),
    maxScore: readOptionalNumber(payload.maxScore),
    difficulty: readString(payload.difficulty) || undefined,
    mode: readString(payload.mode) || modeFromAttemptEventType(event.type),
    answeredAt: event.occurredAt,
    timeSpentSeconds: readOptionalNumber(payload.timeSpentSeconds),
    errorCategories: errorCategories.length ? errorCategories : undefined,
    misconceptionIds: misconceptionIds.length ? misconceptionIds : undefined,
    hintUsed: readBoolean(payload.hintUsed) || undefined,
    payload: {
      ...payload,
      sourceEventId: event.id,
      sourceEventType: event.type,
    },
  });
}

function modeFromAttemptEventType(type: string): LearningMode {
  const normalized = String(type || "").toLowerCase().replace(/_attempt$/, "");
  if (normalized === "question") return "practice";
  if (normalized === "diagnostic" || normalized === "practice" || normalized === "review" || normalized === "mock_test" || normalized === "lesson") return normalized;
  return normalized || "practice";
}

function readString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueStrings(value.map(readString).filter(Boolean));
  const scalar = readString(value);
  if (!scalar) return [];
  return uniqueStrings(scalar.split(",").map((part) => part.trim()).filter(Boolean));
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  const normalized = readString(value).toLowerCase();
  if (normalized === "true" || normalized === "correct" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "incorrect" || normalized === "wrong" || normalized === "no") return false;
  return null;
}

function readOptionalNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export function stableChecksum(value = ""): string {
  const text = String(value || "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableJsonStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJsonStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJsonStringify(entryValue)}`);
  return `{${entries.join(",")}}`;
}

function attemptsForMasteryRow(attempts: AttemptRecord[], row: MasteryEstimate): AttemptRecord[] {
  return attempts.filter((attempt) => {
    const ids = row.scope === "concept" ? attempt.conceptIds : attempt.skillIds;
    const fallbackId = row.scope === "concept" ? `${attempt.domainId}.untagged_concept` : `${attempt.domainId}.untagged_skill`;
    return (ids.length ? ids : [fallbackId]).includes(row.id);
  });
}

function buildEmpiricalDifficultyRow(
  itemId: string,
  attempts: AttemptRecord[],
  learnerAccuracy: Map<string, number>,
  minAttempts: number,
  driftThreshold: number,
): EmpiricalDifficultyShadowRow {
  const first = attempts[0]!;
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const correctRate = attempts.length ? Math.round((correctCount / attempts.length) * 100) : 0;
  const averageTimeSeconds = Math.round(averageNumber(attempts.map((attempt) => Number(attempt.timeSpentSeconds || 0)).filter((value) => value > 0)));
  const hintRate = Math.round((attempts.filter((attempt) => attempt.hintUsed).length / Math.max(1, attempts.length)) * 100);
  const reviewRecurrence = Math.round((attempts.filter((attempt) => attempt.mode === "review" || !attempt.correct).length / Math.max(1, attempts.length)) * 100);
  const discriminationProxy = itemDiscriminationProxy(attempts, learnerAccuracy);
  const sparse = attempts.length < minAttempts;
  const empiricalDifficulty = sparse ? normalizeDifficulty(first.difficulty || "medium") : empiricalDifficultyFromRate(correctRate, hintRate, reviewRecurrence);
  const priorDifficulty = normalizeDifficulty(first.difficulty || "medium");
  const drift = difficultyDistance(priorDifficulty, empiricalDifficulty);
  const eloDelta = sparse ? 0 : difficultyEloDelta(correctRate, hintRate, reviewRecurrence);

  return {
    itemId,
    programId: first.programId || "",
    domainId: first.domainId,
    priorDifficulty,
    empiricalDifficulty,
    attempts: attempts.length,
    correctRate,
    averageTimeSeconds,
    hintRate,
    reviewRecurrence,
    discriminationProxy,
    eloDelta,
    sparse,
    applied: false,
    reason: sparse
      ? `Sparse evidence (${attempts.length}/${minAttempts}); keep prior difficulty ${priorDifficulty}.`
      : drift >= driftThreshold
        ? `Shadow drift ${priorDifficulty} -> ${empiricalDifficulty}; review before any content update.`
        : `Empirical evidence is consistent with prior ${priorDifficulty}; no update applied.`,
  };
}

function buildLearnerAccuracyMap(attempts: AttemptRecord[]): Map<string, number> {
  const byLearner = new Map<string, AttemptRecord[]>();
  for (const attempt of attempts) {
    const learnerId = attempt.learnerId || "unknown";
    byLearner.set(learnerId, [...(byLearner.get(learnerId) || []), attempt]);
  }
  return new Map([...byLearner.entries()].map(([learnerId, rows]) => [
    learnerId,
    rows.filter((attempt) => attempt.correct).length / Math.max(1, rows.length),
  ]));
}

function groupAttemptsByItem(attempts: AttemptRecord[]): Map<string, AttemptRecord[]> {
  const grouped = new Map<string, AttemptRecord[]>();
  for (const attempt of attempts) {
    grouped.set(attempt.itemId, [...(grouped.get(attempt.itemId) || []), attempt]);
  }
  return grouped;
}

function itemDiscriminationProxy(attempts: AttemptRecord[], learnerAccuracy: Map<string, number>): number | null {
  const high = attempts.filter((attempt) => (learnerAccuracy.get(attempt.learnerId || "unknown") || 0) >= 0.7);
  const low = attempts.filter((attempt) => (learnerAccuracy.get(attempt.learnerId || "unknown") || 0) < 0.7);
  if (!high.length || !low.length) return null;
  const highRate = high.filter((attempt) => attempt.correct).length / high.length;
  const lowRate = low.filter((attempt) => attempt.correct).length / low.length;
  return round2(highRate - lowRate);
}

function empiricalDifficultyFromRate(correctRate: number, hintRate: number, reviewRecurrence: number): string {
  const pressure = correctRate - hintRate * 0.25 - reviewRecurrence * 0.2;
  if (pressure >= 78) return "easy";
  if (pressure >= 50) return "medium";
  return "hard";
}

function difficultyEloDelta(correctRate: number, hintRate: number, reviewRecurrence: number): number {
  const pressure = 65 - correctRate + hintRate * 0.25 + reviewRecurrence * 0.2;
  return Math.round(clamp(pressure * 6, -180, 180));
}

function difficultyDistance(left: string, right: string): number {
  return Math.abs(difficultyRankValue(left) - difficultyRankValue(right));
}

function difficultyRankValue(value: string): number {
  const normalized = normalizeDifficulty(value);
  if (normalized === "easy") return 0;
  if (normalized === "hard") return 2;
  return 1;
}

function buildMasteryV2ShadowRow(v1: MasteryEstimate, attempts: AttemptRecord[], now: string): MasteryV2ShadowRow {
  let totalWeight = 0;
  let correctWeight = 0;
  let hardCorrect = 0;
  let lastCorrectAt = "";
  let lastWrongAt = "";
  const weakestEvidence: string[] = [];
  const strongestEvidence: string[] = [];

  for (const attempt of attempts) {
    const weight = attemptModeWeight(attempt.mode) * attemptDifficultyWeight(attempt.difficulty || "medium") * attemptRecencyWeight(attempt.answeredAt, now);
    totalWeight += weight;
    if (attempt.correct) {
      correctWeight += weight;
      lastCorrectAt = maxIso(lastCorrectAt, attempt.answeredAt);
      if (normalizeDifficulty(attempt.difficulty || "") === "hard") hardCorrect += 1;
    } else {
      lastWrongAt = maxIso(lastWrongAt, attempt.answeredAt);
    }
  }

  const weightedAccuracy = totalWeight ? Math.round((correctWeight / totalWeight) * 100) : 0;
  const evidenceConfidence = round2(clamp(totalWeight / 6, 0, 1));
  const recentWrongPenalty = lastWrongAt && (!lastCorrectAt || lastWrongAt >= lastCorrectAt) ? 15 : 0;
  const misconceptionPenalty = repeatedSignalPenalty(attempts.flatMap((attempt) => attempt.misconceptionIds || []), 12);
  const errorPenalty = repeatedSignalPenalty(
    attempts.flatMap((attempt) => (attempt.errorCategories || []).filter((category) => category !== "none")),
    8,
  );
  const hintPenalty = Math.round((attempts.filter((attempt) => attempt.hintUsed).length / Math.max(1, attempts.length)) * 8);
  const timePenalty = Math.round((attempts.filter(hasTimeAnomaly).length / Math.max(1, attempts.length)) * 6);
  const hardProofBonus = Math.min(8, hardCorrect * 4);
  const v2Score = clamp(Math.round(weightedAccuracy * evidenceConfidence + hardProofBonus - recentWrongPenalty - misconceptionPenalty - errorPenalty - hintPenalty - timePenalty), 0, 100);
  const v2Status = masteryStatus({
    attempts: v1.attempts,
    accuracy: weightedAccuracy,
    hardCorrect,
    lastCorrectAt,
    lastWrongAt,
    score: v2Score,
  });

  if (hardCorrect > 0) strongestEvidence.push(`${hardCorrect} correct hard attempt${hardCorrect === 1 ? "" : "s"}.`);
  if (attempts.some((attempt) => attempt.correct && ["review", "mock_test"].includes(String(attempt.mode)))) strongestEvidence.push("Review/mock evidence supports retention.");
  if (lastCorrectAt && lastCorrectAt >= lastWrongAt) strongestEvidence.push("Latest successful evidence is not contradicted by a newer wrong attempt.");
  if (recentWrongPenalty) weakestEvidence.push("Most recent evidence is wrong or unresolved.");
  if (misconceptionPenalty) weakestEvidence.push(`Repeated misconceptions applied a ${misconceptionPenalty}-point penalty.`);
  if (errorPenalty) weakestEvidence.push(`Repeated error categories applied an ${errorPenalty}-point penalty.`);
  if (hintPenalty) weakestEvidence.push(`Hint usage applied a ${hintPenalty}-point penalty.`);
  if (timePenalty) weakestEvidence.push(`Time-spent anomalies applied a ${timePenalty}-point penalty.`);
  if (evidenceConfidence < 0.7) weakestEvidence.push("Evidence confidence is still low.");

  return {
    key: v1.key,
    scope: v1.scope,
    id: v1.id,
    domainId: v1.domainId,
    attempts: v1.attempts,
    v1Score: v1.score,
    v2Score,
    delta: v2Score - v1.score,
    v1Status: v1.status,
    v2Status,
    weightedAccuracy,
    evidenceConfidence,
    confidenceLevel: evidenceConfidence >= 0.85 ? "high" : evidenceConfidence >= 0.55 ? "medium" : "low",
    strongestEvidence: strongestEvidence.length ? strongestEvidence : ["No strong V2 evidence yet."],
    weakestEvidence: weakestEvidence.length ? weakestEvidence : ["No major V2 weakness detected."],
    explanation: `V2 shadow uses mode, recency, difficulty, misconception, hint, and time-spent weights. Score ${v1.score} -> ${v2Score}; status ${v1.status} -> ${v2Status}.`,
  };
}

function attemptModeWeight(mode: LearningMode): number {
  const normalized = String(mode || "").toLowerCase();
  if (normalized === "diagnostic") return 1.1;
  if (normalized === "review") return 1.15;
  if (normalized === "mock_test") return 1.2;
  if (normalized === "lesson") return 0.65;
  return 1;
}

function attemptDifficultyWeight(difficulty: string): number {
  const normalized = normalizeDifficulty(difficulty);
  if (normalized === "hard") return 1.2;
  if (normalized === "easy") return 0.85;
  return 1;
}

function attemptRecencyWeight(answeredAt: string, now: string): number {
  const days = daysBetween(answeredAt, now);
  if (days <= 30) return 1;
  if (days <= 90) return 0.85;
  if (days <= 180) return 0.7;
  return 0.6;
}

function repeatedSignalPenalty(values: string[], maxPenalty: number): number {
  const counts = countBy(values.filter(Boolean));
  const repeated = Object.values(counts).reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  return Math.min(maxPenalty, repeated * 4);
}

function hasTimeAnomaly(attempt: AttemptRecord): boolean {
  const seconds = Number(attempt.timeSpentSeconds || 0);
  return seconds > 0 && (seconds <= 3 || seconds >= 900);
}

function daysBetween(olderIso: string, newerIso: string): number {
  const older = new Date(olderIso || newerIso).getTime();
  const newer = new Date(newerIso || olderIso).getTime();
  if (!Number.isFinite(older) || !Number.isFinite(newer)) return 0;
  return Math.max(0, Math.round((newer - older) / 86400000));
}

function isValidIsoLike(value: string): boolean {
  return Boolean(value && Number.isFinite(new Date(value).getTime()));
}

function averageNumber(values: number[]): number {
  const finite = values.filter((value) => Number.isFinite(value));
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function updateMastery(rows: Map<string, MasteryAccumulator>, scope: MasteryScope, id: string, attempt: AttemptRecord): void {
  const key = `${scope}:${id}`;
  const row =
    rows.get(key) ||
    ({
      key,
      scope,
      id,
      domainId: attempt.domainId,
      attempts: 0,
      correct: 0,
      accuracy: 0,
      hardAttempts: 0,
      hardCorrect: 0,
      consecutiveFailures: 0,
      confidence: 0,
      score: 0,
      status: "collect_evidence",
      lastAttemptAt: "",
      lastAttemptDifficulty: "",
      lastCorrectAt: "",
      lastWrongAt: "",
      errorCategories: [],
      misconceptionIds: [],
    } satisfies MasteryAccumulator);

  row.attempts += 1;
  row.lastAttemptDifficulty = normalizeDifficulty(attempt.difficulty || "medium");
  if (attempt.correct) {
    row.correct += 1;
    row.consecutiveFailures = 0;
    row.lastCorrectAt = maxIso(row.lastCorrectAt, attempt.answeredAt);
  } else {
    row.consecutiveFailures += 1;
    row.lastWrongAt = maxIso(row.lastWrongAt, attempt.answeredAt);
  }
  if (normalizeDifficulty(attempt.difficulty || "") === "hard") {
    row.hardAttempts += 1;
    if (attempt.correct) row.hardCorrect += 1;
  }
  row.lastAttemptAt = maxIso(row.lastAttemptAt, attempt.answeredAt);
  row.errorCategories = uniqueStrings([...row.errorCategories, ...(attempt.errorCategories || []).filter((category) => category !== "none")]) as ErrorCategory[];
  row.misconceptionIds = uniqueStrings([...row.misconceptionIds, ...(attempt.misconceptionIds || [])]);
  rows.set(key, row);
}

function finalizeMastery(row: MasteryAccumulator): MasteryEstimate {
  const accuracy = row.attempts ? Math.round((row.correct / row.attempts) * 100) : 0;
  const confidence = Math.min(1, row.attempts / 5);
  const recentWrongPenalty = row.lastWrongAt && (!row.lastCorrectAt || row.lastWrongAt >= row.lastCorrectAt) ? 20 : 0;
  const hardProofBonus = Math.min(10, row.hardCorrect * 5);
  const score = clamp(Math.round(accuracy * confidence + hardProofBonus - recentWrongPenalty), 0, 100);
  return {
    ...row,
    accuracy,
    confidence,
    score,
    status: masteryStatus({
      attempts: row.attempts,
      accuracy,
      hardCorrect: row.hardCorrect,
      lastCorrectAt: row.lastCorrectAt,
      lastWrongAt: row.lastWrongAt,
      score,
    }),
  };
}

function masteryStatus(row: Pick<MasteryEstimate, "attempts" | "accuracy" | "hardCorrect" | "lastCorrectAt" | "lastWrongAt" | "score">): MasteryStatus {
  const unresolvedWrong = Boolean(row.lastWrongAt && (!row.lastCorrectAt || row.lastWrongAt >= row.lastCorrectAt));
  if (row.attempts < 3) return "collect_evidence";
  if (row.accuracy < 70 || unresolvedWrong || row.score < 55) return "repair";
  if (row.hardCorrect < 2) return "hard_proof";
  if (row.accuracy >= 85 && row.hardCorrect >= 2 && row.score >= 80) return "stable";
  return "building";
}

function statusRank(status: MasteryStatus): number {
  const ranks: Record<MasteryStatus, number> = {
    repair: 0,
    collect_evidence: 1,
    building: 2,
    hard_proof: 3,
    stable: 4,
  };
  return ranks[status];
}

function pickDiverse<T extends LearningItem>(pool: T[], limit: number): T[] {
  const selected: T[] = [];
  const domainCounts = new Map<string, number>();
  const skillCounts = new Map<string, number>();
  for (const item of pool) {
    const domainCount = domainCounts.get(item.domainId) || 0;
    const primarySkill = (item.skillIds || [])[0] || "untagged";
    const skillCount = skillCounts.get(primarySkill) || 0;
    if (domainCount >= Math.max(3, Math.ceil(limit / 2)) || skillCount >= 2) continue;
    selected.push(item);
    domainCounts.set(item.domainId, domainCount + 1);
    skillCounts.set(primarySkill, skillCount + 1);
    if (selected.length >= limit) return selected;
  }
  for (const item of pool) {
    if (!selected.some((existing) => existing.id === item.id)) selected.push(item);
    if (selected.length >= limit) break;
  }
  return selected;
}

function pickProgramId(state: StudentModel, item: LearningItem): string {
  const itemPrograms = item.programIds || [];
  return itemPrograms.find((programId) => state.targetProgramIds.includes(programId)) || itemPrograms[0] || "";
}

function buildLearningEventMergeConflict(
  reason: LearningEventMergeConflict["reason"],
  kept: LearningEventRecord,
  incoming: LearningEventRecord,
): LearningEventMergeConflict {
  return {
    conflictKey: reason === "same_event_id_different_payload" ? kept.eventId || kept.id : kept.idempotencyKey || kept.id,
    reason,
    keptEventId: kept.eventId || kept.id,
    incomingEventId: incoming.eventId || incoming.id,
    keptPayloadHash: kept.payloadHash,
    incomingPayloadHash: incoming.payloadHash,
  };
}

function buildIdempotencyKey(event: Partial<LearningEventRecord> = {}): string {
  const payloadHash = event.payloadHash || stableChecksum(stableJsonStringify(event.payload || {}));
  const base = [event.learnerId || "", event.type || "", event.entityType || "", event.entityId || "", event.occurredAt || "", payloadHash].join("|");
  return `le-${stableChecksum(base)}`;
}

function normalizeEventType(type: string): LearningEventRecord["type"] {
  const normalized = String(type || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "diagnostic_attempt" || normalized === "practice_attempt" || normalized === "review_attempt") return normalized;
  if (normalized === "question_attempt" || normalized === "mock_test_attempt" || normalized === "lesson_attempt") return "question_attempt";
  return normalized || "learning_update";
}

function resolveLearningEventStorage(storage?: LearningEventStorageLike | null): LearningEventStorageLike | null {
  if (typeof storage !== "undefined") return storage;
  return (globalThis as unknown as { localStorage?: LearningEventStorageLike }).localStorage || null;
}

function safeJsonParse(rawValue: string | null, fallback: unknown): unknown {
  if (!rawValue) return fallback;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeErrorCategories(categories: ErrorCategory[]): ErrorCategory[] {
  const normalized = uniqueStrings(categories.map((category) => category || "unknown")) as ErrorCategory[];
  if (normalized.includes("none") && normalized.length > 1) return normalized.filter((category) => category !== "none");
  return normalized.length ? normalized : ["unknown"];
}

function countOverlap(values: string[], selected: Set<string>): number {
  if (!selected.size) return 0;
  return values.reduce((count, value) => count + (selected.has(value) ? 1 : 0), 0);
}

function normalizeDifficulty(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function stringifyAnswer(value: string | string[] | number | boolean | null | undefined): string {
  if (Array.isArray(value)) return value.map((part) => String(part ?? "")).join(", ");
  if (value === null || typeof value === "undefined") return "";
  return String(value);
}

function addDaysIso(baseIso: string, days: number): string {
  const date = new Date(baseIso || new Date().toISOString());
  date.setDate(date.getDate() + Math.max(0, Math.round(days || 0)));
  return date.toISOString();
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((result, value) => {
    const key = value || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function maxIso(current: string, next: string): string {
  if (!current) return next || "";
  if (!next) return current;
  return next > current ? next : current;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
