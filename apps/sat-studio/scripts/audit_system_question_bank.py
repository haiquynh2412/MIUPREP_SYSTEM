import csv
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
OUT_JSON = DATA_DIR / "system-question-bank-audit-report.json"
OUT_CSV = DATA_DIR / "system-question-bank-audit-report.csv"


def pct(part: int, total: int) -> float:
    return round(part * 100 / total, 1) if total else 0.0


def is_excluded(row: dict[str, Any]) -> bool:
    publication = str(row.get("publicationStatus") or "")
    return (
        row.get("reviewStatus") == "rejected"
        or publication.startswith("rejected")
        or row.get("visibility") == "blocked"
    )


def active_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [row for row in rows if not is_excluded(row)]


def answer_distribution(rows: list[dict[str, Any]]) -> dict[str, Any]:
    mc_rows = [
        row
        for row in rows
        if row.get("questionType") == "multiple_choice"
        and row.get("correctAnswer") in {"A", "B", "C", "D"}
    ]
    total = len(mc_rows)
    counts = Counter(row.get("correctAnswer") for row in mc_rows)
    by_choice = {key: {"count": counts[key], "pct": pct(counts[key], total)} for key in ["A", "B", "C", "D"]}
    max_choice = max(by_choice, key=lambda key: by_choice[key]["pct"]) if total else ""
    return {
        "totalMc": total,
        "byChoice": by_choice,
        "maxChoice": max_choice,
        "maxChoicePct": by_choice[max_choice]["pct"] if max_choice else 0,
        "answerLeakageRisk": bool(max_choice and by_choice[max_choice]["pct"] > 40),
    }


def spr_distribution(rows: list[dict[str, Any]]) -> dict[str, Any]:
    math_rows = [row for row in rows if row.get("section") == "Math"]
    spr_rows = [row for row in math_rows if row.get("questionType") == "student_produced_response"]
    return {
        "mathTotal": len(math_rows),
        "sprTotal": len(spr_rows),
        "sprPctOfMath": pct(len(spr_rows), len(math_rows)),
        "satExpectedApproxPct": 25.0,
        "deltaPctPoints": round(pct(len(spr_rows), len(math_rows)) - 25.0, 1) if math_rows else 0,
    }


def bank_summary(rows: list[dict[str, Any]]) -> dict[str, Any]:
    active = active_rows(rows)
    severity = Counter(row.get("severity") for row in rows)
    active_severity = Counter(row.get("severity") for row in active)
    review = Counter(row.get("reviewStatus") or "Unknown" for row in rows)
    publication = Counter(row.get("publicationStatus") or "Unknown" for row in rows)
    issues = Counter(issue for row in rows for issue in row.get("issues", []))
    active_issues = Counter(issue for row in active for issue in row.get("issues", []))
    warnings = Counter(warning for row in rows for warning in row.get("warnings", []))
    pass_needs_review = [
        row.get("id")
        for row in rows
        if row.get("severity") == "pass" and row.get("reviewStatus") not in {"reviewed", "rejected"}
    ]
    fail_reviewed = [
        row.get("id")
        for row in active
        if row.get("severity") == "fail" and row.get("reviewStatus") == "reviewed"
    ]
    return {
        "total": len(rows),
        "activeTotal": len(active),
        "bySeverity": dict(severity),
        "activeBySeverity": dict(active_severity),
        "byReviewStatus": dict(review),
        "byPublicationStatus": dict(publication),
        "bySection": dict(Counter(row.get("section") or "Unknown" for row in rows)),
        "byDifficulty": dict(Counter(row.get("difficulty") or "Unknown" for row in rows)),
        "topIssues": dict(issues.most_common(20)),
        "activeTopIssues": dict(active_issues.most_common(20)),
        "topWarnings": dict(warnings.most_common(20)),
        "passNeedsReviewCount": len(pass_needs_review),
        "passNeedsReviewSample": pass_needs_review[:25],
        "failReviewedCount": len(fail_reviewed),
        "failReviewedSample": fail_reviewed[:25],
        "answerChoiceDistribution": answer_distribution(active),
        "studentProducedResponseDistribution": spr_distribution(active),
    }


