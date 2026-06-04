import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

try:
    from scripts import audit_antigravity_bank as row_audit
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit
    from review_unified_needs_review_bank import load_payload, write_payload


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OPENSAT_PATH = DATA_DIR / "opensat-pinesat.json"
REPORT_PATH = DATA_DIR / "opensat-quality-remediation-report.json"
VERSION = "opensat-quality-remediation-2026-05-20"
UNIFIED_POLICY_VERSION = "unified-source-policy-2026-05-18"
TARGET = "SAT 1000-1600 roadmap, target 1600"
LABELS = ["A", "B", "C", "D"]


TRAP_EXPLANATIONS = {
    "main_idea_scope_error": "It is too broad, too narrow, or shifts the central claim away from what the text actually supports.",
    "rhetorical_function_misread": "It misidentifies what the sentence or detail is doing in the passage.",
    "punctuation_boundary_error": "It creates or preserves a sentence-boundary or punctuation problem.",
    "grammar_form_error": "It creates a grammar, agreement, or form problem in the sentence.",
    "context_meaning_error": "It does not fit the meaning required by the surrounding context.",
    "unsupported_inference": "It goes beyond what the text supports.",
    "unsupported_claim": "It introduces a claim that is not established by the passage.",
    "scope_error": "It changes the scope of the statement being tested.",
    "text_relationship_misread": "It misreads the relationship between the ideas in the text.",
    "wrong_logical_transition": "It gives the wrong logical relationship between the connected ideas.",
    "tone_or_connotation_mismatch": "It does not match the tone or connotation required by the context.",
    "goal_or_note_selection_error": "It fails to use the notes to accomplish the stated writing goal.",
    "evidence_mismatch": "It does not provide the evidence required by the question.",
    "partial_system_solution": "It stops after only part of the algebraic or functional relationship has been used.",
    "intermediate_value_error": "It uses an intermediate value instead of the quantity requested.",
    "sign_error": "It reflects a sign error in the computation.",
    "algebra_setup_or_boundary_error": "It comes from setting up or applying the algebraic relationship incorrectly.",
    "invalid_algebraic_manipulation": "It comes from an invalid algebraic transformation.",
    "factoring_or_cancellation_error": "It comes from factoring or canceling terms incorrectly.",
    "wrong_statistic_or_denominator": "It uses the wrong denominator, statistic, or comparison group.",
    "wrong_base_rate_or_unit": "It uses the wrong base quantity, rate, or unit.",
    "wrong_base_or_unit": "It uses the wrong base quantity or unit.",
    "circle_measure_confusion": "It confuses radius, diameter, circumference, or area.",
    "geometry_ratio_or_theorem_error": "It applies the wrong geometric relationship or theorem.",
    "wrong_geometry_formula_or_measure": "It uses the wrong geometric formula or requested measure.",
    "linear_feature_confusion": "It confuses a slope, intercept, value, or other feature of a linear relationship.",
}


GENERIC_DISTRACTOR_MARKERS = [
    "plausible computation trap",
    "does not match the final quantity requested",
    "adds, overstates, or misses information",
    "creates a grammar, usage, or punctuation problem",
    "it may look related",
    "previous note:",
]


MANUAL_CORRECT_EXPLANATIONS = {
    "9f6f8f8f": (
        "Of the 60 people who like apples, 20 also like bananas. The question asks for people who like only apples, "
        "so subtract the overlap from the apple total: 60 - 20 = 40. Final answer = 40."
    ),
    "83d2d1d7": (
        "Use the rectangle area formula A = length x width. The area is 180 and the length is 15, so "
        "180 = 15w. Dividing by 15 gives w = 12. Final answer = 12."
    ),
}


