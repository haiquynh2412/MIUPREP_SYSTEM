# MiuPrep Internal Beta Run

Generated at: 2026-06-04T06:21:40.833Z

Note: this export is the internal smoke beta package. Seeded learner states prove the pipeline; replace them with live events before approving a wider production beta run.

## Summary

- Run status: watch
- Ready for internal beta: yes
- Math content units: 28
- Math questions: 485
- MiuMath source: C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM\apps\miumath-app\public\data\questions_db.json
- English tests scanned: 93
- English learning-ready questions: 110
- Learners: 2
- Telemetry events: 4
- Live learning telemetry: 0
- Seeded learning telemetry: 4
- Synthetic learner-state events: 14
- Learning KPI source: synthetic
- Mastery V2 shadow status: watch
- Empirical difficulty shadow status: watch
- Repair reroute candidates: 4

## Evidence Source

| Evidence | Count |
| --- | ---: |
| Live telemetry learning events | 0 |
| Seeded telemetry learning events | 4 |
| Live learner-state learning events | 0 |
| Synthetic learner-state learning events | 14 |
| Live learners with state | 0 |
| Synthetic learners with state | 2 |

| KPI | Value |
| --- | ---: |
| Evidence source | synthetic |
| Real learners | 0 |
| Synthetic learners | 2 |
| Real attempt samples | 0 |
| Synthetic attempt samples | 14 |
| Real event samples | 0 |
| Seeded event samples | 18 |

## Mastery V2 Shadow

| Metric | Value |
| --- | ---: |
| Status | watch |
| Evidence source | synthetic |
| Learners inspected | 2 |
| Comparison rows | 4 |
| Changed status rows | 0 |
| Largest absolute delta | 17 |
| Protected feedback-only events | 0 |
| Student-facing enabled | no |
| Recommendation policy | v1_only |

Detail: Mastery V2 shadow is collecting comparison deltas only; review changed statuses or synthetic evidence before enabling any behavior.

## Empirical Difficulty / Elo Shadow

| Metric | Value |
| --- | ---: |
| Status | watch |
| Evidence source | synthetic |
| Learners inspected | 2 |
| Item rows | 14 |
| Calibrated candidates | 0 |
| Sparse items | 14 |
| Drift watch items | 0 |
| High-stakes placement enabled | no |
| Calibration policy | shadow_only_prior_preserved |

Detail: Empirical difficulty and lightweight Elo are shadow-only; keep teacher-authored difficulty until real repeated attempts confirm calibration.

## What Changed, Why, Impact

- Change report status: watch
- Compared with: 2026-06-04T06:18:53.175Z
- Items: 14; changed: 0; blockers: 0; watches: 13; passes: 1

