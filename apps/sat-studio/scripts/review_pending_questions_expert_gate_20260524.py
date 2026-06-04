"""Strict pedagogical review gate for pending SAT Studio questions.

The goal is not to rubber-stamp pending content. A question is promoted to
reviewed only when it passes structural integrity, SAT-domain fit, answer
integrity, explanation depth, and trap/distractor teaching checks.
"""

from __future__ import annotations

import csv
import json
import re
import shutil
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from scripts import audit_antigravity_bank as row_audit
    from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
    from scripts.math_verifier import all_explanation_text, is_grid_in, values_equivalent, verify_math_answer
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from math_verifier import all_explanation_text, is_grid_in, values_equivalent, verify_math_answer


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
VERSION = "expert-pedagogical-review-2026-05-24"
TARGET = "Digital SAT 2024-2026, grade 10 to SAT 1600 self-study"
OUT_JSON = DATA_DIR / "pending-question-expert-review-report-20260524.json"
OUT_CSV = DATA_DIR / "pending-question-expert-review-report-20260524.csv"
LETTERS = ("A", "B", "C", "D")
SCHEMA_BLOCKER_CHANGES = {
    "multi_value_multiple_choice_correct_answer_requires_human_review",
}
GENERATION_DRAFT_PATTERNS = [
    r"\bHmm\b",
    r"\bWait:",
    r"\bRedesign:",
    r"\bLet me recalculate\b",
    r"\banswer should be\b",
    r"\bcorrect answer should be\b",
    r"\bI need\b",
    r"\bOops\b",
]


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


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def normalized_prompt(value: Any) -> str:
    return clean(value).lower()


def normalize_choice_list(choices: Any) -> dict[str, str] | None:
    if not isinstance(choices, list):
        return None
    output: dict[str, str] = {}
    for index, choice in enumerate(choices):
        if isinstance(choice, dict):
            letter = str(choice.get("letter") or choice.get("key") or "").strip().upper()
            text = choice.get("text")
            if text is None:
                text = choice.get("value")
            if text is None:
                text = choice.get("label")
        else:
            letter = LETTERS[index] if index < len(LETTERS) else ""
            text = choice
        if not letter and index < len(LETTERS):
            letter = LETTERS[index]
        if letter in LETTERS:
            output[letter] = str(text or "").strip()
    if set(output.keys()) == set(LETTERS):
        return {letter: output[letter] for letter in LETTERS}
    return None


