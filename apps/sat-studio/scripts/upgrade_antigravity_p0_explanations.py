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
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row
    from math_verifier import parse_numeric_value
    from review_unified_needs_review_bank import load_payload, write_payload


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SOURCE_FILE = "antigravity-bank.json"
DATA_PATH = DATA_DIR / SOURCE_FILE
QUEUE_PATH = DATA_DIR / "explanation-upgrade-queue.csv"
REPORT_PATH = DATA_DIR / "antigravity-p0-explanation-upgrade-report.json"
VERSION = "antigravity-p0-explanation-upgrade-2026-05-20"


def clean(value: Any) -> str:
    text = str(value or "").strip()
    replacements = {
        "Ã¢â€ â€™": "->",
        "Ã¢â‚¬â€": "--",
        "Ã¢Å“â€œ": "check",
        "Ã¢Å“â€”": "not valid",
        "Ãƒâ€”": "x",
        "ą": "+/-",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return re.sub(r"\s+", " ", text).strip()


def text_from_explanation(explanation: Any) -> str:
    if isinstance(explanation, dict):
        return clean(explanation.get("correct"))
    return clean(explanation)


def get_choices(question: dict[str, Any]) -> dict[str, Any]:
    choices = question.get("choices")
    return choices if isinstance(choices, dict) else {}


def get_correct(question: dict[str, Any]) -> str:
    return str(question.get("correctAnswer") or "")


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
    return row


def ensure_question_type(question: dict[str, Any]) -> None:
    if question.get("questionType"):
        return
    question["questionType"] = "multiple_choice" if get_choices(question) else "student_produced_response"


def relation_for_transition(value: Any) -> str:
    text = clean(value).lower()
    if any(word in text for word in ["however", "nevertheless", "nonetheless", "still", "yet"]):
        return "contrast"
    if any(word in text for word in ["therefore", "thus", "consequently", "as a result"]):
        return "result"
    if any(word in text for word in ["moreover", "furthermore", "also", "in addition"]):
        return "addition"
    if any(word in text for word in ["similarly", "likewise"]):
        return "similarity"
    if any(word in text for word in ["for example", "for instance"]):
        return "example"
    if "instead" in text or "rather" in text:
        return "replacement or alternative"
    return "a logical relationship that is not the one required"


def boundary_rule(value: str) -> str:
    if ";" in value:
        return "A semicolon is used when the material on both sides can stand as complete sentences; it avoids a comma splice while keeping the ideas closely linked."
    if ":" in value:
        return "A colon is used after a complete setup when the following words explain, identify, or list what the setup has announced."
    if "--" in value or "-" in value:
        return "The dash closes or sets off an interrupting description, so the main sentence can continue grammatically after the interruption."
    if "," in value:
        return "The comma marks a smaller boundary, such as an introductory or nonessential element, without creating a stronger break than the sentence needs."
    return "No additional punctuation is needed because the sentence parts already connect grammatically."


def rw_correct_explanation(question: dict[str, Any]) -> str:
    correct = get_correct(question)
    ans = answer_value(question)
    skill = clean(question.get("skill"))
    base = text_from_explanation(question.get("explanation"))
    opener = f"Choice {correct} is correct: {ans}."

    if skill == "Boundaries":
        return (
            f"{opener} This is a punctuation-boundary question, so the controlling issue is the structure around the blank. "
            f"{boundary_rule(ans)} The credited punctuation fits the sentence's clause relationship; choosing a mark only because it looks emphatic would change the grammar."
        )
    if skill == "Form, Structure, and Sense":
        return (
            f"{opener} The sentence requires the grammatical form supplied by the credited choice, not just a word with the right basic meaning. "
            f"The surrounding words determine tense, number, verb mood, or modifier form. The original cue was {base.lower()}, and the credited form completes that structure cleanly."
        )
    if skill == "Transitions":
        relation = relation_for_transition(ans)
        return (
            f"{opener} The transition must signal {relation} between the surrounding ideas. "
            f"On SAT transition items, the best answer is the word that names the actual logical move, not a transition that merely sounds academic. "
            f"Here the credited choice preserves that relationship across the sentence boundary."
        )
    if skill == "Rhetorical Synthesis":
        return (
            f"{opener} The goal statement controls which notes matter. "
            f"The credited response selects the relevant details, combines them into one purposeful sentence, and matches the requested rhetorical aim. "
            f"It is stronger than an answer that merely repeats one note or gives a vague summary."
        )
    if skill in {"Command of Evidence", "Command of Evidence: Textual", "Command of Evidence: Quantitative"}:
        return (
            f"{opener} The credited choice provides the evidence that most directly bears on the claim in the prompt. "
            f"It uses the relevant textual detail, data point, or comparison to support the exact conclusion being tested. "
            f"A topically related statement is not enough unless it proves the specific claim."
        )
    if skill == "Cross-Text Connections":
        return (
            f"{opener} The task is to state the precise relationship between the two texts. "
            f"The credited choice keeps both authors' positions separate and captures how one text would qualify, challenge, or extend the other. "
            f"It avoids flattening the pair into a broad shared topic."
        )
    if skill == "Words in Context":
        return (
            f"{opener} The word must match the local context, including tone, contrast, and degree. "
            f"The credited choice fits the way the surrounding sentence uses the word, while the other options are either too strong, too weak, or pointed in the wrong direction."
        )
    if skill == "Text Structure and Purpose":
        return (
            f"{opener} The question asks what the highlighted part does in the argument or explanation. "
            f"The credited choice identifies that function rather than summarizing the topic. "
            f"The original cue was {base.lower()}, and the correct answer names the role that cue plays."
        )
    if skill == "Inferences":
        return (
            f"{opener} The credited inference follows from what the passage actually states and does not add an unsupported causal claim. "
            f"It stays within the evidence, using the strongest conclusion the text permits rather than the most dramatic possible conclusion."
        )
    if skill == "Central Ideas and Details":
        return (
            f"{opener} The credited choice preserves the main idea and the key limitation or emphasis in the passage. "
            f"It is broad enough to cover the whole relevant text but specific enough not to drift into a claim the passage never makes."
        )
    return (
        f"{opener} The credited answer satisfies the exact task in the prompt. "
        f"The original rationale was {base.lower()}, and the expanded reasoning is that this choice matches the evidence, grammar, or rhetorical goal more precisely than the alternatives."
    )


def rw_distractor_text(question: dict[str, Any], label: str, value: Any) -> str:
    skill = clean(question.get("skill"))
    value_text = clean(value)
    ans = answer_value(question)

    if skill == "Boundaries":
        return (
            f"Choice {label} ({value_text}) uses a punctuation pattern that does not fit the sentence boundary. "
            f"Compared with {ans}, it either separates material too strongly, too weakly, or in a way the clause structure does not license."
        )
    if skill == "Form, Structure, and Sense":
        return (
            f"Choice {label} ({value_text}) has the wrong grammatical form for the surrounding structure. "
            f"It may be a real word or phrase, but it breaks the required tense, number, mood, or modifier relationship."
        )
    if skill == "Transitions":
        return (
            f"Choice {label} ({value_text}) signals {relation_for_transition(value_text)}, while the sentence requires the relationship expressed by {ans}."
        )
    if skill == "Rhetorical Synthesis":
        return (
            f"Choice {label} is underbuilt for the stated goal: it uses too little of the notes, gives background instead of the requested claim, or leaves out the point the sentence is supposed to make."
        )
    if skill in {"Command of Evidence", "Command of Evidence: Textual", "Command of Evidence: Quantitative"}:
        return (
            f"Choice {label} may echo the topic, but it does not provide the direct support, data comparison, or textual proof needed for the claim in the prompt."
        )
    if skill == "Cross-Text Connections":
        return (
            f"Choice {label} misstates the relationship between the texts by overstating agreement, inventing a disagreement, or focusing on only one author's position."
        )
    if skill == "Words in Context":
        return (
            f"Choice {label} ({value_text}) misses the word's local force; its tone or degree does not fit the clues around the blank as closely as {ans}."
        )
    if skill == "Text Structure and Purpose":
        return (
            f"Choice {label} describes a surface topic or a different rhetorical move rather than the function of the referenced part of the text."
        )
    if skill == "Inferences":
        return (
            f"Choice {label} goes beyond the evidence or draws attention to a detail that does not support the required inference."
        )
    if skill == "Central Ideas and Details":
        return (
            f"Choice {label} is either too narrow, too broad, or shifted away from the passage's central claim."
        )
    return f"Choice {label} is less precise than the credited answer for the task being tested."


def rw_explanation(question: dict[str, Any]) -> dict[str, Any]:
    correct = get_correct(question)
    distractors = {}
    for label, value in get_choices(question).items():
        if label != correct:
            distractors[label] = rw_distractor_text(question, label, value)
    return {"correct": rw_correct_explanation(question), "distractors": distractors}


def math_strategy(question: dict[str, Any]) -> str:
    skill = clean(question.get("skill")).lower()
    if "nonlinear" in skill:
        return "Use exponent rules, root conditions, or function notation directly; do not treat a nonlinear relationship as a constant linear change."
    if "linear function" in skill or "linear equations" in skill:
        return "Keep slope, intercept, and function value separate, then verify that the chosen expression satisfies the given condition."
    if "system" in skill:
        return "Use both equations together; solving only one relationship can produce a tempting value that does not satisfy the full system."
    if "inequal" in skill:
        return "Track the inequality sign and the boundary value, especially when the question asks for an integer endpoint."
    if "equivalent" in skill:
        return "Factor, expand, or combine like terms in a controlled order; cancellation is valid only across common factors."
    if "exponential" in skill:
        return "Use exponent rules or the growth factor directly; do not treat exponential change as a linear increase."
    if "percent" in skill or "ratio" in skill or "rate" in skill:
        return "Identify the base quantity and unit before calculating so the result answers the requested comparison."
    if "statistics" in skill or "data" in skill or "probability" in skill:
        return "Use the statistic or probability model named in the prompt, not a nearby count or percentage from the same context."
    if "triangle" in skill or "trigonometry" in skill:
        return "Set up the correct geometric ratio or theorem from the given measurements before choosing a length or angle."
    if "circle" in skill or "area" in skill or "volume" in skill:
        return "Identify the requested measure and formula first; many wrong answers use a related radius, diameter, area, or volume instead."
    return "Separate intermediate work from the requested final quantity, then check the credited value against the prompt."


def math_distractor_text(question: dict[str, Any], label: str, value: Any) -> str:
    skill = clean(question.get("skill")).lower()
    value_text = clean(value)
    ans = answer_value(question)
    if "linear function" in skill or "linear equations" in skill:
        return f"Choice {label} ({value_text}) confuses one of the linear features, such as slope, intercept, input, or output; it does not satisfy the condition that leads to {ans}."
    if "system" in skill:
        return f"Choice {label} ({value_text}) can result from using only part of the system or substituting back into the wrong variable; the full system leads to {ans}."
    if "inequal" in skill:
        return f"Choice {label} ({value_text}) mishandles the inequality boundary or direction; checking the boundary condition rules it out."
    if "equivalent" in skill:
        return f"Choice {label} ({value_text}) reflects an invalid expansion, distribution, or cancellation step; the equivalent form required by the prompt gives {ans}."
    if "exponential" in skill:
        return f"Choice {label} ({value_text}) uses the exponent or growth factor incorrectly; applying the exponent rules cleanly gives {ans}."
    if "percent" in skill or "ratio" in skill or "rate" in skill:
        return f"Choice {label} ({value_text}) uses the right quantities in the wrong relationship or base; the requested comparison gives {ans}."
    if "statistics" in skill or "data" in skill or "probability" in skill:
        return f"Choice {label} ({value_text}) reads the data or probability model incorrectly; it is not the statistic requested by the question."
    if "triangle" in skill or "trigonometry" in skill:
        return f"Choice {label} ({value_text}) comes from a mismatched side, angle, or theorem; the correct setup leads to {ans}."
    if "circle" in skill or "area" in skill or "volume" in skill:
        return f"Choice {label} ({value_text}) uses a related measure but not the one asked for; the requested measure is {ans}."
    return f"Choice {label} ({value_text}) follows from a different setup or an unfinished step; checking against the prompt points back to {ans}."


def should_add_final_equals(answer: str) -> bool:
    return parse_numeric_value(answer) is not None


def math_correct_explanation(question: dict[str, Any]) -> str:
    correct = get_correct(question)
    ans = answer_value(question)
    base = text_from_explanation(question.get("explanation"))
    text = (
        f"Choice {correct} is correct: {ans}. {base} "
        f"The SAT skill is to finish the requested calculation, not just recognize a related intermediate value. "
        f"{math_strategy(question)} "
        f"As a trap check, name what each number represents before writing the final value."
    )
    if should_add_final_equals(ans) and "Final answer" not in text:
        text = f"{text} Final answer = {ans}."
    return clean(text)


def math_explanation(question: dict[str, Any]) -> dict[str, Any]:
    correct = get_correct(question)
    distractors = {}
    for label, value in get_choices(question).items():
        if label != correct:
            distractors[label] = math_distractor_text(question, label, value)
    return {"correct": math_correct_explanation(question), "distractors": distractors}


def set_explanation(question: dict[str, Any]) -> None:
    ensure_question_type(question)
    question["explanation"] = math_explanation(question) if question.get("section") == "Math" else rw_explanation(question)
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["antigravityP0ExplanationUpgradeVersion"] = VERSION
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
