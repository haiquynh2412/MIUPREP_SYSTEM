import * as mocks from './mocks';
import { auditEnglishExamTests, summarizeContentQualityIssues } from './validator';
import type { EnglishExamTest } from './standard';

declare const process: { argv: string[]; exitCode?: number };

const tests = dedupeEnglishExamTests(Object.values(mocks).filter(isEnglishExamTest) as EnglishExamTest[]);
const issues = auditEnglishExamTests(tests);
const summary = summarizeContentQualityIssues(tests, issues);
const blockers = issues.filter((issue) => issue.severity === 'blocker');
const warnings = issues.filter((issue) => issue.severity === 'warning');
const failOnBlocker = process.argv.includes('--fail-on-blocker');

console.log(JSON.stringify(summary, null, 2));

if (blockers.length) {
  console.log('\nTop blocker issues:');
  blockers.slice(0, 25).forEach((issue) => {
    console.log(`- ${issue.code} | ${issue.testId || 'unknown'} | ${issue.questionId || '-'} | ${issue.path}`);
  });
}

if (warnings.length) {
  console.log('\nTop warning issues:');
  warnings.slice(0, 25).forEach((issue) => {
    console.log(`- ${issue.code} | ${issue.testId || 'unknown'} | ${issue.questionId || '-'} | ${issue.path}`);
  });
}

if (failOnBlocker && blockers.length) {
  process.exitCode = 1;
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
