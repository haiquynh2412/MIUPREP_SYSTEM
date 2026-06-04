import * as mocks from './mocks';
import type { ContentQualityIssue } from './validator';
import { auditEnglishExamTests, summarizeContentQualityIssues } from './validator';
import type { EnglishExamQuestion, EnglishExamQuestionGroup, EnglishExamSection, EnglishExamTest } from './standard';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

interface QuestionContext {
  testId: string;
  testTitle: string;
  exam: string;
  skill: string;
  sectionId: string;
  sectionTitle: string;
  groupId: string;
  questionId: string;
  questionType: string;
  instruction: string;
  sourceFile: string;
}

interface AffectedQuestion extends QuestionContext {
  severity: 'blocker' | 'warning';
  issueCodes: string[];
  issueMessages: string[];
  issuePaths: string[];
}

const tests = dedupeEnglishExamTests(Object.values(mocks).filter(isEnglishExamTest) as EnglishExamTest[]);
const sourceFilesByTestId = buildSourceFileLookup();
const questionIndex = buildQuestionIndex(tests, sourceFilesByTestId);
const issues = auditEnglishExamTests(tests);
const summary = summarizeContentQualityIssues(tests, issues);
const affectedQuestions = buildAffectedQuestions(issues, questionIndex);

const outputDir = getArgValue('--outDir') || path.resolve(process.cwd(), '..', '..', 'reports', 'content-quality');
fs.mkdirSync(outputDir, { recursive: true });

const jsonPath = path.join(outputDir, 'english-content-issues.json');
const csvPath = path.join(outputDir, 'english-content-issues.csv');
const markdownPath = path.join(outputDir, 'english-content-affected-questions.md');

fs.writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary,
      issues,
      affectedQuestions,
    },
    null,
    2,
  ),
);

fs.writeFileSync(csvPath, toCsv(issues, questionIndex));
fs.writeFileSync(markdownPath, toMarkdown(summary, affectedQuestions, issues));

console.log(JSON.stringify({ outputDir, jsonPath, csvPath, markdownPath, summary }, null, 2));

function buildQuestionIndex(testsToIndex: EnglishExamTest[], sourceLookup: Record<string, string>): Record<string, QuestionContext> {
  const index: Record<string, QuestionContext> = {};
  for (const test of testsToIndex) {
    for (const section of test.sections || []) {
      for (const group of section.questionGroups || []) {
        for (const question of group.questions || []) {
          const key = questionKey(test.id, section.id, group.id, question.id);
          index[key] = buildQuestionContext(test, section, group, question, sourceLookup);
        }
      }
    }
  }
  return index;
}

function buildQuestionContext(
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: EnglishExamQuestion,
  sourceLookup: Record<string, string>,
): QuestionContext {
  return {
    testId: String(test.id || ''),
    testTitle: String(test.title || ''),
    exam: String(test.exam || ''),
    skill: String(test.skill || ''),
    sectionId: String(section.id || ''),
    sectionTitle: String(section.title || ''),
    groupId: String(group.id || ''),
    questionId: String(question.id || ''),
    questionType: String(question.type || ''),
    instruction: compactText(question.instruction || group.instruction || section.instructions || ''),
    sourceFile: sourceLookup[String(test.id || '')] || '',
  };
}

function buildAffectedQuestions(
  issueList: ContentQualityIssue[],
  index: Record<string, QuestionContext>,
): AffectedQuestion[] {
  const grouped = new Map<string, AffectedQuestion>();
  for (const issue of issueList) {
    if (!issue.questionId) continue;
    const key = questionKey(issue.testId || '', issue.sectionId || '', issue.groupId || '', issue.questionId || '');
    const context =
      index[key] ||
      ({
        testId: issue.testId || '',
        testTitle: '',
        exam: '',
        skill: '',
        sectionId: issue.sectionId || '',
        sectionTitle: '',
        groupId: issue.groupId || '',
        questionId: issue.questionId || '',
        questionType: '',
        instruction: '',
        sourceFile: '',
      } satisfies QuestionContext);
    const current =
      grouped.get(key) ||
      ({
        ...context,
        severity: 'warning',
        issueCodes: [],
        issueMessages: [],
        issuePaths: [],
      } satisfies AffectedQuestion);

    current.severity = current.severity === 'blocker' || issue.severity === 'blocker' ? 'blocker' : 'warning';
    current.issueCodes = unique([...current.issueCodes, issue.code]);
    current.issueMessages = unique([...current.issueMessages, issue.message]);
    current.issuePaths = unique([...current.issuePaths, issue.path]);
    grouped.set(key, current);
  }

  return [...grouped.values()].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      a.exam.localeCompare(b.exam) ||
      a.testId.localeCompare(b.testId) ||
      naturalSortKey(a.questionId).localeCompare(naturalSortKey(b.questionId)),
  );
}

