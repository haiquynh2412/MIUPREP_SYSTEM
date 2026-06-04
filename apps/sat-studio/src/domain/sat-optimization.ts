import type { AttemptRecord, LearnerState, PublicQuestionItem, QuestionRepository } from "./student-learning";

export type SatTrapType =
  | "wording_trap"
  | "evidence_trap"
  | "grammar_exception"
  | "algebra_shortcut"
  | "geometry_visual_trap"
  | "time_pressure"
  | "unknown";

export type Module2Route = "standard" | "hard" | "support";

export interface SatPacingSummary {
  total: number;
  answered: number;
  skipped: number;
  changedAnswers: number;
  averageSeconds: number;
  overTime: number;
  easyWrong: number;
  hardCorrect: number;
  slowCorrect: number;
  pacingRisk: "low" | "medium" | "high";
  flags: string[];
}

export interface SatTrapSignal {
  attemptId: string;
  questionId: string;
  trapType: SatTrapType;
  confidence: number;
  reason: string;
  remediationCardId: string;
}

export interface Module2Readiness {
  route: Module2Route;
  readiness: "accelerate" | "balanced" | "repair";
  accuracy: number;
  focusSkill: string;
  reason: string;
  pacing: SatPacingSummary;
  trapSignals: SatTrapSignal[];
}

export interface SatStrategyRemediationCard {
  id: string;
  trapType: SatTrapType;
  title: string;
  trigger: string;
  strategy: string;
  steps: string[];
  estimatedMinutes: number;
  targetSkill?: string;
}

export interface MixedAdaptiveSetOptions {
  route?: Module2Route;
  focusSkill?: string;
  limit?: number;
  includeSeen?: boolean;
}

const TARGET_SECONDS: Record<string, number> = {
  easy: 55,
  medium: 75,
  hard: 95,
};

const ROUTE_MIX: Record<Module2Route, Record<string, number>> = {
  support: { Easy: 0.45, Medium: 0.45, Hard: 0.1 },
  standard: { Easy: 0.2, Medium: 0.55, Hard: 0.25 },
  hard: { Easy: 0.1, Medium: 0.4, Hard: 0.5 },
};

export function analyzeSatPacing(
  attempts: AttemptRecord[],
  options: { moduleQuestionCount?: number; changedAnswerCount?: number } = {},
): SatPacingSummary {
  const answered = attempts.length;
  const total = Math.max(answered, Number(options.moduleQuestionCount || answered));
  const skipped = Math.max(0, total - answered);
  const changedAnswers = Math.max(0, Number(options.changedAnswerCount || 0));
  const averageSeconds = answered ? Math.round(sum(attempts.map((attempt) => attempt.timeSpentSeconds || attempt.elapsedMs / 1000)) / answered) : 0;
  const overTime = attempts.filter((attempt) => isOverTargetTime(attempt)).length;
  const easyWrong = attempts.filter((attempt) => !attempt.correct && normalizeDifficulty(attempt.difficulty) === "Easy").length;
  const hardCorrect = attempts.filter((attempt) => attempt.correct && normalizeDifficulty(attempt.difficulty) === "Hard").length;
  const slowCorrect = attempts.filter((attempt) => attempt.correct && isOverTargetTime(attempt)).length;
  const pacingPressure = overTime + skipped * 1.5 + changedAnswers * 0.75;
  const pacingRisk: SatPacingSummary["pacingRisk"] = pacingPressure >= Math.max(4, total * 0.28) ? "high" : pacingPressure >= Math.max(2, total * 0.14) ? "medium" : "low";
  const flags = [
    overTime ? "over_time" : "",
    skipped ? "skipped" : "",
    changedAnswers ? "changed_answer" : "",
    easyWrong ? "easy_wrong" : "",
    hardCorrect >= 3 ? "hard_correct" : "",
    slowCorrect ? "slow_correct" : "",
  ].filter(Boolean);

  return {
    total,
    answered,
    skipped,
    changedAnswers,
    averageSeconds,
    overTime,
    easyWrong,
    hardCorrect,
    slowCorrect,
    pacingRisk,
    flags,
  };
}

