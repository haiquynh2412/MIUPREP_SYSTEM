import {
  buildMiuMathContentGuardReport,
  type MiuMathChangedQuestion,
  type MiuMathContentGuardReport,
  type MiuMathContentIssue,
} from './miumath-content-guard-report';
import type { MiuMathQuestion } from './standard';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = findWorkspaceRoot(process.cwd());
const currentPath = getPathArg('--current', path.resolve(workspaceRoot, 'apps/miumath-app/public/data/questions_db.json'));
const defaultSourcePath = path.resolve(workspaceRoot, '..', 'ON THi', 'miumath-app', 'public', 'data', 'questions_db.json');
const sourcePathArg = getArgValue('--source');
const sourcePath = sourcePathArg === 'none'
  ? ''
  : getPathArg('--source', fs.existsSync(defaultSourcePath) ? defaultSourcePath : '');
const publicRoot = getPathArg('--publicRoot', path.resolve(workspaceRoot, 'apps/miumath-app/public'));
const outputDir = getPathArg('--outDir', '');

const currentQuestions = readQuestions(currentPath);
const sourceQuestions = sourcePath && fs.existsSync(sourcePath) ? readQuestions(sourcePath) : undefined;
const knownAssetPaths = collectKnownAssetPaths(publicRoot);
const report = buildMiuMathContentGuardReport(currentQuestions, {
  currentPath,
  sourcePath: sourceQuestions ? sourcePath : undefined,
  sourceQuestions,
  knownAssetPaths,
});

if (outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'miumath-content-guard.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outputDir, 'miumath-content-audit.md'), renderMarkdownReport(report));
  fs.writeFileSync(path.join(outputDir, 'miumath-content-issues.csv'), renderIssuesCsv(report.issues));
  fs.writeFileSync(path.join(outputDir, 'miumath-content-changes.csv'), renderChangesCsv(report.comparison?.changed || []));
}

if (!process.argv.includes('--quiet')) {
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv.includes('--fail-on-adapter-error') && report.adapter.errors.length) {
  process.exitCode = 1;
}

if (process.argv.includes('--fail-on-blocker') && report.qualitySummary.blockers > 0) {
  process.exitCode = 1;
}

function readQuestions(filePath: string): MiuMathQuestion[] {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(parsed)) {
    throw new Error(`MiuMath questions file must contain an array: ${filePath}`);
  }
  return parsed as MiuMathQuestion[];
}

function collectKnownAssetPaths(publicRootPath: string): Set<string> {
  const result = new Set<string>();
  if (!publicRootPath || !fs.existsSync(publicRootPath)) return result;

  const stack = [publicRootPath];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    fs.readdirSync(current, { withFileTypes: true }).forEach((entry: any) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        return;
      }
      const relativePath = path.relative(publicRootPath, fullPath).replace(/\\/g, '/');
      result.add(relativePath);
    });
  }

  return result;
}

