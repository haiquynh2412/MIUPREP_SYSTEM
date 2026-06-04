import type { AccountProfile, AccountState, SatAccount } from "./account-ops";
import { defaultManager, emptyProfile, linkedStudentAccountsFor, loadAccountState, saveAccountState } from "./account-ops";

const VALID_REWARD_TYPES = new Set(["privilege", "experience", "gift", "study_bonus"]);
const VALID_REWARD_SCOPES = new Set(["family", "global"]);
const VALID_PROGRAM_STATUSES = new Set(["active", "paused"]);
const VALID_CLAIM_STATUSES = new Set(["pending", "fulfilled", "cancelled"]);

export type RewardType = "privilege" | "experience" | "gift" | "study_bonus";
export type RewardScope = "family" | "global";
export type RewardProgramStatus = "active" | "paused";
export type RewardClaimStatus = "pending" | "fulfilled" | "cancelled";

export interface RewardBadge {
  id: string;
  name: string;
  icon: string;
  requirement?: number;
  criteria?: Record<string, number>;
  revealWhen?: Record<string, number>;
  secret?: boolean;
  description: string;
}

export interface RewardProgram {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  rewardType: RewardType;
  scope: RewardScope;
  status: RewardProgramStatus;
  ownerAccountId: string;
  targetStudentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RewardClaim {
  id: string;
  programId: string;
  studentId: string;
  requestedBy: string;
  fulfilledBy: string;
  costPoints: number;
  status: RewardClaimStatus;
  requestedAt: string;
  fulfilledAt: string;
  note: string;
}

export interface RewardProgramInput {
  id?: string;
  title?: unknown;
  description?: unknown;
  costPoints?: unknown;
  cost?: unknown;
  rewardType?: unknown;
  scope?: unknown;
  status?: unknown;
  ownerAccountId?: unknown;
  targetStudentIds?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RewardClaimInput {
  id?: string;
  programId?: unknown;
  studentId?: unknown;
  requestedBy?: unknown;
  fulfilledBy?: unknown;
  costPoints?: unknown;
  status?: unknown;
  requestedAt?: unknown;
  fulfilledAt?: unknown;
  note?: unknown;
}

export interface RewardState {
  accountState: AccountState;
  accounts: SatAccount[];
  profiles: Record<string, AccountProfile>;
  programs: RewardProgram[];
  claims: RewardClaim[];
}

export interface RewardOperationResult {
  ok: boolean;
  reason: string;
  state: RewardState;
  program?: RewardProgram;
  claim?: RewardClaim;
}

export interface RewardProgramRow {
  program: RewardProgram;
  targetLabel: string;
  ownerLabel: string;
  claimCount: number;
  pendingClaims: number;
  canToggle: boolean;
  canDelete: boolean;
}

export interface RewardClaimRow {
  claim: RewardClaim;
  programTitle: string;
  studentName: string;
  canResolve: boolean;
}

export interface RewardOperationsModel {
  manager: SatAccount | null;
  programs: RewardProgramRow[];
  claims: RewardClaimRow[];
  students: SatAccount[];
  totalPrograms: number;
  activePrograms: number;
  pendingClaims: number;
  canManage: boolean;
}

export interface StudentRewardStoreModel {
  student: SatAccount | null;
  availablePoints: number;
  programs: Array<RewardProgram & { affordable: boolean; pending: boolean }>;
  claims: RewardClaimRow[];
  fulfilledClaims: RewardClaimRow[];
}

export type RewardBehaviorAuditStatus = "pass" | "watch" | "blocked";

export type RewardBehaviorAuditFindingSource = "reward_badge" | "achievement_badge" | "reward_program" | "claim_flow";

export type RewardBehaviorAuditFindingReason =
  | "attendance_points_only"
  | "raw_correctness_reward"
  | "missing_learning_positive_signal"
  | "missing_parent_approval"
  | "claim_flow_parent_approved";

export interface RewardBehaviorAuditFinding {
  id: string;
  source: RewardBehaviorAuditFindingSource;
  severity: RewardBehaviorAuditStatus;
  reason: RewardBehaviorAuditFindingReason;
  detail: string;
}

export interface RewardBehaviorAuditReport {
  schemaVersion: "reward_behavior_audit_v1";
  generatedAt: string;
  status: RewardBehaviorAuditStatus;
  rewardBadges: number;
  achievementBadges: number;
  rewardPrograms: number;
  pendingClaims: number;
  findings: RewardBehaviorAuditFinding[];
  detail: string;
}

export const REWARD_CATALOG: RewardBadge[] = [
  { id: "starter-spark", name: "Starter Spark", icon: "*", requirement: 20, description: "Earn 20 attendance points." },
  { id: "focus-flame", name: "Focus Flame", icon: "F", requirement: 60, description: "Earn 60 attendance points." },
  { id: "streak-shield", name: "Streak Shield", icon: "S", requirement: 120, description: "Earn 120 attendance points." },
  { id: "review-ranger", name: "Review Ranger", icon: "R", requirement: 220, description: "Earn 220 attendance points." },
  { id: "sat-ace", name: "SAT Ace", icon: "A", requirement: 360, description: "Earn 360 attendance points." },
];

export const ACHIEVEMENT_CATALOG: RewardBadge[] = [
  { id: "diagnostic-starter", name: "Diagnostic Starter", icon: "D", criteria: { pretests: 1 }, description: "Complete one diagnostic." },
  { id: "sprint-starter", name: "Sprint Starter", icon: "5", criteria: { sprintsCompleted: 1 }, description: "Finish a 5-Minute Sprint." },
  { id: "bluebook-logger", name: "Bluebook Logger", icon: "B", criteria: { externalMinutes: 30 }, description: "Log 30 outside study minutes." },
  { id: "review-streaker", name: "Review Streak", icon: "R", criteria: { streak: 3, reviews: 6 }, description: "Keep a 3-day study streak while repairing missed questions." },
  { id: "proof-closer", name: "Proof Closer", icon: "P", criteria: { proofsPassed: 1 }, revealWhen: { proofsPassed: 1 }, secret: true, description: "Pass a remediation proof." },
  { id: "hard-winner", name: "Hard Winner", icon: "H", criteria: { hardCorrect: 2 }, revealWhen: { hardCorrect: 1 }, secret: true, description: "Get hard questions correct." },
];

export const DEFAULT_REWARD_PROGRAMS: RewardProgram[] = [
  {
    id: "reward-sprint-choice",
    title: "Choose the next sprint topic",
    description: "Redeem to choose the next 5-minute sprint focus with a parent or tutor.",
    costPoints: 40,
    rewardType: "study_bonus",
    scope: "global",
    status: "active",
    ownerAccountId: "content-admin",
    targetStudentIds: [],
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "",
  },
  {
    id: "reward-family-movie",
    title: "Family movie night",
    description: "Parent-approved reward after consistent SAT practice.",
    costPoints: 90,
    rewardType: "experience",
    scope: "family",
    status: "active",
    ownerAccountId: "parent-admin",
    targetStudentIds: ["student-demo"],
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "",
  },
];

const LEARNING_POSITIVE_CRITERIA_KEYS = new Set([
  "pretests",
  "sprintsCompleted",
  "externalMinutes",
  "streak",
  "reviews",
  "proofsPassed",
  "repairCompletions",
  "dueReviews",
  "diagnostics",
  "missedQuestionReviews",
  "studyMinutes",
]);

const CORRECTNESS_ONLY_CRITERIA_KEYS = new Set([
  "correct",
  "hardCorrect",
  "mediumCorrect",
  "easyCorrect",
  "accuracy",
  "score",
  "scoreGain",
  "scaledScore",
]);

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

function isRewardProgram(value: RewardProgram | null): value is RewardProgram {
  return value !== null;
}

function isRewardClaim(value: RewardClaim | null): value is RewardClaim {
  return value !== null;
}

function nowIso(nowMs = Date.now()): string {
  return new Date(nowMs).toISOString();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cloneProfile(profile: AccountProfile): AccountProfile {
  return {
    ...profile,
    attempts: [...profile.attempts],
    pretests: [...profile.pretests],
    attendance: {
      ...profile.attendance,
      daily: { ...profile.attendance.daily },
      stickers: [...profile.attendance.stickers],
      questRewardsClaimed: [...profile.attendance.questRewardsClaimed],
      rewardRedemptions: [...profile.attendance.rewardRedemptions],
    },
    streak: { ...profile.streak },
    externalStudyLogs: [...profile.externalStudyLogs],
  };
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
    profiles: Object.fromEntries(Object.entries(state.profiles).map(([id, profile]) => [id, cloneProfile(profile)])),
    raw: { ...state.raw },
    storage: { ...state.storage },
  };
}

function cloneRewardState(state: RewardState): RewardState {
  return {
    accountState: cloneAccountState(state.accountState),
    accounts: state.accounts.map((account) => ({
      ...account,
      parentIds: [...account.parentIds],
      permissions: { ...account.permissions },
      studyPlan: { ...account.studyPlan },
    })),
    profiles: Object.fromEntries(Object.entries(state.profiles).map(([id, profile]) => [id, cloneProfile(profile)])),
    programs: state.programs.map((program) => ({ ...program, targetStudentIds: [...program.targetStudentIds] })),
    claims: state.claims.map((claim) => ({ ...claim })),
  };
}

function accountById(accounts: SatAccount[], accountId: string): SatAccount | null {
  return accounts.find((account) => account.id === accountId) || null;
}

function managerFor(state: RewardState, managerId?: string): SatAccount | null {
  if (!state.accounts.length) return null;
  return accountById(state.accounts, managerId || state.accountState.activeAccountId || "") || defaultManager(state.accounts);
}

function profileFor(state: RewardState, accountId: string): AccountProfile {
  if (!state.profiles[accountId]) state.profiles[accountId] = emptyProfile();
  return state.profiles[accountId];
}

function sortedByTitle<T extends { title?: string; program?: RewardProgram }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const statusA = "program" in a && a.program ? a.program.status : "";
    const statusB = "program" in b && b.program ? b.program.status : "";
    if (statusA !== statusB) return statusA === "active" ? -1 : 1;
    const titleA = a.title || a.program?.title || "";
    const titleB = b.title || b.program?.title || "";
    return titleA.localeCompare(titleB);
  });
}

