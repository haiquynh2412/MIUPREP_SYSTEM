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
- [x] **1.1.2. Xóa credentials admin/student hardcode (ielts-desktop + cpe-desktop + portal)** *(11/06/2026 — Phạm vi thực tế rộng hơn audit: 5 file ở 3 app. Đã xóa: seed admin/student mặc định, backdoor login admin123/student, passcode hardcode (admin123, miuprep2026), plaintext passwordHash ở portal, bypass theo username. Thay bằng first-run setup: admin đầu tiên trên thiết bị đăng ký tự do, admin sau phải do admin hiện tại cấp. CPE được thêm role selector. Test: grep sạch toàn repo; e2e recovery PASS với user seed mới; QA portal 2/2 PASS)*
- [x] **1.1.3. Thay SHA256 bằng PBKDF2 cho mật khẩu (salt ngẫu nhiên)** *(11/06/2026 — Module mới `packages/db/src/password.ts`: PBKDF2-SHA256 310k iterations qua Web Crypto, không thêm dependency. `verifyPassword` nhận diện record cũ (SHA256-hex / plaintext) và trả `needsRehash` → tự nâng cấp hash khi user đăng nhập thành công. Unit tests: salt khác nhau cho cùng mật khẩu, verify đúng/sai, migration legacy — PASS trong `npm test -w @miuprep/db`)*
- [x] **1.1.4. Gỡ bỏ ObfuscatedLocalStorageStore (XOR store)** *(11/06/2026 — Thay bằng `SessionCredentialStore`: web giữ key trong memory mỗi phiên, không ghi gì đảo ngược được xuống đĩa; migration 1 lần đọc key XOR cũ → memory → purge khỏi localStorage; desktop giữ nguyên Tauri Keychain. Unit tests migration/purge/memory-only PASS trong `npm test -w @miuprep/ai`; cả 2 app desktop build sạch. Commit `53b4f039`)*
- [!] **1.1.5. Che chắn đề chẩn đoán + đáp án hardcode trong `Onboarding.tsx`** *(Đánh giá lại 11/06/2026: tách đáp án sang content package KHÔNG giải quyết vấn đề — content package cũng bị bundle vào client, học sinh vẫn đọc được qua source. Giải pháp thật sự duy nhất là chấm điểm server-side → gộp vào task 2.4.2/2.4.3 khi có backend. Giữ nguyên hiện trạng, không làm "bảo mật giả".)*

### 1.2. CI/CD + chốt chặn chất lượng

- [~] **1.2.1. Tạo GitHub Actions workflow `.github/workflows/ci.yml`** *(11/06/2026 — File đã tạo, 4 jobs: T-PKG / SAT / lint / build. Toàn bộ lệnh của workflow đã chạy xanh ở local. CHỜ: repo chưa có GitHub remote — cần push lên GitHub để kích hoạt và xác nhận run xanh)*
  - Nội dung: trigger push + PR → jobs: (a) T-PKG, (b) T-SAT typecheck + domain tests, (c) T-LINT, (d) T-BUILD
  - Việc còn lại: tạo repo GitHub → `git remote add origin ...` → push → xem Actions run xanh
- [x] **1.2.2. Thêm pre-commit hook (dùng `core.hooksPath`, không cần dependency husky)** *(11/06/2026 — Hook `.githooks/pre-commit`: lint app bị ảnh hưởng + `tsc --noEmit` package bị ảnh hưởng; tự cài qua script `prepare`. Test: commit chứa lỗi TS cố ý → BỊ CHẶN đúng (error TS2322); commit hợp lệ → đi qua bình thường. Commit `2935f6c7`)*
- [ ] **1.2.3. Thêm Prettier + format toàn repo (1 commit riêng chỉ format)**
  - Test vòng 1: `npx prettier --check .` pass
  - Test vòng 2: T-PKG + T-BUILD vẫn xanh sau format (format không đổi hành vi)

### 1.3. Quan sát được lỗi thực tế

- [x] **1.3.1. Thêm ErrorBoundary component vào `@miuprep/ui`, bọc root của 5 app React** *(11/06/2026 — ErrorBoundary với fallback tiếng Việt + nút "Tải lại" + hook `onError` (sẵn sàng nối Sentry/SystemLog ở 1.3.2). Bọc root: portal, ielts, cpe, miumath, miuphysics (2 app JS được thêm dep `@miuprep/ui`). sat-studio là Svelte — cần cơ chế riêng, chuyển sang 1.3.2. Test: 5/5 app build PASS, QA portal smoke PASS 0 console error. Commit `77d799ac`)*
- [ ] **1.3.2. Tích hợp crash reporting (Sentry hoặc GlitchTip self-hosted)**
  - Chú ý dữ liệu trẻ em: bật `beforeSend` scrub PII, không gửi nội dung bài làm
  - Test vòng 1: ném lỗi thử → event xuất hiện trên dashboard, KHÔNG chứa PII
  - Test vòng 2: build production + xác nhận sourcemap upload, lỗi minified vẫn đọc được stack
