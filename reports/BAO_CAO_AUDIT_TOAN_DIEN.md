# BÁO CÁO AUDIT TOÀN DIỆN HỆ THỐNG MIUPREP

Ngày audit: 11/06/2026

**Phạm vi:** 6 apps (portal, miumath, miuphysics, ielts-desktop, cpe-desktop, sat-studio) + 8 packages dùng chung, ~50MB source code, hơn 18.000 câu hỏi trong ngân hàng nội dung.

**Điểm tổng thể: 6.5/10** — Nền tảng kiến trúc tốt, nội dung phong phú, nhưng còn khoảng cách lớn về bảo mật, hạ tầng chất lượng (CI/CD), và độ "thông minh" thực sự của engine thích ứng.

---

## I. ĐIỂM MẠNH (đáng giữ và phát huy)

1. **Kiến trúc monorepo kỷ luật tốt** — 8 packages chia tầng rõ ràng (`knowledge → learning → content → core → db → ai`), không có circular dependency, tất cả apps import qua `@miuprep/*` đúng chuẩn workspace.
2. **Prompt engineering chất lượng cao** — Chấm Writing theo kiến trúc 2-pass (kiểm kê định lượng → chấm 4 tiêu chí Cambridge/IELTS), có evidence trích dẫn, `whyNotHigher`, gợi ý Socratic song ngữ. Đây là tài sản cạnh tranh thật sự.
3. **Schema validation nghiêm ngặt cho AI output** — feedback sai cấu trúc không bao giờ lọt vào DB. Retry có exponential backoff, phân loại lỗi retryable/non-retryable đúng chuẩn.
4. **Content quality gates bài bản** — guard reports cho từng môn (blocker / display-ready / scored-practice-ready), English 3.161 câu 0 blocker, CAE 3.829 câu sẵn sàng.
5. **SM-2 spaced repetition** cài đặt đúng cho Error Notebook.
6. **Offline-first với dual storage** (LocalStorage web / SQLite Tauri desktop) — hướng đi đúng cho thị trường VN.

---

## II. PHÁT HIỆN NGHIÊM TRỌNG (cần xử lý ngay)

### A. Bảo mật

| # | Vấn đề | Vị trí | Mức độ |
|---|--------|--------|--------|
| 1 | Mật khẩu admin hardcode dạng SHA256 của `admin123` — crack được trong vài giây | `apps/ielts-desktop/src/App.tsx:605,626` | CRITICAL |
| 2 | API key gửi thẳng từ client — OpenAI/Gemini key nằm trong header request từ browser, lộ qua DevTools | `packages/ai/src/adapters/openai.ts:25`, `gemini.ts:25` | CRITICAL |
| 3 | "Mã hóa" key bằng XOR + salt cố định — chỉ là security theater | `packages/ai/src/utils/credential-store.ts:27-80` | HIGH |
| 4 | Phân quyền admin chỉ ở client — flag `isAdmin` có thể bị sửa, không có kiểm tra server-side | `apps/ielts-desktop/src/App.tsx:802` | HIGH |
| 5 | PII học sinh (trẻ vị thành niên) lưu plaintext — tên, email, SĐT, điểm thi không mã hóa. Rủi ro pháp lý (Nghị định 13, GDPR) | `packages/db/src/tauri-sqlite-adapter.ts:394-410` | HIGH |
| 6 | Gemini key trong `apps/sat-studio/.env` — đã kiểm chứng: KHÔNG bị commit vào git, không có prefix `VITE_` nên không bị bundle vào client. Vẫn nên rotate định kỳ | `apps/sat-studio/.env` | MEDIUM |
| 7 | SHA256 thay vì bcrypt/Argon2 cho mật khẩu; đề thi chẩn đoán + đáp án hardcode trong client (học sinh xem được đáp án qua source) | `Onboarding.tsx` | MEDIUM |

### B. Hạ tầng chất lượng — lỗ hổng lớn nhất