export function buildRewardBehaviorAuditReport(input: {
  rewardCatalog?: RewardBadge[];
  achievementCatalog?: RewardBadge[];
  programs?: RewardProgram[];
  claims?: RewardClaim[];
  generatedAt?: string;
} = {}): RewardBehaviorAuditReport {
  const rewardCatalog = input.rewardCatalog || REWARD_CATALOG;
  const achievementCatalog = input.achievementCatalog || ACHIEVEMENT_CATALOG;
  const programs = input.programs || DEFAULT_REWARD_PROGRAMS;
  const claims = input.claims || [];
  const findings: RewardBehaviorAuditFinding[] = [];

  rewardCatalog.forEach((badge) => {
    if (badge.requirement && !badge.criteria) {
      findings.push({
        id: badge.id,
        source: "reward_badge",
        severity: "watch",
        reason: "attendance_points_only",
        detail: `${badge.name} is driven by attendance points; keep point earning tied to reviews, repair, diagnostics, or study logs.`,
      });
    }
    findings.push(...auditBadgeCriteria(badge, "reward_badge"));
  });

  achievementCatalog.forEach((badge) => {
    findings.push(...auditBadgeCriteria(badge, "achievement_badge"));
  });

  programs.forEach((program) => {
    if (!program.ownerAccountId) {
      findings.push({
        id: program.id,
        source: "reward_program",
        severity: "blocked",
        reason: "missing_parent_approval",
        detail: `${program.title} has no ownerAccountId, so fulfillment ownership is unclear.`,
      });
    }
  });

  claims.forEach((claim) => {
    if ((claim.status === "fulfilled" || claim.status === "cancelled") && !claim.fulfilledBy) {
      findings.push({
        id: claim.id,
        source: "claim_flow",
        severity: "blocked",
        reason: "missing_parent_approval",
        detail: `Resolved claim ${claim.id} is missing fulfilledBy; parent/admin approval evidence is required.`,
      });
    }
  });

  findings.push({
    id: "reward-claim-flow",
    source: "claim_flow",
    severity: "pass",
    reason: "claim_flow_parent_approved",
    detail: "Student redemption creates a pending claim; fulfillment/cancellation is resolved through parent/admin manager visibility.",
  });

  const status = findings.some((finding) => finding.severity === "blocked")
    ? "blocked"
    : findings.some((finding) => finding.severity === "watch")
      ? "watch"
      : "pass";

  return {
    schemaVersion: "reward_behavior_audit_v1",
    generatedAt: input.generatedAt || new Date().toISOString(),
    status,
    rewardBadges: rewardCatalog.length,
    achievementBadges: achievementCatalog.length,
    rewardPrograms: programs.length,
    pendingClaims: claims.filter((claim) => claim.status === "pending").length,
    findings,
    detail: status === "blocked"
      ? "Reward behavior audit found approval evidence gaps that should block launch changes."
      : status === "watch"
        ? "Reward behavior audit allows current rewards but flags attendance-only or raw-correctness incentives for redesign before expansion."
        : "Reward behavior audit found only learning-positive incentives and parent/admin-gated claims.",
  };
}

