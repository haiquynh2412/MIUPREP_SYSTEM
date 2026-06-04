(function initSatStudioDataLoaders(root, factory) {
  const dataLoaders = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = dataLoaders;
  }
  if (root) {
    root.SatStudioDataLoaders = dataLoaders;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioDataLoaders() {
  function questionMatchesSelector(question, selector = {}) {
    if (!question) return false;
    if (typeof selector.predicate === "function") return selector.predicate(question);
    if (selector.sourceType && question.sourceType !== selector.sourceType) return false;
    if (selector.idPrefix && !String(question.id || "").startsWith(selector.idPrefix)) return false;
    if (Array.isArray(selector.idPrefixes) && selector.idPrefixes.length && !selector.idPrefixes.some((prefix) => String(question.id || "").startsWith(prefix))) return false;
    if (selector.sourceSignalId && question.sourceSignalId !== selector.sourceSignalId) return false;
    if (selector.sourceSignalPrefix && !String(question.sourceSignalId || "").startsWith(selector.sourceSignalPrefix)) return false;
    return Boolean(selector.sourceType || selector.idPrefix || selector.idPrefixes?.length || selector.sourceSignalId || selector.sourceSignalPrefix || selector.predicate);
  }

  function selectQuestions(questions = [], selector = {}) {
    return questions.filter((question) => questionMatchesSelector(question, selector));
  }

  function removeBankQuestions(questions = [], selector = {}, options = {}) {
    return questions.filter((question) => {
      if (options.keepPublicPromoted && options.isPublicPromoted?.(question)) return true;
      return !questionMatchesSelector(question, selector);
    });
  }

  function auditedCount(questions = [], auditVersion, verdict = "pass") {
    return questions.filter((question) => question.contentAudit?.version === auditVersion && (!verdict || question.contentAudit?.verdict === verdict)).length;
  }

  function activeQuestions(questions = []) {
    return questions.filter((question) => question.reviewStatus !== "rejected");
  }

  function skeletonAnnotatedCount(questions = []) {
    return questions.filter((question) => question.skeletonDiversity?.skeletonId).length;
  }

  function shouldReloadOpenSatBank(questions = [], options = {}) {
    const local = selectQuestions(questions, { sourceType: "opensat" });
    const audited = auditedCount(local, options.auditVersion, null);
    const reviewed = local.filter((question) => question.reviewStatus === "reviewed").length;
    return (
      local.length < Number(options.minCount || 0) ||
      audited < Number(options.minCount || 0) ||
      (Number(options.minReviewedCount || 0) > 0 && reviewed < Number(options.minReviewedCount || 0))
    );
  }

  function shouldReloadSimpleBank(questions = [], options = {}) {
    return selectQuestions(questions, options.selector).length < Number(options.minCount || 0);
  }

  function shouldReloadAuditedGeneratedBank(questions = [], options = {}) {
    const local = selectQuestions(questions, options.selector);
    const active = activeQuestions(local);
    const audited = auditedCount(local, options.auditVersion, "pass");
    const skeletons = skeletonAnnotatedCount(active);
    const settled = local.filter((question) => ["reviewed", "rejected"].includes(question.reviewStatus)).length;
    return (
      local.length < Number(options.minCount || 0) ||
      audited < Number(options.minCount || 0) ||
      (Number(options.minSettledReviewCount || 0) > 0 && settled < Number(options.minSettledReviewCount || 0)) ||
      (options.requireSkeleton !== false && skeletons < active.length)
    );
  }

  function reviewedUnifiedQuestions(questions = [], selector = {}) {
    return selectQuestions(questions, selector).filter((question) => {
      const reviewStatus = String(question.reviewStatus || "").toLowerCase();
      const publicationStatus = String(question.publicationStatus || "").toLowerCase();
      const practicePool = String(question.practicePool || "").toLowerCase();
      const verdict = String(question.contentAudit?.verdict || "").toLowerCase();
      if (["rejected", "blocked", "audit_blocked"].includes(reviewStatus)) return false;
      if (publicationStatus.startsWith("rejected") || publicationStatus === "blocked") return false;
      if (["hidden_duplicate", "audit_blocked"].includes(practicePool)) return false;
      if (verdict === "fail") return false;
      if (reviewStatus) return reviewStatus === "reviewed" || reviewStatus === "approved";
      return verdict === "pass";
    });
  }

  function shouldReloadReviewedSourceBank(questions = [], options = {}) {
    const minReviewedCount = Number(options.minReviewedCount || 1);
    return reviewedUnifiedQuestions(questions, options.selector).length < minReviewedCount;
  }

  async function fetchJson(fetchImpl, url, missingMessage) {
    const response = await fetchImpl(url);
    if (!response.ok) throw new Error(`${missingMessage}: HTTP ${response.status}`);
    return response.json();
  }

  function extractQuestionRecords(data) {
    return Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
  }

  return {
    activeQuestions,
    auditedCount,
    extractQuestionRecords,
    fetchJson,
    questionMatchesSelector,
    removeBankQuestions,
    reviewedUnifiedQuestions,
    selectQuestions,
    shouldReloadAuditedGeneratedBank,
    shouldReloadOpenSatBank,
    shouldReloadReviewedSourceBank,
    shouldReloadSimpleBank,
    skeletonAnnotatedCount,
  };
});
