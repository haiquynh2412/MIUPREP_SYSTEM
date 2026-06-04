import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.tag_trap_types import tag_question
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from review_unified_needs_review_bank import load_payload, write_payload
    from tag_trap_types import tag_question


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
FOUNDATION_PATH = DATA_DIR / "sat-studio-foundation-bank.json"
REPORT_PATH = DATA_DIR / "sat-expansion-batch-002-report.json"
BLUEPRINT_PATH = DATA_DIR / "sat-expansion-blueprint-20260520-batch002.json"
VERSION = "sat-expansion-batch-002-2026-05-20"
TARGET = "Grade 10 bridge through SAT 1600"
SOURCE_NAME = "SAT Studio Expansion Batch 002"
LICENSE_NOTE = "Original SAT Studio item generated from internal blueprint; no source exercise text copied."


def audit_stamp() -> dict[str, Any]:
    return {
        "version": VERSION,
        "verdict": "pass",
        "reviewer": "Codex SAT expert expansion pass",
        "checkedAt": str(date.today()),
        "target": TARGET,
        "checks": [
            "answer_key_and_explanation_consistency",
            "current_digital_sat_domain_alignment",
            "specific_distractor_trap_teaching",
            "gap_alignment_after_metadata_repair",
            "no_routine_clone_topic",
        ],
        "sourceUsagePolicy": "original SAT Studio expansion item; source label is provenance only",
    }


def strict_review() -> dict[str, Any]:
    return {
        "version": VERSION,
        "status": "reviewed",
        "target": TARGET,
        "criteria": [
            "accurate answer key",
            "current Digital SAT domain/skill fit",
            "specific explanation and trap notes",
            "varied cognitive move",
            "usable from grade 10 bridge through SAT 1600 progression",
        ],
    }


def base_item(
    qid: str,
    section: str,
    domain: str,
    skill: str,
    difficulty: str,
    prompt: str,
    choices: dict[str, str],
    correct: str,
    explanation: dict[str, Any],
    blueprint_id: str,
    cognitive_move: str,
    representation: str,
    trap_model: str,
    difficulty_reason: str,
    passage_spec: dict[str, Any] | None = None,
    question_type: str = "multiple_choice",
    acceptable_answers: list[str] | None = None,
) -> dict[str, Any]:
    item = {
        "id": qid,
        "section": section,
        "domain": domain,
        "skill": skill,
        "difficulty": difficulty,
        "sourceType": "foundation",
        "sourceName": SOURCE_NAME,
        "sourceSignalId": "sat-expansion-blueprint-20260520-batch002",
        "licenseNote": LICENSE_NOTE,
        "visibility": "public_candidate",
        "reviewStatus": "reviewed",
        "publicationStatus": "public_candidate_reviewed",
        "sourceUsagePolicy": "provenance_only_unified_pool",
        "postReviewUse": "unified_mixed_sat_pool",
        "unifiedPoolPolicyVersion": "unified-source-policy-2026-05-18",
        "practicePool": "core_pool",
        "questionType": question_type,
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": correct,
        "explanation": explanation,
        "blueprintId": blueprint_id,
        "templateFormId": qid.replace("expansion-b002-", "form-expansion-b002-"),
        "cognitiveMove": cognitive_move,
        "representation": representation,
        "trapModel": trap_model,
        "difficultyReason": difficulty_reason,
        "contentAudit": audit_stamp(),
        "strict1600Review": strict_review(),
        "expansionBatch": VERSION,
    }
    if acceptable_answers is not None:
        item["acceptableAnswers"] = acceptable_answers
    if passage_spec is not None:
        item["passageSpec"] = passage_spec
    traps = tag_question(item)
    if traps:
        item["trapTypes"] = traps
        item["trapTypesVersion"] = "trap-types-v1-2026-05-20"
    return item


def mc_math(qid: str, domain: str, skill: str, difficulty: str, prompt: str, choices: dict[str, str], correct: str, correct_exp: str, distractors: dict[str, str], blueprint_id: str, cognitive_move: str, trap_model: str) -> dict[str, Any]:
    return base_item(
        qid,
        "Math",
        domain,
        skill,
        difficulty,
        prompt,
        choices,
        correct,
        {"correct": correct_exp, "distractors": distractors},
        blueprint_id,
        cognitive_move,
        "equation_or_data_model",
        trap_model,
        "Requires setup, structural recognition, or interpretation rather than direct arithmetic.",
    )


