(function initSatStudioQuestionImport(root, factory) {
  const questionImport = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = questionImport;
  }
  if (root) {
    root.SatStudioQuestionImport = questionImport;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioQuestionImport() {
  function normalizeReviewStatus(value) {
    if (["needs_review", "reviewed", "rejected"].includes(value)) return value;
    if (value === "ready" || value === "approved") return "needs_review";
    return "needs_review";
  }

  function normalizeQuestionType(record = {}) {
    const raw = String(record.questionType || record.responseType || record.answerFormat || "").toLowerCase();
    if (["student_produced_response", "student-produced-response", "grid_in", "grid-in", "numeric"].includes(raw)) {
      return "student_produced_response";
    }
    return "multiple_choice";
  }

  function normalizeAcceptableAnswers(value) {
    const rows = Array.isArray(value) ? value : [value];
    return rows.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  function inferQuestionVisibility(record = {}) {
    const sourceType = record.sourceType || "";
    if (["private_vault", "antigravity", "college_board", "cracksat_reference"].includes(sourceType)) return "private_family";
    return record.visibility || "public_candidate";
  }

  function normalizeQuestionRecord(record, index, options = {}) {
    if (!record || typeof record !== "object") return null;
    if (record.question && typeof record.question === "object") {
      return normalizeOpenSatQuestion(record, index, options);
    }

    const choices = record.choices || {};
    const correctAnswer = record.correctAnswer ?? record.correct_answer;
    const questionType = normalizeQuestionType(record);
    const gridIn = questionType === "student_produced_response";
    if (!record.prompt || correctAnswer === undefined || correctAnswer === null || correctAnswer === "") return null;
    if (!gridIn && !choices) return null;

    const antigravitySignalId = options.antigravitySourceSignalId || "antigravity-testbank";
    const generatedAuditVersion = options.generatedContentAuditVersion || "sat-king-audit-2026-05-17";
    const forcePrivateVault = Boolean(options.forcePrivateVault || record.sourceType === "private_vault");
    const sourceType = forcePrivateVault ? "private_vault" : record.sourceType === "antigravity" ? "antigravity" : record.sourceType || "original";
    const antigravityRecord = sourceType === "antigravity";
    const normalizedChoices = gridIn
      ? {}
      : {
          A: choices.A,
          B: choices.B,
          C: choices.C,
          D: choices.D,
        };

    return {
      id: record.id || `bank-${Date.now()}-${index}`,
      section: record.section || inferSection(record.domain),
      domain: record.domain || "Imported",
      skill: record.skill || record.domain || "Imported",
      difficulty: record.difficulty || "Medium",
      sourceType,
      sourceName: record.sourceName || options.defaultSourceName || "Imported Question Bank",
      sourceReference: record.sourceReference || options.defaultSourceReference || "",
      sourceSignalId: record.sourceSignalId || (antigravityRecord ? antigravitySignalId : null),
      sourceQuestionIndex: record.sourceQuestionIndex || null,
      generationEngine: record.generationEngine || (antigravityRecord ? "antigravity" : ""),
      generationBrief: record.generationBrief || "",
      licenseNote: forcePrivateVault
        ? record.licenseNote || "Private family study copy. Do not publish, share, or include in public release/export."
        : antigravityRecord
          ? record.licenseNote || "Antigravity-generated draft; private review candidate until SAT Studio schema, answer, and duplicate checks pass."
          : record.licenseNote || "Imported content; needs source/license review before public use.",
      reviewStatus: normalizeReviewStatus(record.reviewStatus),
      publicationStatus: forcePrivateVault ? "private_family_only" : antigravityRecord ? record.publicationStatus || "private_similarity_review" : record.publicationStatus || "",
      autoCheck: record.autoCheck || null,
      contentAudit: record.contentAudit || (antigravityRecord
        ? {
            version: generatedAuditVersion,
            verdict: "needs_review",
            checkedAt: "2026-05-17",
            notes: "Imported from Antigravity worker. SAT Studio requires human answer review plus duplicate/similarity scan before broader use.",
          }
        : null),
      templateDiversity: record.templateDiversity || null,
      practicePool: record.practicePool || record.skeletonDiversity?.practicePool || "core_pool",
      skeletonDiversity: record.skeletonDiversity || null,
      validator: record.validator || null,
      expectedAnswer: record.expectedAnswer || record.autoCheck?.expectedAnswer || null,
      questionType,
      acceptableAnswers: gridIn ? normalizeAcceptableAnswers(record.acceptableAnswers || record.acceptedAnswers || record.answers || correctAnswer) : [],
      answerFormat: gridIn ? record.answerFormat || "numeric" : "multiple_choice",
      visibility: forcePrivateVault ? "private_family" : antigravityRecord ? "private_family" : record.visibility || inferQuestionVisibility(record),
      neverPublic: forcePrivateVault ? true : antigravityRecord ? Boolean(record.neverPublic) : Boolean(record.neverPublic),
      prompt: record.prompt,
      choices: normalizedChoices,
      correctAnswer,
      explanation: record.explanation || "No explanation provided.",
    };
  }

  function normalizeOpenSatQuestion(item, index, options = {}) {
    if (!item || typeof item !== "object") return null;
    const q = item.question || {};
    const choices = q.choices || item.choices;
    const correctAnswer = q.correct_answer || q.correctAnswer || item.correct_answer || item.correctAnswer;
    const sourceSection = item._satStudioSourceSection || item.section || "";
    const normalizedId = `opensat-${sourceSection || "unknown"}-${index}-${item.id || "item"}`;
    const promptParts = [q.paragraph, q.question || item.prompt || item.question].filter(
      (part) => part && part !== "null",
    );

    if (!choices || !correctAnswer || !promptParts.length) return null;
    if (!["A", "B", "C", "D"].every((key) => String(choices[key] || "").trim())) return null;
    const choiceValues = ["A", "B", "C", "D"].map((key) => String(choices[key]).trim().toLowerCase());
    if (new Set(choiceValues).size < 4) return null;

    const openSatAuditVersion = options.openSatImportAuditVersion || "opensat-clean-2026-05-17";
    const questionReviews = options.questionReviews || {};
    const reviewStatus = questionReviews[normalizedId] || normalizeReviewStatus(item.reviewStatus);
    return {
      id: normalizedId,
      section: sourceSection === "math" ? "Math" : sourceSection === "english" ? "Reading and Writing" : inferSection(item.domain || item.section),
      domain: item.domain || "Imported",
      skill: item.skill || inferOpenSatSkill(item),
      difficulty: item.difficulty || "Medium",
      sourceType: "opensat",
      sourceName: "OpenSAT / PineSAT local snapshot",
      licenseNote: "Local OpenSAT/PineSAT snapshot; needs review before public use.",
      reviewStatus,
      publicationStatus: item.publicationStatus || "",
      contentAudit: item.contentAudit || {
        version: openSatAuditVersion,
        verdict: "needs_review",
        checkedAt: "2026-05-17",
        notes: "Duplicate prompts and duplicate A-D choices filtered during local import. External dataset still needs human review before public use.",
      },
      practicePool: item.practicePool || item.skeletonDiversity?.practicePool || "core_pool",
      skeletonDiversity: item.skeletonDiversity || null,
      prompt: promptParts.join("\n\n"),
      choices: {
        A: choices.A,
        B: choices.B,
        C: choices.C,
        D: choices.D,
      },
      correctAnswer,
      explanation: q.explanation || item.explanation || "No explanation provided.",
    };
  }

  function normalizePromptForImport(prompt = "") {
    return String(prompt).toLowerCase().replace(/\s+/g, " ").trim();
  }

  function inferSection(domain = "") {
    const mathDomains = ["Algebra", "Advanced Math", "Problem-Solving", "Geometry", "Trigonometry"];
    return mathDomains.some((term) => String(domain).toLowerCase().includes(term.toLowerCase()))
      ? "Math"
      : "Reading and Writing";
  }

  function inferOpenSatSkill(item) {
    const domain = item.domain || "Imported";
    const q = item.question || {};
    const text = [domain, q.paragraph, q.question, q.explanation, Object.values(q.choices || {}).join(" ")]
      .join(" ")
      .toLowerCase();

    if (domain === "Standard English Conventions") {
      if (hasAny(text, ["comma", "semicolon", "colon", "dash", "punctuation", "independent clause", "clauses"])) return "Boundaries";
      if (hasAny(text, ["verb", "subject", "pronoun", "modifier", "possessive", "plural", "singular", "tense"])) return "Form, structure, and sense";
      return "Standard English conventions mixed";
    }
    if (domain === "Expression of Ideas") {
      if (hasAny(text, ["transition", "logical", "however", "therefore", "nevertheless", "similarly", "consequently"])) return "Transitions";
      if (hasAny(text, ["student wants", "notes", "synthesize", "accomplish this goal", "relevant information"])) return "Rhetorical Synthesis";
      return "Expression of ideas mixed";
    }
    if (domain === "Information and Ideas") {
      if (hasAny(text, ["main idea", "central", "best states", "summarizes", "primarily"])) return "Central Ideas and Details";
      if (hasAny(text, ["inference", "infer", "suggests", "implies", "most likely"])) return "Inferences";
      if (hasAny(text, ["support", "evidence", "claim", "finding", "data", "table", "graph"])) return "Command of Evidence";
      return "Information and ideas mixed";
    }
    if (domain === "Craft and Structure") {
      if (hasAny(text, ["word", "phrase", "meaning", "context", "most nearly", "precise", "complete the text"])) return "Words in Context";
      if (hasAny(text, ["function", "purpose", "structure", "overall", "paragraph"])) return "Text Structure and Purpose";
      if (hasAny(text, ["text 1", "text 2", "would respond", "both texts"])) return "Cross-Text Connections";
      return "Craft and structure mixed";
    }
    if (domain === "Algebra") {
      if (hasAny(text, ["system", "simultaneous"])) return "Systems of linear equations";
      if (hasAny(text, ["slope", "linear function", "line", "y-intercept", "intercept"])) return "Linear functions and slope";
      if (hasAny(text, ["inequality", "less than", "greater than", "at least", "at most"])) return "Linear inequalities";
      return "Linear equations in one variable";
    }
    if (domain === "Advanced Math") {
      if (hasAny(text, ["quadratic", "parabola", "vertex", "x^2", "x²"])) return "Quadratic equations";
      if (hasAny(text, ["exponential", "growth", "decay", "doubles", "halves"])) return "Exponential functions";
      if (hasAny(text, ["equivalent", "factor", "polynomial", "rational expression", "simplify"])) return "Equivalent expressions";
      return "Nonlinear equations and functions";
    }
    if (domain === "Problem-Solving and Data Analysis") {
      if (hasAny(text, ["percent", "%", "increase", "decrease", "discount"])) return "Percentages";
      if (hasAny(text, ["rate", "unit", "per", "ratio", "proportion"])) return "Rates and units";
      if (hasAny(text, ["mean", "median", "range", "standard deviation", "survey", "sample"])) return "Statistics";
      if (hasAny(text, ["probability", "random", "chance"])) return "Probability";
      return "Data interpretation";
    }
    if (domain === "Geometry and Trigonometry") {
      if (hasAny(text, ["circle", "radius", "diameter", "arc", "circumference"])) return "Circles";
      if (hasAny(text, ["right triangle", "sine", "cosine", "tangent", "hypotenuse"])) return "Right triangles and trigonometry";
      if (hasAny(text, ["area", "volume", "surface area"])) return "Area and volume";
      if (hasAny(text, ["angle", "triangle", "parallel", "similar"])) return "Lines, angles, and triangles";
      return "Geometry mixed";
    }
    return domain || "Imported";
  }

  function hasAny(text, needles) {
    return needles.some((needle) => text.includes(needle));
  }

  function extractQuestionRecords(data) {
    return Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
  }

  return {
    extractQuestionRecords,
    hasAny,
    inferOpenSatSkill,
    inferQuestionVisibility,
    inferSection,
    normalizeAcceptableAnswers,
    normalizeOpenSatQuestion,
    normalizePromptForImport,
    normalizeQuestionRecord,
    normalizeQuestionType,
    normalizeReviewStatus,
  };
});
