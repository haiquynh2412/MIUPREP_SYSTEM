import { buildMath9QuestionItemsFromRawSources, type Math9RawSource } from './math9-import';
import type { QuestionItem } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type Math9ContentIssueSeverity = 'blocker' | 'warning';

export interface Math9ContentIssue {
  code: string;
  severity: Math9ContentIssueSeverity;
  message: string;
  path: string;
  questionId?: string;
  sourceFile?: string;
  topicId?: string;
  field?: string;
}

export interface Math9SourceQualityRow {
  status: 'ready' | 'watch' | 'needs_repair';
  sourceFile: string;
  extension?: string;
  questions: number;
  displayReady: number;
  sourceSolutions: number;
  correctAnswers: number;
  scoredPracticeReady: number;
  blockers: number;
  warnings: number;
  formulaAssets: number;
  rawOleMarkers: number;
  formulaRecoveryGap: number;
  missingFormulaAssets: number;
  needsFormulaReview: number;
  needsOriginalImage: number;
  needsTextEncodingReview: number;
}

export interface Math9ContentGuardReport {
  schemaVersion: 'math9_content_guard_v1';
  generatedAt: string;
  input: {
    rawPath?: string;
    sources: number;
  };
  stats: {
    questions: number;
    displayReady: number;
    withSourceSolutions: number;
    withCorrectAnswers: number;
    scoredPracticeReady: number;
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
    missingFormulaAssets: number;
    sourcesWithFormulaRecoveryGap: number;
    formulaRecoveryGapMarkers: number;
    promptControlCharacters: number;
    rawSourcesWithOleMarkers: number;
    rawOleMarkersTotal: number;
  };
  pedagogy: {
    scoredPracticeReady: number;
    missingCorrectAnswer: number;
    missingSourceSolution: number;
    missingThinkingGuide: number;
    hardItemsWithoutThinkingLens: number;
    solutionMarkersInsidePrompt: number;
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
  issues: Math9ContentIssue[];
  sourceQuality: Math9SourceQualityRow[];
  displayReadyItemIds: string[];
  scoredPracticeReadyItemIds: string[];
}

export interface BuildMath9ContentGuardReportOptions {
  rawPath?: string;
  generatedAt?: string;
  formulaAssetExists?: (src: string) => boolean;
}

interface RawBlock {
  raw: string;
  cleaned: string;
  oleMarkers: number;
}

interface PedagogyReadiness {
  hasCorrectAnswer: boolean;
  hasSourceSolution: boolean;
  hasThinkingGuide: boolean;
  solutionMarkerInsidePrompt: boolean;
  isReady: boolean;
  missing: string[];
}

export function buildMath9ContentGuardReport(
  rawSources: Math9RawSource[],
  options: BuildMath9ContentGuardReportOptions = {},
): { report: Math9ContentGuardReport; items: QuestionItem[]; displayReadyItems: QuestionItem[] } {
  const importResult = buildMath9QuestionItemsFromRawSources(rawSources);
  const adapterErrors = validateStandardContentBundle({ questions: importResult.items });
  const rawBlocksBySource = new Map(
    rawSources.map((source) => [source.relativePath || source.fileName, extractRawBlocks(source.text)]),
  );
  const formulaRecoveryGapBySource = new Map(
    rawSources.map((source) => [source.relativePath || source.fileName, getFormulaRecoveryGap(source)]),
  );

  const issues: Math9ContentIssue[] = [];
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
  let missingFormulaAssets = 0;
  let promptControlCharacters = 0;
  let generatedFigures = 0;
  let missingCorrectAnswer = 0;
  let missingSourceSolution = 0;
  let missingThinkingGuide = 0;
  let hardItemsWithoutThinkingLens = 0;
  let solutionMarkersInsidePrompt = 0;
  const scoredPracticeReadyItemIds: string[] = [];
  const formulaReviewItemIds = new Set<string>();
  const imageReviewItemIds = new Set<string>();
  const encodingReviewItemIds = new Set<string>();
  const missingFormulaAssetsByItem = new Map<string, number>();
  const correctAnswerItemIds = new Set<string>();
  const sourceSolutionItemIds = new Set<string>();

  importResult.items.forEach((item, index) => {
    const prompt = String(item.prompt || '');
    const sourceFile = String(item.metadata?.sourceFile || '');
    const topicId = String(item.metadata?.topicId || '');
    const rawBlock = getRawBlockForItem(item, rawBlocksBySource);
    const rawOleMarkers = rawBlock?.oleMarkers || 0;
    const sourceFormulaRecoveryGap = formulaRecoveryGapBySource.get(sourceFile) || 0;
    const missingFormulaAssetFiles = countMissingFormulaAssetFiles(item, options);
    const recoveredFormulaAssets = countRecoveredFormulaAssets(item);
    const recoveredFigureAsset = hasRecoveredFigureAsset(item);
    const hasGeneratedFigure = Boolean(item.metadata?.generatedFigure);
    const imageStatus = String(item.metadata?.figureStatus || '');
    const blankFormulaShape = hasBlankFormulaShape(prompt);

    const formulaReview = missingFormulaAssetFiles > 0
      || blankFormulaShape
      || (rawOleMarkers > 0 && recoveredFormulaAssets === 0)
      || (sourceFormulaRecoveryGap > 0 && blankFormulaShape);
    const imageReview = imageStatus === 'needs_original_image' && !hasGeneratedFigure && !recoveredFigureAsset;
    const controlCharacters = CONTROL_OR_REPLACEMENT_RE.test(prompt);
    const encodingReview = controlCharacters || LEGACY_FONT_RE.test(prompt) || MOJIBAKE_RE.test(prompt);
    const pedagogy = inspectPedagogyReadiness(item);

    if (hasGeneratedFigure) generatedFigures += 1;
    if (formulaReview) {
      needsFormulaReview += 1;
      missingFormulaAssets += missingFormulaAssetFiles;
      formulaReviewItemIds.add(item.id);
      if (missingFormulaAssetFiles) missingFormulaAssetsByItem.set(item.id, missingFormulaAssetFiles);
      issues.push({
        code: 'display.formula_review',
        severity: 'blocker',
        message: renderFormulaReviewMessage(rawOleMarkers, sourceFormulaRecoveryGap, missingFormulaAssetFiles),
        path: `questions[${index}].prompt`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'prompt',
      });
    }

    if (imageReview) {
      needsOriginalImage += 1;
      imageReviewItemIds.add(item.id);
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
      encodingReviewItemIds.add(item.id);
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

    if (pedagogy.hasCorrectAnswer) correctAnswerItemIds.add(item.id);
    if (pedagogy.hasSourceSolution) sourceSolutionItemIds.add(item.id);
    if (!pedagogy.hasCorrectAnswer) missingCorrectAnswer += 1;
    if (!pedagogy.hasSourceSolution) missingSourceSolution += 1;
    if (!pedagogy.hasThinkingGuide) missingThinkingGuide += 1;
    if (item.difficulty === 'hard' && !pedagogy.hasThinkingGuide) hardItemsWithoutThinkingLens += 1;
    if (pedagogy.solutionMarkerInsidePrompt) solutionMarkersInsidePrompt += 1;

    const isScoredPracticeReady = !formulaReview && !imageReview && !encodingReview && pedagogy.isReady;
    if (isScoredPracticeReady) {
      scoredPracticeReadyItemIds.push(item.id);
    } else if (!pedagogy.isReady) {
      issues.push({
        code: 'pedagogy.scored_practice_not_ready',
        severity: 'blocker',
        message: renderPedagogyReadinessMessage(pedagogy),
        path: `questions[${index}]`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'pedagogy',
      });
    }
  });

  const rawSourcesWithOleMarkers = rawSources.filter((source) => getRawOleMarkerCount(source) > 0).length;
  const rawOleMarkersTotal = rawSources.reduce((sum, source) => sum + getRawOleMarkerCount(source), 0);
  const sourceRecoveryGaps = rawSources.map(getFormulaRecoveryGap).filter((count) => count > 0);
  const displayReadyItems = importResult.items.filter((item) => displayReadyItemIds.includes(item.id));
  const sourceQuality = buildSourceQualityRows(
    rawSources,
    importResult.items,
    issues,
    new Set(displayReadyItemIds),
    new Set(scoredPracticeReadyItemIds),
    correctAnswerItemIds,
    sourceSolutionItemIds,
    formulaReviewItemIds,
    imageReviewItemIds,
    encodingReviewItemIds,
    missingFormulaAssetsByItem,
  );

  const report: Math9ContentGuardReport = {
    schemaVersion: 'math9_content_guard_v1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    input: {
      rawPath: options.rawPath,
      sources: rawSources.length,
    },
    stats: {
      questions: importResult.items.length,
      displayReady: displayReadyItems.length,
      withSourceSolutions: sourceSolutionItemIds.size,
      withCorrectAnswers: correctAnswerItemIds.size,
      scoredPracticeReady: scoredPracticeReadyItemIds.length,
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
      missingFormulaAssets,
      sourcesWithFormulaRecoveryGap: sourceRecoveryGaps.length,
      formulaRecoveryGapMarkers: sourceRecoveryGaps.reduce((sum, count) => sum + count, 0),
      promptControlCharacters,
      rawSourcesWithOleMarkers,
      rawOleMarkersTotal,
    },
    pedagogy: {
      scoredPracticeReady: scoredPracticeReadyItemIds.length,
      missingCorrectAnswer,
      missingSourceSolution,
      missingThinkingGuide,
      hardItemsWithoutThinkingLens,
      solutionMarkersInsidePrompt,
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
    sourceQuality,
    displayReadyItemIds,
    scoredPracticeReadyItemIds,
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

function countMissingFormulaAssetFiles(item: QuestionItem, options: BuildMath9ContentGuardReportOptions): number {
  if (!options.formulaAssetExists) return 0;
  const formulaAssets = item.metadata?.formulaAssets;
  if (!Array.isArray(formulaAssets)) return 0;
  return formulaAssets.filter((asset) => {
    const src = typeof asset === 'object' && asset && 'src' in asset ? String((asset as { src?: unknown }).src || '') : '';
    return src.startsWith('/assets/') && !options.formulaAssetExists?.(src);
  }).length;
}

function countRecoveredFormulaAssets(item: QuestionItem): number {
  const formulaAssets = item.metadata?.formulaAssets;
  return Array.isArray(formulaAssets) ? formulaAssets.length : 0;
}

function hasRecoveredFigureAsset(item: QuestionItem): boolean {
  const formulaAssets = item.metadata?.formulaAssets;
  if (!Array.isArray(formulaAssets)) return false;
  return formulaAssets.some((asset) => {
    if (!asset || typeof asset !== 'object') return false;
    const width = Number((asset as { width?: unknown }).width || 0);
    const height = Number((asset as { height?: unknown }).height || 0);
    return width >= 80 || height >= 80;
  });
}

function getRawOleMarkerCount(source: Math9RawSource): number {
  return typeof source.rawOleMarkerCount === 'number' ? source.rawOleMarkerCount : countMatches(source.text, /\u0001/g);
}

function getFormulaRecoveryGap(source: Math9RawSource): number {
  if (!source.richExtraction) return 0;
  const rawMarkers = getRawOleMarkerCount(source);
  const recoveredAssets = typeof source.formulaAssetCount === 'number' ? source.formulaAssetCount : 0;
  return Math.max(0, rawMarkers - recoveredAssets);
}

function renderFormulaReviewMessage(rawOleMarkers: number, sourceFormulaRecoveryGap: number, missingFormulaAssetFiles: number): string {
  if (missingFormulaAssetFiles > 0) {
    return `Question references ${missingFormulaAssetFiles} recovered formula image(s) that are missing from the portal asset folder.`;
  }
  if (sourceFormulaRecoveryGap > 0) {
    return `Source still has ${sourceFormulaRecoveryGap} Word/OLE formula marker(s) without recovered image assets.`;
  }
  return `Question may have lost Word/OLE formula content (${rawOleMarkers} raw marker(s)).`;
}

function inspectPedagogyReadiness(item: QuestionItem): PedagogyReadiness {
  const explanation = explanationText(item.explanation);
  const searchText = normalizeSearchText(`${item.prompt || ''}\n${explanation}`);
  const acceptedAnswers = (item as { acceptedAnswers?: unknown[][] }).acceptedAnswers;
  const hasAcceptedAnswer = Array.isArray(acceptedAnswers) && acceptedAnswers.some((group) => Array.isArray(group) && group.some(hasScorableAnswer));
  const hasCorrectAnswer = hasScorableAnswer(item.correctAnswer) || hasAcceptedAnswer;
  const hasSourceSolution = String(item.metadata?.solutionStatus || '') === 'source_solution'
    || String(item.metadata?.sourceSolutionStatus || '') === 'source_solution';
  const hasThinkingGuide = explanation.trim().length >= 24 && THINKING_GUIDE_RE.test(searchText);
  const solutionMarkerInsidePrompt = REVIEW_MARKER_RE.test(normalizeSearchText(item.prompt || ''));
  const missing = [
    hasCorrectAnswer ? '' : 'correct answer',
    hasSourceSolution ? '' : 'source solution',
    hasThinkingGuide ? '' : 'thinking guide',
  ].filter(Boolean);

  return {
    hasCorrectAnswer,
    hasSourceSolution,
    hasThinkingGuide,
    solutionMarkerInsidePrompt,
    isReady: missing.length === 0,
    missing,
  };
}

function hasScorableAnswer(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasScorableAnswer);
  return String(value ?? '').trim().length > 0;
}

function explanationText(value: QuestionItem['explanation']): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return Object.values(value)
      .map((entry) => typeof entry === 'string' ? entry : JSON.stringify(entry))
      .join(' ');
  }
  return String(value);
}

function renderPedagogyReadinessMessage(pedagogy: PedagogyReadiness): string {
  return `Question is not ready for scored Math 9 practice; missing ${pedagogy.missing.join(', ')}.`;
}

function buildSourceQualityRows(
  rawSources: Math9RawSource[],
  items: QuestionItem[],
  issues: Math9ContentIssue[],
  displayReadyItemIds: Set<string>,
  scoredPracticeReadyItemIds: Set<string>,
  correctAnswerItemIds: Set<string>,
  sourceSolutionItemIds: Set<string>,
  formulaReviewItemIds: Set<string>,
  imageReviewItemIds: Set<string>,
  encodingReviewItemIds: Set<string>,
  missingFormulaAssetsByItem: Map<string, number>,
): Math9SourceQualityRow[] {
  return rawSources.map((source) => {
    const sourceFile = source.relativePath || source.fileName;
    const sourceItems = items.filter((item) => String(item.metadata?.sourceFile || '') === sourceFile);
    const sourceIssues = issues.filter((issue) => issue.sourceFile === sourceFile);
    const blockers = sourceIssues.filter((issue) => issue.severity === 'blocker').length;
    const warnings = sourceIssues.filter((issue) => issue.severity === 'warning').length;
    const displayReady = sourceItems.filter((item) => displayReadyItemIds.has(item.id)).length;
    const scoredPracticeReady = sourceItems.filter((item) => scoredPracticeReadyItemIds.has(item.id)).length;
    const missingFormulaAssets = sourceItems.reduce((sum, item) => sum + (missingFormulaAssetsByItem.get(item.id) || 0), 0);
    const formulaAssets = sourceItems.reduce((sum, item) => sum + countRecoveredFormulaAssets(item), 0);
    const status: Math9SourceQualityRow['status'] = blockers > 0 || displayReady < sourceItems.length
      ? 'needs_repair'
      : warnings > 0 || scoredPracticeReady < displayReady
        ? 'watch'
        : 'ready';

    return {
      status,
      sourceFile,
      extension: source.extension,
      questions: sourceItems.length,
      displayReady,
      sourceSolutions: sourceItems.filter((item) => sourceSolutionItemIds.has(item.id)).length,
      correctAnswers: sourceItems.filter((item) => correctAnswerItemIds.has(item.id)).length,
      scoredPracticeReady,
      blockers,
      warnings,
      formulaAssets,
      rawOleMarkers: getRawOleMarkerCount(source),
      formulaRecoveryGap: getFormulaRecoveryGap(source),
      missingFormulaAssets,
      needsFormulaReview: sourceItems.filter((item) => formulaReviewItemIds.has(item.id)).length,
      needsOriginalImage: sourceItems.filter((item) => imageReviewItemIds.has(item.id)).length,
      needsTextEncodingReview: sourceItems.filter((item) => encodingReviewItemIds.has(item.id)).length,
    };
  });
}

function summarizeIssues(questionCount: number, issues: Math9ContentIssue[]): Math9ContentGuardReport['qualitySummary'] {
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
const THINKING_GUIDE_RE = /\b(?:nhan dien|quan sat|tu duy|cach lam|huong dan|method|chien luoc|dat an|ve hinh|phan tich|xet)\b/;
const REVIEW_MARKER_RE = /\b(?:dap an|huong dan cham|loi giai nguon|loi giai|bai giai)\b/;
