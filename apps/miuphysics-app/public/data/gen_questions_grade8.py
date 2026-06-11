import json, os

questions = []

# ============================================================
# CHAPTER 1: PRESSURE (10 questions) - Áp suất: p=F/S
# ============================================================
questions.append({
  "id": "phys8_pressure_001", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_concept", "topic_vn": "Khái niệm áp suất",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Áp suất là gì?",
  "options": [{"key":"A","content":"Lực tác dụng lên vật"},{"key":"B","content":"Áp lực trên một đơn vị diện tích bị ép"},{"key":"C","content":"Diện tích bề mặt bị ép"},{"key":"D","content":"Trọng lượng của vật"}],
  "correct_answer": "B",
  "explanation": {"summary":"Áp suất là độ lớn của áp lực trên một đơn vị diện tích bị ép, đo bằng pascal (Pa).","key_concept":"Áp suất p = F/S, đơn vị Pa = N/m²."},
  "thinking_guide": {
    "understand": "Đề hỏi định nghĩa áp suất.",
    "identify_knowledge": "Áp suất = áp lực / diện tích bị ép.",
    "plan": "Nhớ lại công thức p = F/S và ý nghĩa vật lý.",
    "steps": ["Bước 1: Áp lực F là lực ép vuông góc với mặt bị ép.", "Bước 2: Áp suất p = F/S là áp lực trên mỗi đơn vị diện tích."],
    "verify": "Đáp án B mô tả đúng: áp lực trên một đơn vị diện tích bị ép.",
    "extend": "1 Pa = 1 N/m². Áp suất khí quyển ≈ 101325 Pa.",
    "common_traps": ["Nhầm áp suất với áp lực (lực). Áp suất là lực trên đơn vị diện tích."],
    "hints": ["Áp suất = F/S, cho biết lực phân bố trên diện tích như thế nào."]
  },
  "real_world_connection": "Dao sắc cắt dễ hơn dao cùn vì lưỡi mỏng có diện tích nhỏ → áp suất lớn.",
  "formula": "p = \\frac{F}{S}"
})

questions.append({
  "id": "phys8_pressure_002", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_unit", "topic_vn": "Đơn vị áp suất",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Đơn vị đo áp suất trong hệ SI là niutơn (N).",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "B",
  "explanation": {"summary":"Đơn vị đo áp suất trong hệ SI là pascal (Pa), không phải niutơn (N). Niutơn là đơn vị đo lực. 1 Pa = 1 N/m².","key_concept":"Đơn vị áp suất: Pa = N/m². Đơn vị lực: N."},
  "thinking_guide": {
    "understand": "Đề khẳng định đơn vị áp suất là N. Đúng hay sai?",
    "identify_knowledge": "Áp suất p = F/S → đơn vị = N/m² = Pa.",
    "plan": "Phân biệt đơn vị lực (N) và đơn vị áp suất (Pa).",
    "steps": ["Bước 1: Lực đo bằng niutơn (N).", "Bước 2: Áp suất = lực/diện tích → N/m² = Pa.", "Bước 3: Đề nói áp suất đo bằng N → Sai."],
    "verify": "Pa = N/m² ≠ N → khẳng định sai.",
    "extend": "Các đơn vị áp suất khác: atm, mmHg, bar.",
    "common_traps": ["Nhầm đơn vị lực (N) với đơn vị áp suất (Pa)."],
    "hints": ["Áp suất = lực/diện tích → đơn vị phải có diện tích ở mẫu."]
  },
  "real_world_connection": "Lốp xe ô tô thường bơm áp suất khoảng 200000 Pa (2 atm).",
  "formula": "1 \\text{ Pa} = 1 \\frac{\\text{N}}{\\text{m}^2}"
})

questions.append({
  "id": "phys8_pressure_003", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_calculation", "topic_vn": "Tính áp suất",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một vật có trọng lượng 600 N đặt trên mặt bàn. Diện tích tiếp xúc là 0,02 m². Áp suất vật tác dụng lên mặt bàn là bao nhiêu?",
  "options": [{"key":"A","content":"12 Pa"},{"key":"B","content":"120 Pa"},{"key":"C","content":"30000 Pa"},{"key":"D","content":"3000 Pa"}],
  "correct_answer": "C",
  "explanation": {"summary":"p = F/S = 600/0,02 = 30000 Pa.","key_concept":"Áp dụng trực tiếp công thức p = F/S."},
  "thinking_guide": {
    "understand": "Cho F = 600 N, S = 0,02 m². Tính p.",
    "identify_knowledge": "Công thức: p = F/S.",
    "plan": "Thay số vào công thức.",
    "steps": ["Bước 1: p = F/S = 600/0,02.", "Bước 2: p = 30000 Pa = 30 kPa."],
    "verify": "30000 × 0,02 = 600 N ✓",
    "extend": "30000 Pa ≈ 0,3 atm. So sánh: áp suất khí quyển ≈ 101325 Pa.",
    "common_traps": ["Chia sai: 600/0,02 = 30000 (không phải 300 hay 3000)."],
    "hints": ["Chia cho 0,02 tức là nhân với 50."]
  },
  "real_world_connection": "Ghế có chân rộng tạo áp suất nhỏ hơn ghế chân nhọn, giúp không làm lún sàn.",
  "formula": "p = \\frac{F}{S} = \\frac{600}{0,02} = 30000 \\text{ Pa}"
})

questions.append({
  "id": "phys8_pressure_004", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_increase", "topic_vn": "Tăng giảm áp suất",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Muốn tăng áp suất, ta có thể:",
  "options": [{"key":"A","content":"Giảm áp lực và tăng diện tích bị ép"},{"key":"B","content":"Tăng áp lực và giảm diện tích bị ép"},{"key":"C","content":"Giảm áp lực và giảm diện tích bị ép"},{"key":"D","content":"Tăng áp lực và tăng diện tích bị ép"}],
  "correct_answer": "B",
  "explanation": {"summary":"p = F/S nên muốn tăng p: tăng F (tăng tử số) hoặc giảm S (giảm mẫu số), hoặc cả hai.","key_concept":"Tăng p bằng cách tăng F hoặc giảm S."},
  "thinking_guide": {
    "understand": "Làm thế nào để tăng áp suất?",
    "identify_knowledge": "p = F/S → p tăng khi F tăng hoặc S giảm.",
    "plan": "Phân tích từng đáp án theo công thức p = F/S.",
    "steps": ["Bước 1: A: giảm F, tăng S → p giảm mạnh.", "Bước 2: B: tăng F, giảm S → p tăng mạnh ✓.", "Bước 3: C: giảm F, giảm S → không chắc chắn.", "Bước 4: D: tăng F, tăng S → không chắc chắn."],
    "verify": "Đáp án B chắc chắn tăng p vì tử tăng, mẫu giảm.",
    "extend": "Ứng dụng: mũi đinh nhọn (S nhỏ) để dễ đóng vào gỗ.",
    "common_traps": ["Chọn C hoặc D - cần cả hai yếu tố cùng chiều mới chắc chắn tăng p."],
    "hints": ["p = F/S: muốn phân số lớn → tăng tử số, giảm mẫu số."]
  },
  "real_world_connection": "Xe tăng có xích rộng (S lớn) để giảm áp suất, không bị lún trên đất mềm.",
  "formula": "p = \\frac{F}{S}"
})

questions.append({
  "id": "phys8_pressure_005", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_calculation", "topic_vn": "Tính áp suất",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một người nặng 50 kg đứng trên hai chân, diện tích mỗi bàn chân tiếp xúc với mặt đất là 150 cm². Áp suất người đó tác dụng lên mặt đất là ______ Pa. (Lấy g = 10 m/s²)",
  "options": None,
  "correct_answer": "16667",
  "explanation": {"summary":"P = mg = 50×10 = 500 N. S = 2×150 cm² = 300 cm² = 0,03 m². p = F/S = 500/0,03 ≈ 16667 Pa.","key_concept":"Đổi đơn vị diện tích: 1 m² = 10000 cm². Tính P rồi tính p."},
  "thinking_guide": {
    "understand": "Người 50 kg đứng 2 chân, mỗi chân 150 cm². Tính áp suất lên đất.",
    "identify_knowledge": "P = mg, S tổng = 2 × S_mỗi chân, p = F/S.",
    "plan": "Tính trọng lượng P, tính tổng S, rồi tính p.",
    "steps": ["Bước 1: P = mg = 50 × 10 = 500 N.", "Bước 2: S = 2 × 150 = 300 cm² = 300/10000 = 0,03 m².", "Bước 3: p = 500/0,03 ≈ 16667 Pa."],
    "verify": "16667 × 0,03 ≈ 500 N ✓",
    "extend": "Nếu đứng một chân: S = 0,015 m², p ≈ 33333 Pa → tăng gấp đôi.",
    "common_traps": ["Quên nhân 2 (đứng 2 chân) hoặc đổi sai cm² sang m²."],
    "hints": ["1 m² = 10000 cm². Đứng 2 chân → diện tích gấp đôi 1 chân."]
  },
  "real_world_connection": "Giày cao gót có diện tích tiếp xúc nhỏ nên tạo áp suất lớn, dễ làm lún sàn gỗ.",
  "formula": "p = \\frac{P}{S} = \\frac{mg}{2S_0} = \\frac{500}{0,03} \\approx 16667 \\text{ Pa}"
})

questions.append({
  "id": "phys8_pressure_006", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_application", "topic_vn": "Ứng dụng áp suất",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Tại sao lưỡi dao càng mỏng thì cắt càng dễ?",
  "options": [{"key":"A","content":"Vì lực tác dụng lớn hơn"},{"key":"B","content":"Vì diện tích tiếp xúc nhỏ hơn nên áp suất lớn hơn"},{"key":"C","content":"Vì dao mỏng nhẹ hơn"},{"key":"D","content":"Vì ma sát nhỏ hơn"}],
  "correct_answer": "B",
  "explanation": {"summary":"Lưỡi dao mỏng → diện tích tiếp xúc S nhỏ → với cùng lực F, áp suất p = F/S lớn hơn → cắt dễ hơn.","key_concept":"Giảm S → tăng p khi F không đổi."},
  "thinking_guide": {
    "understand": "Dao mỏng cắt dễ hơn. Giải thích bằng áp suất.",
    "identify_knowledge": "p = F/S: S giảm → p tăng.",
    "plan": "Phân tích: dao mỏng → S nhỏ → p lớn.",
    "steps": ["Bước 1: Dao mỏng → lưỡi dao tiếp xúc vật cần cắt trên diện tích S rất nhỏ.", "Bước 2: Cùng lực ấn F, S nhỏ → p = F/S rất lớn.", "Bước 3: Áp suất lớn → dễ cắt đứt vật."],
    "verify": "Dao cùn (S lớn) cắt khó hơn dao sắc (S nhỏ) → đúng.",
    "extend": "Đinh nhọn, kim tiêm cũng áp dụng nguyên lý tương tự.",
    "common_traps": ["Nghĩ rằng dao mỏng tạo lực lớn hơn – sai, lực phụ thuộc người dùng."],
    "hints": ["S nhỏ → p lớn → dễ xuyên/cắt."]
  },
  "real_world_connection": "Mài dao trước khi nấu ăn giúp lưỡi dao mỏng hơn, cắt thịt dễ hơn.",
  "formula": "p = \\frac{F}{S}"
})

questions.append({
  "id": "phys8_pressure_007", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_calculation", "topic_vn": "Tính áp suất",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Một xe tải có khối lượng 4 tấn, có 4 bánh xe, mỗi bánh tiếp xúc với mặt đường có diện tích 200 cm². Áp suất xe tải tác dụng lên mặt đường là bao nhiêu? (Lấy g = 10 m/s²)",
  "options": [{"key":"A","content":"500000 Pa"},{"key":"B","content":"50000 Pa"},{"key":"C","content":"200000 Pa"},{"key":"D","content":"100000 Pa"}],
  "correct_answer": "A",
  "explanation": {"summary":"P = mg = 4000 × 10 = 40000 N. S = 4 × 200 cm² = 800 cm² = 0,08 m². p = 40000/0,08 = 500000 Pa.","key_concept":"Đổi đơn vị: tấn → kg, cm² → m². Tính P rồi p."},
  "thinking_guide": {
    "understand": "Xe 4 tấn, 4 bánh, mỗi bánh 200 cm². Tính p lên mặt đường.",
    "identify_knowledge": "P = mg, S_tổng = 4 × S_mỗi bánh, p = P/S.",
    "plan": "Đổi đơn vị → tính P → tính S → tính p.",
    "steps": ["Bước 1: m = 4 tấn = 4000 kg.", "Bước 2: P = 4000 × 10 = 40000 N.", "Bước 3: S = 4 × 200 = 800 cm² = 0,08 m².", "Bước 4: p = 40000/0,08 = 500000 Pa = 5 × 10⁵ Pa."],
    "verify": "500000 × 0,08 = 40000 N ✓. 500000 Pa ≈ 5 atm → hợp lý cho xe tải.",
    "extend": "Xe tải nặng cần bánh rộng hoặc nhiều bánh để giảm áp suất lên đường.",
    "common_traps": ["Quên đổi tấn sang kg hoặc cm² sang m²."],
    "hints": ["1 tấn = 1000 kg. 1 m² = 10000 cm². Nhớ 4 bánh!"]
  },
  "real_world_connection": "Đường quốc lộ phải chịu áp suất rất lớn từ xe tải nên cần lớp bê tông dày.",
  "formula": "p = \\frac{mg}{4 \\times S_0} = \\frac{40000}{0,08} = 500000 \\text{ Pa}"
})

questions.append({
  "id": "phys8_pressure_008", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_comparison", "topic_vn": "So sánh áp suất",
  "type": "explain", "difficulty": "hard",
  "question_text": "Một khối hộp chữ nhật có kích thước 20 cm × 10 cm × 5 cm và khối lượng 4 kg. Tính áp suất lớn nhất và nhỏ nhất mà khối hộp tác dụng lên mặt bàn. Giải thích cách đặt khối hộp tương ứng. (Lấy g = 10 m/s²)",
  "options": None,
  "correct_answer": "P = 4 × 10 = 40 N. Áp suất lớn nhất khi S nhỏ nhất: S = 10×5 = 50 cm² = 0,005 m², p_max = 40/0,005 = 8000 Pa (đặt mặt 10×5 cm xuống). Áp suất nhỏ nhất khi S lớn nhất: S = 20×10 = 200 cm² = 0,02 m², p_min = 40/0,02 = 2000 Pa (đặt mặt 20×10 cm xuống).",
  "explanation": {"summary":"Cùng áp lực P = 40 N, chọn mặt tiếp xúc khác nhau cho S khác nhau → p khác nhau. S nhỏ nhất → p lớn nhất và ngược lại.","key_concept":"p = F/S: cùng F, S nhỏ → p lớn, S lớn → p nhỏ."},
  "thinking_guide": {
    "understand": "Khối hộp 20×10×5 cm, m=4 kg. Tìm p_max và p_min.",
    "identify_knowledge": "Khối hộp có 3 cặp mặt với diện tích khác nhau. p = P/S.",
    "plan": "Tính P, liệt kê 3 diện tích mặt, tìm S_min và S_max.",
    "steps": ["Bước 1: P = mg = 4 × 10 = 40 N.", "Bước 2: Ba mặt: 20×10=200 cm², 20×5=100 cm², 10×5=50 cm².", "Bước 3: p_max = 40/0,005 = 8000 Pa (mặt 50 cm²).", "Bước 4: p_min = 40/0,02 = 2000 Pa (mặt 200 cm²)."],
    "verify": "p_max/p_min = 8000/2000 = 4 = S_max/S_min = 200/50 = 4 ✓",
    "extend": "Tỉ lệ p_max/p_min = S_max/S_min khi F không đổi.",
    "common_traps": ["Quên rằng khối hộp có 3 cặp mặt khác nhau."],
    "hints": ["Liệt kê 3 diện tích mặt: dài×rộng, dài×cao, rộng×cao."]
  },
  "real_world_connection": "Khi xây nhà, viên gạch đặt nằm tạo áp suất nhỏ hơn đặt đứng.",
  "formula": "p_{max} = \\frac{P}{S_{min}} = \\frac{40}{0,005} = 8000 \\text{ Pa}"
})

questions.append({
  "id": "phys8_pressure_009", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_calculation", "topic_vn": "Tính áp suất",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một cái ghế 4 chân có khối lượng 4 kg, mỗi chân ghế có diện tích tiếp xúc với sàn là 5 cm². Khi một người nặng 56 kg ngồi lên ghế, áp suất ghế tác dụng lên sàn nhà là ______ Pa. (Lấy g = 10 m/s²)",
  "options": None,
  "correct_answer": "300000",
  "explanation": {"summary":"F = (m_người + m_ghế) × g = (56+4) × 10 = 600 N. S = 4 × 5 cm² = 20 cm² = 0,002 m². p = 600/0,002 = 300000 Pa.","key_concept":"Áp lực = tổng trọng lượng (người + ghế). Diện tích = 4 chân × S mỗi chân."},
  "thinking_guide": {
    "understand": "Ghế 4 kg, người 56 kg ngồi. Mỗi chân 5 cm². Tính p lên sàn.",
    "identify_knowledge": "F = (m₁+m₂)g, S = 4×S₀, p = F/S.",
    "plan": "Tính tổng trọng lượng, tổng diện tích, rồi p.",
    "steps": ["Bước 1: F = (56+4) × 10 = 600 N.", "Bước 2: S = 4 × 5 = 20 cm² = 0,002 m².", "Bước 3: p = 600/0,002 = 300000 Pa."],
    "verify": "300000 × 0,002 = 600 N ✓. 300000 Pa = 3 atm → khá lớn → hợp lý cho chân ghế nhỏ.",
    "extend": "Đó là lý do sàn gỗ mềm bị lún dấu chân ghế.",
    "common_traps": ["Quên cộng khối lượng ghế hoặc quên nhân 4 chân."],
    "hints": ["Tổng trọng lượng = (người + ghế) × g. Tổng diện tích = 4 chân."]
  },
  "real_world_connection": "Chân ghế có đệm cao su rộng để phân bố lực, giảm áp suất, tránh làm hỏng sàn.",
  "formula": "p = \\frac{(m_1+m_2)g}{4S_0} = \\frac{600}{0,002} = 300000 \\text{ Pa}"
})