function toCsv(issueList: ContentQualityIssue[], index: Record<string, QuestionContext>): string {
  const headers = [
    'severity',
    'code',
    'exam',
    'skill',
    'testId',
    'testTitle',
    'sourceFile',
    'sectionId',
    'sectionTitle',
    'groupId',
    'questionId',
    'questionType',
    'instruction',
    'path',
    'message',
  ];
  const rows = issueList.map((issue) => {
    const context = issue.questionId ? index[questionKey(issue.testId || '', issue.sectionId || '', issue.groupId || '', issue.questionId || '')] : undefined;
    return [
      issue.severity,
      issue.code,
      context?.exam || '',
      context?.skill || '',
      issue.testId || '',
      context?.testTitle || '',
      context?.sourceFile || '',
      issue.sectionId || '',
      context?.sectionTitle || '',
      issue.groupId || '',
      issue.questionId || '',
      context?.questionType || '',
      context?.instruction || '',
      issue.path,
      issue.message,
    ];
  });
  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

function toMarkdown(summary: ReturnType<typeof summarizeContentQualityIssues>, affected: AffectedQuestion[], issueList: ContentQualityIssue[]): string {
  const blockers = affected.filter((entry) => entry.severity === 'blocker');
  const warnings = affected.filter((entry) => entry.severity === 'warning');
  const byCode = Object.entries(summary.byCode).sort((a, b) => b[1] - a[1]);
  const lines = [
    '# English Content Affected Questions',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Tests: ${summary.tests}`,
    `- Questions: ${summary.questions}`,
    `- Blocker issues: ${summary.blockers}`,
    `- Warning issues: ${summary.warnings}`,
    `- Affected questions with blockers: ${blockers.length}`,
    `- Affected questions with warnings only: ${warnings.length}`,
    `- Non-question/test-level issues: ${issueList.filter((issue) => !issue.questionId).length}`,
    '',
    '## Issue Codes',
    '',
    ...byCode.map(([code, count]) => `- ${code}: ${count}`),
    '',
    '## Blocked Questions',
    '',
    ...formatAffectedQuestions(blockers),
    '',
    '## Warning-Only Questions',
    '',
    ...formatAffectedQuestions(warnings),
  ];
  return `${lines.join('\n')}\n`;
}

function formatAffectedQuestions(questions: AffectedQuestion[]): string[] {
  if (!questions.length) return ['None.'];
  return questions.map((question) => {
    const source = question.sourceFile ? ` | ${question.sourceFile}` : '';
    const instruction = question.instruction ? ` | ${truncate(question.instruction, 100)}` : '';
    return `- ${question.severity.toUpperCase()} | ${question.exam || '-'} | ${question.skill || '-'} | ${question.testId} | ${question.sectionId} | ${question.groupId} | ${question.questionId} | ${question.questionType || '-'} | ${question.issueCodes.join('; ')}${source}${instruction}`;
  });
}

function buildSourceFileLookup(): Record<string, string> {
  const mocksDir = path.resolve(process.cwd(), 'src', 'mocks');
  const lookup: Record<string, string> = {};
  if (!fs.existsSync(mocksDir)) return lookup;
  const files = fs.readdirSync(mocksDir).filter((file: string) => file.endsWith('.json'));
  for (const file of files) {
    try {
      const fullPath = path.join(mocksDir, file);
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (parsed?.id) lookup[String(parsed.id)] = path.join('packages', 'content', 'src', 'mocks', file).replace(/\\/g, '/');
    } catch {
      // Keep export resilient. Schema validation reports content issues elsewhere.
    }
  }
  lookup['cae-sample-1'] = lookup['cpe-sample-1'] || 'packages/content/src/mocks/cpe-sample-1.json';
  for (let index = 1; index <= 10; index += 1) {
    lookup[`cae-entry-test-${index}`] = lookup[`cpe-entry-test-${index}`] || `packages/content/src/mocks/cpe-entry-test${index}.json`;
  }
  return lookup;
}

function getArgValue(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0) return '';
  return process.argv[index + 1] || '';
}

function isEnglishExamTest(value: unknown): value is EnglishExamTest {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as { sections?: unknown }).sections));
}

function dedupeEnglishExamTests(testsToDedupe: EnglishExamTest[]): EnglishExamTest[] {
  const seen = new Set<string>();
  return testsToDedupe.filter((test) => {
    const key = String(test.id || '').trim();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function questionKey(testId: string, sectionId: string, groupId: string, questionId: string): string {
  return [testId, sectionId, groupId, questionId].join('::');
}

function compactText(value: string): string {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function csvEscape(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function severityRank(severity: string): number {
  return severity === 'blocker' ? 0 : 1;
}

function naturalSortKey(value: string): string {
  return String(value || '').replace(/\d+/g, (match) => match.padStart(8, '0'));
}
