import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.enrich_sat_training_metadata import (
    enrich_question,
    infer_math_tool_tag,
    infer_multi_step_level,
    infer_semantic_field,
    skeleton_id,
    template_form_id,
)


def assert_equal(actual, expected, message):
    if actual != expected:
        raise AssertionError(f"{message}: expected {expected!r}, got {actual!r}")


def assert_true(value, message):
    if not value:
        raise AssertionError(message)


def test_semantic_field_uses_subject_signal():
    question = {
        "section": "Reading and Writing",
        "domain": "Information and Ideas",
        "skill": "Central Ideas and Details",
        "difficulty": "Medium",
        "prompt": "Researchers studying bacterial cells found that temperature changed the organism's growth rate.",
    }
    assert_equal(infer_semantic_field(question), "science", "science semantic field")


def test_math_tool_tag_identifies_desmos_and_mental():
    graph_question = {
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "prompt": "The graph of y = x^2 - 4 and the line y = 2x intersect at two points. What is the x-coordinate of one intersection?",
    }
    easy_question = {
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear equations in one variable",
        "difficulty": "Easy",
        "prompt": "If 3x + 5 = 26, what is x?",
    }
    assert_equal(infer_math_tool_tag(graph_question), "desmos_helpful", "graph item tool tag")
    assert_equal(infer_math_tool_tag(easy_question), "mental", "easy arithmetic tool tag")


def test_multi_step_level_catches_cross_text_and_hard_math():
    rw = {
        "section": "Reading and Writing",
        "domain": "Craft and Structure",
        "skill": "Cross-Text Connections",
        "difficulty": "Medium",
        "prompt": "Text 1 claims that the discovery changed the field. Text 2 qualifies that claim by noting later evidence.",
    }
    math = {
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Two-variable data",
        "difficulty": "Hard",
        "prompt": "A table and graph model a survey. Which of the following must be true about the least-squares line?",
    }
    assert_equal(infer_multi_step_level(rw), "synthesis", "cross-text level")
    assert_equal(infer_multi_step_level(math), "synthesis", "hard math synthesis level")


def test_enrichment_preserves_pool_and_adds_crucible_label():
    question = {
        "id": "q-hard",
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Equivalent expressions",
        "difficulty": "Hard",
        "reviewStatus": "reviewed",
        "practicePool": "remedial_pool",
        "skeletonDiversity": {"practicePool": "remedial_pool"},
        "prompt": "Which expression is equivalent to (x + 2)(x - 5)?",
    }
    before_template = template_form_id(question)
    before_skeleton = skeleton_id(question)
    changed = enrich_question(question)
    assert_true("skeletonDiversity" in changed, "skeleton metadata changed")
    assert_equal(question["practicePool"], "remedial_pool", "top-level practice pool preserved")
    assert_equal(question["skeletonDiversity"]["practicePool"], "remedial_pool", "nested practice pool preserved")
    assert_equal(question["templateFormId"], before_template, "stable template id")
    assert_equal(question["skeletonId"], before_skeleton, "stable skeleton id")
    assert_equal(question["cruciblePool"], "crucible_pool", "hard reviewed item gets crucible label")


if __name__ == "__main__":
    test_semantic_field_uses_subject_signal()
    test_math_tool_tag_identifies_desmos_and_mental()
    test_multi_step_level_catches_cross_text_and_hard_math()
    test_enrichment_preserves_pool_and_adds_crucible_label()
    print("sat_training_metadata_enrichment_unit_tests passed")
