import {
  MATH6_LEARNING_MATRIX,
  type Math6Pattern,
  type Math6TopicPlan,
} from './math6-plan';
import { generateMath6GeometryFigure, needsOriginalGeometryImage } from './math6-geometry-figures';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math6RawSource {
  fileName: string;
  relativePath?: string;
  path?: string;
  extension?: string;
  text: string;
  richExtraction?: boolean;
  formulaAssetCount?: number;
  formulaAssets?: Math6FormulaAsset[];
  assetBasePath?: string;
  rawOleMarkerCount?: number;
  error?: string;
}

export interface Math6FormulaAsset {
  src: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  fileName?: string;
  copied?: boolean;
  source?: string;
}

export interface Math6ExtractedBlock {
  id: string;
  prompt: string;
  sourceFile: string;
  sourcePath?: string;
  topicId: string;
  patternId: string;
  level: MathLearningLevel;
  confidence: number;
}

export interface Math6ImportIssue {
  code: string;
  severity: 'warning' | 'blocker';
  message: string;
  sourceFile?: string;
  topicId?: string;
}

export interface Math6ImportReport {
  schemaVersion: 'math6_import_v1';
  generatedAt: string;
  inputSources: number;
  mappedSources: number;
  unmappedSources: string[];
  extractedBlocks: number;
  convertedItems: number;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  issues: Math6ImportIssue[];
}

interface TopicMatch {
  topic: Math6TopicPlan;
  confidence: number;
}

interface Math6PromptFormulaAsset {
  src: string;
  width?: number;
  height?: number;
  alt: string;
}

const EXERCISE_HEADER_PATTERN = /(?:^|[\r\n\f]|[^\p{L}])\s*((?:B[\p{L}\u00a0]{0,3}i|C[\p{L}\u00a0]{0,3}u)(?:\s+t[\p{L}\u00a0]{0,3}p)?\s*\d+[A-Za-zÀ-ỹ0-9\s]*[:.)-]?)/giu;
const FORMULA_TOKEN_RE = /\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g;

