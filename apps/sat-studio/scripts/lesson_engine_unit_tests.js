const assert = require("node:assert/strict");
const lessons = require("../sat_lesson_engine.js");

function run() {
  const canonical = {
    id: "math-linear-equations",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    aliases: ["linear equations", "one-variable equations"],
    lesson: {
      rule: "Isolate the variable with inverse operations.",
      steps: [["1. Combine", "Combine like terms."], ["2. Isolate", "Undo operations in reverse order."], ["3. Check", "Substitute back into the original equation."]],
      drill: "What operation isolates x?",
      example: "2x + 3 = 9 gives x = 3.",
      traps: ["Sign error", "Answering for 2x"],
    },
  };
  const canonicalKnowledgeFor = (scope) => (scope.skill === canonical.skill ? canonical : null);

  assert.equal(lessons.lessonStageForSkill(null), "Pre-SAT Grade 10");
  assert.equal(lessons.lessonStageForSkill({ masteryStage: "Standard SAT" }), "SAT Core");
  assert.equal(lessons.lessonStageForSkill({ masteryStage: "Trap recognition" }), "SAT Transfer");
  assert.equal(lessons.lessonStageForSkill({ masteryStage: "Timed mastery" }), "SAT 1550-1600");

  const ladder = lessons.lessonLadderFor({ masteryStage: "Trap recognition" });
  assert.equal(ladder.length, 4);
  assert.equal(ladder.find((row) => row.active).stage, "SAT Transfer");

  const subskills = lessons.subskillChecklistFor({ section: "Reading and Writing", domain: "Craft and Structure", skill: "Cross-Text Connections" });
  assert.equal(subskills.includes("Text 1 claim"), true);
  assert.equal(subskills.length >= 4, true);

  const playbook = lessons.stagePlaybookFor({ section: "Math", domain: "Advanced Math", skill: "Nonlinear equations in one variable" }, { masteryStage: "Timed mastery" });
  assert.equal(playbook.length, 4);
  assert.equal(playbook.find((row) => row.active).stage, "SAT 1550-1600");
  assert.match(playbook[3].drill, /hard\/grid-in/);

  const coverage = lessons.lessonCoverageAudit([canonical]);
  assert.equal(coverage.total, 1);
  assert.equal(coverage.complete, 1);
  assert.equal(coverage.averageScore, 100);
  assert.equal(coverage.rows[0].checks.threeStepMethod, true);
  assert.equal(coverage.rows[0].checks.scaffoldDrills, true);
  assert.equal(coverage.rows[0].checks.proofDrills, true);
  assert.equal(coverage.rows[0].checks.externalLinkTargets, true);

  const metaLesson = lessons.lessonFromKnowledgeMeta(canonical);
  assert.equal(metaLesson.rule, canonical.lesson.rule);
  assert.deepEqual(metaLesson.traps, ["Sign error", "Answering for 2x"]);

  const fallback = lessons.lessonFromKnowledgeMeta(null, { skill: "Transitions" });
  assert.equal(fallback.title, "Review: Transitions");
  assert.equal(fallback.steps.length, 3);

  const traps = lessons.lessonTrapsFor(
    { section: "Math", domain: "Algebra", skill: "Linear functions" },
    { dominantErrorType: "careless" },
    { errorTagLabel: (value) => `Error ${value}` },
  );
  assert.equal(traps[0], "Personal pattern: Error careless.");
  assert.equal(traps.some((trap) => trap.includes("rise/run")), true);

  const canonicalTraps = lessons.lessonTrapsFor({ ...canonical, canonicalMeta: canonical }, { dominantErrorType: "none" });
  assert.deepEqual(canonicalTraps, canonical.lesson.traps);

  assert.equal(
    lessons.lessonExampleFor({ section: "Reading and Writing", domain: "Expression of Ideas", skill: "Transitions" }),
    "Example: If sentence 2 contradicts sentence 1, a contrast transition such as however is usually needed.",
  );
  assert.equal(
    lessons.lessonExampleFor({ section: "Math", domain: "Algebra", skill: "Linear equations in one variable" }, { canonicalKnowledgeFor }),
    canonical.lesson.example,
  );

  const questions = [
    { id: "easy-1", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Easy", reviewStatus: "reviewed" },
    { id: "easy-2", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Easy", reviewStatus: "reviewed" },
    { id: "easy-3", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Easy", reviewStatus: "reviewed" },
    { id: "medium-1", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Medium", reviewStatus: "reviewed" },
    { id: "hard-1", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Hard", reviewStatus: "reviewed" },
    { id: "rejected", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Hard", reviewStatus: "rejected" },
  ];
  const scaffold = lessons.buildLessonScaffold(
    { section: "Math", domain: "Algebra", skill: canonical.skill, canonicalMeta: canonical },
    questions,
    { canonicalKnowledgeFor, isStudyAvailableQuestion: (question) => question.id !== "easy-3" },
  );
  assert.deepEqual(scaffold.map((item) => item.id), ["easy-1", "easy-2", "medium-1", "hard-1"]);

  const drillPlan = lessons.lessonDrillPlanFor({ section: "Math", domain: "Algebra", skill: canonical.skill }, questions, {
    isStudyAvailableQuestion: (question) => question.id !== "easy-3",
  });
  assert.deepEqual(drillPlan.scaffoldDrills[0].questionIds, ["easy-1", "easy-2", "medium-1"]);
  assert.deepEqual(drillPlan.proofDrills[0].questionIds, ["hard-1"]);

  const lessonV2 = lessons.buildLessonV2(
    { section: "Math", domain: "Algebra", skill: canonical.skill, canonicalMeta: canonical },
    { masteryStage: "Trap recognition" },
    questions,
    { canonicalKnowledgeFor, isStudyAvailableQuestion: (question) => question.id !== "easy-3" },
  );
  assert.equal(lessonV2.version, "lesson-library-v2-2026-05-19");
  assert.equal(lessonV2.concept, canonical.lesson.rule);
  assert.equal(lessonV2.threeStepMethod.length, 3);
  assert.equal(lessonV2.stage, "SAT Transfer");
  assert.equal(lessonV2.scaffoldDrills.length, 2);
  assert.equal(lessonV2.proofDrills.length, 2);
  assert.equal(lessonV2.externalLinkTargets.some((target) => target.provider === "Desmos"), true);

  const desmosLesson = lessons.buildLessonV2(
    { section: "Math", domain: "Calculator Strategy", skill: "Desmos Strategy for SAT Math" },
    { masteryStage: "Standard SAT" },
    [],
  );
  assert.equal(lessons.isDesmosScope(desmosLesson), true);
  assert.equal(desmosLesson.subskills.some((item) => item.includes("intersections")), true);
  assert.equal(desmosLesson.scaffoldDrills[0].id, "desmos-input-lab");
  assert.equal(desmosLesson.proofDrills[0].id, "desmos-transfer-proof");
  assert.equal(desmosLesson.stagePlaybook.find((row) => row.active).stage, "SAT Core");
  assert.equal(desmosLesson.externalLinkTargets.some((target) => target.intent === "graphing-calculator"), true);

  const original = { id: "q-original", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Medium", skeleton: "same" };
  const proofBank = [
    original,
    { id: "same-skeleton", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Medium", skeleton: "same" },
    { id: "new-medium", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Medium", skeleton: "new-1" },
    { id: "new-hard", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Hard", skeleton: "new-2" },
    { id: "hidden", section: "Math", domain: "Algebra", skill: canonical.skill, difficulty: "Medium", skeleton: "new-3", practicePool: "hidden_duplicate" },
    { id: "other-skill", section: "Math", domain: "Algebra", skill: "Quadratics", difficulty: "Medium", skeleton: "new-4" },
  ];
  const proof = lessons.chooseProofQuestionForAttempt(original, { errorType: "trap_answer" }, proofBank, {
    lessonScopeKey: (scope) => `${scope.section}|${scope.domain}|${scope.skill}`,
    skeletonId: (question) => question.skeleton,
    attemptedIds: new Set(),
  });
  assert.equal(proof.id, "new-medium");

  const unattemptedProof = lessons.chooseProofQuestionForAttempt(original, { errorType: "trap_answer" }, proofBank, {
    lessonScopeKey: (scope) => `${scope.section}|${scope.domain}|${scope.skill}`,
    skeletonId: (question) => question.skeleton,
    attemptedIds: new Set(["new-medium"]),
  });
  assert.equal(unattemptedProof.id, "new-hard");
}

run();
console.log("lesson_engine_unit_tests: pass");
