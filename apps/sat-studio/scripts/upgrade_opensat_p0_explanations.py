import argparse
import csv
import json
import re
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row
    from review_unified_needs_review_bank import load_payload, write_payload


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SOURCE_FILE = "opensat-pinesat.json"
DATA_PATH = DATA_DIR / SOURCE_FILE
QUEUE_PATH = DATA_DIR / "explanation-upgrade-queue.csv"
REPORT_PATH = DATA_DIR / "opensat-p0-explanation-upgrade-report.json"
VERSION = "opensat-p0-explanation-upgrade-2026-05-20"


def clean(value: Any) -> str:
    text = str(value or "").strip()
    text = text.replace("â€”", "--").replace("â†’", "->")
    return re.sub(r"\s+", " ", text)


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


def get_prompt(question: dict[str, Any]) -> str:
    if question.get("prompt"):
        return clean(question.get("prompt"))
    n = nested(question)
    parts = [n.get("paragraph"), n.get("question")]
    return "\n\n".join(clean(part) for part in parts if clean(part))


def get_explanation_text(question: dict[str, Any]) -> str:
    explanation = question.get("explanation")
    if isinstance(explanation, dict) and explanation.get("correct"):
        return clean(explanation.get("correct"))
    explanation = nested(question).get("explanation")
    if isinstance(explanation, dict):
        return clean(explanation.get("correct"))
    return clean(explanation)


def answer_value(question: dict[str, Any]) -> str:
    choices = get_choices(question)
    correct = get_correct(question)
    if correct in choices:
        return clean(choices[correct])
    return correct


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
    row["prompt"] = get_prompt(question)
    row["choices"] = get_choices(question)
    row["correctAnswer"] = get_correct(question)
    row["questionType"] = question.get("questionType") or "multiple_choice"
    row["explanation"] = question.get("explanation")
    return row


def math_strategy(question: dict[str, Any]) -> str:
    skill = clean(question.get("skill")).lower()
    if "quadratic" in skill or "nonlinear" in skill:
        return "Use the structure of the equation first--factoring, graph features, or substitution--then compare the result with the exact quantity asked for."
    if "circle" in skill:
        return "Identify whether the prompt asks for radius, diameter, circumference, area, arc length, or a coordinate relationship before applying a formula."
    if "triangle" in skill or "trigonometry" in skill:
        return "Set up the geometric ratio or theorem from the given information; avoid choosing a visually tempting length or angle."
    if "linear" in skill or "systems" in skill:
        return "Translate the condition into an equation or system, solve cleanly, and check that the answer corresponds to the requested variable."
    if "ratio" in skill or "percent" in skill or "data" in skill or "statistics" in skill:
        return "Identify the base, unit, and statistic being requested before calculating; many wrong answers use the right numbers in the wrong relationship."
    if "equivalent" in skill:
        return "Rewrite expressions by factoring, expanding, or combining like terms in a controlled order; avoid canceling non-factors."
    return "Use the explicit relationship in the prompt and keep intermediate results separate from the final answer."


def math_explanation(question: dict[str, Any]) -> dict[str, Any]:
    base = re.sub(r"Final answer\s*=\s*[^.]+\.?", "", get_explanation_text(question), flags=re.I).strip()
    ans = answer_value(question)
    correct = (
        f"{base} {math_strategy(question)} The credited answer is {get_correct(question)}, {ans}. "
        f"This matches the requested quantity rather than an intermediate calculation."
    )
    choices = get_choices(question)
    distractors = {}
    for label, value in choices.items():
        if label == get_correct(question):
            continue
        distractors[label] = (
            f"Choice {label} ({clean(value)}) follows from a different setup, a sign or unit mistake, "
            f"or stopping before the final requested quantity; it does not produce {ans}."
        )
    return {"correct": correct, "distractors": distractors}


