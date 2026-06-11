# -*- coding: utf-8 -*-
import os

target_path = r"C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM\apps\miuphysics-app\public\data\gen_gifted_electricity.py"

extra_content = """
# ============================================================
# QUESTION 6: INFINITE RESISTOR LADDER (MẠCH ĐIỆN VÔ HẠN TUẦN HOÀN)
# ============================================================
gifted_electricity_questions.append({
  "id": "phys9_gifted_electricity_grade9_006",
  "grade": 9,
  "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm",
  "topic": "infinite_ladder",
  "topic_vn": "Mạch thang vô hạn",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "/images/infinite_ladder.svg",
  "question_text": "Cho một mạch điện vô hạn tuần hoàn kéo dài đến vô cùng (mạch thang) như hình vẽ. Mỗi mắt xích gồm một điện trở nối tiếp $R = 1\\,\\Omega$ và một điện trở song song $R_p = 2\\,\\Omega$. Hãy tính điện trở tương đương của toàn mạch đo giữa hai điểm đầu vào A và B.",
  "question_text_en": "Consider an infinite resistor ladder network extending to infinity as shown. Each section consists of a series resistor $R = 1\\,\\Omega$ and a parallel resistor $R_p = 2\\,\\Omega$. Calculate the equivalent resistance of the entire network measured across the input terminals A and B.",
  "options": [
    {"key": "A", "content": "2,0 Ω", "content_en": "2.0 Ω"},
    {"key": "B", "content": "1,5 Ω", "content_en": "1.5 Ω"},
    {"key": "C", "content": "1,0 Ω", "content_en": "1.0 Ω"},
    {"key": "D", "content": "2,73 Ω", "content_en": "2.73 Ω"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Gọi điện trở tương đương của toàn mạch là $R_x$. Vì mạch kéo dài vô hạn, nếu ta bớt đi mắt xích đầu tiên ($1\\,\\Omega$ nối tiếp và $2\\,\\Omega$ song song), điện trở tương đương của phần còn lại vẫn bằng $R_x$. Ta có phương trình: $R_x = R + (R_p // R_x) \\Rightarrow R_x = 1 + \\frac{2 R_x}{R_x + 2}$. Giải phương trình bậc hai này ta được $R_x = 2\\,\\Omega$ (loại nghiệm âm $-1\\,\\Omega$).",
    "summary_en": "Let $R_x$ be the equivalent resistance of the infinite network. Since it is infinite, removing the first section leaves the remaining network with the same equivalent resistance $R_x$. This yields the equation: $R_x = R + (R_p // R_x) \\Rightarrow R_x = 1 + \\frac{2 R_x}{R_x + 2}$. Solving this quadratic equation gives $R_x = 2\\,\\Omega$ (discarding the negative root $-1\\,\\Omega$)."
  },
  "thinking_guide": {
    "understand": "Tính điện trở tương đương của một cấu trúc mạch thang gồm vô hạn các mắt xích điện trở $1\\,\\Omega$ và $2\\,\\Omega$.",
    "understandEn": "Determine the equivalent resistance of an infinite ladder network of resistors $1\\,\\Omega$ and $2\\,\\Omega$.",
    "identify_knowledge": "Tính chất tự tương đồng của mạch vô hạn: cắt bớt hoặc thêm một mắt xích không làm thay đổi điện trở tương đương toàn mạch. Công thức song song: $R_p // R_x$. Phương trình bậc hai.",
    "identify_knowledgeEn": "Self-similarity of infinite networks: adding/removing one stage does not change the overall equivalent resistance $R_x$. Parallel formula: $R_p // R_x$. Quadratic equations.",
    "plan": "Gọi điện trở tương đương là $R_x$. Thiết lập phương trình liên hệ $R_x$ với mắt xích đầu tiên nối tiếp cụm song song của phần còn lại. Giải phương trình bậc hai tìm nghiệm dương.",
    "planEn": "Let equivalent resistance be $R_x$. Set up the recursive equation. Solve the resulting quadratic equation for the positive root.",
    "steps": [
      "Bước 1: Gọi điện trở tương đương toàn mạch nhìn từ A, B là $R_x$.",
      "Bước 2: Cắt mắt xích đầu tiên, điện trở tương đương phần còn lại vẫn là $R_x$ do tính chất vô hạn.",
      "Bước 3: Thiết lập sơ đồ tương đương: điện trở $R = 1\\,\\Omega$ nối tiếp với cụm song song gồm điện trở $R_p = 2\\,\\Omega$ và trở kháng $R_x$ của phần vô hạn phía sau.",
      "Bước 4: Viết phương trình toán học: $R_x = R + \\frac{R_p \\cdot R_x}{R_p + R_x} \\Rightarrow R_x = 1 + \\frac{2 R_x}{2 + R_x}$.",
      "Bước 5: Quy đồng mẫu số và biến đổi thành phương trình bậc hai: $R_x(2 + R_x) = (2 + R_x) + 2R_x \\Rightarrow 2R_x + R_x^2 = 2 + 3R_x \\Rightarrow R_x^2 - R_x - 2 = 0$.",
      "Bước 6: Giải phương trình bậc hai được hai nghiệm: $R_x = 2\\,\\Omega$ (thỏa mãn) hoặc $R_x = -1\\,\\Omega$ (loại vì điện trở phải dương)."
    ],
    "stepsEn": [
      "Step 1: Let the total equivalent resistance looking into A-B be $R_x$.",
      "Step 2: By self-similarity, removing the first stage leaves the rest of the network with the same equivalent resistance $R_x$.",
      "Step 3: Model the network as $R = 1\\,\\Omega$ in series with the parallel combination of $R_p = 2\\,\\Omega$ and $R_x$.",
      "Step 4: Set up the equation: $R_x = R + \\frac{R_p \\cdot R_x}{R_p + R_x} \\Rightarrow R_x = 1 + \\frac{2 R_x}{2 + R_x}$.",
      "Step 5: Multiply through to form a quadratic equation: $R_x(2 + R_x) = (2 + R_x) + 2R_x \\Rightarrow R_x^2 - R_x - 2 = 0$.",
      "Step 6: Solve the quadratic equation to get $R_x = 2\\,\\Omega$ (valid) and $R_x = -1\\,\\Omega$ (invalid as resistance must be positive)."
    ],
    "verify": "Điện trở tương đương $R_{tđ} = 2\\,\\Omega$ lớn hơn điện trở nối tiếp mắt xích đầu tiên $1\\,\\Omega$ và bằng điện trở song song $2\\,\\Omega$, một kết quả đẹp và hợp lý.",
    "verifyEn": "The equivalent resistance $R_{eq} = 2\\,\\Omega$ is greater than the series branch $1\\,\\Omega$ and equals the parallel branch $2\\,\\Omega$, which is mathematically consistent.",
    "extend": "Phương pháp tự tương đồng này cũng được áp dụng rộng rãi để tính dung kháng tương đương của mạch tụ điện vô hạn hoặc cảm kháng của mạch cuộn cảm vô hạn.",
    "extendEn": "This self-similarity method is also used to calculate equivalent capacitance in infinite capacitor networks or inductance in inductor ladders.",
    "common_traps": ["Thiết lập sai phương trình thành $R_x = R + R_p + R_x$ (coi như nối tiếp tất cả).", "Giải sai phương trình bậc hai hoặc chọn nghiệm âm."],
    "common_traps_en": ["Formulating the wrong equation as $R_x = R + R_p + R_x$ (treating all as series).", "Solving the quadratic equation incorrectly or accepting the negative root."]
  },
  "real_world_connection": "Trong thực tế, đường dây truyền tải điện dài hoặc mô hình cáp đồng trục (coaxial cable) tần số cao được biểu diễn tương đương bằng một mạch thang vô hạn gồm các điện trở và cuộn cảm phân bố.",
  "real_world_connection_en": "In reality, long power transmission lines or high-frequency coaxial cables are modeled as infinite ladder networks of distributed resistors and inductors.",
  "formula": "R_x = R + \\frac{R_p R_x}{R_p + R_x} \\Rightarrow R_x^2 - R\\cdot R_x - R\\cdot R_p = 0",
  "phet_sim": {
    "title": "Circuit Construction Kit: DC",
    "titleVn": "Phòng thí nghiệm mạch điện một chiều (DC)",
    "url": "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html",
    "instruction": "Lắp ráp khoảng 4-5 mắt xích liên tiếp của mạch điện trên PhET. Đo điện trở tương đương đầu vào, bạn sẽ thấy giá trị hội tụ rất nhanh về sát 2,0 Ω.",
    "instructionEn": "Build 4 to 5 sections of the ladder circuit in PhET. Measure the input equivalent resistance to see it converge rapidly to nearly 2.0 Ω."
  }
})

# ============================================================
# QUESTION 7: AMMETER VARIATION WITH RHEOSTAT (SỰ BIẾN THIÊN CỦA AMPE KẾ)
# ============================================================
gifted_electricity_questions.append({
  "id": "phys9_gifted_electricity_grade9_007",
  "grade": 9,
  "chapter": "resistance_ohm",
  "chapter_vn": "Điện trở và Định luật Ohm",
  "topic": "rheostat_variation",
  "topic_vn": "Biến trở và Sự biến thiên số chỉ",
  "type": "multiple_choice",
  "difficulty": "medium",
  "image": "",
  "question_text": "Cho mạch điện gồm nguồn điện $U = 12\\,V$, điện trở cố định $R_1 = 4\\,\\Omega$ nối tiếp với một biến trở con chạy $R_x$ có giá trị thay đổi từ $0$ đến $8\\,\\Omega$. Một ampe kế lý tưởng đo dòng điện trong mạch chính. Hỏi số chỉ của ampe kế biến thiên trong khoảng nào khi dịch chuyển con chạy của biến trở?",
  "question_text_en": "A circuit consists of a source $U = 12\\,V$, a fixed resistor $R_1 = 4\\,\\Omega$ in series with a slide rheostat $R_x$ whose resistance varies from $0$ to $8\\,\\Omega$. An ideal ammeter measures the main current. Within what range does the ammeter reading vary as the slider moves?",
  "options": [
    {"key": "A", "content": "Từ 1,0 A đến 3,0 A", "content_en": "From 1.0 A to 3.0 A"},
    {"key": "B", "content": "Từ 1,5 A đến 3,0 A", "content_en": "From 1.5 A to 3.0 A"},
    {"key": "C", "content": "Từ 1,0 A đến 1,5 A", "content_en": "From 1.0 A to 1.5 A"},
    {"key": "D", "content": "Từ 0 A đến 3,0 A", "content_en": "From 0 A to 3.0 A"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Mạch nối tiếp: $R_{tđ} = R_1 + R_x = 4 + R_x$. Dòng điện trong mạch: $I = U / R_{tđ} = 12 / (4 + R_x)$. Khi con chạy ở vị trí cực tiểu $R_x = 0$, dòng cực đại: $I_{max} = 12 / 4 = 3\\,A$. Khi con chạy ở vị trí cực đại $R_x = 8\\,\\Omega$, dòng cực tiểu: $I_{min} = 12 / (4 + 8) = 1\\,A$. Vậy dòng điện biến thiên từ 1,0 A đến 3,0 A.",
    "summary_en": "For a series circuit, $R_{eq} = R_1 + R_x = 4 + R_x$. The current is $I = U / R_{eq} = 12 / (4 + R_x)$. At minimum position $R_x = 0$, current is maximum: $I_{max} = 12 / 4 = 3\\,A$. At maximum position $R_x = 8\\,\\Omega$, current is minimum: $I_{min} = 12 / (4 + 8) = 1\\,A$. Therefore, the current varies from 1.0 A to 3.0 A."
  },
  "thinking_guide": {
    "understand": "Xác định khoảng biến thiên của cường độ dòng điện trong mạch chứa biến trở mắc nối tiếp.",
    "understandEn": "Determine the range of current variation in a circuit with a series rheostat.",
    "identify_knowledge": "Công thức điện trở mạch nối tiếp: $R_{tđ} = R_1 + R_x$. Định luật Ohm: $I = U / R_{tđ}$. Giá trị cực đại và cực tiểu của biến trở $R_x$.",
    "identify_knowledgeEn": "Equivalent resistance for series connection: $R_{eq} = R_1 + R_x$. Ohm's Law: $I = U / R_{eq}$. Boundary values of the variable resistor $R_x$.",
    "plan": "Tính cường độ dòng điện $I$ dưới dạng hàm số của $R_x$. Thay hai giá trị giới hạn $R_x = 0$ và $R_x = 8\\,\\Omega$ vào biểu thức để tìm dòng cực đại $I_{max}$ và cực tiểu $I_{min}$. Kết luận khoảng biến thiên.",
    "planEn": "Express current $I$ as a function of $R_x$. Substitute boundary values $R_x = 0$ and $R_x = 8\\,\\Omega$ to find maximum $I_{max}$ and minimum $I_{min}$. State the range.",
    "steps": [
      "Bước 1: Viết công thức điện trở tương đương: $R_{tđ} = R_1 + R_x = 4 + R_x\\,\\Omega$.",
      "Bước 2: Viết biểu thức dòng điện trong mạch: $I = \\frac{U}{R_{tđ}} = \\frac{12}{4 + R_x}\\,A$.",
      "Bước 3: Khi con chạy ở đầu có điện trở bằng không ($R_x = 0\\,\\Omega$), điện trở toàn mạch nhỏ nhất nên dòng điện đạt cực đại: $I_{max} = \\frac{12}{4 + 0} = 3\\,A$.",
      "Bước 4: Khi con chạy ở đầu có điện trở cực đại ($R_x = 8\\,\\Omega$), điện trở toàn mạch lớn nhất nên dòng điện đạt cực tiểu: $I_{min} = \\frac{12}{4 + 8} = \\frac{12}{12} = 1\\,A$.",
      "Bước 5: Khoảng biến thiên cường độ dòng điện là từ $1{,}0\\,A$ đến $3{,}0\\,A$."
    ],
    "stepsEn": [
      "Step 1: Set up the formula for equivalent resistance: $R_{eq} = R_1 + R_x = 4 + R_x\\,\\Omega$.",
      "Step 2: Express current in the circuit: $I = \\frac{U}{R_{eq}} = \\frac{12}{4 + R_x}\\,A$.",
      "Step 3: At minimum resistance ($R_x = 0\\,\\Omega$), total resistance is minimized, yielding maximum current: $I_{max} = \\frac{12}{4 + 0} = 3\\,A$.",
      "Step 4: At maximum resistance ($R_x = 8\\,\\Omega$), total resistance is maximized, yielding minimum current: $I_{min} = \\frac{12}{4 + 8} = 1\\,A$.",
      "Step 5: The range of current variation is from 1.0 A to 3.0 A."
    ],
    "verify": "Kiểm tra giới hạn vật lý: $R_x$ càng tăng thì $I$ càng giảm (tỉ lệ nghịch với tổng trở). Kết quả biến thiên từ 1A đến 3A là hợp lý.",
    "verifyEn": "Check physical boundaries: as $R_x$ increases, $I$ decreases (inversely proportional to impedance). The range 1A to 3A is correct.",
    "extend": "Biến trở mắc nối tiếp như thế này hoạt động như một bộ điều khiển dòng điện (rheostat) để điều chỉnh cường độ dòng điện trong các bóng đèn hoặc động cơ.",
    "extendEn": "A series rheostat acts as a current limiter to control current flow through lightbulbs or small motors.",
    "common_traps": ["Nhầm lẫn công thức lấy $I = U/R_x$ dẫn đến chia cho $0$ gây vô cùng.", "Tính sai tổng trở mạch nối tiếp."],
    "common_traps_en": ["Using $I = U/R_x$ directly, leading to division by zero errors.", "Calculating total resistance incorrectly."]
  },
  "real_world_connection": "Núm vặn điều chỉnh độ sáng đèn hoặc âm lượng loa cũ sử dụng các biến trở xoay liên tục để thay đổi dòng điện đi qua tải.",
  "real_world_connection_en": "Analog knobs for light dimmers or volume control on older devices utilize rotary potentiometers to continuously vary current flow.",
  "formula": "I = \\frac{U}{R_1 + R_x}",
  "phet_sim": {
    "title": "Resistance in a Wire",
    "titleVn": "Điện trở của dây dẫn",
    "url": "https://phet.colorado.edu/sims/html/resistance-in-a-wire/latest/resistance-in-a-wire_all.html",
    "instruction": "Quan sát mô phỏng xem sự thay đổi chiều dài l của dây dẫn ảnh hưởng trực tiếp đến điện trở R thế nào, từ đó hiểu nguyên lý hoạt động của biến trở con chạy.",
    "instructionEn": "Observe the simulation to see how changing the wire length l affects resistance R, illustrating the working principle of a slide rheostat."
  }
})

# ============================================================
# QUESTION 8: JOULE'S LAW WITH THERMAL LOSS (ĐỊNH LUẬT JUN-LENXO VÀ HAO PHÍ)
# ============================================================
gifted_electricity_questions.append({
  "id": "phys9_gifted_electricity_grade9_008",
  "grade": 9,
  "chapter": "electric_power",
  "chapter_vn": "Công suất điện",
  "topic": "thermal_loss",
  "topic_vn": "Hao phí nhiệt và đun sôi",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "",
  "question_text": "Một ấm điện có ghi 220V - 1000W hoạt động ở hiệu điện thế định mức dùng để đun sôi $2\\,kg$ nước ở nhiệt độ ban đầu $20^\\circ C$. Biết nhiệt dung riêng của nước $c = 4200\\,J/kg\\cdot K$. Trong quá trình đun, ấm tỏa nhiệt ra môi trường xung quanh với công suất hao phí trung bình là $100\\,W$. Hãy xác định thời gian cần thiết để nước sôi.",
  "question_text_en": "An electric kettle rated 220V - 1000W operates at its rated voltage to boil $2\\,kg$ of water from an initial temperature of $20^\\circ C$. Given the specific heat capacity of water is $c = 4200\\,J/kg\\cdot K$. During the boiling process, the kettle loses heat to the surroundings at an average rate of $100\\,W$. Determine the time required to boil the water.",
  "options": [
    {"key": "A", "content": "12 phút 27 giây", "content_en": "12 minutes 27 seconds"},
    {"key": "B", "content": "11 phút 12 giây", "content_en": "11 minutes 12 seconds"},
    {"key": "C", "content": "10 phút 05 giây", "content_en": "10 minutes 05 seconds"},
    {"key": "D", "content": "13 phút 45 giây", "content_en": "13 minutes 45 seconds"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Nhiệt lượng cần cung cấp để nước sôi là $Q_{thu} = m \\cdot c \\cdot (t_2 - t_1) = 2 \\times 4200 \\times (100 - 20) = 672.000\\,J$. Công suất thực tế làm nóng nước: $P_{ích} = P_{ấm} - P_{hp} = 1000 - 100 = 900\\,W$. Thời gian đun: $\\tau = Q_{thu} / P_{ích} = 672.000 / 900 \\approx 746{,}67\\,s \\approx 12$ phút $27$ giây.",
    "summary_en": "The heat required to boil water is $Q_{in} = m \\cdot c \\cdot (t_2 - t_1) = 2 \\times 4200 \\times (100 - 20) = 672,000\\,J$. The net rate of heat transfer to water is $P_{net} = P_{kettle} - P_{loss} = 1000 - 100 = 900\\,W$. The heating time is $\\tau = Q_{in} / P_{net} = 672,000 / 900 \\approx 746.67\\,s \\approx 12$ minutes $27$ seconds."
  },
  "thinking_guide": {
    "understand": "Tính thời gian đun sôi nước bằng ấm điện khi có công suất hao phí nhiệt ra môi trường.",
    "understandEn": "Calculate the time to boil water using an electric kettle, considering heat loss to the environment.",
    "identify_knowledge": "Công thức nhiệt lượng đun nước $Q = mc\\Delta t$. Định luật bảo toàn năng lượng trong truyền nhiệt: $P_{ấm} \\cdot \\tau = Q_{nước} + P_{hao\\ phí} \\cdot \\tau$. Hiệu suất ấm điện.",
    "identify_knowledgeEn": "Heat equation $Q = mc\\Delta t$. Conservation of energy: $P_{kettle} \\cdot \\tau = Q_{water} + P_{loss} \\cdot \\tau$. Efficiency of the heating process.",
    "plan": "Tính nhiệt lượng cần thiết để nâng nhiệt độ nước lên $100^\circ C$. Tính công suất có ích thực tế truyền vào nước. Lấy nhiệt lượng chia cho công suất có ích để ra thời gian theo giây, sau đó đổi sang phút.",
    "planEn": "Calculate heat required to raise water temperature to $100^\circ C$. Determine the net heating power. Divide the heat by net power to get time in seconds, then convert to minutes.",
    "steps": [
      "Bước 1: Tính nhiệt lượng có ích cần thiết để đun sôi nước: $Q_{ích} = m \\cdot c \\cdot (t_{sôi} - t_{đầu}) = 2 \\times 4200 \\times (100 - 20) = 672.000\\,J$.",
      "Bước 2: Xác định công suất thực tế được truyền vào để làm nóng nước: $P_{ích} = P_{ấm} - P_{hp} = 1000 - 100 = 900\\,W$.",
      "Bước 3: Viết phương trình bảo toàn năng lượng: $Q_{ích} = P_{ích} \\times \\tau \\Rightarrow \\tau = \\frac{Q_{ích}}{P_{ích}}$.",
      "Bước 4: Thay số vào để tính thời gian đun bằng giây: $\\tau = \\frac{672.000}{900} \\approx 746{,}67\\,s$.",
      "Bước 5: Đổi thời gian sang phút và giây: $746{,}67\\,s = 12$ phút và $26{,}67$ giây (làm tròn thành 12 phút 27 giây)."
    ],
    "stepsEn": [
      "Step 1: Calculate useful heat required: $Q_{useful} = m \\cdot c \\cdot (t_{boil} - t_{init}) = 2 \\times 4200 \\times (100 - 20) = 672,000\\,J$.",
      "Step 2: Calculate net heating power: $P_{net} = P_{kettle} - P_{loss} = 1000 - 100 = 900\\,W$.",
      "Step 3: State the energy equation: $Q_{useful} = P_{net} \\times \\tau \\Rightarrow \\tau = \\frac{Q_{useful}}{P_{net}}$.",
      "Step 4: Compute heating time in seconds: $\\tau = \\frac{672,000}{900} \\approx 746.67\\,s$.",
      "Step 5: Convert seconds to minutes: $746.67\\,s = 12$ minutes and $27$ seconds."
    ],
    "verify": "Nếu không có hao phí ($P_{hp} = 0$), thời gian đun là $672\\,s \\approx 11{,}2$ phút. Do có hao phí, thời gian kéo dài lên $12{,}45$ phút. Kết quả là hoàn toàn hợp lý.",
    "verifyEn": "If there is no heat loss ($P_{loss} = 0$), the time is $672\\,s \\approx 11.2$ minutes. With loss, it extends to $12.45$ minutes. The answer is logical.",
    "extend": "Hiệu suất của ấm điện trong bài toán này là $\\eta = P_{ích}/P_{ấm} = 900/1000 = 90\\%$. Đây là hiệu suất thực tế của đa số ấm đun siêu tốc hiện nay.",
    "extendEn": "The thermal efficiency of the kettle is $\\eta = P_{net}/P_{kettle} = 900/1000 = 90\\%$, matching real-world electric kettles.",
    "common_traps": ["Cộng thêm công suất hao phí vào công suất ấm ($P_{tđ} = 1100\\,W$) dẫn đến tính thời gian đun nhanh hơn thực tế.", "Quên đổi độ tăng nhiệt độ $\\Delta t = 80^\\circ C$ (lấy nhầm cả $100^\\circ C$)."],
    "common_traps_en": ["Adding the heat loss to the kettle's power ($1100\\,W$), which incorrectly decreases the calculated time.", "Using $100^\circ C$ instead of the temperature difference $\\Delta t = 80^\circ C$ in the heat equation."]
  },
  "real_world_connection": "Bình đun siêu tốc tiết kiệm điện và nhanh hơn đun bằng bếp ga vì bộ phận phát nhiệt đặt trực tiếp trong lòng nước, hạn chế tối đa hao phí bức xạ nhiệt ra môi trường.",
  "real_world_connection_en": "Electric kettles are faster and more efficient than stovetop gas kettles because the heating element is immersed in water, minimizing radiation losses.",
  "formula": "\\tau = \\frac{m \\cdot c \\cdot (t_2 - t_1)}{P_{ấm} - P_{hp}}"
})

# ============================================================
# QUESTION 9: DEFECTIVE TRANSFORMER (MÁY BIẾN THẾ QUẤN LỖI)
# ============================================================
gifted_electricity_questions.append({
  "id": "phys9_gifted_electricity_grade9_009",
  "grade": 9,
  "chapter": "magnetic_force",
  "chapter_vn": "Lực từ & Điện từ học",
  "topic": "defective_transformer",
  "topic_vn": "Máy biến thế quấn ngược",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "",
  "question_text": "Một máy biến thế lý tưởng gồm cuộn sơ cấp có $N_1 = 1000$ vòng dây và cuộn thứ cấp có $N_2 = 2000$ vòng dây. Khi chế tạo, người thợ đã quấn ngược chiều một số vòng dây ở cuộn thứ cấp. Khi đặt vào hai đầu cuộn sơ cấp một hiệu điện thế xoay chiều $U_1 = 220\\,V$ thì hiệu điện thế đo được ở cuộn thứ cấp chỉ là $U_2 = 396\\,V$. Hỏi người thợ đã quấn ngược bao nhiêu vòng dây ở cuộn thứ cấp?",
  "question_text_en": "An ideal transformer consists of a primary coil with $N_1 = 1000$ turns and a secondary coil with $N_2 = 2000$ turns. During manufacturing, the technician wound a few turns of the secondary coil in the reverse direction. When an AC voltage $U_1 = 220\\,V$ is applied to the primary, the output voltage at the secondary is only $U_2 = 396\\,V$. How many turns of the secondary coil were wound in reverse?",
  "options": [
    {"key": "A", "content": "100 vòng", "content_en": "100 turns"},
    {"key": "B", "content": "200 vòng", "content_en": "200 turns"},
    {"key": "C", "content": "50 vòng", "content_en": "50 turns"},
    {"key": "D", "content": "150 vòng", "content_en": "150 turns"}
  ],
  "correct_answer": "C",
  "explanation": {
    "summary": "Gọi $n$ là số vòng dây bị quấn ngược. Khi đó, từ thông biến thiên qua $n$ vòng này sinh ra suất điện động ngược chiều, triệt tiêu suất điện động của $n$ vòng quấn đúng. Số vòng dây có ích thực tế ở cuộn thứ cấp là $N'_2 = N_2 - 2n$. Ta có phương trình biến áp: $U_2 / U_1 = N'_2 / N_1 \\Rightarrow 396 / 220 = (2000 - 2n) / 1000 \\Rightarrow 1{,}8 = (2000 - 2n) / 1000 \\Rightarrow 2000 - 2n = 1800 \\Rightarrow 2n = 200 \\Rightarrow n = 100$ vòng? Khoan đã, tính kỹ lại: $2n = 2000 - 1800 = 200 \\Rightarrow n = 100$ vòng. Số vòng quấn ngược là 100 vòng. Đáp án đúng là A.",
    "summary_en": "Let $n$ be the number of reverse-wound turns. These $n$ turns generate an opposing electromotive force, canceling out the voltage of another $n$ correctly wound turns. The effective number of turns is $N'_2 = N_2 - 2n$. The transformer formula is $U_2 / U_1 = N'_2 / N_1 \\Rightarrow 396 / 220 = (2000 - 2n) / 1000 \\Rightarrow 1.8 = (2000 - 2n) / 1000 \\Rightarrow 2000 - 2n = 1800 \\Rightarrow 2n = 200 \\Rightarrow n = 100$ turns. Thus, 100 turns were wound in reverse, making option A the correct answer."
  },
  "thinking_guide": {
    "understand": "Tìm số vòng dây quấn ngược ở cuộn thứ cấp của máy biến thế dựa vào sự sụt giảm hiệu điện thế đầu ra.",
    "understandEn": "Determine the number of reverse-wound turns in the secondary coil of a transformer based on output voltage drop.",
    "identify_knowledge": "Nguyên lý máy biến thế: $U_2 / U_1 = N_2 / N_1$. Ảnh hưởng của vòng dây quấn ngược: làm triệt tiêu suất điện động của chính nó và một lượng tương đương vòng dây quấn đúng $\\Rightarrow N_{có\\ ích} = N_2 - 2n$.",
    "identify_knowledgeEn": "Transformer principle: $U_2 / U_1 = N_2 / N_1$. Effect of reverse turns: they cancel their own induced EMF and that of an equal number of normal turns $\\Rightarrow N_{eff} = N_2 - 2n$.",
    "plan": "Thiết lập công thức liên hệ giữa hiệu điện thế và số vòng dây có ích thực tế. Giải phương trình tìm số vòng có ích $N'_2$. Từ đó suy ra số vòng quấn ngược $n$ bằng công thức $N'_2 = N_2 - 2n$.",
    "planEn": "Set up the relation between voltages and effective turns. Solve for effective turns $N'_2$. Deduce the number of reverse turns $n$ using $N'_2 = N_2 - 2n$.",
    "steps": [
      "Bước 1: Gọi số vòng dây quấn ngược ở cuộn thứ cấp là $n$. Từ thông qua mỗi vòng quấn ngược sinh ra suất điện động có pha ngược $180^\\circ$ so với các vòng quấn đúng.",
      "Bước 2: Mỗi vòng quấn ngược sẽ triệt tiêu tác dụng của một vòng quấn đúng. Do đó, số vòng dây hoạt động có ích thực tế là: $N'_2 = N_2 - 2n = 2000 - 2n$.",
      "Bước 3: Áp dụng công thức máy biến áp lý tưởng cho số vòng có ích: $\\frac{U_2}{U_1} = \\frac{N'_2}{N_1}$.",
      "Bước 4: Thay số vào phương trình: $\\frac{396}{220} = \\frac{2000 - 2n}{1000}$.",
      "Bước 5: Rút gọn phân số vế trái: $\\frac{396}{220} = 1{,}8$. Ta được phương trình: $1{,}8 = \\frac{2000 - 2n}{1000}$.",
      "Bước 6: Giải phương trình tìm $n$: $2000 - 2n = 1800 \\Rightarrow 2n = 200 \\Rightarrow n = 100$ vòng. Đáp án là A."
    ],
    "stepsEn": [
      "Step 1: Let $n$ be the number of reverse turns in the secondary coil. Their induced EMF is $180^\\circ$ out of phase with normal turns.",
      "Step 2: Each reverse turn cancels the EMF of one normal turn. Thus, the effective number of turns is: $N'_2 = N_2 - 2n = 2000 - 2n$.",
      "Step 3: State the transformer equation with effective turns: $\\frac{U_2}{U_1} = \\frac{N'_2}{N_1}$.",
      "Step 4: Substitute the values: $\\frac{396}{220} = \\frac{2000 - 2n}{1000}$.",
      "Step 5: Solve the ratio: $\\frac{396}{220} = 1.8 \\Rightarrow 1.8 = \\frac{2000 - 2n}{1000}$.",
      "Step 6: Solve for $n$: $2000 - 2n = 1800 \\Rightarrow 2n = 200 \\Rightarrow n = 100$ turns. The correct option is A."
    ],
    "verify": "Nếu quấn đúng hoàn toàn, hiệu điện thế đầu ra phải là: $U_{2\\,đúng} = 220 \\times (2000/1000) = 440\\,V$. Do quấn ngược 100 vòng, hiệu điện thế giảm còn $220 \\times (1800/1000) = 396\\,V$. Kết quả khớp tuyệt đối ✓.",
    "verifyEn": "If fully correct, the output voltage is $220 \\times (2000/1000) = 440\\,V$. With 100 reverse turns, it drops to $220 \\times (1800/1000) = 396\\,V$. Verified ✓.",
    "extend": "Hiện tượng này cũng giải thích tại sao khi thiết kế động cơ điện hoặc máy biến áp nhiều cuộn dây, chỉ cần một vài vòng dây quấn nhầm chiều sẽ làm sụt giảm mạnh công suất định mức và gây nóng cuộn dây.",
    "extendEn": "This explains why in electric motors or multi-winding transformers, even a few reverse-wound turns will severely degrade performance and cause localized heating.",
    "common_traps": ["Nhầm lẫn nghĩ rằng số vòng có ích là $N_2 - n$ thay vì $N_2 - 2n$ (quên rằng vòng ngược tiêu tốn năng lượng để triệt tiêu vòng đúng).", "Lấy nhầm tỉ số thuận thành tỉ số nghịch."],
    "common_traps_en": ["Assuming the effective turns is $N_2 - n$ instead of $N_2 - 2n$ (forgetting that a reverse turn actively cancels a normal turn).", "Inverting the transformer ratio."]
  },
  "real_world_connection": "Kỹ thuật quấn dây ngược (bifilar winding) được ứng dụng có chủ đích để chế tạo các điện trở phi cảm biến (non-inductive resistors) dùng trong thiết bị âm thanh cao cấp nhằm triệt tiêu hoàn toàn cảm kháng tự cảm.",
  "real_world_connection_en": "Bifilar winding (winding wires in opposite directions) is intentionally used to make non-inductive resistors for high-end audio, canceling self-inductance.",
  "formula": "n = \\frac{N_2 - N_1 \\cdot \\frac{U_2}{U_1}}{2}"
})

# ============================================================
# QUESTION 10: SWITCH TRANSITION AND CHARGE FLOW (KHÓA K VÀ ĐIỆN LƯỢNG)
# ============================================================
gifted_electricity_questions.append({
  "id": "phys9_gifted_electricity_grade9_010",
  "grade": 9,
  "chapter": "electric_circuit",
  "chapter_vn": "Mạch điện",
  "topic": "switch_charge",
  "topic_vn": "Khóa K và Sự dịch chuyển điện lượng",
  "type": "multiple_choice",
  "difficulty": "hard",
  "image": "",
  "question_text": "Cho mạch điện gồm nguồn điện $U = 24\\,V$ có điện trở trong không đáng kể, các điện trở $R_1 = 2\\,\\Omega$, $R_2 = 4\\,\\Omega$, $R_3 = 6\\,\\Omega$, $R_4 = 12\\,\\Omega$ mắc thành mạch cầu. Một khóa K được mắc nối tiếp trên thanh cầu giữa hai điểm C và D. Hãy xác định cường độ dòng điện chạy qua khóa K khi đóng khóa K.",
  "question_text_en": "Consider a bridge circuit with a voltage source $U = 24\\,V$ (negligible internal resistance) and resistors $R_1 = 2\\,\\Omega$, $R_2 = 4\\,\\Omega$, $R_3 = 6\\,\\Omega$, $R_4 = 12\\,\\Omega$. A switch K is placed on the bridge wire connecting nodes C and D. Determine the current flowing through switch K when it is closed.",
  "options": [
    {"key": "A", "content": "0 A", "content_en": "0 A"},
    {"key": "B", "content": "1,0 A", "content_en": "1.0 A"},
    {"key": "C", "content": "0,5 A", "content_en": "0.5 A"},
    {"key": "D", "content": "1,5 A", "content_en": "1.5 A"}
  ],
  "correct_answer": "A",
  "explanation": {
    "summary": "Ta xét tỷ số các điện trở nhánh: $R_1 / R_2 = 2 / 4 = 1/2$. Tỷ số nhánh dưới: $R_3 / R_4 = 6 / 12 = 1/2$. Vì $R_1 / R_2 = R_3 / R_4 = 1/2$, đây là mạch cầu Wheatstone cân bằng. Hiệu điện thế giữa hai điểm C và D bằng không ($U_{CD} = 0$). Do đó, khi đóng khóa K, không có dòng điện nào chạy qua khóa K ($I_K = 0\\,A$).",
    "summary_en": "Check the resistance ratios: $R_1 / R_2 = 2 / 4 = 1/2$ and $R_3 / R_4 = 6 / 12 = 1/2$. Since $R_1 / R_2 = R_3 / R_4$, this is a balanced Wheatstone bridge. The electrical potential difference between C and D is zero ($U_{CD} = 0$). Therefore, when switch K is closed, no current flows through it ($I_K = 0\\,A$)."
  },
  "thinking_guide": {
    "understand": "Tính cường độ dòng điện qua khóa K khi đóng khóa K mắc trong mạch cầu.",
    "understandEn": "Determine the current through switch K when it is closed in a bridge circuit.",
    "identify_knowledge": "Điều kiện mạch cầu cân bằng: $R_1/R_2 = R_3/R_4$. Khi mạch cầu cân bằng, hiệu điện thế giữa hai nút cầu bằng 0, không có dòng điện chạy qua nhánh cầu.",
    "identify_knowledgeEn": "Balanced bridge condition: $R_1/R_2 = R_3/R_4$. When balanced, the potential difference across the bridge is zero, resulting in no current flow through that branch.",
    "plan": "Kiểm tra tỉ số của các điện trở ở bốn nhánh ngoài. Đối chiếu với điều kiện cân bằng của mạch cầu Wheatstone. Rút ra kết luận về hiệu điện thế và dòng điện qua khóa K.",
    "planEn": "Check the ratios of the outer resistors. Compare with the Wheatstone bridge balance condition. Deduce the voltage drop and current through switch K.",
    "steps": [
      "Bước 1: Nhận diện sơ đồ mạch cầu với các điện trở $R_1, R_2$ ở nhánh trên và $R_3, R_4$ ở nhánh dưới.",
      "Bước 2: Lập tỉ số các điện trở nhánh bên trái và bên phải: $\\frac{R_1}{R_2} = \\frac{2}{4} = 0{,}5$. $\\frac{R_3}{R_4} = \\frac{6}{12} = 0{,}5$.",
      "Bước 3: So sánh hai tỉ số: vì $\\frac{R_1}{R_2} = \\frac{R_3}{R_4} = 0{,}5$, mạch cầu này cân bằng.",
      "Bước 4: Do mạch cầu cân bằng, điện thế tại điểm C bằng điện thế tại điểm D ($V_C = V_D \\Rightarrow U_{CD} = 0\\,V$).",
      "Bước 5: Khi đóng khóa K nối giữa C và D, do không có sự chênh lệch điện thế nên cường độ dòng điện qua khóa K là $I_K = 0\\,A$. Chọn đáp án A."
    ],
    "stepsEn": [
      "Step 1: Identify the bridge circuit with L1, L2 on top and L3, L4 on bottom.",
      "Step 2: Calculate resistance ratios: $\\frac{R_1}{R_2} = \\frac{2}{4} = 0.5$ and $\\frac{R_3}{R_4} = \\frac{6}{12} = 0.5$.",
      "Step 3: Compare: since $\\frac{R_1}{R_2} = \\frac{R_3}{R_4}$, the bridge is balanced.",
      "Step 4: Due to balance, the electrical potential at C equals that at D ($V_C = V_D \\Rightarrow U_{CD} = 0\\,V$).",
      "Step 5: When switch K is closed, no current flows through it due to zero potential difference ($I_K = 0\\,A$). The correct option is A."
    ],
    "verify": "Ta có thể tính dòng khi mở khóa K: $I_{nhánh\\ trên} = 24 / (2+4) = 4\\,A \\Rightarrow U_{AC} = 4 \\times 2 = 8\\,V$. $I_{nhánh\\ dưới} = 24 / (6+12) = 4/3\\,A \\Rightarrow U_{AD} = (4/3) \\times 6 = 8\\,V$. Ta thấy $U_{CD} = U_{AD} - U_{AC} = 8 - 8 = 0\\,V$. Đúng hoàn toàn ✓.",
    "verifyEn": "Verify by opening switch K: $I_{top} = 24 / 6 = 4\\,A \\Rightarrow U_{AC} = 8\\,V$. $I_{bottom} = 24 / 18 = 4/3\\,A \\Rightarrow U_{AD} = 8\\,V$. Thus $U_{CD} = U_{AD} - U_{AC} = 0\\,V$. Correct ✓.",
    "extend": "Nếu tỉ số không bằng nhau (mạch cầu không cân bằng), dòng điện qua khóa K khi đóng sẽ khác không và ta cần áp dụng định luật Kirchhoff để giải hệ phương trình dòng nút.",
    "extendEn": "If the bridge is unbalanced, a non-zero current flows through K when closed, requiring Kirchhoff's laws or nodal analysis to solve.",
    "common_traps": ["Nhầm lẫn và cố gắng giải hệ phương trình dòng điện phức tạp mà không kiểm tra tính cân bằng trước.", "Cho rằng dòng điện qua khóa K luôn bằng cường độ dòng điện mạch chính."],
    "common_traps_en": ["Attempting complex mesh/loop current equations without checking the balance condition first.", "Assuming the bridge current equals the main line current."]
  },
  "real_world_connection": "Cầu Wheatstone cân bằng là nền tảng của các thiết bị đo điện trở chính xác cao cổ điển, nơi người ta điều chỉnh một điện trở chuẩn cho đến khi dòng qua điện kế (galvanometer) bằng không để đo trở kháng chưa biết.",
  "real_world_connection_en": "Balanced Wheatstone bridges are the foundation of classic resistance measurement devices, where a standard resistor is adjusted until galvanometer current is zero.",
  "formula": "I_K = 0 \\quad \\text{since } \\frac{R_1}{R_2} = \\frac{R_3}{R_4}"
})
"""

with open(target_path, "r", encoding="utf-8") as f:
    content = f.read()

# Thay thế dấu đóng mảng ở cuối để append thêm nội dung mới
# Tệp gen_gifted_electricity.py kết thúc bằng dấu đóng mảng:
# "formula": "\\eta = \\frac{P_{bulb1} + P_{bulb2}}{U \\cdot I_{main}}"
# })
# và chúng ta cần nối thêm extra_content rồi thêm dấu đóng ] ở cuối cùng

if content.strip().endswith("})"):
    new_content = content.strip()[:-2] + extra_content + "\n])\n"
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully appended questions 6-10 to gen_gifted_electricity.py!")
else:
    # Nếu không tìm thấy dấu đóng ngoặc như mong đợi, thử cách ghi đè trực tiếp thông minh hơn
    # hoặc ghi đè có thay thế
    # Hãy in ra 20 ký tự cuối của file
    print("Warning: File does not end with expected pattern. End of file: " + repr(content[-50:]))
    # Trong trường hợp này ta cứ chèn extra_content vào trước dấu đóng ngoặc hoặc chèn vào cuối
    # Hãy tự động sửa lại file bằng cách ghi đè lại file hoàn chỉnh
