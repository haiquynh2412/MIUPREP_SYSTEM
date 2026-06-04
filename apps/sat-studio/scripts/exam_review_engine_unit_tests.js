const assert = require("node:assert/strict");
const examReview = require("../sat_exam_review_engine.js");

function run() {
  const questions = {
    q1: { id: "q1", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Medium", correctAnswer: "B" },
    q2: { id: "q2", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Hard", correctAnswer: "C" },
    q3: { id: "q3", section: "Reading and Writing", domain: "Craft and Structure", skill: "Words in Context", difficulty: "Easy", correctAnswer: "A" },
  };
  const profile = {
    bookmarks: ["q3"],
    attempts: [
      {
        id: "a1",
        questionId: "q1",
        selectedAnswer: "A",
        correct: false,
        at: "2026-05-17T01:00:00.000Z",
        dueAt: "2026-05-18T01:00:00.000Z",
        errorType: "calculation",
        pacingFlag: "",
        timeSpentSeconds: 80,
        taggedBy: "system",
        taggedAt: "2026-05-17T01:00:00.000Z",
        remediation: { status: "assigned" },
      },
      {
        id: "a2",
        questionId: "q2",
        selectedAnswer: "C",
        correct: true,
        at: "2026-05-17T01:05:00.000Z",
        errorType: "",
        pacingFlag: "slow_correct",
        timeSpentSeconds: 180,
        markedForReview: true,
      },
    ],
    errorTags: [{ attemptId: "a1", taggedAt: "2026-05-17T01:01:00.000Z", source: "system_suggested", note: "Forgot to divide." }],
  };
  const helpers = {
    profile,
    getQuestionById: (id) => questions[id] || null,
    getCorrectAnswerLabel: (question) => question?.correctAnswer || "",
    targetSecondsForQuestion: (question) => (question?.difficulty === "Hard" ? 123 : 77),
    pacingLabel: (flag) => (flag === "slow_correct" ? "Correct but slow" : flag === "skipped" ? "Skipped" : "On pace"),
    buildSkillMastery: () => [{ key: "Math|Algebra|Linear equations", masteryStage: "Foundation repair", mastery: 61 }],
    sessionRowRecommendation: ({ attempt }) => (!attempt ? "Retry under timer." : attempt.correct ? "Keep timed proof." : "Review calculation."),
    buildSessionSkillGroups: (rows) => [
      {
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations",
        total: rows.filter((row) => row.skill === "Linear equations").length,
        correct: 1,
        avgSeconds: 130,
        masteryStage: "Foundation repair",
        recommendation: "Fix calculation, then retest.",
      },
    ],
    buildSessionCoachPlan: ({ rows, issueCounts }) => ({ summary: `${rows.length} rows`, nextBestAction: `${issueCounts.wrong} wrong`, weeklyPlan: [] }),
    suggestErrorType: () => "trap_answer",
    getKnowledgeReviewLesson: () => ({ title: "Mini lesson: linear equations" }),
    hasLaterProofAttempt: (attempt) => attempt.id === "a1",
    remediationActionFor: (errorType) => `Do remediation for ${errorType}.`,
    taggerLabel: () => "system suggested",
  };

  const rows = examReview.buildSessionRows({ questionIds: ["q1", "q2", "q3"], attemptIds: ["a1", "a2"] }, helpers);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].status, "Wrong");
  assert.equal(rows[0].masteryStage, "Foundation repair");
  assert.equal(rows[1].pacingLabel, "Correct but slow");
  assert.equal(rows[2].status, "Skipped");
  assert.equal(rows[2].markedForReview, true);

  const issues = examReview.sessionIssueCounts(rows);
  assert.deepEqual(issues, { wrong: 1, skipped: 1, slowCorrect: 1, fastWrong: 0, timePressure: 0, marked: 2 });
  const pacing = examReview.buildPacingProfile(rows);
  assert.equal(pacing.label, "Accuracy too slow");
  assert.equal(pacing.overTarget, 2);
  const domains = examReview.buildDomainBreakdown(rows);
  assert.equal(domains[0].domain, "Craft and Structure");
  assert.equal(domains[0].skipped, 1);
  const priority = examReview.buildReviewPriorityQueue(rows);
  assert.equal(priority[0].questionId, "q3");
  assert.match(priority[0].reviewPriority.reason, /Skipped/);

  const ledger = examReview.buildMistakeLedger({ profile, sessionAttemptIds: ["a1", "a2"], limit: 5 }, helpers);
  assert.equal(ledger.length, 2);
  assert.equal(ledger[0].attemptId, "a2");
  assert.equal(ledger[1].lessonTitle, "Mini lesson: linear equations");
  assert.equal(ledger[1].status, "proof_passed");
  assert.equal(ledger[1].note, "Forgot to divide.");

  const report = examReview.buildPracticeSessionReport(
    {
      id: "session-1",
      mode: "5-Minute Sprint",
      startedAt: "2026-05-17T01:00:00.000Z",
      endedAt: "2026-05-17T01:10:00.000Z",
      questionIds: ["q1", "q2", "q3"],
      attemptIds: ["a1", "a2"],
      reason: "ended_by_user",
    },
    helpers,
  );
  assert.equal(report.id, "session-1");
  assert.equal(report.totalQuestions, 3);
  assert.equal(report.attempted, 2);
  assert.equal(report.correct, 1);
  assert.equal(report.accuracy, 50);
  assert.equal(report.avgSeconds, 130);
  assert.equal(report.issueCounts.skipped, 1);
  assert.equal(report.pacingProfile.onPaceRate, 0);
  assert.equal(report.domainBreakdown.length, 2);
  assert.equal(report.reviewPriorityQueue[0].questionId, "q3");
  assert.equal(report.readinessSignal.label, "Pacing block");
  assert.equal(report.skillGroups[0].recommendation, "Fix calculation, then retest.");
  assert.equal(report.coachPlan.nextBestAction, "1 wrong");

  const trimmed = examReview.trimPracticeReports(["old1", "old2"], "new", 2);
  assert.deepEqual(trimmed, ["new", "old1"]);
}

run();
console.log("exam_review_engine_unit_tests: pass");