questions.append({
  "id": "phys8_pressure_010", "grade": 8, "chapter": "pressure",
  "chapter_vn": "Áp suất", "topic": "pressure_application", "topic_vn": "Ứng dụng áp suất",
  "type": "explain", "difficulty": "medium",
  "question_text": "Tại sao xe tăng nặng hàng chục tấn nhưng vẫn đi được trên đất mềm, trong khi người đi bộ có thể bị lún? Giải thích bằng kiến thức về áp suất.",
  "options": None,
  "correct_answer": "Xe tăng có xích rộng bao quanh các bánh xe, tạo diện tích tiếp xúc S rất lớn. Tuy trọng lượng F lớn nhưng p = F/S vẫn nhỏ. Người đi bộ có S bàn chân nhỏ, tuy F nhỏ hơn nhưng p có thể lớn hơn xe tăng.",
  "explanation": {"summary":"Áp suất phụ thuộc cả F và S. Xe tăng có S rất lớn (xích rộng) nên p nhỏ dù F lớn. Người có S nhỏ (bàn chân) nên p có thể lớn hơn.","key_concept":"p = F/S: tăng S đủ lớn → p nhỏ dù F lớn."},
  "thinking_guide": {
    "understand": "Xe tăng nặng nhưng không lún, người nhẹ hơn lại lún. Tại sao?",
    "identify_knowledge": "p = F/S. Quan trọng là tỉ số F/S chứ không chỉ F.",
    "plan": "So sánh F và S của xe tăng với người.",
    "steps": ["Bước 1: Xe tăng: F rất lớn, nhưng S (xích) cũng rất lớn → p nhỏ.", "Bước 2: Người: F nhỏ hơn, nhưng S (bàn chân) rất nhỏ → p có thể lớn hơn.", "Bước 3: Kết luận: áp suất quyết định lún, không phải trọng lượng."],
    "verify": "Ví dụ: xe tăng 40 tấn, S xích ≈ 4 m² → p ≈ 100000 Pa. Người 60 kg, S ≈ 0,04 m² → p ≈ 15000 Pa.",
    "extend": "Ván trượt tuyết rộng cũng để giảm áp suất lên tuyết.",
    "common_traps": ["Chỉ so sánh trọng lượng mà quên diện tích tiếp xúc."],
    "hints": ["Áp suất = lực/diện tích. Diện tích lớn → bù được lực lớn."]
  },
  "real_world_connection": "Ván trượt tuyết rộng giúp người trượt trên tuyết mềm mà không bị lún.",
  "formula": "p = \\frac{F}{S}"
})

# ============================================================
# CHAPTER 2: LIQUID PRESSURE (8 questions) - Áp suất chất lỏng
# ============================================================
questions.append({
  "id": "phys8_liquid_pressure_001", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "liquid_pressure_concept", "topic_vn": "Khái niệm áp suất chất lỏng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Áp suất chất lỏng phụ thuộc vào yếu tố nào?",
  "options": [{"key":"A","content":"Hình dạng bình chứa"},{"key":"B","content":"Trọng lượng riêng chất lỏng và chiều cao cột chất lỏng"},{"key":"C","content":"Diện tích đáy bình"},{"key":"D","content":"Thể tích chất lỏng"}],
  "correct_answer": "B",
  "explanation": {"summary":"Áp suất chất lỏng p = d×g×h, chỉ phụ thuộc vào trọng lượng riêng d và chiều cao h, không phụ thuộc hình dạng bình hay diện tích đáy.","key_concept":"p = dgh: chỉ phụ thuộc d (trọng lượng riêng) và h (độ sâu)."},
  "thinking_guide": {
    "understand": "Áp suất chất lỏng phụ thuộc gì?",
    "identify_knowledge": "Công thức p = dgh (hoặc p = ρgh).",
    "plan": "Phân tích công thức: biến nào xuất hiện, biến nào không.",
    "steps": ["Bước 1: p = dgh chứa d (trọng lượng riêng) và h (chiều cao).", "Bước 2: Không chứa hình dạng bình, diện tích đáy, hay thể tích.", "Bước 3: → Đáp án B."],
    "verify": "Thí nghiệm: đổ nước vào bình rộng và bình hẹp cùng chiều cao → áp suất đáy bằng nhau.",
    "extend": "Đây là nghịch lý thủy tĩnh: bình hẹp cao có thể tạo áp suất lớn hơn bình rộng thấp.",
    "common_traps": ["Nghĩ áp suất phụ thuộc thể tích hoặc diện tích đáy."],
    "hints": ["Nhìn vào công thức p = dgh: chỉ có d và h."]
  },
  "real_world_connection": "Thợ lặn xuống sâu 10 m chịu áp suất nước tăng thêm khoảng 1 atm.",
  "formula": "p = d \\times g \\times h"
})

questions.append({
  "id": "phys8_liquid_pressure_002", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "liquid_pressure_formula", "topic_vn": "Công thức áp suất chất lỏng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Tính áp suất tại đáy một bể nước sâu 2 m. Biết trọng lượng riêng của nước là 10000 N/m³.",
  "options": [{"key":"A","content":"5000 Pa"},{"key":"B","content":"10000 Pa"},{"key":"C","content":"20000 Pa"},{"key":"D","content":"2000 Pa"}],
  "correct_answer": "C",
  "explanation": {"summary":"p = d × h = 10000 × 2 = 20000 Pa.","key_concept":"Áp dụng p = dh khi d đã là trọng lượng riêng (N/m³)."},
  "thinking_guide": {
    "understand": "Bể nước sâu h = 2 m, d = 10000 N/m³. Tính p đáy bể.",
    "identify_knowledge": "p = d × h (khi d là trọng lượng riêng, đã bao gồm g).",
    "plan": "Thay số trực tiếp.",
    "steps": ["Bước 1: p = d × h = 10000 × 2.", "Bước 2: p = 20000 Pa = 20 kPa."],
    "verify": "20000 Pa ≈ 0,2 atm → hợp lý cho 2 m nước.",
    "extend": "Mỗi 10 m nước tạo áp suất ≈ 1 atm (100000 Pa).",
    "common_traps": ["Nhầm d (trọng lượng riêng N/m³) với ρ (khối lượng riêng kg/m³)."],
    "hints": ["d = ρg = 1000 × 10 = 10000 N/m³. p = dh."]
  },
  "real_world_connection": "Đập thủy điện phải chịu áp suất rất lớn do cột nước cao hàng chục mét.",
  "formula": "p = d \\times h = 10000 \\times 2 = 20000 \\text{ Pa}"
})

questions.append({
  "id": "phys8_liquid_pressure_003", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "communicating_vessels", "topic_vn": "Bình thông nhau",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Trong bình thông nhau chứa cùng một chất lỏng đứng yên, mực chất lỏng ở hai nhánh luôn bằng nhau.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Trong bình thông nhau chứa cùng một chất lỏng đứng yên, mực chất lỏng ở hai nhánh luôn ngang nhau, bất kể hình dạng và tiết diện mỗi nhánh.","key_concept":"Bình thông nhau, cùng chất lỏng, đứng yên → mực chất lỏng ngang nhau."},
  "thinking_guide": {
    "understand": "Bình thông nhau, cùng chất lỏng, đứng yên → mực nước thế nào?",
    "identify_knowledge": "Nguyên lý bình thông nhau: cùng chất lỏng → mực bằng nhau.",
    "plan": "Áp dụng điều kiện cân bằng áp suất tại đáy.",
    "steps": ["Bước 1: Tại đáy nối hai nhánh, áp suất phải bằng nhau.", "Bước 2: p₁ = dgh₁ = dgh₂ = p₂ (cùng d).", "Bước 3: → h₁ = h₂ → mực bằng nhau."],
    "verify": "Đổ nước vào bình thông nhau → nước dâng đều hai bên.",
    "extend": "Nếu hai chất lỏng khác nhau (d khác nhau) thì mực không bằng nhau.",
    "common_traps": ["Nghĩ nhánh rộng hơn sẽ có mực thấp hơn – sai."],
    "hints": ["Cùng chất lỏng → cùng d → cùng h khi cân bằng."]
  },
  "real_world_connection": "Ống dẫn nước trong nhà hoạt động theo nguyên lý bình thông nhau: bồn trên cao → nước chảy xuống.",
  "formula": ""
})

questions.append({
  "id": "phys8_liquid_pressure_004", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "liquid_pressure_calculation", "topic_vn": "Tính áp suất chất lỏng",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một thùng đựng dầu cao 1,5 m, trọng lượng riêng của dầu là 8000 N/m³. Áp suất do dầu gây ra ở đáy thùng là ______ Pa.",
  "options": None,
  "correct_answer": "12000",
  "explanation": {"summary":"p = d × h = 8000 × 1,5 = 12000 Pa.","key_concept":"Áp dụng p = dh với d = trọng lượng riêng."},
  "thinking_guide": {
    "understand": "Thùng dầu cao h = 1,5 m, d = 8000 N/m³. Tính p đáy thùng.",
    "identify_knowledge": "p = d × h.",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: p = d × h = 8000 × 1,5.", "Bước 2: p = 12000 Pa."],
    "verify": "12000 Pa < 15000 Pa (nước cùng chiều cao) → hợp lý vì dầu nhẹ hơn nước.",
    "extend": "Dầu nhẹ hơn nước (d_dầu < d_nước) nên nổi trên nước.",
    "common_traps": ["Nhầm d_dầu với d_nước."],
    "hints": ["p = d × h, nhân trực tiếp."]
  },
  "real_world_connection": "Bồn chứa xăng dầu ở trạm xăng phải chịu áp suất lớn ở đáy bồn.",
  "formula": "p = d \\times h = 8000 \\times 1,5 = 12000 \\text{ Pa}"
})

questions.append({
  "id": "phys8_liquid_pressure_005", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "liquid_pressure_depth", "topic_vn": "Áp suất theo độ sâu",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một thợ lặn ở độ sâu 15 m dưới mặt nước biển. Áp suất do nước biển tác dụng lên thợ lặn là bao nhiêu? Biết trọng lượng riêng nước biển là 10300 N/m³.",
  "options": [{"key":"A","content":"103000 Pa"},{"key":"B","content":"154500 Pa"},{"key":"C","content":"15450 Pa"},{"key":"D","content":"1545 Pa"}],
  "correct_answer": "B",
  "explanation": {"summary":"p = d × h = 10300 × 15 = 154500 Pa.","key_concept":"Áp suất tăng tuyến tính theo độ sâu."},
  "thinking_guide": {
    "understand": "Thợ lặn ở h = 15 m, d = 10300 N/m³. Tính p.",
    "identify_knowledge": "p = d × h.",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: p = d × h = 10300 × 15.", "Bước 2: p = 154500 Pa ≈ 1,5 atm."],
    "verify": "154500 Pa ≈ 1,5 atm → hợp lý (mỗi 10 m ≈ 1 atm).",
    "extend": "Tổng áp suất = áp suất khí quyển + áp suất nước ≈ 1 + 1,5 = 2,5 atm.",
    "common_traps": ["Quên rằng áp suất tổng = áp suất khí quyển + áp suất nước."],
    "hints": ["p_nước = dh. Tổng p = p_khí_quyển + p_nước."]
  },
  "real_world_connection": "Thợ lặn phải sử dụng bình dưỡng khí đặc biệt để chịu áp suất lớn dưới nước sâu.",
  "formula": "p = d \\times h = 10300 \\times 15 = 154500 \\text{ Pa}"
})

questions.append({
  "id": "phys8_liquid_pressure_006", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "communicating_vessels", "topic_vn": "Bình thông nhau",
  "type": "explain", "difficulty": "hard",
  "question_text": "Một bình thông nhau hình chữ U chứa nước. Người ta đổ thêm dầu (d_dầu = 8000 N/m³) vào một nhánh. Khi cân bằng, mực chất lỏng ở hai nhánh có bằng nhau không? Giải thích.",
  "options": None,
  "correct_answer": "Không bằng nhau. Nhánh chứa dầu có mực cao hơn. Tại mặt phân cách nước-dầu, áp suất hai bên phải bằng nhau: d_nước × h_nước = d_dầu × h_dầu. Vì d_dầu < d_nước nên h_dầu > h_nước → cột dầu cao hơn cột nước.",
  "explanation": {"summary":"Hai chất lỏng khác d → mực không bằng nhau. Cột chất lỏng có d nhỏ hơn sẽ cao hơn để cân bằng áp suất.","key_concept":"Bình thông nhau khác chất lỏng: d₁h₁ = d₂h₂ → chất nhẹ hơn có cột cao hơn."},
  "thinking_guide": {
    "understand": "Bình chữ U: nước + dầu. Mực có bằng nhau không?",
    "identify_knowledge": "Bình thông nhau khác chất lỏng: d₁h₁ = d₂h₂.",
    "plan": "Xét điều kiện cân bằng áp suất tại đáy bình.",
    "steps": ["Bước 1: Tại mặt phân cách (cùng độ cao trong nhánh nước), áp suất phải bằng nhau.", "Bước 2: Nhánh nước: p₁ = d_nước × h₁.", "Bước 3: Nhánh dầu: p₂ = d_dầu × h₂.", "Bước 4: p₁ = p₂ → d_nước × h₁ = d_dầu × h₂.", "Bước 5: d_dầu < d_nước → h₂ > h₁ → cột dầu cao hơn."],
    "verify": "d_dầu/d_nước = 8000/10000 = 0,8 → h_dầu = h_nước/0,8 → dầu cao hơn 25%.",
    "extend": "Ứng dụng: dùng bình chữ U để đo trọng lượng riêng chất lỏng chưa biết.",
    "common_traps": ["Nghĩ rằng mực luôn bằng nhau – chỉ đúng khi cùng chất lỏng."],
    "hints": ["Khác chất lỏng → khác d → cột cao hơn ở nhánh chất lỏng nhẹ hơn."]
  },
  "real_world_connection": "Kỹ sư dùng ống chữ U để đo mật độ chất lỏng trong phòng thí nghiệm.",
  "formula": "d_1 \\times h_1 = d_2 \\times h_2"
})

questions.append({
  "id": "phys8_liquid_pressure_007", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "atmospheric_pressure", "topic_vn": "Áp suất khí quyển",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Áp suất khí quyển bằng 76 cmHg. Biết trọng lượng riêng của thủy ngân là 136000 N/m³. Áp suất khí quyển bằng bao nhiêu Pa?",
  "options": [{"key":"A","content":"103360 Pa"},{"key":"B","content":"10336 Pa"},{"key":"C","content":"1033600 Pa"},{"key":"D","content":"1033,6 Pa"}],
  "correct_answer": "A",
  "explanation": {"summary":"h = 76 cm = 0,76 m. p = d × h = 136000 × 0,76 = 103360 Pa.","key_concept":"Áp suất khí quyển = d_thủy ngân × h_cột thủy ngân."},
  "thinking_guide": {
    "understand": "76 cmHg, d_Hg = 136000 N/m³. Tính p theo Pa.",
    "identify_knowledge": "p = d × h, đổi cm → m.",
    "plan": "Đổi h sang mét, nhân với d.",
    "steps": ["Bước 1: h = 76 cm = 0,76 m.", "Bước 2: p = 136000 × 0,76.", "Bước 3: p = 103360 Pa."],
    "verify": "103360 Pa ≈ 101325 Pa (1 atm tiêu chuẩn) → gần đúng (sai lệch do làm tròn d).",
    "extend": "Thí nghiệm Torricelli (1643) đo áp suất khí quyển bằng cột thủy ngân.",
    "common_traps": ["Quên đổi 76 cm sang 0,76 m."],
    "hints": ["1 cm = 0,01 m. 76 cm = 0,76 m."]
  },
  "real_world_connection": "Dự báo thời tiết dùng đơn vị mmHg hoặc hPa để đo áp suất khí quyển.",
  "formula": "p = d \\times h = 136000 \\times 0,76 = 103360 \\text{ Pa}"
})

questions.append({
  "id": "phys8_liquid_pressure_008", "grade": 8, "chapter": "liquid_pressure",
  "chapter_vn": "Áp suất chất lỏng", "topic": "pascal_law", "topic_vn": "Định luật Pascal",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Trong máy ép thủy lực, pittông nhỏ có diện tích 10 cm², pittông lớn có diện tích 200 cm². Khi tác dụng lực 50 N lên pittông nhỏ, lực truyền đến pittông lớn là bao nhiêu?",
  "options": [{"key":"A","content":"100 N"},{"key":"B","content":"500 N"},{"key":"C","content":"1000 N"},{"key":"D","content":"2500 N"}],
  "correct_answer": "C",
  "explanation": {"summary":"Theo định luật Pascal: F₁/S₁ = F₂/S₂ → F₂ = F₁ × S₂/S₁ = 50 × 200/10 = 1000 N.","key_concept":"Máy ép thủy lực: F₂/F₁ = S₂/S₁."},
  "thinking_guide": {
    "understand": "S₁ = 10 cm², S₂ = 200 cm², F₁ = 50 N. Tìm F₂.",
    "identify_knowledge": "Định luật Pascal: p₁ = p₂ → F₁/S₁ = F₂/S₂.",
    "plan": "Dùng tỉ lệ diện tích để tính lực.",
    "steps": ["Bước 1: F₁/S₁ = F₂/S₂.", "Bước 2: F₂ = F₁ × S₂/S₁ = 50 × 200/10.", "Bước 3: F₂ = 50 × 20 = 1000 N."],
    "verify": "Tỉ số khuếch đại = S₂/S₁ = 200/10 = 20 lần. 50 × 20 = 1000 N ✓.",
    "extend": "Máy ép thủy lực được lợi về lực nhưng thiệt về đường đi (bảo toàn công).",
    "common_traps": ["Nhầm F₂ = F₁ × S₁/S₂ (chia ngược)."],
    "hints": ["Pittông lớn hơn → lực lớn hơn. F₂ = F₁ × (S₂/S₁)."]
  },
  "real_world_connection": "Phanh xe ô tô, kích nâng xe trong garage đều dùng nguyên lý thủy lực.",
  "formula": "F_2 = F_1 \\times \\frac{S_2}{S_1} = 50 \\times \\frac{200}{10} = 1000 \\text{ N}"
})

