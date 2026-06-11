import { queryContentItems } from './content-query';
import { buildMath6ContentGuardReport, type Math6ContentGuardReport } from './math6-content-guard-report';
import type { Math6RawSource } from './math6-import';
import { buildMath9ContentGuardReport, type Math9ContentGuardReport } from './math9-content-guard-report';
import type { Math9RawSource } from './math9-import';
import { buildMath10ContentGuardReport, type Math10ContentGuardReport } from './math10-content-guard-report';
import type { Math10RawSource } from './math10-import';
import type { ContentProgramId, MathLearningLevel, QuestionItem } from './standard';

export interface MathLearningCatalogOptions {
  programIds?: ContentProgramId[];
  grades?: number[];
  topicIds?: string[];
  levels?: MathLearningLevel[];
  strands?: string[];
  sourceFiles?: string[];
  exam10ClusterIds?: string[];
  exam10Stages?: string[];
  exam10ScoreBands?: string[];
  sourceRoles?: string[];
  displayReadyItemIds?: string[];
  includeBlocked?: boolean;
  includeUnscoredPractice?: boolean;
}

export interface MathLearningCatalogCoverage {
  readyQuestions: number;
  blockedQuestions: number;
  generatedFigures: number;
  byProgram: Record<string, number>;
  byGrade: Record<string, number>;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  byStrand: Record<string, number>;
  bySource: Record<string, number>;
  byExam10Cluster: Record<string, number>;
  byExam10Stage: Record<string, number>;
  byExam10ScoreBand: Record<string, number>;
  bySourceRole: Record<string, number>;
}

export interface MathLearningCatalog {
  items: QuestionItem[];
  blockedItems: QuestionItem[];
  allScopedItems: QuestionItem[];
  coverage: MathLearningCatalogCoverage;
}

export interface Math6LearningCatalogResult {
  catalog: MathLearningCatalog;
  guardReport: Math6ContentGuardReport;
  allItems: QuestionItem[];
}

export interface Math9LearningCatalogResult {
  catalog: MathLearningCatalog;
  guardReport: Math9ContentGuardReport;
  allItems: QuestionItem[];
}

export interface Math10LearningCatalogResult {
  catalog: MathLearningCatalog;
  guardReport: Math10ContentGuardReport;
  allItems: QuestionItem[];
}

export interface MathDiagnosticSelectionOptions {
  limit?: number;
  programId?: ContentProgramId;
  topicIds?: string[];
  levels?: MathLearningLevel[];
  difficulties?: string[];
}

export interface MathPracticeSelectionOptions {
  limit?: number;
  programId?: ContentProgramId;
  topicIds?: string[];
  levels?: MathLearningLevel[];
  conceptIds?: string[];
  skillIds?: string[];
  difficulty?: string | string[];
  attemptedItemIds?: string[];
}

export function buildMathLearningCatalog(items: QuestionItem[], options: MathLearningCatalogOptions = {}): MathLearningCatalog {
  const hasDisplayReadyFilter = Array.isArray(options.displayReadyItemIds);
  const displayReadyIds = new Set(options.displayReadyItemIds || []);
  const allScopedItems = items.filter((item) => matchesMathCatalogScope(item, options));
  const blockedItems = hasDisplayReadyFilter ? allScopedItems.filter((item) => !displayReadyIds.has(item.id)) : [];
  const readyItems = options.includeBlocked || !hasDisplayReadyFilter
    ? allScopedItems
    : allScopedItems.filter((item) => displayReadyIds.has(item.id));

  return {
    items: readyItems,
    blockedItems,
    allScopedItems,
    coverage: buildMathCatalogCoverage(readyItems, blockedItems),
  };
}

export function buildMath6LearningCatalogFromRawSources(rawSources: Math6RawSource[], options: MathLearningCatalogOptions = {}): Math6LearningCatalogResult {
  const { report, items } = buildMath6ContentGuardReport(rawSources);
  return {
    catalog: buildMathLearningCatalog(items, {
      ...options,
      displayReadyItemIds: options.includeUnscoredPractice ? report.displayReadyItemIds : report.scoredPracticeReadyItemIds,
    }),
    guardReport: report,
    allItems: items,
  };
}

