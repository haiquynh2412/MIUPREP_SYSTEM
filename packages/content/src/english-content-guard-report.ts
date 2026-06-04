import * as mocks from './mocks';
import { buildEnglishLearningCatalog, type EnglishLearningCatalogCoverage } from './english-learning';
import type { EnglishExamTest } from './standard';
import type { ContentQualitySummary, ValidationError } from './validator';
import { validateStandardContentBundle } from './validator';

export interface ContentQualityIssueSnapshot {
  code: string;
  count: number;
}

export interface EnglishSkillReadinessSnapshot {
  skill: 'reading' | 'listening' | 'use_of_english' | 'writing' | 'speaking';
  label: string;
  totalItems: number;
  learningReadyItems: number;
  feedbackOnlyItems: number;
  blockerItems: number;
  warningItems: number;
  byProgram: Record<string, number>;
}

export interface EnglishContentGuardReport {
  schemaVersion: 'english_content_guard_v1';
  generatedAt: string;
  input: {
    tests: number;
  };
  qualitySummary: ContentQualitySummary & {
    topIssues: ContentQualityIssueSnapshot[];
  };
  coverage: EnglishLearningCatalogCoverage;
  skillReadiness: EnglishSkillReadinessSnapshot[];
  adapter: {
    readyItems: number;
    mockTests: number;
    passages: number;
    errors: ValidationError[];
    pass: boolean;
  };
}

export function buildEnglishContentGuardReport(generatedAt = new Date().toISOString()): EnglishContentGuardReport {
  const tests = listEnglishExamTestsFromMocks();
  const catalog = buildEnglishLearningCatalog(tests);
  const bundleErrors = validateStandardContentBundle({
    questions: catalog.items,
    mockTests: catalog.mockTests,
    passages: catalog.passages,
  });

  return {
    schemaVersion: 'english_content_guard_v1',
    generatedAt,
    input: {
      tests: tests.length,
    },
    qualitySummary: {
      ...catalog.qualitySummary,
      topIssues: summarizeTopIssueCodes(catalog.qualitySummary.byCode),
    },
    coverage: catalog.coverage,
    skillReadiness: buildSkillReadiness(tests, catalog),
    adapter: {
      readyItems: catalog.items.length,
      mockTests: catalog.mockTests.length,
      passages: catalog.passages.length,
      errors: bundleErrors,
      pass: bundleErrors.length === 0,
    },
  };
}

export function listEnglishExamTestsFromMocks(): EnglishExamTest[] {
  return dedupeEnglishExamTests(Object.values(mocks).filter(isEnglishExamTest) as EnglishExamTest[]);
}

