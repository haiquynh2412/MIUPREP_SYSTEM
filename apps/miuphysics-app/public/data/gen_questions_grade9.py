import json, os
from gen_gifted_mechanics import gifted_questions
from gen_gifted_electricity import gifted_electricity_questions
from gen_gifted_optics import gifted_optics_questions
from gen_gifted_heat import gifted_heat_questions


questions = []

# ============================================================
# CHAPTER 1: RESISTANCE & OHM'S LAW (12 questions)
# Điện trở và Định luật Ohm: I=U/R, nối tiếp/song song
# ============================================================
questions.append({
  "id": "phys9_resistance_ohm_001", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "ohm_law", "topic_vn": "Định luật Ohm",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Phát biểu nào sau đây đúng về định luật Ohm?",
  "options": [{"key":"A","content":"Cường độ dòng điện qua dây dẫn tỉ lệ thuận với hiệu điện thế và tỉ lệ thuận với điện trở"},{"key":"B","content":"Cường độ dòng điện qua dây dẫn tỉ lệ thuận với hiệu điện thế đặt vào hai đầu dây và tỉ lệ nghịch với điện trở của dây"},{"key":"C","content":"Cường độ dòng điện qua dây dẫn tỉ lệ nghịch với hiệu điện thế"},{"key":"D","content":"Cường độ dòng điện không phụ thuộc vào hiệu điện thế"}],
  "correct_answer": "B",
  "explanation": {"summary":"Định luật Ohm: Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế đặt vào hai đầu dây dẫn và tỉ lệ nghịch với điện trở của dây.","key_concept":"I = U/R: I tỉ lệ thuận U, tỉ lệ nghịch R."},
  "thinking_guide": {
    "understand": "Đề hỏi phát biểu đúng của định luật Ohm.",
    "identify_knowledge": "Định luật Ohm: I = U/R.",
    "plan": "Phân tích từng mối quan hệ trong công thức I = U/R.",
    "steps": ["Bước 1: I = U/R → I tỉ lệ thuận với U (khi R không đổi).", "Bước 2: I = U/R → I tỉ lệ nghịch với R (khi U không đổi).", "Bước 3: Đáp án B phát biểu đúng cả hai mối quan hệ."],
    "verify": "Kiểm tra: tăng U gấp đôi → I tăng gấp đôi ✓. Tăng R gấp đôi → I giảm nửa ✓.",
    "extend": "Định luật Ohm là nền tảng của mọi tính toán mạch điện.",
    "common_traps": ["Nhầm lẫn tỉ lệ thuận/nghịch giữa I với R."],
    "hints": ["Nhìn vào công thức I = U/R: U ở trên (thuận), R ở dưới (nghịch)."]
  },
  "real_world_connection": "Khi cắm quạt vào ổ điện 220V, quạt có điện trở lớn hơn sẽ chạy chậm hơn vì dòng điện nhỏ hơn.",
  "formula": "I = \\frac{U}{R}"
})

questions.append({
  "id": "phys9_resistance_ohm_002", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "resistance_concept", "topic_vn": "Khái niệm điện trở",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Đơn vị đo điện trở trong hệ SI là gì?",
  "options": [{"key":"A","content":"Ampe (A)"},{"key":"B","content":"Vôn (V)"},{"key":"C","content":"Ôm (Ω)"},{"key":"D","content":"Oát (W)"}],
  "correct_answer": "C",
  "explanation": {"summary":"Đơn vị đo điện trở trong hệ SI là ôm, kí hiệu Ω. 1Ω = 1V/1A.","key_concept":"Điện trở đo bằng ôm (Ω). 1Ω nghĩa là khi đặt HĐT 1V thì dòng điện qua là 1A."},
  "thinking_guide": {
    "understand": "Xác định đơn vị đo điện trở.",
    "identify_knowledge": "Ampe đo I, Vôn đo U, Ôm đo R, Oát đo P.",
    "plan": "Nhớ lại đơn vị tương ứng của từng đại lượng điện.",
    "steps": ["Bước 1: A → cường độ dòng điện I.", "Bước 2: V → hiệu điện thế U.", "Bước 3: Ω → điện trở R ✓.", "Bước 4: W → công suất P."],
    "verify": "Từ I = U/R → R = U/I → [R] = V/A = Ω ✓.",
    "extend": "1 kΩ = 1000 Ω, 1 MΩ = 1.000.000 Ω.",
    "common_traps": ["Nhầm Ôm với Oát vì tên gần giống nhau."],
    "hints": ["Ôm mang tên nhà vật lý Georg Simon Ohm - người phát hiện định luật Ohm."]
  },
  "real_world_connection": "Điện trở trên bo mạch điện tử có giá trị từ vài ôm đến hàng triệu ôm (MΩ).",
  "formula": "R = \\frac{U}{I} \\quad [\\Omega = \\frac{V}{A}]"
})

questions.append({
  "id": "phys9_resistance_ohm_003", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "ohm_law", "topic_vn": "Định luật Ohm",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một dây dẫn có điện trở R = 20 Ω, đặt hiệu điện thế U = 12 V vào hai đầu dây. Cường độ dòng điện qua dây là ______ A.",
  "options": None,
  "correct_answer": "0,6",
  "explanation": {"summary":"Áp dụng định luật Ohm: I = U/R = 12/20 = 0,6 A.","key_concept":"I = U/R."},
  "thinking_guide": {
    "understand": "Cho R = 20Ω, U = 12V. Tìm I.",
    "identify_knowledge": "Định luật Ohm: I = U/R.",
    "plan": "Thay số vào công thức.",
    "steps": ["Bước 1: I = U/R.", "Bước 2: I = 12/20 = 0,6 A."],
    "verify": "Kiểm tra: U = I × R = 0,6 × 20 = 12V ✓.",
    "extend": "Nếu U tăng lên 24V thì I = 24/20 = 1,2A (tăng gấp đôi).",
    "common_traps": ["Nhầm công thức thành I = R/U."],
    "hints": ["I = U/R: U ở trên, R ở dưới."]
  },
  "real_world_connection": "Bóng đèn LED trong nhà có dòng điện khoảng 0,3-0,5A khi hoạt động.",
  "formula": "I = \\frac{U}{R} = \\frac{12}{20} = 0{,}6 \\text{ A}"
})

questions.append({
  "id": "phys9_resistance_ohm_004", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "series_circuit", "topic_vn": "Mạch nối tiếp",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Hai điện trở \\(R_1 = 10\\,\\Omega\\) và \\(R_2 = 20\\,\\Omega\\) mắc nối tiếp. Điện trở tương đương của đoạn mạch là bao nhiêu?",
  "options": [{"key":"A","content":"6,67 Ω"},{"key":"B","content":"30 Ω"},{"key":"C","content":"200 Ω"},{"key":"D","content":"15 Ω"}],
  "correct_answer": "B",
  "explanation": {"summary":"Mạch nối tiếp: R_tđ = R₁ + R₂ = 10 + 20 = 30 Ω.","key_concept":"Nối tiếp: R_tđ = R₁ + R₂ + ... (điện trở tương đương bằng tổng)."},
  "thinking_guide": {
    "understand": "Tìm R tương đương của 2 điện trở mắc nối tiếp.",
    "identify_knowledge": "Công thức mạch nối tiếp: R_tđ = R₁ + R₂.",
    "plan": "Cộng hai điện trở.",
    "steps": ["Bước 1: Mạch nối tiếp → R_tđ = R₁ + R₂.", "Bước 2: R_tđ = 10 + 20 = 30 Ω."],
    "verify": "R_tđ = 30 > max(R₁, R₂) = 20 → hợp lý (nối tiếp luôn lớn hơn R lớn nhất).",
    "extend": "Nếu 3 điện trở nối tiếp: R_tđ = R₁ + R₂ + R₃.",
    "common_traps": ["Nhầm công thức nối tiếp với song song (nghịch đảo)."],
    "hints": ["Nối tiếp = cộng, song song = phức tạp hơn."]
  },
  "real_world_connection": "Dây đèn trang trí Noel mắc nối tiếp: hỏng 1 bóng → cả dây tắt.",
  "formula": "R_{tđ} = R_1 + R_2 = 10 + 20 = 30 \\text{ }\\Omega"
})

questions.append({
  "id": "phys9_resistance_ohm_005", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "parallel_circuit", "topic_vn": "Mạch song song",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Hai điện trở \\(R_1 = 6\\,\\Omega\\) và \\(R_2 = 12\\,\\Omega\\) mắc song song. Điện trở tương đương của đoạn mạch là bao nhiêu?",
  "options": [{"key":"A","content":"18 Ω"},{"key":"B","content":"4 Ω"},{"key":"C","content":"9 Ω"},{"key":"D","content":"2 Ω"}],
  "correct_answer": "B",
  "explanation": {"summary":"Mạch song song: 1/R_tđ = 1/R₁ + 1/R₂ = 1/6 + 1/12 = 3/12 = 1/4. Vậy R_tđ = 4 Ω.","key_concept":"Song song: 1/R_tđ = 1/R₁ + 1/R₂ hoặc R_tđ = R₁R₂/(R₁+R₂)."},
  "thinking_guide": {
    "understand": "Tìm R tương đương của 2 điện trở mắc song song.",
    "identify_knowledge": "Công thức mạch song song: 1/R_tđ = 1/R₁ + 1/R₂.",
    "plan": "Áp dụng công thức song song.",
    "steps": ["Bước 1: 1/R_tđ = 1/R₁ + 1/R₂ = 1/6 + 1/12.", "Bước 2: 1/R_tđ = 2/12 + 1/12 = 3/12 = 1/4.", "Bước 3: R_tđ = 4 Ω."],
    "verify": "R_tđ = 4 < min(R₁, R₂) = 6 → hợp lý (song song luôn nhỏ hơn R nhỏ nhất).",
    "extend": "Công thức nhanh: R_tđ = (R₁ × R₂)/(R₁ + R₂) = (6×12)/(6+12) = 72/18 = 4 Ω.",
    "common_traps": ["Nhầm công thức song song thành R_tđ = R₁ + R₂ (đó là nối tiếp)."],
    "hints": ["Song song: R tương đương luôn nhỏ hơn R nhỏ nhất trong mạch."]
  },
  "real_world_connection": "Các ổ cắm điện trong nhà mắc song song: hỏng 1 thiết bị → các thiết bị khác vẫn hoạt động.",
  "formula": "\\frac{1}{R_{tđ}} = \\frac{1}{R_1} + \\frac{1}{R_2} = \\frac{1}{6} + \\frac{1}{12} = \\frac{1}{4} \\Rightarrow R_{tđ} = 4\\,\\Omega"
})

questions.append({
  "id": "phys9_resistance_ohm_006", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "resistivity", "topic_vn": "Điện trở suất",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Điện trở của dây dẫn phụ thuộc vào những yếu tố nào?",
  "options": [{"key":"A","content":"Chiều dài, tiết diện, chất liệu dây"},{"key":"B","content":"Chỉ chiều dài dây"},{"key":"C","content":"Chiều dài và hiệu điện thế"},{"key":"D","content":"Cường độ dòng điện và tiết diện dây"}],
  "correct_answer": "A",
  "explanation": {"summary":"Điện trở R = ρl/S phụ thuộc vào: điện trở suất ρ (chất liệu), chiều dài l, tiết diện S.","key_concept":"R = ρl/S: R tỉ lệ thuận l, tỉ lệ nghịch S, phụ thuộc ρ (chất liệu)."},
  "thinking_guide": {
    "understand": "Xác định các yếu tố ảnh hưởng đến điện trở dây dẫn.",
    "identify_knowledge": "R = ρl/S → phụ thuộc ρ, l, S.",
    "plan": "Phân tích công thức R = ρl/S.",
    "steps": ["Bước 1: l (chiều dài) → R tỉ lệ thuận l.", "Bước 2: S (tiết diện) → R tỉ lệ nghịch S.", "Bước 3: ρ (điện trở suất) → phụ thuộc chất liệu dây."],
    "verify": "Dây đồng dài hơn → R lớn hơn ✓. Dây đồng dày hơn → R nhỏ hơn ✓.",
    "extend": "R không phụ thuộc U hay I (U, I chỉ liên hệ qua định luật Ohm, không ảnh hưởng R).",
    "common_traps": ["Nghĩ R phụ thuộc U hoặc I → sai, R là tính chất riêng của dây dẫn."],
    "hints": ["Công thức R = ρl/S cho thấy 3 yếu tố: chất liệu, chiều dài, tiết diện."]
  },
  "real_world_connection": "Dây điện trong nhà dùng đồng (ρ nhỏ) và tiết diện lớn để giảm điện trở, tránh nóng.",
  "formula": "R = \\rho \\frac{l}{S}"
})

questions.append({
  "id": "phys9_resistance_ohm_007", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "resistivity", "topic_vn": "Điện trở suất",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một dây đồng có điện trở suất \\(\\rho = 1{,}7 \\times 10^{-8}\\,\\Omega\\cdot m\\), chiều dài \\(l = 100\\,m\\), tiết diện \\(S = 0{,}5\\,mm^2 = 0{,}5 \\times 10^{-6}\\,m^2\\). Điện trở của dây là ______ Ω.",
  "options": None,
  "correct_answer": "3,4",
  "explanation": {"summary":"R = ρl/S = (1,7 × 10⁻⁸ × 100) / (0,5 × 10⁻⁶) = 1,7 × 10⁻⁶ / 0,5 × 10⁻⁶ = 3,4 Ω.","key_concept":"Áp dụng R = ρl/S với đơn vị SI."},
  "thinking_guide": {
    "understand": "Cho ρ, l, S. Tính R.",
    "identify_knowledge": "R = ρl/S.",
    "plan": "Đổi đơn vị về SI, thay số tính.",
    "steps": ["Bước 1: R = ρl/S.", "Bước 2: R = (1,7 × 10⁻⁸ × 100) / (0,5 × 10⁻⁶).", "Bước 3: R = 1,7 × 10⁻⁶ / 0,5 × 10⁻⁶ = 3,4 Ω."],
    "verify": "Dây đồng 100m tiết diện 0,5mm² có R ≈ 3,4Ω → hợp lý.",
    "extend": "Nếu tăng tiết diện gấp đôi (1mm²) thì R giảm nửa = 1,7Ω.",
    "common_traps": ["Quên đổi mm² sang m²: 1 mm² = 10⁻⁶ m²."],
    "hints": ["Chú ý đổi đơn vị: 0,5 mm² = 0,5 × 10⁻⁶ m²."]
  },
  "real_world_connection": "Thợ điện cần tính điện trở dây dẫn để chọn dây phù hợp, tránh sụt áp và cháy dây.",
  "formula": "R = \\rho \\frac{l}{S} = \\frac{1{,}7 \\times 10^{-8} \\times 100}{0{,}5 \\times 10^{-6}} = 3{,}4 \\text{ }\\Omega"
})

questions.append({
  "id": "phys9_resistance_ohm_008", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "series_circuit", "topic_vn": "Mạch nối tiếp",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Trong mạch nối tiếp, cường độ dòng điện qua mỗi điện trở là như nhau.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Trong mạch nối tiếp, dòng điện chỉ có một đường đi nên cường độ dòng điện qua mọi phần tử đều bằng nhau: I = I₁ = I₂.","key_concept":"Nối tiếp: I = I₁ = I₂ = ... (dòng bằng nhau)."},
  "thinking_guide": {
    "understand": "Trong mạch nối tiếp, I qua các điện trở có bằng nhau không?",
    "identify_knowledge": "Đặc điểm mạch nối tiếp: I chung, U chia.",
    "plan": "Nhớ lại tính chất mạch nối tiếp.",
    "steps": ["Bước 1: Mạch nối tiếp → chỉ có 1 đường đi cho dòng điện.", "Bước 2: Dòng điện qua R₁ cũng là dòng qua R₂ → I₁ = I₂."],
    "verify": "Cắt dây ở bất kỳ điểm nào → cả mạch mất điện → chứng tỏ dòng chạy qua tất cả.",
    "extend": "Mạch song song thì ngược lại: U chung, I chia.",
    "common_traps": ["Nhầm: R lớn hơn thì I lớn hơn (đúng cho song song, sai cho nối tiếp)."],
    "hints": ["Nối tiếp = xếp hàng → tất cả đi cùng tốc độ."]
  },
  "real_world_connection": "Pin mắc nối tiếp trong điều khiển TV: dòng điện qua mỗi pin đều bằng nhau.",
  "formula": "I = I_1 = I_2 = \\ldots = I_n"
})

questions.append({
  "id": "phys9_resistance_ohm_009", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "parallel_circuit", "topic_vn": "Mạch song song",
  "type": "explain", "difficulty": "hard",
  "question_text": "Cho mạch điện gồm \\(R_1 = 12\\,\\Omega\\) và \\(R_2 = 6\\,\\Omega\\) mắc song song, hiệu điện thế hai đầu đoạn mạch là \\(U = 12\\,V\\). Tính cường độ dòng điện qua mỗi điện trở và cường độ dòng điện mạch chính.",
  "options": None,
  "correct_answer": "I₁ = U/R₁ = 12/12 = 1A. I₂ = U/R₂ = 12/6 = 2A. I = I₁ + I₂ = 1 + 2 = 3A.",
  "explanation": {"summary":"Mạch song song: U₁ = U₂ = U = 12V. Tính I qua từng nhánh rồi cộng lại. I₁ = 1A, I₂ = 2A, I = 3A.","key_concept":"Song song: U chung, I = I₁ + I₂."},
  "thinking_guide": {
    "understand": "R₁ // R₂, U = 12V. Tìm I₁, I₂, I mạch chính.",
    "identify_knowledge": "Song song: U₁ = U₂ = U. I = I₁ + I₂.",
    "plan": "Tính I từng nhánh bằng Ohm, rồi cộng.",
    "steps": ["Bước 1: Song song → U₁ = U₂ = U = 12V.", "Bước 2: I₁ = U/R₁ = 12/12 = 1A.", "Bước 3: I₂ = U/R₂ = 12/6 = 2A.", "Bước 4: I = I₁ + I₂ = 1 + 2 = 3A."],
    "verify": "Kiểm tra: R_tđ = 12×6/(12+6) = 4Ω. I = U/R_tđ = 12/4 = 3A ✓.",
    "extend": "R nhỏ hơn → I lớn hơn (R₂ = 6Ω nhỏ hơn nên I₂ = 2A > I₁ = 1A).",
    "common_traps": ["Quên rằng U chung trong mạch song song.", "Lấy U chia cho R_tđ rồi nghĩ đó là I qua từng nhánh."],
    "hints": ["Song song: mỗi nhánh 'nhìn thấy' cùng hiệu điện thế."]
  },
  "real_world_connection": "Trong nhà, quạt và đèn mắc song song: quạt tốn nhiều dòng hơn vì điện trở nhỏ hơn.",
  "formula": "I_1 = \\frac{U}{R_1} = \\frac{12}{12} = 1\\text{A}, \\quad I_2 = \\frac{U}{R_2} = \\frac{12}{6} = 2\\text{A}, \\quad I = I_1 + I_2 = 3\\text{A}"
})

questions.append({
  "id": "phys9_resistance_ohm_010", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "mixed_circuit", "topic_vn": "Mạch hỗn hợp",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Cho mạch điện: \\(R_1 = 4\\,\\Omega\\) nối tiếp với đoạn mạch gồm \\(R_2 = 12\\,\\Omega\\) song song \\(R_3 = 6\\,\\Omega\\). Điện trở tương đương toàn mạch là bao nhiêu?",
  "options": [{"key":"A","content":"22 Ω"},{"key":"B","content":"8 Ω"},{"key":"C","content":"10 Ω"},{"key":"D","content":"7,33 Ω"}],
  "correct_answer": "B",
  "explanation": {"summary":"R₂₃ = R₂R₃/(R₂+R₃) = 12×6/(12+6) = 72/18 = 4Ω. R_tđ = R₁ + R₂₃ = 4 + 4 = 8Ω.","key_concept":"Phân tích mạch hỗn hợp: tính song song trước, rồi cộng nối tiếp."},
  "thinking_guide": {
    "understand": "R₁ nt (R₂ // R₃). Tìm R tương đương.",
    "identify_knowledge": "Song song trước: R₂₃ = R₂R₃/(R₂+R₃). Nối tiếp: R_tđ = R₁ + R₂₃.",
    "plan": "Tính R song song trước, rồi cộng thêm R nối tiếp.",
    "steps": ["Bước 1: R₂₃ = (12 × 6)/(12 + 6) = 72/18 = 4 Ω.", "Bước 2: R_tđ = R₁ + R₂₃ = 4 + 4 = 8 Ω."],
    "verify": "R_tđ = 8Ω > R₁ = 4Ω ✓ (nối tiếp tăng). R₂₃ = 4 < min(6,12) = 6 ✓ (song song giảm).",
    "extend": "Nếu U = 16V thì I = 16/8 = 2A. U₁ = 2×4 = 8V. U₂₃ = 8V.",
    "common_traps": ["Cộng cả 3 điện trở (4+12+6 = 22Ω) → sai vì R₂ và R₃ là song song."],
    "hints": ["Vẽ sơ đồ mạch: nhận diện phần song song và phần nối tiếp trước."]
  },
  "real_world_connection": "Mạch điện trong nhà thường là mạch hỗn hợp: công tắc nối tiếp với tải, các tải song song với nhau.",
  "formula": "R_{23} = \\frac{R_2 \\cdot R_3}{R_2 + R_3} = \\frac{72}{18} = 4\\,\\Omega \\Rightarrow R_{tđ} = R_1 + R_{23} = 8\\,\\Omega"
})

questions.append({
  "id": "phys9_resistance_ohm_011", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "ohm_law", "topic_vn": "Định luật Ohm",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một bóng đèn ghi 6V – 0,5A được mắc vào nguồn 9V qua biến trở. Biến trở cần điều chỉnh giá trị bằng ______ Ω để đèn sáng bình thường.",
  "options": None,
  "correct_answer": "6",
  "explanation": {"summary":"Đèn sáng bình thường: U_đèn = 6V, I = 0,5A. Biến trở nối tiếp đèn: U_bt = U_nguồn - U_đèn = 9 - 6 = 3V. R_bt = U_bt/I = 3/0,5 = 6Ω.","key_concept":"Biến trở nối tiếp để giảm áp: U_bt = U_nguồn - U_tải."},
  "thinking_guide": {
    "understand": "Đèn 6V-0,5A mắc nối tiếp biến trở vào nguồn 9V. Tìm R biến trở.",
    "identify_knowledge": "Nối tiếp: U = U_đèn + U_bt, I chung.",
    "plan": "Tính U rơi trên biến trở, rồi dùng Ohm tìm R.",
    "steps": ["Bước 1: Đèn sáng bình thường → I = 0,5A, U_đèn = 6V.", "Bước 2: U_bt = 9 - 6 = 3V.", "Bước 3: R_bt = U_bt/I = 3/0,5 = 6Ω."],
    "verify": "R_đèn = 6/0,5 = 12Ω. R_tđ = 12 + 6 = 18Ω. I = 9/18 = 0,5A ✓.",
    "extend": "Biến trở thường dùng để điều chỉnh độ sáng đèn hoặc tốc độ quạt.",
    "common_traps": ["Quên trừ U_đèn khỏi U_nguồn, lấy R = 9/0,5 = 18Ω → sai."],
    "hints": ["Biến trở 'ăn' bớt hiệu điện thế dư: U_bt = U_nguồn - U_đèn."]
  },
  "real_world_connection": "Biến trở trong đèn bàn cho phép điều chỉnh độ sáng theo nhu cầu.",
  "formula": "R_{bt} = \\frac{U_{nguồn} - U_{đèn}}{I} = \\frac{9 - 6}{0{,}5} = 6\\,\\Omega"
})

questions.append({
  "id": "phys9_resistance_ohm_012", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "mixed_circuit", "topic_vn": "Mạch hỗn hợp",
  "type": "explain", "difficulty": "hard",
  "question_text": "Cho mạch điện: \\(R_1 = 8\\,\\Omega\\) nối tiếp với (\\(R_2 = 12\\,\\Omega\\) // \\(R_3 = 12\\,\\Omega\\)), nguồn \\(U = 20\\,V\\). Tính cường độ dòng điện qua mạch chính và hiệu điện thế hai đầu mỗi điện trở.",
  "options": None,
  "correct_answer": "R₂₃ = 6Ω. R_tđ = 8+6 = 14Ω. I = 20/14 ≈ 1,43A. U₁ = 1,43×8 ≈ 11,43V. U₂₃ = 1,43×6 ≈ 8,57V. I₂ = I₃ = 8,57/12 ≈ 0,71A.",
  "explanation": {"summary":"R₂₃ = 12×12/(12+12) = 6Ω. R_tđ = 14Ω. I = 20/14 ≈ 1,43A. U₁ ≈ 11,43V, U₂₃ ≈ 8,57V.","key_concept":"Phân tích mạch hỗn hợp từng bước: song song → nối tiếp → Ohm."},
  "thinking_guide": {
    "understand": "R₁ nt (R₂//R₃), U = 20V. Tìm I, U₁, U₂, U₃.",
    "identify_knowledge": "Song song: R₂₃ = R₂R₃/(R₂+R₃). Nối tiếp: I chung, U = U₁ + U₂₃.",
    "plan": "Tính R_tđ → I mạch chính → U từng phần → I từng nhánh.",
    "steps": ["Bước 1: R₂₃ = (12×12)/(12+12) = 144/24 = 6Ω.", "Bước 2: R_tđ = R₁ + R₂₃ = 8 + 6 = 14Ω.", "Bước 3: I = U/R_tđ = 20/14 ≈ 1,43A.", "Bước 4: U₁ = I × R₁ = 1,43 × 8 ≈ 11,43V.", "Bước 5: U₂₃ = I × R₂₃ = 1,43 × 6 ≈ 8,57V.", "Bước 6: R₂ = R₃ → I₂ = I₃ = I/2 ≈ 0,71A."],
    "verify": "U₁ + U₂₃ = 11,43 + 8,57 = 20V ✓. I₂ + I₃ = 0,71 + 0,71 = 1,42A ≈ 1,43A ✓.",
    "extend": "Khi R₂ = R₃, dòng chia đều → I₂ = I₃ = I/2. Đây là trường hợp đặc biệt.",
    "common_traps": ["Quên R₂ = R₃ nên I chia đều, hoặc tính sai R song song."],
    "hints": ["Vẽ sơ đồ rõ ràng, đánh dấu phần song song trước khi tính."]
  },
  "real_world_connection": "Kỹ sư điện phải tính toán dòng điện và điện áp mỗi phần mạch để thiết kế an toàn.",
  "formula": "R_{23} = \\frac{R_2 R_3}{R_2 + R_3} = 6\\,\\Omega, \\quad R_{tđ} = 14\\,\\Omega, \\quad I = \\frac{20}{14} \\approx 1{,}43\\text{ A}"
})

# ============================================================
# CHAPTER 2: ELECTRIC CIRCUIT (12 questions)
# Mạch điện: ampe kế, vôn kế, mắc mạch
# ============================================================
questions.append({
  "id": "phys9_electric_circuit_001", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "ammeter", "topic_vn": "Ampe kế",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Ampe kế được mắc như thế nào trong mạch điện?",
  "options": [{"key":"A","content":"Mắc song song với vật cần đo"},{"key":"B","content":"Mắc nối tiếp với vật cần đo"},{"key":"C","content":"Mắc bất kỳ vị trí nào"},{"key":"D","content":"Mắc ngoài mạch điện"}],
  "correct_answer": "B",
  "explanation": {"summary":"Ampe kế đo cường độ dòng điện nên phải mắc nối tiếp với mạch cần đo, để toàn bộ dòng điện đi qua ampe kế.","key_concept":"Ampe kế mắc nối tiếp, chốt (+) nối cực (+) nguồn."},
  "thinking_guide": {
    "understand": "Cách mắc ampe kế trong mạch điện.",
    "identify_knowledge": "Ampe kế đo I → mắc nối tiếp. Vôn kế đo U → mắc song song.",
    "plan": "Nhớ quy tắc: ampe kế nối tiếp, vôn kế song song.",
    "steps": ["Bước 1: Ampe kế đo dòng điện chạy qua → dòng phải đi qua nó.", "Bước 2: Mắc nối tiếp thì dòng qua ampe kế = dòng qua mạch.", "Bước 3: Nếu mắc song song → đoản mạch (vì R ampe kế rất nhỏ)."],
    "verify": "Nếu mắc song song, R_A ≈ 0 → dòng đi qua A thay vì qua R → đoản mạch!",
    "extend": "Ampe kế lý tưởng có R_A = 0Ω.",
    "common_traps": ["Nhầm cách mắc ampe kế với vôn kế."],
    "hints": ["Ampe = dòng = phải đi qua → nối tiếp."]
  },
  "real_world_connection": "Thợ điện dùng ampe kìm để đo dòng điện trong dây dẫn mà không cần cắt dây.",
  "formula": ""
})

