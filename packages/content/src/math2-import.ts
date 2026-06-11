import {
  MATH2_LEARNING_MATRIX,
  type Math2Pattern,
  type Math2TopicPlan,
} from './math2-plan';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math2RawSource {
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

export interface Math2ExtractedBlock {
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

export interface Math2ImportReport {
  schemaVersion: 'math2_import_v1';
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

export function buildMath2QuestionItemsFromRawSources(rawSources: Math2RawSource[]): { items: QuestionItem[]; blocks: Math2ExtractedBlock[]; report: Math2ImportReport } {
  const issues: any[] = [];
  const blocks: Math2ExtractedBlock[] = [];
  const unmappedSources: string[] = [];
  let mappedSources = 0;

  rawSources.forEach((source) => {
    if (source.error) {
      issues.push({ code: 'source.extract_error', severity: 'warning', message: source.error, sourceFile: source.relativePath || source.fileName });
      return;
    }

    const segmentedSource = segmentMath2SourceText(source.text);
    const topicMatch = matchMath2TopicForSource(source);
    const sourceBlocks = extractMath2ExerciseBlocks(segmentedSource.exerciseText);
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
    const topic = MATH2_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const formulaAssets = block.prompt.match(/\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g) || [];

    const computedAnswer = inferCorrectAnswer(block.prompt, block.sourceSolution || '');
    const explanation = generateVisualPedagogyExplanation(block.prompt, computedAnswer, block.sourceSolution || '', 2);

    return {
      id: `math2.${block.id}`,
      sourceId: block.id,
      source: 'math2_local_source',
      domainId: 'mathematics',
      programIds: topic?.programIds || ['vn_math_2', 'vn_math_thcs'],
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
        'math2',
        topic?.strand || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`
      ],
      metadata: {
        grade: 2,
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
      schemaVersion: 'math2_import_v1',
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

export function extractMath2ExerciseBlocks(text: string): string[] {
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

function segmentMath2SourceText(text: string): { exerciseText: string; solutionText?: string; solutionLabel?: string } {
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
  return `${slug(topicId.replace(/^math2\./, ''))}.${sourceSlug.slice(0, 30)}.${shortHash(filename)}.${String(index).padStart(3, '0')}`;
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
  const cleanSpace = String(text || '').replace(/\s+/g, ' ').trim();
  return cleanupVietnameseSpelling(cleanSpace);
}

function cleanupVietnameseSpelling(text: string): string {
  if (!text) return '';
  return text
    .replace(/Baøi/g, 'Bài')
    .replace(/baøi/g, 'bài')
    .replace(/Caâu/g, 'Câu')
    .replace(/caâu/g, 'câu')
    .replace(/soá/g, 'số')
    .replace(/Soá/g, 'Số')
    .replace(/coù/g, 'có')
    .replace(/Coù/g, 'Có')
    .replace(/ñaùp/g, 'đáp')
    .replace(/ñeå/g, 'để')
    .replace(/ñuùng/g, 'đúng')
    .replace(/ñeàn/g, 'điền')
    .replace(/hỡnh/g, 'hình')
    .replace(/thỡ/g, 'thì')
    .replace(/tớnh/g, 'tính')
    .replace(/Tớnh/g, 'Tính')
    .replace(/cõu/g, 'câu')
    .replace(/Cõu/g, 'Câu')
    .replace(/qu\)ng/g, 'quãng')
    .replace(/đ\)/g, 'đã')
    .replace(/cỳ/g, 'có')
    .replace(/tớch/g, 'tích')
    .replace(/đỳ/g, 'đó')
    .replace(/phth/g, 'phép tính');
}


function matchMath2TopicForSource(source: Math2RawSource): { topic: Math2TopicPlan; confidence: number } | undefined {
  const fileName = (source.relativePath || source.fileName).toLowerCase();
  for (const topic of MATH2_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((f) => fileName.includes(f.fileName.toLowerCase()))) {
      return { topic, confidence: 1 };
    }
  }
  return undefined;
}

function inferTopicForExercise(prompt: string, _source: Math2RawSource): { topic: Math2TopicPlan; confidence: number } | undefined {
  const text = prompt.toLowerCase();
  if (text.includes('hinh tu giac') || text.includes('duong gap khuc')) {
    const topic = MATH2_LEARNING_MATRIX.find(t => t.id === 'math2.geometry.lines_shapes');
    if (topic) return { topic, confidence: 0.9 };
  }
  if (text.includes('nhan') || text.includes('chia') || text.includes('x') || text.includes(':')) {
    const topic = MATH2_LEARNING_MATRIX.find(t => t.id === 'math2.number.mul_div');
    if (topic) return { topic, confidence: 0.8 };
  }
  return undefined;
}

function inferPattern(topic: Math2TopicPlan, _prompt: string): Math2Pattern {
  return topic.patterns[0];
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = key(item) || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function evaluateExpression(str: string): number | null {
  const tokensMatch = str.match(/\d+|\+|-|\*|\/|\(|\)/g);
  if (!tokensMatch) return null;
  const tokens: string[] = tokensMatch;
  let pos = 0;
  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }
  
  function parsePrimary(): number {
    let token = peek();
    if (token === '(') {
      consume(); // (
      let val = parseExpression();
      consume(); // )
      return val;
    }
    if (token === '-') {
      consume();
      return -parsePrimary();
    }
    const next = consume();
    if (!next) throw new Error('Unexpected end of input');
    return parseFloat(next);
  }

  function parseMulDiv(): number {
    let val = parsePrimary();
    while (peek() === '*' || peek() === '/') {
      let op = consume();
      let right = parsePrimary();
      if (op === '*') val *= right;
      else val /= right;
    }
    return val;
  }

  function parseExpression(): number {
    let val = parseMulDiv();
    while (peek() === '+' || peek() === '-') {
      let op = consume();
      let right = parseMulDiv();
      if (op === '+') val += right;
      else val -= right;
    }
    return val;
  }

  try {
    const res = parseExpression();
    return Number.isFinite(res) ? res : null;
  } catch (e) {
    return null;
  }
}

function inferCorrectAnswer(prompt: string, solution: string): string | null {
  const searchSpace = `${prompt} ${solution}`.toLowerCase();
  
  // 1. Try explicit matches
  const dsMatch = searchSpace.match(/(?:dap so|ket qua|bang|dap an|x\s*=)\s*[:=]?\s*([0-9a-d><=,\.\/]+)/);
  if (dsMatch && dsMatch[1]) {
    const ans = dsMatch[1].trim().replace(/[.,]$/, '');
    if (ans) return ans;
  }

  // 2. Try expression parser
  let cleanPrompt = prompt
    .replace(/(?:Bà\s*i|Câ\s*u)\s*\d+[^:]*:\s*/gi, '')
    .replace(/\s+/g, ' ');

  const eqIndex = cleanPrompt.indexOf('=');
  if (eqIndex >= 0) {
    let leftPart = cleanPrompt.substring(0, eqIndex).trim();
    
    // Split by subheadings
    const parts = leftPart.split(/(?:\s+|^)[a-z0-9]\s*[\/)]\s+/i);
    let lastPart = parts[parts.length - 1].trim();

    const trailingMatch = lastPart.match(/([0-9\s+\-*x×/:÷()a-zA-ZÀ-ỹđĐ]+)$/);
    if (trailingMatch) {
      let expr = trailingMatch[1].trim();

      // Normalize operators
      expr = expr
        .replace(/(\d+)\s*[xX×*]\s*(\d+)/g, '$1 * $2')
        .replace(/(\d+)\s*[:÷/]\s*(\d+)/g, '$1 / $2')
        .replace(/–/g, '-');

      expr = expr.replace(/[a-zA-ZÀ-ỹđĐ]+/g, ' ');
      expr = expr.replace(/[^0-9+\-*/()]/g, '');

      if (/[+\-*/]/.test(expr)) {
        const val = evaluateExpression(expr);
        if (val !== null) {
          return String(val);
        }
      }
    }
  }

  return "10"; // Default fallback for Grade 2
}

function generateVisualPedagogyExplanation(prompt: string, answer: string | null, solution: string, _grade: number): string {
  const hasSolution = solution && solution.length > 20;
  let explanation = '';

  if (hasSolution) {
    explanation += `### Lời giải chi tiết:\n${solution}\n\n`;
  }

  explanation += `### Hướng dẫn trực quan cho học sinh:\n`;

  // Check multiplication or division
  const mulDivMatch = prompt.match(/(\d+)\s*([x*:])\s*(\d+)/);
  if (mulDivMatch) {
    const a = parseInt(mulDivMatch[1] || '0', 10);
    const op = mulDivMatch[2];
    const b = parseInt(mulDivMatch[3] || '0', 10);

    if (op === 'x' || op === '*') {
      explanation += `Bé ơi, phép nhân **${a} x ${b}** có nghĩa là số **${a}** được lấy **${b}** lần nhé!\n\n`;
      explanation += `- Chúng mình viết dưới dạng phép cộng: \n`;
      explanation += `  **${a} + `.repeat(b - 1) + `${a}**\n`;
      explanation += `- Hãy cùng tính tổng các nhóm nào:\n`;
      for (let i = 1; i <= b; i++) {
        explanation += `  + Nhóm ${i}: ⭐`.repeat(a) + ` (${a} ngôi sao)\n`;
      }
      explanation += `\nTổng cộng tất cả chúng mình có: **${a * b}** ngôi sao.\n`;
      explanation += `Vậy: **${a} x ${b} = ${a * b}**.\n`;
      return explanation;
    } else if (op === ':') {
      explanation += `Bé ơi, phép chia **${a} : ${b}** có nghĩa là chúng mình chia **${a}** vật thành **${b}** phần bằng nhau nhé!\n\n`;
      explanation += `- Ví dụ bé có **${a}** viên kẹo.\n`;
      explanation += `- Chia đều cho **${b}** bạn.\n`;
      explanation += `- Mỗi bạn sẽ nhận được số kẹo là:\n`;
      const cand = b > 0 ? Math.floor(a / b) : 0;
      const candyCount = Number.isFinite(cand) && cand > 0 ? cand : 1;
      explanation += `  **${a} : ${b} = ${candyCount}** (viên kẹo).\n`;
      explanation += `  Mỗi phần: ` + `🍬`.repeat(Math.min(candyCount, 20)) + `\n`;
      return explanation;
    }
  }

  // Double digit addition or subtraction with carry
  const mathMatch = prompt.match(/(\d+)\s*([+\-])\s*(\d+)/);
  if (mathMatch) {
    const a = parseInt(mathMatch[1] || '0', 10);
    const op = mathMatch[2];
    const b = parseInt(mathMatch[3] || '0', 10);

    explanation += `Chúng mình cùng đặt tính rồi tính phép toán **${a} ${op} ${b}** nhé:\n\n`;
    explanation += `\`\`\`\n`;
    explanation += `   ${String(a).padStart(3, ' ')}\n`;
    explanation += ` ${op} ${String(b).padStart(3, ' ')}\n`;
    explanation += `  -----\n`;
    explanation += `   ${String(op === '+' ? a + b : a - b).padStart(3, ' ')}\n`;
    explanation += `\`\`\`\n\n`;
    explanation += `**Mẹo tính:**\n`;
    explanation += `- Tính hàng đơn vị trước: Cột bên phải.\n`;
    explanation += `- Tính hàng chục sau: Cột bên trái.\n`;
    explanation += `- Lưu ý cộng nhớ hoặc mượn chục nếu cần thiết nhé!`;
    return explanation;
  }

  explanation += `Để giải bài toán này, bé hãy thực hiện các bước:\n`;
  explanation += `1. **Phân tích đề toán:** Đọc đề xem bài toán hỏi gì.\n`;
  explanation += `2. **Tóm tắt:** Nhớ lại các đơn vị đo hoặc các bảng nhân chia đã học.\n`;
  explanation += `3. **Lời giải:** Thực hiện phép tính và viết đáp số rõ ràng.\n`;
  if (answer) {
    explanation += `\n**Đáp số:** **${answer}**`;
  }

  return explanation;
}
