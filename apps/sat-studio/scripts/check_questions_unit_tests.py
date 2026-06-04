import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.check_questions import build_topic_governance_plan, count_issue_types, is_integrity_blocked_row, issue_family


def assert_equal(actual, expected, message):
    if actual != expected:
        raise AssertionError(f"{message}: expected {expected!r}, got {actual!r}")


def test_topic_governance_prioritizes_visible_easy_medium_clones():
    overrepresented = {
        "participants": {
            "count": 6,
            "sampleIds": ["q-hard", "q-easy-ai", "q-hidden"],
        }
    }
    by_topic_rows = {
        "participants": [
            {"id": "q-hard", "difficulty": "Hard", "sourceType": "ai_generated"},
            {"id": "q-easy-ai", "difficulty": "Easy", "sourceType": "ai_generated"},
            {"id": "q-hidden", "difficulty": "Easy", "practicePool": "hidden_duplicate"},
            {"id": "q-remedial", "difficulty": "Easy", "practicePool": "remedial_pool"},
            {"id": "q-rejected", "difficulty": "Easy", "reviewStatus": "rejected"},
            {"id": "q-medium-generated", "difficulty": "Medium", "sourceFile": "archive-source-ai-bank.json"},
            {"id": "q-hard-2", "difficulty": "Hard", "sourceType": "ai_generated"},
        ]
    }

    plan = build_topic_governance_plan(overrepresented, by_topic_rows, keep_target=2)
    item = plan["participants"]

    assert_equal(item["visibleCount"], 4, "visible rows exclude remedial, hidden, and rejected")
    assert_equal(item["hiddenDuplicateCount"], 1, "hidden duplicate count")
    assert_equal(item["remedialPoolCount"], 1, "remedial pool count")
    assert_equal(item["rejectedCount"], 1, "rejected count")
    assert_equal(item["overflowCount"], 2, "overflow count")
    assert_equal(item["recommendedAction"], "review_or_hide_easy_medium_clones", "action")
    assert_equal(item["candidateIds"][:2], ["q-easy-ai", "q-medium-generated"], "candidate priority")


def test_topic_governance_monitors_topics_under_keep_target():
    overrepresented = {"functions": {"count": 2, "sampleIds": ["f1", "f2"]}}
    by_topic_rows = {
        "functions": [
            {"id": "f1", "difficulty": "Hard"},
            {"id": "f2", "difficulty": "Medium"},
        ]
    }

    plan = build_topic_governance_plan(overrepresented, by_topic_rows, keep_target=3)
    item = plan["functions"]

    assert_equal(item["overflowCount"], 0, "no overflow below target")
    assert_equal(item["recommendedAction"], "monitor", "monitor action")
    assert_equal(item["candidateIds"], [], "no candidates when topic is under target")


def test_issue_family_and_counts_are_stable():
    assert_equal(issue_family("duplicate_prompt:q1"), "duplicate_prompt", "duplicate family")
    assert_equal(issue_family("topic_overrepresented:hypotenuse:52_core_visible/90_total"), "topic_overrepresented", "topic family")
    assert_equal(issue_family("math:explanation_final_value_mismatch"), "math:explanation_final_value_mismatch", "math family")
    rows = [
        {"warnings": ["duplicate_prompt:q1", "topic_overrepresented:hypotenuse:52_core_visible/90_total"]},
        {"warnings": ["duplicate_prompt:q2"]},
    ]
    assert_equal(
        count_issue_types(rows, "warnings"),
        {"duplicate_prompt": 2, "topic_overrepresented": 1},
        "issue counts",
    )


def test_structural_study_blocking_issues_are_blocked_not_critical():
    assert_equal(
        is_integrity_blocked_row({"sourceFile": "antigravity-bank.json", "issues": ["missing_explanation"]}),
        True,
        "missing explanation blocks study",
    )
    assert_equal(
        is_integrity_blocked_row({"sourceFile": "antigravity-bank.json", "issues": ["mc_missing_A_D_choices"]}),
        True,
        "missing choices blocks study",
    )
    assert_equal(
        is_integrity_blocked_row({"sourceFile": "antigravity-bank.json", "issues": ["math:explanation_final_value_mismatch"]}),
        False,
        "non-structural math issue remains critical outside blocked sources",
    )
    assert_equal(
        is_integrity_blocked_row({"sourceFile": "opensat-pinesat.json", "issues": ["math:explanation_final_value_mismatch"]}),
        True,
        "opensat source issues remain blocked source rows",
    )


if __name__ == "__main__":
    test_topic_governance_prioritizes_visible_easy_medium_clones()
    test_topic_governance_monitors_topics_under_keep_target()
    test_issue_family_and_counts_are_stable()
    test_structural_study_blocking_issues_are_blocked_not_critical()
    print("check_questions_unit_tests passed")
