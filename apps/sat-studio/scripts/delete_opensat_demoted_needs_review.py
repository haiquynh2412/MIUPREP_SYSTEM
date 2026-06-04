import argparse
import json
from pathlib import Path
from typing import Any

try:
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
except ModuleNotFoundError:
    from review_unified_needs_review_bank import load_payload, write_payload


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_PATH = DATA_DIR / "opensat-pinesat.json"
SOURCE_REPORT_PATH = DATA_DIR / "opensat-p0-math-quality-repair-report.json"
DELETE_REPORT_PATH = DATA_DIR / "opensat-demoted-needs-review-delete-report.json"
DEMOTION_VERSION = "opensat-p0-math-quality-repair-2026-05-20"
DELETE_VERSION = "opensat-demoted-needs-review-delete-2026-05-20"


def notes_version(question: dict[str, Any]) -> str:
    notes = question.get("expertRepairNotes")
    if isinstance(notes, dict):
        return str(notes.get("opensatP0MathQualityDemotionVersion") or "")
    return ""


def audit_version(question: dict[str, Any]) -> str:
    audit = question.get("contentAudit")
    if isinstance(audit, dict):
        return str(audit.get("version") or "")
    return ""


def safe_target(question: dict[str, Any], expected_id: Any) -> tuple[bool, list[str]]:
    failures: list[str] = []
    if str(question.get("id")) != str(expected_id):
        failures.append(f"id_mismatch:{question.get('id')}!={expected_id}")
    if question.get("reviewStatus") != "needs_review":
        failures.append(f"not_needs_review:{question.get('reviewStatus')}")
    if notes_version(question) != DEMOTION_VERSION and audit_version(question) != DEMOTION_VERSION:
        failures.append("missing_expected_demotion_version")
    return not failures, failures


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    source_report = json.loads(SOURCE_REPORT_PATH.read_text(encoding="utf-8"))
    targets = source_report.get("demotedNeedsReview") or []
    payload, questions = load_payload(DATA_PATH)
    target_indices: set[int] = set()
    report: dict[str, Any] = {
        "apply": args.apply,
        "version": DELETE_VERSION,
        "sourceReport": str(SOURCE_REPORT_PATH.relative_to(ROOT)),
        "targetCount": len(targets),
        "validated": [],
        "blocked": [],
        "deleted": [],
    }

    for target in targets:
        try:
            index = int(target.get("sourceIndex"))
        except (TypeError, ValueError):
            report["blocked"].append({"target": target, "failures": ["invalid_sourceIndex"]})
            continue
        if index < 0 or index >= len(questions) or not isinstance(questions[index], dict):
            report["blocked"].append({"target": target, "failures": ["sourceIndex_out_of_range"]})
            continue
        question = questions[index]
        ok, failures = safe_target(question, target.get("id"))
        if not ok:
            report["blocked"].append({"target": target, "failures": failures})
            continue
        target_indices.add(index)
        report["validated"].append({"id": question.get("id"), "sourceIndex": index, "reason": target.get("reason")})

    if args.apply and not report["blocked"]:
        deleted_rows = []
        kept_rows = []
        for index, question in enumerate(questions):
            if index in target_indices:
                deleted_rows.append({"sourceIndex": index, "question": question})
            else:
                kept_rows.append(question)
        questions[:] = kept_rows
        write_payload(DATA_PATH, payload)
        report["deleted"] = [
            {
                "id": row["question"].get("id"),
                "sourceIndex": row["sourceIndex"],
                "reason": next((item.get("reason") for item in targets if int(item.get("sourceIndex")) == row["sourceIndex"]), ""),
            }
            for row in deleted_rows
        ]
    elif args.apply and report["blocked"]:
        report["applySkippedReason"] = "blocked_targets_present"

    report["validatedCount"] = len(report["validated"])
    report["blockedCount"] = len(report["blocked"])
    report["deletedCount"] = len(report["deleted"])
    DELETE_REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in {"validated", "blocked", "deleted"}}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
