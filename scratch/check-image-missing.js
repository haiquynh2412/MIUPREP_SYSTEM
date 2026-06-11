const fs = require('fs');
const path = require('path');

const issuesPath = path.resolve(__dirname, '../reports/content-quality/math11-content-issues.csv');
const rawPath = path.resolve(__dirname, '../reports/content-quality/math11-rich-raw-extract.json');

if (!fs.existsSync(issuesPath) || !fs.existsSync(rawPath)) {
  console.log("Required files missing!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const sources = data.sources || [];

const issuesText = fs.readFileSync(issuesPath, 'utf8');
const lines = issuesText.split('\n');

const imageMissingIds = [];
for (const line of lines) {
  if (line.includes('display.image_missing')) {
    const parts = line.split(',');
    // The questionId is usually the 3rd column (index 2)
    const qId = parts[2] ? parts[2].replace(/"/g, '') : '';
    if (qId) {
      imageMissingIds.push(qId);
    }
  }
}

console.log(`Found ${imageMissingIds.length} image_missing questions. Printing a few examples:`);

// Map questions by id
const questionsById = {};
const { buildMath11QuestionItemsFromRawSources } = require('../packages/content/dist/math11-import');
const { items } = buildMath11QuestionItemsFromRawSources(sources);

for (const item of items) {
  questionsById[item.id] = item;
}

let printed = 0;
for (const id of imageMissingIds) {
  const item = questionsById[id];
  if (item) {
    console.log(`\n--- [${printed + 1}] ID: ${item.id} ---`);
    console.log(`Source File: ${item.metadata.sourceFile}`);
    console.log(`Prompt:\n${item.prompt.slice(0, 500)}`);
    console.log(`-----------------------------------`);
    printed++;
    if (printed >= 8) break;
  }
}