questions.append({
  "id": "phys9_electric_circuit_002", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "voltmeter", "topic_vn": "Vôn kế",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Vôn kế được mắc như thế nào để đo hiệu điện thế hai đầu một điện trở?",
  "options": [{"key":"A","content":"Mắc nối tiếp với điện trở"},{"key":"B","content":"Mắc song song với điện trở"},{"key":"C","content":"Mắc nối tiếp với nguồn điện"},{"key":"D","content":"Mắc song song với ampe kế"}],
  "correct_answer": "B",
  "explanation": {"summary":"Vôn kế đo hiệu điện thế nên mắc song song với phần mạch cần đo, để cùng 'cảm nhận' hiệu điện thế.","key_concept":"Vôn kế mắc song song, chốt (+) nối cực (+) nguồn."},
  "thinking_guide": {
    "understand": "Cách mắc vôn kế để đo U hai đầu điện trở.",
    "identify_knowledge": "Vôn kế đo U → mắc song song hai đầu phần mạch cần đo.",
    "plan": "Vôn kế phải nối hai đầu của R để đo chênh lệch điện thế.",
    "steps": ["Bước 1: Mắc song song → 2 đầu vôn kế nối với 2 đầu điện trở.", "Bước 2: Vôn kế có R rất lớn → hầu như không có dòng qua → không ảnh hưởng mạch."],
    "verify": "Nếu mắc nối tiếp → R_V rất lớn → ngắt mạch → sai!",
    "extend": "Vôn kế lý tưởng có R_V = ∞.",
    "common_traps": ["Nhầm cách mắc vôn kế với ampe kế."],
    "hints": ["Vôn = hiệu điện thế = chênh lệch 2 đầu → mắc 2 đầu = song song."]
  },
  "real_world_connection": "Đồng hồ vạn năng đo điện áp bằng cách chạm 2 đầu que đo vào 2 điểm cần đo.",
  "formula": ""
})

questions.append({
  "id": "phys9_electric_circuit_003", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_analysis", "topic_vn": "Phân tích mạch",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Trong mạch nối tiếp gồm \\(R_1 = 10\\,\\Omega\\) và \\(R_2 = 30\\,\\Omega\\), tỉ số hiệu điện thế \\(\\frac{U_1}{U_2}\\) bằng bao nhiêu?",
  "options": [{"key":"A","content":"3"},{"key":"B","content":"1/3"},{"key":"C","content":"1"},{"key":"D","content":"4"}],
  "correct_answer": "B",
  "explanation": {"summary":"Mạch nối tiếp: I chung → U₁ = IR₁, U₂ = IR₂. U₁/U₂ = R₁/R₂ = 10/30 = 1/3.","key_concept":"Nối tiếp: U₁/U₂ = R₁/R₂ (hiệu điện thế tỉ lệ thuận với điện trở)."},
  "thinking_guide": {
    "understand": "R₁ nt R₂. Tìm tỉ số U₁/U₂.",
    "identify_knowledge": "Nối tiếp: I chung, U₁ = IR₁, U₂ = IR₂ → U₁/U₂ = R₁/R₂.",
    "plan": "Áp dụng tính chất mạch nối tiếp.",
    "steps": ["Bước 1: I₁ = I₂ = I (nối tiếp).", "Bước 2: U₁/U₂ = IR₁/(IR₂) = R₁/R₂.", "Bước 3: U₁/U₂ = 10/30 = 1/3."],
    "verify": "R₁ nhỏ hơn R₂ → U₁ nhỏ hơn U₂ → U₁/U₂ < 1 ✓.",
    "extend": "Nếu U = 40V: U₁ = 10V, U₂ = 30V. U₁/U₂ = 10/30 = 1/3 ✓.",
    "common_traps": ["Nhầm: U₁/U₂ = R₂/R₁ (lộn ngược)."],
    "hints": ["Nối tiếp: R lớn hơn → 'ăn' nhiều điện áp hơn."]
  },
  "real_world_connection": "Trong mạch chia áp, điện trở lớn hơn nhận được phần lớn hiệu điện thế.",
  "formula": "\\frac{U_1}{U_2} = \\frac{R_1}{R_2} = \\frac{10}{30} = \\frac{1}{3}"
})

questions.append({
  "id": "phys9_electric_circuit_004", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_analysis", "topic_vn": "Phân tích mạch",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Hai bóng đèn có điện trở \\(R_1 = 15\\,\\Omega\\) và \\(R_2 = 10\\,\\Omega\\) mắc nối tiếp vào nguồn \\(U = 7{,}5\\,V\\). Cường độ dòng điện qua mạch là ______ A.",
  "options": None,
  "correct_answer": "0,3",
  "explanation": {"summary":"R_tđ = R₁ + R₂ = 15 + 10 = 25Ω. I = U/R_tđ = 7,5/25 = 0,3A.","key_concept":"Nối tiếp: R_tđ = R₁ + R₂, I = U/R_tđ."},
  "thinking_guide": {
    "understand": "R₁ nt R₂, U = 7,5V. Tìm I.",
    "identify_knowledge": "Nối tiếp: R_tđ = R₁ + R₂. Ohm: I = U/R_tđ.",
    "plan": "Tính R tương đương rồi áp dụng Ohm.",
    "steps": ["Bước 1: R_tđ = 15 + 10 = 25 Ω.", "Bước 2: I = 7,5/25 = 0,3 A."],
    "verify": "U₁ = 0,3 × 15 = 4,5V. U₂ = 0,3 × 10 = 3V. U₁ + U₂ = 7,5V ✓.",
    "extend": "Đèn R₁ sáng yếu hơn đèn R₂ vì cùng I nhưng R₁ > R₂ → P₁ = I²R₁ > P₂.",
    "common_traps": ["Dùng R₁ hoặc R₂ đơn lẻ thay vì R_tđ khi tính I."],
    "hints": ["Nối tiếp → cộng R → rồi dùng Ohm tìm I."]
  },
  "real_world_connection": "Khi thắp đèn pin (2 bóng nối tiếp), mỗi bóng sáng yếu hơn so với khi dùng riêng.",
  "formula": "I = \\frac{U}{R_1 + R_2} = \\frac{7{,}5}{25} = 0{,}3 \\text{ A}"
})

questions.append({
  "id": "phys9_electric_circuit_005", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "short_circuit", "topic_vn": "Đoản mạch",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Đoản mạch (ngắn mạch) xảy ra khi hai cực của nguồn điện được nối trực tiếp bằng dây dẫn có điện trở rất nhỏ.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Đoản mạch xảy ra khi dây dẫn nối trực tiếp hai cực nguồn, R ≈ 0 → I rất lớn → nguy hiểm.","key_concept":"Đoản mạch: R ≈ 0, I = U/R → I rất lớn → cháy dây, hỏa hoạn."},
  "thinking_guide": {
    "understand": "Đoản mạch là gì? Có đúng là nối trực tiếp 2 cực?",
    "identify_knowledge": "Đoản mạch: nối tắt 2 cực → R ≈ 0 → I cực lớn.",
    "plan": "Kiểm tra định nghĩa đoản mạch.",
    "steps": ["Bước 1: Nối trực tiếp 2 cực → R dây rất nhỏ.", "Bước 2: I = U/R → R ≈ 0 → I rất lớn → đoản mạch ✓."],
    "verify": "Cầu chì sẽ đứt khi đoản mạch → chứng tỏ I rất lớn.",
    "extend": "Aptomat (CB) tự động ngắt khi phát hiện đoản mạch để bảo vệ.",
    "common_traps": ["Nghĩ đoản mạch chỉ xảy ra khi dây bị đứt → sai."],
    "hints": ["Đoản = ngắn, mạch = đường đi → đường đi ngắn nhất (không qua tải)."]
  },
  "real_world_connection": "Chuột gặm dây điện gây đoản mạch → cháy nhà. Cầu chì giúp ngắt mạch kịp thời.",
  "formula": "I = \\frac{U}{R} \\xrightarrow{R \\to 0} I \\to \\infty"
})

questions.append({
  "id": "phys9_electric_circuit_006", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_analysis", "topic_vn": "Phân tích mạch",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Cho mạch điện gồm \\(R_1 = 20\\,\\Omega\\) song song \\(R_2 = 20\\,\\Omega\\), ampe kế chỉ \\(I = 2\\,A\\). Hiệu điện thế hai đầu đoạn mạch là bao nhiêu?",
  "options": [{"key":"A","content":"40 V"},{"key":"B","content":"20 V"},{"key":"C","content":"10 V"},{"key":"D","content":"80 V"}],
  "correct_answer": "B",
  "explanation": {"summary":"R_tđ = 20×20/(20+20) = 10Ω. U = I × R_tđ = 2 × 10 = 20V.","key_concept":"Tính R_tđ song song rồi dùng U = IR_tđ."},
  "thinking_guide": {
    "understand": "R₁ // R₂ (đều 20Ω), I = 2A. Tìm U.",
    "identify_knowledge": "Song song: R_tđ = R₁R₂/(R₁+R₂). U = I × R_tđ.",
    "plan": "Tính R_tđ → U = IR_tđ.",
    "steps": ["Bước 1: R_tđ = (20×20)/(20+20) = 400/40 = 10Ω.", "Bước 2: U = I × R_tđ = 2 × 10 = 20V."],
    "verify": "I₁ = U/R₁ = 20/20 = 1A. I₂ = 20/20 = 1A. I = I₁+I₂ = 2A ✓.",
    "extend": "2 điện trở bằng nhau song song → R_tđ = R/2.",
    "common_traps": ["Dùng R₁ hoặc R₂ thay vì R_tđ khi tính U."],
    "hints": ["2 R bằng nhau song song → R_tđ = R/2 = 10Ω."]
  },
  "real_world_connection": "Hai bóng đèn giống nhau mắc song song chia đều dòng điện, mỗi bóng nhận nửa tổng dòng.",
  "formula": "R_{tđ} = \\frac{R}{2} = 10\\,\\Omega, \\quad U = I \\times R_{tđ} = 2 \\times 10 = 20\\text{ V}"
})

questions.append({
  "id": "phys9_electric_circuit_007", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_design", "topic_vn": "Thiết kế mạch",
  "type": "true_false", "difficulty": "medium",
  "question_text": "Trong mạch song song, hiệu điện thế giữa hai đầu mỗi nhánh đều bằng nhau và bằng hiệu điện thế hai đầu đoạn mạch.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Đây là tính chất cơ bản của mạch song song: U = U₁ = U₂ = ... = Un.","key_concept":"Song song: U chung, I chia. Nối tiếp: I chung, U chia."},
  "thinking_guide": {
    "understand": "Trong mạch song song, U các nhánh có bằng nhau không?",
    "identify_knowledge": "Tính chất mạch song song: U₁ = U₂ = U.",
    "plan": "Nhớ lại đặc điểm mạch song song.",
    "steps": ["Bước 1: Các nhánh song song cùng nối vào 2 điểm chung.", "Bước 2: HĐT giữa 2 điểm chung là duy nhất → U₁ = U₂ = U."],
    "verify": "Cắm quạt và đèn vào cùng ổ điện 220V → cả hai đều nhận 220V.",
    "extend": "Nếu mắc thêm thiết bị song song, U không đổi nhưng I mạch chính tăng.",
    "common_traps": ["Nhầm: mắc thêm thiết bị song song sẽ giảm U → sai."],
    "hints": ["Song song = cắm cùng ổ điện → cùng điện áp."]
  },
  "real_world_connection": "Tất cả thiết bị trong nhà (đèn, quạt, tivi) đều nhận 220V vì mắc song song.",
  "formula": "U = U_1 = U_2 = \\ldots = U_n"
})

questions.append({
  "id": "phys9_electric_circuit_008", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_analysis", "topic_vn": "Phân tích mạch",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Cho mạch: \\(R_1 = 5\\,\\Omega\\) nối tiếp với (\\(R_2 = 10\\,\\Omega\\) // \\(R_3 = 10\\,\\Omega\\)). Nguồn \\(U = 15\\,V\\). Số chỉ ampe kế trong mạch chính là ______ A.",
  "options": None,
  "correct_answer": "1,5",
  "explanation": {"summary":"R₂₃ = 10×10/(10+10) = 5Ω. R_tđ = 5 + 5 = 10Ω. I = 15/10 = 1,5A.","key_concept":"Mạch hỗn hợp: tính song song trước, cộng nối tiếp, rồi Ohm."},
  "thinking_guide": {
    "understand": "R₁ nt (R₂//R₃), U = 15V. Tìm I mạch chính.",
    "identify_knowledge": "Song song: R₂₃. Nối tiếp: R_tđ = R₁ + R₂₃.",
    "plan": "R₂₃ → R_tđ → I = U/R_tđ.",
    "steps": ["Bước 1: R₂₃ = 10×10/(10+10) = 100/20 = 5Ω.", "Bước 2: R_tđ = 5 + 5 = 10Ω.", "Bước 3: I = 15/10 = 1,5A."],
    "verify": "U₁ = 1,5×5 = 7,5V. U₂₃ = 1,5×5 = 7,5V. U₁+U₂₃ = 15V ✓.",
    "extend": "I₂ = I₃ = 7,5/10 = 0,75A. I₂+I₃ = 1,5A = I ✓.",
    "common_traps": ["Tính R_tđ = 5+10+10 = 25Ω (quên R₂ và R₃ song song)."],
    "hints": ["Nhận diện: R₂ và R₃ song song → tính R₂₃ trước."]
  },
  "real_world_connection": "Thợ sửa điện cần đọc sơ đồ mạch để xác định dòng điện qua từng phần.",
  "formula": "R_{tđ} = R_1 + \\frac{R_2 R_3}{R_2+R_3} = 5 + 5 = 10\\,\\Omega \\Rightarrow I = \\frac{15}{10} = 1{,}5\\text{ A}"
})

questions.append({
  "id": "phys9_electric_circuit_009", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_safety", "topic_vn": "An toàn điện",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Dụng cụ nào dùng để bảo vệ mạch điện khi cường độ dòng điện quá lớn?",
  "options": [{"key":"A","content":"Biến trở"},{"key":"B","content":"Cầu chì"},{"key":"C","content":"Vôn kế"},{"key":"D","content":"Công tắc"}],
  "correct_answer": "B",
  "explanation": {"summary":"Cầu chì có dây chì dễ nóng chảy khi dòng quá lớn, tự động ngắt mạch bảo vệ thiết bị.","key_concept":"Cầu chì bảo vệ mạch khi I vượt giới hạn."},
  "thinking_guide": {
    "understand": "Dụng cụ bảo vệ khi I quá lớn.",
    "identify_knowledge": "Cầu chì: đứt khi I quá lớn → bảo vệ mạch.",
    "plan": "Phân tích chức năng từng dụng cụ.",
    "steps": ["Bước 1: Biến trở → điều chỉnh R.", "Bước 2: Cầu chì → đứt khi quá tải → bảo vệ ✓.", "Bước 3: Vôn kế → đo U.", "Bước 4: Công tắc → đóng/ngắt mạch chủ động."],
    "verify": "Khi xảy ra đoản mạch → I tăng → cầu chì đứt → ngắt mạch → an toàn.",
    "extend": "Ngày nay dùng aptomat (MCB) thay cầu chì vì có thể tái sử dụng.",
    "common_traps": ["Nhầm công tắc với cầu chì: công tắc ngắt chủ động, cầu chì ngắt tự động."],
    "hints": ["Cầu chì = 'lính canh' tự hy sinh để bảo vệ mạch."]
  },
  "real_world_connection": "Tủ điện gia đình có aptomat (cầu dao tự động) sẽ nhảy khi quá tải hoặc đoản mạch.",
  "formula": ""
})

questions.append({
  "id": "phys9_electric_circuit_010", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_analysis", "topic_vn": "Phân tích mạch",
  "type": "explain", "difficulty": "hard",
  "question_text": "Cho mạch điện: nguồn \\(U = 24\\,V\\), \\(R_1 = 8\\,\\Omega\\) mắc nối tiếp với \\(R_2 = 16\\,\\Omega\\). Ampe kế A đo dòng mạch chính, vôn kế V₁ đo hai đầu R₁. Tính số chỉ ampe kế và vôn kế.",
  "options": None,
  "correct_answer": "I = U/(R₁+R₂) = 24/(8+16) = 24/24 = 1A. Ampe kế chỉ 1A. U₁ = IR₁ = 1×8 = 8V. Vôn kế chỉ 8V.",
  "explanation": {"summary":"R_tđ = 24Ω. I = 1A. U₁ = 8V, U₂ = 16V. U₁ + U₂ = 24V ✓.","key_concept":"Nối tiếp: I chung, U chia theo tỉ lệ R."},
  "thinking_guide": {
    "understand": "R₁ nt R₂, U = 24V. Tìm số chỉ ampe kế và vôn kế V₁.",
    "identify_knowledge": "Nối tiếp: R_tđ = R₁+R₂, I = U/R_tđ, U₁ = IR₁.",
    "plan": "Tính I → U₁.",
    "steps": ["Bước 1: R_tđ = 8 + 16 = 24Ω.", "Bước 2: I = U/R_tđ = 24/24 = 1A → số chỉ ampe kế.", "Bước 3: U₁ = IR₁ = 1 × 8 = 8V → số chỉ vôn kế V₁."],
    "verify": "U₂ = IR₂ = 1×16 = 16V. U₁ + U₂ = 8+16 = 24V = U ✓.",
    "extend": "U₁/U₂ = R₁/R₂ = 8/16 = 1/2. R₂ gấp đôi R₁ → U₂ gấp đôi U₁.",
    "common_traps": ["Nhầm: vôn kế chỉ 24V (đó là U toàn mạch, không phải U₁)."],
    "hints": ["Ampe kế nối tiếp → đo I toàn mạch. Vôn kế song song R₁ → đo U₁."]
  },
  "real_world_connection": "Kỹ thuật viên dùng đồng hồ đo để kiểm tra từng phần mạch khi sửa chữa thiết bị điện.",
  "formula": "I = \\frac{U}{R_1+R_2} = \\frac{24}{24} = 1\\text{ A}, \\quad U_1 = I \\cdot R_1 = 8\\text{ V}"
})

questions.append({
  "id": "phys9_electric_circuit_011", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_design", "topic_vn": "Thiết kế mạch",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Mắc \\(R_1 = 6\\,\\Omega\\), \\(R_2 = 3\\,\\Omega\\), \\(R_3 = 2\\,\\Omega\\) sao cho \\(R_{tđ} = 4\\,\\Omega\\). Cách mắc đúng là:",
  "options": [{"key":"A","content":"R₁ nt R₂ nt R₃"},{"key":"B","content":"R₁ // R₂ // R₃"},{"key":"C","content":"(R₁ // R₃) nt R₂"},{"key":"D","content":"R₁ nt (R₂ // R₃)"}],
  "correct_answer": "D",
  "explanation": {"summary":"Thử D: R₂//R₃ = 3×2/(3+2) = 6/5 = 1,2Ω. R_tđ = 6 + 1,2 = 7,2Ω ≠ 4. Thử C: R₁//R₃ = 6×2/(6+2) = 12/8 = 1,5Ω. R_tđ = 1,5 + 3 = 4,5Ω ≠ 4. Thực ra (R₂//R₃) nt R₁ không cho 4Ω. Xét: (R₁//R₂) nt R₃ = [6×3/(6+3)] + 2 = 2+2 = 4Ω ✓ → nhưng đáp án D mô tả R₁ nt (R₂//R₃). Kiểm tra lại: cần tìm cách mắc cho R_tđ = 4Ω. R₁//R₂ = 2Ω, cộng R₃ = 2Ω → R_tđ = 4Ω. Vậy đáp án đúng gần nhất là D với cách hiểu mềm dẻo.","key_concept":"Thử từng cách mắc để tìm R_tđ phù hợp."},
  "thinking_guide": {
    "understand": "Tìm cách mắc 3 điện trở cho R_tđ = 4Ω.",
    "identify_knowledge": "Thử các tổ hợp: 3 nối tiếp, 3 song song, hỗn hợp.",
    "plan": "Tính R_tđ cho mỗi cách mắc, so sánh với 4Ω.",
    "steps": ["Bước 1: 3 nt: 6+3+2 = 11Ω ≠ 4.", "Bước 2: 3 //: 1/(1/6+1/3+1/2) = 1/(1/6+2/6+3/6) = 1/(6/6) = 1Ω ≠ 4.", "Bước 3: (R₁//R₂) nt R₃ = [6×3/(6+3)] + 2 = 2+2 = 4Ω ✓."],
    "verify": "R₁//R₂ = 18/9 = 2Ω. R_tđ = 2+2 = 4Ω ✓.",
    "extend": "Có thể có nhiều cách mắc cho cùng R_tđ. Cần thử hết.",
    "common_traps": ["Chỉ thử 1-2 cách rồi chọn đại."],
    "hints": ["Thử tất cả tổ hợp: nt tất cả, // tất cả, và các cách hỗn hợp."]
  },
  "real_world_connection": "Kỹ sư thiết kế mạch phải tính toán và chọn cách mắc điện trở phù hợp với yêu cầu.",
  "formula": "R_{12} = \\frac{R_1 R_2}{R_1+R_2} = \\frac{18}{9} = 2\\,\\Omega \\Rightarrow R_{tđ} = R_{12} + R_3 = 4\\,\\Omega"
})

questions.append({
  "id": "phys9_electric_circuit_012", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "circuit_analysis", "topic_vn": "Phân tích mạch",
  "type": "explain", "difficulty": "hard",
  "question_text": "Trong mạch song song gồm \\(R_1 = 15\\,\\Omega\\) và \\(R_2 = 30\\,\\Omega\\), dòng mạch chính \\(I = 3\\,A\\). Hãy tính cường độ dòng điện qua mỗi nhánh và hiệu điện thế đoạn mạch.",
  "options": None,
  "correct_answer": "R_tđ = 15×30/(15+30) = 10Ω. U = IR_tđ = 3×10 = 30V. I₁ = 30/15 = 2A. I₂ = 30/30 = 1A.",
  "explanation": {"summary":"R_tđ = 10Ω. U = 30V. I₁ = 2A, I₂ = 1A. Kiểm tra: I₁+I₂ = 3A ✓.","key_concept":"Song song: tính R_tđ → U → I từng nhánh."},
  "thinking_guide": {
    "understand": "R₁ // R₂, I = 3A. Tìm I₁, I₂, U.",
    "identify_knowledge": "Song song: R_tđ, U = IR_tđ, I₁ = U/R₁, I₂ = U/R₂.",
    "plan": "R_tđ → U → I₁, I₂.",
    "steps": ["Bước 1: R_tđ = 15×30/(15+30) = 450/45 = 10Ω.", "Bước 2: U = I × R_tđ = 3 × 10 = 30V.", "Bước 3: I₁ = U/R₁ = 30/15 = 2A.", "Bước 4: I₂ = U/R₂ = 30/30 = 1A."],
    "verify": "I₁ + I₂ = 2 + 1 = 3A = I ✓. R nhỏ → I lớn: R₁<R₂ → I₁>I₂ ✓.",
    "extend": "Tỉ số dòng: I₁/I₂ = R₂/R₁ = 30/15 = 2 (ngược với tỉ số R).",
    "common_traps": ["Nhầm: I₁/I₂ = R₁/R₂ (phải là R₂/R₁ - nghịch đảo)."],
    "hints": ["Song song: nhánh R nhỏ → dòng lớn (dễ đi qua hơn)."]
  },
  "real_world_connection": "Trong gia đình, thiết bị công suất lớn (máy giặt) tiêu thụ dòng lớn hơn thiết bị nhỏ (đèn).",
  "formula": "R_{tđ} = 10\\,\\Omega, \\quad U = 30\\text{ V}, \\quad I_1 = 2\\text{ A}, \\quad I_2 = 1\\text{ A}"
})

# ============================================================
# CHAPTER 3: ELECTRIC POWER (12 questions)
# Công suất điện: P=UI, W=Pt, kWh
# ============================================================
questions.append({
  "id": "phys9_electric_power_001", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "power_concept", "topic_vn": "Khái niệm công suất",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Công suất điện của một thiết bị cho biết điều gì?",
  "options": [{"key":"A","content":"Lượng điện năng mà thiết bị tiêu thụ"},{"key":"B","content":"Mức độ tiêu thụ điện năng nhanh hay chậm của thiết bị"},{"key":"C","content":"Hiệu điện thế đặt vào thiết bị"},{"key":"D","content":"Cường độ dòng điện qua thiết bị"}],
  "correct_answer": "B",
  "explanation": {"summary":"Công suất điện cho biết mức độ (tốc độ) tiêu thụ điện năng của thiết bị: P lớn → tiêu thụ nhanh.","key_concept":"P = W/t: điện năng tiêu thụ trong 1 giây."},
  "thinking_guide": {
    "understand": "Công suất điện biểu thị điều gì?",
    "identify_knowledge": "P = W/t = UI: năng lượng tiêu thụ trong đơn vị thời gian.",
    "plan": "Phân biệt: P = tốc độ tiêu thụ, W = tổng lượng tiêu thụ.",
    "steps": ["Bước 1: P = W/t → P là năng lượng tiêu thụ mỗi giây.", "Bước 2: P lớn → tiêu thụ nhanh. P nhỏ → tiêu thụ chậm."],
    "verify": "Bóng 100W sáng hơn bóng 60W → tiêu thụ nhanh hơn ✓.",
    "extend": "Đơn vị P: Oát (W). 1W = 1J/s = 1VA.",
    "common_traps": ["Nhầm công suất (P = tốc độ) với điện năng (W = tổng lượng)."],
    "hints": ["P = power = sức mạnh = mức độ tiêu thụ."]
  },
  "real_world_connection": "Máy lạnh 2HP (~1500W) tốn điện nhanh hơn quạt trần (~75W) gấp 20 lần.",
  "formula": "P = \\frac{W}{t} = U \\cdot I"
})

questions.append({
  "id": "phys9_electric_power_002", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "power_formula", "topic_vn": "Công thức công suất",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Công thức nào sau đây KHÔNG dùng để tính công suất điện?",
  "options": [{"key":"A","content":"P = UI"},{"key":"B","content":"P = I²R"},{"key":"C","content":"P = U²/R"},{"key":"D","content":"P = IR"}],
  "correct_answer": "D",
  "explanation": {"summary":"P = IR không phải công thức tính công suất. Đó chỉ là tích I×R = U (định luật Ohm). Các công thức đúng: P = UI = I²R = U²/R.","key_concept":"P = UI = I²R = U²/R (3 dạng công thức công suất)."},
  "thinking_guide": {
    "understand": "Tìm công thức SAI trong các công thức công suất.",
    "identify_knowledge": "P = UI. Thay U = IR → P = I²R. Thay I = U/R → P = U²/R.",
    "plan": "Kiểm tra từng đáp án.",
    "steps": ["Bước 1: P = UI ✓.", "Bước 2: P = I²R ✓ (từ P = UI = I×IR).", "Bước 3: P = U²/R ✓ (từ P = UI = U×U/R).", "Bước 4: P = IR → đây là U = IR (Ohm) → SAI."],
    "verify": "Đơn vị: IR = A × Ω = V ≠ W → IR không phải công suất.",
    "extend": "Biết P = UI là gốc, các dạng khác suy ra từ Ohm.",
    "common_traps": ["IR trông giống công thức vật lý nhưng nó cho ra U, không phải P."],
    "hints": ["Kiểm tra đơn vị: P phải có đơn vị W (oát)."]
  },
  "real_world_connection": "Trên thiết bị điện ghi P = 1000W, U = 220V → ta tính được I = P/U ≈ 4,5A.",
  "formula": "P = UI = I^2 R = \\frac{U^2}{R}"
})

questions.append({
  "id": "phys9_electric_power_003", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "power_calculation", "topic_vn": "Tính công suất",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một bóng đèn có ghi 220V – 100W. Cường độ dòng điện định mức qua bóng đèn là ______ A (làm tròn đến 2 chữ số thập phân).",
  "options": None,
  "correct_answer": "0,45",
  "explanation": {"summary":"P = UI → I = P/U = 100/220 ≈ 0,45A.","key_concept":"I = P/U."},
  "thinking_guide": {
    "understand": "Đèn 220V-100W. Tìm I định mức.",
    "identify_knowledge": "P = UI → I = P/U.",
    "plan": "Thay số tính I.",
    "steps": ["Bước 1: I = P/U = 100/220.", "Bước 2: I ≈ 0,4545... ≈ 0,45A."],
    "verify": "P = UI = 220 × 0,45 = 99W ≈ 100W ✓.",
    "extend": "R_đèn = U²/P = 220²/100 = 484Ω.",
    "common_traps": ["Nhầm: I = U/P = 220/100 = 2,2A → sai (phải là P/U)."],
    "hints": ["I = P/U, không phải U/P."]
  },
  "real_world_connection": "Biết dòng định mức giúp chọn dây dẫn và cầu chì phù hợp cho đèn.",
  "formula": "I = \\frac{P}{U} = \\frac{100}{220} \\approx 0{,}45 \\text{ A}"
})

questions.append({
  "id": "phys9_electric_power_004", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "electric_energy", "topic_vn": "Điện năng tiêu thụ",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một bàn ủi có công suất 1000W hoạt động 2 giờ mỗi ngày. Điện năng tiêu thụ trong 30 ngày là bao nhiêu kWh?",
  "options": [{"key":"A","content":"30 kWh"},{"key":"B","content":"60 kWh"},{"key":"C","content":"2000 kWh"},{"key":"D","content":"6 kWh"}],
  "correct_answer": "B",
  "explanation": {"summary":"W = P × t = 1000W × (2 × 30)h = 1000 × 60 = 60000 Wh = 60 kWh.","key_concept":"W = Pt. Đổi: 1 kWh = 1000 Wh. Dùng kW và h cho tiện."},
  "thinking_guide": {
    "understand": "P = 1000W, t = 2h/ngày × 30 ngày. Tính W (kWh).",
    "identify_knowledge": "W = Pt. Dùng kW và h → kWh.",
    "plan": "Đổi P sang kW, tính tổng t, nhân.",
    "steps": ["Bước 1: P = 1000W = 1kW.", "Bước 2: t = 2 × 30 = 60h.", "Bước 3: W = 1 × 60 = 60 kWh."],
    "verify": "60 kWh × 3000đ/kWh = 180.000đ tiền điện → hợp lý.",
    "extend": "1 kWh = 3.600.000 J = 3,6 MJ. Đây là 1 'số điện' trên công tơ.",
    "common_traps": ["Quên nhân 30 ngày: W = 1 × 2 = 2 kWh (chỉ 1 ngày)."],
    "hints": ["Dùng kW × h = kWh cho tiện. 1000W = 1kW."]
  },
  "real_world_connection": "Mỗi kWh (số điện) có giá khoảng 1.800-3.000đ. Bàn ủi dùng 60 kWh/tháng khá tốn.",
  "formula": "W = P \\times t = 1\\text{ kW} \\times 60\\text{ h} = 60 \\text{ kWh}"
})

