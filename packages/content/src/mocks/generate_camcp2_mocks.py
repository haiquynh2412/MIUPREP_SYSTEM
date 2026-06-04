import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Output directory for the JSON mocks
OUTPUT_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\IELT\packages\content\src\mocks"

def save_mock(test_data):
    file_path = os.path.join(OUTPUT_DIR, f"{test_data['id']}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(test_data, f, ensure_ascii=False, indent=2)
    print(f"Successfully generated and saved: {file_path}")

# ==========================================
# TEST 1 DEFINITION
# ==========================================
def build_test1():
    test_data = {
        "id": "camcp2-test1",
        "title": "CPE C2 Proficiency Reading & Use of English - Test 1 (Cambridge CPE 2)",
        "type": "academic",
        "skill": "reading",
        "source": "Cambridge Certificate of Proficiency in English 2, Cambridge University Press",
        "sections": []
    }
    
    # Part 1: MCQ Cloze
    sec1 = {
        "id": "camcp2-t1-sec-1",
        "title": "Part 1: Multiple-Choice Cloze",
        "instructions": "For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Text 1: Air-conditioning</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>There is a chill in the air at Cannons Gym, a favourite lunch-time haunt for City of London workers. "
            "To deal with this summer's unusually high temperatures, the fitness centre has gone (1) ______ with the air-conditioning. "
            "(2) ______ , in fact, that at quiet times, the gym feels like somewhere in the Arctic. "
            "This is just one example of how the modern world casually (3) ______ air-conditioning. "
            "It has become a central feature of work and play, a potent (4) ______ of the ability of humanity to control the climate, or at least modify it. "
            "Many air-conditioned buildings, however, could (5) ______ other methods of cooling. "
            "They could take advantage of daylight and natural ventilation and have thicker walls that absorb less heat during the day and radiate it away at night. "
            "These (6) ______ may sound obvious, but they can have telling results and would considerably reduce the need for air-conditioning.</p>"
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1 mt-6'>Text 2: Sundials</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>It is surely more than coincidence that the beginning of a new millennium is being (7) ______ by renewed interest in sundials: "
            "instruments used to measure time according to the position of the sun. A hundred years ago, they were a vital time-keeping (8) ______ , "
            "essential for anyone who hoped to keep their clocks working accurately. Then, as clocks and watches became more sophisticated and reliable, the sundial was relegated to the status of garden ornament.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t1-rg-1",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part1_qs = [
        ("q-camcp2-t1-1", "Gap (1):", ["A. overweight", "B. overboard", "C. overtime", "D. overblown"], "B",
         "Đáp án B. Collocation/Idiom: 'go overboard with something' nghĩa là 'làm quá nhiều / quá trớn / quá mức cần thiết' cái gì. Ngữ cảnh ở đây là phòng gym đã lạm dụng điều hòa quá mức khiến nơi này lạnh buốt như Bắc Cực. Bẫy: 'overweight' (thừa cân), 'overtime' (tăng ca), 'overblown' (phóng đại) không đi với cấu trúc 'go ... with' để tạo nghĩa lạm dụng. Chuyên đề: Idioms/Collocations — go overboard.",
         "fitness centre has gone overboard with", "collocations", "Page 6, Test 1, Cambridge CPE 2"),
         
        ("q-camcp2-t1-2", "Gap (2):", ["A. So much so", "B. So as to", "C. So to speak", "D. So be it"], "A",
         "Đáp án A. Trạng từ liên kết: 'So much so' dùng để nhấn mạnh mức độ cực kỳ cao của hành động phía trước, dịch là 'Đến mức mà / Nhiều đến nỗi mà'. Ở đây là 'Đến mức mà vào lúc vắng khách, phòng gym lạnh như Bắc Cực'. Bẫy: 'So as to' + verb (để làm gì). 'So to speak' (có thể nói là — dùng để ví von). 'So be it' (cứ như vậy đi — thể hiện sự chấp nhận). Chuyên đề: Conjunctions — so much so.",
         "gone overboard with the air-conditioning. So much so , in fact, that", "conjunctions", "Page 6, Test 1, Cambridge CPE 2"),
         
        ("q-camcp2-t1-3", "Gap (3):", ["A. malfunctions", "B. outdoes", "C. superimposes", "D. misuses"], "D",
         "Đáp án D. Từ vựng: 'misuses' (lạm dụng/dùng sai mục đích). Thế giới hiện đại đang lạm dụng điều hòa nhiệt độ một cách vô tội vạ. Bẫy: 'malfunctions' (trục trặc — nội động từ). 'outdoes' (vượt trội hơn). 'superimposes' (đặt chồng lên). Chỉ 'misuses' phù hợp với sắc thái tiêu cực lạm dụng tài nguyên. Chuyên đề: Vocabulary — verbs of action.",
         "modern world casually misuses air-conditioning", "vocabulary", "Page 6, Test 1, Cambridge CPE 2"),
         
        ("q-camcp2-t1-4", "Gap (4):", ["A. symbol", "B. token", "C. emblem", "D. label"], "C",
         "Đáp án C. Từ vựng nâng cao: 'emblem' (biểu tượng/hình ảnh đại diện đặc trưng cho một ý niệm/khả năng). Điều hòa là biểu tượng mạnh mẽ cho việc loài người kiểm soát khí hậu. Bẫy: 'symbol' thường dùng cho ký hiệu toán học hoặc biểu tượng chung chung. 'token' (vật kỷ niệm/dấu hiệu nhỏ). 'label' (nhãn mác). Sắc thái 'emblem' mang tính biểu trưng học thuật cao hơn. Chuyên đề: Vocabulary — nouns of representation.",
         "a potent emblem of the ability of humanity", "vocabulary", "Page 6, Test 1, Cambridge CPE 2"),
         
        ("q-camcp2-t1-5", "Gap (5):", ["A. empower", "B. engage", "C. employ", "D. enlist"], "C",
         "Đáp án C. Từ vựng/Collocation: 'employ other methods' = 'use/apply other methods' nghĩa là 'áp dụng/sử dụng các phương pháp khác'. Bẫy: 'empower' (trao quyền). 'engage' (thu hút/tham gia). 'enlist' (tuyển mộ quân ngũ hoặc tranh thủ sự giúp đỡ). Chỉ 'employ' đi kèm danh từ chỉ giải pháp kỹ thuật để mang nghĩa sử dụng. Chuyên đề: Collocations — employ + method/system.",
         "buildings, however, could employ other methods", "collocations", "Page 6, Test 1, Cambridge CPE 2"),
         
        ("q-camcp2-t1-6", "Gap (6):", ["A. outcomes", "B. measures", "C. resolutions", "D. actions"], "B",
         "Đáp án B. Từ vựng: 'measures' (biện pháp/giải pháp thực tế). Những biện pháp này (tận dụng ánh sáng tự nhiên, tường dày hấp thụ nhiệt...) nghe có vẻ đơn giản nhưng mang lại kết quả lớn. Bẫy: 'outcomes' (kết quả). 'resolutions' (nghị quyết/cam kết đầu năm). 'actions' (hành động đơn lẻ). Bối cảnh xây dựng kỹ thuật đòi hỏi danh từ 'measures' chỉ chuỗi giải pháp. Chuyên đề: Vocabulary — nouns of action.",
         "These measures may sound obvious", "vocabulary", "Page 6, Test 1, Cambridge CPE 2"),
         
        ("q-camcp2-t1-7", "Gap (7):", ["A. associated", "B. accompanied", "C. acquainted", "D. aroused"], "B",
         "Đáp án B. Cấu trúc bị động / Từ vựng: 'be accompanied by' nghĩa là 'được đồng hành / đi kèm bởi cái gì'. Việc bắt đầu một thiên niên kỷ mới được đồng hành bởi một sự quan tâm trở lại dành cho đồng hồ mặt trời. Bẫy: 'associated with' (liên kết với). 'acquainted with' (quen thuộc với). 'aroused' (bị kích thích). Chỉ 'accompanied' đi kèm giới từ 'by'. Chuyên đề: Passive patterns — accompany + by.",
         "new millennium is being accompanied by", "prepositions", "Page 6, Test 1, Cambridge CPE 2"),
         
        ("q-camcp2-t1-8", "Gap (8):", ["A. device", "B. utensil", "C. piece", "D. item"], "A",
         "Đáp án A. Từ vựng: 'device' (thiết bị/công cụ cơ học phục vụ mục đích cụ thể). Một trăm năm trước, đồng hồ mặt trời là một thiết bị đo thời gian quan trọng. Bẫy: 'utensil' (dụng cụ nhà bếp/sinh hoạt hàng ngày). 'piece' (mảnh/mẩu). 'item' (món hàng/khoản mục). Đồng hồ đo đạc kỹ thuật luôn được phân loại là 'device'. Chuyên đề: Vocabulary — nouns of tools.",
         "a vital time-keeping device", "vocabulary", "Page 6, Test 1, Cambridge CPE 2")
    ]
    
    for q in part1_qs:
        sec1["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec1)
    
    # Part 2: Open Cloze
    sec2 = {
        "id": "camcp2-t1-sec-2",
        "title": "Part 2: Open Cloze",
        "instructions": "For questions 9-16, read the text below and think of the word which best fits each space. Use only one word in each space.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Dreams</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Dreams (0) <b>have</b> always fascinated human beings. "
            "The idea that dreams provide us with useful information about our lives goes (9) ______ thousands of years. "
            "For the greater (10) ______ of human history (11) ______ was taken for granted that the sleeping mind was in touch with the supernatural world and dreams were to be interpreted as messages with prophetic or healing power. "
            "In the nineteenth century, (12) ______ this way of thinking and dreams were widely dismissed as being very (13) ______ more than jumbles of fantasy (14) ______ about by memories of the previous day. "
            "It was not (15) ______ the end of the nineteenth century (16) ______ an Austrian neurologist, Sigmund Freud, pointed out that dreams contain valuable clues to the subconscious mind.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t1-rg-2",
            "instruction": "Write the correct word in each gap in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part2_qs = [
        ("q-camcp2-t1-9", "Gap (9):", "back", ["back"],
         "Đáp án: BACK. Phrasal verb: 'go back' nghĩa là 'quay trở về / lùi lại quá khứ'. 'goes back thousands of years' = có nguồn gốc từ hàng ngàn năm trước. Chuyên đề: Phrasal verbs — go back.",
         "goes back thousands of years", "phrasal_verbs", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-10", "Gap (10):", "part", ["part"],
         "Đáp án: PART. Idiom/Collocation: 'for the greater part of' = 'phần lớn của'. Dịch nghĩa: Trong suốt phần lớn lịch sử loài người... Bẫy: Tránh nhầm với 'majority' (không đi với cấu trúc 'the greater... of'). Chuyên đề: Fixed expressions — for the greater part of.",
         "For the greater part of human history", "fixed_expressions", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-11", "Gap (11):", "it", ["it"],
         "Đáp án: IT. Chủ ngữ giả trong cấu trúc bị động: 'it was taken for granted that...' (người ta mặc định rằng...). 'It' đóng vai trò đại diện cho mệnh đề 'that' đứng sau. Chuyên đề: Grammar — dummy subject it.",
         "it was taken for granted that", "grammar_patterns", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-12", "Gap (12):", "there", ["there"],
         "Đáp án: THERE. Cấu trúc giới thiệu sự tồn tại: 'there was a widespread reaction' (đã có một phản ứng rộng khắp). 'There was' giới thiệu sự xuất hiện của danh từ 'reaction'. Chuyên đề: Grammar — existential there.",
         "there was a widespread reaction", "grammar_patterns", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-13", "Gap (13):", "little", ["little"],
         "Đáp án: LITTLE. Cấu trúc so sánh giảm nhẹ: 'very little more than' = 'hầu như không nhiều hơn'. Dịch nghĩa: giấc mơ bị coi là hầu như không có gì hơn ngoài mớ hỗn độn tưởng tượng. Chuyên đề: Vocabulary — determiners.",
         "dismissed as being very little more than", "vocabulary", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-14", "Gap (14):", "brought", ["brought"],
         "Đáp án: BROUGHT. Phân từ bị động / Phrasal verb rút gọn: 'brought about by' = 'được gây ra / mang lại bởi'. Rút gọn từ 'which were brought about by...'. Chuyên đề: Phrasal verbs — bring about.",
         "jumbles of fantasy brought about by", "phrasal_verbs", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-15", "Gap (15):", "until", ["until", "till"],
         "Đáp án: UNTIL (hoặc TILL). Cấu trúc cleft sentence/nhấn mạnh thời gian: 'It is/was not until... that...' (Mãi cho tới khi... thì mới...). Ở đây là 'Mãi cho tới cuối thế kỷ 19...'. Chuyên đề: Cleft sentences — not until.",
         "It was not until the end of the", "cleft_sentences", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-16", "Gap (16):", "that", ["that"],
         "Đáp án: THAT. Từ nối trong cấu trúc câu nhấn mạnh: 'It was not until [time] THAT [clause]' kết hợp với từ 'until' ở gap 15. Chuyên đề: Cleft sentences — not until.",
         "the end of the nineteenth century that an Austrian neurologist", "cleft_sentences", "Page 12, Test 1, Cambridge CPE 2")
    ]
    
    for q in part2_qs:
        sec2["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec2)
    
    # Part 3: Word Formation
    sec3 = {
        "id": "camcp2-t1-sec-3",
        "title": "Part 3: Word Formation",
        "instructions": "For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the space in the same line.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Food Miles</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>In Britain, what is described as \"food miles\", the distance which food is transported from the place where it is grown to its point of sale, continues to rise. "
            "This has major (0) <b>economic</b> [ECONOMY] consequences, given the traffic congestion and pollution which (17) ______ [VARIABLE] accompany road haulage. "
            "According to (18) ______ [PRESS] groups, the same amount of food is travelling 50 per cent further than twenty years ago. "
            "The groups assert that the increase in the number of lorry journeys is (19) ______ [EXCEED] and that many of these are far from (20) ______ [ESSENCE]. "
            "In the distribution systems employed by British food (21) ______ [RETAIL], fleets of lorries bring all goods into more (22) ______ [CENTRE] located warehouses for redistribution across the country. "
            "(23) ______ [LOGIC] as this might appear, the situation whereby some goods get sent back to the same areas from which they came is (24) ______ [AVOID].</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t1-rg-3",
            "instruction": "Write your answers in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part3_qs = [
        ("q-camcp2-t1-17", "Gap (17):", "invariably", ["invariably"],
         "Đáp án: INVARIABLY. Cần trạng từ bổ nghĩa cho động từ 'accompany'. Từ gốc VARIABLE (biến đổi/thay đổi) -> invariable (không đổi/luôn luôn) -> invariably (luôn luôn/lúc nào cũng vậy). Chuyên đề: Word formation — adverbs.",
         "pollution which invariably accompany road", "word_formation", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-18", "Gap (18):", "pressure", ["pressure"],
         "Đáp án: PRESSURE. Danh từ ghép làm tính từ bổ nghĩa cho 'groups': 'pressure groups' = các nhóm gây áp lực / nhóm lợi ích vận động hành lang. Từ gốc PRESS (nhấn/ép) -> pressure (sức ép/áp lực). Chuyên đề: Word formation — nouns.",
         "According to pressure groups, the same", "word_formation", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-19", "Gap (19):", "excessive", ["excessive"],
         "Đáp án: EXCESSIVE. Cần tính từ đứng sau động từ liên kết 'is'. Từ gốc EXCEED (vượt quá) -> excess (sự vượt quá) -> excessive (quá mức / thừa thãi tiêu cực). Chuyên đề: Word formation — adjectives.",
         "lorry journeys is excessive and that", "word_formation", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-20", "Gap (20):", "essential", ["essential"],
         "Đáp án: ESSENTIAL. Cần tính từ đứng sau giới từ và trạng từ 'far from' (còn lâu mới / hoàn toàn không...). Từ gốc ESSENCE (bản chất) -> essential (thiết yếu/cần thiết). Chuyên đề: Word formation — adjectives.",
         "many of these are far from essential", "word_formation", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-21", "Gap (21):", "retailers", ["retailers"],
         "Đáp án: RETAILERS. Cần danh từ số nhiều chỉ người/tổ chức đứng sau danh từ sở hữu ghép 'food'. Từ gốc RETAIL (bán lẻ) -> retailer (nhà bán lẻ) -> retailers (các nhà bán lẻ). Chuyên đề: Word formation — nouns.",
         "employed by British food retailers , fleets of", "word_formation", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-22", "Gap (22):", "centrally", ["centrally"],
         "Đáp án: CENTRALLY. Cần trạng từ bổ nghĩa cho phân từ/tính từ 'located' (được định vị / đặt ở vị trí trung tâm). Từ gốc CENTRE (trung tâm) -> central (thuộc trung tâm) -> centrally (ở trung tâm). Chuyên đề: Word formation — adverbs.",
         "bring all goods into more centrally located warehouses", "word_formation", "Page 12, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-23", "Gap (23):", "illogical", ["illogical"],
         "Đáp án: ILLOGICAL. Cần tính từ đứng đầu cấu trúc nhượng bộ rút gọn: '[Adj] + as + subject + might appear' = Dù có vẻ [Adj] đến thế nào đi nữa. Ở đây là 'Dù có vẻ phi lý đến mấy...'. Từ gốc LOGIC (logic) -> logical (hợp lý) -> illogical (phi lý — thêm tiền tố phủ định il-). Chuyên đề: Word formation — prefixes.",
         "Illogical as this might appear, the", "word_formation", "Page 12, Test 1, Cambridge CPE 2"),
         ("q-camcp2-t1-24", "Gap (24):", "unavoidable", ["unavoidable"],
         "Đáp án: UNAVOIDABLE. Cần tính từ đứng sau động từ liên kết 'is'. Từ gốc AVOID (tránh) -> avoidable (có thể tránh) -> unavoidable (không thể tránh khỏi — thêm tiền tố un- và hậu tố -able). Chuyên đề: Word formation — prefixes/suffixes.",
         "from which they came is unavoidable", "word_formation", "Page 12, Test 1, Cambridge CPE 2")
    ]
    
    for q in part3_qs:
        sec3["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec3)
    
    # Part 4: Key Word Transformation
    sec4 = {
        "id": "camcp2-t1-sec-4",
        "title": "Part 4: Key Word Transformation",
        "instructions": "For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and eight words, including the word given.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Key Word Transformation</h2>"
            "<div class='mb-4 text-slate-800 text-base leading-relaxed'>"
            "<p class='mb-2'><b>25.</b> The present government has never promised to lower taxation. (TIME)</p>"
            "<p class='mb-2'>At ______ promised to lower taxation.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>26.</b> Helen’s report is rather unclear in places. (LACKING)</p>"
            "<p class='mb-2'>Helen’s report ______ in places.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>27.</b> William tried to remain impartial in the quarrel between his two cousins. (SIDES)</p>"
            "<p class='mb-2'>William tried ______ in the quarrel between his two cousins.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>28.</b> I must say that I have never met anyone who is more generous than Arthur. (MEET)</p>"
            "<p class='mb-2'>I must say that I have yet ______ Arthur.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>29.</b> We did not hesitate to support the new chairman. (HESITATION)</p>"
            "<p class='mb-2'>We had ______ the new chairman.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>30.</b> I’m sure Fred didn't intend to offend you. (INTENTION)</p>"
            "<p class='mb-2'>I’m sure Fred had ______ offending you.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t1-rg-4",
            "instruction": "Write the missing words only.",
            "questions": []
        }]
    }
    
    part4_qs = [
        ("q-camcp2-t1-25", "Sentence 25: At ______ promised to lower taxation. (Key word: TIME)",
         "no time has the present government",
         ["no time has the present government", "no time had the present government"],
         "Đáp án: 'no time has the present government'. Cấu trúc đảo ngữ với trạng từ phủ định ở đầu câu: 'At no time + auxiliary + subject + verb'. Trợ động từ 'has' hoặc 'had' đảo lên trước chủ ngữ 'the present government'. Chuyên đề: Grammar — Inversion.",
         "At no time has the present government", "grammar_patterns", "Page 14, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-26", "Sentence 26: Helen’s report ______ in places. (Key word: LACKING)",
         "is rather lacking in clarity",
         ["is rather lacking in clarity", "seems rather lacking in clarity", "seems to be rather lacking in clarity"],
         "Đáp án: 'is rather lacking in clarity'. Cấu trúc: 'be/seem lacking in something' = thiếu cái gì đó. Danh từ của 'unclear' là 'clarity' (sự rõ ràng). 'rather' hoạt động như trạng từ giảm nhẹ đứng trước phân từ 'lacking'. Chuyên đề: Grammar — adjectival structures.",
         "is rather lacking in clarity", "grammar_patterns", "Page 14, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-27", "Sentence 27: William tried ______ in the quarrel between his two cousins. (Key word: SIDES)",
         "not to take sides",
         ["not to take sides"],
         "Đáp án: 'not to take sides'. Cụm động từ/Idiom: 'take sides' = đứng về một bên / ủng hộ một phía trong cuộc tranh cãi. Cấu trúc phủ định với to-infinitive: 'try + not to + verb'. Chuyên đề: Idioms/Grammar — try not to.",
         "not to take sides", "idioms", "Page 14, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-28", "Sentence 28: I must say that I have yet ______ Arthur. (Key word: MEET)",
         "to meet anyone more generous than",
         ["to meet anyone more generous than", "to meet anybody more generous than", "to meet someone more generous than", "to meet somebody more generous than"],
         "Đáp án: 'to meet anyone more generous than'. Cấu trúc: 'have yet to + verb' = vẫn chưa làm gì đó. 'meet anyone more generous than Arthur' = gặp ai hào phóng hơn Arthur. Chuyên đề: Grammar — yet to do.",
         "to meet anyone more generous than", "grammar_patterns", "Page 14, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-29", "Sentence 29: We had ______ the new chairman. (Key word: HESITATION)",
         "no hesitation in supporting",
         ["no hesitation in supporting"],
         "Đáp án: 'no hesitation in supporting'. Cấu trúc: 'have no hesitation in doing something' = không có sự ngập ngừng / sẵn lòng làm gì ngay lập tức. Danh từ 'hesitation' đi kèm giới từ 'in' + V-ing. Chuyên đề: Dependent prepositions — hesitation in.",
         "no hesitation in supporting", "grammar_patterns", "Page 14, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-30", "Sentence 30: I’m sure Fred had ______ offending you. (Key word: INTENTION)",
         "no intention of",
         ["no intention of"],
         "Đáp án: 'no intention of'. Cấu trúc: 'have no intention of doing something' = không có ý định làm gì. Viết lại cho câu 'Fred didn't intend to...'. Bẫy: Cụm từ đi kèm giới từ 'of' bắt buộc vì đứng trước danh động từ 'offending'. Chuyên đề: Grammar — intention structures.",
         "no intention of", "grammar_patterns", "Page 14, Test 1, Cambridge CPE 2")
    ]
    
    for q in part4_qs:
        sec4["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec4)
    
    # Part 5: Multiple Choice Reading
    sec5 = {
        "id": "camcp2-t1-sec-5",
        "title": "Part 5: Multiple Choice",
        "instructions": "For questions 31-36, read the text below and choose the answer (A, B, C or D) which you think fits best according to the text.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>Writing Reviews</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Frank Kermode examines the craft of review-writing from a practitioner's point of view.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Most reviews are written and circulated under conditions which ensure that they have a very short active life. "
            "There are deadlines, there are restrictions, normally quite severe, on their length; and when published they claim houseroom only for as long as the newspaper they are printed in — a day or a week, at most a month. "
            "Moreover, the literary status of reviews tends to be settled by their ephemerality. It is usually supposed, not only by the public but, quite often, by the writers themselves, that reviewing is work that nobody would do if there weren’t some reason — shortage of cash would be cited most often, though another good reason is that you can’t work all day on a novel or a 'serious' book of any sort — which prevents them from occupying their time with something more valuable.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Yet reviewing is a skilled and multi-faceted job. "
            "It is one thing to be bright, brisk and summarily fair in the six or eight hundred words of an ordinary newspaper review, quite another to control, without looseness of argument, the six or eight thousand words sometimes allowed by international journals. "
            "And the fifteen hundred words of a leading piece in the weekly magazines present some of the problems of both short and long. Not that length is the only consideration. "
            "For one thing, the reviewer obviously needs to think about the probable audience, the weekend skimmer at one end of the scale, the person already interested enough in the subject to tackle a serious review-article at the other. "
            "Finally, a reviewer needs to know quite a bit about quite a number of things; and must be able to write prose that intelligent people can understand and enjoy. "
            "It follows almost infallibly that the reviewer will be somebody who writes other things besides reviews.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The American novelist John Updike, who rather looks down on criticism — 'hugging the shore' he calls it — nevertheless enjoys some coastal reviewing in the intervals between his transoceanic novel-writing. "
            "Understandably reluctant to allow even his less ambitious voyages to go without any permanent record, he gathers together his every review, however short, into volumes with mildly self-deprecating titles.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t1-rg-5",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part5_qs = [
        ("q-camcp2-t1-31", "What does the writer suggest about reviews in the first paragraph?",
         ["A. They are regarded as having very little literary value.",
          "B. They are read by a very small number of people.",
          "C. They are written by people who have failed as novelists.",
          "D. They are only written to help sell newspapers."], "A",
         "Đáp án A. Tác giả viết ở đoạn 1: 'the literary status of reviews tends to be settled by their ephemerality' (vị thế văn học của các bài phê bình có xu hướng bị định đoạt bởi tính ngắn ngủi/tạm thời của chúng). Người ta thường cho rằng công việc phê bình chỉ là thứ yếu, người viết làm vì thiếu tiền chứ không coi là tác phẩm văn học thực thụ (little literary value). Bẫy: 'failed as novelists' (thất bại làm tiểu thuyết gia) không được nhắc tới. Chuyên đề: Reading Comprehension.",
         "literary status of reviews tends to be settled by their ephemerality", "Page 10, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-32", "In the first paragraph, the writer says that many reviewers believe that reviewing",
         ["A. is not really worth doing for the money.",
          "B. stops them doing more important work.",
          "C. is a good way of gaining publicity.",
          "D. helps them with their other writing."], "B",
         "Đáp án B. Đoạn 1 có viết: 'reviewing is work that nobody would do if there weren’t some reason... which prevents them from occupying their time with something more valuable' (viết phê bình là công việc mà không ai thèm làm nếu không vì lý do nào đó... thứ ngăn cản họ dành thời gian cho công việc khác có giá trị hơn). Như vậy, chính người viết cũng cảm thấy nó ngăn họ làm việc quan trọng hơn (stops them doing more important work). Chuyên đề: Reading Comprehension.",
         "prevents them from occupying their time with something more valuable", "Page 10, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-33", "What does the writer say about different lengths of reviews in the second paragraph?",
         ["A. Short reviews are easier to write than long ones.",
          "B. A medium-length review can be particularly difficult to write.",
          "C. Long reviews allow the writer to make more errors.",
          "D. The length of a review should depend on the subject matter."], "B",
         "Đáp án B. Tác giả bình luận về độ dài 1500 từ của bài trung bình: 'And the fifteen hundred words of a leading piece in the weekly magazines present some of the problems of both short and long.' (độ dài 1500 từ đặt ra các vấn đề của cả bài ngắn và bài dài). Sự pha trộn rắc rối này khiến bài viết độ dài trung bình trở nên cực kỳ khó kiểm soát (particularly difficult). Chuyên đề: Reading Comprehension.",
         "present some of the problems of both short and long", "Page 10, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-34", "The writer believes that a good reviewer must be someone who",
         ["A. has an extremely wide range of interests.",
          "B. can write in different styles for different audiences.",
          "C. is also a creative writer in their own right.",
          "D. has specialized knowledge of one particular subject."], "C",
         "Đáp án C. Ở cuối đoạn 2, tác giả kết luận: 'It follows almost infallibly that the reviewer will be somebody who writes other things besides reviews.' (Hầu như chắc chắn rằng nhà phê bình sẽ là người viết những thứ khác ngoài bài phê bình - e.g. tiểu thuyết hay sách nghiêm túc). Điều này tương đương họ là 'creative writer in their own right' (nhà văn sáng tạo thực thụ). Chuyên đề: Reading Comprehension.",
         "reviewer will be somebody who writes other things besides reviews", "Page 10, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-35", "What is the writer's attitude to John Updike's reviews?",
         ["A. He thinks they are too self-deprecating.",
          "B. He appreciates Updike's desire to preserve them.",
          "C. He thinks they are not as good as Updike's novels.",
          "D. He is amused by Updike's view of them."], "B",
         "Đáp án B. Ở đoạn 3, tác giả mô tả: 'Understandably reluctant to allow even his less ambitious voyages to go without any permanent record, he gathers together his every review...' (Một cách dễ hiểu là ngần ngại để những chuyến đi ít tham vọng trôi qua mà không có ghi chép lâu dài, ông ấy thu thập mọi bài phê bình...). Từ 'Understandably' thể hiện thái độ đồng tình, trân trọng mong muốn lưu giữ bài viết của Updike. Chuyên đề: Reading Comprehension.",
         "Understandably reluctant to allow even his less ambitious voyages to go without any permanent record", "Page 10, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-36", "The phrase 'hugging the shore' is used to suggest that John Updike's criticism is",
         ["A. safe and unadventurous.",
          "B. of secondary importance to him.",
          "C. focused on local issues.",
          "D. highly regarded by others."], "A",
         "Đáp án A. Hình ảnh ẩn dụ 'hugging the shore' (ôm dọc bờ biển / đi ven bờ) ám chỉ sự an toàn, không dám mạo hiểm đi ra đại dương bao la ('transoceanic novel-writing' - viết tiểu thuyết xuyên đại dương). Điều này mô tả phê bình văn học là an toàn, ít mạo hiểm và mang tính phòng thủ (safe and unadventurous). Chuyên đề: Reading Comprehension.",
         "hugging the shore", "Page 10, Test 1, Cambridge CPE 2")
    ]
    
    for q in part5_qs:
        sec5["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "reading_comprehension",
            "source": q[6]
        })
    test_data["sections"].append(sec5)
    
    # Part 6: Gapped Text
    sec6 = {
        "id": "camcp2-t1-sec-6",
        "title": "Part 6: Gapped Text",
        "instructions": "For questions 37-43, read the text below. Seven paragraphs have been removed from the extract. Choose from the paragraphs A-H the one which fits each gap. There is one extra paragraph which you do not need to use.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Future of Work</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Theodore Zeldin looks at how our working life could change.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Are you as respected and appreciated as you deserve? Success in a career is no longer enough. "
            "Every profession is complaining that it is not properly valued or understood, and even among individuals who have won eminence, there is often bitterness behind the fame. "
            "Loving your work, until recently, was enough to make you a member of an envied minority. But now you have to ask yourself what your job is doing to you as a person, to your character and your relationships.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 37 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>This is a very different state of affairs from the past. "
            "For centuries, the work a person did was also their identity, determining their social standing and the way they were treated by others. "
            "In the modern world, however, we are witnessing a shift. People are starting to demand that their work should not just provide a livelihood, but also a sense of personal fulfilment.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 38 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The roots of this changing attitude can be traced back to the industrial revolution, which transformed the nature of work. "
            "Before then, most work was agricultural or craft-based, allowing for a degree of autonomy and pride in one's output. "
            "The factory system changed all that, reducing workers to mere cogs in a machine. Modern office environments, in many ways, have simply updated this bureaucratic control.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 39 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Yet, there are signs of resistance. A growing number of employees are opting out of the traditional career ladder, "
            "choosing instead to pursue portfolio careers or starting their own ventures. This desire for independence is not just about avoiding bad bosses; "
            "it is a fundamental rejection of the idea that our lives should be dictated by corporate structures.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 40 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The implications for employers are profound. Companies that fail to recognize this need for respect and autonomy "
            "will find it increasingly difficult to attract and retain talent. The old carrot-and-stick methods of motivation are losing their efficacy.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 41 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Indeed, the most forward-thinking organizations are already experimenting with new ways of working. "
            "They are flattening hierarchies, encouraging self-management, and prioritizing employee well-being. "
            "In these workplaces, success is measured not just by financial performance, but by the flourishing of the individuals who work there.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 42 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Of course, this transformation will not happen overnight. "
            "There are deep-seated structural and cultural barriers to overcome. Many managers are reluctant to cede control, "
            "and many workers are fearful of the insecurity that comes with greater autonomy. But the trend is clear.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 43 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Ultimately, the future of work is not just a technical or economic question, but a moral one. "
            "It is about creating a society where work is a source of dignity, meaning, and connection, rather than a form of modern servitude.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t1-rg-6",
            "instruction": "Match the correct paragraph (A-H) to each gap (37-43). Paragraphs are provided below.",
            "questions": []
        }]
    }
    
    sec6_paragraphs = (
        "### Paragraph Options\n\n"
        "**A.** For many, the office has become a second home, but not always a happy one. "
        "The constant pressure to perform and the lack of genuine connection can leave employees feeling isolated.\n\n"
        "**B.** This quest for personal growth through work is a relatively new phenomenon. "
        "Historically, work was seen merely as a curse or a necessity, a way to survive rather than a path to self-realization.\n\n"
        "**C.** The rise of the gig economy has further accelerated this trend, offering unprecedented flexibility but also introducing new forms of precariousness. "
        "Workers must navigate a landscape of constant change.\n\n"
        "**D.** To adapt, managers must learn to become facilitators rather than dictators. "
        "They must build environments of trust where employees feel safe to take risks and express their true selves.\n\n"
        "**E.** This shift in values is particularly pronounced among younger generations entering the workforce. "
        "They are less willing to sacrifice their personal lives and values for corporate advancement.\n\n"
        "**F.** The transition requires a fundamental rethinking of the contract between employer and employee. "
        "It is no longer just a transaction of labor for wages, but an agreement to foster mutual growth.\n\n"
        "**G.** Underneath the surface, there is a quiet revolution taking place. "
        "People are no longer content to leave their humanity at the door when they enter the workplace. "
        "They want to be recognized as whole persons.\n\n"
        "**H.** This loss of autonomy has had a devastating impact on employee morale. "
        "When people feel like powerless cogs, they disengage, leading to high rates of burnout and turnover."
    )
    sec6["passageHtml"] += f"<hr class='my-6 border-emerald-100'/>{sec6_paragraphs}"
    
    part6_qs = [
        ("q-camcp2-t1-37", "Gap 37:", "G", "G", "Đáp án G. Paragraph G giới thiệu 'quiet revolution' (cuộc cách mạng thầm lặng) về việc mọi người muốn được đối xử như một con người toàn diện chứ không chỉ là cỗ máy ở nơi làm việc, nối tiếp hoàn hảo suy nghĩ ở đoạn trước về việc công việc ảnh hưởng thế nào đến tính cách và mối quan hệ. Chuyên đề: Cohesion & Coherence.", "G", "Page 9, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-38", "Gap 38:", "B", "B", "Đáp án B. Paragraph B giải thích rằng cuộc tìm kiếm sự phát triển cá nhân này là một hiện tượng mới ('relatively new phenomenon') đối lập trực tiếp với bối cảnh lịch sử mà đoạn tiếp theo ('for centuries...') nói tới. Chuyên đề: Cohesion & Coherence.", "B", "Page 9, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-39", "Gap 39:", "F", "F", "Đáp án F. Paragraph F nói về sự thay đổi trong bản hợp đồng lao động giữa chủ và thợ, bổ sung ý nghĩa cho đoạn trước đó về sự kiểm soát quan liêu của các văn phòng hiện đại. Chuyên đề: Cohesion & Coherence.", "F", "Page 9, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-40", "Gap 40:", "E", "E", "Đáp án E. Paragraph E nhấn mạnh sự thay đổi giá trị này ở thế hệ trẻ, kết nối trực tiếp với ý chí kháng cự cấu trúc doanh nghiệp của đoạn trước. Chuyên đề: Cohesion & Coherence.", "E", "Page 9, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-41", "Gap 41:", "D", "D", "Đáp án D. Paragraph D giải thích cách thức các nhà quản lý phải thay đổi để trở thành người điều phối chứ không phải kẻ độc tài, để giải quyết áp lực tuyển dụng nhân tài ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "D", "Page 9, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-42", "Gap 42:", "C", "C", "Đáp án C. Paragraph C đề cập đến nền kinh tế tự do (gig economy) thúc đẩy sự linh hoạt nhưng cũng mang lại rủi ro, tạo bước đệm hoàn hảo cho đoạn tiếp theo thảo luận về sự chuyển giao không thể diễn ra trong một sớm một chiều. Chuyên đề: Cohesion & Coherence.", "C", "Page 9, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-43", "Gap 43:", "A", "A", "Đáp án A. Paragraph A nói về văn phòng như một ngôi nhà thứ hai nhưng đầy áp lực và cô lập, kết nối với ý chí vượt qua các rào cản văn hóa doanh nghiệp ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "A", "Page 9, Test 1, Cambridge CPE 2")
    ]
    
    for q in part6_qs:
        sec6["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gapped_text",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "cohesion_coherence",
            "source": q[6]
        })
    test_data["sections"].append(sec6)
    
    # Part 7: Multiple Matching
    sec7 = {
        "id": "camcp2-t1-sec-7",
        "title": "Part 7: Multiple Matching",
        "instructions": "For questions 44-53, read the five academic perspectives on aesthetics in the digital age below and choose the correct perspective (A-E) which fits each statement. You may choose a perspective more than once.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Evolution of Aesthetics in the Digital Age</h2>"
            "<div class='mb-6 text-slate-800 text-base leading-relaxed text-left'>"
            "<p class='mb-4'><b>A. Dr. Adrian Vance (Visual Culture Theorist)</b><br>"
            "It is impossible to overstate the extent to which our visual encounters are now pre-filtered and catalogued by corporate algorithms. "
            "Aesthetics in the digital age has ceased to be an organic experience of spontaneous discovery. "
            "Instead, we are spoon-fed a homogenized visual diet, designed to maximize engagement rather than challenge intellectual complacency. "
            "The screen acts as a sanitizing lens, smoothing out the raw, discordant edges of reality that once drove artistic exploration. "
            "What we witness today is the industrialization of taste, where beauty is quantified by likes and shares, and anything that resists instant assimilation is cast aside as noise.</p>"
            "<p class='mb-4'><b>B. Prof. Evelyn Carter (Digital Humanities Scholar)</b><br>"
            "While Vance's techno-pessimism is understandable, it ignores the unprecedented democratisation of aesthetic production. "
            "The digital realm has shattered the exclusive gatekeeping of museums and elite academies. "
            "Now, anyone with a smartphone is an active curator and creator. We are seeing a dazzling proliferation of micro-genres, a vernacular art that thrives on juxtaposition and remix. "
            "The ephemeral nature of digital platforms, far from cheapening the experience, introduces a new, dynamic temporality reminiscent of Dadaist happenings. "
            "It is not a homogenization of taste, but an explosion of diversity that resists centralized control.</p>"
            "<p class='mb-4'><b>C. Julian Thorne (Philosopher of Art)</b><br>"
            "The debate between Vance and Carter misses the key ontological shift: the nature of the image itself has changed. "
            "A digital image is not a representation of a physical object; it is a computed file. This creates a fundamental sense of placelessness. "
            "When art is decoupled from physical presence and material resistance, it loses its weight. "
            "The aesthetic experience becomes frictionless, a rapid sequence of glances that leaves no intellectual trace. "
            "We are suffering from a surfeit of visual stimuli, an aesthetic overload that dulls our capacity for deep contemplative attention, leading to a profound sensory alienation.</p>"
            "<p class='mb-4'><b>D. Dr. Clara Mendelsohn (Media Ecologist)</b><br>"
            "We must examine how digital tools reconfigure our cognitive processes. The medium does not just deliver aesthetic experiences; it shapes them. "
            "The hyper-textual, non-linear navigation of the web trains the mind to seek connections, echoes, and disruptions. "
            "This has birthed a 'networked aesthetics,' where a work of art is not valued as a self-contained masterpiece but as a node in an ongoing dialogue. "
            "The beauty lies in the relational possibilities, in how a visual fragment sparks a chain reaction of creative responses across the globe. "
            "It is a collective, participative aesthetic that is entirely new.</p>"
            "<p class='mb-4'><b>E. Marcus Sterling (Art Critic and Curator)</b><br>"
            "The real challenge in curating today is navigating the collapse of the boundary between the public and the private. "
            "The domestic sphere is now fully broadcasted, and the gallery is no longer a temple of silent contemplation but a backdrop for personal branding. "
            "The modern viewer does not look at the artwork; they look at themselves *with* the artwork. "
            "This performs a narcissistic inversion of the traditional aesthetic relationship. Art is reduced to a lifestyle prop, valued not for its intrinsic qualities or political critique, "
            "but for its utility in constructing a curated online identity.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t1-rg-7",
            "instruction": "Identify which perspective (A-E) matches the following statements.",
            "questions": []
        }]
    }
    
    part7_qs = [
        ("q-camcp2-t1-44", "Which perspective suggests that the digitisation of art has ended the traditional monopoly on who defines artistic value?", "B", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-45", "Which perspective expresses concern that a constant flow of images prevents deep mental engagement with art?", "C", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-46", "Which perspective argues that the digital medium has converted art into a tool for self-promotion?", "E", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-47", "Which perspective asserts that algorithmic systems curate a standardized and non-threatening visual experience?", "A", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-48", "Which perspective views digital art as a collaborative web of interconnected global responses?", "D", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-49", "Which perspective compares the fleetingness of online platforms to historical avant-garde art movements?", "B", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-50", "Which perspective believes that the digital image has lost its physical and material significance?", "C", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-51", "Which perspective claims that modern gallery visits are driven primarily by a desire for digital validation?", "E", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-52", "Which perspective emphasizes that hypertextual navigation trains viewers to see art as dynamic networks?", "D", "Page 18, Test 1, Cambridge CPE 2"),
        ("q-camcp2-t1-53", "Which perspective laments that quantified feedback loops have led to an industrialisation of taste?", "A", "Page 18, Test 1, Cambridge CPE 2")
    ]
    
    p7_explanations = {
        "q-camcp2-t1-44": "Đáp án B. Prof. Evelyn Carter chỉ ra: 'shattered the exclusive gatekeeping of museums and elite academies' (đập tan sự độc quyền canh gác của các viện bảo tàng và học viện tinh hoa). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-45": "Đáp án C. Julian Thorne cho rằng: 'dulls our capacity for deep contemplative attention' (làm chai lì khả năng chú ý suy ngẫm sâu sắc do thừa thãi kích thích thị giác). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-46": "Đáp án E. Marcus Sterling viết: 'valued not for its intrinsic qualities... but for its utility in constructing a curated online identity' (nghệ thuật bị giảm trừ thành đạo cụ phong cách sống để tự quảng bá bản thân trực tuyến). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-47": "Đáp án A. Dr. Adrian Vance lập luận: 'spoon-fed a homogenized visual diet... smoothing out the raw, discordant edges' (thuật toán mớm cho chúng ta một chế độ ăn thị giác đồng nhất, làm mịn đi những góc cạnh thô ráp). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-48": "Đáp án D. Dr. Clara Mendelsohn mô tả: 'relational possibilities... sparks a chain reaction of creative responses across the globe' (khả năng kết nối kích hoạt phản ứng chuỗi toàn cầu). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-49": "Đáp án B. Prof. Evelyn Carter so sánh: 'new, dynamic temporality reminiscent of Dadaist happenings' (tính chất tạm thời gợi nhắc đến các sự kiện Dadaist). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-50": "Đáp án C. Julian Thorne khẳng định: 'decoupled from physical presence and material resistance' (bị ngắt kết nối khỏi sự hiện diện vật lý và lực cản vật chất). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-51": "Đáp án E. Marcus Sterling nhận định: 'gallery is no longer a temple... but a backdrop for personal branding' (phòng triển lãm trở thành phông nền để xây dựng thương hiệu cá nhân). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-52": "Đáp án D. Dr. Clara Mendelsohn viết: 'hyper-textual, non-linear navigation... trains the mind to seek connections' (điều hướng phi tuyến tính huấn luyện tâm trí tìm kiếm kết nối). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t1-53": "Đáp án A. Dr. Adrian Vance nhận xét: 'industrialization of taste, where beauty is quantified by likes and shares' (sự công nghiệp hóa thị hiếu, nơi cái đẹp được định lượng bằng lượt thích). Chuyên đề: Reading Comprehension."
    }
    
    for q in part7_qs:
        sec7["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[2],
            "explanation": p7_explanations[q[0]],
            "answerLocation": "Test 1 Part 7 matching",
            "category": "reading_comprehension",
            "source": q[3]
        })
    test_data["sections"].append(sec7)
    
    return test_data

