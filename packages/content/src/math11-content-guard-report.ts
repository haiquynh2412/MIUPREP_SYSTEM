import { buildMath11QuestionItemsFromRawSources, type Math11RawSource } from './math11-import';
import type { QuestionItem } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type Math11ContentIssueSeverity = 'blocker' | 'warning';

export interface Math11ContentIssue {
  code: string;
  severity: Math11ContentIssueSeverity;
  message: string;
  path: string;
  questionId?: string;
  sourceFile?: string;
  topicId?: string;
  field?: string;
}

export interface Math11ContentGuardReport {
  schemaVersion: 'math11_content_guard_v1';
  generatedAt: string;
  input: {
    rawPath?: string;
    sources: number;
  };
  stats: {
    questions: number;
    displayReady: number;
    sourceSolutions: number;
    correctAnswers: number;
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
    fragmentedFormulaText: number;
    sourceNoiseInPrompt: number;
    answerKeyLeakageInPrompt: number;
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
  issues: Math11ContentIssue[];
  displayReadyItemIds: string[];
  scoredPracticeReadyItemIds: string[];
}

export interface BuildMath11ContentGuardReportOptions {
  rawPath?: string;
  generatedAt?: string;
}

export function buildMath11ContentGuardReport(
  rawSources: Math11RawSource[],
  options: BuildMath11ContentGuardReportOptions = {},
): { report: Math11ContentGuardReport; items: QuestionItem[]; displayReadyItems: QuestionItem[] } {
  const importResult = buildMath11QuestionItemsFromRawSources(rawSources);
  const adapterErrors = validateStandardContentBundle({ questions: importResult.items });

  const issues: Math11ContentIssue[] = [];
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
  const scoredPracticeReadyItemIds: string[] = [];
  let needsFormulaReview = 0;
  let needsOriginalImage = 0;
  let needsTextEncodingReview = 0;
  let fragmentedFormulaText = 0;
  let sourceNoiseInPrompt = 0;
  let answerKeyLeakageInPrompt = 0;
  let promptControlCharacters = 0;
  let generatedFigures = 0;
  let sourceSolutions = 0;
  let correctAnswers = 0;
  let scoredPracticeReady = 0;

  importResult.items.forEach((item, index) => {
    const prompt = String(item.prompt || '');
    const sourceFile = String(item.metadata?.sourceFile || '');
    const topicId = String(item.metadata?.topicId || '');
    const recoveredFigure = hasRecoveredFigureAsset(item);

    const rawOleMarkers = countMatches(prompt, /\u0001/g);
    const privateUseFormulaGlyphs = countMatches(prompt, PRIVATE_USE_FORMULA_GLYPH_RE);
    const fragmentedFormulaShape = hasFragmentedFormulaText(prompt);
    const formulaReview = rawOleMarkers > 0 || privateUseFormulaGlyphs > 0 || fragmentedFormulaShape;
    if (recoveredFigure) generatedFigures += 1;
    const imageReview = NEEDS_ORIGINAL_IMAGE_RE.test(prompt) && !recoveredFigure;
    const controlCharacters = CONTROL_OR_REPLACEMENT_RE.test(prompt);
    const encodingReview = controlCharacters || LEGACY_FONT_RE.test(prompt) || MOJIBAKE_RE.test(prompt);
    const sourceNoiseReview = SOURCE_NOISE_RE.test(prompt);
    const answerKeyLeakage = ANSWER_KEY_LEAKAGE_RE.test(prompt);
    const contentReview = sourceNoiseReview || answerKeyLeakage;
    const hasSourceSolution = String(item.metadata?.solutionStatus || '') === 'source_solution';
    const hasCorrectAnswer = Boolean(String(item.correctAnswer || item.metadata?.sourceAnswer || '').trim());

    if (hasSourceSolution) sourceSolutions += 1;
    if (hasCorrectAnswer) correctAnswers += 1;

    if (formulaReview) {
      needsFormulaReview += 1;
      if (fragmentedFormulaShape) fragmentedFormulaText += 1;
      issues.push({
        code: 'display.formula_review',
        severity: 'blocker',
        message: rawOleMarkers > 0
          ? `Question has raw OLE formula markers (${rawOleMarkers} found).`
          : fragmentedFormulaShape
            ? 'Question appears to have fragmented PDF formula text that may not render as a readable expression.'
            : `Question has private-use formula/font glyphs (${privateUseFormulaGlyphs} found).`,
        path: `questions[${index}].prompt`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'prompt',
      });
    }

    if (encodingReview) {
      needsTextEncodingReview += 1;
      if (controlCharacters) promptControlCharacters += 1;
      issues.push({
        code: controlCharacters ? 'display.control_characters' : 'display.legacy_font_encoding',
        severity: 'blocker',
        message: controlCharacters ? 'Prompt contains control characters.' : 'Prompt contains legacy font/mojibake.',
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
        message: 'Question appears to depend on an original figure/table/image that has not been captured.',
        path: `questions[${index}].prompt`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'prompt',
      });
    }

    if (contentReview) {
      if (sourceNoiseReview) sourceNoiseInPrompt += 1;
      if (answerKeyLeakage) answerKeyLeakageInPrompt += 1;
      issues.push({
        code: answerKeyLeakage ? 'display.answer_key_leakage' : 'display.source_noise',
        severity: 'blocker',
        message: answerKeyLeakage ? 'Prompt appears to contain an answer key or answer section marker.' : 'Prompt still contains source footer/header noise.',
        path: `questions[${index}].prompt`,
        questionId: item.id,
        sourceFile,
        topicId,
        field: 'prompt',
      });
    }

    if (!formulaReview && !imageReview && !encodingReview && !contentReview) {
      displayReadyItemIds.push(item.id);
      if (hasSourceSolution && hasCorrectAnswer) {
        scoredPracticeReady += 1;
        scoredPracticeReadyItemIds.push(item.id);
      }
    }
  });

  const rawSourcesWithOleMarkers = rawSources.filter((source) => getRawOleMarkerCount(source) > 0).length;
  const rawOleMarkersTotal = rawSources.reduce((sum, source) => sum + getRawOleMarkerCount(source), 0);
  const displayReadyItems = importResult.items.filter((item) => displayReadyItemIds.includes(item.id));

  const report: Math11ContentGuardReport = {
    schemaVersion: 'math11_content_guard_v1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    input: {
      rawPath: options.rawPath,
      sources: rawSources.length,
    },
    stats: {
      questions: importResult.items.length,
      displayReady: displayReadyItems.length,
      sourceSolutions,
      correctAnswers,
      scoredPracticeReady,
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
      fragmentedFormulaText,
      sourceNoiseInPrompt,
      answerKeyLeakageInPrompt,
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
    scoredPracticeReadyItemIds,
  };

  return { report, items: importResult.items, displayReadyItems };
}

function countMatches(value: string | undefined, regex: RegExp): number {
  return (String(value || '').match(regex) || []).length;
}

function hasFragmentedFormulaText(prompt: string): boolean {
  const lines = String(prompt || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 5) return false;

  let consecutive = 0;
  let maxConsecutive = 0;
  let totalShortMathLines = 0;
  for (const line of lines) {
    if (isShortMathFragmentLine(line)) {
      consecutive += 1;
      totalShortMathLines += 1;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    } else {
      consecutive = 0;
    }
  }

  return maxConsecutive >= 4 || (totalShortMathLines >= 8 && totalShortMathLines / lines.length >= 0.35);
}

function isShortMathFragmentLine(line: string): boolean {
  const text = line.trim();
  if (!text || text.length > 14) return false;
  if (/^[A-Da-d][.)]\s*\S{0,30}$/.test(text) || /^[A-Da-d]\s*\.\s*.+$/.test(text)) return false;
  if (/^[a-z]\)\s*\S{0,40}$/i.test(text)) return false;
  if (/^(?:Câu|Bài)\s*\d+/iu.test(text)) return false;
  if (/^[\p{L}\s]+$/u.test(text) && text.length > 2) return false;
  return /[0-9=+\-*/^√<>≤≥{}()[\]|]|^[a-zA-Z]$/.test(text);
}

