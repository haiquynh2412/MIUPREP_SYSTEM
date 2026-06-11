import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math7Strand = 'algebra' | 'geometry' | 'statistics_probability' | 'advanced' | 'assessment';
export type Math7Semester = 1 | 2 | 'full_year';
export type Math7SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math7AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math7SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math7SourceKind;
}

export interface Math7Pattern {
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

export interface Math7TopicPlan {
  id: string;
  grade: 7;
  semester: Math7Semester;
  order: number;
  unit: string;
  strand: Math7Strand;
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
  patterns: Math7Pattern[];
  sourceFiles: Math7SourceFile[];
}

export interface Math7Checkpoint {
  id: string;
  title: string;
  semester: Math7Semester;
  week: number;
  topicIds: string[];
  sourceFiles: Math7SourceFile[];
}

export interface Math7CoverageRow {
  topicId: string;
  strand: Math7Strand;
  semester: Math7Semester;
  unit: string;
  sourceCount: number;
  patternCount: number;
  byLevel: Record<string, number>;
}

export const MATH7_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/toan 7';
export const MATH7_PROGRAM_IDS: ContentProgramId[] = ['vn_math_7', 'vn_math_6_8', 'vn_math_6_9', 'vn_math_thcs'];
export const MATH7_MATRIX_AXES: Math7AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

const COMMON_PROGRAM_IDS = MATH7_PROGRAM_IDS;

function source(fileName: string, kind: Math7SourceKind, format?: Math7SourceFile['format']): Math7SourceFile {
  const extension = format || inferSourceFormat(fileName);
  return {
    fileName,
    path: `${MATH7_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH7_LEARNING_MATRIX: Math7TopicPlan[] = [
  {
    id: 'math7.algebra.rational_numbers',
    grade: 7,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'algebra',
    title: 'Số hữu tỉ',
    shortTitle: 'Số hữu tỉ',
    description: 'Khái niệm số hữu tỉ, các phép toán cộng, trừ, nhân, chia số hữu tỉ và các quy tắc tính lũy thừa với số mũ tự nhiên.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.rational_number', 'math.arithmetic'],
    skillIds: ['math.compute_rational', 'math.simplify_rational_expression'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math7.algebra.real_numbers'],
    learningObjectives: [
      'Nhận biết số hữu tỉ và biểu diễn số hữu tỉ trên trục số.',
      'Thực hiện thành thạo cộng, trừ, nhân, chia số hữu tỉ.',
      'Vận dụng các phép tính lũy thừa với số mũ tự nhiên của số hữu tỉ.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math7.rational_numbers.compare_simplify', 'So sánh và biểu diễn số hữu tỉ', 'foundation', ['math.rational_number'], ['math.compute_rational'], ['compare', 'simplify']),
      pattern('math7.rational_numbers.operations', 'Cộng, trừ, nhân, chia số hữu tỉ và quy tắc dấu ngoặc', 'core', ['math.rational_number'], ['math.compute_rational'], ['operations']),
      pattern('math7.rational_numbers.powers', 'Phép tính lũy thừa với số mũ tự nhiên của số hữu tỉ', 'core', ['math.rational_number'], ['math.compute_rational'], ['powers']),
      pattern('math7.rational_numbers.expressions', 'Rút gọn biểu thức và tìm x nâng cao với số hữu tỉ', 'advanced', ['math.rational_number'], ['math.simplify_rational_expression'], ['expressions', 'find_x']),
      pattern('math7.rational_numbers.hsg', 'Tính tổng dãy số viết theo quy luật và toán thực tế nâng cao', 'hsg', ['math.rational_number'], ['math.simplify_rational_expression'], ['hsg', 'sequence']),
    ],
    sourceFiles: [
      source('8-chuyen-de-boi-duong-hoc-sinh-gioi-mon-toan-7-phan-dai-so.pdf', 'hsg'),
      source('tai-lieu-hoc-tap-mon-toan-7-hoc-ki-1-nam-hoc-2025-2026.docx', 'lesson'),
      source('cac-dang-toan-va-phuong-phap-giai-toan-7-ngo-van-tho.pdf', 'practice'),
      source('Cac-Dạng-Toán-Phương-Pháp-Giải-T7-T1.pdf', 'practice', 'pdf'),
    ],
  },
  {
    id: 'math7.algebra.real_numbers',
    grade: 7,
    semester: 1,
    order: 20,
    unit: 'N2',
    strand: 'algebra',
    title: 'Số thực & Căn bậc hai',
    shortTitle: 'Số thực',
    description: 'Căn bậc hai số học, số vô tỉ, số thực, giá trị tuyệt đối của một số thực và quy tắc làm tròn số.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.real_number', 'math.square_root', 'math.absolute_value'],
    skillIds: ['math.compute_square_root', 'math.solve_absolute_value_equation'],
    prerequisiteTopicIds: ['math7.algebra.rational_numbers'],
    bridgeToTopicIds: ['math7.algebra.ratios_proportions'],
    learningObjectives: [
      'Nhận biết căn bậc hai số học của một số không âm.',
      'Hiểu khái niệm số vô tỉ, số thực và giá trị tuyệt đối.',
      'Giải được phương trình và bất phương trình chứa giá trị tuyệt đối cơ bản và nâng cao.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math7.real_numbers.square_root', 'Tính căn bậc hai số học và so sánh căn thức đơn giản', 'foundation', ['math.square_root'], ['math.compute_square_root'], ['square_root']),
      pattern('math7.real_numbers.decimals', 'Số thập phân vô hạn tuần hoàn, số vô tỉ và số thực', 'core', ['math.real_number'], ['math.compute_square_root'], ['decimals']),
      pattern('math7.real_numbers.absolute_value', 'Tính giá trị tuyệt đối của số thực và các phép toán liên quan', 'core', ['math.absolute_value'], ['math.solve_absolute_value_equation'], ['absolute_value']),
      pattern('math7.real_numbers.advanced_equations', 'Giải phương trình và bất phương trình chứa dấu giá trị tuyệt đối nâng cao', 'advanced', ['math.absolute_value'], ['math.solve_absolute_value_equation'], ['equations', 'find_x']),
      pattern('math7.real_numbers.hsg', 'Đánh giá bất đẳng thức chứa căn hoặc trị tuyệt đối và tìm cực trị', 'hsg', ['math.real_number'], ['math.solve_absolute_value_equation'], ['hsg', 'extrema']),
    ],
    sourceFiles: [
      source('8-chuyen-de-boi-duong-hoc-sinh-gioi-mon-toan-7-phan-dai-so.pdf', 'hsg'),
      source('tai-lieu-hoc-tap-mon-toan-7-hoc-ki-1-nam-hoc-2025-2026.docx', 'lesson'),
      source('cac-dang-toan-va-phuong-phap-giai-toan-7-ngo-van-tho.pdf', 'practice'),
      source('Cac-Dạng-Toán-Phương-Pháp-Giải-T7-T1.pdf', 'practice', 'pdf'),
    ],
  },
  {
    id: 'math7.geometry.angles_parallel_lines',
    grade: 7,
    semester: 1,
    order: 30,
    unit: 'G1',
    strand: 'geometry',
    title: 'Góc và đường thẳng song song',
    shortTitle: 'Góc & Song song',
    description: 'Các góc ở vị trí đặc biệt, tia phân giác của một góc, hai đường thẳng song song, dấu hiệu nhận biết, tiên đề Euclid và tính chất đường thẳng song song.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.angles_lines_geometry', 'math.parallelism'],
    skillIds: ['math.calculate_angles', 'math.prove_parallelism'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math7.geometry.congruent_triangles'],
    learningObjectives: [
      'Nhận biết các góc kề bù, đối đỉnh, so le trong, đồng vị.',
      'Tính số đo góc và chứng minh hai đường thẳng song song.',
      'Sử dụng tiên đề Euclid để chứng minh song song và tính góc.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math7.angles_parallel.basic_angles', 'Tính góc kề bù, kề bên, đối đỉnh và vẽ tia phân giác', 'foundation', ['math.angles_lines_geometry'], ['math.calculate_angles'], ['angles', 'bisector']),
      pattern('math7.angles_parallel.parallel_lines', 'Chứng minh hai đường thẳng song song bằng góc so le trong, đồng vị, trong cùng phía', 'core', ['math.parallelism'], ['math.prove_parallelism'], ['parallel']),
      pattern('math7.angles_parallel.perpendicular_parallel', 'Quan hệ vuông góc đến song song và tính góc bằng tiên đề Euclid', 'core', ['math.parallelism'], ['math.calculate_angles'], ['perpendicular', 'parallel']),
      pattern('math7.angles_parallel.proof', 'Chứng minh hình học và tính số đo góc phức tạp', 'advanced', ['math.angles_lines_geometry'], ['math.calculate_angles'], ['proof', 'angles']),
      pattern('math7.angles_parallel.hsg', 'Vẽ đường phụ song song để tính góc và chứng minh ba điểm thẳng hàng', 'hsg', ['math.angles_lines_geometry'], ['math.prove_parallelism'], ['hsg', 'construction']),
    ],
    sourceFiles: [
      source('22-chuyen-de-boi-duong-hinh-hoc-7.pdf', 'hsg'),
      source('bai-tap-hinh-hoc-7.pdf', 'practice'),
      source('cac-dang-toan-va-phuong-phap-giai-toan-7-ngo-van-tho.pdf', 'practice'),
      source('Cac-Dạng-Toán-Phương-Pháp-Giải-T7-T1.pdf', 'practice', 'pdf'),
      source('tai-lieu-hoc-tap-mon-toan-7-hoc-ki-1-nam-hoc-2025-2026.docx', 'lesson'),
    ],
  },
  {
    id: 'math7.geometry.congruent_triangles',
    grade: 7,
    semester: 1,
    order: 40,
    unit: 'G2',
    strand: 'geometry',
    title: 'Tam giác bằng nhau',
    shortTitle: 'Tam giác bằng nhau',
    description: 'Tổng các góc trong một tam giác, các trường hợp bằng nhau của tam giác thường và tam giác vuông, tam giác cân và đường trung trực của đoạn thẳng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.triangle_congruence', 'math.isosceles_triangle', 'math.perpendicular_bisector'],
    skillIds: ['math.prove_triangle_congruence', 'math.apply_triangle_congruence'],
    prerequisiteTopicIds: ['math7.geometry.angles_parallel_lines'],
    bridgeToTopicIds: ['math7.geometry.triangle_relations'],
    learningObjectives: [
      'Tính tổng các góc trong tam giác.',
      'Chứng minh hai tam giác bằng nhau qua các trường hợp c.c.c, c.g.c, g.c.g.',
      'Vận dụng tam giác cân, tam giác đều và tính chất đường trung trực của đoạn thẳng.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math7.congruent_triangles.cases', 'Chứng minh hai tam giác bằng nhau (c.c.c, c.g.c, g.c.g)', 'foundation', ['math.triangle_congruence'], ['math.prove_triangle_congruence'], ['congruence']),
      pattern('math7.congruent_triangles.right_triangles', 'Chứng minh tam giác vuông bằng nhau (cạnh huyền - góc nhọn, cạnh huyền - cạnh góc vuông)', 'core', ['math.triangle_congruence'], ['math.prove_triangle_congruence'], ['right_triangle']),
      pattern('math7.congruent_triangles.isosceles', 'Chứng minh tam giác cân, tam giác đều và tính chất đường trung trực', 'core', ['math.isosceles_triangle'], ['math.apply_triangle_congruence'], ['isosceles', 'bisector']),
      pattern('math7.congruent_triangles.proof_advanced', 'Chứng minh ba đường đồng quy, thẳng hàng, vuông góc hoặc song song', 'advanced', ['math.triangle_congruence'], ['math.apply_triangle_congruence'], ['proof', 'advanced']),
      pattern('math7.congruent_triangles.hsg', 'Kỹ thuật vẽ đường phụ: tạo tam giác bằng nhau, kéo dài trung tuyến, tạo tam giác đều', 'hsg', ['math.triangle_congruence'], ['math.prove_triangle_congruence'], ['hsg', 'construction']),
    ],
    sourceFiles: [
      source('22-chuyen-de-boi-duong-hinh-hoc-7.pdf', 'hsg'),
      source('bai-tap-hinh-hoc-7.pdf', 'practice'),
      source('cac-dang-toan-va-phuong-phap-giai-toan-7-ngo-van-tho.pdf', 'practice'),
      source('Cac-Dạng-Toán-Phương-Pháp-Giải-T7-T1.pdf', 'practice', 'pdf'),
      source('tai-lieu-hoc-tap-mon-toan-7-hoc-ki-1-nam-hoc-2025-2026.docx', 'lesson'),
    ],
  },
  {
    id: 'math7.statistics.data_plots',
    grade: 7,
    semester: 2,
    order: 50,
    unit: 'S1',
    strand: 'statistics_probability',
    title: 'Thu thập và biểu diễn dữ liệu',
    shortTitle: 'Thống kê',
    description: 'Thu thập dữ liệu, phân loại dữ liệu, lập bảng tần số và biểu diễn dữ liệu trên biểu đồ hình quạt tròn và biểu đồ đoạn thẳng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.data_statistics'],
    skillIds: ['math.collect_classify_data', 'math.read_charts'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math7.probability.simple_probability'],
    learningObjectives: [
      'Thu thập và phân loại dữ liệu theo các tiêu chí cho trước.',
      'Đọc và lập bảng tần số thống kê.',
      'Đọc hiểu và biểu diễn dữ liệu trên biểu đồ đoạn thẳng và biểu đồ hình quạt tròn.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math7.statistics.collect_classify', 'Thu thập, phân loại dữ liệu và lập bảng thống kê', 'foundation', ['math.data_statistics'], ['math.collect_classify_data'], ['collect', 'classify']),
      pattern('math7.statistics.read_charts', 'Đọc, phân tích và giải thích biểu đồ đoạn thẳng, biểu đồ quạt tròn', 'core', ['math.data_statistics'], ['math.read_charts'], ['charts']),
      pattern('math7.statistics.applications', 'Phân tích dữ liệu thực tế và nhận diện biểu đồ gây hiểu lầm', 'application', ['math.data_statistics'], ['math.read_charts'], ['charts', 'application']),
    ],
    sourceFiles: [
      source('tai-lieu-hoc-them-mon-toan-7-sach-ket-noi-tri-thuc-voi-cuoc-song-hoc-ki-2.pdf', 'lesson'),
    ],
  },
  {
    id: 'math7.algebra.ratios_proportions',
    grade: 7,
    semester: 1,
    order: 60,
    unit: 'N3',
    strand: 'algebra',
    title: 'Tỉ lệ thức và đại lượng tỉ lệ',
    shortTitle: 'Tỉ lệ thức & Đại lượng tỉ lệ',
    description: 'Tỉ lệ thức, tính chất của dãy tỉ số bằng nhau, đại lượng tỉ lệ thuận, đại lượng tỉ lệ nghịch và các bài toán thực tế tương ứng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.proportions', 'math.direct_proportion', 'math.inverse_proportion'],
    skillIds: ['math.solve_proportions', 'math.solve_proportion_word_problems'],
    prerequisiteTopicIds: ['math7.algebra.rational_numbers'],
    bridgeToTopicIds: ['math7.algebra.expressions_polynomials'],
    learningObjectives: [
      'Hiểu định nghĩa tỉ lệ thức và áp dụng tính chất dãy tỉ số bằng nhau.',
      'Giải bài toán tìm x, y, z từ dãy tỉ số bằng nhau.',
      'Giải quyết các bài toán về đại lượng tỉ lệ thuận, tỉ lệ nghịch.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math7.ratios_proportions.ratios', 'Tỉ lệ thức và biến đổi tỉ lệ thức cơ bản', 'foundation', ['math.proportions'], ['math.solve_proportions'], ['proportions']),
      pattern('math7.ratios_proportions.properties', 'Tìm các ẩn số x, y, z từ dãy tỉ số bằng nhau', 'core', ['math.proportions'], ['math.solve_proportions'], ['properties', 'find_x']),
      pattern('math7.ratios_proportions.word_problems', 'Giải toán thực tế về đại lượng tỉ lệ thuận, tỉ lệ nghịch và chia tỉ lệ', 'core', ['math.direct_proportion', 'math.inverse_proportion'], ['math.solve_proportion_word_problems'], ['word_problems']),
      pattern('math7.ratios_proportions.advanced', 'Chứng minh các đẳng thức và bất đẳng thức từ dãy tỉ số bằng nhau', 'advanced', ['math.proportions'], ['math.solve_proportions'], ['proof', 'advanced']),
      pattern('math7.ratios_proportions.hsg', 'Phương trình nghiệm nguyên và dãy tỉ số đặc biệt nâng cao', 'hsg', ['math.proportions'], ['math.solve_proportions'], ['hsg', 'integer_solution']),
    ],
    sourceFiles: [
      source('8-chuyen-de-boi-duong-hoc-sinh-gioi-mon-toan-7-phan-dai-so.pdf', 'hsg'),
      source('tai-lieu-hoc-tap-mon-toan-7-hoc-ki-1-nam-hoc-2025-2026.docx', 'lesson'),
      source('cac-dang-toan-va-phuong-phap-giai-toan-7-ngo-van-tho.pdf', 'practice'),
      source('Cac-Dạng-Toán-Phương-Pháp-Giải-T7-T1.pdf', 'practice', 'pdf'),
    ],
  },
  {
    id: 'math7.algebra.expressions_polynomials',
    grade: 7,
    semester: 2,
    order: 70,
    unit: 'N4',
    strand: 'algebra',
    title: 'Biểu thức đại số & Đa thức một biến',
    shortTitle: 'Biểu thức & Đa thức',
    description: 'Biểu thức đại số, đa thức một biến, thu gọn và sắp xếp đa thức, phép tính cộng, trừ, nhân, chia đa thức một biến, nghiệm của đa thức một biến.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.algebraic_expression', 'math.one_variable_polynomial'],
    skillIds: ['math.simplify_polynomial', 'math.divide_polynomial', 'math.find_polynomial_roots'],
    prerequisiteTopicIds: ['math7.algebra.rational_numbers', 'math7.algebra.ratios_proportions'],
    bridgeToTopicIds: [],
    learningObjectives: [
      'Tính giá trị biểu thức đại số tại các giá trị của biến.',
      'Thực hiện thành thạo cộng, trừ, nhân, chia đa thức một biến.',
      'Tìm nghiệm của đa thức một biến và hiểu định lý Bézout.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math7.expressions_polynomials.simplify', 'Thu gọn biểu thức đại số, tính giá trị biểu thức đại số', 'foundation', ['math.algebraic_expression'], ['math.simplify_polynomial'], ['simplify', 'value']),
      pattern('math7.expressions_polynomials.one_var_poly', 'Đa thức một biến, thu gọn, sắp xếp và cộng trừ đa thức một biến', 'core', ['math.one_variable_polynomial'], ['math.simplify_polynomial'], ['one_var']),
      pattern('math7.expressions_polynomials.multiply_divide', 'Nhân và chia đa thức một biến (phép chia hết và phép chia có dư)', 'core', ['math.one_variable_polynomial'], ['math.divide_polynomial'], ['multiply', 'divide']),
      pattern('math7.expressions_polynomials.roots', 'Tìm nghiệm của đa thức một biến và chứng minh đa thức không có nghiệm', 'advanced', ['math.one_variable_polynomial'], ['math.find_polynomial_roots'], ['roots']),
      pattern('math7.expressions_polynomials.hsg', 'Đa thức nâng cao, định lý Bézout, phân tích đa thức thành nhân tử và cực trị đa thức', 'hsg', ['math.one_variable_polynomial'], ['math.simplify_polynomial'], ['hsg', 'bezout']),
    ],
    sourceFiles: [
      source('8-chuyen-de-boi-duong-hoc-sinh-gioi-mon-toan-7-phan-dai-so.pdf', 'hsg'),
      source('tai-lieu-hoc-them-mon-toan-7-sach-ket-noi-tri-thuc-voi-cuoc-song-hoc-ki-2.pdf', 'lesson'),
    ],
  },
  {
    id: 'math7.probability.simple_probability',
    grade: 7,
    semester: 2,
    order: 80,
    unit: 'S2',
    strand: 'statistics_probability',
    title: 'Làm quen với biến cố và xác suất',
    shortTitle: 'Biến cố & Xác suất',
    description: 'Biến cố chắc chắn, biến cố không thể, biến cố ngẫu nhiên, xác suất của biến cố đơn giản trong các mô hình đồng khả năng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.event', 'math.probability'],
    skillIds: ['math.identify_events', 'math.compute_probability'],
    prerequisiteTopicIds: ['math7.statistics.data_plots'],
    bridgeToTopicIds: [],
    learningObjectives: [
      'Nhận biết các loại biến cố: chắc chắn, không thể, ngẫu nhiên.',
      'Tính xác suất của biến cố trong các mô hình đơn giản (tung đồng xu, gieo xúc xắc).',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math7.probability.events', 'Phân loại biến cố ngẫu nhiên, chắc chắn, không thể trong thực tiễn', 'foundation', ['math.event'], ['math.identify_events'], ['events']),
      pattern('math7.probability.probability', 'Tính xác suất của biến cố trong mô hình chọn ngẫu nhiên', 'core', ['math.probability'], ['math.compute_probability'], ['probability']),
      pattern('math7.probability.experimental', 'Xác suất thực nghiệm và ước lượng thống kê thực tế', 'application', ['math.probability'], ['math.compute_probability'], ['experimental']),
    ],
    sourceFiles: [
      source('tai-lieu-hoc-them-mon-toan-7-sach-ket-noi-tri-thuc-voi-cuoc-song-hoc-ki-2.pdf', 'lesson'),
    ],
  },
  {
    id: 'math7.geometry.triangle_relations',
    grade: 7,
    semester: 2,
    order: 90,
    unit: 'G3',
    strand: 'geometry',
    title: 'Quan hệ các yếu tố trong tam giác',
    shortTitle: 'Quan hệ trong tam giác',
    description: 'Quan hệ góc và cạnh đối diện, đường vuông góc và đường xiên, bất đẳng thức tam giác, sự đồng quy của ba đường trung tuyến, phân giác, trung trực, cao.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.triangle_relations', 'math.concurrence', 'math.triangle_inequality'],
    skillIds: ['math.compare_lengths_angles', 'math.prove_concurrence'],
    prerequisiteTopicIds: ['math7.geometry.congruent_triangles'],
    bridgeToTopicIds: [],
    learningObjectives: [
      'So sánh cạnh và góc trong tam giác dựa vào quan hệ đối diện.',
      'Sử dụng bất đẳng thức tam giác để chứng minh sự tạo thành tam giác hoặc đánh giá độ dài.',
      'Hiểu tính chất đồng quy của bốn loại đường trong tam giác và vận dụng giải toán hình học.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math7.triangle_relations.sides_angles', 'Quan hệ giữa góc và cạnh đối diện; đường vuông góc và đường xiên', 'foundation', ['math.triangle_relations'], ['math.compare_lengths_angles'], ['sides_angles', 'projections']),
      pattern('math7.triangle_relations.inequality', 'Bất đẳng thức tam giác và ứng dụng chứng minh, tìm khoảng độ dài', 'core', ['math.triangle_inequality'], ['math.compare_lengths_angles'], ['inequality']),
      pattern('math7.triangle_relations.concurrences', 'Sự đồng quy của ba đường trung tuyến, ba đường phân giác và tính chất trọng tâm, tâm đường tròn nội tiếp', 'core', ['math.concurrence'], ['math.prove_concurrence'], ['centroid', 'incenter']),
      pattern('math7.triangle_relations.altitudes_perpendicular_bisectors', 'Sự đồng quy của ba đường trung trực, ba đường cao và tính chất trực tâm, tâm đường tròn ngoại tiếp', 'core', ['math.concurrence'], ['math.prove_concurrence'], ['orthocenter', 'circumcenter']),
      pattern('math7.triangle_relations.hsg', 'Cực trị hình học (tìm giá trị nhỏ nhất/lớn nhất của tổng đoạn thẳng) và các bài toán điểm đồng quy đặc biệt', 'hsg', ['math.triangle_relations'], ['math.prove_concurrence'], ['hsg', 'extrema']),
    ],
    sourceFiles: [
      source('22-chuyen-de-boi-duong-hinh-hoc-7.pdf', 'hsg'),
      source('bai-tap-hinh-hoc-7.pdf', 'practice'),
      source('cac-dang-toan-va-phuong-phap-giai-toan-7-ngo-van-tho.pdf', 'practice'),
      source('Cac-Dạng-Toán-Phương-Pháp-Giải-T7-T1.pdf', 'practice', 'pdf'),
      source('tai-lieu-hoc-them-mon-toan-7-sach-ket-noi-tri-thuc-voi-cuoc-song-hoc-ki-2.pdf', 'lesson'),
    ],
  },
  {
    id: 'math7.geometry.solid_shapes',
    grade: 7,
    semester: 2,
    order: 100,
    unit: 'G4',
    strand: 'geometry',
    title: 'Hình khối trong thực tiễn',
    shortTitle: 'Hình khối thực tiễn',
    description: 'Hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác và lăng trụ đứng tứ giác, công thức tính diện tích xung quanh và thể tích.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.solid_geometry', 'math.prism'],
    skillIds: ['math.compute_solid_area_volume'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    learningObjectives: [
      'Mô tả hình lăng trụ đứng tam giác và tứ giác.',
      'Tính diện tích xung quanh và thể tích hình lăng trụ đứng tam giác/tứ giác.',
      'Vận dụng tính toán giải quyết các bài toán thực tế tích hợp.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math7.solid_shapes.prism_3d', 'Nhận diện hình hộp chữ nhật, lập phương và lăng trụ đứng', 'foundation', ['math.prism'], ['math.compute_solid_area_volume'], ['identify', 'prism']),
      pattern('math7.solid_shapes.area_volume', 'Tính diện tích xung quanh, diện tích toàn phần và thể tích hình lăng trụ đứng', 'core', ['math.prism'], ['math.compute_solid_area_volume'], ['area', 'volume']),
      pattern('math7.solid_shapes.practical', 'Bài toán thực tế thiết kế, đóng hộp, sơn hoặc đắp đất dùng lăng trụ đứng', 'application', ['math.solid_geometry'], ['math.compute_solid_area_volume'], ['practical']),
    ],
    sourceFiles: [
      source('tai-lieu-hoc-them-mon-toan-7-sach-ket-noi-tri-thuc-voi-cuoc-song-hoc-ki-2.pdf', 'lesson'),
    ],
  },
];

export const MATH7_CHECKPOINTS: Math7Checkpoint[] = [
  {
    id: 'math7.checkpoint.midterm_1',
    title: 'Kiểm tra giữa kỳ 1 lớp 7',
    semester: 1,
    week: 9,
    topicIds: ['math7.algebra.rational_numbers', 'math7.algebra.real_numbers', 'math7.geometry.angles_parallel_lines'],
    sourceFiles: [],
  },
  {
    id: 'math7.checkpoint.final_1',
    title: 'Kiểm tra cuối kỳ 1 lớp 7',
    semester: 1,
    week: 17,
    topicIds: [
      'math7.algebra.rational_numbers',
      'math7.algebra.real_numbers',
      'math7.geometry.angles_parallel_lines',
      'math7.geometry.congruent_triangles',
      'math7.algebra.ratios_proportions',
    ],
    sourceFiles: [],
  },
];

export const MATH7_ACCESS_INDEX = buildMath7AccessIndex(MATH7_LEARNING_MATRIX);

export function getMath7TopicById(topicId: string): Math7TopicPlan | undefined {
  return MATH7_LEARNING_MATRIX.find((topic) => topic.id === topicId);
}

export function getMath7TopicsByAxis(axis: Math7AccessAxis, value: string | number): Math7TopicPlan[] {
  const key = String(value);
  return (MATH7_ACCESS_INDEX[axis][key] || []).map((topicId) => getMath7TopicById(topicId)).filter(Boolean) as Math7TopicPlan[];
}

export function getMath7PatternsByLevel(level: MathLearningLevel): Array<Math7Pattern & { topicId: string }> {
  return MATH7_LEARNING_MATRIX.flatMap((topic) =>
    topic.patterns
      .filter((topicPattern) => topicPattern.level === level)
      .map((topicPattern) => ({ ...topicPattern, topicId: topic.id })),
  );
}

export function buildMath7CoverageMatrix(topics = MATH7_LEARNING_MATRIX): Math7CoverageRow[] {
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
): Math7Pattern {
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

function buildMath7AccessIndex(topics: Math7TopicPlan[]): Record<Math7AccessAxis, Record<string, string[]>> {
  const index: Record<Math7AccessAxis, Record<string, string[]>> = {
    grade: {},
    semester: {},
    strand: {},
    unit: {},
    topic: {},
    level: {},
    examTarget: {},
  };

  topics.forEach((topic) => {
    addIndex(index.grade, 7, topic.id);
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

function inferSourceFormat(fileName: string): Math7SourceFile['format'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.dot')) return 'dot';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'doc';
}
