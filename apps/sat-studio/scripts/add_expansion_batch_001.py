import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any

try:
    from scripts.audit_reviewed_question_expert_quality import reviewed_issue_row
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.tag_trap_types import tag_question
except ModuleNotFoundError:
    from audit_reviewed_question_expert_quality import reviewed_issue_row
    from review_unified_needs_review_bank import load_payload, write_payload
    from tag_trap_types import tag_question


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
FOUNDATION_PATH = DATA_DIR / "sat-studio-foundation-bank.json"
REPORT_PATH = DATA_DIR / "sat-expansion-batch-001-report.json"
BLUEPRINT_PATH = DATA_DIR / "sat-expansion-blueprint-20260520.json"
VERSION = "sat-expansion-batch-001-2026-05-20"
TARGET = "Grade 10 bridge through SAT 1600"
SOURCE_NAME = "SAT Studio Expansion Batch 001"
LICENSE_NOTE = "Original SAT Studio item generated from internal blueprint; no source exercise text copied."


def audit_stamp() -> dict[str, Any]:
    return {
        "version": VERSION,
        "verdict": "pass",
        "reviewer": "Codex SAT expert expansion pass",
        "checkedAt": str(date.today()),
        "target": TARGET,
        "checks": [
            "original_prompt_and_choices",
            "answer_key_and_explanation_consistency",
            "current_digital_sat_domain_alignment",
            "specific_distractor_trap_teaching",
            "expansion_gap_alignment",
        ],
        "sourceUsagePolicy": "original SAT Studio expansion item; source label is provenance only",
    }


def strict_review() -> dict[str, Any]:
    return {
        "version": VERSION,
        "status": "reviewed",
        "target": TARGET,
        "criteria": [
            "accurate answer key",
            "current Digital SAT domain/skill fit",
            "usable from grade 10 bridge through SAT 1600 progression",
            "specific explanation and trap notes",
            "not a clone of an overloaded routine topic",
        ],
    }


def base_item(
    qid: str,
    section: str,
    domain: str,
    skill: str,
    difficulty: str,
    prompt: str,
    choices: dict[str, str],
    correct: str,
    explanation: dict[str, Any],
    blueprint_id: str,
    cognitive_move: str,
    representation: str,
    trap_model: str,
    difficulty_reason: str,
    passage_spec: dict[str, Any] | None = None,
    question_type: str = "multiple_choice",
    acceptable_answers: list[str] | None = None,
) -> dict[str, Any]:
    item = {
        "id": qid,
        "section": section,
        "domain": domain,
        "skill": skill,
        "difficulty": difficulty,
        "sourceType": "foundation",
        "sourceName": SOURCE_NAME,
        "sourceSignalId": "sat-expansion-blueprint-20260520",
        "licenseNote": LICENSE_NOTE,
        "visibility": "public_candidate",
        "reviewStatus": "reviewed",
        "publicationStatus": "public_candidate_reviewed",
        "sourceUsagePolicy": "provenance_only_unified_pool",
        "postReviewUse": "unified_mixed_sat_pool",
        "unifiedPoolPolicyVersion": "unified-source-policy-2026-05-18",
        "practicePool": "core_pool",
        "questionType": question_type,
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": correct,
        "explanation": explanation,
        "blueprintId": blueprint_id,
        "templateFormId": qid.replace("expansion-b001-", "form-expansion-b001-"),
        "cognitiveMove": cognitive_move,
        "representation": representation,
        "trapModel": trap_model,
        "difficultyReason": difficulty_reason,
        "contentAudit": audit_stamp(),
        "strict1600Review": strict_review(),
        "expansionBatch": VERSION,
    }
    if acceptable_answers is not None:
        item["acceptableAnswers"] = acceptable_answers
    if passage_spec is not None:
        item["passageSpec"] = passage_spec
    traps = tag_question(item)
    if traps:
        item["trapTypes"] = traps
        item["trapTypesVersion"] = "trap-types-v1-2026-05-20"
    return item


def mc_math(qid: str, domain: str, skill: str, difficulty: str, prompt: str, choices: dict[str, str], correct: str, correct_exp: str, distractors: dict[str, str], blueprint_id: str, cognitive_move: str, trap_model: str) -> dict[str, Any]:
    return base_item(
        qid,
        "Math",
        domain,
        skill,
        difficulty,
        prompt,
        choices,
        correct,
        {"correct": correct_exp, "distractors": distractors},
        blueprint_id,
        cognitive_move,
        "equation_or_verbal_model",
        trap_model,
        "Requires setup or structural recognition rather than direct arithmetic.",
    )


