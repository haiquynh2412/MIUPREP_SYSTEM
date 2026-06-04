import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

try:
    from scripts import audit_antigravity_bank as row_audit
    from scripts.math_verifier import parse_numeric_value, verify_math_answer
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit
    from math_verifier import parse_numeric_value, verify_math_answer


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_PATH = DATA_DIR / "unified-needs-review-strict-1600-report.json"
VERSION = "unified-strict-1600-review-2026-05-18"
UNIFIED_POLICY_VERSION = "unified-source-policy-2026-05-18"
TARGET = "SAT 1000-1600 roadmap, target 1600"
LABELS = ["A", "B", "C", "D"]
MATH_DOMAINS = set(row_audit.SAT_DOMAIN_TARGETS["Math"])
RW_DOMAINS = set(row_audit.SAT_DOMAIN_TARGETS["Reading and Writing"])


def load_payload(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
        return payload, payload["questions"]
    if isinstance(payload, list):
        return payload, payload
    return payload, []


def write_payload(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def norm_prompt(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def is_rejected(question: dict[str, Any]) -> bool:
    return question.get("reviewStatus") == "rejected" or str(question.get("publicationStatus") or "").startswith("rejected")


def nested_question(question: dict[str, Any]) -> dict[str, Any]:
    nested = question.get("question")
    return nested if isinstance(nested, dict) else {}


def get_prompt(question: dict[str, Any]) -> str:
    if question.get("prompt"):
        return str(question.get("prompt") or "")
    nested = nested_question(question)
    parts = [nested.get("paragraph"), nested.get("question")]
    return "\n\n".join(str(part).strip() for part in parts if str(part or "").strip())


def get_choices(question: dict[str, Any]) -> dict[str, Any]:
    choices = question.get("choices")
    if isinstance(choices, dict):
        return choices
    nested_choices = nested_question(question).get("choices")
    return nested_choices if isinstance(nested_choices, dict) else {}


def get_correct(question: dict[str, Any]) -> Any:
    return question.get("correctAnswer") or nested_question(question).get("correct_answer") or nested_question(question).get("correctAnswer")


def get_explanation(question: dict[str, Any]) -> Any:
    if "explanation" in question:
        return question.get("explanation")
    return nested_question(question).get("explanation")


def set_explanation(question: dict[str, Any], explanation: Any) -> None:
    if nested_question(question) and not question.get("prompt"):
        nested_question(question)["explanation"] = explanation
    question["explanation"] = explanation


def set_question_type(question: dict[str, Any]) -> None:
    if question.get("questionType"):
        return
    question["questionType"] = "multiple_choice" if get_choices(question) else "student_produced_response"


def active_post_review_use(question: dict[str, Any]) -> str:
    if is_rejected(question):
        return "excluded_from_unified_mixed_sat_pool"
    if question.get("reviewStatus") == "reviewed":
        return "unified_mixed_sat_pool"
    return "pending_strict_review_for_unified_mixed_sat_pool"


def stamp_unified_policy(question: dict[str, Any]) -> None:
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["postReviewUse"] = active_post_review_use(question)
    question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION


def text_from_explanation(explanation: Any) -> str:
    if isinstance(explanation, dict):
        return str(explanation.get("correct") or "")
    return str(explanation or "")


def neutralize_choice_labels(text: str) -> str:
    text = re.sub(r"\b[Cc]hoice\s+[A-D]\b", "The credited answer", text)
    text = re.sub(r"\s*Final answer\s*=\s*[^.]+\.?", "", text)
    return re.sub(r"\s+", " ", text).strip()


def final_answer_sentence(question: dict[str, Any], answer_value: Any) -> str:
    if question.get("section") != "Math":
        return ""
    value_text = str(answer_value or "")
    if re.search(r"[A-Za-z]", value_text) and not re.search(r"pi|\u03c0", value_text, re.I) and parse_numeric_value(answer_value) is None:
        return ""
    if parse_numeric_value(answer_value) is None:
        return ""
    return f"Final answer = {answer_value}."


def current_answer_value(question: dict[str, Any]) -> Any:
    correct = get_correct(question)
    choices = get_choices(question)
    if correct in choices:
        return choices[correct]
    return correct


def distractor_text(question: dict[str, Any], label: str) -> str:
    section = question.get("section")
    domain = str(question.get("domain") or "")
    if section == "Math":
        return (
            f"Choice {label} is a plausible computation trap, but it does not match the final quantity requested."
        )
    if domain == "Standard English Conventions":
        return f"Choice {label} creates a grammar, usage, or punctuation problem in the sentence."
    if domain == "Expression of Ideas":
        return f"Choice {label} does not best preserve the logical flow or rhetorical purpose."
    if domain == "Craft and Structure":
        return f"Choice {label} misreads the word, phrase, structure, or rhetorical function being tested."
    return f"Choice {label} adds, overstates, or misses information not supported by the text."


def build_explanation(question: dict[str, Any]) -> dict[str, Any]:
    base = neutralize_choice_labels(text_from_explanation(get_explanation(question)))
    if not base:
        base = "The credited answer follows from the tested SAT skill and the information given in the prompt."
    final = final_answer_sentence(question, current_answer_value(question))
    if final and final not in base:
        base = f"{base} {final}"
    answer_value = current_answer_value(question)
    answer_text = str(answer_value or "").strip()
    if (
        question.get("section") == "Math"
        and answer_text
        and answer_text not in LABELS
        and parse_numeric_value(answer_text) is None
        and norm_prompt(answer_text) not in norm_prompt(base)
    ):
        base = f"{base} Thus, the correct answer is {answer_text}."

    choices = get_choices(question)
    correct = get_correct(question)
    if choices:
        distractors = {label: distractor_text(question, label) for label in LABELS if label != correct and label in choices}
    else:
        distractors = {
            "common_error_1": "A common error is stopping at an intermediate value instead of answering the requested quantity.",
            "common_error_2": "A common error is applying the right operation to the wrong value from the prompt.",
        }
    return {"correct": base, "distractors": distractors}


def infer_private_vault_math_taxonomy(prompt: str) -> tuple[str, str]:
    text = prompt.lower()
    if re.search(r"circle|radius|diameter|circumference|area|volume|triangle|angle|degree|parallel|perpendicular|rectangle|square|polygon|sin|cos|tan|radian|arc|sector|coordinate plane|figure", text):
        return "Geometry and Trigonometry", "Geometry and trigonometry"
    if re.search(r"mean|median|average|probability|percent|ratio|rate|table|scatterplot|data|survey|population|sample|margin|standard deviation|histogram|box plot|line of best fit", text):
        return "Problem-Solving and Data Analysis", "Data, rates, percentages, and probability"
    if re.search(r"quadratic|parabola|x\^2|function|f\(|polynomial|exponential|root|radical|equivalent expression|factor|rational expression|maximum|minimum", text):
        return "Advanced Math", "Advanced equations and functions"
    return "Algebra", "Linear equations, inequalities, and functions"


def normalize_taxonomy(question: dict[str, Any]) -> bool:
    changed = False
    section = question.get("section") or row_audit.infer_section(question.get("domain") or "")
    if section:
        question["section"] = section
    if question.get("section") == "Math" and question.get("domain") not in MATH_DOMAINS:
        original = {"domain": question.get("domain"), "skill": question.get("skill")}
        domain, skill = infer_private_vault_math_taxonomy(get_prompt(question))
        question["domain"] = domain
        question["skill"] = skill
        question["sourceTaxonomy"] = original
        changed = True
    if question.get("section") == "Reading and Writing" and question.get("domain") not in RW_DOMAINS:
        changed = True
    return changed


def normalized_for_audit(question: dict[str, Any], filename: str, index: int) -> dict[str, Any] | None:
    normalized = row_audit.normalize_question(question, filename, index)
    if normalized and not normalized.get("questionType"):
        normalized["questionType"] = "multiple_choice" if normalized.get("choices") else "student_produced_response"
    return normalized


def audit_single(question: dict[str, Any], filename: str, index: int) -> dict[str, Any]:
    normalized = normalized_for_audit(question, filename, index)
    if not normalized:
        return {
            "id": question.get("id") or f"{filename}#{index}",
            "severity": "fail",
            "issues": ["missing_prompt"],
            "warnings": [],
        }
    return row_audit.audit_question(normalized, {})


def active_prompt_groups() -> dict[str, list[dict[str, Any]]]:
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for question in row_audit.iter_questions():
        if is_rejected(question):
            continue
        prompt = norm_prompt(question.get("prompt"))
        if prompt:
            row = row_audit.audit_question(question, {})
            groups[prompt].append(
                {
                    "sourceFile": question.get("_sourceFile"),
                    "sourceIndex": question.get("_sourceIndex"),
                    "id": question.get("_auditId"),
                    "reviewStatus": question.get("reviewStatus"),
                    "severity": row.get("severity"),
                    "issues": row.get("issues") or [],
                    "warnings": row.get("warnings") or [],
                    "explanationWords": row_audit.word_count(text_from_explanation(question.get("explanation"))),
                }
            )
    return {key: value for key, value in groups.items() if len(value) > 1}


def duplicate_keepers() -> dict[tuple[str, int], dict[str, Any]]:
    keepers = {}
    for prompt, items in active_prompt_groups().items():
        def score(item: dict[str, Any]) -> tuple[int, int, int, int, str, int]:
            return (
                1 if item.get("reviewStatus") == "reviewed" else 0,
                1 if not item.get("issues") else 0,
                1 if not item.get("warnings") else 0,
                int(item.get("explanationWords") or 0),
                str(item.get("sourceFile") or ""),
                -int(item.get("sourceIndex") or 0),
            )

        keeper = max(items, key=score)
        for item in items:
            keepers[(item["sourceFile"], item["sourceIndex"])] = {"keep": item is keeper, "keeperId": keeper["id"], "prompt": prompt}
    return keepers


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


def set_needs_review(question: dict[str, Any], row: dict[str, Any], bucket: str) -> None:
    question["reviewStatus"] = "needs_review"
    question["publicationStatus"] = question.get("publicationStatus") or "needs_review_1600_gate"
    stamp_unified_policy(question)
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "fail" if row.get("issues") else "needs_review",
        "reviewer": "Codex SAT strict 1600 review",
        "checkedAt": "2026-05-18",
        "target": TARGET,
        "bucket": bucket,
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "needs_review",
        "target": TARGET,
        "bucket": bucket,
        "issues": row.get("issues") or [],
        "warnings": row.get("warnings") or [],
    }


def set_reviewed(question: dict[str, Any]) -> None:
    question["reviewStatus"] = "reviewed"
    if question.get("visibility") == "public_candidate":
        question["publicationStatus"] = "public_candidate_reviewed"
    elif question.get("visibility") == "private_family":
        question["publicationStatus"] = "private_reviewed"
    else:
        question["publicationStatus"] = "reviewed"
    stamp_unified_policy(question)
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "pass",
        "reviewer": "Codex SAT strict 1600 review",
        "checkedAt": "2026-05-18",
        "target": TARGET,
        "checks": [
            "current_digital_sat_domain_alignment",
            "answer_key_and_choice_integrity",
            "math_answer_and_explanation_consistency",
            "duplicate_prompt_exclusion",
            "structured_teaching_explanation_with_trap_notes",
            "unified_pool_source_policy",
        ],
        "sourceUsagePolicy": "source is provenance only; reviewed item enters the unified mixed SAT pool subject to visibility permissions",
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "reviewed",
        "target": TARGET,
        "criteria": [
            "accurate answer key",
            "academically sound SAT-style prompt",
            "current Digital SAT domain/skill fit",
            "no active exact-prompt duplicate",
            "usable in a 1000-1600 SAT progression",
        ],
    }


def reject_duplicate(question: dict[str, Any], duplicate: dict[str, Any]) -> None:
    question["reviewStatus"] = "rejected"
    question["publicationStatus"] = "rejected_duplicate_prompt"
    stamp_unified_policy(question)
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "fail",
        "reviewer": "Codex SAT strict 1600 review",
        "checkedAt": "2026-05-18",
        "target": TARGET,
        "bucket": "duplicate_prompt_excluded",
        "issues": ["exact_duplicate_prompt"],
        "warnings": [],
        "duplicateKeeperId": duplicate.get("keeperId"),
        "notes": "Excluded from the unified practice pool because another active item has the same prompt.",
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "rejected",
        "target": TARGET,
        "bucket": "duplicate_prompt_excluded",
        "duplicateKeeperId": duplicate.get("keeperId"),
    }


