import type { CognitiveLevel, ContentProgramId, MathLearningLevel } from './standard';

export type Math11Strand = 'algebra' | 'geometry' | 'calculus' | 'statistics_probability' | 'advanced' | 'assessment';
export type Math11Semester = 1 | 2 | 'full_year';
export type Math11SourceKind = 'lesson' | 'practice' | 'exam' | 'hsg' | 'diagnostic' | 'review';

export interface Math11SourceFile {
  fileName: string;
  path: string;
  format: 'doc' | 'docx' | 'dot' | 'pdf' | 'xlsx';
  kind: Math11SourceKind;
}

export interface Math11Pattern {
  id: string;
  title: string;
  level: MathLearningLevel;
  cognitiveLevel: CognitiveLevel;
  conceptIds: string[];
  skillIds: string[];
  tags: string[];
}

export interface Math11TopicPlan {
  id: string;
  grade: 11;
  semester: Math11Semester;
  order: number;
  unit: string;
  strand: Math11Strand;
  title: string;
  shortTitle: string;
  description: string;
  programIds: ContentProgramId[];
  conceptIds: string[];
  skillIds: string[];
  prerequisiteTopicIds: string[];
  bridgeToTopicIds: string[];
  levels: MathLearningLevel[];
  patterns: Math11Pattern[];
  sourceFiles: Math11SourceFile[];
}

export const MATH11_SOURCE_ROOT = 'C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/toan 11';
export const MATH11_PROGRAM_IDS: ContentProgramId[] = ['vn_math_10_12'];

