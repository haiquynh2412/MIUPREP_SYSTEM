import {
  assertPublicPackageHasNoInternalKeys,
  PUBLIC_STUDENT_CONTRACT_VERSION,
  type PublicQuestionItem,
  type PublicStudentPackage,
} from "./public-content-contract";
import {
  ensureAccountProfile,
  loadAccountState,
  saveAccountState,
  type AccountState,
  type SatAccount,
} from "./account-ops";
import {
  appendLearningEvent,
  ATTEMPT_SCHEMA_VERSION,
  buildLearningEvent,
  normalizeLearningEvents,
  stableChecksum,
  summarizeLearningEvents,
  type LearningEventRecord,
} from "./learning-events";
import {
  buildSatLearningCatalog,
  selectSatDiagnosticItems,
  selectSatPracticeItems,
  type QuestionItem,
  type SatLearningCatalog,
  type SatPublicStudentPackage as StandardSatPublicStudentPackage,
} from "@miuprep/content";

export type { PublicQuestionItem, PublicStudentPackage } from "./public-content-contract";

export type StudyMode = "diagnostic" | "practice" | "review" | "bluebook";

export interface AttemptRecord {
  attemptSchemaVersion: typeof ATTEMPT_SCHEMA_VERSION;
  id: string;
  questionId: string;
  selectedAnswer: string;
  selectedAnswerText: string;
  correctAnswer: string;
  correctAnswerText: string;
  correct: boolean;
  answeredAt: string;
  elapsedMs: number;
  timeSpentSeconds: number;
  mode: StudyMode;
  practiceMode: StudyMode;
  section: string;
  domain: string;
  skill: string;
  difficulty: string;
  questionType: string;
  contentVersion: string;
  attemptNumber: number;
  studentScoreBand: string;
  targetScore: number;
  hintUsed: boolean;
  hintCount: number;
  fullSolutionViewed: boolean;
  helpTiming: "none" | "pre_submit" | "post_submit";
  independentAttempt: boolean;
  errorType: "none" | "wrong_answer";
  proofPass: boolean | null;
  learningEvidence: {
    required: boolean;
    status: "not_required" | "pending";
    rootCause: string;
    helpTelemetry: {
      hintUsed: boolean;
      hintCount: number;
      fullSolutionViewed: boolean;
      helpTiming: "none" | "pre_submit" | "post_submit";
      independentAttempt: boolean;
    };
  };
}

export interface LearnerState {
  version: "sat_student_state_v1";
  activeView: "today" | "diagnostic" | "practice" | "review" | "bluebook" | "lessons" | "vocab" | "official" | "news" | "rewards";
  attempts: AttemptRecord[];
  learningEvents: LearningEventRecord[];
  learningEventRevision: string;
  learningEventUpdatedAt: string;
  knownVocabIds: string[];
  vocabQuizAttempts: Array<Record<string, unknown>>;
  officialExamLogs: Array<Record<string, unknown>>;
  savedQuestionIds: string[];
  targetScore: number;
  lastContentVersion: string;
}

export interface QuestionRepository {
  package: PublicStudentPackage;
  items: PublicQuestionItem[];
  byId: Map<string, PublicQuestionItem>;
  standardCatalog: SatLearningCatalog;
  domains: string[];
  skills: string[];
  difficulties: string[];
}

export interface MasteryRow {
  key: string;
  section: string;
  domain: string;
  skill: string;
  attempts: number;
  correct: number;
  accuracy: number;
  hardCorrect: number;
  hardAttempts: number;
  lastWrongAt: string;
  status: "Collect evidence" | "Repair" | "Core" | "Hard proof" | "Stable";
}

export interface NextAction {
  label: string;
  detail: string;
  view: LearnerState["activeView"];
  skill?: string;
  domain?: string;
}

export const STUDENT_STATE_STORAGE_KEY = "sat-studio:vite-student-state";
export const PUBLIC_PACKAGE_URL = "/artifacts/sat-studio-public-content-package-latest.json";
export const DEFAULT_BACKEND_PACKAGE_PAGE_SIZE = 2500;

