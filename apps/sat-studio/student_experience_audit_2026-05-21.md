# Audit trải nghiệm học sinh SAT Studio - 2026-05-21

## Cách audit

- Vai trò dùng thử: `student-demo`.
- Ngôn ngữ: tiếng Việt.
- Thao tác đã chạy: đăng nhập, xem Dashboard, mở Pretest, làm nhanh 20 câu, xem kết quả, mở Roadmap, Lessons, Topics, Practice, Review, Notes, Vocab, Official Log, News, Guide, quay lại Dashboard.
- Kết quả mô phỏng sau pretest: 20 câu, 15 đúng, 5 sai, baseline 1280. Phiên browser audit không có runtime error.

## Nhận định tổng quan

SAT Studio đã có lõi học tập khá mạnh: có baseline, roadmap theo lỗi, queue ôn sai, lesson theo subskill, practice theo topic, vocab, ghi chú, điểm thưởng và log ngoài app. Vấn đề chính hiện nay không phải thiếu tính năng, mà là học sinh bị đặt trước quá nhiều thông tin cùng lúc.

Mục tiêu UX nên đổi từ "cho học sinh thấy toàn bộ hệ thống" sang "mỗi thời điểm chỉ nói rõ 1 việc cần làm tiếp theo". Học sinh cần cảm giác: hôm nay mình phải làm gì, vì sao làm việc đó giúp tăng điểm, làm xong sẽ mở khóa bước nào.

Ba lỗi lớn nhất cần xử lý:

1. Giao diện student vẫn lẫn nhiều tiếng Anh và thuật ngữ nội bộ.
2. Một số màn hình quá dài, đặc biệt Roadmap, Vocab, phần chi tiết review sau pretest.
3. Practice đang lộ nhiều yếu tố quản trị/chất lượng câu hỏi như review status, source, license, governance, report/admin controls. Với học sinh, các phần này gây nhiễu và làm mất cảm giác đang học.

## 1. Đăng nhập và vào app

### Quan sát

- Student vào được dashboard nhanh.
- Vai trò, target score và avatar hiện rõ.
- Với học sinh thật, passcode local/demo chưa phải vấn đề nếu chỉ dùng nội bộ, nhưng khi public cần cảm giác "tài khoản học tập" chuyên nghiệp hơn.

### Điểm ổn

- Ít bước để vào app.
- Học sinh không bị đưa qua phần admin.
- Sidebar đã lọc đúng các mục chính của student.

### Vấn đề

- Sau khi vào app, màn đầu tiên rất nhiều thông tin. Học sinh mới chưa biết nên nhìn chỗ nào trước.
- Nhiều nhãn còn tiếng Anh: `Run the first pretest`, `Score ladder`, `Next best action`, `Redeem points`.
- Nav có lỗi tiếng Việt: `Bai hoc` thiếu dấu.

### Đề xuất

- Sau login, hiển thị một hero nhỏ "Việc cần làm hôm nay" với đúng 1 nút chính.
- Với học sinh chưa có baseline: nút duy nhất nên là `Làm bài đầu vào 20 câu`.
- Với học sinh đã có baseline: nút chính nên là `Ôn 5 câu đang đến hạn` hoặc `Luyện kỹ năng yếu nhất`.
- Sửa toàn bộ nhãn student sang tiếng Việt, chỉ giữ nguyên nội dung câu hỏi và đáp án.

## 2. Sidebar và cấu trúc điều hướng

### Quan sát

Nav student hiện có: Tổng quan, Kiểm tra đầu vào, Lộ trình, Bài học, Chuyên đề, Luyện tập, Ôn lỗi sai, Ghi chú, Từ vựng, Log bài chính thức, Tin tức, Hướng dẫn.

### Điểm ổn

- Các mục chính đầy đủ cho một hệ thống tự học SAT.
- Học sinh có thể đi từ diagnostic sang roadmap, lesson, practice, review.

### Vấn đề

- 12 mục là nhiều với học sinh grade 10 hoặc học sinh mới bắt đầu.
- `Chuyên đề`, `Luyện tập`, `Bài học`, `Ôn lỗi sai` có liên quan chặt nhưng đang tách ngang hàng, làm học sinh không biết nên dùng mục nào trước.
- `Log bài chính thức`, `Tin tức`, `Hướng dẫn` là công cụ phụ, không nên cạnh tranh thị giác với việc học chính.

### Đề xuất

