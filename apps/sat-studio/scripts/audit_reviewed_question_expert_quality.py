"""Expert-quality audit for reviewed SAT Studio questions.

This report is intentionally stricter than the promotion gate. The gate answers
"can this item be marked reviewed?"; this audit answers "would a top SAT
curriculum lead trust the reviewed pool for depth, breadth, and answer
accuracy?"
"""

from __future__ import annotations

import csv
import json
import math
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from statistics import mean, median
from typing import Any

try:
    from scripts.check_questions import (
        QUESTION_FILES,
        DATA_DIR,
        is_core_visible_row,
        is_hidden_duplicate_row,
        is_rejected_row,
        is_remedial_pool_row,
        iter_questions,
        topic_key,
    )
    from scripts.math_verifier import (
        all_explanation_text,
        explanation_mentions_correct_answer,
        is_grid_in,
        verify_math_answer,
    )
except ModuleNotFoundError:
    from check_questions import (
        QUESTION_FILES,
        DATA_DIR,
        is_core_visible_row,
        is_hidden_duplicate_row,
        is_rejected_row,
        is_remedial_pool_row,
        iter_questions,
        topic_key,
    )
    from math_verifier import (
        all_explanation_text,
        explanation_mentions_correct_answer,
        is_grid_in,
        verify_math_answer,
    )


ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = DATA_DIR / "reviewed-question-expert-audit.json"
OUT_CSV = DATA_DIR / "reviewed-question-expert-audit-issues.csv"

RW_TARGETS = {
    "Information and Ideas": 26.0,
    "Craft and Structure": 28.0,
    "Expression of Ideas": 20.0,
    "Standard English Conventions": 26.0,
}

MATH_TARGETS = {
    "Algebra": 35.0,
    "Advanced Math": 35.0,
    "Problem-Solving and Data Analysis": 15.0,
    "Geometry and Trigonometry": 15.0,
}

RW_SKILLS = [
    "Central Ideas and Details",
    "Command of Evidence",
    "Inferences",
    "Words in Context",
    "Text Structure and Purpose",
    "Cross-Text Connections",
    "Rhetorical Synthesis",
    "Transitions",
    "Boundaries",
    "Form, Structure, and Sense",
]

MATH_SKILLS = [
    "Linear equations in one variable",
    "Linear equations in two variables",
    "Linear functions",
    "Systems of two linear equations in two variables",
    "Linear inequalities in one or two variables",
    "Equivalent expressions",
    "Nonlinear equations in one variable",
    "Nonlinear equations in one variable and systems of equations in two variables",
    "Nonlinear functions",
    "Ratios, rates, proportional relationships, and units",
    "Percentages",
    "One-variable data: distributions and measures of center and spread",
    "Two-variable data: models and scatterplots",
    "Probability and conditional probability",
    "Inference from sample statistics and margin of error",
    "Evaluating statistical claims: observational studies and experiments",
    "Area and volume",
    "Lines, angles, and triangles",
    "Right triangles and trigonometry",
    "Circles",
]

SKILL_ALIASES = {
    "Command of Evidence: Textual": "Command of Evidence",
    "Command of Evidence: Quantitative": "Command of Evidence",
    "Form, structure, and sense": "Form, Structure, and Sense",
    "Cross-Text Connection": "Cross-Text Connections",
    "Text Structure in Purpose": "Text Structure and Purpose",
    "Rates and units": "Ratios, rates, proportional relationships, and units",
    "Ratios and rates": "Ratios, rates, proportional relationships, and units",
    "Statistics": "One-variable data: distributions and measures of center and spread",
    "Data interpretation": "Two-variable data: models and scatterplots",
    "Probability": "Probability and conditional probability",
    "Linear functions and slope": "Linear functions",
    "Linear inequalities": "Linear inequalities in one or two variables",
    "Systems of linear equations": "Systems of two linear equations in two variables",
    "Quadratic equations": "Nonlinear equations in one variable",
    "Exponential functions": "Nonlinear functions",
    "Nonlinear equations and functions": "Nonlinear equations in one variable",
    "Nonlinear equations": "Nonlinear equations in one variable",
    "Advanced equations and functions": "Nonlinear equations in one variable",
    "Right triangles": "Right triangles and trigonometry",
    "Geometry and trigonometry": "Geometry and Trigonometry mixed",
    "Data, rates, percentages, and probability": "Problem-Solving and Data Analysis mixed",
    "Linear equations, inequalities, and functions": "Algebra mixed",
}

