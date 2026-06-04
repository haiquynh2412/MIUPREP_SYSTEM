const assert = require("node:assert/strict");
const diagnostic = require("../sat_diagnostic_engine.js");
const core = require("../sat_core.js");

function question(id, section, domain, difficulty, extras = {}) {
  return {
    id,
    section,
    domain,
    skill: extras.skill || `${domain} skill`,
    difficulty,
    sourceType: extras.sourceType || "foundation",
    reviewStatus: extras.reviewStatus || "reviewed",
    choices: extras.choices || { A: "A", B: "B", C: "C", D: "D" },
    correctAnswer: extras.correctAnswer || "A",
    explanation: extras.explanation || "Because A is supported.",
    ...extras,
  };
}

function run() {
  const bank = [
    question("rw-info-easy", "Reading and Writing", "Information and Ideas", "Easy"),
    question("rw-info-medium", "Reading and Writing", "Information and Ideas", "Medium", { sourceType: "opensat" }),
    question("rw-info-hard", "Reading and Writing", "Information and Ideas", "Hard", { sourceType: "ai_generated" }),
    question("rw-craft-medium", "Reading and Writing", "Craft and Structure", "Medium"),
    question("math-alg-easy", "Math", "Algebra", "Easy"),
    question("math-alg-medium", "Math", "Algebra", "Medium"),
    question("math-alg-hard-grid", "Math", "Algebra", "Hard", {
      questionType: "student_produced_response",
      choices: {},
      correctAnswer: "7",
      acceptableAnswers: ["7", "7.0"],
    }),
    question("needs-review", "Math", "Algebra", "Easy", { reviewStatus: "needs_review" }),
    question("stale-metadata-review", "Math", "Algebra", "Easy", { metadata: { reviewStatus: "needs_review" } }),
    question("rejected", "Math", "Algebra", "Easy", { reviewStatus: "rejected" }),
    question("bad-mcq", "Math", "Algebra", "Medium", { choices: { A: "A" } }),
    question("hidden", "Math", "Algebra", "Medium", { practicePool: "hidden_duplicate" }),
  ];

  assert.equal(diagnostic.isDiagnosticReadyQuestion(bank[0]), true);
  assert.equal(diagnostic.isDiagnosticReadyQuestion(bank[6]), true);
  assert.equal(diagnostic.isDiagnosticReadyQuestion(bank[7]), false);
  assert.equal(diagnostic.isDiagnosticReadyQuestion(bank[8]), false);
  assert.equal(diagnostic.isDiagnosticReadyQuestion(bank[9]), false);
  assert.equal(diagnostic.isDiagnosticReadyQuestion(bank[10]), false);
  assert.equal(diagnostic.isDiagnosticReadyQuestion(bank[11]), false);

  assert.deepEqual(
    diagnostic.rankDiagnosticCandidates([bank[1], bank[2], bank[0]]).map((item) => item.id),
    ["rw-info-medium", "rw-info-easy", "rw-info-hard"],
  );
  assert.deepEqual(
    diagnostic.rankDiagnosticCandidatesForRoute([bank[4], bank[5], bank[6]], "hard").map((item) => item.id),
    ["math-alg-hard-grid", "math-alg-medium", "math-alg-easy"],
  );
  assert.deepEqual(
    diagnostic.rankDiagnosticCandidatesForRoute([bank[4], bank[5], bank[6]], "foundation").map((item) => item.id),
    ["math-alg-easy", "math-alg-medium", "math-alg-hard-grid"],
  );
  assert.equal(diagnostic.normalizeDiagnosticRoute("foundation"), "easy");
  assert.equal(diagnostic.normalizeDiagnosticRoute("hard"), "hard");

  assert.deepEqual(diagnostic.pickDifficultyMix([bank[1], bank[2], bank[0]], 3).map((item) => item.difficulty), ["Easy", "Medium", "Hard"]);
  assert.deepEqual(
    diagnostic.pickDiverseCandidates([
      question("dup-a", "Math", "Algebra", "Hard", { skill: "Linear", skeletonId: "same" }),
      question("dup-b", "Math", "Algebra", "Hard", { skill: "Linear", skeletonId: "same" }),
      question("fresh", "Math", "Algebra", "Hard", { skill: "Systems", skeletonId: "fresh" }),
    ], 2).map((item) => item.id),
    ["dup-a", "fresh"],
  );

  const meta = {
    expectedCount: 4,
    blueprint: [
      { section: "Reading and Writing", domain: "Information and Ideas", count: 3 },
      { section: "Math", domain: "Algebra", count: 1 },
    ],
  };
  const set = diagnostic.buildDiagnosticQuestionSet(bank, meta);
  assert.equal(set.length, 4);
  assert.equal(new Set(set.map((item) => item.id)).size, 4);
  assert.equal(set.some((item) => item.id === "rejected"), false);

  const readiness = diagnostic.buildDiagnosticReadiness(bank, {
    label: "Preview",
    expectedCount: 4,
    blueprint: [
      { section: "Reading and Writing", domain: "Information and Ideas", count: 3 },
      { section: "Math", domain: "Algebra", count: 2 },
    ],
  });
  assert.equal(readiness.expectedCount, 4);
  assert.equal(readiness.selectedCount, 4);
  assert.equal(readiness.slots.length, 2);
  assert.equal(readiness.slots.find((slot) => slot.domain === "Algebra").difficultyCounts.Hard, 1);
  assert.equal(readiness.warnings.some((warning) => warning.includes("Algebra")), false);
  assert.equal(readiness.timerRequired, true);

  const officialStructure = diagnostic.officialDiagnosticStructureForMode({
    label: "Full",
    expectedCount: 98,
    modulePlan: [
      { label: "RW Module 1", section: "Reading and Writing", expectedCount: 27, timeLimitMinutes: 32, route: "standard" },
      { label: "RW Module 2", section: "Reading and Writing", expectedCount: 27, timeLimitMinutes: 32, adaptiveFromPreviousSection: true },
      { label: "Math Module 1", section: "Math", expectedCount: 22, timeLimitMinutes: 35, route: "standard" },
      { label: "Math Module 2", section: "Math", expectedCount: 22, timeLimitMinutes: 35, adaptiveFromPreviousSection: true },
    ],
  });
  assert.equal(officialStructure.totalQuestions, 98);
  assert.equal(officialStructure.totalMinutes, 134);
  assert.equal(officialStructure.moduleCount, 4);
  assert.deepEqual(officialStructure.modules[1].routeChoices, ["easy", "standard", "hard"]);

  const moduleSet = diagnostic.buildDiagnosticModuleSet(
    bank,
    { section: "Math", expectedCount: 2, blueprint: [{ section: "Math", domain: "Algebra", count: 2 }] },
    "hard",
    ["math-alg-medium"],
  );
  assert.deepEqual(moduleSet.map((item) => item.id), ["math-alg-hard-grid", "math-alg-easy"]);

  assert.equal(diagnostic.routeForNextModule([{ section: "Math", correct: 8, total: 10 }], { section: "Math", adaptiveFromPreviousSection: true }), "hard");
  assert.equal(diagnostic.routeForNextModule([{ section: "Math", correct: 4, total: 10 }], { section: "Math", adaptiveFromPreviousSection: true }), "easy");
  assert.equal(diagnostic.routeForNextModule([{ section: "Math", correct: 5, total: 10 }], { section: "Math", adaptiveFromPreviousSection: true }), "standard");
  assert.equal(diagnostic.routeForNextModule([{ section: "Math", correct: 8, total: 10, timedOut: true }], { section: "Math", adaptiveFromPreviousSection: true }), "standard");
  assert.equal(diagnostic.routeForNextModule([], { section: "Math", route: "standard" }), "standard");
  assert.equal(diagnostic.moduleReadinessBand({ correct: 9, total: 10 }), "accelerate");
  assert.equal(diagnostic.moduleReadinessBand({ correct: 8, total: 10, timedOut: true }), "pacing-risk");

  const current = {
    moduleIndex: 1,
    activeRoute: "hard",
    questionIds: ["math-alg-medium", "math-alg-hard-grid"],
    answers: [
      { questionId: "math-alg-medium", correct: true },
      { questionId: "math-alg-hard-grid", correct: false },
    ],
  };
  const moduleSummary = diagnostic.summarizeCurrentPretestModule(current, { label: "Math Module 2", section: "Math" }, { completedAt: "2026-05-17T00:00:00.000Z" });
  assert.equal(moduleSummary.accuracy, 50);
  assert.equal(moduleSummary.route, "hard");

  const questionMap = new Map(bank.map((item) => [item.id, item]));
  const pretest = {
    id: "pretest-1",
    mode: "preview",
    label: "Preview",
    startedAt: "2026-05-17T00:00:00.000Z",
    answers: [
      { questionId: "rw-info-easy", selectedAnswer: "A", correct: true },
      { questionId: "math-alg-hard-grid", selectedAnswer: "5", correct: false, moduleLabel: "Math Module 2", adaptiveRoute: "hard" },
    ],
    adaptiveRoutes: [{ label: "Math Module 2", route: "hard" }],
    moduleResults: [moduleSummary],
    totalTimeLimitSeconds: 134 * 60,
  };
  const summary = diagnostic.summarizeDiagnostic(pretest, {
    difficultyWeight: core.difficultyWeight,
    estimateSectionScore: core.estimateSectionScore,
    estimateSectionScoreBand: core.estimateSectionScoreBand,
    getCorrectAnswerLabel: (q) => String(q?.correctAnswer || ""),
    getQuestionById: (id) => questionMap.get(id),
    nowIso: "2026-05-17T01:00:00.000Z",
    testModeMeta: { preview: { label: "Preview" } },
  });
  assert.equal(summary.total, 2);
  assert.equal(summary.correct, 1);
  assert.equal(summary.scoreScope, "composite");
  assert.equal(summary.scoreBand.label.includes("-"), true);
  assert.equal(summary.sectionScoreBands.Math.confidence, "low");
  assert.equal(summary.sectionsTested.length, 2);
  assert.equal(summary.reviewItems[1].correctAnswer, "7");
  assert.equal(summary.timeLimitSeconds, 134 * 60);
  assert.equal(summary.timerRequired, true);
  assert.equal(summary.moduleResults.length, 1);
  assert.equal(summary.adaptiveInsights.version, "diagnostic-v2");
  assert.equal(summary.adaptiveInsights.moduleInsights[0].readinessBand, "unstable");
  assert.equal(summary.adaptiveInsights.roadmapSeeds.length >= 1, true);
  assert.equal(summary.adaptiveInsights.weakestSubskill.source, "diagnostic_v2");
  assert.deepEqual(summary.adaptiveInsights.refreshTriggers.slice(0, 2), ["diagnostic_or_full_test", "ten_practice_attempts"]);
  assert.match(summary.adaptiveInsights.nextAction, /Math/);
}

run();
console.log("diagnostic_engine_unit_tests: pass");