# ============================================================
# CHAPTER 3: BUOYANCY (10 questions) - Lực đẩy Archimedes
# ============================================================
questions.append({
  "id": "phys8_buoyancy_001", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_concept", "topic_vn": "Khái niệm lực đẩy Archimedes",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Lực đẩy Archimedes tác dụng lên vật nhúng trong chất lỏng có phương và chiều như thế nào?",
  "options": [{"key":"A","content":"Phương thẳng đứng, chiều từ trên xuống"},{"key":"B","content":"Phương thẳng đứng, chiều từ dưới lên"},{"key":"C","content":"Phương ngang"},{"key":"D","content":"Phương bất kỳ"}],
  "correct_answer": "B",
  "explanation": {"summary":"Lực đẩy Archimedes có phương thẳng đứng, chiều từ dưới lên (ngược chiều trọng lực).","key_concept":"Lực Archimedes: phương thẳng đứng, chiều từ dưới lên."},
  "thinking_guide": {
    "understand": "Lực đẩy Archimedes có phương chiều thế nào?",
    "identify_knowledge": "Lực đẩy Archimedes hướng lên trên, ngược chiều trọng lực.",
    "plan": "Nhớ lại tính chất lực đẩy Archimedes.",
    "steps": ["Bước 1: Khi nhúng vật vào nước, vật 'nhẹ hơn' → có lực đẩy lên.", "Bước 2: Lực này hướng từ dưới lên, vuông góc mặt đất.", "Bước 3: → Phương thẳng đứng, chiều từ dưới lên."],
    "verify": "Thả quả bóng vào nước → nó bị đẩy lên → lực hướng lên ✓.",
    "extend": "Lực Archimedes cũng tác dụng trong chất khí (khinh khí cầu bay lên).",
    "common_traps": ["Nhầm chiều: lực đẩy hướng lên, không phải hướng xuống."],
    "hints": ["'Đẩy' = đẩy lên, ngược chiều trọng lực."]
  },
  "real_world_connection": "Khi bước vào hồ bơi, ta cảm thấy nhẹ hơn vì nước đẩy ta lên.",
  "formula": ""
})

questions.append({
  "id": "phys8_buoyancy_002", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_formula", "topic_vn": "Công thức lực đẩy Archimedes",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Công thức tính lực đẩy Archimedes là:",
  "options": [{"key":"A","content":"\\(F_A = d \\times V\\)"},{"key":"B","content":"\\(F_A = m \\times g\\)"},{"key":"C","content":"\\(F_A = p \\times S\\)"},{"key":"D","content":"\\(F_A = d \\times h\\)"}],
  "correct_answer": "A",
  "explanation": {"summary":"Lực đẩy Archimedes: F_A = d × V, trong đó d là trọng lượng riêng chất lỏng, V là thể tích phần chất lỏng bị vật chiếm chỗ.","key_concept":"F_A = dV: trọng lượng riêng × thể tích chiếm chỗ."},
  "thinking_guide": {
    "understand": "Công thức lực đẩy Archimedes là gì?",
    "identify_knowledge": "F_A = d × V.",
    "plan": "Nhớ lại công thức và ý nghĩa các đại lượng.",
    "steps": ["Bước 1: F_A = d × V.", "Bước 2: d = trọng lượng riêng chất lỏng (N/m³).", "Bước 3: V = thể tích phần vật chìm trong chất lỏng (m³)."],
    "verify": "Đơn vị: N/m³ × m³ = N → đúng là đơn vị lực.",
    "extend": "F_A cũng bằng trọng lượng chất lỏng bị vật chiếm chỗ.",
    "common_traps": ["Nhầm V là thể tích toàn bộ vật (chỉ đúng khi vật chìm hoàn toàn)."],
    "hints": ["F_A = d×V, V là phần chìm trong chất lỏng."]
  },
  "real_world_connection": "Archimedes phát hiện định luật này khi đang tắm, và đã kêu lên 'Eureka!'.",
  "formula": "F_A = d \\times V"
})

questions.append({
  "id": "phys8_buoyancy_003", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_calculation", "topic_vn": "Tính lực đẩy Archimedes",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một khối sắt có thể tích 0,002 m³ được nhúng chìm hoàn toàn trong nước. Biết trọng lượng riêng nước là 10000 N/m³. Lực đẩy Archimedes tác dụng lên khối sắt là bao nhiêu?",
  "options": [{"key":"A","content":"200 N"},{"key":"B","content":"2000 N"},{"key":"C","content":"20 N"},{"key":"D","content":"20000 N"}],
  "correct_answer": "C",
  "explanation": {"summary":"F_A = d × V = 10000 × 0,002 = 20 N.","key_concept":"Áp dụng F_A = dV khi vật chìm hoàn toàn."},
  "thinking_guide": {
    "understand": "V = 0,002 m³, d_nước = 10000 N/m³. Tính F_A.",
    "identify_knowledge": "F_A = d × V (vật chìm hoàn toàn → V = thể tích vật).",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: F_A = d × V = 10000 × 0,002.", "Bước 2: F_A = 20 N."],
    "verify": "F_A = 20 N < P_sắt = 7800×10×0,002 = 156 N → sắt chìm ✓.",
    "extend": "Trọng lượng biểu kiến trong nước = P - F_A = 156 - 20 = 136 N.",
    "common_traps": ["Nhầm đơn vị: 10000 × 0,002 = 20 (không phải 200 hay 2000)."],
    "hints": ["Nhân trực tiếp d × V."]
  },
  "real_world_connection": "Neo tàu bằng sắt khi ở dưới nước nhẹ hơn trên cạn vì có lực đẩy Archimedes.",
  "formula": "F_A = d \\times V = 10000 \\times 0,002 = 20 \\text{ N}"
})

questions.append({
  "id": "phys8_buoyancy_004", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "floating_sinking", "topic_vn": "Điều kiện vật nổi chìm",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một vật nhúng trong chất lỏng sẽ nổi lên khi:",
  "options": [{"key":"A","content":"Trọng lượng P > Lực đẩy F_A"},{"key":"B","content":"Trọng lượng P < Lực đẩy F_A"},{"key":"C","content":"Trọng lượng P = Lực đẩy F_A"},{"key":"D","content":"Áp suất chất lỏng bằng áp suất khí quyển"}],
  "correct_answer": "B",
  "explanation": {"summary":"Vật nổi khi F_A > P (lực đẩy lên lớn hơn trọng lượng kéo xuống). Vật chìm khi P > F_A. Vật lơ lửng khi P = F_A.","key_concept":"Nổi: F_A > P. Chìm: P > F_A. Lơ lửng: P = F_A."},
  "thinking_guide": {
    "understand": "Điều kiện nào để vật nổi?",
    "identify_knowledge": "So sánh F_A và P: F_A > P → nổi.",
    "plan": "Phân tích cặp lực tác dụng lên vật trong chất lỏng.",
    "steps": ["Bước 1: Vật chịu P (xuống) và F_A (lên).", "Bước 2: F_A > P → hợp lực hướng lên → vật nổi.", "Bước 3: P > F_A → hợp lực hướng xuống → vật chìm."],
    "verify": "Gỗ (d_gỗ < d_nước): F_A ban đầu > P → gỗ nổi lên ✓.",
    "extend": "Khi vật nổi trên mặt, chỉ một phần chìm sao cho F_A = P (cân bằng).",
    "common_traps": ["Nhầm: P > F_A là nổi (ngược lại!)."],
    "hints": ["Lực lớn hơn thắng: F_A lớn hơn → đẩy lên → nổi."]
  },
  "real_world_connection": "Phao cứu sinh nổi trên nước vì chất liệu xốp có trọng lượng riêng nhỏ hơn nước.",
  "formula": ""
})

questions.append({
  "id": "phys8_buoyancy_005", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_calculation", "topic_vn": "Tính lực đẩy Archimedes",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một vật có thể tích 500 cm³ được nhúng chìm hoàn toàn trong rượu. Biết trọng lượng riêng của rượu là 8000 N/m³. Lực đẩy Archimedes tác dụng lên vật là ______ N.",
  "options": None,
  "correct_answer": "4",
  "explanation": {"summary":"V = 500 cm³ = 0,0005 m³. F_A = d × V = 8000 × 0,0005 = 4 N.","key_concept":"Đổi cm³ sang m³ rồi dùng F_A = dV."},
  "thinking_guide": {
    "understand": "V = 500 cm³, d_rượu = 8000 N/m³. Tính F_A.",
    "identify_knowledge": "F_A = d × V, cần đổi cm³ → m³.",
    "plan": "Đổi đơn vị V, rồi tính F_A.",
    "steps": ["Bước 1: V = 500 cm³ = 500/1000000 = 0,0005 m³.", "Bước 2: F_A = 8000 × 0,0005 = 4 N."],
    "verify": "4 N → vật bị đẩy lên với lực tương đương 400 g → hợp lý.",
    "extend": "Nếu nhúng trong nước (d=10000): F_A = 10000 × 0,0005 = 5 N > 4 N.",
    "common_traps": ["Đổi sai cm³ sang m³: 1 m³ = 10⁶ cm³, không phải 10³."],
    "hints": ["1 m = 100 cm → 1 m³ = 100³ cm³ = 1000000 cm³."]
  },
  "real_world_connection": "Quả trứng tươi chìm trong nước nhưng nổi trong nước muối đậm đặc (d lớn hơn).",
  "formula": "F_A = d \\times V = 8000 \\times 0,0005 = 4 \\text{ N}"
})

questions.append({
  "id": "phys8_buoyancy_006", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "floating_sinking", "topic_vn": "Điều kiện vật nổi chìm",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Lực đẩy Archimedes chỉ phụ thuộc vào trọng lượng riêng của chất lỏng và thể tích phần chất lỏng bị vật chiếm chỗ, không phụ thuộc vào hình dạng của vật.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. F_A = d × V chỉ phụ thuộc d (chất lỏng) và V (phần chiếm chỗ), không phụ thuộc hình dạng, chất liệu hay khối lượng vật.","key_concept":"F_A = dV: không phụ thuộc hình dạng, chất liệu vật."},
  "thinking_guide": {
    "understand": "F_A có phụ thuộc hình dạng vật không?",
    "identify_knowledge": "F_A = d × V: chỉ có d và V, không có hình dạng.",
    "plan": "Phân tích công thức F_A = dV.",
    "steps": ["Bước 1: F_A = d × V.", "Bước 2: d là tính chất chất lỏng, V là thể tích chiếm chỗ.", "Bước 3: Không có đại lượng nào về hình dạng vật → đúng."],
    "verify": "Hai vật cùng V, khác hình dạng, nhúng cùng chất lỏng → F_A bằng nhau.",
    "extend": "Nhưng hình dạng ảnh hưởng đến vật nổi hay chìm (qua thể tích chiếm chỗ khi nổi).",
    "common_traps": ["Nghĩ vật dẹt chịu F_A khác vật tròn cùng thể tích."],
    "hints": ["Nhìn công thức: F_A = dV, không có 'hình dạng'."]
  },
  "real_world_connection": "Viên bi và miếng nhôm cùng thể tích chìm trong nước chịu lực đẩy Archimedes như nhau.",
  "formula": "F_A = d \\times V"
})

questions.append({
  "id": "phys8_buoyancy_007", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_calculation", "topic_vn": "Tính lực đẩy Archimedes",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Một khối gỗ có thể tích 0,01 m³ và khối lượng riêng 600 kg/m³ được thả vào nước (d_nước = 10000 N/m³). Khi cân bằng, thể tích phần gỗ chìm trong nước là bao nhiêu?",
  "options": [{"key":"A","content":"0,004 m³"},{"key":"B","content":"0,006 m³"},{"key":"C","content":"0,008 m³"},{"key":"D","content":"0,01 m³"}],
  "correct_answer": "B",
  "explanation": {"summary":"Khi nổi cân bằng: P = F_A → mg = d_nước × V_chìm → ρ_gỗ × V × g = d_nước × V_chìm → V_chìm = ρ_gỗ × g × V / d_nước = 600×10×0,01/10000 = 0,006 m³.","key_concept":"Vật nổi: V_chìm/V = ρ_vật/ρ_chất lỏng."},
  "thinking_guide": {
    "understand": "Gỗ V=0,01 m³, ρ=600 kg/m³ trong nước. Tìm V_chìm.",
    "identify_knowledge": "Nổi cân bằng: P = F_A → ρ_gỗ × V × g = d_nước × V_chìm.",
    "plan": "Dùng điều kiện cân bằng để tìm V_chìm.",
    "steps": ["Bước 1: P = m×g = ρ×V×g = 600×0,01×10 = 60 N.", "Bước 2: F_A = d_nước × V_chìm = 10000 × V_chìm.", "Bước 3: P = F_A → 60 = 10000 × V_chìm.", "Bước 4: V_chìm = 60/10000 = 0,006 m³."],
    "verify": "V_chìm/V = 0,006/0,01 = 0,6 = 600/1000 = ρ_gỗ/ρ_nước ✓.",
    "extend": "60% gỗ chìm dưới nước. Tương tự, 90% tảng băng chìm dưới nước.",
    "common_traps": ["Nhầm V_chìm = V (chỉ đúng khi vật chìm hoàn toàn)."],
    "hints": ["Nổi → P = F_A → tìm V_chìm. Tỉ lệ chìm = ρ_vật/ρ_chất lỏng."]
  },
  "real_world_connection": "Tảng băng trôi chỉ lộ 10% trên mặt nước, 90% chìm bên dưới (vì ρ_băng/ρ_nước ≈ 0,9).",
  "formula": "V_{chìm} = \\frac{\\rho_{gỗ} \\times V}{\\rho_{nước}} = \\frac{600 \\times 0,01}{1000} = 0,006 \\text{ m³}"
})

questions.append({
  "id": "phys8_buoyancy_008", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_application", "topic_vn": "Ứng dụng lực đẩy Archimedes",
  "type": "explain", "difficulty": "hard",
  "question_text": "Giải thích tại sao tàu thủy bằng thép (ρ_thép = 7800 kg/m³) có thể nổi trên nước (ρ_nước = 1000 kg/m³), trong khi một viên bi thép nhỏ lại chìm?",
  "options": None,
  "correct_answer": "Tàu thủy được thiết kế rỗng bên trong, chứa nhiều không khí. Thể tích tổng của tàu (gồm thép + không khí) rất lớn, nên khối lượng riêng trung bình nhỏ hơn nước. Viên bi thép đặc, không có khoang rỗng, ρ = 7800 > 1000 nên chìm.",
  "explanation": {"summary":"Tàu rỗng → V lớn → ρ_tb nhỏ < ρ_nước → nổi. Bi đặc → ρ = 7800 > 1000 → chìm. Khối lượng riêng trung bình quyết định nổi/chìm.","key_concept":"ρ_tb = m_tổng/V_tổng. ρ_tb < ρ_nước → nổi."},
  "thinking_guide": {
    "understand": "Cùng chất thép, tàu nổi nhưng bi chìm. Tại sao?",
    "identify_knowledge": "Nổi/chìm phụ thuộc ρ_tb so với ρ_nước.",
    "plan": "So sánh ρ_tb của tàu (rỗng) và bi (đặc).",
    "steps": ["Bước 1: Viên bi: ρ = 7800 > 1000 → chìm.", "Bước 2: Tàu thủy: vỏ thép + khoang rỗng chứa không khí.", "Bước 3: ρ_tb = m_thép/(V_thép + V_kk) << 7800.", "Bước 4: Nếu ρ_tb < 1000 → tàu nổi."],
    "verify": "Nếu đục thủng tàu → nước tràn vào → V_kk giảm → ρ_tb tăng → tàu chìm ✓.",
    "extend": "Tàu ngầm điều chỉnh ρ_tb bằng cách bơm nước vào/ra khoang ballast.",
    "common_traps": ["Nghĩ mọi vật bằng thép đều chìm – sai, phụ thuộc cấu tạo."],
    "hints": ["So sánh ρ trung bình, không phải ρ chất liệu."]
  },
  "real_world_connection": "Tàu Titanic chìm khi nước tràn vào các khoang rỗng, làm tăng ρ trung bình.",
  "formula": "\\rho_{tb} = \\frac{m_{tổng}}{V_{tổng}} < \\rho_{nước} \\Rightarrow \\text{nổi}"
})