export function emptyLearnerState(): LearnerState {
  return {
    version: "sat_student_state_v1",
    activeView: "today",
    attempts: [],
    learningEvents: [],
    learningEventRevision: "",
    learningEventUpdatedAt: "",
    knownVocabIds: [],
    vocabQuizAttempts: [],
    officialExamLogs: [],
    savedQuestionIds: [],
    targetScore: 1500,
    lastContentVersion: "",
  };
}

export function loadLearnerState(storage: Storage | null = globalThis.localStorage ?? null): LearnerState {
  if (!storage) return emptyLearnerState();
  try {
    const parsed = JSON.parse(storage.getItem(STUDENT_STATE_STORAGE_KEY) || "null") as Partial<LearnerState> | null;
    if (!parsed || parsed.version !== "sat_student_state_v1") return emptyLearnerState();
    const state = {
      ...emptyLearnerState(),
      ...parsed,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      learningEvents: Array.isArray(parsed.learningEvents) ? normalizeLearningEvents(parsed.learningEvents) : [],
      knownVocabIds: Array.isArray(parsed.knownVocabIds) ? parsed.knownVocabIds.map(String).filter(Boolean) : [],
      vocabQuizAttempts: Array.isArray(parsed.vocabQuizAttempts) ? parsed.vocabQuizAttempts : [],
      officialExamLogs: Array.isArray(parsed.officialExamLogs) ? parsed.officialExamLogs : [],
      savedQuestionIds: Array.isArray(parsed.savedQuestionIds) ? parsed.savedQuestionIds : [],
    };
    const summary = summarizeLearningEvents(state.learningEvents);
    state.learningEventRevision = String(parsed.learningEventRevision || summary.revision);
    state.learningEventUpdatedAt = String(parsed.learningEventUpdatedAt || summary.lastAt);
    return state;
  } catch {
    return emptyLearnerState();
  }
}

export function saveLearnerState(state: LearnerState, storage: Storage | null = globalThis.localStorage ?? null): void {
  if (!storage) return;
  storage.setItem(STUDENT_STATE_STORAGE_KEY, JSON.stringify(state));
}

