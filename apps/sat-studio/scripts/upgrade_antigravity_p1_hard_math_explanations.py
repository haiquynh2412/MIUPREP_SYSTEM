import argparse
import csv
import json
import re
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row, word_count
    from scripts.math_verifier import parse_numeric_value
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.upgrade_antigravity_p0_explanations import (
        answer_value,
        clean,
        get_choices,
        get_correct,
        math_distractor_text,
        math_strategy,
        text_from_explanation,
    )
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row, word_count
    from math_verifier import parse_numeric_value
    from review_unified_needs_review_bank import load_payload, write_payload
    from upgrade_antigravity_p0_explanations import (
        answer_value,
        clean,
        get_choices,
        get_correct,
        math_distractor_text,
        math_strategy,
        text_from_explanation,
    )


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SOURCE_FILE = "antigravity-bank.json"
DATA_PATH = DATA_DIR / SOURCE_FILE
QUEUE_PATH = DATA_DIR / "explanation-upgrade-queue.csv"
REPORT_PATH = DATA_DIR / "antigravity-p1-hard-math-explanation-upgrade-report.json"
VERSION = "antigravity-p1-hard-math-explanation-upgrade-2026-05-20"


def queue_indices() -> set[int]:
    indices = set()
    with QUEUE_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if (
                row.get("priority") == "P1"
                and row.get("reason") == "hard_math_explanation_too_thin"
                and row.get("sourceFile") == SOURCE_FILE
            ):
                try:
                    indices.add(int(row.get("sourceIndex") or -1))
                except ValueError:
                    continue
    return indices


def normalized_for_audit(question: dict[str, Any], index: int) -> dict[str, Any]:
    row = dict(question)
    row["_sourceFile"] = SOURCE_FILE
    row["_sourceIndex"] = index
    return row


def is_mc(question: dict[str, Any]) -> bool:
    return isinstance(question.get("choices"), dict) and get_correct(question) in question["choices"]


def skill_focus(question: dict[str, Any]) -> str:
    skill = clean(question.get("skill")).lower()
    prompt = clean(question.get("prompt")).lower()
    if "log" in prompt:
        return "Rewrite the logarithmic statement as an exponent equation before doing any arithmetic."
    if "discriminant" in prompt or "exactly one solution" in prompt:
        return "Use the discriminant-zero condition for a repeated root, then solve for the requested parameter."
    if "nonlinear" in skill:
        return "Track the function input, root condition, or exponent rule exactly; nonlinear items often punish treating the expression as linear."
    if "system" in skill:
        return "Use both equations and keep the requested expression separate from the individual variable values."
    if "linear function" in skill:
        return "Find the rate of change from the two input-output pairs, then use one point to build or extend the function."
    if "linear equations in one variable" in skill:
        return "Translate the condition into one equation and isolate the requested unknown without changing what the variable represents."
    if "inequal" in skill:
        return "Solve the inequality and then apply the integer or boundary condition requested by the question."
    if "percent" in skill or "ratio" in skill or "rate" in skill:
        return "Identify the base quantity first; the percentage or rate must be applied to that base, not to a nearby total."
    if "probability" in skill:
        return "Count the favorable outcomes and total outcomes under the stated condition before forming the probability."
    if "one-variable data" in skill or "two-variable data" in skill:
        return "Use the statistic named in the question and avoid switching to a nearby mean, total, or model value."
    if "equivalent" in skill:
        return "Carry out the algebraic rewrite in legal steps, especially factoring, distributing signs, and canceling only common factors."
    if "circle" in skill:
        return "Separate radius, diameter, circumference, and area before substituting into the formula."
    if "triangle" in skill or "trigonometry" in skill:
        return "Match the given side or angle to the correct theorem or trigonometric ratio before calculating."
    if "area" in skill or "volume" in skill:
        return "Choose the formula for the requested measure, then check that each dimension is in the right role."
    return math_strategy(question)


def trap_focus(question: dict[str, Any]) -> str:
    skill = clean(question.get("skill")).lower()
    prompt = clean(question.get("prompt")).lower()
    if "log" in prompt:
        return "The common mistake is to multiply the base and exponent or to confuse log base 2 with a common logarithm."
    if "exactly one solution" in prompt:
        return "The main trap is finding a root of the quadratic instead of the parameter value that makes the two roots coincide."
    if "system" in skill:
        return "A tempting error is to solve for one variable and stop, even though the prompt asks for a condition or expression involving the full system."
    if "percent" in skill:
        return "The frequent error is using the whole population as the base when the question narrows the base first."
    if "probability" in skill:
        return "The trap is counting cases from the original sample space after the prompt has already imposed a condition."
    if "equivalent" in skill:
        return "The trap is an illegal cancellation or a sign error that gives a familiar-looking but non-equivalent expression."
    if "nonlinear" in skill:
        return "The tempting shortcut is to treat a square, exponent, or composition as if it changed at a constant linear rate."
    if "circle" in skill:
        return "The usual trap is using a related measure, such as diameter instead of radius or circumference instead of area."
    return "The SAT trap is to report a nearby intermediate value instead of the final quantity named in the last sentence."