def rw_task(question: dict[str, Any]) -> str:
    skill = clean(question.get("skill"))
    if skill == "Central Ideas and Details":
        return "summarize the main point while preserving the author's qualification or limit"
    if skill == "Command of Evidence: Textual" or skill == "Command of Evidence":
        return "select evidence that directly supports or weakens the claim in the prompt"
    if skill == "Inferences":
        return "draw the strongest supported inference without adding an unsupported causal leap"
    if skill == "Words in Context":
        return "match the word's connotation to the local context"
    if skill == "Text Structure and Purpose":
        return "identify the function of a sentence, paragraph, or rhetorical move"
    if skill == "Cross-Text Connections":
        return "state the precise relationship between the two texts"
    if skill == "Rhetorical Synthesis":
        return "combine only the notes needed to achieve the stated goal"
    if skill == "Transitions":
        return "mark the logical relationship between the surrounding sentences"
    if skill == "Boundaries":
        return "choose punctuation that fits the clause structure"
    if skill == "Form, Structure, and Sense":
        return "complete the sentence with the required grammatical form"
    return "answer the exact reading or writing task in the prompt"


def rw_explanation(question: dict[str, Any]) -> dict[str, Any]:
    correct = get_correct(question)
    ans = answer_value(question)
    base = get_explanation_text(question)
    correct_text = (
        f"Choice {correct} is correct: {ans}. The task is to {rw_task(question)}. "
        f"The original rationale is: {base}. The credited choice stays within the evidence and fits the stated task more precisely than the alternatives."
    )
    distractors = {}
    for label, value in get_choices(question).items():
        if label == correct:
            continue
        distractors[label] = rw_distractor(question, label, value, ans)
    return {"correct": correct_text, "distractors": distractors}


def rw_distractor(question: dict[str, Any], label: str, value: Any, ans: str) -> str:
    skill = clean(question.get("skill"))
    value_text = clean(value)
    if skill == "Boundaries":
        return (
            f"Choice {label} ({value_text}) creates a punctuation relationship that does not match the clause structure; "
            f"the sentence grammar requires the pattern used in {ans}."
        )
    if skill == "Form, Structure, and Sense":
        return (
            f"Choice {label} ({value_text}) supplies the wrong grammatical form or leaves the sentence's core structure incomplete."
        )
    if skill == "Transitions":
        return (
            f"Choice {label} ({value_text}) signals the wrong logical relationship for the two surrounding ideas."
        )
    if skill == "Rhetorical Synthesis":
        return (
            f"Choice {label} includes an incomplete or misweighted use of the notes and does not satisfy the stated rhetorical goal."
        )
    if skill == "Text Structure and Purpose":
        return (
            f"Choice {label} describes a surface topic or unsupported effect rather than the function of the rhetorical move."
        )
    if skill == "Words in Context":
        return (
            f"Choice {label} ({value_text}) has the wrong tone or degree for the contextual clues in the sentence."
        )
    if skill == "Cross-Text Connections":
        return (
            f"Choice {label} misses the exact relationship between the two texts or attributes one text's claim to both."
        )
    return (
        f"Choice {label} is too broad, too narrow, or only topically related; it does not answer the prompt as directly as the credited choice."
    )


def set_explanation(question: dict[str, Any], explanation: dict[str, Any]) -> None:
    question["explanation"] = explanation
    n = nested(question)
    if n:
        n["explanation"] = explanation
    question["questionType"] = question.get("questionType") or "multiple_choice"
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["opensatP0ExplanationUpgradeVersion"] = VERSION
    question["expertRepairNotes"] = notes


def upgrade(question: dict[str, Any]) -> None:
    explanation = math_explanation(question) if question.get("section") == "Math" else rw_explanation(question)
    set_explanation(question, explanation)


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
        upgrade(question)
        audit_row = reviewed_issue_row(normalized_for_audit(question, index), {})
        warnings = [w for w in audit_row.get("warnings", []) if not w.startswith("duplicate_prompt_with:")]
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
