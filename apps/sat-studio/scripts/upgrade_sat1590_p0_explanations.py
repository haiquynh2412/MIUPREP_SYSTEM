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
SOURCE_FILE = "sat-1590-elite-ai-bank.json"
DATA_PATH = DATA_DIR / SOURCE_FILE
QUEUE_PATH = DATA_DIR / "explanation-upgrade-queue.csv"
REPORT_PATH = DATA_DIR / "sat1590-p0-explanation-upgrade-report.json"
VERSION = "sat1590-p0-explanation-upgrade-2026-05-20"


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def words(value: Any) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def explanation_text(question: dict[str, Any]) -> str:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        return clean(explanation.get("correct"))
    return clean(explanation)


def answer_value(question: dict[str, Any]) -> str:
    choices = question.get("choices")
    correct = question.get("correctAnswer")
    if isinstance(choices, dict) and correct in choices:
        return clean(choices[correct])
    return clean(correct)


def is_mc(question: dict[str, Any]) -> bool:
    choices = question.get("choices")
    return isinstance(choices, dict) and set(choices.keys()) == {"A", "B", "C", "D"}


def queue_ids() -> set[str]:
    ids = set()
    with QUEUE_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("priority") == "P0" and row.get("sourceFile") == SOURCE_FILE:
                ids.add(str(row.get("id")))
    return ids


def normalize_math_base(text: str) -> str:
    text = clean(text)
    text = text.replace("Ã—", "x")
    text = text.replace("â†’", "->")
    text = re.sub(r"Final answer\s*=\s*[^.]+\.?", "", text, flags=re.I)
    return clean(text)


def math_strategy(skill: str) -> str:
    lower = skill.lower()
    if "linear equations in one" in lower:
        return "Set up the one-variable equation, isolate the variable with inverse operations, and check that the resulting value answers the quantity named in the prompt."
    if "linear equations in two" in lower or "linear functions" in lower or "slope" in lower:
        return "Track slope, intercept, and substitution separately; high-score mistakes usually come from answering the intermediate rate or intercept instead of the requested value."
    if "systems" in lower:
        return "Use the relationship between the equations before doing computation: compare coefficients for special systems or solve the system only after deciding what quantity is requested."
    if "inequal" in lower:
        return "Solve the boundary carefully, preserve strict versus inclusive endpoints, and convert the algebraic interval into the form the question asks for."
    if "quadratic" in lower or "nonlinear" in lower:
        return "Use the structure of the nonlinear expression first, then verify that the computed value is the requested root, output, discriminant condition, or parameter."
    if "exponential" in lower:
        return "Rewrite both sides with common bases or isolate the growth factor before comparing exponents; do not treat exponential change as linear change."
    if "equivalent" in lower:
        return "Factor or expand in a controlled order and cancel only common factors; the trap is usually canceling terms or mishandling a sign."
    if "statistics" in lower or "data" in lower:
        return "Identify the statistic being requested before calculating; do not substitute a related measure such as total, mean, range, or percentage."
    if "circle" in lower or "triangle" in lower or "geometry" in lower or "trigonometry" in lower:
        return "Map the geometric relationship first, then apply the appropriate formula or ratio; avoid using a visually tempting but unsupported length or angle."
    return "Work from the defining relationship in the prompt and keep the requested final quantity separate from intermediate calculations."


def upgrade_math(question: dict[str, Any]) -> dict[str, Any]:
    base = normalize_math_base(explanation_text(question))
    ans = answer_value(question)
    skill = clean(question.get("skill"))
    correct_parts = [
        base,
        math_strategy(skill),
        f"The credited value is {ans}.",
        f"Final answer = {ans}.",
    ]
    correct = " ".join(part for part in correct_parts if part)

    if is_mc(question):
        distractors = {}
        choices = question["choices"]
        correct_label = question.get("correctAnswer")
        for label, value in choices.items():
            if label == correct_label:
                continue
            distractors[label] = (
                f"Choice {label} ({clean(value)}) reflects a wrong setup, a sign slip, or an intermediate result; "
                f"it fails the calculation path that produces {ans}."
            )
    else:
        distractors = {
            "common_error_1": (
                "A likely miss is to stop at the first computed intermediate value instead of carrying the algebra to the exact requested quantity."
            ),
            "common_error_2": (
                "Another likely miss is to use the right operation with the wrong base, sign, endpoint, or substituted value from the prompt."
            ),
        }
    return {"correct": correct, "distractors": distractors}


