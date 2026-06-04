# MiuPrep Weekly Beta Cohort Review

Generated at: 2026-06-04T06:21:40.833Z
Week of: 2026-06-04
Status: watch

## Cohorts

| Cohort | Status | Learners | Evidence | Readiness | Next action |
| --- | --- | --- | --- | --- | --- |
| Math 9 internal beta | pass | 1/1 learners | 18/10 learning events (100%) | 485 questions, 67% graph coverage. | Improve graph coverage for Math 9 internal beta before wider rollout. |
| IELTS Reading/Listening internal beta | pass | 1/1 learners | 18/10 learning events (100%) | 110 questions, 100% graph coverage. | Continue IELTS Reading/Listening internal beta and review mastery/retention deltas next week. |

## Graph Adjustment Backlog

| Item | Kind | Severity | Evidence | Source | Auto apply | Decision | Reason |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| mis.eng.inference_literal_only | misconception_signal | watch | 3 | synthetic | no | defer | mis.eng.inference_literal_only appears in 3 attempts; review remediation edges against eng.reading_inference, eng.infer_implicit_meaning. |
| mis.math.factor_vs_expand | misconception_signal | watch | 3 | synthetic | no | defer | mis.math.factor_vs_expand appears in 3 attempts; review remediation edges against math.quadratic_equation, math.solve_quadratic_by_factor. |
| math.quadratic_equation | weak_mastery | watch | 8 | synthetic | no | defer | math.quadratic_equation is still in repair after 8 attempts; inspect prerequisite/remediation edges. |
| math.solve_quadratic_by_factor | weak_mastery | watch | 8 | synthetic | no | defer | math.solve_quadratic_by_factor is still in repair after 8 attempts; inspect prerequisite/remediation edges. |
| eng.reading_inference | weak_mastery | watch | 6 | synthetic | no | defer | eng.reading_inference is still in repair after 6 attempts; inspect prerequisite/remediation edges. |
| eng.infer_implicit_meaning | weak_mastery | watch | 6 | synthetic | no | defer | eng.infer_implicit_meaning is still in repair after 6 attempts; inspect prerequisite/remediation edges. |

## Repair Reroutes

| Learner | Target | Action | Evidence | Consecutive wrong | Source | Decision | Reason |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| beta-math-learner-1 | math.quadratic_equation | prerequisite_micro_diagnostic | 8 | 0 | synthetic | defer | math.quadratic_equation is still in repair after 8 evidence signals; reroute to prerequisite micro-diagnostic for math.factorization, math.linear_equation. |
| beta-math-learner-1 | math.solve_quadratic_by_factor | remediation_lesson | 8 | 0 | synthetic | defer | math.solve_quadratic_by_factor is still in repair after 8 evidence signals; assign remediation lesson for mis.math.factor_vs_expand before more same-level practice. |
| beta-ielts-learner-1 | eng.infer_implicit_meaning | remediation_lesson | 6 | 0 | synthetic | defer | eng.infer_implicit_meaning is still in repair after 6 evidence signals; assign remediation lesson for mis.eng.inference_literal_only before more same-level practice. |
| beta-ielts-learner-1 | eng.reading_inference | prerequisite_micro_diagnostic | 6 | 0 | synthetic | defer | eng.reading_inference is still in repair after 6 evidence signals; reroute to prerequisite micro-diagnostic for eng.reading_detail. |

## Decisions

- Keep beta cohorts small while watch items gather more evidence.
- Do not use beta data for hard Knowledge Graph changes until real learning KPIs improve.
- 4 simulated stuck-repair reroute candidate(s) are watch-only until live beta evidence confirms them.

## Next Actions

- Collect live learning events from diagnostic/practice/review flows.
- Track 4 simulated stuck-repair reroute candidate(s) separately from live beta evidence.
- Improve graph coverage for Math 9 internal beta before wider rollout.
- Continue IELTS Reading/Listening internal beta and review mastery/retention deltas next week.