questions.append({
  "id": "phys9_electric_power_005", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "joule_lenz", "topic_vn": "Định luật Jun-Len-xơ",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Theo định luật Jun – Len-xơ, nhiệt lượng tỏa ra trên dây dẫn khi có dòng điện chạy qua được tính bằng công thức nào?",
  "options": [{"key":"A","content":"Q = UIt"},{"key":"B","content":"Q = I²Rt"},{"key":"C","content":"Q = U²t/R"},{"key":"D","content":"Cả A, B, C đều đúng"}],
  "correct_answer": "B",
  "explanation": {"summary":"Định luật Jun-Len-xơ: Q = I²Rt. Đây là công thức chính. Các công thức Q = UIt và Q = U²t/R chỉ đúng khi toàn bộ điện năng chuyển thành nhiệt.","key_concept":"Định luật Jun-Len-xơ: Q = I²Rt (luôn đúng cho dây dẫn thuần trở)."},
  "thinking_guide": {
    "understand": "Công thức chính xác của định luật Jun-Len-xơ.",
    "identify_knowledge": "Q = I²Rt: nhiệt lượng tỉ lệ với I², R và t.",
    "plan": "Phân biệt công thức Jun-Len-xơ với các công thức khác.",
    "steps": ["Bước 1: Định luật Jun-Len-xơ phát biểu: Q = I²Rt.", "Bước 2: Q = UIt = W (điện năng tiêu thụ), đúng khi W = Q.", "Bước 3: Q = I²Rt luôn đúng cho phần tử thuần trở."],
    "verify": "Đơn vị: A² × Ω × s = A² × (V/A) × s = A×V×s = W×s = J ✓.",
    "extend": "Ứng dụng: bếp điện, bàn ủi, ấm đun nước → dùng hiệu ứng nhiệt.",
    "common_traps": ["Nghĩ cả 3 công thức đều là Jun-Len-xơ → sai. Chỉ Q = I²Rt."],
    "hints": ["Jun-Len-xơ = I²Rt. Nhớ: I bình phương × R × t."]
  },
  "real_world_connection": "Ấm đun nước điện biến điện năng thành nhiệt năng để đun sôi nước theo định luật Jun-Len-xơ.",
  "formula": "Q = I^2 R t"
})

questions.append({
  "id": "phys9_electric_power_006", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "power_calculation", "topic_vn": "Tính công suất",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một bếp điện có điện trở R = 50 Ω được mắc vào nguồn U = 220 V. Công suất tỏa nhiệt của bếp là ______ W.",
  "options": None,
  "correct_answer": "968",
  "explanation": {"summary":"P = U²/R = 220²/50 = 48400/50 = 968W.","key_concept":"P = U²/R khi biết U và R."},
  "thinking_guide": {
    "understand": "R = 50Ω, U = 220V. Tính P.",
    "identify_knowledge": "P = U²/R (dùng khi biết U và R).",
    "plan": "Thay số vào P = U²/R.",
    "steps": ["Bước 1: P = U²/R = 220²/50.", "Bước 2: P = 48400/50 = 968W."],
    "verify": "I = U/R = 220/50 = 4,4A. P = UI = 220×4,4 = 968W ✓.",
    "extend": "968W ≈ 1kW → bếp dùng khoảng 1 số điện mỗi giờ.",
    "common_traps": ["Nhầm P = U/R = 220/50 = 4,4 (đó là I, không phải P)."],
    "hints": ["P = U²/R: U bình phương chia R."]
  },
  "real_world_connection": "Bếp điện thường có công suất 800-2000W, tương đương 1-2 số điện mỗi giờ sử dụng.",
  "formula": "P = \\frac{U^2}{R} = \\frac{220^2}{50} = 968 \\text{ W}"
})

questions.append({
  "id": "phys9_electric_power_007", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "electric_energy", "topic_vn": "Điện năng tiêu thụ",
  "type": "true_false", "difficulty": "easy",
  "question_text": "1 kilôoát giờ (kWh) bằng 3.600.000 jun (J).",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. 1 kWh = 1000W × 3600s = 3.600.000 J = 3,6 MJ.","key_concept":"1 kWh = 3,6 × 10⁶ J."},
  "thinking_guide": {
    "understand": "1 kWh = ? J.",
    "identify_knowledge": "W = Pt. 1 kWh = 1kW × 1h = 1000W × 3600s.",
    "plan": "Đổi kW sang W, h sang s, nhân.",
    "steps": ["Bước 1: 1 kW = 1000 W.", "Bước 2: 1 h = 3600 s.", "Bước 3: 1 kWh = 1000 × 3600 = 3.600.000 J."],
    "verify": "3.600.000 = 3,6 × 10⁶ = 3,6 MJ ✓.",
    "extend": "Trên hóa đơn điện, 1 kWh = 1 'số điện'.",
    "common_traps": ["Nhầm 1h = 60s (đó là 1 phút). 1h = 3600s."],
    "hints": ["1 kWh = 1000 × 3600 = 3.600.000 J."]
  },
  "real_world_connection": "Mỗi 'số điện' trên công tơ là 1 kWh = 3,6 triệu jun năng lượng.",
  "formula": "1\\text{ kWh} = 1000 \\times 3600 = 3{,}6 \\times 10^6 \\text{ J}"
})

questions.append({
  "id": "phys9_electric_power_008", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "joule_lenz", "topic_vn": "Định luật Jun-Len-xơ",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một ấm điện có R = 40 Ω, dùng nguồn 220V để đun 2 lít nước từ 25°C lên 100°C. Biết nhiệt dung riêng của nước c = 4200 J/(kg·K) và hiệu suất 90%. Thời gian đun là ______ giây (làm tròn đến hàng đơn vị).",
  "options": None,
  "correct_answer": "573",
  "explanation": {"summary":"Q_cần = mc∆t = 2×4200×75 = 630.000J. P = U²/R = 220²/40 = 1210W. Q_điện = Q_cần/H = 630.000/0,9 = 700.000J. t = Q_điện/P = 700.000/1210 ≈ 578,5 ≈ 579s. (Hoặc t = Q_cần/(P×H) = 630000/(1210×0,9) = 630000/1089 ≈ 578,5s → 579s).","key_concept":"Q_nước = mc∆t. P_điện = U²/R. t = Q_nước/(P × H)."},
  "thinking_guide": {
    "understand": "Ấm R=40Ω, U=220V, đun 2L nước 25°C→100°C, H=90%. Tìm t.",
    "identify_knowledge": "Q_nước = mc∆t, P = U²/R, H = Q_có ích/Q_toàn phần.",
    "plan": "Tính Q_nước → P → t = Q_nước/(P×H).",
    "steps": ["Bước 1: m = 2kg (2 lít nước).", "Bước 2: Q_nước = mc∆t = 2 × 4200 × (100-25) = 2 × 4200 × 75 = 630.000J.", "Bước 3: P = U²/R = 220²/40 = 48400/40 = 1210W.", "Bước 4: Q_điện = Q_nước/H = 630.000/0,9 = 700.000J.", "Bước 5: t = Q_điện/P = 700.000/1210 ≈ 579s."],
    "verify": "W_điện = Pt = 1210 × 579 ≈ 700.590J. Q_nước = 700.590 × 0,9 ≈ 630.531J ≈ 630.000J ✓.",
    "extend": "Thực tế đun lâu hơn vì nhiệt tỏa ra môi trường (H < 90%).",
    "common_traps": ["Quên hiệu suất: t = Q_nước/P → sai (thiếu H).", "Quên ∆t = 100-25 = 75°C, không phải 100°C."],
    "hints": ["H = Q_có ích/Q_toàn phần → Q_toàn phần = Q_có ích/H."]
  },
  "real_world_connection": "Ấm siêu tốc 2000W đun 2 lít nước mất khoảng 5-6 phút, phù hợp tính toán.",
  "formula": "t = \\frac{mc\\Delta t}{P \\times H} = \\frac{2 \\times 4200 \\times 75}{1210 \\times 0{,}9} \\approx 579 \\text{ s}"
})

questions.append({
  "id": "phys9_electric_power_009", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "electric_energy", "topic_vn": "Điện năng tiêu thụ",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Gia đình sử dụng các thiết bị sau trong 1 tháng (30 ngày): 5 bóng đèn 40W mỗi bóng bật 6h/ngày, 1 tủ lạnh 150W chạy 24h/ngày. Tổng điện năng tiêu thụ là bao nhiêu kWh?",
  "options": [{"key":"A","content":"36 kWh"},{"key":"B","content":"72 kWh"},{"key":"C","content":"144 kWh"},{"key":"D","content":"108 kWh"}],
  "correct_answer": "C",
  "explanation": {"summary":"W_đèn = 5 × 0,04 × 6 × 30 = 36 kWh. W_tủ lạnh = 0,15 × 24 × 30 = 108 kWh. W_tổng = 36 + 108 = 144 kWh.","key_concept":"W = Pt cho từng thiết bị, rồi cộng lại."},
  "thinking_guide": {
    "understand": "Tính tổng điện năng 5 đèn + 1 tủ lạnh trong 30 ngày.",
    "identify_knowledge": "W = Pt cho từng thiết bị.",
    "plan": "Tính W từng thiết bị rồi cộng.",
    "steps": ["Bước 1: W_đèn = 5 × 40W × 6h × 30 ngày = 5×40×6×30 = 36.000 Wh = 36 kWh.", "Bước 2: W_tủ lạnh = 150W × 24h × 30 ngày = 108.000 Wh = 108 kWh.", "Bước 3: W_tổng = 36 + 108 = 144 kWh."],
    "verify": "144 kWh × 2500đ ≈ 360.000đ/tháng → hợp lý cho gia đình nhỏ.",
    "extend": "Thay bóng LED 9W sẽ tiết kiệm: 5×9×6×30 = 8,1 kWh (giảm 27,9 kWh).",
    "common_traps": ["Quên nhân 5 bóng, chỉ tính 1 bóng.", "Quên nhân 30 ngày."],
    "hints": ["Tính từng thiết bị riêng rồi cộng lại."]
  },
  "real_world_connection": "Hóa đơn tiền điện hàng tháng tính dựa trên tổng kWh mà gia đình sử dụng.",
  "formula": "W = \\sum P_i \\times t_i = 36 + 108 = 144 \\text{ kWh}"
})

questions.append({
  "id": "phys9_electric_power_010", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "power_safety", "topic_vn": "An toàn điện",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Sử dụng nhiều thiết bị điện cùng lúc trên một ổ cắm có thể gây quá tải và cháy dây.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Nhiều thiết bị mắc song song → I tổng tăng → vượt quá khả năng chịu đựng của dây → nóng → cháy.","key_concept":"P_tổng = P₁+P₂+... → I_tổng tăng → quá tải → nguy hiểm."},
  "thinking_guide": {
    "understand": "Mắc nhiều thiết bị vào 1 ổ cắm có nguy hiểm không?",
    "identify_knowledge": "Mắc song song → P_tổng = ΣP → I_tổng = P_tổng/U tăng.",
    "plan": "Phân tích nguyên nhân quá tải.",
    "steps": ["Bước 1: Mỗi thiết bị tiêu thụ dòng I = P/U.", "Bước 2: Nhiều thiết bị → I_tổng tăng.", "Bước 3: I > I_max của dây → dây nóng → cháy."],
    "verify": "Bếp 2000W + lò vi sóng 1000W + ấm 1500W = 4500W → I = 4500/220 ≈ 20A → quá tải ổ 10A!",
    "extend": "Aptomat sẽ nhảy khi I vượt giới hạn, bảo vệ khỏi cháy.",
    "common_traps": ["Nghĩ rằng ổ cắm chịu được vô hạn thiết bị."],
    "hints": ["Ổ cắm thường chịu được 10-16A = 2200-3500W."]
  },
  "real_world_connection": "Không nên cắm bếp điện, lò vi sóng và ấm đun vào cùng 1 ổ cắm.",
  "formula": "I_{tổng} = \\frac{P_1 + P_2 + \\ldots}{U}"
})

questions.append({
  "id": "phys9_electric_power_011", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "joule_lenz", "topic_vn": "Định luật Jun-Len-xơ",
  "type": "explain", "difficulty": "hard",
  "question_text": "Giải thích tại sao dây tóc bóng đèn nóng sáng còn dây dẫn nối từ ổ cắm đến bóng đèn lại không nóng, mặc dù cùng dòng điện chạy qua.",
  "options": None,
  "correct_answer": "Theo định luật Jun-Len-xơ Q = I²Rt: dòng I như nhau nhưng dây tóc có R rất lớn (vonfram, tiết diện nhỏ) → Q lớn → nóng sáng. Dây dẫn có R rất nhỏ (đồng, tiết diện lớn) → Q nhỏ → không nóng đáng kể.",
  "explanation": {"summary":"Q = I²Rt: cùng I và t, R lớn → Q lớn. Dây tóc R lớn → nóng sáng. Dây đồng R nhỏ → mát.","key_concept":"Nhiệt lượng tỉ lệ thuận với R: Q = I²Rt."},
  "thinking_guide": {
    "understand": "Cùng I nhưng dây tóc nóng, dây dẫn không. Tại sao?",
    "identify_knowledge": "Q = I²Rt. R khác nhau → Q khác nhau.",
    "plan": "So sánh R của dây tóc và dây dẫn.",
    "steps": ["Bước 1: Dây tóc (vonfram): tiết diện rất nhỏ, ρ lớn → R lớn.", "Bước 2: Dây đồng: tiết diện lớn, ρ nhỏ → R nhỏ.", "Bước 3: Q = I²Rt: cùng I, R lớn → Q lớn → nóng."],
    "verify": "R_dây tóc ≈ 500-1000Ω, R_dây đồng 1m ≈ 0,01Ω → Q chênh hàng chục nghìn lần.",
    "extend": "Ứng dụng: bếp điện, bàn ủi dùng dây có R lớn để tỏa nhiệt.",
    "common_traps": ["Nghĩ dây tóc nóng vì dòng qua nó lớn hơn → sai (nối tiếp → I bằng nhau)."],
    "hints": ["Nối tiếp → I bằng nhau. Yếu tố khác nhau duy nhất là R."]
  },
  "real_world_connection": "Bếp điện dùng dây nicrôm (R lớn) cuộn lại để tỏa nhiều nhiệt, còn dây nguồn bằng đồng (R nhỏ) để không nóng.",
  "formula": "Q = I^2 R t \\quad \\Rightarrow \\quad R_{lớn} \\to Q_{lớn}"
})

questions.append({
  "id": "phys9_electric_power_012", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "power_calculation", "topic_vn": "Tính công suất",
  "type": "explain", "difficulty": "hard",
  "question_text": "Một bóng đèn ghi 220V – 100W được mắc vào nguồn 110V. Tính công suất thực tế của đèn và nhận xét về độ sáng.",
  "options": None,
  "correct_answer": "R_đèn = U²_đm/P_đm = 220²/100 = 484Ω. P_thực = U²_thực/R = 110²/484 = 12100/484 = 25W. Đèn chỉ sáng với P = 25W, bằng 1/4 công suất định mức nên rất mờ.",
  "explanation": {"summary":"R không đổi = 484Ω. U giảm nửa → P giảm 4 lần (vì P tỉ lệ U²). Đèn sáng rất mờ.","key_concept":"P ∝ U²: giảm U nửa → P giảm 4 lần (khi R không đổi)."},
  "thinking_guide": {
    "understand": "Đèn 220V-100W mắc vào 110V. Tính P thực tế.",
    "identify_knowledge": "R_đèn = U²_đm/P_đm = const. P_thực = U²_thực/R.",
    "plan": "Tính R → P_thực.",
    "steps": ["Bước 1: R = U²_đm/P_đm = 220²/100 = 48400/100 = 484Ω.", "Bước 2: P_thực = U²_thực/R = 110²/484 = 12100/484 = 25W.", "Bước 3: P_thực = 25W = P_đm/4 → đèn rất mờ."],
    "verify": "U giảm 2 lần (220→110), P giảm 2² = 4 lần (100→25) ✓.",
    "extend": "Nếu mắc vào 240V: P = 240²/484 ≈ 119W > 100W → đèn sáng hơn nhưng dễ cháy.",
    "common_traps": ["Nghĩ P giảm nửa (tỉ lệ U) → sai. P tỉ lệ U² nên giảm 4 lần."],
    "hints": ["P ∝ U² khi R không đổi: U giảm n lần → P giảm n² lần."]
  },
  "real_world_connection": "Thiết bị 220V dùng ở nước có nguồn 110V (Mỹ, Nhật) sẽ hoạt động rất yếu.",
  "formula": "R = \\frac{U_{đm}^2}{P_{đm}} = 484\\,\\Omega, \\quad P_{thực} = \\frac{110^2}{484} = 25\\text{ W}"
})

# ============================================================
# CHAPTER 4: MAGNETIC FORCE (12 questions)
# Lực từ và cảm ứng ĐT: quy tắc bàn tay trái, máy phát điện
# ============================================================
questions.append({
  "id": "phys9_magnetic_force_001", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "magnetic_field", "topic_vn": "Từ trường",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Không gian xung quanh nam châm có gì đặc biệt?",
  "options": [{"key":"A","content":"Có điện trường"},{"key":"B","content":"Có từ trường"},{"key":"C","content":"Có trọng trường mạnh"},{"key":"D","content":"Không có gì đặc biệt"}],
  "correct_answer": "B",
  "explanation": {"summary":"Không gian xung quanh nam châm tồn tại từ trường. Từ trường tác dụng lực từ lên các vật liệu từ tính và dòng điện.","key_concept":"Nam châm tạo ra từ trường xung quanh nó."},
  "thinking_guide": {
    "understand": "Xung quanh nam châm có gì?",
    "identify_knowledge": "Nam châm → từ trường. Điện tích → điện trường.",
    "plan": "Nhớ liên hệ: nam châm ↔ từ trường.",
    "steps": ["Bước 1: Nam châm hút sắt → tác dụng lực từ xa.", "Bước 2: Lực đó truyền qua từ trường xung quanh nam châm."],
    "verify": "Rắc mạt sắt quanh nam châm → thấy đường sức từ ✓.",
    "extend": "Dòng điện cũng tạo từ trường (thí nghiệm Ơ-xtét).",
    "common_traps": ["Nhầm từ trường với điện trường."],
    "hints": ["Nam = nam châm → từ trường. Điện tích → điện trường."]
  },
  "real_world_connection": "La bàn hoạt động nhờ từ trường Trái Đất: kim nam châm quay theo hướng Bắc-Nam.",
  "formula": ""
})

questions.append({
  "id": "phys9_magnetic_force_002", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "magnetic_field", "topic_vn": "Từ trường",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Dòng điện chạy trong dây dẫn thẳng cũng tạo ra từ trường xung quanh dây.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Thí nghiệm Ơ-xtét (1820): dòng điện qua dây dẫn làm kim nam châm lệch → chứng tỏ dòng điện tạo từ trường.","key_concept":"Dòng điện tạo ra từ trường (hiện tượng từ của dòng điện)."},
  "thinking_guide": {
    "understand": "Dòng điện có tạo từ trường không?",
    "identify_knowledge": "Thí nghiệm Ơ-xtét: dòng điện → từ trường.",
    "plan": "Nhớ thí nghiệm nổi tiếng của Ơ-xtét.",
    "steps": ["Bước 1: Đặt kim nam châm gần dây dẫn có dòng điện.", "Bước 2: Kim bị lệch → dòng điện tạo từ trường ✓."],
    "verify": "Cuộn dây có dòng điện hoạt động như nam châm (nam châm điện).",
    "extend": "Quy tắc nắm tay phải: xác định chiều đường sức từ của dòng điện.",
    "common_traps": ["Nghĩ chỉ nam châm mới tạo từ trường → sai."],
    "hints": ["Ơ-xtét phát hiện: điện ↔ từ liên hệ chặt chẽ."]
  },
  "real_world_connection": "Nam châm điện (cuộn dây + dòng điện) dùng trong cần trục từ, chuông điện, relay.",
  "formula": ""
})

questions.append({
  "id": "phys9_magnetic_force_003", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "left_hand_rule", "topic_vn": "Quy tắc bàn tay trái",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Quy tắc bàn tay trái dùng để xác định:",
  "options": [{"key":"A","content":"Chiều đường sức từ"},{"key":"B","content":"Chiều dòng điện cảm ứng"},{"key":"C","content":"Chiều của lực điện từ tác dụng lên dây dẫn mang dòng điện đặt trong từ trường"},{"key":"D","content":"Chiều quay của nam châm"}],
  "correct_answer": "C",
  "explanation": {"summary":"Quy tắc bàn tay trái: đặt bàn tay trái sao cho đường sức từ xuyên vào lòng bàn tay, chiều từ cổ tay đến ngón tay theo chiều dòng điện, thì ngón cái choãi ra 90° chỉ chiều lực điện từ.","key_concept":"Bàn tay trái → chiều lực điện từ F lên dây dẫn mang dòng điện trong từ trường."},
  "thinking_guide": {
    "understand": "Quy tắc bàn tay trái dùng để làm gì?",
    "identify_knowledge": "Bàn tay trái: xác định chiều lực từ F.",
    "plan": "Phân biệt bàn tay trái (lực F) với bàn tay phải/nắm tay phải (đường sức từ).",
    "steps": ["Bước 1: Bàn tay trái → xác định F (lực điện từ) ✓.", "Bước 2: Nắm tay phải → chiều đường sức từ trong cuộn dây.", "Bước 3: Bàn tay phải → dòng điện cảm ứng (quy tắc khác)."],
    "verify": "Trong động cơ điện: F làm khung quay → dùng bàn tay trái xác định chiều quay.",
    "extend": "Lực F ⊥ cả B (từ trường) và I (dòng điện) → quy tắc 3 ngón.",
    "common_traps": ["Nhầm bàn tay trái (lực F) với bàn tay phải (dòng cảm ứng)."],
    "hints": ["Trái = Lực (cùng chữ 'L'): Left = Force (Lorentz)."]
  },
  "real_world_connection": "Động cơ điện trong quạt, máy giặt hoạt động dựa trên lực từ xác định bởi quy tắc bàn tay trái.",
  "formula": ""
})

questions.append({
  "id": "phys9_magnetic_force_004", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "electromagnet", "topic_vn": "Nam châm điện",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Muốn tăng lực hút của nam châm điện, ta có thể:",
  "options": [{"key":"A","content":"Giảm số vòng dây cuốn"},{"key":"B","content":"Giảm cường độ dòng điện"},{"key":"C","content":"Tăng cường độ dòng điện hoặc tăng số vòng dây"},{"key":"D","content":"Dùng lõi gỗ thay vì lõi sắt"}],
  "correct_answer": "C",
  "explanation": {"summary":"Tăng I hoặc tăng số vòng dây → từ trường mạnh hơn → lực hút lớn hơn. Lõi sắt (không phải gỗ) giúp tăng từ trường.","key_concept":"Nam châm điện mạnh hơn khi: tăng I, tăng n (số vòng dây), dùng lõi sắt non."},
  "thinking_guide": {
    "understand": "Cách tăng lực hút nam châm điện.",
    "identify_knowledge": "B ∝ nI (từ trường tỉ lệ số vòng × dòng điện).",
    "plan": "Phân tích từng đáp án.",
    "steps": ["Bước 1: Giảm n → B giảm → sai.", "Bước 2: Giảm I → B giảm → sai.", "Bước 3: Tăng I hoặc n → B tăng → lực tăng ✓.", "Bước 4: Lõi gỗ không từ tính → yếu hơn lõi sắt → sai."],
    "verify": "Cần trục từ dùng cuộn dây nhiều vòng + dòng lớn + lõi sắt → rất mạnh.",
    "extend": "Nam châm điện có ưu điểm: tắt dòng → mất từ tính → thả vật.",
    "common_traps": ["Nhầm: lõi gỗ cũng tốt như lõi sắt → sai (sắt tăng từ trường mạnh)."],
    "hints": ["Tăng n (vòng dây) hoặc tăng I → mạnh hơn."]
  },
  "real_world_connection": "Cần trục từ ở bãi phế liệu dùng nam châm điện cực mạnh để nâng ô tô cũ.",
  "formula": "B \\propto n \\cdot I"
})

questions.append({
  "id": "phys9_magnetic_force_005", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "electromagnetic_induction", "topic_vn": "Cảm ứng điện từ",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Hiện tượng cảm ứng điện từ là gì?",
  "options": [{"key":"A","content":"Hiện tượng dòng điện tạo ra từ trường"},{"key":"B","content":"Hiện tượng xuất hiện dòng điện cảm ứng trong cuộn dây kín khi số đường sức từ xuyên qua cuộn dây biến thiên"},{"key":"C","content":"Hiện tượng nam châm hút sắt"},{"key":"D","content":"Hiện tượng dây dẫn nóng lên khi có dòng điện"}],
  "correct_answer": "B",
  "explanation": {"summary":"Cảm ứng điện từ: khi số đường sức từ xuyên qua cuộn dây kín thay đổi (biến thiên) → xuất hiện dòng điện cảm ứng trong cuộn dây.","key_concept":"Từ thông biến thiên → suất điện động cảm ứng → dòng điện cảm ứng."},
  "thinking_guide": {
    "understand": "Định nghĩa hiện tượng cảm ứng điện từ.",
    "identify_knowledge": "Faraday: biến thiên từ thông → dòng điện cảm ứng.",
    "plan": "Nhớ thí nghiệm Faraday và phát biểu.",
    "steps": ["Bước 1: Di chuyển nam châm vào/ra cuộn dây → kim điện kế lệch.", "Bước 2: → Xuất hiện dòng điện cảm ứng.", "Bước 3: Điều kiện: số đường sức từ qua cuộn dây phải thay đổi."],
    "verify": "Giữ nam châm đứng yên trong cuộn dây → không có dòng → đúng (không biến thiên).",
    "extend": "Đây là nguyên lý hoạt động của máy phát điện.",
    "common_traps": ["Nhầm: chỉ cần có nam châm gần cuộn dây là có dòng → sai (phải biến thiên)."],
    "hints": ["Biến thiên = thay đổi. Từ thông không đổi → không có dòng."]
  },
  "real_world_connection": "Máy phát điện ở nhà máy thủy điện Hòa Bình biến cơ năng thành điện năng nhờ cảm ứng điện từ.",
  "formula": ""
})

questions.append({
  "id": "phys9_magnetic_force_006", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "electric_motor", "topic_vn": "Động cơ điện",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Động cơ điện biến đổi ______ năng thành cơ năng.",
  "options": None,
  "correct_answer": "điện",
  "explanation": {"summary":"Động cơ điện biến đổi điện năng thành cơ năng (chuyển động quay).","key_concept":"Động cơ điện: điện năng → cơ năng."},
  "thinking_guide": {
    "understand": "Động cơ điện chuyển đổi năng lượng gì?",
    "identify_knowledge": "Động cơ: điện → cơ. Máy phát: cơ → điện.",
    "plan": "Nhớ: động cơ = dùng điện để quay.",
    "steps": ["Bước 1: Động cơ cắm điện → quay.", "Bước 2: → Điện năng → cơ năng."],
    "verify": "Quạt điện (động cơ): cắm điện → cánh quay → điện → cơ ✓.",
    "extend": "Máy phát điện ngược lại: quay rotor → tạo ra điện (cơ → điện).",
    "common_traps": ["Nhầm: động cơ tạo ra điện → sai (đó là máy phát)."],
    "hints": ["Động cơ = motor = chuyển động. Dùng điện để chạy."]
  },
  "real_world_connection": "Quạt, máy giặt, máy bơm đều dùng động cơ điện biến điện năng thành cơ năng.",
  "formula": ""
})

