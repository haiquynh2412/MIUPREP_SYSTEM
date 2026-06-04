(function loadSatStudioByRole(root) {
  const bootstrapScripts = [
    "sat_i18n.js",
    "sat_core.js",
    "sat_storage.js",
    "sat_indexeddb.js",
    "sat_public_api.js",
    "sat_richtext.js",
    "sat_design_system.js",
    "sat_view_renderers.js",
    "sat_account_view_renderers.js",
    "sat_content_lifecycle_engine.js",
    "sat_permissions.js",
    "sat_role_boundary_engine.js",
    "sat_entry_engine.js",
    "sat_source_ledger.js",
  ];
  const learnerScripts = [
    "sat_question_query_engine.js",
    "sat_content_package_engine.js",
    "sat_learner_content_gateway.js",
    "sat_study_policy_engine.js",
    "sat_sampler_engine.js",
    "sat_router_engine.js",
    "sat_dashboard_engine.js",
    "sat_data_loaders.js",
    "sat_adaptive_routing_engine.js",
    "sat_diagnostic_engine.js",
    "sat_lesson_engine.js",
    "sat_remediation_engine.js",
    "sat_practice_engine.js",
    "sat_mastery_engine.js",
    "sat_roadmap_engine.js",
    "sat_student_experience_engine.js",
    "sat_learning_event_engine.js",
    "sat_item_analytics_engine.js",
    "sat_irt_calibration_engine.js",
    "sat_duplicate_engine.js",
    "sat_account_engine.js",
    "sat_exam_review_engine.js",
  ];
  const adminScripts = [
    "sat_admin_view_renderers.js",
    "sat_public_manifest_engine.js",
    "sat_content_admin_engine.js",
    "sat_question_import.js",
    "sat_import_engine.js",
    "sat_authoring_engine.js",
    "sat_quality_intake_engine.js",
    "sat_question_audit_engine.js",
  ];

  function appendScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.body.appendChild(script);
    });
  }

  function uniqueSequence(items) {
    const seen = {};
    return items.filter((src) => {
      if (seen[src]) return false;
      seen[src] = true;
      return true;
    });
  }

  function roleSequenceFor(config) {
    const role = config?.role;
    const roleEntry = config?.entryPoint ? [config.entryPoint] : [];
    if (role === "student" || role === "parent") return uniqueSequence([...bootstrapScripts, ...roleEntry, ...learnerScripts, "app.js"]);
    if (role === "admin") return uniqueSequence([...bootstrapScripts, ...roleEntry, ...learnerScripts, ...adminScripts, "app.js"]);
    return uniqueSequence([...bootstrapScripts, ...learnerScripts, ...adminScripts, "app.js"]);
  }

  bootstrapScripts
    .reduce((chain, src) => chain.then(() => appendScript(src)), Promise.resolve())
    .then(() => {
      const config = root.SAT_STUDIO_ENTRY_CONFIG || root.SatEntryEngine?.entryConfigFromLocation(root.location);
      if (!config?.entryPoint) return config || null;
      return appendScript(config.entryPoint).then(() => root.SAT_STUDIO_ENTRY_CONFIG || config);
    })
    .then((config) => {
      const loaded = {};
      bootstrapScripts.forEach((src) => {
        loaded[src] = true;
      });
      if (config?.entryPoint) loaded[config.entryPoint] = true;
      root.SAT_STUDIO_SCRIPT_SEQUENCE = roleSequenceFor(config);
      root.SAT_STUDIO_SCRIPT_BUDGET = root.SatEntryEngine?.evaluateScriptSequence
        ? root.SatEntryEngine.evaluateScriptSequence(root.SAT_STUDIO_SCRIPT_SEQUENCE, config || "")
        : null;
      return root.SAT_STUDIO_SCRIPT_SEQUENCE.reduce((chain, src) => {
        return chain.then(() => {
          if (loaded[src]) return null;
          loaded[src] = true;
          return appendScript(src);
        });
      }, Promise.resolve());
    })
    .catch((error) => {
      console.error(error);
      document.body.dataset.satStudioBootError = "true";
      const panel = document.createElement("div");
      panel.className = "empty-state";
      panel.textContent = error?.message || "SAT Studio could not start.";
      document.body.appendChild(panel);
    });
})(typeof window !== "undefined" ? window : globalThis);