function renderMarkdownReport(report: MiuMathContentGuardReport): string {
  const lines = [
    '# MiuMath Content Audit',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Current questions: ${report.input.currentQuestions}`,
    `- Source questions: ${report.input.sourceQuestions ?? 'not compared'}`,
    `- Exams: ${report.stats.exams}`,
    `- Categories: ${report.stats.categories}`,
    `- Sub-categories: ${report.stats.subCategories}`,
    `- Blockers: ${report.qualitySummary.blockers}`,
    `- Warnings: ${report.qualitySummary.warnings}`,
    `- Adapter converted items: ${report.adapter.convertedItems}`,
    `- Adapter pass: ${report.adapter.pass ? 'yes' : 'no'}`,
    `- Current path: ${report.input.currentPath}`,
  ];

  if (report.input.sourcePath) {
    lines.push(`- Compared source: ${report.input.sourcePath}`);
  }

  if (report.comparison) {
    lines.push(
      '',
      '## Compared Changes',
      '',
      `- Added ids: ${report.comparison.added.length}`,
      `- Removed ids: ${report.comparison.removed.length}`,
      `- Changed ids: ${report.comparison.changed.length}`,
      '',
      '| ID | Fields | Exam | Category | Current prompt | Source prompt |',
      '| --- | --- | --- | --- | --- | --- |',
    );

    if (report.comparison.changed.length) {
      report.comparison.changed.forEach((change) => {
        lines.push(
          `| ${escapeMarkdownCell(change.id)} | ${escapeMarkdownCell(change.fields.join(', '))} | ${escapeMarkdownCell(change.examName)} | ${escapeMarkdownCell(change.category)} / ${escapeMarkdownCell(change.subCategory)} | ${escapeMarkdownCell(change.currentQuestionText)} | ${escapeMarkdownCell(change.sourceQuestionText)} |`,
        );
      });
    } else {
      lines.push('| none |  |  |  |  |  |');
    }
  }

  lines.push('', '## Issue Summary', '', '| Code | Count |', '| --- | ---: |');
  const issueEntries = Object.entries(report.qualitySummary.byCode).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (issueEntries.length) {
    issueEntries.forEach(([code, count]) => lines.push(`| ${escapeMarkdownCell(code)} | ${count} |`));
  } else {
    lines.push('| none | 0 |');
  }

  lines.push('', '## Issues', '', '| Severity | Code | Question | Field | Message |', '| --- | --- | --- | --- | --- |');
  if (report.issues.length) {
    report.issues.forEach((issue) => {
      lines.push(
        `| ${issue.severity} | ${escapeMarkdownCell(issue.code)} | ${escapeMarkdownCell(issue.questionId || '')} | ${escapeMarkdownCell(issue.field || '')} | ${escapeMarkdownCell(issue.message)} |`,
      );
    });
  } else {
    lines.push('| none |  |  |  |  |');
  }

  lines.push('', '## Category Counts', '', '| Category | Questions |', '| --- | ---: |');
  Object.entries(report.stats.byCategory)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([category, count]) => lines.push(`| ${escapeMarkdownCell(category)} | ${count} |`));

  lines.push('', '## Program Coverage', '', '| Program | Questions |', '| --- | ---: |');
  Object.entries(report.stats.byProgram)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([program, count]) => lines.push(`| ${escapeMarkdownCell(program)} | ${count} |`));

  lines.push('', '## Grade Coverage', '', '| Grade | Questions |', '| --- | ---: |');
  Object.entries(report.stats.byGrade)
    .sort((a, b) => Number(a[0]) - Number(b[0]) || a[0].localeCompare(b[0]))
    .forEach(([grade, count]) => lines.push(`| ${escapeMarkdownCell(grade)} | ${count} |`));

  lines.push('', '## Topic Coverage', '', '| Topic | Questions |', '| --- | ---: |');
  Object.entries(report.stats.byTopic)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([topic, count]) => lines.push(`| ${escapeMarkdownCell(topic)} | ${count} |`));

  lines.push('', '## Level Coverage', '', '| Level | Questions |', '| --- | ---: |');
  Object.entries(report.stats.byLevel)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([level, count]) => lines.push(`| ${escapeMarkdownCell(level)} | ${count} |`));

  return `${lines.join('\n')}\n`;
}

function renderIssuesCsv(issues: MiuMathContentIssue[]): string {
  const header = ['severity', 'code', 'questionId', 'field', 'path', 'message'];
  const rows = issues.map((issue) => [
    issue.severity,
    issue.code,
    issue.questionId || '',
    issue.field || '',
    issue.path,
    issue.message,
  ]);
  return renderCsv([header, ...rows]);
}

function renderChangesCsv(changes: MiuMathChangedQuestion[]): string {
  const header = ['id', 'fields', 'examName', 'category', 'subCategory', 'currentQuestionText', 'sourceQuestionText'];
  const rows = changes.map((change) => [
    change.id,
    change.fields.join(';'),
    change.examName,
    change.category,
    change.subCategory,
    change.currentQuestionText,
    change.sourceQuestionText,
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

function getPathArg(name: string, fallback: string): string {
  const value = getArgValue(name);
  return value ? path.resolve(workspaceRoot, value) : fallback;
}

function getArgValue(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0) return '';
  return process.argv[index + 1] || '';
}

function findWorkspaceRoot(startDir: string): string {
  let current = path.resolve(startDir);
  while (current && current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'apps', 'miumath-app')) && fs.existsSync(path.join(current, 'packages', 'content'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.resolve(startDir);
}
