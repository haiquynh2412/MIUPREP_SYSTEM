const assert = require("node:assert/strict");
const lifecycle = require("../sat_content_lifecycle_engine.js");

const baseQuestion = {
  id: "q1",
  section: "Math",
  domain: "Algebra",
  skill: "Linear equations",
  difficulty: "Medium",
  visibility: "public_candidate",
  reviewStatus: "reviewed",
  publicationStatus: "public_candidate_reviewed",
  sourceType: "foundation",
  choices: { A: "1", B: "2", C: "3", D: "4" },
  correctAnswer: "B",
  explanation: { correct: "Choice B is correct." },
};

function stateOf(overrides = {}) {
  return lifecycle.deriveLifecycleState({ ...baseQuestion, ...overrides });
}

function run() {
  assert.equal(lifecycle.LIFECYCLE_VERSION, "content_lifecycle_v1_2026_05_24");
  assert.equal(stateOf().state, "public_candidate_ready");
  assert.equal(stateOf().publicReady, true);
  assert.equal(stateOf().studyEligible, true);

  assert.equal(stateOf({ reviewStatus: "needs_review" }).state, "needs_review");
  assert.equal(stateOf({ publicationStatus: "hidden_duplicate_topic_overflow" }).state, "hidden_duplicate");
  assert.equal(stateOf({ reviewStatus: "rejected" }).state, "blocked");
  assert.equal(stateOf({ auditStatus: "blocked" }).state, "blocked");
  assert.equal(stateOf({ contentAudit: { verdict: "fail" } }).state, "blocked");
  assert.equal(stateOf({ choices: { A: "1" } }).state, "needs_repair");
  assert.equal(stateOf({ publicationStatus: "public_candidate_review" }).state, "public_candidate_pending");
  assert.equal(stateOf({ sourceType: "private_vault" }).state, "public_candidate_blocked");
  assert.equal(stateOf({ visibility: "private_family", publicationStatus: "private_auto_reviewed" }).state, "private_reviewed");

  const grid = {
    ...baseQuestion,
    questionType: "student_produced_response",
    choices: {},
    correctAnswer: "4",
    acceptableAnswers: ["4"],
  };
  assert.equal(lifecycle.deriveLifecycleState(grid).state, "public_candidate_ready");
  assert.equal(lifecycle.deriveLifecycleState({ ...grid, acceptableAnswers: [] }).state, "needs_repair");

  const applied = lifecycle.applyLifecycleState({ ...baseQuestion });
  assert.equal(applied.lifecycleState, "public_candidate_ready");
  assert.equal(applied.lifecycleVersion, lifecycle.LIFECYCLE_VERSION);

  const summary = lifecycle.summarizeLifecycle([baseQuestion, { ...baseQuestion, id: "q2", reviewStatus: "needs_review" }]);
  assert.equal(summary.total, 2);
  assert.equal(summary.counts.public_candidate_ready, 1);
  assert.equal(summary.counts.needs_review, 1);
}

run();
console.log("content_lifecycle_engine_unit_tests: pass");
