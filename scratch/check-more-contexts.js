const fs = require('fs');
const path = require('path');

const rawPath = path.resolve(__dirname, '../reports/content-quality/math11-rich-raw-extract.json');
const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const sources = data.sources || [];

const glyphs = ['\uf021', '\uf06a', '\uf1b3', '\uf05a'];

for (const glyph of glyphs) {
  const codeHex = glyph.charCodeAt(0).toString(16);
  console.log(`\n--- Contexts for \\uf0${codeHex} ---`);
  let count = 0;
  for (const src of sources) {
    const text = src.text || "";
    let idx = -1;
    while ((idx = text.indexOf(glyph, idx + 1)) !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + 40);
      const snippet = text.slice(start, end).replace(/\n/g, ' ');
      console.log(`- File: ${src.fileName} | Snippet: ... ${snippet} ...`);
      count++;
      if (count >= 5) break;
    }
    if (count >= 5) break;
  }
}
