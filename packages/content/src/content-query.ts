import type { ContentDomainId, ContentProgramId, MasteryPolicy, QuestionItem } from './standard';

export type ContentQueryReadiness = MasteryPolicy | 'learning_ready' | 'all';

export interface ContentQuery {
  programId?: ContentProgramId;
  domainId?: ContentDomainId;
  conceptIds?: string[];
  skillIds?: string[];
  difficulty?: string | string[];
  questionType?: string | string[];
  readiness?: ContentQueryReadiness;
  mode?: 'diagnostic' | 'practice' | 'review' | 'mock' | 'feedback' | string;
  limit?: number;
  cursor?: string;
  includeItemIds?: string[];
  excludeItemIds?: string[];
  tags?: string[];
}

export interface ContentItemSummary {
  id: string;
  sourceId?: string;
  source?: string;
  domainId: ContentDomainId;
  programIds: ContentProgramId[];
  conceptIds: string[];
  skillIds: string[];
  type: string;
  difficulty: string;
  masteryPolicy: MasteryPolicy;
  feedbackArea?: string;
  tags: string[];
  metadata: {
    title?: string;
    section?: string;
    skill?: string;
    questionType?: string;
    practicePool?: string;
    estimatedTimeSeconds?: number;
  };
}

export interface ContentQueryResult {
  schemaVersion: 'content_query_result_v1';
  items: ContentItemSummary[];
  total: number;
  limit: number;
  cursor?: string;
  nextCursor?: string;
  hasMore: boolean;
}

export interface ContentQueryService {
  query(query?: ContentQuery): ContentQueryResult;
  getDetail(itemId: string): QuestionItem | undefined;
  clearCache(): void;
}

