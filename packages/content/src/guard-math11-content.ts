import { buildMath11ContentGuardReport, type Math11ContentGuardReport, type Math11ContentIssue } from './math11-content-guard-report';
import type { Math11RawSource } from './math11-import';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = findWorkspaceRoot(process.cwd());
const rawPath = getPathArg('--raw', resolveDefaultMath11RawPath());
const outputDir = getPathArg('--outDir', path.resolve(workspaceRoot, 'reports/content-quality'));

const rawSources = readRawSources(rawPath);
const { report, items, displayReadyItems } = buildMath11ContentGuardReport(rawSources, { rawPath });
const excludedItems = items.filter((item) => !report.displayReadyItemIds.includes(item.id));

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'math11-content-guard.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math11-content-audit.md'), renderMarkdownReport(report), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math11-content-issues.csv'), renderIssuesCsv(report.issues), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math11-display-ready-preview.json'), JSON.stringify({
  report: {
    generatedAt: report.generatedAt,
    totalItems: items.length,
    displayReadyItems: displayReadyItems.length,
    generatedFigures: report.stats.generatedFigures,
  },
  items: displayReadyItems,
}, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math11-published-question-bank.json'), JSON.stringify({
  schemaVersion: 'math11_published_question_bank_v1',
  generatedAt: report.generatedAt,
  sourceRawPath: report.input.rawPath || '',
  sourceItems: items.length,
  publishedItems: displayReadyItems.length,
  excludedItems: excludedItems.length,
  exclusionReason: 'Excluded by Math 11 display gate before learner-facing publish.',
  items: displayReadyItems,
}, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math11-excluded-question-bank.json'), JSON.stringify({
  schemaVersion: 'math11_excluded_question_bank_v1',
  generatedAt: report.generatedAt,
  sourceRawPath: report.input.rawPath || '',
  excludedItems: excludedItems.length,
  issues: report.issues.filter((issue) => issue.severity === 'blocker'),
  items: excludedItems,
}, null, 2), 'utf8');

if (!process.argv.includes('--quiet')) {
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv.includes('--fail-on-adapter-error') && report.adapter.errors.length) {
  process.exitCode = 1;
}

if (process.argv.includes('--fail-on-blocker') && report.qualitySummary.blockers > 0) {
  process.exitCode = 1;
}

function readRawSources(filePath: string): Math11RawSource[] {
  if (!fs.existsSync(filePath)) {
    // Return empty array if extract file does not exist yet to prevent pre-extract crash
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  if (Array.isArray(parsed)) return parsed as Math11RawSource[];
  if (Array.isArray(parsed.sources)) return parsed.sources as Math11RawSource[];
  return [];
}

function renderMarkdownReport(report: Math11ContentGuardReport): string {
  const lines = [
    '# Math 11 Content Audit',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Sources: ${report.input.sources}`,
    `- Questions: ${report.stats.questions}`,
    `- Published learner questions: ${report.stats.displayReady}`,
    `- Excluded learner questions: ${Math.max(0, report.stats.questions - report.stats.displayReady)}`,
    `- Display-ready questions: ${report.stats.displayReady}`,
    `- Source-solution questions: ${report.stats.sourceSolutions}`,
    `- Correct-answer questions: ${report.stats.correctAnswers}`,
    `- Scored-practice-ready questions: ${report.stats.scoredPracticeReady}`,
    `- Blockers: ${report.qualitySummary.blockers}`,
    `- Warnings: ${report.qualitySummary.warnings}`,
    `- Adapter converted items: ${report.adapter.convertedItems}`,
    `- Adapter pass: ${report.adapter.pass ? 'yes' : 'no'}`,
    `- Raw path: ${report.input.rawPath || ''}`,
    '',
    '## Display Gate',
    '',
    `- Needs formula review: ${report.display.needsFormulaReview}`,
    `- Needs original image: ${report.display.needsOriginalImage}`,
    `- Needs text encoding review: ${report.display.needsTextEncodingReview}`,
    `- Fragmented formula text: ${report.display.fragmentedFormulaText}`,
    `- Source noise in prompt: ${report.display.sourceNoiseInPrompt}`,
    `- Answer-key leakage in prompt: ${report.display.answerKeyLeakageInPrompt}`,
    `- Prompt control characters: ${report.display.promptControlCharacters}`,
    `- Raw sources with Word/OLE markers: ${report.display.rawSourcesWithOleMarkers}`,
    `- Raw Word/OLE markers total: ${report.display.rawOleMarkersTotal}`,
    '',
    '## Issue Summary',
    '',
    '| Code | Count |',
    '| --- | ---: |',
    ...entriesByCount(report.qualitySummary.byCode).map(([code, count]) => `| ${escapeMarkdownCell(code)} | ${count} |`),
    '',
    '## Topic Coverage',
    '',
    '| Topic | Questions |',
    '| --- | ---: |',
    ...entriesByCount(report.stats.byTopic).map(([topic, count]) => `| ${escapeMarkdownCell(topic)} | ${count} |`),
    '',
    '## Level Coverage',
    '',
    '| Level | Questions |',
    '| --- | ---: |',
    ...entriesByCount(report.stats.byLevel).map(([level, count]) => `| ${escapeMarkdownCell(level)} | ${count} |`),
  ];

  return `${lines.join('\n')}\n`;
}

function renderIssuesCsv(issues: Math11ContentIssue[]): string {
  const header = ['severity', 'code', 'questionId', 'sourceFile', 'topicId', 'field', 'path', 'message'];
  const rows = issues.map((issue) => [
    issue.severity,
    issue.code,
    issue.questionId || '',
    issue.sourceFile || '',
    issue.topicId || '',
    issue.field || '',
    issue.path,
    issue.message,
  ]);
  return renderCsv([header, ...rows]);
}

function renderCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n') + '\n';
}

function escapeCsvCell(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function escapeMarkdownCell(value: string): string {
  return String(value).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function entriesByCount(record: Record<string, number>): Array<[string, number]> {
  return Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function getPathArg(name: string, fallback: string): string {
  const value = getArgValue(name);
  return value ? path.resolve(workspaceRoot, value) : fallback;
}

function resolveDefaultMath11RawPath(): string {
  return path.resolve(workspaceRoot, 'reports/content-quality/math11-rich-raw-extract.json');
}

function getArgValue(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0) return '';
  return process.argv[index + 1] || '';
}

function findWorkspaceRoot(startDir: string): string {
  let current = path.resolve(startDir);
  while (current && current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'apps')) && fs.existsSync(path.join(current, 'packages', 'content'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.resolve(startDir);
}
