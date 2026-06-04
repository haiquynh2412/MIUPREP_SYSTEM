(function initSatItemAnalyticsEngine(root, factory) {
  const itemAnalyticsEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = itemAnalyticsEngine;
  }
  if (root) {
    root.SatItemAnalyticsEngine = itemAnalyticsEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatItemAnalyticsEngine() {
  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function scoreBandRank(value = "") {
    const raw = String(value || "").toLowerCase();
    const numeric = Number(String(value || "").match(/\d{3,4}/)?.[0] || 0);
    if (numeric) return numeric;
    if (/1600/.test(raw)) return 1600;
    if (/elite|1500/.test(raw)) return 1500;
    if (/advanced|1400/.test(raw)) return 1400;
    if (/core|1200|1300/.test(raw)) return 1250;
    if (/bridge|1000|1100/.test(raw)) return 1050;
    return 0;
  }

  function attemptAbilityRank(attempt = {}) {
    return (
      scoreBandRank(attempt.studentScoreBand || attempt.scoreBand || attempt.bandAtAttempt || attempt.currentBand) ||
      Number(attempt.scoreEstimateAtAttempt || attempt.scoreEstimate || attempt.studentScore || 0)
    );
  }

  function groupedAttemptsByQuestion(attempts = []) {
    const map = new Map();
    attempts.forEach((attempt) => {
      const questionId = attempt?.questionId || attempt?.id;
      if (!questionId) return;
      const rows = map.get(questionId) || [];
      rows.push(attempt);
      map.set(questionId, rows);
    });
    return map;
  }

  function attemptHelpTelemetry(attempt = {}) {
    const telemetry =
      (attempt.helpTelemetry && typeof attempt.helpTelemetry === "object" ? attempt.helpTelemetry : null) ||
      (attempt.learningEvidence?.helpTelemetry && typeof attempt.learningEvidence.helpTelemetry === "object" ? attempt.learningEvidence.helpTelemetry : null) ||
      {};
    return {
      hintUsed: Boolean(telemetry.hintUsed || attempt.hintUsed),
      fullSolutionViewed: Boolean(telemetry.fullSolutionViewed || attempt.fullSolutionViewed),
      helpTiming: String(telemetry.helpTiming || attempt.helpTiming || "none").toLowerCase(),
      independentAttempt: attempt.independentAttempt !== false && telemetry.independentAttempt !== false,
    };
  }

  function isIndependentAttempt(attempt = {}) {
    const help = attemptHelpTelemetry(attempt);
    if (!help.independentAttempt) return false;
    return !(help.helpTiming === "pre_submit" && (help.hintUsed || help.fullSolutionViewed));
  }

  function rate(rows = []) {
    if (!rows.length) return null;
    return rows.filter((row) => row.correct).length / rows.length;
  }

  function discriminationIndex(rows = []) {
    const ranked = rows
      .map((row) => ({ row, rank: attemptAbilityRank(row) }))
      .filter((item) => Number.isFinite(item.rank) && item.rank > 0)
      .sort((a, b) => b.rank - a.rank);
    if (ranked.length < 20) return null;
    const groupSize = Math.max(5, Math.floor(ranked.length * 0.27));
    const top = ranked.slice(0, groupSize).map((item) => item.row);
    const bottom = ranked.slice(-groupSize).map((item) => item.row);
    return Number((rate(top) - rate(bottom)).toFixed(3));
  }

  function itemFlags({ responseCount = 0, pValue = null, discrimination = null } = {}) {
    const flags = [];
    if (responseCount < 30) flags.push("sample_below_p_value_threshold");
    if (responseCount >= 30 && pValue !== null && pValue < 0.2) flags.push("very_hard_or_unclear");
    if (responseCount >= 30 && pValue !== null && pValue > 0.95) flags.push("too_easy_for_routing");
    if (responseCount < 100) flags.push("sample_below_discrimination_threshold");
    if (responseCount >= 100 && discrimination !== null && discrimination < 0.1) flags.push("low_discrimination");
    return flags;
  }

  function buildItemAnalytics({ attempts = [], questions = [], minPValueResponses = 30, minDiscriminationResponses = 100 } = {}) {
    const byQuestion = groupedAttemptsByQuestion(attempts);
    const rows = (questions.length ? questions : [...byQuestion.keys()].map((id) => ({ id }))).map((question) => {
      const questionId = question.id || question.questionId || "";
      const itemAttempts = byQuestion.get(questionId) || [];
      const calibrationAttempts = itemAttempts.filter(isIndependentAttempt);
      const responseCount = itemAttempts.length;
      const correctCount = itemAttempts.filter((attempt) => attempt.correct).length;
      const calibrationResponseCount = calibrationAttempts.length;
      const calibrationCorrectCount = calibrationAttempts.filter((attempt) => attempt.correct).length;
      const helpedResponseCount = responseCount - calibrationResponseCount;
      const pValue = calibrationResponseCount >= minPValueResponses ? Number((calibrationCorrectCount / calibrationResponseCount).toFixed(3)) : null;
      const discrimination = calibrationResponseCount >= minDiscriminationResponses ? discriminationIndex(calibrationAttempts) : null;
      return {
        questionId,
        section: question.section || "",
        domain: question.domain || "",
        skill: question.skill || "",
        difficulty: question.difficulty || "",
        responseCount,
        correctCount,
        calibrationResponseCount,
        calibrationCorrectCount,
        helpedResponseCount,
        pValue,
        pValueReady: calibrationResponseCount >= minPValueResponses,
        discriminationIndex: discrimination,
        discriminationReady: calibrationResponseCount >= minDiscriminationResponses && discrimination !== null,
        flags: itemFlags({ responseCount: calibrationResponseCount, pValue, discrimination }),
      };
    });
    const readyPValue = rows.filter((row) => row.pValueReady).length;
    const readyDiscrimination = rows.filter((row) => row.discriminationReady).length;
    const lowQuality = rows.filter((row) => row.flags.includes("low_discrimination") || row.flags.includes("very_hard_or_unclear")).length;
    return {
      version: "item-analytics-v1-2026-05-26",
      itemCount: rows.length,
      attemptCount: attempts.length,
      calibrationAttemptCount: attempts.filter(isIndependentAttempt).length,
      readyPValue,
      readyDiscrimination,
      lowQuality,
      readiness: {
        pValuePct: rows.length ? clampNumber(Math.round((readyPValue / rows.length) * 100), 0, 100) : 0,
        discriminationPct: rows.length ? clampNumber(Math.round((readyDiscrimination / rows.length) * 100), 0, 100) : 0,
        irt2plReady: attempts.length >= 5000 && readyDiscrimination >= Math.max(50, rows.length * 0.25),
      },
      rows,
    };
  }

  return {
    attemptAbilityRank,
    attemptHelpTelemetry,
    buildItemAnalytics,
    discriminationIndex,
    groupedAttemptsByQuestion,
    isIndependentAttempt,
    scoreBandRank,
  };
});
