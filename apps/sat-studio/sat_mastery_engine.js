(function initSatStudioMasteryEngine(root, factory) {
  const masteryEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = masteryEngine;
  }
  if (root) {
    root.SatStudioMasteryEngine = masteryEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioMasteryEngine() {
  function averageNumber(values = []) {
    const clean = values.map(Number).filter(Number.isFinite);
    if (!clean.length) return 0;
    return clean.reduce((sum, value) => sum + value, 0) / clean.length;
  }

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function dominantErrorTypeFor(errorTypes = {}) {
    return (
      Object.entries(errorTypes)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "none"
    );
  }

  function hardTimedFreshProofCount(item = {}) {
    return Number(item.hardTimedFreshProofCount || item.eliteProofCount || 0);
  }

  function masteryStatus(item, mastery) {
    if (item.attempts < 3) return "Needs data";
    if (mastery < 50) return "Relearn";
    if (mastery < 75) return "Practice";
    if (mastery < 88) return "Test-ready soon";
    if (item.attempts >= 5 && hardTimedFreshProofCount(item) >= 3 && item.recentWrong === 0) return "Mastered";
    return "Prove on hard/timed";
  }

  function masteryStageFor(item, mastery, dominantErrorType = dominantErrorTypeFor(item.errorTypes), repeatedFormWrong = 0) {
    if (item.attempts < 3) return "Collect evidence";
    if (mastery < 50 || item.easyWrong >= 2) return "Foundation repair";
    if (mastery < 68) return "Standard SAT";
    if (repeatedFormWrong || ["trap_answer", "careless", "misread_prompt", "evidence"].includes(dominantErrorType)) return "Trap recognition";
    if (item.recentWrong > 0 || dominantErrorType === "time_pressure" || dominantErrorType === "slow_correct") return "Timed mastery";
    if (hardTimedFreshProofCount(item) < 3) return "Hard transfer";
    return "Maintenance";
  }

  function masteryStageExit(stage) {
    const exits = {
      "Collect evidence": "Answer 3-5 questions so the app has enough signal.",
      "Foundation repair": "Reach 80%+ on easy/medium questions after reviewing the lesson.",
      "Standard SAT": "Reach 75%+ on medium questions without repeated-form misses.",
      "Trap recognition": "Explain why each wrong choice is wrong on 5 new questions.",
      "Hard transfer": "Get at least 3 hard or timed fresh proof questions correct in different forms.",
      "Timed mastery": "Stay within target time while keeping accuracy within 10 points.",
      Maintenance: "No recent wrong attempts for 14 days.",
    };
    return exits[stage] || "Review after the next practice block.";
  }

  function masteryProofRequirement(stage, item = {}) {
    const base = {
      stage,
      proofType: "standard",
      requiredFreshItems: 3,
      minDifficulty: "Medium",
      timedRequired: false,
      mixedContextRequired: true,
      retentionDays: 7,
      passCondition: masteryStageExit(stage),
    };
    if (stage === "Collect evidence") {
      return {
        ...base,
        proofType: "signal",
        requiredFreshItems: 3,
        minDifficulty: "Any",
        mixedContextRequired: false,
        passCondition: "Answer 3-5 fresh questions before trusting the mastery label.",
      };
    }
    if (stage === "Foundation repair" || item.easyWrong >= 2) {
      return {
        ...base,
        proofType: "foundation",
        requiredFreshItems: 5,
        minDifficulty: "Easy",
        mixedContextRequired: false,
        passCondition: "Score 80%+ on fresh easy/medium questions after reviewing the lesson.",
      };
    }
    if (stage === "Trap recognition") {
      return {
        ...base,
        proofType: "trap",
        requiredFreshItems: 5,
        minDifficulty: "Medium",
        timedRequired: false,
        passCondition: "Correct the item and explain why the two strongest wrong choices are traps.",
      };
    }
    if (stage === "Hard transfer") {
      return {
        ...base,
        proofType: "transfer",
        requiredFreshItems: Math.max(3, 3 - hardTimedFreshProofCount(item)),
        minDifficulty: "Hard",
        retentionDays: 14,
        passCondition: "Pass 3 hard or timed fresh proof items in different skeletons, with no slow_correct pacing.",
      };
    }
    if (stage === "Timed mastery") {
      return {
        ...base,
        proofType: "timed",
        requiredFreshItems: 6,
        minDifficulty: "Medium",
        timedRequired: true,
        retentionDays: 14,
        passCondition: "Finish a timed mixed set within target time while keeping accuracy within 10 points.",
      };
    }
    if (stage === "Maintenance") {
      return {
        ...base,
        proofType: "maintenance",
        requiredFreshItems: 4,
        minDifficulty: hardTimedFreshProofCount(item) >= 3 ? "Hard" : "Medium",
        timedRequired: true,
        retentionDays: 14,
        passCondition: "Hold the skill with no recent wrong attempts for 14 days.",
      };
    }
    return base;
  }

  function masteryActionFor(errorType, item = {}) {
    const actions = {
      knowledge_gap: "Lesson first, then 10 foundation questions",
      calculation: "Untimed accuracy drill with written work",
      careless: "Slow-check set with round-number variants",
      misread_prompt: "Underline ask, units, and constraints before solving",
      trap_answer: "Eliminate traps and write proof for the correct choice",
      time_pressure: "Timed mini-set after one untimed pass",
      vocab: "Add words to vocab, then retry context questions",
      evidence: "Cite the exact clue before choosing",
      skipped: "Do a foundation pass before timed practice",
      slow_correct: "Speed drill with already-correct forms",
    };
    if (item.easyWrong >= 2) return "Relearn basics before more tests";
    return actions[errorType] || "Mixed review set";
  }

  function readinessBand(score) {
    if (score >= 85) return "1600 training ready";
    if (score >= 65) return "Strong path, needs more proof";
    if (score >= 40) return "Useful, but not elite yet";
    return "Starter path";
  }

  function computeSkillMasteryRows(profile = {}, helpers = {}) {
    const getQuestionById = helpers.getQuestionById || (() => null);
    const difficultyWeight = helpers.difficultyWeight || ((difficulty) => ({ Easy: 1, Medium: 1.35, Hard: 1.75 }[difficulty] || 1.2));
    const templateFormId = helpers.templateFormId || (() => "");
    const suggestErrorType = helpers.suggestErrorType || (() => "unknown");
    const now = Number(helpers.now) || Date.now();
    const map = new Map();

    (profile.attempts || []).forEach((attempt) => {
      const question = getQuestionById(attempt.questionId);
      if (!question) return;
      const key = `${question.section}|${question.domain}|${question.skill}`;
      const item = map.get(key) || {
        key,
        section: question.section,
        domain: question.domain,
        skill: question.skill,
        attempts: 0,
        correct: 0,
        wrong: 0,
        weightedTotal: 0,
        weightedCorrect: 0,
        hardCorrect: 0,
        easyWrong: 0,
        recentWrong: 0,
        hardTimedFreshProofCount: 0,
        hardTimedFreshProofForms: {},
        errorTypes: {},
        templateForms: {},
        lastAttemptAt: "",
      };
      const weight = difficultyWeight(question.difficulty);
      const attemptedAt = Date.parse(attempt.at || "") || now;
      item.attempts += 1;
      item.weightedTotal += weight;
      item.lastAttemptAt = !item.lastAttemptAt || attemptedAt > Date.parse(item.lastAttemptAt) ? new Date(attemptedAt).toISOString() : item.lastAttemptAt;
      const formId =
        templateFormId(question) ||
        question?.skeletonDiversity?.skeletonId ||
        question?.skeletonId ||
        question?.templateId ||
        question?.id ||
        "";
      if (formId) {
        item.templateForms[formId] = item.templateForms[formId] || { correct: 0, wrong: 0 };
      }

      if (attempt.correct) {
        item.correct += 1;
        item.weightedCorrect += weight;
        if (question.difficulty === "Hard") item.hardCorrect += 1;
        if (formId) item.templateForms[formId].correct += 1;
        const practiceMode = String(attempt.practiceMode || "").toLowerCase();
        const isTimedOrProof = /proof|timed|crucible|exam|module|diagnostic/.test(practiceMode) || Boolean(attempt.learningEvidence?.required);
        const cleanPacing = attempt.pacingFlag !== "slow_correct" && attempt.errorType !== "slow_correct";
        if (cleanPacing && (question.difficulty === "Hard" || isTimedOrProof)) {
          const proofFormId = formId || question.id;
          if (proofFormId) item.hardTimedFreshProofForms[proofFormId] = true;
          item.hardTimedFreshProofCount = Object.keys(item.hardTimedFreshProofForms).length;
        }
      } else {
        item.wrong += 1;
        if (question.difficulty === "Easy") item.easyWrong += 1;
        if (now - attemptedAt <= 14 * 24 * 60 * 60 * 1000) item.recentWrong += 1;
        if (formId) item.templateForms[formId].wrong += 1;
        const errorType = attempt.errorType || suggestErrorType(question, false, { skipped: !attempt.selectedAnswer });
        item.errorTypes[errorType] = (item.errorTypes[errorType] || 0) + 1;
      }

      map.set(key, item);
    });

    return [...map.values()]
      .map((item) => {
        const weightedAccuracy = item.weightedTotal ? item.weightedCorrect / item.weightedTotal : 0;
        const confidencePenalty = item.attempts < 3 ? 18 : item.attempts < 5 ? 10 : item.attempts < 8 ? 5 : 0;
        const mastery = clampNumber(Math.round(weightedAccuracy * 100 - confidencePenalty), 0, 100);
        const repeatedFormWrong = Object.values(item.templateForms).filter((form) => form.wrong >= 2 && form.correct === 0).length;
        const dominantErrorType = dominantErrorTypeFor(item.errorTypes);
        const status = masteryStatus(item, mastery);
        const masteryStage = masteryStageFor(item, mastery, dominantErrorType, repeatedFormWrong);
        const priorityScore =
          (100 - mastery) * (item.attempts >= 3 ? 1 : 0.65) +
          item.recentWrong * 8 +
          item.easyWrong * 7 +
          repeatedFormWrong * 6 +
          (dominantErrorType === "knowledge_gap" ? 8 : 0) +
          (dominantErrorType === "time_pressure" ? 5 : 0);
        return {
          ...item,
          accuracy: item.attempts ? Math.round((item.correct / item.attempts) * 100) : 0,
          weightedAccuracy,
          mastery,
          status,
          masteryStage,
          dominantErrorType,
          dominantErrorCount: item.errorTypes[dominantErrorType] || 0,
          repeatedFormWrong,
          priorityScore: Math.round(priorityScore),
          action: masteryActionFor(dominantErrorType, item),
          proofRequirement: masteryProofRequirement(masteryStage, item),
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore || a.mastery - b.mastery || b.attempts - a.attempts);
  }

  return {
    averageNumber,
    clampNumber,
    computeSkillMasteryRows,
    dominantErrorTypeFor,
    masteryActionFor,
    masteryProofRequirement,
    masteryStageExit,
    masteryStageFor,
    masteryStatus,
    readinessBand,
  };
});
