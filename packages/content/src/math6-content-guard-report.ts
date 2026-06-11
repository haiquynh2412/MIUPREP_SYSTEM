import { buildMath6QuestionItemsFromRawSources, type Math6RawSource } from './math6-import';
import type { QuestionItem } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type Math6ContentIssueSeverity = 'blocker' | 'warning';

export interface Math6ContentIssue {
  code: string;
  severity: Math6ContentIssueSeverity;
  message: string;
  path: string;
  questionId?: string;
  sourceFile?: string;
  topicId?: string;
  field?: string;
}

export interface Math6ContentGuardReport {
  schemaVersion: 'math6_content_guard_v1';
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
    missingFormulaAssets: number;
    sourcesWithFormulaRecoveryGap: number;
    formulaRecoveryGapMarkers: number;
    promptControlCharacters: number;
    rawSourcesWithOleMarkers: number;
    rawOleMarkersTotal: number;
  };
  pedagogy: {
    scoredPracticeReady: number;
    scoredPracticeExcluded: number;
    scoredPracticePending: number;
    missingCorrectAnswer: number;
    missingExplanation: number;
    missingWorkedSolution: number;
    missingTrapOrMisconception: number;
    missingThinkingGuide: number;
    hardItemsWithoutThinkingGuide: number;
    reviewMarkersInsidePrompt: number;
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
  issues: Math6ContentIssue[];
  displayReadyItemIds: string[];
  scoredPracticeReadyItemIds: string[];
}

export interface BuildMath6ContentGuardReportOptions {
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
  hasExplanation: boolean;
  hasWorkedSolution: boolean;
  hasTrapOrMisconception: boolean;
  hasThinkingGuide: boolean;
  reviewMarkerInsidePrompt: boolean;
  isReady: boolean;
  missing: string[];
}

interface ScoredPracticeExclusion {
  code: string;
  message: string;
}

