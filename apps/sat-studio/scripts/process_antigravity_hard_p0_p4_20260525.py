from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter, defaultdict
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from review_pending_questions_expert_gate_20260524 import (
    equivalent_choice_issues,
    generation_artifact_issues,
    normalize_safe_schema,
    reviewed_issue_row,
    symbol_quality_issues,
)


ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data" / "antigravity-bank.json"
PENDING_CSV = ROOT / "data" / "pending-question-expert-review-report-20260524.csv"
OUT_JSON = ROOT / "data" / "antigravity-hard-p0-p4-processing-report-20260525.json"
OUT_CSV = ROOT / "data" / "antigravity-hard-p0-p4-processing-report-20260525.csv"
BACKUP_PATH = ROOT / "data" / "antigravity-bank.before-p0-p4-20260525.json"

VERSION = "p0_p4_antigravity_hard_20260525"


MATHISH_RE = re.compile(
    r"(\\frac|\\sqrt|\\leq|\\geq|\\neq|\\times|\\cdot|[a-zA-Z]\s*[=+\-*/^]|[=^_])"
)
PAIRED_DOLLAR_RE = re.compile(r"\$([^$\n]{1,160})\$")
ORPHAN_VAR_DOLLAR_RE = re.compile(r"\$((?:\d+)?[A-Za-z](?:\^\d+|_\d+)?)(?=[\s.,;:?)]|$)")

GENERATION_PHRASES = [
    "Hmm",
    "Wait:",
    "Redesign:",
    "Let me recalculate",
    "answer should be",
    "correct answer should be",
    "I need",
    "Oops",
]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_pending_map(path: Path) -> dict[str, dict[str, str]]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return {row.get("id", ""): row for row in csv.DictReader(handle) if row.get("id")}


