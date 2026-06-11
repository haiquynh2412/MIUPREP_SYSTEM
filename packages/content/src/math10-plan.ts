import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math10Strand = 'algebra' | 'geometry' | 'statistics_probability' | 'advanced' | 'assessment';
export type Math10Semester = 1 | 2 | 'full_year';
export type Math10SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';

export interface Math10SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf' | 'xlsx';
  kind: Math10SourceKind;
}

export interface Math10Pattern {
  id: string;
  title: string;
  level: MathLearningLevel;
  cognitiveLevel: CognitiveLevel;
  conceptIds: string[];
  skillIds: string[];
  tags: string[];
}

export interface Math10TopicPlan {
  id: string;
  grade: 10;
  semester: Math10Semester;
  order: number;
  unit: string;
  strand: Math10Strand;
  title: string;
  shortTitle: string;
  description: string;
  programIds: ContentProgramId[];
  conceptIds: string[];
  skillIds: string[];
  prerequisiteTopicIds: string[];
  bridgeToTopicIds: string[];
  levels: MathLearningLevel[];
  patterns: Math10Pattern[];
  sourceFiles: Math10SourceFile[];
}

export const MATH10_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/toan 10';
export const MATH10_PROGRAM_IDS: ContentProgramId[] = ['vn_math_10_12'];

function source(fileName: string, kind: Math10SourceKind, format?: Math10SourceFile['format']): Math10SourceFile {
  const extension = format || inferSourceFormat(fileName);
  return {
    fileName,
    path: `${MATH10_SOURCE_ROOT}/${fileName}`,
    format: extension,
    kind,
  };
}

