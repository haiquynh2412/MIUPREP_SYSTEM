// Diagnostic question banks for the desktop onboarding flow, keyed by exam track.
// Extracted from the per-app Onboarding copies so ielts-desktop and cpe-desktop
// share one onboarding shell (see @miuprep/exam-desktop).

export interface DiagnosticQuestion {
  id: string;
  skill: 'reading' | 'listening' | 'grammar';
  title: string;
  questionText: string;
  acceptedAnswers: string[];
  explanation: string;
}

export interface DiagnosticBank {
  questions: DiagnosticQuestion[];
  groundTruth: Record<string, string[]>;
}

const IELTS_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q1',
    skill: 'reading',
    title: 'Question 1: True / False / Not Given',
    questionText: 'Tea was originally used as a medicine in China.',
    acceptedAnswers: ['true'],
    explanation: 'Bài đọc nêu rõ: "...originating in ancient China as a medicinal drink." (Trà bắt nguồn từ Trung Quốc cổ đại như một thức uống thảo dược/chữa bệnh). Vì vậy đáp án là TRUE.'
  },
  {
    id: 'q2',
    skill: 'reading',
    title: 'Question 2: True / False / Not Given',
    questionText: 'Tea spread to Europe before it reached Japan.',
    acceptedAnswers: ['not given'],
    explanation: 'Bài đọc chỉ ghi nhận: "...spreading to Japan, Europe, and eventually the rest of the world." (Trà lan rộng sang Nhật Bản, châu Âu và cuối cùng là phần còn lại của thế giới). Thứ tự thời gian chính xác giữa Nhật Bản và châu Âu không được so sánh cụ thể, nên đáp án là NOT GIVEN.'
  },
  {
    id: 'q3',
    skill: 'reading',
    title: 'Question 3: Gap Fill',
    questionText: 'Tea drinking became fashionable in England during the ______ century.',
    acceptedAnswers: ['17th', '17', 'seventeenth'],
    explanation: 'Bài đọc nêu rõ: "In the 17th century, tea drinking became fashionable in England..." (Vào thế kỷ 17, việc uống trà trở nên thời thượng ở Anh). Vì vậy đáp án là "17th" hoặc "17" hoặc "seventeenth".'
  },
  {
    id: 'q4',
    skill: 'reading',
    title: 'Question 4: Gap Fill',
    questionText: 'England started tea production in ______ to break the Chinese monopoly.',
    acceptedAnswers: ['india'],
    explanation: 'Bài đọc ghi nhận: "...leading to large-scale production in India to bypass the Chinese monopoly." (dẫn đến việc sản xuất quy mô lớn ở Ấn Độ để phá vỡ thế độc quyền của Trung Quốc). Vì vậy quốc gia cần điền là "India".'
  },
  {
    id: 'q5',
    skill: 'reading',
    title: 'Question 5: Gap Fill',
    questionText: 'Tea originated in ancient ______.',
    acceptedAnswers: ['china'],
    explanation: 'Bài đọc nêu: "...originating in ancient China..." (bắt nguồn từ Trung Quốc cổ đại). Vì vậy quốc gia là "China".'
  },
  {
    id: 'q6',
    skill: 'listening',
    title: 'Question 6: Note Completion',
    questionText: 'The departure time from campus is ______ AM.',
    acceptedAnswers: ['8:30', '8.30'],
    explanation: 'Trong bài nghe: "We will depart the university campus at 8:30 AM..." (Chúng ta sẽ khởi hành từ khuôn viên trường đại học lúc 8h30 sáng). Do đó đáp án là "8:30".'
  },
  {
    id: 'q7',
    skill: 'listening',
    title: 'Question 7: Note Completion',
    questionText: 'The departure day is ______.',
    acceptedAnswers: ['tuesday'],
    explanation: 'Trong bài nghe: "...at 8:30 AM on Tuesday." (lúc 8h30 sáng Thứ Ba). Vì vậy ngày khởi hành là "Tuesday".'
  },
  {
    id: 'q8',
    skill: 'listening',
    title: 'Question 8: Note Completion',
    questionText: 'The first stop is the national science ______.',
    acceptedAnswers: ['museum'],
    explanation: 'Trong bài nghe: "Our first stop will be the national science museum..." (Điểm dừng chân đầu tiên sẽ là bảo tàng khoa học quốc gia). Vì vậy từ cần điền là "museum".'
  },
  {
    id: 'q9',
    skill: 'listening',
    title: 'Question 9: Note Completion',
    questionText: 'The guided tour of the museum starts at ______ AM.',
    acceptedAnswers: ['10:15', '10.15'],
    explanation: 'Trong bài nghe: "...where we have a guided tour booked for 10:15 AM." (nơi chúng ta đã đặt tour có hướng dẫn lúc 10h15 sáng). Vì vậy đáp án là "10:15".'
  },
  {
    id: 'q10',
    skill: 'listening',
    title: 'Question 10: Note Completion',
    questionText: 'Each student must pay ______ pounds (£) for the entry fee.',
    acceptedAnswers: ['6', 'six'],
    explanation: 'Trong bài nghe: "The museum entry fee is £12 per student, but the university covers half of this, so you only pay £6." (Vé vào cửa là £12, nhưng trường hỗ trợ một nửa, nên bạn chỉ trả £6). Vì vậy đáp án là "6" hoặc "six".'
  },
  {
    id: 'q11',
    skill: 'grammar',
    title: 'Question 11: Subject-Verb Agreement',
    questionText: 'She ______ to school every day.',
    acceptedAnswers: ['B', 'b'],
    explanation: 'Chủ ngữ "She" là ngôi thứ ba số ít, diễn tả thói quen lặp lại hàng ngày (every day) nên động từ chia ở thì Hiện tại đơn là "goes". Chọn đáp án B.'
  },
  {
    id: 'q12',
    skill: 'grammar',
    title: 'Question 12: Past Continuous vs Past Simple',
    questionText: 'They ______ TV when the phone rang.',
    acceptedAnswers: ['C', 'c'],
    explanation: 'Diễn tả một hành động đang xảy ra (chia thì Quá khứ tiếp diễn: "were watching") thì một hành động khác xen vào (chia thì Quá khứ đơn: "rang"). Chọn đáp án C.'
  },
  {
    id: 'q13',
    skill: 'grammar',
    title: 'Question 13: Conditional Sentence Type 1',
    questionText: 'If it rains tomorrow, we ______ the picnic.',
    acceptedAnswers: ['B', 'b'],
    explanation: 'Câu điều kiện loại 1 diễn tả sự việc có thể xảy ra ở tương lai. Cấu trúc: If + S + V(s/es) (Hiện tại đơn), S + will + V_inf (Tương lai đơn: "will cancel"). Chọn đáp án B.'
  },
  {
    id: 'q14',
    skill: 'grammar',
    title: 'Question 14: Superlative Adjectives',
    questionText: 'This is ______ interesting book I have ever read.',
    acceptedAnswers: ['A', 'a'],
    explanation: 'So sánh nhất đối với tính từ dài (interesting). Cấu trúc so sánh nhất đi kèm mệnh đề "I have ever read" bắt buộc có mạo từ xác định "the": "the most interesting". Chọn đáp án A.'
  },
  {
    id: 'q15',
    skill: 'grammar',
    title: 'Question 15: Preposition after Adjective',
    questionText: 'He is very good ______ playing the guitar.',
    acceptedAnswers: ['A', 'a'],
    explanation: 'Cấu trúc khen ngợi năng khiếu: "be good at something/doing something" (giỏi về việc gì). Chọn đáp án A.'
  }
];