def clean_space(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def strip_literal_null(value: Any) -> str:
    text = str(value or "")
    if text.strip().lower() == "null":
        return ""
    text = re.sub(r"(?i)^\s*null\s+", "", text)
    text = re.sub(r"(?i)(:\s*)null\s+", r"\1", text)
    return text


def clean_latex_wrappers(text: str) -> str:
    text = re.sub(r"\\begin\{[^{}]+\}(?:\{[^{}]*\})?", " ", text)
    text = re.sub(r"\\end\{[^{}\s.]+\}?", " ", text)
    text = re.sub(r"\\begin\{(?:align\*?|center)\}", " ", text)
    text = re.sub(r"\\end\{(?:align\*?|center)\}", " ", text)
    text = text.replace("\\hline", " ")
    text = re.sub(r"\\text\{([^{}]*)\}", r"\1", text)
    text = text.replace("\\\\", "; ")
    return text


def clean_text(value: Any) -> str:
    text = strip_literal_null(value)
    text = clean_latex_wrappers(text)
    text = re.sub(r"\s*Previous note:.*$", "", text, flags=re.I | re.S)
    text = re.sub(r"\.{2,}", ".", text)
    text = re.sub(r"\s+([.,;:!?])", r"\1", text)
    text = re.sub(r"([.!?])([A-Z])", r"\1 \2", text)
    return clean_space(text)


def nested_question(question: dict[str, Any]) -> dict[str, Any]:
    nested = question.get("question")
    return nested if isinstance(nested, dict) else {}


def choices_of(question: dict[str, Any]) -> dict[str, Any]:
    choices = question.get("choices")
    if isinstance(choices, dict):
        return choices
    nested = nested_question(question).get("choices")
    return nested if isinstance(nested, dict) else {}


def correct_of(question: dict[str, Any]) -> str:
    return str(question.get("correctAnswer") or nested_question(question).get("correct_answer") or nested_question(question).get("correctAnswer") or "")


def explanation_of(question: dict[str, Any]) -> Any:
    if "explanation" in question:
        return question.get("explanation")
    return nested_question(question).get("explanation")


def set_explanation(question: dict[str, Any], explanation: Any) -> None:
    question["explanation"] = explanation
    nested = nested_question(question)
    if nested:
        nested["explanation"] = explanation


def word_count(value: Any) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def short(value: Any, limit: int = 180) -> str:
    text = clean_space(value)
    return text if len(text) <= limit else text[: limit - 3].rstrip() + "..."


def is_generic_distractor(text: Any) -> bool:
    cleaned = str(text or "").lower()
    return word_count(cleaned) < 18 or any(marker in cleaned for marker in GENERIC_DISTRACTOR_MARKERS)


def trap_note(question: dict[str, Any], label: str, correct: str) -> str:
    choices = choices_of(question)
    choice_text = clean_text(choices.get(label, ""))
    tags = []
    trap_types = question.get("trapTypes")
    if isinstance(trap_types, dict):
        raw_tags = trap_types.get(label)
        if isinstance(raw_tags, list):
            tags = [str(tag) for tag in raw_tags if str(tag or "").strip()]
        elif raw_tags:
            tags = [str(raw_tags)]
    explanations = [TRAP_EXPLANATIONS.get(tag, tag.replace("_", " ")) for tag in tags[:2]]
    if explanations:
        reason = " ".join(explanations)
    elif question.get("section") == "Math":
        reason = "It reflects a common computational path but does not answer the requested quantity."
    else:
        reason = "It is related to the same topic, but it does not satisfy the exact wording of the question."
    return (
        f"Choice {label} is not correct: {choice_text}. Trap: {reason} "
        f"Compare it with choice {correct} and the exact task in the prompt before eliminating it."
    )


def clean_prompt_fields(question: dict[str, Any]) -> bool:
    changed = False
    if "prompt" in question:
        cleaned = clean_text(question.get("prompt"))
        if cleaned != question.get("prompt"):
            question["prompt"] = cleaned
            changed = True
    nested = nested_question(question)
    for field in ["paragraph", "question"]:
        if field in nested:
            cleaned = clean_text(nested.get(field))
            if cleaned != nested.get(field):
                nested[field] = cleaned
                changed = True
    return changed


def clean_choices(question: dict[str, Any]) -> bool:
    changed = False
    for choices in [question.get("choices"), nested_question(question).get("choices")]:
        if not isinstance(choices, dict):
            continue
        for key, value in list(choices.items()):
            cleaned = clean_text(value)
            if cleaned != value:
                choices[key] = cleaned
                changed = True
    return changed


def clean_explanation(question: dict[str, Any]) -> tuple[bool, bool]:
    explanation = explanation_of(question)
    changed = False
    upgraded_traps = False
    correct = correct_of(question)

    if isinstance(explanation, dict):
        correct_text = clean_text(explanation.get("correct"))
        manual = MANUAL_CORRECT_EXPLANATIONS.get(str(question.get("id") or ""))
        if manual:
            correct_text = manual
        distractors = explanation.get("distractors")
        if not isinstance(distractors, dict):
            distractors = {}
        new_distractors: dict[str, str] = {}
        for label in LABELS:
            if label == correct or label not in choices_of(question):
                continue
            old = distractors.get(label, "")
            if is_generic_distractor(old):
                new_distractors[label] = trap_note(question, label, correct)
                upgraded_traps = True
            else:
                new_distractors[label] = clean_text(old)
        new_explanation = {"correct": correct_text, "distractors": new_distractors}
        if new_explanation != explanation:
            set_explanation(question, new_explanation)
            changed = True
    else:
        cleaned = clean_text(explanation)
        if cleaned != explanation:
            set_explanation(question, cleaned)
            changed = True
    if changed:
        question["explanationCleanupVersion"] = VERSION
        question["explanationCleanupDate"] = "2026-05-20"
    if upgraded_traps:
        question["trapExplanationUpgradeVersion"] = VERSION
    return changed, upgraded_traps


def reject_reason(row: dict[str, Any], question: dict[str, Any]) -> list[str]:
    reasons = []
    for issue in row.get("issues") or []:
        if issue == "mc_duplicate_choice_text":
            reasons.append("duplicate_or_non_unique_answer_choices")
        elif issue.startswith("math:"):
            reasons.append("math_answer_or_explanation_contradiction")
        elif issue == "mc_missing_exact_A_to_D_choices":
            reasons.append("invalid_multiple_choice_schema")
        else:
            reasons.append(issue)
    for warning in row.get("warnings") or []:
        if str(warning).startswith("rw_prompt_possible_length_issue"):
            reasons.append("rw_prompt_too_long_for_training_item")
    if not reasons:
        reasons.append("unresolved_opensat_needs_review")
    if question.get("reviewStatus") == "needs_review":
        reasons.append("not_cleared_by_strict_1600_review")
    return sorted(set(reasons))


def reject_question(question: dict[str, Any], row: dict[str, Any]) -> None:
    reasons = reject_reason(row, question)
    question["reviewStatus"] = "rejected"
    question["publicationStatus"] = "rejected_opensat_quality_gate"
    question["postReviewUse"] = "excluded_from_unified_mixed_sat_pool"
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "fail",
        "reviewer": "Codex SAT strict 1600 quality remediation",
        "checkedAt": "2026-05-20",
        "target": TARGET,
        "bucket": "excluded_opensat_quality_gate",
        "issues": reasons,
        "previousIssues": row.get("issues") or [],
        "previousWarnings": row.get("warnings") or [],
        "notes": "Excluded from the unified SAT training pool because the item is not reliable enough for student use without human rewriting.",
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "rejected",
        "target": TARGET,
        "criteria": [
            "unique answer choices",
            "correct answer key",
            "mathematically consistent explanation",
            "student-ready explanation and trap notes",
        ],
        "issues": reasons,
    }


