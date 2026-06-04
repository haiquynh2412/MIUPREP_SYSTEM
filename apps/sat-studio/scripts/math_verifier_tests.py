import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.math_verifier import (
    equation_mismatches,
    explanation_mentions_correct_answer,
    parse_numeric_value,
    values_equivalent,
    verify_acceptable_answers,
    verify_math_answer,
)


def check(label, condition):
    if not condition:
        raise AssertionError(label)
    print(f"  PASS: {label}")


def main():
    check("fraction equals decimal", values_equivalent("7/2", "3.5"))
    check("decimal formatting equivalent", values_equivalent("3.50", "3.5"))
    check("pi term parses", abs(parse_numeric_value("9pi") - 28.2743338823) < 0.001)
    check("latex fraction with grouped denominator parses", values_equivalent(r"\frac{1}{3+1}", "0.25"))
    check("latex sqrt parses", values_equivalent(r"\sqrt{9}", "3"))
    check("latex pi multiplication parses", values_equivalent(r"2\pi(5)", r"10\pi"))
    check("equation mismatch detected", bool(equation_mismatches("120 - 15.12 = 94.20.")))
    check("equivalent latex fraction equation passes", not equation_mismatches(r"\frac{1}{3 + 1} = \frac{1}{4}."))
    check(
        "ambiguous implicit denominator product is skipped",
        not equation_mismatches("P = \\pi(2^2) / \\pi(10^2) = 4/100 = 1/25."),
    )

    good_grid = {
        "section": "Math",
        "questionType": "student_produced_response",
        "correctAnswer": "3.5",
        "acceptableAnswers": ["3.5", "3.50", "7/2"],
        "explanation": {"correct": "The final value is 7 / 2 = 3.5."},
    }
    check("grid acceptable equivalent", verify_acceptable_answers(good_grid) == [])
    check("grid math passes", verify_math_answer(good_grid)["status"] == "passed")

    bad_grid = {
        "section": "Math",
        "questionType": "student_produced_response",
        "correctAnswer": "94.20",
        "acceptableAnswers": ["94.20"],
        "explanation": {
            "correct": "Gross pay is 48 + 32 * 2.25 = 120. Fuel is 105 / 25 * 3.60 = 15.12. Net pay is 120 - 15.12 = 104.88."
        },
    }
    bad_result = verify_math_answer(bad_grid)
    check("final explanation contradiction fails", bad_result["status"] == "failed")
    check("final mismatch issue present", "explanation_final_value_mismatch" in bad_result["issues"])

    mc = {
        "section": "Math",
        "choices": {"A": "4", "B": "5", "C": "6", "D": "7"},
        "correctAnswer": "C",
        "expectedAnswer": "6",
        "explanation": "Solving gives x = 6.",
    }
    check("mc expected answer passes", verify_math_answer(mc)["status"] == "passed")

    pi_mc = {
        "section": "Math",
        "choices": {"A": r"$120\pi$", "B": r"$60\pi$", "C": r"$600\pi$", "D": r"$300\pi$"},
        "correctAnswer": "D",
        "explanation": {"correct": r"$V = \pi r^2 h = \pi(25)(12) = 300\pi$, so choice D is correct."},
    }
    check("mc latex pi final answer passes", verify_math_answer(pi_mc)["status"] == "passed")

    loose_letter = {
        "section": "Reading and Writing",
        "choices": {"A": "careful revision", "B": "new data", "C": "a broad claim", "D": "a contrast"},
        "correctAnswer": "A",
        "explanation": "The sentence is clear and accurate.",
    }
    explicit_letter = {**loose_letter, "explanation": "Choice A is correct because it is precise."}
    choice_text = {**loose_letter, "explanation": "The best answer is careful revision."}
    choice_keywords = {**loose_letter, "explanation": "The revision is careful enough to fit the goal."}
    check("bare letter A is not accepted as substring", not explanation_mentions_correct_answer(loose_letter))
    check("explicit choice letter mention passes", explanation_mentions_correct_answer(explicit_letter))
    check("choice text mention passes", explanation_mentions_correct_answer(choice_text))
    check("choice keyword overlap passes", explanation_mentions_correct_answer(choice_keywords))


if __name__ == "__main__":
    main()
    print("math_verifier_tests: pass")
