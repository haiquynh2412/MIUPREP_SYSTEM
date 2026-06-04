const assert = require("node:assert/strict");
const router = require("../sat_router_engine.js");

function fakeClassList() {
  return {
    active: false,
    toggle(name, value) {
      if (name === "active") this.active = Boolean(value);
    },
  };
}

function run() {
  assert.equal(router.normalizeView("practice"), "practice");
  assert.equal(router.normalizeView("missing"), "dashboard");
  assert.equal(router.normalizeView("missing", "roadmap"), "roadmap");
  assert.equal(router.defaultViewForAccount({ role: "admin" }), "admin");
  assert.equal(router.defaultViewForAccount({ role: "student" }), "dashboard");
  assert.equal(router.roleForAccount({ role: "unknown" }), "student");

  assert.deepEqual([...router.allowedViewsForAccount({ role: "admin" })], [
    "admin",
    "practice",
    "sources",
    "bank",
    "author",
    "accounts",
    "official",
    "news",
    "guide",
  ]);
  assert.equal(router.allowedViewsForAccount({ role: "parent" }).has("author"), false);
  assert.equal(router.allowedViewsForAccount({ role: "parent" }, { canAuthorQuestions: true }).has("author"), true);
  assert.equal(router.allowedViewsForAccount({ role: "student" }).has("bank"), false);
  assert.equal(router.allowedViewsForAccount({ role: "student" }).has("pretest"), true);
  assert.equal(router.parentDashboardLabel("vi"), "Phụ huynh");

  const studentLabelsVi = router.studentNavLabels("vi");
  assert.equal(studentLabelsVi.dashboard, "Hôm nay");
  assert.equal(studentLabelsVi.review, "Ôn lỗi sai");
  const studentGroupsEn = router.studentNavGroups("en");
  assert.equal(studentGroupsEn[0].label, "Today");
  assert.deepEqual(studentGroupsEn[2].views, ["pretest", "practice", "review"]);
  assert.deepEqual(router.studentNavBadges({ language: "vi", hasBaseline: false, dueCount: 2, notesDue: 1 }), {
    pretest: "20 câu",
    review: "2",
    lessons: "",
    notes: "1",
  });
  assert.equal(router.studentNavBadges({ language: "en", hasBaseline: true }).lessons, "1 lesson");

  const english = router.buildViewState("pretest", "en");
  assert.equal(english.activeView, "pretest");
  assert.equal(english.viewNodeId, "view-pretest");
  assert.match(english.title, /Pretest/);

  const vietnamese = router.buildViewState("roadmap", "vi");
  assert.equal(vietnamese.activeView, "roadmap");
  assert.match(vietnamese.title, /Lộ trình/);

  assert.deepEqual(router.buildViewPreloadPlan("sources"), {
    activeView: "sources",
    banks: true,
    archiveRegistry: true,
    questionIntegrityReport: true,
    externalResources: false,
  });
  assert.equal(router.buildViewPreloadPlan("dashboard").banks, false);
  assert.equal(router.buildViewPreloadPlan("dashboard").externalResources, true);

  const dashboardTab = { dataset: { view: "dashboard" }, classList: fakeClassList() };
  const practiceTab = { dataset: { view: "practice" }, classList: fakeClassList() };
  const dashboardView = { id: "view-dashboard", classList: fakeClassList() };
  const practiceView = { id: "view-practice", classList: fakeClassList() };
  const doc = {
    querySelectorAll(selector) {
      if (selector === ".nav-tab") return [dashboardTab, practiceTab];
      if (selector === ".view") return [dashboardView, practiceView];
      return [];
    },
  };
  const applied = router.applyViewDom("practice", doc);
  assert.equal(applied.activeView, "practice");
  assert.equal(dashboardTab.classList.active, false);
  assert.equal(practiceTab.classList.active, true);
  assert.equal(dashboardView.classList.active, false);
  assert.equal(practiceView.classList.active, true);
}

run();
console.log("router_engine_unit_tests: pass");