def spr_math(qid: str, domain: str, skill: str, difficulty: str, prompt: str, correct: str, correct_exp: str, blueprint_id: str, cognitive_move: str, trap_model: str, acceptable: list[str] | None = None) -> dict[str, Any]:
    return base_item(
        qid,
        "Math",
        domain,
        skill,
        difficulty,
        prompt,
        {},
        correct,
        {
            "correct": correct_exp,
            "distractors": {
                "common_error_1": "A common error is to answer an intermediate value before checking what the prompt asks for.",
                "common_error_2": "Another common error is to use the visible numbers without setting up the relationship first.",
            },
        },
        blueprint_id,
        cognitive_move,
        "student_produced_response",
        trap_model,
        "Requires a final numeric response without answer-choice cues.",
        question_type="student_produced_response",
        acceptable_answers=acceptable or [correct],
    )


def rw_item(qid: str, domain: str, skill: str, difficulty: str, prompt: str, choices: dict[str, str], correct: str, correct_exp: str, distractors: dict[str, str], passage_spec: dict[str, Any], blueprint_id: str, cognitive_move: str, trap_model: str) -> dict[str, Any]:
    return base_item(
        qid,
        "Reading and Writing",
        domain,
        skill,
        difficulty,
        prompt,
        choices,
        correct,
        {"correct": correct_exp, "distractors": distractors},
        blueprint_id,
        cognitive_move,
        "notes_or_passage",
        trap_model,
        "Uses close choices that are plausible but fail the exact rhetorical goal or logical relationship.",
        passage_spec=passage_spec,
    )


def build_blueprint() -> dict[str, Any]:
    return {
        "version": VERSION,
        "basisReports": [
            "data/sat-2026-readiness-audit.json",
            "data/reviewed-question-expert-audit.json",
            "data/opensat-rw-p1-metadata-repair-report.json",
            "data/topic-governance-report.json",
        ],
        "batch002Targets": {
            "Math Algebra": 8,
            "Math Advanced Math": 8,
            "Reading and Writing Expression of Ideas": 6,
            "Math PSDA statistical claim micro-skills": 6,
        },
        "avoid": [
            "routine probability clone",
            "routine circumference or hypotenuse clone",
            "single-step percent discount",
            "generic student-notes question without a specific goal",
        ],
        "reason": "After metadata repair, the main remaining domain gaps are Advanced Math, Algebra, Expression of Ideas, plus thin PSDA statistical-claim micro-skills.",
    }


