// Seed/default content data for the portal admin surfaces.
// Extracted verbatim from App.tsx (roadmap 2.2.3 GĐ2b — slim App.tsx).
// Pure static data: no component state, no t() — admin can add/edit at runtime.
import type { CasioTip, ImportedExam, MathLesson } from './adminContent';

export const INITIAL_MATH_LESSONS: MathLesson[] = [
  // Algebra Components
  { id: 'math-alg-01', title: 'Căn bậc hai và Căn bậc ba nâng cao', topic: 'Đại số (Algebra)', count: 45, status: 'Active' },
  { id: 'math-alg-02', title: 'Rút gọn biểu thức chứa căn thức bậc hai', topic: 'Đại số (Algebra)', count: 55, status: 'Active' },
  { id: 'math-alg-03', title: 'Hàm số và đồ thị y = ax^2', topic: 'Đại số (Algebra)', count: 40, status: 'Active' },
  { id: 'math-alg-04', title: 'Hệ phương trình bậc nhất hai ẩn chứa tham số m', topic: 'Đại số (Algebra)', count: 35, status: 'Active' },
  { id: 'math-alg-05', title: 'Phương trình bậc hai & Định lý Vi-ét cực trị', topic: 'Đại số (Algebra)', count: 50, status: 'Active' },
  // Geometry Components
  { id: 'math-geo-01', title: 'Hệ thức lượng trong tam giác vuông', topic: 'Hình học (Geometry)', count: 30, status: 'Active' },
  { id: 'math-geo-02', title: 'Đường tròn và Cát tuyến nâng cao', topic: 'Hình học (Geometry)', count: 45, status: 'Active' },
  { id: 'math-geo-03', title: 'Tứ giác nội tiếp đường tròn & Chứng minh thẳng hàng', topic: 'Hình học (Geometry)', count: 55, status: 'Active' },
  { id: 'math-geo-04', title: 'Hình trụ - Hình nón - Hình cầu ứng dụng thực tế', topic: 'Hình học (Geometry)', count: 35, status: 'Active' },
  // Mock Tests
  { id: 'math-test-01', title: 'Đề Đánh giá Năng lực Giữa kỳ II - Toán 9', topic: 'Thi thử (Mock)', count: 40, status: 'Active' },
  { id: 'math-test-02', title: 'Đề Đánh giá Năng lực Học kỳ II - Toán 9', topic: 'Thi thử (Mock)', count: 40, status: 'Active' },
  { id: 'math-test-03', title: 'Đề khảo sát lớp 9 vào lớp 10 chuyên (Đề 1)', topic: 'Thi thử (Mock)', count: 40, status: 'Active' },
];

export const INITIAL_CASIO_TIPS: CasioTip[] = [
  { id: 'tip-1', title: 'Bấm máy tìm nhanh nghiệm phương trình bậc 2/3', syntax: '[MODE] [5] [3]', explanation: 'Giúp học sinh kiểm tra nhanh kết quả nghiệm rút gọn.' },
  { id: 'tip-2', title: 'Tìm cực trị parabol bằng phím đỉnh x/y', syntax: '[SHIFT] [SOLVE]', explanation: 'Giải nhanh giá trị lớn nhất/nhỏ nhất đại số lớp 9.' },
];

