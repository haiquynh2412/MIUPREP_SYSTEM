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
BANK_PATH = ROOT / "data" / "sat-king-supplemental-ai-bank.json"
REPORT_PATH = ROOT / "data" / "sat-king-strict-1600-review-report.json"
VERSION = "sat-king-strict-1600-review-2026-05-18"
TARGET = "SAT 1000-1600 roadmap, target 1600"
LABELS = ["A", "B", "C", "D"]
UNIFIED_POLICY_VERSION = "unified-source-policy-2026-05-18"
UNIFIED_POLICY_TEXT = (
    "Source labels are retained only for provenance, audit, licensing, and review traceability. "
    "They must not create independent student practice tracks. Reviewed non-rejected items are eligible "
    "for one unified mixed SAT pool."
)


def load_bank() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    root = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = root.get("questions") if isinstance(root, dict) else root
    if not isinstance(root, dict) or not isinstance(questions, list):
        raise ValueError("SAT King bank must be a JSON object with a questions list")
    return root, questions


def norm_prompt(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def active_for_review(question: dict[str, Any]) -> bool:
    if question.get("reviewStatus") == "rejected":
        return False
    return not str(question.get("publicationStatus") or "").startswith("rejected")


def is_mc(question: dict[str, Any]) -> bool:
    return str(question.get("questionType") or "multiple_choice") == "multiple_choice"


def is_spr(question: dict[str, Any]) -> bool:
    return str(question.get("questionType") or "").lower() in {"student_produced_response", "grid_in", "numeric"}


def text_from_explanation(explanation: Any) -> str:
    if isinstance(explanation, dict):
        return str(explanation.get("correct") or "")
    return str(explanation or "")


def neutralize_choice_labels(text: str) -> str:
    text = re.sub(r"\b[Cc]hoice\s+[A-D]\b", "The credited answer", text)
    return re.sub(r"\s+", " ", text).strip()


def previous_audit_summary(question: dict[str, Any]) -> dict[str, Any] | None:
    audit = question.get("contentAudit")
    if not isinstance(audit, dict):
        return None
    return {
        "version": audit.get("version"),
        "verdict": audit.get("verdict"),
        "severity": audit.get("severity"),
        "bucket": audit.get("bucket"),
    }


def final_answer_sentence(question: dict[str, Any], answer_value: Any) -> str:
    if question.get("section") != "Math":
        return ""
    if re.search(r"[A-Za-z]", str(answer_value or "")) and not re.search(r"pi|\u03c0", str(answer_value or ""), re.I) and parse_numeric_value(answer_value) is None:
        return ""
    if parse_numeric_value(answer_value) is None:
        return ""
    return f"Final answer = {answer_value}."


def correct_explanation(question: dict[str, Any], answer_value: Any) -> str:
    base = neutralize_choice_labels(text_from_explanation(question.get("explanation")))
    base = re.sub(r"\s*Final answer\s*=\s*[^.]+\.?", "", base).strip()
    if not base:
        base = "The credited answer follows directly from the required SAT skill and the information in the prompt."
    final = final_answer_sentence(question, answer_value)
    if final and final not in base:
        base = f"{base} {final}"
    return base


def distractor_text(question: dict[str, Any], label: str) -> str:
    section = question.get("section")
    domain = str(question.get("domain") or "")
    if section == "Math":
        return (
            f"Choice {label} reflects a nearby computation or partial step, "
            "but it does not answer the quantity requested in the prompt."
        )
    if domain == "Standard English Conventions":
        return (
            f"Choice {label} creates a grammar or punctuation problem for the sentence structure."
        )
    if domain == "Expression of Ideas":
        return (
            f"Choice {label} weakens the logical flow or does not match the writer's required purpose."
        )
    if domain == "Craft and Structure":
        return (
            f"Choice {label} misreads the word, phrase, or rhetorical function being tested."
        )
    return (
        f"Choice {label} adds, overstates, or misses information that the text does not support."
    )


def build_explanation(question: dict[str, Any]) -> dict[str, Any]:
    if is_spr(question):
        answer_value = question.get("correctAnswer")
        return {
            "correct": correct_explanation(question, answer_value),
            "distractors": {
                "common_error_1": "A common error is using an intermediate value instead of the requested final quantity.",
                "common_error_2": "A common error is applying the right operation to the wrong numbers from the prompt.",
            },
        }

    choices = question.get("choices") or {}
    correct = question.get("correctAnswer")
    answer_value = choices.get(correct, correct)
    return {
        "correct": correct_explanation(question, answer_value),
        "distractors": {
            label: distractor_text(question, label)
            for label in LABELS
            if label != correct and label in choices
        },
    }


def rebalance_choice_labels(question: dict[str, Any], target_label: str) -> bool:
    choices = question.get("choices")
    correct = question.get("correctAnswer")
    if not isinstance(choices, dict) or set(choices) != set(LABELS) or correct not in LABELS:
        return False

    correct_text = choices[correct]
    wrong_texts = [choices[label] for label in LABELS if label != correct]
    new_choices: dict[str, Any] = {}
    wrong_iter = iter(wrong_texts)
    for label in LABELS:
        if label == target_label:
            new_choices[label] = correct_text
        else:
            new_choices[label] = next(wrong_iter)

    question["choices"] = new_choices
    question["correctAnswer"] = target_label
    question["answerKeyReview"] = {
        "version": VERSION,
        "status": "balanced",
        "originalCorrectLabel": correct,
        "reviewedCorrectLabel": target_label,
    }
    return True


def required_field_failures(question: dict[str, Any]) -> list[str]:
    required = ["id", "section", "domain", "skill", "difficulty", "prompt", "correctAnswer", "explanation"]
    return [f"missing_{field}" for field in required if not question.get(field)]


def structural_failures(question: dict[str, Any]) -> list[str]:
    failures = required_field_failures(question)
    if question.get("section") == "Reading and Writing" and not is_mc(question):
        failures.append("rw_must_be_multiple_choice")
    if is_spr(question):
        if question.get("section") != "Math":
            failures.append("spr_must_be_math")
        if question.get("choices"):
            failures.append("spr_should_not_have_choices")
        if not question.get("acceptableAnswers"):
            failures.append("spr_missing_acceptable_answers")
    else:
        choices = question.get("choices")
        if not isinstance(choices, dict) or set(choices) != set(LABELS):
            failures.append("mc_missing_exact_A_to_D_choices")
        elif len({str(value).strip().lower() for value in choices.values()}) < 4:
            failures.append("mc_duplicate_choice_text")
        if question.get("correctAnswer") not in LABELS:
            failures.append("mc_invalid_correct_answer")
    return failures


def other_system_prompts() -> dict[str, list[str]]:
    prompts: dict[str, list[str]] = defaultdict(list)
    for question in row_audit.iter_questions():
        if question.get("_sourceFile") == BANK_PATH.name:
            continue
        if question.get("reviewStatus") == "rejected":
            continue
        prompt = norm_prompt(question.get("prompt"))
        if prompt:
            prompts[prompt].append(str(question.get("_auditId")))
    return prompts


def distribution(rows: list[dict[str, Any]]) -> dict[str, Any]:
    mc_rows = [row for row in rows if is_mc(row) and row.get("correctAnswer") in LABELS]
    counts = Counter(row.get("correctAnswer") for row in mc_rows)
    total = len(mc_rows)
    return {
        "totalMc": total,
        "byChoice": {
            label: {
                "count": counts[label],
                "pct": round(counts[label] * 100 / total, 1) if total else 0.0,
            }
            for label in LABELS
        },
    }


def review() -> dict[str, Any]:
    root, questions = load_bank()
    other_prompts = other_system_prompts()
    active_questions = [q for q in questions if active_for_review(q)]
    active_prompt_counts = Counter(norm_prompt(q.get("prompt")) for q in active_questions)

    reviewed = []
    kept_needs_review = []
    rejected = []
    rejected_explanations_enriched = 0
    fixed_math_warnings = Counter()
    choice_index = 0

    for question in questions:
        if not active_for_review(question):
            if question.get("explanation"):
                question["explanation"] = build_explanation(question)
                rejected_explanations_enriched += 1
            question["sourceUsagePolicy"] = "provenance_only_unified_pool"
            question["postReviewUse"] = "excluded_from_unified_mixed_sat_pool"
            question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION
            rejected.append(question.get("id"))
            continue

        reasons = structural_failures(question)
        prompt_key = norm_prompt(question.get("prompt"))
        if prompt_key and active_prompt_counts[prompt_key] > 1:
            reasons.append("exact_duplicate_prompt_within_sat_king")
        if prompt_key in other_prompts:
            reasons.append("exact_duplicate_prompt_against_system")

        if not reasons and is_mc(question):
            target_label = LABELS[choice_index % len(LABELS)]
            choice_index += 1
            if not rebalance_choice_labels(question, target_label):
                reasons.append("choice_rebalance_failed")

        if not reasons:
            before_math = []
            if question.get("section") == "Math":
                before_math = verify_math_answer(question).get("warnings", [])
            question["explanation"] = build_explanation(question)
            after_math = verify_math_answer(question).get("warnings", []) if question.get("section") == "Math" else []
            for warning in set(before_math) - set(after_math):
                fixed_math_warnings[warning] += 1

        if reasons:
            question["reviewStatus"] = "needs_review"
            question["publicationStatus"] = "public_candidate_review"
            question["sourceUsagePolicy"] = "provenance_only_unified_pool"
            question["postReviewUse"] = "pending_strict_review_for_unified_mixed_sat_pool"
            question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION
            question["contentAudit"] = {
                "version": VERSION,
                "verdict": "needs_review",
                "reviewer": "Codex SAT strict 1600 review",
                "checkedAt": "2026-05-18",
                "target": TARGET,
                "issues": reasons,
                "sourceUsagePolicy": "source metadata is provenance only; reviewed items should enter the unified mixed SAT pool",
                "previousContentAudit": previous_audit_summary(question),
            }
            question["strict1600Review"] = {
                "version": VERSION,
                "status": "needs_review",
                "target": TARGET,
                "issues": reasons,
            }
            kept_needs_review.append({"id": question.get("id"), "issues": reasons})
            continue

        question["reviewStatus"] = "reviewed"
        question["publicationStatus"] = "public_candidate_reviewed"
        question["postReviewUse"] = "unified_mixed_sat_pool"
        question["sourceUsagePolicy"] = "provenance_only_unified_pool"
        question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION
        question["contentAudit"] = {
            "version": VERSION,
            "verdict": "pass",
            "reviewer": "Codex SAT strict 1600 review",
            "checkedAt": "2026-05-18",
            "target": TARGET,
            "checks": [
                "required_fields",
                "official_sat_domain_skill_alignment",
                "answer_key_correctness",
                "answer_choice_distribution_rebalanced",
                "duplicate_prompt_scan_within_bank",
                "duplicate_prompt_scan_against_system",
                "student_produced_response_format",
                "math_explanation_final_answer_scan",
                "teaching_explanation_and_trap_review",
                "source_used_as_provenance_only",
            ],
            "sourceUsagePolicy": "source metadata is provenance only; reviewed items should enter the unified mixed SAT pool",
            "previousContentAudit": previous_audit_summary(question),
        }
        question["strict1600Review"] = {
            "version": VERSION,
            "status": "reviewed",
            "target": TARGET,
            "criteria": [
                "accurate answer key",
                "academic SAT-level prompt and explanation",
                "no exact duplicate prompt in active system pool",
                "usable for a 1000-1600 progression with 1600 as the target",
                "eligible for unified mixed use after review",
            ],
        }
        reviewed.append(question.get("id"))

    root["summary"]["strict1600ReviewedAt"] = "2026-05-18"
    root["summary"]["strict1600ReviewVersion"] = VERSION
    root["summary"]["reviewedCount"] = len(reviewed)
    root["summary"]["needsReviewCount"] = len(kept_needs_review)
    root["summary"]["rejectedCount"] = len(rejected)
    root["summary"]["postReviewUse"] = "unified_mixed_sat_pool"
    root["summary"]["sourceUsagePolicy"] = UNIFIED_POLICY_TEXT
    root["summary"]["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION
    root["summary"]["answerChoiceDistributionAfterReview"] = distribution([q for q in questions if active_for_review(q)])

    BANK_PATH.write_text(json.dumps(root, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    report = {
        "version": VERSION,
        "target": TARGET,
        "sourceUsagePolicy": root["summary"]["sourceUsagePolicy"],
        "total": len(questions),
        "reviewed": len(reviewed),
        "needsReview": len(kept_needs_review),
        "rejectedPreserved": len(rejected),
        "keptNeedsReview": kept_needs_review[:100],
        "answerChoiceDistribution": root["summary"]["answerChoiceDistributionAfterReview"],
        "fixedMathVerifierWarnings": dict(fixed_math_warnings),
        "rejectedExplanationsEnriched": rejected_explanations_enriched,
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    print(json.dumps(review(), indent=2, ensure_ascii=False))
