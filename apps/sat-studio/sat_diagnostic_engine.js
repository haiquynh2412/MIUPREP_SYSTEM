(function initSatStudioDiagnosticEngine(root, factory) {
  let adaptiveRoutingEngine = root?.SatStudioAdaptiveRoutingEngine;
  let samplerEngine = root?.SatSamplerEngine;
  if (!adaptiveRoutingEngine && typeof require === "function") {
    adaptiveRoutingEngine = require("./sat_adaptive_routing_engine.js");
  }
  if (!samplerEngine && typeof require === "function") {
    samplerEngine = require("./sat_sampler_engine.js");
  }
  const diagnosticEngine = factory(adaptiveRoutingEngine, samplerEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = diagnosticEngine;
  }
  if (root) {
    root.SatStudioDiagnosticEngine = diagnosticEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioDiagnosticEngine(adaptiveRoutingEngine = null, samplerEngine = null) {
  function isGridInQuestion(question) {
    return ["student_produced_response", "grid_in", "numeric"].includes(question?.questionType);
  }

  function isQualityGateBlocked(question) {
    const qualityGate = question?.qualityGate || {};
    const contentAudit = question?.contentAudit || {};
    const poolGovernance = question?.poolGovernance || {};
    return (
      qualityGate.status === "blocked" ||
      qualityGate.verdict === "fail" ||
      contentAudit.verdict === "fail" ||
      poolGovernance.diagnosticEligible === false ||
      question?.diagnosticEligible === false
    );
  }

  function isReviewedForStudy(question) {
    return question?.reviewStatus === "reviewed" && question?.metadata?.reviewStatus !== "needs_review";
  }

  function isDiagnosticReadyQuestion(question) {
    const gridInReady =
      isGridInQuestion(question) &&
      (question.correctAnswer || (Array.isArray(question.acceptableAnswers) && question.acceptableAnswers.length));
    const multipleChoiceReady =
      !isGridInQuestion(question) &&
      question?.choices &&
      ["A", "B", "C", "D"].every((key) => typeof question.choices[key] === "string" && question.choices[key].trim()) &&
      ["A", "B", "C", "D"].includes(question.correctAnswer);
    return (
      Boolean(question) &&
      isReviewedForStudy(question) &&
      !String(question.publicationStatus || "").startsWith("rejected") &&
      question.visibility !== "blocked" &&
      question.practicePool !== "hidden_duplicate" &&
      question?.skeletonDiversity?.practicePool !== "hidden_duplicate" &&
      !isQualityGateBlocked(question) &&
      Boolean(question.section) &&
      Boolean(question.domain) &&
      (multipleChoiceReady || gridInReady) &&
      Boolean(question.explanation)
    );
  }

  function normalizeDiagnosticRoute(route = "standard") {
    if (route === "foundation") return "easy";
    if (route === "easy") return "easy";
    if (route === "hard") return "hard";
    return "standard";
  }

  function officialDiagnosticStructureForMode(meta = {}) {
    const modules = Array.isArray(meta.modulePlan) && meta.modulePlan.length ? meta.modulePlan : [];
    const expectedCount = Number(meta.expectedCount) || (meta.blueprint || []).reduce((sum, slot) => sum + (Number(slot.count) || 0), 0);
    const totalMinutes = modules.length
      ? modules.reduce((sum, moduleSpec) => sum + (Number(moduleSpec.timeLimitMinutes) || 0), 0)
      : Number(meta.timeLimitMinutes) || 0;
    return {
      version: "diagnostic-v2-bluebook-2026-05-19",
      label: meta.label || "Diagnostic",
      timerRequired: true,
      adaptive: modules.some((moduleSpec) => moduleSpec.adaptiveFromPreviousSection),
      moduleCount: modules.length || 1,
      totalQuestions: expectedCount,
      totalMinutes,
      sections: modules.length
        ? [...new Set(modules.map((moduleSpec) => moduleSpec.section).filter(Boolean))]
        : [...new Set((meta.blueprint || []).map((slot) => slot.section).filter(Boolean))],
      modules: modules.map((moduleSpec, index) => ({
        index,
        label: moduleSpec.label || `Module ${index + 1}`,
        section: moduleSpec.section || "",
        expectedCount: Number(moduleSpec.expectedCount) || (moduleSpec.blueprint || []).reduce((sum, slot) => sum + (Number(slot.count) || 0), 0),
        timeLimitMinutes: Number(moduleSpec.timeLimitMinutes) || 0,
        adaptiveFromPreviousSection: Boolean(moduleSpec.adaptiveFromPreviousSection),
        routeChoices: moduleSpec.adaptiveFromPreviousSection ? ["easy", "standard", "hard"] : [normalizeDiagnosticRoute(moduleSpec.route || "standard")],
      })),
    };
  }

  function blueprintRequirements(meta = {}) {
    const slots = [];
    const addSlot = (slot = {}) => {
      if (!slot.section || !slot.domain || !Number(slot.count)) return;
      const key = `${slot.section}|${slot.domain}`;
      const existing = slots.find((item) => item.key === key);
      if (existing) {
        existing.required += Number(slot.count) || 0;
      } else {
        slots.push({
          key,
          section: slot.section,
          domain: slot.domain,
          required: Number(slot.count) || 0,
        });
      }
    };

    if (Array.isArray(meta.modulePlan) && meta.modulePlan.length) {
      meta.modulePlan.forEach((moduleSpec) => (moduleSpec.blueprint || []).forEach(addSlot));
    } else {
      (meta.blueprint || []).forEach(addSlot);
    }

    return slots;
  }

  function countDifficulties(questions = []) {
    return questions.reduce(
      (acc, question) => {
        const difficulty = question?.difficulty || "Unknown";
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      },
      { Easy: 0, Medium: 0, Hard: 0 },
    );
  }

  function selectedDiagnosticCount(questions = [], meta = {}) {
    if (Array.isArray(meta.modulePlan) && meta.modulePlan.length) {
      const used = [];
      let count = 0;
      meta.modulePlan.forEach((moduleSpec) => {
        const route = moduleSpec.route || "standard";
        const selected = buildDiagnosticModuleSet(questions, moduleSpec, route, used);
        selected.forEach((question) => used.push(question.id));
        count += selected.length;
      });
      return count;
    }
    return buildDiagnosticQuestionSet(questions, meta).length;
  }

  function buildDiagnosticReadiness(questions = [], meta = {}) {
    const readyQuestions = questions.filter(isDiagnosticReadyQuestion);
    const requirements = blueprintRequirements(meta);
    const expectedCount = Number(meta.expectedCount) || requirements.reduce((sum, slot) => sum + slot.required, 0);
    const selectedCount = selectedDiagnosticCount(questions, meta);
    const slots = requirements.map((slot) => {
      const matching = readyQuestions.filter((question) => question.section === slot.section && question.domain === slot.domain);
      const difficultyCounts = countDifficulties(matching);
      const warnings = [];
      const deficit = Math.max(0, slot.required - matching.length);
      if (deficit) warnings.push(`Needs ${deficit} more ready item(s).`);
      if (slot.required >= 3 && !difficultyCounts.Medium) warnings.push("No medium anchor item.");
      if (slot.required >= 6 && !difficultyCounts.Hard) warnings.push("No hard proof item.");
      if (slot.section === "Math" && slot.required >= 4 && !matching.some(isGridInQuestion)) warnings.push("No grid-in proof item.");
      return {
        ...slot,
        readyCount: matching.length,
        difficultyCounts,
        deficit,
        warnings,
      };
    });

    const slotScore = slots.length
      ? slots.reduce((sum, slot) => sum + Math.min(1, slot.readyCount / Math.max(1, slot.required)), 0) / slots.length
      : 0;
    const selectedScore = expectedCount ? Math.min(1, selectedCount / expectedCount) : 1;
    const readinessScore = Math.round((slotScore * 0.7 + selectedScore * 0.3) * 100);
    const warnings = slots.flatMap((slot) => slot.warnings.map((warning) => `${slot.domain}: ${warning}`));
    if (selectedCount < expectedCount) warnings.unshift(`Only ${selectedCount}/${expectedCount} questions can be assembled right now.`);
    const confidence = readinessScore >= 90 && !warnings.length ? "high" : readinessScore >= 70 ? "medium" : "low";
    return {
      label: meta.label || "Diagnostic",
      expectedCount,
      readyCount: readyQuestions.length,
      selectedCount,
      readinessScore,
      confidence,
      canStart: selectedCount >= expectedCount && slots.every((slot) => slot.deficit === 0),
      timerRequired: true,
      officialStructure: officialDiagnosticStructureForMode(meta),
      samplerAudit: samplerEngine?.buildSelectionAudit
        ? samplerEngine.buildSelectionAudit(
            Array.isArray(meta.modulePlan) && meta.modulePlan.length ? [] : buildDiagnosticQuestionSet(questions, meta),
            Array.isArray(meta.modulePlan) && meta.modulePlan.length ? [] : meta.blueprint || [],
            { target: Array.isArray(meta.modulePlan) && meta.modulePlan.length ? 0 : expectedCount, route: meta.route || "standard", topicKey: topicDiversityKey },
          )
        : null,
      slots,
      warnings,
    };
  }

  function sourcePriority(question) {
    if (question.reviewStatus === "reviewed") return 0;
    if (question.sourceType === "original") return 1;
    if (question.sourceType === "foundation") return 2;
    if (question.sourceType === "ai_generated") return 3;
    if (question.sourceType === "antigravity") return 3;
    if (question.sourceType === "sat_1590") return 3;
    if (question.sourceType === "sat_king") return 3;
    if (question.sourceType === "opensat") return 4;
    if (question.sourceType === "private_vault") return 5;
    return 6;
  }

  function rankDiagnosticCandidates(questions = []) {
    const difficultyOrder = { Medium: 0, Easy: 1, Hard: 2 };
    return [...questions].sort((a, b) => {
      const sourceScore = sourcePriority(a) - sourcePriority(b);
      if (sourceScore) return sourceScore;
      const difficultyScore = (difficultyOrder[a.difficulty] ?? 3) - (difficultyOrder[b.difficulty] ?? 3);
      if (difficultyScore) return difficultyScore;
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
  }

  function compareDiagnosticCandidates(a = {}, b = {}) {
    return rankDiagnosticCandidates([a, b]).indexOf(a) - rankDiagnosticCandidates([a, b]).indexOf(b);
  }

  function rankDiagnosticCandidatesForRoute(questions = [], route = "standard", options = {}) {
    const normalizedRoute = normalizeDiagnosticRoute(route);
    const difficultyOrder =
      normalizedRoute === "hard"
        ? { Hard: 0, Medium: 1, Easy: 2 }
        : normalizedRoute === "easy"
          ? { Easy: 0, Medium: 1, Hard: 2 }
          : { Medium: 0, Easy: 1, Hard: 2 };
    const attemptedIds = new Set(options.attemptedIds || []);
    return [...questions].sort((a, b) => {
      const difficultyScore = (difficultyOrder[a.difficulty] ?? 3) - (difficultyOrder[b.difficulty] ?? 3);
      if (difficultyScore) return difficultyScore;
      const sourceScore = sourcePriority(a) - sourcePriority(b);
      if (sourceScore) return sourceScore;
      const freshScore = Number(attemptedIds.has(a.id)) - Number(attemptedIds.has(b.id));
      if (freshScore) return freshScore;
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
  }

  function compareDiagnosticCandidatesForRoute(route = "standard", options = {}) {
    return (a, b) => {
      const ranked = rankDiagnosticCandidatesForRoute([a, b], route, options);
      return ranked.indexOf(a) - ranked.indexOf(b);
    };
  }

  function pickDifficultyMix(candidates = [], count = 0) {
    const result = [];
    ["Easy", "Medium", "Hard"].forEach((difficulty) => {
      const candidate = candidates.find((question) => question.difficulty === difficulty && !result.some((item) => item.id === question.id));
      if (candidate && result.length < count) result.push(candidate);
    });

    candidates.forEach((candidate) => {
      if (result.length < count && !result.some((item) => item.id === candidate.id)) {
        result.push(candidate);
      }
    });

    return result;
  }

  function topicDiversityKey(question = {}) {
    const skeleton =
      question.skeletonDiversity?.skeletonId ||
      question.skeletonId ||
      question.templateId ||
      String(question.prompt || "")
        .toLowerCase()
        .replace(/\d+(?:\.\d+)?/g, "#")
        .replace(/\s+/g, " ")
        .slice(0, 90);
    return [question.section || "", question.domain || "", question.skill || "", skeleton].join("|");
  }

  function pickDiverseCandidates(candidates = [], count = 0) {
    const selected = [];
    const seen = new Set();
    candidates.forEach((candidate) => {
      if (selected.length >= count) return;
      const key = topicDiversityKey(candidate);
      if (seen.has(key)) return;
      selected.push(candidate);
      seen.add(key);
    });
    candidates.forEach((candidate) => {
      if (selected.length < count && !selected.some((item) => item.id === candidate.id)) {
        selected.push(candidate);
      }
    });
    return selected;
  }

  function buildDiagnosticQuestionSet(questions = [], meta = {}) {
    const liveQuestions = questions.filter(isDiagnosticReadyQuestion);
    const target = meta.expectedCount || (meta.blueprint || []).reduce((sum, slot) => sum + (Number(slot.count) || 0), 0);
    if (samplerEngine?.selectQuestionsByBlueprint) {
      return samplerEngine.selectQuestionsByBlueprint(liveQuestions, meta.blueprint || [], {
        target,
        route: meta.route || "standard",
        ranker: compareDiagnosticCandidates,
        topicKey: topicDiversityKey,
      });
    }
    const selected = [];
    const used = new Set();

    (meta.blueprint || []).forEach((slot) => {
      const candidates = rankDiagnosticCandidates(
        liveQuestions.filter((question) => question.section === slot.section && question.domain === slot.domain && !used.has(question.id)),
      );
      pickDifficultyMix(candidates, slot.count).forEach((question) => {
        if (selected.length < target && !used.has(question.id)) {
          selected.push(question);
          used.add(question.id);
        }
      });
    });

    if (selected.length < target) {
      rankDiagnosticCandidates(liveQuestions.filter((question) => !used.has(question.id))).forEach((question) => {
        if (selected.length < target) {
          selected.push(question);
          used.add(question.id);
        }
      });
    }

    return selected;
  }

  function buildDiagnosticModuleSet(questions = [], moduleSpec = {}, route = "standard", usedIds = [], options = {}) {
    const liveQuestions = questions.filter(isDiagnosticReadyQuestion);
    const blueprint = moduleSpec?.blueprint || [];
    const target = moduleSpec?.expectedCount || blueprint.reduce((sum, slot) => sum + (Number(slot.count) || 0), 0);
    if (samplerEngine?.selectQuestionsByBlueprint) {
      return samplerEngine.selectQuestionsByBlueprint(liveQuestions, blueprint, {
        target,
        route: normalizeDiagnosticRoute(route),
        usedIds,
        section: moduleSpec?.section || "",
        ranker: compareDiagnosticCandidatesForRoute(normalizeDiagnosticRoute(route), options),
        topicKey: topicDiversityKey,
      });
    }
    const selected = [];
    const used = new Set(usedIds);

    blueprint.forEach((slot) => {
      const candidates = rankDiagnosticCandidatesForRoute(
        liveQuestions.filter((question) => question.section === slot.section && question.domain === slot.domain && !used.has(question.id)),
        normalizeDiagnosticRoute(route),
        options,
      );
      pickDiverseCandidates(candidates, slot.count).forEach((question) => {
        if (selected.length < target && !used.has(question.id)) {
          selected.push(question);
          used.add(question.id);
        }
      });
    });

    if (selected.length < target) {
      rankDiagnosticCandidatesForRoute(
        liveQuestions.filter((question) => (!moduleSpec?.section || question.section === moduleSpec.section) && !used.has(question.id)),
        normalizeDiagnosticRoute(route),
        options,
      ).forEach((question) => {
        if (selected.length < target) {
          selected.push(question);
          used.add(question.id);
        }
      });
    }

    return selected;
  }

  function summarizeCurrentPretestModule(current, moduleSpec, options = {}) {
    const questionIds = new Set(current?.questionIds || []);
    const answers = (current?.answers || []).filter((answer) => questionIds.has(answer.questionId));
    const correct = answers.filter((answer) => answer.correct).length;
    const total = answers.length || questionIds.size || 1;
    return {
      moduleIndex: current?.moduleIndex || 0,
      label: moduleSpec?.label || `Module ${(current?.moduleIndex || 0) + 1}`,
      section: moduleSpec?.section || "",
      route: normalizeDiagnosticRoute(current?.activeRoute || "standard"),
      total,
      correct,
      accuracy: Math.round((correct / total) * 100),
      timedOut: Boolean(options.timedOut),
      completedAt: options.completedAt || new Date().toISOString(),
    };
  }

  function routeForNextModule(moduleResults = [], nextModule = {}) {
    if (!nextModule?.adaptiveFromPreviousSection) return normalizeDiagnosticRoute(nextModule?.route || "standard");
    const previous = [...moduleResults].reverse().find((item) => item.section === nextModule.section);
    if (!previous) return "standard";
    if (adaptiveRoutingEngine?.routeForModule) return adaptiveRoutingEngine.routeForModule(previous, nextModule);
    const ratio = previous.total ? previous.correct / previous.total : 0;
    if (previous.timedOut && ratio < 0.85) return ratio <= 0.5 ? "easy" : "standard";
    if (ratio >= 0.72) return "hard";
    if (ratio <= 0.48) return "easy";
    return "standard";
  }

  function moduleReadinessBand(moduleResult = {}) {
    const ratio = moduleResult.total ? moduleResult.correct / moduleResult.total : 0;
    if (moduleResult.timedOut && ratio < 0.85) return "pacing-risk";
    if (ratio >= 0.82) return "accelerate";
    if (ratio >= 0.65) return "core-ready";
    if (ratio >= 0.45) return "unstable";
    return "foundation";
  }

  function routeRationaleForModule(moduleResult = {}) {
    const band = moduleReadinessBand(moduleResult);
    const label = moduleResult.label || moduleResult.section || "Module";
    const accuracy = Number.isFinite(moduleResult.accuracy) ? moduleResult.accuracy : Math.round(((moduleResult.correct || 0) / Math.max(1, moduleResult.total || 1)) * 100);
    const messages = {
      accelerate: `${label}: ${accuracy}% accuracy, ready for harder adaptive routing.`,
      "core-ready": `${label}: ${accuracy}% accuracy, stay on standard route and prove medium consistency.`,
      unstable: `${label}: ${accuracy}% accuracy, repair weak subskills before full-speed retest.`,
      foundation: `${label}: ${accuracy}% accuracy, route to easy items and foundation lessons first.`,
      "pacing-risk": `${label}: time pressure affected the result; use standard or easy route until pacing improves.`,
    };
    return messages[band] || `${label}: collect more module evidence.`;
  }

  function diagnosticRootCauseFor(item = {}, moduleInsights = []) {
    const sectionModule = moduleInsights.find((moduleResult) => moduleResult.section === item.section);
    const accuracy = item.weightedAccuracy ?? (item.total ? item.correct / item.total : 0);
    if (sectionModule?.readinessBand === "pacing-risk") return "Timer pressure is lowering accuracy; rebuild the skill before a timed retest.";
    if (accuracy < 0.5) return "Foundation concept or task recognition is unstable.";
    if ((item.difficultyCounts?.Hard || 0) && accuracy < 0.75) return "Transfer to harder SAT forms is not reliable yet.";
    return "Core accuracy is below roadmap threshold and needs a lesson plus scaffold proof.";
  }

  function buildDiagnosticRoadmapSeeds({ weakSkills = [], weakDomains = [], moduleInsights = [], completedAt = "" } = {}) {
    const skillSeeds = weakSkills.map((item, index) => ({
      id: `diagnostic-seed-skill-${index + 1}`,
      source: "diagnostic_v2",
      section: item.section || "",
      domain: item.domain || "",
      skill: item.label || item.skill || "All",
      label: item.label || item.skill || "Diagnostic skill gap",
      weightedAccuracy: item.weightedAccuracy,
      rootCause: diagnosticRootCauseFor(item, moduleInsights),
      lessonKey: `${item.section || "All"}|${item.domain || "All"}|${item.label || item.skill || "All"}`,
      dueReason: "Diagnostic v2 marked this as a weak subskill after module scoring.",
      proofCondition: "Pass a fresh same-subskill proof item without slow_correct pacing.",
      refreshAfter: ["proof_passed", "proof_failed", "ten_practice_attempts", "diagnostic_or_full_test"],
      assignedAt: completedAt,
    }));
    const domainSeeds = weakDomains.slice(0, 2).map((item, index) => ({
      id: `diagnostic-seed-domain-${index + 1}`,
      source: "diagnostic_v2",
      section: item.section || "",
      domain: item.label || item.domain || "All",
      skill: "All",
      label: item.label || item.domain || "Diagnostic domain gap",
      weightedAccuracy: item.weightedAccuracy,
      rootCause: diagnosticRootCauseFor(item, moduleInsights),
      lessonKey: `${item.section || "All"}|${item.label || item.domain || "All"}|All`,
      dueReason: "Diagnostic v2 needs broader evidence across this domain.",
      proofCondition: "Pass a mixed domain mini-set at 75%+ accuracy.",
      refreshAfter: ["diagnostic_or_full_test", "ten_practice_attempts"],
      assignedAt: completedAt,
    }));
    return [...skillSeeds, ...domainSeeds].slice(0, 6);
  }

  function buildDiagnosticV2Insights(summary = {}) {
    const modules = Array.isArray(summary.moduleResults) ? summary.moduleResults : [];
    const byDomain = Object.values(summary.byDomain || {});
    const bySkill = Object.values(summary.bySkill || {});
    const moduleInsights = modules.map((moduleResult) => ({
      ...moduleResult,
      readinessBand: moduleReadinessBand(moduleResult),
      rationale: routeRationaleForModule(moduleResult),
    }));
    const weakModules = moduleInsights.filter((item) => ["foundation", "unstable", "pacing-risk"].includes(item.readinessBand));
    const weakDomains = byDomain
      .map((item) => ({
        ...item,
        weightedAccuracy: item.weightedTotal ? item.weightedCorrect / item.weightedTotal : item.total ? item.correct / item.total : 0,
      }))
      .filter((item) => item.weightedAccuracy < 0.75)
      .sort((a, b) => a.weightedAccuracy - b.weightedAccuracy || b.total - a.total)
      .slice(0, 4);
    const weakSkills = bySkill
      .map((item) => ({
        ...item,
        weightedAccuracy: item.weightedTotal ? item.weightedCorrect / item.weightedTotal : item.total ? item.correct / item.total : 0,
      }))
      .filter((item) => item.weightedAccuracy < 0.75)
      .sort((a, b) => a.weightedAccuracy - b.weightedAccuracy || b.total - a.total)
      .slice(0, 6);
    const routeSummary = moduleInsights.map((item) => item.rationale);
    const roadmapSeeds = buildDiagnosticRoadmapSeeds({
      weakSkills,
      weakDomains,
      moduleInsights,
      completedAt: summary.completedAt,
    });
    const weakestSubskill = roadmapSeeds.find((seed) => seed.skill && seed.skill !== "All") || roadmapSeeds[0] || null;
    const nextAction = weakModules[0]
      ? `Start remediation from ${weakModules[0].section || weakModules[0].label}, then prove with a same-section module.`
      : weakSkills[0]
        ? `Target ${weakSkills[0].label} first, then retest the related module.`
        : "Use hard timed mixed sets; current diagnostic has no dominant weakness.";
    return {
      version: "diagnostic-v2",
      moduleInsights,
      weakModules,
      weakDomains,
      weakSkills,
      weakestSubskill,
      roadmapSeeds,
      refreshTriggers: ["diagnostic_or_full_test", "ten_practice_attempts", "proof_passed", "proof_failed", "manual_rebuild"],
      routeSummary,
      nextAction,
    };
  }

  function summarizeBy(answers = [], key, helpers = {}) {
    const getQuestionById = helpers.getQuestionById || (() => null);
    const difficultyWeight = helpers.difficultyWeight || ((difficulty) => ({ Easy: 1, Medium: 1.35, Hard: 1.75 }[difficulty] || 1.2));
    return answers.reduce((acc, answer) => {
      const question = getQuestionById(answer.questionId);
      if (!question) return acc;
      const label = question[key] || "Unknown";
      if (!acc[label]) {
        acc[label] = {
          label,
          section: question.section,
          domain: question.domain,
          total: 0,
          correct: 0,
          wrong: 0,
          weightedTotal: 0,
          weightedCorrect: 0,
          difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
        };
      }
      const weight = difficultyWeight(question.difficulty);
      acc[label].total += 1;
      acc[label].difficultyCounts[question.difficulty] = (acc[label].difficultyCounts[question.difficulty] || 0) + 1;
      acc[label].weightedTotal += weight;
      if (answer.correct) {
        acc[label].correct += 1;
        acc[label].weightedCorrect += weight;
      } else {
        acc[label].wrong += 1;
      }
      return acc;
    }, {});
  }

  function summarizeDiagnostic(pretest = {}, helpers = {}) {
    const answers = pretest.answers || [];
    const getQuestionById = helpers.getQuestionById || (() => null);
    const getCorrectAnswerLabel = helpers.getCorrectAnswerLabel || (() => "");
    const estimateSectionScore = helpers.estimateSectionScore || (() => null);
    const estimateSectionScoreBand = helpers.estimateSectionScoreBand || (() => null);
    const testModeMeta = helpers.testModeMeta || {};
    const options = helpers.options || {};
    const nowIso = helpers.nowIso || new Date().toISOString();
    const correct = answers.filter((answer) => answer.correct).length;
    const total = answers.length || 1;
    const bySection = summarizeBy(answers, "section", helpers);
    const bySkill = summarizeBy(answers, "skill", helpers);
    const byDomain = summarizeBy(answers, "domain", helpers);
    const sectionsTested = Object.keys(bySection).filter(Boolean);
    const rwEstimate = bySection["Reading and Writing"] ? estimateSectionScore(bySection["Reading and Writing"]) : null;
    const mathEstimate = bySection.Math ? estimateSectionScore(bySection.Math) : null;
    const rwBand = bySection["Reading and Writing"] ? estimateSectionScoreBand(bySection["Reading and Writing"]) : null;
    const mathBand = bySection.Math ? estimateSectionScoreBand(bySection.Math) : null;
    const scoreScope = rwEstimate !== null && mathEstimate !== null ? "composite" : "section_only";
    const scoreEstimate = scoreScope === "composite" ? rwEstimate + mathEstimate : rwEstimate ?? mathEstimate ?? 0;
    const scoreBand =
      scoreScope === "composite" && rwBand && mathBand
        ? {
            estimate: scoreEstimate,
            low: rwBand.low + mathBand.low,
            high: rwBand.high + mathBand.high,
            confidence: rwBand.confidence === "high" && mathBand.confidence === "high" ? "high" : rwBand.confidence === "low" || mathBand.confidence === "low" ? "low" : "medium",
            evidenceCount: (rwBand.evidenceCount || 0) + (mathBand.evidenceCount || 0),
            label: `${rwBand.low + mathBand.low}-${rwBand.high + mathBand.high}`,
          }
        : rwBand || mathBand || null;
    const reviewItems = answers.map((answer) => {
      const question = getQuestionById(answer.questionId);
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: getCorrectAnswerLabel(question),
        correct: answer.correct,
        moduleLabel: answer.moduleLabel || "",
        adaptiveRoute: normalizeDiagnosticRoute(answer.adaptiveRoute || ""),
      };
    });

    const summary = {
      id: pretest.id,
      mode: pretest.mode || "preview",
      label: pretest.label || testModeMeta[pretest.mode || "preview"]?.label || "Preview",
      completedAt: nowIso,
      startedAt: pretest.startedAt,
      timeLimitSeconds: pretest.totalTimeLimitSeconds || pretest.timeLimitSeconds || 0,
      activeModuleTimeLimitSeconds: pretest.timeLimitSeconds || 0,
      timerRequired: true,
      officialStructure: officialDiagnosticStructureForMode(testModeMeta[pretest.mode || "preview"] || {}),
      timedOut: Boolean(options.timedOut || pretest.timedOut),
      endedReason: options.endedReason || pretest.endedReason || "submitted",
      total,
      correct,
      scoreEstimate,
      scoreBand,
      scoreScope,
      sectionsTested,
      adaptiveRoutes: (pretest.adaptiveRoutes || []).map((item) => ({ ...item, route: normalizeDiagnosticRoute(item.route || "standard") })),
      moduleResults: pretest.moduleResults || [],
      sectionScores: {
        "Reading and Writing": rwEstimate,
        Math: mathEstimate,
      },
      sectionScoreBands: {
        "Reading and Writing": rwBand,
        Math: mathBand,
      },
      bySkill,
      byDomain,
      reviewItems,
    };
    summary.adaptiveInsights = buildDiagnosticV2Insights(summary);
    return summary;
  }

  return {
    blueprintRequirements,
    buildDiagnosticModuleSet,
    buildDiagnosticQuestionSet,
    buildDiagnosticReadiness,
    buildDiagnosticRoadmapSeeds,
    buildDiagnosticV2Insights,
    countDifficulties,
    isDiagnosticReadyQuestion,
    isQualityGateBlocked,
    isGridInQuestion,
    normalizeDiagnosticRoute,
    officialDiagnosticStructureForMode,
    pickDifficultyMix,
    pickDiverseCandidates,
    samplerAuditForSelection: samplerEngine?.buildSelectionAudit || (() => null),
    rankDiagnosticCandidates,
    compareDiagnosticCandidates,
    rankDiagnosticCandidatesForRoute,
    compareDiagnosticCandidatesForRoute,
    routeForNextModule,
    moduleReadinessBand,
    routeRationaleForModule,
    sourcePriority,
    summarizeBy,
    summarizeCurrentPretestModule,
    summarizeDiagnostic,
  };
});
