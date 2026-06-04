(function initSatEntryEngine(root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }
  if (root) {
    root.SatEntryEngine = engine;
    engine.autoInstall(root);
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatEntryEngine() {
  const ENTRY_CONFIGS = Object.freeze({
    student: Object.freeze({
      role: "student",
      allowedRoles: Object.freeze(["student"]),
      bundle: "learner",
      entryPoint: "app_student.js",
      shortcut: "student.html",
      defaultView: "dashboard",
      defaultAccountId: "student-demo",
      dataChannels: Object.freeze(["profile", "study_bank", "lessons", "roadmap", "news"]),
      performanceBudget: Object.freeze({ maxScripts: 40, forbidAdminScripts: true }),
    }),
    parent: Object.freeze({
      role: "parent",
      allowedRoles: Object.freeze(["parent"]),
      bundle: "family",
      entryPoint: "app_parent.js",
      shortcut: "parent.html",
      defaultView: "dashboard",
      defaultAccountId: "parent-admin",
      dataChannels: Object.freeze(["family_profiles", "official_logs", "rewards", "news"]),
      performanceBudget: Object.freeze({ maxScripts: 40, forbidAdminScripts: true }),
    }),
    admin: Object.freeze({
      role: "admin",
      allowedRoles: Object.freeze(["admin"]),
      bundle: "content_admin",
      entryPoint: "app_admin.js",
      shortcut: "admin.html",
      defaultView: "admin",
      defaultAccountId: "content-admin",
      dataChannels: Object.freeze(["full_bank", "source_registry", "audit_reports", "public_manifest", "accounts", "news"]),
      performanceBudget: Object.freeze({ maxScripts: 52, forbidAdminScripts: false }),
    }),
  });
  const ADMIN_ONLY_SCRIPTS = Object.freeze([
    "sat_admin_view_renderers.js",
    "sat_public_manifest_engine.js",
    "sat_content_admin_engine.js",
    "sat_question_import.js",
    "sat_import_engine.js",
    "sat_authoring_engine.js",
    "sat_quality_intake_engine.js",
    "sat_question_audit_engine.js",
  ]);

  function normalizeRole(value = "") {
    const role = String(value || "").trim().toLowerCase();
    return ENTRY_CONFIGS[role] ? role : "";
  }

  function cloneConfig(config) {
    if (!config) return null;
    return {
      role: config.role,
      allowedRoles: [...config.allowedRoles],
      bundle: config.bundle,
      entryPoint: config.entryPoint,
      shortcut: config.shortcut,
      defaultView: config.defaultView,
      defaultAccountId: config.defaultAccountId,
      dataChannels: [...config.dataChannels],
      performanceBudget: { ...(config.performanceBudget || {}) },
    };
  }

  function entryConfigForRole(role = "") {
    return cloneConfig(ENTRY_CONFIGS[normalizeRole(role)]);
  }

  function entryRoleFromLocation(locationLike = null) {
    if (!locationLike) return "";
    try {
      const url = new URL(locationLike.href || String(locationLike), "http://satstudio.local/");
      const queryRole = normalizeRole(url.searchParams.get("entry") || url.searchParams.get("roleApp") || "");
      if (queryRole) return queryRole;
      const path = url.pathname.toLowerCase();
      if (/(^|\/)student(\.html)?$/.test(path)) return "student";
      if (/(^|\/)parent(\.html)?$/.test(path)) return "parent";
      if (/(^|\/)admin(\.html)?$/.test(path)) return "admin";
    } catch {
      return "";
    }
    return "";
  }

  function entryConfigFromLocation(locationLike = null) {
    return entryConfigForRole(entryRoleFromLocation(locationLike));
  }

  function installEntryConfig(root = null, role = "") {
    const config = entryConfigForRole(role);
    if (!root || !config) return null;
    root.SAT_STUDIO_ENTRY_CONFIG = Object.freeze(config);
    if (root.document?.documentElement) {
      root.document.documentElement.dataset.satEntryRole = config.role;
      root.document.documentElement.dataset.satEntryBundle = config.bundle;
    }
    return config;
  }

  function performanceBudgetForRole(role = "") {
    const config = entryConfigForRole(role);
    return config?.performanceBudget || { maxScripts: 52, forbidAdminScripts: false };
  }

  function evaluateScriptSequence(sequence = [], configOrRole = "") {
    const config = typeof configOrRole === "string" ? entryConfigForRole(configOrRole) : configOrRole;
    const role = config?.role || normalizeRole(configOrRole) || "";
    const budget = config?.performanceBudget || performanceBudgetForRole(role);
    const scripts = Array.isArray(sequence) ? sequence.filter(Boolean) : [];
    const adminOnlyLoaded = scripts.filter((src) => ADMIN_ONLY_SCRIPTS.includes(src));
    const violations = [];
    if (Number(budget.maxScripts || 0) && scripts.length > Number(budget.maxScripts)) {
      violations.push(`script_count:${scripts.length}>${budget.maxScripts}`);
    }
    if (budget.forbidAdminScripts && adminOnlyLoaded.length) {
      violations.push(`admin_scripts_loaded:${adminOnlyLoaded.join(",")}`);
    }
    if (config?.entryPoint && !scripts.includes(config.entryPoint)) {
      violations.push(`missing_entry_point:${config.entryPoint}`);
    }
    return {
      ok: violations.length === 0,
      role,
      bundle: config?.bundle || "",
      scriptCount: scripts.length,
      maxScripts: Number(budget.maxScripts || 0),
      forbidAdminScripts: Boolean(budget.forbidAdminScripts),
      adminOnlyLoaded,
      violations,
    };
  }

  function autoInstall(root = null) {
    if (!root || root.SAT_STUDIO_ENTRY_CONFIG) return root?.SAT_STUDIO_ENTRY_CONFIG || null;
    return installEntryConfig(root, entryRoleFromLocation(root.location));
  }

  return {
    ENTRY_CONFIGS,
    ADMIN_ONLY_SCRIPTS,
    autoInstall,
    entryConfigForRole,
    entryConfigFromLocation,
    entryRoleFromLocation,
    evaluateScriptSequence,
    installEntryConfig,
    normalizeRole,
    performanceBudgetForRole,
  };
});
