# 🗺️ LỘ TRÌNH TỐI ƯU HỆ THỐNG MIUPREP — CHECKLIST TRIỂN KHAI

> **Nguồn:** Báo cáo audit toàn diện `reports/BAO_CAO_AUDIT_TOAN_DIEN.md` (11/06/2026)
> **Quy tắc cập nhật:** File này là nguồn sự thật duy nhất về tiến độ. Mỗi task hoàn thành phải được đánh dấu `[x]` kèm ngày, và CHỈ được đánh dấu sau khi **test PASS**.
> **Cập nhật 11/06/2026 (theo yêu cầu):** test 1 vòng sau mỗi task là đủ. Vòng 2 chỉ áp dụng tùy chọn cho các task bảo mật CRITICAL hoặc thay đổi kiến trúc lớn.

---

## 📐 QUY TRÌNH BẮT BUỘC CHO MỖI TASK (Định nghĩa "Hoàn thành")

Mỗi task chỉ được coi là hoàn thành khi đi qua đủ 4 bước:

1. **Làm** — thực hiện thay đổi code/config theo các bước trong task.
2. **Test — Kiểm tra trực tiếp:** chạy lệnh test/build được ghi trong task, xác nhận PASS. (Các task ghi "Test vòng 2" bên dưới: vòng 2 là tùy chọn, ưu tiên chạy cho task bảo mật/kiến trúc lớn.)
3. **Ghi nhận** — đánh dấu `[x]`, ghi ngày + kết quả test vào nhật ký.
4. **Commit** — commit riêng cho task đó với message rõ ràng (không gộp nhiều task vào 1 commit).

**Ký hiệu trạng thái:**
- `[ ]` chưa làm | `[~]` đang làm | `[x]` hoàn thành (đã test 2 vòng) | `[!]` bị chặn (ghi lý do)

**Lệnh test chuẩn của hệ thống (tham chiếu):**

| Mã | Lệnh | Phạm vi |
|----|------|---------|
| T-PKG | `npm test -w @miuprep/core -w @miuprep/content -w @miuprep/learning -w @miuprep/db -w @miuprep/knowledge -w @miuprep/ai -w @miuprep/beta` | Unit test 7 packages |
| T-BUILD | `npm run build` (root — build-workspaces.cjs, đúng thứ tự phụ thuộc) | Build toàn bộ |
| T-SAT | `npm run test:vite -w sat-studio` (typecheck + 14 domain tests + build) | SAT studio |
| T-E2E-IELTS | `npm run test:e2e -w @miuprep/desktop` | Playwright IELTS |
| T-E2E-CPE | `npm run test:e2e -w @miuprep/cpe-desktop` | Playwright CPE |
| T-QA-PORTAL | `npm run qa:portal-template-practice && npm run qa:portal-english-item-bank-practice` | QA portal smoke |
| T-LINT | `npm run lint -w miuprep-portal -w @miuprep/desktop -w @miuprep/cpe-desktop -w miumath-app` | ESLint các app |

---

## 🏁 GIAI ĐOẠN 0 — THIẾT LẬP BASELINE (trước khi sửa bất kỳ thứ gì)

> Mục đích: chụp lại trạng thái "xanh" hiện tại. Mọi task sau này so sánh với baseline để biết có gây hồi quy không.

- [x] **0.1. Chạy toàn bộ unit test packages, ghi lại kết quả baseline** *(11/06/2026 — Vòng 1: 7/7 packages PASS, exit 0 · Vòng 2: 7/7 PASS, exit 0, không flaky)*
  - Lệnh: T-PKG (log: `scratch/test-round2.log`)
- [x] **0.2. Build toàn bộ workspace, ghi nhận lỗi/warning** *(11/06/2026 — Build PASS, exit 0; kiểm tra 14/14 workspace đều có `dist/`; không có warning chunk-size trong log)*
  - Lệnh: T-BUILD (log: `scratch/build-round1.log`)
- [x] **0.3. Chạy SAT domain tests baseline** *(11/06/2026 — Vòng 1: typecheck PASS + 14/14 test files PASS + vite build PASS · Vòng 2: 14/14 PASS, exit 0)*
  - Lệnh: T-SAT (log: `scratch/sat-test-round1.log`, `sat-test-round2.log`)
