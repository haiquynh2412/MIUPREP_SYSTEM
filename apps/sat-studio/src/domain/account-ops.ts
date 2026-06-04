export const ACCOUNT_STATE_STORAGE_KEY = "sat-studio-state-v2";
export const LEGACY_ACCOUNT_STATE_STORAGE_KEY = "sat-studio-state-v1";

const CHUNK_MARKER = "__satStudioChunked";
const DEFAULT_CHUNK_SIZE = 750000;
const VALID_ROLES = new Set(["admin", "parent", "student"]);
const VALID_SCOPES = new Set(["family", "public"]);
const VALID_STATUSES = new Set(["active", "suspended", "disabled"]);
const VALID_THEMES = new Set(["studio", "teen_quest"]);
const VALID_AVATAR_COLORS = new Set(["teal", "blue", "coral", "amber", "slate"]);

export type AccountRole = "admin" | "parent" | "student";
export type AccountScope = "family" | "public";
export type AccountStatus = "active" | "suspended" | "disabled";
export type AccountTheme = "studio" | "teen_quest";
export type AvatarColor = "teal" | "blue" | "coral" | "amber" | "slate";

export interface AccountPermissions {
  rewardManager: boolean;
  questionContributor: boolean;
}

export interface StudyPlan {
  weeklyTarget: number;
  nextSessionAt: string;
}

export interface SatAccount {
  id: string;
  name: string;
  email: string;
  gradeLevel: string;
  avatarInitials: string;
  avatarColor: AvatarColor;
  permissions: AccountPermissions;
  role: AccountRole;
  scope: AccountScope;
  status: AccountStatus;
  passcode: string;
  targetScore: number;
  uiTheme: AccountTheme;
  parentIds: string[];
  createdAt: string;
  studyPlan: StudyPlan;
  [key: string]: unknown;
}

