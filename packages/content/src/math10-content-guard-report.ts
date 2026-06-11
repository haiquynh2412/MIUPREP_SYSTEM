import { buildMath10QuestionItemsFromRawSources, type Math10RawSource } from './math10-import';
import type { QuestionItem } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type Math10ContentIssueSeverity = 'blocker' | 'warning';

export interface Math10ContentIssue {
  code: string;
  severity: Math10ContentIssueSeverity;
  message: string;
  path: string;
  questionId?: string;
  sourceFile?: string;
  topicId?: string;
  field?: string;
}

export interface Math10ContentGuardReport {
  schemaVersion: 'math10_content_guard_v1';
  generatedAt: string;
  input: {
    rawPath?: string;
    sources: number;
  };
  stats: {
    questions: number;
    displayReady: number;
    sourceSolutions: number;
    generatedSolutions: number;
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
  issues: Math10ContentIssue[];
  displayReadyItemIds: string[];
  scoredPracticeReadyItemIds: string[];
}

export interface BuildMath10ContentGuardReportOptions {
  rawPath?: string;
  generatedAt?: string;
}

export function buildMath10ContentGuardReport(
  rawSources: Math10RawSource[],
  options: BuildMath10ContentGuardReportOptions = {},
): { report: Math10ContentGuardReport; items: QuestionItem[]; displayReadyItems: QuestionItem[] } {
  const importResult = buildMath10QuestionItemsFromRawSources(rawSources);
  const adapterErrors = validateStandardContentBundle({ questions: importResult.items });

  const issues: Math10ContentIssue[] = [];
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
  let generatedSolutions = 0;
  let correctAnswers = 0;
  let scoredPracticeReady = 0;

  importResult.items.forEach((item, index) => {
    const prompt = String(item.prompt || '');
    const promptSearch = normalizeSearchText(prompt);
    const sourceFile = String(item.metadata?.sourceFile || '');
    const topicId = String(item.metadata?.topicId || '');
    const recoveredFigure = hasRecoveredFigureAsset(item);

    const rawOleMarkers = countMatches(prompt, /\u0001/g);
    const privateUseFormulaGlyphs = countMatches(prompt, PRIVATE_USE_FORMULA_GLYPH_RE);
    const fragmentedFormulaShape = hasFragmentedFormulaText(prompt);
    const inlineFormulaCorruption = hasInlineFormulaCorruption(prompt);
    const formulaReview = rawOleMarkers > 0 || privateUseFormulaGlyphs > 0 || fragmentedFormulaShape || inlineFormulaCorruption;
    if (recoveredFigure) generatedFigures += 1;
    const imageReview = NEEDS_ORIGINAL_IMAGE_RE.test(promptSearch) && !recoveredFigure;
    const controlCharacters = CONTROL_OR_REPLACEMENT_RE.test(prompt);
    const encodingReview = controlCharacters || LEGACY_FONT_RE.test(prompt) || MOJIBAKE_RE.test(prompt);
    const sourceNoiseReview = SOURCE_NOISE_RE.test(promptSearch);
    const answerKeyLeakage = ANSWER_KEY_LEAKAGE_RE.test(promptSearch);
    const contentReview = sourceNoiseReview || answerKeyLeakage;
    const solutionStatus = String(item.metadata?.solutionStatus || '');
    const hasSourceSolution = solutionStatus === 'source_solution';
    const hasGeneratedSolution = solutionStatus === 'generated_miumath_solution';
    const hasScoredSolution = hasSourceSolution || hasGeneratedSolution;
    const hasCorrectAnswer = Boolean(String(item.correctAnswer || item.metadata?.sourceAnswer || '').trim());

    if (hasSourceSolution) sourceSolutions += 1;
    if (hasGeneratedSolution) generatedSolutions += 1;
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
            : inlineFormulaCorruption
              ? 'Question appears to have inline formula text with unbalanced delimiters or leaked fragments near answer choices.'
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
      if (hasScoredSolution && hasCorrectAnswer) {
        scoredPracticeReady += 1;
        scoredPracticeReadyItemIds.push(item.id);
      }
    }
  });

  const rawSourcesWithOleMarkers = rawSources.filter((source) => getRawOleMarkerCount(source) > 0).length;
  const rawOleMarkersTotal = rawSources.reduce((sum, source) => sum + getRawOleMarkerCount(source), 0);
  const displayReadyItems = importResult.items.filter((item) => displayReadyItemIds.includes(item.id));

  const report: Math10ContentGuardReport = {
    schemaVersion: 'math10_content_guard_v1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    input: {
      rawPath: options.rawPath,
      sources: rawSources.length,
    },
    stats: {
      questions: importResult.items.length,
      displayReady: displayReadyItems.length,
      sourceSolutions,
      generatedSolutions,
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

function hasInlineFormulaCorruption(prompt: string): boolean {
  const text = String(prompt || '').replace(/[ \t\u00a0]+/g, ' ');
  const firstChoice = text.search(/\sA\.\s/u);
  if (firstChoice > 0) {
    const stem = text.slice(0, firstChoice);
    if (countChar(stem, '{') > countChar(stem, '}')) {
      return true;
    }
  }
  return /(?:[;|]\s*[=\u2260<>\u2264\u2265]|[=\u2260<>\u2264\u2265]\s*[}\]])/u.test(text);
}

function countChar(value: string, char: string): number {
  return value.split(char).length - 1;
}

function normalizeSearchText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase();
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

function getRawOleMarkerCount(source: Math10RawSource): number {
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

function summarizeIssues(questionCount: number, issues: Math10ContentIssue[]): Math10ContentGuardReport['qualitySummary'] {
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
const SOURCE_NOISE_RE = /(?:\btai lieu toan hoc\b|\btailieumontoan(?:\W|\w){0,20}com\b|website\s*:|\blien he tai lieu word toan\b|\bdien thoai\s*\(zalo\))/iu;
const ANSWER_KEY_LEAKAGE_RE = /(?:^|\n|\s)(?:[a-d]\.\s*)?(?:dap\s+an\s+phan\s+bai\s+tap\s+tu\s+luyen|bang\s+dap\s+an)(?:\b|\s|$)/iu;
const NEEDS_ORIGINAL_IMAGE_RE = /\b(?:nhu\s+hinh|hinh\s+ve\s+(?:sau|ben|duoi\s+day)|hinh\s+minh\s+hoa|hinh\s+ben|xem\s+hinh|tren\s+hinh|cho\s+hinh|dua\s+vao\s+hinh|bang\s+sau|bieu\s+do\s+sau|do\s+thi\s+(?:sau|sau\s+day|nao)|cac\s+do\s+thi)\b/iu;
