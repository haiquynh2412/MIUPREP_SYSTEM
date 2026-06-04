import { ensureAccountProfile, loadAccountState, saveAccountState, type AccountProfile, type AccountState, type SatAccount } from "./account-ops";

export const PUBLIC_BACKEND_TOKEN_KEY = "sat-studio-public-backend-token";
export const DEFAULT_PUBLIC_BACKEND_BASE_URL = "/api/public";
export const PUBLIC_BACKEND_COOKIE_SESSION = "__sat_studio_http_only_cookie_session__";
export const PUBLIC_BACKEND_CSRF_COOKIE_NAME = "sat_studio_public_csrf";
export const PUBLIC_BACKEND_CSRF_HEADER_NAME = "X-CSRF-Token";

export type BackendStatusLevel = "ok" | "warning" | "error";
export type FetchLike = (input: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export interface BackendAccount {
  id: string;
  username?: string;
  displayName?: string;
  role: string;
  scope?: string;
  status?: string;
  [key: string]: unknown;
}

export interface PublicBackendState {
  baseUrl: string;
  account: BackendAccount | null;
  lastHealth: Record<string, unknown> | null;
  lastMonitoring: Record<string, unknown> | null;
  lastExportAt: string;
  lastSyncAt: string;
  lastServerProgressAt: string;
  lastProfileSyncAt: string;
  lastServerProfileAt: string;
  lastServerProfileRevision: number;
  lastLearningSyncAt: string;
  lastLearningSyncReason: string;
  lastLearningSyncMode: "backend" | "local";
  lastContentPackageAt: string;
  lastContentPackageVersion: string;
  lastContentPackageCount: number;
  lastContentPackageScope: string;
  lastContentPackageSource: string;
  sessionExpiresAt: number;
  autoSync: boolean;
  statusLevel: BackendStatusLevel;
  statusTitle: string;
  statusMessage: string;
  [key: string]: unknown;
}

export interface BackendSessionModel {
  state: PublicBackendState;
  token: string;
  loggedIn: boolean;
  canAdmin: boolean;
  canBootstrap: boolean;
  sessionLabel: string;
  healthLabel: string;
  monitoringLabel: string;
  actionDisabled: {
    refresh: boolean;
    monitoring: boolean;
    exportSnapshot: boolean;
    logout: boolean;
  };
}

export interface BackendCredentials {
  username: string;
  password: string;
}

export interface BackendSignupInput extends BackendCredentials {
  displayName?: string;
  role?: "student" | "parent";
  parentId?: string;
}

export interface BackendProfileRecord {
  accountId: string;
  source: string;
  profile: Record<string, unknown>;
  clientRevision: number;
  serverRevision: number;
  updatedAt: string;
  updatedByAccountId: string;
  contentSafety?: Record<string, unknown>;
}

export interface BackendClassroom {
  id: string;
  name: string;
  joinCode: string;
  teacherAccountId: string;
  teacherDisplayName?: string;
  teacherUsername?: string;
  status: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendClassAssignment {
  id: string;
  classId: string;
  title: string;
  mode: string;
  focusSkill: string;
  dueDate: string;
  targetStudentIds: string[];
  status: string;
  createdAt: string;
  createdByAccountId: string;
  evidenceByStudent?: Record<string, unknown>;
}

export interface BackendClassReport {
  class: BackendClassroom;
  students: Array<Record<string, unknown>>;
  assignments: BackendClassAssignment[];
  skillStats: Array<Record<string, unknown>>;
  itemStats: Array<Record<string, unknown>>;
  generatedAt: string;
}

export interface ProfileCounter {
  attempts: number;
  pretests: number;
  studyNotes: number;
  vocabKnown: number;
  lessonProgress: number;
  practiceReports: number;
  learningEvents: number;
}

export interface ProfileDiffSummary {
  local: ProfileCounter;
  server: ProfileCounter;
  changedKeys: string[];
  changedCount: number;
}

export interface FullProfileSnapshot {
  schemaVersion: "sat_profile_v2_learning_evidence";
  syncContractVersion: "sat_profile_v2_learning_evidence";
  sourceOfTruth: Record<string, string>;
  accountId: string;
  account: {
    id: string;
    name: string;
    role: string;
    targetScore: number;
  };
  summary: Record<string, unknown>;
  profile: Record<string, unknown>;
  clientUpdatedAt: string;
}

export const PROFILE_SYNC_CONTRACT_VERSION = "sat_profile_v2_learning_evidence";
export const PROFILE_SOURCE_OF_TRUTH: Record<string, string> = {
  profile: "backend.profile_records",
  attempts: "backend.profile_records:profile.attempts",
  learningEvents: "backend.profile_records:profile.learningEvents",
  learningEvidence: "backend.profile_records:profile.attempts[].learningEvidence",
  progressSummary: "backend.progress_records",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function numberValue(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function cloneRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {};
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function cloneAccountState(state: AccountState): AccountState {
  return {
    ...state,
    accounts: state.accounts.map((account) => ({
      ...account,
      parentIds: [...account.parentIds],
      permissions: { ...account.permissions },
      studyPlan: { ...account.studyPlan },
    })),
    profiles: Object.fromEntries(Object.entries(state.profiles).map(([id, profile]) => [id, cloneRecord(profile) as AccountProfile])),
    raw: { ...state.raw },
    storage: { ...state.storage },
  };
}

export function normalizeBaseUrl(baseUrl: unknown = DEFAULT_PUBLIC_BACKEND_BASE_URL): string {
  const clean = text(baseUrl) || DEFAULT_PUBLIC_BACKEND_BASE_URL;
  return clean.replace(/\/+$/, "");
}

export function normalizeBackendAccount(value: unknown): BackendAccount | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  if (!id) return null;
  return {
    ...value,
    id,
    username: text(value.username),
    displayName: text(value.displayName),
    role: text(value.role) || "student",
    scope: text(value.scope),
    status: text(value.status) || "active",
  };
}

export function normalizePublicBackendState(input: unknown = {}): PublicBackendState {
  const source = isRecord(input) ? input : {};
  const learningMode = source.lastLearningSyncMode === "backend" ? "backend" : "local";
  const status = text(source.statusLevel);
  return {
    ...source,
    baseUrl: normalizeBaseUrl(source.baseUrl),
    account: normalizeBackendAccount(source.account),
    lastHealth: recordOrNull(source.lastHealth),
    lastMonitoring: recordOrNull(source.lastMonitoring),
    lastExportAt: typeof source.lastExportAt === "string" ? source.lastExportAt : "",
    lastSyncAt: typeof source.lastSyncAt === "string" ? source.lastSyncAt : "",
    lastServerProgressAt: typeof source.lastServerProgressAt === "string" ? source.lastServerProgressAt : "",
    lastProfileSyncAt: typeof source.lastProfileSyncAt === "string" ? source.lastProfileSyncAt : "",
    lastServerProfileAt: typeof source.lastServerProfileAt === "string" ? source.lastServerProfileAt : "",
    lastServerProfileRevision: numberValue(source.lastServerProfileRevision),
    lastLearningSyncAt: typeof source.lastLearningSyncAt === "string" ? source.lastLearningSyncAt : "",
    lastLearningSyncReason: typeof source.lastLearningSyncReason === "string" ? source.lastLearningSyncReason : "",
    lastLearningSyncMode: learningMode,
    lastContentPackageAt: typeof source.lastContentPackageAt === "string" ? source.lastContentPackageAt : "",
    lastContentPackageVersion: typeof source.lastContentPackageVersion === "string" ? source.lastContentPackageVersion : "",
    lastContentPackageCount: numberValue(source.lastContentPackageCount),
    lastContentPackageScope: typeof source.lastContentPackageScope === "string" ? source.lastContentPackageScope : "",
    lastContentPackageSource: typeof source.lastContentPackageSource === "string" ? source.lastContentPackageSource : "",
    sessionExpiresAt: numberValue(source.sessionExpiresAt),
    autoSync: source.autoSync !== false,
    statusLevel: status === "ok" || status === "error" ? status : "warning",
    statusTitle: typeof source.statusTitle === "string" ? source.statusTitle : "Backend not checked",
    statusMessage: typeof source.statusMessage === "string" ? source.statusMessage : "Check backend health before syncing progress.",
  };
}

export function loadPublicBackendState(storage: Storage | null = globalThis.localStorage ?? null): { accountState: AccountState; backend: PublicBackendState } {
  const accountState = loadAccountState(storage);
  const backend = normalizePublicBackendState(accountState.raw.publicBackend);
  return { accountState, backend };
}

export function savePublicBackendState(
  accountState: AccountState,
  backend: PublicBackendState,
  storage: Storage | null = globalThis.localStorage ?? null,
): { accountState: AccountState; backend: PublicBackendState } {
  const normalized = normalizePublicBackendState(backend);
  const nextState = {
    ...accountState,
    raw: {
      ...accountState.raw,
      publicBackend: normalized,
    },
  };
  return { accountState: saveAccountState(nextState, storage), backend: normalized };
}

export function getBackendToken(storage?: Storage | null): string {
  try {
    const legacyStorage = storage === undefined ? globalThis.sessionStorage ?? null : storage;
    legacyStorage?.removeItem(PUBLIC_BACKEND_TOKEN_KEY);
  } catch {
    // Session storage can be disabled; cookie auth remains the source of truth.
  }
  try {
    const loaded = loadPublicBackendState(globalThis.localStorage ?? null);
    return loaded.backend.account ? PUBLIC_BACKEND_COOKIE_SESSION : "";
  } catch {
    return "";
  }
}

export function setBackendToken(_token: string, storage?: Storage | null): void {
  try {
    const legacyStorage = storage === undefined ? globalThis.sessionStorage ?? null : storage;
    legacyStorage?.removeItem(PUBLIC_BACKEND_TOKEN_KEY);
  } catch {
    // Session storage can be disabled; HttpOnly cookie auth still works.
  }
}

function authHeaders(token: string): Record<string, string> {
  if (token === PUBLIC_BACKEND_COOKIE_SESSION) return {};
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function cookieValue(name: string): string {
  if (typeof document === "undefined") return "";
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length) || "";
}

function csrfHeaders(method: string, token: string): Record<string, string> {
  const normalized = method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(normalized)) return {};
  if (token && token !== PUBLIC_BACKEND_COOKIE_SESSION) return {};
  const csrfToken = cookieValue(PUBLIC_BACKEND_CSRF_COOKIE_NAME);
  return csrfToken ? { [PUBLIC_BACKEND_CSRF_HEADER_NAME]: decodeURIComponent(csrfToken) } : {};
}

export async function requestJson<T = Record<string, unknown>>(
  path: string,
  options: {
    baseUrl?: string;
    token?: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    fetchImpl?: FetchLike;
  } = {},
): Promise<T> {
  const fetchImpl = options.fetchImpl || (typeof fetch !== "undefined" ? (fetch as unknown as FetchLike) : null);
  if (!fetchImpl) throw new Error("Fetch is not available in this environment.");
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...authHeaders(options.token || ""),
    ...csrfHeaders(options.method || "GET", options.token || ""),
    ...(options.headers || {}),
  };
  const init: RequestInit = { method: options.method || "GET", headers, credentials: "include" };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }
  const response = await fetchImpl(`${normalizeBaseUrl(options.baseUrl)}${path}`, init);
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : {};
  if (!response.ok) {
    const error = new Error(text(payload.error) || `Request failed with ${response.status}`) as Error & { status?: number; payload?: unknown };
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload as T;
}

export function backendHealth(options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/health", options);
}

export function bootstrapBackendAdmin(
  credentials: BackendCredentials & { displayName?: string },
  options: { baseUrl?: string; fetchImpl?: FetchLike } = {},
): Promise<Record<string, unknown>> {
  return requestJson("/bootstrap", { ...options, method: "POST", body: credentials });
}

export function loginBackend(credentials: BackendCredentials, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/login", { ...options, method: "POST", body: credentials });
}

export function signupBackend(input: BackendSignupInput, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/signup", { ...options, method: "POST", body: input });
}

export function getBackendMe(token: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/me", { ...options, token });
}

export function listBackendAccounts(token: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/accounts", { ...options, token });
}

export function refreshBackendSession(token: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/session/refresh", { ...options, method: "POST", token });
}

export function logoutBackend(token: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/logout", { ...options, method: "POST", token });
}

export function backendMonitoring(token: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/monitoring", { ...options, token });
}

export function exportBackendSnapshot(token: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<Record<string, unknown>> {
  return requestJson("/export", { ...options, token });
}

export function getBackendProfile(
  token: string,
  accountId: string,
  options: { baseUrl?: string; source?: string; fetchImpl?: FetchLike } = {},
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams();
  if (accountId) params.set("accountId", accountId);
  params.set("source", options.source || "sat_studio_profile");
  return requestJson(`/profile?${params.toString()}`, { ...options, token });
}

export function saveBackendProfile(
  token: string,
  accountId: string,
  profile: FullProfileSnapshot | Record<string, unknown>,
  options: {
    baseUrl?: string;
    source?: string;
    clientRevision?: number;
    baseServerRevision?: number;
    mergeStrategy?: "reject_conflict" | "overwrite" | "client_wins";
    fetchImpl?: FetchLike;
  } = {},
): Promise<Record<string, unknown>> {
  return requestJson("/profile", {
    ...options,
    method: "POST",
    token,
    body: {
      accountId,
      profile,
      source: options.source || "sat_studio_profile",
      clientRevision: options.clientRevision || 0,
      baseServerRevision: options.baseServerRevision,
      mergeStrategy: options.mergeStrategy || "reject_conflict",
    },
  });
}

export function saveBackendProgress(
  token: string,
  accountId: string,
  progress: Record<string, unknown>,
  options: { baseUrl?: string; source?: string; fetchImpl?: FetchLike } = {},
): Promise<Record<string, unknown>> {
  return requestJson("/progress", {
    ...options,
    method: "POST",
    token,
    body: {
      accountId,
      progress,
      source: options.source || "sat_studio",
    },
  });
}

export function listBackendQuestionReviews(
  token: string,
  questionId: string,
  options: { baseUrl?: string; limit?: number; fetchImpl?: FetchLike } = {},
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams();
  if (questionId) params.set("questionId", questionId);
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return requestJson(`/question-reviews${suffix}`, { ...options, token });
}

export function saveBackendQuestionReview(
  token: string,
  payload: Record<string, unknown>,
  options: { baseUrl?: string; fetchImpl?: FetchLike } = {},
): Promise<Record<string, unknown>> {
  return requestJson("/question-reviews", { ...options, method: "POST", token, body: payload });
}

export function listBackendClasses(token: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<{ items: BackendClassroom[]; count: number }> {
  return requestJson("/classes", { ...options, token });
}

export function createBackendClass(
  token: string,
  payload: { name: string; teacherAccountId?: string },
  options: { baseUrl?: string; fetchImpl?: FetchLike } = {},
): Promise<{ class: BackendClassroom }> {
  return requestJson("/classes", { ...options, method: "POST", token, body: payload });
}

export function joinBackendClass(
  token: string,
  payload: { joinCode: string; studentAccountId?: string },
  options: { baseUrl?: string; fetchImpl?: FetchLike } = {},
): Promise<{ class: BackendClassroom; studentAccountId: string; joinedAt: string }> {
  return requestJson("/classes/join", { ...options, method: "POST", token, body: payload });
}

export function listBackendClassAssignments(
  token: string,
  classId: string,
  options: { baseUrl?: string; fetchImpl?: FetchLike } = {},
): Promise<{ items: BackendClassAssignment[]; count: number; classId: string }> {
  return requestJson(`/classes/${encodeURIComponent(classId)}/assignments`, { ...options, token });
}

export function createBackendClassAssignment(
  token: string,
  classId: string,
  payload: {
    title: string;
    mode: string;
    focusSkill: string;
    dueDate: string;
    targetStudentIds?: string[];
  },
  options: { baseUrl?: string; fetchImpl?: FetchLike } = {},
): Promise<{ assignment: BackendClassAssignment }> {
  return requestJson(`/classes/${encodeURIComponent(classId)}/assignments`, { ...options, method: "POST", token, body: payload });
}

export function getBackendClassReport(token: string, classId: string, options: { baseUrl?: string; fetchImpl?: FetchLike } = {}): Promise<BackendClassReport> {
  return requestJson(`/classes/${encodeURIComponent(classId)}/report`, { ...options, token });
}

export function submitBackendAssignmentEvidence(
  token: string,
  assignmentId: string,
  payload: { studentAccountId?: string; status?: string; evidence?: Record<string, unknown> },
  options: { baseUrl?: string; fetchImpl?: FetchLike } = {},
): Promise<Record<string, unknown>> {
  return requestJson(`/assignments/${encodeURIComponent(assignmentId)}/evidence`, { ...options, method: "POST", token, body: payload });
}

export function normalizeBackendProfileRecord(value: unknown): BackendProfileRecord {
  const source = isRecord(value) ? value : {};
  const profile = isRecord(source.profile) ? source.profile : isRecord(source.serverProfile) ? source.serverProfile : {};
  return {
    accountId: text(source.accountId),
    source: text(source.source) || "sat_studio_profile",
    profile: cloneRecord(profile),
    clientRevision: numberValue(source.clientRevision),
    serverRevision: numberValue(source.serverRevision),
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : "",
    updatedByAccountId: text(source.updatedByAccountId),
    contentSafety: recordOrNull(source.contentSafety) || undefined,
  };
}

export function buildProgressSnapshot(profile: AccountProfile | Record<string, unknown>, account: SatAccount): Record<string, unknown> {
  const attempts = Array.isArray(profile.attempts) ? profile.attempts : [];
  const learningEvents = Array.isArray(profile.learningEvents) ? profile.learningEvents : [];
  const attemptsWithLearningEvidence = attempts.filter((attempt) => isRecord(attempt) && isRecord(attempt.learningEvidence) && attempt.learningEvidence.status === "provided").length;
  const missingRequiredEvidence = attempts.filter(
    (attempt) => isRecord(attempt) && isRecord(attempt.learningEvidence) && attempt.learningEvidence.required && attempt.learningEvidence.status !== "provided",
  ).length;
  return {
    accountId: account.id,
    targetScore: Number(account.targetScore || 0),
    attempts: attempts.length,
    attemptsWithLearningEvidence,
    missingRequiredEvidence,
    learningEvents: learningEvents.length,
    pretests: Array.isArray(profile.pretests) ? profile.pretests.length : 0,
    latestDiagnostic: Array.isArray(profile.pretests) ? profile.pretests[0] || null : null,
    attendance: isRecord(profile.attendance) ? profile.attendance : {},
    streak: isRecord(profile.streak) ? profile.streak : {},
    skillMastery: isRecord(profile.skillMastery) ? profile.skillMastery : {},
    lessonProgress: isRecord(profile.lessonProgress) ? profile.lessonProgress : {},
    updatedAt: new Date().toISOString(),
  };
}

export function buildFullProfileSnapshot(profile: AccountProfile | Record<string, unknown>, account: SatAccount): FullProfileSnapshot {
  const clonedProfile = cloneRecord(profile);
  delete clonedProfile.currentPretest;
  return {
    schemaVersion: PROFILE_SYNC_CONTRACT_VERSION,
    syncContractVersion: PROFILE_SYNC_CONTRACT_VERSION,
    sourceOfTruth: PROFILE_SOURCE_OF_TRUTH,
    accountId: account.id,
    account: {
      id: account.id,
      name: account.name || account.email || account.id,
      role: account.role || "student",
      targetScore: Number(account.targetScore || 0),
    },
    summary: buildProgressSnapshot(profile, account),
    profile: clonedProfile,
    clientUpdatedAt: new Date().toISOString(),
  };
}

export function serverProfileBody(record: BackendProfileRecord | Record<string, unknown> | null | undefined): Record<string, unknown> {
  const normalized = normalizeBackendProfileRecord(record || {});
  const snapshot = normalized.profile;
  if (isRecord(snapshot.profile)) return cloneRecord(snapshot.profile);
  return cloneRecord(snapshot);
}

export function profileCounter(profileBody: unknown): ProfileCounter {
  const profile = isRecord(profileBody) ? profileBody : {};
  return {
    attempts: Array.isArray(profile.attempts) ? profile.attempts.length : 0,
    pretests: Array.isArray(profile.pretests) ? profile.pretests.length : 0,
    studyNotes: Array.isArray(profile.studyNotes) ? profile.studyNotes.length : 0,
    vocabKnown: Array.isArray(profile.vocabKnown) ? profile.vocabKnown.length : 0,
    lessonProgress: isRecord(profile.lessonProgress) ? Object.keys(profile.lessonProgress).length : 0,
    practiceReports: Array.isArray(profile.practiceSessionReports) ? profile.practiceSessionReports.length : 0,
    learningEvents: Array.isArray(profile.learningEvents) ? profile.learningEvents.length : 0,
  };
}

export function serverProfileSummary(record: BackendProfileRecord | Record<string, unknown> | null | undefined): Record<string, number> {
  const normalized = normalizeBackendProfileRecord(record || {});
  const profile = normalized.profile;
  const summary = isRecord(profile.summary) ? profile.summary : {};
  const profileBody = serverProfileBody(normalized);
  return {
    attempts: numberValue(summary.attempts, profileCounter(profileBody).attempts),
    pretests: numberValue(summary.pretests, profileCounter(profileBody).pretests),
    targetScore: numberValue(summary.targetScore),
  };
}

export function buildProfileDiffSummary(record: BackendProfileRecord | Record<string, unknown>, localProfile: AccountProfile | Record<string, unknown>): ProfileDiffSummary {
  const local = profileCounter(localProfile);
  const server = profileCounter(serverProfileBody(record));
  const changedKeys = (Object.keys(local) as Array<keyof ProfileCounter>).filter((key) => local[key] !== server[key]);
  return {
    local,
    server,
    changedKeys,
    changedCount: changedKeys.length,
  };
}

export function applyServerProfileToAccountState(accountState: AccountState, localAccountId: string, record: BackendProfileRecord | Record<string, unknown>): AccountState {
  const incoming = serverProfileBody(record);
  if (!Object.keys(incoming).length) throw new Error("Server profile is empty.");
  const next = cloneAccountState(accountState);
  const profileSource: Record<string, unknown> = { ...next.profiles, [localAccountId]: { ...incoming, currentPretest: null } };
  next.profiles = {
    ...next.profiles,
    [localAccountId]: ensureAccountProfile(profileSource, localAccountId),
  };
  return next;
}

export function backendStatusPatch(level: BackendStatusLevel, title: string, message: string, extra: Record<string, unknown> = {}): Partial<PublicBackendState> {
  return {
    statusLevel: level,
    statusTitle: title,
    statusMessage: message,
    ...extra,
  };
}

export function applyBackendPatch(state: PublicBackendState, patch: Partial<PublicBackendState>): PublicBackendState {
  return normalizePublicBackendState({ ...state, ...patch });
}

export function buildBackendSessionModel(backend: PublicBackendState, token: string, localManager: SatAccount | null): BackendSessionModel {
  const loggedIn = Boolean(token && backend.account);
  const role = backend.account?.role || "";
  const canAdmin = loggedIn && ["admin", "content_admin"].includes(role);
  const expiresAt = backend.sessionExpiresAt ? new Date(backend.sessionExpiresAt * 1000).toISOString() : "";
  const healthService = text(backend.lastHealth?.service);
  const monitoring = backend.lastMonitoring;
  const counts = isRecord(monitoring?.counts) ? monitoring.counts : {};
  return {
    state: backend,
    token,
    loggedIn,
    canAdmin,
    canBootstrap: localManager?.role === "admin",
    sessionLabel: loggedIn ? `${backend.account?.username || backend.account?.id} (${role})${expiresAt ? ` expires ${expiresAt}` : ""}` : "No backend session",
    healthLabel: healthService || backend.statusTitle,
    monitoringLabel: monitoring ? `${numberValue(counts.accounts)} accounts, ${numberValue(counts.openQuestionAudits)} open audits` : "Monitoring not loaded",
    actionDisabled: {
      refresh: !loggedIn,
      monitoring: !canAdmin,
      exportSnapshot: !canAdmin,
      logout: !loggedIn,
    },
  };
}
