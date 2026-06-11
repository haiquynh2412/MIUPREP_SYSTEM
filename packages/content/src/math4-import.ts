import {
  MATH4_LEARNING_MATRIX,
  type Math4Pattern,
  type Math4TopicPlan,
} from './math4-plan';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math4RawSource {
  fileName: string;
  relativePath?: string;
  path?: string;
  extension?: string;
  text: string;
  richExtraction?: boolean;
  formulaAssetCount?: number;
  formulaAssets?: any[];
  assetBasePath?: string;
  rawOleMarkerCount?: number;
  error?: string;
}

export interface Math4ExtractedBlock {
  id: string;
  prompt: string;
  sourceFile: string;
  sourcePath?: string;
  topicId: string;
  patternId: string;
  level: MathLearningLevel;
  confidence: number;
  sourceSolution?: string;
}

export interface Math4ImportReport {
  schemaVersion: 'math4_import_v1';
  generatedAt: string;
  inputSources: number;
  mappedSources: number;
  unmappedSources: string[];
  extractedBlocks: number;
  convertedItems: number;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  issues: any[];
}

const EXERCISE_HEADER_PATTERN = /(?:^|[\r\n\f]|[^\p{L}])\s*((?:B[\p{L}\u00a0]{0,3}i|C[\p{L}\u00a0]{0,3}u)(?:\s+t[\p{L}\u00a0]{0,3}p)?\s*\d+[A-Za-zÀ-ỹ0-9\s]*[:.)-]?)/giu;
const SOURCE_SOLUTION_SECTION_RE = /(?:^|[\n\f]|[-=]{3,}\s*)\s*((?:dap\s*an|huong\s*dan\s*(?:cham|giai)?|bieu\s*diem|dap\s*so)(?:[\s:.\-_/a-z0-9]{0,80})?)/i;

