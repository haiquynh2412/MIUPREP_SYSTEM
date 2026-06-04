export const INTERNAL_QUESTION_BANK_FILES = [
  "antigravity-bank.json",
  "archive-source-ai-bank.json",
  "kaplan-sat-math-ai-bank.json",
  "opensat-pinesat.json",
  "private-vault-archive-bank.json",
  "sat-1590-elite-ai-bank.json",
  "sat-king-supplemental-ai-bank.json",
  "sat-studio-foundation-bank.json",
] as const;

const BLOCKED_PUBLIC_SOURCE_TYPES = new Set([
  "private_vault",
  "college_board",
  "cracksat_reference",
  "official_log",
  "khan_college_board",
]);

const BLOCKING_STATUS_TOKENS = ["rejected", "blocked", "hidden_duplicate", "audit_blocked", "intake_blocked"];
const PUBLIC_INTERNAL_FIELD_NAMES = new Set([
  "sourceType",
  "sourceName",
  "reviewStatus",
  "publicationStatus",
  "visibility",
  "licenseNote",
  "contentAudit",
  "strict1600Review",
  "publicReviewNote",
]);

export type AdminQueueKind = "needs_review" | "quality_warning" | "public_candidate" | "blocked" | "ready_public";

export interface AdminQuestionRecord {
  id?: unknown;
  section?: unknown;
  domain?: unknown;
  skill?: unknown;
  difficulty?: unknown;
  questionType?: unknown;
  type?: unknown;
  prompt?: unknown;
  choices?: unknown;
  correctAnswer?: unknown;
  acceptableAnswers?: unknown;
  explanation?: unknown;
  sourceType?: unknown;
  sourceName?: unknown;
  reviewStatus?: unknown;
  publicationStatus?: unknown;
  visibility?: unknown;
  auditStatus?: unknown;
  neverPublic?: unknown;
  contentAudit?: unknown;
  strict1600Review?: unknown;
  safetyReport?: unknown;
  autoCheck?: unknown;
  practicePool?: unknown;
  skeletonDiversity?: unknown;
  _sourceFile?: unknown;
  _sourceIndex?: unknown;
  [key: string]: unknown;
}

export interface AdminQuestion extends AdminQuestionRecord {
  id: string;
  section: string;
  domain: string;
  skill: string;
  difficulty: string;
  sourceType: string;
  sourceName: string;
  reviewStatus: string;
  publicationStatus: string;
  visibility: string;
  prompt: string;
  _sourceFile: string;
  _sourceIndex: number;
}

export interface PublicGateResult {
  ok: boolean;
  reason: string;
  blockers: string[];
  warnings: string[];
}

export interface AdminQueueItem {
  id: string;
  kind: AdminQueueKind;
  priority: "P0" | "P1" | "P2" | "P3";
  title: string;
  detail: string;
  question: AdminQuestion;
  gate: PublicGateResult;
  qualityScore: number;
}

export interface AdminChoiceView {
  letter: string;
  text: string;
  correct: boolean;
}

export interface AdminExplanationView {
  label: string;
  text: string;
  kind: "correct" | "distractor" | "general";
}

export interface AdminSourceFact {
  label: string;
  value: string;
}

export interface AdminContentSummary {
  total: number;
  reviewed: number;
  needsReview: number;
  rejectedOrBlocked: number;
  publicCandidate: number;
  readyForPublic: number;
  qualityWarnings: number;
  actionQueueTotal: number;
  queueCounts: Record<AdminQueueKind, number>;
  sources: Record<string, number>;
  sections: Record<string, number>;
}

export interface AdminContentModel {
  generatedAt: string;
  summary: AdminContentSummary;
  queue: AdminQueueItem[];
  topSources: Array<{ sourceType: string; count: number }>;
  topDomains: Array<{ section: string; domain: string; count: number }>;
}

export interface AdminReportBundle {
  integrityReport?: Record<string, unknown>;
  readinessAudit?: Record<string, unknown>;
  publicPackage?: Record<string, unknown>;
  implementationTracker?: Record<string, unknown>;
}

export interface AdminReleaseModel {
  ready: boolean;
  contractVersion: string;
  contentVersion: string;
  generatedAt: string;
  publicItemCount: number;
  manifestTotal: number;
  internalFieldHits: number;
  blockers: string[];
}

export interface AdminIntegrityModel {
  criticalIssueCount: number;
  criticalQuestionCount: number;
  warningIssueCount: number;
  warningQuestionCount: number;
  overrepresentedTopicCount: number;
  warningTypes: Array<{ type: string; count: number }>;
  suppressedDefaultStudyCount: number;
  rwLongPromptIds: string[];
}

export interface AdminReadinessDomainRow {
  section: string;
  domain: string;
  count: number;
  actualPct: number;
  officialPct: number;
  deltaPctPoints: number;
  balance: string;
}