- Nhóm nav student thành 4 cụm:
  - `Hôm nay`: Dashboard, nhiệm vụ, queue cần làm.
  - `Học`: Bài học, Chuyên đề.
  - `Luyện`: Practice, Ôn lỗi sai, Pretest.
  - `Công cụ`: Ghi chú, Từ vựng, Official Log, Tin tức, Hướng dẫn.
- Gắn badge nhỏ vào mục cần hành động: `5 cần ôn`, `1 bài mới`, `20 câu`.
- Khi học sinh bấm "Hôm nay", không cần đọc toàn bộ hệ thống, chỉ cần biết nhiệm vụ tiếp theo.

## 3. Dashboard trước khi có baseline

### Quan sát

Dashboard trước pretest hiển thị target 1450, baseline trống, accuracy 0%, due 0, points 0, streak 0, reward, quest, study loop, external links, smart brief.

### Điểm ổn

- Có hệ thống điểm, streak, quest, reward. Đây là nền tốt để tạo động lực.
- Có CTA `Start Pretest`.
- Có luồng học 5 bước: Pretest, Targeted practice, Notebook, Khan/Bluebook, Official practice.

### Vấn đề

- Màn hình cao khoảng 2500px, nhiều hơn mức cần thiết cho ngày đầu tiên.
- Học sinh chưa có baseline nhưng vẫn thấy quá nhiều khu như rewards, external links, smart brief, actions.
- Một số quest chưa gắn với mục tiêu tăng điểm. Ví dụ "trả lời 10 câu" có thể khiến học sinh làm nhiều nhưng không đúng kỹ năng yếu.

### Đề xuất

- Trước baseline, Dashboard chỉ nên có:
  - Card chính: `Làm bài đầu vào 20 câu`.
  - Card phụ: `Bài này dùng để tìm kỹ năng yếu, không phải điểm SAT chính thức`.
  - Card reward nhỏ: `Hoàn thành pretest nhận X điểm`.
- Ẩn hoặc thu gọn reward store, external links, smart brief cho tới khi học sinh có baseline.
- Quest nên đổi từ số lượng thô sang nhiệm vụ học có ý nghĩa:
  - `Hoàn thành diagnostic`.
  - `Xem 3 câu sai đầu tiên`.
  - `Viết 1 ghi chú lỗi sai`.
  - `Làm lại 2 proof questions`.

## 4. Kiểm tra đầu vào - chọn chế độ

### Quan sát

Sau chỉnh gần đây, phần pretest đã gọn hơn: 20 câu, 98 câu, Adaptive v2, RW check, Math check. Đây là hướng đúng.

### Điểm ổn

- Nút chọn chế độ rõ hơn trước.
- Kết quả đã được thu gọn thành lịch sử, không mở review toàn bộ mặc định.
- Học sinh thấy được 20 câu là quick baseline, 98 câu là full simulation.

### Vấn đề

- Readiness card vẫn còn nhiều chữ kỹ thuật: `Ready - confidence high`, `assembled from ready local questions`.
- Học sinh không cần biết "local bank", "confidence high", "module routing" ngay lúc chọn bài.
- `Official full-length source` bằng tiếng Anh, hơi giống cảnh báo pháp lý hơn là hướng dẫn học.

### Đề xuất

- Với student, readiness nên chuyển thành nhãn thân thiện:
  - `Sẵn sàng`.
  - `20 câu - khoảng 25 phút`.
  - `Phù hợp để lấy baseline hôm nay`.
- Thêm nhãn đề xuất:
  - `Nên làm trước` trên 20 câu nếu chưa có baseline.
  - `Làm khi có 2 giờ yên tĩnh` trên 98 câu.
- Ẩn toàn bộ ngôn ngữ nội bộ về bank/source khỏi student.

## 5. Màn hình làm bài pretest

### Quan sát

Màn làm bài có timer, câu hỏi, lựa chọn, nút lưu đáp án, hủy. Câu hỏi và phương án giữ tiếng Anh, đúng yêu cầu.

### Điểm ổn

- Cấu trúc giống bài test: câu hỏi ở giữa, timer rõ.
- Có kiểm soát thời gian.
- Việc giữ nguyên câu hỏi/đáp án tiếng Anh là đúng.

### Vấn đề

