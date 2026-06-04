# MiuPrep Implementation Audit Plan

Generated: 2026-06-04

Purpose: turn the architecture audit into a controlled implementation plan. This file is the working checklist for future fixes so changes are done in the right order, with proof, and without skipping hidden risks.

## 0. Decision Summary

The audit direction is useful, but the implementation must be staged.

- Do now: internal beta telemetry, event quality, content lazy-load/query service, sync hardening, quality gates.
- Do after evidence: repair-loop rerouting, SRS tuning, Mastery V2 shadow mode, empirical difficulty, lightweight Elo, AI grading validation.
- Defer until real need is proven: Graph DB, CRDT, IRT 3PL, AI consensus updating mastery, automatic self-healing graph edits, real-time battle room.

Core principle: beta data first, architecture expansion second.

## 0.1. Added Beta Evaluation Input

Additional source reviewed: `miuprep_beta_evaluation_report.md`, generated from a simulated internal beta run on 2026-06-04.

Useful signals from that report:

- Entry gates and diagnostic target validity pass on the simulated beta package.
- Recommendation sanity passes, but learning impact remains `watch`.
- Repeated repair loops appear around:
  - `math.quadratic_equation`
  - `math.solve_quadratic_by_factor`
  - `eng.reading_inference`
  - `eng.infer_implicit_meaning`
- Misconception recurrence appears around:
  - `mis.math.factor_vs_expand`
  - `mis.eng.inference_literal_only`
- Proposed improvements worth incorporating:
  - emergency rerouting when a learner is stuck in repair
  - SRS decay tuning by difficulty and recurrence
  - graph adjustment proposals from telemetry

Important constraint: simulated beta signals are not enough to automatically change graph edges, mastery policy, or production recommendations. They can define watch metrics and acceptance criteria only.

## 1. Non-Negotiable Guardrails

These rules apply to every phase.

- No major architecture swap without a failing metric or capacity limit proving the need.
- No Graph DB migration before a simpler content query service fails real query needs.
- No CRDT migration before append-only event sync has been implemented and audited.
- No IRT 3PL before enough real attempts exist to calibrate item parameters.
- No Writing/Speaking AI score may update mastery directly until grading reliability is validated.
- No simulated beta result may be treated as live learning proof.
- No self-healing graph edit may apply automatically; telemetry can only create a candidate until human/admin approval and real evidence thresholds pass.
- No beta scope expansion while content blockers, telemetry gaps, or recommendation sanity issues remain unresolved.
- Every implementation must include tests or generated reports that prove the acceptance criteria.
- Every phase must preserve current working behavior in Math 9, IELTS/CPE/CAE content, SAT Studio, portal, and desktop apps.

## 2. Audit Control Workflow

Use this workflow for each implementation batch.

1. Scope the batch
   - Write the target phase and exact files/packages likely affected.
   - List what is intentionally out of scope.
   - Identify rollback risk.

2. Baseline before edits
   - Run or inspect the current relevant audit/report.
   - Capture current counts: content readiness, learning events, blockers, warnings, test status.
   - Do not start a change if the baseline is unknown.

3. Implement narrowly
   - Prefer existing package patterns over new frameworks.
   - Keep source-of-truth boundaries clear: content, learning, db, ai, portal, app shells.
   - Avoid broad refactors unless required by the target phase.

4. Verify
   - Run package tests for every touched package.
   - Run content guards if content or adapters are touched.
   - Run beta export if telemetry, mastery, recommendation, or graph logic changes.
   - Run app build or browser QA for UI-facing changes.

5. Record proof
   - Update the implementation log only after verification.
   - Save generated audit outputs in `reports/`.
   - Include residual risk and next follow-up.

## 3. Phase A - Internal Beta Evidence

Goal: collect enough real learning evidence before changing the learning model or Knowledge Graph.

Current baseline to respect:

- Math 9 internal beta: 485 questions, 28 units.
- IELTS Reading/Listening internal beta: 110 learning-ready questions.
- Current beta package is smoke-ready, but seeded telemetry is not enough for wider rollout.
- Current graph adjustment backlog is watch-only.

Implementation checklist:

- Ensure every diagnostic, practice, review, mock, retry, and feedback action writes a `LearningEventRecord`.
- Add or verify fields in learning events:
  - `eventId`
  - `learnerId`
  - `programId`
  - `domainId`
  - `conceptIds`
  - `skillIds`
  - `itemId`
  - `mode`
  - `correct` or score payload
  - `timeSpentSeconds`
  - `source`
  - `schemaVersion`
- Separate real beta events from seeded/demo events in reports.
- Add daily/weekly beta summaries:
  - events per learner
  - diagnostic completion
  - practice completion
  - review completion
  - weak mastery areas
  - recurring misconceptions
  - stuck repair streaks by learner and skill
  - reroute candidates
  - recommendation quality
  - retention after SRS review
- Keep graph adjustment candidates in `watch` until live evidence passes threshold.
- Track the known simulated watch targets separately:
  - `math.quadratic_equation`
  - `math.solve_quadratic_by_factor`
  - `eng.reading_inference`
  - `eng.infer_implicit_meaning`
  - `mis.math.factor_vs_expand`
  - `mis.eng.inference_literal_only`

Acceptance criteria:

- Each beta learner has at least the configured minimum real events per cohort.
- Beta report clearly labels real vs seeded telemetry.
- Recommendation sanity has zero missing graph targets and zero out-of-program targets.
- Graph adjustments are accepted/rejected/deferred with evidence, not intuition.
- Stuck repair counts are visible and do not rely on reading raw event logs manually.
- Simulated watch targets are not auto-promoted to graph changes.

Verification commands/reports:

- `npm test -w @miuprep/beta`
- `npm test -w @miuprep/learning`
- `npm run export:beta-run -w @miuprep/beta`
- Review `reports/beta/internal-beta-run.md`

Exit gate:

- Internal beta can widen only when real event coverage, recommendation quality, and graph backlog review pass.

## 4. Phase B - Content Query And Lazy Loading

Goal: reduce client static JSON overhead without jumping directly to Graph DB.

Problem:

- Large banks such as SAT 9,305 items can be loaded too broadly.
- Future banks may grow to hundreds of thousands of items.
- Sending full banks to the client increases load time and scraping risk.

Implementation checklist:

- Build a content query layer before adopting GraphQL/Graph DB.
- Query inputs should support:
  - `programId`
  - `domainId`
  - `conceptIds`
  - `skillIds`
  - `difficulty`
  - `questionType`
  - `readiness`
  - `mode`
  - `limit`
  - `cursor`
- Return only the required item slice for diagnostic/practice/review.
- Add stable item summaries for list views and fetch full item detail only when needed.
- Keep adapters and quality gates as the content source of truth.
- Add cache by small scope, not whole bank.
- Add a scrape mitigation layer:
  - auth/session checks where applicable
  - rate limits if backend exists
  - request logging
  - no full-bank endpoint for student clients
  - signed/expiring access for protected media if needed

Do not implement yet:

- Neo4j
- Apache Age
- full GraphQL migration
- end-to-end encryption as a scrape solution

Acceptance criteria:

- Student practice flows do not require loading the full SAT bank.
- Existing content guards still pass.
- Query output is deterministic and paginated.
- Client can resume practice using item IDs without keeping the whole bank in memory.

Verification commands/reports:

- `npm test -w @miuprep/content`
- `npm run guard:sat -w @miuprep/content`
- `npm run guard:english -w @miuprep/content`
- `npm run sync:portal-quality -w @miuprep/content`
- Relevant app build or browser QA for changed clients.

Exit gate:

- Lazy loading is considered complete only when at least SAT and one English practice flow use scoped item retrieval.

## 5. Phase C - Sync Hardening With Append-Only Events

Goal: prevent data loss and overwrite between web LocalStorage, desktop SQLite, and future server sync.

Preferred model:

- Attempts and learning events are append-only facts.
- `StudentModel` is a derived snapshot, not the sync source of truth.
- Conflict resolution happens at event level.

Implementation checklist:

- Add or verify event metadata:
  - `eventId`
  - `idempotencyKey`
  - `learnerId`
  - `deviceId`
  - `occurredAt`
  - `receivedAt`
  - `source`
  - `schemaVersion`
  - `payloadHash`
- Make duplicate writes idempotent.
- Add a merge function that:
  - keeps both valid attempts if they are distinct
  - deduplicates exact repeats
  - flags suspicious conflicts
  - never silently overwrites newer or older attempt evidence
- Add sync audit report:
  - duplicate events
  - missing learner IDs
  - missing item IDs
  - invalid timestamps
  - cross-device conflicts
  - events excluded from mastery
- Keep CRDT out of scope unless mutable shared records become unavoidable.

Acceptance criteria:

- Re-importing the same event batch does not duplicate evidence.
- Offline events from two devices merge without losing attempts.
- Snapshot recomputation from merged events is deterministic.
- Conflicts are visible in reports, not hidden.

Verification commands/reports:

- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/db`
- Desktop `cargo check` if SQLite commands change.
- New sync audit report under `reports/` if implemented.

Exit gate:

- Move to server sync only after local and desktop event merge is proven.

## 6. Phase D - Mastery V2 Shadow Mode

Goal: improve mastery estimates without breaking the current recommendation engine.

Current baseline:

- `computeMastery` is a practical heuristic using attempts, accuracy, confidence, hard proof, and recent wrong penalty.
- This is acceptable for internal beta but too simple for long-term adaptive learning.

Implementation checklist:

- Keep current `computeMastery` as `Mastery V1` baseline.
- Add `Mastery V2` in shadow mode first.
- V2 should consider:
  - recency weighting
  - diagnostic/practice/review/mock mode weights
  - hard item proof
  - repeated misconception penalty
  - hint usage
  - time-spent anomalies
  - item empirical difficulty
  - evidence confidence
- Store or report V1 vs V2 deltas.
- Do not let V2 change UI recommendations until deltas are reviewed.
- Add explainability output:
  - why score changed
  - strongest evidence
  - weakest evidence
  - confidence level

Repair-loop rerouting checklist:

- Detect consecutive repair loops per learner and mastery node.
- Start with a conservative threshold: 5 consecutive failed/repair attempts on the same concept or skill.
- When threshold is reached, recommend one of these instead of repeating the same node:
  - easier prerequisite micro-diagnostic
  - lower-difficulty practice set
  - remediation lesson for the linked misconception
  - teacher/admin review if the loop persists
- Rerouting must be explainable:
  - stuck node
  - streak length
  - suspected prerequisite gap
  - selected reroute action
- First release must run in shadow mode or admin-visible recommendation mode before changing student-facing behavior.

SRS tuning checklist:

- Extend Error Notebook review scheduling with difficulty and recurrence signals.
- Reduce interval or ease faster for:
  - hard questions
  - repeated misconception categories
  - high-value prerequisite skills
  - inference-heavy English reading/listening tasks
  - complex Math 9 transformations or geometry tasks
- Keep simple recall items on the current stable schedule unless real retention data says otherwise.
- Report review interval changes so SRS tuning is auditable.

Acceptance criteria:

- V2 runs without changing existing learner outcomes unless explicitly enabled.
- V1/V2 differences are reported and reviewable.
- No Writing/Speaking feedback-only events are converted into mastery attempts.
- Recommendation quality does not regress.
- Repair-loop rerouting can identify stuck nodes without creating recommendation loops.
- SRS tuning never schedules invalid review dates and remains deterministic for the same input.

Verification commands/reports:

- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/beta`
- `npm run export:beta-run -w @miuprep/beta`
- Beta report includes stuck repair and reroute candidate sections when implemented.
- Error Notebook/SRS tests cover difficulty and recurrence tuning when implemented.

Exit gate:

- V2, rerouting, or SRS tuning can affect student-facing recommendations only after shadow reports show stable improvement over V1/current behavior.

## 7. Phase E - Empirical Difficulty And Lightweight Elo

Goal: start item calibration safely after real event volume is sufficient.

Prerequisites:

- Enough real attempts per item or per skill cluster.
- Stable event schema.
- Mastery V2 shadow report is in place.

Implementation checklist:

- Start with empirical item stats:
  - attempts
  - correct rate
  - average time
  - hint rate
  - review recurrence
  - discrimination proxy by learner band/mastery bucket
- Add lightweight Elo only as a secondary signal.
- Calibrate at cluster/skill level when per-item data is sparse.
- Keep teacher-authored difficulty as a prior, not overwritten blindly.
- Track calibration drift over time.

Implemented guardrails / still do not implement:

- Empirical item stats and lightweight Elo may run in shadow-only reports.
- Shadow reports must preserve teacher-authored difficulty as the prior.
- Shadow reports must keep `applied: false` and `highStakesPlacementEnabled: false`.

- IRT 3PL
- guessing parameter calibration
- high-stakes placement based only on Elo

Acceptance criteria:

- Item difficulty updates are explainable and reversible.
- Sparse items keep prior difficulty.
- Calibration does not destabilize diagnostic selection.

Verification commands/reports:

- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/content`
- `npm run export:beta-run -w @miuprep/beta`
- Calibration audit report under `reports/` or the beta readiness export.

Exit gate:

- Consider Rasch/1PL or 2PL only after enough real responses exist and empirical calibration is stable.

## 8. Phase F - AI Writing/Speaking Governance

Goal: improve productive-skill feedback while protecting mastery accuracy.

Implementation checklist:

- Keep Writing/Speaking as `feedback_only` by default.
- Require every AI grading result to store:
  - `attemptId`
  - `modelUsed`
  - `provider`
  - `rubricVersion`
  - `descriptorSource`
  - `confidence`
  - `criteria`
  - `evidence`
  - `createdAt`
- Build or expand golden sample evaluation:
  - human/expert score
  - AI score
  - deviation by criterion
  - deviation overall
  - pass/fail threshold
- Add consensus only for validation and review, not mastery update.
- If multiple models disagree beyond threshold, mark `needs_review`.
- AI score may affect mastery only after a future governance gate approves it.

Acceptance criteria:

- AI feedback can produce practice plans and remediation tasks.
- Mastery remains protected from unvalidated AI scoring.
- Reliability report exists before any mastery-policy change.

Verification commands/reports:

- `npm test -w @miuprep/ai`
- `npm test -w @miuprep/learning`
- AI reliability/golden sample report if implemented.

Exit gate:

- Productive skill mastery remains locked until AI reliability is proven against benchmark samples.

## 9. Phase G - Product And Gamification Controls

Goal: improve motivation without distorting learning behavior.

Implementation checklist:

- Keep rewards tied to learning-positive actions:
  - correcting mistakes
  - due review completion
  - diagnostic completion
  - consistent practice
- Avoid rewarding only raw correctness.
- Parent rewards should be approval-based, not smart-contract/tokenomics based.
- Add parent dashboard signals:
  - effort consistency
  - repair completion
  - mastery trend
  - retention trend
  - next recommended support
- Defer real-time battle rooms until:
  - item difficulty is calibrated
  - anti-cheat and fairness rules are clear
  - learning benefit is tested with smaller asynchronous challenges.

Acceptance criteria:

- Rewards do not encourage rushing, guessing, or avoiding hard questions.
- Parent view emphasizes learning progress over score pressure.
- No new gamification feature bypasses learning event logging.

Verification commands/reports:

- `npm run lint -w miuprep-portal`
- `npm run build -w miuprep-portal`
- `npm run test:vite -w sat-studio`
- Browser QA for changed student/parent flows.

Exit gate:

- Gamification changes must improve completion/retention metrics without increasing low-quality attempts.

## 10. Phase H - Future Graph Backend Evaluation

Goal: decide whether Graph DB is needed based on evidence.

Evaluate Graph DB only if at least two of these become true:

- Knowledge graph queries become too slow with simpler indexed storage.
- Cross-program prerequisite/remediation traversal becomes complex enough to justify graph-native queries.
- Admin content review needs deep multi-hop graph analysis.
- Recommendation engine needs runtime graph traversal that current package APIs cannot support.
- Content volume and graph relations outgrow static/package-based graph management.

Before Graph DB:

- Try indexed JSON/build artifact.
- Try relational tables.
- Try content query service.
- Try cached graph traversal in `@miuprep/knowledge`.

Acceptance criteria for a Graph DB decision:

- A benchmark shows current approach is insufficient.
- Migration plan preserves existing graph validator semantics.
- There is a rollback path.
- No client app depends directly on the database shape.

Self-healing graph guardrails:

- Telemetry may create graph adjustment candidates automatically.
- Telemetry must not apply graph changes automatically.
- A graph candidate needs all of these before approval:
  - real beta data, not simulated data
  - sufficient learner count for the affected scope
  - repeated evidence across more than one item
  - no content-quality blocker explaining the failure
  - admin/teacher review of the proposed edge change
  - before/after expectation documented
- Suggested starting threshold: more than 100 real learners in the affected scope, or a smaller explicitly approved expert cohort with manual review.
- Candidate actions can include:
  - increase remediation edge weight
  - add prerequisite edge
  - lower default difficulty for a node
  - add a remediation lesson requirement
  - flag content for review
- Automatic edge reversal is not allowed in early phases.

## 11. Required Regression Matrix

Use the narrowest set for small changes, but use the full matrix when touching shared contracts.

Shared packages:

- `npm test -w @miuprep/knowledge`
- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/content`
- `npm test -w @miuprep/db`
- `npm test -w @miuprep/ai`
- `npm test -w @miuprep/beta`

Content gates:

- `npm run guard:sat -w @miuprep/content`
- `npm run guard:english -w @miuprep/content`
- `npm run sync:portal-quality -w @miuprep/content`
- `npm run export:beta-run -w @miuprep/beta`

Apps:

- `npm run lint -w miuprep-portal`
- `npm run build -w miuprep-portal`
- `npm run lint -w miumath-app`
- `npm run build -w miumath-app`
- `npm run test:vite -w sat-studio`
- `npm run build -w @miuprep/desktop`
- `npm run build -w @miuprep/cpe-desktop`
- `npm run build`

Native desktop when touched:

- `cargo check` in `apps/ielts-desktop/src-tauri`
- `cargo check` in `apps/cpe-desktop/src-tauri`

Browser QA when UI changes:

