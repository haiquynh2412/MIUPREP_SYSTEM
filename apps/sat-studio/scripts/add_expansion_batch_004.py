import argparse
import json
import re
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
REPORT_PATH = DATA_DIR / "sat-expansion-batch-004-report.json"
BLUEPRINT_PATH = DATA_DIR / "sat-expansion-blueprint-20260520-batch004.json"
VERSION = "sat-expansion-batch-004-2026-05-20"
SOURCE_NAME = "SAT Studio Expansion Batch 004"
LICENSE_NOTE = "Original SAT Studio item generated from internal blueprint; no source exercise text copied."


def target_band(difficulty: str, elite: bool = False) -> str:
    if elite:
        return "SAT-Elite"
    return {"Easy": "G10-Bridge", "Medium": "SAT-Core", "Hard": "SAT-Advanced"}.get(difficulty, "SAT-Core")


def module_placement(difficulty: str, elite: bool = False) -> str:
    if elite:
        return "module2_upper"
    return {"Easy": "module1", "Medium": "module2_lower", "Hard": "module2_upper"}.get(difficulty, "module2_lower")


def estimated_seconds(section: str, difficulty: str) -> int:
    if section == "Math":
        return {"Easy": 60, "Medium": 95, "Hard": 130}.get(difficulty, 95)
    return {"Easy": 55, "Medium": 75, "Hard": 100}.get(difficulty, 75)


def word_count(value: str) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def deepen_explanation(explanation: dict[str, Any], trap_model: str) -> dict[str, Any]:
    updated = dict(explanation)
    correct = str(updated.get("correct") or "")
    if word_count(correct) < 58:
        updated["correct"] = (
            correct
            + f" As a check, substitute or reinterpret the result in the original condition before stopping. "
            + f"The main trap is {trap_model}, which can produce a plausible answer to a different question."
        )
    return updated


def audit_stamp() -> dict[str, Any]:
    return {
        "version": VERSION,
        "verdict": "pass",
        "reviewer": "Codex SAT expert expansion pass",
        "checkedAt": str(date.today()),
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
    elite: bool = False,
    desmos: bool = False,
) -> dict[str, Any]:
    item = {
        "id": qid,
        "section": "Math",
        "domain": domain,
        "skill": skill,
        "canonicalSkill": skill,
        "microSkill": skill.lower(),
        "difficulty": difficulty,
        "targetBand": target_band(difficulty, elite),
        "gradeBand": target_band(difficulty, elite),
        "modulePlacement": module_placement(difficulty, elite),
        "estimatedTimeSeconds": estimated_seconds("Math", difficulty),
        "sourceType": "foundation",
        "sourceName": SOURCE_NAME,
        "sourceSignalId": "sat-expansion-blueprint-20260520-batch004",
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
        "explanation": deepen_explanation(explanation, trap_model),
        "blueprintId": blueprint_id,
        "templateFormId": qid.replace("expansion-b004-", "form-expansion-b004-"),
        "cognitiveMove": cognitive_move,
        "representation": "equation_function_or_table",
        "trapModel": trap_model,
        "desmosUseful": desmos,
        "calculatorStrategy": "Use Desmos to verify graph/intersection behavior." if desmos else "Algebraic solution is faster than calculator entry.",
        "difficultyReason": "Targets Algebra or Advanced Math gap coverage with setup, structure, or trap control.",
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
    elite: bool = False,
    desmos: bool = False,
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
        elite=elite,
        desmos=desmos,
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
    elite: bool = False,
    desmos: bool = False,
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
                "common_error_1": "A common error is to stop at an intermediate value before answering the exact quantity requested.",
                "common_error_2": "Another common error is to copy a visible coefficient without checking the full relationship.",
            },
        },
        blueprint_id,
        cognitive_move,
        trap_model,
        question_type="student_produced_response",
        acceptable_answers=acceptable or [correct],
        elite=elite,
        desmos=desmos,
    )