// Ground Truth Answers
const IELTS_GROUND_TRUTH: Record<string, string[]> = {
  q1: ['true'],
  q2: ['not given'],
  q3: ['17th', '17', 'seventeenth'],
  q4: ['india', 'india'],
  q5: ['china'],
  q6: ['8:30', '8.30'],
  q7: ['tuesday'],
  q8: ['museum'],
  q9: ['10:15', '10.15'],
  q10: ['6', 'six'],
  q11: ['B', 'b'],
  q12: ['C', 'c'],
  q13: ['B', 'b'],
  q14: ['A', 'a'],
  q15: ['A', 'a']
};


const CPE_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q1',
    skill: 'reading',
    title: 'Question 1: Multiple-Choice Cloze (C2 Level)',
    questionText: 'He was determined to ______ his mark on the scientific community.',
    acceptedAnswers: ['A', 'a'],
    explanation: 'Cấu trúc cố định (collocation) ở trình độ C2: "make one\'s mark" nghĩa là tạo dựng danh tiếng, dấu ấn cá nhân nổi bật trong một lĩnh vực. Do đó chọn đáp án A (make).'
  },
  {
    id: 'q2',
    skill: 'reading',
    title: 'Question 2: Open Cloze (C2 Level)',
    questionText: 'No sooner had he arrived ______ the storm broke.',
    acceptedAnswers: ['than'],
    explanation: 'Cấu trúc đảo ngữ ngữ pháp nâng cao của C2: "No sooner had + S + V3/ed + THAN + S + V2/ed" (Ngay sau khi... thì...). Do đó từ cần điền vào ô trống là "than".'
  },
  {
    id: 'q3',
    skill: 'reading',
    title: 'Question 3: Word Formation (C2 Level)',
    questionText: 'The beauty of the island is ______ (COMPARE).',
    acceptedAnswers: ['incomparable'],
    explanation: 'Từ loại phái sinh (Word Formation) ở cấp độ C2: Từ động từ gốc "compare", ta chuyển thành tính từ phủ định mang nghĩa tuyệt đối là "incomparable" (đẹp vô song, không thể so sánh được).'
  },
  {
    id: 'q4',
    skill: 'reading',
    title: 'Question 4: Key Word Transformation (C2 Level)',
    questionText: 'It was a mistake for you to buy that expensive car. (SHOULD) -> You ______ that expensive car.',
    acceptedAnswers: ['should not have bought', "shouldn't have bought"],
    explanation: 'Dạng bài biến đổi câu giữ nguyên nghĩa của CPE: Sử dụng động từ khuyết thiếu ở quá khứ "should not have + V3" để diễn tả một sự việc đáng lẽ không nên làm trong quá khứ.'
  },
  {
    id: 'q5',
    skill: 'reading',
    title: 'Question 5: Multiple Choice Reading Comprehension',
    questionText: 'According to the scientific passage: "Advanced quantum networks present unprecedented cryptographic opportunities. However, the sheer vulnerability of quantum states to environmental decoherence has precluded their widespread commercial application." -> What is the primary obstacle to the commercialization of quantum networks? (A. Financial constraints, B. Environmental sensitivity, C. Lack of cryptographic interest, D. Hardware shortage)',
    acceptedAnswers: ['B', 'b'],
    explanation: 'Bài đọc nêu rõ sự nhạy cảm cực độ của trạng thái lượng tử trước sự mất liên kết từ môi trường (environmental decoherence) chính là rào cản lớn nhất ngăn việc thương mại hóa rộng rãi. Chọn đáp án B.'
  },
  {
    id: 'q6',
    skill: 'listening',
    title: 'Question 6: Note Completion (C2 Level)',
    questionText: 'Historically, the adult brain was considered to be a ______ structure.',
    acceptedAnswers: ['static'],
    explanation: 'Trong bài nghe học thuật: "...Historically, it was believed that the adult brain was a static structure..." (Trong lịch sử, não người trưởng thành được cho là một cấu trúc tĩnh). Do đó đáp án là "static".'
  },
  {
    id: 'q7',
    skill: 'listening',
    title: 'Question 7: Note Completion (C2 Level)',
    questionText: 'Neuroplasticity refers to the brain\'s capacity to form new ______ connections.',
    acceptedAnswers: ['neural'],
    explanation: 'Trong bài nghe: "...neuroplasticity—the brain’s remarkable ability to reorganize itself by forming new neural connections..." (Khả năng tổ chức lại bằng cách tạo ra các kết nối thần kinh mới). Do đó đáp án là "neural".'
  },
  {
    id: 'q8',
    skill: 'listening',
    title: 'Question 8: Note Completion (C2 Level)',
    questionText: 'Groundbreaking research in the late twentieth century shattered the long-held ______.',
    acceptedAnswers: ['dogma'],
    explanation: 'Trong bài nghe: "...groundbreaking research in the late twentieth century shattered this dogma..." (nghiên cứu đột phá vào cuối thế kỷ 20 đã đập tan giáo điều này). Đáp án là "dogma".'
  },
  {
    id: 'q9',
    skill: 'listening',
    title: 'Question 9: Note Completion (C2 Level)',
    questionText: 'Our cognitive architecture remains highly malleable even in ______ (old age).',
    acceptedAnswers: ['senescence'],
    explanation: 'Trong bài nghe: "...our cognitive architecture remains highly malleable even in senescence." (Cấu trúc nhận thức vẫn vô cùng linh hoạt ngay cả khi về già). Đáp án là "senescence".'
  },
  {
    id: 'q10',
    skill: 'listening',
    title: 'Question 10: Note Completion (C2 Level)',
    questionText: 'This discovery has profound implications for ______ rehabilitation.',
    acceptedAnswers: ['stroke'],
    explanation: 'Trong bài nghe: "...profound implications for stroke rehabilitation and learning." (tác động sâu sắc đến phục hồi chức năng sau đột quỵ và học tập). Đáp án là "stroke".'
  },
  {
    id: 'q11',
    skill: 'grammar',
    title: 'Question 11: Subjunctive Mood (C2 Level)',
    questionText: 'It is imperative that he ______ present at the board meeting.',
    acceptedAnswers: ['B', 'b'],
    explanation: 'Cấu trúc cầu khiến/giả định cách (Subjunctive Mood) ở cấp độ C2: "It is imperative/essential/important that + S + V_inf (nguyên thể không chia)". Do đó chọn đáp án B (be).'
  },
  {
    id: 'q12',
    skill: 'grammar',
    title: 'Question 12: Conditional Inversion (C2 Level)',
    questionText: '______ you require any further assistance, please do not hesitate to contact us.',
    acceptedAnswers: ['A', 'a'],
    explanation: 'Đảo ngữ câu điều kiện loại 1 (CPE style): "Should + S + V_inf" tương đương "If + S + V(present)". Chọn đáp án A (Should).'
  },
  {
    id: 'q13',
    skill: 'grammar',
    title: 'Question 13: Advanced Phrasal Verbs (C2 Level)',
    questionText: 'I was completely ______ by his sudden decision to resign.',
    acceptedAnswers: ['A', 'a'],
    explanation: 'Cụm động từ nâng cao C2: "be taken aback" nghĩa là vô cùng ngạc nhiên, sững sờ hoặc bị sốc bởi điều gì. Chọn đáp án A.'
  },
  {
    id: 'q14',
    skill: 'grammar',
    title: 'Question 14: Third Conditional Inversion (C2 Level)',
    questionText: 'Had I known about the traffic, I ______ here on time.',
    acceptedAnswers: ['B', 'b'],
    explanation: 'Đảo ngữ câu điều kiện loại 3 diễn tả sự việc trái ngược quá khứ: "Had + S + V3/ed, S + would have + V3/ed" (Nếu tôi biết... tôi đã đến đây đúng giờ). Chọn đáp án B (would have been).'
  },
  {
    id: 'q15',
    skill: 'grammar',
    title: 'Question 15: Gerund with Regret (C2 Level)',
    questionText: 'He regrets ______ school at such an early age, as he now struggles to find a job.',
    acceptedAnswers: ['A', 'a'],
    explanation: 'Cấu trúc động từ: "regret + V-ing" (hối hận vì đã làm gì trong quá khứ). Tránh nhầm lẫn với "regret + to-V" (tiếc khi sắp phải làm gì). Chọn đáp án A (leaving).'
  }
];

