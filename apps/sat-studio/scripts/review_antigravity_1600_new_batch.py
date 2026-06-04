import argparse
import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from scripts.audit_antigravity_bank import skeleton_key, topic_key
    from scripts.audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row, word_count
    from scripts.review_unified_needs_review_bank import audit_single, load_payload, norm_prompt, write_payload
    from scripts.upgrade_antigravity_p1_hard_math_explanations import upgraded_explanation
except ModuleNotFoundError:
    from audit_antigravity_bank import skeleton_key, topic_key
    from audit_reviewed_question_expert_quality import pedagogical_depth_flags, reviewed_issue_row, word_count
    from review_unified_needs_review_bank import audit_single, load_payload, norm_prompt, write_payload
    from upgrade_antigravity_p1_hard_math_explanations import upgraded_explanation


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "antigravity-bank.json"
REPORT_JSON = ROOT / "data" / "antigravity-1600-new-review-report.json"
REPORT_CSV = ROOT / "data" / "antigravity-1600-new-review-report.csv"

VERSION = "antigravity-1600-new-batch-review-2026-05-20"
TARGET = "SAT 1000-1600 roadmap, target 1600"
CORE_LIMIT_PER_SKELETON = 8
SOURCE_FILE = "antigravity-bank.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def clean_text(value: Any) -> str:
    return " ".join(str(value or "").split())


def strip_prior_review_scaffold(text: Any) -> str:
    value = clean_text(text)
    for _ in range(4):
        stripped = re.sub(r"^Choice [A-D] is correct: .*? The source calculation is:\s*", "", value)
        if stripped == value:
            break
        value = stripped
    value = re.sub(r"\s*Method: .*?(?=\s+Trap check:|\s+Final answer\b|\s+This extra check\b|$)", "", value)
    value = re.sub(r"\s*Trap check: .*?(?=\s+Final answer\b|\s+This extra check\b|$)", "", value)
    value = re.sub(r"\s*Final answer\s*=\s*.*?(?=\.($|\s))\.?", "", value)
    value = re.sub(r"\s*This extra check matters.*$", "", value)
    return clean_text(value)


def explanation_word_total(question: dict[str, Any]) -> int:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        parts = [explanation.get("correct"), *((explanation.get("distractors") or {}).values())]
        return word_count(" ".join(str(part or "") for part in parts))
    return word_count(explanation)


def distractor_count(question: dict[str, Any]) -> int:
    explanation = question.get("explanation")
    if isinstance(explanation, dict) and isinstance(explanation.get("distractors"), dict):
        return len(explanation["distractors"])
    return 0


def target_indices(questions: list[dict[str, Any]]) -> list[int]:
    indices = []
    for index, question in enumerate(questions):
        if not isinstance(question, dict):
            continue
        if question.get("sourceType") != "antigravity":
            continue
        stamped_by_this_review = (question.get("contentAudit") or {}).get("version") == VERSION
        if question.get("reviewStatus") != "needs_review" and not stamped_by_this_review:
            continue
        if not str(question.get("id") or "").startswith("antigravity-1600-"):
            continue
        indices.append(index)
    return indices


def duplicate_keepers(questions: list[dict[str, Any]], indices: list[int]) -> tuple[set[int], dict[int, int]]:
    by_prompt: dict[str, list[int]] = defaultdict(list)
    for index in indices:
        prompt = norm_prompt(questions[index].get("prompt"))
        if prompt:
            by_prompt[prompt].append(index)

    keepers: set[int] = set()
    duplicate_to_keeper: dict[int, int] = {}
    for group in by_prompt.values():
        if len(group) == 1:
            keepers.add(group[0])
            continue

        def score(index: int) -> tuple[int, int, int]:
            question = questions[index]
            return (distractor_count(question), explanation_word_total(question), -index)

        keeper = max(group, key=score)
        keepers.add(keeper)
        for index in group:
            if index != keeper:
                duplicate_to_keeper[index] = keeper
    return keepers, duplicate_to_keeper