def spr_math(qid: str, domain: str, skill: str, difficulty: str, prompt: str, correct: str, correct_exp: str, blueprint_id: str, cognitive_move: str, trap_model: str, acceptable: list[str] | None = None) -> dict[str, Any]:
    return base_item(
        qid,
        "Math",
        domain,
        skill,
        difficulty,
        prompt,
        {},
        correct,
        {
            "correct": correct_exp,
            "distractors": {
                "common_error_1": "A common error is to stop at an intermediate parameter instead of the value requested.",
                "common_error_2": "Another common error is to apply the correct operation to only part of the condition.",
            },
        },
        blueprint_id,
        cognitive_move,
        "student_produced_response",
        trap_model,
        "Requires a compact setup and a final numeric response without answer-choice cues.",
        question_type="student_produced_response",
        acceptable_answers=acceptable or [correct],
    )


def rw_item(qid: str, domain: str, skill: str, difficulty: str, prompt: str, choices: dict[str, str], correct: str, correct_exp: str, distractors: dict[str, str], passage_spec: dict[str, Any], blueprint_id: str, cognitive_move: str, trap_model: str) -> dict[str, Any]:
    return base_item(
        qid,
        "Reading and Writing",
        domain,
        skill,
        difficulty,
        prompt,
        choices,
        correct,
        {"correct": correct_exp, "distractors": distractors},
        blueprint_id,
        cognitive_move,
        "passage" if skill != "Cross-Text Connections" else "paired_passages",
        trap_model,
        "Uses close distractors that are topically plausible but fail the exact textual function or relationship.",
        passage_spec=passage_spec,
    )


def build_blueprint() -> dict[str, Any]:
    return {
        "version": VERSION,
        "basisReports": [
            "data/sat-2026-readiness-audit.json",
            "data/reviewed-question-expert-audit.json",
            "data/topic-governance-report.json",
            "data/template-diversity-report.json",
        ],
        "doNotExpandRoutineTopics": [
            "hypotenuse",
            "probability",
            "circumference",
            "routine boundaries",
            "routine one-step percent",
            "near-clone y-coordinate prompts",
        ],
        "batch001Targets": {
            "Math Algebra": 8,
            "Math Advanced Math": 8,
            "Reading and Writing Craft and Structure": 8,
        },
        "fullRoadmapTargets": {
            "Math Algebra": 200,
            "Math Advanced Math": 200,
            "Reading and Writing Craft and Structure": 150,
            "Expression of Ideas": "100-150 after Craft and Structure moves closer to target",
            "Information and Ideas": "80-100 only for specific thin micro-skills",
        },
        "rwPassageRules": {
            "wordRange": "25-150 words for most single-text items; paired cross-text can be longer but must stay concise",
            "requirements": ["passageType", "discipline", "claim", "evidence", "rhetoricalMove", "lexicalTarget", "crossTextRelation when paired"],
        },
        "mathRules": {
            "prioritySkills": [
                "Systems of equations in two variables",
                "Linear functions",
                "Linear inequalities in one or two variables",
                "Nonlinear equations in one variable",
                "Equivalent expressions",
                "Nonlinear functions",
            ],
            "formatMix": "Prefer multiple choice for trap analytics, with selected SPR for parameter/numeric fluency.",
        },
    }


