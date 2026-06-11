const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = 'C:/Users/HAIQUYNH/OneDrive/CODE AI/MIUPREP_SYSTEM';

// Strictly VNI/TCVN3 OCR corruptions
const corruptPatterns = [
  { regex: /Baøi/i, label: 'Baøi (VNI)' },
  { regex: /caâu/i, label: 'caâu (VNI)' },
  { regex: /soá/i, label: 'soá (VNI)' },
  { regex: /hỡnh/i, label: 'hỡnh (OCR/TCVN)' },
  { regex: /thỡ/i, label: 'thỡ (OCR/TCVN)' },
  { regex: /tớnh/i, label: 'tớnh (OCR/TCVN)' },
  { regex: /cõu/i, label: 'cõu (OCR/TCVN)' },
  { regex: /qu\)ng/i, label: 'qu)ng (OCR)' },
  { regex: /đ\)/i, label: 'đ) (OCR)' },
  { regex: /phth/i, label: 'phth (OCR)' },
  { regex: /coù/i, label: 'coù (VNI)' },
  { regex: /ñaùp/i, label: 'ñaùp (VNI)' },
  { regex: /ñeå/i, label: 'ñeå (VNI)' },
  { regex: /ñuùng/i, label: 'ñuùng (VNI)' },
  { regex: /ñeàn/i, label: 'ñeàn (VNI)' },
  { regex: /cỳ/i, label: 'cỳ (OCR)' },
  { regex: /tớch/i, label: 'tớch (OCR)' },
  { regex: /đỳ/i, label: 'đỳ (OCR)' },
];

let logContent = '';
function log(msg) {
  console.log(msg);
  logContent += msg + '\n';
}

function auditGrade(grade) {
  const filePath = path.resolve(workspaceRoot, `reports/content-quality/math${grade}-display-ready-preview.json`);
  if (!fs.existsSync(filePath)) {
    log(`Grade ${grade} display-ready-preview not found.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const items = data.items || [];

  log(`\n==================================================`);
  log(`AUDITING GRADE ${grade} (${items.length} questions)`);
  log(`==================================================`);

  let spellingIssues = 0;
  let logicalIssues = 0;
  let fallbackAnswers = 0;

  const sampleSpelling = [];
  const sampleLogical = [];
  const sampleFallback = [];

  const gradeFallback = { 1: '5', 2: '10', 3: '30', 4: '40', 5: '50' }[grade];

  items.forEach(item => {
    const prompt = item.prompt || '';
    const explanation = item.explanation || '';
    const correctAnswer = item.correctAnswer || '';
    const allText = `${prompt} ${explanation} ${correctAnswer}`;

    // 1. Spelling
    const detectedSpelling = [];
    corruptPatterns.forEach(pattern => {
      if (pattern.regex.test(allText)) {
        detectedSpelling.push(pattern.label);
      }
    });

    if (detectedSpelling.length > 0) {
      spellingIssues++;
      if (sampleSpelling.length < 5) {
        sampleSpelling.push({ id: item.id, detected: detectedSpelling, prompt: prompt.substring(0, 150) });
      }
    }

    // 2. Logic Check
    let expected = null;
    let operation = '';

    // Addition
    let match = prompt.match(/(\d+)\s*\+\s*(\d+)\s*=\s*(?:\?|\.{2,}|…)/);
    if (match) {
      expected = String(Number(match[1]) + Number(match[2]));
      operation = `${match[1]} + ${match[2]}`;
    } else {
      // Subtraction
      match = prompt.match(/(\d+)\s*-\s*(\d+)\s*=\s*(?:\?|\.{2,}|…)/);
      if (match) {
        expected = String(Number(match[1]) - Number(match[2]));
        operation = `${match[1]} - ${match[2]}`;
      } else {
        // Multiplication
        match = prompt.match(/(\d+)\s*[x*×]\s*(\d+)\s*=\s*(?:\?|\.{2,}|…)/);
        if (match) {
          expected = String(Number(match[1]) * Number(match[2]));
          operation = `${match[1]} x ${match[2]}`;
        } else {
          // Division
          match = prompt.match(/(\d+)\s*[:/÷]\s*(\d+)\s*=\s*(?:\?|\.{2,}|…)/);
          if (match) {
            const b = Number(match[2]);
            if (b !== 0) {
              expected = String(Number(match[1]) / b);
              operation = `${match[1]} : ${match[2]}`;
            }
          }
        }
      }
    }

    if (expected !== null && correctAnswer !== expected) {
      logicalIssues++;
      if (sampleLogical.length < 5) {
        sampleLogical.push({
          id: item.id,
          prompt,
          expected,
          actual: correctAnswer,
          operation,
          source: item.metadata?.sourceFile
        });
      }
    }

    // 3. Fallbacks
    if (correctAnswer === gradeFallback && expected === null) {
      const hasVal = prompt.includes(gradeFallback) || explanation.includes(gradeFallback) || (item.metadata?.sourceSolution && item.metadata.sourceSolution.includes(gradeFallback));
      if (!hasVal) {
        fallbackAnswers++;
        if (sampleFallback.length < 5) {
          sampleFallback.push({
            id: item.id,
            prompt: prompt.substring(0, 150),
            source: item.metadata?.sourceFile
          });
        }
      }
    }
  });

  log(`True OCR/VNI spelling issues: ${spellingIssues}`);
  log(`Logical mismatch issues: ${logicalIssues}`);
  if (sampleLogical.length > 0) {
    log(`Sample Logical Mismatch Issues:`);
    sampleLogical.forEach(l => log(`  - [${l.id}] (${l.source}): "${l.prompt.substring(0, 150)}"\n    Expected: ${l.expected} | Actual: ${l.actual}`));
  }
  log(`Fallback "${gradeFallback}" candidates: ${fallbackAnswers}`);
  if (sampleFallback.length > 0) {
    log(`Sample Fallback Candidates:`);
    sampleFallback.forEach(f => log(`  - [${f.id}] (${f.source}): "${f.prompt}"`));
  }
}

for (let g = 1; g <= 5; g++) {
  auditGrade(g);
}

fs.writeFileSync(path.resolve(workspaceRoot, 'scratch/audit_report_utf8.txt'), logContent, 'utf8');
log('\nAudit complete. Written to scratch/audit_report_utf8.txt');