export function buildMath6QuestionItemsFromRawSources(rawSources: Math6RawSource[]): { items: QuestionItem[]; blocks: Math6ExtractedBlock[]; report: Math6ImportReport } {
  const issues: Math6ImportIssue[] = [];
  const blocks: Math6ExtractedBlock[] = [];
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

    const topicMatch = matchMath6TopicForSource(source);
    const sourceBlocks = extractMath6ExerciseBlocks(source.text);
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
    const topic = MATH6_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const generatedFigure = generateMath6GeometryFigure(block.prompt, block.topicId);
    const needsOriginalImage = needsOriginalGeometryImage(block.prompt);
    const formulaAssets = extractFormulaAssets(block.prompt);
    return {
      id: `math6.${block.id}`,
      sourceId: block.id,
      source: 'math6_local_source',
      domainId: 'mathematics',
      programIds: topic?.programIds || ['vn_math_6', 'vn_math_thcs'],
      conceptIds: pattern?.conceptIds?.length ? pattern.conceptIds : topic?.conceptIds || ['math.natural_number_set'],
      skillIds: pattern?.skillIds?.length ? pattern.skillIds : topic?.skillIds || ['math.work_with_sets_natural_numbers'],
      misconceptionIds: [],
      type: 'open_response',
      prompt: block.prompt,
      correctAnswer: null,
      difficulty: difficultyForLevel(block.level),
      cognitiveLevel: pattern?.cognitiveLevel || (block.level === 'foundation' ? 'understand' : block.level === 'core' ? 'apply' : 'analyze'),
      tags: uniqueStrings([
        'math6',
        topic?.strand || '',
        topic?.unit || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`,
        formulaAssets.length ? 'formula:recovered_asset' : '',
        generatedFigure ? 'figure:generated' : '',
        needsOriginalImage && !generatedFigure ? 'figure:needs_original' : '',
      ]),
      metadata: {
        grade: 6,
        semester: topic?.semester,
        strand: topic?.strand,
        unit: topic?.unit,
        topicId: block.topicId,
        patternId: block.patternId,
        level: block.level,
        sourceFile: block.sourceFile,
        sourcePath: block.sourcePath || '',
        importConfidence: block.confidence,
        formulaAssets,
        formulaAssetCount: formulaAssets.length,
        formulaStatus: formulaAssets.length ? 'recovered_asset' : 'none',
        generatedFigure,
        figureStatus: generatedFigure ? 'generated_svg' : needsOriginalImage ? 'needs_original_image' : 'none',
      },
    };
  });

  return {
    items,
    blocks,
    report: buildReport(rawSources, mappedSources, unmappedSources, blocks, items, issues),
  };
}

export function extractMath6ExerciseBlocks(text: string): string[] {
  const normalized = normalizeExtractedText(text);
  const matches = [...normalized.matchAll(EXERCISE_HEADER_PATTERN)];
  if (!matches.length) return [];

  const blocks: string[] = [];
  matches.forEach((match, index) => {
    const start = getExerciseHeaderStart(match);
    const next = matches[index + 1] ? getExerciseHeaderStart(matches[index + 1]) : normalized.length;
    const block = normalizePrompt(normalized.slice(start, next));
    if (isUsefulExerciseBlock(block)) blocks.push(block);
  });

  return blocks;
}

function getExerciseHeaderStart(match: RegExpMatchArray): number {
  const fullMatch = match[0] || '';
  const header = match[1] || '';
  const offset = header ? fullMatch.indexOf(header) : 0;
  return (match.index || 0) + Math.max(0, offset);
}

export function matchMath6TopicForSource(source: Math6RawSource): TopicMatch | undefined {
  const relativePath = normalizePath(source.relativePath || source.fileName);
  const basename = normalizePath(source.fileName);

  for (const topic of MATH6_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((file) => normalizePath(file.fileName) === relativePath || normalizePath(file.fileName).endsWith(`/${basename}`))) {
      return { topic, confidence: 1 };
    }
  }

  const inferred = inferTopicFromFileName(relativePath || basename);
  return inferred ? { topic: inferred, confidence: 0.72 } : undefined;
}

function buildReport(
  rawSources: Math6RawSource[],
  mappedSources: number,
  unmappedSources: string[],
  blocks: Math6ExtractedBlock[],
  items: QuestionItem[],
  issues: Math6ImportIssue[],
): Math6ImportReport {
  return {
    schemaVersion: 'math6_import_v1',
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

function inferPattern(topic: Math6TopicPlan, prompt: string): Math6Pattern {
  const normalizedPrompt = normalizeSearchText(prompt);
  const scored = topic.patterns.map((pattern) => {
    const searchable = normalizeSearchText(`${pattern.title} ${pattern.tags.join(' ')}`);
    const score = searchable
      .split(/\s+/)
      .filter((token) => token.length >= 3 && normalizedPrompt.includes(token)).length;
    return { pattern, score };
  });
  scored.sort((a, b) => b.score - a.score || levelRank(a.pattern.level) - levelRank(b.pattern.level));
  return scored[0]?.pattern || topic.patterns[0];
}

function inferTopicFromFileName(value: string): Math6TopicPlan | undefined {
  const text = normalizeSearchText(value);

  if (text.includes('day so') || text.includes('quy luat')) return find('math6.advanced.sequence_patterns');
  if (text.includes('chinh phuong') || text.includes('tan cung')) return find('math6.advanced.divisibility_hsg');
  if (text.includes('hsg') || text.includes('olympic') || text.includes('violimpic')) return find('math6.advanced.divisibility_hsg');
  if (text.includes('tap hop')) return find('math6.number.sets_natural_numbers');
  if (text.includes('phep toan') || text.includes('so tu nhien')) return find('math6.number.natural_operations');
  if (text.includes('luy thua')) return find('math6.number.powers_order_operations');
  if (text.includes('chia het')) return find('math6.number.divisibility');
  if (text.includes('ucln') || text.includes('bcnn') || text.includes('uoc') || text.includes('boi') || text.includes('nguyen to') || text.includes('thua so')) return find('math6.number.prime_factor_gcd_lcm');
  if (text.includes('so nguyen') || text.includes('cong tru so nguyen')) return find('math6.number.integers_intro');
  if (text.includes('diem') || text.includes('duong thang') || text.includes('tia') || text.includes('doan thang') || text.includes('trung diem')) return find('math6.geometry.points_lines_segments');
  if (text.includes('ba dang')) return find('math6.number.fraction_three_basic_problems');
  if (text.includes('hon so') || text.includes('thap phan') || text.includes('phan tram')) return find('math6.number.decimal_percent');
  if (text.includes('phan so')) return find('math6.number.fraction_foundation');
  if (text.includes('goc')) return find('math6.geometry.angles');
  return undefined;
}

function inferTopicForExercise(prompt: string, source: Math6RawSource): TopicMatch | undefined {
  const text = normalizeSearchText(prompt);
  const sourceText = normalizeSearchText(`${source.relativePath || ''} ${source.fileName || ''}`);
  const hsgSource = /\b(hsg|olympic|violimpic)\b/.test(sourceText);
  const semester2Source = sourceText.includes('ki-ii') || sourceText.includes('ki 2') || sourceText.includes('ky 2') || sourceText.includes('hoc ki 2') || sourceText.includes('hoc-ki-2');

  if (text.includes('goc') || text.includes('phan giac') || text.includes('ke bu') || text.includes('nua mat phang')) {
    return topicMatch('math6.geometry.angles', 0.9);
  }

  if (text.includes('diem') || text.includes('duong thang') || text.includes('tia') || text.includes('doan thang') || text.includes('trung diem') || text.includes('thang hang')) {
    return topicMatch('math6.geometry.points_lines_segments', 0.88);
  }

  if (text.includes('tap hop') || text.includes('phan tu') || text.includes('{')) {
    return topicMatch('math6.number.sets_natural_numbers', 0.86);
  }

  if (text.includes('phan tram') || text.includes('%') || text.includes('ti so') || text.includes('ty so') || text.includes('thap phan') || text.includes('hon so')) {
    return topicMatch('math6.number.decimal_percent', 0.86);
  }

  if (text.includes('phan so') || text.includes('rut gon') || text.includes('quy dong') || text.includes('tu so') || text.includes('mau so')) {
    return topicMatch('math6.number.fraction_foundation', 0.86);
  }

  if (text.includes('luy thua') || text.includes('chu so tan cung')) {
    return topicMatch(hsgSource ? 'math6.advanced.divisibility_hsg' : 'math6.number.powers_order_operations', 0.86);
  }

  if (text.includes('chinh phuong') || text.includes('dong du') || text.includes('so du') || text.includes('tan cung')) {
    return topicMatch('math6.advanced.divisibility_hsg', 0.86);
  }

  if (text.includes('chia het') || text.includes('uoc') || text.includes('boi') || text.includes('ucln') || text.includes('bcnn') || text.includes('nguyen to') || text.includes('thua so')) {
    if (hsgSource || text.includes('chung minh')) return topicMatch('math6.advanced.divisibility_hsg', 0.84);
    if (text.includes('ucln') || text.includes('bcnn') || text.includes('uoc chung') || text.includes('boi chung') || text.includes('nguyen to') || text.includes('thua so')) {
      return topicMatch('math6.number.prime_factor_gcd_lcm', 0.86);
    }
    return topicMatch('math6.number.divisibility', 0.86);
  }

  if (text.includes('so nguyen') || text.includes('so am') || text.includes('so duong') || text.includes('gia tri tuyet doi')) {
    return topicMatch('math6.number.integers_intro', 0.86);
  }

  if (text.includes('day so') || text.includes('quy luat') || text.includes('lien tiep')) {
    return topicMatch(hsgSource ? 'math6.advanced.sequence_patterns' : 'math6.number.natural_operations', 0.82);
  }

  if (text.includes('tim x') || text.includes('thuc hien phep tinh') || text.includes('tinh nhanh') || text.includes('tinh hop') || text.includes('gia tri bieu thuc')) {
    return topicMatch(semester2Source ? 'math6.number.fraction_operations' : 'math6.number.natural_operations', 0.74);
  }

  if (hsgSource) return topicMatch('math6.advanced.divisibility_hsg', 0.68);
  return undefined;
}

function topicMatch(id: string, confidence: number): TopicMatch | undefined {
  const topic = find(id);
  return topic ? { topic, confidence } : undefined;
}

function find(id: string): Math6TopicPlan | undefined {
  return MATH6_LEARNING_MATRIX.find((topic) => topic.id === id);
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

function extractFormulaAssets(prompt: string): Math6PromptFormulaAsset[] {
  const assets: Math6PromptFormulaAsset[] = [];
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
  return decodeLegacyVietnameseText(text)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function isUsefulExerciseBlock(block: string): boolean {
  if (block.length < 24) return false;
  if (block.length > 2600) return false;
  const lowered = normalizeSearchText(block);
  if (lowered.includes('dap an') && lowered.length < 120) return false;
  if (lowered.includes('huong dan giai') && lowered.length < 120) return false;
  return true;
}

function buildBlockId(topicId: string, sourceFile: string, index: number): string {
  const sourceSlug = slug(sourceFile);
  return `${slug(topicId.replace(/^math6\./, ''))}.${sourceSlug.slice(0, 40)}.${shortHash(sourceFile)}.${String(index).padStart(3, '0')}`;
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
