import argparse
import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

try:
    from scripts.check_questions import (
        DATA_DIR,
        QUESTION_FILES,
        TOPIC_KEEP_TARGET,
        is_core_visible_row,
        is_generated_topic_candidate,
        normalize_raw_question,
        topic_key,
    )
except ModuleNotFoundError:
    from check_questions import (
        DATA_DIR,
        QUESTION_FILES,
        TOPIC_KEEP_TARGET,
        is_core_visible_row,
        is_generated_topic_candidate,
        normalize_raw_question,
        topic_key,
    )


ROOT = Path(__file__).resolve().parents[1]
POLICY_VERSION = "topic-diversity-v3-2026-05-26"
RESTORABLE_POLICY_VERSIONS = {
    POLICY_VERSION,
    "topic-diversity-v2-2026-05-18",
}
OUT_JSON = ROOT / "data" / "topic-governance-report.json"
OUT_CSV = ROOT / "data" / "topic-governance-report.csv"

MUTABLE_FILES = {
    "antigravity-bank.json",
    "archive-source-ai-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "sat-1590-elite-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
}

SOURCE_MOVE_PRIORITY = {
    "ai_generated": 0,
    "antigravity": 1,
    "sat_king": 2,
    "sat_1590": 4,
}

TOPIC_GOVERNED_SOURCE_TYPES = {
    "ai",
    "ai_generated",
    "antigravity",
    "sat_king",
    "sat_1590",
}

FILE_MOVE_PRIORITY = {
    "archive-source-ai-bank.json": 0,
    "kaplan-sat-math-ai-bank.json": 1,
    "antigravity-bank.json": 2,
    "sat-king-supplemental-ai-bank.json": 3,
    "sat-1590-elite-ai-bank.json": 5,
}

DIFFICULTY_MOVE_PRIORITY = {
    "easy": 0,
    "medium": 1,
    "": 2,
    "hard": 9,
}

REVIEW_MOVE_PRIORITY = {
    "needs_review": 0,
    "draft": 1,
    "reviewed": 2,
}