// Ground Truth Answers
const CPE_GROUND_TRUTH: Record<string, string[]> = {
  q1: ['A', 'a'],
  q2: ['than'],
  q3: ['incomparable'],
  q4: ['should not have bought', "shouldn't have bought"],
  q5: ['B', 'b'],
  q6: ['static'],
  q7: ['neural'],
  q8: ['dogma'],
  q9: ['senescence'],
  q10: ['stroke'],
  q11: ['B', 'b'],
  q12: ['A', 'a'],
  q13: ['A', 'a'],
  q14: ['B', 'b'],
  q15: ['A', 'a']
};


export const DIAGNOSTIC_BANKS: Record<string, DiagnosticBank> = {
  ielts: { questions: IELTS_DIAGNOSTIC_QUESTIONS, groundTruth: IELTS_GROUND_TRUTH },
  cpe: { questions: CPE_DIAGNOSTIC_QUESTIONS, groundTruth: CPE_GROUND_TRUTH },
  cae: { questions: CPE_DIAGNOSTIC_QUESTIONS, groundTruth: CPE_GROUND_TRUTH },
};

export function getDiagnosticBank(track: string): DiagnosticBank {
  return DIAGNOSTIC_BANKS[track] ?? DIAGNOSTIC_BANKS.ielts;
}
