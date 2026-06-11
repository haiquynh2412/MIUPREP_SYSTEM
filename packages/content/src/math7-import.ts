import {
  MATH7_LEARNING_MATRIX,
  type Math7Pattern,
  type Math7TopicPlan,
  type Math7SourceKind,
} from './math7-plan';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math7RawSource {
  fileName: string;
  relativePath?: string;
  path?: string;
  extension?: string;
  text: string;
  richExtraction?: boolean;
  formulaAssetCount?: number;
  formulaAssets?: Math7FormulaAsset[];
  assetBasePath?: string;
  rawOleMarkerCount?: number;
  error?: string;
  parsedBlocks?: Array<{
    header: string;
    prompt: string;
    solution: string;
    dang: string;
    method: string;
  }>;
}

export interface Math7FormulaAsset {
  src: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  fileName?: string;
  copied?: boolean;
  source?: string;
}

export interface Math7ExtractedBlock {
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
  hsgDang?: string;
  hsgMethod?: string;
}

export interface Math7ImportIssue {
  code: string;
  severity: 'warning' | 'blocker';
  message: string;
  sourceFile?: string;
  topicId?: string;
}

export interface Math7ImportReport {
  schemaVersion: 'math7_import_v1';
  generatedAt: string;
  inputSources: number;
  mappedSources: number;
  unmappedSources: string[];
  extractedBlocks: number;
  convertedItems: number;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  issues: Math7ImportIssue[];
}

interface TopicMatch {
  topic: Math7TopicPlan;
  confidence: number;
}

interface Math7PromptFormulaAsset {
  src: string;
  width?: number;
  height?: number;
  alt: string;
}

interface TextSection {
  number: number;
  title: string;
  text: string;
}

const EXERCISE_HEADER_PATTERN = /(?:^|[\r\n\f]|[^\p{L}])\s*((?:B[\p{L}\u00a0]{0,3}i|C[\p{L}\u00a0]{0,3}u)(?:\s+t[\p{L}\u00a0]{0,3}p)?\s*\d+[A-Za-zÀ-ỹ0-9\s]*[:.)-]?)/giu;
const FORMULA_TOKEN_RE = /\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g;

const SOLUTION_SECTION_MARKER = /(?:L\u1edcI GI\u1ea2I V\u00c0 \u0110\u00c1P \u00c1N|L\u1eddi gi\u1ea3i v\u00e0 \u0111\u00e1p \u00e1n|H\u01af\u1edaNG D\u1eaaN GI\u1ea2I|H\u01b0\u1edbng d\u1eabn gi\u1ea3i|\u0110\u00c1P \u00c1N|\u0110\u00e1p \u00e1n)/i;
const PRACTICE_BOUNDARY_RE = /(?:B\u00c0I T\u1eacP T\u1ef0 LUY\u1ec2N|B\u00e0i t\u1eadp t\u1ef1 luy\u1ec7n|C\.\s*B\u00c0I T\u1eacP T\u1ef0 LUY\u1ec2N|II\.\s*B\u00c0I T\u1eacP T\u1ef0 LUY\u1ec2N|III\.\s*B\u00c0I T\u1eacP T\u1ef0 LUY\u1ec2N|luy\u1ec7n t\u1eadp)/i;
const MAIN_SECTION_RE = /(?:^|[\r\n\f])\s*(B\u00e0i\s+(\d+)(?:\.[\t ]*[\p{Lu}\p{Mn} \t,+-]{3,}|:[\t ]*[\p{Lu}\p{Mn} \t,+-]{3,}))/gu;

