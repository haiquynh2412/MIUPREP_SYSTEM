const assert = require("node:assert/strict");
const practice = require("../sat_practice_engine.js");

function run() {
  const easyMath = { section: "Math", difficulty: "Easy", skill: "Linear equations" };
  const hardRw = { section: "Reading and Writing", difficulty: "Hard", skill: "Cross-text Connections" };

  assert.equal(practice.targetSecondsForQuestion(easyMath), 77);
  assert.equal(practice.targetSecondsForQuestion(hardRw), 98);
  assert.equal(practice.pacingFlagFor(easyMath, true, 130), "slow_correct");
  assert.equal(practice.pacingFlagFor(easyMath, false, 10), "fast_wrong");
  assert.equal(practice.pacingFlagFor(easyMath, false, 140), "time_pressure");
  assert.equal(practice.pacingFlagFor(easyMath, true, 60), "");
  assert.equal(practice.pacingLabel("slow_correct"), "Correct but slow");
  assert.equal(practice.pacingLabel("unknown"), "On pace");
  assert.equal(practice.shouldRequireAttemptEvidence(hardRw), true);
  assert.equal(practice.shouldRequireAttemptEvidence(easyMath), false);
  assert.equal(practice.attemptEvidenceCopy(easyMath, { language: "en", required: true }).summary, "Required proof note");

  assert.deepEqual(practice.countValues(["A", "A", "", null, "B"]), { A: 2, Unknown: 2, B: 1 });

  const wrongAttempt = practice.buildAttemptRecord(
    { id: "q1", section: "Math", domain: "Algebra", skill: "Linear equations" },
    "B",
    false,
    false,
    { timeSpentSeconds: 45 },
    {
      id: "attempt-fixed",
      now: new Date("2026-05-18T00:00:00.000Z"),
      account: { id: "student-1" },
      suggestErrorType: () => "calculation",
    },
  );
  assert.equal(wrongAttempt.id, "attempt-fixed");
  assert.equal(wrongAttempt.dueAt, "2026-05-19T00:00:00.000Z");
  assert.equal(wrongAttempt.errorType, "calculation");
  assert.equal(wrongAttempt.taggedBy, "system");
  assert.equal(wrongAttempt.accountId, "student-1");
  assert.equal(wrongAttempt.remediationAttemptId, "");
  assert.equal(wrongAttempt.learningEvidence.status, "optional_empty");
  assert.equal(wrongAttempt.helpTelemetry.independentAttempt, true);
  assert.equal(wrongAttempt.hintUsed, false);

  const proofAttempt = practice.buildAttemptRecord(
    { id: "proof-1", section: "Math", domain: "Algebra", skill: "Linear equations" },
    "A",
    true,
    false,
    {
      remediationAttemptId: "attempt-fixed",
      remediationLessonTaskKey: "Math|Algebra|Linear equations",
      learningEvidence: {
        firstMove: "Solve for x first.",
        studentWork: "2x = 8, so x = 4.",
        evidenceCitation: "Substitution checks.",
        helpTelemetry: { hintUsed: true, hintCount: 2, helpTiming: "pre_submit", source: "progressive_hint" },
      },
    },
    { id: "attempt-proof", now: new Date("2026-05-18T00:10:00.000Z") },
  );
  assert.equal(proofAttempt.remediationAttemptId, "attempt-fixed");
  assert.equal(proofAttempt.remediationLessonTaskKey, "Math|Algebra|Linear equations");
  assert.equal(proofAttempt.learningEvidence.required, true);
  assert.equal(proofAttempt.learningEvidence.status, "provided");
  assert.equal(proofAttempt.learningEvidence.proofQuality, "supports_correct");
  assert.equal(proofAttempt.helpTelemetry.hintUsed, true);
  assert.equal(proofAttempt.helpTelemetry.hintCount, 2);
  assert.equal(proofAttempt.independentAttempt, false);

  const postSubmitHelp = practice.mergeHelpTelemetry(proofAttempt.helpTelemetry, {
    fullSolutionViewed: true,
    helpTiming: "post_submit",
  });
  assert.equal(postSubmitHelp.helpTiming, "pre_submit");
  assert.equal(postSubmitHelp.fullSolutionViewed, true);

  const hardMissingEvidence = practice.buildAttemptRecord(
    { id: "q-hard", section: "Reading and Writing", difficulty: "Hard", skill: "Command of Evidence" },
    "C",
    false,
    false,
    {},
    { id: "attempt-hard", now: new Date("2026-05-18T00:15:00.000Z") },
  );
  assert.equal(hardMissingEvidence.learningEvidence.required, true);
  assert.equal(hardMissingEvidence.learningEvidence.status, "missing");

  const slowCorrectAttempt = practice.buildAttemptRecord(
    { id: "q2", section: "Math", domain: "Algebra", skill: "Linear equations" },
    "A",
    true,
    false,
    { errorType: "slow_correct", pacingFlag: "slow_correct" },
    { id: "attempt-slow", now: new Date("2026-05-18T00:00:00.000Z") },
  );
  assert.equal(slowCorrectAttempt.errorType, "slow_correct");
  assert.equal(slowCorrectAttempt.taggedBy, "");
  assert.equal(slowCorrectAttempt.dueAt, "2026-05-19T00:00:00.000Z");
  assert.equal(practice.reviewDelayDaysForAttempt({ difficulty: "Hard" }, false, { errorType: "trap_answer" }, "trap_answer"), 3);
  assert.equal(practice.reviewDelayDaysForAttempt({ domain: "Advanced Math" }, false, { errorType: "calculation" }, "calculation"), 3);
  assert.equal(practice.reviewDelayDaysForAttempt({ difficulty: "Medium" }, false, { errorType: "trap_answer" }, "trap_answer"), 2);
  assert.equal(practice.reviewDelayDaysForAttempt({ difficulty: "Medium" }, true, { practiceMode: "Remediation Proof" }, ""), 7);
  assert.equal(practice.reviewDelayDaysForAttempt({ difficulty: "Medium" }, true, { practiceMode: "Maintenance Spiral" }, ""), 14);

  const rows = [
    {
      section: "Math",
      domain: "Algebra",
      skill: "Linear equations",
      attempted: true,
      correct: false,
      pacingFlag: "",
      errorType: "calculation",
      timeSpentSeconds: 90,
      markedForReview: false,
      masteryStage: "Foundation repair",
    },
    {
      section: "Math",
      domain: "Algebra",
      skill: "Linear equations",
      attempted: true,
      correct: true,
      pacingFlag: "slow_correct",
      errorType: "",
      timeSpentSeconds: 150,
      markedForReview: true,
      masteryStage: "Foundation repair",
    },
    {
      section: "Reading and Writing",
      domain: "Craft and Structure",
      skill: "Words in Context",
      attempted: false,
      correct: false,
      pacingFlag: "skipped",
      errorType: "skipped",
      timeSpentSeconds: 0,
      markedForReview: false,
      masteryStage: "Collect evidence",
    },
  ];

  const groups = practice.buildSessionSkillGroups(rows, { masteryStageExit: (stage) => `Exit ${stage}.` });
  assert.equal(groups[0].skill, "Linear equations");
  assert.equal(groups[0].wrong, 1);
  assert.equal(groups[0].slow, 1);
  assert.equal(groups[0].marked, 1);
  assert.equal(groups[0].avgSeconds, 120);
  assert.equal(groups[1].skipped, 1);

  const rowRecommendation = practice.sessionRowRecommendation({
    question: { difficulty: "Medium" },
    attempt: { correct: false },
    mastery: { masteryStage: "Foundation repair" },
    errorType: "calculation",
    pacingFlag: "",
    helpers: {
      errorTagLabel: (value) => `Error ${value}`,
      masteryStageExit: (stage) => `Exit ${stage}.`,
    },
  });
  assert.equal(rowRecommendation, "Error calculation: Exit Foundation repair.");

  assert.equal(
    practice.sessionRowRecommendation({
      question: { difficulty: "Hard" },
      attempt: { correct: true },
      mastery: { masteryStage: "Hard transfer" },
      errorType: "",
      pacingFlag: "",
    }),
    "Hard proof passed: keep this skill in timed maintenance.",
  );

  const plan = practice.buildSessionCoachPlan({
    rows,
    skillGroups: groups,
    mistakeLedger: [{ errorType: "calculation", lessonTitle: "Review: Algebra", remediationAction: "Redo algebra." }],
    issueCounts: { marked: 1 },
  });
  assert.equal(plan.mainError, "calculation");
  assert.equal(plan.summary.includes("skipped item"), true);
  assert.equal(plan.weeklyPlan.length, 3);
  assert.equal(plan.nextBestAction.startsWith("Linear equations:"), true);

  assert.equal(
    practice.coachSummaryForSession({ wrongRows: [{}, {}], slowRows: [], skippedRows: [], issueCounts: {} }),
    "2 wrong items: teach before retest, then prove on new context.",
  );

  const remedialSprint = practice.buildSprintPrescription({
    phase: { id: "remedial_drill" },
    remediationQueue: [{ section: "Math", domain: "Algebra", skill: "Linear equations" }],
    dueReviewCount: 2,
  });
  assert.equal(remedialSprint.mode, "Remedial Sprint");
  assert.equal(remedialSprint.count, 10);
  assert.equal(remedialSprint.proofRequired, true);
  assert.equal(remedialSprint.target.skill, "Linear equations");
  assert.ok(remedialSprint.routingBias.includes("same_error_type"));
  assert.ok(remedialSprint.closedLoop.includes("refresh_roadmap"));

  const crucibleSprint = practice.buildSprintPrescription({
    phase: { id: "crucible_1500" },
    skillRows: [{ section: "Reading and Writing", domain: "Craft and Structure", skill: "Cross-text Connections", mastery: 82 }],
    targetScore: 1600,
    readiness: { score: 75 },
  });
  assert.equal(crucibleSprint.mode, "1500+ Crucible");
  assert.equal(crucibleSprint.difficulty, "Hard only");
  assert.ok(crucibleSprint.exitRule.includes("3 hard timed fresh proof"));

  const diagnosticSprint = practice.buildSprintPrescription({ phase: { id: "diagnostic_baseline" } });
  assert.equal(diagnosticSprint.count, 20);
  assert.equal(diagnosticSprint.proofRequired, false);
}

run();
console.log("practice_engine_unit_tests: pass");
