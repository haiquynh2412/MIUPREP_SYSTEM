"""Repair content-integrity issues surfaced by check_questions.py.

This script is intentionally narrow:
- normalize Antigravity multiple-choice rows that stored choices as a list
- mark Math free-response rows without choices as grid-in rows
- rewrite the 2026-05-24 critical Math explanations whose arithmetic was
  correct but used missing multiplication/discriminant notation
"""

from __future__ import annotations

import json
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "antigravity-bank.json"
ARTIFACTS_DIR = ROOT / "artifacts"
LETTERS = "ABCD"


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip()).lower()


def choice_text(choice: Any) -> str:
    if isinstance(choice, dict):
        return str(choice.get("text") or choice.get("label") or choice.get("value") or "")
    return str(choice)


def correct_letter_from_list(question: dict[str, Any], choices: list[Any]) -> str | None:
    current = str(question.get("correctAnswer") or "").strip()
    if len(current) == 1 and current.upper() in LETTERS:
        return current.upper()

    normalized_current = normalize_text(current)
    for index, choice in enumerate(choices):
        if normalize_text(choice_text(choice)) == normalized_current:
            return LETTERS[index]

    correct_flags = [
        index
        for index, choice in enumerate(choices)
        if isinstance(choice, dict) and bool(choice.get("isCorrect"))
    ]
    if len(correct_flags) == 1:
        return LETTERS[correct_flags[0]]

    return None


def convert_choice_list(question: dict[str, Any]) -> bool:
    choices = question.get("choices")
    if not isinstance(choices, list) or len(choices) != 4:
        return False

    answer_letter = correct_letter_from_list(question, choices)
    question["choices"] = {letter: choice_text(choices[index]) for index, letter in enumerate(LETTERS)}
    if answer_letter:
        question["correctAnswer"] = answer_letter
    question.setdefault("questionType", "multiple_choice")
    return True


def mark_grid_in(question: dict[str, Any]) -> bool:
    if question.get("section") != "Math":
        return False
    if question.get("choices") not in (None, {}, []):
        return False
    correct = str(question.get("correctAnswer") or "").strip()
    if not correct:
        return False
    question["questionType"] = "grid_in"
    question.pop("choices", None)
    if not question.get("acceptableAnswers"):
        question["acceptableAnswers"] = [correct]
    return True


