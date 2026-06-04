const assert = require("node:assert/strict");
const irt = require("../sat_irt_calibration_engine.js");

function buildRows(count) {
  return Array.from({ length: count }, (_, index) => ({
    questionId: `q${index + 1}`,
    responseCount: 240,
    calibrationResponseCount: 220,
    pValue: index % 2 ? 0.62 : 0.38,
    discriminationIndex: index % 2 ? 0.32 : 0.18,
  }));
}

function run() {
  const deferred = irt.fitIrt2PL({
    itemAnalytics: {
      calibrationAttemptCount: 1200,
      rows: buildRows(20),
      readyPValue: 20,
      readyDiscrimination: 20,
    },
  });
  assert.equal(deferred.status, "deferred_insufficient_data");
  assert.equal(deferred.ready, false);
  assert.ok(deferred.plan.reasons.some((reason) => reason.includes("5000 independent")));

  const fitted = irt.fitIrt2PL({
    itemAnalytics: {
      calibrationAttemptCount: 6000,
      rows: buildRows(55),
      readyPValue: 55,
      readyDiscrimination: 55,
    },
  });
  assert.equal(fitted.status, "calibrated_provisional_2pl");
  assert.equal(fitted.ready, true);
  assert.equal(fitted.parameterCount, 55);
  assert.equal(fitted.parameters[0].questionId, "q1");
  assert.ok(fitted.parameters[0].a >= 0.35);
  assert.ok(fitted.parameters[0].b > 0);
  assert.equal(irt.provisionalDifficultyFromPValue(0.5), 0);
  assert.ok(irt.provisionalDiscriminationFromIndex(0.4) > irt.provisionalDiscriminationFromIndex(0.1));
}

run();
console.log("irt_calibration_engine_unit_tests: pass");
