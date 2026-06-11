const fs = require('fs');
const path = require('path');

const rawExtractPath = path.join(__dirname, '../reports/content-quality/math10-rich-raw-extract.json');
const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));

// Regex to match words that contain characters and a bracket/parenthesis mixed together
const wordRegex = /[a-zA-ZÀ-ỹ]+[\(\)\[\]]+[a-zA-ZÀ-ỹ]*|[a-zA-ZÀ-ỹ]*[\(\)\[\]]+[a-zA-ZÀ-ỹ]+/g;
const words = new Set();

rawData.sources.forEach(src => {
  const matches = src.text.match(wordRegex);
  if (matches) {
    matches.forEach(w => {
      // Lowercase and filter out standard latex or single brackets
      const low = w.toLowerCase().trim();
      if (low.length > 2 && !low.includes('formula') && !low.startsWith('[ole]')) {
        words.add(low);
      }
    });
  }
});

const sortedWords = Array.from(words).sort();
console.log(`Found ${sortedWords.length} unique potential corrupted words:`);
console.log(JSON.stringify(sortedWords, null, 2));
