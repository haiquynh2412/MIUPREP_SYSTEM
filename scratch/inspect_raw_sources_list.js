const fs = require('fs');
const path = require('path');

function printSources(grade) {
  const rawPath = path.resolve(__dirname, `../reports/content-quality/math${grade}-rich-raw-extract.json`);
  if (!fs.existsSync(rawPath)) {
    console.log(`Grade ${grade} raw path not found`);
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const sources = rawData.sources || rawData;
  console.log(`\nGrade ${grade} Raw Sources (Total: ${sources.length}):`);
  sources.forEach((s, idx) => {
    console.log(`- [${idx}]: ${s.relativePath || s.fileName} (${(s.text || '').length} chars)`);
  });
}

printSources(7);
printSources(8);
