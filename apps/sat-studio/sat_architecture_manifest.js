(function initSatStudioArchitectureManifest(root, factory) {
  const manifest = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = manifest;
  }
  if (root) {
    root.SatStudioArchitectureManifest = manifest;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioArchitectureManifest() {
  return {
    version: "2026-05-25-role-safe-adaptive-plan",
    releaseContractVersion: "2026-05-22-p4-production-readiness",
    principle: "Keep SAT pedagogy engines reusable while shrinking the browser shell and moving production data to the backend.",
    layers: [
      {
        name: "browser-shell",
        owns: ["DOM events", "view orchestration", "session state adapters"],
        files: ["app.js", "index.html", "styles.css"],
        direction: "shrink",
      },
      {
        name: "role-view-contract",
        owns: ["role default views", "allowed view policy", "navigation grouping and labels", "role data and metadata boundaries", "role-specific entry shells"],
        files: ["sat_bootstrap_loader.js", "sat_router_engine.js", "sat_role_boundary_engine.js", "sat_entry_engine.js", "app_student.js", "app_parent.js", "app_admin.js", "student.html", "parent.html", "admin.html"],
        direction: "pure policy consumed by browser shell",
      },
      {
        name: "design-system",
        owns: ["shared button, badge, loading, skeleton primitives"],
        files: ["sat_design_system.js", "styles.css"],
        direction: "single vocabulary for learner, parent, and admin UI components",
      },
      {
        name: "i18n",
        owns: ["static translations", "dynamic Vietnamese text rules", "label helpers"],
        files: ["sat_i18n.js"],
        direction: "keep isolated from app.js",
      },
      {
        name: "learning-engines",
        owns: ["diagnostic", "roadmap", "lesson", "practice", "mastery", "remediation", "exam review"],
        files: [
          "sat_diagnostic_engine.js",
          "sat_sampler_engine.js",
          "sat_roadmap_engine.js",
          "sat_lesson_engine.js",
          "sat_practice_engine.js",
          "sat_mastery_engine.js",
          "sat_remediation_engine.js",
          "sat_exam_review_engine.js",
        ],
        direction: "pure logic first",
      },
      {
        name: "content-governance",
        owns: ["question import", "source policy", "public manifest", "audit", "duplicate and intake gates"],
        files: [
          "data/question-study-policy.json",
          "sat_study_policy_engine.js",
          "sat_source_ledger.js",
          "sat_content_lifecycle_engine.js",
          "sat_question_import.js",
          "sat_import_engine.js",
          "sat_quality_intake_engine.js",
          "sat_public_manifest_engine.js",
          "sat_content_admin_engine.js",
          "sat_question_audit_engine.js",
          "sat_duplicate_engine.js",
        ],
        direction: "server-governed for production",
      },
      {
        name: "public-backend",
        owns: ["auth", "RBAC", "progress/profile sync", "audit log", "sanitized export"],
        files: ["sat_public_backend.py", "sat_public_app.py", "sat_public_api.js", "sat_learner_content_gateway.js", "server.py"],
        direction: "move source of truth from browser to backend",
      },
      {
        name: "production-readiness",
        owns: ["release contract", "health checks", "backups", "deploy docs", "public backend smoke gates"],
        files: [
          "scripts/release_checklist.py",
          "scripts/check_public_backend_health.py",
          "scripts/backup_public_backend.py",
          "PUBLIC_BACKEND.md",
          ".env.public.example",
        ],
        direction: "codify launch blockers before public deployment",
      },
    ],
    checkpoints: [
      { phase: "P0", goal: "Enforce reviewed/pass content in study engines and load role-specific browser bundles." },
      { phase: "P1", goal: "Use score bands, confidence, and one adaptive-routing policy for diagnostic-to-roadmap decisions." },
      { phase: "P2", goal: "Make backend/repository APIs the source of truth and keep browser storage as a cache." },
      { phase: "P3", goal: "Add SAT-blueprint sampler quotas, topic repetition controls, and admin content planning gates." },
      { phase: "P4", goal: "Shrink shell files, centralize safe rendering, and enforce student bundle performance budgets." },
    ],
    currentBudgets: {
      appJsMaxLines: 17870,
      indexHtmlMaxLines: 2000,
      stylesCssMaxLines: 8030,
      studentEntryMaxScripts: 40,
      parentEntryMaxScripts: 40,
      adminEntryMaxScripts: 52,
    },
  };
});
