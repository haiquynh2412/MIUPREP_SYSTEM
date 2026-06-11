import { buildMath7ContentGuardReport, type Math7ContentGuardReport, type Math7ContentIssue } from './math7-content-guard-report';
import type { Math7RawSource } from './math7-import';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = findWorkspaceRoot(process.cwd());
const rawPath = getPathArg('--raw', resolveDefaultMath7RawPath());
const outputDir = getPathArg('--outDir', path.resolve(workspaceRoot, 'reports/content-quality'));

const rawSources = readRawSources(rawPath);
const hsgPath = path.resolve(workspaceRoot, 'reports/content-quality/math7-hsg-raw-extract.json');
if (fs.existsSync(hsgPath)) {
  const hsgSources = readRawSources(hsgPath);
  if (path.resolve(rawPath) !== hsgPath) {
    rawSources.push(...hsgSources);
  }
}
const seenFiles = new Set<string>();
const uniqueRawSources: Math7RawSource[] = [];
for (const src of rawSources) {
  const key = src.relativePath || src.fileName;
  if (!seenFiles.has(key)) {
    seenFiles.add(key);
    uniqueRawSources.push(src);
  }
}
const { report, items, displayReadyItems } = buildMath7ContentGuardReport(uniqueRawSources, { rawPath });

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'math7-content-guard.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math7-content-audit.md'), renderMarkdownReport(report), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math7-content-issues.csv'), renderIssuesCsv(report.issues), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math7-display-ready-preview.json'), JSON.stringify({
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

function readRawSources(filePath: string): Math7RawSource[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Math 7 raw extract file does not exist: ${filePath}`);
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  if (Array.isArray(parsed)) return parsed as Math7RawSource[];
  if (Array.isArray(parsed.sources)) return parsed.sources as Math7RawSource[];
  throw new Error(`Math 7 raw extract must be an array or { sources: [] }: ${filePath}`);
}

function renderMarkdownReport(report: Math7ContentGuardReport): string {
  const lines = [
    '# Math 7 Content Audit',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Sources: ${report.input.sources}`,
    `- Questions: ${report.stats.questions}`,
    `- Display-ready questions: ${report.stats.displayReady}`,
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
    '',
    '## Top Issues',
    '',
    '| Severity | Code | Question | Source | Topic | Message |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.issues.slice(0, 160).map((issue) => `| ${issue.severity} | ${escapeMarkdownCell(issue.code)} | ${escapeMarkdownCell(issue.questionId || '')} | ${escapeMarkdownCell(issue.sourceFile || '')} | ${escapeMarkdownCell(issue.topicId || '')} | ${escapeMarkdownCell(issue.message)} |`),
  ];

  return `${lines.join('\n')}\n`;
}

function renderIssuesCsv(issues: Math7ContentIssue[]): string {
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

function resolveDefaultMath7RawPath(): string {
  return path.resolve(workspaceRoot, 'reports/content-quality/math7-rich-raw-extract.json');
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