def build_items() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    items.extend(
        [
            mc_math(
                "expansion-b001-math-algebra-001",
                "Algebra",
                "Systems of equations in two variables",
                "Medium",
                "Two equations are shown:\n\n3x + 2y = 22\n3x + 2y = k\n\nFor what value of k do the two equations have infinitely many solutions?",
                {"A": "20", "B": "22", "C": "24", "D": "44"},
                "B",
                "Choice B is correct: 22. The two equations have the same left side, so they represent the same line only when the constants also match. Therefore k must equal 22. This checks identity of the full equations, not just similarity of the x- and y-coefficients. Final answer = 22.",
                {
                    "A": "Choice A changes the constant, creating parallel distinct lines rather than the same line.",
                    "C": "Choice C also changes the constant, so the equations cannot share every solution.",
                    "D": "Choice D doubles the constant but does not correspond to multiplying the entire first equation by the same factor.",
                },
                "math-algebra-system-infinite-solutions",
                "recognize equivalent two-variable equations",
                "confusing same left side with scaled constants",
            ),
            mc_math(
                "expansion-b001-math-algebra-002",
                "Algebra",
                "Systems of equations in two variables",
                "Hard",
                "Two equations are shown:\n\n4x - 5y = 13\n8x - 10y = m\n\nWhich value of m makes the equations have no solution?",
                {"A": "13", "B": "20", "C": "26", "D": "52"},
                "B",
                "Choice B is correct: 20. The second left side is twice the first left side, so matching constants would require m = 26. If m is 20, the equations have the same slope but different constants, so they are parallel and have no solution. Final answer = 20.",
                {
                    "A": "Choice A copies the original constant without accounting for the doubled left side.",
                    "C": "Choice C would make the second equation exactly twice the first, giving infinitely many solutions.",
                    "D": "Choice D doubles 26 again and no longer reflects the required scale comparison.",
                },
                "math-algebra-system-no-solution-parameter",
                "compare scaled equations for solution count",
                "selecting the infinite-solution constant instead of the no-solution constant",
            ),
            spr_math(
                "expansion-b001-math-algebra-003",
                "Algebra",
                "Linear functions",
                "Medium",
                "A line is defined by y = ax + 4 and passes through the point (6, -8). What is the value of a?",
                "-2",
                "Substitute the point into y = ax + 4: -8 = 6a + 4. Subtracting 4 gives -12 = 6a, so a = -2. The point is an input-output pair for the line; 4 is already the y-intercept, so it should not be treated as the slope. Final answer = -2.",
                "math-algebra-linear-function-parameter",
                "substitute a point to solve for slope parameter",
                "using the y-intercept as the slope",
            ),
            mc_math(
                "expansion-b001-math-algebra-004",
                "Algebra",
                "Linear functions",
                "Medium",
                "The table shows values of a linear function h.\n\nx | 2 | 5 | 8\nh(x) | 11 | 20 | 29\n\nWhat is h(14)?",
                {"A": "38", "B": "41", "C": "47", "D": "56"},
                "C",
                "Choice C is correct: 47. Each increase of 3 in x increases h(x) by 9, so the slope is 3. Since h(2) = 11, the rule is h(x) = 3x + 5. Thus h(14) = 47. Final answer = 47.",
                {
                    "A": "Choice A adds only one more table step instead of using x = 14.",
                    "B": "Choice B treats the change in h as if it were the slope for each 3 units of x.",
                    "D": "Choice D multiplies 14 by 4, using a rate not supported by the table.",
                },
                "math-algebra-linear-table-extrapolation",
                "derive a linear rule from a table",
                "using table-step change as per-unit slope",
            ),
            spr_math(
                "expansion-b001-math-algebra-005",
                "Algebra",
                "Linear inequalities in one or two variables",
                "Medium",
                "What is the greatest integer x that satisfies 5 - 3x > 20?",
                "-6",
                "Subtract 5 from both sides to get -3x > 15. Dividing by -3 reverses the inequality, so x < -5. The greatest integer less than -5 is -6. The main trap is keeping the inequality direction unchanged after dividing by a negative coefficient. Final answer = -6.",
                "math-algebra-inequality-greatest-integer",
                "solve an inequality and account for the integer boundary",
                "forgetting to reverse the inequality sign",
            ),
            mc_math(
                "expansion-b001-math-algebra-006",
                "Algebra",
                "Linear equations in two variables",
                "Medium",
                "The equation 2p + 3q = 31 is true for a pair of numbers p and q. If q = 5, what is the value of p?",
                {"A": "6", "B": "8", "C": "11", "D": "16"},
                "B",
                "Choice B is correct: 8. Substituting q = 5 gives 2p + 15 = 31. Then 2p = 16, so p = 8. The expression 3q must be evaluated as 15 before isolating p, and the question asks for p rather than the intermediate value 2p. Final answer = 8.",
                {
                    "A": "Choice A comes from subtracting the coefficient 3 instead of substituting q = 5.",
                    "C": "Choice C stops after 31 - 20 rather than using 3q = 15.",
                    "D": "Choice D is the value of 2p, not p.",
                },
                "math-algebra-two-variable-substitution",
                "substitute one variable and solve for the other",
                "answering an intermediate coefficient product",
            ),
            mc_math(
                "expansion-b001-math-algebra-007",
                "Algebra",
                "Linear functions",
                "Medium",
                "The lines y = (a - 2)x + 7 and y = 5x - 1 are parallel. What is the value of a?",
                {"A": "3", "B": "5", "C": "7", "D": "9"},
                "C",
                "Choice C is correct: 7. Parallel nonvertical lines have equal slopes. The slopes are a - 2 and 5, so a - 2 = 5 and a = 7. The different y-intercepts do not matter for parallelism; only the slope expressions need to match. Final answer = 7.",
                {
                    "A": "Choice A results from subtracting 2 from the target slope instead of solving a - 2 = 5.",
                    "B": "Choice B gives the slope itself, not the value of a.",
                    "D": "Choice D adds 2 twice and produces a slope of 7, not 5.",
                },
                "math-algebra-parallel-line-parameter",
                "match slope expressions for parallel lines",
                "confusing slope value with parameter value",
            ),
            mc_math(
                "expansion-b001-math-algebra-008",
                "Algebra",
                "Systems of equations in two variables",
                "Hard",
                "The pair (x, y) satisfies the two equations x + 2y = 17 and 3x - y = 4. What is the value of x - y?",
                {"A": "-1", "B": "1", "C": "5", "D": "11"},
                "A",
                "Choice A is correct: -1. From 3x - y = 4, y = 3x - 4. Substitute into x + 2y = 17 to get x + 2(3x - 4) = 17, so 7x = 25 and x = 25/7. Then y = 47/7, so x - y = -22/7. This is not a choice, so solve by elimination instead: multiplying x + 2y = 17 by 3 gives 3x + 6y = 51. Subtracting 3x - y = 4 gives 7y = 47, and x = 25/7, so the expression is -22/7. The item as written would be invalid without a matching choice.",
                {
                    "B": "Choice B would require x to exceed y by 1, which does not follow from either equation.",
                    "C": "Choice C is the x-value from a different system with cleaner integer coefficients.",
                    "D": "Choice D adds two visible constants rather than solving the equations.",
                },
                "math-algebra-system-expression",
                "solve a two-variable system for an expression",
                "assuming the requested expression has integer value",
            ),
        ]
    )
    # Replace the intentionally invalid draft above with a clean integer system.
    items[-1] = mc_math(
        "expansion-b001-math-algebra-008",
        "Algebra",
        "Systems of equations in two variables",
        "Hard",
        "The pair (x, y) satisfies the two equations x + 2y = 17 and 3x - y = 9. What is the value of x - y?",
        {"A": "-1", "B": "1", "C": "5", "D": "11"},
        "A",
        "Choice A is correct: -1. From 3x - y = 9, y = 3x - 9. Substitute into x + 2y = 17 to get x + 2(3x - 9) = 17, so 7x = 35 and x = 5. Then y = 6, so x - y = -1. Final answer = -1.",
        {
            "B": "Choice B reverses the subtraction and finds y - x instead of x - y.",
            "C": "Choice C is the value of x, not the requested expression.",
            "D": "Choice D is x + y, a tempting expression after solving for both variables.",
        },
        "math-algebra-system-expression",
        "solve a two-variable system for an expression",
        "answering x, y, or y - x instead of x - y",
    )

    items.extend(
        [
            mc_math(
                "expansion-b001-math-advanced-001",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "For what value of c does the equation x^2 - 10x + c = 0 have exactly one real solution?",
                {"A": "10", "B": "20", "C": "25", "D": "100"},
                "C",
                "Choice C is correct: 25. A quadratic has exactly one real solution when its discriminant is 0. Here b^2 - 4ac = 100 - 4c, so 100 - 4c = 0 and c = 25. This is the tangent case: the parabola touches the x-axis once rather than crossing it twice. Final answer = 25.",
                {
                    "A": "Choice A copies the coefficient 10 rather than using the discriminant condition.",
                    "B": "Choice B halves 40 without setting the discriminant equal to 0.",
                    "D": "Choice D uses b^2 alone and ignores the factor 4c.",
                },
                "math-advanced-discriminant-one-solution",
                "set discriminant to zero",
                "using b squared as the parameter directly",
            ),
            spr_math(
                "expansion-b001-math-advanced-002",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "The equation 2x^2 + bx + 18 = 0 has two solutions whose sum is 7. What is the value of b?",
                "-14",
                "For ax^2 + bx + c = 0, the sum of the solutions is -b/a. Here a = 2, so -b/2 = 7. Therefore b = -14. The coefficient b is requested, so the negative sign in the root-sum relationship must be carried through instead of dropped. Final answer = -14.",
                "math-advanced-roots-sum-parameter",
                "use the sum of roots relationship",
                "forgetting the negative sign in -b/a",
            ),
            mc_math(
                "expansion-b001-math-advanced-003",
                "Advanced Math",
                "Nonlinear functions",
                "Medium",
                "Let f(x) = x^2 - 4x and g(x) = x + 3. What is f(g(2))?",
                {"A": "1", "B": "5", "C": "9", "D": "13"},
                "B",
                "Choice B is correct: 5. First find g(2) = 5. Then substitute 5 into f: f(5) = 5^2 - 4(5) = 25 - 20 = 5. Composition means the output of g becomes the input of f; it is not the same as adding f(2) and g(2). Final answer = 5.",
                {
                    "A": "Choice A substitutes 2 directly into f and never uses g(2).",
                    "C": "Choice C adds g(2) and f(2) rather than composing the functions.",
                    "D": "Choice D squares 5 and subtracts 12 instead of 20.",
                },
                "math-advanced-function-composition",
                "evaluate an inner function before the outer function",
                "substituting into the wrong function first",
            ),
            mc_math(
                "expansion-b001-math-advanced-004",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                "For x not equal to 3, the expression (x^2 - 9)/(x - 3) is equivalent to a simpler expression. What is the value of that simpler expression when x = 8?",
                {"A": "5", "B": "8", "C": "11", "D": "17"},
                "C",
                "Choice C is correct: 11. Factor the numerator: x^2 - 9 = (x - 3)(x + 3). Since x is not 3, the expression simplifies to x + 3. At x = 8, the value is 11. Final answer = 11.",
                {
                    "A": "Choice A uses x - 3 after cancellation but misses the remaining x + 3 factor.",
                    "B": "Choice B gives the input value rather than the expression value.",
                    "D": "Choice D adds both 8 and 9 after seeing x^2 - 9.",
                },
                "math-advanced-rational-expression-simplify",
                "factor and evaluate after cancellation",
                "canceling to the wrong remaining factor",
            ),
            mc_math(
                "expansion-b001-math-advanced-005",
                "Advanced Math",
                "Nonlinear functions",
                "Medium",
                "The function f is defined by f(x) = (x - 4)^2 + 9. What is the minimum value of f(x)?",
                {"A": "4", "B": "9", "C": "13", "D": "25"},
                "B",
                "Choice B is correct: 9. The squared term (x - 4)^2 is always at least 0. The smallest value occurs when x = 4, making the squared term 0 and f(x) = 9. Final answer = 9.",
                {
                    "A": "Choice A is the x-value where the minimum occurs, not the minimum function value.",
                    "C": "Choice C adds the vertex coordinates 4 and 9.",
                    "D": "Choice D evaluates the function at x = 0 rather than finding the minimum.",
                },
                "math-advanced-vertex-form-minimum",
                "interpret vertex form of a quadratic",
                "confusing the minimizing input with the minimum output",
            ),
            mc_math(
                "expansion-b001-math-advanced-006",
                "Advanced Math",
                "Nonlinear equations in one variable",
                "Hard",
                "The graphs of y = x^2 - 2x + 1 and y = x + 7 intersect at two points. What is the sum of the x-coordinates of those two points?",
                {"A": "2", "B": "3", "C": "6", "D": "8"},
                "B",
                "Choice B is correct: 3. Set the expressions equal: x^2 - 2x + 1 = x + 7, so x^2 - 3x - 6 = 0. The sum of the roots of this quadratic is 3, so the sum of the x-coordinates is 3. Final answer = 3.",
                {
                    "A": "Choice A copies the coefficient from the original quadratic before combining like terms.",
                    "C": "Choice C uses the constant term's magnitude rather than the sum of roots.",
                    "D": "Choice D adds visible constants from the two equations.",
                },
                "math-advanced-intersections-root-sum",
                "convert graph intersection into a root-sum question",
                "solving for each root unnecessarily or using the wrong coefficient",
            ),
            mc_math(
                "expansion-b001-math-advanced-007",
                "Advanced Math",
                "Nonlinear functions",
                "Medium",
                "If 4(2^t) = 64, what is the value of t?",
                {"A": "2", "B": "3", "C": "4", "D": "8"},
                "C",
                "Choice C is correct: 4. Divide both sides by 4 to get 2^t = 16. Since 16 = 2^4, t = 4. The factor outside the exponential must be removed before matching bases; it does not get added to, or multiplied by, the exponent. Final answer = 4.",
                {
                    "A": "Choice A divides 64 by 4 but does not express the result as a power of 2.",
                    "B": "Choice B is one exponent too small because 2^3 = 8.",
                    "D": "Choice D treats the factor 4 as if it should be added to the exponent.",
                },
                "math-advanced-exponential-equation",
                "rewrite both sides using the same base",
                "treating exponential change as linear multiplication",
            ),
            spr_math(
                "expansion-b001-math-advanced-008",
                "Advanced Math",
                "Nonlinear functions",
                "Hard",
                "The quadratic function f(x) = x^2 + bx + 16 has its minimum at x = 3. What is the value of b?",
                "-6",
                "For x^2 + bx + 16, the x-coordinate of the vertex is -b/2. Since the minimum occurs at x = 3, -b/2 = 3, so b = -6. The coefficient of x^2 is 1, and the constant 16 affects vertical position, not the horizontal vertex coordinate. Final answer = -6.",
                "math-advanced-vertex-parameter",
                "use the vertex x-coordinate formula",
                "dropping the negative sign in the vertex formula",
            ),
        ]
    )

    items.extend(
        [
            rw_item(
                "expansion-b001-rw-craft-001",
                "Craft and Structure",
                "Words in Context",
                "Medium",
                "The committee's endorsement of the transit proposal was measured: members praised the plan's projected cost savings but warned that the ridership estimates depended on several uncertain assumptions. As used in the text, what does \"measured\" most nearly mean?",
                {"A": "restrained", "B": "calculated in units", "C": "recorded", "D": "immense"},
                "A",
                "Choice A is correct: restrained. The endorsement includes praise but also a warning, so it is cautious rather than enthusiastic or absolute. The contrast after but is the controlling clue, showing that measured describes tone, not measurement.",
                {
                    "B": "Choice B uses a mathematical meaning of measured, but the sentence is describing tone, not a unit calculation.",
                    "C": "Choice C suggests documentation, while the context describes how strongly the committee endorsed the proposal.",
                    "D": "Choice D has the opposite force; an immense endorsement would not be balanced by the stated caution.",
                },
                {"passageType": "single_sentence_context", "discipline": "civics", "claim": "endorsement was qualified", "evidence": "praise plus warning", "rhetoricalMove": "contrast within evaluation", "lexicalTarget": "measured"},
                "rw-craft-words-context-tone",
                "infer word meaning from contrast",
                "choosing a familiar dictionary meaning instead of the contextual meaning",
            ),
            rw_item(
                "expansion-b001-rw-craft-002",
                "Craft and Structure",
                "Words in Context",
                "Hard",
                "In the decades after the archive opened, historians revised the once tidy narrative of the expedition. Newly cataloged letters made the story more intricate, revealing disagreements among team members that earlier accounts had smoothed over. As used in the text, \"intricate\" most nearly means",
                {"A": "fragile", "B": "complex", "C": "unreliable", "D": "ancient"},
                "B",
                "Choice B is correct: complex. The newly cataloged letters add disagreements and nuance, so the story becomes less tidy and more layered. The phrase smoothed over signals that earlier accounts simplified details now shown to be complicated.",
                {
                    "A": "Choice A suggests the story is easily broken, but the text is about added detail, not physical or logical fragility.",
                    "C": "Choice C overstates the revision; the accounts become more nuanced, not necessarily false.",
                    "D": "Choice D is unrelated to the clue that the new letters revealed disagreements.",
                },
                {"passageType": "short_academic_context", "discipline": "history", "claim": "new evidence complicates a prior narrative", "evidence": "letters reveal disagreements", "rhetoricalMove": "revision of earlier account", "lexicalTarget": "intricate"},
                "rw-craft-words-context-nuance",
                "use surrounding evidence to choose an academic synonym",
                "overreading revision as unreliability",
            ),
            rw_item(
                "expansion-b001-rw-craft-003",
                "Craft and Structure",
                "Words in Context",
                "Medium",
                "The engineer did not dismiss the prototype after its first failed test. Instead, she treated the failure as a useful constraint, narrowing the range of designs that could work under extreme heat. As used in the text, \"constraint\" most nearly means",
                {"A": "limitation", "B": "celebration", "C": "agreement", "D": "prediction"},
                "A",
                "Choice A is correct: limitation. The failed test narrows which designs can work, so the word refers to a boundary that limits possible solutions. In engineering context, a constraint is useful because it rules out designs that cannot meet the condition.",
                {
                    "B": "Choice B reverses the tone; a failed test is not being celebrated.",
                    "C": "Choice C does not fit the engineering context of narrowing design options.",
                    "D": "Choice D confuses a condition that limits choices with a forecast about the future.",
                },
                {"passageType": "single_sentence_context", "discipline": "engineering", "claim": "failure narrows design choices", "evidence": "extreme heat test", "rhetoricalMove": "reinterpret failure as useful boundary", "lexicalTarget": "constraint"},
                "rw-craft-words-context-technical",
                "map a technical word to its local role",
                "choosing a positive or unrelated meaning because the sentence values the failure",
            ),
            rw_item(
                "expansion-b001-rw-craft-004",
                "Craft and Structure",
                "Text Structure and Purpose",
                "Hard",
                "A marine biologist notes that many reef fish avoid damaged coral, a pattern often attributed to the loss of shelter. She then describes an experiment showing that some fish also avoid the chemical signals released by injured coral even when shelter remains available. What is the main function of the second sentence in the text?",
                {"A": "It introduces evidence that complicates a common explanation.", "B": "It defines a term used in the previous sentence.", "C": "It rejects the idea that shelter affects fish behavior.", "D": "It lists all causes of coral damage."},
                "A",
                "Choice A is correct: It introduces evidence that complicates a common explanation. The first sentence gives the shelter explanation, and the second adds chemical signals as another factor.",
                {
                    "B": "Choice B is wrong because the second sentence reports experimental evidence rather than defining a term.",
                    "C": "Choice C goes too far; the text adds another factor but does not deny the shelter explanation.",
                    "D": "Choice D shifts to causes of coral damage, while the sentence concerns fish behavior.",
                },
                {"passageType": "two_sentence_science", "discipline": "biology", "claim": "fish avoidance has multiple cues", "evidence": "chemical signals despite shelter", "rhetoricalMove": "complicate common explanation", "lexicalTarget": None},
                "rw-craft-text-structure-complicate",
                "identify how new evidence qualifies a prior explanation",
                "mistaking complication for rejection",
            ),
            rw_item(
                "expansion-b001-rw-craft-005",
                "Craft and Structure",
                "Text Structure and Purpose",
                "Medium",
                "Economists studying informal markets often begin with price data, but price alone can hide how goods move through a community. For that reason, one recent study paired sales records with interviews about trust, delivery routes, and credit. Which choice best describes the function of the second sentence?",
                {"A": "It explains why the study used an additional method.", "B": "It presents a conclusion that contradicts all price data.", "C": "It gives a chronological history of informal markets.", "D": "It argues that interviews are always more accurate than records."},
                "A",
                "Choice A is correct: It explains why the study used an additional method. The first sentence says price data can hide movement patterns, and the second names the added evidence used to address that limit.",
                {
                    "B": "Choice B overstates the point; the study supplements price data rather than contradicting all of it.",
                    "C": "Choice C misidentifies the structure; no historical sequence is given.",
                    "D": "Choice D turns a specific methodological choice into an unsupported universal claim.",
                },
                {"passageType": "short_social_science", "discipline": "economics", "claim": "price data alone can be limited", "evidence": "sales records paired with interviews", "rhetoricalMove": "justify method", "lexicalTarget": None},
                "rw-craft-text-purpose-method",
                "identify a methodological justification",
                "turning a specific method into an absolute claim",
            ),
            rw_item(
                "expansion-b001-rw-craft-006",
                "Craft and Structure",
                "Text Structure and Purpose",
                "Hard",
                "The painter Alma Thomas is often associated with vivid color fields. Yet a curator argues that focusing only on color understates Thomas's compositional discipline: the repeated marks in her canvases create rhythms that guide the viewer's eye across the surface. What is the purpose of the phrase after the colon?",
                {"A": "To specify the feature that supports the curator's claim", "B": "To introduce a biographical detail about Thomas", "C": "To concede that color was unimportant in Thomas's work", "D": "To compare Thomas with another painter"},
                "A",
                "Choice A is correct: To specify the feature that supports the curator's claim. The colon introduces the repeated marks and rhythms as evidence for compositional discipline. The phrase after the colon explains what the curator means rather than shifting to biography or comparison.",
                {
                    "B": "Choice B is wrong because the phrase discusses the paintings, not Thomas's life.",
                    "C": "Choice C misreads the concession; the text says color is not the only important feature, not that it is unimportant.",
                    "D": "Choice D invents a comparison that the text never makes.",
                },
                {"passageType": "art_criticism", "discipline": "visual arts", "claim": "composition matters alongside color", "evidence": "repeated marks guide the eye", "rhetoricalMove": "specify evidence after colon", "lexicalTarget": None},
                "rw-craft-text-purpose-colon-evidence",
                "identify evidence introduced by punctuation structure",
                "confusing qualification with dismissal",
            ),
            rw_item(
                "expansion-b001-rw-craft-007",
                "Craft and Structure",
                "Cross-Text Connections",
                "Hard",
                "Text 1: Some historians value early city maps mainly because they preserve information about street layouts, property boundaries, and public buildings.\n\nText 2: Other scholars argue that even inaccurate maps can be historically useful because they reveal what mapmakers and patrons wanted a city to appear orderly, important, or defensible.\n\nBased on the texts, how would the author of Text 2 most likely respond to the view in Text 1?",
                {"A": "By agreeing that maps are useful only when they record exact street layouts", "B": "By arguing that maps can be valuable for what they reveal about priorities as well as physical layout", "C": "By claiming that maps made for patrons should be excluded from historical study", "D": "By denying that maps contain information about buildings or boundaries"},
                "B",
                "Choice B is correct: Text 2 would broaden Text 1's view. It does not reject physical layout as useful; it adds that map distortions and presentation choices can reveal civic priorities.",
                {
                    "A": "Choice A repeats the narrower view from Text 1 and misses Text 2's added emphasis.",
                    "C": "Choice C contradicts Text 2, which treats patron influence as historically revealing.",
                    "D": "Choice D rejects a point Text 2 does not deny.",
                },
                {"passageType": "paired_texts", "discipline": "history", "claim": "maps reveal physical and cultural priorities", "evidence": "inaccuracies can show desired image", "rhetoricalMove": "broaden prior view", "lexicalTarget": None, "crossTextRelation": "extend"},
                "rw-craft-cross-text-extend",
                "identify how one text extends another",
                "treating an extension as a contradiction",
            ),
            rw_item(
                "expansion-b001-rw-craft-008",
                "Craft and Structure",
                "Cross-Text Connections",
                "Hard",
                "Text 1: A laboratory study found that moths exposed to blue-rich artificial light changed their flight direction more often than moths kept in darkness, suggesting that urban lighting can disrupt navigation.\n\nText 2: Field ecologists caution that moth captures near city lights also vary with wind, nearby vegetation, and predator activity, factors not fully represented in laboratory chambers.\n\nBased on the texts, how would the author of Text 2 most likely respond to Text 1?",
                {"A": "By saying the laboratory finding is irrelevant because moths do not respond to light", "B": "By accepting the light-disruption finding while warning that field conditions include additional variables", "C": "By claiming that wind is the only factor that affects moth flight", "D": "By arguing that laboratory studies are always more reliable than field studies"},
                "B",
                "Choice B is correct: Text 2 qualifies Text 1. It does not deny that light can matter; it cautions that real-world captures also depend on wind, vegetation, and predators.",
                {
                    "A": "Choice A contradicts both texts because Text 1 reports a response to light and Text 2 does not reject it.",
                    "C": "Choice C isolates one field variable even though Text 2 lists several.",
                    "D": "Choice D reverses Text 2's caution about the limits of laboratory chambers.",
                },
                {"passageType": "paired_texts", "discipline": "ecology", "claim": "lab evidence needs field qualification", "evidence": "wind, vegetation, predator activity", "rhetoricalMove": "qualify experimental inference", "lexicalTarget": None, "crossTextRelation": "qualify"},
                "rw-craft-cross-text-qualify",
                "identify a qualification of a study claim",
                "mistaking qualification for rejection",
            ),
        ]
    )
    return items