questions.append({
  "id": "phys8_buoyancy_009", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_calculation", "topic_vn": "Tính lực đẩy Archimedes",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một vật có trọng lượng 50 N. Khi nhúng chìm hoàn toàn trong nước, lực kế chỉ 35 N. Lực đẩy Archimedes tác dụng lên vật là ______ N.",
  "options": None,
  "correct_answer": "15",
  "explanation": {"summary":"F_A = P - P' = 50 - 35 = 15 N. Trong đó P là trọng lượng thật, P' là số chỉ lực kế (trọng lượng biểu kiến).","key_concept":"F_A = P - P' (trọng lượng trong không khí - trọng lượng trong nước)."},
  "thinking_guide": {
    "understand": "P = 50 N, lực kế trong nước = 35 N. Tìm F_A.",
    "identify_knowledge": "F_A = P - P_biểu kiến.",
    "plan": "Trừ hai giá trị.",
    "steps": ["Bước 1: Trong không khí: lực kế chỉ P = 50 N.", "Bước 2: Trong nước: lực kế chỉ P' = 35 N (nhẹ hơn do F_A).", "Bước 3: F_A = P - P' = 50 - 35 = 15 N."],
    "verify": "F_A = 15 N = d_nước × V → V = 15/10000 = 0,0015 m³ → hợp lý.",
    "extend": "Đây là phương pháp Archimedes để xác định thể tích vật có hình dạng phức tạp.",
    "common_traps": ["Nhầm F_A = P' thay vì F_A = P - P'."],
    "hints": ["Vật nhẹ hơn trong nước → phần 'mất đi' chính là F_A."]
  },
  "real_world_connection": "Phương pháp này giúp thợ kim hoàn kiểm tra vàng thật/giả bằng cách đo trọng lượng trong không khí và trong nước.",
  "formula": "F_A = P - P' = 50 - 35 = 15 \\text{ N}"
})

questions.append({
  "id": "phys8_buoyancy_010", "grade": 8, "chapter": "buoyancy",
  "chapter_vn": "Lực đẩy Archimedes", "topic": "buoyancy_application", "topic_vn": "Ứng dụng lực đẩy Archimedes",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Muốn tàu ngầm lặn sâu hơn, người ta cần:",
  "options": [{"key":"A","content":"Bơm nước ra khỏi khoang ballast"},{"key":"B","content":"Bơm nước vào khoang ballast để tăng trọng lượng"},{"key":"C","content":"Tăng tốc độ động cơ"},{"key":"D","content":"Giảm thể tích tàu"}],
  "correct_answer": "B",
  "explanation": {"summary":"Bơm nước vào khoang ballast làm tăng khối lượng m → tăng P. Khi P > F_A → tàu chìm xuống.","key_concept":"Tăng P (bơm nước vào) → P > F_A → tàu lặn sâu."},
  "thinking_guide": {
    "understand": "Làm sao để tàu ngầm lặn sâu hơn?",
    "identify_knowledge": "P > F_A → chìm. Tăng P bằng cách bơm nước vào.",
    "plan": "Phân tích cách thay đổi P hoặc F_A.",
    "steps": ["Bước 1: Muốn lặn: P > F_A.", "Bước 2: Tăng P: bơm nước biển vào khoang ballast.", "Bước 3: Muốn nổi: bơm nước ra, bơm khí nén vào → giảm P."],
    "verify": "Bơm nước vào → m tăng → P tăng → P > F_A → chìm ✓.",
    "extend": "Cá dùng bong bóng khí (swim bladder) để điều chỉnh nổi/chìm tương tự.",
    "common_traps": ["Nhầm: bơm nước ra để lặn (ngược lại!)."],
    "hints": ["Lặn = chìm → cần P > F_A → tăng P bằng cách thêm nước."]
  },
  "real_world_connection": "Tàu ngầm quân sự điều khiển độ sâu bằng hệ thống bơm nước ballast tự động.",
  "formula": ""
})

# ============================================================
# CHAPTER 4: MOMENT OF FORCE (8 questions) - Momen lực
# ============================================================
questions.append({
  "id": "phys8_moment_001", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "moment_concept", "topic_vn": "Khái niệm momen lực",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Momen lực đối với một trục quay được tính bằng công thức nào?",
  "options": [{"key":"A","content":"\\(M = F + d\\)"},{"key":"B","content":"\\(M = F \\times d\\)"},{"key":"C","content":"\\(M = F / d\\)"},{"key":"D","content":"\\(M = F - d\\)"}],
  "correct_answer": "B",
  "explanation": {"summary":"Momen lực M = F × d, trong đó F là lực tác dụng (N), d là cánh tay đòn (khoảng cách từ trục quay đến giá của lực, m).","key_concept":"M = F × d, đơn vị N·m."},
  "thinking_guide": {
    "understand": "Công thức momen lực là gì?",
    "identify_knowledge": "M = F × d: lực nhân cánh tay đòn.",
    "plan": "Nhớ lại định nghĩa momen lực.",
    "steps": ["Bước 1: M = F × d.", "Bước 2: F: lực tác dụng (N).", "Bước 3: d: cánh tay đòn = khoảng cách từ trục quay đến đường tác dụng của lực (m)."],
    "verify": "Đơn vị: N × m = N·m ✓.",
    "extend": "d = 0 (lực đi qua trục quay) → M = 0 → không làm quay.",
    "common_traps": ["Nhầm d là khoảng cách từ trục đến điểm đặt lực (chỉ đúng khi lực vuông góc đòn)."],
    "hints": ["M = F×d, d là cánh tay đòn (vuông góc từ trục đến giá của lực)."]
  },
  "real_world_connection": "Dùng cờ lê dài (d lớn) để vặn ốc dễ hơn cờ lê ngắn (M lớn hơn).",
  "formula": "M = F \\times d"
})

questions.append({
  "id": "phys8_moment_002", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "moment_calculation", "topic_vn": "Tính momen lực",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một lực 20 N tác dụng vuông góc với cánh tay đòn dài 0,5 m. Momen lực là ______ N·m.",
  "options": None,
  "correct_answer": "10",
  "explanation": {"summary":"M = F × d = 20 × 0,5 = 10 N·m.","key_concept":"M = F × d."},
  "thinking_guide": {
    "understand": "F = 20 N, d = 0,5 m. Tính M.",
    "identify_knowledge": "M = F × d.",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: M = F × d = 20 × 0,5.", "Bước 2: M = 10 N·m."],
    "verify": "10 N·m → hợp lý cho lực 20 N với tay đòn 0,5 m.",
    "extend": "Nếu tay đòn dài gấp đôi (1 m) → M = 20 N·m → quay dễ hơn.",
    "common_traps": ["Quên đơn vị N·m."],
    "hints": ["Nhân trực tiếp F × d."]
  },
  "real_world_connection": "Khi mở cửa, ta đẩy ở mép cửa (xa bản lề) để tay đòn d dài, momen lớn, mở dễ hơn.",
  "formula": "M = F \\times d = 20 \\times 0,5 = 10 \\text{ N·m}"
})

questions.append({
  "id": "phys8_moment_003", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "lever_equilibrium", "topic_vn": "Cân bằng đòn bẩy",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Điều kiện cân bằng của đòn bẩy (quy tắc momen lực) là:",
  "options": [{"key":"A","content":"\\(F_1 = F_2\\)"},{"key":"B","content":"\\(d_1 = d_2\\)"},{"key":"C","content":"\\(F_1 \\times d_1 = F_2 \\times d_2\\)"},{"key":"D","content":"\\(F_1 + d_1 = F_2 + d_2\\)"}],
  "correct_answer": "C",
  "explanation": {"summary":"Đòn bẩy cân bằng khi tổng momen lực thuận chiều kim đồng hồ bằng tổng momen lực ngược chiều: F₁×d₁ = F₂×d₂.","key_concept":"Cân bằng đòn bẩy: M₁ = M₂ → F₁d₁ = F₂d₂."},
  "thinking_guide": {
    "understand": "Điều kiện cân bằng đòn bẩy là gì?",
    "identify_knowledge": "Tổng momen thuận = tổng momen nghịch.",
    "plan": "Áp dụng quy tắc momen.",
    "steps": ["Bước 1: Momen lực 1: M₁ = F₁ × d₁.", "Bước 2: Momen lực 2: M₂ = F₂ × d₂.", "Bước 3: Cân bằng: M₁ = M₂ → F₁d₁ = F₂d₂."],
    "verify": "Bập bênh: người nặng ngồi gần tâm (d nhỏ) = người nhẹ ngồi xa tâm (d lớn).",
    "extend": "Từ F₁d₁ = F₂d₂ → F₁/F₂ = d₂/d₁: lực tỉ lệ nghịch cánh tay đòn.",
    "common_traps": ["Nhầm: cân bằng khi F₁ = F₂ (chỉ đúng khi d₁ = d₂)."],
    "hints": ["Cân bằng = tổng momen bằng nhau, không phải tổng lực."]
  },
  "real_world_connection": "Bập bênh: em bé nhẹ ngồi xa tâm cân bằng với người lớn ngồi gần tâm.",
  "formula": "F_1 \\times d_1 = F_2 \\times d_2"
})

questions.append({
  "id": "phys8_moment_004", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "lever_calculation", "topic_vn": "Tính toán đòn bẩy",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một đòn bẩy có điểm tựa O. Lực F₁ = 100 N đặt cách O một đoạn d₁ = 0,4 m. Muốn đòn bẩy cân bằng, cần đặt lực F₂ cách O một đoạn d₂ = 0,8 m. Tính F₂.",
  "options": [{"key":"A","content":"200 N"},{"key":"B","content":"100 N"},{"key":"C","content":"50 N"},{"key":"D","content":"25 N"}],
  "correct_answer": "C",
  "explanation": {"summary":"F₁d₁ = F₂d₂ → 100 × 0,4 = F₂ × 0,8 → F₂ = 40/0,8 = 50 N.","key_concept":"Cánh tay đòn dài gấp đôi → lực cần giảm một nửa."},
  "thinking_guide": {
    "understand": "F₁=100N, d₁=0,4m, d₂=0,8m. Tìm F₂.",
    "identify_knowledge": "F₁d₁ = F₂d₂.",
    "plan": "Thay số và giải phương trình.",
    "steps": ["Bước 1: F₁d₁ = F₂d₂.", "Bước 2: 100 × 0,4 = F₂ × 0,8.", "Bước 3: 40 = 0,8F₂.", "Bước 4: F₂ = 50 N."],
    "verify": "50 × 0,8 = 40 = 100 × 0,4 ✓. d₂ = 2d₁ → F₂ = F₁/2 ✓.",
    "extend": "Đòn bẩy cho phép 'đổi' lực lấy quãng đường (bảo toàn công).",
    "common_traps": ["Nhầm F₂ = F₁ × d₂/d₁ = 200 N (chia sai chiều)."],
    "hints": ["F₂ = F₁ × d₁/d₂ = 100 × 0,4/0,8."]
  },
  "real_world_connection": "Xà beng dài giúp nậy đinh dễ hơn vì tay đòn lực dài, lực cần nhỏ.",
  "formula": "F_2 = F_1 \\times \\frac{d_1}{d_2} = 100 \\times \\frac{0,4}{0,8} = 50 \\text{ N}"
})

questions.append({
  "id": "phys8_moment_005", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "lever_application", "topic_vn": "Ứng dụng đòn bẩy",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Kéo cắt giấy, kìm, bập bênh đều là ứng dụng của đòn bẩy.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Kéo, kìm, bập bênh đều có cấu tạo gồm: điểm tựa (trục quay), lực tác dụng và lực cản, hoạt động theo nguyên lý đòn bẩy.","key_concept":"Đòn bẩy: có trục quay, lực tác dụng, lực cản."},
  "thinking_guide": {
    "understand": "Kéo, kìm, bập bênh có phải đòn bẩy không?",
    "identify_knowledge": "Đòn bẩy = vật rắn quay quanh trục cố định dưới tác dụng của lực.",
    "plan": "Xác định 3 thành phần đòn bẩy trong mỗi dụng cụ.",
    "steps": ["Bước 1: Kéo: trục = chốt giữa, lực = tay bóp, cản = giấy.", "Bước 2: Kìm: trục = chốt, lực = tay bóp, cản = vật cần kẹp.", "Bước 3: Bập bênh: trục = điểm tựa giữa, lực = người hai bên.", "Bước 4: → Đều là đòn bẩy ✓."],
    "verify": "Cả ba đều có trục quay cố định và hoạt động theo F₁d₁ = F₂d₂.",
    "extend": "Còn nhiều đòn bẩy khác: mở nắp chai, xe cút kít, cần cẩu...",
    "common_traps": ["Nghĩ kéo không phải đòn bẩy vì có hai nửa – thực ra mỗi nửa là một đòn bẩy."],
    "hints": ["Có trục quay + lực tác dụng = đòn bẩy."]
  },
  "real_world_connection": "Trong nhà bếp: kéo, dụng cụ bóc vỏ, mở nắp hộp đều là đòn bẩy.",
  "formula": ""
})

questions.append({
  "id": "phys8_moment_006", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "lever_calculation", "topic_vn": "Tính toán đòn bẩy",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Hai em bé chơi bập bênh. Em A nặng 30 kg ngồi cách trục 2 m. Em B nặng 40 kg phải ngồi cách trục ______ m để bập bênh cân bằng. (Lấy g = 10 m/s²)",
  "options": None,
  "correct_answer": "1,5",
  "explanation": {"summary":"P_A × d_A = P_B × d_B → 300 × 2 = 400 × d_B → d_B = 600/400 = 1,5 m.","key_concept":"F₁d₁ = F₂d₂ → d₂ = F₁d₁/F₂."},
  "thinking_guide": {
    "understand": "A: 30 kg, d_A = 2 m. B: 40 kg. Tìm d_B.",
    "identify_knowledge": "P_A × d_A = P_B × d_B.",
    "plan": "Tính trọng lượng mỗi em, áp dụng cân bằng momen.",
    "steps": ["Bước 1: P_A = 30 × 10 = 300 N. P_B = 40 × 10 = 400 N.", "Bước 2: 300 × 2 = 400 × d_B.", "Bước 3: d_B = 600/400 = 1,5 m."],
    "verify": "M_A = 300×2 = 600. M_B = 400×1,5 = 600. 600 = 600 ✓.",
    "extend": "Em nặng hơn ngồi gần trục hơn → công bằng trong chơi.",
    "common_traps": ["Nhầm: d_B = d_A × m_B/m_A (chia ngược)."],
    "hints": ["Nặng hơn → ngồi gần hơn. d_B = m_A × d_A / m_B."]
  },
  "real_world_connection": "Khi chơi bập bênh, em nhẹ ngồi xa trục, em nặng ngồi gần trục.",
  "formula": "d_B = \\frac{P_A \\times d_A}{P_B} = \\frac{300 \\times 2}{400} = 1,5 \\text{ m}"
})

questions.append({
  "id": "phys8_moment_007", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "moment_application", "topic_vn": "Ứng dụng momen lực",
  "type": "explain", "difficulty": "hard",
  "question_text": "Tại sao khi mở cửa, ta nên đẩy tại mép cửa (xa bản lề) thay vì đẩy gần bản lề? Giải thích bằng momen lực.",
  "options": None,
  "correct_answer": "Bản lề là trục quay O. Khi đẩy ở mép cửa, cánh tay đòn d lớn nhất. Theo M = F×d, với cùng lực F, d lớn → M lớn → cửa quay dễ hơn. Đẩy gần bản lề: d nhỏ → M nhỏ → cần lực F rất lớn mới mở được.",
  "explanation": {"summary":"d lớn → M = F×d lớn với cùng F → quay dễ hơn. Đó là lý do tay nắm cửa luôn ở mép xa bản lề.","key_concept":"M = F×d: tăng d để tăng M khi F không đổi."},
  "thinking_guide": {
    "understand": "Tại sao đẩy xa bản lề dễ mở cửa hơn?",
    "identify_knowledge": "M = F × d. Trục quay = bản lề.",
    "plan": "So sánh M khi d lớn (xa bản lề) và d nhỏ (gần bản lề).",
    "steps": ["Bước 1: Trục quay = bản lề.", "Bước 2: Đẩy ở mép cửa: d = chiều rộng cửa (lớn) → M lớn.", "Bước 3: Đẩy gần bản lề: d nhỏ → M nhỏ → khó mở.", "Bước 4: Cùng F, d lớn → momen lớn → hiệu quả hơn."],
    "verify": "Thử đẩy cửa ở giữa vs ở mép → cảm nhận rõ sự khác biệt.",
    "extend": "Cờ lê dài, tay quay dài cũng dùng nguyên lý tương tự.",
    "common_traps": ["Nghĩ rằng vị trí đẩy không quan trọng."],
    "hints": ["Xa trục quay → d lớn → M lớn → hiệu quả cao."]
  },
  "real_world_connection": "Tay nắm cửa luôn được gắn ở mép xa bản lề, đó là thiết kế dựa trên momen lực.",
  "formula": "M = F \\times d"
})

questions.append({
  "id": "phys8_moment_008", "grade": 8, "chapter": "moment_of_force",
  "chapter_vn": "Momen lực", "topic": "lever_calculation", "topic_vn": "Tính toán đòn bẩy",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Dùng đòn bẩy để nâng một vật nặng 1200 N. Biết cánh tay đòn phía vật nặng là 0,3 m, cánh tay đòn phía lực tác dụng là 1,2 m. Lực cần thiết để nâng vật là:",
  "options": [{"key":"A","content":"300 N"},{"key":"B","content":"400 N"},{"key":"C","content":"600 N"},{"key":"D","content":"4800 N"}],
  "correct_answer": "A",
  "explanation": {"summary":"F₁d₁ = F₂d₂ → 1200 × 0,3 = F × 1,2 → F = 360/1,2 = 300 N.","key_concept":"Đòn bẩy được lợi lực: d lớn hơn → F nhỏ hơn."},
  "thinking_guide": {
    "understand": "P = 1200 N, d_vật = 0,3 m, d_lực = 1,2 m. Tìm F.",
    "identify_knowledge": "P × d_vật = F × d_lực.",
    "plan": "Thay số giải phương trình.",
    "steps": ["Bước 1: 1200 × 0,3 = F × 1,2.", "Bước 2: 360 = 1,2F.", "Bước 3: F = 300 N."],
    "verify": "d_lực/d_vật = 1,2/0,3 = 4 → F = P/4 = 300 N ✓.",
    "extend": "Được lợi 4 lần lực nhưng phải di chuyển đầu đòn quãng đường gấp 4 lần.",
    "common_traps": ["Nhầm: F = P × d_lực/d_vật = 4800 N (chia ngược)."],
    "hints": ["F = P × d_vật/d_lực. Tay đòn dài → lực nhỏ."]
  },
  "real_world_connection": "Xà beng dài 1,2 m nâng viên đá nặng với đầu ngắn 0,3 m → chỉ cần 1/4 lực.",
  "formula": "F = P \\times \\frac{d_{vật}}{d_{lực}} = 1200 \\times \\frac{0,3}{1,2} = 300 \\text{ N}"
})