export function buildMath7QuestionItemsFromRawSources(rawSources: Math7RawSource[]): { items: QuestionItem[]; blocks: Math7ExtractedBlock[]; report: Math7ImportReport } {
  const issues: Math7ImportIssue[] = [];
  const blocks: Math7ExtractedBlock[] = [];
  const unmappedSources: string[] = [];
  let mappedSources = 0;

  const seenFiles = new Set<string>();
  const uniqueRawSources: Math7RawSource[] = [];
  for (const src of rawSources) {
    const key = src.relativePath || src.fileName;
    if (!seenFiles.has(key)) {
      seenFiles.add(key);
      uniqueRawSources.push(src);
    }
  }

  const hsgSources = uniqueRawSources.filter((s) => s.parsedBlocks && s.parsedBlocks.length > 0);
  const standardRawSources = uniqueRawSources.filter((s) => !s.parsedBlocks || s.parsedBlocks.length === 0);

  const sourcesByTopic = new Map<string, Math7RawSource[]>();
  standardRawSources.forEach((source) => {
    if (source.error) {
      issues.push({
        code: 'source.extract_error',
        severity: 'warning',
        message: source.error,
        sourceFile: source.relativePath || source.fileName,
      });
      return;
    }

    const topicMatch = matchMath7TopicForSource(source);
    if (topicMatch) {
      const topicId = topicMatch.topic.id;
      if (!sourcesByTopic.has(topicId)) {
        sourcesByTopic.set(topicId, []);
      }
      sourcesByTopic.get(topicId)!.push(source);
    } else {
      unmappedSources.push(source.relativePath || source.fileName);
    }
  });

  const processedSources = new Set<string>();

  sourcesByTopic.forEach((topicSources, topicId) => {
    const practiceFiles = topicSources.filter(s => {
      const name = normalizeSearchText(s.fileName);
      return name.includes('dap an') || name.includes('dap-an') || name.includes('da-an') || name.includes('huong dan') || name.includes('hdsg');
    });
    const lessonFiles = topicSources.filter(s => !practiceFiles.includes(s));

    let lessonText = '';
    let practiceText = '';
    let lessonSource: Math7RawSource | undefined;

    if (lessonFiles.length) {
      lessonSource = lessonFiles[0];
      lessonText = lessonSource.text;
      processedSources.add(lessonSource.relativePath || lessonSource.fileName);
      mappedSources += 1;

      if (practiceFiles.length) {
        const practiceSource = practiceFiles[0];
        practiceText = practiceSource.text;
        processedSources.add(practiceSource.relativePath || practiceSource.fileName);
        mappedSources += 1;
      }
    } else if (practiceFiles.length) {
      lessonSource = practiceFiles[0];
      lessonText = lessonSource.text;
      processedSources.add(lessonSource.relativePath || lessonSource.fileName);
      mappedSources += 1;
    }

    if (!lessonSource) return;

    if (practiceText === '') {
      const match = lessonText.match(SOLUTION_SECTION_MARKER);
      if (match && typeof match.index === 'number') {
        practiceText = lessonText.slice(match.index);
        lessonText = lessonText.slice(0, match.index);
      }
    }

    const lessonSections = parseSections(lessonText);
    const practiceSections = parseSections(practiceText);

    let fileBlockIndex = 0;

    lessonSections.forEach((lessonSec) => {
      const practiceSec = practiceSections.find((ps) => ps.number === lessonSec.number)
        || (lessonSec.number === 0 ? practiceSections[0] : undefined);
      
      const practiceSecText = practiceSec ? practiceSec.text : '';

      let theoryText = '';
      let sectionPracticeText = '';
      const boundaryMatch = lessonSec.text.match(PRACTICE_BOUNDARY_RE);
      if (boundaryMatch && typeof boundaryMatch.index === 'number') {
        theoryText = lessonSec.text.slice(0, boundaryMatch.index);
        sectionPracticeText = lessonSec.text.slice(boundaryMatch.index);
      } else {
        theoryText = lessonSec.text;
        sectionPracticeText = '';
      }

      const theoryPrompts = extractMath7ExerciseBlocks(theoryText);
      const practicePrompts = extractMath7ExerciseBlocks(sectionPracticeText);
      const answerPrompts = extractMath7AnswerBlocks(practiceSecText);

      const inferredTopic = matchMath7TopicForText(lessonSec.title || (theoryPrompts[0] || ''));
      const inferredTopicId = inferredTopic.id;

      const sectionTheoryBlocks: Math7ExtractedBlock[] = theoryPrompts
        .filter((prompt) => !hasBlankFormulaShape(prompt))
        .map((prompt) => {
          const pattern = inferPattern(inferredTopic, prompt);
          fileBlockIndex += 1;
          return {
            id: buildBlockId(inferredTopicId, lessonSource!.relativePath || lessonSource!.fileName, fileBlockIndex),
            prompt,
            sourceFile: lessonSource!.relativePath || lessonSource!.fileName,
            sourcePath: lessonSource!.path,
            topicId: inferredTopicId,
            patternId: pattern.id,
            level: pattern.level,
            confidence: 1.0,
          };
        });

      const sectionPracticeBlocks: Math7ExtractedBlock[] = practicePrompts
        .filter((prompt) => !hasBlankFormulaShape(prompt))
        .map((prompt) => {
          const pattern = inferPattern(inferredTopic, prompt);
          fileBlockIndex += 1;
          return {
            id: buildBlockId(inferredTopicId, lessonSource!.relativePath || lessonSource!.fileName, fileBlockIndex),
            prompt,
            sourceFile: lessonSource!.relativePath || lessonSource!.fileName,
            sourcePath: lessonSource!.path,
            topicId: inferredTopicId,
            patternId: pattern.id,
            level: pattern.level,
            confidence: 1.0,
          };
        });

      alignBlocks(sectionPracticeBlocks, answerPrompts);

      blocks.push(...sectionTheoryBlocks);
      blocks.push(...sectionPracticeBlocks);
    });

    if (fileBlockIndex === 0) {
      issues.push({
        code: 'source.no_exercise_blocks',
        severity: 'warning',
        message: 'No exercise blocks were detected in this source.',
        sourceFile: lessonSource.relativePath || lessonSource.fileName,
        topicId,
      });
    }
  });

  hsgSources.forEach((source) => {
    if (source.error) {
      issues.push({
        code: 'source.extract_error',
        severity: 'warning',
        message: source.error,
        sourceFile: source.relativePath || source.fileName,
      });
      return;
    }

    if (!matchMath7TopicForSource(source)) {
      unmappedSources.push(source.relativePath || source.fileName);
      return;
    }

    mappedSources += 1;
    processedSources.add(source.relativePath || source.fileName);

    if (!source.parsedBlocks) return;

    source.parsedBlocks.forEach((parsedBlock, idx) => {
      const prompt = normalizePrompt(parsedBlock.prompt);
      const solution = normalizePrompt(parsedBlock.solution);
      if (hasBlankFormulaShape(prompt) || hasBlankFormulaShape(solution)) {
        return;
      }
      const inferredTopic = matchMath7TopicForText(`${parsedBlock.dang} ${parsedBlock.prompt}`);
      const pattern = inferPatternForHsg(inferredTopic, parsedBlock);
      const inferredTopicId = inferredTopic.id;
      const blockId = buildBlockId(inferredTopicId, source.relativePath || source.fileName, idx + 1);

      const fileKind = getSourceFileKind(inferredTopic, source.fileName);
      const level = fileKind === 'hsg' ? 'hsg' : (pattern.level === 'hsg' ? 'advanced' : pattern.level);

      blocks.push({
        id: blockId,
        prompt: prompt,
        sourceSolution: solution,
        sourceAnswer: extractShortAnswer(solution),
        sourceFile: source.relativePath || source.fileName,
        sourcePath: source.path,
        topicId: inferredTopicId,
        patternId: pattern.id,
        level,
        confidence: 1.0,
        hsgDang: parsedBlock.dang,
        hsgMethod: parsedBlock.method,
      });
    });
  });

  rawSources.forEach((source) => {
    const key = source.relativePath || source.fileName;
    if (!processedSources.has(key) && !unmappedSources.includes(key)) {
      unmappedSources.push(key);
    }
  });

  const items = blocks.map((block): QuestionItem => {
    const topic = MATH7_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const formulaAssets = extractFormulaAssets(block.prompt);
    return {
      id: `math7.${block.id}`,
      sourceId: block.id,
      source: 'math7_local_source',
      domainId: 'mathematics',
      programIds: topic?.programIds || ['vn_math_7', 'vn_math_thcs'],
      conceptIds: pattern?.conceptIds?.length ? pattern.conceptIds : topic?.conceptIds || ['math.rational_number'],
      skillIds: pattern?.skillIds?.length ? pattern.skillIds : topic?.skillIds || ['math.compute_rational'],
      misconceptionIds: [],
      type: 'open_response',
      prompt: block.prompt,
      correctAnswer: block.sourceAnswer || null,
      explanation: buildMath7Explanation(topic, pattern, block),
      difficulty: difficultyForLevel(block.level),
      cognitiveLevel: pattern?.cognitiveLevel || (block.level === 'foundation' ? 'understand' : block.level === 'core' ? 'apply' : 'analyze'),
      tags: uniqueStrings([
        'math7',
        topic?.strand || '',
        topic?.unit || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`,
        formulaAssets.length ? 'formula:recovered_asset' : '',
      ]),
      metadata: {
        grade: 7,
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

export function extractMath7ExerciseBlocks(text: string): string[] {
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

export function extractMath7AnswerBlocks(text: string): string[] {
  const normalized = normalizeExtractedText(text);
  const matches = [...normalized.matchAll(EXERCISE_HEADER_PATTERN)];
  if (!matches.length) return [];

  const blocks: string[] = [];
  matches.forEach((match, index) => {
    const start = getExerciseHeaderStart(match);
    const next = matches[index + 1] ? getExerciseHeaderStart(matches[index + 1]) : normalized.length;
    const block = normalizePrompt(normalized.slice(start, next));
    if (block.length >= 10 && block.length <= 4500) blocks.push(block);
  });

  return blocks;
}

function getExerciseHeaderStart(match: RegExpMatchArray): number {
  const fullMatch = match[0] || '';
  const header = match[1] || '';
  const offset = header ? fullMatch.indexOf(header) : 0;
  return (match.index || 0) + Math.max(0, offset);
}

export function matchMath7TopicForSource(source: Math7RawSource): TopicMatch | undefined {
  const cleanSourcePath = cleanFileNameForMatch(source.relativePath || source.fileName);
  const cleanSourceBase = cleanFileNameForMatch(source.fileName);

  for (const topic of MATH7_LEARNING_MATRIX) {
    if (topic.sourceFiles.some((file) => {
      const cleanFile = cleanFileNameForMatch(file.fileName);
      return cleanFile === cleanSourcePath || cleanSourcePath.endsWith(cleanFile) || cleanFile.endsWith(cleanSourceBase);
    })) {
      return { topic, confidence: 1 };
    }
  }

  const inferred = inferTopicFromFileName(cleanSourcePath || cleanSourceBase);
  return inferred ? { topic: inferred, confidence: 0.72 } : undefined;
}

function cleanFileNameForMatch(value: string): string {
  return normalizeSearchText(value).replace(/\\/g, '/').replace(/[^a-z0-9]/g, '');
}

function parseSections(text: string): TextSection[] {
  const matches = [...text.matchAll(MAIN_SECTION_RE)];
  if (!matches.length) {
    return [{ number: 0, title: '', text }];
  }

  const sections: TextSection[] = [];
  matches.forEach((match, index) => {
    const sectionNum = Number(match[2] || 0);
    const title = match[1] || '';
    const start = match.index || 0;
    const next = matches[index + 1] ? (matches[index + 1].index || 0) : text.length;
    sections.push({
      number: sectionNum,
      title,
      text: text.slice(start, next),
    });
  });

  return sections;
}

function alignBlocks(exercises: Math7ExtractedBlock[], answers: string[]): void {
  if (!answers.length) return;

  const answerMap = new Map<string, string>();
  answers.forEach((ansText) => {
    const label = extractBlockLabel(ansText);
    if (label) {
      answerMap.set(label, ansText);
    }
  });

  exercises.forEach((exe, index) => {
    const label = extractBlockLabel(exe.prompt);
    let matchedAnswer: string | undefined;
    if (label) {
      matchedAnswer = answerMap.get(label);
    }
    if (!matchedAnswer) {
      matchedAnswer = answers[index];
    }
    if (matchedAnswer) {
      exe.sourceSolution = matchedAnswer;
      exe.sourceAnswer = extractShortAnswer(matchedAnswer);
    }
  });
}

function extractBlockLabel(prompt: string): string | undefined {
  const norm = normalizeSearchText(prompt);
  const match = norm.match(/^(?:bai|cau)\s*(\d+)/i);
  return match ? `${match[0]}` : undefined;
}

function extractShortAnswer(solutionText: string): string | undefined {
  const text = normalizePrompt(solutionText);
  const answerMatch = text.match(/(?:dap\s*an|dap\s*so|ket\s*qua|vay|do\s*do|suy\s*ra)[^.!?]{0,180}[.!?]?/i);
  const answer = normalizePrompt(answerMatch?.[0] || '');
  if (answer.length >= 8) return answer.slice(0, 320);
  return undefined;
}

function buildMath7Explanation(topic: Math7TopicPlan | undefined, pattern: Math7Pattern | undefined, block: Math7ExtractedBlock): Record<string, unknown> {
  if (block.hsgDang || block.level === 'hsg') {
    return buildHsgExplanation(topic, pattern, block);
  }
  const recognition = buildMath7RecognitionNote(topic?.id || block.topicId, pattern?.id || block.patternId);
  const strategy = buildMath7StrategyNote(topic?.id || block.topicId, pattern?.level || block.level);
  const sourceSolution = block.sourceSolution ? block.sourceSolution : '';
  const isHard = block.level === 'advanced' || block.level === 'hsg';

  return {
    source: 'math7_local_source',
    sourceSolutionStatus: sourceSolution ? 'source_solution' : 'missing_source_solution',
    thinking: `${recognition} ${strategy}`,
    recognition,
    strategy,
    steps: sourceSolution || 'Nguồn chưa có lời giải chi tiết cho bài này. Hãy áp dụng phương pháp nhận diện và chiến lược giải để thực hiện các bước.',
    answer: block.sourceAnswer || null,
    hardProblemLens: isHard ? buildMath7HardProblemLens(topic?.id || block.topicId) : '',
  };
}

function buildHsgExplanation(
  topic: Math7TopicPlan | undefined,
  _pattern: Math7Pattern | undefined,
  block: Math7ExtractedBlock
): Record<string, unknown> {
  const topicId = topic?.id || block.topicId;
  const dang = block.hsgDang || 'Phương pháp nâng cao';
  const method = block.hsgMethod ? block.hsgMethod.trim() : '';
  
  let observation = '';
  if (topicId.includes('rational_numbers')) {
    observation = 'Quan sát cấu trúc biểu thức số hữu tỉ, quy luật tử số và mẫu số để nhóm hạng tử hoặc giản ước chéo (triệt tiêu liên tiếp).';
  } else if (topicId.includes('real_numbers')) {
    observation = 'Quan sát điều kiện có nghĩa của căn thức hoặc giá trị tuyệt đối. Chú ý tính không âm để đánh giá chặn hoặc xét khoảng giá trị của biến.';
  } else if (topicId.includes('angles_parallel_lines')) {
    observation = 'Xác định các cặp đường thẳng song song hoặc tia phân giác liên quan. Khi thiếu giả thiết, nghĩ ngay đến việc kẻ thêm đường thẳng song song phụ.';
  } else if (topicId.includes('congruent_triangles')) {
    observation = 'Phân tích các đoạn thẳng hoặc góc bằng nhau. Sử dụng các trường hợp bằng nhau để chứng minh các yếu tố khác. Chú ý vẽ thêm đường phụ tạo tam giác bằng nhau hoặc kéo dài trung tuyến.';
  } else if (topicId.includes('ratios_proportions')) {
    observation = 'Quan sát dãy tỉ số bằng nhau. Thực hiện đặt k làm hằng số chung (phương pháp đặt k) hoặc áp dụng linh hoạt tính chất dãy tỉ số để triệt tiêu biến.';
  } else if (topicId.includes('expressions_polynomials')) {
    observation = 'Quan sát bậc lớn nhất và hệ số của đa thức. Áp dụng định lý Bézout hoặc nghiệm của đa thức để chia đa thức có dư hoặc phân tích đa thức nâng cao.';
  } else if (topicId.includes('triangle_relations')) {
    observation = 'Quan sát quan hệ giữa đường cao, trung tuyến, phân giác và cạnh đối diện. Sử dụng bất đẳng thức tam giác hoặc tính chất đồng quy để tìm cực trị hình học hoặc chứng minh đồng quy thẳng hàng.';
  } else {
    observation = 'Đọc kỹ giả thiết bài toán bồi dưỡng HSG, nhận diện các đặc trưng số học hoặc hình học để định hướng phương pháp biến đổi.';
  }

  const thinking = `**1. Cách quan sát & Nhận diện:**\n${observation}\n\n**2. Hướng tư duy & Phương pháp:**\nÁp dụng kiến thức chuyên đề **${dang}**.\n${method ? `${method}` : 'Biến đổi nâng cao hoặc sử dụng giả thiết trung gian để tìm cách giải quyết yêu cầu bài toán.'}`;

  const steps = block.sourceSolution
    ? block.sourceSolution.trim()
    : 'Chưa có lời giải chi tiết. Hãy áp dụng phương pháp nhận diện và định hướng tư duy trên để giải bài toán.';

  const hardProblemLens = `**Lăng kính chuyên đề Học sinh giỏi (${dang}):**\n${method ? `${method}\n` : ''}Hãy tập trung phân tích kỹ tính chất đối xứng, quy luật biến đổi tuần hoàn, hoặc các định lý hình học phụ trợ. Đây là mấu chốt để tìm ra hướng đi nhanh nhất.`;

  return {
    source: 'math7_local_source',
    sourceSolutionStatus: block.sourceSolution ? 'source_solution' : 'missing_source_solution',
    thinking,
    recognition: dang,
    strategy: method || 'Biến đổi nâng cao',
    steps,
    answer: block.sourceAnswer || null,
    hardProblemLens,
  };
}

function buildMath7RecognitionNote(topicId: string, patternId: string): string {
  if (topicId.includes('rational_numbers')) {
    return 'Nhận diện: Các phép toán trên số hữu tỉ, lũy thừa số hữu tỉ. Cần rút gọn biểu thức hoặc tìm x bằng cách đưa về cùng cơ số/số mũ.';
  }
  if (topicId.includes('real_numbers')) {
    return 'Nhận diện: Căn bậc hai số học, giá trị tuyệt đối. Cần xét các trường hợp biến để phá dấu giá trị tuyệt đối hoặc so sánh căn thức.';
  }
  if (topicId.includes('angles_parallel_lines')) {
    return 'Nhận diện: Tính số đo góc hoặc chứng minh hai đường thẳng song song bằng góc so le trong, đồng vị hoặc kề bù.';
  }
  if (topicId.includes('congruent_triangles')) {
    return 'Nhận diện: Chứng minh hai tam giác bằng nhau hoặc tam giác cân. Cần sử dụng các trường hợp bằng nhau để suy ra cạnh/góc tương ứng.';
  }
  if (topicId.includes('data_plots')) {
    return 'Nhận diện: Đọc hiểu số liệu từ bảng thống kê hoặc biểu đồ đoạn thẳng/quạt tròn.';
  }
  if (topicId.includes('ratios_proportions')) {
    return 'Nhận diện: Tỉ lệ thức và dãy tỉ số bằng nhau. Cần áp dụng tính chất dãy tỉ số hoặc đặt k để tìm ẩn.';
  }
  if (topicId.includes('expressions_polynomials')) {
    return 'Nhận diện: Thu gọn biểu thức, tính giá trị biểu thức hoặc thực hiện cộng, trừ, nhân, chia đa thức một biến.';
  }
  if (topicId.includes('simple_probability')) {
    return 'Nhận diện: Biến cố ngẫu nhiên, chắc chắn, không thể hoặc tính xác suất lý thuyết đơn giản.';
  }
  if (topicId.includes('triangle_relations')) {
    return 'Nhận diện: Bất đẳng thức tam giác hoặc sự đồng quy của các đường đặc biệt (trung tuyến, phân giác, cao, trung trực).';
  }
  if (topicId.includes('solid_shapes')) {
    return 'Nhận diện: Tính diện tích xung quanh hoặc thể tích của hình lăng trụ đứng tam giác/tứ giác.';
  }
  return `Nhận diện: Dạng bài thuộc chuyên đề ${patternId}. Xem xét giả thiết để chọn phương pháp biến đổi thích hợp.`;
}

function buildMath7StrategyNote(_topicId: string, level: MathLearningLevel): string {
  const base = 'Cách vào bài: Ghi nhận các giả thiết đã cho, xác định điều kiện xác định (nếu có), sử dụng các công thức hoặc định lý phù hợp để tính toán từng bước.';
  if (level === 'advanced' || level === 'hsg') {
    return `${base} Với bài toán nâng cao, hãy chú ý tìm kiếm các yếu tố bất biến, quy luật ẩn hoặc kẻ thêm đường phụ hình học để liên kết giả thiết và kết luận.`;
  }
  return base;
}

function buildMath7HardProblemLens(topicId: string): string {
  if (topicId.includes('geometry') || topicId.includes('angles_parallel_lines') || topicId.includes('congruent_triangles') || topicId.includes('triangle_relations')) {
    return 'Phương pháp giải câu khó Hình học: Phân tích kỹ đích cần chứng minh. Thử dựng thêm đường thẳng song song phụ, kéo dài đường trung tuyến bằng độ dài của nó, hoặc dựng tam giác đều để tìm ra các góc/cạnh bằng nhau bắc cầu.';
  }
  if (topicId.includes('rational_numbers') || topicId.includes('real_numbers') || topicId.includes('ratios_proportions') || topicId.includes('expressions_polynomials')) {
    return 'Phương pháp giải câu khó Đại số: Tận dụng tính chất đặc biệt của dãy tỉ số, phép đặt ẩn phụ đối với lũy thừa hoặc đa thức. Chú ý tính không âm của căn thức, giá trị tuyệt đối để đánh giá cực trị hoặc giới hạn khoảng biến số.';
  }
  return 'Phương pháp giải bài khó: Sử dụng nguyên lý Dirichlet, tính chất chia hết của số nguyên hoặc thiết lập đẳng thức dạng tổng bình phương bằng 0.';
}

function buildReport(
  rawSources: Math7RawSource[],
  mappedSources: number,
  unmappedSources: string[],
  blocks: Math7ExtractedBlock[],
  items: QuestionItem[],
  issues: Math7ImportIssue[],
): Math7ImportReport {
  return {
    schemaVersion: 'math7_import_v1',
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

function inferPattern(topic: Math7TopicPlan, prompt: string): Math7Pattern {
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

function inferPatternForHsg(topic: Math7TopicPlan, block: { prompt: string; dang: string; method: string }): Math7Pattern {
  const normalizedText = normalizeSearchText(`${block.dang} ${block.prompt} ${block.method}`);
  const scored = topic.patterns.map((pattern) => {
    const searchable = normalizeSearchText(`${pattern.title} ${pattern.tags.join(' ')}`);
    const tokens = searchable.split(/\s+/).filter((token) => token.length >= 3);
    let score = 0;
    tokens.forEach((token) => {
      if (normalizedText.includes(token)) {
        score += 1;
        const normalizedDang = normalizeSearchText(block.dang);
        if (normalizedDang.includes(token)) {
          score += 2;
        }
      }
    });
    return { pattern, score };
  });
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aIsHsg = a.pattern.level === 'hsg' || a.pattern.level === 'advanced';
    const bIsHsg = b.pattern.level === 'hsg' || b.pattern.level === 'advanced';
    if (aIsHsg && !bIsHsg) return -1;
    if (!aIsHsg && bIsHsg) return 1;
    return levelRank(a.pattern.level) - levelRank(b.pattern.level);
  });
  return scored[0]?.pattern || topic.patterns[0];
}

function inferTopicFromFileName(value: string): Math7TopicPlan | undefined {
  const text = normalizeSearchText(value);
  if (text.includes('so huu ti') || text.includes('huu ti') || text.includes('dai so 7 phan 1') || text.includes('hoc ki 1') || text.includes('hoc ki i')) return find('math7.algebra.rational_numbers');
  if (text.includes('so thuc') || text.includes('can bac hai') || text.includes('tri tuyet doi')) return find('math7.algebra.real_numbers');
  if (text.includes('song song') || text.includes('cat nhau') || text.includes('duong thang song song') || text.includes('goc')) return find('math7.geometry.angles_parallel_lines');
  if (text.includes('tam giac bang nhau') || text.includes('tam giac can') || text.includes('trung truc')) return find('math7.geometry.congruent_triangles');
  if (text.includes('thong ke') || text.includes('bieu do') || text.includes('thu thap')) return find('math7.statistics.data_plots');
  if (text.includes('ti le thuc') || text.includes('day ti so') || text.includes('ti le thuan') || text.includes('ti le nghich') || text.includes('ti le')) return find('math7.algebra.ratios_proportions');
  if (text.includes('bieu thuc dai so') || text.includes('da thuc') || text.includes('bieu thuc')) return find('math7.algebra.expressions_polynomials');
  if (text.includes('xac suat') || text.includes('bien co')) return find('math7.probability.simple_probability');
  if (text.includes('quan he') || text.includes('dong quy') || text.includes('hinh hoc 7') || text.includes('hinh hoc') || text.includes('trong tam')) return find('math7.geometry.triangle_relations');
  if (text.includes('hinh khoi') || text.includes('lang tru') || text.includes('the tich') || text.includes('dien tich')) return find('math7.geometry.solid_shapes');
  return undefined;
}

export function matchMath7TopicForText(text: string): Math7TopicPlan {
  const norm = normalizeSearchText(text);
  
  const scores = MATH7_LEARNING_MATRIX.map((topic) => {
    let score = 0;
    
    if (topic.id === 'math7.algebra.rational_numbers') {
      if (norm.includes('huu ti') || norm.includes('huu ty')) score += 15;
      if (norm.includes('luy thua') || norm.includes('so mu')) score += 8;
      if (norm.includes('phan so')) score += 2;
    } else if (topic.id === 'math7.algebra.real_numbers') {
      if (norm.includes('so thuc')) score += 15;
      if (norm.includes('can bac hai') || norm.includes('can thuc') || norm.includes('so vo ti') || norm.includes('so vo ty')) score += 18;
      if (norm.includes('tri tuyet doi') || norm.includes('gia tri tuyet doi')) score += 12;
    } else if (topic.id === 'math7.geometry.angles_parallel_lines') {
      if (norm.includes('song song')) score += 15;
      if (norm.includes('goc ke bu') || norm.includes('doi dinh') || norm.includes('so le trong') || norm.includes('dong vi') || norm.includes('tien de euclid') || norm.includes('tien de o-clit')) score += 15;
      if (norm.includes('tia phan giac') || norm.includes('phan giac')) score += 3;
      if (norm.includes('duong thang')) score += 1;
    } else if (topic.id === 'math7.geometry.congruent_triangles') {
      if (norm.includes('tam giac bang nhau') || (norm.includes('bang nhau') && norm.includes('tam giac'))) score += 15;
      if (norm.includes('tam giac can') || norm.includes('tam giac deu')) score += 15;
      if (norm.includes('duong trung truc') || norm.includes('trung truc')) score += 10;
      if (norm.includes('c.c.c') || norm.includes('c.g.c') || norm.includes('g.c.g')) score += 15;
    } else if (topic.id === 'math7.statistics.data_plots') {
      if (norm.includes('thong ke') || norm.includes('thu thap') || norm.includes('phan loai du lieu')) score += 15;
      if (norm.includes('bieu do') || norm.includes('bieu do doan thang') || norm.includes('bieu do quat tron')) score += 15;
      if (norm.includes('tan so') || norm.includes('bang thong ke')) score += 10;
    } else if (topic.id === 'math7.algebra.ratios_proportions') {
      if (norm.includes('ti le thuc') || norm.includes('ty le thuc') || norm.includes('ti-le-thuc')) score += 20;
      if (norm.includes('day ti so') || norm.includes('day ty so')) score += 20;
      if (norm.includes('ti le thuan') || norm.includes('ty le thuan') || norm.includes('tuan hoan')) score += 15;
      if (norm.includes('ti le nghich') || norm.includes('ty le nghich')) score += 15;
      if (norm.includes('ti le') || norm.includes('ty le')) score += 5;
    } else if (topic.id === 'math7.algebra.expressions_polynomials') {
      if (norm.includes('da thuc') || norm.includes('da thuc mot bien')) score += 15;
      if (norm.includes('bieu thuc dai so') || norm.includes('don thuc') || norm.includes('bieu thuc')) score += 8;
      if (norm.includes('nghiem cua da thuc') || norm.includes('nghiem da thuc')) score += 12;
      if (norm.includes('chia da thuc') || norm.includes('phep chia da thuc')) score += 12;
      if (norm.includes('bezout') || norm.includes('be-du')) score += 15;
    } else if (topic.id === 'math7.probability.simple_probability') {
      if (norm.includes('xac suat') || norm.includes('xac suat thuc nghiem')) score += 15;
      if (norm.includes('bien co') || norm.includes('ngau nhien') || norm.includes('chac chan')) score += 15;
      if (norm.includes('xuc xac') || norm.includes('dong xu')) score += 5;
    } else if (topic.id === 'math7.geometry.triangle_relations') {
      if (norm.includes('quan he giua canh') || norm.includes('quan he giua goc') || norm.includes('duong vuong goc') || norm.includes('duong xien')) score += 15;
      if (norm.includes('bat dang thuc tam giac')) score += 18;
      if (norm.includes('dong quy') || norm.includes('ba duong dong quy')) score += 18;
      if (norm.includes('trong tam') || norm.includes('truc tam') || norm.includes('ngoai tiep') || norm.includes('noi tiep')) score += 12;
      if (norm.includes('trung tuyen') || norm.includes('duong cao') || norm.includes('duong trung truc') || norm.includes('duong phan giac')) score += 5;
    } else if (topic.id === 'math7.geometry.solid_shapes') {
      if (norm.includes('hinh khoi') || norm.includes('hinh hop chu nhat') || norm.includes('hinh lap phuong')) score += 15;
      if (norm.includes('lang tru') || norm.includes('lang tru dung') || norm.includes('tiet dien')) score += 18;
      if (norm.includes('the tich') || norm.includes('dien tich xung quanh') || norm.includes('dien tich toan phan')) score += 12;
    }
    
    return { topic, score };
  });
  
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].topic : MATH7_LEARNING_MATRIX[0];
}

function getSourceFileKind(topic: Math7TopicPlan, fileName: string): Math7SourceKind {
  const cleanSourceBase = cleanFileNameForMatch(fileName);
  const file = topic.sourceFiles.find((f) => {
    const cleanFile = cleanFileNameForMatch(f.fileName);
    return cleanFile === cleanSourceBase || cleanSourceBase.endsWith(cleanFile) || cleanFile.endsWith(cleanSourceBase);
  });
  return file ? file.kind : 'practice';
}

function find(id: string): Math7TopicPlan | undefined {
  return MATH7_LEARNING_MATRIX.find((topic) => topic.id === id);
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

function extractFormulaAssets(prompt: string): Math7PromptFormulaAsset[] {
  const assets: Math7PromptFormulaAsset[] = [];
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

function decodeLegacySymbols(text: string): string {
  return text
    .replace(/\u00ad/g, '') // Strip soft hyphens
    .replace(/\s*([A-Z]{3})/g, '\\widehat{$1}')
    .replace(//g, '\\angle ')
    .replace(/¸/g, ', ')
    .replace(//g, ' \\Rightarrow ')
    .replace(//g, ' \\Leftrightarrow ')
    .replace(//g, '=')
    .replace(//g, ' \\neq ')
    .replace(//g, ' \\geq ')
    .replace(//g, ' \\leq ')
    .replace(//g, ' \\equiv ')
    .replace(//g, ' \\in ')
    .replace(//g, ' \\notin ')
    .replace(//g, ' \\cup ')
    .replace(//g, ' \\cap ')
    .replace(//g, ' \\varnothing ')
    .replace(/[]/g, '')
    .replace(//g, '^\\circ')
    .replace(/×/g, ' \\cdot ')
    .replace(/\u00d7/g, ' \\cdot ');
}

function normalizePrompt(text: string): string {
  let cleaned = decodeLegacyVietnameseText(text);
  cleaned = decodeLegacySymbols(cleaned);
  return cleaned
    .replace(/\u0001/g, '')
    .replace(/\u0007/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
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
  return `${slug(topicId.replace(/^math7\./, ''))}.${sourceSlug.slice(0, 40)}.${shortHash(sourceFile)}.${String(index).padStart(3, '0')}`;
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

function normalizeSearchText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function hasBlankFormulaShape(prompt: string): boolean {
  const text = normalizeSearchText(prompt);
  const originalLower = String(prompt || '').toLowerCase();
  const hasBlankVerbOrConjunction = /(?:^|[^a-z0-9\u00c0-\u1ef9])(?:bi\u1ebft|b\u1eb1ng|l\u00e0)\s+(?:v\u00e0|;|,|\.)(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower)
    || (/\b(?:biet|bang|la)\s+(?:va|;|,|\.)\b/.test(text) && !/(?:^|[^a-z0-9\u00c0-\u1ef9])(?:l\u00e1|la)\s+v\u00e0(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower));

  return /\b[a-d]\)\s*\b[b-e]\)/.test(text)
    || /=\s*(?:[;,)]|(?:\.(?!\.\.))|$)/.test(text)
    || hasBlankVerbOrConjunction
    || /\b(?:thuc hien phep tinh|rut gon|quy dong|so sanh|tim x)\b.{0,90}\b[a-d]\)\s*\b[b-e]\)/.test(text);
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

function decodeVniTimesText(text: string): string {
  let res = text;
  
  // 3-character vowel groups
  res = res.replace(/öôù/g, 'ướ').replace(/öôø/g, 'ườ').replace(/öôû/g, 'ử').replace(/öôõ/g, 'ưỡng').replace(/öôï/g, 'ượ');
  res = res.replace(/uôù/g, 'uố').replace(/uôø/g, 'uồ').replace(/uôû/g, 'uổ').replace(/uôõ/g, 'uỗ').replace(/uôï/g, 'uộ');
  res = res.replace(/ÖÔÙ/g, 'ƯỚ').replace(/ÖÔØ/g, 'ƯỜ').replace(/ÖÔÛ/g, 'ƯỞ').replace(/ÖÔÕ/g, 'ƯỠ').replace(/ÖÔÏ/g, 'ƯỢ');
  res = res.replace(/UÔÙ/g, 'UỐ').replace(/UÔØ/g, 'UỒ').replace(/UÔÛ/g, 'UỔ').replace(/UÔÕ/g, 'UỖ').replace(/UÔÏ/g, 'UỘ');

  // 2-character vowel groups
  res = res.replace(/aâù/g, 'ấ').replace(/aâø/g, 'ầ').replace(/aâû/g, 'ẩ').replace(/aâõ/g, 'ẫ').replace(/aâï/g, 'ậ');
  res = res.replace(/aéù/g, 'ắ').replace(/aéø/g, 'ằ').replace(/aéû/g, 'ẳ').replace(/aéõ/g, 'ẵ').replace(/aéï/g, 'ặ');
  res = res.replace(/eâù/g, 'ế').replace(/eâø/g, 'ề').replace(/eâû/g, 'ể').replace(/eâõ/g, 'ễ').replace(/eâï/g, 'ệ');
  res = res.replace(/oâù/g, 'ố').replace(/oâø/g, 'ồ').replace(/oâû/g, 'ổ').replace(/oâõ/g, 'ỗ').replace(/oâï/g, 'ộ');
  res = res.replace(/AÂÙ/g, 'Ấ').replace(/AÂØ/g, 'Ầ').replace(/AÂÛ/g, 'Ẩ').replace(/AÂÕ/g, 'Ẫ').replace(/AÂÏ/g, 'Ậ');
  res = res.replace(/AÉÙ/g, 'Ắ').replace(/AÉØ/g, 'Ằ').replace(/AÉÛ/g, 'Ẳ').replace(/AÉÕ/g, 'Ẵ').replace(/AÉÏ/g, 'Ặ');
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

function decodeLegacyVietnameseText(value: string): string {
  let text = String(value || '');
  const matches = text.match(TCVN3_SIGNAL_RE);
  if (matches && matches.length >= 1) {
    text = text.replace(TCVN3_CHAR_RE, (char) => TCVN3_CHAR_MAP[char] || char);
  }
  text = decodeVniTimesText(text);

  // Custom legacy font replacements for Math 7 sources
  text = text
    .replace(/Tớnh/g, 'Tính').replace(/tớnh/g, 'tính')
    .replace(/Kớnh/g, 'Kính').replace(/kớnh/g, 'kính')
    .replace(/tớch/g, 'tích')
    .replace(/đỏy/g, 'đáy').replace(/Đỏy/g, 'Đáy')
    .replace(/hỡnh/g, 'hình').replace(/Hỡnh/g, 'Hình')
    .replace(/bờn/g, 'bên').replace(/Bờn/g, 'Bên')
    .replace(/vuụng/g, 'vuông').replace(/Vuụng/g, 'Vuông')
    .replace(/giỏc/g, 'giác').replace(/Giỏc/g, 'Giác')
    .replace(/cõn/g, 'cân').replace(/Cõn/g, 'Cân')
    .replace(/trờn/g, 'trên').replace(/Trờn/g, 'Trên')
    .replace(/khụng/g, 'không').replace(/Khụng/g, 'Không')
    .replace(/cú/g, 'có').replace(/Cú/g, 'Có')
    .replace(/gúc/g, 'góc').replace(/Gúc/g, 'Góc')
    .replace(/đỏp/g, 'đáp').replace(/Đỏp/g, 'Đáp')
    .replace(/phõn/g, 'phân').replace(/Phõn/g, 'Phân')
    .replace(/dưới đõy/g, 'dưới đây').replace(/dưới đõy/g, 'dưới đây')
    .replace(/cụng ty/g, 'công ty')
    .replace(/tài chớnh/g, 'tài chính')
    .replace(/cỏc/g, 'các').replace(/Cỏc/g, 'Các')
    .replace(/phỏ/g, 'phá')
    .replace(/phỏt/g, 'phát')
    .replace(/gúp/g, 'góp')
    .replace(/ỏp/g, 'áp')
    .replace(/đỏnh/g, 'đánh')
    .replace(/lớ/g, 'lý')
    .replace(/giỏ/g, 'giá')
    .replace(/tỏc/g, 'tác').replace(/Tỏc/g, 'Tác')
    .replace(/thớch/g, 'thích').replace(/Thớch/g, 'Thích')
    .replace(/Tờn/g, 'Tên').replace(/tờn/g, 'tên')
    .replace(/lờn/g, 'lên').replace(/Lờn/g, 'Lên')
    .replace(/cỏi/g, 'cái').replace(/Cỏi/g, 'Cái')
    .replace(/nhúm/g, 'nhóm').replace(/Nhúm/g, 'Nhóm')
    .replace(/đỳng/g, 'đúng').replace(/Đỳng/g, 'Đúng');

  return text;
}

function looksLikeTcvn3Text(value: string): boolean {
  const matches = value.match(TCVN3_SIGNAL_RE);
  return Boolean(matches && matches.length >= 2 && TCVN3_WORD_RE.test(value));
}

void looksLikeTcvn3Text;

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
const TCVN3_WORD_RE = /(?:T\u00d7m|t\u00d7m|c\u00b8c|gi\u00b8|tr\u00de|nguy\u00aan|c\u00f1a|ph\u00a9n|s\u00e8|l\u00b5|kh\u00abng|v\u00b5|ch\u00f8ng|Ch\u00f8ng|s\u00b8nh|So s\u00b8nh|\u00ae\u00d3|\u00ae\u00d0|\u00ae\u00e8)/;
