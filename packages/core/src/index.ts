/**
 * @miuprep/core
 * High-precision mechanics for IELTS-style mock exams.
 * Decoupled from UI and platform APIs.
 */

// ==========================================
// 1. IELTS Band Score Calculations
// ==========================================

export type SkillType = 'listening' | 'reading';
export type ExamModuleType = 'academic' | 'general';

interface ScoreThreshold {
  minCorrect: number;
  band: number;
}

const LISTENING_THRESHOLDS: ScoreThreshold[] = [
  { minCorrect: 39, band: 9.0 },
  { minCorrect: 37, band: 8.5 },
  { minCorrect: 35, band: 8.0 },
  { minCorrect: 32, band: 7.5 },
  { minCorrect: 30, band: 7.0 },
  { minCorrect: 26, band: 6.5 },
  { minCorrect: 23, band: 6.0 },
  { minCorrect: 20, band: 5.5 },
  { minCorrect: 16, band: 5.0 },
  { minCorrect: 13, band: 4.5 },
  { minCorrect: 10, band: 4.0 },
  { minCorrect: 6, band: 3.5 },
  { minCorrect: 4, band: 3.0 },
  { minCorrect: 2, band: 2.5 },
  { minCorrect: 1, band: 2.0 },
  { minCorrect: 0, band: 0.0 },
];

const READING_ACADEMIC_THRESHOLDS: ScoreThreshold[] = [
  { minCorrect: 39, band: 9.0 },
  { minCorrect: 37, band: 8.5 },
  { minCorrect: 35, band: 8.0 },
  { minCorrect: 33, band: 7.5 },
  { minCorrect: 30, band: 7.0 },
  { minCorrect: 27, band: 6.5 },
  { minCorrect: 23, band: 6.0 },
  { minCorrect: 20, band: 5.5 },
  { minCorrect: 15, band: 5.0 },
  { minCorrect: 13, band: 4.5 },
  { minCorrect: 10, band: 4.0 },
  { minCorrect: 6, band: 3.5 },
  { minCorrect: 4, band: 3.0 },
  { minCorrect: 2, band: 2.5 },
  { minCorrect: 1, band: 2.0 },
  { minCorrect: 0, band: 0.0 },
];

const READING_GENERAL_THRESHOLDS: ScoreThreshold[] = [
  { minCorrect: 40, band: 9.0 },
  { minCorrect: 39, band: 8.5 },
  { minCorrect: 37, band: 8.0 },
  { minCorrect: 36, band: 7.5 },
  { minCorrect: 34, band: 7.0 },
  { minCorrect: 32, band: 6.5 },
  { minCorrect: 30, band: 6.0 },
  { minCorrect: 27, band: 5.5 },
  { minCorrect: 23, band: 5.0 },
  { minCorrect: 19, band: 4.5 },
  { minCorrect: 15, band: 4.0 },
  { minCorrect: 12, band: 3.5 },
  { minCorrect: 9, band: 3.0 },
  { minCorrect: 6, band: 2.5 },
  { minCorrect: 2, band: 2.0 },
  { minCorrect: 1, band: 1.0 },
  { minCorrect: 0, band: 0.0 },
];

/**
 * Calculates the IELTS band score for Listening or Reading.
 */
export function calculateBandScore(
  correctCount: number,
  skill: SkillType,
  moduleType: ExamModuleType = 'academic',
): number {
  const score = Math.max(0, Math.min(40, Math.round(correctCount)));
  const thresholds =
    skill === 'listening'
      ? LISTENING_THRESHOLDS
      : moduleType === 'academic'
        ? READING_ACADEMIC_THRESHOLDS
        : READING_GENERAL_THRESHOLDS;

  for (const threshold of thresholds) {
    if (score >= threshold.minCorrect) {
      return threshold.band;
    }
  }
  return 0.0;
}

// ==========================================
// 2. Answer Normalization Rules
// ==========================================

const UK_TO_US_MAP: Record<string, string> = {
  colour: 'color',
  theatre: 'theater',
  centre: 'center',
  organisation: 'organization',
  organise: 'organize',
  behaviour: 'behavior',
  travelling: 'traveling',
  licence: 'license',
  defence: 'defense',
  analyse: 'analyze',
  programme: 'program',
  neighbour: 'neighbor',
  flavour: 'flavor',
  labour: 'labor',
  humour: 'humor',
  apologise: 'apologize',
  catalogue: 'catalog',
};

