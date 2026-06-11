import {
  getExam10ReviewClusterForSource,
  getExam10ReviewClustersForTopic,
  MATH9_LEARNING_MATRIX,
  type Math9Pattern,
  type Math9TopicPlan,
} from './math9-plan';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math9RawSource {
  fileName: string;
  relativePath?: string;
  path?: string;
  extension?: string;
  text: string;
  fullText?: string;
  richExtraction?: boolean;
  formulaAssetCount?: number;
  formulaAssets?: Math9FormulaAsset[];
  assetBasePath?: string;
  inlineShapeCount?: number;
  exportedInlineShapes?: number;
  rawOleMarkerCount?: number;
  error?: string;
}

export interface Math9FormulaAsset {
  src: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  fileName?: string;
  copied?: boolean;
  source?: string;
}

export interface Math9ExtractedBlock {
  id: string;
  prompt: string;
  sourceSolution?: string;
  sourceAnswer?: string;
  sourceFile: string;
  sourcePath?: string;
  topicId: string;
  patternId: string;
  level: MathLearningLevel;
  confidence: number;
}

export interface Math9ImportIssue {
  code: string;
  severity: 'warning' | 'blocker';
  message: string;
  sourceFile?: string;
  topicId?: string;
}

export interface Math9ImportReport {
  schemaVersion: 'math9_import_v1';
  generatedAt: string;
  inputSources: number;
  mappedSources: number;
  unmappedSources: string[];
  extractedBlocks: number;
  convertedItems: number;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  issues: Math9ImportIssue[];
}

interface TopicMatch {
  topic: Math9TopicPlan;
  confidence: number;
}

interface Math9PromptFormulaAsset {
  src: string;
  width?: number;
  height?: number;
  alt: string;
}

interface PositionedExerciseBlock {
  raw: string;
  cleaned: string;
  start: number;
  end: number;
}

const EXERCISE_HEADER_PATTERN = /(?:^|[\r\n\f]|[^\p{L}])\s*((?:(?:B[\p{L}\u00a0]{0,3}i|C[\p{L}\u00a0]{0,3}u)(?:\s+t[\p{L}\u00a0]{0,3}p)?\s*(?:\d+|[IVXLC]+(?=\s*(?:[:.)-]|\[|\d|$)))|V[\p{L}\u00a0]{0,3}\s*d[\p{L}\u00a0]{0,3}\s*\d+|B[\p{L}\u00a0]{0,3}i\s*to[\p{L}\u00a0]{0,3}n\s*\d+)[A-Za-z\u00c0-\u1ef90-9\s]*[:.)-]?)/giu;
const FORMULA_TOKEN_RE = /\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g;
const PROMPT_MATCH_STOP_WORDS = new Set([
  'bai',
  'cau',
  'tap',
  'cho',
  'tinh',
  'tim',
  'giai',
  'chung',
  'minh',
  'rang',
  'biet',
  'neu',
  'hay',
  'voi',
  'cac',
  'mot',
  'hai',
  'duoc',
  'theo',
  'sau',
  'tren',
  'trong',
  'bang',
  'tam',
  'giac',
]);