- [x] **0.4. Commit trạng thái working tree hiện tại** *(11/06/2026 — commit `0ebddd52` "Baseline: snapshot working tree before optimization roadmap", 254 file; `git status` sạch sau commit)*

---

## 🔴 GIAI ĐOẠN 1 — CỦNG CỐ NỀN MÓNG (Tuần 1–4)

### 1.1. Bảo mật khẩn cấp

- [ ] **1.1.1. Rotate Gemini API key của sat-studio**
  - Bước: Tạo key mới trong Google AI Studio/Cloud Console → cập nhật `apps/sat-studio/.env` → vô hiệu key cũ
  - Test vòng 1: gọi thử 1 request Gemini bằng key mới (qua app hoặc curl) → thành công
  - Test vòng 2: gọi thử bằng key CŨ → phải bị từ chối (401/403); grep toàn repo không còn key cũ
- [ ] **1.1.2. Xóa credentials admin/student hardcode khỏi `apps/ielts-desktop/src/App.tsx:605,626`**
  - Bước: thay bằng first-run setup flow — lần đầu mở app bắt buộc tạo tài khoản admin với mật khẩu tự chọn
  - Test vòng 1: grep toàn repo không còn hash `240ef403...` và `264c8c38...`; chạy app mới (xóa localStorage) → hiện flow tạo admin
  - Test vòng 2: T-E2E-IELTS (cập nhật e2e nếu cần) + đăng nhập sai mật khẩu phải bị từ chối
- [ ] **1.1.3. Thay SHA256 bằng PBKDF2/Argon2 cho mật khẩu (có salt ngẫu nhiên)**
  - Bước: dùng Web Crypto `PBKDF2` (không cần dependency mới) với salt per-user, iterations ≥ 310.000; viết migration cho user cũ (re-hash khi đăng nhập thành công lần sau)
  - Test vòng 1: unit test hash/verify (2 user cùng mật khẩu → hash khác nhau; verify đúng/sai chính xác)
  - Test vòng 2: e2e đăng nhập với tài khoản tạo trước migration vẫn vào được, sau đó hash trong DB đã được nâng cấp
- [ ] **1.1.4. Gỡ bỏ ObfuscatedLocalStorageStore (XOR store) — `packages/ai/src/utils/credential-store.ts`**
  - Bước: desktop dùng TauriKeychainStore; bản web yêu cầu nhập key mỗi session (giữ trong memory) hoặc chặn tính năng AI khi không có keychain; migration: đọc key cũ 1 lần → chuyển vào keychain → xóa khỏi localStorage
  - Test vòng 1: `npm test -w @miuprep/ai` pass; kiểm tra localStorage sau migration không còn key
  - Test vòng 2: T-E2E-IELTS + T-E2E-CPE (luồng Writing/Speaking AI vẫn hoạt động với keychain)
- [ ] **1.1.5. Che chắn đề chẩn đoán + đáp án hardcode trong `Onboarding.tsx`**
  - Bước: tối thiểu — tách đáp án ra khỏi bundle client (load từ content package có guard); ghi chú: giải pháp triệt để cần backend (task 2.4)
  - Test vòng 1: build xong, search trong `dist/` không thấy chuỗi đáp án
  - Test vòng 2: chạy onboarding e2e — diagnostic vẫn chấm điểm đúng

### 1.2. CI/CD + chốt chặn chất lượng

- [ ] **1.2.1. Tạo GitHub Actions workflow `.github/workflows/ci.yml`**
  - Nội dung: trigger push + PR → jobs: (a) T-PKG, (b) T-SAT typecheck + domain tests, (c) T-LINT, (d) T-BUILD
  - Test vòng 1: chạy từng lệnh của workflow ở local — tất cả pass
  - Test vòng 2: push lên branch thử → xem run trên GitHub Actions xanh toàn bộ