export function buildMath6ContentGuardReport(
  rawSources: Math6RawSource[],
  options: BuildMath6ContentGuardReportOptions = {},
): { report: Math6ContentGuardReport; items: QuestionItem[]; displayReadyItems: QuestionItem[] } {
  const importResult = buildMath6QuestionItemsFromRawSources(rawSources);
  const adapterErrors = validateStandardContentBundle({ questions: importResult.items });
  const rawBlocksBySource = new Map(
    rawSources.map((source) => [source.relativePath || source.fileName, extractRawBlocks(source.text)]),
  );
  const formulaRecoveryGapBySource = new Map(
    rawSources.map((source) => [source.relativePath || source.fileName, getFormulaRecoveryGap(source)]),
  );

  const issues: Math6ContentIssue[] = [];
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
  let missingExplanation = 0;
  let missingWorkedSolution = 0;
  let missingTrapOrMisconception = 0;
  let missingThinkingGuide = 0;
  let hardItemsWithoutThinkingGuide = 0;
  let reviewMarkersInsidePrompt = 0;
  let scoredPracticeExcluded = 0;
  let scoredPracticePending = 0;
  const scoredPracticeReadyItemIds: string[] = [];

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
    const imageReview = imageStatus === 'needs_original_image'
      && !hasGeneratedFigure
      && !recoveredFigureAsset
      && !hasTextResolvedImageDependency(prompt);
    const controlCharacters = CONTROL_OR_REPLACEMENT_RE.test(prompt);
    const encodingReview = controlCharacters || LEGACY_FONT_RE.test(prompt) || MOJIBAKE_RE.test(prompt);
    const pedagogy = inspectPedagogyReadiness(item);

    if (hasGeneratedFigure) generatedFigures += 1;
    if (formulaReview) {
      needsFormulaReview += 1;
      missingFormulaAssets += missingFormulaAssetFiles;
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

    const displayReady = !formulaReview && !imageReview && !encodingReview;
    if (displayReady) {
      displayReadyItemIds.push(item.id);
    }

    const exclusion = displayReady && !pedagogy.isReady ? getScoredPracticeExclusion(item, rawBlock) : undefined;
    if (!exclusion) {
      if (!pedagogy.hasCorrectAnswer) missingCorrectAnswer += 1;
      if (!pedagogy.hasExplanation) missingExplanation += 1;
      if (!pedagogy.hasWorkedSolution) missingWorkedSolution += 1;
      if (!pedagogy.hasTrapOrMisconception) missingTrapOrMisconception += 1;
      if (!pedagogy.hasThinkingGuide) missingThinkingGuide += 1;
      if (item.difficulty === 'hard' && !pedagogy.hasThinkingGuide) hardItemsWithoutThinkingGuide += 1;
      if (pedagogy.reviewMarkerInsidePrompt) reviewMarkersInsidePrompt += 1;
    }

    const isScoredPracticeReady = displayReady && pedagogy.isReady;
    if (isScoredPracticeReady) {
      scoredPracticeReadyItemIds.push(item.id);
    } else if (exclusion) {
      scoredPracticeExcluded += 1;
      issues.push({
        code: `pedagogy.scored_practice_excluded.${exclusion.code}`,
        severity: 'warning',
        message: exclusion.message,
        path: `questions[${index}]`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'pedagogy',
      });
    } else if (displayReady && !pedagogy.isReady) {
      scoredPracticePending += 1;
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

  const report: Math6ContentGuardReport = {
    schemaVersion: 'math6_content_guard_v1',
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
      missingFormulaAssets,
      sourcesWithFormulaRecoveryGap: sourceRecoveryGaps.length,
      formulaRecoveryGapMarkers: sourceRecoveryGaps.reduce((sum, count) => sum + count, 0),
      promptControlCharacters,
      rawSourcesWithOleMarkers,
      rawOleMarkersTotal,
    },
    pedagogy: {
      scoredPracticeReady: scoredPracticeReadyItemIds.length,
      scoredPracticeExcluded,
      scoredPracticePending,
      missingCorrectAnswer,
      missingExplanation,
      missingWorkedSolution,
      missingTrapOrMisconception,
      missingThinkingGuide,
      hardItemsWithoutThinkingGuide,
      reviewMarkersInsidePrompt,
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
  const asksStudentToFillOrCompute = /\b(?:thuc hien phep tinh|tinh hop ly|dien dau|dien)\b/.test(text)
    || /\.{3,}|…/.test(prompt);
  if (asksStudentToFillOrCompute) return false;

  const hasBlankVerbOrConjunction = /(?:^|[^a-z0-9\u00c0-\u1ef9])(?:bi\u1ebft|b\u1eb1ng|l\u00e0)\s+(?:v\u00e0|;|,|\.)(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower)
    || (/\b(?:biet|bang|la)\s+(?:va|;|,|\.)\b/.test(text) && !/(?:^|[^a-z0-9\u00c0-\u1ef9])(?:l\u00e1|la)\s+v\u00e0(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower));

  return /\b[a-d]\)\s*\b[b-e]\)/.test(text)
    || (/=\s*(?:[.;,)]|$)/.test(text) && !/\b(?:tinh|thuc hien|tim x|rut gon)\b/.test(text))
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

function hasTextResolvedImageDependency(prompt: string): boolean {
  const text = normalizeSearchText(prompt);
  if (/\bcon duong\s+a1\b.*\bb1\b.*\bc1\b/.test(text)) return true;
  return /\bbang\s+o\s+gom\s+2007\s+o\b/.test(text)
    && /\bo\s+1\s+trong\b/.test(text)
    && /\bo\s+2\s*=\s*17\b/.test(text)
    && /\bo\s+4\s*=\s*36\b/.test(text)
    && /\bo\s+7\s*=\s*19\b/.test(text);
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

function countMissingFormulaAssetFiles(item: QuestionItem, options: BuildMath6ContentGuardReportOptions): number {
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

function getRawOleMarkerCount(source: Math6RawSource): number {
  return typeof source.rawOleMarkerCount === 'number' ? source.rawOleMarkerCount : countMatches(source.text, /\u0001/g);
}

function getFormulaRecoveryGap(source: Math6RawSource): number {
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

function getScoredPracticeExclusion(item: QuestionItem, rawBlock?: RawBlock): ScoredPracticeExclusion | undefined {
  const prompt = String(item.prompt || '');
  const promptText = normalizeSearchText(prompt).replace(/\s+/g, ' ').trim();
  const rawText = normalizeSearchText(rawBlock?.cleaned || rawBlock?.raw || '').replace(/\s+/g, ' ').trim();
  const searchable = `${promptText} ${rawText}`.trim();

  if (isAssessmentMatrixBlock(searchable)) {
    return {
      code: 'assessment_matrix',
      message: 'Imported block is an assessment matrix or exam metadata, not a standalone scored practice question.',
    };
  }

  if (isSourceMetaOnlyBlock(promptText)) {
    return {
      code: 'source_metadata',
      message: 'Imported block is source metadata such as duration or exam heading, not a scored practice question.',
    };
  }

  if (isTruncatedScoredPrompt(promptText)) {
    return {
      code: 'truncated_source',
      message: 'Imported prompt appears truncated or missing a condition from the source file, so an answer key would be unreliable.',
    };
  }

  if (isSgkReferenceBlock(promptText)) {
    return {
      code: 'sgk_reference_only',
      message: 'Imported block only references SGK exercise numbers and does not contain the actual question text.',
    };
  }

  if (isInstructionalNoteBlock(promptText) || isSourceSolutionFragment(promptText) || isAnswerKeyOrObjectiveFragment(promptText)) {
    return {
      code: 'instructional_note',
      message: 'Imported block is an explanatory note or solving strategy, not a question requiring a scored answer.',
    };
  }

  if (isMalformedEquationOrLayoutPrompt(promptText)) {
    return {
      code: 'source_artifact',
      message: 'Imported prompt has broken equation/table layout, so it must be cleaned before scored practice.',
    };
  }

  if (isContradictoryGeometryPrompt(promptText) || isAmbiguousGeometryPrompt(promptText)) {
    return {
      code: 'contradictory_source',
      message: 'Imported geometry prompt is contradictory or underdetermined; a scored answer would be misleading.',
    };
  }

  if (hasExamBleed(promptText)) {
    return {
      code: 'block_bleed',
      message: 'Imported block includes content from a following exam section, so it needs source cleanup before scored practice.',
    };
  }

  if (isBulkExerciseList(promptText) || isDensePowerExpressionPrompt(promptText)) {
    return {
      code: 'bulk_exercise_list',
      message: 'Imported block contains many sub-exercises or lost exponent formatting; split/transcribe it before scored practice.',
    };
  }

  if (isIncompleteWordProblem(promptText) || isIncompleteGeometryPrompt(item, promptText)) {
    return {
      code: 'incomplete_prompt',
      message: 'Imported prompt has setup text but no complete scored question, so an answer key would be speculative.',
    };
  }

  if (isConstructionOnlyPrompt(promptText)) {
    return {
      code: 'construction_only',
      message: 'Construction-only geometry prompt is suitable for review/drawing practice, not automatic scored practice.',
    };
  }

  if (isOpenEndedAdvancedPrimePrompt(promptText)) {
    return {
      code: 'open_ended_advanced',
      message: 'Advanced prime-number prompt is open-ended or source-ambiguous and needs manual curation before scoring.',
    };
  }

  if (requiresExternalFigureForAnswer(item, promptText)) {
    return {
      code: 'external_figure',
      message: 'Question depends on an original figure or multiple-choice image that has not been converted into a scored answer key.',
    };
  }

  if (hasUntranscribedFormulaImage(item, prompt)) {
    return {
      code: 'formula_image_untranscribed',
      message: 'Question uses recovered formula image(s) but has no machine-readable answer key yet; keep it for review, not scored practice.',
    };
  }

  return undefined;
}

function isAssessmentMatrixBlock(text: string): boolean {
  return (text.includes('so diem') && text.includes('ti le'))
    || text.includes('tong so diem')
    || text.includes('ma tran')
    || (text.includes('de khao sat') && text.includes('trac nghiem') && text.includes('tu luan'));
}

function isSourceMetaOnlyBlock(text: string): boolean {
  return /^bai\s*120\s*phut\b/.test(text)
    || (text.length < 120 && text.includes('thoi gian') && text.includes('lam bai'))
    || (text.length < 120 && text.includes('khong ke thoi gian') && text.includes('chep de'));
}

function isTruncatedScoredPrompt(text: string): boolean {
  if (/\b(?:chia|khong chia|chia het|de|bang|biet|neu|la|so|ban|dau|sao cho)\s*$/i.test(text)) return true;
  if (/\b(?:tim|thay|dien|chung minh|cmr)\b.{0,120}\b(?:chia|chia het)\s*$/i.test(text)) return true;
  if (/\btim hai chu so.*\bso sau:\s*\d+[a-z]\s*$/i.test(text)) return true;
  if (/\/\s*chia\s*$/i.test(text)) return true;
  return /\b(?:a\)|b\)|c\)|d\))\s*$/i.test(text) && /\b(?:tim|tinh|chung minh|so sanh)\b/.test(text);
}

