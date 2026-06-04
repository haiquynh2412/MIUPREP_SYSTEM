(function initSatStudioAuthoringEngine(root, factory) {
  let duplicateEngine = root?.SatDuplicateEngine;
  if (!duplicateEngine && typeof require === "function") {
    duplicateEngine = require("./sat_duplicate_engine.js");
  }
  const authoringEngine = factory(duplicateEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = authoringEngine;
  }
  if (root) {
    root.SatAuthoringEngine = authoringEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioAuthoringEngine(duplicateEngine) {
  const BLOCKED_PUBLIC_SOURCE_TYPES = new Set(["private_vault", "college_board", "cracksat_reference", "official_log"]);

  function sourceKindRisk(kind) {
    return ["cracksat", "college_board", "private_pdf", "satpanda", "khan_college_board", "commercial_prep", "third_party_prep", "other"].includes(kind)
      ? "high"
      : "medium";
  }

  function normalizeSourceSignal(signal, context = {}) {
    if (!signal || typeof signal !== "object") return null;
    const validDifficulty = ["Easy", "Medium", "Hard"].includes(signal.difficulty) ? signal.difficulty : "Medium";
    return {
      id: signal.id || `signal-${context.nowMs || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sourceKind: signal.sourceKind || "other",
      sourceReference: signal.sourceReference || "",
      section: signal.section || "Reading and Writing",
      domain: signal.domain || "Imported",
      skill: signal.skill || "Imported",
      difficulty: validDifficulty,
      mistakePattern: signal.mistakePattern || "",
      learningGoal: signal.learningGoal || "",
      risk: signal.risk || sourceKindRisk(signal.sourceKind || "other"),
      visibility: signal.visibility === "admin_only" ? "admin_only" : "private_family",
      protectedTextExcluded: Boolean(signal.protectedTextExcluded),
      createdAt: signal.createdAt || context.nowIso || new Date().toISOString(),
      createdBy: signal.createdBy || context.accountId || "unknown",
    };
  }

  function buildSourceSignalDraft(input = {}, context = {}) {
    if (!context.isContentAdmin && !context.canAuthorQuestions) return { ok: false, reason: "This account cannot save source signals." };
    if (!context.canAccessPrivateContent) return { ok: false, reason: "Public accounts cannot save protected source signals." };
    if (!input.protectedTextExcluded) {
      return { ok: false, reason: "Confirm that no protected prompt, passage, answer choices, or official explanation was pasted." };
    }
    const section = ["Reading and Writing", "Math"].includes(input.section) ? input.section : "Reading and Writing";
    const signal = normalizeSourceSignal(
      {
        id: input.id || `signal-${context.nowMs || Date.now()}`,
        sourceKind: input.sourceKind,
        sourceReference: String(input.sourceReference || "").trim(),
        section,
        domain: String(input.domain || "").trim() || (section === "Math" ? "Algebra" : "Information and Ideas"),
        skill: String(input.skill || "").trim() || (section === "Math" ? "Linear equations in one variable" : "Inferences"),
        difficulty: input.difficulty,
        mistakePattern: String(input.mistakePattern || "").trim(),
        learningGoal: String(input.learningGoal || "").trim(),
        risk: input.risk || sourceKindRisk(input.sourceKind || "other"),
        protectedTextExcluded: Boolean(input.protectedTextExcluded),
        createdBy: context.accountId || input.createdBy || "unknown",
      },
      context,
    );
    return { ok: true, signal };
  }

  function draftsForSourceReference(sourceReference, questions = []) {
    if (!sourceReference) return [];
    return questions.filter((question) => question.sourceType === "ai_generated" && question.sourceReference === sourceReference);
  }

  function draftsForSourceSignal(signal, questions = []) {
    if (!signal) return [];
    return questions.filter((question) => {
      if (question.sourceType !== "ai_generated") return false;
      if (signal.id && question.sourceSignalId === signal.id) return true;
      return Boolean(signal.sourceReference && question.sourceReference === signal.sourceReference);
    });
  }

  function draftStatsForRows(rows = []) {
    return {
      total: rows.length,
      needsReview: rows.filter((question) => question.reviewStatus === "needs_review").length,
      reviewed: rows.filter((question) => question.reviewStatus === "reviewed").length,
      rejected: rows.filter((question) => question.reviewStatus === "rejected").length,
    };
  }

  function sourceSignalDraftStats(signal, questions = []) {
    return draftStatsForRows(draftsForSourceSignal(signal, questions));
  }

  function sourceReferenceDraftStats(sourceReference, questions = []) {
    return draftStatsForRows(draftsForSourceReference(sourceReference, questions));
  }

  function buildManualQuestionDraft(input = {}, context = {}) {
    if (!context.isContentAdmin && !context.canAuthorQuestions) return { ok: false, reason: "This account cannot add question drafts." };
    const section = ["Reading and Writing", "Math"].includes(input.section) ? input.section : "Reading and Writing";
    const draft = {
      id: input.id || `orig-${context.nowMs || Date.now()}`,
      section,
      domain: String(input.domain || "").trim(),
      skill: String(input.skill || "").trim(),
      difficulty: ["Easy", "Medium", "Hard"].includes(input.difficulty) ? input.difficulty : "Medium",
      sourceType: "original",
      sourceName: context.isContentAdmin ? "SAT Studio Original Draft" : "Parent Contributor Draft",
      licenseNote: "Original draft; safe to publish after review.",
      reviewStatus: "needs_review",
      prompt: String(input.prompt || "").trim(),
      choices: {
        A: String(input.choiceA || input.choices?.A || "").trim(),
        B: String(input.choiceB || input.choices?.B || "").trim(),
        C: String(input.choiceC || input.choices?.C || "").trim(),
        D: String(input.choiceD || input.choices?.D || "").trim(),
      },
      correctAnswer: ["A", "B", "C", "D"].includes(input.correctAnswer) ? input.correctAnswer : "A",
      explanation: String(input.explanation || "").trim(),
    };
    const missing = [];
    ["domain", "skill", "prompt", "explanation"].forEach((key) => {
      if (!draft[key]) missing.push(key);
    });
    ["A", "B", "C", "D"].forEach((key) => {
      if (!draft.choices[key]) missing.push(`choice_${key}`);
    });
    if (missing.length) return { ok: false, reason: `Missing required authoring fields: ${missing.join(", ")}` };
    return { ok: true, draft };
  }

  function publicPromotionGate(question, options = {}) {
    const isContentAdmin = Boolean(options.isContentAdmin);
    const hasOpenQuestionAudits = Boolean(options.hasOpenQuestionAudits);
    const isDiagnosticReadyQuestion = Boolean(options.isDiagnosticReadyQuestion);
    if (!question) return { ok: false, reason: "No question selected." };
    if (!isContentAdmin) return { ok: false, reason: "Only Content Admin can promote questions." };
    if (question.visibility === "public_candidate") return { ok: false, reason: "Already visible as a public candidate." };
    if (question.reviewStatus !== "reviewed") return { ok: false, reason: "Mark Reviewed only after checking answer, explanation, originality, and source policy." };
    if (question.neverPublic) return { ok: false, reason: "This question is marked neverPublic." };
    if (BLOCKED_PUBLIC_SOURCE_TYPES.has(question.sourceType)) {
      return { ok: false, reason: "Vault, official, and protected-copy sources cannot be promoted from this UI." };
    }
    const publicationStatus = String(question.publicationStatus || "");
    if (publicationStatus.startsWith("hidden_duplicate") || publicationStatus.startsWith("rejected_template")) {
      return { ok: false, reason: "Resolve duplicate/template status before public promotion." };
    }
    if (hasOpenQuestionAudits) return { ok: false, reason: "Resolve open audit reports before public promotion." };
    if (question.auditStatus === "blocked") return { ok: false, reason: "This question is blocked by audit." };
    if (question.safetyReport?.blocked || question.autoCheck?.status === "blocked") {
      return { ok: false, reason: "Safety checks blocked this item." };
    }
    if (!isDiagnosticReadyQuestion) return { ok: false, reason: "Question needs prompt, answer, choices/grid answer, and explanation before public use." };
    return { ok: true, reason: "Ready for admin promotion after final human source/originality review." };
  }

  function applyPublicPromotion(question, { accountId = "unknown", nowIso = new Date().toISOString() } = {}) {
    if (!question) return null;
    question.visibility = "public_candidate";
    question.reviewStatus = "reviewed";
    question.publicationStatus = "public_candidate_reviewed";
    question.promotedBy = accountId;
    question.promotedAt = nowIso;
    question.publicReviewNote = "Admin confirmed answer, explanation, originality, and source policy before public promotion.";
    return {
      reviewStatus: question.reviewStatus,
      visibility: question.visibility,
      publicationStatus: question.publicationStatus,
      promotedBy: question.promotedBy,
      promotedAt: question.promotedAt,
      publicReviewNote: question.publicReviewNote,
    };
  }

  function validationExplanationText(explanation) {
    if (!explanation) return "";
    if (typeof explanation === "object") {
      return String(explanation.correct || Object.values(explanation).join(" ") || "");
    }
    return String(explanation);
  }

  function normalizedAnswerText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/\s+/g, "")
      .trim();
  }

  function parseStudentNumber(value) {
    const normalized = normalizedAnswerText(value).replace(/[\u2212\u2013\u2014]/g, "-");
    if (/^-?\d+\/-?\d+$/.test(normalized)) {
      const [top, bottom] = normalized.split("/").map(Number);
      if (!bottom) return null;
      return top / bottom;
    }
    if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return Number(normalized);
    return null;
  }

  function answerTextEquivalent(a, b, helpers = {}) {
    if (normalizedAnswerText(a) === normalizedAnswerText(b)) return true;
    if (typeof helpers.answersMatch === "function" && helpers.answersMatch(a, b)) return true;
    const left = parseStudentNumber(a);
    const right = parseStudentNumber(b);
    if (left === null || right === null) return false;
    return Math.abs(left - right) <= 0.0005;
  }

  function extractFinalEqualsAnswer(text = "") {
    const matches = [...String(text).matchAll(/=\s*(-?\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?(?:\s*(?:pi|\u03c0))?)/gi)];
    return matches.length ? matches[matches.length - 1][1].trim() : "";
  }

  function extractNumericTokens(text = "") {
    return [...String(text).matchAll(/-?\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?(?:\s*(?:pi|\u03c0))?/gi)].map((match) => match[0]);
  }

  function explanationMentionsAnswerText(explanation = "", answerText = "", helpers = {}) {
    const normalizedExplanation = normalizedAnswerText(explanation);
    const normalizedAnswer = normalizedAnswerText(answerText);
    if (normalizedAnswer && normalizedExplanation.includes(normalizedAnswer)) return true;
    return extractNumericTokens(explanation).some((token) => answerTextEquivalent(token, answerText, helpers));
  }

  function isGridInQuestion(question) {
    return duplicateEngine?.isGridInQuestion
      ? duplicateEngine.isGridInQuestion(question)
      : ["student_produced_response", "grid_in", "numeric"].includes(question?.questionType);
  }

  function getCorrectAnswerLabel(question) {
    if (!question) return "";
    if (isGridInQuestion(question)) {
      return String((question.acceptableAnswers || [question.correctAnswer]).filter(Boolean)[0] || question.correctAnswer || "");
    }
    return String(question.correctAnswer || "");
  }

  function verifyMathDraftAnswer(draft, helpers = {}) {
    if (draft?.section !== "Math") return { status: "skipped", issues: [], warnings: [], details: {} };
    const issues = [];
    const warnings = [];
    const details = {};
    const gridIn = isGridInQuestion(draft);
    const choices = draft?.choices || {};
    const answerText = gridIn ? getCorrectAnswerLabel(draft) : choices[draft?.correctAnswer] || draft?.correctAnswer || "";
    const explanation = validationExplanationText(draft?.explanation);
    const expectedAnswer = draft?.expectedAnswer ?? null;
    const mentionsAnswer = answerText ? explanationMentionsAnswerText(explanation, answerText, helpers) : false;

    if (expectedAnswer !== null && !answerTextEquivalent(answerText, expectedAnswer, helpers)) {
      issues.push("expected_answer_mismatch");
      details.expectedAnswer = String(expectedAnswer);
    }

    if (gridIn) {
      const acceptable = (draft?.acceptableAnswers || [draft?.correctAnswer]).filter(Boolean);
      if (!acceptable.length) {
        issues.push("grid_in_missing_acceptable_answers");
      } else if (!acceptable.some((value) => answerTextEquivalent(value, draft?.correctAnswer, helpers))) {
        issues.push("grid_in_correct_answer_not_in_acceptable_answers");
      }
    }

    const finalAnswer = extractFinalEqualsAnswer(explanation);
    if (finalAnswer) {
      details.finalEqualsAnswer = finalAnswer;
      if (answerText && !answerTextEquivalent(finalAnswer, answerText, helpers)) {
        if (mentionsAnswer) warnings.push("final_equals_value_is_intermediate");
        else issues.push("explanation_final_value_mismatch");
      }
    } else if (extractNumericTokens(answerText).length) {
      warnings.push("no_final_equals_value_found");
    }

    if (answerText && !mentionsAnswer) {
      warnings.push("explanation_does_not_mention_correct_answer");
    }

    return {
      status: issues.length ? "failed" : warnings.length ? "warning" : "passed",
      issues,
      warnings,
      details,
    };
  }

  function autoValidateGeneratedDraft(draft, helpers = {}) {
    const errors = [];
    const warnings = [];
    const choices = draft?.choices || {};
    const requiredTextFields = ["section", "domain", "skill", "difficulty", "prompt", "explanation"];
    const gridIn = isGridInQuestion(draft);

    requiredTextFields.forEach((field) => {
      if (!String(draft?.[field] || "").trim()) errors.push(`missing_${field}`);
    });
    if (gridIn) {
      if (!String(draft?.correctAnswer || "").trim()) errors.push("missing_student_response_answer");
    } else {
      ["A", "B", "C", "D"].forEach((key) => {
        if (!String(choices[key] || "").trim()) errors.push(`missing_choice_${key}`);
      });
      if (!["A", "B", "C", "D"].includes(draft?.correctAnswer)) errors.push("invalid_correct_answer");
    }

    const expectedAnswer = draft?.expectedAnswer ?? null;
    const selectedAnswer = gridIn ? draft?.correctAnswer : draft?.correctAnswer ? choices[draft.correctAnswer] : null;
    if (expectedAnswer !== null && !answerTextEquivalent(selectedAnswer, expectedAnswer, helpers)) {
      errors.push("validator_answer_mismatch");
    }
    const mathVerification = verifyMathDraftAnswer(draft, helpers);
    if (mathVerification.status === "failed") {
      errors.push(...mathVerification.issues.map((issue) => `math_${issue}`));
    } else {
      warnings.push(...mathVerification.warnings.map((warning) => `math_${warning}`));
    }
    if (/kaplan/i.test(String(draft?.sourceReference || "")) && draft?.visibility !== "private_family") {
      errors.push("kaplan_source_must_stay_private_family");
    }
    if (draft?.safetyReport?.blocked) errors.push("safety_blocked");

    return {
      status: errors.length ? "failed" : "passed",
      validator: draft?.validator || "structure",
      expectedAnswer: expectedAnswer === null ? "" : String(expectedAnswer),
      checks: ["structure", "answer_key", "math_template_validator", "math_answer_verification", "source_visibility"],
      errors,
      warnings,
      mathVerification,
      checkedAt: new Date().toISOString(),
    };
  }

  function analyzeDraftSkeleton(draft, existingQuestions = []) {
    const key = duplicateEngine.questionSkeletonKey(draft);
    const id = duplicateEngine.stableSkeletonId(key);
    const difficulty = draft?.difficulty || "Medium";
    const { coreLimit, activeLimit } = duplicateEngine.skeletonPolicyLimits(difficulty);
    const matches = existingQuestions.filter(
      (question) => question.id !== draft?.id && question.reviewStatus !== "rejected" && duplicateEngine.questionSkeletonKey(question) === key,
    );
    const nextRank = matches.length + 1;
    const nextPool = nextRank <= coreLimit ? "core_pool" : nextRank <= activeLimit ? "remedial_pool" : "hidden_duplicate";
    return {
      skeletonId: id,
      skeletonKey: key.slice(0, 280),
      existingCount: matches.length,
      nextRank,
      coreLimit,
      activeLimit,
      nextPool,
      sampleExistingId: matches[0]?.id || "",
      sampleExistingPrompt: matches[0]?.prompt || "",
    };
  }

  function applySkeletonMetadataToDraft(draft, report) {
    if (!draft || !report) return;
    draft.practicePool = report.nextPool;
    draft.skeletonDiversity = {
      skeletonId: report.skeletonId,
      skeletonRank: report.nextRank,
      skeletonSize: report.existingCount + 1,
      coreLimit: report.coreLimit,
      activeLimit: report.activeLimit,
      practicePool: report.nextPool,
      skeletonKey: report.skeletonKey,
      reason:
        report.nextPool === "core_pool"
          ? "Within core diversity cap."
          : report.nextPool === "remedial_pool"
            ? "Repeated skeleton; keep only for learners who miss this form."
            : "Skeleton overflow; blocked from saving.",
      policy: "Core pool is visible by default. Remedial pool opens after misses. Hidden duplicates are blocked.",
    };
    if (report.nextPool === "hidden_duplicate") {
      draft.publicationStatus = "hidden_duplicate_skeleton_overflow";
    }
  }

  function runDraftSafetyChecks(draft, context = {}, helpers = {}) {
    const warnings = [];
    const blocks = [];
    const existingQuestions = Array.isArray(helpers.existingQuestions) ? helpers.existingQuestions : [];
    const skeletonReport = analyzeDraftSkeleton(draft, existingQuestions);
    applySkeletonMetadataToDraft(draft, skeletonReport);
    const sourceText = [context.brief, context.sourceSignal?.mistakePattern, context.sourceSignal?.learningGoal]
      .filter(Boolean)
      .join(" ");
    const textSimilarity = typeof helpers.textSimilarity === "function" ? helpers.textSimilarity : () => 0;
    const normalizePrompt = typeof helpers.normalizePrompt === "function" ? helpers.normalizePrompt : normalizedAnswerText;
    const looksLikeProtectedQuestionText = typeof helpers.looksLikeProtectedQuestionText === "function" ? helpers.looksLikeProtectedQuestionText : () => false;
    const protectedPatternRisk = looksLikeProtectedQuestionText(sourceText);
    const inputSimilarity = textSimilarity(draft.prompt, sourceText);
    const existingSimilarity = Math.max(
      0,
      ...existingQuestions
        .filter((question) => question.id !== draft.id)
        .map((question) => textSimilarity(draft.prompt, question.prompt || "")),
    );
    const duplicatePrompt = existingQuestions.some(
      (question) => question.id !== draft.id && normalizePrompt(question.prompt || "") === normalizePrompt(draft.prompt || ""),
    );

    if (protectedPatternRisk) {
      warnings.push("Input looks long or question-like. Confirm it is only a summary, not copied protected text.");
    }
    if (inputSimilarity > 0.38) {
      warnings.push(`Draft prompt is ${Math.round(inputSimilarity * 100)}% similar to the source brief. Rewrite before public use if protected text was pasted.`);
    }
    if (duplicatePrompt) {
      blocks.push("Draft prompt exactly matches an existing local question. Generate a new variant before saving.");
    } else if (existingSimilarity > 0.92) {
      blocks.push(`Draft is ${Math.round(existingSimilarity * 100)}% similar to an existing local question. Generate a new variant before saving.`);
    }
    if (existingSimilarity > 0.72) {
      warnings.push(`Draft is ${Math.round(existingSimilarity * 100)}% similar to an existing local question. Review originality.`);
    }
    if (skeletonReport.existingCount >= skeletonReport.activeLimit) {
      blocks.push(
        `Skeleton ${skeletonReport.skeletonId} already has ${skeletonReport.existingCount} local item${skeletonReport.existingCount === 1 ? "" : "s"}; generate a different context/representation/reasoning path before saving.`,
      );
    } else if (skeletonReport.existingCount >= skeletonReport.coreLimit) {
      warnings.push(
        `Skeleton ${skeletonReport.skeletonId} already has ${skeletonReport.existingCount} item${skeletonReport.existingCount === 1 ? "" : "s"}. This draft will be remedial-only unless the context and reasoning path are genuinely different.`,
      );
    }
    if (draft.visibility === "public_candidate" && protectedPatternRisk && inputSimilarity > 0.45) {
      blocks.push("Public candidate blocked until the source brief is rewritten as metadata only.");
    }

    return {
      blocked: blocks.length > 0,
      warnings,
      blocks,
      inputSimilarity: Number(inputSimilarity.toFixed(3)),
      existingSimilarity: Number(existingSimilarity.toFixed(3)),
      skeleton: skeletonReport,
      checklist: [
        "No protected prompt, passage, choices, or explanation stored.",
        "Generated prompt uses a new scenario and wording.",
        "Skeleton was checked against the existing local bank before save.",
        "Correct answer and explanation require admin review.",
        "Visibility remains private_family for high-risk sources.",
      ],
    };
  }

  return {
    analyzeDraftSkeleton,
    answerTextEquivalent,
    applyPublicPromotion,
    applySkeletonMetadataToDraft,
    autoValidateGeneratedDraft,
    buildManualQuestionDraft,
    buildSourceSignalDraft,
    draftStatsForRows,
    draftsForSourceReference,
    draftsForSourceSignal,
    extractFinalEqualsAnswer,
    extractNumericTokens,
    explanationMentionsAnswerText,
    getCorrectAnswerLabel,
    normalizedAnswerText,
    normalizeSourceSignal,
    publicPromotionGate,
    runDraftSafetyChecks,
    sourceKindRisk,
    sourceReferenceDraftStats,
    sourceSignalDraftStats,
    validationExplanationText,
    verifyMathDraftAnswer,
  };
});