| Area | Severity | Change | What changed | Why | Impact |
| --- | --- | --- | --- | --- | --- |
| Sua Knowledge Graph theo du lieu that | watch | unchanged_risk | Status watch -> watch; evidence 6 -> 6. | Graph adjustment backlog is ready; apply changes only after reviewing live beta evidence. | Gate needs monitoring before wider rollout. |
| Thu thap learning events that | watch | unchanged_risk | Status watch -> watch; evidence 18 -> 18. | Only seeded/synthetic learning events are available; collect live learner evidence before widening beta or changing graph edges. | Gate needs monitoring before wider rollout. |
| misconception_signal: mis.eng.inference_literal_only | watch | unchanged_risk | Evidence 3 -> 3; score 45 -> 45; source synthetic -> synthetic. | mis.eng.inference_literal_only appears in 3 attempts; review remediation edges against eng.reading_inference, eng.infer_implicit_meaning. | Keep this as a watch-only candidate until live beta evidence confirms it. |
| misconception_signal: mis.math.factor_vs_expand | watch | unchanged_risk | Evidence 3 -> 3; score 45 -> 45; source synthetic -> synthetic. | mis.math.factor_vs_expand appears in 3 attempts; review remediation edges against math.quadratic_equation, math.solve_quadratic_by_factor. | Keep this as a watch-only candidate until live beta evidence confirms it. |
| weak_mastery: eng.infer_implicit_meaning | watch | unchanged_risk | Evidence 6 -> 6; score 50 -> 50; source synthetic -> synthetic. | eng.infer_implicit_meaning is still in repair after 6 attempts; inspect prerequisite/remediation edges. | Keep this as a watch-only candidate until live beta evidence confirms it. |
| weak_mastery: eng.reading_inference | watch | unchanged_risk | Evidence 6 -> 6; score 50 -> 50; source synthetic -> synthetic. | eng.reading_inference is still in repair after 6 attempts; inspect prerequisite/remediation edges. | Keep this as a watch-only candidate until live beta evidence confirms it. |
| weak_mastery: math.quadratic_equation | watch | unchanged_risk | Evidence 8 -> 8; score 73 -> 73; source synthetic -> synthetic. | math.quadratic_equation is still in repair after 8 attempts; inspect prerequisite/remediation edges. | Keep this as a watch-only candidate until live beta evidence confirms it. |
| weak_mastery: math.solve_quadratic_by_factor | watch | unchanged_risk | Evidence 8 -> 8; score 73 -> 73; source synthetic -> synthetic. | math.solve_quadratic_by_factor is still in repair after 8 attempts; inspect prerequisite/remediation edges. | Keep this as a watch-only candidate until live beta evidence confirms it. |
| Real learning KPI | watch | unchanged_risk | Mastery lift 52 -> 52; retention 0% -> 0%; recurrence 50% -> 50%; completion quality 67% -> 67%; source synthetic -> synthetic. | Learning KPI currently relies on seeded/synthetic evidence; collect live events before trusting graph or routing changes. | Learning impact has signals but needs more evidence before graph changes. |
| Reroute candidate: eng.reading_inference | watch | unchanged_risk | Evidence 6 -> 6; consecutive wrong 0 -> 0; action prerequisite_micro_diagnostic -> prerequisite_micro_diagnostic. | eng.reading_inference is still in repair after 6 evidence signals; reroute to prerequisite micro-diagnostic for eng.reading_detail. | Use this to monitor the simulated stuck-repair pattern; do not change student routing until live evidence confirms it. |
| Reroute candidate: eng.infer_implicit_meaning | watch | unchanged_risk | Evidence 6 -> 6; consecutive wrong 0 -> 0; action remediation_lesson -> remediation_lesson. | eng.infer_implicit_meaning is still in repair after 6 evidence signals; assign remediation lesson for mis.eng.inference_literal_only before more same-level practice. | Use this to monitor the simulated stuck-repair pattern; do not change student routing until live evidence confirms it. |
| Reroute candidate: math.quadratic_equation | watch | unchanged_risk | Evidence 8 -> 8; consecutive wrong 0 -> 0; action prerequisite_micro_diagnostic -> prerequisite_micro_diagnostic. | math.quadratic_equation is still in repair after 8 evidence signals; reroute to prerequisite micro-diagnostic for math.factorization, math.linear_equation. | Use this to monitor the simulated stuck-repair pattern; do not change student routing until live evidence confirms it. |
| Reroute candidate: math.solve_quadratic_by_factor | watch | unchanged_risk | Evidence 8 -> 8; consecutive wrong 0 -> 0; action remediation_lesson -> remediation_lesson. | math.solve_quadratic_by_factor is still in repair after 8 evidence signals; assign remediation lesson for mis.math.factor_vs_expand before more same-level practice. | Use this to monitor the simulated stuck-repair pattern; do not change student routing until live evidence confirms it. |
| Recommendation quality | pass | unchanged_risk | Checked learners 2 -> 2; issues 0 -> 0; passed 2 -> 2. | Recommendations pass graph scope, prerequisite, difficulty, and repetition checks. | Adaptive recommendations can be assigned. |

## Weekly Cohort Review

- Week of: 2026-06-04
- Weekly status: watch
- Cohorts: 2
- Graph backlog: 6
- Repair reroutes: 4

| Cohort | Status | Learners | Evidence | Readiness | Next action |
| --- | --- | --- | --- | --- | --- |
| Math 9 internal beta | pass | 1/1 learners | 18/10 learning events (100%) | 485 questions, 67% graph coverage. | Improve graph coverage for Math 9 internal beta before wider rollout. |
| IELTS Reading/Listening internal beta | pass | 1/1 learners | 18/10 learning events (100%) | 110 questions, 100% graph coverage. | Continue IELTS Reading/Listening internal beta and review mastery/retention deltas next week. |

## Phase 10 Checklist

