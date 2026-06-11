const fs = require('fs');
const path = require('path');

function testTheory(grade) {
  const previewPath = path.resolve(__dirname, `../reports/content-quality/math${grade}-display-ready-preview.json`);
  if (!fs.existsSync(previewPath)) {
    console.log(`Grade ${grade} preview not found`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
  const items = data.items || [];
  
  let theoryCount = 0;
  const samples = [];
  
  items.forEach(item => {
    const prompt = item.prompt || '';
    const lowered = prompt.toLowerCase();
    
    // Check if the prompt seems like a theory section rather than an exercise
    const isTheory = (
      lowered.includes('i. lý thuyết') ||
      lowered.includes('i. ly thuyet') ||
      lowered.includes('kiến thức cần nhớ') ||
      lowered.includes('kien thuc can nho') ||
      lowered.includes('tóm tắt lý thuyết') ||
      lowered.includes('tom tat ly thuyet') ||
      (lowered.includes('lý thuyết') && lowered.includes('bài 1') && lowered.length > 200) ||
      (lowered.includes('lý thuyết') && lowered.includes('bài 2') && lowered.length > 200) ||
      (lowered.includes('lý thuyết') && lowered.includes('bài 3') && lowered.length > 200) ||
      (lowered.includes('lý thuyết') && lowered.includes('bài 4') && lowered.length > 200) ||
      (lowered.includes('lý thuyết') && lowered.includes('bài 5') && lowered.length > 200)
    );
    
    if (isTheory) {
      theoryCount++;
      if (samples.length < 5) {
        samples.push({
          id: item.id,
          source: item.metadata.sourceFile,
          prompt: prompt.slice(0, 300)
        });
      }
    }
  });
  
  console.log(`\nGrade ${grade} - Found ${theoryCount} / ${items.length} likely theory sections imported as exercises.`);
  console.log('Samples:');
  samples.forEach(s => {
    console.log(`- [${s.id}] from [${s.source}]:`);
    console.log(`  Prompt: ${s.prompt}`);
  });
}

testTheory(7);
testTheory(8);
