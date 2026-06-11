import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math8Strand = 'algebra' | 'geometry' | 'statistics_probability' | 'advanced' | 'assessment';
export type Math8Semester = 1 | 2 | 'full_year';
export type Math8SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math8AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';

export interface Math8SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf';
  kind: Math8SourceKind;
}

export interface Math8Pattern {
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

export interface Math8TopicPlan {
  id: string;
  grade: 8;
  semester: Math8Semester;
  order: number;
  unit: string;
  strand: Math8Strand;
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
  patterns: Math8Pattern[];
  sourceFiles: Math8SourceFile[];
}

export interface Math8Checkpoint {
  id: string;
  title: string;
  semester: Math8Semester;
  week: number;
  topicIds: string[];
  sourceFiles: Math8SourceFile[];
}

export interface Math8CoverageRow {
  topicId: string;
  strand: Math8Strand;
  semester: Math8Semester;
  unit: string;
  sourceCount: number;
  patternCount: number;
  byLevel: Record<string, number>;
}

export const MATH8_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/toan 8/extracted_kntt';
export const MATH8_PROGRAM_IDS: ContentProgramId[] = ['vn_math_8', 'vn_math_6_8', 'vn_math_6_9', 'vn_math_thcs'];
export const MATH8_MATRIX_AXES: Math8AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

const COMMON_PROGRAM_IDS = MATH8_PROGRAM_IDS;

function source(fileName: string, kind: Math8SourceKind, format?: Math8SourceFile['format']): Math8SourceFile {
  const extension = format || inferSourceFormat(fileName);
  return {
    fileName,
    path: `${MATH8_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH8_LEARNING_MATRIX: Math8TopicPlan[] = [
  {
    id: 'math8.algebra.polynomials',
    grade: 8,
    semester: 1,
    order: 10,
    unit: 'N1',
    strand: 'algebra',
    title: 'Đơn thức và Đa thức nhiều biến',
    shortTitle: 'Đơn thức & Đa thức',
    description: 'Khái niệm đơn thức, đa thức nhiều biến, thu gọn đơn thức/đa thức và các phép toán cộng, trừ, nhân, chia đơn thức/đa thức.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.polynomial', 'math.algebraic_expression'],
    skillIds: ['math.factor_polynomial'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math8.algebra.identities_factorization'],
    learningObjectives: [
      'Nhận biết và phân biệt đơn thức, đa thức nhiều biến.',
      'Thu gọn đơn thức, đa thức và xác định bậc của đa thức.',
      'Thực hiện thành thạo cộng, trừ, nhân, chia đơn thức với đa thức nhiều biến.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school'],
    patterns: [
      pattern('math8.polynomials.simplify', 'Thu gọn đơn thức, đa thức nhiều biến và tìm bậc', 'foundation', ['math.polynomial'], ['math.factor_polynomial'], ['polynomial', 'simplify']),
      pattern('math8.polynomials.operations', 'Phép toán cộng, trừ, nhân đơn thức và đa thức', 'core', ['math.polynomial'], ['math.factor_polynomial'], ['polynomial', 'operations']),
      pattern('math8.polynomials.division', 'Chia đa thức cho đơn thức nhiều biến', 'application', ['math.polynomial'], ['math.factor_polynomial'], ['polynomial', 'division']),
      pattern('math8.polynomials.advanced_division', 'Phép chia đa thức một biến đã sắp xếp và định lý Bézout', 'advanced', ['math.polynomial'], ['math.factor_polynomial'], ['polynomial', 'advanced_division']),
    ],
    sourceFiles: [
      source('CHƯƠNG 1. ĐA THỨC.docx', 'lesson'),
      source('chuyen-de-chia-het-cua-da-thuc-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
    ],
  },
  {
    id: 'math8.algebra.identities_factorization',
    grade: 8,
    semester: 1,
    order: 20,
    unit: 'N2',
    strand: 'algebra',
    title: 'Hằng đẳng thức đáng nhớ và Phân tích đa thức thành nhân tử',
    shortTitle: 'Hằng đẳng thức & Phân tích đa thức',
    description: 'Khai triển 7 hằng đẳng thức đáng nhớ, tính nhanh biểu thức số/đại số, và các phương pháp phân tích đa thức thành nhân tử cơ bản đến nâng cao.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.polynomial', 'math.factorization', 'math.algebraic_extrema'],
    skillIds: ['math.factor_polynomial', 'math.factor_common_terms', 'math.solve_algebraic_extrema'],
    prerequisiteTopicIds: ['math8.algebra.polynomials'],
    bridgeToTopicIds: ['math8.algebra.fractions', 'math8.algebra.diophantine_equation'],
    learningObjectives: [
      'Khai triển thành thạo 7 hằng đẳng thức đáng nhớ cốt lõi.',
      'Sử dụng các phương pháp phân tích đa thức thành nhân tử: đặt nhân tử chung, dùng hằng đẳng thức, nhóm hạng tử.',
      'Áp dụng phương pháp tách hạng tử, đặt ẩn phụ và thêm bớt nâng cao bồi dưỡng học sinh giỏi.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math8.identities.expand_simplify', 'Khai triển và rút gọn biểu thức bằng hằng đẳng thức', 'foundation', ['math.polynomial'], ['math.factor_polynomial'], ['identities']),
      pattern('math8.identities.fast_calc', 'Tính nhanh giá trị biểu thức số và đại số', 'core', ['math.polynomial'], ['math.factor_polynomial'], ['fast_calculation']),
      pattern('math8.identities.factor_basic', 'Phân tích đa thức thành nhân tử bằng phương pháp cơ bản', 'core', ['math.factorization'], ['math.factor_common_terms'], ['factorization']),
      pattern('math8.identities.factor_advanced', 'Phân tích đa thức thành nhân tử bằng tách hạng tử, đặt ẩn phụ, thêm bớt', 'advanced', ['math.factorization'], ['math.factor_common_terms'], ['factorization', 'advanced']),
      pattern('math8.identities.proof_independent', 'Chứng minh giá trị biểu thức không phụ thuộc vào biến', 'advanced', ['math.polynomial'], ['math.factor_polynomial'], ['proof']),
    ],
    sourceFiles: [
      source('CHƯƠNG 2. HẰNG ĐẲNG THỨC.docx', 'lesson'),
      source('chuyen-de-bat-dang-thuc-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
      source('chuyen-de-gia-tri-lon-nhat-gia-tri-nho-nhat-cua-bieu-thuc-boi-duong-hsg-toan-8.pdf', 'hsg'),
      source('chuyen-de-phan-tich-da-thuc-thanh-nhan-tu-boi-duong-hoc-sinh-gioi-toan-8-2.pdf', 'hsg'),
      source('chuyen-de-tim-gtln-gtnn-cua-bieu-thuc-boi-duong-hoc-sinh-gioi-toan-8-2.pdf', 'hsg'),
      source('chuyen-de-tinh-gia-tri-bieu-thuc-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
    ],
  },
  {
    id: 'math8.geometry.quadrilaterals',
    grade: 8,
    semester: 1,
    order: 30,
    unit: 'G1',
    strand: 'geometry',
    title: 'Tứ giác và Các phép đối xứng hình học',
    shortTitle: 'Tứ giác',
    description: 'Tổng các góc của tứ giác, dấu hiệu nhận biết hình thang, hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông và các phép đối xứng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.triangle_quadrilateral_geometry', 'math.plane_geometry'],
    skillIds: ['math.reason_triangle_quadrilateral'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math8.geometry.thales_theorem'],
    learningObjectives: [
      'Tính được số đo góc chưa biết của một tứ giác.',
      'Chứng minh các loại tứ giác đặc biệt (hình thang, hình bình hành, chữ nhật, thoi, vuông) dựa trên dấu hiệu nhận biết.',
      'Áp dụng tính chất đối xứng trục và đối xứng tâm vào các bài toán chứng minh hình học.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math8.quadrilaterals.angles', 'Tính số đo góc của tứ giác', 'foundation', ['math.triangle_quadrilateral_geometry'], ['math.reason_triangle_quadrilateral'], ['angles']),
      pattern('math8.quadrilaterals.proof_special', 'Chứng minh hình thang cân, hình bình hành, chữ nhật, thoi, vuông', 'core', ['math.triangle_quadrilateral_geometry'], ['math.reason_triangle_quadrilateral'], ['proof']),
      pattern('math8.quadrilaterals.midpoint_properties', 'Đường trung bình của tam giác và của hình thang', 'core', ['math.triangle_quadrilateral_geometry'], ['math.reason_triangle_quadrilateral'], ['midpoint']),
      pattern('math8.quadrilaterals.projections', 'Bài toán hình chiếu các đỉnh hình bình hành lên đường thẳng', 'advanced', ['math.triangle_quadrilateral_geometry'], ['math.reason_triangle_quadrilateral'], ['projection', 'hsg']),
      pattern('math8.quadrilaterals.symmetry', 'Bài toán liên quan đến đối xứng trục và đối xứng tâm', 'advanced', ['math.triangle_quadrilateral_geometry'], ['math.reason_triangle_quadrilateral'], ['symmetry']),
    ],
    sourceFiles: [
      source('CHƯƠNG 3. TỨ GIÁC.docx', 'lesson'),
      source('chuyen-de-cac-bai-toan-ve-tu-giac-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
      source('chuyen-de-tu-giac-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
    ],
  },
  {
    id: 'math8.geometry.thales_theorem',
    grade: 8,
    semester: 1,
    order: 40,
    unit: 'G2',
    strand: 'geometry',
    title: 'Định lý Thalès và ứng dụng trong tam giác',
    shortTitle: 'Định lý Thalès',
    description: 'Định lý Thalès thuận, đảo, hệ quả trong tam giác, tính chất đường phân giác của tam giác và ứng dụng tính độ dài đoạn thẳng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.similarity_thales', 'math.plane_geometry', 'math.advanced_geometry_theorems'],
    skillIds: ['math.apply_similarity_thales', 'math.apply_advanced_geometry_theorems'],
    prerequisiteTopicIds: ['math8.geometry.quadrilaterals'],
    bridgeToTopicIds: ['math8.geometry.similarity'],
    learningObjectives: [
      'Tính tỉ số đoạn thẳng và tính độ dài đoạn thẳng bằng định lý Thalès và hệ quả.',
      'Chứng minh hai đường thẳng song song bằng định lý Thalès đảo.',
      'Vận dụng tính chất đường phân giác trong và phân giác ngoài để tính độ dài các cạnh của tam giác.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math8.thales.length', 'Tính độ dài đoạn thẳng bằng định lý Thalès và hệ quả', 'foundation', ['math.similarity_thales'], ['math.apply_similarity_thales'], ['thales', 'length']),
      pattern('math8.thales.parallel', 'Chứng minh hai đường thẳng song song bằng định lý Thalès đảo', 'core', ['math.similarity_thales'], ['math.apply_similarity_thales'], ['thales', 'parallel']),
      pattern('math8.thales.bisector', 'Áp dụng tính chất đường phân giác trong và ngoài của tam giác', 'core', ['math.similarity_thales'], ['math.apply_similarity_thales'], ['bisector']),
      pattern('math8.thales.advanced_geometry', 'Định lý Menelaus, Ceva, Van-Oben và kỹ thuật vẽ đường phụ', 'advanced', ['math.advanced_geometry_theorems'], ['math.apply_advanced_geometry_theorems'], ['menelaus', 'ceva', 'hsg']),
    ],
    sourceFiles: [
      source('CHƯƠNG 4. ĐỊNH LÍ TA LÉT.docx', 'lesson'),
      source('chuyen-de-tam-giac-dong-dang-ta-let-va-lien-quan-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
    ],
  },
  {
    id: 'math8.statistics.data_plots',
    grade: 8,
    semester: 1,
    order: 50,
    unit: 'S1',
    strand: 'statistics_probability',
    title: 'Thống kê dữ liệu',
    shortTitle: 'Thống kê dữ liệu',
    description: 'Phân loại dữ liệu, thu thập dữ liệu và cách biểu diễn dữ liệu trên các loại biểu đồ: cột, cột kép, quạt tròn, đoạn thẳng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.statistics'],
    skillIds: ['math.interpret_statistics', 'math.interpret_charts'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math8.probability.simple_probability'],
    learningObjectives: [
      'Phân loại và tổ chức dữ liệu theo các tiêu chí.',
      'Đọc, hiểu và vẽ các loại biểu đồ cột, quạt tròn, đoạn thẳng phù hợp với dữ liệu.',
      'Nhận diện các biểu đồ biểu diễn dữ liệu gây hiểu lầm trong thực tế.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school'],
    patterns: [
      pattern('math8.statistics.collect_classify', 'Phân loại dữ liệu và lập bảng tần số thống kê', 'foundation', ['math.statistics'], ['math.interpret_statistics'], ['statistics']),
      pattern('math8.statistics.plot', 'Vẽ và đọc hiểu dữ liệu trên các loại biểu đồ', 'core', ['math.statistics'], ['math.interpret_charts'], ['charts']),
      pattern('math8.statistics.misleading_plots', 'Nhận diện và phân tích biểu đồ gây hiểu lầm', 'application', ['math.statistics'], ['math.interpret_statistics'], ['misleading_charts']),
    ],
    sourceFiles: [
      source('CHƯƠNG 5. DỮ LIỆU VÀ BIỂU ĐỒ.docx', 'lesson'),
    ],
  },
  {
    id: 'math8.algebra.fractions',
    grade: 8,
    semester: 2,
    order: 60,
    unit: 'N3',
    strand: 'algebra',
    title: 'Phân thức đại số',
    shortTitle: 'Phân thức đại số',
    description: 'Định nghĩa phân thức đại số, tìm ĐKXĐ, rút gọn phân thức, quy đồng mẫu thức và thực hiện cộng, trừ, nhân, chia phân thức.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.algebraic_fraction', 'math.algebraic_expression'],
    skillIds: ['math.transform_algebraic_fraction'],
    prerequisiteTopicIds: ['math8.algebra.identities_factorization'],
    bridgeToTopicIds: ['math8.algebra.linear_equations'],
    learningObjectives: [
      'Tìm điều kiện xác định (ĐKXĐ) và tính giá trị của phân thức.',
      'Rút gọn phân thức đại số đưa về tối giản.',
      'Quy đồng mẫu thức nhiều phân thức và thực hiện thành thạo bốn phép tính cộng, trừ, nhân, chia.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math8.fractions.domain_value', 'Tìm điều kiện xác định và tính giá trị phân thức', 'foundation', ['math.algebraic_fraction'], ['math.transform_algebraic_fraction'], ['domain']),
      pattern('math8.fractions.simplify', 'Rút gọn phân thức đại số', 'core', ['math.algebraic_fraction'], ['math.transform_algebraic_fraction'], ['simplify']),
      pattern('math8.fractions.operations', 'Cộng, trừ, nhân, chia các phân thức đại số', 'core', ['math.algebraic_fraction'], ['math.transform_algebraic_fraction'], ['operations']),
      pattern('math8.fractions.integer_value', 'Tìm giá trị nguyên của biến để phân thức đạt giá trị nguyên', 'advanced', ['math.algebraic_fraction'], ['math.transform_algebraic_fraction'], ['integer_value', 'hsg']),
      pattern('math8.fractions.proof_irreducible', 'Chứng minh phân thức đại số tối giản hoặc rút gọn dãy phân thức tuần hoàn', 'advanced', ['math.algebraic_fraction'], ['math.transform_algebraic_fraction'], ['proof', 'hsg']),
    ],
    sourceFiles: [
      source('Chuong 6. ( 24 trang)..docx', 'lesson'),
      source('DAP AN CHUONG 6 ( 27 trang).docx', 'practice'),
      source('chuyen-de-cac-bai-toan-ve-phan-thuc-dai-so-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
    ],
  },
  {
    id: 'math8.algebra.linear_equations',
    grade: 8,
    semester: 2,
    order: 70,
    unit: 'N4',
    strand: 'algebra',
    title: 'Phương trình bậc nhất một ẩn',
    shortTitle: 'Phương trình bậc nhất',
    description: 'Giải phương trình bậc nhất một ẩn, phương trình tích, phương trình chứa ẩn ở mẫu và giải bài toán bằng cách lập phương trình.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.linear_equation'],
    skillIds: ['math.solve_linear_equation'],
    prerequisiteTopicIds: ['math8.algebra.fractions'],
    bridgeToTopicIds: ['math8.probability.simple_probability'],
    learningObjectives: [
      'Giải phương trình bậc nhất một ẩn và các phương trình đưa được về dạng bậc nhất.',
      'Giải phương trình tích và phương trình chứa ẩn ở mẫu thức.',
      'Giải toán bằng cách lập phương trình đối với các dạng toán chuyển động, năng suất, quan hệ số.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math8.linear_equations.solve', 'Giải phương trình bậc nhất một ẩn và phương trình đưa về dạng bậc nhất', 'foundation', ['math.linear_equation'], ['math.solve_linear_equation'], ['equations']),
      pattern('math8.linear_equations.reducible', 'Giải phương trình tích và phương trình chứa ẩn ở mẫu thức', 'core', ['math.linear_equation'], ['math.solve_linear_equation'], ['reducible_equations']),
      pattern('math8.linear_equations.word_problems', 'Giải bài toán thực tế bằng cách lập phương trình', 'application', ['math.linear_equation'], ['math.solve_linear_equation'], ['word_problem']),
      pattern('math8.linear_equations.advanced_substitution', 'Giải phương trình bậc cao, phương trình đối xứng bằng phương pháp đặt ẩn phụ', 'advanced', ['math.linear_equation'], ['math.solve_linear_equation'], ['advanced_equations', 'hsg']),
    ],
    sourceFiles: [
      source('Chuong 7. ( 30 trang)..docx', 'lesson'),
      source('DAP AN CHUONG 7 ( 32 trang).docx', 'practice'),
      source('chuyen-de-giai-phuong-trinh-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
      source('chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
    ],
  },
  {
    id: 'math8.probability.simple_probability',
    grade: 8,
    semester: 2,
    order: 80,
    unit: 'S2',
    strand: 'statistics_probability',
    title: 'Mở đầu về Xác suất của biến cố',
    shortTitle: 'Xác suất',
    description: 'Xác suất lý thuyết trong các mô hình đơn giản, xác suất thực nghiệm và sơ đồ hình cây trong các bài toán đếm.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.probability', 'math.experimental_probability'],
    skillIds: ['math.compute_simple_probability', 'math.estimate_experimental_probability'],
    prerequisiteTopicIds: ['math8.algebra.linear_equations', 'math8.statistics.data_plots'],
    bridgeToTopicIds: ['math8.geometry.similarity'],
    learningObjectives: [
      'Tính xác suất lý thuyết của biến cố trong các mô hình chọn ngẫu nhiên đồng khả năng.',
      'Sử dụng xác suất thực nghiệm để ước lượng số lượng phần tử thực tế.',
      'Vẽ sơ đồ hình cây để giải các bài toán đếm và tính xác suất nhiều bước.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school'],
    patterns: [
      pattern('math8.probability.simple_event', 'Tính xác suất lý thuyết của biến cố đơn giản', 'foundation', ['math.probability'], ['math.compute_simple_probability'], ['probability']),
      pattern('math8.probability.experimental', 'Tính xác suất thực nghiệm và ước lượng thống kê thực tế', 'core', ['math.experimental_probability'], ['math.estimate_experimental_probability'], ['experimental_probability']),
      pattern('math8.probability.tree_diagram', 'Áp dụng sơ đồ hình cây và đếm nâng cao trong xác suất', 'advanced', ['math.probability'], ['math.compute_simple_probability'], ['counting', 'tree_diagram']),
    ],
    sourceFiles: [
      source('Chuong 8. Mở đầu về tính xác suất của biến cố ( 16 trang)..docx', 'lesson'),
      source('DAP AN CHUONG 8 ( 7 trang).docx', 'practice'),
    ],
  },
  {
    id: 'math8.geometry.similarity',
    grade: 8,
    semester: 2,
    order: 90,
    unit: 'G3',
    strand: 'geometry',
    title: 'Tam giác đồng dạng',
    shortTitle: 'Tam giác đồng dạng',
    description: 'Định nghĩa hai tam giác đồng dạng, các trường hợp đồng dạng c.c.c, c.g.c, g.g, đồng dạng trong tam giác vuông và ứng dụng đo đạc thực tế.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.similarity_thales', 'math.plane_geometry', 'math.advanced_geometry_theorems'],
    skillIds: ['math.apply_similarity_thales', 'math.apply_advanced_geometry_theorems'],
    prerequisiteTopicIds: ['math8.geometry.thales_theorem'],
    bridgeToTopicIds: ['math8.geometry.solid_shapes'],
    learningObjectives: [
      'Chứng minh hai tam giác đồng dạng qua các trường hợp cơ bản.',
      'Tính tỉ số đồng dạng, độ dài cạnh, và tỉ số diện tích giữa hai tam giác đồng dạng.',
      'Chứng minh các hệ thức hình học phức tạp bằng cách thiết lập tam giác đồng dạng bắc cầu.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'hsg'],
    patterns: [
      pattern('math8.similarity.prove', 'Chứng minh hai tam giác đồng dạng (c.c.c, c.g.c, g.g)', 'foundation', ['math.similarity_thales'], ['math.apply_similarity_thales'], ['similarity']),
      pattern('math8.similarity.metrics', 'Tính tỉ số đồng dạng, độ dài cạnh, tỉ số diện tích và chu vi', 'core', ['math.similarity_thales'], ['math.apply_similarity_thales'], ['similarity', 'metrics']),
      pattern('math8.similarity.proof_advanced', 'Chứng minh hệ thức tích hình học phức tạp bằng đồng dạng bắc cầu', 'advanced', ['math.advanced_geometry_theorems'], ['math.apply_advanced_geometry_theorems'], ['similarity_proof', 'hsg']),
    ],
    sourceFiles: [
      source('Chuong 9. TAM GIÁC ĐỒNG DẠNG( 28 trang)..docx', 'lesson'),
      source('DAP AN CHUONG 9 ( 25 trang).docx', 'practice'),
      source('chuyen-de-tam-giac-dong-dang-boi-duong-hoc-sinh-gioi-toan-8.pdf', 'hsg'),
    ],
  },
  {
    id: 'math8.geometry.solid_shapes',
    grade: 8,
    semester: 2,
    order: 100,
    unit: 'G4',
    strand: 'geometry',
    title: 'Một số hình khối trong thực tiễn',
    shortTitle: 'Hình khối thực tiễn',
    description: 'Hình hộp chữ nhật, hình lăng trụ đứng tam giác, hình lăng trụ đứng tứ giác, hình chóp tam giác đều và chóp tứ giác đều.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.spatial_geometry'],
    skillIds: ['math.compute_solid_measure'],
    prerequisiteTopicIds: ['math8.geometry.similarity'],
    bridgeToTopicIds: [],
    learningObjectives: [
      'Tính diện tích xung quanh, diện tích toàn phần và thể tích hình hộp chữ nhật, hình lăng trụ đứng.',
      'Tính diện tích xung quanh, thể tích hình chóp tam giác đều và chóp tứ giác đều bằng trung đoạn.',
      'Vận dụng các công thức tính toán hình khối để giải quyết các bài toán thực tế tích hợp.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school'],
    patterns: [
      pattern('math8.solid_shapes.prisms', 'Tính diện tích xung quanh và thể tích hình hộp, lăng trụ đứng', 'foundation', ['math.spatial_geometry'], ['math.compute_solid_measure'], ['prisms', 'volume']),
      pattern('math8.solid_shapes.pyramids', 'Tính diện tích xung quanh và thể tích hình chóp tam giác/tứ giác đều', 'core', ['math.spatial_geometry'], ['math.compute_solid_measure'], ['pyramids', 'volume']),
      pattern('math8.solid_shapes.truncated', 'Bài toán liên quan đến hình chóp cụt đều và thực tế tích hợp', 'advanced', ['math.spatial_geometry'], ['math.compute_solid_measure'], ['truncated_pyramids']),
    ],
    sourceFiles: [
      source('Chuong 10. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN ( 10 TRANG)..docx', 'lesson'),
      source('ĐÁP ÁN CHƯƠNG 10 ( 8 trang)..docx', 'practice'),
    ],
  },
];

export const MATH8_CHECKPOINTS: Math8Checkpoint[] = [
  {
    id: 'math8.checkpoint.midterm_1',
    title: 'Kiểm tra giữa kỳ 1 lớp 8',
    semester: 1,
    week: 9,
    topicIds: ['math8.algebra.polynomials', 'math8.algebra.identities_factorization'],
    sourceFiles: [],
  },
  {
    id: 'math8.checkpoint.final_1',
    title: 'Kiểm tra cuối kỳ 1 lớp 8',
    semester: 1,
    week: 17,
    topicIds: ['math8.algebra.polynomials', 'math8.algebra.identities_factorization', 'math8.geometry.quadrilaterals', 'math8.geometry.thales_theorem', 'math8.statistics.data_plots'],
    sourceFiles: [],
  },
];

export const MATH8_ACCESS_INDEX = buildMath8AccessIndex(MATH8_LEARNING_MATRIX);

export function getMath8TopicById(topicId: string): Math8TopicPlan | undefined {
  return MATH8_LEARNING_MATRIX.find((topic) => topic.id === topicId);
}

export function getMath8TopicsByAxis(axis: Math8AccessAxis, value: string | number): Math8TopicPlan[] {
  const key = String(value);
  return (MATH8_ACCESS_INDEX[axis][key] || []).map((topicId) => getMath8TopicById(topicId)).filter(Boolean) as Math8TopicPlan[];
}

export function getMath8PatternsByLevel(level: MathLearningLevel): Array<Math8Pattern & { topicId: string }> {
  return MATH8_LEARNING_MATRIX.flatMap((topic) =>
    topic.patterns
      .filter((topicPattern) => topicPattern.level === level)
      .map((topicPattern) => ({ ...topicPattern, topicId: topic.id })),
  );
}

export function buildMath8CoverageMatrix(topics = MATH8_LEARNING_MATRIX): Math8CoverageRow[] {
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
): Math8Pattern {
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

function buildMath8AccessIndex(topics: Math8TopicPlan[]): Record<Math8AccessAxis, Record<string, string[]>> {
  const index: Record<Math8AccessAxis, Record<string, string[]>> = {
    grade: {},
    semester: {},
    strand: {},
    unit: {},
    topic: {},
    level: {},
    examTarget: {},
  };

  topics.forEach((topic) => {
    addIndex(index.grade, 8, topic.id);
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

function inferSourceFormat(fileName: string): Math8SourceFile['format'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.dot')) return 'dot';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'doc';
}