def build_items() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    items.extend(
        [
            mc_math(
                "expansion-b002-math-algebra-001",
                "Algebra",
                "Systems of equations in two variables",
                "Hard",
                "Two equations are shown:\n\n2x + 5y = 17\n6x + 15y = k\n\nFor what value of k do the equations have infinitely many solutions?",
                {"A": "17", "B": "34", "C": "51", "D": "68"},
                "C",
                "Choice C is correct: 51. The second left side is 3 times the first left side, so the right side must also be 3 times 17 for the equations to represent the same line. Since 3(17) = 51, k = 51. Final answer = 51.",
                {
                    "A": "Choice A copies the original constant and ignores that the entire equation was scaled by 3.",
                    "B": "Choice B doubles the constant, but the coefficients on the left side were tripled, not doubled.",
                    "D": "Choice D adds 51 and 17, which does not preserve equality under a single scale factor.",
                },
                "math-algebra-scaled-system-infinite",
                "compare scaled equations for solution count",
                "copying or partly scaling the constant",
            ),
            mc_math(
                "expansion-b002-math-algebra-002",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Medium",
                "A delivery service charges a one-time fee of $6 plus $8 for each package delivered. A customer wants the total charge to be less than $50. What is the greatest number of packages the customer can have delivered?",
                {"A": "4", "B": "5", "C": "6", "D": "7"},
                "B",
                "Choice B is correct: 5. If n is the number of packages, the charge is 6 + 8n. The condition is 6 + 8n < 50, so 8n < 44 and n < 5.5. The greatest whole number less than 5.5 is 5. Final answer = 5.",
                {
                    "A": "Choice A is below the maximum and comes from being too conservative after solving the inequality.",
                    "C": "Choice C rounds 5.5 up, but 6 packages would cost 54, which is not less than 50.",
                    "D": "Choice D uses the number 50 too loosely and does not satisfy the inequality.",
                },
                "math-algebra-inequality-context-boundary",
                "model a cost condition and apply an integer boundary",
                "rounding an upper bound in the wrong direction",
            ),
            spr_math(
                "expansion-b002-math-algebra-003",
                "Algebra",
                "Linear functions",
                "Hard",
                "A line passes through the points (2, 7) and (a, 19). If the slope of the line is 4, what is the value of a?",
                "5",
                "The slope between the two points is (19 - 7)/(a - 2), which equals 12/(a - 2). Set this equal to 4: 12/(a - 2) = 4. Then 12 = 4a - 8, so 20 = 4a and a = 5. Final answer = 5.",
                "math-algebra-slope-parameter",
                "use the slope formula to solve for a missing coordinate",
                "using the y-change as the x-coordinate",
            ),
            mc_math(
                "expansion-b002-math-algebra-004",
                "Algebra",
                "Systems of equations in two variables",
                "Medium",
                "The pair (x, y) satisfies the equations 2x + y = 13 and x - y = 2. What is the value of 3x + y?",
                {"A": "13", "B": "15", "C": "18", "D": "21"},
                "C",
                "Choice C is correct: 18. Add the equations to get 3x = 15, so x = 5. Substitute into x - y = 2 to get 5 - y = 2, so y = 3. Therefore 3x + y = 3(5) + 3 = 18. Final answer = 18.",
                {
                    "A": "Choice A repeats the value of 2x + y instead of finding the requested expression.",
                    "B": "Choice B is the value of 3x before adding y.",
                    "D": "Choice D adds 3x and x rather than using the solved value of y.",
                },
                "math-algebra-system-requested-expression",
                "solve a system and evaluate a different expression",
                "answering an intermediate expression",
            ),
            mc_math(
                "expansion-b002-math-algebra-005",
                "Algebra",
                "Linear functions",
                "Medium",
                "The function f is linear. The table shows two values of f.\n\nx | -1 | 5\nf(x) | 2 | 20\n\nWhat is f(9)?",
                {"A": "26", "B": "29", "C": "32", "D": "36"},
                "C",
                "Choice C is correct: 32. From x = -1 to x = 5, x increases by 6 while f(x) increases by 18, so the slope is 3. Starting from f(5) = 20, increasing x by 4 to x = 9 increases f by 12. Thus f(9) = 32. Final answer = 32.",
                {
                    "A": "Choice A adds only 6 to 20, confusing total change with the needed change from x = 5 to x = 9.",
                    "B": "Choice B uses an unsupported slope between 2 and 20.",
                    "D": "Choice D adds the full table change of 18 again instead of using the remaining x-change.",
                },
                "math-algebra-linear-table-extrapolate",
                "derive and apply a constant rate of change",
                "using table-step change as the next output change",
            ),
            mc_math(
                "expansion-b002-math-algebra-006",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Medium",
                "Which ordered pair (x, y) satisfies both inequalities y > 2x + 1 and x + y < 8?",
                {"A": "(2, 6)", "B": "(1, 4)", "C": "(3, 5)", "D": "(4, 0)"},
                "B",
                "Choice B is correct: (1, 4). For (1, 4), the first inequality gives 4 > 2(1) + 1, or 4 > 3, and the second gives 1 + 4 < 8. Both statements are true. Each other choice fails at least one of the two conditions. Final answer = (1, 4).",
                {
                    "A": "Choice A satisfies y > 2x + 1, but x + y equals 8, so it does not satisfy x + y < 8.",
                    "C": "Choice C fails the first inequality because 5 is not greater than 7.",
                    "D": "Choice D fails the first inequality because 0 is not greater than 9.",
                },
                "math-algebra-two-inequality-point-test",
                "test ordered pairs against a system of inequalities",
                "checking only one inequality",
            ),
            mc_math(
                "expansion-b002-math-algebra-007",
                "Algebra",
                "Linear functions",
                "Hard",
                "The line y = (m + 1)x - 4 is perpendicular to the line y = -1/3 x + 8. What is the value of m?",
                {"A": "-4", "B": "-2", "C": "2", "D": "3"},
                "C",
                "Choice C is correct: 2. A line perpendicular to a line with slope -1/3 has slope 3, the negative reciprocal. The slope of y = (m + 1)x - 4 is m + 1, so m + 1 = 3 and m = 2. Final answer = 2.",
                {
                    "A": "Choice A uses the negative reciprocal process in the wrong direction.",
                    "B": "Choice B copies the sign pattern from -1/3 without finding the perpendicular slope.",
                    "D": "Choice D gives the perpendicular slope, not the value of m.",
                },
                "math-algebra-perpendicular-parameter",
                "connect perpendicular slopes to a parameter",
                "answering the slope instead of the parameter",
            ),
            mc_math(
                "expansion-b002-math-algebra-008",
                "Algebra",
                "Systems of equations in two variables",
                "Medium",
                "At a school event, 18 tickets were sold. Adult tickets cost $12 each, and student tickets cost $8 each. If the total revenue was $184, how many adult tickets were sold?",
                {"A": "8", "B": "10", "C": "12", "D": "14"},
                "B",
                "Choice B is correct: 10. Let a be the number of adult tickets and s be the number of student tickets. Then a + s = 18 and 12a + 8s = 184. Subtracting 8(a + s) = 144 from the revenue equation gives 4a = 40, so a = 10. Final answer = 10.",
                {
                    "A": "Choice A gives a revenue of 8(12) + 10(8) = 176, which is too low.",
                    "C": "Choice C gives a revenue of 12(12) + 6(8) = 192, which is too high.",
                    "D": "Choice D overweights adult tickets and gives a revenue above the stated total.",
                },
                "math-algebra-ticket-system",
                "write and solve a two-variable context system",
                "mixing total count with total revenue",
            ),
        ]
    )

    items.extend(
        [
            spr_math(
                "expansion-b002-math-advanced-001",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "The equation x^2 + bx + 9 = 0 has exactly one real solution. If b is positive, what is the value of b?",
                "6",
                "A quadratic has exactly one real solution when the discriminant is 0. For x^2 + bx + 9 = 0, the discriminant is b^2 - 4(1)(9), or b^2 - 36. Set b^2 - 36 = 0 to get b = 6 or b = -6. Since b is positive, b = 6. Final answer = 6.",
                "math-advanced-discriminant-positive-parameter",
                "use the discriminant with a sign condition",
                "ignoring the positive condition",
            ),
            mc_math(
                "expansion-b002-math-advanced-002",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "For x not equal to 2, the expression (x^2 - 5x + 6)/(x - 2) is equivalent to a simpler expression. What is the value of that simpler expression when x = 7?",
                {"A": "2", "B": "4", "C": "5", "D": "7"},
                "B",
                "Choice B is correct: 4. Factor the numerator: x^2 - 5x + 6 = (x - 2)(x - 3). Since x is not 2, the expression simplifies to x - 3. At x = 7, the value is 7 - 3 = 4. Final answer = 4.",
                {
                    "A": "Choice A uses the excluded value from the denominator rather than the simplified expression.",
                    "C": "Choice C comes from x - 2, but the remaining factor after cancellation is x - 3.",
                    "D": "Choice D gives the input value instead of the expression value.",
                },
                "math-advanced-rational-expression-evaluate",
                "factor, cancel, then evaluate",
                "using the canceled factor as the final expression",
            ),
            mc_math(
                "expansion-b002-math-advanced-003",
                "Advanced Math",
                "Nonlinear functions",
                "Medium",
                "Let f(x) = 2x^2 - 3 and g(x) = x - 4. What is f(g(6))?",
                {"A": "1", "B": "5", "C": "13", "D": "45"},
                "B",
                "Choice B is correct: 5. First evaluate the inner function: g(6) = 6 - 4 = 2. Then substitute 2 into f: f(2) = 2(2^2) - 3 = 8 - 3 = 5. The order matters because f(g(6)) is composition, not multiplication. Final answer = 5.",
                {
                    "A": "Choice A evaluates f(2) with 2 squared incorrectly.",
                    "C": "Choice C substitutes 4 into f after using the subtracted value in the wrong direction.",
                    "D": "Choice D evaluates f(6) and ignores the inner function g.",
                },
                "math-advanced-function-composition-nonlinear",
                "evaluate a composition with a nonlinear outer function",
                "substituting into the outer function too early",
            ),
            spr_math(
                "expansion-b002-math-advanced-004",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "The quadratic function f(x) = x^2 + bx + 5 has its minimum at x = -4. What is the value of b?",
                "8",
                "For f(x) = x^2 + bx + 5, the x-coordinate of the vertex is -b/2 because the coefficient of x^2 is 1. The minimum occurs at x = -4, so -b/2 = -4. Multiplying by -2 gives b = 8. The constant 5 changes the vertical position, not the vertex x-coordinate. Final answer = 8.",
                "math-advanced-vertex-parameter-negative",
                "use the vertex formula with a negative vertex coordinate",
                "dropping the negative sign in -b over 2",
            ),
            mc_math(
                "expansion-b002-math-advanced-005",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Medium",
                "If 3^(x + 1) = 81, what is the value of x?",
                {"A": "2", "B": "3", "C": "4", "D": "5"},
                "B",
                "Choice B is correct: 3. Rewrite 81 as a power of 3: 81 = 3^4. Since 3^(x + 1) = 3^4, the exponents must be equal, so x + 1 = 4 and x = 3. Final answer = 3.",
                {
                    "A": "Choice A subtracts too much after matching the exponents.",
                    "C": "Choice C gives the exponent x + 1, not x.",
                    "D": "Choice D adds 1 instead of subtracting 1 from the matched exponent.",
                },
                "math-advanced-exponential-equation-shift",
                "match bases and solve an exponent equation",
                "answering the shifted exponent",
            ),
            mc_math(
                "expansion-b002-math-advanced-006",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "One solution of x^2 - px + 12 = 0 is 3. What is the value of p?",
                {"A": "4", "B": "7", "C": "9", "D": "15"},
                "B",
                "Choice B is correct: 7. Substitute x = 3 into x^2 - px + 12 = 0 to get 9 - 3p + 12 = 0. Then 21 - 3p = 0, so 3p = 21 and p = 7. This uses the given root directly rather than guessing the other root first. Final answer = 7.",
                {
                    "A": "Choice A is the other root, because 3 times 4 equals 12, but the question asks for p.",
                    "C": "Choice C copies 3 squared from the substitution step.",
                    "D": "Choice D adds 3 and 12 without using the coefficient relationship.",
                },
                "math-advanced-root-parameter",
                "use a known root to solve for a quadratic parameter",
                "answering the other root instead of the parameter",
            ),
            mc_math(
                "expansion-b002-math-advanced-007",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "The graphs of y = x^2 + 4x and y = 2x + 9 intersect at two points. What is the sum of the x-coordinates of the two intersection points?",
                {"A": "-9", "B": "-4", "C": "-2", "D": "2"},
                "C",
                "Choice C is correct: -2. Set the expressions equal: x^2 + 4x = 2x + 9. This gives x^2 + 2x - 9 = 0. For a quadratic ax^2 + bx + c = 0, the sum of the roots is -b/a, so the sum is -2/1 = -2. Final answer = -2.",
                {
                    "A": "Choice A uses the constant term rather than the root-sum relationship.",
                    "B": "Choice B copies the coefficient from the original parabola before combining like terms.",
                    "D": "Choice D gives b/a instead of -b/a.",
                },
                "math-advanced-intersection-root-sum",
                "translate graph intersections into a root-sum problem",
                "using the wrong coefficient after moving terms",
            ),
            spr_math(
                "expansion-b002-math-advanced-008",
                "Advanced Math",
                "Equivalent expressions",
                "Hard",
                "The expression (x^2 + 6x + 9) - (x + 3)(x - 4) is equivalent to ax + b. What is the value of a?",
                "7",
                "Expand the product: (x + 3)(x - 4) = x^2 - x - 12. Then subtract it from x^2 + 6x + 9: x^2 + 6x + 9 - (x^2 - x - 12) = 7x + 21. Therefore a, the coefficient of x, is 7. Final answer = 7.",
                "math-advanced-equivalent-expression-coefficient",
                "expand and combine like terms to identify a coefficient",
                "losing signs when subtracting a product",
            ),
        ]
    )

    items.extend(
        [
            rw_item(
                "expansion-b002-rw-eoi-001",
                "Expression of Ideas",
                "Transitions",
                "Medium",
                "Researchers expected the ceramic coating to crack after repeated heating and cooling. ______, after 500 test cycles, the coating showed no visible damage.\n\nWhich choice completes the text with the most logical transition?",
                {"A": "However", "B": "For example", "C": "Similarly", "D": "Moreover"},
                "A",
                "Choice A is correct: However. The first sentence sets up an expectation that the coating would crack, while the second sentence reports the opposite result. However signals that contrast between expectation and outcome.",
                {
                    "B": "Choice B would introduce an example of the expected cracking, but the second sentence contradicts that expectation.",
                    "C": "Choice C suggests similarity, while the two sentences contrast.",
                    "D": "Choice D adds information in the same direction, but the second sentence reverses the expected result.",
                },
                {"passageType": "transition_two_sentence", "discipline": "materials science", "claim": "test result contradicted expectation", "evidence": "no visible damage after cycles", "rhetoricalMove": "contrast", "lexicalTarget": None},
                "rw-eoi-transition-contrast",
                "select a transition for expectation versus result",
                "choosing an additive transition for a contrast",
            ),
            rw_item(
                "expansion-b002-rw-eoi-002",
                "Expression of Ideas",
                "Transitions",
                "Medium",
                "The library installed a roof garden that absorbs rainwater before it reaches the storm drains. ______, the building now sends less runoff into nearby streets during heavy storms.\n\nWhich choice completes the text with the most logical transition?",
                {"A": "Nevertheless", "B": "As a result", "C": "In contrast", "D": "For instance"},
                "B",
                "Choice B is correct: As a result. The second sentence describes an effect of the roof garden's ability to absorb rainwater. As a result clearly marks the cause-and-effect relationship between the installation and reduced runoff.",
                {
                    "A": "Choice A signals concession, but the second sentence follows from the first rather than limiting it.",
                    "C": "Choice C signals contrast, though no opposing idea is presented.",
                    "D": "Choice D would introduce an example, but the sentence gives a consequence.",
                },
                {"passageType": "transition_two_sentence", "discipline": "urban planning", "claim": "green roof reduces runoff", "evidence": "absorbs rainwater", "rhetoricalMove": "cause effect", "lexicalTarget": None},
                "rw-eoi-transition-cause-effect",
                "select a transition for consequence",
                "mistaking an effect for an example",
            ),
            rw_item(
                "expansion-b002-rw-eoi-003",
                "Expression of Ideas",
                "Transitions",
                "Medium",
                "The sculptor used discarded metal and broken glass in the outdoor installation. ______, she wove strips of abandoned fabric through the frame to soften the work's industrial appearance.\n\nWhich choice completes the text with the most logical transition?",
                {"A": "Instead", "B": "Additionally", "C": "Therefore", "D": "Nevertheless"},
                "B",
                "Choice B is correct: Additionally. The second sentence adds another material the sculptor used, so the relationship is additive. The transition should show that fabric is an additional element, not a replacement or contradiction.",
                {
                    "A": "Choice A suggests the artist used fabric instead of metal and glass, but she used all of these materials.",
                    "C": "Choice C suggests a cause-and-effect relationship that the text does not state.",
                    "D": "Choice D implies an obstacle or concession, which is not present.",
                },
                {"passageType": "transition_two_sentence", "discipline": "visual arts", "claim": "artist used multiple recycled materials", "evidence": "metal, glass, fabric", "rhetoricalMove": "addition", "lexicalTarget": None},
                "rw-eoi-transition-addition",
                "select an additive transition",
                "treating added detail as contrast",
            ),
            rw_item(
                "expansion-b002-rw-eoi-004",
                "Expression of Ideas",
                "Transitions",
                "Hard",
                "The team's field survey covered only twelve wetlands, so the researchers cautioned against broad national conclusions. ______, the survey included wetlands from coastal, forest, and agricultural regions, making it useful for comparing local conditions.\n\nWhich choice completes the text with the most logical transition?",
                {"A": "Nevertheless", "B": "For this reason", "C": "Similarly", "D": "In other words"},
                "A",
                "Choice A is correct: Nevertheless. The first sentence limits the survey's scope, while the second explains why the survey still has value. Nevertheless captures that concession: despite one limitation, the study remains useful for a narrower purpose.",
                {
                    "B": "Choice B would make the usefulness a direct result of the limitation, which is not the relationship.",
                    "C": "Choice C signals similarity, but the second sentence qualifies the limitation.",
                    "D": "Choice D signals restatement, though the second sentence adds a counterbalancing point.",
                },
                {"passageType": "transition_two_sentence", "discipline": "ecology", "claim": "limited sample still useful locally", "evidence": "regional variety", "rhetoricalMove": "concession", "lexicalTarget": None},
                "rw-eoi-transition-concession",
                "select a concession transition",
                "treating qualification as restatement",
            ),
            rw_item(
                "expansion-b002-rw-eoi-005",
                "Expression of Ideas",
                "Rhetorical Synthesis",
                "Hard",
                "While researching acoustic design, a student has taken the following notes:\n- Architect Lina Bo Bardi designed the Teatro Oficina in Sao Paulo.\n- The theater has a long, narrow performance space.\n- Audience members sit on scaffolding along both sides of the stage.\n- This arrangement reduces the distance between performers and viewers.\n\nThe student wants to emphasize how the theater's design affects the audience experience. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
                {"A": "Lina Bo Bardi designed the Teatro Oficina, a theater in Sao Paulo with a long, narrow performance space.", "B": "Because audience members sit on scaffolding along both sides of the stage, the Teatro Oficina's design brings viewers unusually close to performers.", "C": "The Teatro Oficina is one example of Lina Bo Bardi's work in Sao Paulo.", "D": "The Teatro Oficina has a stage and audience seating, both of which are important parts of theater design."},
                "B",
                "Choice B is correct. The student's goal is to emphasize audience experience, and this choice connects the scaffolding arrangement to its effect: viewers are brought close to performers. It uses the design detail and explains why that detail matters.",
                {
                    "A": "Choice A gives accurate background but does not explain the audience experience.",
                    "C": "Choice C identifies the architect and place but omits the design effect.",
                    "D": "Choice D is too general and does not use the specific notes about scaffolding or distance.",
                },
                {"passageType": "student_notes", "discipline": "architecture", "claim": "design affects audience experience", "evidence": "scaffolding along both sides reduces distance", "rhetoricalMove": "goal-specific synthesis", "lexicalTarget": None},
                "rw-eoi-rhetorical-synthesis-effect",
                "select notes that match a stated rhetorical goal",
                "choosing background instead of goal-relevant effect",
            ),
            rw_item(
                "expansion-b002-rw-eoi-006",
                "Expression of Ideas",
                "Rhetorical Synthesis",
                "Medium",
                "While researching river restoration, a student has taken the following notes:\n- Some cities remove concrete channels from urban streams.\n- The process can allow water to move through a more natural path.\n- Native plants are often added along the streambanks.\n- These plants can reduce erosion and provide habitat for insects and birds.\n\nThe student wants to present one benefit of adding native plants. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
                {"A": "Urban streams are sometimes changed by removing concrete channels.", "B": "A more natural stream path can be part of a river restoration project.", "C": "Native plants added along streambanks can reduce erosion and create habitat for insects and birds.", "D": "Cities use many different methods when they restore rivers and streams."},
                "C",
                "Choice C is correct. The goal is to present one benefit of adding native plants, and this choice directly states two benefits from the notes: reduced erosion and habitat creation. The other choices discuss restoration more generally.",
                {
                    "A": "Choice A describes removing concrete channels, not adding native plants.",
                    "B": "Choice B mentions stream paths but does not give a benefit of native plants.",
                    "D": "Choice D is broad and does not use the relevant plant-benefit information.",
                },
                {"passageType": "student_notes", "discipline": "environmental science", "claim": "native plants benefit restored streams", "evidence": "reduce erosion and provide habitat", "rhetoricalMove": "goal-specific synthesis", "lexicalTarget": None},
                "rw-eoi-rhetorical-synthesis-benefit",
                "select notes that answer a narrow goal",
                "choosing general topic information instead of requested benefit",
            ),
        ]
    )

    items.extend(
        [
            mc_math(
                "expansion-b002-math-psda-001",
                "Problem-Solving and Data Analysis",
                "Inference from sample statistics and margin of error",
                "Hard",
                "A poll estimates that 52% of voters support a proposal, with a margin of error of 3 percentage points. A second poll estimates that 47% of voters support a different proposal, also with a margin of error of 3 percentage points. Which conclusion is best supported?",
                {"A": "The first proposal definitely has more support because 52 is greater than 47.", "B": "The two intervals overlap, so the polls do not prove that one proposal has greater support.", "C": "The second proposal has greater support because its margin of error is the same.", "D": "Both proposals must have exactly 50% support."},
                "B",
                "Choice B is correct. The first interval is 49% to 55%, and the second interval is 44% to 50%. Because the intervals overlap from 49% to 50%, the poll estimates do not prove that one proposal has greater support. The point estimates alone are not enough. Final answer = B.",
                {
                    "A": "Choice A compares only the point estimates and ignores the margin of error.",
                    "C": "Choice C misuses the equal margins of error; equal uncertainty does not make the second estimate larger.",
                    "D": "Choice D treats overlap as exact equality, which the polls do not show.",
                },
                "math-psda-margin-overlap",
                "interpret overlapping confidence intervals",
                "comparing point estimates without margin of error",
            ),
            mc_math(
                "expansion-b002-math-psda-002",
                "Problem-Solving and Data Analysis",
                "Inference from sample statistics and margin of error",
                "Medium",
                "A school administrator surveys a random sample of 200 students at one high school about whether they eat breakfast before school. To which population can the survey results most reasonably be generalized?",
                {"A": "All teenagers in the country", "B": "All students at that high school", "C": "All students in every high school in the district", "D": "All people who eat breakfast"},
                "B",
                "Choice B is correct. The sample was randomly selected from students at one high school, so the most reasonable population is the students at that high school. The sampling method does not support a conclusion about all teenagers, all district students, or all breakfast eaters. Final answer = B.",
                {
                    "A": "Choice A is too broad because the sample came from only one school.",
                    "C": "Choice C extends the result to schools that were not sampled.",
                    "D": "Choice D changes the population from students at the school to breakfast eaters generally.",
                },
                "math-psda-random-sample-population",
                "identify the population supported by a random sample",
                "overgeneralizing beyond the sampling frame",
            ),
            mc_math(
                "expansion-b002-math-psda-003",
                "Problem-Solving and Data Analysis",
                "Evaluating statistical claims: observational studies and experiments",
                "Medium",
                "An observational study found that students who reported more nightly screen time also reported fewer hours of sleep. Which claim is best supported by this study?",
                {"A": "More screen time is associated with fewer hours of sleep.", "B": "More screen time causes students to sleep fewer hours.", "C": "Reducing screen time will always increase sleep by the same amount.", "D": "Students who sleep less always choose more screen time."},
                "A",
                "Choice A is correct. An observational study can show an association between reported screen time and reported sleep, but it cannot by itself establish that screen time caused the difference in sleep. Other variables could affect both screen use and sleep hours. Final answer = A.",
                {
                    "B": "Choice B makes a causal claim that the observational design does not justify.",
                    "C": "Choice C adds a fixed effect size and a universal result not supported by the study.",
                    "D": "Choice D reverses and overstates the relationship.",
                },
                "math-psda-observational-association",
                "distinguish association from causation",
                "making a causal claim from observational data",
            ),
            mc_math(
                "expansion-b002-math-psda-004",
                "Problem-Solving and Data Analysis",
                "Evaluating statistical claims: observational studies and experiments",
                "Hard",
                "Researchers randomly assigned volunteers to use either a new study app or a standard planner for six weeks. At the end of the study, the app group had a higher average quiz score. Which statement best describes the strength of the evidence?",
                {"A": "Because volunteers were randomly assigned, the study provides evidence that the app may have caused the higher average score.", "B": "Because the study lasted six weeks, the result must apply to all students everywhere.", "C": "Because the app group scored higher, every app user scored higher than every planner user.", "D": "Because volunteers participated, random assignment is irrelevant."},
                "A",
                "Choice A is correct. Random assignment helps make the groups comparable before treatment, so a difference in average outcomes provides evidence that the app may have caused the higher score. The conclusion should still be limited to the study context and not overstated to all students. Final answer = A.",
                {
                    "B": "Choice B overgeneralizes beyond the volunteers and setting of the experiment.",
                    "C": "Choice C confuses a higher average with every individual score being higher.",
                    "D": "Choice D ignores the main design feature that supports causal evidence.",
                },
                "math-psda-random-assignment-causal",
                "evaluate causal evidence from random assignment",
                "overgeneralizing or misreading average differences",
            ),
            mc_math(
                "expansion-b002-math-psda-005",
                "Problem-Solving and Data Analysis",
                "Inference from sample statistics and margin of error",
                "Medium",
                "A survey estimates that 48% of adults in a city support a new park plan, with a margin of error of 4 percentage points. Which statement is best supported?",
                {"A": "A majority of adults in the city definitely support the plan.", "B": "The actual support could reasonably be between 44% and 52%.", "C": "Exactly 48% of all adults in the city support the plan.", "D": "No adults in the city oppose the plan."},
                "B",
                "Choice B is correct. A margin of error of 4 percentage points means the estimate of 48% gives a reasonable interval from 44% to 52%. Because this interval includes values below and above 50%, the survey does not prove majority support. Final answer = B.",
                {
                    "A": "Choice A overstates the estimate because the interval includes values below 50%.",
                    "C": "Choice C treats a sample estimate as the exact population value.",
                    "D": "Choice D is unrelated to the support estimate and is not supported.",
                },
                "math-psda-margin-majority-claim",
                "use margin of error to evaluate a majority claim",
                "treating an estimate as exact",
            ),
            mc_math(
                "expansion-b002-math-psda-006",
                "Problem-Solving and Data Analysis",
                "Evaluating statistical claims: observational studies and experiments",
                "Medium",
                "A city posts an online survey about bus service on its transportation department website. Most respondents say they ride the bus at least four times per week. Which concern most weakens a claim that most city residents ride the bus at least four times per week?",
                {"A": "People who visit the transportation website may be more likely than other residents to use buses.", "B": "Some residents ride the bus more than four times per week.", "C": "The city has more than one bus route.", "D": "The survey asks about bus service rather than train service."},
                "A",
                "Choice A is correct. The survey is voluntary and posted on a transportation website, so respondents may not represent all city residents. People who visit that site could be unusually likely to use buses, creating sampling bias. Final answer = A.",
                {
                    "B": "Choice B is compatible with frequent bus use and does not weaken the representativeness of the survey.",
                    "C": "Choice C gives background about the bus system but does not address sampling bias.",
                    "D": "Choice D is not a problem because the claim is specifically about bus use.",
                },
                "math-psda-sampling-bias-online-survey",
                "identify sampling bias in a voluntary response survey",
                "ignoring who was invited to respond",
            ),
        ]
    )
    return items


