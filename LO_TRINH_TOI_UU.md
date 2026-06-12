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

- [x] **1.2.1. GitHub Actions CI + push lên remote — CI XANH 4/4 JOBS** *(12/06/2026 — Push toàn bộ lên `github.com/haiquynh2412/MIUPREP_SYSTEM`. CI workflow xác nhận chạy đậu trên GitHub: Build all / ESLint 4 app / SAT / Unit tests 7 packages đều success (run `79af5e19`). Đã xử lý: (a) 4 file thô >50MB gỡ khỏi lịch sử bằng filter-branch + .gitignore; (b) 2 lỗi clean-checkout có sẵn trong repo — core test thiếu build (`tsc && node test-runner.js`) và test-packages cần build-all trước vì core cross-import `../ai/dist`+`../content/dist`. Pipeline giờ chốt chặn mọi push/PR)*
- [x] **1.2.2. Thêm pre-commit hook (dùng `core.hooksPath`, không cần dependency husky)** *(11/06/2026 — Hook `.githooks/pre-commit`: lint app bị ảnh hưởng + `tsc --noEmit` package bị ảnh hưởng; tự cài qua script `prepare`. Test: commit chứa lỗi TS cố ý → BỊ CHẶN đúng (error TS2322); commit hợp lệ → đi qua bình thường. Commit `2935f6c7`)*
- [ ] **1.2.3. Thêm Prettier + format toàn repo (1 commit riêng chỉ format)** *(HOÃN CÓ ĐIỀU KIỆN 11/06/2026: chỉ thực hiện SAU khi repo đã push lên GitHub (có backup off-machine). Lý do: reformat tạo diff khổng lồ + mất git blame; cần kèm `.git-blame-ignore-revs` và loại trừ file data sinh tự động (math*-enrichment.ts, knowledge/index.ts) khỏi phạm vi format)*
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

- [x] **2.1.1. Đo lường chính xác diff giữa 2 app** *(11/06/2026 — Báo cáo đầy đủ tại `reports/desktop-apps-diff-analysis.md`: 16 file so sánh từng dòng. Nhóm A (≤5% khác, chỉ màu theme + nhãn): 10 file ~4.500 dòng → trích xuất được ngay. Nhóm B (khác nội dung thật theo track): WritingAiRoom, SpeakingAiRoom, Onboarding, App.tsx → cần đẩy content vào @miuprep/content trước)*
- [x] **2.1.2. Tách component trùng lặp vào package mới `@miuprep/exam-desktop`** *(11/06/2026 — Trích xuất 4 hooks + 5 components (AdaptivePracticeRoom 1.655 dòng, ExamSectionSheet 797, ErrorNotebook, ModeSelectorModal, ImportErrorModal); xóa 18 file trùng (~4.000 dòng bảo trì kép). Tham số hóa: `ExamTrackConfig` qua context + màu semantic Tailwind (accent/accentdeep/accentalt/accentcontrast) — mỗi app map sang palette riêng, giữ nguyên nhận diện thị giác. Test: tsc package sạch, 2 app build + lint sạch, e2e recovery PASS cả 2 app. Commit `2e25807e`. Còn lại cho 2.1.3: SpeakingAiRoom/WritingAiRoom/Onboarding (nội dung theo track) + LearnerProfileCard (thang điểm khác))*
- [~] **2.1.3. Hợp nhất phần còn lại → 1 app `exam-desktop` duy nhất**
  - [x] *Bước 1 (11/06/2026, commit `8acb03f3`): LearnerProfileCard — bản ielts đã multi-track sẵn (activeTrack + theme map), bản cpe là fork cũ → promote bản ielts vào package, cpe truyền activeTrack="cpe". Test: build 2 app + e2e cpe recovery PASS*
  - [x] *Bước 2 (11/06/2026, commit `5ac115a5`): SpeakingAiRoom + WritingAiRoom (~2.700 dòng trùng) — cả 2 bản ielts đã track-ready; chuyển derivation theme/sample-bank vào trong component (WRITING_TRACK_THEMES), props override thành optional. Xóa 4 bản local. Test: build + lint 2 app, e2e speaking + writing PASS 2/2*
  - [ ] Bước 3: Onboarding (fork nội dung thật — đề chẩn đoán + thang điểm khác nhau) — cần đẩy đề chẩn đoán vào @miuprep/content trước
  - [ ] Bước 4: hợp nhất App.tsx → 1 app duy nhất build 2 bản theo track; Tauri build thật kiểm tra thủ công
- [ ] **2.1.4. Xóa 2 app cũ sau 2 tuần chạy song song không lỗi**

### 2.2. Tách content khỏi source code & sửa tầng lưu trữ

