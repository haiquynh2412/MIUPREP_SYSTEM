# Phân tích diff: ielts-desktop vs cpe-desktop (Task 2.1.1)

Ngày: 11/06/2026 · Phương pháp: `diff` từng file trùng tên, đếm dòng khác biệt

## Kết quả đo

| File | Dòng (ielts) | Dòng khác | Tỷ lệ | Bản chất khác biệt |
|------|--------------|-----------|-------|---------------------|
| hooks/useErrorNotebook.ts | 96 | 0 | 0% | Giống hệt |
| hooks/useLearnerProfile.ts | 197 | 0 | 0% | Giống hệt |
| main.tsx | 13 | 0 | 0% | Giống hệt |
| hooks/useAiEvaluation.ts | 148 | 1 | ~0% | 1 dòng trắng |
| components/modules/ImportErrorModal.tsx | 65 | 2 | 1.5% | Chuỗi nhãn "IELTS-style"/"CPE-style" |
| hooks/useExam.ts | 529 | 6 | 0.6% | `LEARNING_EVENT_SOURCE` + prefix storage khẩn cấp |
| components/modules/ModeSelectorModal.tsx | 89 | 8 | 4.5% | Nhãn + màu accent |
| components/ErrorNotebook.tsx | 442 | 42 | 4.8% | Màu accent (indigo↔emerald) |
| components/AdaptivePracticeRoom.tsx | 1.655 | 62 | 1.9% | **Chỉ màu accent + whitespace** |
| components/modules/ExamSectionSheet.tsx | 797 | 76 | 4.8% | Màu accent + nhãn |
| components/LearnerProfileCard.tsx | 464 | 108 | 11.6% | Màu + thang điểm (band 0–9 vs score 180–230) |
| lib/contentRuntime.ts | 70 | 45 | 32% | Nguồn content theo track — **giữ per-app** |
| components/SpeakingAiRoom.tsx | 780 | 410 | 26% | Nội dung đề + rubric theo track |
| components/Onboarding.tsx | 1.294 | 457 | 18% | Đề chẩn đoán + thang điểm theo track |
| components/WritingAiRoom.tsx | 579 | 542 | 48% | Khác biệt thật theo track |
| App.tsx | 1.754 | 1.243 | 35% | Cấu trúc khác (cpe tách DashboardPanel/ExamRunner) |

**File chỉ có ở một app:** ielts: `AdminPanel.tsx`, `IeltsLearnerDashboard.tsx` · cpe: `modules/DashboardPanel.tsx`, `modules/ExamRunner.tsx`

## Kết luận & thiết kế cho 2.1.2

**Nhóm A — Trích xuất nguyên trạng vào `@miuprep/exam-desktop`** (~4.500 dòng, khác biệt ≤5%):
`useErrorNotebook`, `useLearnerProfile`, `useAiEvaluation`, `useExam`, `ImportErrorModal`, `ModeSelectorModal`, `ErrorNotebook`, `AdaptivePracticeRoom`, `ExamSectionSheet`, `LearnerProfileCard`

**Cơ chế tham số hóa:**
1. `TrackConfig` qua React context: `{ trackId, label, learningEventSource, emergencyStoragePrefix, schemaLabel, bandScale }`
2. **Màu theme:** đổi mọi class `indigo-*`/`emerald-*` trong component chung thành màu ngữ nghĩa `accent-*`; mỗi app định nghĩa `accent` trong Tailwind config của mình (ielts→indigo, cpe→emerald). Không cần classmap runtime, không cần safelist.

**Nhóm B — Giữ per-app, hợp nhất sau** (khác biệt nội dung thật):
`WritingAiRoom`, `SpeakingAiRoom`, `Onboarding`, `App.tsx`, `contentRuntime.ts` — phụ thuộc đề/rubric/thang điểm theo track; hợp nhất ở bước 2.1.3 bằng cách đẩy nội dung track vào `@miuprep/content` và giữ component chung.

**Ước tính giảm:** Nhóm A loại ~4.500 dòng bảo trì kép ngay; Nhóm B thêm ~4.000 dòng khi xong 2.1.3.
