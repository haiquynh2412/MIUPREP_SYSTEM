(function initSatStudioImportEngine(root, factory) {
  const importEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = importEngine;
  }
  if (root) {
    root.SatStudioImportEngine = importEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioImportEngine() {
  function fileNameFromPath(path = "") {
    return String(path).split(/[\\/]/).filter(Boolean).pop() || "Archive source";
  }

  function vaultQuestionsForSourceReference(sourceReference, questions = []) {
    if (!sourceReference) return [];
    return questions.filter((question) => question.sourceType === "private_vault" && question.sourceReference === sourceReference);
  }

  function buildBankImportOptions({ fileName = "Imported Question Bank", forcePrivateVault = false, activeVaultSourceName = "", activeVaultSourceReference = "" } = {}) {
    return {
      defaultSourceName: forcePrivateVault && activeVaultSourceName ? activeVaultSourceName : fileName,
      defaultSourceReference: forcePrivateVault ? activeVaultSourceReference : "",
      forcePrivateVault: Boolean(forcePrivateVault),
    };
  }

  function buildBankImportResult({ imported = 0, fileName = "question bank", forcePrivateVault = false, activeVaultSourceReference = "" } = {}) {
    return {
      imported: Number(imported || 0),
      fileName,
      forcePrivateVault: Boolean(forcePrivateVault),
      activeVaultSourceReference,
      className: "import-result",
    };
  }

  function buildVaultIntakeState(doc = {}) {
    const sourceReference = doc.path || doc.sourceReference || "";
    return {
      sourceReference,
      sourceName: fileNameFromPath(sourceReference) || "Private Vault Source",
      className: "import-result",
    };
  }

  function buildVaultSummary(vaultQuestions = [], context = {}) {
    if (!context.canAccessPrivateContent) {
      return {
        className: "vault-summary empty-state",
        startDisabled: true,
        hidden: true,
        activeVaultSourceReference: context.activeVaultSourceReference || "",
      };
    }
    const questions = Array.isArray(vaultQuestions) ? vaultQuestions : [];
    const reviewed = questions.filter((question) => question.reviewStatus === "reviewed").length;
    const needsReview = questions.filter((question) => question.reviewStatus === "needs_review").length;
    const sources = new Set(questions.map((question) => question.sourceReference || question.sourceName).filter(Boolean)).size;
    return {
      className: questions.length ? "vault-summary" : "vault-summary empty-state",
      startDisabled: questions.length === 0,
      hidden: false,
      total: questions.length,
      reviewed,
      needsReview,
      sources,
      activeVaultSourceReference: context.activeVaultSourceReference || "",
    };
  }

  function buildPdfInspectPending(file = {}) {
    return {
      fileName: file.name || "uploaded.pdf",
      sizeMb: file.size ? (Number(file.size || 0) / 1024 / 1024).toFixed(2) : "--",
      className: "pdf-workflow",
    };
  }

  function buildPdfInspectError(file = {}, error = {}) {
    return {
      ...buildPdfInspectPending(file),
      className: "pdf-workflow warning",
      message: error?.message || String(error || "Unknown PDF inspection error."),
    };
  }

  function buildPdfInspectionModel(data = {}) {
    const metadataOnly = data.recommendation === "metadata_only";
    return {
      className: `pdf-workflow ${metadataOnly ? "warning" : "ready"}`,
      metadataOnly,
      title: data.title || data.filename || "PDF inspected",
      filename: data.filename || "uploaded.pdf",
      sizeMb: data.sizeBytes ? (Number(data.sizeBytes) / 1024 / 1024).toFixed(2) : "--",
      pageCount: data.pageCount || "--",
      extractablePagesSampled: Number(data.extractablePagesSampled || 0),
      risk: data.risk || "Unknown",
      recommendation: metadataOnly
        ? "Metadata-only log recommended. Do not import question text."
        : "Extraction can be attempted, then reviewed by AI/admin before JSON import.",
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
    };
  }

  function buildOfficialPdfLog(inspection = {}, context = {}) {
    if (!inspection) return null;
    const title = inspection.title || inspection.filename || "Official PDF";
    return {
      id: `official-pdf-${context.nowMs || Date.now()}`,
      source: "Official PDF",
      section: "Mixed",
      skill: "Full practice test",
      reference: `${title} (${inspection.pageCount || "--"} pages)`,
      result: "uncertain",
      note: `Metadata only. File: ${inspection.filename || "uploaded.pdf"}. Risk: ${inspection.risk || "Unknown"}. No prompt, passage, answer choice, or explanation text was imported.`,
      at: context.nowIso || new Date().toISOString(),
    };
  }

  return {
    buildBankImportOptions,
    buildBankImportResult,
    buildOfficialPdfLog,
    buildPdfInspectError,
    buildPdfInspectPending,
    buildPdfInspectionModel,
    buildVaultIntakeState,
    buildVaultSummary,
    fileNameFromPath,
    vaultQuestionsForSourceReference,
  };
});