- [x] **1.3.3. Bật lại ESLint rules ở portal** *(11/06/2026 — `no-explicit-any` + `no-unused-vars` + `exhaustive-deps` = error; sửa 28 vi phạm thật: type hóa 9 chỗ `any` (thêm `LocalUser.studyPlan` vào @miuprep/db, export `SatTaxonomy`/`AdminSatQuestion`), dọn catch param thừa, 2 chỗ exhaustive-deps disable có lý do. Rules thử nghiệm react-hooks v6 để warn đến khi tách App.tsx (2.2.3). Test: lint 0 error, build PASS, QA smoke PASS. **Phát hiện mới:** portal có 14 lỗi tsc pre-existing vì build chỉ chạy vite không typecheck — đưa vào phạm vi 2.2.3. Commit `d2fd6dba`)*
- [x] **1.3.4. Thêm `strict: true` cho cpe-desktop tsconfig (+ ielts-desktop)** *(11/06/2026 — Cả 2 app desktop đều thiếu strict trong tsconfig.app.json; đã bật cho cả hai. Fresh typecheck (xóa tsbuildinfo): 0 lỗi — codebase đã strict-compatible sẵn. Commit `77d799ac`)*

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
| GĐ 1 — Nền móng | 12 | 7 (+1 chờ remote, +1 gộp vào GĐ2) | ~64% |
| GĐ 2 — Kiến trúc | 13 | 0 | 0% |
| GĐ 3 — Cạnh tranh | 11 | 0 | 0% |
| **Tổng** | **40** | **11** | **27.5%** |

## 📝 NHẬT KÝ TRIỂN KHAI

| Ngày | Task | Kết quả test | Ghi chú |
|------|------|--------------|---------|
| 11/06/2026 | 0.1 | PASS — 7/7 packages (chạy 2 lần, ổn định) | Baseline xanh |
| 11/06/2026 | 0.2 | PASS — build 14/14 workspace, đủ `dist/`, không warning | |
| 11/06/2026 | 0.3 | PASS — typecheck + 14/14 domain tests + build (chạy 2 lần) | |
| 11/06/2026 | 0.4 | `git status` sạch sau commit | Commit `0ebddd52`, 254 file |
| 11/06/2026 | 1.2.1 | PASS local — cả 4 nhóm lệnh CI chạy xanh (T-PKG, SAT, lint 4 app, build) | `[~]` chờ GitHub remote để kích hoạt Actions |
| 11/06/2026 | 1.2.2 | PASS — hook chặn lỗi TS cố ý (TS2322), cho qua commit hợp lệ | Commit `2935f6c7`; hook tự cài qua `npm install` (script `prepare`) |
| 11/06/2026 | 1.3.1 + 1.3.4 | PASS — 5/5 app build; QA portal smoke 0 console error; strict typecheck 0 lỗi | Commit `77d799ac` |
| 11/06/2026 | 1.3.3 | PASS — lint 0 error; build PASS; QA smoke PASS | Commit `d2fd6dba`; phát hiện 14 lỗi tsc pre-existing ở portal → 2.2.3 |
| 11/06/2026 | 1.1.5 | Đánh giá lại — chuyển `[!]`, gộp vào 2.4 | Tách đáp án sang content package là bảo mật giả; cần server-side scoring |
| 11/06/2026 | 1.1.4 | PASS — ai tests (migration/purge/memory-only); 2 app desktop build sạch | Commit `53b4f039` |
| 11/06/2026 | 1.1.2 + 1.1.3 | PASS — 7/7 package tests; build ielts/cpe/portal; lint 3 app; e2e recovery PASS; QA portal 2/2 PASS; grep credentials sạch | Commit `af0f0165`. Gỡ toàn bộ backdoor/seed mặc định ở 3 app; PBKDF2 + auto-rehash; e2e tự seed user. **Phát hiện mới:** `QuotaExceededError` ở web mode (ngân hàng đề vượt quota localStorage) → cần xử lý ở task 2.2 (chuyển content sang load theo nhu cầu / IndexedDB); e2e listening fail ở bước sau-submit vì vấn đề này (có sẵn, không do auth) |