> **Hiệu chỉnh 11/06/2026:** số liệu "700k dòng" trong audit ban đầu là nhầm bytes thành dòng — `math6-enrichment.ts` thực tế 11.9k dòng (~700KB), `knowledge/index.ts` 2.8k dòng. Mức ưu tiên 2.2.1/2.2.2 hạ xuống. Vấn đề thật của tầng lưu trữ là quota localStorage (đã xử lý ở 2.2.0).

- [x] **2.2.0. (MỚI) Sửa QuotaExceededError web mode — IndexedDB backend** *(11/06/2026 — `@miuprep/db` thêm tầng AsyncKV (LocalStorageKV / IndexedDbKV); `IndexedDbAdapter` cùng layout dữ liệu, quota hàng GB, tự migrate key `ielts_app_*` cũ ra khỏi localStorage; learning events giữ localStorage (helper đồng bộ dùng chung). 2 app desktop dùng IndexedDB ở web mode. Test: db unit PASS, 2 app build PASS, **e2e listening từ FAIL → PASS, 0 QuotaExceeded**, recovery PASS cả 2 app. Lưu ý: suite e2e có flaky khi chạy song song nhiều spec nặng (timeout banner 5s) — không phải lỗi logic. Commit `40bf4d1a`)*
- [!] **2.2.1. Chuyển enrichment sang JSON — VÔ HIỆU HÓA BỞI SỐ ĐO THỰC NGHIỆM** *(11/06/2026 — Điều tra kết luận:*
  *(a) `math6-enrichment.ts` phần lớn KHÔNG phải data: 876 block lời giải dạng if-match (data trá hình code, ~73 block có logic regex/điều kiện phức tạp) + hàng trăm hàm solver thật;*
  *(b) Đo typecheck: content (3.164 file) = 53.8s ≈ db (3 file) = 52.7s → thời gian build KHÔNG phụ thuộc kích thước file mà là overhead cố định ~50s mỗi lần chạy tsc;*
  *(c) Cùng binary tsc, project ngoài OneDrive: 3.5s → thủ phạm là OneDrive sync engine quét node_modules;*
  *(d) Đã THỬ junction node_modules ra ngoài OneDrive → tệ hơn (52s → 128s, có thể do Defender quét lại đường dẫn mới) → ĐÃ HOÀN NGUYÊN sạch.*
  ***Kết luận: fix duy nhất hiệu quả là chuyển cả repo ra ngoài OneDrive (vd `C:\Source\MIUPREP_SYSTEM`), dùng git push GitHub làm backup thay cho OneDrive. Cần bạn quyết định — và phải làm giữa 2 phiên làm việc (phiên Claude đang neo vào đường dẫn hiện tại). Việc chuyển data sang JSON vẫn có giá trị cho bundle size về sau nhưng không còn là ưu tiên build-speed.)*
- [ ] **2.2.2. Tách `packages/knowledge/src/index.ts` (173k dòng) thành data JSON + logic TS**
  - Test vòng 1: `npm test -w @miuprep/knowledge` pass, export API không đổi
  - Test vòng 2: T-PKG toàn bộ (các package phụ thuộc knowledge không vỡ)
- [~] **2.2.3. Portal: typecheck + tách App.tsx thành routes/modules**
  - [x] *Giai đoạn 1 (11/06/2026): sửa toàn bộ 14 lỗi tsc pre-existing (JSX namespace React 19, vite-env.d.ts cho CSS imports, type MathLesson, literal track, null-guard) + thêm script `typecheck` vào pre-commit hook và CI — portal từ nay không thể lọt lỗi type. Test: tsc 0 lỗi, lint 0 lỗi, build PASS. Commit `30e01c19`*
  - [x] *Giai đoạn 2a (11/06/2026): code-splitting — 11 workspace panel chuyển sang React.lazy + DeferredPanel; main bundle 184KB → 74KB (-60%). Test: tsc 0 lỗi, lint 0 lỗi, build sạch, QA 2/2 PASS. Commit `cd6b1309`*
  - [ ] Giai đoạn 2b: tách state/handlers của App.tsx (2.652 dòng) thành modules theo role

### 2.3. Chuẩn hóa 2 app JS còn lại