function hasRecoveredFigureAsset(item: QuestionItem): boolean {
  const figureAsset = item.metadata?.figureAsset;
  if (figureAsset && typeof figureAsset === 'object' && 'src' in figureAsset) return true;
  const formulaAssets = item.metadata?.formulaAssets;
  if (!Array.isArray(formulaAssets)) return false;
  return formulaAssets.some((asset) => {
    if (!asset || typeof asset !== 'object') return false;
    const width = Number((asset as { width?: unknown }).width || 0);
    const height = Number((asset as { height?: unknown }).height || 0);
    return width >= 120 || height >= 120;
  });
}

function getRawOleMarkerCount(source: Math11RawSource): number {
  return typeof source.rawOleMarkerCount === 'number' ? source.rawOleMarkerCount : countMatches(source.text, /\u0001/g);
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

function summarizeIssues(questionCount: number, issues: Math11ContentIssue[]): Math11ContentGuardReport['qualitySummary'] {
  return {
    questions: questionCount,
    blockers: issues.filter((issue) => issue.severity === 'blocker').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    byCode: countBy(issues, (issue) => issue.code),
  };
}

const CONTROL_OR_REPLACEMENT_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/;
const PRIVATE_USE_FORMULA_GLYPH_RE = /[\uf000-\uf8ff]/g;
const MOJIBAKE_RE = /(?:[\u00c3\u00c4\u00c5\u00c6][\u0080-\u00bf]|\u00e1[\u00ba\u00bb])/;
const LEGACY_FONT_RE = /[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]/;
const SOURCE_NOISE_RE = /\b(?:TÀI LIỆU TOÁN HỌC|Tailieumontoan\.com|Website:\s*tailieumontoan\.com|Liên hệ tài liệu word toán|Điện thoại\s*\(Zalo\)|thuvienhoclieu\.com|Lê\s+Minh\s+Kha|GV\s+PHẠM\s+ĐÌNH\s+QUANG)\b/iu;
const ANSWER_KEY_LEAKAGE_RE = /(?:^|\n)\s*(?:[A-D]\.\s*)?ĐÁP\s+ÁN(?:\s+PHẦN\s+BÀI\s+TẬP\s+TỰ\s+LUYỆN)?\b/iu;
const NEEDS_ORIGINAL_IMAGE_RE = /\b(?:như\s+hình|hình\s+vẽ\s+(?:sau|bên|dưới\s+đây)|hình\s+minh\s+họa|hình\s+bên|xem\s+hình|trên\s+hình|cho\s+hình|dựa\s+vào\s+hình|bảng\s+sau|biểu\s+đồ\s+sau|đồ\s+thị\s+(?:sau|sau\s+đây|nào)|các\s+đồ\s+thị)\b/iu;
