import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math1Strand = 'number' | 'geometry' | 'measurement' | 'review' | 'assessment';
export type Math1Semester = 1 | 2 | 'full_year';
export type Math1SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math1AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math1SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math1SourceKind;
}

export interface Math1Pattern {
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

export interface Math1TopicPlan {
  id: string;
  grade: 1;
  semester: Math1Semester;
  order: number;
  unit: string;
  strand: Math1Strand;
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
  patterns: Math1Pattern[];
  sourceFiles: Math1SourceFile[];
}

export const MATH1_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/CHIA SẺ TÀI LIỆU TOÁN LỚP 3-4-5-6/TAI LIEU TOAN 1';
export const MATH1_PROGRAM_IDS: ContentProgramId[] = ['vn_math_1', 'vn_math_thcs'];
export const MATH1_MATRIX_AXES: Math1AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

function source(fileName: string, kind: Math1SourceKind, format?: Math1SourceFile['format']): Math1SourceFile {
  const extension = format || (fileName.toLowerCase().endsWith('.docx') ? 'docx' : fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc');
  return {
    fileName,
    path: `${MATH1_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH1_LEARNING_MATRIX: Math1TopicPlan[] = [
  {
    id: 'math1.number.counting_10',
    grade: 1,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'number',
    title: 'Đếm số và so sánh trong phạm vi 10',
    shortTitle: 'Đếm và so sánh phạm vi 10',
    description: 'Nhận biết, đọc, viết, đếm các số trong phạm vi 10. So sánh các số bằng dấu >, <, =.',
    programIds: MATH1_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math1.number.ops_10'],
    learningObjectives: ['Nhận biết số lượng vật trong phạm vi 10', 'Đọc viết thành thạo các số từ 0 đến 10', 'So sánh hai số trong phạm vi 10'],
    estimatedWeeks: 4,
    levels: ['foundation', 'core'],
    examTarget: ['school'],
    patterns: [
      { id: 'math1.counting_10.identify', title: 'Đếm số lượng vật thể', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['counting'] },
      { id: 'math1.counting_10.compare', title: 'So sánh các số trong phạm vi 10', level: 'core', cognitiveLevel: 'understand', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['compare'] }
    ],
    sourceFiles: [source('de-kiem-tra-giua-ki-1-mon-toan-lop-1-nam-2013-2014.doc', 'exam')]
  },
  {
    id: 'math1.number.ops_10',
    grade: 1,
    semester: 1,
    order: 20,
    unit: 'N2',
    strand: 'number',
    title: 'Phép cộng và phép trừ trong phạm vi 10',
    shortTitle: 'Cộng trừ phạm vi 10',
    description: 'Bảng cộng và bảng trừ trong phạm vi 10. Giải toán có lời văn dạng cộng trừ đơn giản.',
    programIds: MATH1_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math1.number.counting_10'],
    bridgeToTopicIds: ['math1.number.counting_100'],
    learningObjectives: ['Thực hiện phép cộng, phép trừ phạm vi 10', 'Tính toán biểu thức có 2 phép tính', 'Giải bài toán đố đơn giản'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math1.ops_10.calc', title: 'Tính giá trị phép tính cộng trừ', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] },
      { id: 'math1.ops_10.expression', title: 'Tính biểu thức dãy số', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['expression'] },
      { id: 'math1.ops_10.word_prob', title: 'Bài toán có lời văn phạm vi 10', level: 'application', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['word_problem'] }
    ],
    sourceFiles: [
      source('bai-tap-toan-co-loi-van-lop-1.doc', 'practice'),
      source('de-kiem-tra-cuoi-ki-1-mon-toan-lop-1-nam-2014-2015.doc', 'exam')
    ]
  },
  {
    id: 'math1.number.counting_100',
    grade: 1,
    semester: 2,
    order: 30,
    unit: 'N3',
    strand: 'number',
    title: 'Các số trong phạm vi 100 và cộng trừ không nhớ',
    shortTitle: 'Số và phép tính phạm vi 100',
    description: 'Đọc viết các số đến 100. Phép cộng và phép trừ không nhớ trong phạm vi 100.',
    programIds: MATH1_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math1.number.ops_10'],
    bridgeToTopicIds: [],
    learningObjectives: ['Nhận biết cấu tạo số chục và đơn vị', 'Thực hiện phép tính cộng trừ không nhớ phạm vi 100', 'Giải bài toán đố phạm vi 100'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math1.counting_100.read_write', title: 'Đọc viết số và phân tích cấu tạo', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['structure'] },
      { id: 'math1.counting_100.ops', title: 'Cộng trừ không nhớ phạm vi 100', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['calc'] },
      { id: 'math1.counting_100.word_prob', title: 'Bài toán đố không nhớ phạm vi 100', level: 'application', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['word_problem'] }
    ],
    sourceFiles: [
      source('de-on-tap-toan-hoc-ki2-lop-1.1.doc', 'review'),
      source('13_De_Thi_Toan_Lop_1_HK1-2010-2011.doc', 'exam')
    ]
  },
  {
    id: 'math1.geometry.basic',
    grade: 1,
    semester: 'full_year',
    order: 40,
    unit: 'G1',
    strand: 'geometry',
    title: 'Hình học phẳng cơ bản',
    shortTitle: 'Hình học phẳng lớp 1',
    description: 'Nhận diện hình vuông, hình tròn, hình tam giác. Đếm hình vẽ cơ bản.',
    programIds: MATH1_PROGRAM_IDS,
    conceptIds: ['math.basic_geometry'],
    skillIds: ['math.reason_basic_geometry'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    learningObjectives: ['Nhận diện chính xác hình vuông, hình tròn, hình tam giác', 'Đếm được số lượng hình tam giác, hình vuông đơn giản trong tranh vẽ'],
    estimatedWeeks: 2,
    levels: ['foundation', 'core'],
    examTarget: ['school'],
    patterns: [
      { id: 'math1.geometry.identify', title: 'Nhận biết hình dạng hình học', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['geometry'] },
      { id: 'math1.geometry.count_shapes', title: 'Đếm số hình trong hình phức hợp', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['counting'] }
    ],
    sourceFiles: [
      source('GIAO LƯU HỌC SINH GIỎI CẤP TRƯỜNG.doc', 'exam'),
      source('TUYỂN TẬP ĐỂ THI GIỮA KỲ I MÔN TOÁN 1 - P1.doc', 'exam')
    ]
  }
];

export const MATH1_ACCESS_INDEX = buildMath1AccessIndex(MATH1_LEARNING_MATRIX);

function buildMath1AccessIndex(topics: Math1TopicPlan[]): Record<Math1AccessAxis, Record<string, string[]>> {
  const index: Record<Math1AccessAxis, Record<string, string[]>> = {
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
