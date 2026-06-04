const assert = require("node:assert/strict");
const mastery = require("../sat_mastery_engine.js");
const core = require("../sat_core.js");

function run() {
  assert.equal(mastery.averageNumber([1, 2, "bad", 4]), 7 / 3);
  assert.equal(mastery.clampNumber(120, 0, 100), 100);
  assert.equal(mastery.dominantErrorTypeFor({ careless: 2, calculation: 3 }), "calculation");
  assert.equal(mastery.dominantErrorTypeFor({}), "none");

  assert.equal(mastery.masteryStatus({ attempts: 2 }, 90), "Needs data");
  assert.equal(mastery.masteryStatus({ attempts: 4 }, 40), "Relearn");
  assert.equal(mastery.masteryStatus({ attempts: 5 }, 70), "Practice");
  assert.equal(mastery.masteryStatus({ attempts: 8 }, 84), "Test-ready soon");
  assert.equal(mastery.masteryStatus({ attempts: 8, hardCorrect: 2, recentWrong: 0, hardTimedFreshProofCount: 2 }, 92), "Prove on hard/timed");
  assert.equal(mastery.masteryStatus({ attempts: 8, hardCorrect: 3, recentWrong: 0, hardTimedFreshProofCount: 3 }, 92), "Mastered");

  assert.equal(mastery.masteryStageFor({ attempts: 2 }, 90), "Collect evidence");
  assert.equal(mastery.masteryStageFor({ attempts: 5, easyWrong: 2, hardCorrect: 0, recentWrong: 0 }, 80), "Foundation repair");
  assert.equal(mastery.masteryStageFor({ attempts: 5, easyWrong: 0, hardCorrect: 0, recentWrong: 0 }, 60), "Standard SAT");
  assert.equal(mastery.masteryStageFor({ attempts: 5, easyWrong: 0, hardCorrect: 0, recentWrong: 0 }, 80, "trap_answer"), "Trap recognition");
  assert.equal(mastery.masteryStageFor({ attempts: 5, easyWrong: 0, hardCorrect: 1, recentWrong: 0, hardTimedFreshProofCount: 1 }, 90, "none"), "Hard transfer");
  assert.equal(mastery.masteryStageFor({ attempts: 8, easyWrong: 0, hardCorrect: 3, recentWrong: 1, hardTimedFreshProofCount: 3 }, 90, "none"), "Timed mastery");
  assert.equal(mastery.masteryStageFor({ attempts: 8, easyWrong: 0, hardCorrect: 3, recentWrong: 0, hardTimedFreshProofCount: 3 }, 90, "none"), "Maintenance");

  assert.equal(mastery.masteryStageExit("Hard transfer"), "Get at least 3 hard or timed fresh proof questions correct in different forms.");
  assert.equal(mastery.masteryProofRequirement("Foundation repair", { easyWrong: 2 }).proofType, "foundation");
  assert.equal(mastery.masteryProofRequirement("Hard transfer", { hardCorrect: 1 }).minDifficulty, "Hard");
  assert.equal(mastery.masteryProofRequirement("Timed mastery", {}).timedRequired, true);
  assert.equal(mastery.masteryActionFor("knowledge_gap", {}), "Lesson first, then 10 foundation questions");
  assert.equal(mastery.masteryActionFor("calculation", { easyWrong: 2 }), "Relearn basics before more tests");
  assert.equal(mastery.readinessBand(90), "1600 training ready");
  assert.equal(mastery.readinessBand(30), "Starter path");

  const questions = new Map([
    [
      "q1",
      {
        id: "q1",
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations",
        difficulty: "Easy",
        templateDiversity: { formId: "linear-basic" },
      },
    ],
    [
      "q2",
      {
        id: "q2",
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations",
        difficulty: "Medium",
        templateDiversity: { formId: "linear-basic" },
      },
    ],
    [
      "q3",
      {
        id: "q3",
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations",
        difficulty: "Hard",
        templateDiversity: { formId: "linear-hard" },
      },
    ],
  ]);
  const profile = {
    attempts: [
      { questionId: "q1", correct: false, selectedAnswer: "B", at: "2026-05-15T00:00:00.000Z", errorType: "calculation" },
      { questionId: "q2", correct: false, selectedAnswer: "C", at: "2026-05-16T00:00:00.000Z", errorType: "calculation" },
      { questionId: "q3", correct: true, selectedAnswer: "A", at: "2026-05-17T00:00:00.000Z" },
    ],
  };
  const rows = mastery.computeSkillMasteryRows(profile, {
    now: Date.parse("2026-05-17T12:00:00.000Z"),
    difficultyWeight: core.difficultyWeight,
    getQuestionById: (id) => questions.get(id),
    templateFormId: (question) => question.templateDiversity?.formId || "",
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].skill, "Linear equations");
  assert.equal(rows[0].attempts, 3);
  assert.equal(rows[0].correct, 1);
  assert.equal(rows[0].wrong, 2);
  assert.equal(rows[0].easyWrong, 1);
  assert.equal(rows[0].recentWrong, 2);
  assert.equal(rows[0].dominantErrorType, "calculation");
  assert.equal(rows[0].repeatedFormWrong, 1);
  assert.equal(rows[0].masteryStage, "Foundation repair");
  assert.equal(rows[0].action, "Untimed accuracy drill with written work");
  assert.equal(rows[0].proofRequirement.proofType, "foundation");
  assert.equal(rows[0].proofRequirement.requiredFreshItems, 5);

  const eliteQuestions = new Map([
    ["h1", { id: "h1", section: "Math", domain: "Advanced Math", skill: "Quadratics", difficulty: "Hard", templateDiversity: { formId: "hard-a" } }],
    ["h2", { id: "h2", section: "Math", domain: "Advanced Math", skill: "Quadratics", difficulty: "Hard", templateDiversity: { formId: "hard-b" } }],
    ["h3", { id: "h3", section: "Math", domain: "Advanced Math", skill: "Quadratics", difficulty: "Medium", templateDiversity: { formId: "timed-c" } }],
    ["m1", { id: "m1", section: "Math", domain: "Advanced Math", skill: "Quadratics", difficulty: "Medium", templateDiversity: { formId: "medium-d" } }],
    ["m2", { id: "m2", section: "Math", domain: "Advanced Math", skill: "Quadratics", difficulty: "Medium", templateDiversity: { formId: "medium-e" } }],
  ]);
  const eliteRows = mastery.computeSkillMasteryRows(
    {
      attempts: [
        { questionId: "h1", correct: true, at: "2026-04-01T00:00:00.000Z", practiceMode: "Crucible Timed Proof" },
        { questionId: "h2", correct: true, at: "2026-04-02T00:00:00.000Z", practiceMode: "Remediation Proof" },
        { questionId: "h3", correct: true, at: "2026-04-03T00:00:00.000Z", practiceMode: "Timed proof" },
        { questionId: "m1", correct: true, at: "2026-04-04T00:00:00.000Z" },
        { questionId: "m2", correct: true, at: "2026-04-05T00:00:00.000Z" },
      ],
    },
    {
      now: Date.parse("2026-05-17T12:00:00.000Z"),
      difficultyWeight: core.difficultyWeight,
      getQuestionById: (id) => eliteQuestions.get(id),
      templateFormId: (question) => question.templateDiversity?.formId || "",
    },
  );
  assert.equal(eliteRows[0].hardTimedFreshProofCount, 3);
  assert.equal(eliteRows[0].status, "Mastered");
  assert.equal(eliteRows[0].masteryStage, "Maintenance");
}

run();
console.log("mastery_engine_unit_tests: pass");