function auditBadgeCriteria(badge: RewardBadge, source: RewardBehaviorAuditFindingSource): RewardBehaviorAuditFinding[] {
  const criteria = badge.criteria || {};
  const keys = Object.keys(criteria);
  if (!keys.length) return [];
  const hasLearningPositiveSignal = keys.some((key) => LEARNING_POSITIVE_CRITERIA_KEYS.has(key));
  const hasCorrectnessOnlySignal = keys.some((key) => CORRECTNESS_ONLY_CRITERIA_KEYS.has(key));
  if (hasCorrectnessOnlySignal && !hasLearningPositiveSignal) {
    return [{
      id: badge.id,
      source,
      severity: "watch",
      reason: "raw_correctness_reward",
      detail: `${badge.name} rewards correctness without a repair, review, streak, diagnostic, or proof signal.`,
    }];
  }
  if (!hasLearningPositiveSignal) {
    return [{
      id: badge.id,
      source,
      severity: "watch",
      reason: "missing_learning_positive_signal",
      detail: `${badge.name} uses criteria that are not recognized as learning-positive audit signals: ${keys.join(", ")}.`,
    }];
  }
  return [];
}

export function normalizeRewardProgram(program: unknown, nowMs = Date.now()): RewardProgram | null {
  if (!isRecord(program)) return null;
  const title = text(program.title);
  if (!title) return null;
  const rewardType = text(program.rewardType);
  const scope = text(program.scope);
  const status = text(program.status);
  return {
    id: text(program.id) || `reward-${slugify(title) || "program"}-${nowMs}`,
    title,
    description: text(program.description),
    costPoints: Math.max(1, numberValue(program.costPoints ?? program.cost, 1)),
    rewardType: VALID_REWARD_TYPES.has(rewardType) ? (rewardType as RewardType) : "privilege",
    scope: VALID_REWARD_SCOPES.has(scope) ? (scope as RewardScope) : "family",
    status: VALID_PROGRAM_STATUSES.has(status) ? (status as RewardProgramStatus) : "active",
    ownerAccountId: text(program.ownerAccountId) || "content-admin",
    targetStudentIds: Array.isArray(program.targetStudentIds) ? program.targetStudentIds.map(text).filter(Boolean) : [],
    createdAt: typeof program.createdAt === "string" && program.createdAt ? program.createdAt : nowIso(nowMs),
    updatedAt: typeof program.updatedAt === "string" ? program.updatedAt : "",
  };
}

