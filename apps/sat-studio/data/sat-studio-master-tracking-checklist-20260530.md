# SAT Studio Master Tracking Checklist

Generated: 2026-05-30

Scope: consolidated implementation tracker for product readiness, SAT pedagogy, content governance, backend/security, and public deployment.

Legend:

- `[x]` Completed and verified in current repo.
- `[ ]` Not complete or still needs production/live-data work.
- `Partial` means usable foundation exists, but not enough for the final target.

## Current Readiness Snapshot

- [x] Local public build is release-ready for controlled pilot testing.
- [x] Vite/Svelte student app is the active public-facing route.
- [x] Core closed-loop SAT training system is implemented: Diagnostic -> Skill Tree -> Lesson -> Scaffold Drill -> Proof -> Timed Sprint -> Crucible -> Spaced Retention -> Recalibration.
- [x] Active reviewed bank is ready for training use: 10,523 active reviewed questions.
- [x] Public candidate pool exists and passes current content quality gates.
- [x] Backend health confirms SQLite WAL mode, 30 second timeout, CSRF protection, and PostgreSQL upgrade guard.
- [x] SQLite pilot deployment now has deploy readiness, restore drill, and concurrent load smoke gates.
- [x] Production code path now includes opt-in PostgreSQL migration/runtime adapter, Redis-backed distributed rate limiting, JSONL access logs, admin metrics, and domain verification gate.
- [ ] Hosted production is not complete until managed PostgreSQL/Redis/HTTPS/observability resources are provisioned and verified on the target platform.

## Last Verified Checks

- [x] `node scripts/run_quality_checks.js`
- [x] `npm run smoke:vite`
- [x] `python scripts/release_checklist.py --strict`
- [x] `python scripts/check_public_deploy_readiness.py --json`
- [x] `python scripts/public_backend_load_smoke.py --workers 8 --operations 80`
- [x] `python scripts/check_postgres_migration_artifact.py`
- [x] `python scripts/verify_public_domain.py --base-url http://127.0.0.1:8765 --allow-http`
- [x] Live backend health at `http://127.0.0.1:8765/api/public/health`
- [x] Live CSRF rejection for unsafe cookie-auth request without `X-CSRF-Token`

## Product And Student Experience

- [x] Vite build wrapper keeps the app running while legacy code is phased out.
- [x] TypeScript domain models exist for content, public gate, learning, and public backend access.
- [x] Student UI is rebuilt in Svelte for dashboard, practice, review, diagnostic, lessons, vocab, official practice, news, rewards, and parent-facing summary surfaces.
- [x] Bluebook-style student mode exists with two modules and automatic Module 2 route selection.
- [x] Manual route selector was removed from student test flow; routing is now based on Module 1 performance.
- [x] Student test tools include flagging, elimination, highlighter, answer persistence, timer warning, and review screen.
- [x] Desmos is embedded through API-oriented integration in the math test area.
- [x] Student public package loader uses cookie credentials and does not leak bearer sentinels into `Authorization`.
- [ ] Pixel-perfect College Board visual parity is not complete; current UI is functionally Bluebook-like, not exact spacing-by-spacing replication.
- [ ] Full production-grade exam ceremony still needs final polish: start/check screens, break/transition screens, end-of-test confirmation, and exact accessibility pass.

## SAT Pedagogy And Adaptive Training

- [x] Question metadata is normalized for routing: skill, subskill, domain, difficulty, skeleton/template, cognitive move, semantic field, math tool tag, and multi-step level.
- [x] Metadata coverage is effectively complete for active bank: core metadata 100%, skeleton/template 100%, cognitive move 100%, RW semantic field 100%, math tool tag 100%, multi-step level 100%, trap type 99.4%.
- [x] Pool logic exists: core training, remedial, public candidate, and crucible pools.
- [x] Diagnostic modes and blueprint-aware sampling are implemented.
- [x] Mastery model requires enough attempts and hard/fresh proof; students cannot master a skill from easy repeated patterns only.
- [x] Remedial sprint logic supports foundation repair, scaffold, proof, timed work, and error-driven next steps.
- [x] Crucible routing exists for hard same-skill, hard transfer, hard mixed, and timed proof work.
- [x] Spaced repetition schedules follow error type and proof/maintenance logic.
- [x] Explanation coaching supports staged hints, trap explanation, selected-answer feedback, and proof follow-up.
- [ ] Real IRT 2PL calibration is pending live student logs; current system uses metadata difficulty and heuristic evidence.
- [ ] Item analytics can be expanded after enough attempts per item: p-value after about 30 responses, discrimination after about 100, stronger calibration after about 200.

## Content Quality And Governance

- [x] Active reviewed bank count: 10,523.
- [x] Closed-loop audit reports 0 critical quality blockers and 0 needs-review blockers in active reviewed pool.
- [x] Public package uses eligible/public-safe questions, not source-isolated pools.
- [x] Source labels are treated as provenance/storage metadata only; training pools are unified across sources.
- [x] Public source leakage guard is in place.
- [x] Release checks include public contract and content quality checks.
- [ ] 53 long RW prompts are technically valid but suppressed from default study; rewrite/split is optional if they should appear in normal learner flow.
- [x] Admin Web Expert Gate is implemented for direct prompt, choices, answer, explanation, metadata, trap-note, and copyright-note editing.
- [x] Question version history is implemented locally and can be submitted to the backend review ledger.
- [x] SourceSignal -> AI draft -> Expert review -> Public package workflow is visible and auditable in the Admin Expert Gate tab.

