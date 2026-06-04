# MIUPREP Implementation Plan

Muc tieu: bien cac ung dung hien co cua MiuPrep thanh mot nen tang hoc thich ung dong bo, lay Knowledge Graph va Learning Core lam loi. Cac app nhu MiuMath, IELTS, CPE, SAT la cac program view tren cung mot nen du lieu hoc tap.

## Integration Log

- [x] 2026-06-04: Doi chieu PDF goc `Cambridge Certificate in Advanced English 6.pdf` va sua sach 23 OCR warnings cua `cam-cae6-test4` Reading Part 2/Part 4: cap nhat `passageHtml` o ca section/question, sua answer evidence va explanation theo answer key Test 4.
- [x] 2026-06-04: Test vong 1 + vong 2 sau sua CAE Test 4 pass: CAE deep audit 36 tests/3,829 questions = 0 issue/0 blocker/0 warning; `npm test -w @miuprep/content`, English guard, sync portal quality snapshot deu pass.
- [x] 2026-06-04: On dinh root build monorepo bang `scripts/build-workspaces.cjs` de build workspace tuan tu theo dependency; sua helper AI productive-skill provenance/deviation (`inferProvider`, `averageNumber`); `npm run build` root pass.
- [x] 2026-06-04: Hoan tat import 36 CAE/C1 Advanced mock tests vao Miuprep: 3,829 cau duoc adapter vao English catalog, skill split Reading 1,196 / Listening 613 / Use of English 2,020.
- [x] 2026-06-04: Chuan hoa CAE theo English Core topic map thay vi chi giu theo de: moi cau co `topic.program = cae`, tags `english_core`, `cae`, skill/type/section va topic id phu hop de dung chung cho practice/diagnostic/mastery.
- [x] 2026-06-04: Them `normalize:cae` va `audit:cae-deep` trong `@miuprep/content`: tu dong rebuild tags/source/display mode, dong bo accepted answers, bo tag sai skill, va bo sung explanation gom Method/Trap/Language rule.
- [x] 2026-06-04: Audit IELTS/CPE deep sach 0 issue tren 53 tests/3,161 questions; CAE deep audit 0 blocker tren 36 tests/3,829 questions, con 23 warning OCR `possibly_truncated_text` tap trung o `cam-cae6-test4` Reading passage de admin content review.
- [x] 2026-06-04: Dong bo portal quality snapshot sau CAE import: MiuMath 485/485, SAT 9,305/9,305, IELTS 116/116, CPE 3,058/3,058, CAE 3,829/3,829, tat ca blockerItems = 0 va adapterPass = true.
- [x] 2026-06-04: Giu tuong thich nguoc cho `ielts-desktop` bang CAE aliases `SAMPLE_CAE_TEST`, `CAE_ENTRY_TEST_1..3` va them dedupe theo `test.id` cho English guard/audit/export/deep-audit de alias khong lam trung thong ke.
- [x] 2026-06-04: Test vong 1 pass cho CAE import/audit: `npm test -w @miuprep/content`, `npm run audit:ielts-cpe-deep -w @miuprep/content`, `npm run audit:cae-deep -w @miuprep/content`, `npm run guard:english -w @miuprep/content`, `npm run sync:portal-quality -w @miuprep/content`.
- [x] 2026-06-04: Test vong 2 pass sau alias/dedupe: `npm test -w @miuprep/content`, IELTS/CPE deep audit 0 issue, CAE deep audit 0 blocker/23 OCR warnings, English guard/export/sync pass, `npm run build -w @miuprep/desktop` pass.
- [x] 2026-06-04: Root regression build pass sau CAE import: `npm run build` build thanh cong CPE desktop, IELTS desktop, MiuMath, Portal, SAT Studio va tat ca packages; chi con Vite chunk-size warnings hien huu.
- [x] 2026-06-04: Mo rong Knowledge Graph thanh ban do Toan THCS/On vao 10 voi program `vn_math_thcs`, `vn_math_6/7/8/9`, `vn_math_vao_10`; adapter MiuMath gan 485/485 cau vao grade/topic/pattern/level moi va export audit coverage theo program/grade/topic/level.
- [x] 2026-06-04: Tao ma tran hoc Toan 6 tu thu muc `SACH VIET/TOAN/TAI LIEU TOAN 6`: 15 topic, 5 checkpoint, truy cap theo grade/semester/strand/unit/topic/level/examTarget trong `@miuprep/content`.
- [x] 2026-06-04: Trich xuat 75 file Word Toan 6 va tao importer bai tap theo ma tran: 1,549 `QuestionItem`, 66 source co mapping, adapter pass; xuat preview/audit/coverage tai `reports/content-quality/math6-question-bank-*`.
- [x] 2026-06-04: Them audit hien thi Toan 6 `audit:math6-display` va guard `guard:math6`: 926/1,549 cau san sang hien thi, 593 cau can khoi phuc cong thuc Word/OLE, 2 cau can hinh goc, 44 cau can sua font/encoding, 539 cau co SVG hinh hoc duoc sinh tu dong; da loai sach control chars khoi prompt va them chuyen font TCVN3 co dieu kien.
- [x] 2026-06-04: Tong quat hoa cach lam Toan theo huong MiuMath: them `math-learning` catalog/selector dung chung, portal quality snapshot co row cho `vn_math_6`, `vn_math_7`, `vn_math_8`, `vn_math_9`, `vn_math_vao_10`, `vn_math_10_12`; Math 7/8/10-12 dang planned theo thu muc nguon, Math 9/On 10 active qua MiuMath, Math 6 active qua guarded local sources.
- [x] 2026-06-04: Courses portal da ghi `lesson_template_action` cho nut Open practice/Ask AI Tutor cua Math va English Core; event co concept/skill/template metadata nhung khong co `correct`, nen khong lam phinh mastery nhu mot scored attempt.
- [x] 2026-06-02: Import MiuMath tu `ON THi/miumath-app` vao `apps/miumath-app`, them dependency `dompurify`, build `miumath-app` pass.
- [x] 2026-06-02: Import IELTS/CPE/content tu `IELT/apps/desktop`, `IELT/apps/cpe-desktop`, `IELT/packages/content` vao monorepo.
- [x] 2026-06-02: Import `IELT/packages/core` vao `packages/core` de dong bo API moi cho IELTS/CPE.
- [x] 2026-06-02: Chuan hoa namespace source import tu `@ielts/*` sang `@miuprep/*`.
- [x] 2026-06-02: Build root `npm run build` pass cho tat ca workspaces.
- [x] Backup da tao tai `.integration-backups/20260601-204033`, `.integration-backups/20260602-063149`, `.integration-backups/20260602-063405`.
- [x] 2026-06-02: Tao `@miuprep/knowledge` voi schema, validator, seed graph Toan/English/IELTS/SAT/CPE.
- [x] 2026-06-02: Tao `@miuprep/learning` voi attempt/event, mastery, recommendation, diagnostic/review set, error taxonomy.
- [x] 2026-06-02: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/learning`, va `npm run build` root deu pass.
- [x] 2026-06-02: Tao `QuestionItem`/`Lesson`/`Passage`/`MockTest`/`Rubric` chung trong `@miuprep/content`.
- [x] 2026-06-02: Tao adapter MiuMath: 485/485 cau hoi map duoc sang `QuestionItem`, pilot 50 cau tao duoc.
- [x] 2026-06-02: Noi MiuMath vao `@miuprep/learning`: practice/mock attempts duoc luu theo `StudentModel`, mastery va recommendation hien tren dashboard.
- [x] 2026-06-02: Them adaptive diagnostic flow trong MiuMath: tao bo 10 cau baseline tu `buildDiagnosticSet`, ghi attempt mode `diagnostic`.
- [x] 2026-06-02: Them test cho `@miuprep/content` adapter MiuMath va smoke data: 485/485 cau map duoc, diagnostic chon 10 cau, 0 untagged.
- [x] 2026-06-02: Chay `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run lint -w miumath-app`, `npm run build`; tat ca pass.
- [x] 2026-06-02: Them adapter English exam trong `@miuprep/content`: IELTS/CPE/CAE mock -> `QuestionItem`, `MockTest`, `Passage`.
- [x] 2026-06-02: Smoke adapter English tren 57 mock tests: 3,364 `QuestionItem`, 293 `Passage`, program counts IELTS 110 / CPE 3,051 / CAE 203.
- [x] 2026-06-02: Chay lai `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`; tat ca pass.
- [x] 2026-06-02: Them validator schema chuan cho `QuestionItem`, `MockTest`, `Passage`, va `StandardContentBundle`.
- [x] 2026-06-02: Validate English standard bundle: 57 mock tests, 3,364 questions, 293 passages, 0 validation errors.
- [x] 2026-06-02: Them English content quality gate/audit: cau thieu prompt/options/answer/passage/audio bi danh `blocker` va khong vao pilot/diagnostic mac dinh.
- [x] 2026-06-02: Them script `audit:english` trong `@miuprep/content`; audit hien tai: 57 tests, 3,364 questions, 466 blockers, 155 warnings, 2,898 cau learning-ready.
- [x] 2026-06-02: Chay lai `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`; tat ca pass.
- [x] 2026-06-02: Them script `export:audit:english` va xuat report loi tai `reports/content-quality`: JSON day du, CSV loc/sua, Markdown danh sach 466 cau bi chan.
- [x] 2026-06-02: Them `EnglishLearningCatalog`: tach pool cau learning-ready, ready mock tests, passages, coverage va quality summary cho IELTS/CPE/CAE.
- [x] 2026-06-02: Them `recordLearningItemAttempt` trong `@miuprep/learning` de ghi attempt/mastery truc tiep tu `QuestionItem`.
- [x] 2026-06-02: Chay `npm run export:audit:english -w @miuprep/content`, `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`; tat ca pass.
- [x] 2026-06-02: Them filter `filterEnglishExamTestsToLearningReady` de giu nguyen mock data goc nhung chi dua cau learning-ready vao adaptive practice.
- [x] 2026-06-02: Noi IELTS/CPE Adaptive Practice Room vao English quality gate, them readiness summary va track scope theo IELTS/CPE.
- [x] 2026-06-02: Test vong 1 pass: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`.
- [x] 2026-06-02: Them Error Notebook core trong `@miuprep/learning`: tao entry tu attempt sai, normalize entry cu, chon due review, summarize notebook.
- [x] 2026-06-02: Dua SRS scheduler vao `@miuprep/learning` va noi `packages/db` LocalStorageAdapter dung chung scheduler/normalizer.
- [x] 2026-06-02: Test vong 1 pass cho Error Notebook/SRS: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/db`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho Error Notebook/SRS: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/db`, `npm run build`.
- [x] 2026-06-02: Noi MiuMath trap-list vao Error Notebook core: cau sai practice/diagnostic/mock tao entry chuan, cau giai lai dung cap nhat SRS, UI van giu trap-list cu.
- [x] 2026-06-02: Them chi so `SRS core due` tren MiuMath dashboard de kiem tra notebook chuan dang ghi du lieu.
- [x] 2026-06-02: Test vong 1 pass cho MiuMath Error Notebook: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/db`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho MiuMath Error Notebook: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/db`, `npm run build`.
- [x] 2026-06-02: Them `buildLearningPath` trong `@miuprep/learning`: sap xep prerequisite/support edges, gan status tu mastery, chon next step va blocked prerequisites.
- [x] 2026-06-02: Noi MiuMath dashboard vao seed Knowledge Graph: concept/skill nodes, concept -> skill support edges, hien thi Learning Path tren UI.
- [x] 2026-06-02: Test vong 1 pass cho MiuMath Learning Path: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/db`, `npm run build -w miumath-app`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho MiuMath Learning Path: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/db`, `npm run build -w miumath-app`, `npm run build`.
- [x] 2026-06-02: Mo rong seed Knowledge Graph cho English Core Vocabulary/Grammar/Reading: them concept, skill, objective, misconception va prerequisite/support edges dung chung cho IELTS/SAT/CPE.
- [x] 2026-06-02: Test vong 1 pass cho English Core graph: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho English Core graph: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`.
- [x] 2026-06-02: Gan `masteryPolicy: feedback_only` cho English Writing/Speaking items va them `recordLearningFeedback` de luu feedback event ma khong tao attempt/mastery.
- [x] 2026-06-02: Test vong 1 pass cho Writing/Speaking feedback-only guard: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho Writing/Speaking feedback-only guard: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build`.
- [x] 2026-06-02: Them IELTS learner dashboard trong desktop app: mock attempts -> `QuestionItem` -> `StudentModel` -> mastery/recommendation/learning path, bo qua Writing/Speaking feedback-only.
- [x] 2026-06-02: Test vong 1 pass cho IELTS learner dashboard: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/desktop`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho IELTS learner dashboard: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w @miuprep/desktop`, `npm run build`.
- [x] 2026-06-02: Them learner dashboard chung trong `miuprep-portal`: hien program dang hoc, mastery program, learning path va error notebook summary tren cung Knowledge/Learning core.
- [x] 2026-06-02: Test vong 1 pass cho portal learner dashboard: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho portal learner dashboard: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Them parent learning overview trong `miuprep-portal`: phu huynh xem tien do tung hoc sinh, program dang hoc, diem yeu va next action dua tren snapshot learner chung.
- [x] 2026-06-02: Test vong 1 pass cho portal parent learning overview: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho portal parent learning overview: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Them admin learning analytics trong `miuprep-portal`: content coverage theo Knowledge Graph, cau hoi/chuyen de thieu metadata, watchlist ti le sai bat thuong va learning event analytics tu telemetry.
- [x] 2026-06-02: Test vong 1 pass cho portal admin analytics: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho portal admin analytics: `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Them AI Tutor core trong `@miuprep/ai`: giai thich cau sai theo concept/skill, Socratic hints, remediation lesson, error classification fallback, confidence va learning feedback event bridge.
- [x] 2026-06-02: Them AI Tutor preview trong `miuprep-portal`: hien giai thich, hint, remediation, confidence va learning event id cho item trong Error Notebook.
- [x] 2026-06-02: Test vong 1 pass cho AI Tutor Phase 9: `npm test -w @miuprep/ai`, `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho AI Tutor Phase 9: `npm test -w @miuprep/ai`, `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Mo rong Knowledge Graph Phase 10: them Math 6-8 foundation, English Writing Core, SAT Math/RW objectives va CAE program map rieng; CPE/IELTS cung map Writing Core.
- [x] 2026-06-02: Test vong 1 pass cho Knowledge Graph Phase 10: `npm test -w @miuprep/ai`, `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho Knowledge Graph Phase 10: `npm test -w @miuprep/ai`, `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Them `@miuprep/beta`: readiness engine cho Math 9 beta, IELTS Reading/Listening beta, learning event readiness, diagnostic validity, recommendation sanity va graph adjustment backlog.
- [x] 2026-06-02: Them Beta Implementation Tracker vao `miuprep-portal` admin dashboard de theo doi checklist Phase 10 bang content/users/log hien co.
- [x] 2026-06-02: Test vong 1 pass cho Beta Phase 10: `npm test -w @miuprep/beta`, `npm test -w @miuprep/ai`, `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho Beta Phase 10: `npm test -w @miuprep/beta`, `npm test -w @miuprep/ai`, `npm test -w @miuprep/content`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Them `buildInternalBetaRunPlan` trong `@miuprep/beta`: cohort plan, entry gates, exit gates, telemetry required va next actions cho beta noi bo.
- [x] 2026-06-02: Noi Beta Run Plan vao `miuprep-portal` admin dashboard: hien cohort, target learners, minimum learning events, diagnostic targets, entry/exit gates.
- [x] 2026-06-02: Test vong 1 pass cho Beta Run Plan: `npm test -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho Beta Run Plan: `npm test -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Them learning event store trong `@miuprep/db`: `saveLearningEvent`, `listLearningEvents`, LocalStorage persistence, Tauri SQLite fallback va portal admin load events vao Beta Tracker.
- [x] 2026-06-02: Test vong 1 pass cho DB learning events: `npm test -w @miuprep/db`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho DB learning events: `npm test -w @miuprep/db`, `npm test -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Noi IELTS/CPE submit flow vao learning event store: moi bai submitted tao event chuan co program, skill, score, accuracy, timing, source app.
- [x] 2026-06-02: Them SQLite native commands cho desktop: `learning_events` table, index, `save_learning_event`, `list_learning_events` trong IELTS va CPE Tauri backend.
- [x] 2026-06-02: Test vong 1 pass cho IELTS/CPE learning events: `npm test -w @miuprep/db`, `npm test -w @miuprep/beta`, `npm run build -w @miuprep/desktop`, `npm run build -w @miuprep/cpe-desktop`, `npm run build`.
- [x] 2026-06-02: Test native pass cho IELTS/CPE learning events: `cargo check` trong `apps/ielts-desktop/src-tauri` va `apps/cpe-desktop/src-tauri`.
- [x] 2026-06-02: Test vong 2 pass cho IELTS/CPE learning events: `cargo check` 2 backend, `npm test -w @miuprep/db`, `npm test -w @miuprep/beta`, `npm run build -w @miuprep/desktop`, `npm run build -w @miuprep/cpe-desktop`, `npm run build`.
- [x] 2026-06-02: Noi MiuMath practice/diagnostic/review/mock attempts vao shared learning event store de portal co the doc telemetry Toan cung schema.
- [x] 2026-06-02: Test vong 1 pass cho MiuMath shared learning events: `npm run lint -w miumath-app`, `npm run build -w miumath-app`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/beta`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho MiuMath shared learning events: `npm run lint -w miumath-app`, `npm run build -w miumath-app`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/beta`, `npm run build`.
- [x] 2026-06-02: Noi SAT Studio student attempts/Bluebook attempts vao shared learning event store: convert `accountId` -> `learnerId`, gan `programId: sat`, infer domain Math/English.
- [x] 2026-06-02: Test vong 1 pass cho SAT shared learning events: `npm run test:vite -w sat-studio`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho SAT shared learning events: `npm run test:vite -w sat-studio`.
- [x] 2026-06-02: Chuan hoa shared learning event storage trong `@miuprep/learning`: export storage keys/helper save/list, MiuMath va SAT dung chung thay vi tu ghi localStorage rieng.
- [x] 2026-06-02: Test vong 1 pass cho shared learning event storage core: `npm test -w @miuprep/learning`, `npm run lint -w miumath-app`, `npm run build -w miumath-app`, `npm run test:vite -w sat-studio`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho shared learning event storage core: `npm test -w @miuprep/learning`, `npm run lint -w miumath-app`, `npm run build -w miumath-app`, `npm run test:vite -w sat-studio`, `npm run build`.
- [x] 2026-06-02: Dong bo `@miuprep/db` LocalStorageAdapter sang shared learning event storage helper de portal doc cung mot nguon event chuan.
- [x] 2026-06-02: Test vong 1 pass cho DB/portal shared event helper: `npm test -w @miuprep/db`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho DB/portal shared event helper: `npm test -w @miuprep/db`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Them English content guard cho viec sua cau hoi sau nay: 57 tests, 3364 questions, 2898 learning-ready items convert sach sang schema chuan; blocker noi dung duoc report rieng khong pha adapter.
- [x] 2026-06-02: Test vong 1 pass cho English content guard: `npm test -w @miuprep/content`, `npm run guard:english -w @miuprep/content`.
- [x] 2026-06-02: Test vong 2 pass cho English content guard: `npm test -w @miuprep/content`, `npm run guard:english -w @miuprep/content`, `npm run build`.
- [x] 2026-06-02: Dua English content guard snapshot vao `miuprep-portal` admin analytics: hien 2898/3364 cau ready, 466 blocker, adapter pass va top issue codes de theo doi khi sua CPE/IELTS.
- [x] 2026-06-02: Noi `AdminLearningAnalytics` dung shared learning events that tu `adminLearningEvents`, thay vi chi doc system logs cho event analytics.
- [x] 2026-06-02: Test vong 1 pass cho portal content guard/event analytics: `npm test -w @miuprep/content`, `npm run guard:english -w @miuprep/content`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-02: Test vong 2 pass cho portal content guard/event analytics: `npm test -w @miuprep/content`, `npm run guard:english -w @miuprep/content`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Tach English content guard report thanh module dung chung va them `sync:portal-quality` de generate `miuprep-portal` snapshot sau moi lan sua CPE/IELTS content.
- [x] 2026-06-03: Guard report tu dong gom `topIssues` theo nhom loi: missing listening content, blankIndex, transcript, missing reading content, passageHtml.
- [x] 2026-06-03: Test vong 1 pass cho sync portal quality snapshot: `npm test -w @miuprep/content`, `npm run sync:portal-quality -w @miuprep/content`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho sync portal quality snapshot: `npm test -w @miuprep/content`, `npm run sync:portal-quality -w @miuprep/content`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Them misconception bridge trong `@miuprep/learning`: tu `errorCategories` suy luan `misconceptionIds` chuan va gan vao attempt, mastery, Error Notebook.
- [x] 2026-06-03: Mo rong Knowledge Graph misconceptions/remediation edges cho Math va English; validator chan misconception thieu concept/skill.
- [x] 2026-06-03: Test vong 1 pass cho misconception bridge: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/content`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho misconception bridge: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/content`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Them beta graph-adjustment signal tu `misconceptionIds`: loi sai lap lai tao candidate `misconception_signal` trong Phase 10 backlog.
- [x] 2026-06-03: Test vong 1 pass cho beta misconception graph signals: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho beta misconception graph signals: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/learning`, `npm test -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Them `export:beta-run` trong `@miuprep/beta`: xuat `reports/beta/internal-beta-run.json` va `.md` tu Knowledge Graph, English learning-ready catalog, MiuMath data that, beta learners/telemetry seed.
- [x] 2026-06-03: Doi chieu Math 9 beta export voi MiuMath data: `apps/miumath-app/public/data/questions_db.json` co 485 cau, 20 de, 11 category, 28 sub-category; con so 315 truoc do chi la seed tam 9x35.
- [x] 2026-06-03: Sua `export:beta-run` de doc truc tiep MiuMath `questions_db.json`, gom 28 content units va report 485/485 cau Math 9; adapter map 0 cau untagged.
- [x] 2026-06-03: Beta run export hien `readyForInternalBeta: yes`, run status `watch`, invalid graph targets = 0, 28 Math units/485 questions, 6 IELTS Reading/Listening units/110 learning-ready questions.
- [x] 2026-06-03: Test vong 1 pass cho MiuMath beta export 485 cau: `npm test -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Audit lai coverage sau CPE update: MiuMath 485/485, SAT 9,305/9,305, IELTS 116/116 available (110 mastery-ready + 6 feedback-only), tat ca 0 blocker.
- [x] 2026-06-03: Mo rong `sync:portal-quality` thanh unified content coverage snapshot cho admin: MiuMath, SAT, IELTS, CPE, CAE cung hien source/import/ready/blocker/adapter status.
- [x] 2026-06-03: Chuyen `export:beta-run` sang internal smoke run: 1 learner/scope du de Phase 10 Math 9 va IELTS Reading/Listening beta package pass, van giu graph adjustment o trang thai review.
- [x] 2026-06-03: Test vong 2 pass cho MiuMath beta export 485 cau: `npm test -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Them MiuMath content guard `guard:miumath`/`export:audit:miumath`: so sanh `MIUPREP_SYSTEM` voi source rieng `ON THi/miumath-app`, xuat JSON/Markdown/CSV tai `reports/content-quality`.
- [x] 2026-06-03: Ra soat lai noi dung MiuMath sau khi co cau thay doi: 485 cau, 20 de, 11 category, 28 sub-category, 0 added, 0 removed, 9 changed ids: `DE04_C02`, `DE04_C21_3`, `DE05_C10`, `DE06_C14`, `DE07_C09`, `DE10_C17`, `DE11_C18`, `DE14_C08`, `DE15_C13`.
- [x] 2026-06-03: Sua adapter MiuMath chap nhan `fill_in_the_blank` co `options: null` va khong day `choices` loi vao `QuestionItem`; adapter guard pass 485/485 cau.
- [x] 2026-06-03: Sua loi render KaTeX trong `DE14_C08` explanation: bo dau `$` thua o dong ket luan `Khẳng định A đúng`.
- [x] 2026-06-03: MiuMath content audit sau sua: `blockers: 0`, `warnings: 0`, `adapter pass: yes`; beta export van `Math 9 internal beta = pass`, 28 units/485 questions.
- [x] 2026-06-03: Test vong 1 pass cho MiuMath content audit: `npm run export:audit:miumath -w @miuprep/content`, `npm test -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w miumath-app`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho MiuMath content audit: `npm run export:audit:miumath -w @miuprep/content`, `npm test -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w miumath-app`, `npm run build`.
- [x] 2026-06-03: Them focused objective `obj.ielts.reading_listening_beta` de IELTS R/L beta do coverage theo dung pham vi Reading/Listening, khong bi danh truot vi Writing/Speaking chua vao beta.
- [x] 2026-06-03: Mo rong English Core full-skill: Listening Core, Speaking Core, CPE/CAE/IELTS program maps gom Reading, Listening, Writing, Speaking, Vocabulary, Grammar/Use of English.
- [x] 2026-06-03: Cap nhat English adapter de Writing map vao task response/paragraph/coherence va Speaking map vao fluency/pronunciation/interaction/discourse; Writing/Speaking van `feedback_only` de khong lam sai mastery.
- [x] 2026-06-03: Test vong 1 pass cho full English skills: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w @miuprep/desktop`, `npm run build -w @miuprep/cpe-desktop`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho full English skills: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w @miuprep/desktop`, `npm run build -w @miuprep/cpe-desktop`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: English content guard pass 2 lan sau khi mo rong skills: 57 tests, 3,364 questions, 2,898 learning-ready, 466 blockers noi dung can sua, adapter pass `true`.
- [x] 2026-06-03: Them `skillArea` cho English adapter de tach dung Reading, Listening, Use of English, Writing, Speaking; CPE/CAE Part 1-4 khong bi tinh nham vao Reading.
- [x] 2026-06-03: Them `skillReadiness` vao English content guard va portal snapshot: Reading 894/894 ready, Listening 54/502 ready, Use of English 1950/1968 ready, Writing 7 feedback-only, Speaking 6 feedback-only.
- [x] 2026-06-03: Hien full English skill readiness matrix trong `miuprep-portal` admin analytics, gom breakdown theo IELTS/CPE/CAE de theo doi khi ban tiep tuc sua cau CPE.
- [x] 2026-06-03: Browser QA pass cho portal admin dashboard tai `http://127.0.0.1:4177`; screenshot luu tai `reports/portal-admin-english-skill-readiness.png`.
- [x] 2026-06-03: Test vong 1 pass cho English skill readiness portal: `npm test -w @miuprep/content`, `npm run guard:english -w @miuprep/content`, `npm run sync:portal-quality -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho English skill readiness portal: `npm test -w @miuprep/content`, `npm run guard:english -w @miuprep/content`, `npm run sync:portal-quality -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm run export:beta-run -w @miuprep/beta`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Doi chieu implementation con thieu: SAT la phan lon nhat chua vao `@miuprep/content` schema chung; uu tien trien khai SAT adapter truoc beta noi bo tiep theo.
- [x] 2026-06-03: Them SAT public package adapter trong `@miuprep/content`: 9,305 cau public student package -> `QuestionItem`, Math map vao `mathematics`, Reading and Writing map vao `english_core`.
- [x] 2026-06-03: Them `guard:sat` va report `sat_content_guard_v1`: 9,305 total, 9,305 unique ids, 9,305 learning-ready, 0 blocker, 0 validation errors; Math 5,642 cau, Reading and Writing 3,663 cau.
- [x] 2026-06-03: Xuat SAT guard artifact tai `reports/content-quality/sat-content-guard.json`.
- [x] 2026-06-03: Test vong 1 pass cho SAT content adapter: `npm test -w @miuprep/content`, `npm run guard:sat -w @miuprep/content`, `npm test -w @miuprep/beta`, `npm test -w @miuprep/knowledge`, `npm run build -w miuprep-portal`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho SAT content adapter: `npm test -w @miuprep/content`, `npm run guard:sat -w @miuprep/content`, `npm run test:vite -w sat-studio`, `npm run build`.
- [x] 2026-06-03: Them `SatLearningCatalog`, `selectSatDiagnosticItems`, `selectSatPracticeItems` de SAT public bank dung duoc cho diagnostic/practice chung tu `QuestionItem`.
- [x] 2026-06-03: Test vong 1 pass cho SAT learning catalog: `npm test -w @miuprep/content`, `npm run guard:sat -w @miuprep/content`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho SAT learning catalog: `npm test -w @miuprep/content`, `npm run guard:sat -w @miuprep/content`.
- [x] 2026-06-03: Them filter difficulty cho `selectSatPracticeItems` de SAT Studio Bluebook hard/support route dung duoc selector chung.
- [x] 2026-06-03: Noi `sat-studio` diagnostic/practice/Bluebook sampler vao `SatLearningCatalog` qua `standardCatalog` bridge; UI van giu API cu, fallback cu van con.
- [x] 2026-06-03: Bridge SAT giu duoc attempt id goc: cau da lam trong SAT Studio duoc doi sang id chuan `sat.*` de selector chung bo qua dung.
- [x] 2026-06-03: Test vong 1 pass cho SAT Studio content bridge: `npm test -w @miuprep/content`, `npm run test:vite -w sat-studio`, `npm run guard:sat -w @miuprep/content`, `npm run build`.
- [x] 2026-06-03: Test vong 2 pass cho SAT Studio content bridge: `npm test -w @miuprep/content`, `npm run test:vite -w sat-studio`, `npm run guard:sat -w @miuprep/content`, `npm run build`.
- [x] 2026-06-03: Them `SystemSurfacePreview` trong `miuprep-portal`: mot man hinh dark operations va mot phuong an light learner/classroom, chuyen doi truc tiep bang segmented control.
- [x] 2026-06-03: Browser QA tren `http://127.0.0.1:4177`: dark/light toggle doi class dung, heading dung, active button dung, khong co horizontal overflow.
- [x] 2026-06-03: Chuyen light option sang MiuMath green theme: nen `#f0faf5`, primary `#10b981`, text `#064e3b`, muted `#15803d`, giu dark operations rieng.
- [x] 2026-06-03: Don trang chu `miuprep-portal`: bo preview he thong nang khoi homepage chua dang nhap, chi giu 3 tin hieu cot loi va login/register.
- [x] 2026-06-03: Chia admin workspace thanh tab cap cao: Overview, Analytics, Users, Content, Logs; giu tab mon hoc trong Content.
- [x] 2026-06-03: Browser QA layout pass tren `http://127.0.0.1:4177`: homepage khong con `.system-surface`, co 3 label cot loi, co login/register, admin tabs chuyen Overview/Analytics/Users/Content/Logs dung nhom, khong horizontal overflow.
- [x] 2026-06-03: Chia student workspace thanh tab cap cao: Overview, Courses, Practice, Tutor, Rewards; SAT Studio van la man rieng.
- [x] 2026-06-03: Test vong 1 pass cho student workspace tabs: `npm run build -w miuprep-portal`.
- [x] 2026-06-03: Test vong 2 pass cho student workspace tabs: `npm run build -w miuprep-portal`.
- [x] 2026-06-03: Browser QA student workspace pass tren `http://127.0.0.1:4177`: tao/duyet hoc sinh QA, dang nhap role student, chuyen Overview/Courses/Practice/Tutor/Rewards dung nhom noi dung, khong horizontal overflow; screenshot `reports/portal-student-workspace-tabs.png`.
- [x] 2026-06-03: Them ESLint flat config cho `miuprep-portal`, sua empty catch trong parent table, `npm run lint -w miuprep-portal` pass sach.
- [x] 2026-06-03: Test vong 1/2 pass sau tooling lint portal: `npm run build -w miuprep-portal`.
- [x] 2026-06-03: Bat dau tach learning logic khoi portal UI: dua SAT practice filtering/session/answer/error-entry helpers vao `apps/miuprep-portal/src/lib/satPractice.ts`.
- [x] 2026-06-03: Test SAT practice refactor pass: `npm run lint -w miuprep-portal`, `npm run build -w miuprep-portal` 2 vong, Browser QA mo SAT Studio/start practice/answer question khong loi va khong horizontal overflow; screenshot `reports/portal-sat-practice-refactor.png`.
- [x] 2026-06-03: Tach student progress helpers khoi portal UI: coin parsing, trap parsing/payload, mascot purchase/equip, retry error question, diary reward vao `apps/miuprep-portal/src/lib/studentProgress.ts`.
- [x] 2026-06-03: Test student progress refactor pass: `npm run lint -w miuprep-portal`, `npm run build -w miuprep-portal` 2 vong, Browser QA Rewards purchase/diary reward va Practice notebook khong loi, khong horizontal overflow; screenshot `reports/portal-student-progress-refactor.png`.
- [x] 2026-06-03: Tach admin content helpers khoi portal UI: Casio tip, Math lesson, English exam, JSON import, demo exam, LaTeX lesson vao `apps/miuprep-portal/src/lib/adminContent.ts`.
- [x] 2026-06-03: Test admin content refactor pass: `npm run lint -w miuprep-portal`, `npm run build -w miuprep-portal` 2 vong, Browser QA admin Content/CPE load demo + import JSON thanh cong, khong horizontal overflow; screenshot `reports/portal-admin-content-refactor.png`.
- [x] 2026-06-03: Them `@miuprep/content` admin English import gateway: parse/validate track IELTS-CAE-CPE, tao summary import, va thu chuyen full mock test sang `QuestionItem`/`MockTest`/`Passage`.
- [x] 2026-06-03: Noi portal admin import JSON sang content gateway chung; demo summary import van chay, full mock test co adapter report de sau nay day vao learning catalog.
- [x] 2026-06-03: Test content gateway pass: `npm test -w @miuprep/content` 2 vong, `npm run lint -w miuprep-portal` 2 vong, `npm run build -w miuprep-portal` 2 vong; Browser QA Content/CPE load demo + import thanh cong; screenshot `reports/portal-admin-content-gateway.png`.
- [x] 2026-06-03: Full workspace regression build pass: `npm run build` build thanh cong CPE desktop, IELTS desktop, MiuMath, Portal, SAT Studio va tat ca packages.
- [x] 2026-06-03: Tach not logic student dashboard/Error Notebook/Rewards con lai khoi `miuprep-portal/src/App.tsx`: default notebook, tab config, active error summary, mascot store, diary moods va student progress storage vao `apps/miuprep-portal/src/lib/studentProgress.ts`.
- [x] 2026-06-03: Test vong 1/2 pass cho portal student logic refactor: `npm run lint -w miuprep-portal`, `npm run build -w miuprep-portal`; QA student Practice/Rewards pass, diary reward 150 -> 165, khong console error; screenshot `reports/portal-student-dashboard-refactor-qa.png`.
- [x] 2026-06-03: Kich hoat `VN Math 10-12` trong Knowledge Graph: them concept/skill/objective cho function-vector, sequence-log-calculus, geometry-probability va misconceptions/remediation edges tu loi ham so, dieu kien log, to hop.
- [x] 2026-06-03: Them `ProgramMap` cho `vn_math_10_12` va coverage row `planned` trong admin unified content snapshot; Math 10-12 da san sang de import question bank that sau nay nhung chua co cau hoi luyen tap trong monorepo.
- [x] 2026-06-03: Them tai khoan mac dinh `admincontent/admincontent123` cho workflow quan tri noi dung; quyen dung role admin hien co de vao Content workspace.
- [x] 2026-06-03: Them Content Review Editor trong admin Content cho IELTS/CAE/CPE: mo tung de, sua title/duration/question, passage/transcript, options/note, luu draft hoac mark `checked/needs_fix` truc tiep tren noi dung dang hien thi.
- [x] 2026-06-03: Them LocalStorage persistence cho Content Review Editor qua key `miuprep_admin_content_exams_v1`: import/tai tao/sua de deu duoc merge lai khi reload app.
- [x] 2026-06-03: Chuan hoa workflow review trong Content Editor: `Save Draft` luu ve `unchecked`, `Mark Needs Fix` danh dau can sua, `Save & Checked` danh dau da duyet.
- [x] 2026-06-03: Them Content Review Summary/Filter cho admin IELTS/CAE/CPE: hien tong de, tong cau, checked/needs fix/draft, completion rate va loc nhanh theo trang thai review.
- [x] 2026-06-04: Dong bo lesson template thanh object/edge chinh thuc trong `@miuprep/knowledge`: 4 Math 9 repair templates va 6 English Core templates co concept/skill/prerequisite/remediation ids.
- [x] 2026-06-04: Test vong 1 pass cho lesson template graph: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/beta`, `npm run build -w miuprep-portal`.
- [x] 2026-06-04: Test vong 2 pass cho lesson template graph: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/beta`, `npm run lint -w miuprep-portal`, `npm run build -w miuprep-portal`.
- [x] 2026-06-04: Mo rong Math 10-12 theo cum concept: 9 cluster-import templates cho Grade 10 function/vector/probability, Grade 11 sequence/log/calculus, Grade 12 geometry/combinatorics/synthesis.
- [x] 2026-06-04: Noi Math 10-12 clusters vao Knowledge Graph bang lesson template object va objective/misconception edges; portal Courses hien `Math 10-12 expansion` kem import guard.
- [x] 2026-06-04: Test vong 1 pass cho Math 10-12 expansion: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/beta`, `npm run lint -w miuprep-portal`, `npm run build -w miuprep-portal`, Playwright QA desktop/mobile.
- [x] 2026-06-04: Test vong 2 pass cho Math 10-12 expansion va navbar mobile overflow fix: `npm test -w @miuprep/knowledge`, `npm test -w @miuprep/beta`, `npm run lint -w miuprep-portal`, `npm run build -w miuprep-portal`, Playwright QA desktop/mobile.
- [x] 2026-06-04: Chay lai `npm run export:beta-run -w @miuprep/beta`; report van de `Sua Knowledge Graph theo du lieu that` o `watch` de doi beta evidence that truoc khi accept/reject graph adjustment.

## 0. Nguon Hien Co

- [x] Xac dinh monorepo chinh: `C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM`
- [x] Xac dinh ban MiuMath moi: `C:\Users\HAIQUYNH\OneDrive\CODE AI\ON THi\miumath-app`
- [x] Xac dinh ban IELTS/CPE moi: `C:\Users\HAIQUYNH\OneDrive\CODE AI\IELT`
- [x] Xac dinh app hien co trong monorepo: `miuprep-portal`, `miumath-app`, `ielts-desktop`, `cpe-desktop`, `sat-studio`
- [x] Xac dinh package hien co: `content`, `db`, `ai`, `core`, `ui`
- [x] Lap danh sach file thay doi quan trong giua ban rieng va monorepo
- [x] Chot ban nao la source of truth cho MiuMath: `ON THi/miumath-app` tai thoi diem import 2026-06-02
- [x] Chot ban nao la source of truth cho IELTS/CPE: `IELT/apps/desktop`, `IELT/apps/cpe-desktop`, `IELT/packages/content`, `IELT/packages/core` tai thoi diem import 2026-06-02

## 1. Nguyen Tac Trien Khai

- [x] Khong copy nguyen thu muc co `node_modules`, `dist`, `target`, `.exe`, `.msi`
- [x] Import code co kiem soat theo tung app/package
- [x] On dinh build truoc khi refactor kien truc
- [x] Tach logic hoc tap khoi UI sau khi app chay on dinh
- [x] Moi app dung chung `Knowledge Graph`, `LearningEvent`, `MasteryModel`
- [x] AI Tutor chi la lop ho tro, khong la loi quyet dinh learning path

## 2. Kien Truc Dich

### Domains

- [x] `Mathematics`
- [x] `English Core`

### Programs

- [x] `VN Math 6-9`
- [x] `VN Math 10-12`
- [x] `IELTS`
- [x] `SAT`
- [x] `CAE`
- [x] `CPE`

### Core Flow

- [x] Knowledge Graph
- [x] Student Model
- [x] Mastery Model
- [x] Diagnostic Engine
- [x] Recommendation Engine
- [x] AI Tutor

## 3. Phase 1 - Import Va Dong Bo Code Hien Co

Muc tieu: dua ban MiuMath va IELTS/CPE moi vao `MIUPREP_SYSTEM` ma khong pha vo monorepo.

### 3.1 MiuMath

- [x] So sanh `ON THi/miumath-app/package.json` voi `MIUPREP_SYSTEM/apps/miumath-app/package.json`
- [x] Merge dependency can thiet vao `apps/miumath-app/package.json`
- [x] Copy co kiem soat `ON THi/miumath-app/src` sang `apps/miumath-app/src`
- [x] Xac minh `ON THi/miumath-app/public` va `apps/miumath-app/public` khong can copy them tai thoi diem import
- [x] Khong copy `ON THi/miumath-app/node_modules`
- [x] Khong copy `ON THi/miumath-app/dist`
- [x] Chay build rieng cho MiuMath
- [x] Ghi lai loi build neu co
- [x] Fix loi import, asset path, dependency
- [x] Xac nhan app MiuMath chay duoc trong monorepo

### 3.2 IELTS/CPE

- [x] So sanh `IELT/apps/desktop` voi `MIUPREP_SYSTEM/apps/ielts-desktop`
- [x] So sanh `IELT/apps/cpe-desktop` voi `MIUPREP_SYSTEM/apps/cpe-desktop`
- [x] So sanh `IELT/packages/content` voi `MIUPREP_SYSTEM/packages/content`
- [x] Merge mock data va validator quan trong vao `packages/content`
- [x] Merge UI/app code can thiet vao `ielts-desktop`
- [x] Merge UI/app code can thiet vao `cpe-desktop`
- [x] Khong copy build output `.exe`, `.msi`, `.zip`
- [x] Chay build rieng cho IELTS desktop
- [x] Chay build rieng cho CPE desktop
- [x] Xac nhan IELTS/CPE chay duoc trong monorepo

### 3.3 SAT

- [x] Giu `sat-studio` lam nguon tham khao cho mastery, learning event, diagnostic, review
- [x] Khong refactor SAT trong luc import MiuMath/CPE
- [x] Sau khi import on dinh, trich logic dung chung tu SAT sang `packages/learning`

## 4. Phase 2 - On Dinh Monorepo

Muc tieu: tat ca app build duoc trong cung mot workspace.

- [x] Chay `npm install` tai root `MIUPREP_SYSTEM`
- [x] Chay `npm run build -w miumath-app`
- [x] Chay `npm run lint -w miumath-app`
- [x] Chay `npm run build -w @miuprep/desktop`
- [x] Chay `npm run build -w @miuprep/cpe-desktop`
- [x] Chay `npm run build -w sat-studio`
- [x] Chay `npm run build -w miuprep-portal`
- [x] Chay `npm run build`
- [x] Ghi lai cac app build pass/fail
- [x] Chuan hoa version TypeScript/Vite neu bi xung dot
  - [x] 2026-06-04 audit: khong co xung dot build hien tai. React apps dung Vite 8/TS 6, SAT Svelte giu Vite 6 theo plugin Svelte, packages build bang TS 5.9.3.
- [x] Chuan hoa ESLint flat config cho portal/workspaces de `npm run lint -w miuprep-portal` chay duoc voi ESLint 10
- [x] Chuan hoa import path giua apps va packages
- [x] Xoa hoac bo qua build artifact khong can thiet trong source

## 5. Phase 3 - Tao Knowledge Core

Muc tieu: them loi tri thuc dung chung, chua can graph database.

### 5.1 Tao Package

- [x] Tao `packages/knowledge/package.json`
- [x] Tao `packages/knowledge/tsconfig.json`
- [x] Tao `packages/knowledge/src/index.ts`
- [x] Them package vao workspace neu can
- [x] Them script build cho `packages/knowledge`

### 5.2 Schema Loi

- [x] Dinh nghia `Domain`
- [x] Dinh nghia `Program`
- [x] Dinh nghia `Concept`
- [x] Dinh nghia `Skill`
- [x] Dinh nghia `LearningObjective`
- [x] Dinh nghia `Misconception`
- [x] Dinh nghia `KnowledgeEdge`
- [x] Dinh nghia `ProgramMap`
- [x] Viet validator cho graph
- [x] Viet test nho cho validator

### 5.3 Knowledge Graph Mau

- [x] Tao graph mau Toan lop 9
- [x] Tao graph mau English Core: Vocabulary
- [x] Tao graph mau English Core: Grammar
- [x] Tao graph mau English Core: Reading
- [x] Tao IELTS layer map vao English Core
- [x] Map CAE/CPE vao English Core full-skill
- [x] Chua can map SAT day du giai doan nay

## 6. Phase 4 - Tao Learning Core

Muc tieu: gom logic hoc tap, mastery, diagnostic, recommendation vao package chung.

### 6.1 Tao Package

- [x] Tao `packages/learning/package.json`
- [x] Tao `packages/learning/tsconfig.json`
- [x] Tao `packages/learning/src/index.ts`
- [x] Them script build cho `packages/learning`

### 6.2 Trich Tu SAT

- [x] Trich `AttemptRecord` tu SAT thanh type dung chung
- [x] Trich `LearnerState` thanh `StudentModel`
- [x] Trich `LearningEvent`
- [x] Trich `masteryRows` thanh `computeMastery`
- [x] Trich `nextAction` thanh `recommendNextAction`
- [x] Trich diagnostic set logic thanh `DiagnosticEngine`
- [x] Trich review set logic thanh `ReviewEngine`
- [x] Viet test cho mastery
- [x] Viet test cho recommendation
- [x] Portal SAT practice da tach helper thuan khoi `App.tsx`: filter/select session, answer grading, error notebook entry, advance practice
- [x] Portal student progress da tach helper thuan khoi `App.tsx`: mascot store, diary reward, trap count, retry error notebook
- [x] Portal admin content management da tach helper thuan khoi `App.tsx`: Casio tip, Math lesson, English exam, JSON import, demo exam, LaTeX lesson

### 6.3 Error Taxonomy

- [x] Dinh nghia error taxonomy cho Toan
- [x] Dinh nghia error taxonomy cho English
- [x] Gan misconception voi concept/skill
- [x] Them error type vao attempt record
- [x] Them logic dua loi sai vao Error Notebook
- [x] Ket noi SRS hien co tu `packages/db`

## 7. Phase 5 - Chuan Hoa Content

Muc tieu: moi cau hoi, bai hoc, mock test co metadata chung.

- [x] Tao `QuestionItem` chung trong `packages/content`
- [x] Tao `Lesson` chung trong `packages/content`
- [x] Tao `Passage` chung cho English Reading
- [x] Tao `MockTest` chung cho IELTS/CPE/SAT
- [x] Tao `Rubric` chung cho Writing/Speaking
- [x] Them `domain`
- [x] Them `programIds`
- [x] Them `conceptIds`
- [x] Them `skillIds`
- [x] Them `misconceptionIds`
- [x] Them `difficulty`
- [x] Them `cognitiveLevel`
- [x] Tao admin English import gateway dung chung cho IELTS/CAE/CPE JSON, gom summary-only import va full standard adapter report
- [x] Cap nhat validator
- [x] Viet migration adapter tu IELTS/CPE schema cu sang schema chung
- [x] Viet migration adapter tu MiuMath question format sang schema chung
- [x] Viet test cho adapter MiuMath
- [x] Viet test cho adapter IELTS/CPE/CAE
- [x] Smoke test du lieu that MiuMath qua adapter chung
- [x] Smoke test du lieu that IELTS/CPE/CAE qua adapter chung
- [x] Them quality audit cho English/CPE de tach loi schema voi loi san sang hoc tap
- [x] Chan cau English/CPE chua learning-ready khoi pilot/diagnostic mac dinh
- [x] Xuat danh sach cau English/CPE loi ra JSON/CSV/Markdown de sua noi dung theo batch
- [x] Tao English learning catalog dung chung cho diagnostic/practice/mastery
- [x] Tao filter giu cau learning-ready trong cau truc test cu de app IELTS/CPE co the dung ngay
- [x] Tao SAT public package adapter sang `QuestionItem`
- [x] Tao SAT content guard de dem/chan loi khi public SAT bank thay doi
- [x] Validate full SAT public package 9,305 cau qua schema chung
- [x] Tao SAT learning catalog va selector diagnostic/practice tu schema chung

## 8. Phase 6 - MiuMath Pilot

Muc tieu: bien MiuMath thanh pilot dau tien cua Knowledge Graph + Learning Core.

- [x] Chon pham vi pilot: Toan lop 9
- [x] Chon 50 cau hoi dau tien de tag metadata
- [x] Gan `conceptIds` cho 50 cau hoi
- [x] Gan `skillIds` cho 50 cau hoi
- [x] Gan `misconceptionIds` cho 50 cau hoi
- [x] Tao diagnostic test dau vao
- [x] Luu attempt bang `packages/learning`
- [x] Tinh mastery bang `packages/learning`
- [x] Tao learning path dua tren prerequisite
- [x] Dua cau sai vao Error Notebook
- [x] Hien thi dashboard mastery trong MiuMath
- [x] Hien thi goi y bai tiep theo trong MiuMath
- [x] Xac nhan flow: diagnostic -> practice/review -> mastery update

## 9. Phase 7 - English Core Va IELTS Layer

Muc tieu: tach English Core khoi IELTS, sau do IELTS chi la exam layer.

- [x] Dinh nghia English Core Vocabulary graph
- [x] Dinh nghia English Core Grammar graph
- [x] Dinh nghia English Core Reading graph
- [x] Map IELTS Reading vao English Core
- [x] Map IELTS Listening vao English Core
- [x] Tao readiness gate cho English questions truoc khi dua vao learning flow
- [x] Tao audit bao loi CPE/IELTS thieu answer key, reading content, listening content, options, explanation
- [x] Tao selector diagnostic/practice cho English dua tren `EnglishLearningCatalog`
- [x] Tao duong ghi attempt tu `QuestionItem` sang `StudentModel`/mastery
- [x] Noi Adaptive Practice IELTS/CPE vao ready-only question bank
- [x] Hien readiness summary trong Adaptive Practice Room: ready questions, blocked questions, ready practice tests
- [x] Giu Writing/Speaking AI o muc feedback, chua dua vao mastery nang cao
- [x] Tao diagnostic nho cho English Reading/Use of English o package-level
- [x] Tao mastery score cho Reading/Grammar skills o package-level
- [x] Tao Error Taxonomy cho English
- [x] Hien thi IELTS learner dashboard
- [x] Tao guard kiem tra ready English content convert sach sang schema chuan khi du lieu cau hoi thay doi
- [x] Tach `skillArea` cho Reading/Listening/Use of English/Writing/Speaking trong English adapter
- [x] Theo doi Writing/Speaking bang feedback-only sample bank rieng, khong lam sai mastery
- [x] Tao readiness matrix theo full English skills de biet ky nang nao da hoc duoc, ky nang nao con can sua noi dung

## 10. Phase 8 - Portal Va Dashboard Chung

Muc tieu: `miuprep-portal` tro thanh cong chung cho hoc sinh, phu huynh, admin.

- [x] Hoc sinh xem program dang hoc
- [x] Hoc sinh xem mastery theo domain/program
- [x] Hoc sinh xem learning path
- [x] Hoc sinh xem error notebook
- [x] Phu huynh xem tien do tung hoc sinh
- [x] Phu huynh xem diem yeu/noi dung can on
- [x] Admin xem content coverage theo concept/skill
- [x] Admin xem cau hoi chua tag metadata
- [x] Admin xem cau hoi co ti le sai bat thuong
- [x] Admin xem learning event analytics
- [x] Admin xem English skill readiness matrix: Reading, Listening, Use of English, Writing, Speaking
- [x] Admin xem breakdown readiness theo IELTS/CPE/CAE de uu tien sua content
- [x] Portal co UI preview cho 2 huong giao dien he thong trong admin Overview: dark operations va MiuMath green learner/classroom
- [x] Admin dashboard duoc tach thanh tab cap cao de giam tai thi giac: Overview, Analytics, Users, Content, Logs
- [x] Trang chu chua dang nhap chi giu noi dung quan trong: Adaptive Core, Mathematics, English Exams, login/register
- [x] Student dashboard duoc tach thanh tab cap cao de giam tai thi giac: Overview, Courses, Practice, Tutor, Rewards

## 11. Phase 9 - AI Tutor

Muc tieu: dung AI de tang chat luong phan hoi, khong thay the engine loi.

- [x] AI giai thich cau sai dua tren concept/skill
- [x] AI tao hint Socratic theo misconception
- [x] AI goi y remediation lesson
- [x] AI feedback Writing IELTS/CPE
- [x] AI feedback Speaking IELTS/CPE
- [x] AI phan loai loi sai neu metadata thieu
- [x] Luu AI feedback thanh learning event
- [x] Hien thi do tin cay cua AI feedback

## 12. Phase 10 - Beta Va Mo Rong

- [x] Beta noi bo voi Toan lop 9
- [x] Beta noi bo voi IELTS Reading/Listening
- [x] Thu thap learning events that
- [x] Kiem tra do dung cua diagnostic
- [x] Kiem tra recommendation co hop ly khong
- [x] Tao graph-adjustment backlog tu weak mastery va misconception signals
- [x] Xuat beta run package JSON/Markdown de review hang ngay
- [ ] Sua Knowledge Graph theo du lieu that
- [x] Mo rong Toan 6-8
- [x] Mo rong English Core Listening
- [x] Mo rong English Core Writing
- [x] Mo rong English Core Speaking
- [x] Map SAT Math vao Mathematics
- [x] Map SAT Reading/Writing vao English Core
- [x] Map IELTS/CAE/CPE vao full English Core skills
- [x] Dua SAT public student package vao `@miuprep/content` adapter/guard chung
- [x] Tao SAT diagnostic/practice selector dung chung tren `QuestionItem`
- [x] Noi SAT Studio diagnostic/practice/Bluebook route vao SAT selector chung qua content bridge

## 12.5 Phase 11 - Toi Uu Su Pham Va Tang Toc Tien Bo

Muc tieu: bien Miuprep tu he thong "lam bai va xem diem" thanh he thong "hieu dang sai o dau, hoc lai dung mat xich, luyen vua du, tien bo thay duoc".

Nguyen tac thiet ke:

- Hoc sinh: moi ngay chi thay viec can lam nhat, ly do vi sao can lam, va tien bo sau khi lam.
- Giao vien/admin content: thay ngay cau hoi, ky nang, misconception, lesson nao can sua hoac bo sung.
- Phu huynh: nhin thay con dang mac o dau va hanh dong tiep theo, khong bi ngap so lieu.
- He thong: moi cau hoi/lesson/feedback deu quay ve Knowledge Graph, Student Model, Error Taxonomy, Mastery Model.

### 12.5.1 Nen Tang Da Xu Ly

- [x] Chia he thong thanh 2 he lon: Mathematics va English Certifications, co `Program` rieng cho IELTS, SAT, CAE, CPE
- [x] Dung Knowledge Graph chung lam loi de noi concept, skill, prerequisite, remediation
- [x] Co Student Model/Mastery tracking theo concept va skill
- [x] Co Diagnostic Test va recommendation flow dau tien cho Math/English/SAT
- [x] Co Error Taxonomy va Error Notebook/SRS cho loi sai lap lai
- [x] Co AI Tutor explain/hint/remediation/feedback dua tren metadata va learning event
- [x] English da map day du Reading, Listening, Use of English, Writing, Speaking cho IELTS/CPE/CAE
- [x] SAT da tach thanh program rieng va map Reading/Writing vao English Core, Math vao Mathematics
- [x] Co adapter/import guard cho MiuMath, IELTS/CPE, SAT de du lieu con sau nay co the dong bo lai vao schema chung
- [x] Co dashboard theo vai tro: student, parent, admin
- [x] Admin dashboard da tach tab cap cao de giam tai thi giac
- [x] Student dashboard da tach tab cap cao: Overview, Courses, Practice, Tutor, Rewards
- [x] Trang chu da rut gon chi giu noi dung quan trong
- [x] Co 2 huong giao dien: dark operations va MiuMath green learner/classroom
- [x] Co admincontent co the mo de, check, sua truc tiep va luu trang thai draft/needs-fix/checked
- [x] Co Content Review Summary/Filter cho IELTS/CAE/CPE de theo doi tien do review de

### 12.5.2 Student Daily Learning Loop V2

Muc tieu: hoc sinh vao la biet ngay "hom nay can lam gi" thay vi tu tim trong nhieu man hinh.

- [x] Co `StudentTodaySprint` tren dashboard hoc sinh
- [x] Co dashboard mastery va learning path chung
- [x] Co rewards/streak/xp de tao dong luc ban dau
- [x] Chuan hoa daily loop thanh 5 buoc: mini diagnostic -> micro lesson -> guided practice -> independent practice -> error review
- [x] Them trang thai "today target completed" tren daily plan theo user/date storage
- [x] Dong bo "today target completed" truc tiep tu learning events that cua app con
- [x] Them "vi sao he thong giao bai nay" dua tren weakest concept/skill/misconception
- [x] Them "unlock next" khi dat mastery threshold, de hoc sinh thay duoc tien trinh
- [x] Them che do 15 phut, 30 phut, 60 phut de he thong tu cat lesson/practice theo thoi gian hoc

### 12.5.3 Lesson Template Chuan Cho Hieu Sau

Muc tieu: moi lesson khong chi la noi dung, ma la mot cau truc day hoc co the do tien bo.

- [x] Co lesson schema chung trong knowledge/content layer
- [x] AI Tutor da co remediation lesson suggestion
- [x] Tao `LessonTemplate` chuan: concept summary -> worked example -> guided steps -> independent set -> mixed review -> reflection
- [x] Gan moi lesson template voi prerequisite/remediation ids tu Knowledge Graph
- [x] Ap dung truoc cho cac unit Math 9 co loi nhieu: bien doi dai so, factorization, quadratic equation, geometry proof
- [x] Dong bo lesson template thanh knowledge object/edge chinh thuc trong packages/knowledge khi schema san sang
- [x] Ap dung cho English Core: grammar, vocabulary, reading inference, collocation
- [x] Them "common traps" vao lesson de hoc sinh tranh loi sai thuong gap
- [x] Them quick-check cuoi lesson de cap nhat mastery nhe, khong can lam test dai

### 12.5.4 Error Notebook V2 - Sua Loi Den Tan Goc

Muc tieu: bien loi sai thanh bai hoc ca nhan hoa, khong chi luu lich su sai.

- [x] Co Error Notebook core va SRS review
- [x] Co misconception bridge giua cau sai va remediation
- [x] Co AI classify loi sai neu metadata thieu
- [x] Them error entry view gom: root cause, missed step, repair lesson, due date, retry status
- [x] Tach loi kien thuc, loi doc de, loi tinh toan, loi chien luoc thoi gian
- [x] Them flow "redo until stable": sai lai 2 lan thi quay ve prerequisite
- [x] Them grouped error notebook theo concept/skill thay vi chi theo cau hoi
- [x] Them admin view top recurring misconceptions de uu tien sua content/lesson

### 12.5.5 English Writing/Speaking Feedback-To-Practice

Muc tieu: feedback Writing/Speaking phai tao ra bai luyen tiep theo, khong dung o nhan xet.

- [x] Co Writing/Speaking trong English Core skill coverage
- [x] Co AI feedback Writing IELTS/CPE
- [x] Co AI feedback Speaking IELTS/CPE
- [x] Co guard de Writing/Speaking feedback-only khong tinh mastery nhu objective test
- [x] Tao rubric action bank cho IELTS/CAE/CPE Writing: task response, coherence, lexical resource, grammar, register
- [x] Tao rubric action bank cho Speaking: fluency, pronunciation, lexical range, grammar accuracy, interaction
- [x] Chuyen moi feedback thanh 1-3 practice tasks tiep theo
- [x] Them speaking recording/transcript state de sau nay gan voi AI scoring thuc te
- [x] Them writing revision loop: draft -> feedback -> rewrite -> compare improvement
- [x] Chi dua Writing/Speaking vao mastery khi co validity gate ro rang

### 12.5.6 SAT Pacing Va Trap Optimization

Muc tieu: SAT khong chi luyen cau, ma phai luyen chien luoc, toc do, va nhan dien bay.

- [x] Co SAT public student package adapter trong content bridge
- [x] Co SAT diagnostic/practice selector dung chung tren `QuestionItem`
- [x] Co SAT learning event bridge vao mastery/recommendation
- [x] Them pacing metrics: over-time, easy-wrong, hard-correct, skipped, changed-answer
- [x] Them SAT trap taxonomy: wording trap, evidence trap, grammar exception, algebra shortcut, geometry visual trap
- [x] Them Module 2 readiness signal dua tren accuracy + pacing + difficulty band
- [x] Them strategy remediation cards cho SAT Reading/Writing va SAT Math
- [x] Them mixed adaptive set theo Bluebook-like difficulty bands

### 12.5.7 Math Vietnam Remediation Sau Hon

Muc tieu: Toan Viet Nam can hoc lai dung mat xich lop duoi, dac biet voi THCS -> THPT.

- [x] Co Knowledge Graph cho VN Math 6-9/10-12
- [x] Co MiuMath adapter/guard, da doi chieu du lieu Math 9 voi MiuMath
- [x] Co diagnostic Math 9 va dashboard mastery
- [x] Tao prerequisite backfill cho 28 Math 9 units dua tren loi that
- [x] Them worked examples/guided steps cho unit yeu thay vi chi them cau hoi
- [x] Tach loi CASIO/thao tac tinh nhanh voi loi tu duy toan hoc
- [x] Them geometry proof scaffold: given -> need prove -> known theorem -> proof plan -> final proof
- [x] Them Math 10-12 readiness guard de biet khi nao nen backfill truoc, khi nao du dieu kien import theo cum concept
- [x] Mo rong Math 10-12 theo tung cum concept sau khi import guard on dinh

### 12.5.8 Teacher/Admin Intervention Queue

Muc tieu: giao vien va admin thay viec can lam tiep theo, khong can doc tung log.

- [x] Admin co learning event analytics
- [x] Parent co action summary
- [x] Admincontent co check/sua truc tiep tren de
- [x] Content Review Summary/Filter da tach Draft/Needs Fix/Checked
- [x] Tao teacher queue: hoc sinh stuck > N attempts, mastery giam, error recurrence cao
- [x] Tao content queue: cau hoi co abnormal wrong rate, missing metadata, low discrimination
- [x] Tao parent weekly digest: 3 diem tien bo, 2 diem can on, 1 hanh dong cu the
- [x] Them admin view top recurring misconceptions de uu tien sua content/lesson theo Error Notebook + learning events + Knowledge Graph
- [x] Them export review/change set cho admincontent edits de dong bo nguoc ve source data
- [x] Them permission view rieng cho admin va admincontent neu can phan quyen chat hon

### 12.5.9 Measurement Va Quality Gates

Muc tieu: moi toi uu phai do duoc tac dong den tien bo hoc sinh.

- [x] Co beta tracker va beta run package JSON/Markdown
- [x] Co import guards cho English/MiuMath/SAT
- [x] Co checklist build/lint/test sau moi dot sua lon
- [x] Dinh nghia KPI hoc that: mastery lift, retention after 7 days, time-to-stable, error recurrence rate, lesson completion quality
- [x] Them recommendation quality audit: goi y co dung prerequisite khong, co qua kho/de khong, co lap lai vo ich khong
- [x] Chay beta cohort review hang tuan va cap nhat graph-adjustment backlog
- [ ] Sua Knowledge Graph theo du lieu that tu beta, dong bo voi item Phase 10 con mo
- [x] Tao automated report "what changed, why, impact" sau moi lan cap nhat content/graph

### 12.5.10 Thu Tu Trien Khai Phase 11

- [x] 1. Daily Learning Loop V2 tren student dashboard
- [x] 2. LessonTemplate core va ap dung cho Math 9 weak units
- [x] 3. Error Notebook V2 voi root cause/repair lesson/retry status
- [x] 4. Teacher/Admin Intervention Queue
- [x] 5. Writing/Speaking feedback-to-practice cho CPE/IELTS/CAE
- [x] 6. SAT pacing/trap optimization
- [x] 7. Math 10-12 expansion sau khi graph/data guard da on dinh
- [ ] 8. Beta quality report va Knowledge Graph update theo du lieu that

## 13. Definition Of Done

Mot phase chi duoc coi la xong khi:

- [x] Build pass cho cac app lien quan
- [x] Typecheck pass cho package lien quan
- [x] Co validator/test toi thieu cho schema/engine moi
- [x] Co du lieu mau de demo
- [x] Co flow UI kiem tra duoc bang tay
- [x] Khong lam mat tinh nang dang chay cua MiuMath/CPE/IELTS
- [x] Checklist trong file nay duoc cap nhat

## 14. Uu Tien Gan Nhat

Thu tu nen lam ngay:

- [x] Import MiuMath moi vao monorepo
- [x] Build MiuMath trong monorepo
- [x] Import CPE/IELTS moi vao monorepo
- [x] Build CPE/IELTS trong monorepo
- [x] Tao `packages/knowledge`
- [x] Tao `packages/learning`
- [x] Trich mastery/learning event tu SAT
- [x] Tag 50 cau Toan lop 9 dau tien
- [x] Tao diagnostic flow Toan lop 9
- [x] Tao dashboard mastery dau tien
- [x] Tach IELTS/CPE content sang adapter schema chung
- [x] Tao learner dashboard chung trong `miuprep-portal`