def semantic_topic(question: dict[str, Any]) -> str:
    prompt = clean_text(question.get("prompt")).lower()
    skill = clean_text(question.get("skill"))
    if "investment increases" in prompt:
        return "exponential growth model"
    if "radioactive substance decays" in prompt:
        return "exponential decay base rewrite"
    if "bacterial colony" in prompt or "population doubles" in prompt:
        return "exponential doubling model"
    if "widgets" in prompt or "maximum monthly budget" in prompt:
        return "linear inequality constraints"
    if "region defined" in prompt and "contains" in prompt:
        return "linear inequality region conditions"
    if "no solution" in prompt and "system" in prompt:
        return "linear system no-solution condition"
    if "\\frac{x}{a}" in prompt or "\\frac{x}{b}" in prompt:
        return "symmetric linear system"
    if "remainder" in prompt:
        return "polynomial remainder theorem"
    if "sqrt" in prompt or "\\sqrt" in prompt:
        return "radical expression rewrite"
    if "\\frac" in prompt and "equivalent" in prompt:
        return "rational expression rewrite"
    return skill or topic_key({"prompt": question.get("prompt")}) or "SAT Math hard item"


def choose_core_by_skeleton(questions: list[dict[str, Any]], active_indices: set[int]) -> set[int]:
    by_skeleton: dict[str, list[int]] = defaultdict(list)
    for index in active_indices:
        key = skeleton_key(questions[index].get("prompt"))
        by_skeleton[key].append(index)

    core: set[int] = set()
    for _, group in by_skeleton.items():
        if len(group) <= CORE_LIMIT_PER_SKELETON:
            core.update(group)
            continue
        by_answer: dict[str, list[int]] = defaultdict(list)
        for index in sorted(group):
            by_answer[str(questions[index].get("correctAnswer") or "")].append(index)

        picked: list[int] = []
        labels = ["A", "B", "C", "D", ""]
        while len(picked) < CORE_LIMIT_PER_SKELETON and any(by_answer.values()):
            labels = sorted(labels, key=lambda label: (sum(1 for index in picked if str(questions[index].get("correctAnswer") or "") == label), label))
            for label in labels:
                bucket = by_answer.get(label) or []
                if bucket and len(picked) < CORE_LIMIT_PER_SKELETON:
                    picked.append(bucket.pop(0))
        core.update(picked)
    return core


def previous_audit_summary(question: dict[str, Any]) -> dict[str, Any]:
    audit = question.get("contentAudit")
    if not isinstance(audit, dict):
        return {}
    return {
        "version": audit.get("version"),
        "verdict": audit.get("verdict"),
        "severity": audit.get("severity"),
        "bucket": audit.get("bucket"),
    }


def stamp_hidden_duplicate(question: dict[str, Any], keeper: dict[str, Any], checked_at: str) -> None:
    question["reviewStatus"] = "rejected"
    question["visibility"] = "private_family"
    question["publicationStatus"] = "rejected_duplicate_prompt"
    question["practicePool"] = "hidden_duplicate"
    question["postReviewUse"] = "hidden_duplicate_rejected_template"
    question["lifecycleState"] = "rejected_hidden_duplicate"
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["unifiedPoolPolicyVersion"] = "unified-source-policy-2026-05-18"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "fail",
        "reviewer": "Codex SAT expert review",
        "checkedAt": checked_at,
        "target": TARGET,
        "bucket": "exact_duplicate_prompt_hidden",
        "issues": ["exact_duplicate_prompt_within_new_antigravity_1600_batch"],
        "duplicateKeeperId": keeper.get("id"),
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "rejected_hidden_duplicate",
        "target": TARGET,
        "keeperId": keeper.get("id"),
    }


def normalized_for_expert_audit(question: dict[str, Any], index: int) -> dict[str, Any]:
    row = dict(question)
    row["_sourceFile"] = SOURCE_FILE
    row["_sourceIndex"] = index
    return row


