const fs = require('fs');
const path = require('path');

const previewPath = path.resolve(__dirname, '../reports/content-quality/math8-display-ready-preview.json');
const data = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
const items = data.items || [];

const UNACCENTED_VIETNAMESE = /\b(biet|tim|tinh|chung minh|rut gon|so sanh)\b/i;

let count = 0;
items.forEach((item) => {
  const prompt = item.prompt || '';
  const explanation = item.explanation || {};
  const steps = explanation.steps || '';
  const thinking = explanation.thinking || '';
  
  let match = prompt.match(UNACCENTED_VIETNAMESE) || steps.match(UNACCENTED_VIETNAMESE) || thinking.match(UNACCENTED_VIETNAMESE);
  if (match && count < 15) {
    console.log(`\n- [${item.id}] (source: ${item.metadata.sourceFile}): matched "${match[1]}"`);
    console.log(`  Prompt: ${prompt.slice(0, 200)}`);
    console.log(`  Thinking: ${thinking.slice(0, 200)}`);
    console.log(`  Steps: ${steps.slice(0, 200)}`);
    count++;
  }
});

console.log(`\nTotal matched: ${items.filter(item => {
  const prompt = item.prompt || '';
  const explanation = item.explanation || {};
  const steps = explanation.steps || '';
  const thinking = explanation.thinking || '';
  return UNACCENTED_VIETNAMESE.test(prompt) || UNACCENTED_VIETNAMESE.test(steps) || UNACCENTED_VIETNAMESE.test(thinking);
}).length} items`);