- Trong test vẫn có gợi ý chọn từ để lưu vào SAT Vocab. Đây là tính năng hay trong practice, nhưng trong timed diagnostic có thể gây phân tâm.
- Source badge và nhãn dạng `Original`, `Hard`, domain quá nhiều. Học sinh trong lúc test không cần biết nguồn.
- Nút `Cancel` đặt gần `Save Answer`, có thể gây lo lắng nếu bấm nhầm.
- Chưa thấy thanh tiến độ rõ kiểu `12/20` theo bước trực quan.

### Đề xuất

- Trong diagnostic timed mode:
  - Ẩn vocab selection hint.
  - Ẩn source badge.
  - Đổi `Cancel` thành menu phụ hoặc `Thoát bài` có confirm rõ.
  - Thêm progress bar ngang: `Câu 12/20`.
  - Thêm trạng thái nhỏ: `Đã lưu câu này` sau khi submit.
- Sau mỗi câu không nên giải thích ngay trong diagnostic, để giữ cảm giác thi.

## 6. Kết quả pretest

### Quan sát

Sau bài 20 câu, lịch sử hiển thị: baseline 1280, RW 590, Math 690, 15/20 đúng, 5 sai, accuracy 75%. Chi tiết review không mở mặc định, bấm `Xem chi tiết` mới mở 20 câu.

### Điểm ổn

- Đây là cải tiến tốt so với trước.
- Tóm tắt score, correct/wrong/no answer rõ.
- Chi tiết có đủ đáp án, lựa chọn sai, explanation.

### Vấn đề

- Khi mở chi tiết, chiều cao lên rất lớn, khoảng 16k px. Với học sinh, xem 20 câu cùng lúc vẫn quá tải.
- Phần chi tiết vẫn mở theo thứ tự câu, chưa ưu tiên câu sai hoặc kỹ năng yếu.
- Chưa có "bài học rút ra" sau test.

### Đề xuất

- Kết quả diagnostic nên có 3 tab:
  - `Tổng quan`: điểm, số đúng/sai, top 3 kỹ năng yếu.
  - `Cần sửa trước`: chỉ hiện câu sai và câu bỏ trống.
  - `Tất cả câu`: mở toàn bộ khi cần.
- Mỗi câu sai nên có card học tập ngắn:
  - Lỗi chính: knowledge gap, misread, trap, calculation.
  - Quy tắc cần nhớ.
  - Vì sao đáp án sai hấp dẫn.
  - 1 proof question liên quan.
- Sau pretest nên có CTA duy nhất: `Sửa 3 lỗi quan trọng nhất`.

## 7. Roadmap sau pretest

### Quan sát

Roadmap sau pretest rất giàu dữ liệu: baseline, target gap, weak skills, readiness 1600, weekly missions, mastery ladder, diagnostic review. Chiều cao màn khoảng 23k px.

### Điểm ổn

- Có năng lực phân tích rất mạnh.
- Có thể xác định kỹ năng yếu như Probability, Form/Structure/Sense, Words in Context.
- Có các nút practice đúng kỹ năng.

### Vấn đề

- Quá dài với học sinh. Đây là màn nên trả lời "học gì tiếp", nhưng hiện đang giống báo cáo chuyên gia.
- Nhiều phần phù hợp với tutor/phụ huynh hơn là student.
- Có nhiều thuật ngữ: `Low confidence`, `tracked skills`, `weak clusters`, `proof log`, `mastery ladder`.
- Nếu học sinh đang ở trình độ grade 10, nhiều thuật ngữ SAT 1600 làm tăng áp lực.

### Đề xuất

- Tách Roadmap student thành 4 tab:
  - `Hôm nay`: 1 lesson + 1 practice + 1 review.
  - `Tuần này`: 3 mục tiêu kỹ năng.
  - `Bản đồ kỹ năng`: toàn bộ domain/subskill.
  - `Chi tiết`: dành cho tutor/parent.
- Card đầu tiên phải là action card:
  - `Hôm nay sửa Probability trước`.
  - `Làm 8 câu scaffold, mục tiêu 6/8 đúng`.
  - Nút: `Bắt đầu`.
- Biến `170 point gap` thành tiến trình thân thiện:
  - `1280 -> 1450: còn 170 điểm`.
  - `Giai đoạn hiện tại: SAT Core`.
  - `Mở khóa giai đoạn tiếp theo khi đạt 80% ở 3 kỹ năng yếu`.

## 8. Bài học

### Quan sát

Lessons có danh sách subskill và chi tiết gồm concept, worked example, traps, scaffold drill, proof drills, external links, related learning.

### Điểm ổn

