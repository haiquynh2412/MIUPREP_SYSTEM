(function initSatStudioPracticeEngine(root, factory) {
  const practiceEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = practiceEngine;
  }
  if (root) {
    root.SatStudioPracticeEngine = practiceEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioPracticeEngine() {
  function averageNumber(values = []) {
    const clean = values.map(Number).filter(Number.isFinite);
    if (!clean.length) return 0;
    return clean.reduce((sum, value) => sum + value, 0) / clean.length;
  }

  function targetSecondsForQuestion(question = {}) {
    const base = question?.section === "Math" ? 95 : 70;
    const difficultyDelta = { Easy: -18, Medium: 0, Hard: 28 }[question?.difficulty] || 0;
    return Math.max(35, base + difficultyDelta);
  }

  function pacingFlagFor(question, correct, seconds) {
    const target = targetSecondsForQuestion(question);
    if (correct && seconds > target * 1.45) return "slow_correct";
    if (!correct && seconds < Math.max(20, target * 0.35)) return "fast_wrong";
    if (!correct && seconds > target * 1.6) return "time_pressure";
    return "";
  }

  function pacingLabel(flag) {
    const labels = {
      slow_correct: "Correct but slow",
      fast_wrong: "Fast wrong",
      time_pressure: "Time pressure",
      skipped: "Skipped",
    };
    return labels[flag] || "On pace";
  }

  function reviewDelayDaysForAttempt(question = {}, correct = false, meta = {}, errorType = "") {
    const mode = String(meta.practiceMode || "").toLowerCase();
    const issue = String(errorType || meta.errorType || meta.pacingFlag || "").toLowerCase();
    if (correct) {
      if (/maintenance/.test(mode)) return 14;
      if (/proof/.test(mode)) return 7;
      if (issue === "slow_correct") return 1;
      return 3;
    }
    if (question?.difficulty === "Hard" || question?.domain === "Advanced Math") return 3;
    if (/trap|misread|evidence|unsupported|transition|vocab|context/.test(issue)) return 2;
    if (/knowledge|foundation|skipped/.test(issue)) return 1;
    if (/calculation|careless|format|unit|time_pressure|fast_wrong/.test(issue)) return 1;
    return 1;
  }

  function normalizeHelpTelemetry(raw = {}, context = {}) {
    const nested = raw.helpTelemetry && typeof raw.helpTelemetry === "object" ? raw.helpTelemetry : {};
    const hintCount = Math.max(0, Number(raw.hintCount ?? nested.hintCount ?? 0) || 0);
    const hintUsed = Boolean(raw.hintUsed || raw.usedHint || nested.hintUsed || hintCount > 0);
    const fullSolutionViewed = Boolean(raw.fullSolutionViewed || raw.solutionViewed || nested.fullSolutionViewed);
    const fullSolutionRequested = Boolean(raw.fullSolutionRequested || raw.requestedFullSolution || nested.fullSolutionRequested);
    const helpTiming = String(raw.helpTiming || nested.helpTiming || context.helpTiming || (hintUsed || fullSolutionViewed ? "pre_submit" : "none")).toLowerCase();
    const preSubmitHelp = helpTiming === "pre_submit" && (hintUsed || fullSolutionViewed);
    return {
      schemaVersion: "attempt_help_telemetry_v1",
      hintUsed,
      hintCount,
      fullSolutionViewed,
      fullSolutionRequested,
      helpTiming,
      independentAttempt: !preSubmitHelp,
      source: raw.source || nested.source || context.source || "",
      capturedAt: raw.capturedAt || nested.capturedAt || context.capturedAt || "",
      updatedAt: raw.updatedAt || nested.updatedAt || context.updatedAt || "",
    };
  }

  function mergeHelpTelemetry(existing = {}, update = {}) {
    const current = normalizeHelpTelemetry(existing);
    const incrementHint = Number(update.incrementHintCount || update.incrementHint || 0) || 0;
    const merged = {
      ...current,
      ...update,
      hintCount: Math.max(Number(current.hintCount || 0), Number(update.hintCount || 0)) + Math.max(0, incrementHint),
      hintUsed: Boolean(current.hintUsed || update.hintUsed || incrementHint > 0),
      fullSolutionViewed: Boolean(current.fullSolutionViewed || update.fullSolutionViewed),
      fullSolutionRequested: Boolean(current.fullSolutionRequested || update.fullSolutionRequested),
      helpTiming:
        current.helpTiming === "pre_submit" || update.helpTiming === "pre_submit"
          ? "pre_submit"
          : update.helpTiming || current.helpTiming || "none",
      updatedAt: update.updatedAt || new Date().toISOString(),
    };
    return normalizeHelpTelemetry(merged);
  }

  function buildAttemptRecord(question, answer, correct, fromPretest = false, meta = {}, helpers = {}) {
    const now = helpers.now instanceof Date ? helpers.now : new Date(helpers.now || Date.now());
    const account = helpers.account || {};
    const suggestErrorType = helpers.suggestErrorType || (() => "");
    const inferredErrorType = meta.errorType || suggestErrorType(question, correct, { fromPretest, skipped: !answer, timedOut: meta.timedOut });
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + reviewDelayDaysForAttempt(question, correct, meta, inferredErrorType));
    const id = meta.id || helpers.id || `attempt-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
    const shouldSystemTag = Boolean(inferredErrorType && !correct);
    const timeSpentSeconds = Number(meta.timeSpentSeconds || 0);
    const learningEvidence = normalizeLearningEvidence(
      {
        remediationAttemptId: meta.remediationAttemptId || "",
        remediationLessonTaskKey: meta.remediationLessonTaskKey || "",
        helpTelemetry: meta.helpTelemetry || {},
        ...(meta.learningEvidence || {}),
      },
      { question, fromPretest, correct },
    );
    const helpTelemetry = learningEvidence.helpTelemetry || normalizeHelpTelemetry(meta.helpTelemetry || {}, { source: "attempt_meta" });

    return {
      id,
      questionId: question?.id || "",
      selectedAnswer: answer,
      correct: Boolean(correct),
      fromPretest: Boolean(fromPretest),
      at: now.toISOString(),
      dueAt: dueDate.toISOString(),
      errorType: correct && inferredErrorType !== "slow_correct" ? "" : inferredErrorType,
      errorNote: meta.errorNote || "",
      timeSpentSeconds: !fromPretest && answer ? Math.max(1, timeSpentSeconds) : timeSpentSeconds,
      pacingFlag: meta.pacingFlag || "",
      practiceMode: meta.practiceMode || (fromPretest ? "pretest" : "standard"),
      practiceSessionId: meta.practiceSessionId || "",
      remediationAttemptId: meta.remediationAttemptId || "",
      remediationLessonTaskKey: meta.remediationLessonTaskKey || "",
      markedForReview: Boolean(meta.markedForReview),
      taggedBy: meta.taggedBy || (shouldSystemTag ? "system" : ""),
      taggedByRole: meta.taggedByRole || (shouldSystemTag ? "system" : ""),
      taggedAt: meta.taggedAt || (shouldSystemTag ? now.toISOString() : ""),
      tagSource: meta.tagSource || (shouldSystemTag ? "system_suggested" : ""),
      accountId: meta.accountId || account.id || "",
      learningEvidence,
      helpTelemetry,
      hintUsed: helpTelemetry.hintUsed,
      hintCount: helpTelemetry.hintCount,
      fullSolutionViewed: helpTelemetry.fullSolutionViewed,
      independentAttempt: helpTelemetry.independentAttempt,
    };
  }

  function normalizeLearningEvidence(raw = {}, context = {}) {
    const clean = (value) => String(value || "").trim().slice(0, 1200);
    const question = context.question || {};
    const required = Boolean(
      raw.required ||
        raw.evidenceRequired ||
        question.difficulty === "Hard" ||
        raw.remediationAttemptId ||
        raw.remediationLessonTaskKey,
    );
    const firstMove = clean(raw.firstMove || raw.firstStep);
    const studentWork = clean(raw.studentWork || raw.writtenWork || raw.proof);
    const evidenceCitation = clean(raw.evidenceCitation || raw.evidence || raw.verification);
    const hasEvidence = Boolean(firstMove || studentWork || evidenceCitation);
    const helpTelemetry = normalizeHelpTelemetry(raw.helpTelemetry || raw, { source: raw.source || "practice_panel" });
    return {
      schemaVersion: "attempt_learning_evidence_v1",
      required,
      status: hasEvidence ? "provided" : required ? "missing" : "optional_empty",
      firstMove,
      studentWork,
      evidenceCitation,
      helpTelemetry,
      hintUsed: helpTelemetry.hintUsed,
      hintCount: helpTelemetry.hintCount,
      fullSolutionViewed: helpTelemetry.fullSolutionViewed,
      proofQuality: hasEvidence ? (context.correct ? "supports_correct" : "available_for_review") : required ? "missing" : "not_requested",
      capturedAt: raw.capturedAt || "",
    };
  }

  function shouldRequireAttemptEvidence(question = null, meta = {}) {
    if (!question) return false;
    const text = `${question.section || ""} ${question.domain || ""} ${question.skill || ""}`.toLowerCase();
    const proofSkills = ["advanced math", "nonlinear", "systems of equations", "quadratic", "command of evidence", "inference", "cross-text", "text structure", "central ideas"];
    return Boolean(meta.evidenceRequired || meta.remediationAttemptId || meta.remediationLessonTaskKey || question.difficulty === "Hard" || proofSkills.some((term) => text.includes(term)));
  }

  function attemptEvidenceCopy(question = {}, options = {}) {
    const vi = options.language === "vi";
    const required = Boolean(options.required);
    const isMath = question.section === "Math";
    const copy = vi
      ? {
          summary: required ? "Bắt buộc ghi bước chứng minh" : "Ghi nhanh bước làm",
          hint: required ? "Ghi ít nhất một bước kiểm chứng để hệ thống phân tích lỗi học tập chính xác hơn." : "Không bắt buộc, nhưng một dòng chứng minh giúp ôn sai tốt hơn.",
          firstMoveLabel: "Bước đầu tiên",
          workLabel: isMath ? "Biến đổi / phép tính" : "Lập luận",
          evidenceLabel: isMath ? "Kiểm chứng / Desmos" : "Dẫn chứng trong bài đọc",
          firstPlaceholder: isMath ? "Ví dụ: đặt biệt thức bằng 0" : "Ví dụ: xác định claim trước",
          workPlaceholder: isMath ? "Ghi phương trình, phép biến đổi, hoặc điều kiện." : "Ghi vì sao đáp án đúng theo passage.",
          evidencePlaceholder: isMath ? "Ghi cách kiểm tra lại: thay số, graph, bảng, hoặc Desmos." : "Ghi cụm từ/dữ kiện làm bằng chứng.",
        }
      : {
          summary: required ? "Required proof note" : "Quick proof note",
          hint: required ? "Write at least one verification step so the learning system can diagnose the attempt accurately." : "Optional, but one proof line makes mistake review more useful.",
          firstMoveLabel: "First move",
          workLabel: isMath ? "Equation / calculation" : "Reasoning",
          evidenceLabel: isMath ? "Verification / Desmos" : "Text evidence",
          firstPlaceholder: isMath ? "Example: set the discriminant to 0" : "Example: identify the claim first",
          workPlaceholder: isMath ? "Write the equation, transformation, or condition." : "Write why the answer follows from the passage.",
          evidencePlaceholder: isMath ? "Check by substitution, graph, table, or Desmos." : "Quote or paraphrase the supporting clue.",
        };
    return copy;
  }

  function countValues(values = []) {
    return values.reduce((acc, value) => {
      const key = value || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function coachSummaryForSession({ wrongRows = [], slowRows = [], skippedRows = [], issueCounts = {} } = {}) {
    if (skippedRows.length) return `${skippedRows.length} skipped item${skippedRows.length === 1 ? "" : "s"}: pacing discipline is the first fix.`;
    if (wrongRows.length) return `${wrongRows.length} wrong item${wrongRows.length === 1 ? "" : "s"}: teach before retest, then prove on new context.`;
    if (slowRows.length) return `${slowRows.length} slow correct item${slowRows.length === 1 ? "" : "s"}: accuracy is present, speed is the constraint.`;
    if (issueCounts.marked) return "No major miss, but marked questions need uncertainty notes.";
    return "Clean session: move one notch harder or shorter timed intervals.";
  }

  function buildSessionCoachPlan({ rows = [], skillGroups = [], mistakeLedger = [], issueCounts = {} } = {}) {
    const topIssueSkill = skillGroups[0];
    const wrongRows = rows.filter((row) => row.attempted && !row.correct);
    const slowRows = rows.filter((row) => row.pacingFlag === "slow_correct" || row.errorType === "slow_correct");
    const skippedRows = rows.filter((row) => !row.attempted);
    const mainError = mistakeLedger[0]?.errorType || (skippedRows.length ? "skipped" : slowRows.length ? "slow_correct" : "");
    const nextBestAction = topIssueSkill
      ? `${topIssueSkill.skill}: ${topIssueSkill.recommendation}`
      : "Do a short mixed set, then review the report before adding new questions.";

    const weeklyPlan = [
      {
        label: "Today",
        action: mistakeLedger.length
          ? `${mistakeLedger[0].lessonTitle}. ${mistakeLedger[0].remediationAction}`
          : "Write one note about the hardest question and keep the skill in maintenance.",
      },
      {
        label: "Next session",
        action: topIssueSkill
          ? `Do 5 targeted questions in ${topIssueSkill.skill}; stop after each miss for a mini lesson.`
          : "Run a 5-Minute Sprint with hard transfer questions.",
      },
      {
        label: "Weekly proof",
        action:
          wrongRows.length || skippedRows.length
            ? "Retest the same skills under timer only after the open mistakes show proof-passed."
            : "Increase difficulty or move this skill to timed maintenance.",
      },
    ];

    return {
      summary: coachSummaryForSession({ wrongRows, slowRows, skippedRows, issueCounts }),
      mainError,
      nextBestAction,
      weeklyPlan,
    };
  }

  function firstOpenSkill(skillRows = []) {
    return [...(skillRows || [])]
      .filter((row) => row && row.status !== "Mastered")
      .sort((a, b) => Number(a.mastery || 0) - Number(b.mastery || 0) || String(a.skill || "").localeCompare(String(b.skill || "")))[0] || {};
  }

  function sprintTargetFrom(item = {}) {
    return {
      section: item.section || "All",
      domain: item.domain || "All",
      skill: item.skill || item.label || "All",
    };
  }

  function buildSprintPrescription({
    phase = {},
    skillRows = [],
    remediationQueue = [],
    dueReviewCount = 0,
    targetScore = 1500,
    readiness = {},
  } = {}) {
    const phaseId = phase.id || phase.phaseId || "standard_build";
    const openRemediation = (remediationQueue || []).filter((item) => item && item.proofPassed !== true && item.status !== "proof_passed");
    const priority = openRemediation[0] || firstOpenSkill(skillRows);
    const target = sprintTargetFrom(priority);
    const readinessScore = Number(readiness.score || readiness.readinessScore || 0);
    const closedLoop = ["select", "attempt", "tag_error", "review", "proof", "schedule_review", "refresh_roadmap"];
    const base = {
      phaseId,
      target,
      dueReviewCount: Math.max(0, Number(dueReviewCount || 0)),
      closedLoop,
    };

    if (phaseId === "diagnostic_baseline" || phaseId === "diagnostic") {
      return {
        ...base,
        mode: "Diagnostic Preview",
        count: 20,
        minutes: 35,
        difficulty: "Blueprint mixed",
        entryRule: "No reliable baseline yet.",
        exitRule: "Finish the baseline and review every miss before normal practice.",
        routingBias: ["blueprint_coverage", "thin_skills", "medium_anchor"],
        proofRequired: false,
      };
    }

    if (phaseId === "remedial_drill" || openRemediation.length || dueReviewCount > 0) {
      return {
        ...base,
        mode: "Remedial Sprint",
        count: 10,
        minutes: 15,
        difficulty: "Easy/Medium first",
        entryRule: "Open remediation, due review, or same-skill wrong answer.",
        exitRule: "Reach 85% foundation accuracy, then pass a fresh proof item.",
        routingBias: ["due_review", "same_skill", "same_error_type"],
        proofRequired: true,
      };
    }

    if (phaseId === "proof_transfer") {
      return {
        ...base,
        mode: "Proof Transfer Sprint",
        count: 8,
        minutes: 12,
        difficulty: "Medium/Hard fresh forms",
        entryRule: "Foundation accuracy is stable but transfer evidence is incomplete.",
        exitRule: "Pass fresh medium/hard items without repeating the same template.",
        routingBias: ["new_context", "skeleton_diversity", "timed_transfer"],
        proofRequired: true,
      };
    }

    if (phaseId === "crucible_1500" || (Number(targetScore || 0) >= 1500 && readinessScore >= 65)) {
      return {
        ...base,
        mode: "1500+ Crucible",
        count: 12,
        minutes: 18,
        difficulty: "Hard only",
        entryRule: "The 1500+ path is active and no foundation blocker is open.",
        exitRule: "Pass 3 hard timed fresh proof items across different forms.",
        routingBias: ["hard_same_skill", "hard_transfer", "mixed_blueprint"],
        proofRequired: true,
      };
    }

    if (phaseId === "maintenance") {
      return {
        ...base,
        mode: "Maintenance Spiral",
        count: 10,
        minutes: 15,
        difficulty: "Mixed Medium/Hard",
        entryRule: "Core skills are stable; keep spacing and pacing active.",
        exitRule: "No overdue review and no recent wrong answer in mastered skills.",
        routingBias: ["due_review", "mixed_blueprint", "pacing_watch"],
        proofRequired: false,
      };
    }

    return {
      ...base,
      mode: "Standard Skill Sprint",
      count: 12,
      minutes: 20,
      difficulty: "Easy to Medium to Hard",
      entryRule: "Diagnostic exists and no urgent remediation blocks the day.",
      exitRule: "Pass 2 clean medium items and 1 timed hard transfer item.",
      routingBias: ["weak_skill", "fresh_questions", "difficulty_ladder"],
      proofRequired: true,
    };
  }

  function sessionRowRecommendation({ question, attempt, mastery, errorType, pacingFlag, helpers = {} } = {}) {
    const masteryStageExit = helpers.masteryStageExit || (() => "Collect enough evidence, then retry new questions.");
    const errorTagLabel = helpers.errorTagLabel || ((value) => value || "Wrong answer");
    const stage = mastery?.masteryStage || "Collect evidence";
    if (!attempt) return "Retry this item under timer; unanswered questions count as pacing risk.";
    if (!attempt.correct) {
      const label = errorType ? errorTagLabel(errorType) : "Wrong answer";
      return `${label}: ${masteryStageExit(stage)}`;
    }
    if (pacingFlag === "slow_correct" || errorType === "slow_correct") return "Correct but slow: redo similar items until the solution path is automatic.";
    if (attempt.markedForReview) return "Marked for review: write why it felt uncertain, then do one transfer question.";
    if (question?.difficulty === "Hard") return "Hard proof passed: keep this skill in timed maintenance.";
    return "Maintain: move to a harder or timed version of this skill.";
  }

  function sessionSkillRecommendation(item = {}, helpers = {}) {
    const masteryStageExit = helpers.masteryStageExit || (() => "Pass a short proof set.");
    if (item.skipped) return "Run a shorter timed set and answer every item before review.";
    if (item.wrong) return `${masteryStageExit(item.masteryStage)} Then retry new questions in this skill.`;
    if (item.slow) return "Do a timed mastery pass; keep accuracy while reducing seconds per question.";
    if (item.marked) return "Review uncertainty notes, then do one transfer item.";
    return "Keep in maintenance rotation.";
  }

  function buildSessionSkillGroups(rows = [], helpers = {}) {
    const map = new Map();
    rows.forEach((row) => {
      const key = `${row.section}|${row.domain}|${row.skill}`;
      const item = map.get(key) || {
        section: row.section,
        domain: row.domain,
        skill: row.skill,
        total: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        slow: 0,
        marked: 0,
        avgSeconds: 0,
        masteryStage: row.masteryStage,
        recommendation: "",
        seconds: [],
      };
      item.total += 1;
      if (row.attempted) item.attempted += 1;
      if (row.correct) item.correct += 1;
      if (row.attempted && !row.correct) item.wrong += 1;
      if (!row.attempted) item.skipped += 1;
      if (row.pacingFlag === "slow_correct" || row.errorType === "slow_correct" || row.pacingFlag === "time_pressure") item.slow += 1;
      if (row.markedForReview) item.marked += 1;
      if (row.timeSpentSeconds) item.seconds.push(row.timeSpentSeconds);
      map.set(key, item);
    });
    return [...map.values()]
      .map((item) => ({
        ...item,
        avgSeconds: Math.round(averageNumber(item.seconds)),
        accuracy: item.attempted ? Math.round((item.correct / item.attempted) * 100) : 0,
        recommendation: sessionSkillRecommendation(item, helpers),
        seconds: undefined,
      }))
      .sort((a, b) => b.wrong + b.skipped + b.slow + b.marked - (a.wrong + a.skipped + a.slow + a.marked) || a.skill.localeCompare(b.skill));
  }

  return {
    averageNumber,
    attemptEvidenceCopy,
    buildAttemptRecord,
    buildSessionCoachPlan,
    buildSessionSkillGroups,
    buildSprintPrescription,
    coachSummaryForSession,
    countValues,
    mergeHelpTelemetry,
    normalizeHelpTelemetry,
    pacingFlagFor,
    pacingLabel,
    normalizeLearningEvidence,
    reviewDelayDaysForAttempt,
    sessionRowRecommendation,
    sessionSkillRecommendation,
    shouldRequireAttemptEvidence,
    targetSecondsForQuestion,
  };
});
