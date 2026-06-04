(function initSatStudioCore(root, factory) {
  const core = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = core;
  }
  if (root) {
    root.SatStudioCore = core;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioCore() {
  function normalizeStudentAnswer(value) {
    return String(value ?? "")
      .trim()
      .replace(/[−–—]/g, "-")
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

  function answersMatch(actual, expected, tolerance = 0.0005) {
    const normalizedActual = normalizeStudentAnswer(actual);
    const normalizedExpected = normalizeStudentAnswer(expected);
    if (!normalizedActual || !normalizedExpected) return false;
    if (normalizedActual === normalizedExpected) return true;

    const actualNumber = parseStudentNumber(normalizedActual);
    const expectedNumber = parseStudentNumber(normalizedExpected);
    if (actualNumber === null || expectedNumber === null) return false;
    return Math.abs(actualNumber - expectedNumber) <= tolerance;
  }

  function difficultyWeight(difficulty) {
    return { Easy: 1, Medium: 1.35, Hard: 1.75 }[difficulty] || 1.2;
  }

  function estimateSectionScore(summary) {
    if (!summary || !summary.total) return 200;
    const ratio = summary.weightedTotal ? summary.weightedCorrect / summary.weightedTotal : summary.correct / summary.total;
    return Math.round((200 + ratio * 600) / 10) * 10;
  }

  function estimateSectionScoreBand(summary) {
    const estimate = estimateSectionScore(summary);
    const total = Number(summary?.total) || 0;
    const hard = Number(summary?.difficultyCounts?.Hard) || 0;
    let radius = 90;
    let confidence = "low";
    if (total >= 20 && hard >= 4) {
      radius = 40;
      confidence = "high";
    } else if (total >= 10 && hard >= 2) {
      radius = 60;
      confidence = "medium";
    } else if (total >= 5) {
      radius = 80;
      confidence = "low";
    }
    const low = Math.max(200, Math.round((estimate - radius) / 10) * 10);
    const high = Math.min(800, Math.round((estimate + radius) / 10) * 10);
    return {
      estimate,
      low,
      high,
      confidence,
      evidenceCount: total,
      hardCount: hard,
      label: low === high ? String(estimate) : `${low}-${high}`,
    };
  }

  function buildQuestionIndex(questions = []) {
    const index = new Map();
    questions.forEach((question) => {
      if (question?.id) index.set(String(question.id), question);
    });
    return index;
  }

  function getQuestionById(index, id) {
    if (!index || id === undefined || id === null) return null;
    return index.get(String(id)) || null;
  }

  return {
    answersMatch,
    buildQuestionIndex,
    difficultyWeight,
    estimateSectionScore,
    estimateSectionScoreBand,
    getQuestionById,
    normalizeStudentAnswer,
    parseStudentNumber,
  };
});
