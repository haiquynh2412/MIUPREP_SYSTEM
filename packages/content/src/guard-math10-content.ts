import { buildMath10ContentGuardReport, type Math10ContentGuardReport, type Math10ContentIssue } from './math10-content-guard-report';
import type { Math10RawSource } from './math10-import';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = findWorkspaceRoot(process.cwd());
const rawPath = getPathArg('--raw', resolveDefaultMath10RawPath());
const outputDir = getPathArg('--outDir', path.resolve(workspaceRoot, 'reports/content-quality'));

const rawSources = readRawSources(rawPath);
const { report, items, displayReadyItems } = buildMath10ContentGuardReport(rawSources, { rawPath });
const excludedItems = items.filter((item) => !report.displayReadyItemIds.includes(item.id));

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'math10-content-guard.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math10-content-audit.md'), renderMarkdownReport(report), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math10-content-issues.csv'), renderIssuesCsv(report.issues), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math10-missing-solution-queue.json'), JSON.stringify(buildMissingSolutionQueue(report, displayReadyItems), null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math10-missing-solution-queue.csv'), renderMissingSolutionQueueCsv(report, displayReadyItems), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math10-display-ready-preview.json'), JSON.stringify({
  report: {
    generatedAt: report.generatedAt,
    totalItems: items.length,
    displayReadyItems: displayReadyItems.length,
    generatedFigures: report.stats.generatedFigures,
  },
  items: displayReadyItems,
}, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math10-published-question-bank.json'), JSON.stringify({
  schemaVersion: 'math10_published_question_bank_v1',
  generatedAt: report.generatedAt,
  sourceRawPath: report.input.rawPath || '',
  sourceItems: items.length,
  publishedItems: displayReadyItems.length,
  excludedItems: excludedItems.length,
  exclusionReason: 'Excluded by Math 10 display gate before learner-facing publish.',
  items: displayReadyItems,
}, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math10-excluded-question-bank.json'), JSON.stringify({
  schemaVersion: 'math10_excluded_question_bank_v1',
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

function readRawSources(filePath: string): Math10RawSource[] {
  if (!fs.existsSync(filePath)) {
    // Trả về mảng trống nếu tệp extract chưa tồn tại để tránh crash trước khi chạy PowerShell extract
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  if (Array.isArray(parsed)) return parsed as Math10RawSource[];
  if (Array.isArray(parsed.sources)) return parsed.sources as Math10RawSource[];
  return [];
}

function renderMarkdownReport(report: Math10ContentGuardReport): string {
  const lines = [
    '# Math 10 Content Audit',
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
    `- Generated MiuMath-solution questions: ${report.stats.generatedSolutions}`,
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

function renderIssuesCsv(issues: Math10ContentIssue[]): string {
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

function buildMissingSolutionQueue(report: Math10ContentGuardReport, items: any[]): Record<string, unknown> {
  const scoredReady = new Set(report.scoredPracticeReadyItemIds);
  const queueItems = items
    .filter((item) => !scoredReady.has(item.id))
    .map((item) => {
      const figureAsset = item.metadata?.figureAsset;
      const displayMode = figureAsset?.displayMode || (item.metadata?.figureStatus === 'recovered_asset' ? 'figure_reference' : 'text');
      const choiceLike = /\bA\.\s*[\s\S]*\bB\.\s*[\s\S]*\bC\.\s*[\s\S]*\bD\./.test(String(item.prompt || ''));
      return {
        id: item.id,
        topicId: item.metadata?.topicId || '',
        patternId: item.metadata?.patternId || '',
        level: item.metadata?.level || '',
        sourceFile: item.metadata?.sourceFile || '',
        displayMode,
        interaction: choiceLike ? 'choice_like' : 'open_response',
        priority: displayMode === 'text' && choiceLike ? 'auto_solver_next' : displayMode === 'text' ? 'manual_or_cas_solver' : 'image_dependent_review',
        promptPreview: String(item.prompt || '').replace(/\s+/g, ' ').slice(0, 240),
      };
    });

  return {
    schemaVersion: 'math10_missing_solution_queue_v1',
    generatedAt: report.generatedAt,
    total: queueItems.length,
    byPriority: countBy(queueItems, (item) => String(item.priority || 'unknown')),
    byTopic: countBy(queueItems, (item) => String(item.topicId || 'unknown')),
    byDisplayMode: countBy(queueItems, (item) => String(item.displayMode || 'unknown')),
    items: queueItems,
  };
}

function renderMissingSolutionQueueCsv(report: Math10ContentGuardReport, items: any[]): string {
  const queue = buildMissingSolutionQueue(report, items).items as Array<Record<string, unknown>>;
  const header = ['id', 'topicId', 'patternId', 'level', 'sourceFile', 'displayMode', 'interaction', 'priority', 'promptPreview'];
  const rows = queue.map((item) => header.map((key) => String(item[key] || '')));
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

function countBy<T>(items: T[], getKey: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item) || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function getPathArg(name: string, fallback: string): string {
  const value = getArgValue(name);
  return value ? path.resolve(workspaceRoot, value) : fallback;
}

function resolveDefaultMath10RawPath(): string {
  return path.resolve(workspaceRoot, 'reports/content-quality/math10-rich-raw-extract.json');
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