function pattern(
  id: string,
  title: string,
  level: MathLearningLevel,
  conceptIds: string[],
  skillIds: string[],
  tags: string[],
  cognitiveLevel: CognitiveLevel = level === 'foundation' ? 'understand' : level === 'core' ? 'apply' : 'analyze',
): Math10Pattern {
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

export const MATH10_LEARNING_MATRIX: Math10TopicPlan[] = [
  {
    id: 'math10.algebra.logic_sets',
    grade: 10,
    semester: 1,
    order: 10,
    unit: 'Chương 1',
    strand: 'algebra',
    title: 'Mệnh đề và tập hợp',
    shortTitle: 'Mệnh đề & Tập hợp',
    description: 'Mệnh đề toán học, phủ định mệnh đề, mệnh đề chứa biến, tập hợp và các phép toán giao, hợp, hiệu trên các khoảng đoạn số thực, sai số và số gần đúng.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.logic_sets'],
    skillIds: [
      'math10.logic.identify',
      'math10.logic.implication',
      'math10.set.operation',
      'math10.set.word_problems',
      'math10.error.approximation',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math10.algebra.inequalities_one_variable'],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math10.logic.identify.p1', 'Nhận biết mệnh đề và phủ định mệnh đề', 'foundation', ['math.logic_sets'], ['math10.logic.identify'], ['logic', 'identify']),
      pattern('math10.logic.implication.p2', 'Xét tính đúng sai mệnh đề kéo theo và tương đương', 'core', ['math.logic_sets'], ['math10.logic.implication'], ['logic', 'implication']),
      pattern('math10.set.operation.p3', 'Thực hiện phép toán hợp, giao, hiệu trên tập số thực', 'core', ['math.logic_sets'], ['math10.set.operation'], ['set', 'operation']),
      pattern('math10.set.word_problems.p4', 'Giải toán thực tế ứng dụng tập hợp và sơ đồ Venn', 'application', ['math.logic_sets'], ['math10.set.word_problems'], ['set', 'word_problems']),
      pattern('math10.error.approximation.p5', 'Tính sai số tuyệt đối, tương đối và quy tròn số gần đúng', 'core', ['math.logic_sets'], ['math10.error.approximation'], ['error', 'approximation']),
    ],
    sourceFiles: [
      source('D10_C1_B1_Menh De.pdf', 'lesson'),
      source('D10_C1_B2_TAP HOP.pdf', 'lesson'),
      source('D10_C1_B4_cac tap hop so.pdf', 'lesson'),
      source('DS_C1_So gan dung va Sai so.pdf', 'practice'),
      source('D10_C1_B5_So gan dung, sai so.pdf', 'lesson'),
      source('menh de va tap hop/bai-giang-menh-de-va-tap-hop-mon-toan-10-ngo-quang-nghiep.pdf', 'lesson'),
      source('menh de va tap hop/bai-giang-toan-10-chu-de-menh-de-va-tap-hop-le-quang-xe.pdf', 'lesson'),
      source('menh de va tap hop/bai-tap-toan-ung-dung-thuc-te-chuyen-de-tap-hop-va-cac-phep-toan-tap-hop.pdf', 'practice'),
      source('menh de va tap hop/bo-de-on-tap-mon-toan-10-chu-de-menh-de-va-tap-hop.pdf', 'review'),
      source('menh de va tap hop/chuyen-de-menh-de-va-tap-hop-toan-10-ket-noi-tri-thuc-voi-cuoc-song.pdf', 'hsg'),
      source('menh de va tap hop/chuyen-de-toan-thuc-te-cac-phep-toan-tren-tap-hop-mon-toan-10.pdf', 'practice'),
      source('menh de va tap hop/de-kiem-tra-theo-bai-hoc-chu-de-menh-de-va-tap-hop.pdf', 'exam'),
      source('menh de va tap hop/phuong-phap-giai-toan-va-bai-tap-chuyen-de-menh-de-va-tap-hop-toan-10.pdf', 'practice'),
      source('menh de va tap hop/tai-lieu-hoc-tap-toan-10-chu-de-menh-de-va-tap-hop-le-quang-xe.pdf', 'lesson'),
    ],
  },
  {
    id: 'math10.algebra.inequalities_one_variable',
    grade: 10,
    semester: 1,
    order: 20,
    unit: 'Chương 2',
    strand: 'algebra',
    title: 'Bất đẳng thức, nhị thức và bất phương trình một ẩn',
    shortTitle: 'BĐT & BPT một ẩn',
    description: 'Bất đẳng thức cơ bản, biến đổi tương đương, dấu của nhị thức bậc nhất, giải bất phương trình và hệ bất phương trình bậc nhất một ẩn.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.inequality'],
    skillIds: [
      'math10.ineq1.transform',
      'math10.ineq1.linear_sign',
      'math10.ineq1.solve_system',
      'math10.ineq1.parameter',
    ],
    prerequisiteTopicIds: ['math10.algebra.logic_sets'],
    bridgeToTopicIds: ['math10.algebra.linear_inequalities_two_variables', 'math10.algebra.quadratic_functions_graphs'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math10.ineq1.transform.p1', 'Biến đổi bất đẳng thức và xác định điều kiện tương đương', 'foundation', ['math.inequality'], ['math10.ineq1.transform'], ['inequality', 'transform']),
      pattern('math10.ineq1.linear_sign.p2', 'Xét dấu nhị thức bậc nhất và lập bảng xét dấu', 'core', ['math.inequality'], ['math10.ineq1.linear_sign'], ['inequality', 'linear_sign']),
      pattern('math10.ineq1.solve_system.p3', 'Giải bất phương trình và hệ bất phương trình bậc nhất một ẩn', 'core', ['math.inequality'], ['math10.ineq1.solve_system'], ['inequality', 'solve_system']),
      pattern('math10.ineq1.parameter.p4', 'Bài toán tham số và điều kiện nghiệm của bất phương trình', 'advanced', ['math.inequality'], ['math10.ineq1.parameter'], ['inequality', 'parameter']),
    ],
    sourceFiles: [
      source('D10_C4_B2_he phuong trinh, bat phuong trinh.pdf', 'lesson'),
      source('D10_C4_B3_Dau cua nhi thuc bac nhat.pdf', 'lesson'),
      source('DS_C4_Bat dang thuc.pdf', 'practice'),
      source('DS_C4_Bat phuong trinh - He bat phuong trinh bac nhat mot an.pdf', 'practice'),
      source('DS_C4_Dau cua nhi thuc bac nhat.pdf', 'practice'),
      source('phan-loai-va-phuong-phap-giai-bai-tap-bat-dang-thuc-bat-phuong-trinh.pdf', 'practice'),
    ],
  },
  {
    id: 'math10.algebra.linear_inequalities_two_variables',
    grade: 10,
    semester: 1,
    order: 25,
    unit: 'Chương 2',
    strand: 'algebra',
    title: 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
    shortTitle: 'Bất phương trình 2 ẩn',
    description: 'Biểu diễn miền nghiệm của bất phương trình và hệ bất phương trình bậc nhất hai ẩn trên hệ tọa độ Oxy, bài toán tối ưu tuyến tính thực tiễn.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.linear_inequality_two_variables'],
    skillIds: [
      'math10.ineq2.single',
      'math10.ineq2.system',
      'math10.ineq2.optimization',
    ],
    prerequisiteTopicIds: ['math10.algebra.inequalities_one_variable'],
    bridgeToTopicIds: ['math10.algebra.quadratic_functions_graphs'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math10.ineq2.single.p1', 'Biểu diễn miền nghiệm của bất phương trình bậc nhất hai ẩn', 'foundation', ['math.linear_inequality_two_variables'], ['math10.ineq2.single'], ['inequality', 'single']),
      pattern('math10.ineq2.system.p2', 'Xác định miền nghiệm đa giác của hệ bất phương trình', 'core', ['math.linear_inequality_two_variables'], ['math10.ineq2.system'], ['inequality', 'system']),
      pattern('math10.ineq2.optimization.p3', 'Bài toán cực trị tối ưu tuyến tính thực tế', 'application', ['math.linear_inequality_two_variables'], ['math10.ineq2.optimization'], ['inequality', 'optimization']),
    ],
    sourceFiles: [
      source('D10_C4_B4_BAT PHUONG TRINH BAC NHAT HAI AN.pdf', 'lesson'),
      source('de-kiem-tra-theo-bai-hoc-chu-de-bpt-va-he-bpt-bac-nhat-hai-an.pdf', 'exam'),
      source('chuyen-de-bpt-va-he-bpt-bac-nhat-hai-an-toan-10-dinh-huong-cau-truc-moi.pdf', 'practice'),
      source('toan-thuc-te-he-bat-phuong-trinh-bac-nhat-hai-an-dang-viet-dong.pdf', 'practice'),
    ],
  },
  {
    id: 'math10.algebra.quadratic_functions_graphs',
    grade: 10,
    semester: 1,
    order: 30,
    unit: 'Chương 3',
    strand: 'algebra',
    title: 'Hàm số bậc hai và đồ thị',
    shortTitle: 'Hàm số & Parabol',
    description: 'Tập xác định, tập giá trị, biến thiên hàm số, khảo sát vẽ đồ thị hàm số bậc hai (parabol), tam thức bậc hai, giải bất phương trình bậc hai và phương trình chứa căn thức.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.functions_graphs', 'math.advanced_function', 'math.quadratic_equation'],
    skillIds: [
      'math10.func.general',
      'math10.func.quadratic_graph',
      'math10.func.quadratic_app',
      'math10.ineq.quadratic',
      'math10.eq.irrational',
    ],
    prerequisiteTopicIds: ['math10.algebra.logic_sets'],
    bridgeToTopicIds: ['math10.algebra.combinatorics'],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math10.func.general.p1', 'Tìm tập xác định và xét tính biến thiên của hàm số', 'foundation', ['math.functions_graphs'], ['math10.func.general'], ['function', 'general']),
      pattern('math10.func.quadratic_graph.p2', 'Xác định và vẽ parabol bậc hai', 'core', ['math.quadratic_equation'], ['math10.func.quadratic_graph'], ['quadratic', 'graph']),
      pattern('math10.func.quadratic_app.p3', 'Bài toán thực tế ứng dụng cực trị parabol', 'application', ['math.quadratic_equation'], ['math10.func.quadratic_app'], ['quadratic', 'application']),
      pattern('math10.ineq.quadratic.p4', 'Xét dấu tam thức bậc hai và giải bất phương trình bậc hai', 'core', ['math.quadratic_equation'], ['math10.ineq.quadratic'], ['inequality', 'quadratic']),
      pattern('math10.eq.irrational.p5', 'Giải phương trình vô tỉ chứa căn thức quy về bậc hai', 'advanced', ['math.quadratic_equation'], ['math10.eq.irrational'], ['equations', 'irrational']),
    ],
    sourceFiles: [
      source('D10_C2_B1_Ham So.pdf', 'lesson'),
      source('DS_C2_Ham so bac hai.pdf', 'practice'),
      source('DS_C2_Ham so bac nhat.pdf', 'practice'),
      source('DS_C2_Mot so van de ve Ham so.pdf', 'lesson'),
      source('DS_C3_Dai cuong ve phuong trinh.pdf', 'lesson'),
      source('DS_C3_He phuong trinh.pdf', 'practice'),
      source('DS_C3_Phuong trinh bac nhat va bac hai mot an.pdf', 'practice'),
      source('DS_C4_Dau cua tam thuc bac hai - Bat phuong trinh bac hai.pdf', 'practice'),
      source('chuyen-de-he-phuong-trinh-bac-nhat-ba-an-le-quang-xe.pdf', 'hsg'),
      source('chuyen-de-ham-so-bac-hai-va-do-thi-toan-10.pdf', 'practice'),
      source('tong-hop-100-bai-toan-thuc-te-ve-ham-so-bac-hai.pdf', 'practice'),
    ],
  },
  {
    id: 'math10.geometry.trigonometry_triangles',
    grade: 10,
    semester: 1,
    order: 40,
    unit: 'Chương 4',
    strand: 'geometry',
    title: 'Hệ thức lượng trong tam giác',
    shortTitle: 'Lượng giác tam giác',
    description: 'Giá trị lượng giác góc từ 0 đến 180 độ, áp dụng định lý sin, định lý côsin và các công thức tính diện tích tam giác giải bài toán thực tế đo đạc.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.trigonometry'],
    skillIds: [
      'math10.trig.identity',
      'math10.trig.triangle_laws',
      'math10.trig.area_formulas',
      'math10.trig.practical',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math10.geometry.vectors'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math10.trig.identity.p1', 'Tính giá trị lượng giác và rút gọn biểu thức góc 0-180 độ', 'foundation', ['math.trigonometry'], ['math10.trig.identity'], ['trig', 'identity']),
      pattern('math10.trig.triangle_laws.p2', 'Áp dụng định lý sin và côsin tính cạnh góc tam giác', 'core', ['math.trigonometry'], ['math10.trig.triangle_laws'], ['trig', 'laws']),
      pattern('math10.trig.area_formulas.p3', 'Tính diện tích tam giác và bán kính nội ngoại tiếp', 'core', ['math.trigonometry'], ['math10.trig.area_formulas'], ['trig', 'area']),
      pattern('math10.trig.practical.p4', 'Giải bài toán đo đạc thực tế khoảng cách, chiều cao', 'application', ['math.trigonometry'], ['math10.trig.practical'], ['trig', 'practical']),
    ],
    sourceFiles: [
      source('D10_C6_B2_gia tri luong giac cua mot cung.pdf', 'lesson'),
      source('HH_C2_Gia tri luong giac cua mot goc bat ky.pdf', 'lesson'),
      source('DS_C6_Cong thuc luong giac.pdf', 'practice'),
      source('cac-dang-toan-he-thuc-luong-trong-tam-giac-toan-10-thuong-gap.pdf', 'practice'),
      source('chuyen-de-toan-10-chuong-he-thuc-luong-trong-tam-giac-va-ung-dung.pdf', 'practice'),
      source('chuyen-de-toan-thuc-te-he-thuc-luong-trong-tam-giac-mon-toan-10.pdf', 'practice'),
      source('de-kiem-tra-theo-bai-hoc-chu-de-he-thuc-luong-trong-tam-giac.pdf', 'exam'),
      source('BÀI TẬP HÌNH HỌC THỰC TẾ.pdf', 'practice'),
    ],
  },
  {
    id: 'math10.geometry.vectors',
    grade: 10,
    semester: 1,
    order: 50,
    unit: 'Chương 5',
    strand: 'geometry',
    title: 'Vectơ',
    shortTitle: 'Vectơ hình học',
    description: 'Vectơ cùng phương cùng hướng, phép toán cộng trừ vectơ, tích vectơ với một số, phân tích vectơ, tính chất trọng tâm, tích vô hướng của hai vectơ.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.vector_coordinate_geometry'],
    skillIds: [
      'math10.vector.definition',
      'math10.vector.addition',
      'math10.vector.scalar_mult',
      'math10.vector.dot_product',
    ],
    prerequisiteTopicIds: ['math10.geometry.trigonometry_triangles'],
    bridgeToTopicIds: ['math10.geometry.coordinate_plane_oxy'],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math10.vector.definition.p1', 'Xác định vectơ cùng phương, ngược hướng, bằng nhau', 'foundation', ['math.vector_coordinate_geometry'], ['math10.vector.definition'], ['vector', 'definition']),
      pattern('math10.vector.addition.p2', 'Phép cộng trừ vectơ và chứng minh đẳng thức vectơ', 'core', ['math.vector_coordinate_geometry'], ['math10.vector.addition'], ['vector', 'operations']),
      pattern('math10.vector.scalar_mult.p3', 'Phân tích vectơ qua hai vectơ và chứng minh thẳng hàng', 'core', ['math.vector_coordinate_geometry'], ['math10.vector.scalar_mult'], ['vector', 'scalar_mult']),
      pattern('math10.vector.dot_product.p4', 'Tính tích vô hướng góc hai vectơ và ứng dụng thực tế', 'core', ['math.vector_coordinate_geometry'], ['math10.vector.dot_product'], ['vector', 'dot_product']),
    ],
    sourceFiles: [
      source('HH_C1_Cac dinh nghia ve vecto.pdf', 'lesson'),
      source('HH_C1_Hieu hai vecto.pdf', 'lesson'),
      source('HH_C1_Tong cua hai vecto.pdf', 'lesson'),
      source('H10_C1_B2_tong va hieu cua hai vec to.pdf', 'lesson'),
      source('H10_C2_B3_tich voi huong vecto.pdf', 'lesson'),
      source('HH_C2_Tich vo huong cua hai vecto.pdf', 'practice'),
    ],
  },
  {
    id: 'math10.geometry.coordinate_plane_oxy',
    grade: 10,
    semester: 2,
    order: 60,
    unit: 'Chương 6',
    strand: 'geometry',
    title: 'Phương pháp tọa độ trong mặt phẳng',
    shortTitle: 'Tọa độ phẳng Oxy',
    description: 'Tọa độ vectơ và điểm, phương trình tham số và tổng quát của đường thẳng, góc và khoảng cách, phương trình đường tròn (tiếp tuyến), ba đường Conic (Elip, Hyperbol, Parabol).',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.vector_coordinate_geometry'],
    skillIds: [
      'math10.oxy.vector',
      'math10.oxy.line',
      'math10.oxy.distance',
      'math10.oxy.circle',
      'math10.oxy.conic',
    ],
    prerequisiteTopicIds: ['math10.geometry.vectors'],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math10.oxy.vector.p1', 'Xác định tọa độ vectơ, điểm, trung điểm và trọng tâm', 'foundation', ['math.vector_coordinate_geometry'], ['math10.oxy.vector'], ['oxy', 'vector']),
      pattern('math10.oxy.line.p2', 'Viết phương trình đường thẳng tham số, tổng quát, đoạn chắn', 'core', ['math.vector_coordinate_geometry'], ['math10.oxy.line'], ['oxy', 'line']),
      pattern('math10.oxy.distance.p3', 'Tính khoảng cách từ điểm đến đường và góc hai đường thẳng', 'core', ['math.vector_coordinate_geometry'], ['math10.oxy.distance'], ['oxy', 'distance']),
      pattern('math10.oxy.circle.p4', 'Viết phương trình đường tròn và phương trình tiếp tuyến', 'core', ['math.vector_coordinate_geometry'], ['math10.oxy.circle'], ['oxy', 'circle']),
      pattern('math10.oxy.conic.p5', 'Xác định yếu tố và viết phương trình Elip, Hyperbol, Parabol', 'advanced', ['math.vector_coordinate_geometry'], ['math10.oxy.conic'], ['oxy', 'conic']),
    ],
    sourceFiles: [
      source('H10_C1_B4_he truc toa do.pdf', 'lesson'),
      source('HH_C1_Truc toa do va he truc toa do.pdf', 'lesson'),
      source('H10_C3_B1_phuong phap toa do trong mat phang.pdf', 'lesson'),
      source('DẠNG-25 PHƯƠNG-TRÌNH-ĐƯỜNG-THẲNG.pdf', 'practice'),
      source('HH_C3_Duong tron.pdf', 'lesson'),
      source('HH_C3_Elip.pdf', 'lesson'),
      source('HH_C3_Parabol.pdf', 'lesson'),
      source('HH_C3_Phuong trinh duong thang.pdf', 'lesson'),
      source('HH_C3_Khoang cach.pdf', 'practice'),
      source('chuyen-de-phuong-phap-toa-do-trong-mat-phang-toan-10-chuong-trinh-moi.pdf', 'practice'),
      source('chuyen-de-phuong-phap-toa-do-trong-mat-phang-toan-10.pdf', 'practice'),
      source('chuyen-de-toan-thuc-te-phuong-phap-toa-do-trong-mat-phang-mon-toan-10.pdf', 'practice'),
    ],
  },
  {
    id: 'math10.algebra.combinatorics',
    grade: 10,
    semester: 2,
    order: 70,
    unit: 'Chương 7',
    strand: 'algebra',
    title: 'Đại số tổ hợp',
    shortTitle: 'Đại số tổ hợp',
    description: 'Quy tắc đếm (quy tắc cộng, quy tắc nhân), hoán vị, chỉnh hợp, tổ hợp, khai triển nhị thức Newton với số mũ nhỏ.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.combinatorics_probability'],
    skillIds: [
      'math10.comb.rules',
      'math10.comb.permutations',
      'math10.comb.newton',
    ],
    prerequisiteTopicIds: ['math10.algebra.logic_sets'],
    bridgeToTopicIds: ['math10.statistics_probability.prob_stats'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math10.comb.rules.p1', 'Áp dụng quy tắc cộng và quy tắc nhân giải toán đếm', 'foundation', ['math.combinatorics_probability'], ['math10.comb.rules'], ['combinatorics', 'rules']),
      pattern('math10.comb.permutations.p2', 'Tính hoán vị, chỉnh hợp, tổ hợp chọn nhóm đồ vật/người', 'core', ['math.combinatorics_probability'], ['math10.comb.permutations'], ['combinatorics', 'permutations']),
      pattern('math10.comb.newton.p3', 'Khai triển nhị thức Newton và tìm hệ số số hạng', 'core', ['math.combinatorics_probability'], ['math10.comb.newton'], ['combinatorics', 'newton']),
    ],
    sourceFiles: [
      source('D10_C5_THONG KE.pdf', 'lesson'), // Phần tổ hợp nằm chung tệp Thống Kê
      source('12-bai-toan-ki-thuat-trong-tam-nhat-lam-chu-bai-toan-to-hop-xac-suat.pdf', 'practice'),
    ],
  },
  {
    id: 'math10.statistics_probability.prob_stats',
    grade: 10,
    semester: 2,
    order: 80,
    unit: 'Chương 8',
    strand: 'statistics_probability',
    title: 'Thống kê và xác suất',
    shortTitle: 'Thống kê & Xác suất',
    description: 'Số đặc trưng xu thế trung tâm (trung bình, trung vị, tứ phân vị, mốt) và độ phân tán (khoảng biến thiên, phương sai, độ lệch chuẩn), không gian mẫu, xác suất cổ điển.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.statistics_advanced', 'math.probability'],
    skillIds: [
      'math10.stats.central',
      'math10.stats.dispersion',
      'math10.prob.classical',
    ],
    prerequisiteTopicIds: ['math10.algebra.combinatorics'],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math10.stats.central.p1', 'Tính các số đặc trưng xu thế trung tâm của số liệu', 'foundation', ['math.statistics_advanced'], ['math10.stats.central'], ['stats', 'central']),
      pattern('math10.stats.dispersion.p2', 'Tính phương sai, độ lệch chuẩn, khoảng tứ phân vị mẫu số liệu', 'core', ['math.statistics_advanced'], ['math10.stats.dispersion'], ['stats', 'dispersion']),
      pattern('math10.prob.classical.p3', 'Tính xác suất cổ điển của biến cố ngẫu nhiên', 'core', ['math.probability'], ['math10.prob.classical'], ['probability', 'classical']),
    ],
    sourceFiles: [
      source('D10_C5_THONG KE.pdf', 'lesson'),
    ],
  },
  {
    id: 'math10.assessment.integrated_review',
    grade: 10,
    semester: 'full_year',
    order: 90,
    unit: 'Ôn tập tổng hợp',
    strand: 'assessment',
    title: 'Ôn tập tổng hợp và chuyên đề mở rộng Toán 10',
    shortTitle: 'Ôn tập tổng hợp',
    description: 'Đề cương, SGK, bộ đề, bài đúng-sai, bài toán thực tế và tài liệu tổng hợp dùng để ôn theo học kỳ hoặc luyện xen kẽ nhiều chuyên đề.',
    programIds: MATH10_PROGRAM_IDS,
    conceptIds: ['math.integrated_review'],
    skillIds: [
      'math10.review.mixed_foundation',
      'math10.review.mixed_exam',
      'math10.review.real_world',
      'math10.review.extension',
    ],
    prerequisiteTopicIds: [
      'math10.algebra.logic_sets',
      'math10.algebra.inequalities_one_variable',
      'math10.algebra.quadratic_functions_graphs',
      'math10.geometry.vectors',
      'math10.geometry.coordinate_plane_oxy',
    ],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math10.review.mixed_foundation.p1', 'Ôn tập nền tảng nhiều chương', 'foundation', ['math.integrated_review'], ['math10.review.mixed_foundation'], ['review', 'foundation']),
      pattern('math10.review.mixed_exam.p2', 'Luyện đề học kỳ và đánh giá cuối chương', 'core', ['math.integrated_review'], ['math10.review.mixed_exam'], ['review', 'exam']),
      pattern('math10.review.real_world.p3', 'Bài toán thực tế liên chuyên đề', 'application', ['math.integrated_review'], ['math10.review.real_world'], ['review', 'real_world']),
      pattern('math10.review.extension.p4', 'Bài mở rộng và bồi dưỡng năng lực', 'advanced', ['math.integrated_review'], ['math10.review.extension'], ['review', 'extension']),
    ],
    sourceFiles: [
      source('bai giang trong tam mon toan lop 10.pdf', 'review'),
      source('bai-giang-co-ban-va-nang-cao-toan-10-tap-1-dai-so-10.pdf', 'review'),
      source('bai-tap-trac-nghiem-dang-dung-sai-mon-toan-10.pdf', 'practice'),
      source('BỘ-10-ĐỀ-ÔN-TRĂC-NGHIỆM-TỰ-LUẬN-K10.pdf', 'exam'),
      source('bo-de-danh-gia-chat-luong-cuoi-chuong-mon-toan-10-hoc-ky-2.pdf', 'review'),
      source('chuyen-de-mon-toan-10-hoc-ki-1-le-dien-phu.pdf', 'review'),
      source('chuyen-de-toan-thuc-te-mon-toan-lop-10.pdf', 'practice'),
      source('de-cuong-hoc-ki-1-toan-10-nam-2025-2026-truong-thpt-viet-duc-ha-noi.pdf', 'review'),
      source('de-cuong-cuoi-hoc-ki-2-toan-10-nam-2025-2026-truong-thpt-viet-duc-ha-noi.pdf', 'review'),
      source('he-thong-kien-thuc-va-phuong-phap-giai-toan-10-vo-cong-truong.pdf', 'review'),
      source('phan-dang-va-bai-tap-toan-10-knttvcs-tap-2-nguyen-thanh-nhan.pdf', 'practice'),
      source('tai-lieu-khai-phong-nang-luc-hoc-toan-10.pdf', 'hsg'),
      source('thuvienhoclieu.com-SGK-chuyen-de-Toan-10-tu-nam-2026.pdf', 'lesson'),
      source('thuvienhoclieu.com-SGK-Toan-10-tu-nam-2026-Tap-1.pdf', 'lesson'),
      source('thuvienhoclieu.com-SGK-Toan-10-tu-nam-2026-Tap-2.pdf', 'lesson'),
      source('[toanthaycu.com]_Chuyên đề Toán thực tế 10_Trần Đình Cư.pdf', 'practice'),
    ],
  },
];

export function getMath10TopicById(topicId: string): Math10TopicPlan | undefined {
  return MATH10_LEARNING_MATRIX.find((topic) => topic.id === topicId);
}

function inferSourceFormat(fileName: string): Math10SourceFile['format'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.dot')) return 'dot';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.xlsx')) return 'xlsx';
  return 'doc';
}