export function mergeRewardPrograms(existing: unknown[] = [], seeds: unknown[] = DEFAULT_REWARD_PROGRAMS): RewardProgram[] {
  const byId = new Map<string, RewardProgram>();
  seeds.map((program) => normalizeRewardProgram(program)).filter(isRewardProgram).forEach((program) => {
    byId.set(program.id, program);
  });
  existing.map((program) => normalizeRewardProgram(program)).filter(isRewardProgram).forEach((program) => {
    byId.set(program.id, { ...(byId.get(program.id) || {}), ...program });
  });
  return [...byId.values()];
}

export function normalizeRewardClaim(claim: unknown, nowMs = Date.now()): RewardClaim | null {
  if (!isRecord(claim)) return null;
  const programId = text(claim.programId);
  const studentId = text(claim.studentId);
  if (!programId || !studentId) return null;
  const status = text(claim.status);
  return {
    id: text(claim.id) || `reward-claim-${programId}-${studentId}-${nowMs}`,
    programId,
    studentId,
    requestedBy: text(claim.requestedBy) || studentId,
    fulfilledBy: text(claim.fulfilledBy),
    costPoints: Math.max(0, numberValue(claim.costPoints, 0)),
    status: VALID_CLAIM_STATUSES.has(status) ? (status as RewardClaimStatus) : "pending",
    requestedAt: typeof claim.requestedAt === "string" && claim.requestedAt ? claim.requestedAt : nowIso(nowMs),
    fulfilledAt: typeof claim.fulfilledAt === "string" ? claim.fulfilledAt : "",
    note: text(claim.note),
  };
}

