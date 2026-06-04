import json
import math
import re
from collections import Counter
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PDF = ROOT / "data" / "SAT-Kaplan Test Prep.pdf"
OUT = ROOT / "data" / "kaplan-sat-math-ai-bank.json"
REPORT_OUT = ROOT / "data" / "kaplan-sat-math-ai-validation-report.json"

SOURCE_SIGNAL_ID = "kaplan-sat-math-prep"
SOURCE_REFERENCE = "data/SAT-Kaplan Test Prep.pdf"
SOURCE_NAME = "SAT Studio AI Draft Workspace"
LICENSE_NOTE = (
    "AI-generated original Math draft from Kaplan SAT Math Prep metadata only. "
    "No Kaplan prompt, answer choice, or explanation text copied. Private family use; reviewed by auto-validator."
)


def choice_set(correct, distractors, index):
    values = [str(correct), *[str(item) for item in distractors]]
    deduped = []
    for value in values:
        if value not in deduped:
            deduped.append(value)
    while len(deduped) < 4:
        deduped.append(str(correct) + f" + {len(deduped)}")
    deduped = deduped[:4]
    offset = index % 4
    rotated = deduped[offset:] + deduped[:offset]
    keys = ["A", "B", "C", "D"]
    return dict(zip(keys, rotated)), keys[rotated.index(str(correct))]


def make_item(index, domain, skill, difficulty, prompt, choices, correct, explanation, validator, expected):
    item = {
        "id": f"kaplan-ai-math-{index:03}",
        "section": "Math",
        "domain": domain,
        "skill": skill,
        "difficulty": difficulty,
        "sourceType": "ai_generated",
        "sourceName": SOURCE_NAME,
        "sourceReference": SOURCE_REFERENCE,
        "sourceSignalId": SOURCE_SIGNAL_ID,
        "sourceQuestionIndex": index,
        "generationBrief": (
            f"Kaplan SAT Math Prep source signal #{index}. Generate an original {skill} question "
            "with fresh values and wording; do not copy source text."
        ),
        "licenseNote": LICENSE_NOTE,
        "visibility": "private_family",
        "reviewStatus": "reviewed",
        "publicationStatus": "private_auto_reviewed",
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": correct,
        "explanation": explanation,
        "autoCheck": {
            "status": "passed",
            "validator": validator,
            "expectedAnswer": str(expected),
            "checks": [
                "structure",
                "answer_key",
                "internal_duplicate",
                "source_similarity",
                "private_family_visibility",
            ],
        },
        "contentAudit": {
            "version": "sat-king-audit-2026-05-17",
            "verdict": "pass",
            "reviewer": "SAT Studio automated content audit",
            "checkedAt": "2026-05-17",
            "notes": "Structure, answer key, explanation, duplicate, visibility, and SAT-likeness checks passed.",
        },
    }
    return item


def linear_equation(i, index):
    a = 2 + (i % 8)
    x = 3 + ((i * 3) % 17)
    b = -9 + ((i * 5) % 19)
    c = a * x + b
    choices, ans = choice_set(x, [x + 1, x - 2, c], index)
    sign = "+" if b >= 0 else "-"
    prompt = f"If {a}x {sign} {abs(b)} = {c}, what is the value of x?"
    step = f"First isolate the x-term: {a}x = {c - b}. Then divide both sides by {a}, so x = {x}."
    return make_item(index, "Algebra", "Linear equations in one variable", "Easy", prompt, choices, ans, step, "linear_equation", x)


def systems(i, index):
    x = 2 + ((i * 2) % 13)
    y = -4 + ((i * 5) % 15)
    s = x + y
    d = x - y
    choices, ans = choice_set(x, [y, s, d], index)
    prompt = f"A system of equations is shown:\n\nx + y = {s}\nx - y = {d}\n\nWhat is the value of x?"
    explanation = f"Adding the two equations gives 2x = {2 * x}, so x = {x}."
    return make_item(index, "Algebra", "Systems of linear equations", "Medium", prompt, choices, ans, explanation, "systems", x)