export interface AccountProfile {
  attempts: Array<Record<string, unknown>>;
  learningEvents: Array<Record<string, unknown>>;
  learningEventRevision: string;
  learningEventUpdatedAt: string;
  officialLogs: Array<Record<string, unknown>>;
  vocabKnown: string[];
  vocabQuizAttempts: Array<Record<string, unknown>>;
  pretests: Array<Record<string, unknown>>;
  attendance: {
    points: number;
    spentPoints: number;
    daily: Record<string, unknown>;
    stickers: unknown[];
    questRewardsClaimed: unknown[];
    rewardRedemptions: unknown[];
    lastRewardAt: string;
  };
  streak: {
    count: number;
    lastPracticeDate: string;
    freezeCredits: number;
    lastFreezeUsedAt: string;
  };
  externalStudyLogs: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface AccountState {
  version: 2;
  language: "en" | "vi";
  accounts: SatAccount[];
  profiles: Record<string, AccountProfile>;
  activeAccountId: string | null;
  raw: Record<string, unknown>;
  storage: AccountStorageSnapshot;
}

export interface AccountStorageSnapshot {
  exists: boolean;
  chunked: boolean;
  chunks: number;
  missingChunks: number[];
  length: number;
  approximateBytes: number;
}

export interface AccountOperationResult {
  ok: boolean;
  reason: string;
  account?: SatAccount;
  state: AccountState;
}

export interface AccountDraftInput {
  id?: string;
  name?: string;
  email?: string;
  gradeLevel?: string;
  avatarInitials?: string;
  avatarColor?: string;
  passcode?: string;
  scope?: string;
  role?: string;
  parentId?: string;
  targetScore?: string | number;
  uiTheme?: string;
  permissionRewards?: boolean;
  permissionAuthoring?: boolean;
  weeklyTarget?: string | number;
  nextSessionAt?: string;
  nextSessionLocal?: string;
}

export interface AccountSummaryRow {
  account: SatAccount;
  attempts: number;
  accuracy: number;
  latestBaseline: string;
  points: number;
  streak: number;
  externalMinutes: number;
  weeklyTarget: number;
  schedule: string;
  parentNames: string[];
  canEdit: boolean;
  canDelete: boolean;
  canSuspendOrActivate: boolean;
}

export interface AccountOperationsModel {
  manager: SatAccount;
  accounts: AccountSummaryRow[];
  total: number;
  active: number;
  students: number;
  parents: number;
  admins: number;
  locked: number;
  storage: AccountStorageSnapshot;
  canCreate: boolean;
  parentOptions: SatAccount[];
}

export const DEFAULT_ACCOUNTS: SatAccount[] = [
  normalizeAccount({
    id: "content-admin",
    name: "Content Admin",
    email: "content@satstudio.local",
    gradeLevel: "",
    avatarInitials: "CA",
    avatarColor: "teal",
    permissions: { rewardManager: true, questionContributor: true },
    role: "admin",
    scope: "family",
    status: "active",
    passcode: "9999",
    targetScore: 1600,
    createdAt: "2026-05-01T00:00:00.000Z",
  }),
  normalizeAccount({
    id: "parent-admin",
    name: "Parent Admin",
    email: "parent@satstudio.local",
    gradeLevel: "",
    avatarInitials: "PA",
    avatarColor: "blue",
    permissions: { rewardManager: true, questionContributor: false },
    role: "parent",
    scope: "family",
    status: "active",
    passcode: "1234",
    targetScore: 1500,
    createdAt: "2026-05-01T00:00:00.000Z",
  }),
  normalizeAccount({
    id: "student-demo",
    name: "Student Demo",
    email: "student@satstudio.local",
    gradeLevel: "Grade 10",
    avatarInitials: "SD",
    avatarColor: "coral",
    permissions: { rewardManager: false, questionContributor: false },
    role: "student",
    scope: "family",
    status: "active",
    passcode: "1111",
    targetScore: 1450,
    uiTheme: "teen_quest",
    parentIds: ["parent-admin"],
    createdAt: "2026-05-01T00:00:00.000Z",
    studyPlan: { weeklyTarget: 4, nextSessionAt: "" },
  }),
];

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

function normalizedRole(value: unknown): AccountRole {
  const role = text(value);
  return VALID_ROLES.has(role) ? (role as AccountRole) : "student";
}

function normalizedScope(value: unknown): AccountScope {
  const scope = text(value);
  return VALID_SCOPES.has(scope) ? (scope as AccountScope) : "family";
}

function normalizedStatus(value: unknown): AccountStatus {
  const status = text(value);
  return VALID_STATUSES.has(status) ? (status as AccountStatus) : "active";
}

function normalizedTheme(value: unknown): AccountTheme {
  const theme = text(value);
  return VALID_THEMES.has(theme) ? (theme as AccountTheme) : "studio";
}

function normalizeAvatarColor(value: unknown): AvatarColor {
  const color = text(value);
  return VALID_AVATAR_COLORS.has(color) ? (color as AvatarColor) : "teal";
}

function initialsFromName(value: unknown): string {
  const initials = text(value)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return initials.slice(0, 2) || "S";
}

export function normalizeAvatarInitials(value: unknown, name: unknown = ""): string {
  const clean = text(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 2);
  return clean || initialsFromName(name);
}

function normalizeStudyPlan(value: unknown): StudyPlan {
  const studyPlan = isRecord(value) ? value : {};
  return {
    weeklyTarget: numberValue(studyPlan.weeklyTarget, 4) || 4,
    nextSessionAt: typeof studyPlan.nextSessionAt === "string" ? studyPlan.nextSessionAt : "",
  };
}

export function normalizeAccountPermissions(account: Partial<SatAccount> & Record<string, unknown>): AccountPermissions {
  const source: Record<string, unknown> = isRecord(account.permissions) ? account.permissions : {};
  if (account.role === "admin") return { rewardManager: true, questionContributor: true };
  if (account.role === "parent") {
    return {
      rewardManager: source.rewardManager !== false,
      questionContributor: Boolean(source.questionContributor),
    };
  }
  return { rewardManager: false, questionContributor: false };
}

export function normalizeAccount(input: Record<string, unknown>): SatAccount {
  const role = normalizedRole(input.role);
  return {
    ...input,
    id: text(input.id),
    name: text(input.name) || text(input.id) || "Unnamed Account",
    email: text(input.email),
    gradeLevel: text(input.gradeLevel),
    avatarInitials: normalizeAvatarInitials(input.avatarInitials, input.name || input.id),
    avatarColor: normalizeAvatarColor(input.avatarColor),
    permissions: normalizeAccountPermissions({ ...input, role }),
    role,
    scope: normalizedScope(input.scope),
    status: normalizedStatus(input.status),
    passcode: text(input.passcode),
    targetScore: numberValue(input.targetScore, role === "admin" ? 1600 : 1450) || 1450,
    uiTheme: normalizedTheme(input.uiTheme),
    parentIds: Array.isArray(input.parentIds) ? input.parentIds.map(text).filter(Boolean) : [],
    createdAt: typeof input.createdAt === "string" ? input.createdAt : "",
    studyPlan: normalizeStudyPlan(input.studyPlan),
  };
}

export function mergeAccounts(existing: unknown[] = [], defaults: SatAccount[] = DEFAULT_ACCOUNTS): SatAccount[] {
  const byId = new Map<string, Record<string, unknown>>();
  defaults.forEach((account) => byId.set(account.id, account));
  existing.forEach((record) => {
    if (!isRecord(record)) return;
    const id = text(record.id);
    if (!id) return;
    byId.set(id, { ...(byId.get(id) || {}), ...record });
  });
  return [...byId.values()].map(normalizeAccount);
}

export function emptyProfile(): AccountProfile {
  return {
    attempts: [],
    learningEvents: [],
    learningEventRevision: "",
    learningEventUpdatedAt: "",
    officialLogs: [],
    vocabKnown: [],
    vocabQuizAttempts: [],
    pretests: [],
    attendance: {
      points: 0,
      spentPoints: 0,
      daily: {},
      stickers: [],
      questRewardsClaimed: [],
      rewardRedemptions: [],
      lastRewardAt: "",
    },
    streak: { count: 0, lastPracticeDate: "", freezeCredits: 0, lastFreezeUsedAt: "" },
    externalStudyLogs: [],
  };
}

export function ensureAccountProfile(profiles: Record<string, unknown>, accountId: string): AccountProfile {
  const source = isRecord(profiles[accountId]) ? profiles[accountId] : {};
  const fallback = emptyProfile();
  const attendance = isRecord(source.attendance) ? source.attendance : {};
  const streak = isRecord(source.streak) ? source.streak : {};
  const profile: AccountProfile = {
    ...source,
    attempts: Array.isArray(source.attempts) ? (source.attempts as Array<Record<string, unknown>>) : [],
    learningEvents: Array.isArray(source.learningEvents) ? (source.learningEvents as Array<Record<string, unknown>>) : [],
    learningEventRevision: text(source.learningEventRevision),
    learningEventUpdatedAt: text(source.learningEventUpdatedAt),
    officialLogs: Array.isArray(source.officialLogs) ? (source.officialLogs as Array<Record<string, unknown>>) : [],
    vocabKnown: Array.isArray(source.vocabKnown) ? source.vocabKnown.map(text).filter(Boolean) : [],
    vocabQuizAttempts: Array.isArray(source.vocabQuizAttempts) ? (source.vocabQuizAttempts as Array<Record<string, unknown>>) : [],
    pretests: Array.isArray(source.pretests) ? (source.pretests as Array<Record<string, unknown>>) : [],
    attendance: {
      ...fallback.attendance,
      ...attendance,
      points: numberValue(attendance.points),
      spentPoints: numberValue(attendance.spentPoints),
      daily: isRecord(attendance.daily) ? attendance.daily : {},
      stickers: Array.isArray(attendance.stickers) ? attendance.stickers : [],
      questRewardsClaimed: Array.isArray(attendance.questRewardsClaimed) ? attendance.questRewardsClaimed : [],
      rewardRedemptions: Array.isArray(attendance.rewardRedemptions) ? attendance.rewardRedemptions : [],
      lastRewardAt: typeof attendance.lastRewardAt === "string" ? attendance.lastRewardAt : "",
    },
    streak: {
      count: numberValue(streak.count),
      lastPracticeDate: typeof streak.lastPracticeDate === "string" ? streak.lastPracticeDate : "",
      freezeCredits: Math.max(0, numberValue(streak.freezeCredits)),
      lastFreezeUsedAt: typeof streak.lastFreezeUsedAt === "string" ? streak.lastFreezeUsedAt : "",
    },
    externalStudyLogs: Array.isArray(source.externalStudyLogs) ? (source.externalStudyLogs as Array<Record<string, unknown>>) : [],
  };
  profiles[accountId] = profile;
  return profile;
}

function storageChunkKey(key: string, index: number): string {
  return `${key}:chunk:${index}`;
}

function parseStorageChunkMeta(value: string | null): { chunks: number; length?: number } | null {
  if (!value) return null;
  try {
    const meta = JSON.parse(value) as Record<string, unknown>;
    return meta?.[CHUNK_MARKER] && Number.isInteger(meta.chunks) ? { chunks: Number(meta.chunks), length: numberValue(meta.length) } : null;
  } catch {
    return null;
  }
}

function byteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value).length;
  return value.length * 2;
}

