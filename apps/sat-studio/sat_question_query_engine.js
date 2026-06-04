(function initSatStudioQuestionQueryEngine(root, factory) {
  const questionQueryEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = questionQueryEngine;
  }
  if (root) {
    root.SatQuestionQueryEngine = questionQueryEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioQuestionQueryEngine() {
  const QUESTION_BANK_CONTRACT_VERSION = "question_bank_contract_v1";
  const CRITERIA_FIELDS = ["section", "domain", "skill", "difficulty", "sourceType", "reviewStatus", "practicePool", "calculator", "desmos"];
  const QUERY_SCOPES = new Set(["study", "admin", "public", "remediation"]);
  const DEFAULT_QUERY_LIMIT = 50;
  const MAX_QUERY_LIMIT = 200;

  function isAll(value) {
    return value === undefined || value === null || value === "" || value === "All";
  }

  function fieldValue(question = {}, field) {
    if (field === "practicePool") return question.practicePool || question.skeletonDiversity?.practicePool || "core_pool";
    if (field === "calculator") return calculatorTagFor(question);
    if (field === "desmos") return desmosTagFor(question);
    return question[field] ?? "";
  }

  function practicePoolFor(question = {}) {
    return fieldValue(question, "practicePool") || "core_pool";
  }

  function isReviewedStudyQuestion(question = {}) {
    return question.reviewStatus === "reviewed" && question?.metadata?.reviewStatus !== "needs_review";
  }

  function isContentAuditPass(question = {}) {
    return question?.contentAudit?.verdict !== "fail" && question?.qualityGate?.status !== "blocked" && question?.qualityGate?.verdict !== "fail";
  }

  function normalizeTagText(value = "") {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  }

  function tagList(question = {}) {
    return [
      ...(Array.isArray(question.tags) ? question.tags : []),
      question.calculator,
      question.calculatorTag,
      question.desmos,
      question.desmosTag,
      question.toolTag,
      question.mathTool,
      question.metadata?.calculator,
      question.metadata?.desmos,
    ]
      .map(normalizeTagText)
      .filter(Boolean);
  }

  function calculatorTagFor(question = {}) {
    const tags = tagList(question);
    if (tags.some((tag) => ["calculator_required", "calc_required", "calculator"].includes(tag))) return "calculator_required";
    if (tags.some((tag) => ["calculator_allowed", "calc_allowed"].includes(tag))) return "calculator_allowed";
    if (tags.some((tag) => ["no_calculator", "non_calculator", "mental_math"].includes(tag))) return "no_calculator";
    return "";
  }

  function desmosTagFor(question = {}) {
    const tags = tagList(question);
    if (tags.some((tag) => ["desmos", "desmos_recommended", "graphing", "graphing_calculator"].includes(tag))) return "desmos_recommended";
    if (tags.some((tag) => ["desmos_optional", "calculator_optional"].includes(tag))) return "desmos_optional";
    return "";
  }

  function matchesCriteria(question = {}, criteria = {}) {
    return CRITERIA_FIELDS.every((field) => {
      const expected = criteria[field];
      return isAll(expected) || fieldValue(question, field) === expected;
    });
  }

  function filterQuestions(questions = [], criteria = {}, helpers = {}) {
    const predicate = typeof helpers.predicate === "function" ? helpers.predicate : () => true;
    const idSet = criteria.idSet instanceof Set ? criteria.idSet : null;
    return questions.filter((question) => {
      if (!question) return false;
      if (idSet && !idSet.has(question.id)) return false;
      return matchesCriteria(question, criteria) && predicate(question);
    });
  }

  function normalizeQuestionQuery(criteria = {}, options = {}) {
    const normalizedCriteria = {};
    CRITERIA_FIELDS.forEach((field) => {
      const value = criteria[field];
      if (!isAll(value)) normalizedCriteria[field] = String(value);
    });
    if (criteria.idSet instanceof Set) normalizedCriteria.idSet = criteria.idSet;
    const rawLimit = Number(options.limit ?? criteria.limit ?? DEFAULT_QUERY_LIMIT);
    const rawOffset = Number(options.offset ?? criteria.offset ?? 0);
    const limit = Math.max(1, Math.min(MAX_QUERY_LIMIT, Number.isFinite(rawLimit) ? Math.floor(rawLimit) : DEFAULT_QUERY_LIMIT));
    const offset = Math.max(0, Number.isFinite(rawOffset) ? Math.floor(rawOffset) : 0);
    const scope = QUERY_SCOPES.has(options.scope || criteria.scope) ? String(options.scope || criteria.scope) : "study";
    const includeContent = Boolean(options.includeContent || criteria.includeContent);
    return {
      contractVersion: QUESTION_BANK_CONTRACT_VERSION,
      scope,
      criteria: normalizedCriteria,
      limit,
      offset,
      includeContent,
      sort: String(options.sort || criteria.sort || "stable_id"),
    };
  }

  function scopePredicateFor(scope = "study", helpers = {}) {
    if (scope === "admin") return () => true;
    if (scope === "public") {
      return (question = {}) =>
        question.visibility === "public_candidate" &&
        question.reviewStatus === "reviewed" &&
        isContentAuditPass(question) &&
        String(question.publicationStatus || "").startsWith("public_candidate");
    }
    if (scope === "remediation") return (question = {}) => practicePoolFor(question) === "remedial_pool" && isReviewedStudyQuestion(question) && isContentAuditPass(question);
    const isStudyAvailableQuestion = typeof helpers.isStudyAvailableQuestion === "function"
      ? helpers.isStudyAvailableQuestion
      : (question = {}) => practicePoolFor(question) !== "hidden_duplicate";
    return (question = {}) => isReviewedStudyQuestion(question) && isContentAuditPass(question) && isStudyAvailableQuestion(question);
  }

  function questionMetadata(question = {}) {
    return {
      id: question.id || "",
      section: question.section || "",
      domain: question.domain || "",
      skill: question.skill || "",
      difficulty: question.difficulty || "",
      questionType: question.questionType || question.type || "",
      sourceType: question.sourceType || "",
      reviewStatus: question.reviewStatus || "",
      publicationStatus: question.publicationStatus || "",
      visibility: question.visibility || "",
      practicePool: practicePoolFor(question),
      calculator: calculatorTagFor(question),
      desmos: desmosTagFor(question),
      contentVersion: questionContentVersion(question),
    };
  }

  function questionContentVersion(question = {}) {
    return String(
      question.contentVersion ||
        question.contentAudit?.reviewedAt ||
        question.auditVersion ||
        question.importAuditVersion ||
        question.updatedAt ||
        question.createdAt ||
        question.id ||
        "",
    );
  }

  function stableChecksum(value = "") {
    const text = String(value || "");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function sortQuestions(questions = [], sort = "stable_id") {
    const rows = [...questions];
    if (sort === "difficulty") {
      const rank = { Easy: 0, Medium: 1, Hard: 2 };
      return rows.sort((a, b) => (rank[a.difficulty] ?? 9) - (rank[b.difficulty] ?? 9) || String(a.id || "").localeCompare(String(b.id || "")));
    }
    return rows.sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));
  }

  function queryQuestionBank(questions = [], criteria = {}, helpers = {}) {
    const query = normalizeQuestionQuery(criteria, helpers);
    const callerPredicate = typeof helpers.predicate === "function" ? helpers.predicate : () => true;
    const scopePredicate = scopePredicateFor(query.scope, helpers);
    const matched = filterQuestions(questions, query.criteria, {
      predicate: (question) => callerPredicate(question) && scopePredicate(question),
    });
    const sorted = sortQuestions(matched, query.sort);
    const paged = sorted.slice(query.offset, query.offset + query.limit);
    return {
      contractVersion: QUESTION_BANK_CONTRACT_VERSION,
      query,
      total: sorted.length,
      offset: query.offset,
      limit: query.limit,
      items: query.includeContent ? paged : paged.map(questionMetadata),
    };
  }

  function reviewedStudyQuestions(questions = [], helpers = {}) {
    const callerPredicate = typeof helpers.predicate === "function" ? helpers.predicate : () => true;
    const scopePredicate = scopePredicateFor("study", {});
    return sortQuestions(
      questions.filter((question) => scopePredicate(question) && callerPredicate(question)),
      helpers.sort || "stable_id",
    );
  }

  function queryReviewedStudyContent(questions = [], criteria = {}, helpers = {}) {
    return queryQuestionBank(
      questions,
      { ...criteria, reviewStatus: "reviewed", scope: "study" },
      {
        ...helpers,
        predicate: (question) => {
          const callerPredicate = typeof helpers.predicate === "function" ? helpers.predicate : () => true;
          return callerPredicate(question);
        },
      },
    );
  }

  function visibleQuestionBank(questions = [], account = null, helpers = {}) {
    const isQuestionVisible = typeof helpers.isQuestionVisible === "function" ? helpers.isQuestionVisible : () => true;
    return questions.filter((question) => isQuestionVisible(question, account));
  }

  function countBy(questions = [], field) {
    return questions.reduce((acc, question) => {
      const value = fieldValue(question, field) || "Unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function uniqueValues(questions = [], field) {
    return [...new Set(questions.map((question) => fieldValue(question, field)).filter(Boolean))].sort();
  }

  function buildTopicCards(questions = [], criteria = {}, helpers = {}) {
    const predicate = typeof helpers.predicate === "function" ? helpers.predicate : () => true;
    const map = new Map();
    filterQuestions(questions, criteria, { predicate }).forEach((question) => {
      const key = `${question.section}|${question.domain}|${question.skill}`;
      const item = map.get(key) || {
        section: question.section,
        domain: question.domain,
        skill: question.skill,
        count: 0,
        reviewed: 0,
        needsReview: 0,
      };
      item.count += 1;
      if (question.reviewStatus === "reviewed") item.reviewed += 1;
      if (question.reviewStatus === "needs_review") item.needsReview += 1;
      map.set(key, item);
    });
    return [...map.values()].sort((a, b) => b.count - a.count || a.section.localeCompare(b.section));
  }

  function sourceLedgerStats(questions = [], sourceTypes = []) {
    const rows = sourceTypes.map((sourceType) => {
      const sourceQuestions = questions.filter((question) => question.sourceType === sourceType);
      return {
        sourceType,
        count: sourceQuestions.filter((question) => question.reviewStatus !== "rejected").length,
        rejectedTemplate: sourceQuestions.filter((question) => String(question.publicationStatus || "").startsWith("rejected_template_")).length,
        hiddenSkeleton: sourceQuestions.filter((question) => fieldValue(question, "practicePool") === "hidden_duplicate").length,
      };
    });
    return Object.fromEntries(rows.map((row) => [row.sourceType, row]));
  }

  function buildQuestionBankManifest(questions = [], options = {}) {
    const versionRows = questions
      .map((question) => `${question.id || ""}:${questionContentVersion(question)}:${question.reviewStatus || ""}:${practicePoolFor(question)}`)
      .sort();
    return {
      contractVersion: QUESTION_BANK_CONTRACT_VERSION,
      generatedAt: options.generatedAt || "",
      revision: Number(options.revision || 0),
      scope: QUERY_SCOPES.has(options.scope) ? options.scope : "study",
      contentVersion: options.contentVersion || stableChecksum(versionRows.join("|")),
      total: questions.length,
      counts: {
        section: countBy(questions, "section"),
        difficulty: countBy(questions, "difficulty"),
        sourceType: countBy(questions, "sourceType"),
        reviewStatus: countBy(questions, "reviewStatus"),
        practicePool: countBy(questions, "practicePool"),
        calculator: countBy(questions, "calculator"),
        desmos: countBy(questions, "desmos"),
      },
      fields: [...CRITERIA_FIELDS],
      defaults: {
        limit: DEFAULT_QUERY_LIMIT,
        maxLimit: MAX_QUERY_LIMIT,
        sort: "stable_id",
      },
    };
  }

  function buildVersionedContentPackage(questions = [], options = {}) {
    const includeContent = options.includeContent !== false;
    const items = includeContent ? sortQuestions(questions, options.sort || "stable_id") : sortQuestions(questions, options.sort || "stable_id").map(questionMetadata);
    const manifest = buildQuestionBankManifest(questions, options);
    return {
      schemaVersion: "sat_content_package_v1",
      contractVersion: QUESTION_BANK_CONTRACT_VERSION,
      contentVersion: manifest.contentVersion,
      generatedAt: manifest.generatedAt,
      manifest,
      items,
    };
  }

  function createReviewedContentRepository(questions = [], helpers = {}) {
    const reviewed = reviewedStudyQuestions(questions, helpers);
    const manifest = buildQuestionBankManifest(reviewed, {
      revision: helpers.revision || 0,
      scope: "study",
      generatedAt: helpers.generatedAt || "",
      contentVersion: helpers.contentVersion || "",
    });
    return {
      version: "reviewed-content-repository-v1",
      manifest,
      questions: reviewed,
      query(criteria = {}, options = {}) {
        return queryReviewedStudyContent(reviewed, criteria, { ...helpers, ...options });
      },
      topicCards(criteria = {}, options = {}) {
        return buildTopicCards(reviewed, criteria, { predicate: options.predicate || helpers.predicate || (() => true) });
      },
      package(options = {}) {
        return buildVersionedContentPackage(reviewed, { ...options, revision: manifest.revision, scope: "study", contentVersion: manifest.contentVersion });
      },
    };
  }

  return {
    QUESTION_BANK_CONTRACT_VERSION,
    buildVersionedContentPackage,
    buildTopicCards,
    buildQuestionBankManifest,
    countBy,
    createReviewedContentRepository,
    filterQuestions,
    matchesCriteria,
    normalizeQuestionQuery,
    queryReviewedStudyContent,
    queryQuestionBank,
    questionMetadata,
    questionContentVersion,
    reviewedStudyQuestions,
    sourceLedgerStats,
    stableChecksum,
    uniqueValues,
    visibleQuestionBank,
  };
});