- [ ] **1.2.2. Thêm husky pre-commit hook**
  - Nội dung: `tsc --noEmit` cho workspace bị ảnh hưởng + eslint staged files (lint-staged)
  - Test vòng 1: tạo commit chứa lỗi TS cố ý → hook phải chặn
  - Test vòng 2: commit hợp lệ đi qua bình thường; clone sạch + `npm install` → hook tự cài
- [ ] **1.2.3. Thêm Prettier + format toàn repo (1 commit riêng chỉ format)**
  - Test vòng 1: `npx prettier --check .` pass
  - Test vòng 2: T-PKG + T-BUILD vẫn xanh sau format (format không đổi hành vi)

### 1.3. Quan sát được lỗi thực tế

- [ ] **1.3.1. Thêm ErrorBoundary component vào `@miuprep/ui`, bọc root của cả 6 app**
  - UI fallback thân thiện (tiếng Việt) + nút "Tải lại" + log lỗi vào SystemLog
  - Test vòng 1: unit test ErrorBoundary (component con throw → fallback hiện, app không trắng màn hình)
  - Test vòng 2: T-BUILD + throử lỗi thật trong dev mode ở portal và ielts-desktop → fallback hiển thị, SystemLog ghi nhận
- [ ] **1.3.2. Tích hợp crash reporting (Sentry hoặc GlitchTip self-hosted)**
  - Chú ý dữ liệu trẻ em: bật `beforeSend` scrub PII, không gửi nội dung bài làm
  - Test vòng 1: ném lỗi thử → event xuất hiện trên dashboard, KHÔNG chứa PII
  - Test vòng 2: build production + xác nhận sourcemap upload, lỗi minified vẫn đọc được stack
- [ ] **1.3.3. Bật lại ESLint rules ở portal (`no-explicit-any`, `exhaustive-deps`, `no-unused-vars`)**
  - Bước: bật từng rule → sửa vi phạm (hoặc `// eslint-disable-next-line` có ghi lý do từng chỗ)
  - Test vòng 1: `npm run lint -w miuprep-portal` 0 error
  - Test vòng 2: T-QA-PORTAL pass (sửa lint không phá hành vi)
- [ ] **1.3.4. Thêm `strict: true` cho cpe-desktop tsconfig**
  - Test vòng 1: `tsc -b` của cpe-desktop pass sau khi sửa lỗi strict
  - Test vòng 2: T-E2E-CPE pass

---

## 🟠 GIAI ĐOẠN 2 — TRẢ NỢ KIẾN TRÚC (Tuần 5–12)

### 2.1. Hợp nhất cpe-desktop + ielts-desktop

- [ ] **2.1.1. Đo lường chính xác diff giữa 2 app** (diff từng file trùng tên, lập bảng khác biệt → quyết định cấu hình `track`)
  - Test vòng 1: tài liệu diff hoàn chỉnh, review không sót file nào
  - Test vòng 2: xác nhận với bảng import — không component nào bị bỏ quên
- [ ] **2.1.2. Tách 6 component lớn trùng lặp vào package mới `@miuprep/exam-desktop-ui`** (AdaptivePracticeRoom, SpeakingAiRoom, WritingAiRoom, Onboarding, ErrorNotebook, ExamSectionSheet) — nhận `track: 'ielts' | 'cae' | 'cpe'` qua props/context
  - Test vòng 1: T-PKG + cả 2 app build pass, dùng component chung
  - Test vòng 2: T-E2E-IELTS + T-E2E-CPE pass đầy đủ (cả 7 spec mỗi app)
- [ ] **2.1.3. Hợp nhất phần còn lại → 1 app `exam-desktop` duy nhất với build config theo track**
  - Test vòng 1: build ra 2 bản (ielts/cpe) từ 1 codebase, e2e cả 2 pass
  - Test vòng 2: Tauri build thật trên Windows, mở app kiểm tra thủ công luồng: onboarding → thi → chấm AI → error notebook
- [ ] **2.1.4. Xóa 2 app cũ sau 2 tuần chạy song song không lỗi**

### 2.2. Tách content khỏi source code

- [ ] **2.2.1. Chuyển `math6-enrichment.ts` (700k dòng) + `math10-enrichment.ts` sang JSON load theo nhu cầu**
  - Test vòng 1: `npm test -w @miuprep/content` + guard math6/math10 pass, số câu hỏi trước/sau giống hệt (đếm + checksum)
  - Test vòng 2: T-BUILD — đo thời gian build giảm; app hiển thị câu hỏi bình thường (QA script)
