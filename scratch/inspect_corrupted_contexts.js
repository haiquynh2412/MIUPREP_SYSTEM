const fs = require('fs');
const path = require('path');

const rawExtractPath = path.join(__dirname, '../reports/content-quality/math10-rich-raw-extract.json');
const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));

const targetWords = [
  'tr]n', 'tr]', 'h]a', 'm)n', 'thoảm)n', 'c]n', 'd]ng', 'l]ng', 'h)y', 'l)i', 'lu)c', 'v]ng', 'nh)n', 'h)ng', 'm)ng', 'mu)c'
];

const results = {};
targetWords.forEach(w => results[w] = []);

rawData.sources.forEach(src => {
  const lines = src.text.split('\n');
  lines.forEach((line, idx) => {
    const lowerLine = line.toLowerCase();
    targetWords.forEach(word => {
      if (lowerLine.includes(word)) {
        results[word].push({
          file: src.relativePath,
          line: idx + 1,
          context: line.trim()
        });
      }
    });
  });
});

Object.keys(results).forEach(word => {
  console.log(`\n=================== Context for: ${word} (${results[word].length} occurrences) ===================`);
  results[word].slice(0, 5).forEach(occ => {
    console.log(`- File: ${occ.file}:${occ.line}\n  Text: "${occ.context}"`);
  });
});
