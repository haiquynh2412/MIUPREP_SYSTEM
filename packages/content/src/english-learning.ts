import type { ContentProgramId, EnglishExamSkill, EnglishExamTest, MockTest, Passage, QuestionItem } from './standard';
import { queryContentItems } from './content-query';
import { isEnglishQuestionLearningReady, toMockTestFromEnglishExam, toPassagesFromEnglishExam, toQuestionItemFromEnglishExam } from './standard';
import type { ContentQualityIssue, ContentQualitySummary } from './validator';
import { auditEnglishExamTests, summarizeContentQualityIssues } from './validator';

export interface EnglishLearningCatalogOptions {
  programIds?: ContentProgramId[];
  skills?: EnglishExamSkill[];
  displayModes?: string[];
}

export interface EnglishLearningCatalogCoverage {
  readyQuestions: number;
  blockedQuestions: number;
  warningIssues: number;
  byProgram: Record<string, number>;
  bySkill: Record<string, number>;
  byQuestionType: Record<string, number>;
  byConcept: Record<string, number>;
  bySourceTest: Record<string, number>;
}

export interface EnglishLearningCatalog {
  items: QuestionItem[];
  mockTests: MockTest[];
  passages: Passage[];
  qualitySummary: ContentQualitySummary;
  blockedIssues: ContentQualityIssue[];
  warningIssues: ContentQualityIssue[];
  coverage: EnglishLearningCatalogCoverage;
}

export interface EnglishDiagnosticSelectionOptions {
  limit?: number;
  programId?: ContentProgramId;
  skills?: EnglishExamSkill[];
  difficulties?: string[];
}

export interface EnglishPracticeSelectionOptions {
  limit?: number;
  programId?: ContentProgramId;
  conceptIds?: string[];
  skillIds?: string[];
  difficulty?: string;
  attemptedItemIds?: string[];
}

export function buildEnglishLearningCatalog(tests: EnglishExamTest[], options: EnglishLearningCatalogOptions = {}): EnglishLearningCatalog {
  const programFilter = new Set((options.programIds || []).map(normalizeFilterValue));
  const skillFilter = new Set((options.skills || []).map(normalizeFilterValue));
  const displayModeFilter = new Set((options.displayModes || ['both', 'test', 'topic']).map(normalizeFilterValue));
  const issues = auditEnglishExamTests(tests);
  const blockedIssues = issues.filter((issue) => issue.severity === 'blocker');
  const warningIssues = issues.filter((issue) => issue.severity === 'warning');
  const items: QuestionItem[] = [];
  const readyItemIdsByTest = new Map<string, Set<string>>();

  for (const test of tests) {
    for (const section of test.sections || []) {
      for (const group of section.questionGroups || []) {
        for (const question of group.questions || []) {
          if (!isEnglishQuestionLearningReady(test, section, group, question)) continue;
          const item = toQuestionItemFromEnglishExam(test, section, group, question);
          if (programFilter.size && !item.programIds.some((programId) => programFilter.has(normalizeFilterValue(programId)))) continue;
          if (skillFilter.size && !skillFilter.has(normalizeFilterValue(String(item.metadata?.testSkill || '')))) continue;
          if (!displayModeFilter.has(normalizeFilterValue(String(item.metadata?.displayMode || 'both')))) continue;

          items.push(item);
          const testId = String(item.metadata?.testId || '');
          const ids = readyItemIdsByTest.get(testId) || new Set<string>();
          ids.add(item.id);
          readyItemIdsByTest.set(testId, ids);
        }
      }
    }
  }

  const mockTests = tests
    .map((test) => filterMockTestToReadyItems(toMockTestFromEnglishExam(test), readyItemIdsByTest.get(test.id) || new Set<string>()))
    .filter((mockTest) => mockTest.questionIds.length > 0);

  return {
    items,
    mockTests,
    passages: tests.flatMap(toPassagesFromEnglishExam),
    qualitySummary: summarizeContentQualityIssues(tests, issues),
    blockedIssues,
    warningIssues,
    coverage: buildCatalogCoverage(items, blockedIssues, warningIssues),
  };
}

export function filterEnglishExamTestsToLearningReady(tests: EnglishExamTest[], options: EnglishLearningCatalogOptions = {}): EnglishExamTest[] {
  return tests
    .map((test) => filterEnglishExamTestToLearningReady(test, options))
    .filter((test): test is EnglishExamTest => Boolean(test));
}

export function filterEnglishExamTestToLearningReady(test: EnglishExamTest, options: EnglishLearningCatalogOptions = {}): EnglishExamTest | null {
  const programFilter = new Set((options.programIds || []).map(normalizeFilterValue));
  const skillFilter = new Set((options.skills || []).map(normalizeFilterValue));
  const displayModeFilter = new Set((options.displayModes || ['both', 'test', 'topic']).map(normalizeFilterValue));
  const programId = inferProgramIdForFilter(test);

  if (programFilter.size && !programFilter.has(programId)) return null;
  if (skillFilter.size && !skillFilter.has(normalizeFilterValue(test.skill))) return null;

  const sections = (test.sections || [])
    .map((section) => {
      const questionGroups = (section.questionGroups || [])
        .map((group) => {
          const questions = (group.questions || []).filter((question) => {
            const displayMode = normalizeFilterValue(String(question.displayMode || 'both'));
            return displayModeFilter.has(displayMode) && isEnglishQuestionLearningReady(test, section, group, question);
          });
          return { ...group, questions };
        })
        .filter((group) => group.questions.length > 0);
      return { ...section, questionGroups };
    })
    .filter((section) => section.questionGroups.length > 0);

  if (!sections.length) return null;
  return { ...test, sections };
}

