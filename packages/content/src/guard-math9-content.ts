import { buildMath9ContentGuardReport, type Math9ContentGuardReport, type Math9ContentIssue } from './math9-content-guard-report';
import type { Math9RawSource } from './math9-import';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = findWorkspaceRoot(process.cwd());
const rawPath = getPathArg('--raw', resolveDefaultMath9RawPath());
const outputDir = getPathArg('--outDir', path.resolve(workspaceRoot, 'reports/content-quality'));

const rawSources = readRawSources(rawPath);
const hsgPath = path.resolve(workspaceRoot, 'reports/content-quality/math9-hsg-raw-extract.json');
if (fs.existsSync(hsgPath)) {
  const hsgSources = readRawSources(hsgPath);
  rawSources.push(...hsgSources);
}
const onVao10Path = path.resolve(workspaceRoot, 'reports/content-quality/math9-onvao10-rich-raw-extract.json');
if (fs.existsSync(onVao10Path)) {
  const onVao10Sources = readRawSources(onVao10Path);
  rawSources.push(...onVao10Sources);
}
const uniqueRawSources = dedupeRawSources(rawSources);
const { report, items, displayReadyItems } = buildMath9ContentGuardReport(uniqueRawSources, { rawPath, formulaAssetExists });

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'math9-content-guard.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math9-content-audit.md'), renderMarkdownReport(report), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math9-content-issues.csv'), renderIssuesCsv(report.issues), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math9-source-quality.json'), JSON.stringify(report.sourceQuality, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math9-source-quality.csv'), renderSourceQualityCsv(report.sourceQuality), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math9-display-ready-preview.json'), JSON.stringify({
  report: {
    generatedAt: report.generatedAt,
    totalItems: items.length,
    displayReadyItems: displayReadyItems.length,
    generatedFigures: report.stats.generatedFigures,
  },
  items: displayReadyItems,
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

function readRawSources(filePath: string): Math9RawSource[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Math 9 raw extract file does not exist: ${filePath}`);
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  if (Array.isArray(parsed)) return parsed as Math9RawSource[];
  if (Array.isArray(parsed.sources)) return parsed.sources as Math9RawSource[];
  throw new Error(`Math 9 raw extract must be an array or { sources: [] }: ${filePath}`);
}

function dedupeRawSources(sources: Math9RawSource[]): Math9RawSource[] {
  const byKey = new Map<string, Math9RawSource>();
  sources.forEach((source) => {
    byKey.set(source.relativePath || source.fileName, source);
  });
  return [...byKey.values()];
}

function renderMarkdownReport(report: Math9ContentGuardReport): string {
  const lines = [
    '# Math 9 Content Audit',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Sources: ${report.input.sources}`,
    `- Questions: ${report.stats.questions}`,
    `- Display-ready questions: ${report.stats.displayReady}`,
    `- Source-solution questions: ${report.stats.withSourceSolutions}`,
    `- Correct-answer questions: ${report.stats.withCorrectAnswers}`,
    `- Scored-practice-ready questions: ${report.stats.scoredPracticeReady}`,
    `- Generated SVG figures: ${report.stats.generatedFigures}`,
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
    `- Missing formula image assets: ${report.display.missingFormulaAssets}`,
    `- Sources with formula recovery gap: ${report.display.sourcesWithFormulaRecoveryGap}`,
    `- Formula recovery gap markers: ${report.display.formulaRecoveryGapMarkers}`,
    `- Prompt control characters: ${report.display.promptControlCharacters}`,
    `- Raw sources with Word/OLE markers: ${report.display.rawSourcesWithOleMarkers}`,
    `- Raw Word/OLE markers total: ${report.display.rawOleMarkersTotal}`,
    '',
    '## Pedagogy Gate',
    '',
    `- Scored-practice ready: ${report.pedagogy.scoredPracticeReady}`,
    `- Missing correct answer: ${report.pedagogy.missingCorrectAnswer}`,
    `- Missing source solution: ${report.pedagogy.missingSourceSolution}`,
    `- Missing thinking guide: ${report.pedagogy.missingThinkingGuide}`,
    `- Hard items without thinking lens: ${report.pedagogy.hardItemsWithoutThinkingLens}`,
    `- Solution markers inside prompt: ${report.pedagogy.solutionMarkersInsidePrompt}`,
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
    '',
    '## Source Quality',
    '',
    '| Status | Source | Questions | Ready | Source Solutions | Correct Answers | Scored Ready | Formula Assets | OLE Markers | Recovery Gap | Missing Assets | Formula Review | Image Review | Encoding Review |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...report.sourceQuality.map((source) => [
      source.status,
      escapeMarkdownCell(source.sourceFile),
      source.questions,
      source.displayReady,
      source.sourceSolutions,
      source.correctAnswers,
      source.scoredPracticeReady,
      source.formulaAssets,
      source.rawOleMarkers,
      source.formulaRecoveryGap,
      source.missingFormulaAssets,
      source.needsFormulaReview,
      source.needsOriginalImage,
      source.needsTextEncodingReview,
    ].join(' | ')).map((row) => `| ${row} |`),
    '',
    '## Top Issues',
    '',
    '| Severity | Code | Question | Source | Topic | Message |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.issues.slice(0, 160).map((issue) => `| ${issue.severity} | ${escapeMarkdownCell(issue.code)} | ${escapeMarkdownCell(issue.questionId || '')} | ${escapeMarkdownCell(issue.sourceFile || '')} | ${escapeMarkdownCell(issue.topicId || '')} | ${escapeMarkdownCell(issue.message)} |`),
  ];

  return `${lines.join('\n')}\n`;
}