def stamp_needs_review(question: dict[str, Any], row: dict[str, Any], depth_flags: list[str], checked_at: str) -> None:
    question["reviewStatus"] = "needs_review"
    question["publicationStatus"] = question.get("publicationStatus") or "needs_review_1600_gate"
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["postReviewUse"] = "pending_strict_review_for_unified_mixed_sat_pool"
    question["unifiedPoolPolicyVersion"] = "unified-source-policy-2026-05-18"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "needs_review",
        "reviewer": "Codex SAT expert review",
        "checkedAt": checked_at,
        "target": TARGET,
        "bucket": "blocked_after_new_antigravity_review",
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
        "depthFlags": depth_flags,
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "needs_review",
        "target": TARGET,
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
        "depthFlags": depth_flags,
    }


def stamp_reviewed(question: dict[str, Any], practice_pool: str, checked_at: str, skeleton_count: int) -> None:
    question["reviewStatus"] = "reviewed"
    question["visibility"] = question.get("visibility") or "private_family"
    question["publicationStatus"] = "private_reviewed" if question.get("visibility") == "private_family" else "reviewed"
    question["practicePool"] = practice_pool
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["postReviewUse"] = "unified_mixed_sat_pool"
    question["unifiedPoolPolicyVersion"] = "unified-source-policy-2026-05-18"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "pass",
        "reviewer": "Codex SAT expert review",
        "checkedAt": checked_at,
        "target": TARGET,
        "checks": [
            "current_digital_sat_domain_skill_alignment",
            "answer_key_and_choice_integrity",
            "math_answer_and_explanation_consistency",
            "structured_self_study_explanation",
            "specific_wrong_answer_trap_notes",
            "exact_duplicate_prompt_exclusion",
            "skeleton_clone_pool_control",
        ],
        "practicePoolDecision": practice_pool,
        "activeRowsInSkeletonBeforePoolCap": skeleton_count,
        "coreLimitPerSkeleton": CORE_LIMIT_PER_SKELETON,
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "reviewed",
        "target": TARGET,
        "criteria": [
            "accurate answer key",
            "SAT Math Algebra or Advanced Math fit",
            "hard-item explanation depth sufficient for self-study",
            "all wrong choices include trap guidance",
            "clone overload routed away from normal practice when needed",
        ],
    }
    notes = question.get("expertRepairNotes")
    if not isinstance(notes, dict):
        notes = {}
    notes["antigravity1600NewBatchReviewVersion"] = VERSION
    question["expertRepairNotes"] = notes
    if practice_pool == "remedial_pool":
        question["topicGovernance"] = {
            "policyVersion": VERSION,
            "topic": question.get("topic"),
            "action": "remedial_skeleton_overflow",
            "updatedAt": checked_at,
            "updatedBy": "scripts/review_antigravity_1600_new_batch.py",
            "reason": "Hard Antigravity template clone kept for targeted remediation but excluded from normal core rotation.",
            "coreLimitPerSkeleton": CORE_LIMIT_PER_SKELETON,
            "activeRowsInSkeletonBeforePoolCap": skeleton_count,
        }


def prepare_question(question: dict[str, Any]) -> None:
    question["section"] = "Math"
    question["difficulty"] = question.get("difficulty") or "Hard"
    question["questionType"] = "multiple_choice" if isinstance(question.get("choices"), dict) else "student_produced_response"
    question["topic"] = semantic_topic(question)
    if not question.get("domain"):
        question["domain"] = "Advanced Math" if "nonlinear" in clean_text(question.get("skill")).lower() else "Algebra"
    existing = question.get("explanation")
    if isinstance(existing, dict):
        question["explanation"] = {
            "correct": strip_prior_review_scaffold(existing.get("correct")),
            "distractors": existing.get("distractors") if isinstance(existing.get("distractors"), dict) else {},
        }
    elif existing:
        question["explanation"] = strip_prior_review_scaffold(existing)
    question["explanation"] = upgraded_explanation(question)