export function buildMath9LearningCatalogFromRawSources(rawSources: Math9RawSource[], options: MathLearningCatalogOptions = {}): Math9LearningCatalogResult {
  const { report, items } = buildMath9ContentGuardReport(rawSources);
  return {
    catalog: buildMathLearningCatalog(items, {
      ...options,
      displayReadyItemIds: options.includeUnscoredPractice ? report.displayReadyItemIds : report.scoredPracticeReadyItemIds,
    }),
    guardReport: report,
    allItems: items,
  };
}

export function buildMath10LearningCatalogFromRawSources(rawSources: Math10RawSource[], options: MathLearningCatalogOptions = {}): Math10LearningCatalogResult {
  const { report, items } = buildMath10ContentGuardReport(rawSources);
  return {
    catalog: buildMathLearningCatalog(items, {
      ...options,
      displayReadyItemIds: options.includeUnscoredPractice ? report.displayReadyItemIds : report.scoredPracticeReadyItemIds,
    }),
    guardReport: report,
    allItems: items,
  };
}

export function selectMathDiagnosticItems(
  catalog: MathLearningCatalog,
  attemptedItemIds: string[] = [],
  options: MathDiagnosticSelectionOptions = {},
): QuestionItem[] {
  const limit = Math.max(1, Number(options.limit || 12));
  const attempted = new Set(attemptedItemIds);
  const pool = queryMathCatalogDetails(catalog, {
    mode: 'diagnostic',
    limit: Math.max(limit * 8, 100),
    programId: options.programId,
    excludeItemIds: attemptedItemIds,
    topicIds: options.topicIds,
    levels: options.levels,
    difficulty: options.difficulties || ['medium', 'hard'],
  });

  const fallbackPool = catalog.items.filter((item) => !attempted.has(item.id));
  return pickDiverseMathItems(pool.length >= limit ? pool : fallbackPool, limit);
}

export function selectMathPracticeItems(catalog: MathLearningCatalog, options: MathPracticeSelectionOptions = {}): QuestionItem[] {
  const limit = Math.max(1, Number(options.limit || 10));
  const pool = queryMathCatalogDetails(catalog, {
    mode: 'practice',
    limit: Math.max(limit * 8, 100),
    programId: options.programId,
    excludeItemIds: options.attemptedItemIds || [],
    conceptIds: options.conceptIds,
    skillIds: options.skillIds,
    difficulty: options.difficulty,
    topicIds: options.topicIds,
    levels: options.levels,
  });
  return pickDiverseMathItems(pool, limit);
}

function queryMathCatalogDetails(catalog: MathLearningCatalog, query: {
  mode: string;
  limit: number;
  programId?: ContentProgramId;
  excludeItemIds?: string[];
  conceptIds?: string[];
  skillIds?: string[];
  difficulty?: string | string[];
  topicIds?: string[];
  levels?: MathLearningLevel[];
}): QuestionItem[] {
  const byId = new Map(catalog.items.map((item) => [item.id, item]));
  const tagFilters = [
    ...(query.topicIds || []),
    ...(query.levels || []).map((level) => `level:${level}`),
  ];
  const result = queryContentItems(catalog.items, {
    programId: query.programId,
    domainId: 'mathematics',
    mode: query.mode,
    limit: query.limit,
    excludeItemIds: query.excludeItemIds,
    conceptIds: query.conceptIds,
    skillIds: query.skillIds,
    difficulty: query.difficulty,
    tags: tagFilters,
  }, {
    defaultLimit: query.limit,
    maxLimit: Math.max(query.limit, 100),
  });
  return result.items
    .map((summary) => byId.get(summary.id))
    .filter((item): item is QuestionItem => Boolean(item));
}

