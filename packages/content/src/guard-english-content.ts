import { buildEnglishContentGuardReport } from './english-content-guard-report';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const report = buildEnglishContentGuardReport();

const outputDir = getArgValue('--outDir');
if (outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'english-content-guard.json'), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify(report, null, 2));

if (process.argv.includes('--fail-on-adapter-error') && report.adapter.errors.length) {
  process.exitCode = 1;
}

if (process.argv.includes('--fail-on-blocker') && report.qualitySummary.blockers > 0) {
  process.exitCode = 1;
}

function getArgValue(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0) return '';
  const value = process.argv[index + 1] || '';
  return value ? path.resolve(process.cwd(), value) : '';
}