- Portal admin dashboard
- Student overview/practice/tutor/rewards
- Parent overview
- Admin content review
- SAT practice bridge
- MiuMath diagnostic/practice/review
- No horizontal overflow on desktop/mobile
- No console errors in tested flow

## 12. Anti-Skip Checklist

Before marking a phase complete, answer all questions.

- What user-facing or learning outcome did this improve?
- What current behavior was preserved?
- What exact report/test proves it?
- Did any content counts change?
- Did any learning event schema change?
- Did any mastery/recommendation behavior change?
- Are Writing/Speaking still protected by `feedback_only`?
- Is there any seeded/demo data being mistaken for real beta data?
- Are simulated beta findings clearly separated from live evidence?
- If a learner is stuck in repair, is rerouting suggested instead of repeating the same loop?
- If SRS intervals changed, is the reason visible and deterministic?
- If graph candidates were generated, are they still pending human/admin approval?
- Does the change require new admin visibility?
- What is the rollback path?
- What is still intentionally deferred?

## 13. Current Recommended Order

1. Phase A: Internal Beta Evidence
2. Phase B: Content Query And Lazy Loading
3. Phase C: Sync Hardening With Append-Only Events
4. Phase D: Mastery V2 Shadow Mode, Repair Rerouting, SRS Tuning
5. Phase F: AI Writing/Speaking Governance
6. Phase E: Empirical Difficulty And Lightweight Elo
7. Phase G: Product And Gamification Controls
8. Phase H: Future Graph Backend Evaluation

Reason: evidence and data integrity must come before model sophistication.

## 14. Definition Of Done For The Whole Optimization Program

The optimization program is complete only when:

- Beta telemetry is real, segmented, and sufficient for decisions.
- Content is served by scoped queries for large banks.
- Event sync is idempotent and conflict-audited.
- Stuck repair loops are detected and rerouted with evidence.
- SRS tuning is difficulty-aware, recurrence-aware, and auditable.
- Mastery V2 has run in shadow mode and shown stable value.
- AI productive-skill grading has reliability reports and remains gated.
- Recommendation quality is measured and does not regress.
- Admin reports expose content, telemetry, graph, and sync risks.
- Graph self-healing remains candidate-based until human-approved real evidence thresholds pass.
- Deferred architecture decisions are documented with evidence thresholds.

## 15. Implementation Log

### 2026-06-04 Batch 1 - Phases A, B, C, D partial

Scope completed:

- Phase A: beta evidence separation, weekly review evidence labels, stuck repair reroute candidates, graph candidate guardrails.
- Phase B: generic content query service with scoped filters, deterministic cursor pagination, summary-only query output, detail-by-id lookup, small-scope cache.
- Phase C: learning event metadata hardening with `eventId`, `idempotencyKey`, `receivedAt`, `deviceId`, `payloadHash`, legacy normalization, and merge conflict reporting.
- Phase D partial: SRS tuning now uses difficulty, lapse/recurrence count, grade, deterministic interval reasoning, and preserves feedback-only productive skills.

Changed files:

- `packages/beta/src/index.ts`
- `packages/beta/src/export-beta-run.ts`
- `packages/beta/src/index.test.ts`
- `packages/content/src/content-query.ts`
- `packages/content/src/index.ts`
- `packages/content/src/standard.test.ts`
- `packages/learning/src/index.ts`
- `packages/learning/src/index.test.ts`
- `apps/sat-studio/src/domain/learning-events.ts`
- `apps/sat-studio/src/domain/learning-events.test.ts`
- `apps/miuprep-portal/src/data/contentQualitySnapshot.ts`
- `reports/beta/internal-beta-run.json`
- `reports/beta/internal-beta-run.md`
- `reports/beta/internal-beta-weekly-review.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed:

- `npm test -w @miuprep/beta`
- `npm test -w @miuprep/content`
- `npm run guard:sat -w @miuprep/content`
- `npm run guard:english -w @miuprep/content`
- `npm run sync:portal-quality -w @miuprep/content`
- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/db`
- `npm run build -w @miuprep/ai`
- `npm run export:beta-run -w @miuprep/beta`
- `npm run lint -w miuprep-portal`
- `npm run build -w miuprep-portal`
- `npm run build -w miumath-app`
- `npm run build -w @miuprep/desktop`
- `npm run build -w @miuprep/cpe-desktop`
- `npm run test:vite -w sat-studio`

Proof captured:

- `reports/beta/internal-beta-run.md` now shows `Live learning telemetry: 0`, `Seeded learning telemetry: 4`, `Synthetic learner-state events: 14`, and `Learning KPI source: synthetic`.
- Graph backlog entries now carry `evidenceSource` and `autoApply: false`.
- Weekly review now has explicit repair reroute rows and defers all synthetic reroutes.
- SAT query tests prove a 9,305-item bank can be queried as small deterministic pages without exposing prompts or answer keys in summaries.
- Learning tests prove old events are normalized with sync metadata and same-id payload conflicts are flagged.
- Learning tests prove SRS interval tuning shortens hard/recurrent items relative to easy retained items and records a readable reason.
- SAT shared event bridge now maps into the shared learning event builder and preserves sync metadata.

Residual risk:

- Student-facing apps still need to adopt `createContentQueryService` or a backend endpoint before Phase B is fully complete at product-flow level.
- Current beta export is still a smoke package with seeded/synthetic evidence only; it must not approve wider rollout.
- Event merge conflict reporting exists in core learning, but app/admin UI does not yet surface conflicts.
- Mastery V2 shadow mode and AI grading governance are started in batch 2; empirical difficulty, lightweight Elo, and gamification controls remain intentionally deferred until real evidence exists.

### 2026-06-04 Batch 2 - Phase C audit, Phase D shadow, Phase F governance

Scope completed:

- Phase C: added `buildLearningEventSyncAuditReport` so duplicate idempotency keys, missing learner/entity IDs, invalid timestamps, feedback-only events, and merge conflicts can be surfaced as a report instead of hidden in merge internals.
- Phase D: added `computeMasteryV2ShadowReport` as a shadow-only comparison layer. It reports V1 vs V2 score/status deltas, confidence level, strongest/weakest evidence, protected feedback-only event count, and explicitly keeps `studentFacingEnabled: false` with `recommendationPolicy: v1_only`.
- Phase D beta visibility: beta readiness report now includes `masteryShadowAudit` summary and the markdown export shows a `Mastery V2 Shadow` section.
- Phase F: added productive-skill governance reporting via `buildProductiveSkillGovernanceReport`, including required provenance checks, golden sample deviation thresholds, consensus as validation-only, and mastery locked as `feedback_only_locked`.
- Phase F event provenance: Writing/Speaking tutor events now persist direct payload fields for `attemptId`, `modelUsed`, `provider`, `rubricVersion`, `descriptorSource`, `evidence`, `createdAt`, and `confidence`.

Changed files:

- `packages/learning/src/index.ts`
- `packages/learning/src/index.test.ts`
- `packages/beta/src/index.ts`
- `packages/beta/src/export-beta-run.ts`
- `packages/beta/src/index.test.ts`
- `packages/ai/src/tutor.ts`
- `packages/ai/src/tutor.test.ts`
- `packages/ai/src/index.ts`
- `reports/beta/internal-beta-run.json`
- `reports/beta/internal-beta-run.md`
- `reports/beta/internal-beta-weekly-review.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed:

- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/ai`
- `npm test -w @miuprep/beta`
- `npm run export:beta-run -w @miuprep/beta`

Proof captured:

- Learning tests prove the sync audit report marks duplicate idempotency keys as `watch`, and blocks conflict/missing metadata/invalid timestamp cases.
- `reports/beta/internal-beta-run.md` now has `Mastery V2 Shadow` with status `watch`, evidence source `synthetic`, 4 comparison rows, 0 changed status rows, largest absolute delta 17, and recommendation policy `v1_only`.
- Learning tests prove Mastery V2 does not turn feedback-only Writing into mastery rows and counts protected feedback-only events.
- AI tests prove governance reports pass clean golden samples, block missing provenance/excessive deviation, and keep productive-skill mastery ineligible.
- AI tests prove Writing/Speaking tutor events persist direct provider/model/evidence metadata while still not changing mastery.

Residual risk:

- Mastery V2 is now observable but not validated against live learners; keep it shadow-only until deltas are reviewed on real beta data.
- AI governance report exists, but a broad benchmark set with human/expert scores still needs to be curated before productive-skill mastery can be considered.
- Empirical difficulty, lightweight Elo, and gamification changes were deferred in this batch because the current beta export was still synthetic/seeded; Batch 3 adds shadow/audit-only controls.

### 2026-06-04 Batch 3 - Phase B app adoption, Phase E shadow, Phase G reward controls

Scope completed:

- Phase B: SAT and English learning selectors now call the shared scoped content query layer before returning detail items, so product flows use the same program/mode/skill/difficulty/exclusion filters as the generic query service.
- Phase B SAT guardrail: unscoped SAT diagnostics query both `english_core` and `mathematics` before balanced selection, preventing domain skew from catalog ordering.
- Phase E: added `buildEmpiricalDifficultyShadowReport` with attempts, correct rate, average time, hint rate, review recurrence, discrimination proxy, empirical difficulty, lightweight Elo delta, sparse-item handling, and `applied: false`.
- Phase E beta visibility: beta readiness/export now includes `Empirical Difficulty / Elo Shadow`, with shadow-only policy, no high-stakes placement, and synthetic evidence labeled `watch`.
- Phase G: added reward behavior audit for attendance-only rewards, raw-correctness achievement rewards, learning-positive criteria, and parent/admin claim-flow evidence.