# ============================================================
# CHAPTER 5: KINETIC ENERGY (8 questions) - Động năng
# ============================================================
questions.append({
  "id": "phys8_kinetic_energy_001", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_concept", "topic_vn": "Khái niệm động năng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Động năng của một vật phụ thuộc vào yếu tố nào?",
  "options": [{"key":"A","content":"Khối lượng và độ cao"},{"key":"B","content":"Khối lượng và vận tốc"},{"key":"C","content":"Vận tốc và độ cao"},{"key":"D","content":"Lực tác dụng và quãng đường"}],
  "correct_answer": "B",
  "explanation": {"summary":"Động năng Wđ = ½mv² phụ thuộc vào khối lượng m và vận tốc v của vật.","key_concept":"Wđ = ½mv²: phụ thuộc m và v."},
  "thinking_guide": {
    "understand": "Động năng phụ thuộc vào gì?",
    "identify_knowledge": "Wđ = ½mv²: có m (khối lượng) và v (vận tốc).",
    "plan": "Nhìn vào công thức Wđ.",
    "steps": ["Bước 1: Wđ = ½mv².", "Bước 2: Công thức chứa m và v.", "Bước 3: Không chứa độ cao h hay lực F."],
    "verify": "Xe nặng chạy nhanh → động năng lớn → va chạm mạnh ✓.",
    "extend": "Động năng tỉ lệ với v² → tăng v gấp đôi thì Wđ tăng 4 lần.",
    "common_traps": ["Nhầm động năng phụ thuộc độ cao (đó là thế năng)."],
    "hints": ["Động = chuyển động → phụ thuộc vận tốc. Năng = năng lượng → phụ thuộc khối lượng."]
  },
  "real_world_connection": "Xe tải nặng chạy nhanh gây tai nạn nghiêm trọng hơn xe máy nhẹ chạy chậm vì động năng lớn hơn nhiều.",
  "formula": "W_đ = \\frac{1}{2}mv^2"
})

questions.append({
  "id": "phys8_kinetic_energy_002", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_calculation", "topic_vn": "Tính động năng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một ô tô có khối lượng 1000 kg đang chạy với vận tốc 20 m/s. Động năng của ô tô là bao nhiêu?",
  "options": [{"key":"A","content":"10000 J"},{"key":"B","content":"20000 J"},{"key":"C","content":"200000 J"},{"key":"D","content":"400000 J"}],
  "correct_answer": "C",
  "explanation": {"summary":"Wđ = ½mv² = ½ × 1000 × 20² = ½ × 1000 × 400 = 200000 J = 200 kJ.","key_concept":"Áp dụng Wđ = ½mv²."},
  "thinking_guide": {
    "understand": "m = 1000 kg, v = 20 m/s. Tính Wđ.",
    "identify_knowledge": "Wđ = ½mv².",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: v² = 20² = 400.", "Bước 2: Wđ = ½ × 1000 × 400.", "Bước 3: Wđ = 200000 J = 200 kJ."],
    "verify": "200 kJ năng lượng → đủ để gây thiệt hại lớn khi va chạm → hợp lý.",
    "extend": "Nếu v = 40 m/s (gấp đôi): Wđ = ½ × 1000 × 1600 = 800000 J (gấp 4 lần!).",
    "common_traps": ["Quên bình phương v: Wđ ≠ ½mv, phải là ½mv²."],
    "hints": ["Tính v² trước, rồi nhân ½ × m × v²."]
  },
  "real_world_connection": "Tốc độ 20 m/s ≈ 72 km/h. Ở tốc độ này, ô tô 1 tấn mang năng lượng 200 kJ.",
  "formula": "W_đ = \\frac{1}{2}mv^2 = \\frac{1}{2} \\times 1000 \\times 20^2 = 200000 \\text{ J}"
})

questions.append({
  "id": "phys8_kinetic_energy_003", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_comparison", "topic_vn": "So sánh động năng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Khi vận tốc của vật tăng gấp 3 lần (khối lượng không đổi), động năng của vật tăng gấp bao nhiêu lần?",
  "options": [{"key":"A","content":"3 lần"},{"key":"B","content":"6 lần"},{"key":"C","content":"9 lần"},{"key":"D","content":"27 lần"}],
  "correct_answer": "C",
  "explanation": {"summary":"Wđ = ½mv². Khi v → 3v: Wđ' = ½m(3v)² = ½m×9v² = 9 × ½mv² = 9Wđ. Động năng tăng 9 lần.","key_concept":"Wđ tỉ lệ v²: tăng v gấp n → Wđ tăng n² lần."},
  "thinking_guide": {
    "understand": "v tăng 3 lần → Wđ tăng bao nhiêu lần?",
    "identify_knowledge": "Wđ = ½mv², Wđ tỉ lệ v².",
    "plan": "Thay v bằng 3v vào công thức.",
    "steps": ["Bước 1: Wđ = ½mv².", "Bước 2: Wđ' = ½m(3v)² = ½m × 9v² = 9(½mv²) = 9Wđ.", "Bước 3: → Tăng 9 lần."],
    "verify": "v tăng 3 lần → v² tăng 3² = 9 lần → Wđ tăng 9 lần ✓.",
    "extend": "Vì Wđ ∝ v², nên khi phanh gấp ở tốc độ cao, quãng đường phanh tăng rất nhanh.",
    "common_traps": ["Nhầm: tăng 3 lần (quên bình phương)."],
    "hints": ["Wđ ∝ v²: tăng v gấp n → Wđ tăng n²."]
  },
  "real_world_connection": "Chạy xe 60 km/h → quãng đường phanh gấp 4 lần so với chạy 30 km/h (v tăng 2 → Wđ tăng 4).",
  "formula": "W'_đ = \\frac{1}{2}m(3v)^2 = 9 \\times \\frac{1}{2}mv^2 = 9W_đ"
})

questions.append({
  "id": "phys8_kinetic_energy_004", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_calculation", "topic_vn": "Tính động năng",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một viên đạn có khối lượng 20 g bay với vận tốc 500 m/s. Động năng của viên đạn là ______ J.",
  "options": None,
  "correct_answer": "2500",
  "explanation": {"summary":"m = 20 g = 0,02 kg. Wđ = ½mv² = ½ × 0,02 × 500² = ½ × 0,02 × 250000 = 2500 J.","key_concept":"Đổi g → kg trước khi tính. Wđ = ½mv²."},
  "thinking_guide": {
    "understand": "m = 20 g, v = 500 m/s. Tính Wđ.",
    "identify_knowledge": "Wđ = ½mv², đổi g → kg.",
    "plan": "Đổi đơn vị, thay số tính toán.",
    "steps": ["Bước 1: m = 20 g = 0,02 kg.", "Bước 2: v² = 500² = 250000.", "Bước 3: Wđ = ½ × 0,02 × 250000 = 2500 J."],
    "verify": "Viên đạn nhỏ nhưng rất nhanh → 2500 J tương đương năng lượng ném vật 25 kg từ 10 m.",
    "extend": "Dù m nhỏ, v² rất lớn nên Wđ vẫn lớn → đạn nguy hiểm.",
    "common_traps": ["Quên đổi g sang kg: 20 g ≠ 20 kg!"],
    "hints": ["1 kg = 1000 g → 20 g = 0,02 kg."]
  },
  "real_world_connection": "Viên đạn nhỏ 20 g nhưng bay 500 m/s có năng lượng 2500 J – đủ sức xuyên thép.",
  "formula": "W_đ = \\frac{1}{2}mv^2 = \\frac{1}{2} \\times 0,02 \\times 500^2 = 2500 \\text{ J}"
})

questions.append({
  "id": "phys8_kinetic_energy_005", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_concept", "topic_vn": "Khái niệm động năng",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Vật đứng yên có động năng bằng 0.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Khi v = 0 → Wđ = ½m×0² = 0. Vật đứng yên không có động năng.","key_concept":"v = 0 → Wđ = 0."},
  "thinking_guide": {
    "understand": "Vật đứng yên → Wđ = ?",
    "identify_knowledge": "Wđ = ½mv². v = 0 → Wđ = 0.",
    "plan": "Thay v = 0 vào công thức.",
    "steps": ["Bước 1: Vật đứng yên → v = 0.", "Bước 2: Wđ = ½m × 0² = 0."],
    "verify": "Vật không chuyển động → không có năng lượng chuyển động → Wđ = 0 ✓.",
    "extend": "Vật đứng yên vẫn có thể có thế năng (nếu ở trên cao) hoặc nhiệt năng.",
    "common_traps": ["Nhầm: vật nặng đứng yên vẫn có Wđ – sai, m ≠ 0 nhưng v = 0 → Wđ = 0."],
    "hints": ["Động năng = năng lượng do chuyển động. Không chuyển động → không có."]
  },
  "real_world_connection": "Quả bóng nằm yên trên sân không có động năng. Khi được đá, nó mới có động năng.",
  "formula": "W_đ = \\frac{1}{2}mv^2 = \\frac{1}{2}m \\times 0^2 = 0"
})

questions.append({
  "id": "phys8_kinetic_energy_006", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_application", "topic_vn": "Ứng dụng động năng",
  "type": "explain", "difficulty": "hard",
  "question_text": "Tại sao khi tham gia giao thông, các phương tiện nặng (xe tải, xe buýt) phải giữ khoảng cách an toàn lớn hơn so với xe máy? Giải thích bằng kiến thức về động năng.",
  "options": None,
  "correct_answer": "Wđ = ½mv². Xe nặng có m lớn → Wđ lớn hơn xe nhẹ ở cùng vận tốc. Khi phanh, cần tiêu hao nhiều năng lượng hơn → quãng đường phanh dài hơn. Do đó cần khoảng cách an toàn lớn hơn để có đủ quãng đường dừng lại.",
  "explanation": {"summary":"m lớn → Wđ lớn → cần quãng đường phanh dài hơn để tiêu hao hết động năng → khoảng cách an toàn phải lớn hơn.","key_concept":"Wđ ∝ m: xe nặng có Wđ lớn → phanh dài hơn."},
  "thinking_guide": {
    "understand": "Xe nặng cần khoảng cách an toàn lớn hơn. Tại sao?",
    "identify_knowledge": "Wđ = ½mv². m lớn → Wđ lớn → cần nhiều năng lượng phanh hơn.",
    "plan": "Liên hệ Wđ với quãng đường phanh.",
    "steps": ["Bước 1: Xe tải m ≈ 10000 kg, xe máy m ≈ 150 kg.", "Bước 2: Cùng v: Wđ_tải/Wđ_máy = m_tải/m_máy ≈ 67 lần.", "Bước 3: Phanh = biến Wđ → nhiệt năng (ma sát). Wđ lớn → phanh lâu, đi xa hơn.", "Bước 4: → Cần khoảng cách lớn hơn."],
    "verify": "Xe tải phanh trượt dài, xe máy dừng nhanh hơn → đúng thực tế.",
    "extend": "Ngoài m, tốc độ cũng quan trọng: v tăng 2 lần → Wđ tăng 4 lần → quãng đường phanh tăng 4 lần.",
    "common_traps": ["Chỉ nói xe nặng nên chậm hơn – thiếu, phải giải thích bằng Wđ."],
    "hints": ["Wđ lớn → cần nhiều năng lượng để dừng → quãng đường phanh dài."]
  },
  "real_world_connection": "Luật giao thông quy định khoảng cách an toàn tối thiểu cho xe tải lớn hơn xe con.",
  "formula": "W_đ = \\frac{1}{2}mv^2"
})

questions.append({
  "id": "phys8_kinetic_energy_007", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_calculation", "topic_vn": "Tính động năng",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Hai xe có cùng động năng. Xe A có khối lượng 500 kg, xe B có khối lượng 2000 kg. Tỉ số vận tốc \\(v_A / v_B\\) bằng bao nhiêu?",
  "options": [{"key":"A","content":"2"},{"key":"B","content":"4"},{"key":"C","content":"1/2"},{"key":"D","content":"1/4"}],
  "correct_answer": "A",
  "explanation": {"summary":"Wđ_A = Wđ_B → ½m_A v_A² = ½m_B v_B² → v_A²/v_B² = m_B/m_A = 2000/500 = 4 → v_A/v_B = √4 = 2.","key_concept":"Cùng Wđ: m nhỏ → v lớn. v_A/v_B = √(m_B/m_A)."},
  "thinking_guide": {
    "understand": "Wđ_A = Wđ_B, m_A = 500 kg, m_B = 2000 kg. Tìm v_A/v_B.",
    "identify_knowledge": "Wđ = ½mv² → v² = 2Wđ/m → v ∝ 1/√m khi Wđ không đổi.",
    "plan": "Lập phương trình từ Wđ_A = Wđ_B.",
    "steps": ["Bước 1: ½ × 500 × v_A² = ½ × 2000 × v_B².", "Bước 2: 500 v_A² = 2000 v_B².", "Bước 3: v_A²/v_B² = 2000/500 = 4.", "Bước 4: v_A/v_B = √4 = 2."],
    "verify": "Xe nhẹ hơn 4 lần → nhanh hơn 2 lần để có cùng Wđ → hợp lý.",
    "extend": "Viên đạn nhẹ nhưng rất nhanh có Wđ tương đương vật nặng chậm.",
    "common_traps": ["Nhầm v_A/v_B = m_B/m_A = 4 (quên căn bậc hai)."],
    "hints": ["v ∝ 1/√m khi Wđ không đổi. Nhớ căn bậc hai!"]
  },
  "real_world_connection": "Viên đạn 10 g bay 600 m/s có Wđ ≈ 1800 J, tương đương người 80 kg chạy ≈ 6,7 m/s.",
  "formula": "\\frac{v_A}{v_B} = \\sqrt{\\frac{m_B}{m_A}} = \\sqrt{\\frac{2000}{500}} = 2"
})

questions.append({
  "id": "phys8_kinetic_energy_008", "grade": 8, "chapter": "kinetic_energy",
  "chapter_vn": "Động năng", "topic": "kinetic_energy_calculation", "topic_vn": "Tính động năng",
  "type": "fill_in", "difficulty": "easy",
  "question_text": "Một học sinh có khối lượng 40 kg đang chạy với vận tốc 5 m/s. Động năng của học sinh là ______ J.",
  "options": None,
  "correct_answer": "500",
  "explanation": {"summary":"Wđ = ½mv² = ½ × 40 × 5² = ½ × 40 × 25 = 500 J.","key_concept":"Wđ = ½mv²."},
  "thinking_guide": {
    "understand": "m = 40 kg, v = 5 m/s. Tính Wđ.",
    "identify_knowledge": "Wđ = ½mv².",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: v² = 5² = 25.", "Bước 2: Wđ = ½ × 40 × 25 = 500 J."],
    "verify": "500 J ≈ nâng vật 5 kg lên 10 m → hợp lý cho năng lượng chạy.",
    "extend": "Usain Bolt (94 kg, 12 m/s): Wđ = ½ × 94 × 144 ≈ 6768 J.",
    "common_traps": ["Quên ½: Wđ = ½mv² chứ không phải mv²."],
    "hints": ["Nhớ hệ số ½ trong công thức."]
  },
  "real_world_connection": "Khi chạy 5 m/s (18 km/h), em có động năng 500 J – đủ để va vào tường rất đau!",
  "formula": "W_đ = \\frac{1}{2}mv^2 = \\frac{1}{2} \\times 40 \\times 5^2 = 500 \\text{ J}"
})

# ============================================================
# CHAPTER 6: POTENTIAL ENERGY (8 questions) - Thế năng
# ============================================================
questions.append({
  "id": "phys8_potential_energy_001", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "potential_energy_concept", "topic_vn": "Khái niệm thế năng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Thế năng trọng trường của một vật phụ thuộc vào:",
  "options": [{"key":"A","content":"Khối lượng và vận tốc"},{"key":"B","content":"Vận tốc và độ cao"},{"key":"C","content":"Khối lượng và độ cao so với mốc"},{"key":"D","content":"Hình dạng và kích thước vật"}],
  "correct_answer": "C",
  "explanation": {"summary":"Thế năng trọng trường Wt = mgh, phụ thuộc khối lượng m và độ cao h so với mốc chọn.","key_concept":"Wt = mgh: phụ thuộc m và h."},
  "thinking_guide": {
    "understand": "Thế năng trọng trường phụ thuộc gì?",
    "identify_knowledge": "Wt = mgh: m (khối lượng), g (gia tốc), h (độ cao).",
    "plan": "Phân tích công thức.",
    "steps": ["Bước 1: Wt = mgh.", "Bước 2: m: khối lượng, h: độ cao so với mốc.", "Bước 3: g ≈ 10 m/s² là hằng số.", "Bước 4: → Phụ thuộc m và h."],
    "verify": "Vật nặng ở cao → nguy hiểm hơn (Wt lớn) ✓.",
    "extend": "Thế năng phụ thuộc mốc: cùng vật, chọn mốc khác nhau → Wt khác nhau.",
    "common_traps": ["Nhầm thế năng phụ thuộc vận tốc (đó là động năng)."],
    "hints": ["Thế = vị thế, ở cao → phụ thuộc độ cao và khối lượng."]
  },
  "real_world_connection": "Chậu hoa trên ban công tầng cao rơi xuống nguy hiểm hơn tầng thấp vì thế năng lớn hơn.",
  "formula": "W_t = mgh"
})