- **Không có CI/CD nào cả** — không GitHub Actions, không pre-commit hook. Mọi test chạy tay. Không có gì ngăn code hỏng được push.
- **Không có Error Boundary** trong bất kỳ app React nào — một lỗi runtime làm trắng toàn bộ màn hình học sinh.
- **Không có crash reporting / telemetry** (Sentry, v.v.) — không biết học sinh gặp lỗi gì ngoài thực tế.
- **miumath-app và miuphysics-app: 0 test, viết bằng JSX thuần (không TypeScript)** trong khi cả hệ còn lại là TS strict.
- **Portal tắt ESLint rules quan trọng** (`no-explicit-any: off`, `exhaustive-deps: off`) — nợ kỹ thuật tích lũy ngầm.

### C. Trùng lặp code quy mô lớn

`cpe-desktop` và `ielts-desktop` là bản sao 88–99.8% của nhau:

| Component | Mức giống nhau |
|-----------|----------------|
| AdaptivePracticeRoom.tsx (~1.578 dòng) | 98.1% |
| ErrorNotebook.tsx | 99.8% |
| ExamSectionSheet.tsx | 99.7% |
| SpeakingAiRoom.tsx | 98.8% |
| Onboarding.tsx | 94.6% |
| WritingAiRoom.tsx | 87.7% |

Tổng cộng **~25% code 2 app này là copy-paste**. Mỗi bug fix phải sửa 2 nơi.

### D. File khổng lồ

- `packages/content/src/math6-enrichment.ts`: **700.000+ dòng** trong 1 file TS
- `packages/knowledge/src/index.ts`: 173.000 dòng
- `apps/miuprep-portal/src/App.tsx`: 2.689 dòng (God component)
- JSON public: `antigravity-bank.json` ~986.000 dòng

---

## III. KHOẢNG CÁCH ĐỂ THÀNH "SỐ 1 THẾ GIỚI"

So với các nền tảng dẫn đầu (Duolingo, Khan Academy, Squirrel AI), khoảng cách không nằm ở nội dung — nằm ở 4 thứ:

### 1. Engine "thích ứng" hiện tại chưa thực sự thích ứng (4/10)

- Mastery model chỉ là **đếm số câu đúng/sai theo ngưỡng** (accuracy < 50% → repair, ≥ 80% → stable). Không có IRT, không Elo, không calibration độ khó từ dữ liệu thực.
- Diagnostic là **chọn ngẫu nhiên có lọc độ khó**, không phải CAT (Computerized Adaptive Testing). Duolingo xác định trình độ trong 5 phút vì mỗi câu tiếp theo được chọn để tối đa hóa thông tin; hệ hiện tại cần 20 câu cố định.
- Đã có shadow report độ khó thực nghiệm (`buildEmpiricalDifficultyShadowReport`) nhưng `applied = false` — dữ liệu có sẵn mà chưa dùng.

### 2. Dữ liệu học tập bị giam trong từng thiết bị

- Không có backend sync (trừ sat-studio đã có mầm backend với SQLite + rate-limit + session). Học sinh đổi máy = mất hết tiến độ.
- Tiến độ IELTS/CPE/Math/SAT **không nhìn thấy nhau** dù knowledge graph đã thống nhất.
- Đây là rào cản lớn nhất cho: trải nghiệm người dùng, analytics cho phụ huynh/giáo viên, và việc calibrate độ khó câu hỏi từ dữ liệu cộng đồng.

### 3. AI vận hành chưa có kiểm soát chi phí & độ trễ

- Không streaming → học sinh chờ trắng màn hình 2–3+ giây mỗi lần chấm.
- Không cache, không cost tracking, không quota — mở rộng người dùng = hóa đơn API không kiểm soát.
- Model dùng là `gemini-1.5-flash`/`gpt-4o` — đã cũ so với các thế hệ hiện tại, vừa đắt hơn vừa kém hơn.

### 4. Không có vòng phản hồi vận hành

