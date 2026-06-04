(function initSatStudioPermissions(root, factory) {
  let lifecycleEngine = root?.SatStudioContentLifecycleEngine;
  if (!lifecycleEngine && typeof require === "function") {
    lifecycleEngine = require("./sat_content_lifecycle_engine.js");
  }
  const permissions = factory(lifecycleEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = permissions;
  }
  if (root) {
    root.SatStudioPermissions = permissions;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioPermissions(lifecycleEngine) {
  const BLOCKED_PUBLIC_SOURCE_TYPES = new Set(["private_vault", "college_board", "cracksat_reference", "official_log"]);

  function isFamilyAccount(account) {
    return Boolean(account && account.scope !== "public");
  }

  function canAccessPrivateContent(account) {
    return isFamilyAccount(account);
  }

  function isContentAdmin(account) {
    return account?.role === "admin";
  }

  function isAccountManager(account) {
    return account?.role === "admin" || account?.role === "parent";
  }

  function canCreateAnyAccount(account) {
    return isContentAdmin(account);
  }

  function accountPermission(account, key) {
    if (isContentAdmin(account)) return true;
    const permissions = account?.permissions && typeof account.permissions === "object" ? account.permissions : {};
    return Boolean(permissions[key]);
  }

  function canManageRewards(account) {
    return isContentAdmin(account) || (account?.role === "parent" && accountPermission(account, "rewardManager"));
  }

  function canAuthorQuestions(account) {
    return isContentAdmin(account) || (account?.role === "parent" && accountPermission(account, "questionContributor"));
  }

  function canViewAdminOnly(account) {
    return canAccessPrivateContent(account) && ["admin", "parent"].includes(account?.role);
  }

  function isQuestionVisible(question, account) {
    if (!question) return false;
    if (!canAccessPrivateContent(account)) return isPublicSafeQuestion(question);
    if (question.visibility === "private_family") return canAccessPrivateContent(account);
    if (question.visibility === "admin_only") return canViewAdminOnly(account);
    return true;
  }

  function isGridInQuestion(question) {
    const normalizedType = String(question?.questionType || question?.type || "").toLowerCase();
    return ["student_produced_response", "student-produced-response", "grid_in", "grid-in", "numeric", "spr"].includes(normalizedType);
  }

  function hasExplanation(question) {
    const explanation = question?.explanation;
    if (!explanation) return false;
    if (typeof explanation === "string") return explanation.trim().length > 0;
    if (typeof explanation === "object") return Object.values(explanation).some((value) => String(value || "").trim().length > 0);
    return true;
  }

  function hasCompleteMultipleChoice(question) {
    const choices = question?.choices || {};
    return ["A", "B", "C", "D"].every((letter) => String(choices[letter] || "").trim()) && Boolean(choices[question?.correctAnswer]);
  }

  function hasCompleteGridInAnswer(question) {
    const correctAnswer = String(question?.correctAnswer || "").trim();
    const acceptableAnswers = Array.isArray(question?.acceptableAnswers) ? question.acceptableAnswers : [];
    return Boolean(correctAnswer) && acceptableAnswers.some((value) => String(value || "").trim());
  }

  function isQuestionStructurallyIncompleteForStudy(question) {
    if (!question) return true;
    if (!hasExplanation(question)) return true;
    return isGridInQuestion(question) ? !hasCompleteGridInAnswer(question) : !hasCompleteMultipleChoice(question);
  }

  function isQuestionBlockedForStudy(question) {
    if (!question) return true;
    if (lifecycleEngine?.deriveLifecycleState) return !lifecycleEngine.deriveLifecycleState(question).studyEligible;
    const reviewStatus = String(question.reviewStatus || "").toLowerCase();
    const publicationStatus = String(question.publicationStatus || "").toLowerCase();
    const auditStatus = String(question.auditStatus || "").toLowerCase();
    const contentVerdict = String(question.contentAudit?.verdict || "").toLowerCase();
    return (
      reviewStatus === "rejected" ||
      auditStatus === "blocked" ||
      publicationStatus === "audit_blocked" ||
      publicationStatus.startsWith("rejected") ||
      contentVerdict === "blocked" ||
      contentVerdict === "fail" ||
      isQuestionStructurallyIncompleteForStudy(question)
    );
  }

  function isPublicSafeQuestion(question) {
    if (!question) return false;
    if (lifecycleEngine?.isPublicReadyQuestion && !lifecycleEngine.isPublicReadyQuestion(question)) return false;
    const visibility = String(question.visibility || "").toLowerCase();
    const reviewStatus = String(question.reviewStatus || "").toLowerCase();
    const publicationStatus = String(question.publicationStatus || "").toLowerCase();
    const auditStatus = String(question.auditStatus || "").toLowerCase();
    const sourceType = String(question.sourceType || "").toLowerCase();
    const sourceRisk = String(question.sourceRisk || question.risk || "").toLowerCase();
    const contentVerdict = String(question.contentAudit?.verdict || "").toLowerCase();
    if (visibility !== "public_candidate") return false;
    if (reviewStatus !== "reviewed") return false;
    if (!publicationStatus.startsWith("public_candidate")) return false;
    if (BLOCKED_PUBLIC_SOURCE_TYPES.has(sourceType)) return false;
    if (sourceRisk === "high") return false;
    if (question.neverPublic) return false;
    if (auditStatus === "blocked") return false;
    if (publicationStatus === "audit_blocked" || publicationStatus.startsWith("rejected") || publicationStatus.startsWith("hidden_duplicate")) return false;
    if (contentVerdict === "blocked" || contentVerdict === "fail") return false;
    return !isQuestionStructurallyIncompleteForStudy(question);
  }

  function canViewSourceSignal(signal, account) {
    if (!signal || !canAccessPrivateContent(account)) return false;
    if (signal.visibility === "admin_only") return isContentAdmin(account);
    if (account?.role === "parent") return !signal.createdBy || signal.createdBy === account.id;
    return true;
  }

  function visibleQuestionBank(questions = [], account = null) {
    return questions.filter((question) => isQuestionVisible(question, account));
  }

  function linkedStudentAccountsFor(accounts = [], account = null) {
    if (!account) return [];
    const students = accounts.filter((item) => item.role === "student");
    if (account.role === "admin") return students;
    if (account.role === "parent") {
      return students.filter((student) => Array.isArray(student.parentIds) && student.parentIds.includes(account.id));
    }
    return students.filter((student) => student.id === account.id);
  }

  return {
    canAccessPrivateContent,
    canAuthorQuestions,
    canCreateAnyAccount,
    canManageRewards,
    canViewAdminOnly,
    canViewSourceSignal,
    isAccountManager,
    isContentAdmin,
    isFamilyAccount,
    isQuestionBlockedForStudy,
    isPublicSafeQuestion,
    isQuestionStructurallyIncompleteForStudy,
    isQuestionVisible,
    linkedStudentAccountsFor,
    visibleQuestionBank,
  };
});