function isSgkReferenceBlock(text: string): boolean {
  return /^bai tap\b/.test(text)
    && /\bsgk\b/.test(text)
    && !/\b(?:tinh|tim|chung minh|so sanh|ve|hoi)\b/.test(text.replace(/\bsgk\b.*$/i, ''));
}

function isInstructionalNoteBlock(text: string): boolean {
  return /\bta di phan tich cac tong\b/.test(text)
    || /\bso tu nhien n duoc viet duoi dang mot so tong quat\b/.test(text)
    || /\bde cm 2 so nguyen to cung nhau\b/.test(text)
    || /\bchi ra no co so luong uoc le\b/.test(text);
}

function isSourceSolutionFragment(text: string): boolean {
  return /^(?:boi|do do|vay|suy ra)\b/.test(text)
    || (text.startsWith('bai 1 ta co 2100') && text.includes('ba chu so tan cung'))
    || /\bdo do\b.{0,80}\bkhong phai la so chinh phuong\b/.test(text)
    || /\bvay co\b.{0,80}\bthoa man de bai\b/.test(text);
}

function isAnswerKeyOrObjectiveFragment(text: string): boolean {
  return /\bphat bieu duoc\b/.test(text)
    || /\btinh duoc\b.{0,80}\bcac bai tap dang\b/.test(text)
    || /^\bbai tap\s*\d+:\s*\(a,\s*b\)\s*=/.test(text)
    || /\[a;\s*b\]\s*=\s*\d+.*\(\d+;\s*\d+\).*\(\d+;\s*\d+\)/.test(text);
}