def explanation_parts(question: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        distractors = explanation.get("distractors") if isinstance(explanation.get("distractors"), dict) else {}
        return clean(explanation.get("correct")), distractors
    return clean(explanation), {}


def is_rejected_or_blocked(question: dict[str, Any]) -> bool:
    publication = str(question.get("publicationStatus") or "")
    pool = question.get("practicePool") or (question.get("skeletonDiversity") or {}).get("practicePool")
    quality_gate = question.get("qualityGate") if isinstance(question.get("qualityGate"), dict) else {}
    return (
        question.get("reviewStatus") == "rejected"
        or publication.startswith("rejected")
        or question.get("visibility") == "blocked"
        or pool == "hidden_duplicate"
        or quality_gate.get("status") == "blocked"
    )


def is_pending(question: dict[str, Any]) -> bool:
    return not is_rejected_or_blocked(question) and question.get("reviewStatus") != "reviewed"


def normalize_safe_schema(question: dict[str, Any]) -> list[str]:
    changes: list[str] = []
    choices = question.get("choices")
    qid = str(question.get("id") or "")
    correct_raw = question.get("correctAnswer")
    if isinstance(correct_raw, list):
        values = [str(value).strip() for value in correct_raw if str(value or "").strip()]
        if values:
            question["correctAnswer"] = values[0]
            if len(values) == 1:
                changes.append("collapsed_single_value_correct_answer_list")
            elif choices in (None, {}, []):
                question["acceptableAnswers"] = values
                changes.append("converted_correct_answer_list_to_acceptable_answers")
            else:
                changes.append("multi_value_multiple_choice_correct_answer_requires_human_review")
    choices = question.get("choices")
    if isinstance(choices, list):
        normalized_choices = normalize_choice_list(choices)
        if normalized_choices:
            question["choices"] = normalized_choices
            choices = normalized_choices
            changes.append("normalized_choice_list_to_A_D_dict")
        else:
            changes.append("choice_list_not_normalizable_requires_human_review")
    correct = str(question.get("correctAnswer") or "").strip()
    if qid.startswith("antigravity-hard-"):
        defaults = {
            "sourceType": "antigravity",
            "visibility": "private_family",
            "sourceName": "Antigravity hard Algebra/Advanced Math expansion",
            "licenseNote": "Antigravity-generated original. Private family study copy until SAT Studio expert review passes.",
            "publicationStatus": "needs_review_expert_gate",
            "targetBand": question.get("targetBand") or "1350-1600",
        }
        for key, value in defaults.items():
            if not question.get(key):
                question[key] = value
                changes.append(f"set_{key}")
        if not question.get("reviewStatus"):
            question["reviewStatus"] = "needs_review"
            changes.append("set_reviewStatus")
    if question.get("section") == "Math" and choices in (None, {}, []) and correct:
        if question.get("questionType") != "student_produced_response":
            question["questionType"] = "student_produced_response"
            changes.append("set_student_produced_response_question_type")
        question.pop("choices", None)
        if not question.get("acceptableAnswers"):
            question["acceptableAnswers"] = [correct]
            changes.append("added_acceptable_answers")
    elif isinstance(choices, dict) and set(choices.keys()) == set(LETTERS):
        if question.get("questionType") != "multiple_choice":
            question["questionType"] = "multiple_choice"
            changes.append("set_multiple_choice_question_type")
    return changes


def text_blobs(question: dict[str, Any]) -> list[str]:
    blobs = [str(question.get("prompt") or "")]
    choices = question.get("choices")
    if isinstance(choices, dict):
        blobs.extend(str(choices.get(letter) or "") for letter in LETTERS)
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        blobs.append(str(explanation.get("correct") or ""))
        distractors = explanation.get("distractors")
        if isinstance(distractors, dict):
            blobs.extend(str(value or "") for value in distractors.values())
    else:
        blobs.append(str(explanation or ""))
    for key in ("distractorExplanations", "distractorRationales"):
        value = question.get(key)
        if isinstance(value, dict):
            blobs.extend(str(item or "") for item in value.values())
    return blobs


def symbol_quality_issues(question: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    joined = " ".join(text_blobs(question))
    latex_command = re.search(r"\\(?:frac|sqrt|left|right|times|cdot)|\\[()]", joined)
    latex_delimited = False
    for match in re.finditer(r"(?<!\\)\$([^$\n]{1,120})(?<!\\)\$", joined):
        inner = match.group(1).strip()
        currency_leading = re.match(r"^\d+(?:,\d{3})*(?:\.\d+)?(?:/[a-z]+)?(?:\b|[ .?])", inner.lower())
        leading_math_operator = re.match(r"^\d+(?:,\d{3})*(?:\.\d+)?\s*[+\-=^]", inner)
        currency_fragment = re.fullmatch(r"\d+(?:,\d{3})*(?:\.\d+)?(?:/[a-z]+)?\s*[+\-]?\s*", inner.lower())
        if currency_fragment:
            continue
        if currency_leading and not leading_math_operator:
            continue
        currency_like = re.match(
            r"^\d+(?:,\d{3})*(?:\.\d+)?(?:/[a-z]+)?\s*(?:and|bill|bills|dollar|dollars|usd|with|totaling|\?|$)",
            inner.lower(),
        )
        math_like = (
            re.search(r"\\|=|\^|_|[+\-*/]|[a-zA-Z]\(", inner)
            or re.search(r"\d\s*[a-zA-Z]|[a-zA-Z]\s*\d", inner)
            or re.fullmatch(r"[a-zA-Z](?:_\d+|\^\d+)?", inner)
        )
        if math_like and not currency_like:
            latex_delimited = True
            break
    stray_math_dollar = re.search(r"(?<!\\)\$\s*[A-Za-z][A-Za-z0-9_]*\s*(?:=|\^|_|\()", joined)
    if latex_command or latex_delimited or stray_math_dollar:
        issues.append("raw_latex_or_math_delimiter_visible")
    if question.get("section") == "Math":
        # Flag only standalone variable/number spacing artifacts such as
        # "x 2" or "2 x". The older pattern matched the last letter of a
        # normal word before a number, e.g. "is 8", causing many false
        # positives in SAT word problems with units.
        # Check each field separately so adjacent answer choices such as
        # "x > 5" and "x < 5" do not become the artificial string "5 x".
        variable = r"(?<![A-Za-z])(?:b|c|d|k|n|p|q|r|t|x|y)(?![A-Za-z])"
        if any(
            re.search(rf"{variable}[ \t]+\d+(?:\b|/)", blob) or re.search(rf"\b\d+[ \t]+{variable}\b", blob)
            for blob in text_blobs(question)
        ):
            issues.append("possible_missing_math_operator_or_inequality_symbol")
        if any(
            re.search(r"\b[a-z]/\d+[a-z]\b", blob) or re.search(r"\b\d+/\d+[a-z]\b", blob)
            for blob in text_blobs(question)
        ):
            issues.append("ambiguous_fraction_coefficient_notation")
    return sorted(set(issues))


def generation_artifact_issues(question: dict[str, Any]) -> list[str]:
    joined = " ".join(text_blobs(question))
    issues = []
    for pattern in GENERATION_DRAFT_PATTERNS:
        if re.search(pattern, joined, re.I):
            issues.append("generation_draft_note_visible")
            break
    return issues


def equivalent_choice_issues(question: dict[str, Any]) -> list[str]:
    if question.get("section") != "Math" or is_grid_in(question):
        return []
    choices = question.get("choices")
    correct = question.get("correctAnswer")
    if not isinstance(choices, dict) or correct not in choices:
        return []
    issues = []
    correct_value = choices.get(correct)
    for letter in LETTERS:
        if letter == correct or letter not in choices:
            continue
        if values_equivalent(correct_value, choices.get(letter)):
            issues.append(f"choice_{letter}_equivalent_to_correct_choice")
    return issues


def active_reviewed_prompt_index() -> dict[str, str]:
    index: dict[str, str] = {}
    for question in row_audit.iter_questions():
        if is_rejected_or_blocked(question) or question.get("reviewStatus") != "reviewed":
            continue
        prompt = normalized_prompt(question.get("prompt"))
        if prompt:
            index[prompt] = str(question.get("id") or question.get("_auditId") or "")
    return index


def previous_audit_summary(question: dict[str, Any]) -> dict[str, Any]:
    audit = question.get("contentAudit")
    if not isinstance(audit, dict):
        return {}
    return {
        "version": audit.get("version"),
        "verdict": audit.get("verdict"),
        "bucket": audit.get("bucket"),
        "severity": audit.get("severity"),
    }


def stamp_reviewed(question: dict[str, Any], row: dict[str, Any], schema_changes: list[str], checked_at: str) -> None:
    question["reviewStatus"] = "reviewed"
    if question.get("visibility") == "public_candidate":
        question["publicationStatus"] = "public_candidate_reviewed"
    elif question.get("visibility") == "private_family":
        question["publicationStatus"] = "private_reviewed"
    else:
        question["publicationStatus"] = "reviewed"
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["postReviewUse"] = "unified_mixed_sat_pool"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "pass",
        "reviewer": "Codex SAT expert pedagogical gate",
        "checkedAt": checked_at,
        "target": TARGET,
        "checks": [
            "sat_blueprint_domain_fit",
            "answer_key_and_choice_integrity",
            "math_answer_consistency_where_machine_verifiable",
            "no_duplicate_or_equivalent_correct_choices",
            "no_visible_symbol_corruption",
            "correct_explanation_depth",
            "wrong_choice_or_error_teaching",
            "self-study_readiness",
        ],
        "schemaChanges": schema_changes,
        "metrics": {
            "promptWords": row.get("promptWords"),
            "explanationWords": row.get("explanationWords"),
            "correctExplanationWords": row.get("correctExplanationWords"),
            "distractorExplanationCount": row.get("distractorExplanationCount"),
        },
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "reviewed",
        "target": TARGET,
        "criteria": [
            "accurate enough for student-facing practice",
            "teaches the tested move, not just the answer",
            "identifies traps or common errors when applicable",
            "usable for grade 10 to SAT 1600 progression",
        ],
    }


def stamp_needs_review(
    question: dict[str, Any],
    row: dict[str, Any],
    blockers: list[str],
    schema_changes: list[str],
    checked_at: str,
    ) -> None:
    question["reviewStatus"] = "needs_review"
    verdict = "fail" if blockers or row.get("issues") else "needs_review"
    question["publicationStatus"] = "blocked_needs_review_expert_gate"
    if blockers or row.get("issues"):
        bucket = "accuracy_or_structure_repair_required"
    elif row.get("depthFlags"):
        bucket = "pedagogical_depth_upgrade_required"
    else:
        bucket = "human_quality_review_required"
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["postReviewUse"] = "pending_expert_pedagogical_review"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": verdict,
        "reviewer": "Codex SAT expert pedagogical gate",
        "checkedAt": checked_at,
        "target": TARGET,
        "bucket": bucket,
        "blockers": blockers,
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
        "depthFlags": row.get("depthFlags") or [],
        "schemaChanges": schema_changes,
        "metrics": {
            "promptWords": row.get("promptWords"),
            "explanationWords": row.get("explanationWords"),
            "correctExplanationWords": row.get("correctExplanationWords"),
            "distractorExplanationCount": row.get("distractorExplanationCount"),
        },
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "needs_review",
        "target": TARGET,
        "bucket": bucket,
        "blockers": blockers,
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
        "depthFlags": row.get("depthFlags") or [],
    }


