"""Generate the SAT Studio strategic Math content batch for 2026-05-25.

The batch follows artifacts/content-strategy-gap-checklist-20260525.md:
- 98 Algebra items.
- 126 Advanced Math items.
- 175 multiple-choice items and 49 student-produced responses.

Items are first written as needs_review. They should be audited twice before
the expert gate promotes them to reviewed.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from fractions import Fraction
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
BANK_PATH = DATA_DIR / "antigravity-bank.json"
DRAFT_PATH = ARTIFACTS_DIR / "strategy-math-224-draft-20260525.json"
SOURCE_REFERENCE = "scripts/generate_strategy_math_224_20260525.py"
BATCH_ID = "strategy-math-224-20260525"
LETTERS = ("A", "B", "C", "D")


@dataclass(frozen=True)
class Spec:
    family: str
    domain: str
    skill: str
    difficulty: str
    qtype: str
    family_index: int
    global_index: int


FAMILY_PLAN = [
    {
        "family": "linear_one_var",
        "domain": "Algebra",
        "skill": "Linear equations in one variable",
        "total": 18,
        "difficulty": {"Easy": 2, "Medium": 9, "Hard": 7},
        "format": {"multiple_choice": 14, "student_produced_response": 4},
    },
    {
        "family": "linear_two_var",
        "domain": "Algebra",
        "skill": "Linear equations in two variables",
        "total": 20,
        "difficulty": {"Easy": 2, "Medium": 8, "Hard": 10},
        "format": {"multiple_choice": 16, "student_produced_response": 4},
    },
    {
        "family": "linear_functions",
        "domain": "Algebra",
        "skill": "Linear functions",
        "total": 21,
        "difficulty": {"Easy": 2, "Medium": 10, "Hard": 9},
        "format": {"multiple_choice": 17, "student_produced_response": 4},
    },
    {
        "family": "linear_systems",
        "domain": "Algebra",
        "skill": "Systems of two linear equations in two variables",
        "total": 25,
        "difficulty": {"Easy": 2, "Medium": 10, "Hard": 13},
        "format": {"multiple_choice": 20, "student_produced_response": 5},
    },
    {
        "family": "linear_inequalities",
        "domain": "Algebra",
        "skill": "Linear inequalities in one or two variables",
        "total": 14,
        "difficulty": {"Easy": 2, "Medium": 8, "Hard": 4},
        "format": {"multiple_choice": 10, "student_produced_response": 4},
    },
    {
        "family": "equivalent_expressions",
        "domain": "Advanced Math",
        "skill": "Equivalent expressions",
        "total": 28,
        "difficulty": {"Easy": 2, "Medium": 10, "Hard": 16},
        "format": {"multiple_choice": 22, "student_produced_response": 6},
    },
    {
        "family": "nonlinear_equations",
        "domain": "Advanced Math",
        "skill": "Nonlinear equations in one variable",
        "total": 38,
        "difficulty": {"Easy": 1, "Medium": 9, "Hard": 28},
        "format": {"multiple_choice": 30, "student_produced_response": 8},
    },
    {
        "family": "nonlinear_functions",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "total": 35,
        "difficulty": {"Easy": 3, "Medium": 12, "Hard": 20},
        "format": {"multiple_choice": 27, "student_produced_response": 8},
    },
    {
        "family": "nonlinear_systems",
        "domain": "Advanced Math",
        "skill": "Systems of equations in two variables",
        "total": 25,
        "difficulty": {"Easy": 2, "Medium": 7, "Hard": 16},
        "format": {"multiple_choice": 19, "student_produced_response": 6},
    },
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def fmt(value: Any) -> str:
    if isinstance(value, Fraction):
        if value.denominator == 1:
            return str(value.numerator)
        return f"{value.numerator}/{value.denominator}"
    if isinstance(value, float):
        if abs(value - round(value)) < 1e-9:
            return str(int(round(value)))
        text = f"{value:.4f}".rstrip("0").rstrip(".")
        return text
    return str(value)


def coeff_term(coef: Any, variable: str = "x") -> str:
    coef = Fraction(coef)
    if coef == 1:
        return variable
    if coef == -1:
        return f"-{variable}"
    text = fmt(coef)
    if "/" in text:
        text = f"({text})"
    return f"{text}{variable}"


def signed_const(value: Any) -> str:
    value = Fraction(value)
    if value >= 0:
        return f" + {fmt(value)}"
    return f" - {fmt(-value)}"


def linear_expr(m: Any, b: Any, variable: str = "x") -> str:
    m = Fraction(m)
    b = Fraction(b)
    base = coeff_term(m, variable)
    if b == 0:
        return base
    return base + signed_const(b)


def standard_line(a: int, b: int, c: int) -> str:
    second = f" + {b}y" if b >= 0 else f" - {abs(b)}y"
    return f"{a}x{second} = {c}"


def difficulty_meta(difficulty: str, domain: str) -> tuple[str, str, int]:
    if difficulty == "Easy":
        return "G10-Bridge", "module1", 65
    if difficulty == "Medium":
        return "SAT-Core", "module1", 95
    if domain == "Advanced Math":
        return "SAT-Elite", "module2_upper", 135
    return "SAT-Advanced", "module2_upper", 125


def choice_letter(global_index: int) -> str:
    return LETTERS[(global_index - 1) % 4]


def normalize_wrong_values(answer_text: str, wrongs: list[tuple[Any, str]]) -> list[tuple[str, str]]:
    used = {answer_text}
    output: list[tuple[str, str]] = []
    bump = 1
    for value, reason in wrongs:
        text = fmt(value)
        if text in used:
            parsed = None
            try:
                parsed = Fraction(value)
            except Exception:
                parsed = None
            if parsed is not None:
                while fmt(parsed + bump) in used:
                    bump += 1
                text = fmt(parsed + bump)
            else:
                text = f"{text} plus an extra step"
        used.add(text)
        output.append((text, reason))
    while len(output) < 3:
        text = fmt(Fraction(len(used) + 7))
        output.append((text, "This value comes from an unrelated arithmetic shortcut and does not satisfy the equation in the prompt."))
        used.add(text)
    return output[:3]


def make_question(
    spec: Spec,
    prompt: str,
    answer: Any,
    correct_explanation: str,
    wrongs: list[tuple[Any, str]],
    template_id: str,
    cognitive_move: str,
    representation: str,
    trap_model: str,
    difficulty_reason: str,
    desmos: bool = False,
    calculator_strategy: str | None = None,
    extra_tags: list[str] | None = None,
) -> dict[str, Any]:
    answer_text = fmt(answer)
    target_band, module, seconds = difficulty_meta(spec.difficulty, spec.domain)
    qid = f"{BATCH_ID}-{spec.global_index:03d}"
    common_tags = ["calculator_allowed_all_math"]
    if desmos:
        common_tags.extend(["desmos_useful", "equation_intersection" if "system" in template_id else "function_features"])
    else:
        common_tags.append("algebra_first")
    if extra_tags:
        common_tags.extend(extra_tags)
    strategy = calculator_strategy or (
        "Desmos is useful as a verification route, but the explanation teaches the algebraic route first."
        if desmos
        else "Algebraic reasoning is faster than calculator entry; a calculator can verify the final arithmetic."
    )
    teaching_note = (
        "This SAT route is efficient because it identifies the structure first, performs only the needed algebra, "
        "and checks that the final value answers the exact quantity requested rather than an intermediate step."
    )
    final_sentence = (
        f"The credited result is {answer_text}. Final answer = {answer_text}."
        if spec.qtype == "student_produced_response"
        else f"The credited answer is {answer_text}. Final answer = {answer_text}."
    )
    full_explanation = f"{correct_explanation.strip()} {teaching_note} {final_sentence}"
    item: dict[str, Any] = {
        "id": qid,
        "section": "Math",
        "domain": spec.domain,
        "skill": spec.skill,
        "canonicalSkill": spec.skill,
        "microSkill": template_id.replace("_", " "),
        "difficulty": spec.difficulty,
        "prompt": prompt,
        "questionType": spec.qtype,
        "type": "SPR" if spec.qtype == "student_produced_response" else "MCQ",
        "correctAnswer": answer_text if spec.qtype == "student_produced_response" else "",
        "explanation": {"correct": full_explanation, "distractors": {}},
        "sourceType": "sat_studio_original",
        "sourceName": "SAT Studio strategic Math expansion 2026-05-25",
        "sourceReference": SOURCE_REFERENCE,
        "sourceSignalId": BATCH_ID,
        "generationEngine": "codex_blueprint_generator",
        "licenseNote": "SAT Studio original item generated from internal blueprint. No third-party prompt, choices, data, or explanation copied.",
        "visibility": "private_family",
        "reviewStatus": "needs_review",
        "publicationStatus": "needs_review_expert_gate",
        "sourceUsagePolicy": "original_private_study_pool",
        "postReviewUse": "pending_expert_pedagogical_review",
        "practicePool": "core_pool",
        "blueprintId": f"{BATCH_ID}:{spec.domain}:{spec.skill}:{spec.difficulty}",
        "templateFormId": f"{BATCH_ID}:{template_id}:{spec.difficulty}",
        "cognitiveMove": cognitive_move,
        "representation": representation,
        "trapModel": trap_model,
        "difficultyReason": difficulty_reason,
        "calculationEaseScore": "clean_written_work" if spec.difficulty != "Hard" else "strategic_multi_step",
        "targetBand": target_band,
        "modulePlacement": module,
        "estimatedTimeSeconds": seconds,
        "metadata": {
            "cognitiveMove": cognitive_move,
            "trapTypes": [trap_model],
            "generatedBatch": BATCH_ID,
        },
        "calculatorUse": {
            "version": "calculator-strategy-tags-2026-05-25",
            "calculatorAllowed": True,
            "desmosUseful": desmos,
            "strategy": strategy,
            "tags": sorted(set(common_tags)),
        },
        "desmosUseful": desmos,
        "calculatorStrategy": strategy,
        "calculatorTags": sorted(set(common_tags)),
        "contentTags": [
            spec.domain,
            spec.skill,
            spec.difficulty,
            target_band,
            "SAT Studio strategic gap batch",
        ],
    }
    if spec.qtype == "student_produced_response":
        item["acceptableAnswers"] = [answer_text]
    else:
        correct = choice_letter(spec.global_index)
        wrong_values = normalize_wrong_values(answer_text, wrongs)
        choices: dict[str, str] = {}
        distractors: dict[str, str] = {}
        wrong_iter = iter(wrong_values)
        for letter in LETTERS:
            if letter == correct:
                choices[letter] = answer_text
            else:
                value, reason = next(wrong_iter)
                choices[letter] = value
                distractors[letter] = reason
        item["choices"] = choices
        item["correctAnswer"] = correct
        item["explanation"]["distractors"] = distractors
    return item


def build_specs() -> list[Spec]:
    specs: list[Spec] = []
    global_index = 1
    for plan in FAMILY_PLAN:
        total = plan["total"]
        difficulties: list[str] = []
        for difficulty in ("Easy", "Medium", "Hard"):
            difficulties.extend([difficulty] * plan["difficulty"][difficulty])
        spr_count = plan["format"]["student_produced_response"]
        spr_positions = {round((i + 1) * total / (spr_count + 1)) - 1 for i in range(spr_count)}
        qtypes = ["student_produced_response" if i in spr_positions else "multiple_choice" for i in range(total)]
        assert len(difficulties) == total
        assert Counter(qtypes)["student_produced_response"] == spr_count
        for family_index in range(total):
            specs.append(
                Spec(
                    family=plan["family"],
                    domain=plan["domain"],
                    skill=plan["skill"],
                    difficulty=difficulties[family_index],
                    qtype=qtypes[family_index],
                    family_index=family_index + 1,
                    global_index=global_index,
                )
            )
            global_index += 1
    assert len(specs) == 224
    return specs


def gen_linear_one_var(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        a = 2 + i % 5
        x = 3 + i
        b = 4 + (i % 4)
        c = a * x + b
        prompt = f"What is the solution x to the equation {linear_expr(a, b)} = {c}?"
        explanation = (
            f"Start by undoing the constant term in {linear_expr(a, b)} = {c}. "
            f"Subtract {b} from both sides to get {coeff_term(a)} = {c - b}. "
            f"Then divide by {a}, so x = {x}. This is direct equation fluency."
        )
        wrongs = [
            (x + b, f"This adds the constant {b} to the solution instead of subtracting it before dividing."),
            (c - b, f"This stops at {coeff_term(a)} = {c - b} and forgets to divide by {a}."),
            (Fraction(c, a), f"This divides the original right side by {a} before removing the constant term."),
        ]
        return make_question(spec, prompt, x, explanation, wrongs, "linear_one_step_isolate", "isolate a variable", "equation", "constant-before-division error", "One linear equation with clean integer arithmetic.")

    if spec.difficulty == "Medium":
        a = 3 + i % 5
        h = 1 + i % 4
        x = h + 4 + i % 6
        b = 2 + i % 6
        c = a * (x - h) - b
        prompt = f"What is the value of x in the equation {a}(x - {h}) - {b} = {c}?"
        explanation = (
            f"First add {b} to both sides, giving {a}(x - {h}) = {c + b}. "
            f"Divide by {a} to get x - {h} = {x - h}. "
            f"Finally add {h}, so x = {x}. The key is to treat x - {h} as one quantity before the last step."
        )
        wrongs = [
            (x - h, f"This is the value of x - {h}, not the value of x requested."),
            (Fraction(c + b + h, a), "This adds the shift before dividing, changing the order of operations."),
            (Fraction(c, a) + h, f"This forgets to add {b} before dividing by {a}."),
        ]
        return make_question(spec, prompt, x, explanation, wrongs, "linear_distribute_group", "solve after grouping", "equation", "solving for the grouped expression instead of x", "Two linked inverse operations make this medium difficulty.")

    k = 4 + i % 7
    h = 1 + i % 5
    x0 = h + 3 + i % 5
    m = 1 + i % 4
    n = k * (x0 - h) - m * x0
    prompt = f"The equation k(x - {h}) = {m}x{signed_const(n)} has solution x = {x0}. What is the value of k?"
    explanation = (
        f"Use the given solution by substituting x = {x0}. The equation becomes "
        f"k({x0} - {h}) = {m}({x0}){signed_const(n)}. "
        f"The right side is {m * x0 + n}, and {x0} - {h} = {x0 - h}. "
        f"Thus {x0 - h}k = {m * x0 + n}, so k = {k}. This is a parameter question, not a normal solve-for-x question."
    )
    wrongs = [
        (m * x0 + n, "This is the right-side value after substitution, before dividing by the grouped factor."),
        (x0 - h, "This is the value of the group x - h, not the parameter k."),
        (k + h, "This adds the shift h to the parameter even though h is already used inside the grouped expression."),
    ]
    return make_question(spec, prompt, k, explanation, wrongs, "linear_parameter_given_solution", "substitute a known solution to find a parameter", "equation with parameter", "answering for x instead of the parameter", "Hard because the unknown is a coefficient and the given x-value must be used strategically.")


def gen_linear_two_var(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        m = 2 + i % 5
        x0 = 2 + i
        b = -4 + i % 9
        y0 = m * x0 + b
        prompt = f"The line y = {coeff_term(m)} + b passes through the point ({x0}, {y0}). What is the value of b?"
        explanation = (
            f"Substitute the point into y = {coeff_term(m)} + b. "
            f"That gives {y0} = {m}({x0}) + b. Since {m}({x0}) = {m * x0}, "
            f"b = {y0} - {m * x0} = {b}. This finds the intercept, not the slope."
        )
        wrongs = [
            (m * x0, "This is the product mx, not the missing intercept b."),
            (y0 + m * x0, "This adds mx to y instead of subtracting it."),
            (m, "This repeats the slope even though the slope is already given in the equation."),
        ]
        return make_question(spec, prompt, b, explanation, wrongs, "linear_intercept_from_point", "substitute a point into a line", "equation and coordinate", "using the slope as the intercept", "A direct substitution task with one missing linear parameter.")

    if spec.difficulty == "Medium":
        a = 2 + i % 5
        yint = -6 + i % 13
        bcoef = 3 + i % 5
        c = bcoef * yint
        prompt = f"The line {standard_line(a, bcoef, c)} is graphed in the xy-plane. What is its y-intercept?"
        explanation = (
            f"The y-intercept occurs where x = 0. Substitute x = 0 into {standard_line(a, bcoef, c)} "
            f"to get {bcoef}y = {c}. Dividing by {bcoef} gives y = {yint}. "
            f"The y-intercept is therefore {yint}."
        )
        wrongs = [
            (Fraction(c, a), "This finds the x-intercept by setting y = 0 instead of the y-intercept."),
            (c, "This uses the constant term as the intercept without dividing by the y-coefficient."),
            (-yint, "This changes the sign after division, a common standard-form trap."),
        ]
        return make_question(spec, prompt, yint, explanation, wrongs, "standard_form_y_intercept", "set x equal to zero", "standard-form line", "confusing x-intercept and y-intercept", "Medium because the representation must be converted mentally.")

    a = 6 + 2 * (i % 5)
    slope = Fraction(1 + i % 4, 1 if i % 2 else 2)
    k = -Fraction(a, 1) / slope
    c = 12 + i
    prompt = f"The line {a}x + ky = {c} is parallel to the line y = {coeff_term(slope)} - 7. What is the value of k?"
    explanation = (
        f"A line in the form ax + by = c has slope -a/b. Here the slope is -{a}/k. "
        f"Parallel lines have equal slopes, so -{a}/k = {fmt(slope)}. "
        f"Solving for k gives k = -{a}/({fmt(slope)}) = {fmt(k)}. "
        f"The sign matters because k is in the denominator of the slope expression."
    )
    wrongs = [
        (Fraction(a, 1) / slope, "This has the right magnitude but misses the negative sign in -a/b."),
        (-slope, "This uses the opposite of the target slope as the coefficient k."),
        (slope, "This copies the slope itself instead of solving for the y-coefficient."),
    ]
    return make_question(spec, prompt, k, explanation, wrongs, "parallel_line_parameter", "use slope from standard form", "standard-form line with parameter", "copying slope instead of solving for coefficient", "Hard because it requires recognizing slope structure and solving a parameter equation.", desmos=True)


def gen_linear_functions(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        slope = 2 + i % 6
        x1 = i
        x2 = x1 + 3
        y1 = 5 + i
        y2 = y1 + slope * (x2 - x1)
        prompt = f"A linear function f has f({x1}) = {y1} and f({x2}) = {y2}. What is the rate of change of f?"
        explanation = (
            f"For a linear function, the rate of change is change in output divided by change in input. "
            f"The output changes by {y2} - {y1} = {y2 - y1}, while the input changes by {x2} - {x1} = {x2 - x1}. "
            f"The rate is {y2 - y1}/{x2 - x1} = {slope}."
        )
        wrongs = [
            (y2 - y1, "This uses total output change but forgets to divide by the input change."),
            (x2 - x1, "This is only the input change, not the rate of change."),
            (Fraction(x2 - x1, y2 - y1), "This reverses the slope ratio as input change over output change."),
        ]
        return make_question(spec, prompt, slope, explanation, wrongs, "linear_function_rate_table", "compute slope from two function values", "function values", "using total change instead of rate", "A clean rate-of-change recognition item.")

    if spec.difficulty == "Medium":
        x1 = 1 + i % 4
        x2 = x1 + 5
        slope = 3 + i % 5
        b = -8 + i % 9
        x3 = x1 + 2
        y1 = slope * x1 + b
        y2 = slope * x2 + b
        y3 = slope * x3 + b
        prompt = f"The function f is linear, f({x1}) = {y1}, and f({x2}) = {y2}. What is f({x3})?"
        explanation = (
            f"First find the slope: ({y2} - {y1})/({x2} - {x1}) = {y2 - y1}/{x2 - x1} = {slope}. "
            f"Moving from x = {x1} to x = {x3} is an increase of {x3 - x1}, so the output increases by "
            f"{slope}({x3 - x1}) = {slope * (x3 - x1)}. Therefore f({x3}) = {y1} + {slope * (x3 - x1)} = {y3}."
        )
        wrongs = [
            (y1 + x3 - x1, "This treats the slope as 1 instead of using the rate from the two given values."),
            (slope, "This reports the slope, but the question asks for a function value."),
            (y2 - slope * (x3 - x1), "This subtracts the wrong horizontal distance from the later value."),
        ]
        return make_question(spec, prompt, y3, explanation, wrongs, "linear_function_interpolate", "interpolate a function value", "function values", "reporting slope instead of output", "Medium because the student must use slope to infer a new output.")

    slope = 2 + i % 5
    b = -5 + i % 8
    x0 = 2 + i % 6
    h = 3 + i % 7
    gx = slope * x0 + b + h
    prompt = f"The function f is linear and f(x) = {linear_expr(slope, b)}. A new function g is defined by g(x) = f(x) + h. If g({x0}) = {gx}, what is h?"
    explanation = (
        f"Evaluate f at x = {x0}: f({x0}) = {slope}({x0}){signed_const(b)} = {slope * x0 + b}. "
        f"Because g(x) = f(x) + h, the equation g({x0}) = {gx} means {slope * x0 + b} + h = {gx}. "
        f"Subtract {slope * x0 + b} to get h = {h}. This tests function transformation rather than only evaluation."
    )
    wrongs = [
        (slope * x0 + b, "This is f(x0), not the vertical shift h."),
        (gx + slope * x0 + b, "This adds f(x0) instead of subtracting it from g(x0)."),
        (h + slope, "This incorrectly adds the slope to the vertical shift."),
    ]
    return make_question(spec, prompt, h, explanation, wrongs, "linear_function_vertical_shift", "compare f and g at the same input", "function rule", "confusing output value with vertical shift", "Hard because the requested value is a parameter in a related function.", desmos=True)


def gen_linear_systems(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        x = 2 + i % 7
        y = 1 + i % 5
        c1 = x + y
        c2 = x - y
        prompt = f"The system x + y = {c1} and x - y = {c2} has solution (x, y). What is x + 2y?"
        answer = x + 2 * y
        explanation = (
            f"Add the two equations: (x + y) + (x - y) = {c1} + {c2}, so 2x = {c1 + c2} and x = {x}. "
            f"Then y = {c1} - {x} = {y}. The requested expression is x + 2y = {x} + 2({y}) = {answer}."
        )
        wrongs = [
            (x + y, "This is the sum from the first equation, but the question asks for x + 2y."),
            (x, "This stops after finding x and ignores the requested expression."),
            (2 * x + y, "This doubles x instead of doubling y in the expression."),
        ]
        return make_question(spec, prompt, answer, explanation, wrongs, "linear_system_expression", "solve a simple system then evaluate an expression", "two equations", "answering for one variable instead of requested expression", "Easy system structure with clean elimination.")

    if spec.difficulty == "Medium":
        adult = 3 + i % 6
        student = 5 + i % 7
        total = adult + student
        adult_price = 12 + i % 5
        student_price = adult_price - 4
        revenue = adult_price * adult + student_price * student
        prompt = f"At a school event, adult tickets cost {adult_price} dollars and student tickets cost {student_price} dollars. A total of {total} tickets were sold for {revenue} dollars. How many adult tickets were sold?"
        explanation = (
            f"Let a be adult tickets and s be student tickets. Then a + s = {total} and "
            f"{adult_price}a + {student_price}s = {revenue}. Substitute s = {total} - a into the revenue equation: "
            f"{adult_price}a + {student_price}({total} - a) = {revenue}. "
            f"The constant part is {student_price * total}, and the extra per adult ticket is {adult_price - student_price}, so "
            f"{adult_price - student_price}a = {revenue - student_price * total}. Thus a = {adult}."
        )
        wrongs = [
            (student, "This gives the number of student tickets, not adult tickets."),
            (total, "This uses the total number of tickets as if all were adult tickets."),
            (revenue // adult_price, "This divides total revenue by the adult price and ignores student tickets."),
        ]
        return make_question(spec, prompt, adult, explanation, wrongs, "linear_system_ticket_context", "build and solve a two-variable context", "word problem", "returning the other variable", "Medium because students must translate a context into a system.")

    a = 2 + i % 5
    b = 3 + i % 4
    factor = 2 + i % 4
    c = 8 + i
    k = a * factor
    prompt = f"The system {a}x + {b}y = {c} and kx + {b * factor}y = {c * factor} has infinitely many solutions. What is k?"
    explanation = (
        f"For infinitely many solutions, the second equation must be the same line as the first equation. "
        f"The y-coefficient {b * factor} is {factor} times {b}, and the constant {c * factor} is {factor} times {c}. "
        f"So the x-coefficient must also be {factor} times {a}. Therefore k = {factor}({a}) = {k}."
    )
    wrongs = [
        (factor, "This identifies the scale factor but not the scaled x-coefficient k."),
        (a + factor, "This adds the scale factor to the coefficient instead of multiplying."),
        (b * factor, "This copies the scaled y-coefficient into the x-coefficient position."),
    ]
    return make_question(spec, prompt, k, explanation, wrongs, "linear_system_infinite_solutions_parameter", "use proportional coefficients for infinite solutions", "system with parameter", "using the scale factor as the coefficient", "Hard because it tests structure of a system, not routine solving.", desmos=True)


def gen_linear_inequalities(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        a = 2 + i % 5
        threshold = 4 + i % 8
        b = 3 + i % 6
        c = a * threshold + b
        prompt = f"What is the least integer x that satisfies {linear_expr(a, b)} > {c}?"
        answer = threshold + 1
        explanation = (
            f"Subtract {b} from both sides to get {coeff_term(a)} > {c - b}. "
            f"Divide by the positive number {a}, giving x > {threshold}. "
            f"The least integer greater than {threshold} is {answer}."
        )
        wrongs = [
            (threshold, "This is the boundary value, but the inequality is strict."),
            (threshold - 1, "This moves in the wrong direction after finding the boundary."),
            (c - b, f"This stops before dividing by {a}."),
        ]
        return make_question(spec, prompt, answer, explanation, wrongs, "linear_inequality_least_integer", "solve an inequality and interpret integer endpoint", "inequality", "including a strict endpoint", "Easy but checks endpoint interpretation.")

    if spec.difficulty == "Medium":
        base = 18 + i % 8
        rate = 4 + i % 5
        max_n = 6 + i % 8
        budget = base + rate * max_n + (i % 3)
        prompt = f"A club rents a room for a fixed fee of {base} dollars plus {rate} dollars per guest. The club can spend at most {budget} dollars. What is the greatest possible number of guests?"
        answer = (budget - base) // rate
        explanation = (
            f"Let n be the number of guests. The cost condition is {base} + {rate}n <= {budget}. "
            f"Subtract {base} to get {rate}n <= {budget - base}. "
            f"Dividing by {rate} gives n <= {fmt(Fraction(budget - base, rate))}. "
            f"Since n must be a whole number, the greatest possible n is {answer}."
        )
        wrongs = [
            (math.ceil((budget - base) / rate), "This rounds up, which would make the cost exceed the budget."),
            (budget // rate, "This divides the whole budget by the per-guest cost and ignores the fixed fee."),
            (answer - 1, "This is possible but not the greatest possible number of guests."),
        ]
        return make_question(spec, prompt, answer, explanation, wrongs, "linear_inequality_context_max_integer", "model a maximum under a constraint", "word problem", "rounding up when only rounding down is feasible", "Medium because it requires translating and interpreting a whole-number constraint.")

    p = 2 + i % 5
    q = 1 + i % 4
    bound = 5 + i % 7
    rhs = -p * bound + q
    prompt = f"What is the greatest integer x that satisfies -{p}x + {q} >= {rhs}?"
    answer = bound
    explanation = (
        f"Subtract {q} from both sides to get -{p}x >= {rhs - q}. "
        f"Dividing by -{p} reverses the inequality, so x <= {bound}. "
        f"The greatest integer satisfying x <= {bound} is {bound}. The sign reversal is the central trap."
    )
    wrongs = [
        (bound + 1, "This would be chosen if the inequality sign was not reversed when dividing by a negative."),
        (-bound, "This keeps the negative sign attached to the boundary after division."),
        (rhs - q, "This stops after subtracting the constant and before dividing by the coefficient."),
    ]
    return make_question(spec, prompt, answer, explanation, wrongs, "negative_coefficient_inequality", "reverse inequality when dividing by a negative", "inequality", "not flipping inequality sign", "Hard because a sign-rule error changes the endpoint direction.")


def gen_equivalent_expressions(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.qtype == "multiple_choice":
        a = 2 + i % 5
        b = 3 + i % 6
        c = 1 + i % 4
        coef = a + b - c
        const = a * b
        prompt = f"Which expression is equivalent to (x + {a})(x + {b}) - x(x + {c})?"
        answer = f"{linear_expr(coef, const)}"
        explanation = (
            f"Expand the first product: (x + {a})(x + {b}) = x^2 + {a + b}x + {const}. "
            f"Also x(x + {c}) = x^2 + {c}x. Subtracting cancels the x^2 terms and leaves "
            f"({a + b}x - {c}x) + {const}, which is {answer}. The structure is simpler than full quadratic solving."
        )
        wrongs = [
            (f"x^2 + {linear_expr(a + b - c, const)}", "This forgets that the x^2 terms cancel when the second product is subtracted."),
            (f"{linear_expr(a + b + c, const)}", "This adds the c x term instead of subtracting it."),
            (f"{linear_expr(coef, a + b)}", "This uses a + b as the constant instead of the product ab."),
        ]
        return make_question(spec, prompt, answer, explanation, wrongs, "equivalent_expression_cancel_quadratic", "expand and cancel structure", "symbolic expression", "forgetting cancellation", "Equivalent-expression item focused on structure.", desmos=False)

    m = 3 + i % 7
    n = 2 + i % 6
    bcoef = m + n
    c = m * n
    answer = bcoef + c
    prompt = f"For all x, x^2 + bx + c is equivalent to (x + {m})(x + {n}). What is b + c?"
    explanation = (
        f"Expand the product: (x + {m})(x + {n}) = x^2 + ({m} + {n})x + {m * n}. "
        f"So b = {bcoef} and c = {c}. Therefore b + c = {bcoef} + {c} = {answer}. "
        f"The trap is to add the factors for both coefficients, but the constant is the product."
    )
    wrongs = [
        (bcoef, "This gives b only and omits c."),
        (c, "This gives c only and omits b."),
        (2 * bcoef, "This incorrectly uses the sum of the factors for both b and c."),
    ]
    return make_question(spec, prompt, answer, explanation, wrongs, "equivalent_expression_factor_coefficients", "identify coefficients after expansion", "symbolic expression", "using sum where product is needed", "SPR form asks for a numeric coefficient expression.")


def gen_nonlinear_equations(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        r = 3 + i % 6
        s = 2 + i % 5
        prompt = f"The equation (x - {r})(x + {s}) = 0 has two solutions. What is the positive solution?"
        explanation = (
            f"By the zero-product property, either x - {r} = 0 or x + {s} = 0. "
            f"These give x = {r} and x = -{s}. The positive solution is {r}."
        )
        wrongs = [
            (-s, "This is the negative solution, but the question asks for the positive solution."),
            (s, "This drops the negative sign from the second solution."),
            (r + s, "This adds the constants instead of solving each factor equal to zero."),
        ]
        return make_question(spec, prompt, r, explanation, wrongs, "quadratic_zero_product_positive_root", "apply zero-product property", "factored equation", "choosing the wrong root", "Direct factored quadratic recognition.")

    if spec.difficulty == "Medium":
        r = 2 + i % 6
        s = r + 3 + i % 5
        S = r + s
        P = r * s
        answer = s - r
        prompt = f"The solutions to x^2 - {S}x + {P} = 0 are r and s, where s > r. What is s - r?"
        explanation = (
            f"Factor the quadratic by finding two numbers with sum {S} and product {P}. "
            f"Those numbers are {r} and {s}, so x^2 - {S}x + {P} = (x - {r})(x - {s}). "
            f"The solutions are r = {r} and s = {s}; therefore s - r = {answer}."
        )
        wrongs = [
            (S, "This is the sum of the roots, not their difference."),
            (P, "This is the product of the roots, not their difference."),
            (r + s + answer, "This combines the sum and difference instead of using only s - r."),
        ]
        return make_question(spec, prompt, answer, explanation, wrongs, "quadratic_roots_difference", "factor and compare roots", "quadratic equation", "using sum/product instead of requested difference", "Medium because it asks for a relationship between roots, not just a root.")

    variant = i % 3
    if variant == 0:
        p = 4 + ((2 * i + i // 3) % 17)
        k = p * p
        prompt = f"The equation x^2 - {2 * p}x + k = 0 has exactly one real solution. What is k?"
        explanation = (
            f"A quadratic has exactly one real solution when its discriminant is 0. "
            f"For x^2 - {2 * p}x + k = 0, the discriminant is ({-2 * p})^2 - 4(1)(k). "
            f"Set it equal to 0: {4 * p * p} - 4k = 0, so k = {k}. "
            f"This is about the parameter k, not the repeated root."
        )
        wrongs = [
            (p, "This is the repeated root, not the value of k."),
            (2 * p, "This uses the middle coefficient size instead of the discriminant condition."),
            (4 * p * p, "This forgets the division by 4 in the discriminant equation."),
        ]
        return make_question(spec, prompt, k, explanation, wrongs, "quadratic_discriminant_one_solution", "set discriminant equal to zero", "quadratic with parameter", "giving repeated root instead of parameter", "Hard because the parameter is found from a condition on number of solutions.", desmos=True)

    if variant == 1:
        b = 2 + i % 8
        sol = b + 5 + (i // 3)
        a = (sol - b) ** 2 - sol
        prompt = f"What is the solution to sqrt(x + {a}) = x - {b}?"
        explanation = (
            f"The right side must be nonnegative, so x >= {b}. Square both sides: "
            f"x + {a} = (x - {b})^2. The intended solution is checked directly: "
            f"sqrt({sol} + {a}) = sqrt({sol + a}) = {sol - b}, and {sol} - {b} = {sol - b}. "
            f"Any other root from the squared equation would need this original-equation check, so x = {sol}."
        )
        wrongs = [
            (b, "This is only the lower bound from x - b >= 0, not the solution."),
            (sol - b, "This is the square-root value after substitution, not x."),
            (-(sol - b), "This comes from ignoring the nonnegative condition on the square root."),
        ]
        return make_question(spec, prompt, sol, explanation, wrongs, "radical_equation_extraneous_check", "solve and verify a radical equation", "radical equation", "forgetting extraneous-solution check", "Hard because squaring can introduce an invalid root.", desmos=True)

    r = 2 + i % 8
    target = 9 + i % 7
    sol = target - r
    prompt = f"For x != {r}, (x^2 - {r * r})/(x - {r}) = {target}. What is x?"
    explanation = (
        f"Factor the numerator as x^2 - {r * r} = (x - {r})(x + {r}). "
        f"Because x != {r}, the factor x - {r} can be canceled, leaving x + {r} = {target}. "
        f"Then x = {target} - {r} = {sol}. The restriction prevents using x = {r} as a solution."
    )
    wrongs = [
        (r, "This is the excluded value that would make the denominator zero."),
        (target + r, "This adds r instead of subtracting it after simplification."),
        (target, "This stops after the simplified expression equals the target."),
    ]
    return make_question(spec, prompt, sol, explanation, wrongs, "rational_equation_cancel_restriction", "factor and respect domain restriction", "rational equation", "using an excluded value", "Hard because it combines factoring with a domain restriction.")


def gen_nonlinear_functions(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        a = 1 + i % 3
        h = 2 + i % 4
        k = 3 + i % 6
        x0 = h + 2
        value = a * (x0 - h) ** 2 + k
        prompt = f"If f(x) = {a}(x - {h})^2 + {k}, what is f({x0})?"
        explanation = (
            f"Substitute x = {x0}. Then x - {h} = {x0 - h}, so "
            f"f({x0}) = {a}({x0 - h})^2 + {k} = {a * (x0 - h) ** 2} + {k} = {value}."
        )
        wrongs = [
            (a * (x0 - h) + k, "This does not square x - h before multiplying."),
            ((x0 - h) ** 2 + k, "This forgets to multiply by the leading coefficient."),
            (a * x0 * x0 + k, "This ignores the horizontal shift inside the parentheses."),
        ]
        return make_question(spec, prompt, value, explanation, wrongs, "quadratic_function_evaluate_vertex_form", "evaluate a nonlinear function", "function rule", "forgetting the square", "Direct substitution into vertex form.")

    if spec.difficulty == "Medium":
        a = 1 + i % 3
        h = -3 + i % 7
        k = -5 + i % 11
        prompt = f"The function f(x) = {a}(x - {h})^2 + {k} has a minimum value. What is the minimum value of f?"
        explanation = (
            f"The expression (x - {h})^2 is always at least 0. Since the coefficient {a} is positive, "
            f"the smallest value occurs when x - {h} = 0. At that point the squared term contributes 0, "
            f"so the minimum value is {k}."
        )
        wrongs = [
            (h, "This is the x-coordinate of the vertex, not the minimum y-value."),
            (-k, "This changes the sign of the vertical shift."),
            (a + k, "This adds the leading coefficient even though the squared term can be 0."),
        ]
        return make_question(spec, prompt, k, explanation, wrongs, "quadratic_vertex_minimum_value", "interpret vertex form", "function rule", "confusing vertex x-coordinate with y-value", "Medium because it tests function features rather than substitution.", desmos=True)

    variant = i % 2
    if variant == 0:
        h = 2 + i % 6
        k = -4 + i % 9
        x0 = h + 3
        value = 20 + i
        a = Fraction(value - k, (x0 - h) ** 2)
        prompt = f"The quadratic function f(x) = a(x - {h})^2{signed_const(k)} has f({x0}) = {value}. What is a?"
        explanation = (
            f"Substitute x = {x0} and f({x0}) = {value}: "
            f"{value} = a({x0} - {h})^2{signed_const(k)}. "
            f"Since ({x0} - {h})^2 = {(x0 - h) ** 2}, subtract the vertical shift to get "
            f"{value - k} = {(x0 - h) ** 2}a. Thus a = {fmt(a)}."
        )
        wrongs = [
            (value - k, "This is the adjusted output before dividing by the squared horizontal distance."),
            (Fraction(value, (x0 - h) ** 2), "This forgets to remove the vertical shift before dividing."),
            (Fraction(value - k, x0 - h), "This divides by x - h instead of by (x - h)^2."),
        ]
        return make_question(spec, prompt, a, explanation, wrongs, "quadratic_parameter_from_value", "substitute into vertex form to solve a parameter", "quadratic function", "dividing by x-h instead of its square", "Hard because a parameter is hidden inside a nonlinear function.", desmos=True)

    p = 2 + i % 5
    q = 3 + i % 4
    n = 2 + i % 3
    start = p
    later = p * (q**n)
    prompt = f"An exponential function f has f(0) = {start} and f({n}) = {later}. If the growth factor is constant for each increase of 1 in x, what is f({n + 1})?"
    answer = later * q
    explanation = (
        f"From x = 0 to x = {n}, the output is multiplied by {later}/{start} = {q**n}. "
        f"Because this occurs over {n} equal x-steps, the per-step growth factor is {q}. "
        f"Therefore f({n + 1}) = f({n}) times {q} = {later}({q}) = {answer}."
    )
    wrongs = [
        (later + q, "This adds the growth factor instead of multiplying by it."),
        (later * (q**n), "This applies all n steps again instead of one more step."),
        (later + (later - start), "This treats exponential growth as a constant additive change."),
    ]
    return make_question(spec, prompt, answer, explanation, wrongs, "exponential_growth_factor_next_value", "infer and apply exponential growth factor", "function values", "using additive change for exponential growth", "Hard because it requires distinguishing growth factor from total growth.", desmos=True)


def gen_nonlinear_systems(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Easy":
        x = 2 + i % 5
        y = x * x
        prompt = f"The system y = x^2 and y = {y} has two solutions for x. What is the positive value of x?"
        explanation = (
            f"Substitute y = {y} into y = x^2 to get x^2 = {y}. "
            f"The two x-values are {x} and -{x}. The positive value is {x}."
        )
        wrongs = [
            (-x, "This is the negative solution, but the question asks for the positive value."),
            (y, "This is the y-value, not the x-value."),
            (2 * x, "This doubles the square root instead of taking the positive square root."),
        ]
        return make_question(spec, prompt, x, explanation, wrongs, "nonlinear_system_horizontal_line", "substitute one equation into another", "system of equations", "returning y instead of x", "Easy nonlinear system with direct substitution.", desmos=True)

    if spec.difficulty == "Medium":
        r = 2 + i % 5
        s = r + 2 + i % 4
        m = r + s
        b = -r * s
        answer = r + s
        prompt = f"The graphs of y = x^2 and y = {linear_expr(m, b)} intersect at x = {r} and x = {s}. What is the sum of the two x-coordinates of the intersection points?"
        explanation = (
            f"At an intersection, x^2 = {linear_expr(m, b)}. "
            f"This gives x^2 - {m}x{signed_const(-b)} = 0, which factors as (x - {r})(x - {s}) = 0. "
            f"The x-coordinates are {r} and {s}, so their sum is {answer}."
        )
        wrongs = [
            (r * s, "This is the product of the intersection x-coordinates, not their sum."),
            (m, "This equals the sum here only after factoring; choosing it without identifying the roots misses the system reasoning."),
            (abs(b), "This is the product term from the quadratic, not the requested sum."),
        ]
        return make_question(spec, prompt, answer, explanation, wrongs, "quadratic_line_intersection_sum", "convert intersections to a quadratic equation", "line and parabola system", "using product instead of sum", "Medium because it connects graph intersections with roots.", desmos=True)

    variant = i % 2
    if variant == 0:
        h = 3 + i % 7
        line_y = 5 + i % 9
        k = line_y + h * h
        prompt = f"The system y = x^2 - {2 * h}x + k and y = {line_y} has exactly one solution. What is k?"
        explanation = (
            f"The parabola y = x^2 - {2 * h}x + k has vertex at x = {h}. "
            f"Its vertex value is {h}^2 - {2 * h}({h}) + k = k - {h * h}. "
            f"For the horizontal line y = {line_y} to intersect the parabola exactly once, it must touch the vertex, "
            f"so k - {h * h} = {line_y}. Therefore k = {k}."
        )
        wrongs = [
            (line_y, "This copies the line's y-value and ignores the vertex shift."),
            (h * h, "This is the square used in the vertex value, not k."),
            (line_y - h * h, "This subtracts h^2 when the equation requires adding it."),
        ]
        return make_question(spec, prompt, k, explanation, wrongs, "parabola_line_tangent_parameter", "use tangency condition for one intersection", "nonlinear system with parameter", "copying the line value instead of adjusting vertex", "Hard because one solution means tangency, not routine substitution.", desmos=True)

    r = 2 + i % 5
    s = r + 3 + i % 4
    c = r * s
    m = r + s
    expr = r + 2 * s
    prompt = f"The system y = x^2 - {m}x + {c} and y = 0 has solutions x = r and x = s, where r < s. What is r + 2s?"
    explanation = (
        f"The equation x^2 - {m}x + {c} = 0 factors as (x - {r})(x - {s}) = 0 because "
        f"{r} + {s} = {m} and {r}({s}) = {c}. "
        f"Thus r = {r} and s = {s}. The requested value is r + 2s = {r} + 2({s}) = {expr}."
    )
    wrongs = [
        (r + s, "This gives the sum of the roots but does not double s as requested."),
        (2 * r + s, "This doubles the smaller root instead of the larger root."),
        (c, "This is the product of the roots, not the requested expression."),
    ]
    return make_question(spec, prompt, expr, explanation, wrongs, "nonlinear_system_roots_expression", "factor a system reduced to a quadratic", "quadratic system", "using sum/product instead of requested expression", "Hard because the requested expression is not directly a root.", desmos=True)


GENERATORS = {
    "linear_one_var": gen_linear_one_var,
    "linear_two_var": gen_linear_two_var,
    "linear_functions": gen_linear_functions,
    "linear_systems": gen_linear_systems,
    "linear_inequalities": gen_linear_inequalities,
    "equivalent_expressions": gen_equivalent_expressions,
    "nonlinear_equations": gen_nonlinear_equations,
    "nonlinear_functions": gen_nonlinear_functions,
    "nonlinear_systems": gen_nonlinear_systems,
}


def generate_questions() -> list[dict[str, Any]]:
    questions = []
    for spec in build_specs():
        questions.append(GENERATORS[spec.family](spec))
    validate_distribution(questions)
    return questions


def validate_distribution(questions: list[dict[str, Any]]) -> None:
    assert len(questions) == 224
    ids = [q["id"] for q in questions]
    assert len(ids) == len(set(ids))
    by_domain = Counter(q["domain"] for q in questions)
    assert by_domain == {"Algebra": 98, "Advanced Math": 126}
    by_type = Counter(q["questionType"] for q in questions)
    assert by_type == {"multiple_choice": 175, "student_produced_response": 49}
    by_diff = Counter(q["difficulty"] for q in questions)
    assert by_diff == {"Easy": 18, "Medium": 83, "Hard": 123}
    expected_family = {
        "Linear equations in one variable": 18,
        "Linear equations in two variables": 20,
        "Linear functions": 21,
        "Systems of two linear equations in two variables": 25,
        "Linear inequalities in one or two variables": 14,
        "Equivalent expressions": 28,
        "Nonlinear equations in one variable": 38,
        "Nonlinear functions": 35,
        "Systems of equations in two variables": 25,
    }
    assert Counter(q["skill"] for q in questions) == expected_family


def write_draft(questions: list[dict[str, Any]]) -> None:
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    DRAFT_PATH.write_text(json.dumps(questions, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_bank() -> list[dict[str, Any]]:
    return json.loads(BANK_PATH.read_text(encoding="utf-8"))


def append_to_bank(questions: list[dict[str, Any]]) -> dict[str, Any]:
    bank = load_bank()
    existing = {q.get("id") for q in bank if isinstance(q, dict)}
    new_questions = [q for q in questions if q["id"] not in existing]
    if not new_questions:
        return {"appended": 0, "backup": None, "bankCount": len(bank)}
    ARTIFACTS_DIR.mkdir(exist_ok=True)
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
        from scripts.review_pending_questions_expert_gate_20260524 import (
            active_reviewed_prompt_index,
            equivalent_choice_issues,
            generation_artifact_issues,
            symbol_quality_issues,
        )
    except ModuleNotFoundError:
        from audit_reviewed_question_expert_quality import reviewed_issue_row
        from review_pending_questions_expert_gate_20260524 import (
            active_reviewed_prompt_index,
            equivalent_choice_issues,
            generation_artifact_issues,
            symbol_quality_issues,
        )

    seen_prompts: dict[str, str] = {}
    reviewed_prompts = active_reviewed_prompt_index()
    rows = []
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
        row["blockers"] = sorted(set(blockers))
        row["pass"] = not row["blockers"] and not row["issues"] and not row["warnings"] and not row["depthFlags"]
        rows.append(row)
        counters["domain"][str(item.get("domain"))] += 1
        counters["skill"][str(item.get("skill"))] += 1
        counters["difficulty"][str(item.get("difficulty"))] += 1
        counters["questionType"][str(item.get("questionType"))] += 1
        counters["targetBand"][str(item.get("targetBand"))] += 1
        counters["reviewStatus"][str(item.get("reviewStatus"))] += 1
        for key in ("blockers", "issues", "warnings", "depthFlags"):
            for value in row.get(key) or []:
                counters[key][value] += 1
    failures = [row for row in rows if not row["pass"]]
    report = {
        "batchId": BATCH_ID,
        "auditName": audit_name,
        "generatedAt": utc_now(),
        "count": len(questions),
        "passCount": len(rows) - len(failures),
        "failureCount": len(failures),
        "distribution": {key: dict(counter) for key, counter in counters.items()},
        "failureSample": failures[:50],
        "rows": rows,
    }
    out = ARTIFACTS_DIR / f"strategy-math-224-audit-{audit_name}-20260525.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def summarize(report: dict[str, Any]) -> str:
    return json.dumps(
        {
            "batchId": report["batchId"],
            "auditName": report["auditName"],
            "count": report["count"],
            "passCount": report["passCount"],
            "failureCount": report["failureCount"],
            "distribution": report["distribution"],
        },
        indent=2,
        ensure_ascii=False,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-draft", action="store_true")
    parser.add_argument("--append", action="store_true")
    parser.add_argument("--audit-name", default="pass1")
    parser.add_argument("--audit-bank", action="store_true")
    parser.add_argument("--require-clean", action="store_true")
    args = parser.parse_args()

    questions = load_batch_from_bank() if args.audit_bank else generate_questions()
    if args.write_draft and not args.audit_bank:
        write_draft(questions)
    report = audit_questions(questions, args.audit_name)
    print(summarize(report))
    if args.require_clean and report["failureCount"]:
        raise SystemExit(f"Audit {args.audit_name} failed: {report['failureCount']} item(s)")
    if args.append:
        result = append_to_bank(questions)
        print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
