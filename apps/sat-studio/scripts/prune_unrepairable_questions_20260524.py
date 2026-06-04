"""Physically remove questions that failed final repair/gate.

This script is intentionally narrow: it only touches the known question-bank
JSON files. Rows are removed when they are no longer eligible for the student
learning pool after the final repair pass: needs_review, rejected, blocked, or
hidden duplicate / blocked quality-gate rows.
"""

from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"

BANK_FILES = [
    "antigravity-bank.json",
    "archive-source-ai-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "opensat-pinesat.json",
    "private-vault-archive-bank.json",
    "sat-1590-elite-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
    "sat-studio-foundation-bank.json",
]

REMOVED_MANIFEST = DATA_DIR / "pruned-unrepairable-questions-20260524.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_payload(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
        return payload, payload["questions"]
    if isinstance(payload, list):
        return payload, payload
    return payload, []


def write_payload(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def row_reasons(question: dict[str, Any]) -> list[str]:
    review = str(question.get("reviewStatus") or "").lower()
    publication = str(question.get("publicationStatus") or "").lower()
    visibility = str(question.get("visibility") or "").lower()
    practice_pool = str(question.get("practicePool") or "").lower()
    audit_status = str(question.get("auditStatus") or "").lower()
    content_audit = question.get("contentAudit") if isinstance(question.get("contentAudit"), dict) else {}
    quality_gate = question.get("qualityGate") if isinstance(question.get("qualityGate"), dict) else {}

    reasons: list[str] = []
    if review == "needs_review":
        reasons.append("needs_review_after_final_repair")
    if review == "rejected":
        reasons.append("rejected")
    if publication.startswith("rejected"):
        reasons.append(f"publication:{publication}")
    if visibility == "blocked":
        reasons.append("visibility:blocked")
    if audit_status == "blocked":
        reasons.append("auditStatus:blocked")
    if str(content_audit.get("status") or "").lower() == "blocked":
        reasons.append("contentAudit.status:blocked")
    if str(quality_gate.get("status") or "").lower() == "blocked":
        reasons.append("qualityGate.status:blocked")
    if practice_pool in {"hidden_duplicate", "blocked_quality_gate"}:
        reasons.append(f"practicePool:{practice_pool}")
    return sorted(set(reasons))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write pruned bank files.")
    args = parser.parse_args()

    ARTIFACTS_DIR.mkdir(exist_ok=True)
    checked_at = now_iso()
    summary = Counter()
    by_file: dict[str, dict[str, Any]] = {}
    by_reason = Counter()
    removed_rows: list[dict[str, Any]] = []
    backups: list[str] = []

    for filename in BANK_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload, rows = load_payload(path)
        kept: list[dict[str, Any]] = []
        file_counter = Counter()
        file_reason_counter = Counter()

        for index, question in enumerate(rows):
            if not isinstance(question, dict):
                kept.append(question)
                continue
            reasons = row_reasons(question)
            if reasons:
                file_counter["removed"] += 1
                for reason in reasons:
                    by_reason[reason] += 1
                    file_reason_counter[reason] += 1
                removed_rows.append(
                    {
                        "id": question.get("id"),
                        "sourceFile": filename,
                        "sourceIndex": index,
                        "reviewStatus": question.get("reviewStatus"),
                        "publicationStatus": question.get("publicationStatus"),
                        "visibility": question.get("visibility"),
                        "practicePool": question.get("practicePool"),
                        "section": question.get("section"),
                        "domain": question.get("domain"),
                        "skill": question.get("skill"),
                        "difficulty": question.get("difficulty"),
                        "reasons": reasons,
                    }
                )
            else:
                kept.append(question)
                file_counter["kept"] += 1

        if args.apply and file_counter["removed"]:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            backup = ARTIFACTS_DIR / f"{path.stem}-before-prune-unrepairable-{timestamp}.json"
            shutil.copy2(path, backup)
            backups.append(str(backup))
            if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
                payload["questions"] = kept
                write_payload(path, payload)
            elif isinstance(payload, list):
                write_payload(path, kept)

        by_file[filename] = {
            **dict(file_counter),
            "removedByReason": dict(file_reason_counter.most_common()),
        }
        summary.update(file_counter)

    manifest = {
        "version": "prune-unrepairable-questions-2026-05-24",
        "checkedAt": checked_at,
        "apply": args.apply,
        "criteria": [
            "reviewStatus == needs_review",
            "reviewStatus == rejected",
            "publicationStatus starts with rejected",
            "visibility == blocked",
            "auditStatus == blocked",
            "contentAudit.status == blocked",
            "qualityGate.status == blocked",
            "practicePool in hidden_duplicate, blocked_quality_gate",
        ],
        "summary": dict(summary),
        "byFile": by_file,
        "byReason": dict(by_reason.most_common()),
        "backups": backups,
        "removedRows": removed_rows,
    }
    REMOVED_MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "apply": args.apply,
                "summary": dict(summary),
                "byReasonTop": dict(by_reason.most_common(20)),
                "manifest": str(REMOVED_MANIFEST.relative_to(ROOT)),
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
