import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

try:
    from scripts import audit_antigravity_bank as row_audit
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUT = DATA_DIR / "strict-1600-review-gate-report.json"

TARGET = "SAT 1000-1600 roadmap, target 1600"
VERSION = "strict-1600-review-gate-2026-05-18"
UNIFIED_POLICY_VERSION = "unified-source-policy-2026-05-18"
SKIP_SOURCE_FILES = {"antigravity-bank.json"}


def load_payload(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
        return payload, payload["questions"]
    if isinstance(payload, list):
        return payload, payload
    return payload, []


def write_payload(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def review_bucket(row: dict[str, Any]) -> str:
    issues = set(row.get("issues") or [])
    warnings = set(row.get("warnings") or [])
    if row.get("severity") == "fail":
        if any(issue.startswith("missing_") or issue.startswith("mc_missing") or issue.startswith("mc_invalid") for issue in issues):
            return "structural_repair_required"
        if any(issue.startswith("math:") for issue in issues):
            return "answer_or_math_repair_required"
        if "mc_duplicate_choice_text" in issues:
            return "choice_repair_required"
        return "blocking_repair_required"
    if any(warning.startswith("exact_duplicate_prompt:") for warning in warnings):
        return "duplicate_prompt_review_required"
    if "weak_or_missing_distractor_explanations" in warnings:
        return "explanation_and_trap_review_required"
    if any(warning.startswith("math:") for warning in warnings):
        return "math_solution_review_required"
    if row.get("sourceFile") == "opensat-pinesat.json":
        return "external_source_review_required"
    return "strict_1600_review_required"


def publication_status_for(question: dict[str, Any]) -> str:
    if question.get("visibility") == "public_candidate":
        return "public_candidate_review"
    if question.get("visibility") == "private_family":
        return "private_similarity_review"
    return question.get("publicationStatus") or "needs_review_1600_gate"


def apply_gate() -> dict[str, Any]:
    seen: dict[str, str] = {}
    rows = [row_audit.audit_question(question, seen) for question in row_audit.iter_questions()]
    row_by_source_index = {
        (row.get("sourceFile"), row.get("sourceIndex")): row
        for row in rows
        if row.get("sourceFile") not in SKIP_SOURCE_FILES
    }
    row_by_id = {
        row.get("id"): row
        for row in rows
        if row.get("sourceFile") not in SKIP_SOURCE_FILES and row.get("id")
    }

    summary = {
        "version": VERSION,
        "target": TARGET,
        "skippedSourceFiles": sorted(SKIP_SOURCE_FILES),
        "updatedByFile": {},
        "statusByFile": {},
        "bucketByFile": {},
        "failIdsByFile": {},
        "notes": [
            "Antigravity was intentionally not modified.",
            "For non-Antigravity banks, reviewed now means the row has passed a strict human-quality review gate, not only a structural import gate.",
            "Rows that are structurally usable but need SAT-1600-level explanation, trap, duplicate, or source review are labeled needs_review.",
            "Rows with blocking structure/math/choice issues are labeled needs_review and contentAudit.verdict=fail so study selection can block them.",
        ],
    }

    for filename in row_audit.QUESTION_FILES:
        if filename in SKIP_SOURCE_FILES:
            continue
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload, questions = load_payload(path)
        if not questions:
            continue

        updated = 0
        status_counts: Counter[str] = Counter()
        bucket_counts: Counter[str] = Counter()
        fail_ids: list[str] = []

        for index, question in enumerate(questions):
            if not isinstance(question, dict):
                continue
            row = row_by_source_index.get((filename, index)) or row_by_id.get(question.get("id"))
            if not row:
                continue

            existing_review = question.get("reviewStatus")
            existing_publication = question.get("publicationStatus")
            existing_audit = question.get("contentAudit")
            existing_strict = question.get("strict1600Review")

            if question.get("reviewStatus") == "rejected" or str(question.get("publicationStatus") or "").startswith("rejected"):
                question["sourceUsagePolicy"] = "provenance_only_unified_pool"
                question["postReviewUse"] = "excluded_from_unified_mixed_sat_pool"
                question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION
                status_counts["rejected"] += 1
                continue

            bucket = review_bucket(row)
            verdict = "fail" if row.get("severity") == "fail" else "needs_review"
            if verdict == "fail":
                fail_ids.append(row.get("id"))
            bucket_counts[bucket] += 1

            question["reviewStatus"] = "needs_review"
            question["publicationStatus"] = publication_status_for(question)
            question["sourceUsagePolicy"] = "provenance_only_unified_pool"
            question["postReviewUse"] = "pending_strict_review_for_unified_mixed_sat_pool"
            question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION
            question["strict1600Review"] = {
                "version": VERSION,
                "target": TARGET,
                "status": "needs_review",
                "bucket": bucket,
                "severity": row.get("severity"),
                "issues": row.get("issues") or [],
                "warnings": row.get("warnings") or [],
                "reviewCriteria": [
                    "SAT domain and skill alignment for a 1000-1600 roadmap",
                    "correct answer and explanation consistency",
                    "unique and plausible A-D choices or valid student-produced response format",
                    "difficulty appropriate for scaffolded progress toward 1600",
                    "duplicate prompt, repeated skeleton, and topic-overuse control",
                    "source governance for private/public use",
                    "explanation quality strong enough to teach the right path and common traps",
                ],
                "previousReviewStatus": existing_review or "",
                "previousPublicationStatus": existing_publication or "",
            }
            question["contentAudit"] = {
                "version": VERSION,
                "verdict": verdict,
                "reviewer": "Codex SAT strict 1600 gate",
                "checkedAt": "2026-05-18",
                "target": TARGET,
                "severity": row.get("severity"),
                "bucket": bucket,
                "issues": row.get("issues") or [],
                "warnings": row.get("warnings") or [],
                "previousContentAudit": existing_audit if isinstance(existing_audit, dict) else {},
                "notes": "Needs SAT-1600-level review before reviewed status. Structural fail rows should be fixed before normal study use.",
            }

            if question.get("strict1600Review") != existing_strict or existing_review != "needs_review":
                updated += 1
            status_counts[question["reviewStatus"]] += 1

        write_payload(path, payload)
        summary["updatedByFile"][filename] = updated
        summary["statusByFile"][filename] = dict(status_counts)
        summary["bucketByFile"][filename] = dict(bucket_counts)
        summary["failIdsByFile"][filename] = fail_ids[:100]

    OUT.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return summary


def main() -> None:
    summary = apply_gate()
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