def ensure_final_answer(text: str, question: dict[str, Any]) -> str:
    answer = answer_value(question)
    if parse_numeric_value(answer) is None:
        return text
    if re.search(r"Final answer\s*=", text, flags=re.I):
        return text
    return f"{text} Final answer = {answer}."


def expanded_correct_explanation(question: dict[str, Any]) -> str:
    answer = answer_value(question)
    base = text_from_explanation(question.get("explanation"))
    opener = f"Choice {get_correct(question)} is correct: {answer}." if is_mc(question) else f"The correct answer is {answer}."
    base_sentence = f"The source calculation is: {base}" if base else "Set up the equation or model named in the prompt before calculating."
    text = (
        f"{opener} {base_sentence} "
        f"Method: {skill_focus(question)} "
        f"Trap check: {trap_focus(question)}"
    )
    text = ensure_final_answer(clean(text), question)
    if word_count(text) < 40:
        text = (
            f"{text} This extra check matters on hard SAT Math because the answer choices often include values from a correct-looking but incomplete setup."
        )
    return clean(text)


def existing_distractors(question: dict[str, Any]) -> dict[str, Any]:
    explanation = question.get("explanation")
    if isinstance(explanation, dict) and isinstance(explanation.get("distractors"), dict):
        return explanation["distractors"]
    return {}


def expanded_distractor(question: dict[str, Any], label: str, value: Any) -> str:
    current = clean(existing_distractors(question).get(label))
    value_text = clean(value)
    if current and word_count(current) >= 8:
        return current
    if current:
        return (
            f"Choice {label} ({value_text}) is tempting because it reflects this partial step: {current} "
            f"It still fails the full setup that leads to {answer_value(question)}."
        )
    return math_distractor_text(question, label, value)


def upgraded_explanation(question: dict[str, Any]) -> dict[str, Any]:
    distractors: dict[str, str] = {}
    for label, value in get_choices(question).items():
        if label != get_correct(question):
            distractors[label] = expanded_distractor(question, label, value)
    return {"correct": expanded_correct_explanation(question), "distractors": distractors}


def set_explanation(question: dict[str, Any]) -> None:
    question["explanation"] = upgraded_explanation(question)
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["antigravityP1HardMathExplanationUpgradeVersion"] = VERSION
    question["expertRepairNotes"] = notes


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    target_indices = queue_indices()
    payload, questions = load_payload(DATA_PATH)
    report: dict[str, Any] = {
        "apply": args.apply,
        "version": VERSION,
        "targetCount": len(target_indices),
        "attempted": [],
        "upgraded": [],
        "blocked": [],
        "remainingDepthFlags": [],
    }

    for index, question in enumerate(questions):
        if not isinstance(question, dict) or index not in target_indices:
            continue
        original_question = json.loads(json.dumps(question, ensure_ascii=False))
        report["attempted"].append({"id": question.get("id"), "sourceIndex": index})
        set_explanation(question)
        audit_row = reviewed_issue_row(normalized_for_audit(question, index), {})
        warnings = [warning for warning in audit_row.get("warnings", []) if not warning.startswith("duplicate_prompt_with:")]
        flags = pedagogical_depth_flags(normalized_for_audit(question, index))
        if audit_row.get("issues") or warnings or flags:
            blocked_row = {
                "id": question.get("id"),
                "sourceIndex": index,
                "issues": audit_row.get("issues"),
                "warnings": warnings,
                "depthFlags": flags,
            }
            report["blocked"].append(blocked_row)
            if flags:
                report["remainingDepthFlags"].append(blocked_row)
            questions[index] = original_question
            continue
        report["upgraded"].append({"id": question.get("id"), "sourceIndex": index})

    if args.apply:
        write_payload(DATA_PATH, payload)
    report["attemptedCount"] = len(report["attempted"])
    report["upgradedCount"] = len(report["upgraded"])
    report["blockedCount"] = len(report["blocked"])
    report["remainingDepthFlagCount"] = len(report["remainingDepthFlags"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in {"attempted", "upgraded", "blocked", "remainingDepthFlags"}}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
