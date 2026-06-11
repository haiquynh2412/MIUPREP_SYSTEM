const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.dirname(__dirname);
const rawExtractPath = path.join(workspaceRoot, 'reports/content-quality/math10-rich-raw-extract.json');
const guardReportPath = path.join(workspaceRoot, 'reports/content-quality/math10-content-guard.json');

// We can load the compiled js files from dist/
const { buildMath10QuestionItemsFromRawSources } = require(path.join(workspaceRoot, 'packages/content/dist/math10-import.js'));

const rawSources = JSON.parse(fs.readFileSync(rawExtractPath, 'utf8'));
const guardReport = JSON.parse(fs.readFileSync(guardReportPath, 'utf8'));

// Get targeted 20 block IDs
const targetedIds = new Set();
const issuesByQid = {};
for (const issue of guardReport.issues) {
  if (issue.severity === 'blocker' && (issue.code === 'display.legacy_font_encoding' || issue.code === 'display.control_characters')) {
    targetedIds.add(issue.questionId);
    if (!issuesByQid[issue.questionId]) {
      issuesByQid[issue.questionId] = [];
    }
    issuesByQid[issue.questionId].push(issue);
  }
}

console.log(`Targeting ${targetedIds.size} questions from guard report.`);

// Parse questions using the official TS/JS parser logic
const importResult = buildMath10QuestionItemsFromRawSources(rawSources.sources || rawSources);

const matchedQuestions = [];
for (const item of importResult.items) {
  if (targetedIds.has(item.id)) {
    matchedQuestions.push(item);
  }
}

console.log(`Matched ${matchedQuestions.length} out of ${targetedIds.size} questions.`);

// Write detailed comparison to scratch/review-193-issues.md
const outputReviewPath = path.join(workspaceRoot, 'scratch/review-193-issues.md');
const mdLines = [
  '# Review of 20 Remaining Encoding Issues in Math 10',
  '',
  `Total targeted questions: ${targetedIds.size}`,
  `Matched in extract: ${matchedQuestions.length}`,
  '',
];

// Helper to clean prompt like fix-math10-extract.py does in python
function cleanTextFn(text, relPath) {
  let cleaned = text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/g, ' ');
  cleaned = cleaned.replace(/\u0001/g, ' ').replace(/\u0002/g, ' ');
  const relPathLower = relPath.toLowerCase();
  
  if (relPathLower.includes('le-quang-xe') || relPathLower.includes('le_quang_xe') || relPathLower.includes('menh de va tap hop')) {
    const replacements = {
      '¶': '{',
      '©': '}',
      '®': 'R',
      'ß': '{',
      '™': '}',
      'Ä': '(',
      'ä': ')',
      'Ç': '(',
      'å': ')',
      'ñ': '[',
      'ï': '[',
      'ã': ')',
      'Å': '(',
      'ò': ']',
      'ö': '(',
      'ü': ')'
    };
    for (const [k, v] of Object.entries(replacements)) {
      cleaned = cleaned.split(k).join(v);
    }
    
    // regex replacements
    cleaned = cleaned.replace(/([;\s\-−\d\w√+∞]+)ô(?=\s|[\.\,\)\}\]\|\n]|$)/g, '$1]');
    cleaned = cleaned.replace(/;\s*ô/g, '; ]');
    cleaned = cleaned.replace(/([0-9a-zA-Z\+−∞√]+)ô/g, '$1]');
  }
  
  if (relPathLower.includes('menh de') || relPathLower.includes('menh_de')) {
    const tcvnReplacements = {
      'cã': 'có',
      'nghiÖm': 'nghiệm',
      'ph©n': 'phân',
      'biÖt': 'biệt',
      'híng': 'hướng',
      'híc': 'hướng'
    };
    for (const [k, v] of Object.entries(tcvnReplacements)) {
      cleaned = cleaned.split(k).join(v);
    }
  }
  
  return cleaned;
}

// Group by source file
const groupedByFile = {};
for (const q of matchedQuestions) {
  const sf = q.metadata.sourceFile || 'unknown';
  if (!groupedByFile[sf]) {
    groupedByFile[sf] = [];
  }
  groupedByFile[sf].push(q);
}

for (const [sf, items] of Object.entries(groupedByFile)) {
  mdLines.push(`## Source: \`${sf}\` (${items.length} issues)`);
  mdLines.push('');
  
  items.forEach((q, idx) => {
    const cleanPrompt = cleanTextFn(q.prompt, sf);
    mdLines.push(`### ${idx + 1}. ID: \`${q.id}\``);
    mdLines.push(`- **Issues**: ${issuesByQid[q.id].map(x => x.message).join(', ')}`);
    mdLines.push(`- **Topic**: \`${q.metadata.topicId}\``);
    mdLines.push('');
    mdLines.push('#### Before:');
    mdLines.push('```text');
    mdLines.push(q.prompt);
    mdLines.push('```');
    mdLines.push('');
    mdLines.push('#### After Clean (Proposed):');
    mdLines.push('```text');
    mdLines.push(cleanPrompt);
    mdLines.push('```');
    mdLines.push('');
    mdLines.push('---');
    mdLines.push('');
  });
}

fs.writeFileSync(outputReviewPath, mdLines.join('\n'), 'utf8');
console.log(`Wrote exact issues list to ${outputReviewPath}`);