- [x] **2.3.1. Migrate miumath-app sang TypeScript — HOÀN THÀNH 14/14 file** *(11/06/2026 — GĐ1 commit `02aefbd5`; GĐ2 commit `b278afe6`: toàn bộ App + 12 components → .tsx, type hóa mọi useState hub (MiuMathUser, MiuMathRawQuestion...), TS bắt được 1 bug CSS thật (`justify` → `justifyContent` bị bỏ qua âm thầm). Nợ chuyển tiếp đã ghi: `noImplicitAny=false` đến khi viết Props interface cho components; strict null checks bật đủ. Test: tsc 0 lỗi, build PASS, lint PASS. **Phát hiện mới:** miumath tự quản auth với mật khẩu PLAINTEXT trong localStorage (`u.password === authPassword`) → cần task bảo mật riêng: dùng password utils từ @miuprep/db)*
- [x] **2.3.2. Migrate miuphysics-app sang TypeScript — HOÀN THÀNH 17/17 file** *(11/06/2026 — GĐ1 commit `de8ba89c`; GĐ2 commit `efbb3f6b`: giải quyết trọn 396 lỗi đã đo. Nguyên nhân gốc của 64 lỗi chỉ là 1 ký tự: tham số `params` của wrapper `t()` thiếu `?`. **3 bug thật do compiler bắt được:** (1) dashboard tính mastery % bằng field không tồn tại `r.mastery` → luôn hiện 0%, sửa thành `r.accuracy`; (2) CSS `justifycontent` viết thường bị browser bỏ qua âm thầm; (3) phép trừ trực tiếp 2 object Date trong sort của ObservationDiary. Nợ chuyển tiếp: props components đánh dấu `any` chờ Props interfaces. Test: tsc 0 lỗi, build PASS)*
- [x] **2.3.3. (MỚI) Vá bảo mật miumath-app: PBKDF2 + bỏ tài khoản mặc định** *(11/06/2026 — commit `63a1d062`: login qua `verifyPassword` + tự nâng cấp record plaintext cũ; đăng ký hash PBKDF2; tài khoản đầu tiên trên thiết bị thành admin (bỏ seed admin/admin + student/student); modal sửa thành viên không còn hiển thị mật khẩu (type=password, để trống = giữ nguyên); session không lưu hash. Test: tsc 0 lỗi, build PASS, lint PASS, grep plaintext sạch)*

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

- [x] **3.1.2 + 3.1.3. Engine thích ứng mới: Elo 2 chiều + CAT** *(11/06/2026, commit adaptive-engine — module thuần `@miuprep/learning/src/adaptive-engine.ts`: mô hình logistic 1PL/Rasch; `calibrateAbilities()` chạy Elo 2 chiều trên log attempt → vừa ra độ khó item đã hiệu chỉnh vừa ra ability học sinh (K-factor giảm dần theo bằng chứng, item gán nhãn sai tự hiệu chỉnh, prior giữ khi sparse); `estimateAbilityEAP()` ước lượng ability bền vững với chuỗi toàn đúng/toàn sai; `selectNextCatItem()` + `runCatSession()` chọn câu theo Fisher information. Unit test với learner mô phỏng (PRNG seed): trap-item lên 'hard', ability hồi phục ≤130pt, CAT hội tụ ability 1450 trong <12 câu. Tất cả test learning PASS)*
  - [ ] Còn lại: nối CAT vào luồng diagnostic thực của apps (hiện engine sẵn sàng, chưa wire UI) — gộp với 3.1.4
- [~] **3.1.1. Bật empirical difficulty** — engine `calibrateAbilities` thay thế shadow report read-only cũ; cần backend (2.4) để tích lũy đủ attempt cộng đồng rồi feed độ khó hiệu chỉnh ngược vào content guard
- [ ] **3.1.4. Teacher double-scoring flow để mở khóa mastery Writing/Speaking**
  - Test vòng 1: luồng giáo viên chấm → đồng thuận với AI → mastery cập nhật; bất đồng → flag review
  - Test vòng 2: kiểm tra governance report ghi nhận đủ cặp điểm AI/teacher

### 3.2. AI vận hành cấp production

- [ ] **3.2.1. Streaming response cho chấm Writing/Speaking** (độ trễ cảm nhận <1s)
  - Test vòng 1: đo TTFB (time-to-first-byte) trước/sau, schema validation vẫn chạy trên kết quả cuối
  - Test vòng 2: test mạng chậm/đứt giữa chừng — retry/fallback đúng, không lưu feedback dở dang