export function selectEnglishDiagnosticItems(
  catalog: EnglishLearningCatalog,
  attemptedItemIds: string[] = [],
  options: EnglishDiagnosticSelectionOptions = {},
): QuestionItem[] {
  const limit = Math.max(1, Number(options.limit || 12));
  const attempted = new Set(attemptedItemIds);
  const pool = queryEnglishCatalogDetails(catalog, {
    mode: 'diagnostic',
    limit: Math.max(limit * 8, 100),
    programId: options.programId,
    excludeItemIds: attemptedItemIds,
    difficulty: options.difficulties || ['medium', 'hard'],
    tags: options.skills?.map(String),
  });

  return pickDiverseEnglishItems(pool.length >= limit ? pool : catalog.items.filter((item) => !attempted.has(item.id)), limit);
}

export function selectEnglishPracticeItems(catalog: EnglishLearningCatalog, options: EnglishPracticeSelectionOptions = {}): QuestionItem[] {
  const limit = Math.max(1, Number(options.limit || 10));
  const pool = queryEnglishCatalogDetails(catalog, {
    mode: 'practice',
    limit: Math.max(limit * 8, 100),
    programId: options.programId,
    excludeItemIds: options.attemptedItemIds || [],
    conceptIds: options.conceptIds,
    skillIds: options.skillIds,
    difficulty: options.difficulty,
  });
  return pickDiverseEnglishItems(pool, limit);
}

function queryEnglishCatalogDetails(catalog: EnglishLearningCatalog, query: {
  mode: string;
  limit: number;
  programId?: ContentProgramId;
  excludeItemIds?: string[];
  conceptIds?: string[];
  skillIds?: string[];
  difficulty?: string | string[];
  tags?: string[];
}): QuestionItem[] {
  const byId = new Map(catalog.items.map((item) => [item.id, item]));
  const result = queryContentItems(catalog.items, {
    programId: query.programId,
    mode: query.mode,
    limit: query.limit,
    excludeItemIds: query.excludeItemIds,
    conceptIds: query.conceptIds,
    skillIds: query.skillIds,
    difficulty: query.difficulty,
    tags: query.tags,
  }, {
    defaultLimit: query.limit,
    maxLimit: Math.max(query.limit, 100),
  });
  return result.items
    .map((summary) => byId.get(summary.id))
    .filter((item): item is QuestionItem => Boolean(item));
}

function filterMockTestToReadyItems(mockTest: MockTest, readyIds: Set<string>): MockTest {
  const sections = (mockTest.sections || [])
    .map((section) => ({
      ...section,
      questionIds: section.questionIds.filter((questionId) => readyIds.has(questionId)),
    }))
    .filter((section) => section.questionIds.length > 0);

  return {
    ...mockTest,
    questionIds: mockTest.questionIds.filter((questionId) => readyIds.has(questionId)),
    sections,
  };
}

function buildCatalogCoverage(items: QuestionItem[], blockers: ContentQualityIssue[], warnings: ContentQualityIssue[]): EnglishLearningCatalogCoverage {
  const blockedQuestionKeys = new Set(blockers.filter((issue) => issue.questionId).map((issue) => [issue.testId, issue.sectionId, issue.groupId, issue.questionId].join('::')));
  const masteryReadyItems = items.filter((item) => item.masteryPolicy !== 'feedback_only');
  return {
    readyQuestions: masteryReadyItems.length,
    blockedQuestions: blockedQuestionKeys.size,
    warningIssues: warnings.length,
    byProgram: countBy(masteryReadyItems.flatMap((item) => item.programIds)),
    bySkill: countBy(masteryReadyItems.map((item) => String(item.metadata?.skillArea || item.metadata?.testSkill || 'unknown'))),
    byQuestionType: countBy(masteryReadyItems.map((item) => item.type)),
    byConcept: countBy(masteryReadyItems.flatMap((item) => item.conceptIds)),
    bySourceTest: countBy(masteryReadyItems.map((item) => String(item.metadata?.testId || 'unknown'))),
  };
}

function pickDiverseEnglishItems(pool: QuestionItem[], limit: number): QuestionItem[] {
  const selected: QuestionItem[] = [];
  const programCounts = new Map<string, number>();
  const skillCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();

  for (const item of pool) {
    const program = item.programIds[0] || 'unknown';
    const skill = String(item.metadata?.testSkill || 'unknown');
    const type = item.type || 'unknown';
    if ((programCounts.get(program) || 0) >= Math.max(4, Math.ceil(limit * 0.7))) continue;
    if ((skillCounts.get(skill) || 0) >= Math.max(3, Math.ceil(limit * 0.5))) continue;
    if ((typeCounts.get(type) || 0) >= Math.max(2, Math.ceil(limit * 0.4))) continue;
    selected.push(item);
    programCounts.set(program, (programCounts.get(program) || 0) + 1);
    skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
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

function normalizeFilterValue(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function inferProgramIdForFilter(test: EnglishExamTest): string {
  const explicit = normalizeFilterValue(String(test.exam || ''));
  if (explicit) return explicit;
  const text = normalizeFilterValue(`${test.id} ${test.title}`);
  if (text.includes('cpe') || text.includes('proficiency')) return 'cpe';
  if (text.includes('cae') || text.includes('advanced')) return 'cae';
  if (text.includes('sat')) return 'sat';
  return 'ielts';
}
