const fs = require('fs');
const path = require('path');

const rawExtractPath = path.join(__dirname, '../reports/content-quality/math10-rich-raw-extract.json');
const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));

const chars = [184, 181, 170]; // ¸, µ, ª

chars.forEach(code => {
  const charStr = String.fromCharCode(code);
  console.log(`\n=================== Context for char code ${code} (${charStr}) ===================`);
  rawData.sources.forEach(src => {
    if (src.text.includes(charStr)) {
      console.log(`File: ${src.relativePath}`);
      const lines = src.text.split('\n');
      let count = 0;
      lines.forEach((l, idx) => {
        if (l.includes(charStr) && count < 5) {
          console.log(`  Line ${idx+1}: "${l.trim()}"`);
          count++;
        }
      });
    }
  });
});