export function readStoredStateJson(storage: Storage, key: string): string | null {
  const raw = storage.getItem(key);
  const meta = parseStorageChunkMeta(raw);
  if (!meta) return raw;
  const chunks: string[] = [];
  for (let index = 0; index < meta.chunks; index += 1) {
    const chunk = storage.getItem(storageChunkKey(key, index));
    if (chunk === null) return null;
    chunks.push(chunk);
  }
  return chunks.join("");
}

function removeStoredStateChunks(storage: Storage, key: string, meta: { chunks: number } | null = null): void {
  const existing = meta || parseStorageChunkMeta(storage.getItem(key));
  for (let index = 0; index < (existing?.chunks || 0); index += 1) {
    storage.removeItem(storageChunkKey(key, index));
  }
}

export function writeStoredStateJson(storage: Storage, key: string, json: string, chunkSize = DEFAULT_CHUNK_SIZE): AccountStorageSnapshot {
  const previous = parseStorageChunkMeta(storage.getItem(key));
  removeStoredStateChunks(storage, key, previous);
  if (json.length <= chunkSize) {
    storage.setItem(key, json);
    return storageSnapshot(storage, key);
  }
  const chunks = Math.ceil(json.length / chunkSize);
  for (let index = 0; index < chunks; index += 1) {
    storage.setItem(storageChunkKey(key, index), json.slice(index * chunkSize, (index + 1) * chunkSize));
  }
  storage.setItem(
    key,
    JSON.stringify({
      [CHUNK_MARKER]: true,
      version: 1,
      chunks,
      length: json.length,
      savedAt: new Date().toISOString(),
    }),
  );
  return storageSnapshot(storage, key);
}

