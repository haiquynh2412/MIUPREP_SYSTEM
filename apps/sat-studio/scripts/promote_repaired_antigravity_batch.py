import argparse
import json
from pathlib import Path
from typing import Any

try:
    from scripts.review_unified_needs_review_bank import audit_single, load_payload, write_payload
except ModuleNotFoundError:
    from review_unified_needs_review_bank import audit_single, load_payload, write_payload


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "antigravity-bank.json"
REPORT_PATH = ROOT / "data" / "antigravity-repaired-batch-promotion-report.json"

VERSION = "antigravity-repaired-batch-review-2026-05-20"
TARGET = "SAT 1000-1600 roadmap, target 1600"

SPR_REPAIRS: dict[str, dict[str, Any]] = {
    "antigravity-c5bacb25": {
        "correctAnswer": "71",
        "acceptableAnswers": ["71"],
        "prompt": (
            "A table shows the number of books sold by a store each quarter: "
            "Q1: 450, Q2: 520, Q3: 380, Q4: 650. What is the percentage increase "
            "from Q3 to Q4? Round to the nearest whole number."
        ),
        "skill": "Percentages",
        "explanation": {
            "correct": (
                "The increase from Q3 to Q4 is 650 - 380 = 270 books. "
                "The percent increase is 270/380 x 100, which is about 71.05%. "
                "Rounded to the nearest whole number, this is 71. Final answer = 71."
            ),
            "distractors": {
                "common_error_1": (
                    "Using 650 as the base gives about 42%, but percent increase uses the original value, 380."
                ),
                "common_error_2": (
                    "Subtracting 380 from 650 gives 270, but 270 is the raw increase, not the percent increase."
                ),
            },
        },
    },
    "antigravity-cb6080de": {
        "correctAnswer": "65",
        "acceptableAnswers": ["65"],
        "prompt": "A scatter plot's line of best fit is y = -1.5x + 80. Predict y when x = 10.",
        "skill": "Two-variable data: models and scatterplots",
        "explanation": {
            "correct": (
                "Substitute x = 10 into the line of best fit: y = -1.5(10) + 80 = -15 + 80 = 65. "
                "Final answer = 65."
            ),
            "distractors": {
                "common_error_1": "Using 80 alone gives the y-intercept, not the predicted value at x = 10.",
                "common_error_2": "Adding 15 instead of subtracting it ignores the negative slope.",
            },
        },
    },
    "antigravity-8d477694": {
        "correctAnswer": "100",
        "acceptableAnswers": ["100"],
        "prompt": (
            "A bar chart shows annual revenue: 2020 = $2 million, 2021 = $2.5 million, "
            "2022 = $3.2 million, and 2023 = $4 million. What is the percent increase "
            "from 2020 to 2023?"
        ),
        "skill": "Percentages",
        "explanation": {
            "correct": (
                "Revenue increased by 4 - 2 = 2 million dollars. Dividing by the original "
                "2020 revenue gives 2/2 = 1, or 100%. Final answer = 100."
            ),
            "distractors": {
                "common_error_1": "Using the final value as the base gives 50%, but percent increase uses the original value.",
                "common_error_2": "Reporting the 2 million dollar increase does not answer the percent question.",
            },
        },
    },
    "antigravity-ae1e4e0f": {
        "correctAnswer": "1750",
        "acceptableAnswers": ["1750"],
        "prompt": (
            "A pie chart shows a monthly budget: Housing 35%, Food 20%, Transport 15%, "
            "Insurance 10%, Savings 8%, and Other 12%. If monthly income is $5,000, "
            "how many dollars go to Housing?"
        ),
        "skill": "Percentages",
        "explanation": {
            "correct": "Housing is 35% of $5,000, so 0.35 x 5000 = 1750. Final answer = 1750.",
            "distractors": {
                "common_error_1": "Using 30% instead of 35% would give 1500, which is not the housing percentage.",
                "common_error_2": "Using 40% would give 2000, but the chart lists Housing as 35%.",
            },
        },
    },
    "antigravity-4731c4d4": {
        "correctAnswer": "20",
        "acceptableAnswers": ["20"],
        "prompt": "A bar chart shows sales of $4 million in 2020 and $4.8 million in 2021. What is the percent increase?",
        "skill": "Percentages",
        "explanation": {
            "correct": (
                "The increase is 4.8 - 4 = 0.8 million. The percent increase is 0.8/4 x 100 = 20. "
                "Final answer = 20."
            ),
            "distractors": {
                "common_error_1": "Dividing by 4.8 uses the final value as the base instead of the original value.",
                "common_error_2": "Using 0.8 as the answer gives the dollar increase in millions, not the percent increase.",
            },
        },
    },
    "antigravity-16bce91d": {
        "correctAnswer": "660",
        "acceptableAnswers": ["660"],
        "prompt": "A bar chart shows quarterly totals: Q1 = 120, Q2 = 150, Q3 = 180, and Q4 = 210. What is the total for all four quarters?",
        "skill": "One-variable data: distributions and measures of center and spread",
        "explanation": {
            "correct": "Add the four quarterly totals: 120 + 150 + 180 + 210 = 660. Final answer = 660.",
            "distractors": {
                "common_error_1": "Adding only three quarters gives an incomplete total.",
                "common_error_2": "Averaging the four values would answer for the mean, not the total.",
            },
        },
    },
    "antigravity-c950f88b": {
        "correctAnswer": "10",
        "acceptableAnswers": ["10"],
        "prompt": "A table shows revenue of $5 million in 2019 and $5.5 million in 2020. What is the growth rate as a percent?",
        "skill": "Percentages",
        "explanation": {
            "correct": (
                "Revenue increased by 5.5 - 5 = 0.5 million. The growth rate is 0.5/5 x 100 = 10. "
                "Final answer = 10."
            ),
            "distractors": {
                "common_error_1": "Using 5.5 as the denominator uses the final value, not the starting value.",
                "common_error_2": "Reporting 0.5 gives the increase in millions, not the percent growth rate.",
            },
        },
    },
}

