import assert from "node:assert/strict";
import { ACCOUNT_STATE_STORAGE_KEY } from "./account-ops";
import {
  PUBLIC_BACKEND_COOKIE_SESSION,
  PUBLIC_BACKEND_TOKEN_KEY,
  applyBackendPatch,
  backendHealth,
  backendMonitoring,
  backendStatusPatch,
  bootstrapBackendAdmin,
  buildBackendSessionModel,
  buildFullProfileSnapshot,
  buildProfileDiffSummary,
  getBackendToken,
  getBackendProfile,
  normalizeBackendProfileRecord,
  loadPublicBackendState,
  loginBackend,
  normalizeBaseUrl,
  normalizePublicBackendState,
  refreshBackendSession,
  requestJson,
  getBackendMe,
  listBackendAccounts,
  saveBackendProfile,
  saveBackendProgress,
  signupBackend,
  applyServerProfileToAccountState,
  savePublicBackendState,
  setBackendToken,
  serverProfileBody,
  serverProfileSummary,
} from "./public-backend";

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

function mockFetch(
  handler: (url: string, init?: RequestInit) => { status?: number; body?: unknown },
): (input: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; text(): Promise<string> }> {
  return async (input, init) => {
    const result = handler(input, init);
    const status = result.status || 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      async text() {
        return JSON.stringify(result.body || {});
      },
    };
  };
}