- Cấu trúc bài học đúng với đào tạo SAT: concept, example, trap, proof.
- Có lộ trình Pre-SAT Grade 10 -> SAT Core -> Transfer -> 1550-1600.
- Đây là phần có giá trị sư phạm rất cao.

### Vấn đề

- Danh sách lesson đang hiển thị quá nhiều item và mỗi item dài.
- Nhiều heading còn tiếng Anh: `Subskill lessons`, `Choose subskill`, `Stage playbook`, `Worked example pattern`, `Likely traps`.
- Học sinh không biết lesson nào nên học trước nếu không nhìn roadmap.

### Đề xuất

- Mặc định Lessons nên mở ở `Bài được đề xuất cho bạn`, dựa trên pretest.
- Mỗi lesson card chỉ cần:
  - Tên kỹ năng.
  - Lý do học.
  - Thời lượng.
  - Mức: Grade 10, SAT Core, SAT Hard.
  - Nút `Học ngay`.
- Trong lesson detail thêm checkpoint:
  - `Tôi hiểu quy tắc`.
  - `Làm 3 ví dụ scaffold`.
  - `Làm proof question`.
- Sau khi đọc lesson, hệ thống tự chuyển sang practice cùng subskill.

## 9. Chuyên đề

### Quan sát

Topics cho phép lọc section, domain, skill, difficulty, source. Có rất nhiều skill và thẻ topic.

### Điểm ổn

- Hữu ích cho học sinh có tutor giao chủ đề cụ thể.
- Phù hợp cho tự luyện theo domain.

### Vấn đề

- Bộ lọc quá chuyên môn với học sinh tự học.
- `Source`, `reviewed`, `need review`, `Foundation`, `Antigravity`, `OpenSAT` không nên hiện cho student.
- Topic list dễ biến thành "ngân hàng câu hỏi", không phải "lộ trình học".

### Đề xuất

- Student mode nên có 2 cách chọn:
  - `Theo lộ trình đề xuất`.
  - `Tự chọn chủ đề`.
- Khi tự chọn, chỉ giữ filter: Section, Domain, Skill, Difficulty.
- Ẩn filter Source và Review Status khỏi student.
- Thêm các chip gợi ý: `Đang yếu`, `Sắp thi`, `Hard practice`, `Ôn nền grade 10`.

## 10. Practice

### Quan sát

Practice có câu hỏi, answer options, timer modes, bookmark/review, highlight, related learning, pacing analytics, math tools, error diagnosis, mistake note.

### Điểm ổn

- Đây là màn học trung tâm và có nhiều công cụ tốt.
- Có pacing target.
- Có error tagging và mistake note, rất quan trọng cho SAT.
- Có thể nối với Khan/Bluebook.

### Vấn đề nghiêm trọng

- Student đang thấy nhiều nội dung quản trị câu hỏi: `Question Governance`, `Quality audit`, `Needs Review`, `Reviewed`, `Reject`, source/license/publication note.
- Đây là P0 UX issue. Học sinh không nên thấy câu hỏi đang reviewed hay needs_review. Điều này làm giảm niềm tin vào chất lượng câu hỏi và làm màn luyện tập giống công cụ admin.
- Nút `x` trong answer options nhìn lạ, có thể là remove/clear nhưng không rõ ý nghĩa.
- Error tagging có nhiều lựa chọn, tốt cho tutor nhưng hơi nặng với học sinh nhỏ.
- Sau khi trả lời, feedback cần nổi bật hơn: đúng/sai, vì sao, học gì tiếp theo.

### Đề xuất

- Student Practice chỉ nên có:
  - Câu hỏi.
  - Đáp án.
  - Check Answer.
  - Explanation.
  - `Tôi sai vì...` với 4 lựa chọn đơn giản: Không nhớ quy tắc, Đọc nhầm, Dính bẫy, Tính sai.
  - `Lưu vào sổ lỗi`.
  - `Làm câu tương tự`.
- Chuyển source/license/governance sang admin-only.
- Feedback sau answer nên có cấu trúc:
  - `Đúng/Sai`.
  - `Quy tắc`.
  - `Bẫy`.
  - `Cách làm nhanh`.
  - `Next: làm 2 câu cùng dạng`.
- Nếu học sinh trả lời sai 2 lần cùng skill, tự bật mini lesson trước khi cho làm tiếp.

## 11. Ôn lỗi sai

### Quan sát