export function buildRewardState(accountState: AccountState): RewardState {
  const rawPrograms = Array.isArray(accountState.raw.rewardPrograms) ? accountState.raw.rewardPrograms : [];
  const rawClaims = Array.isArray(accountState.raw.rewardClaims) ? accountState.raw.rewardClaims : [];
  return {
    accountState: cloneAccountState(accountState),
    accounts: accountState.accounts.map((account) => ({
      ...account,
      parentIds: [...account.parentIds],
      permissions: { ...account.permissions },
      studyPlan: { ...account.studyPlan },
    })),
    profiles: Object.fromEntries(Object.entries(accountState.profiles).map(([id, profile]) => [id, cloneProfile(profile)])),
    programs: mergeRewardPrograms(rawPrograms),
    claims: rawClaims.map((claim) => normalizeRewardClaim(claim)).filter(isRewardClaim),
  };
}

export function loadRewardState(storage: Storage | null = globalThis.localStorage ?? null): RewardState {
  return buildRewardState(loadAccountState(storage));
}

export function saveRewardState(state: RewardState, storage: Storage | null = globalThis.localStorage ?? null): RewardState {
  const accountState: AccountState = {
    ...state.accountState,
    accounts: state.accounts,
    profiles: state.profiles,
    raw: {
      ...state.accountState.raw,
      rewardPrograms: state.programs,
      rewardClaims: state.claims,
    },
  };
  return buildRewardState(saveAccountState(accountState, storage));
}

export function canManageRewards(account: SatAccount | null | undefined): boolean {
  return account?.role === "admin" || (account?.role === "parent" && account.permissions?.rewardManager !== false);
}

export function rewardManagerStudents(state: RewardState, manager: SatAccount | null | undefined): SatAccount[] {
  return linkedStudentAccountsFor(state.accounts, manager).filter((student) => student.role === "student");
}

