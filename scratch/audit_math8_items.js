const fs = require('fs');
const path = require('path');

const previewPath = path.resolve(__dirname, '../reports/content-quality/math8-display-ready-preview.json');
if (!fs.existsSync(previewPath)) {
  console.log(`Error: Preview file not found at ${previewPath}`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
const items = data.items || [];

console.log(`Auditing ${items.length} Math 8 items...`);

let issues = [];
let missingSolutionsCount = 0;
let missingAnswersCount = 0;
let rawMojibakeCount = 0;
let unaccentedVietnameseCount = 0;
let spaceSymbolPunctuationCount = 0;
let doubleSpaceCount = 0;
let mathSyntaxSuspicion = 0;

const RAW_MOJIBAKE = /Ã|â€|â€™|â€œ|ï¿½/g;
const UNACCENTED_VIETNAMESE = /\b(cho|biet|tim|tinh|chung minh|rut gon|so sanh)\b/i;
const SPACE_PUNCTUATION = / \. | , /g;

items.forEach((item) => {
  const prompt = item.prompt || '';
  const explanation = item.explanation || {};
  const steps = explanation.steps || '';
  const thinking = explanation.thinking || '';
  const correctAnswer = item.correctAnswer;
  
  if (!steps || steps.includes('Nguồn chưa có lời giải chi tiết') || steps.includes('Chưa có lời giải chi tiết')) {
    missingSolutionsCount++;
  }
  
  if (correctAnswer === null || correctAnswer === undefined || correctAnswer === '') {
    missingAnswersCount++;
  }
  
  let hasMojibake = false;
  if (RAW_MOJIBAKE.test(prompt) || RAW_MOJIBAKE.test(steps) || RAW_MOJIBAKE.test(thinking)) {
    rawMojibakeCount++;
    hasMojibake = true;
    issues.push({
      id: item.id,
      type: 'raw_mojibake',
      message: 'Detected raw Mojibake pattern (Ã, â€, etc.).',
      text: prompt.slice(0, 100)
    });
  }
  
  if (!hasMojibake && (UNACCENTED_VIETNAMESE.test(prompt) || UNACCENTED_VIETNAMESE.test(steps) || UNACCENTED_VIETNAMESE.test(thinking))) {
    unaccentedVietnameseCount++;
  }
  
  if (SPACE_PUNCTUATION.test(prompt) || SPACE_PUNCTUATION.test(steps)) {
    spaceSymbolPunctuationCount++;
  }
  
  if (prompt.includes('  ') || steps.includes('  ')) {
    doubleSpaceCount++;
  }
  
  const dollarCountPrompt = (prompt.match(/\$/g) || []).length;
  const dollarCountSteps = (steps.match(/\$/g) || []).length;
  if (dollarCountPrompt % 2 !== 0 || dollarCountSteps % 2 !== 0) {
    mathSyntaxSuspicion++;
  }
});

console.log('\n--- Math 8 Deep Audit Trigger Details ---');
console.log(`Total questions: ${items.length}`);
console.log(`Missing solutions: ${missingSolutionsCount}`);
console.log(`Missing answers: ${missingAnswersCount}`);
console.log(`Real Mojibake (Ã, â€, etc.): ${rawMojibakeCount}`);
console.log(`Unaccented Vietnamese keywords (cho, biet, tim, etc.): ${unaccentedVietnameseCount}`);
console.log(`Space before punctuation ( . or , ): ${spaceSymbolPunctuationCount}`);
console.log(`Double spaces: ${doubleSpaceCount}`);
console.log(`LaTeX dollar mismatched: ${mathSyntaxSuspicion}`);

if (issues.length > 0) {
  console.log('\nSample Real Mojibake (first 10):');
  issues.filter(i => i.type === 'raw_mojibake').slice(0, 10).forEach((issue) => {
    console.log(`- [${issue.id}]: ${issue.text}`);
  });
}