function isMalformedEquationOrLayoutPrompt(text: string): boolean {
  return /\ba\)\s*b\)/.test(text)
    || /\/\s*chia\s+het\b/.test(text)
    || /\bc,,\b/.test(text)
    || /\b3\/2\s*x\s*\(4\/5\s*-\s*x\s*=\s*2\/3\)/.test(text)
    || /\bocc\b/.test(text)
    || /\bgoc bang ao\b/.test(text)
    || /\bdien so vao o trong\b.*\ba\s*\+\s*b\b.*\ba\s*:\s*b\b/.test(text)
    || (text.includes('cho a = a + b') && text.includes('a + b = b + c'));
}

function isContradictoryGeometryPrompt(text: string): boolean {
  return (text.includes('d la trung diem cua doan thang ac') && text.includes('chung to a la trung diem cua doan thang db'))
    || (text.includes('ac = 2cm') && text.includes('bc = 4cm') && text.includes('chung to ac = bc'))
    || (text.includes('tren tia doi cua tia mn') && text.includes('np = 2cm') && text.includes('n co la trung diem cua doan mp'))
    || (text.includes('goi m la trung diem cua ab') && text.includes('m co la trung diem cua doan thang cd'));
}

function isAmbiguousGeometryPrompt(text: string): boolean {
  return text.includes('hai duong thang u va v cat nhau tai diem i')
    && text.includes('diem c nam giua hai diem a va b')
    && text.includes('duong thang v co cat cac doan thang ad, ab, bc');
}

