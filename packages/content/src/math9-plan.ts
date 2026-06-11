import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math9Strand = 'algebra' | 'geometry' | 'statistics_probability' | 'advanced' | 'assessment';
export type Math9Semester = 1 | 2 | 'full_year';
export type Math9SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';
export type Math9AccessAxis = 'grade' | 'semester' | 'strand' | 'unit' | 'topic' | 'level' | 'examTarget';
export type Math9Exam10Cluster =
  | 'exam10.radicals_and_algebra'
  | 'exam10.equations_systems_modeling'
  | 'exam10.functions_quadratic_vieta'
  | 'exam10.geometry_core'
  | 'exam10.geometry_advanced'
  | 'exam10.real_world_statistics_probability'
  | 'exam10.advanced_hsg'
  | 'exam10.mixed_mock';
export type Math9Exam10Stage = 'diagnostic' | 'foundation_review' | 'topic_drill' | 'mixed_practice' | 'advanced_extension' | 'mock_exam';
export type Math9Exam10ScoreBand = '5_6' | '7_8' | '8_9' | '9_10' | 'specialized';
export type Math9Exam10SourceRole = 'new_local_source' | 'legacy_miumath' | 'bridge';

export interface Math9SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf' | 'zip' | 'rar';
  kind: Math9SourceKind;
}

