// Extract shared desktop components: copy ielts version, apply semantic color
// replacement ONLY on lines that differ from the cpe version.
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const FILES = [
  'hooks/useErrorNotebook.ts',
  'hooks/useLearnerProfile.ts',
  'hooks/useAiEvaluation.ts',
  'hooks/useExam.ts',
  'components/modules/ImportErrorModal.tsx',
  'components/modules/ModeSelectorModal.tsx',
  'components/ErrorNotebook.tsx',
  'components/AdaptivePracticeRoom.tsx',
  'components/modules/ExamSectionSheet.tsx',
];

const semantic = (line) => line
  .replaceAll('blue-', 'accent-')
  .replaceAll('indigo-', 'accentdeep-')
  .replaceAll('amber-', 'accentalt-');

for (const rel of FILES) {
  const ielts = `apps/ielts-desktop/src/${rel}`;
  const cpe = `apps/cpe-desktop/src/${rel}`;
  const out = `packages/exam-desktop/src/${rel}`;
  const lines = readFileSync(ielts, 'utf8').split('\n');

  // Collect ielts-side line numbers from diff hunks (NcM / N,McP,Q)
  let diffOut = '';
  try {
    diffOut = execSync(`diff "${ielts}" "${cpe}"`, { encoding: 'utf8' });
  } catch (e) {
    diffOut = e.stdout || '';
  }
  const changed = new Set();
  for (const m of diffOut.matchAll(/^(\d+)(?:,(\d+))?[cd]\d+(?:,\d+)?$/gm)) {
    const start = parseInt(m[1], 10);
    const end = m[2] ? parseInt(m[2], 10) : start;
    for (let i = start; i <= end; i++) changed.add(i);
  }

  let replaced = 0;
  const result = lines.map((line, idx) => {
    if (!changed.has(idx + 1)) return line;
    const next = semantic(line);
    if (next !== line) replaced++;
    return next;
  });
  writeFileSync(out, result.join('\n'));
  console.log(`${rel}: ${changed.size} differing lines, ${replaced} color-replaced`);
}
