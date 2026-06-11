import {
  MATH8_LEARNING_MATRIX,
  type Math8Pattern,
  type Math8TopicPlan,
} from './math8-plan';
import type { MathLearningLevel, QuestionItem } from './standard';

export interface Math8RawSource {
  fileName: string;
  relativePath?: string;
  path?: string;
  extension?: string;
  text: string;
  richExtraction?: boolean;
  formulaAssetCount?: number;
  formulaAssets?: Math8FormulaAsset[];
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

export interface Math8FormulaAsset {
  src: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  fileName?: string;
  copied?: boolean;
  source?: string;
}

export interface Math8ExtractedBlock {
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

export interface Math8ImportIssue {
  code: string;
  severity: 'warning' | 'blocker';
  message: string;
  sourceFile?: string;
  topicId?: string;
}

export interface Math8ImportReport {
  schemaVersion: 'math8_import_v1';
  generatedAt: string;
  inputSources: number;
  mappedSources: number;
  unmappedSources: string[];
  extractedBlocks: number;
  convertedItems: number;
  byTopic: Record<string, number>;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  issues: Math8ImportIssue[];
}

interface TopicMatch {
  topic: Math8TopicPlan;
  confidence: number;
}

interface Math8PromptFormulaAsset {
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

export function buildMath8QuestionItemsFromRawSources(rawSources: Math8RawSource[]): { items: QuestionItem[]; blocks: Math8ExtractedBlock[]; report: Math8ImportReport } {
  const issues: Math8ImportIssue[] = [];
  const blocks: Math8ExtractedBlock[] = [];
  const unmappedSources: string[] = [];
  let mappedSources = 0;

  const hsgSources = rawSources.filter((s) => s.parsedBlocks && s.parsedBlocks.length > 0);
  const standardRawSources = rawSources.filter((s) => !s.parsedBlocks || s.parsedBlocks.length === 0);

  const sourcesByTopic = new Map<string, Math8RawSource[]>();
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

    const topicMatch = matchMath8TopicForSource(source);
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
    const topic = MATH8_LEARNING_MATRIX.find((t) => t.id === topicId)!;
    
    const practiceFiles = topicSources.filter(s => {
      const name = normalizeSearchText(s.fileName);
      return name.includes('dap an') || name.includes('dap-an') || name.includes('da-an') || name.includes('huong dan') || name.includes('hdsg');
    });
    const lessonFiles = topicSources.filter(s => !practiceFiles.includes(s));

    let lessonText = '';
    let practiceText = '';
    let lessonSource: Math8RawSource | undefined;

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

      const theoryPrompts = extractMath8ExerciseBlocks(theoryText);
      const practicePrompts = extractMath8ExerciseBlocks(sectionPracticeText);
      const answerPrompts = extractMath8AnswerBlocks(practiceSecText);

      const sectionTheoryBlocks: Math8ExtractedBlock[] = theoryPrompts.map((prompt) => {
        const pattern = inferPattern(topic, prompt);
        fileBlockIndex += 1;
        let cleanPrompt = prompt;
        let sourceSolution: string | undefined;
        
        const hdMatch = cleanPrompt.match(/(?:^|\s+|\n)(?:Gi\u1ea3i|L\u1eddi gi\u1ea3i|H\u01af\u1edaNG D\u1eaaN GI\u1ea2I|H\u01b0\u1edbng d\u1eabn gi\u1ea3i|H\u01b0\u1edbng d\u1eabn|HD)(?:\s*:|\s+|$)/i);
        if (hdMatch && typeof hdMatch.index === 'number') {
          sourceSolution = cleanPrompt.slice(hdMatch.index).trim();
          cleanPrompt = cleanPrompt.slice(0, hdMatch.index).trim();
        }

        return {
          id: buildBlockId(topicId, lessonSource!.relativePath || lessonSource!.fileName, fileBlockIndex),
          prompt: cleanPrompt,
          sourceSolution,
          sourceAnswer: sourceSolution ? extractShortAnswer(sourceSolution) : undefined,
          sourceFile: lessonSource!.relativePath || lessonSource!.fileName,
          sourcePath: lessonSource!.path,
          topicId,
          patternId: pattern.id,
          level: pattern.level,
          confidence: 1.0,
        };
      });

      const sectionPracticeBlocks: Math8ExtractedBlock[] = practicePrompts.map((prompt) => {
        const pattern = inferPattern(topic, prompt);
        fileBlockIndex += 1;
        let cleanPrompt = prompt;
        let sourceSolution: string | undefined;
        
        const hdMatch = cleanPrompt.match(/(?:^|\s+|\n)(?:Gi\u1ea3i|L\u1eddi gi\u1ea3i|H\u01af\u1edaNG D\u1eaaN GI\u1ea2I|H\u01b0\u1edbng d\u1eabn gi\u1ea3i|H\u01b0\u1edbng d\u1eabn|HD)(?:\s*:|\s+|$)/i);
        if (hdMatch && typeof hdMatch.index === 'number') {
          sourceSolution = cleanPrompt.slice(hdMatch.index).trim();
          cleanPrompt = cleanPrompt.slice(0, hdMatch.index).trim();
        }

        return {
          id: buildBlockId(topicId, lessonSource!.relativePath || lessonSource!.fileName, fileBlockIndex),
          prompt: cleanPrompt,
          sourceSolution,
          sourceAnswer: sourceSolution ? extractShortAnswer(sourceSolution) : undefined,
          sourceFile: lessonSource!.relativePath || lessonSource!.fileName,
          sourcePath: lessonSource!.path,
          topicId,
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

    if (source.parsedBlocks) {
      source.parsedBlocks = source.parsedBlocks.map((block) => {
        const hasOle = String(block.prompt || '').includes('\u0001') || String(block.solution || '').includes('\u0001') || String(block.method || '').includes('\u0001');
        const prompt = hasOle ? (block.prompt + ' ||HAS_OLE||') : block.prompt;
        return {
          header: cleanHsgText(block.header),
          prompt: cleanHsgText(prompt),
          solution: cleanHsgText(block.solution),
          dang: cleanHsgText(block.dang),
          method: cleanHsgText(block.method),
        };
      });
    }

    const topicMatch = matchMath8TopicForSource(source);
    if (!topicMatch) {
      const genericFiles = [
        'cac-chuyen-de-hoc-tap-mon-toan-8-phan-dai-so.pdf',
        'cac-chuyen-de-hoc-tap-mon-toan-8-phan-hinh-hoc.pdf',
        'cac-chuyen-de-toan-8-tap-hai-pham-dinh-quang.pdf',
        'cac-chuyen-de-toan-8-tap-mot-pham-dinh-quang.pdf',
        'chuyen-de-hoc-tap-mon-toan-8-tap-1-phan-so-va-dai-so.pdf',
        'chuyen-de-khai-phong-nang-luc-mon-toan-8.pdf',
        'tai-lieu-hoc-tap-mon-toan-8-hoc-ki-1-nam-hoc-2025-2026.pdf',
      ];
      
      const isGeneric = genericFiles.some(f => 
        normalizeSearchText(source.fileName).includes(normalizeSearchText(f.replace('.pdf', '')))
      );
      
      if (isGeneric && source.parsedBlocks) {
        let genericMappedCount = 0;
        source.parsedBlocks.forEach((parsedBlock, idx) => {
          const inferredTopic = inferTopicFromBlockText(
            parsedBlock.dang || '',
            parsedBlock.prompt || '',
            parsedBlock.method || '',
            source.fileName
          );
          
          if (inferredTopic) {
            genericMappedCount += 1;
            const topicId = inferredTopic.id;
            const pattern = inferPatternForHsg(inferredTopic, parsedBlock);
            const prompt = parsedBlock.prompt;
            const blockId = buildBlockId(topicId, source.relativePath || source.fileName, idx + 1);

            blocks.push({
              id: blockId,
              prompt: prompt,
              sourceSolution: parsedBlock.solution,
              sourceAnswer: extractShortAnswer(parsedBlock.solution),
              sourceFile: source.relativePath || source.fileName,
              sourcePath: source.path,
              topicId,
              patternId: pattern.id,
              level: 'hsg',
              confidence: 0.85,
              hsgDang: parsedBlock.dang,
              hsgMethod: parsedBlock.method,
            });
          }
        });
        
        if (genericMappedCount > 0) {
          mappedSources += 1;
          processedSources.add(source.relativePath || source.fileName);
        } else {
          unmappedSources.push(source.relativePath || source.fileName);
        }
      } else {
        unmappedSources.push(source.relativePath || source.fileName);
      }
      return;
    }

    const topic = topicMatch.topic;
    const topicId = topic.id;
    mappedSources += 1;
    processedSources.add(source.relativePath || source.fileName);

    if (!source.parsedBlocks) return;

    source.parsedBlocks.forEach((parsedBlock, idx) => {
      const pattern = inferPatternForHsg(topic, parsedBlock);
      const prompt = parsedBlock.prompt;
      const blockId = buildBlockId(topicId, source.relativePath || source.fileName, idx + 1);

      blocks.push({
        id: blockId,
        prompt: prompt,
        sourceSolution: parsedBlock.solution,
        sourceAnswer: extractShortAnswer(parsedBlock.solution),
        sourceFile: source.relativePath || source.fileName,
        sourcePath: source.path,
        topicId,
        patternId: pattern.id,
        level: 'hsg',
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

  const filteredBlocks = blocks.filter((block) => {
    if (shouldExcludeBlock(block.prompt)) return false;
    if (block.sourceSolution && shouldExcludeSolution(block.sourceSolution)) return false;
    return true;
  });

  const items = filteredBlocks.map((block): QuestionItem => {
    const topic = MATH8_LEARNING_MATRIX.find((candidate) => candidate.id === block.topicId);
    const pattern = topic?.patterns.find((candidate) => candidate.id === block.patternId);
    const formulaAssets = extractFormulaAssets(block.prompt);
    return {
      id: `math8.${block.id}`,
      sourceId: block.id,
      source: 'math8_local_source',
      domainId: 'mathematics',
      programIds: topic?.programIds || ['vn_math_8', 'vn_math_thcs'],
      conceptIds: pattern?.conceptIds?.length ? pattern.conceptIds : topic?.conceptIds || ['math.polynomial'],
      skillIds: pattern?.skillIds?.length ? pattern.skillIds : topic?.skillIds || ['math.factor_polynomial'],
      misconceptionIds: [],
      type: 'open_response',
      prompt: block.prompt,
      correctAnswer: block.sourceAnswer || null,
      explanation: buildMath8Explanation(topic, pattern, block),
      difficulty: difficultyForLevel(block.level),
      cognitiveLevel: pattern?.cognitiveLevel || (block.level === 'foundation' ? 'understand' : block.level === 'core' ? 'apply' : 'analyze'),
      tags: uniqueStrings([
        'math8',
        topic?.strand || '',
        topic?.unit || '',
        block.topicId,
        block.patternId,
        `level:${block.level}`,
        `source:${block.sourceFile}`,
        formulaAssets.length ? 'formula:recovered_asset' : '',
      ]),
      metadata: {
        grade: 8,
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
    blocks: filteredBlocks,
    report: buildReport(rawSources, mappedSources, unmappedSources, filteredBlocks, items, issues),
  };
}

export function extractMath8ExerciseBlocks(text: string): string[] {
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

export function extractMath8AnswerBlocks(text: string): string[] {
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

export function matchMath8TopicForSource(source: Math8RawSource): TopicMatch | undefined {
  const cleanSourcePath = cleanFileNameForMatch(source.relativePath || source.fileName);
  const cleanSourceBase = cleanFileNameForMatch(source.fileName);

  for (const topic of MATH8_LEARNING_MATRIX) {
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

function alignBlocks(exercises: Math8ExtractedBlock[], answers: string[]): void {
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

function buildMath8Explanation(topic: Math8TopicPlan | undefined, pattern: Math8Pattern | undefined, block: Math8ExtractedBlock): Record<string, unknown> {
  if (block.hsgDang || block.level === 'hsg') {
    return buildHsgExplanation(topic, pattern, block);
  }
  const recognition = buildMath8RecognitionNote(topic?.id || block.topicId, pattern?.id || block.patternId);
  const strategy = buildMath8StrategyNote(topic?.id || block.topicId, pattern?.level || block.level);
  const sourceSolution = block.sourceSolution ? block.sourceSolution : '';
  const isHard = block.level === 'advanced' || block.level === 'hsg';

  return {
    source: 'math8_local_source',
    sourceSolutionStatus: sourceSolution ? 'source_solution' : 'missing_source_solution',
    thinking: `${recognition} ${strategy}`,
    recognition,
    strategy,
    steps: sourceSolution || 'Nguồn chưa có lời giải chi tiết cho bài này. Hãy áp dụng phương pháp nhận diện và chiến lược giải để thực hiện các bước.',
    answer: block.sourceAnswer || null,
    hardProblemLens: isHard ? buildMath8HardProblemLens(topic?.id || block.topicId) : '',
  };
}

function buildHsgExplanation(
  topic: Math8TopicPlan | undefined,
  _pattern: Math8Pattern | undefined,
  block: Math8ExtractedBlock
): Record<string, unknown> {
  const topicId = topic?.id || block.topicId;
  const dang = block.hsgDang || 'Phương pháp nâng cao';
  const method = block.hsgMethod ? block.hsgMethod.trim() : '';
  
  let observation = '';
  if (topicId.includes('polynomials')) {
    observation = 'Quan sát cấu trúc đa thức nhiều biến, bậc của các hạng tử và tính đối xứng (nếu có) để định hướng nhóm hoặc thực hiện phép toán phù hợp.';
  } else if (topicId.includes('identities_factorization')) {
    observation = 'Quan sát các hệ số, số mũ để nhận diện các hằng đẳng thức ẩn hoặc các nhóm hạng tử có thể phân tích thành nhân tử. Lưu ý kỹ thuật thêm bớt hạng tử hoặc đặt ẩn phụ.';
  } else if (topicId.includes('quadrilaterals')) {
    observation = 'Quan sát cấu trúc hình học, các đường chéo, trung điểm và tính chất đối xứng để chọn phương pháp chứng minh hoặc tính toán góc/đoạn thẳng.';
  } else if (topicId.includes('thales_theorem')) {
    observation = 'Tìm các đường thẳng song song hoặc tỉ số đoạn thẳng đã cho để áp dụng định lý Thalès và hệ quả. Lưu ý vẽ thêm đường phụ song song khi cần thiết.';
  } else if (topicId.includes('fractions')) {
    observation = 'Quan sát điều kiện xác định của phân thức. Tìm cách phân tích mẫu thức thành nhân tử để quy đồng hoặc rút gọn phân thức tối giản.';
  } else if (topicId.includes('linear_equations')) {
    observation = 'Xác định điều kiện có nghĩa của phương trình. Đối với phương trình nâng cao, chú ý dạng đặt ẩn phụ hoặc đưa về phương trình tích.';
  } else if (topicId.includes('similarity')) {
    observation = 'Nhận diện các cặp tam giác có góc chung hoặc cạnh tỉ lệ. Sử dụng các trường hợp đồng dạng (c.c.c, c.g.c, g.g) để thiết lập hệ thức tỉ lệ.';
  } else {
    observation = 'Đọc kỹ yêu cầu đề bài toán nâng cao, phân tích giả thiết để tìm mối liên hệ giữa các đại lượng.';
  }

  const thinking = `**1. Cách quan sát & Nhận diện:**\n${observation}\n\n**2. Hướng tư duy & Phương pháp:**\nÁp dụng kiến thức chuyên đề **${dang}**.\n${method ? `${method}` : 'Biến đổi biểu thức hoặc chứng minh các hệ thức hình học trung gian để đi đến đáp án.'}`;

  const steps = block.sourceSolution
    ? block.sourceSolution.trim()
    : 'Chưa có lời giải chi tiết. Hãy áp dụng phương pháp nhận diện và định hướng tư duy trên để giải bài toán.';

  const hardProblemLens = `**Lăng kính chuyên đề Học sinh giỏi (${dang}):**\n${method ? `${method}\n` : ''}Chú ý rèn luyện khả năng quan sát đặc điểm đối xứng, chia hết, hoặc tính chất hình học bắc cầu. Đây là chìa khóa để giải quyết các câu hỏi phân loại nâng cao.`;

  return {
    source: 'math8_local_source',
    sourceSolutionStatus: block.sourceSolution ? 'source_solution' : 'missing_source_solution',
    thinking,
    recognition: dang,
    strategy: method || 'Biến đổi nâng cao',
    steps,
    answer: block.sourceAnswer || null,
    hardProblemLens,
  };
}

function buildMath8RecognitionNote(topicId: string, patternId: string): string {
  if (topicId.includes('polynomials')) {
    return 'Nhận diện: Đơn thức, đa thức nhiều biến. Cần thực hiện thu gọn, xác định bậc hoặc thực hiện phép toán cộng, trừ, nhân, chia đa thức.';
  }
  if (topicId.includes('identities_factorization')) {
    return 'Nhận diện: Hằng đẳng thức đáng nhớ hoặc phân tích đa thức thành nhân tử. Cần khai triển hoặc nhóm, tách hạng tử.';
  }
  if (topicId.includes('quadrilaterals')) {
    return 'Nhận diện: Các loại tứ giác (hình thang, hình bình hành, chữ nhật, thoi, vuông) và tính chất đối xứng.';
  }
  if (topicId.includes('thales_theorem')) {
    return 'Nhận diện: Định lý Thalès, tính chất đường phân giác trong tam giác hoặc các định lý đồng quy nâng cao.';
  }
  if (topicId.includes('data_plots')) {
    return 'Nhận diện: Bảng dữ liệu thống kê, các loại biểu đồ (cột, quạt tròn, đoạn thẳng).';
  }
  if (topicId.includes('fractions')) {
    return 'Nhận diện: Phân thức đại số, rút gọn hoặc thực hiện bốn phép toán cộng, trừ, nhân, chia phân thức.';
  }
  if (topicId.includes('linear_equations')) {
    return 'Nhận diện: Phương trình bậc nhất một ẩn, phương trình tích, phương trình chứa ẩn ở mẫu hoặc giải bài toán bằng cách lập phương trình.';
  }
  if (topicId.includes('simple_probability')) {
    return 'Nhận diện: Xác suất lý thuyết hoặc xác suất thực nghiệm của biến cố trong các mô hình chọn ngẫu nhiên.';
  }
  if (topicId.includes('similarity')) {
    return 'Nhận diện: Tam giác đồng dạng và các trường hợp đồng dạng (c.c.c, c.g.c, g.g).';
  }
  if (topicId.includes('solid_shapes')) {
    return 'Nhận diện: Hình hộp chữ nhật, hình lăng trụ đứng, hình chóp tam giác đều, chóp tứ giác đều.';
  }
  return `Nhận diện: Dạng bài liên quan đến chủ đề ${patternId}. Đọc kỹ yêu cầu đề bài để xác định đối tượng toán học cần xử lý.`;
}

function buildMath8StrategyNote(_topicId: string, level: MathLearningLevel): string {
  const base = 'Cách vào bài: Ghi nhận đầy đủ giả thiết và điều kiện xác định (nếu có), lựa chọn công thức hoặc định lý chính, tính toán từng bước và đối chiếu điều kiện.';
  if (level === 'advanced' || level === 'hsg') {
    return `${base} Với bài toán nâng cao, tìm yếu tố đặc biệt hoặc tính đối xứng của biểu thức, thử biến đổi ngược từ kết luận cần chứng minh.`;
  }
  return base;
}

function buildMath8HardProblemLens(topicId: string): string {
  if (topicId.includes('geometry') || topicId.includes('quadrilaterals') || topicId.includes('thales_theorem') || topicId.includes('similarity')) {
    return 'Phương pháp giải câu khó Hình học: Phân tích đích cần chứng minh (góc, đoạn thẳng song song hay hệ thức tỉ lệ). Thường cần vẽ thêm đường phụ song song hoặc nối trung điểm, sử dụng tam giác đồng dạng bắc cầu hoặc định lý Thales đảo.';
  }
  if (topicId.includes('polynomials') || topicId.includes('identities_factorization') || topicId.includes('fractions')) {
    return 'Phương pháp giải câu khó Đại số: Áp dụng các phương pháp phân tích nâng cao (tách hạng tử, đặt ẩn phụ không hoàn toàn, thêm bớt cùng một lượng). Đối với cực trị hoặc bất đẳng thức, chú ý điểm rơi và phương pháp biến đổi về dạng bình phương không âm.';
  }
  if (topicId.includes('linear_equations')) {
    return 'Phương pháp giải phương trình khó: Chú ý phương pháp đặt ẩn phụ đối với phương trình đối xứng, phương trình bậc cao đưa được về tích, hoặc các bài toán lập phương trình có nhiều đại lượng biến thiên phức tạp.';
  }
  return 'Phương pháp giải bài khó: Sử dụng tính chất đặc biệt của các số nguyên (chia hết, ước chung), hoặc tính chất hình học trực quan để giới hạn khoảng nghiệm.';
}

function buildReport(
  rawSources: Math8RawSource[],
  mappedSources: number,
  unmappedSources: string[],
  blocks: Math8ExtractedBlock[],
  items: QuestionItem[],
  issues: Math8ImportIssue[],
): Math8ImportReport {
  return {
    schemaVersion: 'math8_import_v1',
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

function inferPattern(topic: Math8TopicPlan, prompt: string): Math8Pattern {
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

function inferPatternForHsg(topic: Math8TopicPlan, block: { prompt: string; dang: string; method: string }): Math8Pattern {
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

function inferTopicFromFileName(value: string): Math8TopicPlan | undefined {
  const text = normalizeSearchText(value);
  if (text.includes('da thuc')) return find('math8.algebra.polynomials');
  if (text.includes('hang dang thuc')) return find('math8.algebra.identities_factorization');
  if (text.includes('tu giac')) return find('math8.geometry.quadrilaterals');
  if (text.includes('ta let') || text.includes('ta-let') || text.includes('dinh li ta')) return find('math8.geometry.thales_theorem');
  if (text.includes('du lieu') || text.includes('bieu do') || text.includes('thong ke')) return find('math8.statistics.data_plots');
  if (text.includes('phan thuc')) return find('math8.algebra.fractions');
  if (text.includes('phuong trinh')) return find('math8.algebra.linear_equations');
  if (text.includes('xac suat') || text.includes('bien co')) return find('math8.probability.simple_probability');
  if (text.includes('dong dang')) return find('math8.geometry.similarity');
  if (text.includes('hinh khoi') || text.includes('lang tru') || text.includes('hinh chop')) return find('math8.geometry.solid_shapes');
  return undefined;
}

function inferTopicFromBlockText(dang: string, prompt: string, method: string, fileName: string): Math8TopicPlan | undefined {
  const combinedText = normalizeSearchText(`${dang} ${prompt} ${method}`);
  
  if (combinedText.includes('he so') || combinedText.includes('don thuc') || combinedText.includes('da thuc') || combinedText.includes('nhan don thuc') || combinedText.includes('chia don thuc')) {
    if (combinedText.includes('phan thuc') || combinedText.includes('mau thuc')) {
      return find('math8.algebra.fractions');
    }
    return find('math8.algebra.polynomials');
  }
  if (combinedText.includes('hang dang thuc') || combinedText.includes('phan tich da thuc thanh nhan tu') || combinedText.includes('nhan tu chung') || combinedText.includes('nhom hang tu') || combinedText.includes('gtln') || combinedText.includes('gtnn') || combinedText.includes('gia tri lon nhat') || combinedText.includes('gia tri nho nhat') || combinedText.includes('bat dang thuc')) {
    return find('math8.algebra.identities_factorization');
  }
  if (combinedText.includes('tu giac') || combinedText.includes('hinh thang') || combinedText.includes('hinh thang can') || combinedText.includes('hinh binh hanh') || combinedText.includes('hinh chu nhat') || combinedText.includes('hinh thoi') || combinedText.includes('hinh vuong') || combinedText.includes('doi xung')) {
    return find('math8.geometry.quadrilaterals');
  }
  if (combinedText.includes('ta let') || combinedText.includes('ta-let') || combinedText.includes('dinh li ta') || combinedText.includes('phan giac') || combinedText.includes('menelaus') || combinedText.includes('ceva')) {
    return find('math8.geometry.thales_theorem');
  }
  if (combinedText.includes('bieu do') || combinedText.includes('thong ke') || combinedText.includes('tan so') || combinedText.includes('du lieu')) {
    return find('math8.statistics.data_plots');
  }
  if (combinedText.includes('phan thuc') || combinedText.includes('mau thuc') || combinedText.includes('rut gon bieu thuc') || combinedText.includes('quy dong')) {
    return find('math8.algebra.fractions');
  }
  if (combinedText.includes('phuong trinh') || combinedText.includes('lap phuong trinh') || combinedText.includes('nghiem nguyen')) {
    return find('math8.algebra.linear_equations');
  }
  if (combinedText.includes('xac suat') || combinedText.includes('bien co') || combinedText.includes('ngau nhien') || combinedText.includes('mo hinh')) {
    return find('math8.probability.simple_probability');
  }
  if (combinedText.includes('dong dang') || combinedText.includes('tam giac dong dang') || combinedText.includes('ty so dong dang')) {
    return find('math8.geometry.similarity');
  }
  if (combinedText.includes('hinh hop') || combinedText.includes('hinh lap phuong') || combinedText.includes('lang tru') || combinedText.includes('hinh chop') || combinedText.includes('trung doan') || combinedText.includes('the tich')) {
    return find('math8.geometry.solid_shapes');
  }

  const fileText = normalizeSearchText(fileName);
  if (fileText.includes('hinh')) {
    if (combinedText.includes('tam giac')) return find('math8.geometry.similarity');
    return find('math8.geometry.quadrilaterals');
  }
  if (fileText.includes('dai so')) {
    return find('math8.algebra.identities_factorization');
  }

  return undefined;
}

function find(id: string): Math8TopicPlan | undefined {
  return MATH8_LEARNING_MATRIX.find((topic) => topic.id === id);
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

function extractFormulaAssets(prompt: string): Math8PromptFormulaAsset[] {
  const assets: Math8PromptFormulaAsset[] = [];
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
  return `${slug(topicId.replace(/^math8\./, ''))}.${sourceSlug.slice(0, 40)}.${shortHash(sourceFile)}.${String(index).padStart(3, '0')}`;
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

  // Custom legacy font replacements for Math 8 sources
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
    .replace(/dưới đõy/g, 'dưới đây')
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

export function cleanHsgText(value: string): string {
  if (!value) return '';
  let text = decodeLegacyVietnameseText(value);

  // Clean watermarks
  text = text
    .replace(/L\u00ea\s*Minh\s*Kha/gi, '')
    .replace(/S\u1ed0\s*V\u00c0\s*\u0110\u1ea0I\s*S\u1ed0/gi, '')
    .replace(/H\u00ccNH\s*H\u1eccC\s*V\u00c0\s*\u0110O\s*L\u01af\u1edcNG/gi, '')
    .replace(/TO\u00c1N\s*8/gi, '')
    .replace(/TO\u00c1N/gi, '')
    .replace(/Li\u00ean\s*h\u1ec7\s*:\s*Zalo\s*0399653362/gi, '')
    .replace(/Zalo\s*0399653362/gi, '')
    .replace(/M\u1ee5c\s*l\u1ee5c/gi, '')
    .replace(/\u25e6\^8\s*\^a_b/g, '')
    .replace(/\^8\s*\^a_b/g, '')
    .replace(/\u25e6/g, '')
    .replace(/GV\s*PH\u1ea0M\s*\u0110\u102dNH\s*QUANG/gi, '')
    .replace(/GV\s*Ph\u1ea1m\s*\u0110\u1ec3nh\s*Quang/gi, '')
    .replace(/GV\s*Ph\u1ea1m\s*\u0110\u1ea3o\s*Quang/gi, '')
    .replace(/Ph\u1ea1m\s*\u0110\u1ec3nh\s*Quang/gi, '')
    .replace(/Ph\u1ea1m\s*\u0110\u1ea3o\s*Quang/gi, '')
    .replace(/GV\s*Ph\u1ea1m\s*\u0110\u1ecbnh\s*Quang/gi, '')
    .replace(/Ph\u1ea1m\s*\u0110\u1ecbnh\s*Quang/gi, '')
    .replace(/0337\.820\.847/g, '')
    .replace(/0337820847/g, '')
    .replace(/K\u1ebeT\s*N\u1ed0I\s*TRI\s*TH\u1ee0C/gi, '')
    .replace(/V\u1edaI\s*CU\u1ed2C\s*S\u1ed0NG/gi, '')
    .replace(/T\u00c0I\s*LI\u1ec6U\s*L\u01afU\s*H\u00c0NH\s*N\u1ed8I\s*B\u1ec8/gi, '');

  // Remove control or replacement characters
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/g, '');

  // Normalize spacing
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();

  return text;
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
const TCVN3_SIGNAL_RE = /[\u00a8\u00a9\u00aa\u00ab\u00ac\u00ad\u00ae\u00b5\u00b6\u00b8\u00b9\u00bb\u00bc\u00bd\u00be\u00c6\u00c7\u00c8\u00c9\u00ca\u00cb\u00cc\u00ce\u00cf\u00d0\u00d1\u00d2\u00d3\u00d4\u00d5\u00d6\u00d7\u00d8\u00dc\u00dd\u00de\u00df\u00e5\u00e6\u00e7\u00e8\u00e5\u00ee\u00ef\u00f1\u00f4\u00f8\u00fb\u00fc\u00fe]/g;

export function shouldExcludeBlock(prompt: string): boolean {
  if (hasBlankFormulaShapeLocal(prompt)) return true;
  if (prompt.includes('||HAS_OLE||')) return true;

  const CONTROL_OR_REPLACEMENT_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/;
  const MOJIBAKE_RE = /(?:[\u00c3\u00c4\u00c5\u00c6][\u0080-\u00bf]|\u00e1[\u00ba\u00bb])/;
  const LEGACY_FONT_RE = /[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]/;
  
  if (CONTROL_OR_REPLACEMENT_RE.test(prompt) || MOJIBAKE_RE.test(prompt) || LEGACY_FONT_RE.test(prompt)) {
    return true;
  }

  return false;
}

export function shouldExcludeSolution(solution: string): boolean {
  const CONTROL_OR_REPLACEMENT_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/;
  const MOJIBAKE_RE = /(?:[\u00c3\u00c4\u00c5\u00c6][\u0080-\u00bf]|\u00e1[\u00ba\u00bb])/;
  const LEGACY_FONT_RE = /[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]/;

  if (CONTROL_OR_REPLACEMENT_RE.test(solution) || MOJIBAKE_RE.test(solution) || LEGACY_FONT_RE.test(solution)) {
    return true;
  }
  return false;
}

function hasBlankFormulaShapeLocal(prompt: string): boolean {
  const text = normalizeSearchText(prompt);
  const originalLower = String(prompt || '').toLowerCase();
  const hasBlankVerbOrConjunction = /(?:^|[^a-z0-9\u00c0-\u1ef9])(?:bi\u1ebft|b\u1eb1ng|l\u00e0)\s+(?:v\u00e0|;|,|\.)(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower)
    || (/\b(?:biet|bang|la)\s+(?:va|;|,|\.)\b/.test(text) && !/(?:^|[^a-z0-9\u00c0-\u1ef9])(?:l\u00e1|la)\s+v\u00e0(?:$|[^a-z0-9\u00c0-\u1ef9])/i.test(originalLower));

  return /\b[a-d]\)\s*\b[b-e]\)/.test(text)
    || /=\s*(?:[;,)]|(?:\.(?!\.\.))|$)/.test(text)
    || hasBlankVerbOrConjunction
    || /\b(?:thuc hien phep tinh|rut gon|quy dong|so sanh|tim x)\b.{0,90}\b[a-d]\)\s*\b[b-e]\)/.test(text);
}