export function visibleRewardProgramsForManager(state: RewardState, manager: SatAccount | null | undefined): RewardProgram[] {
  if (!manager || !canManageRewards(manager)) return [];
  const studentIds = new Set(rewardManagerStudents(state, manager).map((student) => student.id));
  return sortedByTitle(
    state.programs.filter((program) => {
      if (manager.role === "admin") return true;
      if (program.ownerAccountId === manager.id) return true;
      return program.targetStudentIds.some((id) => studentIds.has(id));
    }),
  );
}

export function visibleRewardClaimsForManager(state: RewardState, manager: SatAccount | null | undefined): RewardClaim[] {
  if (!manager || !canManageRewards(manager)) return [];
  const studentIds = new Set(rewardManagerStudents(state, manager).map((student) => student.id));
  return state.claims
    .filter((claim) => studentIds.has(claim.studentId))
    .sort((a, b) => Date.parse(b.requestedAt || "") - Date.parse(a.requestedAt || ""));
}

export function rewardAvailablePoints(profile: AccountProfile | null | undefined): number {
  const attendance = profile?.attendance || emptyProfile().attendance;
  return Math.max(0, Number(attendance.points || 0) - Number(attendance.spentPoints || 0));
}

export function rewardProgramsForStudent(state: RewardState, student: SatAccount | null | undefined): RewardProgram[] {
  if (!student || student.role !== "student") return [];
  return state.programs
    .filter((program) => {
      if (program.status !== "active") return false;
      if (program.scope === "global") return true;
      if (program.targetStudentIds.length) return program.targetStudentIds.includes(student.id);
      return student.parentIds.includes(program.ownerAccountId);
    })
    .sort((a, b) => a.costPoints - b.costPoints || a.title.localeCompare(b.title));
}

export function rewardClaimsForStudent(state: RewardState, studentId: string): RewardClaim[] {
  return state.claims.filter((claim) => claim.studentId === studentId);
}

export function createRewardProgram(state: RewardState, input: RewardProgramInput, managerId?: string, nowMs = Date.now()): RewardOperationResult {
  const manager = managerFor(state, managerId);
  if (!canManageRewards(manager)) return { ok: false, reason: "This account cannot manage rewards.", state };
  const title = text(input.title);
  if (!title) return { ok: false, reason: "Reward title is required.", state };
  const studentIds = rewardManagerStudents(state, manager);
  const selectedTargets = Array.isArray(input.targetStudentIds) ? input.targetStudentIds.map(text).filter(Boolean) : [];
  const allowedTargetIds = new Set(studentIds.map((student) => student.id));
  if (manager?.role !== "admin" && selectedTargets.some((id) => !allowedTargetIds.has(id))) {
    return { ok: false, reason: "Target student is outside this reward manager.", state };
  }
  const program = normalizeRewardProgram(
    {
      ...input,
      title,
      scope: manager?.role === "admin" && input.scope === "global" ? "global" : "family",
      ownerAccountId: manager?.id || "content-admin",
      targetStudentIds: selectedTargets,
      createdAt: nowIso(nowMs),
    },
    nowMs,
  );
  if (!program) return { ok: false, reason: "Reward program could not be normalized.", state };
  const next = cloneRewardState(state);
  next.programs = [program, ...next.programs.filter((item) => item.id !== program.id)];
  return { ok: true, reason: "Reward program saved.", state: next, program };
}

export function setRewardProgramStatus(state: RewardState, programId: string, status: RewardProgramStatus, managerId?: string, nowMs = Date.now()): RewardOperationResult {
  const manager = managerFor(state, managerId);
  const visibleIds = new Set(visibleRewardProgramsForManager(state, manager).map((program) => program.id));
  if (!visibleIds.has(programId)) return { ok: false, reason: "Reward program is not visible to this manager.", state };
  const next = cloneRewardState(state);
  let updated: RewardProgram | undefined;
  next.programs = next.programs.map((program) => {
    if (program.id !== programId) return program;
    updated = { ...program, status, updatedAt: nowIso(nowMs) };
    return updated;
  });
  return { ok: true, reason: `Reward program ${status}.`, state: next, program: updated };
}

