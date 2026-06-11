import {
  MATH10_LEARNING_MATRIX,
  type Math10Pattern,
  type Math10TopicPlan,
} from './math10-plan';
import { applyMath10AutoEnrichment } from './math10-enrichment';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math10RawSource {
  fileName: string;
  relativePath?: string;
  path?: string;
  extension?: string;
  text: string;
  richExtraction?: boolean;
  formulaAssetCount?: number;
  formulaAssets?: Math10FormulaAsset[];
  assetBasePath?: string;
  inlineShapeCount?: number;
  exportedInlineShapes?: number;
  rawOleMarkerCount?: number;
  questionFigureAssets?: Record<string, Math10FormulaAsset>;
  error?: string;
}

export interface Math10FormulaAsset {
  src: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  fileName?: string;
  copied?: boolean;
  source?: string;
  displayMode?: string;
  repairCodes?: string[];
}

export interface Math10ExtractedBlock {
  id: string;
  prompt: string;
  sourceSolution?: string;
  sourceAnswer?: string;
  figureAsset?: Math10FormulaAsset;
  sourceFile: string;
  sourcePath?: string;
  topicId: string;
  patternId: string;
  level: MathLearningLevel;
  confidence: number;
}

export interface Math10ImportIssue {
  code: string;
  severity: 'warning' | 'blocker';
  message: string;
  sourceFile?: string;
  topicId?: string;
}

export interface Math10ImportReport {
  schemaVersion: 'math10_import_v1';
  generatedAt: string;
  inputSources: number;
  mappedSources: number;
  unmappedSources: string[];
  extractedBlocks: number;
  convertedItems: number;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  issues: Math10ImportIssue[];
}

interface TopicMatch {
  topic: Math10TopicPlan;
  confidence: number;
}

const EXERCISE_HEADER_PATTERN = /(?:^|[\r\n\f]|[^\p{L}])\s*((?:(?:B[\p{L}\u00a0]{0,3}i|C[\p{L}\u00a0]{0,3}u)(?:\s+t[\p{L}\u00a0]{0,3}p)?\s*(?:\d+|[IVXLC]+(?=\s*(?:[:.)-]|\[|\d|$)))|V[\p{L}\u00a0]{0,3}\s*d[\p{L}\u00a0]{0,3}\s*\d+|B[\p{L}\u00a0]{0,3}i\s*to[\p{L}\u00a0]{0,3}n\s*\d+)[A-Za-z\u00c0-\u1ef90-9\s]*[:.)-]?)/giu;
const FORMULA_TOKEN_RE = /\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g;
const PRIVATE_USE_MATH_GLYPHS: Record<string, string> = {
  '\uf020': ' ',
  '\uf021': '•',
  '\uf022': '∀',
  '\uf023': '#',
  '\uf024': '∃',
  '\uf026': '∧',
  '\uf027': "'",
  '\uf028': '(',
  '\uf029': ')',
  '\uf02a': '*',
  '\uf02b': '+',
  '\uf02d': '-',
  '\uf02e': '.',
  '\uf02f': '/',
  '\uf030': '0',
  '\uf031': '1',
  '\uf032': '2',
  '\uf033': '3',
  '\uf034': '4',
  '\uf035': '5',
  '\uf036': '6',
  '\uf037': '7',
  '\uf038': '8',
  '\uf039': '9',
  '\uf03a': ':',
  '\uf03b': ';',
  '\uf03c': '<',
  '\uf03d': '=',
  '\uf03e': '>',
  '\uf03f': '',
  '\uf040': '≈',
  '\uf041': 'A',
  '\uf042': 'B',
  '\uf044': 'Δ',
  '\uf046': '⇒',
  '\uf049': '∩',
  '\uf04c': '...',
  '\uf04d': '⋮',
  '\uf04e': 'ℕ',
  '\uf050': 'P',
  '\uf052': 'ℝ',
  '\uf055': '∪',
  '\uf056': '△',
  '\uf057': 'Ω',
  '\uf05a': 'ℤ',
  '\uf05b': '[',
  '\uf05d': ']',
  '\uf05e': '⊥',
  '\uf061': 'α',
  '\uf062': 'β',
  '\uf064': '°',
  '\uf067': 'γ',
  '\uf068': 'η',
  '\uf06a': 'φ',
  '\uf06c': 'λ',
  '\uf06d': 'μ',
  '\uf06f': '°',
  '\uf070': 'π',
  '\uf071': 'θ',
  '\uf072': 'ρ',
  '\uf073': 'σ',
  '\uf074': 'τ',
  '\uf075': '',
  '\uf076': '•',
  '\uf077': 'ω',
  '\uf078': 'ξ',
  '\uf079': 'ψ',
  '\uf07b': '{',
  '\uf07c': '|',
  '\uf07d': '}',
  '\uf086': '\n',
  '\uf09f': '•',
  '\uf0a1': 'ℝ',
  '\uf0a2': 'ℤ',
  '\uf0a3': '≤',
  '\uf0a4': 'ℚ',
  '\uf0a5': 'ℕ',
  '\uf0a7': '∋',
  '\uf0ae': '→',
  '\uf0b0': '°',
  '\uf0b1': '±',
  '\uf0b2': '″',
  '\uf0b3': '≥',
  '\uf0b4': '·',
  '\uf0b5': '∠',
  '\uf0b7': '•',
  '\uf0b9': '≠',
  '\uf0ba': '≡',
  '\uf0bb': '≈',
  '\uf0bc': '...',
  '\uf0be': '→',
  '\uf0c6': '∅',
  '\uf0c7': '∩',
  '\uf0c8': '∪',
  '\uf0cc': '⊂',
  '\uf0ce': '∈',
  '\uf0cf': '∉',
  '\uf0d0': '⊂',
  '\uf0d1': '⊃',
  '\uf0d2': '⊄',
  '\uf0d3': '⊅',
  '\uf0d6': '√',
  '\uf0d7': '·',
  '\uf0d8': '•',
  '\uf0db': '⇔',
  '\uf0de': '⇒',
  '\uf0e5': '∑',
  '\uf0e6': '(',
  '\uf0e7': '(',
  '\uf0e8': '(',
  '\uf0e9': '[',
  '\uf0ea': '[',
  '\uf0eb': '[',
  '\uf0ec': '{',
  '\uf0ed': ';',
  '\uf0ee': '}',
  '\uf0ef': '|',
  '\uf0f6': ')',
  '\uf0f7': ')',
  '\uf0f8': ')',
  '\uf0f9': ']',
  '\uf0fa': ']',
  '\uf0fb': ']',
  '\uf0fc': '}',
  '\uf0fd': ';',
  '\uf0fe': '}',
  '\uf0ff': '|',
  '\uf14b': '',
  '\uf1b3': '•',
  '\uf6be': "'",
  '\uf8e7': '-',
  '\uf8e8': '(',
  '\uf8eb': '(',
  '\uf8ec': '(',
  '\uf8ed': '(',
  '\uf8ee': '[',
  '\uf8ef': '|',
  '\uf8f0': '[',
  '\uf8f1': '{',
  '\uf8f2': ';',
  '\uf8f3': '}',
  '\uf8f4': '|',
  '\uf8f6': ')',
  '\uf8f7': ')',
  '\uf8f8': ')',
  '\uf8f9': ']',
  '\uf8fa': ']',
  '\uf8fb': ']',
  '\uf8fc': '}',
  '\uf8fd': ';',
  '\uf8fe': '}',
};

