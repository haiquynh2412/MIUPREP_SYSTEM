import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.audit_sat_2026_readiness import (
    OFFICIAL_RW,
    additional_needed_to_reach_pct,
    domain_distribution,
    format_stats,
    is_blocked_for_study,
    is_public_candidate_ready,
    normalize_skill,
)


def assert_equal(actual, expected, message):
    if actual != expected:
        raise AssertionError(f"{message}: expected {expected!r}, got {actual!r}")


def test_additional_needed_formula():
    assert_equal(additional_needed_to_reach_pct(15, 100, 20), 7, "add-only target count")
    assert_equal(additional_needed_to_reach_pct(25, 100, 20), 0, "already above target")


def test_domain_distribution_marks_under_and_over():
    rows = (
        [{"section": "Reading and Writing", "domain": "Information and Ideas"} for _ in range(5)]
        + [{"section": "Reading and Writing", "domain": "Craft and Structure"} for _ in range(5)]
        + [{"section": "Reading and Writing", "domain": "Expression of Ideas"} for _ in range(2)]
        + [{"section": "Reading and Writing", "domain": "Standard English Conventions"} for _ in range(8)]
    )
    by_domain = {row["domain"]: row for row in domain_distribution(rows, "Reading and Writing", OFFICIAL_RW)}
    assert_equal(by_domain["Expression of Ideas"]["balance"], "underrepresented", "expression gap")
    assert_equal(by_domain["Standard English Conventions"]["balance"], "overrepresented", "sec surplus")


def test_skill_aliases():
    assert_equal(normalize_skill("Cross-Text Connection"), "Cross-Text Connections", "cross-text alias")
    assert_equal(
        normalize_skill("Command of Evidence: Quantitative"),
        "Command of Evidence",
        "command evidence alias",
    )
    assert_equal(normalize_skill("Linear functions and slope"), "Linear functions", "linear functions alias")


def test_public_candidate_gate_and_blocking():
    row = {
        "id": "q1",
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear functions",
        "difficulty": "Medium",
        "sourceType": "sat_1590",
        "reviewStatus": "reviewed",
        "publicationStatus": "public_candidate_reviewed",
        "visibility": "public_candidate",
        "contentAudit": {"verdict": "pass"},
        "questionType": "multiple_choice",
    }
    assert is_public_candidate_ready(row)
    blocked = {**row, "contentAudit": {"verdict": "fail"}}
    assert is_blocked_for_study(blocked)
    assert not is_public_candidate_ready(blocked)


def test_format_stats_grid_and_hard_context():
    rows = [
        {
            "id": "m1",
            "section": "Math",
            "domain": "Algebra",
            "skill": "Linear equations in one variable",
            "difficulty": "Hard",
            "questionType": "student_produced_response",
            "prompt": "A study models the cost of a service with a line on the xy-plane. "
            "The table gives several prices and the rate changes after a fixed fee is added. "
            "What is the value of the slope in the model?",
        },
        {
            "id": "m2",
            "section": "Math",
            "domain": "Advanced Math",
            "skill": "Equivalent expressions",
            "difficulty": "Medium",
            "questionType": "multiple_choice",
            "prompt": "Which expression is equivalent?",
        },
    ]
    stats = format_stats(rows)
    assert_equal(stats["mathGridIn"], 1, "grid-in count")
    assert_equal(stats["mathGridInPct"], 50.0, "grid-in pct")
    assert_equal(stats["hardMultiStepMathHeuristic"], 1, "hard context heuristic")


def main():
    test_additional_needed_formula()
    test_domain_distribution_marks_under_and_over()
    test_skill_aliases()
    test_public_candidate_gate_and_blocking()
    test_format_stats_grid_and_hard_context()
    print("sat_2026_readiness_unit_tests passed")


if __name__ == "__main__":
    main()