export function storageSnapshot(storage: Storage, key = ACCOUNT_STATE_STORAGE_KEY): AccountStorageSnapshot {
  const raw = storage.getItem(key);
  const meta = parseStorageChunkMeta(raw);
  if (!raw) return { exists: false, chunked: false, chunks: 0, missingChunks: [], length: 0, approximateBytes: 0 };
  if (!meta) return { exists: true, chunked: false, chunks: 0, missingChunks: [], length: raw.length, approximateBytes: byteLength(raw) };
  const missingChunks: number[] = [];
  let length = 0;
  let approximateBytes = byteLength(raw);
  for (let index = 0; index < meta.chunks; index += 1) {
    const chunk = storage.getItem(storageChunkKey(key, index));
    if (chunk === null) {
      missingChunks.push(index);
    } else {
      length += chunk.length;
      approximateBytes += byteLength(chunk);
    }
  }
  return {
    exists: true,
    chunked: true,
    chunks: meta.chunks,
    missingChunks,
    length: meta.length || length,
    approximateBytes,
  };
}

export function loadAccountState(storage: Storage | null = globalThis.localStorage ?? null): AccountState {
  const rawJson = storage ? readStoredStateJson(storage, ACCOUNT_STATE_STORAGE_KEY) || readStoredStateJson(storage, LEGACY_ACCOUNT_STATE_STORAGE_KEY) : null;
  let raw: Record<string, unknown> = {};
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as unknown;
      raw = isRecord(parsed) ? parsed : {};
    } catch {
      raw = {};
    }
  }
  const accounts = mergeAccounts(Array.isArray(raw.accounts) ? raw.accounts : []);
  const profileSource = isRecord(raw.profiles) ? { ...raw.profiles } : {};
  const profiles: Record<string, AccountProfile> = {};
  accounts.forEach((account) => {
    profiles[account.id] = ensureAccountProfile(profileSource, account.id);
  });
  const activeAccountId = accounts.some((account) => account.id === raw.activeAccountId && account.status === "active") ? text(raw.activeAccountId) : null;
  return {
    version: 2,
    language: raw.language === "vi" ? "vi" : "en",
    accounts,
    profiles,
    activeAccountId,
    raw,
    storage: storage ? storageSnapshot(storage, ACCOUNT_STATE_STORAGE_KEY) : { exists: false, chunked: false, chunks: 0, missingChunks: [], length: 0, approximateBytes: 0 },
  };
}