export function classifySatTrap(attempt: AttemptRecord, question?: PublicQuestionItem | null): SatTrapSignal {
  const text = normalizeText([
    attempt.section,
    attempt.domain,
    attempt.skill,
    attempt.questionType,
    question?.prompt || "",
    typeof question?.explanation === "string" ? question.explanation : "",
  ].join(" "));
  const overTime = isOverTargetTime(attempt);
  let trapType: SatTrapType = "unknown";
  let reason = "No strong trap signal; review the skill and answer process.";
  let confidence = 0.42;

  if (!attempt.correct && overTime) {
    trapType = "time_pressure";
    reason = "The answer was wrong after exceeding the target time for this difficulty.";
    confidence = 0.72;
  }
  if (containsAny(text, ["command of evidence", "evidence", "inference", "information and ideas", "support", "weaken", "claim"])) {
    trapType = "evidence_trap";
    reason = "The item depends on evidence alignment; common wrong choices are true-but-unsupported.";
    confidence = Math.max(confidence, 0.76);
  }
  if (containsAny(text, ["words in context", "vocab", "meaning", "wording", "purpose", "function"])) {
    trapType = "wording_trap";
    reason = "The item likely tests precise wording, tone, or function rather than broad meaning.";
    confidence = Math.max(confidence, 0.74);
  }
  if (containsAny(text, ["standard english", "grammar", "punctuation", "transition", "boundaries", "agreement"])) {
    trapType = "grammar_exception";
    reason = "The item likely hides a grammar or punctuation exception.";
    confidence = Math.max(confidence, 0.78);
  }
  if (containsAny(text, ["algebra", "linear", "quadratic", "equation", "expression", "function"]) && !attempt.correct) {
    trapType = overTime ? "time_pressure" : "algebra_shortcut";
    reason = overTime ? reason : "The item likely punishes a shortcut before writing the equation or condition.";
    confidence = Math.max(confidence, overTime ? 0.74 : 0.75);
  }
  if (containsAny(text, ["geometry", "triangle", "circle", "angle", "area", "volume", "coordinate"]) && !attempt.correct) {
    trapType = "geometry_visual_trap";
    reason = "The item likely relies on a diagram or visual assumption that must be converted into a theorem or equation.";
    confidence = Math.max(confidence, 0.75);
  }

  return {
    attemptId: attempt.id,
    questionId: attempt.questionId,
    trapType,
    confidence,
    reason,
    remediationCardId: strategyCardId(trapType),
  };
}

export function buildModule2Readiness(
  attempts: AttemptRecord[],
  options: { moduleQuestionCount?: number; changedAnswerCount?: number; questionLookup?: (id: string) => PublicQuestionItem | undefined } = {},
): Module2Readiness {
  const pacing = analyzeSatPacing(attempts, options);
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const wrongAttempts = attempts.filter((attempt) => !attempt.correct);
  const trapSignals = wrongAttempts.map((attempt) => classifySatTrap(attempt, options.questionLookup?.(attempt.questionId)));
  const focusSkill = mostFrequent(wrongAttempts.map((attempt) => attempt.skill).filter(Boolean)) || attempts[0]?.skill || "Mixed SAT";

  if (!attempts.length) {
    return {
      route: "standard",
      readiness: "balanced",
      accuracy: 0,
      focusSkill,
      reason: "No completed Module 1 attempts yet.",
      pacing,
      trapSignals,
    };
  }
  if (accuracy >= 75 && pacing.pacingRisk === "low" && pacing.easyWrong === 0) {
    return {
      route: "hard",
      readiness: "accelerate",
      accuracy,
      focusSkill,
      reason: "Accuracy is strong, pacing is stable, and there are no easy-question leaks.",
      pacing,
      trapSignals,
    };
  }
  if (accuracy < 50 || pacing.pacingRisk === "high" || pacing.easyWrong > 0 || pacing.skipped >= 4) {
    return {
      route: "support",
      readiness: "repair",
      accuracy,
      focusSkill,
      reason: "Module 2 should repair foundations because accuracy, pacing, skipped questions, or easy misses are risky.",
      pacing,
      trapSignals,
    };
  }
  return {
    route: "standard",
    readiness: "balanced",
    accuracy,
    focusSkill,
    reason: "Module 2 should stay balanced while testing the main weak skill.",
    pacing,
    trapSignals,
  };
}

