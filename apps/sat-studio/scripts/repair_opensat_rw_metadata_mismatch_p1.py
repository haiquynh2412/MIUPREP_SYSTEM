import argparse
import csv
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
    from scripts.check_questions import normalize_raw_question
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.tag_trap_types import tag_question
    from scripts.triage_opensat_rw_p1_explanations import upgrade_explanation
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from check_questions import normalize_raw_question
    from review_unified_needs_review_bank import load_payload, write_payload
    from tag_trap_types import tag_question
    from triage_opensat_rw_p1_explanations import upgrade_explanation


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OPENSAT_PATH = DATA_DIR / "opensat-pinesat.json"
TRIAGE_CSV = DATA_DIR / "opensat-rw-p1-explanation-triage-report.csv"
REPORT_PATH = DATA_DIR / "opensat-rw-p1-metadata-repair-report.json"
VERSION = "opensat-rw-p1-metadata-repair-2026-05-20"


def clean(value: Any) -> str:
    return str(value or "").strip()


def triage_rows() -> list[dict[str, str]]:
    rows = []
    with TRIAGE_CSV.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("status") == "needs_metadata_or_quality_review":
                rows.append(row)
    return rows


def validate_reviewed(raw: dict[str, Any], index: int) -> dict[str, Any]:
    row = normalize_raw_question(raw, OPENSAT_PATH.name, index)
    audit = reviewed_issue_row(row, {})
    warnings = [warning for warning in audit.get("warnings", []) if not str(warning).startswith("duplicate_prompt_with:")]
    return {
        "issues": audit.get("issues") or [],
        "warnings": warnings,
        "depthFlags": audit.get("depthFlags") or [],
    }


def apply_metadata(raw: dict[str, Any], inferred_domain: str, inferred_skill: str) -> None:
    previous = {
        "domain": raw.get("domain"),
        "skill": raw.get("skill"),
        "canonicalSkill": raw.get("canonicalSkill"),
        "microSkill": raw.get("microSkill"),
    }
    raw["domain"] = inferred_domain
    raw["skill"] = inferred_skill
    raw["metadataRepair"] = {
        "version": VERSION,
        "date": str(date.today()),
        "previous": previous,
        "reason": "OpenSAT R&W P1 row had task-family mismatch; domain/skill aligned to prompt task before explanation upgrade.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(OPENSAT_PATH)
    if not isinstance(questions, list):
        raise SystemExit("OpenSAT payload is not a list")

    rows = triage_rows()
    repaired: list[dict[str, Any]] = []
    held: list[dict[str, Any]] = []
    for row in rows:
        index = int(row["sourceIndex"])
        raw = questions[index]
        question = normalize_raw_question(raw, OPENSAT_PATH.name, index)
        choices = question.get("choices") if isinstance(question.get("choices"), dict) else {}
        correct = question.get("correctAnswer")
        inferred_domain = clean(row.get("inferredDomain"))
        inferred_skill = clean(row.get("inferredSkill"))
        record = {
            "sourceIndex": index,
            "id": question.get("id"),
            "reviewStatus": question.get("reviewStatus"),
            "fromDomain": question.get("domain"),
            "fromSkill": question.get("skill"),
            "toDomain": inferred_domain,
            "toSkill": inferred_skill,
            "difficulty": question.get("difficulty"),
        }
        if not choices or set(choices.keys()) != {"A", "B", "C", "D"} or correct not in choices:
            held.append({**record, "reason": "invalid_choices_or_correct_answer"})
            continue
        if inferred_domain not in {"Information and Ideas", "Craft and Structure", "Expression of Ideas", "Standard English Conventions"}:
            held.append({**record, "reason": "unsupported_inferred_domain"})
            continue
        if not inferred_skill or inferred_skill == "Unknown":
            held.append({**record, "reason": "unsupported_inferred_skill"})
            continue

        if args.apply:
            apply_metadata(raw, inferred_domain, inferred_skill)
            normalized = normalize_raw_question(raw, OPENSAT_PATH.name, index)
            normalized["domain"] = inferred_domain
            normalized["skill"] = inferred_skill
            explanation = upgrade_explanation(normalized, inferred_domain, inferred_skill)
            raw["explanation"] = explanation
            nested = raw.get("question")
            if isinstance(nested, dict):
                nested["explanation"] = explanation
            raw["explanationUpgradeVersion"] = VERSION
            raw["explanationUpgradeDate"] = str(date.today())
            traps = tag_question(normalize_raw_question(raw, OPENSAT_PATH.name, index))
            if traps:
                raw["trapTypes"] = traps
                raw["trapTypesVersion"] = "trap-types-v1-2026-05-20"
            if str(question.get("reviewStatus") or "").lower() == "reviewed":
                validation = validate_reviewed(raw, index)
                if validation["issues"] or validation["warnings"] or validation["depthFlags"]:
                    held.append({**record, "reason": "post_repair_validation_failed", **validation})
                    continue
        repaired.append(record)

    if args.apply and any(row.get("reason") == "post_repair_validation_failed" for row in held):
        raise SystemExit(json.dumps({"held": held[:20], "heldCount": len(held)}, indent=2, ensure_ascii=False))
    if args.apply:
        write_payload(OPENSAT_PATH, payload)

    summary = {
        "version": VERSION,
        "apply": args.apply,
        "scanned": len(rows),
        "repairedCount": len(repaired),
        "heldCount": len(held),
        "byFromToDomain": dict(Counter(f"{item['fromDomain']} -> {item['toDomain']}" for item in repaired).most_common()),
        "byToSkill": dict(Counter(item["toSkill"] for item in repaired).most_common()),
        "heldReasons": dict(Counter(item.get("reason") for item in held).most_common()),
        "held": held,
    }
    REPORT_PATH.write_text(json.dumps({"summary": summary, "repaired": repaired, "held": held}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