def stamp_reviewed_policy(question: dict[str, Any]) -> None:
    if question.get("reviewStatus") == "reviewed":
        question["postReviewUse"] = "unified_mixed_sat_pool"
        question["publicationStatus"] = question.get("publicationStatus") or "reviewed"
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["unifiedPoolPolicyVersion"] = UNIFIED_POLICY_VERSION


def audit_row(question: dict[str, Any], index: int) -> dict[str, Any]:
    normalized = row_audit.normalize_question(question, OPENSAT_PATH.name, index)
    if not normalized:
        return {"severity": "fail", "issues": ["missing_prompt"], "warnings": []}
    return row_audit.audit_question(normalized, {})


def main() -> None:
    payload, questions = load_payload(OPENSAT_PATH)
    if not isinstance(questions, list):
        raise SystemExit("OpenSAT payload is not a list")

    counters: Counter[str] = Counter()
    rejected: list[dict[str, Any]] = []
    cleaned: list[dict[str, Any]] = []

    for index, question in enumerate(questions):
        if not isinstance(question, dict):
            continue
        row = audit_row(question, index)
        if question.get("reviewStatus") == "needs_review" or row.get("issues"):
            reject_question(question, row)
            counters["rejected_quality_gate"] += 1
            rejected.append(
                {
                    "sourceIndex": index,
                    "id": question.get("id"),
                    "section": question.get("section"),
                    "domain": question.get("domain"),
                    "skill": question.get("skill"),
                    "difficulty": question.get("difficulty"),
                    "reasons": question["contentAudit"]["issues"],
                }
            )
            continue

        stamp_reviewed_policy(question)
        prompt_changed = clean_prompt_fields(question)
        choices_changed = clean_choices(question)
        explanation_changed, traps_upgraded = clean_explanation(question)
        if prompt_changed:
            counters["cleaned_prompt"] += 1
        if choices_changed:
            counters["cleaned_choices"] += 1
        if explanation_changed:
            counters["cleaned_explanation"] += 1
        if traps_upgraded:
            counters["upgraded_trap_explanations"] += 1
        if prompt_changed or choices_changed or explanation_changed or traps_upgraded:
            cleaned.append(
                {
                    "sourceIndex": index,
                    "id": question.get("id"),
                    "actions": [
                        name
                        for name, active in [
                            ("prompt", prompt_changed),
                            ("choices", choices_changed),
                            ("explanation", explanation_changed),
                            ("trap_explanations", traps_upgraded),
                        ]
                        if active
                    ],
                }
            )

    write_payload(OPENSAT_PATH, payload)
    review_status_after = Counter(q.get("reviewStatus") for q in questions if isinstance(q, dict))
    post_review_use_after = Counter(q.get("postReviewUse") for q in questions if isinstance(q, dict))
    report = {
        "version": VERSION,
        "target": TARGET,
        "sourceFile": str(OPENSAT_PATH.relative_to(ROOT)),
        "counts": dict(counters),
        "reviewStatusAfter": dict(review_status_after),
        "postReviewUseAfter": dict(post_review_use_after),
        "rejectedThisRunCount": len(rejected),
        "rejectedTotalAfter": review_status_after.get("rejected", 0),
        "excludedFromPoolTotalAfter": post_review_use_after.get("excluded_from_unified_mixed_sat_pool", 0),
        "cleanedThisRunCount": len(cleaned),
        "rejected": rejected,
        "cleanedSamples": cleaned[:100],
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in {"rejected", "cleanedSamples"}}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