export interface AdminReadinessModel {
  loadedTotal: number;
  coreReadyReviewed: number;
  publicCandidateReadyReviewed: number;
  strict1600HardNonBlocked: number;
  mathGridInPct: number;
  hardMathMultiStepPct: number;
  domainRows: AdminReadinessDomainRow[];
}

export interface AdminSourceGovernanceRow {
  sourceType: string;
  loaded: number;
  coreReady: number;
  publicCandidate: number;
  protectedSource: boolean;
  action: string;
}

export interface AdminChecklistItem {
  label: string;
  status: "pass" | "warn" | "block";
  detail: string;
}

export type ExpertReviewStatus = "draft" | "needs_review" | "expert_reviewed" | "rejected" | "public_ready";

export interface ExpertReviewDraft {
  id: string;
  prompt: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: string;
  explanationCorrect: string;
  explanationA: string;
  explanationB: string;
  explanationC: string;
  explanationD: string;
  section: string;
  domain: string;
  skill: string;
  difficulty: string;
  questionType: string;
  sourceType: string;
  visibility: string;
  reviewStatus: string;
  publicationStatus: string;
  trapNote: string;
  copyrightNote: string;
}

export interface ExpertReviewValidation {
  ok: boolean;
  blockers: string[];
  warnings: string[];
  changedFields: string[];
}

export interface ExpertReviewVersion {
  id: string;
  questionId: string;
  sourceFile: string;
  sourceIndex: number;
  versionNumber: number;
  status: ExpertReviewStatus;
  note: string;
  actor: string;
  createdAt: string;
  draft: ExpertReviewDraft;
  changedFields: string[];
  validation: ExpertReviewValidation;
}

export interface ExpertReviewWorkspace {
  schemaVersion: "sat_expert_review_workspace_v1";
  updatedAt: string;
  versions: ExpertReviewVersion[];
  latestByQuestionId: Record<string, string>;
}

export const EXPERT_REVIEW_WORKSPACE_KEY = "sat-studio-expert-review-workspace-v1";

export interface AdminOperationsModel {
  release: AdminReleaseModel;
  integrity: AdminIntegrityModel;
  readiness: AdminReadinessModel;
  sourceGovernance: AdminSourceGovernanceRow[];
  authoringChecklist: AdminChecklistItem[];
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function numberValue(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {};
}

function pathValue(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => (isPlainObject(current) ? current[key] : undefined), value);
}

function normalizeQuestion(record: AdminQuestionRecord, sourceFile = "", sourceIndex = 0): AdminQuestion {
  return {
    ...record,
    id: text(record.id) || `${sourceFile || "question"}:${sourceIndex}`,
    section: text(record.section) || "Unknown",
    domain: text(record.domain) || "Unknown",
    skill: text(record.skill) || "Unknown",
    difficulty: text(record.difficulty) || "Unknown",
    sourceType: text(record.sourceType) || "unknown",
    sourceName: text(record.sourceName) || text(record.sourceType) || "Unknown source",
    reviewStatus: text(record.reviewStatus) || "needs_review",
    publicationStatus: text(record.publicationStatus),
    visibility: text(record.visibility),
    prompt: text(record.prompt),
    _sourceFile: sourceFile || text(record._sourceFile),
    _sourceIndex: Number(record._sourceIndex ?? sourceIndex),
  };
}

export function explanationText(explanation: unknown): string {
  if (typeof explanation === "string") return explanation.trim();
  if (isPlainObject(explanation)) {
    return [explanation.correct, ...Object.values(explanation.distractors || {})].map(text).filter(Boolean).join(" ");
  }
  return "";
}

export function isGridInQuestion(question: AdminQuestionRecord): boolean {
  const kind = text(question.questionType || question.type).toLowerCase();
  return ["student_produced_response", "grid_in", "numeric", "spr"].includes(kind) || asArray(question.acceptableAnswers).length > 0;
}

function hasChoices(question: AdminQuestionRecord): boolean {
  if (isGridInQuestion(question)) return true;
  if (!isPlainObject(question.choices)) return false;
  const choices = question.choices;
  return ["A", "B", "C", "D"].every((letter) => text(choices[letter]));
}

function hasAnswer(question: AdminQuestionRecord): boolean {
  if (isGridInQuestion(question)) return Boolean(text(question.correctAnswer) || asArray(question.acceptableAnswers).some((answer) => text(answer)));
  return ["A", "B", "C", "D"].includes(text(question.correctAnswer));
}

export function isQuestionRejectedOrBlocked(question: AdminQuestionRecord): boolean {
  const statusText = [question.reviewStatus, question.publicationStatus, question.visibility, question.auditStatus].map(text).join(" ").toLowerCase();
  return BLOCKING_STATUS_TOKENS.some((token) => statusText.includes(token));
}