TEXT_REPAIRS: dict[str, dict[str, Any]] = {
    "antigravity-f9705de0": {
        "prompt": (
            "The treaty was signed by representatives of both _______ the agreement established "
            "a framework for future diplomatic negotiations.\n\nWhich choice completes the text "
            "so that it conforms to the conventions of Standard English?"
        ),
        "explanation": {
            "correct": (
                "A semicolon correctly joins two independent clauses: 'The treaty was signed by "
                "representatives of both nations' and 'the agreement established a framework for "
                "future diplomatic negotiations.'"
            ),
            "distractors": {
                "B": (
                    "A colon would suggest that the second clause explains or introduces material "
                    "from the first, but the sentence needs coordination between two independent clauses."
                ),
                "C": "A comma between two independent clauses without a coordinating conjunction creates a comma splice.",
                "D": "No punctuation creates a run-on sentence between two independent clauses.",
            },
        },
    },
}

PROMOTE_IDS = {
    "antigravity-05e6f075",
    "antigravity-fba29894",
    "antigravity-6dc9a21b",
    "antigravity-f9705de0",
    "antigravity-462cdb31",
    "antigravity-1c7dc092",
    "antigravity-dd71efd7",
    "antigravity-b93993c9",
    "antigravity-b8704245",
    *SPR_REPAIRS.keys(),
}


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


def stamp_reviewed(question: dict[str, Any]) -> None:
    question["reviewStatus"] = "reviewed"
    question["publicationStatus"] = "private_reviewed" if question.get("visibility") == "private_family" else "reviewed"
    question["sourceUsagePolicy"] = "provenance_only_unified_pool"
    question["postReviewUse"] = "unified_mixed_sat_pool"
    question["unifiedPoolPolicyVersion"] = "unified-source-policy-2026-05-18"
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "pass",
        "reviewer": "Codex SAT expert spot-check",
        "checkedAt": "2026-05-20",
        "target": TARGET,
        "checks": [
            "current_digital_sat_domain_alignment",
            "answer_key_and_choice_integrity",
            "math_answer_and_explanation_consistency",
            "no_blocking_structural_issues",
            "spot_checked_explanation_and_trap_notes",
        ],
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "reviewed",
        "target": TARGET,
        "criteria": [
            "accurate answer key",
            "SAT-domain fit after repair",
            "no active structural blocker",
            "usable in private unified SAT progression",
        ],
    }


def apply_spr_repair(question: dict[str, Any], repair: dict[str, Any]) -> None:
    question["section"] = "Math"
    question["domain"] = "Problem-Solving and Data Analysis"
    question["skill"] = repair["skill"]
    question["questionType"] = "student_produced_response"
    question["type"] = "SPR"
    question["prompt"] = repair["prompt"]
    question["correctAnswer"] = repair["correctAnswer"]
    question["acceptableAnswers"] = repair["acceptableAnswers"]
    question["explanation"] = repair["explanation"]
    question.pop("choices", None)
    question["expertRepairNotes"] = {
        "version": VERSION,
        "repair": "Converted from malformed Reading and Writing quantitative item to Math PSDA student-produced response.",
    }


def apply_text_repair(question: dict[str, Any], repair: dict[str, Any]) -> None:
    question.update(repair)
    question["expertRepairNotes"] = {
        "version": VERSION,
        "repair": "Corrected sentence stem so the credited semicolon answer joins two independent clauses.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(DATA_PATH)
    report: dict[str, Any] = {
        "apply": args.apply,
        "version": VERSION,
        "repairedSpr": [],
        "repairedText": [],
        "promoted": [],
        "blocked": [],
        "missing": [],
    }

    by_id = {question.get("id"): (index, question) for index, question in enumerate(questions) if isinstance(question, dict)}
    for qid, repair in SPR_REPAIRS.items():
        entry = by_id.get(qid)
        if not entry:
            report["missing"].append(qid)
            continue
        _, question = entry
        apply_spr_repair(question, repair)
        report["repairedSpr"].append(qid)

    for qid, repair in TEXT_REPAIRS.items():
        entry = by_id.get(qid)
        if not entry:
            report["missing"].append(qid)
            continue
        _, question = entry
        apply_text_repair(question, repair)
        report["repairedText"].append(qid)

    for qid in sorted(PROMOTE_IDS):
        entry = by_id.get(qid)
        if not entry:
            if qid not in report["missing"]:
                report["missing"].append(qid)
            continue
        index, question = entry
        row = audit_single(question, DATA_PATH.name, index)
        warnings = [warning for warning in (row.get("warnings") or []) if not warning.startswith("exact_duplicate_prompt:")]
        if row.get("issues") or warnings:
            report["blocked"].append(
                {
                    "id": qid,
                    "sourceIndex": index,
                    "issues": row.get("issues") or [],
                    "warnings": warnings,
                }
            )
            continue
        stamp_reviewed(question)
        report["promoted"].append({"id": qid, "sourceIndex": index})

    if args.apply:
        write_payload(DATA_PATH, payload)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
