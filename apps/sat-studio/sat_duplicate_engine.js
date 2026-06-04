(function initSatStudioDuplicateEngine(root, factory) {
  const duplicateEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = duplicateEngine;
  }
  if (root) {
    root.SatDuplicateEngine = duplicateEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioDuplicateEngine() {
  const GENERATED_SOURCE_TYPES = new Set(["ai_generated", "antigravity", "sat_king", "sat_1590"]);
  const SOURCE_PRIORITY = {
    sat_1590: 0,
    sat_king: 1,
    antigravity: 2,
    ai_generated: 3,
    original: 4,
    foundation: 5,
    opensat: 6,
    private_vault: 7,
  };

  function isGridInQuestion(question = {}) {
    return ["student_produced_response", "grid_in", "numeric"].includes(question?.questionType);
  }

  function normalizeStudentAnswer(value) {
    return String(value ?? "")
      .trim()
      .replace(/[\u2212\u2013\u2014]/g, "-")
      .replace(/,/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function parseStudentNumber(value) {
    const normalized = normalizeStudentAnswer(value);
    if (/^-?\d+\/-?\d+$/.test(normalized)) {
      const [top, bottom] = normalized.split("/").map(Number);
      if (!bottom) return null;
      return top / bottom;
    }
    if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return Number(normalized);
    return null;
  }

  function getCorrectAnswerLabel(question = {}) {
    if (!question) return "";
    if (isGridInQuestion(question)) {
      return String((question.acceptableAnswers || [question.correctAnswer]).filter(Boolean)[0] || question.correctAnswer || "");
    }
    return String(question.correctAnswer || "");
  }

  function practicePool(question = {}) {
    return question?.practicePool || question?.skeletonDiversity?.practicePool || "core_pool";
  }

  function stableSkeletonId(key) {
    let value = 2166136261;
    String(key || "")
      .split("")
      .forEach((char) => {
        value ^= char.charCodeAt(0);
        value = Math.imul(value, 16777619) >>> 0;
      });
    return `skel-${value.toString(16).padStart(8, "0")}`;
  }

  function normalizeSkeletonText(prompt = "") {
    return String(prompt || "")
      .toLowerCase()
      .replace(/[\u2265]/g, ">=")
      .replace(/[\u2264]/g, "<=")
      .replace(/[\u2212]/g, "-")
      .replace(/\btext\s*1\b/g, "text one")
      .replace(/\btext\s*2\b/g, "text two")
      .replace(/\$?\b\d+(?:,\d{3})*(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?%?/g, "#")
      .replace(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/g, "@month")
      .replace(/\b[a-z]\b(?=\s*[=+\-*/^<>()])/g, "v")
      .replace(/(?<=[=+\-*/^<>()])\s*\b[a-z]\b/g, " v")
      .replace(/\bf\(#\)|g\(#\)|h\(#\)/g, "f(#)")
      .replace(/\b[a-z]\(\s*v\s*\)/g, "f(v)")
      .replace(/\b(point|set|case|site|sample|trial|group|plan|route|project) [a-z]\b/g, "$1 @")
      .replace(/\b[a-z][a-z]+(?:ian|son|ton|ley|man|berg|ez|ski|ova|ov)\b/g, "@name")
      .replace(/\s*([,.;:?!()=+\-*/<>])\s*/g, " $1 ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function questionSkeletonKey(question = {}) {
    return [
      question?.difficulty || "",
      question?.section || "",
      question?.domain || "",
      question?.skill || "",
      question?.questionType || "multiple_choice",
      normalizeSkeletonText(question?.prompt || ""),
    ].join("|");
  }

  function skeletonId(question = {}) {
    return question?.skeletonDiversity?.skeletonId || stableSkeletonId(questionSkeletonKey(question));
  }

  function skeletonPolicyLimits(difficulty) {
    const core = { Easy: 3, Medium: 5, Hard: 8 };
    const active = { Easy: 10, Medium: 10, Hard: 10 };
    return {
      coreLimit: core[difficulty] || 5,
      activeLimit: active[difficulty] || 10,
    };
  }

  function numbersInText(text = "") {
    return [...String(text || "").matchAll(/-?\d+(?:,\d{3})*(?:\.\d+)?/g)]
      .map((match) => Number(match[0].replace(/,/g, "")))
      .filter(Number.isFinite);
  }

  function duplicateAnswerRoundnessScore(question = {}) {
    const answer = getCorrectAnswerLabel(question);
    const value = parseStudentNumber(answer);
    if (value === null) {
      if (String(answer).includes("/")) return 2;
      if (/pi|\u03c0/i.test(String(answer))) return 1;
      return 3;
    }
    if (Math.abs(value - Math.round(value)) < 1e-9) {
      const n = Math.abs(Math.round(value));
      if (n <= 100 && (n <= 20 || n % 5 === 0)) return 0;
      return n <= 500 ? 1 : 2;
    }
    if (Math.abs(value * 2 - Math.round(value * 2)) < 1e-9) return 1;
    if (Math.abs(value * 4 - Math.round(value * 4)) < 1e-9 || Math.abs(value * 10 - Math.round(value * 10)) < 1e-9) return 2;
    return 4;
  }

  function duplicateCalculationEaseScore(question = {}) {
    if (question?.section !== "Math") return duplicateAnswerRoundnessScore(question);
    const values = numbersInText(question.prompt || "");
    let score = duplicateAnswerRoundnessScore(question);
    if (values.length <= 4) score -= 1;
    else if (values.length >= 9) score += 2;
    if (values.length) {
      const largest = Math.max(...values.map((value) => Math.abs(value)));
      if (largest <= 50) score -= 1;
      else if (largest > 500) score += 2;
      if (values.some((value) => Math.abs(value - Math.round(value)) > 1e-9)) score += 2;
    }
    return Math.max(0, score);
  }

  function skeletonPolicySortValue(question = {}) {
    const typePriority = isGridInQuestion(question) ? 0 : 1;
    const explanationWords = String(question?.explanation || "").split(/\s+/).filter(Boolean).length;
    return [
      duplicateCalculationEaseScore(question),
      -Math.min(explanationWords, 160),
      SOURCE_PRIORITY[question?.sourceType] ?? 9,
      typePriority,
      String(question?.id || ""),
    ];
  }

  function compareSkeletonPolicyQuestions(a, b) {
    const left = skeletonPolicySortValue(a);
    const right = skeletonPolicySortValue(b);
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] < right[index]) return -1;
      if (left[index] > right[index]) return 1;
    }
    return 0;
  }

  function duplicateScanQuestionPool(questions = [], scope = "generated") {
    const sourceSet = scope === "all_visible" ? null : GENERATED_SOURCE_TYPES;
    return questions.filter((question) => {
      if (question.reviewStatus === "rejected") return false;
      if (sourceSet && !sourceSet.has(question.sourceType)) return false;
      return Boolean(question.prompt && question.skill && question.difficulty);
    });
  }

  function topicScanKey(question = {}) {
    return [
      question.section || "Unknown",
      question.domain || "Unknown",
      question.skill || "Unknown",
      question.difficulty || "Medium",
      question.questionType || "multiple_choice",
    ].join("|");
  }

  function topicScanLabel(key, labelFor = (value) => value) {
    const [section, domain, skill, difficulty, type] = String(key).split("|");
    return `${section} / ${domain} / ${skill} / ${difficulty} / ${labelFor(type || "multiple_choice")}`;
  }

  function countBy(items = [], key) {
    return items.reduce((acc, item) => {
      const value = item?.[key] || "unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function buildDuplicateSkeletonScan(questions = [], { scope = "generated", apply = false, labelFor } = {}) {
    const scanQuestions = duplicateScanQuestionPool(questions, scope);
    const topics = new Map();
    scanQuestions.forEach((question) => {
      const topicKey = topicScanKey(question);
      if (!topics.has(topicKey)) topics.set(topicKey, []);
      topics.get(topicKey).push(question);
    });

    const rows = [];
    const poolCounts = { core_pool: 0, remedial_pool: 0, hidden_duplicate: 0 };
    let skeletonCount = 0;

    [...topics.entries()].forEach(([topicKey, topicQuestions]) => {
      const skeletonGroups = new Map();
      topicQuestions.forEach((question) => {
        const key = questionSkeletonKey(question);
        if (!skeletonGroups.has(key)) skeletonGroups.set(key, []);
        skeletonGroups.get(key).push(question);
      });

      skeletonCount += skeletonGroups.size;

      [...skeletonGroups.entries()].forEach(([key, group]) => {
        const ranked = [...group].sort(compareSkeletonPolicyQuestions);
        const sample = ranked[0];
        const { coreLimit, activeLimit } = skeletonPolicyLimits(sample.difficulty || "Medium");
        const id = stableSkeletonId(key);
        ranked.forEach((question, index) => {
          const rank = index + 1;
          const pool = rank <= coreLimit ? "core_pool" : rank <= activeLimit ? "remedial_pool" : "hidden_duplicate";
          poolCounts[pool] += 1;
          if (apply) {
            question.practicePool = pool;
            question.skeletonDiversity = {
              skeletonId: id,
              skeletonRank: rank,
              skeletonSize: ranked.length,
              coreLimit,
              activeLimit,
              practicePool: pool,
              calculationEaseScore: duplicateCalculationEaseScore(question),
              roundAnswerPreferred: duplicateAnswerRoundnessScore(question) <= 1,
              skeletonKey: key.slice(0, 280),
              reason:
                pool === "core_pool"
                  ? "Within core diversity cap."
                  : pool === "remedial_pool"
                    ? "Repeated skeleton kept only for learners who miss this form."
                    : "Skeleton overflow beyond active cap.",
              policy: "Core pool is visible by default. Remedial pool opens after misses. Hidden duplicates stay out of normal practice.",
            };
            if (pool === "hidden_duplicate") {
              question.publicationStatus = "hidden_duplicate_skeleton_overflow";
            } else if (question.publicationStatus === "hidden_duplicate_skeleton_overflow") {
              question.publicationStatus = question.visibility === "private_family" ? "private_auto_reviewed" : "public_candidate_auto_reviewed";
            }
          }
        });

        if (ranked.length > coreLimit) {
          const coreIds = ranked.slice(0, coreLimit).map((question) => question.id);
          const remedialIds = ranked.slice(coreLimit, activeLimit).map((question) => question.id);
          const hiddenIds = ranked.slice(activeLimit).map((question) => question.id);
          rows.push({
            skeletonId: id,
            topicKey,
            topic: topicScanLabel(topicKey, labelFor),
            size: ranked.length,
            coreLimit,
            activeLimit,
            corePool: Math.min(ranked.length, coreLimit),
            remedialPool: Math.max(0, Math.min(ranked.length, activeLimit) - coreLimit),
            hiddenDuplicate: Math.max(0, ranked.length - activeLimit),
            coreIds,
            remedialIds,
            hiddenIds,
            preferredIds: coreIds.slice(0, 3),
            sampleId: sample.id,
            samplePrompt: sample.prompt,
            sourceMix: countBy(ranked, "sourceType"),
          });
        }
      });
    });

    return {
      scope,
      applied: apply,
      scannedAt: new Date().toISOString(),
      topicCount: topics.size,
      questionCount: scanQuestions.length,
      skeletonCount,
      poolCounts,
      repeatedGroups: rows.sort((a, b) => b.size - a.size || a.topic.localeCompare(b.topic)),
    };
  }

  function summarizeDuplicatePolicy(questions = []) {
    const scanQuestions = duplicateScanQuestionPool(questions, "generated");
    const counts = countBy(scanQuestions, "practicePool");
    return {
      total: scanQuestions.length,
      core: counts.core_pool || 0,
      remedial: counts.remedial_pool || 0,
      hidden: counts.hidden_duplicate || 0,
    };
  }

  return {
    buildDuplicateSkeletonScan,
    compareSkeletonPolicyQuestions,
    countBy,
    duplicateAnswerRoundnessScore,
    duplicateCalculationEaseScore,
    duplicateScanQuestionPool,
    isGridInQuestion,
    normalizeSkeletonText,
    numbersInText,
    practicePool,
    questionSkeletonKey,
    skeletonId,
    skeletonPolicyLimits,
    stableSkeletonId,
    summarizeDuplicatePolicy,
    topicScanKey,
    topicScanLabel,
  };
});
