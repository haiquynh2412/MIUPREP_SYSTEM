# SAT Studio Public Launch Implementation Checklist

Generated: 2026-05-29

## Completed In This Pass

- [x] Phase 1 Student UX public polish: Vietnamese student shell labels, simpler pre-baseline dashboard, compact post-baseline metrics, and learner-safe wording.
- [x] Phase 1 leakage guard: updated Student smoke to fail on internal/public-gate fields such as `reviewStatus`, `sourceType`, `licenseNote`, `private_family`, and governance labels.
- [x] Phase 1 compact review surfaces: capped official score log rendering and kept lesson/vocab lists bounded.
- [x] Phase 2 Bluebook foundation: added Bluebook module entry, 22-question shell, question navigator, module timer, hide-timer control, flagging, prompt highlight, answer eliminator, and Desmos access panel.
- [x] Phase 2 Bluebook persistence: saved Bluebook question ids, current index, answers, flags, highlights, eliminations, and remaining timer through the Vite offline store for refresh recovery.
- [x] Phase 2 Bluebook module review: added end-of-module scoring/review so Bluebook mode no longer behaves only like per-question practice.
- [x] Student/parent journey polish: localized remaining public copy, upgraded Bluebook review into a coaching report, and added a parent-facing SAT 1600 roadmap strip.
- [x] Phase 3 offline sync foundation: queued backend profile/progress sync payloads locally when backend sync fails and flushes them when online/session is available.
- [x] Phase 3 Vite IndexedDB adapter: added typed offline store backed by IndexedDB with localStorage/memory fallback.
- [x] Phase 3 public package cache: cached backend/static public question packages in the offline store and falls back to the cached package if live content loading fails.
- [x] Phase 2 highlighter improvement: Bluebook prompt highlighter now stores selected prompt text snippets instead of only toggling the full prompt.
- [x] Phase 5 classroom foundation: added Teacher/Classroom cockpit model, stable class code, recommended assignment draft, local assignment ledger, and Parent dashboard priority queue for visible students.
- [x] Phase 5 student assignment bridge: Student dashboard now reads the classroom assignment ledger, shows due/open/completed evidence status, and routes assignment actions into diagnostic, remedial sprint, proof review, or Bluebook timed mode.
- [x] Phase 5 parent assignment evidence: Parent dashboard now labels each assignment by due/evidence status and shows the focus skill, so coach review is tied to actual learner attempts.
- [x] Phase 5 assignment smoke: Vite Student smoke now injects a classroom assignment, verifies the card renders, and clicks through to the assigned diagnostic route.
- [x] Phase A Bluebook Pro Mode: added route-aware module cockpit, embedded Desmos iframe, timer pressure warning, answered/skipped/flagged counters, and adaptive next-branch review.
- [x] Phase B habit loop foundation: added academic daily mission model, Student dashboard mission card, reward/streak claim path, and domain tests.
- [x] Phase A5 Bluebook polish: added module directions transition, branch selector, timer pause before module start, and exam surface spacing safeguards.
- [x] Phase B3/B4 rewards polish: added streak-freeze accounting, Student reward-store streak display, Parent reward builder, and Parent reward claim resolution.
- [x] Test drift cleanup: updated Vite smoke and Vite legacy parity audit markers for the Vietnamese Student UI.
- [x] Public build refreshed: regenerated `dist/vite` assets for the active public backend.

## Verified

- [x] `npm run typecheck`
- [x] `npm run test:vite`
- [x] `npm run smoke:vite`
- [x] `npm run test:public-contract`
- [x] `python scripts/audit_vite_legacy_parity.py`
- [x] `python scripts/public_backend_unit_tests.py`
- [x] `node scripts/public_api_unit_tests.js`
- [x] `python scripts/public_app_static_tests.py`
- [x] `node scripts/run_quality_checks.js`
- [x] `python scripts/release_checklist.py --strict`
- [x] Active backend health on `http://127.0.0.1:8765/api/public/health`
- [x] Active public Student build reachable at `http://127.0.0.1:8765/dist/vite/vite-student.html`

## Still Not Complete

- [ ] Full pixel-perfect Bluebook parity: exact College Board-level spacing and Desmos API state sync beyond iframe embed.
- [ ] Habit loop v3: backend-synced reward programs, cross-device parent approvals, and production notification hooks.
- [ ] Teacher/classroom cockpit v2: teacher role auth UI, backend assignment APIs, class reports, due-assignment status, and item-level class analytics.
- [ ] Production cloud hardening: PostgreSQL adapter, secure HTTP-only cookie auth, CSRF protection, durable distributed rate limiting, deployment monitoring, and backup policy.
- [ ] Real IRT calibration: requires real student attempt logs before fitting reliable item parameters.