export interface ContentQueryServiceOptions {
  maxCacheEntries?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export function queryContentItems(
  items: QuestionItem[],
  query: ContentQuery = {},
  options: Pick<ContentQueryServiceOptions, 'defaultLimit' | 'maxLimit'> = {},
): ContentQueryResult {
  const limit = normalizeLimit(query.limit, options.defaultLimit, options.maxLimit);
  const offset = decodeCursor(query.cursor);
  const filtered = filterContentItems(items, query).sort(compareQuestionItemsForQuery);
  const page = filtered.slice(offset, offset + limit).map(toContentItemSummary);
  const nextOffset = offset + page.length;

  return {
    schemaVersion: 'content_query_result_v1',
    items: page,
    total: filtered.length,
    limit,
    cursor: query.cursor,
    nextCursor: nextOffset < filtered.length ? encodeCursor(nextOffset) : undefined,
    hasMore: nextOffset < filtered.length,
  };
}

export function getContentItemDetail(items: QuestionItem[], itemId: string): QuestionItem | undefined {
  return items.find((item) => item.id === itemId);
}

export function createContentQueryService(items: QuestionItem[], options: ContentQueryServiceOptions = {}): ContentQueryService {
  const byId = new Map(items.map((item) => [item.id, item]));
  const cache = new Map<string, ContentQueryResult>();
  const maxCacheEntries = Math.max(0, Number(options.maxCacheEntries ?? 50));

  return {
    query(query: ContentQuery = {}): ContentQueryResult {
      const cacheKey = buildQueryCacheKey(query, options);
      const cached = cache.get(cacheKey);
      if (cached) return cloneQueryResult(cached);

      const result = queryContentItems(items, query, options);
      if (maxCacheEntries > 0) {
        cache.set(cacheKey, cloneQueryResult(result));
        while (cache.size > maxCacheEntries) {
          const oldestKey = cache.keys().next().value;
          if (!oldestKey) break;
          cache.delete(oldestKey);
        }
      }
      return result;
    },
    getDetail(itemId: string): QuestionItem | undefined {
      return byId.get(itemId);
    },
    clearCache(): void {
      cache.clear();
    },
  };
}

export function toContentItemSummary(item: QuestionItem): ContentItemSummary {
  return {
    id: item.id,
    sourceId: item.sourceId,
    source: item.source,
    domainId: item.domainId,
    programIds: [...item.programIds],
    conceptIds: [...item.conceptIds],
    skillIds: [...item.skillIds],
    type: item.type,
    difficulty: item.difficulty,
    masteryPolicy: item.masteryPolicy || 'tracked',
    feedbackArea: item.feedbackArea,
    tags: [...item.tags],
    metadata: {
      title: String(item.metadata?.testTitle || item.metadata?.categoryVn || item.metadata?.category || item.metadata?.section || ''),
      section: String(item.metadata?.section || item.metadata?.testSkill || ''),
      skill: String(item.metadata?.satSkill || item.metadata?.skillArea || item.metadata?.testSkill || ''),
      questionType: item.type,
      practicePool: String(item.metadata?.practicePool || ''),
      estimatedTimeSeconds: Number(item.metadata?.estimatedTimeSeconds || 0) || undefined,
    },
  };
}

function filterContentItems(items: QuestionItem[], query: ContentQuery): QuestionItem[] {
  const includeItemIds = new Set(query.includeItemIds || []);
  const excludeItemIds = new Set(query.excludeItemIds || []);
  const conceptFilter = new Set(query.conceptIds || []);
  const skillFilter = new Set(query.skillIds || []);
  const difficultyFilter = new Set(toArray(query.difficulty).map(normalizeFilterValue));
  const typeFilter = new Set(toArray(query.questionType).map(normalizeFilterValue));
  const tagFilter = new Set((query.tags || []).map(normalizeFilterValue));
  const effectiveReadiness = query.readiness || readinessForMode(query.mode);

  return items.filter((item) => {
    if (includeItemIds.size && !includeItemIds.has(item.id)) return false;
    if (excludeItemIds.has(item.id)) return false;
    if (query.programId && !item.programIds.includes(query.programId)) return false;
    if (query.domainId && item.domainId !== query.domainId) return false;
    if (conceptFilter.size && !item.conceptIds.some((conceptId) => conceptFilter.has(conceptId))) return false;
    if (skillFilter.size && !item.skillIds.some((skillId) => skillFilter.has(skillId))) return false;
    if (difficultyFilter.size && !difficultyFilter.has(normalizeFilterValue(item.difficulty))) return false;
    if (typeFilter.size && !typeFilter.has(normalizeFilterValue(item.type))) return false;
    if (tagFilter.size && !item.tags.some((tag) => tagFilter.has(normalizeFilterValue(tag)))) return false;
    if (!matchesReadiness(item, effectiveReadiness)) return false;
    return true;
  });
}

function matchesReadiness(item: QuestionItem, readiness: ContentQueryReadiness): boolean {
  if (readiness === 'all' || readiness === 'learning_ready') return true;
  const policy = item.masteryPolicy || 'tracked';
  if (readiness === 'tracked') return policy !== 'feedback_only';
  return policy === readiness;
}

function readinessForMode(mode: ContentQuery['mode']): ContentQueryReadiness {
  const normalized = normalizeFilterValue(String(mode || ''));
  if (normalized === 'feedback') return 'feedback_only';
  if (['diagnostic', 'practice', 'review'].includes(normalized)) return 'tracked';
  return 'learning_ready';
}

function compareQuestionItemsForQuery(left: QuestionItem, right: QuestionItem): number {
  const leftProgram = left.programIds[0] || '';
  const rightProgram = right.programIds[0] || '';
  return (
    leftProgram.localeCompare(rightProgram) ||
    left.domainId.localeCompare(right.domainId) ||
    left.difficulty.localeCompare(right.difficulty) ||
    left.type.localeCompare(right.type) ||
    left.id.localeCompare(right.id)
  );
}

function normalizeLimit(limit: number | undefined, defaultLimit = 20, maxLimit = 100): number {
  const normalizedMax = Math.max(1, Number(maxLimit || 100));
  const normalizedDefault = Math.min(normalizedMax, Math.max(1, Number(defaultLimit || 20)));
  return Math.min(normalizedMax, Math.max(1, Number(limit || normalizedDefault)));
}

function encodeCursor(offset: number): string {
  return `offset:${Math.max(0, Math.floor(offset))}`;
}

function decodeCursor(cursor: string | undefined): number {
  if (!cursor) return 0;
  const match = /^offset:(\d+)$/.exec(cursor);
  return match ? Number(match[1]) : 0;
}

function buildQueryCacheKey(query: ContentQuery, options: ContentQueryServiceOptions): string {
  return JSON.stringify({
    query: {
      ...query,
      conceptIds: sorted(query.conceptIds || []),
      skillIds: sorted(query.skillIds || []),
      includeItemIds: sorted(query.includeItemIds || []),
      excludeItemIds: sorted(query.excludeItemIds || []),
      tags: sorted(query.tags || []),
      difficulty: sorted(toArray(query.difficulty)),
      questionType: sorted(toArray(query.questionType)),
    },
    defaultLimit: options.defaultLimit,
    maxLimit: options.maxLimit,
  });
}

function cloneQueryResult(result: ContentQueryResult): ContentQueryResult {
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      programIds: [...item.programIds],
      conceptIds: [...item.conceptIds],
      skillIds: [...item.skillIds],
      tags: [...item.tags],
      metadata: { ...item.metadata },
    })),
  };
}

function toArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function sorted(values: string[]): string[] {
  return [...values].map(String).sort((a, b) => a.localeCompare(b));
}

function normalizeFilterValue(value: string): string {
  return String(value || '').trim().toLowerCase();
}