function matchesMathCatalogScope(item: QuestionItem, options: MathLearningCatalogOptions): boolean {
  if (item.domainId !== 'mathematics') return false;
  if (options.programIds?.length && !item.programIds.some((programId) => options.programIds?.includes(programId))) return false;
  if (options.grades?.length && !options.grades.includes(Number(item.metadata?.grade || 0))) return false;
  if (options.topicIds?.length && !options.topicIds.includes(String(item.metadata?.topicId || ''))) return false;
  if (options.levels?.length && !options.levels.includes(String(item.metadata?.level || '') as MathLearningLevel)) return false;
  if (options.strands?.length && !options.strands.includes(String(item.metadata?.strand || ''))) return false;
  if (options.sourceFiles?.length && !options.sourceFiles.includes(String(item.metadata?.sourceFile || ''))) return false;
  const exam10 = getExam10Metadata(item);
  if (options.exam10ClusterIds?.length && !options.exam10ClusterIds.includes(String(exam10?.clusterId || ''))) return false;
  if (options.exam10Stages?.length && !options.exam10Stages.includes(String(exam10?.stage || ''))) return false;
  if (options.exam10ScoreBands?.length && !options.exam10ScoreBands.includes(String(exam10?.scoreBand || ''))) return false;
  if (options.sourceRoles?.length && !options.sourceRoles.includes(String(exam10?.sourceRole || item.source || ''))) return false;
  return true;
}

function buildMathCatalogCoverage(readyItems: QuestionItem[], blockedItems: QuestionItem[]): MathLearningCatalogCoverage {
  const exam10Rows = readyItems.map(getExam10Metadata).filter((value): value is Record<string, unknown> => Boolean(value));
  return {
    readyQuestions: readyItems.length,
    blockedQuestions: blockedItems.length,
    generatedFigures: readyItems.filter((item) => Boolean(item.metadata?.generatedFigure)).length,
    byProgram: countBy(readyItems.flatMap((item) => item.programIds)),
    byGrade: countBy(readyItems.map((item) => String(item.metadata?.grade || 'unknown'))),
    byTopic: countBy(readyItems.map((item) => String(item.metadata?.topicId || 'unknown'))),
    byLevel: countBy(readyItems.map((item) => String(item.metadata?.level || 'unknown'))),
    byStrand: countBy(readyItems.map((item) => String(item.metadata?.strand || 'unknown'))),
    bySource: countBy(readyItems.map((item) => String(item.metadata?.sourceFile || 'unknown'))),
    byExam10Cluster: countBy(exam10Rows.map((exam10) => String(exam10.clusterId || 'unknown'))),
    byExam10Stage: countBy(exam10Rows.map((exam10) => String(exam10.stage || 'unknown'))),
    byExam10ScoreBand: countBy(exam10Rows.map((exam10) => String(exam10.scoreBand || 'unknown'))),
    bySourceRole: countBy(exam10Rows.map((exam10) => String(exam10.sourceRole || 'unknown'))),
  };
}

function getExam10Metadata(item: QuestionItem): Record<string, unknown> | undefined {
  const value = item.metadata?.exam10;
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function pickDiverseMathItems(pool: QuestionItem[], limit: number): QuestionItem[] {
  const selected: QuestionItem[] = [];
  const topicCounts = new Map<string, number>();
  const levelCounts = new Map<string, number>();
  const strandCounts = new Map<string, number>();

  for (const item of pool) {
    const topic = String(item.metadata?.topicId || 'unknown');
    const level = String(item.metadata?.level || 'unknown');
    const strand = String(item.metadata?.strand || 'unknown');
    if ((topicCounts.get(topic) || 0) >= Math.max(2, Math.ceil(limit * 0.35))) continue;
    if ((levelCounts.get(level) || 0) >= Math.max(4, Math.ceil(limit * 0.65))) continue;
    if ((strandCounts.get(strand) || 0) >= Math.max(5, Math.ceil(limit * 0.75))) continue;

    selected.push(item);
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    strandCounts.set(strand, (strandCounts.get(strand) || 0) + 1);
    if (selected.length >= limit) return selected;
  }

  for (const item of pool) {
    if (!selected.some((existing) => existing.id === item.id)) selected.push(item);
    if (selected.length >= limit) break;
  }
  return selected;
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((result, value) => {
    const key = value || 'unknown';
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}
