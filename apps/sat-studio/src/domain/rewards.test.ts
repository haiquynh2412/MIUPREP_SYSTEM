import assert from "node:assert/strict";
import { ACCOUNT_STATE_STORAGE_KEY } from "./account-ops";
import {
  buildRewardBehaviorAuditReport,
  buildRewardOperationsModel,
  buildStudentRewardStoreModel,
  buildRewardState,
  createRewardProgram,
  deleteRewardProgram,
  loadRewardState,
  normalizeRewardClaim,
  normalizeRewardProgram,
  redeemRewardProgram,
  resolveRewardClaim,
  rewardProgramsForStudent,
  saveRewardState,
  setRewardProgramStatus,
  visibleRewardClaimsForManager,
  visibleRewardProgramsForManager,
} from "./rewards";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

function seedStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  storage.setItem(
    ACCOUNT_STATE_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      activeAccountId: "content-admin",
      accounts: [
        { id: "content-admin", name: "Admin", role: "admin", passcode: "9999", permissions: { rewardManager: true, questionContributor: true } },
        { id: "parent-a", name: "Parent A", role: "parent", scope: "family", passcode: "1111", permissions: { rewardManager: true } },
        { id: "parent-b", name: "Parent B", role: "parent", scope: "family", passcode: "2222", permissions: { rewardManager: true } },
        { id: "student-a", name: "Student A", role: "student", scope: "family", passcode: "3333", parentIds: ["parent-a"] },
        { id: "student-b", name: "Student B", role: "student", scope: "family", passcode: "4444", parentIds: ["parent-b"] },
      ],
      profiles: {
        "student-a": { attendance: { points: 120, spentPoints: 10 } },
        "student-b": { attendance: { points: 30, spentPoints: 0 } },
      },
      rewardPrograms: [
        {
          id: "global-20",
          title: "Global 20",
          costPoints: 20,
          rewardType: "study_bonus",
          scope: "global",
          status: "active",
          ownerAccountId: "content-admin",
          targetStudentIds: [],
        },
        {
          id: "family-a",
          title: "Family A",
          costPoints: 50,
          rewardType: "experience",
          scope: "family",
          status: "active",
          ownerAccountId: "parent-a",
          targetStudentIds: [],
        },
        {
          id: "target-b",
          title: "Target B",
          costPoints: 40,
          rewardType: "gift",
          scope: "family",
          status: "active",
          ownerAccountId: "parent-b",
          targetStudentIds: ["student-b"],
        },
      ],
      rewardClaims: [
        {
          id: "claim-b",
          programId: "target-b",
          studentId: "student-b",
          requestedBy: "student-b",
          costPoints: 40,
          status: "pending",
          requestedAt: "2026-05-25T00:00:00.000Z",
        },
      ],
    }),
  );
  return storage;
}