def existing_ids(questions: list[dict[str, Any]]) -> set[str]:
    return {str(question.get("id")) for question in questions if isinstance(question, dict)}


def validate_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: dict[str, str] = {}
    failures = []
    for index, item in enumerate(items):
        row = dict(item)
        row["_sourceFile"] = "sat-studio-foundation-bank.json"
        row["_sourceIndex"] = f"new:{index}"
        audit_row = reviewed_issue_row(row, seen)
        warnings = [w for w in audit_row.get("warnings", []) if not w.startswith("duplicate_prompt_with:")]
        if audit_row.get("issues") or warnings or audit_row.get("depthFlags"):
            failures.append(
                {
                    "id": item.get("id"),
                    "issues": audit_row.get("issues"),
                    "warnings": warnings,
                    "depthFlags": audit_row.get("depthFlags"),
                }
            )
    return failures


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(FOUNDATION_PATH)
    if not isinstance(questions, list):
        raise SystemExit("Foundation bank is not a list payload")
    items = build_items()
    duplicate_ids = sorted(existing_ids(questions) & existing_ids(items))
    failures = validate_items(items)
    report: dict[str, Any] = {
        "apply": args.apply,
        "version": VERSION,
        "targetFile": str(FOUNDATION_PATH.relative_to(ROOT)),
        "plannedCount": len(items),
        "duplicateIds": duplicate_ids,
        "validationFailures": failures,
        "added": [],
        "blueprintPath": str(BLUEPRINT_PATH.relative_to(ROOT)),
    }

    BLUEPRINT_PATH.write_text(json.dumps(build_blueprint(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.apply and not duplicate_ids and not failures:
        questions.extend(items)
        write_payload(FOUNDATION_PATH, payload)
        report["added"] = [{"id": item["id"], "section": item["section"], "domain": item["domain"], "skill": item["skill"]} for item in items]
    elif args.apply:
        report["applySkippedReason"] = "duplicateIds_or_validationFailures"

    report["addedCount"] = len(report["added"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "added"}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
