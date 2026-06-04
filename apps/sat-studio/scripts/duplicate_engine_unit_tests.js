const assert = require("node:assert/strict");
const duplicate = require("../sat_duplicate_engine.js");

function makeRepeatedQuestion(index, answer, sourceType = "ai_generated") {
  return {
    id: `q-${index}`,
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Medium",
    questionType: "student_produced_response",
    sourceType,
    reviewStatus: "reviewed",
    prompt: `If ${index + 2}x + ${index + 4} = ${index + 4 + (index + 2) * Number(answer)}, what is x?`,
    correctAnswer: String(answer),
    acceptableAnswers: [String(answer)],
    explanation: `Subtract ${index + 4}, then divide by ${index + 2}; x = ${answer}.`,
  };
}

function run() {
  const keyA = duplicate.questionSkeletonKey(makeRepeatedQuestion(1, 5));
  const keyB = duplicate.questionSkeletonKey(makeRepeatedQuestion(9, 5));
  assert.equal(keyA, keyB, "Skeleton key should ignore minor numeric changes inside the same form.");

  assert.equal(duplicate.duplicateAnswerRoundnessScore({ questionType: "grid_in", correctAnswer: "3.5" }), 1);
  assert.equal(duplicate.duplicateAnswerRoundnessScore({ questionType: "grid_in", correctAnswer: "25" }), 0);
  assert.deepEqual(duplicate.skeletonPolicyLimits("Easy"), { coreLimit: 3, activeLimit: 10 });
  assert.deepEqual(duplicate.skeletonPolicyLimits("Hard"), { coreLimit: 8, activeLimit: 10 });

  const questions = [
    makeRepeatedQuestion(1, 5),
    makeRepeatedQuestion(2, 3.7),
    makeRepeatedQuestion(3, 10),
    makeRepeatedQuestion(4, 2.5),
    makeRepeatedQuestion(5, 75),
    makeRepeatedQuestion(6, 12),
    makeRepeatedQuestion(7, 40),
    makeRepeatedQuestion(8, 9),
    makeRepeatedQuestion(9, 11),
    makeRepeatedQuestion(10, 3),
    makeRepeatedQuestion(11, 27),
    makeRepeatedQuestion(12, 31),
    { ...makeRepeatedQuestion(13, 6, "foundation"), id: "foundation-ignored" },
    { ...makeRepeatedQuestion(14, 7), id: "rejected", reviewStatus: "rejected" },
  ];

  const scan = duplicate.buildDuplicateSkeletonScan(questions, {
    scope: "generated",
    apply: true,
    labelFor: (value) => value,
  });
  assert.equal(scan.questionCount, 12);
  assert.equal(scan.repeatedGroups.length, 1);
  assert.equal(scan.repeatedGroups[0].size, 12);
  assert.equal(scan.repeatedGroups[0].coreIds.length, 5);
  assert.equal(scan.repeatedGroups[0].remedialIds.length, 5);
  assert.equal(scan.repeatedGroups[0].hiddenIds.length, 2);
  assert.equal(scan.repeatedGroups[0].preferredIds.length, 3);
  assert.deepEqual(scan.poolCounts, { core_pool: 5, remedial_pool: 5, hidden_duplicate: 2 });
  assert.equal(questions.filter((item) => item.practicePool === "hidden_duplicate").length, 2);
  assert.ok(questions.every((item) => item.id === "foundation-ignored" || item.id === "rejected" || item.skeletonDiversity));

  const summary = duplicate.summarizeDuplicatePolicy(questions);
  assert.equal(summary.total, 12);
  assert.equal(summary.core, 5);
  assert.equal(summary.remedial, 5);
  assert.equal(summary.hidden, 2);
}

run();
console.log("duplicate_engine_unit_tests: pass");
