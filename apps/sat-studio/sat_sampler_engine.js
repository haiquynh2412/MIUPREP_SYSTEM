(function initSatSamplerEngine(root, factory) {
  const samplerEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = samplerEngine;
  }
  if (root) {
    root.SatSamplerEngine = samplerEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatSamplerEngine() {
  const DIFFICULTIES = ["Easy", "Medium", "Hard"];
  const SAT_MATH_DOMAIN_WEIGHTS = {
    Algebra: 0.35,
    "Advanced Math": 0.35,
    "Problem-Solving and Data Analysis": 0.15,
    "Geometry and Trigonometry": 0.15,
  };
  const SAT_RW_DOMAIN_WEIGHTS = {
    "Information and Ideas": 0.26,
    "Craft and Structure": 0.28,
    "Expression of Ideas": 0.20,
    "Standard English Conventions": 0.26,
  };
  const SAT_BLUEPRINT_DOMAIN_WEIGHTS = Object.freeze({
    Math: Object.freeze({ ...SAT_MATH_DOMAIN_WEIGHTS }),
    "Reading and Writing": Object.freeze({ ...SAT_RW_DOMAIN_WEIGHTS }),
  });

  function normalizeRoute(route = "standard") {
    if (route === "foundation" || route === "easy") return "easy";
    if (route === "hard") return "hard";
    return "standard";
  }

  function difficultyWeightsForRoute(route = "standard") {
    const normalized = normalizeRoute(route);
    if (normalized === "easy") return { Easy: 0.55, Medium: 0.40, Hard: 0.05 };
    if (normalized === "hard") return { Easy: 0.05, Medium: 0.40, Hard: 0.55 };
    return { Easy: 0.25, Medium: 0.50, Hard: 0.25 };
  }

  function weightedCounts(total = 0, weights = {}) {
    const count = Math.max(0, Math.floor(Number(total) || 0));
    const entries = Object.entries(weights).filter(([, weight]) => Number(weight) > 0);
    if (!count || !entries.length) return {};
    const raw = entries.map(([key, weight]) => {
      const value = count * Number(weight);
      return { key, floor: Math.floor(value), remainder: value - Math.floor(value) };
    });
    const result = Object.fromEntries(raw.map((item) => [item.key, item.floor]));
    let remaining = count - raw.reduce((sum, item) => sum + item.floor, 0);
    raw
      .sort((a, b) => b.remainder - a.remainder || a.key.localeCompare(b.key))
      .forEach((item) => {
        if (remaining > 0) {
          result[item.key] += 1;
          remaining -= 1;
        }
      });
    return result;
  }

  function difficultyQuotas(count = 0, route = "standard") {
    return weightedCounts(count, difficultyWeightsForRoute(route));
  }

  function domainWeightsForSection(section = "") {
    return SAT_BLUEPRINT_DOMAIN_WEIGHTS[section] || {};
  }

  function buildDomainBlueprint({ section = "", total = 0, weights = null } = {}) {
    const sourceWeights = weights && Object.keys(weights).length ? weights : domainWeightsForSection(section);
    return Object.entries(weightedCounts(total, sourceWeights)).map(([domain, count]) => ({
      section,
      domain,
      count,
    }));
  }

  function defaultTopicKey(question = {}) {
    const skeleton =
      question.skeletonDiversity?.skeletonId ||
      question.skeletonId ||
      question.templateId ||
      String(question.prompt || "")
        .toLowerCase()
        .replace(/\d+(?:\.\d+)?/g, "#")
        .replace(/\s+/g, " ")
        .slice(0, 90);
    return [question.section || "", question.domain || "", question.skill || "", skeleton].join("|");
  }

  function defaultRanker(a = {}, b = {}) {
    const sourcePriority = { reviewed: 0, foundation: 1, original: 2, sat_1590: 3, sat_king: 4, antigravity: 5, ai_generated: 6, opensat: 7, private_vault: 8 };
    const sourceScore =
      (sourcePriority[a.reviewStatus] ?? sourcePriority[a.sourceType] ?? 9) -
      (sourcePriority[b.reviewStatus] ?? sourcePriority[b.sourceType] ?? 9);
    if (sourceScore) return sourceScore;
    return String(a.id || "").localeCompare(String(b.id || ""));
  }

  function selectDiverse(candidates = [], count = 0, options = {}) {
    const target = Math.max(0, Number(count) || 0);
    const topicKey = typeof options.topicKey === "function" ? options.topicKey : defaultTopicKey;
    const maxPerTopic = Math.max(1, Number(options.maxPerTopic || 1));
    const topicCounts = options.topicCounts instanceof Map ? options.topicCounts : new Map();
    const selected = [];
    const seenTopics = new Set(options.seenTopics || []);
    seenTopics.forEach((key) => {
      if (!topicCounts.has(key)) topicCounts.set(key, maxPerTopic);
    });
    const markTopic = (candidate) => {
      const key = topicKey(candidate);
      topicCounts.set(key, (topicCounts.get(key) || 0) + 1);
      seenTopics.add(key);
    };
    candidates.forEach((candidate) => {
      if (selected.length >= target) return;
      const key = topicKey(candidate);
      if ((topicCounts.get(key) || 0) >= maxPerTopic) return;
      selected.push(candidate);
      markTopic(candidate);
    });
    if (options.allowTopicOverflow !== false) {
      candidates.forEach((candidate) => {
        if (selected.length >= target) return;
        if (!selected.some((item) => item.id === candidate.id)) {
          selected.push(candidate);
          markTopic(candidate);
        }
      });
    }
    return selected;
  }

  function selectByDifficultyQuotas(candidates = [], count = 0, route = "standard", options = {}) {
    const target = Math.max(0, Number(count) || 0);
    const quotas = difficultyQuotas(target, route);
    const ranker = typeof options.ranker === "function" ? options.ranker : defaultRanker;
    const selected = [];
    const used = new Set(options.usedIds || []);
    const seenTopics = new Set(options.seenTopics || []);
    const topicCounts = options.topicCounts instanceof Map ? options.topicCounts : new Map();
    const routeOrder =
      normalizeRoute(route) === "hard"
        ? ["Hard", "Medium", "Easy"]
        : normalizeRoute(route) === "easy"
          ? ["Easy", "Medium", "Hard"]
          : ["Medium", "Easy", "Hard"];

    routeOrder.forEach((difficulty) => {
      const quota = quotas[difficulty] || 0;
      if (!quota) return;
      const pool = candidates.filter((question) => question.difficulty === difficulty && !used.has(question.id)).sort(ranker);
      selectDiverse(pool, quota, { ...options, seenTopics, topicCounts }).forEach((question) => {
        if (selected.length >= target || used.has(question.id)) return;
        selected.push(question);
        used.add(question.id);
        seenTopics.add((options.topicKey || defaultTopicKey)(question));
      });
    });

    if (selected.length < target) {
      selectDiverse(
        candidates.filter((question) => !used.has(question.id)).sort(ranker),
        target - selected.length,
        { ...options, seenTopics, topicCounts },
      ).forEach((question) => {
        if (selected.length >= target || used.has(question.id)) return;
        selected.push(question);
        used.add(question.id);
        seenTopics.add((options.topicKey || defaultTopicKey)(question));
      });
    }
    return selected;
  }

  function selectQuestionsByBlueprint(questions = [], blueprint = [], options = {}) {
    const target =
      Number(options.target) ||
      blueprint.reduce((sum, slot) => sum + (Number(slot.count) || 0), 0);
    const ranker = typeof options.ranker === "function" ? options.ranker : defaultRanker;
    const used = new Set(options.usedIds || []);
    const seenTopics = new Set();
    const topicCounts = new Map();
    const selected = [];
    const route = normalizeRoute(options.route || "standard");
    const baseSlots = Array.isArray(blueprint) ? blueprint : [];
    const slots = baseSlots.length || !target || !options.section ? baseSlots : buildDomainBlueprint({ section: options.section, total: target });

    slots.forEach((slot) => {
      const slotCount = Number(slot.count) || 0;
      if (!slotCount) return;
      const candidates = questions
        .filter((question) => {
          if (!question || used.has(question.id)) return false;
          if (slot.section && question.section !== slot.section) return false;
          if (slot.domain && question.domain !== slot.domain) return false;
          if (slot.skill && question.skill !== slot.skill) return false;
          return true;
        })
        .sort(ranker);
      selectByDifficultyQuotas(candidates, slotCount, route, { ...options, usedIds: used, seenTopics, topicCounts, ranker }).forEach((question) => {
        if (selected.length >= target || used.has(question.id)) return;
        selected.push(question);
        used.add(question.id);
        seenTopics.add((options.topicKey || defaultTopicKey)(question));
      });
    });

    if (selected.length < target) {
      const fallback = questions
        .filter((question) => question && !used.has(question.id) && (!options.section || question.section === options.section))
        .sort(ranker);
      selectDiverse(fallback, target - selected.length, { ...options, seenTopics, topicCounts }).forEach((question) => {
        if (selected.length >= target || used.has(question.id)) return;
        selected.push(question);
        used.add(question.id);
      });
    }
    return selected;
  }

  function countBy(rows = [], keyFn = () => "") {
    return rows.reduce((acc, row) => {
      const key = keyFn(row) || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function topicRepetitionReport(rows = [], options = {}) {
    const topicKey = typeof options.topicKey === "function" ? options.topicKey : defaultTopicKey;
    const cap = Math.max(1, Number(options.maxPerTopic || 1));
    const counts = countBy(rows, topicKey);
    const repeated = Object.entries(counts)
      .filter(([, count]) => count > cap)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([key, count]) => ({ key, count, overflow: count - cap }));
    return {
      cap,
      maxTopicCount: Math.max(0, ...Object.values(counts)),
      repeatedTopicCount: repeated.length,
      repeated,
    };
  }

  function isGridIn(question = {}) {
    return ["student_produced_response", "grid_in", "numeric"].includes(question.questionType || question.type);
  }

  function toolTags(question = {}) {
    const text = [
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
      .join(" ")
      .toLowerCase();
    return {
      calculatorRequired: /calculator_required|calc_required/.test(text),
      noCalculator: /no_calculator|non_calculator|mental_math/.test(text),
      desmosRecommended: /desmos|graphing/.test(text),
    };
  }

  function buildSelectionAudit(selected = [], blueprint = [], options = {}) {
    const mathRows = selected.filter((question) => question.section === "Math");
    const topicReport = topicRepetitionReport(selected, { topicKey: options.topicKey, maxPerTopic: options.maxPerTopic || 1 });
    const repeatedTopicCount = topicReport.repeatedTopicCount;
    const mathGridIn = mathRows.filter(isGridIn).length;
    const targetGridIn = Math.round(mathRows.length * 0.25);
    const toolSummary = selected.reduce(
      (acc, question) => {
        const tags = toolTags(question);
        if (tags.calculatorRequired) acc.calculatorRequired += 1;
        if (tags.noCalculator) acc.noCalculator += 1;
        if (tags.desmosRecommended) acc.desmosRecommended += 1;
        return acc;
      },
      { calculatorRequired: 0, noCalculator: 0, desmosRecommended: 0 },
    );
    const warnings = [];
    const blueprintQuotaDeltas = (Array.isArray(blueprint) ? blueprint : []).map((slot) => {
      const expected = Number(slot.count) || 0;
      const actual = selected.filter((question) => {
        if (slot.section && question.section !== slot.section) return false;
        if (slot.domain && question.domain !== slot.domain) return false;
        if (slot.skill && question.skill !== slot.skill) return false;
        return true;
      }).length;
      return {
        section: slot.section || "",
        domain: slot.domain || "",
        skill: slot.skill || "",
        expected,
        actual,
        delta: actual - expected,
      };
    });
    blueprintQuotaDeltas
      .filter((item) => item.expected >= 3 && Math.abs(item.delta) > 1)
      .forEach((item) => warnings.push(`Blueprint quota drift: ${item.section}/${item.domain || "All"} expected ${item.expected}, selected ${item.actual}.`));
    if (mathRows.length >= 8 && Math.abs(mathGridIn - targetGridIn) > 2) {
      warnings.push(`Math grid-in balance is ${mathGridIn}/${mathRows.length}; target is near ${targetGridIn}.`);
    }
    if (repeatedTopicCount) warnings.push(`${repeatedTopicCount} topic/skeleton cluster(s) exceed cap ${topicReport.cap}.`);

    return {
      version: "sat_sampler_audit_v1",
      expectedCount: Number(options.target) || blueprint.reduce((sum, slot) => sum + (Number(slot.count) || 0), 0),
      selectedCount: selected.length,
      route: normalizeRoute(options.route || "standard"),
      bySection: countBy(selected, (question) => question.section),
      byDomain: countBy(selected, (question) => question.domain),
      byDifficulty: countBy(selected, (question) => question.difficulty),
      mathGridIn,
      targetGridIn,
      toolSummary,
      topicCap: topicReport.cap,
      maxTopicCount: topicReport.maxTopicCount,
      repeatedTopicCount,
      blueprintQuotaDeltas,
      warnings,
    };
  }

  function blueprintGapAnalysis(questions = [], blueprint = []) {
    const available = countBy(questions, (question) => `${question.section}|${question.domain}`);
    return blueprint.map((slot) => {
      const key = `${slot.section}|${slot.domain}`;
      const required = Number(slot.count) || 0;
      const ready = available[key] || 0;
      return {
        section: slot.section || "",
        domain: slot.domain || "",
        required,
        ready,
        deficit: Math.max(0, required - ready),
      };
    });
  }

  return {
    SAT_MATH_DOMAIN_WEIGHTS,
    SAT_RW_DOMAIN_WEIGHTS,
    SAT_BLUEPRINT_DOMAIN_WEIGHTS,
    normalizeRoute,
    domainWeightsForSection,
    buildDomainBlueprint,
    difficultyWeightsForRoute,
    weightedCounts,
    difficultyQuotas,
    defaultTopicKey,
    selectDiverse,
    selectByDifficultyQuotas,
    selectQuestionsByBlueprint,
    topicRepetitionReport,
    buildSelectionAudit,
    blueprintGapAnalysis,
  };
});
