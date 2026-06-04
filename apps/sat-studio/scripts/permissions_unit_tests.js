const assert = require("node:assert/strict");
const permissions = require("../sat_permissions.js");

function run() {
  const admin = { id: "admin", role: "admin", scope: "family" };
  const parent = { id: "parent", role: "parent", scope: "family" };
  const familyStudent = { id: "student-family", role: "student", scope: "family", parentIds: ["parent"] };
  const publicStudent = { id: "student-public", role: "student", scope: "public" };
  const oddPublicAdmin = { id: "public-admin", role: "admin", scope: "public" };

  assert.equal(permissions.isContentAdmin(admin), true);
  assert.equal(permissions.isAccountManager(parent), true);
  assert.equal(permissions.canCreateAnyAccount(parent), false);
  assert.equal(permissions.canCreateAnyAccount(admin), true);
  assert.equal(permissions.canManageRewards({ ...parent, permissions: { rewardManager: true } }), true);
  assert.equal(permissions.canAuthorQuestions(parent), false);
  assert.equal(permissions.canAuthorQuestions({ ...parent, permissions: { questionContributor: true } }), true);

  assert.equal(permissions.canAccessPrivateContent(admin), true);
  assert.equal(permissions.canAccessPrivateContent(familyStudent), true);
  assert.equal(permissions.canAccessPrivateContent(publicStudent), false);

  const publicQuestion = {
    id: "q-public",
    visibility: "public_candidate",
    sourceType: "original",
    reviewStatus: "reviewed",
    publicationStatus: "public_candidate_reviewed",
    choices: { A: "Choice A", B: "Choice B", C: "Choice C", D: "Choice D" },
    correctAnswer: "A",
    explanation: "Choice A is supported.",
  };
  const privateQuestion = { id: "q-private", visibility: "private_family" };
  const adminOnlyQuestion = { id: "q-admin", visibility: "admin_only" };
  const unsafePublicVaultQuestion = {
    ...publicQuestion,
    id: "q-public-vault",
    sourceType: "private_vault",
  };
  const unsafePublicDraft = {
    ...publicQuestion,
    id: "q-public-draft",
    reviewStatus: "needs_review",
    publicationStatus: "public_candidate_review",
  };

  assert.equal(permissions.isQuestionVisible(publicQuestion, publicStudent), true);
  assert.equal(permissions.isPublicSafeQuestion(publicQuestion), true);
  assert.equal(permissions.isQuestionVisible(unsafePublicVaultQuestion, publicStudent), false);
  assert.equal(permissions.isQuestionVisible(unsafePublicDraft, publicStudent), false);
  assert.equal(permissions.isQuestionVisible(privateQuestion, familyStudent), true);
  assert.equal(permissions.isQuestionVisible(privateQuestion, publicStudent), false);
  assert.equal(permissions.isQuestionVisible(adminOnlyQuestion, admin), true);
  assert.equal(permissions.isQuestionVisible(adminOnlyQuestion, parent), true);
  assert.equal(permissions.isQuestionVisible(adminOnlyQuestion, familyStudent), false);
  assert.equal(permissions.isQuestionVisible(adminOnlyQuestion, oddPublicAdmin), false);
  const completeMcQuestion = {
    id: "q-ok",
    reviewStatus: "reviewed",
    choices: { A: "Choice A", B: "Choice B", C: "Choice C", D: "Choice D" },
    correctAnswer: "A",
    explanation: { correct: "Choice A is supported." },
  };
  const completeSprQuestion = {
    id: "q-spr",
    reviewStatus: "reviewed",
    type: "SPR",
    correctAnswer: "4",
    acceptableAnswers: ["4"],
    explanation: { correct: "The answer is 4." },
  };
  assert.equal(permissions.isQuestionBlockedForStudy(completeMcQuestion), false);
  assert.equal(permissions.isQuestionBlockedForStudy(completeSprQuestion), false);
  assert.equal(permissions.isQuestionBlockedForStudy({ id: "q-rejected", reviewStatus: "rejected" }), true);
  assert.equal(permissions.isQuestionBlockedForStudy({ id: "q-audit-block", auditStatus: "blocked" }), true);
  assert.equal(permissions.isQuestionBlockedForStudy({ id: "q-publication-block", publicationStatus: "audit_blocked" }), true);
  assert.equal(permissions.isQuestionBlockedForStudy({ id: "q-content-fail", contentAudit: { verdict: "fail" } }), true);
  assert.equal(permissions.isQuestionBlockedForStudy({ ...completeMcQuestion, id: "q-hidden-duplicate", practicePool: "hidden_duplicate" }), true);
  assert.equal(permissions.isQuestionBlockedForStudy({ ...completeMcQuestion, id: "q-no-expl", explanation: "" }), true);
  assert.equal(permissions.isQuestionBlockedForStudy({ ...completeMcQuestion, id: "q-no-choices", choices: { A: "Only A" } }), true);
  assert.equal(permissions.isQuestionBlockedForStudy({ ...completeSprQuestion, id: "q-spr-no-answer", acceptableAnswers: [] }), true);

  const bank = [publicQuestion, privateQuestion, adminOnlyQuestion, unsafePublicVaultQuestion, unsafePublicDraft];
  assert.deepEqual(permissions.visibleQuestionBank(bank, publicStudent).map((q) => q.id), ["q-public"]);
  assert.deepEqual(permissions.visibleQuestionBank(bank, familyStudent).map((q) => q.id), ["q-public", "q-private", "q-public-vault", "q-public-draft"]);
  assert.deepEqual(permissions.visibleQuestionBank(bank, admin).map((q) => q.id), ["q-public", "q-private", "q-admin", "q-public-vault", "q-public-draft"]);

  const familySignal = { id: "s-family", visibility: "private_family" };
  const parentSignal = { id: "s-parent", visibility: "private_family", createdBy: "parent" };
  const adminSignal = { id: "s-admin", visibility: "admin_only" };
  assert.equal(permissions.canViewSourceSignal(familySignal, publicStudent), false);
  assert.equal(permissions.canViewSourceSignal(familySignal, familyStudent), true);
  assert.equal(permissions.canViewSourceSignal(parentSignal, parent), true);
  assert.equal(permissions.canViewSourceSignal(adminSignal, familyStudent), false);
  assert.equal(permissions.canViewSourceSignal(adminSignal, parent), false);
  assert.equal(permissions.canViewSourceSignal(adminSignal, admin), true);
  assert.equal(permissions.canViewSourceSignal(adminSignal, oddPublicAdmin), false);

  const accounts = [admin, parent, familyStudent, publicStudent, { id: "other", role: "student", scope: "family", parentIds: [] }];
  assert.deepEqual(permissions.linkedStudentAccountsFor(accounts, admin).map((item) => item.id), ["student-family", "student-public", "other"]);
  assert.deepEqual(permissions.linkedStudentAccountsFor(accounts, parent).map((item) => item.id), ["student-family"]);
  assert.deepEqual(permissions.linkedStudentAccountsFor(accounts, familyStudent).map((item) => item.id), ["student-family"]);
}

run();
console.log("permissions_unit_tests: pass");
