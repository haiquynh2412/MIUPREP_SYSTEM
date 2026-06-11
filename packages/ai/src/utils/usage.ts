/**
 * AI cost tracking and quota enforcement.
 *
 * The grading adapters don't always surface provider token counts, so cost is
 * estimated from text length (≈4 chars/token) when actual usage is absent.
 * Prices are USD per 1M tokens; update PROMPT_VERSION's sibling tables when the
 * provider pricing changes.
 */

export interface ModelPricing {
  /** USD per 1M input tokens */
  inputPerMillion: number;
  /** USD per 1M output tokens */
  outputPerMillion: number;
}

/** Indicative pricing (USD / 1M tokens). Adjust as providers change rates. */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'gpt-3.5-turbo': { inputPerMillion: 0.5, outputPerMillion: 1.5 },
  'gemini-1.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.3 },
  'gemini-1.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5 },
  mock: { inputPerMillion: 0, outputPerMillion: 0 },
};

export function pricingForModel(model: string): ModelPricing {
  return MODEL_PRICING[model] ?? MODEL_PRICING['gpt-4o'];
}

/** Rough token estimate from character count (~4 chars per token). */
export function estimateTokens(text: string | undefined | null): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = pricingForModel(model);
  return (inputTokens / 1_000_000) * p.inputPerMillion + (outputTokens / 1_000_000) * p.outputPerMillion;
}

export interface UsageEntry {
  learnerId: string;
  model: string;
  operation: 'writing' | 'speaking' | string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  cached: boolean;
  at: string;
}

export interface UsageSummary {
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  calls: number;
  cachedCalls: number;
  /** Cost actually billed by the provider (cached calls cost nothing). */
  billedCostUsd: number;
}

export interface QuotaPolicy {
  /** Hard ceiling on billed cost per learner (USD). Omit for no per-learner cap. */
  perLearnerUsd?: number;
  /** Hard ceiling on total billed cost across all learners (USD). */
  totalUsd?: number;
}

export class QuotaExceededError extends Error {
  readonly scope: 'learner' | 'total';
  readonly limitUsd: number;
  readonly wouldBeUsd: number;
  constructor(scope: 'learner' | 'total', limitUsd: number, wouldBeUsd: number) {
    super(
      scope === 'learner'
        ? `Per-learner AI budget exceeded: $${wouldBeUsd.toFixed(4)} would exceed the $${limitUsd.toFixed(2)} cap.`
        : `Total AI budget exceeded: $${wouldBeUsd.toFixed(4)} would exceed the $${limitUsd.toFixed(2)} cap.`,
    );
    this.name = 'QuotaExceededError';
    this.scope = scope;
    this.limitUsd = limitUsd;
    this.wouldBeUsd = wouldBeUsd;
  }
}

/**
 * In-memory ledger of AI usage. Records every call (cached or billed), can
 * summarize per learner / overall, and enforces quota before an expensive call.
 */
export class UsageLedger {
  private entries: UsageEntry[] = [];
  private policy: QuotaPolicy;

  constructor(policy: QuotaPolicy = {}) {
    this.policy = policy;
  }

  record(entry: UsageEntry): void {
    this.entries.push(entry);
  }

  all(): readonly UsageEntry[] {
    return this.entries;
  }

  summary(learnerId?: string): UsageSummary {
    const rows = learnerId ? this.entries.filter((e) => e.learnerId === learnerId) : this.entries;
    const s: UsageSummary = {
      totalCostUsd: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      calls: 0,
      cachedCalls: 0,
      billedCostUsd: 0,
    };
    for (const e of rows) {
      s.totalCostUsd += e.costUsd;
      s.totalInputTokens += e.inputTokens;
      s.totalOutputTokens += e.outputTokens;
      s.calls += 1;
      if (e.cached) s.cachedCalls += 1;
      else s.billedCostUsd += e.costUsd;
    }
    return s;
  }

  /** Throws QuotaExceededError if billing `projectedCostUsd` to `learnerId` would breach a cap. */
  assertWithinQuota(learnerId: string, projectedCostUsd: number): void {
    if (this.policy.perLearnerUsd !== undefined) {
      const wouldBe = this.summary(learnerId).billedCostUsd + projectedCostUsd;
      if (wouldBe > this.policy.perLearnerUsd) {
        throw new QuotaExceededError('learner', this.policy.perLearnerUsd, wouldBe);
      }
    }
    if (this.policy.totalUsd !== undefined) {
      const wouldBe = this.summary().billedCostUsd + projectedCostUsd;
      if (wouldBe > this.policy.totalUsd) {
        throw new QuotaExceededError('total', this.policy.totalUsd, wouldBe);
      }
    }
  }
}
