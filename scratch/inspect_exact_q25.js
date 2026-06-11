const fs = require('fs');
const path = require('path');

const rawExtractPath = path.join(__dirname, '../reports/content-quality/math10-rich-raw-extract.json');
const rawData = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));

const { buildMath10QuestionItemsFromRawSources } = require('../packages/content/dist/math10-import.js');

const src = rawData.sources.find(x => x.relativePath.includes('bo-de-on-tap-mon-toan-10-chu-de-menh-de-va-tap-hop.pdf'));
const result = buildMath10QuestionItemsFromRawSources([src]);

const item = result.items.find(x => x.id.includes('q25'));
if (item) {
  console.log('--- RAW PROMPT ---');
  console.log(item.prompt);
  console.log('--- CHAR CODES ---');
  for (let i = 0; i < item.prompt.length; i++) {
    const code = item.prompt.charCodeAt(i);
    if (code > 127) {
      console.log(`${item.prompt[i]} : ${code}`);
    }
  }
} else {
  console.log('Question not found');
}