EXPLANATION_REPAIRS: dict[str, dict[str, Any]] = {
    "antigravity-0bbeffb8": {
        "correct": "Substitute y = (3/2)x into 3x - y = 12: 3x - (3/2)x = 12, so (3/2)x = 12. Multiply both sides by 2/3: x = 12 × 2/3 = 8. Final answer = 8.",
        "distractors": {
            "A": "This comes from solving too early or using half of 12.",
            "B": "This is the constant in the first equation, not the value of x.",
            "D": "This is 12 divided by 3, which ignores the substituted coefficient 3/2.",
        },
    },
    "antigravity-b0d2ef43": {
        "correct": "The maximum of P(x) = -3x^2 + 60x - 200 occurs at the vertex. Use x = -b/(2a): x = -60/(2 × -3) = -60/-6 = 10. Since x is measured in thousands, the company must sell 10 thousand units. Final answer = 10.",
        "distractors": {
            "A": "This overuses the coefficient 3 and does not compute the vertex.",
            "B": "This is the linear coefficient, not the maximizing x-value.",
            "C": "This is a plausible trap from using 60/3, but the vertex formula requires 2a in the denominator.",
        },
    },
    "antigravity-8cf4ba68": {
        "correct": "The sum of the interior angles of an n-sided polygon is (n - 2) × 180°. For a hexagon, n = 6, so the sum is (6 - 2) × 180° = 4 × 180° = 720°. Final answer = 720°.",
        "distractors": {
            "A": "This is too large and may come from using 6 × 180°.",
            "C": "This is the sum for a quadrilateral, not a hexagon.",
            "D": "This is the sum for a pentagon, not a hexagon.",
        },
    },
    "antigravity-phA-db0b9acd": {
        "correct": "For a linear function h(x) = mx + c, h(a) - h(b) = m(a - b). From h(3) - h(1) = m(3 - 1) = 2m = 8, so m = 4. Then h(6) - h(2) = m(6 - 2) = 4 × 4 = 16. Final answer = 16.",
        "distractors": {
            "B": "Additive trap: adds 4 to 8 instead of scaling by the interval length.",
            "C": "Triple trap: multiplies 8 by 3 instead of comparing interval widths.",
            "D": "Constant-difference trap: assumes h(a) - h(b) is always 8.",
        },
    },
    "antigravity-phA-f621f68d": {
        "correct": "Use a^3 + b^3 = (a + b)(a^2 - ab + b^2). First find ab: (a + b)^2 = a^2 + 2ab + b^2, so 25 = 17 + 2ab and ab = 4. Then a^2 - ab + b^2 = 17 - 4 = 13. Therefore a^3 + b^3 = 5 × 13 = 65. Final answer = 65.",
        "distractors": {
            "B": "This can result from finding ab incorrectly after expanding (a + b)^2.",
            "C": "This is (a + b)(a^2 + b^2) = 5 × 17 = 85, which forgets the -ab term.",
            "D": "This uses the correct identity form but an incorrect value for ab.",
        },
    },
    "antigravity-1600-0db6f087": {
        "correct": "**Fast path:** Factor the expression as ((x - 3)(x + 3))/((x + 2)(x + 3)) × (x + 2)/(x - 3). The factors (x + 3), (x + 2), and (x - 3) all cancel, leaving 1. **Check:** Substitute x = 1: ((1 - 9)/(1 + 5 + 6)) × (3/(-2)) = (-8/12) × (3/(-2)) = (-2/3) × (3/(-2)) = 1. Final answer = 1.",
        "distractors": {
            "B": "**Partial cancellation:** Cancels only some factors and leaves an unnecessary (x + 3)/(x + 2).",
            "C": "**Reversed cancellation:** Leaves (x - 3)/(x + 3) even though those factors also cancel.",
            "D": "**No cross-cancellation:** Multiplies before canceling all common factors.",
        },
    },
    "antigravity-1600-e431ab92": {
        "correct": "**Fast path:** Multiply numerator and denominator by ab. The numerator becomes ab(3/a + 2/b) = 3b + 2a. The denominator becomes ab(6/(ab)) = 6. Result: (3b + 2a)/6. **Check:** Let a = 2 and b = 3. The original expression is (3/2 + 2/3)/(6/(2 × 3)) = (13/6)/1 = 13/6. Choice A gives (9 + 4)/6 = 13/6. Final answer = A.",
        "distractors": {
            "B": "**Variable association trap:** Multiplying 3/a by ab gives 3b, not 3a.",
            "C": "**Denominator trap:** After multiplying by ab, the denominator simplifies to 6, not 6ab.",
            "D": "**Unlike-terms trap:** 3/a + 2/b cannot be combined as 5/(ab).",
        },
    },
    "antigravity-1600-16d204a9": {
        "correct": "**Convert each dimension:** 3 inches × 5 miles per inch = 15 miles, and 4 inches × 5 miles per inch = 20 miles. The actual area is 15 × 20 = 300 square miles. **Scale-factor check:** The map area is 12 square inches and the area scale factor is 5^2 = 25, so the actual area is 12 × 25 = 300. Final answer = 300.",
        "distractors": {
            "A": "**Linear scale only:** 12 × 5 = 60 applies the linear scale to area and forgets to square it.",
            "B": "**Partial scale trap:** Uses one converted dimension but not both.",
            "D": "**Over-scaling trap:** Applies too many scale factors.",
        },
    },
    "antigravity-1600-c6d14617": {
        "correct": "**Gear ratio:** Teeth and revolutions are inversely proportional. Gear B's speed is 150 × 20/50 = 150 × 0.4 = 60 rpm. **Check:** Gear A engages 20 × 150 = 3000 teeth per minute, and Gear B at 60 rpm engages 50 × 60 = 3000 teeth per minute. Final answer = 60.",
        "distractors": {
            "B": "**Arithmetic trap:** Computes 150 × 2/5 incorrectly.",
            "C": "**Wrong relationship:** Uses a difference or unrelated combination instead of the inverse ratio.",
            "D": "**Inverted ratio:** Uses 150 × 50/20 = 375, but the larger gear turns slower.",
        },
    },
    "antigravity-1600-0434d30c": {
        "correct": "Multiply the map distance by the scale factor: 14.4 × 2.5 = 36 km. A quick way is 14.4 × 2.5 = 14.4 × 5/2 = 72/2 = 36. Final answer = 36.",
        "distractors": {
            "A": "**Using 2 instead of 2.5:** 14.4 × 2 = 28.8.",
            "C": "**Dividing instead:** 14.4 ÷ 2.5 = 5.76.",
            "D": "**Using 5 instead of 2.5:** 14.4 × 5 = 72.",
        },
    },
    "antigravity-1600-f45b0b38": {
        "correct": "**Harmonic mean:** For equal distances, average speed = (2 × 60 × 40)/(60 + 40) = 4800/100 = 48 mph. **From first principles:** Let d be the one-way distance. Total time is d/60 + d/40 = d/24, and total distance is 2d, so average speed is 2d/(d/24) = 48. The arithmetic mean of 60 and 40 is 50, but that is not valid because more time is spent at the slower speed. Final answer = 48.",
        "distractors": {
            "B": "**Arithmetic-mean trap:** Averages 60 and 40 to get 50.",
            "C": "**Weighting trap:** Uses an incorrect weighted average.",
            "D": "**Computation trap:** Comes from an incorrect denominator in the harmonic mean.",
        },
    },
    "antigravity-1600-86b392aa": {
        "correct": "**Path 1:** Multiply both sides by (x + 1)(x - 1), noting x cannot equal -1 or 1. This gives x(x - 1) + 3(x + 1) = 4, so x^2 + 2x - 1 = 0. The discriminant is 2^2 - 4(1)(-1) = 8, so there are two real roots. Neither root is excluded by x = -1 or x = 1, so both are valid. **Path 2:** The roots are -1 ± sqrt(2), and neither equals -1 or 1. Final answer = 2.",
        "distractors": {
            "A": "**Discriminant trap:** Treats the quadratic as having no real roots.",
            "B": "**Extraneous-root trap:** Rejects one valid solution incorrectly.",
            "D": "**Degree trap:** Creates a phantom cubic root by not clearing denominators correctly.",
        },
    },
    "antigravity-1600-82080bf0": {
        "correct": "For x^2 - ax + a^2 - 3 = 0, the discriminant is a^2 - 4(a^2 - 3) = -3a^2 + 12. No real roots means the discriminant is negative: -3a^2 + 12 < 0, so a^2 > 4 and |a| > 2. Choice a = 3 works. Check: when a = 3, the discriminant is 9 - 24 = -15 < 0. Final answer = 3.",
        "distractors": {
            "B": "**Boundary value:** a = 2 gives discriminant 0, so there is one real root.",
            "C": "**Under threshold:** a = 1 gives a positive discriminant.",
            "D": "**Zero trap:** a = 0 gives x^2 - 3 = 0, which has two real roots.",
        },
    },
    "antigravity-1600-e5280a99": {
        "correct": "If two roots are reciprocals, their product is 1. By Vieta's formula for x^2 + kx + (k - 2) = 0, the product of the roots is k - 2. Therefore k - 2 = 1, so k = 3. Check: x^2 + 3x + 1 = 0 has discriminant 3^2 - 4(1)(1) = 5 > 0, so it has two real roots with product 1. Final answer = 3.",
        "distractors": {
            "B": "**Sum/product confusion:** Uses the reciprocal condition as a condition on the sum.",
            "C": "**Off-by-one trap:** Sets k - 2 = 1 but solves it incorrectly.",
            "D": "**Sign trap:** Changes the product condition to a negative value.",
        },
    },
}


