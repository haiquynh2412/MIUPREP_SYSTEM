import argparse
import csv
import json
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.upgrade_antigravity_p0_explanations import ensure_question_type, math_explanation, rw_explanation
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row
    from review_unified_needs_review_bank import load_payload, write_payload
    from upgrade_antigravity_p0_explanations import ensure_question_type, math_explanation, rw_explanation


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
QUEUE_PATH = DATA_DIR / "explanation-upgrade-queue.csv"
VERSION = "source-p1-generic-explanation-upgrade-2026-05-20"
TARGET_PRIORITY = "P1"
TARGET_REASON = "generic_distractor_explanation"


def queue_indices(source_file: str) -> set[int]:
    indices = set()
    with QUEUE_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if (
                row.get("priority") == TARGET_PRIORITY
                and row.get("reason") == TARGET_REASON
                and row.get("sourceFile") == source_file
            ):
                try:
                    indices.add(int(row.get("sourceIndex") or -1))
                except ValueError:
                    continue
    return indices


def normalized_for_audit(question: dict[str, Any], source_file: str, index: int) -> dict[str, Any]:
    row = dict(question)
    row["_sourceFile"] = source_file
    row["_sourceIndex"] = index
    return row


def set_explanation(question: dict[str, Any], source_file: str) -> None:
    ensure_question_type(question)
    question["explanation"] = math_explanation(question) if question.get("section") == "Math" else rw_explanation(question)
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["sourceP1GenericExplanationUpgradeVersion"] = VERSION
    notes["sourceP1GenericExplanationUpgradeSourceFile"] = source_file
    question["expertRepairNotes"] = notes


def process_source(source_file: str, apply: bool) -> dict[str, Any]:
    data_path = DATA_DIR / source_file
    report_path = DATA_DIR / f"{Path(source_file).stem}-p1-generic-explanation-upgrade-report.json"
    target_indices = queue_indices(source_file)
    payload, questions = load_payload(data_path)
    report: dict[str, Any] = {
        "apply": apply,
        "version": VERSION,
        "sourceFile": source_file,
        "targetPriority": TARGET_PRIORITY,
        "targetReason": TARGET_REASON,
        "targetCount": len(target_indices),
        "attempted": [],
        "upgraded": [],
        "skipped": [],
        "blocked": [],
        "remainingDepthFlags": [],
    }

    for index, question in enumerate(questions):
        if not isinstance(question, dict) or index not in target_indices:
            continue
        if question.get("reviewStatus") != "reviewed":
            report["skipped"].append(
                {"id": question.get("id"), "sourceIndex": index, "reason": "not_reviewed"}
            )
            continue

        original_question = json.loads(json.dumps(question, ensure_ascii=False))
        report["attempted"].append({"id": question.get("id"), "sourceIndex": index})
        set_explanation(question, source_file)
        audit_row = reviewed_issue_row(normalized_for_audit(question, source_file, index), {})
        warnings = [w for w in audit_row.get("warnings", []) if not w.startswith("duplicate_prompt_with:")]
        flags = pedagogical_depth_flags(normalized_for_audit(question, source_file, index))
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

    if apply:
        write_payload(data_path, payload)
    report["attemptedCount"] = len(report["attempted"])
    report["upgradedCount"] = len(report["upgraded"])
    report["skippedCount"] = len(report["skipped"])
    report["blockedCount"] = len(report["blocked"])
    report["remainingDepthFlagCount"] = len(report["remainingDepthFlags"])
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {k: v for k, v in report.items() if k not in {"attempted", "upgraded", "skipped", "blocked", "remainingDepthFlags"}}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_files", nargs="+")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    summaries = [process_source(source_file, args.apply) for source_file in args.source_files]
    print(json.dumps(summaries, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
