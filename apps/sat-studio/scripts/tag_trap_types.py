import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

try:
    from scripts.check_questions import DATA_DIR, QUESTION_FILES
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
except ModuleNotFoundError:
    from check_questions import DATA_DIR, QUESTION_FILES
    from review_unified_needs_review_bank import load_payload, write_payload


VERSION = "trap-types-v1-2026-05-20"


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def nested(question: dict[str, Any]) -> dict[str, Any]:
    value = question.get("question")
    return value if isinstance(value, dict) else {}


def choices(question: dict[str, Any]) -> dict[str, Any]:
    value = question.get("choices")
    if isinstance(value, dict) and value:
        return value
    value = nested(question).get("choices")
    return value if isinstance(value, dict) else {}


def correct_answer(question: dict[str, Any]) -> str:
    return str(question.get("correctAnswer") or nested(question).get("correct_answer") or nested(question).get("correctAnswer") or "")


def explanation_distractors(question: dict[str, Any]) -> dict[str, Any]:
    explanation = question.get("explanation")
    if not isinstance(explanation, dict):
        explanation = nested(question).get("explanation")
    if isinstance(explanation, dict) and isinstance(explanation.get("distractors"), dict):
        return explanation["distractors"]
    return {}


def base_trap(question: dict[str, Any]) -> str:
    section = question.get("section")
    skill = clean(question.get("skill")).lower()
    domain = clean(question.get("domain")).lower()
    if section == "Reading and Writing":
        if "boundaries" in skill:
            return "punctuation_boundary_error"
        if "form" in skill or "structure and sense" in skill:
            return "grammar_form_error"
        if "transition" in skill:
            return "wrong_logical_transition"
        if "rhetorical synthesis" in skill:
            return "goal_or_note_selection_error"
        if "command of evidence" in skill:
            return "evidence_mismatch"
        if "words in context" in skill:
            return "context_meaning_error"
        if "cross-text" in skill:
            return "text_relationship_misread"
        if "text structure" in skill:
            return "rhetorical_function_misread"
        if "inference" in skill:
            return "unsupported_inference"
        if "central" in skill:
            return "main_idea_scope_error"
        return "rw_task_misread"

    if "system" in skill:
        return "partial_system_solution"
    if "linear function" in skill or "slope" in skill:
        return "linear_feature_confusion"
    if "linear equation" in skill or "inequal" in skill:
        return "algebra_setup_or_boundary_error"
    if "equivalent" in skill:
        return "invalid_algebraic_manipulation"
    if "quadratic" in skill or "nonlinear" in skill or "advanced" in skill or "exponential" in skill:
        return "substitution_factoring_or_function_error"
    if "percent" in skill or "ratio" in skill or "rate" in skill or "unit" in skill:
        return "wrong_base_rate_or_unit"
    if "data" in skill or "statistics" in skill or "probability" in skill or "problem-solving" in domain:
        return "wrong_statistic_or_denominator"
    if "circle" in skill:
        return "circle_measure_confusion"
    if "triangle" in skill or "trigonometry" in skill:
        return "geometry_ratio_or_theorem_error"
    if "area" in skill or "volume" in skill or "geometry" in domain:
        return "wrong_geometry_formula_or_measure"
    return "calculation_or_intermediate_value_error"


KEYWORD_TRAPS: list[tuple[str, str]] = [
    (r"\bcomma splice\b|\bcomma\b", "comma_or_punctuation_mark_confusion"),
    (r"\bsemicolon\b|\bcolon\b|\bdash\b", "punctuation_mark_confusion"),
    (r"\btoo broad\b|\btoo narrow\b|\bscope\b", "scope_error"),
    (r"\boverstates?\b|\bunsupported\b|\bdoes not justify\b", "unsupported_claim"),
    (r"\btone\b|\bconnotation\b|\bshade of meaning\b", "tone_or_connotation_mismatch"),
    (r"\bagreement\b|\bdisagreement\b|\bone author\b|\btwo texts\b", "text_relationship_misread"),
    (r"\bfunction\b|\brhetorical move\b|\brole\b", "rhetorical_function_misread"),
    (r"\bwrong grammatical\b|\btense\b|\bnumber\b|\bmood\b|\bmodifier\b", "grammar_form_error"),
    (r"\bintermediate\b|\bstopping before\b|\bunfinished\b", "intermediate_value_error"),
    (r"\bsign\b|\bnegative\b|\bpositive\b", "sign_error"),
    (r"\bunit\b|\bbase\b|\bdenominator\b", "wrong_base_or_unit"),
    (r"\bslope\b|\bintercept\b|\binput\b|\boutput\b", "linear_feature_confusion"),
    (r"\bfactor\b|\bfactoring\b|\bcancel", "factoring_or_cancellation_error"),
    (r"\bradius\b|\bdiameter\b|\bchord\b|\bsector\b|\barc\b", "circle_measure_confusion"),
    (r"\bangle\b|\btriangle\b|\bhypotenuse\b|\bsine\b|\bcosine\b|\btangent\b", "geometry_ratio_or_theorem_error"),
    (r"\bprobability\b|\bstatistic\b|\bdata\b|\bsurvey\b", "wrong_statistic_or_denominator"),
]


def trap_types_for(question: dict[str, Any], label: str, value: Any, distractor_text: Any) -> list[str]:
    traps = [base_trap(question)]
    text = f"{clean(value)} {clean(distractor_text)}".lower()
    for pattern, trap in KEYWORD_TRAPS:
        if re.search(pattern, text) and trap not in traps:
            traps.append(trap)
    return traps[:3]


def tag_question(question: dict[str, Any]) -> dict[str, list[str]] | None:
    if question.get("reviewStatus") != "reviewed":
        return None
    q_choices = choices(question)
    correct = correct_answer(question)
    if set(q_choices.keys()) != {"A", "B", "C", "D"} or correct not in q_choices:
        return None
    distractors = explanation_distractors(question)
    out = {}
    for label, value in q_choices.items():
        if label == correct:
            continue
        out[label] = trap_types_for(question, label, value, distractors.get(label))
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    report: dict[str, Any] = {
        "version": VERSION,
        "apply": args.apply,
        "updatedByFile": {},
        "trapTypeCounts": Counter(),
    }
    for source_file in QUESTION_FILES:
        path = DATA_DIR / source_file
        payload, questions = load_payload(path)
        changed = 0
        eligible = 0
        for question in questions:
            if not isinstance(question, dict):
                continue
            trap_types = tag_question(question)
            if trap_types is None:
                continue
            eligible += 1
            if question.get("trapTypes") != trap_types or question.get("trapTypesVersion") != VERSION:
                question["trapTypes"] = trap_types
                question["trapTypesVersion"] = VERSION
                changed += 1
            for traps in trap_types.values():
                report["trapTypeCounts"].update(traps)
        report["updatedByFile"][source_file] = {"eligibleReviewedMc": eligible, "changed": changed}
        if args.apply and changed:
            write_payload(path, payload)

    report["trapTypeCounts"] = dict(report["trapTypeCounts"].most_common())
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
