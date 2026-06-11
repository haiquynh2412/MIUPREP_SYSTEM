const fs = require('fs');
const path = require('path');

const rawPath = path.resolve(__dirname, '../reports/content-quality/math7-hsg-raw-extract.json');
const fileContent = fs.readFileSync(rawPath, 'utf8');
const parsed = JSON.parse(fileContent);
const rawSources = Array.isArray(parsed) ? parsed : (parsed.sources || []);

const source = rawSources.find(s => s.fileName.includes("ngo-van-tho"));
if (source && source.parsedBlocks) {
  // Let's search for blocks containing "Tính giá trị của biểu thức:"
  const blocks = source.parsedBlocks.filter(b => b.prompt.includes("Tính giá trị của biểu thức:") || b.prompt.includes("Tinh gia tri cua bieu thuc"));
  console.log(`Found ${blocks.length} blocks matching query.`);
  blocks.forEach((b, idx) => {
    console.log(`\n--- Block ${idx + 1} ---`);
    console.log(`Header: ${b.header}`);
    console.log(`Prompt: "${b.prompt}"`);
    console.log(`Solution: "${b.solution}"`);
  });
} else {
  console.log("Source not found or has no parsedBlocks.");
}
