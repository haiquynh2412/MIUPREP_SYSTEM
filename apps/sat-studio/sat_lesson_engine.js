(function initSatStudioLessonEngine(root, factory) {
  const lessonEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = lessonEngine;
  }
  if (root) {
    root.SatStudioLessonEngine = lessonEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioLessonEngine() {
  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function hasAny(text, needles = []) {
    const haystack = normalizeText(text);
    return needles.some((needle) => haystack.includes(normalizeText(needle)));
  }

  function unique(values = []) {
    return [...new Set(values.filter(Boolean))];
  }

  function isDesmosScope(scope = {}) {
    return hasAny(`${scope.section || ""} ${scope.domain || ""} ${scope.skill || ""}`, ["desmos", "calculator strategy", "graphing calculator"]);
  }

  function lessonFromKnowledgeMeta(meta, fallback = {}) {
    if (meta?.lesson) {
      return {
        title: `Review: ${meta.skill}`,
        rule: meta.lesson.rule,
        steps: meta.lesson.steps,
        drill: meta.lesson.drill,
        example: meta.lesson.example,
        traps: meta.lesson.traps || [],
      };
    }
    return {
      title: `Review: ${fallback.skill || "SAT skill"}`,
      rule: "Identify the exact task, find proof in the text or calculation, and eliminate choices that answer a different question.",
      steps: [
        ["1. Restate the ask", "Say exactly what the question wants."],
        ["2. Find proof", "Use a sentence, data point, formula, or algebra step."],
        ["3. Check traps", "Reject choices that are true but not responsive."],
      ],
      drill: "What proves the answer directly?",
      example: "A correct SAT answer must match the task and the evidence, not just the topic.",
      traps: ["Right topic, wrong task", "Unproven extra claim", "Arithmetic or grammar slip"],
    };
  }

  function lessonStageForSkill(mastery = null) {
    const stage = mastery?.masteryStage || "";
    if (!mastery || stage === "Collect evidence" || stage === "Foundation repair") return "Pre-SAT Grade 10";
    if (stage === "Standard SAT") return "SAT Core";
    if (stage === "Trap recognition") return "SAT Transfer";
    return "SAT 1550-1600";
  }

  function lessonLadderFor(mastery = null) {
    const current = lessonStageForSkill(mastery);
    return [
      {
        stage: "Pre-SAT Grade 10",
        goal: "Repair vocabulary, formulas, and the one-step rule before timed work.",
        exit: "Explain the rule and pass 3 easy/medium checks.",
      },
      {
        stage: "SAT Core",
        goal: "Solve standard SAT wording without hints.",
        exit: "Reach 80%+ on medium questions in new contexts.",
      },
      {
        stage: "SAT Transfer",
        goal: "Recognize traps, changed context, and answer-choice bait.",
        exit: "Write why each wrong choice is wrong on 5 new items.",
      },
      {
        stage: "SAT 1550-1600",
        goal: "Prove the skill on hard, timed, low-margin questions.",
        exit: "Pass 2 hard or grid-in proof questions under target time.",
      },
    ].map((row) => ({ ...row, active: row.stage === current }));
  }

  function subskillChecklistFor(scope = {}) {
    const text = `${scope.section || ""} ${scope.domain || ""} ${scope.skill || ""}`;
    if (isDesmosScope(scope)) {
      return [
        "calculator decision: Desmos, algebra, or mental math",
        "equation and system intersections",
        "intercepts, roots, and number of solutions",
        "quadratic vertex, minimum, and maximum",
        "inequality and domain checks",
        "tables, regression, and data models",
        "sliders for constants and parameter questions",
        "student-produced response rounding and answer format",
      ];
    }
    if (scope.section === "Math") {
      if (hasAny(text, ["linear equations in one variable"])) {
        return ["one-step and two-step equations", "variables on both sides", "distribution and sign control", "answer substitution check"];
      }
      if (hasAny(text, ["linear functions", "slope"])) {
        return ["slope as rate of change", "intercepts in context", "table and graph translation", "parallel and perpendicular line logic"];
      }
      if (hasAny(text, ["systems"])) {
        return ["substitution", "elimination", "intersection meaning", "no solution and infinite solutions"];
      }
      if (hasAny(text, ["inequality"])) {
        return ["inequality solving", "negative multiplier flip", "boundary inclusion", "graph region testing"];
      }
      if (hasAny(text, ["quadratic", "nonlinear equations"])) {
        return ["factoring and roots", "vertex and intercepts", "discriminant meaning", "extraneous solution checks"];
      }
      if (hasAny(text, ["nonlinear functions", "exponential"])) {
        return ["growth factor", "function notation", "domain and range", "model interpretation"];
      }
      if (hasAny(text, ["equivalent", "polynomial", "rational", "radical"])) {
        return ["factoring patterns", "common denominators", "radical restrictions", "structure-based rewriting"];
      }
      if (hasAny(text, ["ratio", "rate", "unit"])) {
        return ["unit rate", "proportional scaling", "unit conversion", "fixed fee versus proportional model"];
      }
      if (hasAny(text, ["percent"])) {
        return ["base identification", "percent increase/decrease", "successive percent change", "percent points versus percent"];
      }
      if (hasAny(text, ["data", "mean", "median", "statistics"])) {
        return ["center versus spread", "outlier effect", "model fit", "claim supported by data"];
      }
      if (hasAny(text, ["probability"])) {
        return ["sample space", "conditional denominator", "and/or counting", "complement probability"];
      }
      if (hasAny(text, ["sample", "margin", "experiment", "observational"])) {
        return ["random sample", "random assignment", "margin of error interval", "valid population claim"];
      }
      if (hasAny(text, ["area", "volume", "geometry", "triangle", "circle", "trigonometry", "angle"])) {
        return ["formula selection", "unit scaling", "similarity and angle facts", "right-triangle ratios"];
      }
    }

    const rwSkill = scope.skill || "";
    if (hasAny(rwSkill, ["central ideas", "details"])) {
      return ["topic versus claim", "scope control", "detail support", "whole-text summary"];
    }
    if (hasAny(rwSkill, ["inference"])) {
      return ["smallest valid leap", "proof phrase", "avoid outside knowledge", "answer necessity test"];
    }
    if (hasAny(rwSkill, ["evidence"])) {
      return ["claim labeling", "data comparison", "support versus weaken", "near-evidence traps"];
    }
    if (hasAny(rwSkill, ["words in context", "vocabulary"])) {
      return ["context prediction", "tone clues", "secondary meanings", "grammar fit"];
    }
    if (hasAny(rwSkill, ["cross", "text"])) {
      return ["Text 1 claim", "Text 2 claim", "support/challenge/refine", "author-response wording"];
    }
    if (hasAny(rwSkill, ["synthesis", "notes", "bullet"])) {
      return ["rhetorical goal", "relevant note selection", "comparison setup", "sentence concision"];
    }
    if (hasAny(rwSkill, ["transition"])) {
      return ["continuation", "contrast", "cause/result", "example and concession"];
    }
    if (hasAny(rwSkill, ["boundaries", "punctuation"])) {
      return ["independent clauses", "comma splice repair", "colon and dash use", "list punctuation"];
    }
    if (hasAny(rwSkill, ["form", "sense", "verb", "agreement", "modifier", "pronoun"])) {
      return ["subject-verb agreement", "tense logic", "pronoun reference", "modifier placement"];
    }
    if (hasAny(rwSkill, ["structure", "purpose"])) {
      return ["rhetorical role", "contrast and qualification", "sentence function", "role not summary"];
    }
    return ["core rule", "worked example", "trap recognition", "timed proof"];
  }

  function stagePlaybookFor(scope = {}, mastery = null) {
    const current = lessonStageForSkill(mastery);
    const subskills = subskillChecklistFor(scope);
    const isMath = scope.section === "Math";
    if (isDesmosScope(scope)) {
      return [
        {
          stage: "Pre-SAT Grade 10",
          focus: "Learn the basic input grammar: equations, tables, function notation, zoom, and point reading.",
          drill: "Enter one linear equation, one quadratic, and one table; identify x-intercepts and y-intercepts.",
          pass: "Correctly read coordinates and explain what each coordinate means.",
        },
        {
          stage: "SAT Core",
          focus: "Use Desmos for equations, systems, roots, vertex questions, and data models when it saves time.",
          drill: "For 8 medium Math items, decide before solving: mental, algebra, or Desmos.",
          pass: "Reach 80%+ accuracy and choose the faster tool on at least 6 of 8 items.",
        },
        {
          stage: "SAT Transfer",
          focus: "Handle traps: wrong window, decimal approximations, parameter sliders, inequality regions, and answer format.",
          drill: "For each item, write the exact Desmos entry and the final non-Desmos verification.",
          pass: "Pass 5 mixed Desmos-helpful items without rounding or window mistakes.",
        },
        {
          stage: "SAT 1550-1600",
          focus: "Use Desmos as a verification and speed tool without becoming calculator-dependent.",
          drill: "Do hard/grid-in variants under target time; mark whether Desmos was fastest or only a check.",
          pass: "Pass 2 hard proof questions under target time with a second-method check.",
        },
      ].map((row) => ({ ...row, active: row.stage === current }));
    }
    return [
      {
        stage: "Pre-SAT Grade 10",
        focus: `Repair prerequisite language and notation for ${subskills[0] || "the core rule"}.`,
        drill: isMath ? "Do 3 untimed setup-only items before calculating." : "Write a one-sentence task translation before choices.",
        pass: "Explain the rule without notes and pass 3 easy checks.",
      },
      {
        stage: "SAT Core",
        focus: `Handle standard SAT wording for ${scope.skill || "this skill"}.`,
        drill: isMath ? "Solve 5 mixed easy/medium items with written setup." : "Solve 5 medium items and cite the proof phrase or grammar rule.",
        pass: "Reach 80%+ on medium items in two different contexts.",
      },
      {
        stage: "SAT Transfer",
        focus: `Recognize traps across ${subskills.slice(1, 3).join(" and ") || "changed contexts"}.`,
        drill: "For each item, name why the tempting wrong answer is wrong.",
        pass: "Pass 5 transfer items and explain every eliminated choice.",
      },
      {
        stage: "SAT 1550-1600",
        focus: "Convert the skill into fast, reliable proof under exam pressure.",
        drill: isMath ? "Do hard/grid-in variants under target time and verify by a second method." : "Do hard dual-text or rhetoric variants under target time.",
        pass: "Pass 2 hard proof items without slow_correct pacing.",
      },
    ].map((row) => ({ ...row, active: row.stage === current }));
  }

  function lessonCoverageAudit(taxonomy = []) {
    const rows = taxonomy.map((item) => {
      const lesson = item.lesson || {};
      const v2 = buildLessonV2(item, null, []);
      const checks = {
        concept: Boolean(v2.concept || lesson.rule),
        threeStepMethod: Array.isArray(v2.threeStepMethod) && v2.threeStepMethod.length >= 3,
        commonTraps: Array.isArray(v2.commonTraps) && v2.commonTraps.length >= 2,
        workedExample: Boolean(v2.workedExample || lesson.example),
        microCheck: Boolean(v2.microCheck || lesson.drill),
        scaffoldDrills: Array.isArray(v2.scaffoldDrills) && v2.scaffoldDrills.length >= 2,
        proofDrills: Array.isArray(v2.proofDrills) && v2.proofDrills.length >= 2,
        externalLinkTargets: Array.isArray(v2.externalLinkTargets) && v2.externalLinkTargets.length >= 1,
        aliases: Array.isArray(item.aliases) && item.aliases.length >= 2,
        subskills: subskillChecklistFor(item).length >= 4,
        stages: stagePlaybookFor(item).length === 4,
      };
      const passed = Object.values(checks).filter(Boolean).length;
      return {
        id: item.id,
        section: item.section,
        domain: item.domain,
        skill: item.skill,
        checks,
        score: Math.round((passed / Object.keys(checks).length) * 100),
        complete: passed === Object.keys(checks).length,
      };
    });
    return {
      total: rows.length,
      complete: rows.filter((row) => row.complete).length,
      averageScore: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0,
      missing: rows.filter((row) => !row.complete),
      rows,
    };
  }

  function lessonTrapsFor(scope = {}, mastery = null, helpers = {}) {
    const canonical = scope.canonicalMeta || helpers.canonicalKnowledgeFor?.(scope);
    const errorTagLabel = helpers.errorTagLabel || ((value) => value);
    if (canonical?.lesson?.traps?.length) {
      const traps = [...canonical.lesson.traps];
      if (mastery?.dominantErrorType && mastery.dominantErrorType !== "none") traps.unshift(`Personal pattern: ${errorTagLabel(mastery.dominantErrorType)}.`);
      return unique(traps).slice(0, 4);
    }

    const text = `${scope.section || ""} ${scope.domain || ""} ${scope.skill || ""}`;
    const traps = [];
    if (scope.section === "Math") {
      traps.push("Choosing an answer that solves an intermediate step, not the final ask.");
      if (hasAny(text, ["percent", "ratio", "rate", "probability", "data"])) traps.push("Using the wrong base total or mixing units.");
      if (hasAny(text, ["linear", "slope", "function"])) traps.push("Reversing rise/run or missing the sign of the rate.");
      if (hasAny(text, ["quadratic", "polynomial"])) traps.push("Factoring correctly but selecting the wrong requested root/value.");
      if (hasAny(text, ["geometry", "circle", "triangle", "area", "volume", "trigonometry"])) traps.push("Confusing radius with diameter, side with hypotenuse, or area with perimeter.");
    } else {
      traps.push("Choosing a choice that sounds related but is not proven by the text.");
      if (hasAny(text, ["transition", "expression"])) traps.push("Matching tone instead of the logical relationship between sentences.");
      if (hasAny(text, ["boundaries", "punctuation", "standard english"])) traps.push("Joining two independent clauses with only a comma.");
      if (hasAny(text, ["vocabulary", "words in context", "craft"])) traps.push("Using the most familiar meaning of a word instead of the context meaning.");
      if (hasAny(text, ["cross", "text", "evidence", "inference"])) traps.push("Answering from one text only when the task asks for the relationship between texts.");
    }
    if (mastery?.dominantErrorType && mastery.dominantErrorType !== "none") {
      traps.unshift(`Personal pattern: ${errorTagLabel(mastery.dominantErrorType)}.`);
    }
    return unique(traps).slice(0, 4);
  }

  function lessonExampleFor(scope = {}, helpers = {}) {
    const canonical = scope.canonicalMeta || helpers.canonicalKnowledgeFor?.(scope);
    if (canonical?.lesson?.example) return canonical.lesson.example;
    const text = `${scope.section || ""} ${scope.domain || ""} ${scope.skill || ""}`;
    if (hasAny(text, ["linear equation", "equation", "inequality"])) return "Example: If 3x + 5 = 17, isolate x by subtracting 5, then divide by 3.";
    if (hasAny(text, ["slope", "linear function"])) return "Example: From (2, 5) to (6, 13), slope = change in y / change in x = 8 / 4 = 2.";
    if (hasAny(text, ["percent", "ratio", "rate"])) return "Example: A 20% increase from 50 means new value = 50 x 1.20 = 60.";
    if (hasAny(text, ["quadratic", "polynomial"])) return "Example: x^2 - 5x + 6 = 0 factors to (x - 2)(x - 3) = 0.";
    if (hasAny(text, ["geometry", "circle", "triangle", "area", "volume", "trigonometry"])) return "Example: If a circle has diameter 10, radius is 5 before using area = pi r^2.";
    if (hasAny(text, ["transition", "expression"])) return "Example: If sentence 2 contradicts sentence 1, a contrast transition such as however is usually needed.";
    if (hasAny(text, ["boundaries", "punctuation", "standard english"])) return "Example: Two complete clauses need a period, semicolon, or comma plus FANBOYS.";
    if (hasAny(text, ["vocabulary", "words in context"])) return "Example: Replace the target word with a simple meaning from nearby clues before checking choices.";
    if (hasAny(text, ["cross", "text"])) return "Example: Text 1 makes a claim; Text 2 can support, challenge, or refine that claim.";
    return "Example: State the exact task, find the proof in the text or calculation, then eliminate choices that answer a different question.";
  }

  function normalizeLessonSteps(steps = [], scope = {}) {
    const fallback = scope.section === "Math"
      ? [
          ["1. Identify", "Write the given values, target variable, and relevant formula or equation."],
          ["2. Solve", "Do one clean algebra, arithmetic, or geometry step at a time."],
          ["3. Verify", "Check units, signs, answer format, and whether the result answers the exact question."],
        ]
      : [
          ["1. Translate", "Restate the task before reading the answer choices."],
          ["2. Prove", "Find the exact sentence, clue, or grammar rule that forces the answer."],
          ["3. Eliminate", "Reject choices that are true but answer a different task."],
        ];
    const normalized = Array.isArray(steps)
      ? steps
          .map((step, index) => {
            if (Array.isArray(step)) return [step[0] || fallback[index]?.[0] || `Step ${index + 1}`, step[1] || fallback[index]?.[1] || ""];
            if (step && typeof step === "object") return [step.label || step.title || fallback[index]?.[0] || `Step ${index + 1}`, step.body || step.detail || fallback[index]?.[1] || ""];
            return null;
          })
          .filter(Boolean)
      : [];
    return [...normalized, ...fallback].slice(0, 3);
  }

  function drillQuestionSummary(question = {}) {
    return {
      id: question.id || "",
      difficulty: question.difficulty || "Mixed",
      sourceType: question.sourceType || "",
      type: question.questionType || question.type || "multiple_choice",
    };
  }

  function lessonDrillPlanFor(scope = {}, questions = [], helpers = {}) {
    if (isDesmosScope(scope)) {
      return {
        scaffoldDrills: [
          {
            id: "desmos-input-lab",
            title: "Desmos input lab",
            target: "tool_fluency",
            count: 8,
            instructions: "Enter equations, systems, tables, and function notation; record the exact screen feature used.",
            questionIds: [],
            items: [],
          },
          {
            id: "desmos-decision-drill",
            title: "Desmos or algebra decision drill",
            target: "pacing_judgment",
            count: 10,
            instructions: "Before solving, label each item as mental, algebra, Desmos-first, or Desmos-check.",
            questionIds: [],
            items: [],
          },
        ],
        proofDrills: [
          {
            id: "desmos-transfer-proof",
            title: "Mixed Desmos transfer proof",
            passCondition: "Correctly solve 6 mixed Math items and justify when Desmos was or was not the fastest tool.",
            count: 6,
            instructions: "Include at least one system, one quadratic, one data model, one percent/rate item, and one SPR item.",
            questionIds: [],
            items: [],
          },
          {
            id: "desmos-anti-dependence-proof",
            title: "No-calculator faster proof",
            passCondition: "Correctly identify 4 items where algebra or mental math beats Desmos.",
            count: 4,
            instructions: "Explain the faster non-Desmos route, then use Desmos only as a verification if needed.",
            questionIds: [],
            items: [],
          },
        ],
      };
    }
    const isStudyAvailableQuestion = helpers.isStudyAvailableQuestion || ((question) => question?.reviewStatus !== "rejected");
    const available = (Array.isArray(questions) ? questions : []).filter((question) => question && question.reviewStatus !== "rejected" && isStudyAvailableQuestion(question));
    const easyMedium = available.filter((question) => ["Easy", "Medium"].includes(question.difficulty));
    const hardOrGrid = available.filter((question) => question.difficulty === "Hard" || ["student_produced_response", "grid_in", "numeric", "SPR"].includes(question.questionType || question.type));
    const skill = scope.skill || "this skill";
    const scaffoldItems = easyMedium.slice(0, 3).map(drillQuestionSummary);
    const proofItems = hardOrGrid.slice(0, 2).map(drillQuestionSummary);
    return {
      scaffoldDrills: [
        {
          id: "scaffold-foundation",
          title: `Foundation scaffold for ${skill}`,
          target: "accuracy_before_speed",
          count: Math.max(3, scaffoldItems.length || 3),
          instructions: scope.section === "Math"
            ? "Solve without a timer first; write setup, calculation, and answer check."
            : "Write the task translation and proof phrase before checking choices.",
          questionIds: scaffoldItems.map((item) => item.id).filter(Boolean),
          items: scaffoldItems,
        },
        {
          id: "scaffold-trap-check",
          title: "Trap check",
          target: "error_awareness",
          count: 2,
          instructions: "For each item, name the likely trap before submitting.",
          questionIds: easyMedium.slice(3, 5).map((item) => item.id).filter(Boolean),
          items: easyMedium.slice(3, 5).map(drillQuestionSummary),
        },
      ],
      proofDrills: [
        {
          id: "proof-transfer",
          title: `Transfer proof for ${skill}`,
          passCondition: "Correct without slow_correct pacing on a fresh same-skill item.",
          count: Math.max(1, proofItems.length || 1),
          instructions: "Use a fresh context; do not reuse the original missed skeleton as the first proof.",
          questionIds: proofItems.map((item) => item.id).filter(Boolean),
          items: proofItems,
        },
        {
          id: "proof-timed",
          title: "Timed proof",
          passCondition: "Pass 2 hard or grid-in items under target time.",
          count: 2,
          instructions: "Run only after the scaffold drill is clean.",
          questionIds: hardOrGrid.slice(2, 4).map((item) => item.id).filter(Boolean),
          items: hardOrGrid.slice(2, 4).map(drillQuestionSummary),
        },
      ],
    };
  }

  function externalLinkTargetsFor(scope = {}) {
    const targets = [
      {
        provider: "Khan Academy",
        intent: scope.section === "Math" ? "sat-math-lesson-practice" : "digital-sat-reading-writing",
        match: `${scope.domain || "All"} / ${scope.skill || "All"}`,
      },
      {
        provider: "College Board Bluebook",
        intent: "official-practice",
        match: "Link out to official practice; store only progress metadata.",
      },
    ];
    if (scope.section === "Math") {
      targets.push({ provider: "Desmos", intent: "math-tool", match: "Use for calculator-allowed algebra, functions, and modeling checks when appropriate." });
    }
    if (isDesmosScope(scope)) {
      targets.push(
        { provider: "Desmos", intent: "graphing-calculator", match: "Practice equation, table, slider, regression, and intersection workflows." },
        { provider: "College Board Bluebook", intent: "official-tool-context", match: "Practice with the embedded calculator environment before test day." },
      );
    }
    return targets;
  }

  function buildLessonV2(scope = {}, mastery = null, questions = [], helpers = {}) {
    const canonical = scope.canonicalMeta || helpers.canonicalKnowledgeFor?.(scope);
    const base = lessonFromKnowledgeMeta(canonical, scope);
    const drillPlan = lessonDrillPlanFor(scope, questions, helpers);
    return {
      version: "lesson-library-v2-2026-05-19",
      key: scope.key || `${scope.section || "All"}|${scope.domain || "All"}|${scope.skill || "All"}`,
      stage: lessonStageForSkill(mastery),
      section: scope.section || "All",
      domain: scope.domain || "All",
      skill: scope.skill || "All",
      concept: base.rule || "Use the exact SAT task, prove the answer, and avoid answer-choice traps.",
      threeStepMethod: normalizeLessonSteps(base.steps, scope),
      commonTraps: base.traps?.length ? base.traps : lessonTrapsFor(scope, mastery, helpers),
      workedExample: base.example || lessonExampleFor(scope, helpers),
      microCheck: base.drill || "What proves the answer directly?",
      subskills: subskillChecklistFor(scope),
      ladder: lessonLadderFor(mastery),
      stagePlaybook: stagePlaybookFor(scope, mastery),
      scaffoldDrills: drillPlan.scaffoldDrills,
      proofDrills: drillPlan.proofDrills,
      externalLinkTargets: externalLinkTargetsFor(scope),
    };
  }

  function buildLessonScaffold(scope = {}, questions = [], helpers = {}) {
    const scopeCanonical = scope.canonicalMeta || helpers.canonicalKnowledgeFor?.(scope);
    const isStudyAvailableQuestion = helpers.isStudyAvailableQuestion || ((question) => question?.reviewStatus !== "rejected");
    const canonicalKnowledgeFor = helpers.canonicalKnowledgeFor || (() => null);
    const candidates = questions.filter((question) => {
      const sameCanonical = scopeCanonical && canonicalKnowledgeFor(question)?.id === scopeCanonical.id;
      const sameRaw = question.section === scope.section && question.domain === scope.domain && question.skill === scope.skill;
      return (sameCanonical || sameRaw) && question.reviewStatus !== "rejected" && isStudyAvailableQuestion(question);
    });
    const picked = [];
    ["Easy", "Medium", "Hard"].forEach((difficulty) => {
      candidates
        .filter((question) => question.difficulty === difficulty)
        .slice(0, 2)
        .forEach((question) => {
          if (!picked.some((item) => item.id === question.id)) picked.push(question);
        });
    });
    candidates.forEach((question) => {
      if (picked.length < 6 && !picked.some((item) => item.id === question.id)) picked.push(question);
    });
    return picked.slice(0, 6);
  }

  function proofDifficultyOrder(question = {}, attempt = {}) {
    const original = question.difficulty || "Medium";
    const errorType = attempt?.errorType || attempt?.pacingFlag || "";
    if (["knowledge_gap", "skipped", "vocab"].includes(errorType)) {
      return original === "Hard" ? ["Medium", "Hard", "Easy"] : ["Medium", "Easy", "Hard"];
    }
    if (["slow_correct", "time_pressure"].includes(errorType)) {
      return unique([original, "Medium", "Easy", "Hard"]);
    }
    if (["trap_answer", "evidence", "misread_prompt"].includes(errorType)) {
      return original === "Easy" ? ["Medium", "Hard", "Easy"] : unique([original, "Hard", "Medium", "Easy"]);
    }
    return original === "Easy" ? ["Medium", "Easy", "Hard"] : unique([original, "Medium", "Hard", "Easy"]);
  }

  function isSameProofScope(question = {}, candidate = {}, helpers = {}) {
    const canonicalKnowledgeFor = helpers.canonicalKnowledgeFor || (() => null);
    const questionMeta = canonicalKnowledgeFor(question);
    const candidateMeta = canonicalKnowledgeFor(candidate);
    if (questionMeta?.id && candidateMeta?.id) return questionMeta.id === candidateMeta.id;
    const lessonScopeKey = helpers.lessonScopeKey || ((scope) => `${scope?.section || ""}|${scope?.domain || ""}|${scope?.skill || ""}`);
    return lessonScopeKey(question) === lessonScopeKey(candidate);
  }

  function chooseProofQuestionForAttempt(question, attempt = {}, questions = [], helpers = {}) {
    if (!question || !Array.isArray(questions) || !questions.length) return null;
    const skeletonId = helpers.skeletonId || ((item) => item?.id || "");
    const sourcePriority = helpers.sourcePriority || (() => 10);
    const isStudyAvailableQuestion = helpers.isStudyAvailableQuestion || ((item) => item?.reviewStatus !== "rejected");
    const attemptedIds = helpers.attemptedIds instanceof Set ? helpers.attemptedIds : new Set(helpers.attemptedIds || []);
    const originalSkeleton = skeletonId(question);
    const difficultyOrder = proofDifficultyOrder(question, attempt);

    return questions
      .filter((candidate) => {
        if (!candidate || candidate.id === question.id) return false;
        if (candidate.reviewStatus === "rejected" || candidate.practicePool === "hidden_duplicate") return false;
        if (!isStudyAvailableQuestion(candidate)) return false;
        return isSameProofScope(question, candidate, helpers);
      })
      .sort((a, b) => {
        const skeletonScore = Number(skeletonId(a) === originalSkeleton) - Number(skeletonId(b) === originalSkeleton);
        if (skeletonScore) return skeletonScore;
        const attemptedScore = Number(attemptedIds.has(a.id)) - Number(attemptedIds.has(b.id));
        if (attemptedScore) return attemptedScore;
        const difficultyScore = (difficultyOrder.indexOf(a.difficulty) === -1 ? 9 : difficultyOrder.indexOf(a.difficulty)) - (difficultyOrder.indexOf(b.difficulty) === -1 ? 9 : difficultyOrder.indexOf(b.difficulty));
        if (difficultyScore) return difficultyScore;
        const sourceScore = sourcePriority(a) - sourcePriority(b);
        if (sourceScore) return sourceScore;
        return String(a.id || "").localeCompare(String(b.id || ""));
      })[0] || null;
  }

  return {
    buildLessonV2,
    buildLessonScaffold,
    chooseProofQuestionForAttempt,
    externalLinkTargetsFor,
    hasAny,
    isDesmosScope,
    lessonExampleFor,
    lessonCoverageAudit,
    lessonDrillPlanFor,
    lessonFromKnowledgeMeta,
    lessonLadderFor,
    lessonStageForSkill,
    lessonTrapsFor,
    normalizeText,
    stagePlaybookFor,
    subskillChecklistFor,
    unique,
  };
});
