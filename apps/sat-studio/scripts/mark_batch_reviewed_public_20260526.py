import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data" / "antigravity-bank.json"
ARTIFACT_PATH = ROOT / "artifacts" / "mark-batch-reviewed-public-20260526.json"
BATCH_ID = "strategy-geometry-exp-rw-stamina-20260526"


def is_batch_row(question):
    question_id = str(question.get("id", ""))
    return question_id.startswith(BATCH_ID) or question.get("sourceSignalId") == BATCH_ID


def main():
    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    updated = 0
    before = Counter()
    after = Counter()
    changed_ids = []

    for question in bank:
        if not is_batch_row(question):
            continue
        before[(question.get("reviewStatus"), question.get("visibility"), question.get("publicationStatus"))] += 1

        question["reviewStatus"] = "reviewed"
        question["visibility"] = "public_candidate"
        question["publicationStatus"] = "public_candidate_reviewed"
        question["practicePool"] = "core_pool"
        question["postReviewUse"] = "unified_mixed_sat_pool"
        question["sourceUsagePolicy"] = "provenance_only_unified_pool"
        question["publicReviewNote"] = (
            "Codex SAT expert review passed on 2026-05-26; original SAT Studio item approved "
            "for learner-safe public practice."
        )
        question["promotedBy"] = "Codex SAT expert review"
        question["promotedAt"] = now
        question["promotionBatchId"] = BATCH_ID

        content_audit = question.setdefault("contentAudit", {})
        content_audit["verdict"] = "pass"
        content_audit.setdefault("version", "strategy-geometry-exp-rw-stamina-20260526")
        content_audit.setdefault("reviewer", "Codex SAT expert content gate")
        content_audit.setdefault("checkedAt", "2026-05-26")

        after[(question.get("reviewStatus"), question.get("visibility"), question.get("publicationStatus"))] += 1
        changed_ids.append(question.get("id"))
        updated += 1

    if updated == 0:
        raise SystemExit(f"No rows matched batch {BATCH_ID}")

    BANK_PATH.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "batchId": BATCH_ID,
        "updatedAt": now,
        "updatedRows": updated,
        "beforeStatusCounts": {str(key): value for key, value in before.items()},
        "afterStatusCounts": {str(key): value for key, value in after.items()},
        "sampleIds": changed_ids[:12],
    }
    ARTIFACT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