questions.append({
  "id": "phys8_potential_energy_002", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "potential_energy_calculation", "topic_vn": "Tính thế năng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Một quả bóng có khối lượng 0,5 kg ở độ cao 10 m so với mặt đất. Thế năng trọng trường của quả bóng là bao nhiêu? (Lấy g = 10 m/s², mốc thế năng tại mặt đất)",
  "options": [{"key":"A","content":"5 J"},{"key":"B","content":"50 J"},{"key":"C","content":"500 J"},{"key":"D","content":"0,5 J"}],
  "correct_answer": "B",
  "explanation": {"summary":"Wt = mgh = 0,5 × 10 × 10 = 50 J.","key_concept":"Áp dụng Wt = mgh."},
  "thinking_guide": {
    "understand": "m = 0,5 kg, h = 10 m, g = 10 m/s². Tính Wt.",
    "identify_knowledge": "Wt = mgh.",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: Wt = mgh = 0,5 × 10 × 10.", "Bước 2: Wt = 50 J."],
    "verify": "50 J ≈ năng lượng nâng vật 5 kg lên 1 m → hợp lý.",
    "extend": "Nếu bóng rơi từ 10 m, ngay trước khi chạm đất: Wt → Wđ = 50 J.",
    "common_traps": ["Nhầm Wt = ½mgh (không có hệ số ½ như động năng)."],
    "hints": ["Wt = mgh, nhân ba đại lượng với nhau."]
  },
  "real_world_connection": "Quả bóng ở tầng 3 (≈10 m) rơi xuống chạm đất với vận tốc khoảng 14 m/s.",
  "formula": "W_t = mgh = 0,5 \\times 10 \\times 10 = 50 \\text{ J}"
})

questions.append({
  "id": "phys8_potential_energy_003", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "elastic_potential_energy", "topic_vn": "Thế năng đàn hồi",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Lò xo bị nén có thế năng đàn hồi.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Lò xo bị nén (hoặc kéo dãn) bị biến dạng → tích trữ năng lượng dưới dạng thế năng đàn hồi.","key_concept":"Vật bị biến dạng đàn hồi (nén, kéo) → có thế năng đàn hồi."},
  "thinking_guide": {
    "understand": "Lò xo bị nén có thế năng đàn hồi không?",
    "identify_knowledge": "Thế năng đàn hồi: năng lượng tích trữ khi vật bị biến dạng đàn hồi.",
    "plan": "Xác định lò xo nén có bị biến dạng đàn hồi không.",
    "steps": ["Bước 1: Lò xo bị nén → bị biến dạng.", "Bước 2: Biến dạng đàn hồi → tích trữ năng lượng.", "Bước 3: Thả ra → lò xo bung → chuyển thế năng đàn hồi thành động năng."],
    "verify": "Bắn lò xo nén → vật bay ra → năng lượng từ thế năng đàn hồi ✓.",
    "extend": "Cung tên, súng cao su, đệm lò xo đều sử dụng thế năng đàn hồi.",
    "common_traps": ["Nghĩ chỉ kéo dãn mới có thế năng đàn hồi – nén cũng có."],
    "hints": ["Biến dạng đàn hồi (nén hoặc kéo) → thế năng đàn hồi."]
  },
  "real_world_connection": "Đệm lò xo trên giường chuyển đổi giữa thế năng đàn hồi và động năng khi ta nằm lên và ngồi dậy.",
  "formula": ""
})

questions.append({
  "id": "phys8_potential_energy_004", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "potential_energy_calculation", "topic_vn": "Tính thế năng",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một thùng hàng 50 kg được đặt trên kệ cao 4 m so với sàn nhà. Thế năng trọng trường của thùng hàng so với sàn nhà là ______ J. (Lấy g = 10 m/s²)",
  "options": None,
  "correct_answer": "2000",
  "explanation": {"summary":"Wt = mgh = 50 × 10 × 4 = 2000 J = 2 kJ.","key_concept":"Wt = mgh."},
  "thinking_guide": {
    "understand": "m = 50 kg, h = 4 m. Tính Wt.",
    "identify_knowledge": "Wt = mgh.",
    "plan": "Thay số tính toán.",
    "steps": ["Bước 1: Wt = mgh = 50 × 10 × 4.", "Bước 2: Wt = 2000 J = 2 kJ."],
    "verify": "Nếu rơi từ 4 m: v = √(2gh) = √80 ≈ 9 m/s, Wđ = ½×50×81 ≈ 2000 J ✓.",
    "extend": "Nếu sàn nhà ở tầng 2 (cách mặt đất 4 m), Wt so với mặt đất = 50×10×8 = 4000 J.",
    "common_traps": ["Quên đổi đơn vị hoặc nhầm thứ tự nhân."],
    "hints": ["Nhân ba số: m × g × h."]
  },
  "real_world_connection": "Hàng nặng trên kệ cao trong kho có thể gây nguy hiểm nếu rơi – năng lượng 2000 J tương đương búa đập.",
  "formula": "W_t = mgh = 50 \\times 10 \\times 4 = 2000 \\text{ J}"
})

questions.append({
  "id": "phys8_potential_energy_005", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "potential_energy_comparison", "topic_vn": "So sánh thế năng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Hai vật A và B có cùng khối lượng. Vật A ở tầng 3 (cao 9 m), vật B ở tầng 5 (cao 15 m) so với mặt đất. So sánh thế năng của hai vật:",
  "options": [{"key":"A","content":"Wt_A = Wt_B"},{"key":"B","content":"Wt_A > Wt_B"},{"key":"C","content":"Wt_A < Wt_B"},{"key":"D","content":"Không so sánh được"}],
  "correct_answer": "C",
  "explanation": {"summary":"Cùng m, cùng g: Wt = mgh. h_A = 9 m < h_B = 15 m → Wt_A < Wt_B.","key_concept":"Cùng m: h lớn hơn → Wt lớn hơn."},
  "thinking_guide": {
    "understand": "Cùng m, h_A = 9 m, h_B = 15 m. So sánh Wt.",
    "identify_knowledge": "Wt = mgh, cùng m → Wt ∝ h.",
    "plan": "So sánh h để so sánh Wt.",
    "steps": ["Bước 1: Wt_A = mg × 9.", "Bước 2: Wt_B = mg × 15.", "Bước 3: 9 < 15 → Wt_A < Wt_B."],
    "verify": "Tầng cao hơn → nguy hiểm hơn khi rơi → Wt lớn hơn ✓.",
    "extend": "Wt_B/Wt_A = 15/9 = 5/3 ≈ 1,67 lần.",
    "common_traps": ["Nghĩ không so sánh được – sai, cùng m nên chỉ cần so h."],
    "hints": ["Cùng m → Wt tỉ lệ với h."]
  },
  "real_world_connection": "Vật rơi từ tầng 5 va chạm mạnh hơn từ tầng 3 vì thế năng lớn hơn.",
  "formula": "\\frac{W_{t_B}}{W_{t_A}} = \\frac{h_B}{h_A} = \\frac{15}{9} = \\frac{5}{3}"
})

questions.append({
  "id": "phys8_potential_energy_006", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "potential_energy_application", "topic_vn": "Ứng dụng thế năng",
  "type": "explain", "difficulty": "hard",
  "question_text": "Giải thích nguyên lý hoạt động của nhà máy thủy điện dựa trên kiến thức về thế năng.",
  "options": None,
  "correct_answer": "Nước được tích trữ ở hồ chứa trên cao → có thế năng trọng trường lớn (Wt = mgh). Khi xả nước, nước chảy xuống → thế năng chuyển thành động năng. Nước có động năng lớn làm quay tuabin → tuabin kéo máy phát điện → tạo ra điện năng.",
  "explanation": {"summary":"Wt (nước trên cao) → Wđ (nước chảy xuống) → cơ năng quay tuabin → điện năng.","key_concept":"Thủy điện: Wt → Wđ → điện năng."},
  "thinking_guide": {
    "understand": "Nhà máy thủy điện hoạt động dựa trên thế năng như thế nào?",
    "identify_knowledge": "Thế năng → động năng → cơ năng → điện năng.",
    "plan": "Mô tả chuỗi chuyển hóa năng lượng.",
    "steps": ["Bước 1: Nước ở hồ trên cao → Wt = mgh rất lớn.", "Bước 2: Xả nước → h giảm → Wt → Wđ (nước chảy nhanh).", "Bước 3: Nước đập vào cánh tuabin → tuabin quay.", "Bước 4: Tuabin kéo máy phát điện → tạo điện."],
    "verify": "Đập càng cao (h lớn) → điện sản xuất càng nhiều ✓.",
    "extend": "Thủy điện Hòa Bình: đập cao 128 m, công suất 1920 MW.",
    "common_traps": ["Quên bước trung gian: Wt → Wđ → quay tuabin → điện."],
    "hints": ["Nước cao → rơi nhanh → quay tuabin → phát điện."]
  },
  "real_world_connection": "Thủy điện Sơn La – nhà máy thủy điện lớn nhất Việt Nam, đập cao 138 m.",
  "formula": "W_t = mgh \\rightarrow W_đ = \\frac{1}{2}mv^2 \\rightarrow \\text{Điện năng}"
})

questions.append({
  "id": "phys8_potential_energy_007", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "potential_energy_calculation", "topic_vn": "Tính thế năng",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Một cần cẩu nâng kiện hàng 200 kg từ mặt đất lên độ cao 15 m. Công tối thiểu mà cần cẩu phải thực hiện là bao nhiêu? (Lấy g = 10 m/s²)",
  "options": [{"key":"A","content":"3000 J"},{"key":"B","content":"30000 J"},{"key":"C","content":"300 J"},{"key":"D","content":"300000 J"}],
  "correct_answer": "B",
  "explanation": {"summary":"Công tối thiểu = thế năng tăng thêm = mgh = 200 × 10 × 15 = 30000 J = 30 kJ.","key_concept":"Công tối thiểu = ΔWt = mgh."},
  "thinking_guide": {
    "understand": "Nâng 200 kg lên 15 m. Tính công tối thiểu.",
    "identify_knowledge": "Công = ΔWt = mgh (khi vật đi lên đều).",
    "plan": "Tính thế năng tại 15 m.",
    "steps": ["Bước 1: A = Wt = mgh = 200 × 10 × 15.", "Bước 2: A = 30000 J = 30 kJ."],
    "verify": "30 kJ cho 200 kg lên 15 m → 150 J/kg·m → hợp lý.",
    "extend": "Thực tế cần cẩu phải thực hiện công lớn hơn do ma sát và hiệu suất < 100%.",
    "common_traps": ["Quên rằng 'tối thiểu' = bỏ qua ma sát, chỉ tính ΔWt."],
    "hints": ["Công tối thiểu = năng lượng cần cung cấp = mgh."]
  },
  "real_world_connection": "Cần cẩu ở công trường xây dựng nâng vật liệu lên các tầng cao, tiêu tốn rất nhiều năng lượng.",
  "formula": "A = mgh = 200 \\times 10 \\times 15 = 30000 \\text{ J}"
})

questions.append({
  "id": "phys8_potential_energy_008", "grade": 8, "chapter": "potential_energy",
  "chapter_vn": "Thế năng", "topic": "potential_energy_concept", "topic_vn": "Khái niệm thế năng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Trong các trường hợp sau, vật nào KHÔNG có thế năng trọng trường (chọn mốc thế năng tại mặt đất)?",
  "options": [{"key":"A","content":"Máy bay đang bay"},{"key":"B","content":"Quả táo trên cây"},{"key":"C","content":"Viên bi nằm trên sàn nhà"},{"key":"D","content":"Chim đang đậu trên cành cây"}],
  "correct_answer": "C",
  "explanation": {"summary":"Viên bi nằm trên sàn nhà (mặt đất): h = 0 → Wt = mgh = mg×0 = 0. Các vật khác đều ở trên cao → Wt > 0.","key_concept":"h = 0 (tại mốc) → Wt = 0."},
  "thinking_guide": {
    "understand": "Vật nào có h = 0 so với mặt đất?",
    "identify_knowledge": "Wt = mgh. h = 0 → Wt = 0.",
    "plan": "Xác định độ cao từng vật so với mặt đất.",
    "steps": ["Bước 1: Máy bay: h >> 0 → Wt > 0.", "Bước 2: Táo trên cây: h > 0 → Wt > 0.", "Bước 3: Bi trên sàn: h ≈ 0 → Wt ≈ 0 ✓.", "Bước 4: Chim trên cây: h > 0 → Wt > 0."],
    "verify": "Viên bi trên sàn không rơi thêm được → không có Wt ✓.",
    "extend": "Nếu sàn nhà ở tầng 10, chọn mốc mặt đất thì bi vẫn có Wt!",
    "common_traps": ["Quên rằng Wt phụ thuộc mốc chọn."],
    "hints": ["Mốc = mặt đất. Vật ở mặt đất → h = 0 → Wt = 0."]
  },
  "real_world_connection": "Quả dừa trên cây cao 10 m rơi xuống rất nguy hiểm vì thế năng lớn.",
  "formula": ""
})

# ============================================================
# CHAPTER 7: ENERGY CONSERVATION (10 questions) - Bảo toàn năng lượng
# ============================================================
questions.append({
  "id": "phys8_energy_conservation_001", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_conservation_law", "topic_vn": "Định luật bảo toàn năng lượng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Nội dung định luật bảo toàn năng lượng là:",
  "options": [{"key":"A","content":"Năng lượng có thể tự sinh ra và mất đi"},{"key":"B","content":"Năng lượng không tự sinh ra và không tự mất đi, chỉ chuyển hóa từ dạng này sang dạng khác"},{"key":"C","content":"Năng lượng luôn tăng lên"},{"key":"D","content":"Năng lượng chỉ tồn tại dưới dạng nhiệt"}],
  "correct_answer": "B",
  "explanation": {"summary":"Năng lượng không tự sinh ra, không tự mất đi. Nó chỉ chuyển hóa từ dạng này sang dạng khác, hoặc truyền từ vật này sang vật khác.","key_concept":"Bảo toàn năng lượng: không sinh ra, không mất đi, chỉ chuyển hóa."},
  "thinking_guide": {
    "understand": "Định luật bảo toàn năng lượng nói gì?",
    "identify_knowledge": "Năng lượng được bảo toàn: chuyển hóa và truyền, không sinh ra/mất đi.",
    "plan": "Nhớ lại phát biểu định luật.",
    "steps": ["Bước 1: Năng lượng không tự sinh ra từ hư không.", "Bước 2: Năng lượng không tự mất đi.", "Bước 3: Chỉ chuyển hóa dạng (Wt → Wđ) hoặc truyền giữa các vật."],
    "verify": "Pin hết không phải mất năng lượng, mà đã chuyển thành nhiệt, ánh sáng...",
    "extend": "Định luật này là một trong những định luật cơ bản nhất của vật lý.",
    "common_traps": ["Nghĩ năng lượng 'mất đi' khi dùng hết pin → sai, nó chuyển dạng."],
    "hints": ["Không sinh ra, không mất đi, chỉ chuyển hóa."]
  },
  "real_world_connection": "Máy 'vĩnh cửu' (perpetual motion) không thể tồn tại vì vi phạm bảo toàn năng lượng.",
  "formula": ""
})

questions.append({
  "id": "phys8_energy_conservation_002", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_transformation", "topic_vn": "Chuyển hóa năng lượng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Khi thả một viên bi từ trên cao xuống (bỏ qua sức cản không khí), trong quá trình rơi:",
  "options": [{"key":"A","content":"Thế năng tăng, động năng giảm"},{"key":"B","content":"Thế năng giảm, động năng tăng, cơ năng bảo toàn"},{"key":"C","content":"Thế năng và động năng đều tăng"},{"key":"D","content":"Thế năng và động năng đều giảm"}],
  "correct_answer": "B",
  "explanation": {"summary":"Khi rơi: h giảm → Wt giảm. v tăng → Wđ tăng. Bỏ qua ma sát: Wt + Wđ = const (cơ năng bảo toàn). Thế năng mất đi = động năng tăng thêm.","key_concept":"Rơi tự do: Wt → Wđ, cơ năng bảo toàn."},
  "thinking_guide": {
    "understand": "Bi rơi: Wt và Wđ thay đổi thế nào?",
    "identify_knowledge": "Rơi: h giảm → Wt giảm, v tăng → Wđ tăng. Bảo toàn cơ năng.",
    "plan": "Phân tích sự thay đổi h và v khi rơi.",
    "steps": ["Bước 1: h giảm → Wt = mgh giảm.", "Bước 2: v tăng → Wđ = ½mv² tăng.", "Bước 3: Bỏ qua ma sát → Wt + Wđ không đổi."],
    "verify": "Tại điểm cao nhất: Wt max, Wđ = 0. Tại đất: Wt = 0, Wđ max. Tổng không đổi.",
    "extend": "Nếu có ma sát: cơ năng giảm dần, một phần chuyển thành nhiệt.",
    "common_traps": ["Quên rằng tổng cơ năng bảo toàn (bỏ qua ma sát)."],
    "hints": ["Rơi: mất Wt → được Wđ. Tổng không đổi."]
  },
  "real_world_connection": "Nhảy bungee: thế năng → động năng → thế năng đàn hồi dây → lại lên → chu kỳ.",
  "formula": "W_t + W_đ = \\text{const} \\quad (\\text{bỏ qua ma sát})"
})

