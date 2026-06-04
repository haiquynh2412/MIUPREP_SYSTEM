(function initSatStudioContentLifecycleEngine(root, factory) {
  const lifecycleEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = lifecycleEngine;
  }
  if (root) {
    root.SatStudioContentLifecycleEngine = lifecycleEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioContentLifecycleEngine() {
  const LIFECYCLE_VERSION = "content_lifecycle_v1_2026_05_24";
  const BLOCKED_PUBLIC_SOURCE_TYPES = new Set(["private_vault", "college_board", "cracksat_reference", "official_log"]);
  const PUBLIC_READY_STATUSES = new Set(["public_candidate_reviewed", "public_candidate_ready", "public_ready", "manifest_ready"]);

  function lower(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isGridInQuestion(question = {}) {
    const type = lower(question.questionType || question.type || question.answerFormat);
    return ["student_produced_response", "student-produced-response", "grid_in", "grid-in", "numeric", "spr"].includes(type);
  }

  function hasExplanation(question = {}) {
    const explanation = question.explanation;
    if (!explanation) return false;
    if (typeof explanation === "string") return Boolean(explanation.trim());
    if (typeof explanation === "object") return Object.values(explanation).some((value) => Boolean(String(value || "").trim()));
    return true;
  }

  function hasCompleteMultipleChoice(question = {}) {
    const choices = question.choices && typeof question.choices === "object" ? question.choices : {};
    return ["A", "B", "C", "D"].every((letter) => String(choices[letter] || "").trim()) && Boolean(choices[question.correctAnswer]);
  }

  function hasCompleteGridInAnswer(question = {}) {
    const correctAnswer = String(question.correctAnswer || "").trim();
    const acceptableAnswers = Array.isArray(question.acceptableAnswers) ? question.acceptableAnswers : [];
    return Boolean(correctAnswer) && acceptableAnswers.some((value) => String(value || "").trim());
  }

  function structuralReasons(question = {}) {
    const reasons = [];
    if (!hasExplanation(question)) reasons.push("missing_explanation");
    if (isGridInQuestion(question)) {
      if (!hasCompleteGridInAnswer(question)) reasons.push("incomplete_grid_in_answer");
      return reasons;
    }
    if (!hasCompleteMultipleChoice(question)) reasons.push("incomplete_multiple_choice");
    return reasons;
  }

  function deriveLifecycleState(question = {}) {
    const reviewStatus = lower(question.reviewStatus);
    const visibility = lower(question.visibility);
    const publicationStatus = lower(question.publicationStatus);
    const auditStatus = lower(question.auditStatus);
    const contentVerdict = lower(question.contentAudit?.verdict);
    const practicePool = lower(question.practicePool);
    const sourceType = lower(question.sourceType);
    const sourceRisk = lower(question.sourceRisk || question.risk);
    const reasons = [];

    if (reviewStatus === "rejected") reasons.push("review_rejected");
    if (auditStatus === "blocked") reasons.push("audit_blocked");
    if (["audit_blocked", "blocked", "intake_blocked"].includes(publicationStatus)) reasons.push(`publication_${publicationStatus}`);
    if (publicationStatus.startsWith("rejected")) reasons.push(`publication_${publicationStatus}`);
    if (contentVerdict === "blocked" || contentVerdict === "fail") reasons.push(`content_audit_${contentVerdict}`);
    if (reasons.length) return result("blocked", reasons, question);

    if (publicationStatus.startsWith("hidden_duplicate") || practicePool === "hidden_duplicate") {
      return result("hidden_duplicate", ["hidden_duplicate"], question);
    }

    const structural = structuralReasons(question);
    if (structural.length) return result("needs_repair", structural, question);

    if (reviewStatus !== "reviewed") return result("needs_review", ["review_not_reviewed"], question);

    if (visibility === "public_candidate") {
      if (!PUBLIC_READY_STATUSES.has(publicationStatus)) {
        return result("public_candidate_pending", ["publication_not_public_candidate_reviewed"], question);
      }
      if (BLOCKED_PUBLIC_SOURCE_TYPES.has(sourceType)) return result("public_candidate_blocked", [`blocked_source_type:${sourceType}`], question);
      if (sourceRisk === "high") return result("public_candidate_blocked", ["source_risk_high"], question);
      if (question.neverPublic) return result("public_candidate_blocked", ["never_public"], question);
      return result("public_candidate_ready", [], question);
    }

    if (visibility === "admin_only") return result("admin_only_reviewed", [], question);
    if (visibility === "private_family" || sourceType === "private_vault" || question.neverPublic) return result("private_reviewed", [], question);
    return result("reviewed_internal", [], question);
  }

  function result(state, reasons, question) {
    const reviewed = ["private_reviewed", "admin_only_reviewed", "public_candidate_ready", "public_candidate_pending", "reviewed_internal"].includes(state);
    const publicReady = state === "public_candidate_ready";
    return {
      version: LIFECYCLE_VERSION,
      state,
      reasons,
      reviewReady: reviewed,
      studyEligible: reviewed,
      publicCandidate: lower(question?.visibility) === "public_candidate",
      publicReady,
      blocked: ["blocked", "hidden_duplicate", "needs_repair", "needs_review", "public_candidate_blocked"].includes(state),
    };
  }

  function applyLifecycleState(question = {}) {
    const lifecycle = deriveLifecycleState(question);
    question.lifecycleState = lifecycle.state;
    question.lifecycleReasons = lifecycle.reasons;
    question.lifecycleVersion = lifecycle.version;
    return question;
  }

  function isStudyEligibleQuestion(question = {}) {
    return deriveLifecycleState(question).studyEligible;
  }

  function isPublicReadyQuestion(question = {}) {
    return deriveLifecycleState(question).publicReady;
  }

  function summarizeLifecycle(questions = []) {
    return (Array.isArray(questions) ? questions : []).reduce((summary, question) => {
      const state = deriveLifecycleState(question).state;
      summary.total += 1;
      summary.counts[state] = (summary.counts[state] || 0) + 1;
      return summary;
    }, { version: LIFECYCLE_VERSION, total: 0, counts: {} });
  }

  return {
    LIFECYCLE_VERSION,
    applyLifecycleState,
    deriveLifecycleState,
    hasCompleteGridInAnswer,
    hasCompleteMultipleChoice,
    hasExplanation,
    isGridInQuestion,
    isPublicReadyQuestion,
    isStudyEligibleQuestion,
    structuralReasons,
    summarizeLifecycle,
  };
});