export async function loadPublicStudentPackage(url = PUBLIC_PACKAGE_URL): Promise<PublicStudentPackage> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load public package (${response.status})`);
  const payload = (await response.json()) as PublicStudentPackage;
  assertValidPublicStudentPackage(payload);
  return payload;
}

export async function loadBackendPublicStudentPackage(options: {
  baseUrl?: string;
  token: string;
  pageSize?: number;
  fetchImpl?: typeof fetch;
}): Promise<PublicStudentPackage> {
  const fetchImpl = options.fetchImpl || fetch;
  const baseUrl = (options.baseUrl || "/api/public").replace(/\/+$/, "");
  const pageSize = Math.max(1, Math.min(DEFAULT_BACKEND_PACKAGE_PAGE_SIZE, Number(options.pageSize || DEFAULT_BACKEND_PACKAGE_PAGE_SIZE)));
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.token && options.token !== "__sat_studio_http_only_cookie_session__") {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const items: PublicQuestionItem[] = [];
  let offset = 0;
  let total = pageSize;
  let merged: PublicStudentPackage | null = null;

  while (offset < total) {
    const params = new URLSearchParams({
      includeContent: "true",
      limit: String(pageSize),
      offset: String(offset),
    });
    const response = await fetchImpl(`${baseUrl}/content-package?${params.toString()}`, { cache: "no-store", headers, credentials: "include" });
    if (!response.ok) throw new Error(`Could not load backend public package (${response.status})`);
    const payload = (await response.json()) as { package?: PublicStudentPackage & { query?: { total?: number } } };
    const page = payload.package;
    if (!page) throw new Error("Backend public package response is empty.");
    assertValidPublicStudentPackage({ ...page, items: Array.isArray(page.items) ? page.items : [] });
    merged = merged || page;
    items.push(...(Array.isArray(page.items) ? page.items : []));
    const manifest = page.manifest as PublicStudentPackage["manifest"] & { queryTotal?: number };
    total = Number(page.query?.total || manifest.queryTotal || manifest.total || items.length);
    if (!page.items?.length) break;
    offset += page.items.length;
  }

  if (!merged) throw new Error("Backend public package is empty.");
  const packagePayload: PublicStudentPackage = {
    ...merged,
    items,
    manifest: {
      ...merged.manifest,
      total: items.length,
    },
  };
  assertValidPublicStudentPackage(packagePayload);
  return packagePayload;
}

export function assertValidPublicStudentPackage(payload: PublicStudentPackage): void {
  if (payload.schemaVersion !== "sat_content_package_v1") throw new Error("Invalid public package schema");
  if (payload.contractVersion !== PUBLIC_STUDENT_CONTRACT_VERSION) throw new Error("Invalid public student contract");
  if (!Array.isArray(payload.items) || payload.items.length === 0) throw new Error("Public package has no questions");
  assertPublicPackageHasNoInternalKeys(payload);
}

export function createQuestionRepository(contentPackage: PublicStudentPackage): QuestionRepository {
  assertValidPublicStudentPackage(contentPackage);
  const items = [...contentPackage.items].sort((a, b) => a.id.localeCompare(b.id));
  const standardCatalog = buildSatLearningCatalog(contentPackage as unknown as StandardSatPublicStudentPackage);
  return {
    package: contentPackage,
    items,
    byId: new Map(items.map((item) => [item.id, item])),
    standardCatalog,
    domains: unique(items.map((item) => item.domain).filter(Boolean)).sort(),
    skills: unique(items.map((item) => item.skill).filter(Boolean)).sort(),
    difficulties: unique(items.map((item) => item.difficulty).filter(Boolean)).sort(),
  };
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function choiceEntries(question: PublicQuestionItem): Array<[string, string]> {
  const choices = question.choices;
  if (!choices || typeof choices !== "object" || Array.isArray(choices)) return [];
  return Object.entries(choices as Record<string, unknown>)
    .map(([key, value]) => [key, String(value ?? "")] as [string, string])
    .filter(([, value]) => Boolean(value.trim()))
    .sort(([a], [b]) => a.localeCompare(b));
}

export function isGridIn(question: PublicQuestionItem): boolean {
  const type = String(question.questionType || question.type || "").toLowerCase();
  return ["student_produced_response", "student-produced-response", "grid_in", "grid-in", "numeric", "spr"].includes(type);
}

export function answerIsCorrect(question: PublicQuestionItem, selectedAnswer: string): boolean {
  const normalized = normalizeAnswer(selectedAnswer);
  const correct = normalizeAnswer(String(question.correctAnswer ?? ""));
  if (normalized && correct && normalized === correct) return true;
  const acceptable = Array.isArray(question.acceptableAnswers) ? question.acceptableAnswers : [];
  return acceptable.some((value) => normalizeAnswer(String(value ?? "")) === normalized);
}

export function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function correctAnswerText(question: PublicQuestionItem): string {
  const correct = String(question.correctAnswer ?? "");
  const match = choiceEntries(question).find(([letter]) => normalizeAnswer(letter) === normalizeAnswer(correct));
  return match ? `${match[0]}. ${match[1]}` : correct;
}

export function selectedAnswerText(question: PublicQuestionItem, selectedAnswer: string): string {
  const normalized = normalizeAnswer(selectedAnswer);
  const match = choiceEntries(question).find(([letter]) => normalizeAnswer(letter) === normalized);
  return match ? `${match[0]}. ${match[1]}` : selectedAnswer.trim();
}

export function explanationText(question: PublicQuestionItem): string {
  const explanation = question.explanation;
  if (!explanation) return "Review the worked solution and retry a fresh question in the same skill.";
  if (typeof explanation === "string") return explanation;
  if (typeof explanation !== "object" || Array.isArray(explanation)) return String(explanation);
  const record = explanation as Record<string, unknown>;
  return String(record.correct || record.solution || record.explanation || Object.values(record).find((value) => typeof value === "string") || "");
}

export function questionType(question: PublicQuestionItem): string {
  return String(question.questionType || question.type || (isGridIn(question) ? "student_produced_response" : "multiple_choice"));
}

export function makeAttempt(
  question: PublicQuestionItem,
  selectedAnswer: string,
  mode: StudyMode,
  startedAt: number,
  context: {
    contentVersion?: string;
    attemptNumber?: number;
    studentScoreBand?: string;
    targetScore?: number;
    hintUsed?: boolean;
    hintCount?: number;
  } = {},
): AttemptRecord {
  const now = new Date().toISOString();
  const elapsedMs = Math.max(0, Date.now() - startedAt);
  const correct = answerIsCorrect(question, selectedAnswer);
  const hintCount = Math.max(0, Number(context.hintCount || 0));
  const hintUsed = Boolean(context.hintUsed || hintCount > 0);
  const helpTiming = hintUsed ? "pre_submit" : "none";
  const attemptNumber = Math.max(1, Number(context.attemptNumber || 1));
  const answerText = selectedAnswerText(question, selectedAnswer);
  const correctText = correctAnswerText(question);
  const baseId = [question.id, mode, now, selectedAnswer.trim(), attemptNumber].join("|");
  return {
    attemptSchemaVersion: ATTEMPT_SCHEMA_VERSION,
    id: `attempt-${stableChecksum(baseId)}`,
    questionId: question.id,
    selectedAnswer: selectedAnswer.trim(),
    selectedAnswerText: answerText,
    correctAnswer: String(question.correctAnswer ?? ""),
    correctAnswerText: correctText,
    correct,
    answeredAt: now,
    elapsedMs,
    timeSpentSeconds: Math.round(elapsedMs / 1000),
    mode,
    practiceMode: mode,
    section: question.section,
    domain: question.domain,
    skill: question.skill,
    difficulty: question.difficulty,
    questionType: questionType(question),
    contentVersion: context.contentVersion || "",
    attemptNumber,
    studentScoreBand: context.studentScoreBand || "unestimated",
    targetScore: Number(context.targetScore || 1500),
    hintUsed,
    hintCount,
    fullSolutionViewed: false,
    helpTiming,
    independentAttempt: !hintUsed,
    errorType: correct ? "none" : "wrong_answer",
    proofPass: mode === "review" ? correct : null,
    learningEvidence: {
      required: !correct || mode === "review",
      status: correct && mode !== "review" ? "not_required" : "pending",
      rootCause: correct ? "" : "wrong_answer",
      helpTelemetry: {
        hintUsed,
        hintCount,
        fullSolutionViewed: false,
        helpTiming,
        independentAttempt: !hintUsed,
      },
    },
  };
}

export function buildAttemptLearningEvent(attempt: AttemptRecord, accountId = ""): LearningEventRecord {
  return buildLearningEvent(`${attempt.mode}_attempt`, {
    attemptId: attempt.id,
    questionId: attempt.questionId,
    selectedAnswer: attempt.selectedAnswer,
    selectedAnswerText: attempt.selectedAnswerText,
    correctAnswer: attempt.correctAnswer,
    correctAnswerText: attempt.correctAnswerText,
    correct: attempt.correct,
    elapsedMs: attempt.elapsedMs,
    timeSpentSeconds: attempt.timeSpentSeconds,
    mode: attempt.mode,
    practiceMode: attempt.practiceMode,
    section: attempt.section,
    domain: attempt.domain,
    skill: attempt.skill,
    difficulty: attempt.difficulty,
    questionType: attempt.questionType,
    contentVersion: attempt.contentVersion,
    attemptNumber: attempt.attemptNumber,
    studentScoreBand: attempt.studentScoreBand,
    targetScore: attempt.targetScore,
    hintUsed: attempt.hintUsed,
    hintCount: attempt.hintCount,
    fullSolutionViewed: attempt.fullSolutionViewed,
    helpTiming: attempt.helpTiming,
    independentAttempt: attempt.independentAttempt,
    errorType: attempt.errorType,
    proofPass: attempt.proofPass,
    learningEvidence: attempt.learningEvidence,
  }, {
    accountId,
    entityType: "question",
    entityId: attempt.questionId,
    occurredAt: attempt.answeredAt,
  });
}

export function recordAttempt(
  state: LearnerState,
  question: PublicQuestionItem,
  selectedAnswer: string,
  mode: StudyMode,
  startedAt: number,
  context: { accountId?: string; contentVersion?: string; hintUsed?: boolean; hintCount?: number } = {},
): { state: LearnerState; attempt: AttemptRecord; event: LearningEventRecord } {
  const attempt = makeAttempt(question, selectedAnswer, mode, startedAt, {
    contentVersion: context.contentVersion || state.lastContentVersion,
    attemptNumber: state.attempts.length + 1,
    studentScoreBand: estimatedBand(state),
    targetScore: state.targetScore,
    hintUsed: context.hintUsed,
    hintCount: context.hintCount,
  });
  const event = buildAttemptLearningEvent(attempt, context.accountId || "");
  const learningEvents = appendLearningEvent(state.learningEvents, event);
  const summary = summarizeLearningEvents(learningEvents);
  return {
    attempt,
    event,
    state: {
      ...state,
      attempts: [...state.attempts, attempt],
      learningEvents,
      learningEventRevision: summary.revision,
      learningEventUpdatedAt: summary.lastAt,
    },
  };
}

export function replaceLearningEvent(state: LearnerState, event: LearningEventRecord): LearnerState {
  const learningEvents = appendLearningEvent(state.learningEvents.filter((row) => row.id !== event.id), event);
  const summary = summarizeLearningEvents(learningEvents);
  return {
    ...state,
    learningEvents,
    learningEventRevision: summary.revision,
    learningEventUpdatedAt: summary.lastAt,
  };
}

function activeStudentAccount(accountState: AccountState): SatAccount | null {
  const active = accountState.accounts.find((account) => account.id === accountState.activeAccountId && account.role === "student" && account.status === "active");
  return active || accountState.accounts.find((account) => account.id === "student-demo" && account.role === "student") || accountState.accounts.find((account) => account.role === "student") || null;
}

export function syncAttemptToAccountProfile(
  attempt: AttemptRecord,
  event: LearningEventRecord,
  storage: Storage | null = globalThis.localStorage ?? null,
): { accountId: string; event: LearningEventRecord; state: AccountState | null } {
  if (!storage) return { accountId: "", event, state: null };
  const accountState = loadAccountState(storage);
  const account = activeStudentAccount(accountState);
  if (!account) return { accountId: "", event, state: accountState };
  const syncedEvent = { ...event, accountId: account.id };
  const profile = ensureAccountProfile(accountState.profiles, account.id);
  const attempts = profile.attempts.filter((row) => row.id !== attempt.id);
  profile.attempts = [...attempts, attempt as unknown as Record<string, unknown>];
  profile.learningEvents = appendLearningEvent(profile.learningEvents, syncedEvent) as unknown as Record<string, unknown>[];
  const summary = summarizeLearningEvents(profile.learningEvents);
  profile.learningEventRevision = summary.revision;
  profile.learningEventUpdatedAt = summary.lastAt;
  const nextState = saveAccountState(
    {
      ...accountState,
      activeAccountId: accountState.activeAccountId || account.id,
      profiles: { ...accountState.profiles, [account.id]: profile },
    },
    storage,
  );
  return { accountId: account.id, event: syncedEvent, state: nextState };
}

export function learnerEventSummary(state: LearnerState) {
  return summarizeLearningEvents(state.learningEvents);
}

export function attemptedQuestionIds(state: LearnerState): Set<string> {
  return new Set(state.attempts.map((attempt) => attempt.questionId));
}

export function buildDiagnosticSet(repo: QuestionRepository, state: LearnerState, limit = 20): PublicQuestionItem[] {
  const standardItems = selectSatDiagnosticItems(repo.standardCatalog, attemptedStandardQuestionIds(state), { limit });
  const selected = publicQuestionsFromStandardItems(repo, standardItems);
  if (selected.length >= limit) return selected.slice(0, limit);
  return mergeQuestionSelections(selected, legacyDiagnosticSet(repo, state, limit), limit);
}

function legacyDiagnosticSet(repo: QuestionRepository, state: LearnerState, limit = 20): PublicQuestionItem[] {
  const seen = attemptedQuestionIds(state);
  const fresh = repo.items.filter((item) => !seen.has(item.id) && item.practicePool !== "remedial_pool");
  const sections = ["Reading and Writing", "Math"];
  const selected: PublicQuestionItem[] = [];

  for (const section of sections) {
    selected.push(...pickDiverse(fresh.filter((item) => item.section === section && item.difficulty === "Medium"), Math.floor(limit * 0.35)));
    selected.push(...pickDiverse(fresh.filter((item) => item.section === section && item.difficulty === "Hard"), Math.floor(limit * 0.15)));
  }

  if (selected.length < limit) {
    selected.push(...pickDiverse(fresh.filter((item) => !selected.some((existing) => existing.id === item.id)), limit - selected.length));
  }
  return selected.slice(0, limit);
}

export function buildPracticeSet(
  repo: QuestionRepository,
  state: LearnerState,
  options: { skill?: string; domain?: string; difficulty?: string; limit?: number } = {},
): PublicQuestionItem[] {
  const limit = options.limit || 10;
  const standardItems = selectSatPracticeItems(repo.standardCatalog, {
    limit,
    domain: options.domain,
    difficulty: options.difficulty,
    attemptedItemIds: attemptedStandardQuestionIds(state),
    skillIds: standardSkillIdsForPublicSkill(repo.standardCatalog, options.skill),
  });
  const publicSkillFilter = options.skill && !isStandardSkillId(options.skill) ? options.skill : "";
  const selected = publicQuestionsFromStandardItems(repo, standardItems).filter((item) => {
    if (publicSkillFilter && item.skill !== publicSkillFilter) return false;
    return true;
  });
  if (selected.length >= limit) return selected.slice(0, limit);
  return mergeQuestionSelections(selected, legacyPracticeSet(repo, state, options), limit);
}

function legacyPracticeSet(
  repo: QuestionRepository,
  state: LearnerState,
  options: { skill?: string; domain?: string; difficulty?: string; limit?: number } = {},
): PublicQuestionItem[] {
  const seen = attemptedQuestionIds(state);
  const limit = options.limit || 10;
  const pool = repo.items.filter((item) => {
    if (seen.has(item.id)) return false;
    if (options.skill && item.skill !== options.skill) return false;
    if (options.domain && item.domain !== options.domain) return false;
    if (options.difficulty && item.difficulty !== options.difficulty) return false;
    return true;
  });
  const preferred = pool.filter((item) => item.difficulty === "Medium" || item.difficulty === "Hard");
  return pickDiverse(preferred.length >= limit ? preferred : pool, limit);
}

function attemptedStandardQuestionIds(state: LearnerState): string[] {
  return unique(state.attempts.flatMap((attempt) => [attempt.questionId, standardSatQuestionId(attempt.questionId)]));
}

function publicQuestionsFromStandardItems(repo: QuestionRepository, items: QuestionItem[]): PublicQuestionItem[] {
  const selected: PublicQuestionItem[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const sourceId = String(item.sourceId || "").trim();
    const publicId = sourceId || item.id.replace(/^sat\./, "");
    const question = repo.byId.get(publicId);
    if (!question || seen.has(question.id)) continue;
    selected.push(question);
    seen.add(question.id);
  }
  return selected;
}

function standardSkillIdsForPublicSkill(catalog: SatLearningCatalog, skill?: string): string[] | undefined {
  const normalized = String(skill || "").trim();
  if (!normalized) return undefined;
  if (isStandardSkillId(normalized)) return [normalized];
  const skillIds = catalog.items
    .filter((item) => String(item.metadata?.satSkill || "") === normalized)
    .flatMap((item) => item.skillIds);
  return unique(skillIds);
}

function isStandardSkillId(skill: string): boolean {
  return skill.startsWith("math.") || skill.startsWith("eng.");
}

function standardSatQuestionId(sourceId: string): string {
  return `sat.${String(sourceId || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown"}`;
}

function mergeQuestionSelections(primary: PublicQuestionItem[], fallback: PublicQuestionItem[], limit: number): PublicQuestionItem[] {
  const selected: PublicQuestionItem[] = [];
  const seen = new Set<string>();
  for (const item of [...primary, ...fallback]) {
    if (seen.has(item.id)) continue;
    selected.push(item);
    seen.add(item.id);
    if (selected.length >= limit) break;
  }
  return selected;
}

export function buildReviewSet(repo: QuestionRepository, state: LearnerState, limit = 8): PublicQuestionItem[] {
  const wrong = state.attempts.filter((attempt) => !attempt.correct).slice(-20).reverse();
  const seen = attemptedQuestionIds(state);
  const selected: PublicQuestionItem[] = [];
  for (const attempt of wrong) {
    const transfer = repo.items.find(
      (item) => item.skill === attempt.skill && item.id !== attempt.questionId && !seen.has(item.id) && !selected.some((row) => row.id === item.id),
    );
    if (transfer) selected.push(transfer);
    if (selected.length >= limit) break;
  }
  return selected;
}

export function pickDiverse(pool: PublicQuestionItem[], limit: number): PublicQuestionItem[] {
  const selected: PublicQuestionItem[] = [];
  const skillCounts = new Map<string, number>();
  const domainCounts = new Map<string, number>();
  for (const item of pool) {
    const skillCount = skillCounts.get(item.skill) || 0;
    const domainCount = domainCounts.get(item.domain) || 0;
    if (skillCount >= 2 || domainCount >= Math.max(3, Math.ceil(limit / 3))) continue;
    selected.push(item);
    skillCounts.set(item.skill, skillCount + 1);
    domainCounts.set(item.domain, domainCount + 1);
    if (selected.length >= limit) return selected;
  }
  for (const item of pool) {
    if (!selected.some((existing) => existing.id === item.id)) selected.push(item);
    if (selected.length >= limit) break;
  }
  return selected;
}

export function masteryRows(state: LearnerState): MasteryRow[] {
  const rows = new Map<string, MasteryRow>();
  for (const attempt of state.attempts) {
    const key = `${attempt.section}|${attempt.domain}|${attempt.skill}`;
    const row =
      rows.get(key) ||
      ({
        key,
        section: attempt.section,
        domain: attempt.domain,
        skill: attempt.skill,
        attempts: 0,
        correct: 0,
        accuracy: 0,
        hardCorrect: 0,
        hardAttempts: 0,
        lastWrongAt: "",
        status: "Collect evidence",
      } satisfies MasteryRow);
    row.attempts += 1;
    if (attempt.correct) row.correct += 1;
    if (attempt.difficulty === "Hard") {
      row.hardAttempts += 1;
      if (attempt.correct) row.hardCorrect += 1;
    }
    if (!attempt.correct) row.lastWrongAt = attempt.answeredAt;
    row.accuracy = Math.round((row.correct / row.attempts) * 100);
    row.status = masteryStatus(row);
    rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) => {
    const statusRank = { Repair: 0, "Collect evidence": 1, Core: 2, "Hard proof": 3, Stable: 4 };
    return statusRank[a.status] - statusRank[b.status] || a.accuracy - b.accuracy || b.attempts - a.attempts;
  });
}

