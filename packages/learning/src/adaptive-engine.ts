/**
 * Adaptive engine: two-way Elo calibration + Computerized Adaptive Testing (CAT).
 *
 * This is the "real adaptivity" layer that turns raw attempts into calibrated
 * item difficulties and learner ability estimates (1PL / Rasch-style logistic
 * model with Elo updates), and selects diagnostic items by Fisher information
 * instead of random sampling.
 *
 * All functions are pure and deterministic given their inputs — no Date.now(),
 * no Math.random() — so they are fully unit-testable with simulated learners.
 */

export type DifficultyLabel = 'easy' | 'medium' | 'hard';

/** Rating scale (chess-like). Higher = stronger learner / harder item. */
export const RATING_SCALE = 400;
export const DEFAULT_ABILITY = 1200;

/** Prior item ratings seeded from the teacher-authored difficulty label. */
export const DIFFICULTY_PRIOR_RATING: Record<DifficultyLabel, number> = {
  easy: 1000,
  medium: 1200,
  hard: 1400,
};

export function normalizeDifficultyLabel(value: string | undefined | null): DifficultyLabel {
  if (value === 'easy' || value === 'hard') return value;
  return 'medium';
}

export function priorRatingForDifficulty(value: string | undefined | null): number {
  return DIFFICULTY_PRIOR_RATING[normalizeDifficultyLabel(value)];
}

/** Map a calibrated rating back to a difficulty label (for display / content guards). */
export function ratingToDifficultyLabel(rating: number): DifficultyLabel {
  if (rating < (DIFFICULTY_PRIOR_RATING.easy + DIFFICULTY_PRIOR_RATING.medium) / 2) return 'easy';
  if (rating >= (DIFFICULTY_PRIOR_RATING.medium + DIFFICULTY_PRIOR_RATING.hard) / 2) return 'hard';
  return 'medium';
}

/** Logistic probability that a learner of `ability` answers an item of `difficulty` correctly. */
export function expectedScore(ability: number, difficulty: number, scale: number = RATING_SCALE): number {
  return 1 / (1 + Math.pow(10, (difficulty - ability) / scale));
}

/** Fisher information of a 1PL item at a given ability — proportional to p*(1-p). Peaks when difficulty == ability. */
export function fisherInformation(ability: number, difficulty: number, scale: number = RATING_SCALE): number {
  const p = expectedScore(ability, difficulty, scale);
  return p * (1 - p);
}

/**
 * Provisional K-factor: large while evidence is thin, shrinking toward a stable
 * floor as attempts accumulate (Glicko-lite). Keeps early estimates responsive
 * and late estimates steady.
 */
export function provisionalK(attempts: number, base = 64, floor = 16): number {
  const k = base / (1 + attempts / 8);
  return Math.max(floor, k);
}

export interface AdaptiveAttempt {
  learnerId: string;
  itemId: string;
  correct: boolean;
  /** Teacher-authored prior difficulty; used to seed an item's rating on first sight. */
  difficulty?: string;
  /** ISO timestamp; calibration processes attempts in chronological order. */
  answeredAt?: string;
}

export interface ItemRating {
  itemId: string;
  rating: number;
  priorRating: number;
  attempts: number;
  correct: number;
  /** Calibrated label derived from the rating; equals the prior until enough evidence accrues. */
  difficultyLabel: DifficultyLabel;
  /** True until the item has at least `minAttempts` observations (rating still close to prior). */
  provisional: boolean;
}

export interface LearnerRating {
  learnerId: string;
  ability: number;
  attempts: number;
  correct: number;
}

export interface CalibrationOptions {
  scale?: number;
  /** Below this many attempts an item stays flagged provisional. Default 8. */
  minAttempts?: number;
  learnerKBase?: number;
  itemKBase?: number;
}

export interface CalibrationResult {
  items: Map<string, ItemRating>;
  learners: Map<string, LearnerRating>;
}

/**
 * Run two-way Elo over a chronological attempt log. Each attempt nudges both the
 * learner's ability and the item's difficulty toward consistency with the
 * observed outcome. Returns calibrated ratings for every learner and item seen.
 */
export function calibrateAbilities(attempts: AdaptiveAttempt[], options: CalibrationOptions = {}): CalibrationResult {
  const scale = options.scale ?? RATING_SCALE;
  const minAttempts = options.minAttempts ?? 8;
  const learnerKBase = options.learnerKBase ?? 64;
  const itemKBase = options.itemKBase ?? 48;

  const items = new Map<string, ItemRating>();
  const learners = new Map<string, LearnerRating>();

  const ordered = [...attempts].sort((a, b) => {
    const at = a.answeredAt ?? '';
    const bt = b.answeredAt ?? '';
    if (at !== bt) return at < bt ? -1 : 1;
    return 0;
  });

  for (const attempt of ordered) {
    let item = items.get(attempt.itemId);
    if (!item) {
      const prior = priorRatingForDifficulty(attempt.difficulty);
      item = {
        itemId: attempt.itemId,
        rating: prior,
        priorRating: prior,
        attempts: 0,
        correct: 0,
        difficultyLabel: normalizeDifficultyLabel(attempt.difficulty),
        provisional: true,
      };
      items.set(attempt.itemId, item);
    }
    let learner = learners.get(attempt.learnerId);
    if (!learner) {
      learner = { learnerId: attempt.learnerId, ability: DEFAULT_ABILITY, attempts: 0, correct: 0 };
      learners.set(attempt.learnerId, learner);
    }

    const expected = expectedScore(learner.ability, item.rating, scale);
    const outcome = attempt.correct ? 1 : 0;
    const residual = outcome - expected;

    const kLearner = provisionalK(learner.attempts, learnerKBase);
    const kItem = provisionalK(item.attempts, itemKBase);

    learner.ability += kLearner * residual;
    item.rating -= kItem * residual; // item gets harder (higher rating) when learners fail it

    learner.attempts += 1;
    learner.correct += outcome;
    item.attempts += 1;
    item.correct += outcome;
    item.provisional = item.attempts < minAttempts;
    item.difficultyLabel = ratingToDifficultyLabel(item.rating);
  }

  return { items, learners };
}