Review có remediation queue, due dates, tutor priority, open lesson, lesson reviewed, proof now. Sau pretest có 5 câu cần ôn.

### Điểm ổn

- Đây là tính năng rất giá trị để nâng trình độ.
- Có logic teach-before-retest và proof condition.
- Có thể biến lỗi sai thành nhiệm vụ học cụ thể.

### Vấn đề

- Màn Review khá dài và nhiều thuật ngữ: remediation, proof item, tutor high, scaffold, transfer.
- Nhiều item mở chi tiết cùng lúc, học sinh dễ bị ngợp.
- Học sinh cần biết "ôn lỗi sai trong bao lâu, làm thế nào là xong".

### Đề xuất

- Mặc định Review chỉ hiển thị danh sách gọn:
  - Kỹ năng.
  - Lỗi.
  - Hạn ôn.
  - Số câu proof cần làm.
  - Nút `Ôn ngay`.
- Khi mở một item, chỉ hiện 3 bước:
  - Đọc lại quy tắc.
  - Làm 3 câu scaffold.
  - Làm 1 proof question.
- Thêm trạng thái hoàn thành:
  - `Đã sửa lỗi`.
  - `Cần học lại`.
  - `Đang chờ proof`.

## 12. Ghi chú

### Quan sát

Notes có form thêm note, loại note, priority, tags, star for review, search/filter.

### Điểm ổn

- Gọn và đúng mục tiêu.
- Có phân loại concept, mistake, strategy, formula, vocabulary.
- Có starred review.

### Vấn đề

- Học sinh thường không tự biết nên ghi gì.
- Nếu để form trống, notes sẽ ít được dùng.

### Đề xuất

- Sau mỗi câu sai, thêm nút `Tạo ghi chú từ lỗi này`.
- Auto-fill note:
  - Title: skill + trap.
  - Rule: lấy từ explanation.
  - Mistake: đáp án học sinh chọn.
  - Correction: cách tránh lần sau.
- Thêm template nhanh:
  - `Quy tắc cần nhớ`.
  - `Bẫy tôi vừa dính`.
  - `Công thức`.
  - `Từ vựng`.

## 13. Từ vựng

### Quan sát

Vocab có 164 từ, flashcard, quiz, category, search, known/learning. Chiều cao màn khoảng 29k px do hiển thị rất nhiều từ.

### Điểm ổn

- Có bank từ vựng riêng.
- Có flashcard, quiz, category, known state.
- Có tiếng Việt trong định nghĩa, rất hữu ích cho học sinh Việt Nam.

### Vấn đề

- Màn quá dài và dễ gây choáng.
- Flashcard và danh sách từ đang cạnh tranh nhau.
- Học sinh nên học theo set nhỏ, không nhìn toàn bộ 164 từ.

### Đề xuất

- Mặc định chỉ hiển thị:
  - Card hôm nay: 10 từ.
  - Nút `Bắt đầu quiz`.
  - Tiến độ: đã thuộc bao nhiêu từ.
- Danh sách đầy đủ đưa vào tab `Tất cả từ`.
- Khi học sinh chọn từ trong câu hỏi, vocab nên tạo card theo ngữ cảnh câu đó.
- Thêm chế độ `SAT context`: từ + câu ví dụ SAT + câu hỏi mini.

## 14. Official Log

### Quan sát

Official Log cho phép ghi metadata: nguồn, section, skill reference, result, note. Có cảnh báo không copy official content.

### Điểm ổn

- Đúng về copyright safety.
- Giúp phụ huynh/tutor biết kết quả Bluebook/Khan mà không lưu nội dung chính thức.

### Vấn đề

- Với học sinh, form hơi khô.
- Chưa có biểu đồ tiến bộ official score.

### Đề xuất

- Chia thành 2 chế độ:
  - `Log điểm bài thi`.
  - `Log lỗi theo skill`.
- Với Bluebook full test, cho nhập RW, Math, total score, date, notes.
- Sau khi nhập, Dashboard nên cập nhật "Official trend".

## 15. Tin tức

### Quan sát

Student news hiện trống nếu admin chưa đăng.

### Điểm ổn

- Có mục để admin truyền thông tin cho thành viên.

### Vấn đề

- Nếu trống, màn này không có giá trị học tập.
- Với student, tin tức nên phục vụ học tập, không chỉ thông báo.

### Đề xuất

- Khi chưa có tin, hiển thị placeholder có ích:
  - `Chưa có thông báo. Hôm nay hãy tiếp tục nhiệm vụ trên Dashboard.`