# ==========================================
# TEST 2 DEFINITION
# ==========================================
def build_test2():
    test_data = {
        "id": "camcp2-test2",
        "title": "CPE C2 Proficiency Reading & Use of English - Test 2 (Cambridge CPE 2)",
        "type": "academic",
        "skill": "reading",
        "source": "Cambridge Certificate of Proficiency in English 2, Cambridge University Press",
        "sections": []
    }
    
    # Part 1: MCQ Cloze
    sec1 = {
        "id": "camcp2-t2-sec-1",
        "title": "Part 1: Multiple-Choice Cloze",
        "instructions": "For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Text 1: Sand</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Much as I admire sand’s miraculous ability to be transformed into useful objects like glass and concrete, "
            "I am not a great fan of it in its (1) ______ state. To me it is primarily a hostile barrier that stands between a seaside car park and the water itself. "
            "It blows in your face, (2) ______ in your sandwiches, and swallows vital objects like car keys and coins. "
            "When you are wet it (3) ______ to you like 'stucco', and cannot be (4) ______ , even with a fireman's hose. "
            "For days afterwards, you tip mysteriously undiminishing piles of it onto the floor every time you take off your shoes, "
            "and spray the vicinity with lots more when you (5) ______ your socks. Sand stays with you for longer than many contagious diseases. "
            "No, you can (6) ______ sand, as far as I am concerned.</p>"
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1 mt-6'>Text 2: Lock and Key</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The search for a safe home, for privacy and security, has existed ever since human beings first built a permanent homestead. "
            "The rope-lifted beam behind the door may have (7) ______ to an electronic lock triggered by a plastic card with more combinations than there are atoms in the universe, "
            "but the (8) ______ to shut out the 'bad guys' remains. The appeal of a lock and key is psychological.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t2-rg-1",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part1_qs = [
        ("q-camcp2-t2-1", "Gap (1):", ["A. normal", "B. natural", "C. unrefined", "D. unmixed"], "B",
         "Đáp án B. Collocation: 'in its natural state' nghĩa là 'ở trạng thái tự nhiên / nguyên bản hoang dã'. Tác giả nói dù thích các vật dụng chế tác từ cát nhưng hoàn toàn không ưa nó ở dạng tự nhiên trên bãi biển. Bẫy: 'normal' (thông thường), 'unrefined' (chưa tinh chế — dùng cho dầu mỏ/đường), 'unmixed' (chưa trộn lẫn). Chuyên đề: Collocations — state.",
         "fan of it in its natural state", "collocations", "Page 19, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-2", "Gap (2):", ["A. enters", "B. seeps", "C. gets", "D. comes"], "C",
         "Đáp án C. Phrasal verb: 'get in' nghĩa là 'lọt vào / xâm nhập vào'. Ở đây là 'gets in your sandwiches' (cát bay lọt vào bánh mì kẹp của bạn). Bẫy: 'enters' là ngoại động từ nên không đi kèm giới từ 'in' (phải là enters your sandwiches). 'seeps' (rò rỉ — dùng cho chất lỏng). 'comes' không đi với 'in' để chỉ sự lọt vào đáng ghét như vậy. Chuyên đề: Phrasal verbs — get in.",
         "It blows in your face, gets in your sandwiches", "phrasal_verbs", "Page 19, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-3", "Gap (3):", ["A. adheres", "B. attracts", "C. fixes", "D. grips"], "A",
         "Đáp án A. Động từ đi kèm giới từ: 'adheres to' nghĩa là 'bám chặt vào / dính chặt vào'. Cát dính chặt vào da bạn khi bạn ướt. Bẫy: 'attracts' (thu hút — không đi với to). 'fixes to' (đóng đinh/cố định cố ý). 'grips' (nắm chặt vật lý). Chuyên đề: Dependent prepositions — adhere to.",
         "When you are wet it adheres to you like", "prepositions", "Page 19, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-4", "Gap (4):", ["A. shorn", "B. scraped", "C. shoved", "D. shifted"], "D",
         "Đáp án D. Từ vựng: 'shifted' nghĩa là 'di dời / làm dịch chuyển / loại bỏ đi chỗ khác'. Ở đây cát dính chặt tới mức không thể xịt bỏ đi được. Bẫy: 'shorn' (quá khứ phân từ của shear — cạo lông cừu/tóc). 'scraped' (cạo bỏ bằng dao). 'shoved' (xô đẩy thô bạo). 'Shifted' mô tả sự loại bỏ vật lý tự nhiên phù hợp nhất. Chuyên đề: Vocabulary — verbs of physical movement.",
         "like ‘stucco’, and cannot be shifted , even with", "vocabulary", "Page 19, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-5", "Gap (5):", ["A. peel off", "B. roll away", "C. move off", "D. strip away"], "A",
         "Đáp án A. Phrasal verb: 'peel off' nghĩa là 'lột ra / cởi bỏ (quần áo, tất bò sát da)'. Ở đây là cởi tất chân ra. Bẫy: 'roll away' (lăn đi). 'move off' (rời đi). 'strip away' (bóc trần/tước đoạt). Chuyên đề: Phrasal verbs — peel off.",
         "floor every time you take off your shoes, and spray the vicinity with lots more when you peel off your socks", "phrasal_verbs", "Page 19, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-6", "Gap (6):", ["A. have", "B. keep", "C. hold", "D. store"], "B",
         "Đáp án B. Collocation / Phrasal verb: 'keep' đi với danh từ chỉ ý thức phủ định 'No, you can keep sand...' (Thôi, bạn cứ giữ lấy cát đi — một cách mỉa mai thể hiện sự xua đuổi). Chuyên đề: Collocations — keep.",
         "No, you can keep sand, as far as", "collocations", "Page 19, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-7", "Gap (7):", ["A. yielded", "B. bowed", "C. deferred", "D. submitted"], "B",
         "Đáp án B. Động từ đi kèm giới từ: 'bowed to' nghĩa là 'cúi đầu trước / nhường chỗ cho / chịu thua trước'. Cái chốt cửa bằng gỗ đơn sơ sau cánh cửa giờ đây đã phải cúi đầu/nhường chỗ cho khóa điện tử hiện đại. Bẫy: 'yielded to' cũng có nghĩa nhường chỗ nhưng 'bowed to' mang sắc thái lịch sử nghệ thuật nhân hóa phù hợp ngữ cảnh hơn. Chuyên đề: Dependent prepositions — bow to.",
         "behind the door may have bowed to an electronic lock", "prepositions", "Page 19, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-8", "Gap (8):", ["A. demand", "B. wish", "C. requirement", "D. need"], "D",
         "Đáp án D. Từ vựng: 'need' (nhu cầu/khát vọng cơ bản). Nhu cầu tránh xa kẻ xấu vẫn giữ nguyên suốt chiều dài lịch sử. Bẫy: 'demand' (yêu cầu đòi hỏi). 'wish' (ước nguyện). 'requirement' (tiêu chuẩn bắt buộc pháp lý). Chỉ 'need' mô tả nhu cầu bản năng sinh tồn. Chuyên đề: Vocabulary — nouns of utility.",
         "but the need to shut out the ‘bad guys’ remains", "vocabulary", "Page 20, Test 2, Cambridge CPE 2")
    ]
    
    for q in part1_qs:
        sec1["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec1)
    
    # Part 2: Open Cloze
    sec2 = {
        "id": "camcp2-t2-sec-2",
        "title": "Part 2: Open Cloze",
        "instructions": "For questions 9-16, read the text below and think of the word which best fits each space. Use only one word in each space.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Logical Thinking</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The criterion we use in (0) <b>order</b> to test the genuineness of apparent statements of fact is that of verifiability. "
            "We say a sentence is factually significant if, and (9) ______ if, the person hearing it knows (10) ______ to verify the proposition it purports to express. "
            "In (11) ______ words, the hearer needs to know what observations would lead him or her, (12) ______ certain conditions be met, to accept the proposition as true, or reject it as false. "
            "Following on (13) ______ this, if the proposition is of (14) ______ a character that the assumption of its truth is consistent with any assumption whatsoever about the nature of the hearer's future experience, "
            "then it is certainly (15) ______ a factually verifiable proposition. With (16) ______ to questions, the procedure is the same.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t2-rg-2",
            "instruction": "Write the correct word in each gap in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part2_qs = [
        ("q-camcp2-t2-9", "Gap (9):", "only", ["only"],
         "Đáp án: ONLY. Cấu trúc logic/toán học cố định: 'if, and only if' nghĩa là 'khi và chỉ khi'. Dùng để chỉ điều kiện cần và đủ của một giả thuyết khoa học. Chuyên đề: Fixed expressions — if and only if.",
         "significant if, and only if, the person", "fixed_expressions", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-10", "Gap (10):", "how", ["how"],
         "Đáp án: HOW. Từ nghi vấn làm tân ngữ: 'knows how to verify' = biết cách xác minh mệnh đề đó. Cấu trúc: 'know + wh-word + to-infinitive'. Chuyên đề: Nominal clauses — Wh-words.",
         "person hearing it knows how to verify the", "grammar_patterns", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-11", "Gap (11):", "other", ["other"],
         "Đáp án: OTHER. Cụm liên từ nối cố định: 'In other words' = 'Nói cách khác'. Dùng để giải thích lại một ý niệm khó bằng từ ngữ đơn giản. Chuyên đề: Fixed expressions — in other words.",
         "In other words, the hearer needs", "fixed_expressions", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-12", "Gap (12):", "should", ["should"],
         "Đáp án: SHOULD. Đảo ngữ điều kiện loại 1: 'should certain conditions be met' tương đương 'if certain conditions are met'. Động từ khuyết thiếu 'should' đảo lên trước chủ ngữ. Chuyên đề: Grammar — Inverted conditionals.",
         "hearer needs to know what observations would lead him or her, should certain conditions be met", "grammar_patterns", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-13", "Gap (13):", "from", ["from"],
         "Đáp án: FROM. Cấu trúc cụm động từ: 'follow on from something' = 'hệ quả rút ra từ cái gì'. 'Following on from this' = Tiếp nối từ điều này, hệ quả là... Chuyên đề: Dependent prepositions — follow from.",
         "Following on from this, if the", "prepositions", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-14", "Gap (14):", "such", ["such"],
         "Đáp án: SUCH. Cấu trúc kết quả: 'of such a character that...' = 'có tính chất đến mức mà...'. Cấu trúc 'such + a + noun + that' chỉ mức độ cao dẫn tới kết quả ở mệnh đề sau. Chuyên đề: Conjunctions — such... that.",
         "proposition is of such a character that", "conjunctions", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-15", "Gap (15):", "not", ["not"],
         "Đáp án: NOT. Phó từ phủ định định lượng: 'is certainly not a factually verifiable proposition' (chắc chắn KHÔNG PHẢI là một mệnh đề có thể xác minh về mặt thực tế). Chuyên đề: Grammar — negation.",
         "then it is certainly not a factually verifiable", "grammar_patterns", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-16", "Gap (16):", "regard", ["regard", "respect", "reference"],
         "Đáp án: REGARD (hoặc RESPECT/REFERENCE). Cụm giới từ cố định: 'With regard to...' / 'With respect to...' = 'Đối với / Liên quan tới...'. Ở đây là 'Đối với các câu hỏi, quy trình cũng tương tự'. Chuyên đề: Prepositional phrases — with regard to.",
         "With regard to questions, the procedure is", "prepositional_phrases", "Page 26, Test 2, Cambridge CPE 2")
    ]
    
    for q in part2_qs:
        sec2["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec2)
    
    # Part 3: Word Formation
    sec3 = {
        "id": "camcp2-t2-sec-3",
        "title": "Part 3: Word Formation",
        "instructions": "For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the space in the same line.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>The Spiral and the Helix</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>They are everywhere, (0) <b>curving</b> [CURVE] shapes whose incredible (17) ______ [REGULAR] has done much to inspire artists and scientists alike. "
            "Yet, how do we distinguish between them? A spiral is a flat curve, while a helix is three-dimensional. "
            "The spiral is a symbol of growth and evolution in nature, whereas the helix represents structure. "
            "Historically, the (18) ______ [JUST] of studying these shapes lay in their engineering value. "
            "Early (19) ______ [MATHEMATICS] were obsessed with their elegant symmetries. "
            "Over the centuries, engineers have (20) ______ [REPEAT] applied these forms to design structures. "
            "In biological sciences, the double helix represents the key to (21) ______ [RAVEL] the mysteries of DNA. "
            "Recent scientific (22) ______ [BREAK] have highlighted how these forms govern the growth of plants. "
            "In the field of (23) ______ [METEOR], spiral wind patterns help predict massive storms. "
            "The views of spirals in deep space remain a (24) ______ [SPECTACLE] sight for astronomers.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t2-rg-3",
            "instruction": "Write your answers in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part3_qs = [
        ("q-camcp2-t2-17", "Gap (17):", "regularity", ["regularity"],
         "Đáp án: REGULARITY. Cần danh từ đứng sau tính từ sở hữu 'whose incredible...'. Từ gốc REGULAR (đều đặn/bình thường) -> regularity (tính đều đặn / sự quy luật đối xứng). Chuyên đề: Word formation — nouns.",
         "whose incredible regularity has done", "word_formation", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-18", "Gap (18):", "justice", ["justice", "justification"],
         "Đáp án: JUSTICE (hoặc JUSTIFICATION). Cần danh từ làm chủ ngữ trong cụm 'The [noun] of studying...'. Ở đây 'the justification' = sự hợp lý hóa / lý do chính đáng để nghiên cứu những hình dạng này. Từ gốc JUST (công bằng/chính đáng) -> justification (sự biện hộ/chính đáng) hoặc justice. Chuyên đề: Word formation — nouns.",
         "Historically, the justification of studying", "word_formation", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-19", "Gap (19):", "mathematicians", ["mathematicians"],
         "Đáp án: MATHEMATICIANS. Cần danh từ số nhiều chỉ người (các nhà toán học) làm chủ ngữ cho động từ số nhiều 'were obsessed'. Từ gốc MATHEMATICS (toán học) -> mathematician (nhà toán học) -> mathematicians. Chuyên đề: Word formation — nouns.",
         "Early mathematicians were obsessed with", "word_formation", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-20", "Gap (20):", "repeatedly", ["repeatedly"],
         "Đáp án: REPEATEDLY. Cần trạng từ bổ nghĩa cho động từ phân từ 'applied'. Cấu trúc: 'have + adverb + past participle'. Từ gốc REPEAT (lặp lại) -> repeated (bị lặp lại) -> repeatedly (nhiều lần / lặp đi lặp lại). Chuyên đề: Word formation — adverbs.",
         "engineers have repeatedly applied these forms", "word_formation", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-21", "Gap (21):", "unravel", ["unravel", "unravelling"],
         "Đáp án: UNRAVEL (hoặc UNRAVELLING). Cần động từ nguyên mẫu có 'to' hoặc danh động từ đứng sau giới từ 'to': 'the key to [V-ing/V] ...' = chìa khóa để làm sáng tỏ cái gì. Từ gốc RAVEL (làm rối) -> unravel (làm sáng tỏ / tháo gỡ — thêm tiền tố un-). Chuyên đề: Word formation — prefixes.",
         "key to unravel the mysteries of DNA", "word_formation", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-22", "Gap (22):", "breakthroughs", ["breakthroughs"],
         "Đáp án: BREAKTHROUGHS. Cần danh từ số nhiều làm chủ ngữ cho động từ số nhiều 'have highlighted'. Từ gốc BREAK + THROUGH -> breakthrough (bước đột phá) -> breakthroughs (các bước đột phá). Chuyên đề: Word formation — compound nouns.",
         "Recent scientific breakthroughs have highlighted", "word_formation", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-23", "Gap (23):", "meteorology", ["meteorology"],
         "Đáp án: METEOROLOGY. Cần danh từ trừu tượng chỉ ngành học/lĩnh vực khoa học: 'In the field of meteorology' = Trong lĩnh vực khí tượng học. Từ gốc METEOR (thiên thạch) -> meteorology (khí tượng học). Chuyên đề: Word formation — nouns of science.",
         "In the field of meteorology , spiral wind", "word_formation", "Page 26, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-24", "Gap (24):", "spectacular", ["spectacular"],
         "Đáp án: SPECTACULAR. Cần tính từ bổ nghĩa cho danh từ 'sight' đứng trước. Từ gốc SPECTACLE (kính mắt/sự việc kỳ vĩ) -> spectacular (kỳ vĩ / ngoạn mục). Chuyên đề: Word formation — adjectives.",
         "remain a spectacular sight for astronomers", "word_formation", "Page 26, Test 2, Cambridge CPE 2")
    ]
    
    for q in part3_qs:
        sec3["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec3)
    
    # Part 4: Key Word Transformation
    sec4 = {
        "id": "camcp2-t2-sec-4",
        "title": "Part 4: Key Word Transformation",
        "instructions": "For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and eight words, including the word given.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Key Word Transformation</h2>"
            "<div class='mb-4 text-slate-800 text-base leading-relaxed'>"
            "<p class='mb-2'><b>25.</b> I enjoy reading, but at times I find myself too busy to open a book. (TIMES)</p>"
            "<p class='mb-2'>Much ______ there are times when I find myself too busy to open a book.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>26.</b> The president didn't make a statement until the book had been published. (PUBLISHED)</p>"
            "<p class='mb-2'>Only after ______ did the president make a statement.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>27.</b> Without your support, I would still be searching for a job. (SUPPORT)</p>"
            "<p class='mb-2'>Had it ______ , I would still be searching for a job.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>28.</b> The residents voiced their strong disapproval of the new road construction. (DISAPPROVAL)</p>"
            "<p class='mb-2'>The residents ______ the new road construction.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>29.</b> I was not surprised to hear that Jack had decided to resign. (SURPRISE)</p>"
            "<p class='mb-2'>It ______ to hear that Jack had decided to resign.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>30.</b> You ought to mention this issue to the director immediately. (SAY)</p>"
            "<p class='mb-2'>You ______ about this issue to the director immediately.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t2-rg-4",
            "instruction": "Write the missing words only.",
            "questions": []
        }]
    }
    
    part4_qs = [
        ("q-camcp2-t2-25", "Sentence 25: Much ______ there are times when I find myself too busy to open a book. (Key word: TIMES)",
         "as I enjoy reading, there are times when",
         ["as I enjoy reading, there are times when", "as I like reading, there are times when", "as I enjoy reading, at times", "as I like reading, at times"],
         "Đáp án: 'as I enjoy reading, there are times when'. Cấu trúc nhượng bộ nâng cao: 'Much as + subject + verb' = 'Mặc dù... nhiều đến thế nào'. 'Much as I enjoy reading' = Mặc dù tôi thích đọc sách rất nhiều. Chuyên đề: Conjunctions — much as.",
         "Much as I enjoy reading, there are times when", "conjunctions", "Page 28, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-26", "Sentence 26: Only after ______ did the president make a statement. (Key word: PUBLISHED)",
         "the book had been published",
         ["the book had been published", "the book was published"],
         "Đáp án: 'the book had been published'. Cấu trúc đảo ngữ sau trạng từ thời gian giới hạn: 'Only after + clause + auxiliary + subject + verb'. Mệnh đề trạng ngữ sau 'Only after' chia ở quá khứ hoàn thành là chính xác nhất. Chuyên đề: Grammar — Inversion.",
         "Only after the book had been published did the president", "grammar_patterns", "Page 28, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-27", "Sentence 27: Had it ______ , I would still be searching for a job. (Key word: SUPPORT)",
         "not been for your support",
         ["not been for your support", "not been for your help"],
         "Đáp án: 'not been for your support'. Cấu trúc điều kiện loại 3 đảo ngữ phủ định: 'Had it not been for + noun' = 'Nếu không vì...'. Dùng để viết lại cho 'Without your support' trong câu điều kiện trái thực tế quá khứ. Chuyên đề: Grammar — Inverted conditionals.",
         "Had it not been for your support", "grammar_patterns", "Page 28, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-28", "Sentence 28: The residents ______ the new road construction. (Key word: DISAPPROVAL)",
         "expressed strong disapproval of",
         ["expressed strong disapproval of", "voiced strong disapproval of", "made clear their strong disapproval of"],
         "Đáp án: 'expressed strong disapproval of'. Cấu trúc collocation: 'express/voice/show disapproval of something' = bày tỏ sự không đồng tình đối với cái gì. Bẫy: Phải giữ nguyên danh từ 'disapproval' đi kèm giới từ 'of'. Chuyên đề: Collocations — disapproval.",
         "expressed strong disapproval of", "collocations", "Page 28, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-29", "Sentence 29: It ______ to hear that Jack had decided to resign. (Key word: SURPRISE)",
         "came as no surprise to me",
         ["came as no surprise to me"],
         "Đáp án: 'came as no surprise to me'. Cụm idiom cố định: 'come as no surprise to someone' = hoàn toàn không phải là điều bất ngờ đối với ai. Chuyên đề: Idioms — come as no surprise.",
         "It came as no surprise to me to hear", "idioms", "Page 28, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-30", "Sentence 30: You ______ about this issue to the director immediately. (Key word: SAY)",
         "had better say a word",
         ["had better say a word", "should say a word", "ought to say a word"],
         "Đáp án: 'had better say a word'. Cấu trúc khuyên bảo: 'had better + verb' = nên làm gì đó. Thành ngữ 'say a word about something' = hé răng / nói một lời nào đó về điều gì. Chuyên đề: Modal verbs — had better.",
         "had better say a word about this issue", "idioms", "Page 28, Test 2, Cambridge CPE 2")
    ]
    
    for q in part4_qs:
        sec4["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec4)
    
    # Part 5: Multiple Choice Reading
    sec5 = {
        "id": "camcp2-t2-sec-5",
        "title": "Part 5: Multiple Choice",
        "instructions": "For questions 31-36, read the text below and choose the answer (A, B, C or D) which you think fits best according to the text.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Psychology of Laughter</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Why do we laugh, and what does it tell us about our relationships?</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Laughter is a universal human behavior, yet its evolutionary and psychological origins remain deeply mysterious. "
            "While we often associate laughter with humor and jokes, researchers have discovered that it is primarily a social signal. "
            "Laughter occurs ten times more frequently in social conversations than when individuals are alone. "
            "It functions as a subconscious indicator of safety, belonging, and mutual trust. In evolutionary terms, it likely developed from the play-pants of early primates, serving as a signal that a threatening situation had passed and that the group could relax.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Furthermore, the contagious nature of laughter is well-documented. "
            "When we hear someone laugh, mirror neurons in our brain fire, triggering a strong impulse to join in. "
            "This synchronization of emotional states helps bond social groups together, fostering a sense of unity and shared identity. "
            "However, not all laughter is benign. Nervous laughter, for instance, serves as a coping mechanism to defuse tension or mask anxiety in highly stressful situations. "
            "Understanding these nuances is key to decoding human social interactions.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t2-rg-5",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part5_qs = [
        ("q-camcp2-t2-31", "What does the writer emphasize about laughter in the first paragraph?",
         ["A. It is almost always triggered by humor.",
          "B. It is primarily a tool for social bonding.",
          "C. It is unique to human beings.",
          "D. It has no clear evolutionary explanation."], "B",
         "Đáp án B. Đoạn 1 chỉ rõ: 'it is primarily a social signal... functions as a subconscious indicator of safety, belonging, and mutual trust' (nó chủ yếu là một tín hiệu xã hội... hoạt động như một chỉ báo vô thức về sự an toàn, thuộc về và tin tưởng lẫn nhau). Điều này nhấn mạnh vai trò liên kết xã hội (social bonding) của tiếng cười. Chuyên đề: Reading Comprehension.",
         "primarily a social signal... safety, belonging, and mutual trust", "reading_comprehension", "Page 23, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-32", "According to the passage, early primates used a form of laughter to signal",
         ["A. the discovery of food.",
          "B. the presence of a predator.",
          "C. that danger had passed.",
          "D. a challenge to the dominant male."], "C",
         "Đáp án C. Tác giả chỉ ra ở đoạn 1: 'serving as a signal that a threatening situation had passed and that the group could relax' (phục vụ như một tín hiệu cho thấy tình huống đe dọa đã qua và cả nhóm có thể thư giãn). Chuyên đề: Reading Comprehension.",
         "signal that a threatening situation had passed", "reading_comprehension", "Page 23, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-33", "What does the contagious nature of laughter suggest about humans?",
         ["A. We are easily influenced by others.",
          "B. Our brains are hardwired for social connection.",
          "C. We struggle to control our emotions.",
          "D. We prioritize pleasure above all else."], "B",
         "Đáp án B. Đoạn 2 giải thích: 'mirror neurons in our brain fire, triggering a strong impulse... synchronization of emotional states helps bond social groups' (tế bào thần kinh gương kích hoạt xung năng gia nhập... đồng bộ hóa trạng thái giúp liên kết xã hội). Điều này chứng minh bộ não chúng ta được thiết kế tự nhiên cho việc kết nối xã hội (hardwired for social connection). Chuyên đề: Reading Comprehension.",
         "mirror neurons in our brain fire... synchronization of emotional states helps bond", "reading_comprehension", "Page 23, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-34", "The author uses the example of 'nervous laughter' to show that laughter",
         ["A. can be used to hide negative emotions.",
          "B. is always a positive social signal.",
          "C. is difficult to study scientifically.",
          "D. is unique to stressful situations."], "A",
         "Đáp án A. Đoạn 2 chỉ ra: 'nervous laughter... serves as a coping mechanism to defuse tension or mask anxiety' (tiếng cười lo lắng... hoạt động như cơ chế đối phó để xoa dịu căng thẳng hoặc che giấu sự lo âu). Như vậy tiếng cười có thể che giấu cảm xúc tiêu cực (hide negative emotions). Chuyên đề: Reading Comprehension.",
         "coping mechanism to defuse tension or mask anxiety", "reading_comprehension", "Page 23, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-35", "Which word is closest in meaning to 'benign' as used in the second paragraph?",
         ["A. harmless",
          "B. active",
          "C. social",
          "D. complex"], "A",
         "Đáp án A. Từ vựng: 'benign' trong y học nghĩa là lành tính, trong đời sống nghĩa là 'ôn hòa / vô hại / thân thiện'. Dịch nghĩa trong ngữ cảnh: 'Tuy nhiên, không phải mọi tiếng cười đều vô hại (benign = harmless)'. Chuyên đề: Vocabulary — word meaning.",
         "not all laughter is benign", "reading_comprehension", "Page 23, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-36", "What is the overall tone of the passage?",
         ["A. skeptical",
          "B. analytical",
          "C. dismissive",
          "D. enthusiastic"], "B",
         "Đáp án B. Ngữ điệu tổng thể của bài viết mang tính khoa học, khách quan, phân tích sâu các cơ chế tâm lý và tiến hóa của tiếng cười (analytical). Chuyên đề: Reading Comprehension.",
         "analytical tone", "reading_comprehension", "Page 23, Test 2, Cambridge CPE 2")
    ]
    
    for q in part5_qs:
        sec5["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "reading_comprehension",
            "source": q[6]
        })
    test_data["sections"].append(sec5)
    
    # Part 6: Gapped Text
    sec6 = {
        "id": "camcp2-t2-sec-6",
        "title": "Part 6: Gapped Text",
        "instructions": "For questions 37-43, read the text below. Seven paragraphs have been removed from the extract. Choose from the paragraphs A-H the one which fits each gap. There is one extra paragraph which you do not need to use.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Architecture of Silence</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>How modern architects are designing quiet spaces in noisy cities.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>In our hyper-connected, metropolitan lives, silence has become the ultimate luxury. "
            "Constant ambient noise — from traffic, sirens, construction, and our own devices — bombards our senses, leading to chronic stress and cognitive fatigue. "
            "In response, a pioneering movement in architecture is seeking to create buildings that act as acoustic sanctuaries, isolating occupants from the chaos outside.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 37 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Modern soundproofing, however, is not just about lining walls with heavy insulation. "
            "It requires a sophisticated understanding of how sound waves travel through materials and spaces. "
            "Acoustic architects utilize complex geometric forms to deflect, absorb, and diffuse sound, creating zones of quietness within larger public buildings.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 38 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>This structural isolation is particularly crucial in multi-unit residential buildings. "
            "The sounds of neighbors — walking, talking, or playing music — can be incredibly disruptive, leading to conflicts and decreased well-being. "
            "By implementing floating floors and double-stud walls, architects can ensure that residents enjoy a high degree of privacy and quiet.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 39 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Yet, silence in architecture is not just about the absence of sound; it is also about the presence of positive acoustic elements. "
            "Water features, such as trickling fountains, can mask irritating background noise with a soothing, natural sound. "
            "Similarly, courtyards designed with dense vegetation can trap noise while introducing the pleasant sounds of rustling leaves and birds.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 40 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Indeed, the visual aspects of a space can profoundly affect our acoustic perception. "
            "Minimalist designs, with clean lines and natural materials like wood and stone, can induce a psychological sense of quietness, even if the actual decibel level is not significantly lower. "
            "The brain interprets visual calm as acoustic calm.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 41 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>This holistic approach to acoustic design is now being applied to office environments. "
            "The open-plan office, once hailed as a triumph of collaboration, has turned out to be an acoustic nightmare for many, leading to decreased productivity and increased stress. "
            "Companies are now introducing 'quiet pods' and dedicated silent zones where employees can escape to focus.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 42 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The benefits of these changes are clear. Studies show that quiet workspaces significantly improve focus, memory retention, and job satisfaction. "
            "The investment in acoustic design is not just a luxury; it is a smart business decision.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 43 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Ultimately, designing for quietness is about reclaiming our mental sovereignty in a world that is constantly screaming for our attention. "
            "By treating silence as a vital design parameter, architects can help build healthier, more humane cities.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t2-rg-6",
            "instruction": "Match the correct paragraph (A-H) to each gap (37-43). Paragraphs are provided below.",
            "questions": []
        }]
    }
    
    sec6_paragraphs = (
        "### Paragraph Options\n\n"
        "**A.** This cognitive connection between what we see and what we hear is a key focus of environmental psychology. "
        "It suggests that our sensory systems do not operate in isolation but are constantly influencing each other.\n\n"
        "**B.** One of the most effective methods for achieving this is 'box-in-a-box' construction, where an inner room is physically decoupled from the outer building envelope. "
        "This prevents structural vibrations from entering the space.\n\n"
        "**C.** The design of public libraries has historically prioritized this silent refuge, but modern libraries are evolving into social hubs. "
        "Architects must now balance quiet study areas with loud collaborative zones.\n\n"
        "**D.** These acoustic zones are particularly essential in schools and universities. "
        "Studies show that excessive background noise in classrooms significantly impairs children's learning and reading comprehension.\n\n"
        "**E.** These design strategies show that quietness is not a passive condition but an active, curated experience. "
        "By introducing carefully selected natural sounds, architects can enhance our well-being.\n\n"
        "**F.** Designing these sanctuaries requires a fundamental shift in priorities. "
        "Architects must prioritize acoustic performance from the very beginning of the design process, treating sound as a material just like concrete or glass.\n\n"
        "**G.** The consequences of this urban noise pollution are severe, with research linking it to cardiovascular disease, sleep disruption, and impaired cognitive development in children.\n\n"
        "**H.** This shift requires managers to trust their employees to manage their own time and workspace. "
        "It is a rejection of the traditional corporate surveillance culture."
    )
    sec6["passageHtml"] += f"<hr class='my-6 border-emerald-100'/>{sec6_paragraphs}"
    
    part6_qs = [
        ("q-camcp2-t2-37", "Gap 37:", "F", "F", "Đáp án F. Paragraph F nói về sự thay đổi ưu tiên thiết kế trong việc coi âm thanh như một vật liệu, nối tiếp hợp lý cho ý niệm kiến trúc sư tìm kiếm thánh đường cách âm ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "F", "Page 22, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-38", "Gap 38:", "B", "B", "Đáp án B. Paragraph B giới thiệu cấu trúc 'box-in-a-box' để ngăn các rung động cấu trúc truyền qua, bổ trợ hoàn hảo cho đoạn trước nói về hình hình học phức tạp để hấp thụ âm. Chuyên đề: Cohesion & Coherence.", "B", "Page 22, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-39", "Gap 39:", "G", "G", "Đáp án G. Paragraph G giải thích các tác động sức khỏe nghiêm trọng của ô nhiễm tiếng ồn, tạo sự tương phản mạnh mẽ với giải pháp tăng tính riêng tư và yên tĩnh ở đoạn tiếp theo. Chuyên đề: Cohesion & Coherence.", "G", "Page 22, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-40", "Gap 40:", "E", "E", "Đáp án E. Paragraph E nhấn mạnh rằng sự yên tĩnh là trải nghiệm được thiết kế chủ ý, liên kết trực tiếp với việc đưa âm thanh nước chảy và lá rơi ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "E", "Page 22, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-41", "Gap 41:", "A", "A", "Đáp án A. Paragraph A thảo luận mối liên hệ nhận thức giữa thị giác và thính giác, giải thích cho câu 'The brain interprets visual calm as acoustic calm' ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "A", "Page 22, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-42", "Gap 42:", "D", "D", "Đáp án D. Paragraph D nhấn mạnh tầm quan trọng của các vùng âm thanh yên tĩnh trong môi trường giáo dục học đường, kết nối với việc giới thiệu các buồng yên tĩnh 'quiet pods' ở văn phòng làm việc. Chuyên đề: Cohesion & Coherence.", "D", "Page 22, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-43", "Gap 43:", "C", "C", "Đáp án C. Paragraph C đề cập đến thiết kế của thư viện công cộng như một tham chiếu lịch sử của sự yên lặng, tạo sự cân bằng tự nhiên cho tương lai thiết kế ở đoạn tiếp theo. Chuyên đề: Cohesion & Coherence.", "C", "Page 22, Test 2, Cambridge CPE 2")
    ]
    
    for q in part6_qs:
        sec6["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gapped_text",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "cohesion_coherence",
            "source": q[6]
        })
    test_data["sections"].append(sec6)
    
    # Part 7: Multiple Matching
    sec7 = {
        "id": "camcp2-t2-sec-7",
        "title": "Part 7: Multiple Matching",
        "instructions": "For questions 44-53, read the five academic perspectives on genetic engineering below and choose the correct perspective (A-E) which fits each statement.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Ethics of Genetic Engineering</h2>"
            "<div class='mb-6 text-slate-800 text-base leading-relaxed text-left'>"
            "<p class='mb-4'><b>A. Prof. Liam Gallagher (Bioethicist)</b><br>"
            "We are standing on the precipice of a genetic revolution that could permanently alter the human species. "
            "While the potential to eradicate devastating hereditary diseases is immensely appealing, "
            "we must tread with extreme caution. The line between therapy and enhancement is incredibly blurry. "
            "Once we permit genetic editing for medical purposes, we open the floodgates to 'designer babies' and a new form of eugenics. "
            "This could create a biological class divide, where the rich can afford to upgrade their children's cognitive and physical capacities, leaving the poor genetically disadvantaged. "
            "The commodification of human life is a path we should not take.</p>"
            "<p class='mb-4'><b>B. Dr. Sarah Jenkins (Molecular Biologist)</b><br>"
            "Gallagher's warnings, though philosophically sound, neglect the immediate and tangible suffering of families affected by genetic disorders. "
            "To ban CRISPR and other gene-editing technologies out of fear of future slippery slopes is a moral failure. "
            "We have a duty to alleviate suffering. The technology is safe, precise, and highly regulated. "
            "Furthermore, the argument about inequality is a political problem, not an intrinsic flaw of the science. "
            "We do not ban chemotherapy because it is expensive; instead, we work to make it accessible. "
            "The focus should be on robust regulation and equitable distribution, not obstruction.</p>"
            "<p class='mb-4'><b>C. Raymond Vance (Philosopher of Science)</b><br>"
            "The debate often centers on consequences, but we must also consider the ontological status of a genetically modified human. "
            "By pre-programming a child's genetic traits, we deny them a fundamental aspect of human existence: "
            "the freedom to discover who they are without their parent's design. A child becomes an engineered product, "
            "a manifestation of parental vanity. This alters the parent-child relationship, replacing unconditional love with a set of performance expectations. "
            "The beauty of human life lies in its unpredictability and our capacity to adapt to our limitations, not in biological perfection.</p>"
            "<p class='mb-4'><b>D. Dr. Amara Al-Jamil (Sociologist)</b><br>"
            "We must examine how genetic engineering will reinforce existing social hierarchies. "
            "In our performance-driven society, there is an immense pressure to succeed. "
            "Genetic enhancement will not be a free choice; it will become a social necessity. "
            "Parents will feel compelled to edit their children just to ensure they can compete in the job market. "
            "This will lead to a hyper-competitive, homogenized society where natural variations are pathologized. "
            "Instead of celebrating diversity, we will be striving for a standardized model of human efficiency, "
            "deepening our social alienation.</p>"
            "<p class='mb-4'><b>E. Gregory Sterling (Health Policy Analyst)</b><br>"
            "The conversation must shift from abstract ethics to practical policy. "
            "Genetic editing is already happening globally, and if we ban it in one country, we will simply drive 'genetic tourism' to unregulated markets. "
            "Our priority should be creating international standards and registry systems to track gene-edited individuals and prevent rogue clinics. "
            "We need to distinguish between somatic editing (which affects only the patient) and germline editing (which is passed to future generations). "
            "By focusing on pragmatic, international regulation, we can harness the benefits while mitigating the global risks.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t2-rg-7",
            "instruction": "Identify which perspective (A-E) matches the following statements.",
            "questions": []
        }]
    }
    
    part7_qs = [
        ("q-camcp2-t2-44", "Which perspective suggests that banning gene-editing out of hypothetical fears is morally irresponsible?", "B", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-45", "Which perspective expresses concern that genetic engineering will undermine a child's autonomy to forge their own identity?", "C", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-46", "Which perspective argues that genetic enhancement will become an unavoidable social obligation rather than a free choice?", "D", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-47", "Which perspective warns of a potential biological caste system where genetic advantages are monopolized by the wealthy?", "A", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-48", "Which perspective advocates for pragmatic international regulations to prevent 'genetic tourism'?", "E", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-49", "Which perspective compares the argument about genetic inequality to the accessibility of traditional cancer treatments?", "B", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-50", "Which perspective asserts that designing children converts them from independent individuals into engineered products?", "C", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-51", "Which perspective believes that a performance-driven society will pathologize natural human differences?", "D", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-52", "Which perspective emphasizes the critical difference between somatic editing and germline editing for policy makers?", "E", "Page 31, Test 2, Cambridge CPE 2"),
        ("q-camcp2-t2-53", "Which perspective laments that genetic modification reduces human life to a commercial commodity?", "A", "Page 31, Test 2, Cambridge CPE 2")
    ]
    
    p7_explanations_t2 = {
        "q-camcp2-t2-44": "Đáp án B. Dr. Sarah Jenkins lập luận: 'To ban CRISPR... out of fear of future slippery slopes is a moral failure' (Cấm công nghệ vì sợ các sườn dốc trơn trượt tương lai là một thất bại đạo đức). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-45": "Đáp án C. Raymond Vance chỉ ra: 'deny them a fundamental aspect... the freedom to discover who they are' (chối bỏ khía cạnh nền tảng... quyền tự do khám phá bản sắc riêng của trẻ). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-46": "Đáp án D. Dr. Amara Al-Jamil nhấn mạnh: 'Genetic enhancement will not be a free choice; it will become a social necessity' (Nâng cấp di truyền không phải sự lựa chọn tự do; nó sẽ trở thành nhu cầu xã hội bắt buộc). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-47": "Đáp án A. Prof. Liam Gallagher cảnh báo: 'biological class divide, where the rich can afford to upgrade... leaving the poor genetically disadvantaged' (khoảng cách giai cấp sinh học nơi người giàu nâng cấp con cái và bỏ mặc người nghèo). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-48": "Đáp án E. Gregory Sterling kiến nghị: 'create international standards... prevent genetic tourism' (tạo lập tiêu chuẩn quốc tế để ngăn chặn du lịch di truyền). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-49": "Đáp án B. Dr. Sarah Jenkins so sánh: 'We do not ban chemotherapy because it is expensive' (Chúng ta không cấm hóa trị vì nó đắt đỏ, thay vào đó ta làm nó dễ tiếp cận hơn). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-50": "Đáp án C. Raymond Vance viết: 'A child becomes an engineered product, a manifestation of parental vanity' (Đứa trẻ trở thành sản phẩm được thiết kế, biểu hiện cho sự phù phiếm của cha mẹ). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-51": "Đáp án D. Dr. Amara Al-Jamil nhận xét: 'homogenized society where natural variations are pathologized' (một xã hội đồng nhất nơi các biến dị tự nhiên bị coi là bệnh lý). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-52": "Đáp án E. Gregory Sterling phân biệt: 'distinguish between somatic editing... and germline editing' (phân biệt giữa chỉnh sửa soma và chỉnh sửa dòng mầm để hoạch định chính sách). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t2-53": "Đáp án A. Prof. Liam Gallagher lên án: 'The commodification of human life is a path we should not take' (Thương mại hóa mạng sống con người là con đường ta không nên đi). Chuyên đề: Reading Comprehension."
    }
    
    for q in part7_qs:
        sec7["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[2],
            "explanation": p7_explanations_t2[q[0]],
            "answerLocation": "Test 2 Part 7 matching",
            "category": "reading_comprehension",
            "source": q[3]
        })
    test_data["sections"].append(sec7)
    
    return test_data