export function buildMath9QuestionItemsFromRawSources(rawSources: Math9RawSource[]): { items: QuestionItem[]; blocks: Math9ExtractedBlock[]; report: Math9ImportReport } {
  const issues: Math9ImportIssue[] = [];
  const blocks: Math9ExtractedBlock[] = [];
  const unmappedSources: string[] = [];
  let mappedSources = 0;

  rawSources.forEach((source) => {
    if (source.error) {
      issues.push({
        code: 'source.extract_error',
        severity: 'warning',
        message: source.error,
        sourceFile: source.relativePath || source.fileName,
      });
      return;
    }

    const topicMatch = matchMath9TopicForSource(source);
    const sourceBlocks = extractMath9ExerciseBlocksForSource(source);
    if (!sourceBlocks.length) {
      if (topicMatch) {
        issues.push({
          code: 'source.no_exercise_blocks',
          severity: 'warning',
          message: 'No exercise blocks were detected in this source.',
          sourceFile: source.relativePath || source.fileName,
          topicId: topicMatch.topic.id,
        });
      } else {
        unmappedSources.push(source.relativePath || source.fileName);
      }
      return;
    }

    let mappedBlockCount = 0;
    sourceBlocks.forEach((rawPrompt, index) => {
      const splitBlock = splitPromptAndSolution(rawPrompt);
      const prompt = splitBlock.prompt;
      if (!isUsefulExerciseBlock(prompt)) return;
      const promptTopicMatch = inferTopicForExercise(prompt, source);
      const resolvedTopicMatch = chooseTopicMatch(promptTopicMatch, topicMatch);
      if (!resolvedTopicMatch) return;

      mappedBlockCount += 1;
      const pattern = inferPattern(resolvedTopicMatch.topic, prompt);
      const sourceAnswer = splitBlock.solution ? (extractShortAnswer(splitBlock.solution) || compactSourceSolution(splitBlock.solution)) : undefined;
      blocks.push({
        id: buildBlockId(resolvedTopicMatch.topic.id, source.relativePath || source.fileName, index + 1),
        prompt,
        sourceSolution: splitBlock.solution,
        sourceAnswer,
        sourceFile: source.relativePath || source.fileName,
        sourcePath: source.path,
        topicId: resolvedTopicMatch.topic.id,
        patternId: pattern.id,
        level: pattern.level,
        confidence: resolvedTopicMatch.confidence,
      });
    });

    if (mappedBlockCount > 0) {
      mappedSources += 1;
    } else {
      unmappedSources.push(source.relativePath || source.fileName);
    }

    if (mappedBlockCount > 0 && mappedBlockCount < sourceBlocks.length) {
      issues.push({
        code: 'source.unmapped_blocks',
        severity: 'warning',
        message: `${sourceBlocks.length - mappedBlockCount} exercise blocks were not mapped to a topic.`,
        sourceFile: source.relativePath || source.fileName,
        topicId: topicMatch?.topic.id,
      });
    }
  });

  const items = blocks.map((block): QuestionItem => {
    const topic = MATH9_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const formulaAssets = extractFormulaAssets(block.prompt);
    const exam10Cluster = getExam10ReviewClusterForSource(block.sourceFile)
      || (topic?.examTarget.includes('exam10') && normalizePath(block.sourceFile).includes('on vao 10')
        ? getExam10ReviewClustersForTopic(block.topicId)[0]
        : undefined);
    const examTarget = topic?.examTarget || [];
    return {
      id: `math9.${block.id}`,
      sourceId: block.id,
      source: 'math9_local_source',
      domainId: 'mathematics',
      programIds: topic?.programIds || ['vn_math_9', 'vn_math_vao_10', 'vn_math_thcs'],
      conceptIds: pattern?.conceptIds?.length ? pattern.conceptIds : topic?.conceptIds || ['math.algebraic_expression'],
      skillIds: pattern?.skillIds?.length ? pattern.skillIds : topic?.skillIds || ['math.simplify_expression'],
      misconceptionIds: [],
      type: 'open_response',
      prompt: block.prompt,
      correctAnswer: block.sourceAnswer || null,
      explanation: buildMath9Explanation(topic, pattern, block),
      difficulty: difficultyForLevel(block.level),
      cognitiveLevel: pattern?.cognitiveLevel || (block.level === 'foundation' ? 'understand' : block.level === 'core' ? 'apply' : 'analyze'),
      tags: uniqueStrings([
        'math9',
        topic?.strand || '',
        topic?.unit || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`,
        ...examTarget.map((target) => `exam:${target}`),
        exam10Cluster ? 'exam10' : '',
        exam10Cluster ? `exam10:${exam10Cluster.id}` : '',
        exam10Cluster ? `exam10-stage:${exam10Cluster.stage}` : '',
        exam10Cluster ? `score:${exam10Cluster.scoreBand}` : '',
        formulaAssets.length ? 'formula:recovered_asset' : '',
      ]),
      metadata: {
        grade: 9,
        semester: topic?.semester,
        strand: topic?.strand,
        unit: topic?.unit,
        topicId: block.topicId,
        patternId: block.patternId,
        level: block.level,
        examTarget,
        sourceFile: block.sourceFile,
        sourcePath: block.sourcePath || '',
        importConfidence: block.confidence,
        formulaAssets,
        formulaAssetCount: formulaAssets.length,
        formulaStatus: formulaAssets.length ? 'recovered_asset' : 'none',
        solutionStatus: block.sourceSolution ? 'source_solution' : 'missing_source_solution',
        guidedSolutionStatus: block.sourceSolution ? 'verified_source_solution' : 'generated_miumath_guidance',
        scoringReadiness: block.sourceSolution ? 'scored_practice_candidate' : 'guided_practice_only',
        sourceAnswer: block.sourceAnswer || '',
        exam10: exam10Cluster ? {
          clusterId: exam10Cluster.id,
          clusterTitle: exam10Cluster.title,
          stage: exam10Cluster.stage,
          scoreBand: exam10Cluster.scoreBand,
          sourceRole: 'new_local_source',
          matrixSourceRole: exam10Cluster.sourceRole,
          topicIds: exam10Cluster.topicIds,
          legacyMiuMathCategories: exam10Cluster.legacyMiuMathCategories,
        } : undefined,
      },
    };
  });

  return {
    items,
    blocks,
    report: buildReport(rawSources, mappedSources, unmappedSources, blocks, items, issues),
  };
}

export function extractMath9ExerciseBlocks(text: string): string[] {
  const normalized = normalizeExtractedText(text);
  const pairedSections = extractPairedSolutionExerciseBlocks(normalized);
  if (pairedSections.length) return pairedSections;

  const sectionSplit = splitSourceSolutionSection(normalized);
  if (sectionSplit) {
    const questionBlocks = extractExerciseBlocksFromText(sectionSplit.questionText);
    const solutionBlocks = extractExerciseBlocksFromText(sectionSplit.solutionText);
    if (questionBlocks.length && solutionBlocks.length >= Math.ceil(questionBlocks.length * 0.5)) {
      return questionBlocks.map((question, index) => {
        const solution = solutionBlocks[index];
        return solution ? `${question}\n\nLoi giai nguon:\n${solution}` : question;
      });
    }
  }

  return extractExerciseBlocksFromText(normalized);
}

function extractMath9ExerciseBlocksForSource(source: Math9RawSource): string[] {
  const primaryBlocks = extractMath9ExerciseBlocks(source.text);
  const fullText = String(source.fullText || '');
  if (!primaryBlocks.length || fullText.length < 160 || fullText === source.text) return primaryBlocks;

  const fullTextBlocks = extractMath9ExerciseBlocks(fullText);
  if (!fullTextBlocks.length) return primaryBlocks;

  return recoverMissingSourceSolutions(primaryBlocks, fullTextBlocks);
}

interface SolutionCandidate {
  index: number;
  prompt: string;
  normalizedPrompt: string;
  tokens: Set<string>;
  solution: string;
}

function recoverMissingSourceSolutions(primaryBlocks: string[], fullTextBlocks: string[]): string[] {
  const candidates = fullTextBlocks
    .map((block, index): SolutionCandidate | undefined => {
      const split = splitPromptAndSolution(block);
      if (!split.solution || split.solution.length < 32 || !isUsefulExerciseBlock(split.prompt)) return undefined;
      const normalizedPrompt = normalizePromptSearchText(stripExerciseLabel(split.prompt));
      if (normalizedPrompt.length < 24) return undefined;
      return {
        index,
        prompt: split.prompt,
        normalizedPrompt,
        tokens: buildPromptTokenSet(normalizedPrompt),
        solution: split.solution,
      };
    })
    .filter((candidate): candidate is SolutionCandidate => Boolean(candidate));

  if (!candidates.length) return primaryBlocks;

  const usedCandidateIndexes = new Set<number>();
  return primaryBlocks.map((block) => {
    const split = splitPromptAndSolution(block);
    if (split.solution) return block;

    const normalizedPrompt = normalizePromptSearchText(stripExerciseLabel(split.prompt));
    if (normalizedPrompt.length < 24) return block;
    const tokens = buildPromptTokenSet(normalizedPrompt);
    const match = findBestSolutionCandidate(normalizedPrompt, tokens, candidates, usedCandidateIndexes);
    if (!match) return block;

    usedCandidateIndexes.add(match.index);
    return `${normalizePrompt(block)}\n\nLoi giai nguon:\n${match.solution}`;
  });
}

function findBestSolutionCandidate(
  normalizedPrompt: string,
  tokens: Set<string>,
  candidates: SolutionCandidate[],
  usedCandidateIndexes: Set<number>,
): SolutionCandidate | undefined {
  let best: { candidate: SolutionCandidate; score: number } | undefined;
  candidates.forEach((candidate) => {
    if (usedCandidateIndexes.has(candidate.index)) return;
    const score = promptMatchScore(normalizedPrompt, tokens, candidate);
    if (score < 0.72) return;
    if (!best || score > best.score) best = { candidate, score };
  });
  return best?.candidate;
}

function promptMatchScore(normalizedPrompt: string, tokens: Set<string>, candidate: SolutionCandidate): number {
  const shorter = normalizedPrompt.length <= candidate.normalizedPrompt.length ? normalizedPrompt : candidate.normalizedPrompt;
  const longer = normalizedPrompt.length > candidate.normalizedPrompt.length ? normalizedPrompt : candidate.normalizedPrompt;
  if (shorter.length >= 48 && longer.includes(shorter.slice(0, Math.min(shorter.length, 220)))) return 0.96;

  const shared = countSharedTokens(tokens, candidate.tokens);
  const tokenScore = shared / Math.max(1, Math.min(tokens.size, candidate.tokens.size));
  const prefixScore = commonPrefixLength(normalizedPrompt, candidate.normalizedPrompt) / Math.max(48, Math.min(normalizedPrompt.length, candidate.normalizedPrompt.length));
  return Math.max(tokenScore, prefixScore);
}

function buildPromptTokenSet(value: string): Set<string> {
  return new Set(
    value
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !PROMPT_MATCH_STOP_WORDS.has(token)),
  );
}

function countSharedTokens(left: Set<string>, right: Set<string>): number {
  let shared = 0;
  left.forEach((token) => {
    if (right.has(token)) shared += 1;
  });
  return shared;
}

function commonPrefixLength(left: string, right: string): number {
  const limit = Math.min(left.length, right.length);
  let index = 0;
  while (index < limit && left[index] === right[index]) index += 1;
  return index;
}

function stripExerciseLabel(prompt: string): string {
  return String(prompt || '').replace(/^\s*(?:bai|cau|vi\s+du|bai\s+toan)\s*(?:tap\s*)?(?:\d+|[ivxlc]+)?\s*[:.)-]?\s*/iu, '');
}

function extractExerciseBlocksFromText(text: string): string[] {
  return extractExerciseBlocksWithPosition(text).map((block) => block.cleaned);
}

function extractExerciseBlocksWithPosition(text: string): PositionedExerciseBlock[] {
  const matches = [...text.matchAll(EXERCISE_HEADER_PATTERN)];
  if (!matches.length) return [];

  const blocks: PositionedExerciseBlock[] = [];
  matches.forEach((match, index) => {
    const start = getExerciseHeaderStart(match);
    const next = matches[index + 1] ? getExerciseHeaderStart(matches[index + 1]) : text.length;
    const raw = text.slice(start, next);
    const cleaned = normalizePrompt(raw);
    if (isUsefulExerciseBlock(cleaned)) {
      blocks.push({ raw, cleaned, start, end: next });
    }
  });

  return blocks;
}

function extractPairedSolutionExerciseBlocks(text: string): string[] {
  const sections = findPairedSolutionSections(text);
  if (!sections.length) return [];

  const entries: PositionedExerciseBlock[] = [];
  const handledRanges: Array<{ start: number; end: number }> = [];
  sections.forEach((section) => {
    const questionText = text.slice(section.questionStart, section.solutionStart);
    const solutionText = text.slice(section.solutionStart, section.solutionEnd);
    const questionBlocks = extractExerciseBlocksWithPosition(questionText);
    const solutionBlocks = extractExerciseBlocksWithPosition(solutionText);
    const solutionBlocksByLabel = new Map(
      solutionBlocks
        .map((solution) => [extractExerciseLabel(solution.cleaned), solution] as const)
        .filter(([label]) => Boolean(label)),
    );
    const answerKeysByLabel = extractAnswerKeyByExerciseLabel(solutionText);
    if (!isReliableSolutionPair(questionBlocks, solutionBlocksByLabel, answerKeysByLabel)) return;

    handledRanges.push({ start: section.questionStart, end: section.solutionEnd });
    questionBlocks.forEach((question) => {
      const label = extractExerciseLabel(question.cleaned);
      const solution = label ? solutionBlocksByLabel.get(label) : undefined;
      const answerKey = label ? answerKeysByLabel.get(label) : undefined;
      const fallbackSolution = !solution && answerKey ? `Dap an nguon: Chon ${answerKey}.` : '';
      const cleaned = solution || fallbackSolution
        ? `${question.cleaned}\n\nLoi giai nguon:\n${solution?.cleaned || fallbackSolution}`
        : question.cleaned;
      entries.push({
        raw: cleaned,
        cleaned,
        start: section.questionStart + question.start,
        end: section.questionStart + question.end,
      });
    });
  });

  if (!entries.length) return [];

  extractExerciseBlocksWithPosition(text)
    .filter((block) => !handledRanges.some((range) => block.start >= range.start && block.start < range.end))
    .forEach((block) => entries.push(block));

  return entries
    .sort((a, b) => a.start - b.start)
    .map((entry) => entry.cleaned);
}

function findPairedSolutionSections(text: string): Array<{ questionStart: number; solutionStart: number; solutionEnd: number }> {
  const rangeSections = findRangeSolutionSections(text);
  const primaryMarkers = findPrimarySolutionSectionIndexes(text);
  if (!primaryMarkers.length) return rangeSections;

  const sections: Array<{ questionStart: number; solutionStart: number; solutionEnd: number }> = [...rangeSections];
  let cursor = 0;
  primaryMarkers.forEach((solutionStart) => {
    if (rangeSections.some((section) => solutionStart >= section.questionStart && solutionStart < section.solutionEnd)) return;
    if (solutionStart < cursor + 120) return;

    const nextQuestionStart = findNextQuestionSectionStart(text, solutionStart + 24);
    const solutionEnd = nextQuestionStart && nextQuestionStart > solutionStart ? nextQuestionStart : text.length;
    const questionStart = cursor;
    if (solutionEnd - solutionStart >= 120 && solutionStart - questionStart >= 120) {
      sections.push({ questionStart, solutionStart, solutionEnd });
      cursor = solutionEnd;
    }
  });

  return sections;
}

function findRangeSolutionSections(text: string): Array<{ questionStart: number; solutionStart: number; solutionEnd: number }> {
  const normalized = normalizeSearchText(text);
  const questionRangeRe = /\bde\s+bai\s+tu\s+bai\s+(\d+)\s+den\s+bai\s+(\d+)\b/g;
  const answerRangeRe = /\bdap\s+an\s+tu\s+bai\s+(\d+)\s+den\s+bai\s+(\d+)\b/g;
  const questionRanges = [...normalized.matchAll(questionRangeRe)].map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length,
    from: Number(match[1]),
    to: Number(match[2]),
  }));
  const answerRanges = [...normalized.matchAll(answerRangeRe)].map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length,
    from: Number(match[1]),
    to: Number(match[2]),
  }));
  if (!questionRanges.length || !answerRanges.length) return [];

  const sections: Array<{ questionStart: number; solutionStart: number; solutionEnd: number }> = [];
  questionRanges.forEach((questionRange, index) => {
    const answerRange = answerRanges.find((candidate) => (
      candidate.start > questionRange.start
      && candidate.from === questionRange.from
      && candidate.to === questionRange.to
    ));
    if (!answerRange) return;
    const nextQuestionRange = questionRanges
      .filter((candidate) => candidate.start > answerRange.start)
      .sort((a, b) => a.start - b.start)[0];
    const fallbackEnd = nextQuestionRange?.start || questionRanges[index + 1]?.start || text.length;
    const solutionEnd = Math.max(answerRange.end, fallbackEnd);
    if (answerRange.start - questionRange.end < 80 || solutionEnd - answerRange.end < 80) return;
    sections.push({
      questionStart: questionRange.end,
      solutionStart: answerRange.start,
      solutionEnd,
    });
  });

  return sections.sort((a, b) => a.questionStart - b.questionStart);
}

function findPrimarySolutionSectionIndexes(text: string): number[] {
  const normalized = normalizeSearchText(text);
  const markerRe = /\b(?:dap an chi tiet|dap an tham khao|loi giai tham khao|huong dan giai|huong dan cham|tom tat loi giai)\b/g;
  const indexes = [...normalized.matchAll(markerRe)]
    .map((match) => (match.index || 0) + match[0].search(/(?:dap|loi|huong|tom)/))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);

  return indexes.filter((index, position) => position === 0 || index - indexes[position - 1] > 260);
}

function findNextQuestionSectionStart(text: string, startIndex: number): number | undefined {
  const normalized = normalizeSearchText(text.slice(startIndex));
  const markerRe = /(?:^|\n)\s*(?:de\s*(?:so\s*)?\d+|de\s+[ab]\b|de\s+kiem\s+tra|ma\s+de|phong\s+giao|so\s+giao|ubnd|truong\s+thcs|bai\s+i\b|i\.\s*phan\s+trac\s+nghiem|a\.\s*trac\s+nghiem)/g;
  const match = markerRe.exec(normalized);
  return match ? startIndex + (match.index || 0) + match[0].search(/\S/) : undefined;
}

function isReliableSolutionPair(
  questionBlocks: PositionedExerciseBlock[],
  solutionBlocksByLabel: Map<string, PositionedExerciseBlock>,
  answerKeysByLabel: Map<string, string>,
): boolean {
  if (questionBlocks.length < 2) return false;
  const matched = questionBlocks.filter((question) => {
    const label = extractExerciseLabel(question.cleaned);
    return label && (solutionBlocksByLabel.has(label) || answerKeysByLabel.has(label));
  }).length;
  if (matched >= Math.max(2, Math.ceil(questionBlocks.length * 0.5))) return true;
  return questionBlocks.length <= 4 && matched >= 1;
}

function extractAnswerKeyByExerciseLabel(solutionText: string): Map<string, string> {
  const result = new Map<string, string>();
  const text = normalizeAnswerKeyText(solutionText);
  const tableRe = /(?:\bcau\s+)?((?:\d+\s+){3,}\d)\s+(?:dap an\s+|ket qua\s+)?((?:[a-d]\s+){3,}[a-d])(?=\s+(?:cau|phan|ii|iii|bai|loi|huong|$))/g;
  for (const match of text.matchAll(tableRe)) {
    const numbers = (match[1] || '').trim().split(/\s+/).filter(Boolean);
    const answers = (match[2] || '').trim().split(/\s+/).filter((token) => /^[a-d]$/.test(token));
    if (numbers.length < 4 || numbers.length !== answers.length) continue;
    numbers.forEach((number, index) => {
      result.set(`cau:${number}`, answers[index].toUpperCase());
    });
  }
  return result;
}

function extractExerciseLabel(block: string): string {
  const normalized = normalizeSearchText(block);
  const match = normalized.match(/^(bai|cau)(?:\s+tap)?\s*([0-9]+|[ivxlc]+)\b/);
  if (!match) return '';
  const rawNumber = match[2] || '';
  const number = /^\d+$/.test(rawNumber) ? String(Number(rawNumber)) : rawNumber;
  return `${match[1]}:${number}`;
}

function normalizeAnswerKeyText(value: string): string {
  return String(value || '')
    .normalize('NFKD')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
    .replace(/\{\{formula:[^}]+\}\}/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizePromptSearchText(value: string): string {
  return normalizeAnswerKeyText(String(value || '').replace(/\{\{formula:[^}]+\}\}/g, ' '));
}

function getExerciseHeaderStart(match: RegExpMatchArray): number {
  const fullMatch = match[0] || '';
  const header = match[1] || '';
  const offset = header ? fullMatch.indexOf(header) : 0;
  return (match.index || 0) + Math.max(0, offset);
}

export function matchMath9TopicForSource(source: Math9RawSource): TopicMatch | undefined {
  const relativePath = normalizePath(source.relativePath || source.fileName);
  const basename = normalizePath(source.fileName);

  for (const topic of MATH9_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((file) => normalizePath(file.fileName) === relativePath || normalizePath(file.fileName).endsWith(`/${basename}`))) {
      return { topic, confidence: 1 };
    }
  }

  const inferred = inferTopicFromFileName(relativePath || basename);
  return inferred ? { topic: inferred, confidence: inferTopicConfidenceFromFileName(relativePath || basename) } : undefined;
}

function buildReport(
  rawSources: Math9RawSource[],
  mappedSources: number,
  unmappedSources: string[],
  blocks: Math9ExtractedBlock[],
  items: QuestionItem[],
  issues: Math9ImportIssue[],
): Math9ImportReport {
  return {
    schemaVersion: 'math9_import_v1',
    generatedAt: new Date().toISOString(),
    inputSources: rawSources.length,
    mappedSources,
    unmappedSources,
    extractedBlocks: blocks.length,
    convertedItems: items.length,
    byTopic: countBy(blocks, (block) => block.topicId),
    byLevel: countBy(blocks, (block) => block.level),
    bySource: countBy(blocks, (block) => block.sourceFile),
    issues,
  };
}

function inferPattern(topic: Math9TopicPlan, prompt: string): Math9Pattern {
  const normalizedPrompt = normalizePromptSearchText(prompt);
  const scored = topic.patterns.map((pattern) => {
    const searchable = normalizePromptSearchText(`${pattern.title} ${pattern.tags.join(' ')}`);
    const score = searchable
      .split(/\s+/)
      .filter((token) => token.length >= 3 && normalizedPrompt.includes(token)).length;
    return { pattern, score };
  });
  scored.sort((a, b) => b.score - a.score || levelRank(a.pattern.level) - levelRank(b.pattern.level));
  return scored[0]?.pattern || topic.patterns[0];
}

function inferTopicFromFileName(value: string): Math9TopicPlan | undefined {
  const text = normalizeSearchText(value).replace(/[^a-z0-9]+/g, ' ');
  if (text.includes('can bac') || text.includes('can thuc')) {
    if (text.includes('phuong trinh') || text.includes('vo ti') || text.includes('vo ty')) return find('math9.algebra.radical_equations');
    if (text.includes('rut gon') || text.includes('bien doi') || text.includes('bieu thuc')) return find('math9.algebra.radicals_transform');
    return find('math9.algebra.radicals_domain');
  }
  if (text.includes('phuong trinh vo ti') || text.includes('phuong trinh vo ty') || text.includes('phuong trinh chua can')) return find('math9.algebra.radical_equations');
  if (text.includes('he phuong trinh') || text.includes('lap hpt') || text.includes('hai phuong trinh bac nhat hai an')) return find('math9.algebra.systems');
  if (text.includes('giai bai toan bang cach lap') || text.includes('toan thuc te')) return find('math9.algebra.word_problem_systems');
  if (text.includes('ham so') || text.includes('do thi') || text.includes('parabol') || text.includes('tuong giao') || text.includes('y ax2')) return find('math9.algebra.functions_linear_quadratic');
  if (text.includes('phuong trinh bac hai') || text.includes('viete') || text.includes('delta')) return find('math9.algebra.quadratic_equations');
  if (text.includes('phuong trinh va bat phuong trinh') || text.includes('bat phuong trinh')) return find('math9.algebra.linear_equations_inequalities');
  if (text.includes('he thuc luong') || text.includes('ti so luong giac') || text.includes('tam giac vuong')) return find('math9.geometry.right_triangle_trig');
  if (text.includes('tu giac noi tiep') || text.includes('tiep tuyen') || text.includes('cat tuyen') || text.includes('duong tron noi tiep') || text.includes('duong tron ngoai tiep')) return find('math9.geometry.cyclic_tangent_secant');
  if (text.includes('goc voi duong tron') || text.includes('duong tron')) return find('math9.geometry.circle_angles');
  if (text.includes('hinh hoc phang') || text.includes('dong quy') || text.includes('diem co dinh') || text.includes('dinh ly hinh hoc')) return find('math9.geometry.proof_synthesis');
  if (text.includes('hinh khoi') || text.includes('hinh tru') || text.includes('hinh non') || text.includes('hinh cau') || text.includes('dien tich phan to dam')) return find('math9.geometry.solid_geometry');
  if (text.includes('tan so') || text.includes('thong ke') || text.includes('bieu do')) return find('math9.statistics_probability.statistics');
  if (text.includes('xac suat') || text.includes('bien co')) return find('math9.statistics_probability.probability');
  if (text.includes('bat dang thuc') || text.includes('cuc tri') || text.includes('cosi') || text.includes('bdt')) return find('math9.advanced.inequality_extrema');
  if (text.includes('nghiem nguyen') || text.includes('so nguyen to') || text.includes('so chinh phuong') || text.includes('dirichle')) return find('math9.advanced.number_theory');
  if (text.includes('vao lop 10') || text.includes('tuyen sinh 10') || text.includes('de thi') || text.includes('tong on') || text.includes('on thi')) return find('math9.assessment.exam10_synthesis');
  return undefined;
}

function inferTopicConfidenceFromFileName(value: string): number {
  const text = normalizeSearchText(value).replace(/[^a-z0-9]+/g, ' ');
  if (
    text.includes('nghiem nguyen')
    || text.includes('bat dang thuc')
    || text.includes('cuc tri')
    || text.includes('hinh hoc')
    || text.includes('can bac')
    || text.includes('can thuc')
    || text.includes('he phuong trinh')
    || text.includes('ham so')
    || text.includes('parabol')
    || text.includes('duong tron')
    || text.includes('xac suat')
    || text.includes('thong ke')
  ) {
    return 0.9;
  }
  if (text.includes('chuyen de') || text.includes('on vao 10')) return 0.84;
  return 0.72;
}

function inferTopicForExercise(prompt: string, _source: Math9RawSource): TopicMatch | undefined {
  const text = normalizePromptSearchText(prompt);

  if (text.includes('can bac') || text.includes('can thuc') || text.includes('sqrt') || /\bcan\s+[a-z0-9]/.test(text)) {
    if (text.includes('phuong trinh') || text.includes('giai phuong trinh')) {
      return topicMatch('math9.algebra.radical_equations', 0.92);
    }
    if (text.includes('rut gon') || text.includes('bien doi') || text.includes('truc can') || text.includes('khu mau') || text.includes('bieu thuc')) {
      return topicMatch('math9.algebra.radicals_transform', 0.9);
    }
    return topicMatch('math9.algebra.radicals_domain', 0.86);
  }
  if (text.includes('phuong trinh vo ti') || text.includes('phuong trinh vo ty') || text.includes('phuong trinh chua can')) {
    return topicMatch('math9.algebra.radical_equations', 0.92);
  }
  if (text.includes('he phuong trinh') || text.includes('cap nghiem') || text.includes('phuong trinh bac nhat hai an') || /\btim\s+x\s+y\b/.test(text)) {
    return topicMatch('math9.algebra.systems', 0.9);
  }
  if (text.includes('giai bai toan bang cach lap') || text.includes('lap phuong trinh') || text.includes('lap he phuong trinh') || text.includes('toan thuc te')) {
    return topicMatch('math9.algebra.word_problem_systems', 0.9);
  }
  if (text.includes('ham so') || text.includes('do thi') || text.includes('parabol') || text.includes('tuong giao') || text.includes('giao diem')) {
    return topicMatch('math9.algebra.functions_linear_quadratic', 0.88);
  }
  if (text.includes('phuong trinh bac hai') || text.includes('delta') || text.includes('viete')) {
    return topicMatch('math9.algebra.quadratic_equations', 0.9);
  }
  if (text.includes('bat phuong trinh') || text.includes('tap nghiem') || text.includes('bieu dien nghiem')) {
    return topicMatch('math9.algebra.linear_equations_inequalities', 0.84);
  }
  if (text.includes('he thuc luong') || text.includes('ti so luong giac') || /\b(?:sin|cos|tan|cot)\b/.test(text) || text.includes('tam giac vuong')) {
    return topicMatch('math9.geometry.right_triangle_trig', 0.9);
  }
  if (text.includes('tu giac noi tiep') || text.includes('tiep tuyen') || text.includes('cat tuyen')) {
    return topicMatch('math9.geometry.cyclic_tangent_secant', 0.9);
  }
  if (text.includes('duong tron') || text.includes('goc noi tiep') || text.includes('cung') || text.includes('day')) {
    return topicMatch('math9.geometry.circle_angles', 0.86);
  }
  if (text.includes('dong quy') || text.includes('thang hang') || text.includes('diem co dinh') || text.includes('chung minh')) {
    return topicMatch('math9.geometry.proof_synthesis', 0.78);
  }
  if (text.includes('hinh tru') || text.includes('hinh non') || text.includes('hinh cau') || text.includes('the tich') || text.includes('dien tich xung quanh')) {
    return topicMatch('math9.geometry.solid_geometry', 0.9);
  }
  if (text.includes('tan so') || text.includes('thong ke') || text.includes('bieu do')) {
    return topicMatch('math9.statistics_probability.statistics', 0.88);
  }
  if (text.includes('xac suat') || text.includes('bien co') || text.includes('khong gian mau')) {
    return topicMatch('math9.statistics_probability.probability', 0.9);
  }
  if (text.includes('bat dang thuc') || text.includes('cuc tri') || text.includes('gia tri nho nhat') || text.includes('gia tri lon nhat')) {
    return topicMatch('math9.advanced.inequality_extrema', 0.88);
  }
  if (text.includes('nghiem nguyen') || text.includes('so nguyen to') || text.includes('so chinh phuong') || text.includes('chia het') || text.includes('dong du')) {
    return topicMatch('math9.advanced.number_theory', 0.88);
  }
  return undefined;
}

function topicMatch(id: string, confidence: number): TopicMatch | undefined {
  const topic = find(id);
  return topic ? { topic, confidence } : undefined;
}

function find(id: string): Math9TopicPlan | undefined {
  return MATH9_LEARNING_MATRIX.find((topic) => topic.id === id);
}

function splitSourceSolutionSection(text: string): { questionText: string; solutionText: string } | undefined {
  if (text.length >= 3000) return undefined;

  const minSectionIndex = text.length >= 3000 ? text.length * 0.35 : 120;
  const candidateIndexes = findSourceSolutionSectionIndexes(text)
    .filter((index) => index >= minSectionIndex);
  const boundedIndexes = text.length >= 3000 ? candidateIndexes.slice(-12) : candidateIndexes;

  for (const sectionIndex of boundedIndexes) {
    if (sectionIndex < 120) continue;

    const questionText = text.slice(0, sectionIndex).replace(/(?:[-_=]{3,}\s*)+$/u, '');
    const solutionText = text.slice(sectionIndex);
    const questionBlocks = extractExerciseBlocksFromText(questionText);
    const solutionBlocks = extractExerciseBlocksFromText(solutionText);
    if (questionBlocks.length < 2 || !solutionBlocks.length) continue;
    if (text.length >= 3000 && solutionBlocks.length < Math.ceil(questionBlocks.length * 0.45)) continue;
    return { questionText, solutionText };
  }

  return undefined;
}

function chooseTopicMatch(promptMatch: TopicMatch | undefined, sourceMatch: TopicMatch | undefined): TopicMatch | undefined {
  if (!promptMatch) return sourceMatch;
  if (!sourceMatch) return promptMatch;
  if (promptMatch.topic.id === sourceMatch.topic.id) return promptMatch;
  if (promptMatch.confidence >= 0.88 && sourceMatch.confidence < 0.88) return promptMatch;
  return sourceMatch;
}

function findSourceSolutionSectionIndexes(text: string): number[] {
  const normalized = normalizeSearchText(text);
  const sectionRe = text.length >= 3000
    ? /(?:^|\n)\s*(?:[-_=]{2,}\s*)?(?:(?:loi giai tham khao|huong dan giai|huong dan cham)\s*(?:[:.\n-]|$)|dap an\s*(?:\n|$))/g
    : /(?:^|\n)\s*(?:[-_=]{2,}\s*)?(?:loi giai tham khao|huong dan giai|huong dan cham|dap an|dap so)\s*(?:[:.\n-]|$)/g;
  return [...normalized.matchAll(sectionRe)]
    .map((match) => (match.index || 0) + match[0].search(/(?:loi|huong|dap)/))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);
}

function splitPromptAndSolution(block: string): { prompt: string; solution?: string } {
  const normalized = normalizeSearchText(block);
  const markerPattern = /\b(?:loi giai nguon|loi giai tham khao|loi giai|huong dan giai|huong dan cham|huong dan|dap an|dap so)\b\s*:?\s*|\bgiai\s*(?=[:.]|\{\{formula:|ap dung|ta co|dieu kien|xet|vi\b)/g;
  const indexes = [...normalized.matchAll(markerPattern)]
    .map((match) => match.index ?? -1)
    .filter((index) => index >= 24)
    .sort((a, b) => a - b);
  const splitIndex = indexes[0];
  const inlineSplit = splitInlineWorkedSolution(block);
  if (typeof splitIndex !== 'number') return inlineSplit || { prompt: block };

  const prompt = normalizePrompt(block.slice(0, splitIndex));
  const solution = normalizePrompt(block.slice(splitIndex));
  const markerText = normalized.slice(splitIndex, splitIndex + 32);
  if (
    inlineSplit
    && /^dap so\b/.test(markerText)
    && inlineSplit.prompt.length + 24 < prompt.length
  ) {
    return inlineSplit;
  }
  return solution.length >= 12 ? { prompt, solution } : { prompt: block };
}

function splitInlineWorkedSolution(block: string): { prompt: string; solution?: string } | undefined {
  const text = normalizePrompt(block);
  const normalized = normalizeSearchText(text);
  if (!/^(?:vi du|bai|cau)\s*\d*/.test(normalized)) return undefined;

  const cuePattern = /\b(?:ta thay|ta co|bien doi|gia su|dat\s+[a-z]|ap dung|xet|vi\s+|do do|suy ra|de y|du doan|dechung minh|dua ve|tu do)\b/g;
  const indexes = [...normalized.matchAll(cuePattern)]
    .map((match) => match.index ?? -1)
    .filter((index) => index >= 48)
    .sort((a, b) => a - b);
  const splitIndex = indexes[0];
  if (typeof splitIndex !== 'number') return undefined;

  const prompt = normalizePrompt(text.slice(0, splitIndex));
  const solution = trimInlineSolutionTail(normalizePrompt(text.slice(splitIndex)));
  const promptSearch = normalizePromptSearchText(prompt);
  const hasProblemVerb = /\b(?:tim|tinh|giai|chung minh|cho|so sanh)\b/.test(promptSearch);
  if (!hasProblemVerb || prompt.length < 32 || solution.length < 60) return undefined;
  return { prompt, solution };
}

function trimInlineSolutionTail(solution: string): string {
  const normalized = normalizeSearchText(solution);
  const tailPattern = /\b(?:bai tap|[a-z]\s+phuong phap|[a-z]\s+bai tap|chuong\s+\d+|dang\s+\d+)\b/g;
  const splitIndex = [...normalized.matchAll(tailPattern)]
    .map((match) => match.index ?? -1)
    .filter((index) => index >= 80)
    .sort((a, b) => a - b)[0];
  if (typeof splitIndex !== 'number') return solution;
  const trimmed = normalizePrompt(solution.slice(0, splitIndex));
  return trimmed.length >= 60 ? trimmed : solution;
}

function extractShortAnswer(solution: string): string | undefined {
  const text = normalizePrompt(solution);
  const searchText = normalizeSearchText(text);
  const preferred = ['dap an', 'dap so', 'ket qua', 'vay', 'do do', 'suy ra'];
  const answerStart = preferred
    .map((marker) => searchText.lastIndexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => b - a)[0];
  const answer = typeof answerStart === 'number'
    ? normalizePrompt(text.slice(answerStart, answerStart + 320))
    : '';
  if (answer.length >= 8) return answer.slice(0, 320);
  return undefined;
}

function compactSourceSolution(solution: string): string | undefined {
  const text = normalizePrompt(solution);
  if (text.length < 8) return undefined;
  return text.slice(0, 420);
}

function buildMath9Explanation(topic: Math9TopicPlan | undefined, pattern: Math9Pattern | undefined, block: Math9ExtractedBlock): Record<string, unknown> {
  const topicId = topic?.id || block.topicId;
  const patternId = pattern?.id || block.patternId;
  const level = pattern?.level || block.level;
  const recognition = buildRecognitionNote(topicId, patternId);
  const observation = buildObservationNote(topicId, pattern?.title || patternId, block.prompt);
  const trap = buildTrapNote(topicId, block.prompt);
  const strategy = buildStrategyNote(topicId, level);
  const checklist = buildSolutionChecklist(topicId, level);
  const sourceSolution = block.sourceSolution ? normalizePrompt(block.sourceSolution) : '';
  const isHard = block.level === 'advanced' || block.level === 'hsg' || block.level === 'exam10';
  const thinking = [
    `**1. Quan sat & Nhan dien:** ${observation}`,
    `**2. Bay/trap can tranh:** ${trap}`,
    `**3. Huong tu duy:** ${strategy}`,
    `**4. Trinh tu giai:** ${checklist}`,
  ].join('\n\n');

  return {
    source: 'math9_local_source',
    sourceSolutionStatus: sourceSolution ? 'source_solution' : 'missing_source_solution',
    guidedSolutionStatus: sourceSolution ? 'verified_source_solution' : 'generated_miumath_guidance',
    thinking,
    recognition,
    observation,
    trap,
    strategy,
    checklist,
    steps: buildPedagogicalSteps(sourceSolution, recognition, trap, checklist),
    answer: block.sourceAnswer || null,
    hardProblemLens: isHard ? buildHardProblemLens(topicId) : '',
    teacherNote: sourceSolution
      ? 'Da co loi giai nguon; khi day nen yeu cau hoc sinh noi duoc dau hieu nhan dien truoc khi xem phep bien doi.'
      : 'Chua tach duoc loi giai nguon; chi dung bai nay o che do luyen tap co huong dan cho den khi bo sung dap an kiem chung.',
  };
}

function buildPedagogicalSteps(sourceSolution: string, recognition: string, trap: string, checklist: string): string {
  if (!sourceSolution) {
    return [
      'Huong dan giai theo khung MiuMath: bai nay chua co dap an nguon da kiem chung nen chi dung o che do guided practice.',
      `Buoc 0 - Quan sat de: ${recognition}`,
      `Buoc 1 - Nhan dien cong cu: ${checklist}`,
      'Buoc 2 - Lam mau tu duy: viet dieu kien, dat an/ky hieu, chuyen ngon ngu de bai ve bieu thuc/phuong trinh/hinh ve can chung minh.',
      'Buoc 3 - Giai co kiem soat: moi phep bien doi phai ghi ly do, rieng bai hinh thi danh dau goc/cung/duong phu ngay tren hinh truoc khi suy luan.',
      `Buoc 4 - Soat trap: ${trap}`,
      'Buoc 5 - Ket luan su pham: giao vien can bo sung dap an hoac loi giai da xac minh truoc khi mo cham diem tu dong.',
    ].join('\n\n');
  }

  return [
    `Buoc 0 - Doc de va nhan dien: ${recognition}`,
    `Buoc 1 - Chon duong giai: ${checklist}`,
    'Buoc 2 - Thuc hien loi giai nguon:',
    sourceSolution,
    `Buoc 3 - Soat lai ket qua: ${trap}`,
  ].join('\n\n');
}

function buildObservationNote(topicId: string, patternTitle: string, prompt: string): string {
  const promptText = normalizePromptSearchText(prompt);
  if (topicId.includes('radicals_domain')) return 'Bai can thuc co ban: nhin so duoi dau can, can so sanh/tinh gia tri hay tim dieu kien; neu can so sanh, co the binh phuong hai ve khong am hoac lam troi.';
  if (topicId.includes('radicals_transform')) return 'Bieu thuc co can/phan thuc nen nhin mau so, nhan tu chung va dieu kien xac dinh truoc; chi rut gon sau khi da tach duoc cau truc.';
  if (topicId.includes('radical_equations')) return 'Moi dau can co the sinh dieu kien va nghiem ngoai lai; hay ghi mien xac dinh, tim phep binh phuong nao la hop ly nhat.';
  if (topicId.includes('systems')) return 'Tim hai dai luong chua biet va hai moi quan he doc lap; bang dai luong se giup tranh lap sai phuong trinh.';
  if (topicId.includes('word_problem')) return 'Doc cau hoi cuoi de biet can tim gi, sau do tach du lieu theo hang: dai luong, don vi, dieu kien, quan he.';
  if (topicId.includes('functions')) return 'Dau hieu chinh la do thi/ham so/tiep xuc/giao diem; can doi bai toan hinh anh thanh phuong trinh hoanh do giao diem.';
  if (topicId.includes('quadratic')) return 'Neu co nghiem, tham so, tong-tich nghiem hay dau nghiem thi nghi ngay den Delta va Viete; neu co suy bien phai xet a = 0 rieng.';
  if (topicId.includes('right_triangle_trig')) return 'Xac dinh tam giac vuong, goc tham chieu va canh doi-ke-huyen; dat ten canh tren hinh truoc khi thay cong thuc.';
  if (topicId.includes('circle') || topicId.includes('cyclic')) return 'Khoanh cac goc cung chan mot cung, day cung, tiep tuyen-ban kinh va tu giac noi tiep; day la cac dau hieu mo khoa bai hinh tron.';
  if (topicId.includes('proof_synthesis')) return 'Viet target can chung minh truoc: goc, do dai, ti so, dong quy hay thang hang; target se quyet dinh co can ke duong phu hay khong.';
  if (topicId.includes('solid')) return 'Nhan dung vat the tron xoay/hinh khoi, tach ban kinh-duong cao-duong sinh va doi don vi truoc khi tinh dien tich/the tich.';
  if (topicId.includes('statistics')) return 'Tim tong mau, tan so va nhom du lieu truoc; moi phep tinh trung binh/ti le deu phu thuoc mau so nay.';
  if (topicId.includes('probability')) return 'Liet ke khong gian mau va truong hop thuan loi bang bang/cay neu can; khong tinh xac suat khi chua co mau so.';
  if (topicId.includes('inequality')) return 'Tim dieu kien dau bang, nhin dang tong binh phuong/Cauchy/AM-GM/Delta; dung diem roi dau bang de chon bat dang thuc phu hop.';
  if (topicId.includes('number_theory')) return 'Thu modulo nho, chan-le, chia het, uoc chung va so chinh phuong; bai so nguyen thuong mo khoa bang rang buoc dong du.';
  if (promptText.includes('chung minh')) return 'Day la bai chung minh; can viet lai dieu can chung minh thanh target ro rang roi moi bien doi gia thiet.';
  return `Doc dang bai ${patternTitle}; gach chan du kien co dieu kien, dai luong can tim va cong cu co the dung.`;
}

function buildTrapNote(topicId: string, prompt: string): string {
  const promptText = normalizePromptSearchText(prompt);
  if (topicId.includes('radicals_domain')) return 'Khong coi can bac hai nhu phep rut gon tuy tien: so duoi can phai hop le, va khi so sanh bang binh phuong thi hai ve phai khong am.';
  if (topicId.includes('radical')) return 'Khong bo qua dieu kien xac dinh va buoc thu lai nghiem; binh phuong la phep bien doi de sinh nghiem ngoai lai.';
  if (topicId.includes('quadratic')) return 'Can xet truong hop suy bien va dieu kien Delta truoc khi dung Viete; khong duoc ap dung Viete khi chua dam bao phuong trinh bac hai co nghiem.';
  if (topicId.includes('functions')) return 'Dung do thi de dinh huong nhung ket luan phai bang phuong trinh/toa do; tranh nham tung do giao diem voi gia tri tham so.';
  if (topicId.includes('systems') || topicId.includes('word_problem')) return 'Bai loi van de sai nhat o don vi va dieu kien an; sau khi giai phai doi chieu ngu canh, khong chi doi chieu phuong trinh.';
  if (topicId.includes('circle') || topicId.includes('cyclic') || topicId.includes('proof_synthesis')) return 'Khong suy ra tinh chat chi vi hinh ve trong co ve dung; moi goc bang nhau, song song, tiep tuyen deu can co ly do.';
  if (topicId.includes('right_triangle_trig')) return 'De nham duong cao, trung tuyen ung voi canh huyen va cac ti so luong giac; moi lan dung cong thuc hay ghi ro tam giac vuong nao dang xet.';
  if (topicId.includes('solid')) return 'De nham duong kinh voi ban kinh va dien tich voi the tich; kiem tra don vi binh phuong/lap phuong o ket luan.';
  if (topicId.includes('statistics') || topicId.includes('probability')) return 'Sai thuong gap la dung sai mau so tong hoac dem trung truong hop; hay liet ke truoc khi rut gon.';
  if (topicId.includes('inequality')) return 'Dung BDT phai kiem tra dieu kien ap dung va dau bang; neu dau bang khong xay ra thi huong giai co the sai.';
  if (topicId.includes('number_theory')) return 'Dung thu so de du doan nhung khong thay the chung minh; can chung minh voi moi so nguyen thoa dieu kien.';
  if (promptText.includes('tim gia tri lon nhat') || promptText.includes('tim gia tri nho nhat')) return 'Bai cuc tri bat buoc chi ra gia tri dat duoc, khong chi chung minh mot chan tren/chan duoi.';
  return 'Hay tach ro gia thiet va ket luan; moi phep bien doi can giu tuong duong hoac ghi ro chieu suy ra.';
}

function buildSolutionChecklist(topicId: string, level: MathLearningLevel): string {
  const hardSuffix = level === 'advanced' || level === 'hsg' || level === 'exam10'
    ? ' Voi cau kho, thu them cach bien doi nguoc tu ket luan va tach truong hop bien.'
    : '';
  if (topicId.includes('radicals_domain')) return `Kiem tra dieu kien/khong am -> chon cach tinh, so sanh hoac tim mien xac dinh -> bien doi gon -> ket luan dung tap so.${hardSuffix}`;
  if (topicId.includes('radical')) return `Dat dieu kien -> bien doi/rut gon hoac binh phuong co kiem soat -> giai -> thu lai -> ket luan.${hardSuffix}`;
  if (topicId.includes('quadratic')) return `Xet dang phuong trinh -> tinh Delta/quan he Viete -> dat dieu kien nghiem -> giai dieu kien tham so -> ket luan.${hardSuffix}`;
  if (topicId.includes('functions')) return `Lap phuong trinh do thi/giao diem -> bien doi ve an hoanh do/tham so -> xu ly dieu kien tiep xuc/cat nhau -> ket luan bang ngon ngu do thi.${hardSuffix}`;
  if (topicId.includes('systems') || topicId.includes('word_problem')) return `Dat an kem don vi -> lap he/phuong trinh -> giai -> kiem tra dieu kien thuc te -> tra loi dung cau hoi.${hardSuffix}`;
  if (topicId.includes('right_triangle_trig')) return `Ve hinh -> dat ten canh/goc -> chon Pythagore, he thuc luong hoac ti so luong giac -> tinh dai luong trung gian -> ket luan co don vi.${hardSuffix}`;
  if (topicId.includes('geometry')) return `Ve hinh sach -> ghi target -> tim tam giac/tu giac/duong tron lien quan -> chung minh tung y nho -> dung y truoc cho y sau.${hardSuffix}`;
  if (topicId.includes('statistics')) return `Xac dinh mau so tong -> tinh tan so/ti le/trung binh -> doi chieu bang/bieu do -> ket luan co don vi neu co.${hardSuffix}`;
  if (topicId.includes('probability')) return `Lap khong gian mau -> dem truong hop thuan loi -> lap ti so -> rut gon -> kiem tra xac suat nam trong [0, 1].${hardSuffix}`;
  if (topicId.includes('inequality')) return `Ghi dieu kien -> du doan dau bang -> chon BDT/bien doi ve khong am -> chung minh -> chi ra dau bang/cuc tri dat duoc.${hardSuffix}`;
  if (topicId.includes('number_theory')) return `Thu modulo/chia het -> bien doi rang buoc so nguyen -> tach truong hop -> chung minh dieu kien can va du neu bai yeu cau.${hardSuffix}`;
  return `Ghi dieu kien -> chon cong cu -> giai tung buoc -> kiem tra ket qua -> ket luan.${hardSuffix}`;
}

function buildRecognitionNote(topicId: string, patternId: string): string {
  if (topicId.includes('radicals_domain')) return 'Nhan dien: can bac hai/can bac ba va dieu kien can thuc; truoc khi so sanh hay tinh toan can kiem tra so duoi can va tinh khong am.';
  if (topicId.includes('radicals_transform')) return 'Nhan dien: bieu thuc co can va phan thuc; viec dau tien la dat dieu kien, phan tich nhan tu, roi moi rut gon.';
  if (topicId.includes('radical_equations')) return 'Nhan dien: phuong trinh co can; can ghi dieu kien, binh phuong co kiem soat va thu lai nghiem trong phuong trinh goc.';
  if (topicId.includes('systems')) return 'Nhan dien: hai an hoac hai quan he tu bai toan; dat an ro don vi, sau do chon the/cong dai so/an phu.';
  if (topicId.includes('word_problem')) return 'Nhan dien: bai toan loi van; tach dai luong, don vi, dieu kien va cau hoi cuoi truoc khi lap phuong trinh.';
  if (topicId.includes('functions')) return 'Nhan dien: co do thi, parabol, duong thang hoac tuong giao; dich qua lai giua phuong trinh va giao diem.';
  if (topicId.includes('quadratic')) return 'Nhan dien: phuong trinh bac hai hoac quan he nghiem; kiem tra a khac 0, Delta va dieu kien dung Viete.';
  if (topicId.includes('right_triangle_trig')) return 'Nhan dien: tam giac vuong, duong cao hoac ti so luong giac; chon goc tham chieu roi dat ten canh.';
  if (topicId.includes('circle') || topicId.includes('cyclic')) return 'Nhan dien: cau hinh duong tron; tim cung/day/goc bi chan, tu giac noi tiep, tiep tuyen-ban kinh truoc.';
  if (topicId.includes('proof_synthesis')) return 'Nhan dien: bai hinh tong hop; viet muc tieu chung minh, liet ke dinh ly ung vien, roi moi ve duong phu.';
  if (topicId.includes('solid')) return 'Nhan dien: hinh khoi; xac dinh dang hinh, dai luong can tinh va don vi binh phuong/lap phuong.';
  if (topicId.includes('statistics')) return 'Nhan dien: bang/bieu do du lieu; khoanh mau so tong truoc khi tinh tan so, phan tram hay trung binh.';
  if (topicId.includes('probability')) return 'Nhan dien: xac suat; liet ke khong gian mau va truong hop thuan loi truoc khi lap ti so.';
  if (topicId.includes('inequality')) return 'Nhan dien: can chung minh/tim cuc tri; tim dieu kien dau bang va dua ve binh phuong khong am, Cauchy hoac Delta.';
  if (topicId.includes('number_theory')) return 'Nhan dien: so nguyen; thu chia het, modulo, chan le, uoc luong va so chinh phuong.';
  return `Nhan dien: dang bai gan voi ${patternId}; doc cau hoi cuoi de chon cong cu truoc khi tinh.`;
}

function buildStrategyNote(topicId: string, level: MathLearningLevel): string {
  const base = topicId.includes('assessment')
    ? 'Cach vao bai: phan loai cau theo chuyen de, an diem cac buoc chac truoc, roi moi xu ly cau kho.'
    : 'Cach vao bai: ghi dieu kien/gia thiet, chon cong cu chinh, lam tung buoc va doi chieu ket qua.';
  if (level === 'advanced' || level === 'hsg' || level === 'exam10') {
    return `${base} Voi bai kho, hay tim dau hieu dac biet, thu bien doi nguoc tu dieu can chung minh va tach truong hop bien.`;
  }
  return base;
}

function buildHardProblemLens(topicId: string): string {
  if (topicId.includes('geometry')) return 'Bai kho hinh hoc nen bat dau tu target: can chung minh goc, ti so, tich do dai hay dong quy. Target se goi y dung tu giac noi tiep, dong dang, tiep tuyen hoac duong phu.';
  if (topicId.includes('quadratic') || topicId.includes('functions')) return 'Bai kho dai so/do thi thuong nam o dieu kien tham so; can tach truong hop suy bien, bien doi ve Delta/Viete hoac tuong giao.';
  if (topicId.includes('radical')) return 'Bai can kho hay loi o binh phuong va dieu kien; luon thu lai nghiem va tranh bien doi mot chieu thanh tuong duong.';
  if (topicId.includes('inequality')) return 'Bai cuc tri/BDT nen tim diem roi dau bang truoc, sau do moi chon Cauchy, binh phuong khong am, Delta hoac don dieu.';
  if (topicId.includes('number_theory')) return 'Bai so hoc kho nen thu modulo nho, tinh chan le, uoc chung va dieu kien so chinh phuong truoc khi bien doi dai.';
  return 'Voi bai kho, dung 30 giay dau de phan loai dang, viet target va chon duong giai kha thi nhat.';
}

function normalizeExtractedText(text: string): string {
  return String(text || '')
    .replace(/\u0001/g, '')
    .replace(/\u0007/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

function extractFormulaAssets(prompt: string): Math9PromptFormulaAsset[] {
  const assets: Math9PromptFormulaAsset[] = [];
  for (const match of String(prompt || '').matchAll(FORMULA_TOKEN_RE)) {
    const src = match[1] || '';
    if (!src.startsWith('/assets/')) continue;
    assets.push({
      src,
      width: match[2] ? Number(match[2]) : undefined,
      height: match[3] ? Number(match[3]) : undefined,
      alt: 'Math formula',
    });
  }
  return assets;
}

function normalizePrompt(text: string): string {
  return cleanupMath9Text(decodeLegacyVietnameseText(text))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function cleanupMath9Text(text: string): string {
  return String(text || '')
    .replace(/[O0]10-2024-GV154\s*/gi, '')
    .replace(/Li[êe]n\s+h[ệe]\s+t[àa]i\s+li[ệe]u\s+word\s+to[áa]n\s+S[ĐD]T\s*\(zalo\)\s*:\s*[_0-9.\s]+/giu, '')
    .replace(/Website\s*:\s*Tailieutoan\.com\.vn/giu, '')
    .replace(/p?\s*L[\p{L}]+P\s+TO[\p{L}]+N\s+TH[\p{L}]+Y\s+D[\p{L}]+NG[^/]{0,180}Trang\s*\d+\s*\/\s*\d+/giu, '')
    .replace(/p?\s*L[\p{L}]+P\s+TO[\p{L}]+N\s+TH[\p{L}]+Y\s+D[\p{L}]+NG[^\r\n]{0,220}/giu, '')
    .replace(/PH[\p{L}]+NG\s+TR[\p{L}]+NH\s+NGHI[\p{L}]+M\s+NGUY[\p{L}]+N\s+CH[\p{L}]+N\s+L[\p{L}]+C\s*\/\s*Trang\s*\d+\s*\/\s*\d+/giu, '')
    .replace(/\(\s*soạn\s+khoảng[^)]*\)\s*:?\s*/giu, '')
    .replace(/(\{\{formula:[^\}]+\}\})\s+\/\s+(th\u00e1ng|n\u0103m)\b/giu, '$1/$2')
    .replace(/(^|[^\p{L}])V\u00e2y(?=$|[^\p{L}])/gu, '$1Vậy')
    .replace(/(^|[^\p{L}])cần trẻ(?=$|[^\p{L}])/giu, '$1cần trả');
}

function isUsefulExerciseBlock(block: string): boolean {
  if (block.length < 24) return false;
  if (block.length > 9000) return false;
  const lowered = normalizeSearchText(block);
  if (lowered.includes('dap an') && lowered.length < 120) return false;
  if (lowered.includes('huong dan giai') && lowered.length < 120) return false;
  return true;
}

function buildBlockId(topicId: string, sourceFile: string, index: number): string {
  const sourceSlug = slug(sourceFile);
  return `${slug(topicId.replace(/^math9\./, ''))}.${sourceSlug.slice(0, 40)}.${shortHash(sourceFile)}.${String(index).padStart(3, '0')}`;
}

function difficultyForLevel(level: MathLearningLevel): string {
  if (level === 'foundation') return 'easy';
  if (level === 'core' || level === 'application') return 'medium';
  return 'hard';
}

function levelRank(level: MathLearningLevel): number {
  if (level === 'foundation') return 1;
  if (level === 'core') return 2;
  if (level === 'application') return 3;
  if (level === 'advanced') return 4;
  if (level === 'hsg') return 5;
  return 6;
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = key(item) || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function normalizePath(value: string): string {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();
}

function normalizeSearchText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function slug(value: string): string {
  return normalizeSearchText(value)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function shortHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36).padStart(7, '0').slice(0, 7);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function decodeLegacyVietnameseText(value: string): string {
  const text = String(value || '');
  if (!looksLikeTcvn3Text(text)) return text;
  return text.replace(TCVN3_CHAR_RE, (char) => TCVN3_CHAR_MAP[char] || char);
}

function looksLikeTcvn3Text(value: string): boolean {
  const matches = value.match(TCVN3_SIGNAL_RE);
  return Boolean(matches && matches.length >= 2 && TCVN3_WORD_RE.test(value));
}

const TCVN3_CHAR_MAP: Record<string, string> = {
  '\u00b5': '\u00e0',
  '\u00b8': '\u00e1',
  '\u00b6': '\u1ea3',
  '\u00b7': '\u00e3',
  '\u00b9': '\u1ea1',
  '\u00a8': '\u0103',
  '\u00bb': '\u1eaf',
  '\u00be': '\u1eb1',
  '\u00bc': '\u1eb3',
  '\u00bd': '\u1eb5',
  '\u00c6': '\u1eb7',
  '\u00a9': '\u00e2',
  '\u00ca': '\u1ea5',
  '\u00c7': '\u1ea7',
  '\u00c8': '\u1ea9',
  '\u00c9': '\u1eab',
  '\u00cb': '\u1ead',
  '\u00ae': '\u0111',
  '\u00cc': '\u00e8',
  '\u00d0': '\u00e9',
  '\u00ce': '\u1ebb',
  '\u00cf': '\u1ebd',
  '\u00d1': '\u1eb9',
  '\u00aa': '\u00ea',
  '\u00d5': '\u1ebf',
  '\u00d2': '\u1ec1',
  '\u00d3': '\u1ec3',
  '\u00d4': '\u1ec5',
  '\u00d6': '\u1ec7',
  '\u00d7': '\u00ec',
  '\u00dd': '\u00ed',
  '\u00d8': '\u1ec9',
  '\u00dc': '\u0129',
  '\u00de': '\u1ecb',
  '\u00df': '\u00f2',
  '\u00e3': '\u00f3',
  '\u00e1': '\u1ecf',
  '\u00e2': '\u00f5',
  '\u00e4': '\u1ecd',
  '\u00ab': '\u00f4',
  '\u00e8': '\u1ed1',
  '\u00e5': '\u1ed3',
  '\u00e6': '\u1ed5',
  '\u00e7': '\u1ed7',
  '\u00e9': '\u1ed9',
  '\u00ac': '\u01a1',
  '\u00ed': '\u1edb',
  '\u00ea': '\u1edd',
  '\u00eb': '\u1edf',
  '\u00ec': '\u1ee1',
  '\u00ee': '\u1ee3',
  '\u00ef': '\u00f9',
  '\u00f3': '\u00fa',
  '\u00f1': '\u1ee7',
  '\u00f2': '\u0169',
  '\u00f4': '\u1ee5',
  '\u00ad': '\u01b0',
  '\u00f8': '\u1ee9',
  '\u00f5': '\u1eeb',
  '\u00f6': '\u1eed',
  '\u00f7': '\u1eef',
  '\u00f9': '\u1ef1',
  '\u00fa': '\u1ef3',
  '\u00fd': '\u00fd',
  '\u00fb': '\u1ef7',
  '\u00fc': '\u1ef9',
  '\u00fe': '\u1ef5',
  '\u00a1': '\u0102',
  '\u00a2': '\u00c2',
  '\u00a7': '\u0110',
  '\u00a3': '\u00ca',
  '\u00a4': '\u00d4',
  '\u00a5': '\u01a0',
  '\u00a6': '\u01af',
};

const TCVN3_CHAR_RE = new RegExp(`[${Object.keys(TCVN3_CHAR_MAP).join('')}]`, 'g');
const TCVN3_SIGNAL_RE = /[\u00a8\u00a9\u00aa\u00ab\u00ac\u00ad\u00ae\u00b5\u00b6\u00b8\u00b9\u00bb\u00bc\u00bd\u00be\u00c6\u00c7\u00c8\u00c9\u00ca\u00cb\u00cc\u00ce\u00cf\u00d0\u00d1\u00d2\u00d3\u00d4\u00d5\u00d6\u00d7\u00d8\u00dc\u00dd\u00de\u00df\u00e5\u00e6\u00e7\u00e8\u00e9\u00ee\u00ef\u00f1\u00f4\u00f8\u00fb\u00fc\u00fe]/g;
const TCVN3_WORD_RE = /(?:T\u00d7m|t\u00d7m|c\u00b8c|gi\u00b8|tr\u00de|nguy\u00aan|c\u00f1a|ph\u00a9n|s\u00e8|l\u00b5|kh\u00abng|v\u00b5|ch\u00f8ng|Ch\u00f8ng|s\u00b8nh|So s\u00b8nh|\u00ae\u00d3|\u00ae\u00d0|\u00ae\u00e8)/;
