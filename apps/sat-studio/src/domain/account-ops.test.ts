import assert from "node:assert/strict";
import {
  ACCOUNT_STATE_STORAGE_KEY,
  buildAccountOperationsModel,
  changeAccountStatus,
  createAccount,
  deleteAccount,
  loadAccountState,
  normalizeAccount,
  readStoredStateJson,
  saveAccountState,
  updateAccount,
  writeStoredStateJson,
} from "./account-ops";

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

function run(): void {
  const storage = new MemoryStorage();
  storage.setItem(
    ACCOUNT_STATE_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      activeAccountId: "content-admin",
      accounts: [
        { id: "student-demo", role: "unknown", scope: "public", parentIds: "bad", passcode: "1111", targetScore: "1520" },
        { id: "parent-x", name: "Parent X", role: "parent", scope: "family", passcode: "2222", permissions: { questionContributor: true } },
        { id: "student-x", name: "Student X", role: "student", scope: "family", passcode: "3333", parentIds: ["parent-x"] },
      ],
      profiles: {
        "student-x": {
          attempts: [{ correct: true }, { correct: false }],
          pretests: [{ scoreEstimate: 1410 }],
          attendance: { points: "18" },
          streak: { count: "2" },
          externalStudyLogs: [{ minutes: 15 }, { minutes: "20" }],
        },
      },
    }),
  );

  let state = loadAccountState(storage);
  assert.equal(state.accounts.find((account) => account.id === "student-demo")?.role, "student");
  assert.equal(state.accounts.find((account) => account.id === "student-demo")?.scope, "public");
  assert.deepEqual(state.accounts.find((account) => account.id === "student-demo")?.parentIds, []);
  assert.equal(state.profiles["student-x"].attendance.points, 18);
  assert.equal(state.profiles["student-x"].streak.count, 2);
  assert.equal(state.profiles["student-x"].streak.freezeCredits, 0);
  assert.equal(state.profiles["student-x"].externalStudyLogs.length, 2);

  const model = buildAccountOperationsModel(state, "content-admin");
  assert.equal(model.total, 5);
  assert.equal(model.students, 2);
  assert.equal(model.parentOptions.some((account) => account.id === "parent-x"), true);
  assert.equal(model.accounts.find((row) => row.account.id === "student-x")?.accuracy, 50);
  assert.equal(model.accounts.find((row) => row.account.id === "student-x")?.latestBaseline, "Baseline 1410");
  assert.equal(model.accounts.find((row) => row.account.id === "student-x")?.externalMinutes, 35);

  const duplicate = createAccount(state, { name: "Duplicate", passcode: "1111" }, "content-admin");
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.reason.includes("passcode"), true);

  const created = createAccount(
    state,
    {
      name: "New Learner",
      passcode: "4444",
      role: "admin",
      scope: "public",
      parentId: "parent-x",
      weeklyTarget: 5,
    },
    "parent-x",
  );
  assert.equal(created.ok, true);
  assert.equal(created.account?.role, "student");
  assert.equal(created.account?.scope, "family");
  assert.deepEqual(created.account?.parentIds, ["parent-x"]);
  state = created.state;

  const updated = updateAccount(
    state,
    "student-x",
    {
      name: "Student X Updated",
      passcode: "3333",
      role: "admin",
      scope: "public",
      weeklyTarget: 6,
    },
    "parent-x",
  );
  assert.equal(updated.ok, true);
  assert.equal(updated.account?.role, "student");
  assert.equal(updated.account?.scope, "family");
  assert.equal(updated.account?.studyPlan.weeklyTarget, 6);
  state = updated.state;

  const blockLastAdmin = changeAccountStatus(state, "content-admin", "suspended", "content-admin");
  assert.equal(blockLastAdmin.ok, false);

  const locked = changeAccountStatus(state, "student-x", "suspended", "content-admin");
  assert.equal(locked.ok, true);
  assert.equal(locked.account?.status, "suspended");
  state = locked.state;

  const deleted = deleteAccount(state, "parent-x", "content-admin");
  assert.equal(deleted.ok, true);
  assert.equal(deleted.state.accounts.some((account) => account.id === "parent-x"), false);
  assert.equal(deleted.state.accounts.some((account) => account.parentIds.includes("parent-x")), false);
  state = deleted.state;

  const saved = saveAccountState(state, storage);
  assert.equal(saved.storage.exists, true);
  const reloaded = loadAccountState(storage);
  assert.equal(reloaded.accounts.some((account) => account.id === "parent-x"), false);
  assert.equal(reloaded.accounts.some((account) => account.id === "student-x"), true);

  const chunkStorage = new MemoryStorage();
  writeStoredStateJson(chunkStorage, ACCOUNT_STATE_STORAGE_KEY, JSON.stringify({ payload: "x".repeat(40) }), 10);
  assert.equal(readStoredStateJson(chunkStorage, ACCOUNT_STATE_STORAGE_KEY)?.includes("payload"), true);

  const normalized = normalizeAccount({ id: "a", role: "parent", permissions: { questionContributor: true } });
  assert.equal(normalized.permissions.rewardManager, true);
  assert.equal(normalized.permissions.questionContributor, true);
}

run();
console.log("account-ops.test: pass");