export function requiredContentIssues(question: AdminQuestionRecord): string[] {
  const issues: string[] = [];
  if (!text(question.id)) issues.push("missing_id");
  if (!text(question.section)) issues.push("missing_section");
  if (!text(question.domain)) issues.push("missing_domain");
  if (!text(question.skill)) issues.push("missing_skill");
  if (!text(question.difficulty)) issues.push("missing_difficulty");
  if (!text(question.prompt)) issues.push("missing_prompt");
  if (!hasChoices(question)) issues.push("missing_choices");
  if (!hasAnswer(question)) issues.push("missing_or_invalid_answer");
  if (!explanationText(question.explanation)) issues.push("missing_explanation");
  return issues;
}

export function qualityWarnings(question: AdminQuestionRecord): string[] {
  const warnings: string[] = [];
  const prompt = text(question.prompt);
  const explanation = explanationText(question.explanation);
  const contentAudit = isPlainObject(question.contentAudit) ? question.contentAudit : {};
  const skeleton = isPlainObject(question.skeletonDiversity) ? question.skeletonDiversity : {};
  if (prompt.length > 1600) warnings.push("long_prompt_review");
  if (explanation.length > 0 && explanation.length < 80) warnings.push("thin_explanation");
  if (text(contentAudit.verdict) && text(contentAudit.verdict) !== "pass") warnings.push("content_audit_not_pass");
  if (text(skeleton.practicePool) === "hidden_duplicate") warnings.push("hidden_duplicate_skeleton");
  return warnings;
}

export function choiceViews(question: AdminQuestionRecord): AdminChoiceView[] {
  if (!isPlainObject(question.choices)) return [];
  const choices = question.choices;
  const correct = text(question.correctAnswer);
  return ["A", "B", "C", "D"]
    .map((letter) => ({ letter, text: text(choices[letter]), correct: correct === letter }))
    .filter((choice) => choice.text);
}

export function correctAnswerText(question: AdminQuestionRecord): string {
  if (isGridInQuestion(question)) {
    const acceptable = asArray(question.acceptableAnswers).map(text).filter(Boolean);
    return acceptable[0] || text(question.correctAnswer);
  }
  const correct = text(question.correctAnswer);
  if (isPlainObject(question.choices) && correct) {
    const answerText = text(question.choices[correct]);
    return answerText ? `${correct}. ${answerText}` : correct;
  }
  return correct;
}

export function explanationViews(question: AdminQuestionRecord): AdminExplanationView[] {
  const explanation = question.explanation;
  if (typeof explanation === "string") {
    const value = explanation.trim();
    return value ? [{ label: "Explanation", text: value, kind: "general" }] : [];
  }
  if (!isPlainObject(explanation)) return [];
  const rows: AdminExplanationView[] = [];
  const correct = text(explanation.correct);
  if (correct) rows.push({ label: "Correct route", text: correct, kind: "correct" });
  const distractors = isPlainObject(explanation.distractors) ? explanation.distractors : {};
  for (const [letter, value] of Object.entries(distractors)) {
    const rowText = text(value);
    if (rowText) rows.push({ label: `Trap ${letter}`, text: rowText, kind: "distractor" });
  }
  return rows;
}

function choiceText(question: AdminQuestionRecord, letter: "A" | "B" | "C" | "D"): string {
  const choices = question.choices;
  if (isPlainObject(choices)) return text(choices[letter]);
  if (Array.isArray(choices)) return text(choices[letter.charCodeAt(0) - 65]);
  return text(question[`choice${letter}`]);
}

function explanationByLetter(question: AdminQuestionRecord, letter: "A" | "B" | "C" | "D"): string {
  const explanation = question.explanation;
  if (!isPlainObject(explanation)) return "";
  const distractors = isPlainObject(explanation.distractors) ? explanation.distractors : {};
  return text(distractors[letter]);
}

function correctExplanationText(question: AdminQuestionRecord): string {
  const explanation = question.explanation;
  if (typeof explanation === "string") return explanation.trim();
  if (isPlainObject(explanation)) return text(explanation.correct);
  return "";
}

function stableVersionId(questionId: string, versionNumber: number, createdAt: string): string {
  const cleanQuestionId = questionId.replace(/[^A-Za-z0-9_-]+/g, "-").slice(0, 48) || "question";
  const stamp = createdAt.replace(/[^0-9A-Za-z]+/g, "").slice(0, 20);
  return `expert-${cleanQuestionId}-v${versionNumber}-${stamp}`;
}

