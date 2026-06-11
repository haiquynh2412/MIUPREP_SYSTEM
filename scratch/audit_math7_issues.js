const fs = require('fs');
const path = require('path');

const guardReportPath = path.resolve(__dirname, '../reports/content-quality/math7-content-guard.json');
if (!fs.existsSync(guardReportPath)) {
  console.error('Report not found at ' + guardReportPath);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(guardReportPath, 'utf8'));
console.log('Total Issues:', report.issues.length);

const byCode = {};
report.issues.forEach(issue => {
  byCode[issue.code] = (byCode[issue.code] || 0) + 1;
});
console.log('Issues by Code:', byCode);

console.log('\n--- Legacy Font Encoding Samples ---');
const legacyIssues = report.issues.filter(i => i.code === 'display.legacy_font_encoding');
legacyIssues.forEach(issue => {
  console.log(`ID: ${issue.questionId}`);
});

// Let's read the raw extract and print the prompt for these IDs
const rawExtractPath = path.resolve(__dirname, '../reports/content-quality/math7-hsg-raw-extract.json');
if (fs.existsSync(rawExtractPath)) {
  const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));
  const sources = rawData.sources || [];
  
  console.log('\n--- Prompts for Remaining Legacy Font Issues ---');
  
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
      console.log(`\nID: ${qId}`);
      console.log(`Prompt: ${block.prompt}`);
    }
  });
}
