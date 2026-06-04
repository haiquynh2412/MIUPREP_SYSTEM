const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '..');
const reportDir = path.join(workspaceRoot, 'reports', 'content-quality');
const previewPath = path.join(reportDir, 'math6-question-bank-preview.json');
const rawPath = resolveDefaultMath6RawPath();
const jsonOutPath = path.join(reportDir, 'math6-display-audit.json');
const mdOutPath = path.join(reportDir, 'math6-display-audit.md');

const preview = JSON.parse(fs.readFileSync(previewPath, 'utf8').replace(/^\uFEFF/, ''));
const rawExtract = JSON.parse(fs.readFileSync(rawPath, 'utf8').replace(/^\uFEFF/, ''));
const items = preview.items || [];
const rawSources = Array.isArray(rawExtract) ? rawExtract : rawExtract.sources || [];

const EXERCISE_HEADER_RE = /(?:^|[\r\n\f]|[^\p{L}])\s*((?:B[\p{L}\u00a0]{0,3}i|C[\p{L}\u00a0]{0,3}u)(?:\s+t[\p{L}\u00a0]{0,3}p)?\s*\d+[A-Za-z\u00c0-\u1ef90-9\s]*[:.)-]?)/giu;
const CONTROL_OR_REPLACEMENT_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/;
const MOJIBAKE_RE = /(?:\u00c3|\u00c4|\u00c5|\u00c2|\u00c6|\u00e1[\u00ba\u00bb])/;
const LEGACY_FONT_RE = /[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]/;

const rawBlocksBySource = new Map(
  rawSources.map((source) => [source.relativePath || source.fileName, extractRawBlocks(source.text)]),
);

const audits = items.map((item) => {
  const prompt = String(item.prompt || '');
  const normalizedPrompt = normalizeSearchText(prompt);
  const sourceFile = item.metadata?.sourceFile || '';
  const blockIndex = getBlockIndex(item.id);
  const rawBlock = blockIndex ? rawBlocksBySource.get(sourceFile)?.[blockIndex - 1] : undefined;
  const rawOleMarkers = rawBlock?.oleMarkers || 0;

  return {
    id: item.id,
    sourceFile,
    topicId: item.metadata?.topicId || 'unknown',
    patternId: item.metadata?.patternId || 'unknown',
    level: item.metadata?.level || 'unknown',
    prompt,
    flags: {
      controlCharacters: CONTROL_OR_REPLACEMENT_RE.test(prompt),
      legacyFontOrEncoding: LEGACY_FONT_RE.test(prompt) || MOJIBAKE_RE.test(prompt),
      imageDependency: hasImageDependency(normalizedPrompt),
      generatedFigure: Boolean(item.metadata?.generatedFigure),
      rawOleFormulaMarkers: rawOleMarkers,
      blankFormulaShape: hasBlankFormulaShape(normalizedPrompt),
    },
  };
});

const issueRows = audits.map((audit) => ({
  ...audit,
  needsFormulaReview: audit.flags.rawOleFormulaMarkers > 0 || audit.flags.blankFormulaShape,
  needsImageReview: audit.flags.imageDependency && !audit.flags.generatedFigure,
  needsTextEncodingReview: audit.flags.controlCharacters || audit.flags.legacyFontOrEncoding,
}));

const summary = {
  schemaVersion: 'math6_display_audit_v1',
  generatedAt: new Date().toISOString(),
  totalItems: items.length,
  readyForDisplay: issueRows.filter((row) => !row.needsFormulaReview && !row.needsImageReview && !row.needsTextEncodingReview).length,
  needsFormulaReview: issueRows.filter((row) => row.needsFormulaReview).length,
  needsImageReview: issueRows.filter((row) => row.needsImageReview).length,
  needsTextEncodingReview: issueRows.filter((row) => row.needsTextEncodingReview).length,
  generatedFigures: audits.filter((row) => row.flags.generatedFigure).length,
  promptControlCharacters: audits.filter((row) => row.flags.controlCharacters).length,
  rawSourcesWithOleMarkers: rawSources.filter((source) => getRawOleMarkerCount(source) > 0).length,
  rawOleMarkersTotal: rawSources.reduce((sum, source) => sum + getRawOleMarkerCount(source), 0),
  byTopic: summarizeBy(issueRows, 'topicId'),
  topFormulaSources: topSources(issueRows, (row) => row.needsFormulaReview),
  topImageSources: topSources(issueRows, (row) => row.needsImageReview),
  topEncodingSources: topSources(issueRows, (row) => row.needsTextEncodingReview),
  samples: {
    formula: sampleRows(issueRows.filter((row) => row.needsFormulaReview)),
    image: sampleRows(issueRows.filter((row) => row.needsImageReview)),
    encoding: sampleRows(issueRows.filter((row) => row.needsTextEncodingReview)),
  },
};