Changed files:

- `packages/content/src/sat-content.ts`
- `packages/content/src/english-learning.ts`
- `packages/learning/src/index.ts`
- `packages/learning/src/index.test.ts`
- `packages/beta/src/index.ts`
- `packages/beta/src/export-beta-run.ts`
- `packages/beta/src/index.test.ts`
- `apps/sat-studio/src/domain/rewards.ts`
- `apps/sat-studio/src/domain/rewards.test.ts`
- `reports/beta/internal-beta-run.json`
- `reports/beta/internal-beta-run.md`
- `reports/beta/internal-beta-weekly-review.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm test -w @miuprep/content`
- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/beta`
- `npm run test:vite -w sat-studio`
- `npm run export:beta-run -w @miuprep/beta`

Verification passed, round 2:

- `npm test -w @miuprep/content`
- `npm test -w @miuprep/learning`
- `npm test -w @miuprep/beta`
- `npm run test:vite -w sat-studio`
- `npm run export:beta-run -w @miuprep/beta`
- `npm run lint -w miuprep-portal`
- `npm run build -w miuprep-portal`

Proof captured:

- Content tests compile both SAT and English selector adoption through the shared query service.
- Learning tests prove empirical difficulty keeps sparse items on prior difficulty, emits drift candidates, preserves `shadow_only_prior_preserved`, disables high-stakes placement, and never applies updates.
- Beta export shows `Empirical difficulty shadow status: watch` and keeps recommendation/calibration behavior observational.
- SAT Studio rewards tests prove the audit catches `hard-winner` as raw-correctness-only, flags attendance-point rewards as `watch`, confirms claim flow parent/admin approval evidence, and blocks orphan reward programs without fulfillment ownership.

Residual risk:

- Empirical difficulty remains synthetic/seeded in beta reports; keep it shadow-only until repeated real attempts per item or skill cluster exist.
- Reward audit is now a domain guard, not a UI redesign; `hard-winner` and attendance-only badges are intentionally flagged for later product tuning rather than silently changed.

### 2026-06-04 Batch 4 - Phase H graph backend decision report

Scope completed:

- Phase H: added `buildGraphBackendEvaluationReport` in `@miuprep/knowledge` so Graph DB decisions are based on validation, graph size, prerequisite traversal benchmark, cross-program complexity, and explicit runtime/admin requirements.
- Phase H guardrails: report requires at least two Graph DB criteria before evaluation is eligible, keeps `migrationAllowed: false`, requires rollback planning when eligible, and keeps `clientDirectDbAccessAllowed: false`.
- Phase H artifacts: added `npm run export:graph-evaluation -w @miuprep/knowledge`, writing JSON/Markdown reports under `reports/knowledge`.
- Content snapshot cleanup: portal content coverage now counts Writing/Speaking feedback-only samples separately from mastery-ready questions, matching the productive-skill governance gate.

Changed files:

- `packages/knowledge/src/index.ts`
- `packages/knowledge/src/index.test.ts`
- `packages/knowledge/src/export-graph-backend-evaluation.ts`
- `packages/knowledge/package.json`
- `packages/content/src/sync-portal-content-quality-snapshot.ts`
- `apps/miuprep-portal/src/data/contentQualitySnapshot.ts`
- `reports/knowledge/graph-backend-evaluation.json`
- `reports/knowledge/graph-backend-evaluation.md`
- `reports/content-quality/cae-deep-audit/cae-deep-audit.json`
- `reports/content-quality/cae-deep-audit/cae-deep-audit.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm test -w @miuprep/knowledge`
- `npm run export:graph-evaluation -w @miuprep/knowledge`
- `npm test -w @miuprep/content`
- `npm run audit:cae-deep -w @miuprep/content`
- `npm run sync:portal-quality -w @miuprep/content`
- `npm run guard:english -w @miuprep/content`
- `npm run lint -w miuprep-portal`
- `npm run build -w miuprep-portal`

Verification passed, round 2:

- `npm test -w @miuprep/knowledge`
- `npm run export:graph-evaluation -w @miuprep/knowledge`
- `npm test -w @miuprep/content`
- `npm run audit:cae-deep -w @miuprep/content`
- `npm run sync:portal-quality -w @miuprep/content`
- `npm run guard:english -w @miuprep/content`
- `npm run lint -w miuprep-portal`
- `npm run build -w miuprep-portal`

Proof captured:

- Graph backend evaluation currently reports `status: pass`, `recommendation: keep_indexed_package_graph`, `graphDbCriteriaMet: 0`, `graphDbEvaluationEligible: false`, `migrationAllowed: false`, and `clientDirectDbAccessAllowed: false`.
- Current seed graph size is 237 nodes and 133 edges; benchmark runs 46 prerequisite traversal queries with max query time 1ms, average 0.04ms, max closure size 2, and max prerequisite depth 2.
- CAE deep audit now covers 38 tests and 3,865 questions with 0 blockers and 0 warnings after feedback-only Writing/Speaking samples are included.

Residual risk:

- The benchmark is a local package-level traversal benchmark, not production traffic. Re-run this report after real beta graph workload and admin review queries are collected.
- Graph DB remains intentionally deferred; this batch proves current conditions do not justify migration.

### 2026-06-04 Batch 5 - Admin visibility for architecture and sync gates

Scope completed:

- Admin tracker now exposes the Graph backend evaluation gate directly in the Analytics workspace, including recommendation, criteria count, migration lock, rollback requirement, and per-trigger evidence.
- Admin tracker now exposes the Learning Event Sync audit gate directly in the Analytics workspace, including duplicate idempotency keys, merge conflicts, missing learner/entity IDs, invalid timestamps, and feedback-only event counts.
- The tracker reuses a memoized seed graph for beta readiness and backend evaluation, avoiding duplicate graph construction inside the component render path.

Changed files:

- `apps/miuprep-portal/src/components/BetaImplementationTracker.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm run lint -w miuprep-portal`
- `npm test -w @miuprep/knowledge`
- `npm test -w @miuprep/learning`
- `npm run build -w miuprep-portal`

Verification passed, round 2:

- `npm run lint -w miuprep-portal`
- `npm test -w @miuprep/knowledge`
- `npm test -w @miuprep/learning`
- `npm run build -w miuprep-portal`

Browser QA:

- Started the portal at `http://127.0.0.1:5178`, logged in with the seeded admin account, opened `Analytics Quality`, and confirmed `Architecture and sync gates`, `Graph backend decision`, `Learning event sync`, `Graph backend triggers`, and `Sync import risk` render in the implementation tracker.
- Browser console error log was empty during the check.
- Dev server was stopped after QA; port `5178` returned stopped.

Proof captured:

- Admin Analytics now surfaces previously backend/report-only gates, so graph migration and event-sync risks are visible before beta operation rather than buried in package tests or generated reports.
- Current Graph backend gate remains locked for migration and reports criteria count instead of implying approval.
- Current Learning Event Sync gate reports raw sync risk counters and will move to `blocked` when core sync audit detects conflicts, missing IDs, or invalid timestamps.

Residual risk:

- The admin panel is a visibility layer; it does not yet provide one-click repair actions for sync conflicts or graph trigger investigation.
- Screenshot capture in the in-app browser timed out once, so visual QA used DOM presence, layout bounding data, and console-log checks instead of a retained screenshot artifact.

### 2026-06-04 Batch 6 - Admin-visible stuck repair reroute queue

Scope completed:

- Admin Intervention Queue now consumes `buildRepairRerouteCandidates` from `@miuprep/beta` and exposes stuck-repair reroutes as an admin-visible shadow review panel.
- Queue metrics now include reroute candidate count, and urgent count includes live teacher-review/high-streak reroutes if future live evidence produces them.
- Each reroute card shows learner ID, target node, evidence source, selected reroute action, evidence count, wrong attempts, consecutive wrong streak, score, suspected prerequisites, and misconceptions.
- Reroute actions remain admin-only and do not change student-facing recommendation or routing behavior.

Changed files:

- `apps/miuprep-portal/src/components/AdminInterventionQueue.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm run lint -w miuprep-portal`
- `npm test -w @miuprep/beta`
- `npm run build -w miuprep-portal`

Verification passed, round 2:

- `npm run lint -w miuprep-portal`
- `npm test -w @miuprep/beta`
- `npm run build -w miuprep-portal`

Browser QA:

- Started dev servers on `http://127.0.0.1:5179` and `http://127.0.0.1:5178`; both returned HTTP 200 and were stopped after the attempt.
- In-app browser interaction for login/typing hit a runtime virtual-clipboard limitation, and subsequent navigation attempts timed out despite the local server responding. Browser QA is therefore not counted as passed for this batch.

Proof captured:

- Portal lint/build verifies the admin queue compiles with the beta reroute API and the new JSX panel.
- Beta package tests continue to prove reroute candidates are generated from stuck repair evidence, preserve `evidenceSource`, and stay watch-only for synthetic evidence.
- The panel explicitly labels the evidence source so synthetic portal snapshots are not confused with live beta proof.

Residual risk:

- Browser visual QA for this specific panel still needs a clean browser session or a stable in-app browser runtime.
- Current portal-generated reroutes are based on portal snapshots and are labelled synthetic; live event-derived student models are still needed before treating reroutes as live beta evidence.

### 2026-06-04 Batch 7 - Productive skill governance report artifact

Scope completed:

- Added a deterministic `@miuprep/ai` exporter for Writing/Speaking productive-skill governance evidence.
- Exporter writes JSON and Markdown artifacts under `reports/ai`, using seeded golden samples with expert scores, provenance, rubric versions, descriptor sources, confidence, criteria, and evidence.
- Report keeps `masteryPolicy: feedback_only_locked`, `masteryEligible: false`, and `consensusPolicy: validation_only`, even when seeded governance samples pass.
- Added `npm run export:productive-governance -w @miuprep/ai`.

Changed files:

- `packages/ai/package.json`
- `packages/ai/src/export-productive-skill-governance.ts`
- `reports/ai/productive-skill-governance.json`
- `reports/ai/productive-skill-governance.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm test -w @miuprep/ai`
- `npm run export:productive-governance -w @miuprep/ai`

Verification passed, round 2:

- `npm test -w @miuprep/ai`
- `npm run export:productive-governance -w @miuprep/ai`

Proof captured:

- `reports/ai/productive-skill-governance.md` reports status `pass`, 2 samples, 2 passed samples, 0 watch, 0 blocked, average overall deviation 0, max overall deviation 0.
- The same report explicitly states mastery remains ineligible and Writing/Speaking scores are not approved for mastery updates.
- AI tests still prove missing provenance or excessive deviation blocks governance, and tutor feedback events remain feedback-only.

Residual risk:

- This is a seeded repeatable governance artifact, not a broad expert benchmark. A larger human-scored sample set is still required before changing productive-skill mastery policy.

### 2026-06-04 Batch 8 - Event-derived StudentModel import guard

Scope completed:

- Added `buildStudentModelFromLearningEvents` in `@miuprep/learning` to reconstruct a scoped `StudentModel` from normalized append-only learning events.
- Complete attempt events now become `AttemptRecord`s while incomplete attempt events remain in the event log and are surfaced through `skippedEventIds`.
- Feedback-only Writing/Speaking events are counted and preserved in `learningEvents`, but they do not create attempts or mastery rows.
- Attempt learning events now persist the source `mode` in payload so future event-derived imports do not lose practice/review/diagnostic context.

Changed files:

- `packages/learning/src/index.ts`
- `packages/learning/src/index.test.ts`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Verification passed, round 2:

- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Proof captured:

- The new test reconstructs a live learner model from mixed event input: one valid attempt, one protected feedback-only Writing event, one incomplete attempt, and one other-learner attempt.
- The report returns 1 accepted attempt, 1 skipped event, 1 feedback-only event, and excludes the other learner.
- Mastery is computed from the tracked math attempt, while `eng.academic_writing` remains absent from mastery despite the feedback-only event being preserved in the log.

Residual risk:

- This batch provides the core importer only. Portal/admin reroute panels still need to consume live stored learning events instead of synthetic snapshots before reroutes can be treated as live beta evidence.

### 2026-06-04 Batch 9 - Live-first admin reroute source

Scope completed:

- Admin Intervention Queue now builds beta reroute learners from stored learning events first, using `buildStudentModelFromLearningEvents`.
- Learner event matching accepts both `student.id` and `student.username`, then canonicalizes the event learner ID before importing the live model.
- Reroute candidates use `stateKind: "live"` only when the event-derived model has at least one accepted attempt.
- Synthetic learner snapshots remain the fallback when stored events are absent or contain only non-attempt/incomplete evidence.

Changed files:

- `apps/miuprep-portal/src/components/AdminInterventionQueue.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Proof captured:

- Portal lint/build prove the admin queue compiles against the new learning importer and the beta reroute API.
- The reroute queue no longer forces all learners through synthetic `buildLearnerSnapshot` when live attempt events exist.
- Evidence labeling remains conservative: live status requires accepted attempt evidence; otherwise the existing synthetic fallback stays labelled synthetic.

Residual risk:

- Browser visual QA was not repeated for this small data-source change because the previous in-app browser session hit a runtime clipboard/navigation limitation. A fresh browser session should still be used before product sign-off.
- Live reroute usefulness still depends on student flows writing enough diagnostic/practice/review attempt events, not just daily-plan completion events.

### 2026-06-04 Batch 10 - Math 6 content display guard

Scope completed:

- Added Math 6 geometry SVG generation for text-described geometry prompts and flags for prompts that still need original images.
- Added a Math 6 content guard report that combines importer issues, standard adapter validation, formula/OLE risk, image dependency risk, and legacy font/encoding risk.
- Added `guard:math6`, `export:audit:math6`, and `audit:math6-display` commands.
- Updated Math 6 import normalization to remove control characters from prompts while preserving report evidence for Word/OLE formula loss.
- Generated Math 6 content/display audit artifacts under `reports/content-quality`.

Changed files:

- `MIUPREP_IMPLEMENTATION_PLAN.md`
- `packages/content/package.json`
- `packages/content/src/index.ts`
- `packages/content/src/math6-import.ts`
- `packages/content/src/standard.test.ts`
- `packages/content/src/guard-math6-content.ts`
- `packages/content/src/math6-content-guard-report.ts`
- `packages/content/src/math6-geometry-figures.ts`
- `reports/content-quality/math6-content-audit.md`
- `reports/content-quality/math6-content-guard.json`
- `reports/content-quality/math6-content-issues.csv`
- `reports/content-quality/math6-display-audit.json`
- `reports/content-quality/math6-display-audit.md`
- `reports/content-quality/math6-display-ready-preview.json`
- `reports/content-quality/math6-question-bank-audit.md`
- `reports/content-quality/math6-question-bank-preview.json`
- `scripts/audit-math6-display.js`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd test -w @miuprep/content`
- `npm.cmd run guard:math6 -w @miuprep/content`
- `npm.cmd run export:audit:math6 -w @miuprep/content`
- `npm.cmd run audit:math6-display -w @miuprep/content`

Verification passed, round 2:

- `npm.cmd test -w @miuprep/content`
- `npm.cmd run guard:math6 -w @miuprep/content -- --quiet`
- `npm.cmd run export:audit:math6 -w @miuprep/content`
- `npm.cmd run audit:math6-display -w @miuprep/content`

Proof captured:

- Superseded by Batch 21: current Math 6 adapter converts 1,549 items with `adapter.pass: true`.
- Superseded by Batch 21: current display audit reports 926/1,549 items ready for display, 539 generated SVG geometry figures, 0 prompt control/replacement characters, 593 formula-review blockers, 2 original-image blockers, and 44 text-encoding blockers.
- Content guard reports 558 blockers and 20 warnings while preserving the pass/fail distinction: adapter errors fail the guard, display blockers remain visible triage items.

Residual risk:

- Math 6 is not fully display-ready. The 593 Word/OLE formula-review blockers require recovering equations from original files or a better Word formula extraction path.
- The 44 legacy font/encoding blockers need source-specific Vietnamese/font conversion review before student-facing release.
- The 2 original-image blockers still need original diagrams captured or manually recreated.

### 2026-06-04 Batch 11 - Student live learning event capture

Scope completed:

- Student SAT practice answers now write `practice_attempt` learning events for both correct and incorrect answers.
- Error Notebook legacy and V2 retries now write `review_attempt` learning events for both correct and incorrect retries, including stage, retry status, error category, misconception IDs, and fallback concept/skill IDs.
- Today Sprint step completion now writes `daily_step_completed` learning events per diagnostic/lesson/guided/independent/review step, while the existing full-day completion event remains unchanged.
- Portal event saves refresh the in-memory learning event list so student overview/admin analytics/reroute panels can consume the latest local events.

Changed files:

- `apps/miuprep-portal/src/App.tsx`
- `apps/miuprep-portal/src/components/StudentTodaySprint.tsx`
- `apps/miuprep-portal/src/lib/studentProgress.ts`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Proof captured:

- Portal lint/build prove the student UI compiles with the new event builders and callback wiring.
- Learning tests still pass against the event-derived importer, so the new `practice_attempt` and `review_attempt` shape remains compatible with `buildStudentModelFromLearningEvents`.
- Beta tests still pass against reroute/readiness logic, so student live attempts can feed the existing admin-visible repair queue without changing student-facing recommendation policy.

Residual risk:

- Daily step completion events are workflow evidence, not scored mastery attempts; only SAT answers and Error Notebook retries are imported as tracked attempts.
- Other non-SAT course/practice surfaces still need real question-answer flows before they can emit tracked attempts.
- Browser visual QA was not run for this batch because the changes are data-capture wiring with no intended layout change; use a fresh browser session before product sign-off.

### 2026-06-04 Batch 12 - Live-first student overview model

Scope completed:

- Student overview now uses stored learning events first when valid tracked attempts exist, via `buildStudentModelFromLearningEvents`.
- Dashboard falls back to the existing synthetic learner snapshot when no valid attempt events exist, preserving current empty-state behavior.
- Dashboard now labels whether it is showing `Live events` or `Synthetic preview`.
- SAT practice event metadata now maps to graph-compatible `math.*` and `eng.*` concept/skill IDs instead of ad-hoc `sat.*` IDs, so mastery summaries, learning path, and reroute analysis can connect to the seed graph.

Changed files:

- `apps/miuprep-portal/src/App.tsx`
- `apps/miuprep-portal/src/components/UnifiedLearnerDashboard.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Proof captured:

- Portal lint/build prove the student overview compiles with live event import and evidence-source labeling.
- Learning tests continue to prove event-derived student model reconstruction is deterministic and protects feedback-only events.
- Beta tests continue to prove live event evidence can feed readiness/reroute logic without enabling student-facing Mastery V2 or graph auto-changes.

Residual risk:

- Student overview is live-first only for flows that have valid attempt events. Non-SAT practice/course surfaces still need tracked answer submission before they affect live mastery.
- Browser visual QA was not run for this small overview data-source change; run a fresh browser session before release sign-off.

### 2026-06-04 Batch 13 - Parent live evidence summaries

Scope completed:

- Parent role now loads stored learning events from the shared local event store.
- Parent Action Summary now builds each child signal from live learning events first, falling back to the existing synthetic snapshot when a child has no valid attempts.
- Parent Learning Overview now uses the same live-first learner snapshot for mastery, evidence count, weakest focus, and next action.

Changed files:

- `apps/miuprep-portal/src/App.tsx`
- `apps/miuprep-portal/src/components/ParentActionSummary.tsx`
- `apps/miuprep-portal/src/components/ParentLearningOverview.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Browser QA:

- Started portal dev server at `http://127.0.0.1:5181`; the in-app Browser loaded the unauthenticated portal successfully with title `MiuPrep Portal - Hệ Sinh Thế Học Tập Thích Ứng`.
- Browser console error log was empty on initial load.
- Authenticated login QA was not counted as passed because the in-app Browser hit the same virtual-clipboard input limitation while filling the login form.

Proof captured:

- Portal lint/build prove parent views compile with live event inputs and shared learner snapshot logic.
- Learning and beta tests confirm the event-derived importer/reroute readiness logic remains stable after parent surfaces started consuming live event evidence.

Residual risk:

- Parent live evidence depends on linked child accounts sharing the same local event store in this portal prototype. Server-backed multi-account sync remains a later Phase C/product integration step.
- Authenticated browser visual QA for student/parent/admin surfaces still needs a clean browser session or a runtime without the current input limitation.

### 2026-06-04 Batch 14 - Live-first lesson template panels

Scope completed:

- Math lesson template recommendations now build their learner snapshot from live learning events first.
- English Core lesson template recommendations now use the same live-first learner snapshot path.
- Both course panels preserve the existing synthetic fallback for accounts with no valid tracked attempts.
- App wiring now passes the refreshed student learning event list into the Math and English lesson template panels.

Changed files:

- `apps/miuprep-portal/src/App.tsx`
- `apps/miuprep-portal/src/components/MathLessonTemplatePanel.tsx`
- `apps/miuprep-portal/src/components/EnglishCoreLessonTemplatePanel.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Proof captured:

- Portal lint/build prove both recommendation panels compile after switching from synthetic snapshots to live event-derived snapshots.
- Learning and beta tests confirm the importer and reroute/readiness model remain stable while lesson panels consume the same evidence path as student and parent summaries.

Residual risk:

- Lesson panels are live-first for recommendation context only. Non-SAT course surfaces still need tracked answer submission events before they can influence mastery through real attempts.
- Authenticated browser visual QA remains outstanding because the in-app Browser login form still hits the virtual-clipboard input limitation.

### 2026-06-04 Batch 15 - Live-first Today Sprint plan

Scope completed:

- Today Sprint now builds its mastery, weakest-focus, recommendation, and next-step context from live learning events first.
- The existing synthetic learner snapshot remains the fallback when the student has no valid tracked attempts.
- Daily step completion still merges local completion state with stored `daily_step_completed` events, so this batch only changes the evidence source behind the plan recommendation.

Changed files:

- `apps/miuprep-portal/src/components/StudentTodaySprint.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Proof captured:

- Portal lint/build prove Today Sprint compiles after switching to the shared live-first snapshot helper.
- Learning tests prove live event-derived state reconstruction still accepts the event shapes emitted by portal flows.
- Beta tests prove reroute/readiness logic remains stable after Today Sprint consumes the same live evidence model as the dashboard, parent views, and lesson panels.

Residual risk:

- Today Sprint can only reflect live mastery for flows that emit valid scored attempts. Non-SAT course/practice screens still need answer-submission event capture before they become true mastery sources.
- Authenticated browser visual QA remains outstanding because the in-app Browser login form still hits the virtual-clipboard input limitation.

### 2026-06-04 Batch 16 - Admin and beta live learner evidence

Scope completed:

- Admin Intervention Queue teacher-facing learner interventions now build mastery, focus, score, reason, and action from live learning events first.
- Beta Implementation Tracker now builds learner state from live learning events first and passes `stateKind` as `live` or `synthetic` according to the snapshot evidence source.
- The remaining direct synthetic snapshot call in Admin Intervention Queue is limited to the explicit fallback branch inside beta reroute learner construction, where `stateKind: 'synthetic'` is still required for beta evidence accounting.

Changed files:

- `apps/miuprep-portal/src/components/AdminInterventionQueue.tsx`
- `apps/miuprep-portal/src/components/BetaImplementationTracker.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Proof captured:

- Portal lint/build prove admin and beta tracker surfaces compile after switching to live-first learner snapshots.
- Learning tests prove event-derived student model reconstruction remains stable for portal learning events.
- Beta tests prove readiness, KPI, graph-candidate, and repair-reroute rules still preserve live versus synthetic evidence semantics.

Residual risk:

- Admin/beta live state still depends on available scored attempt events. Workflow-only events remain telemetry and do not become mastery attempts.
- Authenticated browser visual QA remains outstanding because the in-app Browser login form still hits the virtual-clipboard input limitation.

### 2026-06-04 Batch 17 - Learner snapshot runtime QA fix

Scope completed:

- Fixed a runtime crash in the shared learner snapshot fallback by creating the seed Knowledge Graph inside `buildLearnerSnapshot`.
- Adjusted `buildLearnerSnapshotFromLiveEvents` so synthetic fallback is built only when no valid live attempts are available.
- Authenticated Playwright QA now verifies student, parent, and admin live-evidence surfaces without relying on the in-app Browser login form.

Changed files:

- `apps/miuprep-portal/src/components/UnifiedLearnerDashboard.tsx`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`

Authenticated browser QA:

- Started portal dev server at `http://127.0.0.1:5182`.
- Seeded three authenticated QA users and four live learning events in browser localStorage through Playwright.
- Verified student Overview: `Daily Learning Loop V2` and `Live events`.
- Verified student Courses: `LessonTemplate core` and `English Core`.
- Verified parent view: `Parent Next Action` and `Parent Learning Overview`.
- Verified admin Analytics: `Intervention Queue`, `Teacher queue`, `Beta Readiness`, and `Learning event capture`.
- Verified no page/console errors and no horizontal overflow on student, parent, or admin views.
- Stopped the dev server after QA.

Proof captured:

- Playwright reported `ok: true`, 10 passed surface checks, 4 seeded learning events, 0 errors.
- The browser QA found and then verified the fix for the `graph is not defined` runtime error that lint/build did not catch.

Residual risk:

- The only open Phase 11 item remains Knowledge Graph update from real beta data. It is intentionally not implemented until real beta evidence is collected and reviewed.

### 2026-06-04 Batch 18 - Practical regression and SAT scope build fix

Scope completed:

- Re-ran the audit verification as real commands and browser QA instead of document-only comparison.
- Found a root build failure in `packages/content/src/sat-content.ts`: `matchesSatScope` was declared but unused under the full workspace build.
- Wired SAT diagnostic selection through `matchesSatScope`, so section/domain scope is enforced before balanced diagnostic item selection and fallback fill.
- Re-ran authenticated browser QA on the live portal dev server at `http://127.0.0.1:5181`.
- Corrected the QA seed shape to match the production learning event schema: scored attempt fields live in `payload`, while event metadata remains top-level.

Changed files:

- `packages/content/src/sat-content.ts`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`
- `npm.cmd test -w @miuprep/content`
- `npm.cmd run guard:english -w @miuprep/content`
- `npm.cmd run guard:sat -w @miuprep/content`
- `npm.cmd run export:beta-run -w @miuprep/beta`
- `npm.cmd run guard:math6 -w @miuprep/content -- --quiet`

Verification passed, round 2:

- `npm.cmd test -w @miuprep/content`
- `npm.cmd run guard:sat -w @miuprep/content`
- `npm.cmd run build -w @miuprep/content`
- `npm.cmd run build`

Authenticated browser QA:

- Started portal dev server at `http://127.0.0.1:5181`.
- Seeded admin, parent, student, peer accounts and four valid live learning events in browser localStorage through Playwright.
- Verified student Overview: `Daily Learning Loop V2` and `Live events`.
- Verified student Courses: `LessonTemplate core` and `English Core`.
- Verified parent view: `PARENT NEXT ACTION` and `PARENT LEARNING OVERVIEW`.
- Verified admin Analytics: `Intervention Queue`, `Teacher queue`, `Beta Readiness`, and `Learning event capture`.
- Verified no page errors, no console errors, and no horizontal overflow.