/**
 * Normalizes user text responses to match IELTS standard answers.
 * - Strips leading/trailing spaces and trailing punctuation (. , ? !)
 * - Converts double spaces to single spaces
 * - Lowercases all characters
 * - Normalizes UK to US spellings
 * - Normalizes numeric commas
 * - Normalizes hyphens to spaces
 */
export function normalizeAnswer(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';

  let clean = value
    .trim()
    .toLowerCase()
    .replace(/(\d),(\d)/g, '$1$2') // Clean commas in numbers: 1,000 -> 1000
    .replace(/-/g, ' ') // Replace hyphens with spaces: part-time -> part time
    .replace(/\s+/g, ' ') // Clean double spaces/newlines
    .replace(/[.,?!]+$/, '') // Clean trailing punctuation in gap fills
    .trim();

  // If it's a comma-separated answer (e.g. for multi-select checkboxes), sort them to ignore user selection order
  if (clean.includes(',')) {
    return clean
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((word) => UK_TO_US_MAP[word] || word) // Map UK spelling variants
      .sort()
      .join(', ');
  }

  // Normalise words with UK to US spellings
  return clean
    .split(' ')
    .map((word) => UK_TO_US_MAP[word] || word)
    .join(' ');
}

/**
 * Expands optional words in parentheses into multiple variations.
 * E.g. "(a) laboratory" -> ["laboratory", "a laboratory"]
 */
