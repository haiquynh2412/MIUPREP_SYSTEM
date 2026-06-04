(function installStudentEntry(root) {
  const engine = root?.SatEntryEngine;
  if (engine?.installEntryConfig) {
    engine.installEntryConfig(root, "student");
    return;
  }
  if (root) {
    root.SAT_STUDIO_ENTRY_CONFIG = Object.freeze({
      role: "student",
      allowedRoles: ["student"],
      bundle: "learner",
      entryPoint: "app_student.js",
      defaultView: "dashboard",
      defaultAccountId: "student-demo",
      dataChannels: ["profile", "study_bank", "lessons", "roadmap", "news"],
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
