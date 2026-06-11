const fs = require('fs');
const path = require('path');
const { buildMath7ContentGuardReport } = require('../packages/content/dist/math7-content-guard-report.js');

const rawPath = path.resolve(__dirname, '../reports/content-quality/math7-hsg-raw-extract.json');
const fileContent = fs.readFileSync(rawPath, 'utf8');
const parsed = JSON.parse(fileContent);
const rawSources = Array.isArray(parsed) ? parsed : (parsed.sources || []);

const { report, items } = buildMath7ContentGuardReport(rawSources, { rawPath });

const blockers = report.issues.filter(issue => issue.severity === 'blocker' && issue.sourceFile.endsWith('.pdf'));
console.log(`Found ${blockers.length} PDF blockers.`);

blockers.forEach((issue, idx) => {
  const item = items.find(q => q.id === issue.questionId);
  console.log(`\n--- PDF BLOCKER ${idx + 1} ---`);
  console.log(`ID: ${issue.questionId}`);
  console.log(`Source: ${issue.sourceFile}`);
  console.log(`Prompt: "${item ? item.prompt : '(Not found)'}"`);
});