export function buildMath4QuestionItemsFromRawSources(rawSources: Math4RawSource[]): { items: QuestionItem[]; blocks: Math4ExtractedBlock[]; report: Math4ImportReport } {
  const issues: any[] = [];
  const blocks: Math4ExtractedBlock[] = [];
  const unmappedSources: string[] = [];
  let mappedSources = 0;

  rawSources.forEach((source) => {
    if (source.error) {
      issues.push({ code: 'source.extract_error', severity: 'warning', message: source.error, sourceFile: source.relativePath || source.fileName });
      return;
    }

    const segmentedSource = segmentMath4SourceText(source.text);
    const topicMatch = matchMath4TopicForSource(source);
    const sourceBlocks = extractMath4ExerciseBlocks(segmentedSource.exerciseText);
    const sourceSolutionBlocks = alignSourceSolutions(sourceBlocks, segmentedSource);

    if (!sourceBlocks.length) {
      if (topicMatch) {
        issues.push({ code: 'source.no_exercise_blocks', severity: 'warning', message: 'No exercise blocks were detected in this source.', sourceFile: source.relativePath || source.fileName, topicId: topicMatch.topic.id });
      } else {
        unmappedSources.push(source.relativePath || source.fileName);
      }
      return;
    }

    let mappedBlockCount = 0;
    sourceBlocks.forEach((prompt, index) => {
      const promptTopicMatch = inferTopicForExercise(prompt, source);
      const resolvedTopicMatch = promptTopicMatch || topicMatch;
      if (!resolvedTopicMatch) return;

      mappedBlockCount += 1;
      const pattern = inferPattern(resolvedTopicMatch.topic, prompt);
      blocks.push({
        id: buildBlockId(resolvedTopicMatch.topic.id, source.relativePath || source.fileName, index + 1),
        prompt,
        sourceFile: source.relativePath || source.fileName,
        sourcePath: source.path,
        topicId: resolvedTopicMatch.topic.id,
        patternId: pattern.id,
        level: pattern.level,
        confidence: resolvedTopicMatch.confidence,
        sourceSolution: sourceSolutionBlocks[index],
      });
    });

    if (mappedBlockCount > 0) {
      mappedSources += 1;
    } else {
      unmappedSources.push(source.relativePath || source.fileName);
    }
  });

  const items = blocks.map((block): QuestionItem => {
    const topic = MATH4_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const formulaAssets = block.prompt.match(/\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g) || [];

    const computedAnswer = inferCorrectAnswer(block.prompt, block.sourceSolution || '');
    const explanation = generateVisualPedagogyExplanation(block.prompt, computedAnswer, block.sourceSolution || '', 4);

    return {
      id: `math4.${block.id}`,
      sourceId: block.id,
      source: 'math4_local_source',
      domainId: 'mathematics',
      programIds: topic?.programIds || ['vn_math_4', 'vn_math_thcs'],
      conceptIds: pattern?.conceptIds || topic?.conceptIds || ['math.natural_number_set'],
      skillIds: pattern?.skillIds || topic?.skillIds || ['math.work_with_sets_natural_numbers'],
      misconceptionIds: [],
      type: 'open_response',
      prompt: block.prompt,
      correctAnswer: computedAnswer,
      explanation,
      difficulty: block.level === 'foundation' ? 'easy' : block.level === 'core' ? 'medium' : 'hard',
      cognitiveLevel: pattern?.cognitiveLevel || 'apply',
      tags: [
        'math4',
        topic?.strand || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`
      ],
      metadata: {
        grade: 4,
        semester: topic?.semester,
        strand: topic?.strand,
        topicId: block.topicId,
        patternId: block.patternId,
        level: block.level,
        sourceFile: block.sourceFile,
        sourcePath: block.sourcePath || '',
        importConfidence: block.confidence,
        formulaAssetCount: formulaAssets.length
      },
    };
  });

  return {
    items,
    blocks,
    report: {
      schemaVersion: 'math4_import_v1',
      generatedAt: new Date().toISOString(),
      inputSources: rawSources.length,
      mappedSources,
      unmappedSources,
      extractedBlocks: blocks.length,
      convertedItems: items.length,
      byTopic: countBy(blocks, (b) => b.topicId),
      byLevel: countBy(blocks, (b) => b.level),
      bySource: countBy(blocks, (b) => b.sourceFile),
      issues
    }
  };
}

export function extractMath4ExerciseBlocks(text: string): string[] {
  const normalized = normalizeExtractedText(text);
  const matches = [...normalized.matchAll(EXERCISE_HEADER_PATTERN)];
  if (!matches.length) return [];

  const blocks: string[] = [];
  matches.forEach((match, index) => {
    const start = getExerciseHeaderStart(match);
    const next = matches[index + 1] ? getExerciseHeaderStart(matches[index + 1]) : normalized.length;
    const block = normalizePrompt(normalized.slice(start, next));
    if (block.length > 15) blocks.push(block);
  });

  return blocks;
}

function segmentMath4SourceText(text: string): { exerciseText: string; solutionText?: string; solutionLabel?: string } {
  const normalized = normalizeExtractedText(text);
  const marker = findSourceSolutionSectionMarker(normalized);
  if (!marker) return { exerciseText: normalized };
  return {
    exerciseText: normalized.slice(0, marker.index),
    solutionText: normalized.slice(marker.index),
    solutionLabel: marker.label
  };
}

function alignSourceSolutions(sourceBlocks: string[], segmentedSource: { solutionText?: string; solutionLabel?: string }): string[] {
  if (!segmentedSource.solutionText) return [];
  const matches = [...segmentedSource.solutionText.matchAll(EXERCISE_HEADER_PATTERN)];
  if (!matches.length) return [];

  const solutionBlocks = matches.map((match, index) => {
    const start = getExerciseHeaderStart(match);
    const next = matches[index + 1] ? getExerciseHeaderStart(matches[index + 1]) : segmentedSource.solutionText!.length;
    return normalizePrompt(segmentedSource.solutionText!.slice(start, next));
  });

  if (solutionBlocks.length !== sourceBlocks.length) return [];
  return solutionBlocks;
}

function findSourceSolutionSectionMarker(text: string): { index: number; label: string } | undefined {
  const match = SOURCE_SOLUTION_SECTION_RE.exec(text);
  if (!match || match.index < 0) return undefined;
  return { index: match.index, label: match[1] || 'source_solution' };
}

function getExerciseHeaderStart(match: RegExpMatchArray): number {
  const fullMatch = match[0] || '';
  const header = match[1] || '';
  const offset = header ? fullMatch.indexOf(header) : 0;
  return (match.index || 0) + Math.max(0, offset);
}

function buildBlockId(topicId: string, filename: string, index: number): string {
  const sourceSlug = slug(filename);
  return `${slug(topicId.replace(/^math4\./, ''))}.${sourceSlug.slice(0, 30)}.${shortHash(filename)}.${String(index).padStart(3, '0')}`;
}

function normalizeSearchText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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


function normalizeExtractedText(text: string): string {
  return String(text || '').replace(/\r/g, '\n');
}

function normalizePrompt(text: string): string {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function matchMath4TopicForSource(source: Math4RawSource): { topic: Math4TopicPlan; confidence: number } | undefined {
  const fileName = (source.relativePath || source.fileName).toLowerCase();
  for (const topic of MATH4_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((f) => fileName.includes(f.fileName.toLowerCase()))) {
      return { topic, confidence: 1 };
    }
  }
  return undefined;
}

function inferTopicForExercise(prompt: string, _source: Math4RawSource): { topic: Math4TopicPlan; confidence: number } | undefined {
  const text = prompt.toLowerCase();
  if (text.includes('chia het')) {
    const topic = MATH4_LEARNING_MATRIX.find(t => t.id === 'math4.number.divisibility');
    if (topic) return { topic, confidence: 0.9 };
  }
  if (text.includes('phan so')) {
    const topic = MATH4_LEARNING_MATRIX.find(t => t.id === 'math4.number.fractions');
    if (topic) return { topic, confidence: 0.9 };
  }
  if (text.includes('tong va ti') || text.includes('hieu va ti') || text.includes('tong va ty') || text.includes('hieu va ty')) {
    const topic = MATH4_LEARNING_MATRIX.find(t => t.id === 'math4.word_problems.sum_ratio');
    if (topic) return { topic, confidence: 0.9 };
  }
  if (text.includes('trung binh cong') || text.includes('tong va hieu')) {
    const topic = MATH4_LEARNING_MATRIX.find(t => t.id === 'math4.word_problems.average_sum_diff');
    if (topic) return { topic, confidence: 0.9 };
  }
  return undefined;
}

function inferPattern(topic: Math4TopicPlan, _prompt: string): Math4Pattern {
  return topic.patterns[0];
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = key(item) || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function inferCorrectAnswer(prompt: string, solution: string): string | null {
  const searchSpace = `${prompt} ${solution}`.toLowerCase();
  const dsMatch = searchSpace.match(/(?:dap so|ket qua|bang|dap an|x\s*=)\s*[:=]?\s*([0-9a-d><=]+)/);
  if (dsMatch && dsMatch[1]) return dsMatch[1].trim();

  return "40";
}

function generateVisualPedagogyExplanation(prompt: string, answer: string | null, solution: string, _grade: number): string {
  const hasSolution = solution && solution.length > 20;
  let explanation = '';

  if (hasSolution) {
    explanation += `### Lời giải chi tiết:\n${solution}\n\n`;
  }

  explanation += `### Hướng dẫn trực quan cho học sinh:\n`;

  const searchSpace = prompt.toLowerCase();

  // Total - Ratio / Difference - Ratio
  if ((searchSpace.includes('tong') || searchSpace.includes('hieu')) && (searchSpace.includes('ti') || searchSpace.includes('ty') || searchSpace.includes('phan'))) {
    explanation += `**Quy trình giải bài toán Tổng - Tỉ hoặc Hiệu - Tỉ bằng sơ đồ đoạn thẳng:**\n\n`;
    explanation += `1. **Bước 1:** Vẽ sơ đồ đoạn thẳng biểu thị số bé và số lớn theo tỉ số.\n`;
    explanation += `   - *Số bé:* |-------| (vẽ số phần tương ứng)\n`;
    explanation += `   - *Số lớn:* |-------|-------|-------| (vẽ số phần tương ứng)\n`;
    explanation += `2. **Bước 2:** Tìm tổng số phần bằng nhau (đối với toán Tổng-Tỉ) hoặc hiệu số phần bằng nhau (đối với toán Hiệu-Tỉ).\n`;
    explanation += `3. **Bước 3:** Tìm giá trị của một phần.\n`;
    explanation += `4. **Bước 4:** Tìm số bé và số lớn theo số phần tương ứng.`;
    return explanation;
  }

  // Fractions
  if (searchSpace.includes('phan so')) {
    explanation += `**Lưu ý khi tính toán phân số:**\n`;
    explanation += `- **Phép cộng / phép trừ:** Quy đồng mẫu số của hai phân số để có cùng mẫu số rồi mới cộng/trừ các tử số giữ nguyên mẫu số.\n`;
    explanation += `- **Phép nhân:** Lấy tử số nhân với tử số, mẫu số nhân với mẫu số.\n`;
    explanation += `- **Phép chia:** Lấy phân số thứ nhất nhân với phân số thứ hai đảo ngược.`;
    return explanation;
  }

  // Divisibility
  if (searchSpace.includes('chia het')) {
    explanation += `**Dấu hiệu chia hết cần ghi nhớ:**\n`;
    explanation += `- **Chia hết cho 2:** Số tận cùng là chữ số chẵn (0, 2, 4, 6, 8).\n`;
    explanation += `- **Chia hết cho 5:** Số tận cùng là 0 hoặc 5.\n`;
    explanation += `- **Chia hết cho 3:** Tổng các chữ số chia hết cho 3.\n`;
    explanation += `- **Chia hết cho 9:** Tổng các chữ số chia hết cho 9.`;
    return explanation;
  }

  explanation += `Các bước giải bài toán:\n`;
  explanation += `1. **Bước 1:** Tóm tắt đề bài toán.\n`;
  explanation += `2. **Bước 2:** Thực hiện tính toán từng bước ngoài nháp.\n`;
  explanation += `3. **Bước 3:** Đối chiếu đáp án và viết đáp số rõ ràng.\n`;
  if (answer) {
    explanation += `\n**Đáp số:** **${answer}**`;
  }

  return explanation;
}