export interface Math9Pattern {
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

export interface Math9TopicPlan {
  id: string;
  grade: 9;
  semester: Math9Semester;
  order: number;
  unit: string;
  strand: Math9Strand;
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
  patterns: Math9Pattern[];
  sourceFiles: Math9SourceFile[];
}

export interface Math9Checkpoint {
  id: string;
  title: string;
  semester: Math9Semester;
  week: number;
  topicIds: string[];
  sourceFiles: Math9SourceFile[];
}

export interface Math9CoverageRow {
  topicId: string;
  strand: Math9Strand;
  semester: Math9Semester;
  unit: string;
  sourceCount: number;
  patternCount: number;
  byLevel: Record<string, number>;
}

export interface Math9Exam10ReviewClusterPlan {
  id: Math9Exam10Cluster;
  title: string;
  shortTitle: string;
  description: string;
  stage: Math9Exam10Stage;
  scoreBand: Math9Exam10ScoreBand;
  sourceRole: Math9Exam10SourceRole;
  topicIds: string[];
  learningObjectives: string[];
  sourceFileNames: string[];
  legacyMiuMathCategories: string[];
  legacyMiuMathSubCategories?: string[];
  recommendedEntryTopicIds: string[];
  advancedExtensionTopicIds: string[];
}

export const MATH9_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/TOAN 9';
export const MATH9_PROGRAM_IDS: ContentProgramId[] = ['vn_math_9', 'vn_math_vao_10', 'vn_math_6_9', 'vn_math_thcs'];
export const MATH9_MATRIX_AXES: Math9AccessAxis[] = ['grade', 'semester', 'strand', 'unit', 'topic', 'level', 'examTarget'];

const COMMON_PROGRAM_IDS = MATH9_PROGRAM_IDS;

function source(fileName: string, kind: Math9SourceKind, format?: Math9SourceFile['format']): Math9SourceFile {
  const extension = format || inferSourceFormat(fileName);
  return {
    fileName,
    path: `${MATH9_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

export const MATH9_LEARNING_MATRIX: Math9TopicPlan[] = [
  {
    id: 'math9.algebra.radicals_domain',
    grade: 9,
    semester: 1,
    order: 10,
    unit: 'A1',
    strand: 'algebra',
    title: 'Can bac hai, can bac ba va dieu kien can thuc',
    shortTitle: 'Can thuc - dieu kien',
    description: 'Can bac hai, can thuc bac hai, can bac ba, tap xac dinh va dieu kien hop le truoc khi bien doi bieu thuc.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.algebraic_expression'],
    skillIds: ['math.simplify_expression'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math9.algebra.radicals_transform', 'math9.algebra.radical_equations'],
    learningObjectives: [
      'Nhan biet can bac hai so hoc, can thuc bac hai va can bac ba.',
      'Dat dieu kien xac dinh truoc khi rut gon hoac giai phuong trinh.',
      'Kiem tra gia tri hop le cua bien sau moi phep bien doi can thuc.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.radicals.domain_basic', 'Tim dieu kien xac dinh cua can thuc don gian', 'foundation', ['math.algebraic_expression'], ['math.simplify_expression'], ['radical', 'domain']),
      pattern('math9.radicals.compare_compute', 'Tinh va so sanh can bac hai, can bac ba', 'core', ['math.algebraic_expression'], ['math.simplify_expression'], ['radical', 'compute']),
      pattern('math9.radicals.domain_fraction', 'Dieu kien can thuc ket hop mau va tham so', 'application', ['math.algebraic_expression'], ['math.simplify_expression'], ['radical', 'domain', 'fraction']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-CHUYEN-DE-1-CAN-BAC-HAI-VA-CAN-THUC-BAC-HAI.docx', 'lesson'),
      source('thuvienhoclieu.com-CHUYEN-DE-2-CAN-BAC-HAI.docx', 'practice'),
      source('thuvienhoclieu.com-CHUYEN-DE-8-CAN-BAC-BA.docx', 'practice'),
      source('thuvienhoclieu.com-CHUYEN-DE-9-CAN-BAC-BA-VA-CAN-THUC-BAC-BA.docx', 'practice'),
      source('chuyen-de-can-bac-hai-va-can-bac-ba-toan-9-knttvcs.pdf', 'lesson'),
      source('chuyen-de-can-thuc-toan-9-chan-troi-sang-tao.pdf', 'lesson'),
    ],
  },
  {
    id: 'math9.algebra.radicals_transform',
    grade: 9,
    semester: 1,
    order: 20,
    unit: 'A2',
    strand: 'algebra',
    title: 'Bien doi va rut gon bieu thuc chua can',
    shortTitle: 'Rut gon can thuc',
    description: 'Khai phuong, dua thua so ra/vao dau can, khu mau, truc can, rut gon bieu thuc va cau hoi phu sau rut gon.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.algebraic_expression', 'math.factorization'],
    skillIds: ['math.simplify_expression', 'math.factor_common_terms'],
    prerequisiteTopicIds: ['math9.algebra.radicals_domain'],
    bridgeToTopicIds: ['math9.algebra.radical_equations', 'math9.algebra.inequality_extrema'],
    learningObjectives: [
      'Chon dung phep bien doi can thuc theo cau truc bieu thuc.',
      'Rut gon bieu thuc phan thuc chua can theo trinh tu dieu kien -> phan tich -> bien doi.',
      'Xu ly cau hoi lien quan sau rut gon: tinh gia tri, tim x nguyen, so sanh, cuc tri co ban.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced', 'exam10'],
    examTarget: ['school', 'exam10', 'hsg'],
    patterns: [
      pattern('math9.radicals.transform_basic', 'Dua thua so ra/vao dau can va khu mau', 'foundation', ['math.algebraic_expression'], ['math.simplify_expression'], ['radical', 'transform']),
      pattern('math9.radicals.simplify_expression', 'Rut gon bieu thuc chua can nhieu buoc', 'core', ['math.algebraic_expression', 'math.factorization'], ['math.simplify_expression', 'math.factor_common_terms'], ['radical', 'simplify']),
      pattern('math9.radicals.follow_up', 'Cau hoi phu sau rut gon: gia tri, so sanh, x nguyen', 'application', ['math.algebraic_expression'], ['math.simplify_expression'], ['radical', 'follow_up']),
      pattern('math9.radicals.exam10_parameter', 'Rut gon bieu thuc chua can co tham so trong de vao 10', 'exam10', ['math.algebraic_expression'], ['math.simplify_expression'], ['radical', 'exam10']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-CHUYEN-DE-3-CAC-PHEP-BIEN-DOI-BIEU-THUC-CHUA-CAN.docx', 'lesson'),
      source('thuvienhoclieu.com-CHUYEN-DE-4-CAC-PHEP-BIEN-DOI-BIEU-THUC-CHUA-CAN-p2.docx', 'practice'),
      source('thuvienhoclieu.com-CHUYEN-DE-5-RUT-GON-BIEU-THUC.docx', 'practice'),
      source('thuvienhoclieu.com-CHUYEN-DE-6-RUT-GON-VA-CAC-CAU-HOI-SAU-BAI-TOAN-RUT-GON-p2.docx', 'practice'),
      source('on vao 10/rut gon bieu thuc chua can va bai toan lien quan.pdf', 'review'),
      source('on vao 10/chuyen-de-rut-gon-bieu-thuc-va-bai-toan-lien-quan-on-thi-vao-lop-10.pdf', 'review'),
      source('on vao 10/_tai-10-chuyen-de-luyen-thi-toan-vao-lop-10.pdf', 'review'),
    ],
  },
  {
    id: 'math9.algebra.radical_equations',
    grade: 9,
    semester: 1,
    order: 30,
    unit: 'A3',
    strand: 'algebra',
    title: 'Phuong trinh chua can thuc va phuong trinh vo ti',
    shortTitle: 'Phuong trinh can',
    description: 'Giai phuong trinh chua can bang dieu kien, binh phuong, dat an phu va kiem tra nghiem ngoai lai.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.algebraic_expression', 'math.linear_equation', 'math.quadratic_equation'],
    skillIds: ['math.simplify_expression', 'math.solve_linear_equation', 'math.solve_quadratic_by_factor'],
    prerequisiteTopicIds: ['math9.algebra.radicals_domain', 'math9.algebra.radicals_transform'],
    bridgeToTopicIds: ['math9.algebra.quadratic_equations', 'math9.advanced.number_theory'],
    learningObjectives: [
      'Dat dieu kien va bien doi tuong duong khi giai phuong trinh can.',
      'Kiem tra tung nghiem trong phuong trinh goc sau khi binh phuong.',
      'Nhan ra dang dat an phu hoac dang vo ti nang cao trong on thi.',
    ],
    estimatedWeeks: 2,
    levels: ['core', 'application', 'advanced', 'exam10'],
    examTarget: ['school', 'exam10', 'hsg'],
    patterns: [
      pattern('math9.radical_equations.basic', 'Phuong trinh can mot lan binh phuong', 'core', ['math.algebraic_expression', 'math.linear_equation'], ['math.simplify_expression', 'math.solve_linear_equation'], ['radical_equation']),
      pattern('math9.radical_equations.extraneous', 'Phuong trinh can co nghiem ngoai lai can loai', 'application', ['math.algebraic_expression'], ['math.simplify_expression'], ['extraneous_roots']),
      pattern('math9.radical_equations.substitution', 'Dat an phu trong phuong trinh vo ti', 'advanced', ['math.quadratic_equation'], ['math.solve_quadratic_by_factor'], ['substitution', 'advanced']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-CHUYEN-DE-10-PHUONG-TRINH-CHUA-CAN-THUC.docx', 'lesson'),
      source('thuvienhoclieu.com-CHUYEN-DE-11-PHUONG-TRINH-CHUA-CAN-THUC-p2.docx', 'practice'),
      source('on vao 10/chuyen-de-phuong-trinh-vo-ty-on-thi-vao-lop-10.doc', 'review'),
      source('on vao 10/tong-hop-cac-bai-toan-phuong-trinh-vo-ti-hay-va-kho-huynh-thanh-phong.pdf', 'hsg'),
    ],
  },
  {
    id: 'math9.algebra.linear_equations_inequalities',
    grade: 9,
    semester: 1,
    order: 40,
    unit: 'A4',
    strand: 'algebra',
    title: 'Phuong trinh va bat phuong trinh bac nhat',
    shortTitle: 'PT/BPT bac nhat',
    description: 'Phuong trinh bac nhat mot an, bat phuong trinh bac nhat mot an, quan ly dieu kien va bien doi dau bat dang thuc.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.linear_equation', 'math.inequality'],
    skillIds: ['math.solve_linear_equation', 'math.solve_inequality'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math9.algebra.systems', 'math9.algebra.functions_linear_quadratic'],
    learningObjectives: [
      'Giai va kiem tra phuong trinh bac nhat mot an.',
      'Giai bat phuong trinh, bieu dien tap nghiem va quan ly dau khi nhan chia so am.',
      'Doc dieu kien bai toan truoc khi rut gon hoac ket luan.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.linear_equations.solve', 'Giai phuong trinh bac nhat mot an', 'foundation', ['math.linear_equation'], ['math.solve_linear_equation'], ['linear_equation']),
      pattern('math9.inequalities.solve', 'Giai bat phuong trinh bac nhat mot an', 'core', ['math.inequality'], ['math.solve_inequality'], ['inequality']),
      pattern('math9.linear_conditions.parameter', 'Bai toan dieu kien va tham so bac nhat', 'application', ['math.linear_equation', 'math.inequality'], ['math.solve_linear_equation', 'math.solve_inequality'], ['condition', 'parameter']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-CHUYEN-DE-12-PHUONG-TRINH-VA-BAT-PHUONG-TRINH.docx.docx', 'lesson'),
      source('chuyen-de-phuong-trinh-va-bat-phuong-trinh-bac-nhat-mot-an-toan-9-knttvcs.pdf', 'practice'),
      source('on vao 10/MỘT SỐ PHƯƠNG PHÁP GIẢI PHƯƠNG TRÌNH CÓ CHỨA ẨN Ở MẪU.pdf', 'review'),
    ],
  },
  {
    id: 'math9.algebra.systems',
    grade: 9,
    semester: 1,
    order: 50,
    unit: 'A5',
    strand: 'algebra',
    title: 'Phuong trinh bac nhat hai an va he phuong trinh',
    shortTitle: 'He phuong trinh',
    description: 'Phuong trinh bac nhat hai an, nghiem cua he, giai he bang the, cong dai so, dat an phu va ky thuat nang cao.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.linear_equation'],
    skillIds: ['math.solve_system'],
    prerequisiteTopicIds: ['math9.algebra.linear_equations_inequalities'],
    bridgeToTopicIds: ['math9.algebra.word_problem_systems', 'math9.algebra.functions_linear_quadratic'],
    learningObjectives: [
      'Bieu dien nghiem phuong trinh bac nhat hai an va y nghia hinh hoc.',
      'Giai he phuong trinh bang the, cong dai so va kiem tra cap nghiem.',
      'Nhan dien he co tham so, he dac biet va he can dat an phu.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'exam10', 'hsg'],
    patterns: [
      pattern('math9.systems.linear_two_unknowns', 'Phuong trinh bac nhat hai an va tap nghiem', 'foundation', ['math.linear_equation'], ['math.solve_system'], ['linear_two_unknowns']),
      pattern('math9.systems.elimination_substitution', 'Giai he bang the va cong dai so', 'core', ['math.linear_equation'], ['math.solve_system'], ['system', 'elimination']),
      pattern('math9.systems.parameter', 'He phuong trinh co tham so', 'application', ['math.linear_equation'], ['math.solve_system'], ['parameter']),
      pattern('math9.systems.auxiliary', 'Dat an phu trong he phuong trinh nang cao', 'advanced', ['math.linear_equation'], ['math.solve_system'], ['substitution', 'advanced']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-CHUYEN-DE-14-PHUONG-TRINH-BAC-NHAT-HAI-AN.docx', 'lesson'),
      source('thuvienhoclieu.com-CHUYEN-DE-15-HE-PHUONG-TRINH.docx', 'practice'),
      source('nang-cao-ky-nang-dat-an-phu-giai-phuong-trinh-he-phuong-trinh-metoan.com.docx', 'hsg'),
      source('chuyen-de-phuong-trinh-va-he-hai-phuong-trinh-bac-nhat-hai-an-toan-9-knttvcs.pdf', 'lesson'),
    ],
  },
  {
    id: 'math9.algebra.word_problem_systems',
    grade: 9,
    semester: 1,
    order: 60,
    unit: 'A6',
    strand: 'algebra',
    title: 'Giai bai toan bang cach lap phuong trinh, he phuong trinh',
    shortTitle: 'Lap PT/HPT',
    description: 'Mo hinh hoa bai toan thuc te, chon an, lap phuong trinh/he, giai va tra loi dung dai luong duoc hoi.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.word_problem_modeling', 'math.linear_equation'],
    skillIds: ['math.model_word_problem', 'math.solve_system'],
    prerequisiteTopicIds: ['math9.algebra.systems'],
    bridgeToTopicIds: ['math9.algebra.quadratic_equations', 'math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Dat an kem don vi va dieu kien hop ly.',
      'Chuyen ngon ngu bai toan thanh phuong trinh hoac he phuong trinh.',
      'Doi chieu nghiem voi ngu canh va viet cau tra loi cuoi.',
    ],
    estimatedWeeks: 3,
    levels: ['core', 'application', 'advanced', 'exam10'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.modeling.motion_work', 'Bai toan chuyen dong, nang suat, cong viec', 'core', ['math.word_problem_modeling'], ['math.model_word_problem', 'math.solve_system'], ['modeling']),
      pattern('math9.modeling.number_percent', 'Bai toan so, tuoi, phan tram va lai suat', 'application', ['math.word_problem_modeling'], ['math.model_word_problem'], ['number', 'percent']),
      pattern('math9.modeling.real_world_exam10', 'Toan thuc te van dung cao trong de vao 10', 'exam10', ['math.word_problem_modeling'], ['math.model_word_problem', 'math.solve_system'], ['real_world', 'exam10']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-CHUYEN-DE-13-GIAI-BAI-TOAN-BANG-CACH-LAP-HPT.docx', 'lesson'),
      source('on vao 10/chuyen-de-giai-bai-toan-bang-cach-lap-phuong-trinh-on-thi-vao-lop-10.pdf', 'review'),
      source('on vao 10/chuyen-de-he-phuong-trinh-bac-nhat-hai-an-va-giai-bai-toan-bang-cach-lap-he-phuong-trinh.pdf', 'review'),
      source('on vao 10/BO CAU HOI VAN DUNG CAO - TOAN THUC TE (75 CAU) (DE).pdf', 'review'),
      source('on vao 10/toan thuc te luyen thi vao lop 10.pdf', 'review'),
      source('on vao 10/Toan thực tế THCS.pdf', 'review'),
      source('chuyen-de-toan-thuc-te-mon-toan-9-nguyen-ngoc-dung.pdf', 'practice'),
    ],
  },
  {
    id: 'math9.algebra.functions_linear_quadratic',
    grade: 9,
    semester: 2,
    order: 70,
    unit: 'A7',
    strand: 'algebra',
    title: 'Ham so bac nhat, ham so y = ax^2 va do thi',
    shortTitle: 'Ham so & do thi',
    description: 'Ham so bac nhat, do thi duong thang, parabol y = ax^2, tuong giao va y nghia tham so.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.functions_graphs', 'math.quadratic_equation'],
    skillIds: ['math.analyze_function_graph', 'math.solve_quadratic_by_factor'],
    prerequisiteTopicIds: ['math9.algebra.linear_equations_inequalities'],
    bridgeToTopicIds: ['math9.algebra.quadratic_equations', 'math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Doc he so goc, tung do goc va ve duong thang tu bang gia tri.',
      'Ve va phan tich parabol y = ax^2: huong mo, truc doi xung, diem thuoc do thi.',
      'Lien he giao diem do thi voi nghiem phuong trinh/he phuong trinh.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced', 'exam10'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.functions.linear_graph', 'Duong thang, he so goc va giao diem', 'foundation', ['math.functions_graphs'], ['math.analyze_function_graph'], ['linear_function']),
      pattern('math9.functions.parabola_y_ax2', 'Parabol y = ax^2 va diem thuoc do thi', 'core', ['math.functions_graphs'], ['math.analyze_function_graph'], ['quadratic_function']),
      pattern('math9.functions.intersection', 'Tuong giao duong thang va parabol', 'application', ['math.functions_graphs', 'math.quadratic_equation'], ['math.analyze_function_graph', 'math.solve_quadratic_by_factor'], ['intersection']),
      pattern('math9.functions.parameter_exam10', 'Bai toan tham so ham so trong de vao 10', 'exam10', ['math.functions_graphs'], ['math.analyze_function_graph'], ['parameter', 'exam10']),
    ],
    sourceFiles: [
      source('chuyen-de-ham-so-y-ax2-a-≠-0-phuong-trinh-bac-hai-mot-an-toan-9-knttvcs.pdf', 'lesson'),
      source('on vao 10/Chuyên đề hàm số ôn thi lớp 10.pdf', 'review'),
      source('on vao 10/chuyen-de-ham-so-bac-hai-va-bai-toan-tuong-giao-on-thi-vao-lop-10.pdf', 'review'),
    ],
  },
  {
    id: 'math9.algebra.quadratic_equations',
    grade: 9,
    semester: 2,
    order: 80,
    unit: 'A8',
    strand: 'algebra',
    title: 'Phuong trinh bac hai, Delta va he thuc Viete',
    shortTitle: 'PT bac hai & Viete',
    description: 'Giai phuong trinh bac hai bang phan tich, cong thuc nghiem, Delta/Delta phay, he thuc Viete va bai toan tham so.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.quadratic_equation', 'math.vieta', 'math.factorization'],
    skillIds: ['math.solve_quadratic_by_factor', 'math.apply_vieta', 'math.factor_common_terms'],
    prerequisiteTopicIds: ['math9.algebra.functions_linear_quadratic'],
    bridgeToTopicIds: ['math9.algebra.word_problem_systems', 'math9.advanced.inequality_extrema'],
    learningObjectives: [
      'Chon phuong phap giai phuong trinh bac hai phu hop voi dang bai.',
      'Dung Delta/Delta phay de xet so nghiem va tim nghiem.',
      'Ap dung Viete trong tinh bieu thuc doi xung, tim tham so va bai toan nghiem.',
    ],
    estimatedWeeks: 5,
    levels: ['foundation', 'core', 'application', 'advanced', 'exam10', 'hsg'],
    examTarget: ['school', 'exam10', 'hsg'],
    patterns: [
      pattern('math9.quadratic.factor', 'Giai phuong trinh bac hai bang phan tich nhan tu', 'foundation', ['math.quadratic_equation', 'math.factorization'], ['math.solve_quadratic_by_factor', 'math.factor_common_terms'], ['quadratic', 'factor']),
      pattern('math9.quadratic.delta', 'Cong thuc nghiem, Delta va so nghiem', 'core', ['math.quadratic_equation'], ['math.solve_quadratic_by_factor'], ['delta']),
      pattern('math9.quadratic.vieta_expression', 'Tinh bieu thuc nghiem bang Viete', 'application', ['math.vieta'], ['math.apply_vieta'], ['vieta']),
      pattern('math9.quadratic.parameter', 'Tham so de phuong trinh co nghiem thoa dieu kien', 'advanced', ['math.quadratic_equation', 'math.vieta'], ['math.solve_quadratic_by_factor', 'math.apply_vieta'], ['parameter']),
      pattern('math9.quadratic.exam10_word', 'Bai toan thuc te dan den phuong trinh bac hai', 'exam10', ['math.word_problem_modeling', 'math.quadratic_equation'], ['math.model_word_problem', 'math.solve_quadratic_by_factor'], ['word_problem', 'exam10']),
    ],
    sourceFiles: [
      source('chuyen-de-ham-so-y-ax2-a-≠-0-phuong-trinh-bac-hai-mot-an-toan-9-knttvcs.pdf', 'lesson'),
      source('on vao 10/chuyen-de-phuong-trinh-bac-hai-va-he-thuc-viete-on-thi-vao-lop-10.pdf', 'review'),
      source('on vao 10/bien-doi-de-tim-cuc-tri-dang-phan-thuc-ap-dung-vao-phuong-trinh-bac-hai-co-tham-so.pdf', 'hsg'),
    ],
  },
  {
    id: 'math9.geometry.right_triangle_trig',
    grade: 9,
    semester: 1,
    order: 90,
    unit: 'G1',
    strand: 'geometry',
    title: 'He thuc luong va ti so luong giac trong tam giac vuong',
    shortTitle: 'He thuc luong',
    description: 'He thuc ve canh va duong cao trong tam giac vuong, ti so luong giac cua goc nhon va ung dung thuc te.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.trigonometry', 'math.basic_geometry'],
    skillIds: ['math.use_trig_ratios', 'math.reason_basic_geometry'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math9.geometry.circle_angles', 'math9.geometry.proof_synthesis'],
    learningObjectives: [
      'Ghi nho va ap dung he thuc luong trong tam giac vuong.',
      'Chon dung sin, cos, tan, cot theo goc va canh.',
      'Mo hinh hoa bai toan do dac thuc te bang tam giac vuong.',
    ],
    estimatedWeeks: 4,
    levels: ['foundation', 'core', 'application', 'advanced', 'exam10'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.trig.metric_relations', 'He thuc canh, duong cao, hinh chieu trong tam giac vuong', 'foundation', ['math.basic_geometry'], ['math.reason_basic_geometry'], ['right_triangle']),
      pattern('math9.trig.ratios', 'Tinh ti so luong giac va canh/goc trong tam giac vuong', 'core', ['math.trigonometry'], ['math.use_trig_ratios'], ['trigonometry']),
      pattern('math9.trig.real_world', 'Ung dung he thuc luong vao do dac thuc te', 'application', ['math.trigonometry', 'math.word_problem_modeling'], ['math.use_trig_ratios', 'math.model_word_problem'], ['real_world']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-CHUYEN-DE-16-HE-THUC-LUONG-TRONG-TAM-GIAC-VUONG.docx', 'lesson'),
      source('thuvienhoclieu.com-CHUYEN-DE-17-UNG-DUNG-THUC-TE-HE-THUC-LUONG-TRONG-TAM-GIAC-VUONG.docx', 'practice'),
      source('thuvienhoclieu.com-CHUYEN-DE-18-CAC-DANG-BAI-TAP-HE-THUC-LUONG-TRONG-TAM-GIAC-VUONG.docx', 'practice'),
      source('chuyen-de-he-thuc-luong-trong-tam-giac-vuong-toan-9-knttvcs.pdf', 'lesson'),
      source('on vao 10/chuyen-de-he-thuc-luong-trong-tam-giac-vuong-on-thi-vao-lop-10.pdf', 'review'),
      source('on vao 10/chuyen-de-he-thuc-luong-trong-tam-giac-vuong-va-ung-dung-ti-so-luong-giac.pdf', 'review'),
      source('on vao 10/CHƯƠNG I. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG.pdf', 'review'),
    ],
  },
  {
    id: 'math9.geometry.circle_angles',
    grade: 9,
    semester: 2,
    order: 100,
    unit: 'G2',
    strand: 'geometry',
    title: 'Goc voi duong tron, cung va day',
    shortTitle: 'Goc duong tron',
    description: 'Goc o tam, goc noi tiep, goc tao boi tiep tuyen/day/cat tuyen, lien he cung, day va so do goc.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    prerequisiteTopicIds: ['math9.geometry.right_triangle_trig'],
    bridgeToTopicIds: ['math9.geometry.cyclic_tangent_secant', 'math9.geometry.proof_synthesis'],
    learningObjectives: [
      'Nhan dien loai goc trong duong tron va cung bi chan.',
      'Tinh so do goc/cung tu quan he noi tiep, o tam, tiep tuyen.',
      'Dung dinh ly goc de mo khoa bai chung minh hinh tron.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'advanced'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.circle_angles.measure', 'Tinh goc, cung va day trong duong tron', 'foundation', ['math.plane_geometry'], ['math.geometry_reasoning'], ['circle', 'angle']),
      pattern('math9.circle_angles.proof', 'Chung minh goc bang nhau bang cung/day/goc noi tiep', 'core', ['math.geometry_proof'], ['math.prove_circle_geometry'], ['proof']),
      pattern('math9.circle_angles.mixed', 'Ket hop goc duong tron voi tam giac vuong va dong dang', 'application', ['math.geometry_proof'], ['math.prove_circle_geometry'], ['mixed_geometry']),
    ],
    sourceFiles: [
      source('chuyen-de-duong-tron-toan-9-knttvcs.pdf', 'lesson'),
      source('on vao 10/chuyen-de-goc-voi-duong-tron-on-thi-vao-lop-10.pdf', 'review'),
      source('on vao 10/CHƯƠNG III. GÓC VỚI ĐƯỜNG TRÒN.pdf', 'review'),
    ],
  },
  {
    id: 'math9.geometry.cyclic_tangent_secant',
    grade: 9,
    semester: 2,
    order: 110,
    unit: 'G3',
    strand: 'geometry',
    title: 'Tu giac noi tiep, tiep tuyen va cat tuyen',
    shortTitle: 'Noi tiep - tiep tuyen',
    description: 'Dau hieu tu giac noi tiep, duong tron noi/ngoai tiep, tiep tuyen, cat tuyen va cac he thuc do dai.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    prerequisiteTopicIds: ['math9.geometry.circle_angles'],
    bridgeToTopicIds: ['math9.geometry.proof_synthesis'],
    learningObjectives: [
      'Chon dung tieu chuan chung minh bon diem cung thuoc mot duong tron.',
      'Dung quan he ban kinh - tiep tuyen, tiep tuyen - day cung va cat tuyen.',
      'Lap chuoi chung minh goc, song song, tich do dai trong cau hinh duong tron.',
    ],
    estimatedWeeks: 5,
    levels: ['core', 'application', 'advanced', 'exam10', 'hsg'],
    examTarget: ['school', 'exam10', 'hsg'],
    patterns: [
      pattern('math9.cyclic.prove', 'Chung minh tu giac noi tiep', 'core', ['math.geometry_proof'], ['math.prove_circle_geometry'], ['cyclic_quadrilateral']),
      pattern('math9.tangent.basic', 'Tiep tuyen, ban kinh va day cung', 'application', ['math.plane_geometry'], ['math.prove_circle_geometry'], ['tangent']),
      pattern('math9.secant.length', 'He thuc cat tuyen, tiep tuyen va tich do dai', 'advanced', ['math.geometry_proof'], ['math.prove_circle_geometry'], ['secant_tangent']),
      pattern('math9.circle.exam10_proof', 'Bai hinh duong tron tong hop on vao 10', 'exam10', ['math.geometry_proof'], ['math.prove_circle_geometry'], ['exam10', 'proof']),
    ],
    sourceFiles: [
      source('chuyen-de-duong-tron-ngoai-tiep-va-duong-tron-noi-tiep-toan-9-knttvcs.pdf', 'lesson'),
      source('on vao 10/chuyen-de-tu-giac-noi-tiep-on-thi-vao-lop-10.pdf', 'review'),
      source('on vao 10/chuyen-de-duong-tron-on-thi-vao-lop-10.doc', 'review'),
      source('on vao 10/QUAN HỆ GIỮA CÁC ĐƯỜNG CAO TRONG TAM GIÁC VÀ ĐƯỜNG TRÒN.pdf', 'hsg'),
      source('on vao 10/CHƯƠNG IV. CHÙM BÀI TOÁN LIÊN QUAN ĐIỂM, ĐƯỜNG ĐẶC BIỆT TRONG TAM GIÁC, TIẾP TUYẾN CẮT TUYẾN CỦA ĐƯỜNG TRÒN.pdf', 'hsg'),
    ],
  },
  {
    id: 'math9.geometry.proof_synthesis',
    grade: 9,
    semester: 'full_year',
    order: 120,
    unit: 'G4',
    strand: 'geometry',
    title: 'Chung minh hinh hoc tong hop va mo hinh nang cao',
    shortTitle: 'Hinh tong hop',
    description: 'Khung lap luan hinh hoc: phan tich gia thiet, duong phu, dong quy/thang hang, diem co dinh, dinh ly noi tieng.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.geometry_proof', 'math.plane_geometry', 'math.advanced_geometry_theorems'],
    skillIds: ['math.geometry_reasoning', 'math.prove_circle_geometry', 'math.apply_advanced_geometry_theorems'],
    prerequisiteTopicIds: ['math9.geometry.circle_angles', 'math9.geometry.cyclic_tangent_secant'],
    bridgeToTopicIds: ['math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Viet duoc khung chung minh tu muc tieu ve dinh ly ung vien.',
      'Nhan dien diem/duong dac biet, dong quy, thang hang va diem co dinh.',
      'Ket hop dong dang, duong tron, ti so va duong phu trong bai hinh kho.',
    ],
    estimatedWeeks: 4,
    levels: ['application', 'advanced', 'hsg', 'exam10'],
    examTarget: ['exam10', 'hsg'],
    patterns: [
      pattern('math9.proof.plan', 'Lap ke hoach chung minh hinh hoc', 'application', ['math.geometry_proof'], ['math.geometry_reasoning'], ['proof_plan']),
      pattern('math9.proof.special_points', 'Diem dac biet, duong dac biet va dong quy', 'advanced', ['math.advanced_geometry_theorems'], ['math.apply_advanced_geometry_theorems'], ['special_points']),
      pattern('math9.proof.famous_theorems', 'Ung dung dinh ly hinh hoc noi tieng', 'hsg', ['math.advanced_geometry_theorems'], ['math.apply_advanced_geometry_theorems'], ['hsg']),
    ],
    sourceFiles: [
      source('Phát triển kỹ năng giải toán hình học phẳng dành cho bậc THCS.pdf', 'hsg'),
      source('on vao 10/kien-thuc-kinh-nghiem-trai-nghiem-lam-bai-hinh-hoc-toan-chung-cho-hoc-sinh-lop-9.pdf', 'review'),
      source('on vao 10/kien-thuc-kinh-nghiem-trai-nghiem-lam-bai-hinh-hoc-toan-chuyen-cho-hoc-sinh-lop-9.pdf', 'hsg'),
      source('on vao 10/chuyen-de-nhung-dinh-ly-hinh-hoc-noi-tieng-on-thi-vao-lop-10.pdf', 'hsg'),
      source('on vao 10/chuyen-de-cac-mo-hinh-thuong-gap-va-cac-bai-toan-tong-hop-hinh-hoc-on-thi-vao-lop-10.pdf', 'hsg'),
      source('on vao 10/CHƯƠNG VII. NHỮNG ĐỊNH LÝ HÌNH HỌC NỔI TIẾNG.pdf', 'hsg'),
      source('on vao 10/he-thong-cac-khai-niem-co-ban-va-dinh-ly-hinh-hoc-thcs-hinh-hoc-phang.pdf', 'review'),
      source('on vao 10/mot-so-bai-tap-chon-loc-hinh-hoc-phang-on-thi-vao-lop-10.pdf', 'hsg'),
      source('on vao 10/CHƯƠNG V. THẲNG HẰNG, ĐỒNG QUY, ĐIỂM CỐ ĐỊNH, ĐƯỜNG CỐ ĐỊNH.pdf', 'hsg'),
    ],
  },
  {
    id: 'math9.geometry.solid_geometry',
    grade: 9,
    semester: 2,
    order: 130,
    unit: 'G5',
    strand: 'geometry',
    title: 'Hinh tru, hinh non, hinh cau va hinh khoi thuc te',
    shortTitle: 'Hinh khoi',
    description: 'Dien tich xung quanh/toan phan va the tich hinh tru, hinh non, hinh cau, bai toan hinh khoi trong thuc tien.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.spatial_geometry'],
    skillIds: ['math.compute_solid_measure'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Chon dung cong thuc dien tich, the tich theo yeu cau bai toan.',
      'Xu ly don vi do va lam tron trong bai toan thuc te.',
      'Phan tich hinh ghep, phan to dam va mo hinh vat the.',
    ],
    estimatedWeeks: 3,
    levels: ['foundation', 'core', 'application', 'exam10'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.solid.cylinder_cone_sphere', 'Tinh dien tich va the tich hinh tru, non, cau', 'foundation', ['math.spatial_geometry'], ['math.compute_solid_measure'], ['solid_geometry']),
      pattern('math9.solid.real_world', 'Hinh khoi trong thuc te va bai toan don vi', 'application', ['math.spatial_geometry'], ['math.compute_solid_measure'], ['real_world']),
      pattern('math9.solid.composite', 'Hinh ghep, phan to dam va bai toan tong hop', 'exam10', ['math.spatial_geometry'], ['math.compute_solid_measure'], ['composite']),
    ],
    sourceFiles: [
      source('chuyen-de-hinh-hoc-khong-gian-toan-9-hinh-tru-hinh-non-hinh-cau.pdf', 'lesson'),
      source('chuyen-de-hinh-khoi-trong-thuc-tien-toan-9-kntt-ly-thuyet-bai-tap-metoan.com.pdf', 'practice'),
      source('cam-nang-100-bai-tap-hinh-khoi-thuc-te-toan-9-knttvcs-co-loi-giai-metoan.com.pdf', 'practice'),
      source('on vao 10/chuyen-de-non-tru-cau-va-hinh-khoi-on-thi-vao-lop-10.pdf', 'review'),
    ],
  },
  {
    id: 'math9.statistics_probability.statistics',
    grade: 9,
    semester: 2,
    order: 140,
    unit: 'S1',
    strand: 'statistics_probability',
    title: 'Tan so, tan so tuong doi va thong ke',
    shortTitle: 'Thong ke',
    description: 'Bang tan so, tan so tuong doi, bieu do va doc hieu du lieu trong bai toan nha truong va de thi.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.statistics'],
    skillIds: ['math.interpret_statistics', 'math.interpret_charts'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math9.statistics_probability.probability', 'math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Lap bang tan so, tan so tuong doi va chon mau so dung.',
      'Doc bieu do/bang so lieu va rut ra ket luan co can cu.',
      'Xu ly cau thong ke ngan trong de kiem tra va de vao 10.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application', 'exam10'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.statistics.frequency_table', 'Bang tan so va tan so tuong doi', 'foundation', ['math.statistics'], ['math.interpret_statistics'], ['frequency']),
      pattern('math9.statistics.chart_reading', 'Doc bang, bieu do va so sanh du lieu', 'core', ['math.statistics'], ['math.interpret_charts'], ['chart']),
      pattern('math9.statistics.exam10', 'Cau thong ke trong de on vao 10', 'exam10', ['math.statistics'], ['math.interpret_statistics'], ['exam10']),
    ],
    sourceFiles: [
      source('chuyen-de-tan-so-va-tan-so-tuong-doi-toan-9-knttvcs.pdf', 'lesson'),
      source('chuyen-de-tan-so-va-tan-so-tuong-doi-toan-9-knttvcs-tai-lieu-toan-dien-135-trang-metoan.com.pdf', 'practice'),
      source('on vao 10/chuyen-de-mot-so-yeu-to-thong-ke-on-thi-vao-lop-10.pdf', 'review'),
    ],
  },
  {
    id: 'math9.statistics_probability.probability',
    grade: 9,
    semester: 2,
    order: 150,
    unit: 'S2',
    strand: 'statistics_probability',
    title: 'Xac suat cua bien co trong mo hinh don gian',
    shortTitle: 'Xac suat',
    description: 'Khong gian mau, bien co, xac suat co ban va xac suat trong cac mo hinh thuc nghiem/on thi.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.probability'],
    skillIds: ['math.compute_probability'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Liet ke khong gian mau va bien co thuan loi.',
      'Tinh xac suat bang ti so truong hop thuan loi/truong hop co the.',
      'Giai cau xac suat trong de kiem tra lop 9 va de vao 10.',
    ],
    estimatedWeeks: 2,
    levels: ['foundation', 'core', 'application', 'exam10'],
    examTarget: ['school', 'exam10'],
    patterns: [
      pattern('math9.probability.sample_space', 'Liet ke khong gian mau va bien co', 'foundation', ['math.probability'], ['math.compute_probability'], ['sample_space']),
      pattern('math9.probability.simple_models', 'Tinh xac suat voi dong xu, xuc xac, rut the', 'core', ['math.probability'], ['math.compute_probability'], ['simple_probability']),
      pattern('math9.probability.exam10', 'Bai xac suat trong ki thi vao 10', 'exam10', ['math.probability'], ['math.compute_probability'], ['exam10']),
    ],
    sourceFiles: [
      source('chuyen-de-xac-suat-cua-bien-co-trong-mot-so-mo-hinh-xac-suat-don-gian-toan-9-knttvcs.pdf', 'lesson'),
      source('chuyen-de-xac-suat-cua-bien-co-trong-mot-so-mo-hinh-xac-suat-don-gian-toan-9-knttvcs-metoan.com.pdf', 'practice'),
      source('on vao 10/cac-bai-toan-xac-suat-lop-9-va-trong-ki-thi-tuyen-sinh-lop-10-nguyen-hong-diep.pdf', 'review'),
      source('on vao 10/cac-bai-toan-xac-suat-lop-9-va-trong-ki-thi-tuyen-sinh-lop-10-nguyen-hong-diep-trang-1.pdf', 'review'),
      source('on vao 10/chuyen-de-mot-so-yeu-to-xac-suat-on-thi-vao-lop-10.pdf', 'review'),
    ],
  },
  {
    id: 'math9.advanced.inequality_extrema',
    grade: 9,
    semester: 'full_year',
    order: 160,
    unit: 'H1',
    strand: 'advanced',
    title: 'Bat dang thuc, cuc tri va dieu kien nang cao',
    shortTitle: 'BDT & cuc tri',
    description: 'Bat dang thuc co ban, Cauchy, bien doi phan thuc, cuc tri dai so/hinh hoc va ung dung trong de chuyen.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.inequality', 'math.algebraic_extrema'],
    skillIds: ['math.solve_inequality', 'math.solve_algebraic_extrema'],
    prerequisiteTopicIds: ['math9.algebra.radicals_transform', 'math9.algebra.quadratic_equations'],
    bridgeToTopicIds: ['math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Nhan dien dang dung bat dang thuc theo cau truc bieu thuc.',
      'Bien doi ve binh phuong khong am, Cauchy hoac dieu kien Delta.',
      'Lien he cuc tri dai so voi bai toan hinh hoc/thuc te trong de kho.',
    ],
    estimatedWeeks: 4,
    levels: ['advanced', 'hsg', 'exam10'],
    examTarget: ['exam10', 'hsg'],
    patterns: [
      pattern('math9.inequality.basic_methods', 'Bien doi bat dang thuc ve dang khong am', 'advanced', ['math.inequality'], ['math.solve_inequality'], ['inequality']),
      pattern('math9.extrema.algebra', 'Tim cuc tri bieu thuc dai so va phan thuc', 'hsg', ['math.algebraic_extrema'], ['math.solve_algebraic_extrema'], ['extrema']),
      pattern('math9.extrema.geometry', 'Bat dang thuc va cuc tri hinh hoc on vao 10', 'exam10', ['math.algebraic_extrema', 'math.plane_geometry'], ['math.solve_algebraic_extrema', 'math.geometry_reasoning'], ['geometry', 'exam10']),
    ],
    sourceFiles: [
      source('on vao 10/chuyen-de-bat-dang-thuc-on-thi-vao-lop-10.pdf', 'review'),
      source('on vao 10/chuyen-de-bat-dang-thuc-va-cac-bai-toan-cuc-tri-on-thi-vao-lop-10.pdf', 'hsg'),
      source('on vao 10/chuyen-de-bat-dang-thuc-va-cuc-tri-hinh-hoc-on-thi-vao-lop-10.pdf', 'hsg'),
      source('Tuyển tập các bài toán cực trị - Bồi dưỡng học sinh giỏi THCS.pdf', 'hsg'),
      source('on vao 10/SU DUNG BDT COSI TRONG HINH HOC 9.pdf', 'hsg'),
      source('on vao 10/Bất đẳng thức chuyên giai đoạn 2009-2019.pdf', 'hsg'),
      source('on vao 10/cac-bai-toan-thuc-te-ket-hop-bat-dang-thuc-trong-cac-de-thi-mon-toan-thcs.pdf', 'hsg'),
      source('on vao 10/chuyen-de-cac-bai-toan-thuc-te-co-lien-quan-den-cuc-tri-on-thi-vao-lop-10.pdf', 'hsg'),
      source('on vao 10/tuyen-tap-300-bai-toan-bat-dang-thuc-chon-loc-co-loi-giai-chi-tiet (1).pdf', 'hsg'),
    ],
  },
  {
    id: 'math9.advanced.number_theory',
    grade: 9,
    semester: 'full_year',
    order: 170,
    unit: 'H2',
    strand: 'advanced',
    title: 'Nghiem nguyen, so nguyen to, so chinh phuong va Dirichlet',
    shortTitle: 'So hoc nang cao',
    description: 'Phuong trinh nghiem nguyen, so nguyen to, so chinh phuong, chia het, dong du va nguyen ly Dirichlet.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.integer_number', 'math.diophantine_equation', 'math.number_theory'],
    skillIds: ['math.solve_diophantine', 'math.apply_number_theory'],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Chon chien luoc chia het, dong du, chan le hoac uoc luong.',
      'Giai phuong trinh nghiem nguyen bang phan tich, modulo, danh gia.',
      'Ap dung Dirichlet va tinh chat so chinh phuong trong bai HSG.',
    ],
    estimatedWeeks: 4,
    levels: ['advanced', 'hsg', 'exam10'],
    examTarget: ['hsg', 'exam10'],
    patterns: [
      pattern('math9.number_theory.diophantine', 'Phuong trinh nghiem nguyen chon loc', 'advanced', ['math.diophantine_equation'], ['math.solve_diophantine'], ['diophantine']),
      pattern('math9.number_theory.prime_square', 'So nguyen to va so chinh phuong', 'hsg', ['math.number_theory'], ['math.apply_number_theory'], ['prime', 'square']),
      pattern('math9.number_theory.dirichlet', 'Nguyen ly Dirichlet va ung dung', 'hsg', ['math.number_theory'], ['math.apply_number_theory'], ['dirichlet']),
    ],
    sourceFiles: [
      source('Chuyên đề phương trình nghiệm nguyên.pdf', 'hsg'),
      source('on vao 10/CHỦ ĐỀ 7. MỘT SỐ PHƯƠNG PHÁP GIẢI PHƯƠNG TRÌNH NGHIỆM NGUYÊN.pdf', 'hsg'),
      source('on vao 10/CHỦ ĐỀ 8. MỘT SỐ BÀI TOÁN SỐ NGUYÊN TỐ, SỐ CHÍNH PHƯƠNG.pdf', 'hsg'),
      source('on vao 10/phuong-phap-dirichle-va-ung-dung-nguyen-huu-dien.pdf', 'hsg'),
      source('on vao 10/mot-so-phuong-phap-giai-bai-toan-phuong-trinh-nghiem-nguyen.pdf', 'hsg'),
      source('on vao 10/phuong-trinh-nghiem-nguyen-chon-loc.pdf', 'hsg'),
      source('on vao 10/_cac-chuyen-de-so-hoc-luyen-thi-vao-lop-10-chuyen-toan.pdf', 'hsg'),
    ],
  },
  {
    id: 'math9.assessment.exam10_synthesis',
    grade: 9,
    semester: 'full_year',
    order: 180,
    unit: 'E1',
    strand: 'assessment',
    title: 'Tong on Toan 9 va luyen thi vao lop 10',
    shortTitle: 'On vao 10',
    description: 'De tong hop hoc ki, khao sat, de chuyen, cac chuyen de on thi vao lop 10 va chien luoc phan loai dang bai.',
    programIds: COMMON_PROGRAM_IDS,
    conceptIds: ['math.algebraic_expression', 'math.quadratic_equation', 'math.functions_graphs', 'math.geometry_proof', 'math.statistics', 'math.probability'],
    skillIds: ['math.simplify_expression', 'math.solve_quadratic_by_factor', 'math.analyze_function_graph', 'math.geometry_reasoning', 'math.interpret_statistics', 'math.compute_probability'],
    prerequisiteTopicIds: ['math9.algebra.radicals_transform', 'math9.algebra.quadratic_equations', 'math9.geometry.cyclic_tangent_secant'],
    bridgeToTopicIds: [],
    learningObjectives: [
      'Phan loai cau hoi de thi theo chuyen de va do kho truoc khi giai.',
      'Luyen chien luoc lam bai theo thoi gian: cau nen an diem, cau van dung, cau hinh kho.',
      'Lap lo trinh on vao 10 ca dai so, hinh hoc, xac suat/thong ke va toan thuc te.',
    ],
    estimatedWeeks: 8,
    levels: ['core', 'application', 'advanced', 'exam10', 'hsg'],
    examTarget: ['school', 'exam10', 'hsg'],
    patterns: [
      pattern('math9.exam10.topic_classification', 'Phan loai nhanh cau de thi vao chuyen de', 'core', ['math.algebraic_expression', 'math.geometry_proof'], ['math.simplify_expression', 'math.geometry_reasoning'], ['classification']),
      pattern('math9.exam10.mixed_set', 'Bo de tong hop theo cau truc vao 10', 'exam10', ['math.quadratic_equation', 'math.geometry_proof'], ['math.solve_quadratic_by_factor', 'math.prove_circle_geometry'], ['exam10']),
      pattern('math9.exam10.specialized', 'De chuyen va cau HSG trong tuyen sinh', 'hsg', ['math.number_theory', 'math.advanced_geometry_theorems'], ['math.apply_number_theory', 'math.apply_advanced_geometry_theorems'], ['specialized_exam']),
    ],
    sourceFiles: [
      source('thuvienhoclieu.com-Bo-10-de-kiem-tra-HK2-Toan-9-nam-25-26.docx', 'exam'),
      source('thuvienhoclieu.com-De-thi-tuyen-sinh-10-Toan-Chuyen-KHTN-Ha-Noi-nam-26-27.docx', 'exam'),
      source('thuvienhoclieu.com-De-thi-tuyen-sinh-10-Toan-Chuyen-KHXHNV-Ha-Noi-nam-26-27.docx', 'exam'),
      source('on vao 10/13-chuyen-de-on-thi-tuyen-sinh-vao-lop-10-mon-toan.pdf', 'review'),
      source('on vao 10/8-chu-de-luyen-thi-tuyen-sinh-vao-lop-10-mon-toan.pdf', 'review'),
      source('on vao 10/trong-tam-kien-thuc-va-cac-dang-de-on-thi-vao-lop-10-mon-toan.pdf', 'review'),
      source('on vao 10/Tong on de toan luyen thi vao lop 10.pdf', 'review'),
      source('on vao 10/7-chuyen-de-luyen-thi-vao-lop-10-mon-toan-diep-tuan.pdf', 'review'),
      source('on vao 10/Cac chuyen de luyen thi vao lop 10.pdf', 'review'),
      source('on vao 10/chuyen de on thi vao 10.pdf', 'review'),
      source('on vao 10/luyen thi vao lop 10 mon toan theo chu de.pdf', 'review'),
      source('on vao 10/tai lieu boi duong hoc sinh gioi may tinh bo tui THCS.pdf', 'hsg'),
      source('Tách đề chuyên 2023-2024.pdf', 'exam'),
    ],
  },
];

export const EXAM10_REVIEW_MATRIX: Math9Exam10ReviewClusterPlan[] = [
  {
    id: 'exam10.radicals_and_algebra',
    title: 'Can thuc va bien doi dai so an diem',
    shortTitle: 'Can thuc - dai so',
    description: 'Cum cau rut gon bieu thuc, dieu kien xac dinh, cau hoi phu sau rut gon va cac bien doi dai so thuong gap trong de vao 10.',
    stage: 'foundation_review',
    scoreBand: '5_6',
    sourceRole: 'bridge',
    topicIds: ['math9.algebra.radicals_domain', 'math9.algebra.radicals_transform', 'math9.algebra.linear_equations_inequalities'],
    learningObjectives: [
      'Nhan dien dieu kien xac dinh truoc khi rut gon.',
      'Chon phep bien doi can thuc theo cau truc bieu thuc.',
      'Xu ly cau hoi phu: tinh gia tri, so sanh, tim dieu kien nguyen va cuc tri co ban.',
    ],
    sourceFileNames: [
      'on vao 10/rut gon bieu thuc chua can va bai toan lien quan.pdf',
      'on vao 10/chuyen-de-rut-gon-bieu-thuc-va-bai-toan-lien-quan-on-thi-vao-lop-10.pdf',
      'on vao 10/_tai-10-chuyen-de-luyen-thi-toan-vao-lop-10.pdf',
      'on vao 10/Má»˜T Sá» PHÆ¯Æ NG PHÃP GIáº¢I PHÆ¯Æ NG TRÃŒNH CÃ“ CHá»¨A áº¨N á»ž MáºªU.pdf',
    ],
    legacyMiuMathCategories: ['algebra-simplification'],
    legacyMiuMathSubCategories: ['algebra-evaluation', 'algebra-extrema-sub', 'algebra-simplification-core'],
    recommendedEntryTopicIds: ['math9.algebra.radicals_domain', 'math9.algebra.radicals_transform'],
    advancedExtensionTopicIds: ['math9.advanced.inequality_extrema'],
  },
  {
    id: 'exam10.equations_systems_modeling',
    title: 'Phuong trinh, he phuong trinh va lap mo hinh',
    shortTitle: 'PT - HPT - mo hinh',
    description: 'Cum bai giai phuong trinh, he phuong trinh, phuong trinh vo ti va bai toan bang cach lap phuong trinh/he.',
    stage: 'topic_drill',
    scoreBand: '7_8',
    sourceRole: 'bridge',
    topicIds: ['math9.algebra.radical_equations', 'math9.algebra.systems', 'math9.algebra.word_problem_systems', 'math9.algebra.quadratic_equations'],
    learningObjectives: [
      'Dat dieu kien va kiem tra nghiem ngoai lai.',
      'Chon the, cong dai so hoac dat an phu cho he phuong trinh.',
      'Dich ngon ngu bai toan thanh phuong trinh/he va doi chieu nghiem voi ngu canh.',
    ],
    sourceFileNames: [
      'on vao 10/chuyen-de-phuong-trinh-vo-ty-on-thi-vao-lop-10.doc',
      'on vao 10/tong-hop-cac-bai-toan-phuong-trinh-vo-ti-hay-va-kho-huynh-thanh-phong.pdf',
      'on vao 10/chuyen-de-giai-bai-toan-bang-cach-lap-phuong-trinh-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-he-phuong-trinh-bac-nhat-hai-an-va-giai-bai-toan-bang-cach-lap-he-phuong-trinh.pdf',
      'on vao 10/BO CAU HOI VAN DUNG CAO - TOAN THUC TE (75 CAU) (DE).pdf',
      'on vao 10/toan thuc te luyen thi vao lop 10.pdf',
      'on vao 10/Toan thực tế THCS.pdf',
    ],
    legacyMiuMathCategories: ['equations-systems', 'word-problems'],
    legacyMiuMathSubCategories: ['eqsys-irrational-high', 'eqsys-linear-systems', 'eqsys-quadratic-core', 'word-motion', 'word-productivity'],
    recommendedEntryTopicIds: ['math9.algebra.systems', 'math9.algebra.word_problem_systems'],
    advancedExtensionTopicIds: ['math9.algebra.radical_equations', 'math9.advanced.number_theory'],
  },
  {
    id: 'exam10.functions_quadratic_vieta',
    title: 'Ham so, parabol, phuong trinh bac hai va Viete',
    shortTitle: 'Ham so - Viete',
    description: 'Cum cau do thi, tuong giao duong thang parabol, phuong trinh bac hai, tham so va he thuc Viete.',
    stage: 'topic_drill',
    scoreBand: '8_9',
    sourceRole: 'bridge',
    topicIds: ['math9.algebra.functions_linear_quadratic', 'math9.algebra.quadratic_equations'],
    learningObjectives: [
      'Lien he giao diem do thi voi nghiem phuong trinh.',
      'Dung Delta va Viete de bien doi bieu thuc nghiem.',
      'Nhan dien bai tham so can dieu kien co nghiem, nghiem duong/am hoac cuc tri.',
    ],
    sourceFileNames: [
      'on vao 10/ChuyÃªn Ä‘á» hÃ m sá»‘ Ã´n thi lá»›p 10.pdf',
      'on vao 10/chuyen-de-ham-so-bac-hai-va-bai-toan-tuong-giao-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-phuong-trinh-bac-hai-va-he-thuc-viete-on-thi-vao-lop-10.pdf',
      'on vao 10/bien-doi-de-tim-cuc-tri-dang-phan-thuc-ap-dung-vao-phuong-trinh-bac-hai-co-tham-so.pdf',
    ],
    legacyMiuMathCategories: ['functions-graphs', 'viet-applications'],
    legacyMiuMathSubCategories: ['func-coordinate-geometry', 'func-linear-core', 'func-parabola-line', 'viet-expressions', 'viet-parameter-m', 'viet-signs'],
    recommendedEntryTopicIds: ['math9.algebra.functions_linear_quadratic', 'math9.algebra.quadratic_equations'],
    advancedExtensionTopicIds: ['math9.advanced.inequality_extrema'],
  },
  {
    id: 'exam10.geometry_core',
    title: 'Hinh hoc nen tang vao 10',
    shortTitle: 'Hinh core',
    description: 'He thuc luong, goc duong tron, tu giac noi tiep, tiep tuyen va cac cau chung minh/tinh toan an diem.',
    stage: 'topic_drill',
    scoreBand: '7_8',
    sourceRole: 'bridge',
    topicIds: ['math9.geometry.right_triangle_trig', 'math9.geometry.circle_angles', 'math9.geometry.cyclic_tangent_secant'],
    learningObjectives: [
      'Ve hinh dung va danh dau goc/cung/canh quan trong.',
      'Nhan dien cau hinh tam giac vuong, tu giac noi tiep, tiep tuyen va cat tuyen.',
      'Lap chuoi suy luan ngan de chung minh song song, vuong goc, bang nhau hoac tich do dai.',
    ],
    sourceFileNames: [
      'on vao 10/CHÆ¯Æ NG I. Há»† THá»¨C LÆ¯á»¢NG TRONG TAM GIÃC VUÃ”NG.pdf',
      'on vao 10/chuyen-de-he-thuc-luong-trong-tam-giac-vuong-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-he-thuc-luong-trong-tam-giac-vuong-va-ung-dung-ti-so-luong-giac.pdf',
      'on vao 10/chuyen-de-goc-voi-duong-tron-on-thi-vao-lop-10.pdf',
      'on vao 10/CHÆ¯Æ NG III. GÃ“C Vá»šI ÄÆ¯á»œNG TRÃ’N.pdf',
      'on vao 10/chuyen-de-tu-giac-noi-tiep-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-duong-tron-on-thi-vao-lop-10.doc',
      'on vao 10/QUAN HỆ GIỮA CÁC ĐƯỜNG CAO TRONG TAM GIÁC VÀ ĐƯỜNG TRÒN.pdf',
    ],
    legacyMiuMathCategories: ['plane-geometry', 'trigonometry-practice'],
    legacyMiuMathSubCategories: ['plane-angles-metrics', 'plane-inscribed-quad', 'plane-tangents-properties', 'trig-height-distance', 'trig-metrics-ratios'],
    recommendedEntryTopicIds: ['math9.geometry.right_triangle_trig', 'math9.geometry.circle_angles'],
    advancedExtensionTopicIds: ['math9.geometry.proof_synthesis'],
  },
  {
    id: 'exam10.geometry_advanced',
    title: 'Hinh hoc tong hop va mo hinh kho',
    shortTitle: 'Hinh nang cao',
    description: 'Cac mo hinh hinh hoc tong hop, diem/duong dac biet, dong quy, thang hang, dinh ly noi tieng va cau hinh kho.',
    stage: 'advanced_extension',
    scoreBand: '9_10',
    sourceRole: 'new_local_source',
    topicIds: ['math9.geometry.cyclic_tangent_secant', 'math9.geometry.proof_synthesis'],
    learningObjectives: [
      'Di tu ket luan ve dinh ly ung vien thay vi bien doi lan man.',
      'Chon duong phu theo muc tieu: song song, dong dang, noi tiep, tiep tuyen.',
      'Ghi chu trap hinh ve sai, diem nam ngoai doan va dieu kien dac biet.',
    ],
    sourceFileNames: [
      'on vao 10/kien-thuc-kinh-nghiem-trai-nghiem-lam-bai-hinh-hoc-toan-chung-cho-hoc-sinh-lop-9.pdf',
      'on vao 10/kien-thuc-kinh-nghiem-trai-nghiem-lam-bai-hinh-hoc-toan-chuyen-cho-hoc-sinh-lop-9.pdf',
      'on vao 10/chuyen-de-nhung-dinh-ly-hinh-hoc-noi-tieng-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-cac-mo-hinh-thuong-gap-va-cac-bai-toan-tong-hop-hinh-hoc-on-thi-vao-lop-10.pdf',
      'on vao 10/CHƯƠNG VII. NHỮNG ĐỊNH LÝ HÌNH HỌC NỔI TIẾNG.pdf',
      'on vao 10/he-thong-cac-khai-niem-co-ban-va-dinh-ly-hinh-hoc-thcs-hinh-hoc-phang.pdf',
      'on vao 10/mot-so-bai-tap-chon-loc-hinh-hoc-phang-on-thi-vao-lop-10.pdf',
      'on vao 10/CHÆ¯Æ NG V. THáº²NG Háº°NG, Äá»’NG QUY, ÄIá»‚M Cá» Äá»ŠNH, ÄÆ¯á»œNG Cá» Äá»ŠNH.pdf',
      'on vao 10/CHÆ¯Æ NG IV. CHÃ™M BÃ€I TOÃN LIÃŠN QUAN ÄIá»‚M, ÄÆ¯á»œNG Äáº¶C BIá»†T TRONG TAM GIÃC, TIáº¾P TUYáº¾N Cáº®T TUYáº¾N Cá»¦A ÄÆ¯á»œNG TRÃ’N.pdf',
    ],
    legacyMiuMathCategories: [],
    recommendedEntryTopicIds: ['math9.geometry.cyclic_tangent_secant'],
    advancedExtensionTopicIds: ['math9.geometry.proof_synthesis'],
  },
  {
    id: 'exam10.real_world_statistics_probability',
    title: 'Toan thuc te, thong ke, xac suat va hinh khoi',
    shortTitle: 'Thuc te - SXP',
    description: 'Cau van dung thuc te, thong ke/xac suat, hinh tru non cau, don vi, lam tron va doc bieu do.',
    stage: 'mixed_practice',
    scoreBand: '7_8',
    sourceRole: 'bridge',
    topicIds: ['math9.algebra.word_problem_systems', 'math9.geometry.solid_geometry', 'math9.statistics_probability.statistics', 'math9.statistics_probability.probability'],
    learningObjectives: [
      'Doc de theo dai luong, don vi va dieu kien thuc te.',
      'Chon cong thuc/ti le/bang thong ke phu hop truoc khi tinh.',
      'Kiem tra ket qua bang don vi, ngu canh va quy tac lam tron.',
    ],
    sourceFileNames: [
      'on vao 10/BO CAU HOI VAN DUNG CAO - TOAN THUC TE (75 CAU) (DE).pdf',
      'on vao 10/toan thuc te luyen thi vao lop 10.pdf',
      'on vao 10/Toan thực tế THCS.pdf',
      'on vao 10/chuyen-de-non-tru-cau-va-hinh-khoi-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-mot-so-yeu-to-thong-ke-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-mot-so-yeu-to-xac-suat-on-thi-vao-lop-10.pdf',
      'on vao 10/cac-bai-toan-xac-suat-lop-9-va-trong-ki-thi-tuyen-sinh-lop-10-nguyen-hong-diep.pdf',
      'on vao 10/cac-bai-toan-xac-suat-lop-9-va-trong-ki-thi-tuyen-sinh-lop-10-nguyen-hong-diep-trang-1.pdf',
    ],
    legacyMiuMathCategories: ['word-problems', 'spatial-geometry', 'statistics', 'probability'],
    legacyMiuMathSubCategories: ['word-math-practical', 'spatial-cone', 'spatial-cylinder', 'spatial-sphere-pyramid', 'stats-charts', 'stats-tables-metrics', 'prob-experimental', 'prob-simple'],
    recommendedEntryTopicIds: ['math9.algebra.word_problem_systems', 'math9.statistics_probability.statistics'],
    advancedExtensionTopicIds: ['math9.geometry.solid_geometry'],
  },
  {
    id: 'exam10.advanced_hsg',
    title: 'Mo rong HSG va de chuyen vao 10',
    shortTitle: 'HSG - de chuyen',
    description: 'Bat dang thuc, cuc tri, nghiem nguyen, so hoc nang cao, Casio va cau phan hoa cao trong de chuyen.',
    stage: 'advanced_extension',
    scoreBand: 'specialized',
    sourceRole: 'bridge',
    topicIds: ['math9.advanced.inequality_extrema', 'math9.advanced.number_theory', 'math9.geometry.proof_synthesis', 'math9.assessment.exam10_synthesis'],
    learningObjectives: [
      'Nhan dien dang phan hoa: danh gia, chia het, modulo, tham so, cau hinh kho.',
      'Ghi lai duong quan sat/trap truoc khi trinh bay loi giai.',
      'Lien ket bai HSG voi chuyen de goc de hoc sinh co duong quay ve nen tang.',
    ],
    sourceFileNames: [
      'on vao 10/chuyen-de-bat-dang-thuc-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-bat-dang-thuc-va-cac-bai-toan-cuc-tri-on-thi-vao-lop-10.pdf',
      'on vao 10/chuyen-de-bat-dang-thuc-va-cuc-tri-hinh-hoc-on-thi-vao-lop-10.pdf',
      'on vao 10/Bất đẳng thức chuyên giai đoạn 2009-2019.pdf',
      'on vao 10/cac-bai-toan-thuc-te-ket-hop-bat-dang-thuc-trong-cac-de-thi-mon-toan-thcs.pdf',
      'on vao 10/chuyen-de-cac-bai-toan-thuc-te-co-lien-quan-den-cuc-tri-on-thi-vao-lop-10.pdf',
      'on vao 10/tuyen-tap-300-bai-toan-bat-dang-thuc-chon-loc-co-loi-giai-chi-tiet (1).pdf',
      'on vao 10/SU DUNG BDT COSI TRONG HINH HOC 9.pdf',
      'on vao 10/CHá»¦ Äá»€ 7. Má»˜T Sá» PHÆ¯Æ NG PHÃP GIáº¢I PHÆ¯Æ NG TRÃŒNH NGHIá»†M NGUYÃŠN.pdf',
      'on vao 10/CHá»¦ Äá»€ 8. Má»˜T Sá» BÃ€I TOÃN Sá» NGUYÃŠN Tá», Sá» CHÃNH PHÆ¯Æ NG.pdf',
      'on vao 10/mot-so-phuong-phap-giai-bai-toan-phuong-trinh-nghiem-nguyen.pdf',
      'on vao 10/phuong-trinh-nghiem-nguyen-chon-loc.pdf',
      'on vao 10/phuong-phap-dirichle-va-ung-dung-nguyen-huu-dien.pdf',
      'TÃ¡ch Ä‘á» chuyÃªn 2023-2024.pdf',
    ],
    legacyMiuMathCategories: ['casio-hacks'],
    legacyMiuMathSubCategories: ['casio-algebra'],
    recommendedEntryTopicIds: ['math9.advanced.inequality_extrema', 'math9.advanced.number_theory'],
    advancedExtensionTopicIds: ['math9.geometry.proof_synthesis', 'math9.assessment.exam10_synthesis'],
  },
  {
    id: 'exam10.mixed_mock',
    title: 'Tong on va de tong hop vao 10',
    shortTitle: 'Tong on - de',
    description: 'Bo de tong hop, chuyen de tong on, cau truc de, de chuyen va loi chon bai theo muc tieu diem.',
    stage: 'mock_exam',
    scoreBand: '8_9',
    sourceRole: 'bridge',
    topicIds: [
      'math9.assessment.exam10_synthesis',
      'math9.algebra.radicals_transform',
      'math9.algebra.quadratic_equations',
      'math9.geometry.cyclic_tangent_secant',
      'math9.geometry.proof_synthesis',
      'math9.statistics_probability.probability',
    ],
    learningObjectives: [
      'Phan loai de theo cau an diem, cau van dung va cau phan hoa.',
      'Lap chien luoc thoi gian theo muc tieu diem.',
      'Dung ket qua lam de de quay nguoc ve cum chuyen de can bo sung.',
    ],
    sourceFileNames: [
      'on vao 10/13-chuyen-de-on-thi-tuyen-sinh-vao-lop-10-mon-toan.pdf',
      'on vao 10/8-chu-de-luyen-thi-tuyen-sinh-vao-lop-10-mon-toan.pdf',
      'on vao 10/trong-tam-kien-thuc-va-cac-dang-de-on-thi-vao-lop-10-mon-toan.pdf',
      'on vao 10/Tong on de toan luyen thi vao lop 10.pdf',
      'on vao 10/7-chuyen-de-luyen-thi-vao-lop-10-mon-toan-diep-tuan.pdf',
      'on vao 10/Cac chuyen de luyen thi vao lop 10.pdf',
      'on vao 10/chuyen de on thi vao 10.pdf',
      'on vao 10/luyen thi vao lop 10 mon toan theo chu de.pdf',
      'thuvienhoclieu.com-Bo-10-de-kiem-tra-HK2-Toan-9-nam-25-26.docx',
      'thuvienhoclieu.com-De-thi-tuyen-sinh-10-Toan-Chuyen-KHTN-Ha-Noi-nam-26-27.docx',
      'thuvienhoclieu.com-De-thi-tuyen-sinh-10-Toan-Chuyen-KHXHNV-Ha-Noi-nam-26-27.docx',
    ],
    legacyMiuMathCategories: [
      'algebra-simplification',
      'equations-systems',
      'functions-graphs',
      'viet-applications',
      'plane-geometry',
      'trigonometry-practice',
      'word-problems',
      'spatial-geometry',
      'statistics',
      'probability',
      'casio-hacks',
    ],
    recommendedEntryTopicIds: ['math9.assessment.exam10_synthesis'],
    advancedExtensionTopicIds: ['math9.advanced.inequality_extrema', 'math9.advanced.number_theory', 'math9.geometry.proof_synthesis'],
  },
];

export const MATH9_EXAM10_REVIEW_MATRIX = EXAM10_REVIEW_MATRIX;

export function getExam10ReviewClusterById(clusterId: string): Math9Exam10ReviewClusterPlan | undefined {
  return EXAM10_REVIEW_MATRIX.find((cluster) => cluster.id === clusterId);
}

export function getExam10ReviewClustersForTopic(topicId: string): Math9Exam10ReviewClusterPlan[] {
  return EXAM10_REVIEW_MATRIX.filter((cluster) => cluster.topicIds.includes(topicId));
}

export function getExam10ReviewClusterForSource(sourceFile: string): Math9Exam10ReviewClusterPlan | undefined {
  const directCluster = EXAM10_REVIEW_MATRIX.find((cluster) =>
    cluster.sourceFileNames.some((candidate) => exam10SourceMatches(candidate, sourceFile)),
  );
  if (directCluster) return directCluster;

  const topic = MATH9_LEARNING_MATRIX.find((candidate) =>
    candidate.sourceFiles.some((file) => exam10SourceMatches(file.fileName, sourceFile)),
  );
  return topic ? getExam10ReviewClustersForTopic(topic.id)[0] : undefined;
}

export function getExam10ReviewClusterForMiuMathCategory(category = '', subCategory = ''): Math9Exam10ReviewClusterPlan | undefined {
  const exactSubcategory = EXAM10_REVIEW_MATRIX.find((cluster) => cluster.legacyMiuMathSubCategories?.includes(subCategory));
  if (exactSubcategory) return exactSubcategory;
  return EXAM10_REVIEW_MATRIX.find((cluster) => cluster.legacyMiuMathCategories.includes(category));
}

export const MATH9_CHECKPOINTS: Math9Checkpoint[] = [
  {
    id: 'math9.checkpoint.midterm_1',
    title: 'Kiem tra giua ky 1 lop 9',
    semester: 1,
    week: 9,
    topicIds: ['math9.algebra.radicals_domain', 'math9.algebra.radicals_transform', 'math9.geometry.right_triangle_trig'],
    sourceFiles: [],
  },
  {
    id: 'math9.checkpoint.final_1',
    title: 'Kiem tra cuoi ky 1 lop 9',
    semester: 1,
    week: 17,
    topicIds: ['math9.algebra.radicals_transform', 'math9.algebra.systems', 'math9.algebra.word_problem_systems', 'math9.geometry.right_triangle_trig'],
    sourceFiles: [],
  },
  {
    id: 'math9.checkpoint.final_2',
    title: 'Kiem tra cuoi ky 2 lop 9',
    semester: 2,
    week: 34,
    topicIds: ['math9.algebra.functions_linear_quadratic', 'math9.algebra.quadratic_equations', 'math9.geometry.circle_angles', 'math9.geometry.cyclic_tangent_secant', 'math9.statistics_probability.statistics', 'math9.statistics_probability.probability'],
    sourceFiles: [],
  },
  {
    id: 'math9.checkpoint.exam10_readiness',
    title: 'Chan doan san sang thi vao 10',
    semester: 'full_year',
    week: 36,
    topicIds: ['math9.assessment.exam10_synthesis', 'math9.algebra.quadratic_equations', 'math9.geometry.proof_synthesis'],
    sourceFiles: [],
  },
];

export const MATH9_ACCESS_INDEX = buildMath9AccessIndex(MATH9_LEARNING_MATRIX);

export function getMath9TopicById(topicId: string): Math9TopicPlan | undefined {
  return MATH9_LEARNING_MATRIX.find((topic) => topic.id === topicId);
}

export function getMath9TopicsByAxis(axis: Math9AccessAxis, value: string | number): Math9TopicPlan[] {
  const key = String(value);
  return (MATH9_ACCESS_INDEX[axis][key] || []).map((topicId) => getMath9TopicById(topicId)).filter(Boolean) as Math9TopicPlan[];
}

export function getMath9PatternsByLevel(level: MathLearningLevel): Array<Math9Pattern & { topicId: string }> {
  return MATH9_LEARNING_MATRIX.flatMap((topic) =>
    topic.patterns
      .filter((topicPattern) => topicPattern.level === level)
      .map((topicPattern) => ({ ...topicPattern, topicId: topic.id })),
  );
}

export function buildMath9CoverageMatrix(topics = MATH9_LEARNING_MATRIX): Math9CoverageRow[] {
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
): Math9Pattern {
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

function buildMath9AccessIndex(topics: Math9TopicPlan[]): Record<Math9AccessAxis, Record<string, string[]>> {
  const index: Record<Math9AccessAxis, Record<string, string[]>> = {
    grade: {},
    semester: {},
    strand: {},
    unit: {},
    topic: {},
    level: {},
    examTarget: {},
  };

  topics.forEach((topic) => {
    addIndex(index.grade, 9, topic.id);
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

function exam10SourceMatches(candidate: string, sourceFile: string): boolean {
  const normalizedCandidate = normalizeExam10SourceKey(candidate);
  const normalizedSource = normalizeExam10SourceKey(sourceFile);
  if (normalizedCandidate === normalizedSource) return true;
  const candidateBase = normalizedCandidate.split('/').pop() || normalizedCandidate;
  const sourceBase = normalizedSource.split('/').pop() || normalizedSource;
  return candidateBase === sourceBase || normalizedSource.endsWith(`/${candidateBase}`) || normalizedCandidate.endsWith(`/${sourceBase}`);
}

function normalizeExam10SourceKey(value: string): string {
  return value
    .replace(/\\/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function inferSourceFormat(fileName: string): Math9SourceFile['format'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.dot')) return 'dot';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.zip')) return 'zip';
  if (lower.endsWith('.rar')) return 'rar';
  return 'doc';
}