DUPLICATE_EXPLANATION_IDS = {
    "antigravity-1600-addbf317": "antigravity-1600-16d204a9",
    "antigravity-1600-e8ae7f5b": "antigravity-1600-c6d14617",
    "antigravity-1600-3685025a": "antigravity-1600-0434d30c",
    "antigravity-1600-fd6f2e13": "antigravity-1600-f45b0b38",
}


PROMPT_REPAIRS = {
    "antigravity-1600-0db6f087": "Which of the following is equivalent to ((x^2 - 9)/(x^2 + 5x + 6)) × ((x + 2)/(x - 3)), for x ≠ -3, x ≠ -2, and x ≠ 3?",
    "antigravity-1600-e431ab92": "Which of the following is equivalent to (3a^-1 + 2b^-1)/(6a^-1b^-1), for a and b nonzero?",
}


def repair_explanations(question: dict[str, Any]) -> bool:
    question_id = str(question.get("id") or "")
    source_id = DUPLICATE_EXPLANATION_IDS.get(question_id, question_id)
    repaired = False
    if source_id in EXPLANATION_REPAIRS:
        question["explanation"] = EXPLANATION_REPAIRS[source_id]
        repaired = True
    if question_id in PROMPT_REPAIRS:
        question["prompt"] = PROMPT_REPAIRS[question_id]
        repaired = True
    return repaired


def main() -> None:
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = ARTIFACTS_DIR / f"antigravity-bank-before-content-integrity-repair-{timestamp}.json"
    shutil.copy2(DATA_PATH, backup_path)

    questions = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    stats = {
        "choiceListsConverted": 0,
        "gridInRowsMarked": 0,
        "explanationsRepaired": 0,
    }

    for question in questions:
        if not isinstance(question, dict):
            continue
        if convert_choice_list(question):
            stats["choiceListsConverted"] += 1
        if mark_grid_in(question):
            stats["gridInRowsMarked"] += 1
        if repair_explanations(question):
            stats["explanationsRepaired"] += 1

    DATA_PATH.write_text(json.dumps(questions, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"backup": str(backup_path), **stats}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
