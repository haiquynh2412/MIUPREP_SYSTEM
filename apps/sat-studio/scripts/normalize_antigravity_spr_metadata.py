import argparse
import json
from pathlib import Path
from typing import Any

try:
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
except ModuleNotFoundError:
    from review_unified_needs_review_bank import load_payload, write_payload


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "antigravity-bank.json"
REPORT_PATH = ROOT / "data" / "antigravity-spr-metadata-normalization-report.json"
VERSION = "antigravity-spr-metadata-normalization-2026-05-20"


def is_untyped_spr(question: dict[str, Any]) -> bool:
    if question.get("reviewStatus") != "needs_review":
        return False
    if question.get("section") != "Math":
        return False
    if question.get("questionType"):
        return False
    if question.get("type") != "SPR":
        return False
    if question.get("choices"):
        return False
    return bool(question.get("acceptableAnswers"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(DATA_PATH)
    normalized = []
    for index, question in enumerate(questions):
        if not isinstance(question, dict) or not is_untyped_spr(question):
            continue
        question["questionType"] = "student_produced_response"
        notes = question.get("expertRepairNotes")
        if not isinstance(notes, dict):
            notes = {}
        notes["sprMetadataNormalizedAt"] = "2026-05-20"
        notes["sprMetadataNormalizationVersion"] = VERSION
        question["expertRepairNotes"] = notes
        normalized.append({"id": question.get("id"), "sourceIndex": index})

    report = {"apply": args.apply, "version": VERSION, "normalizedCount": len(normalized), "normalized": normalized}
    if args.apply:
        write_payload(DATA_PATH, payload)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
