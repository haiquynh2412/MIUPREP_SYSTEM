import argparse
import csv
import json
import re
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row
    from scripts.math_verifier import parse_numeric_value
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.upgrade_antigravity_p0_explanations import clean, math_distractor_text
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row
    from math_verifier import parse_numeric_value
    from review_unified_needs_review_bank import load_payload, write_payload
    from upgrade_antigravity_p0_explanations import clean, math_distractor_text


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SOURCE_FILE = "opensat-pinesat.json"
DATA_PATH = DATA_DIR / SOURCE_FILE
QUEUE_PATH = DATA_DIR / "explanation-upgrade-queue.csv"
REPORT_PATH = DATA_DIR / "opensat-p0-math-quality-repair-report.json"
VERSION = "opensat-p0-math-quality-repair-2026-05-20"
TARGET = "SAT 1000-1600 roadmap, target 1600"


INVALID_REVIEW_INDICES: dict[int, str] = {
    1684: "computed answer is -1, but no choice contains -1",
    1709: "computed answer is 15, but no choice contains 15",
    1792: "computed answer is -5, but no choice contains -5",
    2075: "prompt is missing the garden dimensions needed to verify the keyed area",
    2009: "computed answer is 2/3, but no choice contains 2/3",
    1616: "computed answer is 13, but no choice contains 13",
    2212: "computed answer is 9, but no choice contains 9",
    2315: "computed answer is 13, but no choice contains 13",
    1471: "computed answer is -3, but no choice contains -3",
    2350: "computed answer is 17, but no choice contains 17",
    1477: "computed answer is 15, but no choice contains 15",
    1730: "computed answer is 1, but no choice contains 1",
    2299: "sector area is 5pi, but no choice contains 5pi",
    1579: "computed answer is -5, but no choice contains -5",
    2038: "conditional probability is 20/50 = 2/5, but no choice contains 2/5",
    1701: "computed answer is 15, but no choice contains 15",
    2174: "ratio gives 45 oatmeal cookies, but no choice contains 45",
    1823: "f(2)+f(3) is 13, but no choice contains 13",
    1580: "inverse value is 16, but no choice contains 16",
    2125: "equation gives a = 3 or a = -3; the item is ambiguous as written",
    2298: "prompt is missing the expression; explanation gives b = 1, but no choice contains 1",
    1648: "angle ABC should be 90 degrees from the diameter, but no choice contains 90",
    1994: "x1^2 + x2^2 is 37/4, but no choice contains 37/4",
    1966: "budget calculation gives 18 tickets, but no choice contains 18",
    2164: "system gives x-y = 12/7, but no choice contains 12/7",
    1765: "radius is 3sqrt(2), but no choice contains 3sqrt(2)",
    2423: "strawberry count is 54, but no choice contains 54",
    2004: "f(2) is 5/3, but no choice contains 5/3",
    1773: "system gives x+y = 27/5, but no choice contains 27/5",
    1604: "equation gives a = 3 or -3/2, but no choice contains either exact value",
    2005: "equation gives x = 16, but no choice contains 16",
    1788: "distance is 3sqrt(2), but no choice contains 3sqrt(2)",
    2266: "radius is 6sqrt(2), but no choice contains 6sqrt(2)",
    1897: "parabola has no real x-intercepts, so the requested sum is undefined",
    1662: "radius is 3sqrt(2), but no choice contains 3sqrt(2)",
    2255: "log equation gives 1 + 2sqrt(3), but no choice contains that value",
    1497: "triangle data give AC = 10 sin(80)/sin(60), not any listed choice",
    1861: "log equation gives (-1 + 3sqrt(5))/2, not an exact listed choice",
    1945: "intersection distance is sqrt(2), but no choice contains sqrt(2)",
    1807: "incircle area is 3pi, but no choice contains 3pi",
    1675: "tangent condition gives b = +/-5sqrt(17), but no choice contains that value",
}

