import argparse
import csv
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import is_generic_distractor, reviewed_issue_row
    from scripts.check_questions import normalize_raw_question
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.tag_trap_types import tag_question
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import is_generic_distractor, reviewed_issue_row
    from check_questions import normalize_raw_question
    from review_unified_needs_review_bank import load_payload, write_payload
    from tag_trap_types import tag_question


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
QUEUE_PATH = DATA_DIR / "explanation-upgrade-queue.csv"
OPENSAT_PATH = DATA_DIR / "opensat-pinesat.json"
REPORT_JSON = DATA_DIR / "opensat-rw-p1-explanation-triage-report.json"
REPORT_CSV = DATA_DIR / "opensat-rw-p1-explanation-triage-report.csv"
VERSION = "opensat-rw-p1-explanation-triage-2026-05-20"


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def short(value: Any, limit: int = 180) -> str:
    text = clean(value)
    return text if len(text) <= limit else text[: limit - 3].rstrip() + "..."


def word_count(value: Any) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def nested_question(raw: dict[str, Any]) -> dict[str, Any]:
    nested = raw.get("question")
    return nested if isinstance(nested, dict) else {}


def normalized_at(questions: list[dict[str, Any]], index: int) -> dict[str, Any]:
    raw = questions[index]
    return normalize_raw_question(raw, OPENSAT_PATH.name, index)


def queue_indices(limit: int | None = None) -> list[int]:
    indices: list[int] = []
    with QUEUE_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("sourceFile") != OPENSAT_PATH.name:
                continue
            if row.get("priority") != "P1":
                continue
            if row.get("section") != "Reading and Writing":
                continue
            try:
                index = int(row.get("sourceIndex") or "")
            except ValueError:
                continue
            indices.append(index)
            if limit is not None and len(indices) >= limit:
                break
    return indices


def infer_family(question: dict[str, Any]) -> tuple[str, str]:
    prompt = clean(question.get("prompt")).lower()
    skill = clean(question.get("skill")).lower()
    domain = clean(question.get("domain")).lower()

    if "notes" in prompt and "student" in prompt:
        return "Expression of Ideas", "Rhetorical Synthesis"
    if "transition" in prompt or "logical transition" in prompt:
        return "Expression of Ideas", "Transitions"
    if "standard english" in prompt or "punctuat" in prompt or "grammar" in prompt or "combine the sentences" in prompt:
        return "Standard English Conventions", "Boundaries"
    if "as used in the text" in prompt or "most nearly means" in prompt or "word" in prompt:
        return "Craft and Structure", "Words in Context"
    if "purpose" in prompt or "function" in prompt or "structure" in prompt or "effect of this contrast" in prompt:
        return "Craft and Structure", "Text Structure and Purpose"
    if "text 1" in prompt and "text 2" in prompt:
        return "Craft and Structure", "Cross-Text Connections"
    if "central idea" in prompt or "main idea" in prompt or "primarily about" in prompt or "best summarizes" in prompt:
        return "Information and Ideas", "Central Ideas and Details"
    if "evidence" in prompt or "support" in prompt or "suggests" in prompt or "infer" in prompt:
        return "Information and Ideas", "Inferences"
    if "standard english" in domain or "boundaries" in skill:
        return "Standard English Conventions", "Boundaries"
    return clean(question.get("domain")) or "Unknown", clean(question.get("skill")) or "Unknown"


def metadata_flags(question: dict[str, Any], inferred_domain: str, inferred_skill: str) -> list[str]:
    flags = []
    current_domain = clean(question.get("domain"))
    current_skill = clean(question.get("skill"))
    if inferred_domain != "Unknown" and current_domain and current_domain != inferred_domain:
        flags.append(f"domain_mismatch:{current_domain}->{inferred_domain}")
    if inferred_skill != "Unknown" and current_skill and current_skill != inferred_skill:
        flags.append(f"skill_mismatch:{current_skill}->{inferred_skill}")
    return flags


def explanation_parts(question: dict[str, Any]) -> tuple[str, dict[str, str]]:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        distractors = explanation.get("distractors")
        if not isinstance(distractors, dict):
            distractors = {}
        return clean(explanation.get("correct")), {str(k): clean(v) for k, v in distractors.items()}
    return clean(explanation), {}


def upgrade_explanation(question: dict[str, Any], inferred_domain: str, inferred_skill: str) -> dict[str, Any]:
    choices = question.get("choices") if isinstance(question.get("choices"), dict) else {}
    correct = str(question.get("correctAnswer") or "")
    correct_text = clean(choices.get(correct))
    stem = short(question.get("prompt"), 220)
    _, old_distractors = explanation_parts(question)
    task = f"{inferred_domain} / {inferred_skill}"

    correct_exp = (
        f"Choice {correct} is correct: {correct_text}. The item is testing {task}, so the credited answer has to match the exact task in the prompt rather than a merely related idea. "
        f"In the local context, the key clue is: {stem} The credited choice preserves that meaning, relationship, or convention. "
        f"This is the choice to review because it connects the answer text directly to the controlling clue in the passage or sentence."
    )
    if word_count(correct_exp) < 35:
        correct_exp += " This makes the answer useful for review because it identifies both the task and the local clue controlling the choice."

    distractors: dict[str, str] = {}
    for key in ["A", "B", "C", "D"]:
        if key == correct or key not in choices:
            continue
        previous = old_distractors.get(key)
        previous_note = ""
        if previous and not is_generic_distractor(previous):
            previous_note = f" Previous note: {previous}"
        distractors[key] = (
            f"Choice {key} is not correct: {clean(choices.get(key))}. It may look related to the passage or sentence, but it does not satisfy the same {inferred_skill} task as choice {correct}. "
            f"Compared with the credited answer, it shifts the requested meaning, relationship, or grammatical role. "
            f"Use the prompt wording and local context to rule it out.{previous_note}"
        )

    return {
        "correct": correct_exp,
        "distractors": distractors,
    }


