const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/HAIQUYNH/OneDrive/CODE AI/MIUPREP_SYSTEM/reports/content-quality/math8-rich-raw-extract.json';
const dataRaw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const sources = Array.isArray(dataRaw) ? dataRaw : dataRaw.sources;

const fileData = sources.find(item => item.fileName.includes('Chương 8'));

if (!fileData) {
  console.log('File not found');
  process.exit(1);
}

console.log('File matched:', fileData.fileName);
const { extractMath8ExerciseBlocks } = require('../packages/content/dist/math8-import');
const blocks = extractMath8ExerciseBlocks(fileData.text);
console.log('Total blocks extracted:', blocks.length);

// Let's print around block 46 (which is index 45)
for (let i = 40; i < Math.min(blocks.length, 52); i++) {
  console.log(`--- Block ${i + 1} (index ${i}) ---`);
  console.log(blocks[i]);
}