## Parent, Teacher, And Classroom

- [x] Parent-facing Svelte dashboard exists with student progress, mastery, weak skills, next actions, and coaching context.
- [x] Local classroom cockpit foundation exists.
- [x] Assignment and evidence bridge foundations exist for local flows.
- [x] Parent/reward loop exists in local app surfaces.
- [x] Teacher/backend classroom cockpit is available in the parent/teacher shell.
- [x] Backend APIs for classes, join codes, assignments, and evidence are complete for pilot use.
- [x] Student join-class flow is complete for backend student accounts.
- [x] Teacher class report includes item-level wrong rate, weak-skill clustering, and assignment evidence status.
- [ ] Backend-synced rewards, parent approvals, and production notification hooks are not complete.

## Backend, Security, And Reliability

- [x] SQLite WAL mode is enabled for the public backend.
- [x] SQLite timeout is raised to 30 seconds.
- [x] In-memory rate limiter includes pruning to reduce long-running memory growth.
- [x] HttpOnly cookie auth is implemented for public session flow.
- [x] CSRF protection is implemented for unsafe cookie-auth requests.
- [x] CORS allows `X-CSRF-Token`.
- [x] Secure cookie settings are documented in `.env.public.example`.
- [x] Backend health endpoint exposes operational feature flags.
- [x] PostgreSQL URL guard prevents accidental production misconfiguration with an unsupported adapter.
- [x] Backup and health-check scripts exist for current local/public backend.
- [x] Deploy readiness gate verifies SQLite WAL/timeout, secure cookie template, PostgreSQL guard, rate-limit guard, restore/load scripts, and container config.
- [x] Backup restore drill script validates sanitized JSON and can restore SQLite recovery copies into a controlled target DB.
- [x] Local concurrent load smoke validates read/write behavior against SQLite WAL pilot mode.
- [x] PostgreSQL migration artifact and opt-in runtime adapter path exist behind `SAT_STUDIO_ENABLE_POSTGRES=true`.
- [x] Redis-backed distributed rate limiter exists behind `SAT_STUDIO_RATE_LIMIT_BACKEND=redis` and `SAT_STUDIO_REDIS_URL`.
- [x] JSONL access logging and admin-only `/api/public/ops/metrics` exist for production observability hooks.
- [ ] Managed observability is not provisioned here: hosted log sink, error tracking, metrics dashboard, alerting.

## Deployment And Public Launch

- [x] Public backend documentation exists.
- [x] Environment example covers cookie security and future PostgreSQL configuration.
- [x] Environment example pins `SAT_STUDIO_RATE_LIMIT_BACKEND=memory` and limiter bucket cap for pilot deployments.
- [x] Environment example includes Redis, PostgreSQL opt-in, JSONL logging, and metrics retention knobs.
- [x] Local public server is available at `http://127.0.0.1:8765/`.
- [x] Current student app route is `http://127.0.0.1:8765/dist/vite/vite-student.html`.
- [x] Release checklist strict mode passes locally.
- [ ] Production HTTPS domain deployment is not verified.
- [ ] Secure cookie behavior on real HTTPS domain is not verified.
- [ ] Production database, backup, monitoring, and rate-limit infrastructure are not verified.
- [ ] Public beta runbook is not complete: incident response, rollback, data export, privacy checklist, and admin operating guide.

## Recommended Execution Order From Here

1. [x] Admin Expert Gate Web UI
   - Direct content editing UI is available in Vite Admin.
   - Local version history and backend review ledger are available.
   - Review/publication workflow state is visible.
   - Acceptance: an expert can review, edit, save a version, submit a backend ledger entry, and export a patch without touching raw files.

2. [x] Teacher/Classroom V2
   - Separate teacher role from parent role.
   - Add backend classes, join codes, assignments, and evidence APIs.
   - Add student join-class flow.
   - Add class analytics by item, skill, wrong-rate, due status, and proof completion.
   - Acceptance: a teacher can create a class, assign work, and see actionable mastery evidence.

3. [ ] Production Cloud Hardening
   - [x] Add deploy readiness gate.
   - [x] Add restore drill and local load smoke.
   - [x] Add unsupported PostgreSQL/Redis guardrails.
   - [x] Implement PostgreSQL migration artifact and opt-in runtime adapter path.
   - [x] Add Redis-backed distributed rate limiter.
   - [x] Add structured JSONL logging, admin metrics endpoint, and domain verification gate.
   - [ ] Provision managed PostgreSQL/Redis/HTTPS/logging resources on the target host and verify against the real domain.
   - Acceptance: app code is ready for production infrastructure; hosted environment still must be provisioned and verified.

4. [ ] IRT And Item Analytics
   - Keep collecting item-level logs.
   - Compute p-value and discrimination when enough responses exist.
   - Flag low-discrimination or noisy questions.
   - Fit IRT only after enough live attempts.
   - Acceptance: score estimates and item routing are calibrated from real student data.

5. [ ] Final Bluebook/UX Polish
   - Tighten spacing, accessibility, section transitions, and exam ceremony.
   - Verify desktop and mobile screenshots.
   - Acceptance: the test experience feels polished enough for public demo and paid pilot.

## Immediate Next Target

The highest-leverage unfinished block is now **Hosted Production Provisioning**: create managed PostgreSQL, Redis, HTTPS domain, hosted log/metrics/error alerts, then run the domain verification gate against the real URL. Application-side production hardening is now implemented and covered by release gates.
