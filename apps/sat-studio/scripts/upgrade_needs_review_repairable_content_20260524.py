"""Upgrade repairable needs_review questions without approving them directly.

This pass targets only rows classified as repairable by
analyze_needs_review_source_repairability_20260524.py. It improves visible
math notation and explanation pedagogy, then leaves reviewStatus unchanged so
the strict expert gate can decide what is safe to promote.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from scripts import audit_antigravity_bank as row_audit
    from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
    from scripts.math_verifier import is_grid_in, parse_numeric_value
    from scripts.review_pending_questions_expert_gate_20260524 import (
        equivalent_choice_issues,
        normalize_safe_schema,
        symbol_quality_issues,
    )
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from math_verifier import is_grid_in, parse_numeric_value
    from review_pending_questions_expert_gate_20260524 import (
        equivalent_choice_issues,
        normalize_safe_schema,
        symbol_quality_issues,
    )


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
QUEUE_PATH = DATA_DIR / "needs-review-source-repairability-20260524.csv"
REPORT_PATH = DATA_DIR / "needs-review-content-upgrade-20260524.json"
VERSION = "needs-review-repairable-content-upgrade-2026-05-24"

TARGET_CATEGORIES = {
    "P1_explanation_and_trap_upgrade",
    "P1_symbol_cleanup_then_gate",
    "P1_symbol_cleanup_plus_explanation_upgrade",
    "P2_metadata_or_light_quality_review",
}

EXPLANATION_CATEGORIES = {
    "P1_explanation_and_trap_upgrade",
    "P1_symbol_cleanup_plus_explanation_upgrade",
}

SYMBOL_CATEGORIES = {
    "P1_symbol_cleanup_then_gate",
    "P1_symbol_cleanup_plus_explanation_upgrade",
}

LETTERS = ("A", "B", "C", "D")


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def load_payload(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
        return payload, payload["questions"]
    if isinstance(payload, list):
        return payload, payload
    return payload, []


def write_payload(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def nested_question(question: dict[str, Any]) -> dict[str, Any]:
    nested = question.get("question")
    return nested if isinstance(nested, dict) else {}


def get_choices(question: dict[str, Any]) -> dict[str, Any]:
    choices = question.get("choices")
    if isinstance(choices, dict) and choices:
        return choices
    nested = nested_question(question).get("choices")
    return nested if isinstance(nested, dict) else {}


def get_correct(question: dict[str, Any]) -> str:
    nested = nested_question(question)
    return str(question.get("correctAnswer") or nested.get("correct_answer") or nested.get("correctAnswer") or "").strip()


def answer_value(question: dict[str, Any]) -> str:
    choices = get_choices(question)
    correct = get_correct(question)
    if correct in choices:
        return clean(choices.get(correct))
    return correct


def explanation_text(explanation: Any) -> str:
    if isinstance(explanation, dict):
        parts = [str(explanation.get("correct") or "")]
        distractors = explanation.get("distractors")
        if isinstance(distractors, dict):
            parts.extend(str(value or "") for value in distractors.values())
        return clean(" ".join(parts))
    return clean(explanation)


def correct_explanation_text(question: dict[str, Any]) -> str:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        return clean(explanation.get("correct"))
    nested = nested_question(question).get("explanation")
    if isinstance(nested, dict):
        return clean(nested.get("correct"))
    return clean(explanation or nested)


def existing_distractors(question: dict[str, Any]) -> dict[str, str]:
    explanation = question.get("explanation")
    if not isinstance(explanation, dict):
        explanation = nested_question(question).get("explanation")
    distractors = explanation.get("distractors") if isinstance(explanation, dict) else {}
    if not isinstance(distractors, dict):
        return {}
    return {str(key): clean(value) for key, value in distractors.items()}


def needs_symbol_cleanup(text: str) -> bool:
    return bool(
        re.search(r"\\(?:frac|sqrt|left|right|times|cdot|leq|geq|neq|pi|theta)|\\[()]|(?<!\\)\$", text)
        or re.search(r"(?<=\d)\s+x\s+(?=\d)", text)
    )


def strip_math_dollars(text: str) -> str:
    def replace_pair(match: re.Match[str]) -> str:
        content = match.group(1).strip()
        mathish = bool(re.search(r"\\|=|\^|_|[A-Za-z]\(|\b(?:x|y|f|g|h|k|m|n|p|q|r|t)\b", content))
        return content if mathish else match.group(0)

    text = re.sub(r"(?<!\\)\$([^$\n]{1,180})(?<!\\)\$", replace_pair, text)
    text = re.sub(r"(?<!\\)\$(?=\s*[A-Za-z][A-Za-z0-9_]*\s*(?:=|\^|_|\())", "", text)
    return text


def safe_symbol_cleanup(text: Any) -> Any:
    if not isinstance(text, str) or not needs_symbol_cleanup(text):
        return text
    before = text
    replacements = {
        r"\left": "",
        r"\right": "",
        r"\leq": "≤",
        r"\geq": "≥",
        r"\neq": "≠",
        r"\times": "×",
        r"\cdot": "·",
        r"\pi": "π",
        r"\theta": "θ",
        r"\(": "",
        r"\)": "",
        r"\[": "",
        r"\]": "",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    text = re.sub(r"\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}", lambda m: f"({m.group(1).strip()})/({m.group(2).strip()})", text)
    text = re.sub(r"\\sqrt\s*\{([^{}]+)\}", lambda m: f"√({m.group(1).strip()})", text)
    text = re.sub(r"\^\s*\\circ\b", "°", text)
    text = re.sub(r"(?<=\d)\s+x\s+(?=\d)", " × ", text)
    text = strip_math_dollars(text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text if text != before else before


GENERIC_PRIOR_NOTE_PATTERNS = [
    "plausible computation trap",
    "does not match the final quantity requested",
    "creates a grammar, usage, or punctuation problem",
    "does not best preserve the logical flow",
    "misreads the word, phrase, structure, or rhetorical function",
    "adds, overstates, or misses information not supported",
]


def safe_prior_note(existing: str) -> str:
    text = clean(existing)
    if not text:
        return ""
    lower = text.lower()
    if any(pattern in lower for pattern in GENERIC_PRIOR_NOTE_PATTERNS):
        return ""
    return text


def cleanup_question_symbols(question: dict[str, Any]) -> list[str]:
    changes: list[str] = []

    def clean_field(container: dict[str, Any], key: str, label: str) -> None:
        if key not in container or not isinstance(container.get(key), str):
            return
        new_value = safe_symbol_cleanup(container[key])
        if new_value != container[key]:
            container[key] = new_value
            changes.append(label)

    for key in ("prompt", "correctAnswer"):
        clean_field(question, key, key)
    nested = nested_question(question)
    for key in ("paragraph", "question", "correct_answer", "correctAnswer"):
        clean_field(nested, key, f"question.{key}")

    for container_label, choices in (("choices", question.get("choices")), ("question.choices", nested.get("choices"))):
        if isinstance(choices, dict):
            for label in list(choices.keys()):
                if isinstance(choices.get(label), str):
                    new_value = safe_symbol_cleanup(choices[label])
                    if new_value != choices[label]:
                        choices[label] = new_value
                        changes.append(f"{container_label}.{label}")

    for container_label, explanation in (("explanation", question.get("explanation")), ("question.explanation", nested.get("explanation"))):
        if isinstance(explanation, dict):
            clean_field(explanation, "correct", f"{container_label}.correct")
            distractors = explanation.get("distractors")
            if isinstance(distractors, dict):
                for label in list(distractors.keys()):
                    if isinstance(distractors.get(label), str):
                        new_value = safe_symbol_cleanup(distractors[label])
                        if new_value != distractors[label]:
                            distractors[label] = new_value
                            changes.append(f"{container_label}.distractors.{label}")
        elif isinstance(explanation, str):
            new_value = safe_symbol_cleanup(explanation)
            if new_value != explanation:
                if container_label == "explanation":
                    question["explanation"] = new_value
                else:
                    nested["explanation"] = new_value
                changes.append(container_label)

    return changes


def relation_for_transition(value: Any) -> str:
    text = clean(value).lower()
    if any(word in text for word in ["however", "nevertheless", "nonetheless", "still", "yet", "though"]):
        return "contrast or qualification"
    if any(word in text for word in ["therefore", "thus", "consequently", "as a result", "accordingly"]):
        return "result"
    if any(word in text for word in ["moreover", "furthermore", "also", "in addition", "additionally"]):
        return "addition"
    if any(word in text for word in ["similarly", "likewise"]):
        return "similarity"
    if any(word in text for word in ["for example", "for instance"]):
        return "example"
    if "instead" in text or "rather" in text:
        return "alternative or replacement"
    return "the logical relationship required by the surrounding ideas"


def boundary_rule(value: str) -> str:
    if ";" in value:
        return "A semicolon correctly links two complete independent clauses without making a comma splice."
    if ":" in value:
        return "A colon is appropriate only after a complete setup when the following words explain, identify, or list what was introduced."
    if "--" in value or "—" in value:
        return "The dash marks an interruption or explanation while preserving the grammar of the main sentence."
    if "," in value:
        return "The comma marks a lighter boundary, such as an introductory or nonessential element, without incorrectly splitting the core clause."
    return "No added punctuation is needed because the surrounding words already form a grammatical sentence."


def math_strategy(question: dict[str, Any]) -> str:
    skill = clean(question.get("skill")).lower()
    domain = clean(question.get("domain")).lower()
    if "system" in skill:
        return "Use both equations and substitute back if needed; a value from only one equation is usually a trap."
    if "linear function" in skill or "slope" in skill:
        return "Keep slope, intercept, input, and output in separate roles before choosing the final value."
    if "linear equation" in skill:
        return "Isolate the requested variable or expression and check that the final value answers the prompt, not just an intermediate line."
    if "inequal" in skill:
        return "Track the boundary and the direction of the inequality; test an endpoint or sample value before committing."
    if "equivalent" in skill:
        return "Expand, factor, and combine like terms in a controlled order; cancellation is valid only for common factors."
    if "nonlinear" in skill or "quadratic" in skill or "advanced" in domain:
        return "Respect the nonlinear structure: roots, factors, exponents, and domain restrictions must be handled before choosing the answer."
    if "percent" in skill or "ratio" in skill or "rate" in skill or "unit" in skill:
        return "Name the base quantity and unit first so the calculation answers the exact comparison or amount requested."
    if "data" in skill or "statistics" in skill or "probability" in skill or "data" in domain:
        return "Use the specific statistic, denominator, or data relationship named in the question, not a nearby number from the table."
    if "triangle" in skill or "trigonometry" in skill:
        return "Match the side or angle to the correct theorem or trig ratio before calculating."
    if "circle" in skill:
        return "Separate radius, diameter, circumference, arc, and area; SAT wrong answers often switch among these measures."
    if "area" in skill or "volume" in skill or "geometry" in domain:
        return "Choose the formula for the requested measure and keep every unit conversion attached to that measure."
    return "Separate setup, calculation, and final requested quantity so the answer is not an unfinished step."


def rw_correct_explanation(question: dict[str, Any], base: str) -> str:
    correct = get_correct(question)
    ans = answer_value(question)
    skill = clean(question.get("skill"))
    opener = f"Choice {correct} is correct: {ans}."
    base_sentence = f" Existing reasoning: {base}" if base else ""
    if skill == "Boundaries":
        teaching = f"This is a punctuation-boundary item. {boundary_rule(ans)}"
    elif skill == "Form, Structure, and Sense":
        teaching = "The surrounding words determine the required grammatical form, so the credited choice must fit number, tense, modifier logic, and sentence structure."
    elif skill == "Transitions":
        teaching = f"The transition must signal {relation_for_transition(ans)}; SAT transition items reward the relationship between ideas, not the most academic-sounding connector."
    elif skill == "Rhetorical Synthesis":
        teaching = "The stated goal controls which notes matter; the credited choice selects the relevant details and shapes them into the requested rhetorical purpose."
    elif "Command of Evidence" in skill:
        teaching = "The credited choice gives direct support for the exact claim in the question; a related detail is insufficient unless it proves that claim."
    elif skill == "Cross-Text Connections":
        teaching = "The answer must preserve what each text says and describe the relationship between the two positions without flattening them into one broad topic."
    elif skill == "Words in Context":
        teaching = "The local context fixes the word's tone and degree; the credited word fits those clues more precisely than a near-synonym."
    elif skill == "Text Structure and Purpose":
        teaching = "The task is to identify the function of a part of the text, not merely to summarize the subject matter."
    elif skill == "Inferences":
        teaching = "The inference must stay inside the evidence and avoid adding a stronger causal or factual claim than the passage supports."
    elif skill == "Central Ideas and Details":
        teaching = "The best answer is broad enough to cover the relevant text but specific enough to keep the passage's emphasis and limitation."
    else:
        teaching = "The credited choice matches the exact reading, writing, or grammar task set by the prompt."
    return clean(f"{opener} {teaching}{base_sentence}")


def math_correct_explanation(question: dict[str, Any], base: str) -> str:
    correct = get_correct(question)
    ans = answer_value(question)
    opener = f"Choice {correct} is correct: {ans}." if correct in LETTERS else f"Correct answer: {ans}."
    final = ""
    if parse_numeric_value(ans) is not None or re.search(r"\d|π|pi", ans, re.I):
        final = f" Final answer = {ans}."
    base_sentence = f" Existing reasoning: {base}" if base else ""
    return clean(
        f"{opener} {base_sentence} The core SAT move is this: {math_strategy(question)} "
        f"After computing, compare the result to the wording of the question so the selected value is the final requested quantity.{final}"
    )


def rw_distractor_explanation(question: dict[str, Any], label: str, value: Any, existing: str) -> str:
    skill = clean(question.get("skill"))
    value_text = clean(value)
    ans = answer_value(question)
    prefix = f"Choice {label} ({value_text}) is a trap because"
    if skill == "Boundaries":
        reason = f"its punctuation creates the wrong clause boundary. The credited answer, {ans}, fits how the sentence parts connect."
    elif skill == "Form, Structure, and Sense":
        reason = "the form does not agree with the surrounding grammar, even if the phrase sounds possible in isolation."
    elif skill == "Transitions":
        reason = f"it signals {relation_for_transition(value_text)}, while the sentence needs the relationship signaled by {ans}."
    elif skill == "Rhetorical Synthesis":
        reason = "it uses the notes in a way that misses the stated goal, leaves out a necessary detail, or changes the requested focus."
    elif "Command of Evidence" in skill:
        reason = "it is related to the topic but does not directly prove the claim or comparison the question asks about."
    elif skill == "Cross-Text Connections":
        reason = "it blurs which author holds which view or overstates agreement/disagreement between the two texts."
    elif skill == "Words in Context":
        reason = f"its tone, intensity, or meaning does not fit the clues around the blank as closely as {ans}."
    elif skill == "Text Structure and Purpose":
        reason = "it names a nearby topic but not the rhetorical job performed by the referenced sentence or phrase."
    elif skill == "Inferences":
        reason = "it requires an assumption beyond the evidence rather than a conclusion that follows from the text."
    elif skill == "Central Ideas and Details":
        reason = "it is too narrow, too broad, or shifted away from the passage's main emphasis."
    else:
        reason = "it answers a nearby but different task from the one actually asked."
    prior = safe_prior_note(existing)
    suffix = f" Prior note: {prior}" if prior else ""
    return clean(f"{prefix} {reason}{suffix}")


def math_distractor_explanation(question: dict[str, Any], label: str, value: Any, existing: str) -> str:
    skill = clean(question.get("skill")).lower()
    value_text = clean(value)
    ans = answer_value(question)
    prefix = f"Choice {label} ({value_text}) is a trap because"
    if "system" in skill:
        reason = "it can come from using only one equation, solving for the wrong variable, or failing to substitute back into the full system."
    elif "linear function" in skill or "slope" in skill:
        reason = "it mixes up a linear feature such as slope, intercept, input, or output."
    elif "linear equation" in skill:
        reason = "it reflects an unfinished isolation step or a value for a related expression rather than the requested one."
    elif "inequal" in skill:
        reason = "it mishandles the boundary, direction, or included endpoint of the inequality."
    elif "equivalent" in skill:
        reason = "it follows from an invalid distribution, factoring, or cancellation step."
    elif "nonlinear" in skill or "quadratic" in skill or "exponential" in skill:
        reason = "it treats a nonlinear expression as if ordinary linear rules apply, or it ignores a root/domain condition."
    elif "percent" in skill or "ratio" in skill or "rate" in skill or "unit" in skill:
        reason = "it uses a nearby quantity as the base or unit instead of the quantity requested."
    elif "data" in skill or "statistics" in skill or "probability" in skill:
        reason = "it uses the wrong denominator, count, statistic, or comparison from the data."
    elif "triangle" in skill or "trigonometry" in skill:
        reason = "it pairs the wrong side or angle with the theorem or trig ratio."
    elif "circle" in skill:
        reason = "it switches radius, diameter, circumference, arc length, or area."
    elif "area" in skill or "volume" in skill:
        reason = "it applies a related geometry formula but not the measure requested."
    else:
        reason = "it follows from a different setup or from stopping before the final requested value."
    prior = safe_prior_note(existing)
    suffix = f" The credited value is {ans}. Prior note: {prior}" if prior else f" The credited value is {ans}."
    return clean(f"{prefix} {reason}{suffix}")


def upgraded_explanation(question: dict[str, Any]) -> dict[str, Any]:
    base = correct_explanation_text(question)
    correct = get_correct(question)
    choices = get_choices(question)
    if question.get("section") == "Math":
        correct_text = math_correct_explanation(question, base)
    else:
        correct_text = rw_correct_explanation(question, base)

    distractors: dict[str, str] = {}
    existing = existing_distractors(question)
    if isinstance(choices, dict) and set(choices.keys()) == set(LETTERS) and correct in choices:
        for label in LETTERS:
            if label == correct:
                continue
            if question.get("section") == "Math":
                distractors[label] = math_distractor_explanation(question, label, choices.get(label), existing.get(label, ""))
            else:
                distractors[label] = rw_distractor_explanation(question, label, choices.get(label), existing.get(label, ""))
    return {"correct": correct_text, "distractors": distractors}


def set_explanation(question: dict[str, Any], explanation: dict[str, Any]) -> None:
    question["explanation"] = explanation
    nested = nested_question(question)
    if nested:
        nested["explanation"] = explanation


def target_rows(limit: int | None = None) -> dict[str, dict[int, dict[str, str]]]:
    targets: dict[str, dict[int, dict[str, str]]] = defaultdict(dict)
    with QUEUE_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("repairCategory") not in TARGET_CATEGORIES:
                continue
            try:
                index = int(row.get("sourceIndex") or -1)
            except ValueError:
                continue
            if index < 0:
                continue
            targets[row["sourceFile"]][index] = row
            if limit and sum(len(value) for value in targets.values()) >= limit:
                break
    return targets


def normalized_for_audit(question: dict[str, Any], filename: str, index: int) -> dict[str, Any]:
    normalized = row_audit.normalize_question(question, filename, index) or dict(question)
    if not normalized.get("_sourceFile"):
        normalized["_sourceFile"] = filename
    if "_sourceIndex" not in normalized:
        normalized["_sourceIndex"] = index
    return normalized


def evaluate(question: dict[str, Any], filename: str, index: int) -> dict[str, Any]:
    normalized = normalized_for_audit(question, filename, index)
    row = reviewed_issue_row(normalized, {})
    blockers = sorted(set(symbol_quality_issues(normalized) + equivalent_choice_issues(normalized)))
    return {
        "blockers": blockers,
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
        "depthFlags": row.get("depthFlags") or [],
        "wouldPassGate": not blockers and not row.get("issues") and not row.get("warnings") and not row.get("depthFlags"),
        "metrics": {
            "promptWords": row.get("promptWords"),
            "explanationWords": row.get("explanationWords"),
            "correctExplanationWords": row.get("correctExplanationWords"),
            "distractorExplanationCount": row.get("distractorExplanationCount"),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()

    ARTIFACTS_DIR.mkdir(exist_ok=True)
    targets = target_rows(args.limit)
    report: dict[str, Any] = {
        "version": VERSION,
        "checkedAt": now_iso(),
        "apply": args.apply,
        "targetCategories": sorted(TARGET_CATEGORIES),
        "summary": Counter(),
        "byFile": {},
        "byCategory": Counter(),
        "afterFailureCounts": Counter(),
        "backups": [],
        "samplesReadyForGate": [],
        "samplesStillBlocked": [],
    }

    for filename, file_targets in targets.items():
        path = DATA_DIR / filename
        payload, questions = load_payload(path)
        file_counter = Counter()
        changed = False
        for index, queue_row in sorted(file_targets.items()):
            if index >= len(questions) or not isinstance(questions[index], dict):
                continue
            question = questions[index]
            if question.get("reviewStatus") != "needs_review":
                file_counter["skipped_not_needs_review"] += 1
                continue
            before = json.dumps(question, ensure_ascii=False, sort_keys=True)
            category = queue_row.get("repairCategory")
            repair_notes = question.get("expertRepairNotes") if isinstance(question.get("expertRepairNotes"), dict) else {}

            schema_changes = normalize_safe_schema(question)
            symbol_changes: list[str] = []
            explanation_changed = False
            if category in SYMBOL_CATEGORIES:
                symbol_changes = cleanup_question_symbols(question)
            if category in EXPLANATION_CATEGORIES:
                set_explanation(question, upgraded_explanation(question))
                explanation_changed = True

            repair_notes[VERSION] = {
                "category": category,
                "sourceQueue": "needs-review-source-repairability-20260524.csv",
                "updatedAt": report["checkedAt"],
                "schemaChanges": schema_changes,
                "symbolFieldsChanged": symbol_changes,
                "explanationChanged": explanation_changed,
            }
            question["expertRepairNotes"] = repair_notes

            after_eval = evaluate(question, filename, index)
            for key in after_eval["blockers"] + after_eval["issues"] + after_eval["warnings"] + after_eval["depthFlags"]:
                report["afterFailureCounts"][key] += 1
            if after_eval["wouldPassGate"]:
                file_counter["ready_for_gate"] += 1
                if len(report["samplesReadyForGate"]) < 80:
                    report["samplesReadyForGate"].append(
                        {"id": question.get("id"), "sourceFile": filename, "sourceIndex": index, "category": category}
                    )
            else:
                file_counter["still_blocked"] += 1
                if len(report["samplesStillBlocked"]) < 120:
                    report["samplesStillBlocked"].append(
                        {
                            "id": question.get("id"),
                            "sourceFile": filename,
                            "sourceIndex": index,
                            "category": category,
                            "blockers": after_eval["blockers"],
                            "issues": after_eval["issues"],
                            "warnings": after_eval["warnings"],
                            "depthFlags": after_eval["depthFlags"],
                        }
                    )

            after = json.dumps(question, ensure_ascii=False, sort_keys=True)
            if after != before:
                changed = True
                file_counter["changed"] += 1
            file_counter["attempted"] += 1
            report["byCategory"][category] += 1

        if changed and args.apply:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            backup = ARTIFACTS_DIR / f"{path.stem}-before-needs-review-content-upgrade-{timestamp}.json"
            shutil.copy2(path, backup)
            report["backups"].append(str(backup))
            write_payload(path, payload)
        report["byFile"][filename] = dict(file_counter)
        report["summary"].update(file_counter)

    report["summary"] = dict(report["summary"])
    report["byCategory"] = dict(report["byCategory"].most_common())
    report["afterFailureCounts"] = dict(report["afterFailureCounts"].most_common(80))
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "apply": args.apply,
                "summary": report["summary"],
                "byCategory": report["byCategory"],
                "afterFailureCountsTop": dict(list(report["afterFailureCounts"].items())[:20]),
                "report": str(REPORT_PATH.relative_to(ROOT)),
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