- [ ] **2.2.2. Tách `packages/knowledge/src/index.ts` (173k dòng) thành data JSON + logic TS**
  - Test vòng 1: `npm test -w @miuprep/knowledge` pass, export API không đổi
  - Test vòng 2: T-PKG toàn bộ (các package phụ thuộc knowledge không vỡ)
- [ ] **2.2.3. Tách `apps/miuprep-portal/src/App.tsx` (2.689 dòng) thành routes/modules + React.lazy**
  - Test vòng 1: build + đo bundle chính giảm (ghi số liệu trước/sau)
  - Test vòng 2: T-QA-PORTAL pass cả 2 script

### 2.3. Chuẩn hóa 2 app JS còn lại

- [ ] **2.3.1. Migrate miumath-app sang TypeScript + viết test cho logic chấm điểm**
  - Test vòng 1: `tsc --noEmit` pass + test mới pass
  - Test vòng 2: build + kiểm tra thủ công các luồng chính của miumath
- [ ] **2.3.2. Migrate miuphysics-app sang TypeScript (tương tự)**

### 2.4. Backend trung tâm (đầu tư chiến lược nhất)

- [ ] **2.4.1. Thiết kế API contract** (auth, learner-events sync, AI proxy) — mở rộng từ nền sat-studio backend có sẵn (rate-limit, session, sqlite→postgres path)
  - Test vòng 1: review contract với toàn bộ use-case của 6 app — không thiếu endpoint
  - Test vòng 2: viết contract tests (schema request/response) chạy được
- [ ] **2.4.2. Triển khai auth thật (server-side session, role check server-side)**
  - Test vòng 1: integration tests — user thường gọi endpoint admin phải 403
  - Test vòng 2: pentest thủ công: sửa flag client, replay token, brute-force rate-limit
- [ ] **2.4.3. AI proxy — client không bao giờ giữ API key**
  - Test vòng 1: luồng chấm Writing/Speaking qua proxy hoạt động; key chỉ tồn tại server-side
  - Test vòng 2: kiểm tra DevTools network — không request nào ra api.openai.com / googleapis trực tiếp; CSP desktop bỏ 2 domain đó
- [ ] **2.4.4. Sync learner events đa thiết bị** (tận dụng `sync_status` + `idempotencyKey` đã có sẵn trong schema)
  - Test vòng 1: làm bài trên máy A → đăng nhập máy B thấy đủ tiến độ; conflict resolution test
  - Test vòng 2: test offline → online (queue đẩy lại, không trùng event nhờ idempotencyKey)
- [ ] **2.4.5. Mã hóa PII học sinh at-rest + chính sách xóa dữ liệu**
  - Test vòng 1: dump DB → các trường email/phone/tên không đọc được plaintext
  - Test vòng 2: luồng "xóa tài khoản" xóa thật (kiểm tra DB), audit log ghi nhận

---

## 🟢 GIAI ĐOẠN 3 — VŨ KHÍ CẠNH TRANH (Tuần 13–24)

### 3.1. Engine thích ứng thật sự

- [ ] **3.1.1. Bật empirical difficulty đã có sẵn** (`buildEmpiricalDifficultyShadowReport` → applied=true sau khi so khớp shadow vs thực tế)
  - Test vòng 1: so sánh shadow report với độ khó tay trên mẫu ≥500 câu — sai lệch trong ngưỡng chấp nhận
  - Test vòng 2: A/B nội bộ — nhóm dùng empirical difficulty không có hành vi bất thường (câu quá khó/quá dễ liên tục)
- [ ] **3.1.2. Cài Elo 2 chiều (learner ability × item difficulty)** trong `@miuprep/learning`
  - Test vòng 1: unit tests hội tụ trên dữ liệu mô phỏng (learner giỏi → rating tăng, item bị đoán sai nhiều → khó hơn)
  - Test vòng 2: replay toàn bộ learning events lịch sử qua engine mới — phân phối rating hợp lý, không NaN/explosion
