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
REPORT_PATH = ROOT / "data" / "antigravity-math-warning-upgrade-report.json"
VERSION = "antigravity-math-warning-upgrade-2026-05-20"
TARGET = "SAT 1000-1600 roadmap, target 1600"


UPGRADES: dict[str, dict[str, Any]] = {
    "antigravity-9e79fa96": {
        "questionType": "multiple_choice",
        "explanation": {
            "correct": (
                "For |3x - 6| > 9, split the absolute value inequality into two cases: "
                "3x - 6 > 9 or 3x - 6 < -9. These give x > 5 or x < -1, so the solution is $x<-1$ or $x>5$."
            ),
            "distractors": {
                "A": "Choice A keeps only the right-hand branch x > 5 and misses the left-hand branch.",
                "C": "Choice C keeps only the left-hand branch x < -1 and misses the right-hand branch.",
                "D": "Choice D is the interval between -1 and 5, which would match |3x - 6| < 9, not > 9.",
            },
        },
    },
    "antigravity-664ac988": {
        "explanation": {
            "correct": (
                "Multiply both sides by 6, which is positive, so the inequality direction stays the same: "
                "2(2x - 1) > 3(x + 2). Then 4x - 2 > 3x + 6, so x > 8. "
                "The smallest integer greater than 8 is 9. Final answer = 9."
            ),
            "distractors": {
                "common_error_1": "Stopping at x > 8 does not answer the question, which asks for the smallest integer.",
                "common_error_2": "Using x = 8 is tempting from the boundary, but the inequality is strict, so 8 is not allowed.",
            },
        },
    },
    "antigravity-93e9d124": {
        "explanation": {
            "correct": (
                "To maximize pants, use the minimum allowed number of shirts: 8. The shirts cost 25(8) = 200 dollars, "
                "leaving 500 - 200 = 300 dollars for pants. Since each pair of pants costs 40 dollars, "
                "300/40 = 7.5, so at most 7 whole pairs can be bought. Final answer = 7."
            ),
            "distractors": {
                "common_error_1": "Rounding 7.5 up to 8 would exceed the budget because 8 pairs of pants cost 320 dollars.",
                "common_error_2": "Buying more than 8 shirts leaves less money for pants, so it cannot maximize the number of pants.",
            },
        },
    },
    "antigravity-79fec792": {
        "questionType": "multiple_choice",
        "explanation": {
            "correct": (
                "Rewrite each radical with a factor of 2: sqrt(50) = 5sqrt(2), sqrt(18) = 3sqrt(2), "
                "and sqrt(8) = 2sqrt(2). Therefore 5sqrt(2) + 3sqrt(2) - 2sqrt(2) = 6sqrt(2), "
                "which is choice B. Final answer = $6\\sqrt{2}$."
            ),
            "distractors": {
                "A": "Choice A results from subtracting too much after simplifying the radicals.",
                "C": "Choice C reflects a coefficient-combining error; the coefficients should be 5 + 3 - 2.",
                "D": "Choice D results from adding one of the terms that should be subtracted.",
            },
        },
    },
    "antigravity-833730e9": {
        "questionType": "multiple_choice",
        "explanation": {
            "correct": (
                "Set the equations equal: x^2 + 2x + 5 = 4x + 1, so x^2 - 2x + 4 = 0. "
                "The discriminant is (-2)^2 - 4(1)(4) = 4 - 16 = -12, which is negative. "
                "There are no real intersections. Final answer = 0."
            ),
            "distractors": {
                "A": "Choice A assumes a quadratic and a line must intersect twice, but the discriminant is negative.",
                "C": "Choice C would require the discriminant to equal 0, giving one tangent intersection.",
                "D": "Choice D would require the two equations to represent the same curve, which they do not.",
            },
        },
    },
    "antigravity-18e88c7d": {
        "explanation": {
            "correct": (
                "Divide both sides by 500 to get (1.06)^t = 2. Taking logs gives "
                "t = log 2 / log 1.06. The problem gives this value as approximately 11.9, "
                "which rounds to 12. Final answer = 12."
            ),
            "distractors": {
                "common_error_1": "Rounding 11.9 down to 11 ignores the nearest whole number rule.",
                "common_error_2": "Using 6% as if it were a linear increase would not model the exponential equation.",
            },
        },
    },
    "antigravity-7135103c": {
        "questionType": "multiple_choice",
        "explanation": {
            "correct": (
                "A surpasses B when 1000(1.05)^t > 2000(1.02)^t. Dividing gives "
                "(1.05/1.02)^t > 2. The prompt states that solving this gives t approximately 24, "
                "so the best answer is 24 years. Final answer = 24."
            ),
            "distractors": {
                "A": "Choice A is too small; at 10 years the faster growth rate has not overcome the 2-to-1 starting gap.",
                "B": "Choice B overshoots the provided approximation.",
                "D": "Choice D ignores that A has the larger growth factor, so it eventually surpasses B.",
            },
        },
    },
    "antigravity-419f8b48": {
        "explanation": {
            "correct": (
                "First find when 800(0.75)^x < 200. Dividing by 800 gives (0.75)^x < 0.25. "
                "The prompt gives 0.75^4 approximately 0.316, which is still greater than 0.25, and "
                "0.75^5 approximately 0.237, which is less than 0.25. The first period below 200 is 5. "
                "Final answer = 5."
            ),
            "distractors": {
                "common_error_1": "Using 4 stops one period too early because the value is still above 200.",
                "common_error_2": "Solving only for an approximate crossing is not enough; the question asks for the first whole period below 200.",
            },
        },
    },
    "antigravity-eb7e77db": {
        "questionType": "multiple_choice",
        "explanation": {
            "correct": (
                "Evaluate each function at x = 10: j(10) = 5(10) + 50 = 100, h(10) = 10^2 = 100, "
                "g(10) = 10(10) = 100, and f(10) = 2^10 = 1024. The greatest value is produced by f(x) = 2^x."
            ),
            "distractors": {
                "A": "Choice A gives 100 at x = 10, which is less than 1024.",
                "B": "Choice B also gives 100 at x = 10; the quadratic is not largest here.",
                "C": "Choice C gives 100 at x = 10, matching A and B but not D.",
            },
        },
    },
    "antigravity-fcc7c75b": {
        "explanation": {
            "correct": (
                "Use point-slope form with slope -3 and point (-1, 4): y - 4 = -3(x + 1). "
                "Expanding gives y - 4 = -3x - 3, so y = -3x + 1. The y-intercept is 1. "
                "Final answer = 1."
            ),
            "distractors": {
                "common_error_1": "Using -1 as the intercept confuses the point's x-coordinate with the y-intercept.",
                "common_error_2": "Using 4 as the intercept ignores the slope from (-1, 4) to the y-axis.",
            },
        },
    },
    "antigravity-ee0dc20e": {
        "questionType": "multiple_choice",
        "explanation": {
            "correct": (
                "The given line has slope 2/3. A perpendicular line has slope equal to the negative reciprocal, "
                "so the slope is -3/2, which is choice D. Final answer = -3/2."
            ),
            "distractors": {
                "A": "Choice A uses the reciprocal but misses the negative sign.",
                "B": "Choice B repeats the original slope instead of using the perpendicular slope.",
                "C": "Choice C changes the sign but does not take the reciprocal.",
            },
        },
    },
    "antigravity-fa47710f": {
        "explanation": {
            "correct": (
                "Move all terms to one side: x^2 - 5x - 14 = 0. Factor to get (x - 7)(x + 2) = 0, "
                "so x = 7 or x = -2. The positive root is 7. Final answer = 7."
            ),
            "distractors": {
                "common_error_1": "Choosing -2 gives the negative root, but the question asks for the positive root.",
                "common_error_2": "Factoring x^2 - 5x + 14 would use the wrong sign after moving 14.",
            },
        },
    },
    "antigravity-ab26a52c": {
        "explanation": {
            "correct": (
                "Both terms share the factor (x - 4), so factor first: "
                "(2x + 3)(x - 4) - (x + 1)(x - 4) = [(2x + 3) - (x + 1)](x - 4). "
                "The bracket simplifies to x + 2, and (x + 2)(x - 4) = x^2 - 2x - 8. "
                "The coefficient of x is -2. Final answer = -2."
            ),
            "distractors": {
                "common_error_1": "Forgetting to distribute the subtraction across (x + 1)(x - 4) changes the middle coefficient.",
                "common_error_2": "Reporting 2 misses the negative sign in the expanded term -2x.",
            },
        },
    },
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
            "math_answer_and_explanation_consistency",
            "explicit_final_answer_when_numeric",
            "specific_wrong-answer_or_common-error_trap_notes",
            "no_blocking_structural_issues",
        ],
        "previousContentAudit": previous_audit_summary(question),
    }
    question["strict1600Review"] = {
        "version": VERSION,
        "status": "reviewed",
        "target": TARGET,
        "criteria": [
            "accurate answer key",
            "math explanation reaches the credited answer",
            "trap notes identify plausible mistakes",
            "usable in private unified SAT progression",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(DATA_PATH)
    by_id = {question.get("id"): (index, question) for index, question in enumerate(questions) if isinstance(question, dict)}
    report: dict[str, Any] = {"apply": args.apply, "version": VERSION, "upgraded": [], "promoted": [], "blocked": [], "missing": []}

    for qid, upgrade in UPGRADES.items():
        entry = by_id.get(qid)
        if not entry:
            report["missing"].append(qid)
            continue
        _, question = entry
        if "questionType" in upgrade:
            question["questionType"] = upgrade["questionType"]
        question["explanation"] = upgrade["explanation"]
        notes = question.get("expertRepairNotes")
        if not isinstance(notes, dict):
            notes = {}
        notes["mathWarningUpgradeVersion"] = VERSION
        question["expertRepairNotes"] = notes
        report["upgraded"].append(qid)

    for qid in sorted(UPGRADES):
        entry = by_id.get(qid)
        if not entry:
            continue
        index, question = entry
        row = audit_single(question, DATA_PATH.name, index)
        warnings = [warning for warning in (row.get("warnings") or []) if not warning.startswith("exact_duplicate_prompt:")]
        if row.get("issues") or warnings:
            report["blocked"].append({"id": qid, "sourceIndex": index, "issues": row.get("issues") or [], "warnings": warnings})
            continue
        stamp_reviewed(question)
        report["promoted"].append({"id": qid, "sourceIndex": index})

    if args.apply:
        write_payload(DATA_PATH, payload)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
