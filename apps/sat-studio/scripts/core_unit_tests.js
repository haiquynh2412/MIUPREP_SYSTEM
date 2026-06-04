const assert = require("node:assert/strict");
const core = require("../sat_core.js");

function run() {
  assert.equal(core.normalizeStudentAnswer(" 1,250 "), "1250");
  assert.equal(core.normalizeStudentAnswer("−3/4"), "-3/4");

  assert.equal(core.parseStudentNumber("3/4"), 0.75);
  assert.equal(core.parseStudentNumber("-6/-8"), 0.75);
  assert.equal(core.parseStudentNumber(".625"), 0.625);
  assert.equal(core.parseStudentNumber("4/0"), null);
  assert.equal(core.parseStudentNumber("abc"), null);

  assert.equal(core.answersMatch("0.75", "3/4"), true);
  assert.equal(core.answersMatch("2.0004", "2"), true);
  assert.equal(core.answersMatch("2.01", "2"), false);
  assert.equal(core.answersMatch("B", "b"), true);
  assert.equal(core.answersMatch("", "0"), false);

  assert.equal(core.difficultyWeight("Easy"), 1);
  assert.equal(core.difficultyWeight("Medium"), 1.35);
  assert.equal(core.difficultyWeight("Hard"), 1.75);
  assert.equal(core.difficultyWeight("Unknown"), 1.2);

  assert.equal(core.estimateSectionScore(null), 200);
  assert.equal(core.estimateSectionScore({ total: 10, correct: 10, weightedTotal: 0, weightedCorrect: 0 }), 800);
  assert.equal(core.estimateSectionScore({ total: 10, correct: 5, weightedTotal: 20, weightedCorrect: 10 }), 500);
  assert.deepEqual(
    core.estimateSectionScoreBand({ total: 10, correct: 5, weightedTotal: 20, weightedCorrect: 10, difficultyCounts: { Hard: 2 } }),
    { estimate: 500, low: 440, high: 560, confidence: "medium", evidenceCount: 10, hardCount: 2, label: "440-560" },
  );

  const questions = [{ id: "q1", prompt: "One" }, { id: "2", prompt: "Two" }];
  const index = core.buildQuestionIndex(questions);
  assert.deepEqual(core.getQuestionById(index, "q1"), questions[0]);
  assert.deepEqual(core.getQuestionById(index, 2), questions[1]);
  assert.equal(core.getQuestionById(index, "missing"), null);
}

run();
console.log("core_unit_tests: pass");
