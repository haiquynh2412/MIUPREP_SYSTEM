const fs = require('fs');
const path = require('path');

const rawPath = path.resolve(__dirname, '../reports/content-quality/math7-rich-raw-extract.json');
if (!fs.existsSync(rawPath)) {
  console.log('File does not exist');
  process.exit(1);
}
const stat = fs.statSync(rawPath);
console.log(`Last modified: ${stat.mtime}`);
console.log(`Size: ${stat.size} bytes`);

const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const sources = data.sources || [];
console.log(`Total sources saved in raw extract: ${sources.length}`);
sources.forEach((s, idx) => {
  console.log(`- [${idx}]: ${s.relativePath || s.fileName} (${(s.text || '').length} chars)`);
});