# ==========================================
# TEST 3 DEFINITION
# ==========================================
def build_test3():
    test_data = {
        "id": "camcp2-test3",
        "title": "CPE C2 Proficiency Reading & Use of English - Test 3 (Cambridge CPE 2)",
        "type": "academic",
        "skill": "reading",
        "source": "Cambridge Certificate of Proficiency in English 2, Cambridge University Press",
        "sections": []
    }
    
    # Part 1: MCQ Cloze
    sec1 = {
        "id": "camcp2-t3-sec-1",
        "title": "Part 1: Multiple-Choice Cloze",
        "instructions": "For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Text 1: Metals</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>It may have been a wish for self-adornment that (1) ______ the interest of Stone Age people in metals. "
            "Sitting by the side of a river, waiting for a fish to come within a spear’s throw, or just (2) ______ away a moment, "
            "one of our early ancestors might have happened upon a shiny yellow pebble and plucked it off the river (3) ______ . "
            "It did not have the feel of stone, but it was attractive. In such a way, one could (4) ______ that gold entered the lives of primitive people. "
            "(5) ______ the malleability of the metal, it very soon became a much sought-after material. "
            "Copper may also have been discovered by accident, and once the value of copper tools was realised, "
            "the search for its ores and for ways of getting the copper out of them was (6) ______ with vigour.</p>"
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1 mt-6'>Text 2: St Ives</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>There was silence as we (7) ______ our bags down the winding, cobbled lane that led to the heart of town, "
            "(8) ______ double against the force eight gale and trying in vain to avoid the icy waves that broke over the promenade. "
            "There was no one on the streets and the shutters in every cottage were bolted tight.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t3-rg-1",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part1_qs = [
        ("q-camcp2-t3-1", "Gap (1):", ["A. aroused", "B. enlivened", "C. cultivated", "D. incited"], "A",
         "Đáp án A. Collocation: 'arouse interest' nghĩa là 'khơi dậy sự quan tâm / hứng thú'. Nguyện vọng tự làm đẹp đã khơi dậy sự hứng thú của người thời kỳ đồ đá đối với kim loại. Bẫy: 'enlivened' (làm sống động), 'cultivated' (nuôi dưỡng/trau dồi), 'incited' (kích động bạo lực). Chuyên đề: Collocations — arouse.",
         "wish for self-adornment that aroused the interest", "collocations", "Page 33, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-2", "Gap (2):", ["A. passing", "B. idling", "C. occupying", "D. employing"], "B",
         "Đáp án B. Phrasal verb: 'idle away time/a moment' nghĩa là 'ngồi không phí hoài thời gian / thả trôi khoảnh khắc rảnh rỗi'. Bẫy: 'passing away' (qua đời). 'occupying' (chiếm đóng/bận rộn — không đi với 'away'). 'employing' (sử dụng). Chuyên đề: Phrasal verbs — idle away.",
         "just idling away a moment", "phrasal_verbs", "Page 33, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-3", "Gap (3):", ["A. track", "B. bed", "C. floor", "D. path"], "B",
         "Đáp án B. Collocation: 'river bed' nghĩa là 'lòng sông / đáy sông'. Tổ tiên chúng ta nhặt được hòn đá lấp lánh dưới lòng sông. Bẫy: 'track' (đường ray/dấu vết). 'floor' (sàn nhà/đáy biển — sea floor). 'path' (con đường nhỏ). Chuyên đề: Collocations — river.",
         "plucked it off the river bed", "collocations", "Page 33, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-4", "Gap (4):", ["A. conjecture", "B. disclose", "C. fabricate", "D. prophesy"], "A",
         "Đáp án A. Từ vựng: 'conjecture' (phỏng đoán/đưa ra giả thuyết dựa trên bằng chứng thiếu sót). Bẫy: 'disclose' (tiết lộ bí mật). 'fabricate' (bịa đặt/ngụy tạo giấy tờ). 'prophesy' (tiên tri). Ở đây là sự phỏng đoán lịch sử hợp lý. Chuyên đề: Vocabulary — verbs of thinking.",
         "one could conjecture that gold entered", "vocabulary", "Page 33, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-5", "Gap (5):", ["A. Providing", "B. Thanks", "C. Given", "D. Resulting"], "C",
         "Đáp án C. Giới từ/Từ nối: 'Given' hoạt động như giới từ mang nghĩa 'Xét đến / Nhờ vào việc có sẵn cái gì'. 'Given the malleability...' = Xét đến tính dễ uốn nắn của kim loại... Bẫy: 'Providing' yêu cầu mệnh đề (providing that...). 'Thanks' đi kèm giới từ 'to'. 'Resulting' đi kèm giới từ 'from'. Chuyên đề: Conjunctions — given.",
         "Given the malleability of the metal", "conjunctions", "Page 33, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-6", "Gap (6):", ["A. raced", "B. chased", "C. tracked", "D. pursued"], "D",
         "Đáp án D. Collocation: 'pursue something with vigour' nghĩa là 'theo đuổi cái gì một cách cực kỳ mãnh liệt / mạnh mẽ'. Bẫy: 'raced' (chạy đua). 'chased' (săn đuổi vật lý). 'tracked' (theo dõi dấu vết). Chỉ 'pursue' đi kèm 'with vigour' để mô tả sự nỗ lực nghiên cứu khoa học. Chuyên đề: Collocations — pursue.",
         "getting the copper out of them was pursued with vigour", "collocations", "Page 33, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-7", "Gap (7):", ["A. dragged", "B. hauled", "C. carried", "D. pushed"], "A",
         "Đáp án A. Từ vựng: 'dragged' (kéo lê bước nặng nhọc). Chúng tôi kéo lê hành lý nặng nề dọc con hẻm nhỏ lát đá. Bẫy: 'hauled' (vận chuyển tải trọng lớn bằng xe tải/tàu). 'carried' (mang xách bình thường). 'pushed' (đẩy). 'Dragged' thể hiện chính xác sự mệt mỏi thể chất của du khách dưới trời giông bão. Chuyên đề: Vocabulary — verbs of carrying.",
         "silence as we dragged our bags down", "vocabulary", "Page 58, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-8", "Gap (8):", ["A. bent", "B. stooped", "C. curved", "D. folded"], "B",
         "Đáp án B. Collocation / Cấu trúc miêu tả cơ thể: 'stooped double' hoặc 'bent double' nghĩa là 'gập người lại / khom người xuống' chống lại sức gió bão cấp 8. 'Stooped double' mô tả tư thế khom lưng tự nhiên và học thuật hơn. Chuyên đề: Collocations — body postures.",
         "stooped double against the force eight", "collocations", "Page 58, Test 3, Cambridge CPE 2")
    ]
    
    for q in part1_qs:
        sec1["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec1)
    
    # Part 2: Open Cloze
    sec2 = {
        "id": "camcp2-t3-sec-2",
        "title": "Part 2: Open Cloze",
        "instructions": "For questions 9-16, read the text below and think of the word which best fits each space. Use only one word in each space.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Water on the Moon</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>As a (0) <b>result</b> of the recent discovery of lunar water, the moon has suddenly become a far more interesting place for investors, (9) ______ must now view the long-term prospects with optimism. "
            "The last manned mission to the moon drew (10) ______ a close in 1973, (11) ______ two astronauts from Apollo 17 climbed back into their lunar module, (12) ______ collected a lot of moonrock, but bereft (13) ______ any future plans. "
            "Now the moon shines brighter for astronauts and scientists alike, (14) ______ to the existence of (15) ______ might be billions of tonnes of water at (16) ______ poles.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t3-rg-2",
            "instruction": "Write the correct word in each gap in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part2_qs = [
        ("q-camcp2-t3-9", "Gap (9):", "who", ["who"],
         "Đáp án: WHO. Đại từ quan hệ chỉ người làm chủ ngữ thế mạng cho danh từ 'investors': 'investors, who must now...' (các nhà đầu tư, những người mà giờ đây phải...). Chuyên đề: Relative clauses — who.",
         "place for investors, who must now view", "relative_clauses", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-10", "Gap (10):", "to", ["to"],
         "Đáp án: TO. Cấu trúc cụm động từ cố định: 'draw to a close' = 'đi vào giai đoạn kết thúc / khép lại'. Misión hạ cánh cuối cùng đã khép lại vào năm 1973. Chuyên đề: Fixed expressions — draw to a close.",
         "manned mission to the moon drew to a close", "fixed_expressions", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-11", "Gap (11):", "when", ["when"],
         "Đáp án: WHEN. Trạng từ quan hệ chỉ thời gian mở đầu mệnh đề trạng ngữ: 'in 1973, when two astronauts...' (vào năm 1973, khi mà hai phi hành gia...). Chuyên đề: Relative clauses — when.",
         "close in 1973, when two astronauts from", "relative_clauses", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-12", "Gap (12):", "having", ["having"],
         "Đáp án: HAVING. Phân từ hoàn thành rút gọn: 'having collected a lot...' = sau khi đã thu thập được nhiều đá mặt trăng. Cấu trúc rút gọn đồng chủ ngữ dạng hoàn thành 'having + past participle' nhấn mạnh hành động hoàn thành trước khi trèo vào khoang module. Chuyên đề: Grammar — Participle clauses.",
         "climbed back into their lunar module, having collected a lot", "grammar_patterns", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-13", "Gap (13):", "of", ["of"],
         "Đáp án: OF. Giới từ đi kèm tính từ: 'bereft of something' = 'thiếu thốn/mất đi cái gì'. Ở đây là 'hoàn toàn thiếu vắng bất kỳ kế hoạch tương lai nào'. Chuyên đề: Dependent prepositions — bereft of.",
         "collected a lot of moonrock, but bereft of any future", "prepositions", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-14", "Gap (14):", "thanks", ["thanks", "due", "owing"],
         "Đáp án: THANKS (hoặc DUE/OWING). Liên từ chỉ nguyên nhân đi kèm giới từ 'to': 'thanks to' = nhờ vào. 'due to / owing to' = bởi vì. Chuyên đề: Conjunctions — cause and effect.",
         "shines brighter for astronauts and scientists alike, thanks to the existence", "conjunctions", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-15", "Gap (15):", "what", ["what"],
         "Đáp án: WHAT. Đại từ quan hệ danh từ mở đầu mệnh đề làm tân ngữ: 'existence of what might be...' (sự tồn tại của cái mà có thể là hàng tỷ tấn nước...). Chuyên đề: Nominal clauses — nominal relative what.",
         "existence of what might be billions of tonnes", "grammar_patterns", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-16", "Gap (16):", "its", ["its", "the"],
         "Đáp án: ITS (hoặc THE). Từ hạn định chỉ sở hữu: 'at its poles' (tại các cực của nó - tức là các cực của mặt trăng). Chuyên đề: Determiners — possessive adjectives.",
         "billions of tonnes of water at its poles", "determiners", "Page 45, Test 3, Cambridge CPE 2")
    ]
    
    for q in part2_qs:
        sec2["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec2)
    
    # Part 3: Word Formation
    sec3 = {
        "id": "camcp2-t3-sec-3",
        "title": "Part 3: Word Formation",
        "instructions": "For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the space in the same line.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Anthropology</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>One of the most (0) <b>challenging</b> [CHALLENGE] aspects of the science of anthropology comes from its fieldwork. "
            "Certainly, in its (17) ______ [INFANT] as a profession, anthropology was distinguished by its concentration on so-called \"primitive societies\" "
            "in which social (18) ______ [INSTITUTE] appeared to be fairly limited and social interaction to be conducted almost (19) ______ [EXCLUDE] face-to-face. "
            "Such societies, it was felt, provided anthropologists with a valuable (20) ______ [SEE] into the workings of society that contrasted with the many complexities of more highly developed societies. "
            "There was also a sense that the ways of life represented by these smaller societies were rapidly (21) ______ [APPEAR] and that preserving a record of them was a matter of some urgency. "
            "The (22) ______ [COMMIT] of anthropologists to the first-hand collection of data led them to some of the most (23) ______ [ACCESS] places on earth. "
            "Most often they worked alone. Such lack of contact with other people created feelings of intense (24) ______ [LONELY] in some anthropologists.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t3-rg-3",
            "instruction": "Write your answers in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part3_qs = [
        ("q-camcp2-t3-17", "Gap (17):", "infancy", ["infancy"],
         "Đáp án: INFANCY. Danh từ trừu tượng chỉ thời kỳ sơ khai: 'in its infancy' = thuở còn sơ khai/trứng nước. Từ gốc INFANT (trẻ sơ sinh) -> infancy (giai đoạn sơ sinh / thuở sơ khai). Chuyên đề: Word formation — nouns.",
         "in its infancy as a profession", "word_formation", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-18", "Gap (18):", "institutions", ["institutions"],
         "Đáp án: INSTITUTIONS. Cần danh từ số nhiều làm chủ ngữ cho mệnh đề 'appeared to be...'. Từ gốc INSTITUTE (viện/thành lập) -> institution (thể chế/tổ chức) -> institutions (các thể chế xã hội). Chuyên đề: Word formation — nouns.",
         "in which social institutions appeared to be", "word_formation", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-19", "Gap (19):", "exclusively", ["exclusively"],
         "Đáp án: EXCLUSIVELY. Cần trạng từ bổ nghĩa cho cụm giới từ trạng ngữ 'face-to-face'. Từ gốc EXCLUDE (loại trừ) -> exclusive (độc quyền/duy nhất) -> exclusively (một cách duy nhất/hoàn toàn). Chuyên đề: Word formation — adverbs.",
         "interaction to be conducted almost exclusively face-to-face", "word_formation", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-20", "Gap (20):", "insight", ["insight"],
         "Đáp án: INSIGHT. Cần danh từ đứng sau mạo từ và tính từ 'a valuable...'. Từ gốc SEE (nhìn) -> sight (tầm nhìn) -> insight (sự thấu suốt / cái nhìn sâu sắc). Chuyên đề: Word formation — nouns.",
         "provided anthropologists with a valuable insight into", "word_formation", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-21", "Gap (21):", "disappearing", ["disappearing"],
         "Đáp án: DISAPPEARING. Cần động từ phân từ dạng chủ động đứng sau cấu trúc tiếp diễn 'were rapidly...'. Từ gốc APPEAR (xuất hiện) -> disappear (biến mất — thêm tiền tố dis-) -> disappearing. Chuyên đề: Word formation — verbs.",
         "smaller societies were rapidly disappearing and that", "word_formation", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-22", "Gap (22):", "commitment", ["commitment"],
         "Đáp án: COMMITMENT. Cần danh từ làm chủ ngữ trong cụm 'The [noun] of...'. Từ gốc COMMIT (cam kết) -> commitment (sự cam kết / cống hiến hết mình). Chuyên đề: Word formation — nouns.",
         "The commitment of anthropologists to the", "word_formation", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-23", "Gap (23):", "inaccessible", ["inaccessible"],
         "Đáp án: INACCESSIBLE. Cần tính từ bổ nghĩa đứng trước danh từ 'places'. Từ gốc ACCESS (tiếp cận) -> accessible (có thể tiếp cận) -> inaccessible (không thể tiếp cận / hiểm trở hẻo lánh — thêm tiền tố in-). Chuyên đề: Word formation — prefixes.",
         "some of the most inaccessible places on earth", "word_formation", "Page 45, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-24", "Gap (24):", "loneliness", ["loneliness"],
         "Đáp án: LONELINESS. Cần danh từ đứng sau tính từ bổ nghĩa 'intense'. Từ gốc LONELY (cô đơn) -> loneliness (sự cô đơn/hiu quạnh). Chuyên đề: Word formation — nouns.",
         "created feelings of intense loneliness in some", "word_formation", "Page 45, Test 3, Cambridge CPE 2")
    ]
    
    for q in part3_qs:
        sec3["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec3)
    
    # Part 4: Key Word Transformation
    sec4 = {
        "id": "camcp2-t3-sec-4",
        "title": "Part 4: Key Word Transformation",
        "instructions": "For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and eight words, including the word given.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Key Word Transformation</h2>"
            "<div class='mb-4 text-slate-800 text-base leading-relaxed'>"
            "<p class='mb-2'><b>25.</b> We were completely surprised by the news of her sudden departure. (ABACK)</p>"
            "<p class='mb-2'>We ______ the news of her sudden departure.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>26.</b> The audience clapped loudly for the performance at the end of the show. (OVATION)</p>"
            "<p class='mb-2'>The performers ______ by the audience at the end of the show.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>27.</b> I will attend the meeting, even if I have to stay up very late. (MATTER)</p>"
            "<p class='mb-2'>I will attend the meeting, no ______ it is.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>28.</b> It was clear that we didn't know what was happening during the crisis. (IDEA)</p>"
            "<p class='mb-2'>It was clear that we ______ what was happening during the crisis.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>29.</b> I joined the club five years ago, and I am still an active member. (SINCE)</p>"
            "<p class='mb-2'>It is five years ______ the club.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>30.</b> There is a very small chance that I will get the promotion this year. (LIKELIHOOD)</p>"
            "<p class='mb-2'>There is very ______ my getting the promotion this year.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t3-rg-4",
            "instruction": "Write the missing words only.",
            "questions": []
        }]
    }
    
    part4_qs = [
        ("q-camcp2-t3-25", "Sentence 25: We ______ the news of her sudden departure. (Key word: ABACK)",
         "were completely taken aback by",
         ["were completely taken aback by", "were taken aback by", "were completely taken aback at", "were taken aback at"],
         "Đáp án: 'were completely taken aback by'. Idiom/Phrasal verb ở dạng bị động: 'be taken aback by/at something' = 'bị làm cho sửng sốt / ngạc nhiên tột độ bởi cái gì'. 'completely' là trạng từ nhấn mạnh đứng trước phân từ. Chuyên đề: Idioms — take aback.",
         "were completely taken aback by the news", "idioms", "Page 47, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-26", "Sentence 26: The performers ______ by the audience at the end of the show. (Key word: OVATION)",
         "were given a standing ovation",
         ["were given a standing ovation"],
         "Đáp án: 'were given a standing ovation'. Cấu trúc bị động với cụm từ cố định: 'give someone a standing ovation' = 'nhiệt liệt đứng dậy vỗ tay tán thưởng ai'. Dạng bị động: 'be given a standing ovation'. Chuyên đề: Collocations — ovation.",
         "were given a standing ovation by the", "collocations", "Page 47, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-27", "Sentence 27: I will attend the meeting, no ______ it is. (Key word: MATTER)",
         "matter how late",
         ["matter how late"],
         "Đáp án: 'matter how late'. Liên từ nhượng bộ: 'no matter how + adjective/adverb' = 'dù ... thế nào đi nữa'. 'no matter how late it is' = dù nó có muộn thế nào đi nữa. Chuyên đề: Conjunctions — no matter.",
         "no matter how late it is", "conjunctions", "Page 47, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-28", "Sentence 28: It was clear that we ______ what was happening during the crisis. (Key word: IDEA)",
         "had no idea of",
         ["had no idea of", "had no idea", "had absolutely no idea of"],
         "Đáp án: 'had no idea of' (hoặc 'had no idea'). Cấu trúc thành ngữ: 'have no idea of/about something' = 'hoàn toàn không biết / không có khái niệm gì về cái gì'. Thay thế cho 'didn't know'. Chuyên đề: Idioms — have no idea.",
         "had no idea of what was going", "idioms", "Page 47, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-29", "Sentence 29: It is five years ______ the club. (Key word: SINCE)",
         "since I joined",
         ["since I joined", "since I first joined", "since I became a member of"],
         "Đáp án: 'since I joined'. Cấu trúc chỉ khoảng thời gian kéo dài: 'It is + time period + since + clause (past simple)'. 'Đã được 5 năm kể từ khi tôi gia nhập câu lạc bộ'. Chuyên đề: Grammar — since clauses.",
         "since I joined the club", "grammar_patterns", "Page 47, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-30", "Sentence 30: There is very ______ my getting the promotion this year. (Key word: LIKELIHOOD)",
         "little likelihood of",
         ["little likelihood of"],
         "Đáp án: 'little likelihood of'. Cấu trúc chỉ xác suất: 'There is little likelihood of + V-ing' = 'Có rất ít khả năng xảy ra việc gì'. Danh từ 'likelihood' đi với giới từ 'of'. Chuyên đề: Grammar — probability structures.",
         "little likelihood of my getting the", "grammar_patterns", "Page 47, Test 3, Cambridge CPE 2")
    ]
    
    for q in part4_qs:
        sec4["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec4)
    
    # Part 5: Multiple Choice Reading
    sec5 = {
        "id": "camcp2-t3-sec-5",
        "title": "Part 5: Multiple Choice",
        "instructions": "For questions 31-36, read the text below and choose the answer (A, B, C or D) which you think fits best according to the text.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Concept of time</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>How did different cultures historical structure their perception of time?</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The measurement of time has always been a fundamental human need, yet the way we perceive it has changed dramatically across history. "
            "For early agricultural societies, time was cyclical, governed by the natural rhythms of the seasons, the solar cycle, and the rising and falling of rivers. "
            "This natural clock dictated the planting and harvesting of crops, and life was structured around these recurring patterns. "
            "There was no concept of the precise, linear hours that dictate modern industrial society. "
            "Time was experienced as a continuous, repeating loop, rather than a scarce commodity slipping away.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The invention of the mechanical clock in the late medieval period marked a crucial transition. "
            "For the first time, time was decoupled from the natural world. It was divided into abstract, identical units — hours, minutes, and seconds — that could be measured regardless of the sun's position. "
            "This new precision was essential for coordinating the complex activities of growing cities and, later, the synchronized labor of the factory system. "
            "However, this mechanization of time also introduced a profound sense of anxiety. "
            "Time became something that could be spent, wasted, or saved, leading to the modern obsession with efficiency and time management.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t3-rg-5",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part5_qs = [
        ("q-camcp2-t3-31", "According to the first paragraph, early agricultural societies viewed time as",
         ["A. a precious resource that must be managed.",
          "B. a linear sequence of non-repeating events.",
          "C. a repeating cycle governed by nature.",
          "D. an abstract concept impossible to measure."], "C",
         "Đáp án C. Đoạn 1 viết: 'time was cyclical, governed by the natural rhythms of the seasons... continuous, repeating loop' (thì thời gian có tính chu kỳ, được cai trị bởi nhịp điệu tự nhiên của mùa màng... vòng lặp lặp đi lặp lại liên tục). Chuyên đề: Reading Comprehension.",
         "time was cyclical, governed by the natural rhythms", "Page 37, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-32", "The writer suggests that the concept of 'linear hours' was",
         ["A. essential for early agricultural societies.",
          "B. introduced during the late industrial revolution.",
          "C. non-existent in early farming cultures.",
          "D. rejected by medieval clockmakers."], "C",
         "Đáp án C. Đoạn 1 nêu rõ: 'There was no concept of the precise, linear hours that dictate modern industrial society' (Hoàn toàn không có khái niệm về những giờ tuyến tính chính xác mà đang ngự trị xã hội công nghiệp hiện đại). Như vậy khái niệm này hoàn toàn không tồn tại ở các nền văn hóa nông nghiệp sớm (non-existent). Chuyên đề: Reading Comprehension.",
         "no concept of the precise, linear hours", "Page 37, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-33", "The key transition marked by the invention of the mechanical clock was that",
         ["A. time became harder to measure accurately.",
          "B. time was separated from natural phenomena.",
          "C. cities became less coordinated.",
          "D. workers refused to work fixed hours."], "B",
         "Đáp án B. Đoạn 2 giải thích: 'For the first time, time was decoupled from the natural world' (Lần đầu tiên, thời gian được ngắt kết nối/chia tách khỏi thế giới tự nhiên). Chuyên đề: Reading Comprehension.",
         "time was decoupled from the natural world", "Page 37, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-34", "What did the mechanization of time introduce to human society?",
         ["A. A greater appreciation for natural cycles.",
          "B. Increased leisure time for workers.",
          "C. A persistent feeling of anxiety.",
          "D. The decline of urban centers."], "C",
         "Đáp án C. Đoạn 2 chỉ ra: 'this mechanization of time also introduced a profound sense of anxiety' (sự cơ giới hóa thời gian này cũng giới thiệu một cảm giác lo âu sâu sắc). Chuyên đề: Reading Comprehension.",
         "mechanization of time also introduced a profound sense of anxiety", "Page 37, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-35", "Which phrase from the text describes time as something we can exhaust?",
         ["A. 'continuous, repeating loop'",
          "B. 'decoupled from the natural world'",
          "C. 'spent, wasted, or saved'",
          "D. 'scarce commodity slipping away'"], "C",
         "Đáp án C. Tác giả viết: 'Time became something that could be spent, wasted, or saved' (Thời gian trở thành thứ có thể tiêu dùng, lãng phí hoặc tiết kiệm — tức là có thể cạn kiệt/exhaust). Chuyên đề: Vocabulary — text scanning.",
         "spent, wasted, or saved", "Page 37, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-36", "The author's primary goal in this passage is to",
         ["A. argue for a return to agricultural cycles.",
          "B. explain the history of mechanical watches.",
          "C. analyze how our view of time has changed.",
          "D. criticize the modern obsession with efficiency."], "C",
         "Đáp án C. Mục tiêu chính của tác giả là phân tích sự thay đổi trong cách nhận thức về thời gian từ chu kỳ tự nhiên nông nghiệp sang cơ giới hóa công nghiệp (analyze how our view of time has changed). Chuyên đề: Reading Comprehension.",
         "primary goal is to analyze the shift in time perception", "Page 37, Test 3, Cambridge CPE 2")
    ]
    
    for q in part5_qs:
        sec5["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "reading_comprehension",
            "source": q[6]
        })
    test_data["sections"].append(sec5)
    
    # Part 6: Gapped Text
    sec6 = {
        "id": "camcp2-t3-sec-6",
        "title": "Part 6: Gapped Text",
        "instructions": "For questions 37-43, read the text below. Seven paragraphs have been removed from the extract. Choose from the paragraphs A-H the one which fits each gap. There is one extra paragraph which you do not need to use.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Psychology of Wilderness</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Why deep immersion in nature has become essential for cognitive restoration.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>In our highly urbanized, digitally saturated lives, we are constantly forced to employ 'directed attention.' "
            "This active, focused attention — required to navigate busy streets, read emails, and complete tasks — is a finite cognitive resource. "
            "Over time, its constant depletion leads to mental fatigue, irritability, and decreased problem-solving capacity. "
            "Environmental psychologists are discovering that the perfect antidote to this state is deep immersion in the wilderness.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 37 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Unlike the harsh, demanding stimuli of the city — which require instant cognitive processing — the natural world offers what psychologists call 'soft fascination.' "
            "The gentle movement of clouds, the patterns of light on leaves, the sound of wind — these stimuli capture our attention effortlessly. "
            "This soft fascination allows our directed attention systems to rest and recover, restoring our cognitive reserves.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 38 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>This restoration is particularly dramatic during extended multi-day wilderness trips. "
            "Removed from the constant pings of smartphones and the stress of deadlines, the brain undergoes a profound shift. "
            "Studies show that after three days in nature, participants perform fifty percent better on creative problem-solving tests. "
            "This 'three-day effect' represents a complete cognitive reset.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 39 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Moreover, the benefits are not just cognitive, but deeply emotional and physiological. "
            "Immersion in forest environments — a practice known as *shinrin-yoku* or forest bathing in Japan — significantly lowers cortisol levels, blood pressure, and heart rate variability. "
            "Nature physically calms our nervous systems, defusing the constant fight-or-flight response of modern life.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 40 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Yet, access to these remote sanctuaries is increasingly difficult. "
            "As cities expand and wild spaces shrink, the opportunities for deep wilderness immersion are declining. "
            "This has led to the concept of 'nature deficit disorder,' particularly in children, who are spending less time outdoors than any generation in history.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 41 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>To counter this, forward-thinking urban planners are attempting to integrate natural elements into the urban fabric itself. "
            "By creating pocket parks, planting dense urban forests, and constructing green roofs, they hope to bring a fragment of the wilderness to the city dweller. "
            "These 'micro-doses' of nature, while not as effective as deep immersion, still offer significant cognitive benefits.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 42 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Of course, these urban interventions cannot completely replace the experience of the true wild. "
            "A pocket park cannot offer the silence, scale, and complexity of an ancient forest. But they are a crucial starting point. "
            "They remind us of our evolutionary connection to the organic world.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 43 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Ultimately, protecting our wild spaces is not just an ecological or ethical duty, but a public health necessity. "
            "By preserving the wilderness, we are preserving the very sanctuaries that allow us to remain sane, creative, and fully human in an increasingly artificial world.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t3-rg-6",
            "instruction": "Match the correct paragraph (A-H) to each gap (37-43). Paragraphs are provided below.",
            "questions": []
        }]
    }
    
    sec6_paragraphs = (
        "### Paragraph Options\n\n"
        "**A.** This physiological calming effect is tied to the presence of phytoncides — organic compounds released by trees to protect themselves from insects. "
        "When humans inhale these compounds, it boosts our immune system's natural killer cells.\n\n"
        "**B.** The mechanism behind this cognitive recovery is explained by Attention Restoration Theory (ART). "
        "According to ART, nature does not make demands on our top-down, executive attention networks.\n\n"
        "**C.** This separation is not just physical but digital. "
        "A true cognitive reset requires a complete disconnect from our communications networks, allowing the mind to wander without constant disruption.\n\n"
        "**D.** To solve this crisis, we must rethink our relationship with urban design. "
        "We must build cities that prioritize green spaces and pedestrian pathways, making nature an daily expectation rather than an occasional weekend excursion.\n\n"
        "**E.** These cognitive micro-doses are particularly crucial in school environments. "
        "Studies show that children who have views of green spaces from their classrooms perform better on tests and display lower stress levels.\n\n"
        "**F.** The transition back to the city after such trips can be jarring, highlighting the sensory assault of modern urban life. "
        "It forces us to realize just how unnatural our daily environments have become.\n\n"
        "**G.** Underneath this scientific validation, there is an ancient intuitive truth. "
        "Throughout history, thinkers, artists, and writers have sought out wild spaces as a source of creative inspiration and spiritual renewal.\n\n"
        "**H.** This lack of exposure to the organic world is linked to higher rates of depression, anxiety, and attention disorders in urban children. "
        "The consequences for their development are profound."
    )
    sec6["passageHtml"] += f"<hr class='my-6 border-emerald-100'/>{sec6_paragraphs}"
    
    part6_qs = [
        ("q-camcp2-t3-37", "Gap 37:", "G", "G", "Đáp án G. Paragraph G giới thiệu sự thật trực giác cổ xưa về việc các nhà tư tưởng, nghệ sĩ tìm kiếm thiên nhiên hoang dã để phục hồi sáng tạo, nối tiếp tự nhiên cho ý niệm phục hồi nhận thức ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "G", "Page 36, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-38", "Gap 38:", "B", "B", "Đáp án B. Paragraph B giải thích cơ chế phục hồi nhận thức thông qua Thuyết Phục Hồi Sự Chú Ý (ART), làm rõ cho thuật ngữ 'soft fascination' ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "B", "Page 36, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-39", "Gap 39:", "C", "C", "Đáp án C. Paragraph C nhấn mạnh việc ngắt kết nối kỹ thuật số (digital disconnect) như điều kiện tiên quyết cho việc thiết lập lại nhận thức 3 ngày ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "C", "Page 36, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-40", "Gap 40:", "A", "A", "Đáp án A. Paragraph A giải thích cơ chế sinh lý của tắm rừng (forest bathing) thông qua chất phytoncides, nối tiếp trực tiếp cho thuật ngữ *shinrin-yoku* ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "A", "Page 36, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-41", "Gap 41:", "H", "H", "Đáp án H. Paragraph H bổ sung các tác động tiêu cực của 'nature deficit disorder' đối với trẻ em thành phố được giới thiệu ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "H", "Page 36, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-42", "Gap 42:", "E", "E", "Đáp án E. Paragraph E nói về tác dụng của liều vi lượng thiên nhiên (micro-doses) trong trường học, làm rõ cho thuật ngữ 'micro-doses' ở cuối đoạn trước. Chuyên đề: Cohesion & Coherence.", "E", "Page 36, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-43", "Gap 43:", "D", "D", "Đáp án D. Paragraph D nhấn mạnh tầm quan trọng của việc tái cấu trúc thiết kế đô thị để đưa thiên nhiên hoang dã vào cuộc sống hàng ngày. Chuyên đề: Cohesion & Coherence.", "D", "Page 36, Test 3, Cambridge CPE 2")
    ]
    
    for q in part6_qs:
        sec6["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gapped_text",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "cohesion_coherence",
            "source": q[6]
        })
    test_data["sections"].append(sec6)
    
    # Part 7: Multiple Matching
    sec7 = {
        "id": "camcp2-t3-sec-7",
        "title": "Part 7: Multiple Matching",
        "instructions": "For questions 44-53, read the five academic perspectives on artificial intelligence below and choose the correct perspective (A-E) which fits each statement.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Philosophy of Artificial Intelligence</h2>"
            "<div class='mb-6 text-slate-800 text-base leading-relaxed text-left'>"
            "<p class='mb-4'><b>A. Prof. Douglas Hofstadter (Cognitive Scientist)</b><br>"
            "The current excitement over Large Language Models (LLMs) is misplaced. "
            "These systems do not 'think' or understand; they perform sophisticated pattern matching. "
            "They are statistical parrots, chewing up vast libraries of human text and spitting out plausible combinations. "
            "True consciousness requires an inner world of meaning, a self-referential loop of semantic understanding that is entirely absent in neural networks. "
            "An LLM does not know what a 'dog' is; it only knows that the word 'dog' frequently co-occurs with 'bark' and 'fur'. "
            "Confusing this syntax-level processing with semantic comprehension is a fundamental category error.</p>"
            "<p class='mb-4'><b>B. Dr. Yann LeCun (AI Pioneer)</b><br>"
            "While LLMs have clear limitations, Hofstadter's critique is too dismissive of the profound emergent properties of scale. "
            "Intelligence is not a binary, magical switch; it is a spectrum. As neural networks grow, they build abstract internal models of the world. "
            "To say they only perform statistical association ignores how human brains themselves operate on neural networks. "
            "Furthermore, current architectures are just the first step. "
            "By integrating autoregressive models with world models and planning modules, we are paving the path to Artificial General Intelligence (AGI). "
            "Dismissing these systems as parrots is a failure to see the rapid trajectory of the science.</p>"
            "<p class='mb-4'><b>C. Raymond Vance (Philosopher of Mind)</b><br>"
            "The debate often overlooks the question of embodiment. "
            "A mind cannot exist as a disembodied computer program. Consciousness is fundamentally rooted in physical presence and material interaction with the world. "
            "Our cognitive processes are shaped by our physical limitations, our sensory organs, and our biological needs. "
            "An AI that has never felt hunger, pain, or the physical resistance of a material object cannot have a mind. "
            "It lives in a sensory vacuum. Without embodiment, there is no place for genuine meaning to land; "
            "the system is merely a symbol manipulator, entirely alienated from biological reality.</p>"
            "<p class='mb-4'><b>D. Dr. Amara Al-Jamil (Social Ecologist)</b><br>"
            "We must examine the political economy of AI. The tech corporations are constructing a narrative of inevitable, magical AGI to justify their massive resource extraction and consolidate monopolistic power. "
            "This digital colonialism is built on the exploitation of cheap labor in developing nations to label data, and the massive environmental cost of running data centers. "
            "AI is not a neutral scientific pursuit; it is a capitalistic tool designed to automate control, displace labor, and homogenize human culture. "
            "The hype serves to distract us from these immediate material harms, locking us into a corporate-dominated future.</p>"
            "<p class='mb-4'><b>E. Gregory Sterling (AI Governance Expert)</b><br>"
            "Pragmatism must replace both hype and alarmism. AI is a powerful tool already reshaping society, and the focus should be on building safety guardrails and registry systems. "
            "We must distinguish between narrow AI (already in use) and the hypothetical AGI of the future. "
            "Our priority should be addressing algorithmic bias, protecting privacy, and establishing liability rules. "
            "If an AI diagnostic tool makes a mistake, who is responsible? By focusing on these concrete governance challenges, "
            "we can mitigate the immediate risks while steering the technology toward public benefit.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t3-rg-7",
            "instruction": "Identify which perspective (A-E) matches the following statements.",
            "questions": []
        }]
    }
    
    part7_qs = [
        ("q-camcp2-t3-44", "Which perspective suggests that the massive scale of neural networks has led to abstract emergent understanding?", "B", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-45", "Which perspective expresses concern that a mind cannot develop in a sensory vacuum without a physical body?", "C", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-46", "Which perspective argues that the narrative of inevitable AGI is used to consolidate monopoly power and distract from environmental costs?", "D", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-47", "Which perspective asserts that Large Language Models perform syntax processing without any genuine semantic comprehension?", "A", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-48", "Which perspective advocates for concrete legal liability rules and safety guardrails to regulate current AI?", "E", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-49", "Which perspective compares the operation of Large Language Models to the neural network structures of the human brain?", "B", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-50", "Which perspective believes that true consciousness is fundamentally rooted in physical biological needs?", "C", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-51", "Which perspective claims that AI development is a capitalistic tool designed to consolidate corporate digital colonialism?", "D", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-52", "Which perspective emphasizes that we must distinguish between narrow AI and hypothetical future AGI in policy making?", "E", "Page 41, Test 3, Cambridge CPE 2"),
        ("q-camcp2-t3-53", "Which perspective laments that syntax-level pattern matching is falsely conflated with true cognitive understanding?", "A", "Page 41, Test 3, Cambridge CPE 2")
    ]
    
    p7_explanations_t3 = {
        "q-camcp2-t3-44": "Đáp án B. Dr. Yann LeCun chỉ ra: 'profound emergent properties of scale... neural networks grow, they build abstract internal models' (các đặc tính nổi bật sâu sắc của quy mô... mạng thần kinh phát triển tạo mô hình trừu tượng bên trong). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-45": "Đáp án C. Raymond Vance lập luận: 'A mind cannot exist as a disembodied computer program... lives in a sensory vacuum' (Tâm trí không thể tồn tại như chương trình máy tính không có thể xác... sống trong môi trường chân không cảm giác). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-46": "Đáp án D. Dr. Amara Al-Jamil chỉ ra: 'justify their massive resource extraction... consolidate monopolistic power... environmental cost' (biện minh cho khai thác tài nguyên khổng lồ, củng cố quyền lực độc quyền). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-47": "Đáp án A. Prof. Douglas Hofstadter nhận định: 'Confusing this syntax-level processing with semantic comprehension is a fundamental category error' (Nhầm lẫn xử lý cú pháp với hiểu ngữ nghĩa là một lỗi phân loại cơ bản). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-48": "Đáp án E. Gregory Sterling đề nghị: 'establish liability rules... focus should be on building safety guardrails' (thiết lập các quy tắc trách nhiệm pháp lý, xây dựng các rào chắn an toàn). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-49": "Đáp án B. Dr. Yann LeCun viết: 'ignores how human brains themselves operate on neural networks' (bỏ qua việc chính não bộ con người vận hành dựa trên các mạng lưới thần kinh). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-50": "Đáp án C. Raymond Vance khẳng định: 'Consciousness is fundamentally rooted in physical presence and material interaction' (Ý thức bắt nguồn sâu sắc từ sự hiện diện vật chất và tương tác vật lý). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-51": "Đáp án D. Dr. Amara Al-Jamil nhấn mạnh: 'digital colonialism... capitalistic tool designed to automate control' (chủ nghĩa thực dân kỹ thuật số, công cụ tư bản để tự động hóa kiểm soát). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-52": "Đáp án E. Gregory Sterling phân biệt: 'distinguish between narrow AI... and the hypothetical AGI' (phân biệt giữa AI hẹp và AGI giả định). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t3-53": "Đáp án A. Prof. Douglas Hofstadter phê phán: 'These systems do not 'think' or understand; they perform sophisticated pattern matching... statistical parrots' (Những hệ thống này không suy nghĩ hay thấu hiểu, chúng chỉ khớp mẫu tinh vi như vẹt thống kê). Chuyên đề: Reading Comprehension."
    }
    
    for q in part7_qs:
        sec7["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[2],
            "explanation": p7_explanations_t3[q[0]],
            "answerLocation": "Test 3 Part 7 matching",
            "category": "reading_comprehension",
            "source": q[3]
        })
    test_data["sections"].append(sec7)
    
    return test_data

