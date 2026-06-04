"""Generate SAT Studio strategic Math batch 200.

Focus:
- Algebra hard/context items to pull Algebra toward the SAT Math blueprint.
- Advanced Math nonlinear equations/systems to close the remaining Advanced
  Math gap without adding PSDA.

The batch is written as needs_review first. Run two clean audits, then promote
with the expert gate.
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
BATCH_ID = "strategy-math-200-20260525"
SOURCE_REFERENCE = "scripts/generate_strategy_math_200_20260525.py"
DRAFT_PATH = ARTIFACTS_DIR / "strategy-math-200-draft-20260525.json"

base.BATCH_ID = BATCH_ID
base.SOURCE_REFERENCE = SOURCE_REFERENCE
base.DRAFT_PATH = DRAFT_PATH


FAMILY_PLAN = [
    {
        "family": "alg_one_var_context",
        "domain": "Algebra",
        "skill": "Linear equations in one variable",
        "total": 13,
        "difficulty": {"Medium": 3, "Hard": 10},
        "format": {"multiple_choice": 12, "student_produced_response": 1},
    },
    {
        "family": "alg_two_var_context",
        "domain": "Algebra",
        "skill": "Linear equations in two variables",
        "total": 30,
        "difficulty": {"Medium": 7, "Hard": 23},
        "format": {"multiple_choice": 27, "student_produced_response": 3},
    },
    {
        "family": "alg_linear_function_context",
        "domain": "Algebra",
        "skill": "Linear functions",
        "total": 35,
        "difficulty": {"Medium": 8, "Hard": 27},
        "format": {"multiple_choice": 32, "student_produced_response": 3},
    },
    {
        "family": "alg_system_context",
        "domain": "Algebra",
        "skill": "Systems of two linear equations in two variables",
        "total": 45,
        "difficulty": {"Medium": 10, "Hard": 35},
        "format": {"multiple_choice": 41, "student_produced_response": 4},
    },
    {
        "family": "alg_inequality_context",
        "domain": "Algebra",
        "skill": "Linear inequalities in one or two variables",
        "total": 20,
        "difficulty": {"Medium": 5, "Hard": 15},
        "format": {"multiple_choice": 17, "student_produced_response": 3},
    },
    {
        "family": "adv_nonlinear_equation",
        "domain": "Advanced Math",
        "skill": "Nonlinear equations in one variable",
        "total": 45,
        "difficulty": {"Medium": 8, "Hard": 37},
        "format": {"multiple_choice": 40, "student_produced_response": 5},
    },
    {
        "family": "adv_nonlinear_system",
        "domain": "Advanced Math",
        "skill": "Systems of equations in two variables",
        "total": 12,
        "difficulty": {"Medium": 4, "Hard": 8},
        "format": {"multiple_choice": 11, "student_produced_response": 1},
    },
]


CONTEXTS = [
    ("a tutoring center", "sessions"),
    ("a robotics club", "parts"),
    ("a school bookstore", "notebooks"),
    ("a museum program", "tickets"),
    ("a science lab", "samples"),
    ("a language academy", "practice sets"),
    ("a delivery service", "orders"),
    ("an art workshop", "kits"),
    ("a music studio", "lessons"),
    ("a training camp", "drills"),
    ("a library event", "registrations"),
    ("a coding bootcamp", "projects"),
    ("a theater group", "seats"),
    ("a garden club", "planters"),
    ("a debate team", "rounds"),
    ("a fitness class", "passes"),
    ("a research team", "trials"),
    ("a design studio", "mockups"),
    ("a volunteer group", "routes"),
    ("a summer school", "modules"),
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def context(index: int) -> tuple[str, str]:
    return CONTEXTS[(index - 1) % len(CONTEXTS)]


def spec_list() -> list[base.Spec]:
    specs: list[base.Spec] = []
    global_index = 1
    for plan in FAMILY_PLAN:
        difficulties: list[str] = []
        for difficulty in ("Medium", "Hard"):
            difficulties.extend([difficulty] * plan["difficulty"][difficulty])
        total = plan["total"]
        spr_count = plan["format"]["student_produced_response"]
        spr_positions = {round((i + 1) * total / (spr_count + 1)) - 1 for i in range(spr_count)}
        qtypes = ["student_produced_response" if i in spr_positions else "multiple_choice" for i in range(total)]
        assert len(difficulties) == total
        assert Counter(qtypes)["student_produced_response"] == spr_count
        for family_index in range(total):
            specs.append(
                base.Spec(
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
    assert len(specs) == 200
    return specs


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
        extra_tags=extra_tags or ["context_model", "hard_reasoning"],
    )
    item["sourceName"] = "SAT Studio strategic Algebra/Advanced Math batch 200"
    item["metadata"]["generatedBatch"] = BATCH_ID
    item["contentTags"].append("Algebra Advanced Math balance batch")
    if spec.difficulty == "Hard":
        item["contentTags"].append("multi_step_context")
        item["calculatorUse"]["tags"] = sorted(set(item["calculatorUse"]["tags"] + ["multi_step_context"]))
        item["calculatorTags"] = item["calculatorUse"]["tags"]
    return item


def gen_alg_one_var_context(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i)
    fixed = 35 + i % 12
    rate = 4 + i % 7
    extra = 2 + i % 5
    target = fixed + rate * (8 + i % 8) + extra
    n = (target - fixed - extra) // rate
    if spec.difficulty == "Medium":
        prompt = (
            f"In {place}, a linear cost model uses a fixed fee of {fixed} dollars plus {rate} dollars for each of n {unit}. "
            f"After an additional {extra}-dollar processing charge, the total is {target} dollars. What is n?"
        )
        explanation = (
            f"The model is {fixed} + {rate}n + {extra} = {target}. Combine the fixed charges first: "
            f"{fixed} + {extra} = {fixed + extra}, so {rate}n + {fixed + extra} = {target}. "
            f"Subtract {fixed + extra} to get {rate}n = {target - fixed - extra}. Dividing by {rate} gives n = {n}."
        )
        wrongs = [
            (n + 1, "This is a nearby value produced by subtracting only one of the fixed charges."),
            ((target - fixed) // rate, "This forgets to subtract the additional processing charge before dividing."),
            (target // rate, "This divides the total by the per-unit rate and ignores all fixed charges."),
        ]
        return make(spec, prompt, n, explanation, wrongs, "context_linear_one_var_total", "translate a cost model and isolate the variable", "word problem linear model", "forgetting one fixed charge", "Medium because the setup is the main task.", desmos=False)

    bonus = 5 + i % 6
    observed = fixed + rate * n - bonus
    prompt = (
        f"In {place}, a planning model predicts a total of {fixed} + {rate}n dollars for n {unit}. "
        f"The final total was {observed} dollars after a discount of {bonus} dollars was applied. "
        f"To audit the model, the manager needs the value of n that produced this final total. What is n?"
    )
    explanation = (
        f"The final total is the model total minus the discount, so {fixed} + {rate}n - {bonus} = {observed}. "
        f"Add {bonus} back to both sides to recover the model total: {fixed} + {rate}n = {observed + bonus}. "
        f"Then subtract {fixed}, giving {rate}n = {observed + bonus - fixed}. Divide by {rate} to get n = {n}."
    )
    wrongs = [
        ((observed - fixed) // rate, "This treats the discounted total as the model total and never adds the discount back."),
        ((observed + bonus) // rate, "This adds back the discount but forgets to subtract the fixed fee."),
        (n + bonus, "This adds the discount amount to the number of units even though the discount is measured in dollars."),
    ]
    return make(spec, prompt, n, explanation, wrongs, "context_linear_one_var_discount", "undo a contextual adjustment before isolating the variable", "word problem linear model", "using discounted total as original model total", "Hard because the student must reverse the context before solving.", desmos=False)


def gen_alg_two_var_context(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 20)
    m = Fraction(2 + i % 6, 1)
    b = -10 + i % 17
    x0 = 6 + i % 9
    y0 = m * x0 + b
    if spec.difficulty == "Medium":
        prompt = (
            f"A line is used as a model for {place}. The model predicts y = {base.coeff_term(m)} + b, "
            f"where x is the number of {unit} and y is the score. If the model gives y = {base.fmt(y0)} when x = {x0}, what is b?"
        )
        explanation = (
            f"Substitute x = {x0} and y = {base.fmt(y0)} into the model. This gives "
            f"{base.fmt(y0)} = {base.fmt(m)}({x0}) + b. Since {base.fmt(m * x0)} is the rate part, "
            f"b = {base.fmt(y0)} - {base.fmt(m * x0)} = {base.fmt(b)}."
        )
        wrongs = [
            (m * x0, "This is the rate part of the model, not the intercept b."),
            (y0 + m * x0, "This adds the rate part instead of subtracting it."),
            (m, "This copies the slope and ignores the given point."),
        ]
        return make(spec, prompt, b, explanation, wrongs, "context_line_intercept_from_point", "use a point to solve for a linear model intercept", "contextual line model", "copying slope instead of finding intercept", "Medium because the student must connect a point to a model parameter.", desmos=True)

    a = 3 + i % 8
    slope_num = 2 + i % 5
    slope_den = 1 + i % 3
    slope = Fraction(slope_num, slope_den)
    k = -Fraction(a, 1) / slope
    c = 20 + i
    prompt = (
        f"In a graph for {place}, the line ax + ky = c models the relationship between x {unit} and a total score y. "
        f"For one version of the model, a = {a} and c = {c}. The line must be parallel to a benchmark line with slope {base.fmt(slope)}. "
        f"What value of k makes the two model lines parallel?"
    )
    explanation = (
        f"A line written as ax + ky = c has slope -a/k. With a = {a}, the slope is -{a}/k. "
        f"Parallel lines have equal slopes, so -{a}/k = {base.fmt(slope)}. "
        f"Solving gives k = -{a}/({base.fmt(slope)}) = {base.fmt(k)}. The constant c does not affect slope."
    )
    wrongs = [
        (-slope, "This changes the sign of the benchmark slope but never solves for the y-coefficient k."),
        (Fraction(a, 1) / slope, "This has the correct magnitude but misses the negative sign in the standard-form slope."),
        (c, "This uses the constant c even though c does not affect parallelism."),
    ]
    return make(spec, prompt, k, explanation, wrongs, "context_parallel_line_coefficient", "match slopes in a contextual line model", "graph/model line", "using constant term to decide slope", "Hard because it requires extracting slope structure from standard form.", desmos=True)


def gen_alg_linear_function_context(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 45)
    rate = 3 + i % 7
    start = 12 + i % 20
    x1 = 2 + i % 5
    x2 = x1 + 4 + i % 4
    y1 = start + rate * x1
    y2 = start + rate * x2
    if spec.difficulty == "Medium":
        x3 = x1 + 2
        y3 = start + rate * x3
        prompt = (
            f"A table for {place} shows a linear function f, where x is the number of {unit}. "
            f"The table includes f({x1}) = {y1} and f({x2}) = {y2}. Assuming the same rate of change, what is f({x3})?"
        )
        explanation = (
            f"The rate of change is ({y2} - {y1})/({x2} - {x1}) = {y2 - y1}/{x2 - x1} = {rate}. "
            f"From x = {x1} to x = {x3}, x increases by {x3 - x1}, so the output increases by "
            f"{rate}({x3 - x1}) = {rate * (x3 - x1)}. Therefore f({x3}) = {y1} + {rate * (x3 - x1)} = {y3}."
        )
        wrongs = [
            (rate, "This reports the rate of change instead of the requested function value."),
            (y1 + x3 - x1, "This assumes a rate of 1 instead of calculating the rate from the table."),
            (y2 - rate * (x3 - x1), "This subtracts the wrong horizontal distance from the later output."),
        ]
        return make(spec, prompt, y3, explanation, wrongs, "context_linear_function_table_interpolation", "interpolate using a linear rate", "table/function context", "reporting rate instead of output", "Medium because it uses two table entries to find a third.", desmos=True)

    target = y2 + rate * 3
    x_target = x2 + 3
    prompt = (
        f"A table in {place} is modeled by a linear function f. The entries f({x1}) = {y1} and f({x2}) = {y2} "
        f"come from the same constant rate, where x counts completed {unit}. The coordinator wants to know when the model first reaches {target}. "
        f"What value of x gives f(x) = {target}?"
    )
    explanation = (
        f"First find the rate: ({y2} - {y1})/({x2} - {x1}) = {rate}. "
        f"Using f({x2}) = {y2}, the output must increase by {target} - {y2} = {target - y2}. "
        f"At {rate} units of output per 1 unit of x, this requires {(target - y2) // rate} more x-units. "
        f"Thus x = {x2} + {(target - y2) // rate} = {x_target}."
    )
    wrongs = [
        (target - y2, "This is the needed output increase, not the needed input increase."),
        (x2 + target - y2, "This adds output change directly to x without dividing by the rate."),
        (rate, "This gives the rate but not the input value that reaches the target."),
    ]
    return make(spec, prompt, x_target, explanation, wrongs, "context_linear_function_inverse_target", "use a linear model backward from target output", "table/function context", "using output change as input change", "Hard because it reverses a linear model in context.", desmos=True)


def gen_alg_system_context(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 80)
    x = 3 + i % 9
    y = 4 + i % 8
    total = x + y
    p = 9 + i % 7
    q = p + 4 + i % 5
    revenue = p * x + q * y
    if spec.difficulty == "Medium":
        prompt = (
            f"At {place}, standard {unit} cost {p} dollars each and premium {unit} cost {q} dollars each. "
            f"A total of {total} items were sold for {revenue} dollars. How many premium items were sold?"
        )
        explanation = (
            f"Let s be standard items and r be premium items. Then s + r = {total} and {p}s + {q}r = {revenue}. "
            f"Substitute s = {total} - r into the revenue equation: {p}({total} - r) + {q}r = {revenue}. "
            f"The base revenue is {p * total}, and each premium item adds {q - p} dollars, so "
            f"{q - p}r = {revenue - p * total}. Therefore r = {y}."
        )
        wrongs = [
            (x, "This is the number of standard items, not premium items."),
            (total, "This treats every item as premium."),
            (revenue // q, "This divides the total revenue by the premium price and ignores standard items."),
        ]
        return make(spec, prompt, y, explanation, wrongs, "context_linear_system_two_prices", "translate and solve a two-price system", "word problem system", "returning the other variable", "Medium because it requires a two-equation model.", desmos=True)

    multiplier = 2 + i % 5
    a = 2 + i % 6
    b = 3 + i % 5
    c = a * x + b * y
    k = a * multiplier
    prompt = (
        f"A model for {place} uses the system {a}x + {b}y = {c} and kx + {b * multiplier}y = {c * multiplier}. "
        f"The two equations must represent the same line so that the system has infinitely many solutions. "
        f"The second equation was formed by multiplying the first equation by one constant. What is k?"
    )
    explanation = (
        f"For infinitely many solutions, all coefficients and the constant must be scaled by the same factor. "
        f"The y-coefficient changed from {b} to {b * multiplier}, so the scale factor is {multiplier}. "
        f"The constant also changed from {c} to {c * multiplier}, confirming the same scale factor. "
        f"Thus the x-coefficient must be {multiplier} times {a}, so k = {k}."
    )
    wrongs = [
        (multiplier, "This is only the scale factor, not the scaled x-coefficient."),
        (a + multiplier, "This adds the scale factor instead of multiplying by it."),
        (b * multiplier, "This copies the scaled y-coefficient into the x-coefficient position."),
    ]
    return make(spec, prompt, k, explanation, wrongs, "context_linear_system_infinite_parameter", "use proportional coefficients for an infinite-solution system", "contextual system with parameter", "using the scale factor as the answer", "Hard because it tests system structure rather than routine solving.", desmos=True)


def gen_alg_inequality_context(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    place, unit = context(i + 120)
    fixed = 24 + i % 17
    rate = 5 + i % 6
    max_n = 7 + i % 10
    budget = fixed + rate * max_n + (i % 4)
    if spec.difficulty == "Medium":
        answer = (budget - fixed) // rate
        prompt = (
            f"For {place}, a budget model is {fixed} + {rate}n <= {budget}, where n is the number of {unit}. "
            f"Only whole numbers of {unit} can be chosen. What is the greatest possible value of n?"
        )
        explanation = (
            f"Subtract the fixed amount: {rate}n <= {budget - fixed}. "
            f"Divide by {rate} to get n <= {base.fmt(Fraction(budget - fixed, rate))}. "
            f"Because n must be a whole number, the greatest possible n is {answer}."
        )
        wrongs = [
            (answer + 1, "This rounds up and would exceed the budget."),
            (budget // rate, "This ignores the fixed amount in the model."),
            (answer - 1, "This is allowed but is not the greatest possible value."),
        ]
        return make(spec, prompt, answer, explanation, wrongs, "context_inequality_max_whole_number", "solve and interpret a whole-number inequality", "budget inequality", "rounding up past a constraint", "Medium because the endpoint must be interpreted in context.", desmos=False)

    lower = 4 + i % 8
    bonus = 2 + i % 5
    rhs = -rate * lower + bonus
    prompt = (
        f"In an efficiency model for {place}, the expression -{rate}n + {bonus} represents the amount of unused capacity after n {unit}. "
        f"The coordinator requires unused capacity to be at least {rhs}. What is the greatest integer n that satisfies -{rate}n + {bonus} >= {rhs}?"
    )
    explanation = (
        f"Subtract {bonus} from both sides to get -{rate}n >= {rhs - bonus}. "
        f"Dividing by -{rate} reverses the inequality, giving n <= {lower}. "
        f"The greatest integer that satisfies this condition is {lower}. The inequality reversal is the key step."
    )
    wrongs = [
        (lower + 1, "This fails because the inequality sign must reverse after division by a negative."),
        (-lower, "This keeps the negative sign attached to the boundary after division."),
        (rhs - bonus, "This stops before dividing by the coefficient."),
    ]
    return make(spec, prompt, lower, explanation, wrongs, "context_negative_inequality_capacity", "solve an inequality with a negative coefficient in context", "capacity inequality", "not reversing the inequality sign", "Hard because the context hides a sign-sensitive inequality.", desmos=False)


def gen_adv_nonlinear_equation(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    variant = i % 4
    if spec.difficulty == "Medium":
        r = 2 + i % 7
        s = r + 3 + i % 5
        sum_roots = r + s
        product = r * s
        answer = s - r
        prompt = (
            f"A quadratic model has zeros r and s, where r < s. The equation for the zeros is x^2 - {sum_roots}x + {product} = 0. "
            f"What is the value of s - r?"
        )
        explanation = (
            f"Factor the quadratic by finding two numbers with sum {sum_roots} and product {product}. "
            f"Those numbers are {r} and {s}, so the zeros are r = {r} and s = {s}. "
            f"Therefore s - r = {s} - {r} = {answer}."
        )
        wrongs = [
            (sum_roots, "This is the sum of the zeros, not their difference."),
            (product, "This is the product of the zeros, not their difference."),
            (r, "This gives only the smaller zero."),
        ]
        return make(spec, prompt, answer, explanation, wrongs, "quadratic_roots_context_difference", "factor a quadratic and answer a relationship question", "quadratic equation", "using root sum instead of requested difference", "Medium because the answer is a relationship between roots.", desmos=True)

    if variant == 0:
        p = 5 + ((2 * i + i // 4) % 19)
        k = p * p
        prompt = (
            f"A physics club uses the quadratic equation x^2 - {2 * p}x + k = 0 to model the time when a measurement reaches a threshold. "
            f"The model should reach the threshold at exactly one time, so the equation must have exactly one real solution. What is k?"
        )
        explanation = (
            f"A quadratic has exactly one real solution when its discriminant is 0. "
            f"For x^2 - {2 * p}x + k = 0, the discriminant is ({-2 * p})^2 - 4k. "
            f"Set this equal to 0: {4 * p * p} - 4k = 0. Therefore k = {k}."
        )
        wrongs = [
            (p, "This is the repeated solution x-value, not the parameter k."),
            (2 * p, "This copies the middle coefficient size rather than using the discriminant."),
            (4 * p * p, "This forgets to divide by 4 after setting the discriminant equal to 0."),
        ]
        return make(spec, prompt, k, explanation, wrongs, "context_quadratic_discriminant_parameter", "set discriminant equal to zero from a one-solution condition", "contextual quadratic parameter", "giving repeated root instead of parameter", "Hard because the condition is about number of solutions, not direct solving.", desmos=True)

    if variant == 1:
        b = 2 + i % 8
        sol = b + 6 + i // 4
        a = (sol - b) ** 2 - sol
        prompt = (
            f"In a calibration model, x must satisfy sqrt(x + {a}) = x - {b}. "
            f"The right side represents a measured length, so it must be nonnegative. What is the solution x?"
        )
        explanation = (
            f"Because the square root and the measured length are nonnegative, x must be at least {b}. "
            f"Checking the candidate from the squared equation gives sqrt({sol} + {a}) = sqrt({sol + a}) = {sol - b}, "
            f"and {sol} - {b} = {sol - b}. Thus x = {sol}. This check matters because squaring can introduce extraneous roots."
        )
        wrongs = [
            (b, "This is only the lower-bound condition, not the solution."),
            (sol - b, "This is the square-root value after substitution, not x."),
            (-(sol - b), "This ignores that the square-root expression is nonnegative."),
        ]
        return make(spec, prompt, sol, explanation, wrongs, "context_radical_equation_verify", "solve a radical equation and verify the original equation", "radical equation context", "accepting an extraneous result", "Hard because verification is required after squaring.", desmos=True)

    if variant == 2:
        r = 3 + i % 9
        target = 12 + i % 10
        sol = target - r
        prompt = (
            f"A simplified design equation is (x^2 - {r * r})/(x - {r}) = {target}, with x not equal to {r}. "
            f"The excluded value represents a setting that would make the denominator 0. What is x?"
        )
        explanation = (
            f"Factor the numerator: x^2 - {r * r} = (x - {r})(x + {r}). "
            f"Since x cannot equal {r}, cancel x - {r} to get x + {r} = {target}. "
            f"Then x = {target} - {r} = {sol}. The excluded value is not a valid solution."
        )
        wrongs = [
            (r, "This is the excluded value that makes the denominator 0."),
            (target + r, "This adds r instead of subtracting it after simplification."),
            (target, "This stops after the simplified expression equals the target."),
        ]
        return make(spec, prompt, sol, explanation, wrongs, "context_rational_equation_domain", "factor and apply a domain restriction", "rational equation context", "using an excluded value", "Hard because it combines simplification with a domain condition.", desmos=True)

    h = 2 + ((2 * i + i // 4) % 13)
    line_y = 7 + ((3 * i + i // 4) % 17)
    k = line_y + h * h
    prompt = (
        f"A quadratic equation x^2 - {2 * h}x + k = {line_y} is used to find the x-values where a model reaches a target level. "
        f"The model should reach that target at exactly one x-value. What is k?"
    )
    explanation = (
        f"Move all terms to one side: x^2 - {2 * h}x + (k - {line_y}) = 0. "
        f"For exactly one x-value, the discriminant must be 0. Equivalently, the vertex of x^2 - {2 * h}x + k is at x = {h}, "
        f"with value k - {h * h}. Set k - {h * h} = {line_y}, so k = {k}."
    )
    wrongs = [
        (line_y, "This copies the target level and ignores the vertex adjustment."),
        (h * h, "This is the square from the vertex calculation, not k."),
        (line_y - h * h, "This subtracts h^2 when the equation requires adding it."),
    ]
    return make(spec, prompt, k, explanation, wrongs, "context_quadratic_target_one_solution", "use vertex/discriminant condition for one solution", "quadratic target equation", "copying target level instead of parameter", "Hard because one solution must be interpreted as tangency or zero discriminant.", desmos=True)


def gen_adv_nonlinear_system(spec: base.Spec) -> dict[str, Any]:
    i = spec.family_index
    if spec.difficulty == "Medium":
        r = 2 + i % 5
        s = r + 3 + i % 4
        m = r + s
        b = -r * s
        prompt = (
            f"The graph of y = x^2 and the graph of y = {base.linear_expr(m, b)} intersect at two points. "
            f"What is the sum of the x-coordinates of the intersection points?"
        )
        explanation = (
            f"At an intersection, x^2 = {base.linear_expr(m, b)}. "
            f"Rearrange to x^2 - {m}x{base.signed_const(-b)} = 0, which factors as (x - {r})(x - {s}) = 0. "
            f"The x-coordinates are {r} and {s}, so their sum is {r + s}."
        )
        wrongs = [
            (r * s, "This is the product of the x-coordinates, not their sum."),
            (abs(b), "This is the constant term magnitude after rearranging."),
            (s - r, "This is the distance between the x-coordinates, not their sum."),
        ]
        return make(spec, prompt, r + s, explanation, wrongs, "line_parabola_intersection_sum", "turn graph intersections into a quadratic equation", "line and parabola system", "using product instead of sum", "Medium because it links intersections to roots.", desmos=True)

    h = 3 + i % 8
    target = 5 + i % 11
    k = target + h * h
    prompt = (
        f"A line y = {target} and a parabola y = x^2 - {2 * h}x + k are graphed in the xy-plane. "
        f"The system formed by these two equations has exactly one solution, meaning the line touches the parabola at its vertex. What is k?"
    )
    explanation = (
        f"The vertex x-coordinate of y = x^2 - {2 * h}x + k is x = {h}. "
        f"The vertex y-value is {h}^2 - {2 * h}({h}) + k = k - {h * h}. "
        f"For the horizontal line y = {target} to touch the parabola exactly once, set k - {h * h} = {target}. "
        f"Thus k = {target} + {h * h} = {k}."
    )
    wrongs = [
        (target, "This copies the line's y-value without accounting for the vertex shift."),
        (h * h, "This is the square used in the vertex expression, not the parameter k."),
        (target - h * h, "This subtracts h^2 when the vertex equation requires adding it."),
    ]
    return make(spec, prompt, k, explanation, wrongs, "line_parabola_tangent_parameter", "use one-intersection condition in a nonlinear system", "line and parabola system with parameter", "copying target y-value as parameter", "Hard because exactly one solution must be read as tangency.", desmos=True)


GENERATORS = {
    "alg_one_var_context": gen_alg_one_var_context,
    "alg_two_var_context": gen_alg_two_var_context,
    "alg_linear_function_context": gen_alg_linear_function_context,
    "alg_system_context": gen_alg_system_context,
    "alg_inequality_context": gen_alg_inequality_context,
    "adv_nonlinear_equation": gen_adv_nonlinear_equation,
    "adv_nonlinear_system": gen_adv_nonlinear_system,
}


def generate_questions() -> list[dict[str, Any]]:
    questions = [GENERATORS[spec.family](spec) for spec in spec_list()]
    validate_distribution(questions)
    return questions


def validate_distribution(questions: list[dict[str, Any]]) -> None:
    assert len(questions) == 200
    assert len({q["id"] for q in questions}) == 200
    assert Counter(q["domain"] for q in questions) == {"Algebra": 143, "Advanced Math": 57}
    assert Counter(q["difficulty"] for q in questions) == {"Medium": 45, "Hard": 155}
    assert Counter(q["questionType"] for q in questions) == {"multiple_choice": 180, "student_produced_response": 20}
    expected = {
        "Linear equations in one variable": 13,
        "Linear equations in two variables": 30,
        "Linear functions": 35,
        "Systems of two linear equations in two variables": 45,
        "Linear inequalities in one or two variables": 20,
        "Nonlinear equations in one variable": 45,
        "Systems of equations in two variables": 12,
    }
    assert Counter(q["skill"] for q in questions) == expected


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
        row["blockers"] = sorted(set(blockers))
        row["pass"] = not row["blockers"] and not row["issues"] and not row["warnings"] and not row["depthFlags"]
        rows.append(row)
        for field in ("domain", "skill", "difficulty", "questionType", "targetBand", "reviewStatus"):
            counters[field][str(item.get(field))] += 1
        for field in ("blockers", "issues", "warnings", "depthFlags"):
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
    out = ARTIFACTS_DIR / f"strategy-math-200-audit-{audit_name}-20260525.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-draft", action="store_true")
    parser.add_argument("--append", action="store_true")
    parser.add_argument("--audit-bank", action="store_true")
    parser.add_argument("--audit-name", default="pass1")
    parser.add_argument("--require-clean", action="store_true")
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


if __name__ == "__main__":
    main()