export interface AbilityEstimate {
  ability: number;
  /** Posterior standard error — shrinks as more informative items are answered. */
  standardError: number;
}

export interface CatResponse {
  difficulty: number;
  correct: boolean;
}

/**
 * Expected a-posteriori (EAP) ability estimate over a numerical grid with a
 * normal prior centered at DEFAULT_ABILITY. Robust to all-correct / all-wrong
 * response patterns where maximum-likelihood diverges.
 */
export function estimateAbilityEAP(
  responses: CatResponse[],
  options: { scale?: number; priorMean?: number; priorSd?: number } = {},
): AbilityEstimate {
  const scale = options.scale ?? RATING_SCALE;
  const priorMean = options.priorMean ?? DEFAULT_ABILITY;
  const priorSd = options.priorSd ?? 350;

  const lo = priorMean - 3 * priorSd;
  const hi = priorMean + 3 * priorSd;
  const steps = 121;
  const dx = (hi - lo) / (steps - 1);

  let wSum = 0;
  let wThetaSum = 0;
  const nodes: Array<{ theta: number; weight: number }> = [];

  for (let i = 0; i < steps; i++) {
    const theta = lo + i * dx;
    const z = (theta - priorMean) / priorSd;
    let logLik = -0.5 * z * z; // log of the normal prior (up to a constant)
    for (const r of responses) {
      const p = expectedScore(theta, r.difficulty, scale);
      const clamped = Math.min(1 - 1e-9, Math.max(1e-9, p));
      logLik += r.correct ? Math.log(clamped) : Math.log(1 - clamped);
    }
    nodes.push({ theta, weight: logLik });
  }

  const maxLog = Math.max(...nodes.map((n) => n.weight));
  for (const n of nodes) {
    const w = Math.exp(n.weight - maxLog);
    wSum += w;
    wThetaSum += w * n.theta;
  }
  const ability = wThetaSum / wSum;

  let varSum = 0;
  for (const n of nodes) {
    const w = Math.exp(n.weight - maxLog);
    varSum += w * (n.theta - ability) * (n.theta - ability);
  }
  const variance = varSum / wSum;
  return { ability, standardError: Math.sqrt(variance) };
}

export interface CatItem {
  id: string;
  difficulty: number;
  /** Optional discrimination proxy (0..1); higher = more informative. Used as a tie-break. */
  discrimination?: number;
}

/**
 * Select the next CAT item: the unanswered candidate that maximizes Fisher
 * information at the current ability estimate (i.e. difficulty closest to
 * ability), breaking ties by discrimination. This is what lets a diagnostic
 * converge on a learner's level in far fewer questions than random selection.
 */
export function selectNextCatItem(
  candidates: CatItem[],
  ability: number,
  askedIds: Iterable<string> = [],
  scale: number = RATING_SCALE,
): CatItem | null {
  const asked = new Set(askedIds);
  let best: CatItem | null = null;
  let bestInfo = -Infinity;
  for (const item of candidates) {
    if (asked.has(item.id)) continue;
    const info = fisherInformation(ability, item.difficulty, scale) * (1 + 0.1 * (item.discrimination ?? 0));
    if (info > bestInfo) {
      bestInfo = info;
      best = item;
    }
  }
  return best;
}

export interface CatStopOptions {
  maxItems?: number;
  minItems?: number;
  /** Stop once the posterior standard error drops below this. Default 120 rating points. */
  seThreshold?: number;
}

export interface CatStep {
  itemId: string;
  difficulty: number;
  correct: boolean;
  abilityAfter: number;
  standardErrorAfter: number;
}

export interface CatRunResult {
  ability: number;
  standardError: number;
  steps: CatStep[];
  difficultyLabel: DifficultyLabel;
}

/**
 * Drive a full CAT session. `respond` returns the observed correctness for a
 * chosen item (in production this is the learner's answer; in tests it is a
 * simulated learner). Stops on SE threshold or maxItems, whichever comes first.
 */
export function runCatSession(
  pool: CatItem[],
  respond: (item: CatItem) => boolean,
  options: CatStopOptions = {},
): CatRunResult {
  const maxItems = options.maxItems ?? 12;
  const minItems = options.minItems ?? 4;
  const seThreshold = options.seThreshold ?? 120;

  const asked = new Set<string>();
  const responses: CatResponse[] = [];
  const steps: CatStep[] = [];
  let estimate: AbilityEstimate = { ability: DEFAULT_ABILITY, standardError: Infinity };

  for (let i = 0; i < maxItems; i++) {
    const next = selectNextCatItem(pool, estimate.ability, asked);
    if (!next) break;
    asked.add(next.id);
    const correct = respond(next);
    responses.push({ difficulty: next.difficulty, correct });
    estimate = estimateAbilityEAP(responses);
    steps.push({
      itemId: next.id,
      difficulty: next.difficulty,
      correct,
      abilityAfter: estimate.ability,
      standardErrorAfter: estimate.standardError,
    });
    if (i + 1 >= minItems && estimate.standardError <= seThreshold) break;
  }

  return {
    ability: estimate.ability,
    standardError: estimate.standardError,
    steps,
    difficultyLabel: ratingToDifficultyLabel(estimate.ability),
  };
}