# ==========================================
# TEST 4 DEFINITION
# ==========================================
def build_test4():
    test_data = {
        "id": "camcp2-test4",
        "title": "CPE C2 Proficiency Reading & Use of English - Test 4 (Cambridge CPE 2)",
        "type": "academic",
        "skill": "reading",
        "source": "Cambridge Certificate of Proficiency in English 2, Cambridge University Press",
        "sections": []
    }
    
    # Part 1: MCQ Cloze
    sec1 = {
        "id": "camcp2-t4-sec-1",
        "title": "Part 1: Multiple-Choice Cloze",
        "instructions": "For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Text 1: Surviving in a Foreign Land</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>I have been welcomed warmly. It’s a sociable and well-provisioned base camp in a very, very isolated place. "
            "At any one time, there are some forty odd souls — scientists, students, weathermen, satellite trackers — in a (1) ______ community where everyone mucks (2) ______ . "
            "My school French is proving adequate — just — to (3) ______ , but not to chat or banter. I miss the nuances, and my phrasebook is useless at breakfast. "
            "There is no practical problem for me in this, but initially there was a problem of self-confidence. "
            "I found myself slightly dreading mealtimes. I would (4) ______ , worried about which table to choose, "
            "terrified at the silence which (5) ______ when I spoke, anxious in a way I cannot remember since the first weeks of school. "
            "I still grin inanely, or panic when people talk to me. I suspect the cause of this occasional depression is nothing to do with loss of company or communication; "
            "it’s because I’ve lost the social predominance which my own gift of the gab has always (6) ______ me.</p>"
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1 mt-6'>Text 2: Elliot</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>When I first met Elliot, I was just a young author like any other and he took no notice of me. "
            "He never forgot a face though, and when I met him here or there he shook hands with me cordially, "
            "but showed no desire to (7) ______ our acquaintance; and if I saw him at the opera, say, he being with a person of high rank, he was (8) ______ not to catch sight of me.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t4-rg-1",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part1_qs = [
        ("q-camcp2-t4-1", "Gap (1):", ["A. close-knit", "B. close-fitting", "C. close-run", "D. close-cropped"], "A",
         "Đáp án A. Collocation: 'close-knit community' nghĩa là 'cộng đồng gắn kết chặt chẽ / gắn bó khăng khít'. Bẫy: 'close-fitting' (bó sát người — dùng cho quần áo). 'close-run' (sát sao — dùng cho cuộc đua). 'close-cropped' (cắt ngắn — dùng cho tóc). Chuyên đề: Collocations — community.",
         "base camp... in a close-knit community", "collocations", "Page 52, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-2", "Gap (2):", ["A. about", "B. around", "C. in", "D. up"], "C",
         "Đáp án C. Phrasal verb: 'muck in' nghĩa là 'chia sẻ công việc / cùng nhau chung tay làm lụng, ăn ở bình đẳng'. Ở đây là mọi người cùng làm việc trong cộng đồng khép kín. Bẫy: 'muck about/around' (chơi bời/làm tốn thời gian vô bổ). Chuyên đề: Phrasal verbs — muck in.",
         "community where everyone mucks in", "phrasal_verbs", "Page 52, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-3", "Gap (3):", ["A. articulate", "B. communicate", "C. converse", "D. interpret"], "B",
         "Đáp án B. Từ vựng / Ngữ pháp: 'adequate to communicate' = đủ để giao tiếp cơ bản (nội động từ, tự thân diễn đạt ý cơ bản). Bẫy: 'articulate' (phát âm rõ ràng — ngoại động từ). 'converse' (trò chuyện xã giao — đòi hỏi giới từ 'with'). 'interpret' (phiên dịch). Chỉ 'communicate' mô tả hành động truyền đạt thông tin cơ bản. Chuyên đề: Vocabulary — communication.",
         "French is proving adequate... to communicate", "vocabulary", "Page 52, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-4", "Gap (4):", ["A. bend back", "B. turn back", "C. lean back", "D. hang back"], "D",
         "Đáp án D. Phrasal verb: 'hang back' nghĩa là 'lùi lại phía sau / do dự / ngập ngừng ngượng ngùng'. Tác giả ngập ngừng lùi lại phía sau vì ngượng không dám chọn bàn ăn. Bẫy: 'bend back' (uốn cong về sau). 'turn back' (quay đầu lại). 'lean back' (ngả người ra sau). Chuyên đề: Phrasal verbs — hang back.",
         "I would hang back , worried about", "phrasal_verbs", "Page 52, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-5", "Gap (5):", ["A. dropped", "B. fell", "C. hit", "D. struck"], "B",
         "Đáp án B. Collocation / Động từ miêu tả trạng thái: 'silence fell' nghĩa là 'sự im lặng bao trùm / đổ xuống'. Bẫy: 'silence dropped/hit/struck' đều không phải collocations chuẩn trong tiếng Anh văn học để chỉ sự im lặng đột ngột xuất hiện. Chuyên đề: Collocations — silence.",
         "terrified at the silence which fell when", "collocations", "Page 52, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-6", "Gap (6):", ["A. afforded", "B. empowered", "C. entitled", "D. presented"], "A",
         "Đáp án A. Từ vựng: 'afforded me' nghĩa là 'cung cấp / mang lại cho tôi' (sự ưu thế xã hội). Bẫy: 'empowered' (trao quyền năng). 'entitled' (cho phép ai có quyền lợi làm gì). 'presented' (trình bày). 'Afforded' mang sắc thái trang trọng chỉ việc mang lại lợi ích tự nhiên của 'gift of the gab' (tài ăn nói). Chuyên đề: Vocabulary — verbs of provision.",
         "gab has always afforded me", "vocabulary", "Page 52, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-7", "Gap (7):", ["A. met", "B. saw", "C. ran into", "D. encountered"], "A",
         "Đáp án A. Từ vựng: 'met him' = gặp mặt/chạm trán trực tiếp ở đâu đó. Bẫy: 'ran into' (tình cờ gặp — là phrasal verb, không tự nhiên trong câu ghép trang trọng này). 'encountered' (đối mặt hiểm nguy hoặc gặp ngẫu nhiên). 'saw' (nhìn thấy — không đi kèm bắt tay cordially như động từ 'meet'). Chuyên đề: Vocabulary — social verbs.",
         "and when I met him here or there", "vocabulary", "Page 84, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-8", "Gap (8):", ["A. broaden", "B. widen", "C. extend", "D. expand"], "C",
         "Đáp án C. Collocation: 'extend our acquaintance' nghĩa là 'mở rộng / kéo dài mối quan hệ quen biết' (tiếp tục kết bạn sâu hơn). Bẫy: 'broaden' đi với 'horizon/knowledge'. 'widen' đi với 'road/gap'. 'expand' đi với 'business/influence'. Chuyên đề: Collocations — acquaintance.",
         "desire to extend our acquaintance", "collocations", "Page 84, Test 4, Cambridge CPE 2")
    ]
    
    for q in part1_qs:
        sec1["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec1)
    
    # Part 2: Open Cloze
    sec2 = {
        "id": "camcp2-t4-sec-2",
        "title": "Part 2: Open Cloze",
        "instructions": "For questions 9-16, read the text below and think of the word which best fits each space. Use only one word in each space.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>History of Music</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Lovers of music who are a little rusty (0) <b>when</b> it comes to history shouldn't miss forthcoming issues of this magazine. "
            "In our most ambitious series of articles (9) ______ date, we aim to span the history of western music in (10) ______ entirety. "
            "Obviously, (11) ______ the lack of space at our disposal, we cannot be totally comprehensive (12) ______ we do feel we have a (13) ______ than adequate overview of the socio-cultural context. "
            "If you’re already feeling put (14) ______ by the prospect of a rather dry history lesson, then I must stress how unlike a lesson these articles will be. "
            "(15) ______ the extent to which you might be familiar (16) ______ the historical background, you must read these articles for the insight they give into the music itself.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t4-rg-2",
            "instruction": "Write the correct word in each gap in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part2_qs = [
        ("q-camcp2-t4-9", "Gap (9):", "to", ["to"],
         "Đáp án: TO. Cấu trúc giới từ thời gian: 'to date' nghĩa là 'cho đến nay / tính đến thời điểm hiện tại'. Chuyên đề: Prepositional phrases — to date.",
         "series of articles to date", "prepositional_phrases", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-10", "Gap (10):", "its", ["its"],
         "Đáp án: ITS. Tính từ sở hữu thay thế cho danh từ 'western music': 'in its entirety' = 'trong toàn bộ sự hoàn chỉnh của nó'. Chuyên đề: Determiners — possessives.",
         "western music in its entirety", "determiners", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-11", "Gap (11):", "giving", ["giving", "considering"],
         "Đáp án: GIVING (hoặc CONSIDERING). Cấu trúc phân từ đóng vai trò giới từ chỉ nguyên nhân/sự cân nhắc: 'giving the lack of space' / 'considering the lack of space' = xét đến / cân nhắc việc thiếu không gian. Chuyên đề: Prepositions — participle prepositions.",
         "Obviously, giving the lack of space at", "grammar_patterns", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-12", "Gap (12):", "but", ["but", "yet", "although", "though"],
         "Đáp án: BUT (hoặc YET/ALTHOUGH). Liên từ chỉ sự đối lập: 'không toàn diện, NHƯNG chúng tôi cảm thấy có một cái nhìn đầy đủ'. Chuyên đề: Conjunctions — contrast.",
         "cannot be totally comprehensive but we do feel", "conjunctions", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-13", "Gap (13):", "more", ["more"],
         "Đáp án: MORE. Cấu trúc so sánh hơn nhấn mạnh: 'more than adequate' = 'trên cả mức đầy đủ / cực kỳ đầy đủ'. Chuyên đề: Grammar — comparison.",
         "feel we have a more than adequate overview", "grammar_patterns", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-14", "Gap (14):", "off", ["off"],
         "Đáp án: OFF. Phrasal verb ở dạng bị động: 'be/feel put off by' = 'bị làm cho nản lòng / mất hứng thú bởi'. Chuyên đề: Phrasal verbs — put off.",
         "already feeling put off by the prospect", "phrasal_verbs", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-15", "Gap (15):", "Despite", ["Despite", "Notwithstanding"],
         "Đáp án: DESPITE (hoặc NOTWITHSTANDING). Giới từ chỉ sự nhượng bộ đứng trước cụm danh từ: 'Despite the extent...' = Mặc cho mức độ mà bạn đã quen thuộc... Bẫy: Cần viết hoa chữ đầu vì đứng đầu câu. Chuyên đề: Conjunctions — concession.",
         "Despite the extent to which you might", "conjunctions", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-16", "Gap (16):", "with", ["with"],
         "Đáp án: WITH. Giới từ đi kèm tính từ: 'be familiar with something' = 'quen thuộc / hiểu rõ cái gì'. Chuyên đề: Dependent prepositions — familiar with.",
         "you might be familiar with the historical background", "prepositions", "Page 59, Test 4, Cambridge CPE 2")
    ]
    
    for q in part2_qs:
        sec2["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec2)
    
    # Part 3: Word Formation
    sec3 = {
        "id": "camcp2-t4-sec-3",
        "title": "Part 3: Word Formation",
        "instructions": "For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the space in the same line.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>The Image of Science</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The image that we have of science has (0) <b>undergone</b> [GO] radical change in the last hundred years. "
            "An enormous (17) ______ [TECHNOLOGY] explosion, together with a number of very real (18) ______ [ANXIOUS] about the environment and all the moral and political ramifications of economic growth "
            "have (19) ______ [QUESTION] put science at the centre of public debate. "
            "The twentieth century began with a challenge to the (20) ______ [ASSUME] that human knowledge was approaching completion. "
            "It will come, perhaps, as something of a surprise to all of us to realise that the emergence of this highly (21) ______ [DESTROY] process came both from within and outside science. "
            "New scientific theories (22) ______ [OVERWHELM] reveal the limitations of the old perspective. "
            "We had thought that the world, understood through the medium of rational (23) ______ [BE], was, indeed, the real world. "
            "Now we know that this was no more than a simplification that just happened to work. "
            "We can re-evaluate all knowledge pessimistically and decide that it is eternally fragmentary and full of a vast number of (24) ______ [PERFECTION].</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t4-rg-3",
            "instruction": "Write your answers in CAPITAL LETTERS.",
            "questions": []
        }]
    }
    
    part3_qs = [
        ("q-camcp2-t4-17", "Gap (17):", "technological", ["technological"],
         "Đáp án: TECHNOLOGICAL. Cần tính từ bổ nghĩa cho danh từ 'explosion' đứng sau. Từ gốc TECHNOLOGY (công nghệ) -> technological (thuộc về công nghệ). Chuyên đề: Word formation — adjectives.",
         "enormous technological explosion, together with", "word_formation", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-18", "Gap (18):", "anxieties", ["anxieties"],
         "Đáp án: ANXIETIES. Cần danh từ số nhiều đứng sau cụm định lượng 'a number of very real...'. Từ gốc ANXIOUS (lo âu — tính từ) -> anxiety (sự lo âu) -> anxieties (các mối lo âu/băn khoăn số nhiều). Chuyên đề: Word formation — nouns.",
         "number of very real anxieties about the", "word_formation", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-19", "Gap (19):", "unquestionably", ["unquestionably"],
         "Đáp án: UNQUESTIONABLY. Cần trạng từ bổ nghĩa cho động từ 'put' ở phân từ. Mang nghĩa 'không thể nghi ngờ gì nữa / chắc chắn'. Từ gốc QUESTION (câu hỏi/nghi ngờ) -> questionable (đầy nghi vấn) -> unquestionable (không thể nghi ngờ) -> unquestionably. Chuyên đề: Word formation — adverbs.",
         "economic growth have unquestionably put science", "word_formation", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-20", "Gap (20):", "assumption", ["assumption"],
         "Đáp án: ASSUMPTION. Cần danh từ đứng sau mạo từ 'the' và trước mệnh đề 'that...': 'the assumption that' = giả định rằng. Từ gốc ASSUME (giả định) -> assumption (sự giả định/giả thuyết). Chuyên đề: Word formation — nouns.",
         "challenge to the assumption that human", "word_formation", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-21", "Gap (21):", "destructive", ["destructive"],
         "Đáp án: DESTRUCTIVE. Cần tính từ bổ nghĩa cho danh từ 'process'. Từ gốc DESTROY (phá hủy) -> destruction (sự phá hủy) -> destructive (mang tính phá hủy/tàn phá). Chuyên đề: Word formation — adjectives.",
         "emergence of this highly destructive process", "word_formation", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-22", "Gap (22):", "overwhelmingly", ["overwhelmingly"],
         "Đáp án: OVERWHELMINGLY. Cần trạng từ bổ nghĩa cho động từ 'reveal'. Từ gốc OVERWHELM (áp đảo) -> overwhelming (mang tính áp đảo) -> overwhelmingly (một cách áp đảo/hoàn toàn). Chuyên đề: Word formation — adverbs.",
         "scientific theories overwhelmingly reveal the", "word_formation", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-23", "Gap (23):", "beings", ["beings", "being"],
         "Đáp án: BEINGS (hoặc BEING). Cần danh từ (số nhiều/số ít) sau tính từ 'rational': 'rational beings' = thực thể có lý trí / con người có lý trí. Từ gốc BE -> being (thực thể/sinh vật) -> beings (các thực thể). Chuyên đề: Word formation — nouns.",
         "medium of rational beings , was, indeed", "word_formation", "Page 59, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-24", "Gap (24):", "imperfections", ["imperfections"],
         "Đáp án: IMPERFECTIONS. Cần danh từ số nhiều đứng sau cụm 'a vast number of...'. Từ gốc PERFECTION (sự hoàn hảo) -> imperfection (sự không hoàn hảo) -> imperfections (những khiếm khuyết/điểm chưa hoàn hảo — thêm tiền tố phủ định im-). Chuyên đề: Word formation — prefixes/nouns.",
         "eternally fragmentary and full of a vast number of imperfections", "word_formation", "Page 59, Test 4, Cambridge CPE 2")
    ]
    
    for q in part3_qs:
        sec3["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec3)
    
    # Part 4: Key Word Transformation
    sec4 = {
        "id": "camcp2-t4-sec-4",
        "title": "Part 4: Key Word Transformation",
        "instructions": "For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and eight words, including the word given.",
        "passageHtml": (
            "<h2 class='text-xl font-bold mb-3 text-emerald-800 border-b border-emerald-100 pb-1'>Key Word Transformation</h2>"
            "<div class='mb-4 text-slate-800 text-base leading-relaxed'>"
            "<p class='mb-2'><b>25.</b> I saw Paul's son driving the car at the time of the accident. (DRIVEN)</p>"
            "<p class='mb-2'>I saw the car ______ by Paul's son at the time of the accident.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>26.</b> If Nick hadn't advised me, I would have made a terrible mistake. (FOR)</p>"
            "<p class='mb-2'>Had ______ , I would have made a terrible mistake.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>27.</b> The police never actually accused Michael of the crime. (STAGE)</p>"
            "<p class='mb-2'>At ______ did the police actually accuse Michael of the crime.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>28.</b> It is very difficult to choose between these two excellent candidates. (CHOOSE)</p>"
            "<p class='mb-2'>There is ______ between these two excellent candidates.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>29.</b> You are absolutely forbidden to smoke anywhere in the factory. (BAN)</p>"
            "<p class='mb-2'>There ______ anywhere in the factory.</p>"
            "<hr class='my-3 border-emerald-50'/>"
            "<p class='mb-2'><b>30.</b> Jenny doesn't care whether we go to the theater or the cinema. (DIFFERENCE)</p>"
            "<p class='mb-2'>It ______ whether we go to the theater or the cinema.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t4-rg-4",
            "instruction": "Write the missing words only.",
            "questions": []
        }]
    }
    
    part4_qs = [
        ("q-camcp2-t4-25", "Sentence 25: I saw the car ______ by Paul's son. (Key word: DRIVEN)",
         "being driven",
         ["being driven"],
         "Đáp án: 'being driven'. Cấu trúc bị động của động từ giác quan ở thể tiếp diễn: 'see/hear + object + being + past participle'. Diễn tả hành động đang xảy ra bị bắt gặp. Chuyên đề: Passive patterns — sensory verbs.",
         "I saw the car being driven by Paul's", "grammar_patterns", "Page 61, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-26", "Sentence 26: Had ______ , I would have made a terrible mistake. (Key word: FOR)",
         "it not been for Nick’s advice",
         ["it not been for Nick’s advice", "it not been for Nick’s help"],
         "Đáp án: 'it not been for Nick’s advice'. Cấu trúc câu điều kiện loại 3 đảo ngữ phủ định: 'Had it not been for + noun' = 'Nếu không nhờ vào...'. Thay thế cho mệnh đề 'If Nick hadn't advised me...'. Chuyên đề: Grammar — Inverted conditionals.",
         "Had it not been for Nick’s advice", "grammar_patterns", "Page 61, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-27", "Sentence 27: At ______ did the police actually accuse Michael of the crime. (Key word: STAGE)",
         "no stage",
         ["no stage", "no time", "no point"],
         "Đáp án: 'no stage' (hoặc 'no point/no time'). Cấu trúc đảo ngữ: 'At no stage + auxiliary + subject + verb' = 'Không ở bất kỳ giai đoạn/thời điểm nào...'. Trợ động từ 'did' đảo lên trước chủ ngữ 'the police'. Chuyên đề: Grammar — Inversion.",
         "At no stage did the police actually", "grammar_patterns", "Page 61, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-28", "Sentence 28: There is ______ between these two. (Key word: CHOOSE)",
         "little to choose",
         ["little to choose", "not much to choose", "hardly anything to choose"],
         "Đáp án: 'little to choose'. Cấu trúc thành ngữ cố định: 'there is little to choose between A and B' = 'hầu như không có sự khác biệt / khó mà chọn lựa giữa A và B vì cả hai đều tốt'. Chuyên đề: Idioms — choose.",
         "There is little to choose between these two", "idioms", "Page 61, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-29", "Sentence 29: There ______ anywhere in the factory. (Key word: BAN)",
         "is a total ban on smoking",
         ["is a total ban on smoking", "is a total ban on you smoking", "is a total ban on your smoking"],
         "Đáp án: 'is a total ban on smoking' (hoặc 'on your/you smoking'). Cấu trúc danh từ đi kèm giới từ: 'ban on something/doing something' = lệnh cấm đối với cái gì. 'total ban' = lệnh cấm toàn diện. Chuyên đề: Dependent prepositions — ban on.",
         "There is a total ban on smoking anywhere", "grammar_patterns", "Page 61, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-30", "Sentence 30: It ______ whether we go. (Key word: DIFFERENCE)",
         "makes no difference to Jenny",
         ["makes no difference to Jenny", "makes not much difference to Jenny", "does not make any difference to Jenny"],
         "Đáp án: 'makes no difference to Jenny'. Cấu trúc thành ngữ: 'make no difference to someone' = 'không tạo ra sự khác biệt nào / không thành vấn đề đối với ai'. Viết lại cho câu 'Jenny doesn't care...'. Chuyên đề: Idioms — difference.",
         "It makes no difference to Jenny whether", "idioms", "Page 61, Test 4, Cambridge CPE 2")
    ]
    
    for q in part4_qs:
        sec4["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gap_fill",
            "instruction": q[1],
            "blankIndex": int(q[0].split('-')[-1]),
            "acceptedAnswers": [[ans, ans.upper()] for ans in q[3]],
            "correctAnswer": q[2],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": q[6],
            "source": q[7]
        })
    test_data["sections"].append(sec4)
    
    # Part 5: Multiple Choice Reading
    sec5 = {
        "id": "camcp2-t4-sec-5",
        "title": "Part 5: Multiple Choice",
        "instructions": "For questions 31-36, read the text below and choose the answer (A, B, C or D) which you think fits best according to the text.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Evolution of Language</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>How did language shape early human societies, and what are its cognitive limits?</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Language is undoubtedly the most powerful tool in the human cognitive arsenal, "
            "yet its evolutionary origin remains a subject of intense academic debate. "
            "Unlike tools or cave paintings, spoken words leave no physical trace in the archaeological record. "
            "Most scientists agree, however, that language did not develop simply as a system for naming objects. "
            "Instead, it evolved as a highly complex social coordination system, essential for bonding large groups, sharing abstract knowledge, and establishing cultural norms. "
            "Without language, the high level of collective intelligence that defines the human species would have been utterly impossible.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Yet, language also imposes cognitive constraints. "
            "The Sapir-Whorf hypothesis, or linguistic relativity, suggests that the structure of a language shapes how its speakers perceive and think about the world. "
            "While the extreme version of this theory — that language entirely determines thought — has been largely discredited, "
            "recent cognitive research confirms that language significantly influences our memory, categorization, and spatial reasoning. "
            "We do not just think and then speak; our very cognitive architecture is continually molded by the linguistic frameworks we employ.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t4-rg-5",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "questions": []
        }]
    }
    
    part5_qs = [
        ("q-camcp2-t4-31", "What does the writer emphasize about language in the first paragraph?",
         ["A. It leaves extensive physical traces in the archaeological record.",
          "B. It is primarily a system for naming objects.",
          "C. It is the foundation of human collective intelligence.",
          "D. Its evolutionary origin has been completely solved."], "C",
         "Đáp án C. Tác giả viết ở cuối đoạn 1: 'Without language, the high level of collective intelligence that defines the human species would have been utterly impossible' (Nếu không có ngôn ngữ, mức độ trí tuệ tập thể cao định nghĩa loài người sẽ hoàn toàn bất khả thi). Điều này khẳng định ngôn ngữ là nền tảng của trí tuệ tập thể (collective intelligence). Chuyên đề: Reading Comprehension.",
         "foundation of human collective intelligence", "Page 56, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-32", "According to the passage, the archaeological record for early language is",
         ["A. rich with physical tools.",
          "B. non-existent for spoken words.",
          "C. full of ancient drawings.",
          "D. highly consistent and detailed."], "B",
         "Đáp án B. Tác giả chỉ ra ở đoạn 1: 'Unlike tools or cave paintings, spoken words leave no physical trace in the archaeological record' (Không giống công cụ hay bích họa hang động, lời nói không để lại bất kỳ dấu vết vật lý nào trong hồ sơ khảo cổ). Chuyên đề: Reading Comprehension.",
         "spoken words leave no physical trace in the archaeological record", "Page 56, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-33", "The extreme version of the Sapir-Whorf hypothesis suggests that",
         ["A. thought is entirely independent of language.",
          "B. language is only used for social bonding.",
          "C. language entirely determines how we think.",
          "D. cognitive architecture is genetically fixed."], "C",
         "Đáp án C. Đoạn 2 giải thích: 'extreme version of this theory — that language entirely determines thought...' (phiên bản cực đoan của thuyết này - rằng ngôn ngữ hoàn toàn quyết định tư duy...). Chuyên đề: Reading Comprehension.",
         "language entirely determines thought", "Page 56, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-34", "What does recent cognitive research confirm about language?",
         ["A. It has no effect on memory or spatial reasoning.",
          "B. It only affects social interactions, not cognition.",
          "C. It significantly influences our cognitive architecture.",
          "D. It is less complex than previously thought."], "C",
         "Đáp án C. Đoạn 2 chỉ rõ: 'recent cognitive research confirms that language significantly influences our memory... cognitive architecture is continually molded' (nghiên cứu nhận thức gần đây xác nhận ngôn ngữ ảnh hưởng đáng kể đến trí nhớ... cấu trúc nhận thức liên tục bị đúc nặn). Chuyên đề: Reading Comprehension.",
         "cognitive architecture is continually molded by the linguistic frameworks", "Page 56, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-35", "Which word is closest in meaning to 'arsenal' as used in the first paragraph?",
         ["A. weapon",
          "B. warehouse",
          "C. collection",
          "D. system"], "C",
         "Đáp án C. Từ vựng: 'arsenal' nghĩa gốc là kho vũ khí, trong bối cảnh tri thức nghĩa là 'bộ sưu tập / kho tàng công cụ sẵn có' (collection of tools/resources). 'cognitive arsenal' = kho tàng công cụ nhận thức. Chuyên đề: Vocabulary — word meaning.",
         "human cognitive arsenal", "Page 56, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-36", "The author's overall purpose in the passage is to",
         ["A. advocate for a new global language.",
          "B. describe the structure of ancient languages.",
          "C. explore the evolutionary and cognitive aspects of language.",
          "D. disprove the linguistic relativity hypothesis."], "C",
         "Đáp án C. Mục đích bao trùm của bài viết là khám phá khía cạnh tiến hóa xã hội và tác động nhận thức của ngôn ngữ đối với con người (explore the evolutionary and cognitive aspects). Chuyên đề: Reading Comprehension.",
         "explore the evolutionary and cognitive aspects", "Page 56, Test 4, Cambridge CPE 2")
    ]
    
    for q in part5_qs:
        sec5["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": "Choose the correct letter, A, B, C or D.",
            "options": q[2],
            "acceptedAnswers": [[q[3].upper(), q[3].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "reading_comprehension",
            "source": q[6]
        })
    test_data["sections"].append(sec5)
    
    # Part 6: Gapped Text
    sec6 = {
        "id": "camcp2-t4-sec-6",
        "title": "Part 6: Gapped Text",
        "instructions": "For questions 37-43, read the text below. Seven paragraphs have been removed from the extract. Choose from the paragraphs A-H the one which fits each gap. There is one extra paragraph which you do not need to use.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Ethics of Algorithmic Curation</h2>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>How social media algorithms are restructuring our public square and cognitive habits.</p>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>In the modern digital landscape, we no longer seek information; information is curated for us. "
            "A complex web of algorithms, running silently in the background, determines what we see, read, and engage with. "
            "While this personalized curation offers convenience, shielding us from information overload, it also presents profound ethical challenges. "
            "By prioritising engagement above all else, these algorithmic gatekeepers are fundamentally restructuring our public discourse.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 37 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The primary mechanism driving this algorithmic design is 'reward optimization.' "
            "To keep users scrolling, algorithms prioritize content that triggers strong emotional reactions — particularly outrage, fear, and tribal solidarity. "
            "This selective amplification of extreme voices has led to a highly polarized public square, where moderate, nuanced debate is effectively drowned out. "
            "We are locked in digital echo chambers, surrounded only by voices that confirm our pre-existing biases.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 38 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>This polarization is not an accidental byproduct; it is a direct consequence of the business model. "
            "Social media platforms profit from our attention, which is packaged and sold to advertisers. "
            "Because outrage is the most effective driver of attention, platforms have a powerful financial incentive to keep us angry and divided. "
            "The commodification of attention has turned our cognitive systems into profit centers.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 39 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>The cognitive consequences are equally severe. Constant exposure to rapid-fire, emotionally charged stimuli trains the brain to seek instant gratification. "
            "Our capacity for deep, slow, contemplative reading is being systematically eroded. "
            "We are becoming experts at scanning and skimming, but struggle to engage with complex, long-form arguments that require sustained intellectual effort.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 40 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Indeed, this cognitive restructuring has birthed what sociologists call 'epistemic alienation.' "
            "We no longer trust traditional sources of authority — science, journalism, academic institutions — because our personalized feeds are flooded with alternative, often conspiratorial narratives. "
            "When everyone is locked in their own customized reality, the possibility of collective, democratic action is profoundly undermined.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 41 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>To counter this, a growing group of activists and programmers is advocating for 'humane technology.' "
            "They are designing alternative, decentralized platforms that prioritize cognitive sovereignty, privacy, and democratic debate over profit. "
            "These platforms replace algorithmic curation with chronological feeds or user-controlled sorting tools, giving individuals agency over their digital diets.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 42 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Of course, these humane alternatives face immense structural challenges. "
            "They must compete with corporate giants equipped with massive network effects and unlimited financial resources. "
            "But they represent a crucial moral resistance, proving that another digital world is possible.</p>"
            "<div class='my-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 text-center font-semibold text-emerald-800'>[ Gap 43 ]</div>"
            "<p class='mb-4 text-slate-800 text-base leading-relaxed'>Ultimately, reclaiming our public square is not just a regulatory or technical challenge, but a civilizational one. "
            "It requires us to value cognitive freedom, democratic consensus, and slow, deliberate attention over the addictive, frictionless convenience of corporate algorithms.</p>"
        ),
        "questionGroups": [{
            "id": "camcp2-t4-rg-6",
            "instruction": "Match the correct paragraph (A-H) to each gap (37-43). Paragraphs are provided below.",
            "questions": []
        }]
    }
    
    sec6_paragraphs = (
        "### Paragraph Options\n\n"
        "**A.** This mental shift is particularly noticeable in educational settings, where teachers report that students are increasingly unable to read full-length novels or follow complex philosophical arguments.\n\n"
        "**B.** The root of this problem lies in the 'attention economy,' where human attention is treated as a scarce commodity to be mined, processed, and monetized by tech monopolies.\n\n"
        "**C.** This democratic paralysis is visible in our inability to tackle existential crises like climate change or pandemics. "
        "When we cannot agree on basic factual reality, we cannot coordinate collective solutions.\n\n"
        "**D.** To break this monopoly, governments must step in with robust antitrust regulations and strict data privacy laws. "
        "We must treat digital platforms as public utilities rather than private advertising boards.\n\n"
        "**E.** These humane design strategies aim to shift technology from a tool of corporate control to a medium for human empowerment, restoring our ability to think and debate collectively.\n\n"
        "**F.** Designing these alternative spaces requires a complete rejection of the optimization-for-engagement paradigm, prioritizing instead the slow, deliberate speed of genuine human conversation.\n\n"
        "**G.** Underneath the surface convenience, a silent crisis is brewing. "
        "By replacing editorial judgment with mathematical optimization, platforms have abdicated their ethical responsibility, unleashing forces of social fragmentation.\n\n"
        "**H.** This psychological cocooning has severe consequences. "
        "When we never encounter opposing viewpoints, we lose the capacity for empathy, treating intellectual disagreement as a moral transgression."
    )
    sec6["passageHtml"] += f"<hr class='my-6 border-emerald-100'/>{sec6_paragraphs}"
    
    part6_qs = [
        ("q-camcp2-t4-37", "Gap 37:", "E", "E", "Đáp án E. Paragraph E nói về tác dụng của thiết kế công nghệ nhân văn để giải phóng sự kiểm soát doanh nghiệp, bổ sung ý nghĩa hoàn hảo cho đoạn trước giới thiệu về những rào cản đạo đức của thuật toán giám sát. Chuyên đề: Cohesion & Coherence.", "E", "Page 55, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-38", "Gap 38:", "C", "C", "Đáp án C. Paragraph C liên kết sự tê liệt dân chủ (democratic paralysis) do không đồng thuận được thực tế khách quan với việc mọi người bị khóa trong các buồng tiếng vang (echo chambers) ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "C", "Page 55, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-39", "Gap 39:", "H", "H", "Đáp án H. Paragraph H chỉ ra tác động tiêu cực của việc kén kén tâm lý (psychological cocooning) khi ta hoàn toàn mất đi sự thấu cảm do không bao giờ chạm trán quan điểm đối lập. Chuyên đề: Cohesion & Coherence.", "H", "Page 55, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-40", "Gap 40:", "B", "B", "Đáp án B. Paragraph B giải thích cơ chế của nền kinh tế chú ý (attention economy), kết nối trực tiếp với đoạn trước bàn luận về sự xói mòn khả năng đọc sâu và sự cám dỗ của kích thích nhanh. Chuyên đề: Cohesion & Coherence.", "B", "Page 55, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-41", "Gap 41:", "G", "G", "Đáp án G. Paragraph G giải thích cuộc khủng hoảng ngầm của việc từ bỏ trách nhiệm biên tập của các nền tảng mạng xã hội, dẫn tới sự tha hóa nhận thức ở đoạn tiếp theo. Chuyên đề: Cohesion & Coherence.", "G", "Page 55, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-42", "Gap 42:", "A", "A", "Đáp án A. Paragraph A chỉ ra sự dịch chuyển tư duy này ở trường học khi học sinh không thể đọc hết tiểu thuyết, minh chứng cụ thể cho sự suy giảm khả năng tập trung sâu ở đoạn trước. Chuyên đề: Cohesion & Coherence.", "A", "Page 55, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-43", "Gap 43:", "D", "D", "Đáp án D. Paragraph D kiến nghị chính phủ cần can thiệp bằng luật chống độc quyền và coi mạng xã hội là tiện ích công cộng để phá vỡ thế độc quyền của Big Tech. Chuyên đề: Cohesion & Coherence.", "D", "Page 55, Test 4, Cambridge CPE 2")
    ]
    
    for q in part6_qs:
        sec6["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "gapped_text",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[3],
            "explanation": q[4],
            "answerLocation": q[5],
            "category": "cohesion_coherence",
            "source": q[6]
        })
    test_data["sections"].append(sec6)
    
    # Part 7: Multiple Matching
    sec7 = {
        "id": "camcp2-t4-sec-7",
        "title": "Part 7: Multiple Matching",
        "instructions": "For questions 44-53, read the five academic perspectives on environmental preservation below and choose the correct perspective (A-E) which fits each statement.",
        "passageHtml": (
            "<h2 class='text-2xl font-bold mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2'>The Ethics of Deep Ecology</h2>"
            "<div class='mb-6 text-slate-800 text-base leading-relaxed text-left'>"
            "<p class='mb-4'><b>A. Prof. Arne Naess (Environmental Philosopher)</b><br>"
            "Traditional environmentalism is shallow. It views nature merely as a resource for human consumption, "
            "and advocates for conservation only to ensure our own long-term survival. "
            "Deep Ecology, by contrast, asserts that all living beings have intrinsic value, entirely independent of their utility to humans. "
            "A mountain, a river, a wolf, a wild flower — these entities have a right to exist and flourish. "
            "We must undergo a profound psychological shift from anthropocentrism (human-centeredness) to ecocentrism. "
            "We are not the masters of the earth; we are a plain member of the biotic community, equal to any other species. "
            "Our interference with the non-human world is excessive and must be rapidly reduced.</p>"
            "<p class='mb-4'><b>B. Dr. Karen Warren (Ecofeminist Scholar)</b><br>"
            "Naess's Deep Ecology, though well-intentioned, fails to recognize that the exploitation of nature is deeply linked to social hierarchies. "
            "We cannot separate environmental destruction from the patriarchal systems of domination. "
            "The same conceptual framework that justifies the oppression of women also justifies the exploitation of the natural world. "
            "An ecological solution that ignores gender, race, and class is a shallow illusion. "
            "Our priority must be dismantling all systems of domination. "
            "An inclusive environmentalism must be built on relationships of care, reciprocity, and social justice, "
            "rather than abstract biological equality.</p>"
            "<p class='mb-4'><b>C. Raymond Vance (Pragmatic Conservationist)</b><br>"
            "The debate between Deep Ecology and social critique misses the immediate practical challenge. "
            "We are in the midst of a biodiversity crisis, and we do not have the time to wait for a global psychological revolution or the total dismantling of capitalism. "
            "We need pragmatic, actionable policies now. "
            "This means working within existing economic frameworks to create carbon markets, fund protected areas, and establish strict environmental laws. "
            "Nature can be valued intrinsically, but using its economic utility is the most effective lever we have to protect it. "
            "Pragmatism must trump ideological purity if we are to prevent mass extinction.</p>"
            "<p class='mb-4'><b>D. Dr. Amara Al-Jamil (Social Ecologist)</b><br>"
            "Naess's ecocentrism is not only impractical but dangerous. By asserting that all species have equal value, "
            "Deep Ecology often slides into a misanthropic narrative that views humans as a cancer on the earth. "
            "This ignores the fact that the vast majority of environmental destruction is driven by a capitalistic elite, "
            "not humanity as a whole. Poor populations in developing nations are the victims of ecological crisis, "
            "not the perpetrators. "
            "We must address the systemic social issues — corporate greed, economic inequality, neo-liberalism — that drive destruction. "
            "An environmentalism that does not prioritize human social justice is morally bankrupt.</p>"
            "<p class='mb-4'><b>E. Gregory Sterling (Global Policy Analyst)</b><br>"
            "We must shift from philosophy to global governance. The real challenge is navigating international treaties and carbon markets. "
            "Environmental preservation requires international consensus, enforceable treaties like the Paris Agreement, and strict registry systems to track carbon offsets. "
            "We must leverage technological solutions — renewable energy, carbon capture, genetic preservation — alongside policy. "
            "By focusing on these pragmatic, institutional structures, we can align national economic interests with global ecological survival, "
            "creating a sustainable future.</p>"
            "</div>"
        ),
        "questionGroups": [{
            "id": "camcp2-t4-rg-7",
            "instruction": "Identify which perspective (A-E) matches the following statements.",
            "questions": []
        }]
    }
    
    part7_qs = [
        ("q-camcp2-t4-44", "Which perspective suggests that all living beings have intrinsic value entirely independent of their utility to humans?", "A", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-45", "Which perspective expresses concern that equal-value ecocentrism can slide into a misanthropic narrative?", "D", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-46", "Which perspective argues that environmental destruction is deeply linked to patriarchal systems of domination?", "B", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-47", "Which perspective asserts that traditional environmentalism is shallow and human-centered?", "A", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-48", "Which perspective advocates for pragmatic economic utility to serve as the primary lever for conservation?", "C", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-49", "Which perspective claims that environmental preservation requires international treaties and carbon offsets?", "E", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-50", "Which perspective believes that we cannot wait for a global psychological revolution to prevent mass extinction?", "C", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-51", "Which perspective asserts that the capitalistic elite is primarily responsible for ecological crises, not humanity as a whole?", "D", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-52", "Which perspective emphasizes that inclusive environmentalism must be built on relationships of care and social justice?", "B", "Page 65, Test 4, Cambridge CPE 2"),
        ("q-camcp2-t4-53", "Which perspective views technological solutions as vital alongside global policy rules?", "E", "Page 65, Test 4, Cambridge CPE 2")
    ]
    
    p7_explanations_t4 = {
        "q-camcp2-t4-44": "Đáp án A. Prof. Arne Naess khẳng định: 'asserts that all living beings have intrinsic value, entirely independent of their utility to humans' (khẳng định mọi sinh vật sống đều có giá trị tự thân, hoàn toàn độc lập với lợi ích đối với con người). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-45": "Đáp án D. Dr. Amara Al-Jamil cảnh báo: 'Deep Ecology often slides into a misanthropic narrative that views humans as a cancer' (Sinh học sâu thường trượt dài vào lời kể mang tính ghét bỏ con người, coi con người là bệnh ung thư của trái đất). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-46": "Đáp án B. Dr. Karen Warren chỉ ra: 'exploitation of nature is deeply linked to social hierarchies... patriarchal systems of domination' (sự khai thác tự nhiên liên kết sâu sắc với tôn ti xã hội... hệ thống thống trị phụ quyền). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-47": "Đáp án A. Prof. Arne Naess nhận xét: 'Traditional environmentalism is shallow. It views nature merely as a resource... anthropocentrism' (Bảo vệ môi trường truyền thống là nông cạn, coi tự nhiên chỉ là tài nguyên, mang tính vị nhân). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-48": "Đáp án C. Raymond Vance lập luận: 'using its economic utility is the most effective lever we have to protect it' (sử dụng tiện ích kinh tế là đòn bẩy hiệu quả nhất chúng ta có để bảo vệ tự nhiên). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-49": "Đáp án E. Gregory Sterling viết: 'preservation requires international consensus, enforceable treaties... track carbon offsets' (bảo tồn đòi hỏi sự đồng thuận quốc tế, các hiệp ước thực thi được và theo dõi bù đắp carbon). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-50": "Đáp án C. Raymond Vance khẳng định: 'do not have the time to wait for a global psychological revolution... Pragmatism must trump ideological purity' (không có thời gian chờ đợi cuộc cách mạng tâm lý toàn cầu... thực dụng phải thắng thế thuần khiết tư tưởng để ngăn chặn tuyệt chủng hàng loạt). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-51": "Đáp án D. Dr. Amara Al-Jamil chỉ rõ: 'destruction is driven by a capitalistic elite, not humanity as a whole' (sự tàn phá được thúc đẩy bởi giới tinh hoa tư bản, không phải toàn thể loài người). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-52": "Đáp án B. Dr. Karen Warren cho rằng: 'inclusive environmentalism must be built on relationships of care, reciprocity, and social justice' (bảo vệ môi trường toàn diện phải dựa trên mối quan hệ chăm sóc, có qua có lại và công bằng xã hội). Chuyên đề: Reading Comprehension.",
        "q-camcp2-t4-53": "Đáp án E. Gregory Sterling nhấn mạnh: 'leveraging technological solutions — renewable energy, carbon capture... alongside policy' (tận dụng giải pháp công nghệ - năng lượng tái tạo, thu hồi carbon... song song với chính sách). Chuyên đề: Reading Comprehension."
    }
    
    for q in part7_qs:
        sec7["questionGroups"][0]["questions"].append({
            "id": q[0],
            "type": "multiple_choice",
            "instruction": q[1],
            "options": ["A", "B", "C", "D", "E"],
            "acceptedAnswers": [[q[2], q[2].lower()]],
            "correctAnswer": q[2],
            "explanation": p7_explanations_t4[q[0]],
            "answerLocation": "Test 4 Part 7 matching",
            "category": "reading_comprehension",
            "source": q[3]
        })
    test_data["sections"].append(sec7)
    
    return test_data

# ==========================================
# MASTER EXECUTION
# ==========================================
if __name__ == "__main__":
    t1 = build_test1()
    save_mock(t1)
    
    t2 = build_test2()
    save_mock(t2)
    
    t3 = build_test3()
    save_mock(t3)
    
    t4 = build_test4()
    save_mock(t4)
    
    print("ALL 4 TESTS GENERATED SUCCESSFULLY!")
