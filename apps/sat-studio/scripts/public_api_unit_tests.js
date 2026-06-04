const assert = require("node:assert/strict");
const publicApi = require("../sat_public_api.js");

function mockFetch(calls, response) {
  return async (url, init) => {
    calls.push({ url, init });
    return {
      ok: response.ok !== false,
      status: response.status || 200,
      async text() {
        return JSON.stringify(response.body || {});
      },
    };
  };
}

async function run() {
  assert.equal(publicApi.normalizeBaseUrl("/api/public/"), "/api/public");

  const calls = [];
  const login = await publicApi.login(
    { username: "admin", password: "AdminPass123" },
    { baseUrl: "/api/public/", fetchImpl: mockFetch(calls, { body: { token: "abc" } }) },
  );
  assert.equal(login.token, "abc");
  assert.equal(calls[0].url, "/api/public/login");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.credentials, "include");
  assert.equal(calls[0].init.headers["Content-Type"], "application/json");

  const signupCalls = [];
  const signup = await publicApi.signup(
    { username: "student", password: "StudentPass123", displayName: "Student", role: "student" },
    { fetchImpl: mockFetch(signupCalls, { status: 201, body: { token: "student-token" } }) },
  );
  assert.equal(signup.token, "student-token");
  assert.equal(signupCalls[0].url, "/api/public/signup");
  assert.equal(signupCalls[0].init.method, "POST");

  const sessionCalls = [];
  await publicApi.refreshSession("token-1", { fetchImpl: mockFetch(sessionCalls, { body: { token: "token-2" } }) });
  await publicApi.logout("token-2", { fetchImpl: mockFetch(sessionCalls, { body: { ok: true } }) });
  assert.equal(sessionCalls[0].url, "/api/public/session/refresh");
  assert.equal(sessionCalls[0].init.method, "POST");
  assert.equal(sessionCalls[0].init.credentials, "include");
  assert.equal(sessionCalls[0].init.headers.Authorization, "Bearer token-1");
  assert.equal(sessionCalls[1].url, "/api/public/logout");
  assert.equal(sessionCalls[1].init.headers.Authorization, "Bearer token-2");

  const progressCalls = [];
  await publicApi.saveProgress("token-1", "student-1", { attempts: 4 }, { fetchImpl: mockFetch(progressCalls, { body: { ok: true } }) });
  assert.equal(progressCalls[0].url, "/api/public/progress");
  assert.equal(progressCalls[0].init.headers.Authorization, "Bearer token-1");
  assert.deepEqual(JSON.parse(progressCalls[0].init.body).progress, { attempts: 4 });

  global.document = { cookie: `${publicApi.PUBLIC_BACKEND_CSRF_COOKIE_NAME}=csrf-1` };
  const cookieCalls = [];
  await publicApi.saveProgress(publicApi.PUBLIC_BACKEND_COOKIE_SESSION, "student-1", { attempts: 5 }, { fetchImpl: mockFetch(cookieCalls, { body: { ok: true } }) });
  assert.equal(cookieCalls[0].init.headers.Authorization, undefined);
  assert.equal(cookieCalls[0].init.headers[publicApi.PUBLIC_BACKEND_CSRF_HEADER_NAME], "csrf-1");
  delete global.document;

  const getCalls = [];
  await publicApi.getProgress("token-1", "student-1", { source: "sat_studio", fetchImpl: mockFetch(getCalls, { body: { progress: {} } }) });
  assert.equal(getCalls[0].url, "/api/public/progress?accountId=student-1&source=sat_studio");

  const profileCalls = [];
  await publicApi.saveProfile("token-1", "student-1", { profile: { attempts: [1] } }, {
    baseServerRevision: 2,
    clientRevision: 3,
    fetchImpl: mockFetch(profileCalls, { body: { serverRevision: 3 } }),
  });
  await publicApi.getProfile("token-1", "student-1", { fetchImpl: mockFetch(profileCalls, { body: { profile: {} } }) });
  assert.equal(profileCalls[0].url, "/api/public/profile");
  assert.equal(profileCalls[0].init.method, "POST");
  assert.equal(JSON.parse(profileCalls[0].init.body).baseServerRevision, 2);
  assert.equal(profileCalls[1].url, "/api/public/profile?accountId=student-1&source=sat_studio_profile");

  const adminCalls = [];
  await publicApi.schemaVersion("token-1", { fetchImpl: mockFetch(adminCalls, { body: { currentVersion: "0001_public_backend_initial" } }) });
  await publicApi.exportSnapshot("token-1", { fetchImpl: mockFetch(adminCalls, { body: { accounts: [] } }) });
  await publicApi.monitoring("token-1", { fetchImpl: mockFetch(adminCalls, { body: { counts: {} } }) });
  await publicApi.listAccounts("token-1", { fetchImpl: mockFetch(adminCalls, { body: { items: [] } }) });
  await publicApi.updateAccountStatus("token-1", "student-1", "disabled", { fetchImpl: mockFetch(adminCalls, { body: { account: {} } }) });
  await publicApi.listAuditLog("token-1", {
    action: "update_account_status",
    targetType: "account",
    actorAccountId: "admin-1",
    fetchImpl: mockFetch(adminCalls, { body: { items: [] } }),
  });
  await publicApi.purgeSessions("token-1", { fetchImpl: mockFetch(adminCalls, { body: { ok: true } }) });
  await publicApi.saveQuestionReview("token-1", { questionId: "q1", draft: { id: "q1" }, status: "expert_reviewed" }, { fetchImpl: mockFetch(adminCalls, { status: 201, body: { version: {} } }) });
  await publicApi.listQuestionReviews("token-1", "q1", { limit: 5, fetchImpl: mockFetch(adminCalls, { body: { items: [] } }) });
  await publicApi.createClass("token-1", { name: "SAT 1600 Cohort" }, { fetchImpl: mockFetch(adminCalls, { status: 201, body: { class: { id: "class-1" } } }) });
  await publicApi.listClasses("token-1", { fetchImpl: mockFetch(adminCalls, { body: { items: [] } }) });
  await publicApi.joinClass("token-1", { joinCode: "SAT-ABC123" }, { fetchImpl: mockFetch(adminCalls, { body: { class: { id: "class-1" } } }) });
  await publicApi.createClassAssignment(
    "token-1",
    "class-1",
    { title: "Proof", mode: "proof_review", focusSkill: "Linear equations", dueDate: "2026-06-02", targetStudentIds: ["student-1"] },
    { fetchImpl: mockFetch(adminCalls, { status: 201, body: { assignment: { id: "assign-1" } } }) },
  );
  await publicApi.listClassAssignments("token-1", "class-1", { fetchImpl: mockFetch(adminCalls, { body: { items: [] } }) });
  await publicApi.getClassReport("token-1", "class-1", { fetchImpl: mockFetch(adminCalls, { body: { students: [] } }) });
  await publicApi.submitAssignmentEvidence(
    "token-1",
    "assign-1",
    { studentAccountId: "student-1", status: "completed", evidence: { attempts: 4 } },
    { fetchImpl: mockFetch(adminCalls, { body: { ok: true } }) },
  );
  await publicApi.saveContentPackage("token-1", { schemaVersion: "sat_content_package_v1", items: [] }, { fetchImpl: mockFetch(adminCalls, { body: { contentVersion: "v1" } }) });
  await publicApi.getContentPackage("token-1", { fetchImpl: mockFetch(adminCalls, { body: { package: { items: [] } } }) });
  await publicApi.getContentPackage("token-1", {
    section: "Math",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    desmos: "desmos_recommended",
    includeContent: false,
    limit: 25,
    offset: 50,
    fetchImpl: mockFetch(adminCalls, { body: { package: { items: [] } } }),
  });
  assert.equal(adminCalls[0].url, "/api/public/schema-version");
  assert.equal(adminCalls[1].url, "/api/public/export");
  assert.equal(adminCalls[1].init.headers.Authorization, "Bearer token-1");
  assert.equal(adminCalls[2].url, "/api/public/monitoring");
  assert.equal(adminCalls[3].url, "/api/public/accounts");
  assert.equal(adminCalls[4].url, "/api/public/accounts/student-1/status");
  assert.equal(adminCalls[4].init.method, "POST");
  assert.equal(JSON.parse(adminCalls[4].init.body).status, "disabled");
  assert.equal(adminCalls[5].url, "/api/public/audit-log?action=update_account_status&targetType=account&actorAccountId=admin-1");
  assert.equal(adminCalls[6].url, "/api/public/maintenance/purge-sessions");
  assert.equal(adminCalls[6].init.method, "POST");
  assert.equal(adminCalls[7].url, "/api/public/question-reviews");
  assert.equal(adminCalls[7].init.method, "POST");
  assert.equal(JSON.parse(adminCalls[7].init.body).status, "expert_reviewed");
  assert.equal(adminCalls[8].url, "/api/public/question-reviews?questionId=q1&limit=5");
  assert.equal(adminCalls[9].url, "/api/public/classes");
  assert.equal(adminCalls[9].init.method, "POST");
  assert.equal(adminCalls[10].url, "/api/public/classes");
  assert.equal(adminCalls[11].url, "/api/public/classes/join");
  assert.equal(adminCalls[12].url, "/api/public/classes/class-1/assignments");
  assert.equal(adminCalls[12].init.method, "POST");
  assert.equal(adminCalls[13].url, "/api/public/classes/class-1/assignments");
  assert.equal(adminCalls[14].url, "/api/public/classes/class-1/report");
  assert.equal(adminCalls[15].url, "/api/public/assignments/assign-1/evidence");
  assert.equal(JSON.parse(adminCalls[15].init.body).evidence.attempts, 4);
  assert.equal(adminCalls[16].url, "/api/public/content-package");
  assert.equal(JSON.parse(adminCalls[16].init.body).package.schemaVersion, "sat_content_package_v1");
  assert.equal(adminCalls[17].url, "/api/public/content-package?scope=public");
  assert.equal(adminCalls[18].url, "/api/public/content-package?scope=public&section=Math&domain=Advanced+Math&skill=Nonlinear+equations&desmos=desmos_recommended&limit=25&offset=50&includeContent=false");

  const snapshot = publicApi.buildProgressSnapshot(
    {
      attempts: [
        { correct: true, learningEvidence: { required: true, status: "provided" } },
        { correct: false, learningEvidence: { required: true, status: "missing" } },
      ],
      learningEvents: [{ type: "practice_attempt" }],
      pretests: [{ scoreEstimate: 1500 }],
      attendance: { points: 20 },
      streak: { count: 3 },
      skillMastery: { Algebra: 82 },
      lessonProgress: { Algebra: { status: "done" } },
    },
    { id: "student-1", targetScore: 1600 },
  );
  assert.equal(snapshot.accountId, "student-1");
  assert.equal(snapshot.targetScore, 1600);
  assert.equal(snapshot.attempts, 2);
  assert.equal(snapshot.attemptsWithLearningEvidence, 1);
  assert.equal(snapshot.missingRequiredEvidence, 1);
  assert.equal(snapshot.learningEvents, 1);
  assert.equal(snapshot.latestDiagnostic.scoreEstimate, 1500);

  const fullProfile = publicApi.buildFullProfileSnapshot(
    { attempts: [{ correct: true }], currentPretest: { inProgress: true } },
    { id: "student-1", name: "Student", role: "student", targetScore: 1590 },
  );
  assert.equal(fullProfile.schemaVersion, publicApi.PROFILE_SYNC_CONTRACT_VERSION);
  assert.equal(fullProfile.sourceOfTruth.learningEvidence, "backend.profile_records:profile.attempts[].learningEvidence");
  assert.equal(fullProfile.profile.attempts.length, 1);
  assert.equal(fullProfile.profile.currentPretest, undefined);
  assert.equal(fullProfile.summary.targetScore, 1590);

  await assert.rejects(
    () => publicApi.health({ fetchImpl: mockFetch([], { ok: false, status: 403, body: { error: "Permission denied." } }) }),
    /Permission denied/,
  );
}

run().then(() => console.log("public_api_unit_tests: pass"));
