"""Audit and enforce the strict expert gate across the whole question system.

Reviewed means student-facing ready. This pass applies safe curriculum and
calculator metadata, then demotes reviewed rows that do not meet the strict
pedagogical standard: SAT blueprint fit, reliable answer, sufficient
explanation, wrong-choice trap teaching, and complete routing tags.
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
    from scripts.math_verifier import is_grid_in
    from scripts.review_pending_questions_expert_gate_20260524 import (
        equivalent_choice_issues,
        normalize_safe_schema,
        symbol_quality_issues,
    )
    from scripts.tag_curriculum_metadata import (
        canonical_skill,
        estimated_time_seconds,
        inferred_micro_skill,
        module_placement,
        target_band,
    )
    from scripts.tag_trap_types import tag_question as reviewed_trap_tags
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from math_verifier import is_grid_in
    from review_pending_questions_expert_gate_20260524 import (
        equivalent_choice_issues,
        normalize_safe_schema,
        symbol_quality_issues,
    )
    from tag_curriculum_metadata import (
        canonical_skill,
        estimated_time_seconds,
        inferred_micro_skill,
        module_placement,
        target_band,
    )
    from tag_trap_types import tag_question as reviewed_trap_tags


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
TAXONOMY_PATH = DATA_DIR / "canonical-sat-taxonomy.json"
OUT_JSON = DATA_DIR / "all-question-expert-pedagogical-audit-20260524.json"
OUT_CSV = DATA_DIR / "all-question-expert-pedagogical-audit-20260524.csv"
VERSION = "all-question-expert-gate-2026-05-24"
CALCULATOR_VERSION = "calculator-strategy-tags-2026-05-24"
TARGET = "Digital SAT 2024-2026, grade 10 to SAT 1600"
LETTERS = ("A", "B", "C", "D")


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def load_payload(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
        return payload, payload["questions"]
    if isinstance(payload, list):
        return payload, payload
    return payload, []


def write_payload(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def is_rejected_or_blocked(question: dict[str, Any]) -> bool:
    publication = str(question.get("publicationStatus") or "")
    pool = str(question.get("practicePool") or (question.get("skeletonDiversity") or {}).get("practicePool") or "")
    quality_gate = question.get("qualityGate") if isinstance(question.get("qualityGate"), dict) else {}
    return (
        question.get("reviewStatus") == "rejected"
        or publication.startswith("rejected")
        or question.get("visibility") == "blocked"
        or pool == "hidden_duplicate"
        or quality_gate.get("status") == "blocked"
    )


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


def taxonomy_maps() -> tuple[dict[tuple[str, str], set[str]], set[tuple[str, str]], set[str], dict[str, tuple[str, str]]]:
    taxonomy = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    canonical_by_domain: dict[tuple[str, str], set[str]] = {}
    valid_domain_pairs: set[tuple[str, str]] = set()
    canonical_values: set[str] = set()
    canonical_location: dict[str, tuple[str, str]] = {}
    for section, section_data in taxonomy["sections"].items():
        for domain, domain_data in section_data["domains"].items():
            if domain == "Calculator Strategy":
                continue
            valid_domain_pairs.add((section, domain))
            skills = set(domain_data.get("canonicalSkills", {}).keys())
            canonical_by_domain[(section, domain)] = skills
            canonical_values.update(skills)
            for skill in skills:
                canonical_location[skill] = (section, domain)
    return canonical_by_domain, valid_domain_pairs, canonical_values, canonical_location


CANONICAL_BY_DOMAIN, VALID_DOMAIN_PAIRS, CANONICAL_VALUES, CANONICAL_LOCATION = taxonomy_maps()


def question_text(question: dict[str, Any]) -> str:
    parts = [str(question.get("prompt") or ""), str(question.get("skill") or ""), str(question.get("domain") or "")]
    choices = question.get("choices")
    if isinstance(choices, dict):
        parts.extend(str(choices.get(letter) or "") for letter in LETTERS)
    return " ".join(parts).lower()


def calculator_metadata(question: dict[str, Any], canonical: str) -> dict[str, Any]:
    text = question_text(question)
    if question.get("section") != "Math":
        return {}
    desmos_markers = [
        "graph",
        "intersection",
        "intersect",
        "system",
        "parabola",
        "vertex",
        "x-intercept",
        "y-intercept",
        "root",
        "zero",
        "scatter",
        "line of best fit",
        "model",
        "table",
        "regression",
        "inequality",
    ]
    useful = any(marker in text for marker in desmos_markers) or canonical in {
        "Systems of two linear equations in two variables",
        "Systems of equations in two variables",
        "Nonlinear functions",
    }
    tags = ["calculator_allowed_all_math"]
    if useful:
        tags.append("desmos_useful")
    if any(marker in text for marker in ["scatter", "line of best fit", "regression", "table"]):
        tags.append("table_or_regression")
        strategy = "Use Desmos table/graph features to verify the model or data relationship."
    elif any(marker in text for marker in ["system", "intersection", "intersect"]):
        tags.append("equation_intersection")
        strategy = "Desmos can verify intersections, but algebra should still identify the requested value."
    elif any(marker in text for marker in ["parabola", "vertex", "root", "zero", "x-intercept"]):
        tags.append("function_features")
        strategy = "Desmos is useful for checking roots, intercepts, or vertex behavior."
    elif "inequality" in text:
        tags.append("inequality_check")
        strategy = "Use Desmos to check boundary behavior only after setting up the inequality."
    else:
        tags.append("algebra_first")
        strategy = "Algebraic or mental solution is faster; calculator is mainly for verification."
    return {
        "version": CALCULATOR_VERSION,
        "calculatorAllowed": True,
        "desmosUseful": useful,
        "strategy": strategy,
        "tags": tags,
    }


def apply_safe_tags(question: dict[str, Any]) -> tuple[list[str], list[str]]:
    changes: list[str] = []
    tag_issues: list[str] = []
    if is_rejected_or_blocked(question):
        return changes, tag_issues

    schema_changes = normalize_safe_schema(question)
    changes.extend(schema_changes)
    canonical = canonical_skill(question)
    canonical_section_domain = CANONICAL_LOCATION.get(canonical)
    if canonical_section_domain:
        section, domain = canonical_section_domain
        if question.get("section") != section:
            question["section"] = section
            changes.append("set_section_from_canonicalSkill")
        if question.get("domain") != domain:
            question["domain"] = domain
            changes.append("set_domain_from_canonicalSkill")
    micro = inferred_micro_skill(question, canonical)
    band = target_band(question, canonical)
    placement = module_placement(question, band)
    seconds = estimated_time_seconds(question, band)
    desired = {
        "canonicalSkill": canonical,
        "microSkill": micro,
        "targetBand": band,
        "modulePlacement": placement,
        "estimatedTimeSeconds": seconds,
        "curriculumMetadataVersion": VERSION,
    }
    for key, value in desired.items():
        if question.get(key) != value:
            question[key] = value
            changes.append(f"set_{key}")

    if (question.get("section"), question.get("domain")) not in VALID_DOMAIN_PAIRS:
        tag_issues.append("domain_not_in_canonical_sat_taxonomy")
    if canonical not in CANONICAL_VALUES:
        tag_issues.append("canonicalSkill_not_in_taxonomy")
    elif canonical not in CANONICAL_BY_DOMAIN.get((question.get("section"), question.get("domain")), set()):
        tag_issues.append("canonicalSkill_domain_mismatch")
    if not micro or micro.lower() == "unknown":
        tag_issues.append("missing_microSkill")
    if not question.get("targetBand"):
        tag_issues.append("missing_targetBand")
    if not question.get("modulePlacement"):
        tag_issues.append("missing_modulePlacement")
    if not question.get("estimatedTimeSeconds"):
        tag_issues.append("missing_estimatedTimeSeconds")

    calc = calculator_metadata(question, canonical)
    if question.get("section") == "Math":
        for key, value in {
            "calculatorUse": calc,
            "desmosUseful": calc.get("desmosUseful"),
            "calculatorStrategy": calc.get("strategy"),
            "calculatorTags": calc.get("tags"),
            "calculatorPolicyVersion": CALCULATOR_VERSION,
        }.items():
            if question.get(key) != value:
                question[key] = value
                changes.append(f"set_{key}")
        if not question.get("calculatorUse") or question.get("desmosUseful") is None or not question.get("calculatorStrategy"):
            tag_issues.append("missing_calculator_strategy_tags")

    if question.get("reviewStatus") == "reviewed" and not is_grid_in(question):
        trap_tags = reviewed_trap_tags(question)
        if trap_tags:
            if question.get("trapTypes") != trap_tags:
                question["trapTypes"] = trap_tags
                changes.append("set_trapTypes")
            if question.get("trapTypesVersion") != "trap-types-v1-2026-05-20":
                question["trapTypesVersion"] = "trap-types-v1-2026-05-20"
                changes.append("set_trapTypesVersion")
        else:
            tag_issues.append("missing_trapTypes_for_reviewed_mc")

    return changes, sorted(set(tag_issues))


def strict_review_failures(question: dict[str, Any], row: dict[str, Any], tag_issues: list[str], prompt_duplicate: str = "") -> list[str]:
    failures: list[str] = []
    failures.extend(row.get("issues") or [])
    failures.extend(row.get("warnings") or [])
    failures.extend(row.get("depthFlags") or [])
    failures.extend(symbol_quality_issues(question))
    failures.extend(equivalent_choice_issues(question))
    failures.extend(tag_issues)
    if prompt_duplicate:
        failures.append(prompt_duplicate)
    return sorted(set(failures))


def required_action(failures: list[str]) -> str:
    text = ";".join(failures)
    if "equivalent_to_correct_choice" in text or "mc_duplicate_choice_text" in text:
        return "Rewrite choices so exactly one answer is correct."
    if "symbol" in text or "notation" in text or "operator" in text or "latex" in text:
        return "Repair math notation or rendered symbols, then rerun the expert gate."
    if "canonicalSkill" in text or "taxonomy" in text or "calculator" in text or "targetBand" in text:
        return "Fix curriculum/calculator routing tags."
    if "distractor" in text or "trap" in text:
        return "Add specific wrong-choice trap explanations tied to the prompt."
    if "thin_" in text or "hard_item_low_total_rationale" in text:
        return "Expand explanation into a self-study-ready solution."
    if "explanation_does_not_mention_correct_answer" in text:
        return "Make the explanation explicitly justify the credited answer."
    return "Expert review required before approval."


def demote_reviewed(question: dict[str, Any], failures: list[str], row: dict[str, Any], checked_at: str) -> None:
    question["reviewStatus"] = "needs_review"
    question["publicationStatus"] = "needs_review_expert_gate"
    question["postReviewUse"] = "pending_expert_pedagogical_review"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "needs_review",
        "reviewer": "Codex SAT all-system expert gate",
        "checkedAt": checked_at,
        "target": TARGET,
        "bucket": "reviewed_row_failed_strict_pedagogical_gate",
        "failures": failures,
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
        "depthFlags": row.get("depthFlags") or [],
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
        "bucket": "failed_strict_pedagogical_gate",
        "failures": failures,
    }


def enforce_all() -> dict[str, Any]:
    checked_at = now_iso()
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    reviewed_prompt_seen: dict[str, str] = {}
    rows_out: list[dict[str, Any]] = []
    summary = Counter()
    by_file: dict[str, Counter] = {}
    failure_counts = Counter()
    tag_issue_counts = Counter()
    tag_change_counts = Counter()
    backups: list[str] = []

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
            if not isinstance(question, dict) or is_rejected_or_blocked(question):
                continue
            before = json.dumps(question, ensure_ascii=False, sort_keys=True)
            was_reviewed = question.get("reviewStatus") == "reviewed"
            tag_changes, tag_issues = apply_safe_tags(question)
            tag_change_counts.update(tag_changes)
            tag_issue_counts.update(tag_issues)

            normalized = row_audit.normalize_question(question, filename, index) or question
            prompt = clean(normalized.get("prompt")).lower()
            duplicate_failure = ""
            if was_reviewed and prompt:
                if prompt in reviewed_prompt_seen:
                    duplicate_failure = f"duplicate_prompt_with_reviewed:{reviewed_prompt_seen[prompt]}"
                else:
                    reviewed_prompt_seen[prompt] = str(question.get("id") or f"{filename}#{index}")

            row = reviewed_issue_row(normalized, {}) if was_reviewed else {}
            failures = strict_review_failures(normalized, row, tag_issues, duplicate_failure) if was_reviewed else tag_issues
            failure_counts.update(failures)

            decision = "kept_reviewed" if was_reviewed else "not_reviewed_audited"
            if was_reviewed and failures:
                demote_reviewed(question, failures, row, checked_at)
                decision = "demoted_to_needs_review"
                summary["demotedReviewed"] += 1
                file_counter["demotedReviewed"] += 1
            elif was_reviewed:
                summary["keptReviewed"] += 1
                file_counter["keptReviewed"] += 1
            else:
                summary["notReviewedAudited"] += 1
                file_counter["notReviewedAudited"] += 1

            after = json.dumps(question, ensure_ascii=False, sort_keys=True)
            if after != before:
                changed = True
                file_counter["changed"] += 1

            rows_out.append(
                {
                    "decision": decision,
                    "id": question.get("id") or f"{filename}#{index}",
                    "sourceFile": filename,
                    "sourceIndex": index,
                    "reviewStatusBefore": "reviewed" if was_reviewed else str(question.get("reviewStatus") or "Unknown"),
                    "section": normalized.get("section"),
                    "domain": normalized.get("domain"),
                    "skill": normalized.get("skill"),
                    "canonicalSkill": question.get("canonicalSkill"),
                    "microSkill": question.get("microSkill"),
                    "difficulty": normalized.get("difficulty"),
                    "questionType": "student_produced_response" if is_grid_in(normalized) else "multiple_choice",
                    "targetBand": question.get("targetBand"),
                    "modulePlacement": question.get("modulePlacement"),
                    "estimatedTimeSeconds": question.get("estimatedTimeSeconds"),
                    "desmosUseful": question.get("desmosUseful"),
                    "calculatorTags": ";".join(question.get("calculatorTags") or []),
                    "failures": ";".join(failures),
                    "tagIssues": ";".join(tag_issues),
                    "tagChanges": ";".join(tag_changes),
                    "requiredAction": required_action(failures),
                    "promptWords": row.get("promptWords") if row else "",
                    "explanationWords": row.get("explanationWords") if row else "",
                    "correctExplanationWords": row.get("correctExplanationWords") if row else "",
                    "distractorExplanationCount": row.get("distractorExplanationCount") if row else "",
                }
            )

        if changed:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            backup_path = ARTIFACTS_DIR / f"{path.stem}-before-all-question-expert-gate-{timestamp}.json"
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
        "topFailureCounts": dict(failure_counts.most_common(80)),
        "topTagIssueCounts": dict(tag_issue_counts.most_common(50)),
        "topTagChangeCounts": dict(tag_change_counts.most_common(50)),
        "backups": backups,
        "demotedSample": [row for row in rows_out if row["decision"] == "demoted_to_needs_review"][:120],
        "keptReviewedSample": [row for row in rows_out if row["decision"] == "kept_reviewed"][:80],
        "outputCsv": str(OUT_CSV.relative_to(ROOT)),
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = [
            "decision",
            "id",
            "sourceFile",
            "sourceIndex",
            "reviewStatusBefore",
            "section",
            "domain",
            "skill",
            "canonicalSkill",
            "microSkill",
            "difficulty",
            "questionType",
            "targetBand",
            "modulePlacement",
            "estimatedTimeSeconds",
            "desmosUseful",
            "calculatorTags",
            "failures",
            "tagIssues",
            "tagChanges",
            "requiredAction",
            "promptWords",
            "explanationWords",
            "correctExplanationWords",
            "distractorExplanationCount",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows({key: row.get(key) for key in fieldnames} for row in rows_out)
    return report


if __name__ == "__main__":
    print(json.dumps(enforce_all(), indent=2, ensure_ascii=False))
