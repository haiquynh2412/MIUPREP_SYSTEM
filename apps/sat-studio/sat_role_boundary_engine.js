(function initSatRoleBoundaryEngine(root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }
  if (root) {
    root.SatRoleBoundaryEngine = engine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatRoleBoundaryEngine() {
  const TECHNICAL_STUDENT_BLOCKLIST = Object.freeze([
    "Admin Center",
    "Bank Manager",
    "Authoring",
    "Quality Audit",
    "Quality audit",
    "Question Governance",
    "Needs Review",
    "Needs bank review",
    "Review status",
    "Manifest",
    "Public candidate",
    "Source risk",
    "Source registry",
    "Source:",
    "source signal",
    "Integrity report",
    "Generated drafts",
    "Public firewall",
    "ready local questions",
    "browser bank",
    "audit/rejected",
    "source-signed",
    "reviewed questions",
  ]);

  const STUDENT_QUESTION_FIELDS = Object.freeze([
    "id",
    "section",
    "domain",
    "skill",
    "difficulty",
    "questionType",
    "type",
    "prompt",
    "choices",
    "correctAnswer",
    "acceptableAnswers",
    "explanation",
    "tags",
    "lessonKey",
    "vocab",
  ]);

  const ROLE_ENTRY_POINTS = Object.freeze({
    student: Object.freeze({
      file: "app_student.js",
      bundle: "learner",
      views: Object.freeze(["dashboard", "pretest", "roadmap", "lessons", "topics", "practice", "review", "notes", "vocab", "official", "news", "guide"]),
      data: Object.freeze(["profile", "study_bank", "lessons", "roadmap", "news"]),
    }),
    parent: Object.freeze({
      file: "app_parent.js",
      bundle: "family",
      views: Object.freeze(["dashboard", "accounts", "official", "news", "guide"]),
      data: Object.freeze(["family_profiles", "official_logs", "rewards", "news"]),
    }),
    admin: Object.freeze({
      file: "app_admin.js",
      bundle: "content_admin",
      views: Object.freeze(["admin", "practice", "sources", "bank", "author", "accounts", "official", "news", "guide"]),
      data: Object.freeze(["full_bank", "source_registry", "audit_reports", "public_manifest", "accounts", "news"]),
    }),
  });

  function roleForAccount(account = null) {
    const role = String(account?.role || "student").trim();
    return ROLE_ENTRY_POINTS[role] ? role : "student";
  }

  function runtimeProfileForAccount(account = null) {
    const role = roleForAccount(account);
    const entry = ROLE_ENTRY_POINTS[role];
    return {
      role,
      entryPoint: entry.file,
      bundle: entry.bundle,
      views: [...entry.views],
      dataChannels: [...entry.data],
      canSeeTechnicalMetadata: role === "admin",
      allowAdminReports: role === "admin",
      allowContentGovernance: role === "admin",
      allowSourceRegistry: role === "admin",
      allowFullBankGovernance: role === "admin",
    };
  }

  function questionIsStudentReady(question = {}) {
    const reviewStatus = String(question.reviewStatus || "").toLowerCase();
    const auditStatus = String(question.auditStatus || "").toLowerCase();
    const publicationStatus = String(question.publicationStatus || "").toLowerCase();
    const contentVerdict = String(question.contentAudit?.verdict || "").toLowerCase();
    return (
      reviewStatus === "reviewed" &&
      auditStatus !== "blocked" &&
      !publicationStatus.startsWith("rejected") &&
      publicationStatus !== "audit_blocked" &&
      contentVerdict !== "blocked" &&
      contentVerdict !== "fail"
    );
  }

  function filterQuestionsForRole(questions = [], account = null, options = {}) {
    const role = roleForAccount(account);
    if (role !== "student") return questions;
    const isStudyQuestion = typeof options.isStudyQuestion === "function" ? options.isStudyQuestion : questionIsStudentReady;
    return questions.filter((question) => questionIsStudentReady(question) && isStudyQuestion(question));
  }

  function roleQuestionForDisplay(question = null, account = null) {
    if (!question || roleForAccount(account) !== "student") return question;
    const out = {};
    STUDENT_QUESTION_FIELDS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(question, key)) {
        out[key] = Array.isArray(question[key]) ? [...question[key]] : question[key] && typeof question[key] === "object" ? { ...question[key] } : question[key];
      }
    });
    return out;
  }

  function buildRolePreloadPlan(view = "", account = null, basePlan = {}) {
    const profile = runtimeProfileForAccount(account);
    const activeView = String(view || basePlan.activeView || "");
    const plan = { ...basePlan, activeView, role: profile.role, bundle: profile.bundle };
    if (profile.role === "student") {
      plan.banks = ["pretest", "lessons", "topics", "practice"].includes(activeView);
      plan.reviewedStudyBank = plan.banks;
      plan.archiveRegistry = false;
      plan.questionIntegrityReport = false;
      plan.reviewedExpertAuditReport = false;
      plan.externalResources = ["lessons", "topics", "practice"].includes(activeView);
    } else if (profile.role === "parent") {
      plan.banks = false;
      plan.archiveRegistry = false;
      plan.questionIntegrityReport = false;
      plan.reviewedExpertAuditReport = false;
      plan.externalResources = false;
    } else {
      plan.reviewedExpertAuditReport = activeView === "admin";
    }
    return plan;
  }

  function scanStudentUiLeakage(text = "", options = {}) {
    const allow = new Set(options.allow || []);
    return TECHNICAL_STUDENT_BLOCKLIST.filter((term) => !allow.has(term) && String(text || "").includes(term));
  }

  return {
    ROLE_ENTRY_POINTS,
    STUDENT_QUESTION_FIELDS,
    TECHNICAL_STUDENT_BLOCKLIST,
    buildRolePreloadPlan,
    filterQuestionsForRole,
    questionIsStudentReady,
    roleForAccount,
    roleQuestionForDisplay,
    runtimeProfileForAccount,
    scanStudentUiLeakage,
  };
});
