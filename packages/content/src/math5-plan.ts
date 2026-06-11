import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math5Strand = 'number' | 'geometry' | 'measurement' | 'word_problems' | 'review' | 'assessment' | 'advanced';
export type Math5Semester = 1 | 2 | 'full_year';
export type Math5SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math5AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math5SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math5SourceKind;
}

export interface Math5Pattern {
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

export interface Math5TopicPlan {
  id: string;
  grade: 5;
  semester: Math5Semester;
  order: number;
  unit: string;
  strand: Math5Strand;
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
  patterns: Math5Pattern[];
  sourceFiles: Math5SourceFile[];
}

export const MATH5_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/CHIA SẺ TÀI LIỆU TOÁN LỚP 3-4-5-6/TAI LIEU TOAN 5';
export const MATH5_PROGRAM_IDS: ContentProgramId[] = ['vn_math_5', 'vn_math_thcs'];
export const MATH5_MATRIX_AXES: Math5AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

function source(fileName: string, kind: Math5SourceKind, format?: Math5SourceFile['format']): Math5SourceFile {
  const extension = format || (fileName.toLowerCase().endsWith('.docx') ? 'docx' : fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc');
  return {
    fileName,
    path: `${MATH5_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH5_LEARNING_MATRIX: Math5TopicPlan[] = [
  {
    id: 'math5.number.decimals',
    grade: 5,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'number',
    title: 'Số thập phân và các phép tính',
    shortTitle: 'Số thập phân',
    description: 'Đọc viết so sánh số thập phân. Phép cộng, trừ, nhân, chia số thập phân. Viết các số đo dưới dạng số thập phân.',
    programIds: MATH5_PROGRAM_IDS,
    conceptIds: ['math.fraction_decimal'],
    skillIds: ['math.operate_fractions_decimals_percent'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math5.number.percentage'],
    learningObjectives: ['Đọc viết so sánh số thập phân thành thạo', 'Cộng trừ nhân chia số thập phân', 'Đổi đơn vị đo bằng số thập phân'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math5.decimals.compare', title: 'Đọc viết và so sánh số thập phân', level: 'foundation', cognitiveLevel: 'remember', conceptIds: ['math.fraction_decimal'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['compare'] },
      { id: 'math5.decimals.ops', title: 'Phép tính cộng trừ nhân chia thập phân', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.fraction_decimal'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['calc'] },
      { id: 'math5.decimals.unit_convert', title: 'Đổi số đo đại lượng dùng số thập phân', level: 'advanced', cognitiveLevel: 'apply', conceptIds: ['math.fraction_decimal'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['unit_convert'] }
    ],
    sourceFiles: [
      source('BT NANG CAO VE SO THAP PHAN.doc', 'practice'),
      source('BT GIAI BANG PP THU CHON.doc', 'practice')
    ]
  },
  {
    id: 'math5.number.percentage',
    grade: 5,
    semester: 1,
    order: 20,
    unit: 'N2',
    strand: 'number',
    title: 'Tỉ số phần trăm và giải toán tỉ số phần trăm',
    shortTitle: 'Toán tỉ số phần trăm',
    description: 'Khái niệm tỉ số phần trăm. Giải 3 dạng toán về tỉ số phần trăm (tính tỉ số phần trăm, tìm giá trị phần trăm, tìm số gốc).',
    programIds: MATH5_PROGRAM_IDS,
    conceptIds: ['math.percent_practical'],
    skillIds: ['math.operate_fractions_decimals_percent'],
    prerequisiteTopicIds: ['math5.number.decimals'],
    bridgeToTopicIds: ['math5.word_problems.motion'],
    learningObjectives: ['Tính tỉ số phần trăm của hai số', 'Tìm giá trị phần trăm của một số', 'Tìm một số khi biết giá trị phần trăm của nó'],
    estimatedWeeks: 4,
    levels: ['core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math5.percent.ratio', title: 'Tìm tỉ số phần trăm của hai số', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.percent_practical'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['percent'] },
      { id: 'math5.percent.value', title: 'Tìm giá trị phần trăm của một số', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.percent_practical'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['percent'] },
      { id: 'math5.percent.base', title: 'Tìm một số biết tỉ số phần trăm của nó', level: 'advanced', cognitiveLevel: 'analyze', conceptIds: ['math.percent_practical'], skillIds: ['math.operate_fractions_decimals_percent'], tags: ['percent'] }
    ],
    sourceFiles: [
      source('BT TI SO PHAN TRAM.doc', 'practice'),
      source('29 DE TOAN LOP 5.doc', 'practice')
    ]
  },
  {
    id: 'math5.word_problems.motion',
    grade: 5,
    strand: 'word_problems',
    semester: 2,
    order: 30,
    unit: 'WP1',
    title: 'Bài toán chuyển động đều',
    shortTitle: 'Toán chuyển động',
    description: 'Các bài toán về vận tốc, quãng đường, thời gian. Bài toán hai vật chuyển động ngược chiều, cùng chiều đuổi nhau.',
    programIds: MATH5_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math5.number.decimals'],
    bridgeToTopicIds: [],
    learningObjectives: ['Tính vận tốc, quãng đường, thời gian đơn giản', 'Giải toán hai vật chuyển động ngược chiều (gặp nhau)', 'Giải toán hai vật chuyển động cùng chiều đuổi nhau'],
    estimatedWeeks: 6,
    levels: ['core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      { id: 'math5.motion.basic', title: 'Tính vận tốc, quãng đường, thời gian cơ bản', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['motion'] },
      { id: 'math5.motion.opposite', title: 'Chuyển động ngược chiều gặp nhau', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['motion', 'meet'] },
      { id: 'math5.motion.chase', title: 'Chuyển động cùng chiều đuổi nhau', level: 'advanced', cognitiveLevel: 'analyze', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['motion', 'chase'] }
    ],
    sourceFiles: [
      source('CAC BT CHUYEN DONG LOP 5.doc', 'practice'),
      source('120 BAI TOAN LUYEN THI VIOLYMPIC.doc', 'practice')
    ]
  },
  {
    id: 'math5.measurement.geometry',
    grade: 5,
    semester: 'full_year',
    order: 40,
    unit: 'G1',
    strand: 'geometry',
    title: 'Diện tích hình thang, hình tròn. Thể tích hình hộp chữ nhật, hình lập phương',
    shortTitle: 'Hình thang, hình tròn, thể tích',
    description: 'Tính diện tích hình thang, hình tròn. Tính diện tích xung quanh, toàn phần và thể tích hình hộp chữ nhật, hình lập phương.',
    programIds: MATH5_PROGRAM_IDS,
    conceptIds: ['math.basic_geometry'],
    skillIds: ['math.reason_basic_geometry'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    learningObjectives: ['Tính chu vi và diện tích hình tròn', 'Tính diện tích hình thang', 'Tính thể tích hình hộp chữ nhật, hình lập phương'],
    estimatedWeeks: 6,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      { id: 'math5.geometry.trapezoid', title: 'Diện tích hình thang', level: 'foundation', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['trapezoid'] },
      { id: 'math5.geometry.circle', title: 'Chu vi và diện tích hình tròn', level: 'core', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['circle'] },
      { id: 'math5.geometry.volume', title: 'Thể tích hình hộp chữ nhật, hình lập phương', level: 'application', cognitiveLevel: 'apply', conceptIds: ['math.basic_geometry'], skillIds: ['math.reason_basic_geometry'], tags: ['volume'] }
    ],
    sourceFiles: [
      source('CON THUC HINH HOC O TIEU HOC.doc', 'practice'),
      source('BT VE HINH TRON.doc', 'practice')
    ]
  },
  {
    id: 'math5.advanced.sequence_logic',
    grade: 5,
    semester: 'full_year',
    order: 50,
    unit: 'A1',
    strand: 'advanced',
    title: 'Dãy số quy luật và các bài toán HSG, Violympic',
    shortTitle: 'Dãy số, toán HSG lớp 5',
    description: 'Dãy số có quy luật, toán trồng cây, tính ngược từ cuối, lập số nâng cao trong các đề HSG lớp 5.',
    programIds: MATH5_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    learningObjectives: ['Nhận biết quy luật dãy số nâng cao', 'Giải toán trồng cây và tính ngược từ cuối', 'Giải toán lập số nâng cao'],
    estimatedWeeks: 6,
    levels: ['advanced', 'hsg'],
    examTarget: ['hsg'],
    patterns: [
      { id: 'math5.advanced.sequence', title: 'Dãy số quy luật nâng cao', level: 'advanced', cognitiveLevel: 'evaluate', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['sequence'] },
      { id: 'math5.advanced.logic', title: 'Toán logic đố vui và trồng cây', level: 'hsg', cognitiveLevel: 'create', conceptIds: ['math.natural_number_set'], skillIds: ['math.work_with_sets_natural_numbers'], tags: ['logic'] }
    ],
    sourceFiles: [
      source('BT TRONG CAY.doc', 'practice'),
      source('CAC BT VE DAY SO VA PP GIAI.doc', 'practice'),
      source('BOI DUONG HSG TOAN 5.doc', 'practice')
    ]
  }
];

export const MATH5_ACCESS_INDEX = buildMath5AccessIndex(MATH5_LEARNING_MATRIX);

function buildMath5AccessIndex(topics: Math5TopicPlan[]): Record<Math5AccessAxis, Record<string, string[]>> {
  const index: Record<Math5AccessAxis, Record<string, string[]>> = {
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
