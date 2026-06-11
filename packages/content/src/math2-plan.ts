import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math2Strand = 'number' | 'geometry' | 'measurement' | 'review' | 'assessment';
export type Math2Semester = 1 | 2 | 'full_year';
export type Math2SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math2AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math2SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math2SourceKind;
}

export interface Math2Pattern {
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

export interface Math2TopicPlan {
  id: string;
  grade: 2;
  semester: Math2Semester;
  order: number;
  unit: string;
  strand: Math2Strand;
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
  patterns: Math2Pattern[];
  sourceFiles: Math2SourceFile[];
}

export const MATH2_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/CHIA SẺ TÀI LIỆU TOÁN LỚP 3-4-5-6/TAI LIEU TOAN 2';
export const MATH2_PROGRAM_IDS: ContentProgramId[] = ['vn_math_2', 'vn_math_thcs'];
export const MATH2_MATRIX_AXES: Math2AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

function source(fileName: string, kind: Math2SourceKind, format?: Math2SourceFile['format']): Math2SourceFile {
  const extension = format || (fileName.toLowerCase().endsWith('.docx') ? 'docx' : fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc');
  return {
    fileName,
    path: `${MATH2_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH2_LEARNING_MATRIX: Math2TopicPlan[] = [
  {
    id: 'math2.number.ops_100_carry',
    grade: 2,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'number',
    title: 'Phép cộng và phép trừ có nhớ trong phạm vi 100',
    shortTitle: 'Cộng trừ có nhớ phạm vi 100',
    description: 'Các phép cộng trừ dạng 26 + 4, 36 + 24, 9 + 5, 11 - 5, 50 - 15... Giải toán có lời văn.',
    programIds: MATH2_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math2.number.ops_1000'],
    learningObjectives: ['Thực hiện thành thạo cộng trừ có nhớ phạm vi 100', 'Tìm thành phần chưa biết (tìm x) trong phép cộng trừ', 'Giải các bài toán đố về nhiều hơn, ít hơn'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math2.ops_100.calc', title: 'Tính cộng trừ có nhớ', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] },
      { id: 'math2.ops_100.find_x', title: 'Tìm x trong phép cộng trừ', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['find_x'] },
      { id: 'math2.ops_100.word_prob', title: 'Toán đố nhiều hơn, ít hơn', level: 'application', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['word_problem'] }
    ],
    sourceFiles: [
      source('De-KT-HK1-ToanThang-L2-Toan.doc', 'exam'),
      source('bo-de-kiem-tra-hoc-ki-1-mon-toan-lop-2.doc', 'exam')
    ]
  },
  {
    id: 'math2.number.ops_1000',
    grade: 2,
    semester: 2,
    order: 20,
    unit: 'N2',
    strand: 'number',
    title: 'Các số trong phạm vi 1000 và phép tính cộng trừ',
    shortTitle: 'Số và phép tính phạm vi 1000',
    description: 'Đọc viết so sánh các số trong phạm vi 1000. Phép cộng trừ không nhớ và có nhớ đơn giản.',
    programIds: MATH2_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math2.number.ops_100_carry'],
    bridgeToTopicIds: ['math2.number.mul_div'],
    learningObjectives: ['Đọc, viết, so sánh số có ba chữ số', 'Cộng trừ không nhớ và có nhớ trong phạm vi 1000'],
    estimatedWeeks: 4,
    levels: ['foundation', 'core'],
    examTarget: ['school'],
    patterns: [
      { id: 'math2.ops_1000.structure', title: 'Đọc viết và so sánh số có 3 chữ số', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['structure'] },
      { id: 'math2.ops_1000.calc', title: 'Cộng trừ phạm vi 1000', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] }
    ],
    sourceFiles: [
      source('de-kiem-tra-cuoi-ki-1-mon-toan-lop-2-nam-2014-2015-truong-tieu-hoc-kim-an.doc', 'exam')
    ]
  },
  {
    id: 'math2.number.mul_div',
    grade: 2,
    semester: 2,
    order: 30,
    unit: 'N3',
    strand: 'number',
    title: 'Phép nhân và phép chia (Bảng nhân chia 2, 5)',
    shortTitle: 'Phép nhân phép chia lớp 2',
    description: 'Giới thiệu khái niệm phép nhân từ tổng các số hạng bằng nhau. Bảng nhân chia 2, 5.',
    programIds: MATH2_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math2.number.ops_100_carry'],
    bridgeToTopicIds: [],
    learningObjectives: ['Hiểu ý nghĩa phép nhân, phép chia', 'Học thuộc bảng nhân chia 2 và 5', 'Giải bài toán đố dùng phép nhân chia'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math2.mul_div.calc', title: 'Tính giá trị phép nhân chia cơ bản', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] },
      { id: 'math2.mul_div.expression', title: 'Biểu thức phối hợp cộng trừ nhân chia', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['expression'] },
      { id: 'math2.mul_div.word_prob', title: 'Giải toán có lời văn dùng nhân chia', level: 'application', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['word_problem'] }
    ],
    sourceFiles: [
      source('de-thi-hki-1-mon-toan-lop-2-yen-mi.doc', 'exam'),
      source('de-thi-violympic-toan-lop-2-nam-2015-2016.doc', 'exam')
    ]
  },
  {
    id: 'math2.geometry.lines_shapes',
    grade: 2,
    semester: 'full_year',
    order: 40,
    unit: 'G1',
    strand: 'geometry',
    title: 'Đường gấp khúc, hình tứ giác và tính độ dài',
    shortTitle: 'Đường gấp khúc, hình tứ giác',
    description: 'Nhận biết đường thẳng, đường cong, đường gấp khúc. Tính độ dài đường gấp khúc, chu vi hình tam giác, tứ giác.',
    programIds: MATH2_PROGRAM_IDS,
    conceptIds: ['math.basic_geometry'],
    skillIds: ['math.reason_basic_geometry'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    learningObjectives: ['Nhận biết đường thẳng, đường cong, ba điểm thẳng hàng', 'Tính độ dài đường gấp khúc', 'Đếm hình tứ giác, hình tam giác'],
    estimatedWeeks: 3,
    levels: ['foundation', 'core'],
    examTarget: ['school'],
    patterns: [
      { id: 'math2.geometry.polyline', title: 'Tính độ dài đường gấp khúc', level: 'foundation', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['polyline'] },
      { id: 'math2.geometry.count_quads', title: 'Đếm hình tam giác, hình tứ giác', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['counting'] }
    ],
    sourceFiles: [
      source('de-kiem-tra-hoc-ki-1-mon-toan-lop-2-nam-2015-2016-truong-th-my-thanh.doc', 'exam'),
      source('de-thi-violympic-toan-lop-2-vong-10.doc', 'exam')
    ]
  }
];

export const MATH2_ACCESS_INDEX = buildMath2AccessIndex(MATH2_LEARNING_MATRIX);

function buildMath2AccessIndex(topics: Math2TopicPlan[]): Record<Math2AccessAxis, Record<string, string[]>> {
  const index: Record<Math2AccessAxis, Record<string, string[]>> = {
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