def rw_task_sentence(question: dict[str, Any]) -> str:
    skill = clean(question.get("skill"))
    if skill == "Central Ideas and Details":
        return "The task is to state the central claim while preserving the qualifying language in the text."
    if skill == "Command of Evidence":
        return "The task is to choose evidence that bears directly on the claim, not evidence that is merely topical."
    if skill == "Inferences":
        return "The task is to draw the strongest supported inference without adding a causal claim the text does not prove."
    if skill == "Words in Context":
        return "The task is to choose the word whose connotation matches the sentence's contrast, cause-effect logic, or evaluative tone."
    if skill == "Text Structure and Purpose":
        return "The task is to identify what the structure does for the argument, not simply what topic the sentence mentions."
    if skill == "Cross-Text Connections":
        return "The task is to capture the precise relationship between the two texts: agreement, challenge, qualification, or reframing."
    if skill == "Rhetorical Synthesis":
        return "The task is to synthesize only the notes relevant to the stated goal and present them with the requested emphasis."
    if skill == "Transitions":
        return "The task is to name the logical relationship between the surrounding sentences."
    if skill == "Boundaries":
        return "The task is to use punctuation that matches the grammar of the clauses and phrases on both sides of the blank."
    if "Form" in skill:
        return "The task is to choose the form that completes the sentence's core grammar without creating a fragment or agreement error."
    return "The task is to answer the exact reading or writing function required by the prompt."


def upgrade_rw(question: dict[str, Any]) -> dict[str, Any]:
    correct_label = question.get("correctAnswer")
    correct_value = answer_value(question)
    base = clean(explanation_text(question))
    task = rw_task_sentence(question)
    correct = (
        f"Choice {correct_label} is correct: {correct_value}. {task} "
        f"The original rationale is: {base}. This answer preserves the required meaning and avoids adding a stronger claim than the prompt supports."
    )
    distractors = {}
    choices = question.get("choices") if isinstance(question.get("choices"), dict) else {}
    for label, value in choices.items():
        if label == correct_label:
            continue
        distractors[label] = rw_distractor(question, label, value, correct_value)
    return {"correct": correct, "distractors": distractors}


def rw_distractor(question: dict[str, Any], label: str, value: Any, correct_value: str) -> str:
    skill = clean(question.get("skill"))
    value_text = clean(value)
    if skill == "Boundaries":
        return (
            f"Choice {label} ({value_text}) uses punctuation that creates a splice, fragment, mismatched pause, or illogical break; "
            f"it does not fit the sentence grammar that makes {correct_value} work."
        )
    if "Form" in skill:
        return (
            f"Choice {label} ({value_text}) leaves the sentence with the wrong verb form, modifier attachment, or agreement pattern; "
            f"the sentence needs the grammatical role supplied by {correct_value}."
        )
    if skill == "Transitions":
        return (
            f"Choice {label} ({value_text}) signals a different relationship from the one between the sentences; "
            f"the context requires the logical turn expressed by {correct_value}."
        )
    if skill == "Words in Context":
        return (
            f"Choice {label} ({value_text}) has a connotation or degree that clashes with the sentence's clues; "
            f"the surrounding context points to {correct_value} instead."
        )
    if skill == "Rhetorical Synthesis":
        return (
            f"Choice {label} includes too little of the relevant note set, emphasizes the wrong detail, or misses the stated rhetorical goal."
        )
    if skill == "Cross-Text Connections":
        return (
            f"Choice {label} blurs the relationship between the texts or treats one text's claim as if both texts made it."
        )
    if skill == "Text Structure and Purpose":
        return (
            f"Choice {label} describes a surface topic or an unsupported effect, not the function the structure performs in the argument."
        )
    if skill in {"Command of Evidence", "Inferences", "Central Ideas and Details"}:
        return (
            f"Choice {label} is related to the topic but is too broad, too narrow, or not directly supported by the information in the prompt."
        )
    return f"Choice {label} does not satisfy the exact task as precisely as {correct_value}."


def upgrade(question: dict[str, Any]) -> None:
    if not question.get("questionType"):
        question["questionType"] = "multiple_choice" if is_mc(question) else "student_produced_response"
    question["explanation"] = upgrade_math(question) if question.get("section") == "Math" else upgrade_rw(question)
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["sat1590P0ExplanationUpgradeVersion"] = VERSION
    question["expertRepairNotes"] = notes


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    target_ids = queue_ids()
    payload, questions = load_payload(DATA_PATH)
    report: dict[str, Any] = {
        "apply": args.apply,
        "version": VERSION,
        "targetCount": len(target_ids),
        "upgraded": [],
        "blocked": [],
        "remainingDepthFlags": [],
    }

    for index, question in enumerate(questions):
        if not isinstance(question, dict) or question.get("id") not in target_ids:
            continue
        upgrade(question)
        row = reviewed_issue_row({**question, "_sourceFile": SOURCE_FILE, "_sourceIndex": index}, {})
        flags = pedagogical_depth_flags(question)
        if row.get("issues") or [w for w in row.get("warnings", []) if not w.startswith("duplicate_prompt_with:")]:
            report["blocked"].append(
                {"id": question.get("id"), "sourceIndex": index, "issues": row.get("issues"), "warnings": row.get("warnings")}
            )
        if flags:
            report["remainingDepthFlags"].append({"id": question.get("id"), "sourceIndex": index, "depthFlags": flags})
        report["upgraded"].append({"id": question.get("id"), "sourceIndex": index})

    if args.apply:
        write_payload(DATA_PATH, payload)
    report["upgradedCount"] = len(report["upgraded"])
    report["blockedCount"] = len(report["blocked"])
    report["remainingDepthFlagCount"] = len(report["remainingDepthFlags"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in {"upgraded", "blocked", "remainingDepthFlags"}}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
