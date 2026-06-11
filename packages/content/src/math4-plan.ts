import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math4Strand = 'number' | 'algebra' | 'geometry' | 'word_problems' | 'review' | 'assessment';
export type Math4Semester = 1 | 2 | 'full_year';
export type Math4SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math4AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math4SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math4SourceKind;
}

export interface Math4Pattern {
  id: string;
  title: string;
  level: MathLearningLevel;
  cognitiveLevel: CognitiveLevel;
  conceptIds: string[];
  skillIds: string[];
  prerequisitePatternIds?: string[];
  tags: string[];
  sourceFileNames?: string[];
}

export interface Math4TopicPlan {
  id: string;
  grade: 4;
  semester: Math4Semester;
  order: number;
  unit: string;
  strand: Math4Strand;
  title: string;
  shortTitle: string;
  description: string;
  programIds: ContentProgramId[];
  conceptIds: string[];
  skillIds: string[];
  prerequisiteTopicIds: string[];
  bridgeToTopicIds: string[];
  learningObjectives: string[];
  estimatedWeeks: number;
  levels: MathLearningLevel[];
  examTarget: string[];
  patterns: Math4Pattern[];
  sourceFiles: Math4SourceFile[];
}

export const MATH4_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/CHIA SẺ TÀI LIỆU TOÁN LỚP 3-4-5-6/TAI LIEU TOAN 4';
export const MATH4_PROGRAM_IDS: ContentProgramId[] = ['vn_math_4', 'vn_math_thcs'];
export const MATH4_MATRIX_AXES: Math4AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