export function deleteRewardProgram(state: RewardState, programId: string, managerId?: string): RewardOperationResult {
  const manager = managerFor(state, managerId);
  const visibleIds = new Set(visibleRewardProgramsForManager(state, manager).map((program) => program.id));
  if (!visibleIds.has(programId)) return { ok: false, reason: "Reward program is not visible to this manager.", state };
  const pendingClaims = state.claims.some((claim) => claim.programId === programId && claim.status === "pending");
  if (pendingClaims) return { ok: false, reason: "Resolve pending claims before deleting this reward.", state };
  const next = cloneRewardState(state);
  next.programs = next.programs.filter((program) => program.id !== programId);
  return { ok: true, reason: "Reward program deleted.", state: next };
}

export function redeemRewardProgram(state: RewardState, programId: string, studentId?: string, nowMs = Date.now()): RewardOperationResult {
  const student = accountById(state.accounts, studentId || state.accountState.activeAccountId || "");
  if (!student || student.role !== "student") return { ok: false, reason: "Only student accounts can redeem rewards.", state };
  const program = rewardProgramsForStudent(state, student).find((item) => item.id === programId);
  if (!program) return { ok: false, reason: "Reward is not active for this student.", state };
  if (state.claims.some((claim) => claim.programId === program.id && claim.studentId === student.id && claim.status === "pending")) {
    return { ok: false, reason: "This reward is already pending parent/admin fulfillment.", state };
  }
  const available = rewardAvailablePoints(state.profiles[student.id]);
  if (available < program.costPoints) return { ok: false, reason: "Not enough available points yet.", state };
  const next = cloneRewardState(state);
  const profile = profileFor(next, student.id);
  profile.attendance.spentPoints = Number(profile.attendance.spentPoints || 0) + program.costPoints;
  profile.attendance.lastRewardAt = nowIso(nowMs);
  const claim = normalizeRewardClaim(
    {
      id: `reward-claim-${program.id}-${student.id}-${nowMs}`,
      programId: program.id,
      studentId: student.id,
      requestedBy: student.id,
      costPoints: program.costPoints,
      requestedAt: nowIso(nowMs),
    },
    nowMs,
  );
  if (!claim) return { ok: false, reason: "Reward claim could not be normalized.", state };
  profile.attendance.rewardRedemptions = [claim.id, ...profile.attendance.rewardRedemptions];
  next.claims = [claim, ...next.claims];
  return { ok: true, reason: "Reward redemption requested.", state: next, claim };
}

export function resolveRewardClaim(state: RewardState, claimId: string, action: "fulfill" | "cancel", managerId?: string, nowMs = Date.now()): RewardOperationResult {
  const manager = managerFor(state, managerId);
  const visibleIds = new Set(visibleRewardClaimsForManager(state, manager).map((claim) => claim.id));
  if (!visibleIds.has(claimId)) return { ok: false, reason: "Reward claim is not visible to this manager.", state };
  const claim = state.claims.find((item) => item.id === claimId);
  if (!claim || claim.status !== "pending") return { ok: false, reason: "Only pending claims can be resolved.", state };
  const next = cloneRewardState(state);
  let resolved: RewardClaim | undefined;
  next.claims = next.claims.map((item) => {
    if (item.id !== claimId) return item;
    resolved = {
      ...item,
      status: action === "fulfill" ? "fulfilled" : "cancelled",
      fulfilledBy: manager?.id || "",
      fulfilledAt: nowIso(nowMs),
    };
    return resolved;
  });
  if (action === "cancel") {
    const profile = profileFor(next, claim.studentId);
    profile.attendance.spentPoints = Math.max(0, Number(profile.attendance.spentPoints || 0) - Number(claim.costPoints || 0));
  }
  return { ok: true, reason: action === "fulfill" ? "Reward claim fulfilled." : "Reward claim cancelled and points returned.", state: next, claim: resolved };
}

