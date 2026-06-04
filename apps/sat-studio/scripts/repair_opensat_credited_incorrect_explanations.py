import argparse
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
    from scripts.check_questions import normalize_raw_question
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.tag_trap_types import tag_question
    from scripts.triage_opensat_rw_p1_explanations import infer_family
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from check_questions import normalize_raw_question
    from review_unified_needs_review_bank import load_payload, write_payload
    from tag_trap_types import tag_question
    from triage_opensat_rw_p1_explanations import infer_family


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OPENSAT_PATH = DATA_DIR / "opensat-pinesat.json"
REPORT_PATH = DATA_DIR / "opensat-credited-incorrect-explanation-repair-report.json"
VERSION = "opensat-credited-incorrect-explanation-repair-2026-05-20"
BAD_PHRASE = "credited answer is incorrect"


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def short(value: Any, limit: int = 220) -> str:
    text = clean(value)
    return text if len(text) <= limit else text[: limit - 3].rstrip() + "..."


def has_bad_phrase(question: dict[str, Any]) -> bool:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        texts = [explanation.get("correct")]
        distractors = explanation.get("distractors")
        if isinstance(distractors, dict):
            texts.extend(distractors.values())
    else:
        texts = [explanation]
    return BAD_PHRASE in " ".join(str(text or "").lower() for text in texts)


def revised_explanation(question: dict[str, Any]) -> dict[str, Any]:
    choices = question.get("choices") if isinstance(question.get("choices"), dict) else {}
    correct = str(question.get("correctAnswer") or "")
    correct_text = clean(choices.get(correct))
    inferred_domain, inferred_skill = infer_family(question)
    prompt_clue = short(question.get("prompt"))
    task = f"{inferred_domain} / {inferred_skill}"

    correct_exp = (
        f"Choice {correct} is correct: {correct_text}. The item is testing {task}, so the answer must satisfy the exact wording of the prompt and the local context. "
        f"The controlling clue is: {prompt_clue} The credited choice keeps that meaning, relationship, or sentence structure intact while avoiding the errors introduced by the other choices. "
        f"This is the option a student should keep after checking both the task and the answer text."
    )
    distractors: dict[str, str] = {}
    for key in ["A", "B", "C", "D"]:
        if key == correct or key not in choices:
            continue
        distractors[key] = (
            f"Choice {key} is not correct: {clean(choices.get(key))}. It is related to the same topic or sentence, but it fails the specific {inferred_skill} task being tested. "
            f"Compared with choice {correct}, it changes the intended meaning, weakens the relationship between ideas, or creates an unsuitable sentence form for this context."
        )
    return {"correct": correct_exp, "distractors": distractors}


def set_explanation(raw: dict[str, Any], explanation: dict[str, Any]) -> None:
    raw["explanation"] = explanation
    nested = raw.get("question")
    if isinstance(nested, dict):
        nested["explanation"] = explanation
    raw["explanationUpgradeVersion"] = VERSION
    raw["explanationUpgradeDate"] = str(date.today())


def validate_reviewed(raw: dict[str, Any], index: int) -> dict[str, Any]:
    row = normalize_raw_question(raw, OPENSAT_PATH.name, index)
    audit = reviewed_issue_row(row, {})
    warnings = [warning for warning in audit.get("warnings", []) if not str(warning).startswith("duplicate_prompt_with:")]
    return {
        "issues": audit.get("issues") or [],
        "warnings": warnings,
        "depthFlags": audit.get("depthFlags") or [],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(OPENSAT_PATH)
    if not isinstance(questions, list):
        raise SystemExit("OpenSAT payload is not a list")

    targets: list[dict[str, Any]] = []
    blocked: list[dict[str, Any]] = []
    for index, raw in enumerate(questions):
        if not isinstance(raw, dict):
            continue
        question = normalize_raw_question(raw, OPENSAT_PATH.name, index)
        if not has_bad_phrase(question):
            continue
        choices = question.get("choices") if isinstance(question.get("choices"), dict) else {}
        correct = question.get("correctAnswer")
        status = str(question.get("reviewStatus") or "").lower()
        row = {
            "sourceIndex": index,
            "id": question.get("id"),
            "reviewStatus": question.get("reviewStatus"),
            "section": question.get("section"),
            "domain": question.get("domain"),
            "skill": question.get("skill"),
            "difficulty": question.get("difficulty"),
            "correctAnswer": correct,
            "correctText": short(choices.get(correct), 160),
        }
        if not choices or set(choices.keys()) != {"A", "B", "C", "D"} or correct not in choices:
            row["action"] = "held_structure_issue"
            blocked.append({**row, "reason": "invalid_choices_or_correct_answer"})
            targets.append(row)
            continue

        new_exp = revised_explanation(question)
        if args.apply:
            set_explanation(raw, new_exp)
            normalized = normalize_raw_question(raw, OPENSAT_PATH.name, index)
            traps = tag_question(normalized)
            if traps:
                raw["trapTypes"] = traps
                raw["trapTypesVersion"] = "trap-types-v1-2026-05-20"
            if status == "reviewed":
                validation = validate_reviewed(raw, index)
                if validation["issues"] or validation["warnings"] or validation["depthFlags"]:
                    blocked.append({**row, "reason": "post_repair_validation_failed", **validation})
                    continue
        row["action"] = "rewritten" if args.apply else "would_rewrite"
        targets.append(row)

    if args.apply and any(item.get("reason") == "post_repair_validation_failed" for item in blocked):
        raise SystemExit(json.dumps({"blocked": blocked[:20], "blockedCount": len(blocked)}, indent=2, ensure_ascii=False))
    if args.apply:
        write_payload(OPENSAT_PATH, payload)

    summary = {
        "version": VERSION,
        "apply": args.apply,
        "targetCount": len(targets),
        "blockedCount": len(blocked),
        "byReviewStatus": dict(Counter(str(row.get("reviewStatus") or "missing") for row in targets)),
        "byAction": dict(Counter(row.get("action") for row in targets)),
        "blocked": blocked,
    }
    REPORT_PATH.write_text(json.dumps({"summary": summary, "items": targets}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
