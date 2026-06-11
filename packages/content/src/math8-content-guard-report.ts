import { buildMath8QuestionItemsFromRawSources, type Math8RawSource } from './math8-import';
import type { QuestionItem } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type Math8ContentIssueSeverity = 'blocker' | 'warning';

export interface Math8ContentIssue {
  code: string;
  severity: Math8ContentIssueSeverity;
  message: string;
  path: string;
  questionId?: string;
  sourceFile?: string;
  topicId?: string;
  field?: string;
}

export interface Math8ContentGuardReport {
  schemaVersion: 'math8_content_guard_v1';
  generatedAt: string;
  input: {
    rawPath?: string;
    sources: number;
  };
  stats: {
    questions: number;
    displayReady: number;
    generatedFigures: number;
    byProgram: Record<string, number>;
    byTopic: Record<string, number>;
    byLevel: Record<string, number>;
    bySource: Record<string, number>;
  };
  qualitySummary: {
    questions: number;
    blockers: number;
    warnings: number;
    byCode: Record<string, number>;
  };
  display: {
    needsFormulaReview: number;
    needsOriginalImage: number;
    needsTextEncodingReview: number;
    promptControlCharacters: number;
    rawSourcesWithOleMarkers: number;
    rawOleMarkersTotal: number;
  };
  adapter: {
    convertedItems: number;
    errors: ValidationError[];
    pass: boolean;
  };
  import: {
    mappedSources: number;
    unmappedSources: string[];
    extractedBlocks: number;
  };
  issues: Math8ContentIssue[];
  displayReadyItemIds: string[];
}

export interface BuildMath8ContentGuardReportOptions {
  rawPath?: string;
  generatedAt?: string;
}

interface RawBlock {
  raw: string;
  cleaned: string;
  oleMarkers: number;
}

export function buildMath8ContentGuardReport(
  rawSources: Math8RawSource[],
  options: BuildMath8ContentGuardReportOptions = {},
): { report: Math8ContentGuardReport; items: QuestionItem[]; displayReadyItems: QuestionItem[] } {
  const importResult = buildMath8QuestionItemsFromRawSources(rawSources);
  const adapterErrors = validateStandardContentBundle({ questions: importResult.items });
  const rawBlocksBySource = new Map(
    rawSources.map((source) => {
      const key = source.relativePath || source.fileName;
      if (source.parsedBlocks && source.parsedBlocks.length > 0) {
        return [
          key,
          source.parsedBlocks.map((block) => {
            const raw = block.prompt + ' ' + (block.solution || '') + ' ' + (block.method || '');
            return {
              raw,
              cleaned: block.prompt,
              oleMarkers: countMatches(raw, /\u0001/g),
            };
          }),
        ];
      }
      return [key, extractRawBlocks(source.text)];
    }),
  );

  const issues: Math8ContentIssue[] = [];
  importResult.report.issues.forEach((issue, index) => {
    issues.push({
      code: `import.${issue.code}`,
      severity: issue.severity,
      message: issue.message,
      path: `import.issues[${index}]`,
      sourceFile: issue.sourceFile,
      topicId: issue.topicId,
    });
  });

  adapterErrors.forEach((error) => {
    issues.push({
      code: 'adapter.validation',
      severity: 'blocker',
      message: error.message,
      path: error.path,
    });
  });

  const displayReadyItemIds: string[] = [];
  let needsFormulaReview = 0;
  let needsOriginalImage = 0;
  let needsTextEncodingReview = 0;
  let promptControlCharacters = 0;
  let generatedFigures = 0;

  importResult.items.forEach((item, index) => {
    const prompt = String(item.prompt || '');
    const sourceFile = String(item.metadata?.sourceFile || '');
    const topicId = String(item.metadata?.topicId || '');
    const rawBlock = getRawBlockForItem(item, rawBlocksBySource);
    const rawOleMarkers = rawBlock?.oleMarkers || 0;
    const hasGeneratedFigure = Boolean(item.metadata?.generatedFigure);
    const imageStatus = String(item.metadata?.figureStatus || '');

    const formulaReview = rawOleMarkers > 0 || hasBlankFormulaShape(prompt);
    const imageReview = imageStatus === 'needs_original_image' && !hasGeneratedFigure;
    const controlCharacters = CONTROL_OR_REPLACEMENT_RE.test(prompt);
    const encodingReview = controlCharacters || LEGACY_FONT_RE.test(prompt) || MOJIBAKE_RE.test(prompt);

    if (hasGeneratedFigure) generatedFigures += 1;
    if (formulaReview) {
      needsFormulaReview += 1;
      issues.push({
        code: 'display.formula_review',
        severity: 'blocker',
        message: `Question may have lost Word/OLE formula content (${rawOleMarkers} raw marker(s)).`,
        path: `questions[${index}].prompt`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'prompt',
      });
    }

    if (imageReview) {
      needsOriginalImage += 1;
      issues.push({
        code: 'display.image_missing',
        severity: 'blocker',
        message: 'Question depends on an original figure/image that has not been captured or generated.',
        path: `questions[${index}].metadata.figureStatus`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'metadata.figureStatus',
      });
    }

    if (encodingReview) {
      needsTextEncodingReview += 1;
      if (controlCharacters) promptControlCharacters += 1;
      issues.push({
        code: controlCharacters ? 'display.control_characters' : 'display.legacy_font_encoding',
        severity: 'blocker',
        message: controlCharacters ? 'Prompt still contains control/replacement characters.' : 'Prompt appears to contain legacy font or mojibake text.',
        path: `questions[${index}].prompt`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'prompt',
      });
    }

    if (!formulaReview && !imageReview && !encodingReview) {
      displayReadyItemIds.push(item.id);
    }
  });

  const rawSourcesWithOleMarkers = rawSources.filter((source) => getRawOleMarkerCount(source) > 0).length;
  const rawOleMarkersTotal = rawSources.reduce((sum, source) => sum + getRawOleMarkerCount(source), 0);
  const displayReadyItems = importResult.items.filter((item) => displayReadyItemIds.includes(item.id));

  const report: Math8ContentGuardReport = {
    schemaVersion: 'math8_content_guard_v1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    input: {
      rawPath: options.rawPath,
      sources: rawSources.length,
    },
    stats: {
      questions: importResult.items.length,
      displayReady: displayReadyItems.length,
      generatedFigures,
      byProgram: countPrograms(importResult.items),
      byTopic: countBy(importResult.items, (item) => String(item.metadata?.topicId || 'unknown')),
      byLevel: countBy(importResult.items, (item) => String(item.metadata?.level || 'unknown')),
      bySource: countBy(importResult.items, (item) => String(item.metadata?.sourceFile || 'unknown')),
    },
    qualitySummary: summarizeIssues(importResult.items.length, issues),
    display: {
      needsFormulaReview,
      needsOriginalImage,
      needsTextEncodingReview,
      promptControlCharacters,
      rawSourcesWithOleMarkers,
      rawOleMarkersTotal,
    },
    adapter: {
      convertedItems: importResult.items.length,
      errors: adapterErrors,
      pass: adapterErrors.length === 0,
    },
    import: {
      mappedSources: importResult.report.mappedSources,
      unmappedSources: importResult.report.unmappedSources,
      extractedBlocks: importResult.report.extractedBlocks,
    },
    issues,
    displayReadyItemIds,
  };

  return { report, items: importResult.items, displayReadyItems };
}

