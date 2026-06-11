const fs = require('fs');
const path = require('path');

const rawPath = path.resolve(__dirname, '../reports/content-quality/math11-rich-raw-extract.json');
if (!fs.existsSync(rawPath)) {
  console.log("Extract file not found!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const sources = data.sources || [];

console.log("Contexts for \\uf075:");
let count75 = 0;
for (const src of sources) {
  const text = src.text || "";
  let idx = -1;
  while ((idx = text.indexOf('\uf075', idx + 1)) !== -1) {
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + 40);
    const snippet = text.slice(start, end).replace(/\n/g, ' ');
    console.log(`- File: ${src.fileName} | Context: ... ${snippet} ...`);
    count75++;
    if (count75 >= 15) break;
  }
  if (count75 >= 15) break;
}

console.log("\nContexts for \\uf0e5:");
let countE5 = 0;
for (const src of sources) {
  const text = src.text || "";
  let idx = -1;
  while ((idx = text.indexOf('\uf0e5', idx + 1)) !== -1) {
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + 40);
    const snippet = text.slice(start, end).replace(/\n/g, ' ');
    console.log(`- File: ${src.fileName} | Context: ... ${snippet} ...`);
    countE5++;
    if (countE5 >= 15) break;
  }
  if (countE5 >= 15) break;
}
