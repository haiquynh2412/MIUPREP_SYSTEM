(function initSatStudioDashboardEngine(root, factory) {
  const dashboardEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = dashboardEngine;
  }
  if (root) {
    root.SatStudioDashboardEngine = dashboardEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioDashboardEngine() {
  function safeProfile(profile = {}) {
    return {
      attempts: Array.isArray(profile.attempts) ? profile.attempts : [],
      studyNotes: Array.isArray(profile.studyNotes) ? profile.studyNotes : [],
      externalStudyLogs: Array.isArray(profile.externalStudyLogs) ? profile.externalStudyLogs : [],
      officialLogs: Array.isArray(profile.officialLogs) ? profile.officialLogs : [],
      roadmap: Array.isArray(profile.roadmap) ? profile.roadmap : [],
      attendance: profile.attendance && typeof profile.attendance === "object" ? profile.attendance : { points: 0, daily: {}, stickers: [] },
      streak: profile.streak && typeof profile.streak === "object" ? profile.streak : { count: 0 },
    };
  }

  function buildMetricsModel({ profile = {}, visibleQuestions = [], dueCount = 0, baseline = null, studyQuestionCount = null } = {}) {
    const safe = safeProfile(profile);
    const attempts = safe.attempts.length;
    const correct = safe.attempts.filter((attempt) => attempt.correct).length;
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
    const questions = Array.isArray(visibleQuestions) ? visibleQuestions : [];
    return {
      baselineLabel: baseline ? String(baseline) : "--",
      accuracy,
      accuracyLabel: `${accuracy}%`,
      dueCount: Number(dueCount || 0),
      questionCount: studyQuestionCount === null || studyQuestionCount === undefined ? questions.length : Number(studyQuestionCount || 0),
      needsReviewCount: questions.filter((question) => question.reviewStatus === "needs_review").length,
    };
  }

  function buildNextActionModel({ latestPretest = null, dueCount = 0, weakSkills = [], roadmap = [], runDiagnosticLabel = "Run diagnostic" } = {}) {
    if (!latestPretest) {
      return {
        kind: "pretest",
        title: "Run the first pretest",
        body: "The app needs a baseline before it can generate a serious study path.",
        button: "Start Pretest",
        sidebarFocus: runDiagnosticLabel,
      };
    }
    if (Number(dueCount || 0) > 0) {
      const due = Number(dueCount || 0);
      return {
        kind: "due_review",
        title: "Review due mistakes",
        body: `${due} question${due > 1 ? "s" : ""} should be reviewed before new practice.`,
        button: "Practice Due",
        sidebarFocus: "Review queue",
      };
    }
    const nextSkill = weakSkills[0]?.skill || roadmap[0]?.title || "Targeted practice";
    return {
      kind: "roadmap",
      title: nextSkill,
      body: "Use filtered practice to attack one weak skill at a time.",
      button: "Open Roadmap",
      sidebarFocus: nextSkill,
    };
  }

  function buildTodayFlowModel({ latestPretest = null, dueCount = 0, weakSkills = [], roadmap = [], profile = {} } = {}) {
    const safe = safeProfile(profile);
    const today = new Date().toISOString().slice(0, 10);
    const attemptedToday = Number(safe.attendance?.daily?.[today]?.attempts || 0);
    const due = Number(dueCount || 0);
    const hasBaseline = Boolean(latestPretest);
    const nextSkill = weakSkills[0]?.skill || roadmap[0]?.title || "Targeted practice";
    return [
      {
        step: "1",
        title: "Baseline",
        body: hasBaseline ? "Baseline is ready." : "Run a short diagnostic first.",
        status: hasBaseline ? "done" : "active",
        targetView: "pretest",
      },
      {
        step: "2",
        title: "Due review",
        body: due ? `${due} mistake${due === 1 ? "" : "s"} due now.` : "No due mistakes.",
        status: due ? "active" : hasBaseline ? "done" : "locked",
        targetView: "review",
      },
      {
        step: "3",
        title: "Skill drill",
        body: nextSkill,
        status: hasBaseline && !due ? "active" : hasBaseline ? "next" : "locked",
        targetView: "practice",
      },
      {
        step: "4",
        title: "Proof log",
        body: attemptedToday ? `${attemptedToday} answer${attemptedToday === 1 ? "" : "s"} today.` : "Finish one focused set.",
        status: attemptedToday ? "done" : hasBaseline ? "next" : "locked",
        targetView: "notes",
      },
    ];
  }

  function readinessBandForScore(score = 0) {
    const value = Number(score || 0);
    if (!value) return "Diagnostic needed";
    if (value < 1100) return "G10-Bridge";
    if (value < 1300) return "SAT-Core";
    if (value < 1450) return "SAT-Advanced";
    if (value < 1550) return "SAT-Elite";
    return "SAT-1600";
  }

  function buildScoreLadderModel({ latestPretest = null, targetScore = 1450, weakSkills = [], dueCount = 0 } = {}) {
    const currentScore = Number(latestPretest?.scoreEstimate || latestPretest?.score || 0);
    const target = Number(targetScore || 1450);
    const floor = 900;
    const range = Math.max(target - floor, 1);
    const progressPct = currentScore ? Math.max(0, Math.min(100, Math.round(((currentScore - floor) / range) * 100))) : 0;
    const blockers = (Array.isArray(weakSkills) ? weakSkills : []).slice(0, 3).map((item) => ({
      skill: item.skill || "Targeted practice",
      section: item.section || "SAT",
      wrong: Number(item.wrong || 0),
      priority: item.priority || "normal",
    }));
    const topSkill = blockers[0]?.skill || "first diagnostic";
    return {
      currentScore,
      currentLabel: currentScore ? String(currentScore) : "--",
      targetScore: target,
      pointGap: currentScore ? Math.max(target - currentScore, 0) : target,
      progressPct,
      band: readinessBandForScore(currentScore),
      blockers,
      proofCondition: Number(dueCount || 0) > 0 ? `Clear ${Number(dueCount)} due review${Number(dueCount) === 1 ? "" : "s"}.` : `Pass a timed proof in ${topSkill}.`,
    };
  }

  function buildWeakSkillRows(weakSkills = [], limit = 5) {
    return (Array.isArray(weakSkills) ? weakSkills : []).slice(0, limit).map((skill) => ({
      skill: skill.skill || "Unknown skill",
      section: skill.section || "SAT",
      wrong: Number(skill.wrong || 0),
      priority: skill.priority || "normal",
    }));
  }

  function buildDashboardLoopModel({ profile = {}, latestPretest = null, compositePretest = null, weakSkills = [], diagnosticScoreLabel = null } = {}) {
    const safe = safeProfile(profile);
    const scoreLabel = typeof diagnosticScoreLabel === "function" ? diagnosticScoreLabel : (test) => (test?.scoreEstimate ? `Baseline ${test.scoreEstimate}` : "Start with a diagnostic.");
    return [
      {
        step: "1",
        title: "Pretest",
        body: compositePretest ? `Baseline ${compositePretest.scoreEstimate}` : latestPretest ? scoreLabel(latestPretest) : "Start with a diagnostic.",
      },
      {
        step: "2",
        title: "Targeted practice",
        body: weakSkills[0] ? `Focus: ${weakSkills[0].skill}` : "Practice by SAT domain.",
      },
      {
        step: "3",
        title: "Notebook",
        body: `${safe.studyNotes.length} study notes, ${safe.studyNotes.filter((note) => note.starred).length} starred.`,
      },
      {
        step: "4",
        title: "Khan / Bluebook",
        body: `${safe.externalStudyLogs.length} outside study logs.`,
      },
      {
        step: "5",
        title: "Official practice",
        body: `${safe.officialLogs.length} metadata-only official logs.`,
      },
    ];
  }

  function dailyQuestDefinitions(labels = {}) {
    const pointsShort = labels.pointsShort || "pts";
    return [
      {
        id: "review-3",
        title: labels.questFixThree || "Fix 3 missed questions",
        metric: "reviews",
        target: 3,
        rewardPoints: 18,
        category: "repair",
        typeLabel: labels.questTypeFix || "Fix",
        actionLabel: labels.questActionOpenReview || "Open review",
        learningValue: labels.questFixValue || "Name the mistake before doing fresh practice.",
      },
      {
        id: "proof-1",
        title: labels.questProofOne || "Pass 1 proof question",
        metric: "proofsPassed",
        target: 1,
        rewardPoints: 20,
        category: "proof",
        typeLabel: labels.questTypeProof || "Proof",
        actionLabel: labels.questActionProof || "Prove mastery",
        learningValue: labels.questProofValue || "Counts only when the same skill is fixed cleanly.",
        hidden: true,
      },
      {
        id: "note-1",
        title: labels.questNoteOne || "Write 1 mistake note",
        metric: "notesSaved",
        target: 1,
        rewardPoints: 10,
        category: "reflection",
        typeLabel: labels.questTypeReflect || "Reflect",
        actionLabel: labels.questActionNote || "Write note",
        learningValue: labels.questNoteValue || "Turn one wrong answer into a reusable rule.",
      },
      {
        id: "sprint-1",
        title: labels.questSprintOne || "Finish one focused sprint",
        metric: "sprintsCompleted",
        target: 1,
        rewardPoints: 12,
        category: "practice",
        typeLabel: labels.questTypePractice || "Practice",
        actionLabel: labels.questActionSprint || "Start sprint",
        learningValue: labels.questSprintValue || "Practice one weak skill under light time pressure.",
      },
      {
        id: "external-15",
        title: labels.questExternalFifteen || "Log 15 Khan/Bluebook minutes",
        metric: "externalMinutes",
        target: 15,
        rewardPoints: 10,
        category: "external",
        typeLabel: labels.questTypeLog || "Log",
        actionLabel: labels.questActionExternal || "Log minutes",
        learningValue: labels.questExternalValue || "Connect outside SAT work back to this roadmap.",
      },
      {
        id: "hard-correct-2",
        title: labels.questHardTwo || "Get 2 hard questions correct",
        metric: "hardCorrect",
        target: 2,
        rewardPoints: 14,
        category: "hard",
        typeLabel: labels.questTypeHard || "Hard",
        actionLabel: labels.questActionHard || "Try hard set",
        learningValue: labels.questHardValue || "Unlocks when accuracy transfers to harder items.",
        hidden: true,
      },
      {
        id: "vocab-5",
        title: labels.questVocabFive || "Mark 5 vocabulary words known",
        metric: "vocabKnown",
        target: 5,
        rewardPoints: 10,
        category: "vocab",
        typeLabel: labels.questTypeVocab || "Vocab",
        actionLabel: labels.questActionVocab || "Review vocab",
        learningValue: labels.questVocabValue || "Build retrieval from words saved while reading.",
        hidden: true,
      },
    ].map((quest) => ({
      ...quest,
      reward: `+${Number(quest.rewardPoints || 0)} ${pointsShort}`,
      hiddenTitle: labels.hiddenQuestTitle || "Hidden SAT mission",
      hiddenHint: labels.hiddenQuestHint || "Make progress to reveal",
    }));
  }

  function dailyStatValue(daily = {}, metric = "") {
    return Number(daily[metric] || 0);
  }

  function buildDailyQuestModel({ attendance = {}, todayKey = "", labels = {} } = {}) {
    const today = todayKey || new Date().toISOString().slice(0, 10);
    const daily = attendance.daily?.[today] || {};
    const claimed = new Set(Array.isArray(attendance.questRewardsClaimed) ? attendance.questRewardsClaimed : []);
    return dailyQuestDefinitions(labels).map((quest) => {
      const current = Math.min(dailyStatValue(daily, quest.metric), Number(quest.target || 0));
      const key = `${today}:${quest.id}`;
      const complete = Number(quest.target || 0) > 0 && current >= Number(quest.target || 0);
      const claimedToday = claimed.has(key);
      const revealed = !quest.hidden || current > 0 || claimedToday;
      return {
        ...quest,
        current,
        pct: quest.target ? Math.round((current / quest.target) * 100) : 0,
        complete,
        claimed: claimedToday,
        revealed,
      };
    });
  }

  function evaluateQuestRewards({ attendance = {}, todayKey = "" } = {}) {
    const today = todayKey || new Date().toISOString().slice(0, 10);
    const claimed = new Set(Array.isArray(attendance.questRewardsClaimed) ? attendance.questRewardsClaimed : []);
    const quests = buildDailyQuestModel({ attendance, todayKey: today });
    const newlyClaimed = [];
    let bonusPoints = 0;
    quests.forEach((quest) => {
      const key = `${today}:${quest.id}`;
      if (!quest.complete || claimed.has(key)) return;
      claimed.add(key);
      newlyClaimed.push(quest.id);
      bonusPoints += Number(quest.rewardPoints || 0);
    });
    return {
      bonusPoints,
      newlyClaimed,
      questRewardsClaimed: [...claimed],
    };
  }

  function sumDailyMetric(attendance = {}, metric = "") {
    return Object.values(attendance.daily || {}).reduce((sum, day) => sum + Number(day?.[metric] || 0), 0);
  }

  function rewardStatsForProfile(profile = {}) {
    const safe = safeProfile(profile);
    const attendance = safe.attendance;
    const attempts = safe.attempts;
    const remediationProofs = attempts.filter((attempt) => attempt.remediation?.status === "proof_passed").length;
    return {
      points: Number(attendance.points || 0),
      streak: Number(safe.streak?.count || 0),
      attempts: attempts.length,
      correct: attempts.filter((attempt) => attempt.correct).length,
      reviews: attempts.filter((attempt) => !attempt.correct || attempt.errorType || attempt.pacingFlag === "slow_correct").length,
      pretests: Array.isArray(profile.pretests) ? profile.pretests.length : 0,
      externalMinutes: safe.externalStudyLogs.reduce((sum, log) => sum + Number(log.minutes || 0), 0),
      studyNotes: safe.studyNotes.length,
      vocabKnown: Array.isArray(profile.vocabKnown) ? profile.vocabKnown.length : 0,
      sprintsCompleted: sumDailyMetric(attendance, "sprintsCompleted"),
      hardSprintsCompleted: sumDailyMetric(attendance, "hardSprintsCompleted"),
      examDrillsCompleted: sumDailyMetric(attendance, "examDrillsCompleted"),
      proofsPassed: Math.max(remediationProofs, sumDailyMetric(attendance, "proofsPassed")),
      hardCorrect: sumDailyMetric(attendance, "hardCorrect"),
    };
  }

  function rewardUnlocked(reward = {}, stats = {}) {
    if (reward.requirement && Number(stats.points || 0) >= Number(reward.requirement || 0)) return true;
    const criteria = reward.criteria && typeof reward.criteria === "object" ? reward.criteria : {};
    const entries = Object.entries(criteria);
    return entries.length > 0 && entries.every(([key, value]) => Number(stats[key] || 0) >= Number(value || 0));
  }

  function rewardRevealed(reward = {}, stats = {}) {
    if (!reward.secret) return true;
    if (rewardUnlocked(reward, stats)) return true;
    const reveal = reward.revealWhen && typeof reward.revealWhen === "object" ? reward.revealWhen : {};
    return Object.entries(reveal).some(([key, value]) => Number(stats[key] || 0) >= Number(value || 0));
  }

  function journeyTitleForLevel(level = 1) {
    const titles = ["Pre-SAT Scout", "SAT Core Builder", "Skill Climber", "Proof Trainer", "1600 Track"];
    return titles[Math.min(Math.max(Number(level || 1) - 1, 0), titles.length - 1)];
  }

  function buildRewardModel({ profile = {}, rewardCatalog = [], todayKey = "", labels = {} } = {}) {
    const safe = safeProfile(profile);
    const attendance = safe.attendance;
    const today = todayKey || new Date().toISOString().slice(0, 10);
    const daily = attendance.daily?.[today] || { attempts: 0, correct: 0, reviews: 0, pretests: 0, externalMinutes: 0, points: 0 };
    const points = Number(attendance.points || 0);
    const level = Math.floor(points / 100) + 1;
    const progress = points % 100;
    const unlocked = new Set(Array.isArray(attendance.stickers) ? attendance.stickers : []);
    const stats = rewardStatsForProfile(profile);
    const quests = buildDailyQuestModel({ attendance, todayKey: today, labels });

    const catalog = Array.isArray(rewardCatalog) ? rewardCatalog : [];
    const rewardBoard = catalog.map((reward) => {
      const unlockedNow = unlocked.has(reward.id) || rewardUnlocked(reward, stats);
      const revealed = rewardRevealed(reward, stats);
      return {
        id: reward.id,
        name: revealed ? reward.name : labels.hiddenAchievement || "Hidden achievement",
        icon: revealed ? reward.icon : "?",
        description: revealed ? reward.description || "" : labels.hiddenAchievementHint || "Keep studying to reveal this badge.",
        unlocked: unlockedNow,
        hidden: !revealed,
        remaining: reward.requirement ? Math.max(Number(reward.requirement || 0) - points, 0) : 0,
        unlockedLabel: labels.unlocked || "Unlocked",
        pointsToUnlockLabel: labels.pointsToUnlock || "pts to unlock",
      };
    });
    return {
      points,
      streak: Number(safe.streak?.count || 0),
      todayAnswers: Number(daily.attempts || 0),
      levelLabel: `L${level}`,
      journeyTitle: journeyTitleForLevel(level),
      nextLevelLabel: `L${level + 1}`,
      progress,
      stickerShelf: rewardBoard.slice(0, 8).map((reward) => ({
        id: reward.id,
        name: reward.name,
        icon: reward.icon,
        unlocked: reward.unlocked,
        hidden: reward.hidden,
      })),
      quests,
      hiddenQuestCount: quests.filter((quest) => quest.hidden && !quest.revealed).length,
      rewardBoard,
    };
  }

  function buildExternalLearningModel(profile = {}) {
    const safe = safeProfile(profile);
    const links = profile.externalLinks && typeof profile.externalLinks === "object" ? profile.externalLinks : {};
    const khanUrl = links.khan || "https://www.khanacademy.org/test-prep/digital-sat";
    const bluebookUrl = links.bluebook || "https://bluebook.collegeboard.org/students/practice";
    return {
      khanInput: links.khan || "",
      bluebookInput: links.bluebook || "",
      khanUrl,
      bluebookUrl,
      logs: safe.externalStudyLogs,
    };
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function dateMs(value) {
    const parsed = Date.parse(value || "");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function average(numbers = []) {
    const valid = asArray(numbers).map(Number).filter((value) => Number.isFinite(value) && value > 0);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
  }

  function percent(correct = 0, total = 0) {
    const denominator = Number(total || 0);
    if (!denominator) return 0;
    return Math.round((Number(correct || 0) / denominator) * 100);
  }

  function latestByDate(rows = [], fields = ["at", "endedAt", "createdAt", "updatedAt"]) {
    return asArray(rows)
      .filter(Boolean)
      .slice()
      .sort((a, b) => {
        const aMs = Math.max(...fields.map((field) => dateMs(a[field])));
        const bMs = Math.max(...fields.map((field) => dateMs(b[field])));
        return bMs - aMs;
      })[0] || null;
  }

  function buildQuestionMap(questions = []) {
    const map = new Map();
    asArray(questions).forEach((question) => {
      if (question?.id) map.set(String(question.id), question);
    });
    return map;
  }

  function questionForAttempt(attempt = {}, questionsById = new Map()) {
    return questionsById.get(String(attempt.questionId || "")) || {};
  }

  function remediationStatus(attempt = {}) {
    const remediation = attempt.remediation && typeof attempt.remediation === "object" ? attempt.remediation : {};
    return remediation.status || remediation.proofStatus || attempt.remediationStatus || "";
  }

  function attemptNeedsCoachAttention(attempt = {}) {
    const status = remediationStatus(attempt);
    if (status === "proof_passed") return false;
    return (
      attempt.correct === false ||
      Boolean(attempt.errorType) ||
      attempt.pacingFlag === "slow_correct" ||
      attempt.pacingFlag === "fast_wrong" ||
      attempt.pacingFlag === "time_pressure" ||
      Boolean(attempt.markedForReview) ||
      status === "proof_failed"
    );
  }

  function dueAttemptCount(attempts = [], nowMs = Date.now()) {
    return asArray(attempts).filter((attempt) => {
      if (!attemptNeedsCoachAttention(attempt)) return false;
      const dueAt = attempt.remediation?.dueAt || attempt.dueAt || attempt.at;
      return !dueAt || dateMs(dueAt) <= nowMs;
    }).length;
  }

  function lessonTaskCounts(lessonProgress = {}, nowMs = Date.now()) {
    const tasks = Object.values(lessonProgress && typeof lessonProgress === "object" ? lessonProgress : {});
    return tasks.reduce(
      (counts, task) => {
        if (!task || typeof task !== "object") return counts;
        if (task.status === "proof_passed" || task.proofStatus === "proof_passed") {
          counts.proofPassed += 1;
          return counts;
        }
        if (task.status === "proof_failed" || task.proofStatus === "proof_failed") counts.proofFailed += 1;
        const dueAt = task.dueAt || task.assignedAt;
        if (!dueAt || dateMs(dueAt) <= nowMs) counts.due += 1;
        return counts;
      },
      { due: 0, proofPassed: 0, proofFailed: 0 },
    );
  }

  function buildSubskillRows(profile = {}, questionsById = new Map()) {
    const rowsByKey = new Map();
    asArray(profile.attempts).forEach((attempt) => {
      const question = questionForAttempt(attempt, questionsById);
      const skill = question.skill || attempt.skill || "Unmapped subskill";
      const domain = question.domain || attempt.domain || "SAT";
      const section = question.section || attempt.section || "SAT";
      const key = `${section}|${domain}|${skill}`;
      if (!rowsByKey.has(key)) {
        rowsByKey.set(key, {
          section,
          domain,
          skill,
          attempted: 0,
          correct: 0,
          wrong: 0,
          seconds: [],
        });
      }
      const row = rowsByKey.get(key);
      row.attempted += 1;
      if (attempt.correct) row.correct += 1;
      else row.wrong += 1;
      if (!attempt.fromPretest && Number(attempt.timeSpentSeconds || 0) > 0) row.seconds.push(Number(attempt.timeSpentSeconds));
    });

    return [...rowsByKey.values()]
      .map((row) => ({
        ...row,
        accuracy: percent(row.correct, row.attempted),
        avgSeconds: average(row.seconds),
      }))
      .sort((a, b) => {
        const aAccuracy = a.attempted ? a.accuracy : 101;
        const bAccuracy = b.attempted ? b.accuracy : 101;
        return aAccuracy - bAccuracy || b.wrong - a.wrong || b.attempted - a.attempted || a.skill.localeCompare(b.skill);
      });
  }

  function buildStudentCoachRow({ student = {}, profile = {}, questionsById = new Map(), remediationRows = [], nowMs = Date.now(), formatDate = null } = {}) {
    const safe = safeProfile(profile);
    const attempts = safe.attempts;
    const weekStartMs = Number(nowMs || Date.now()) - 7 * 24 * 60 * 60 * 1000;
    const weekAttempts = attempts.filter((attempt) => {
      const at = dateMs(attempt.at || attempt.createdAt || attempt.endedAt);
      return at >= weekStartMs && at <= Number(nowMs || Date.now());
    });
    const weekExternalLogs = safe.externalStudyLogs.filter((log) => {
      const at = dateMs(log.at || log.createdAt);
      return at >= weekStartMs && at <= Number(nowMs || Date.now());
    });
    const weekOfficialLogs = safe.officialLogs.filter((log) => {
      const at = dateMs(log.at || log.createdAt);
      return at >= weekStartMs && at <= Number(nowMs || Date.now());
    });
    const correct = attempts.filter((attempt) => attempt.correct).length;
    const timedAttempts = attempts.filter((attempt) => !attempt.fromPretest && Number(attempt.timeSpentSeconds || 0) > 0);
    const openAttemptCount = attempts.filter(attemptNeedsCoachAttention).length;
    const taskCounts = lessonTaskCounts(profile.lessonProgress, nowMs);
    const openRows = asArray(remediationRows).filter((row) => row && row.status !== "proof_passed" && !row.proofPassed);
    const dueRows = openRows.filter((row) => {
      if (String(row.status || "").includes("due")) return true;
      return !row.dueAt || dateMs(row.dueAt) <= nowMs;
    });
    const proofPassedFromAttempts = attempts.filter((attempt) => remediationStatus(attempt) === "proof_passed").length;
    const proofFailedFromAttempts = attempts.filter((attempt) => remediationStatus(attempt) === "proof_failed").length;
    const proofPassedFromRows = asArray(remediationRows).filter((row) => row.status === "proof_passed" || row.proofPassed).length;
    const proofFailedFromRows = asArray(remediationRows).filter((row) => row.status === "proof_failed" || row.proofStatus === "proof_failed").length;
    const subskills = buildSubskillRows(profile, questionsById);
    const latestPretest = latestByDate(profile.pretests, ["endedAt", "startedAt", "at"]);
    const latestLog = latestByDate(safe.externalStudyLogs, ["at", "createdAt"]);
    const latestOfficialLog = latestByDate(safe.officialLogs, ["at", "createdAt"]);
    const latestAttempt = latestByDate(attempts, ["at", "createdAt"]);
    const externalMinutes = safe.externalStudyLogs.reduce((sum, log) => sum + Number(log.minutes || 0), 0);
    const nextSessionAt = student.studyPlan?.nextSessionAt || "";
    const weeklyTarget = Number(student.studyPlan?.weeklyTarget || 0);
    const format = typeof formatDate === "function" ? formatDate : (value) => value || "";

    return {
      id: student.id || "",
      name: student.name || "Student",
      scope: student.scope || "family",
      targetScore: Number(student.targetScore || 0),
      attempts: attempts.length,
      correct,
      accuracy: percent(correct, attempts.length),
      avgSeconds: average(timedAttempts.map((attempt) => attempt.timeSpentSeconds)),
      openMistakes: Math.max(openAttemptCount, openRows.length),
      dueRemediation: Math.max(dueAttemptCount(attempts, nowMs) + taskCounts.due, dueRows.length),
      proofPassed: Math.max(proofPassedFromAttempts + taskCounts.proofPassed, proofPassedFromRows),
      proofFailed: Math.max(proofFailedFromAttempts + taskCounts.proofFailed, proofFailedFromRows),
      externalMinutes,
      externalLogCount: safe.externalStudyLogs.length,
      officialLogCount: safe.officialLogs.length,
      latestExternalLog: latestLog
        ? {
            source: latestLog.source || "Outside study",
            topic: latestLog.topic || "General SAT study",
            minutes: Number(latestLog.minutes || 0),
            at: latestLog.at || latestLog.createdAt || "",
            label: `${latestLog.source || "Outside study"} - ${Number(latestLog.minutes || 0)} min`,
        }
        : null,
      latestOfficialLog: latestOfficialLog
        ? {
            source: latestOfficialLog.source || "Official practice",
            result: latestOfficialLog.result || "logged",
            section: latestOfficialLog.section || "SAT",
            skill: latestOfficialLog.skill || "General SAT",
            reference: latestOfficialLog.reference || "",
            totalScore: Number(latestOfficialLog.totalScore || latestOfficialLog.score || 0),
            rwScore: Number(latestOfficialLog.rwScore || 0),
            mathScore: Number(latestOfficialLog.mathScore || 0),
            at: latestOfficialLog.at || latestOfficialLog.createdAt || "",
            label: `${latestOfficialLog.source || "Official practice"} - ${latestOfficialLog.result || "logged"}`,
          }
        : null,
      latestBaseline: latestPretest?.scoreEstimate || latestPretest?.scoreLabel || "",
      latestAttemptAt: latestAttempt?.at || "",
      week: {
        attempts: weekAttempts.length,
        correct: weekAttempts.filter((attempt) => attempt.correct).length,
        accuracy: percent(weekAttempts.filter((attempt) => attempt.correct).length, weekAttempts.length),
        practiceMinutes: Math.round(
          weekAttempts.reduce((sum, attempt) => sum + Number(attempt.timeSpentSeconds || 0), 0) / 60,
        ),
        externalMinutes: weekExternalLogs.reduce((sum, log) => sum + Number(log.minutes || 0), 0),
        officialLogs: weekOfficialLogs.length,
        proofPassed: weekAttempts.filter((attempt) => remediationStatus(attempt) === "proof_passed").length,
        proofFailed: weekAttempts.filter((attempt) => remediationStatus(attempt) === "proof_failed").length,
        slowCorrect: weekAttempts.filter((attempt) => attempt.correct && attempt.pacingFlag === "slow_correct").length,
        marked: weekAttempts.filter((attempt) => attempt.markedForReview).length,
      },
      weeklyTarget,
      nextSessionAt,
      nextSessionLabel: nextSessionAt ? format(nextSessionAt) : "No session scheduled",
      topSubskill: subskills[0] || null,
      subskills: subskills.slice(0, 3),
    };
  }

  function buildAdminAuditModel({ questions = [], questionAudits = {}, integritySummary = null } = {}) {
    const auditEntries = Object.entries(questionAudits && typeof questionAudits === "object" ? questionAudits : {}).flatMap(([questionId, entries]) =>
      asArray(entries).map((entry) => ({ questionId, ...entry })),
    );
    const openAuditIds = new Set(
      auditEntries
        .filter((entry) => !["resolved", "closed", "passed"].includes(entry.status || "open"))
        .map((entry) => entry.questionId),
    );
    const highRiskSources = new Set(["private_vault", "antigravity", "college_board", "cracksat_reference", "kaplan", "sat_king", "sat_1590"]);
    const questionRows = asArray(questions);
    const publicCandidates = questionRows.filter((question) => question.visibility === "public_candidate");
    const integrity = integritySummary && typeof integritySummary === "object" ? integritySummary : {};
    return {
      openAuditCount: openAuditIds.size,
      openAuditEntries: auditEntries.filter((entry) => !["resolved", "closed", "passed"].includes(entry.status || "open")).length,
      needsReviewCount: questionRows.filter((question) => question.reviewStatus === "needs_review").length,
      blockedCount: questionRows.filter((question) => question.auditStatus === "blocked" || question.publicationStatus === "audit_blocked" || question.reviewStatus === "rejected").length,
      publicCandidateCount: publicCandidates.length,
      privateFamilyCount: questionRows.filter((question) => question.visibility === "private_family").length,
      adminOnlyCount: questionRows.filter((question) => question.visibility === "admin_only").length,
      vaultCount: questionRows.filter((question) => question.sourceType === "private_vault").length,
      generatedNeedsReviewCount: questionRows.filter((question) => question.sourceType === "ai_generated" && question.reviewStatus !== "reviewed").length,
      firewallRiskCount: publicCandidates.filter((question) => highRiskSources.has(question.sourceType) || question.sourceRisk === "high").length,
      integrityCriticalCount: asArray(integrity.criticalRows).length,
      integrityBlockedCount: asArray(integrity.blockedRows).length,
      integrityWarningCount: asArray(integrity.warningRows).length,
      overrepresentedTopicCount: Object.keys(integrity.overrepresentedTopics || {}).length,
    };
  }

  function buildCoachDashboardModel({
    account = null,
    students = [],
    studentProfilesById = {},
    remediationByStudentId = {},
    questions = [],
    questionAudits = {},
    integritySummary = null,
    nowMs = Date.now(),
    formatDate = null,
  } = {}) {
    const role = account?.role || "student";
    const visible = role === "parent" || role === "admin";
    if (!visible) {
      return { visible: false, role, title: "", students: [], summary: null, adminAudit: null };
    }
    const questionsById = buildQuestionMap(questions);
    const studentRows = asArray(students)
      .filter((student) => student?.role === "student")
      .map((student) =>
        buildStudentCoachRow({
          student,
          profile: studentProfilesById[student.id] || {},
          questionsById,
          remediationRows: remediationByStudentId[student.id] || [],
          nowMs,
          formatDate,
        }),
      );
    const attemptedRows = studentRows.filter((row) => row.attempts > 0);
    const totalAttempts = studentRows.reduce((sum, row) => sum + row.attempts, 0);
    const totalCorrect = studentRows.reduce((sum, row) => sum + row.correct, 0);
    const summary = {
      studentCount: studentRows.length,
      attemptedStudentCount: attemptedRows.length,
      accuracy: percent(totalCorrect, totalAttempts),
      avgSeconds: average(studentRows.flatMap((row) => (row.avgSeconds ? [row.avgSeconds] : []))),
      openMistakes: studentRows.reduce((sum, row) => sum + row.openMistakes, 0),
      dueRemediation: studentRows.reduce((sum, row) => sum + row.dueRemediation, 0),
      proofPassed: studentRows.reduce((sum, row) => sum + row.proofPassed, 0),
      proofFailed: studentRows.reduce((sum, row) => sum + row.proofFailed, 0),
      externalMinutes: studentRows.reduce((sum, row) => sum + row.externalMinutes, 0),
      officialLogs: studentRows.reduce((sum, row) => sum + row.officialLogCount, 0),
      scheduledStudents: studentRows.filter((row) => row.nextSessionAt).length,
    };
    return {
      visible,
      role,
      title: role === "admin" ? "Admin Coach Dashboard" : "Parent Coach Dashboard",
      subtitle:
        role === "admin"
          ? "Student progress, content audit, and public/private/vault firewall status."
          : "Student progress, remediation due, proof status, and outside study logs.",
      summary,
      students: studentRows,
      adminAudit: role === "admin" ? buildAdminAuditModel({ questions, questionAudits, integritySummary }) : null,
    };
  }

  return {
    buildCoachDashboardModel,
    buildDashboardLoopModel,
    buildDailyQuestModel,
    evaluateQuestRewards,
    buildExternalLearningModel,
    buildMetricsModel,
    buildNextActionModel,
    buildRewardModel,
    buildScoreLadderModel,
    buildTodayFlowModel,
    rewardStatsForProfile,
    buildWeakSkillRows,
  };
});
