(function installParentEntry(root) {
  const engine = root?.SatEntryEngine;
  if (engine?.installEntryConfig) {
    engine.installEntryConfig(root, "parent");
    return;
  }
  if (root) {
    root.SAT_STUDIO_ENTRY_CONFIG = Object.freeze({
      role: "parent",
      allowedRoles: ["parent"],
      bundle: "family",
      entryPoint: "app_parent.js",
      defaultView: "dashboard",
      defaultAccountId: "parent-admin",
      dataChannels: ["family_profiles", "official_logs", "rewards", "news"],
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
