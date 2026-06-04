(function initSatStudioQuestionAuditEngine(root, factory) {
  const questionAuditEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = questionAuditEngine;
  }
  if (root) {
    root.SatQuestionAuditEngine = questionAuditEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioQuestionAuditEngine() {
  const ESCALATING_ISSUES = new Set(["wrong_answer", "source_policy"]);

  function questionAuditEntries(questionAudits = {}, question = null) {
    if (!question?.id) return [];
    const rows = questionAudits?.[question.id];
    return Array.isArray(rows) ? rows : [];
  }

  function hasOpenQuestionAudits(questionAudits = {}, question = null) {
    return questionAuditEntries(questionAudits, question).some((entry) => entry.status !== "resolved" && entry.status !== "dismissed");
  }

  function canResolveQuestionAudit(account = null) {
    return account?.role === "admin";
  }

  function shouldEscalateAudit(entry = {}, account = null) {
    return ["admin", "parent"].includes(account?.role) && (entry.severity === "high" || ESCALATING_ISSUES.has(entry.issueType));
  }

  function createAuditEntry(question, account = null, input = {}, options = {}) {
    const nowIso = options.nowIso || new Date().toISOString();
    return {
      id: options.id || `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      questionId: question?.id || "",
      issueType: input.issueType || "other",
      severity: input.severity || "medium",
      note: String(input.note || "").trim(),
      status: "open",
      reportedBy: account?.id || "unknown",
      reportedByName: account?.name || "Unknown",
      reportedByRole: account?.role || "unknown",
      reportedAt: nowIso,
    };
  }

  function ensureAuditBucket(questionAudits, questionId) {
    if (!questionAudits || typeof questionAudits !== "object") return null;
    if (!Array.isArray(questionAudits[questionId])) questionAudits[questionId] = [];
    return questionAudits[questionId];
  }

  function applyAuditReport(question, questionAudits, entry, account = null) {
    if (!question?.id || !entry) return { entry: null, escalated: false };
    const bucket = ensureAuditBucket(questionAudits, question.id);
    if (bucket) bucket.unshift(entry);
    question.auditStatus = "open";
    question.auditUpdatedAt = entry.reportedAt;

    const escalated = shouldEscalateAudit(entry, account);
    if (escalated) {
      question.reviewStatus = "needs_review";
      if (question.visibility === "public_candidate") question.visibility = "private_family";
      question.publicationStatus = "audit_issue_open";
    }

    return { entry, escalated };
  }

  function resolveAuditEntries(entries = [], account = null, options = {}) {
    const nowIso = options.nowIso || new Date().toISOString();
    entries.forEach((entry) => {
      if (entry.status !== "resolved" && entry.status !== "dismissed") {
        entry.status = "resolved";
        entry.resolvedBy = account?.id || "content-admin";
        entry.resolvedAt = nowIso;
        entry.resolution = options.resolution || "Audit checked: answer, explanation, source policy, and duplicate risk passed.";
      }
    });
    return entries;
  }

  function applyAuditPass(question, entries = [], account = null, options = {}) {
    if (!question?.id) return null;
    const nowIso = options.nowIso || new Date().toISOString();
    resolveAuditEntries(entries, account, { nowIso, resolution: options.resolution });
    question.auditStatus = "passed";
    question.auditUpdatedAt = nowIso;
    if (question.reviewStatus === "needs_review") question.reviewStatus = "reviewed";
    if (question.publicationStatus === "audit_issue_open" || question.publicationStatus === "audit_blocked") {
      question.publicationStatus = question.visibility === "public_candidate" ? "public_candidate_reviewed" : "private_audit_passed";
    }
    return question;
  }

  function createAdminBlockEntry(question, account = null, options = {}) {
    const nowIso = options.nowIso || new Date().toISOString();
    return {
      id: options.id || `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      questionId: question?.id || "",
      issueType: "admin_block",
      severity: "high",
      note: options.note || "Content Admin blocked this question from public use pending correction.",
      status: "open",
      reportedBy: account?.id || "content-admin",
      reportedByName: account?.name || "Content Admin",
      reportedByRole: account?.role || "admin",
      reportedAt: nowIso,
    };
  }

  function applyQuestionAuditBlock(question, questionAudits, entry) {
    if (!question?.id || !entry) return null;
    const bucket = ensureAuditBucket(questionAudits, question.id);
    if (bucket) bucket.unshift(entry);
    question.reviewStatus = "needs_review";
    question.visibility = "private_family";
    question.publicationStatus = "audit_blocked";
    question.auditStatus = "blocked";
    question.auditUpdatedAt = entry.reportedAt;
    return question;
  }

  return {
    applyAuditPass,
    applyAuditReport,
    applyQuestionAuditBlock,
    canResolveQuestionAudit,
    createAdminBlockEntry,
    createAuditEntry,
    hasOpenQuestionAudits,
    questionAuditEntries,
    resolveAuditEntries,
    shouldEscalateAudit,
  };
});