function hasExamBleed(text: string): boolean {
  return /\bde so\s*\d+\b/.test(text)
    || /\bde thi\s*\d+\b/.test(text)
    || /\bii\.\s*tu luan\b/.test(text)
    || /\bi\.\s*trac nghiem\b/.test(text)
    || /\bi\/\s*ly thuyet\b/.test(text)
    || /\bii\/\s*bai tap\b/.test(text)
    || (text.includes('thoi gian lam bai') && /\b(?:cau|bai)\s*\d+/.test(text));
}

function isBulkExerciseList(text: string): boolean {
  const hasBulkCue = /\b(?:thuc hien phep tinh|tim x|tim so tu nhien x|tinh gia tri|don gian bieu thuc|thu gon bieu thuc|viet ket qua|so sanh|tinh hop ly)\b/.test(text);
  if (!hasBulkCue) return false;
  const operatorCount = countMatches(text, /[+=:(){}[\].]| - | \+ /g);
  const subpartCount = countMatches(text, /\b[a-f]\)/g);
  return (text.length > 420 && operatorCount >= 14)
    || operatorCount >= 24
    || subpartCount >= 5
    || (text.length > 160 && /^bai\s*\d+:\s*so sanh\b/.test(text))
    || (text.includes('thuc hien phep tinh') && countMatches(text, /\b\d{2,}\s*[:.]\s*\d{1,2}\b/g) >= 2)
    || text.length > 900;
}

function isDensePowerExpressionPrompt(text: string): boolean {
  const densePowerLike = countMatches(text, /\b\d{2,}\s+\d+\b/g) >= 4
    || countMatches(text, /[\ud835][\udc00-\udfff]/g) >= 2
    || /\b\d{5,}\b/.test(text);
  const hasPowerCue = /\b(?:luy thua|chu so tan cung|tinh|tim ba chu so|chung minh)\b/.test(text);
  return densePowerLike && hasPowerCue;
}

function isIncompleteWordProblem(text: string): boolean {
  return /^bai\s*\d+\.?\s*mot\b/.test(text)
    && text.length < 120
    && !/\b(?:hoi|tinh|tim|chung minh|so sanh)\b/.test(text);
}

function isIncompleteGeometryPrompt(item: QuestionItem, text: string): boolean {
  const sourceFile = normalizeSearchText(String(item.metadata?.sourceFile || ''));
  if (sourceFile.includes('trung diem doan thang')
    && text.includes('oa = 2cm')
    && text.includes('ob = 5cm')
    && text.includes('oc = 8cm')) return true;
  if (item.metadata?.generatedFigure) return false;
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('geometry')) return false;
  const hasGeometrySetup = /\b(?:tren tia|cho doan thang|cho duong thang|lay diem|oa\s*=|ab\s*=|oc\s*=)\b/.test(text);
  const hasQuestionVerb = /\b(?:tinh|hoi|chung to|chung minh|cmr|so sanh|co la|vi sao|ve)\b/.test(text);
  return hasGeometrySetup && !hasQuestionVerb;
}

function isConstructionOnlyPrompt(text: string): boolean {
  return /^bai\s*\d+:\s*ve\b/.test(text)
    && !/\b(?:tinh|hoi|chung to|chung minh|cmr|so sanh|vi sao)\b/.test(text);
}