function masteryStatus(row: MasteryRow): MasteryRow["status"] {
  if (row.attempts < 3) return "Collect evidence";
  if (row.accuracy < 75 || row.lastWrongAt) return "Repair";
  if (row.hardCorrect < 2) return "Hard proof";
  if (row.accuracy >= 85 && row.hardCorrect >= 2) return "Stable";
  return "Core";
}

export function nextAction(state: LearnerState): NextAction {
  const wrongCount = state.attempts.filter((attempt) => !attempt.correct).length;
  if (state.attempts.length < 8) {
    return {
      label: "Bắt đầu chẩn đoán",
      detail: "Làm baseline 20 câu trước khi luyện rộng để hệ thống định tuyến đúng điểm yếu.",
      view: "diagnostic",
    };
  }
  if (wrongCount) {
    const weak = masteryRows(state).find((row) => row.status === "Repair") || masteryRows(state)[0];
    return {
      label: "Sửa lỗi trọng điểm",
      detail: weak ? `Sửa ${weak.skill} bằng câu proof mới, khác khuôn.` : "Xử lý lỗi sai trước khi tăng khối lượng luyện.",
      view: "review",
      skill: weak?.skill,
      domain: weak?.domain,
    };
  }
  return {
    label: "Chạy sprint tập trung",
    detail: "Làm một set 10 câu Medium/Hard có giới hạn thời gian.",
    view: "practice",
  };
}

export function estimatedBand(state: LearnerState): string {
  if (!state.attempts.length) return "Chưa có baseline";
  const accuracy = state.attempts.filter((attempt) => attempt.correct).length / state.attempts.length;
  const hardAttempts = state.attempts.filter((attempt) => attempt.difficulty === "Hard");
  const hardAccuracy = hardAttempts.length ? hardAttempts.filter((attempt) => attempt.correct).length / hardAttempts.length : 0;
  const estimate = Math.round((900 + accuracy * 420 + hardAccuracy * 280) / 10) * 10;
  return `${Math.max(900, Math.min(1600, estimate))}`;
}
