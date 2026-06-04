"""Generate SAT Studio strategic Math batch: 200 even hard items.

Focus requested by the user:
- 100 Algebra and 100 Advanced Math.
- Hard difficulty.
- Context-heavy Algebra.
- Advanced Math focused on nonlinear equations and systems in two variables.

Items are appended as needs_review first. Run two clean audits before promoting
them with the expert pending-review gate.
"""

from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter, defaultdict
from datetime import datetime, timezone
from fractions import Fraction
from pathlib import Path
from typing import Any

try:
    from scripts import generate_strategy_math_224_20260525 as base
except ModuleNotFoundError:
    import generate_strategy_math_224_20260525 as base


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS_DIR = ROOT / "artifacts"
BANK_PATH = ROOT / "data" / "antigravity-bank.json"
BATCH_ID = "strategy-math-200-even-hard-20260525"
SOURCE_REFERENCE = "scripts/generate_strategy_math_200_even_hard_20260525.py"
DRAFT_PATH = ARTIFACTS_DIR / "strategy-math-200-even-hard-draft-20260525.json"
REPORT_PATH = ARTIFACTS_DIR / "strategy-math-200-even-hard-generation-report-20260525.md"

base.BATCH_ID = BATCH_ID
base.SOURCE_REFERENCE = SOURCE_REFERENCE
base.DRAFT_PATH = DRAFT_PATH


FAMILY_PLAN = [
    {
        "family": "alg_context_system_combo",
        "domain": "Algebra",
        "skill": "Systems of two linear equations in two variables",
        "total": 40,
        "format": {"multiple_choice": 36, "student_produced_response": 4},
    },
    {
        "family": "alg_context_two_var_rate",
        "domain": "Algebra",
        "skill": "Linear equations in two variables",
        "total": 20,
        "format": {"multiple_choice": 18, "student_produced_response": 2},
    },
    {
        "family": "alg_context_linear_function_compare",
        "domain": "Algebra",
        "skill": "Linear functions",
        "total": 20,
        "format": {"multiple_choice": 18, "student_produced_response": 2},
    },
    {
        "family": "alg_context_inequality_two_var",
        "domain": "Algebra",
        "skill": "Linear inequalities in one or two variables",
        "total": 20,
        "format": {"multiple_choice": 18, "student_produced_response": 2},
    },
    {
        "family": "adv_context_line_parabola_system",
        "domain": "Advanced Math",
        "skill": "Systems of equations in two variables",
        "total": 45,
        "format": {"multiple_choice": 41, "student_produced_response": 4},
    },
    {
        "family": "adv_context_tangent_parameter",
        "domain": "Advanced Math",
        "skill": "Systems of equations in two variables",
        "total": 25,
        "format": {"multiple_choice": 22, "student_produced_response": 3},
    },
    {
        "family": "adv_context_quadratic_parameter",
        "domain": "Advanced Math",
        "skill": "Nonlinear equations in one variable",
        "total": 20,
        "format": {"multiple_choice": 18, "student_produced_response": 2},
    },
    {
        "family": "adv_context_rational_equation",
        "domain": "Advanced Math",
        "skill": "Nonlinear equations in one variable",
        "total": 10,
        "format": {"multiple_choice": 7, "student_produced_response": 3},
    },
]


