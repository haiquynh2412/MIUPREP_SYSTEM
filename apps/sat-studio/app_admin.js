(function installAdminEntry(root) {
  const engine = root?.SatEntryEngine;
  if (engine?.installEntryConfig) {
    engine.installEntryConfig(root, "admin");
    return;
  }
  if (root) {
    root.SAT_STUDIO_ENTRY_CONFIG = Object.freeze({
      role: "admin",
      allowedRoles: ["admin"],
      bundle: "content_admin",
      entryPoint: "app_admin.js",
      defaultView: "admin",
      defaultAccountId: "content-admin",
      dataChannels: ["full_bank", "source_registry", "audit_reports", "public_manifest", "accounts", "news"],
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