| Item | Status | Evidence | Detail |
| --- | --- | ---: | --- |
| Beta noi bo voi Toan lop 9 | pass | 485 | 28 units, 485 questions, 1 beta learners. |
| Beta noi bo voi IELTS Reading/Listening | pass | 110 | 6 units, 110 questions, 1 beta learners. |
| Thu thap learning events that | watch | 18 | Only seeded/synthetic learning events are available; collect live learner evidence before widening beta or changing graph edges. |
| Kiem tra do dung cua diagnostic | pass | 2 | Diagnostic has enough graph coverage or live diagnostic telemetry for internal beta. |
| Kiem tra recommendation co hop ly khong | pass | 2 | Recommendations are scoped to the learner target programs and valid graph nodes. |
| Sua Knowledge Graph theo du lieu that | watch | 6 | Graph adjustment backlog is ready; apply changes only after reviewing live beta evidence. |

## Scopes

| Scope | Status | Units | Questions | Learners | Coverage |
| --- | --- | ---: | ---: | ---: | ---: |
| Math 9 internal beta | pass | 28 | 485 | 1 | 67% |
| IELTS Reading/Listening internal beta | pass | 6 | 110 | 1 | 100% |

## Repair Reroute Candidates

- math.quadratic_equation for beta-math-learner-1: prerequisite_micro_diagnostic; source: synthetic; evidence: 8; consecutive wrong: 0; suspected prerequisites: math.factorization, math.linear_equation; misconceptions: mis.math.factor_vs_expand - math.quadratic_equation is still in repair after 8 evidence signals; reroute to prerequisite micro-diagnostic for math.factorization, math.linear_equation.
- math.solve_quadratic_by_factor for beta-math-learner-1: remediation_lesson; source: synthetic; evidence: 8; consecutive wrong: 0; suspected prerequisites: none; misconceptions: mis.math.factor_vs_expand - math.solve_quadratic_by_factor is still in repair after 8 evidence signals; assign remediation lesson for mis.math.factor_vs_expand before more same-level practice.
- eng.infer_implicit_meaning for beta-ielts-learner-1: remediation_lesson; source: synthetic; evidence: 6; consecutive wrong: 0; suspected prerequisites: none; misconceptions: mis.eng.inference_literal_only - eng.infer_implicit_meaning is still in repair after 6 evidence signals; assign remediation lesson for mis.eng.inference_literal_only before more same-level practice.
- eng.reading_inference for beta-ielts-learner-1: prerequisite_micro_diagnostic; source: synthetic; evidence: 6; consecutive wrong: 0; suspected prerequisites: eng.reading_detail; misconceptions: mis.eng.inference_literal_only - eng.reading_inference is still in repair after 6 evidence signals; reroute to prerequisite micro-diagnostic for eng.reading_detail.

## Graph Adjustment Backlog

- misconception_signal: mis.eng.inference_literal_only (3 evidence; source: synthetic; autoApply: no) - mis.eng.inference_literal_only appears in 3 attempts; review remediation edges against eng.reading_inference, eng.infer_implicit_meaning.
- misconception_signal: mis.math.factor_vs_expand (3 evidence; source: synthetic; autoApply: no) - mis.math.factor_vs_expand appears in 3 attempts; review remediation edges against math.quadratic_equation, math.solve_quadratic_by_factor.
- weak_mastery: math.quadratic_equation (8 evidence; source: synthetic; autoApply: no) - math.quadratic_equation is still in repair after 8 attempts; inspect prerequisite/remediation edges.
- weak_mastery: math.solve_quadratic_by_factor (8 evidence; source: synthetic; autoApply: no) - math.solve_quadratic_by_factor is still in repair after 8 attempts; inspect prerequisite/remediation edges.
- weak_mastery: eng.reading_inference (6 evidence; source: synthetic; autoApply: no) - eng.reading_inference is still in repair after 6 attempts; inspect prerequisite/remediation edges.
- weak_mastery: eng.infer_implicit_meaning (6 evidence; source: synthetic; autoApply: no) - eng.infer_implicit_meaning is still in repair after 6 attempts; inspect prerequisite/remediation edges.

## Run Plan

### Entry Gates
- Each beta scope has active content mapped to Knowledge Graph targets.
- Each beta learner is assigned to the correct target program.
- Diagnostic attempts are captured before adaptive practice recommendations are trusted.
- Recommendation audit has no missing or out-of-program graph targets.

### Exit Gates
- Each cohort reaches the minimum learning event target.
- Diagnostic placement agrees with observed weak mastery areas after practice.
- Recommendation watchlist has no blocked issues for live learner states.
- Graph adjustment candidates are reviewed and either accepted, rejected, or deferred.

### Next Actions
- Collect live learning events from diagnostic/practice/review flows.
- Track 4 simulated stuck-repair reroute candidate(s) separately from live beta evidence.
