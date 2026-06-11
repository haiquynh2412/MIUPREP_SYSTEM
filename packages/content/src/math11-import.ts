import {
  MATH11_LEARNING_MATRIX,
  type Math11Pattern,
  type Math11TopicPlan,
} from './math11-plan';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math11RawSource {
  fileName: string;
  relativePath?: string;
  path?: string;
  extension?: string;
  text: string;
  richExtraction?: boolean;
  formulaAssetCount?: number;
  formulaAssets?: Math11FormulaAsset[];
  assetBasePath?: string;
  inlineShapeCount?: number;
  exportedInlineShapes?: number;
  rawOleMarkerCount?: number;
  questionFigureAssets?: Record<string, Math11FormulaAsset>;
  error?: string;
}

export interface Math11FormulaAsset {
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

export interface Math11ExtractedBlock {
  id: string;
  prompt: string;
  sourceSolution?: string;
  sourceAnswer?: string;
  figureAsset?: Math11FormulaAsset;
  sourceFile: string;
  sourcePath?: string;
  topicId: string;
  patternId: string;
  level: MathLearningLevel;
  confidence: number;
}

export interface Math11ImportIssue {
  code: string;
  severity: 'warning' | 'blocker';
  message: string;
  sourceFile?: string;
  topicId?: string;
}

export interface Math11ImportReport {
  schemaVersion: 'math11_import_v1';
  generatedAt: string;
  inputSources: number;
  mappedSources: number;
  unmappedSources: string[];
  extractedBlocks: number;
  convertedItems: number;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  issues: Math11ImportIssue[];
}

interface TopicMatch {
  topic: Math11TopicPlan;
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

export function buildMath11QuestionItemsFromRawSources(rawSources: Math11RawSource[]): { items: QuestionItem[]; blocks: Math11ExtractedBlock[]; report: Math11ImportReport } {
  const issues: Math11ImportIssue[] = [];
  const blocks: Math11ExtractedBlock[] = [];
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

    const topicMatch = matchMath11TopicForSource(source);
    const sourceBlocks = extractMath11ExerciseBlocks(source.text);
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
      const itemId = `math11.${blockId}`;
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
    const topic = MATH11_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const prompt = withFigureAssetToken(block.prompt, block.figureAsset);
    const formulaAssets = extractFormulaAssets(prompt);
    return {
      id: `math11.${block.id}`,
      sourceId: block.id,
      source: 'math11_local_source',
      domainId: 'mathematics',
      programIds: ['vn_math_10_12'],
      conceptIds: pattern?.conceptIds?.length ? pattern.conceptIds : topic?.conceptIds || ['math.integrated_review'],
      skillIds: pattern?.skillIds?.length ? pattern.skillIds : topic?.skillIds || ['math11.review.mixed_foundation'],
      misconceptionIds: [],
      type: 'open_response',
      prompt,
      correctAnswer: block.sourceAnswer || null,
      explanation: buildMath11Explanation(topic, pattern, block),
      difficulty: difficultyForLevel(block.level),
      cognitiveLevel: pattern?.cognitiveLevel || (block.level === 'foundation' ? 'understand' : block.level === 'core' ? 'apply' : 'analyze'),
      tags: uniqueStrings([
        'math11',
        topic?.strand || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`,
        formulaAssets.length ? 'formula:recovered_asset' : '',
      ]),
      metadata: {
        grade: 11,
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
  });

  return {
    items,
    blocks,
    report: buildReport(rawSources, mappedSources, unmappedSources, blocks, items, issues),
  };
}

export function extractMath11ExerciseBlocks(text: string): string[] {
  const normalized = normalizeExtractedText(text);
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
  return cleanupMath11Text(String(text || '')).trim();
}

function cleanupMath11Text(text: string): string {
  let decoded = decodeLegacyVietnameseText(text);
  decoded = cleanVniOcrCorruptions(decoded);

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

  return restoreLinearFormulaTypography(repairPrivateUseMathGlyphs(decoded))
    .replace(/Liên hệ tài liệu word toán SĐT(?:\s*và\s*zalo)?\s*:\s*[\d.\s]+/giu, '')
    .replace(/Liên hệ tài liệu word toán SĐT\s*\(zalo\)\s*:\s*[\d.\s_]+/giu, '')
    .replace(/Liên hệ tài liệu word toán zalo\s*:\s*[\d.\s]+/giu, '')
    .replace(/Liên hệ tài liệu word toán(?:\s+Zalo\s+và\s+SĐT|\s+zalo)?\s*:\s*[\d.\s]+(?:\s*Trang\s*\d+)?/giu, '')
    .replace(/TÀI LIỆU TOÁN THẦY DŨNG[^\n]{0,160}/giu, '')
    .replace(/TÀI LIỆU TOÁN HỌC/giu, '')
    .replace(/Tailieumontoan\.com/giu, '')
    .replace(/Website\s*:\s*tailieumontoan\.com/giu, '')
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
    .replace(/Lê Minh Kha/giu, '')
    .replace(/thuvienhoclieu\.com/giu, '')
    .replace(/GV PHẠM ĐÌNH QUANG/giu, '')
    .replace(/(?:^|\n)\s*LỜI GIẢI CHI TIẾT\s*(?=\n|$)/giu, '\n')
    .replace(/(?:-{2,}\s*)?HẾT(?:\s*-{2,})?[\s\S]*$/iu, '')
    .replace(/Bảng\s+đáp\s+án(?:\s+đề\s+kiểm\s+tra)?[\s\S]*$/iu, '')
    .replace(/[.…]{8,}/g, '')
    .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}

function repairPrivateUseMathGlyphs(text: string): string {
  return String(text || '')
    .replace(/([A-Za-z]{1,4})\s*[\uf075]{1,4}\uf072/g, 'vec($1)')
    .replace(/[\uf075]{1,4}\uf072/g, '')
    .replace(/[\uf000-\uf8ff]/g, (glyph) => PRIVATE_USE_MATH_GLYPHS[glyph] ?? glyph);
}

function restoreLinearFormulaTypography(text: string): string {
  return String(text || '')
    .replace(/\b([a-zA-Z])\s+([23])\b/g, '$1^$2')
    .replace(/\b([A-Z]{2})\s+([23])\b/g, '$1^$2')
    .replace(/\b(cm|dm|mm|m|km)\s+([23])\b/giu, '$1^$2')
    .replace(/([+\-])\s*=\s*(\d+)\s+0\b/g, '$1 $2 = 0')
    .replace(/\b([a-zA-Z])\s*([+\-])\s*(\d+)\s+\1\b/g, '$1 $2 $3$1');
}

function matchMath11TopicForSource(source: Math11RawSource): TopicMatch | undefined {
  const relativePath = (source.relativePath || source.fileName).toLowerCase();
  const basename = source.fileName.toLowerCase();

  for (const topic of MATH11_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((file) => file.fileName.toLowerCase() === basename || relativePath.includes(file.fileName.toLowerCase()))) {
      return { topic, confidence: 1.0 };
    }
  }

  const inferred = inferTopicFromFileName(relativePath || basename);
  return inferred ? { topic: inferred, confidence: 0.85 } : undefined;
}

function inferTopicFromFileName(value: string): Math11TopicPlan | undefined {
  const text = normalizeSearchText(value);
  if (text.includes('luong giac') || text.includes('trig') || text.includes('sin') || text.includes('cos') || text.includes('tan') || text.includes('cotan')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.algebra.trigonometry');
  }
  if (text.includes('cap so cong') || text.includes('cap so nhan') || text.includes('day so') || text.includes('sequences')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.algebra.sequences_progressions');
  }
  if (text.includes('gioi han') || text.includes('lien tuc') || text.includes('limit') || text.includes('continuity') || text.includes('lim')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.calculus.limits_continuity');
  }
  if (text.includes('song song') || text.includes('parallel')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.geometry.parallelism');
  }
  if (text.includes('ghep nhom') || text.includes('grouped data') || text.includes('mẫu số liệu ghép nhóm') || text.includes('ghép nhóm')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.statistics.grouped_data');
  }
  if (text.includes('logarit') || text.includes('exponential') || text.includes('logarithm') || text.includes('hàm số mũ') || text.includes('lao kep') || text.includes('lai kep')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.algebra.exponential_logarithm');
  }
  if (text.includes('vuong goc') || text.includes('perpendicular') || text.includes('khoang cach') || text.includes('nhic dien') || text.includes('góc nhị diện') || text.includes('goc giua hai mat phang')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.geometry.perpendicularity');
  }
  if (text.includes('xac suat') || text.includes('xác suất') || text.includes('quy tac cong xac suat') || text.includes('quy tac nhan xac suat') || text.includes('doc lap') || text.includes('xac suat co dieu kien') || text.includes('probability')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.probability.rules');
  }
  if (text.includes('dao ham') || text.includes('tiep tuyen') || text.includes('derivative') || text.includes('tangent')) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.calculus.derivatives');
  }
  if (
    text.includes('on tap') ||
    text.includes('de cuong') ||
    text.includes('bo de') ||
    text.includes('hoc ki') ||
    text.includes('hoc ky') ||
    text.includes('toan thuc te') ||
    text.includes('dung sai') ||
    text.includes('trac nghiem') ||
    text.includes('thuvienhoclieu') ||
    text.includes('phep quay') ||
    text.includes('phep bien hinh') ||
    text.includes('bunhiacopxki') ||
    text.includes('bat dang thuc') ||
    text.includes('min max')
  ) {
    return MATH11_LEARNING_MATRIX.find((topic) => topic.id === 'math11.assessment.integrated_review');
  }
  return undefined;
}

function inferTopicForExercise(prompt: string, source: Math11RawSource): TopicMatch | undefined {
  const inferred = inferTopicFromFileName(prompt);
  if (inferred) return { topic: inferred, confidence: 0.9 };
  return matchMath11TopicForSource(source);
}

function chooseTopicMatch(promptMatch: TopicMatch | undefined, sourceMatch: TopicMatch | undefined): TopicMatch | undefined {
  return promptMatch || sourceMatch;
}

function inferPattern(topic: Math11TopicPlan, prompt: string): Math11Pattern {
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
  if (topicId === 'math11.algebra.trigonometry') {
    if (containsAny(text, ['cong thuc cong', 'nhan doi', 'tich thanh tong', 'tong thanh tich'])) return 'math11.trig.formulas.p2';
    if (containsAny(text, ['ham so luong giac', 'chu ky', 'tuan hoan', 'chan le', 'do thi'])) return 'math11.trig.functions.p3';
    if (containsAny(text, ['phuong trinh luong giac', 'co ban', 'nghiem cua phuong trinh'])) return 'math11.trig.equations.p4';
    return 'math11.trig.values.p1';
  }

  if (topicId === 'math11.algebra.sequences_progressions') {
    if (containsAny(text, ['cap so cong', 'cong sai', 'so hang tong quat cua cap so cong'])) return 'math11.seq.arithmetic.p2';
    if (containsAny(text, ['cap so nhan', 'cong boi', 'so hang tong quat cua cap so nhan'])) return 'math11.seq.geometric.p3';
    if (containsAny(text, ['thuc te', 'lai suat', 'dan so', 'ung dung'])) return 'math11.seq.word_problems.p4';
    return 'math11.seq.properties.p1';
  }

  if (topicId === 'math11.calculus.limits_continuity') {
    if (containsAny(text, ['gioi han ham so', 'x dan toi', 'vo cung', 'lim'])) return 'math11.lim.function.p2';
    if (containsAny(text, ['lien tuc', 'tim m de ham so lien tuc', 'lien tuc tai'])) return 'math11.lim.continuity.p3';
    return 'math11.lim.sequence.p1';
  }

  if (topicId === 'math11.geometry.parallelism') {
    if (containsAny(text, ['giao tuyen', 'giao diem', 'chung minh giao tuyen'])) return 'math11.parallel.intersection.p1';
    if (containsAny(text, ['song song', 'duong thang song song']) && !text.includes('mat phang')) return 'math11.parallel.line_line.p2';
    if (containsAny(text, ['duong thang song song voi mat phang', 'thiet dien', 'song song voi mat phang'])) return 'math11.parallel.line_plane.p3';
    return 'math11.parallel.plane_plane.p4';
  }

  if (topicId === 'math11.statistics.grouped_data') {
    if (containsAny(text, ['trung vi', 'tu phan vi', 'ghép nhóm'])) return 'math11.stats.median_grouped.p2';
    if (containsAny(text, ['mot', 'mốt', 'nhom chua mot'])) return 'math11.stats.mode_grouped.p3';
    return 'math11.stats.mean_grouped.p1';
  }

  if (topicId === 'math11.algebra.exponential_logarithm') {
    if (containsAny(text, ['ham so mu', 'ham so logarit', 'tap xac dinh ham so mu'])) return 'math11.explog.functions.p2';
    if (containsAny(text, ['phuong trinh mu', 'phuong trinh logarit'])) return 'math11.explog.equations.p3';
    if (containsAny(text, ['bat phuong trinh mu', 'bat phuong trinh logarit'])) return 'math11.explog.inequalities.p4';
    if (containsAny(text, ['lai kep', 'dan so', 'tang truong', 'thuc te'])) return 'math11.explog.word_problems.p5';
    return 'math11.explog.properties.p1';
  }

  if (topicId === 'math11.geometry.perpendicularity') {
    if (containsAny(text, ['vuong goc voi mat phang', 'duong thang vuong goc voi mat phang'])) return 'math11.perpendicular.line_plane.p2';
    if (containsAny(text, ['hai mat phang vuong goc'])) return 'math11.perpendicular.plane_plane.p3';
    if (containsAny(text, ['goc giua', 'nhi dien', 'goc giua hai mat phang'])) return 'math11.perpendicular.angle.p4';
    if (containsAny(text, ['khoang cach', 'khoang cach giua hai duong'])) return 'math11.perpendicular.distance.p5';
    return 'math11.perpendicular.line_line.p1';
  }

  if (topicId === 'math11.probability.rules') {
    if (containsAny(text, ['quy tac nhan', 'doc lap', 'hai bien co doc lap'])) return 'math11.prob.rules_multiplication.p2';
    if (containsAny(text, ['dieu kien', 'so do cay', 'xac suat co dieu kien'])) return 'math11.prob.conditional.p3';
    return 'math11.prob.rules_addition.p1';
  }

  if (topicId === 'math11.calculus.derivatives') {
    if (containsAny(text, ['cong thuc', 'quy tac tinh', 'dao ham cua ham so', 'tinh dao ham'])) return 'math11.deriv.rules.p2';
    if (containsAny(text, ['tiep tuyen', 'phuong trinh tiep tuyen', 'he so goc'])) return 'math11.deriv.tangent.p3';
    if (containsAny(text, ['dao ham cap hai', 'cap hai', 'f\"'])) return 'math11.deriv.second_order.p4';
    if (containsAny(text, ['vat ly', 'van toc', 'gia toc', 'chuyen dong'])) return 'math11.deriv.physics_app.p5';
    return 'math11.deriv.definition.p1';
  }

  if (topicId === 'math11.assessment.integrated_review') {
    if (containsAny(text, ['hoc ki', 'hoc ky', 'de thi', 'kiem tra'])) return 'math11.review.mixed_exam.p2';
    if (containsAny(text, ['thuc te', 'toan thuc te', 'do dac'])) return 'math11.review.real_world.p3';
    if (containsAny(text, ['nang cao', 'hoc sinh gioi', 'hsg', 'boi duong'])) return 'math11.review.extension.p4';
    return 'math11.review.mixed_foundation.p1';
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

function extractFormulaAssets(text: string): Math11FormulaAsset[] {
  const assets: Math11FormulaAsset[] = [];
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

function getQuestionFigureAsset(source: Math11RawSource, itemId: string, blockId: string, blockIndex: number): Math11FormulaAsset | undefined {
  const assets = source.questionFigureAssets || {};
  const paddedIndex = blockIndex.toString().padStart(3, '0');
  return assets[itemId] || assets[blockId] || assets[`q${paddedIndex}`] || assets[`q${blockIndex}`];
}

function withFigureAssetToken(prompt: string, figureAsset?: Math11FormulaAsset): string {
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
  return `${topicId}.${cleanName}.q${index.toString().padStart(3, '0')}`;
}

function uniqueStrings(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

function buildReport(
  rawSources: Math11RawSource[],
  mappedSources: number,
  unmappedSources: string[],
  blocks: Math11ExtractedBlock[],
  items: QuestionItem[],
  issues: Math11ImportIssue[],
): Math11ImportReport {
  return {
    schemaVersion: 'math11_import_v1',
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
  return decodeLegacyVietnameseText(String(value || ''))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase();
}

function buildMath11Explanation(topic: Math11TopicPlan | undefined, pattern: Math11Pattern | undefined, block: Math11ExtractedBlock): Record<string, unknown> {
  const topicId = topic?.id || block.topicId;
  const level = pattern?.level || block.level;
  const recognition = buildMath11RecognitionNote(topicId, pattern?.title || block.patternId);
  const trap = buildMath11TrapNote(topicId);
  const checklist = buildMath11SolutionChecklist(topicId, level);
  const sourceSolution = block.sourceSolution ? normalizePrompt(block.sourceSolution) : '';
  const thinking = [
    `**1. Quan sát & nhận diện:** ${recognition}`,
    `**2. Hướng tư duy:** ${checklist}`,
    `**3. Bẫy cần tránh:** ${trap}`,
  ].join('\n\n');

  return {
    source: 'math11_local_source',
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
        'Hướng dẫn tự học và giải chi tiết theo phương pháp MiuMath:',
        `**Bước 0 - Đọc đề và phân tích:** ${recognition}`,
        `**Bước 1 - Dựng hướng giải quyết:**`,
        getMath11SemanticExplanation(block.prompt, topicId, level),
        `**Bước 2 - Soát lại & Tránh bẫy:** ${trap}`,
      ].join('\n\n'),
    answer: block.sourceAnswer || null,
    teacherNote: sourceSolution
      ? 'Đã có lời giải nguồn; khi dạy nên yêu cầu học sinh nêu dấu hiệu nhận diện trước khi xem phép biến đổi.'
      : 'Chưa có lời giải nguồn; không mở chấm điểm tự động cho câu này.',
  };
}

function getMath11SemanticExplanation(prompt: string, topicId: string, _level: MathLearningLevel): string {
  const search = normalizePromptSearchText(prompt);
  
  // Helper function for word matching
  const hasWords = (s: string, ...words: string[]): boolean => {
    return words.some((word) => {
      if (word.includes(' ')) {
        return s.includes(word);
      }
      const regex = new RegExp(`\\b${word}\\b`);
      return regex.test(s);
    });
  };

  // 1. Trigonometry (Lượng giác)
  if (
    topicId.includes('trigonometry') ||
    hasWords(search, 'sin', 'cos', 'tan', 'cot', 'luong giac', 'radian', 'cung', 'goc', 'quay', 'banh xe', 'vong quay', 'kim gio', 'kim phut', 'dong ho', 'banh', 'vong', 'duong tron', 'ban kinh', 'duong kinh', 'chu vi', 'quang duong')
  ) {
    if (hasWords(search, 'phuong trinh', 'giai')) {
      return 'Phương trình lượng giác.\n- **Cách giải:** Đưa phương trình về dạng lượng giác cơ bản: $\\sin x = \\sin \\alpha \\Leftrightarrow \\left[ \\begin{array}{l} x = \\alpha + k2\\pi \\\\ x = \\pi - \\alpha + k2\\pi \\end{array} \\right.$ hoặc $\\cos x = \\cos \\alpha \\Leftrightarrow x = \\pm \\alpha + k2\\pi$ ($k \\in \\mathbb{Z}$).\n- **Chú ý:** Điều kiện xác định đối với phương trình chứa $\\tan x$ (đk $\\cos x \\neq 0$) hoặc $\\cot x$ (đk $\\sin x \\neq 0$).';
    }
    if (hasWords(search, 'gia tri lon nhat', 'gia tri nho nhat', 'gtln', 'gtnn', 'max', 'min')) {
      return 'Tìm cực trị (GTLN, GTNN) của biểu thức lượng giác.\n- **Cách giải:** Sử dụng tính chất giới hạn của hàm lượng giác: $-1 \\leq \\sin x \\leq 1$ và $-1 \\leq \\cos x \\leq 1$.\n- Đối với biểu thức phức tạp hơn, đặt ẩn phụ $t = \\sin x$ hoặc $t = \\cos x$ với điều kiện $t \\in [-1, 1]$ rồi khảo sát hàm số bậc hai theo biến $t$.';
    }
    if (hasWords(search, 'tap xac dinh', 'txd', 'co nghia')) {
      return 'Tìm tập xác định của hàm số lượng giác.\n- **Cách giải:** \n  + Hàm số $y = \\tan u(x)$ xác định khi $u(x) \\neq \\frac{\\pi}{2} + k\\pi$.\n  + Hàm số $y = \\cot u(x)$ xác định khi $u(x) \\neq k\\pi$.\n  + Hàm số chứa phân thức $\\frac{A}{B}$ xác định khi $B \\neq 0$.';
    }
    return 'Rút gọn hoặc tính giá trị của biểu thức lượng giác.\n- **Cách giải:** Áp dụng các công thức lượng giác cơ bản: công thức cộng, công thức nhân đôi, công thức biến đổi tích thành tổng, tổng thành tích và các hệ thức lượng trong đường tròn (công thức tính độ dài cung tròn $l = R \\alpha$ với $\\alpha$ tính bằng radian) để tính toán chính xác.';
  }

  // 2. Sequences & Progressions (Dãy số, cấp số cộng, cấp số nhân)
  if (
    topicId.includes('sequences_progressions') ||
    hasWords(search, 'cap so cong', 'csc', 'cap so nhan', 'csn', 'day so', 'cong sai', 'cong boi', 'tiet kiem', 'gui tiet kiem', 'lai suat', 'lai suat', 'moi nam', 'hang nam', 'dan so', 'tang truong', 'lien truoc', 'lien truoc', 'hang ghe', 'hang thu', 'hang tiep theo', 'trong cay', 'lat gach', 'vien gach', 'tra gop', 'tra dan', 'vay ngan hang', 'ghe', 'gach', 'vay', 'u vuong', 'hat de', 'bungee', 'nay nguoc', 'qua bong', 'cao su', 'nay len', 'nhiet do', 'ngan da', 'tu lanh', 'to giay', 'cat', 'chong len', 'boi loi', 'chuyen dong', 'quy dao')
  ) {
    if (hasWords(search, 'cap so cong', 'csc', 'cong sai')) {
      return 'Cấp số cộng (CSC).\n- **Công thức cần nhớ:**\n  + Số hạng tổng quát: $u_n = u_1 + (n - 1)d$ (với $u_1$ là số hạng đầu, $d$ là công sai).\n  + Tổng $n$ số hạng đầu tiên: $S_n = \\frac{n(u_1 + u_n)}{2} = n u_1 + \\frac{n(n - 1)d}{2}$.\n- **Cách giải:** Thiết lập hệ phương trình theo $u_1$ và $d$ từ các dữ kiện đề bài để tìm hai đại lượng này.';
    }
    if (hasWords(search, 'cap so nhan', 'csn', 'cong boi', 'bungee', 'nay nguoc', 'qua bong', 'cao su', 'nay len', 'nhiet do', 'ngan da', 'tu lanh', 'to giay', 'cat', 'chong len')) {
      return 'Cấp số nhân (CSN).\n- **Công thức cần nhớ:**\n  + Số hạng tổng quát: $u_n = u_1 \\cdot q^{n-1}$ (với $u_1$ là số hạng đầu, $q$ là công bội).\n  + Tổng $n$ số hạng đầu tiên: $S_n = u_1 \\frac{q^n - 1}{q - 1}$ (với $q \\neq 1$).\n- **Cách giải:** Thiết lập hệ phương trình theo $u_1$ và $q$ bằng phép chia vế theo vế giữa các đẳng thức để triệt tiêu $u_1$ và tìm công bội $q$.';
    }
    if (hasWords(search, 'tang', 'giam', 'don dieu')) {
      return 'Xét tính đơn điệu (tăng/giảm) của dãy số.\n- **Cách giải:** \n  + Xét hiệu $T = u_{n+1} - u_n$. Nếu $T > 0, \\forall n \\in \\mathbb{N}^*$ thì dãy số tăng; nếu $T < 0$ thì dãy số giảm.\n  + Đối với dãy số dương ($u_n > 0$), xét tỉ số $R = \\frac{u_{n+1}}{u_n}$. So sánh $R$ với 1: nếu $R > 1$ thì dãy số tăng; nếu $R < 1$ thì dãy số giảm.';
    }
    return 'Phân tích quy luật của dãy số. Sử dụng phương pháp quy nạp toán học hoặc công thức truy hồi để tìm số hạng tổng quát của dãy số.';
  }

  // 3. Limits & Continuity (Giới hạn, liên tục)
  if (
    topicId.includes('limits_continuity') ||
    hasWords(search, 'lim', 'gioi han', 'lien tuc', 'vo han', 'vo cung', 'tien toi', 'dan toi')
  ) {
    if (hasWords(search, 'lien tuc')) {
      return 'Xét tính liên tục của hàm số tại điểm $x_0$.\n- **Cách giải:** \n  1. Tính $f(x_0)$.\n  2. Tính giới hạn $\\lim_{x \\to x_0} f(x)$ (nếu hàm số chia nhánh, cần tính giới hạn trái $\\lim_{x \\to x_0^-} f(x)$ và giới hạn phải $\\lim_{x \\to x_0^+} f(x)$).\n  3. So sánh: Hàm số liên tục tại $x_0$ khi và chỉ khi $\\lim_{x \\to x_0^-} f(x) = \\lim_{x \\to x_0^+} f(x) = f(x_0)$.';
    }
    if (hasWords(search, 'x dan toi', 'x ->', 'x0')) {
      return 'Tính giới hạn của hàm số tại một điểm $x \\to x_0$.\n- **Cách giải:** Thay trực tiếp $x_0$ vào biểu thức.\n  + Nếu ra giá trị xác định, đó là kết quả giới hạn.\n  + Nếu gặp dạng vô định $\\frac{0}{0}$ chứa đa thức, phân tích tử và mẫu thành nhân tử chứa $(x - x_0)$ để triệt tiêu.\n  + Nếu chứa căn thức, thực hiện nhân lượng liên hợp để khử dạng vô định.';
    }
    return 'Tính giới hạn của dãy số tại vô cực ($n \\to +\\infty$).\n- **Cách giải:** Chia cả tử và mẫu của phân thức cho lũy thừa cao nhất của $n$ (ví dụ $n, n^2, n^3$). Sử dụng giới hạn cơ bản $\\lim \\frac{1}{n^k} = 0$ ($k > 0$).';
  }

  // 4. Grouped Data (Số liệu ghép nhóm)
  if (
    topicId.includes('grouped_data') ||
    hasWords(search, 'ghep nhom', 'trung vi', 'tu phan vi', 'so trung binh', 'tan so', 'tich luy', 'nhom chua mot', 'mot cua mau', 'mot cua bang', 'bang so lieu', 'thong ke', 'do tuoi', 'tuoi tho', 'tham nien')
  ) {
    return 'Mẫu số liệu ghép nhóm.\n- **Cách giải:** \n  1. Xác định cỡ mẫu $N$ và lập bảng tần số tích lũy.\n  2. Để tính trung vị $M_e$: Xác định nhóm $p = [a_p; a_{p+1})$ chứa trung vị (tần số tích lũy lớn hơn hoặc bằng $N/2$). Áp dụng công thức: $M_e = a_p + \\frac{\\frac{N}{2} - CF_{p-1}}{f_p} \\cdot (a_{p+1} - a_p)$.\n  3. Để tính mốt $M_o$: Xác định nhóm chứa mốt (tần số lớn nhất). Áp dụng công thức: $M_o = a_j + \\frac{f_j - f_{j-1}}{(f_j - f_{j-1}) + (f_j - f_{j+1})} \\cdot (a_{j+1} - a_j)$.';
  }

  // 5. Exponential & Logarithm (Hàm số mũ, logarit)
  if (
    topicId.includes('exponential_logarithm') ||
    hasWords(search, 'log', 'logarit', 'luy thua', 'mu')
  ) {
    return 'Hàm số mũ và logarit.\n- **Cách giải:** \n  1. Đặt điều kiện xác định cho logarit (cơ số $a > 0, a \\neq 1$, biểu thức lấy logarit phải dương).\n  2. Biến đổi phương trình hoặc bất phương trình bằng cách đưa về cùng cơ số hoặc đặt ẩn phụ.\n  3. Chú ý các công thức biến đổi logarit cốt lõi: $\\log_a b = c \\Leftrightarrow b = a^c$; $\\log_a (xy) = \\log_a x + \\log_a y$; $\\log_a \\frac{x}{y} = \\log_a x - \\log_a y$; $\\log_a x^k = k \\log_a x$.';
  }

  // 6. Parallelism (Quan hệ song song)
  if (
    topicId.includes('parallelism') ||
    hasWords(search, 'song song', 'thiet dien', 'giao tuyen', 'giao diem', 'mat phang')
  ) {
    if (hasWords(search, 'thiet dien')) {
      return 'Tìm thiết diện của hình chóp cắt bởi mặt phẳng.\n- **Cách giải:** Xác định các giao tuyến của mặt phẳng cắt với các mặt của hình chóp. \n  + Tìm điểm chung thứ nhất của hai mặt phẳng.\n  + Dựa vào quan hệ song song đề bài cho để dựng đường thẳng song song qua điểm chung đó nhằm tìm các giao điểm tiếp theo trên các cạnh.';
    }
    if (hasWords(search, 'giao tuyen')) {
      return 'Tìm giao tuyến của hai mặt phẳng trong không gian.\n- **Cách giải:** \n  + Cách 1: Tìm hai điểm chung phân biệt của hai mặt phẳng. Đường thẳng đi qua hai điểm chung đó chính là giao tuyến.\n  + Cách 2: Tìm một điểm chung và chứng minh hai mặt phẳng chứa hai đường thẳng song song với nhau; giao tuyến sẽ là đường thẳng đi qua điểm chung và song song với hai đường thẳng đó.';
    }
    return 'Dựng hình vẽ không gian chính xác. Áp dụng định lý về đường thẳng song song với mặt phẳng (nếu đường thẳng $d \\not\\subset (P)$ song song với $d\' \\subset (P)$ thì $d \\parallel (P)$) hoặc hai mặt phẳng song song để chứng minh hệ thức song song.';
  }

  // 7. Perpendicularity (Quan hệ vuông góc)
  if (
    topicId.includes('perpendicularity') ||
    hasWords(search, 'vuong goc', 'vuong guc', 'khoang cach', 'goc giua', 'nhi dien', 'nhic dien', 'chieu cao', 'duong cao', 'hinh chieu', 'hinh chop', 'hinh lang tru', 'hinh hop')
  ) {
    if (hasWords(search, 'khoang cach')) {
      return 'Tính khoảng cách trong hình học không gian.\n- **Cách giải:** \n  + Khoảng cách từ điểm $M$ đến mặt phẳng $(P)$: Xác định hình chiếu vuông góc $H$ của $M$ trên $(P)$. Độ dài đoạn $MH$ chính là khoảng cách cần tìm.\n  + Cách dựng chân đường cao $H$: Sử dụng mô hình tam giác vuông hoặc phương pháp thể tích (nếu gián tiếp).';
    }
    if (hasWords(search, 'goc giua', 'goc nhic dien', 'nhi dien', 'goc')) {
      return 'Tính góc trong không gian (góc giữa đường và mặt, hoặc góc giữa hai mặt phẳng).\n- **Cách giải:** \n  + Góc giữa đường thẳng $d$ và mặt phẳng $(P)$: Tìm hình chiếu vuông góc $d\'$ của $d$ trên $(P)$. Góc cần tìm là góc giữa $d$ và $d\'$.\n  + Góc giữa hai mặt phẳng: Xác định giao tuyến $c$. Trong mỗi mặt phẳng, dựng một đường thẳng vuông góc với $c$ tại cùng một điểm. Góc giữa hai đường thẳng đó chính là góc cần tìm.';
    }
    if (hasWords(search, 'vuong goc', 'vuong guc')) {
      return 'Chứng minh quan hệ vuông góc trong không gian.\n- **Cách giải:** \n  + Chứng minh đường thẳng $d$ vuông góc với mặt phẳng $(P)$: Chứng minh $d$ vuông góc với hai đường thẳng cắt nhau cùng nằm trong $(P)$.\n  + Chứng minh hai mặt phẳng vuông góc: Chứng minh mặt phẳng này chứa một đường thẳng vuông góc với mặt phẳng kia.';
    }
    return 'Áp dụng quan hệ vuông góc trong không gian để xác định chân đường cao, tính độ dài các cạnh và các góc bằng cách sử dụng hệ thức lượng trong tam giác vuông.';
  }

  // 8. Probability (Xác suất)
  if (
    topicId.includes('probability') ||
    hasWords(search, 'xac suat', 'bien co', 'doc lap', 'xung khac', 'rut ngau nhien', 'hop dung', 'lay ngau nhien', 'phong van', 'chon ngau nhien', 'lay ra', 'rut ra')
  ) {
    if (hasWords(search, 'xac suat', 'xac suat co dieu kien')) {
      return 'Tính xác suất của biến cố.\n- **Cách giải:** \n  1. Xác định số phần tử của không gian mẫu $n(\\Omega)$ (thường dùng tổ hợp $C_n^k$ hoặc chỉnh hợp).\n  2. Xác định số phần tử của biến cố $A$ là $n(A)$.\n  3. Tính xác suất $P(A) = \\frac{n(A)}{n(\\Omega)}$.\n- **Các quy tắc cần lưu ý:**\n  + Quy tắc cộng: $P(A \\cup B) = P(A) + P(B)$ nếu $A, B$ xung khắc.\n  + Quy tắc nhân: $P(A \\cap B) = P(A) \\cdot P(B)$ nếu $A, B$ độc lập.';
    }
    return 'Xác định phép thử và không gian mẫu. Sử dụng các công thức tổ hợp để đếm số phần tử và áp dụng định nghĩa cổ điển của xác suất.';
  }

  // 9. Derivatives (Đạo hàm)
  if (
    topicId.includes('derivatives') ||
    search.includes('dao ham') || search.includes('tiep tuyen') || search.includes('he so goc')
  ) {
    if (search.includes('tiep tuyen') || search.includes('he so goc')) {
      return 'Viết phương trình tiếp tuyến của đồ thị hàm số $y = f(x)$.\n- **Cách giải:** \n  + Phương trình tiếp tuyến tại tiếp điểm $M(x_0, y_0)$ có dạng: $y - y_0 = f\'(x_0)(x - x_0)$ với $f\'(x_0)$ là hệ số góc.\n  + Nếu đề bài cho biết hệ số góc $k$, giải phương trình $f\'(x_0) = k$ để tìm hoành độ tiếp điểm $x_0$, từ đó tính $y_0 = f(x_0)$.';
    }
    if (search.includes('dao ham')) {
      return 'Tính đạo hàm của hàm số.\n- **Cách giải:** Áp dụng bảng công thức đạo hàm cơ bản (ví dụ $(x^n)\' = n \\cdot x^{n-1}$, $(\\sin x)\' = \\cos x$, $(\\cos x)\' = -\\sin x$) và các quy tắc cộng, trừ, nhân, chia đạo hàm.\n- **Chú ý:** Công thức đạo hàm hàm hợp $[f(u)]\' = f\'(u) \\cdot u\'$.';
    }
  }

  return 'Phân tích dữ liệu đề bài, xác định công thức toán học liên quan đến chuyên đề này và lập các bước tính toán chi tiết.';
}
function buildMath11RecognitionNote(topicId: string, patternTitle: string): string {
  if (topicId.includes('trigonometry')) return 'Nhận dạng góc lượng giác và phương trình lượng giác. Xem xét việc sử dụng công thức lượng giác cơ bản hoặc công thức biến đổi để đơn giản hóa phương trình lượng giác.';
  if (topicId.includes('sequences_progressions')) return 'Xác định quy luật của dãy số (tăng, giảm, bị chặn) và kiểm tra xem dãy số có phải là cấp số cộng hay cấp số nhân thông qua công sai d hoặc công bội q.';
  if (topicId.includes('limits_continuity')) return 'Nhận diện giới hạn dãy số hoặc giới hạn hàm số. Đối với dạng vô định, cần tìm cách khử dạng vô định (chia cho lũy thừa cao nhất, liên hợp, hoặc phân tích thành nhân tử).';
  if (topicId.includes('parallelism')) return 'Nhận diện các đường thẳng và mặt phẳng song song trong không gian. Sử dụng các định lý về đường thẳng song song với mặt phẳng hoặc hai mặt phẳng song song để vẽ thiết diện.';
  if (topicId.includes('grouped_data')) return 'Nhận diện mẫu số liệu ghép nhóm. Cần tìm khoảng chứa trung vị, tứ phân vị, hoặc mốt trước khi tính toán giá trị cụ thể.';
  if (topicId.includes('exponential_logarithm')) return 'Nhận diện lũy thừa, logarit hoặc hàm số mũ/logarit. Đặt điều kiện xác định cho logarit và đưa phương trình/bất phương trình về cùng cơ số.';
  if (topicId.includes('perpendicularity')) return 'Nhận diện quan hệ vuông góc trong không gian (đường vuông góc với mặt, hai mặt vuông góc). Xác định hình chiếu vuông góc để tính khoảng cách và góc.';
  if (topicId.includes('probability')) return 'Xác định các biến cố và phép thử. Sử dụng quy tắc cộng đối với các biến cố xung khắc hoặc quy tắc nhân đối với các biến cố độc lập.';
  if (topicId.includes('derivatives')) return 'Nhận diện đạo hàm của hàm số hoặc tiếp tuyến của đồ thị. Áp dụng quy tắc tính đạo hàm hàm hợp hoặc viết phương trình tiếp tuyến theo hệ số góc.';
  if (topicId.includes('assessment')) return 'Đây là bài toán ôn tập tổng hợp hoặc bồi dưỡng nâng cao. Cần phân loại nhanh câu hỏi thuộc chương nào của chương trình toán 11 trước khi giải.';
  return `Đọc kỹ dạng bài ${patternTitle}, xác định giả thiết và kết luận của bài toán trước khi bắt đầu tính toán.`;
}

function buildMath11TrapNote(topicId: string): string {
  if (topicId.includes('trigonometry')) return 'Cần kiểm tra điều kiện của phương trình lượng giác (ví dụ điều kiện xác định của tanx, cotx) và tránh bỏ sót nghiệm khi giải.';
  if (topicId.includes('sequences_progressions')) return 'Tránh nhầm lẫn công thức tính số hạng tổng quát un và tổng Sn của cấp số cộng/cấp số nhân.';
  if (topicId.includes('limits_continuity')) return 'Khi tính giới hạn vô cực, chú ý dấu của kết quả. Với tính liên tục, phải xét cả giới hạn trái, giới hạn phải và giá trị hàm số.';
  if (topicId.includes('parallelism')) return 'Không ngộ nhận các đường thẳng song song dựa trên hình vẽ phẳng; mọi khẳng định phải dựa trên các định lý hình học không gian.';
  if (topicId.includes('grouped_data')) return 'Tránh nhầm lẫn giữa tần số tích lũy và tần số của nhóm khi áp dụng công thức tính trung vị.';
  if (topicId.includes('exponential_logarithm')) return 'Luôn luôn ghi điều kiện xác định của logarit (cơ số dương và khác 1, biểu thức lấy logarit dương) và chú ý chiều của bất phương trình khi cơ số nhỏ hơn 1.';
  if (topicId.includes('perpendicularity')) return 'Khoảng cách giữa hai đường chéo nhau cần dựng được đoạn vuông góc chung hoặc chuyển về khoảng cách giữa đường và mặt song song.';
  if (topicId.includes('probability')) return 'Tránh nhầm lẫn giữa các biến cố độc lập (dùng quy tắc nhân) và các biến cố xung khắc (dùng quy tắc cộng).';
  if (topicId.includes('derivatives')) return 'Chú ý đạo hàm của hàm hợp (phải nhân thêm u\') và nhớ kiểm tra kỹ tọa độ điểm tiếp điểm khi viết phương trình tiếp tuyến.';
  return 'Kiểm tra kỹ các điều kiện xác định, bước biến đổi biểu thức toán và đơn vị của bài toán thực tế.';
}

function buildMath11SolutionChecklist(topicId: string, level: MathLearningLevel): string {
  const hard = level === 'advanced' || level === 'hsg' ? ' Với bài toán nâng cao hoặc HSG, tìm tính chất đặc biệt, bất đẳng thức phụ hoặc xét trường hợp biên.' : '';
  if (topicId.includes('trigonometry')) return `Áp dụng công thức biến đổi -> rút gọn phương trình -> giải phương trình cơ bản -> kết hợp điều kiện xác định.${hard}`;
  if (topicId.includes('sequences_progressions')) return `Tìm các đại lượng đặc trưng (u1, d, q) -> viết công thức un hoặc Sn -> giải hệ phương trình nếu cần.${hard}`;
  if (topicId.includes('limits_continuity')) return `Phân tích dạng giới hạn -> khử dạng vô định (nếu có) -> tính giới hạn -> xét tính liên tục (nếu yêu cầu).${hard}`;
  if (topicId.includes('parallelism')) return `Xác định các giao tuyến -> chứng minh song song -> tìm thiết diện bằng cách dựng các đường song song.${hard}`;
  if (topicId.includes('grouped_data')) return `Lập bảng số liệu -> tính tần số tích lũy -> xác định nhóm chứa trung vị/tứ phân vị/mốt -> áp dụng công thức tính.${hard}`;
  if (topicId.includes('exponential_logarithm')) return `Đặt điều kiện -> đưa về cùng cơ số hoặc đặt ẩn phụ -> giải phương trình/bất phương trình -> đối chiếu điều kiện.${hard}`;
  if (topicId.includes('perpendicularity')) return `Chứng minh vuông góc -> dựng hình chiếu hoặc mặt phẳng phụ -> tính góc/khoảng cách bằng công thức lượng giác.${hard}`;
  if (topicId.includes('probability')) return `Xác định không gian mẫu -> liệt kê kết quả thuận lợi cho biến cố -> tính xác suất bằng các quy tắc cộng/nhân.${hard}`;
  if (topicId.includes('derivatives')) return `Tính đạo hàm hàm số sơ cấp hoặc hàm hợp -> tính giá trị đạo hàm tại điểm -> viết phương trình tiếp tuyến hoặc giải phương trình đạo hàm.${hard}`;
  return `Đọc đề -> phân tích chuyên đề -> lập các bước giải chi tiết -> tính toán -> đối chiếu điều kiện và kết luận.${hard}`;
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

function cleanVniOcrCorruptions(text: string): string {
  if (!text) return text;
  let res = text;

  const wordReplace = (str: string, target: string, replacement: string): string => {
    const regex = new RegExp(`(?<![a-zA-Z\\u00C0-\\u1EF9])${target}(?![a-zA-Z\\u00C0-\\u1EF9])`, 'g');
    return str.replace(regex, replacement);
  };

  // 1. General VNI letter combinations
  res = res.replace(/(?<![gG])iờ/g, 'iê');
  res = res.replace(/(?<![gG])Iờ/g, 'Iê');
  res = res.replace(/yờ/g, 'yê');
  res = res.replace(/Yờ/g, 'Yê');
  
  // 2. Parentheses corruption in words (e.g. qu)ng, đ), h)y)
  res = res.replace(/([a-zA-Z\u00C0-\u1EF9])\)(?=[a-zA-Z\u00C0-\u1EF9])/g, '$1ã');
  res = wordReplace(res, 'đ\\)', 'đã');
  res = wordReplace(res, 'h\\)y', 'hãy');
  res = wordReplace(res, 'qu\\)ng', 'quãng');

  // 3. VNI character mapping corruptions
  res = res.replace(/õ(?=[uynm])/g, 'â');
  res = res.replace(/Õ(?=[uynm])/g, 'Â');

  res = res.replace(/ỏ(?=[cnhpy]|ch|ng|t)/g, 'á');
  res = res.replace(/Ỏ(?=[cnhpy]|ch|ng|t)/g, 'Á');

  res = res.replace(/ỏo/g, 'ào');

  res = res.replace(/ớ(?=ch|nh|t|a)/g, 'í');
  res = res.replace(/Ớ(?=ch|nh|t|a)/g, 'Í');
  res = res.replace(/ớ(?![a-zA-Z\u00C0-\u1EF9])/g, 'í');
  res = res.replace(/Ớ(?![a-zA-Z\u00C0-\u1EF9])/g, 'Í');

  res = res.replace(/ỡ(?=ch|nh|t|n|m)/g, 'ì');
  res = res.replace(/Ỡ(?=ch|nh|t|n|m)/g, 'Ì');
  res = res.replace(/ỡ(?![a-zA-Z\u00C0-\u1EF9])/g, 'ì');
  res = res.replace(/Ỡ(?![a-zA-Z\u00C0-\u1EF9])/g, 'Ì');

  res = res.replace(/ỳ(?=[cti]|ng)/g, 'ú');

  res = res.replace(/ũ(?=[nm]|ng)/g, 'ò');

  // 4. Specific common words (ê -> ờ / ơ -> ô)
  res = res.replace(/bờn/g, 'bên').replace(/Bờn/g, 'Bên');
  res = res.replace(/trờn/g, 'trên').replace(/Trờn/g, 'Trên');
  res = res.replace(/nờn/g, 'nên').replace(/Nờn/g, 'Nên');
  res = res.replace(/lờn/g, 'lên').replace(/Lờn/g, 'Lên');
  res = res.replace(/tờn/g, 'tên').replace(/Tờt/g, 'Tết');
  res = res.replace(/nờu/g, 'nêu').replace(/Nờu/g, 'Nêu');
  res = res.replace(/đờu/g, 'đều').replace(/Đờu/g, 'Đều');
  res = res.replace(/diờn/g, 'diên').replace(/Diờn/g, 'Diên');

  // Specific common word mappings using Unicode-safe boundaries
  res = wordReplace(res, 'cú', 'có');
  res = wordReplace(res, 'Cú', 'Có');
  res = wordReplace(res, 'đú', 'đó');
  res = wordReplace(res, 'Đú', 'Đó');
  res = wordReplace(res, 'gúc', 'góc');
  res = wordReplace(res, 'Gúc', 'Góc');
  res = wordReplace(res, 'hỡnh', 'hình');
  res = wordReplace(res, 'Hỡnh', 'Hình');
  res = wordReplace(res, 'thỡ', 'thì');
  res = wordReplace(res, 'Tỡm', 'Tìm');
  res = wordReplace(res, 'tỡm', 'tìm');
  res = wordReplace(res, 'gỡ', 'gì');
  res = wordReplace(res, 'lớ', 'lý');
  res = wordReplace(res, 'hải lớ', 'hải lý');
  res = wordReplace(res, 'kilụmột', 'kilômét');
  res = wordReplace(res, 'kilụmet', 'kilômét');
  res = wordReplace(res, 'đỏp', 'đáp');
  res = wordReplace(res, 'Đỏp', 'Đáp');
  res = wordReplace(res, 'Trỏi', 'Trái');
  res = wordReplace(res, 'trỏi', 'trái');
  res = wordReplace(res, 'lỏi', 'lái');
  res = wordReplace(res, 'cỏi', 'cái');
  res = wordReplace(res, 'Cỏi', 'Cái');
  res = wordReplace(res, 'chỳ', 'chú');
  res = wordReplace(res, 'Chỳ', 'Chú');
  res = wordReplace(res, 'giỳp', 'giúp');
  res = wordReplace(res, 'Giỳp', 'Giúp');
  res = wordReplace(res, 'trũ', 'trò');
  res = wordReplace(res, 'vuụng', 'vuông');
  res = wordReplace(res, 'chớn', 'chín');
  res = wordReplace(res, 'lõu', 'lâu');
  res = wordReplace(res, 'Cõu', 'Câu');
  res = wordReplace(res, 'giỏ', 'giá');
  res = wordReplace(res, 'Giỏ', 'Giá');
  res = wordReplace(res, 'giỏsử', 'giả sử');
  res = wordReplace(res, 'Giỏsử', 'Giả sử');
  res = wordReplace(res, 'tỏm', 'tám');
  res = wordReplace(res, 'Tỏm', 'Tám');
  res = wordReplace(res, 'gỏi', 'gói');
  res = wordReplace(res, 'tũa', 'tòa');
  res = wordReplace(res, 'mỏu', 'máu');
  res = wordReplace(res, 'thỏi', 'thải');
  res = wordReplace(res, 'hoỏ', 'hóa');
  res = wordReplace(res, 'hũa', 'hòa');
  res = wordReplace(res, 'lũ', 'lò');
  res = wordReplace(res, 'lũt', 'lọt');
  res = wordReplace(res, 'cũ', 'cò');
  res = wordReplace(res, 'cựng', 'cùng');
  res = wordReplace(res, 'Cựng', 'Cùng');
  res = wordReplace(res, 'centimột', 'centimét');
  res = wordReplace(res, 'gĩy', 'giấy');
  res = res.replace(/đướng/g, 'đường');

  // Fix diên tích -> diện tích
  res = res.replace(/diên tích/g, 'diện tích').replace(/Diên tích/g, 'Diện tích');

  return res;
}

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