- Không telemetry → không biết tính năng nào được dùng, học sinh rớt ở đâu, AI chấm có bị khiếu nại không.
- "Số 1 thế giới" được xây bằng vòng lặp đo lường → cải tiến; hiện vòng lặp này chưa tồn tại.

---

## IV. LỘ TRÌNH ĐỀ XUẤT

### Giai đoạn 1 — Củng cố nền móng (2–4 tuần)

1. **Bảo mật:** Rotate Gemini key; xóa credentials hardcode, chuyển sang setup-flow tạo mật khẩu lần đầu + bcrypt/Argon2; bỏ XOR store, chỉ dùng Tauri Keychain trên desktop.
2. **CI/CD tối thiểu:** 1 file GitHub Actions chạy `tsc --noEmit` + ESLint + package tests + Playwright smoke trên mỗi push. Thêm husky pre-commit. *Chi phí 1 ngày công, lợi ích vĩnh viễn.*
3. **Error Boundary + Sentry** (hoặc self-hosted GlitchTip) cho cả 6 app — bắt đầu nhìn thấy lỗi thực tế.
4. Bật lại ESLint rules ở portal; thêm `strict: true` cho cpe-desktop.

### Giai đoạn 2 — Trả nợ kiến trúc (4–8 tuần)

5. **Hợp nhất cpe-desktop + ielts-desktop** thành 1 app duy nhất nhận `track` config (`ielts | cae | cpe`) — giảm ~10.000 dòng code phải bảo trì kép.
6. **Tách content ra khỏi source:** chuyển `math6-enrichment.ts` (700k dòng) và các file tương tự sang JSON load theo nhu cầu — giảm thời gian build/typecheck và bundle size.
7. Migrate miumath/miuphysics sang TypeScript; tách `App.tsx` 2.689 dòng của portal thành routes.
8. **Backend sync trung tâm** — mở rộng từ mầm sat-studio backend đã có: 1 API (auth thật + sync learner events + proxy AI). Đây là khoản đầu tư chiến lược nhất: giải quyết cùng lúc lộ API key, sync đa thiết bị, phân quyền admin server-side, và thu thập dữ liệu calibration.

### Giai đoạn 3 — Vũ khí cạnh tranh (8–16 tuần)

9. **Nâng cấp engine thích ứng:** bắt đầu bằng Elo 2 chiều (learner ability × item difficulty — đơn giản, hiệu quả, Duolingo cũng khởi đầu vậy) → bật empirical difficulty đã có sẵn → diagnostic CAT chọn câu theo information gain thay vì random.
10. **Nâng cấp AI:** streaming response (giảm độ trễ cảm nhận xuống <1s), cache kết quả chấm, cost tracking + quota per user, nâng model lên thế hệ hiện tại, và xây **teacher double-scoring flow** để mở khóa mastery cho Writing/Speaking (hiện đang lock).
11. **Product analytics** (PostHog self-hosted phù hợp dữ liệu trẻ em) → vòng lặp đo lường-cải tiến.
12. **i18n framework** — externalize text Việt/Anh đang hardcode, mở đường ra thị trường quốc tế.

---

## V. NHẬN XÉT TỔNG KẾT

Hệ thống có **"phần hồn" tốt hơn mức trung bình ngành** — knowledge graph thống nhất 5 chương trình, prompt chấm thi chuẩn Cambridge có evidence, content gates nghiêm túc. Cái thiếu là **"phần xương": backend trung tâm, CI/CD, và toán học thật sự trong engine thích ứng**. Ba thứ này không hào nhoáng nhưng là chính xác những gì phân biệt sản phẩm số 1 thế giới với sản phẩm tốt: Duolingo thắng không phải nhờ nội dung mà nhờ vòng lặp dữ liệu → calibration → cá nhân hóa chạy hàng triệu lần mỗi ngày.

**Nếu chỉ làm được 3 việc trong quý này:**

1. CI/CD + Sentry
2. Backend sync / proxy AI
3. Hợp nhất 2 app desktop

Mọi tham vọng khác đều xây nhanh hơn trên nền đó.