async function run(): Promise<void> {
  assert.equal(normalizeBaseUrl("/api/public///"), "/api/public");
  const normalized = normalizePublicBackendState({
    baseUrl: "/custom/",
    account: { id: "acct-1", username: "admin", role: "content_admin" },
    statusLevel: "ok",
    lastLearningSyncMode: "backend",
    sessionExpiresAt: "1000",
  });
  assert.equal(normalized.baseUrl, "/custom");
  assert.equal(normalized.account?.id, "acct-1");
  assert.equal(normalized.statusLevel, "ok");
  assert.equal(normalized.lastLearningSyncMode, "backend");
  assert.equal(normalized.sessionExpiresAt, 1000);

  const localStorage = new MemoryStorage();
  localStorage.setItem(
    ACCOUNT_STATE_STORAGE_KEY,
    JSON.stringify({
      activeAccountId: "content-admin",
      publicBackend: {
        baseUrl: "/api/public",
        account: { id: "acct-1", username: "admin", role: "content_admin" },
        statusTitle: "Backend session active",
      },
    }),
  );
  const loaded = loadPublicBackendState(localStorage);
  assert.equal(loaded.backend.account?.username, "admin");
  const saved = savePublicBackendState(
    loaded.accountState,
    applyBackendPatch(loaded.backend, backendStatusPatch("ok", "Backend reachable", "Health check passed", { lastHealth: { service: "SAT Studio" } })),
    localStorage,
  );
  assert.equal(saved.backend.statusTitle, "Backend reachable");
  assert.equal(loadPublicBackendState(localStorage).backend.lastHealth?.service, "SAT Studio");

  const sessionStorage = new MemoryStorage();
  sessionStorage.setItem(PUBLIC_BACKEND_TOKEN_KEY, "legacy-token");
  setBackendToken("token-1", sessionStorage);
  assert.equal(sessionStorage.getItem(PUBLIC_BACKEND_TOKEN_KEY), null);
  assert.equal(getBackendToken(sessionStorage), "");
  setBackendToken("", sessionStorage);
  assert.equal(getBackendToken(sessionStorage), "");

  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = mockFetch((url, init) => {
    calls.push({ url, init });
    if (url.endsWith("/health")) return { body: { ok: true, service: "SAT Studio public backend" } };
    if (url.endsWith("/bootstrap")) return { status: 201, body: { account: { id: "admin-1", username: "admin", role: "content_admin" } } };
    if (url.endsWith("/signup")) return { status: 201, body: { token: "student-token", account: { id: "student-1", username: "learner", role: "student" }, expiresAt: 2500 } };
    if (url.endsWith("/login")) return { body: { token: "token-2", account: { id: "admin-1", username: "admin", role: "content_admin" }, expiresAt: 2000 } };
    if (url.endsWith("/me")) return { body: { account: { id: "admin-1", username: "admin", role: "content_admin" } } };
    if (url.endsWith("/accounts")) return { body: { items: [{ id: "student-1", username: "learner", role: "student" }], count: 1 } };
    if (url.endsWith("/session/refresh")) return { body: { token: "token-3", account: { id: "admin-1", username: "admin", role: "content_admin" }, expiresAt: 3000 } };
    if (url.endsWith("/monitoring")) return { body: { counts: { accounts: 3, openQuestionAudits: 1 }, sessions: { active: 1 } } };
    return { status: 404, body: { error: "not found" } };
  });

  const health = await backendHealth({ baseUrl: "/api/public/", fetchImpl });
  assert.equal(health.service, "SAT Studio public backend");
  const boot = await bootstrapBackendAdmin({ username: "admin", password: "password123", displayName: "Admin" }, { fetchImpl });
  assert.equal((boot.account as Record<string, unknown>).id, "admin-1");
  const signup = await signupBackend({ username: "learner", password: "password123", displayName: "Learner", role: "student" }, { fetchImpl });
  assert.equal(signup.token, "student-token");
  const login = await loginBackend({ username: "admin", password: "password123" }, { fetchImpl });
  assert.equal(login.token, "token-2");
  const me = await getBackendMe("token-2", { fetchImpl });
  assert.equal((me.account as Record<string, unknown>).id, "admin-1");
  await getBackendMe(PUBLIC_BACKEND_COOKIE_SESSION, { fetchImpl });
  const cookieMeCall = calls.filter((call) => call.url.endsWith("/me")).at(-1);
  assert.equal((cookieMeCall?.init?.headers as Record<string, string>).Authorization, undefined);
  assert.equal(cookieMeCall?.init?.credentials, "include");
  const accounts = await listBackendAccounts("token-2", { fetchImpl });
  assert.equal(accounts.count, 1);
  const refresh = await refreshBackendSession("token-2", { fetchImpl });
  assert.equal(refresh.token, "token-3");
  const monitoring = await backendMonitoring("token-3", { fetchImpl });
  assert.deepEqual(monitoring.counts, { accounts: 3, openQuestionAudits: 1 });
  assert.equal(calls.every((call) => call.init?.credentials === "include"), true);
  assert.equal(calls.some((call) => String(call.init?.headers || "").includes("Bearer")), false);
  assert.equal(JSON.stringify(calls.find((call) => call.url.endsWith("/monitoring"))?.init?.headers).includes("Bearer token-3"), true);

  await assert.rejects(
    () => requestJson("/missing", { fetchImpl }),
    /not found/,
  );

  const model = buildBackendSessionModel(
    normalizePublicBackendState({
      account: { id: "admin-1", username: "admin", role: "content_admin" },
      sessionExpiresAt: 3000,
      lastMonitoring: { counts: { accounts: 3, openQuestionAudits: 1 } },
      statusTitle: "Backend session active",
    }),
    "token-3",
    { id: "content-admin", role: "admin" } as never,
  );
  assert.equal(model.loggedIn, true);
  assert.equal(model.canAdmin, true);
  assert.equal(model.canBootstrap, true);
  assert.equal(model.actionDisabled.monitoring, false);
  assert.equal(model.monitoringLabel, "3 accounts, 1 open audits");

  const studentAccount = loaded.accountState.accounts.find((account) => account.id === "student-demo");
  assert.ok(studentAccount);
  const localProfile = {
    ...loaded.accountState.profiles["student-demo"],
    attempts: [{ questionId: "q-local" }],
    pretests: [{ scoreEstimate: 1420 }],
    studyNotes: [{ id: "note-1" }],
    lessonProgress: { algebra: { status: "started" } },
  };
  const snapshot = buildFullProfileSnapshot(localProfile, studentAccount);
  assert.equal(snapshot.schemaVersion, "sat_profile_v2_learning_evidence");
  assert.equal(snapshot.profile.currentPretest, undefined);
  assert.equal((snapshot.summary as Record<string, unknown>).attempts, 1);

  const profileCalls: Array<{ url: string; init?: RequestInit }> = [];
  const profileFetch = mockFetch((url, init) => {
    profileCalls.push({ url, init });
    if (url.includes("/profile?")) {
      return {
        body: {
          accountId: "backend-account",
          source: "sat_studio_profile",
          serverRevision: 2,
          updatedAt: "2026-05-28T00:00:00.000Z",
          profile: { profile: { attempts: [{ questionId: "q-server" }, { questionId: "q-server-2" }], learningEvents: [{}] }, summary: { targetScore: 1550 } },
        },
      };
    }
    if (url.endsWith("/profile")) return { body: { serverRevision: 3, profile: snapshot } };
    if (url.endsWith("/progress")) return { body: { accountId: "backend-account", progress: { attempts: 1 }, updatedAt: "now" } };
    return { status: 404, body: { error: "not found" } };
  });
  const loadedProfile = await getBackendProfile("token-3", "backend-account", { fetchImpl: profileFetch });
  assert.equal(loadedProfile.serverRevision, 2);
  const savedProfile = await saveBackendProfile("token-3", "backend-account", snapshot, {
    fetchImpl: profileFetch,
    baseServerRevision: 2,
    clientRevision: 10,
  });
  assert.equal(savedProfile.serverRevision, 3);
  const savedProgress = await saveBackendProgress("token-3", "backend-account", { attempts: 1 }, { fetchImpl: profileFetch });
  assert.equal((savedProgress.progress as Record<string, unknown>).attempts, 1);
  assert.equal(profileCalls[0].url, "/api/public/profile?accountId=backend-account&source=sat_studio_profile");
  assert.equal(JSON.parse(String(profileCalls[1].init?.body)).baseServerRevision, 2);

  const normalizedRecord = normalizeBackendProfileRecord(loadedProfile);
  assert.equal(normalizedRecord.serverRevision, 2);
  assert.equal(serverProfileBody(normalizedRecord).attempts instanceof Array, true);
  assert.equal(serverProfileSummary(normalizedRecord).targetScore, 1550);
  const diff = buildProfileDiffSummary(normalizedRecord, localProfile);
  assert.equal(diff.local.attempts, 1);
  assert.equal(diff.server.attempts, 2);
  assert.equal(diff.changedKeys.includes("attempts"), true);

  const applied = applyServerProfileToAccountState(loaded.accountState, "student-demo", normalizedRecord);
  assert.equal(applied.profiles["student-demo"].attempts.length, 2);
  assert.equal(applied.profiles["student-demo"].externalStudyLogs.length, 0);
}

run().then(() => console.log("public-backend.test: pass"));