export function questionToExpertReviewDraft(question: AdminQuestionRecord): ExpertReviewDraft {
  return {
    id: text(question.id),
    prompt: text(question.prompt),
    choiceA: choiceText(question, "A"),
    choiceB: choiceText(question, "B"),
    choiceC: choiceText(question, "C"),
    choiceD: choiceText(question, "D"),
    correctAnswer: text(question.correctAnswer || question.correctChoice).toUpperCase(),
    explanationCorrect: correctExplanationText(question),
    explanationA: explanationByLetter(question, "A"),
    explanationB: explanationByLetter(question, "B"),
    explanationC: explanationByLetter(question, "C"),
    explanationD: explanationByLetter(question, "D"),
    section: text(question.section),
    domain: text(question.domain),
    skill: text(question.skill),
    difficulty: text(question.difficulty),
    questionType: text(question.questionType || question.type) || "multiple_choice",
    sourceType: text(question.sourceType),
    visibility: text(question.visibility) || "private_family",
    reviewStatus: text(question.reviewStatus) || "needs_review",
    publicationStatus: text(question.publicationStatus),
    trapNote: text(question.trapType || question.trapTypes || question.trapNote),
    copyrightNote: text(question.licenseNote || question.publicReviewNote || question.sourceUsagePolicy),
  };
}

export function expertDraftToQuestion(question: AdminQuestionRecord, draft: ExpertReviewDraft): AdminQuestionRecord {
  const next = JSON.parse(JSON.stringify(question || {})) as AdminQuestionRecord;
  next.id = draft.id;
  next.prompt = draft.prompt;
  next.choices = {
    A: draft.choiceA,
    B: draft.choiceB,
    C: draft.choiceC,
    D: draft.choiceD,
  };
  next.correctAnswer = draft.correctAnswer;
  next.explanation = {
    correct: draft.explanationCorrect,
    distractors: {
      A: draft.explanationA,
      B: draft.explanationB,
      C: draft.explanationC,
      D: draft.explanationD,
    },
  };
  next.section = draft.section;
  next.domain = draft.domain;
  next.skill = draft.skill;
  next.difficulty = draft.difficulty;
  next.questionType = draft.questionType;
  next.sourceType = draft.sourceType;
  next.visibility = draft.visibility;
  next.reviewStatus = draft.reviewStatus;
  next.publicationStatus = draft.publicationStatus;
  next.licenseNote = draft.copyrightNote || next.licenseNote;
  next.expertTrapNote = draft.trapNote;
  return next;
}

export function expertDraftChangedFields(question: AdminQuestionRecord, draft: ExpertReviewDraft): string[] {
  const before = questionToExpertReviewDraft(question);
  const keys = Object.keys(before) as Array<keyof ExpertReviewDraft>;
  return keys.filter((key) => text(before[key]) !== text(draft[key]));
}

export function validateExpertReviewDraft(question: AdminQuestionRecord, draft: ExpertReviewDraft): ExpertReviewValidation {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const answer = draft.correctAnswer.toUpperCase().trim();
  const choiceMap: Record<string, string> = {
    A: draft.choiceA,
    B: draft.choiceB,
    C: draft.choiceC,
    D: draft.choiceD,
  };

  if (!draft.id.trim()) blockers.push("missing_id");
  if (!draft.prompt.trim()) blockers.push("missing_prompt");
  if (!draft.section.trim() || !draft.domain.trim() || !draft.skill.trim()) blockers.push("missing_blueprint_metadata");
  if (!draft.difficulty.trim()) blockers.push("missing_difficulty");
  if (draft.questionType !== "student_produced_response") {
    for (const letter of ["A", "B", "C", "D"]) {
      if (!choiceMap[letter].trim()) blockers.push(`missing_choice_${letter}`);
    }
    if (!["A", "B", "C", "D"].includes(answer)) blockers.push("correct_answer_must_match_choice");
  } else if (!answer) {
    blockers.push("missing_grid_in_answer");
  }
  if (!draft.explanationCorrect.trim()) blockers.push("missing_correct_explanation");
  if (draft.reviewStatus === "reviewed" && !draft.copyrightNote.trim()) warnings.push("reviewed_without_copyright_note");
  if (draft.visibility === "public_candidate" && publicPromotionGate(expertDraftToQuestion(question, draft)).blockers.length) warnings.push("public_gate_still_has_blockers");
  if (draft.prompt.length > 1200) warnings.push("prompt_long_for_default_study");
  if (expertDraftChangedFields(question, draft).length === 0) warnings.push("no_content_or_metadata_changes");

  return {
    ok: blockers.length === 0,
    blockers,
    warnings,
    changedFields: expertDraftChangedFields(question, draft),
  };
}

export function emptyExpertReviewWorkspace(now = new Date().toISOString()): ExpertReviewWorkspace {
  return {
    schemaVersion: "sat_expert_review_workspace_v1",
    updatedAt: now,
    versions: [],
    latestByQuestionId: {},
  };
}