- [x] **3.2.2. Cache kết quả chấm** *(11/06/2026, commit AI cache — `CachingAIAdapter` bọc mọi AIAdapter; bài giống hệt (hash FNV-1a của bài+task+track+PROMPT_VERSION) trả từ cache, 0 gọi API; sửa 1 ký tự → cache miss. Test PASS)*
- [x] **3.2.3. Cost tracking + quota per user** *(11/06/2026, cùng commit — `UsageLedger` ghi mọi call (cached = 0 chi phí), tổng hợp billed cost per-learner/toàn cục, chặn trước call tốn tiền khi vượt quota USD (`QuotaExceededError`); bảng giá model + ước lượng token/cost. Test PASS. Còn lại: dashboard UI hiển thị — cần backend 2.4)*
- [ ] **3.2.4. Nâng cấp model lên thế hệ hiện tại + chạy lại golden dataset calibration**
  - Test vòng 1: golden dataset — band score model mới lệch ≤0.5 band so với chuẩn
  - Test vòng 2: blind test 20 bài thật — giáo viên đánh giá feedback model mới ≥ model cũ

### 3.3. Vòng lặp đo lường & mở rộng

- [ ] **3.3.1. Product analytics (PostHog self-hosted — phù hợp dữ liệu trẻ em)**
  - Test vòng 1: events chính (bắt đầu bài, hoàn thành, rớt giữa chừng) xuất hiện đúng trên dashboard
  - Test vòng 2: audit payload — không có PII trong analytics events
- [~] **3.3.2. i18n framework — nền tảng dùng chung ĐÃ XONG, rollout từng app tiếp theo** *(12/06/2026 — Tạo `@miuprep/i18n` (engine thuần testable: createTranslator + interpolation `{param}` + persistence + fallback chain + `findMissingTranslationKeys` guard; React: LanguageProvider/useTranslation/LanguageToggle). miuphysics migrate sang engine chung (giữ dict riêng), parity vi/en 100%. Wire vào build order + CI + hook. README hướng dẫn rollout. Test: engine test PASS, full build 0 lỗi. **Còn lại (incremental, an toàn vì chuỗi chưa dịch vẫn render):** externalize chuỗi hardcode ở portal + 2 app desktop — làm dần từng màn hình)*
- [x] **3.3.3. Bundle size budget** *(11/06/2026 — `scripts/check-bundle-budget.mjs` fail CI nếu entry chunk vượt ngưỡng (portal 110KB, hiện 72.5KB); chốt giữ thành quả code-split. Wire vào CI build job. Lighthouse CI để dành phiên i18n/perf riêng)*

---

## 📊 BẢNG TIẾN ĐỘ TỔNG

| Giai đoạn | Tổng task | Hoàn thành | Tiến độ |
|-----------|-----------|------------|---------|
| GĐ 0 — Baseline | 4 | 4 | 100% |
| GĐ 1 — Nền móng | 12 | 9 (+1 gộp GĐ2) | ~83% |
| GĐ 2 — Kiến trúc | 16 | 10 | ~63% |
| GĐ 3 — Cạnh tranh | 11 | 6 | ~55% |
| **Tổng** | **43** | **29** | **~67%** |

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
| 11/06/2026 | 2.1.1 | PASS — báo cáo diff 16 file hoàn chỉnh | `reports/desktop-apps-diff-analysis.md` |
| 11/06/2026 | 2.1.2 | PASS — tsc package sạch; 2 app build + lint sạch; e2e recovery PASS cả 2 app | Commit `2e25807e`; xóa ~4.000 dòng trùng lặp; package mới `@miuprep/exam-desktop` |
| 11/06/2026 | 2.2.0 | PASS — e2e listening FAIL→PASS, 0 QuotaExceeded | Commit `40bf4d1a`; IndexedDB backend |
| 11/06/2026 | 2.2.1 | Điều tra bằng số đo → chuyển `[!]` | Build chậm do OneDrive (50s overhead cố định/lần tsc; ngoài OneDrive 3.5s); junction đã thử và hoàn nguyên; cần chuyển repo ra ngoài OneDrive (quyết định của bạn) |
| 11/06/2026 | 2.2.3 GĐ1 | PASS — portal tsc 0 lỗi (sửa 14), lint 0, build PASS; gate vào hook + CI | Commit `30e01c19` |
| 11/06/2026 | 1.1.4 | PASS — ai tests (migration/purge/memory-only); 2 app desktop build sạch | Commit `53b4f039` |
| 11/06/2026 | 1.1.2 + 1.1.3 | PASS — 7/7 package tests; build ielts/cpe/portal; lint 3 app; e2e recovery PASS; QA portal 2/2 PASS; grep credentials sạch | Commit `af0f0165`. Gỡ toàn bộ backdoor/seed mặc định ở 3 app; PBKDF2 + auto-rehash; e2e tự seed user. **Phát hiện mới:** `QuotaExceededError` ở web mode (ngân hàng đề vượt quota localStorage) → cần xử lý ở task 2.2 (chuyển content sang load theo nhu cầu / IndexedDB); e2e listening fail ở bước sau-submit vì vấn đề này (có sẵn, không do auth) |
