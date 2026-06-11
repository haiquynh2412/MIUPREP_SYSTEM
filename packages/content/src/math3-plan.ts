import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math3Strand = 'number' | 'geometry' | 'measurement' | 'word_problems' | 'review' | 'assessment';
export type Math3Semester = 1 | 2 | 'full_year';
export type Math3SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math3AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math3SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math3SourceKind;
}

export interface Math3Pattern {
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

export interface Math3TopicPlan {
  id: string;
  grade: 3;
  semester: Math3Semester;
  order: number;
  unit: string;
  strand: Math3Strand;
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
  patterns: Math3Pattern[];
  sourceFiles: Math3SourceFile[];
}

export const MATH3_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/CHIA SẺ TÀI LIỆU TOÁN LỚP 3-4-5-6/TAI LIEU TOAN 3';
export const MATH3_PROGRAM_IDS: ContentProgramId[] = ['vn_math_3', 'vn_math_thcs'];
export const MATH3_MATRIX_AXES: Math3AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

function source(fileName: string, kind: Math3SourceKind, format?: Math3SourceFile['format']): Math3SourceFile {
  const extension = format || (fileName.toLowerCase().endsWith('.docx') ? 'docx' : fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc');
  return {
    fileName,
    path: `${MATH3_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH3_LEARNING_MATRIX: Math3TopicPlan[] = [
  {
    id: 'math3.number.mul_div_table',
    grade: 3,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'number',
    title: 'Bảng nhân và bảng chia từ 6 đến 9',
    shortTitle: 'Bảng nhân chia 6-9',
    description: 'Học thuộc và vận dụng bảng nhân chia 6, 7, 8, 9. Nhân chia số có hai, ba chữ số với số có một chữ số.',
    programIds: MATH3_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math3.number.ops_100000'],
    learningObjectives: ['Học thuộc bảng nhân chia từ 6 đến 9', 'Thực hiện phép tính nhân chia ngoài bảng', 'Tính nhanh biểu thức số học'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math3.mul_div.table_calc', title: 'Tính toán bảng nhân chia 6-9', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] },
      { id: 'math3.mul_div.long_ops', title: 'Phép nhân chia số có nhiều chữ số', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['long_ops'] },
      { id: 'math3.mul_div.fast_calc', title: 'Tính nhanh biểu thức số học lớp 3', level: 'advanced', cognitiveLevel: 'evaluate', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['fast_calc'] }
    ],
    sourceFiles: [
      source('CHUYEN DE TINH NHANH.docx', 'practice'),
      source('DE KIEM TRA HK I.doc', 'exam')
    ]
  },
  {
    id: 'math3.number.ops_100000',
    grade: 3,
    semester: 2,
    order: 20,
    unit: 'N2',
    strand: 'number',
    title: 'Các số trong phạm vi 100 000 và phép tính',
    shortTitle: 'Số và phép tính phạm vi 100k',
    description: 'Đọc viết so sánh số trong phạm vi 100 000. Phép cộng, trừ, nhân, chia trong phạm vi 100 000.',
    programIds: MATH3_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math3.number.mul_div_table'],
    bridgeToTopicIds: ['math3.word_problems.reduce_unit'],
    learningObjectives: ['Đọc viết so sánh số có 4, 5 chữ số', 'Thực hiện phép tính cộng, trừ, nhân, chia phạm vi 100 000', 'Giải bài toán tìm x cơ bản'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math3.ops_100k.structure', title: 'Đọc viết và so sánh số đến 100 000', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['structure'] },
      { id: 'math3.ops_100k.calc', title: 'Cộng trừ nhân chia phạm vi 100 000', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] },
      { id: 'math3.ops_100k.find_x', title: 'Tìm x trong biểu thức lớp 3', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['find_x'] }
    ],
    sourceFiles: [
      source('TIM X.docx', 'practice'),
      source('DE KIEM TRA HK II.doc', 'exam')
    ]
  },
  {
    id: 'math3.word_problems.reduce_unit',
    grade: 3,
    strand: 'word_problems',
    semester: 'full_year',
    order: 30,
    unit: 'WP1',
    title: 'Giải toán có lời văn (Toán rút về đơn vị, tính tuổi...)',
    shortTitle: 'Toán có lời văn lớp 3',
    description: 'Bài toán liên quan đến rút về đơn vị. Bài toán giải bằng hai phép tính. Bài toán tính tuổi và tìm một phần mấy.',
    programIds: MATH3_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math3.number.ops_100000'],
    bridgeToTopicIds: [],
    learningObjectives: ['Giải bài toán liên quan đến rút về đơn vị', 'Giải bài toán bằng hai phép tính', 'Giải bài toán tính tuổi và tìm một phần mấy'],
    estimatedWeeks: 8,
    levels: ['core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math3.word_prob.two_steps', title: 'Giải toán bằng hai phép tính', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['word_problem'] },
      { id: 'math3.word_prob.reduce_unit', title: 'Toán rút về đơn vị', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['word_problem', 'reduce_unit'] },
      { id: 'math3.word_prob.age', title: 'Bài toán tính tuổi và tìm một phần mấy', level: 'advanced', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['age', 'fraction'] }
    ],
    sourceFiles: [
      source('CHUYÊN ĐỀ RÚT VỀ ĐƠN VỊ.doc', 'practice'),
      source('BÀI TẬP TOÁN LỚP 3 GIẢI BẰNG 2 PHÉP TÍNH  XXX.doc', 'practice'),
      source('DẠNG TOÁN TUỔI LỚP 3.doc', 'practice'),
      source('TIM 1 PHAN MAY CUA MOT SO.docx', 'practice')
    ]
  },
  {
    id: 'math3.geometry.midpoint_perimeter_area',
    grade: 3,
    semester: 'full_year',
    order: 40,
    unit: 'G1',
    strand: 'geometry',
    title: 'Điểm ở giữa, trung điểm, chu vi và diện tích hình chữ nhật, hình vuông',
    shortTitle: 'Chu vi diện tích lớp 3',
    description: 'Xác định điểm ở giữa và trung điểm đoạn thẳng. Tính chu vi và diện tích hình chữ nhật, hình vuông.',
    programIds: MATH3_PROGRAM_IDS,
    conceptIds: ['math.basic_geometry'],
    skillIds: ['math.reason_basic_geometry'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    learningObjectives: ['Xác định được trung điểm đoạn thẳng', 'Tính chu vi hình chữ nhật, hình vuông', 'Tính diện tích hình chữ nhật, hình vuông'],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math3.geometry.midpoint', title: 'Trung điểm đoạn thẳng', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['midpoint'] },
      { id: 'math3.geometry.perimeter', title: 'Tính chu vi hình vuông, chữ nhật', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['perimeter'] },
      { id: 'math3.geometry.area', title: 'Tính diện tích hình vuông, chữ nhật', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['area'] }
    ],
    sourceFiles: [
      source('CHUYÊN ĐỀ HÌNH HỌC LỚP 3.doc', 'practice'),
      source('CHUYÊN ĐỀ HÌNH HỌC.docx', 'practice')
    ]
  }
];

export const MATH3_ACCESS_INDEX = buildMath3AccessIndex(MATH3_LEARNING_MATRIX);

function buildMath3AccessIndex(topics: Math3TopicPlan[]): Record<Math3AccessAxis, Record<string, string[]>> {
  const index: Record<Math3AccessAxis, Record<string, string[]>> = {
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
