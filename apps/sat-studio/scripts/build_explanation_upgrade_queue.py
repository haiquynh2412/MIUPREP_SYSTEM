import csv
import json
from collections import Counter
from pathlib import Path

try:
    from scripts.check_questions import iter_questions
    from scripts.audit_reviewed_question_expert_quality import question_id
except ModuleNotFoundError:
    from check_questions import iter_questions
    from audit_reviewed_question_expert_quality import question_id


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ISSUES_CSV = DATA_DIR / "reviewed-question-expert-audit-issues.csv"
OUT_JSON = DATA_DIR / "explanation-upgrade-queue.json"
OUT_CSV = DATA_DIR / "explanation-upgrade-queue.csv"


def split_flags(value: str) -> set[str]:
    return {part for part in str(value or "").split(";") if part}


def source_map() -> dict[str, dict]:
    return {question_id(question): question for question in iter_questions()}


def has_prefix(flags: set[str], prefix: str) -> bool:
    return any(flag.startswith(prefix) for flag in flags)


def is_antigravity_threshold_only(row: dict) -> bool:
    if row.get("sourceFile") != "antigravity-bank.json":
        return False
    flags = split_flags(row.get("depthFlags"))
    issues = split_flags(row.get("issues"))
    if issues or "generic_distractor_teaching" in flags:
        return False
    allowed = (
        has_prefix(flags, "thin_math_explanation:")
        or has_prefix(flags, "thin_rw_explanation:")
        or has_prefix(flags, "hard_item_low_total_rationale:")
    )
    disallowed = [
        flag
        for flag in flags
        if not (
            flag.startswith("thin_math_explanation:")
            or flag.startswith("thin_rw_explanation:")
            or flag.startswith("hard_item_low_total_rationale:")
        )
    ]
    return allowed and not disallowed


def priority_for(row: dict, question: dict | None) -> tuple[str, str]:
    flags = split_flags(row.get("depthFlags"))
    issues = split_flags(row.get("issues"))
    warnings = split_flags(row.get("warnings"))
    source_type = (question or {}).get("sourceType") or "unknown"
    difficulty = row.get("difficulty")
    section = row.get("section")
    generic = "generic_distractor_teaching" in flags
    hard_math_thin = section == "Math" and difficulty == "Hard" and has_prefix(flags, "thin_math_explanation:")

    if issues:
        return "P0", "accuracy_or_structure_issue_in_reviewed_row"
    if generic and (difficulty == "Hard" or source_type in {"sat_1590", "sat_king"}):
        return "P0", "hard_or_elite_generic_distractor_explanation"
    if hard_math_thin and source_type in {"sat_1590", "sat_king"}:
        return "P0", "elite_hard_math_explanation_too_thin"
    if row.get("sourceFile") == "opensat-pinesat.json" and section == "Reading and Writing":
        return "P1", "opensat_rw_generic_or_weak_rationale"
    if generic:
        return "P1", "generic_distractor_explanation"
    if hard_math_thin:
        return "P1", "hard_math_explanation_too_thin"
    if is_antigravity_threshold_only(row):
        return "P2", "antigravity_threshold_only_has_specific_traps_or_short_rationale"
    if warnings:
        return "P2", "warning_or_polish"
    return "P2", "later_polish"


def sort_key(row: dict) -> tuple:
    priority_rank = {"P0": 0, "P1": 1, "P2": 2}
    difficulty_rank = {"Hard": 0, "Medium": 1, "Easy": 2}
    source_rank = {
        "sat-1590-elite-ai-bank.json": 0,
        "sat-king-supplemental-ai-bank.json": 1,
        "antigravity-bank.json": 2,
        "opensat-pinesat.json": 3,
    }
    return (
        priority_rank.get(row.get("priority"), 9),
        difficulty_rank.get(row.get("difficulty"), 9),
        source_rank.get(row.get("sourceFile"), 9),
        int(row.get("explanationWords") or 9999),
        row.get("id") or "",
    )


def main() -> None:
    questions = source_map()
    rows = []
    with ISSUES_CSV.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            question = questions.get(row.get("id"))
            priority, reason = priority_for(row, question)
            out = {
                "id": row.get("id"),
                "sourceFile": row.get("sourceFile"),
                "sourceIndex": row.get("sourceIndex"),
                "sourceType": (question or {}).get("sourceType") or "unknown",
                "section": row.get("section"),
                "domain": row.get("domain"),
                "skill": row.get("skill"),
                "difficulty": row.get("difficulty"),
                "questionType": row.get("questionType"),
                "practicePool": row.get("practicePool"),
                "priority": priority,
                "reason": reason,
                "severity": row.get("severity"),
                "issues": row.get("issues"),
                "warnings": row.get("warnings"),
                "depthFlags": row.get("depthFlags"),
                "explanationWords": row.get("explanationWords"),
                "correctExplanationWords": row.get("correctExplanationWords"),
                "distractorExplanationCount": row.get("distractorExplanationCount"),
                "topicKey": row.get("topicKey"),
            }
            rows.append(out)
    rows.sort(key=sort_key)

    summary = {
        "source": str(ISSUES_CSV.relative_to(ROOT)),
        "totalQueued": len(rows),
        "byPriority": dict(Counter(row["priority"] for row in rows).most_common()),
        "byReason": dict(Counter(row["reason"] for row in rows).most_common()),
        "bySourceFile": dict(Counter(row["sourceFile"] for row in rows).most_common()),
        "p0BySourceFile": dict(Counter(row["sourceFile"] for row in rows if row["priority"] == "P0").most_common()),
        "p1BySourceFile": dict(Counter(row["sourceFile"] for row in rows if row["priority"] == "P1").most_common()),
        "p2BySourceFile": dict(Counter(row["sourceFile"] for row in rows if row["priority"] == "P2").most_common()),
        "notes": [
            "Antigravity rows with specific traps but short correct explanations are intentionally P2, not P0.",
            "P0 should be handled before expansion; P1 can be batched; P2 is later polish.",
        ],
    }
    OUT_JSON.write_text(json.dumps({"summary": summary, "items": rows}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = list(rows[0].keys()) if rows else []
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
