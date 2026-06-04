import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_PATH = DATA_DIR / "unified-source-policy-report.json"
POLICY_VERSION = "unified-source-policy-2026-05-18"
POLICY_TEXT = (
    "Source labels are retained only for provenance, audit, licensing, and review traceability. "
    "They must not create independent student practice tracks. Reviewed non-rejected items are eligible "
    "for one unified mixed SAT pool."
)
QUESTION_FILES = [
    "antigravity-bank.json",
    "archive-source-ai-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "opensat-pinesat.json",
    "private-vault-archive-bank.json",
    "sat-1590-elite-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
    "sat-studio-foundation-bank.json",
]


def load_questions(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    root = json.loads(path.read_text(encoding="utf-8"))
    rows = root.get("questions") if isinstance(root, dict) else root
    if not isinstance(rows, list):
        return root, []
    return root, [row for row in rows if isinstance(row, dict)]


def policy_use_status(question: dict[str, Any]) -> str:
    if question.get("reviewStatus") == "rejected" or str(question.get("publicationStatus") or "").startswith("rejected"):
        return "excluded_from_unified_mixed_sat_pool"
    if question.get("reviewStatus") == "reviewed":
        return "unified_mixed_sat_pool"
    return "pending_strict_review_for_unified_mixed_sat_pool"


def normalize_publication_status(question: dict[str, Any]) -> None:
    if question.get("reviewStatus") != "reviewed":
        return
    current = str(question.get("publicationStatus") or "")
    stale = current in {"", "needs_review_1600_gate", "public_candidate_review", "private_similarity_review"}
    if question.get("visibility") == "public_candidate" and current != "public_candidate_reviewed":
        question["publicationStatus"] = "public_candidate_reviewed"
    elif question.get("visibility") == "private_family" and stale:
        question["publicationStatus"] = "private_reviewed"
    elif stale:
        question["publicationStatus"] = "reviewed"


def stamp_root_policy(root: Any) -> None:
    if not isinstance(root, dict):
        return
    summary = root.setdefault("summary", {})
    if isinstance(summary, dict):
        summary["sourceUsagePolicy"] = POLICY_TEXT
        summary["unifiedPoolPolicyVersion"] = POLICY_VERSION
        summary["postReviewUsePolicy"] = {
            "reviewed": "unified_mixed_sat_pool",
            "needs_review": "pending_strict_review_for_unified_mixed_sat_pool",
            "rejected": "excluded_from_unified_mixed_sat_pool",
        }
    meta = root.setdefault("meta", {})
    if isinstance(meta, dict):
        meta["sourceUsagePolicy"] = POLICY_TEXT
        meta["unifiedPoolPolicyVersion"] = POLICY_VERSION


def apply_policy() -> dict[str, Any]:
    report = {
        "version": POLICY_VERSION,
        "policy": POLICY_TEXT,
        "files": {},
        "totals": {"questions": 0, "changed": 0},
    }
    for filename in QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        root, questions = load_questions(path)
        if not questions:
            continue

        before = json.dumps(root, ensure_ascii=False, sort_keys=True)
        stamp_root_policy(root)
        use_counts = Counter()
        review_counts = Counter()
        changed_rows = 0
        for question in questions:
            normalize_publication_status(question)
            use_status = policy_use_status(question)
            review_counts[question.get("reviewStatus") or "missing"] += 1
            use_counts[use_status] += 1

            old = (
                question.get("sourceUsagePolicy"),
                question.get("postReviewUse"),
                question.get("unifiedPoolPolicyVersion"),
            )
            question["sourceUsagePolicy"] = "provenance_only_unified_pool"
            question["postReviewUse"] = use_status
            question["unifiedPoolPolicyVersion"] = POLICY_VERSION
            if old != (
                question.get("sourceUsagePolicy"),
                question.get("postReviewUse"),
                question.get("unifiedPoolPolicyVersion"),
            ):
                changed_rows += 1

        after = json.dumps(root, ensure_ascii=False, sort_keys=True)
        if after != before:
            path.write_text(json.dumps(root, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        report["files"][filename] = {
            "questions": len(questions),
            "changedRows": changed_rows,
            "byReviewStatus": dict(review_counts),
            "byPostReviewUse": dict(use_counts),
            "rootSummaryStamped": isinstance(root, dict),
        }
        report["totals"]["questions"] += len(questions)
        report["totals"]["changed"] += changed_rows

    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    print(json.dumps(apply_policy(), indent=2, ensure_ascii=False))
