const assert = require("node:assert/strict");
const roadmap = require("../sat_roadmap_engine.js");

function run() {
  assert.equal(roadmap.averageNumber([10, "20", "bad"]), 15);
  assert.equal(roadmap.clampNumber(-5, 0, 10), 0);
  assert.equal(roadmap.readinessBand(90), "1600 training ready");

  const target = roadmap.practiceTargetFromSummary({ label: "Algebra", domain: "Math" }, { skill: "Linear equations" });
  assert.deepEqual(target, {
    label: "Linear equations",
    section: "All",
    domain: "Math",
    skill: "Linear equations",
    difficulty: "All",
    source: "All",
  });

  const unique = roadmap.uniquePracticeTargets([
    { section: "Math", domain: "Algebra", skill: "Linear equations" },
    { section: "Math", domain: "Algebra", skill: "Linear equations" },
    { section: "Math", domain: "Advanced Math", skill: "Quadratics" },
  ]);
  assert.equal(unique.length, 2);
  assert.equal(unique[0].label, "Linear equations");

  const diagnosticRoadmap = roadmap.buildDiagnosticRoadmap({
    byDomain: {
      Algebra: { label: "Algebra", total: 5, correct: 2, weightedTotal: 5, weightedCorrect: 2 },
      Data: { label: "Problem-Solving and Data Analysis", total: 5, correct: 5, weightedTotal: 5, weightedCorrect: 5 },
    },
    bySkill: {
      Linear: { label: "Linear equations", domain: "Algebra", total: 3, correct: 1, weightedTotal: 3, weightedCorrect: 1 },
    },
  });
  assert.equal(diagnosticRoadmap[0].title, "Stabilize Algebra");
  assert.equal(diagnosticRoadmap[0].targets[0].skill, "Linear equations");

  const roadmapV2 = roadmap.buildRoadmapV2({
    diagnostic: {
      adaptiveInsights: {
        weakModules: [{ label: "Math Module 1", section: "Math", readinessBand: "unstable", rationale: "Math Module 1 needs repair." }],
        weakSkills: [{ label: "Quadratics", section: "Math", domain: "Advanced Math", weightedAccuracy: 0.4 }],
        nextAction: "Retest Math after lesson proof.",
      },
    },
    skillRows: [{ skill: "Linear equations", section: "Math", domain: "Algebra", status: "Practice", mastery: 55, action: "Lesson first" }],
    remediationQueue: [
      {
        skill: "Transitions",
        section: "Reading and Writing",
        domain: "Expression of Ideas",
        assignedAt: "2026-05-16T00:00:00.000Z",
        dueAt: "2026-05-17T00:00:00.000Z",
        proofQuestionId: "proof-transition-1",
        taggedBy: "parent-1",
        taggedByRole: "parent",
        tagSource: "parent_admin_review",
        tutorDiagnosis: { rootCause: "Transition logic is unstable.", proofTarget: "Pass a contrast/result item.", reviewCadence: "Review today." },
      },
    ],
    profile: {
      roadmapLastBuiltAt: "2026-05-15T00:00:00.000Z",
      attempts: Array.from({ length: 10 }, (_, index) => ({ id: `p${index}`, at: `2026-05-16T00:0${index % 10}:00.000Z`, correct: true })),
    },
    nowIso: "2026-05-17T00:00:00.000Z",
    targetScore: 1550,
  });
  assert.equal(roadmapV2[0].title, "Tutor Brain: relearn Transitions");
  assert.equal(roadmapV2[0].roadmapV2.assignedBy, "parent-1");
  assert.equal(roadmapV2[0].roadmapV2.assignedByRole, "parent");
  assert.equal(roadmapV2[0].roadmapV2.proofQuestionId, "proof-transition-1");
  assert.equal(roadmapV2[0].roadmapV2.learningLoop.map((item) => item.stage).join(">"), "diagnostic>lesson>scaffold>proof>timed_sprint>exam_review>refresh");
  assert.ok(roadmapV2[0].roadmapV2.refreshTriggers.some((trigger) => trigger.id === "ten_practice_attempts" && trigger.active));
  assert.equal(roadmapV2[1].actionType, "diagnostic_module_repair");
  assert.ok(roadmapV2.some((step) => step.title.includes("Retest")));

  const refreshSignals = roadmap.roadmapRefreshSignals({
    profile: {
      roadmapLastBuiltAt: "2026-05-10T00:00:00.000Z",
      attempts: [
        { id: "proof-pass", at: "2026-05-11T00:00:00.000Z", correct: true, practiceMode: "Remediation Proof" },
        { id: "proof-fail", at: "2026-05-12T00:00:00.000Z", correct: false, practiceMode: "Remediation Proof" },
      ],
    },
    latest: { completedAt: "2026-05-13T00:00:00.000Z" },
  });
  assert.equal(refreshSignals.find((signal) => signal.id === "diagnostic_or_full_test").active, true);
  assert.equal(refreshSignals.find((signal) => signal.id === "proof_passed").active, true);
  assert.equal(refreshSignals.find((signal) => signal.id === "proof_failed").active, true);

  const lowConfidence = roadmap.roadmapDataConfidence({});
  assert.equal(lowConfidence.label, "Low");
  const highConfidence = roadmap.roadmapDataConfidence({
    latest: { total: 98 },
    practiceAttempts: 45,
    taggedErrors: 15,
    skillRows: Array.from({ length: 5 }, (_, index) => ({ skill: `Skill ${index}`, attempts: 5 })),
  });
  assert.equal(highConfidence.label, "High");
  assert.equal(highConfidence.score, 10);

  const attempts = [
    { at: "2026-05-10T00:00:00.000Z", correct: false, errorType: "calculation" },
    { at: "2026-05-12T00:00:00.000Z", correct: false, errorType: "calculation" },
    { at: "2026-05-13T00:00:00.000Z", correct: false, errorType: "careless", fromPretest: true },
    { at: "2026-05-15T00:00:00.000Z", correct: true },
  ];
  assert.equal(roadmap.practiceAttemptsSinceRoadmapBuild({ roadmapLastBuiltAt: "2026-05-11T00:00:00.000Z", attempts }), 2);
  assert.deepEqual(roadmap.topAttemptErrorSummary(attempts, { errorTagLabel: (value) => `Label ${value}` }), {
    type: "calculation",
    count: 2,
    label: "Label calculation",
  });

  const evaluation = roadmap.buildRoadmapEvaluation({
    profile: {
      roadmapLastBuiltAt: "2026-05-01T00:00:00.000Z",
      attempts,
      studyNotes: [],
    },
    latest: { total: 20, scoreEstimate: 1320, completedAt: "2026-05-01T00:00:00.000Z" },
    targetScore: 1500,
    now: Date.parse("2026-05-17T00:00:00.000Z"),
    skillRows: [
      { skill: "Linear equations", status: "Practice", mastery: 55, attempts: 4, action: "Untimed drill", dominantErrorType: "calculation" },
      { skill: "Cross-text", status: "Mastered", mastery: 90, attempts: 7, action: "Maintain", dominantErrorType: "none" },
    ],
    roadmap: [{ title: "Existing" }],
    errorTagLabel: (value) => `Error ${value}`,
  });
  assert.equal(evaluation.baseline, 1320);
  assert.equal(evaluation.gap, 180);
  assert.equal(evaluation.weakCount, 1);
  assert.equal(evaluation.masteredCount, 1);
  assert.equal(evaluation.priorityRows[0].skill, "Linear equations");
  assert.equal(evaluation.topError.label, "Error calculation");
  assert.ok(evaluation.risks.some((risk) => risk.includes("Diagnostic is more than 14 days old")));

  const coverage = roadmap.buildEliteCoverage(
    [
      { section: "Reading and Writing", skill: "Cross-text Connections", prompt: "Text 1 says..." },
      { section: "Reading and Writing", skill: "Rhetorical synthesis", prompt: "Student notes..." },
      { section: "Math", domain: "Advanced Math", difficulty: "Hard", questionType: "student_produced_response", skill: "Quadratics" },
      { section: "Math", domain: "Problem-Solving and Data Analysis", difficulty: "Medium", skill: "Probability" },
    ],
    { isGridInQuestion: (question) => question.questionType === "student_produced_response" },
  );
  assert.equal(coverage.checks.find((item) => item.label === "Cross-text RW").count, 1);
  assert.equal(coverage.checks.find((item) => item.label === "Hard Math / grid-in").count, 1);
  assert.equal(coverage.thin.length, 5);

  const readiness = roadmap.buildEliteReadiness({
    skillRows: [
      { skill: "Linear equations", mastery: 60 },
      { skill: "Words in Context", mastery: 80 },
    ],
    evaluation: {
      taggedErrors: 4,
      priorityRows: [{ skill: "Linear equations", action: "Lesson first" }],
    },
    latest: { scoreEstimate: 1450 },
    attempts: [
      { questionId: "hard1", correct: true },
      { questionId: "hard2", correct: false },
    ],
    pretests: [{ mode: "full", timeLimitSeconds: 3600, timedOut: false }],
    visibleStudyQuestions: [
      { section: "Reading and Writing", skill: "Cross-text Connections", prompt: "Text 1..." },
      { section: "Math", domain: "Advanced Math", difficulty: "Hard", questionType: "student_produced_response", skill: "Quadratics" },
    ],
    allQuestions: [
      { id: "hard1", difficulty: "Hard" },
      { id: "hard2", difficulty: "Hard" },
    ],
    dueReviewCount: 2,
    externalStudyLogs: [{ minutes: 45 }],
  });
  assert.equal(readiness.hardAttempts, 2);
  assert.equal(readiness.hardAccuracy, 50);
  assert.equal(readiness.fullDiagnostics, 1);
  assert.ok(readiness.missions.some((mission) => mission.title === "Clear the mistake queue"));

  const plan = roadmap.buildSevenDayStudyPlan({
    latest: null,
    evaluation: {
      attemptsSinceBuild: 11,
      priorityRows: [{ skill: "Linear equations", action: "Lesson first" }],
    },
    readiness,
    remediationQueue: [{ skill: "Quadratics", lessonTitle: "Review Quadratics", action: "Redo factoring." }],
    today: new Date("2026-05-17T00:00:00.000Z"),
  });
  assert.equal(plan.length, 7);
  assert.equal(plan[0].date, "2026-05-17");
  assert.equal(plan[0].focus, "Diagnostic baseline");
  assert.equal(plan[0].priority, "critical");
  assert.equal(plan[6].focus, "Parent review + rebuild");
  assert.equal(plan[6].targetView, "roadmap");

  const remediationFirstPlan = roadmap.buildSevenDayStudyPlan({
    latest: { scoreEstimate: 1400 },
    evaluation: { priorityRows: [{ skill: "Words in Context", action: "Vocab review" }] },
    readiness,
    remediationQueue: [{ skill: "Transitions", lessonTitle: "Review Transitions", action: "Choose contrast/result signals." }],
    today: new Date("2026-05-17T00:00:00.000Z"),
  });
  assert.equal(remediationFirstPlan[0].focus, "Review Transitions");
  assert.equal(remediationFirstPlan[0].targetView, "review");

  const closedLoopRemedial = roadmap.buildClosedLoopTrainingPlan({
    latest: { scoreEstimate: 1410, completedAt: "2026-05-16T00:00:00.000Z" },
    evaluation,
    readiness: { ...readiness, dueReviewCount: 1 },
    remediationQueue: [{ section: "Math", domain: "Advanced Math", skill: "Quadratics", status: "open" }],
    skillRows: [{ section: "Math", domain: "Advanced Math", skill: "Quadratics", status: "Practice", mastery: 62 }],
    profile: { roadmapLastBuiltAt: "2026-05-15T00:00:00.000Z", attempts: [] },
    targetScore: 1600,
    today: new Date("2026-05-17T00:00:00.000Z"),
  });
  assert.equal(closedLoopRemedial.phase.id, "remedial_drill");
  assert.equal(closedLoopRemedial.sprint.mode, "Remedial Sprint");
  assert.equal(closedLoopRemedial.phases.find((phase) => phase.id === "diagnostic_baseline").status, "done");
  assert.equal(closedLoopRemedial.phases.find((phase) => phase.id === "remedial_drill").status, "current");
  assert.equal(closedLoopRemedial.loop.map((item) => item.stage).join(">"), "diagnostic>sprint>review>lesson>proof>spaced_repetition>refresh");
  assert.equal(closedLoopRemedial.implementationStatus.find((item) => item.id === "irt_live_calibration").status, "pending");

  const closedLoopDiagnostic = roadmap.buildClosedLoopTrainingPlan({
    latest: null,
    evaluation: { priorityRows: [] },
    readiness: {},
    remediationQueue: [],
    skillRows: [],
    targetScore: 1600,
    today: new Date("2026-05-17T00:00:00.000Z"),
  });
  assert.equal(closedLoopDiagnostic.phase.id, "diagnostic_baseline");
  assert.equal(closedLoopDiagnostic.sprint.count, 20);
  assert.equal(closedLoopDiagnostic.phases.find((phase) => phase.id === "remedial_drill").status, "pending");

  const closedLoopCrucible = roadmap.buildClosedLoopTrainingPlan({
    latest: { scoreEstimate: 1510 },
    evaluation: { priorityRows: [] },
    readiness: { score: 82 },
    remediationQueue: [],
    skillRows: [{ section: "Math", domain: "Advanced Math", skill: "Quadratics", status: "Practice", mastery: 88, masteryStage: "Hard transfer" }],
    targetScore: 1600,
  });
  assert.equal(closedLoopCrucible.phase.id, "crucible_1500");
  assert.equal(closedLoopCrucible.sprint.difficulty, "Hard only");
}

run();
console.log("roadmap_engine_unit_tests: pass");
