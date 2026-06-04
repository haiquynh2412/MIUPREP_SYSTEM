# SAT Studio Question Generation Principles V2

This rulebook treats question generation as assessment design, not as rewriting source material.

## Core Principle

Generate from a measurement blueprint first. Sources are allowed to inform skill signals, common traps, pacing, and difficulty expectations, but the final question must be original in wording, context, answer choices, explanation, and data.

## SAT Blueprint Alignment

1. Build every batch against an explicit SAT blueprint: section, domain, skill, difficulty band, answer format, representation type, and cognitive move.
2. Reading and Writing batches must cover: Information and Ideas, Craft and Structure, Expression of Ideas, and Standard English Conventions.
3. Math batches must cover: Algebra, Advanced Math, Problem-Solving and Data Analysis, and Geometry/Trigonometry.
4. Full-length practice should mirror the digital SAT balance: Reading and Writing first, Math second, adaptive-like easy-to-hard distribution, and time pressure.
5. A 1590-target bank needs more hard items, but not only harder arithmetic. It needs subtle traps, transfer, pacing decisions, and mixed-domain recognition.

## Item Blueprint Fields

Every generated item should carry these fields, even if the app does not display all of them yet:

1. `blueprintId`: stable id for the intended skill pattern.
2. `templateFormId`: structural form id used to detect near-duplicates.
3. `cognitiveMove`: e.g. isolate variable, infer purpose, evaluate evidence, select transition relation.
4. `representation`: passage, sentence pair, table, graph description, equation, word problem, grid-in.
5. `trapModel`: why the most tempting wrong answer is tempting.
6. `difficultyReason`: why this is Easy, Medium, or Hard.
7. `calculationEaseScore`: whether the arithmetic is mental, clean written work, or intentionally demanding.
8. `sourceSignalId`: source signal only, not copied content.
9. `reviewStatus` and `publicationStatus`: separate educational correctness from publication safety.

## Anti-Repetition Rules

1. Do not generate by changing only numbers. That is a variant, not a new question.
2. A new item must change at least two of these: context, representation, requested value, reasoning path, trap model, or answer format.
3. Same `templateFormId` may appear at most 3 times in the initial visible pool.
4. For easy forms, keep only one public-ready item unless the form trains mental math or a very common trap.
5. For hard forms, keep up to 3 variants only if each variant changes the reasoning demand.
6. If several variants exist, keep the one with roundest answer, clearest stem, strongest explanation, and lowest source-similarity risk.
7. If a student passes a form, hide near-duplicates from normal practice. If the student misses it, expose a small number of variants in increasing difficulty.

## Skeleton Pool Policy

The system must audit old data before accepting new data.

1. Each prompt is reduced to a skeleton by removing numbers, variable names, dates, and shallow proper-name changes.
2. Skeleton grouping is scoped by difficulty, section, domain, skill, and answer format.
3. Each skeleton is split into:
   - `core_pool`: visible in normal practice.
   - `remedial_pool`: hidden until the learner misses the same skeleton/form.
   - `hidden_duplicate`: excluded from normal practice and blocked for new generation.
4. Default caps:
   - Easy: 3 core, 10 active total.
   - Medium: 5 core, 10 active total.
   - Hard: 8 core, 10 active total.
5. New AI or manual drafts must run against the existing local bank before save. If the skeleton already has 10 active items, save is blocked.
6. Medium repeated skeletons are the highest-risk group because they can inflate practice volume while reducing true transfer.

## Difficulty Calibration

Difficulty should be based on reasoning burden, not just ugly numbers.

1. Easy: direct recognition, one concept, clean numbers, one or two steps.
2. Medium: requires setup, interpretation, or two linked ideas.
3. Hard: requires abstraction, hidden constraint, non-obvious trap, multi-step transfer, or time-pressure judgment.
4. A hard Math item can still have a round answer.
5. A hard Reading/Writing item should have close distractors with a clear textual reason, not vague wording.

## Math Generation Rules

1. Prefer SAT-style efficiency: algebraic structure, unit awareness, graph/function interpretation, and smart substitution.
2. Rotate answer formats: multiple choice and student-produced response.
3. Rotate representations: equation, table, verbal model, graph description, geometry figure description, and data summary.
4. Validators should check linear, systems, inequalities, slope, percent, ratio/rate, statistics, probability, quadratics, circles, area/volume, and trig.
5. Distractors should map to real mistakes: sign error, wrong base, swapped numerator/denominator, radius/diameter confusion, slope inversion, or solving for the wrong value.

## Reading And Writing Generation Rules

1. Use original short passages or sentence sets.
2. Each item must have one defensible correct answer with a specific clue.
3. Wrong answers should be wrong for SAT-like reasons: too broad, too narrow, unsupported, wrong relation, wrong tone, wrong grammar boundary, or wrong logical function.
4. Vocabulary questions should test context meaning, not obscure dictionary recall.
5. Grammar questions should isolate the tested rule and avoid accidental ambiguity.

## Source Safety

1. Protected or commercial material may be used only as signal: skill, difficulty idea, mistake pattern, or pacing.
2. Do not copy prompt, passage, answer choices, data table, diagram, or explanation.
3. High-risk references stay `private_family` or `admin_only` unless permission exists.
4. Public candidates must have a clean source trail and pass similarity review.
5. Auto-reviewed means structurally/mathematically plausible, not automatically public-safe.

## Review Workflow

1. AI generates a draft from blueprint.
2. Auto-check validates structure, answer, explanation, difficulty, and duplicate/template risk.
3. Similarity check compares against local bank and source snippets when available.
4. Admin reviews readable question view, not raw JSON.
5. Approved items become `reviewed`; public candidates still need source-policy approval.
6. Rejected variants should keep a reason: duplicate form, weak explanation, ambiguity, wrong answer, source risk, or poor SAT fit.

## Adaptive Learning Use

1. Each wrong attempt must store error type, who tagged it, and when.
2. Roadmap should respond differently to different errors:
   - knowledge gap: lesson first, then foundation set.
   - calculation/careless: slow accuracy drill, then timed set.
   - trap answer/evidence: explanation and elimination drill.
   - time pressure: timed mini-module after accuracy is stable.
   - vocab: add words to vocab deck, then retry context items.
3. A skill is mastered only after success on new contexts, not repeated forms.
4. Roadmap rebuilds after diagnostics, full-length tests, parent/admin review, or every 10 practice attempts.

## Batch Acceptance Checklist

1. Run `python scripts\audit_generated_question_bank.py`.
2. Run `python scripts\audit_full_question_bank.py`.
3. Run `python scripts\audit_sat_2026_readiness.py`.
4. Run `node --check app.js`.
5. Inspect template distribution: no form dominates a skill.
6. Inspect difficulty distribution: enough hard transfer items for 1550-1590 target.
7. Inspect explanations: correct answer proof plus trap explanation.
8. Inspect source policy before any public release.