export function saveAccountState(state: AccountState, storage: Storage | null = globalThis.localStorage ?? null): AccountState {
  if (!storage) return state;
  const persisted = {
    ...state.raw,
    version: 2,
    language: state.language,
    accounts: state.accounts,
    profiles: state.profiles,
    activeAccountId: state.activeAccountId,
  };
  const snapshot = writeStoredStateJson(storage, ACCOUNT_STATE_STORAGE_KEY, JSON.stringify(persisted));
  return { ...state, raw: persisted, storage: snapshot };
}

export function currentAccount(accounts: SatAccount[], activeAccountId: string | null): SatAccount | null {
  return accounts.find((account) => account.id === activeAccountId) || null;
}

export function defaultManager(accounts: SatAccount[]): SatAccount {
  return accounts.find((account) => account.role === "admin" && account.status === "active") || accounts.find((account) => account.role === "parent" && account.status === "active") || accounts[0];
}

export function isAccountManager(account: SatAccount | null | undefined): boolean {
  return account?.role === "admin" || account?.role === "parent";
}

export function canCreateAnyAccount(account: SatAccount | null | undefined): boolean {
  return account?.role === "admin";
}

export function linkedStudentAccountsFor(accounts: SatAccount[], account: SatAccount | null | undefined): SatAccount[] {
  if (!account) return [];
  const students = accounts.filter((item) => item.role === "student");
  if (account.role === "admin") return students;
  if (account.role === "parent") return students.filter((student) => student.parentIds.includes(account.id));
  return students.filter((student) => student.id === account.id);
}

export function visibleAccountsFor(accounts: SatAccount[], account: SatAccount | null | undefined): SatAccount[] {
  if (!account) return [];
  if (account.role === "admin") return accounts;
  if (account.role === "parent") {
    const byId = new Map<string, SatAccount>();
    byId.set(account.id, account);
    linkedStudentAccountsFor(accounts, account).forEach((student) => byId.set(student.id, student));
    return [...byId.values()];
  }
  return [account];
}

export function activeAdminCount(accounts: SatAccount[], excludeId = ""): number {
  return accounts.filter((account) => account.role === "admin" && account.status === "active" && account.id !== excludeId).length;
}

export function canEditAccount(accounts: SatAccount[], manager: SatAccount | null | undefined, target: SatAccount | null | undefined): boolean {
  if (!isAccountManager(manager) || !target) return false;
  if (canCreateAnyAccount(manager)) return true;
  return manager?.role === "parent" && target.role === "student" && target.parentIds.includes(manager.id);
}

export function canDeleteAccount(accounts: SatAccount[], manager: SatAccount | null | undefined, target: SatAccount | null | undefined): boolean {
  if (!target || !canCreateAnyAccount(manager)) return false;
  if (manager?.id === target.id) return false;
  if (target.role === "admin" && activeAdminCount(accounts, target.id) < 1) return false;
  return true;
}

export function canChangeAccountStatus(accounts: SatAccount[], manager: SatAccount | null | undefined, target: SatAccount | null | undefined, nextStatus: AccountStatus): boolean {
  if (!target || !canCreateAnyAccount(manager)) return false;
  if (manager?.id === target.id && nextStatus !== "active") return false;
  if (target.role === "admin" && nextStatus !== "active" && activeAdminCount(accounts, target.id) < 1) return false;
  return true;
}

function passcodeInUse(accounts: SatAccount[], passcode: string, excludeId = ""): boolean {
  return Boolean(passcode) && accounts.some((account) => account.id !== excludeId && account.passcode === passcode);
}