export function expandOptionalParentheses(answer: string): string[] {
  const clean = answer.trim().replace(/\s+/g, ' ');
  const regex = /\(([^)]+)\)/g;

  if (!regex.test(clean)) return [clean];

  const withParentheses = clean
    .replace(/\(([^)]+)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  const withoutParentheses = clean
    .replace(/\(([^)]+)\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const results = new Set([withParentheses, withoutParentheses]);
  return Array.from(results).filter(Boolean);
}

/**
 * Evaluates whether a user's answer is correct based on a set of accepted normalized answers.
 * Supports variations, UK/US spelling variants, optionals in parentheses, and word limit checking.
 */
export function isCorrectAnswer(
  userAnswer: string | null | undefined,
  acceptedNormalizedAnswers: string[][], // Array of variants: e.g. [["30", "thirty"], ["years", "years old"]]
  maxWords?: number,
): boolean {
  if (maxWords !== undefined && maxWords !== null) {
    if (countWords(userAnswer) > maxWords) {
      return false;
    }
  }

  const normUser = normalizeAnswer(userAnswer);
  if (!normUser) return false;

  return acceptedNormalizedAnswers.some((variantGroup) =>
    variantGroup.some((variant) => {
      const expanded = expandOptionalParentheses(variant);
      return expanded.some((expandedVariant) => {
        const normAccepted = normalizeAnswer(expandedVariant);
        if (normAccepted === normUser) return true;

        // Handle options prefix matching (e.g. userAnswer is "iii. The wood..." and accepted is "iii")
        if (normUser.startsWith(normAccepted + '.') || normUser.startsWith(normAccepted + ' ')) {
          return true;
        }
        return false;
      });
    }),
  );
}

/**
 * Validates word limit rules (e.g. "NO MORE THAN TWO WORDS AND/OR A NUMBER")
 */
export function countWords(value: string | null | undefined): number {
  if (!value) return 0;
  const cleanStr = value.trim().replace(/\s+/g, ' ');
  if (cleanStr === '') return 0;
  return cleanStr.split(' ').length;
}

export function validateWordCount(value: string, maxWords: number): boolean {
  return countWords(value) <= maxWords;
}

// ==========================================
// 3. Drift-Proof Timer Engine
// ==========================================

export interface PauseRange {
  pausedAt: string; // ISO String
  resumedAt: string | null; // ISO String (null if currently paused)
}

/**
 * Pure function to calculate exact remaining seconds,
 * resilient to system sleep, app suspension, and thread latency.
 */
export function calculateRemainingTime(params: {
  startedAt: string; // ISO String
  durationSeconds: number;
  pauseRanges: PauseRange[];
  currentTime: string; // ISO String of current reference clock (usually new Date().toISOString())
}): number {
  const start = new Date(params.startedAt).getTime();
  const now = new Date(params.currentTime).getTime();

  let totalPausedDurationMs = 0;

  for (const range of params.pauseRanges) {
    const pausedTime = new Date(range.pausedAt).getTime();
    const resumedTime = range.resumedAt ? new Date(range.resumedAt).getTime() : now; // If still paused, use reference now time as upper bound

    if (resumedTime > pausedTime) {
      totalPausedDurationMs += resumedTime - pausedTime;
    }
  }

  // Is the exam started in the future? (Guard against system clock changes)
  if (now < start) {
    return params.durationSeconds;
  }

  const elapsedMs = now - start - totalPausedDurationMs;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  const remaining = params.durationSeconds - elapsedSeconds;
  return Math.max(0, remaining);
}

// ==========================================
// 4. Pedagogical Weakness Analysis & Safeguards
// ==========================================

export interface SkillWeakness {
  questionType: string;
  total: number;
  correct: number;
  accuracy: number; // 0 to 100
  status: 'proficient' | 'needs_improvement' | 'critical';
}

export function analyzeWeaknesses(
  userAnswers: Record<string, string>,
  test: any, // Using 'any' to avoid strict circular import issues, mapped to IeltsTest structure
): SkillWeakness[] {
  const typeMap: Record<string, { total: number; correct: number }> = {};

  if (!test || !test.sections) return [];

  test.sections.forEach((sec: any) => {
    if (!sec.questionGroups) return;
    sec.questionGroups.forEach((grp: any) => {
      if (!grp.questions) return;
      grp.questions.forEach((q: any) => {
        const type = q.type || 'unknown';
        if (!typeMap[type]) {
          typeMap[type] = { total: 0, correct: 0 };
        }

        typeMap[type].total += 1;
        const uAns = userAnswers[q.id];

        if (isCorrectAnswer(uAns, q.acceptedAnswers)) {
          typeMap[type].correct += 1;
        }
      });
    });
  });

  return Object.entries(typeMap).map(([questionType, stats]) => {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    let status: 'proficient' | 'needs_improvement' | 'critical' = 'critical';
    if (accuracy >= 80) {
      status = 'proficient';
    } else if (accuracy >= 50) {
      status = 'needs_improvement';
    }

    return {
      questionType,
      total: stats.total,
      correct: stats.correct,
      accuracy,
      status,
    };
  });
}

export interface BandEstimateResult {
  band: number;
  isEstimate: boolean;
  rawScore: string;
  message: string;
}

export function getEstimatedBandInfo(
  correctCount: number,
  totalQuestions: number,
  skill: SkillType,
  moduleType: ExamModuleType = 'academic',
): BandEstimateResult {
  if (totalQuestions <= 0) {
    return {
      band: 0.0,
      isEstimate: false,
      rawScore: '0/0',
      message: 'Khônng có câu hỏi nào được ghi nhận.',
    };
  }

  if (totalQuestions < 40) {
    // Pedagogy safeguard: scale count proportionally to 40 but label as practice estimate
    const scaledCorrect = Math.max(0, Math.min(40, Math.round((correctCount / totalQuestions) * 40)));
    const band = calculateBandScore(scaledCorrect, skill, moduleType);
    return {
      band,
      isEstimate: true,
      rawScore: `${correctCount}/${totalQuestions}`,
      message:
        'Đây là điểm ước tính dựa trên đề thi thử rút gọn (dưới 40 câu). Điểm thi thực tế có thể chênh lệch do phân bố độ khó.',
    };
  }

  // Standard 40-question exam
  const band = calculateBandScore(correctCount, skill, moduleType);
  return {
    band,
    isEstimate: false,
    rawScore: `${correctCount}/40`,
    message: 'Kết quả bài thi thực tế đầy đủ chuẩn IELTS.',
  };
}

// ==========================================
// 5. Adaptive Learning Recommendation Engine
// ==========================================

export interface StudyPlannerAdvice {
  adviceText: string;
  status: 'critical' | 'needs_improvement' | 'good' | 'new';
  recommendedAction: string;
}

export function generateStudyPlannerAdvice(params: {
  targetBand: number;
  examDate: string | null;
  weaknesses: SkillWeakness[];
}): StudyPlannerAdvice {
  const daysRemaining = params.examDate
    ? Math.ceil((new Date(params.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const lowestWeakness = [...params.weaknesses].sort((a, b) => a.accuracy - b.accuracy)[0];

  if (!lowestWeakness) {
    return {
      adviceText:
        'Chào mừng bạn đến với hệ thống học tập thích ứng! Hãy hoàn thành bài thi thử đầu tiên để AI phân tích điểm yếu và lên lộ trình học tối ưu.',
      status: 'new',
      recommendedAction: 'Làm đề thi thử Reading hoặc Listening đầu tiên',
    };
  }

  const formatTypeName = (type: string) => {
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const typeVi = formatTypeName(lowestWeakness.questionType);
  let urgency = 'bình thường';
  let adviceText = '';
  let status: 'critical' | 'needs_improvement' | 'good' = 'good';

  if (daysRemaining !== null) {
    if (daysRemaining <= 15) {
      urgency = 'CỰC KỲ KHẨN CẤP';
    } else if (daysRemaining <= 45) {
      urgency = 'CAO';
    }
  }

  if (lowestWeakness.accuracy < 50) {
    status = 'critical';
    adviceText = `Dựa trên phân tích lịch sử, bạn đang có điểm yếu chí mạng ở dạng câu hỏi **${typeVi}** với tỷ lệ chính xác cực thấp (**${lowestWeakness.accuracy}%**). `;
    if (daysRemaining !== null) {
      adviceText += `Với ngày thi dự kiến chỉ còn **${daysRemaining} ngày** (mức độ ưu tiên: ${urgency}), bạn cần lập tức luyện tập các khối câu hỏi ngắn thích ứng để cải thiện điểm số gấp trước khi thi!`;
    } else {
      adviceText += `Để đạt mục tiêu IELTS Band **${params.targetBand.toFixed(1)}**, bạn nên tập trung sửa ngay điểm yếu này bằng cách chạy các bài luyện tập thích ứng ngắn.`;
    }
  } else if (lowestWeakness.accuracy < 75) {
    status = 'needs_improvement';
    adviceText = `Khả năng làm bài dạng **${typeVi}** của bạn ở mức trung bình (**${lowestWeakness.accuracy}%**). Để chắc chắn đạt Band mục tiêu **${params.targetBand.toFixed(1)}**, bạn nên tăng cường luyện tập dạng này lên trên 80%.`;
  } else {
    adviceText = `Chúc mừng! Toàn bộ các kỹ năng làm bài của bạn đều đang đạt độ thành thạo rất tốt (trên **${lowestWeakness.accuracy}%**). Hãy tiếp tục làm đề thi thử chuẩn 40 câu để giữ vững phong độ ổn định.`;
  }

  return {
    adviceText,
    status,
    recommendedAction:
      lowestWeakness.accuracy < 75
        ? `Bắt đầu khối Luyện tập Thích ứng dạng ${typeVi} (5 phút)`
        : 'Làm đề thi thử trọn vẹn 40 câu tiếp theo',
  };
}

/**
 * Dynamic question filter/extractor for adaptive learning room.
 * Filters questions matching a specific question type across a collection of tests
 * to generate a mini focused training block test, excluding already completed questions.
 */
export function generateAdaptiveDiagnostic(
  tests: any[], // IeltsTest[]
  questionType: string,
  completedQuestionIds: string[] = [],
): any | null {
  const isCategoryFilter = questionType.startsWith('category:');
  const filterVal = isCategoryFilter ? questionType.substring(9) : questionType;

  const getCandidates = (excludeIds: string[]) => {
    const candidateBlocks: {
      testTitle: string;
      sectionInstructions: string;
      audioPath?: string;
      audioChecksum?: string;
      paragraphOptions?: any[];
      questions: any[];
    }[] = [];

    tests.forEach((test) => {
      if (!test.sections) return;
      test.sections.forEach((sec: any) => {
        if (!sec.questionGroups) return;
        sec.questionGroups.forEach((grp: any) => {
          if (!grp.questions) return;

          const matchedQuestionsInGroup: any[] = [];
          grp.questions.forEach((q: any) => {
            // Skip questions that are explicitly marked for mock test-only visibility
            if (q.displayMode === 'test') {
              return;
            }
            // Skip completed questions if they are in the exclusion list
            if (excludeIds.includes(q.id)) {
              return;
            }

            let isMatch = false;
            if (isCategoryFilter) {
              if (filterVal === 'collocations') {
                isMatch = q.category === 'cpe_part_1' || q.category === 'cpe_part_4' || q.category === 'collocations';
              } else if (filterVal === 'phrasal_verbs') {
                isMatch = q.category === 'cpe_part_1' || q.category === 'cpe_part_2' || q.category === 'phrasal_verbs';
              } else if (filterVal === 'idioms') {
                isMatch = q.category === 'cpe_part_2' || q.category === 'cpe_part_4' || q.category === 'idioms';
              } else if (filterVal === 'prepositions') {
                isMatch = q.category === 'cpe_part_2' || q.category === 'prepositions';
              } else if (filterVal === 'word_formation') {
                isMatch = q.category === 'cpe_part_3' || q.category === 'word_formation';
              } else if (filterVal === 'reading_comprehension') {
                isMatch = q.category === 'cpe_part_5' || q.category === 'reading_comprehension';
              } else {
                isMatch = q.category === filterVal;
              }
            } else {
              isMatch = q.type === filterVal || q.category === filterVal;
              if (!isMatch) {
                if (filterVal === 'gapped_text') {
                  isMatch = q.category === 'cpe_part_6';
                } else if (filterVal === 'multiple_matching') {
                  isMatch = q.category === 'cpe_part_7';
                } else if (filterVal === 'cpe_listen_part_1') {
                  isMatch = q.category === 'cpe_listen_part_1';
                } else if (filterVal === 'cpe_listen_part_2') {
                  isMatch = q.category === 'cpe_listen_part_2';
                } else if (filterVal === 'cpe_listen_part_3') {
                  isMatch = q.category === 'cpe_listen_part_3';
                } else if (filterVal === 'cpe_listen_part_4') {
                  isMatch = q.category === 'cpe_listen_part_4';
                }
              }
            }
            if (isMatch) {
              matchedQuestionsInGroup.push({
                ...q,
                testTitle: test.title,
                sectionInstructions: sec.instructions,
                audioPath: sec.audioPath,
                audioChecksum: sec.audioChecksum,
                passageHtml: sec.passageHtml || grp.passageHtml || q.passageHtml || null,
              });
            }
          });

          if (matchedQuestionsInGroup.length > 0) {
            candidateBlocks.push({
              testTitle: test.title,
              sectionInstructions: sec.instructions || '',
              audioPath: sec.audioPath,
              audioChecksum: sec.audioChecksum,
              paragraphOptions: grp.paragraphOptions,
              questions: matchedQuestionsInGroup,
            });
          }
        });
      });
    });
    return candidateBlocks;
  };

  // 1. Try to fetch candidate blocks that have NOT been completed yet
  let candidateBlocks = getCandidates(completedQuestionIds);

  // 2. Fallback: If no candidate blocks are left, reset the pool (ignore the completed list) to allow replaying
  if (candidateBlocks.length === 0 && completedQuestionIds.length > 0) {
    candidateBlocks = getCandidates([]);
  }

  if (candidateBlocks.length === 0) return null;

  // Shuffle and collect candidate blocks
  const shuffledBlocks = [...candidateBlocks].sort(() => Math.random() - 0.5);

  // Dynamically size the training set based on question complexity
  let sliceCount = 5;
  const lowerType = filterVal.toLowerCase();

  const isReadingComp =
    lowerType.includes('part_5') ||
    lowerType.includes('part_6') ||
    lowerType.includes('part_7') ||
    lowerType.includes('gapped_text') ||
    lowerType.includes('multiple_matching') ||
    lowerType.includes('reading_comprehension');

  const isSentenceBased =
    lowerType.includes('part_3') || // Word formation (usually 1 per group)
    lowerType.includes('part_4') || // Key word transformation (usually 1 per group)
    lowerType.includes('grammar') ||
    lowerType.includes('collocations') ||
    lowerType.includes('idioms') ||
    lowerType.includes('prepositions') ||
    lowerType.includes('phrasal_verbs');

  if (isReadingComp) {
    sliceCount = 1; // 1 long Reading passage (6-8 complex questions) is ideal
  } else if (isSentenceBased) {
    sliceCount = 12; // 12 sentences for a solid sentence-based practice sheet
  } else if (lowerType.includes('listen') || lowerType.includes('part_1') || lowerType.includes('part_2')) {
    sliceCount = 2; // 2 Cloze passages / Listening tasks (e.g., 12-16 questions) for a richer practice set
  } else {
    sliceCount = 10; // Default to a larger set of questions
  }

  const selectedBlocks = shuffledBlocks.slice(0, Math.min(sliceCount, shuffledBlocks.length));

  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  const readableTitle = isCategoryFilter
    ? `Chuyên đề ${filterVal
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')}`
    : `Dạng câu hỏi ${filterVal
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')}`;

  return {
    id: `adaptive_${filterVal}_${uuid}`,
    title: `Luyện tập thích ứng: ${readableTitle}`,
    skill: 'reading',
    type: 'academic',
    sections: [
      {
        id: `sec_adaptive`,
        instructions: `Hãy hoàn thành các khối câu hỏi chuyên sâu dưới đây để rèn luyện kỹ năng của bạn.`,
        audioPath: selectedBlocks[0]?.audioPath,
        audioChecksum: selectedBlocks[0]?.audioChecksum,
        questionGroups: selectedBlocks.map((block, bIdx) => ({
          id: `grp_adaptive_${bIdx}`,
          instruction: block.sectionInstructions || `Đọc đoạn văn hoặc thông tin bên dưới và điền đáp án chính xác.`,
          paragraphOptions: block.paragraphOptions,
          questions: block.questions,
        })),
      },
    ],
  };
}

// ==========================================
// 6. Pedagogical Micro-Skill Diagnostics
// ==========================================

export interface MicroSkillStats {
  skillName: string;
  description: string;
  score: number; // 0 - 100
  weight: number;
}

export const QUESTION_TYPE_TO_MICRO_SKILLS_MAP: Record<string, { skill: string; weight: number }[]> = {
  matching_headings: [
    { skill: 'Skimming & Gist Comprehension', weight: 0.5 },
    { skill: 'Identifying Topic Sentences', weight: 0.3 },
    { skill: 'Paraphrase Recognition', weight: 0.2 },
  ],
  true_false_not_given: [
    { skill: 'Scanning & Detail Location', weight: 0.4 },
    { skill: 'Fact vs. Opinion Analysis', weight: 0.4 },
    { skill: 'Negative & Modifying Words Sensitivity', weight: 0.2 },
  ],
  gap_fill: [
    { skill: 'Grammatical Word-Class Prediction', weight: 0.5 },
    { skill: 'Scanning & Detail Location', weight: 0.3 },
    { skill: 'Spelling Accuracy', weight: 0.2 },
  ],
  multiple_choice: [
    { skill: 'Distractor Elimination', weight: 0.4 },
    { skill: 'Deep Sentence Comprehension', weight: 0.4 },
    { skill: 'Paraphrase Recognition', weight: 0.2 },
  ],
};

/**
 * Advanced pedagogical diagnostics tool to calculate specific micro-skill profiles
 * based on the mapping matrix. Helpful for rendering granular skill dashboards.
 */
export function diagnoseMicroSkills(userAnswers: Record<string, string>, test: any): MicroSkillStats[] {
  const skillScores: Record<string, { totalWeight: number; weightedCorrect: number }> = {};

  if (!test || !test.sections) return [];

  test.sections.forEach((sec: any) => {
    if (!sec.questionGroups) return;
    sec.questionGroups.forEach((grp: any) => {
      if (!grp.questions) return;
      grp.questions.forEach((q: any) => {
        const qType = q.type || 'unknown';
        const isCorrect = isCorrectAnswer(userAnswers[q.id], q.acceptedAnswers);

        const mappedSkills = QUESTION_TYPE_TO_MICRO_SKILLS_MAP[qType] || [
          { skill: 'General Comprehension', weight: 1.0 },
        ];

        mappedSkills.forEach((mapping) => {
          if (!skillScores[mapping.skill]) {
            skillScores[mapping.skill] = { totalWeight: 0, weightedCorrect: 0 };
          }

          skillScores[mapping.skill].totalWeight += mapping.weight;
          if (isCorrect) {
            skillScores[mapping.skill].weightedCorrect += mapping.weight;
          }
        });
      });
    });
  });

  return Object.entries(skillScores).map(([skillName, stats]) => {
    const score = stats.totalWeight > 0 ? Math.round((stats.weightedCorrect / stats.totalWeight) * 100) : 0;

    let description = 'Rèn luyện khả năng đọc quét dữ liệu nhanh.';
    if (skillName === 'Skimming & Gist Comprehension') {
      description = 'Khả năng đọc lướt nắm bắt ý chính toàn đoạn.';
    } else if (skillName === 'Paraphrase Recognition') {
      description = 'Khả năng nhận diện từ khóa đồng nghĩa bị biến đổi.';
    } else if (skillName === 'Grammatical Word-Class Prediction') {
      description = 'Khả năng phán đoán loại từ cần điền dựa trên ngữ cảnh.';
    } else if (skillName === 'Scanning & Detail Location') {
      description = 'Đọc quét nhanh định vị thông tin chi tiết.';
    } else if (skillName === 'Fact vs. Opinion Analysis') {
      description = 'Phân tích và đối chiếu sự thật so với ý kiến chủ quan.';
    }

    return {
      skillName,
      description,
      score,
      weight: stats.totalWeight,
    };
  });
}

/**
 * Cambridge English Scale conversion benchmarks.
 * Each entry maps a raw score percentage threshold to a Cambridge Scale score.
 * Interpolation is piecewise linear between adjacent benchmarks.
 */
interface ScaleBenchmark {
  pct: number; // raw score percentage (0.0 – 1.0)
  scale: number; // Cambridge English Scale score
}

const CPE_BENCHMARKS: ScaleBenchmark[] = [
  { pct: 0.0, scale: 142 },
  { pct: 0.2, scale: 165 },
  { pct: 0.4, scale: 180 },
  { pct: 0.55, scale: 190 },
  { pct: 0.7, scale: 200 },
  { pct: 0.8, scale: 210 },
  { pct: 0.9, scale: 220 },
  { pct: 1.0, scale: 230 },
];

const CAE_BENCHMARKS: ScaleBenchmark[] = [
  { pct: 0.0, scale: 122 },
  { pct: 0.2, scale: 145 },
  { pct: 0.4, scale: 160 },
  { pct: 0.55, scale: 170 },
  { pct: 0.7, scale: 180 },
  { pct: 0.8, scale: 190 },
  { pct: 0.9, scale: 200 },
  { pct: 1.0, scale: 210 },
];

/**
 * Piecewise linear interpolation across benchmark bands.
 */
function interpolateScale(percentage: number, benchmarks: ScaleBenchmark[]): number {
  const pct = Math.max(0, Math.min(1.0, percentage));

  // Find the surrounding benchmark pair
  for (let i = 0; i < benchmarks.length - 1; i++) {
    const lo = benchmarks[i];
    const hi = benchmarks[i + 1];
    if (pct >= lo.pct && pct <= hi.pct) {
      const rangeWidth = hi.pct - lo.pct;
      if (rangeWidth === 0) return lo.scale;
      const t = (pct - lo.pct) / rangeWidth;
      return Math.round(lo.scale + t * (hi.scale - lo.scale));
    }
  }

  // Fallback: return last benchmark
  return benchmarks[benchmarks.length - 1].scale;
}

/**
 * Converts a raw score on a Cambridge CAE or CPE exam into a Cambridge English Scale score
 * using non-linear piecewise interpolation that approximates official Cambridge conversion tables.
 *
 * CPE (C2 Proficiency) Scale: ~142 to 230
 * CAE (C1 Advanced) Scale:    ~122 to 210
 */
export function convertRawToCambridgeScale(rawScore: number, totalQuestions: number, examType: 'CAE' | 'CPE'): number {
  if (totalQuestions <= 0) return 0;
  const percentage = Math.max(0, Math.min(1.0, rawScore / totalQuestions));
  const benchmarks = examType === 'CAE' ? CAE_BENCHMARKS : CPE_BENCHMARKS;
  return interpolateScale(percentage, benchmarks);
}

/**
 * Calculates the total weighted raw score and maximum possible weighted score
 * for a Cambridge English C2 Proficiency (CPE) Reading & Use of English mock exam:
 * - Part 1, 2, 3: 1 mark per question
 * - Part 4: up to 2 marks per question
 * - Part 5, 6: 2 marks per question
 * - Part 7: 1 mark per question
 */
export function calculateCpeWeightedScore(
  userAnswers: Record<string, string>,
  test: any,
): { rawScore: number; maxScore: number } {
  let rawScore = 0;
  let maxScore = 0;

  if (!test || !test.sections) return { rawScore, maxScore };

  test.sections.forEach((sec: any) => {
    if (!sec.questionGroups) return;
    sec.questionGroups.forEach((grp: any) => {
      if (!grp.questions) return;
      grp.questions.forEach((q: any) => {
        let weight = 1;
        const category = (q.category || '').toLowerCase();

        if (category.includes('part_4') || category.includes('part 4')) {
          weight = 2;
        } else if (category.includes('part_5') || category.includes('part 5')) {
          weight = 2;
        } else if (category.includes('part_6') || category.includes('part 6')) {
          weight = 2;
        } else if (category.includes('part_7') || category.includes('part 7')) {
          weight = 1;
        } else if (
          category.includes('part_1') ||
          category.includes('part 1') ||
          category.includes('part_2') ||
          category.includes('part 2') ||
          category.includes('part_3') ||
          category.includes('part 3')
        ) {
          weight = 1;
        } else {
          // General fallback based on CPE default parts
          weight = 1;
        }

        maxScore += weight;
        const uAns = userAnswers[q.id];
        if (isCorrectAnswer(uAns, q.acceptedAnswers)) {
          rawScore += weight;
        }
      });
    });
  });

  return { rawScore, maxScore };
}

/**
 * Returns the Cambridge grade label for a given Cambridge English Scale score.
 * Applicable to CPE (C2 Proficiency) exams.
 */
export function getCambridgeGrade(scaleScore: number): string {
  if (scaleScore >= 220) return 'Grade A';
  if (scaleScore >= 213) return 'Grade B';
  if (scaleScore >= 200) return 'Grade C (Pass)';
  if (scaleScore >= 180) return 'C1 Level';
  if (scaleScore >= 160) return 'B2 Level';
  return 'Below B2';
}

// ==========================================
// 7. Fish Coins & Spaced Repetition (Bẫy Chuột) Core
// ==========================================

/**
 * Calculates Fish Coin rewards based on answer accuracy and history
 */
export function calculateCoinsReward(isCorrect: boolean, wasCorrectBefore: boolean): number {
  if (!isCorrect) return 0;
  if (wasCorrectBefore) return 0; // No double rewarding
  return 15; // Standard Salomon fish coin reward 🐟
}

/**
 * Calculates the Fish Coin cost to unlock hints or solutions
 */
export function calculateHintUnlockCost(hintLevel: number): number {
  switch (hintLevel) {
    case 1:
      return 10; // Hint level 1: 10 coins
    case 2:
      return 20; // Hint level 2 (Full answer): 20 coins
    default:
      return 0;
  }
}

export interface MouseTrapEntry {
  questionId: string;
  timesFailed: number;
  consecutiveCorrect: number;
  addedAt: string; // ISO String
  lastReviewedAt: string | null;
  nextReviewAt: string; // ISO String
}

/**
 * Schedules the next review date for spaced repetition (Leitner-based Mouse Trap)
 */
export function scheduleNextReview(
  timesFailed: number,
  consecutiveCorrect: number,
  referenceDate = new Date().toISOString(),
): { nextReviewAt: string; intervalDays: number } {
  let intervalDays = 1; // Default: review tomorrow

  if (consecutiveCorrect > 0) {
    // Leitner levels: Day 1, Day 3, Day 7, Day 14, Day 30
    const intervals = [1, 3, 7, 14, 30];
    const index = Math.min(consecutiveCorrect - 1, intervals.length - 1);
    intervalDays = intervals[index];
  } else if (timesFailed > 1) {
    // If failed repeatedly, review within 12 hours (represented as 0.5 days)
    intervalDays = 0.5;
  }

  const nextDate = new Date(new Date(referenceDate).getTime() + intervalDays * 24 * 3600 * 1000);

  return {
    nextReviewAt: nextDate.toISOString(),
    intervalDays,
  };
}