export function buildRewardOperationsModel(state: RewardState, managerId?: string): RewardOperationsModel {
  const manager = managerFor(state, managerId);
  const students = rewardManagerStudents(state, manager);
  const visiblePrograms = visibleRewardProgramsForManager(state, manager);
  const visibleClaims = visibleRewardClaimsForManager(state, manager);
  const studentById = new Map(students.map((student) => [student.id, student]));
  const accountByOwnerId = new Map(state.accounts.map((account) => [account.id, account]));
  const programById = new Map(state.programs.map((program) => [program.id, program]));
  const claimsByProgram = new Map<string, RewardClaim[]>();
  state.claims.forEach((claim) => {
    claimsByProgram.set(claim.programId, [...(claimsByProgram.get(claim.programId) || []), claim]);
  });
  const programs = visiblePrograms.map((program) => {
    const owner = accountByOwnerId.get(program.ownerAccountId);
    const targetLabel =
      program.scope === "global"
        ? "All students"
        : program.targetStudentIds.length
          ? program.targetStudentIds.map((id) => accountByOwnerId.get(id)?.name || id).join(", ")
          : "Linked students";
    const programClaims = claimsByProgram.get(program.id) || [];
    return {
      program,
      targetLabel,
      ownerLabel: owner?.name || program.ownerAccountId,
      claimCount: programClaims.length,
      pendingClaims: programClaims.filter((claim) => claim.status === "pending").length,
      canToggle: canManageRewards(manager),
      canDelete: canManageRewards(manager) && !programClaims.some((claim) => claim.status === "pending"),
    };
  });
  const claims = visibleClaims.map((claim) => ({
    claim,
    programTitle: programById.get(claim.programId)?.title || claim.programId,
    studentName: studentById.get(claim.studentId)?.name || accountByOwnerId.get(claim.studentId)?.name || claim.studentId,
    canResolve: claim.status === "pending" && canManageRewards(manager),
  }));
  return {
    manager,
    programs,
    claims,
    students,
    totalPrograms: programs.length,
    activePrograms: programs.filter((row) => row.program.status === "active").length,
    pendingClaims: claims.filter((row) => row.claim.status === "pending").length,
    canManage: canManageRewards(manager),
  };
}

export function buildStudentRewardStoreModel(state: RewardState, studentId?: string): StudentRewardStoreModel {
  const student = accountById(state.accounts, studentId || state.accountState.activeAccountId || "");
  const availablePoints = student?.role === "student" ? rewardAvailablePoints(state.profiles[student.id]) : 0;
  const claims = student?.role === "student" ? rewardClaimsForStudent(state, student.id) : [];
  const pendingIds = new Set(claims.filter((claim) => claim.status === "pending").map((claim) => claim.programId));
  const programById = new Map(state.programs.map((program) => [program.id, program]));
  const claimRows = claims
    .slice()
    .sort((a, b) => Date.parse(b.requestedAt || "") - Date.parse(a.requestedAt || ""))
    .map((claim) => ({
      claim,
      programTitle: programById.get(claim.programId)?.title || claim.programId,
      studentName: student?.name || claim.studentId,
      canResolve: false,
    }));
  return {
    student: student?.role === "student" ? student : null,
    availablePoints,
    programs: rewardProgramsForStudent(state, student).map((program) => ({
      ...program,
      targetStudentIds: [...program.targetStudentIds],
      affordable: availablePoints >= program.costPoints,
      pending: pendingIds.has(program.id),
    })),
    claims: claimRows,
    fulfilledClaims: claimRows.filter((row) => row.claim.status === "fulfilled"),
  };
}