fs.writeFileSync(jsonOutPath, JSON.stringify({ summary, issues: issueRows }, null, 2), 'utf8');
fs.writeFileSync(mdOutPath, renderMarkdown(summary), 'utf8');
console.log(JSON.stringify(summary, null, 2));

function extractRawBlocks(text) {
  const normalized = String(text || '')
    .replace(/\u0007/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/\r/g, '\n');
  const matches = [...normalized.matchAll(EXERCISE_HEADER_RE)];
  return matches
    .map((match, index) => {
      const start = getExerciseHeaderStart(match);
      const next = matches[index + 1] ? getExerciseHeaderStart(matches[index + 1]) : normalized.length;
      const raw = normalized.slice(start, next);
      const cleaned = normalizePrompt(raw);
      return {
        raw,
        cleaned,
        oleMarkers: countMatches(raw, /\u0001/g),
      };
    })
    .filter((block) => block.cleaned.length >= 24 && block.cleaned.length <= 2600);
}

function getExerciseHeaderStart(match) {
  const fullMatch = match[0] || '';
  const header = match[1] || '';
  const offset = header ? fullMatch.indexOf(header) : 0;
  return (match.index || 0) + Math.max(0, offset);
}

function getBlockIndex(id) {
  const match = String(id || '').match(/\.(\d{3})$/);
  return match ? Number(match[1]) : undefined;
}

function normalizePrompt(text) {
  return String(text || '')
    .replace(/\u0001/g, '')
    .replace(/\u0007/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function hasImageDependency(normalizedPrompt) {
  return /\bhinh\s+(?:ve|\d|ben|sau|duoi|tren)\b/.test(normalizedPrompt)
    || /\b(?:cho|ve|theo)\s+hinh\b/.test(normalizedPrompt)
    || /\bbang\s+o\b/.test(normalizedPrompt);
}

function hasBlankFormulaShape(normalizedPrompt) {
  return /\b[a-d]\)\s*\b[b-e]\)/.test(normalizedPrompt)
    || /=\s*(?:[.;,)]|$)/.test(normalizedPrompt)
    || /\b(?:biet|bang|la)\s+(?:va|;|,|\.)\b/.test(normalizedPrompt)
    || /\b(?:thuc hien phep tinh|rut gon|quy dong|so sanh|tim x)\b.{0,90}\b[a-d]\)\s*\b[b-e]\)/.test(normalizedPrompt);
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function countMatches(value, regex) {
  return (String(value || '').match(regex) || []).length;
}

function getRawOleMarkerCount(source) {
  return typeof source.rawOleMarkerCount === 'number' ? source.rawOleMarkerCount : countMatches(source.text, /\u0001/g);
}

function resolveDefaultMath6RawPath() {
  const richRawPath = path.join(reportDir, 'math6-rich-raw-extract.json');
  const plainRawPath = path.join(reportDir, 'math6-raw-extract.json');
  return shouldUseRichRawPath(richRawPath, plainRawPath) ? richRawPath : plainRawPath;
}

function shouldUseRichRawPath(richRawPath, plainRawPath) {
  if (!fs.existsSync(richRawPath)) return false;
  try {
    const richSources = readRawSources(richRawPath);
    const richSourcesWithText = richSources.filter((source) => String(source.text || '').trim().length > 0).length;
    if (!fs.existsSync(plainRawPath)) return richSourcesWithText > 0;
    const plainSources = readRawSources(plainRawPath);
    return richSources.length >= plainSources.length && richSourcesWithText >= Math.ceil(plainSources.length * 0.9);
  } catch {
    return false;
  }
}