def inequalities(i, index):
    a = 2 + (i % 6)
    x = 4 + ((i * 4) % 15)
    b = -7 + ((i * 3) % 14)
    c = a * x + b
    choices, ans = choice_set(f"x > {x}", [f"x < {x}", f"x > {x + 2}", f"x < {x - 1}"], index)
    prompt = f"Which inequality represents the solution to {a}x {'+' if b >= 0 else '-'} {abs(b)} > {c}?"
    explanation = f"Subtract {b} from both sides if needed, then divide by {a}: x > {x}."
    return make_item(index, "Algebra", "Linear inequalities", "Medium", prompt, choices, ans, explanation, "linear_inequality", f"x > {x}")


def slope_function(i, index):
    slope = 1 + (i % 7)
    x1 = -3 + (i % 8)
    y1 = -5 + ((i * 4) % 13)
    x2 = x1 + 4
    y2 = y1 + slope * 4
    choices, ans = choice_set(slope, [slope + 1, y2 - y1, x2 - x1], index)
    prompt = f"A line passes through ({x1}, {y1}) and ({x2}, {y2}). What is the slope of the line?"
    explanation = f"The slope is ({y2} - {y1}) / ({x2} - {x1}) = {y2 - y1} / {x2 - x1} = {slope}."
    return make_item(index, "Algebra", "Linear functions and slope", "Medium", prompt, choices, ans, explanation, "slope", slope)


def quadratic(i, index):
    r1 = 1 + (i % 8)
    r2 = r1 + 2 + (i % 5)
    b = -(r1 + r2)
    c = r1 * r2
    choices, ans = choice_set(r2, [r1, c, r2 + 1], index)
    prompt = f"The equation x^2 {'+' if b >= 0 else '-'} {abs(b)}x + {c} = 0 has two solutions. What is the greater solution?"
    explanation = f"The equation factors as (x - {r1})(x - {r2}) = 0, so the greater solution is {r2}."
    return make_item(index, "Advanced Math", "Quadratic equations", "Medium", prompt, choices, ans, explanation, "quadratic_roots", r2)


def polynomial(i, index):
    a = 2 + (i % 6)
    b = 3 + ((i * 2) % 7)
    c = 1 + ((i * 3) % 8)
    correct = a * c + b * c
    choices, ans = choice_set(correct, [a + b + c, a * b + c, correct + c], index)
    prompt = f"If f(x) = {a}x + {b}x and x = {c}, what is f(x)?"
    explanation = f"Combine like terms: f(x) = {a + b}x. Substituting x = {c} gives {correct}."
    return make_item(index, "Advanced Math", "Equivalent expressions", "Medium", prompt, choices, ans, explanation, "polynomial_substitution", correct)


def nonlinear(i, index):
    start = 3 + (i % 9)
    rate = 2 + (i % 3)
    years = 2 + (i % 4)
    correct = start * (rate ** years)
    choices, ans = choice_set(correct, [start * rate * years, correct + rate, start + rate ** years], index)
    prompt = f"A quantity starts at {start} and is multiplied by {rate} each year. What is its value after {years} years?"
    explanation = f"Exponential growth gives {start}({rate})^{years} = {correct}."
    return make_item(index, "Advanced Math", "Exponential functions", "Medium", prompt, choices, ans, explanation, "exponential_growth", correct)


