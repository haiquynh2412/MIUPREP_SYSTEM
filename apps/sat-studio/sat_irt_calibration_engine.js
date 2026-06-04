(function initSatIrtCalibrationEngine(root, factory) {
  const irtCalibrationEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = irtCalibrationEngine;
  }
  if (root) {
    root.SatIrtCalibrationEngine = irtCalibrationEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatIrtCalibrationEngine() {
  const VERSION = "irt-2pl-calibration-v1-2026-05-26";

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function clampProbability(value) {
    return clampNumber(value, 0.01, 0.99);
  }

  function logit(p) {
    const clean = clampProbability(p);
    return Math.log(clean / (1 - clean));
  }

  function provisionalDifficultyFromPValue(pValue) {
    return Number((-logit(pValue)).toFixed(3));
  }

  function provisionalDiscriminationFromIndex(discriminationIndex) {
    return Number(clampNumber(0.35 + Number(discriminationIndex || 0) * 2.5, 0.35, 2.5).toFixed(3));
  }

  function eligibleRows(itemAnalytics = {}, options = {}) {
    const minResponses = Number(options.minResponsesPerItem || 200);
    return (Array.isArray(itemAnalytics.rows) ? itemAnalytics.rows : []).filter((row) => {
      return (
        row &&
        row.pValue !== null &&
        row.pValue !== undefined &&
        row.discriminationIndex !== null &&
        row.discriminationIndex !== undefined &&
        Number(row.calibrationResponseCount || 0) >= minResponses
      );
    });
  }

  function readinessReasons(itemAnalytics = {}, options = {}) {
    const minItems = Number(options.minItems || 50);
    const minAttempts = Number(options.minCalibrationAttempts || 5000);
    const minResponsesPerItem = Number(options.minResponsesPerItem || 200);
    const rows = eligibleRows(itemAnalytics, { minResponsesPerItem });
    const reasons = [];
    if (Number(itemAnalytics.calibrationAttemptCount || 0) < minAttempts) {
      reasons.push(`Need ${minAttempts} independent calibration attempts before fitting 2PL.`);
    }
    if (rows.length < minItems) {
      reasons.push(`Need ${minItems} items with p-value, discrimination, and at least ${minResponsesPerItem} independent responses.`);
    }
    return reasons;
  }

  function buildIrtCalibrationPlan(itemAnalytics = {}, options = {}) {
    const minItems = Number(options.minItems || 50);
    const minAttempts = Number(options.minCalibrationAttempts || 5000);
    const minResponsesPerItem = Number(options.minResponsesPerItem || 200);
    const rows = eligibleRows(itemAnalytics, { minResponsesPerItem });
    const reasons = readinessReasons(itemAnalytics, { minItems, minCalibrationAttempts: minAttempts, minResponsesPerItem });
    return {
      version: VERSION,
      ready: reasons.length === 0,
      status: reasons.length === 0 ? "ready_to_fit" : "deferred_insufficient_data",
      thresholds: {
        minItems,
        minCalibrationAttempts: minAttempts,
        minResponsesPerItem,
      },
      observed: {
        calibrationAttemptCount: Number(itemAnalytics.calibrationAttemptCount || 0),
        eligibleItemCount: rows.length,
        readyPValue: Number(itemAnalytics.readyPValue || 0),
        readyDiscrimination: Number(itemAnalytics.readyDiscrimination || 0),
      },
      reasons,
    };
  }

  function fitIrt2PL({ itemAnalytics = {}, options = {} } = {}) {
    const plan = buildIrtCalibrationPlan(itemAnalytics, options);
    if (!plan.ready) {
      return {
        version: VERSION,
        status: "deferred_insufficient_data",
        ready: false,
        plan,
        parameters: [],
      };
    }
    const rows = eligibleRows(itemAnalytics, { minResponsesPerItem: plan.thresholds.minResponsesPerItem });
    const parameters = rows.map((row) => ({
      questionId: row.questionId || "",
      a: provisionalDiscriminationFromIndex(row.discriminationIndex),
      b: provisionalDifficultyFromPValue(row.pValue),
      responseCount: Number(row.responseCount || 0),
      calibrationResponseCount: Number(row.calibrationResponseCount || 0),
      pValue: Number(row.pValue),
      discriminationIndex: Number(row.discriminationIndex),
      source: "empirical_pvalue_discrimination_bootstrap",
    }));
    return {
      version: VERSION,
      status: "calibrated_provisional_2pl",
      ready: true,
      plan,
      parameterCount: parameters.length,
      parameters,
      notes: [
        "These parameters are initialized from empirical p-value and discrimination.",
        "Replace with maximum-likelihood or Bayesian 2PL fitting after the production response log is large enough across score bands.",
      ],
    };
  }

  return {
    VERSION,
    buildIrtCalibrationPlan,
    fitIrt2PL,
    provisionalDifficultyFromPValue,
    provisionalDiscriminationFromIndex,
    readinessReasons,
  };
});