function run(): void {
  const normalizedProgram = normalizeRewardProgram({ title: "  Reward  ", cost: "0", rewardType: "bad", scope: "bad", status: "bad" }, 1);
  assert.equal(normalizedProgram?.title, "Reward");
  assert.equal(normalizedProgram?.costPoints, 1);
  assert.equal(normalizedProgram?.rewardType, "privilege");
  assert.equal(normalizedProgram?.scope, "family");
  assert.equal(normalizedProgram?.status, "active");

  const normalizedClaim = normalizeRewardClaim({ programId: "p", studentId: "s", costPoints: "-5", status: "bad" }, 2);
  assert.equal(normalizedClaim?.costPoints, 0);
  assert.equal(normalizedClaim?.status, "pending");

  const storage = seedStorage();
  let state = loadRewardState(storage);
  const admin = state.accounts.find((account) => account.id === "content-admin");
  const parentA = state.accounts.find((account) => account.id === "parent-a");
  const studentA = state.accounts.find((account) => account.id === "student-a");
  const studentB = state.accounts.find((account) => account.id === "student-b");

  assert.equal(visibleRewardProgramsForManager(state, admin).some((program) => program.id === "target-b"), true);
  assert.deepEqual(
    visibleRewardProgramsForManager(state, parentA).map((program) => program.id).filter((id) => ["family-a", "target-b"].includes(id)),
    ["family-a"],
  );
  assert.deepEqual(
    rewardProgramsForStudent(state, studentA).map((program) => program.id).filter((id) => ["global-20", "family-a", "target-b"].includes(id)),
    ["global-20", "family-a"],
  );
  assert.deepEqual(
    rewardProgramsForStudent(state, studentB).map((program) => program.id).filter((id) => ["global-20", "family-a", "target-b"].includes(id)),
    ["global-20", "target-b"],
  );

  const created = createRewardProgram(state, { title: "Parent reward", costPoints: 25, scope: "global", targetStudentIds: ["student-a"] }, "parent-a", 10);
  assert.equal(created.ok, true);
  assert.equal(created.program?.scope, "family");
  assert.equal(created.program?.ownerAccountId, "parent-a");
  assert.deepEqual(created.program?.targetStudentIds, ["student-a"]);
  state = created.state;

  const blockedTarget = createRewardProgram(state, { title: "Wrong target", targetStudentIds: ["student-b"] }, "parent-a", 11);
  assert.equal(blockedTarget.ok, false);

  const redeemed = redeemRewardProgram(state, "global-20", "student-a", 12);
  assert.equal(redeemed.ok, true);
  assert.equal(redeemed.state.profiles["student-a"].attendance.spentPoints, 30);
  state = redeemed.state;

  const duplicate = redeemRewardProgram(state, "global-20", "student-a", 13);
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.reason.includes("pending"), true);

  const fulfill = resolveRewardClaim(state, redeemed.claim?.id || "", "fulfill", "parent-a", 14);
  assert.equal(fulfill.ok, true);
  assert.equal(fulfill.claim?.status, "fulfilled");
  assert.equal(fulfill.state.profiles["student-a"].attendance.spentPoints, 30);
  state = fulfill.state;

  const secondRedeem = redeemRewardProgram(state, "family-a", "student-a", 15);
  assert.equal(secondRedeem.ok, true);
  assert.equal(secondRedeem.state.profiles["student-a"].attendance.spentPoints, 80);
  const cancelled = resolveRewardClaim(secondRedeem.state, secondRedeem.claim?.id || "", "cancel", "parent-a", 16);
  assert.equal(cancelled.ok, true);
  assert.equal(cancelled.claim?.status, "cancelled");
  assert.equal(cancelled.state.profiles["student-a"].attendance.spentPoints, 30);
  state = cancelled.state;

  const pendingDelete = deleteRewardProgram(state, "target-b", "content-admin");
  assert.equal(pendingDelete.ok, false);
  const paused = setRewardProgramStatus(state, "family-a", "paused", "parent-a", 17);
  assert.equal(paused.ok, true);
  assert.equal(paused.program?.status, "paused");
  state = paused.state;
  const deleted = deleteRewardProgram(state, "family-a", "parent-a");
  assert.equal(deleted.ok, true);
  state = deleted.state;

  const parentClaims = visibleRewardClaimsForManager(state, parentA);
  assert.equal(parentClaims.some((claim) => claim.studentId === "student-b"), false);
  const model = buildRewardOperationsModel(state, "content-admin");
  assert.equal(model.canManage, true);
  assert.equal(model.pendingClaims, 1);
  assert.equal(model.programs.some((row) => row.program.id === "reward-sprint-choice"), true);
  const store = buildStudentRewardStoreModel(state, "student-a");
  assert.equal(store.student?.id, "student-a");
  assert.equal(store.availablePoints, 90);
  assert.equal(store.programs.some((program) => program.id === "global-20"), true);
  assert.equal(store.claims.some((row) => row.claim.status === "fulfilled"), true);

  const saved = saveRewardState(state, storage);
  const reloaded = loadRewardState(storage);
  assert.equal(reloaded.programs.some((program) => program.id === "family-a"), false);
  assert.equal(reloaded.claims.some((claim) => claim.status === "fulfilled"), true);
  assert.equal(saved.accountState.raw.rewardPrograms instanceof Array, true);

  const rebuilt = buildRewardState(saved.accountState);
  assert.equal(rebuilt.programs.some((program) => program.id === "reward-sprint-choice"), true);

  const behaviorAudit = buildRewardBehaviorAuditReport({ programs: state.programs, claims: state.claims, generatedAt: "2026-06-04T00:00:00.000Z" });
  assert.equal(behaviorAudit.schemaVersion, "reward_behavior_audit_v1");
  assert.notEqual(behaviorAudit.status, "blocked");
  assert.equal(behaviorAudit.findings.some((finding) => finding.reason === "claim_flow_parent_approved"), true);
  assert.equal(behaviorAudit.findings.some((finding) => finding.id === "hard-winner" && finding.reason === "raw_correctness_reward"), true);
  assert.equal(behaviorAudit.findings.some((finding) => finding.reason === "attendance_points_only"), true);

  const blockedAudit = buildRewardBehaviorAuditReport({
    rewardCatalog: [],
    achievementCatalog: [],
    programs: [
      {
        id: "orphan-reward",
        title: "Orphan reward",
        description: "",
        costPoints: 10,
        rewardType: "gift",
        scope: "family",
        status: "active",
        ownerAccountId: "",
        targetStudentIds: [],
        createdAt: "2026-06-04T00:00:00.000Z",
        updatedAt: "",
      },
    ],
    claims: [],
    generatedAt: "2026-06-04T00:00:00.000Z",
  });
  assert.equal(blockedAudit.status, "blocked");
}

run();
console.log("rewards.test: pass");
