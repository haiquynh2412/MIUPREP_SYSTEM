import csv
import json
from collections import Counter
from pathlib import Path
from typing import Any

try:
    from scripts import audit_antigravity_bank as row_audit
    from scripts.review_unified_needs_review_bank import audit_single, load_payload
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit
    from review_unified_needs_review_bank import audit_single, load_payload


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SOURCE_FILE = "antigravity-bank.json"
OUT_JSON = DATA_DIR / "antigravity-needs-review-disposition.json"
OUT_CSV = DATA_DIR / "antigravity-needs-review-disposition.csv"

STRUCTURAL_ISSUES = {
    "missing_prompt",
    "missing_explanation",
    "missing_correctAnswer",
    "missing_section",
    "missing_domain",
    "missing_skill",
    "missing_difficulty",
    "mc_missing_exact_A_to_D_choices",
    "mc_invalid_correct_answer",
    "mc_duplicate_choice_text",
    "spr_should_not_have_choices",
    "spr_correct_answer_is_choice_letter",
    "rw_must_be_multiple_choice",
    "grid_in_skill_but_not_spr_format",
}


def prompt_preview(question: dict[str, Any]) -> str:
    prompt = str(question.get("prompt") or "")
    return " ".join(prompt.split())[:180]


def classify(row: dict[str, Any]) -> str:
    issues = set(row.get("issues") or [])
    warnings = set(row.get("warnings") or [])
    if any(issue.startswith("math:") for issue in issues):
        return "needs_review_repair_math"
    if issues & STRUCTURAL_ISSUES:
        return "needs_review_repair_structural"
    if issues:
        return "needs_review_repair_other"
    if any(warning.startswith("exact_duplicate_prompt:") for warning in warnings):
        return "needs_human_duplicate_review"
    if warnings:
        return "needs_human_quality_review"
    return "ready_for_reviewed_after_human_spot_check"


def main() -> None:
    payload, questions = load_payload(DATA_DIR / SOURCE_FILE)
    rows = []
    for index, question in enumerate(questions):
        if not isinstance(question, dict):
            continue
        if question.get("reviewStatus") != "needs_review":
            continue
        audit = audit_single(question, SOURCE_FILE, index)
        disposition = classify(audit)
        rows.append(
            {
                "id": question.get("id") or f"{SOURCE_FILE}#{index}",
                "sourceIndex": index,
                "section": question.get("section"),
                "domain": question.get("domain"),
                "skill": question.get("skill"),
                "difficulty": question.get("difficulty"),
                "questionType": audit.get("questionType"),
                "disposition": disposition,
                "severity": audit.get("severity"),
                "issues": audit.get("issues") or [],
                "warnings": audit.get("warnings") or [],
                "promptPreview": prompt_preview(question),
            }
        )

    summary = {
        "sourceFile": SOURCE_FILE,
        "totalNeedsReview": len(rows),
        "byDisposition": dict(Counter(row["disposition"] for row in rows).most_common()),
        "bySection": dict(Counter(str(row.get("section") or "Unknown") for row in rows).most_common()),
        "byDomain": dict(Counter(str(row.get("domain") or "Unknown") for row in rows).most_common()),
        "byIssue": dict(Counter(issue for row in rows for issue in row["issues"]).most_common()),
        "byWarning": dict(Counter(warning for row in rows for warning in row["warnings"]).most_common()),
    }
    OUT_JSON.write_text(json.dumps({"summary": summary, "items": rows}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = [
            "id",
            "sourceIndex",
            "section",
            "domain",
            "skill",
            "difficulty",
            "questionType",
            "disposition",
            "severity",
            "issues",
            "warnings",
            "promptPreview",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            out = dict(row)
            out["issues"] = ";".join(out.get("issues") or [])
            out["warnings"] = ";".join(out.get("warnings") or [])
            writer.writerow({field: out.get(field, "") for field in fieldnames})

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
