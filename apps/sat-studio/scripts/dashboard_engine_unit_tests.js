const assert = require("node:assert/strict");
const dashboard = require("../sat_dashboard_engine.js");

function run() {
  const profile = {
    attempts: [{ correct: true }, { correct: false }, { correct: true }],
    studyNotes: [{ starred: true }, { starred: false }],
    externalStudyLogs: [{ minutes: 20 }],
    officialLogs: [{ id: "official-1" }],
    roadmap: [{ title: "Linear equations" }],
    attendance: {
      points: 135,
      stickers: ["starter"],
      daily: {
        "2026-05-18": { attempts: 8, correct: 6, reviews: 2, externalMinutes: 10, sprintsCompleted: 1, hardCorrect: 1 },
      },
    },
    streak: { count: 4 },
    externalLinks: { khan: "https://khan.example", bluebook: "" },
  };

  const metrics = dashboard.buildMetricsModel({
    profile,
    visibleQuestions: [{ reviewStatus: "needs_review" }, { reviewStatus: "reviewed" }],
    dueCount: 3,
    baseline: 1460,
    studyQuestionCount: 200,
  });
  assert.equal(metrics.accuracyLabel, "67%");
  assert.equal(metrics.baselineLabel, "1460");
  assert.equal(metrics.needsReviewCount, 1);
  assert.equal(metrics.questionCount, 200);
  assert.equal(metrics.dueCount, 3);

  assert.equal(dashboard.buildNextActionModel({ latestPretest: null, runDiagnosticLabel: "Run diagnostic" }).kind, "pretest");
  assert.equal(dashboard.buildNextActionModel({ latestPretest: { id: "p" }, dueCount: 2 }).kind, "due_review");
  const roadmapAction = dashboard.buildNextActionModel({ latestPretest: { id: "p" }, dueCount: 0, weakSkills: [{ skill: "Boundaries" }] });
  assert.equal(roadmapAction.title, "Boundaries");
  const todayFlow = dashboard.buildTodayFlowModel({ latestPretest: { id: "p" }, dueCount: 0, weakSkills: [{ skill: "Boundaries" }], profile });
  assert.equal(todayFlow.length, 4);
  assert.equal(todayFlow[0].status, "done");
  assert.equal(todayFlow[2].status, "active");
  assert.equal(todayFlow[2].body, "Boundaries");
  const scoreLadder = dashboard.buildScoreLadderModel({ latestPretest: { scoreEstimate: 1320 }, targetScore: 1500, dueCount: 2, weakSkills: [{ skill: "Linear functions", wrong: 3 }] });
  assert.equal(scoreLadder.currentLabel, "1320");
  assert.equal(scoreLadder.pointGap, 180);
  assert.equal(scoreLadder.band, "SAT-Advanced");
  assert.equal(scoreLadder.proofCondition, "Clear 2 due reviews.");

  const loop = dashboard.buildDashboardLoopModel({
    profile,
    latestPretest: { scoreScope: "section_only", scoreEstimate: 720 },
    compositePretest: null,
    weakSkills: [{ skill: "Transitions" }],
    diagnosticScoreLabel: () => "RW 720",
  });
  assert.equal(loop[0].body, "RW 720");
  assert.equal(loop[1].body, "Focus: Transitions");
  assert.equal(loop[2].body, "2 study notes, 1 starred.");
  assert.equal(loop[4].body, "1 metadata-only official logs.");

  const rewards = dashboard.buildRewardModel({
    profile,
    rewardCatalog: [
      { id: "starter", name: "Starter", icon: "*", requirement: 20 },
      { id: "ace", name: "Ace", icon: "A", requirement: 160 },
    ],
    todayKey: "2026-05-18",
    labels: { pointsShort: "pts", unlocked: "Unlocked", pointsToUnlock: "pts left" },
  });
  assert.equal(rewards.levelLabel, "L2");
  assert.equal(rewards.progress, 35);
  assert.equal(rewards.stickerShelf[0].unlocked, true);
  assert.equal(rewards.rewardBoard[1].remaining, 25);
  assert.equal(rewards.quests[0].id, "review-3");
  assert.equal(rewards.quests[0].current, 2);
  assert.equal(rewards.quests.length, 7);
  assert.equal(rewards.quests.find((quest) => quest.id === "sprint-1").complete, true);
  assert.equal(rewards.quests.find((quest) => quest.id === "hard-correct-2").revealed, true);
  assert.equal(rewards.journeyTitle, "SAT Core Builder");

  const achievementRewards = dashboard.buildRewardModel({
    profile,
    rewardCatalog: [
      { id: "sprint", name: "Sprint", icon: "5", criteria: { sprintsCompleted: 1 } },
      { id: "secret-hard", name: "Hard", icon: "H", criteria: { hardCorrect: 2 }, revealWhen: { hardCorrect: 1 }, secret: true },
    ],
    todayKey: "2026-05-18",
  });
  assert.equal(achievementRewards.rewardBoard[0].unlocked, true);
  assert.equal(achievementRewards.rewardBoard[1].hidden, false);
  assert.equal(achievementRewards.rewardBoard[1].unlocked, false);

  const questRewards = dashboard.evaluateQuestRewards({
    attendance: {
      daily: {
        "2026-05-18": { reviews: 3, externalMinutes: 15, sprintsCompleted: 1, proofsPassed: 1, notesSaved: 1 },
      },
      questRewardsClaimed: ["2026-05-18:answer-10"],
    },
    todayKey: "2026-05-18",
  });
  assert.equal(questRewards.bonusPoints, 70);
  assert.ok(questRewards.questRewardsClaimed.includes("2026-05-18:sprint-1"));
  assert.ok(questRewards.questRewardsClaimed.includes("2026-05-18:proof-1"));
  assert.ok(questRewards.questRewardsClaimed.includes("2026-05-18:note-1"));

  const external = dashboard.buildExternalLearningModel(profile);
  assert.equal(external.khanUrl, "https://khan.example");
  assert.equal(external.bluebookUrl, "https://bluebook.collegeboard.org/students/practice");
  assert.equal(external.logs.length, 1);

  const coach = dashboard.buildCoachDashboardModel({
    account: { id: "content-admin", role: "admin" },
    students: [{ id: "student-1", name: "Student One", role: "student", targetScore: 1500, studyPlan: { nextSessionAt: "2026-05-20T10:00:00Z" } }],
    studentProfilesById: {
      "student-1": {
        attempts: [
          { id: "a1", questionId: "q1", correct: false, errorType: "trap_answer", at: "2026-05-18T00:00:00Z", dueAt: "2026-05-18T00:00:00Z", timeSpentSeconds: 88 },
          { id: "a2", questionId: "q2", correct: true, at: "2026-05-18T01:00:00Z", timeSpentSeconds: 72, remediation: { status: "proof_passed" } },
        ],
        pretests: [{ scoreEstimate: 1320, endedAt: "2026-05-17T00:00:00Z" }],
        externalStudyLogs: [{ source: "Khan Academy", topic: "Boundaries", minutes: 25, at: "2026-05-18T02:00:00Z" }],
        lessonProgress: {
          "rw|boundaries": { status: "proof_failed", proofStatus: "proof_failed", dueAt: "2026-05-18T00:00:00Z" },
        },
      },
    },
    questions: [
      { id: "q1", section: "Reading and Writing", domain: "Conventions", skill: "Boundaries", reviewStatus: "needs_review", visibility: "public_candidate", sourceType: "original" },
      { id: "q2", section: "Math", domain: "Algebra", skill: "Linear equations", reviewStatus: "reviewed", visibility: "private_family", sourceType: "ai_generated" },
      { id: "q3", reviewStatus: "reviewed", visibility: "private_family", sourceType: "private_vault" },
      { id: "q4", reviewStatus: "reviewed", visibility: "public_candidate", sourceType: "private_vault" },
      { id: "q5", reviewStatus: "reviewed", visibility: "private_family", sourceType: "original", auditStatus: "blocked" },
    ],
    questionAudits: { q1: [{ status: "open" }, { status: "resolved" }] },
    integritySummary: { criticalRows: [{}], blockedRows: [{}, {}], warningRows: [{}, {}, {}], overrepresentedTopics: { Boundaries: { count: 9 } } },
    nowMs: Date.parse("2026-05-19T00:00:00Z"),
    formatDate: () => "May 20",
  });
  assert.equal(coach.visible, true);
  assert.equal(coach.title, "Admin Coach Dashboard");
  assert.equal(coach.summary.studentCount, 1);
  assert.equal(coach.summary.accuracy, 50);
  assert.equal(coach.summary.dueRemediation, 2);
  assert.equal(coach.summary.proofPassed, 1);
  assert.equal(coach.summary.proofFailed, 1);
  assert.equal(coach.students[0].topSubskill.skill, "Boundaries");
  assert.equal(coach.students[0].latestBaseline, 1320);
  assert.equal(coach.students[0].latestExternalLog.source, "Khan Academy");
  assert.equal(coach.students[0].week.attempts, 2);
  assert.equal(coach.students[0].week.accuracy, 50);
  assert.equal(coach.students[0].week.externalMinutes, 25);
  assert.equal(coach.adminAudit.openAuditCount, 1);
  assert.equal(coach.adminAudit.needsReviewCount, 1);
  assert.equal(coach.adminAudit.blockedCount, 1);
  assert.equal(coach.adminAudit.firewallRiskCount, 1);
  assert.equal(coach.adminAudit.integrityBlockedCount, 2);
  assert.equal(dashboard.buildCoachDashboardModel({ account: { role: "student" } }).visible, false);
}

run();
console.log("dashboard_engine_unit_tests: pass");