CORRECT_LABEL_OVERRIDES: dict[int, str] = {
    2076: "C",
    2239: "B",
    2375: "C",
    2206: "A",
    2235: "C",
    2411: "D",
    2392: "C",
    2029: "A",
    1470: "A",
    2101: "C",
    2432: "B",
    1632: "B",
    2020: "C",
    1832: "D",
    2226: "C",
    2257: "C",
    2436: "A",
    2325: "A",
    1533: "A",
    1481: "B",
}

CUSTOM_BASE_EXPLANATIONS: dict[int, str] = {
    2141: "Factor out the 2 first: 2x^2 - 14x + 24 = 2(x^2 - 7x + 12) = 2(x - 3)(x - 4). Thus a = 3 and b = 4, so a + b = 7.",
    2432: "Because x^2 + 2x - 3 = 0, multiplying both sides by x gives x^3 + 2x^2 - 3x = 0. Both solutions of the original equation make the expression equal 0.",
    2020: "The survey has 100 people, and 60% of 100 is 60. Therefore, 60 people preferred pizza. The statement about 30 people preferring tacos is not needed to answer the direct percent question.",
    2458: "OA and OB are both radii of length 5, and the central angle AOB is 120 degrees. The chord length is 2r sin(120/2) = 10 sin(60) = 5sqrt(3).",
    1554: "The constant term of the polynomial 2x^3 + 5x^2 - 4x - 3 is the term with no variable. That term is -3.",
}

PROMPT_REPAIRS: dict[int, str] = {
    2458: "A circle with center $O$ has a radius of 5. Point $A$ lies on the circle, and line segment $OA$ is a radius of the circle. If point $B$ lies on the circle such that angle $AOB$ measures 120 degrees, what is the length of line segment $AB$?",
    1554: "For the polynomial \\(2x^3 + 5x^2 - 4x - 3\\), what is the value of the constant term?",
}


def nested(question: dict[str, Any]) -> dict[str, Any]:
    value = question.get("question")
    return value if isinstance(value, dict) else {}


def get_choices(question: dict[str, Any]) -> dict[str, Any]:
    choices = question.get("choices")
    if isinstance(choices, dict) and choices:
        return choices
    choices = nested(question).get("choices")
    return choices if isinstance(choices, dict) else {}


def get_correct(question: dict[str, Any]) -> str:
    return str(question.get("correctAnswer") or nested(question).get("correct_answer") or nested(question).get("correctAnswer") or "")


def set_correct(question: dict[str, Any], label: str) -> None:
    question["correctAnswer"] = label
    n = nested(question)
    if n:
        n["correct_answer"] = label
        n["correctAnswer"] = label


def answer_value(question: dict[str, Any]) -> str:
    choices = get_choices(question)
    correct = get_correct(question)
    if correct in choices:
        return clean(choices[correct])
    return correct


def get_explanation_text(question: dict[str, Any]) -> str:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        return clean(explanation.get("correct"))
    explanation = nested(question).get("explanation")
    if isinstance(explanation, dict):
        return clean(explanation.get("correct"))
    return clean(explanation)


def strip_old_final(text: str) -> str:
    text = re.sub(r"\s*Final\s+answer\s*(?:=|:)\s*.*$", "", text, flags=re.I | re.S)
    return clean(text)


def queue_indices() -> set[int]:
    indices = set()
    with QUEUE_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("priority") == "P0" and row.get("sourceFile") == SOURCE_FILE:
                try:
                    indices.add(int(row.get("sourceIndex") or -1))
                except ValueError:
                    continue
    return indices


def normalized_for_audit(question: dict[str, Any], index: int) -> dict[str, Any]:
    row = dict(question)
    row["_sourceFile"] = SOURCE_FILE
    row["_sourceIndex"] = index
    row["prompt"] = question.get("prompt") or nested(question).get("question")
    row["choices"] = get_choices(question)
    row["correctAnswer"] = get_correct(question)
    row["questionType"] = question.get("questionType") or "multiple_choice"
    return row


def set_prompt(question: dict[str, Any], prompt: str) -> None:
    n = nested(question)
    if n:
        n["question"] = prompt
    if question.get("prompt"):
        question["prompt"] = prompt


