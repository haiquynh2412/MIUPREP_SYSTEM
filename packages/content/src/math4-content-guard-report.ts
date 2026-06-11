import { buildMath4QuestionItemsFromRawSources, type Math4RawSource } from './math4-import';
import type { QuestionItem } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type Math4ContentIssueSeverity = 'blocker' | 'warning';

export interface Math4ContentIssue {
  code: string;
  severity: Math4ContentIssueSeverity;
  message: string;
  path: string;
  questionId?: string;
  sourceFile?: string;
  topicId?: string;
  field?: string;
}

export interface Math4ContentGuardReport {
  schemaVersion: 'math4_content_guard_v1';
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
  issues: Math4ContentIssue[];
  displayReadyItemIds: string[];
  scoredPracticeReadyItemIds: string[];
}

export interface BuildMath4ContentGuardReportOptions {
  rawPath?: string;
  generatedAt?: string;
}

export function buildMath4ContentGuardReport(
  rawSources: Math4RawSource[],
  options: BuildMath4ContentGuardReportOptions = {},
): { report: Math4ContentGuardReport; items: QuestionItem[]; displayReadyItems: QuestionItem[] } {
  const importResult = buildMath4QuestionItemsFromRawSources(rawSources);
  const adapterErrors = validateStandardContentBundle({ questions: importResult.items });

  const issues: Math4ContentIssue[] = [];
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

  importResult.items.forEach((item, index) => {
    const prompt = String(item.prompt || '');
    const sourceFile = String(item.metadata?.sourceFile || '');
    const topicId = String(item.metadata?.topicId || '');

    const isDisplayReady = prompt.length > 10;
    const isScoredPracticeReady = isDisplayReady && item.correctAnswer !== null && !!item.explanation;

    if (isDisplayReady) {
      displayReadyItemIds.push(item.id);
    } else {
      issues.push({
        code: 'display.too_short',
        severity: 'blocker',
        message: 'Question prompt is too short to display.',
        path: `questions[${index}].prompt`,
        questionId: item.id,
        sourceFile,
        topicId
      });
    }

    if (isScoredPracticeReady) {
      scoredPracticeReadyItemIds.push(item.id);
    } else {
      issues.push({
        code: 'pedagogy.scored_practice_not_ready',
        severity: 'warning',
        message: 'Question is missing correct answer or visual explanation.',
        path: `questions[${index}]`,
        questionId: item.id,
        sourceFile,
        topicId
      });
    }
  });

  const displayReadyItems = importResult.items.filter((item) => displayReadyItemIds.includes(item.id));

  const report: Math4ContentGuardReport = {
    schemaVersion: 'math4_content_guard_v1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    input: {
      rawPath: options.rawPath,
      sources: rawSources.length,
    },
    stats: {
      questions: importResult.items.length,
      displayReady: displayReadyItems.length,
      sourceSolutions: importResult.items.filter((item) => !!item.explanation).length,
      correctAnswers: importResult.items.filter((item) => item.correctAnswer !== null).length,
      scoredPracticeReady: scoredPracticeReadyItemIds.length,
      generatedFigures: 0,
      byProgram: countPrograms(importResult.items),
      byTopic: countBy(importResult.items, (item) => String(item.metadata?.topicId || 'unknown')),
      byLevel: countBy(importResult.items, (item) => String(item.metadata?.level || 'unknown')),
      bySource: countBy(importResult.items, (item) => String(item.metadata?.sourceFile || 'unknown')),
    },
    qualitySummary: summarizeIssues(importResult.items.length, issues),
    display: {
      needsFormulaReview: 0,
      needsOriginalImage: 0,
      needsTextEncodingReview: 0,
      promptControlCharacters: 0,
      rawSourcesWithOleMarkers: 0,
      rawOleMarkersTotal: 0,
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

function summarizeIssues(questionCount: number, issues: Math4ContentIssue[]): Math4ContentGuardReport['qualitySummary'] {
  const byCode: Record<string, number> = {};
  let blockers = 0;
  let warnings = 0;

  issues.forEach((issue) => {
    byCode[issue.code] = (byCode[issue.code] || 0) + 1;
    if (issue.severity === 'blocker') blockers += 1;
    else warnings += 1;
  });

  return {
    questions: questionCount,
    blockers,
    warnings,
    byCode,
  };
}
