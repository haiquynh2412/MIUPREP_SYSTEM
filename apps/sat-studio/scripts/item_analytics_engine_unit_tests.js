const assert = require("node:assert/strict");
const analytics = require("../sat_item_analytics_engine.js");

function run() {
  assert.equal(analytics.scoreBandRank("SAT-Elite"), 1500);
  assert.equal(analytics.scoreBandRank("1420"), 1420);

  const attempts = [];
  for (let index = 0; index < 120; index += 1) {
    attempts.push({
      questionId: "q1",
      correct: index < 70 ? index < 60 : index < 65,
      scoreEstimateAtAttempt: index < 60 ? 1550 : 1050,
    });
  }
  for (let index = 0; index < 20; index += 1) {
    attempts.push({ questionId: "q2", correct: index % 2 === 0, scoreBand: "SAT-Core" });
  }
  for (let index = 0; index < 30; index += 1) {
    attempts.push({ questionId: "q3", correct: true, scoreEstimateAtAttempt: 1300 });
  }
  for (let index = 0; index < 10; index += 1) {
    attempts.push({
      questionId: "q3",
      correct: false,
      scoreEstimateAtAttempt: 1300,
      helpTelemetry: { hintUsed: true, hintCount: 1, helpTiming: "pre_submit", independentAttempt: false },
    });
  }
  const report = analytics.buildItemAnalytics({
    attempts,
    questions: [
      { id: "q1", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Hard" },
      { id: "q2", section: "Reading and Writing", domain: "Craft and Structure", skill: "Words in Context", difficulty: "Medium" },
      { id: "q3", section: "Math", domain: "Advanced Math", skill: "Equivalent expressions", difficulty: "Hard" },
    ],
  });
  assert.equal(report.version, "item-analytics-v1-2026-05-26");
  assert.equal(report.itemCount, 3);
  assert.equal(report.readyPValue, 2);
  assert.equal(report.readyDiscrimination, 1);
  assert.equal(report.calibrationAttemptCount, 170);
  const q1 = report.rows.find((row) => row.questionId === "q1");
  assert.equal(q1.responseCount, 120);
  assert.equal(q1.calibrationResponseCount, 120);
  assert.equal(q1.pValue, 0.5);
  assert.ok(q1.discriminationIndex > 0.5);
  const q2 = report.rows.find((row) => row.questionId === "q2");
  assert.equal(q2.pValueReady, false);
  assert.ok(q2.flags.includes("sample_below_p_value_threshold"));
  const q3 = report.rows.find((row) => row.questionId === "q3");
  assert.equal(q3.responseCount, 40);
  assert.equal(q3.calibrationResponseCount, 30);
  assert.equal(q3.helpedResponseCount, 10);
  assert.equal(q3.pValue, 1);
  assert.equal(analytics.isIndependentAttempt({ helpTelemetry: { fullSolutionViewed: true, helpTiming: "post_submit" } }), true);
  assert.equal(analytics.isIndependentAttempt({ helpTelemetry: { fullSolutionViewed: true, helpTiming: "pre_submit" } }), false);
}

run();
console.log("item_analytics_engine_unit_tests: pass");
