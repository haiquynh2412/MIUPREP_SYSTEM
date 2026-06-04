"""Follow-up repair for Antigravity content issues exposed after schema normalization."""

from __future__ import annotations

import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "antigravity-bank.json"
ARTIFACTS_DIR = ROOT / "artifacts"
LETTERS = "ABCD"


def norm(value: Any) -> str:
    return " ".join(str(value or "").strip().lower().split())


def choice_text(choice: Any) -> str:
    if isinstance(choice, dict):
        return str(choice.get("text") or choice.get("label") or choice.get("value") or "")
    return str(choice)


def normalize_choice_list_schema(question: dict[str, Any]) -> bool:
    choices = question.get("choices")
    if not isinstance(choices, list) or len(choices) != 4:
        return False
    current = str(question.get("correctAnswer") or "").strip()
    correct_letter = None

    for index, choice in enumerate(choices):
        if isinstance(choice, dict) and (choice.get("isCorrect") is True or choice.get("correct") is True):
            correct_letter = LETTERS[index]
            break
    if correct_letter is None:
        for index, choice in enumerate(choices):
            if norm(choice_text(choice)) == norm(current):
                correct_letter = LETTERS[index]
                break
    if correct_letter is None and current in {"0", "1", "2", "3"}:
        correct_letter = LETTERS[int(current)]

    question["choices"] = {letter: choice_text(choices[index]) for index, letter in enumerate(LETTERS)}
    if correct_letter:
        question["correctAnswer"] = correct_letter
    question.setdefault("questionType", "multiple_choice")
    return True


def normalize_math_grid_in_schema(question: dict[str, Any]) -> bool:
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


def normalize_easy_choice_answer(question: dict[str, Any]) -> bool:
    choices = question.get("choices")
    current = str(question.get("correctAnswer") or "").strip()
    if not str(question.get("id") or "").startswith("antigravity-easy-"):
        return False
    if not isinstance(choices, dict) or set(choices.keys()) != {"A", "B", "C", "D"}:
        return False
    if current not in {"0", "1", "2", "3"}:
        return False
    question["correctAnswer"] = LETTERS[int(current)]

    explanation = question.get("explanation")
    if isinstance(explanation, dict) and isinstance(explanation.get("distractors"), dict):
        mapped: dict[str, Any] = {}
        for key, value in explanation["distractors"].items():
            key_text = str(key)
            mapped[LETTERS[int(key_text)] if key_text in {"0", "1", "2", "3"} else key_text] = value
        explanation["distractors"] = mapped
    return True


