# Subject Boards — Design Proposal (roadmap 2.1.5 Phase 2)

> Goal: each subject (Math, English IELTS/CAE/CPE, Physics, SAT) opens a real
> learning "board" inside the **one** web portal (tuonglai.wallart.vn) — single
> login, many subjects. This documents the recommended design after researching
> what each subject already has.

## Key finding (changes the whole approach)

Each subject **already has a full, pedagogically-appropriate React UI** — and
**none of them use Tauri** (`@tauri-apps` usage = 0 files in `exam-desktop`,
`miumath-app`, `miuphysics-app`). They are plain Vite/React → **web-renderable
as-is**. The desktop `.exe` was only a Tauri shell around the same React.

⇒ **Do NOT rebuild every subject as a "SAT clone."** The subjects are not
homogeneous; each has its own correct model. The integration is: **mount each
existing subject UI into the portal as a track module**, wired to the shared
portal account / storage / i18n / learning-engine.

## What each subject already is

| Subject | Existing UI (reuse) | Model | AI needed? |
|---|---|---|---|
| **SAT** | `StudentSatBoardWorkspace` (in portal: `sat-board`) | Item-bank adaptive (CAT/IRT, Desmos) | no (auto-scored) |
| **Math** | `apps/miumath-app` rooms: MathPracticeRoom, MathExamRoom, MathErrorNotebook, MathDiaryRoom | Curriculum grades 1–12 (59k Q), practice/exam/error-notebook | no (auto-scored) |
| **English** (IELTS/CAE/CPE) | `@miuprep/exam-desktop`: AdaptivePracticeRoom, ExamSectionSheet, WritingAiRoom, SpeakingAiRoom, ErrorNotebook | 4-skill exam (Listening/Reading auto; Writing/Speaking AI-graded) | **yes** (Writing/Speaking) |
| **Physics** | `apps/miuphysics-app`: ChapterMap, DiscoveryMap, DetectiveMission, HomeLabCard, ObservationDiary | Gamified exploration (chapters/missions/home-lab) | no |

Shared engine available for all: `@miuprep/learning` (computeMastery,
recommendNextAction, buildLearningPath, CAT/IRT calibration) +
`@miuprep/i18n` + portal IndexedDB account.

## Recommended architecture — one wrapper, N modules

Add per-subject portal tabs to the existing `activeStudentTab` switch (today only
`'dashboard' | 'sat-board'`). The subject launcher (Phase 1, already shipped)
routes each card to its tab.

```
activeStudentTab: 'dashboard' | 'sat-board' | 'math-board' | 'english-board' | 'physics-board'
```

A thin **`SubjectBoardHost`** lazy-loads the subject module and injects portal
context so each app stops using its own auth/localStorage:

```tsx
<SubjectBoardHost subject="math">
  // injects: currentUser, db (IndexedDB), t (i18n), onLearningEvent
  // (saveStudentLearningEvent), aiClient (proxy, Phase 3), back-to-dashboard
</SubjectBoardHost>
```

Each subject module already has the rooms; the work is **adapter glue**, not new
UI:
1. Replace the module's standalone auth screen → read `currentUser` from portal.
2. Replace its localStorage keys → portal db adapter (IndexedDB now; backend later).
3. Route its "save attempt" → portal `saveStudentLearningEvent` (one event log →
   one mastery model across subjects).
4. i18n via shared translator (miuphysics already on `@miuprep/i18n`).

## Per-subject plan + effort

### 1. Math board — DO FIRST (biggest content, no AI, ready)
- Mount `MathPracticeRoom` + `MathExamRoom` + `MathErrorNotebook` from miumath-app.
- Content: `vn_math_*` (grades 1–12) already in `@miuprep/content`.
- Glue: portal account + learning events. **No AI, no backend needed** → shippable now.
- Effort: **Medium**. Risk: low (auto-scored, content ready).

### 2. Physics board — EASY WIN (self-contained, gamified, no AI)
- Mount miuphysics gamified UI (ChapterMap/DiscoveryMap/HomeLab/Diary).
- Glue: portal account + i18n (already shared) + progress in portal db.
- Note: physics has **no mastery "program"** in the engine yet → keep it as a
  gamified/exploration board (not in the SAT-style mastery growth-map; recall the
  earlier `TRACK_TO_PROGRAM` cascade — physics stays a non-program board).
- Effort: **Medium**. Risk: low.

### 3. English board — SHIP IN 2 STEPS (AI-gated)
- **3a (now):** Listening + Reading + Use-of-English via `ExamSectionSheet` /
  `AdaptivePracticeRoom` (auto-scored) — works without backend.
- **3b (after Phase 3 backend):** `WritingAiRoom` + `SpeakingAiRoom` need the
  **AI proxy** (roadmap 2.4.3) so the OpenAI/Gemini key never reaches the client.
  Until then, Writing/Speaking show "graded after sign-in to AI service" or a
  teacher-scoring fallback (3.1.4).
- Effort: **Medium-High** (4 skills + AI dependency). Risk: medium (AI/backend).

### SAT — already done (reference). Keep as-is.

## Cross-cutting prerequisites (shared by all boards)
- **Account unification (do once, before/with Math board):** portal is the single
  login; subject modules must NOT render their own auth. Small shared adapter.
- **Storage:** portal IndexedDB now; multi-device persistence later via backend
  sync (2.4.4) using the existing `idempotencyKey`/`sync_status`.
- **AI:** only English Writing/Speaking needs it → backend AI proxy (2.4.3).

## Suggested sequence (incremental, low-risk first)
1. `SubjectBoardHost` + account/db/i18n injection adapter (shared plumbing).
2. **Math board** (no AI) → ship.
3. **Physics board** (no AI) → ship.
4. **English 3a** (Listening/Reading) → ship.
5. **Backend (Phase 3 / 2.4.2–2.4.5)** → unlocks English 3b (Writing/Speaking AI),
   multi-device sync, server-side scoring (1.1.5), community difficulty (3.1.1).

> Net: ~3 boards mountable from existing React with adapter glue (no Tauri, no
> rebuild). AI-graded English + multi-device wait on the backend (needs hosting).
