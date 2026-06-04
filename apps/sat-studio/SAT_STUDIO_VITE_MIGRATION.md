# SAT Studio Vite Migration

Status: Phase 1-5 tracked parity is complete for the Vite/Svelte routes. Student, parent, and admin default routes now have typed Vite implementations for the previously legacy-only learning tools, vocabulary, official exam logs, announcements, rewards, backend sync/session controls, learning-event logging, and parity audit coverage.

## Canonical Phase Plan

1. Phase 1: Vite build wrapper, keep the current app running.
   - Status: done.
   - Evidence: `vite.config.mts`, `vite-student.html`, `src/vite-main.ts`, and `student.html` now route the learner entry to `dist/vite/vite-student.html`.
   - Legacy fallback remains available at `student.html?legacy=1`.

2. Phase 2: TypeScript domain models and content/public gate.
   - Status: done for the public learner package and student learning state.
   - Evidence: `src/domain/public-content-contract.ts`, `src/domain/student-learning.ts`, and their tests.
   - The public learner contract is `sat_public_student_contract_v1`.

3. Phase 3: Rewrite Student UI in Svelte.
   - Status: done for dashboard, diagnostic, practice, and review.
   - Evidence: `src/student/SatStudentShell.svelte`.
   - Covered flows: Today dashboard, 20-question diagnostic, focused practice sprint, missed-skill review/proof flow, local learner progress.

4. Phase 4: Rewrite Admin/content review later.
   - Status: done for content review, guarded content operations, local account operations, and parent coach dashboard.
   - Done: `admin.html` now routes to `dist/vite/vite-admin.html` by default.
   - Done: `src/domain/admin-content.ts` provides a typed content-review model, public-promotion gate, queue classification, and source/domain summaries.
   - Done: `src/admin/SatAdminShell.svelte` renders the first Svelte Admin Content Review shell.
   - Done: the admin shell now includes action-queue counts, answer-choice review, correct-answer display, explanation/trap inspection, and source/routing facts.
   - Done: release gate tab reads the public content package and verifies contract, item count, manifest total, and internal-field leakage.
   - Done: SAT readiness tab surfaces blueprint/domain balance, public-candidate count, strict-1600 hard pool, grid-in ratio, and hard Math multi-step ratio.
   - Done: source governance tab separates eligible unified-pool sources from protected/private sources.
   - Done: authoring/import checks tab documents pre-save constraints and the remaining mutation boundary.
   - Done: guarded public-promotion write workflow via `npm run admin:promote-public -- --id <question_id>` for dry-run, and `npm run admin:promote-public -- --apply --id <question_id>` for apply. Apply requires explicit IDs or `--all-eligible`, writes backups, appends `data/public-promotion-audit-log.jsonl`, and regenerates latest public manifest/content package artifacts.
   - Done: guarded audit-resolution write workflow via `npm run admin:resolve-audit -- --id <question_id> --action pass|block|reject` for dry-run, and the same command with `--apply` for write. Apply writes backups, updates `data/question-audits.json`, appends `data/question-audit-resolution-log.jsonl`, and regenerates latest public artifacts so blocked/rejected questions leave the learner package immediately.
   - Done: guarded authoring/import save workflow via `npm run admin:save-question -- --input <drafts.json>` for dry-run, and the same command with `--apply` for write. It normalizes through the question import contract, runs answer/structure checks plus duplicate/skeleton safety, appends only accepted drafts to `data/sat-studio-foundation-bank.json`, writes backups, and appends `data/authoring-import-save-log.jsonl`.
   - Done: guarded source-signal save workflow via `npm run admin:save-source-signal -- --input <signals.json>` for dry-run, and the same command with `--apply` for write. It requires `protectedTextExcluded`, stores metadata-only signals in `data/source-signals.json`, writes backups, and appends `data/source-signal-save-log.jsonl`.
   - Done: local account operations moved into Vite/Svelte with `src/domain/account-ops.ts` and the Admin Accounts tab. It reads/writes `sat-studio-state-v2`, preserves existing state, enforces passcode uniqueness, parent/admin edit policy, linked-parent cleanup, and last-admin protections.
   - Done: `scripts/vite_admin_smoke_test.py` covers all admin tabs.
   - Done: `parent.html` now routes to `dist/vite/vite-parent.html` by default. `src/parent/SatParentShell.svelte` reads local Vite student progress and renders parent coaching metrics, weak-skill rows, and roadmap risk flags.
   - Done: `scripts/vite_parent_smoke_test.py` covers the parent route.
   - Current boundary: server authentication, backend RBAC/session revocation, detailed profile conflict merge/apply UI, and broader legacy-only internal dashboards remain outside the Vite scope.
   - Legacy fallback remains available at `admin.html?legacy=1`.

