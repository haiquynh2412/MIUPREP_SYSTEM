(function initSatStudioExamReviewEngine(root, factory) {
  let practiceEngine = root?.SatStudioPracticeEngine;
  if (!practiceEngine && typeof require === "function") {
    practiceEngine = require("./sat_practice_engine.js");
  }
  const examReviewEngine = factory(practiceEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = examReviewEngine;
  }
  if (root) {
    root.SatStudioExamReviewEngine = examReviewEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioExamReviewEngine(practiceEngine) {
  function averageNumber(values = []) {
    if (practiceEngine?.averageNumber) return practiceEngine.averageNumber(values);
    const clean = values.map(Number).filter(Number.isFinite);
    if (!clean.length) return 0;
    return clean.reduce((sum, value) => sum + value, 0) / clean.length;
  }

  function countValues(values = []) {
    if (practiceEngine?.countValues) return practiceEngine.countValues(values);
    return values.reduce((acc, value) => {
      const key = value || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function defaultTargetSecondsForQuestion(question) {
    return practiceEngine?.targetSecondsForQuestion ? practiceEngine.targetSecondsForQuestion(question) : 0;
  }

  function defaultPacingLabel(flag) {
    return practiceEngine?.pacingLabel ? practiceEngine.pacingLabel(flag) : flag || "On pace";
  }

  function sessionAttemptMap(profile = {}, attemptIds = []) {
    const ids = new Set(Array.isArray(attemptIds) ? attemptIds : []);
    return new Map((profile.attempts || []).filter((attempt) => ids.has(attempt.id)).map((attempt) => [attempt.questionId, attempt]));
  }

  function buildSessionRows(session = {}, context = {}) {
    const profile = context.profile || {};
    const getQuestionById = context.getQuestionById || (() => null);
    const getCorrectAnswerLabel = context.getCorrectAnswerLabel || (() => "");
    const targetSecondsForQuestion = context.targetSecondsForQuestion || defaultTargetSecondsForQuestion;
    const pacingLabel = context.pacingLabel || defaultPacingLabel;
    const sessionRowRecommendation =
      context.sessionRowRecommendation ||
      ((params) =>
        practiceEngine?.sessionRowRecommendation
          ? practiceEngine.sessionRowRecommendation(params)
          : "Review the item, then retry a new question from the same skill.");
    const masteryRows = typeof context.buildSkillMastery === "function" ? context.buildSkillMastery() : [];
    const masteryMap = new Map(masteryRows.map((item) => [item.key, item]));
    const attemptMap = sessionAttemptMap(profile, session.attemptIds);

    return (session.questionIds || []).map((questionId, index) => {
      const question = getQuestionById(questionId);
      const attempt = attemptMap.get(questionId) || null;
      const key = question ? `${question.section}|${question.domain}|${question.skill}` : "";
      const mastery = masteryMap.get(key);
      const status = attempt ? (attempt.correct ? "Correct" : "Wrong") : "Skipped";
      const pacingFlag = attempt?.pacingFlag || (!attempt ? "skipped" : "");
      const errorType = attempt?.errorType || (!attempt ? "skipped" : "");
      return {
        index: index + 1,
        questionId,
        attemptId: attempt?.id || "",
        section: question?.section || "Unknown",
        domain: question?.domain || "Unknown",
        skill: question?.skill || "Unknown",
        difficulty: question?.difficulty || "Unknown",
        correct: Boolean(attempt?.correct),
        attempted: Boolean(attempt),
        status,
        selectedAnswer: attempt?.selectedAnswer || "",
        correctAnswer: getCorrectAnswerLabel(question),
        timeSpentSeconds: Number(attempt?.timeSpentSeconds || 0),
        targetSeconds: question ? targetSecondsForQuestion(question) : 0,
        pacingFlag,
        pacingLabel: pacingLabel(pacingFlag),
        markedForReview: Boolean(attempt?.markedForReview || profile.bookmarks?.includes(questionId)),
        errorType,
        masteryStage: mastery?.masteryStage || "Collect evidence",
        mastery: mastery?.mastery ?? null,
        recommendation: sessionRowRecommendation({ question, attempt, mastery, errorType, pacingFlag }),
      };
    });
  }

  function sessionIssueCounts(rows = []) {
    return {
      wrong: rows.filter((row) => row.attempted && !row.correct).length,
      skipped: rows.filter((row) => !row.attempted).length,
      slowCorrect: rows.filter((row) => row.pacingFlag === "slow_correct" || row.errorType === "slow_correct").length,
      fastWrong: rows.filter((row) => row.pacingFlag === "fast_wrong").length,
      timePressure: rows.filter((row) => row.pacingFlag === "time_pressure" || row.errorType === "time_pressure").length,
      marked: rows.filter((row) => row.markedForReview).length,
    };
  }

  function buildPacingProfile(rows = []) {
    const attempted = rows.filter((row) => row.attempted);
    const totalSpent = attempted.reduce((sum, row) => sum + Number(row.timeSpentSeconds || 0), 0);
    const totalTarget = attempted.reduce((sum, row) => sum + Number(row.targetSeconds || 0), 0);
    const overTargetRows = attempted.filter((row) => row.targetSeconds && row.timeSpentSeconds > row.targetSeconds);
    const slowCorrectRows = attempted.filter((row) => row.correct && row.targetSeconds && row.timeSpentSeconds > row.targetSeconds);
    const fastWrongRows = attempted.filter((row) => !row.correct && row.targetSeconds && row.timeSpentSeconds < row.targetSeconds * 0.5);
    const onPaceRows = attempted.filter((row) => row.targetSeconds && row.timeSpentSeconds <= row.targetSeconds && row.timeSpentSeconds >= row.targetSeconds * 0.5);
    const onPaceRate = attempted.length ? Math.round((onPaceRows.length / attempted.length) * 100) : 0;
    const budgetDelta = totalTarget ? totalTarget - totalSpent : 0;
    const label =
      !attempted.length
        ? "No pacing evidence"
        : budgetDelta >= 0 && onPaceRate >= 70
          ? "Pacing controlled"
          : slowCorrectRows.length >= fastWrongRows.length
            ? "Accuracy too slow"
            : "Rushing risk";
    return {
      totalSpent,
      totalTarget,
      budgetDelta,
      onPaceRate,
      overTarget: overTargetRows.length,
      slowCorrect: slowCorrectRows.length,
      fastWrong: fastWrongRows.length,
      label,
    };
  }

  function buildDomainBreakdown(rows = []) {
    const map = new Map();
    rows.forEach((row) => {
      const key = `${row.section}|${row.domain}`;
      const item =
        map.get(key) || {
          section: row.section,
          domain: row.domain,
          total: 0,
          attempted: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          totalSeconds: 0,
          targetSeconds: 0,
        };
      item.total += 1;
      if (row.attempted) {
        item.attempted += 1;
        item.totalSeconds += Number(row.timeSpentSeconds || 0);
        item.targetSeconds += Number(row.targetSeconds || 0);
        if (row.correct) item.correct += 1;
        else item.wrong += 1;
      } else {
        item.skipped += 1;
      }
      map.set(key, item);
    });
    return [...map.values()]
      .map((item) => ({
        ...item,
        accuracy: item.attempted ? Math.round((item.correct / item.attempted) * 100) : 0,
        avgSeconds: item.attempted ? Math.round(item.totalSeconds / item.attempted) : 0,
        pacingDelta: item.targetSeconds ? item.targetSeconds - item.totalSeconds : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.wrong + b.skipped - (a.wrong + a.skipped));
  }

  function reviewPriorityForRow(row = {}) {
    if (!row.attempted) return { score: 100, reason: "Skipped under test conditions; rebuild entry strategy first." };
    if (!row.correct && row.pacingFlag === "fast_wrong") return { score: 95, reason: "Fast wrong answer; likely trap or misread." };
    if (!row.correct) return { score: 90, reason: "Wrong answer; review explanation and assign remediation." };
    if (row.pacingFlag === "slow_correct") return { score: 70, reason: "Correct but too slow for exam pacing." };
    if (row.markedForReview) return { score: 55, reason: "Marked for review; method confidence is not stable." };
    if (row.targetSeconds && row.timeSpentSeconds > row.targetSeconds) return { score: 45, reason: "Over target time; look for a faster route." };
    return { score: 10, reason: "Low priority maintenance item." };
  }

  function buildReviewPriorityQueue(rows = [], limit = 8) {
    return rows
      .map((row) => ({ ...row, reviewPriority: reviewPriorityForRow(row) }))
      .filter((row) => row.reviewPriority.score >= 45)
      .sort((a, b) => b.reviewPriority.score - a.reviewPriority.score || a.index - b.index)
      .slice(0, limit);
  }

  function buildExamReadinessSignal(report = {}) {
    const accuracy = Number(report.accuracy || 0);
    const pacing = report.pacingProfile || {};
    const issue = report.issueCounts || {};
    if (accuracy >= 88 && (pacing.onPaceRate || 0) >= 70 && !(issue.skipped || issue.timePressure)) {
      return {
        label: "Ready for harder timed module",
        detail: "Accuracy and pacing are strong enough to move to harder mixed proof work.",
        nextAction: "Run a hard mixed set or adaptive module.",
      };
    }
    if ((issue.wrong || 0) + (issue.skipped || 0) >= 3) {
      return {
        label: "Teach before retest",
        detail: "There are enough wrong/skipped items that another test would mostly repeat the same gaps.",
        nextAction: "Clear the review priority queue and pass proof items first.",
      };
    }
    if ((pacing.onPaceRate || 0) < 60) {
      return {
        label: "Pacing block",
        detail: "Accuracy alone is not enough; time control needs a short sprint block.",
        nextAction: "Do a 5-minute sprint on the same skills after review.",
      };
    }
    return {
      label: "Targeted practice next",
      detail: "Use a small focused set before the next full module.",
      nextAction: "Practice the weakest domain from this report.",
    };
  }

  function buildMistakeLedger({ profile = {}, sessionAttemptIds = null, limit = 12 } = {}, helpers = {}) {
    const getQuestionById = helpers.getQuestionById || (() => null);
    const getCorrectAnswerLabel = helpers.getCorrectAnswerLabel || (() => "");
    const suggestErrorType = helpers.suggestErrorType || (() => "trap_answer");
    const getKnowledgeReviewLesson = helpers.getKnowledgeReviewLesson || (() => null);
    const hasLaterProofAttempt = helpers.hasLaterProofAttempt || (() => false);
    const remediationActionFor = helpers.remediationActionFor || ((errorType) => `Review ${errorType || "this mistake"} before retesting.`);
    const taggerLabel = helpers.taggerLabel || ((attempt) => attempt.taggedBy || "not recorded");
    const sessionSet = Array.isArray(sessionAttemptIds) && sessionAttemptIds.length ? new Set(sessionAttemptIds) : null;

    const rows = (profile.attempts || [])
      .filter((attempt) => {
        if (sessionSet && !sessionSet.has(attempt.id)) return false;
        return !attempt.correct || attempt.errorType || attempt.pacingFlag === "slow_correct" || attempt.markedForReview;
      })
      .slice()
      .reverse()
      .map((attempt) => {
        const question = getQuestionById(attempt.questionId);
        const tag = (profile.errorTags || []).find((item) => item.attemptId === attempt.id);
        const errorType = attempt.errorType || (!attempt.correct ? suggestErrorType(question, false, { skipped: !attempt.selectedAnswer }) : attempt.pacingFlag || "marked");
        const lesson = question ? getKnowledgeReviewLesson(question) : null;
        const remediated = question ? hasLaterProofAttempt(attempt, question) : false;
        return {
          attemptId: attempt.id,
          questionId: attempt.questionId,
          at: attempt.at,
          section: question?.section || "Unknown",
          domain: question?.domain || "Unknown",
          skill: question?.skill || "Unknown",
          difficulty: question?.difficulty || "Unknown",
          selectedAnswer: attempt.selectedAnswer || "",
          correctAnswer: getCorrectAnswerLabel(question),
          errorType,
          pacingFlag: attempt.pacingFlag || "",
          timeSpentSeconds: Number(attempt.timeSpentSeconds || 0),
          taggedBy: taggerLabel(attempt),
          taggedAt: attempt.taggedAt || tag?.taggedAt || attempt.at,
          tagSource: attempt.tagSource || tag?.source || "",
          note: attempt.errorNote || tag?.note || "",
          lessonTitle: lesson?.title || "Review the underlying concept",
          remediationAction: remediationActionFor(errorType, question),
          dueAt: attempt.dueAt || "",
          remediated,
          status: remediated ? "proof_passed" : attempt.remediation?.status || "open",
        };
      });

    return rows.slice(0, limit);
  }

  function buildPracticeSessionReport(session = {}, context = {}) {
    if (!session?.questionIds?.length) return null;
    const profile = context.profile || {};
    const rows = buildSessionRows(session, context);
    const attemptedRows = rows.filter((row) => row.attempted);
    const correctRows = attemptedRows.filter((row) => row.correct);
    const avgSeconds = Math.round(averageNumber(attemptedRows.map((row) => row.timeSpentSeconds)));
    const totalSeconds = attemptedRows.reduce((sum, row) => sum + row.timeSpentSeconds, 0);
    const stageCounts = countValues(rows.map((row) => row.masteryStage));
    const issueCounts = sessionIssueCounts(rows);
    const buildSessionSkillGroups =
      context.buildSessionSkillGroups ||
      ((reportRows) => (practiceEngine?.buildSessionSkillGroups ? practiceEngine.buildSessionSkillGroups(reportRows) : []));
    const buildSessionCoachPlan =
      context.buildSessionCoachPlan ||
      ((payload) => (practiceEngine?.buildSessionCoachPlan ? practiceEngine.buildSessionCoachPlan(payload) : null));
    const skillGroups = buildSessionSkillGroups(rows);
    const mistakeLedger =
      typeof context.buildMistakeLedger === "function"
        ? context.buildMistakeLedger({ sessionAttemptIds: session.attemptIds, limit: context.mistakeLedgerLimit || 10 })
        : buildMistakeLedger({ profile, sessionAttemptIds: session.attemptIds, limit: context.mistakeLedgerLimit || 10 }, context);
    const coachPlan = buildSessionCoachPlan({ rows, skillGroups, mistakeLedger, issueCounts });
    const pacingProfile = buildPacingProfile(rows);
    const domainBreakdown = buildDomainBreakdown(rows);
    const reviewPriorityQueue = buildReviewPriorityQueue(rows, context.reviewPriorityLimit || 8);
    const readinessSignal = buildExamReadinessSignal({ accuracy: attemptedRows.length ? Math.round((correctRows.length / attemptedRows.length) * 100) : 0, issueCounts, pacingProfile });

    return {
      id: session.id || `practice-session-${Date.now()}`,
      mode: session.mode || "Practice Session",
      startedAt: session.startedAt || "",
      endedAt: session.endedAt || new Date().toISOString(),
      deadlineAt: session.deadlineAt || "",
      reason: session.reason || "ended",
      totalQuestions: rows.length,
      attempted: attemptedRows.length,
      correct: correctRows.length,
      accuracy: attemptedRows.length ? Math.round((correctRows.length / attemptedRows.length) * 100) : 0,
      avgSeconds,
      totalSeconds,
      issueCounts,
      pacingProfile,
      domainBreakdown,
      reviewPriorityQueue,
      readinessSignal,
      stageCounts,
      skillGroups,
      mistakeLedger,
      coachPlan,
      rows,
    };
  }

  function trimPracticeReports(existing = [], report = null, limit = 20) {
    const reports = Array.isArray(existing) ? existing.slice() : [];
    if (report) reports.unshift(report);
    return reports.slice(0, limit);
  }

  return {
    buildMistakeLedger,
    buildPracticeSessionReport,
    buildDomainBreakdown,
    buildExamReadinessSignal,
    buildPacingProfile,
    buildReviewPriorityQueue,
    buildSessionRows,
    reviewPriorityForRow,
    sessionAttemptMap,
    sessionIssueCounts,
    trimPracticeReports,
  };
});
