(function initSatStudioAdaptiveRoutingEngine(root, factory) {
  const adaptiveRoutingEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = adaptiveRoutingEngine;
  }
  if (root) {
    root.SatStudioAdaptiveRoutingEngine = adaptiveRoutingEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioAdaptiveRoutingEngine() {
  const SECTION_LABELS = ["Reading and Writing", "Math"];
  const ROUTE_ORDER = { easy: 0, standard: 1, hard: 2 };
  const BLUEPRINT_WEIGHTS = {
    "Reading and Writing": {
      "Information and Ideas": 0.26,
      "Craft and Structure": 0.28,
      "Expression of Ideas": 0.20,
      "Standard English Conventions": 0.26,
    },
    Math: {
      Algebra: 0.35,
      "Advanced Math": 0.35,
      "Problem-Solving and Data Analysis": 0.15,
      "Geometry and Trigonometry": 0.15,
    },
  };

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function ratio(correct, total) {
    const denominator = Number(total) || 0;
    if (!denominator) return 0;
    return clampNumber((Number(correct) || 0) / denominator, 0, 1);
  }

  function weightedAccuracy(row = {}) {
    if (Number(row.weightedTotal) > 0) return ratio(row.weightedCorrect, row.weightedTotal);
    return ratio(row.correct, row.total);
  }

  function normalizeDifficulty(value = "") {
    const label = String(value || "").trim().toLowerCase();
    if (label === "easy") return "Easy";
    if (label === "hard") return "Hard";
    return "Medium";
  }

  function normalizeRoute(value = "") {
    const label = String(value || "").trim().toLowerCase();
    if (label === "easy" || label === "foundation") return "easy";
    if (label === "hard" || label === "advanced") return "hard";
    return "standard";
  }

  function scopeKey(scope = {}) {
    return `${scope.section || "All"}|${scope.domain || "All"}|${scope.skill || scope.label || "All"}`;
  }

  function questionSkeletonKey(question = {}) {
    return (
      question?.skeletonDiversity?.skeletonId ||
      question?.templateDiversity?.formId ||
      question?.skeletonId ||
      question?.templateId ||
      ""
    );
  }

  function normalizeTags(question = {}) {
    return [
      ...(Array.isArray(question.tags) ? question.tags : []),
      question.trapType,
      question.errorType,
      question.cognitiveMove,
      question.calculator,
      question.calculatorTag,
      question.desmos,
      question.desmosTag,
      question.toolTag,
    ]
      .map((tag) => String(tag || "").toLowerCase().replace(/[\s-]+/g, "_"))
      .filter(Boolean);
  }

  function confidenceForEvidence({ total = 0, hard = 0, timed = 0, sectionCount = 1 } = {}) {
    const count = Number(total) || 0;
    const hardCount = Number(hard) || 0;
    const timedCount = Number(timed) || 0;
    const sections = Math.max(1, Number(sectionCount) || 1);
    let score = 0;
    if (count >= 3) score += 25;
    if (count >= 5) score += 20;
    if (count >= 10) score += 20;
    if (hardCount >= 2) score += 15;
    if (timedCount >= 5) score += 10;
    if (sections >= 2) score += 10;
    const clamped = clampNumber(score, 0, 100);
    if (count < 3) {
      return {
        score: Math.min(clamped, 25),
        label: "low",
        reason: "Too few answered questions to route aggressively.",
        minimumEvidence: "Collect at least 5 same-section items before using a hard/easy route as a stable signal.",
      };
    }
    if (clamped >= 75) {
      return {
        score: clamped,
        label: "high",
        reason: "Enough volume and difficulty mix for a reliable routing signal.",
        minimumEvidence: "",
      };
    }
    if (clamped >= 45) {
      return {
        score: clamped,
        label: "medium",
        reason: "Useful routing signal, but still needs a proof set before high-stakes placement.",
        minimumEvidence: "Confirm with a timed same-section proof set.",
      };
    }
    return {
      score: clamped,
      label: "low",
      reason: "Evidence is useful for coaching, not for exact placement.",
      minimumEvidence: "Add more same-skill and same-section attempts before treating the route as stable.",
    };
  }

  function routeForModule(moduleResult = {}, nextModule = {}) {
    if (!nextModule?.adaptiveFromPreviousSection) return normalizeRoute(nextModule?.route || "standard");
    const total = Number(moduleResult.total) || 0;
    const acc = ratio(moduleResult.correct, moduleResult.total);
    const confidence = confidenceForEvidence({
      total,
      hard: normalizeRoute(moduleResult.route) === "hard" ? Math.max(1, Math.round(total / 2)) : 0,
      timed: moduleResult.timedOut ? 0 : total,
      sectionCount: 1,
    });

    if (!total || confidence.label === "low") return "standard";
    if (moduleResult.timedOut && acc < 0.85) return acc <= 0.5 ? "easy" : "standard";
    if (acc >= 0.72) return "hard";
    if (acc <= 0.48) return "easy";
    return "standard";
  }

  function moduleRoutingSignal(moduleResult = {}, nextModule = {}) {
    const route = routeForModule(moduleResult, { adaptiveFromPreviousSection: true, section: moduleResult.section, ...nextModule });
    const total = Number(moduleResult.total) || 0;
    const accuracy = ratio(moduleResult.correct, moduleResult.total);
    const confidence = confidenceForEvidence({
      total,
      hard: normalizeRoute(moduleResult.route) === "hard" ? Math.max(1, Math.round(total / 2)) : 0,
      timed: moduleResult.timedOut ? 0 : total,
      sectionCount: 1,
    });
    const label = moduleResult.label || moduleResult.section || "Module";
    const pacingRisk = Boolean(moduleResult.timedOut && accuracy < 0.85);
    const rationale = pacingRisk
      ? `${label}: time pressure lowered confidence; route should not jump harder yet.`
      : confidence.label === "low"
        ? `${label}: collect more evidence before adaptive escalation.`
        : route === "hard"
          ? `${label}: accuracy supports harder routing, provided the next proof set stays timed.`
          : route === "easy"
            ? `${label}: route down to foundation repair before standard retest.`
            : `${label}: keep standard routing and repair weak subskills first.`;
    return {
      label,
      section: moduleResult.section || "",
      currentRoute: normalizeRoute(moduleResult.route || moduleResult.adaptiveRoute || "standard"),
      recommendedRoute: route,
      accuracy,
      total,
      correct: Number(moduleResult.correct) || 0,
      timedOut: Boolean(moduleResult.timedOut),
      pacingRisk,
      confidence,
      rationale,
    };
  }

  function scoreSignalForSection(section, row = {}, options = {}) {
    const total = Number(row.total) || 0;
    const accuracy = weightedAccuracy(row);
    const hard = Number(row.difficultyCounts?.Hard) || 0;
    const confidence = confidenceForEvidence({
      total,
      hard,
      timed: options.timed ? total : 0,
      sectionCount: 1,
    });
    const center = Math.round((200 + accuracy * 600) / 10) * 10;
    const spread = confidence.label === "high" ? 35 : confidence.label === "medium" ? 60 : 90;
    const low = clampNumber(Math.round((center - spread) / 10) * 10, 200, 800);
    const high = clampNumber(Math.round((center + spread) / 10) * 10, 200, 800);
    const readinessBand = total < 5
      ? "evidence_needed"
      : accuracy >= 0.9 && hard >= 2
        ? "elite_proof"
        : accuracy >= 0.75
          ? "advanced_path"
          : accuracy >= 0.55
            ? "core_path"
            : "foundation_repair";
    return {
      section,
      total,
      correct: Number(row.correct) || 0,
      weightedAccuracy: accuracy,
      scoreRange: [low, high],
      confidence,
      readinessBand,
      disclosure: "This is a diagnostic range, not an official SAT score.",
    };
  }

  function rowPriority(row = {}, type = "skill") {
    const accuracy = weightedAccuracy(row);
    const total = Number(row.total) || 0;
    const difficultyCounts = row.difficultyCounts || {};
    const hardMissWeight = Math.max(0, Number(difficultyCounts.Hard) || 0) * 4;
    const blueprintWeight = BLUEPRINT_WEIGHTS[row.section]?.[row.domain || row.label] || (type === "domain" ? 0.18 : 0.1);
    const evidenceWeight = total < 3 ? 18 : total < 5 ? 8 : 0;
    const score = Math.round((1 - accuracy) * 100 + hardMissWeight + blueprintWeight * 35 + evidenceWeight);
    const confidence = confidenceForEvidence({
      total,
      hard: Number(difficultyCounts.Hard) || 0,
      timed: 0,
      sectionCount: 1,
    });
    return {
      ...row,
      type,
      label: row.label || row.skill || row.domain || "Unknown",
      weightedAccuracy: accuracy,
      priorityScore: score,
      confidence,
      blueprintWeight,
      rootCause: accuracy < 0.45
        ? "Foundation recognition is unstable."
        : accuracy < 0.7
          ? "Core skill is not reliable across SAT-style forms."
          : "Hard transfer and trap recognition still need proof.",
      action: accuracy < 0.45
        ? "Relearn concept, then do 8 scaffolded items before timed work."
        : accuracy < 0.7
          ? "Do 10 medium transfer items and explain every wrong choice."
          : "Use hard timed proof items with trap analysis.",
    };
  }

  function sortedPriorityRows(rows = {}, type = "skill", limit = 6) {
    return Object.values(rows || {})
      .map((row) => rowPriority(row, type))
      .sort((a, b) => b.priorityScore - a.priorityScore || a.weightedAccuracy - b.weightedAccuracy || b.total - a.total)
      .slice(0, limit);
  }

  function combinedRoutingConfidence(signals = []) {
    if (!signals.length) return confidenceForEvidence({ total: 0 });
    const totalEvidence = signals.reduce((sum, signal) => sum + (Number(signal.total) || 0), 0);
    const score = Math.round(signals.reduce((sum, signal) => sum + (Number(signal.confidence?.score) || 0), 0) / signals.length);
    const label = score >= 75 ? "high" : score >= 45 ? "medium" : "low";
    return {
      score,
      label,
      reason: `${totalEvidence} scored diagnostic item${totalEvidence === 1 ? "" : "s"} across ${signals.length} section signal${signals.length === 1 ? "" : "s"}.`,
      minimumEvidence: label === "high" ? "" : "Use more same-section evidence before treating placement as stable.",
    };
  }

  function buildNextActions({ prioritySkills = [], priorityDomains = [], moduleRouting = [], scoreSignals = [] } = {}) {
    const actions = [];
    const pacingModule = moduleRouting.find((item) => item.pacingRisk);
    if (pacingModule) {
      actions.push({
        id: "repair-pacing-before-route",
        priority: "P0",
        title: `Repair pacing before ${pacingModule.section || "next module"} routing`,
        detail: pacingModule.rationale,
        target: { section: pacingModule.section || "All", domain: "All", skill: "All", difficulty: "Medium" },
        proof: "Complete a timed same-section mini-module without timeout and with 72%+ accuracy.",
      });
    }
    const firstSkill = prioritySkills[0];
    if (firstSkill) {
      actions.push({
        id: "repair-priority-skill",
        priority: "P0",
        title: `Repair ${firstSkill.label}`,
        detail: firstSkill.action,
        target: {
          section: firstSkill.section || "All",
          domain: firstSkill.domain || "All",
          skill: firstSkill.label,
          difficulty: firstSkill.weightedAccuracy < 0.45 ? "Easy" : "Medium",
        },
        proof: "Pass a fresh medium transfer item, then one hard item if available.",
      });
    }
    const firstDomain = priorityDomains[0];
    if (firstDomain && (!firstSkill || firstDomain.label !== firstSkill.domain)) {
      actions.push({
        id: "broaden-domain-evidence",
        priority: "P1",
        title: `Broaden evidence in ${firstDomain.label}`,
        detail: "Run a mixed domain set so the engine can separate concept gaps from one-off misses.",
        target: { section: firstDomain.section || "All", domain: firstDomain.label, skill: "All", difficulty: "All" },
        proof: "Score 75%+ on a mixed domain mini-set.",
      });
    }
    const weakScore = scoreSignals.find((signal) => signal.readinessBand === "evidence_needed" || signal.readinessBand === "foundation_repair");
    if (weakScore) {
      actions.push({
        id: "collect-placement-evidence",
        priority: "P1",
        title: `Collect stronger ${weakScore.section} placement evidence`,
        detail: weakScore.confidence.minimumEvidence || "Evidence is too thin for aggressive routing.",
        target: { section: weakScore.section, domain: "All", skill: "All", difficulty: "Medium" },
        proof: "Finish at least 5 same-section items with answer review.",
      });
    }
    return actions.slice(0, 5);
  }

  function buildAdaptiveRoutingProfile(summary = {}, options = {}) {
    const sections = SECTION_LABELS
      .filter((section) => summary.bySection?.[section])
      .map((section) => scoreSignalForSection(section, summary.bySection[section], { timed: Boolean(summary.timeLimitSeconds) }));
    const moduleRouting = (summary.moduleResults || []).map((moduleResult) => moduleRoutingSignal(moduleResult));
    const priorityDomains = sortedPriorityRows(summary.byDomain || {}, "domain", 6);
    const prioritySkills = sortedPriorityRows(summary.bySkill || {}, "skill", 8);
    const scoreSignals = sections.length ? sections : [
      scoreSignalForSection("All", {
        total: summary.total,
        correct: summary.correct,
        weightedTotal: summary.total,
        weightedCorrect: summary.correct,
      }),
    ];
    const routingConfidence = combinedRoutingConfidence(scoreSignals);
    const nextActions = buildNextActions({ prioritySkills, priorityDomains, moduleRouting, scoreSignals });
    const cautions = [];
    if (routingConfidence.label !== "high") cautions.push("Do not treat this as a fixed score; use it as a routing signal only.");
    if ((summary.total || 0) < 20) cautions.push("Short diagnostics need confirmation before assigning a long-term roadmap.");
    if ((summary.reviewItems || []).some((item) => item.selectedAnswer === null || item.selectedAnswer === undefined || item.selectedAnswer === "")) {
      cautions.push("Unanswered items must be separated from concept misses in review.");
    }
    return {
      version: "adaptive-routing-2026-05-24",
      generatedAt: options.nowIso || new Date().toISOString(),
      targetScore: options.targetScore || null,
      scoreSignals,
      routingConfidence,
      moduleRouting,
      priorityDomains,
      prioritySkills,
      nextActions,
      cautions,
      scoreDisclosure: "Placement is derived from weighted diagnostic evidence, sample size, timing, difficulty, and SAT domain coverage. It is not an official SAT score.",
    };
  }

  function attemptedQuestionIds(profile = {}) {
    return new Set([
      ...(profile.attempts || []).map((attempt) => attempt.questionId).filter(Boolean),
      ...((profile.pretests || []).flatMap((test) => (test.answers || []).map((answer) => answer.questionId))).filter(Boolean),
    ]);
  }

  function questionEligible(question = {}, attemptedIds = new Set()) {
    if (!question?.id || attemptedIds.has(question.id)) return false;
    if (question.reviewStatus && !["reviewed", "approved"].includes(String(question.reviewStatus).toLowerCase())) return false;
    if (["rejected", "blocked", "audit_blocked"].includes(String(question.reviewStatus || "").toLowerCase())) return false;
    if (["hidden_duplicate", "blocked_public_candidate", "audit_blocked"].includes(String(question.practicePool || "").toLowerCase())) return false;
    return true;
  }

  function difficultyRank(questionDifficulty = "", preferredDifficulty = "All") {
    const q = normalizeDifficulty(questionDifficulty);
    const preferred = normalizeDifficulty(preferredDifficulty);
    if (preferredDifficulty === "All") return q === "Medium" ? 0 : q === "Hard" ? 1 : 2;
    return q === preferred ? 0 : q === "Medium" ? 1 : 2;
  }

  function buildRoutingContext(questions = [], profile = {}, routingProfile = {}) {
    const questionMap = new Map(questions.map((question) => [question.id, question]));
    const weakSkillKeys = new Set((routingProfile.prioritySkills || []).slice(0, 6).map((row) => scopeKey(row)));
    const weakDomainKeys = new Set((routingProfile.priorityDomains || []).slice(0, 4).map((row) => `${row.section || "All"}|${row.domain || row.label || "All"}`));
    const missedSkillKeys = new Set();
    const missedDomainKeys = new Set();
    const missedSkeletons = new Set();
    const recentErrorTypes = {};
    const dueIds = new Set();
    const now = Date.now();

    (profile.attempts || []).forEach((attempt) => {
      const question = questionMap.get(attempt.questionId);
      if (!question) return;
      const dueAt = Date.parse(attempt.dueAt || "");
      if (!attempt.correct || (Number.isFinite(dueAt) && dueAt <= now)) dueIds.add(question.id);
      const needsRepair = !attempt.correct || attempt.errorType || attempt.pacingFlag === "slow_correct" || attempt.markedForReview;
      if (!needsRepair) return;
      missedSkillKeys.add(scopeKey(question));
      missedDomainKeys.add(`${question.section || "All"}|${question.domain || "All"}`);
      const skeleton = questionSkeletonKey(question);
      if (skeleton) missedSkeletons.add(skeleton);
      const errorType = attempt.errorType || attempt.pacingFlag || (!attempt.correct ? "wrong" : "marked");
      recentErrorTypes[errorType] = (recentErrorTypes[errorType] || 0) + 1;
    });

    return {
      crucibleMode: Number(routingProfile.targetScore || profile?.account?.targetScore || 0) >= 1500,
      dueIds,
      missedDomainKeys,
      missedSkeletons,
      missedSkillKeys,
      recentErrorTypes,
      weakDomainKeys,
      weakSkillKeys,
    };
  }

  function targetScore(question = {}, target = {}, context = {}) {
    let score = 0;
    if (!target || !question) return score;
    if (target.section === "All" || question.section === target.section) score += 4;
    if (target.domain === "All" || question.domain === target.domain) score += 5;
    if (target.skill === "All" || question.skill === target.skill) score += 7;
    score -= difficultyRank(question.difficulty, target.difficulty || "All");
    const tags = normalizeTags(question);
    const qSkillKey = scopeKey(question);
    const qDomainKey = `${question.section || "All"}|${question.domain || "All"}`;
    const skeleton = questionSkeletonKey(question);
    if (context.dueIds?.has(question.id)) score += 100;
    if (context.weakSkillKeys?.has(qSkillKey)) score += 8;
    if (context.missedSkillKeys?.has(qSkillKey)) score += 9;
    if (context.weakDomainKeys?.has(qDomainKey) || context.missedDomainKeys?.has(qDomainKey)) score += 4;
    if (skeleton && context.missedSkeletons?.has(skeleton)) score += 5;
    if (context.crucibleMode && question.difficulty === "Hard") score += 7;
    if (context.crucibleMode && ["Algebra", "Advanced Math"].includes(question.domain)) score += 2;
    if ((context.recentErrorTypes?.trap_answer || 0) && tags.some((tag) => tag.includes("trap") || tag.includes("distractor"))) score += 3;
    if ((context.recentErrorTypes?.time_pressure || context.recentErrorTypes?.slow_correct || 0) && tags.some((tag) => tag.includes("shortcut") || tag.includes("desmos") || tag.includes("calculator"))) score += 2;
    if ((context.recentErrorTypes?.evidence || context.recentErrorTypes?.misread_prompt || 0) && tags.some((tag) => tag.includes("evidence") || tag.includes("inference") || tag.includes("claim"))) score += 2;
    if (target.tool && tags.includes(String(target.tool).toLowerCase().replace(/[\s-]+/g, "_"))) score += 3;
    if (question.section === "Math" && question.domain === "Advanced Math" && tags.some((tag) => tag.includes("desmos"))) score += 2;
    if (question.section === "Math" && tags.some((tag) => tag.includes("calculator"))) score += 1;
    if (String(question.sourceType || "").toLowerCase().includes("official")) score += 1;
    return score;
  }

  function bucketToolMix(questions = []) {
    return questions.reduce(
      (acc, question) => {
        const tags = [
          ...(Array.isArray(question.tags) ? question.tags : []),
          question.calculator,
          question.calculatorTag,
          question.desmos,
          question.desmosTag,
          question.toolTag,
        ].map((tag) => String(tag || "").toLowerCase().replace(/[\s-]+/g, "_"));
        if (tags.some((tag) => tag.includes("desmos"))) acc.desmos += 1;
        if (tags.some((tag) => tag.includes("calculator"))) acc.calculator += 1;
        return acc;
      },
      { calculator: 0, desmos: 0 },
    );
  }

  function selectDiverseBySkeleton(scored = [], count = 0, options = {}) {
    const selected = [];
    const usedSkeletons = new Set(options.usedSkeletons || []);
    scored.forEach((item) => {
      if (selected.length >= count) return;
      const skeleton = questionSkeletonKey(item.question);
      if (skeleton && usedSkeletons.has(skeleton)) return;
      selected.push(item);
      if (skeleton) usedSkeletons.add(skeleton);
    });
    scored.forEach((item) => {
      if (selected.length >= count) return;
      if (!selected.some((row) => row.question.id === item.question.id)) selected.push(item);
    });
    return selected.map((item) => item.question);
  }

  function selectQuestionsForTarget(questions = [], target = {}, attemptedIds = new Set(), count = 6, context = {}, options = {}) {
    const minDifficulty = options.minDifficulty || "";
    const scored = questions
      .filter((question) => questionEligible(question, attemptedIds))
      .filter((question) => !minDifficulty || normalizeDifficulty(question.difficulty) === normalizeDifficulty(minDifficulty))
      .map((question) => ({ question, score: targetScore(question, target, context) }))
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          difficultyRank(a.question.difficulty, target.difficulty) - difficultyRank(b.question.difficulty, target.difficulty) ||
          String(a.question.id || "").localeCompare(String(b.question.id || "")),
      );
    const selected = selectDiverseBySkeleton(scored, count, options);
    if (selected.length || !minDifficulty) return selected;
    return selectQuestionsForTarget(questions, target, attemptedIds, count, context, { ...options, minDifficulty: "" });
  }

  function buildQuestionRecommendationPlan({ questions = [], routingProfile = {}, profile = {}, limit = 18 } = {}) {
    const attemptedIds = attemptedQuestionIds(profile);
    const nextActions = Array.isArray(routingProfile.nextActions) ? routingProfile.nextActions : [];
    const context = buildRoutingContext(questions, profile, routingProfile);
    const buckets = [];
    const crucibleMode = context.crucibleMode || (routingProfile.prioritySkills || []).some((row) => Number(row.weightedAccuracy || 0) >= 0.7);
    const primary = nextActions[0]?.target || routingProfile.prioritySkills?.[0];
    const secondary = crucibleMode
      ? routingProfile.priorityDomains?.[0] || nextActions[1]?.target
      : nextActions[1]?.target || routingProfile.priorityDomains?.[0];
    const primaryCount = crucibleMode ? Math.max(4, Math.round(limit * 0.3)) : Math.max(6, Math.round(limit * 0.6));
    const secondaryCount = crucibleMode ? Math.max(4, Math.round(limit * 0.25)) : Math.max(4, Math.round(limit * 0.25));
    const timedProofReserve = crucibleMode ? Math.max(2, Math.round(limit * 0.15)) : 0;
    const primaryQuestions = selectQuestionsForTarget(questions, primary, attemptedIds, primaryCount, context, { minDifficulty: crucibleMode ? "Hard" : "" });
    primaryQuestions.forEach((question) => attemptedIds.add(question.id));
    const secondaryQuestions = selectQuestionsForTarget(questions, secondary, attemptedIds, secondaryCount, context, { minDifficulty: crucibleMode ? "Hard" : "" });
    secondaryQuestions.forEach((question) => attemptedIds.add(question.id));
    const remaining = Math.max(0, limit - primaryQuestions.length - secondaryQuestions.length - timedProofReserve);
    const mixedTarget = { section: "All", domain: "All", skill: "All", difficulty: crucibleMode ? "Hard" : "Medium" };
    const mixedQuestions = selectQuestionsForTarget(questions, mixedTarget, attemptedIds, remaining, context, { minDifficulty: crucibleMode ? "Hard" : "" });
    mixedQuestions.forEach((question) => attemptedIds.add(question.id));
    const timedProofTarget = { ...(primary || mixedTarget), difficulty: "Hard", timed: true };
    const timedProofCount = crucibleMode ? Math.max(0, limit - primaryQuestions.length - secondaryQuestions.length - mixedQuestions.length) : 0;
    const timedProofQuestions = crucibleMode ? selectQuestionsForTarget(questions, timedProofTarget, attemptedIds, timedProofCount, context, { minDifficulty: "Hard" }) : [];
    timedProofQuestions.forEach((question) => attemptedIds.add(question.id));
    if (primaryQuestions.length) buckets.push({ id: crucibleMode ? "crucible-same-skill" : "priority-repair", label: crucibleMode ? "Crucible same-skill" : "Priority repair", target: primary, toolMix: bucketToolMix(primaryQuestions), questions: primaryQuestions });
    if (secondaryQuestions.length) buckets.push({ id: crucibleMode ? "crucible-transfer" : "domain-transfer", label: crucibleMode ? "Crucible transfer" : "Domain transfer", target: secondary, toolMix: bucketToolMix(secondaryQuestions), questions: secondaryQuestions });
    if (mixedQuestions.length) buckets.push({ id: crucibleMode ? "crucible-mixed" : "cumulative-proof", label: crucibleMode ? "Crucible hard mixed" : "Cumulative proof", target: mixedTarget, toolMix: bucketToolMix(mixedQuestions), questions: mixedQuestions });
    if (timedProofQuestions.length) buckets.push({ id: "crucible-timed-proof", label: "Crucible timed proof", target: timedProofTarget, toolMix: bucketToolMix(timedProofQuestions), questions: timedProofQuestions });
    return {
      version: "question-recommendation-plan-2026-05-25",
      totalRecommended: buckets.reduce((sum, bucket) => sum + bucket.questions.length, 0),
      buckets,
      crucibleMode,
      excludesAttempted: true,
      excludesUnreviewed: true,
      routingSignals: {
        missedSkeletonCount: context.missedSkeletons.size,
        weakSkillCount: context.weakSkillKeys.size,
        dueCount: context.dueIds.size,
        recentErrorTypes: context.recentErrorTypes,
      },
    };
  }

  return {
    buildAdaptiveRoutingProfile,
    buildQuestionRecommendationPlan,
    buildRoutingContext,
    combinedRoutingConfidence,
    confidenceForEvidence,
    moduleRoutingSignal,
    routeForModule,
    scoreSignalForSection,
    sortedPriorityRows,
  };
});
