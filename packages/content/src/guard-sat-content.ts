import { buildSatContentReadinessSnapshot, type SatPublicStudentPackage } from './sat-content';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = findWorkspaceRoot(process.cwd());
const packagePath = getPathArg(
  '--package',
  path.resolve(workspaceRoot, 'apps/sat-studio/artifacts/sat-studio-public-content-package-latest.json'),
);
const outputDir = getArgValue('--outDir');

const contentPackage = readSatPackage(packagePath);
const report = buildSatContentReadinessSnapshot(contentPackage);

if (outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'sat-content-guard.json'), JSON.stringify(report, null, 2));
}

if (!process.argv.includes('--quiet')) {
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv.includes('--fail-on-adapter-error') && !report.adapter.pass) {
  process.exitCode = 1;
}

if (process.argv.includes('--fail-on-blocker') && report.blockerItems > 0) {
  process.exitCode = 1;
}

function readSatPackage(filePath: string): SatPublicStudentPackage {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
    throw new Error(`SAT public package must contain an items array: ${filePath}`);
  }
  return parsed as SatPublicStudentPackage;
}

function getPathArg(name: string, fallback: string): string {
  const value = getArgValue(name);
  return value || fallback;
}

function getArgValue(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0) return '';
  const value = process.argv[index + 1] || '';
  return value ? path.resolve(process.cwd(), value) : '';
}

function findWorkspaceRoot(startDir: string): string {
  let current = startDir;
  while (current && current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'package.json')) && fs.existsSync(path.join(current, 'apps'))) return current;
    current = path.dirname(current);
  }
  return startDir;
}