5. Phase 5: Gradually remove `app.js` legacy once test coverage is sufficient.
   - Status: tracked Vite parity complete; explicit legacy fallback retained for decommission safety.
   - Done: public backend session/sync control surface now has `src/domain/public-backend.ts`, tests, and a Vite Admin `Backend sync` tab for health, bootstrap, login, refresh, monitoring, export, logout, full-profile sync, server-profile load, conflict diff review, and explicit local apply controls.
   - Done: reward program and claim operations now have `src/domain/rewards.ts`, tests, a Vite Admin `Rewards` tab for program creation, activation/pausing, safe deletion, pending claim fulfillment, and cancellation with point return, plus a Vite Student `Rewards` tab for store browsing, pending-state display, and point-safe redemption.
   - Done: Vite student attempts now write normalized `sat_attempt_v2` records and `learning_event_v1` events through `src/domain/learning-events.ts` and `src/domain/student-learning.ts`. Events are persisted in both local learner state and the active student profile, with revision/updated-at fields for future analytics and IRT calibration.
   - Done: Vite student tools now cover `Lesson library`, visible `resource links`, `Vocabulary` flashcards/quiz, `Official log` entry, and `Exam review` calibration with typed domain coverage in `src/domain/student-tools.ts`.
   - Done: Vite admin/student announcement publishing now covers `News` and `Announcement` feed workflows through `src/domain/announcements.ts`.
   - Done: `scripts/audit_vite_legacy_parity.py` writes `data/vite-legacy-parity-audit.json` and fails if any required Phase 1-5 capability lacks Vite evidence. Current audit: 17 tracked features, 12 required, 17 Vite-owned, 0 legacy-only, 0 missing evidence, 0 required blockers.
   - Done: 2026-05-28 Reading and Writing integrity cleanup repaired the 53 `rw_prompt_too_long` warnings in source data, fixed the exposed answer/explanation mismatches found in that batch, refreshed training metadata, and regenerated the public learner package.
   - `app.js` is no longer the owner for any tracked Phase 1-5 default-route capability. It remains only behind `?legacy=1` fallback and should be removed in a separate decommission slice after a final archive/export decision.
   - Removal condition: every replaced route has equivalent Svelte implementation, unit coverage, browser smoke coverage, release checklist coverage, and parity audit evidence. This condition is satisfied for the tracked default routes.

## Current Public Route

The student-facing route is now:

```text
student.html -> dist/vite/vite-student.html
```

The legacy learner route remains:

```text
student.html?legacy=1 -> index.html?entry=student
```

The admin content-review route is now:

```text
admin.html -> dist/vite/vite-admin.html
```

The legacy admin route remains:

```text
admin.html?legacy=1 -> index.html?entry=admin
```

The parent coach route is now:

```text
parent.html -> dist/vite/vite-parent.html
```

The legacy parent route remains:

```text
parent.html?legacy=1 -> index.html?entry=parent
```

## Public Contract

The student-facing content package uses `sat_public_student_contract_v1`.

Allowed learner item data includes question content, section/domain/skill/difficulty, answer fields, timing, and learning tags. Governance fields such as `sourceType`, `sourceName`, `reviewStatus`, `visibility`, `publicationStatus`, `licenseNote`, and audit metadata are stripped from the public package.

## Required Verification

```powershell
cmd /c npm run test:vite
cmd /c npm run smoke:vite
node scripts\run_quality_checks.js
python scripts\release_checklist.py --strict
```

## Last Verified Scope

- Student/public learner route: production-ready under Vite/Svelte.
- Student learning telemetry: normalized attempt/event logging in Vite, with learner-state and profile persistence plus smoke coverage for the browser write path.
- Student learning tools: Vite/Svelte lesson library/resource links, vocabulary flashcard/quiz, official score logging, and exam review calibration are active.
- Admin content-review shell: Vite/Svelte inspection shell in place for review queue, release gate, readiness, source governance, authoring/import checks, local account operations, rewards, backend sync/session operations, and profile conflict review/apply; public promotion, audit resolution, authoring/import save, and source-signal save now have guarded CLI write workflows with audit logs and artifact regeneration where needed.
- Admin announcements: Vite/Svelte news publishing and learner announcement feed are active.
- Parent coach route: Vite/Svelte route in place for local learner progress, next coaching action, metrics, skill risks, and roadmap health flags.
- Public content package: learner-safe package with 9305 public items, content version `sat-studio-public:public-manifest-gate-v1-2026-05-20:fnv1a32:3e9e5622`, no internal governance keys, and zero integrity warnings.
- Legacy parity: `data/vite-legacy-parity-audit.json` shows 17/17 tracked capabilities Vite-owned, with 0 legacy-only surfaces and 0 missing evidence.
- Full app replacement: complete for tracked default routes. Physical `app.js` deletion is intentionally left to a final fallback decommission/archive slice.
