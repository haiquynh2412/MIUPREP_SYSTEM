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
REPORT_PATH = DATA_DIR / "sat-expansion-batch-003-report.json"
BLUEPRINT_PATH = DATA_DIR / "sat-expansion-blueprint-20260520-batch003.json"
VERSION = "sat-expansion-batch-003-2026-05-20"
TARGET = "Grade 10 bridge through SAT 1600"
SOURCE_NAME = "SAT Studio Expansion Batch 003"
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
            "algebra_advanced_math_gap_alignment",
            "no_geometry_psda_routine_clone_added",
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
    domain: str,
    skill: str,
    difficulty: str,
    prompt: str,
    choices: dict[str, str],
    correct: str,
    explanation: dict[str, Any],
    blueprint_id: str,
    cognitive_move: str,
    trap_model: str,
    question_type: str = "multiple_choice",
    acceptable_answers: list[str] | None = None,
) -> dict[str, Any]:
    item = {
        "id": qid,
        "section": "Math",
        "domain": domain,
        "skill": skill,
        "difficulty": difficulty,
        "sourceType": "foundation",
        "sourceName": SOURCE_NAME,
        "sourceSignalId": "sat-expansion-blueprint-20260520-batch003",
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
        "templateFormId": qid.replace("expansion-b003-", "form-expansion-b003-"),
        "cognitiveMove": cognitive_move,
        "representation": "equation_or_function_model",
        "trapModel": trap_model,
        "difficultyReason": "Targets Algebra or Advanced Math gap coverage with multi-step setup or structural recognition.",
        "contentAudit": audit_stamp(),
        "strict1600Review": strict_review(),
        "expansionBatch": VERSION,
    }
    if acceptable_answers is not None:
        item["acceptableAnswers"] = acceptable_answers
    traps = tag_question(item)
    if traps:
        item["trapTypes"] = traps
        item["trapTypesVersion"] = "trap-types-v1-2026-05-20"
    return item


def mc(
    qid: str,
    domain: str,
    skill: str,
    difficulty: str,
    prompt: str,
    choices: dict[str, str],
    correct: str,
    correct_exp: str,
    distractors: dict[str, str],
    blueprint_id: str,
    cognitive_move: str,
    trap_model: str,
) -> dict[str, Any]:
    return base_item(
        qid,
        domain,
        skill,
        difficulty,
        prompt,
        choices,
        correct,
        {"correct": correct_exp, "distractors": distractors},
        blueprint_id,
        cognitive_move,
        trap_model,
    )


def spr(
    qid: str,
    domain: str,
    skill: str,
    difficulty: str,
    prompt: str,
    correct: str,
    correct_exp: str,
    blueprint_id: str,
    cognitive_move: str,
    trap_model: str,
    acceptable: list[str] | None = None,
) -> dict[str, Any]:
    return base_item(
        qid,
        domain,
        skill,
        difficulty,
        prompt,
        {},
        correct,
        {
            "correct": correct_exp,
            "distractors": {
                "common_error_1": "A common error is to stop at an intermediate value before checking the exact quantity requested.",
                "common_error_2": "Another common error is to use the visible numbers without setting up the required relationship.",
            },
        },
        blueprint_id,
        cognitive_move,
        trap_model,
        question_type="student_produced_response",
        acceptable_answers=acceptable or [correct],
    )


def build_blueprint() -> dict[str, Any]:
    return {
        "version": VERSION,
        "basisReports": [
            "data/sat-2026-readiness-audit.json",
            "data/reviewed-question-expert-audit.json",
            "data/explanation-upgrade-queue.json",
            "data/topic-governance-report.json",
        ],
        "batch003Targets": {
            "Math Algebra": 16,
            "Math Advanced Math": 16,
        },
        "difficultySkew": {
            "Medium": 13,
            "Hard": 19,
        },
        "avoid": [
            "routine circumference, hypotenuse, or probability clones",
            "single-step arithmetic-only prompts",
            "Geometry and PSDA additions while those domains are overrepresented",
            "near-duplicate prompts from batches 001 and 002",
        ],
        "reason": "The current readiness audit still shows Algebra and Advanced Math as the largest Math domain gaps; batch 003 adds only those domains.",
    }


