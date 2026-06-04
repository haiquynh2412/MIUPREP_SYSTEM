(function initSatStudioQualityIntakeEngine(root, factory) {
  let authoringEngine = root?.SatAuthoringEngine;
  let duplicateEngine = root?.SatDuplicateEngine;
  if (!authoringEngine && typeof require === "function") {
    authoringEngine = require("./sat_authoring_engine.js");
  }
  if (!duplicateEngine && typeof require === "function") {
    duplicateEngine = require("./sat_duplicate_engine.js");
  }
  const qualityIntakeEngine = factory(authoringEngine, duplicateEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = qualityIntakeEngine;
  }
  if (root) {
    root.SatQualityIntakeEngine = qualityIntakeEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioQualityIntakeEngine(authoringEngine, duplicateEngine) {
  const GENERATED_TYPES = new Set(["ai_generated", "antigravity", "sat_king", "sat_1590"]);

  function isGeneratedCandidate(question = {}) {
    return GENERATED_TYPES.has(question?.sourceType) || /^antigravity-|^archive-ai-|^kaplan-ai-|^satking-|^sat1590-/i.test(String(question?.id || ""));
  }

  function topicKey(question = {}) {
    return [
      question.section || "Unknown",
      question.domain || "Unknown",
      question.skill || "Unknown",
      question.difficulty || "Medium",
      question.questionType || "multiple_choice",
    ].join("|");
  }

  function activeTopicCounts(questions = []) {
    return questions.reduce((acc, question) => {
      if (!question || question.reviewStatus === "rejected") return acc;
      if (question.practicePool === "hidden_duplicate" || question.skeletonDiversity?.practicePool === "hidden_duplicate") return acc;
      const key = topicKey(question);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function sourceCounts(rows = []) {
    return rows.reduce((acc, row) => {
      const source = row.sourceType || "unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
  }

  function intakeSeverity(row = {}) {
    if (row.status === "blocked") return 100;
    if (row.status === "needs_review") return 70;
    if (row.status === "remedial") return 45;
    return 10;
  }

  function normalizePromptValue(prompt = "", helpers = {}) {
    const normalizePrompt = typeof helpers.normalizePrompt === "function" ? helpers.normalizePrompt : (value) => String(value || "").trim().toLowerCase();
    return normalizePrompt(prompt || "");
  }

  function buildPrecomputedContext(questions = [], helpers = {}) {
    const promptCounts = {};
    const skeletonGroups = new Map();
    questions.forEach((question) => {
      const normalizedPrompt = normalizePromptValue(question.prompt, helpers);
      if (normalizedPrompt) promptCounts[normalizedPrompt] = (promptCounts[normalizedPrompt] || 0) + 1;
      if (!duplicateEngine?.questionSkeletonKey || question.reviewStatus === "rejected") return;
      const key = duplicateEngine.questionSkeletonKey(question);
      if (!skeletonGroups.has(key)) skeletonGroups.set(key, []);
      skeletonGroups.get(key).push(question);
    });
    const skeletonReportsById = new Map();
    skeletonGroups.forEach((group, key) => {
      group.forEach((question, index) => {
        const difficulty = question?.difficulty || "Medium";
        const limits = duplicateEngine?.skeletonPolicyLimits
          ? duplicateEngine.skeletonPolicyLimits(difficulty)
          : { coreLimit: 3, activeLimit: 10 };
        const existingCount = group.length - 1;
        const nextRank = Math.max(group.length, index + 1);
        const nextPool = nextRank <= limits.coreLimit ? "core_pool" : nextRank <= limits.activeLimit ? "remedial_pool" : "hidden_duplicate";
        skeletonReportsById.set(question.id, {
          skeletonId: duplicateEngine?.stableSkeletonId ? duplicateEngine.stableSkeletonId(key) : key.slice(0, 24),
          skeletonKey: key.slice(0, 280),
          existingCount,
          nextRank,
          coreLimit: limits.coreLimit,
          activeLimit: limits.activeLimit,
          nextPool,
          sampleExistingId: group.find((item) => item.id !== question.id)?.id || "",
          sampleExistingPrompt: group.find((item) => item.id !== question.id)?.prompt || "",
        });
      });
    });
    return {
      promptCounts,
      skeletonReportsById,
    };
  }

  function buildPrecomputedSafety(question = {}, precomputed = {}, helpers = {}) {
    const warnings = [];
    const blocks = [];
    const textSimilarity = typeof helpers.textSimilarity === "function" ? helpers.textSimilarity : () => 0;
    const looksLikeProtectedQuestionText = typeof helpers.looksLikeProtectedQuestionText === "function" ? helpers.looksLikeProtectedQuestionText : () => false;
    const sourceText = [question.generationBrief, question.sourceReference].filter(Boolean).join(" ");
    const inputSimilarity = textSimilarity(question.prompt, sourceText);
    const normalizedPrompt = normalizePromptValue(question.prompt, helpers);
    const duplicatePrompt = normalizedPrompt && Number(precomputed.promptCounts?.[normalizedPrompt] || 0) > 1;
    const skeleton = precomputed.skeletonReportsById?.get(question.id) || null;

    if (looksLikeProtectedQuestionText(sourceText)) {
      warnings.push("Input looks long or question-like. Confirm it is only a summary, not copied protected text.");
    }
    if (inputSimilarity > 0.38) {
      warnings.push(`Draft prompt is ${Math.round(inputSimilarity * 100)}% similar to the source brief. Rewrite before public use if protected text was pasted.`);
    }
    if (duplicatePrompt) {
      blocks.push("Draft prompt exactly matches an existing local question. Generate a new variant before saving.");
    }
    if (skeleton?.existingCount >= skeleton?.activeLimit) {
      blocks.push(
        `Skeleton ${skeleton.skeletonId} already has ${skeleton.existingCount} local item${skeleton.existingCount === 1 ? "" : "s"}; generate a different context/representation/reasoning path before saving.`,
      );
    } else if (skeleton?.existingCount >= skeleton?.coreLimit) {
      warnings.push(`Skeleton ${skeleton.skeletonId} is repeated; keep this item for remedial practice instead of the core pool.`);
    }

    return {
      blocked: blocks.length > 0,
      warnings,
      blocks,
      skeleton,
      existingSimilarity: duplicatePrompt ? 1 : 0,
      inputSimilarity,
    };
  }

  function buildQuestionIntakeRow(question = {}, allQuestions = [], options = {}, helpers = {}) {
    const topicCounts = options.topicCounts || activeTopicCounts(allQuestions);
    const maxActivePerTopic = Number(options.maxActivePerTopic) || 35;
    const existingQuestions = allQuestions.filter((item) => item.id !== question.id);
    const autoCheck = authoringEngine?.autoValidateGeneratedDraft
      ? authoringEngine.autoValidateGeneratedDraft(question, helpers)
      : { status: "passed", errors: [], warnings: [] };
    const safety = options.precomputed
      ? buildPrecomputedSafety(question, options.precomputed, helpers)
      : authoringEngine?.runDraftSafetyChecks
        ? authoringEngine.runDraftSafetyChecks(
          { ...question },
          { brief: question.generationBrief || question.sourceReference || "" },
          {
            ...helpers,
            existingQuestions,
          },
        )
        : { blocked: false, warnings: [], blocks: [], skeleton: null, existingSimilarity: 0, inputSimilarity: 0 };
    const skeletonPool = question.practicePool || question.skeletonDiversity?.practicePool || safety.skeleton?.nextPool || "core_pool";
    const currentTopicCount = topicCounts[topicKey(question)] || 0;
    const issues = [];
    const warnings = [];

    if (autoCheck.status === "failed") issues.push(...(autoCheck.errors || []));
    warnings.push(...(autoCheck.warnings || []));
    if (safety.blocked) issues.push(...(safety.blocks || ["safety_blocked"]));
    warnings.push(...(safety.warnings || []));
    if (question.contentAudit?.verdict === "fail" || question.contentAudit?.verdict === "blocked") issues.push("content_audit_failed");
    if (question.auditStatus === "blocked" || question.publicationStatus === "audit_blocked") issues.push("audit_blocked");
    if (question.reviewStatus === "rejected") issues.push("already_rejected");
    if (skeletonPool === "hidden_duplicate") issues.push("hidden_duplicate_skeleton");
    else if (skeletonPool === "remedial_pool") warnings.push("repeated_skeleton_remedial_only");
    if (currentTopicCount > maxActivePerTopic) warnings.push(`topic_over_quota:${currentTopicCount}/${maxActivePerTopic}`);
    if (question.sourceType === "antigravity" && question.reviewStatus === "reviewed" && !question.intakeGate?.approvedAt) {
      warnings.push("antigravity_requires_intake_approval");
    }

    let status = "ready";
    let action = "keep_private_ready";
    if (issues.length) {
      status = "blocked";
      action = "hide_and_require_review";
    } else if (skeletonPool === "remedial_pool" || currentTopicCount > maxActivePerTopic) {
      status = "remedial";
      action = "move_to_remedial";
    } else if (warnings.length || question.reviewStatus !== "reviewed") {
      status = "needs_review";
      action = "hold_for_admin_review";
    }

    return {
      id: question.id,
      sourceType: question.sourceType || "unknown",
      sourceReference: question.sourceReference || "",
      section: question.section || "Unknown",
      domain: question.domain || "Unknown",
      skill: question.skill || "Unknown",
      difficulty: question.difficulty || "Medium",
      topicKey: topicKey(question),
      topicCount: currentTopicCount,
      status,
      action,
      reviewStatus: question.reviewStatus || "needs_review",
      visibility: question.visibility || "",
      practicePool: skeletonPool,
      issues,
      warnings,
      autoCheck,
      safety,
      severity: 0,
      promptPreview: String(question.prompt || "").slice(0, 180),
    };
  }

  function buildGenerationIntakeReport(questions = [], options = {}, helpers = {}) {
    const topicCounts = activeTopicCounts(questions);
    const precomputed = buildPrecomputedContext(questions, helpers);
    const candidates = questions.filter((question) => isGeneratedCandidate(question));
    const rows = candidates
      .map((question) => buildQuestionIntakeRow(question, questions, { ...options, precomputed, topicCounts }, helpers))
      .map((row) => ({ ...row, severity: intakeSeverity(row) }))
      .sort((a, b) => b.severity - a.severity || b.topicCount - a.topicCount || String(a.id).localeCompare(String(b.id)));
    const summary = {
      total: rows.length,
      blocked: rows.filter((row) => row.status === "blocked").length,
      needsReview: rows.filter((row) => row.status === "needs_review").length,
      remedial: rows.filter((row) => row.status === "remedial").length,
      ready: rows.filter((row) => row.status === "ready").length,
      bySource: sourceCounts(rows),
      topicOverQuota: rows.filter((row) => row.warnings.some((warning) => String(warning).startsWith("topic_over_quota"))).length,
      hiddenDuplicates: rows.filter((row) => row.issues.includes("hidden_duplicate_skeleton")).length,
    };
    return {
      version: "quality-intake-v2",
      generatedAt: options.nowIso || new Date().toISOString(),
      maxActivePerTopic: Number(options.maxActivePerTopic) || 35,
      summary,
      rows,
    };
  }

  function applyGenerationIntakePolicy(questions = [], report = {}, options = {}) {
    const nowIso = options.nowIso || new Date().toISOString();
    const reviewer = options.reviewer || "SAT Studio intake gate";
    const rowsById = new Map((report.rows || []).map((row) => [row.id, row]));
    const changed = [];
    questions.forEach((question) => {
      const row = rowsById.get(question.id);
      if (!row) return;
      const before = {
        reviewStatus: question.reviewStatus,
        publicationStatus: question.publicationStatus,
        practicePool: question.practicePool,
        auditStatus: question.auditStatus,
        intakeGate: question.intakeGate || null,
        contentAudit: question.contentAudit || null,
      };
      question.intakeGate = {
        version: report.version || "quality-intake-v2",
        status: row.status,
        action: row.action,
        checkedAt: nowIso,
        reviewer,
        issues: row.issues || [],
        warnings: row.warnings || [],
      };
      if (row.status === "blocked") {
        question.reviewStatus = "needs_review";
        question.practicePool = "hidden_duplicate";
        question.publicationStatus = "intake_blocked";
        question.auditStatus = question.auditStatus === "passed" ? "open" : question.auditStatus || "open";
        question.contentAudit = {
          ...(question.contentAudit || {}),
          verdict: "blocked",
          blockedBy: "quality-intake-v2",
          checkedAt: nowIso,
          notes: row.issues.join("; "),
        };
      } else if (row.status === "remedial") {
        question.practicePool = "remedial_pool";
        if (!question.publicationStatus || question.publicationStatus === "private_auto_reviewed") {
          question.publicationStatus = "intake_remedial_topic_or_skeleton";
        }
      } else if (row.status === "needs_review") {
        question.reviewStatus = "needs_review";
        if (!question.publicationStatus || question.publicationStatus === "private_auto_reviewed") {
          question.publicationStatus = "intake_needs_admin_review";
        }
      } else {
        question.intakeGate.approvedAt = nowIso;
        if (!question.publicationStatus || question.publicationStatus === "private_auto_reviewed") {
          question.publicationStatus = "private_intake_passed";
        }
      }
      const after = {
        reviewStatus: question.reviewStatus,
        publicationStatus: question.publicationStatus,
        practicePool: question.practicePool,
        auditStatus: question.auditStatus,
        intakeGate: question.intakeGate || null,
        contentAudit: question.contentAudit || null,
      };
      if (JSON.stringify(before) !== JSON.stringify(after)) changed.push({ id: question.id, before, after, status: row.status });
    });
    return {
      changedCount: changed.length,
      changed,
      appliedAt: nowIso,
      version: report.version || "quality-intake-v2",
    };
  }

  return {
    activeTopicCounts,
    applyGenerationIntakePolicy,
    buildGenerationIntakeReport,
    buildQuestionIntakeRow,
    isGeneratedCandidate,
    topicKey,
  };
});
