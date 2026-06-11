const fs = require('fs');
const path = require('path');

const rawExtractPath = path.join(__dirname, '../reports/content-quality/math10-rich-raw-extract.json');
const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));

const corruptedPatterns = [
  /tr\]n/i, /h\]a/i, /c\]n/i, /d\]ng/i, /l\]ng/i, /v\]ng/i, /nh\)n/i, /h\)ng/i, /m\)ng/i, /mu\)c/i, /lu\)c/i, /h\)y/i, /l\)i/i, /m\)n/i, /kh\]ng/i, /h\]p/i, /x\) hội/i, /X\) Hội/i, /v\] hạn/i, /v\] tỉ/i, /v\] cùng/i, /xe \] tô/i, /\] tô/i
];

let totalIssues = 0;
rawData.sources.forEach(src => {
  const lines = src.text.split('\n');
  lines.forEach((line, idx) => {
    corruptedPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        console.log(`Match in ${src.relativePath}:${idx+1} -> "${line.trim()}" (pattern: ${pattern})`);
        totalIssues++;
      }
    });
  });
});

console.log(`Total remaining spelling issues: ${totalIssues}`);