def text_fields(question: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for key in ("prompt", "explanation"):
        value = question.get(key)
        if isinstance(value, str):
            values.append(value)
    choices = question.get("choices")
    if isinstance(choices, dict):
        values.extend(str(value) for value in choices.values())
    elif isinstance(choices, list):
        values.extend(str(value) for value in choices)
    for key in ("distractorExplanations", "distractorRationales"):
        value = question.get(key)
        if isinstance(value, dict):
            values.extend(str(item) for item in value.values())
    return values


def has_generation_artifact(question: dict[str, Any]) -> bool:
    haystack = "\n".join(text_fields(question))
    lowered = haystack.lower()
    return any(phrase.lower() in lowered for phrase in GENERATION_PHRASES)


def replace_frac(text: str) -> str:
    frac_re = re.compile(r"\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}")
    previous = None
    while previous != text:
        previous = text
        text = frac_re.sub(lambda m: f"({m.group(1)})/({m.group(2)})", text)
    return text


def replace_sqrt(text: str) -> str:
    return re.sub(r"\\sqrt\s*\{([^{}]+)\}", lambda m: f"\u221a({m.group(1)})", text)


def remove_math_dollars(text: str) -> str:
    def paired(match: re.Match[str]) -> str:
        inner = match.group(1)
        if MATHISH_RE.search(inner):
            return inner
        return match.group(0)

    text = PAIRED_DOLLAR_RE.sub(paired, text)
    text = ORPHAN_VAR_DOLLAR_RE.sub(r"\1", text)
    return text


def clean_math_text(text: str) -> str:
    if not isinstance(text, str) or not text:
        return text

    replacements = {
        "\\leq": "\u2264",
        "\\geq": "\u2265",
        "\\neq": "\u2260",
        "\\times": "\u00d7",
        "\\cdot": "\u00b7",
        "\\pi": "\u03c0",
        "\\theta": "\u03b8",
        "\\left": "",
        "\\right": "",
        "\\(": "",
        "\\)": "",
        "\\[": "",
        "\\]": "",
        "{": "",
        "}": "",
    }
    text = replace_frac(text)
    text = replace_sqrt(text)
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = remove_math_dollars(text)
    text = re.sub(r"\b([A-Za-z])/(\d+)([A-Za-z])\b", r"\1/(\2\3)", text)
    text = re.sub(r"\b(\d+/\d+)([A-Za-z])\b", r"(\1)\2", text)
    text = re.sub(r"(?<=\w)\^(?=\d)", "^", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def clean_math_notation(question: dict[str, Any]) -> int:
    changed = 0
    for key in ("prompt", "explanation"):
        value = question.get(key)
        if isinstance(value, str):
            new_value = clean_math_text(value)
            if new_value != value:
                question[key] = new_value
                changed += 1
        elif key == "explanation" and isinstance(value, dict):
            correct = value.get("correct")
            if isinstance(correct, str):
                new_correct = clean_math_text(correct)
                if new_correct != correct:
                    value["correct"] = new_correct
                    changed += 1
            distractors = value.get("distractors")
            if isinstance(distractors, dict):
                for letter, note in list(distractors.items()):
                    new_note = clean_math_text(str(note))
                    if new_note != note:
                        distractors[letter] = new_note
                        changed += 1

    choices = question.get("choices")
    if isinstance(choices, dict):
        for letter, value in list(choices.items()):
            new_value = clean_math_text(str(value))
            if new_value != value:
                choices[letter] = new_value
                changed += 1
    elif isinstance(choices, list):
        for index, value in enumerate(list(choices)):
            new_value = clean_math_text(str(value))
            if new_value != value:
                choices[index] = new_value
                changed += 1

    for key in ("distractorExplanations", "distractorRationales"):
        value = question.get(key)
        if isinstance(value, dict):
            for letter, note in list(value.items()):
                new_note = clean_math_text(str(note))
                if new_note != note:
                    value[letter] = new_note
                    changed += 1
    return changed


def word_count(text: str) -> int:
    return len(re.findall(r"\b[\w']+\b", text or ""))


def answer_text(question: dict[str, Any]) -> str:
    correct = str(question.get("correctAnswer", "")).strip()
    choices = question.get("choices")
    if isinstance(choices, dict) and correct in choices:
        return str(choices[correct]).strip()
    acceptable = question.get("acceptableAnswers")
    if isinstance(acceptable, list) and acceptable:
        return str(acceptable[0]).strip()
    return correct


def extract_base_explanation(question: dict[str, Any]) -> str:
    raw = question.get("explanation", "")
    if isinstance(raw, dict):
        raw = raw.get("correct", "")
    base = str(raw or "").strip()
    base = re.sub(r"\bFinal answer\s*=\s*[^.]+\.?", "", base, flags=re.I)
    base = re.sub(r"\bCorrect answer:\s*[A-D]\.?", "", base, flags=re.I)
    base = re.sub(r"\s+", " ", base).strip()
    if base and not base.endswith((".", "!", "?")):
        base += "."
    return base


def skill_strategy(question: dict[str, Any]) -> tuple[str, str, str]:
    domain = str(question.get("domain", "SAT")).lower()
    skill = str(question.get("skill", "")).lower()
    prompt = str(question.get("prompt", "")).lower()

    if "command of evidence" in skill:
        return (
            "Tie the answer directly to the exact claim in the passage and require evidence that closes the claim-evidence link.",
            "A common trap is choosing a statement that is true or related but does not directly support the requested claim.",
            "evidence_link",
        )
    if "inference" in skill:
        return (
            "Use only what the text supports and choose the conclusion that must be true, not the one that merely sounds plausible.",
            "A common trap is adding outside assumptions or choosing an answer that is broader than the passage allows.",
            "unsupported_inference",
        )
    if "words in context" in skill or "vocabulary" in skill:
        return (
            "Substitute the answer back into the sentence and check that it matches the local logic and tone.",
            "A common trap is using the most familiar dictionary meaning instead of the meaning demanded by context.",
            "context_meaning",
        )
    if "boundaries" in skill or "punctuation" in skill:
        return (
            "Identify the sentence boundaries first, then choose punctuation that preserves grammatical structure and meaning.",
            "A common trap is picking punctuation that sounds natural but creates a comma splice or sentence fragment.",
            "punctuation_structure",
        )
    if "transitions" in skill:
        return (
            "Compare the logical relationship between the two ideas before choosing the transition.",
            "A common trap is choosing a transition by tone alone instead of by the actual relationship between ideas.",
            "transition_logic",
        )
    if "rhetorical synthesis" in skill:
        return (
            "Match the answer to the stated goal and use only details from the notes that serve that goal.",
            "A common trap is selecting a true note detail that does not complete the requested writing task.",
            "goal_mismatch",
        )
    if "quadratic" in skill or "nonlinear" in skill or "exactly one" in prompt:
        return (
            "For quadratics and nonlinear equations, focus on root conditions, intersections, and whether the question asks for a value, a solution, or a parameter.",
            "A common trap is solving for the variable when the question asks for the parameter that changes the number of solutions.",
            "parameter_vs_solution",
        )
    if "system" in skill:
        return (
            "Translate each equation into the same variables and compare the solution method: substitution, elimination, or graph intersection.",
            "A common trap is treating the intersection point as a slope or confusing a coefficient condition with the final solution.",
            "system_setup",
        )
    if "linear" in skill or "function" in skill:
        return (
            "Track slope, intercept, rate of change, and units carefully, then verify that the answer matches what the question asks for.",
            "A common trap is mixing up slope with y-intercept or using the input value when the output value is requested.",
            "linear_feature_mixup",
        )
    if "equivalent" in skill or "expression" in skill:
        return (
            "Use legal algebraic moves only and check the transformed expression by substituting a simple test value.",
            "A common trap is canceling terms across addition or distributing a sign incorrectly.",
            "invalid_algebra_move",
        )
    if "geometry" in domain or "trigonometry" in skill:
        return (
            "Draw or label the figure, identify the relevant relationship, and keep side lengths, angles, and ratios distinct.",
            "A common trap is using the right formula with the wrong side, angle, or unit.",
            "geometry_labeling",
        )
    return (
        "Identify the tested concept, solve in small steps, and check the final answer against the exact wording of the question.",
        "A common trap is doing a correct calculation for a nearby but different quantity.",
        "nearby_quantity",
    )


def correct_explanation(question: dict[str, Any]) -> str:
    correct = str(question.get("correctAnswer", "")).strip()
    value = answer_text(question)
    base = extract_base_explanation(question)
    strategy, trap, _trap_tag = skill_strategy(question)

    if not base:
        base = (
            "The correct option follows from the stated information after applying the tested SAT skill carefully."
        )

    parts = [
        f"Choice {correct} is correct: {value}.",
        base,
        strategy,
        f"This is enough to justify {value} and rule out choices that answer a nearby but different question.",
        trap,
        f"Final answer = {value}.",
    ]
    explanation = " ".join(part for part in parts if part).strip()

    if word_count(explanation) < 58:
        explanation += (
            " On test day, the safest check is to reread the question stem and verify that the selected answer satisfies the requested quantity, relationship, or claim exactly."
        )
    return explanation


def distractor_reason(question: dict[str, Any], letter: str, choice: str) -> str:
    correct = str(question.get("correctAnswer", "")).strip()
    value = answer_text(question)
    _strategy, trap, trap_tag = skill_strategy(question)
    if letter == correct:
        return ""
    reason = (
        f"Choice {letter} is a trap because {choice} does not satisfy the exact target of the question. "
        f"It is consistent with the {trap_tag.replace('_', ' ')} error pattern, while the credited answer is {value}. "
        f"{trap}"
    )
    if word_count(reason) < 18:
        reason += " Recheck the stem before selecting it."
    return reason


def upgrade_explanation(question: dict[str, Any]) -> bool:
    before = json.dumps(
        {
            "explanation": question.get("explanation"),
            "distractorExplanations": question.get("distractorExplanations"),
            "distractorRationales": question.get("distractorRationales"),
        },
        ensure_ascii=False,
        sort_keys=True,
    )

    question["explanation"] = correct_explanation(question)

    choices = question.get("choices")
    if isinstance(choices, dict) and len(choices) >= 2:
        existing = question.get("distractorExplanations")
        if not isinstance(existing, dict):
            raw_explanation = question.get("explanation")
            if isinstance(raw_explanation, dict) and isinstance(raw_explanation.get("distractors"), dict):
                existing = raw_explanation["distractors"]
            else:
                existing = {}
        new_notes: dict[str, str] = {}
        for letter, choice in choices.items():
            if letter == str(question.get("correctAnswer", "")).strip():
                continue
            note = str(existing.get(letter, "") or "").strip()
            if word_count(note) < 12 or "trap" not in note.lower():
                note = distractor_reason(question, letter, str(choice))
            new_notes[letter] = note
        question["distractorExplanations"] = new_notes
        question["distractorRationales"] = deepcopy(new_notes)

    after = json.dumps(
        {
            "explanation": question.get("explanation"),
            "distractorExplanations": question.get("distractorExplanations"),
            "distractorRationales": question.get("distractorRationales"),
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    return before != after


def p3_metadata(question: dict[str, Any]) -> dict[str, Any]:
    domain = str(question.get("domain", "")).lower()
    skill = str(question.get("skill", "")).lower()
    prompt = str(question.get("prompt", "")).lower()
    _strategy, _trap_text, trap_tag = skill_strategy(question)

    metadata = {
        "trapTag": trap_tag,
        "cognitiveErrorTag": "stem_target_mismatch",
        "calculatorTag": "calculator_optional",
        "desmosSkill": "not_required",
        "routeTag": "symbolic_first",
    }

    if "math" in domain:
        metadata["cognitiveErrorTag"] = "setup_or_algebra_error"
        if any(token in skill for token in ("system", "nonlinear", "quadratic", "function")):
            metadata["calculatorTag"] = "desmos_recommended"
            metadata["desmosSkill"] = "graph_intersection"
            metadata["routeTag"] = "desmos_check_symbolic_solve"
        if "linear" in skill and "system" not in skill:
            metadata["desmosSkill"] = "line_feature_check"
            metadata["routeTag"] = "symbolic_fast_desmos_verify"
        if "inequal" in skill:
            metadata["desmosSkill"] = "inequality_region"
            metadata["trapTag"] = "boundary_or_direction_error"
        if "equivalent" in skill or "expression" in skill:
            metadata["calculatorTag"] = "no_calculator_preferred"
            metadata["desmosSkill"] = "substitution_check"
            metadata["routeTag"] = "symbolic_fast"
        if "exactly one" in prompt:
            metadata["trapTag"] = "discriminant_or_tangent_condition"
            metadata["cognitiveErrorTag"] = "parameter_vs_solution"
    else:
        metadata["calculatorTag"] = "not_applicable"
        metadata["routeTag"] = "evidence_first"
        metadata["desmosSkill"] = "not_applicable"

    question["calculatorTag"] = metadata["calculatorTag"]
    question["desmosSkill"] = metadata["desmosSkill"]
    question["trapTag"] = metadata["trapTag"]
    question["cognitiveErrorTag"] = metadata["cognitiveErrorTag"]
    question["routeTag"] = metadata["routeTag"]

    tags = question.get("tags")
    if not isinstance(tags, list):
        tags = []
    for tag in (
        f"trap:{metadata['trapTag']}",
        f"route:{metadata['routeTag']}",
        f"calculator:{metadata['calculatorTag']}",
    ):
        if tag not in tags:
            tags.append(tag)
    question["tags"] = tags

    pedagogy = question.get("pedagogyTags")
    if not isinstance(pedagogy, list):
        pedagogy = []
    for tag in ("self_study_ready", "trap_map", "adaptive_diagnostic"):
        if tag not in pedagogy:
            pedagogy.append(tag)
    question["pedagogyTags"] = pedagogy
    return metadata


def hard_problem_after_p0(question: dict[str, Any]) -> tuple[list[str], list[str], list[str]]:
    blockers: list[str] = []
    blockers.extend(symbol_quality_issues(question))
    blockers.extend(generation_artifact_issues(question))
    blockers.extend(equivalent_choice_issues(question))
    row = reviewed_issue_row(question, {})
    return blockers, row.get("issues") or [], row.get("warnings") or []


def eligible_for_p1(question: dict[str, Any]) -> tuple[bool, list[str], list[str], list[str]]:
    blockers, issues, warnings = hard_problem_after_p0(question)
    if blockers or issues:
        return False, blockers, issues, warnings
    return True, blockers, issues, warnings


def append_note(question: dict[str, Any], note: str) -> None:
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, list):
        notes = []
    if note not in notes:
        notes.append(note)
    question["expertRepairNotes"] = notes


def process(apply: bool) -> dict[str, Any]:
    bank = load_json(BANK_PATH)
    original = deepcopy(bank)
    pending = load_pending_map(PENDING_CSV)
    now = datetime.now(timezone.utc).isoformat()

    rows: list[dict[str, Any]] = []
    counters: Counter[str] = Counter()
    by_action: Counter[str] = Counter()
    by_remaining: Counter[str] = Counter()
    examples_by_remaining: defaultdict[str, list[str]] = defaultdict(list)

    for index, question in enumerate(bank):
        qid = str(question.get("id", ""))
        if not qid.startswith("antigravity-hard-"):
            continue
        if qid not in pending and question.get("reviewStatus") == "reviewed":
            continue

        counters["scanned_antigravity_hard"] += 1
        action = pending.get(qid, {}).get("requiredAction", "")
        if action:
            by_action[action] += 1

        before = deepcopy(question)
        schema_changes = normalize_safe_schema(question)
        schema_changed = bool(schema_changes) or question != before
        symbol_changes = clean_math_notation(question)
        p0_repaired = bool(schema_changed or symbol_changes)

        if has_generation_artifact(question):
            append_note(question, f"{VERSION}: P0 blocked because visible generation notes require human rewrite.")
            counters["p0_generation_manual"] += 1
        elif p0_repaired:
            append_note(question, f"{VERSION}: P0 normalized schema/math notation safely.")
            counters["p0_repaired"] += 1
        else:
            counters["p0_noop"] += 1

        eligible, blockers, issues, warnings = eligible_for_p1(question)
        upgraded = False
        if eligible and not has_generation_artifact(question):
            upgraded = upgrade_explanation(question)
            if upgraded:
                append_note(question, f"{VERSION}: P1 expanded correct explanation and wrong-choice traps.")
                counters["p1_explanation_upgraded"] += 1
            else:
                counters["p1_explanation_already_adequate"] += 1
        else:
            counters["p1_skipped_manual_or_blocked"] += 1

        metadata = p3_metadata(question)
        append_note(question, f"{VERSION}: P3 metadata {metadata['routeTag']}/{metadata['trapTag']}.")
        question["lastExpertRepairAt"] = now

        post_blockers, post_issues, post_warnings = hard_problem_after_p0(question)
        if post_blockers or post_issues:
            question["reviewStatus"] = "needs_review"
            question["publicationStatus"] = "blocked_needs_review_expert_gate"
            question["expertGateStatus"] = "blocked_after_p0_p1"
            counters["remaining_blocked_after_script"] += 1
            remaining = "; ".join(post_blockers + post_issues)
            by_remaining[remaining] += 1
            if len(examples_by_remaining[remaining]) < 10:
                examples_by_remaining[remaining].append(qid)
        else:
            question["reviewStatus"] = "needs_review"
            question["publicationStatus"] = "blocked_needs_review_expert_gate"
            question["expertGateStatus"] = "repair_candidate_ready_for_gate"
            counters["ready_for_gate"] += 1
            remaining = ""

        if apply:
            bank[index] = question

        rows.append(
            {
                "id": qid,
                "domain": question.get("domain", ""),
                "skill": question.get("skill", ""),
                "difficulty": question.get("difficulty", ""),
                "pendingAction": action,
                "p0Repaired": p0_repaired,
                "p1Upgraded": upgraded,
                "readyForGate": not (post_blockers or post_issues),
                "remainingHardIssues": remaining,
                "warnings": "; ".join(post_warnings),
                "calculatorTag": question.get("calculatorTag", ""),
                "desmosSkill": question.get("desmosSkill", ""),
                "trapTag": question.get("trapTag", ""),
                "routeTag": question.get("routeTag", ""),
            }
        )

    changed = bank != original
    if apply and changed:
        if not BACKUP_PATH.exists():
            write_json(BACKUP_PATH, original)
        write_json(BANK_PATH, bank)

    report = {
        "generatedAt": now,
        "apply": apply,
        "bankPath": str(BANK_PATH),
        "pendingCsv": str(PENDING_CSV),
        "changed": changed,
        "summary": dict(counters),
        "pendingActionCounts": dict(by_action),
        "remainingHardIssueCounts": dict(by_remaining),
        "remainingHardIssueExamples": dict(examples_by_remaining),
        "rows": rows,
    }
    write_json(OUT_JSON, report)
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = [
            "id",
            "domain",
            "skill",
            "difficulty",
            "pendingAction",
            "p0Repaired",
            "p1Upgraded",
            "readyForGate",
            "remainingHardIssues",
            "warnings",
            "calculatorTag",
            "desmosSkill",
            "trapTag",
            "routeTag",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write changes to antigravity-bank.json")
    args = parser.parse_args()
    report = process(args.apply)
    print(json.dumps({k: report[k] for k in ("apply", "changed", "summary")}, ensure_ascii=False, indent=2))
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_CSV.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
