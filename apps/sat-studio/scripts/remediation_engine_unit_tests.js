const assert = require("node:assert/strict");
const remediation = require("../sat_remediation_engine.js");

function run() {
  const question = {
    id: "q1",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
  };

  assert.equal(
    remediation.remediationActionFor("knowledge_gap", question),
    "Read the mini lesson, then do 3 scaffold questions in Linear equations in one variable.",
  );
  assert.equal(remediation.remediationActionFor("unknown", question), "Review the explanation, save a note, then retry Linear equations in one variable.");
  assert.equal(remediation.isHighPriorityAttempt({ correct: false }), true);
  assert.equal(remediation.isHighPriorityAttempt({ correct: true, errorType: "knowledge_gap" }), true);
  assert.equal(remediation.isHighPriorityAttempt({ correct: true, errorType: "careless" }), false);
  assert.equal(remediation.normalizeAttemptErrorType({ correct: false, selectedAnswer: "" }), "skipped");
  assert.equal(remediation.reviewDelayDaysForAttempt({ difficulty: "Medium" }, { correct: false, errorType: "trap_answer" }), 2);
  assert.equal(remediation.reviewDelayDaysForAttempt({ difficulty: "Hard" }, { correct: false, errorType: "trap_answer" }), 3);
  assert.equal(remediation.reviewDelayDaysForAttempt({ domain: "Advanced Math" }, { correct: false, errorType: "calculation" }), 3);
  assert.equal(remediation.reviewDelayDaysForAttempt(question, { correct: true, practiceMode: "Remediation Proof" }), 7);
  assert.equal(remediation.reviewDelayDaysForAttempt(question, { correct: true, practiceMode: "Maintenance Spiral" }), 14);

  const diagnosis = remediation.tutorDiagnosisForAttempt(
    question,
    { selectedAnswer: "A", correct: false, errorType: "calculation" },
    {
      getKnowledgeReviewLesson: () => ({ title: "Review: Linear equations" }),
      getCorrectAnswerLabel: () => "B",
    },
  );
  assert.equal(diagnosis.label, "Math execution slip");
  assert.equal(diagnosis.teachFirst, "Review: Linear equations");
  assert.match(diagnosis.proofTarget, /clean-number variant/);
  assert.equal(diagnosis.evidence.selectedAnswer, "A");
  assert.equal(diagnosis.evidence.correctAnswer, "B");

  const tutorLayer = remediation.buildTutorExplanationLayer(
    {
      ...question,
      choices: { A: "Use 2x instead of x.", B: "Solve for x." },
      correctAnswer: "B",
      explanation: {
        correct: "Solving the equation gives x = 9, so B is correct.",
        distractors: { A: "Choice A stops at an intermediate value instead of the requested value of x." },
      },
    },
    { selectedAnswer: "A", correct: false, errorType: "trap_answer" },
    {
      getKnowledgeReviewLesson: () => ({ title: "Review: Linear equations" }),
      getCorrectAnswerLabel: () => "B",
      chooseProofQuestionForAttempt: () => ({ id: "proof-2" }),
      lessonScopeKey: () => "canonical:math-linear-equations",
    },
  );
  assert.equal(tutorLayer.version, "tutor-explanation-v2-2026-05-25");
  assert.equal(tutorLayer.provider.interface, "TutorExplanationProvider");
  assert.equal(tutorLayer.provider.apiReady, true);
  assert.equal(tutorLayer.provider.outputVersion, "tutor-explanation-output-v2");
  assert.equal(tutorLayer.errorLabel, "Trap answer");
  assert.match(tutorLayer.choiceAnalysis.selectedRationale, /intermediate value/);
  assert.equal(tutorLayer.hintPolicy.mode, "progressive_disclosure");
  assert.equal(tutorLayer.hintSteps.length, 4);
  assert.equal(tutorLayer.hintSteps[0].id, "task");
  assert.equal(tutorLayer.hintSteps[3].id, "full_solution");
  assert.match(tutorLayer.selectedTrapCoaching.whyWrong, /intermediate value/);
  assert.equal(tutorLayer.lesson.key, "canonical:math-linear-equations");
  assert.equal(tutorLayer.proof.questionId, "proof-2");

  const now = new Date("2026-05-17T00:00:00.000Z");
  const high = remediation.buildAttemptRemediation(
    question,
    { id: "a1", correct: false, errorType: "calculation" },
    {
      now,
      getKnowledgeReviewLesson: () => ({ title: "Review: Linear equations" }),
      chooseProofQuestionForAttempt: () => ({ id: "proof-1" }),
      lessonScopeKey: () => "canonical:math-linear-equations",
    },
  );
  assert.equal(high.id, "remediation-a1");
  assert.equal(high.lessonKey, "canonical:math-linear-equations");
  assert.equal(high.proofQuestionId, "proof-1");
  assert.equal(high.dueAt, "2026-05-18T00:00:00.000Z");
  assert.equal(high.tutorDiagnosis.label, "Math execution slip");
  assert.equal(high.proofRule, "Pass a clean-number variant in Linear equations in one variable under target time.");
  assert.equal(high.remediationV2.version, "remediation-v2-2026-05-19");
  assert.equal(high.remediationV2.lesson.key, "canonical:math-linear-equations");
  assert.equal(high.scaffoldDrill.kind, "clean_number_drill");
  assert.equal(high.passCondition.pacingFlagNot, "slow_correct");
  assert.equal(high.failAction.route, "deeper_lesson");
  assert.equal(high.tutorExplanationLayer.provider.mode, "local_rule_based");
  assert.equal(high.tutorExplanationLayer.errorLabel, "Math execution slip");
  assert.ok(high.priorityScore > 0);

  const low = remediation.buildAttemptRemediation(
    question,
    { id: "a2", correct: true, pacingFlag: "marked" },
    {
      now,
      getKnowledgeReviewLesson: () => ({ title: "Review: Linear equations" }),
    },
  );
  assert.equal(low.dueAt, "2026-05-20T00:00:00.000Z");
  assert.equal(low.action, "Write what felt uncertain, then do one transfer question.");

  const proofQuestion = { id: "proof-1", section: "Math", domain: "Algebra", skill: "Linear equations in one variable", difficulty: "Medium" };
  const profile = {
    attempts: [
      {
        id: "a3",
        questionId: "q1",
        selectedAnswer: "A",
        correct: false,
        errorType: "calculation",
        taggedBy: "parent-1",
        taggedByRole: "parent",
        taggedAt: "2026-05-16T00:05:00.000Z",
        tagSource: "parent_admin_review",
        at: "2026-05-16T00:00:00.000Z",
        remediation: {
          status: "reviewed",
          assignedAt: "2026-05-16T00:00:00.000Z",
          dueAt: "2026-05-17T00:00:00.000Z",
          lessonTitle: "Review: Linear equations",
          proofQuestionId: "proof-1",
        },
      },
      {
        id: "a4",
        questionId: "q1",
        selectedAnswer: "B",
        correct: true,
        markedForReview: true,
        at: "2026-05-17T00:00:00.000Z",
        remediation: {
          status: "proof_passed",
          dueAt: "2026-05-18T00:00:00.000Z",
        },
      },
    ],
    lessonProgress: {
      "Math|Algebra|Linear equations in one variable": {
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations in one variable",
        status: "assigned",
        assignedAt: "2026-05-17T00:00:00.000Z",
        dueAt: "2026-05-19T00:00:00.000Z",
      },
    },
  };
  const helpers = {
    getQuestionById: (id) => (id === "q1" ? question : id === "proof-1" ? proofQuestion : null),
    getCorrectAnswerLabel: () => "B",
    getKnowledgeReviewLesson: () => ({ title: "Review: Linear equations" }),
    hasLaterProofAttempt: () => false,
    lessonScopeKey: (scope) => `${scope?.section}|${scope?.domain}|${scope?.skill}`,
  };
  const dueQueue = remediation.buildAdaptiveRemediationQueue(
    {
      profile,
      visibleQuestions: [proofQuestion],
      includeFuture: false,
      includePassed: false,
      limit: 10,
      nowMs: Date.parse("2026-05-17T12:00:00.000Z"),
    },
    helpers,
  );
  assert.equal(dueQueue.length, 1);
  assert.equal(dueQueue[0].status, "proof_due");
  assert.equal(dueQueue[0].proofQuestionId, "proof-1");
  assert.equal(dueQueue[0].taggedBy, "parent-1");
  assert.equal(dueQueue[0].taggedByRole, "parent");
  assert.equal(dueQueue[0].tagSource, "parent_admin_review");
  assert.equal(dueQueue[0].tutorDiagnosis.label, "Math execution slip");
  assert.match(dueQueue[0].tutorDiagnosis.studentPrompt, /separate line/);

  const futureQueue = remediation.buildAdaptiveRemediationQueue(
    {
      profile,
      visibleQuestions: [proofQuestion],
      includeFuture: true,
      includePassed: true,
      limit: 10,
      nowMs: Date.parse("2026-05-17T12:00:00.000Z"),
    },
    helpers,
  );
  assert.deepEqual(futureQueue.map((row) => row.status), ["proof_due", "lesson_scheduled", "proof_passed"]);
  assert.equal(futureQueue[0].remediationV2.state, "proof_due");
  assert.equal(futureQueue[0].scaffoldDrill.kind, "clean_number_drill");
  assert.equal(futureQueue[1].remediationV2.lesson.key, "Math|Algebra|Linear equations in one variable");

  const failedProfile = {
    attempts: [
      {
        id: "a5",
        questionId: "q1",
        selectedAnswer: "A",
        correct: false,
        errorType: "knowledge_gap",
        at: "2026-05-16T00:00:00.000Z",
        remediation: {
          status: "proof_failed",
          assignedAt: "2026-05-16T00:00:00.000Z",
          dueAt: "2026-05-17T00:00:00.000Z",
          proofQuestionId: "proof-1",
          proofFailedAt: "2026-05-17T00:30:00.000Z",
          failedProofQuestionId: "proof-1",
        },
      },
    ],
  };
  const failedQueue = remediation.buildAdaptiveRemediationQueue(
    {
      profile: failedProfile,
      visibleQuestions: [proofQuestion],
      includeFuture: false,
      includePassed: false,
      limit: 10,
      nowMs: Date.parse("2026-05-17T12:00:00.000Z"),
    },
    helpers,
  );
  assert.equal(failedQueue.length, 1);
  assert.equal(failedQueue[0].status, "lesson_due");
  assert.equal(failedQueue[0].remediationV2.state, "proof_failed");
  assert.equal(failedQueue[0].failedProofQuestionId, "proof-1");
  assert.equal(failedQueue[0].failAction.route, "deeper_lesson");
}

run();
console.log("remediation_engine_unit_tests: pass");