function source(fileName: string, kind: Math11SourceKind, format?: Math11SourceFile['format']): Math11SourceFile {
  const extension = format || inferSourceFormat(fileName);
  return {
    fileName,
    path: `${MATH11_SOURCE_ROOT}/${fileName}`,
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
): Math11Pattern {
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

export const MATH11_LEARNING_MATRIX: Math11TopicPlan[] = [
  {
    id: 'math11.algebra.trigonometry',
    grade: 11,
    semester: 1,
    order: 10,
    unit: 'Chương 1',
    strand: 'algebra',
    title: 'Hàm số lượng giác và phương trình lượng giác',
    shortTitle: 'Lượng giác 11',
    description: 'Góc lượng giác, giá trị lượng giác của góc lượng giác, công thức lượng giác, hàm số lượng giác và đồ thị, phương trình lượng giác cơ bản.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.trigonometry'],
    skillIds: [
      'math11.trig.values',
      'math11.trig.formulas',
      'math11.trig.functions',
      'math11.trig.equations',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math11.calculus.limits_continuity'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math11.trig.values.p1', 'Tính giá trị lượng giác của một góc và mối quan hệ giữa các giá trị', 'foundation', ['math.trigonometry'], ['math11.trig.values'], ['trig', 'values']),
      pattern('math11.trig.formulas.p2', 'Áp dụng công thức cộng, công thức nhân đôi, biến đổi tích thành tổng', 'core', ['math.trigonometry'], ['math11.trig.formulas'], ['trig', 'formulas']),
      pattern('math11.trig.functions.p3', 'Khảo sát tập xác định, tính tuần hoàn, chẵn lẻ và vẽ đồ thị hàm số lượng giác', 'core', ['math.trigonometry'], ['math11.trig.functions'], ['trig', 'functions']),
      pattern('math11.trig.equations.p4', 'Giải phương trình lượng giác cơ bản và phương trình đưa về dạng cơ bản', 'core', ['math.trigonometry'], ['math11.trig.equations'], ['trig', 'equations']),
    ],
    sourceFiles: [],
  },
  {
    id: 'math11.algebra.sequences_progressions',
    grade: 11,
    semester: 1,
    order: 20,
    unit: 'Chương 2',
    strand: 'algebra',
    title: 'Dãy số, cấp số cộng và cấp số nhân',
    shortTitle: 'Dãy số & Cấp số',
    description: 'Dãy số tăng, giảm, bị chặn, định nghĩa cấp số cộng và cấp số nhân, số hạng tổng quát, tổng n số hạng đầu tiên.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.sequences_series'],
    skillIds: [
      'math11.seq.properties',
      'math11.seq.arithmetic',
      'math11.seq.geometric',
      'math11.seq.word_problems',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math11.calculus.limits_continuity'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math11.seq.properties.p1', 'Xác định số hạng của dãy số và xét tính tăng, giảm, bị chặn', 'foundation', ['math.sequences_series'], ['math11.seq.properties'], ['seq', 'properties']),
      pattern('math11.seq.arithmetic.p2', 'Tìm công sai, số hạng tổng quát và tổng n số hạng đầu của cấp số cộng', 'core', ['math.sequences_series'], ['math11.seq.arithmetic'], ['seq', 'arithmetic']),
      pattern('math11.seq.geometric.p3', 'Tìm công bội, số hạng tổng quát và tổng n số hạng đầu của cấp số nhân', 'core', ['math.sequences_series'], ['math11.seq.geometric'], ['seq', 'geometric']),
      pattern('math11.seq.word_problems.p4', 'Giải bài toán thực tế liên quan đến cấp số cộng và cấp số nhân', 'application', ['math.sequences_series'], ['math11.seq.word_problems'], ['seq', 'word_problems']),
    ],
    sourceFiles: [],
  },
  {
    id: 'math11.calculus.limits_continuity',
    grade: 11,
    semester: 1,
    order: 30,
    unit: 'Chương 3',
    strand: 'calculus',
    title: 'Giới hạn và hàm số liên tục',
    shortTitle: 'Giới hạn & Liên tục',
    description: 'Giới hạn của dãy số, giới hạn của hàm số tại một điểm và tại vô cực, giới hạn một bên, các phép toán giới hạn, định nghĩa và tính chất của hàm số liên tục.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.calculus_limits'],
    skillIds: [
      'math11.lim.sequence',
      'math11.lim.function',
      'math11.lim.continuity',
    ],
    prerequisiteTopicIds: ['math11.algebra.trigonometry', 'math11.algebra.sequences_progressions'],
    bridgeToTopicIds: ['math11.calculus.derivatives'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math11.lim.sequence.p1', 'Tính giới hạn của dãy số dạng hữu tỷ, chứa căn hoặc lũy thừa', 'foundation', ['math.calculus_limits'], ['math11.lim.sequence'], ['limit', 'sequence']),
      pattern('math11.lim.function.p2', 'Tính giới hạn hàm số dạng vô định 0/0, vô cùng trừ vô cùng, khử dạng vô định', 'core', ['math.calculus_limits'], ['math11.lim.function'], ['limit', 'function']),
      pattern('math11.lim.continuity.p3', 'Xét tính liên tục của hàm số tại một điểm, trên một khoảng và tìm tham số m', 'core', ['math.calculus_limits'], ['math11.lim.continuity'], ['limit', 'continuity']),
    ],
    sourceFiles: [],
  },
  {
    id: 'math11.geometry.parallelism',
    grade: 11,
    semester: 1,
    order: 40,
    unit: 'Chương 4',
    strand: 'geometry',
    title: 'Đường thẳng và mặt phẳng trong không gian. Quan hệ song song',
    shortTitle: 'Quan hệ song song',
    description: 'Điểm, đường thẳng, mặt phẳng trong không gian, hai đường thẳng song song, đường thẳng song song với mặt phẳng, hai mặt phẳng song song, phép chiếu song song.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.space_geometry'],
    skillIds: [
      'math11.parallel.intersection',
      'math11.parallel.line_line',
      'math11.parallel.line_plane',
      'math11.parallel.plane_plane',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math11.geometry.perpendicularity'],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math11.parallel.intersection.p1', 'Xác định giao tuyến của hai mặt phẳng và giao điểm của đường thẳng với mặt phẳng', 'foundation', ['math.space_geometry'], ['math11.parallel.intersection'], ['geometry', 'intersection']),
      pattern('math11.parallel.line_line.p2', 'Chứng minh hai đường thẳng song song hoặc chéo nhau', 'core', ['math.space_geometry'], ['math11.parallel.line_line'], ['geometry', 'line_line']),
      pattern('math11.parallel.line_plane.p3', 'Chứng minh đường thẳng song song với mặt phẳng và tìm thiết diện', 'core', ['math.space_geometry'], ['math11.parallel.line_plane'], ['geometry', 'line_plane']),
      pattern('math11.parallel.plane_plane.p4', 'Chứng minh hai mặt phẳng song song và áp dụng tính chất thiết diện song song', 'core', ['math.space_geometry'], ['math11.parallel.plane_plane'], ['geometry', 'plane_plane']),
    ],
    sourceFiles: [],
  },
  {
    id: 'math11.statistics.grouped_data',
    grade: 11,
    semester: 1,
    order: 50,
    unit: 'Chương 5',
    strand: 'statistics_probability',
    title: 'Số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm',
    shortTitle: 'Số liệu ghép nhóm',
    description: 'Mẫu số liệu ghép nhóm, công thức tính số trung bình, trung vị, tứ phân vị, mốt của mẫu số liệu ghép nhóm.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.statistics_advanced'],
    skillIds: [
      'math11.stats.mean_grouped',
      'math11.stats.median_grouped',
      'math11.stats.mode_grouped',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math11.stats.mean_grouped.p1', 'Xác định giá trị đại diện và tính số trung bình của số liệu ghép nhóm', 'foundation', ['math.statistics_advanced'], ['math11.stats.mean_grouped'], ['stats', 'mean']),
      pattern('math11.stats.median_grouped.p2', 'Tính trung vị và các tứ phân vị của mẫu số liệu ghép nhóm', 'core', ['math.statistics_advanced'], ['math11.stats.median_grouped'], ['stats', 'median']),
      pattern('math11.stats.mode_grouped.p3', 'Tìm mốt của mẫu số liệu ghép nhóm và giải thích ý nghĩa', 'core', ['math.statistics_advanced'], ['math11.stats.mode_grouped'], ['stats', 'mode']),
    ],
    sourceFiles: [],
  },
  {
    id: 'math11.algebra.exponential_logarithm',
    grade: 11,
    semester: 2,
    order: 60,
    unit: 'Chương 6',
    strand: 'algebra',
    title: 'Hàm số mũ và hàm số lôgarit',
    shortTitle: 'Mũ & Lôgarit',
    description: 'Phép tính lũy thừa với số mũ hữu tỷ và thực, logarit và các tính chất biến đổi, hàm số mũ, hàm số logarit, phương trình và bất phương trình mũ, logarit.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.exponential_logarithmic'],
    skillIds: [
      'math11.explog.properties',
      'math11.explog.functions',
      'math11.explog.equations',
      'math11.explog.inequalities',
      'math11.explog.word_problems',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: ['math11.calculus.derivatives'],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math11.explog.properties.p1', 'Rút gọn biểu thức lũy thừa và tính giá trị biểu thức logarit', 'foundation', ['math.exponential_logarithmic'], ['math11.explog.properties'], ['explog', 'properties']),
      pattern('math11.explog.functions.p2', 'Tìm tập xác định, khảo sát sự biến thiên của hàm số mũ, logarit', 'core', ['math.exponential_logarithmic'], ['math11.explog.functions'], ['explog', 'functions']),
      pattern('math11.explog.equations.p3', 'Giải phương trình mũ và phương trình logarit bằng cách đưa về cùng cơ số, đặt ẩn phụ', 'core', ['math.exponential_logarithmic'], ['math11.explog.equations'], ['explog', 'equations']),
      pattern('math11.explog.inequalities.p4', 'Giải bất phương trình mũ và bất phương trình logarit', 'core', ['math.exponential_logarithmic'], ['math11.explog.inequalities'], ['explog', 'inequalities']),
      pattern('math11.explog.word_problems.p5', 'Giải bài toán lãi kép, tăng trưởng dân số và các ứng dụng thực tế', 'application', ['math.exponential_logarithmic'], ['math11.explog.word_problems'], ['explog', 'word_problems']),
    ],
    sourceFiles: [],
  },
  {
    id: 'math11.geometry.perpendicularity',
    grade: 11,
    semester: 2,
    order: 70,
    unit: 'Chương 7',
    strand: 'geometry',
    title: 'Quan hệ vuông góc trong không gian. Phép chiếu vuông góc',
    shortTitle: 'Quan hệ vuông góc',
    description: 'Hai đường thẳng vuông góc, đường thẳng vuông góc với mặt phẳng, hai mặt phẳng vuông góc, góc giữa đường thẳng và mặt phẳng, góc nhị diện, khoảng cách trong không gian.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.space_geometry'],
    skillIds: [
      'math11.perpendicular.line_line',
      'math11.perpendicular.line_plane',
      'math11.perpendicular.plane_plane',
      'math11.perpendicular.angle',
      'math11.perpendicular.distance',
    ],
    prerequisiteTopicIds: ['math11.geometry.parallelism'],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math11.perpendicular.line_line.p1', 'Chứng minh hai đường thẳng vuông góc trong không gian', 'foundation', ['math.space_geometry'], ['math11.perpendicular.line_line'], ['geometry', 'perp_lines']),
      pattern('math11.perpendicular.line_plane.p2', 'Chứng minh đường thẳng vuông góc với mặt phẳng và định lý ba đường vuông góc', 'core', ['math.space_geometry'], ['math11.perpendicular.line_plane'], ['geometry', 'perp_line_plane']),
      pattern('math11.perpendicular.plane_plane.p3', 'Chứng minh hai mặt phẳng vuông góc', 'core', ['math.space_geometry'], ['math11.perpendicular.plane_plane'], ['geometry', 'perp_planes']),
      pattern('math11.perpendicular.angle.p4', 'Tính góc giữa đường thẳng và mặt phẳng, góc nhị diện (góc giữa hai mặt phẳng)', 'core', ['math.space_geometry'], ['math11.perpendicular.angle'], ['geometry', 'angle']),
      pattern('math11.perpendicular.distance.p5', 'Tính khoảng cách từ điểm đến mặt, khoảng cách giữa hai đường chéo nhau', 'advanced', ['math.space_geometry'], ['math11.perpendicular.distance'], ['geometry', 'distance']),
    ],
    sourceFiles: [
      source('chuyen-de-quan-he-vuong-goc-trong-khong-gian-toan-11-ctst.pdf', 'practice'),
    ],
  },
  {
    id: 'math11.probability.rules',
    grade: 11,
    semester: 2,
    order: 80,
    unit: 'Chương 8',
    strand: 'statistics_probability',
    title: 'Các quy tắc tính xác suất',
    shortTitle: 'Quy tắc xác suất',
    description: 'Biến cố hợp, biến cố giao, biến cố độc lập, quy tắc cộng xác suất, quy tắc nhân xác suất, xác suất có điều kiện.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.probability'],
    skillIds: [
      'math11.prob.rules_addition',
      'math11.prob.rules_multiplication',
      'math11.prob.conditional',
    ],
    prerequisiteTopicIds: [],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced'],
    patterns: [
      pattern('math11.prob.rules_addition.p1', 'Áp dụng quy tắc cộng xác suất cho hai biến cố xung khắc hoặc bất kỳ', 'foundation', ['math.probability'], ['math11.prob.rules_addition'], ['probability', 'addition']),
      pattern('math11.prob.rules_multiplication.p2', 'Áp dụng quy tắc nhân xác suất cho hai biến cố độc lập', 'core', ['math.probability'], ['math11.prob.rules_multiplication'], ['probability', 'multiplication']),
      pattern('math11.prob.conditional.p3', 'Tính xác suất có điều kiện và áp dụng sơ đồ cây hoặc công thức xác suất toàn phần', 'core', ['math.probability'], ['math11.prob.conditional'], ['probability', 'conditional']),
    ],
    sourceFiles: [
      source('luyen-ky-nang-toan-11-trac-nghiem-nhieu-lua-chon-quy-tac-tinh-xac-suat.pdf', 'practice'),
    ],
  },
  {
    id: 'math11.calculus.derivatives',
    grade: 11,
    semester: 2,
    order: 90,
    unit: 'Chương 9',
    strand: 'calculus',
    title: 'Đạo hàm',
    shortTitle: 'Đạo hàm 11',
    description: 'Định nghĩa đạo hàm tại một điểm và ý nghĩa hình học (tiếp tuyến), các quy tắc tính đạo hàm của hàm sơ cấp, đạo hàm của hàm hợp, đạo hàm cấp hai, ý nghĩa vật lý.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.calculus_derivatives'],
    skillIds: [
      'math11.deriv.definition',
      'math11.deriv.rules',
      'math11.deriv.tangent',
      'math11.deriv.second_order',
      'math11.deriv.physics_app',
    ],
    prerequisiteTopicIds: ['math11.calculus.limits_continuity', 'math11.algebra.exponential_logarithm'],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math11.deriv.definition.p1', 'Tính đạo hàm bằng định nghĩa tại một điểm', 'foundation', ['math.calculus_derivatives'], ['math11.deriv.definition'], ['derivative', 'definition']),
      pattern('math11.deriv.rules.p2', 'Áp dụng công thức tính đạo hàm của hàm số lượng giác, hàm mũ, lôgarit và hàm hợp', 'core', ['math.calculus_derivatives'], ['math11.deriv.rules'], ['derivative', 'rules']),
      pattern('math11.deriv.tangent.p3', 'Viết phương trình tiếp tuyến của đồ thị hàm số tại một điểm hoặc hệ số góc cho trước', 'core', ['math.calculus_derivatives'], ['math11.deriv.tangent'], ['derivative', 'tangent']),
      pattern('math11.deriv.second_order.p4', 'Tính đạo hàm cấp hai và giải phương trình chứa đạo hàm', 'core', ['math.calculus_derivatives'], ['math11.deriv.second_order'], ['derivative', 'second_order']),
      pattern('math11.deriv.physics_app.p5', 'Giải bài toán ý nghĩa vật lý (vận tốc tức thời, gia tốc) của đạo hàm', 'application', ['math.calculus_derivatives'], ['math11.deriv.physics_app'], ['derivative', 'physics']),
    ],
    sourceFiles: [
      source('bo-de-on-tap-chuyen-de-dao-ham-mon-toan-11-le-ba-bao.pdf', 'review'),
      source('chuyen-de-dao-ham-toan-11-knttvcs.pdf', 'practice'),
    ],
  },
  {
    id: 'math11.assessment.integrated_review',
    grade: 11,
    semester: 'full_year',
    order: 100,
    unit: 'Ôn tập tổng hợp',
    strand: 'assessment',
    title: 'Ôn tập tổng hợp và chuyên đề mở rộng Toán 11',
    shortTitle: 'Ôn tập tổng hợp',
    description: 'Đề cương, chuyên đề bồi dưỡng năng lực, toán thực tế và đề kiểm tra học kỳ Toán 11.',
    programIds: MATH11_PROGRAM_IDS,
    conceptIds: ['math.integrated_review'],
    skillIds: [
      'math11.review.mixed_foundation',
      'math11.review.mixed_exam',
      'math11.review.real_world',
      'math11.review.extension',
    ],
    prerequisiteTopicIds: [
      'math11.algebra.trigonometry',
      'math11.algebra.sequences_progressions',
      'math11.calculus.limits_continuity',
      'math11.geometry.parallelism',
      'math11.statistics.grouped_data',
      'math11.algebra.exponential_logarithm',
      'math11.geometry.perpendicularity',
      'math11.probability.rules',
      'math11.calculus.derivatives',
    ],
    bridgeToTopicIds: [],
    levels: ['foundation', 'core', 'application', 'advanced', 'hsg'],
    patterns: [
      pattern('math11.review.mixed_foundation.p1', 'Ôn tập tổng hợp kiến thức nền tảng nhiều chương', 'foundation', ['math.integrated_review'], ['math11.review.mixed_foundation'], ['review', 'foundation']),
      pattern('math11.review.mixed_exam.p2', 'Luyện đề thi học kỳ 1, học kỳ 2 và đề tổng hợp lớp 11', 'core', ['math.integrated_review'], ['math11.review.mixed_exam'], ['review', 'exam']),
      pattern('math11.review.real_world.p3', 'Giải bài toán thực tế liên môn và thực tiễn lớp 11', 'application', ['math.integrated_review'], ['math11.review.real_world'], ['review', 'real_world']),
      pattern('math11.review.extension.p4', 'Chuyên đề nâng cao, bồi dưỡng học sinh giỏi lớp 11', 'advanced', ['math.integrated_review'], ['math11.review.extension'], ['review', 'extension']),
    ],
    sourceFiles: [
      source('[toanthaycu.com]_Chuyên đề toán thực tế 11_Trần Đình Cư.pdf', 'practice'),
      source('ap-dung-bat-dang-thuc-bunhiacopxki-chung-minh-bat-dang-thuc-tim-gtln-gtnn.pdf', 'practice'),
      source('bai-giang-mon-toan-10-hoc-ki-2-nguyen-cong-hanh.pdf', 'lesson'),
      source('bai-tap-trac-nghiem-dang-dung-sai-mon-toan-10.pdf', 'practice'),
      source('bai-tap-van-dung-van-dung-cao-chuyen-de-phuong-trinh-duong-thang.pdf', 'practice'),
      source('bai-tap-van-dung-van-dung-cao-chuyen-de-phuong-trinh-duong-tron.pdf', 'practice'),
      source('bai-toan-bat-dang-thuc-gtln-gtnn-cua-bieu-thuc-nguyen-huu-hieu.pdf', 'practice'),
      source('bo-de-kiem-tra-theo-bai-hoc-mon-toan-11-hoc-ki-1-co-dap-an.pdf', 'review'),
      source('cac-bai-toan-min-max-van-dung-cao.pdf', 'practice'),
      source('chu-de-phuong-trinh-duong-tron-toan-10-knttvcs-le-ba-bao.pdf', 'lesson'),
      source('chuyen-de-phep-bien-hinh-nguyen-hoang-viet.pdf', 'practice'),
      source('chuyen-de-phuong-phap-toa-do-trong-mat-phang-toan-10-chuong-trinh-moi.pdf', 'practice'),
      source('phan-dang-va-bai-tap-toan-11-knttvcs-tap-2-nguyen-thanh-nhan.pdf', 'practice'),
      source('tai-lieu-chu-de-phep-quay.pdf', 'practice'),
      source('thuvienhoclieu.com-SGK-chuyen-de-Toan-11-tu-nam-2026.pdf', 'lesson'),
      source('tiep-can-cac-bat-dang-thuc-bang-hinh-hoc-truc-quan.pdf', 'practice'),
      source('tuyen-tap-300-bai-toan-bat-dang-thuc-chon-loc-co-loi-giai-chi-tiet.pdf', 'practice'),
      source('tuyen-tap-trac-nghiem-tra-loi-ngan-toan-thuc-te-lop-10-theo-tung-chu-de.pdf', 'practice'),
    ],
  },
];

export function getMath11TopicById(topicId: string): Math11TopicPlan | undefined {
  return MATH11_LEARNING_MATRIX.find((topic) => topic.id === topicId);
}

function inferSourceFormat(fileName: string): Math11SourceFile['format'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.dot')) return 'dot';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.xlsx')) return 'xlsx';
  return 'doc';
}