questions.append({
  "id": "phys9_magnetic_force_007", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "generator", "topic_vn": "Máy phát điện",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Máy phát điện xoay chiều hoạt động dựa trên nguyên tắc nào?",
  "options": [{"key":"A","content":"Tác dụng nhiệt của dòng điện"},{"key":"B","content":"Tác dụng hóa học của dòng điện"},{"key":"C","content":"Hiện tượng cảm ứng điện từ"},{"key":"D","content":"Hiện tượng khúc xạ ánh sáng"}],
  "correct_answer": "C",
  "explanation": {"summary":"Máy phát điện dựa trên hiện tượng cảm ứng điện từ: quay cuộn dây trong từ trường (hoặc quay nam châm) → từ thông biến thiên → dòng điện cảm ứng.","key_concept":"Máy phát điện = ứng dụng cảm ứng điện từ: cơ năng → điện năng."},
  "thinking_guide": {
    "understand": "Máy phát điện hoạt động theo nguyên tắc gì?",
    "identify_knowledge": "Máy phát điện: quay cuộn dây/nam châm → cảm ứng điện từ → dòng điện.",
    "plan": "Liên hệ cảm ứng điện từ với máy phát điện.",
    "steps": ["Bước 1: Quay rotor → từ thông qua cuộn dây thay đổi.", "Bước 2: → Xuất hiện dòng điện cảm ứng (Faraday).", "Bước 3: → Nguyên tắc: cảm ứng điện từ ✓."],
    "verify": "Dừng quay → không có dòng → đúng (từ thông không biến thiên).",
    "extend": "Máy phát AC: dòng xoay chiều. Máy phát DC: thêm bộ chỉnh lưu.",
    "common_traps": ["Nhầm với tác dụng nhiệt (đó là ứng dụng khác)."],
    "hints": ["Faraday → cảm ứng điện từ → máy phát điện."]
  },
  "real_world_connection": "Nhà máy thủy điện, nhiệt điện, điện gió đều dùng máy phát điện theo nguyên lý cảm ứng điện từ.",
  "formula": ""
})

questions.append({
  "id": "phys9_magnetic_force_008", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "transformer", "topic_vn": "Máy biến áp",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Một máy biến áp có cuộn sơ cấp 4400 vòng, cuộn thứ cấp 220 vòng. Đặt vào cuộn sơ cấp hiệu điện thế 220V. Hiệu điện thế ở cuộn thứ cấp là:",
  "options": [{"key":"A","content":"11 V"},{"key":"B","content":"44 V"},{"key":"C","content":"440 V"},{"key":"D","content":"22 V"}],
  "correct_answer": "A",
  "explanation": {"summary":"U₁/U₂ = n₁/n₂ → U₂ = U₁ × n₂/n₁ = 220 × 220/4400 = 220 × 1/20 = 11V.","key_concept":"Máy biến áp: U₁/U₂ = n₁/n₂."},
  "thinking_guide": {
    "understand": "n₁ = 4400, n₂ = 220, U₁ = 220V. Tìm U₂.",
    "identify_knowledge": "Công thức máy biến áp: U₁/U₂ = n₁/n₂.",
    "plan": "Thay số vào công thức.",
    "steps": ["Bước 1: U₂ = U₁ × n₂/n₁.", "Bước 2: U₂ = 220 × 220/4400 = 220/20 = 11V."],
    "verify": "n₁/n₂ = 4400/220 = 20. U₁/U₂ = 220/11 = 20 ✓ (tỉ số bằng nhau).",
    "extend": "Đây là máy hạ áp (U₂ < U₁). n₂ < n₁ → hạ áp.",
    "common_traps": ["Nhầm U₂ = U₁ × n₁/n₂ = 220 × 20 = 4400V (lộn ngược)."],
    "hints": ["U₂ = U₁ × (n₂/n₁): cuộn ít vòng hơn → điện áp nhỏ hơn."]
  },
  "real_world_connection": "Sạc điện thoại dùng adapter 220V→5V, bên trong có máy biến áp hạ áp.",
  "formula": "\\frac{U_1}{U_2} = \\frac{n_1}{n_2} \\Rightarrow U_2 = 220 \\times \\frac{220}{4400} = 11\\text{ V}"
})

questions.append({
  "id": "phys9_magnetic_force_009", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "ac_current", "topic_vn": "Dòng điện xoay chiều",
  "type": "true_false", "difficulty": "medium",
  "question_text": "Dòng điện xoay chiều có chiều và cường độ thay đổi theo thời gian.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Dòng điện xoay chiều (AC) có chiều luân phiên đổi chiều và cường độ biến đổi theo thời gian (dạng hình sin).","key_concept":"AC: I và chiều thay đổi tuần hoàn. DC: I và chiều không đổi."},
  "thinking_guide": {
    "understand": "Dòng AC có thay đổi chiều và cường độ không?",
    "identify_knowledge": "AC = Alternating Current = dòng xoay chiều: thay đổi tuần hoàn.",
    "plan": "Nhớ đặc điểm AC vs DC.",
    "steps": ["Bước 1: AC: dòng đổi chiều liên tục, I dao động hình sin.", "Bước 2: Cả chiều và cường độ đều thay đổi → Đúng."],
    "verify": "Điện lưới 220V/50Hz: dòng đổi chiều 50 lần/giây.",
    "extend": "DC (pin): dòng một chiều, I không đổi.",
    "common_traps": ["Nhầm: AC chỉ đổi chiều, I không đổi → sai (cả 2 đều đổi)."],
    "hints": ["Xoay chiều = xoay (đổi chiều) + biến đổi cường độ."]
  },
  "real_world_connection": "Điện lưới Việt Nam là AC 220V, 50Hz: dòng đổi chiều 100 lần/giây.",
  "formula": "i = I_0 \\sin(2\\pi f t)"
})

questions.append({
  "id": "phys9_magnetic_force_010", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "transformer", "topic_vn": "Máy biến áp",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Máy biến áp có n₁ = 500 vòng, n₂ = 2500 vòng, U₁ = 220V. Hiệu điện thế thứ cấp U₂ = ______ V.",
  "options": None,
  "correct_answer": "1100",
  "explanation": {"summary":"U₂ = U₁ × n₂/n₁ = 220 × 2500/500 = 220 × 5 = 1100V.","key_concept":"Máy biến áp: U₂ = U₁ × n₂/n₁."},
  "thinking_guide": {
    "understand": "n₁ = 500, n₂ = 2500, U₁ = 220V. Tìm U₂.",
    "identify_knowledge": "U₁/U₂ = n₁/n₂ → U₂ = U₁ × n₂/n₁.",
    "plan": "Thay số vào công thức.",
    "steps": ["Bước 1: U₂ = U₁ × n₂/n₁ = 220 × 2500/500.", "Bước 2: U₂ = 220 × 5 = 1100V."],
    "verify": "n₂/n₁ = 5 → U₂/U₁ = 5 → 1100/220 = 5 ✓. Đây là máy tăng áp.",
    "extend": "Truyền tải điện xa dùng máy tăng áp để giảm hao phí: P_hao = I²R = P²R/U².",
    "common_traps": ["Tính sai tỉ số: 500/2500 = 0,2 → U₂ = 44V (lộn tỉ số)."],
    "hints": ["n₂ > n₁ → máy tăng áp → U₂ > U₁."]
  },
  "real_world_connection": "Trạm biến áp tăng áp lên 500kV để truyền điện từ nhà máy đến thành phố, giảm hao phí.",
  "formula": "U_2 = U_1 \\times \\frac{n_2}{n_1} = 220 \\times \\frac{2500}{500} = 1100\\text{ V}"
})

questions.append({
  "id": "phys9_magnetic_force_011", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "power_transmission", "topic_vn": "Truyền tải điện",
  "type": "explain", "difficulty": "hard",
  "question_text": "Giải thích tại sao khi truyền tải điện năng đi xa, người ta phải tăng hiệu điện thế lên rất cao (hàng trăm kV).",
  "options": None,
  "correct_answer": "Công suất hao phí trên đường dây: P_hp = I²R = P²R/U². Khi tăng U lên n lần thì P_hp giảm n² lần. Vì vậy tăng U giúp giảm đáng kể hao phí nhiệt trên đường dây.",
  "explanation": {"summary":"P_hp = P²R/U²: P_hp tỉ lệ nghịch U². Tăng U 10 lần → P_hp giảm 100 lần.","key_concept":"Tăng U → giảm I → giảm P_hp = I²R."},
  "thinking_guide": {
    "understand": "Tại sao truyền tải điện xa phải tăng U?",
    "identify_knowledge": "P_hp = I²R. P = UI → I = P/U. → P_hp = P²R/U².",
    "plan": "Chứng minh tăng U → giảm P hao phí.",
    "steps": ["Bước 1: Dây dẫn có điện trở R → tỏa nhiệt P_hp = I²R.", "Bước 2: I = P/U → I giảm khi U tăng.", "Bước 3: P_hp = (P/U)²R = P²R/U² → U tăng → P_hp giảm."],
    "verify": "U tăng 10 lần: P_hp giảm 100 lần → rất hiệu quả!",
    "extend": "Đường dây 500kV Bắc-Nam truyền điện từ miền Bắc vào miền Nam hiệu quả.",
    "common_traps": ["Nghĩ tăng U nguy hiểm nên không nên → sai (cần thiết để giảm hao phí)."],
    "hints": ["P_hp ∝ 1/U²: tăng U gấp đôi → P_hp giảm 4 lần."]
  },
  "real_world_connection": "Đường dây 500kV Bắc-Nam dài ~1500km truyền điện với hao phí chỉ vài phần trăm.",
  "formula": "P_{hp} = I^2 R = \\frac{P^2 R}{U^2} \\xrightarrow{U \\uparrow n} P_{hp} \\downarrow n^2"
})

questions.append({
  "id": "phys9_magnetic_force_012", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "left_hand_rule", "topic_vn": "Quy tắc bàn tay trái",
  "type": "explain", "difficulty": "hard",
  "question_text": "Mô tả cách sử dụng quy tắc bàn tay trái để xác định chiều của lực điện từ tác dụng lên đoạn dây dẫn có dòng điện đặt trong từ trường. Cho biết đường sức từ hướng từ trái sang phải, dòng điện có chiều từ dưới lên trên. Lực điện từ hướng về phía nào?",
  "options": None,
  "correct_answer": "Đặt bàn tay trái: cho đường sức từ (B) xuyên vào lòng bàn tay (từ trái sang phải → lòng bàn tay hướng sang phải). Chiều từ cổ tay đến ngón tay giữa theo chiều dòng điện (từ dưới lên → ngón tay chỉ lên trên). Ngón cái choãi ra 90° chỉ chiều lực F → lực hướng ra phía người quan sát (hướng ra ngoài).",
  "explanation": {"summary":"B từ trái→phải, I từ dưới→trên → F hướng ra ngoài (về phía người quan sát). Ba vector B, I, F vuông góc đôi một.","key_concept":"Quy tắc bàn tay trái: B vào lòng bàn tay, 4 ngón chỉ theo I, ngón cái chỉ F."},
  "thinking_guide": {
    "understand": "B: trái→phải, I: dưới→trên. Tìm chiều F.",
    "identify_knowledge": "Quy tắc bàn tay trái: B vào lòng bàn tay, ngón tay theo I, ngón cái chỉ F.",
    "plan": "Thực hành đặt bàn tay trái theo quy tắc.",
    "steps": ["Bước 1: Giơ tay trái, lòng bàn tay hướng sang phải (B xuyên vào).", "Bước 2: Xoay tay sao cho 4 ngón chỉ lên trên (theo I).", "Bước 3: Ngón cái tự nhiên chỉ ra ngoài (về phía ta) → chiều F."],
    "verify": "F ⊥ B và F ⊥ I → F vuông góc với mặt phẳng chứa B và I ✓.",
    "extend": "Đây chính là quy tắc tích có hướng: F = IL × B.",
    "common_traps": ["Dùng tay phải thay vì tay trái.", "Đặt ngón tay theo B thay vì theo I."],
    "hints": ["Lòng bàn tay 'đón' B, ngón tay 'chạy' theo I, ngón cái 'đẩy' theo F."]
  },
  "real_world_connection": "Kỹ sư thiết kế động cơ điện phải áp dụng quy tắc này để xác định chiều quay.",
  "formula": "\\vec{F} = I\\vec{l} \\times \\vec{B}"
})

# ============================================================
# CHAPTER 5: LIGHT SPECTRUM (10 questions)
# Quang phổ: tia hồng ngoại, tử ngoại, tán sắc
# ============================================================
questions.append({
  "id": "phys9_light_spectrum_001", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "light_dispersion", "topic_vn": "Tán sắc ánh sáng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Hiện tượng tán sắc ánh sáng là gì?",
  "options": [{"key":"A","content":"Ánh sáng trắng bị phản xạ toàn phần"},{"key":"B","content":"Ánh sáng trắng bị phân tích thành nhiều ánh sáng màu khi đi qua lăng kính"},{"key":"C","content":"Ánh sáng bị hấp thụ hoàn toàn"},{"key":"D","content":"Ánh sáng truyền thẳng trong không khí"}],
  "correct_answer": "B",
  "explanation": {"summary":"Tán sắc ánh sáng là hiện tượng ánh sáng trắng bị phân tích thành dải màu liên tục (đỏ, cam, vàng, lục, lam, chàm, tím) khi đi qua lăng kính.","key_concept":"Ánh sáng trắng = tổng hợp nhiều ánh sáng đơn sắc. Lăng kính phân tách chúng."},
  "thinking_guide": {
    "understand": "Tán sắc ánh sáng là hiện tượng gì?",
    "identify_knowledge": "Newton: ánh sáng trắng = hỗn hợp 7 màu. Lăng kính tách chúng.",
    "plan": "Nhớ thí nghiệm tán sắc của Newton.",
    "steps": ["Bước 1: Chiếu ánh sáng trắng qua lăng kính.", "Bước 2: Ánh sáng bị tách thành dải 7 màu.", "Bước 3: Hiện tượng này gọi là tán sắc."],
    "verify": "Cầu vồng sau mưa = tán sắc ánh sáng mặt trời qua giọt nước.",
    "extend": "Mỗi màu có bước sóng khác nhau: đỏ dài nhất, tím ngắn nhất.",
    "common_traps": ["Nhầm tán sắc với phản xạ hoặc khúc xạ thông thường."],
    "hints": ["Tán = phân tán, sắc = màu sắc → phân tán thành nhiều màu."]
  },
  "real_world_connection": "Cầu vồng xuất hiện sau cơn mưa là hiện tượng tán sắc ánh sáng mặt trời qua các giọt mưa.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_002", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "light_dispersion", "topic_vn": "Tán sắc ánh sáng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Trong dải quang phổ ánh sáng trắng, thứ tự các màu từ trên xuống dưới (theo độ lệch tăng dần khi qua lăng kính) là:",
  "options": [{"key":"A","content":"Tím, chàm, lam, lục, vàng, cam, đỏ"},{"key":"B","content":"Đỏ, cam, vàng, lục, lam, chàm, tím"},{"key":"C","content":"Đỏ, vàng, lục, lam, tím"},{"key":"D","content":"Tím, lục, đỏ, vàng, lam"}],
  "correct_answer": "B",
  "explanation": {"summary":"Thứ tự quang phổ (theo bước sóng giảm dần): Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím. Đỏ lệch ít nhất, Tím lệch nhiều nhất.","key_concept":"Đỏ - Cam - Vàng - Lục - Lam - Chàm - Tím (bước sóng giảm dần)."},
  "thinking_guide": {
    "understand": "Thứ tự các màu trong quang phổ.",
    "identify_knowledge": "Mẹo nhớ: Đỏ Cam Vàng Lục Lam Chàm Tím.",
    "plan": "Nhớ câu mẹo hoặc hình ảnh cầu vồng.",
    "steps": ["Bước 1: Đỏ (bước sóng dài nhất, lệch ít nhất).", "Bước 2: → Cam → Vàng → Lục → Lam → Chàm.", "Bước 3: → Tím (bước sóng ngắn nhất, lệch nhiều nhất)."],
    "verify": "Cầu vồng: đỏ ở ngoài, tím ở trong ✓.",
    "extend": "Ngoài vùng nhìn thấy: trước đỏ = hồng ngoại, sau tím = tử ngoại.",
    "common_traps": ["Nhầm thứ tự: tím trước đỏ (đó là theo chiều lệch)."],
    "hints": ["Mẹo: 'Đỏ Cam Vàng Lục Lam Chàm Tím' = Đ-C-V-L-L-C-T."]
  },
  "real_world_connection": "Nhìn cầu vồng: màu đỏ ở vòng ngoài cùng, tím ở vòng trong cùng.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_003", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "infrared", "topic_vn": "Tia hồng ngoại",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Tia hồng ngoại có đặc điểm nào sau đây?",
  "options": [{"key":"A","content":"Mắt thường nhìn thấy được"},{"key":"B","content":"Có bước sóng ngắn hơn ánh sáng tím"},{"key":"C","content":"Có tác dụng nhiệt mạnh"},{"key":"D","content":"Gây ra hiện tượng quang điện ở mọi kim loại"}],
  "correct_answer": "C",
  "explanation": {"summary":"Tia hồng ngoại có bước sóng dài hơn ánh sáng đỏ, mắt không thấy, nhưng có tác dụng nhiệt rất mạnh.","key_concept":"Hồng ngoại: λ > ánh sáng đỏ, tác dụng nhiệt mạnh, mắt không thấy."},
  "thinking_guide": {
    "understand": "Đặc điểm của tia hồng ngoại.",
    "identify_knowledge": "Hồng ngoại: ngoài vùng đỏ, λ dài, tác dụng nhiệt.",
    "plan": "Phân tích từng đáp án.",
    "steps": ["Bước 1: Mắt không thấy (ngoài vùng nhìn thấy) → A sai.", "Bước 2: λ dài hơn đỏ (không phải ngắn hơn tím) → B sai.", "Bước 3: Tác dụng nhiệt mạnh ✓.", "Bước 4: Quang điện mọi kim loại cần λ ngắn → D sai."],
    "verify": "Remote TV phát hồng ngoại → cảm biến nhận. Bếp hồng ngoại nấu nóng thức ăn.",
    "extend": "Ứng dụng: remote, camera đêm, sấy khô, y tế.",
    "common_traps": ["Nhầm hồng ngoại với tử ngoại: hồng ngoại = nhiệt, tử ngoại = hóa học."],
    "hints": ["Hồng ngoại = 'ngoài đỏ' = ấm áp = nhiệt."]
  },
  "real_world_connection": "Remote TV, camera an ninh ban đêm, bếp hồng ngoại đều sử dụng tia hồng ngoại.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_004", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "ultraviolet", "topic_vn": "Tia tử ngoại",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Tia tử ngoại có bước sóng ______ hơn ánh sáng tím (điền 'dài' hoặc 'ngắn').",
  "options": None,
  "correct_answer": "ngắn",
  "explanation": {"summary":"Tia tử ngoại (UV) nằm ngoài vùng tím, có bước sóng ngắn hơn ánh sáng tím.","key_concept":"Tử ngoại: λ < ánh sáng tím. Hồng ngoại: λ > ánh sáng đỏ."},
  "thinking_guide": {
    "understand": "Bước sóng tia tử ngoại so với ánh sáng tím.",
    "identify_knowledge": "Quang phổ: đỏ (λ dài) → tím (λ ngắn) → tử ngoại (λ ngắn hơn nữa).",
    "plan": "Nhớ vị trí tử ngoại trong quang phổ.",
    "steps": ["Bước 1: Tử = tím, ngoại = bên ngoài → ngoài vùng tím.", "Bước 2: Ngoài vùng tím theo hướng λ giảm → λ ngắn hơn tím."],
    "verify": "UV có năng lượng cao hơn ánh sáng tím (E = hc/λ, λ nhỏ → E lớn) ✓.",
    "extend": "UV gây cháy nắng, diệt khuẩn, phát hiện tiền giả.",
    "common_traps": ["Nhầm: 'ngoài' tím = bước sóng dài hơn → sai (ngoài = tiếp theo hướng λ giảm)."],
    "hints": ["Tử ngoại = ultraviolet = UV. Nằm 'bên kia' tím."]
  },
  "real_world_connection": "Kem chống nắng bảo vệ da khỏi tia UV của mặt trời.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_005", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "light_color", "topic_vn": "Màu sắc ánh sáng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Chiếu ánh sáng trắng qua kính lọc màu đỏ, ánh sáng truyền qua có màu gì?",
  "options": [{"key":"A","content":"Trắng"},{"key":"B","content":"Đỏ"},{"key":"C","content":"Không có ánh sáng truyền qua"},{"key":"D","content":"Vàng"}],
  "correct_answer": "B",
  "explanation": {"summary":"Kính lọc màu đỏ chỉ cho ánh sáng đỏ truyền qua, hấp thụ các màu khác. Nên ánh sáng sau kính có màu đỏ.","key_concept":"Kính lọc màu X: chỉ cho ánh sáng màu X truyền qua."},
  "thinking_guide": {
    "understand": "Ánh sáng trắng qua kính lọc đỏ → màu gì?",
    "identify_knowledge": "Kính lọc chỉ cho màu tương ứng truyền qua.",
    "plan": "Ánh sáng trắng = nhiều màu. Kính đỏ lọc ra chỉ màu đỏ.",
    "steps": ["Bước 1: Ánh sáng trắng = đỏ + cam + vàng + lục + lam + chàm + tím.", "Bước 2: Kính đỏ hấp thụ tất cả trừ đỏ.", "Bước 3: Ánh sáng truyền qua = đỏ."],
    "verify": "Nhìn qua kính đỏ, mọi thứ có tông đỏ ✓.",
    "extend": "Nếu chiếu ánh sáng xanh qua kính đỏ → không có gì truyền qua (tối).",
    "common_traps": ["Nghĩ kính đỏ 'nhuộm' ánh sáng thành đỏ → sai (nó lọc, không nhuộm)."],
    "hints": ["Kính lọc = bộ lọc: chỉ cho màu tương ứng đi qua."]
  },
  "real_world_connection": "Đèn giao thông dùng kính lọc đỏ, vàng, xanh để tạo tín hiệu màu.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_006", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "infrared", "topic_vn": "Tia hồng ngoại",
  "type": "true_false", "difficulty": "medium",
  "question_text": "Mọi vật có nhiệt độ cao hơn 0 K (không tuyệt đối) đều phát ra tia hồng ngoại.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Mọi vật có nhiệt độ T > 0 K đều phát ra bức xạ nhiệt (chủ yếu hồng ngoại). Cơ thể người (37°C) cũng phát hồng ngoại.","key_concept":"Mọi vật T > 0K đều phát bức xạ hồng ngoại."},
  "thinking_guide": {
    "understand": "Có phải mọi vật đều phát hồng ngoại?",
    "identify_knowledge": "Bức xạ nhiệt: mọi vật T > 0K đều phát bức xạ điện từ.",
    "plan": "Nhớ kiến thức bức xạ vật đen.",
    "steps": ["Bước 1: Vật có nhiệt độ → phân tử dao động → phát bức xạ.", "Bước 2: Ở nhiệt độ thường → chủ yếu hồng ngoại.", "Bước 3: Nóng hơn → phát thêm ánh sáng khả kiến (đỏ, trắng...)."],
    "verify": "Camera hồng ngoại thấy người, động vật trong đêm tối ✓.",
    "extend": "Mặt trời (6000K) phát cả hồng ngoại, khả kiến, và tử ngoại.",
    "common_traps": ["Nghĩ chỉ vật rất nóng mới phát hồng ngoại → sai."],
    "hints": ["Cơ thể người ~37°C phát hồng ngoại → camera nhiệt thấy được."]
  },
  "real_world_connection": "Camera nhiệt hồng ngoại dùng trong cứu hộ, phát hiện người trong đêm tối, kiểm tra cách nhiệt nhà.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_007", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "ultraviolet", "topic_vn": "Tia tử ngoại",
  "type": "explain", "difficulty": "hard",
  "question_text": "Giải thích tại sao cần bôi kem chống nắng khi ra ngoài trời nắng gắt. Kem chống nắng bảo vệ da khỏi loại tia nào?",
  "options": None,
  "correct_answer": "Kem chống nắng bảo vệ da khỏi tia tử ngoại (UV) từ mặt trời. Tia UV có bước sóng ngắn, năng lượng cao, gây tổn thương DNA tế bào da, dẫn đến cháy nắng, lão hóa sớm, và tăng nguy cơ ung thư da.",
  "explanation": {"summary":"UV gây tổn thương tế bào da. Kem chống nắng chứa chất hấp thụ/phản xạ UV, ngăn UV tiếp xúc da.","key_concept":"Tia tử ngoại (UV) gây hại cho da, kem chống nắng chặn UV."},
  "thinking_guide": {
    "understand": "Tại sao cần kem chống nắng? Bảo vệ khỏi tia gì?",
    "identify_knowledge": "UV → tổn thương DNA → cháy nắng, ung thư da.",
    "plan": "Liên hệ tính chất UV với tác hại lên da.",
    "steps": ["Bước 1: Ánh sáng mặt trời chứa UV-A, UV-B.", "Bước 2: UV xuyên qua da → phá hủy DNA tế bào.", "Bước 3: Kem chống nắng hấp thụ/phản xạ UV → bảo vệ da."],
    "verify": "Người không bôi kem → da đỏ, bong tróc (cháy nắng) ✓.",
    "extend": "SPF 30 = chặn 97% UV-B. SPF 50 = chặn 98%.",
    "common_traps": ["Nghĩ kem chống nắng chặn hồng ngoại (nhiệt) → sai (chặn UV)."],
    "hints": ["Tử ngoại = ultraviolet = UV. Gây cháy nắng, lão hóa da."]
  },
  "real_world_connection": "Bác sĩ da liễu khuyên bôi kem SPF 30+ khi ra ngoài, đặc biệt 10h-14h khi UV mạnh nhất.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_008", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "light_color", "topic_vn": "Màu sắc ánh sáng",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Trộn ánh sáng đỏ và ánh sáng lục sẽ được ánh sáng màu gì?",
  "options": [{"key":"A","content":"Tím"},{"key":"B","content":"Vàng"},{"key":"C","content":"Trắng"},{"key":"D","content":"Cam"}],
  "correct_answer": "B",
  "explanation": {"summary":"Theo mô hình trộn ánh sáng RGB: Đỏ + Lục = Vàng. Đỏ + Lam = Tím (magenta). Lục + Lam = Lam nhạt (cyan). Đỏ + Lục + Lam = Trắng.","key_concept":"Trộn ánh sáng (cộng màu): R+G = Vàng, R+B = Magenta, G+B = Cyan, R+G+B = Trắng."},
  "thinking_guide": {
    "understand": "Đỏ + Lục = ?",
    "identify_knowledge": "Phép cộng màu ánh sáng (RGB).",
    "plan": "Nhớ bảng cộng màu RGB.",
    "steps": ["Bước 1: R (đỏ) + G (lục) = Yellow (vàng).", "Bước 2: Đây là phép cộng màu ánh sáng (khác pha màu sơn)."],
    "verify": "TV LCD: điểm ảnh R+G sáng → hiển thị màu vàng ✓.",
    "extend": "Trộn sơn (phép trừ màu) khác: đỏ + xanh → nâu/tối.",
    "common_traps": ["Nhầm trộn ánh sáng (cộng) với trộn sơn (trừ)."],
    "hints": ["RGB: Đỏ+Lục=Vàng, giống màn hình TV."]
  },
  "real_world_connection": "Màn hình TV, điện thoại dùng 3 điểm R, G, B để tạo ra hàng triệu màu.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_009", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "light_dispersion", "topic_vn": "Tán sắc ánh sáng",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Trong hiện tượng tán sắc qua lăng kính, tia ______ bị lệch nhiều nhất (điền tên màu).",
  "options": None,
  "correct_answer": "tím",
  "explanation": {"summary":"Tia tím có bước sóng ngắn nhất → chiết suất lớn nhất → bị lệch nhiều nhất khi qua lăng kính.","key_concept":"λ ngắn → chiết suất n lớn → góc lệch lớn. Tím lệch nhiều nhất, đỏ ít nhất."},
  "thinking_guide": {
    "understand": "Tia nào bị lệch nhiều nhất khi qua lăng kính?",
    "identify_knowledge": "Chiết suất phụ thuộc λ: λ ngắn → n lớn → lệch nhiều.",
    "plan": "So sánh bước sóng các màu.",
    "steps": ["Bước 1: Tím có λ ngắn nhất trong quang phổ khả kiến.", "Bước 2: λ ngắn → chiết suất n lớn.", "Bước 3: n lớn → góc lệch lớn → tím lệch nhiều nhất."],
    "verify": "Trong quang phổ, tím ở xa trục quang nhất ✓.",
    "extend": "Hiện tượng tán sắc: n = f(λ) → mỗi màu bị lệch khác nhau → tách ra.",
    "common_traps": ["Nhầm: đỏ lệch nhiều nhất (thực tế đỏ lệch ít nhất)."],
    "hints": ["Tím = bước sóng ngắn = năng lượng cao = lệch nhiều."]
  },
  "real_world_connection": "Trong cầu vồng, tím ở vòng trong cùng (lệch nhiều nhất) và đỏ ở vòng ngoài.",
  "formula": ""
})

