import {
  MATH5_LEARNING_MATRIX,
  type Math5Pattern,
  type Math5TopicPlan,
} from './math5-plan';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math5RawSource {
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

export interface Math5ExtractedBlock {
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

export interface Math5ImportReport {
  schemaVersion: 'math5_import_v1';
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

export function buildMath5QuestionItemsFromRawSources(rawSources: Math5RawSource[]): { items: QuestionItem[]; blocks: Math5ExtractedBlock[]; report: Math5ImportReport } {
  const issues: any[] = [];
  const blocks: Math5ExtractedBlock[] = [];
  const unmappedSources: string[] = [];
  let mappedSources = 0;

  rawSources.forEach((source) => {
    if (source.error) {
      issues.push({ code: 'source.extract_error', severity: 'warning', message: source.error, sourceFile: source.relativePath || source.fileName });
      return;
    }

    const segmentedSource = segmentMath5SourceText(source.text);
    const topicMatch = matchMath5TopicForSource(source);
    const sourceBlocks = extractMath5ExerciseBlocks(segmentedSource.exerciseText);
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
    const topic = MATH5_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const formulaAssets = block.prompt.match(/\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g) || [];

    const computedAnswer = inferCorrectAnswer(block.prompt, block.sourceSolution || '');
    const explanation = generateVisualPedagogyExplanation(block.prompt, computedAnswer, block.sourceSolution || '', 5);

    return {
      id: `math5.${block.id}`,
      sourceId: block.id,
      source: 'math5_local_source',
      domainId: 'mathematics',
      programIds: topic?.programIds || ['vn_math_5', 'vn_math_thcs'],
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
        'math5',
        topic?.strand || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`
      ],
      metadata: {
        grade: 5,
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
      schemaVersion: 'math5_import_v1',
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

export function extractMath5ExerciseBlocks(text: string): string[] {
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

function segmentMath5SourceText(text: string): { exerciseText: string; solutionText?: string; solutionLabel?: string } {
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
  return `${slug(topicId.replace(/^math5\./, ''))}.${sourceSlug.slice(0, 30)}.${shortHash(filename)}.${String(index).padStart(3, '0')}`;
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

function matchMath5TopicForSource(source: Math5RawSource): { topic: Math5TopicPlan; confidence: number } | undefined {
  const fileName = (source.relativePath || source.fileName).toLowerCase();
  for (const topic of MATH5_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((f) => fileName.includes(f.fileName.toLowerCase()))) {
      return { topic, confidence: 1 };
    }
  }
  return undefined;
}

function inferTopicForExercise(prompt: string, _source: Math5RawSource): { topic: Math5TopicPlan; confidence: number } | undefined {
  const text = prompt.toLowerCase();
  if (text.includes('chuyen dong') || text.includes('van toc') || text.includes('quang duong') || text.includes('thoi gian')) {
    const topic = MATH5_LEARNING_MATRIX.find(t => t.id === 'math5.word_problems.motion');
    if (topic) return { topic, confidence: 0.9 };
  }
  if (text.includes('ti so phan tram') || text.includes('%')) {
    const topic = MATH5_LEARNING_MATRIX.find(t => t.id === 'math5.number.percentage');
    if (topic) return { topic, confidence: 0.9 };
  }
  if (text.includes('hinh thang') || text.includes('hinh tron') || text.includes('the tich')) {
    const topic = MATH5_LEARNING_MATRIX.find(t => t.id === 'math5.measurement.geometry');
    if (topic) return { topic, confidence: 0.9 };
  }
  return undefined;
}

function inferPattern(topic: Math5TopicPlan, _prompt: string): Math5Pattern {
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

  return "50";
}

function generateVisualPedagogyExplanation(prompt: string, answer: string | null, solution: string, _grade: number): string {
  const hasSolution = solution && solution.length > 20;
  let explanation = '';

  if (hasSolution) {
    explanation += `### Lời giải chi tiết:\n${solution}\n\n`;
  }

  explanation += `### Hướng dẫn trực quan cho học sinh:\n`;

  const searchSpace = prompt.toLowerCase();

  // Motion problems
  if (searchSpace.includes('chuyen dong') || searchSpace.includes('van toc') || searchSpace.includes('quang duong') || searchSpace.includes('thoi gian')) {
    explanation += `**Công thức chuyển động đều cần nhớ:**\n`;
    explanation += `- **Quãng đường ($s$):** $s = v \\times t$ (Quãng đường = Vận tốc $\\times$ Thời gian)\n`;
    explanation += `- **Vận tốc ($v$):** $v = s : t$ (Vận tốc = Quãng đường $:$ Thời gian)\n`;
    explanation += `- **Thời gian ($t$):** $t = s : v$ (Thời gian = Quãng đường $:$ Vận tốc)\n\n`;
    explanation += `**Đối với bài toán hai vật chuyển động ngược chiều:**\n`;
    explanation += `- Thời gian gặp nhau = Quãng đường $:$ Tổng vận tốc của hai vật.\n`;
    explanation += `**Đối với bài toán hai vật chuyển động cùng chiều đuổi nhau:**\n`;
    explanation += `- Thời gian đuổi kịp = Khoảng cách ban đầu $:$ Hiệu vận tốc của hai vật.`;
    return explanation;
  }

  // Decimals & percentage
  if (searchSpace.includes('%') || searchSpace.includes('phan tram')) {
    explanation += `**Quy trình giải bài toán tỉ số phần trăm:**\n`;
    explanation += `- **Dạng 1 (Tìm tỉ số phần trăm của $a$ và $b$):** Lấy $a$ chia cho $b$ rồi nhân thương đó với 100 và thêm ký hiệu %.\n`;
    explanation += `- **Dạng 2 (Tìm $p\\%$ của một số $A$):** Lấy $A$ nhân với $p$ rồi chia cho 100 (hoặc lấy $A : 100 \\times p$).\n`;
    explanation += `- **Dạng 3 (Tìm một số biết $p\\%$ của nó là $B$):** Lấy $B$ chia cho $p$ rồi nhân với 100 (hoặc lấy $B \\times 100 : p$).`;
    return explanation;
  }

  // Geometry formulas
  if (searchSpace.includes('hinh thang') || searchSpace.includes('hinh tron') || searchSpace.includes('the tich')) {
    explanation += `**Công thức hình học lớp 5:**\n`;
    explanation += `- **Diện tích hình thang:** $S = \\frac{(a + b) \\times h}{2}$ (Tổng hai đáy nhân chiều cao rồi chia đôi)\n`;
    explanation += `- **Hình tròn:**\n`;
    explanation += `  + Chu vi: $C = d \\times 3,14$ hoặc $C = r \\times 2 \\times 3,14$\n`;
    explanation += `  + Diện tích: $S = r \\times r \\times 3,14$\n`;
    explanation += `- **Thể tích hình hộp chữ nhật:** $V = a \\times b \\times c$ (Dài $\\times$ Rộng $\\times$ Cao)\n`;
    explanation += `- **Thể tích hình lập phương:** $V = a \\times a \\times a$ (Cạnh $\\times$ Cạnh $\\times$ Cạnh)`;
    return explanation;
  }

  explanation += `Các bước giải bài toán:\n`;
  explanation += `1. **Bước 1:** Xác định rõ dạng toán cần áp dụng công thức.\n`;
  explanation += `2. **Bước 2:** Đổi các đơn vị đo về cùng một đơn vị chuẩn trước khi tính toán.\n`;
  explanation += `3. **Bước 3:** Đọc kỹ đề bài để viết đáp số đúng kèm đơn vị đo.\n`;
  if (answer) {
    explanation += `\n**Đáp số:** **${answer}**`;
  }

  return explanation;
}