def review_pending() -> dict[str, Any]:
    checked_at = now_iso()
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    reviewed_prompt_index = active_reviewed_prompt_index()
    current_pending_prompts: dict[str, str] = {}
    report_rows: list[dict[str, Any]] = []
    backups: list[str] = []
    summary = Counter()
    by_file: dict[str, Counter] = {}
    blocker_counts = Counter()
    depth_counts = Counter()
    warning_counts = Counter()
    issue_counts = Counter()

    for filename in row_audit.QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload, questions = load_payload(path)
        if not questions:
            continue
        file_counter = Counter()
        changed = False

        for index, question in enumerate(questions):
            if not isinstance(question, dict) or not is_pending(question):
                continue
            before = json.dumps(question, ensure_ascii=False, sort_keys=True)
            schema_changes = normalize_safe_schema(question)
            normalized = row_audit.normalize_question(question, filename, index) or question
            row = reviewed_issue_row(normalized, {})
            blockers = []
            blockers.extend(change for change in schema_changes if change in SCHEMA_BLOCKER_CHANGES)
            blockers.extend(symbol_quality_issues(normalized))
            blockers.extend(generation_artifact_issues(normalized))
            blockers.extend(equivalent_choice_issues(normalized))

            prompt = normalized_prompt(normalized.get("prompt"))
            qid = str(normalized.get("id") or question.get("id") or f"{filename}#{index}")
            if prompt and prompt in reviewed_prompt_index:
                blockers.append(f"duplicate_prompt_with_reviewed:{reviewed_prompt_index[prompt]}")
            elif prompt and prompt in current_pending_prompts:
                blockers.append(f"duplicate_prompt_with_pending:{current_pending_prompts[prompt]}")
            elif prompt:
                current_pending_prompts[prompt] = qid

            math_check = verify_math_answer(normalized) if normalized.get("section") == "Math" else {"issues": [], "warnings": []}
            blockers = sorted(set(blockers))
            issue_counts.update(row.get("issues") or [])
            warning_counts.update(row.get("warnings") or [])
            depth_counts.update(row.get("depthFlags") or [])
            blocker_counts.update(blockers)

            pass_gate = not blockers and not row.get("issues") and not row.get("warnings") and not row.get("depthFlags")
            if pass_gate:
                stamp_reviewed(question, row, schema_changes, checked_at)
                decision = "reviewed"
                summary["reviewed"] += 1
                file_counter["reviewed"] += 1
            else:
                stamp_needs_review(question, row, blockers, schema_changes, checked_at)
                decision = "needs_review"
                summary["needs_review"] += 1
                file_counter["needs_review"] += 1

            after = json.dumps(question, ensure_ascii=False, sort_keys=True)
            if after != before:
                changed = True
                file_counter["changed"] += 1

            report_rows.append(
                {
                    "decision": decision,
                    "id": qid,
                    "sourceFile": filename,
                    "sourceIndex": index,
                    "section": normalized.get("section"),
                    "domain": normalized.get("domain"),
                    "skill": normalized.get("skill"),
                    "difficulty": normalized.get("difficulty"),
                    "questionType": "student_produced_response" if is_grid_in(normalized) else "multiple_choice",
                    "blockers": ";".join(blockers),
                    "issues": ";".join(row.get("issues") or []),
                    "warnings": ";".join(row.get("warnings") or []),
                    "depthFlags": ";".join(row.get("depthFlags") or []),
                    "promptWords": row.get("promptWords"),
                    "explanationWords": row.get("explanationWords"),
                    "correctExplanationWords": row.get("correctExplanationWords"),
                    "distractorExplanationCount": row.get("distractorExplanationCount"),
                    "mathIssues": ";".join(math_check.get("issues") or []),
                    "mathWarnings": ";".join(math_check.get("warnings") or []),
                    "schemaChanges": ";".join(schema_changes),
                    "requiredAction": required_action(blockers, row),
                }
            )

        if changed:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            backup_path = ARTIFACTS_DIR / f"{path.stem}-before-expert-pending-review-{timestamp}.json"
            shutil.copy2(path, backup_path)
            backups.append(str(backup_path))
            write_payload(path, payload)
        if file_counter:
            by_file[filename] = file_counter

    report = {
        "version": VERSION,
        "checkedAt": checked_at,
        "target": TARGET,
        "summary": dict(summary),
        "byFile": {filename: dict(counter) for filename, counter in by_file.items()},
        "blockerCounts": dict(blocker_counts.most_common()),
        "issueCounts": dict(issue_counts.most_common()),
        "warningCounts": dict(warning_counts.most_common()),
        "depthFlagCounts": dict(depth_counts.most_common()),
        "backups": backups,
        "reviewedSample": [row for row in report_rows if row["decision"] == "reviewed"][:50],
        "needsReviewSample": [row for row in report_rows if row["decision"] == "needs_review"][:100],
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = [
            "decision",
            "id",
            "sourceFile",
            "sourceIndex",
            "section",
            "domain",
            "skill",
            "difficulty",
            "questionType",
            "blockers",
            "issues",
            "warnings",
            "depthFlags",
            "promptWords",
            "explanationWords",
            "correctExplanationWords",
            "distractorExplanationCount",
            "mathIssues",
            "mathWarnings",
            "schemaChanges",
            "requiredAction",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows({key: row.get(key) for key in fieldnames} for row in report_rows)
    return report


def required_action(blockers: list[str], row: dict[str, Any]) -> str:
    if any("equivalent_to_correct_choice" in blocker for blocker in blockers):
        return "Rewrite answer choices so exactly one option is correct."
    if any("generation_draft_note_visible" in blocker for blocker in blockers):
        return "Remove visible generation notes, then re-check the answer key and explanation."
    if any(
        "symbol" in blocker or "notation" in blocker or "operator" in blocker or "latex" in blocker or "delimiter" in blocker
        for blocker in blockers
    ):
        return "Repair math notation or visible symbols, then rerun the expert gate."
    if row.get("issues"):
        return "Fix structural or answer-integrity issue before approval."
    flags = row.get("depthFlags") or []
    if any("distractor" in flag for flag in flags):
        return "Add specific wrong-choice trap explanations tied to the prompt."
    if flags:
        return "Expand the correct-answer explanation so the item can teach self-study."
    if row.get("warnings"):
        return "Resolve warning or send to human expert spot-check."
    return "Ready."


if __name__ == "__main__":
    print(json.dumps(review_pending(), indent=2, ensure_ascii=False))