export function buildSatStrategyRemediationCards(
  attempts: AttemptRecord[],
  options: { questionLookup?: (id: string) => PublicQuestionItem | undefined; limit?: number } = {},
): SatStrategyRemediationCard[] {
  const trapSignals = attempts
    .filter((attempt) => !attempt.correct)
    .map((attempt) => classifySatTrap(attempt, options.questionLookup?.(attempt.questionId)));
  const counts = new Map<SatTrapType, { count: number; skill: string }>();
  trapSignals.forEach((signal) => {
    const attempt = attempts.find((row) => row.id === signal.attemptId);
    const existing = counts.get(signal.trapType) || { count: 0, skill: "" };
    counts.set(signal.trapType, { count: existing.count + 1, skill: existing.skill || attempt?.skill || "" });
  });
  const ranked = [...counts.entries()].sort((left, right) => right[1].count - left[1].count);
  const cards = ranked.map(([trapType, meta]) => strategyCard(trapType, meta.skill));
  if (cards.length) return cards.slice(0, options.limit || 3);
  return [strategyCard("unknown")];
}

export function buildMixedAdaptiveSet(
  repo: QuestionRepository,
  state: LearnerState,
  options: MixedAdaptiveSetOptions = {},
): PublicQuestionItem[] {
  const route = options.route || "standard";
  const limit = Math.max(1, Number(options.limit || 22));
  const seen = new Set(state.attempts.map((attempt) => attempt.questionId));
  const available = repo.items.filter((item) => options.includeSeen || !seen.has(item.id));
  const mix = ROUTE_MIX[route];
  const selected: PublicQuestionItem[] = [];
  const focusSkill = String(options.focusSkill || "").trim();

  if (focusSkill) {
    selected.push(...pickAdaptive(available.filter((item) => item.skill === focusSkill), Math.ceil(limit * 0.4), selected));
  }

  for (const [difficulty, ratio] of Object.entries(mix)) {
    selected.push(...pickAdaptive(available.filter((item) => normalizeDifficulty(item.difficulty) === difficulty), Math.ceil(limit * ratio), selected));
  }

  selected.push(...pickAdaptive(available, limit - selected.length, selected));
  if (selected.length < limit && !options.includeSeen) {
    selected.push(...pickAdaptive(repo.items, limit - selected.length, selected));
  }
  return selected.slice(0, limit);
}

