const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = require("../sat_architecture_manifest.js");
const router = require("../sat_router_engine.js");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function lineCount(relativePath) {
  return read(relativePath).split(/\r?\n/).length;
}

const app = read("app.js");
const index = read("index.html");
const bootstrapLoader = read("sat_bootstrap_loader.js");
const browserBootstrap = `${index}\n${bootstrapLoader}`;
const quality = read("scripts/run_quality_checks.js");
const publicBackend = read("sat_public_backend.py");
const publicApp = read("sat_public_app.py");
const questionQueryEngine = read("sat_question_query_engine.js");
const learnerContentGateway = read("sat_learner_content_gateway.js");
const contentAdminEngine = read("sat_content_admin_engine.js");
const contentLifecycleEngine = read("sat_content_lifecycle_engine.js");
const designSystem = read("sat_design_system.js");
const roleBoundaryEngine = read("sat_role_boundary_engine.js");
const entryEngine = read("sat_entry_engine.js");
const releaseChecklist = read("scripts/release_checklist.py");

assert.strictEqual(manifest.checkpoints.length, 5, "Architecture manifest should track P0 through P4.");
assert.ok(manifest.layers.some((layer) => layer.name === "i18n"), "Architecture manifest should define the i18n layer.");
assert.ok(manifest.layers.some((layer) => layer.name === "role-view-contract"), "Architecture manifest should define the role/view contract layer.");
assert.ok(manifest.layers.some((layer) => layer.name === "design-system"), "Architecture manifest should define the design system layer.");
assert.ok(manifest.layers.some((layer) => layer.name === "production-readiness"), "Architecture manifest should define the production readiness layer.");
assert.strictEqual(manifest.version, "2026-05-25-role-safe-adaptive-plan", "Architecture manifest should track the current role-safe adaptive contract.");
assert.equal(typeof router.allowedViewsForAccount, "function", "Router engine should own allowed view policy.");
assert.equal(typeof router.studentNavGroups, "function", "Router engine should own student navigation groups.");
assert.ok(browserBootstrap.indexOf('"sat_i18n.js"') > -1, "index.html should load the i18n module.");
assert.ok(browserBootstrap.indexOf('"sat_i18n.js"') < browserBootstrap.indexOf('"app.js"'), "i18n must load before app.js.");
assert.ok(browserBootstrap.indexOf('"sat_design_system.js"') > -1, "index.html should load the design system module.");
assert.ok(browserBootstrap.indexOf('"sat_role_boundary_engine.js"') > -1, "index.html should load the role boundary module.");
assert.ok(browserBootstrap.indexOf('"sat_role_boundary_engine.js"') < browserBootstrap.indexOf('"app.js"'), "Role boundary engine must load before app.js.");
assert.ok(browserBootstrap.indexOf('"sat_entry_engine.js"') > -1, "index.html should load the entry engine module.");
assert.ok(browserBootstrap.indexOf('"sat_entry_engine.js"') < browserBootstrap.indexOf('"app.js"'), "Entry engine must load before app.js.");
assert.ok(browserBootstrap.indexOf('"sat_content_lifecycle_engine.js"') > -1, "index.html should load the content lifecycle module.");
assert.ok(browserBootstrap.indexOf('"sat_content_lifecycle_engine.js"') < browserBootstrap.indexOf('"sat_permissions.js"'), "Content lifecycle must load before permissions.");
assert.ok(browserBootstrap.indexOf('"sat_content_lifecycle_engine.js"') < browserBootstrap.indexOf('"app.js"'), "Content lifecycle must load before app.js.");
assert.ok(!app.includes("const dynamicUiViText = new Map("), "Dynamic i18n map should stay out of app.js.");
assert.ok(!app.includes("const dynamicUiViPatterns = ["), "Dynamic i18n patterns should stay out of app.js.");
assert.ok(app.includes("SatStudioI18n."), "app.js should consume the i18n module.");
assert.ok(quality.includes('sat_i18n.js'), "Quality checks should include sat_i18n.js.");
assert.ok(quality.includes("i18n_unit_tests.js"), "Quality checks should include i18n unit tests.");
assert.ok(quality.includes("sat_content_lifecycle_engine.js"), "Quality checks should include content lifecycle engine.");
assert.ok(quality.includes("content_lifecycle_engine_unit_tests.js"), "Quality checks should include content lifecycle tests.");
assert.ok(publicBackend.includes("BACKEND_SYNC_CONTRACT"), "Public backend should expose a sync contract.");
assert.ok(publicBackend.includes("PROTECTED_CONTENT_FIELD_KEYS"), "Public backend should redact protected official/question content fields.");
assert.ok(publicApp.includes('/api/public/sync-contract'), "Public API should expose the backend sync contract.");
assert.ok(questionQueryEngine.includes("QUESTION_BANK_CONTRACT_VERSION"), "Question query engine should expose a versioned bank contract.");
assert.ok(questionQueryEngine.includes("queryQuestionBank"), "Question query engine should expose scoped retrieval.");
assert.ok(browserBootstrap.indexOf('"sat_learner_content_gateway.js"') > -1, "Browser bootstrap should load the learner content gateway.");
assert.ok(browserBootstrap.indexOf('"sat_content_package_engine.js"') < browserBootstrap.indexOf('"sat_learner_content_gateway.js"'), "Content package engine must load before learner content gateway.");
assert.ok(learnerContentGateway.includes("loadBackendContentPackage"), "Learner content gateway should own backend package loading.");
assert.ok(learnerContentGateway.includes("loadReviewedStudyBank"), "Learner content gateway should own reviewed-bank orchestration.");
assert.ok(app.includes("SatLearnerContentGateway.loadReviewedStudyBank"), "app.js should delegate reviewed-bank orchestration.");
assert.ok(contentAdminEngine.includes("buildContentAdminCommandModel"), "Content admin engine should own curriculum command modeling.");
assert.ok(contentAdminEngine.includes("POST_UPLOAD_CHECKS"), "Content admin engine should own post-upload verification checks.");
assert.ok(contentLifecycleEngine.includes("deriveLifecycleState"), "Content lifecycle engine should own canonical question lifecycle state.");
assert.ok(app.includes("SatContentLifecycleEngine"), "app.js should consume the content lifecycle engine instead of duplicating lifecycle rules.");
assert.ok(designSystem.includes("loadingPanel"), "Design system should own shared loading UI.");
assert.ok(roleBoundaryEngine.includes("filterQuestionsForRole"), "Role boundary engine should own role-scoped bank filtering.");
assert.ok(roleBoundaryEngine.includes("ROLE_ENTRY_POINTS"), "Role boundary engine should declare future role entry points.");
assert.ok(entryEngine.includes("ENTRY_CONFIGS"), "Entry engine should own role-specific shell configs.");
assert.ok(entryEngine.includes("evaluateScriptSequence"), "Entry engine should own role script performance budget checks.");
assert.ok(bootstrapLoader.includes("SAT_STUDIO_SCRIPT_BUDGET"), "Bootstrap loader should publish role script budget status.");
assert.ok(app.includes("applyEntryRoleGate"), "Browser shell should enforce entry-role gates before rendering.");
assert.ok(releaseChecklist.includes("PRODUCTION_READINESS_CONTRACT"), "Release checklist should expose the P4 production readiness contract.");
assert.ok(releaseChecklist.includes("evaluate_production_contract_sources"), "Release checklist should verify production guardrail sources.");
assert.ok(lineCount("app.js") <= manifest.currentBudgets.appJsMaxLines, "app.js should stay within the current P0 budget.");
assert.ok(lineCount("index.html") <= manifest.currentBudgets.indexHtmlMaxLines, "index.html should stay within the current P0 budget.");
assert.ok(lineCount("styles.css") <= manifest.currentBudgets.stylesCssMaxLines, "styles.css should stay within the current P0 budget.");
assert.ok(manifest.currentBudgets.studentEntryMaxScripts <= 40, "Student entry should keep a strict script budget.");

console.log("architecture_boundary_tests: pass");