export function buildMath10QuestionItemsFromRawSources(rawSources: Math10RawSource[]): { items: QuestionItem[]; blocks: Math10ExtractedBlock[]; report: Math10ImportReport } {
  const issues: Math10ImportIssue[] = [];
  const blocks: Math10ExtractedBlock[] = [];
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

    const topicMatch = matchMath10TopicForSource(source);
    const sourceBlocks = extractMath10ExerciseBlocks(source.text);
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
      const blockId = buildBlockId(resolvedTopicMatch.topic.id, source.relativePath || source.fileName, index + 1);
      const itemId = `math10.${blockId}`;
      const pattern = inferPattern(resolvedTopicMatch.topic, prompt);
      const sourceAnswer = splitBlock.solution ? (extractShortAnswer(splitBlock.solution) || compactSourceSolution(splitBlock.solution)) : undefined;
      blocks.push({
        id: blockId,
        prompt,
        sourceSolution: splitBlock.solution,
        sourceAnswer,
        figureAsset: getQuestionFigureAsset(source, itemId, blockId, index + 1),
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
  });

  const items = blocks.map((block): QuestionItem => {
    const topic = MATH10_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const prompt = withFigureAssetToken(block.prompt, block.figureAsset);
    const formulaAssets = extractFormulaAssets(prompt);
    return {
      id: `math10.${block.id}`,
      sourceId: block.id,
      source: 'math10_local_source',
      domainId: 'mathematics',
      programIds: ['vn_math_10_12'],
      conceptIds: pattern?.conceptIds?.length ? pattern.conceptIds : topic?.conceptIds || ['math.logic_sets'],
      skillIds: pattern?.skillIds?.length ? pattern.skillIds : topic?.skillIds || ['math10.logic.identify'],
      misconceptionIds: [],
      type: 'open_response',
      prompt,
      correctAnswer: block.sourceAnswer || null,
      explanation: buildMath10Explanation(topic, pattern, block),
      difficulty: difficultyForLevel(block.level),
      cognitiveLevel: pattern?.cognitiveLevel || (block.level === 'foundation' ? 'understand' : block.level === 'core' ? 'apply' : 'analyze'),
      tags: uniqueStrings([
        'math10',
        topic?.strand || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`,
        formulaAssets.length ? 'formula:recovered_asset' : '',
      ]),
      metadata: {
        grade: 10,
        semester: topic?.semester,
        strand: topic?.strand,
        topicId: block.topicId,
        patternId: block.patternId,
        level: block.level,
        sourceFile: block.sourceFile,
        sourcePath: block.sourcePath || '',
        importConfidence: block.confidence,
        formulaAssets,
        formulaAssetCount: formulaAssets.length,
        formulaStatus: formulaAssets.length ? 'recovered_asset' : 'none',
        figureAsset: block.figureAsset,
        figureStatus: block.figureAsset ? 'recovered_asset' : 'none',
        solutionStatus: block.sourceSolution ? 'source_solution' : 'missing_source_solution',
        sourceAnswer: block.sourceAnswer || '',
      },
    };
  }).map(applyMath10AutoEnrichment);

  return {
    items,
    blocks,
    report: buildReport(rawSources, mappedSources, unmappedSources, blocks, items, issues),
  };
}

export function extractMath10ExerciseBlocks(text: string): string[] {
  const normalized = normalizeExtractedText(text);
  const pairedSections = extractPairedSolutionExerciseBlocks();
  if (pairedSections.length) return pairedSections;
  return extractExerciseBlocksFromText(normalized);
}

function extractExerciseBlocksFromText(text: string): string[] {
  const matches = [...text.matchAll(EXERCISE_HEADER_PATTERN)];
  if (!matches.length) return [text].filter(isUsefulExerciseBlock);

  const blocks: string[] = [];
  matches.forEach((match, index) => {
    const start = getExerciseHeaderStart(match);
    const next = matches[index + 1] ? getExerciseHeaderStart(matches[index + 1]) : text.length;
    const raw = text.slice(start, next);
    const cleaned = normalizePrompt(raw);
    if (isUsefulExerciseBlock(cleaned)) {
      blocks.push(cleaned);
    }
  });

  return blocks;
}

function extractPairedSolutionExerciseBlocks(): string[] {
  return []; // Hỗ trợ fallback cho các tệp cấu trúc đơn giản hoặc không phân tách giải thích rõ ràng
}

function getExerciseHeaderStart(match: RegExpMatchArray): number {
  const fullMatch = match[0] || '';
  const header = match[1] || '';
  const offset = header ? fullMatch.indexOf(header) : 0;
  return (match.index || 0) + Math.max(0, offset);
}

function isUsefulExerciseBlock(text: string): boolean {
  const cleaned = String(text || '').trim();
  if (cleaned.length < 15 || cleaned.length > 9000) return false;
  const search = normalizePromptSearchText(cleaned);
  if (!/\b(?:bai|cau|de|vi du|bai toan)\b/.test(search)) return false;
  if (/^cau\s+\d+\s+den\s+cau\s+\d+\.?$/.test(search)) return false;
  if (/^cau\s+[a-z]\b/.test(search) && !/\b(?:hoi|tim|tinh|chon|chung minh|giai|co bao nhieu|menh de nao)\b/.test(search.slice(0, 220))) return false;
  if (/^(?:chon|dap an)\s+[a-d]\b/.test(search)) return false;
  if (/^(?:dap an|loi giai|huong dan|ket qua)\b/.test(search) && search.length < 180) return false;
  if (/^cau\s+\d+(?:\s+\d+){2,}\s+(?:d\s*a|dap\s*an)\b/.test(search)) return false;
  if (/^(?:bai|chuong|chu de)\s+\d*\b/.test(search.slice(0, 80)) && /\bly thuyet\b/.test(search.slice(0, 180))) return false;
  if (/^(?:dang|phan)\s+\d*\b/.test(search.slice(0, 80)) && search.length < 220) return false;
  return true;
}

function normalizeExtractedText(text: string): string {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function normalizePrompt(text: string): string {
  return cleanupMath10Text(String(text || '')).trim();
}

function cleanupMath10Text(text: string): string {
  let decoded = decodeLegacyVietnameseText(text);

  decoded = decoded
    .replace(/Å\s*([\d\w]+)\s*ã/g, '($1)')
    .replace(/Å/g, '(')
    .replace(/ã/g, ')')
    .replace(/¸/g, ',')
    .replace(/\u00ad/g, '')
    .replace(/®\s*(\n|u\d|[xya-z]\d*)/g, '{$1')
    .replace(/®/g, 'đ')
    .replace(/Ønh/gi, 'đỉnh')
    .replace(/Ø/g, '∅')
    .replace(/ñ/g, 'đ')
    .replace(/©/g, '•')
    .replace(/ø/g, '•')
    .replace(/[\u00d7×]/g, '·');

  const cleaned = repairPrivateUseMathGlyphs(decoded)
    .replace(/Liên hệ tài liệu word toán SĐT(?:\s*và\s*zalo)?\s*:\s*[\d.\s]+/giu, '')
    .replace(/Liên hệ tài liệu word toán SĐT\s*\(zalo\)\s*:\s*[\d.\s_]+/giu, '')
    .replace(/Liên hệ tài liệu word toán zalo\s*:\s*[\d.\s]+/giu, '')
    .replace(/Liên hệ tài liệu word toán(?:\s+Zalo\s+và\s+SĐT|\s+zalo)?\s*:\s*[\d.\s]+(?:\s*Trang\s*\d+)?/giu, '')
    .replace(/TÀI LIỆU TOÁN THẦY DŨNG[^\n]{0,160}/giu, '')
    .replace(/TÀI LIỆU TOÁN HỌC/giu, '')
    .replace(/Tailieumontoan\.com/giu, '')
    .replace(/tailieumontoan(?:\.\w+)?\(?com\)?/giu, '')
    .replace(/Website\s*:\s*tailieumontoan\.com/giu, '')
    .replace(/Website\s*:\s*tailieumontoan(?:\.\w+)?\(?com\)?/giu, '')
    .replace(/(?:^|\n)\s*\d*\s*Website\s*:?\s*(?=\n|$)/giu, '\n')
    .replace(/Điện thoại\s*\(Zalo\)\s*[\d.\s]+/giu, '')
    .replace(/GV\s*:\s*LÊ\s+QUANG\s+XE\s*-\s*[\d.\s]+/giu, '')
    .replace(/GV\.?\s*Ngô\s+Quang\s+Nghiệp\s*[–-]\s*BT\d+/giu, '')
    .replace(/Tài liệu sưu tầm[^\n]{0,160}/giu, '')
    .replace(/Trang\s+\d+\s*\/\s*\d+/giu, '')
    .replace(/Trang\s*\d+(?=\s|$)/giu, '')
    .replace(/(?:^|\n)\s*Trang\s+\d+\s*(?=\n|$)/giu, '\n')
    .replace(/(?:^|\n)\s*Kết quả:\s*(?=\n|$)/giu, '\n')
    .replace(/(?:^|\n)\s*Trình bày:\s*(?:[.…\s]+)(?=\n|$)/giu, '\n')
    .replace(/(?:-{2,}\s*)?HẾT(?:\s*-{2,})?[\s\S]*$/iu, '')
    .replace(/Bảng\s+đáp\s+án(?:\s+đề\s+kiểm\s+tra)?[\s\S]*$/iu, '')
    .replace(/[.…]{8,}/g, '')
    .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:!?])(?=\p{L})/gu, '$1 ')
    .replace(/\n{3,}/g, '\n\n');
  return restoreLinearFormulaTypography(trimLeakedTheorySections(cleaned));
}

function trimLeakedTheorySections(text: string): string {
  return String(text || '')
    .replace(/\n\s*(?:\d+\.\s*)?Dạng\s+\d+[\s\S]*$/iu, '')
    .replace(/\n\s*(?:Phương\s+pháp\s+giải|Nhận\s+xét)\b[\s\S]*$/iu, '')
    .replace(/\n\s*A\.\s*VÍ\s+DỤ\s+MINH\s+HỌA[\s\S]*$/iu, '');
}

function repairPrivateUseMathGlyphs(text: string): string {
  return String(text || '')
    .replace(/([A-Za-z]{1,4})\s*[\uf075]{1,4}\uf072/g, 'vec($1)')
    .replace(/[\uf075]{1,4}\uf072/g, '')
    .replace(/[\uf000-\uf8ff]/g, (glyph) => PRIVATE_USE_MATH_GLYPHS[glyph] ?? glyph);
}

function restoreLinearFormulaTypography(text: string): string {
  return String(text || '')
    .replace(/(?<![\p{L}\p{N}])([xyabcmpqt])\s+([2-9]\d?)(?![\p{L}\p{N}])/gu, '$1^$2')
    .replace(/(?<![\p{L}\p{N}])([A-Z]{2})\s+([2-9]\d?)(?![\p{L}\p{N}])/gu, '$1^$2')
    .replace(/(?<![\p{L}\p{N}])([uvn])\s+([1-9])(?![\p{L}\p{N}])(?=\s*[=,(])/gu, '$1$2')
    .replace(/(?<![\p{L}\p{N}])(cm|dm|mm|m|km)\s+([23])(?![\p{L}\p{N}])/giu, '$1^$2')
    .replace(/([+\-])\s*=\s*(\d+)\s+0\b/g, '$1 $2 = 0')
    .replace(/\b([xyabcmpqt])\s*([+\-])\s*(\d+)\s+\1\b/g, '$1 $2 $3$1');
}

function matchMath10TopicForSource(source: Math10RawSource): TopicMatch | undefined {
  const relativePath = (source.relativePath || source.fileName).toLowerCase();
  const basename = source.fileName.toLowerCase();

  for (const topic of MATH10_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((file) => file.fileName.toLowerCase() === basename || relativePath.includes(file.fileName.toLowerCase()))) {
      return { topic, confidence: 1.0 };
    }
  }

  const inferred = inferTopicFromFileName(relativePath || basename);
  return inferred ? { topic: inferred, confidence: 0.85 } : undefined;
}

function inferTopicFromFileName(value: string): Math10TopicPlan | undefined {
  const text = normalizeSearchText(value);
  if (text.includes('menh de') || text.includes('tap hop') || text.includes('sai so') || text.includes('gan dung')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.algebra.logic_sets');
  }
  if (text.includes('bat phuong trinh') && (text.includes('hai an') || text.includes('he bat phuong trinh'))) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.algebra.linear_inequalities_two_variables');
  }
  if (text.includes('bat dang thuc') || (text.includes('nhi thuc') && !text.includes('newton')) || (text.includes('bat phuong trinh') && !text.includes('bac hai'))) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.algebra.inequalities_one_variable');
  }
  if (text.includes('ham so') || text.includes('parabol') || text.includes('tam thuc') || text.includes('bpt bac hai') || text.includes('can thuc') || text.includes('vo ti')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.algebra.quadratic_functions_graphs');
  }
  if (text.includes('luong giac') || text.includes('sin cos') || text.includes('he thuc luong') || text.includes('giai tam giac')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.geometry.trigonometry_triangles');
  }
  if (text.includes('vec to') || text.includes('vecto') || text.includes('tich vo huong')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.geometry.vectors');
  }
  if (text.includes('toa do') || text.includes('duong thang') || text.includes('duong tron') || text.includes('elip') || text.includes('conic') || text.includes('parabol.pdf')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.geometry.coordinate_plane_oxy');
  }
  if (text.includes('to hop') || text.includes('chinh hop') || text.includes('hoan vi') || text.includes('newton') || text.includes('nhi thuc')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.algebra.combinatorics');
  }
  if (text.includes('thong ke') || text.includes('xac suat') || text.includes('phuong sai') || text.includes('do lech chuan')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.statistics_probability.prob_stats');
  }
  if (text.includes('sgk') || text.includes('de cuong') || text.includes('bo de') || text.includes('hoc ki') || text.includes('hoc ky') || text.includes('tong hop') || text.includes('dung sai') || text.includes('trong tam mon toan') || text.includes('khai phong nang luc') || text.includes('toan thuc te 10')) {
    return MATH10_LEARNING_MATRIX.find((topic) => topic.id === 'math10.assessment.integrated_review');
  }
  return undefined;
}

function inferTopicForExercise(prompt: string, source: Math10RawSource): TopicMatch | undefined {
  const inferred = inferTopicFromFileName(prompt);
  if (inferred) return { topic: inferred, confidence: 0.9 };
  return matchMath10TopicForSource(source);
}

function chooseTopicMatch(promptMatch: TopicMatch | undefined, sourceMatch: TopicMatch | undefined): TopicMatch | undefined {
  return promptMatch || sourceMatch;
}

function inferPattern(topic: Math10TopicPlan, prompt: string): Math10Pattern {
  const text = normalizePromptSearchText(prompt);
  const bySkill = inferPatternIdByPrompt(topic.id, text);
  const direct = bySkill ? topic.patterns.find((candidate) => candidate.id === bySkill) : undefined;
  if (direct) return direct;

  const scored = topic.patterns.map((candidate) => {
    const searchable = normalizePromptSearchText(`${candidate.title} ${candidate.tags.join(' ')} ${candidate.skillIds.join(' ')}`);
    const score = searchable
      .split(/\s+/)
      .filter((token) => token.length >= 3 && text.includes(token)).length;
    return { pattern: candidate, score };
  });
  scored.sort((a, b) => b.score - a.score || levelRank(a.pattern.level) - levelRank(b.pattern.level));
  return scored[0]?.pattern || topic.patterns[0];
}

function splitPromptAndSolution(block: string): { prompt: string; solution?: string } {
  const text = block.trim();
  const markerPattern = /(?:^|[\n\r])\s*(?:[A-D]\.\s*)?(?:Lời\s+giải(?:\s+nguồn|\s+tham\s+khảo)?|Bài\s+giải|Hướng\s+dẫn(?:\s+giải|\s+chấm)?|Đáp\s+án(?:\s+phần\s+bài\s+tập\s+tự\s+luyện)?|Đáp\s+số|Giải)\b\s*[:.-]?|\b(?:Lời\s+giải(?:\s+nguồn|\s+tham\s+khảo)?|Bài\s+giải|Hướng\s+dẫn\s+giải|Đáp\s+án(?:\s+phần\s+bài\s+tập\s+tự\s+luyện)?|Đáp\s+số)\b\s*[:.-]?/giu;
  const indexes = [...text.matchAll(markerPattern)]
    .map((match) => (match.index || 0) + Math.max(0, match[0].search(/Lời|Bài|Hướng|Đáp|Giải/iu)))
    .filter((index) => index >= 15)
    .sort((a, b) => a - b);
  const splitIndex = indexes[0];
  if (typeof splitIndex === 'number') {
    const prompt = normalizePrompt(text.slice(0, splitIndex));
    const solution = normalizePrompt(text.slice(splitIndex));
    return solution.length >= 8 ? { prompt, solution } : { prompt };
  }
  return { prompt: text };
}

function inferPatternIdByPrompt(topicId: string, text: string): string | undefined {
  if (topicId === 'math10.algebra.logic_sets') {
    if (containsAny(text, ['sai so', 'gan dung', 'quy tron', 'chu so chac'])) return 'math10.error.approximation.p5';
    if (containsAny(text, ['bieu do venn', 'so do venn', 'hoc sinh', 'lop co', 'so hoc sinh'])) return 'math10.set.word_problems.p4';
    if (containsAny(text, ['tap hop', 'hop cua', 'giao cua', 'hieu cua', 'phan bu', 'khoang', 'doan'])) return 'math10.set.operation.p3';
    if (containsAny(text, ['keo theo', 'tuong duong', 'dieu kien can', 'dieu kien du', 'khi va chi khi'])) return 'math10.logic.implication.p2';
    return 'math10.logic.identify.p1';
  }

  if (topicId === 'math10.algebra.inequalities_one_variable') {
    if (containsAny(text, ['tham so', 'voi moi', 'ton tai', 'co nghiem', 'vo nghiem'])) return 'math10.ineq1.parameter.p4';
    if (containsAny(text, ['he bat phuong trinh', 'bat phuong trinh', 'tap nghiem'])) return 'math10.ineq1.solve_system.p3';
    if (containsAny(text, ['nhi thuc', 'xet dau', 'bang xet dau', 'dau cua'])) return 'math10.ineq1.linear_sign.p2';
    return 'math10.ineq1.transform.p1';
  }

  if (topicId === 'math10.algebra.linear_inequalities_two_variables') {
    if (containsAny(text, ['lon nhat', 'nho nhat', 'toi uu', 'loi nhuan', 'chi phi', 'san xuat', 'kinh doanh'])) return 'math10.ineq2.optimization.p3';
    if (containsAny(text, ['he bat phuong trinh', 'mien nghiem cua he', 'thoa man dong thoi'])) return 'math10.ineq2.system.p2';
    return 'math10.ineq2.single.p1';
  }

  if (topicId === 'math10.algebra.quadratic_functions_graphs') {
    if (containsAny(text, ['can thuc', 'vo ti', 'can bac hai'])) return 'math10.eq.irrational.p5';
    if (containsAny(text, ['bat phuong trinh', 'tam thuc', 'xet dau', 'bang xet dau'])) return 'math10.ineq.quadratic.p4';
    if (containsAny(text, ['thuc te', 'dien tich lon nhat', 'chieu cao', 'quy dao', 'loi nhuan'])) return 'math10.func.quadratic_app.p3';
    if (containsAny(text, ['parabol', 'do thi', 'dinh', 'truc doi xung', 've do thi'])) return 'math10.func.quadratic_graph.p2';
    return 'math10.func.general.p1';
  }

  if (topicId === 'math10.geometry.trigonometry_triangles') {
    if (containsAny(text, ['thuc te', 'do dac', 'chieu cao', 'khoang cach'])) return 'math10.trig.practical.p4';
    if (containsAny(text, ['dien tich', 'ban kinh noi tiep', 'ban kinh ngoai tiep', 'heron'])) return 'math10.trig.area_formulas.p3';
    if (containsAny(text, ['dinh ly sin', 'dinh ly cos', 'canh', 'goc', 'tam giac abc'])) return 'math10.trig.triangle_laws.p2';
    return 'math10.trig.identity.p1';
  }

  if (topicId === 'math10.geometry.vectors') {
    if (containsAny(text, ['tich vo huong', 'goc giua', 'vuong goc'])) return 'math10.vector.dot_product.p4';
    if (containsAny(text, ['phan tich', 'tich voi mot so', 'cung phuong', 'thang hang', 'trung diem', 'trong tam'])) return 'math10.vector.scalar_mult.p3';
    if (containsAny(text, ['tong', 'hieu', 'cong', 'tru', 'quy tac hinh binh hanh', 'quy tac ba diem'])) return 'math10.vector.addition.p2';
    return 'math10.vector.definition.p1';
  }

  if (topicId === 'math10.geometry.coordinate_plane_oxy') {
    if (containsAny(text, ['elip', 'hyperbol', 'conic', 'parabol'])) return 'math10.oxy.conic.p5';
    if (containsAny(text, ['duong tron', 'tiep tuyen', 'tam', 'ban kinh'])) return 'math10.oxy.circle.p4';
    if (containsAny(text, ['khoang cach', 'goc giua', 'song song', 'vuong goc'])) return 'math10.oxy.distance.p3';
    if (containsAny(text, ['duong thang', 'phuong trinh tong quat', 'phuong trinh tham so', 'he so goc'])) return 'math10.oxy.line.p2';
    return 'math10.oxy.vector.p1';
  }

  if (topicId === 'math10.algebra.combinatorics') {
    if (containsAny(text, ['newton', 'nhi thuc', 'he so', 'so hang'])) return 'math10.comb.newton.p3';
    if (containsAny(text, ['hoan vi', 'chinh hop', 'to hop', 'chon'])) return 'math10.comb.permutations.p2';
    return 'math10.comb.rules.p1';
  }

  if (topicId === 'math10.statistics_probability.prob_stats') {
    if (containsAny(text, ['xac suat', 'bien co', 'khong gian mau', 'ket qua thuan loi'])) return 'math10.prob.classical.p3';
    if (containsAny(text, ['phuong sai', 'do lech chuan', 'khoang bien thien', 'tu phan vi', 'do phan tan'])) return 'math10.stats.dispersion.p2';
    return 'math10.stats.central.p1';
  }

  if (topicId === 'math10.assessment.integrated_review') {
    if (containsAny(text, ['nang cao', 'boi duong', 'hsg', 'khai phong nang luc'])) return 'math10.review.extension.p4';
    if (containsAny(text, ['thuc te', 'mo hinh', 'ung dung', 'lai suat', 'tang truong'])) return 'math10.review.real_world.p3';
    if (containsAny(text, ['de', 'kiem tra', 'hoc ki', 'hoc ky', 'trac nghiem', 'dung sai'])) return 'math10.review.mixed_exam.p2';
    return 'math10.review.mixed_foundation.p1';
  }

  return undefined;
}

function containsAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

function extractShortAnswer(solution: string): string | undefined {
  const clean = normalizePrompt(solution);
  if (clean.length < 5) return undefined;
  const preferred = clean.match(/(?:Chọn\s+[A-D]|Đáp\s*án\s*[:.]?\s*[A-D]|Kết\s*quả\s*[:.]?[^.!?\n]{1,180}|Vậy[^.!?\n]{1,220})[.!?]?/iu)?.[0];
  if (preferred && preferred.trim().length >= 5) return preferred.trim().slice(0, 320);
  return clean.slice(0, 220);
}

function compactSourceSolution(solution: string): string | undefined {
  return normalizePrompt(solution).slice(0, 320);
}

function extractFormulaAssets(text: string): Math10FormulaAsset[] {
  const assets: Math10FormulaAsset[] = [];
  let match;
  while ((match = FORMULA_TOKEN_RE.exec(text)) !== null) {
    assets.push({
      src: match[1],
      width: match[2] ? Number(match[2]) : undefined,
      height: match[3] ? Number(match[3]) : undefined,
    });
  }
  return assets;
}

function getQuestionFigureAsset(source: Math10RawSource, itemId: string, blockId: string, blockIndex: number): Math10FormulaAsset | undefined {
  const assets = source.questionFigureAssets || {};
  return assets[itemId] || assets[blockId] || assets[`q${blockIndex}`];
}

function withFigureAssetToken(prompt: string, figureAsset?: Math10FormulaAsset): string {
  if (!figureAsset?.src) return prompt;
  const widthValue = Number(figureAsset.width || 0);
  const heightValue = Number(figureAsset.height || 0);
  const width = Number.isFinite(widthValue) && widthValue > 0 ? `|w=${Math.round(widthValue)}` : '';
  const height = Number.isFinite(heightValue) && heightValue > 0 ? `|h=${Math.round(heightValue)}` : '';
  const token = `{{formula:${figureAsset.src}${width}${height}}}`;
  if (figureAsset.displayMode === 'source_snippet_repair') {
    return `Đọc đề gốc đã phục hồi từ tài liệu trong hình dưới đây.\n${token}`;
  }
  return `${prompt.trim()}\n${token}`;
}

function difficultyForLevel(level: MathLearningLevel): 'easy' | 'medium' | 'hard' {
  if (level === 'foundation') return 'easy';
  if (level === 'core') return 'medium';
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

function buildBlockId(topicId: string, fileName: string, index: number): string {
  const cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${topicId}.${cleanName}.q${index}`;
}

function uniqueStrings(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

function buildReport(
  rawSources: Math10RawSource[],
  mappedSources: number,
  unmappedSources: string[],
  blocks: Math10ExtractedBlock[],
  items: QuestionItem[],
  issues: Math10ImportIssue[],
): Math10ImportReport {
  return {
    schemaVersion: 'math10_import_v1',
    generatedAt: new Date().toISOString(),
    inputSources: rawSources.length,
    mappedSources,
    unmappedSources,
    extractedBlocks: blocks.length,
    convertedItems: items.length,
    byTopic: countBy(blocks, (b) => b.topicId),
    byLevel: countBy(blocks, (b) => b.level),
    bySource: countBy(blocks, (b) => b.sourceFile),
    issues,
  };
}

function countBy<T>(arr: T[], fn: (val: T) => string): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, val) => {
    const key = fn(val);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function normalizePromptSearchText(value: string): string {
  return normalizeSearchText(String(value || '').replace(/\{\{formula:[^}]+\}\}/g, ' '))
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeSearchText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase();
}

function buildMath10Explanation(topic: Math10TopicPlan | undefined, pattern: Math10Pattern | undefined, block: Math10ExtractedBlock): Record<string, unknown> {
  const topicId = topic?.id || block.topicId;
  const level = pattern?.level || block.level;
  const recognition = buildMath10RecognitionNote(topicId, pattern?.title || block.patternId);
  const trap = buildMath10TrapNote(topicId);
  const checklist = buildMath10SolutionChecklist(topicId, level);
  const sourceSolution = block.sourceSolution ? normalizePrompt(block.sourceSolution) : '';
  const thinking = [
    `**1. Quan sát & nhận diện:** ${recognition}`,
    `**2. Hướng tư duy:** ${checklist}`,
    `**3. Bẫy cần tránh:** ${trap}`,
  ].join('\n\n');

  return {
    source: 'math10_local_source',
    sourceSolutionStatus: sourceSolution ? 'source_solution' : 'missing_source_solution',
    guidedSolutionStatus: sourceSolution ? 'verified_source_solution' : 'generated_miumath_guidance',
    thinking,
    recognition,
    trap,
    checklist,
    steps: sourceSolution
      ? [
        `Bước 0 - Đọc đề và nhận diện: ${recognition}`,
        `Bước 1 - Chọn đường giải: ${checklist}`,
        'Bước 2 - Thực hiện lời giải nguồn:',
        sourceSolution,
        `Bước 3 - Soát lại: ${trap}`,
      ].join('\n\n')
      : [
        'Bài này chưa có lời giải nguồn đã kiểm chứng nên chỉ dùng ở chế độ guided/display cho đến khi bổ sung đáp án.',
        `Bước 0 - Quan sát đề: ${recognition}`,
        `Bước 1 - Dựng hướng làm: ${checklist}`,
        `Bước 2 - Tự kiểm tra trap: ${trap}`,
      ].join('\n\n'),
    answer: block.sourceAnswer || null,
    teacherNote: sourceSolution
      ? 'Đã có lời giải nguồn; khi dạy nên yêu cầu học sinh nêu dấu hiệu nhận diện trước khi xem phép biến đổi.'
      : 'Chưa có lời giải nguồn; không mở chấm điểm tự động cho câu này.',
  };
}

function buildMath10RecognitionNote(topicId: string, patternTitle: string): string {
  if (topicId.includes('logic_sets')) return 'Nhìn từ khóa mệnh đề, phủ định, kéo theo, tương đương, tập hợp, giao/hợp/hiệu/phần bù; cần phân biệt câu khẳng định với câu hỏi/cảm thán và mệnh đề chứa biến.';
  if (topicId.includes('inequalities_one_variable')) return 'Nhận diện bất đẳng thức/bất phương trình một ẩn qua dấu so sánh, điều kiện biến đổi và yêu cầu tìm tập nghiệm hoặc điều kiện tham số.';
  if (topicId.includes('linear_inequalities_two_variables')) return 'Nhận diện miền nghiệm trên mặt phẳng: mỗi bất phương trình là một nửa mặt phẳng, hệ là phần giao; bài thực tế thường quy về tối ưu tuyến tính.';
  if (topicId.includes('quadratic_functions_graphs')) return 'Nhìn hàm số, parabol, tam thức bậc hai, nghiệm hoặc dấu của biểu thức; cần chuyển qua đỉnh, trục đối xứng, Delta hoặc bảng xét dấu.';
  if (topicId.includes('trigonometry_triangles')) return 'Nhận diện tam giác có cạnh/góc/diện tích; chọn định lý sin, cos, công thức diện tích hoặc hệ thức lượng phù hợp trước khi thay số.';
  if (topicId.includes('vectors')) return 'Nhìn vectơ, trung điểm, trọng tâm, cùng phương, tích vô hướng; nên vẽ mũi tên và chọn hệ vectơ cơ sở trước khi biến đổi.';
  if (topicId.includes('coordinate_plane_oxy')) return 'Nhận diện tọa độ Oxy, đường thẳng, khoảng cách, đường tròn hoặc conic; chuyển hình học sang phương trình và tọa độ.';
  if (topicId.includes('combinatorics')) return 'Nhìn bài đếm: xác định có thứ tự hay không, có lặp hay không, chọn quy tắc cộng/nhân, hoán vị, chỉnh hợp, tổ hợp hoặc nhị thức Newton.';
  if (topicId.includes('prob_stats')) return 'Với thống kê/xác suất, khoanh mẫu số tổng, bảng dữ liệu hoặc không gian mẫu trước; không tính khi chưa liệt kê biến cố thuận lợi.';
  if (topicId.includes('assessment')) return 'Đây là bài ôn/tổng hợp; cần phân loại nhanh câu thuộc chuyên đề nào rồi dùng công cụ tương ứng.';
  return `Đọc dạng bài ${patternTitle}, gạch chân dữ kiện, điều kiện và đại lượng cần tìm trước khi tính.`;
}

function buildMath10TrapNote(topicId: string): string {
  if (topicId.includes('logic_sets')) return 'Dễ nhầm mệnh đề với mệnh đề chứa biến, nhầm điều kiện cần/đủ, hoặc đổi phủ định sai khi có “mọi/tồn tại”.';
  if (topicId.includes('inequalities')) return 'Khi nhân/chia với biểu thức chưa biết dấu phải xét dấu; bài tham số cần tách trường hợp biên.';
  if (topicId.includes('quadratic')) return 'Không dùng Viete/Delta khi chưa kiểm tra hệ số bậc hai và điều kiện có nghiệm; bảng xét dấu phải có đủ nghiệm và thứ tự nghiệm.';
  if (topicId.includes('trigonometry')) return 'Dễ thay nhầm cạnh đối/kề hoặc dùng định lý sin/cos không đúng dữ kiện; luôn kiểm tra đơn vị góc và miền giá trị.';
  if (topicId.includes('vectors') || topicId.includes('coordinate')) return 'Không kết luận theo hình vẽ; mọi song song, vuông góc, khoảng cách hoặc tiếp tuyến phải được chứng minh bằng tọa độ/vectơ/phương trình.';
  if (topicId.includes('combinatorics')) return 'Bài đếm hay sai do đếm trùng hoặc bỏ sót; sau khi chọn công thức phải giải thích đối tượng có phân biệt/thứ tự hay không.';
  if (topicId.includes('prob_stats')) return 'Sai thường gặp là dùng sai mẫu số hoặc tính trung bình/tần số khi chưa gom đúng dữ liệu.';
  return 'Cần giữ điều kiện xác định, kiểm tra kết quả và viết kết luận đúng yêu cầu đề.';
}

function buildMath10SolutionChecklist(topicId: string, level: MathLearningLevel): string {
  const hard = level === 'advanced' || level === 'hsg' ? ' Với câu khó, thử biến đổi ngược từ kết luận và xét thêm trường hợp biên.' : '';
  if (topicId.includes('logic_sets')) return `Phân loại câu/mệnh đề -> xác định ký hiệu/tập hợp -> thực hiện phép phủ định, kéo theo hoặc phép toán tập hợp -> kiểm tra lại bằng ví dụ nhỏ.${hard}`;
  if (topicId.includes('inequalities_one_variable')) return `Đặt điều kiện -> biến đổi tương đương có kiểm soát -> xét dấu/lập bảng -> đọc tập nghiệm hoặc điều kiện tham số.${hard}`;
  if (topicId.includes('linear_inequalities_two_variables')) return `Vẽ đường biên -> chọn nửa mặt phẳng bằng điểm thử -> lấy giao miền nghiệm -> với tối ưu, thử các đỉnh miền nghiệm.${hard}`;
  if (topicId.includes('quadratic_functions_graphs')) return `Xác định dạng bậc hai -> dùng đỉnh/Delta/Viete/bảng xét dấu -> giải yêu cầu về đồ thị, nghiệm hoặc cực trị -> kết luận.${hard}`;
  if (topicId.includes('trigonometry_triangles')) return `Vẽ tam giác -> đánh dấu cạnh/góc biết và cần tìm -> chọn định lý/công thức -> tính đại lượng trung gian -> kiểm tra đơn vị.${hard}`;
  if (topicId.includes('vectors')) return `Vẽ hình -> chọn vectơ cơ sở/quy tắc ba điểm -> biến đổi tuyến tính hoặc tích vô hướng -> kết luận hình học.${hard}`;
  if (topicId.includes('coordinate_plane_oxy')) return `Gán tọa độ/phương trình -> dùng công thức khoảng cách/góc/tâm bán kính -> giải hệ nếu cần -> diễn giải lại bằng hình học.${hard}`;
  if (topicId.includes('combinatorics')) return `Chia trường hợp -> chọn quy tắc/công thức đếm -> tránh trùng lặp -> cộng các trường hợp hợp lệ.${hard}`;
  if (topicId.includes('prob_stats')) return `Lập bảng/không gian mẫu -> tính số trường hợp hoặc đại lượng thống kê -> rút gọn -> kiểm tra kết quả hợp lý.${hard}`;
  return `Ghi điều kiện -> chọn công cụ -> giải từng bước -> kiểm tra -> kết luận.${hard}`;
}

// TCVN3/VNI times decoder helpers
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
const TCVN3_SIGNAL_RE = /[\u00a8\u00a9\u00aa\u00ab\u00ac\u00ad\u00ae\u00b5\u00b6\u00b8\u00b9\u00bb\u00bc\u00bd\u00be\u00c6\u00c7\u00c8\u00c9\u00ca\u00cb\u00cc\u00ce\u00cf\u00d0\u00d1\u00d2\u00d3\u00d4\u00d5\u00d6\u00d7\u00d8\u00dc\u00dd\u00de\u00df\u00e5\u00e6\u00e7\u00e8\u00e5\u00ee\u00ef\u00f1\u00f4\u00f8\u00fb\u00fc\u00fe]/g;

function decodeLegacyVietnameseText(value: string): string {
  let text = String(value || '');
  const matches = text.match(TCVN3_SIGNAL_RE);
  if (matches && matches.length >= 1) {
    text = text.replace(TCVN3_CHAR_RE, (char) => TCVN3_CHAR_MAP[char] || char);
  }
  return decodeVniTimesText(text);
}

function decodeVniTimesText(text: string): string {
  let res = text;
  
  // 3-character vowel groups
  res = res.replace(/ööù/g, 'ướ').replace(/öôù/g, 'ướ').replace(/öôø/g, 'ườ').replace(/öôû/g, 'ử').replace(/öôõ/g, 'ưỡng').replace(/öôï/g, 'ượ');
  res = res.replace(/uôù/g, 'uố').replace(/uôø/g, 'uồ').replace(/uôû/g, 'uổ').replace(/uôõ/g, 'uỗ').replace(/uôï/g, 'uộ');
  res = res.replace(/ÖÔÙ/g, 'ƯỚ').replace(/ÖÔØ/g, 'ƯỜ').replace(/ÖÔÛ/g, 'ƯỞ').replace(/ÖÔÕ/g, 'ƯỠ').replace(/ÖÔÏ/g, 'ƯỢ');
  res = res.replace(/UÔÙ/g, 'UỐ').replace(/UÔØ/g, 'UỒ').replace(/UÔÛ/g, 'UỔ').replace(/UÔÕ/g, 'UỖ').replace(/UÔÏ/g, 'UỘ');

  // 2-character vowel groups
  res = res.replace(/aâù/g, 'ấ').replace(/aâø/g, 'ầ').replace(/aâû/g, 'ẩ').replace(/aâõ/g, 'ẫ').replace(/aâï/g, 'ậ');
  res = res.replace(/aéù/g, 'ắ').replace(/aéø/g, 'ằ').replace(/aéû/g, 'ẳ').replace(/aéï/g, 'ặ');
  res = res.replace(/eâù/g, 'ế').replace(/eâø/g, 'ề').replace(/eâû/g, 'ể').replace(/eâõ/g, 'ễ').replace(/eâï/g, 'ệ');
  res = res.replace(/oâù/g, 'ố').replace(/oâø/g, 'ồ').replace(/oâû/g, 'ổ').replace(/oâõ/g, 'ỗ').replace(/oâï/g, 'ộ');
  res = res.replace(/AÂÙ/g, 'Ấ').replace(/AÂØ/g, 'Ầ').replace(/AÂÛ/g, 'Ẩ').replace(/AÂÕ/g, 'Ẫ').replace(/AÂÏ/g, 'Ậ');
  res = res.replace(/AÉÙ/g, 'Ắ').replace(/AÉØ/g, 'Ằ').replace(/AÉÛ/g, 'Ẳ').replace(/AÉÏ/g, 'Ặ');
  res = res.replace(/EÂÙ/g, 'Ế').replace(/EÂØ/g, 'Ề').replace(/EÂÛ/g, 'Ể').replace(/EÂÕ/g, 'Ễ').replace(/EÂÏ/g, 'Ệ');
  res = res.replace(/OÂÙ/g, 'Ố').replace(/OÂØ/g, 'Ồ').replace(/OÂÛ/g, 'Ổ').replace(/OÂÕ/g, 'Ỗ').replace(/OÂÏ/g, 'Ộ');

  // Basic vowels + tone
  res = res.replace(/aù/g, 'á').replace(/aø/g, 'à').replace(/aû/g, 'ả').replace(/aõ/g, 'ã').replace(/aï/g, 'ạ');
  res = res.replace(/eù/g, 'é').replace(/eø/g, 'è').replace(/eû/g, 'ẻ').replace(/eõ/g, 'ẽ').replace(/eï/g, 'ẹ');
  res = res.replace(/où/g, 'ó').replace(/oø/g, 'ò').replace(/oû/g, 'ỏ').replace(/oõ/g, 'õ').replace(/oï/g, 'ọ');
  res = res.replace(/uù/g, 'ú').replace(/uø/g, 'ù').replace(/uû/g, 'ủ').replace(/uõ/g, 'ũ').replace(/uï/g, 'ụ');
  res = res.replace(/iù/g, 'í').replace(/iø/g, 'ì').replace(/iû/g, 'ỉ').replace(/iõ/g, 'ĩ').replace(/iï/g, 'ị');
  res = res.replace(/yù/g, 'ý').replace(/yø/g, 'ỳ').replace(/yû/g, 'ỷ').replace(/yõ/g, 'ỹ').replace(/yï/g, 'ỵ');
  res = res.replace(/öù/g, 'ứ').replace(/öø/g, 'ừ').replace(/öû/g, 'ử').replace(/öõ/g, 'ữ').replace(/öï/g, 'ự');
  res = res.replace(/AÙ/g, 'Á').replace(/AØ/g, 'À').replace(/AÛ/g, 'Ả').replace(/AÕ/g, 'Ã').replace(/AÏ/g, 'Ạ');
  res = res.replace(/EÙ/g, 'É').replace(/EØ/g, 'È').replace(/EÛ/g, 'Ẻ').replace(/EÕ/g, 'Ẽ').replace(/EÏ/g, 'Ẹ');
  res = res.replace(/OÙ/g, 'Ó').replace(/OØ/g, 'Ò').replace(/OÛ/g, 'Ỏ').replace(/OÕ/g, 'Õ').replace(/OÏ/g, 'Ọ');
  res = res.replace(/UÙ/g, 'Ú').replace(/UØ/g, 'Ù').replace(/UÛ/g, 'Ủ').replace(/UÕ/g, 'Ũ').replace(/UÏ/g, 'Ụ');
  res = res.replace(/IÙ/g, 'Í').replace(/IØ/g, 'Ì').replace(/IÛ/g, 'Ỉ').replace(/IÕ/g, 'Ĩ').replace(/IÏ/g, 'Ị');
  res = res.replace(/YÙ/g, 'Ý').replace(/YØ/g, 'Ỳ').replace(/YÛ/g, 'Ỷ').replace(/YÕ/g, 'Ỹ').replace(/YÏ/g, 'Ỵ');
  res = res.replace(/ÖÙ/g, 'Ứ').replace(/ÖØ/g, 'Ừ').replace(/ÖÛ/g, 'Ử').replace(/ÖÕ/g, 'Ữ').replace(/ÖÏ/g, 'Ự');

  // Single base characters
  res = res.replace(/aâ/g, 'â').replace(/aé/g, 'ă').replace(/eâ/g, 'ê').replace(/oâ/g, 'ô').replace(/öô/g, 'ươ').replace(/uô/g, 'uô').replace(/ö/g, 'ư');
  res = res.replace(/AÂ/g, 'Â').replace(/AÉ/g, 'Ă').replace(/EÂ/g, 'Ê').replace(/OÂ/g, 'Ô').replace(/ÖÔ/g, 'ƯƠ').replace(/UÔ/g, 'UÔ').replace(/Ö/g, 'Ư');
  res = res.replace(/ñ/g, 'đ').replace(/Ñ/g, 'Đ');
  
  return res;
}
