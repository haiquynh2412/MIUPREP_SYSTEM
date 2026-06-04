const assert = require("node:assert/strict");

const engine = require("../sat_role_boundary_engine.js");

function run() {
  const student = { id: "s1", role: "student" };
  const admin = { id: "a1", role: "admin" };
  const parent = { id: "p1", role: "parent" };

  assert.equal(engine.runtimeProfileForAccount(student).bundle, "learner");
  assert.equal(engine.runtimeProfileForAccount(parent).bundle, "family");
  assert.equal(engine.runtimeProfileForAccount(admin).allowAdminReports, true);

  const reviewed = {
    id: "q1",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations",
    difficulty: "Medium",
    reviewStatus: "reviewed",
    sourceType: "ai_generated",
    sourceName: "Private source",
    licenseNote: "Internal",
    auditStatus: "clear",
    publicationStatus: "ready",
    prompt: "Solve x + 1 = 2.",
    choices: ["1", "2"],
    correctAnswer: "1",
    explanation: "Subtract 1.",
  };
  const needReview = { ...reviewed, id: "q2", reviewStatus: "needs_review" };
  const blocked = { ...reviewed, id: "q3", auditStatus: "blocked" };

  assert.equal(engine.questionIsStudentReady(reviewed), true);
  assert.equal(engine.questionIsStudentReady(needReview), false);
  assert.equal(engine.questionIsStudentReady(blocked), false);
  assert.deepEqual(engine.filterQuestionsForRole([reviewed, needReview, blocked], student).map((q) => q.id), ["q1"]);
  assert.deepEqual(engine.filterQuestionsForRole([reviewed, needReview], admin).map((q) => q.id), ["q1", "q2"]);

  const studentQuestion = engine.roleQuestionForDisplay(reviewed, student);
  assert.equal(studentQuestion.id, "q1");
  assert.equal(studentQuestion.sourceType, undefined);
  assert.equal(studentQuestion.sourceName, undefined);
  assert.equal(studentQuestion.licenseNote, undefined);
  assert.equal(studentQuestion.reviewStatus, undefined);
  assert.equal(studentQuestion.prompt, reviewed.prompt);

  const preload = engine.buildRolePreloadPlan("dashboard", student, {
    banks: true,
    archiveRegistry: true,
    questionIntegrityReport: true,
    reviewedExpertAuditReport: true,
    externalResources: true,
  });
  assert.equal(preload.bundle, "learner");
  assert.equal(preload.banks, false);
  assert.equal(preload.archiveRegistry, false);
  assert.equal(preload.questionIntegrityReport, false);
  assert.equal(preload.reviewedExpertAuditReport, false);
  assert.equal(preload.externalResources, false);

  assert.deepEqual(engine.scanStudentUiLeakage("Admin Center has Needs Review rows."), ["Admin Center", "Needs Review"]);
  assert.deepEqual(engine.scanStudentUiLeakage("Needs bank review: 20 ready local questions."), ["Needs bank review", "ready local questions"]);
  assert.deepEqual(engine.scanStudentUiLeakage("Admin Center is intentionally documented.", { allow: ["Admin Center"] }), []);
}

run();
console.log("role boundary engine unit tests passed");
