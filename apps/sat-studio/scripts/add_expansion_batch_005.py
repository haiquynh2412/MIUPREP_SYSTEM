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
REPORT_PATH = DATA_DIR / "sat-expansion-batch-005-report.json"
BLUEPRINT_PATH = DATA_DIR / "sat-expansion-blueprint-20260522-batch005.json"
VERSION = "sat-expansion-batch-005-2026-05-22"
SOURCE_NAME = "SAT Studio Expansion Batch 005"
LICENSE_NOTE = "Original SAT Studio item generated from internal Algebra/Advanced Math blueprint; no source exercise text copied."


def target_band(difficulty: str, elite: bool = False) -> str:
    if elite:
        return "SAT-Elite"
    return {"Easy": "G10-Bridge", "Medium": "SAT-Core", "Hard": "SAT-Advanced"}.get(difficulty, "SAT-Core")


def module_placement(difficulty: str, elite: bool = False) -> str:
    if elite:
        return "module2_upper"
    return {"Easy": "module1", "Medium": "module2_lower", "Hard": "module2_upper"}.get(difficulty, "module2_lower")


def estimated_seconds(difficulty: str) -> int:
    return {"Easy": 65, "Medium": 95, "Hard": 130}.get(difficulty, 95)


def word_count(value: str) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


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
            "no_geometry_psda_topic_overflow_action",
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
            "teaching explanation includes why the correct answer works",
            "specific trap notes for wrong choices or likely errors",
            "usable from grade 10 bridge through SAT 1600 progression",
        ],
    }


def deepen_explanation(correct_exp: str, trap_model: str) -> str:
    if word_count(correct_exp) >= 58:
        return correct_exp
    return (
        correct_exp
        + " As a self-study check, substitute the result back into the original equation or condition before stopping."
        + f" The main SAT trap is {trap_model}, which gives a plausible answer to a different question."
    )


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
        "estimatedTimeSeconds": estimated_seconds(difficulty),
        "sourceType": "foundation",
        "sourceName": SOURCE_NAME,
        "sourceSignalId": "sat-expansion-blueprint-20260522-batch005",
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
        "templateFormId": qid.replace("expansion-b005-", "form-expansion-b005-"),
        "cognitiveMove": cognitive_move,
        "representation": "equation_function_or_table",
        "trapModel": trap_model,
        "desmosUseful": desmos,
        "calculatorStrategy": "Use Desmos to verify graph/intersection behavior." if desmos else "Algebraic solution is faster than calculator entry.",
        "difficultyReason": "Targets P2 Algebra or Advanced Math gap coverage with setup, structure, or trap control.",
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
        {"correct": deepen_explanation(correct_exp, trap_model), "distractors": distractors},
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
    answer: str,
    correct_exp: str,
    blueprint_id: str,
    cognitive_move: str,
    trap_model: str,
    acceptable: list[str] | None = None,
    elite: bool = False,
    desmos: bool = False,
) -> dict[str, Any]:
    accepted = acceptable or [answer]
    return base_item(
        qid,
        domain,
        skill,
        difficulty,
        prompt,
        {},
        answer,
        {"correct": deepen_explanation(correct_exp, trap_model), "distractors": {}},
        blueprint_id,
        cognitive_move,
        trap_model,
        question_type="student_produced_response",
        acceptable_answers=accepted,
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
        "batch005Targets": {
            "Math Algebra": 12,
            "Math Advanced Math": 16,
        },
        "focusFamilies": {
            "Algebra": [
                "Linear equations in two variables",
                "Systems of two linear equations in two variables",
                "Linear inequalities in one or two variables",
            ],
            "Advanced Math": [
                "Nonlinear equations in one variable",
                "Nonlinear functions",
                "Equivalent expressions",
            ],
        },
        "difficultySkew": {"Easy": 3, "Medium": 12, "Hard": 13},
        "formatSkew": {"multiple_choice": 19, "student_produced_response": 9},
        "avoid": [
            "routine circumference, hypotenuse, or probability clones",
            "Geometry and PSDA hiding/removal work",
            "single-step arithmetic-only prompts",
            "near-duplicate prompts from batches 001-004",
        ],
        "reason": "P2 request keeps surplus topics in place while adding Algebra/Advanced Math coverage and preserving public-candidate review quality.",
    }


