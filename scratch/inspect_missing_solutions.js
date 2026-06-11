const fs = require('fs');
const path = require('path');

function inspectGrade(grade) {
  const previewPath = path.resolve(__dirname, `../reports/content-quality/math${grade}-display-ready-preview.json`);
  if (!fs.existsSync(previewPath)) {
    console.log(`Grade ${grade} preview not found at ${previewPath}`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
  const items = data.items || [];
  console.log(`\n================ INSPECTING GRADE ${grade} (Total: ${items.length} items) ================`);
  
  // Count by source file
  const fileStats = {};
  items.forEach(item => {
    const file = item.metadata.sourceFile || 'unknown';
    const hasSolution = item.explanation && item.explanation.steps && 
      !item.explanation.steps.includes('Nguồn chưa có lời giải chi tiết') && 
      !item.explanation.steps.includes('Chưa có lời giải chi tiết');
    const hasAnswer = item.correctAnswer !== null && item.correctAnswer !== undefined && item.correctAnswer !== '';
    
    if (!fileStats[file]) {
      fileStats[file] = { total: 0, missingSolutions: 0, missingAnswers: 0 };
    }
    fileStats[file].total++;
    if (!hasSolution) fileStats[file].missingSolutions++;
    if (!hasAnswer) fileStats[file].missingAnswers++;
  });
  
  console.log('Source Files and Missing Stats:');
  console.table(Object.entries(fileStats).map(([file, stats]) => ({
    File: file,
    Total: stats.total,
    'Missing Sol': stats.missingSolutions,
    'Missing Ans': stats.missingAnswers,
    'Sol Missing %': ((stats.missingSolutions / stats.total) * 100).toFixed(1) + '%',
    'Ans Missing %': ((stats.missingAnswers / stats.total) * 100).toFixed(1) + '%'
  })));
  
  // Sample a few missing solutions
  console.log('\nSamples of Missing Solutions:');
  let sampled = 0;
  for (const item of items) {
    const hasSolution = item.explanation && item.explanation.steps && 
      !item.explanation.steps.includes('Nguồn chưa có lời giải chi tiết') && 
      !item.explanation.steps.includes('Chưa có lời giải chi tiết');
    if (!hasSolution && sampled < 3) {
      console.log(`\n- [${item.id}] from [${item.metadata.sourceFile}] (Topic: ${item.metadata.topicId}):`);
      console.log(`  Prompt: ${item.prompt.slice(0, 300)}...`);
      console.log(`  Thinking: ${item.explanation.thinking}`);
      console.log(`  Steps: ${item.explanation.steps}`);
      sampled++;
    }
  }
}

inspectGrade(7);
inspectGrade(8);