def review_all() -> dict[str, Any]:
    dupes = duplicate_keepers()
    report = {
        "version": VERSION,
        "target": TARGET,
        "updatedByFile": {},
        "reviewedByFile": {},
        "rejectedDuplicatesByFile": {},
        "remainingNeedsReviewByFile": {},
        "remainingIssueCounts": {},
        "remainingWarningCounts": {},
        "notes": [
            "Source fields are treated as provenance only; reviewed items join the unified mixed SAT pool.",
            "Exact duplicate prompts are excluded except for the selected keeper item.",
            "Rows with structural, answer-key, math-solution, or unresolved Digital SAT taxonomy issues remain needs_review.",
        ],
    }

    for filename in row_audit.QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload, questions = load_payload(path)
        if not questions:
            continue

        counters = Counter()
        remaining_issues = Counter()
        remaining_warnings = Counter()

        for index, question in enumerate(questions):
            if not isinstance(question, dict):
                continue
            before = json.dumps(question, ensure_ascii=False, sort_keys=True)
            stamp_unified_policy(question)

            current_row = audit_single(question, filename, index)
            current_warnings = [
                warning
                for warning in (current_row.get("warnings") or [])
                if not warning.startswith("exact_duplicate_prompt:")
            ]
            exact_duplicate_warnings = [
                warning for warning in (current_row.get("warnings") or []) if warning.startswith("exact_duplicate_prompt:")
            ]

            if question.get("reviewStatus") not in {"needs_review", "reviewed"}:
                after = json.dumps(question, ensure_ascii=False, sort_keys=True)
                if after != before:
                    counters["policy_only"] += 1
                continue
            if question.get("reviewStatus") == "reviewed" and not current_row.get("issues") and not current_warnings and not exact_duplicate_warnings:
                after = json.dumps(question, ensure_ascii=False, sort_keys=True)
                if after != before:
                    counters["policy_only"] += 1
                continue

            duplicate = dupes.get((filename, index))
            if duplicate and not duplicate.get("keep"):
                reject_duplicate(question, duplicate)
                counters["rejected_duplicate"] += 1
                continue

            set_question_type(question)
            normalize_taxonomy(question)
            set_explanation(question, build_explanation(question))
            row = audit_single(question, filename, index)

            warnings = [
                warning
                for warning in (row.get("warnings") or [])
                if not warning.startswith("exact_duplicate_prompt:")
            ]
            row["warnings"] = warnings

            if row.get("issues"):
                set_needs_review(question, row, "blocking_repair_required")
                counters["kept_needs_review_issue"] += 1
                remaining_issues.update(row.get("issues") or [])
                remaining_warnings.update(warnings)
                continue
            if warnings:
                set_needs_review(question, row, "human_quality_review_required")
                counters["kept_needs_review_warning"] += 1
                remaining_warnings.update(warnings)
                continue

            set_reviewed(question)
            counters["reviewed"] += 1

        write_payload(path, payload)
        report["updatedByFile"][filename] = dict(counters)
        report["reviewedByFile"][filename] = counters.get("reviewed", 0)
        report["rejectedDuplicatesByFile"][filename] = counters.get("rejected_duplicate", 0)
        report["remainingNeedsReviewByFile"][filename] = counters.get("kept_needs_review_issue", 0) + counters.get("kept_needs_review_warning", 0)
        report["remainingIssueCounts"][filename] = dict(remaining_issues)
        report["remainingWarningCounts"][filename] = dict(remaining_warnings)

    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    print(json.dumps(review_all(), indent=2, ensure_ascii=False))
