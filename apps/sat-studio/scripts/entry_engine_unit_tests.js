const assert = require("node:assert/strict");

const entryEngine = require("../sat_entry_engine.js");

function run() {
  assert.equal(entryEngine.normalizeRole("student"), "student");
  assert.equal(entryEngine.normalizeRole("unknown"), "");

  const student = entryEngine.entryConfigForRole("student");
  assert.equal(student.role, "student");
  assert.equal(student.bundle, "learner");
  assert.deepEqual(student.allowedRoles, ["student"]);
  assert.ok(student.dataChannels.includes("study_bank"));
  assert.equal(student.performanceBudget.maxScripts, 40);
  assert.equal(student.performanceBudget.forbidAdminScripts, true);

  const adminFromQuery = entryEngine.entryConfigFromLocation("http://127.0.0.1:8765/index.html?entry=admin");
  assert.equal(adminFromQuery.role, "admin");
  assert.equal(adminFromQuery.defaultView, "admin");

  assert.equal(entryEngine.entryRoleFromLocation("http://127.0.0.1:8765/student.html"), "student");
  assert.equal(entryEngine.entryRoleFromLocation("http://127.0.0.1:8765/parent"), "parent");
  assert.equal(entryEngine.entryRoleFromLocation("http://127.0.0.1:8765/index.html"), "");

  const root = { location: { href: "http://127.0.0.1:8765/index.html?entry=parent" }, document: { documentElement: { dataset: {} } } };
  const installed = entryEngine.autoInstall(root);
  assert.equal(installed.role, "parent");
  assert.equal(root.SAT_STUDIO_ENTRY_CONFIG.bundle, "family");
  assert.equal(root.document.documentElement.dataset.satEntryRole, "parent");

  const studentBudget = entryEngine.evaluateScriptSequence(["sat_i18n.js", "app_student.js", "app.js"], student);
  assert.equal(studentBudget.ok, true);
  const leakyStudentBudget = entryEngine.evaluateScriptSequence(["app_student.js", "sat_content_admin_engine.js", "app.js"], student);
  assert.equal(leakyStudentBudget.ok, false);
  assert.ok(leakyStudentBudget.violations.some((item) => item.includes("admin_scripts_loaded")));
}

run();
console.log("entry engine unit tests passed");