Proof captured:

- Full workspace build initially failed on the unused SAT scope helper; after the fix, `npm.cmd run build` passed across all workspaces.
- Playwright reported `ok: true`, 10 passed authenticated surface checks, 4 seeded learning events, 0 errors, 0 console errors, and no overflow at 1440px.
- The browser QA also proved the learner dashboard consumes live learning events only when the event payload has valid attempt evidence.

Residual risk:

- Knowledge Graph update from real beta data remains intentionally blocked until real beta evidence is collected and reviewed.
- Math 6 display/content recovery still has dirty worktree artifacts and should be handled in a separate content-data batch, not mixed into this SAT/build QA commit.
- Non-SAT course mastery still depends on additional answer-submission event capture in the relevant course/practice flows.

### 2026-06-04 Batch 19 - Math 6 display-ready catalog gate

Scope completed:

- Added a generic Math learning catalog builder that keeps display-ready Math 6 items open and separates blocked items from learner-facing selection.
- Added Math 6 raw-source catalog helper that runs the content guard and passes only `displayReadyItemIds` into the learner-facing catalog.
- Added Math diagnostic/practice selectors that filter by program, topic, level, concept, skill, difficulty, and attempted item IDs.
- Added TCVN3 legacy Vietnamese text decoding during Math 6 prompt normalization to reduce encoding blockers where source text uses old font mappings.
- Synced portal content coverage snapshot so Admin Content Repair Queue can show `vn_math_6` as a guarded `watch` source; Batch 21 resync updates this to 926/1549 display-ready questions, 539 generated figures, and remaining blocker counts.

Changed files:

- `packages/content/src/math-learning.ts`
- `packages/content/src/index.ts`
- `packages/content/src/math6-import.ts`
- `packages/content/src/standard.test.ts`
- `packages/content/src/sync-portal-content-quality-snapshot.ts`
- `apps/miuprep-portal/src/data/contentQualitySnapshot.ts`
- `reports/content-quality/math6-content-audit.md`
- `reports/content-quality/math6-content-guard.json`
- `reports/content-quality/math6-content-issues.csv`
- `reports/content-quality/math6-display-ready-preview.json`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd test -w @miuprep/content`
- `npm.cmd run guard:math6 -w @miuprep/content -- --quiet`
- `npm.cmd run build -w @miuprep/content`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd run lint -w miuprep-portal`

Verification passed, round 2:

