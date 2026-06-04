import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math6Strand = 'number' | 'algebra' | 'geometry' | 'statistics_probability' | 'advanced' | 'assessment';
export type Math6Semester = 1 | 2 | 'full_year';
export type Math6SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math6AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math6SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math6SourceKind;
}

export interface Math6Pattern {
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

export interface Math6TopicPlan {
  id: string;
  grade: 6;
  semester: Math6Semester;
  order: number;
  unit: string;
  strand: Math6Strand;
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
  patterns: Math6Pattern[];
  sourceFiles: Math6SourceFile[];
}

export interface Math6Checkpoint {
  id: string;
  title: string;
  semester: Math6Semester;
  week: number;
  topicIds: string[];
  sourceFiles: Math6SourceFile[];
}

export interface Math6CoverageRow {
  topicId: string;
  strand: Math6Strand;
  semester: Math6Semester;
  unit: string;
  sourceCount: number;
  patternCount: number;
  byLevel: Record<string, number>;
}

export const MATH6_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/TAI LIEU TOAN 6';
export const MATH6_PROGRAM_IDS: ContentProgramId[] = ['vn_math_6', 'vn_math_6_8', 'vn_math_6_9', 'vn_math_thcs'];
export const MATH6_MATRIX_AXES: Math6AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

const COMMON_PROGRAM_IDS = MATH6_PROGRAM_IDS;

function source(fileName: string, kind: Math6SourceKind, format?: Math6SourceFile['format']): Math6SourceFile {
  const extension = format || inferSourceFormat(fileName);
  return {
    fileName,
    path: `${MATH6_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH6_LEARNING_MATRIX: Math6TopicPlan[] = [
  {
    id: 'math6.number.sets_natural_numbers',
    grade: 6,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'number',
    title: 'Tập hợp và số tự nhiên',
    shortTitle: 'Tập hợp, số tự nhiên',
    description: 'Nền tảng ký hiệu tập hợp, phần tử, tập con, ghi số tự nhiên và các dạng bài cơ bản về số tự nhiên.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math6.number.natural_operations', 'math6.number.divisibility'],
    learningObjectives: [
      'Đọc và dùng đúng ký hiệu tập hợp, phần tử, tập con.',
      'Biểu diễn và đếm phần tử của tập hợp số tự nhiên theo điều kiện.',
      'Giải bài toán cơ bản về cấu tạo số tự nhiên.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school', 'diagnostic'],
    patterns: [
      pattern('math6.sets.list_members', 'Liệt kê phần tử và mô tả tập hợp', 'foundation', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['sets', 'natural_number']),
      pattern('math6.sets.count_members', 'Đếm số phần tử của tập hợp theo quy luật đơn giản', 'core', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['sets', 'counting']),
      pattern('math6.natural_number.digit_structure', 'Bài toán chữ số và cấu tạo số tự nhiên', 'application', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['digits']),
    ],
    sourceFiles: [
      source('Chuyên đề 1 tập hợp.doc', 'lesson'),
      source('bai-tap-chuyen-de-tap-hop.doc', 'practice'),
      source('bai-tap-toan-lop-6-cac-dang-bai-tap-co-ban-ve-so-tu-nhien.doc', 'practice'),
      source('bai-tap-ve-so-tu-nhien-lop-6.doc', 'practice'),
    ],
  },
  {
    id: 'math6.number.natural_operations',
    grade: 6,
    semester: 1,
    order: 20,
    unit: 'N2',
    strand: 'number',
    title: 'Các phép toán với số tự nhiên',
    shortTitle: 'Phép toán số tự nhiên',
    description: 'Cộng, trừ, nhân, chia, thứ tự thực hiện phép tính và bài toán tính nhanh trong số tự nhiên.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math6.number.sets_natural_numbers'],
    bridgeToTopicIds: ['math6.number.powers_order_operations', 'math6.number.divisibility'],
    learningObjectives: [
      'Thực hiện đúng các phép tính với số tự nhiên.',
      'Dùng tính chất giao hoán, kết hợp, phân phối để tính hợp lý.',
      'Giải bài toán tìm x cơ bản trong phạm vi số tự nhiên.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.natural_ops.calculate', 'Tính giá trị biểu thức số tự nhiên', 'foundation', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['calculation']),
      pattern('math6.natural_ops.fast_calculation', 'Tính nhanh bằng tính chất phép toán', 'core', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['fast_calculation']),
      pattern('math6.natural_ops.find_x', 'Tìm x bằng quan hệ phép tính', 'application', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['find_x']),
    ],
    sourceFiles: [
      source('Chuyên đề 2. Các phép toán lớp 6.doc', 'lesson'),
      source('Bai tap danh cho hoc sinh lop 6 tu hoc.doc', 'practice'),
      source('Toan 6 ki 1.doc', 'review'),
    ],
  },
  {
    id: 'math6.number.powers_order_operations',
    grade: 6,
    semester: 1,
    order: 30,
    unit: 'N3',
    strand: 'number',
    title: 'Lũy thừa và thứ tự thực hiện phép tính',
    shortTitle: 'Lũy thừa',
    description: 'Lũy thừa với số mũ tự nhiên, nhân/chia lũy thừa cùng cơ số, chữ số tận cùng và biểu thức có lũy thừa.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math6.number.natural_operations'],
    bridgeToTopicIds: ['math6.number.divisibility', 'math6.advanced.last_digit_square_number'],
    learningObjectives: [
      'Hiểu ý nghĩa lũy thừa và tính đúng lũy thừa cơ bản.',
      'Rút gọn biểu thức có lũy thừa cùng cơ số.',
      'Nhận ra chu kỳ chữ số tận cùng của lũy thừa.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math6.powers.evaluate', 'Tính lũy thừa và biểu thức chứa lũy thừa', 'foundation', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['powers']),
      pattern('math6.powers.same_base', 'Nhân, chia hai lũy thừa cùng cơ số', 'core', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['powers']),
      pattern('math6.powers.last_digit_cycle', 'Tìm chữ số tận cùng bằng chu kỳ lũy thừa', 'advanced', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['last_digit', 'hsg']),
    ],
    sourceFiles: [
      source('Chuyên đề 3. Lũy thừa.doc', 'lesson'),
      source('Luy thua/Chuyên đề 3. Lũy thừa(4 sửa).docx', 'lesson'),
      source('Luy thua/Luy thua-BT them.pdf', 'practice'),
      source('Luy thua/Luy thua- chu so tan cung.docx', 'hsg'),
      source('Một số dạng toán về luỹ thừa trong chương trình Toán 6 - Giáo Án, Bài Giảng.pdf', 'lesson'),
    ],
  },
  {
    id: 'math6.number.divisibility',
    grade: 6,
    semester: 1,
    order: 40,
    unit: 'N4',
    strand: 'number',
    title: 'Dấu hiệu chia hết',
    shortTitle: 'Chia hết',
    description: 'Dấu hiệu chia hết cho 2, 3, 5, 9 và các bài toán điền chữ số, chứng minh chia hết.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.divisibility_number_theory'],
    skillIds: ['math.apply_divisibility_prime_gcd_lcm'],
    prerequisiteTopicIds: ['math6.number.natural_operations'],
    bridgeToTopicIds: ['math6.number.prime_factor_gcd_lcm', 'math6.advanced.divisibility_hsg'],
    learningObjectives: [
      'Áp dụng đúng dấu hiệu chia hết cơ bản.',
      'Tìm chữ số chưa biết để số thỏa điều kiện chia hết.',
      'Bước đầu chứng minh biểu thức số chia hết.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math6.divisibility.basic_tests', 'Nhận biết số chia hết cho 2, 3, 5, 9', 'foundation', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['divisibility']),
      pattern('math6.divisibility.missing_digit', 'Tìm chữ số để thỏa điều kiện chia hết', 'core', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['digits']),
      pattern('math6.divisibility.proof', 'Chứng minh tổng, hiệu, tích chia hết', 'advanced', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['proof', 'hsg']),
    ],
    sourceFiles: [
      source('Chuyên đề 4. Dấu hiệu chia hết lớp 6.doc', 'lesson'),
      source('dau hieu chia het/Dau hieu chia het.docx', 'lesson'),
      source('dau hieu chia het/Mot so dang toan chia het Lop 6.doc', 'practice'),
      source('chuyen-de-cac-bai-toan-ve-su-chia-het-cua-so-nguyen.doc', 'hsg'),
    ],
  },
  {
    id: 'math6.number.prime_factor_gcd_lcm',
    grade: 6,
    semester: 1,
    order: 50,
    unit: 'N5',
    strand: 'number',
    title: 'Số nguyên tố, ước, bội, UCLN và BCNN',
    shortTitle: 'Ước, bội, UCLN, BCNN',
    description: 'Số nguyên tố, hợp số, phân tích ra thừa số nguyên tố, tìm ước/bội, UCLN, BCNN và bài toán ứng dụng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.divisibility_number_theory'],
    skillIds: ['math.apply_divisibility_prime_gcd_lcm'],
    prerequisiteTopicIds: ['math6.number.divisibility'],
    bridgeToTopicIds: ['math6.number.integers_intro', 'math6.advanced.gcd_lcm_applications'],
    learningObjectives: [
      'Phân biệt số nguyên tố và hợp số.',
      'Phân tích số tự nhiên ra thừa số nguyên tố.',
      'Tìm UCLN, BCNN và vận dụng vào bài toán thực tế.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math6.prime.factorization', 'Phân tích một số ra thừa số nguyên tố', 'foundation', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['prime']),
      pattern('math6.gcd_lcm.compute', 'Tìm UCLN và BCNN của nhiều số', 'core', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['gcd', 'lcm']),
      pattern('math6.gcd_lcm.word_problem', 'Bài toán chia nhóm, xếp hàng bằng UCLN/BCNN', 'application', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['word_problem']),
    ],
    sourceFiles: [
      source('Chuyên đề 5. Số nguyên tố.doc', 'lesson'),
      source('[123doc.vn] - luyen-tap-phan-tich-ra-thua-so-nguyen-to.doc', 'practice'),
      source('CHUYÊN-ĐỀ-UCLN  - BC NN.doc', 'lesson'),
      source('Bai tap UOC VA BOI Mai Xuan Trong.doc', 'practice'),
      source('bai-tap-ve-uoc-chung-lon-nhat-va-boi-chung-nho-nhat.doc', 'practice'),
      source('Tim ước và tính ước...doc', 'practice'),
      source('Giải-các-bài-toán-bằng-việc-tìm-UCLN.dot', 'hsg'),
    ],
  },
  {
    id: 'math6.number.integers_intro',
    grade: 6,
    semester: 1,
    order: 60,
    unit: 'N6',
    strand: 'number',
    title: 'Số nguyên và phép cộng trừ số nguyên',
    shortTitle: 'Số nguyên',
    description: 'Số nguyên âm, trục số, giá trị tuyệt đối, so sánh và cộng trừ số nguyên.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.integer_number'],
    skillIds: ['math.operate_integers'],
    prerequisiteTopicIds: ['math6.number.prime_factor_gcd_lcm'],
    bridgeToTopicIds: ['math6.number.fraction_foundation'],
    learningObjectives: [
      'Biểu diễn số nguyên trên trục số và so sánh số nguyên.',
      'Tính giá trị tuyệt đối cơ bản.',
      'Cộng, trừ số nguyên trong biểu thức và bài toán thực tế.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.integers.compare_number_line', 'So sánh số nguyên trên trục số', 'foundation', ['math.integer_number'], ['math.operate_integers'], ['integer']),
      pattern('math6.integers.add_subtract', 'Cộng trừ số nguyên', 'core', ['math.integer_number'], ['math.operate_integers'], ['integer', 'calculation']),
      pattern('math6.integers.word_context', 'Bài toán nhiệt độ, độ cao, lãi lỗ', 'application', ['math.integer_number'], ['math.operate_integers'], ['word_problem']),
    ],
    sourceFiles: [
      source('bai-tap-toan-lop-6-so-nguyen.doc', 'practice'),
      source('công tru so nguyen/Phép-cộng-số-nguyên-btvn-lớp-6.docx', 'practice'),
      source('công tru so nguyen/Phép-tru-số-nguyên lớp-6 .docx', 'practice'),
      source('công tru so nguyen/Ôn tập cộng trừ số nguyên.doc', 'review'),
      source('công tru so nguyen/phieu On tap.docx', 'review'),
    ],
  },
  {
    id: 'math6.geometry.points_lines_segments',
    grade: 6,
    semester: 1,
    order: 70,
    unit: 'G1',
    strand: 'geometry',
    title: 'Điểm, đường thẳng, tia, đoạn thẳng và trung điểm',
    shortTitle: 'Hình học cơ bản',
    description: 'Ngôn ngữ hình học nền: điểm, đường thẳng, tia, hai tia đối nhau, đoạn thẳng, độ dài đoạn thẳng, trung điểm.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.basic_geometry'],
    skillIds: ['math.reason_basic_geometry'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math6.geometry.angles'],
    learningObjectives: [
      'Dùng đúng ký hiệu điểm, đường thẳng, tia, đoạn thẳng.',
      'Đọc hình và xác định quan hệ nằm giữa, hai tia đối nhau.',
      'Tính độ dài đoạn thẳng và nhận biết trung điểm.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.geometry.point_line_relation', 'Nhận biết quan hệ điểm và đường thẳng', 'foundation', ['math.basic_geometry'], ['math.reason_basic_geometry'], ['geometry']),
      pattern('math6.geometry.ray_segment_length', 'Tia, đoạn thẳng và độ dài đoạn thẳng', 'core', ['math.basic_geometry'], ['math.reason_basic_geometry'], ['segment']),
      pattern('math6.geometry.midpoint', 'Tính độ dài qua trung điểm đoạn thẳng', 'application', ['math.basic_geometry'], ['math.reason_basic_geometry'], ['midpoint']),
    ],
    sourceFiles: [
      source('Chuyên đề. Điểm. Đường thẳng.doc', 'lesson'),
      source('Chuyên đề. Tia. Hai tia đối nhau.doc', 'lesson'),
      source('Chuyên đề. Đoạn thẳng. Độ dài đoạn thẳng.doc', 'lesson'),
      source('Chuyên đề. Trung điểm đoạn thẳng.doc', 'lesson'),
    ],
  },
  {
    id: 'math6.number.fraction_foundation',
    grade: 6,
    semester: 2,
    order: 80,
    unit: 'N7',
    strand: 'number',
    title: 'Phân số, rút gọn, quy đồng và so sánh phân số',
    shortTitle: 'Phân số nền tảng',
    description: 'Khái niệm phân số, phân số bằng nhau, rút gọn, quy đồng mẫu và so sánh phân số.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.fraction_decimal'],
    skillIds: ['math.operate_fractions_decimals_percent'],
    prerequisiteTopicIds: ['math6.number.integers_intro', 'math6.number.prime_factor_gcd_lcm'],
    bridgeToTopicIds: ['math6.number.fraction_operations', 'math7.number.rational_real_bridge'],
    learningObjectives: [
      'Nhận biết và tạo phân số bằng nhau.',
      'Rút gọn phân số về tối giản.',
      'Quy đồng mẫu và so sánh nhiều phân số.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.fraction.equivalent_reduce', 'Phân số bằng nhau và rút gọn phân số', 'foundation', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['fraction']),
      pattern('math6.fraction.common_denominator', 'Quy đồng mẫu nhiều phân số', 'core', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['fraction']),
      pattern('math6.fraction.compare', 'So sánh và sắp xếp phân số', 'application', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['fraction', 'compare']),
    ],
    sourceFiles: [
      source('Chuyên đề. Phân số.doc', 'lesson'),
      source('So sánh phân số lớp 6.doc', 'practice'),
      source('Bai tap danh cho hoc sinh lop 6 tu hoc.doc', 'practice'),
    ],
  },
  {
    id: 'math6.number.fraction_operations',
    grade: 6,
    semester: 2,
    order: 90,
    unit: 'N8',
    strand: 'number',
    title: 'Các phép tính với phân số',
    shortTitle: 'Phép tính phân số',
    description: 'Cộng, trừ, nhân, chia phân số, tính giá trị biểu thức và tìm x với phân số.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.fraction_decimal'],
    skillIds: ['math.operate_fractions_decimals_percent'],
    prerequisiteTopicIds: ['math6.number.fraction_foundation'],
    bridgeToTopicIds: ['math6.number.fraction_three_basic_problems', 'math6.number.decimal_percent'],
    learningObjectives: [
      'Thực hiện bốn phép tính với phân số.',
      'Tính hợp lý biểu thức phân số.',
      'Giải bài toán tìm x với phân số.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.fraction_ops.add_subtract', 'Cộng trừ phân số', 'foundation', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['fraction']),
      pattern('math6.fraction_ops.multiply_divide', 'Nhân chia phân số', 'core', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['fraction']),
      pattern('math6.fraction_ops.expression_find_x', 'Biểu thức và tìm x với phân số', 'application', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['find_x']),
    ],
    sourceFiles: [
      source('Chuyên đề. Phân số.doc', 'lesson'),
      source('Chuyên đề. Ba dạng toán cơ bản về phân số.doc', 'practice'),
      source('Bai tap danh cho hoc sinh lop 6 tu hoc.doc', 'practice'),
    ],
  },
  {
    id: 'math6.number.fraction_three_basic_problems',
    grade: 6,
    semester: 2,
    order: 100,
    unit: 'N9',
    strand: 'number',
    title: 'Ba dạng toán cơ bản về phân số',
    shortTitle: 'Ba dạng toán phân số',
    description: 'Tìm giá trị phân số của một số, tìm một số khi biết giá trị phân số của nó, và tìm tỉ số.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.fraction_decimal', 'math.ratio_proportion', 'math.percent_practical'],
    skillIds: ['math.operate_fractions_decimals_percent', 'math.solve_ratio_problem'],
    prerequisiteTopicIds: ['math6.number.fraction_operations'],
    bridgeToTopicIds: ['math6.number.decimal_percent', 'math7.number.ratio_proportion'],
    learningObjectives: [
      'Xác định đúng dạng toán phân số trong đề lời văn.',
      'Tính giá trị phân số của một số.',
      'Tìm một số khi biết một phân số của nó và tính tỉ số.',
    ],
    estimatedWeeks: 2,
    levels: ['core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.fraction_word.value_of_fraction', 'Tìm giá trị phân số của một số', 'core', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['word_problem']),
      pattern('math6.fraction_word.find_whole', 'Tìm một số khi biết giá trị phân số của nó', 'application', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['word_problem']),
      pattern('math6.fraction_word.ratio', 'Tìm tỉ số của hai số', 'application', ['math.ratio_proportion'], ['math.solve_ratio_problem'], ['ratio']),
    ],
    sourceFiles: [
      source('Chuyên đề. Ba dạng toán cơ bản về phân số.doc', 'lesson'),
      source('de-cuong-on-tap-he-mon-toan-lop-6.doc', 'review'),
      source('10 de-kiem-tra-thu-ki-II-mon-toan6.doc', 'exam'),
    ],
  },
  {
    id: 'math6.number.decimal_percent',
    grade: 6,
    semester: 2,
    order: 110,
    unit: 'N10',
    strand: 'number',
    title: 'Hỗn số, số thập phân và phần trăm',
    shortTitle: 'Số thập phân, phần trăm',
    description: 'Chuyển đổi giữa phân số, hỗn số, số thập phân, phần trăm và vận dụng vào bài toán thực tế.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.fraction_decimal', 'math.percent_practical'],
    skillIds: ['math.operate_fractions_decimals_percent'],
    prerequisiteTopicIds: ['math6.number.fraction_operations'],
    bridgeToTopicIds: ['math7.number.rational_real_bridge'],
    learningObjectives: [
      'Chuyển đổi đúng giữa phân số, hỗn số, số thập phân và phần trăm.',
      'Tính toán với số thập phân và phần trăm.',
      'Giải bài toán thực tế về tỉ lệ phần trăm.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.decimal_percent.convert', 'Đổi phân số, số thập phân và phần trăm', 'foundation', ['math.fraction_decimal'], ['math.operate_fractions_decimals_percent'], ['conversion']),
      pattern('math6.decimal_percent.calculate', 'Tính toán với số thập phân và phần trăm', 'core', ['math.percent_practical'], ['math.operate_fractions_decimals_percent'], ['calculation']),
      pattern('math6.decimal_percent.word_problem', 'Bài toán thực tế về phần trăm', 'application', ['math.percent_practical'], ['math.operate_fractions_decimals_percent'], ['word_problem']),
    ],
    sourceFiles: [
      source('chuyên-đề-hỗn-số-số-thập-phân-phần-trăm.doc', 'lesson'),
      source('Chuyên đề. Ba dạng toán cơ bản về phân số.doc', 'practice'),
      source('de-cuong-on-tap-he-mon-toan-lop-6.doc', 'review'),
    ],
  },
  {
    id: 'math6.geometry.angles',
    grade: 6,
    semester: 2,
    order: 120,
    unit: 'G2',
    strand: 'geometry',
    title: 'Góc, đo góc và quan hệ góc',
    shortTitle: 'Góc',
    description: 'Nhận biết góc, số đo góc, tia nằm giữa hai tia, cộng số đo góc và các dạng tính góc cơ bản.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.basic_geometry'],
    skillIds: ['math.reason_basic_geometry'],
    prerequisiteTopicIds: ['math6.geometry.points_lines_segments'],
    bridgeToTopicIds: ['math7.geometry.triangle_intro'],
    learningObjectives: [
      'Nhận biết và gọi tên góc, đỉnh, cạnh của góc.',
      'Đo và so sánh số đo góc.',
      'Tính số đo góc khi có tia nằm giữa hoặc góc kề bù đơn giản.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math6.angle.identify_measure', 'Nhận biết và đo góc', 'foundation', ['math.basic_geometry'], ['math.reason_basic_geometry'], ['angle']),
      pattern('math6.angle.addition', 'Tính góc bằng cộng số đo góc', 'core', ['math.basic_geometry'], ['math.reason_basic_geometry'], ['angle']),
      pattern('math6.angle.relation', 'Bài toán tia nằm giữa, góc kề bù cơ bản', 'application', ['math.basic_geometry'], ['math.reason_basic_geometry'], ['angle']),
    ],
    sourceFiles: [
      source('Chuyên đề. Góc.doc', 'lesson'),
      source('Bo - de-on-tap-hoc-ki-2-mon-toan-lop-6-nam-hoc-2014-2015.doc', 'review'),
      source('10 de-kiem-tra-thu-ki-II-mon-toan6.doc', 'exam'),
    ],
  },
  {
    id: 'math6.advanced.divisibility_hsg',
    grade: 6,
    semester: 'full_year',
    order: 210,
    unit: 'A1',
    strand: 'advanced',
    title: 'Chia hết nâng cao và số học HSG',
    shortTitle: 'Chia hết nâng cao',
    description: 'Chứng minh chia hết, chia hết của biểu thức số nguyên, chữ số tận cùng, số chính phương và các kỹ thuật số học HSG.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.divisibility_number_theory'],
    skillIds: ['math.apply_divisibility_prime_gcd_lcm'],
    prerequisiteTopicIds: ['math6.number.divisibility', 'math6.number.prime_factor_gcd_lcm', 'math6.number.powers_order_operations'],
    bridgeToTopicIds: ['math7.advanced.number_theory'],
    learningObjectives: [
      'Chứng minh chia hết bằng biến đổi biểu thức và tính chất đồng dư sơ khai.',
      'Tìm chữ số tận cùng và nhận diện số chính phương.',
      'Giải bài số học nâng cao trong đề HSG lớp 6.',
    ],
    estimatedWeeks: 4,
    levels: ['advanced', 'hsg'],
    examTarget: ['hsg', 'olympic'],
    patterns: [
      pattern('math6.hsg.divisibility_proof', 'Chứng minh chia hết nâng cao', 'advanced', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['hsg', 'proof']),
      pattern('math6.hsg.last_digit_square', 'Chữ số tận cùng và số chính phương', 'hsg', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['last_digit', 'square_number']),
      pattern('math6.hsg.number_theory_mixed', 'Bài số học HSG tổng hợp', 'hsg', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['hsg']),
    ],
    sourceFiles: [
      source('chuyen-de-cac-bai-toan-ve-su-chia-het-cua-so-nguyen.doc', 'hsg'),
      source('bai-tap-tim-chu-so-tan-cung.doc', 'hsg'),
      source('bai-tap-toan-lop-6-so-chinh-phuong.doc', 'hsg'),
      source('Luy thua/Luy thua- chu so tan cung.docx', 'hsg'),
      source('30DeHSGToan6.doc', 'hsg'),
    ],
  },
  {
    id: 'math6.advanced.gcd_lcm_applications',
    grade: 6,
    semester: 'full_year',
    order: 220,
    unit: 'A2',
    strand: 'advanced',
    title: 'UCLN, BCNN ứng dụng và bài toán nâng cao',
    shortTitle: 'UCLN, BCNN nâng cao',
    description: 'Các bài toán tìm số, chia phần, xếp hàng, chu kỳ và điều kiện ước bội trong đề nâng cao.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.divisibility_number_theory'],
    skillIds: ['math.apply_divisibility_prime_gcd_lcm'],
    prerequisiteTopicIds: ['math6.number.prime_factor_gcd_lcm'],
    bridgeToTopicIds: ['math7.number.ratio_proportion'],
    learningObjectives: [
      'Chọn đúng UCLN hoặc BCNN trong bài toán lời văn.',
      'Giải bài tìm số thỏa điều kiện ước bội.',
      'Phối hợp UCLN/BCNN với chia hết và số nguyên tố.',
    ],
    estimatedWeeks: 3,
    levels: ['application', 'advanced', 'hsg'],
    examTarget: ['hsg', 'olympic'],
    patterns: [
      pattern('math6.hsg.gcd_lcm.choose_model', 'Nhận dạng dùng UCLN hay BCNN', 'application', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['gcd', 'lcm']),
      pattern('math6.hsg.gcd_lcm.find_number', 'Tìm số theo điều kiện ước bội', 'advanced', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['find_number']),
      pattern('math6.hsg.gcd_lcm_mixed', 'Bài UCLN/BCNN tổng hợp HSG', 'hsg', ['math.divisibility_number_theory'], ['math.apply_divisibility_prime_gcd_lcm'], ['hsg']),
    ],
    sourceFiles: [
      source('CHUYÊN-ĐỀ-UCLN  - BC NN.doc', 'lesson'),
      source('Giải-các-bài-toán-bằng-việc-tìm-UCLN.dot', 'hsg'),
      source('Bai tap UOC VA BOI Mai Xuan Trong.doc', 'practice'),
      source('30DeHSGToan6.doc', 'hsg'),
    ],
  },
  {
    id: 'math6.advanced.sequence_patterns',
    grade: 6,
    semester: 'full_year',
    order: 230,
    unit: 'A3',
    strand: 'advanced',
    title: 'Dãy số viết theo quy luật',
    shortTitle: 'Dãy số quy luật',
    description: 'Nhận dạng quy luật dãy số, tổng dãy, số hạng tổng quát đơn giản và bài toán HSG.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.natural_number_set'],
    skillIds: ['math.work_with_sets_natural_numbers'],
    prerequisiteTopicIds: ['math6.number.natural_operations', 'math6.number.powers_order_operations'],
    bridgeToTopicIds: ['math7.advanced.sequence_patterns'],
    learningObjectives: [
      'Nhận biết quy luật cộng, nhân, xen kẽ hoặc lũy thừa đơn giản.',
      'Tìm số hạng tiếp theo và số hạng ở vị trí cho trước.',
      'Tính tổng dãy số có quy luật ở mức HSG lớp 6.',
    ],
    estimatedWeeks: 3,
    levels: ['advanced', 'hsg'],
    examTarget: ['hsg', 'olympic'],
    patterns: [
      pattern('math6.sequence.next_terms', 'Tìm số hạng tiếp theo theo quy luật', 'advanced', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['sequence']),
      pattern('math6.sequence.nth_term', 'Tìm số hạng thứ n theo mẫu đơn giản', 'hsg', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['sequence', 'hsg']),
      pattern('math6.sequence.sum_pattern', 'Tính tổng dãy số có quy luật', 'hsg', ['math.natural_number_set'], ['math.work_with_sets_natural_numbers'], ['sum', 'hsg']),
    ],
    sourceFiles: [
      source('chuyen-de-boi-duong-hoc-sinh-gioi-mon-toan-lop-6-day-so-viet-theo-quy-luat.doc', 'hsg'),
      source('30DeHSGToan6.doc', 'hsg'),
      source('De-Olympic-ThanhOai-Toan6.doc', 'hsg'),
    ],
  },
];

export const MATH6_CHECKPOINTS: Math6Checkpoint[] = [
  {
    id: 'math6.checkpoint.entry_diagnostic',
    title: 'Khảo sát đầu năm và phân luồng nền tảng',
    semester: 1,
    week: 1,
    topicIds: ['math6.number.sets_natural_numbers', 'math6.number.natural_operations'],
    sourceFiles: [
      source('de-khao-sat-chat-luong-dau-nam-lop-6-mon-toan-nam-2013-2014-truong-thcs-binh-minh.doc', 'diagnostic'),
      source('de-khao-sat-chat-luong-dau-nam-lop-6-mon-toan-truong-thcs-tan-truong.doc', 'diagnostic'),
      source('de-kscl-dau-nam-lop-6-mon-toan-2013-2014-thcs-quat-dong.doc', 'diagnostic'),
    ],
  },
  {
    id: 'math6.checkpoint.midterm_1',
    title: 'Kiểm tra giữa kỳ 1',
    semester: 1,
    week: 9,
    topicIds: ['math6.number.sets_natural_numbers', 'math6.number.natural_operations', 'math6.number.powers_order_operations', 'math6.number.divisibility'],
    sourceFiles: [
      source('de-kiem-tra-giua-ki-1-mon-toan-lop-6-nam-2014-2015-huyen-viet-yen.doc', 'exam'),
      source('de-kiem-tra-giua-ki-1-mon-toan-lop-6-nam-2015-2016-phong-gd-luc-ngan.doc', 'exam'),
      source('de-kiem-tra-giua-ki-1-mon-toan-lop-6-thcs-hong-duong.doc', 'exam'),
    ],
  },
  {
    id: 'math6.checkpoint.final_1',
    title: 'Ôn tập và kiểm tra cuối kỳ 1',
    semester: 1,
    week: 17,
    topicIds: ['math6.number.prime_factor_gcd_lcm', 'math6.number.integers_intro', 'math6.geometry.points_lines_segments'],
    sourceFiles: [
      source('Ôn thi cuối kì 1/de-cuong-on-tap-toan-6-hoc-ki-1_44655.doc', 'review'),
      source('Ôn thi cuối kì 1/Đề thi cuối kì 1.doc', 'exam'),
      source('de-kiem-tra-hoc-ki-1-mon-toan-lop-6.doc', 'exam'),
    ],
  },
  {
    id: 'math6.checkpoint.final_2',
    title: 'Ôn tập và kiểm tra cuối kỳ 2',
    semester: 2,
    week: 34,
    topicIds: ['math6.number.fraction_foundation', 'math6.number.fraction_operations', 'math6.number.fraction_three_basic_problems', 'math6.number.decimal_percent', 'math6.geometry.angles'],
    sourceFiles: [
      source('10 de-kiem-tra-thu-ki-II-mon-toan6.doc', 'exam'),
      source('Bo - de-on-tap-hoc-ki-2-mon-toan-lop-6-nam-hoc-2014-2015.doc', 'review'),
      source('de-cuong-on-tap-he-mon-toan-lop-6.doc', 'review'),
    ],
  },
  {
    id: 'math6.checkpoint.hsg_olympic',
    title: 'Nhánh HSG và Olympic lớp 6',
    semester: 'full_year',
    week: 35,
    topicIds: ['math6.advanced.divisibility_hsg', 'math6.advanced.gcd_lcm_applications', 'math6.advanced.sequence_patterns'],
    sourceFiles: [
      source('30DeHSGToan6.doc', 'hsg'),
      source('de-thi-hsg-toan6-huyen-viet-tri-2014-2015.doc', 'hsg'),
      source('De-Olympic-ThanhOai-Toan6.doc', 'hsg'),
      source('de-thi-violimpic-lop-6-nam-hoc-2014-2015.doc', 'hsg'),
    ],
  },
];

export const MATH6_ACCESS_INDEX = buildMath6AccessIndex(MATH6_LEARNING_MATRIX);

export function getMath6TopicById(topicId: string): Math6TopicPlan | undefined {
  return MATH6_LEARNING_MATRIX.find((topic) => topic.id === topicId);
}

export function getMath6TopicsByAxis(axis: Math6AccessAxis, value: string | number): Math6TopicPlan[] {
  const key = String(value);
  return (MATH6_ACCESS_INDEX[axis][key] || []).map((topicId) => getMath6TopicById(topicId)).filter(Boolean) as Math6TopicPlan[];
}

export function getMath6PatternsByLevel(level: MathLearningLevel): Array<Math6Pattern & { topicId: string }> {
  return MATH6_LEARNING_MATRIX.flatMap((topic) =>
    topic.patterns
      .filter((topicPattern) => topicPattern.level === level)
      .map((topicPattern) => ({ ...topicPattern, topicId: topic.id })),
  );
}

export function buildMath6CoverageMatrix(topics = MATH6_LEARNING_MATRIX): Math6CoverageRow[] {
  return topics.map((topic) => ({
    topicId: topic.id,
    strand: topic.strand,
    semester: topic.semester,
    unit: topic.unit,
    sourceCount: topic.sourceFiles.length,
    patternCount: topic.patterns.length,
    byLevel: topic.patterns.reduce<Record<string, number>>((acc, topicPattern) => {
      acc[topicPattern.level] = (acc[topicPattern.level] || 0) + 1;
      return acc;
    }, {}),
  }));
}

function pattern(
  id: string,
  title: string,
  level: MathLearningLevel,
  conceptIds: string[],
  skillIds: string[],
  tags: string[],
  cognitiveLevel: CognitiveLevel = level === 'foundation' ? 'understand' : level === 'core' ? 'apply' : 'analyze',
): Math6Pattern {
  return {
    id,
    title,
    level,
    cognitiveLevel,
    conceptIds,
    skillIds,
    tags,
  };
}

function buildMath6AccessIndex(topics: Math6TopicPlan[]): Record<Math6AccessAxis, Record<string, string[]>> {
  const index: Record<Math6AccessAxis, Record<string, string[]>> = {
    grade: {},
    semester: {},
    strand: {},
    unit: {},
    topic: {},
    level: {},
    examTarget: {},
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

function inferSourceFormat(fileName: string): Math6SourceFile['format'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.dot')) return 'dot';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'doc';
}
