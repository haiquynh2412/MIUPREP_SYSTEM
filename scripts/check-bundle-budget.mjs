#!/usr/bin/env node
// Bundle-size budget gate. Fails (exit 1) if any app's entry chunk exceeds its
// budget, so the portal code-splitting work (and others) can't silently regress.
//
// Usage: node scripts/check-bundle-budget.mjs
// Assumes each app under test has already been built (dist/ present).

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Budgets in KB for the main entry chunk (the file index.html loads first).
// Numbers are set ~30% above the current size so normal growth is fine but a
// regression (e.g. un-lazying a heavy panel) trips the gate.
const BUDGETS = [
  { name: 'miuprep-portal', dist: 'apps/miuprep-portal/dist/assets', entry: /^index-.*\.js$/, maxKB: 110 },
];

function largestMatch(dir, pattern) {
  if (!existsSync(dir)) return null;
  let biggest = null;
  for (const file of readdirSync(dir)) {
    if (!pattern.test(file)) continue;
    const size = statSync(join(dir, file)).size;
    if (!biggest || size > biggest.size) biggest = { file, size };
  }
  return biggest;
}

let failed = false;
const skipped = [];

for (const b of BUDGETS) {
  const dir = join(root, b.dist);
  const hit = largestMatch(dir, b.entry);
  if (!hit) {
    skipped.push(b.name);
    continue;
  }
  const kb = hit.size / 1024;
  const status = kb > b.maxKB ? 'FAIL' : 'ok';
  if (kb > b.maxKB) failed = true;
  console.log(`[${status}] ${b.name}: ${hit.file} = ${kb.toFixed(1)}KB (budget ${b.maxKB}KB)`);
}

if (skipped.length) {
  console.log(`[skip] not built (no dist): ${skipped.join(', ')} — build before checking to enforce the budget.`);
}

if (failed) {
  console.error('\nBundle budget exceeded. Lazy-load heavy modules or raise the budget intentionally.');
  process.exit(1);
}
console.log('\nBundle budget OK.');
