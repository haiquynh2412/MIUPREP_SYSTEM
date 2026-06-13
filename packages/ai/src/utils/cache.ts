/**
 * Caching + cost-aware decorator for any AIAdapter.
 *
 * Identical submissions (same essay/transcript, task, track, prompt version)
 * return the stored feedback instead of re-calling the provider — eliminating
 * the "student re-submits the same essay" spend. Every call is recorded in a
 * UsageLedger (cached calls cost nothing); quota is checked before a billable call.
 */
import type { WritingFeedback, SpeakingFeedback } from '@miuprep/db';
import type { AIAdapter } from '../index';
import { UsageLedger, estimateTokens, estimateCostUsd, type UsageEntry } from './usage';

/**
 * Bump when grading prompts change so previously cached feedback is invalidated.
 * Keep in sync with the prompt revisions in the adapters.
 */
export const PROMPT_VERSION = 'v1';

/** Stable, dependency-free FNV-1a 32-bit hash (hex). Deterministic across runs. */
export function hashContent(parts: Array<string | number | undefined>): string {
  const input = parts.map((p) => (p === undefined ? '' : String(p))).join('');
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export interface ResponseCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

export class InMemoryResponseCache<T> implements ResponseCache<T> {
  private map = new Map<string, T>();
  get(key: string): T | undefined {
    return this.map.get(key);
  }
  set(key: string, value: T): void {
    this.map.set(key, value);
  }
}

export interface CachingAdapterOptions {
  ledger?: UsageLedger;
  writingCache?: ResponseCache<WritingFeedback>;
  speakingCache?: ResponseCache<SpeakingFeedback>;
  /** Used for cost estimation + quota scoping. Defaults to 'unknown'. */
  learnerId?: string;
  /** Model name for pricing. Defaults to 'gpt-4o'. */
  model?: string;
  /** Clock injection for deterministic tests. Defaults to () => new Date().toISOString(). */
  now?: () => string;
}

export class CachingAIAdapter implements AIAdapter {
  private ledger: UsageLedger;
  private writingCache: ResponseCache<WritingFeedback>;
  private speakingCache: ResponseCache<SpeakingFeedback>;
  private learnerId: string;
  private model: string;
  private now: () => string;

  private inner: AIAdapter;

  constructor(inner: AIAdapter, options: CachingAdapterOptions = {}) {
    this.inner = inner;
    this.ledger = options.ledger ?? new UsageLedger();
    this.writingCache = options.writingCache ?? new InMemoryResponseCache<WritingFeedback>();
    this.speakingCache = options.speakingCache ?? new InMemoryResponseCache<SpeakingFeedback>();
    this.learnerId = options.learnerId ?? 'unknown';
    this.model = options.model ?? 'gpt-4o';
    this.now = options.now ?? (() => new Date().toISOString());
  }

  getLedger(): UsageLedger {
    return this.ledger;
  }

  async gradeWriting(params: {
    attemptId: string;
    essay: string;
    taskNumber: 1 | 2;
    promptInstruction?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  }): Promise<WritingFeedback> {
    const key = hashContent([
      'writing',
      PROMPT_VERSION,
      params.track,
      params.taskNumber,
      params.promptInstruction,
      params.essay,
    ]);
    const cached = this.writingCache.get(key);
    const inputTokens = estimateTokens(params.essay) + estimateTokens(params.promptInstruction);

    if (cached) {
      this.record('writing', inputTokens, estimateTokens(JSON.stringify(cached)), true);
      return cached;
    }

    const outTokensGuess = 700; // typical structured feedback size for quota pre-check
    this.ledger.assertWithinQuota(this.learnerId, estimateCostUsd(this.model, inputTokens, outTokensGuess));

    const result = await this.inner.gradeWriting(params);
    this.writingCache.set(key, result);
    this.record('writing', inputTokens, estimateTokens(JSON.stringify(result)), false);
    return result;
  }

  async gradeSpeaking(params: {
    attemptId: string;
    audioPath?: string;
    audioBase64?: string;
    transcriptMock?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  }): Promise<SpeakingFeedback> {
    const key = hashContent([
      'speaking',
      PROMPT_VERSION,
      params.track,
      params.transcriptMock,
      params.audioPath,
      params.audioBase64,
    ]);
    const cached = this.speakingCache.get(key);
    const inputTokens = estimateTokens(params.transcriptMock) + estimateTokens(params.audioBase64) / 100;

    if (cached) {
      this.record('speaking', inputTokens, estimateTokens(JSON.stringify(cached)), true);
      return cached;
    }

    const outTokensGuess = 700;
    this.ledger.assertWithinQuota(this.learnerId, estimateCostUsd(this.model, inputTokens, outTokensGuess));

    const result = await this.inner.gradeSpeaking(params);
    this.speakingCache.set(key, result);
    this.record('speaking', inputTokens, estimateTokens(JSON.stringify(result)), false);
    return result;
  }

  private record(operation: 'writing' | 'speaking', inputTokens: number, outputTokens: number, cached: boolean): void {
    const entry: UsageEntry = {
      learnerId: this.learnerId,
      model: this.model,
      operation,
      inputTokens: Math.round(inputTokens),
      outputTokens: outputTokens,
      costUsd: estimateCostUsd(this.model, inputTokens, outputTokens),
      cached,
      at: this.now(),
    };
    this.ledger.record(entry);
  }
}