def duplicate_summary(rows: list[dict[str, Any]]) -> dict[str, Any]:
    by_id = defaultdict(list)
    by_prompt = defaultdict(list)
    by_skeleton = defaultdict(list)
    by_topic = defaultdict(list)
    for row in rows:
        by_id[row.get("id")].append(row)
        prompt = str(row.get("prompt") or "").strip().lower()
        if prompt:
            by_prompt[prompt].append(row)
        skeleton = row.get("skeletonKey")
        if skeleton:
            by_skeleton[skeleton].append(row)
        topic = row.get("topicKey")
        if topic:
            by_topic[topic].append(row)

    duplicate_ids = [
        {"id": key, "count": len(items), "sourceFiles": sorted({item.get("sourceFile") for item in items})}
        for key, items in by_id.items()
        if key and len(items) > 1
    ]
    duplicate_prompts = [
        {
            "prompt": key[:240],
            "count": len(items),
            "ids": [item.get("id") for item in items[:20]],
            "sourceFiles": sorted({item.get("sourceFile") for item in items}),
        }
        for key, items in by_prompt.items()
        if len(items) > 1
    ]
    repeated_skeletons = [
        {
            "skeletonKey": key,
            "count": len(items),
            "ids": [item.get("id") for item in items[:20]],
            "sourceFiles": sorted({item.get("sourceFile") for item in items}),
        }
        for key, items in sorted(by_skeleton.items(), key=lambda item: len(item[1]), reverse=True)
        if len(items) > 5
    ]
    top_topics = [
        {
            "topicKey": key,
            "count": len(items),
            "ids": [item.get("id") for item in items[:20]],
            "sourceFiles": sorted({item.get("sourceFile") for item in items}),
        }
        for key, items in sorted(by_topic.items(), key=lambda item: len(item[1]), reverse=True)[:50]
    ]
    return {
        "duplicateIdCount": len(duplicate_ids),
        "duplicateIds": duplicate_ids[:50],
        "exactDuplicatePromptCount": len(duplicate_prompts),
        "exactDuplicatePrompts": duplicate_prompts[:50],
        "repeatedSkeletonCountOver5": len(repeated_skeletons),
        "repeatedSkeletonsOver5": repeated_skeletons[:50],
        "topTopics": top_topics,
    }