CONTEXTS = [
    ("a college-prep bootcamp", "practice packets"),
    ("a robotics fundraiser", "starter kits"),
    ("a science fair team", "display boards"),
    ("a school newspaper", "ad spaces"),
    ("a debate league", "round entries"),
    ("a tutoring center", "lesson blocks"),
    ("a music program", "rehearsal slots"),
    ("a library makerspace", "project seats"),
    ("a coding club", "app prototypes"),
    ("a museum workshop", "student passes"),
    ("an athletic department", "training sessions"),
    ("a language academy", "speaking drills"),
    ("a volunteer network", "delivery routes"),
    ("a math circle", "challenge sets"),
    ("a design studio", "client mockups"),
    ("a theater camp", "stage seats"),
    ("a research lab", "test samples"),
    ("a yearbook team", "photo pages"),
    ("a STEM summer school", "lab modules"),
    ("a campus cafe", "meal vouchers"),
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def context(index: int) -> tuple[str, str]:
    return CONTEXTS[(index - 1) % len(CONTEXTS)]


def spr_positions(total: int, spr_count: int) -> set[int]:
    return {round((i + 1) * total / (spr_count + 1)) - 1 for i in range(spr_count)}


def spec_list() -> list[base.Spec]:
    specs: list[base.Spec] = []
    global_index = 1
    for plan in FAMILY_PLAN:
        total = int(plan["total"])
        spr_count = int(plan["format"]["student_produced_response"])
        spr = spr_positions(total, spr_count)
        qtypes = ["student_produced_response" if i in spr else "multiple_choice" for i in range(total)]
        assert Counter(qtypes)["student_produced_response"] == spr_count
        for family_index in range(total):
            specs.append(
                base.Spec(
                    family=str(plan["family"]),
                    domain=str(plan["domain"]),
                    skill=str(plan["skill"]),
                    difficulty="Hard",
                    qtype=qtypes[family_index],
                    family_index=family_index + 1,
                    global_index=global_index,
                )
            )
            global_index += 1
    assert len(specs) == 200
    return specs


def fmt(value: Any) -> str:
    return base.fmt(value)


def make(
    spec: base.Spec,
    prompt: str,
    answer: Any,
    explanation: str,
    wrongs: list[tuple[Any, str]],
    template_id: str,
    cognitive_move: str,
    representation: str,
    trap_model: str,
    difficulty_reason: str,
    desmos: bool,
    extra_tags: list[str] | None = None,
) -> dict[str, Any]:
    item = base.make_question(
        spec,
        prompt,
        answer,
        explanation,
        wrongs,
        template_id,
        cognitive_move,
        representation,
        trap_model,
        difficulty_reason,
        desmos=desmos,
        extra_tags=extra_tags
        or [
            "hard_context",
            "multi_step_context",
            "two_variable_reasoning" if "two variable" in representation or "system" in template_id else "nonlinear_reasoning",
        ],
    )
    item["sourceName"] = "SAT Studio strategic Algebra/Advanced Math even hard batch 200"
    item["metadata"]["generatedBatch"] = BATCH_ID
    item["contentTags"].extend(["Algebra Advanced Math balance batch", "Hard context expansion"])
    item["calculatorUse"]["tags"] = sorted(
        set(item["calculatorUse"]["tags"] + ["multi_step_context", "hard_context"])
    )
    item["calculatorTags"] = item["calculatorUse"]["tags"]
    return item


def gen_alg_context_system_combo(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i)
    low = 3 + (2 * i) % 11
    high = low + 4 + i % 6
    x = 8 + (3 * i) % 17
    y = 6 + (5 * i) % 19
    total = x + y
    revenue = low * x + high * y
    ask_combo = y - x if i % 2 else 2 * y - x
    combo_text = "y - x" if i % 2 else "2y - x"
    prompt = (
        f"At {place}, x basic {unit} and y advanced {unit} were sold. A basic unit costs {low} dollars, "
        f"and an advanced unit costs {high} dollars. The group sold {total} units and collected {revenue} dollars. "
        f"What is the value of {combo_text}?"
    )
    explanation = (
        f"The context gives the system x + y = {total} and {low}x + {high}y = {revenue}. "
        f"Use x = {total} - y in the revenue equation: {low}({total} - y) + {high}y = {revenue}. "
        f"This simplifies to {low * total} + {high - low}y = {revenue}, so {high - low}y = {revenue - low * total} "
        f"and y = {y}. Then x = {total} - {y} = {x}. The requested expression is {combo_text} = {ask_combo}."
    )
    wrongs = [
        (y, "This finds the number of advanced units but stops before answering the requested expression."),
        (x, "This is the number of basic units, not the requested combination of x and y."),
        (total, "This uses the total number of units and ignores the revenue equation."),
    ]
    return make(
        spec,
        prompt,
        ask_combo,
        explanation,
        wrongs,
        "hard_context_system_combo",
        "translate a two-variable context and evaluate a requested expression",
        "two variable linear system context",
        "stopping at one variable instead of answering the requested expression",
        "Hard because it requires creating a system, solving it, and then evaluating a second expression.",
        desmos=True,
    )


def gen_alg_context_two_var_rate(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 40)
    a = 3 + i % 6
    b = a + 2 + (i % 5)
    delta_y = 2 + i % 7
    delta_x = Fraction(-b * delta_y, a)
    total = a * (18 + i % 9) + b * (7 + i % 8)
    prompt = (
        f"In {place}, the planning equation {a}x + {b}y = {total} models a fixed resource budget, "
        f"where x is the number of standard {unit} and y is the number of extended {unit}. "
        f"If y increases by {delta_y} while the budget stays the same, by how much must x change?"
    )
    explanation = (
        f"Because the total {a}x + {b}y must stay constant, the changes must satisfy {a}(change in x) + "
        f"{b}({delta_y}) = 0. Thus {a}(change in x) = -{b * delta_y}. "
        f"Divide by {a}: change in x = {fmt(delta_x)}. The negative sign means x must decrease."
    )
    wrongs = [
        (Fraction(b * delta_y, a), "This has the right magnitude but the wrong sign; x must decrease when y increases."),
        (delta_y, "This assumes one x offsets one y and ignores the different coefficients in the equation."),
        (-b * delta_y, "This stops before dividing by the coefficient of x."),
    ]
    return make(
        spec,
        prompt,
        delta_x,
        explanation,
        wrongs,
        "hard_context_two_var_tradeoff",
        "interpret the slope of a two-variable linear equation as a tradeoff",
        "two variable linear equation context",
        "using the change in y as the change in x",
        "Hard because the student must reason with changes rather than solving for a single point.",
        desmos=False,
    )


def gen_alg_context_linear_function_compare(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 60)
    a = 5 + i % 7
    c = 2 + i % 5
    if a == c:
        c += 2
    b = 28 + (3 * i) % 23
    d = 9 + (5 * i) % 19
    target_diff = 12 + (2 * i) % 18
    x = Fraction(target_diff - b + d, a - c)
    while x <= 0 or x.denominator not in (1, 2, 3, 4):
        target_diff += 1
        x = Fraction(target_diff - b + d, a - c)
    prompt = (
        f"For {place}, Plan A predicts {base.linear_expr(a, b)} dollars for x {unit}, and Plan B predicts "
        f"{base.linear_expr(c, d)} dollars for x {unit}. For what value of x is Plan A's prediction exactly "
        f"{target_diff} dollars greater than Plan B's prediction?"
    )
    explanation = (
        f"Set the difference A - B equal to {target_diff}: ({base.linear_expr(a, b)}) - "
        f"({base.linear_expr(c, d)}) = {target_diff}. Combining like terms gives "
        f"{a - c}x + {b - d} = {target_diff}. Subtract {b - d} to get "
        f"{a - c}x = {target_diff - b + d}. Therefore x = {fmt(x)}."
    )
    wrongs = [
        (Fraction(target_diff + b - d, a - c), "This adds the fixed-cost difference instead of subtracting it."),
        (Fraction(target_diff, a - c), "This uses only the rate difference and ignores the starting values."),
        (Fraction(target_diff - b + d, a + c), "This divides by the sum of the rates instead of the difference of the rates."),
    ]
    return make(
        spec,
        prompt,
        x,
        explanation,
        wrongs,
        "hard_context_linear_function_difference",
        "compare two linear functions by setting a target difference",
        "two variable function comparison context",
        "using sum of rates instead of rate difference",
        "Hard because it asks for a specified difference, not merely the intersection point.",
        desmos=True,
    )


def gen_alg_context_inequality_two_var(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 80)
    a = 4 + i % 5
    b = a + 3 + i % 6
    total_units = 18 + i % 13
    y = 5 + (2 * i) % 9
    x = total_units - y
    target = a * x + b * y
    buffer = i % 4
    target_min = target - buffer
    prompt = (
        f"At {place}, x regular {unit} and y premium {unit} will be completed. The team can complete exactly "
        f"{total_units} units, and it must earn at least {target_min} points. Each regular unit earns {a} points, "
        f"and each premium unit earns {b} points. What is the least possible value of y?"
    )
    least_y = (target_min - a * total_units + (b - a) - 1) // (b - a)
    explanation = (
        f"Since exactly {total_units} units are completed, x + y = {total_units}, so x = {total_units} - y. "
        f"The point condition is {a}x + {b}y >= {target_min}. Substitute: {a}({total_units} - y) + "
        f"{b}y >= {target_min}. This simplifies to {a * total_units} + {b - a}y >= {target_min}. "
        f"Thus {b - a}y >= {target_min - a * total_units}. The least integer y satisfying this is {least_y}."
    )
    wrongs = [
        (least_y - 1, "This is one below the minimum and does not meet the point requirement."),
        (y, "This is a possible premium count from the generated setup, but the question asks for the least possible value."),
        (total_units - least_y, "This is the corresponding regular count, not the premium count y."),
    ]
    return make(
        spec,
        prompt,
        least_y,
        explanation,
        wrongs,
        "hard_context_two_var_inequality_minimum",
        "combine an exact total with an inequality and interpret the least integer solution",
        "two variable inequality context",
        "returning the regular count instead of the requested premium count",
        "Hard because it requires substituting a total constraint into an inequality and respecting integer context.",
        desmos=False,
    )


def gen_adv_context_line_parabola_system(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 100)
    r = 1 + i % 9
    s = r + 3 + (2 * i) % 7
    v = -8 + i % 17
    m = r + s
    b = v - r * s
    if i % 3 == 0:
        answer = s - r
        ask = "the distance between the two x-values"
        final = f"The distance is {s} - {r} = {answer}."
        wrongs = [
            (r + s, "This is the sum of the x-values, not their distance."),
            (r * s, "This is the product of the x-values from the factored quadratic."),
            (s, "This gives the larger x-value but not the distance between the two x-values."),
        ]
    elif i % 3 == 1:
        answer = r + s
        ask = "the sum of the two x-values"
        final = f"The sum is {r} + {s} = {answer}."
        wrongs = [
            (s - r, "This is the distance between the x-values, not their sum."),
            (r * s, "This is the product of the x-values."),
            (m, "This matches the line's slope here, but that is only because of the constructed root sum; the reasoning must come from the intersection equation."),
        ]
    else:
        answer = s
        ask = "the greater x-value"
        final = f"The greater x-value is {s}."
        wrongs = [
            (r, "This is the smaller x-value."),
            (r + s, "This is the sum of the x-values, not the greater one."),
            (s - r, "This is the distance between the x-values."),
        ]
    prompt = (
        f"Two models for {place} are graphed in the xy-plane: y = x^2 + {v} and "
        f"y = {base.linear_expr(m, b)}. The x-values of the intersection points represent two possible numbers "
        f"of {unit}. What is {ask}?"
    )
    explanation = (
        f"At an intersection, x^2 + {v} = {base.linear_expr(m, b)}. Move all terms to one side: "
        f"x^2 - {m}x + {r * s} = 0. This factors as (x - {r})(x - {s}) = 0, "
        f"so the intersection x-values are {r} and {s}. {final}"
    )
    return make(
        spec,
        prompt,
        answer,
        explanation,
        wrongs,
        "hard_context_line_parabola_system",
        "convert intersections of a line and parabola into a factored quadratic",
        "nonlinear two variable system context",
        "confusing sum, product, and distance of roots",
        "Hard because the item blends graph intersection meaning, equation setup, and root interpretation.",
        desmos=True,
    )


def gen_adv_context_tangent_parameter(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 145)
    h = 2 + (2 * i) % 11
    target = 6 + (3 * i) % 19
    k = target + h * h
    prompt = (
        f"For {place}, a nonlinear model y = x^2 - {2 * h}x + k and a constant target model y = {target} "
        f"are graphed in the xy-plane, where x is the number of {unit}. The two graphs should intersect at exactly "
        f"one point. What is k?"
    )
    explanation = (
        f"Exactly one intersection means the horizontal line touches the parabola at its vertex. "
        f"The vertex x-coordinate of y = x^2 - {2 * h}x + k is x = {h}. "
        f"At x = {h}, the y-value is {h * h} - {2 * h * h} + k = k - {h * h}. "
        f"Set this equal to the target {target}: k - {h * h} = {target}. Therefore k = {k}."
    )
    wrongs = [
        (target, "This copies the target y-value and ignores the vertical shift of the parabola."),
        (h * h, "This is the square used in the vertex calculation, not k."),
        (target - h * h, "This subtracts h^2 when the vertex equation requires adding h^2."),
    ]
    return make(
        spec,
        prompt,
        k,
        explanation,
        wrongs,
        "hard_context_parabola_line_tangent_parameter",
        "interpret one solution in a nonlinear system as tangency and use the vertex",
        "nonlinear two variable system context",
        "copying the target y-value as the parameter",
        "Hard because exactly one solution must be translated into a vertex/tangency condition.",
        desmos=True,
    )


def gen_adv_context_quadratic_parameter(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 170)
    p = 3 + i % 10
    q = p + 2 + i % 8
    shift = 4 + (2 * i) % 13
    c = p * q + shift
    target = shift
    if i % 2:
        prompt = (
            f"A projected-score model for {place} is x^2 - {p + q}x + c = {target}, where x is the number of "
            f"{unit}. What is the greater solution for x?"
        )
        answer = q
        final = f"The solutions are {p} and {q}, so the greater solution is {q}."
        wrongs = [
            (p, "This is the smaller solution."),
            (p + q, "This is the sum of the solutions, not the greater solution."),
            (p * q, "This is the product of the solutions after moving the target, not a solution."),
        ]
    else:
        prompt = (
            f"A projected-score model for {place} is x^2 - {p + q}x + c = {target}, where x is the number of "
            f"{unit}. What is the sum of the two solutions for x?"
        )
        answer = p + q
        final = f"The solutions are {p} and {q}, so their sum is {p + q}."
        wrongs = [
            (q, "This is only the greater solution, not the sum of both solutions."),
            (p * q, "This is the product of the solutions, not their sum."),
            (q - p, "This is the distance between the solutions."),
        ]
    explanation = (
        f"Subtract {target} from both sides: x^2 - {p + q}x + {c - target} = 0. "
        f"Since {c - target} = {p * q}, the equation factors as (x - {p})(x - {q}) = 0. "
        f"{final}"
    )
    return make(
        spec,
        prompt,
        answer,
        explanation,
        wrongs,
        "hard_context_quadratic_shifted_equation",
        "move a target value before factoring a quadratic equation",
        "nonlinear equation context",
        "factoring before moving the target to zero",
        "Hard because the visible constant c is not the constant term of the zero-product equation.",
        desmos=True,
    )


def gen_adv_context_rational_equation(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 190)
    excluded = 2 + i % 8
    answer = excluded + 3 + i % 7
    target = 5 + i % 9
    numerator_const = target * (answer - excluded)
    prompt = (
        f"In a calibration model for {place}, the expression {target} + {numerator_const}/(x - {excluded}) "
        f"represents an adjusted rate after x {unit}. For what value of x is the adjusted rate equal to {target + 1}?"
    )
    explanation = (
        f"Set up the equation {target} + {numerator_const}/(x - {excluded}) = {target + 1}. "
        f"Subtract {target} from both sides to get {numerator_const}/(x - {excluded}) = 1. "
        f"Then x - {excluded} = {numerator_const}, so x = {numerator_const + excluded}. "
        f"The value x = {excluded} is excluded because it makes the denominator 0."
    )
    true_answer = numerator_const + excluded
    wrongs = [
        (excluded, "This is the excluded value that makes the denominator zero."),
        (numerator_const, "This stops at x - excluded value and does not add the excluded value back."),
        (target + 1, "This copies the adjusted rate rather than solving for x."),
    ]
    return make(
        spec,
        prompt,
        true_answer,
        explanation,
        wrongs,
        "hard_context_rational_equation_rate",
        "solve a rational equation while checking the excluded value",
        "nonlinear equation context",
        "using the excluded denominator value as the solution",
        "Hard because it requires clearing a rational expression and checking the domain restriction.",
        desmos=True,
    )


GENERATORS = {
    "alg_context_system_combo": gen_alg_context_system_combo,
    "alg_context_two_var_rate": gen_alg_context_two_var_rate,
    "alg_context_linear_function_compare": gen_alg_context_linear_function_compare,
    "alg_context_inequality_two_var": gen_alg_context_inequality_two_var,
    "adv_context_line_parabola_system": gen_adv_context_line_parabola_system,
    "adv_context_tangent_parameter": gen_adv_context_tangent_parameter,
    "adv_context_quadratic_parameter": gen_adv_context_quadratic_parameter,
    "adv_context_rational_equation": gen_adv_context_rational_equation,
}


def generate_questions() -> list[dict[str, Any]]:
    questions = [GENERATORS[spec.family](spec) for spec in spec_list()]
    validate_distribution(questions)
    return questions


def validate_distribution(questions: list[dict[str, Any]]) -> None:
    assert len(questions) == 200
    assert len({q["id"] for q in questions}) == 200
    assert Counter(q["domain"] for q in questions) == {"Algebra": 100, "Advanced Math": 100}
    assert Counter(q["difficulty"] for q in questions) == {"Hard": 200}
    assert Counter(q["questionType"] for q in questions) == {"multiple_choice": 178, "student_produced_response": 22}
    expected_skills = {
        "Systems of two linear equations in two variables": 40,
        "Linear equations in two variables": 20,
        "Linear functions": 20,
        "Linear inequalities in one or two variables": 20,
        "Systems of equations in two variables": 70,
        "Nonlinear equations in one variable": 30,
    }
    assert Counter(q["skill"] for q in questions) == expected_skills
    for q in questions:
        assert "$" not in str(q.get("prompt", ""))
        assert q.get("reviewStatus") == "needs_review"


def load_bank() -> list[dict[str, Any]]:
    return json.loads(BANK_PATH.read_text(encoding="utf-8"))


def write_draft(questions: list[dict[str, Any]]) -> None:
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    DRAFT_PATH.write_text(json.dumps(questions, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def append_to_bank(questions: list[dict[str, Any]]) -> dict[str, Any]:
    bank = load_bank()
    existing = {q.get("id") for q in bank if isinstance(q, dict)}
    new_questions = [q for q in questions if q["id"] not in existing]
    if not new_questions:
        return {"appended": 0, "backup": None, "bankCount": len(bank)}
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = ARTIFACTS_DIR / f"antigravity-bank-before-{BATCH_ID}-{timestamp}.json"
    shutil.copy2(BANK_PATH, backup)
    bank.extend(new_questions)
    BANK_PATH.write_text(json.dumps(bank, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {"appended": len(new_questions), "backup": str(backup), "bankCount": len(bank)}


def load_batch_from_bank() -> list[dict[str, Any]]:
    prefix = f"{BATCH_ID}-"
    return [q for q in load_bank() if isinstance(q, dict) and str(q.get("id", "")).startswith(prefix)]


def audit_questions(questions: list[dict[str, Any]], audit_name: str) -> dict[str, Any]:
    try:
        from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
        from scripts.math_verifier import verify_math_answer
        from scripts.review_pending_questions_expert_gate_20260524 import (
            active_reviewed_prompt_index,
            equivalent_choice_issues,
            generation_artifact_issues,
            symbol_quality_issues,
        )
    except ModuleNotFoundError:
        from audit_reviewed_question_expert_quality import reviewed_issue_row
        from math_verifier import verify_math_answer
        from review_pending_questions_expert_gate_20260524 import (
            active_reviewed_prompt_index,
            equivalent_choice_issues,
            generation_artifact_issues,
            symbol_quality_issues,
        )

    seen_prompts: dict[str, str] = {}
    reviewed_prompts = active_reviewed_prompt_index()
    rows: list[dict[str, Any]] = []
    counters: dict[str, Counter] = defaultdict(Counter)
    for index, q in enumerate(questions):
        item = dict(q)
        item["_sourceFile"] = f"{BATCH_ID}:{audit_name}"
        item["_sourceIndex"] = index
        row = reviewed_issue_row(item, seen_prompts)
        prompt_key = " ".join(str(item.get("prompt", "")).lower().split())
        blockers = []
        if prompt_key in reviewed_prompts and reviewed_prompts[prompt_key] != str(item.get("id")):
            blockers.append(f"duplicate_prompt_with_reviewed:{reviewed_prompts[prompt_key]}")
        blockers.extend(symbol_quality_issues(item))
        blockers.extend(equivalent_choice_issues(item))
        blockers.extend(generation_artifact_issues(item))
        math_check = verify_math_answer(item) if item.get("section") == "Math" else {"issues": [], "warnings": []}
        blockers.extend(f"math_issue:{issue}" for issue in math_check.get("issues") or [])
        row["blockers"] = sorted(set(blockers))
        row["mathWarnings"] = sorted(set(math_check.get("warnings") or []))
        row["pass"] = not row["blockers"] and not row["issues"] and not row["warnings"] and not row["depthFlags"]
        rows.append(row)
        for field in ("domain", "skill", "difficulty", "questionType", "targetBand", "reviewStatus"):
            counters[field][str(item.get(field))] += 1
        for field in ("blockers", "issues", "warnings", "depthFlags", "mathWarnings"):
            for value in row.get(field) or []:
                counters[field][value] += 1
    failures = [row for row in rows if not row["pass"]]
    report = {
        "batchId": BATCH_ID,
        "auditName": audit_name,
        "generatedAt": utc_now(),
        "count": len(questions),
        "passCount": len(rows) - len(failures),
        "failureCount": len(failures),
        "distribution": {key: dict(counter) for key, counter in counters.items()},
        "failureSample": failures[:80],
        "rows": rows,
    }
    out = ARTIFACTS_DIR / f"strategy-math-200-even-hard-audit-{audit_name}-20260525.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def write_generation_report(post_review: dict[str, Any] | None = None) -> None:
    batch = load_batch_from_bank()
    domain_counts = Counter(q.get("domain") for q in batch)
    skill_counts = Counter(q.get("skill") for q in batch)
    difficulty_counts = Counter(q.get("difficulty") for q in batch)
    qtype_counts = Counter(q.get("questionType") for q in batch)
    reviewed = sum(1 for q in batch if q.get("reviewStatus") == "reviewed")
    verdict_pass = sum(1 for q in batch if (q.get("contentAudit") or {}).get("verdict") == "pass")
    lines = [
        "# Strategy Math 200 even hard generation report",
        "",
        "Ngay tao: 2026-05-25",
        "",
        "## Ket qua",
        "",
        f"- Batch ID prefix: `{BATCH_ID}`",
        f"- Source: `{SOURCE_REFERENCE}`",
        f"- So cau trong bank: {len(batch)}",
        f"- Trang thai reviewed: {reviewed}/{len(batch)}",
        f"- Content audit pass: {verdict_pass}/{len(batch)}",
        "",
        "## Phan bo batch",
        "",
        "| Domain | So cau |",
        "| --- | ---: |",
        *[f"| {key} | {value} |" for key, value in sorted(domain_counts.items())],
        "",
        "| Difficulty | So cau |",
        "| --- | ---: |",
        *[f"| {key} | {value} |" for key, value in sorted(difficulty_counts.items())],
        "",
        "| Format | So cau |",
        "| --- | ---: |",
        *[f"| {key} | {value} |" for key, value in sorted(qtype_counts.items())],
        "",
        "## Phan bo theo skill",
        "",
        "| Skill | So cau |",
        "| --- | ---: |",
        *[f"| {key} | {value} |" for key, value in sorted(skill_counts.items())],
        "",
        "## Muc tieu su pham",
        "",
        "- Algebra: context-heavy, two-variable reasoning, systems, function comparison, and inequality constraints.",
        "- Advanced Math: nonlinear systems, line-parabola intersections, tangent/one-solution parameters, shifted quadratics, and rational equations.",
        "- Tat ca cau moi o muc Hard va co explanation day du de hoc sinh tu hoc.",
        "- MC distractors gan voi trap cu the; SPR chi dung khi can kiem tra doc lap khong co answer-choice support.",
        "",
        "## Quy trinh test",
        "",
        "- Pass 1 draft audit: `artifacts/strategy-math-200-even-hard-audit-pass1-20260525.json`.",
        "- Pass 2 bank audit before review: `artifacts/strategy-math-200-even-hard-audit-pass2_bank-20260525.json`.",
        "- Post-review audit: `artifacts/strategy-math-200-even-hard-audit-postreview-20260525.json`.",
    ]
    if post_review:
        lines.extend(
            [
                "",
                "## Post-review summary",
                "",
                f"- Pass count: {post_review.get('passCount')}/{post_review.get('count')}",
                f"- Failure count: {post_review.get('failureCount')}",
            ]
        )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-draft", action="store_true")
    parser.add_argument("--append", action="store_true")
    parser.add_argument("--audit-bank", action="store_true")
    parser.add_argument("--audit-name", default="pass1")
    parser.add_argument("--require-clean", action="store_true")
    parser.add_argument("--write-report", action="store_true")
    args = parser.parse_args()

    questions = load_batch_from_bank() if args.audit_bank else generate_questions()
    if args.write_draft and not args.audit_bank:
        write_draft(questions)
    report = audit_questions(questions, args.audit_name)
    summary = {
        "batchId": report["batchId"],
        "auditName": report["auditName"],
        "count": report["count"],
        "passCount": report["passCount"],
        "failureCount": report["failureCount"],
        "distribution": report["distribution"],
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    if args.require_clean and report["failureCount"]:
        raise SystemExit(f"Audit {args.audit_name} failed: {report['failureCount']} item(s)")
    if args.append:
        print(json.dumps(append_to_bank(questions), indent=2, ensure_ascii=False))
    if args.write_report:
        write_generation_report(report)


if __name__ == "__main__":
    main()