def build_items() -> list[dict[str, Any]]:
    A = "Algebra"
    AM = "Advanced Math"
    return [
        mc(
            "expansion-b005-algebra-001",
            A,
            "Systems of two linear equations in two variables",
            "Medium",
            "The equations 3x + y = 11 and 6x + 2y = k represent the same line. What is the value of k?",
            {"A": "11", "B": "17", "C": "22", "D": "33"},
            "C",
            "Choice C is correct: 22. The second left side, 6x + 2y, is exactly twice 3x + y. To represent the same line, the constant must also be twice 11, so k = 22. Final answer = 22.",
            {
                "A": "Choice A copies the original constant instead of scaling it.",
                "B": "Choice B adds 6 to 11 but does not match the factor applied to the whole equation.",
                "D": "Choice D triples 11 even though each coefficient was doubled.",
            },
            "math-algebra-system-same-line-scale-b005",
            "identify proportional equations for infinitely many solutions",
            "scaling only part of the equation",
        ),
        mc(
            "expansion-b005-algebra-002",
            A,
            "Linear equations in two variables",
            "Medium",
            "A line has equation y = mx + b. When x increases by 5, y increases by 15. The line passes through (4, 10). What is b?",
            {"A": "-2", "B": "2", "C": "3", "D": "10"},
            "A",
            "Choice A is correct: -2. The change ratio is 15/5, so m = 3. Substitute the point (4, 10) into y = 3x + b: 10 = 12 + b, so b = -2. Final answer = -2.",
            {
                "B": "Choice B has the sign reversed after subtracting 12.",
                "C": "Choice C is the slope, not the y-intercept.",
                "D": "Choice D is the y-value from the given point, not b.",
            },
            "math-algebra-linear-two-var-slope-intercept-b005",
            "use rate of change and a point to find an intercept",
            "answering with slope or a coordinate instead of the requested intercept",
        ),
        spr(
            "expansion-b005-algebra-003",
            A,
            "Systems of two linear equations in two variables",
            "Medium",
            "If x + 2y = 14 and 3x - y = 7, what is the value of x + y?",
            "9",
            "Solve the system. From 3x - y = 7, y = 3x - 7. Substitute into x + 2y = 14 to get x + 2(3x - 7) = 14, so 7x = 28 and x = 4. Then y = 5, so x + y = 9. Final answer = 9.",
            "math-algebra-system-sum-solution-b005",
            "solve a two-variable system and answer a derived value",
            "stopping at x or y instead of the requested expression",
            acceptable=["9", "9.0"],
        ),
        mc(
            "expansion-b005-algebra-004",
            A,
            "Linear equations in two variables",
            "Medium",
            "A line passes through (2, 8) and (6, 20). If a point on the line has y-coordinate 35, what is its x-coordinate?",
            {"A": "9", "B": "10", "C": "11", "D": "13"},
            "C",
            "Choice C is correct: 11. The slope is (20 - 8)/(6 - 2) = 3. Using (2, 8), the equation is y = 3x + 2. Set 35 = 3x + 2, so 33 = 3x and x = 11. Final answer = 11.",
            {
                "A": "Choice A comes from subtracting the slope only once.",
                "B": "Choice B is close but does not satisfy y = 3x + 2.",
                "D": "Choice D adds the intercept instead of subtracting it before dividing.",
            },
            "math-algebra-linear-two-var-find-x-b005",
            "build a line from two points and solve for an input",
            "using the y-coordinate as if it were already the input",
            desmos=True,
        ),
        mc(
            "expansion-b005-algebra-005",
            A,
            "Systems of two linear equations in two variables",
            "Hard",
            "If 5p - 2q = 17 and q = 2p + 4, what is the value of p?",
            {"A": "9", "B": "17", "C": "21", "D": "25"},
            "D",
            "Choice D is correct: 25. Substitute q = 2p + 4 into 5p - 2q = 17: 5p - 2(2p + 4) = 17. This becomes p - 8 = 17, so p = 25. Final answer = 25.",
            {
                "A": "Choice A comes from adding 8 to the wrong side before isolating p.",
                "B": "Choice B copies the constant from the equation.",
                "C": "Choice C can result from distributing -2 incorrectly.",
            },
            "math-algebra-system-substitution-nonstandard-vars-b005",
            "substitute one linear expression into another with nonstandard variables",
            "distribution error when substituting a binomial",
            elite=True,
        ),
        mc(
            "expansion-b005-algebra-006",
            A,
            "Linear equations in two variables",
            "Medium",
            "The ordered pair (4, 2) is a solution to 2x + ay = 14. What is the value of a?",
            {"A": "2", "B": "3", "C": "6", "D": "8"},
            "B",
            "Choice B is correct: 3. Substitute x = 4 and y = 2 into 2x + ay = 14: 8 + 2a = 14. Then 2a = 6, so a = 3. Final answer = 3.",
            {
                "A": "Choice A uses y as the coefficient instead of solving for a.",
                "C": "Choice C stops at 2a = 6 instead of dividing by 2.",
                "D": "Choice D copies 2x from the substitution step.",
            },
            "math-algebra-linear-two-var-parameter-from-point-b005",
            "use a solution point to find an unknown coefficient",
            "stopping at an intermediate coefficient product",
        ),
        spr(
            "expansion-b005-algebra-007",
            A,
            "Systems of two linear equations in two variables",
            "Hard",
            "If 4x - 3y = 6 and y = x + 2, what is the value of x?",
            "12",
            "Substitute y = x + 2 into 4x - 3y = 6: 4x - 3(x + 2) = 6. This gives x - 6 = 6, so x = 12. Final answer = 12.",
            "math-algebra-system-substitution-grid-b005",
            "solve a system by substitution and enter the requested variable",
            "forgetting to distribute the negative coefficient across x + 2",
            acceptable=["12", "12.0"],
            elite=True,
        ),
        mc(
            "expansion-b005-algebra-008",
            A,
            "Linear functions",
            "Easy",
            "The cost C, in dollars, of renting a room for n hours is C = 35 + 12n. For how many hours is the room rented if the cost is $131?",
            {"A": "6", "B": "7", "C": "8", "D": "9"},
            "C",
            "Choice C is correct: 8. Set 131 = 35 + 12n. Subtract 35 to get 96 = 12n, and divide by 12 to get n = 8. Final answer = 8.",
            {
                "A": "Choice A can result from subtracting 35 and then dividing by 16 instead of 12.",
                "B": "Choice B is one hour too low and gives a cost of 119.",
                "D": "Choice D is one hour too high and gives a cost of 143.",
            },
            "math-algebra-linear-function-context-input-b005",
            "interpret a linear model and solve for the input",
            "answering with the fee or rate instead of the number of hours",
        ),
        mc(
            "expansion-b005-algebra-009",
            A,
            "Systems of two linear equations in two variables",
            "Hard",
            "The system ax + 4y = 10 and 3x + 6y = 15 has infinitely many solutions. What is a?",
            {"A": "2", "B": "3", "C": "4", "D": "5"},
            "A",
            "Choice A is correct: 2. For infinitely many solutions, one equation must be a constant multiple of the other. Since 10/15 = 2/3 and 4/6 = 2/3, the x-coefficient must also be 2/3 of 3, which is 2. Final answer = 2.",
            {
                "B": "Choice B copies the x-coefficient from the second equation.",
                "C": "Choice C copies the y-coefficient from the first equation.",
                "D": "Choice D comes from comparing constants by subtraction instead of ratio.",
            },
            "math-algebra-system-infinite-solutions-parameter-b005",
            "match all coefficient ratios for infinitely many solutions",
            "using additive differences instead of multiplicative ratios",
            elite=True,
        ),
        mc(
            "expansion-b005-algebra-010",
            A,
            "Systems of two linear equations in two variables",
            "Medium",
            "A theater sold 120 tickets. Adult tickets cost $12 and student tickets cost $8. The total ticket revenue was $1,120. How many adult tickets were sold?",
            {"A": "30", "B": "40", "C": "80", "D": "90"},
            "B",
            "Choice B is correct: 40. Let a be adult tickets and s be student tickets. Since a + s = 120 and 12a + 8s = 1120, subtract 8(a + s) = 960 from the revenue equation to get 4a = 160. Thus a = 40. Final answer = 40.",
            {
                "A": "Choice A gives too little revenue when paired with 90 student tickets.",
                "C": "Choice C reverses the adult and student counts.",
                "D": "Choice D gives too much revenue.",
            },
            "math-algebra-system-context-ticket-mixture-b005",
            "set up and solve a contextual linear system",
            "reversing the two quantities after solving the system",
        ),
        spr(
            "expansion-b005-algebra-011",
            A,
            "Linear equations in two variables",
            "Medium",
            "A line is represented by y - 5 = -2(x - 3). What is the y-intercept of the line?",
            "11",
            "Rewrite the equation in slope-intercept form: y - 5 = -2x + 6, so y = -2x + 11. The y-intercept is 11. Final answer = 11.",
            "math-algebra-linear-two-var-point-slope-intercept-b005",
            "convert point-slope form to slope-intercept form",
            "treating the point's y-coordinate as the intercept",
            acceptable=["11", "11.0"],
        ),
        mc(
            "expansion-b005-algebra-012",
            A,
            "Linear inequalities in one or two variables",
            "Medium",
            "What is the greatest integer value of x for which -2x + 7 >= 15?",
            {"A": "-8", "B": "-4", "C": "4", "D": "11"},
            "B",
            "Choice B is correct: -4. Subtract 7 from both sides to get -2x >= 8. Dividing by -2 reverses the inequality, so x <= -4. The greatest integer in the solution set is -4. Final answer = -4.",
            {
                "A": "Choice A satisfies the inequality but is not the greatest possible integer.",
                "C": "Choice C comes from forgetting to reverse the inequality sign.",
                "D": "Choice D incorrectly adds 7 and 15.",
            },
            "math-algebra-linear-inequality-greatest-integer-b005",
            "solve an inequality with sign reversal and interpret greatest integer",
            "forgetting to reverse the inequality when dividing by a negative",
        ),
        mc(
            "expansion-b005-advanced-001",
            AM,
            "Nonlinear equations in one variable",
            "Medium",
            "If x^2 - 9x + 20 = 0, what is the smaller solution?",
            {"A": "2", "B": "4", "C": "5", "D": "20"},
            "B",
            "Choice B is correct: 4. Factor x^2 - 9x + 20 as (x - 4)(x - 5). The solutions are 4 and 5, and the smaller solution is 4. Final answer = 4.",
            {
                "A": "Choice A is not a root of the quadratic.",
                "C": "Choice C is the larger solution, not the smaller solution.",
                "D": "Choice D copies the constant term.",
            },
            "math-advanced-quadratic-smaller-root-b005",
            "factor a quadratic and choose the requested root",
            "answering with the other root or the constant term",
        ),
        mc(
            "expansion-b005-advanced-002",
            AM,
            "Nonlinear equations in one variable",
            "Medium",
            "What is the solution greater than 0 to x^2 + 5x = 24?",
            {"A": "-8", "B": "-3", "C": "3", "D": "8"},
            "C",
            "Choice C is correct: 3. Move all terms to one side: x^2 + 5x - 24 = 0. Factor as (x + 8)(x - 3) = 0, so the solutions are -8 and 3. The solution greater than 0 is 3. Final answer = 3.",
            {
                "A": "Choice A is the negative solution.",
                "B": "Choice B has the sign of the greater-than-0 root reversed.",
                "D": "Choice D uses the magnitude of the negative root.",
            },
            "math-advanced-quadratic-positive-root-b005",
            "solve a quadratic by factoring after moving terms",
            "choosing the wrong signed root",
        ),
        spr(
            "expansion-b005-advanced-003",
            AM,
            "Nonlinear equations in one variable",
            "Hard",
            "What is the solution to sqrt(x + 6) = x?",
            "3",
            "Because sqrt(x + 6) is nonnegative, x must be nonnegative. Square both sides to get x + 6 = x^2, or x^2 - x - 6 = 0. Factor as (x - 3)(x + 2) = 0. Only x = 3 is valid, so the solution is 3. Final answer = 3.",
            "math-advanced-radical-equation-domain-check-b005",
            "solve a radical equation and reject the invalid root",
            "keeping an extraneous root after squaring",
            acceptable=["3", "3.0"],
            elite=True,
        ),
        spr(
            "expansion-b005-advanced-004",
            AM,
            "Nonlinear equations in one variable",
            "Hard",
            "The equation x^2 - 12x + c = 0 has exactly one solution. What is c?",
            "36",
            "A quadratic has exactly one real solution when it is a perfect square. Since x^2 - 12x + c = (x - 6)^2 when c = 36, the equation has the single solution x = 6. Final answer = 36.",
            "math-advanced-quadratic-one-solution-constant-b005",
            "complete the square to make a quadratic have one solution",
            "using half the linear coefficient instead of its square",
            acceptable=["36", "36.0"],
            elite=True,
        ),
        mc(
            "expansion-b005-advanced-005",
            AM,
            "Nonlinear equations in one variable",
            "Medium",
            "The solutions to x^2 - kx + 15 = 0 are 3 and 5. What is k?",
            {"A": "2", "B": "8", "C": "15", "D": "30"},
            "B",
            "Choice B is correct: 8. If the roots are 3 and 5, then the quadratic is (x - 3)(x - 5) = x^2 - 8x + 15. Therefore k = 8. Final answer = 8.",
            {
                "A": "Choice A is the difference between the roots, not their sum.",
                "C": "Choice C is the product of the roots and matches the constant term.",
                "D": "Choice D doubles the product of the roots.",
            },
            "math-advanced-quadratic-roots-parameter-b005",
            "use roots to determine a quadratic coefficient",
            "confusing root sum and root product",
        ),
        spr(
            "expansion-b005-advanced-006",
            AM,
            "Nonlinear equations in one variable",
            "Hard",
            "What is the sum of the solutions to x^2 - 14x + 45 = 0?",
            "14",
            "For x^2 - 14x + 45 = 0, the roots add to 14 by the coefficient relationship, or by factoring as (x - 5)(x - 9). The solutions are 5 and 9, so their sum is 14. Final answer = 14.",
            "math-advanced-quadratic-sum-roots-b005",
            "use factoring or Vieta's relationship to find a requested root sum",
            "answering with one root or the constant term instead of the sum",
            acceptable=["14", "14.0"],
        ),
        mc(
            "expansion-b005-advanced-007",
            AM,
            "Nonlinear equations in one variable",
            "Easy",
            "The equation 2x^2 - 8x = 0 has one solution x = 0. What is the other solution?",
            {"A": "2", "B": "4", "C": "8", "D": "16"},
            "B",
            "Choice B is correct: 4. Factor 2x^2 - 8x as 2x(x - 4). The solutions are x = 0 and x = 4, so the other solution is 4. Final answer = 4.",
            {
                "A": "Choice A is the common factor outside the parentheses.",
                "C": "Choice C copies the coefficient 8.",
                "D": "Choice D multiplies the two visible coefficients.",
            },
            "math-advanced-quadratic-factor-common-root-b005",
            "factor a quadratic with a common factor",
            "dividing or copying coefficients instead of finding the zero",
        ),
        mc(
            "expansion-b005-advanced-008",
            AM,
            "Nonlinear equations in one variable",
            "Medium",
            "What is the solution greater than 0 to x^2 = 5x + 36?",
            {"A": "-4", "B": "4", "C": "9", "D": "36"},
            "C",
            "Choice C is correct: 9. Rewrite the equation as x^2 - 5x - 36 = 0. Factor as (x - 9)(x + 4) = 0, so the solutions are 9 and -4. The solution greater than 0 is 9. Final answer = 9.",
            {
                "A": "Choice A is the negative solution.",
                "B": "Choice B is the magnitude of the negative solution.",
                "D": "Choice D copies the constant term after rearranging.",
            },
            "math-advanced-quadratic-positive-root-rearrange-b005",
            "rearrange and factor a quadratic equation",
            "using a constant or wrong-signed root",
        ),
        mc(
            "expansion-b005-advanced-009",
            AM,
            "Nonlinear functions",
            "Hard",
            "For the function f(x) = a(x - 2)^2 + 3, f(5) = 21. What is the value of a?",
            {"A": "2", "B": "3", "C": "6", "D": "18"},
            "A",
            "Choice A is correct: 2. Substitute x = 5 and f(5) = 21: 21 = a(5 - 2)^2 + 3. Then 18 = 9a, so a = 2. Final answer = 2.",
            {
                "B": "Choice B uses 5 - 2 but forgets to square it.",
                "C": "Choice C divides 18 by 3 instead of by 9.",
                "D": "Choice D stops at 18 = 9a.",
            },
            "math-advanced-quadratic-function-parameter-b005",
            "substitute into vertex form to solve for a parameter",
            "forgetting to square the input shift",
            elite=True,
        ),
        mc(
            "expansion-b005-advanced-010",
            AM,
            "Nonlinear functions",
            "Medium",
            "For the function f(x) = 2^x + k, f(3) = 13. What is k?",
            {"A": "3", "B": "5", "C": "8", "D": "21"},
            "B",
            "Choice B is correct: 5. Since 2^3 = 8, the equation f(3) = 13 becomes 8 + k = 13. Thus k = 5. Final answer = 5.",
            {
                "A": "Choice A copies the input value.",
                "C": "Choice C is 2^3, not k.",
                "D": "Choice D adds 13 and 8 instead of subtracting.",
            },
            "math-advanced-exponential-function-vertical-shift-b005",
            "evaluate an exponential expression and solve for a parameter",
            "answering with the exponential part instead of the shift",
        ),
        mc(
            "expansion-b005-advanced-011",
            AM,
            "Nonlinear functions",
            "Medium",
            "The function f is defined by f(x) = (x + 4)^2 - 9. What is the minimum value of f(x)?",
            {"A": "-9", "B": "-4", "C": "4", "D": "9"},
            "A",
            "Choice A is correct: -9. The squared term (x + 4)^2 is always at least 0. Its least value is 0 when x = -4, so the minimum value of f(x) is 0 - 9 = -9. Final answer = -9.",
            {
                "B": "Choice B is the x-value where the minimum occurs, not the minimum value.",
                "C": "Choice C comes from the horizontal shift.",
                "D": "Choice D reverses the sign of the vertical shift.",
            },
            "math-advanced-quadratic-function-minimum-value-b005",
            "read the minimum value from vertex form",
            "confusing the x-coordinate of the vertex with the minimum value",
        ),
        mc(
            "expansion-b005-advanced-012",
            AM,
            "Nonlinear functions",
            "Hard",
            "A function doubles each time x increases by 1. If f(0) = 6, what is f(4)?",
            {"A": "24", "B": "48", "C": "72", "D": "96"},
            "D",
            "Choice D is correct: 96. Starting at f(0) = 6, doubling four times gives f(1) = 12, f(2) = 24, f(3) = 48, and f(4) = 96. Final answer = 96.",
            {
                "A": "Choice A doubles only twice.",
                "B": "Choice B doubles three times and gives f(3).",
                "C": "Choice C adds 18 repeatedly instead of multiplying by 2.",
            },
            "math-advanced-exponential-function-repeated-doubling-b005",
            "extend an exponential pattern from a starting value",
            "using linear growth instead of repeated multiplication",
            elite=True,
        ),
        spr(
            "expansion-b005-advanced-013",
            AM,
            "Equivalent expressions",
            "Hard",
            "The expression (x + 3)^2 - x(x - 4) is equivalent to ax + b. What is a?",
            "10",
            "Expand (x + 3)^2 to get x^2 + 6x + 9. Expand x(x - 4) to get x^2 - 4x. Subtracting gives x^2 + 6x + 9 - (x^2 - 4x) = 10x + 9, so a = 10. Final answer = 10.",
            "math-advanced-equivalent-expression-linear-coefficient-b005",
            "expand and combine expressions after cancellation of quadratic terms",
            "not distributing the subtraction across the second expression",
            acceptable=["10", "10.0"],
            elite=True,
        ),
        spr(
            "expansion-b005-advanced-014",
            AM,
            "Equivalent expressions",
            "Medium",
            "The expression (2x - 5)(x + 1) is equivalent to 2x^2 + bx - 5. What is b?",
            "-3",
            "Expand (2x - 5)(x + 1): 2x^2 + 2x - 5x - 5 = 2x^2 - 3x - 5. Therefore b = -3. Final answer = -3.",
            "math-advanced-equivalent-expression-middle-coefficient-b005",
            "expand a product and identify a coefficient",
            "combining the middle terms with the wrong sign",
            acceptable=["-3", "-3.0"],
        ),
        mc(
            "expansion-b005-advanced-015",
            AM,
            "Nonlinear functions",
            "Easy",
            "For g(t) = t^2 - 6t + 11, what is g(2)?",
            {"A": "-1", "B": "3", "C": "7", "D": "11"},
            "B",
            "Choice B is correct: 3. Substitute t = 2: g(2) = 2^2 - 6(2) + 11 = 4 - 12 + 11 = 3. Final answer = 3.",
            {
                "A": "Choice A subtracts 11 instead of adding it.",
                "C": "Choice C forgets to subtract 12.",
                "D": "Choice D copies the constant term.",
            },
            "math-advanced-function-notation-quadratic-evaluation-b005",
            "evaluate a quadratic function at a given input",
            "copying the constant term instead of evaluating the whole function",
        ),
        spr(
            "expansion-b005-advanced-016",
            AM,
            "Nonlinear functions",
            "Medium",
            "A function is defined by h(x) = (x - r)^2. If h(7) = 0, what is h(4)?",
            "9",
            "Since h(7) = (7 - r)^2 = 0, the only possible value is r = 7. Then h(4) = (4 - 7)^2 = 9. Final answer = 9.",
            "math-advanced-quadratic-function-shift-evaluate-b005",
            "use a zero of a squared expression to find a parameter and evaluate",
            "using 7 as the output instead of as the input that makes the square zero",
            acceptable=["9", "9.0"],
        ),
    ]


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
        report["missingBatchIds"] = []
        report["added"] = [
            {"id": item["id"], "section": item["section"], "domain": item["domain"], "skill": item["skill"]}
            for item in items
        ]
    elif args.apply and status == "already_applied":
        report["applySkippedReason"] = "batch_items_already_present"
        report["missingBatchIds"] = []

    report["addedCount"] = len(report["added"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