export const INITIAL_IMPORTED_EXAMS: ImportedExam[] = [
  // SAT Component Tests
  { id: 'sat-rw-01', title: 'SAT RW Diagnostic: Information & Ideas', exam: 'SAT', questions: 33, duration: 32, status: 'Active' },
  { id: 'sat-rw-02', title: 'SAT RW Section Test: Craft & Structure', exam: 'SAT', questions: 33, duration: 32, status: 'Active' },
  { id: 'sat-rw-03', title: 'SAT RW Practice: Expression of Ideas', exam: 'SAT', questions: 33, duration: 32, status: 'Active' },
  { id: 'sat-m-01', title: 'SAT Math Diagnostic: Algebra & Geometry', exam: 'SAT', questions: 22, duration: 35, status: 'Active' },
  { id: 'sat-m-02', title: 'SAT Math Section Test: Advanced Math', exam: 'SAT', questions: 22, duration: 35, status: 'Active' },
  { id: 'sat-full-01', title: 'SAT Full-Length Adaptive Practice Test 1', exam: 'SAT', questions: 88, duration: 134, status: 'Active' },
  { id: 'sat-full-02', title: 'SAT Full-Length Diagnostic Test', exam: 'SAT', questions: 88, duration: 134, status: 'Active' },

  // IELTS Component Tests
  { id: 'ielts-read-01', title: 'IELTS Reading: Passage 1 - Golden Ratio', exam: 'IELTS', questions: 13, duration: 20, status: 'Active' },
  { id: 'ielts-read-02', title: 'IELTS Reading: Passage 2 - Marine Ecosystems', exam: 'IELTS', questions: 13, duration: 20, status: 'Active' },
  { id: 'ielts-read-03', title: 'IELTS Reading: Passage 3 - AI in Medicine', exam: 'IELTS', questions: 14, duration: 20, status: 'Active' },
  { id: 'ielts-list-01', title: 'IELTS Listening: Section 1 - Hotel Reservation', exam: 'IELTS', questions: 10, duration: 10, status: 'Active' },
  { id: 'ielts-list-02', title: 'IELTS Listening: Section 3 - Campus Map Tour', exam: 'IELTS', questions: 10, duration: 10, status: 'Active' },
  { id: 'ielts-write-01', title: 'IELTS Writing: Task 2 Essay Grader', exam: 'IELTS', questions: 1, duration: 40, status: 'Active' },
  { id: 'ielts-speak-01', title: 'IELTS Speaking: Parts 1 & 2 Evaluator', exam: 'IELTS', questions: 3, duration: 15, status: 'Active' },
  { id: 'ielts-mock-01', title: 'IELTS Academic Full Practice Test 1', exam: 'IELTS', questions: 80, duration: 165, status: 'Active' },

  // CAE Component Tests
  { id: 'cae-uoe-01', title: 'CAE Use of English Part 1: Multiple-Choice Cloze', exam: 'CAE', questions: 8, duration: 10, status: 'Active' },
  { id: 'cae-uoe-02', title: 'CAE Use of English Part 2: Open Cloze', exam: 'CAE', questions: 8, duration: 10, status: 'Active' },
  { id: 'cae-uoe-03', title: 'CAE Use of English Part 3: Word Formation', exam: 'CAE', questions: 8, duration: 10, status: 'Active' },
  { id: 'cae-uoe-04', title: 'CAE Use of English Part 4: Key Word Transformation', exam: 'CAE', questions: 6, duration: 12, status: 'Active' },
  { id: 'cae-read-01', title: 'CAE Reading Part 5: Multiple Choice', exam: 'CAE', questions: 6, duration: 15, status: 'Active' },
  { id: 'cae-list-01', title: 'CAE Listening Part 1: Multiple Choice', exam: 'CAE', questions: 6, duration: 15, status: 'Active' },
  { id: 'cae-mock-01', title: 'CAE Cambridge C1 Diagnostic Mock Test 1', exam: 'CAE', questions: 38, duration: 50, status: 'Active' },
  { id: 'cae-mock-02', title: 'CAE Cambridge C1 Entry Level Test 2', exam: 'CAE', questions: 38, duration: 50, status: 'Active' },

  // CPE Component Tests
  { id: 'cpe-uoe-01', title: 'CPE Use of English Part 1: Multiple-Choice Cloze', exam: 'CPE', questions: 8, duration: 10, status: 'Active' },
  { id: 'cpe-uoe-02', title: 'CPE Use of English Part 2: Open Cloze', exam: 'CPE', questions: 8, duration: 10, status: 'Active' },
  { id: 'cpe-uoe-03', title: 'CPE Use of English Part 3: Word Formation', exam: 'CPE', questions: 8, duration: 10, status: 'Active' },
  { id: 'cpe-uoe-04', title: 'CPE Use of English Part 4: Key Word Transformation', exam: 'CPE', questions: 6, duration: 12, status: 'Active' },
  { id: 'cpe-read-01', title: 'CPE Reading Part 5: Multiple Choice', exam: 'CPE', questions: 6, duration: 15, status: 'Active' },
  { id: 'cpe-read-02', title: 'CPE Reading Part 6: Gapped Text', exam: 'CPE', questions: 7, duration: 15, status: 'Active' },
  { id: 'cpe-mock-01', title: 'CPE Cambridge C2 Entry Practice Test 1', exam: 'CPE', questions: 35, duration: 45, status: 'Active' },
  { id: 'cpe-mock-02', title: 'CPE Cambridge C2 Book 3 Practice Test 2', exam: 'CPE', questions: 35, duration: 45, status: 'Active' },
  { id: 'cpe-mock-03', title: 'CPE Cambridge C2 Entry Practice Test 3', exam: 'CPE', questions: 35, duration: 45, status: 'Active' },
];
