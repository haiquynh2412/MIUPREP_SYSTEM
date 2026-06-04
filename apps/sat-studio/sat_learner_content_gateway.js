(function initSatLearnerContentGateway(root, factory) {
  let contentPackageEngine = root?.SatContentPackageEngine;
  if (!contentPackageEngine && typeof require === "function") {
    contentPackageEngine = require("./sat_content_package_engine.js");
  }
  const gateway = factory(contentPackageEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = gateway;
  }
  if (root) {
    root.SatLearnerContentGateway = gateway;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatLearnerContentGateway(contentPackageEngine) {
  function canUseBackendContentPackage(context = {}) {
    return Boolean(contentPackageEngine?.canUseBackendPackage?.({
      account: context.account,
      token: context.token,
      backendAccount: context.backendAccount,
      api: context.api,
    }));
  }

  function replaceBackendContentPackageQuestions(items = [], context = {}) {
    if (!context.state || !Array.isArray(context.state.questions)) return 0;
    const records = Array.isArray(items) ? items.filter((item) => item?.id && item.prompt) : [];
    if (!records.length) return 0;
    const incomingIds = new Set(records.map((item) => item.id));
    const imported = contentPackageEngine.prepareImportedQuestions(records, {
      contentVersion: context.contentVersion || "",
      normalizeQuestionRecord: context.normalizeQuestionRecord,
    });
    context.state.questions = [
      ...context.state.questions.filter((question) => !question.backendContentPackage && !incomingIds.has(question.id)),
      ...imported,
    ];
    if (imported.length) {
      context.touchQuestionBank?.();
      context.saveState?.();
      context.hydrateFilters?.();
    }
    return imported.length;
  }

  async function loadBackendContentPackage(context = {}) {
    if (!canUseBackendContentPackage(context)) return null;
    const loaded = await context.api.getContentPackage(context.token, {
      baseUrl: context.baseUrl,
      scope: context.scope || "public",
    });
    const items = contentPackageEngine.importablePackageItems(loaded);
    const contentVersion = contentPackageEngine.contentVersionFromResponse(loaded);
    if (!items.length) {
      return { loadedFromBackend: false, studyQuestionCount: 0, contentVersion };
    }
    const imported = replaceBackendContentPackageQuestions(items, { ...context, contentVersion });
    Object.assign(context.backendState || {}, contentPackageEngine.backendStatusPatch(loaded, "backend_read"));
    context.saveState?.();
    if (!context.silent) {
      context.notify?.(`Loaded ${imported} public content-package questions from backend.`);
    }
    const repo = context.reviewedStudyContentRepository?.();
    return {
      loadedFromBackend: true,
      loadedSources: 1,
      failedSources: 0,
      studyQuestionCount: repo?.manifest?.total || imported,
      contentVersion,
    };
  }

  async function loadReviewedStudyBank(context = {}) {
    await context.ensureQuestionStudyPolicy?.();
    try {
      const backendPackage = await loadBackendContentPackage(context);
      if (backendPackage?.loadedFromBackend) return backendPackage;
    } catch (error) {
      context.onBackendFallback?.(fallbackStatus(error, context.baseUrl || ""));
    }
    const loaders = Array.isArray(context.loaders) ? context.loaders : [];
    const results = await Promise.allSettled(loaders.map((loader) => loader()));
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length && !context.silent) {
      context.notify?.(`Some reviewed study banks could not load (${failures.length}). The app will continue with available reviewed questions.`);
    }
    const repo = context.reviewedStudyContentRepository?.();
    const visibleFallback = context.visibleQuestionBank?.() || [];
    return {
      loadedSources: results.length - failures.length,
      failedSources: failures.length,
      studyQuestionCount: repo?.manifest?.total || visibleFallback.filter((question) => context.isStudyAvailableQuestion?.(question) !== false).length,
      contentVersion: repo?.manifest?.contentVersion || "",
    };
  }

  function fallbackStatus(error = {}, baseUrl = "") {
    return {
      level: "warning",
      title: "Content package fallback",
      message: error.message || "Backend content package could not load; using local reviewed bank.",
      extra: { baseUrl },
    };
  }

  return {
    canUseBackendContentPackage,
    fallbackStatus,
    loadBackendContentPackage,
    loadReviewedStudyBank,
    replaceBackendContentPackageQuestions,
  };
});
