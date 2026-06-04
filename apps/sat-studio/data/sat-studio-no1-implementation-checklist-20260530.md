# SAT Studio No.1 Implementation Checklist

Generated: 2026-05-30

## Phase A: Bluebook Pro Mode

- [x] A1. Bluebook module cockpit: answered/skipped/flagged status, clear timer pressure, and module branch label.
- [x] A2. Embedded Desmos panel inside the exam surface, with external fallback link.
- [x] A3. Module review automatically routes Module 2 to Hard, Standard, or Support based on Module 1 accuracy and weak skill.
- [x] A4. Smoke tests verify timer, flag, highlight, eliminate, embedded Desmos, and module review branch.
- [x] A5. Future polish: closer pixel-level Bluebook spacing and section transition screens.

## Phase B: Habit Loop & Rewards

- [x] B1. Today dashboard produces one academic mission from due proof, weak skill, vocab, or Bluebook pacing.
- [x] B2. Completing a mission creates a learning/reward event.
- [x] B3. Streak and streak-freeze mechanics are represented in the student reward store.
- [x] B4. Parent dashboard can define practical rewards tied to academic milestones.

## Phase C: Teacher/Classroom V2

- [x] C1. Teacher role UI separated from Parent dashboard with a dedicated backend classroom cockpit in the parent/teacher shell.
- [x] C2. Backend APIs for classes, join code, assignments, and assignment evidence.
- [x] C3. Student join-class flow.
- [x] C4. Teacher class report with item-level wrong-rate and weak-skill summary.

## Phase D: Expert Gate Web UI

- [x] D1. Admin can edit prompt, choices, answer, explanation, metadata, trap type, and copyright notes in UI.
- [x] D2. Question version history is stored locally and can be submitted to the backend review ledger.
- [x] D3. SourceSignal -> AI draft -> Expert review -> Public package flow is visible and auditable in the Expert Gate tab.

## Phase E: Production Cloud

- [x] E1a. PostgreSQL scale-out guard detects `SAT_STUDIO_PUBLIC_DATABASE_URL`/`DATABASE_URL` and fails fast until the real adapter is enabled.
- [x] E1b. PostgreSQL migration artifact and opt-in runtime adapter path are implemented behind `SAT_STUDIO_ENABLE_POSTGRES=true`.
- [x] E2. Secure HTTP-only cookie auth and CSRF protection.
- [x] E3a. Backup policy, health check, deploy readiness gate, restore drill, and local load smoke are implemented for SQLite pilot deployment.
- [x] E3b. In-memory rate limiter has pruning and explicit backend guard so unsupported Redis config fails fast.
- [x] E3c. Redis-backed distributed rate limiter, JSONL access logging, admin metrics endpoint, and HTTPS domain verification gate are implemented.
- [ ] E3d. Managed cloud resources still need provisioning: PostgreSQL instance, Redis instance, HTTPS domain, hosted logs/metrics/error alerts.

## Phase F: IRT Calibration

- [ ] F1. Continue collecting attempt logs with item, answer, time, hint, mode, skill, and score band.
- [ ] F2. Compute p-value after 30+ attempts per item.
- [ ] F3. Compute discrimination after 100+ attempts per item.
- [ ] F4. Fit IRT only after enough real student data exists.