def main() -> None:
    parser = argparse.ArgumentParser(description="Review and repair the new antigravity-1600 needs_review batch.")
    parser.add_argument("--apply", action="store_true", help="Write the review decisions to data/antigravity-bank.json.")
    args = parser.parse_args()

    payload, questions = load_payload(DATA_PATH)
    indices = target_indices(questions)
    keepers, duplicate_to_keeper = duplicate_keepers(questions, indices)
    active_indices = set(indices) - set(duplicate_to_keeper)
    core_indices = choose_core_by_skeleton(questions, active_indices)
    skeleton_sizes = Counter(skeleton_key(questions[index].get("prompt")) for index in active_indices)
    checked_at = now_iso()

    rows: list[dict[str, Any]] = []
    summary = {
        "apply": args.apply,
        "version": VERSION,
        "targetCount": len(indices),
        "exactDuplicateHidden": 0,
        "reviewedCore": 0,
        "reviewedRemedial": 0,
        "stillNeedsReview": 0,
        "byDomain": {},
        "bySkill": {},
        "byTopic": {},
    }

    for index in indices:
        question = questions[index]
        if index in duplicate_to_keeper:
            keeper = questions[duplicate_to_keeper[index]]
            stamp_hidden_duplicate(question, keeper, checked_at)
            summary["exactDuplicateHidden"] += 1
            rows.append(
                {
                    "id": question.get("id"),
                    "sourceIndex": index,
                    "decision": "hidden_exact_duplicate",
                    "practicePool": "hidden_duplicate",
                    "keeperId": keeper.get("id"),
                    "issues": "exact_duplicate_prompt_within_new_antigravity_1600_batch",
                    "depthFlags": "",
                }
            )
            continue

        prepare_question(question)
        structural = audit_single(question, SOURCE_FILE, index)
        expert = reviewed_issue_row(normalized_for_expert_audit(question, index), {})
        warnings = [
            warning
            for warning in (structural.get("warnings") or []) + (expert.get("warnings") or [])
            if not str(warning).startswith(("exact_duplicate_prompt:", "duplicate_prompt_with:"))
        ]
        issues = (structural.get("issues") or []) + (expert.get("issues") or [])
        depth_flags = pedagogical_depth_flags(normalized_for_expert_audit(question, index))
        if issues or warnings or depth_flags:
            row = {"issues": issues, "warnings": warnings}
            stamp_needs_review(question, row, depth_flags, checked_at)
            summary["stillNeedsReview"] += 1
            decision = "still_needs_review"
            practice_pool = question.get("practicePool") or ""
        else:
            practice_pool = "core_pool" if index in core_indices else "remedial_pool"
            stamp_reviewed(question, practice_pool, checked_at, skeleton_sizes[skeleton_key(question.get("prompt"))])
            if practice_pool == "core_pool":
                summary["reviewedCore"] += 1
                decision = "reviewed_core"
            else:
                summary["reviewedRemedial"] += 1
                decision = "reviewed_remedial"

        rows.append(
            {
                "id": question.get("id"),
                "sourceIndex": index,
                "decision": decision,
                "practicePool": practice_pool,
                "keeperId": "",
                "section": question.get("section"),
                "domain": question.get("domain"),
                "skill": question.get("skill"),
                "topic": question.get("topic"),
                "correctAnswer": question.get("correctAnswer"),
                "explanationWords": explanation_word_total(question),
                "distractorCount": distractor_count(question),
                "issues": ";".join(issues) if "issues" in locals() else "",
                "warnings": ";".join(warnings) if "warnings" in locals() else "",
                "depthFlags": ";".join(depth_flags) if "depth_flags" in locals() else "",
            }
        )

    active_questions = [questions[index] for index in active_indices]
    summary["byDomain"] = dict(Counter(question.get("domain") for question in active_questions).most_common())
    summary["bySkill"] = dict(Counter(question.get("skill") for question in active_questions).most_common())
    summary["byTopic"] = dict(Counter(question.get("topic") for question in active_questions).most_common())
    summary["reviewedTotal"] = summary["reviewedCore"] + summary["reviewedRemedial"]
    summary["coreLimitPerSkeleton"] = CORE_LIMIT_PER_SKELETON

    REPORT_JSON.write_text(json.dumps({"summary": summary, "items": rows}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with REPORT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = [
            "id",
            "sourceIndex",
            "decision",
            "practicePool",
            "keeperId",
            "section",
            "domain",
            "skill",
            "topic",
            "correctAnswer",
            "explanationWords",
            "distractorCount",
            "issues",
            "warnings",
            "depthFlags",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fieldnames})

    if args.apply:
        write_payload(DATA_PATH, payload)
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