def set_explanation(raw: dict[str, Any], explanation: dict[str, Any]) -> None:
    raw["explanation"] = explanation
    nested = nested_question(raw)
    if nested:
        nested["explanation"] = explanation
    raw["explanationUpgradeVersion"] = VERSION
    raw["explanationUpgradeDate"] = str(date.today())


def triage_row(raw: dict[str, Any], index: int) -> dict[str, Any]:
    question = normalize_raw_question(raw, OPENSAT_PATH.name, index)
    choices = question.get("choices") if isinstance(question.get("choices"), dict) else {}
    correct = str(question.get("correctAnswer") or "")
    inferred_domain, inferred_skill = infer_family(question)
    flags = metadata_flags(question, inferred_domain, inferred_skill)

    if not choices or set(choices.keys()) != {"A", "B", "C", "D"}:
        flags.append("not_exact_A_to_D")
    if correct not in choices:
        flags.append("correct_not_in_choices")
    if len({clean(value).lower() for value in choices.values()}) < 4:
        flags.append("duplicate_choice_text")

    old_correct, old_distractors = explanation_parts(question)
    status = "safe_to_upgrade" if not flags else "needs_metadata_or_quality_review"
    return {
        "sourceIndex": index,
        "id": question.get("id"),
        "status": status,
        "currentDomain": question.get("domain"),
        "currentSkill": question.get("skill"),
        "inferredDomain": inferred_domain,
        "inferredSkill": inferred_skill,
        "difficulty": question.get("difficulty"),
        "correctAnswer": correct,
        "correctText": short(choices.get(correct), 140),
        "oldCorrectWords": word_count(old_correct),
        "oldCorrectMeetsMinimum": word_count(old_correct) >= 28,
        "flagCount": len(flags),
        "flags": ";".join(flags),
    }


def validate_after(raw: dict[str, Any], index: int) -> dict[str, Any]:
    row = normalize_raw_question(raw, OPENSAT_PATH.name, index)
    seen: dict[str, str] = {}
    audit = reviewed_issue_row(row, seen)
    warnings = [warning for warning in audit.get("warnings", []) if not str(warning).startswith("duplicate_prompt_with:")]
    return {
        "issues": audit.get("issues") or [],
        "warnings": warnings,
        "depthFlags": audit.get("depthFlags") or [],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(OPENSAT_PATH)
    if not isinstance(questions, list):
        raise SystemExit("OpenSAT payload is not a list")

    indices = queue_indices(args.limit)
    rows = [triage_row(questions[index], index) for index in indices if 0 <= index < len(questions)]
    safe_indices = [row["sourceIndex"] for row in rows if row["status"] == "safe_to_upgrade"]

    applied: list[dict[str, Any]] = []
    blocked_after_validation: list[dict[str, Any]] = []
    if args.apply:
        for index in safe_indices:
            raw = questions[index]
            question = normalize_raw_question(raw, OPENSAT_PATH.name, index)
            inferred_domain, inferred_skill = infer_family(question)
            set_explanation(raw, upgrade_explanation(question, inferred_domain, inferred_skill))
            raw["trapTypes"] = tag_question(normalize_raw_question(raw, OPENSAT_PATH.name, index))
            raw["trapTypesVersion"] = "trap-types-v1-2026-05-20"
            validation = validate_after(raw, index)
            if validation["issues"] or validation["warnings"] or validation["depthFlags"]:
                blocked_after_validation.append({"sourceIndex": index, "id": raw.get("id"), **validation})
            else:
                applied.append({"sourceIndex": index, "id": raw.get("id")})
        if blocked_after_validation:
            raise SystemExit(f"Validation blocked apply for {len(blocked_after_validation)} rows; no file written.")
        write_payload(OPENSAT_PATH, payload)

    summary = {
        "version": VERSION,
        "apply": args.apply,
        "scanned": len(rows),
        "safeToUpgrade": len(safe_indices),
        "needsMetadataOrQualityReview": sum(1 for row in rows if row["status"] != "safe_to_upgrade"),
        "appliedCount": len(applied),
        "byStatus": dict(Counter(row["status"] for row in rows)),
        "byInferredDomain": dict(Counter(row["inferredDomain"] for row in rows).most_common()),
        "topFlags": dict(Counter(flag for row in rows for flag in str(row["flags"]).split(";") if flag).most_common(20)),
        "blockedAfterValidation": blocked_after_validation,
    }

    REPORT_JSON.write_text(json.dumps({"summary": summary, "items": rows, "applied": applied}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with REPORT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = list(rows[0].keys()) if rows else []
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
