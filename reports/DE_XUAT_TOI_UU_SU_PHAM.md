# ĐỀ XUẤT TỐI ƯU HÓA NỘI DUNG & PHƯƠNG PHÁP SƯ PHẠM HỆ THỐNG MIUPREP
**Mục tiêu:** Nâng cao chất lượng giáo dục, giúp học sinh cải thiện trình độ thực tế, tối ưu hóa nội dung câu hỏi/lời giải và tăng cường độ thông minh của engine thích ứng.

---

## 📐 MẢNG 1: TOÁN HỌC (LỚP 1–11 & SAT MATH)

Hiện tại, nội dung Toán cấp Tiểu học (Lớp 1-5) đã được chuẩn hóa khá tốt về mặt trực quan. Tuy nhiên, nội dung Toán cấp Trung học (Lớp 6-11) và SAT Math vẫn đang ở dạng tĩnh, lời giải chưa được cá nhân hóa cao.

### 1. Nâng cấp lời giải sang định dạng suy luận từng bước (Step-by-Step Reasoning)
*   **Vấn đề:** Lời giải môn toán ở các lớp lớn thường đưa ra đáp án cuối cùng quá nhanh hoặc chỉ có 1-2 dòng biến đổi đại số biến đổi tắt, khiến học sinh trung bình-khá dễ bị nản hoặc không hiểu bản chất.
*   **Giải pháp tối ưu:**
    *   **Phân rã bài toán (Problem Decomposition):** Mỗi câu hỏi trung bình hoặc khó phải đi kèm một lời giải được chia làm 3 phần rõ rệt:
        1.  *Cách quan sát (Thinking Guide):* Dẫn dắt tư duy (ví dụ: "Nhìn thấy tam giác vuông và đường cao, hãy nghĩ ngay đến hệ thức lượng...").
        2.  *Các bước thực hiện (Step-by-step Execution):* Trình bày chi tiết từng bước biến đổi đại số, tuyệt đối không viết tắt.
        3.  *Bẫy cần tránh (Trap Guide):* Chỉ ra lỗi sai phổ biến (ví dụ: "Học sinh thường quên đặt điều kiện cho biểu thức trong căn dưới mẫu...").
    *   **LaTeX & Trực quan hóa:** 100% công thức toán học phải hiển thị bằng LaTeX chuẩn thông qua KaTeX (đã được tích hợp trong `@miuprep/ui`). Đối với hình học, sử dụng các sơ đồ SVG vẽ động hoặc sơ đồ ASCII chi tiết để mô tả tọa độ/hình vẽ thay vì chỉ nói bằng chữ.

### 2. Phân loại lỗi sai tự động (Math Error Taxonomy Mapping)
*   **Vấn đề:** Học sinh làm sai bài toán có thể do tính toán sai (lỗi số học), hiểu sai công thức, hay thiếu điều kiện. Hệ thống hiện tại chưa phân biệt được để hỗ trợ.
*   **Giải pháp tối ưu:**
    *   Tận dụng bảng phân loại lỗi có sẵn `MATH_ERROR_TAXONOMY` (`wrong_formula`, `missing_condition`, `algebra_transform`, `calculation`, `reading_prompt`).
    *   Khi học sinh làm sai, AI Tutor sẽ phân tích chuỗi câu trả lời và tự động gán nhãn lỗi để đề xuất bài luyện tập khắc phục chính xác (ví dụ: Sai nhiều lỗi `algebra_transform` thì hệ thống sẽ tự động đề xuất khóa ôn tập nền tảng về biến đổi đa thức trước khi tiếp tục giải phương trình).

---

## 🔤 MẢNG 2: TIẾNG ANH HỌC THUẬT (IELTS, CAE, CPE)

Các module Writing và Speaking của MiuPrep đang hoạt động cực kỳ tốt nhờ cấu trúc chấm 2-pass của AI. Tuy nhiên, hai kỹ năng tiếp nhận (Receptive Skills) là Reading và Listening vẫn còn ở dạng thô sơ.