- Admin nên có mẫu tin:
  - Trọng tâm tuần.
  - Lịch mock test.
  - Kỹ năng cần ôn.
  - Thành tích/leaderboard nội bộ nếu phù hợp.

## 16. Hướng dẫn

### Quan sát

Guide hiện có cả learner, parent, admin, copyright safety.

### Điểm ổn

- Đầy đủ cho vận hành nội bộ.
- Có quy tắc nguồn dữ liệu.

### Vấn đề

- Student không cần thấy quá nhiều phần parent/admin/content safety.
- Guide là tài liệu vận hành, không phải onboarding học sinh.

### Đề xuất

- Student Guide nên chỉ có:
  - `Làm gì trong 10 phút đầu`.
  - `Cách tăng điểm mỗi ngày`.
  - `Khi sai một câu, phải làm gì`.
  - `Khi nào làm full test`.
- Parent/Admin guide tách riêng theo role.

## 17. Dashboard sau pretest

### Quan sát

Sau pretest, Dashboard tốt hơn nhiều: baseline 1280, target 1450, accuracy 76%, 5 due reviews, next best action là review due mistakes, điểm thưởng tăng lên.

### Điểm ổn

- Đây là vòng học đúng: pretest -> weak skill -> review due -> practice.
- Học sinh thấy tiến bộ và nhiệm vụ tiếp theo.
- Points/streak giúp tăng động lực.

### Vấn đề

- Vẫn còn nhiều chữ tiếng Anh và nhiều khối cạnh tranh.
- Mục tiêu `Review due mistakes` nên nổi bật hơn reward và external links.
- Cần biến dashboard thành "daily cockpit" thật sự.

### Đề xuất

- Sau pretest, Dashboard nên ưu tiên:
  - `Việc cần làm ngay`: ôn 5 câu sai.
  - `Kỹ năng yếu nhất`: Probability.
  - `Mục tiêu hôm nay`: sửa 3 lỗi, làm 8 câu practice.
  - `Phần thưởng`: sau khi hoàn thành.
- Các khối phụ đưa vào accordion hoặc tab.

## Checklist hành động ưu tiên

### P0 - Bắt buộc trước khi cho student dùng rộng

- Ẩn toàn bộ `Question Governance`, `Quality audit`, source/license/review status khỏi student Practice.
- Sửa triệt để ngôn ngữ student sang tiếng Việt, trừ câu hỏi và đáp án.
- Sửa `Bai hoc` thành `Bài học`.
- Rút Roadmap student về tab `Hôm nay` mặc định, không mở toàn bộ báo cáo.
- Rút Vocab về daily set, không render toàn bộ danh sách từ mặc định.

### P1 - Tăng hiệu quả học và tự học

- Thêm post-pretest plan: `3 lỗi cần sửa trước`, `bài học cần đọc`, `proof cần làm`.
- Mỗi câu sai có card học tập: quy tắc, bẫy, vì sao sai, câu tương tự.
- Auto-create note từ câu sai.
- Review queue hiển thị dạng danh sách đóng, chỉ mở một item khi học sinh chọn.
- Practice feedback chuẩn hóa thành: Correct/Wrong, Rule, Trap, Fast method, Next action.

### P2 - Tăng độ thú vị và giữ chân học sinh

- Biến reward thành mission gắn với học thật: sửa lỗi, proof pass, streak ôn sai.
- Thêm "skill ladder" trực quan từ Grade 10 -> SAT Core -> Hard -> 1550+.
- Thêm unlock/badge theo kỹ năng, không chỉ theo số câu.
- Tin tức nên có weekly focus và thông báo thành tích.
- Dashboard có "hôm nay hoàn thành X%" và animation nhỏ khi xong nhiệm vụ.

## Nguyên tắc thiết kế student mode nên áp dụng

1. Mỗi màn chỉ có một hành động chính.
2. Dữ liệu chuyên gia đưa vào chi tiết, không đưa lên mặc định.
3. Student không thấy trạng thái quản trị câu hỏi.
4. Sai một câu phải dẫn tới một hành động học cụ thể.
5. Gamification phải thưởng cho hành vi nâng trình độ, không chỉ thưởng số lượng câu.
6. Từ Grade 10 đến SAT 1600 cần thể hiện bằng ladder rõ, để học sinh biết mình đang ở đâu và bước kế tiếp là gì.