function source(fileName: string, kind: Math4SourceKind, format?: Math4SourceFile['format']): Math4SourceFile {
  const extension = format || (fileName.toLowerCase().endsWith('.docx') ? 'docx' : fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc');
  return {
    fileName,
    path: `${MATH4_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH4_LEARNING_MATRIX: Math4TopicPlan[] = [
  {
    id: 'math4.number.natural_ops',
    grade: 4,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'number',
    title: 'Số tự nhiên và các phép tính (cộng, trừ, nhân, chia)',
    shortTitle: 'Số tự nhiên và phép tính',
    description: 'Đọc viết so sánh số tự nhiên đến lớp triệu. Nhân chia với số có 2, 3 chữ số. Tính giá trị biểu thức và tính nhanh.',
    programIds: MATH4_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math4.number.divisibility'],
    learningObjectives: ['Đọc viết so sánh số tự nhiên lớp triệu', 'Thực hiện thành thạo phép tính cộng trừ nhân chia', 'Tính giá trị biểu thức chứa chữ và tính nhanh'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math4.natural_ops.structure', title: 'Cấu tạo số tự nhiên lớp triệu', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['structure'] },
      { id: 'math4.natural_ops.calc', title: 'Tính toán biểu thức và tìm x lớp 4', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] },
      { id: 'math4.natural_ops.fast_calc', title: 'Tính nhanh dãy số tự nhiên', level: 'advanced', cognitiveLevel: 'evaluate', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['fast_calc'] }
    ],
    sourceFiles: [
      source('BAI TOAN TINH TONG CUA DAY SO CACH DEU.doc', 'practice'),
      source('DE KIEM TRA HK I.doc', 'exam')
    ]
  },
  {
    id: 'math4.number.divisibility',
    grade: 4,
    semester: 1,
    order: 20,
    unit: 'N2',
    strand: 'number',
    title: 'Dấu hiệu chia hết cho 2, 3, 5, 9',
    shortTitle: 'Dấu hiệu chia hết',
    description: 'Nhận biết số chia hết cho 2, 3, 5, 9. Vận dụng tìm chữ số chưa biết thỏa điều kiện chia hết.',
    programIds: MATH4_PROGRAM_IDS,
    conceptIds: ['math.divisibility_number_theory'],
    skillIds: ['math.apply_divisibility_prime_gcd_lcm'],
    prerequisiteTopicIds: ['math4.number.natural_ops'],
    bridgeToTopicIds: ['math4.number.fractions'],
    learningObjectives: ['Áp dụng đúng dấu hiệu chia hết 2, 3, 5, 9', 'Tìm chữ số chưa biết thỏa mãn chia hết', 'Chứng minh hoặc lập số chia hết'],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math4.divisibility.basic', title: 'Nhận diện số chia hết cơ bản', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.divisibility_number_theory'], skillIds: ['math.apply_divisibility_prime_gcd_lcm'], tags: ['divisibility'] },
      { id: 'math4.divisibility.find_digit', title: 'Tìm chữ số chưa biết thỏa điều kiện chia hết', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.divisibility_number_theory'], skillIds: ['math.apply_divisibility_prime_gcd_lcm'], tags: ['find_digit'] },
      { id: 'math4.divisibility.make_number', title: 'Lập số thỏa điều kiện chia hết', level: 'advanced', cognitiveLevel: 'analyze', conceptIds: ['math.divisibility_number_theory'], skillIds: ['math.apply_divisibility_prime_gcd_lcm'], tags: ['make_number'] }
    ],
    sourceFiles: [
      source('BAI TAP DAU HIEU CHIA HET.doc', 'practice'),
      source('CHUYEN DE BOI DUONG HS GIOI.doc', 'hsg')
    ]
  },
  {
    id: 'math4.number.fractions',
    grade: 4,
    semester: 2,
    order: 30,
    unit: 'N3',
    strand: 'number',
    title: 'Phân số và các phép tính phân số',
    shortTitle: 'Phân số và phép tính',
    description: 'Khái niệm phân số, tính chất cơ bản, rút gọn và so sánh phân số. Phép cộng, trừ, nhân, chia phân số.',
    programIds: MATH4_PROGRAM_IDS,
    conceptIds: ['math.fraction_decimal'],
    skillIds: ['math.operate_fractions_decimals_percent'],
    prerequisiteTopicIds: ['math4.number.natural_ops'],
    bridgeToTopicIds: ['math4.word_problems.sum_ratio'],
    learningObjectives: ['Rút gọn và so sánh phân số thành thạo', 'Cộng trừ nhân chia phân số', 'Giải bài toán tìm x và tính nhanh biểu thức phân số'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math4.fractions.compare', title: 'Rút gọn và so sánh phân số', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.fraction_decimal'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['compare'] },
      { id: 'math4.fractions.ops', title: 'Cộng trừ nhân chia phân số', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.fraction_decimal'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['calc'] },
      { id: 'math4.fractions.fast_calc', title: 'Tính nhanh biểu thức phân số lớp 4', level: 'advanced', cognitiveLevel: 'evaluate', conceptIds: ['math.fraction_decimal'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['fast_calc'] }
    ],
    sourceFiles: [
      source('BAI TAP ON HE MON TOAN 4.doc', 'practice'),
      source('DE KIEM TRA HK II.doc', 'exam')
    ]
  },
  {
    id: 'math4.word_problems.average_sum_diff',
    grade: 4,
    strand: 'word_problems',
    semester: 'full_year',
    order: 40,
    unit: 'WP1',
    title: 'Tìm số trung bình cộng và tìm hai số khi biết Tổng và Hiệu',
    shortTitle: 'Trung bình cộng, Tổng - Hiệu',
    description: 'Bài toán tìm số trung bình cộng. Bài toán tìm hai số khi biết Tổng và Hiệu số của hai số đó.',
    programIds: MATH4_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math4.number.natural_ops'],
    bridgeToTopicIds: ['math4.word_problems.sum_ratio'],
    learningObjectives: ['Giải bài toán tìm số trung bình cộng nâng cao', 'Giải bài toán Tìm hai số khi biết Tổng và Hiệu', 'Phối hợp toán tuổi và trung bình cộng'],
    estimatedWeeks: 5,
    levels: ['core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math4.word_prob.average', title: 'Toán trung bình cộng nâng cao', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['average'] },
      { id: 'math4.word_prob.sum_diff', title: 'Toán Tìm hai số khi biết Tổng và Hiệu', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['sum_diff'] },
      { id: 'math4.word_prob.average_age', title: 'Toán tuổi phối hợp trung bình cộng', level: 'advanced', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['age', 'average'] }
    ],
    sourceFiles: [
      source('CHUYEN DE BOI DUONG HSG LOP 4-TRUNG BINH CONG.doc', 'practice'),
      source('CHUYEN DE CAC DANG TOAN TINH TUOI.doc', 'practice')
    ]
  },
  {
    id: 'math4.word_problems.sum_ratio',
    grade: 4,
    strand: 'word_problems',
    semester: 'full_year',
    order: 50,
    unit: 'WP2',
    title: 'Tìm hai số khi biết Tổng và Tỉ, Hiệu và Tỉ',
    shortTitle: 'Tổng - Tỉ và Hiệu - Tỉ',
    description: 'Giải bài toán Tìm hai số khi biết Tổng và Tỉ số, Hiệu và Tỉ số của hai số đó. Vận dụng sơ đồ đoạn thẳng.',
    programIds: MATH4_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math4.number.fractions', 'math4.word_problems.average_sum_diff'],
    bridgeToTopicIds: [],
    learningObjectives: ['Vẽ sơ đồ đoạn thẳng biểu thị mối quan hệ Tổng/Hiệu và Tỉ số', 'Giải bài toán Tìm hai số khi biết Tổng và Tỉ số', 'Giải bài toán Tìm hai số khi biết Hiệu và Tỉ số'],
    estimatedWeeks: 6,
    levels: ['core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math4.word_prob.sum_ratio', title: 'Toán Tìm hai số khi biết Tổng và Tỉ số', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['sum_ratio'] },
      { id: 'math4.word_prob.diff_ratio', title: 'Toán Tìm hai số khi biết Hiệu và Tỉ số', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['diff_ratio'] },
      { id: 'math4.word_prob.mixed_ratio', title: 'Bài toán tỉ số ẩn hoặc thay đổi tỉ số', level: 'advanced', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['mixed_ratio'] }
    ],
    sourceFiles: [
      source('TIM HAI SO KHI BIET TONG VA TI.doc', 'practice'),
      source('DE THI HSG LOP 4.doc', 'hsg')
    ]
  },
  {
    id: 'math4.geometry.parallel_perpendicular_area',
    grade: 4,
    semester: 'full_year',
    order: 60,
    unit: 'G1',
    strand: 'geometry',
    title: 'Đường thẳng song song, vuông góc. Diện tích hình bình hành, hình thoi',
    shortTitle: 'Hình bình hành, hình thoi',
    description: 'Nhận biết hai đường thẳng song song, vuông góc. Tính chu vi và diện tích hình bình hành, hình thoi.',
    programIds: MATH4_PROGRAM_IDS,
    conceptIds: ['math.basic_geometry'],
    skillIds: ['math.reason_basic_geometry'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    learningObjectives: ['Nhận biết góc nhọn, góc tù, góc bẹt, song song, vuông góc', 'Tính chu vi và diện tích hình bình hành', 'Tính diện tích hình thoi'],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math4.geometry.relation', title: 'Nhận diện góc và song song vuông góc', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['geometry'] },
      { id: 'math4.geometry.parallelogram', title: 'Diện tích hình bình hành', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['parallelogram'] },
      { id: 'math4.geometry.rhombus', title: 'Diện tích hình thoi', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['rhombus'] }
    ],
    sourceFiles: [
      source('CAC BAI TOAN CO NOI DUNG HINH HOC.doc', 'practice')
    ]
  }
];

export const MATH4_ACCESS_INDEX = buildMath4AccessIndex(MATH4_LEARNING_MATRIX);

function buildMath4AccessIndex(topics: Math4TopicPlan[]): Record<Math4AccessAxis, Record<string, string[]>> {
  const index: Record<Math4AccessAxis, Record<string, string[]>> = {
    grade: {}, semester: {}, strand: {}, unit: {}, topic: {}, level: {}, examTarget: {}
  };

  topics.forEach((topic) => {
    addIndex(index.grade, topic.grade, topic.id);
    addIndex(index.semester, topic.semester, topic.id);
    addIndex(index.strand, topic.strand, topic.id);
    addIndex(index.unit, topic.unit, topic.id);
    addIndex(index.topic, topic.id, topic.id);
    topic.levels.forEach((level) => addIndex(index.level, level, topic.id));
    topic.examTarget.forEach((target) => addIndex(index.examTarget, target, topic.id));
  });

  return index;
}

function addIndex(index: Record<string, string[]>, key: string | number, topicId: string): void {
  const normalized = String(key);
  index[normalized] = index[normalized] || [];
  if (!index[normalized].includes(topicId)) index[normalized].push(topicId);
}