### 1. Tối ưu hóa Reading & Listening: Evidence Highlight & Distractor Explanation
*   **Vấn đề:** Hiện tại, học sinh làm sai Reading/Listening chỉ nhận được đáp án đúng (ví dụ: "A") và một lời giải thích chung chung. Học sinh không biết tại sao mình sai và tại sao các đáp án nhiễu khác lại không chính xác.
*   **Giải pháp tối ưu:**
    *   **Evidence Mapping (Chỉ ra bằng chứng):** Trích xuất câu văn/đoạn văn chính xác trong bài đọc hoặc bài nghe chứa đáp án đúng. Hiển thị đoạn văn này kèm theo tô đậm (Highlight) từ khóa đồng nghĩa (Paraphrased terms) để học sinh nhận diện.
    *   **Giải thích phương án nhiễu (Distractor Analysis):** Giải thích rõ ràng tại sao các đáp án còn lại (B, C, D) là sai (ví dụ: "Phương án B chứa từ khóa X trong bài nhưng X chỉ là ví dụ phụ, không phản ánh ý chính của đoạn văn").

### 2. Hoàn thiện hệ thống phản hồi phát âm Speaking (Phoneme-Level Pronunciation Feedback)
*   **Vấn đề:** Schema của hệ thống đã hỗ trợ `pronunciationErrors` chứa từ phát âm sai, IPA và gợi ý sửa, nhưng phần này đang bị khóa hoặc trả kết quả thô nếu không có audio.
*   **Giải pháp tối ưu:**
    *   Khi học sinh gửi file ghi âm (WebM/WAV), hệ thống backend cần tích hợp mô hình Speech-to-Text nâng cao để so khớp âm vị (Phoneme matching).
    *   Chỉ ra chính xác các lỗi nuốt âm đuôi (`/s/`, `/t/`, `/d/`), nối âm sai, nhấn sai trọng âm từ (Word stress) hoặc ngữ điệu đi lên/đi xuống không tự nhiên, đi kèm hướng dẫn đặt khẩu hình miệng bằng tiếng Việt.

---

## 🧠 MẢNG 3: ENGINE THÍCH ỨNG & ĐỒ THỊ KIẾN THỨC (PERSONALIZATION)

Để hệ thống thực sự giúp học sinh "nâng cao trình độ", chúng ta cần biến hệ thống từ một ngân hàng đề thông thường thành một **Người thầy số cá nhân hóa**.

### 1. Chống kẹt trong vòng lặp sửa sai (Repair-Loop Rerouting)
*   **Vấn đề:** Khi học sinh bị hổng kiến thức ở một kỹ năng (ví dụ: `math.solve_quadratic_by_factor` - giải phương trình bậc hai bằng cách phân tích thành nhân tử) và làm sai liên tục, thuật toán hiện tại tiếp tục đưa các câu hỏi tương tự ra bắt học sinh làm, dẫn đến ức chế và không tiến bộ.
*   **Giải pháp tối ưu:**
    *   **Rerouting Gate:** Đặt ngưỡng tối đa là **5 lần làm sai liên tiếp** trên cùng một nút kiến thức.
    *   Khi đạt ngưỡng này, hệ thống sẽ kích hoạt lệnh *Step-Back Recommendation* (Lùi một bước):
        1.  Tạm dừng đưa câu hỏi thực hành khó.
        2.  Tự động hiển thị một **Bài học siêu nhỏ (Micro-lesson)** bằng video ngắn hoặc thẻ kiến thức trực quan giải thích lại lý thuyết nền tảng.
        3.  Đưa học sinh về thực hành ở kỹ năng tiền đề (Prerequisite) có độ khó thấp hơn (ví dụ: quay lại luyện kỹ năng phân tích đa thức thành nhân tử lớp 8).