function getRawBlockForItem(item: QuestionItem, rawBlocksBySource: Map<string, RawBlock[]>): RawBlock | undefined {
  const sourceFile = String(item.metadata?.sourceFile || '');
  const blockIndex = getBlockIndex(item.id);
  if (!blockIndex) return undefined;
  return rawBlocksBySource.get(sourceFile)?.[blockIndex - 1];
}

function getBlockIndex(id: string): number | undefined {
  const match = String(id || '').match(/\.(\d{3})$/);
  return match ? Number(match[1]) : undefined;
}

function extractRawBlocks(text: string): RawBlock[] {
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
      return {
        raw,
        cleaned: normalizePrompt(raw),
        oleMarkers: countMatches(raw, /\u0001/g),
      };
    })
    .filter((block) => block.cleaned.length >= 24 && block.cleaned.length <= 2600);
}

function getExerciseHeaderStart(match: RegExpMatchArray): number {
  const fullMatch = match[0] || '';
  const header = match[1] || '';
  const offset = header ? fullMatch.indexOf(header) : 0;
  return (match.index || 0) + Math.max(0, offset);
}

function normalizePrompt(text: string): string {
  return String(text || '')
    .replace(/\u0001/g, '')
    .replace(/\u0007/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function hasBlankFormulaShape(prompt: string): boolean {
  const text = normalizeSearchText(prompt);
  const originalLower = String(prompt || '').toLowerCase();
  const hasBlankVerbOrConjunction = /(?:^|[^a-z0-9\u00c0-\u1ef9])(?:bi\u1ebft|b\u1eb1ng|l\u00e0)\s+(?:v\u00e0|;|,|\.)(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower)
    || (/\b(?:biet|bang|la)\s+(?:va|;|,|\.)\b/.test(text) && !/(?:^|[^a-z0-9\u00c0-\u1ef9])(?:l\u00e1|la)\s+v\u00e0(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower));

  return /\b[a-d]\)\s*\b[b-e]\)/.test(text)
    || /=\s*(?:[;,)]|(?:\.(?!\.\.))|$)/.test(text)
    || hasBlankVerbOrConjunction
    || /\b(?:thuc hien phep tinh|rut gon|quy dong|so sanh|tim x)\b.{0,90}\b[a-d]\)\s*\b[b-e]\)/.test(text);
}

function normalizeSearchText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function countPrograms(items: QuestionItem[]): Record<string, number> {
  const result: Record<string, number> = {};
  items.forEach((item) => {
    item.programIds.forEach((programId) => {
      result[programId] = (result[programId] || 0) + 1;
    });
  });
  return result;
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = key(item) || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function countMatches(value: string | undefined, regex: RegExp): number {
  return (String(value || '').match(regex) || []).length;
}

function getRawOleMarkerCount(source: Math8RawSource): number {
  return typeof source.rawOleMarkerCount === 'number' ? source.rawOleMarkerCount : countMatches(source.text, /\u0001/g);
}

function summarizeIssues(questionCount: number, issues: Math8ContentIssue[]): Math8ContentGuardReport['qualitySummary'] {
  return {
    questions: questionCount,
    blockers: issues.filter((issue) => issue.severity === 'blocker').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    byCode: countBy(issues, (issue) => issue.code),
  };
}

const EXERCISE_HEADER_RE = /(?:^|[\r\n\f]|[^\p{L}])\s*((?:B[\p{L}\u00a0]{0,3}i|C[\p{L}\u00a0]{0,3}u)(?:\s+t[\p{L}\u00a0]{0,3}p)?\s*\d+[A-Za-z\u00c0-\u1ef90-9\s]*[:.)-]?)/giu;
const CONTROL_OR_REPLACEMENT_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/;
const MOJIBAKE_RE = /(?:[\u00c3\u00c4\u00c5\u00c6][\u0080-\u00bf]|\u00e1[\u00ba\u00bb])/;
const LEGACY_FONT_RE = /[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]/;