function renderIssuesCsv(issues: Math9ContentIssue[]): string {
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

function renderSourceQualityCsv(rows: Math9ContentGuardReport['sourceQuality']): string {
  const header = [
    'status',
    'sourceFile',
    'extension',
    'questions',
    'displayReady',
    'sourceSolutions',
    'correctAnswers',
    'scoredPracticeReady',
    'blockers',
    'warnings',
    'formulaAssets',
    'rawOleMarkers',
    'formulaRecoveryGap',
    'missingFormulaAssets',
    'needsFormulaReview',
    'needsOriginalImage',
    'needsTextEncodingReview',
  ];
  return renderCsv([
    header,
    ...rows.map((row) => [
      row.status,
      row.sourceFile,
      row.extension || '',
      String(row.questions),
      String(row.displayReady),
      String(row.sourceSolutions),
      String(row.correctAnswers),
      String(row.scoredPracticeReady),
      String(row.blockers),
      String(row.warnings),
      String(row.formulaAssets),
      String(row.rawOleMarkers),
      String(row.formulaRecoveryGap),
      String(row.missingFormulaAssets),
      String(row.needsFormulaReview),
      String(row.needsOriginalImage),
      String(row.needsTextEncodingReview),
    ]),
  ]);
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

function resolveDefaultMath9RawPath(): string {
  const richRawPath = path.resolve(workspaceRoot, 'reports/content-quality/math9-rich-raw-extract.json');
  const plainRawPath = path.resolve(workspaceRoot, 'reports/content-quality/math9-raw-extract.json');
  return shouldUseRichRawPath(richRawPath, plainRawPath) ? richRawPath : plainRawPath;
}

function shouldUseRichRawPath(richRawPath: string, plainRawPath: string): boolean {
  if (!fs.existsSync(richRawPath)) return false;
  try {
    const richSources = readRawSources(richRawPath);
    const richSourcesWithText = richSources.filter((source) => String(source.text || '').trim().length > 0).length;
    if (!fs.existsSync(plainRawPath)) return richSourcesWithText > 0;
    const plainSources = readRawSources(plainRawPath);
    return richSources.length >= plainSources.length && richSourcesWithText >= Math.ceil(plainSources.length * 0.9);
  } catch {
    return false;
  }
}

function formulaAssetExists(src: string): boolean {
  if (!String(src || '').startsWith('/assets/')) return true;
  return fs.existsSync(path.resolve(workspaceRoot, 'apps/miuprep-portal/public', String(src).replace(/^\/+/, '')));
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