questions.append({
  "id": "phys8_energy_conservation_003", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_transformation", "topic_vn": "Chuyển hóa năng lượng",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một vật có khối lượng 2 kg rơi tự do từ độ cao 20 m (bỏ qua sức cản). Vận tốc của vật ngay trước khi chạm đất là ______ m/s. (Lấy g = 10 m/s²)",
  "options": None,
  "correct_answer": "20",
  "explanation": {"summary":"Bảo toàn cơ năng: mgh = ½mv² → v = √(2gh) = √(2×10×20) = √400 = 20 m/s.","key_concept":"v = √(2gh) khi rơi tự do từ độ cao h."},
  "thinking_guide": {
    "understand": "m = 2 kg, h = 20 m. Tìm v chạm đất.",
    "identify_knowledge": "Bảo toàn cơ năng: Wt ban đầu = Wđ cuối. mgh = ½mv².",
    "plan": "Giải phương trình mgh = ½mv² (m triệt tiêu).",
    "steps": ["Bước 1: mgh = ½mv² → gh = ½v².", "Bước 2: v² = 2gh = 2 × 10 × 20 = 400.", "Bước 3: v = √400 = 20 m/s."],
    "verify": "v = 20 m/s = 72 km/h → hợp lý cho vật rơi 20 m.",
    "extend": "v không phụ thuộc m! Vật nặng hay nhẹ đều chạm đất cùng vận tốc (bỏ qua sức cản).",
    "common_traps": ["Nghĩ v phụ thuộc m – sai, m triệt tiêu trong phương trình."],
    "hints": ["Wt = Wđ → mgh = ½mv² → v = √(2gh), không phụ thuộc m."]
  },
  "real_world_connection": "Rơi từ tầng 7 (≈20 m) sẽ chạm đất với 72 km/h – rất nguy hiểm!",
  "formula": "v = \\sqrt{2gh} = \\sqrt{2 \\times 10 \\times 20} = 20 \\text{ m/s}"
})

questions.append({
  "id": "phys8_energy_conservation_004", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_types", "topic_vn": "Các dạng năng lượng",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Khi con lắc đơn dao động, tại vị trí cao nhất, động năng bằng 0 và thế năng đạt giá trị lớn nhất.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. Tại vị trí cao nhất, con lắc dừng lại tức thời (v = 0 → Wđ = 0) và h lớn nhất (Wt max).","key_concept":"Vị trí cao nhất: v = 0, Wđ = 0, Wt = max."},
  "thinking_guide": {
    "understand": "Con lắc ở điểm cao nhất: Wđ = 0 và Wt max?",
    "identify_knowledge": "Tại điểm biên (cao nhất), con lắc đổi chiều → v = 0.",
    "plan": "Xét v và h tại điểm cao nhất.",
    "steps": ["Bước 1: Điểm cao nhất → h max → Wt max.", "Bước 2: Đổi chiều → v = 0 → Wđ = 0."],
    "verify": "Tổng cơ năng = Wt max + 0 = Wt max = const ✓.",
    "extend": "Tại điểm thấp nhất: v max, Wđ max, h = 0, Wt = 0.",
    "common_traps": ["Nghĩ con lắc luôn chuyển động → luôn có Wđ – sai tại điểm biên."],
    "hints": ["Điểm biên = đổi chiều = dừng tức thời → v = 0."]
  },
  "real_world_connection": "Đồng hồ quả lắc dao động nhờ chuyển đổi liên tục giữa Wt và Wđ.",
  "formula": ""
})

questions.append({
  "id": "phys8_energy_conservation_005", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_transformation", "topic_vn": "Chuyển hóa năng lượng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Khi ném một quả bóng thẳng đứng lên cao (bỏ qua sức cản), tại vị trí cao nhất:",
  "options": [{"key":"A","content":"Cơ năng bằng 0"},{"key":"B","content":"Cơ năng bằng động năng ban đầu"},{"key":"C","content":"Cơ năng bằng thế năng tại vị trí đó"},{"key":"D","content":"Cả B và C đều đúng"}],
  "correct_answer": "D",
  "explanation": {"summary":"Tại đỉnh: v = 0 → Wđ = 0 → W = Wt (đáp án C). Bảo toàn cơ năng: W = Wđ ban đầu (đáp án B). Cả B và C đều đúng.","key_concept":"Cơ năng bảo toàn: W = Wđ(ban đầu) = Wt(đỉnh)."},
  "thinking_guide": {
    "understand": "Tại đỉnh cao nhất, cơ năng bằng gì?",
    "identify_knowledge": "Bảo toàn cơ năng. Tại đỉnh: Wđ = 0 → W = Wt.",
    "plan": "Phân tích cơ năng tại điểm ném và tại đỉnh.",
    "steps": ["Bước 1: Tại mặt đất: W = Wđ₀ + 0 = Wđ₀ (h=0).", "Bước 2: Tại đỉnh: W = 0 + Wt = Wt (v=0).", "Bước 3: Bảo toàn: Wđ₀ = Wt (đỉnh) = W.", "Bước 4: → B đúng (W = Wđ₀) và C đúng (W = Wt) → D."],
    "verify": "W không đổi, chỉ chuyển hóa Wđ ↔ Wt.",
    "extend": "Tại giữa quãng đường: W = ½Wđ₀ + ½Wt = Wđ₀.",
    "common_traps": ["Chọn B hoặc C mà không nhận ra cả hai đều đúng."],
    "hints": ["Kiểm tra từng đáp án, nếu nhiều đáp án đúng → chọn 'cả ... đều đúng'."]
  },
  "real_world_connection": "Pháo hoa bay lên cao nhất khi vận tốc = 0, toàn bộ năng lượng là thế năng.",
  "formula": "W = W_đ(ban\\ đầu) = W_t(đỉnh) = \\text{const}"
})

questions.append({
  "id": "phys8_energy_conservation_006", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_conservation_calculation", "topic_vn": "Tính toán bảo toàn năng lượng",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Một vật được ném thẳng đứng lên cao với vận tốc 10 m/s. Độ cao lớn nhất mà vật đạt được là bao nhiêu? (Bỏ qua sức cản, g = 10 m/s²)",
  "options": [{"key":"A","content":"5 m"},{"key":"B","content":"10 m"},{"key":"C","content":"20 m"},{"key":"D","content":"1 m"}],
  "correct_answer": "A",
  "explanation": {"summary":"Bảo toàn cơ năng: ½mv² = mgh → h = v²/(2g) = 100/20 = 5 m.","key_concept":"h_max = v²/(2g)."},
  "thinking_guide": {
    "understand": "v₀ = 10 m/s, ném lên. Tìm h_max.",
    "identify_knowledge": "Bảo toàn: Wđ(đầu) = Wt(đỉnh) → ½mv² = mgh.",
    "plan": "Giải h từ phương trình bảo toàn.",
    "steps": ["Bước 1: ½mv₀² = mgh_max.", "Bước 2: h_max = v₀²/(2g) = 100/(2×10) = 5 m."],
    "verify": "v = 10 m/s ≈ 36 km/h → lên được 5 m ≈ tầng 2 → hợp lý.",
    "extend": "Ném mạnh gấp đôi (v=20 m/s): h = 400/20 = 20 m (gấp 4 lần!).",
    "common_traps": ["Quên chia cho 2 trong 2g, hoặc nhầm h = v²/g = 10 m."],
    "hints": ["h = v²/(2g). Nhớ có số 2 ở mẫu."]
  },
  "real_world_connection": "VĐV nhảy cao đạt ~2,4 m → v₀ ≈ √(2×10×2,4) ≈ 7 m/s khi giậm nhảy.",
  "formula": "h_{max} = \\frac{v_0^2}{2g} = \\frac{10^2}{2 \\times 10} = 5 \\text{ m}"
})

questions.append({
  "id": "phys8_energy_conservation_007", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_transformation", "topic_vn": "Chuyển hóa năng lượng",
  "type": "explain", "difficulty": "hard",
  "question_text": "Một quả bóng được thả rơi từ độ cao h, sau mỗi lần nảy lên, quả bóng đạt độ cao thấp hơn lần trước. Điều này có mâu thuẫn với định luật bảo toàn năng lượng không? Giải thích.",
  "options": None,
  "correct_answer": "Không mâu thuẫn. Mỗi lần va chạm với sàn, một phần cơ năng chuyển thành nhiệt năng (sàn và bóng nóng lên), âm thanh, biến dạng vĩnh viễn. Tổng năng lượng vẫn bảo toàn, nhưng cơ năng (Wt + Wđ) giảm dần do chuyển hóa sang dạng khác.",
  "explanation": {"summary":"Cơ năng giảm nhưng tổng năng lượng bảo toàn. Phần cơ năng mất đi chuyển thành nhiệt, âm thanh... Không vi phạm bảo toàn năng lượng.","key_concept":"Cơ năng giảm ≠ năng lượng mất. Chuyển sang nhiệt năng, âm thanh."},
  "thinking_guide": {
    "understand": "Bóng nảy thấp dần – năng lượng mất đi?",
    "identify_knowledge": "Bảo toàn năng lượng: tổng năng lượng không đổi, nhưng cơ năng có thể giảm.",
    "plan": "Xác định năng lượng đi đâu khi cơ năng giảm.",
    "steps": ["Bước 1: Mỗi lần nảy: bóng nóng lên + nghe tiếng 'bốp'.", "Bước 2: Nhiệt năng (nóng) + âm thanh = phần cơ năng mất.", "Bước 3: Tổng NL = cơ năng + nhiệt + âm thanh = const.", "Bước 4: → Không vi phạm bảo toàn NL."],
    "verify": "Bóng bàn nảy tốt hơn bóng đất sét → ít mất NL hơn → đúng.",
    "extend": "Hệ số phục hồi e = √(h₂/h₁): bóng tennis e ≈ 0,75, bóng golf e ≈ 0,83.",
    "common_traps": ["Nhầm: bóng nảy thấp dần = năng lượng mất → vi phạm bảo toàn."],
    "hints": ["Năng lượng không mất, chỉ chuyển dạng: cơ năng → nhiệt + âm thanh."]
  },
  "real_world_connection": "Sau khi bóng rổ rơi và nảy nhiều lần, cầm bóng lên thấy ấm hơn → cơ năng → nhiệt.",
  "formula": ""
})

questions.append({
  "id": "phys8_energy_conservation_008", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_transformation", "topic_vn": "Chuyển hóa năng lượng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Trong quạt điện, năng lượng chuyển hóa chủ yếu theo thứ tự nào?",
  "options": [{"key":"A","content":"Nhiệt năng → Điện năng → Cơ năng"},{"key":"B","content":"Điện năng → Cơ năng (+ nhiệt năng)"},{"key":"C","content":"Cơ năng → Điện năng → Nhiệt năng"},{"key":"D","content":"Quang năng → Điện năng → Cơ năng"}],
  "correct_answer": "B",
  "explanation": {"summary":"Quạt điện: điện năng → cơ năng (cánh quạt quay) + nhiệt năng (motor nóng lên). Phần lớn là cơ năng, phần nhỏ là nhiệt.","key_concept":"Quạt điện: điện năng → cơ năng + nhiệt năng (hao phí)."},
  "thinking_guide": {
    "understand": "Quạt điện chuyển hóa năng lượng thế nào?",
    "identify_knowledge": "Điện → quay cánh (cơ năng) + nóng motor (nhiệt).",
    "plan": "Xác định năng lượng đầu vào và đầu ra.",
    "steps": ["Bước 1: Đầu vào: điện năng (cắm điện).", "Bước 2: Đầu ra chính: cơ năng (cánh quạt quay tạo gió).", "Bước 3: Đầu ra phụ: nhiệt năng (motor nóng).", "Bước 4: → Điện năng → Cơ năng + Nhiệt năng."],
    "verify": "Quạt chạy lâu → motor nóng → đúng có nhiệt năng hao phí ✓.",
    "extend": "Hiệu suất quạt = cơ năng hữu ích / điện năng tiêu thụ × 100%.",
    "common_traps": ["Quên nhiệt năng hao phí (motor nóng)."],
    "hints": ["Điện → chạy → nóng: Điện → Cơ + Nhiệt."]
  },
  "real_world_connection": "Quạt điện chạy cả ngày, sờ vào motor thấy nóng → phần điện năng biến thành nhiệt hao phí.",
  "formula": ""
})

questions.append({
  "id": "phys8_energy_conservation_009", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_conservation_calculation", "topic_vn": "Tính toán bảo toàn năng lượng",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Một con lắc đơn được thả từ độ cao 0,8 m so với vị trí cân bằng (bỏ qua ma sát). Vận tốc của con lắc tại vị trí cân bằng (thấp nhất) là ______ m/s. (Lấy g = 10 m/s²)",
  "options": None,
  "correct_answer": "4",
  "explanation": {"summary":"Bảo toàn cơ năng: mgh = ½mv² → v = √(2gh) = √(2×10×0,8) = √16 = 4 m/s.","key_concept":"v = √(2gh) tại vị trí thấp nhất."},
  "thinking_guide": {
    "understand": "Con lắc thả từ h = 0,8 m. Tìm v tại vị trí thấp nhất.",
    "identify_knowledge": "Bảo toàn: Wt(cao) = Wđ(thấp) → mgh = ½mv².",
    "plan": "Giải v = √(2gh).",
    "steps": ["Bước 1: mgh = ½mv² → v² = 2gh.", "Bước 2: v² = 2 × 10 × 0,8 = 16.", "Bước 3: v = √16 = 4 m/s."],
    "verify": "4 m/s ≈ 14,4 km/h → hợp lý cho con lắc thả từ 0,8 m.",
    "extend": "Sau đó con lắc lên bên kia, đạt đúng h = 0,8 m (nếu bỏ qua ma sát).",
    "common_traps": ["Quên căn bậc hai: v ≠ 2gh, mà v = √(2gh)."],
    "hints": ["v = √(2gh). Tính 2gh trước, rồi lấy căn."]
  },
  "real_world_connection": "Xích đu đạt vận tốc lớn nhất tại điểm thấp nhất – khi ngồi xích đu ta thấy nhanh nhất ở đáy.",
  "formula": "v = \\sqrt{2gh} = \\sqrt{2 \\times 10 \\times 0,8} = 4 \\text{ m/s}"
})

questions.append({
  "id": "phys8_energy_conservation_010", "grade": 8, "chapter": "energy_conservation",
  "chapter_vn": "Bảo toàn năng lượng", "topic": "energy_types", "topic_vn": "Các dạng năng lượng",
  "type": "explain", "difficulty": "medium",
  "question_text": "Hãy mô tả sự chuyển hóa năng lượng khi một vận động viên nhảy cầu từ ván nhún 10 m xuống bể bơi.",
  "options": None,
  "correct_answer": "VĐV đứng trên ván nhún: có thế năng trọng trường (Wt = mgh) và thế năng đàn hồi (ván nhún bị cong). Nhún ván → thế năng đàn hồi → động năng (bay lên). Bay lên cao: Wđ → Wt. Tại đỉnh: Wt max. Rơi xuống: Wt → Wđ. Chạm nước: Wđ → nhiệt năng + sóng nước + âm thanh.",
  "explanation": {"summary":"Wt đàn hồi → Wđ (nhảy) → Wt (bay lên) → Wđ (rơi) → nhiệt + sóng + âm (chạm nước). Chuỗi chuyển hóa phức tạp.","key_concept":"Chuỗi chuyển hóa: đàn hồi → cơ năng → nhiệt + sóng + âm thanh."},
  "thinking_guide": {
    "understand": "Mô tả chuyển hóa năng lượng khi nhảy cầu.",
    "identify_knowledge": "Bảo toàn năng lượng, các dạng: Wt, Wđ, Wt đàn hồi, nhiệt, âm.",
    "plan": "Chia thành các giai đoạn: nhún → bay lên → đỉnh → rơi → chạm nước.",
    "steps": ["Bước 1: Nhún ván: Wt đàn hồi → Wđ (đẩy người lên).", "Bước 2: Bay lên: Wđ → Wt (h tăng).", "Bước 3: Đỉnh: Wt max, Wđ = 0.", "Bước 4: Rơi: Wt → Wđ (v tăng).", "Bước 5: Chạm nước: Wđ → nhiệt + sóng + âm thanh."],
    "verify": "Nước bắn lên (sóng) + nghe tiếng 'tõm' (âm) + nước ấm hơn chút (nhiệt) ✓.",
    "extend": "VĐV nhảy từ 10 m: v chạm nước ≈ √(2×10×10) ≈ 14 m/s ≈ 50 km/h.",
    "common_traps": ["Chỉ nói Wt → Wđ mà quên giai đoạn chạm nước."],
    "hints": ["Chia thành 5 giai đoạn: nhún, bay, đỉnh, rơi, chạm nước."]
  },
  "real_world_connection": "VĐV nhảy cầu Olympic nhảy từ 10 m, chạm nước với tốc độ ~50 km/h!",
  "formula": ""
})

# ============================================================
# CHAPTER 8: HEAT TRANSFER (8 questions) - Truyền nhiệt: Q=mcΔt
# ============================================================
questions.append({
  "id": "phys8_heat_transfer_001", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "heat_formula", "topic_vn": "Công thức nhiệt lượng",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Công thức tính nhiệt lượng thu vào (hoặc tỏa ra) khi vật thay đổi nhiệt độ là:",
  "options": [{"key":"A","content":"\\(Q = mc\\)"},{"key":"B","content":"\\(Q = mc\\Delta t\\)"},{"key":"C","content":"\\(Q = m\\Delta t\\)"},{"key":"D","content":"\\(Q = c\\Delta t\\)"}],
  "correct_answer": "B",
  "explanation": {"summary":"Q = mcΔt, trong đó m là khối lượng (kg), c là nhiệt dung riêng (J/kg·K), Δt là độ thay đổi nhiệt độ (°C hoặc K).","key_concept":"Q = mcΔt: nhiệt lượng = khối lượng × nhiệt dung riêng × độ biến thiên nhiệt độ."},
  "thinking_guide": {
    "understand": "Công thức nhiệt lượng Q là gì?",
    "identify_knowledge": "Q = mcΔt.",
    "plan": "Nhớ lại công thức và ý nghĩa đại lượng.",
    "steps": ["Bước 1: Q = mcΔt.", "Bước 2: m: khối lượng vật (kg).", "Bước 3: c: nhiệt dung riêng (J/kg·K).", "Bước 4: Δt: độ thay đổi nhiệt độ (°C)."],
    "verify": "Đơn vị: kg × J/(kg·K) × K = J → đúng.",
    "extend": "c_nước = 4200 J/kg·K, c_sắt = 460 J/kg·K. Nước có c lớn nhất trong các chất phổ biến.",
    "common_traps": ["Thiếu c hoặc Δt trong công thức."],
    "hints": ["Q = mcΔt: cần cả 3 đại lượng m, c, Δt."]
  },
  "real_world_connection": "Đun 1 lít nước (1 kg) từ 25°C lên 100°C: Q = 1 × 4200 × 75 = 315000 J ≈ 315 kJ.",
  "formula": "Q = mc\\Delta t"
})