def load_payload(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload.get("questions") if isinstance(payload, dict) else payload
    if not isinstance(questions, list):
        questions = []
    return payload, questions


def write_payload(path, payload, questions):
    if isinstance(payload, dict):
        payload["questions"] = questions
        payload.setdefault("summary", {})
        if isinstance(payload.get("summary"), dict):
            payload["summary"]["topicGovernancePolicy"] = {
                "version": POLICY_VERSION,
                "updatedBy": "scripts/enforce_topic_pool_policy.py",
                "normalPracticeTargetPerTopic": TOPIC_KEEP_TARGET,
            }
    else:
        payload = questions
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def pool_of(question):
    return question.get("practicePool") or question.get("skeletonDiversity", {}).get("practicePool") or "core_pool"


def restore_previous_topic_policy(question):
    governance = question.get("topicGovernance")
    if not isinstance(governance, dict) or governance.get("policyVersion") not in RESTORABLE_POLICY_VERSIONS:
        return False
    previous_pool = governance.get("previousPracticePool") or question.get("skeletonDiversity", {}).get("practicePool") or "core_pool"
    question["practicePool"] = previous_pool
    question.pop("topicGovernance", None)
    return True


def row_from_question(question, filename, index):
    row = normalize_raw_question(question, filename, index)
    row["practicePool"] = pool_of(question)
    return row


def explanation_word_count(question):
    explanation = question.get("explanation") or ""
    if isinstance(explanation, dict):
        explanation = " ".join(str(value) for value in explanation.values())
    return len(str(explanation).split())


def candidate_sort_key(record):
    question = record["question"]
    difficulty = str(question.get("difficulty") or "").lower()
    source = str(question.get("sourceType") or "").lower()
    review = str(question.get("reviewStatus") or "").lower()
    skeleton_rank = int(question.get("skeletonDiversity", {}).get("skeletonRank") or 0)
    return (
        DIFFICULTY_MOVE_PRIORITY.get(difficulty, 4),
        FILE_MOVE_PRIORITY.get(record["filename"], 9),
        SOURCE_MOVE_PRIORITY.get(source, 6),
        REVIEW_MOVE_PRIORITY.get(review, 1),
        -skeleton_rank,
        explanation_word_count(question),
        str(question.get("id") or ""),
    )


def is_topic_governed_generated(record):
    row = record["row"]
    source = str(row.get("sourceType") or "").lower()
    return (
        is_generated_topic_candidate(row)
        or source in TOPIC_GOVERNED_SOURCE_TYPES
        or record["filename"] in MUTABLE_FILES
    )


def should_move_candidate(record, strict_core_cap=False):
    row = record["row"]
    difficulty = str(row.get("difficulty") or "").lower()
    if strict_core_cap:
        return (
            record["mutable"]
            and is_core_visible_row(row)
            and is_topic_governed_generated(record)
        )
    return (
        record["mutable"]
        and is_core_visible_row(row)
        and difficulty in {"easy", "medium", ""}
        and is_topic_governed_generated(record)
    )


def build_records(payloads, mutable_files):
    records = []
    for filename, data in payloads.items():
        for index, question in enumerate(data["questions"]):
            if not isinstance(question, dict):
                continue
            row = row_from_question(question, filename, index)
            topic = topic_key(row)
            if not topic:
                continue
            records.append(
                {
                    "filename": filename,
                    "index": index,
                    "question": question,
                    "row": row,
                    "topic": topic,
                    "mutable": filename in mutable_files,
                }
            )
    return records


def apply_topic_policy(records, apply=False, strict_core_cap=False):
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    by_topic = defaultdict(list)
    for record in records:
        by_topic[record["topic"]].append(record)

    topic_rows = []
    changed_records = []
    unresolved_overflow = 0

    for topic, group in sorted(by_topic.items(), key=lambda item: len(item[1]), reverse=True):
        core_visible = [record for record in group if is_core_visible_row(record["row"])]
        overflow = max(0, len(core_visible) - TOPIC_KEEP_TARGET)
        if overflow <= 0:
            continue

        candidates = sorted(
            [record for record in core_visible if should_move_candidate(record, strict_core_cap=strict_core_cap)],
            key=candidate_sort_key,
        )
        selected = candidates[:overflow]
        unresolved = max(0, overflow - len(selected))
        unresolved_overflow += unresolved

        for record in selected:
            question = record["question"]
            previous_pool = pool_of(question)
            if apply:
                question["practicePool"] = "remedial_pool"
                question["topicGovernance"] = {
                    "policyVersion": POLICY_VERSION,
                    "topic": topic,
                    "action": "strict_topic_core_cap" if strict_core_cap else "remedial_topic_overflow",
                    "previousPracticePool": previous_pool,
                    "updatedAt": now,
                    "updatedBy": "scripts/enforce_topic_pool_policy.py",
                    "reason": (
                        "Generated topic overflow moved out of normal practice; still available for remediation after misses."
                        if strict_core_cap
                        else "Easy/Medium generated topic clone moved out of normal practice; available for remediation after misses."
                    ),
                    "normalPracticeTarget": TOPIC_KEEP_TARGET,
                    "coreVisibleBefore": len(core_visible),
                    "overflowBefore": overflow,
                }
            changed_records.append(record)

        topic_rows.append(
            {
                "topic": topic,
                "total": len(group),
                "coreVisibleBefore": len(core_visible),
                "target": TOPIC_KEEP_TARGET,
                "overflowBefore": overflow,
                "movedToRemedial": len(selected),
                "unresolvedOverflow": unresolved,
                "candidateCount": len(candidates),
                "sampleMovedIds": [record["question"].get("id") for record in selected[:8]],
                "sourceMixMoved": dict(Counter(record["filename"] for record in selected)),
            }
        )

    return {
        "changedRecords": changed_records,
        "topicRows": topic_rows,
        "unresolvedOverflow": unresolved_overflow,
    }


def main():
    parser = argparse.ArgumentParser(description="Apply SAT Studio topic/subskill clone pool policy.")
    parser.add_argument("--apply", action="store_true", help="Write practicePool/topicGovernance changes to mutable generated banks.")
    parser.add_argument(
        "--strict-core-cap",
        action="store_true",
        help="Enforce the normal-practice topic cap across all generated difficulties, including Hard overflow when needed.",
    )
    parser.add_argument(
        "--include-all-files",
        action="store_true",
        help="Allow policy writes to every question file. Default writes only generated bank files.",
    )
    args = parser.parse_args()

    mutable_files = set(QUESTION_FILES) if args.include_all_files else set(MUTABLE_FILES)
    payloads = {}
    restored = 0
    for filename in QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload, questions = load_payload(path)
        if filename in mutable_files:
            for question in questions:
                if isinstance(question, dict) and restore_previous_topic_policy(question):
                    restored += 1
        payloads[filename] = {"path": path, "payload": payload, "questions": questions}

    records = build_records(payloads, mutable_files)
    result = apply_topic_policy(records, apply=args.apply, strict_core_cap=args.strict_core_cap)

    changed_by_file = Counter(record["filename"] for record in result["changedRecords"])
    report = {
        "policy": {
            "version": POLICY_VERSION,
            "normalPracticeTargetPerTopic": TOPIC_KEEP_TARGET,
            "action": (
                "Strictly cap generated topic clones in normal practice by moving overflow to remedial_pool."
                if args.strict_core_cap
                else "Move Easy/Medium generated topic clones from core_pool to remedial_pool."
            ),
            "hardPolicy": (
                "Hard generated rows can be moved only after lower-difficulty overflow candidates are exhausted."
                if args.strict_core_cap
                else "Hard generated rows are not moved by this pass; review manually if a hard topic remains overloaded."
            ),
            "apply": bool(args.apply),
            "strictCoreCap": bool(args.strict_core_cap),
            "includeAllFiles": bool(args.include_all_files),
        },
        "summary": {
            "recordsScanned": len(records),
            "topicsScanned": len({record["topic"] for record in records}),
            "topicsOverTarget": len(result["topicRows"]),
            "movedToRemedial": len(result["changedRecords"]),
            "unresolvedOverflow": result["unresolvedOverflow"],
            "restoredPreviousPolicyRows": restored,
            "changedByFile": dict(changed_by_file),
        },
        "topics": sorted(result["topicRows"], key=lambda row: row["overflowBefore"], reverse=True)[:160],
    }

    if args.apply:
        for filename in mutable_files:
            data = payloads.get(filename)
            if data:
                write_payload(data["path"], data["payload"], data["questions"])

    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with OUT_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "topic",
                "total",
                "coreVisibleBefore",
                "target",
                "overflowBefore",
                "movedToRemedial",
                "unresolvedOverflow",
                "candidateCount",
                "sampleMovedIds",
            ],
        )
        writer.writeheader()
        for row in report["topics"]:
            out = dict(row)
            out["sampleMovedIds"] = ", ".join(row.get("sampleMovedIds") or [])
            writer.writerow({field: out.get(field, "") for field in writer.fieldnames})

    print(json.dumps(report["summary"], indent=2, ensure_ascii=False))
    if not args.apply:
        print("Dry run only. Re-run with --apply to update generated bank JSON files.")


if __name__ == "__main__":
    main()