def final_sentence(answer: str) -> str:
    if parse_numeric_value(answer) is not None:
        return f" Final answer = {answer}."
    return ""


def upgraded_explanation(question: dict[str, Any], index: int) -> dict[str, Any]:
    base = CUSTOM_BASE_EXPLANATIONS.get(index) or strip_old_final(get_explanation_text(question))
    answer = answer_value(question)
    correct = get_correct(question)
    correct_text = (
        f"Choice {correct} is correct: {answer}. {base} "
        f"This answers the exact quantity requested by the prompt; the final step is to match that value to the credited choice."
        f"{final_sentence(answer)}"
    )
    distractors = {}
    for label, value in get_choices(question).items():
        if label != correct:
            distractors[label] = math_distractor_text(question, label, value)
    return {"correct": clean(correct_text), "distractors": distractors}


def set_explanation(question: dict[str, Any], explanation: dict[str, Any]) -> None:
    question["explanation"] = explanation
    n = nested(question)
    if n:
        n["explanation"] = explanation
    question["questionType"] = "multiple_choice"
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["opensatP0MathQualityRepairVersion"] = VERSION
    question["expertRepairNotes"] = notes


def demote_to_needs_review(question: dict[str, Any], reason: str) -> None:
    question["reviewStatus"] = "needs_review"
    question["publicationStatus"] = "needs_review"
    question["postReviewUse"] = "pending_strict_review_for_unified_mixed_sat_pool"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "needs_review",
        "severity": "accuracy_blocker",
        "reviewer": "Codex SAT expert repair",
        "checkedAt": "2026-05-20",
        "target": TARGET,
        "issues": ["answer_key_or_choice_set_invalid"],
        "reason": reason,
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "needs_review",
        "target": TARGET,
        "criteria": [
            "valid answer key",
            "choice set includes the computed correct answer",
            "prompt supplies enough information",
            "explanation matches the correct answer",
        ],
    }
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["opensatP0MathQualityDemotionVersion"] = VERSION
    notes["opensatP0MathQualityDemotionReason"] = reason
    question["expertRepairNotes"] = notes


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    targets = queue_indices()
    payload, questions = load_payload(DATA_PATH)
    report: dict[str, Any] = {
        "apply": args.apply,
        "version": VERSION,
        "targetCount": len(targets),
        "repaired": [],
        "demotedNeedsReview": [],
        "blocked": [],
    }

    for index, question in enumerate(questions):
        if not isinstance(question, dict) or index not in targets:
            continue
        original_question = json.loads(json.dumps(question, ensure_ascii=False))
        if index in INVALID_REVIEW_INDICES:
            demote_to_needs_review(question, INVALID_REVIEW_INDICES[index])
            report["demotedNeedsReview"].append({"id": question.get("id"), "sourceIndex": index, "reason": INVALID_REVIEW_INDICES[index]})
            continue

        if index in PROMPT_REPAIRS:
            set_prompt(question, PROMPT_REPAIRS[index])
        correct = CORRECT_LABEL_OVERRIDES.get(index, get_correct(question))
        set_correct(question, correct)
        set_explanation(question, upgraded_explanation(question, index))

        audit_row = reviewed_issue_row(normalized_for_audit(question, index), {})
        warnings = [w for w in audit_row.get("warnings", []) if not w.startswith("duplicate_prompt_with:")]
        flags = pedagogical_depth_flags(normalized_for_audit(question, index))
        if audit_row.get("issues") or warnings or flags:
            report["blocked"].append({
                "id": question.get("id"),
                "sourceIndex": index,
                "issues": audit_row.get("issues"),
                "warnings": warnings,
                "depthFlags": flags,
            })
            questions[index] = original_question
            continue
        report["repaired"].append({"id": question.get("id"), "sourceIndex": index, "correctAnswer": get_correct(question)})

    if args.apply:
        write_payload(DATA_PATH, payload)
    report["repairedCount"] = len(report["repaired"])
    report["demotedNeedsReviewCount"] = len(report["demotedNeedsReview"])
    report["blockedCount"] = len(report["blocked"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in {"repaired", "demotedNeedsReview", "blocked"}}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
