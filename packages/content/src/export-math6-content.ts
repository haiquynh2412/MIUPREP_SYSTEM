import { buildMath6QuestionItemsFromRawSources, type Math6ImportReport, type Math6RawSource } from './math6-import';
import { validateStandardContentBundle } from './validator';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = findWorkspaceRoot(process.cwd());
const rawPath = getPathArg('--raw', resolveDefaultMath6RawPath());
const outputDir = getPathArg('--outDir', path.resolve(workspaceRoot, 'reports/content-quality'));
const quiet = process.argv.includes('--quiet');

const rawSources = readRawSources(rawPath);
const result = buildMath6QuestionItemsFromRawSources(rawSources);
const validationErrors = validateStandardContentBundle({ questions: result.items });
const report = {
  ...result.report,
  adapter: {
    pass: validationErrors.length === 0,
    errors: validationErrors,
  },
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'math6-question-bank-preview.json'), JSON.stringify({ report, items: result.items }, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math6-question-bank-audit.md'), renderMarkdownReport(report), 'utf8');
fs.writeFileSync(path.join(outputDir, 'math6-question-bank-coverage.csv'), renderCoverageCsv(report), 'utf8');

if (!quiet) {
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv.includes('--fail-on-adapter-error') && validationErrors.length) {
  process.exitCode = 1;
}

function readRawSources(filePath: string): Math6RawSource[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Math 6 raw extract file does not exist: ${filePath}`);
  }
  const rawText = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const parsed = JSON.parse(rawText);
  if (Array.isArray(parsed)) return parsed as Math6RawSource[];
  if (Array.isArray(parsed.sources)) return parsed.sources as Math6RawSource[];
  throw new Error(`Math 6 raw extract must be an array or { sources: [] }: ${filePath}`);
}

function renderMarkdownReport(report: Math6ImportReport & { adapter: { pass: boolean; errors: Array<{ path: string; message: string }> } }): string {
  const lines = [
    '# Math 6 Question Bank Import',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Input sources: ${report.inputSources}`,
    `- Mapped sources: ${report.mappedSources}`,
    `- Unmapped sources: ${report.unmappedSources.length}`,
    `- Extracted exercise blocks: ${report.extractedBlocks}`,
    `- Converted QuestionItems: ${report.convertedItems}`,
    `- Adapter pass: ${report.adapter.pass ? 'yes' : 'no'}`,
    '',
    '## Topic Coverage',
    '',
    '| Topic | Questions |',
    '| --- | ---: |',
    ...entriesByCount(report.byTopic).map(([topic, count]) => `| ${escapeMarkdown(topic)} | ${count} |`),
    '',
    '## Level Coverage',
    '',
    '| Level | Questions |',
    '| --- | ---: |',
    ...entriesByCount(report.byLevel).map(([level, count]) => `| ${escapeMarkdown(level)} | ${count} |`),
    '',
    '## Source Coverage',
    '',
    '| Source | Questions |',
    '| --- | ---: |',
    ...entriesByCount(report.bySource).map(([source, count]) => `| ${escapeMarkdown(source)} | ${count} |`),
  ];

  if (report.unmappedSources.length) {
    lines.push('', '## Unmapped Sources', '', ...report.unmappedSources.map((source) => `- ${escapeMarkdown(source)}`));
  }

  if (report.issues.length) {
    lines.push('', '## Issues', '', '| Severity | Code | Source | Topic | Message |', '| --- | --- | --- | --- | --- |');
    report.issues.forEach((issue) => {
      lines.push(`| ${issue.severity} | ${escapeMarkdown(issue.code)} | ${escapeMarkdown(issue.sourceFile || '')} | ${escapeMarkdown(issue.topicId || '')} | ${escapeMarkdown(issue.message)} |`);
    });
  }

  if (report.adapter.errors.length) {
    lines.push('', '## Adapter Errors', '', '| Path | Message |', '| --- | --- |');
    report.adapter.errors.forEach((error) => lines.push(`| ${escapeMarkdown(error.path)} | ${escapeMarkdown(error.message)} |`));
  }

  return `${lines.join('\n')}\n`;
}

function renderCoverageCsv(report: Math6ImportReport): string {
  const rows = [['type', 'key', 'count']];
  entriesByCount(report.byTopic).forEach(([key, count]) => rows.push(['topic', key, String(count)]));
  entriesByCount(report.byLevel).forEach(([key, count]) => rows.push(['level', key, String(count)]));
  entriesByCount(report.bySource).forEach(([key, count]) => rows.push(['source', key, String(count)]));
  return rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';
}

function entriesByCount(record: Record<string, number>): Array<[string, number]> {
  return Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function escapeMarkdown(value: string): string {
  return String(value).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function getPathArg(name: string, fallback: string): string {
  const value = getArgValue(name);
  return value ? path.resolve(workspaceRoot, value) : fallback;
}

function resolveDefaultMath6RawPath(): string {
  const richRawPath = path.resolve(workspaceRoot, 'reports/content-quality/math6-rich-raw-extract.json');
  const plainRawPath = path.resolve(workspaceRoot, 'reports/content-quality/math6-raw-extract.json');
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