- [ ] **3.1.3. CAT diagnostic — chọn câu theo information gain thay vì random**
  - Test vòng 1: mô phỏng 1.000 learner ảo — CAT hội tụ về đúng ability với ≤10 câu (so với 20 câu random)
  - Test vòng 2: e2e luồng diagnostic mới + so sánh kết quả với diagnostic cũ trên cùng learner thử nghiệm
- [ ] **3.1.4. Teacher double-scoring flow để mở khóa mastery Writing/Speaking**
  - Test vòng 1: luồng giáo viên chấm → đồng thuận với AI → mastery cập nhật; bất đồng → flag review
  - Test vòng 2: kiểm tra governance report ghi nhận đủ cặp điểm AI/teacher

### 3.2. AI vận hành cấp production

- [ ] **3.2.1. Streaming response cho chấm Writing/Speaking** (độ trễ cảm nhận <1s)
  - Test vòng 1: đo TTFB (time-to-first-byte) trước/sau, schema validation vẫn chạy trên kết quả cuối
  - Test vòng 2: test mạng chậm/đứt giữa chừng — retry/fallback đúng, không lưu feedback dở dang
- [ ] **3.2.2. Cache kết quả chấm (key = hash bài làm + prompt version)**
  - Test vòng 1: nộp lại bài giống hệt → trả từ cache, không gọi API (kiểm tra log)
  - Test vòng 2: sửa 1 ký tự bài làm → cache miss, gọi API mới
- [ ] **3.2.3. Cost tracking + quota per user + dashboard chi phí**
  - Test vòng 1: mỗi request ghi tokens/cost; vượt quota → chặn có thông báo thân thiện
  - Test vòng 2: đối chiếu tổng cost tracking với billing dashboard của provider (sai số <5%)
- [ ] **3.2.4. Nâng cấp model lên thế hệ hiện tại + chạy lại golden dataset calibration**
  - Test vòng 1: golden dataset — band score model mới lệch ≤0.5 band so với chuẩn
  - Test vòng 2: blind test 20 bài thật — giáo viên đánh giá feedback model mới ≥ model cũ

### 3.3. Vòng lặp đo lường & mở rộng

- [ ] **3.3.1. Product analytics (PostHog self-hosted — phù hợp dữ liệu trẻ em)**
  - Test vòng 1: events chính (bắt đầu bài, hoàn thành, rớt giữa chừng) xuất hiện đúng trên dashboard
  - Test vòng 2: audit payload — không có PII trong analytics events
- [ ] **3.3.2. i18n framework (i18next) — externalize text Việt/Anh**
  - Test vòng 1: chuyển đổi ngôn ngữ runtime hoạt động trên portal
  - Test vòng 2: script quét chuỗi hardcode còn sót — 0 kết quả trong components đã migrate
- [ ] **3.3.3. Bundle size budget + Lighthouse CI** (chặn PR làm phình bundle quá ngưỡng)

---

## 📊 BẢNG TIẾN ĐỘ TỔNG

| Giai đoạn | Tổng task | Hoàn thành | Tiến độ |
|-----------|-----------|------------|---------|
| GĐ 0 — Baseline | 4 | 4 | 100% |
| GĐ 1 — Nền móng | 12 | 0 | 0% |
| GĐ 2 — Kiến trúc | 13 | 0 | 0% |
| GĐ 3 — Cạnh tranh | 11 | 0 | 0% |
| **Tổng** | **40** | **4** | **10%** |

## 📝 NHẬT KÝ TRIỂN KHAI

| Ngày | Task | Kết quả test | Ghi chú |
|------|------|--------------|---------|
| 11/06/2026 | 0.1 | PASS — 7/7 packages (chạy 2 lần, ổn định) | Baseline xanh |
| 11/06/2026 | 0.2 | PASS — build 14/14 workspace, đủ `dist/`, không warning | |
| 11/06/2026 | 0.3 | PASS — typecheck + 14/14 domain tests + build (chạy 2 lần) | |
| 11/06/2026 | 0.4 | `git status` sạch sau commit | Commit `0ebddd52`, 254 file |
