const fs = require('fs');
const path = require('path');

const rawExtractPath = path.join(__dirname, '../reports/content-quality/math10-rich-raw-extract.json');
const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));

// Regex to find words containing alphabetic characters and brackets/parentheses
const wordRegex = /[a-zA-Z0-9À-ỹ]*[\(\)\[\]][a-zA-Z0-9À-ỹ]*/g;
const corruptions = {};

rawData.sources.forEach(src => {
  const matches = src.text.match(wordRegex);
  if (matches) {
    matches.forEach(w => {
      const low = w.toLowerCase().trim();
      // Filter out standard math like [a;b], [0;1], [m;m+1], (x), (y), (1), etc.
      if (
        /^[\[\(]-?\d+;-?\d+[\]\)]$/.test(low) || 
        /^[\[\(][a-z];[a-z][\]\)]$/.test(low) ||
        /^[\[\(][a-z];[a-z][+-]\d+[\]\)]$/.test(low) ||
        /^[\[\(]-?[a-z\d\s+−∞√]+;-?[a-z\d\s+−∞√]+[\]\)]$/.test(low) ||
        /^\([a-z\d]\)$/.test(low) ||
        low.includes('formula') ||
        low.startsWith('[ole]')
      ) {
        return;
      }
      
      // Let's also check if it contains actual letters (to avoid things like [;] or [+)
      if (/[a-zA-ZÀ-ỹ]/.test(low)) {
        if (!corruptions[low]) {
          corruptions[low] = [];
        }
        corruptions[low].push(src.relativePath);
      }
    });
  }
});

console.log('Total unique corrupted word patterns:', Object.keys(corruptions).length);
const sorted = Object.entries(corruptions).map(([word, files]) => ({
  word,
  count: files.length,
  file: files[0] // show first file
})).sort((a, b) => b.count - a.count);

console.log(JSON.stringify(sorted, null, 2));