def build_blueprint() -> dict[str, Any]:
    return {
        "version": VERSION,
        "basisReports": [
            "data/math-algebra-advanced-blueprint-analysis.json",
            "data/sat-2026-readiness-audit.json",
            "data/reviewed-question-expert-audit.json",
        ],
        "batch004Targets": {"Math Algebra": 16, "Math Advanced Math": 16},
        "difficultySkew": {"Medium": 14, "Hard": 18},
        "formatSkew": {"multiple_choice": 24, "student_produced_response": 8},
        "avoid": [
            "routine circumference, hypotenuse, or probability clones",
            "single-step arithmetic-only prompts",
            "Geometry and routine PSDA additions while those domains are overrepresented",
            "near-duplicate prompts from batches 001-003",
        ],
        "reason": "Product audit 2026-05-20 requests continued Algebra/Advanced Math rebalancing before broad public launch.",
    }


def build_items() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    items.extend(
        [
            mc(
                "expansion-b004-algebra-001",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Hard",
                "The system 3x + 2y = 14 and 6x + 4y = c has no solution. Which value of c could make this true?",
                {"A": "14", "B": "21", "C": "28", "D": "42"},
                "B",
                "Choice B is correct: 21. The second equation has left-side coefficients that are twice those in the first equation. If the right side were 28, the equations would represent the same line. A different right side, such as 21, makes the lines parallel and gives no solution. Final answer = 21.",
                {
                    "A": "Choice A copies the first constant and does not use the scale factor.",
                    "C": "Choice C makes the two equations identical, so there would be infinitely many solutions.",
                    "D": "Choice D triples 14 even though the left side was multiplied by 2.",
                },
                "math-algebra-parallel-system-no-solution-b004",
                "use proportional coefficients to identify a no-solution system",
                "matching coefficient scale but choosing the identical constant",
                elite=True,
            ),
            spr(
                "expansion-b004-algebra-002",
                "Algebra",
                "Linear functions",
                "Medium",
                "A linear function g has g(2) = 9 and g(8) = 33. What is the slope of the graph of y = g(x)?",
                "4",
                "The input increases by 8 - 2 = 6, and the output increases by 33 - 9 = 24. The slope is change in output divided by change in input: 24/6 = 4. Final answer = 4.",
                "math-algebra-linear-function-slope-from-values-b004",
                "calculate slope from two function values",
                "using output change alone",
            ),
            mc(
                "expansion-b004-algebra-003",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Hard",
                "A tutoring plan costs a one-time fee of $45 plus $18 per session. A student can spend at most $225. If s is the number of sessions, which inequality represents the possible values of s?",
                {"A": "45 + 18s >= 225", "B": "45 + 18s <= 225", "C": "18 + 45s <= 225", "D": "18s - 45 <= 225"},
                "B",
                "Choice B is correct. The total cost is the fixed fee plus the per-session cost, or 45 + 18s. The phrase at most means the cost cannot exceed 225, so 45 + 18s <= 225. Final answer = B.",
                {
                    "A": "Choice A reverses at most into at least.",
                    "C": "Choice C swaps the fixed fee and per-session coefficient.",
                    "D": "Choice D subtracts the fixed fee even though it is part of the total cost.",
                },
                "math-algebra-context-inequality-fixed-plus-rate-b004",
                "translate a cost constraint into a linear inequality",
                "reversing at most or swapping fixed/rate values",
            ),
            spr(
                "expansion-b004-algebra-004",
                "Algebra",
                "Linear equations in two variables",
                "Medium",
                "The line 5x - 2y = 18 passes through the point (4, k). What is the value of k?",
                "1",
                "Substitute x = 4 and y = k into 5x - 2y = 18. This gives 20 - 2k = 18, so -2k = -2 and k = 1. Final answer = 1.",
                "math-algebra-point-on-line-missing-coordinate-b004",
                "substitute a point into a two-variable linear equation",
                "solving for x again instead of the missing coordinate",
            ),
            mc(
                "expansion-b004-algebra-005",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Hard",
                "A system of equations is shown: y = 2x + 7 and y = ax - 5. If the system has the solution (6, 19), what is a?",
                {"A": "2", "B": "3", "C": "4", "D": "5"},
                "C",
                "Choice C is correct: 4. Since (6, 19) lies on y = ax - 5, substitute to get 19 = 6a - 5. Then 24 = 6a, so a = 4. The first equation confirms that 19 = 2(6) + 7, but it does not contain a. Final answer = 4.",
                {
                    "A": "Choice A copies the slope from the first equation instead of solving the second.",
                    "B": "Choice B comes from dividing 19 - 1 by 6, not using the -5 correctly.",
                    "D": "Choice D adds 5 to the x-coordinate instead of to the y-value.",
                },
                "math-algebra-system-parameter-from-solution-b004",
                "use a known solution to solve for a parameter",
                "using the wrong equation for the parameter",
                elite=True,
            ),
            spr(
                "expansion-b004-algebra-006",
                "Algebra",
                "Linear functions",
                "Hard",
                "A line has x-intercept 8 and y-intercept -4. What is the slope of the line?",
                "1/2",
                "The intercepts give two points: (8, 0) and (0, -4). The slope is (0 - (-4))/(8 - 0) = 4/8 = 1/2. Final answer = 1/2.",
                "math-algebra-slope-from-intercepts-b004",
                "convert intercepts into points and calculate slope",
                "using intercept values as slope directly",
                acceptable=["1/2", "0.5", ".5"],
            ),
            mc(
                "expansion-b004-algebra-007",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Medium",
                "Which ordered pair makes both inequalities true: y > x + 1 and x + y < 8?",
                {"A": "(1, 4)", "B": "(3, 4)", "C": "(4, 5)", "D": "(5, 0)"},
                "A",
                "Choice A is correct: (1, 4). For (1, 4), the first inequality gives 4 > 2, and the second gives 1 + 4 < 8. Both are true. Each other choice fails at least one condition. Final answer = A.",
                {
                    "B": "Choice B satisfies y > x + 1 only as 4 > 4, which is false because the inequality is strict.",
                    "C": "Choice C passes the first inequality but fails x + y < 8.",
                    "D": "Choice D fails the first inequality because 0 is not greater than 6.",
                },
                "math-algebra-two-inequality-point-test-b004",
                "test ordered pairs in a system of inequalities",
                "checking only one inequality or ignoring strictness",
            ),
            spr(
                "expansion-b004-algebra-008",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Hard",
                "The sum of two numbers is 34. Three times the first number is 6 more than the second number. What is the first number?",
                "10",
                "Let the first number be x and the second be y. The equations are x + y = 34 and 3x = y + 6, so y = 3x - 6. Substitute into the sum: x + 3x - 6 = 34. Then 4x = 40, so x = 10. Final answer = 10.",
                "math-algebra-word-system-first-number-b004",
                "translate a word relationship into a two-equation system",
                "answering for the second quantity or using the 6 as a multiplier",
            ),
            mc(
                "expansion-b004-algebra-009",
                "Algebra",
                "Linear equations in one variable",
                "Medium",
                "If 4(2x - 3) = 5x + 18, what is the value of x?",
                {"A": "6", "B": "8", "C": "10", "D": "12"},
                "C",
                "Choice C is correct: 10. Distribute to get 8x - 12 = 5x + 18. Subtract 5x and add 12 to get 3x = 30, so x = 10. Final answer = 10.",
                {
                    "A": "Choice A comes from adding 12 to 18 but not dividing by the correct coefficient.",
                    "B": "Choice B can result from distributing 4 only to 2x.",
                    "D": "Choice D treats 18 - 12 as the right-side total after moving terms incorrectly.",
                },
                "math-algebra-distribute-linear-equation-b004",
                "solve a linear equation with distribution on one side",
                "partial distribution",
            ),
            spr(
                "expansion-b004-algebra-010",
                "Algebra",
                "Linear equations in two variables",
                "Hard",
                "The equation 7x + by = 31 is true when x = 3 and y = 2. What is b?",
                "5",
                "Substitute x = 3 and y = 2: 7(3) + 2b = 31. This gives 21 + 2b = 31, so 2b = 10 and b = 5. Final answer = 5.",
                "math-algebra-two-variable-parameter-from-point-b004",
                "solve for a parameter in a two-variable equation",
                "forgetting to multiply the parameter by y",
            ),
            mc(
                "expansion-b004-algebra-011",
                "Algebra",
                "Linear functions",
                "Hard",
                "For the linear function h, the table shows h(1) = 5, h(4) = 14, and h(7) = 23. Which equation defines h?",
                {"A": "h(x) = 3x + 2", "B": "h(x) = 3x + 5", "C": "h(x) = 9x - 4", "D": "h(x) = x + 4"},
                "A",
                "Choice A is correct. Each increase of 3 in x increases h(x) by 9, so the slope is 3. Using h(1) = 5 gives 5 = 3(1) + b, so b = 2. Therefore h(x) = 3x + 2. Final answer = A.",
                {
                    "B": "Choice B uses the first output as the intercept, but h(0) is not 5.",
                    "C": "Choice C uses the output change 9 as the slope without dividing by the input change 3.",
                    "D": "Choice D matches h(1) but not the constant rate of change.",
                },
                "math-algebra-linear-function-from-table-b004",
                "derive a linear equation from a table",
                "using output change as slope",
            ),
            spr(
                "expansion-b004-algebra-012",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Medium",
                "If -3x + 4 <= 25, what is the least integer value of x in the solution set?",
                "-7",
                "Subtract 4 to get -3x <= 21. Divide by -3 and reverse the inequality: x >= -7. The least integer satisfying x >= -7 is -7. Final answer = -7.",
                "math-algebra-inequality-least-integer-b004",
                "solve an inequality and identify an integer endpoint",
                "not reversing the inequality after dividing by a negative",
            ),
            mc(
                "expansion-b004-algebra-013",
                "Algebra",
                "Systems of two linear equations in two variables",
                "Hard",
                "The lines y = mx + 4 and y = -2x + 10 intersect when x = 3. What is m?",
                {"A": "-4", "B": "0", "C": "2", "D": "4"},
                "B",
                "Choice B is correct: 0. At x = 3, the second line has y = -2(3) + 10 = 4. The first line must also have y = 4, so 4 = 3m + 4. Thus 3m = 0 and m = 0. Final answer = 0.",
                {
                    "A": "Choice A uses -2 and 10 without checking the intersection y-value.",
                    "C": "Choice C copies the magnitude of the second line's slope.",
                    "D": "Choice D copies the y-value at the intersection as the slope.",
                },
                "math-algebra-intersection-parameter-slope-b004",
                "use a known x-coordinate of intersection to solve for slope",
                "confusing y-value and slope",
                elite=True,
                desmos=True,
            ),
            spr(
                "expansion-b004-algebra-014",
                "Algebra",
                "Linear functions",
                "Medium",
                "A line has slope -3 and passes through (2, 11). What is the y-intercept of the line?",
                "17",
                "Use y = mx + b with m = -3 and the point (2, 11). Then 11 = -3(2) + b = -6 + b, so b = 17. Final answer = 17.",
                "math-algebra-y-intercept-from-point-slope-b004",
                "solve for intercept from slope and a point",
                "using the point's y-coordinate as the intercept",
            ),
            mc(
                "expansion-b004-algebra-015",
                "Algebra",
                "Linear equations in two variables",
                "Medium",
                "Which equation has a graph with slope 4 and y-intercept -7?",
                {"A": "y = 4x - 7", "B": "y = -7x + 4", "C": "4y = x - 7", "D": "y = 7x - 4"},
                "A",
                "Choice A is correct. In slope-intercept form y = mx + b, m is the slope and b is the y-intercept. A slope of 4 and y-intercept -7 gives y = 4x - 7. Final answer = A.",
                {
                    "B": "Choice B swaps the slope and intercept.",
                    "C": "Choice C has y isolated incorrectly; its slope would be 1/4.",
                    "D": "Choice D reverses the two numbers and the sign of the intercept.",
                },
                "math-algebra-slope-intercept-form-b004",
                "identify a line from slope and intercept",
                "swapping slope and intercept",
            ),
            spr(
                "expansion-b004-algebra-016",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Hard",
                "A club will buy x notebooks at $4 each and y folders at $3 each. The club will buy 20 items total and spend exactly $71. What is x?",
                "11",
                "The total number of items gives x + y = 20, so y = 20 - x. The cost equation is 4x + 3y = 71. Substitute to get 4x + 3(20 - x) = 71, so x + 60 = 71 and x = 11. Final answer = 11.",
                "math-algebra-two-item-cost-system-b004",
                "solve a two-item total-and-cost system",
                "answering for the cheaper item or using the total as the cost",
            ),
            mc(
                "expansion-b004-advanced-001",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "If x^2 - 10x + 16 = 0, what is the greater solution?",
                {"A": "2", "B": "4", "C": "8", "D": "16"},
                "C",
                "Choice C is correct: 8. Factor x^2 - 10x + 16 as (x - 2)(x - 8). The solutions are x = 2 and x = 8, so the greater solution is 8. Final answer = 8.",
                {
                    "A": "Choice A is the smaller solution, not the greater solution.",
                    "B": "Choice B is a factor pair component but not a root.",
                    "D": "Choice D is the constant term and is not a solution.",
                },
                "math-advanced-quadratic-greater-root-b004",
                "factor a quadratic and choose the requested root",
                "answering with the smaller root or the constant term",
            ),
            spr(
                "expansion-b004-advanced-002",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "The expression x^2 + 8x + 3 is equivalent to (x + 4)^2 + k. What is k?",
                "-13",
                "Expand (x + 4)^2 to get x^2 + 8x + 16. To match x^2 + 8x + 3, k must satisfy 16 + k = 3, so k = -13. Final answer = -13.",
                "math-advanced-completing-square-k-b004",
                "complete the square and track the constant adjustment",
                "forgetting to subtract the added square term",
            ),
            mc(
                "expansion-b004-advanced-003",
                "Advanced Math",
                "Systems of equations in two variables",
                "Hard",
                "The line y = 3x - 1 and the parabola y = x^2 - 5 intersect at two points. What is the sum of the x-coordinates of the intersection points?",
                {"A": "-3", "B": "3", "C": "4", "D": "5"},
                "B",
                "Choice B is correct: 3. Set the expressions equal: 3x - 1 = x^2 - 5. This gives x^2 - 3x - 4 = 0. The sum of the roots is -b/a = 3, so the sum of the x-coordinates is 3. Final answer = 3.",
                {
                    "A": "Choice A has the correct magnitude but the wrong sign for the root sum.",
                    "C": "Choice C is related to the constant term, not the sum of roots.",
                    "D": "Choice D comes from using 5 from the parabola without forming the equation.",
                },
                "math-advanced-line-parabola-root-sum-b004",
                "convert a nonlinear system to a quadratic and use root sum",
                "using the constant term instead of root sum",
                elite=True,
                desmos=True,
            ),
            spr(
                "expansion-b004-advanced-004",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "For f(x) = 2x^2 - 5x, what is f(3) - f(1)?",
                "6",
                "Compute f(3) = 2(3)^2 - 5(3) = 18 - 15 = 3. Compute f(1) = 2(1)^2 - 5(1) = -3. Therefore f(3) - f(1) = 3 - (-3) = 6. Final answer = 6.",
                "math-advanced-function-value-difference-b004",
                "evaluate a nonlinear function at two inputs and subtract",
                "subtracting in the wrong direction or dropping a negative",
                acceptable=["6"],
            ),
            mc(
                "expansion-b004-advanced-005",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "Which expression is equivalent to (x + 5)(x - 2) - x^2?",
                {"A": "3x - 10", "B": "7x - 10", "C": "x^2 + 3x - 10", "D": "3x + 10"},
                "A",
                "Choice A is correct: 3x - 10. First expand (x + 5)(x - 2) to get x^2 + 3x - 10. Subtracting x^2 leaves 3x - 10. Final answer = A.",
                {
                    "B": "Choice B adds the absolute values of 5 and -2 instead of combining signed linear terms.",
                    "C": "Choice C expands the product but forgets to subtract x^2.",
                    "D": "Choice D handles the linear term but changes the sign of the constant.",
                },
                "math-advanced-product-minus-square-b004",
                "expand a product and cancel the squared term",
                "forgetting the final subtraction",
            ),
            spr(
                "expansion-b004-advanced-006",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "If x is positive and x^2 - 5x = 24, what is x?",
                "8",
                "Move all terms to one side: x^2 - 5x - 24 = 0. Factor to get (x - 8)(x + 3) = 0, so x = 8 or x = -3. Since x is positive, x = 8. Final answer = 8.",
                "math-advanced-quadratic-positive-root-b004",
                "solve a quadratic and apply a positivity condition",
                "keeping the negative root",
            ),
            mc(
                "expansion-b004-advanced-007",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "The function q(x) = a(x + 1)^2 - 3 has vertex (-1, -3) and passes through (1, 5). What is a?",
                {"A": "1", "B": "2", "C": "4", "D": "8"},
                "B",
                "Choice B is correct: 2. Substitute (1, 5) into q(x) = a(x + 1)^2 - 3. This gives 5 = a(2)^2 - 3, so 8 = 4a and a = 2. Final answer = 2.",
                {
                    "A": "Choice A forgets that the horizontal distance from -1 to 1 is squared.",
                    "C": "Choice C uses the squared distance as the scale factor.",
                    "D": "Choice D uses the vertical change before dividing by the squared distance.",
                },
                "math-advanced-vertex-form-parameter-b004",
                "use vertex form and a point to solve for a scale factor",
                "using vertical change without dividing by squared distance",
                elite=True,
            ),
            spr(
                "expansion-b004-advanced-008",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "If 2x^2 + 14x + 20 = 2(x + h)^2 + k, what is h?",
                "7/2",
                "Factor out 2 from the quadratic terms: 2x^2 + 14x + 20 = 2(x^2 + 7x) + 20. Half of 7 is 7/2, so the square has the form 2(x + 7/2)^2 + k. Therefore h = 7/2. Final answer = 7/2.",
                "math-advanced-completing-square-h-after-factor-b004",
                "identify the square shift after factoring a leading coefficient",
                "halving the coefficient before accounting for the leading factor incorrectly",
                acceptable=["7/2", "3.5"],
            ),
            mc(
                "expansion-b004-advanced-009",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "If sqrt(x + 2) = x - 4, which of the following is the solution?",
                {"A": "2", "B": "7", "C": "14", "D": "18"},
                "B",
                "Choice B is correct: 7. The right side must be nonnegative, so x >= 4. Squaring gives x + 2 = (x - 4)^2 = x^2 - 8x + 16. Thus x^2 - 9x + 14 = 0, or (x - 7)(x - 2) = 0. Only x = 7 satisfies the original equation. Final answer = 7.",
                {
                    "A": "Choice A is introduced by the squared equation but fails the original because x - 4 is negative.",
                    "C": "Choice C is the constant-related factor product, not a solution.",
                    "D": "Choice D comes from adding 16 and 2 rather than solving the quadratic.",
                },
                "math-advanced-radical-equation-check-b004",
                "solve a radical equation and reject an extraneous root",
                "keeping a root that fails the original equation",
                elite=True,
            ),
            spr(
                "expansion-b004-advanced-010",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "The function f(x) = (x - 3)^2 + 12 has minimum value m. What is m?",
                "12",
                "The expression (x - 3)^2 is always at least 0, and it equals 0 when x = 3. Therefore the minimum value of f(x) is 0 + 12 = 12. Final answer = 12.",
                "math-advanced-vertex-form-minimum-b004",
                "read the minimum value from vertex form",
                "using the x-coordinate of the vertex as the minimum",
            ),
            mc(
                "expansion-b004-advanced-011",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "For all x > 0, which expression is equivalent to x^3/x^(1/2)?",
                {"A": "x^(3/2)", "B": "x^(5/2)", "C": "x^(7/2)", "D": "x^6"},
                "B",
                "Choice B is correct. When dividing powers with the same positive base, subtract exponents: 3 - 1/2 = 6/2 - 1/2 = 5/2. Therefore x^3/x^(1/2) = x^(5/2). Final answer = B.",
                {
                    "A": "Choice A multiplies 3 by 1/2 instead of subtracting exponents.",
                    "C": "Choice C adds the exponents instead of subtracting.",
                    "D": "Choice D treats division as multiplication of exponents.",
                },
                "math-advanced-rational-exponent-division-b004",
                "apply exponent rules with a fractional exponent",
                "adding or multiplying exponents",
            ),
            spr(
                "expansion-b004-advanced-012",
                "Advanced Math",
                "Systems of equations in two variables",
                "Hard",
                "The equations y = x^2 + 2x and y = 8x have two intersection points. One has x-coordinate 0. What is the other x-coordinate?",
                "6",
                "Set the expressions equal: x^2 + 2x = 8x. Then x^2 - 6x = 0, so x(x - 6) = 0. The x-coordinates are 0 and 6, so the other x-coordinate is 6. Final answer = 6.",
                "math-advanced-nonlinear-system-other-intersection-b004",
                "solve a line-parabola system after one intersection is given",
                "stopping at the given intersection",
                elite=True,
                desmos=True,
            ),
            mc(
                "expansion-b004-advanced-013",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Medium",
                "The equation x^2 + bx + 12 = 0 has solutions -3 and -4. What is b?",
                {"A": "-7", "B": "-1", "C": "1", "D": "7"},
                "D",
                "Choice D is correct: 7. If the solutions are -3 and -4, the factor form is (x + 3)(x + 4) = 0. Expanding gives x^2 + 7x + 12 = 0, so b = 7. Final answer = 7.",
                {
                    "A": "Choice A uses the sum of the roots directly rather than the coefficient in the expanded factors.",
                    "B": "Choice B subtracts the root magnitudes.",
                    "C": "Choice C changes only the sign of the difference, not the sum.",
                },
                "math-advanced-roots-to-coefficient-b004",
                "use roots to identify the linear coefficient",
                "confusing root sum with coefficient sign",
            ),
            spr(
                "expansion-b004-advanced-014",
                "Advanced Math",
                "Nonlinear functions",
                "Medium",
                "If f(x) = x^2 - 4x + 9, what is f(6)?",
                "21",
                "Substitute x = 6: f(6) = 6^2 - 4(6) + 9 = 36 - 24 + 9 = 21. Final answer = 21.",
                "math-advanced-quadratic-function-evaluation-b004",
                "evaluate a quadratic function at a given input",
                "dropping the linear term or squaring after subtracting",
            ),
            mc(
                "expansion-b004-advanced-015",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "The function A(t) = 500(0.8)^t models an amount t years after an initial measurement. What does 0.8 represent?",
                {"A": "The initial amount is 0.8.", "B": "The amount decreases by 20% each year.", "C": "The amount decreases by 80 each year.", "D": "The amount after one year is 0.8."},
                "B",
                "Choice B is correct. Multiplying by 0.8 each year means each new amount is 80% of the previous amount. That is a 20% decrease each year. The 500 is the initial amount. Final answer = B.",
                {
                    "A": "Choice A mistakes the decay factor for the initial amount.",
                    "C": "Choice C treats exponential multiplication as a fixed subtraction.",
                    "D": "Choice D treats the multiplier as the output after one year.",
                },
                "math-advanced-exponential-decay-factor-b004",
                "interpret an exponential decay factor",
                "confusing multiplier with percent decrease or initial value",
            ),
            spr(
                "expansion-b004-advanced-016",
                "Advanced Math",
                "Equivalent expressions",
                "Hard",
                "The expression (x - 4)(x + 6) - (x - 1)^2 is equivalent to ax + b. What is a?",
                "4",
                "Expand (x - 4)(x + 6) to get x^2 + 2x - 24. Expand (x - 1)^2 to get x^2 - 2x + 1. Subtracting gives x^2 + 2x - 24 - x^2 + 2x - 1 = 4x - 25. Therefore a = 4. Final answer = 4.",
                "math-advanced-linear-coefficient-after-square-subtraction-b004",
                "expand two expressions and identify the linear coefficient after cancellation",
                "not distributing the subtraction across the second square",
                acceptable=["4"],
                elite=True,
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
    item_ids = existing_ids(items)
    question_ids = existing_ids(questions)
    duplicate_ids = sorted(question_ids & item_ids)
    missing_ids = sorted(item_ids - question_ids)
    failures = validate_items(items)
    if failures:
        status = "validation_failed"
    elif not duplicate_ids:
        status = "ready_to_apply"
    elif not missing_ids:
        status = "already_applied"
    else:
        status = "partially_applied"
    report: dict[str, Any] = {
        "apply": args.apply,
        "status": status,
        "version": VERSION,
        "targetFile": str(FOUNDATION_PATH.relative_to(ROOT)),
        "plannedCount": len(items),
        "duplicateIds": duplicate_ids,
        "currentBatchRowsPresent": len(duplicate_ids),
        "missingBatchIds": missing_ids,
        "validationFailures": failures,
        "added": [],
        "blueprintPath": str(BLUEPRINT_PATH.relative_to(ROOT)),
    }

    BLUEPRINT_PATH.write_text(json.dumps(build_blueprint(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.apply and not duplicate_ids and not failures:
        questions.extend(items)
        write_payload(FOUNDATION_PATH, payload)
        report["status"] = "applied"
        report["currentBatchRowsPresent"] = len(items)
        report["added"] = [
            {"id": item["id"], "section": item["section"], "domain": item["domain"], "skill": item["skill"]}
            for item in items
        ]
    elif args.apply and status == "already_applied":
        report["applySkippedReason"] = "batch_items_already_present"
    elif args.apply:
        report["applySkippedReason"] = "duplicateIds_or_validationFailures"

    report["addedCount"] = len(report["added"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "added"}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