REPAIRS: dict[str, dict[str, Any]] = {
    "antigravity-phA-878e9059": {
        "prompt": "If -3 < 2x + 1 < 9, what is the least integer value of x?",
        "correctAnswer": "-1",
        "acceptableAnswers": ["-1"],
        "explanation": {
            "correct": "Subtract 1 from all three parts: -4 < 2x < 8. Divide all three parts by 2: -2 < x < 4. The integers in this interval are -1, 0, 1, 2, and 3, so the least integer value is -1. Final answer = -1.",
            "distractors": {},
        },
    },
    "antigravity-phA-23300790": {
        "explanation": {
            "correct": "From g(3) = a * 2^3 = 8a = 40, we get a = 5. Then g(5) = 5 * 2^5 = 5 * 32 = 160. Faster: from x = 3 to x = 5, the input increases by 2, so the output is multiplied by 2^2 = 4; therefore g(5) = 40 * 4 = 160. Final answer = 160.",
            "distractors": {},
        },
    },
    "antigravity-phB-50a60bcb": {
        "prompt": "If (x - 1)/(3) + (x + 3)/(4) = (6x + 20)/(12), what is the value of x?",
        "explanation": {
            "correct": "Multiply all terms by 12: 4(x - 1) + 3(x + 3) = 6x + 20. Expanding gives 4x - 4 + 3x + 9 = 6x + 20, so 7x + 5 = 6x + 20. Subtract 6x from both sides: x + 5 = 20, so x = 15. Final answer = 15.",
            "distractors": {},
        },
    },
    "antigravity-phB-2a84ac94": {
        "prompt": "If (x - 1)/(3) + (x + 4)/(4) = (6x + 27)/(12), what is the value of x?",
        "explanation": {
            "correct": "Multiply all terms by 12: 4(x - 1) + 3(x + 4) = 6x + 27. Expanding gives 4x - 4 + 3x + 12 = 6x + 27, so 7x + 8 = 6x + 27. Subtract 6x from both sides: x + 8 = 27, so x = 19. Final answer = 19.",
            "distractors": {},
        },
    },
    "antigravity-phB-55414dcf": {
        "explanation": {
            "correct": "Solve each inequality: 2x + 3 > 7 gives x > 2, and 5 - x > 1 gives x < 4. Together, 2 < x < 4. The only integer in that interval is 3, so there is exactly 1 integer value. Final answer = 1.",
            "distractors": {},
        },
    },
    "antigravity-1600-6dc70067": {
        "explanation": {
            "correct": "Convert the rate: 720 items per hour means 720/3600 = 0.2 items per second. In 45 seconds, the machine produces 0.2 * 45 = 9 items. Alternative: 45 seconds is 45/3600 = 1/80 hour, so 720 * 1/80 = 9. Final answer = 9.",
            "distractors": {
                "trap_12": "Using 720/60 = 12 finds items per minute, not items in 45 seconds.",
                "trap_540": "Computing 720 * 45/60 = 540 treats 45 seconds as 45 minutes.",
                "trap_0.75": "Using 45/60 = 0.75 hours is a unit-conversion error; 45 seconds is 1/80 hour.",
            },
        },
    },
    "antigravity-1600-a578b2c8": {
        "explanation": {
            "correct": "Convert the rate: 720 items per hour means 720/3600 = 0.2 items per second. In 45 seconds, the machine produces 0.2 * 45 = 9 items. Alternative: 45 seconds is 45/3600 = 1/80 hour, so 720 * 1/80 = 9. Final answer = 9.",
            "distractors": {
                "trap_12": "Using 720/60 = 12 finds items per minute, not items in 45 seconds.",
                "trap_540": "Computing 720 * 45/60 = 540 treats 45 seconds as 45 minutes.",
                "trap_0.75": "Using 45/60 = 0.75 hours is a unit-conversion error; 45 seconds is 1/80 hour.",
            },
        },
    },
    "antigravity-1600-6eaf7fe4": {
        "explanation": {
            "correct": "Let the original price be 100. After a 60 percent increase, the price is 160. To return to 100, solve 160(1 - q/100) = 100. Then 1 - q/100 = 100/160 = 0.625, so q/100 = 0.375 and q = 37.5. Final answer = 37.5.",
            "distractors": {},
        },
    },
    "antigravity-1600-acf923df": {
        "explanation": {
            "correct": "Let the original volume be 100. A 150 percent increase makes the new volume 250. To return to 100, solve 250(1 - r/100) = 100. Then 1 - r/100 = 100/250 = 0.4, so r/100 = 0.6 and r = 60. Final answer = 60.",
            "distractors": {},
        },
    },
    "antigravity-1600-20e46e78": {
        "explanation": {
            "correct": "Total volume is conserved. The number of cones is the total sphere volume divided by the volume of one cone. The pi factors cancel, so compute 100/5 = 20. Final answer = 20.",
        },
    },
    "antigravity-1600-cea14a4a": {
        "explanation": {
            "correct": "Total volume is conserved. The number of cones is the total sphere volume divided by the volume of one cone. The pi factors cancel, so compute 144/12 = 12. Final answer = 12.",
        },
    },
}


def apply_repair(question: dict[str, Any]) -> bool:
    repair = REPAIRS.get(str(question.get("id") or ""))
    if not repair:
        return False
    for key, value in repair.items():
        question[key] = value
    return True


def main() -> None:
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = ARTIFACTS_DIR / f"antigravity-bank-before-content-followup-repair-{timestamp}.json"
    shutil.copy2(DATA_PATH, backup_path)

    questions = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    stats = {
        "choiceListsConverted": 0,
        "mathGridInsNormalized": 0,
        "easyChoiceAnswersNormalized": 0,
        "contentRowsRepaired": 0,
    }
    for question in questions:
        if not isinstance(question, dict):
            continue
        if normalize_choice_list_schema(question):
            stats["choiceListsConverted"] += 1
        if normalize_math_grid_in_schema(question):
            stats["mathGridInsNormalized"] += 1
        if normalize_easy_choice_answer(question):
            stats["easyChoiceAnswersNormalized"] += 1
        if apply_repair(question):
            stats["contentRowsRepaired"] += 1

    DATA_PATH.write_text(json.dumps(questions, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"backup": str(backup_path), **stats}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