GENERIC_DISTRACTOR_PATTERNS = [
    "plausible computation trap",
    "does not match the final quantity requested",
    "creates a grammar, usage, or punctuation problem",
    "does not best preserve the logical flow",
    "misreads the word, phrase, structure, or rhetorical function",
    "adds, overstates, or misses information not supported",
]


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def word_count(value: Any) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def pct(part: int, total: int) -> float:
    return round(100 * part / total, 1) if total else 0.0


def question_id(question: dict[str, Any]) -> str:
    return str(question.get("id") or f"{question.get('_sourceFile')}#{question.get('_sourceIndex')}")


def source_file(question: dict[str, Any]) -> str:
    return str(question.get("_sourceFile") or "unknown")


def canonical_skill(skill: Any) -> str:
    skill_text = clean_text(skill)
    return SKILL_ALIASES.get(skill_text, skill_text or "Unknown")


def is_reviewed(question: dict[str, Any]) -> bool:
    return str(question.get("reviewStatus") or "").lower() == "reviewed"


def explanation_parts(question: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    explanation = question.get("explanation")
    external_distractors: dict[str, Any] = {}
    for key in ("distractorExplanations", "distractorRationales"):
        value = question.get(key)
        if isinstance(value, dict):
            external_distractors.update(value)
    if isinstance(explanation, dict):
        distractors = explanation.get("distractors") if isinstance(explanation.get("distractors"), dict) else {}
        distractors = {**external_distractors, **distractors}
        return clean_text(explanation.get("correct")), distractors
    return clean_text(explanation), external_distractors


def answer_choice_values(question: dict[str, Any]) -> list[str]:
    choices = question.get("choices") or {}
    if not isinstance(choices, dict):
        return []
    return [clean_text(choices.get(key)).lower() for key in ["A", "B", "C", "D"]]


def correct_choice_text(question: dict[str, Any]) -> str:
    choices = question.get("choices") or {}
    correct = question.get("correctAnswer")
    if isinstance(choices, dict) and correct in choices:
        return clean_text(choices.get(correct))
    return clean_text(correct)


def structural_accuracy_issues(question: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    required = ["id", "section", "domain", "skill", "difficulty", "prompt", "correctAnswer", "explanation"]
    for field in required:
        if not question.get(field):
            issues.append(f"missing_{field}")

    section = question.get("section")
    choices = question.get("choices") or {}
    correct = question.get("correctAnswer")

    if section == "Reading and Writing" and is_grid_in(question):
        issues.append("rw_question_cannot_be_spr")
    if section == "Reading and Writing" and question.get("domain") not in RW_TARGETS:
        issues.append("rw_domain_not_current_sat")
    if section == "Math" and question.get("domain") not in MATH_TARGETS:
        issues.append("math_domain_not_current_sat")

    if is_grid_in(question):
        if choices:
            issues.append("spr_has_choices")
        if not question.get("acceptableAnswers"):
            issues.append("spr_missing_acceptable_answers")
    else:
        if not isinstance(choices, dict) or set(choices.keys()) != {"A", "B", "C", "D"}:
            issues.append("mc_missing_exact_A_to_D_choices")
        else:
            values = answer_choice_values(question)
            if len(values) == 4 and len(set(values)) < 4:
                issues.append("mc_duplicate_choice_text")
        if correct not in {"A", "B", "C", "D"}:
            issues.append("mc_invalid_correct_answer")

    return issues


def pedagogical_depth_flags(question: dict[str, Any]) -> list[str]:
    flags: list[str] = []
    correct_explanation, distractors = explanation_parts(question)
    correct_words = word_count(correct_explanation)
    all_words = word_count(all_explanation_text(question.get("explanation")))
    mc = not is_grid_in(question)
    section = question.get("section")

    if section == "Math":
        if correct_words < 35:
            flags.append(f"thin_math_explanation:{correct_words}_words")
    elif correct_words < 28:
        flags.append(f"thin_rw_explanation:{correct_words}_words")

    if mc:
        if len(distractors) < 3:
            flags.append(f"incomplete_distractor_teaching:{len(distractors)}_of_3")
        elif any(is_generic_distractor(value) for value in distractors.values()):
            flags.append("generic_distractor_teaching")

    if all_words < 55 and question.get("difficulty") == "Hard":
        flags.append(f"hard_item_low_total_rationale:{all_words}_words")

    return flags


def is_generic_distractor(value: Any) -> bool:
    text = clean_text(value).lower()
    return any(pattern in text for pattern in GENERIC_DISTRACTOR_PATTERNS)


def reviewed_issue_row(question: dict[str, Any], seen_prompts: dict[str, str]) -> dict[str, Any]:
    issues = structural_accuracy_issues(question)
    warnings: list[str] = []
    depth_flags = pedagogical_depth_flags(question)

    prompt_key = clean_text(question.get("prompt")).lower()
    if prompt_key in seen_prompts:
        warnings.append(f"duplicate_prompt_with:{seen_prompts[prompt_key]}")
    elif prompt_key:
        seen_prompts[prompt_key] = question_id(question)

    if not explanation_mentions_correct_answer(question):
        warnings.append("explanation_does_not_mention_correct_answer")

    math_check = verify_math_answer(question)
    if question.get("section") == "Math":
        issues.extend(f"math:{issue}" for issue in math_check.get("issues", []))
        warnings.extend(f"math:{warning}" for warning in math_check.get("warnings", []))

    prompt_words = word_count(question.get("prompt"))
    if question.get("section") == "Reading and Writing" and prompt_words > 250:
        warnings.append(f"rw_prompt_possible_length_issue:{prompt_words}_words")

    severity = "pass"
    if issues:
        severity = "accuracy_blocker"
    elif depth_flags:
        severity = "depth_gap"
    elif warnings:
        severity = "warning"

    return {
        "id": question_id(question),
        "sourceFile": source_file(question),
        "sourceIndex": question.get("_sourceIndex"),
        "section": question.get("section"),
        "domain": question.get("domain"),
        "skill": question.get("skill"),
        "difficulty": question.get("difficulty"),
        "questionType": "student_produced_response" if is_grid_in(question) else "multiple_choice",
        "practicePool": question.get("practicePool") or question.get("skeletonDiversity", {}).get("practicePool") or "core_pool",
        "visibility": question.get("visibility"),
        "publicationStatus": question.get("publicationStatus"),
        "correctAnswer": question.get("correctAnswer"),
        "correctChoiceText": correct_choice_text(question),
        "promptWords": prompt_words,
        "explanationWords": word_count(all_explanation_text(question.get("explanation"))),
        "correctExplanationWords": word_count(explanation_parts(question)[0]),
        "distractorExplanationCount": len(explanation_parts(question)[1]),
        "severity": severity,
        "issues": issues,
        "warnings": warnings,
        "depthFlags": depth_flags,
        "topicKey": topic_key(question),
    }


def distribution(rows: list[dict[str, Any]], field: str) -> dict[str, int]:
    return dict(sorted(Counter(str(row.get(field) or "Unknown") for row in rows).items()))


def domain_distribution(rows: list[dict[str, Any]], section: str, targets: dict[str, float]) -> list[dict[str, Any]]:
    section_rows = [row for row in rows if row.get("section") == section and row.get("domain") in targets]
    total = len(section_rows)
    counts = Counter(row.get("domain") for row in section_rows)
    output = []
    for domain, target in targets.items():
        count = counts[domain]
        actual = pct(count, total)
        delta = round(actual - target, 1)
        output.append(
            {
                "domain": domain,
                "count": count,
                "actualPct": actual,
                "officialPct": target,
                "deltaPctPoints": delta,
                "balance": "underrepresented" if delta <= -3 else "overrepresented" if delta >= 3 else "near_target",
            }
        )
    return output


def skill_coverage(rows: list[dict[str, Any]], section: str, expected: list[str]) -> list[dict[str, Any]]:
    section_rows = [row for row in rows if row.get("section") == section]
    counts = Counter(canonical_skill(row.get("skill")) for row in section_rows)
    hard_counts = Counter(canonical_skill(row.get("skill")) for row in section_rows if row.get("difficulty") == "Hard")
    return [
        {
            "skill": skill,
            "count": counts.get(skill, 0),
            "hardCount": hard_counts.get(skill, 0),
        }
        for skill in expected
    ]


def answer_key_distribution(rows: list[dict[str, Any]]) -> dict[str, Any]:
    mc_rows = [row for row in rows if not is_grid_in(row) and row.get("correctAnswer") in {"A", "B", "C", "D"}]
    counts = Counter(row.get("correctAnswer") for row in mc_rows)
    total = len(mc_rows)
    return {
        "totalMultipleChoice": total,
        "byChoice": {key: {"count": counts[key], "pct": pct(counts[key], total)} for key in ["A", "B", "C", "D"]},
        "maxChoicePct": max((pct(counts[key], total) for key in ["A", "B", "C", "D"]), default=0),
    }


def numeric_stats(values: list[int]) -> dict[str, float]:
    if not values:
        return {"min": 0, "median": 0, "mean": 0, "max": 0}
    return {
        "min": min(values),
        "median": round(float(median(values)), 1),
        "mean": round(float(mean(values)), 1),
        "max": max(values),
    }


def depth_summary(issue_rows: list[dict[str, Any]], reviewed_rows: list[dict[str, Any]]) -> dict[str, Any]:
    explanation_words = [row["explanationWords"] for row in issue_rows]
    correct_words = [row["correctExplanationWords"] for row in issue_rows]
    hard_rows = [row for row in issue_rows if row.get("difficulty") == "Hard"]
    hard_depth_gaps = [row for row in hard_rows if row.get("depthFlags")]
    generic = [row for row in issue_rows if "generic_distractor_teaching" in row.get("depthFlags", [])]
    incomplete = [row for row in issue_rows if any(flag.startswith("incomplete_distractor_teaching") for flag in row.get("depthFlags", []))]
    math_rows = [row for row in reviewed_rows if row.get("section") == "Math"]
    grid_in_rows = [row for row in math_rows if is_grid_in(row)]
    hard_math_rows = [row for row in reviewed_rows if row.get("section") == "Math" and row.get("difficulty") == "Hard"]
    hard_multi_step = [row for row in hard_math_rows if hard_multi_step_math(row)]

    return {
        "explanationWordStats": numeric_stats(explanation_words),
        "correctExplanationWordStats": numeric_stats(correct_words),
        "depthGapQuestionCount": sum(1 for row in issue_rows if row.get("depthFlags")),
        "hardDepthGapQuestionCount": len(hard_depth_gaps),
        "genericDistractorTeachingCount": len(generic),
        "incompleteDistractorTeachingCount": len(incomplete),
        "mathGridInPct": pct(len(grid_in_rows), len(math_rows)),
        "mathGridInOfficialApproxPct": 25.0,
        "hardMathMultiStepHeuristicCount": len(hard_multi_step),
        "hardMathMultiStepHeuristicPctOfHardMath": pct(len(hard_multi_step), len(hard_math_rows)),
    }


def hard_multi_step_math(question: dict[str, Any]) -> bool:
    if question.get("section") != "Math" or question.get("difficulty") != "Hard":
        return False
    prompt = str(question.get("prompt") or "").lower()
    markers = [
        "table",
        "graph",
        "survey",
        "study",
        "model",
        "rate",
        "percent",
        "probability",
        "rectangle",
        "triangle",
        "circle",
        "function",
        "system",
        "parameter",
    ]
    return word_count(prompt) >= 35 and any(marker in prompt for marker in markers)


def topic_overload(rows: list[dict[str, Any]], limit: int = 35) -> list[dict[str, Any]]:
    visible = [row for row in rows if is_core_visible_row(row)]
    by_topic: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in visible:
        topic = topic_key(row)
        if topic:
            by_topic[topic].append(row)
    overloaded = []
    for topic, topic_rows in by_topic.items():
        if len(topic_rows) > limit:
            overloaded.append(
                {
                    "topicKey": topic,
                    "coreVisibleCount": len(topic_rows),
                    "sampleIds": [question_id(row) for row in topic_rows[:8]],
                }
            )
    return sorted(overloaded, key=lambda item: item["coreVisibleCount"], reverse=True)


def scorecard(issue_rows: list[dict[str, Any]], reviewed_rows: list[dict[str, Any]], core_rows: list[dict[str, Any]]) -> dict[str, Any]:
    total = len(reviewed_rows)
    accuracy_blockers = sum(1 for row in issue_rows if row["severity"] == "accuracy_blocker")
    depth_gaps = sum(1 for row in issue_rows if row["severity"] == "depth_gap")
    overload_count = len(topic_overload(reviewed_rows))
    core_domain_gaps = [
        item
        for item in domain_distribution(core_rows, "Reading and Writing", RW_TARGETS)
        + domain_distribution(core_rows, "Math", MATH_TARGETS)
        if item["balance"] != "near_target"
    ]

    accuracy_score = max(0.0, 10.0 - (accuracy_blockers / max(total, 1)) * 250)
    depth_score = max(0.0, 10.0 - (depth_gaps / max(total, 1)) * 30)
    breadth_score = max(0.0, 10.0 - len(core_domain_gaps) * 0.7 - overload_count * 0.08)
    fidelity_score = max(0.0, (accuracy_score * 0.4) + (depth_score * 0.25) + (breadth_score * 0.35))

    if accuracy_blockers:
        verdict = "reviewed_pool_has_accuracy_blockers_to_repair"
    elif breadth_score < 7:
        verdict = "accurate_pool_with_blueprint_balance_gaps"
    elif depth_score < 7:
        verdict = "accurate_pool_with_pedagogical_depth_gaps"
    else:
        verdict = "reviewed_pool_ready_for_high_quality_practice"

    return {
        "verdict": verdict,
        "accuracyScore10": round(accuracy_score, 1),
        "depthScore10": round(depth_score, 1),
        "breadthScore10": round(breadth_score, 1),
        "overallExpertScore10": round(fidelity_score, 1),
        "accuracyBlockerCount": accuracy_blockers,
        "depthGapCount": depth_gaps,
        "coreDomainGapCount": len(core_domain_gaps),
        "overloadedTopicCount": overload_count,
    }


def build_report() -> dict[str, Any]:
    reviewed_rows = [row for row in iter_questions() if is_reviewed(row)]
    core_reviewed = [
        row
        for row in reviewed_rows
        if not is_rejected_row(row) and not is_hidden_duplicate_row(row) and not is_remedial_pool_row(row)
    ]
    study_visible_reviewed = [row for row in reviewed_rows if not is_rejected_row(row) and not is_hidden_duplicate_row(row)]

    seen_prompts: dict[str, str] = {}
    issue_rows = [reviewed_issue_row(row, seen_prompts) for row in reviewed_rows]
    issue_rows_to_export = [
        row
        for row in issue_rows
        if row["issues"] or row["warnings"] or row["depthFlags"]
    ]

    report = {
        "generatedAt": date.today().isoformat(),
        "basis": {
            "scope": "All active bank questions with reviewStatus == reviewed.",
            "questionFiles": QUESTION_FILES,
            "officialSourcesChecked": [
                "College Board Reading and Writing Specifications",
                "College Board Math Specifications",
                "College Board SAT Structure",
                "College Board Math Student-Produced Responses",
            ],
            "expertPolicy": [
                "Accuracy blockers are not acceptable in reviewed rows.",
                "A high-quality reviewed MC item should teach all three wrong-answer traps, not only name the credited answer.",
                "Breadth is judged against current Digital SAT content-domain distributions and skill lists.",
                "Depth is judged by explanation substance, hard-item rigor, distractor specificity, and format fidelity.",
            ],
        },
        "inventory": {
            "reviewedTotal": len(reviewed_rows),
            "reviewedStudyVisible": len(study_visible_reviewed),
            "reviewedCoreVisible": len(core_reviewed),
            "reviewedHiddenDuplicate": sum(1 for row in reviewed_rows if is_hidden_duplicate_row(row)),
            "reviewedRemedialPool": sum(1 for row in reviewed_rows if is_remedial_pool_row(row)),
            "reviewedByFile": distribution(reviewed_rows, "_sourceFile"),
            "reviewedBySourceType": distribution(reviewed_rows, "sourceType"),
            "reviewedBySection": distribution(reviewed_rows, "section"),
            "reviewedByDifficulty": distribution(reviewed_rows, "difficulty"),
        },
        "accuracy": {
            "severityCounts": distribution(issue_rows, "severity"),
            "issueCounts": dict(Counter(issue for row in issue_rows for issue in row["issues"]).most_common()),
            "warningCounts": dict(Counter(warning.split(":", 1)[0] for row in issue_rows for warning in row["warnings"]).most_common()),
            "answerKeyDistribution": answer_key_distribution(reviewed_rows),
            "sampleAccuracyBlockers": [
                {
                    "id": row["id"],
                    "sourceFile": row["sourceFile"],
                    "issues": row["issues"],
                    "warnings": row["warnings"][:3],
                }
                for row in issue_rows
                if row["issues"]
            ][:30],
        },
        "breadth": {
            "allReviewedReadingWritingDomains": domain_distribution(reviewed_rows, "Reading and Writing", RW_TARGETS),
            "allReviewedMathDomains": domain_distribution(reviewed_rows, "Math", MATH_TARGETS),
            "coreReviewedReadingWritingDomains": domain_distribution(core_reviewed, "Reading and Writing", RW_TARGETS),
            "coreReviewedMathDomains": domain_distribution(core_reviewed, "Math", MATH_TARGETS),
            "coreReviewedReadingWritingSkills": skill_coverage(core_reviewed, "Reading and Writing", RW_SKILLS),
            "coreReviewedMathSkills": skill_coverage(core_reviewed, "Math", MATH_SKILLS),
            "thinCoreReadingWritingSkillsUnder60": [
                row for row in skill_coverage(core_reviewed, "Reading and Writing", RW_SKILLS) if row["count"] < 60
            ],
            "thinCoreMathSkillsUnder35": [
                row for row in skill_coverage(core_reviewed, "Math", MATH_SKILLS) if row["count"] < 35
            ],
            "overloadedTopicsCoreVisible": topic_overload(reviewed_rows)[:30],
        },
        "depth": depth_summary(issue_rows, reviewed_rows),
        "scorecard": scorecard(issue_rows, reviewed_rows, core_reviewed),
        "expertFindings": [],
    }

    report["expertFindings"] = build_findings(report)
    write_outputs(report, issue_rows_to_export)
    return report


def build_findings(report: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    score = report["scorecard"]
    accuracy = report["accuracy"]
    depth = report["depth"]

    if score["accuracyBlockerCount"]:
        findings.append(
            f"{score['accuracyBlockerCount']} reviewed rows still have accuracy/structure blockers and should be demoted or repaired."
        )
    else:
        findings.append("No reviewed row has a hard answer-key or math-verification blocker under the automated verifier.")

    for item in report["breadth"]["coreReviewedMathDomains"]:
        if item["balance"] != "near_target":
            findings.append(
                f"Core reviewed Math {item['domain']} is {item['balance']} ({item['actualPct']}% vs official ~{item['officialPct']}%)."
            )
    for item in report["breadth"]["coreReviewedReadingWritingDomains"]:
        if item["balance"] != "near_target":
            findings.append(
                f"Core reviewed R&W {item['domain']} is {item['balance']} ({item['actualPct']}% vs official ~{item['officialPct']}%)."
            )

    if depth["genericDistractorTeachingCount"]:
        findings.append(
            f"{depth['genericDistractorTeachingCount']} reviewed MC rows use generic distractor teaching; these pass structurally but are below elite coaching quality."
        )
    if depth["hardMathMultiStepHeuristicPctOfHardMath"] < 15:
        findings.append(
            f"Only {depth['hardMathMultiStepHeuristicPctOfHardMath']}% of hard reviewed Math rows look multi-step/context-rich by heuristic."
        )
    if report["breadth"]["thinCoreMathSkillsUnder35"]:
        names = ", ".join(row["skill"] for row in report["breadth"]["thinCoreMathSkillsUnder35"][:5])
        findings.append(f"Thin Math subskill coverage remains in: {names}.")
    return findings


def write_outputs(report: dict[str, Any], rows: list[dict[str, Any]]) -> None:
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = [
            "id",
            "sourceFile",
            "sourceIndex",
            "section",
            "domain",
            "skill",
            "difficulty",
            "questionType",
            "practicePool",
            "severity",
            "issues",
            "warnings",
            "depthFlags",
            "promptWords",
            "explanationWords",
            "correctExplanationWords",
            "distractorExplanationCount",
            "topicKey",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            out = dict(row)
            out["issues"] = ";".join(out.get("issues") or [])
            out["warnings"] = ";".join(out.get("warnings") or [])
            out["depthFlags"] = ";".join(out.get("depthFlags") or [])
            writer.writerow({field: out.get(field, "") for field in fieldnames})


def main() -> None:
    report = build_report()
    compact = {
        "outputs": {
            "json": str(OUT_JSON.relative_to(ROOT)),
            "csv": str(OUT_CSV.relative_to(ROOT)),
        },
        "inventory": report["inventory"],
        "scorecard": report["scorecard"],
        "accuracy": {
            "severityCounts": report["accuracy"]["severityCounts"],
            "topIssueCounts": dict(list(report["accuracy"]["issueCounts"].items())[:8]),
            "topWarningCounts": dict(list(report["accuracy"]["warningCounts"].items())[:8]),
        },
        "depth": report["depth"],
        "expertFindings": report["expertFindings"][:12],
    }
    print(json.dumps(compact, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
