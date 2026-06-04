const assert = require("node:assert/strict");
const accountEngine = require("../sat_account_engine.js");

function run() {
  const admin = { id: "admin", role: "admin", scope: "family" };
  const parent = { id: "parent-1", role: "parent", scope: "family" };
  const student = { id: "student-1", role: "student", scope: "family", parentIds: ["parent-1"] };
  const publicStudent = { id: "public-1", role: "student", scope: "public", parentIds: [] };

  const merged = accountEngine.mergeAccounts(
    [{ id: "student-1", role: "unknown", scope: "public", parentIds: "bad", uiTheme: "teen_quest", studyPlan: { weeklyTarget: "6" } }],
    [admin, student],
  );
  const normalized = merged.find((item) => item.id === "student-1");
  assert.equal(normalized.role, "student");
  assert.equal(normalized.scope, "public");
  assert.deepEqual(normalized.parentIds, []);
  assert.equal(normalized.uiTheme, "teen_quest");
  assert.equal(normalized.status, "active");
  assert.equal(normalized.studyPlan.weeklyTarget, 6);
  assert.equal(normalized.avatarInitials, "S");
  assert.equal(normalized.avatarColor, "teal");
  assert.equal(normalized.permissions.rewardManager, false);
  assert.equal(normalized.permissions.questionContributor, false);

  const parentDraft = accountEngine.buildAccountDraft(
    {
      name: "Child Learner",
      email: " child@example.com ",
      gradeLevel: "Grade 10",
      avatarInitials: "cl",
      avatarColor: "coral",
      permissionRewards: true,
      permissionAuthoring: true,
      passcode: "1234",
      scope: "public",
      role: "admin",
      targetScore: "1550",
      uiTheme: "teen_quest",
      weeklyTarget: "5",
    },
    parent,
    { nowMs: 1000 },
  );
  assert.equal(parentDraft.ok, true);
  assert.equal(parentDraft.account.role, "student");
  assert.equal(parentDraft.account.scope, "family");
  assert.equal(parentDraft.account.status, "active");
  assert.equal(parentDraft.account.email, "child@example.com");
  assert.equal(parentDraft.account.gradeLevel, "Grade 10");
  assert.equal(parentDraft.account.avatarInitials, "CL");
  assert.equal(parentDraft.account.avatarColor, "coral");
  assert.equal(parentDraft.account.permissions.rewardManager, false);
  assert.equal(parentDraft.account.permissions.questionContributor, false);
  assert.deepEqual(parentDraft.account.parentIds, ["parent-1"]);
  assert.equal(parentDraft.account.studyPlan.weeklyTarget, 5);

  const adminPublicDraft = accountEngine.buildAccountDraft(
    {
      name: "Public Parent Request",
      passcode: "abcd",
      scope: "public",
      role: "parent",
      parentId: "parent-1",
    },
    admin,
    { nowMs: 2000, slugify: () => "public-parent-request" },
  );
  assert.equal(adminPublicDraft.ok, true);
  assert.equal(adminPublicDraft.account.id, "account-public-parent-request-2000");
  assert.equal(adminPublicDraft.account.role, "student");
  assert.equal(adminPublicDraft.account.scope, "public");
  assert.deepEqual(adminPublicDraft.account.parentIds, []);

  const normalizedParent = accountEngine.normalizeAccount({ id: "parent-x", role: "parent", permissions: { questionContributor: true } });
  assert.equal(normalizedParent.permissions.rewardManager, true);
  assert.equal(normalizedParent.permissions.questionContributor, true);

  assert.equal(accountEngine.buildAccountDraft({ name: "No Passcode" }, parent).ok, false);
  assert.equal(accountEngine.buildAccountDraft({ name: "Blocked", passcode: "1" }, student).ok, false);

  const formForParent = accountEngine.buildAccountFormAccess({
    accounts: [admin, parent, student],
    manager: parent,
    selectedScope: "public",
    selectedRole: "admin",
  });
  assert.equal(formForParent.scope, "family");
  assert.equal(formForParent.role, "student");
  assert.equal(formForParent.scopeDisabled, true);
  assert.equal(formForParent.roleDisabled, true);
  assert.equal(formForParent.parentLinkDisabled, true);
  assert.equal(formForParent.forcedParentId, "parent-1");
  assert.deepEqual(formForParent.allowedParents.map((item) => item.id), ["parent-1"]);

  const formForAdminPublic = accountEngine.buildAccountFormAccess({
    accounts: [admin, parent],
    manager: admin,
    selectedScope: "public",
    selectedRole: "parent",
  });
  assert.equal(formForAdminPublic.scope, "public");
  assert.equal(formForAdminPublic.role, "student");
  assert.equal(formForAdminPublic.roleDisabled, true);
  assert.equal(formForAdminPublic.scopeDisabled, false);

  assert.deepEqual(accountEngine.visibleAccountsFor([admin, parent, student, publicStudent], admin).map((item) => item.id), [
    "admin",
    "parent-1",
    "student-1",
    "public-1",
  ]);
  assert.deepEqual(accountEngine.visibleAccountsFor([admin, parent, student, publicStudent], parent).map((item) => item.id), [
    "parent-1",
    "student-1",
  ]);
  assert.deepEqual(accountEngine.visibleAccountsFor([admin, parent, student], student).map((item) => item.id), ["student-1"]);
  assert.equal(accountEngine.currentAccount([admin, parent, student], "parent-1").id, "parent-1");
  assert.equal(accountEngine.currentAccount([admin, parent, student], "missing"), null);
  assert.equal(accountEngine.canEditAccount([admin, parent, student], admin, student), true);
  assert.equal(accountEngine.canEditAccount([admin, parent, student], parent, student), true);
  assert.equal(accountEngine.canEditAccount([admin, parent, student], parent, parent), false);
  assert.equal(accountEngine.canDeleteAccount([admin, parent, student], admin, admin), false);
  assert.equal(accountEngine.canDeleteAccount([{ ...admin, status: "active" }, { ...student }], admin, admin), false);
  assert.equal(accountEngine.canChangeAccountStatus([admin, { id: "admin-2", role: "admin", status: "active" }], admin, { id: "admin-2", role: "admin", status: "active" }, "suspended"), true);
  assert.equal(accountEngine.canChangeAccountStatus([admin], admin, admin, "suspended"), false);

  const profiles = {
    "student-1": {
      attempts: "bad",
      attendance: { points: "12", stickers: "bad" },
      externalLinks: null,
      roadmapLastBuiltAt: 10,
    },
  };
  const ensured = accountEngine.ensureAccountProfile(profiles, "student-1", () => ({
    attempts: [],
    notes: {},
    studyNotes: [],
    externalLinks: { khan: "", bluebook: "bluebook" },
    externalStudyLogs: [],
    bookmarks: [],
    officialLogs: [],
    errorTags: [],
    skillMastery: {},
    lessonProgress: {},
    practiceSessionReports: [],
    vocabKnown: [],
    vocabQuizAttempts: [],
    pretests: [],
    roadmap: [],
    roadmapLastBuiltAt: "",
    roadmapBuildReason: "",
    currentPretest: null,
    streak: { count: 0, lastPracticeDate: "" },
    attendance: { points: 0, daily: {}, stickers: [], lastRewardAt: "" },
  }));
  assert.deepEqual(ensured.attempts, []);
  assert.deepEqual(ensured.externalLinks, { khan: "", bluebook: "bluebook" });
  assert.equal(ensured.attendance.points, 12);
  assert.deepEqual(ensured.attendance.stickers, []);
  assert.equal(ensured.roadmapLastBuiltAt, "");
  assert.deepEqual(accountEngine.activeAccountProfile({ accounts: [student], profiles, activeAccountId: "student-1" }, () => ({ attempts: [] })), ensured);

  const progress = accountEngine.accountProgressSummary(
    { studyPlan: { weeklyTarget: 3, nextSessionAt: "2026-05-17T10:00:00.000Z" } },
    {
      attempts: [{ correct: true }, { correct: false }, { correct: true }],
      pretests: [{ scoreEstimate: 1420 }],
      attendance: { points: 90 },
      streak: { count: 4 },
      externalStudyLogs: [{ minutes: 30 }, { minutes: "15" }],
    },
    { formatDateTime: () => "May 17, 05:00 PM" },
  );
  assert.equal(progress.accuracy, 67);
  assert.equal(progress.latestBaseline, "Baseline 1420");
  assert.equal(progress.points, 90);
  assert.equal(progress.externalMinutes, 45);
  assert.equal(progress.schedule, "May 17, 05:00 PM");
}

run();
console.log("account_engine_unit_tests: pass");
