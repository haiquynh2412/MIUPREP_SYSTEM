(function initSatStudioContentPackageEngine(root, factory) {
  let queryEngine = root?.SatQuestionQueryEngine;
  let manifestEngine = root?.SatPublicManifestEngine;
  if (!queryEngine && typeof require === "function") {
    queryEngine = require("./sat_question_query_engine.js");
  }
  if (!manifestEngine && typeof require === "function") {
    manifestEngine = require("./sat_public_manifest_engine.js");
  }
  const engine = factory(queryEngine, manifestEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }
  if (root) {
    root.SatContentPackageEngine = engine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatContentPackageEngine(queryEngine, manifestEngine) {
  const PUBLIC_CONTENT_FIELDS = Object.freeze([
    "id",
    "section",
    "domain",
    "skill",
    "difficulty",
    "questionType",
    "type",
    "targetBand",
    "modulePlacement",
    "estimatedTimeSeconds",
    "practicePool",
    "tags",
    "calculator",
    "calculatorTag",
    "desmos",
    "desmosTag",
    "toolTag",
    "mathTool",
    "lessonKey",
    "vocab",
    "prompt",
    "choices",
    "correctAnswer",
    "acceptableAnswers",
    "answerFormat",
    "explanation",
  ]);
  const PUBLIC_STUDENT_MANIFEST_FIELDS = Object.freeze([
    "section",
    "domain",
    "skill",
    "difficulty",
    "practicePool",
    "questionType",
    "calculator",
    "desmos",
  ]);
  const PUBLIC_STUDENT_CONTRACT_VERSION = "sat_public_student_contract_v1";

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function publicContentItem(question = {}) {
    const item = {};
    PUBLIC_CONTENT_FIELDS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(question, key) && question[key] !== undefined) {
        item[key] = cloneJson(question[key]);
      }
    });
    item.questionType = item.questionType || item.type || "multiple_choice";
    return item;
  }

  function manifestReadyIds(manifest = {}) {
    return new Set((Array.isArray(manifest.manifestRows) ? manifest.manifestRows : []).map((row) => row.id).filter(Boolean));
  }

  function buildPublicContentPackage(questions = [], options = {}) {
    const generatedAt = options.generatedAt || new Date().toISOString();
    const manifest = options.manifest || manifestEngine?.buildPublicManifest?.(questions, { nowIso: generatedAt }) || {};
    const readyIds = manifestReadyIds(manifest);
    const rows = (Array.isArray(questions) ? questions : [])
      .filter((question) => readyIds.has(question?.id))
      .map(publicContentItem);
    return {
      schemaVersion: "sat_content_package_v1",
      contractVersion: PUBLIC_STUDENT_CONTRACT_VERSION,
      contentVersion: manifest.contentVersion || options.contentVersion || manifest.stableContentChecksum || "",
      generatedAt,
      manifest: publicStudentManifest(rows, {
        generatedAt,
        contentVersion: manifest.contentVersion || options.contentVersion || manifest.stableContentChecksum || "",
        revision: options.revision || 0,
      }),
      items: sortPublicRows(rows),
    };
  }

  function sortPublicRows(rows = []) {
    return [...rows].sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));
  }

  function countBy(rows = [], key) {
    return rows.reduce((counts, row) => {
      const value = row?.[key];
      const normalized = value || "Unknown";
      counts[normalized] = (counts[normalized] || 0) + 1;
      return counts;
    }, {});
  }

  function publicStudentManifest(rows = [], options = {}) {
    return {
      contractVersion: PUBLIC_STUDENT_CONTRACT_VERSION,
      generatedAt: options.generatedAt || new Date().toISOString(),
      revision: Number(options.revision || 0),
      scope: "public",
      contentVersion: options.contentVersion || "",
      total: rows.length,
      counts: Object.fromEntries(PUBLIC_STUDENT_MANIFEST_FIELDS.map((field) => [field, countBy(rows, field)])),
      fields: [...PUBLIC_STUDENT_MANIFEST_FIELDS],
      defaults: {
        limit: 50,
        maxLimit: 200,
        sort: "stable_id",
      },
    };
  }

  function packageFromResponse(response = {}) {
    return response.package && typeof response.package === "object" ? response.package : response;
  }

  function packageItems(response = {}) {
    const contentPackage = packageFromResponse(response);
    return Array.isArray(contentPackage.items) ? contentPackage.items : [];
  }

  function importablePackageItems(response = {}) {
    return packageItems(response)
      .filter((item) => item && typeof item === "object" && item.id && item.prompt)
      .map((item) => ({
        ...cloneJson(item),
        reviewStatus: "reviewed",
        visibility: "public_candidate",
        publicationStatus: String(item.publicationStatus || "").startsWith("public_candidate") ? item.publicationStatus : "public_candidate_backend_package",
        sourceName: item.sourceName || "Public Backend Content Package",
        sourceType: item.sourceType || "public_content_package",
      }));
  }

  function canUseBackendPackage(context = {}) {
    return Boolean(context.account?.role === "student" && context.account.scope === "public" && context.token && context.backendAccount && context.api?.getContentPackage);
  }

  function contentVersionFromResponse(response = {}) {
    const contentPackage = packageFromResponse(response);
    return response.contentVersion || contentPackage.contentVersion || "";
  }

  function prepareImportedQuestions(items = [], options = {}) {
    const normalize = options.normalizeQuestionRecord;
    if (typeof normalize !== "function") return [];
    return (Array.isArray(items) ? items : [])
      .map((record, index) => normalize(record, index, { defaultSourceName: options.defaultSourceName || "Public Backend Content Package" }))
      .filter(Boolean)
      .map((question) => {
        const out = { ...question };
        out.backendContentPackage = true;
        out.backendContentVersion = options.contentVersion || "";
        out.reviewStatus = "reviewed";
        out.visibility = "public_candidate";
        if (!String(out.publicationStatus || "").startsWith("public_candidate")) out.publicationStatus = "public_candidate_backend_package";
        return out;
      });
  }

  function backendStatusPatch(response = {}, source = "backend_read") {
    const contentPackage = packageFromResponse(response);
    return {
      lastContentPackageAt: response.updatedAt || contentPackage.generatedAt || new Date().toISOString(),
      lastContentPackageVersion: contentVersionFromResponse(response),
      lastContentPackageCount: packageItems(response).length,
      lastContentPackageScope: response.scope || "public",
      lastContentPackageSource: source,
    };
  }

  return {
    PUBLIC_CONTENT_FIELDS,
    PUBLIC_STUDENT_CONTRACT_VERSION,
    PUBLIC_STUDENT_MANIFEST_FIELDS,
    buildPublicContentPackage,
    backendStatusPatch,
    canUseBackendPackage,
    contentVersionFromResponse,
    importablePackageItems,
    packageFromResponse,
    packageItems,
    prepareImportedQuestions,
    publicContentItem,
  };
});