function isOpenEndedAdvancedPrimePrompt(text: string): boolean {
  return /\btim so nguyen to p\b/.test(text)
    && countMatches(text, /\bp\s*\+\s*\d+/g) >= 4;
}

function requiresExternalFigureForAnswer(item: QuestionItem, text: string): boolean {
  if (/\bcho hinh ve\b/.test(text) || /\bcho truc so\b/.test(text)) return true;
  if (item.metadata?.generatedFigure) return false;
  return /\bcho hinh ve\b/.test(text)
    || /\bhinh\s*\d+\b/.test(text)
    || /\btruc so\b/.test(text)
    || /\bkhoanh tron vao cau dung\b/.test(text);
}

function hasUntranscribedFormulaImage(item: QuestionItem, prompt: string): boolean {
  const formulaAssets = item.metadata?.formulaAssets;
  const formulaAssetCount = Array.isArray(formulaAssets) ? formulaAssets.length : 0;
  return formulaAssetCount > 0 || FORMULA_TOKEN_INLINE_RE.test(prompt);
}

function inspectPedagogyReadiness(item: QuestionItem): PedagogyReadiness {
  const explanation = explanationText(item.explanation);
  const searchText = normalizeSearchText(`${item.prompt || ''}\n${explanation}`);
  const acceptedAnswers = (item as { acceptedAnswers?: unknown[][] }).acceptedAnswers;
  const hasAcceptedAnswer = Array.isArray(acceptedAnswers) && acceptedAnswers.some((group) => Array.isArray(group) && group.some(hasScorableAnswer));
  const hasCorrectAnswer = hasScorableAnswer(item.correctAnswer) || hasAcceptedAnswer;
  const hasExplanation = explanation.trim().length >= 24;
  const hasWorkedSolution = hasExplanation && WORKED_SOLUTION_RE.test(searchText);
  const hasTrapOrMisconception = Boolean(item.misconceptionIds?.length) || (hasExplanation && TRAP_GUIDE_RE.test(searchText));
  const hasThinkingGuide = hasExplanation && THINKING_GUIDE_RE.test(searchText);
  const reviewMarkerInsidePrompt = REVIEW_MARKER_RE.test(normalizeSearchText(item.prompt || ''));
  const missing = [
    hasCorrectAnswer ? '' : 'correct answer',
    hasExplanation ? '' : 'explanation',
    hasWorkedSolution ? '' : 'worked solution',
    hasTrapOrMisconception ? '' : 'trap or misconception guidance',
    hasThinkingGuide ? '' : 'thinking/observation guide',
  ].filter(Boolean);

  return {
    hasCorrectAnswer,
    hasExplanation,
    hasWorkedSolution,
    hasTrapOrMisconception,
    hasThinkingGuide,
    reviewMarkerInsidePrompt,
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
  return `Question is not ready for scored Math 6 practice; missing ${pedagogy.missing.join(', ')}.`;
}

function summarizeIssues(questionCount: number, issues: Math6ContentIssue[]): Math6ContentGuardReport['qualitySummary'] {
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
const LEGACY_FONT_RE = /[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]/;
const FORMULA_TOKEN_INLINE_RE = /\{\{formula:[^}]+\}\}/;
const WORKED_SOLUTION_RE = /\b(?:giai|loi giai|dap an|buoc|ta co|suy ra|tinh duoc|chung minh|solution|step)\b/;
const TRAP_GUIDE_RE = /\b(?:bay|trap|sai lam|nham|luu y|can tranh|misconception|distractor)\b/;
const THINKING_GUIDE_RE = /\b(?:quan sat|tu duy|cach lam|huong dan|method|chien luoc|dat an|ve hinh|phan tich|xet)\b/;
const REVIEW_MARKER_RE = /\b(?:dap an|huong dan|loi giai|bai giai)\b/;