questions.append({
  "id": "phys8_heat_transfer_002", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "heat_calculation", "topic_vn": "Tính nhiệt lượng",
  "type": "multiple_choice", "difficulty": "medium",
  "question_text": "Cần cung cấp bao nhiêu nhiệt lượng để đun nóng 2 kg nước từ 25°C lên 75°C? Biết nhiệt dung riêng của nước c = 4200 J/(kg·K).",
  "options": [{"key":"A","content":"210000 J"},{"key":"B","content":"420000 J"},{"key":"C","content":"630000 J"},{"key":"D","content":"84000 J"}],
  "correct_answer": "B",
  "explanation": {"summary":"Δt = 75 - 25 = 50°C. Q = mcΔt = 2 × 4200 × 50 = 420000 J = 420 kJ.","key_concept":"Tính Δt trước, rồi dùng Q = mcΔt."},
  "thinking_guide": {
    "understand": "m = 2 kg nước, từ 25°C → 75°C. Tính Q.",
    "identify_knowledge": "Q = mcΔt. c_nước = 4200 J/(kg·K).",
    "plan": "Tính Δt, rồi thay vào Q = mcΔt.",
    "steps": ["Bước 1: Δt = 75 - 25 = 50°C.", "Bước 2: Q = 2 × 4200 × 50.", "Bước 3: Q = 420000 J = 420 kJ."],
    "verify": "420 kJ cho 2 kg nước tăng 50°C → 210 kJ/kg → hợp lý.",
    "extend": "Để đun sôi (100°C): Δt = 75°C, Q = 2 × 4200 × 75 = 630000 J.",
    "common_traps": ["Dùng nhiệt độ cuối thay vì Δt: Q ≠ mc × 75°C."],
    "hints": ["Δt = t_cuối - t_đầu. Q = mcΔt."]
  },
  "real_world_connection": "Đun 2 lít nước pha trà cần khoảng 420 kJ – bếp điện 2000W mất khoảng 3,5 phút.",
  "formula": "Q = mc\\Delta t = 2 \\times 4200 \\times 50 = 420000 \\text{ J}"
})

questions.append({
  "id": "phys8_heat_transfer_003", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "specific_heat", "topic_vn": "Nhiệt dung riêng",
  "type": "true_false", "difficulty": "easy",
  "question_text": "Nhiệt dung riêng của nước lớn hơn nhiệt dung riêng của sắt, nên nước nóng lên chậm hơn sắt khi cùng nhận nhiệt lượng như nhau.",
  "options": [{"key":"A","content":"Đúng"},{"key":"B","content":"Sai"}],
  "correct_answer": "A",
  "explanation": {"summary":"Đúng. c_nước = 4200 > c_sắt = 460. Cùng m và Q: Δt = Q/(mc). c lớn → Δt nhỏ → nóng lên chậm hơn.","key_concept":"c lớn → cần nhiều Q hơn để tăng cùng Δt → nóng chậm hơn."},
  "thinking_guide": {
    "understand": "c_nước > c_sắt → nước nóng chậm hơn?",
    "identify_knowledge": "Δt = Q/(mc). c lớn → Δt nhỏ → nóng chậm hơn.",
    "plan": "Phân tích ảnh hưởng của c trong công thức.",
    "steps": ["Bước 1: Q = mcΔt → Δt = Q/(mc).", "Bước 2: c_nước lớn → Q/(mc) nhỏ → Δt nhỏ → nóng chậm.", "Bước 3: c_sắt nhỏ → Δt lớn → nóng nhanh."],
    "verify": "Bếp lửa: nồi sắt nóng rất nhanh, nước trong nồi nóng chậm hơn ✓.",
    "extend": "Nước cũng nguội chậm hơn → giữ nhiệt tốt → dùng túi nước nóng sưởi.",
    "common_traps": ["Nhầm: c lớn → nóng nhanh (ngược lại!)."],
    "hints": ["c lớn = 'sức chứa nhiệt' lớn = cần nhiều Q hơn = nóng chậm."]
  },
  "real_world_connection": "Biển giúp điều hòa khí hậu vì nước có c lớn: mùa hè mát hơn, mùa đông ấm hơn so với vùng sâu lục địa.",
  "formula": "\\Delta t = \\frac{Q}{mc}"
})

questions.append({
  "id": "phys8_heat_transfer_004", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "heat_calculation", "topic_vn": "Tính nhiệt lượng",
  "type": "fill_in", "difficulty": "medium",
  "question_text": "Một miếng đồng khối lượng 0,5 kg ở 120°C được thả vào nước. Miếng đồng nguội xuống 30°C. Nhiệt lượng đồng tỏa ra là ______ J. (c_đồng = 380 J/kg·K)",
  "options": None,
  "correct_answer": "17100",
  "explanation": {"summary":"Δt = 120 - 30 = 90°C. Q = mcΔt = 0,5 × 380 × 90 = 17100 J.","key_concept":"Q tỏa ra: Δt = t_đầu - t_cuối."},
  "thinking_guide": {
    "understand": "Đồng 0,5 kg, từ 120°C → 30°C. Tính Q tỏa ra.",
    "identify_knowledge": "Q = mcΔt, Δt = |120 - 30| = 90°C.",
    "plan": "Tính Δt, thay vào công thức.",
    "steps": ["Bước 1: Δt = 120 - 30 = 90°C.", "Bước 2: Q = 0,5 × 380 × 90.", "Bước 3: Q = 17100 J."],
    "verify": "17100 J cho 0,5 kg đồng giảm 90°C → 380 J/(kg·K) × 0,5 × 90 = 17100 ✓.",
    "extend": "Nhiệt này truyền vào nước: Q_thu = Q_tỏa = 17100 J (bảo toàn).",
    "common_traps": ["Nhầm Δt = 30°C thay vì 90°C."],
    "hints": ["Δt = |t_ban đầu - t_cuối cùng| = 120 - 30 = 90°C."]
  },
  "real_world_connection": "Thợ rèn nhúng sắt nóng vào nước để nguội: sắt tỏa nhiệt, nước thu nhiệt.",
  "formula": "Q = mc\\Delta t = 0,5 \\times 380 \\times 90 = 17100 \\text{ J}"
})

questions.append({
  "id": "phys8_heat_transfer_005", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "thermal_equilibrium", "topic_vn": "Cân bằng nhiệt",
  "type": "multiple_choice", "difficulty": "hard",
  "question_text": "Thả một khối sắt 0,5 kg ở 100°C vào 2 kg nước ở 20°C. Bỏ qua sự trao đổi nhiệt với môi trường. Nhiệt độ khi cân bằng nhiệt xấp xỉ bao nhiêu? (c_sắt = 460 J/kg·K, c_nước = 4200 J/kg·K)",
  "options": [{"key":"A","content":"22,2°C"},{"key":"B","content":"25°C"},{"key":"C","content":"30°C"},{"key":"D","content":"60°C"}],
  "correct_answer": "A",
  "explanation": {"summary":"Q_tỏa = Q_thu → m_sắt × c_sắt × (100 - t) = m_nước × c_nước × (t - 20). 0,5×460×(100-t) = 2×4200×(t-20). 230(100-t) = 8400(t-20). 23000 - 230t = 8400t - 168000. 191000 = 8630t. t ≈ 22,1°C ≈ 22,2°C.","key_concept":"Cân bằng nhiệt: Q_tỏa = Q_thu → tìm t chung."},
  "thinking_guide": {
    "understand": "Sắt 0,5 kg, 100°C + Nước 2 kg, 20°C. Tìm t cân bằng.",
    "identify_knowledge": "Q_tỏa = Q_thu. m₁c₁(t₁-t) = m₂c₂(t-t₂).",
    "plan": "Lập phương trình cân bằng nhiệt và giải t.",
    "steps": ["Bước 1: Q_sắt tỏa = 0,5 × 460 × (100 - t).", "Bước 2: Q_nước thu = 2 × 4200 × (t - 20).", "Bước 3: 230(100-t) = 8400(t-20).", "Bước 4: 23000 - 230t = 8400t - 168000.", "Bước 5: 191000 = 8630t → t ≈ 22,1°C."],
    "verify": "t ≈ 22°C gần với 20°C → hợp lý vì nước nhiều hơn và c lớn hơn.",
    "extend": "Nước 'thắng' vì m×c nước = 8400 >> m×c sắt = 230.",
    "common_traps": ["Sai dấu: sắt tỏa (100-t), nước thu (t-20). Không nhầm ngược."],
    "hints": ["Q_tỏa = Q_thu: vật nóng giảm, vật lạnh tăng đến cùng t."]
  },
  "real_world_connection": "Thả thanh sắt nung đỏ vào xô nước: nước ấm lên ít vì c nước rất lớn.",
  "formula": "m_1 c_1 (t_1 - t) = m_2 c_2 (t - t_2)"
})

questions.append({
  "id": "phys8_heat_transfer_006", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "heat_transfer_methods", "topic_vn": "Các hình thức truyền nhiệt",
  "type": "multiple_choice", "difficulty": "easy",
  "question_text": "Có ba hình thức truyền nhiệt. Đâu KHÔNG phải là hình thức truyền nhiệt?",
  "options": [{"key":"A","content":"Dẫn nhiệt"},{"key":"B","content":"Đối lưu"},{"key":"C","content":"Bức xạ nhiệt"},{"key":"D","content":"Cơ học"}],
  "correct_answer": "D",
  "explanation": {"summary":"Ba hình thức truyền nhiệt: dẫn nhiệt, đối lưu, bức xạ nhiệt. Cơ học không phải hình thức truyền nhiệt.","key_concept":"3 hình thức truyền nhiệt: dẫn nhiệt, đối lưu, bức xạ nhiệt."},
  "thinking_guide": {
    "understand": "Đâu không phải hình thức truyền nhiệt?",
    "identify_knowledge": "3 hình thức: dẫn nhiệt, đối lưu, bức xạ nhiệt.",
    "plan": "Kiểm tra từng đáp án.",
    "steps": ["Bước 1: Dẫn nhiệt: nhiệt truyền qua vật rắn (thanh kim loại nóng).", "Bước 2: Đối lưu: nhiệt truyền trong chất lỏng/khí nhờ dòng chảy.", "Bước 3: Bức xạ nhiệt: nhiệt truyền qua tia hồng ngoại (Mặt Trời).", "Bước 4: Cơ học: liên quan đến lực và chuyển động → không phải truyền nhiệt."],
    "verify": "Cơ học (cơ năng) ≠ truyền nhiệt → D là đáp án.",
    "extend": "Dẫn nhiệt chủ yếu trong chất rắn. Đối lưu trong chất lỏng/khí. Bức xạ không cần môi trường.",
    "common_traps": ["Nhầm cơ học với truyền nhiệt."],
    "hints": ["3 hình thức truyền nhiệt: dẫn, đối lưu, bức xạ. Chọn cái không phải."]
  },
  "real_world_connection": "Bếp lửa truyền nhiệt bằng cả 3 cách: dẫn (nồi nóng), đối lưu (khói bay lên), bức xạ (sưởi ấm).",
  "formula": ""
})

questions.append({
  "id": "phys8_heat_transfer_007", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "heat_calculation", "topic_vn": "Tính nhiệt lượng",
  "type": "fill_in", "difficulty": "hard",
  "question_text": "Đun nóng 5 kg nước từ 20°C bằng bếp ga. Bếp ga đốt cháy 0,1 kg ga có năng suất tỏa nhiệt q = 44.000.000 J/kg. Hiệu suất bếp là 30%. Nhiệt độ cuối cùng của nước là ______ °C. (c_nước = 4200 J/kg·K)",
  "options": None,
  "correct_answer": "82,9",
  "explanation": {"summary":"Q_ga = m_ga × q = 0,1 × 44000000 = 4400000 J. Q_nước = H × Q_ga = 0,3 × 4400000 = 1320000 J. Δt = Q/(mc) = 1320000/(5×4200) = 62,86°C. t = 20 + 62,86 ≈ 82,9°C.","key_concept":"Q_ích = H × Q_toàn phần. Δt = Q_ích/(mc)."},
  "thinking_guide": {
    "understand": "5 kg nước, 20°C. Bếp đốt 0,1 kg ga (q=44×10⁶ J/kg), H=30%. Tìm t cuối.",
    "identify_knowledge": "Q_ga = mq. Q_ích = HQ_ga. Q_ích = mcΔt.",
    "plan": "Tính Q_ga → Q_ích → Δt → t cuối.",
    "steps": ["Bước 1: Q_ga = 0,1 × 44000000 = 4400000 J.", "Bước 2: Q_ích = 0,3 × 4400000 = 1320000 J.", "Bước 3: Δt = 1320000/(5×4200) = 1320000/21000 ≈ 62,86°C.", "Bước 4: t = 20 + 62,86 ≈ 82,9°C."],
    "verify": "82,9°C < 100°C → nước chưa sôi → hợp lý.",
    "extend": "Nếu H = 100%: Δt = 4400000/21000 ≈ 209°C → nước sôi và bay hơi từ lâu.",
    "common_traps": ["Quên nhân hiệu suất H = 30% = 0,3."],
    "hints": ["Q_ích = H × Q_toàn phần, không phải toàn bộ Q ga."]
  },
  "real_world_connection": "Bếp ga gia đình có hiệu suất ~30-40%. Phần lớn nhiệt thoát ra môi trường.",
  "formula": "t = t_0 + \\frac{H \\times m_{ga} \\times q}{m_{nước} \\times c} = 20 + \\frac{0,3 \\times 4400000}{21000} \\approx 82,9°C"
})

questions.append({
  "id": "phys8_heat_transfer_008", "grade": 8, "chapter": "heat_transfer",
  "chapter_vn": "Truyền nhiệt", "topic": "heat_transfer_application", "topic_vn": "Ứng dụng truyền nhiệt",
  "type": "explain", "difficulty": "hard",
  "question_text": "Tại sao về mùa đông, sờ vào thanh sắt thấy lạnh hơn sờ vào miếng gỗ, dù cả hai ở cùng nhiệt độ phòng? Giải thích bằng kiến thức về truyền nhiệt.",
  "options": None,
  "correct_answer": "Cả sắt và gỗ đều ở cùng nhiệt độ phòng (thấp hơn nhiệt độ cơ thể). Khi sờ, nhiệt từ tay truyền sang vật. Sắt dẫn nhiệt tốt → hút nhiệt từ tay nhanh → tay mất nhiệt nhanh → cảm giác lạnh. Gỗ dẫn nhiệt kém → hút nhiệt chậm → tay mất nhiệt chậm → ít cảm giác lạnh.",
  "explanation": {"summary":"Cảm giác lạnh/nóng phụ thuộc tốc độ truyền nhiệt. Sắt dẫn nhiệt tốt → hút nhiệt nhanh → cảm giác lạnh hơn. Gỗ dẫn nhiệt kém → hút nhiệt chậm.","key_concept":"Dẫn nhiệt tốt → truyền nhiệt nhanh → cảm giác lạnh hơn (ở nhiệt độ < cơ thể)."},
  "thinking_guide": {
    "understand": "Sắt và gỗ cùng nhiệt độ, sao sắt lạnh hơn?",
    "identify_knowledge": "Sắt dẫn nhiệt tốt, gỗ dẫn nhiệt kém.",
    "plan": "Phân tích tốc độ truyền nhiệt từ tay → vật.",
    "steps": ["Bước 1: Cả hai ở nhiệt độ phòng < 37°C (thân nhiệt).", "Bước 2: Sờ vào: nhiệt từ tay (37°C) → vật (20°C).", "Bước 3: Sắt dẫn nhiệt tốt → hút nhiệt tay nhanh → lạnh.", "Bước 4: Gỗ dẫn nhiệt kém → hút chậm → ít lạnh."],
    "verify": "Mùa hè: sờ sắt thấy mát (vẫn dẫn nhiệt nhanh, nhưng ít chênh lệch).",
    "extend": "Cảm giác nóng/lạnh ≠ nhiệt độ thực. Xốp cách nhiệt tốt → sờ ấm.",
    "common_traps": ["Nghĩ sắt 'lạnh hơn' gỗ – sai, chúng cùng nhiệt độ."],
    "hints": ["Cảm giác lạnh = mất nhiệt nhanh. Dẫn nhiệt tốt = mất nhiệt nhanh."]
  },
  "real_world_connection": "Tay cầm nồi bằng gỗ/nhựa vì dẫn nhiệt kém, không bị bỏng. Thân nồi bằng kim loại dẫn nhiệt tốt để nấu nhanh.",
  "formula": ""
})

# ============================================================
# Write to file
# ============================================================
output_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM\apps\miuphysics-app\public\data\questions_grade8.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

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
print(f"\nDifficulty %: easy={difficulties['easy']/len(questions)*100:.1f}%, medium={difficulties['medium']/len(questions)*100:.1f}%, hard={difficulties['hard']/len(questions)*100:.1f}%")
print(f"Type %: MC={types['multiple_choice']/len(questions)*100:.1f}%, fill_in={types['fill_in']/len(questions)*100:.1f}%, T/F={types['true_false']/len(questions)*100:.1f}%, explain={types['explain']/len(questions)*100:.1f}%")

# Verify IDs
ids = [q["id"] for q in questions]
assert len(ids) == len(set(ids)), f"Duplicate IDs found!"
assert all(q["grade"] == 8 for q in questions), "Not all questions have grade 8!"
assert all(q["id"].startswith("phys8_") for q in questions), "Not all IDs start with phys8_!"
print(f"\nAll {len(questions)} question IDs are unique and valid ✓")