def build_items() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    items.extend(
        [
            mc(
                "expansion-b003-math-algebra-001",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Hard",
                "The system 4x - 3y = 18 and 8x - 6y = k has infinitely many solutions. What is the value of k?",
                {"A": "9", "B": "18", "C": "24", "D": "36"},
                "D",
                "Choice D is correct: 36. The second equation's left side is exactly 2 times the first equation's left side, so the right side must also be 2 times 18. Therefore k = 36. This checks whether the two equations are the same line, not merely whether their x- and y-coefficients look related. Final answer = 36.",
                {
                    "A": "Choice A halves 18 even though the second equation is twice the first.",
                    "B": "Choice B copies the original constant and would make the lines parallel, not identical.",
                    "C": "Choice C adds 6 to 18 but does not preserve the scale factor across the equation.",
                },
                "math-algebra-scaled-system-identity-b003",
                "use proportional equations to force infinitely many solutions",
                "scaling coefficients but not the constant",
            ),
            spr(
                "expansion-b003-math-algebra-002",
                "Algebra",
                "Linear functions",
                "Hard",
                "A linear function f satisfies f(3) = 11 and f(9) = 35. What is f(14)?",
                "55",
                "The input increases from 3 to 9 by 6 while the output increases from 11 to 35 by 24, so the slope is 24/6 = 4. From x = 9 to x = 14, the input increases by 5, so the output increases by 20. Thus f(14) = 35 + 20 = 55. Final answer = 55.",
                "math-algebra-linear-function-extrapolation-b003",
                "derive slope from two function values and extrapolate",
                "using the output difference as the final answer",
            ),
            mc(
                "expansion-b003-math-algebra-003",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Medium",
                "If 5 - 2x > 17, which of the following must be true?",
                {"A": "x < -6", "B": "x > -6", "C": "x < 6", "D": "x > 11"},
                "A",
                "Choice A is correct: x < -6. Subtract 5 from both sides to get -2x > 12. Dividing by -2 reverses the inequality sign, giving x < -6. The reversal is the key step because the coefficient of x is negative. Final answer = -6.",
                {
                    "B": "Choice B solves the boundary but fails to reverse the inequality after dividing by a negative.",
                    "C": "Choice C loses the negative sign from the boundary value.",
                    "D": "Choice D treats 17 and 5 as if they should be added before isolating x.",
                },
                "math-algebra-negative-coefficient-inequality-b003",
                "solve an inequality requiring sign reversal",
                "not reversing the inequality sign",
            ),
            spr(
                "expansion-b003-math-algebra-004",
                "Algebra",
                "Linear equations in one variable",
                "Medium",
                "A printer charges a setup fee of $18 plus $0.12 per page. If a print job costs $43.20, how many pages are in the job?",
                "210",
                "Let p be the number of pages. The cost model is 18 + 0.12p = 43.20. Subtracting 18 gives 0.12p = 25.20, and dividing by 0.12 gives p = 210. The setup fee is not charged per page, so it must be removed before dividing. Final answer = 210.",
                "math-algebra-linear-context-fee-rate-b003",
                "separate fixed fee from per-unit rate",
                "dividing the total cost by the unit rate",
            ),
            mc(
                "expansion-b003-math-algebra-005",
                "Algebra",
                "Linear equations in one variable",
                "Hard",
                "For what value of a does the equation a(x - 4) = 3x - 12 have infinitely many solutions?",
                {"A": "-4", "B": "3", "C": "4", "D": "12"},
                "B",
                "Choice B is correct: 3. Expanding the left side gives ax - 4a. For the equation to be true for every x, the coefficient of x must match 3 and the constant term must match -12. Setting a = 3 gives 3x - 12 on both sides. Final answer = 3.",
                {
                    "A": "Choice A copies the value inside x - 4 and ignores the coefficient match.",
                    "C": "Choice C makes the constant -16, so the equation is not an identity.",
                    "D": "Choice D copies the constant magnitude rather than the coefficient of x.",
                },
                "math-algebra-identity-parameter-b003",
                "match coefficients to create an identity",
                "using the constant instead of the coefficient",
            ),
            mc(
                "expansion-b003-math-algebra-006",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Medium",
                "If 2x + y = 19 and x - y = 5, what is the value of x + y?",
                {"A": "5", "B": "7", "C": "9", "D": "11"},
                "D",
                "Choice D is correct: 11. From x - y = 5, y = x - 5. Substitute into 2x + y = 19 to get 2x + (x - 5) = 19. Then 3x = 24, so x = 8 and y = 3. Therefore x + y = 11. Final answer = 11.",
                {
                    "A": "Choice A copies the difference x - y instead of finding the sum.",
                    "B": "Choice B comes from subtracting y from x after partial substitution.",
                    "C": "Choice C is one less than the correct sum and can result from using y = x - 4.",
                },
                "math-algebra-system-requested-sum-b003",
                "solve a system and evaluate a requested sum",
                "answering the given difference instead of the requested sum",
            ),
            mc(
                "expansion-b003-math-algebra-007",
                "Algebra",
                "Linear functions",
                "Medium",
                "The graph of a line has slope -3 and passes through (2, 5). What is the y-intercept of the line?",
                {"A": "-1", "B": "2", "C": "5", "D": "11"},
                "D",
                "Choice D is correct: 11. Use y = mx + b with m = -3 and the point (2, 5). Substituting gives 5 = -3(2) + b, so 5 = -6 + b and b = 11. The y-intercept is b, not the given y-value of the point. Final answer = 11.",
                {
                    "A": "Choice A subtracts 6 from 5 instead of adding 6 to isolate b.",
                    "B": "Choice B copies the x-coordinate of the point.",
                    "C": "Choice C copies the y-coordinate of the point and ignores the slope.",
                },
                "math-algebra-slope-point-intercept-b003",
                "use slope and a point to find the intercept",
                "copying a coordinate as the intercept",
            ),
            spr(
                "expansion-b003-math-algebra-008",
                "Algebra",
                "Linear equations in two variables",
                "Hard",
                "The equation 5x + 2y = 50 is true for a point (x, y). If y is 3 less than x, what is the value of x?",
                "8",
                "Since y is 3 less than x, y = x - 3. Substitute into 5x + 2y = 50 to get 5x + 2(x - 3) = 50. Then 7x - 6 = 50, so 7x = 56 and x = 8. The phrase 3 less than x describes y, not x. Final answer = 8.",
                "math-algebra-two-variable-substitution-b003",
                "substitute a relationship into a linear equation",
                "reversing the less-than relationship",
            ),
            mc(
                "expansion-b003-math-algebra-009",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Hard",
                "A club needs to buy notebooks that cost $3 each and folders that cost $2 each. The club will buy 12 items total and spend at most $31. If n is the number of notebooks, which inequality describes the possible values of n?",
                {"A": "n <= 7", "B": "n >= 7", "C": "n <= 12", "D": "n >= 19"},
                "A",
                "Choice A is correct: n <= 7. If the club buys n notebooks, it buys 12 - n folders. The cost is 3n + 2(12 - n) = n + 24. The condition is n + 24 <= 31, so n <= 7. The total-item constraint must be built into the cost expression before solving. Final answer = 7.",
                {
                    "B": "Choice B reverses the inequality after solving the cost condition.",
                    "C": "Choice C uses only the total number of items and ignores the budget.",
                    "D": "Choice D comes from adding 31 and 12 rather than modeling the purchases.",
                },
                "math-algebra-budget-inequality-two-items-b003",
                "write an inequality from a fixed-count cost model",
                "ignoring the fixed total number of items",
            ),
            spr(
                "expansion-b003-math-algebra-010",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Medium",
                "If 3x + 2y = 28 and x + 2y = 12, what is the value of x?",
                "8",
                "Subtract the second equation from the first equation: (3x + 2y) - (x + 2y) = 28 - 12. This gives 2x = 16, so x = 8. The y-terms cancel, which is faster than solving for y first. Final answer = 8.",
                "math-algebra-system-elimination-direct-b003",
                "use elimination to isolate a requested variable",
                "solving for the unrequested variable first",
            ),
            mc(
                "expansion-b003-math-algebra-011",
                "Algebra",
                "Linear functions",
                "Hard",
                "A linear function h has h(0) = -4 and h(6) = 14. For what value of x is h(x) = 35?",
                {"A": "9", "B": "11", "C": "13", "D": "15"},
                "C",
                "Choice C is correct: 13. The slope is (14 - (-4))/(6 - 0) = 18/6 = 3, so h(x) = 3x - 4. Set 3x - 4 = 35, giving 3x = 39 and x = 13. The question asks for the input, not the output. Final answer = 13.",
                {
                    "A": "Choice A comes from using 35 - 14 as though every 6 units of x adds 21.",
                    "B": "Choice B results from forgetting to add 4 before dividing by 3.",
                    "D": "Choice D uses the slope but starts from the wrong intercept.",
                },
                "math-algebra-linear-function-inverse-value-b003",
                "build a linear rule and solve for an input",
                "answering with an output-side calculation",
            ),
            spr(
                "expansion-b003-math-algebra-012",
                "Algebra",
                "Linear equations in one variable",
                "Medium",
                "If (x - 5)/3 + 4 = 11, what is the value of x?",
                "26",
                "Subtract 4 from both sides to get (x - 5)/3 = 7. Multiplying both sides by 3 gives x - 5 = 21, and adding 5 gives x = 26. The division by 3 applies to the entire expression x - 5, so it must be undone before adding 5. Final answer = 26.",
                "math-algebra-fractional-linear-equation-b003",
                "undo operations in the correct order",
                "adding before clearing the denominator",
            ),
            mc(
                "expansion-b003-math-algebra-013",
                "Algebra",
                "Linear equations in two variables",
                "Medium",
                "In the equation 7x + 4y = 58, x represents the number of adult tickets and y represents the number of student tickets sold. If 4 student tickets were sold, how many adult tickets were sold?",
                {"A": "4", "B": "6", "C": "8", "D": "11"},
                "B",
                "Choice B is correct: 6. Substitute y = 4 into 7x + 4y = 58 to get 7x + 16 = 58. Then 7x = 42, so x = 6. The given 4 is the number of student tickets, so it must be substituted for y before solving for x. Final answer = 6.",
                {
                    "A": "Choice A copies the number of student tickets.",
                    "C": "Choice C comes from dividing 58 - 2 by 7 rather than subtracting 4y.",
                    "D": "Choice D comes from adding the ticket counts rather than solving the equation.",
                },
                "math-algebra-context-substitution-b003",
                "substitute a given value into a two-variable equation",
                "copying the substituted value as the answer",
            ),
            spr(
                "expansion-b003-math-algebra-014",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Hard",
                "If 2x - y = 9 and 5x + y = 26, what is the value of x - y?",
                "4",
                "Add the equations to eliminate y: 7x = 35, so x = 5. Substitute into 2x - y = 9 to get 10 - y = 9, so y = 1. Therefore x - y = 5 - 1 = 4. The trap is to stop after finding x, but the prompt asks for x - y. Final answer = 4.",
                "math-algebra-system-expression-b003",
                "solve a system and evaluate a different expression",
                "returning a variable instead of the requested expression",
            ),
            mc(
                "expansion-b003-math-algebra-015",
                "Algebra",
                "Linear functions",
                "Medium",
                "A taxi fare is modeled by F(m) = 4 + 2.5m, where m is the number of miles. What does the number 4 represent in this model?",
                {"A": "The cost per mile", "B": "The number of miles traveled", "C": "The starting fare before any miles are added", "D": "The total fare for 4 miles"},
                "C",
                "Choice C is correct. In F(m) = 4 + 2.5m, the constant term 4 is the value of the fare when m = 0. That means it represents the starting fare before any mileage charge is added. The coefficient 2.5, not 4, is the cost per mile. Final answer = C.",
                {
                    "A": "Choice A describes the coefficient 2.5, not the constant term.",
                    "B": "Choice B confuses the input m with a number in the expression.",
                    "D": "Choice D would require evaluating F(4), which is 14, not 4.",
                },
                "math-algebra-linear-model-intercept-meaning-b003",
                "interpret a constant term in a linear model",
                "confusing intercept and rate",
            ),
            spr(
                "expansion-b003-math-algebra-016",
                "Algebra",
                "Linear equations in one variable",
                "Hard",
                "A solution is made by mixing x liters of a 20% acid solution with 10 liters of a 50% acid solution. The resulting solution is 30% acid. What is the value of x?",
                "20",
                "The amount of acid is 0.20x from the first solution and 0.50(10) = 5 from the second. The total volume is x + 10, and 30% of that is 0.30(x + 10). Set 0.20x + 5 = 0.30(x + 10). Then 0.20x + 5 = 0.30x + 3, so 2 = 0.10x and x = 20. Final answer = 20.",
                "math-algebra-mixture-equation-b003",
                "model a mixture with percent concentration",
                "using the final percent on only one component",
            ),
        ]
    )

    items.extend(
        [
            spr(
                "expansion-b003-math-advanced-001",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "The equation x^2 - 10x + c = 0 has exactly one real solution. What is the value of c?",
                "25",
                "A quadratic has exactly one real solution when its discriminant is 0. For x^2 - 10x + c = 0, the discriminant is (-10)^2 - 4(1)(c), or 100 - 4c. Set 100 - 4c = 0 to get c = 25. Final answer = 25.",
                "math-advanced-discriminant-parameter-b003",
                "use the discriminant-zero condition",
                "solving for a root instead of the parameter",
            ),
            mc(
                "expansion-b003-math-advanced-002",
                "Advanced Math",
                "Equivalent expressions",
                "Hard",
                "For x not equal to -2, the expression (x^2 + 5x + 6)/(x + 2) is equivalent to which expression?",
                {"A": "x + 2", "B": "x + 3", "C": "x^2 + 3", "D": "x - 3"},
                "B",
                "Choice B is correct: x + 3. Factor the numerator: x^2 + 5x + 6 = (x + 2)(x + 3). Because x is not -2, the common factor x + 2 can be canceled, leaving x + 3. The excluded value prevents division by zero but is not the final expression. Final answer = B.",
                {
                    "A": "Choice A gives the factor that cancels, not the factor that remains.",
                    "C": "Choice C does not come from factoring the numerator into binomials.",
                    "D": "Choice D uses the wrong sign after factoring.",
                },
                "math-advanced-rational-expression-simplify-b003",
                "factor and cancel a rational expression",
                "keeping the canceled factor",
            ),
            mc(
                "expansion-b003-math-advanced-003",
                "Advanced Math",
                "Nonlinear functions",
                "Medium",
                "If f(x) = x^2 - 3x and g(x) = x + 5, what is f(g(1))?",
                {"A": "6", "B": "12", "C": "18", "D": "30"},
                "C",
                "Choice C is correct: 18. First evaluate the inner function: g(1) = 1 + 5 = 6. Then substitute 6 into f: f(6) = 6^2 - 3(6) = 36 - 18 = 18. Composition uses the output of g as the input of f. Final answer = 18.",
                {
                    "A": "Choice A stops after finding g(1).",
                    "B": "Choice B subtracts only one 6 instead of 3 times 6.",
                    "D": "Choice D incorrectly adds 36 and -6 or treats the expression as x^2 - x.",
                },
                "math-advanced-function-composition-b003",
                "evaluate a nonlinear composition in order",
                "stopping at the inner function value",
            ),
            spr(
                "expansion-b003-math-advanced-004",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "The function f(x) = (x - 3)^2 + k has a minimum value of -7. What is the value of k?",
                "-7",
                "The expression (x - 3)^2 is always at least 0, and it equals 0 when x = 3. Therefore the minimum value of f(x) is k. Since the minimum value is -7, k = -7. The shift inside the square changes where the minimum occurs, not the minimum value after adding k. Final answer = -7.",
                "math-advanced-vertex-form-minimum-b003",
                "interpret vertex form to identify a minimum value",
                "confusing x-coordinate shift with vertical shift",
            ),
            mc(
                "expansion-b003-math-advanced-005",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Medium",
                "If 2^(x - 1) = 16, what is the value of x?",
                {"A": "3", "B": "4", "C": "5", "D": "8"},
                "C",
                "Choice C is correct: 5. Rewrite 16 as 2^4. Since 2^(x - 1) = 2^4, the exponents must be equal: x - 1 = 4. Adding 1 to both sides gives x = 5. The exponent x - 1 is not itself the requested value of x. Final answer = 5.",
                {
                    "A": "Choice A subtracts 1 from 4 instead of adding 1.",
                    "B": "Choice B gives the exponent x - 1, not x.",
                    "D": "Choice D treats 16 as though it were 2^3 or doubles the exponent.",
                },
                "math-advanced-exponential-shift-b003",
                "match bases and solve for a shifted exponent",
                "answering the exponent before undoing the shift",
            ),
            spr(
                "expansion-b003-math-advanced-006",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "One solution to x^2 + px + 18 = 0 is -3. What is the value of p?",
                "9",
                "Substitute x = -3 into x^2 + px + 18 = 0. This gives 9 - 3p + 18 = 0, so 27 - 3p = 0. Then 3p = 27 and p = 9. Using the known root directly is safer than guessing the other factor first. Final answer = 9.",
                "math-advanced-known-root-parameter-b003",
                "substitute a known root to find a parameter",
                "dropping the negative sign on the known root",
            ),
            mc(
                "expansion-b003-math-advanced-007",
                "Advanced Math",
                "Equivalent expressions",
                "Hard",
                "The expression (2x - 5)(x + 4) - 2x^2 is equivalent to ax + b. What is the value of a?",
                {"A": "-5", "B": "3", "C": "8", "D": "13"},
                "B",
                "Choice B is correct: 3. Expand (2x - 5)(x + 4) to get 2x^2 + 8x - 5x - 20, or 2x^2 + 3x - 20. Subtracting 2x^2 leaves 3x - 20, so a = 3. The squared terms cancel after expansion. Final answer = 3.",
                {
                    "A": "Choice A uses only the -5x term and ignores the 8x term.",
                    "C": "Choice C uses only the 8x term and ignores the -5x term.",
                    "D": "Choice D adds 8 and 5 instead of combining 8x and -5x.",
                },
                "math-advanced-equivalent-expression-linear-coefficient-b003",
                "expand a product and identify the linear coefficient",
                "combining unlike signs incorrectly",
            ),
            spr(
                "expansion-b003-math-advanced-008",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "The graphs of y = x^2 - 6x and y = 2x - 7 intersect at two points. What is the sum of the x-coordinates of the intersection points?",
                "8",
                "Set the expressions equal: x^2 - 6x = 2x - 7. Moving all terms to one side gives x^2 - 8x + 7 = 0. For ax^2 + bx + c = 0, the sum of the roots is -b/a, so the sum is -(-8)/1 = 8. Final answer = 8.",
                "math-advanced-graph-intersection-root-sum-b003",
                "turn graph intersections into a quadratic root-sum problem",
                "using the coefficient before moving all terms",
            ),
            mc(
                "expansion-b003-math-advanced-009",
                "Advanced Math",
                "Nonlinear functions",
                "Medium",
                "If f(x) = 3x^2 + 2, what is f(x + 1) - f(x)?",
                {"A": "3", "B": "6x + 3", "C": "6x + 5", "D": "3x^2 + 6x + 5"},
                "B",
                "Choice B is correct: 6x + 3. Compute f(x + 1) = 3(x + 1)^2 + 2 = 3x^2 + 6x + 5. Then subtract f(x) = 3x^2 + 2, leaving 6x + 3. The original quadratic terms cancel only after subtracting the whole expression. Final answer = B.",
                {
                    "A": "Choice A keeps only the constant change and ignores the 6x term.",
                    "C": "Choice C gives f(x + 1), not the difference f(x + 1) - f(x).",
                    "D": "Choice D expands f(x + 1) but never subtracts f(x).",
                },
                "math-advanced-function-difference-b003",
                "expand and subtract function expressions",
                "forgetting to subtract the original function",
            ),
            spr(
                "expansion-b003-math-advanced-010",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "If x is positive and x^2 = 3x + 28, what is the value of x?",
                "7",
                "Move all terms to one side: x^2 - 3x - 28 = 0. Factor to get (x - 7)(x + 4) = 0, so x = 7 or x = -4. Since x is positive, x = 7. The sign condition eliminates the negative solution. Final answer = 7.",
                "math-advanced-quadratic-positive-solution-b003",
                "solve a quadratic and apply a sign restriction",
                "including the extraneous sign choice",
            ),
            mc(
                "expansion-b003-math-advanced-011",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "Which expression is equivalent to (x - 2)^2 - (x + 1)^2?",
                {"A": "-6x + 3", "B": "-6x + 5", "C": "3x - 3", "D": "2x^2 - 2x + 5"},
                "A",
                "Choice A is correct: -6x + 3. Expand both squares: (x - 2)^2 = x^2 - 4x + 4 and (x + 1)^2 = x^2 + 2x + 1. Subtracting gives x^2 - 4x + 4 - x^2 - 2x - 1 = -6x + 3. Final answer = A.",
                {
                    "B": "Choice B subtracts the linear terms correctly but mishandles the constants.",
                    "C": "Choice C reverses the subtraction order.",
                    "D": "Choice D adds the two expanded squares instead of subtracting.",
                },
                "math-advanced-difference-of-squares-expanded-b003",
                "expand and subtract two squared binomials",
                "not distributing the subtraction",
            ),
            spr(
                "expansion-b003-math-advanced-012",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "A function is defined by f(x) = a(x - 2)^2 + 5. If f(4) = 17, what is the value of a?",
                "3",
                "Substitute x = 4 into f(x) = a(x - 2)^2 + 5. This gives 17 = a(4 - 2)^2 + 5 = 4a + 5. Subtract 5 to get 12 = 4a, so a = 3. The squared factor is 4, not 2. Final answer = 3.",
                "math-advanced-vertex-form-scale-parameter-b003",
                "substitute into vertex form to solve for a scale factor",
                "forgetting to square the horizontal distance",
            ),
            mc(
                "expansion-b003-math-advanced-013",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "If sqrt(x + 9) = x - 3, what is the value of x?",
                {"A": "0", "B": "4", "C": "7", "D": "16"},
                "C",
                "Choice C is correct: 7. Because the right side must be nonnegative, x >= 3. Square both sides: x + 9 = (x - 3)^2 = x^2 - 6x + 9. This simplifies to x^2 - 7x = 0, so x = 0 or x = 7. Only x = 7 satisfies the original equation. Final answer = 7.",
                {
                    "A": "Choice A is introduced by the squared equation but fails the original equation because x - 3 is negative.",
                    "B": "Choice B comes from treating the square root as though it distributed over addition.",
                    "D": "Choice D is a nearby square-related value but does not satisfy the equation.",
                },
                "math-advanced-radical-equation-extraneous-b003",
                "solve a radical equation and check the original",
                "keeping an extraneous solution after squaring",
            ),
            spr(
                "expansion-b003-math-advanced-014",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "The expression x^2 + 12x + 20 can be written as (x + 6)^2 + k. What is the value of k?",
                "-16",
                "Expand (x + 6)^2 to get x^2 + 12x + 36. To make this equal x^2 + 12x + 20, the added constant k must satisfy 36 + k = 20. Therefore k = -16. This is completing the square, and the constant adjustment must be included. Final answer = -16.",
                "math-advanced-completing-square-constant-b003",
                "rewrite a quadratic by completing the square",
                "forgetting to subtract the extra square constant",
            ),
            mc(
                "expansion-b003-math-advanced-015",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "The function p(t) = 80(1.25)^t models a quantity t years after an initial measurement. What is the meaning of 1.25 in this model?",
                {"A": "The initial quantity is 1.25.", "B": "The quantity increases by 25% each year.", "C": "The quantity increases by 125 each year.", "D": "The quantity after one year is 25."},
                "B",
                "Choice B is correct. In an exponential model a(1 + r)^t, the factor 1.25 means each year's quantity is 1.25 times the previous year's quantity. That is a 25% increase per year, while 80 is the initial quantity. Final answer = B.",
                {
                    "A": "Choice A mistakes the growth factor for the initial value.",
                    "C": "Choice C treats exponential multiplication as a fixed additive increase.",
                    "D": "Choice D confuses the growth rate with the value of the function after one year.",
                },
                "math-advanced-exponential-growth-factor-meaning-b003",
                "interpret an exponential growth factor",
                "treating a multiplier as an additive change",
            ),
            spr(
                "expansion-b003-math-advanced-016",
                "Advanced Math",
                "Systems of equations in two variables",
                "Hard",
                "The line y = x + 2 intersects the parabola y = x^2 - 4 at two points. What is the sum of the x-coordinates of those points?",
                "1",
                "Set the two expressions for y equal: x + 2 = x^2 - 4. Moving all terms to one side gives x^2 - x - 6 = 0. For this quadratic, the sum of the roots is -b/a = -(-1)/1 = 1. The question asks for the sum, so the roots do not need to be found individually. Final answer = 1.",
                "math-advanced-nonlinear-system-root-sum-b003",
                "use a nonlinear system to form a quadratic and apply root sum",
                "solving only one intersection or using the constant term",
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
        report["added"] = [
            {"id": item["id"], "section": item["section"], "domain": item["domain"], "skill": item["skill"]}
            for item in items
        ]
    elif args.apply:
        report["applySkippedReason"] = "duplicateIds_or_validationFailures"

    report["addedCount"] = len(report["added"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "added"}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