function toIsoOrEmpty(value: unknown): string {
  const source = text(value);
  if (!source) return "";
  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cloneState(state: AccountState): AccountState {
  return {
    ...state,
    accounts: state.accounts.map((account) => ({ ...account, parentIds: [...account.parentIds], permissions: { ...account.permissions }, studyPlan: { ...account.studyPlan } })),
    profiles: Object.fromEntries(Object.entries(state.profiles).map(([id, profile]) => [id, { ...profile }])),
    raw: { ...state.raw },
  };
}

function accountById(state: AccountState, accountId: string): SatAccount | null {
  return state.accounts.find((account) => account.id === accountId) || null;
}

function managerFor(state: AccountState, managerId?: string): SatAccount {
  return accountById(state, managerId || state.activeAccountId || "") || defaultManager(state.accounts);
}

export function buildAccountDraft(input: AccountDraftInput, manager: SatAccount, nowMs = Date.now()): { ok: true; account: SatAccount } | { ok: false; reason: string } {
  if (!isAccountManager(manager)) return { ok: false, reason: "Only parent or admin accounts can create accounts." };
  const admin = canCreateAnyAccount(manager);
  const name = text(input.name);
  const passcode = text(input.passcode);
  if (!name || !passcode) return { ok: false, reason: "Name and passcode are required." };
  const requestedScope = admin ? normalizedScope(input.scope) : "family";
  const requestedRole = admin ? normalizedRole(input.role) : "student";
  const scope = requestedScope;
  const role = scope === "public" && requestedRole !== "student" ? "student" : requestedRole;
  const parentId = text(input.parentId);
  const parentIds = role === "student" && scope === "family" ? [parentId || (manager.role === "parent" ? manager.id : "")].filter(Boolean) : [];
  const account = normalizeAccount({
    id: text(input.id) || `account-${slugify(name)}-${nowMs}`,
    name,
    email: input.email,
    gradeLevel: input.gradeLevel,
    avatarInitials: input.avatarInitials,
    avatarColor: input.avatarColor,
    role,
    scope,
    status: "active",
    passcode,
    targetScore: input.targetScore,
    uiTheme: input.uiTheme,
    permissions: {
      rewardManager: Boolean(input.permissionRewards),
      questionContributor: Boolean(input.permissionAuthoring),
    },
    parentIds,
    createdAt: new Date(nowMs).toISOString(),
    studyPlan: {
      weeklyTarget: numberValue(input.weeklyTarget, 4) || 4,
      nextSessionAt: text(input.nextSessionAt) || toIsoOrEmpty(input.nextSessionLocal),
    },
  });
  return { ok: true, account };
}

export function createAccount(state: AccountState, input: AccountDraftInput, managerId?: string): AccountOperationResult {
  const next = cloneState(state);
  const manager = managerFor(next, managerId);
  const draft = buildAccountDraft(input, manager);
  if (!draft.ok) return { ok: false, reason: draft.reason, state };
  if (accountById(next, draft.account.id)) return { ok: false, reason: "An account with this ID already exists.", state };
  if (passcodeInUse(next.accounts, draft.account.passcode)) return { ok: false, reason: "That passcode is already used by another local account.", state };
  next.accounts.push(draft.account);
  next.profiles[draft.account.id] = emptyProfile();
  return { ok: true, reason: "Account created.", account: draft.account, state: next };
}

export function updateAccount(state: AccountState, accountId: string, input: AccountDraftInput, managerId?: string): AccountOperationResult {
  const next = cloneState(state);
  const manager = managerFor(next, managerId);
  const target = accountById(next, accountId);
  if (!target || !canEditAccount(next.accounts, manager, target)) return { ok: false, reason: "You cannot edit this account.", state };
  const name = text(input.name);
  const passcode = text(input.passcode);
  if (!name || !passcode) return { ok: false, reason: "Name and passcode are required.", state };
  if (passcodeInUse(next.accounts, passcode, target.id)) return { ok: false, reason: "That passcode is already used by another local account.", state };
  const admin = canCreateAnyAccount(manager);
  const nextRole = admin ? normalizedRole(input.role || target.role) : target.role;
  const nextScope = admin ? normalizedScope(input.scope || target.scope) : target.scope;
  if (manager.id === target.id && nextRole !== "admin") return { ok: false, reason: "You cannot remove admin access from the active admin account.", state };
  if (target.role === "admin" && nextRole !== "admin" && activeAdminCount(next.accounts, target.id) < 1) {
    return { ok: false, reason: "At least one active admin account is required.", state };
  }
  const updated = normalizeAccount({
    ...target,
    name,
    email: input.email,
    gradeLevel: input.gradeLevel,
    avatarInitials: input.avatarInitials,
    avatarColor: input.avatarColor,
    passcode,
    role: nextScope === "public" && nextRole !== "student" ? "student" : nextRole,
    scope: nextScope,
    targetScore: input.targetScore,
    uiTheme: input.uiTheme,
    permissions: {
      rewardManager: Boolean(input.permissionRewards),
      questionContributor: Boolean(input.permissionAuthoring),
    },
    parentIds: (nextScope === "family" && nextRole === "student" ? [text(input.parentId)].filter(Boolean) : []) as string[],
    studyPlan: {
      weeklyTarget: numberValue(input.weeklyTarget, target.studyPlan.weeklyTarget) || 4,
      nextSessionAt: text(input.nextSessionAt) || toIsoOrEmpty(input.nextSessionLocal),
    },
  });
  next.accounts = next.accounts.map((account) => (account.id === target.id ? updated : account));
  next.profiles[updated.id] = ensureAccountProfile(next.profiles, updated.id);
  return { ok: true, reason: "Account updated.", account: updated, state: next };
}

export function changeAccountStatus(state: AccountState, accountId: string, status: AccountStatus, managerId?: string): AccountOperationResult {
  const next = cloneState(state);
  const manager = managerFor(next, managerId);
  const target = accountById(next, accountId);
  const nextStatus = normalizedStatus(status);
  if (!target || !canChangeAccountStatus(next.accounts, manager, target, nextStatus)) return { ok: false, reason: "You cannot change this account status.", state };
  const updated = { ...target, status: nextStatus };
  next.accounts = next.accounts.map((account) => (account.id === target.id ? updated : account));
  if (next.activeAccountId === target.id && nextStatus !== "active") next.activeAccountId = null;
  return { ok: true, reason: "Account status updated.", account: updated, state: next };
}

export function deleteAccount(state: AccountState, accountId: string, managerId?: string): AccountOperationResult {
  const next = cloneState(state);
  const manager = managerFor(next, managerId);
  const target = accountById(next, accountId);
  if (!target || !canDeleteAccount(next.accounts, manager, target)) return { ok: false, reason: "You cannot delete this account.", state };
  next.accounts = next.accounts.filter((account) => account.id !== target.id);
  delete next.profiles[target.id];
  next.accounts = next.accounts.map((account) => ({ ...account, parentIds: account.parentIds.filter((id) => id !== target.id) }));
  if (next.activeAccountId === target.id) next.activeAccountId = null;
  return { ok: true, reason: "Account deleted.", account: target, state: next };
}

export function accountProgressSummary(account: SatAccount, profile: AccountProfile): Omit<AccountSummaryRow, "account" | "parentNames" | "canEdit" | "canDelete" | "canSuspendOrActivate"> {
  const attempts = Array.isArray(profile.attempts) ? profile.attempts : [];
  const correct = attempts.filter((attempt) => Boolean(attempt.correct)).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const latest = Array.isArray(profile.pretests) ? profile.pretests[0] : null;
  const externalMinutes = profile.externalStudyLogs.reduce((sum, log) => sum + numberValue(log.minutes), 0);
  return {
    attempts: attempts.length,
    accuracy,
    latestBaseline: latest && isRecord(latest) && latest.scoreEstimate ? `Baseline ${text(latest.scoreEstimate)}` : "No diagnostic",
    points: numberValue(profile.attendance?.points),
    streak: numberValue(profile.streak?.count),
    weeklyTarget: account.studyPlan.weeklyTarget,
    schedule: account.studyPlan.nextSessionAt || "No session scheduled",
    externalMinutes,
  } as Omit<AccountSummaryRow, "account" | "parentNames" | "canEdit" | "canDelete" | "canSuspendOrActivate"> & { externalMinutes: number };
}

export function buildAccountOperationsModel(state: AccountState, managerId?: string): AccountOperationsModel {
  const manager = managerFor(state, managerId);
  const visible = visibleAccountsFor(state.accounts, manager);
  const parentNames = new Map(state.accounts.map((account) => [account.id, account.name]));
  return {
    manager,
    accounts: visible.map((account) => ({
      account,
      ...accountProgressSummary(account, state.profiles[account.id] || emptyProfile()),
      parentNames: account.parentIds.map((id) => parentNames.get(id)).filter((value): value is string => Boolean(value)),
      canEdit: canEditAccount(state.accounts, manager, account),
      canDelete: canDeleteAccount(state.accounts, manager, account),
      canSuspendOrActivate: canChangeAccountStatus(state.accounts, manager, account, account.status === "active" ? "suspended" : "active"),
    })),
    total: visible.length,
    active: visible.filter((account) => account.status === "active").length,
    students: visible.filter((account) => account.role === "student").length,
    parents: visible.filter((account) => account.role === "parent").length,
    admins: visible.filter((account) => account.role === "admin").length,
    locked: visible.filter((account) => account.status !== "active").length,
    storage: state.storage,
    canCreate: isAccountManager(manager),
    parentOptions: state.accounts.filter((account) => account.role === "parent" && account.scope === "family"),
  };
}