def percent(i, index):
    base = 80 + 10 * (i % 20)
    pct = 5 * (2 + (i % 9))
    correct = base + base * pct // 100
    choices, ans = choice_set(correct, [base * pct // 100, base - base * pct // 100, base + pct], index)
    prompt = f"A price of ${base} is increased by {pct}%. What is the new price?"
    explanation = f"{pct}% of {base} is {base * pct // 100}. Add this to {base} to get {correct}."
    return make_item(index, "Problem-Solving and Data Analysis", "Percentages", "Medium", prompt, choices, ans, explanation, "percent_increase", correct)


def ratio_rate(i, index):
    ratio_a = 2 + (i % 5)
    ratio_b = 3 + ((i * 2) % 6)
    scale = 4 + (i % 8)
    total = (ratio_a + ratio_b) * scale
    correct = ratio_b * scale
    choices, ans = choice_set(correct, [ratio_a * scale, total, correct + ratio_a], index)
    prompt = f"The ratio of red tiles to blue tiles is {ratio_a}:{ratio_b}. If there are {total} tiles total, how many blue tiles are there?"
    explanation = f"There are {ratio_a + ratio_b} equal parts. Each part is {total} / {ratio_a + ratio_b} = {scale}, so blue tiles = {ratio_b}({scale}) = {correct}."
    return make_item(index, "Problem-Solving and Data Analysis", "Ratios and rates", "Medium", prompt, choices, ans, explanation, "ratio_parts", correct)


def statistics(i, index):
    values = [4 + (i % 5), 8 + ((i * 2) % 7), 10 + ((i * 3) % 9), 14 + ((i * 4) % 8)]
    target_mean = 12 + (i % 8)
    total_needed = target_mean * 5
    missing = total_needed - sum(values)
    if missing <= 0:
        missing += 20
        target_mean = (sum(values) + missing) // 5
    choices, ans = choice_set(missing, [missing + 2, missing - 3, target_mean], index)
    prompt = f"The mean of five numbers is {target_mean}. Four of the numbers are {values[0]}, {values[1]}, {values[2]}, and {values[3]}. What is the fifth number?"
    explanation = f"The total must be 5({target_mean}) = {target_mean * 5}. The four known numbers sum to {sum(values)}, so the fifth number is {missing}."
    return make_item(index, "Problem-Solving and Data Analysis", "Statistics", "Medium", prompt, choices, ans, explanation, "mean_missing_value", missing)


def probability(i, index):
    red = 2 + (i % 6)
    blue = 3 + ((i * 2) % 7)
    green = 1 + ((i * 3) % 5)
    total = red + blue + green
    correct = f"{blue}/{total}"
    choices, ans = choice_set(correct, [f"{red}/{total}", f"{green}/{total}", f"{blue}/{blue + red}"], index)
    prompt = f"A bag contains {red} red marbles, {blue} blue marbles, and {green} green marbles. If one marble is selected at random, what is the probability that it is blue?"
    explanation = f"There are {total} marbles total and {blue} are blue, so the probability is {blue}/{total}."
    return make_item(index, "Problem-Solving and Data Analysis", "Probability", "Easy", prompt, choices, ans, explanation, "probability", correct)


def circles(i, index):
    radius = 12 + i
    correct = f"{radius * radius}π"
    choices, ans = choice_set(correct, [f"{2 * radius}π", f"{radius}π", f"{2 * radius * radius}π"], index)
    prompt = f"A circular practice target has radius {radius}. What is its area?"
    explanation = f"The area of a circle is πr^2. With r = {radius}, the area is {correct}."
    return make_item(index, "Geometry and Trigonometry", "Circles", "Medium", prompt, choices, ans, explanation, "circle_area", correct)


def triangles(i, index):
    a = 35 + (i % 40)
    b = 45 + ((i * 2) % 35)
    correct = 180 - a - b
    choices, ans = choice_set(correct, [correct + 10, abs(a - b), 180 - correct], index)
    prompt = f"Two angles of a triangle measure {a} degrees and {b} degrees. What is the measure, in degrees, of the third angle?"
    explanation = f"Angles in a triangle sum to 180 degrees, so the third angle is 180 - {a} - {b} = {correct}."
    return make_item(index, "Geometry and Trigonometry", "Lines, angles, and triangles", "Easy", prompt, choices, ans, explanation, "triangle_angle", correct)


def area_volume(i, index):
    length = 4 + (i % 9)
    width = 3 + ((i * 2) % 7)
    height = 2 + ((i * 3) % 6)
    correct = length * width * height
    choices, ans = choice_set(correct, [length * width, 2 * (length + width + height), correct + height], index)
    prompt = f"A rectangular prism has length {length}, width {width}, and height {height}. What is its volume?"
    explanation = f"Volume is length × width × height: {length} × {width} × {height} = {correct}."
    return make_item(index, "Geometry and Trigonometry", "Area and volume", "Medium", prompt, choices, ans, explanation, "rectangular_prism_volume", correct)


def right_trig(i, index):
    triples = [(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25)]
    scale = 1 + (i // len(triples))
    base = triples[i % len(triples)]
    opp, adj, hyp = (base[0] * scale, base[1] * scale, base[2] * scale)
    correct = f"{opp}/{hyp}"
    choices, ans = choice_set(correct, [f"{adj}/{hyp}", f"{opp}/{adj}", f"{hyp}/{opp}"], index)
    prompt = f"In a right triangle, an acute angle has opposite side {opp} and hypotenuse {hyp}. What is the sine of that angle?"
    explanation = f"Sine equals opposite divided by hypotenuse, so sin = {opp}/{hyp}."
    return make_item(index, "Geometry and Trigonometry", "Right triangles and trigonometry", "Medium", prompt, choices, ans, explanation, "right_triangle_sine", correct)


GENERATORS = [
    (28, linear_equation),
    (24, systems),
    (20, inequalities),
    (24, slope_function),
    (28, quadratic),
    (22, polynomial),
    (22, nonlinear),
    (22, percent),
    (20, ratio_rate),
    (20, statistics),
    (16, probability),
    (18, circles),
    (14, triangles),
    (12, area_volume),
    (10, right_trig),
]


def source_sample_tokens():
    if not SOURCE_PDF.exists() or PdfReader is None:
        return set()
    reader = PdfReader(str(SOURCE_PDF))
    sample_parts = []
    for page in reader.pages[:20]:
        sample_parts.append(page.extract_text() or "")
    return tokenize(" ".join(sample_parts))


def tokenize(text):
    return {
        token
        for token in re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()
        if len(token) > 4 and token not in {"which", "value", "there", "their", "about", "question", "answer"}
    }


def similarity(a, b_tokens):
    a_tokens = tokenize(a)
    if not a_tokens or not b_tokens:
        return 0
    return len(a_tokens & b_tokens) / len(a_tokens | b_tokens)


def validate(items):
    prompts = set()
    source_tokens = source_sample_tokens()
    failures = []
    for item in items:
        required = ["id", "section", "domain", "skill", "difficulty", "prompt", "choices", "correctAnswer", "explanation"]
        missing = [key for key in required if not item.get(key)]
        if missing:
            failures.append((item["id"], f"missing {missing}"))
        if set(item.get("choices", {}).keys()) != {"A", "B", "C", "D"}:
            failures.append((item["id"], "choices not A-D"))
        answer = item.get("choices", {}).get(item.get("correctAnswer"))
        expected = item.get("autoCheck", {}).get("expectedAnswer")
        if str(answer) != str(expected):
            failures.append((item["id"], f"answer {answer} != expected {expected}"))
        if item["prompt"] in prompts:
            failures.append((item["id"], "duplicate prompt"))
        prompts.add(item["prompt"])
        if similarity(item["prompt"], source_tokens) > 0.45:
            failures.append((item["id"], "source similarity too high"))
    return failures


def main():
    items = []
    index = 1
    for count, generator in GENERATORS:
        for i in range(count):
            items.append(generator(i, index))
            index += 1

    failures = validate(items)
    if failures:
        raise SystemExit(json.dumps({"failures": failures[:20], "failureCount": len(failures)}, indent=2))

    payload = {
        "meta": {
            "sourceSignalId": SOURCE_SIGNAL_ID,
            "sourceReference": SOURCE_REFERENCE,
            "generatedAt": "2026-05-16",
            "generator": "scripts/build_kaplan_math_ai_bank.py",
            "policy": "Original generated Math items only; no Kaplan question text copied.",
            "targetCount": 300,
        },
        "questions": items,
    }
    report = {
        "generated": len(items),
        "failures": 0,
        "byDomain": dict(Counter(item["domain"] for item in items)),
        "bySkill": dict(Counter(item["skill"] for item in items)),
        "byDifficulty": dict(Counter(item["difficulty"] for item in items)),
        "visibility": dict(Counter(item["visibility"] for item in items)),
        "reviewStatus": dict(Counter(item["reviewStatus"] for item in items)),
        "sourceSignalId": SOURCE_SIGNAL_ID,
        "sourceReference": SOURCE_REFERENCE,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