export function normalizeExpertReviewWorkspace(value: unknown, now = new Date().toISOString()): ExpertReviewWorkspace {
  if (!isPlainObject(value)) return emptyExpertReviewWorkspace(now);
  const versions = asArray(value.versions).filter(isPlainObject).map((row) => row as unknown as ExpertReviewVersion);
  const latest = isPlainObject(value.latestByQuestionId) ? Object.fromEntries(Object.entries(value.latestByQuestionId).map(([key, id]) => [key, text(id)])) : {};
  return {
    schemaVersion: "sat_expert_review_workspace_v1",
    updatedAt: text(value.updatedAt) || now,
    versions,
    latestByQuestionId: latest,
  };
}

export function loadExpertReviewWorkspace(storage: Storage | null = globalThis.localStorage ?? null): ExpertReviewWorkspace {
  if (!storage) return emptyExpertReviewWorkspace();
  try {
    return normalizeExpertReviewWorkspace(JSON.parse(storage.getItem(EXPERT_REVIEW_WORKSPACE_KEY) || "{}"));
  } catch {
    return emptyExpertReviewWorkspace();
  }
}

export function saveExpertReviewWorkspace(workspace: ExpertReviewWorkspace, storage: Storage | null = globalThis.localStorage ?? null): ExpertReviewWorkspace {
  const normalized = normalizeExpertReviewWorkspace(workspace);
  if (storage) storage.setItem(EXPERT_REVIEW_WORKSPACE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function addExpertReviewVersion(
  workspace: ExpertReviewWorkspace,
  question: AdminQuestionRecord,
  draft: ExpertReviewDraft,
  options: { actor?: string; note?: string; status?: ExpertReviewStatus; now?: string } = {},
): ExpertReviewWorkspace {
  const now = options.now || new Date().toISOString();
  const questionId = text(question.id || draft.id);
  const versionNumber = workspace.versions.filter((row) => row.questionId === questionId).length + 1;
  const validation = validateExpertReviewDraft(question, draft);
  const version: ExpertReviewVersion = {
    id: stableVersionId(questionId, versionNumber, now),
    questionId,
    sourceFile: text(question._sourceFile),
    sourceIndex: numberValue(question._sourceIndex, -1),
    versionNumber,
    status: options.status || (validation.ok ? "needs_review" : "draft"),
    note: text(options.note),
    actor: text(options.actor) || "content-admin",
    createdAt: now,
    draft: JSON.parse(JSON.stringify(draft)) as ExpertReviewDraft,
    changedFields: validation.changedFields,
    validation,
  };
  return {
    schemaVersion: "sat_expert_review_workspace_v1",
    updatedAt: now,
    versions: [version, ...workspace.versions],
    latestByQuestionId: {
      ...workspace.latestByQuestionId,
      [questionId]: version.id,
    },
  };
}

export function latestExpertReviewVersions(workspace: ExpertReviewWorkspace, questionId: string, limit = 6): ExpertReviewVersion[] {
  return workspace.versions.filter((row) => row.questionId === questionId).slice(0, Math.max(1, limit));
}

export function expertReviewBackendPayload(version: ExpertReviewVersion, question: AdminQuestionRecord): Record<string, unknown> {
  return {
    questionId: version.questionId,
    sourceFile: version.sourceFile,
    sourceIndex: version.sourceIndex,
    status: version.status,
    note: version.note,
    draft: expertDraftToQuestion(question, version.draft),
    before: question,
    validation: version.validation,
    localVersionId: version.id,
    localVersionNumber: version.versionNumber,
  };
}

export function sourceFacts(question: AdminQuestionRecord): AdminSourceFact[] {
  const skeleton = isPlainObject(question.skeletonDiversity) ? question.skeletonDiversity : {};
  const facts = [
    ["Source", text(question.sourceName) || text(question.sourceType)],
    ["Source type", text(question.sourceType)],
    ["Source file", text(question._sourceFile)],
    ["Visibility", text(question.visibility) || "not_public"],
    ["Publication", text(question.publicationStatus) || "none"],
    ["Practice pool", text(question.practicePool) || text(skeleton.practicePool) || "core_pool"],
    ["Skeleton", text(question.skeletonId) || text(skeleton.skeletonId)],
  ] as const;
  return facts.filter(([, value]) => value).map(([label, value]) => ({ label, value }));
}

export function publicPromotionGate(question: AdminQuestionRecord): PublicGateResult {
  const blockers: string[] = [];
  const warnings = qualityWarnings(question);

  if (text(question.reviewStatus) !== "reviewed") blockers.push("not_reviewed");
  if (isQuestionRejectedOrBlocked(question)) blockers.push("blocked_or_rejected");
  if (question.neverPublic) blockers.push("never_public");
  if (BLOCKED_PUBLIC_SOURCE_TYPES.has(text(question.sourceType))) blockers.push("blocked_source_type");
  if (requiredContentIssues(question).length) blockers.push("required_content_missing");
  if (question.auditStatus === "blocked") blockers.push("audit_blocked");
  if (isPlainObject(question.safetyReport) && question.safetyReport.blocked) blockers.push("safety_blocked");
  if (isPlainObject(question.autoCheck) && text(question.autoCheck.status) === "blocked") blockers.push("auto_check_blocked");

  const alreadyPublicCandidate = text(question.visibility) === "public_candidate" || text(question.publicationStatus).includes("public_candidate");
  if (alreadyPublicCandidate && blockers.length === 0) {
    return {
      ok: true,
      reason: "Already reviewed and visible as a public candidate.",
      blockers,
      warnings,
    };
  }

  return {
    ok: blockers.length === 0,
    reason: blockers.length ? "Resolve blockers before public promotion." : "Ready for final human source/originality review before public promotion.",
    blockers,
    warnings,
  };
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = key(item) || "Unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function queueKind(question: AdminQuestion, gate: PublicGateResult): AdminQueueKind {
  if (isQuestionRejectedOrBlocked(question)) return "blocked";
  if (question.reviewStatus !== "reviewed") return "needs_review";
  if (gate.ok && (question.visibility === "public_candidate" || question.publicationStatus.includes("public_candidate"))) return "ready_public";
  if (gate.ok) return "public_candidate";
  return "quality_warning";
}

function priorityFor(kind: AdminQueueKind, gate: PublicGateResult): AdminQueueItem["priority"] {
  if (kind === "blocked") return "P0";
  if (kind === "needs_review") return "P1";
  if (gate.blockers.length) return "P1";
  if (gate.warnings.length) return "P2";
  return "P3";
}

function qualityScore(gate: PublicGateResult, requiredIssues: string[]): number {
  return Math.max(0, 100 - gate.blockers.length * 22 - gate.warnings.length * 8 - requiredIssues.length * 10);
}

export function buildAdminContentModel(records: AdminQuestionRecord[], options: { generatedAt?: string; queueLimit?: number } = {}): AdminContentModel {
  const questions = records.map((record, index) => normalizeQuestion(record, text(record._sourceFile), Number(record._sourceIndex ?? index)));
  const gates = new Map(questions.map((question) => [question.id, publicPromotionGate(question)]));
  const rejectedOrBlocked = questions.filter(isQuestionRejectedOrBlocked);
  const publicCandidates = questions.filter((question) => question.visibility === "public_candidate" || question.publicationStatus.includes("public_candidate"));
  const readyForPublic = questions.filter((question) => gates.get(question.id)?.ok && publicCandidates.includes(question));
  const warnings = questions.filter((question) => qualityWarnings(question).length);
  const allQueueItems = questions.map((question) => {
      const gate = gates.get(question.id) || publicPromotionGate(question);
      const kind = queueKind(question, gate);
      const issues = requiredContentIssues(question);
      return {
        id: question.id,
        kind,
        priority: priorityFor(kind, gate),
        title: question.id,
        detail: [question.section, question.domain, question.skill, question.difficulty].filter(Boolean).join(" / "),
        question,
        gate,
        qualityScore: qualityScore(gate, issues),
      };
    });
  const queueCounts = {
    needs_review: 0,
    quality_warning: 0,
    public_candidate: 0,
    blocked: 0,
    ready_public: 0,
  } satisfies Record<AdminQueueKind, number>;
  allQueueItems.forEach((item) => {
    queueCounts[item.kind] += 1;
  });
  const queue = allQueueItems
    .filter((item) => item.kind !== "ready_public")
    .sort((a, b) => {
      const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return priorityRank[a.priority] - priorityRank[b.priority] || a.qualityScore - b.qualityScore || a.id.localeCompare(b.id);
    })
    .slice(0, options.queueLimit ?? 80);

  const sources = countBy(questions, (question) => question.sourceType);
  const sections = countBy(questions, (question) => question.section);
  const domains = countBy(questions, (question) => `${question.section}||${question.domain}`);

  return {
    generatedAt: options.generatedAt || new Date().toISOString(),
    summary: {
      total: questions.length,
      reviewed: questions.filter((question) => question.reviewStatus === "reviewed").length,
      needsReview: questions.filter((question) => question.reviewStatus !== "reviewed" && question.reviewStatus !== "rejected").length,
      rejectedOrBlocked: rejectedOrBlocked.length,
      publicCandidate: publicCandidates.length,
      readyForPublic: readyForPublic.length,
      qualityWarnings: warnings.length,
      actionQueueTotal: allQueueItems.filter((item) => item.kind !== "ready_public").length,
      queueCounts,
      sources,
      sections,
    },
    queue,
    topSources: Object.entries(sources)
      .map(([sourceType, count]) => ({ sourceType, count }))
      .sort((a, b) => b.count - a.count || a.sourceType.localeCompare(b.sourceType))
      .slice(0, 8),
    topDomains: Object.entries(domains)
      .map(([key, count]) => {
        const [section, domain] = key.split("||");
        return { section, domain, count };
      })
      .sort((a, b) => b.count - a.count || a.section.localeCompare(b.section) || a.domain.localeCompare(b.domain))
      .slice(0, 10),
  };
}

function countInternalFieldHits(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countInternalFieldHits(item), 0);
  if (!isPlainObject(value)) return 0;
  return Object.entries(value).reduce((sum, [key, child]) => sum + (PUBLIC_INTERNAL_FIELD_NAMES.has(key) ? 1 : 0) + countInternalFieldHits(child), 0);
}

function buildReleaseModel(bundle: AdminReportBundle): AdminReleaseModel {
  const publicPackage = recordValue(bundle.publicPackage);
  const items = asArray(publicPackage.items);
  const manifest = recordValue(publicPackage.manifest);
  const contractVersion = text(publicPackage.contractVersion);
  const blockers: string[] = [];
  const internalFieldHits = countInternalFieldHits(publicPackage);
  const publicItemCount = items.length;
  const manifestTotal = numberValue(manifest.total);
  if (contractVersion !== "sat_public_student_contract_v1") blockers.push("wrong_public_contract");
  if (!publicItemCount) blockers.push("empty_public_package");
  if (manifestTotal !== publicItemCount) blockers.push("manifest_total_mismatch");
  if (internalFieldHits) blockers.push("internal_fields_in_public_package");
  return {
    ready: blockers.length === 0,
    contractVersion,
    contentVersion: text(publicPackage.contentVersion),
    generatedAt: text(publicPackage.generatedAt),
    publicItemCount,
    manifestTotal,
    internalFieldHits,
    blockers,
  };
}

function buildIntegrityModel(bundle: AdminReportBundle): AdminIntegrityModel {
  const summary = recordValue(pathValue(bundle.integrityReport, "summary"));
  const warningBreakdown = recordValue(pathValue(bundle.integrityReport, "issueBreakdown.warning"));
  const studyPolicy = recordValue(pathValue(bundle.integrityReport, "studyPolicy"));
  const rwLongPromptIds = asArray(studyPolicy.rwLongPromptIds).map(text).filter(Boolean);
  return {
    criticalIssueCount: numberValue(summary.criticalIssueCount),
    criticalQuestionCount: numberValue(summary.criticalQuestionCount),
    warningIssueCount: numberValue(summary.warningIssueCount),
    warningQuestionCount: numberValue(summary.warningQuestionCount),
    overrepresentedTopicCount: numberValue(summary.overrepresentedTopicCount),
    warningTypes: Object.entries(warningBreakdown)
      .map(([type, count]) => ({ type, count: numberValue(count) }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
    suppressedDefaultStudyCount: asArray(studyPolicy.suppressedDefaultStudyIds).length,
    rwLongPromptIds,
  };
}

function domainRowsFrom(readinessAudit: Record<string, unknown>, path: string, section: string): AdminReadinessDomainRow[] {
  return asArray(pathValue(readinessAudit, path)).map((row) => {
    const record = recordValue(row);
    return {
      section,
      domain: text(record.domain),
      count: numberValue(record.count),
      actualPct: numberValue(record.actualPct),
      officialPct: numberValue(record.officialPct),
      deltaPctPoints: numberValue(record.deltaPctPoints),
      balance: text(record.balance) || "unknown",
    };
  });
}

function buildReadinessModel(bundle: AdminReportBundle): AdminReadinessModel {
  const readinessAudit = recordValue(bundle.readinessAudit);
  const inventory = recordValue(readinessAudit.inventory);
  const coreFormat = recordValue(readinessAudit.coreFormat);
  const domainRows = [
    ...domainRowsFrom(readinessAudit, "domainBalance.coreReadyReadingWriting", "Reading and Writing"),
    ...domainRowsFrom(readinessAudit, "domainBalance.coreReadyMath", "Math"),
  ];
  return {
    loadedTotal: numberValue(inventory.loadedTotal),
    coreReadyReviewed: numberValue(inventory.coreReadyReviewed),
    publicCandidateReadyReviewed: numberValue(inventory.publicCandidateReadyReviewed),
    strict1600HardNonBlocked: numberValue(inventory.strict1600HardNonBlocked),
    mathGridInPct: numberValue(coreFormat.mathGridInPct),
    hardMathMultiStepPct: numberValue(coreFormat.hardMultiStepMathPctOfHardMath),
    domainRows,
  };
}

function buildSourceGovernanceRows(questions: AdminQuestion[], bundle: AdminReportBundle): AdminSourceGovernanceRow[] {
  const loaded = recordValue(pathValue(bundle.readinessAudit, "inventory.sourceCountsLoaded"));
  const coreReady = recordValue(pathValue(bundle.readinessAudit, "inventory.sourceCountsCoreReady"));
  const publicCandidateCounts = countBy(
    questions.filter((question) => question.visibility === "public_candidate" || question.publicationStatus.includes("public_candidate")),
    (question) => question.sourceType,
  );
  const sourceTypes = new Set([...Object.keys(loaded), ...Object.keys(coreReady), ...Object.keys(publicCandidateCounts)]);
  return [...sourceTypes]
    .map((sourceType) => {
      const protectedSource = BLOCKED_PUBLIC_SOURCE_TYPES.has(sourceType) || sourceType === "private_vault";
      return {
        sourceType,
        loaded: numberValue(loaded[sourceType]),
        coreReady: numberValue(coreReady[sourceType]),
        publicCandidate: numberValue(publicCandidateCounts[sourceType]),
        protectedSource,
        action: protectedSource ? "Keep private or metadata-only; do not export to learner package." : "Eligible for unified mixed pool after review and public gate.",
      };
    })
    .sort((a, b) => b.loaded - a.loaded || a.sourceType.localeCompare(b.sourceType));
}

function checklistStatus(condition: boolean, warning = false): AdminChecklistItem["status"] {
  if (condition) return "pass";
  return warning ? "warn" : "block";
}

function buildAuthoringChecklist(content: AdminContentModel, operations: Pick<AdminOperationsModel, "release" | "integrity" | "readiness">): AdminChecklistItem[] {
  return [
    {
      label: "Internal bank loaded",
      status: checklistStatus(content.summary.total > 0),
      detail: `${content.summary.total} internal item(s) available to the admin shell.`,
    },
    {
      label: "Critical integrity blockers",
      status: checklistStatus(operations.integrity.criticalIssueCount === 0 && operations.integrity.criticalQuestionCount === 0),
      detail: `${operations.integrity.criticalQuestionCount} critical question(s), ${operations.integrity.criticalIssueCount} critical issue(s).`,
    },
    {
      label: "Public package contract",
      status: checklistStatus(operations.release.ready),
      detail: operations.release.ready
        ? `${operations.release.publicItemCount} learner-safe public item(s) under ${operations.release.contractVersion}.`
        : operations.release.blockers.join(", "),
    },
    {
      label: "Reviewed core pool",
      status: checklistStatus(operations.readiness.coreReadyReviewed >= 9000, true),
      detail: `${operations.readiness.coreReadyReviewed} core-ready reviewed item(s); target remains SAT 1000-1600 with 1600 ceiling.`,
    },
    {
      label: "Warning queue",
      status: checklistStatus(operations.integrity.warningQuestionCount === 0, true),
      detail: `${operations.integrity.warningQuestionCount} warning question(s), currently mostly long RW prompts suppressed from default study.`,
    },
    {
      label: "Manual authoring source rule",
      status: "pass",
      detail: "Only original drafts or metadata-only protected-source signals should enter authoring; protected prompt text stays out.",
    },
  ];
}

export function buildAdminOperationsModel(content: AdminContentModel, questions: AdminQuestion[], bundle: AdminReportBundle = {}): AdminOperationsModel {
  const release = buildReleaseModel(bundle);
  const integrity = buildIntegrityModel(bundle);
  const readiness = buildReadinessModel(bundle);
  return {
    release,
    integrity,
    readiness,
    sourceGovernance: buildSourceGovernanceRows(questions, bundle),
    authoringChecklist: buildAuthoringChecklist(content, { release, integrity, readiness }),
  };
}

async function fetchJsonIfAvailable(url: string): Promise<Record<string, unknown> | undefined> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return undefined;
  const payload = await response.json();
  return isPlainObject(payload) ? payload : undefined;
}

export async function loadAdminReportBundle(): Promise<AdminReportBundle> {
  const [integrityReport, readinessAudit, publicPackage, implementationTracker] = await Promise.all([
    fetchJsonIfAvailable("/data/question-integrity-report.json"),
    fetchJsonIfAvailable("/data/sat-2026-readiness-audit.json"),
    fetchJsonIfAvailable("/artifacts/sat-studio-public-content-package-latest.json"),
    fetchJsonIfAvailable("/data/sat-studio-implementation-tracker.json"),
  ]);
  return { integrityReport, readinessAudit, publicPackage, implementationTracker };
}

export async function loadInternalQuestionBanks(baseUrl = "/data/"): Promise<AdminQuestion[]> {
  const rows: AdminQuestion[] = [];
  for (const filename of INTERNAL_QUESTION_BANK_FILES) {
    const response = await fetch(`${baseUrl}${filename}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${filename} (${response.status})`);
    const payload = await response.json();
    const questions = Array.isArray(payload) ? payload : Array.isArray(payload?.questions) ? payload.questions : [];
    questions.forEach((record: AdminQuestionRecord, index: number) => {
      rows.push(normalizeQuestion(record, filename, index));
    });
  }
  return rows;
}