- `npm.cmd test -w @miuprep/content`
- `npm.cmd run guard:math6 -w @miuprep/content -- --quiet`
- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`

Proof captured:

- Math 6 guard now reports adapter pass with 1,549 converted items and 926 display-ready learner-facing items after the Batch 21 resync.
- Standard tests now prove legacy TCVN3 text is decoded and blocked Math 6 items are excluded from the default learning catalog.
- Portal lint/build prove the new unified content coverage snapshot shape compiles in admin surfaces.

Residual risk:

- 593 Math 6 items still require formula review because Word/OLE formula payloads are not recoverable from the current plain-text extract alone.
- 2 Math 6 items still require original-image or manually generated figure review.
- 15 Math 6 items still require encoding review after automatic TCVN3 decoding; these need source-specific cleanup.
- CAE OCR/content expansion artifacts are still dirty in the worktree and should be committed only in a separate CAE-focused batch after their own guard run.

### 2026-06-04 Batch 20 - CAE writing/speaking visual expansion

Scope completed:

- Expanded CAE feedback-only Writing/Speaking tasks with source-grounded guidance and original visual-input references for CAE 4 and CAE 5 writing tasks.
- Added portal-served CAE visual input assets referenced by the writing task HTML.
- Preserved CAE visual prompts through the English adapter by carrying `passageHtml` from source questions into `QuestionItem.metadata`.
- Updated CAE mock data across CAE Plus, CAE 1-6, and listening topic banks while keeping the English catalog guard at 0 blockers.
- Re-ran CAE deep audit after the expansion and confirmed 42 tests / 3,937 questions with 0 issues.

Changed files:

- `packages/content/src/mocks/cae-writing-speaking-samples.ts`
- `packages/content/src/mocks/cam-cae-plus1-test*.json`
- `packages/content/src/mocks/cam-cae1-*.json`
- `packages/content/src/mocks/cam-cae2-*.json`
- `packages/content/src/mocks/cam-cae3-*.json`
- `packages/content/src/mocks/cam-cae4-*.json`
- `packages/content/src/mocks/cam-cae5-*.json`
- `packages/content/src/mocks/cam-cae6-*.json`
- `packages/content/src/standard.ts`
- `apps/miuprep-portal/public/assets/cae/visual-inputs/*.png`
- `reports/content-quality/cae-deep-audit/cae-deep-audit.json`
- `reports/content-quality/cae-deep-audit/cae-deep-audit.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run guard:english -w @miuprep/content`
- `npm.cmd test -w @miuprep/content`

Verification passed, round 2:

- `npm.cmd run audit:cae-deep -w @miuprep/content`
- `npm.cmd run guard:english -w @miuprep/content`
- `npm.cmd test -w @miuprep/content`

Proof captured:

- CAE deep audit reports 42 tests, 3,937 questions, 0 total issues, 0 blockers, and 0 warnings.
- English guard reports 95 tests, 7,098 items, 0 blockers, 112 warnings, and adapter pass.
- CAE writing/speaking feedback-only inventory remains protected from mastery scoring while still preserving visual prompts for review.

Residual risk:

- English guard warnings remain: 64 `blankIndex` warnings and 48 transcript warnings, all non-blocking.
- OCR/rendered-page work artifacts under `reports/content-quality/cae-ocr`, `cae-other-focused-audit`, and `cae6-focused-audit` are intentionally not committed in this batch.
- The remaining Knowledge Graph update still waits for real beta evidence rather than seeded or synthetic learner data.

### 2026-06-04 Batch 21 - Real QA, lesson-template events, and Math 6 resync

Scope completed:

- Re-ran portal verification as real browser QA on the local app instead of comparing only against the audit plan.
- Added learner telemetry for Math and English Core lesson-template actions: clicking `Open practice` or `Ask AI Tutor` now writes a `lesson_template_action` learning event.
- Kept lesson-template action events out of mastery scoring by omitting scored-attempt fields such as `correct`.
- Added portal rendering support for recovered Math formula tokens in learner/admin question prompts, so future rich Math 6 formula assets can display as inline images.
- Updated Math 6 importer/guard/audit defaults so they prefer `math6-rich-raw-extract.json` when present, while falling back to the current plain raw extract.
- Synced Math 6 reports and portal quality snapshot to the current actual guard output: 1,549 imported items, 926 display-ready items, 593 formula blockers, 2 image blockers, 44 encoding blockers, and 539 generated geometry figures.
- Found and removed a partial one-source `math6-rich-raw-extract.json` created by a timed-out rich-extraction test before re-running Math 6 export/audit/sync from the production plain raw extract.
- Hardened Math 6 raw selection so export, guard, portal snapshot sync, and display audit use rich raw only when it is sufficiently complete; partial rich raw files now fall back to the production plain raw extract.

Changed files:

- `apps/miuprep-portal/src/App.tsx`
- `apps/miuprep-portal/src/components/MathLessonTemplatePanel.tsx`
- `apps/miuprep-portal/src/components/EnglishCoreLessonTemplatePanel.tsx`
- `apps/miuprep-portal/src/lib/studentProgress.ts`
- `apps/miuprep-portal/src/data/contentQualitySnapshot.ts`
- `packages/content/src/export-math6-content.ts`
- `packages/content/src/guard-math6-content.ts`
- `packages/content/src/math6-content-guard-report.ts`
- `packages/content/src/math6-import.ts`
- `packages/content/src/standard.test.ts`
- `packages/content/src/sync-portal-content-quality-snapshot.ts`
- `scripts/audit-math6-display.js`
- `MIUPREP_IMPLEMENTATION_PLAN.md`
- `reports/content-quality/math6-content-audit.md`
- `reports/content-quality/math6-content-guard.json`
- `reports/content-quality/math6-content-issues.csv`
- `reports/content-quality/math6-display-audit.json`
- `reports/content-quality/math6-display-audit.md`
- `reports/content-quality/math6-display-ready-preview.json`
- `reports/content-quality/math6-question-bank-audit.md`
- `reports/content-quality/math6-question-bank-coverage.csv`
- `reports/content-quality/math6-question-bank-preview.json`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed, round 1:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- Practical Playwright QA on `http://127.0.0.1:5181` with seeded student account and real browser localStorage events.

Verification passed, round 2:

- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd test -w @miuprep/content`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/beta`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd run build`
- `npm.cmd run guard:math6 -w @miuprep/content -- --quiet`
- `npm.cmd run export:math6 -w @miuprep/content`
- `npm.cmd run audit:math6-display -w @miuprep/content`
- `npm.cmd run sync:portal-quality -w @miuprep/content`
- Partial-rich fallback regression: copied a 3-source rich extract into the default rich path, then re-ran `guard:math6` and `sync:portal-quality`; output stayed at 1,549 imported / 926 display-ready.
- Headless Playwright QA on `http://127.0.0.1:5181` seeded an approved Math+IELTS student, clicked the real Courses UI, and read the resulting browser localStorage event log.

Browser proof captured:

- Student Courses produced two real `lesson_template_action` events after clicking a Math `Open practice` action and an English Core `Ask AI Tutor` action.
- In-app browser UI flow separately confirmed registration, admin approval, IELTS assignment, Math+IELTS dashboard visibility, and both Courses actions moving to the expected Practice/Tutor surfaces.
- Captured event proof: Math event used `programId: vn_math_6_9`, `domainId: mathematics`, `action: open_practice`, `templateId: math9.algebra_transform.repair`, `entityType: lesson_template`, `sourceSurface: math_lesson_template_panel`, and no `correct` field.
- Captured event proof: English event used `programId: ielts`, `domainId: english_core`, `action: open_tutor`, `templateId: eng.core.vocab_collocation.precision`, `entityType: lesson_template`, `sourceSurface: english_core_lesson_template_panel`, and no `correct` field.
- Browser QA reported 0 page errors and 0 console errors.

Math 6 proof captured:

- Sequential `export:math6` reported 1,549 extracted/converted items from the current raw extract on two consecutive runs.
- Sequential `audit:math6-display` reported 926 display-ready items, 593 formula blockers, 2 image blockers, 44 encoding blockers, 539 generated figures, and 0 prompt control characters on two consecutive runs after cleanup.
- `sync:portal-quality` updated Admin content coverage for `vn_math_6` to 926/1,549 display-ready with 623 gated items.
- Rich fallback test reported `{ guardQuestions: 1549, guardReady: 926, snapshotHasPlainFull: true }` while a partial rich extract existed at the default path.

Residual risk:

- Word/OLE formula recovery is not complete. A limited rich-extraction run produced only a partial one-source rich extract before timeout; that artifact was removed from the production path, so formula recovery remains a separate content-data task.
- Non-SAT course-template actions are now captured as workflow telemetry only. Full non-SAT mastery still needs scored answer-submission events in the real practice engine.
- Knowledge Graph update from real beta evidence remains intentionally pending until real learner data is available.

### 2026-06-04 Batch 22 - Non-Math6 scored template practice

Scope completed:

- Left Math 6 formula/image/encoding recovery out of this batch by request; this batch does not depend on Math 6 rich extraction or Math 6 learner-facing expansion.
- Added a reusable template-practice state builder for Math and English Core lesson templates.
- Added a student-facing scored practice panel in the portal Practice tab.
- `Open practice` from Math/English Courses now starts a real session built from guided, independent, mixed, transfer, and quick-check items in the selected lesson template.
- Student answers now create `practice_attempt` learning events with `correct`, `score`, `maxScore`, `itemId`, `programId`, `domainId`, concept/skill ids, template id, stage id, and source surface.
- Wrong template-practice answers add an Error Notebook item and increment the trap counter; correct answers award a small coin reward.
- Added reusable root QA command `npm.cmd run qa:portal-template-practice`.

Changed files:

- `apps/miuprep-portal/src/App.tsx`
- `apps/miuprep-portal/src/components/TemplatePracticeSessionPanel.tsx`
- `apps/miuprep-portal/src/lib/studentProgress.ts`
- `apps/miuprep-portal/src/lib/templatePractice.ts`
- `scripts/qa-portal-template-practice.mjs`
- `package.json`
- `MIUPREP_IMPLEMENTATION_PLAN.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed:

- `npm.cmd run qa:portal-template-practice`
- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd run build -w miuprep-portal`

Browser proof captured:

- QA seeded an approved Math+IELTS student on `http://127.0.0.1:5181`.
- QA clicked Math `Open practice`, answered the first template-practice question, then clicked English Core `Open practice` and answered the first template-practice question.
- Event proof captured 2 `lesson_template_action` events and 2 `practice_attempt` events.
- Math practice event proof: `source: miuprep_portal_template_practice`, `entityType: learning_item`, `programId: vn_math_6_9`, `domainId: mathematics`, `correct: true`, `score: 1`, `maxScore: 1`, and a Math lesson-template item id.
- English practice event proof: `source: miuprep_portal_template_practice`, `entityType: learning_item`, `programId: ielts`, `domainId: english_core`, `correct: true`, `score: 1`, `maxScore: 1`, and an English Core lesson-template item id.
- Browser QA reported 0 page errors and 0 console errors.

Residual risk:

- This closes the immediate non-SAT "button-only telemetry" gap for course template practice, but it is still a template-derived micro-practice engine. Full item-bank practice for IELTS/CAE/CPE and non-Math6 math content should use guarded `QuestionItem` catalogs in a later batch.
- Knowledge Graph updates remain review-gated until real beta data is available.
- Math 6 content recovery remains intentionally deferred to the next Math 6-focused session.

### 2026-06-05 Batch 23 - IELTS/CAE/CPE scored item-bank practice

Scope completed:

- Replaced English Core `Open practice` behavior for IELTS, CAE, and CPE with a scored item-bank session built from real `EnglishLearningCatalog` `QuestionItem`s.
- Kept SAT and Math template-practice routes intact; Math 6 content recovery remains outside this batch by request.
- Added a dedicated English item-bank practice state builder that selects learner-ready, scorable items, prefers lesson-template concept/skill matches, skips previously attempted items, and falls back to program-level questions when needed.
- Added a student-facing `Scored item-bank practice` panel that shows the program bank, item source test/section/group, catalog guard counts, choices, selected answer review, and item metadata.
- Added `practice_attempt` telemetry for item-bank answers with `entityType: learning_item`, real `itemId`, source test/section ids, concept/skill ids, answer values, score, and `sourceSurface: english_item_bank_practice`.
- Wrong item-bank answers now create Error Notebook entries and increment trap count; correct answers award coins.
- Updated the older template-practice QA so it now verifies Math template-practice remains active while English has moved to item-bank practice.

Changed files:

- `apps/miuprep-portal/src/App.tsx`
- `apps/miuprep-portal/src/components/EnglishItemBankPracticePanel.tsx`
- `apps/miuprep-portal/src/lib/englishItemBankPractice.ts`
- `apps/miuprep-portal/src/lib/studentProgress.ts`
- `scripts/qa-portal-english-item-bank-practice.mjs`
- `scripts/qa-portal-template-practice.mjs`
- `package.json`
- `MIUPREP_IMPLEMENTATION_PLAN.md`
- `reports/miuprep-implementation-audit-plan.md`

Verification passed:

- `git diff --check`
- `npm.cmd run lint -w miuprep-portal`
- `npm.cmd run build -w @miuprep/content`
- `npm.cmd test -w @miuprep/learning`
- `npm.cmd test -w @miuprep/content`
- `npm.cmd run qa:portal-english-item-bank-practice`
- `npm.cmd run qa:portal-template-practice`
- `npm.cmd run build -w miuprep-portal`
- `npm.cmd run build`

Browser proof captured:

- In-app browser on `http://127.0.0.1:5181` opened Courses and clicked the real English `Open practice` action.
- The UI rendered `english-item-bank-practice-panel` and did not render the template-practice panel.
- The visible panel showed `Scored item-bank practice`, `IELTS question bank`, `Vocabulary and Collocation Precision - question 1/6`, source `Library Membership Application`, and catalog guard counts.
- The first loaded item was a real catalog item: `english.ielts.listening-sample-1.l-sec-1.lg-1.q-l1`.

QA proof captured:

- IELTS QA event used item `english.ielts.listening-sample-1.l-sec-1.lg-1.q-l1`, question type `gap_fill`, and source test `listening-sample-1`.
- CAE QA event used item `english.cae.cae-error-correction-bank.cae-ec-sec-1.cae-ec-rg-1.q-cae-ec-1-1`, question type `gap_fill`, and source test `cae-error-correction-bank`.
- CPE QA event used item `english.cpe.cam-cpe1-test1.cam-cpe1-t1-sec-2.cam-cpe1-t1-rg-2.q-cpe1-t1-10`, question type `gap_fill`, and source test `cam-cpe1-test1`.
- QA confirmed each answer wrote exactly one `lesson_template_action` and one item-bank `practice_attempt` with `source: miuprep_portal_english_item_bank_practice`, `entityType: learning_item`, `domainId: english_core`, `correct: true`, `score: 1`, and `maxScore: 1`.

Residual risk:

- Portal build still reports the existing Vite chunk-size warning. The new item-bank helper uses a dynamic import, but Vite reports it is ineffective because `@miuprep/content` is still statically imported by other portal/database paths. This is a performance follow-up, not a functional blocker.
- The next performance pass should split or lazy-load `@miuprep/content` usage in `adminContent.ts` and shared database adapters before expecting English item-bank code to move into a separate chunk.
- Non-Math6 math item-bank practice remains a later batch. Math 6 rich formula/image/encoding recovery remains intentionally deferred.
