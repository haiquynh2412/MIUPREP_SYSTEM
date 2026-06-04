const assert = require("node:assert");
const i18n = require("../sat_i18n.js");

assert.ok(i18n.translations.en.navDashboard, "English translations should export nav labels.");
assert.ok(i18n.translations.vi.navDashboard, "Vietnamese translations should export nav labels.");
assert.strictEqual(i18n.labelFor("needs_review"), "Needs Review");
assert.strictEqual(i18n.studentUiLabel("Math", "vi"), "Toán");
assert.strictEqual(i18n.studentUiLabel("Math", "en"), "Math");
assert.ok(i18n.dynamicUiViText.get("Time remaining"), "Dynamic Vietnamese text map should include pretest labels.");
assert.ok(i18n.dynamicUiViPatterns.some(([pattern]) => pattern.test("Question 1 of 20")), "Dynamic Vietnamese patterns should include question counters.");

console.log("i18n_unit_tests: pass");
