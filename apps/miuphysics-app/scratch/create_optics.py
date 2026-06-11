# -*- coding: utf-8 -*-
import os

target_path = r"C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM\apps\miuphysics-app\public\data\gen_gifted_optics.py"

content = """# -*- coding: utf-8 -*-

gifted_optics_questions = []

# ============================================================
# QUESTION 1: ORTHOGONAL MIRRORS IMAGE COUNT (HỆ GƯƠNG PHẲNG VUÔNG GÓC)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_001",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "mirror_system",
  "topic_vn": "Hệ gương phẳng",
  "type": "multiple_choice",
  "difficulty": "medium",
  "image": "/images/orthogonal_mirrors.svg",
  "question_text": "Hai gương phẳng G1 và G2 đặt vuông góc với nhau tại điểm O, mặt phản xạ quay vào nhau. Một điểm sáng S đặt trong góc tạo bởi hai gương. Hãy xác định số lượng ảnh của điểm sáng S tạo bởi hệ hai gương phẳng này.",
  "question_text_en": "Two plane mirrors M1 and M2 are placed perpendicular to each other at point O, with their reflecting surfaces facing inward. A point light source S is placed in the space between the mirrors. Determine the number of images of S formed by this mirror system.",
  "options": [
    {"key": "A", "content": "2 ảnh", "content_en": "2 images"},
    {"key": "B", "content": "3 ảnh", "content_en": "3 images"},
    {"key": "C", "content": "4 ảnh", "content_en": "4 images"},
    {"key": "D", "content": "Vô số ảnh", "content_en": "Infinite images"}
  ],
  "correct_answer": "B",
  "explanation": {
    "summary": "Áp dụng công thức tính số ảnh tạo bởi hệ gương phẳng đặt nghiêng góc $\\\\alpha$: $N = 360^\\\\circ / \\\\alpha - 1$. Với $\\\\alpha = 90^\\\\circ$, số ảnh thu được là $N = 360/90 - 1 = 3$ ảnh. Các ảnh này gồm: ảnh $S_1$ qua gương 1, ảnh $S_2$ qua gương 2, và ảnh trung gian $S_{12}$ trùng với $S_{21}$ do sự phản xạ liên tiếp.",
    "summary_en": "The formula for the number of images formed by two plane mirrors inclined at an angle $\\\\alpha$ is $N = 360^\\\\circ / \\\\alpha - 1$. For $\\\\alpha = 90^\\\\circ$, the number of images is $N = 360/90 - 1 = 3$. These consist of: image $S_1$ from mirror 1, image $S_2$ from mirror 2, and a coincident overlapping image $S_{12} \\\\equiv S_{21}$ due to double reflection."
  },
  "thinking_guide": {
    "understand": "Xác định số lượng ảnh của một điểm sáng S nằm giữa hai gương phẳng vuông góc.",
    "understandEn": "Determine the number of images of a point source S placed between two perpendicular plane mirrors.",
    "identify_knowledge": "Tính chất tạo ảnh qua gương phẳng. Vẽ ảnh bằng cách lấy đối xứng. Công thức tổng quát cho số ảnh là $N = 360^\\\\circ / \\\\alpha - 1$.",
    "identify_knowledgeEn": "Image formation in plane mirrors. Constructing images by symmetry. General formula $N = 360^\\\\circ / \\\\alpha - 1$.",
    "plan": "Lấy đối xứng điểm S qua mặt phẳng gương G1 để được ảnh thứ nhất $S_1$. Lấy đối xứng S qua gương G2 để được ảnh thứ hai $S_2$. Lấy đối xứng tiếp $S_1$ qua gương G2 để được ảnh thứ ba $S_{12}$. Chứng minh ảnh tiếp theo trùng nhau.",
    "planEn": "Reflect S across G1 to get $S_1$. Reflect S across G2 to get $S_2$. Reflect $S_1$ across G2 to get the third image $S_{12}$. Show that subsequent reflections overlap.",
    "steps": [
      "Bước 1: Vẽ điểm đối xứng $S_1$ của S qua mặt phẳng gương G1. Đây là ảnh ảo thứ nhất.",
      "Bước 2: Vẽ điểm đối xứng $S_2$ của S qua mặt phẳng gương G2. Đây là ảnh ảo thứ hai.",
      "Bước 3: Xem xét phản xạ liên tiếp: lấy đối xứng $S_1$ qua đường kéo dài của gương G2, ta được ảnh $S_{12}$.",
      "Bước 4: Tương tự, lấy đối xứng $S_2$ qua đường kéo dài của gương G1, ta được ảnh $S_{21}$.",
      "Bước 5: Vì hai gương vuông góc, hai điểm $S_{12}$ và $S_{21}$ trùng nhau hoàn toàn tại một vị trí đối xứng qua giao tuyến O. Do đó chỉ tính là 1 ảnh.",
      "Bước 6: Tổng số ảnh phân biệt thu được là $1 + 1 + 1 = 3$ ảnh."
    ],
    "stepsEn": [
      "Step 1: Reflect point S across the plane of mirror G1 to construct the first virtual image $S_1$.",
      "Step 2: Reflect point S across the plane of mirror G2 to construct the second virtual image $S_2$.",
      "Step 3: Consider double reflection: reflect $S_1$ across G2 to get $S_{12}$.",
      "Step 4: Similarly, reflect $S_2$ across G1 to get $S_{21}$.",
      "Step 5: Because the mirrors are perpendicular, $S_{12}$ and $S_{21}$ coincide exactly. This counts as one image.",
      "Step 6: The total number of distinct images is $1 + 1 + 1 = 3$."
    ],
    "verify": "Cả 3 ảnh $S_1, S_2, S_{12}$ cùng với vật S đều nằm trên một đường tròn tâm O bán kính OS. Điều này chứng minh tính đối xứng hình học hoàn hảo.",
    "verifyEn": "All three images and object S lie on a circle centered at O with radius OS, verifying geometric consistency.",
    "extend": "Nếu hai gương song song (góc 0 độ), số ảnh tạo ra sẽ là vô hạn.",
    "extendEn": "If the mirrors are parallel (0 degree angle), an infinite number of images are formed.",
    "common_traps": ["Nhầm lẫn số ảnh là 4 do lấy 360/90 = 4 mà quên trừ đi 1.", "Cho rằng chỉ có 2 ảnh vì chỉ có hai gương."],
    "common_traps_en": ["Thinking there are 4 images because 360/90 = 4 (forgetting to subtract 1).", "Assuming only 2 images are formed because there are only two mirrors."]
  },
  "real_world_connection": "Gương ghép góc 90 độ được sử dụng để mở rộng tối đa tầm nhìn tại các góc cua khuất hoặc gương chiếu hậu an toàn.",
  "real_world_connection_en": "Corner reflectors are used to expand the field of view at blind spots or sharp road bends.",
  "formula": "N = \\\\frac{360^\\\\circ}{\\\\alpha} - 1"
})

# ============================================================
# QUESTION 2: VELOCITY OF IMAGE (VẬN TỐC CỦA ẢNH QUA THẤU KÍNH)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_002",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "image_velocity",
  "topic_vn": "Vận tốc dịch chuyển của ảnh",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "",
  "question_text": "Một thấu kính hội tụ có tiêu cự $f = 20\\,cm$. Một vật sáng phẳng nhỏ AB đặt vuông góc với trục chính của thấu kính ở khoảng cách $d_1 = 30\\,cm$. Cho vật AB chuyển động dọc theo trục chính ra xa thấu kính với vận tốc không đổi $v = 5\\,cm/s$ trong thời gian $2\\,s$. Hãy xác định vận tốc trung bình của ảnh thật trong khoảng thời gian dịch chuyển này.",
  "question_text_en": "A converging lens has a focal length $f = 20\\,cm$. A small object AB is placed perpendicular to the principal axis at a distance $d_1 = 30\\,cm$. The object moves along the principal axis away from the lens at a constant speed of $v = 5\\,cm/s$ for $2\\,s$. Determine the average speed of the real image during this time interval.",
  "options": [
    {"key": "A", "content": "10 cm/s", "content_en": "10 cm/s"},
    {"key": "B", "content": "5 cm/s", "content_en": "5 cm/s"},
    {"key": "C", "content": "15 cm/s", "content_en": "15 cm/s"},
    {"key": "D", "content": "7,5 cm/s", "content_en": "7.5 cm/s"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Vị trí ảnh ban đầu: $1/d'_1 = 1/f - 1/d_1 = 1/20 - 1/30 = 1/60 \\\\Rightarrow d'_1 = 60\\,cm$. Sau $2\\,s$, vật di chuyển ra xa một khoảng $\\\\Delta d = v \\\\cdot t = 5 \\\\times 2 = 10\\,cm \\\\Rightarrow d_2 = 40\\,cm$. Vị trí ảnh lúc sau: $1/d'_2 = 1/f - 1/d_2 = 1/20 - 1/40 = 1/40 \\\\Rightarrow d'_2 = 40\\,cm$. Quãng đường ảnh dịch chuyển: $s' = |d'_1 - d'_2| = 20\\,cm$. Vận tốc trung bình của ảnh: $v' = s'/t = 20 / 2 = 10\\,cm/s$.",
    "summary_en": "Initial image distance: $d'_1 = 60\\,cm$. After $2\\,s$, object shifts by $\\\\Delta d = 10\\,cm \\\\Rightarrow d_2 = 40\\,cm$. New image distance: $d'_2 = 40\\,cm$. Image displacement: $s' = 20\\,cm$. Average image speed: $v' = s'/t = 20 / 2 = 10\\,cm/s$."
  },
  "thinking_guide": {
    "understand": "Tính vận tốc trung bình của ảnh khi vật chuyển động dọc trục chính thấu kính hội tụ trong 2 giây.",
    "understandEn": "Calculate the average speed of the image when the object moves along the principal axis for 2 seconds.",
    "identify_knowledge": "Công thức thấu kính mỏng: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'}$. Định nghĩa vận tốc trung bình: $v_{tb} = s/t$.",
    "identify_knowledgeEn": "Thin lens equation: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'}$. Average speed: $v_{avg} = s/t$.",
    "plan": "Tính $d'_1$. Tìm khoảng cách vật lúc sau $d_2 = 30 + v \\\\cdot t = 40\\,cm$. Tính $d'_2$. Tính quãng đường ảnh dịch chuyển và vận tốc trung bình.",
    "planEn": "Calculate $d'_1$. Find new object distance $d_2 = 40\\,cm$. Calculate $d'_2$. Compute the image displacement and average speed.",
    "steps": [
      "Bước 1: Tính vị trí ảnh lúc đầu: $\\\\frac{1}{d'_1} = \\\\frac{1}{f} - \\\\frac{1}{d_1} = \\\\frac{1}{20} - \\\\frac{1}{30} = \\\\frac{1}{60} \\\\Rightarrow d'_1 = 60\\,cm$.",
      "Bước 2: Tính quãng đường vật đi được trong $t = 2\\,s$: $s_v = 5 \\\\times 2 = 10\\,cm$.",
      "Bước 3: Vì vật đi ra xa thấu kính nên khoảng cách vật lúc sau: $d_2 = 30 + 10 = 40\\,cm$.",
      "Bước 4: Tính vị trí ảnh lúc sau: $\\\\frac{1}{d'_2} = \\\\frac{1}{20} - \\\\frac{1}{40} = \\\\frac{1}{40} \\\\Rightarrow d'_2 = 40\\,cm$.",
      "Bước 5: Xác định quãng đường dịch chuyển của ảnh: $s_a = |60 - 40| = 20\\,cm$.",
      "Bước 6: Tính vận tốc trung bình của ảnh: $v' = 20 / 2 = 10\\,cm/s$."
    ],
    "stepsEn": [
      "Step 1: Compute initial image distance: $d'_1 = 60\\,cm$.",
      "Step 2: Find object displacement: $s_o = 5 \\\\times 2 = 10\\,cm$.",
      "Step 3: New object distance is $d_2 = 30 + 10 = 40\\,cm$.",
      "Step 4: Compute new image distance: $d'_2 = 40\\,cm$.",
      "Step 5: Find image displacement: $s_i = |60 - 40| = 20\\,cm$.",
      "Step 6: Compute average image speed: $v' = 20 / 2 = 10\\,cm/s$."
    ],
    "verify": "Vật ra xa thấu kính thì ảnh dịch chuyển lại gần thấu kính, cả hai di chuyển cùng một chiều trong không gian. Kết quả 10 cm/s là chính xác.",
    "verifyEn": "As the object moves away, the real image moves closer. Both move in the same spatial direction. The average speed of 10 cm/s is verified.",
    "extend": "Tuy vật chuyển động đều nhưng ảnh chuyển động không đều vì mối liên hệ giữa d và d' là phi tuyến tính.",
    "extendEn": "Although the object moves at a constant speed, the image speed is non-uniform due to the non-linear relationship between d and d'.",
    "common_traps": ["Nghĩ rằng vận tốc ảnh bằng vận tốc vật (5 cm/s).", "Lấy nhầm hiệu d2 - d1 làm quãng đường ảnh đi."],
    "common_traps_en": ["Assuming the image speed equals the object speed (5 cm/s).", "Confusing the object displacement with the image displacement."]
  },
  "real_world_connection": "Cơ chế tự động lấy nét (Autofocus) trên camera tính toán tốc độ chuyển động của vật để dịch chuyển thấu kính tương ứng, giữ ảnh rõ nét.",
  "real_world_connection_en": "Autofocus systems in camera lenses dynamically shift elements based on calculated subject velocity to maintain focus.",
  "formula": "v'_{tb} = \\\\frac{\\\\left| d'_2 - d'_1 \\right|}{t}"
})

# ============================================================
# QUESTION 3: DOUBLE LENS SYSTEM (QUANG HỆ HAI THẤU KÍNH ĐỒNG TRỤC)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_003",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "double_lens",
  "topic_vn": "Hệ hai thấu kính đồng trục",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "/images/double_lens_system.svg",
  "question_text": "Cho quang hệ gồm hai thấu kính hội tụ L1 và L2 đặt đồng trục cách nhau một khoảng $L = 40\\,cm$. Tiêu cự các thấu kính lần lượt là $f_1 = 10\\,cm$ và $f_2 = 20\\,cm$. Một vật sáng phẳng nhỏ AB đặt vuông góc với trục chính, phía trước thấu kính L1 một khoảng $d_1 = 15\\,cm$. Hãy xác định vị trí và tính chất của ảnh cuối cùng $A_2B_2$ tạo bởi hệ thấu kính.",
  "question_text_en": "A coaxial optical system consists of two converging lenses L1 and L2 separated by a distance $L = 40\\,cm$. The focal lengths are $f_1 = 10\\,cm$ and $f_2 = 20\\,cm$. A small flat object AB is placed perpendicular to the principal axis in front of L1 at a distance $d_1 = 15\\,cm$. Determine the position and nature of the final image $A_2B_2$ formed by the system.",
  "options": [
    {"key": "A", "content": "Ảnh ảo, cách thấu kính L2 là 20 cm", "content_en": "Virtual image, 20 cm in front of L2"},
    {"key": "B", "content": "Ảnh thật, cách thấu kính L2 là 20 cm", "content_en": "Real image, 20 cm behind L2"},
    {"key": "C", "content": "Ảnh thật, cách thấu kính L2 là 10 cm", "content_en": "Real image, 10 cm behind L2"},
    {"key": "D", "content": "Ảnh ảo, cách thấu kính L2 là 10 cm", "content_en": "Virtual image, 10 cm in front of L2"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Qua thấu kính L1: $1/d'_1 = 1/f_1 - 1/d_1 = 1/10 - 1/15 = 1/30 \\\\Rightarrow d'_1 = 30\\,cm$ (ảnh thật). Khoảng cách từ ảnh trung gian $A_1B_1$ tới L2 là $d_2 = L - d'_1 = 40 - 30 = 10\\,cm$. Qua thấu kính L2: $1/d'_2 = 1/f_2 - 1/d_2 = 1/20 - 1/10 = -1/20 \\\\Rightarrow d'_2 = -20\\,cm$. Ảnh cuối cùng là ảnh ảo cách L2 một khoảng 20 cm.",
    "summary_en": "For lens L1: $d'_1 = 30\\,cm$ (real image). The distance from this intermediate image to L2 is $d_2 = L - d'_1 = 10\\,cm$. For lens L2: $1/d'_2 = 1/f_2 - 1/d_2 = 1/20 - 1/10 = -1/20 \\\\Rightarrow d'_2 = -20\\,cm$. The final image is virtual, located 20 cm in front of L2."
  },
  "thinking_guide": {
    "understand": "Tìm vị trí và tính chất của ảnh cuối cùng tạo bởi hệ hai thấu kính hội tụ đồng trục đặt cách nhau 40cm.",
    "understandEn": "Find the position and nature of the final image formed by two coaxial converging lenses separated by 40cm.",
    "identify_knowledge": "Sơ đồ tạo ảnh nối tiếp qua hệ: ảnh của thấu kính trước là vật đối với thấu kính sau. Công thức liên hệ khoảng cách: $d_2 = L - d'_1$.",
    "identify_knowledgeEn": "Sequential image formation: image of the first lens is the object for the second lens. Connection formula: $d_2 = L - d'_1$.",
    "plan": "Tính $d'_1$ của thấu kính L1. Sử dụng liên hệ khoảng cách để tìm $d_2$ của L2. Tính vị trí ảnh $d'_2$ qua L2 và kết luận tính chất ảnh.",
    "planEn": "Calculate $d'_1$ for L1. Find $d_2$ for L2 using $d_2 = L - d'_1$. Compute $d'_2$ for L2 and determine its nature.",
    "steps": [
      "Bước 1: Áp dụng công thức thấu kính cho L1: $\\\\frac{1}{d'_1} = \\\\frac{1}{10} - \\\\frac{1}{15} = \\\\frac{1}{30} \\\\Rightarrow d'_1 = 30\\,cm$ (ảnh thật).",
      "Bước 2: Xác định khoảng cách từ ảnh trung gian đến L2: $d_2 = L - d'_1 = 40 - 30 = 10\\,cm$.",
      "Bước 3: Vì $d_2 > 0$, ảnh trung gian đóng vai trò vật thật đối với L2.",
      "Bước 4: Áp dụng công thức thấu kính cho L2: $\\\\frac{1}{d'_2} = \\\\frac{1}{f_2} - \\\\frac{1}{d_2} = \\\\frac{1}{20} - \\\\frac{1}{10} = -\\\\frac{1}{20}$.",
      "Bước 5: Suy ra $d'_2 = -20\\,cm$.",
      "Bước 6: Vì $d'_2 < 0$, ảnh cuối cùng là ảnh ảo, cách thấu kính L2 một khoảng $20\\,cm$ về phía trước."
    ],
    "stepsEn": [
      "Step 1: Apply lens equation to L1: $d'_1 = 30\\,cm$ (real image).",
      "Step 2: Distance from intermediate image to L2 is $d_2 = L - d'_1 = 10\\,cm$.",
      "Step 3: Since $d_2 > 0$, the intermediate image acts as a real object for L2.",
      "Step 4: Apply lens equation to L2: $\\\\frac{1}{d'_2} = \\\\frac{1}{20} - \\\\frac{1}{10} = -\\\\frac{1}{20}$.",
      "Step 5: Obtain $d'_2 = -20\\,cm$.",
      "Step 6: Since $d'_2 < 0$, the final image is virtual, located 20 cm in front of L2."
    ],
    "verify": "Độ phóng đại của hệ: $k = k_1 \\\\cdot k_2 = (-d'_1/d_1) \\\\times (-d'_2/d_2) = (-2) \\\\times (2) = -4$. Ảnh ảo ngược chiều vật thật và lớn gấp 4 lần. Phù hợp vẽ tia sáng.",
    "verifyEn": "Total magnification: $k = k_1 \\\\cdot k_2 = (-30/15) \\\\times (-(-20)/10) = -4$. The final image is virtual, inverted, and magnified by 4. Consistent with ray tracing.",
    "extend": "Hệ thấu kính nối tiếp là nguyên lý cơ bản của kính hiển vi và kính thiên văn khúc xạ.",
    "extendEn": "This multi-lens combination is the core principle behind optical microscopes and refracting telescopes.",
    "common_traps": ["Nhầm lẫn công thức liên hệ khoảng cách thành $d_2 = L + d'_1$.", "Quên dấu âm của $d'_2$ khi xác định tính chất ảnh ảo."],
    "common_traps_en": ["Using the wrong relation $d_2 = L + d'_1$.", "Ignoring the negative sign of $d'_2$ and concluding it is a real image."]
  },
  "real_world_connection": "Ống kính máy ảnh gồm nhiều thấu kính ghép đồng trục để hạn chế tối đa các lỗi quang học như sắc sai và cầu sai.",
  "real_world_connection_en": "Camera lenses contain multiple coaxial elements to eliminate chromatic and spherical aberrations.",
  "formula": "d'_2 = \\\\frac{d_2 f_2}{d_2 - f_2} \\\\quad \\\\text{where } d_2 = L - d'_1"
})

# ============================================================
# QUESTION 4: OBSCURED CONVERGING LENS (THẤU KÍNH HỘI TỤ BỊ CHE KHUẤT)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_004",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "partially_blocked_lens",
  "topic_vn": "Thấu kính bị che khuất một phần",
  "type": "multiple_choice",
  "difficulty": "medium",
  "image": "",
  "question_text": "Một thấu kính hội tụ đang tạo ra một ảnh thật rõ nét của một vật sáng phẳng trên màn chắn đặt phía sau thấu kính. Nếu ta dùng một miếng bìa màu đen không xuyên sáng che khuất hoàn toàn nửa phần phía trên của thấu kính thì ảnh thu được trên màn chắn sẽ thay đổi thế nào?",
  "question_text_en": "A converging lens forms a sharp, real image of a flat object on a screen placed behind the lens. If an opaque black cardboard is used to completely cover the top half of the lens, how will the image on the screen change?",
  "options": [
    {"key": "A", "content": "Nửa phần phía trên của ảnh biến mất", "content_en": "The top half of the image disappears"},
    {"key": "B", "content": "Nửa phần phía dưới của ảnh biến mất", "content_en": "The bottom half of the image disappears"},
    {"key": "C", "content": "Ảnh vẫn đầy đủ nhưng độ sáng giảm đi một nửa", "content_en": "The image remains complete but its brightness is reduced by half"},
    {"key": "D", "content": "Ảnh biến mất hoàn toàn trên màn chắn", "content_en": "The image disappears completely from the screen"}
  ],
  "correct_answer": "C",
  "explanation": {
    "summary": "Mỗi điểm trên vật sáng đều phát ra chùm tia sáng đi qua mọi điểm trên bề mặt thấu kính. Nửa dưới của thấu kính không bị che khuất vẫn khúc xạ các tia sáng đến từ mọi điểm của vật và hội tụ đầy đủ trên màn để tạo ra một ảnh toàn vẹn. Tuy nhiên, vì diện tích truyền sáng bị giảm đi một nửa, số lượng tia sáng hội tụ tạo ảnh giảm 50%, làm cho ảnh bị tối đi một nửa.",
    "summary_en": "Every point on the object emits light rays that pass through all parts of the lens surface. The uncovered bottom half of the lens still refracts light from all parts of the object, converging them to form a complete image on the screen. However, since the light-admitting area is reduced by half, the number of rays forming the image drops by 50%, reducing its brightness by half."
  },
  "thinking_guide": {
    "understand": "Giải thích hiện tượng ảnh thật của vật sáng qua thấu kính hội tụ khi che khuất một nửa thấu kính.",
    "understandEn": "Explain the effect on the real image formed by a converging lens when half of the lens is covered.",
    "identify_knowledge": "Nguyên lý tạo ảnh của thấu kính: ảnh của một điểm là giao điểm của chùm tia khúc xạ xuất phát từ điểm đó. Chùm tia sáng đi qua toàn bộ bề mặt thấu kính chứ không chỉ tập trung ở một vùng.",
    "identify_knowledgeEn": "Principle of image formation: the image of a point is the convergence point of all refracted rays. Light rays pass through the entire lens surface.",
    "plan": "Phân tích đường đi của các tia sáng từ một điểm bất kỳ trên vật. Xem xét nửa dưới thấu kính có nhận được tia sáng từ đỉnh vật hay không. Rút ra kết luận về sự tồn tại của ảnh và độ sáng của nó.",
    "planEn": "Analyze the ray paths from any point of the object. Check if the uncovered bottom half receives light from the object's top. Deduce image presence and intensity.",
    "steps": [
      "Bước 1: Một điểm sáng trên vật phát ra vô số tia sáng đi qua toàn bộ các điểm trên thấu kính.",
      "Bước 2: Khi che khuất nửa trên thấu kính, các tia sáng hướng tới nửa trên bị chặn lại.",
      "Bước 3: Tuy nhiên, các tia sáng hướng tới nửa dưới của thấu kính vẫn truyền qua bình thường.",
      "Bước 4: Nửa dưới thấu kính khúc xạ các tia này và hội tụ chúng tại đúng vị trí ảnh cũ.",
      "Bước 5: Do đó, mọi điểm trên vật đều tiếp tục tạo được ảnh trên màn, tạo nên ảnh toàn vẹn.",
      "Bước 6: Vì một nửa số tia sáng bị chặn, năng lượng ánh sáng hội tụ giảm đi một nửa nên ảnh bị tối đi một nửa."
    ],
    "stepsEn": [
      "Step 1: A point on the object emits light rays covering the entire lens surface.",
      "Step 2: Covering the top half blocks the rays directed at the top part.",
      "Step 3: However, rays directed at the bottom half pass through normally.",
      "Step 4: The bottom half of the lens refracts these rays, converging them at the original image location.",
      "Step 5: Thus, all points of the object still form their corresponding image points, resulting in a complete image.",
      "Step 6: Since half of the light rays are blocked, the light energy at the focal point is halved, reducing brightness by half."
    ],
    "verify": "Thực nghiệm khẳng định ảnh thu được trên màn vẫn đầy đủ hình dạng nhưng mờ hơn hẳn so với lúc chưa che. Điều này phủ định quan niệm sai lầm cho rằng che nửa kính sẽ che nửa ảnh.",
    "verifyEn": "Physical experiments confirm that the image remains complete but noticeably dimmer, correcting the common misconception that covering half the lens cuts the image in half.",
    "extend": "Nguyên lý này được áp dụng trong ống kính máy ảnh: khẩu độ của ống kính được khép nhỏ lại để kiểm soát độ sáng của bức ảnh mà không làm mất góc ảnh.",
    "extendEn": "This principle is used in camera lenses: closing the aperture controls image exposure without clipping the frame.",
    "common_traps": ["Nghĩ rằng che nửa trên thấu kính sẽ làm mất nửa dưới của ảnh (do ảnh ngược chiều).", "Nghĩ rằng ảnh biến mất hoàn toàn."],
    "common_traps_en": ["Thinking that blocking the top half of the lens crops the bottom half of the image.", "Assuming the image disappears entirely."]
  },
  "real_world_connection": "Khi mắt bạn đeo kính cận bị bám một hạt bụi lớn (che một góc nhỏ thấu kính), bạn vẫn nhìn thấy toàn cảnh phía trước bình thường chứ không bị một điểm đen che mắt.",
  "real_world_connection_en": "When a speck of dust lands on your eyeglasses, it does not block a portion of your field of view; it merely scatters a tiny fraction of light, leaving the image complete.",
  "formula": "I_{brightness} \\\\propto A_{lens\\\\,area}"
})

# ============================================================
# QUESTION 5: GLASS SLAB REFRACTION (KHÚC XẠ QUA BẢN MẶT SONG SONG)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_005",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "glass_slab",
  "topic_vn": "Khúc xạ qua bản mặt song song",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "/images/glass_slab_refraction.svg",
  "question_text": "Một điểm sáng S đặt trước một bản mặt song song bằng thủy tinh có bề dày $d = 6\\,cm$ và chiết suất $n = 1{,}5$. Người quan sát nhìn chéo qua bản thủy tinh này theo phương gần như vuông góc với mặt bản. Hãy xác định khoảng cách ảnh ảo S' của S bị dịch chuyển lại gần mắt so với vị trí thực của S.",
  "question_text_en": "A point light source S is placed in front of a flat glass slab with thickness $d = 6\\,cm$ and refractive index $n = 1.5$. An observer views the source through the glass slab along a direction almost perpendicular to its surface. Determine the distance by which the virtual image S' of S appears shifted closer to the observer.",
  "options": [
    {"key": "A", "content": "2,0 cm", "content_en": "2.0 cm"},
    {"key": "B", "content": "4,0 cm", "content_en": "4.0 cm"},
    {"key": "C", "content": "1,5 cm", "content_en": "1.5 cm"},
    {"key": "D", "content": "3,0 cm", "content_en": "3.0 cm"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Áp dụng công thức tính độ dời ảnh ảo của vật qua bản mặt song song khi nhìn vuông góc: $\\\\Delta x = d \\\\cdot (1 - 1/n)$. Thay số ta được: $\\\\Delta x = 6 \\\\times (1 - 1/1{,}5) = 6 \\\\times (1 - 2/3) = 6 \\\\times 1/3 = 2\\,cm$. Ảnh ảo S' bị dịch chuyển lại gần mắt 2 cm so với vật S.",
    "summary_en": "The formula for the apparent shift of a virtual image through a parallel-faced plate viewed near-normally is $\\\\Delta x = d \\\\cdot (1 - 1/n)$. Substituting the values yields: $\\\\Delta x = 6 \\\\times (1 - 1/1.5) = 6 \\\\times (1 - 2/3) = 2\\,cm$. The virtual image S' is shifted 2 cm closer to the observer."
  },
  "thinking_guide": {
    "understand": "Tính độ dời ảnh ảo của điểm sáng S khi nhìn gần vuông góc qua bản thủy tinh song song dày 6cm, chiết suất 1.5.",
    "understandEn": "Calculate the apparent shift of point source S when viewed near-normally through a 6cm thick glass slab with index 1.5.",
    "identify_knowledge": "Định luật khúc xạ ánh sáng. Lưỡng chất phẳng. Công thức độ dời ảnh ảo qua bản mặt song song: $\\\\Delta x = d \\\\left(1 - \\\\frac{1}{n}\\\\right)$ (áp dụng cho góc tới nhỏ, tức nhìn gần vuông góc).",
    "identify_knowledgeEn": "Snell's Law of refraction. Flat interfaces. Apparent shift formula for a parallel-sided slab: $\\\\Delta x = d \\\\left(1 - \\\\frac{1}{n}\\\\right)$ (applicable for small angles of incidence, i.e. near-normal viewing).",
    "plan": "Sử dụng trực tiếp công thức độ dời ảnh ảo. Thay các giá trị bề dày $d = 6\\,cm$ và chiết suất $n = 1{,}5$ vào công thức và tính toán kết quả.",
    "planEn": "Apply the apparent shift formula directly. Substitute the thickness $d = 6\\,cm$ and refractive index $n = 1.5$ into the equation and compute the result.",
    "steps": [
      "Bước 1: Viết công thức độ dời ảnh ảo qua bản mặt song song: $\\\\Delta x = d \\\\left(1 - \\\\frac{1}{n}\\\\right)$.",
      "Bước 2: Thay thế giá trị chiết suất $n = 1{,}5 = 3/2$ và bề dày $d = 6\\,cm$ vào công thức.",
      "Bước 3: Thực hiện tính toán phần ngoặc: $1 - \\\\frac{1}{1{,}5} = 1 - \\\\frac{2}{3} = \\\\frac{1}{3}$.",
      "Bước 4: Tính độ dời: $\\\\Delta x = 6 \\\\times \\\\frac{1}{3} = 2\\,cm$.",
      "Bước 5: Xác nhận ảnh ảo S' dịch chuyển lại gần mắt (theo chiều truyền sáng) một khoảng $2\\,cm$."
    ],
    "stepsEn": [
      "Step 1: State the apparent shift formula: $\\\\Delta x = d \\\\left(1 - \\\\frac{1}{n}\\\\right)$.",
      "Step 2: Substitute $n = 1.5 = 3/2$ and thickness $d = 6\\,cm$ into the formula.",
      "Step 3: Calculate the bracketed term: $1 - \\\\frac{1}{1.5} = 1 - \\\\frac{2}{3} = \\\\frac{1}{3}$.",
      "Step 4: Compute the shift: $\\\\Delta x = 6 \\\\times \\\\frac{1}{3} = 2\\,cm$.",
      "Step 5: Confirm that the virtual image S' is shifted closer to the observer by 2 cm."
    ],
    "verify": "Vì chiết suất của thủy tinh (1,5) lớn hơn không khí (1,0), các tia sáng bị khúc xạ bẻ cong ra xa pháp tuyến khi đi ra ngoài không khí, khiến ảnh ảo hiện lên gần hơn. Độ dời luôn nhỏ hơn bề dày d (2 cm < 6 cm). Hợp lý.",
    "verifyEn": "Since glass has a higher index (1.5) than air (1.0), light rays bend away from the normal upon exiting, making the source appear closer. The shift must be less than d. Verified.",
    "extend": "Công thức này đúng cho mọi khoảng cách từ điểm sáng S tới bản mặt song song; vị trí đặt vật không ảnh hưởng tới độ dời ảnh ảo.",
    "extendEn": "This formula is independent of the distance between the source S and the glass slab; the shift remains constant for any object placement.",
    "common_traps": ["Nhầm lẫn công thức thành $\\\\Delta x = d(n - 1) = 6(1{,}5-1) = 3\\,cm$.", "Nhầm lẫn chiều dịch chuyển của ảnh (nghĩ rằng ảnh lùi ra xa)."],
    "common_traps_en": ["Using the wrong formula $\\\\Delta x = d(n - 1) = 3\\,cm$.", "Misunderstanding the direction of the shift (thinking the image moves further away)."]
  },
  "real_world_connection": "Khi bạn nhìn vào một bể cá cảnh, các chú cá trông có vẻ to hơn và ở gần bề mặt nước hơn vị trí thực tế của chúng do hiện tượng khúc xạ ánh sáng qua môi trường nước có chiết suất n = 1.33.",
  "real_world_connection_en": "Fish in an aquarium appear larger and closer to the glass than they actually are due to light refraction at the water-glass-air interfaces.",
  "formula": "\\\\Delta x = d \\\\cdot \\\\left(1 - \\\\frac{1}{n}\\\\right)"
})

# ============================================================
# QUESTION 6: PRESBYOPIA GLASSES RESOLUTION (ĐỘ TỤ KÍNH LÃO)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_006",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "presbyopia_math",
  "topic_vn": "Độ tụ kính viễn thị",
  "type": "multiple_choice",
  "difficulty": "medium",
  "image": "",
  "question_text": "Một người bị lão thị chỉ nhìn rõ các vật đặt cách mắt gần nhất là $50\\,cm$. Để có thể đọc sách ở khoảng cách bình thường cách mắt $25\\,cm$ mà không cần điều tiết quá mức, người này cần phải đeo sát mắt một kính có độ tụ bằng bao nhiêu điốp (diopter)?",
  "question_text_en": "A presbyopic person can only see objects clearly when they are at least $50\\,cm$ from their eyes. To read a book at a normal distance of $25\\,cm$ without excessive eye accommodation, what should be the power of the lens they wear close to their eyes, in diopters?",
  "options": [
    {"key": "A", "content": "+2,0 điốp", "content_en": "+2.0 diopters"},
    {"key": "B", "content": "-2,0 điốp", "content_en": "-2.0 diopters"},
    {"key": "C", "content": "+4,0 điốp", "content_en": "+4.0 diopters"},
    {"key": "D", "content": "+1,5 điốp", "content_en": "+1.5 diopters"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Để đọc sách ở khoảng cách $d = 25\\,cm$, thấu kính phải tạo ra ảnh ảo hiện ở điểm cực cận của mắt ($OC_C = 50\\,cm \\\\Rightarrow d' = -50\\,cm$). Áp dụng công thức thấu kính: $1/f = 1/d + 1/d' = 1/25 + 1/(-50) = 1/50 \\\\Rightarrow f = 50\\,cm = 0{,}5\\,m$. Độ tụ của kính: $D = 1/f = 1/0{,}5 = +2$ điốp.",
    "summary_en": "To read a book at $d = 25\\,cm$, the lens must form a virtual image at the eye's near point ($OC_C = 50\\,cm \\\\Rightarrow d' = -50\\,cm$). Using the lens formula: $1/f = 1/d + 1/d' = 1/25 + 1/(-50) = 1/50 \\\\Rightarrow f = 50\\,cm = 0.5\\,m$. The lens power is $D = 1/f = 1/0.5 = +2.0$ diopters."
  },
  "thinking_guide": {
    "understand": "Xác định độ tụ D của thấu kính hội tụ khắc phục tật lão thị để nhìn vật cách mắt 25cm khi điểm cực cận cách mắt 50cm.",
    "understandEn": "Determine the power D of a corrective lens for presbyopia to focus on an object at 25cm when the near point is at 50cm.",
    "identify_knowledge": "Mắt lão thị cần đeo kính hội tụ để đưa ảnh ảo của vật ở gần về điểm cực cận. Quy ước ảnh ảo $d' < 0$. Công thức thấu kính: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'}$. Công thức độ tụ: $D = 1/f$ (f bằng mét).",
    "identify_knowledgeEn": "Presbyopia requires converging lenses to project a virtual image of near objects to the near point. Sign convention: virtual image $d' < 0$. Lens formula: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'}$. Optical power: $D = 1/f$ (f in meters).",
    "plan": "Xác định khoảng cách vật $d = 25\\,cm$ và khoảng cách ảnh $d' = -50\\,cm$ (dấu âm vì là ảnh ảo). Tính tiêu cự $f$ bằng công thức thấu kính. Đổi $f$ sang mét và tính độ tụ $D = 1/f$.",
    "planEn": "Identify object distance $d = 25\\,cm$ and image distance $d' = -50\\,cm$ (negative sign for virtual image). Calculate focal length $f$ using the lens equation. Convert $f$ to meters and compute power $D = 1/f$.",
    "steps": [
      "Bước 1: Quy ước khoảng cách vật đặt sách: $d = 25\\,cm$.",
      "Bước 2: Ảnh ảo hiện ra ở điểm cực cận của mắt để mắt nhìn rõ: $d' = -OC_C = -50\\,cm$ (dấu âm thể hiện ảnh ảo trước kính).",
      "Bước 3: Áp dụng công thức thấu kính: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'} = \\\\frac{1}{25} + \\\\frac{1}{-50} = \\\\frac{2 - 1}{50} = \\\\frac{1}{50}$.",
      "Bước 4: Tính tiêu cự kính đeo: $f = 50\\,cm = 0{,}5\\,m$.",
      "Bước 5: Tính độ tụ của thấu kính: $D = \\\\frac{1}{f} = \\\\frac{1}{0{,}5} = +2$ điốp."
    ],
    "stepsEn": [
      "Step 1: Set object distance (book position): $d = 25\\,cm$.",
      "Step 2: The virtual image must form at the near point for clear vision: $d' = -OC_C = -50\\,cm$ (negative for virtual image).",
      "Step 3: Apply lens formula: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'} = \\\\frac{1}{25} + \\\\frac{1}{-50} = \\\\frac{2 - 1}{50} = \\\\frac{1}{50}$.",
      "Step 4: Find focal length: $f = 50\\,cm = 0.5\\,m$.",
      "Step 5: Calculate optical power: $D = \\\\frac{1}{f} = \\\\frac{1}{0.5} = +2.0$ diopters."
    ],
    "verify": "Kính lão thị là thấu kính hội tụ (độ tụ dương +2.0 diopter). Mắt viễn thị càng nặng thì cần thấu kính hội tụ mạnh hơn. Kết quả hợp lý.",
    "verifyEn": "Presbyopic glasses are converging lenses (positive power +2.0 diopters). The further the near point, the stronger the converging lens needed. Verified.",
    "extend": "Phân biệt với mắt cận thị đeo kính phân kì (độ tụ âm) để đưa ảnh ảo của vật ở vô cực về điểm cực viễn của mắt ($f = -OC_V$).",
    "extendEn": "Compare this with myopia (nearsightedness) which requires diverging lenses (negative power) to bring virtual images of distant objects to the far point ($f = -OC_V$).",
    "common_traps": ["Quên dấu trừ cho khoảng cách ảnh ảo ($d' = 50\\,cm$), dẫn đến tính sai $1/f = 1/25 + 1/50 = 3/50$.", "Quên không đổi đơn vị cm sang mét khi tính độ tụ D."],
    "common_traps_en": ["Forgetting the negative sign for virtual image distance ($d' = 50\\,cm$), calculating $1/f = 3/50$ by mistake.", "Forgetting to convert cm to meters before calculating the power D."]
  },
  "real_world_connection": "Người lớn tuổi thường phải đeo kính đọc sách khi xem báo hoặc dùng điện thoại ở cự ly gần do cơ vòng mắt bị yếu đi.",
  "real_world_connection_en": "Elderly people require reading glasses (converging lenses) to focus on newspapers or smartphones due to the loss of elasticity in the crystalline lens.",
  "formula": "D = \\\\frac{1}{f} = \\\\frac{1}{d\\\\,(\\\\text{m})} - \\\\frac{1}{OC_C\\\\,(\\\\text{m})}"
})

# ============================================================
# QUESTION 7: ROTATING PLANE MIRROR (GƯƠNG PHẲNG QUAY GÓC)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_007",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "rotating_mirror",
  "topic_vn": "Gương phẳng quay góc",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "",
  "question_text": "Chiếu một tia sáng tới SI cố định vào một gương phẳng đặt nằm ngang. Nếu ta cho gương phẳng quay một góc $\\\\alpha = 15^\\\\circ$ quanh một trục nằm trong mặt phẳng gương và vuông góc với mặt phẳng tới thì tia phản xạ sẽ quay đi một góc bằng bao nhiêu?",
  "question_text_en": "A fixed incident ray SI is directed at a horizontal plane mirror. If the mirror rotates by an angle $\\\\alpha = 15^\\\\circ$ about an axis lying in the plane of the mirror and perpendicular to the plane of incidence, by what angle will the reflected ray rotate?",
  "options": [
    {"key": "A", "content": "15°", "content_en": "15°"},
    {"key": "B", "content": "30°", "content_en": "30°"},
    {"key": "C", "content": "45°", "content_en": "45°"},
    {"key": "D", "content": "0° (tia phản xạ giữ nguyên)", "content_en": "0° (reflected ray remains stationary)"}
  ],
  "correct_answer": "B",
  "explanation": {
    "summary": "Khi gương quay một góc $\\\\alpha$, pháp tuyến của gương tại điểm tới cũng quay một góc $\\\\alpha$. Vì tia tới cố định, góc tới $i$ sẽ thay đổi một lượng là $\\\\Delta i = \\\\alpha$. Theo định luật phản xạ, góc phản xạ cũng thay đổi một lượng $\\\\Delta i' = \\\\alpha$. Do đó, góc lệch giữa tia tới và pháp tuyến thay đổi $\\\\alpha$, pháp tuyến lại dịch chuyển $\\\\alpha$, dẫn đến tia phản xạ dịch chuyển đi một góc gấp đôi là $\\\\Delta \\\\theta = 2\\\\alpha = 2 \\\\times 15^\\\\circ = 30^\\\\circ$.",
    "summary_en": "When the mirror rotates by an angle $\\\\alpha$, its normal also rotates by $\\\\alpha$. Since the incident ray is fixed, the angle of incidence $i$ changes by $\\\\Delta i = \\\\alpha$. According to the law of reflection, the angle of reflection also changes by $\\\\Delta i' = \\\\alpha$. Consequently, the total deviation angle of the reflected ray changes by $\\\\Delta \\\\theta = 2\\\\alpha = 2 \\\\times 15^\\\\circ = 30^\\\\circ$."
  },
  "thinking_guide": {
    "understand": "Tính góc quay của tia phản xạ khi gương phẳng quay một góc 15 độ quanh trục cố định và tia tới giữ nguyên.",
    "understandEn": "Calculate the rotation angle of the reflected ray when the plane mirror rotates by 15 degrees with a fixed incident ray.",
    "identify_knowledge": "Định luật phản xạ ánh sáng: góc phản xạ bằng góc tới. Trục pháp tuyến vuông góc với gương và quay cùng góc với gương.",
    "identify_knowledgeEn": "Law of reflection: angle of reflection equals angle of incidence. The normal line rotates by the same angle as the mirror.",
    "plan": "Phân tích sự thay đổi vị trí của pháp tuyến gương. Tính toán góc tới mới. Tìm góc phản xạ mới. Xác định góc lệch giữa tia phản xạ trước và sau khi quay gương.",
    "planEn": "Analyze the shift of the mirror's normal. Calculate the new angle of incidence. Find the new angle of reflection. Determine the angular difference between initial and final reflected rays.",
    "steps": [
      "Bước 1: Gọi pháp tuyến ban đầu là $IN$. Góc tới ban đầu là $i$, góc phản xạ ban đầu là $i' = i$. Góc giữa tia tới và tia phản xạ là $2i$.",
      "Bước 2: Khi gương quay một góc $\\\\alpha$, pháp tuyến $IN$ cũng quay đi một góc $\\\\alpha$ sang vị trí $IN'$.",
      "Bước 3: Vì tia tới cố định, góc tới mới sẽ là $i_2 = i + \\\\alpha$.",
      "Bước 4: Theo định luật phản xạ, góc phản xạ mới so với pháp tuyến mới là $i'_2 = i + \\\\alpha$.",
      "Bước 5: Góc giữa tia tới cố định và tia phản xạ mới là $2(i + \\\\alpha) = 2i + 2\\\\alpha$.",
      "Bước 6: So sánh với góc ban đầu, tia phản xạ đã quay đi một góc bằng $2\\\\alpha = 2 \\\\times 15^\\\\circ = 30^\\\\circ$."
    ],
    "stepsEn": [
      "Step 1: Let initial normal be $IN$, with initial angles of incidence and reflection as $i$. The angle between rays is $2i$.",
      "Step 2: When the mirror rotates by $\\\\alpha$, the normal $IN$ rotates by $\\\\alpha$ to $IN'$.",
      "Step 3: Since the incident ray is fixed, the new angle of incidence is $i_2 = i + \\\\alpha$.",
      "Step 4: The new angle of reflection relative to the new normal is $i'_2 = i + \\\\alpha$.",
      "Step 5: The angle between fixed incident ray and new reflected ray is $2(i + \\\\alpha) = 2i + 2\\\\alpha$.",
      "Step 6: Comparing with the initial angle, the reflected ray has rotated by $2\\\\alpha = 30^\\\\circ$."
    ],
    "verify": "Vẽ hình học xác nhận pháp tuyến quay đi $\\\\alpha$ kéo theo tia phản xạ quay đi $2\\\\alpha$ về cùng chiều. Kết quả 30 độ là chính xác.",
    "verifyEn": "Geometric ray tracing confirms that when the normal rotates by $\\\\alpha$, the reflected ray rotates by $2\\\\alpha$. Verified.",
    "extend": "Nguyên lý này được ứng dụng để tăng độ nhạy trong các thiết bị đo góc nhỏ cổ điển như điện kế gương.",
    "extendEn": "This principle is used to amplify small angular movements in optical instruments like mirror galvanometers.",
    "common_traps": ["Nghĩ rằng tia phản xạ quay cùng một góc $\\\\alpha$ với gương (15 độ).", "Nhầm lẫn chiều quay của tia phản xạ ngược với gương."],
    "common_traps_en": ["Thinking the reflected ray rotates by the same angle $\\\\alpha$ ($15^\\circ$).", "Assuming the reflected ray rotates in the opposite direction of the mirror's rotation."]
  },
  "real_world_connection": "Máy quét mã vạch ở siêu thị dùng một lăng trụ đa giác có các mặt gương quay tròn liên tục để quét chùm tia laser đỏ qua các góc rất rộng.",
  "real_world_connection_en": "Supermarket barcode scanners utilize a spinning polygonal mirror wheel to sweep a laser beam across wide angles.",
  "formula": "\\\\Delta \\\\theta = 2\\\\alpha"
})

# ============================================================
# QUESTION 8: CIRCULAR LIGHT SPOT ON SCREEN (VỆT SÁNG TRÊN MÀN CHẮN)
# ============================================================
gifted_optics_questions.append({
  "id": "phys9_gifted_optics_grade9_008",
  "grade": 9,
  "chapter": "light_spectrum",
  "chapter_vn": "Quang phổ ánh sáng",
  "topic": "light_spot_size",
  "topic_vn": "Vệt sáng trên màn chắn",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "",
  "question_text": "Một nguồn sáng điểm S đặt trên trục chính của một thấu kính hội tụ có tiêu cự $f = 12\\,cm$, cách thấu kính một khoảng $d = 18\\,cm$. Phía sau thấu kính, người ta đặt một màn chắn vuông góc với trục chính. Để trên màn chắn thu được một vệt sáng tròn có đường kính bằng một nửa đường kính của thấu kính, màn chắn phải được đặt cách thấu kính một khoảng bằng bao nhiêu?",
  "question_text_en": "A point light source S is placed on the principal axis of a converging lens with focal length $f = 12\\,cm$, at a distance $d = 18\\,cm$ from the lens. Behind the lens, a screen is placed perpendicular to the principal axis. To obtain a circular light spot on the screen with a diameter equal to half the lens diameter, at what distance from the lens should the screen be placed?",
  "options": [
    {"key": "A", "content": "18 cm hoặc 54 cm", "content_en": "18 cm or 54 cm"},
    {"key": "B", "content": "36 cm", "content_en": "36 cm"},
    {"key": "C", "content": "24 cm hoặc 48 cm", "content_en": "24 cm or 48 cm"},
    {"key": "D", "content": "18 cm hoặc 36 cm", "content_en": "18 cm or 36 cm"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Xác định vị trí ảnh thật: $1/d' = 1/f - 1/d = 1/12 - 1/18 = 1/36 \\\\Rightarrow d' = 36\\,cm$. Gọi $D$ là đường kính thấu kính, $d_v = D/2$ là đường kính vệt sáng. Có 2 vị trí của màn chắn cho vệt sáng có đường kính $D/2$: Vị trí 1 (trước ảnh thật): $\\\\frac{d_v}{D} = \\\\frac{d' - x_1}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{36 - x_1}{36} \\\\Rightarrow x_1 = 18\\,cm$. Vị trí 2 (sau ảnh thật): $\\\\frac{d_v}{D} = \\\\frac{x_2 - d'}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{x_2 - 36}{36} \\\\Rightarrow x_2 = 54\\,cm$.",
    "summary_en": "Locate the real image: $1/d' = 1/f - 1/d = 1/12 - 1/18 = 1/36 \\\\Rightarrow d' = 36\\,cm$. Let $D$ be the lens diameter and $d_v = D/2$ be the spot diameter. There are two screen positions: Position 1 (before the image): $\\\\frac{d_v}{D} = \\\\frac{d' - x_1}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{36 - x_1}{36} \\\\Rightarrow x_1 = 18\\,cm$. Position 2 (after the image): $\\\\frac{d_v}{D} = \\\\frac{x_2 - d'}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{x_2 - 36}{36} \\\\Rightarrow x_2 = 54\\,cm$."
  },
  "thinking_guide": {
    "understand": "Tìm khoảng cách từ màn chắn đến thấu kính hội tụ để thu được vệt sáng tròn có đường kính bằng nửa đường kính thấu kính.",
    "understandEn": "Find the screen-to-lens distance for a circular light spot with a diameter equal to half the lens diameter.",
    "identify_knowledge": "Công thức thấu kính mỏng: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'}$. Tam giác đồng dạng tạo bởi rìa thấu kính và vệt sáng trên màn với đỉnh là điểm ảnh S'. Hai trường hợp đặt màn chắn (trước ảnh hoặc sau ảnh).",
    "identify_knowledgeEn": "Thin lens equation: $\\\\frac{1}{f} = \\\\frac{1}{d} + \\\\frac{1}{d'}$. Similar triangles formed by the lens aperture, the light spot, and the image point S'. Two cases for screen placement.",
    "plan": "Tính vị trí ảnh thật $d'$. Thiết lập biểu thức tam giác đồng dạng cho hai trường hợp: màn đặt trước ảnh ($x < d'$) và màn đặt sau ảnh ($x > d'$). Giải hai phương trình để tìm hai giá trị của khoảng cách $x$.",
    "planEn": "Calculate real image distance $d'$. Set up similar triangle equations for two cases: screen in front of image ($x < d'$) and screen behind image ($x > d'$). Solve for two possible values of screen distance $x$.",
    "steps": [
      "Bước 1: Tính vị trí ảnh thật S' của nguồn sáng điểm qua thấu kính: $\\\\frac{1}{d'} = \\\\frac{1}{f} - \\\\frac{1}{d} = \\\\frac{1}{12} - \\\\frac{1}{18} = \\\\frac{3-2}{36} = \\\\frac{1}{36} \\\\Rightarrow d' = 36\\,cm$.",
      "Bước 2: Vẽ chùm tia sáng ló hội tụ từ rìa thấu kính về ảnh S' rồi loe ra sau S'. Gọi đường kính thấu kính là $D$, đường kính vệt sáng là $d_v = D/2$.",
      "Bước 3: Trường hợp 1: Màn chắn đặt trước ảnh S' ($x < 36\\,cm$). Xét hai tam giác đồng dạng chung đỉnh S': $\\\\frac{d_v}{D} = \\\\frac{d' - x}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{36 - x}{36} \\\\Rightarrow 36 - x = 18 \\\\Rightarrow x = 18\\,cm$.",
      "Bước 4: Trường hợp 2: Màn chắn đặt sau ảnh S' ($x > 36\\,cm$). Xét hai tam giác đồng dạng đối đỉnh: $\\\\frac{d_v}{D} = \\\\frac{x - d'}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{x - 36}{36} \\\\Rightarrow x - 36 = 18 \\\\Rightarrow x = 54\\,cm$.",
      "Bước 5: Có hai khoảng cách màn chắn thỏa mãn là $18\\,cm$ hoặc $54\\,cm$. Chọn đáp án A."
    ],
    "stepsEn": [
      "Step 1: Locate the real image S' formed by the lens: $d' = 36\\,cm$.",
      "Step 2: Model the light cone from the lens aperture converging to S' and diverging after it. Let lens diameter be $D$ and spot diameter be $d_v = D/2$.",
      "Step 3: Case 1: Screen placed in front of the image ($x < 36\\,cm$). Using similar triangles: $\\\\frac{d_v}{D} = \\\\frac{d' - x}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{36 - x}{36} \\\\Rightarrow x = 18\\,cm$.",
      "Step 4: Case 2: Screen placed behind the image ($x > 36\\,cm$). Using similar triangles: $\\\\frac{d_v}{D} = \\\\frac{x - d'}{d'} \\\\Rightarrow \\\\frac{1}{2} = \\\\frac{x - 36}{36} \\\\Rightarrow x = 54\\,cm$.",
      "Step 5: Two valid screen distances are 18 cm and 54 cm. The correct option is A."
    ],
    "verify": "Tại vị trí $x = 36\\,cm$, vệt sáng thu lại thành 1 điểm cực nhỏ. Khi lùi về trước 18cm hoặc tiến ra sau thêm 18cm, vệt sáng loe ra đều có đường kính bằng nửa thấu kính. Tính toán đối xứng chuẩn xác.",
    "verifyEn": "At $x = 36\\,cm$, the spot is a point. At $x = 18\\,cm$ or $x = 54\\,cm$, the spot is $D/2$. Perfect symmetry verified.",
    "extend": "Bài toán này thường xuất hiện dưới dạng câu hỏi nâng cao trong các kỳ thi HSG để đánh giá khả năng tư duy hình học không gian.",
    "extendEn": "This geometry-based ray optics problem is a staple in gifted physics exams to test spatial reasoning.",
    "common_traps": ["Chỉ xét trường hợp màn đặt trước ảnh (18 cm) mà quên trường hợp màn đặt sau ảnh (54 cm).", "Nghĩ rằng vệt sáng nhỏ nhất ở tiêu điểm f = 12 cm thay vì ở ảnh thật d' = 36 cm."],
    "common_traps_en": ["Only considering the screen placement in front of the image ($18\\,cm$), missing the second symmetric position ($54\\,cm$).", "Assuming the focus spot is smallest at the focal point $f = 12\\,cm$ instead of the image point $d' = 36\\,cm$."]
  },
  "real_world_connection": "Nguyên lý này được ứng dụng để thiết kế các hệ kính hội tụ nhiệt trong lò mặt trời hoặc máy hàn laser, nơi chùm tia được hội tụ chính xác.",
  "real_world_connection_en": "This principle is used in laser cutters and solar furnaces to precisely position the target screen at the focal waist for maximum energy concentration.",
  "formula": "\\\\frac{d_v}{D} = \\\\frac{\\\\left| d' - x \\\\right|}{d'}"
})
"""

with open(target_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully generated gen_gifted_optics.py!")