function dedupeEnglishExamTests(tests: EnglishExamTest[]): EnglishExamTest[] {
  const seen = new Set<string>();
  return tests.filter((test) => {
    const key = String(test.id || '').trim();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function summarizeTopIssueCodes(byCode: Record<string, number>, limit = 5): ContentQualityIssueSnapshot[] {
  const grouped = Object.entries(byCode).reduce<Record<string, number>>((result, [code, count]) => {
    const normalizedCode = normalizeIssueCode(code);
    result[normalizedCode] = (result[normalizedCode] || 0) + count;
    return result;
  }, {});

  return Object.entries(grouped)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
    .slice(0, Math.max(1, limit));
}

function buildSkillReadiness(tests: EnglishExamTest[], catalog: ReturnType<typeof buildEnglishLearningCatalog>): EnglishSkillReadinessSnapshot[] {
  const rows = new Map<EnglishSkillReadinessSnapshot['skill'], EnglishSkillReadinessSnapshot>();
  const testMeta = new Map<string, { skill: EnglishSkillReadinessSnapshot['skill']; program: string }>();
  const questionMeta = new Map<string, { skill: EnglishSkillReadinessSnapshot['skill']; program: string }>();

  SKILL_ROWS.forEach((definition) => {
    rows.set(definition.skill, {
      ...definition,
      totalItems: 0,
      learningReadyItems: 0,
      feedbackOnlyItems: 0,
      blockerItems: 0,
      warningItems: 0,
      byProgram: {},
    });
  });

  tests.forEach((test) => {
    const program = inferProgramId(test);
    testMeta.set(String(test.id || 'unknown'), { skill: normalizeSkill(test.skill), program });
    for (const section of test.sections || []) {
      for (const group of section.questionGroups || []) {
        for (const question of group.questions || []) {
          const skill = inferQuestionSkillArea(test, section, question);
          questionMeta.set(questionMetaKey(test.id, section.id, group.id, question.id), { skill, program });
          incrementSkillRow(rows, skill, 'totalItems', 1);
          incrementProgram(rows.get(skill)?.byProgram, program, 1);
        }
      }
    }
  });

  catalog.items.forEach((item) => {
    const skill = normalizeSkill(String(item.metadata?.skillArea || item.metadata?.testSkill || 'reading'));
    incrementSkillRow(rows, skill, 'learningReadyItems', 1);
  });

  const blockedQuestionKeys = new Set<string>();
  catalog.blockedIssues.forEach((issue) => {
    const meta =
      questionMeta.get(questionMetaKey(issue.testId, issue.sectionId, issue.groupId, issue.questionId)) ||
      testMeta.get(String(issue.testId || '')) ||
      { skill: normalizeSkill('reading'), program: 'unknown' };
    if (issue.questionId) {
      const key = [issue.testId, issue.sectionId, issue.groupId, issue.questionId].join('::');
      if (blockedQuestionKeys.has(key)) return;
      blockedQuestionKeys.add(key);
    }
    incrementSkillRow(rows, meta.skill, 'blockerItems', 1);
  });

  const warningQuestionKeys = new Set<string>();
  catalog.warningIssues.forEach((issue) => {
    const meta =
      questionMeta.get(questionMetaKey(issue.testId, issue.sectionId, issue.groupId, issue.questionId)) ||
      testMeta.get(String(issue.testId || '')) ||
      { skill: normalizeSkill('reading'), program: 'unknown' };
    if (issue.questionId) {
      const key = [issue.testId, issue.sectionId, issue.groupId, issue.questionId].join('::');
      if (warningQuestionKeys.has(key)) return;
      warningQuestionKeys.add(key);
    }
    incrementSkillRow(rows, meta.skill, 'warningItems', 1);
  });

  collectFeedbackSamples().forEach((sample) => {
    incrementSkillRow(rows, sample.skill, 'totalItems', sample.count);
    incrementSkillRow(rows, sample.skill, 'feedbackOnlyItems', sample.count);
    incrementProgram(rows.get(sample.skill)?.byProgram, sample.program, sample.count);
  });

  return SKILL_ROWS.map((definition) => rows.get(definition.skill) as EnglishSkillReadinessSnapshot);
}

const SKILL_ROWS: Pick<EnglishSkillReadinessSnapshot, 'skill' | 'label'>[] = [
  { skill: 'reading', label: 'Reading' },
  { skill: 'listening', label: 'Listening' },
  { skill: 'use_of_english', label: 'Use of English' },
  { skill: 'writing', label: 'Writing' },
  { skill: 'speaking', label: 'Speaking' },
];

function collectFeedbackSamples(): Array<{ skill: EnglishSkillReadinessSnapshot['skill']; program: string; count: number }> {
  return Object.entries(mocks).flatMap(([exportName, value]) => {
    if (!Array.isArray(value) || value.length === 0) return [];
    const first = value[0] as Record<string, unknown>;
    const skill = inferFeedbackSkill(first);
    if (!skill) return [];
    return [{ skill, program: inferProgramFromExport(exportName, first), count: value.length }];
  });
}

function inferFeedbackSkill(sample: Record<string, unknown>): EnglishSkillReadinessSnapshot['skill'] | '' {
  if (typeof sample.sampleAnswer === 'string' && typeof sample.prompt === 'string') return 'writing';
  if (typeof sample.sampleTranscript === 'string' && typeof sample.prompt === 'string') return 'speaking';
  return '';
}

function inferQuestionSkillArea(test: EnglishExamTest, section: EnglishExamTest['sections'][number], question: EnglishExamTest['sections'][number]['questionGroups'][number]['questions'][number]): EnglishSkillReadinessSnapshot['skill'] {
  const explicitSkill = normalizeSkill(String(test.skill || 'reading'));
  if (explicitSkill !== 'reading') return explicitSkill;

  const program = inferProgramId(test);
  const topicSkill = normalizeSkill(String((question as { topic?: { skill?: string } }).topic?.skill || ''));
  const category = String(question.category || '').toLowerCase();
  if (topicSkill !== 'reading') return topicSkill;
  if (category.includes('_listening_')) return 'listening';
  if (category.includes('use_of_english')) return 'use_of_english';
  if (category.includes('_reading_')) return 'reading';

  const text = `${section.title || ''} ${section.instructions || ''} ${question.category || ''} ${question.type || ''}`.toLowerCase();
  const cambridgeUseOfEnglish =
    (program === 'cpe' || program === 'cae') &&
    (/\bpart\s*[1-4]\b/.test(text) ||
      /cpe_part_[1-4]|cae_part_[1-4]/.test(text) ||
      text.includes('cloze') ||
      text.includes('word formation') ||
      text.includes('key word transformation'));

  return cambridgeUseOfEnglish ? 'use_of_english' : explicitSkill;
}

function inferProgramFromExport(exportName: string, sample: Record<string, unknown>): string {
  const text = `${exportName} ${String(sample.id || '')}`.toLowerCase();
  if (text.includes('cpe')) return 'cpe';
  if (text.includes('cae')) return 'cae';
  if (text.includes('sat')) return 'sat';
  return 'ielts';
}

function normalizeSkill(value: string): EnglishSkillReadinessSnapshot['skill'] {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'listening') return 'listening';
  if (normalized === 'use_of_english') return 'use_of_english';
  if (normalized === 'writing') return 'writing';
  if (normalized === 'speaking') return 'speaking';
  return 'reading';
}

function inferProgramId(test: EnglishExamTest): string {
  return String(test.exam || inferProgramFromExport('', { id: test.id, title: test.title }));
}

function questionMetaKey(testId?: string, sectionId?: string, groupId?: string, questionId?: string): string {
  return [testId || '', sectionId || '', groupId || '', questionId || ''].join('::');
}

function incrementSkillRow(
  rows: Map<EnglishSkillReadinessSnapshot['skill'], EnglishSkillReadinessSnapshot>,
  skill: EnglishSkillReadinessSnapshot['skill'],
  field: 'totalItems' | 'learningReadyItems' | 'feedbackOnlyItems' | 'blockerItems' | 'warningItems',
  amount: number,
): void {
  const row = rows.get(skill);
  if (!row) return;
  row[field] += amount;
}

function incrementProgram(target: Record<string, number> | undefined, program: string, amount: number): void {
  if (!target) return;
  target[program] = (target[program] || 0) + amount;
}

function isEnglishExamTest(value: unknown): value is EnglishExamTest {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as { sections?: unknown }).sections));
}

function normalizeIssueCode(code: string): string {
  if (/^schema\.sections\[\d+\]\.questionGroups\[\d+\]\.questions\[\d+\]\.blankIndex$/.test(code)) {
    return 'schema.sections[*].questionGroups[*].questions[*].blankIndex';
  }
  if (/^schema\.sections\[\d+\]\.transcript$/.test(code)) {
    return 'schema.sections[*].transcript';
  }
  if (/^schema\.sections\[\d+\]\.passageHtml$/.test(code)) {
    return 'schema.sections[*].passageHtml';
  }
  return code;
}
