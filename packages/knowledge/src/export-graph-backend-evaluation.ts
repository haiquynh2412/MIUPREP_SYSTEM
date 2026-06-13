import {
  buildGraphBackendEvaluationReport,
  createSeedKnowledgeGraph,
  type GraphBackendEvaluationReport,
} from './index';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string };

const fs = require('node:fs');
const path = require('node:path');

const generatedAt = new Date().toISOString();
const outputDir = getArgValue('--outDir') || path.resolve(process.cwd(), '..', '..', 'reports', 'knowledge');
const jsonPath = path.join(outputDir, 'graph-backend-evaluation.json');
const markdownPath = path.join(outputDir, 'graph-backend-evaluation.md');
const report = buildGraphBackendEvaluationReport(createSeedKnowledgeGraph(), { generatedAt });

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(report));

console.log(`Graph backend evaluation written to ${jsonPath}`);
console.log(`Graph backend evaluation summary written to ${markdownPath}`);
console.log(
  `Status: ${report.status}; recommendation: ${report.recommendation}; criteriaMet: ${report.graphDbCriteriaMet}`,
);

function renderMarkdown(report: GraphBackendEvaluationReport): string {
  return [
    '# Graph Backend Evaluation',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Decision',
    '',
    `- Status: ${report.status}`,
    `- Recommendation: ${report.recommendation}`,
    `- Graph DB criteria met: ${report.graphDbCriteriaMet}`,
    `- Graph DB evaluation eligible: ${report.graphDbEvaluationEligible ? 'yes' : 'no'}`,
    `- Migration allowed now: ${report.migrationAllowed ? 'yes' : 'no'}`,
    `- Rollback plan required: ${report.rollbackPlanRequired ? 'yes' : 'no'}`,
    `- Client direct DB access allowed: ${report.clientDirectDbAccessAllowed ? 'yes' : 'no'}`,
    '',
    `Detail: ${report.detail}`,
    '',
    '## Graph Stats',
    '',
    `- Nodes: ${report.stats.nodes}`,
    `- Edges: ${report.stats.edges}`,
    `- Domains: ${report.stats.domains}`,
    `- Programs: ${report.stats.programs}`,
    `- Concepts: ${report.stats.concepts}`,
    `- Skills: ${report.stats.skills}`,
    `- Objectives: ${report.stats.objectives}`,
    `- Misconceptions: ${report.stats.misconceptions}`,
    `- Lesson templates: ${report.stats.lessonTemplates}`,
    `- Cross-domain programs: ${report.stats.crossDomainPrograms}`,
    '',
    '## Benchmark',
    '',
    `- Queries: ${report.benchmark.queries}`,
    `- Elapsed ms: ${report.benchmark.elapsedMs}`,
    `- Max query ms: ${report.benchmark.maxQueryMs}`,
    `- Average query ms: ${report.benchmark.averageQueryMs}`,
    `- Max closure size: ${report.benchmark.maxClosureSize}`,
    `- Average closure size: ${report.benchmark.averageClosureSize}`,
    `- Max prerequisite depth: ${report.benchmark.maxPrerequisiteDepth}`,
    '',
    '## Criteria',
    '',
    '| Criterion | Met | Evidence | Next step |',
    '| --- | --- | --- | --- |',
    ...report.triggers.map(
      (trigger) =>
        `| ${trigger.id} | ${trigger.met ? 'yes' : 'no'} | ${trigger.evidence} | ${trigger.recommendation} |`,
    ),
    '',
    '## Validation',
    '',
    `- Validation ok: ${report.validation.ok ? 'yes' : 'no'}`,
    `- Errors: ${report.validation.errors}`,
    `- Warnings: ${report.validation.warnings}`,
    '',
  ].join('\n');
}

function getArgValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
