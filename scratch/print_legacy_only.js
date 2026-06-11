const fs = require('fs');
const path = require('path');

const guardReportPath = path.resolve(__dirname, '../reports/content-quality/math7-content-guard.json');
const report = JSON.parse(fs.readFileSync(guardReportPath, 'utf8'));

const legacyIssues = report.issues.filter(i => i.code === 'display.legacy_font_encoding');
console.log('Legacy Issues Count:', legacyIssues.length);

const rawExtractPath = path.resolve(__dirname, '../reports/content-quality/math7-hsg-raw-extract.json');
const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));
const sources = rawData.sources || [];

legacyIssues.forEach(issue => {
  const qId = issue.questionId;
  const parts = qId.split('.');
  const fileSlug = parts[2];
  const indexStr = parts[4];
  const index = parseInt(indexStr, 10) - 1;
  
  const source = sources.find(s => {
    const slug = s.fileName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
    return fileSlug.startsWith(slug) || slug.startsWith(fileSlug);
  });
  
  if (source && source.parsedBlocks && source.parsedBlocks[index]) {
    const block = source.parsedBlocks[index];
    console.log(`\n========================================`);
    console.log(`ID: ${qId}`);
    console.log(`Prompt:`);
    console.log(block.prompt);
  }
});