def domain_alignment(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    result: dict[str, list[dict[str, Any]]] = {}
    for section, targets in row_audit.SAT_DOMAIN_TARGETS.items():
        section_rows = [row for row in rows if row.get("section") == section]
        total = len(section_rows)
        counts = Counter(row.get("domain") for row in section_rows)
        result[section] = [
            {
                "domain": domain,
                "count": counts[domain],
                "actualPct": pct(counts[domain], total),
                "satTargetPct": target,
                "deltaPctPoints": round(pct(counts[domain], total) - target, 1) if total else 0,
            }
            for domain, target in targets.items()
        ]
    return result


def audit_rows() -> list[dict[str, Any]]:
    seen: dict[str, str] = {}
    rows = []
    for question in row_audit.iter_questions():
        if question.get("reviewStatus") == "rejected" or str(question.get("publicationStatus") or "").startswith("rejected"):
            rows.append(row_audit.audit_question(question, {}))
        else:
            rows.append(row_audit.audit_question(question, seen))
    return rows


def main() -> None:
    rows = audit_rows()
    active = active_rows(rows)
    rows_by_bank = defaultdict(list)
    for row in rows:
        rows_by_bank[row.get("sourceFile") or "Unknown"].append(row)

    by_bank = {bank: bank_summary(bank_rows) for bank, bank_rows in sorted(rows_by_bank.items())}
    severity = Counter(row.get("severity") for row in rows)
    active_severity = Counter(row.get("severity") for row in active)
    review = Counter(row.get("reviewStatus") or "Unknown" for row in rows)
    issues = Counter(issue for row in rows for issue in row.get("issues", []))
    active_issues = Counter(issue for row in active for issue in row.get("issues", []))
    warnings = Counter(warning for row in rows for warning in row.get("warnings", []))
    pass_needs_review = [
        row
        for row in rows
        if row.get("severity") == "pass" and row.get("reviewStatus") not in {"reviewed", "rejected"}
    ]
    fail_reviewed = [
        row
        for row in active
        if row.get("severity") == "fail" and row.get("reviewStatus") == "reviewed"
    ]

    report = {
        "summary": {
            "totalQuestions": len(rows),
            "activeQuestions": len(active),
            "bySeverity": dict(severity),
            "activeBySeverity": dict(active_severity),
            "byReviewStatus": dict(review),
            "bySourceFile": {bank: len(bank_rows) for bank, bank_rows in sorted(rows_by_bank.items())},
            "bySection": dict(Counter(row.get("section") or "Unknown" for row in rows)),
            "byDifficulty": dict(Counter(row.get("difficulty") or "Unknown" for row in rows)),
            "topIssues": dict(issues.most_common(30)),
            "activeTopIssues": dict(active_issues.most_common(30)),
            "topWarnings": dict(warnings.most_common(30)),
            "passNeedsReviewCount": len(pass_needs_review),
            "passNeedsReviewByBank": dict(Counter(row.get("sourceFile") for row in pass_needs_review)),
            "failReviewedCount": len(fail_reviewed),
            "failReviewedByBank": dict(Counter(row.get("sourceFile") for row in fail_reviewed)),
            "answerChoiceDistribution": answer_distribution(active),
            "studentProducedResponseDistribution": spr_distribution(active),
            "domainAlignment": domain_alignment(active),
        },
        "byBank": by_bank,
        "duplicatesAndDiversity": duplicate_summary(rows),
        "criticalRows": [row for row in rows if row.get("severity") == "fail"],
        "passNeedsReviewRows": pass_needs_review[:500],
        "failReviewedRows": fail_reviewed[:500],
    }

    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = [
            "id",
            "sourceFile",
            "sourceIndex",
            "sourceType",
            "section",
            "domain",
            "skill",
            "difficulty",
            "questionType",
            "correctAnswer",
            "reviewStatus",
            "visibility",
            "publicationStatus",
            "severity",
            "issues",
            "warnings",
            "governance",
            "topicKey",
            "skeletonKey",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            csv_row = dict(row)
            for key in ["issues", "warnings", "governance"]:
                csv_row[key] = ";".join(csv_row.get(key) or [])
            writer.writerow({key: csv_row.get(key) for key in fieldnames})

    compact = {
        "totalQuestions": report["summary"]["totalQuestions"],
        "activeQuestions": report["summary"]["activeQuestions"],
        "bySeverity": report["summary"]["bySeverity"],
        "activeBySeverity": report["summary"]["activeBySeverity"],
        "byReviewStatus": report["summary"]["byReviewStatus"],
        "passNeedsReviewByBank": report["summary"]["passNeedsReviewByBank"],
        "failReviewedByBank": report["summary"]["failReviewedByBank"],
        "topIssues": report["summary"]["topIssues"],
        "activeTopIssues": report["summary"]["activeTopIssues"],
        "answerChoiceDistribution": report["summary"]["answerChoiceDistribution"],
        "studentProducedResponseDistribution": report["summary"]["studentProducedResponseDistribution"],
        "outputs": {"json": str(OUT_JSON.relative_to(ROOT)), "csv": str(OUT_CSV.relative_to(ROOT))},
    }
    print(json.dumps(compact, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