function readRawSources(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.sources)) return parsed.sources;
  return [];
}

function summarizeBy(rows, key) {
  const result = {};
  rows.forEach((row) => {
    const value = row[key] || 'unknown';
    result[value] ||= { total: 0, formula: 0, image: 0, encoding: 0, ready: 0 };
    result[value].total += 1;
    if (row.needsFormulaReview) result[value].formula += 1;
    if (row.needsImageReview) result[value].image += 1;
    if (row.needsTextEncodingReview) result[value].encoding += 1;
    if (!row.needsFormulaReview && !row.needsImageReview && !row.needsTextEncodingReview) result[value].ready += 1;
  });
  return Object.fromEntries(Object.entries(result).sort((a, b) => b[1].total - a[1].total));
}

function topSources(rows, predicate) {
  const counts = {};
  rows.filter(predicate).forEach((row) => {
    counts[row.sourceFile] = (counts[row.sourceFile] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20)
    .map(([sourceFile, count]) => ({ sourceFile, count }));
}

function sampleRows(rows) {
  return rows.slice(0, 12).map((row) => ({
    id: row.id,
    sourceFile: row.sourceFile,
    topicId: row.topicId,
    flags: row.flags,
    prompt: row.prompt.slice(0, 260),
  }));
}

function renderMarkdown(summary) {
  const lines = [
    '# Math 6 Display Audit',
    '',
    `Generated at: ${summary.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Total imported items: ${summary.totalItems}`,
    `- Ready for display without detected issues: ${summary.readyForDisplay}`,
    `- Needs formula review: ${summary.needsFormulaReview}`,
    `- Needs image review: ${summary.needsImageReview}`,
    `- Needs text encoding review: ${summary.needsTextEncodingReview}`,
    `- Generated SVG figures: ${summary.generatedFigures}`,
    `- Prompt control/replacement characters still present: ${summary.promptControlCharacters}`,
    `- Raw sources with Word/OLE formula markers: ${summary.rawSourcesWithOleMarkers}`,
    `- Raw Word/OLE formula markers total: ${summary.rawOleMarkersTotal}`,
    '',
    '## Topic Risk',
    '',
    '| Topic | Total | Ready | Formula | Image | Encoding |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...Object.entries(summary.byTopic).map(([topic, row]) => `| ${escapeMd(topic)} | ${row.total} | ${row.ready} | ${row.formula} | ${row.image} | ${row.encoding} |`),
    '',
    '## Top Formula Sources',
    '',
    '| Source | Count |',
    '| --- | ---: |',
    ...summary.topFormulaSources.map((row) => `| ${escapeMd(row.sourceFile)} | ${row.count} |`),
    '',
    '## Top Image Sources',
    '',
    '| Source | Count |',
    '| --- | ---: |',
    ...summary.topImageSources.map((row) => `| ${escapeMd(row.sourceFile)} | ${row.count} |`),
    '',
    '## Top Encoding Sources',
    '',
    '| Source | Count |',
    '| --- | ---: |',
    ...summary.topEncodingSources.map((row) => `| ${escapeMd(row.sourceFile)} | ${row.count} |`),
    '',
    '## Samples',
    '',
    '### Formula Review',
    '',
    ...summary.samples.formula.map((row) => `- ${escapeMd(row.sourceFile)} / ${escapeMd(row.topicId)}: ${escapeMd(row.prompt)}`),
    '',
    '### Image Review',
    '',
    ...summary.samples.image.map((row) => `- ${escapeMd(row.sourceFile)} / ${escapeMd(row.topicId)}: ${escapeMd(row.prompt)}`),
    '',
    '### Encoding Review',
    '',
    ...summary.samples.encoding.map((row) => `- ${escapeMd(row.sourceFile)} / ${escapeMd(row.topicId)}: ${escapeMd(row.prompt)}`),
  ];
  return `${lines.join('\n')}\n`;
}

function escapeMd(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}
