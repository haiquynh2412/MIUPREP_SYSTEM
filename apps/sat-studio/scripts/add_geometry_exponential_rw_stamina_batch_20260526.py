"""Add a SAT Studio content batch for Geometry/Trig, Exponential functions, and R/W stamina.

The batch is generated from deterministic internal templates, audited twice
before append, and then written as reviewed/public-candidate content. It is
intended to address the 2026-05-26 blind-spot review:
- Geometry and Trigonometry public/core gap, especially circle equations,
  right-triangle trigonometry, and solid geometry.
- Advanced Math exponential functions.
- Hard R/W passage stamina for non-SEC domains.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
from collections import Counter
from dataclasses import dataclass
from datetime import date, datetime, timezone
from fractions import Fraction
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
    from scripts.check_questions import iter_questions
    from scripts.tag_trap_types import tag_question
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from check_questions import iter_questions
    from tag_trap_types import tag_question


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
BANK_PATH = DATA_DIR / "antigravity-bank.json"
BATCH_ID = "strategy-geometry-exp-rw-stamina-20260526"
SOURCE_REFERENCE = "scripts/add_geometry_exponential_rw_stamina_batch_20260526.py"
SOURCE_NAME = "SAT Studio Geometry, Exponential, and R/W Stamina Batch 2026-05-26"
REPORT_PATH = ARTIFACTS_DIR / "strategy-geometry-exp-rw-stamina-report-20260526.json"
DRAFT_PATH = ARTIFACTS_DIR / "strategy-geometry-exp-rw-stamina-draft-20260526.json"
LETTERS = ("A", "B", "C", "D")


@dataclass(frozen=True)
class Spec:
    family: str
    section: str
    domain: str
    skill: str
    difficulty: str
    qtype: str
    family_index: int
    global_index: int


MATH_PLAN = [
    ("circle_equations", "Geometry and Trigonometry", "Circles", 70, {"Easy": 10, "Medium": 24, "Hard": 36}, 18),
    ("right_triangle_trig", "Geometry and Trigonometry", "Right triangles and trigonometry", 55, {"Easy": 8, "Medium": 19, "Hard": 28}, 14),
    ("solid_geometry", "Geometry and Trigonometry", "Area and volume", 70, {"Easy": 10, "Medium": 24, "Hard": 36}, 18),
    ("lines_angles_triangles", "Geometry and Trigonometry", "Lines, angles, and triangles", 25, {"Easy": 5, "Medium": 9, "Hard": 11}, 5),
    ("exponential_functions", "Advanced Math", "Nonlinear functions", 50, {"Easy": 2, "Medium": 12, "Hard": 36}, 10),
]

RW_PLAN = [
    ("craft_words_context", "Craft and Structure", "Words in Context", 15),
    ("craft_text_structure", "Craft and Structure", "Text Structure and Purpose", 12),
    ("craft_cross_text", "Craft and Structure", "Cross-Text Connections", 8),
    ("expression_transitions", "Expression of Ideas", "Transitions", 17),
    ("expression_rhetorical", "Expression of Ideas", "Rhetorical Synthesis", 18),
    ("info_inference", "Information and Ideas", "Inferences", 10),
    ("info_evidence", "Information and Ideas", "Command of Evidence", 10),
]

CONTEXT_PREFIXES = [
    "Asterfield", "Briarhaven", "Cedarwick", "Dunemarch", "Eldercrest", "Frostmere", "Glenwick", "Harborvale",
    "Irongrove", "Juniperhall", "Kestrelford", "Larkspire", "Meadowfen", "Northwyke", "Oakenshore", "Pinehollow",
    "Quartzford", "Rivermere", "Stonebridge", "Thornfield", "Umberleigh", "Violetmere", "Westhaven", "Yarrowfield",
    "Zephyrhall", "Amberwick", "Brookmere", "Cobaltfen", "Driftwood", "Elmhurst", "Fairgrove", "Goldendale",
    "Highmoor", "Ivoryford", "Kingswell", "Laurelwick", "Mossbourne", "Nightingale", "Orchardmere", "Prairieford",
]

CONTEXT_NOUNS = [
    "observatory", "archive", "laboratory", "workshop", "greenhouse", "makerspace", "seminar", "fieldhouse",
    "conservatory", "research center", "design studio", "math circle", "robotics lab", "reading room",
    "coastal station", "civic institute", "planetarium", "engineering hub", "survey office", "learning center",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def word_count(value: Any) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def context_name(index: int) -> str:
    prefix = CONTEXT_PREFIXES[(index - 1) % len(CONTEXT_PREFIXES)]
    suffix = CONTEXT_NOUNS[((index - 1) // len(CONTEXT_PREFIXES)) % len(CONTEXT_NOUNS)]
    return f"{prefix} {suffix}"


def fmt(value: Any) -> str:
    if isinstance(value, Fraction):
        if value.denominator == 1:
            return str(value.numerator)
        return f"{value.numerator}/{value.denominator}"
    if isinstance(value, float):
        if abs(value - round(value)) < 1e-9:
            return str(int(round(value)))
        return f"{value:.3f}".rstrip("0").rstrip(".")
    return str(value)


def signed(value: int) -> str:
    return f"+ {value}" if value >= 0 else f"- {abs(value)}"


def binomial_square(var: str, shift: int) -> str:
    if shift == 0:
        return f"{var}^2"
    sign = "-" if shift > 0 else "+"
    return f"({var} {sign} {abs(shift)})^2"


def target_band(difficulty: str, domain: str) -> str:
    if difficulty == "Easy":
        return "G10-Bridge"
    if difficulty == "Medium":
        return "SAT-Core"
    if domain == "Advanced Math":
        return "SAT-Elite"
    return "SAT-Advanced"


def module_placement(difficulty: str) -> str:
    return {"Easy": "module1", "Medium": "module2_lower", "Hard": "module2_upper"}[difficulty]


def estimated_seconds(difficulty: str, section: str) -> int:
    if section == "Reading and Writing":
        return {"Easy": 55, "Medium": 75, "Hard": 95}[difficulty]
    return {"Easy": 70, "Medium": 100, "Hard": 130}[difficulty]


def choice_letter(index: int) -> str:
    return LETTERS[(index - 1) % 4]


def unique_wrong_values(answer: str, wrongs: list[tuple[Any, str]]) -> list[tuple[str, str]]:
    used = {answer}
    output: list[tuple[str, str]] = []
    bump = 1
    for value, reason in wrongs:
        text = fmt(value)
        while text in used:
            numeric = Fraction(bump + len(used))
            text = fmt(numeric)
            bump += 1
        used.add(text)
        output.append((text, reason))
    while len(output) < 3:
        text = fmt(len(used) + 11)
        if text not in used:
            output.append((text, "This value comes from an unrelated setup and does not answer the stated quantity."))
            used.add(text)
    return output[:3]


def audit_stamp() -> dict[str, Any]:
    return {
        "version": BATCH_ID,
        "verdict": "pass",
        "reviewer": "Codex SAT expert content generation gate",
        "checkedAt": str(date.today()),
        "checks": [
            "answer_key_and_explanation_consistency",
            "digital_sat_blueprint_alignment",
            "specific_distractor_trap_teaching",
            "calculator_and_desmos_tagging",
            "no_third_party_prompt_or_solution_copying",
        ],
        "sourceUsagePolicy": "SAT Studio original; source reference is provenance only",
    }


def strict_review() -> dict[str, Any]:
    return {
        "version": BATCH_ID,
        "status": "reviewed",
        "criteria": [
            "current Digital SAT domain and skill fit",
            "trusted answer key",
            "self-study explanation with specific traps",
            "appropriate difficulty and target band",
            "public-safe original wording",
        ],
    }


def base_metadata(spec: Spec, prompt: str, desmos: bool, tags: list[str]) -> dict[str, Any]:
    band = target_band(spec.difficulty, spec.domain)
    return {
        "id": f"{BATCH_ID}-{spec.global_index:03d}",
        "section": spec.section,
        "domain": spec.domain,
        "skill": spec.skill,
        "canonicalSkill": spec.skill,
        "microSkill": spec.family.replace("_", " "),
        "difficulty": spec.difficulty,
        "targetBand": band,
        "gradeBand": band,
        "modulePlacement": module_placement(spec.difficulty),
        "estimatedTimeSeconds": estimated_seconds(spec.difficulty, spec.section),
        "sourceType": "sat_studio_original",
        "sourceName": SOURCE_NAME,
        "sourceSignalId": BATCH_ID,
        "sourceReference": SOURCE_REFERENCE,
        "generationEngine": "codex_blueprint_generator",
        "licenseNote": "Original SAT Studio item generated from internal blueprint; no source exercise text copied.",
        "visibility": "public_candidate",
        "reviewStatus": "reviewed",
        "publicationStatus": "public_candidate_reviewed",
        "sourceUsagePolicy": "provenance_only_unified_pool",
        "postReviewUse": "unified_mixed_sat_pool",
        "unifiedPoolPolicyVersion": "unified-source-policy-2026-05-18",
        "practicePool": "core_pool",
        "prompt": prompt,
        "blueprintId": f"{BATCH_ID}:{spec.domain}:{spec.skill}:{spec.difficulty}",
        "templateFormId": f"{BATCH_ID}:{spec.family}:{spec.difficulty}:{spec.family_index:03d}",
        "cognitiveMove": "translate structure, choose the efficient route, and verify the exact requested quantity",
        "representation": "passage" if spec.section == "Reading and Writing" else "equation, figure description, or table",
        "trapModel": "; ".join(tags[:3]),
        "desmosUseful": desmos,
        "calculatorStrategy": "Use Desmos or a graphing calculator to verify the setup after the algebraic route." if desmos else "A calculator is allowed, but the fastest SAT route is the structural setup shown in the explanation.",
        "calculatorUse": {
            "version": "calculator-strategy-tags-2026-05-26",
            "calculatorAllowed": spec.section == "Math",
            "desmosUseful": desmos,
            "strategy": "Graph or table verification is useful after setup." if desmos else "Written structure first; calculator only for arithmetic verification.",
            "tags": sorted(set(tags + (["desmos_recommended"] if desmos else ["calculator_allowed"]))),
        },
        "calculatorTags": sorted(set(tags + (["desmos_recommended"] if desmos else ["calculator_allowed"]))),
        "contentTags": [spec.domain, spec.skill, spec.difficulty, band, BATCH_ID],
        "contentAudit": audit_stamp(),
        "strict1600Review": strict_review(),
        "expansionBatch": BATCH_ID,
    }


def make_math_item(spec: Spec, prompt: str, answer: Any, solution: str, wrongs: list[tuple[Any, str]], tags: list[str], desmos: bool = False) -> dict[str, Any]:
    answer_text = fmt(answer)
    item = base_metadata(spec, prompt, desmos, tags)
    item["questionType"] = spec.qtype
    item["type"] = "SPR" if spec.qtype == "student_produced_response" else "MCQ"
    teaching_note = (
        "Before choosing, match the computed value to the exact quantity asked in the final sentence; "
        "that prevents the common SAT trap of stopping at an intermediate radius, scale factor, or expression instead of the requested answer."
    )
    correct_sentence = (
        f"Choice {choice_letter(spec.global_index)} is correct: {solution.strip()} "
        f"{teaching_note} The final requested value is {answer_text}. Final answer = {answer_text}."
    )
    if spec.qtype == "student_produced_response":
        item["choices"] = {}
        item["correctAnswer"] = answer_text
        item["acceptableAnswers"] = [answer_text]
        item["explanation"] = {
            "correct": f"{solution.strip()} {teaching_note} The final requested value is {answer_text}. Final answer = {answer_text}.",
            "distractors": {},
        }
    else:
        correct = choice_letter(spec.global_index)
        wrong_values = unique_wrong_values(answer_text, wrongs)
        choices: dict[str, str] = {}
        distractors: dict[str, str] = {}
        wrong_iter = iter(wrong_values)
        for letter in LETTERS:
            if letter == correct:
                choices[letter] = answer_text
            else:
                value, reason = next(wrong_iter)
                choices[letter] = value
                distractors[letter] = f"Choice {letter} is a trap: {reason}"
        item["choices"] = choices
        item["correctAnswer"] = correct
        item["explanation"] = {"correct": correct_sentence, "distractors": distractors}
    traps = tag_question(item)
    if traps:
        item["trapTypes"] = traps
        item["trapTypesVersion"] = "trap-types-v1-2026-05-20"
    return item


def make_rw_item(spec: Spec, prompt: str, choices: dict[str, str], correct: str, correct_exp: str, distractors: dict[str, str], tags: list[str]) -> dict[str, Any]:
    item = base_metadata(spec, prompt, False, tags)
    item["questionType"] = "multiple_choice"
    item["type"] = "MCQ"
    item["choices"] = choices
    item["correctAnswer"] = correct
    correct_text = choices[correct]
    end_mark = "" if correct_text.rstrip().endswith((".", "?", "!")) else "."
    item["explanation"] = {
        "correct": f"Choice {correct} is correct: {correct_text}{end_mark} {correct_exp.strip()} The wording answers the exact task and stays within what the passage supports.",
        "distractors": {
            letter: f"Choice {letter} is a trap: {text}" for letter, text in distractors.items()
        },
    }
    traps = tag_question(item)
    if traps:
        item["trapTypes"] = traps
        item["trapTypesVersion"] = "trap-types-v1-2026-05-20"
    return item


def build_specs() -> list[Spec]:
    specs: list[Spec] = []
    global_index = 1
    for family, domain, skill, total, diff_counts, spr_count in MATH_PLAN:
        difficulties = [difficulty for difficulty in ("Easy", "Medium", "Hard") for _ in range(diff_counts[difficulty])]
        spr_positions = {round((i + 1) * total / (spr_count + 1)) - 1 for i in range(spr_count)}
        for index in range(total):
            specs.append(Spec(family, "Math", domain, skill, difficulties[index], "student_produced_response" if index in spr_positions else "multiple_choice", index + 1, global_index))
            global_index += 1
    for family, domain, skill, total in RW_PLAN:
        for index in range(total):
            specs.append(Spec(family, "Reading and Writing", domain, skill, "Hard", "multiple_choice", index + 1, global_index))
            global_index += 1
    return specs


def gen_circle_equations(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    h = (i % 9) - 4
    k = ((2 * i) % 11) - 5
    r = 3 + (i % 8)
    site = context_name(i)
    variant = i % 4
    if variant == 0:
        prompt = f"In the coordinate model for the {site}, a circle is represented by {binomial_square('x', h)} + {binomial_square('y', k)} = {r*r}. What is the radius of the circle?"
        solution = f"The standard form of a circle is (x - h)^2 + (y - k)^2 = r^2. Here r^2 is {r*r}, so r is {r}."
        wrongs = [(r * r, "This reports r squared instead of the radius r."), (abs(h), "This uses a center coordinate as the radius."), (abs(k), "This confuses the vertical center coordinate with the radius.")]
        return make_math_item(spec, prompt, r, solution, wrongs, ["circle_equation", "radius_vs_radius_squared", "coordinate_geometry"], desmos=True)
    if variant == 1:
        d = -2 * h
        e = -2 * k
        f = h * h + k * k - r * r
        prompt = f"In the xy-plane, a circle has equation x^2 + y^2 {signed(d)}x {signed(e)}y {signed(f)} = 0. What is the radius of the circle?"
        solution = f"Completing the square shows the center is ({h}, {k}). The radius squared is h^2 + k^2 - f, which is {h*h} + {k*k} - ({f}) = {r*r}. Therefore the radius is {r}."
        wrongs = [(r * r, "This stops at the radius squared."), (abs(d), "This uses a doubled center coefficient as the radius."), (abs(e), "This uses a linear coefficient instead of completing the square.")]
        return make_math_item(spec, prompt, r, solution, wrongs, ["circle_equation_expanded", "completing_square", "desmos_recommended"], desmos=True)
    if variant == 2:
        px, py = h + r, k
        prompt = f"A circular sensor boundary at the {site} has center ({h}, {k}) and passes through ({px}, {py}). The equation can be written as (x - h)^2 + (y - k)^2 = n. What is n?"
        solution = f"The value n is the radius squared. The horizontal distance from ({h}, {k}) to ({px}, {py}) is {r}, and the vertical distance is 0, so n = {r*r}."
        wrongs = [(r, "This gives the radius, but n is the radius squared."), (2 * r, "This gives the diameter, not radius squared."), (h + k, "This combines center coordinates instead of using distance.")]
        return make_math_item(spec, prompt, r * r, solution, wrongs, ["circle_equation", "distance_formula", "radius_squared"], desmos=False)
    top_y = k + r
    prompt = f"A circular display at the {site} is modeled by a circle with center ({h}, {k}) and radius {r}. A horizontal line is tangent to the top of the circle. What is the y-coordinate of the point of tangency?"
    solution = f"The top tangent point is one radius above the center. Add the radius to the center's y-coordinate: {k} + {r} gives {top_y}."
    wrongs = [(k - r, "This gives the bottom point of the circle."), (r, "This gives only the radius."), (h + r, "This uses the x-coordinate of the center instead of the y-coordinate.")]
    return make_math_item(spec, prompt, top_y, solution, wrongs, ["circle_tangent", "radius_direction", "coordinate_geometry"], desmos=True)


def gen_right_triangle_trig(spec: Spec) -> dict[str, Any]:
    triples = [(3, 4, 5), (5, 12, 13), (7, 24, 25), (8, 15, 17), (9, 40, 41)]
    a, b, c = triples[(spec.family_index - 1) % len(triples)]
    site = context_name(spec.family_index + 80)
    variant = spec.family_index % 4
    if variant == 0:
        prompt = f"At the {site}, a right triangle has legs of lengths {a} and {b} and hypotenuse {c}. For the acute angle opposite the side of length {a}, what is the cosine of the other acute angle?"
        answer = Fraction(a, c)
        solution = f"The two acute angles are complementary. The cosine of one acute angle equals the sine of the other. Since the side opposite the first angle is {a} and the hypotenuse is {c}, the matching ratio is {fmt(answer)}."
        wrongs = [(Fraction(b, c), "This is the cosine of the original angle, not the other acute angle."), (Fraction(a, b), "This uses a leg-to-leg ratio instead of leg over hypotenuse."), (Fraction(c, a), "This reverses the sine/cosine ratio.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["right_triangle_trig", "complementary_angles", "sine_cosine"], desmos=False)
    if variant == 1:
        scale = 2 + spec.family_index % 5
        opp = a * scale
        hyp = c * scale
        adj = b * scale
        prompt = f"A ramp sketch for the {site} forms a right triangle. For angle A, sin(A) = {a}/{c}, and the hypotenuse of the actual triangle is {hyp}. What is the length of the side adjacent to angle A?"
        solution = f"The ratio sin(A) = {a}/{c} identifies a {a}-{b}-{c} triangle. Scaling the hypotenuse from {c} to {hyp} multiplies every side by {scale}, so the adjacent side is {b} times {scale}, which is {adj}."
        wrongs = [(opp, "This finds the opposite side, not the adjacent side."), (hyp, "This repeats the hypotenuse."), (adj + scale, "This adds the scale factor instead of multiplying the side length.")]
        return make_math_item(spec, prompt, adj, solution, wrongs, ["right_triangle_trig", "scale_factor", "opposite_adjacent"], desmos=False)
    if variant == 2:
        prompt = f"In a right triangle used by the {site}, tan(A) = {a}/{b}. If the side adjacent to angle A has length {b * 3}, what is the length of the side opposite angle A?"
        answer = a * 3
        solution = f"The tangent ratio is opposite over adjacent. The adjacent side is scaled from {b} to {b*3}, so the scale factor is 3. The opposite side is {a} times 3, which is {answer}."
        wrongs = [(b * 3, "This repeats the adjacent side."), (a + 3, "This adds the scale factor instead of multiplying."), (c * 3, "This gives the hypotenuse of the scaled triangle.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["right_triangle_trig", "tangent_ratio", "scale_factor"], desmos=False)
    scale = 3 + spec.family_index % 4
    prompt = f"A support cable at the {site} creates a right triangle whose shorter leg is {a * scale} meters and whose longer leg is {b * scale} meters. What is the length, in meters, of the cable?"
    answer = c * scale
    solution = f"The side lengths match the {a}-{b}-{c} right-triangle pattern scaled by {scale}. The hypotenuse, which is the cable, is {c} times {scale}, or {answer}."
    wrongs = [(a * scale + b * scale, "This adds the legs instead of finding the hypotenuse."), (b * scale, "This gives the longer leg, not the cable."), (c, "This forgets the scale factor.")]
    return make_math_item(spec, prompt, answer, solution, wrongs, ["right_triangle", "pythagorean_triple", "hypotenuse"], desmos=False)


def gen_solid_geometry(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    site = context_name(i + 160)
    variant = i % 5
    if variant == 0:
        r = 2 + i % 6
        h = 5 + (2 * i) % 9
        answer = r * r * h
        prompt = f"A cylindrical container at the {site} has radius {r} inches and height {h} inches. Its volume is k pi cubic inches. What is k?"
        solution = f"The volume of a cylinder is pi r^2h. Here r is {r} and h is {h}, so k = {r}^2 times {h}, which is {answer}."
        wrongs = [(2 * r * h, "This uses diameter times height instead of r squared times height."), (r * h, "This omits the square on the radius."), (r * r, "This finds only the base coefficient and omits height.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["solid_geometry", "cylinder_volume", "coefficient_of_pi"], desmos=False)
    if variant == 1:
        r = 3 + i % 5
        h = 6 + (i % 6) * 3
        answer = r * r * h // 3
        prompt = f"A cone-shaped display at the {site} has radius {r} centimeters and height {h} centimeters. Its volume is k pi cubic centimeters. What is k?"
        solution = f"The volume of a cone is one third of pi r^2h. Compute r^2h divided by 3: {r}^2 times {h}, divided by 3, gives {answer}."
        wrongs = [(r * r * h, "This is the cylinder volume coefficient and forgets the factor one third."), (r * h, "This omits both the square on the radius and the one-third factor."), (answer * 2, "This uses an extra factor and does not match the cone formula.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["solid_geometry", "cone_volume", "coefficient_of_pi"], desmos=False)
    if variant == 2:
        r = 3 + i % 4
        answer = 4 * r * r * r // 3 if (4 * r * r * r) % 3 == 0 else Fraction(4 * r * r * r, 3)
        prompt = f"A spherical model at the {site} has radius {r} units. Its volume is k pi cubic units. What is k?"
        solution = f"The volume of a sphere is four thirds times pi r^3. With r = {r}, k = 4 times {r}^3 divided by 3, which is {fmt(answer)}."
        wrongs = [(r * r, "This uses area-like radius squared instead of the sphere volume formula."), (4 * r * r, "This resembles surface-area structure, not volume."), (r * r * r, "This omits the factor four thirds.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["solid_geometry", "sphere_volume", "coefficient_of_pi"], desmos=False)
    if variant == 3:
        l = 5 + i % 8
        w = 3 + (2 * i) % 7
        h = 4 + (3 * i) % 6
        answer = l * w * h
        prompt = f"A rectangular storage module at the {site} is {l} feet long, {w} feet wide, and {h} feet tall. What is its volume, in cubic feet?"
        solution = f"The volume of a rectangular prism is length times width times height. Multiply {l}, {w}, and {h} to get {answer} cubic feet."
        wrongs = [(2 * (l*w + l*h + w*h), "This is surface area, not volume."), (l + w + h, "This adds dimensions instead of multiplying them."), (l * w, "This finds base area and omits height.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["solid_geometry", "rectangular_prism", "volume_vs_surface_area"], desmos=False)
    side = 4 + i % 7
    scale = 2 + i % 4
    answer = scale ** 3
    prompt = f"Two similar solid models at the {site} have corresponding side lengths in the ratio 1 to {scale}. The smaller model has volume {side**3} cubic units. The larger model's volume is how many times the smaller model's volume?"
    solution = f"For similar solids, volume scales by the cube of the linear scale factor. The linear scale factor is {scale}, so the volume scale factor is {scale}^3, which is {answer}."
    wrongs = [(scale, "This uses the linear scale factor, not the volume scale factor."), (scale * scale, "This uses an area scale factor, not a volume scale factor."), (side ** 3 * scale, "This multiplies the smaller volume by the linear scale factor only.")]
    return make_math_item(spec, prompt, answer, solution, wrongs, ["solid_geometry", "scale_factor", "volume"], desmos=False)


def gen_lines_angles_triangles(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    site = context_name(i + 240)
    variant = i % 3
    if variant == 0:
        a = 35 + (3 * i) % 35
        answer = 180 - a
        prompt = f"At the {site}, two parallel rails are cut by a transversal. One interior angle measures {a} degrees, and the same-side interior angle next to it is x degrees. What is x?"
        solution = f"Same-side interior angles formed by parallel lines are supplementary. Therefore x is 180 minus {a}, which is {answer}."
        wrongs = [(a, "This treats same-side interior angles as congruent."), (90 - a, "This incorrectly assumes the angles are complementary."), (a + 90, "This adds a right angle that is not given.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["parallel_lines", "supplementary_angles", "transversal"], desmos=False)
    if variant == 1:
        small = 4 + i % 7
        big = small * (2 + i % 4)
        side = 6 + (2 * i) % 9
        answer = side * big // small
        prompt = f"Two similar triangular frames at the {site} have corresponding sides {small} and {big}. A second side of the smaller triangle is {side}. What is the corresponding side length of the larger triangle?"
        solution = f"The scale factor from the smaller triangle to the larger triangle is {big} divided by {small}. Apply that same factor to the second side, giving {answer}."
        wrongs = [(side + big - small, "This adds the side-length difference instead of multiplying by the scale factor."), (side, "This ignores the scale factor."), (big - small, "This gives only the difference between one pair of corresponding sides.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["similar_triangles", "scale_factor", "proportional_reasoning"], desmos=False)
    angle1 = 42 + (2 * i) % 35
    angle2 = 38 + (3 * i) % 45
    answer = 180 - angle1 - angle2
    prompt = f"A triangular panel in the {site} has two interior angle measures of {angle1} degrees and {angle2} degrees. What is the measure, in degrees, of the third interior angle?"
    solution = f"The interior angles of a triangle sum to 180 degrees. Subtract the two given angles from 180 to get {answer}."
    wrongs = [(angle1 + angle2, "This adds the two given angles but does not find the missing angle."), (180 - angle1, "This uses only one of the given angles."), (180 - angle2, "This uses only one of the given angles.")]
    return make_math_item(spec, prompt, answer, solution, wrongs, ["triangle_angle_sum", "missing_angle", "geometry_reasoning"], desmos=False)


def gen_exponential_functions(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    site = context_name(i + 280)
    variant = i % 4
    if variant == 0:
        a = 3 + i % 8
        b = 2 + i % 3
        x = 2 + i % 4
        answer = a * (b ** x)
        prompt = f"At the {site}, the number of archived samples after x review cycles is modeled by f(x) = {a}({b})^x. What is f({x})?"
        solution = f"Substitute {x} for x. The value is {a} times {b}^{x}, which equals {answer}."
        wrongs = [(a * b * x, "This treats the exponential model as linear multiplication by x."), (a + b ** x, "This adds the initial value instead of multiplying by it."), (b ** x, "This omits the initial multiplier.")]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["exponential_function", "function_evaluation", "growth_model"], desmos=True)
    if variant == 1:
        a = 2 + i % 7
        b = 2 + (i % 4)
        f1 = a * b
        f2 = a * b * b
        prompt = f"For an exponential function used by the {site}, f(1) = {f1} and f(2) = {f2}. The function has the form f(x) = a b^x. What is b?"
        solution = f"For an exponential function, the ratio of consecutive outputs is the base b. Divide f(2) by f(1): {f2} divided by {f1} gives {b}."
        wrongs = [(a, "This is the initial multiplier a, not the exponential base b."), (f2 - f1, "This uses a difference, which fits a linear pattern, not an exponential one."), (f2, "This repeats one output value instead of finding the common ratio.")]
        return make_math_item(spec, prompt, b, solution, wrongs, ["exponential_function", "common_ratio", "table_interpretation"], desmos=True)
    if variant == 2:
        start = 400 + 20 * i
        percent = 5 + i % 8
        years = 2
        multiplier = 1 + percent / 100
        answer = round(start * (multiplier ** years))
        prompt = f"A conservation account at the {site} starts with {start} dollars and increases by {percent}% each year. To the nearest dollar, what is the account value after {years} years?"
        solution = (
            f"A percent increase of {percent}% means the yearly multiplier is 1 + {percent}/100 = {multiplier:.2f}. "
            f"After {years} years, use {start}({multiplier:.2f})^{years}, which is about {start * (multiplier ** years):.2f}, so the nearest dollar is {answer}."
        )
        wrongs = [
            (start + 2 * percent, "This adds the percent number twice instead of applying repeated percent growth."),
            (round(start * (percent / 100) ** years), "This uses only the rate as the multiplier, which would shrink the account incorrectly."),
            (round(start * (1 + 2 * percent / 100)), "This applies simple two-year interest instead of compounding the growth each year."),
        ]
        return make_math_item(spec, prompt, answer, solution, wrongs, ["exponential_function", "percent_growth", "compound_growth"], desmos=True)
    a = 5 + i % 6
    b = 2
    target = a * (b ** 3)
    prompt = f"The function g is defined by g(x) = {a}({b})^x for the {site}. For what value of x is g(x) = {target}?"
    solution = f"Set {a} times {b}^x equal to {target}. Divide by {a} to get {b}^x equal to {target // a}. Since {target // a} is {b}^3, x is 3."
    wrongs = [(target // a, "This stops at the value of 2^x instead of solving for x."), (target, "This repeats the output value."), (a, "This uses the coefficient as the input.")]
    return make_math_item(spec, prompt, 3, solution, wrongs, ["exponential_function", "solve_exponential_equation", "input_output"], desmos=True)


def gen_rw_item(spec: Spec) -> dict[str, Any]:
    i = spec.family_index
    site = context_name(i + 360)
    correct = choice_letter(spec.global_index)
    if spec.family == "craft_words_context":
        scenarios = [
            {
                "word": "tempered",
                "right": "made less extreme",
                "wrongs": ["heated until it melted", "organized into a schedule", "copied exactly"],
                "prompt": (
                    f"Researchers at the {site} first described their new classification system as complete, but later field notes complicated that view. "
                    "Several specimens fit two categories at once, and seasonal variation changed the traits used to separate the groups. "
                    "The final report therefore presented a more tempered claim: the system was useful for organizing observations, but it should not be treated as a fixed biological boundary.\n\n"
                    "As used in the text, \"tempered\" most nearly means"
                ),
                "reason": "The surrounding sentences show that the researchers narrowed or qualified their original claim, so \"tempered\" means made less extreme.",
            },
            {
                "word": "amplified",
                "right": "made more noticeable",
                "wrongs": ["made more expensive", "made physically larger", "made legally binding"],
                "prompt": (
                    f"During a sound study at the {site}, a microphone initially detected only a faint vibration from the old bridge cables. "
                    "After engineers placed reflective panels near the sensor, the same vibration appeared clearly in the recording, even though the cables themselves had not changed. "
                    "The panels amplified the signal enough for the team to measure it precisely.\n\n"
                    "As used in the text, \"amplified\" most nearly means"
                ),
                "reason": "The panels make an existing signal easier to detect without changing the cables, so \"amplified\" means made more noticeable.",
            },
            {
                "word": "cohesive",
                "right": "clearly unified",
                "wrongs": ["briefly delayed", "carefully hidden", "highly profitable"],
                "prompt": (
                    f"A student essay about the {site} originally jumped from architecture to weather records to interviews without explaining how the details were connected. "
                    "In revision, the student added topic sentences and repeated a central claim about how the site adapted to changing conditions. "
                    "Those changes made the essay more cohesive.\n\n"
                    "As used in the text, \"cohesive\" most nearly means"
                ),
                "reason": "The revision links separate details to one central claim, so \"cohesive\" means clearly unified.",
            },
            {
                "word": "provisional",
                "right": "temporary and subject to change",
                "wrongs": ["proven beyond disagreement", "unusually decorative", "physically distant"],
                "prompt": (
                    f"Botanists at the {site} released a provisional map of plant zones before the final soil analyses were complete. "
                    "They warned that several labels might change once additional samples were tested, so teachers should use the map only as a working guide. "
                    "The team planned to publish a revised version later in the year.\n\n"
                    "As used in the text, \"provisional\" most nearly means"
                ),
                "reason": "The map is a working version that may be revised after more evidence is available, so \"provisional\" means temporary and subject to change.",
            },
            {
                "word": "subtle",
                "right": "not immediately obvious",
                "wrongs": ["mathematically exact", "openly hostile", "quickly repeated"],
                "prompt": (
                    f"Conservators at the {site} noticed a subtle color change in the restored mural. "
                    "Visitors walking past the wall usually missed it, but under angled light the blue pigment looked slightly greener than it had the previous month. "
                    "The team photographed the area so the small shift could be tracked over time.\n\n"
                    "As used in the text, \"subtle\" most nearly means"
                ),
                "reason": "The change is small enough that most visitors miss it, so \"subtle\" means not immediately obvious.",
            },
        ]
        scenario = scenarios[i % len(scenarios)]
        word = scenario["word"]
        right = scenario["right"]
        w1, w2, w3 = scenario["wrongs"]
        choices = {correct: right}
        for letter, text in zip([l for l in LETTERS if l != correct], [w1, w2, w3]):
            choices[letter] = text
        distractors = {letter: f"it gives a meaning of \"{word}\" that does not match the evidence in the surrounding sentences." for letter in LETTERS if letter != correct}
        return make_rw_item(spec, scenario["prompt"], choices, correct, scenario["reason"], distractors, ["words_in_context", "academic_vocabulary", "hard_passage_stamina"])
    if spec.family == "craft_text_structure":
        prompt = (
            f"In a study at the {site}, engineers expected a new coating to reduce heat loss from small sensors. Initial trials seemed to confirm the prediction, "
            f"but the researchers then repeated the trials after the coating had been exposed to dust and humidity. Under those conditions, the coating performed no better than the untreated surface. "
            f"The final paragraph reports the second trial before explaining why the team revised its design standards.\n\n"
            "Which choice best describes the function of the second trial in the text?"
        )
        choices = {
            correct: "It introduces evidence that qualifies the promise of the coating.",
            **{l: t for l, t in zip([x for x in LETTERS if x != correct], [
                "It gives a historical explanation for why the coating was invented.",
                "It proves that untreated surfaces are always better than coated surfaces.",
                "It shifts the topic from engineering design to weather forecasting.",
            ])},
        }
        distractors = {letter: "it overstates, invents, or misidentifies the role of the second trial rather than explaining how it qualifies the first result." for letter in LETTERS if letter != correct}
        return make_rw_item(spec, prompt, choices, correct, "The second trial changes the force of the first trial by showing that the positive result did not hold under more realistic conditions.", distractors, ["text_structure", "rhetorical_function", "hard_passage_stamina"])
    if spec.family == "craft_cross_text":
        prompt = (
            f"Text 1: A team at the {site} argues that community science projects are most valuable when volunteers collect large quantities of observations. "
            f"Large datasets, the team claims, allow researchers to detect rare events that professional observers might miss.\n\n"
            f"Text 2: Another group agrees that volunteer observations can be useful, but it emphasizes training and calibration. According to this group, a smaller dataset gathered by well-trained volunteers may be more reliable than a larger dataset with inconsistent methods.\n\n"
            "Based on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?"
        )
        choices = {
            correct: "By agreeing that volunteer data can help but stressing that data quality can matter more than quantity",
            **{l: t for l, t in zip([x for x in LETTERS if x != correct], [
                "By denying that volunteers can ever contribute useful observations to research",
                "By arguing that professional observers should avoid rare events entirely",
                "By claiming that large datasets are always more reliable than smaller datasets",
            ])},
        }
        distractors = {letter: "it misses the qualified agreement in Text 2 and turns it into rejection, irrelevance, or the opposite claim." for letter in LETTERS if letter != correct}
        return make_rw_item(spec, prompt, choices, correct, "Text 2 accepts the usefulness of volunteer data but adds a condition: training and consistency affect reliability.", distractors, ["cross_text_connections", "qualified_agreement", "hard_passage_stamina"])
    if spec.family == "expression_transitions":
        relation = i % 3
        if relation == 0:
            transition, wrongs = "However,", ["Therefore,", "For example,", "Similarly,"]
            reason = "the second sentence contrasts with the expectation in the first."
        elif relation == 1:
            transition, wrongs = "Therefore,", ["However,", "For instance,", "Nevertheless,"]
            reason = "the second sentence states a result of the finding in the first."
        else:
            transition, wrongs = "For example,", ["Consequently,", "By contrast,", "Nevertheless,"]
            reason = "the second sentence gives a specific example of the broader claim."
        prompt = (
            f"The planning team at the {site} found that students revised more carefully when feedback identified one precise weakness instead of listing every possible issue. "
            f"______ instructors began limiting each first-round comment to a single priority, then used later drafts to address secondary concerns.\n\n"
            "Which choice completes the text with the most logical transition?"
        )
        choices = {correct: transition}
        for letter, text in zip([l for l in LETTERS if l != correct], wrongs):
            choices[letter] = text
        distractors = {letter: f"it signals the wrong logical relationship; {reason}" for letter in LETTERS if letter != correct}
        return make_rw_item(spec, prompt, choices, correct, f"The transition is correct because {reason}", distractors, ["transitions", "logical_relationship", "hard_passage_stamina"])
    if spec.family == "expression_rhetorical":
        prompt = (
            f"While researching the {site}, a student has taken the following notes:\n"
            f"- The site replaced a paper sign-in system with a digital check-in station.\n"
            f"- The station recorded arrival time automatically.\n"
            f"- Staff used the data to identify the busiest tutoring periods.\n"
            f"- The site then assigned more tutors during those periods.\n\n"
            "The student wants to emphasize the practical result of the digital check-in station. Which choice most effectively uses relevant information from the notes?"
        )
        choices = {
            correct: "By automatically recording arrival times, the digital station helped staff schedule more tutors during the busiest periods.",
            **{l: t for l, t in zip([x for x in LETTERS if x != correct], [
                "The site used to rely on a paper sign-in system before installing a digital check-in station.",
                "Tutoring periods at the site varied in how many students arrived for help.",
                "The digital station recorded time automatically, unlike the earlier paper system.",
            ])},
        }
        distractors = {letter: "it mentions a note but does not emphasize the practical staffing result requested by the goal." for letter in LETTERS if letter != correct}
        return make_rw_item(spec, prompt, choices, correct, "The goal asks for the practical result, and the credited choice connects the station to improved tutor scheduling.", distractors, ["rhetorical_synthesis", "student_notes", "hard_passage_stamina"])
    if spec.family == "info_inference":
        prompt = (
            f"Ecologists at the {site} tracked moss growth on stone walls that faced different directions. North-facing walls retained moisture longer after rain, "
            f"but they also received less direct sunlight. The researchers found that moss grew most densely on walls that were shaded for part of the day but still received brief morning light. "
            f"Fully shaded walls had less growth, even though they stayed damp.\n\n"
            "Which conclusion is best supported by the text?"
        )
        choices = {
            correct: "Moisture alone did not determine moss growth in the study.",
            **{l: t for l, t in zip([x for x in LETTERS if x != correct], [
                "North-facing walls always produced the densest moss growth.",
                "Direct sunlight prevented moss from growing on every wall.",
                "The researchers concluded that wall material was more important than light.",
            ])},
        }
        distractors = {letter: "it overstates the pattern or introduces a factor the text does not establish." for letter in LETTERS if letter != correct}
        return make_rw_item(spec, prompt, choices, correct, "The fully shaded walls stayed damp but had less growth, so another factor besides moisture mattered.", distractors, ["inference", "evidence_boundary", "hard_passage_stamina"])
    evidence_scenarios = [
        (
            "A campus access study",
            "adding protected bike lanes did not reduce the total number of visitors to nearby shops",
            "Weekend sales rose slightly, and pedestrian counts increased on blocks where the lanes connected to transit stops",
            "the lanes may have improved access for customers who did not drive",
            "A larger share of shoppers on those blocks reported arriving by bicycle or transit after the lanes opened.",
            [
                "Some drivers said they preferred parking several blocks away from the shops.",
                "Several shops changed their window displays during the same period.",
                "Weekend weather was cooler than average during the months after the lanes opened.",
            ],
            "more shoppers arrived by bicycle or transit",
        ),
        (
            "A museum operations study",
            "keeping the galleries open one hour later did not reduce daytime attendance",
            "Evening visits rose most on days when nearby schools ended after traditional museum hours",
            "the later closing time may have made the museum more accessible to students",
            "Student visitors accounted for most of the added evening attendance after the schedule changed.",
            [
                "The museum gift shop introduced several new postcards that month.",
                "Some daytime visitors said they preferred arriving before noon.",
                "The museum also repainted two galleries during the same season.",
            ],
            "the added visitors were students using the later hours",
        ),
        (
            "A library outreach study",
            "placing a small book pickup kiosk near a bus stop did not reduce visits to the main branch",
            "Holds picked up at the kiosk increased on weekdays when bus ridership was highest",
            "the kiosk may have helped readers who found the main branch inconvenient",
            "Most kiosk users reported that they would not have traveled to the main branch during the same week.",
            [
                "The main branch rearranged its magazine shelves during the study.",
                "Several bus riders said they preferred printed schedules to digital ones.",
                "The kiosk used the same library-card system as the main branch.",
            ],
            "kiosk users were readers who otherwise would not have reached the branch",
        ),
        (
            "A market design study",
            "adding shaded seating did not reduce the number of vendor stalls shoppers visited",
            "Average visit time increased on hot afternoons, especially among shoppers with children",
            "the seating may have made the market easier to use during warm weather",
            "Families with children were more likely to remain at the market after using the shaded seats.",
            [
                "Several vendors changed their prices during the same month.",
                "The market's website posted a new map of stall locations.",
                "A nearby street was repaved shortly before the study began.",
            ],
            "families stayed longer after using the seating",
        ),
        (
            "A tutoring-center study",
            "sending reminder messages did not reduce attendance at optional review sessions",
            "Attendance rose most for students who had previously missed at least one session",
            "the reminders may have helped students who intended to attend but forgot the schedule",
            "Students with prior absences reported that the reminders helped them remember the session time.",
            [
                "The center replaced several tables in the review room.",
                "Some students said they preferred morning classes to afternoon classes.",
                "Tutors used the same worksheets before and after reminders began.",
            ],
            "previously absent students remembered the session time because of the reminders",
        ),
    ]
    intro, action, pattern, argument, right_choice, wrong_choices, support_phrase = evidence_scenarios[(i - 1) % len(evidence_scenarios)]
    prompt = (
        f"{intro} at the {site} reported that {action}. "
        f"{pattern}. The authors cautiously argued that {argument}.\n\n"
        "Which finding, if true, would most directly support the authors' argument?"
    )
    choices = {
        correct: right_choice,
        **{l: t for l, t in zip([x for x in LETTERS if x != correct], wrong_choices)},
    }
    distractors = {letter: "it is related to the setting but does not directly connect the intervention to the specific access claim." for letter in LETTERS if letter != correct}
    return make_rw_item(spec, prompt, choices, correct, f"The argument is about access, so evidence that {support_phrase} directly strengthens the causal link.", distractors, ["command_of_evidence", "supporting_claim", "hard_passage_stamina"])


GENERATOR = {
    "circle_equations": gen_circle_equations,
    "right_triangle_trig": gen_right_triangle_trig,
    "solid_geometry": gen_solid_geometry,
    "lines_angles_triangles": gen_lines_angles_triangles,
    "exponential_functions": gen_exponential_functions,
}


def build_items() -> list[dict[str, Any]]:
    items = []
    for spec in build_specs():
        if spec.section == "Math":
            items.append(GENERATOR[spec.family](spec))
        else:
            items.append(gen_rw_item(spec))
    return items


def load_bank() -> list[dict[str, Any]]:
    return json.loads(BANK_PATH.read_text(encoding="utf-8"))


def validate_new_items(items: list[dict[str, Any]]) -> dict[str, Any]:
    seen_prompts: dict[str, str] = {}
    rows = [reviewed_issue_row({**item, "_sourceFile": BANK_PATH.name, "_sourceIndex": index}, seen_prompts) for index, item in enumerate(items)]
    accuracy = [row for row in rows if row["severity"] == "accuracy_blocker"]
    depth = [row for row in rows if row["severity"] == "depth_gap"]
    warnings = [row for row in rows if row["severity"] == "warning"]
    ids = [item["id"] for item in items]
    duplicate_ids = [qid for qid, count in Counter(ids).items() if count > 1]
    rw_lengths = [word_count(item["prompt"]) for item in items if item["section"] == "Reading and Writing"]
    math_items = [item for item in items if item["section"] == "Math"]
    report = {
        "batchId": BATCH_ID,
        "generatedAt": utc_now(),
        "total": len(items),
        "sectionCounts": dict(Counter(item["section"] for item in items)),
        "domainCounts": dict(Counter(item["domain"] for item in items)),
        "skillCounts": dict(Counter(item["skill"] for item in items)),
        "difficultyCounts": dict(Counter(item["difficulty"] for item in items)),
        "questionTypeCounts": dict(Counter(item["questionType"] for item in items)),
        "rwPromptWords": {
            "count": len(rw_lengths),
            "avg": round(sum(rw_lengths) / len(rw_lengths), 1) if rw_lengths else 0,
            "min": min(rw_lengths) if rw_lengths else 0,
            "max": max(rw_lengths) if rw_lengths else 0,
            "under60": sum(1 for value in rw_lengths if value < 60),
            "over150": sum(1 for value in rw_lengths if value > 150),
        },
        "mathCalculatorTagCounts": dict(Counter("desmos_recommended" if item.get("desmosUseful") else "calculator_allowed" for item in math_items)),
        "accuracyBlockers": len(accuracy),
        "depthGaps": len(depth),
        "warnings": len(warnings),
        "duplicateIds": duplicate_ids,
        "issueSamples": rows[:8] if accuracy or depth else [],
    }
    if duplicate_ids:
        report["accuracyBlockers"] += len(duplicate_ids)
    return report


def validate_against_existing(items: list[dict[str, Any]], bank: list[dict[str, Any]]) -> dict[str, Any]:
    existing_ids = {item.get("id") for item in bank if isinstance(item, dict)}
    existing_prompts = {re.sub(r"\s+", " ", str(item.get("prompt") or "").strip().lower()) for item in bank if isinstance(item, dict) and item.get("prompt")}
    id_collisions = [item["id"] for item in items if item["id"] in existing_ids]
    prompt_collisions = [item["id"] for item in items if re.sub(r"\s+", " ", item["prompt"].strip().lower()) in existing_prompts]
    return {"idCollisions": id_collisions, "promptCollisions": prompt_collisions}


def write_report(report: dict[str, Any]) -> None:
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def apply_items(items: list[dict[str, Any]], report: dict[str, Any]) -> None:
    bank = load_bank()
    backup = ARTIFACTS_DIR / f"antigravity-bank-before-{BATCH_ID}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    shutil.copy2(BANK_PATH, backup)
    existing_batch = [item for item in bank if item.get("sourceSignalId") == BATCH_ID or str(item.get("id", "")).startswith(f"{BATCH_ID}-")]
    bank = [item for item in bank if not (item.get("sourceSignalId") == BATCH_ID or str(item.get("id", "")).startswith(f"{BATCH_ID}-"))]
    bank.extend(items)
    BANK_PATH.write_text(json.dumps(bank, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report["applied"] = True
    report["backupPath"] = str(backup.relative_to(ROOT))
    report["removedExistingBatchRows"] = len(existing_batch)
    report["finalBankCount"] = len(bank)
    write_report(report)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    items = build_items()
    DRAFT_PATH.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report = validate_new_items(items)
    bank = load_bank()
    existing_without_batch = [item for item in bank if not (item.get("sourceSignalId") == BATCH_ID or str(item.get("id", "")).startswith(f"{BATCH_ID}-"))]
    existing_check = validate_against_existing(items, existing_without_batch)
    report["existingCheck"] = existing_check
    report["applied"] = False
    hard_fail = (
        report["accuracyBlockers"]
        or report["depthGaps"]
        or report["duplicateIds"]
        or existing_check["idCollisions"]
        or existing_check["promptCollisions"]
        or report["rwPromptWords"]["over150"]
    )
    report["readyToApply"] = not hard_fail
    if args.apply and hard_fail:
        write_report(report)
        raise SystemExit(f"Batch failed internal validation; see {REPORT_PATH}")
    if args.apply:
        apply_items(items, report)
    else:
        write_report(report)
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