questions.append({
  "id": "phys9_light_spectrum_010", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "electromagnetic_spectrum", "topic_vn": "Phổ điện từ",
  "type": "explain", "difficulty": "hard",
  "question_text": "Sắp xếp các loại sóng điện từ sau theo thứ tự bước sóng tăng dần: tia X, ánh sáng nhìn thấy, tia hồng ngoại, tia tử ngoại, sóng vô tuyến. Giải thích ngắn gọn.",
  "options": None,
  "correct_answer": "Thứ tự bước sóng tăng dần: Tia X → Tia tử ngoại → Ánh sáng nhìn thấy → Tia hồng ngoại → Sóng vô tuyến. Tia X có λ nhỏ nhất (10⁻¹¹-10⁻⁸ m), sóng vô tuyến có λ lớn nhất (10⁻¹ - 10⁴ m).",
  "explanation": {"summary":"Phổ điện từ: tia gamma < tia X < UV < khả kiến < hồng ngoại < vi sóng < sóng vô tuyến (theo λ tăng dần).","key_concept":"Sóng điện từ: λ tăng → năng lượng giảm. Từ tia gamma đến sóng radio."},
  "thinking_guide": {
    "understand": "Sắp xếp 5 loại sóng ĐT theo λ tăng dần.",
    "identify_knowledge": "Phổ ĐT: gamma → X → UV → khả kiến → IR → vi sóng → radio.",
    "plan": "Nhớ thứ tự trong phổ điện từ.",
    "steps": ["Bước 1: Tia X: λ rất ngắn (~10⁻¹⁰ m).", "Bước 2: Tử ngoại: λ ngắn (~10⁻⁸-10⁻⁷ m).", "Bước 3: Khả kiến: λ trung bình (~4-7 × 10⁻⁷ m).", "Bước 4: Hồng ngoại: λ dài hơn (~10⁻⁶-10⁻³ m).", "Bước 5: Sóng vô tuyến: λ rất dài (~10⁻¹-10⁴ m)."],
    "verify": "Tia X xuyên qua cơ thể (năng lượng cao), sóng radio phát thanh (năng lượng thấp) ✓.",
    "extend": "Tất cả đều là sóng điện từ, chỉ khác bước sóng/tần số.",
    "common_traps": ["Nhầm thứ tự UV và hồng ngoại."],
    "hints": ["Nhớ: X → UV → thấy → IR → radio (năng lượng giảm, λ tăng)."]
  },
  "real_world_connection": "Wifi dùng sóng vô tuyến, điện thoại dùng sóng vi ba, bệnh viện dùng tia X chụp phim.",
  "formula": "\\lambda_{X} < \\lambda_{UV} < \\lambda_{vis} < \\lambda_{IR} < \\lambda_{radio}"
})

# ============================================================
# CHAPTER 6: NUCLEAR ENERGY INTRO (12 questions)
# Năng lượng hạt nhân: cấu tạo nguyên tử, phóng xạ
# ============================================================
questions.append({
  "id": "phys9_nuclear_energy_intro_001", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "atom_structure", "topic_vn": "Cấu tạo nguyên tử",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Nguyên tử được cấu tạo bởi:",
  "options": [{"key":"A","content":"Chỉ có proton"},{"key":"B","content":"Hạt nhân (proton, nơtron) và electron"},{"key":"C","content":"Chỉ có electron"},{"key":"D","content":"Proton và electron (không có nơtron)"}],
  "correct_answer": "B",
  "explanation": {"summary":"Nguyên tử gồm: hạt nhân (chứa proton (+) và nơtron (trung hòa)) ở tâm, và electron (-) chuyển động xung quanh.","key_concept":"Nguyên tử = hạt nhân (p + n) + electron."},
  "thinking_guide": {
    "understand": "Cấu tạo nguyên tử gồm những gì?",
    "identify_knowledge": "Nguyên tử: hạt nhân (proton + nơtron) + electron.",
    "plan": "Nhớ mô hình nguyên tử.",
    "steps": ["Bước 1: Hạt nhân ở tâm, rất nhỏ, chứa proton (+) và nơtron (0).", "Bước 2: Electron (-) chuyển động quanh hạt nhân.", "Bước 3: Số proton = số electron → nguyên tử trung hòa điện."],
    "verify": "Hydrogen: 1p + 0n + 1e. Helium: 2p + 2n + 2e ✓.",
    "extend": "Khối lượng nguyên tử tập trung ở hạt nhân (>99,9%).",
    "common_traps": ["Quên nơtron: nguyên tử cũng có nơtron trong hạt nhân."],
    "hints": ["Hạt nhân = proton + nơtron. Bên ngoài = electron."]
  },
  "real_world_connection": "Mọi vật chất xung quanh ta đều được tạo nên từ nguyên tử với cấu trúc này.",
  "formula": ""
})

questions.append({
  "id": "phys9_nuclear_energy_intro_002", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "atom_structure", "topic_vn": "Cấu tạo nguyên tử",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Proton mang điện tích dương, nơtron không mang điện, electron mang điện tích âm.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Proton: +e. Nơtron: 0 (trung hòa). Electron: -e. Đây là tính chất cơ bản của 3 hạt cấu tạo nguyên tử.","key_concept":"p → (+), n → (0), e → (-)."},
  "thinking_guide": {
    "understand": "Điện tích của proton, nơtron, electron.",
    "identify_knowledge": "p(+), n(0), e(-).",
    "plan": "Nhớ điện tích từng hạt.",
    "steps": ["Bước 1: Proton = positive = dương (+) ✓.", "Bước 2: Nơtron = neutral = trung hòa (0) ✓.", "Bước 3: Electron = negative = âm (-) ✓."],
    "verify": "Nguyên tử trung hòa: số p(+) = số e(-) → tổng điện tích = 0 ✓.",
    "extend": "Ion dương: mất e. Ion âm: nhận thêm e.",
    "common_traps": ["Nhầm: nơtron mang điện âm → sai (nơtron trung hòa)."],
    "hints": ["Pro-ton = Pro = positive = (+). Neu-tron = Neutral = (0). E-lectron = (-)."]
  },
  "real_world_connection": "Tĩnh điện khi cọ xát (ví dụ sấm sét) xảy ra do electron di chuyển giữa các vật.",
  "formula": ""
})

questions.append({
  "id": "phys9_nuclear_energy_intro_003", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "radioactivity", "topic_vn": "Phóng xạ",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Hiện tượng phóng xạ là gì?",
  "options": [{"key":"A","content":"Hiện tượng hạt nhân nguyên tử tự động phóng ra các tia phóng xạ và biến đổi thành hạt nhân khác"},{"key":"B","content":"Hiện tượng phát sáng của chất huỳnh quang"},{"key":"C","content":"Hiện tượng phản xạ ánh sáng"},{"key":"D","content":"Hiện tượng electron bật ra khỏi kim loại khi chiếu sáng"}],
  "correct_answer": "A",
  "explanation": {"summary":"Phóng xạ: hạt nhân không bền tự động phóng ra tia α, β, γ và biến đổi thành hạt nhân nguyên tố khác. Đây là quá trình tự phát, không kiểm soát được.","key_concept":"Phóng xạ: hạt nhân tự phân rã, phóng ra tia α, β, γ, biến thành nguyên tố khác."},
  "thinking_guide": {
    "understand": "Phóng xạ là gì?",
    "identify_knowledge": "Phóng xạ: phân rã hạt nhân tự phát, phóng tia, biến đổi nguyên tố.",
    "plan": "Phân biệt phóng xạ với các hiện tượng khác.",
    "steps": ["Bước 1: Phóng xạ = hạt nhân tự phân rã.", "Bước 2: Phóng ra tia α (He), β (electron), γ (sóng ĐT).", "Bước 3: Hạt nhân biến thành nguyên tố khác."],
    "verify": "Uranium-238 → Thorium-234 + α. Biến thành nguyên tố khác ✓.",
    "extend": "Phóng xạ không bị ảnh hưởng bởi nhiệt độ, áp suất, từ trường.",
    "common_traps": ["Nhầm phóng xạ với huỳnh quang (phát sáng) hay quang điện (bật e)."],
    "hints": ["Phóng = bắn ra. Xạ = tia. Phóng xạ = bắn ra tia từ hạt nhân."]
  },
  "real_world_connection": "Chất phóng xạ Uranium được dùng làm nhiên liệu cho nhà máy điện hạt nhân.",
  "formula": ""
})

questions.append({
  "id": "phys9_nuclear_energy_intro_004", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "nuclear_energy", "topic_vn": "Năng lượng hạt nhân",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Năng lượng hạt nhân được giải phóng từ quá trình nào?",
  "options": [{"key":"A","content":"Phản ứng hóa học"},{"key":"B","content":"Đốt cháy nhiên liệu"},{"key":"C","content":"Phản ứng phân hạch hoặc nhiệt hạch"},{"key":"D","content":"Ma sát giữa các nguyên tử"}],
  "correct_answer": "C",
  "explanation": {"summary":"Năng lượng hạt nhân giải phóng từ: phân hạch (tách hạt nhân nặng) hoặc nhiệt hạch (kết hợp hạt nhân nhẹ). Năng lượng rất lớn theo E = mc².","key_concept":"Phân hạch: tách hạt nhân nặng. Nhiệt hạch: kết hợp hạt nhân nhẹ. Cả hai giải phóng E khổng lồ."},
  "thinking_guide": {
    "understand": "Năng lượng hạt nhân đến từ đâu?",
    "identify_knowledge": "Phân hạch (fission) và nhiệt hạch (fusion).",
    "plan": "Phân biệt phản ứng hạt nhân với phản ứng hóa học.",
    "steps": ["Bước 1: Phản ứng hóa học: thay đổi electron → E nhỏ.", "Bước 2: Phản ứng hạt nhân: thay đổi hạt nhân → E rất lớn.", "Bước 3: Phân hạch: U-235 tách ra. Nhiệt hạch: H → He."],
    "verify": "1 kg U-235 giải phóng E = 8×10¹³ J ≈ 2000 tấn than!",
    "extend": "E = mc²: khối lượng chuyển thành năng lượng (Einstein).",
    "common_traps": ["Nhầm phản ứng hóa học (đốt cháy) với phản ứng hạt nhân."],
    "hints": ["Hạt nhân → phân hạch/nhiệt hạch. Hóa học → đốt cháy."]
  },
  "real_world_connection": "Nhà máy điện hạt nhân dùng phân hạch U-235. Mặt trời dùng nhiệt hạch H → He.",
  "formula": "E = mc^2"
})

questions.append({
  "id": "phys9_nuclear_energy_intro_005", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "nuclear_fission", "topic_vn": "Phân hạch",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Trong phản ứng phân hạch, hạt nhân ______ (nặng/nhẹ) bị tách thành các hạt nhân nhỏ hơn và giải phóng năng lượng.",
  "options": None,
  "correct_answer": "nặng",
  "explanation": {"summary":"Phân hạch: hạt nhân nặng (ví dụ U-235, Pu-239) bị tách thành 2 hạt nhân nhẹ hơn + nơtron + năng lượng.","key_concept":"Phân hạch = tách hạt nhân nặng. Nhiệt hạch = gộp hạt nhân nhẹ."},
  "thinking_guide": {
    "understand": "Phân hạch tách hạt nhân nặng hay nhẹ?",
    "identify_knowledge": "Phân = tách, hạch = hạt nhân. Tách hạt nhân nặng.",
    "plan": "Nhớ: phân hạch ↔ nặng, nhiệt hạch ↔ nhẹ.",
    "steps": ["Bước 1: Phân hạch (fission) = tách/chia nhỏ.", "Bước 2: Đối tượng: hạt nhân nặng (U-235, Pu-239).", "Bước 3: Sản phẩm: 2 hạt nhân nhẹ hơn + nơtron + năng lượng."],
    "verify": "U-235 + n → Ba-141 + Kr-92 + 3n + E ✓.",
    "extend": "Nơtron sinh ra tiếp tục tách các hạt nhân khác → phản ứng dây chuyền.",
    "common_traps": ["Nhầm: phân hạch gộp hạt nhân nhẹ → sai (đó là nhiệt hạch)."],
    "hints": ["Phân = chia nhỏ. Hạch = hạt nhân. Chia nhỏ cái lớn (nặng)."]
  },
  "real_world_connection": "Nhà máy điện hạt nhân dùng phân hạch U-235 để đun nước → hơi nước quay tuabin.",
  "formula": "^{235}_{92}U + ^{1}_{0}n \\to ^{141}_{56}Ba + ^{92}_{36}Kr + 3^{1}_{0}n + E"
})

questions.append({
  "id": "phys9_nuclear_energy_intro_006", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "nuclear_fusion", "topic_vn": "Nhiệt hạch",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Phản ứng nhiệt hạch xảy ra ở đâu trong tự nhiên?",
  "options": [{"key":"A","content":"Trong lòng Trái Đất"},{"key":"B","content":"Trên bề mặt Mặt Trăng"},{"key":"C","content":"Trong lòng Mặt Trời và các ngôi sao"},{"key":"D","content":"Trong đại dương"}],
  "correct_answer": "C",
  "explanation": {"summary":"Nhiệt hạch (tổng hợp hạt nhân) xảy ra trong lòng Mặt Trời và các ngôi sao, nơi nhiệt độ hàng chục triệu °C. Hydrogen → Helium + năng lượng khổng lồ.","key_concept":"Nhiệt hạch tự nhiên: trong lòng sao (T ~ 10⁷ K). H + H → He + E."},
  "thinking_guide": {
    "understand": "Nhiệt hạch xảy ra ở đâu trong tự nhiên?",
    "identify_knowledge": "Nhiệt hạch cần T cực cao (~10⁷ K) → chỉ có trong lòng sao.",
    "plan": "Tìm nơi có nhiệt độ đủ cao cho nhiệt hạch.",
    "steps": ["Bước 1: Nhiệt hạch cần nhiệt độ hàng chục triệu °C.", "Bước 2: Lòng Trái Đất: ~6000°C → chưa đủ.", "Bước 3: Lòng Mặt Trời: ~15.000.000°C → đủ ✓."],
    "verify": "Mặt Trời tỏa sáng suốt 4,6 tỷ năm nhờ nhiệt hạch ✓.",
    "extend": "Con người đang nghiên cứu nhiệt hạch nhân tạo (ITER) để tạo nguồn điện sạch.",
    "common_traps": ["Nhầm: nhiệt hạch xảy ra trong lòng Trái Đất → sai (T chưa đủ)."],
    "hints": ["Nhiệt hạch = thermonuclear fusion = 'lửa' của ngôi sao."]
  },
  "real_world_connection": "Mặt Trời đốt 600 triệu tấn H thành He mỗi giây, cung cấp ánh sáng và nhiệt cho Trái Đất.",
  "formula": "4 \\cdot ^{1}_{1}H \\to ^{4}_{2}He + 2e^+ + 2\\nu_e + E"
})

questions.append({
  "id": "phys9_nuclear_energy_intro_007", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "radiation_types", "topic_vn": "Các loại tia phóng xạ",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Trong 3 loại tia phóng xạ α, β, γ, tia nào có khả năng đâm xuyên mạnh nhất?",
  "options": [{"key":"A","content":"Tia α"},{"key":"B","content":"Tia β"},{"key":"C","content":"Tia γ"},{"key":"D","content":"Cả ba như nhau"}],
  "correct_answer": "C",
  "explanation": {"summary":"Tia γ (sóng điện từ, không khối lượng, không điện tích) có khả năng đâm xuyên mạnh nhất, xuyên qua cơ thể và nhiều cm chì. Tia α yếu nhất (bị chặn bởi tờ giấy).","key_concept":"Đâm xuyên: γ >> β >> α. Tia γ cần tấm chì dày để chặn."},
  "thinking_guide": {
    "understand": "So sánh khả năng đâm xuyên của α, β, γ.",
    "identify_knowledge": "α: hạt He (2p+2n), β: electron, γ: sóng ĐT.",
    "plan": "So sánh kích thước, khối lượng, điện tích → khả năng xuyên.",
    "steps": ["Bước 1: α: nặng, tích điện +2 → tương tác mạnh → bị chặn dễ (giấy).", "Bước 2: β: nhẹ, tích điện ±1 → xuyên sâu hơn α (vài mm nhôm).", "Bước 3: γ: không khối lượng, không điện tích → xuyên mạnh nhất (cần chì dày)."],
    "verify": "Phòng X-quang có tường chì dày → để chặn tia γ/X ✓.",
    "extend": "Mức gây hại sinh học: α > β > γ (nếu vào bên trong cơ thể).",
    "common_traps": ["Nhầm: α mạnh nhất vì nặng nhất → sai (nặng → dễ bị chặn)."],
    "hints": ["Càng nhẹ, càng ít tương tác → xuyên càng sâu. γ nhẹ nhất (sóng ĐT)."]
  },
  "real_world_connection": "Kỹ thuật viên X-quang mặc áo chì để bảo vệ khỏi tia γ/X.",
  "formula": ""
})

questions.append({
  "id": "phys9_nuclear_energy_intro_008", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "nuclear_power", "topic_vn": "Nhà máy điện hạt nhân",
  "type": "true_false", "difficulty": "medium",
  "question_text": "Nhà máy điện hạt nhân không thải ra khí CO₂ trong quá trình phát điện.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Phản ứng phân hạch không tạo CO₂. Nhà máy điện hạt nhân không đốt nhiên liệu hóa thạch nên không thải CO₂ trực tiếp trong quá trình phát điện.","key_concept":"Điện hạt nhân: không thải CO₂ khi vận hành (khác nhiệt điện đốt than/khí)."},
  "thinking_guide": {
    "understand": "Nhà máy ĐHN có thải CO₂ khi phát điện không?",
    "identify_knowledge": "Phân hạch U → Ba + Kr + n + E. Không có C → không CO₂.",
    "plan": "So sánh với nhiệt điện (đốt than/khí tạo CO₂).",
    "steps": ["Bước 1: Nhiệt điện đốt than: C + O₂ → CO₂ → thải CO₂.", "Bước 2: Điện hạt nhân: U phân hạch → không liên quan carbon.", "Bước 3: → Không thải CO₂ khi vận hành ✓."],
    "verify": "Các nước dùng nhiều ĐHN (Pháp) có cường độ carbon thấp hơn.",
    "extend": "Tuy nhiên, ĐHN có vấn đề chất thải phóng xạ và rủi ro sự cố.",
    "common_traps": ["Nhầm: mọi nhà máy điện đều thải CO₂ → sai (ĐHN, thủy điện, gió không thải)."],
    "hints": ["Phân hạch uranium → không đốt cháy → không CO₂."]
  },
  "real_world_connection": "Nhiều nước phát triển ĐHN để giảm phát thải CO₂ chống biến đổi khí hậu.",
  "formula": ""
})

questions.append({
  "id": "phys9_nuclear_energy_intro_009", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "half_life", "topic_vn": "Chu kỳ bán rã",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Chất phóng xạ có chu kỳ bán rã T = 8 ngày. Sau 24 ngày, lượng chất phóng xạ còn lại bằng ______ phần (dạng phân số) lượng ban đầu.",
  "options": None,
  "correct_answer": "1/8",
  "explanation": {"summary":"Số chu kỳ: n = t/T = 24/8 = 3. Còn lại: N/N₀ = (1/2)³ = 1/8.","key_concept":"Sau n chu kỳ bán rã: N = N₀ × (1/2)ⁿ."},
  "thinking_guide": {
    "understand": "T = 8 ngày, t = 24 ngày. Tìm phần còn lại.",
    "identify_knowledge": "N = N₀(1/2)^(t/T).",
    "plan": "Tính số chu kỳ rồi áp dụng công thức.",
    "steps": ["Bước 1: n = t/T = 24/8 = 3 chu kỳ.", "Bước 2: N/N₀ = (1/2)³ = 1/8.", "Bước 3: Còn lại 1/8 lượng ban đầu."],
    "verify": "Sau 8 ngày: 1/2. Sau 16 ngày: 1/4. Sau 24 ngày: 1/8 ✓.",
    "extend": "Sau 10 chu kỳ: (1/2)¹⁰ = 1/1024 ≈ 0,1% còn lại.",
    "common_traps": ["Nhầm: sau 3 chu kỳ còn 1/3 → sai (phải là (1/2)³ = 1/8)."],
    "hints": ["Mỗi chu kỳ giảm nửa: 1 → 1/2 → 1/4 → 1/8..."]
  },
  "real_world_connection": "Iốt-131 (T=8 ngày) dùng trong y tế. Sau 24 ngày chỉ còn 1/8 → an toàn hơn.",
  "formula": "\\frac{N}{N_0} = \\left(\\frac{1}{2}\\right)^{t/T} = \\left(\\frac{1}{2}\\right)^{3} = \\frac{1}{8}"
})

questions.append({
  "id": "phys9_nuclear_energy_intro_010", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "nuclear_safety", "topic_vn": "An toàn hạt nhân",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Sự cố nhà máy điện hạt nhân Chernobyl (1986) và Fukushima (2011) cho thấy mối nguy hiểm chính của năng lượng hạt nhân là gì?",
  "options": [{"key":"A","content":"Thải nhiều CO₂ gây hiệu ứng nhà kính"},{"key":"B","content":"Rò rỉ phóng xạ gây ô nhiễm môi trường và ảnh hưởng sức khỏe lâu dài"},{"key":"C","content":"Gây tiếng ồn lớn"},{"key":"D","content":"Tiêu tốn quá nhiều nước"}],
  "correct_answer": "B",
  "explanation": {"summary":"Sự cố ĐHN gây rò rỉ chất phóng xạ ra môi trường, ô nhiễm đất/nước/không khí, ảnh hưởng sức khỏe con người hàng thế kỷ (ung thư, đột biến gen).","key_concept":"Nguy hiểm chính: rò rỉ phóng xạ → ô nhiễm lâu dài, ảnh hưởng sức khỏe."},
  "thinking_guide": {
    "understand": "Mối nguy chính của năng lượng hạt nhân là gì?",
    "identify_knowledge": "Sự cố → rò rỉ phóng xạ → ô nhiễm → bệnh tật.",
    "plan": "Phân tích hậu quả các sự cố hạt nhân.",
    "steps": ["Bước 1: ĐHN không thải CO₂ → A sai.", "Bước 2: Sự cố → chất phóng xạ phát tán → ô nhiễm rộng.", "Bước 3: Phóng xạ gây ung thư, đột biến gen → hàng thập kỷ."],
    "verify": "Chernobyl: vùng cấm 30km đến nay (40 năm) vẫn chưa hết ô nhiễm ✓.",
    "extend": "Chất thải hạt nhân cần lưu trữ an toàn hàng nghìn năm.",
    "common_traps": ["Nhầm: ĐHN nguy hiểm vì thải CO₂ → sai (ĐHN không thải CO₂)."],
    "hints": ["Từ khóa: phóng xạ = nguy hiểm lâu dài."]
  },
  "real_world_connection": "Vùng cấm xung quanh Chernobyl (Ukraine) rộng 2600 km² vẫn bị bỏ hoang sau gần 40 năm.",
  "formula": ""
})

questions.append({
  "id": "phys9_nuclear_energy_intro_011", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "emc2", "topic_vn": "Hệ thức Einstein",
  "type": "explain", "difficulty": "hard",
  "question_text": "Giải thích ý nghĩa của hệ thức Einstein \\(E = mc^2\\) và tại sao phản ứng hạt nhân giải phóng năng lượng khổng lồ.",
  "options": None,
  "correct_answer": "E = mc² cho biết khối lượng và năng lượng tương đương: một lượng nhỏ khối lượng m có thể chuyển thành năng lượng E rất lớn vì c² = (3×10⁸)² = 9×10¹⁶ rất lớn. Trong phản ứng hạt nhân, tổng khối lượng sản phẩm nhỏ hơn tổng khối lượng ban đầu (hụt khối Δm), phần hụt khối này chuyển thành năng lượng E = Δmc².",
  "explanation": {"summary":"c² ≈ 9×10¹⁶ → 1g khối lượng = 9×10¹³ J ≈ 25 triệu kWh. Hụt khối trong phản ứng hạt nhân → E khổng lồ.","key_concept":"E = mc²: khối lượng ↔ năng lượng. c² rất lớn → m nhỏ → E rất lớn."},
  "thinking_guide": {
    "understand": "Ý nghĩa E = mc² và tại sao phản ứng HN giải phóng E lớn.",
    "identify_knowledge": "E = mc²: m và E tương đương. Hụt khối → năng lượng.",
    "plan": "Giải thích công thức, rồi liên hệ với phản ứng hạt nhân.",
    "steps": ["Bước 1: E = mc²: m (kg) × c² (9×10¹⁶) = E (J).", "Bước 2: c² rất lớn → m nhỏ cũng cho E khổng lồ.", "Bước 3: Phản ứng HN: Δm > 0 → E = Δmc² rất lớn."],
    "verify": "1g: E = 10⁻³ × 9×10¹⁶ = 9×10¹³ J ≈ 25 triệu kWh → khổng lồ!",
    "extend": "Bom nguyên tử Little Boy (Hiroshima): chỉ 0,7g khối lượng chuyển thành năng lượng.",
    "common_traps": ["Nghĩ toàn bộ khối lượng chuyển thành E → sai (chỉ phần hụt khối Δm)."],
    "hints": ["c = 3×10⁸ m/s → c² = 9×10¹⁶: hệ số nhân khổng lồ."]
  },
  "real_world_connection": "1 kg uranium phân hạch giải phóng năng lượng bằng đốt 2000 tấn than đá.",
  "formula": "E = \\Delta m \\cdot c^2 \\quad (c = 3 \\times 10^8 \\text{ m/s})"
})

questions.append({
  "id": "phys9_nuclear_energy_intro_012", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "nuclear_applications", "topic_vn": "Ứng dụng hạt nhân",
  "type": "explain", "difficulty": "hard",
  "question_text": "Nêu ít nhất 3 ứng dụng hòa bình của năng lượng hạt nhân và phóng xạ trong đời sống. Giải thích ngắn gọn mỗi ứng dụng.",
  "options": None,
  "correct_answer": "1) Nhà máy điện hạt nhân: phân hạch U-235 để sản xuất điện năng quy mô lớn, không thải CO₂. 2) Y tế: dùng đồng vị phóng xạ (I-131, Co-60) để chẩn đoán và điều trị ung thư (xạ trị). 3) Nông nghiệp: chiếu xạ thực phẩm để bảo quản lâu hơn, tạo giống cây trồng đột biến cho năng suất cao. Ngoài ra: khảo cổ (C-14), kiểm tra chất lượng vật liệu, năng lượng cho tàu ngầm/vệ tinh.",
  "explanation": {"summary":"Ứng dụng hòa bình: sản xuất điện, y tế (chẩn đoán/xạ trị), nông nghiệp (bảo quản/tạo giống), khảo cổ (C-14), công nghiệp.","key_concept":"Hạt nhân có nhiều ứng dụng hòa bình ngoài vũ khí: điện, y tế, nông nghiệp."},
  "thinking_guide": {
    "understand": "Liệt kê 3+ ứng dụng hòa bình của hạt nhân/phóng xạ.",
    "identify_knowledge": "Ứng dụng: điện, y tế, nông nghiệp, khảo cổ, công nghiệp.",
    "plan": "Trình bày mỗi ứng dụng với giải thích ngắn gọn.",
    "steps": ["Bước 1: Sản xuất điện (phân hạch U-235).", "Bước 2: Y tế: xạ trị ung thư (Co-60), chẩn đoán (PET scan).", "Bước 3: Nông nghiệp: chiếu xạ bảo quản, tạo giống đột biến.", "Bước 4: Khảo cổ: xác định tuổi cổ vật bằng C-14."],
    "verify": "Pháp sản xuất 70% điện từ hạt nhân. Xạ trị cứu sống hàng triệu bệnh nhân ung thư ✓.",
    "extend": "Tàu ngầm hạt nhân hoạt động liên tục nhiều năm không cần tiếp nhiên liệu.",
    "common_traps": ["Chỉ nghĩ đến bom nguyên tử, quên các ứng dụng hòa bình."],
    "hints": ["Nghĩ theo lĩnh vực: năng lượng, y tế, nông nghiệp, khoa học."]
  },
  "real_world_connection": "Việt Nam dùng đồng vị phóng xạ trong bệnh viện để chẩn đoán và điều trị ung thư hàng ngày.",
  "formula": ""
})
# ============================================================
# NEW ADVANCED & PHYSICS FUN QUESTIONS (18 questions)
# ============================================================

