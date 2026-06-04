const assert = require("node:assert/strict");
const learning = require("../sat_learning_event_engine.js");

function run() {
  const profile = { learningEvents: [] };
  const first = learning.buildLearningEvent(
    "practice attempt",
    { attemptId: "attempt-1", questionId: "q1", correct: false, entityType: "attempt" },
    { accountId: "student-demo", occurredAt: "2026-05-24T01:00:00.000Z" },
  );
  const duplicate = learning.buildLearningEvent(
    "practice_attempt",
    { attemptId: "attempt-1", questionId: "q1", correct: false, entityType: "attempt" },
    { accountId: "student-demo", occurredAt: "2026-05-24T01:00:00.000Z" },
  );
  learning.appendLearningEvent(profile, first);
  learning.appendLearningEvent(profile, duplicate);

  assert.equal(first.schemaVersion, "learning_event_v1");
  assert.equal(first.type, "practice_attempt");
  assert.equal(profile.learningEvents.length, 1);
  assert.ok(profile.learningEventRevision);

  const second = learning.buildLearningEvent(
    "diagnostic_completed",
    { pretestId: "pretest-1", score: 1280, entityType: "pretest" },
    { accountId: "student-demo", occurredAt: "2026-05-24T02:00:00.000Z" },
  );
  learning.appendLearningEvent(profile, second);

  const summary = learning.summarizeLearningEvents(profile.learningEvents);
  assert.equal(summary.total, 2);
  assert.equal(summary.byType.practice_attempt, 1);
  assert.equal(summary.byType.diagnostic_completed, 1);
  assert.equal(summary.firstAt, "2026-05-24T01:00:00.000Z");
  assert.equal(summary.lastAt, "2026-05-24T02:00:00.000Z");
}

run();
console.log("learning_event_engine_unit_tests: pass");