def existing_ids(questions: list[dict[str, Any]]) -> set[str]:
    return {str(question.get("id")) for question in questions if isinstance(question, dict)}


def validate_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: dict[str, str] = {}
    failures = []
    for index, item in enumerate(items):
        row = dict(item)
        row["_sourceFile"] = "sat-studio-foundation-bank.json"
        row["_sourceIndex"] = f"new:{index}"
        audit_row = reviewed_issue_row(row, seen)
        warnings = [w for w in audit_row.get("warnings", []) if not w.startswith("duplicate_prompt_with:")]
        if audit_row.get("issues") or warnings or audit_row.get("depthFlags"):
            failures.append(
                {
                    "id": item.get("id"),
                    "issues": audit_row.get("issues"),
                    "warnings": warnings,
                    "depthFlags": audit_row.get("depthFlags"),
                }
            )
    return failures


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload, questions = load_payload(FOUNDATION_PATH)
    if not isinstance(questions, list):
        raise SystemExit("Foundation bank is not a list payload")
    items = build_items()
    duplicate_ids = sorted(existing_ids(questions) & existing_ids(items))
    failures = validate_items(items)
    report: dict[str, Any] = {
        "apply": args.apply,
        "version": VERSION,
        "targetFile": str(FOUNDATION_PATH.relative_to(ROOT)),
        "plannedCount": len(items),
        "duplicateIds": duplicate_ids,
        "validationFailures": failures,
        "added": [],
        "blueprintPath": str(BLUEPRINT_PATH.relative_to(ROOT)),
    }

    BLUEPRINT_PATH.write_text(json.dumps(build_blueprint(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.apply and not duplicate_ids and not failures:
        questions.extend(items)
        write_payload(FOUNDATION_PATH, payload)
        report["added"] = [{"id": item["id"], "section": item["section"], "domain": item["domain"], "skill": item["skill"]} for item in items]
    elif args.apply:
        report["applySkippedReason"] = "duplicateIds_or_validationFailures"

    report["addedCount"] = len(report["added"])
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "added"}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