### 2. Tối ưu hóa ôn tập ngắt quãng (SRS Tuning) dựa trên loại lỗi sai
*   **Vấn đề:** Thuật toán SRS (Spaced Repetition System) hiện tại trong Sổ tay lỗi sai (`ErrorNotebook`) đang dùng chung một hệ số giãn cách cho tất cả các câu hỏi.
*   **Giải pháp tối ưu:**
    *   Điều chỉnh khoảng cách ôn tập dựa trên bản chất lỗi sai (`ErrorCategory`):
        *   *Lỗi Số học/Nhầm lẫn (Calculation Slip):* Giãn cách dài hơn vì học sinh chỉ nhầm lẫn nhất thời.
        *   *Lỗi Ngữ pháp/Collocation/Biến đổi đại số:* Giãn cách ngắn hơn (cần ôn tập lại sau 24h, 3 ngày, 7 ngày) vì đây là lỗ hổng kiến thức hệ thống.

---

## 🎮 MẢNG 4: TÍNH GIÁO DỤC, TƯƠNG TÁC & VẬN HÀNH

Phương pháp sư phạm tốt cần đi kèm với cơ chế động lực lành mạnh để học sinh tự giác học tập.

### 1. Chuyển đổi cơ chế thưởng sang "Ghi nhận nỗ lực" (Effort-Based Gamification)
*   **Vấn đề:** Nếu chỉ thưởng Salmon Coins khi học sinh làm đúng câu hỏi, học sinh sẽ có xu hướng đoán mò, chọn câu dễ để cày coins, hoặc gian lận tra đáp án.
*   **Giải pháp tối ưu:**
    *   Điều chỉnh chính sách thưởng Salmon Coins trong hệ thống (`apps/sat-studio/src/domain/rewards.ts`):
        *   **Thưởng lớn** cho việc hoàn thành việc ôn tập các câu hỏi đến hạn trong Sổ tay lỗi sai (`ErrorNotebook`).
        *   **Thưởng điểm chuyên cần (Consistency Streak):** Đăng nhập và làm tối thiểu 10 phút mỗi ngày.
        *   **Thưởng khi vượt ngưỡng khó:** Làm đúng các câu hỏi mà trước đây học sinh thường xuyên làm sai (Vượt qua giới hạn bản thân).

### 2. Giao diện báo cáo tiến độ trực quan dành cho Phụ huynh (Parent Radar Dashboard)
*   **Vấn đề:** Phụ huynh khó hiểu các chỉ số học thuật phức tạp của IELTS hay SAT, dẫn đến không biết con mình thực sự tiến bộ hay không.
*   **Giải pháp tối ưu:**
    *   Chuyển đổi dữ liệu học tập thành **Biểu đồ mạng nhện kỹ năng (Micro-skill Radar Chart)** trực quan. Hiển thị rõ: Năng lực hiện tại (Current), Mục tiêu (Target), và Độ phủ kiến thức (Coverage).
    *   Gửi thông báo định kỳ dạng ngôn ngữ tự nhiên: *"Tuần này, con đã nỗ lực sửa được 5 lỗi sai kinh điển về thì hiện tại hoàn thành và nâng mức thành thạo kỹ năng đọc hiểu lên 15%."*

---

## V. MA TRẬN PHÂN BỔ CẢI TIẾN SƯ PHẠM

| Mảng hệ thống | Hành động cụ thể | Kênh kiểm định chất lượng | Mức độ ảnh hưởng sư phạm |
| :--- | :--- | :--- | :---: |
| **Toán THCS/SAT** | Viết lại lời giải 3 phần (Nhìn - Làm - Tránh) bằng LaTeX | `npm run build` + Kiểm định PDF hình vẽ | **Rất cao** |
| **Reading/Listening** | Bổ sung câu trích dẫn bằng chứng và phân tích phương án nhiễu | Content Guard Validator | **Cao** |
| **Speaking** | Phân tích lỗi phát âm IPA từng từ qua Audio | AI Governance Report | **Rất cao** |
| **Mastery Engine** | Triển khai Step-Back Recommendation khi kẹt vòng lặp | `npm test -w @miuprep/learning` | **Cực kỳ cao** |
| **Gamification** | Chuyển sang Effort-based rewards, duyệt thưởng qua phụ huynh | `npm run test:vite -w sat-studio` | **Trung bình** |