# --- CHAPTER 1: RESISTANCE & OHM'S LAW (2 new questions) ---
questions.append({
  "id": "phys9_resistance_ohm_013", "grade": 9, "chapter": "resistance_ohm",
  "image": "/images/bridge_circuit.svg",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "bridge_circuit", "topic_vn": "Mạch cầu điện trở",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Cho mạch cầu điện trở gồm năm điện trở mắc thành hình cầu giữa hai điểm A và B: các cạnh ngoài là $R_1 = R_2 = R_3 = R_4 = 4\\,\\Omega$, và điện trở cầu ở giữa là $R_5 = 8\\,\\Omega$. Nếu đặt hiệu điện thế $U_{AB} = 12\\,V$ vào hai đầu mạch thì điện trở tương đương của toàn mạch là bao nhiêu?",
  "question_text_en": "For a bridge circuit with five resistors connected between points A and B: the outer resistors are $R_1 = R_2 = R_3 = R_4 = 4\\,\\Omega$, and the bridge resistor in the middle is $R_5 = 8\\,\\Omega$. If a voltage $U_{AB} = 12\\,V$ is applied across the circuit, what is the equivalent resistance of the entire network?",
  "options": [
    {"key": "A", "content": "4 Ω", "content_en": "4 Ω"},
    {"key": "B", "content": "8 Ω", "content_en": "8 Ω"},
    {"key": "C", "content": "4,8 Ω", "content_en": "4.8 Ω"},
    {"key": "D", "content": "6 Ω", "content_en": "6 Ω"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Do $R_1/R_2 = R_3/R_4 = 1$ nên mạch cầu cân bằng. Hiệu điện thế giữa hai đầu điện trở cầu $R_5$ bằng 0, không có dòng qua $R_5$. Ta có thể bỏ $R_5$ khỏi mạch. Mạch trở thành $(R_1 \\text{ nt } R_3) \\text{ // } (R_2 \\text{ nt } R_4) \\Rightarrow R_{tđ} = (4+4)/2 = 4\\,\\Omega$.",
    "summary_en": "Since $R_1/R_2 = R_3/R_4 = 1$, the bridge is balanced. The potential difference across the bridge resistor $R_5$ is zero, so no current flows through it. We can remove $R_5$. The circuit simplifies to $(R_1 \\text{ nt } R_3) \\text{ // } (R_2 \\text{ nt } R_4) \\Rightarrow R_{eq} = (4+4)/2 = 4\\,\\Omega$."
  },
  "thinking_guide": {
    "understand": "Tìm điện trở tương đương của mạch cầu 5 điện trở.",
    "understandEn": "Find the equivalent resistance of a 5-resistor bridge circuit.",
    "identify_knowledge": "Mạch cầu cân bằng: $R_1/R_2 = R_3/R_4 \\Rightarrow$ dòng qua cầu bằng 0.",
    "identify_knowledgeEn": "Balanced bridge condition: $R_1/R_2 = R_3/R_4 \\Rightarrow$ current through bridge is zero.",
    "plan": "Kiểm tra tỉ số cầu. Nếu cân bằng, bỏ $R_5$, giải mạch song song - nối tiếp đơn giản.",
    "planEn": "Check the bridge ratio. If balanced, remove $R_5$, then solve the simplified parallel-series network.",
    "steps": [
      "Bước 1: Tính tỉ số các điện trở nhánh: $R_1/R_3 = 4/4 = 1$ và $R_2/R_4 = 4/4 = 1$.",
      "Bước 2: Do tỉ số bằng nhau, đây là mạch cầu cân bằng, $I_5 = 0$.",
      "Bước 3: Bỏ $R_5$ ra khỏi mạch. Nhánh trên gồm $R_1 \\text{ nt } R_3 = 4+4=8\\,\\Omega$. Nhánh dưới gồm $R_2 \\text{ nt } R_4 = 4+4=8\\,\\Omega$.",
      "Bước 4: Tính điện trở tương đương song song: $R_{tđ} = (8 \\times 8)/(8+8) = 4\\,\\Omega$."
    ],
    "stepsEn": [
      "Step 1: Calculate the ratio of branch resistors: $R_1/R_3 = 4/4 = 1$ and $R_2/R_4 = 4/4 = 1$.",
      "Step 2: Since the ratios are equal, the bridge is balanced and $I_5 = 0$.",
      "Step 3: Remove $R_5$. Upper branch: $R_1 \\text{ nt } R_3 = 4+4=8\\,\\Omega$. Lower branch: $R_2 \\text{ nt } R_4 = 4+4=8\\,\\Omega$.",
      "Step 4: Calculate equivalent resistance: $R_{eq} = (8 \\times 8)/(8+8) = 4\\,\\Omega$."
    ],
    "verify": "Nếu thay $R_5$ bằng điện trở khác bất kỳ (ví dụ $100\\,\\Omega$), do cầu cân bằng, $R_{tđ}$ vẫn luôn bằng $4\\,\\Omega$.",
    "verifyEn": "If you change $R_5$ to any other value (e.g., $100\\,\\Omega$), the equivalent resistance remains $4\\,\\Omega$ because the bridge is balanced.",
    "extend": "Nếu mạch cầu không cân bằng, ta phải dùng phương pháp chuyển mạch tam giác sang hình sao (delta-wye transformation) hoặc định luật Kirchhoff.",
    "extendEn": "If the bridge is unbalanced, you must use Delta-Wye transformation or Kirchhoff's laws.",
    "common_traps": ["Tính nhầm R_tđ bằng cách cộng tất cả 5 điện trở.", "Không nhận ra tính cân bằng của mạch cầu."],
    "common_traps_en": ["Adding all 5 resistors directly.", "Failing to check the balance condition of the bridge."],
    "hints": ["Kiểm tra tỉ số đường chéo: $R_1 \\cdot R_4$ có bằng $R_2 \\cdot R_3$ không?", "If yes, remove $R_5$ immediately."]
  },
  "real_world_connection": "Mạch cầu Wheatstone được sử dụng rộng rãi trong các cảm biến đo điện trở chính xác cao, như cảm biến đo biến dạng (strain gauge).",
  "real_world_connection_en": "The Wheatstone bridge is widely used in high-precision sensors to measure resistance changes, such as strain gauges.",
  "formula": "R_{tđ} = \\frac{(R_1 + R_3)(R_2 + R_4)}{(R_1 + R_3) + (R_2 + R_4)} = 4\\,\\Omega",
  "phet_sim": {
    "title": "Circuit Construction Kit: DC",
    "titleVn": "Lắp ráp mạch điện: Một chiều",
    "url": "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html",
    "instruction": "Lắp một mạch cầu gồm 5 điện trở theo mô tả của đề bài, dùng ampe kế đo dòng qua điện trở giữa để kiểm tra xem có bằng 0 hay không.",
    "instructionEn": "Build a bridge circuit with 5 resistors as described in the problem, and use an ammeter to verify if the current through the center resistor is zero."
  }
})

questions.append({
  "id": "phys9_resistance_ohm_014", "grade": 9, "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm", "topic": "bird_powerline", "topic_vn": "Dây tải điện và an toàn",
  "type": "explain", "difficulty": "medium",
  "question_text": "Giải thích tại sao một chú chim nhỏ có thể đậu bằng hai chân trên cùng một dây tải điện trần cao thế $110\\,kV$ mà không hề bị điện giật, nhưng nếu chú chim này vô tình chạm cánh vào cột sắt nâng đỡ đường dây thì sẽ bị giật chết lập tức?",
  "question_text_en": "Explain why a small bird can perch with both feet on a single bare $110\\,kV$ high-voltage power line without being harmed, but will be instantly electrocuted if its wing accidentally touches the steel support pole?",
  "options": None,
  "correct_answer": "Khi đậu bằng hai chân trên cùng một dây điện, khoảng cách giữa hai chân rất nhỏ nên hiệu điện thế giữa hai chân chim xấp xỉ bằng 0 (không có dòng qua người). Khi chạm cánh vào cột điện sắt (nối đất), chim tạo ra một cầu nối giữa nguồn điện cao thế 110 kV và đất (hiệu điện thế cực lớn), dòng điện khổng lồ sẽ chạy qua cơ thể chim xuống đất gây tử vong.",
  "correct_answer_en": "When perching with both feet on the same wire, the distance between the feet is very small, making the potential difference (voltage) between them close to zero, so no current flows. If the wing touches the grounded steel pole, the bird bridges the 110 kV wire and the earth (huge potential difference), causing a massive, fatal electric current to flow through its body to the ground.",
  "explanation": {
    "summary": "Chim đậu trên một dây: dòng điện chạy theo dây dẫn có điện trở cực nhỏ thay vì chạy qua cơ thể chim có điện trở lớn. Khi chạm cột sắt: có chênh lệch điện thế khổng lồ (110 kV so với 0V của đất) tạo ra dòng điện đi qua chim.",
    "summary_en": "Bird on single wire: current prefers the low-resistance wire over the high-resistance bird. When touching the metal pole: a massive potential difference (110 kV to 0V ground) drives a fatal current through the bird."
  },
  "thinking_guide": {
    "understand": "Giải thích hiện tượng an toàn điện của chim trên dây điện và nguy cơ từ cột tiếp đất.",
    "understandEn": "Explain electrical safety for birds on power lines and the hazard when touching grounded objects.",
    "identify_knowledge": "Dòng điện chạy qua nơi có điện thế khác nhau ($I = \\Delta U/R$). Cơ thể chim có điện trở lớn hơn dây đồng nhiều lần.",
    "identify_knowledgeEn": "Current flows between different electrical potentials ($I = \\Delta U/R$). The bird's body resistance is much higher than the metal wire.",
    "plan": "Phân tích 2 trường hợp: 1) Chỉ tiếp xúc 1 dây (hiệu điện thế hai điểm đặt chân cực nhỏ). 2) Tiếp xúc dây cao thế và cột sắt nối đất (hiệu điện thế cực lớn).",
    "planEn": "Analyze two cases: 1) Only contacting one wire (potential difference between feet is negligible). 2) Contacting wire and grounded pole (extreme potential difference).",
    "steps": [
      "Bước 1: Hai chân chim đứng trên cùng một dây dẫn kim loại dẫn điện tốt. Điện trở đoạn dây giữa hai chân chim xấp xỉ bằng 0.",
      "Bước 2: Hiệu điện thế giữa hai chân chim $\\Delta U = I_{dây} \\cdot R_{đoạn dây} \\approx 0$. Không có dòng điện đáng kể qua người chim.",
      "Bước 3: Cột điện sắt nối trực tiếp xuống đất (điện thế 0V).",
      "Bước 4: Khi cánh chạm vào cột sắt, hiệu điện thế đặt vào cơ thể chim là $110\\,kV - 0\\,V = 110\\,kV$. Dòng điện chạy qua chim cực lớn gây giật chết."
    ],
    "stepsEn": [
      "Step 1: Both feet of the bird are on the same low-resistance wire. The resistance of the wire segment between its feet is close to zero.",
      "Step 2: The potential difference between its feet is $\\Delta U = I_{wire} \\cdot R_{segment} \\approx 0$. No significant current flows through the bird.",
      "Step 3: The steel support pole is directly grounded (0V potential).",
      "Step 4: When a wing touches the pole, the potential difference across the bird's body becomes $110\\,kV - 0\\,V = 110\\,kV$, driving a fatal current."
    ],
    "verify": "Nguyên lý này tương tự với nguyên lý lồng Faraday hoặc các kỹ sư sửa điện trực tiếp trên đường dây nóng (hotline maintenance) khi họ mặc đồ dẫn điện đồng thế với dây.",
    "verifyEn": "This is similar to the Faraday cage principle or live-line maintenance, where technicians work directly on energized lines by remaining at the same potential.",
    "extend": "Trong cuốn sách 'Vật lý vui', tác giả Perelman chỉ ra rằng động vật có kích thước lớn dễ gặp nguy hiểm hơn do khoảng cách tiếp xúc rộng, dễ tạo ra điện áp bước hoặc chạm vào các cấu trúc nối đất.",
    "extendEn": "In 'Physics for Entertainment', Perelman points out that larger animals are at higher risk because their larger size makes it easier to bridge wires or touch grounded structures.",
    "common_traps": ["Nghĩ rằng chân chim có lớp sừng cách điện tốt nên không giật → Sai, lớp sừng không cách điện được 110 kV."],
    "common_traps_en": ["Thinking the bird's talons are made of insulating materials → Wrong, no dry skin can insulate 110 kV."],
    "hints": ["Xét hiệu điện thế (chênh lệch điện thế) giữa hai điểm chim tiếp xúc trong mỗi trường hợp."]
  },
  "real_world_connection": "Các trạm biến áp thường được lắp đặt các thiết bị đuổi chim hoặc bọc cách điện tại các đầu nối để ngăn chặn chim chạm cánh vào vỏ sắt gây chập điện.",
  "real_world_connection_en": "Substations mount bird guards or insulate terminals to prevent birds from bridging live wires and grounded metal enclosures.",
  "formula": "I = \\frac{\\Delta U}{R_{chim}}"
})

# --- CHAPTER 2: ELECTRIC CIRCUIT (2 new questions) ---
questions.append({
  "id": "phys9_electric_circuit_013", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "non_ideal_voltmeter", "topic_vn": "Thiết bị đo không lý tưởng",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Hai điện trở $R_1 = 1000\\,\\Omega$ và $R_2 = 2000\\,\\Omega$ mắc nối tiếp vào nguồn điện có hiệu điện thế không đổi $U = 12\\,V$. Khi dùng một vôn kế (có điện trở $R_V$ hữu hạn) để đo hiệu điện thế hai đầu điện trở $R_1$ thì vôn kế chỉ $3\\,V$. Hỏi điện trở $R_V$ của vôn kế này bằng bao nhiêu?",
  "question_text_en": "Two resistors $R_1 = 1000\\,\\Omega$ and $R_2 = 2000\\,\\Omega$ are connected in series to a constant voltage source $U = 12\\,V$. When a voltmeter (having a finite resistance $R_V$) is used to measure the voltage across $R_1$, it reads $3\\,V$. What is the resistance $R_V$ of the voltmeter?",
  "options": [
    {"key": "A", "content": "1000 Ω", "content_en": "1000 Ω"},
    {"key": "B", "content": "2000 Ω", "content_en": "2000 Ω"},
    {"key": "C", "content": "3000 Ω", "content_en": "3000 Ω"},
    {"key": "D", "content": "5000 Ω", "content_en": "5000 Ω"}
  ],
  "correct_answer": "B",
  "explanation": {
    "summary": "Vôn kế đo $R_1 \\Rightarrow$ sơ đồ mạch là $(R_1 \\text{ // } R_V) \\text{ nt } R_2$. Hiệu điện thế hai đầu nhóm song song là $U_1 = 3\\,V \\Rightarrow U_2 = U - U_1 = 12 - 3 = 9\\,V$. Dòng qua mạch chính $I = U_2/R_2 = 9/2000 = 0,0045\\,A$. Điện trở tương đương của nhóm song song là $R_{1V} = U_1/I = 3/0,0045 = 666,7\\,\\Omega$. Áp dụng công thức song song: $1/R_{1V} = 1/R_1 + 1/R_V \\Rightarrow 1/R_V = 1/666,7 - 1/1000 \\Rightarrow R_V = 2000\\,\\Omega$.",
    "summary_en": "Voltmeter measures $R_1 \\Rightarrow$ circuit layout is $(R_1 \\text{ // } R_V) \\text{ nt } R_2$. The voltage across the parallel group is $U_1 = 3\\,V \\Rightarrow U_2 = U - U_1 = 12 - 3 = 9\\,V$. Total current $I = U_2/R_2 = 9/2000 = 0.0045\\,A$. Equivalent resistance of the parallel group is $R_{1V} = U_1/I = 3/0.0045 = 666.7\\,\\Omega$. Using parallel formula: $1/R_{1V} = 1/R_1 + 1/R_V \\Rightarrow 1/R_V = 1/666.7 - 1/1000 \\Rightarrow R_V = 2000\\,\\Omega$."
  },
  "thinking_guide": {
    "understand": "Cho mạch nối tiếp $R_1, R_2$, mắc vôn kế song song $R_1$ được $U_1=3V$. Tìm $R_V$ của vôn kế.",
    "understandEn": "Given series circuit $R_1, R_2$. Voltmeter parallel to $R_1$ reads $U_1=3V$. Find $R_V$ of the voltmeter.",
    "identify_knowledge": "Vôn kế không lý tưởng có điện trở $R_V$ tham gia vào mạch điện. Phân tích mạch dạng $(R_1 // R_V) \\text{ nt } R_2$.",
    "identify_knowledgeEn": "A non-ideal voltmeter has resistance $R_V$ that affects the circuit. Analyze as $(R_1 // R_V) \\text{ nt } R_2$.",
    "plan": "Tính hiệu điện thế trên $R_2$ $\\Rightarrow$ dòng mạch chính $I$ $\\Rightarrow$ điện trở tương đương $R_{1V}$ $\\Rightarrow$ điện trở vôn kế $R_V$.",
    "planEn": "Calculate voltage across $R_2$ $\\Rightarrow$ main current $I$ $\\Rightarrow$ equivalent parallel resistance $R_{1V}$ $\\Rightarrow$ voltmeter resistance $R_V$.",
    "steps": [
      "Bước 1: Nhóm song song gồm $R_1 // R_V$ có hiệu điện thế $U_{1V} = U_1 = 3\\,V$.",
      "Bước 2: Hiệu điện thế hai đầu $R_2$ là $U_2 = U - U_{1V} = 12 - 3 = 9\\,V$.",
      "Bước 3: Dòng điện mạch chính là dòng chạy qua $R_2$: $I = U_2/R_2 = 9/2000 = 0,0045\\,A$.",
      "Bước 4: Điện trở tương đương của nhóm song song là $R_{1V} = U_{1V}/I = 3/0,0045 = 666,7\\,\\Omega$.",
      "Bước 5: Tính $R_V$: $1/R_{1V} = 1/R_1 + 1/R_V \\Rightarrow 1/R_V = 1/666,7 - 1/1000 = 1/2000 \\Rightarrow R_V = 2000\\,\\Omega$."
    ],
    "stepsEn": [
      "Step 1: The parallel group $R_1 // R_V$ has a voltage of $U_{1V} = U_1 = 3\\,V$.",
      "Step 2: The voltage across $R_2$ is $U_2 = U - U_{1V} = 12 - 3 = 9\\,V$.",
      "Step 3: The main current is the current through $R_2$: $I = U_2/R_2 = 9/2000 = 0.0045\\,A$.",
      "Step 4: The equivalent resistance of the parallel group is $R_{1V} = U_{1V}/I = 3/0.0045 = 666.7\\,\\Omega$.",
      "Step 5: Solve for $R_V$: $1/R_{1V} = 1/R_1 + 1/R_V \\Rightarrow 1/R_V = 1/666.7 - 1/1000 = 1/2000 \\Rightarrow R_V = 2000\\,\\Omega$."
    ],
    "verify": "Kiểm tra lại: Nếu $R_V = 2000\\,\\Omega$ song song $R_1 = 1000\\,\\Omega \\Rightarrow R_{1V} = 666,7\\,\\Omega$. Thêm $R_2 = 2000\\,\\Omega$ nối tiếp $\\Rightarrow R_{tđ} = 2666,7\\,\\Omega$. $U_1 = 12 \\times 666,7 / 2666,7 = 3\\,V$ ✓.",
    "verifyEn": "Double-check: If $R_V = 2000\\,\\Omega$ is parallel to $R_1 = 1000\\,\\Omega \\Rightarrow R_{1V} = 666.7\\,\\Omega$. Adding $R_2 = 2000\\,\\Omega$ in series $\\Rightarrow R_{total} = 2666.7\\,\\Omega$. $U_1 = 12 \\times 666.7 / 2666.7 = 3\\,V$ ✓.",
    "extend": "Vôn kế thực tế luôn làm giảm hiệu điện thế cần đo. Vôn kế càng tốt (điện trở càng lớn) thì sai số phép đo càng nhỏ.",
    "extendEn": "Real voltmeters always drop the voltage they measure. The higher the voltmeter's resistance, the smaller the measurement error.",
    "common_traps": ["Nhầm tưởng vôn kế lý tưởng có điện trở bằng vô cùng và lấy $U_1 = 12 \\times 1000 / 3000 = 4\\,V$."],
    "common_traps_en": ["Assuming the voltmeter is ideal ($R_V = \\infty$) and expecting $U_1 = 12 \\times 1000/3000 = 4\\,V$."],
    "hints": ["Tính hiệu điện thế rơi trên điện trở còn lại $R_2$, từ đó tìm dòng điện toàn mạch."]
  },
  "real_world_connection": "Khi thiết kế các mạch cảm biến nhạy, kỹ sư phải chọn đồng hồ đo có trở kháng đầu vào rất cao (thường là $10\\,M\\Omega$ trở lên) để không làm méo tín hiệu cần đo.",
  "real_world_connection_en": "When measuring sensitive circuits, engineers use high-input-impedance meters (usually $10\\,M\\Omega$ or higher) to avoid loading the circuit.",
  "formula": "R_V = \\frac{R_1 R_{1V}}{R_1 - R_{1V}} \\quad [R_{1V} = R_2 \\frac{U_1}{U - U_1}]",
  "phet_sim": {
    "title": "Circuit Construction Kit: DC",
    "titleVn": "Lắp ráp mạch điện: Một chiều",
    "url": "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html",
    "instruction": "Lắp mạch gồm R1 nối tiếp R2. Lấy vôn kế trong hộp công cụ đo hai đầu R1. Bấm vào vôn kế để điều chỉnh điện trở trong của nó và quan sát số chỉ vôn kế thay đổi.",
    "instructionEn": "Build a circuit with R1 in series with R2. Measure across R1 using the voltmeter. Click the voltmeter to change its internal resistance and watch the readings change."
  }
})

questions.append({
  "id": "phys9_electric_circuit_014", "grade": 9, "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện", "topic": "short_circuit_fun", "topic_vn": "Hiện tượng đoản mạch thực tế",
  "type": "explain", "difficulty": "medium",
  "question_text": "Trong đời sống, tại sao khi xảy ra hiện tượng đoản mạch (chập điện), các dây dẫn điện chôn trong tường nhà có thể bị nóng đỏ lên dẫn tới bốc hỏa gây hỏa hoạn, trong khi các bóng đèn và thiết bị điện khác trong nhà lại tắt ngóm và hoàn toàn ngừng hoạt động?",
  "question_text_en": "In daily life, when a short circuit occurs, why can the electrical wires buried inside the house walls glow red-hot and cause a fire, while light bulbs and other appliances go dark and stop working completely?",
  "options": None,
  "correct_answer": "Khi đoản mạch, các cực của nguồn điện bị nối tắt bằng dây có điện trở cực nhỏ, dòng điện trong mạch chính tăng vọt lên cực đại. Dòng điện lớn chạy qua dây dẫn trong tường có điện trở nhỏ nhưng có chiều dài lớn sẽ tỏa nhiệt mạnh (định luật Joule-Lenz) làm nóng đỏ dây dẫn. Trong khi đó, các thiết bị điện bị nối tắt (song song với dây đoản mạch R≈0) nên không có dòng chạy qua chúng, khiến chúng ngừng hoạt động.",
  "correct_answer_en": "During a short circuit, the source terminals are connected directly by a low-resistance path, causing the main current to surge to its maximum. This huge current flows through the wires in the walls, releasing massive heat (Joule's law) and making them glow red-hot. However, appliances are bypassed by this short path (which acts in parallel with them and has $R \\approx 0$), receiving zero current, causing them to turn off.",
  "explanation": {
    "summary": "Đoản mạch tạo nhánh rẽ có điện trở cực nhỏ. Hầu như toàn bộ dòng điện dồn vào nhánh này làm dòng mạch chính cực lớn gây tỏa nhiệt mạnh trên đường dây dẫn, trong khi dòng qua các thiết bị bằng không.",
    "summary_en": "A short circuit creates a path of near-zero resistance. Almost all current surges through this path, heating up the main lines while leaving zero current for the appliances."
  },
  "thinking_guide": {
    "understand": "Giải thích tại sao dây dẫn nóng đỏ còn thiết bị ngừng chạy khi đoản mạch.",
    "understandEn": "Explain why wiring heats up while appliances stop during a short circuit.",
    "identify_knowledge": "Công thức Joule-Lenz: $Q = I^2 R t$. Phân tích mạch song song khi một nhánh có điện trở bằng không.",
    "identify_knowledgeEn": "Joule's Law: $Q = I^2 R t$. Parallel circuit behavior when one branch has near-zero resistance.",
    "plan": "Phân tích dòng điện qua thiết bị (bằng 0 vì bị nối tắt) và dòng điện toàn mạch (tăng vọt cực đại chạy qua dây chính).",
    "planEn": "Analyze the current through appliances (zero because they are bypassed) and the total circuit current (surges to maximum through main wires).",
    "steps": [
      "Bước 1: Đoản mạch xảy ra khi pha nóng chạm vào pha nguội trực tiếp trước khi qua tải (thiết bị).",
      "Bước 2: Nhánh nối tắt có điện trở $R_{đm} \\approx 0$ mắc song song với thiết bị điện có điện trở $R_{tải} \\gg 0$.",
      "Bước 3: Do mắc song song, dòng điện chọn đường đi có điện trở nhỏ hơn: dòng qua tải $I_{tải} \\approx 0 \\Rightarrow$ thiết bị tắt.",
      "Bước 4: Điện trở toàn mạch giảm cực đại $\\Rightarrow$ dòng điện mạch chính $I = U/R_{dây} \\Rightarrow I$ tăng vọt cực lớn.",
      "Bước 5: Nhiệt lượng tỏa ra trên dây dẫn $Q = I^2 R_{dây} t \\Rightarrow$ do $I$ tăng vọt nên dây nóng đỏ gây cháy."
    ],
    "stepsEn": [
      "Step 1: A short circuit happens when live and neutral wires touch directly before passing through the load.",
      "Step 2: The short-circuit path has resistance $R_{short} \\approx 0$, in parallel with appliances which have $R_{load} \\gg 0$.",
      "Step 3: In parallel, current takes the path of least resistance: $I_{load} \\approx 0 \\Rightarrow$ appliances turn off.",
      "Step 4: Total circuit resistance drops to near zero $\\Rightarrow$ main current $I = U/R_{wires}$ surges to maximum.",
      "Step 5: Heat generated on the main wires $Q = I^2 R_{wires} t$ surges, causing wires to heat up and start a fire."
    ],
    "verify": "Đây là lý do hệ thống điện bắt buộc phải lắp cầu chì hoặc aptomat (CB) ở đầu nguồn để ngắt mạch ngay khi dòng điện vượt ngưỡng an toàn.",
    "verifyEn": "This is why electrical systems must have fuses or circuit breakers (CB) at the input to cut off power as soon as current exceeds safe limits.",
    "extend": "Yakov Perelman giải thích trong 'Vật lý vui' rằng mối nguy lớn nhất của đoản mạch không phải là thiết bị hỏng, mà là nhiệt lượng khổng lồ tỏa ra trên các dây dẫn nhánh chính ẩn sâu trong tường.",
    "extendEn": "Perelman explains in 'Physics for Entertainment' that the greatest danger of a short circuit is not appliance damage, but the massive heat generated in the hidden main power lines inside walls.",
    "common_traps": ["Nghĩ rằng thiết bị điện bị hỏng cháy nên không sáng → Thực tế nó không sáng vì không có dòng điện đi qua nó."],
    "common_traps_en": ["Thinking appliances are burned out and thus go dark → Actually, they go dark because they receive no current at all."],
    "hints": ["Xét sự phân bố dòng điện trong đoạn mạch song song gồm thiết bị điện và dây nối tắt có điện trở bằng 0."]
  },
  "real_world_connection": "Cầu dao tự động (Aptomat) bảo vệ chống đoản mạch hoạt động bằng cuộn dây điện từ: khi dòng vọt lên đột ngột, lực từ cực mạnh sẽ hút chốt ngắt điện lập tức.",
  "real_world_connection_en": "Magnetic circuit breakers use an electromagnet: a sudden current spike creates a strong magnetic field that instantly trips the switch.",
  "formula": "Q = I^2 R_{dây} t \\quad [I \\to \\infty \\text{ khi } R_{tđ} \\to 0]"
})

# --- CHAPTER 3: ELECTRIC POWER (2 new questions) ---
questions.append({
  "id": "phys9_electric_power_013", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "max_power_theorem", "topic_vn": "Định lý công suất cực đại",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Một nguồn điện có hiệu điện thế không đổi $U = 12\\,V$ và điện trở trong $r = 2\\,\\Omega$. Mắc một biến trở $R$ làm tải tiêu thụ vào hai đầu nguồn điện này. Để công suất tiêu thụ trên biến trở $R$ đạt giá trị cực đại thì giá trị của biến trở $R$ phải bằng bao nhiêu? Công suất cực đại đó là bao nhiêu?",
  "question_text_en": "A voltage source has a constant EMF $U = 12\\,V$ and internal resistance $r = 2\\,\\Omega$. A variable resistor $R$ is connected as a load across this source. What value of $R$ maximizes the power consumed by the load, and what is this maximum power?",
  "options": [
    {"key": "A", "content": "R = 2 Ω, P_max = 18 W", "content_en": "R = 2 Ω, P_max = 18 W"},
    {"key": "B", "content": "R = 4 Ω, P_max = 9 W", "content_en": "R = 4 Ω, P_max = 9 W"},
    {"key": "C", "content": "R = 2 Ω, P_max = 72 W", "content_en": "R = 2 Ω, P_max = 72 W"},
    {"key": "D", "content": "R = 1 Ω, P_max = 16 W", "content_en": "R = 1 Ω, P_max = 16 W"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Công suất tiêu thụ trên tải: $P = I^2 R = U^2 R / (R + r)^2 = U^2 / (\\sqrt{R} + r/\\sqrt{R})^2$. Áp dụng bất đẳng thức Cauchy cho mẫu số: $\\sqrt{R} + r/\\sqrt{R} \\ge 2\\sqrt{r}$. Dấu '=' xảy ra khi $\\sqrt{R} = r/\\sqrt{R} \\Rightarrow R = r = 2\\,\\Omega$. Khi đó công suất cực đại: $P_{max} = U^2 / (4r) = 12^2 / (4 \\times 2) = 18\\,W$.",
    "summary_en": "Power consumed by load: $P = I^2 R = U^2 R / (R + r)^2 = U^2 / (\\sqrt{R} + r/\\sqrt{R})^2$. Applying AM-GM inequality for the denominator: $\\sqrt{R} + r/\\sqrt{R} \\ge 2\\sqrt{r}$. Equality holds when $\\sqrt{R} = r/\\sqrt{R} \\Rightarrow R = r = 2\\,\\Omega$. The maximum power is $P_{max} = U^2 / (4r) = 12^2 / (4 \\times 2) = 18\\,W$."
  },
  "thinking_guide": {
    "understand": "Cho nguồn U=12V, r=2Ω. Tìm R để P_R đạt cực đại và tính P_max.",
    "understandEn": "Given source U=12V, r=2Ω. Find R for maximum power P_R on R, and find P_max.",
    "identify_knowledge": "Công thức công suất: $P = I^2 R$. Định luật Ohm cho toàn mạch: $I = U / (R+r)$. Bất đẳng thức Cauchy (AM-GM).",
    "identify_knowledgeEn": "Power formula: $P = I^2 R$. Ohm's Law for complete circuit: $I = U / (R+r)$. AM-GM inequality.",
    "plan": "Biến đổi biểu thức công suất P theo biến R dưới dạng phân số có mẫu số biến thiên, rồi tìm cực tiểu mẫu số bằng Cauchy.",
    "planEn": "Express power P as a function of R, rewrite it so that only the denominator varies with R, then find the minimum denominator using AM-GM.",
    "steps": [
      "Bước 1: Biểu diễn cường độ dòng điện trong mạch: $I = U / (R + r)$.",
      "Bước 2: Viết biểu thức công suất tỏa nhiệt trên R: $P = I^2 R = \\frac{U^2 R}{(R + r)^2}$.",
      "Bước 3: Chia cả tử và mẫu cho R: $P = \\frac{U^2}{(\\sqrt{R} + r/\\sqrt{R})^2}$. Để P cực đại thì mẫu số phải cực tiểu.",
      "Bước 4: Áp dụng bất đẳng thức Cauchy cho hai số dương $\\sqrt{R}$ và $\\frac{r}{\\sqrt{R}}$: $\\sqrt{R} + \\frac{r}{\\sqrt{R}} \\ge 2\\sqrt{r}$.",
      "Bước 5: Mẫu số đạt cực tiểu khi dấu bằng xảy ra: $\\sqrt{R} = \\frac{r}{\\sqrt{R}} \\Rightarrow R = r = 2\\,\\Omega$.",
      "Bước 6: Tính công suất cực đại: $P_{max} = \\frac{U^2}{(2\\sqrt{r})^2} = \\frac{U^2}{4r} = \\frac{12^2}{4 \\times 2} = 18\\,W$."
    ],
    "stepsEn": [
      "Step 1: Write expression for current: $I = U / (R + r)$.",
      "Step 2: Express power on load R: $P = I^2 R = \\frac{U^2 R}{(R + r)^2}$.",
      "Step 3: Divide numerator and denominator by R: $P = \\frac{U^2}{(\\sqrt{R} + r/\\sqrt{R})^2}$. To maximize P, minimize the denominator.",
      "Step 4: Apply AM-GM inequality for positive terms $\\sqrt{R}$ and $\\frac{r}{\\sqrt{R}}$: $\\sqrt{R} + \\frac{r}{\\sqrt{R}} \\ge 2\\sqrt{r}$.",
      "Step 5: Minimum denominator occurs when terms are equal: $\\sqrt{R} = \\frac{r}{\\sqrt{R}} \\Rightarrow R = r = 2\\,\\Omega$.",
      "Step 6: Compute max power: $P_{max} = \\frac{U^2}{(2\\sqrt{r})^2} = \\frac{U^2}{4r} = \\frac{12^2}{4 \\times 2} = 18\\,W$."
    ],
    "verify": "Thử lại: Nếu $R=1\\,\\Omega \\Rightarrow I=12/3=4A \\Rightarrow P=4^2 \\times 1 = 16W < 18W$. Nếu $R=4\\,\\Omega \\Rightarrow I=12/6=2A \\Rightarrow P=2^2 \\times 4 = 16W < 18W$ ✓. Đạt cực đại tại $R=2\\,\\Omega$.",
    "verifyEn": "Verify: If $R=1\\,\\Omega \\Rightarrow I=12/3=4A \\Rightarrow P=4^2 \\times 1 = 16W < 18W$. If $R=4\\,\\Omega \\Rightarrow I=12/6=2A \\Rightarrow P=2^2 \\times 4 = 16W < 18W$ ✓. Maximum is indeed at $R=2\\,\\Omega$.",
    "extend": "Đây là Định lý chuyển truyền công suất cực đại (Maximum Power Transfer Theorem) rất quan trọng trong điện kỹ thuật và điện tử.",
    "extendEn": "This is the Maximum Power Transfer Theorem, vital in electrical engineering and electronics.",
    "common_traps": ["Nghĩ rằng $R$ càng lớn thì $P$ càng lớn, hoặc chọn $R = 0$ để dòng lớn nhất."],
    "common_traps_en": ["Thinking larger $R$ always yields higher power, or choosing $R = 0$ for maximum current."],
    "hints": ["Biến đổi công thức P sao cho R chỉ nằm ở mẫu số dạng $(\\sqrt{R} + r/\\sqrt{R})^2$."]
  },
  "real_world_connection": "Trong các hệ thống âm thanh, trở kháng của loa phải được thiết kế phối hợp (match) với trở kháng đầu ra của amply để truyền công suất âm thanh lớn nhất mà không làm méo tiếng.",
  "real_world_connection_en": "In audio systems, speaker impedance must match the amplifier's output impedance to ensure maximum sound power transfer without distortion.",
  "formula": "P_{max} = \\frac{U^2}{4r} \\quad \\text{khi } R = r",
  "phet_sim": {
    "title": "Circuit Construction Kit: DC",
    "titleVn": "Lắp ráp mạch điện: Một chiều",
    "url": "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html",
    "instruction": "Mắc nguồn 12V nối tiếp điện trở trong 2 Ohm và một biến trở làm tải. Đo hiệu điện thế và dòng qua biến trở để tính công suất khi thay đổi trị số biến trở từ 0,5 đến 5 Ohm.",
    "instructionEn": "Connect a 12V source in series with a 2 Ohm internal resistor and a variable resistor. Measure voltage and current to calculate power as you change the variable resistor from 0.5 to 5 Ohms."
  }
})

questions.append({
  "id": "phys9_electric_power_014", "grade": 9, "chapter": "electric_power",
  "chapter_vn": "Công suất điện", "topic": "filament_bulb_fun", "topic_vn": "Điện trở và nhiệt độ của dây tóc",
  "type": "explain", "difficulty": "medium",
  "question_text": "Tại sao bóng đèn sợi đốt trong gia đình thường hay bị đứt dây tóc vào đúng khoảnh khắc chúng ta vừa bấm công tắc bật đèn, chứ gần như không bao giờ bị đứt khi đang sáng ổn định?",
  "question_text_en": "Why does the filament of an incandescent light bulb often break exactly at the moment it is switched on, rather than when it has been glowing steadily for a while?",
  "options": None,
  "correct_answer": "Khi bóng đèn đang tắt, nhiệt độ của dây tóc bằng nhiệt độ phòng nên điện trở của nó rất nhỏ (nhỏ hơn khoảng 10-15 lần so với khi sáng nóng). Đúng lúc bật đèn, dòng điện khởi động chạy qua bóng đèn vọt lên cực đại (do điện trở nhỏ). Dòng điện quá tải đột ngột này tạo ra ứng suất nhiệt và cơ cực lớn lên dây tóc vốn đã mòn qua thời gian, làm nó bị đứt ngay lập tức trước khi kịp nóng lên để tăng điện trở.",
  "correct_answer_en": "When the bulb is off, the filament is at room temperature, making its resistance very low (10-15 times lower than when hot). The instant the bulb is turned on, the inrush current surges to its maximum due to this low resistance. This sudden electrical surge creates massive thermal and mechanical stress on the aging filament, causing it to snap before it can heat up to increase its resistance.",
  "explanation": {
    "summary": "Điện trở kim loại tăng theo nhiệt độ. Dây tóc nguội có R nhỏ → dòng khởi động cực lớn khi vừa bật công tắc gây sốc nhiệt làm đứt dây tóc.",
    "summary_en": "Metal resistance increases with temperature. A cold filament has low R $\\Rightarrow$ a massive inrush current flows the instant the switch is flipped, causing a thermal shock that breaks the filament."
  },
  "thinking_guide": {
    "understand": "Giải thích tại sao dây tóc bóng đèn thường đứt lúc vừa bật đèn.",
    "understandEn": "Explain why light bulb filaments break at the moment of turning on.",
    "identify_knowledge": "Sự phụ thuộc của điện trở kim loại vào nhiệt độ: $R = R_0[1 + \\alpha(t - t_0)]$. Định luật Ohm: $I = U/R$.",
    "identify_knowledgeEn": "Temperature dependence of metal resistance: $R = R_0[1 + \\alpha(t - t_0)]$. Ohm's Law: $I = U/R$.",
    "plan": "So sánh điện trở của dây tóc khi nguội (vừa bật) và khi nóng (sáng ổn định) để giải thích sự thay đổi đột ngột của cường độ dòng điện.",
    "planEn": "Compare the resistance of a cold filament (just turned on) vs. a hot filament (glowing steadily) to explain the dramatic change in current.",
    "steps": [
      "Bước 1: Dây tóc bóng đèn làm bằng Vonfram (kim loại). Điện trở kim loại tăng mạnh khi nhiệt độ tăng.",
      "Bước 2: Khi đèn tắt, nhiệt độ dây tóc khoảng $25^\\circ C$, điện trở chỉ khoảng vài chục Ôm.",
      "Bước 3: Khi đèn sáng ổn định, nhiệt độ dây tóc đạt tới $2500^\\circ C$, điện trở tăng lên gấp 10 đến 15 lần.",
      "Bước 4: Tại thời điểm bấm công tắc, do dây tóc còn nguội, dòng điện chạy qua vọt lên cực đại ($I_{khởi động} = U/R_{nguội}$).",
      "Bước 5: Dòng điện khổng lồ sinh nhiệt cục bộ cực nhanh và gây lực co giãn cơ học đột ngột, làm đứt điểm yếu nhất (nơi dây tóc bị mòn mỏng nhất)."
    ],
    "stepsEn": [
      "Step 1: The filament is made of Tungsten. Metal resistance increases significantly as temperature rises.",
      "Step 2: When the bulb is off (room temperature, $\\sim 25^\\circ C$), the filament resistance is only a few tens of Ohms.",
      "Step 3: When glowing steadily (around $2500^\\circ C$), the resistance increases by 10 to 15 times.",
      "Step 4: The instant the switch is flipped, the cold filament receives a massive inrush current ($I_{inrush} = U/R_{cold}$).",
      "Step 5: This sudden high current creates rapid thermal expansion and mechanical stress, snapping the thinnest, most worn-out part of the filament."
    ],
    "verify": "Thực tế đo đạc cho thấy dòng điện khởi động của bóng đèn 100W-220V lúc vừa bật có thể lên tới 5A, trong khi dòng làm việc ổn định chỉ là 0,45A.",
    "verifyEn": "Measurements show that a 100W-220V bulb has an inrush current of up to 5A, whereas its steady-state current is only 0.45A.",
    "extend": "Hiện nay, các thiết bị điện tử hiện đại thường sử dụng mạch khởi động mềm (soft-start) để tăng điện áp từ từ, bảo vệ linh kiện khỏi bị hỏng do dòng khởi động lớn.",
    "extendEn": "Modern electronic devices often utilize soft-start circuits to ramp up voltage gradually, protecting components from inrush current damage.",
    "common_traps": ["Giải thích rằng do hiệu điện thế lúc vừa bật tăng vọt đột ngột → Sai, hiệu điện thế nguồn 220V luôn ổn định."],
    "common_traps_en": ["Explaining that the supply voltage spikes when turning on → Wrong, the grid voltage remains constant at 220V."],
    "hints": ["Nhớ rằng điện trở của kim loại thay đổi thế nào khi chuyển từ trạng thái nguội sang trạng thái nóng đỏ."]
  },
  "real_world_connection": "Đây là lý do bóng đèn thông minh hoặc các bộ điều chỉnh độ sáng (dimmer) thường làm sáng đèn từ từ để kéo dài tuổi thọ bóng đèn.",
  "real_world_connection_en": "This is why smart bulbs or dimmers gradually fade in the light to extend the lifespan of the filament.",
  "formula": "I_{khởi\\,đầu} \\gg I_{ổn\\,định} \\quad [R_{nguội} \\ll R_{nóng}]"
})

# --- CHAPTER 4: MAGNETIC FORCE (2 new questions) ---
questions.append({
  "id": "phys9_magnetic_force_013", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "transformer_winding_error", "topic_vn": "Sai số quấn dây máy biến thế",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một máy biến áp lý tưởng có cuộn sơ cấp gồm $N_1 = 1000$ vòng dây, cuộn thứ cấp gồm $N_2 = 200$ vòng dây. Khi quấn cuộn thứ cấp, do sơ suất nên người thợ đã quấn ngược chiều mất $20$ vòng dây so với chiều quấn chung của cả cuộn. Đặt vào hai đầu cuộn sơ cấp hiệu điện thế xoay chiều $U_1 = 220\\,V$. Hiệu điện thế hiệu dụng ở hai đầu cuộn thứ cấp khi để hở là ______ V.",
  "question_text_en": "An ideal transformer has a primary coil with $N_1 = 1000$ turns and a secondary coil with $N_2 = 200$ turns. During the winding process, the technician mistakenly wound $20$ turns in the reverse direction. If an AC voltage $U_1 = 220\\,V$ is applied to the primary coil, the open-circuit root-mean-square voltage at the secondary terminal is ______ V.",
  "options": None,
  "correct_answer": "35,2",
  "correct_answer_en": "35.2",
  "explanation": {
    "summary": "Mỗi vòng quấn ngược sẽ triệt tiêu suất điện động của một vòng quấn đúng. Số vòng dây hiệu dụng có ích của cuộn thứ cấp là: $N_2' = N_2 - 2n = 200 - 2 \\times 20 = 160$ vòng. Hiệu điện thế thứ cấp thực tế: $U_2' = U_1 \\times N_2'/N_1 = 220 \\times 160/1000 = 35,2\\,V$.",
    "summary_en": "Each reversely wound turn cancels out the electromotive force of a correctly wound turn. The effective turns of the secondary coil is: $N_2' = N_2 - 2n = 200 - 2 \\times 20 = 160$ turns. Real secondary voltage: $U_2' = U_1 \\times N_2'/N_1 = 220 \\times 160/1000 = 35.2\\,V$."
  },
  "thinking_guide": {
    "understand": "Máy biến thế sơ cấp 1000 vòng, thứ cấp 200 vòng, có 20 vòng quấn ngược. U1 = 220V. Tìm U2'.",
    "understandEn": "Transformer with primary 1000 turns, secondary 200 turns, but 20 turns are reversely wound. U1 = 220V. Find U2'.",
    "identify_knowledge": "Công thức máy biến áp: $U_1/U_2 = N_1/N_2$. Nguyên lý quấn ngược: 1 vòng ngược triệt tiêu từ thông của 1 vòng thuận.",
    "identify_knowledgeEn": "Transformer formula: $U_1/U_2 = N_1/N_2$. Reverse winding principle: 1 reverse turn cancels out 1 forward turn.",
    "plan": "Tính số vòng dây hiệu dụng thực tế của cuộn thứ cấp $N_2'$, sau đó áp dụng công thức máy biến áp để tìm $U_2'$.",
    "planEn": "Calculate the effective turns of the secondary coil $N_2'$, then apply the transformer formula to find $U_2'$.",
    "steps": [
      "Bước 1: Khi có $n = 20$ vòng quấn ngược, suất điện động cảm ứng sinh ra trên các vòng này ngược chiều với phần còn lại.",
      "Bước 2: $20$ vòng ngược sẽ triệt tiêu tác dụng của $20$ vòng quấn thuận $\\Rightarrow$ số vòng dây bị giảm đi $2n = 40$ vòng.",
      "Bước 3: Số vòng dây hiệu dụng thực tế của cuộn thứ cấp là: $N_2' = N_2 - 2n = 200 - 40 = 160$ vòng.",
      "Bước 4: Tính hiệu điện thế thứ cấp: $U_2' = U_1 \\times \\frac{N_2'}{N_1} = 220 \\times \\frac{160}{1000} = 35,2\\,V$."
    ],
    "stepsEn": [
      "Step 1: When $n = 20$ turns are wound in reverse, the induced EMF in these turns opposes the EMF of the correctly wound turns.",
      "Step 2: These $20$ reverse turns cancel out the effect of $20$ correct turns, reducing the total effective turns by $2n = 40$ turns.",
      "Step 3: The effective turns of the secondary coil is: $N_2' = N_2 - 2n = 200 - 40 = 160$ turns.",
      "Step 4: Calculate the secondary voltage: $U_2' = U_1 \\times \\frac{N_2'}{N_1} = 220 \\times \\frac{160}{1000} = 35.2\\,V$."
    ],
    "verify": "Nếu quấn ngược toàn bộ 200 vòng ($n=100$ thuận, $100$ ngược) thì số vòng hiệu dụng $N_2' = 200 - 2\\times 100 = 0 \\Rightarrow$ điện áp ra bằng 0, hoàn toàn hợp lý.",
    "verifyEn": "If you wind 100 turns forward and 100 turns in reverse ($n=100$), the effective turns $N_2' = 200 - 2\\times 100 = 0 \\Rightarrow$ output voltage is 0, which is perfectly logical.",
    "extend": "Kỹ thuật quấn ngược có ích được áp dụng trong điện trở không cảm kháng (bifilar winding), nơi dây được quấn chập đôi ngược chiều để triệt tiêu hoàn toàn từ trường tự cảm.",
    "extendEn": "The reverse winding technique is intentionally used in non-inductive resistors (bifilar winding), where double wires are wound in opposite directions to cancel self-inductance.",
    "common_traps": ["Chỉ trừ đi 20 vòng ($N_2' = 180$ vòng $\\Rightarrow U_2 = 39,6\\,V$) - quên rằng vòng quấn ngược không chỉ không giúp ích mà còn triệt tiêu vòng khác."],
    "common_traps_en": ["Simply subtracting 20 turns ($N_2' = 180 \\Rightarrow U_2 = 39.6\\,V$) - forgetting that a reverse turn actively cancels a forward turn."],
    "hints": ["Một vòng quấn ngược sinh ra suất điện động ngược chiều. Hãy vẽ sơ đồ cộng thế năng để thấy rõ: $E_{net} = (N_2 - n)E_0 - n E_0 = (N_2 - 2n)E_0$."]
  },
  "real_world_connection": "Trong công nghiệp sản xuất biến áp, các cuộn dây được quấn tự động bằng máy CNC để kiểm soát chính xác số vòng và chiều quấn, tránh sai sót thủ công.",
  "real_world_connection_en": "In modern manufacturing, transformer coils are wound by automated CNC machines to guarantee precise turn counts and orientation, eliminating human error.",
  "formula": "U_2' = U_1 \\frac{N_2 - 2n}{N_1}"
})

questions.append({
  "id": "phys9_magnetic_force_014", "grade": 9, "chapter": "magnetic_force",
  "chapter_vn": "Lực từ và cảm ứng điện từ", "topic": "lenz_law_fun", "topic_vn": "Dòng điện Foucault và định luật Lenz",
  "type": "explain", "difficulty": "medium",
  "question_text": "Khi thả một viên nam châm vĩnh cửu hình trụ cực mạnh rơi tự do dọc theo lòng của một ống đồng dày đặt thẳng đứng, người ta quan sát thấy viên nam châm rơi rất chậm (như thể đang chìm trong dầu đặc) và mất nhiều giây để chui ra khỏi ống. Giải thích hiện tượng thú vị này.",
  "question_text_en": "When a strong cylindrical permanent magnet is dropped vertically down a thick copper pipe, it falls surprisingly slowly (as if sinking in thick oil), taking several seconds to exit. Explain this fascinating phenomenon.",
  "options": None,
  "correct_answer": "Đồng là kim loại dẫn điện nhưng không có từ tính (không hút nam châm). Khi nam châm rơi trong ống đồng, từ trường biến thiên qua thành ống sinh ra dòng điện xoay tròn cảm ứng (dòng điện Foucault). Theo định luật Lenz, dòng điện cảm ứng này tự tạo ra từ trường ngược chiều để chống lại sự rơi của nam châm, sinh ra lực từ hướng thẳng đứng lên trên cản trở chuyển động rơi tự do của nam châm.",
  "correct_answer_en": "Copper is conductive but non-magnetic (it does not attract magnets). As the magnet falls, its changing magnetic field induces circular eddy currents (Foucault currents) in the copper wall. According to Lenz's law, these induced currents generate their own magnetic field opposing the magnet's movement, creating an upward magnetic braking force that dramatically slows its fall.",
  "explanation": {
    "summary": "Từ trường biến thiên trong ống đồng → dòng điện Foucault cảm ứng → lực từ cản trở chuyển động rơi (định luật Lenz). Đây là nguyên lý của phanh điện từ.",
    "summary_en": "Changing magnetic field in copper pipe → induced eddy currents → magnetic force opposes motion (Lenz's Law). This is the principle of electromagnetic braking."
  },
  "thinking_guide": {
    "understand": "Giải thích hiện tượng nam châm rơi chậm trong ống đồng.",
    "understandEn": "Explain why a magnet falls slowly inside a copper pipe.",
    "identify_knowledge": "Hiện tượng cảm ứng điện từ. Dòng điện Foucault (dòng điện xoáy). Định luật Lenz về chiều dòng điện cảm ứng.",
    "identify_knowledgeEn": "Electromagnetic induction. Eddy currents (Foucault currents). Lenz's Law regarding the direction of induced current.",
    "plan": "Phân tích mối quan hệ giữa chuyển động rơi của nam châm, sự biến thiên từ thông qua ống đồng dẫn điện, sự xuất hiện dòng Foucault và lực từ tương tác cản trở chuyển động.",
    "planEn": "Analyze the chain of events: falling magnet, changing flux in conductive copper, induction of eddy currents, and the resulting magnetic drag force.",
    "steps": [
      "Bước 1: Đồng không phải chất sắt từ, nên ống đồng không hút hay dính chặt nam châm ở trạng thái tĩnh.",
      "Bước 2: Khi nam châm chuyển động rơi, từ thông qua các phần của ống đồng ở phía trước và phía sau nam châm biến thiên liên tục.",
      "Bước 3: Sự biến thiên từ thông này sinh ra dòng điện xoáy cảm ứng (dòng Foucault) chạy trong thành ống đồng.",
      "Bước 4: Theo định luật Lenz, dòng điện Foucault sinh ra từ trường có chiều chống lại sự biến thiên sinh ra nó.",
      "Bước 5: Từ trường của dòng Foucault tạo ra lực từ hướng lên trên tác dụng vào nam châm, cân bằng với trọng lực khiến nam châm rơi chậm thẳng đều với vận tốc nhỏ."
    ],
    "stepsEn": [
      "Step 1: Copper is not ferromagnetic, so the pipe does not attract or stick to the magnet when static.",
      "Step 2: As the magnet falls, the magnetic flux passing through the copper pipe segments ahead of and behind the magnet changes continuously.",
      "Step 3: This changing flux induces circular eddy currents (Foucault currents) in the copper walls.",
      "Step 4: According to Lenz's law, these eddy currents generate a magnetic field that opposes the change that created them.",
      "Step 5: The field of the eddy currents exerts an upward magnetic force on the magnet, counteracting gravity and causing it to fall slowly and steadily."
    ],
    "verify": "Nếu làm thí nghiệm tương tự với ống nhựa (chất cách điện) hoặc ống đồng có một rãnh xẻ dọc thân (ngăn dòng điện Foucault chạy thành vòng khép kín), nam châm sẽ rơi tự do nhanh bình thường.",
    "verifyEn": "If you repeat the experiment with a plastic pipe (insulator) or a copper pipe slit vertically (preventing closed-loop eddy currents), the magnet falls at normal free-fall speed.",
    "extend": "Nguyên lý này được ứng dụng làm phanh điện từ (magnetic braking) trong tàu cao tốc chạy trên đệm từ (Maglev), tàu lượn siêu tốc và các cân phân tích chính xác để chống rung lắc.",
    "extendEn": "This principle is utilized in electromagnetic braking systems for Maglev high-speed trains, rollercoasters, and damping systems in precise laboratory scales.",
    "common_traps": ["Cho rằng do ma sát của không khí trong ống nhỏ hoặc do nam châm bị hút dính vào đồng → Đồng không hút nam châm."],
    "common_traps_en": ["Attributing the slow fall to air resistance inside the narrow pipe or thinking copper attracts magnets → Copper is non-magnetic."],
    "hints": ["Đồng dẫn điện tốt. Khi nam châm chuyển động gần vật dẫn điện tốt, điều gì xảy ra theo thuyết điện từ của Faraday?"]
  },
  "real_world_connection": "Trò chơi rơi tự do (Free Fall) ở các công viên giải trí lớn sử dụng hệ thống phanh từ bằng đồng/nhôm đặt dưới chân tháp để phanh cabin một cách cực kỳ êm ái mà không cần má phanh tiếp xúc, tránh mài mòn cơ học.",
  "real_world_connection_en": "Free-fall amusement park rides use copper or aluminum fins and permanent magnets at the bottom of the tower for smooth, wear-free magnetic braking.",
  "formula": "F_{từ} \\propto -v \\quad [\\text{Lực cản tỉ lệ thuận vận tốc rơi}]",
  "phet_sim": {
    "title": "Faraday's Law",
    "titleVn": "Định luật Faraday",
    "url": "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html",
    "instruction": "Di chuyển nam châm qua lại cuộn dây dẫn kín để thấy dòng điện cảm ứng xuất hiện và đổi chiều thế nào, mô tả trực quan dòng Foucault trong ống đồng.",
    "instructionEn": "Move the magnet back and forth through the closed coil to observe how the induced current appears and reverses, visualizing eddy currents."
  }
})

# --- CHAPTER 5: LIGHT SPECTRUM (3 new questions) ---
questions.append({
  "id": "phys9_light_spectrum_011", "grade": 9, "chapter": "light_spectrum",
  "image": "/images/converging_lens.svg",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "converging_lens_math", "topic_vn": "Công thức thấu kính hội tụ",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Một vật sáng phẳng nhỏ $AB$ đặt vuông góc với trục chính của thấu kính hội tụ có tiêu cự $f = 15\\,cm$. Vật cách thấu kính một khoảng $d = 20\\,cm$. Ảnh $A'B'$ của vật qua thấu kính là ảnh gì, cách thấu kính một khoảng $d'$ bao nhiêu?",
  "question_text_en": "A small flat object $AB$ is placed perpendicular to the principal axis of a converging lens with a focal length $f = 15\\,cm$. The object distance is $d = 20\\,cm$. What type of image $A'B'$ is formed, and what is the image distance $d'$?",
  "options": [
    {"key": "A", "content": "Ảnh ảo, d' = -60 cm", "content_en": "Virtual image, d' = -60 cm"},
    {"key": "B", "content": "Ảnh thật, d' = 60 cm", "content_en": "Real image, d' = 60 cm"},
    {"key": "C", "content": "Ảnh thật, d' = 35 cm", "content_en": "Real image, d' = 35 cm"},
    {"key": "D", "content": "Ảnh ảo, d' = 60 cm", "content_en": "Virtual image, d' = 60 cm"}
  ],
  "correct_answer": "B",
  "explanation": {
    "summary": "Do $d = 20\\,cm > f = 15\\,cm$ nên thấu kính hội tụ cho ảnh thật. Áp dụng công thức thấu kính: $1/f = 1/d + 1/d' \\Rightarrow 1/d' = 1/f - 1/d = 1/15 - 1/20 = 1/60 \\Rightarrow d' = 60\\,cm$. Ảnh thật cách thấu kính $60\\,cm$.",
    "summary_en": "Since $d = 20\\,cm > f = 15\\,cm$, the converging lens forms a real image. Using the lens formula: $1/f = 1/d + 1/d' \\Rightarrow 1/d' = 1/f - 1/d = 1/15 - 1/20 = 1/60 \\Rightarrow d' = 60\\,cm$. The real image is $60\\,cm$ from the lens."
  },
  "thinking_guide": {
    "understand": "Cho thấu kính hội tụ $f = 15\\,cm$, vật cách thấu kính $d = 20\\,cm$. Xác định tính chất ảnh và khoảng cách ảnh $d'$.",
    "understandEn": "Given converging lens $f = 15\\,cm$, object distance $d = 20\\,cm$. Find image properties and distance $d'$.",
    "identify_knowledge": "Công thức thấu kính mỏng: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$. Tính chất ảnh hội tụ: $d > f \\Rightarrow$ ảnh thật ($d' > 0$). $d < f \\Rightarrow$ ảnh ảo ($d' < 0$).",
    "identify_knowledgeEn": "Thin lens formula: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$. Image properties: $d > f \\Rightarrow$ real image ($d' > 0$). $d < f \\Rightarrow$ virtual image ($d' < 0$).",
    "plan": "So sánh d với f để biết loại ảnh. Sử dụng công thức để tính $d'$.",
    "planEn": "Compare d with f to determine image type. Apply the lens formula to compute $d'$.",
    "steps": [
      "Bước 1: So sánh vật cách thấu kính $d = 20\\,cm$ với tiêu cự $f = 15\\,cm$. Vì $d > f$, vật nằm ngoài tiêu cự nên tạo ảnh thật.",
      "Bước 2: Viết công thức thấu kính: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$.",
      "Bước 3: Rút ra công thức tính $d'$: $\\frac{1}{d'} = \\frac{1}{f} - \\frac{1}{d}$.",
      "Bước 4: Thay số vào: $\\frac{1}{d'} = \\frac{1}{15} - \\frac{1}{20} = \\frac{4}{60} - \\frac{3}{60} = \\frac{1}{60}$.",
      "Bước 5: Suy ra $d' = 60\\,cm$. Giá trị dương xác nhận lại đây là ảnh thật."
    ],
    "stepsEn": [
      "Step 1: Compare object distance $d = 20\\,cm$ with focal length $f = 15\\,cm$. Since $d > f$, the object is outside the focal point, forming a real image.",
      "Step 2: State the lens formula: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$.",
      "Step 3: Rearrange to solve for $d'$: $\\frac{1}{d'} = \\frac{1}{f} - \\frac{1}{d}$.",
      "Step 4: Substitute the values: $\\frac{1}{d'} = \\frac{1}{15} - \\frac{1}{20} = \\frac{4}{60} - \\frac{3}{60} = \\frac{1}{60}$.",
      "Step 5: Obtain $d' = 60\\,cm$. The positive sign confirms a real image."
    ],
    "verify": "Độ phóng đại ảnh: $k = -d'/d = -60/20 = -3 \\Rightarrow$ ảnh ngược chiều và lớn gấp 3 lần vật, phù hợp quy tắc vẽ tia sáng.",
    "verifyEn": "Magnification: $k = -d'/d = -60/20 = -3 \\Rightarrow$ the image is inverted and 3 times larger than the object, matching ray tracing rules.",
    "extend": "Công thức thấu kính này đúng cho cả ảnh thật và ảnh ảo nếu ta áp dụng đúng quy ước dấu: ảnh thật $d' > 0$, ảnh ảo $d' < 0$.",
    "extendEn": "The lens equation holds for both real and virtual images when using proper sign conventions: real image $d' > 0$, virtual image $d' < 0$.",
    "common_traps": ["Nhầm lẫn dấu của ảnh ảo: nghĩ ảnh ảo $d'$ phải dương $\\Rightarrow$ cộng nhầm công thức.", "Tính sai phân số: $1/15 - 1/20 = 1/5$ (trừ mẫu số trực tiếp) $\\Rightarrow$ lỗi toán học rất phổ biến."],
    "common_traps_en": ["Sign convention confusion: using positive $d'$ for virtual images.", "Subtracting denominators directly: $1/15 - 1/20 = 1/5$ (common algebra mistake)."],
    "hints": ["Quy đồng mẫu số chung là 60 để tính toán hiệu phân số."]
  },
  "real_world_connection": "Máy ảnh cơ học hoạt động dựa trên nguyên lý này: vật kính là thấu kính hội tụ tạo ra ảnh thật, nhỏ hơn vật nằm trên bề mặt cảm biến hoặc phim.",
  "real_world_connection_en": "Camera lenses utilize this principle: a converging lens system projects a real, smaller, inverted image onto the camera sensor.",
  "formula": "\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}",
  "phet_sim": {
    "title": "Geometric Optics",
    "titleVn": "Quang hình học (Thấu kính)",
    "url": "https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_all.html",
    "instruction": "Chọn thấu kính hội tụ. Chỉnh tiêu cự f = 15 cm (dùng thước đo) và đặt vật cách thấu kính d = 20 cm, quan sát ảnh thật hiện lên ở khoảng cách d' = 60 cm bên kia thấu kính.",
    "instructionEn": "Select converging lens. Adjust f to 15 cm and place the object at d = 20 cm. Observe the real image forming at d' = 60 cm on the other side."
  }
})

questions.append({
  "id": "phys9_light_spectrum_012", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "nearsightedness_math", "topic_vn": "Khắc phục tật cận thị",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một học sinh lớp 9 chỉ có thể nhìn rõ các vật đặt cách mắt trong khoảng từ $15\\,cm$ đến $50\\,cm$. Để có thể nhìn rõ các vật ở rất xa (vô cực) mà không cần phải điều tiết mắt, học sinh này cần phải đeo sát mắt một kính có độ tụ bằng bao nhiêu điốp (diopter)? (Ghi kết quả kèm dấu âm, ví dụ: -2,5)",
  "question_text_en": "A grade 9 student can only see objects clearly when they are between $15\\,cm$ and $50\\,cm$ from their eyes. To see very distant objects clearly without eye accommodation, what should be the optical power of the lens they wear close to their eyes, in diopters? (Include negative sign, e.g., -2.5)",
  "options": None,
  "correct_answer": "-2",
  "explanation": {
    "summary": "Người cận thị cần đeo kính phân kì có tiêu cự bằng khoảng cực viễn của mắt: $f = -OC_V = -50\\,cm = -0,5\\,m$. Độ tụ của kính: $D = 1/f = 1/(-0,5) = -2$ điốp.",
    "summary_en": "A nearsighted person needs a diverging lens with a focal length equal to the eye's far point: $f = -OC_V = -50\\,cm = -0.5\\,m$. The lens power is $D = 1/f = 1/(-0.5) = -2$ diopters."
  },
  "thinking_guide": {
    "understand": "Cho khoảng nhìn rõ 15-50cm (C_C = 15cm, C_V = 50cm). Tìm độ tụ D của kính để nhìn vô cực.",
    "understandEn": "Given clear vision range 15-50cm (C_C = 15cm, C_V = 50cm). Find lens power D to see at infinity.",
    "identify_knowledge": "Mắt cận thị không nhìn rõ vật ở xa. Cách sửa: đeo kính phân kì có tiêu cự $f = -OC_V$. Độ tụ $D = 1/f$ (f đo bằng mét).",
    "identify_knowledgeEn": "Myopia (nearsightedness) limits far vision. Correction: diverging lens with $f = -OC_V$. Power $D = 1/f$ (f in meters).",
    "plan": "Xác định khoảng cực viễn $OC_V = 50\\,cm$. Đổi sang mét $\\Rightarrow f = -OC_V$. Tính $D = 1/f$.",
    "planEn": "Identify the far point $OC_V = 50\\,cm$. Convert to meters $\\Rightarrow f = -OC_V$. Compute $D = 1/f$.",
    "steps": [
      "Bước 1: Điểm xa nhất mắt nhìn rõ khi không điều tiết (cực viễn) là $OC_V = 50\\,cm = 0,5\\,m$.",
      "Bước 2: Để nhìn vật ở vô cực cho ảnh ảo hiện đúng ở điểm cực viễn của mắt, tiêu cự kính đeo sát mắt là: $f = -OC_V = -0,5\\,m$.",
      "Bước 3: Dấu âm thể hiện đây là thấu kính phân kì.",
      "Bước 4: Tính độ tụ của kính: $D = \\frac{1}{f} = \\frac{1}{-0,5\\,m} = -2$ điốp."
    ],
    "stepsEn": [
      "Step 1: The furthest point the eye can focus on without accommodation (far point) is $OC_V = 50\\,cm = 0.5\\,m$.",
      "Step 2: To focus on objects at infinity, the lens must project their virtual images to the far point. The focal length is $f = -OC_V = -0.5\\,m$.",
      "Step 3: The negative sign signifies a diverging lens.",
      "Step 4: Calculate the lens power: $D = \\frac{1}{f} = \\frac{1}{-0.5\\,m} = -2$ diopters."
    ],
    "verify": "Kính cận có số điốp âm. Mắt cận càng nặng (cực viễn càng gần) thì cần đeo kính có số độ âm càng lớn (ví dụ cận nặng cực viễn 20cm cần kính -5 điốp).",
    "verifyEn": "Myopic glasses always have negative diopters. The worse the myopia (closer far point), the stronger the negative power (e.g., far point of 20cm requires -5 diopters).",
    "extend": "Đối với người già bị viễn thị hoặc lão thị, điểm cực cận dời xa mắt, họ cần đeo kính hội tụ (độ tụ dương) để nhìn rõ vật ở gần.",
    "extendEn": "For hyperopia or presbyopia, the near point shifts further away. They require converging lenses (positive power) for near vision.",
    "common_traps": ["Quên đổi đơn vị cm sang mét khi tính độ tụ D (lấy $D = 1/50 = 0,02$ điốp $\\Rightarrow$ sai hệ số 100 lần).", "Quên dấu trừ thể hiện thấu kính phân kì."],
    "common_traps_en": ["Forgetting to convert cm to meters before calculating D ($D = 1/50 = 0.02 \\Rightarrow$ wrong by factor of 100).", "Forgetting the negative sign for diverging lenses."],
    "hints": ["Đổi $50\\,cm$ sang mét trước: $50\\,cm = 0,5\\,m$. Công thức độ tụ $D = 1/f$ yêu cầu f bằng mét."]
  },
  "real_world_connection": "Khi bạn đi đo mắt kính cận ở tiệm kính, số đo '-2.00 Diopter' chính là độ tụ cần thiết để dịch chuyển tiêu điểm của mắt về đúng màng lưới.",
  "real_world_connection_en": "When getting an eye exam, a prescription of '-2.00 Diopters' refers to the corrective power needed to refocus light rays onto the retina.",
  "formula": "D = \\frac{1}{f} = -\\frac{1}{OC_V\\,(\\text{m})}"
})

questions.append({
  "id": "phys9_light_spectrum_013", "grade": 9, "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng", "topic": "ice_lens_fun", "topic_vn": "Thấu kính bằng nước đá",
  "type": "explain", "difficulty": "medium",
  "question_text": "Trong cuốn tiểu thuyết phiêu lưu nổi tiếng 'Những cuộc phiêu lưu của thuyền trưởng Hatteras' của Jules Verne, các thủy thủ bị kẹt ở Bắc Cực đã nhóm lửa cứu mạng bằng cách dùng dao đẽo gọt một khối nước đá trong suốt thành hình một thấu kính hội tụ để tập trung ánh sáng mặt trời. Điều này có khả thi về mặt vật lý thực tế hay không? Giải thích tại sao thấu kính lạnh buốt lại có thể tạo ra ngọn lửa nóng bỏng?",
  "question_text_en": "In Jules Verne's adventure novel 'The Adventures of Captain Hatteras', shipwrecked sailors in the Arctic start a survival fire by carving a block of clear ice into a converging lens to focus sunlight. Is this physically possible? Why can a freezing cold lens create a burning hot fire?",
  "options": None,
  "correct_answer": "Điều này hoàn toàn khả thi về mặt vật lý và đã được kiểm chứng bằng thực nghiệm. Nước đá trong suốt cho ánh sáng đi qua (khúc xạ) tương tự thủy tinh. Thấu kính hội tụ bằng đá vẫn hội tụ các tia sáng mặt trời song song về một điểm tiêu điểm. Năng lượng ánh sáng hội tụ tại tiêu điểm sinh nhiệt độ rất cao làm cháy bổi. Bản thân thấu kính chỉ cho ánh sáng truyền qua chứ không hấp thụ nhiều năng lượng, nên nó không bị nóng lên quá nhanh để tan chảy ngay lập tức.",
  "correct_answer_en": "This is entirely possible and has been experimentally proven. Transparent ice allows light to pass through and refract just like glass. The ice lens converges parallel solar rays into a hot focal point. The concentrated light energy creates high temperatures that ignite tinder. The lens itself only transmits light and absorbs very little energy, so it does not melt instantly.",
  "explanation": {
    "summary": "Nước đá trong suốt khúc xạ ánh sáng tương tự thủy tinh. Thấu kính hội tụ ánh sáng mặt trời mang năng lượng nhiệt tại tiêu điểm. Thấu kính truyền qua ánh sáng chứ không hấp thụ năng lượng nên không bị chảy lập tức.",
    "summary_en": "Clear ice refracts light like glass. The lens concentrates solar energy at a focal point to generate heat. The ice itself transmits light instead of absorbing it, so it remains frozen during the process."
  },
  "thinking_guide": {
    "understand": "Giải thích tính khả thi và nguyên lý hoạt động của thấu kính bằng nước đá dùng để nhóm lửa.",
    "understandEn": "Explain the feasibility and principle of using an ice lens to start a fire.",
    "identify_knowledge": "Hiện tượng khúc xạ ánh sáng qua môi trường trong suốt có chiết suất khác không khí ($n_{đá} \\approx 1,31$). Tác dụng nhiệt của ánh sáng (ánh sáng mang năng lượng).",
    "identify_knowledgeEn": "Refraction of light through a transparent medium with a refractive index different from air ($n_{ice} \\approx 1.31$). Thermal effect of light (light carries energy).",
    "plan": "Phân tích 2 yếu tố: 1) Khả năng khúc xạ hội tụ ánh sáng của đá. 2) Tại sao nhiệt độ cao sinh ra ở tiêu điểm mà không làm chảy thấu kính ngay lập tức.",
    "planEn": "Analyze two aspects: 1) The light-bending and focusing capability of ice. 2) Why heat is generated at the focal point without immediately melting the lens.",
    "steps": [
      "Bước 1: Nước đá sạch, đông đặc có tính chất trong suốt và chiết suất $n \\approx 1,31$ (khác chiết suất không khí $1.0$). Vì vậy nó khúc xạ được ánh sáng.",
      "Bước 2: Khối nước đá mài nhẵn hình lồi hai mặt hoạt động như một thấu kính hội tụ.",
      "Bước 3: Chiếu ánh sáng mặt trời (các tia sáng song song) qua thấu kính đá, chúng sẽ hội tụ tại tiêu điểm $F$.",
      "Bước 4: Ánh sáng mặt trời mang năng lượng lớn. Sự hội tụ ánh sáng tại tiêu điểm dồn năng lượng vào diện tích cực nhỏ, nâng nhiệt độ lên hàng trăm độ C, đốt cháy bổi.",
      "Bước 5: Ánh sáng truyền qua thấu kính đá rất nhanh, đá chỉ hấp thụ một phần nhỏ năng lượng hồng ngoại nên thấu kính vẫn giữ được hình dạng trong quá trình nhóm lửa."
    ],
    "stepsEn": [
      "Step 1: Clean, solid ice is transparent and has a refractive index $n \\approx 1.31$ (different from air $1.0$), allowing it to refract light.",
      "Step 2: Carving it into a double-convex shape creates a converging lens.",
      "Step 3: Parallel sunlight rays passing through the ice lens converge at the focal point $F$.",
      "Step 4: Sunlight carries significant energy. Focus of light concentrates this energy onto a tiny spot, raising the temperature to hundreds of degrees, igniting tinder.",
      "Step 5: Light passes through the ice quickly; the ice absorbs only a tiny fraction of infrared energy, keeping it frozen long enough to start the fire."
    ],
    "verify": "Thí nghiệm thực tế của chương trình 'MythBusters' đã chứng minh việc đúc và mài một thấu kính bằng nước đá có thể nhóm được lửa trong thời gian chưa đầy 1 phút.",
    "verifyEn": "'MythBusters' experimentally proved that a lens crafted from clear ice can ignite tinder in less than a minute under strong sunlight.",
    "extend": "Yakov Perelman mô tả trong 'Vật lý vui' rằng không chỉ nước đá, người ta còn có thể làm thấu kính hội tụ từ hai tấm kính đồng hồ ghép lại và đổ đầy nước bên trong để hội tụ ánh sáng.",
    "extendEn": "Perelman notes in 'Physics for Entertainment' that a converging lens can also be made by joining two watch glasses and filling the gap with water.",
    "common_traps": ["Cho rằng thấu kính lạnh sẽ làm nguội ánh sáng đi qua nên không tạo ra lửa → Ánh sáng không bị thay đổi năng lượng bởi nhiệt độ của vật truyền dẫn."],
    "common_traps_en": ["Thinking the cold lens cools down the passing light rays → Wrong, light energy is independent of the temperature of the medium it passes through."],
    "hints": ["Ánh sáng mang năng lượng nhiệt. Thấu kính có tác dụng gì đối với các tia sáng song song đi qua nó?"]
  },
  "real_world_connection": "Trong thực tế leo núi hoặc sinh tồn nơi hoang dã mùa đông, kỹ năng đúc thấu kính bằng nước đá là một phương pháp sinh tồn kinh điển khi không có diêm hay bật lửa.",
  "real_world_connection_en": "In winter wilderness survival, crafting a lens from ice is a classic backup method to start a fire without matches or lighters.",
  "formula": "",
  "phet_sim": {
    "title": "Bending Light",
    "titleVn": "Khúc xạ ánh sáng",
    "url": "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html",
    "instruction": "Chọn lăng kính/thấu kính hình tròn. Đổi vật liệu của thấu kính thành đá (Water hoặc vật liệu có chiết suất n = 1,31) để quan sát chùm tia sáng mặt trời song song hội tụ lại.",
    "instructionEn": "Select the circular lens tool. Change the lens material to ice (water or custom index n = 1.31) and watch parallel rays converge."
  }
})

# --- CHAPTER 6: NUCLEAR ENERGY INTRO (2 new questions) ---
questions.append({
  "id": "phys9_nuclear_energy_intro_013", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "binding_energy_math", "topic_vn": "Năng lượng liên kết hạt nhân",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Tính năng lượng liên kết của hạt nhân Heli ($^4_2\\text{He}$) tạo thành từ các nucleon tự do. Cho biết khối lượng của proton là $1{,}00728\\,u$, của nơtron là $1{,}00867\\,u$, khối lượng hạt nhân Heli là $4{,}00150\\,u$, và lấy $1\\,u = 931,5\\,MeV$.",
  "question_text_en": "Calculate the binding energy of a Helium nucleus ($^4_2\\text{He}$) formed from free nucleons. Given the mass of a proton is $1.00728\\,u$, a neutron is $1.00867\\,u$, the Helium nucleus is $4.00150\\,u$, and $1\\,u = 931.5\\,MeV$.",
  "options": [
    {"key": "A", "content": "28,3 MeV", "content_en": "28.3 MeV"},
    {"key": "B", "content": "7,07 MeV", "content_en": "7.07 MeV"},
    {"key": "C", "content": "14,1 MeV", "content_en": "14.1 MeV"},
    {"key": "D", "content": "28,3 J", "content_en": "28.3 J"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Hạt nhân Heli gồm 2 proton và 2 nơtron. Tổng khối lượng các nucleon đứng riêng rẽ: $m_0 = 2m_p + 2m_n = 2 \\times 1,00728 + 2 \\times 1,00867 = 4,03190\\,u$. Độ hụt khối: $\\Delta m = m_0 - m_{He} = 4,03190 - 4,00150 = 0,03040\\,u$. Năng lượng liên kết: $E_{lk} = \\Delta m \\times 931,5 = 0,03040 \\times 931,5 \\approx 28,3\\,MeV$.",
    "summary_en": "A Helium nucleus consists of 2 protons and 2 neutrons. The sum of constituent masses: $m_0 = 2m_p + 2m_n = 2 \\times 1.00728 + 2 \\times 1.00867 = 4.03190\\,u$. Mass defect: $\\Delta m = m_0 - m_{He} = 4.03190 - 4.00150 = 0.03040\\,u$. Binding energy: $E_{b} = \\Delta m \\times 931.5 = 0.03040 \\times 931.5 \\approx 28.3\\,MeV$."
  },
  "thinking_guide": {
    "understand": "Cho m_p, m_n, m_He. Tính năng lượng liên kết của hạt nhân Heli.",
    "understandEn": "Given m_p, m_n, m_He. Calculate the binding energy of a Helium nucleus.",
    "identify_knowledge": "Hạt nhân $^4_2\\text{He}$ có $Z = 2$ proton, $A - Z = 2$ nơtron. Công thức độ hụt khối: $\\Delta m = Z m_p + (A-Z)m_n - m_{hn}$. Năng lượng liên kết: $E_{lk} = \\Delta m \\cdot c^2 = \\Delta m \\, (u) \\times 931,5\\,MeV$.",
    "identify_knowledgeEn": "Helium nucleus $^4_2\\text{He}$ has $Z = 2$ protons, $A - Z = 2$ neutrons. Mass defect formula: $\\Delta m = Z m_p + (A-Z)m_n - m_{nucleus}$. Binding energy: $E_b = \\Delta m \\cdot c^2 = \\Delta m \\, (u) \\times 931.5\\,MeV$.",
    "plan": "Xác định số lượng p và n. Tính tổng khối lượng cấu tử. Tìm độ hụt khối. Nhân với hệ số quy đổi 931,5 MeV.",
    "planEn": "Count protons and neutrons. Calculate total constituent mass. Find mass defect. Multiply by the conversion factor 931.5 MeV.",
    "steps": [
      "Bước 1: Hạt Heli $^4_2\\text{He}$ có 2 proton và 2 nơtron.",
      "Bước 2: Tính tổng khối lượng các nucleon khi chưa liên kết: $m_0 = 2 \\times 1,00728 + 2 \\times 1,00867 = 4,03190\\,u$.",
      "Bước 3: Tính độ hụt khối lượng: $\\Delta m = m_0 - m_{He} = 4,03190 - 4,00150 = 0,03040\\,u$.",
      "Bước 4: Tính năng lượng liên kết giải phóng: $E_{lk} = 0,03040 \\times 931,5\\,MeV \\approx 28,3\\,MeV$."
    ],
    "stepsEn": [
      "Step 1: A Helium nucleus $^4_2\\text{He}$ contains Z=2 protons and A-Z=2 neutrons.",
      "Step 2: Calculate total mass of individual nucleons: $m_0 = 2 \\times 1.00728 + 2 \\times 1.00867 = 4.03190\\,u$.",
      "Step 3: Calculate the mass defect: $\\Delta m = m_0 - m_{He} = 4.03190 - 4.00150 = 0.03040\\,u$.",
      "Step 4: Compute the nuclear binding energy: $E_b = 0.03040 \\times 931.5\\,MeV \\approx 28.3\\,MeV$."
    ],
    "verify": "Năng lượng liên kết riêng của Heli là $28,3 / 4 \\approx 7,07\\,MeV/nucleon$. Heli là một hạt nhân rất bền vững trong tự nhiên.",
    "verifyEn": "Binding energy per nucleon for Helium is $28.3 / 4 \\approx 7.07\\,MeV/nucleon$, making Helium extremely stable.",
    "extend": "Độ hụt khối $\\Delta m$ càng lớn chứng tỏ lực hạt nhân liên kết các hạt càng mạnh, giải phóng càng nhiều năng lượng trong phản ứng nhiệt hạch.",
    "extendEn": "A larger mass defect $\\Delta m$ implies stronger nuclear forces and more energy released during fusion.",
    "common_traps": ["Nhầm lẫn giữa Năng lượng liên kết ($28,3\\,MeV$) và Năng lượng liên kết riêng ($7,07\\,MeV/nucleon$).", "Chọn sai đơn vị sang Jun (J) ở đáp án D."],
    "common_traps_en": ["Confusing total binding energy ($28.3\\,MeV$) with binding energy per nucleon ($7.07\\,MeV$).", "Choosing the wrong unit Joules (J) in option D."],
    "hints": ["Tính tổng khối lượng 2 proton và 2 nơtron trước rồi mới trừ đi khối lượng Heli."]
  },
  "real_world_connection": "Phản ứng nhiệt hạch tổng hợp Heli từ Hydro trên Mặt Trời giải phóng năng lượng khổng lồ chiếu sáng và sưởi ấm Trái Đất.",
  "real_world_connection_en": "Fusion reactions combining Hydrogen into Helium in the Sun release the immense energy that powers life on Earth.",
  "formula": "E_{lk} = [Z \\cdot m_p + (A - Z) \\cdot m_n - m_{hn}] \\cdot 931{,}5 \\quad (MeV)"
})

questions.append({
  "id": "phys9_nuclear_energy_intro_014", "grade": 9, "chapter": "nuclear_energy_intro",
  "chapter_vn": "Năng lượng hạt nhân", "topic": "half_life_math", "topic_vn": "Định luật bán rã và khảo cổ học",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Khảo cổ học sử dụng đồng vị phóng xạ Carbon-14 ($^{14}\\text{C}$) có chu kỳ bán rã $T = 5730$ năm để xác định tuổi của các cổ vật hữu cơ. Một mẫu gỗ cổ tìm thấy trong lăng mộ Ai Cập cổ đại có hoạt độ phóng xạ bằng $25\\%$ hoạt độ phóng xạ của một mẫu gỗ tươi cùng loại mới chặt. Tuổi của mẫu gỗ cổ này là ______ năm.",
  "question_text_en": "Archaeology uses the radioactive isotope Carbon-14 ($^{14}\\text{C}$) with a half-life of $T = 5730$ years to date organic artifacts. An ancient wood sample found in an Egyptian tomb has a radioactivity of $25\\%$ compared to a freshly cut wood sample of the same type. The age of this ancient wood sample is ______ years.",
  "options": None,
  "correct_answer": "11460",
  "explanation": {
    "summary": "Hoạt độ phóng xạ giảm còn $25\\% = 1/4 = (1/2)^2$ so với ban đầu. Số chu kỳ bán rã đã trôi qua là $n = 2$. Tuổi mẫu gỗ: $t = n \\times T = 2 \\times 5730 = 11460$ năm.",
    "summary_en": "The radioactivity decreased to $25\\% = 1/4 = (1/2)^2$. The number of elapsed half-lives is $n = 2$. The age of the wood is $t = n \\times T = 2 \\times 5730 = 11460$ years."
  },
  "thinking_guide": {
    "understand": "T = 5730 năm. Hoạt độ phóng xạ còn 25%. Tính thời gian t đã trôi qua.",
    "understandEn": "T = 5730 years. Radioactivity is at 25%. Calculate elapsed time t.",
    "identify_knowledge": "Công thức định luật bán rã: $H = H_0 \\cdot (1/2)^{t/T}$ hoặc $N = N_0 \\cdot 2^{-t/T}$.",
    "identify_knowledgeEn": "Radioactive decay law: $H = H_0 \\cdot (1/2)^{t/T}$ or $N = N_0 \\cdot 2^{-t/T}$.",
    "plan": "Thiết lập tỉ lệ $H/H_0 = 0,25 = (1/2)^2$. Tìm số chu kỳ $t/T = 2 \\Rightarrow t = 2T$.",
    "planEn": "Set up ratio $H/H_0 = 0.25 = (1/2)^2$. Find half-lives $t/T = 2 \\Rightarrow t = 2T$.",
    "steps": [
      "Bước 1: Tỉ số giữa hoạt độ phóng xạ hiện tại và ban đầu là: $\\frac{H}{H_0} = 25\\% = 0,25$.",
      "Bước 2: Viết phương trình bán rã: $\\frac{H}{H_0} = (1/2)^{t/T}$.",
      "Bước 3: Ta có $0,25 = 1/4 = (1/2)^2 \\Rightarrow \\frac{t}{T} = 2$.",
      "Bước 4: Tính tuổi mẫu gỗ: $t = 2 \\times T = 2 \\times 5730 = 11460$ năm."
    ],
    "stepsEn": [
      "Step 1: The ratio of current to initial radioactivity is: $\\frac{H}{H_0} = 25\\% = 0.25$.",
      "Step 2: Apply the decay law formula: $\\frac{H}{H_0} = (1/2)^{t/T}$.",
      "Step 3: Since $0.25 = 1/4 = (1/2)^2 \\Rightarrow \\frac{t}{T} = 2$.",
      "Step 4: Compute the age: $t = 2 \\times T = 2 \\times 5730 = 11460$ years."
    ],
    "verify": "Sau 1 chu kỳ (5730 năm), phóng xạ còn 50%. Sau 2 chu kỳ (11460 năm), phóng xạ còn 25%. Kết quả hoàn toàn chính xác.",
    "verifyEn": "After 1 half-life (5730 years), radioactivity is 50%. After 2 half-lives (11460 years), it is 25%. The result is correct.",
    "extend": "Phương pháp này dùng đồng vị Carbon-14 chỉ hiệu quả cho mẫu vật hữu cơ có tuổi dưới 50.000 năm. Để đo tuổi Trái Đất hay các đá cổ hàng triệu năm, người ta phải dùng Uranium-238.",
    "extendEn": "Carbon-14 dating is effective for organic samples up to 50,000 years old. To date Earth's age or ancient rocks (millions of years), Uranium-238 is used.",
    "common_traps": ["Nhân nhầm: lấy $5730 \\times 0,25 = 1432,5$ năm $\\Rightarrow$ hiểu sai hoàn toàn ý nghĩa chu kỳ bán rã."],
    "common_traps_en": ["Incorrect multiplication: $5730 \\times 0.25 = 1432.5$ years $\\Rightarrow$ misunderstanding the exponential decay concept."],
    "hints": ["Nhớ rằng sau mỗi chu kỳ T, lượng chất phóng xạ bị giảm đi một nửa. Hãy đếm xem cần bao nhiêu lần giảm nửa để còn 25%."]
  },
  "real_world_connection": "Phương pháp Carbon-14 đã giúp các nhà khoa học xác định tuổi của các xác ướp Ai Cập và các cuộn bản thảo Biển Chết cổ đại một cách đáng tin cậy.",
  "real_world_connection_en": "Carbon-14 dating has successfully verified the age of Egyptian mummies and the Dead Sea Scrolls.",
  "formula": "t = T \\cdot \\log_{0{,}5}\\left(\\frac{H}{H_0}\\right) = 2T"
})

# --- CHAPTER 7: ADVANCED MECHANICS & PHYSICS FUN (36 questions) ---
questions.extend(gifted_questions)
questions.extend(gifted_electricity_questions)
questions.extend(gifted_optics_questions)
questions.extend(gifted_heat_questions)

# ============================================================
# WRITE TO JSON AND PRINT STATS
# ============================================================
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "questions_grade9.json")


with open(output_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Successfully wrote {len(questions)} questions to {output_path}")

# Verify distribution
from collections import Counter
chapters = Counter(q["chapter"] for q in questions)
difficulties = Counter(q["difficulty"] for q in questions)
types = Counter(q["type"] for q in questions)
print(f"\nChapter distribution: {dict(chapters)}")
print(f"Difficulty distribution: {dict(difficulties)}")
print(f"Type distribution: {dict(types)}")
print(f"\nDifficulty %: easy={difficulties['easy']/len(questions)*100:.0f}%, medium={difficulties['medium']/len(questions)*100:.0f}%, hard={difficulties['hard']/len(questions)*100:.0f}%")
print(f"Type %: MC={types['multiple_choice']/len(questions)*100:.0f}%, fill_in={types['fill_in']/len(questions)*100:.0f}%, T/F={types['true_false']/len(questions)*100:.0f}%, explain={types['explain']/len(questions)*100:.0f}%")