function strategyCard(trapType: SatTrapType, targetSkill = ""): SatStrategyRemediationCard {
  const cards: Record<SatTrapType, SatStrategyRemediationCard> = {
    wording_trap: {
      id: strategyCardId("wording_trap"),
      trapType: "wording_trap",
      title: "Wording trap: exact meaning before vibe",
      trigger: "Wrong answers sound plausible but are broader, stronger, or off-tone.",
      strategy: "Underline the tested word or function, then reject any choice that changes scope.",
      steps: ["Name the exact phrase being tested.", "Write the predicted meaning in plain words.", "Eliminate choices that are too broad, extreme, or off-register."],
      estimatedMinutes: 8,
      targetSkill,
    },
    evidence_trap: {
      id: strategyCardId("evidence_trap"),
      trapType: "evidence_trap",
      title: "Evidence trap: true is not enough",
      trigger: "The answer may be true but not proven by the passage.",
      strategy: "Anchor the answer to one quoted line before choosing.",
      steps: ["Find the sentence that proves the answer.", "Say what it proves and what it does not prove.", "Reject outside-knowledge answers."],
      estimatedMinutes: 9,
      targetSkill,
    },
    grammar_exception: {
      id: strategyCardId("grammar_exception"),
      trapType: "grammar_exception",
      title: "Grammar exception: rule before rhythm",
      trigger: "The sentence sounds acceptable but breaks a boundary, agreement, modifier, or punctuation rule.",
      strategy: "Identify the grammar job of each phrase before trusting your ear.",
      steps: ["Mark main clause and modifiers.", "Check punctuation around nonessential text.", "Test agreement after removing interrupters."],
      estimatedMinutes: 8,
      targetSkill,
    },
    algebra_shortcut: {
      id: strategyCardId("algebra_shortcut"),
      trapType: "algebra_shortcut",
      title: "Algebra shortcut trap: equation first",
      trigger: "A tempting shortcut skips a condition, sign, or setup step.",
      strategy: "Write the equation and constraints before simplifying.",
      steps: ["Define the variable.", "Write the original equation or expression.", "Check signs, units, and excluded values."],
      estimatedMinutes: 10,
      targetSkill,
    },
    geometry_visual_trap: {
      id: strategyCardId("geometry_visual_trap"),
      trapType: "geometry_visual_trap",
      title: "Geometry visual trap: prove the diagram",
      trigger: "The figure suggests a relationship that is not guaranteed.",
      strategy: "Convert the visual into a theorem, equation, or coordinate relation.",
      steps: ["List only given facts.", "Name the theorem that connects them.", "Compute from the theorem, not from visual guesswork."],
      estimatedMinutes: 10,
      targetSkill,
    },
    time_pressure: {
      id: strategyCardId("time_pressure"),
      trapType: "time_pressure",
      title: "Pacing trap: decide earlier",
      trigger: "The item consumed too much time before a wrong answer or blank.",
      strategy: "Use a 45-second decision point: solve, simplify, or skip with a mark.",
      steps: ["At 45 seconds, name the next concrete step.", "If no step is clear, mark and move.", "Return only after all easier questions are banked."],
      estimatedMinutes: 6,
      targetSkill,
    },
    unknown: {
      id: strategyCardId("unknown"),
      trapType: "unknown",
      title: "Strategy reset: classify before drilling",
      trigger: "The error does not have enough metadata yet.",
      strategy: "Re-run the question slowly and label whether the miss was content, evidence, grammar, setup, or time.",
      steps: ["Restate the question task.", "Identify the first uncertain step.", "Assign one trap label before doing another question."],
      estimatedMinutes: 5,
      targetSkill,
    },
  };
  return { ...cards[trapType], targetSkill };
}

function pickAdaptive(pool: PublicQuestionItem[], limit: number, selected: PublicQuestionItem[]): PublicQuestionItem[] {
  if (limit <= 0) return [];
  const selectedIds = new Set(selected.map((item) => item.id));
  const result: PublicQuestionItem[] = [];
  const domainCounts = new Map<string, number>();
  const sorted = [...pool].sort((a, b) => a.skill.localeCompare(b.skill) || a.id.localeCompare(b.id));
  for (const item of sorted) {
    if (selectedIds.has(item.id)) continue;
    const domainCount = domainCounts.get(item.domain) || 0;
    if (domainCount >= Math.max(2, Math.ceil(limit / 3))) continue;
    result.push(item);
    selectedIds.add(item.id);
    domainCounts.set(item.domain, domainCount + 1);
    if (result.length >= limit) return result;
  }
  for (const item of sorted) {
    if (selectedIds.has(item.id)) continue;
    result.push(item);
    selectedIds.add(item.id);
    if (result.length >= limit) break;
  }
  return result;
}

function isOverTargetTime(attempt: AttemptRecord): boolean {
  const difficulty = normalizeDifficulty(attempt.difficulty).toLowerCase();
  const target = TARGET_SECONDS[difficulty] || TARGET_SECONDS.medium;
  return Number(attempt.timeSpentSeconds || attempt.elapsedMs / 1000) > target;
}

function normalizeDifficulty(value: string): "Easy" | "Medium" | "Hard" {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("easy")) return "Easy";
  if (normalized.includes("hard")) return "Hard";
  return "Medium";
}

function strategyCardId(trapType: SatTrapType): string {
  return `sat-strategy-${trapType.replace(/_/g, "-")}`;
}

function mostFrequent(values: string[]): string {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] || "";
}

function containsAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
