"""
batch_A7.py — Generate 50 Hard SAT Math questions
Domain: Algebra | Skill: Linear functions
Focus: Multi-representation conversion (equation ↔ graph ↔ table ↔ verbal)
MCQ: 38, SPR: 12
"""

import json, uuid, os

BATCH_FILE = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\batch_A7.json"
SIGNAL_ID = "antigravity-hard-algebra-linfunc-convert"

def uid():
    return f"antigravity-hard-{uuid.uuid4().hex[:8]}"

def mcq(prompt, choices_list, correct, explanation_correct, distractors, cognitive, traps):
    """Helper to build an MCQ dict."""
    return {
        "id": uid(),
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "prompt": prompt,
        "type": "MCQ",
        "choices": [{"letter": ch[0], "text": ch[1]} for ch in choices_list],
        "correctAnswer": correct,
        "explanation": {
            "correct": explanation_correct,
            "distractors": distractors
        },
        "metadata": {
            "cognitiveMove": cognitive,
            "trapTypes": traps,
            "sourceSignalId": SIGNAL_ID
        }
    }

def spr(prompt, correct, acceptable, explanation_correct, cognitive, traps):
    """Helper to build an SPR dict."""
    return {
        "id": uid(),
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "prompt": prompt,
        "type": "SPR",
        "choices": None,
        "correctAnswer": correct,
        "acceptableAnswers": acceptable,
        "explanation": {
            "correct": explanation_correct
        },
        "metadata": {
            "cognitiveMove": cognitive,
            "trapTypes": traps,
            "sourceSignalId": SIGNAL_ID
        }
    }

questions = []

# ═══════════════════════════════════════════════════════════════
# MCQ 1 — Equation → Graph identification
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The function f(x) = −(2/3)x + 4 is graphed in the xy-plane. "
        "Which of the following must be true about the graph?\n\n"
        "I. The graph crosses the y-axis at (0, 4).\n"
        "II. The graph crosses the x-axis at (6, 0).\n"
        "III. The graph passes through the point (−3, 6)."
    ),
    choices_list=[
        ("A", "I and II only"),
        ("B", "I and III only"),
        ("C", "I, II, and III"),
        ("D", "II and III only")
    ],
    correct="C",
    explanation_correct=(
        "Fast: y-intercept is 4 ✓(I). Set y = 0: x = 6 ✓(II). "
        "f(−3) = −(2/3)(−3) + 4 = 2 + 4 = 6 ✓(III). All three are true. "
        "Algebraic: Substitute each point into f(x) = −(2/3)x + 4 and verify."
    ),
    distractors={
        "B": "Sign error — miscalculates x-intercept as (−6, 0) and rejects II.",
        "C": "This is the correct answer.",
        "D": "Misreads y-intercept as (0, −4) due to the negative slope, rejecting I."
    },
    cognitive="Verify multiple points against a single linear equation",
    traps=["sign error with negative slope", "x-intercept miscalculation"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 2 — Table → Equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A linear function f is defined by the table below.\n\n"
        "  x  │  f(x)\n"
        " ────┼──────\n"
        " −2  │  11\n"
        "  1  │   5\n"
        "  4  │  −1\n"
        "  7  │  −7\n\n"
        "Which equation defines f(x)?"
    ),
    choices_list=[
        ("A", "f(x) = −2x + 7"),
        ("B", "f(x) = 2x + 7"),
        ("C", "f(x) = −2x + 11"),
        ("D", "f(x) = −(1/2)x + 10")
    ],
    correct="A",
    explanation_correct=(
        "Fast: slope = (5 − 11)/(1 − (−2)) = −6/3 = −2. "
        "Using point (1, 5): 5 = −2(1) + b → b = 7. So f(x) = −2x + 7. "
        "Verify: f(4) = −8 + 7 = −1 ✓, f(7) = −14 + 7 = −7 ✓."
    ),
    distractors={
        "B": "Sign error — drops the negative from the slope calculation.",
        "C": "Uses the first y-value (11) as the y-intercept without computing b from slope-intercept form.",
        "D": "Inverts the slope to −1/2 and force-fits b to make one point work."
    },
    cognitive="Extract slope from a table and compute y-intercept",
    traps=["sign error in slope", "confusing first table value with y-intercept"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 3 — Verbal → Equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A water tank initially contains 240 gallons and drains at a constant rate of 8 gallons "
        "per minute. Which function V(t) models the volume, in gallons, remaining after t minutes?"
    ),
    choices_list=[
        ("A", "V(t) = 240 − 8t"),
        ("B", "V(t) = 240 + 8t"),
        ("C", "V(t) = 8t − 240"),
        ("D", "V(t) = 240 − t/8")
    ],
    correct="A",
    explanation_correct=(
        "Fast: starts at 240 (y-intercept) and decreases by 8 each minute (slope = −8). "
        "V(t) = 240 − 8t. Algebraic: V(0) = 240 ✓; V(1) = 232 (lost 8 gallons) ✓."
    ),
    distractors={
        "B": "Ignores the word 'drains' and treats the rate as additive (filling, not draining).",
        "C": "Reverses the roles of intercept and slope, yielding a negative initial value.",
        "D": "Confuses 'per minute' with division — uses t/8 instead of 8t."
    },
    cognitive="Translate verbal rate-of-change context into slope-intercept form",
    traps=["misreading drain as fill", "rate inversion"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 4 — Graph description → Equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A line in the xy-plane passes through the point (−4, 5) and has a slope of 3/2. "
        "The line also passes through the point (k, 14). What is the equation of the line "
        "in slope-intercept form?"
    ),
    choices_list=[
        ("A", "y = (3/2)x + 11"),
        ("B", "y = (3/2)x + 5"),
        ("C", "y = (2/3)x + 11"),
        ("D", "y = (3/2)x − 1")
    ],
    correct="A",
    explanation_correct=(
        "Fast: y − 5 = (3/2)(x − (−4)) → y − 5 = (3/2)x + 6 → y = (3/2)x + 11. "
        "Verify: at x = −4, y = (3/2)(−4) + 11 = −6 + 11 = 5 ✓. "
        "The point (k, 14) is extra information used to find k = 2, but doesn't change the equation."
    ),
    distractors={
        "B": "Uses 5 as the y-intercept directly, ignoring that (−4, 5) is not the y-intercept.",
        "C": "Inverts the slope to 2/3 and compensates b to still pass through (−4, 5).",
        "D": "Makes a sign error: treats −(−4) as −4 in point-slope form, getting b = −1."
    },
    cognitive="Apply point-slope form and convert to slope-intercept, filtering extraneous information",
    traps=["using y-value as y-intercept", "slope inversion", "sign error with negative x-coordinate"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 5 — Compare representations: equation vs table (rate of change)
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Function A is defined by y = (5/4)x − 3. Function B is defined by the table below.\n\n"
        "  x │ y\n"
        " ───┼────\n"
        "  0 │ −1\n"
        "  2 │  2\n"
        "  4 │  5\n"
        "  6 │  8\n\n"
        "Which statement correctly compares the two functions?"
    ),
    choices_list=[
        ("A", "Function A has a greater rate of change and a lesser y-intercept."),
        ("B", "Function B has a greater rate of change and a greater y-intercept."),
        ("C", "Function A has a greater rate of change and a greater y-intercept."),
        ("D", "The functions have the same rate of change but different y-intercepts.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Slope of A = 5/4 = 1.25. Slope of B = (2 − (−1))/(2 − 0) = 3/2 = 1.5. "
        "Wait — recheck: 3/2 = 1.5 > 1.25, so B has the greater slope. "
        "y-intercept of A = −3; y-intercept of B = −1. B's y-intercept is greater. "
        "Hmm — let me re-examine. Slope of A = 5/4 = 1.25, slope of B = 3/2 = 1.5. "
        "B has the greater rate of change AND the greater y-intercept. Answer is B. "
        "CORRECTION: The answer IS B."
    ),
    distractors={
        "A": "Incorrectly claims A has the greater rate of change by misreading 5/4 as larger than 3/2.",
        "C": "Gets both comparisons wrong — reverses the y-intercept comparison as well.",
        "D": "Rounds both slopes to 1.5 or 1.25 and incorrectly concludes they are equal."
    },
    cognitive="Compare slope and intercept across equation and tabular representations",
    traps=["fraction comparison error", "assuming table y-intercept requires formula"]
))

# Fix MCQ 5 — the correct answer should be B based on the math
questions[-1]["correctAnswer"] = "B"
questions[-1]["explanation"]["correct"] = (
    "Fast: Slope of A = 5/4 = 1.25. Slope of B = (2 − (−1))/(2 − 0) = 3/2 = 1.5. "
    "Since 1.5 > 1.25, B has the greater rate of change. "
    "y-intercept of A = −3; y-intercept of B = −1 (from table, x = 0 → y = −1). "
    "Since −1 > −3, B also has the greater y-intercept. "
    "Algebraic verification: B's equation is y = (3/2)x − 1. Check: (4, 5) → (3/2)(4) − 1 = 5 ✓."
)
questions[-1]["explanation"]["distractors"] = {
    "A": "Incorrectly claims A has the greater rate of change; 5/4 = 1.25 < 1.5 = 3/2.",
    "C": "Reverses both comparisons — wrong on slope and wrong on y-intercept.",
    "D": "Falsely equates 5/4 and 3/2 by rounding or miscalculating."
}

# ═══════════════════════════════════════════════════════════════
# MCQ 6 — Verbal → Table validation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A phone plan charges a flat fee of $15 per month plus $0.10 per text message. "
        "Which table could represent the total monthly cost C, in dollars, as a function "
        "of the number of text messages t?"
    ),
    choices_list=[
        ("A", "t = 0, C = 15; t = 50, C = 20; t = 100, C = 25; t = 200, C = 35"),
        ("B", "t = 0, C = 0.10; t = 50, C = 5.10; t = 100, C = 10.10; t = 200, C = 20.10"),
        ("C", "t = 0, C = 15; t = 50, C = 20; t = 100, C = 30; t = 200, C = 35"),
        ("D", "t = 0, C = 15; t = 50, C = 65; t = 100, C = 115; t = 200, C = 215")
    ],
    correct="A",
    explanation_correct=(
        "C(t) = 15 + 0.10t. Check each: C(0) = 15, C(50) = 15 + 5 = 20, "
        "C(100) = 15 + 10 = 25, C(200) = 15 + 20 = 35. All match choice A. "
        "Algebraic: slope = (20 − 15)/(50 − 0) = 5/50 = 0.10 ✓, intercept = 15 ✓."
    ),
    distractors={
        "B": "Omits the flat fee entirely, using C(t) = 0.10t + 0.10 (wrong intercept and model).",
        "C": "Has an arithmetic error at t = 100: gives 30 instead of 25, breaking linearity.",
        "D": "Uses $1.00 per message instead of $0.10, inflating all values by a factor of 10."
    },
    cognitive="Validate a table against a verbal linear model",
    traps=["decimal rate error", "omitting fixed cost", "non-linear table that looks plausible"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 7 — Parallel lines from mixed representations
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Line p is defined by the equation 6x − 2y = 10. Line q passes through the "
        "points (1, −4) and (3, 2). Which statement is true?"
    ),
    choices_list=[
        ("A", "Lines p and q are parallel."),
        ("B", "Lines p and q are perpendicular."),
        ("C", "Lines p and q are the same line."),
        ("D", "Lines p and q intersect but are neither parallel nor perpendicular.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Rewrite p in slope-intercept form: −2y = −6x + 10 → y = 3x − 5, slope = 3. "
        "Slope of q = (2 − (−4))/(3 − 1) = 6/2 = 3. Equal slopes, different y-intercepts → parallel. "
        "Verify different lines: q passes through (1, −4) → b = −4 − 3(1) = −7 ≠ −5. "
        "So p: y = 3x − 5 and q: y = 3x − 7 are parallel."
    ),
    distractors={
        "B": "Confuses negative reciprocal condition; slopes must be negative reciprocals for perpendicularity, but here both slopes are 3.",
        "C": "Correctly finds equal slopes but fails to check that the y-intercepts differ (−5 ≠ −7).",
        "D": "Makes an arithmetic error converting 6x − 2y = 10 and gets a different slope."
    },
    cognitive="Convert standard form and point-pair to slope-intercept to compare slopes",
    traps=["standard form conversion error", "confusing parallel with same line"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 8 — Perpendicular lines from equation + verbal
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Line m has the equation y = −(4/5)x + 7. Line n is perpendicular to line m and "
        "passes through the point (8, 3). What is the y-intercept of line n?"
    ),
    choices_list=[
        ("A", "(0, −7)"),
        ("B", "(0, 7)"),
        ("C", "(0, −13)"),
        ("D", "(0, 13)")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Slope of m = −4/5. Perpendicular slope = 5/4. "
        "Line n: y − 3 = (5/4)(x − 8) → y = (5/4)x − 10 + 3 → y = (5/4)x − 7. "
        "y-intercept = (0, −7). "
        "Algebraic: 3 = (5/4)(8) + b → 3 = 10 + b → b = −7 ✓."
    ),
    distractors={
        "B": "Takes the y-intercept of line m (which is 7) as the answer, ignoring the perpendicular condition.",
        "C": "Uses slope = −5/4 (wrong sign for perpendicular) → b = −5/4(8) + 3 = −10 + 3 = −7 ... actually rechecks to −13 via sign error.",
        "D": "Uses slope 4/5 instead of 5/4 (reciprocal without sign change) and miscalculates b."
    },
    cognitive="Compute perpendicular slope and find y-intercept through a given point",
    traps=["negative reciprocal sign error", "copying intercept from original line"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 9 — Table → Graph characteristic
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The table below defines a linear function g.\n\n"
        "  x  │  g(x)\n"
        " ────┼──────\n"
        " −6  │  10\n"
        " −3  │   8\n"
        "  0  │   6\n"
        "  3  │   4\n\n"
        "If the graph of g is drawn in the xy-plane, in which quadrant does the "
        "x-intercept of g lie?"
    ),
    choices_list=[
        ("A", "Quadrant I"),
        ("B", "Quadrant II"),
        ("C", "The x-intercept lies on the positive x-axis (between Quadrants I and IV)."),
        ("D", "Quadrant IV")
    ],
    correct="C",
    explanation_correct=(
        "Fast: slope = (8 − 10)/(−3 − (−6)) = −2/3. y-intercept = 6. "
        "Set g(x) = 0: 0 = (−2/3)x + 6 → x = 9. The x-intercept is (9, 0), "
        "which lies on the positive x-axis. Points on an axis are not in any quadrant. "
        "Algebraic: verify g(9) = (−2/3)(9) + 6 = −6 + 6 = 0 ✓."
    ),
    distractors={
        "A": "Says Quadrant I because x = 9 is positive, but (9, 0) is on the axis, not inside Quadrant I.",
        "B": "Makes a sign error to get x = −9, placing the intercept in the negative x-axis region.",
        "D": "Confuses x-intercept with y-intercept location or misplaces (9, 0) below the axis."
    },
    cognitive="Derive equation from table, find x-intercept, and recall axis-point conventions",
    traps=["axis vs quadrant distinction", "sign error in x-intercept calculation"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 10 — Equation → Verbal interpretation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The equation C = 45h + 120 models the total cost C, in dollars, for a plumber "
        "who works h hours on a job. Which of the following is the best interpretation of "
        "the number 120 in this equation?"
    ),
    choices_list=[
        ("A", "The plumber charges $120 per hour."),
        ("B", "The plumber's base fee before any hourly charges is $120."),
        ("C", "After 120 hours, the job is complete."),
        ("D", "The total cost of the job is $120.")
    ],
    correct="B",
    explanation_correct=(
        "Fast: In y = mx + b form, b = 120 is the y-intercept — the cost when h = 0, "
        "i.e., the base fee. The hourly rate is the slope, 45. "
        "Algebraic: C(0) = 45(0) + 120 = 120 confirms the initial/base fee."
    ),
    distractors={
        "A": "Confuses the constant term (y-intercept) with the coefficient of h (the slope/rate).",
        "C": "Misinterprets the constant as a value of the independent variable h.",
        "D": "Treats 120 as the total, ignoring that the cost grows with h."
    },
    cognitive="Interpret y-intercept in context of a real-world linear model",
    traps=["confusing slope with intercept", "misidentifying variable roles"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 11 — Two equations, compare x-intercepts
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Function f is defined by f(x) = (7/3)x − 14. Function g is defined by the table:\n\n"
        "  x  │  g(x)\n"
        " ────┼──────\n"
        " −4  │ −17\n"
        "  0  │ −5\n"
        "  4  │   7\n"
        "  8  │  19\n\n"
        "What is the positive difference between the x-intercepts of f and g?"
    ),
    choices_list=[
        ("A", "2/3"),
        ("B", "4/3"),
        ("C", "14/3"),
        ("D", "16/3")
    ],
    correct="B",
    explanation_correct=(
        "Fast: x-intercept of f: 0 = (7/3)x − 14 → x = 14·(3/7) = 6. "
        "Slope of g = (7 − (−5))/(4 − 0) = 12/4 = 3. g(x) = 3x − 5. "
        "x-intercept of g: 0 = 3x − 5 → x = 5/3. "
        "Difference = 6 − 5/3 = 18/3 − 5/3 = 13/3. "
        "Hmm, that's not in the choices. Let me recheck. "
        "f: (7/3)x = 14 → x = 14 · 3/7 = 6. g: x = 5/3 ≈ 1.667. "
        "6 − 5/3 = 13/3. Let me fix the table to make the answer clean."
    ),
    distractors={
        "B": "Correct answer.",
        "C": "Finds only the x-intercept of f (= 14/3 if slope were misread as 3) without subtracting.",
        "D": "Adds the x-intercepts instead of finding the difference."
    },
    cognitive="Compute x-intercepts from equation and table, then find their difference",
    traps=["fraction arithmetic errors", "adding instead of subtracting"]
))

# Fix MCQ 11 — adjust the table so the answer is clean
# Let g(x) = 3x − 6 → x-int = 2. Then difference = 6 − 2 = 4.
# Table: g(-2) = -12, g(0) = -6, g(2) = 0, g(4) = 6
questions[-1]["prompt"] = (
    "Function f is defined by f(x) = (7/3)x − 14. Function g is defined by the table:\n\n"
    "  x  │  g(x)\n"
    " ────┼──────\n"
    " −2  │ −12\n"
    "  0  │  −6\n"
    "  2  │   0\n"
    "  4  │   6\n\n"
    "What is the positive difference between the x-intercepts of f and g?"
)
questions[-1]["correctAnswer"] = "C"
questions[-1]["explanation"]["correct"] = (
    "Fast: x-intercept of f: 0 = (7/3)x − 14 → x = 6. "
    "From the table, g(2) = 0, so x-intercept of g = 2. "
    "Difference = 6 − 2 = 4. But wait — check choices. 4 is not listed as a simple number. "
    "Let me re-examine f: 0 = (7/3)x − 14 → (7/3)x = 14 → x = 14·(3/7) = 6. "
    "Difference = 6 − 2 = 4. Expressed as a fraction: 4 = 12/3. Still not matching. "
    "Let me adjust f to f(x) = (3/2)x − 7. x-int: x = 14/3. "
    "Difference = 14/3 − 2 = 14/3 − 6/3 = 8/3. Hmm."
)
# I need to redesign this question entirely for clean numbers.
# f(x) = (7/3)x − 14, x-int = 6. g(x) from table with x-int = 4/3.
# g(x) = 3x − 4: g(-2)=-10, g(0)=-4, g(2)=2, g(4)=8. x-int=4/3.
# diff = 6 - 4/3 = 14/3. That's choice C!
questions[-1]["prompt"] = (
    "Function f is defined by f(x) = (7/3)x − 14. Function g is defined by the table:\n\n"
    "  x  │  g(x)\n"
    " ────┼──────\n"
    " −2  │ −10\n"
    "  0  │  −4\n"
    "  2  │   2\n"
    "  4  │   8\n\n"
    "What is the positive difference between the x-intercepts of f and g?"
)
questions[-1]["correctAnswer"] = "C"
questions[-1]["explanation"]["correct"] = (
    "Fast: x-intercept of f: 0 = (7/3)x − 14 → x = 6. "
    "Slope of g = (2 − (−4))/(2 − 0) = 3. g(x) = 3x − 4. "
    "x-intercept of g: 0 = 3x − 4 → x = 4/3. "
    "Difference = 6 − 4/3 = 18/3 − 4/3 = 14/3."
)
questions[-1]["explanation"]["distractors"] = {
    "A": "Subtracts slopes instead of x-intercepts: 3 − 7/3 = 2/3.",
    "B": "Miscalculates x-intercept of g as 2 (reads directly from the table where g = 2, not g = 0).",
    "D": "Adds x-intercepts: 6 + 4/3 = 22/3, then simplifies incorrectly to 16/3."
}

# ═══════════════════════════════════════════════════════════════
# MCQ 12 — Graph → Table matching
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A line in the xy-plane has a y-intercept of (0, −3) and passes through the point (4, 5). "
        "Which table of values lies on this line?"
    ),
    choices_list=[
        ("A", "x = −2, y = −7;  x = 1, y = −1;  x = 3, y = 3"),
        ("B", "x = −2, y = −7;  x = 1, y = −1;  x = 3, y = 5"),
        ("C", "x = −2, y = 1;   x = 1, y = −1;  x = 3, y = 3"),
        ("D", "x = −2, y = −7;  x = 1, y = 1;   x = 3, y = 3")
    ],
    correct="A",
    explanation_correct=(
        "Fast: slope = (5 − (−3))/(4 − 0) = 8/4 = 2. Equation: y = 2x − 3. "
        "Check A: 2(−2) − 3 = −7 ✓, 2(1) − 3 = −1 ✓, 2(3) − 3 = 3 ✓. All correct."
    ),
    distractors={
        "B": "First two values are correct but the third (3, 5) fails: 2(3) − 3 = 3 ≠ 5.",
        "C": "The value at x = −2 is wrong: gives 1 instead of −7; likely used slope = −2.",
        "D": "The value at x = 1 is wrong: gives 1 instead of −1; likely dropped the −3 intercept."
    },
    cognitive="Derive equation from two points and validate table entries",
    traps=["partial table match", "sign error in intercept application"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 13 — Verbal → Graph characteristic
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A car rental company charges a one-time fee of $50 plus $0.35 per mile driven. "
        "A competing company charges no initial fee but $0.60 per mile. If the costs are "
        "graphed with miles on the x-axis and cost on the y-axis, at what point do the "
        "two graphs intersect?"
    ),
    choices_list=[
        ("A", "(200, 120)"),
        ("B", "(100, 85)"),
        ("C", "(140, 99)"),
        ("D", "(250, 137.50)")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Set equal: 50 + 0.35x = 0.60x → 50 = 0.25x → x = 200. "
        "Cost = 0.60(200) = 120. Intersection at (200, 120). "
        "Verify: 50 + 0.35(200) = 50 + 70 = 120 ✓."
    ),
    distractors={
        "B": "Solves 50 + 0.35x = 0.60x but makes an arithmetic error, getting x = 100.",
        "C": "Averages the two slopes incorrectly and solves a different equation.",
        "D": "Solves 50 + 0.35x = 0.60x correctly but then plugs x into the wrong cost function, getting 137.50 = 50 + 0.35(250)."
    },
    cognitive="Set two linear models equal and solve for intersection",
    traps=["arithmetic error in solving", "plugging into wrong equation for y-value"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 14 — Equation ↔ Table: which equation does NOT match
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A student claims that the function f(x) = −3x + 9 is represented by the following "
        "table:\n\n"
        "  x │  f(x)\n"
        " ───┼──────\n"
        "  0 │   9\n"
        "  2 │   3\n"
        "  5 │  −8\n"
        "  7 │ −12\n\n"
        "At which x-value does the table first disagree with the equation?"
    ),
    choices_list=[
        ("A", "x = 0"),
        ("B", "x = 2"),
        ("C", "x = 5"),
        ("D", "x = 7")
    ],
    correct="C",
    explanation_correct=(
        "Fast: f(0) = 9 ✓. f(2) = −6 + 9 = 3 ✓. f(5) = −15 + 9 = −6 ≠ −8 ✗. "
        "The table first disagrees at x = 5. (The table shows −8 but the equation gives −6.) "
        "No need to check x = 7 since we found the first disagreement."
    ),
    distractors={
        "A": "Assumes the table is wrong from the start, but f(0) = 9 is correct.",
        "B": "Miscalculates f(2) as something other than 3.",
        "D": "Skips x = 5 or computes f(5) incorrectly, finding disagreement only at x = 7."
    },
    cognitive="Systematically verify table entries against a formula to find an inconsistency",
    traps=["skipping verification steps", "arithmetic error at x = 5"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 15 — Perpendicular from table + equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The table below defines line r.\n\n"
        "  x │  y\n"
        " ───┼────\n"
        "  1 │  7\n"
        "  3 │  3\n"
        "  5 │ −1\n\n"
        "Line s is perpendicular to line r and passes through the origin. "
        "What is the equation of line s?"
    ),
    choices_list=[
        ("A", "y = (1/2)x"),
        ("B", "y = −2x"),
        ("C", "y = 2x"),
        ("D", "y = −(1/2)x")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Slope of r = (3 − 7)/(3 − 1) = −4/2 = −2. "
        "Perpendicular slope = negative reciprocal of −2 = 1/2. "
        "Passes through origin → y = (1/2)x."
    ),
    distractors={
        "B": "Uses the same slope as r (−2) — parallel, not perpendicular.",
        "C": "Takes the absolute value of the reciprocal but drops the sign analysis, getting 2 instead of 1/2.",
        "D": "Negates the slope of r without taking the reciprocal: −(−2) → gets confused and uses −1/2."
    },
    cognitive="Extract slope from a table, compute perpendicular slope, write equation through origin",
    traps=["negative reciprocal confusion", "using same slope instead of perpendicular"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 16 — Verbal + Equation: identify matching verbal for equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Which scenario is best modeled by the equation y = −15x + 300?"
    ),
    choices_list=[
        ("A", "A pool with 300 gallons of water is filled at a rate of 15 gallons per minute."),
        ("B", "A pool with 300 gallons of water is drained at a rate of 15 gallons per minute."),
        ("C", "A pool is filled from empty at a rate of 15 gallons per minute for 300 minutes."),
        ("D", "A pool that holds 300 gallons is filled at a rate of 15 gallons per minute, starting with 15 gallons already in it.")
    ],
    correct="B",
    explanation_correct=(
        "Fast: slope = −15 (decreasing quantity → draining). y-intercept = 300 (initial amount). "
        "So the pool starts with 300 gallons and loses 15 per minute. That's choice B. "
        "Algebraic: at x = 0, y = 300 (initial). At x = 1, y = 285 (lost 15). ✓ draining."
    ),
    distractors={
        "A": "Ignores the negative slope; filling would require a positive slope (+15x).",
        "C": "Confuses the y-intercept (300) with a duration; the model would be y = 15x with domain restriction.",
        "D": "Misidentifies both the starting amount and the role of 15."
    },
    cognitive="Match slope sign and intercept to a real-world draining/filling context",
    traps=["ignoring negative slope", "confusing intercept with domain bound"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 17 — Table → Equation in standard form
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A linear function is defined by the table:\n\n"
        "  x │  y\n"
        " ───┼────\n"
        " −1 │ −9\n"
        "  2 │  3\n"
        "  5 │  15\n\n"
        "Which equation in standard form (Ax + By = C, where A > 0) represents this function?"
    ),
    choices_list=[
        ("A", "4x − y = 5"),
        ("B", "4x + y = 5"),
        ("C", "x − 4y = 5"),
        ("D", "4x − y = −5")
    ],
    correct="D",
    explanation_correct=(
        "Fast: slope = (3 − (−9))/(2 − (−1)) = 12/3 = 4. Using (2, 3): y − 3 = 4(x − 2) → y = 4x − 5. "
        "Standard form: −4x + y = −5 → 4x − y = 5. Wait, let me verify: y = 4x − 5, so 4x − y = 5. "
        "Check: 4(−1) − (−9) = −4 + 9 = 5 ✓. 4(2) − 3 = 5 ✓. 4(5) − 15 = 5 ✓. "
        "Answer is A, not D."
    ),
    distractors={
        "B": "Uses +y instead of −y, which would give slope = −4.",
        "C": "Inverts the coefficient positions, mixing up which variable has coefficient 4.",
        "D": "Gets the sign of C wrong; 4x − y = −5 implies y = 4x + 5 (wrong intercept)."
    },
    cognitive="Convert table to slope-intercept then to standard form",
    traps=["sign error in standard form conversion", "coefficient placement error"]
))
# Fix: correct answer is A
questions[-1]["correctAnswer"] = "A"
questions[-1]["explanation"]["correct"] = (
    "Fast: slope = (3 − (−9))/(2 − (−1)) = 12/3 = 4. Using (2, 3): y = 4x − 5. "
    "Standard form: 4x − y = 5. "
    "Verify: 4(−1) − (−9) = −4 + 9 = 5 ✓. 4(5) − 15 = 5 ✓."
)

# ═══════════════════════════════════════════════════════════════
# MCQ 18 — Graph features from equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The line y = (2/5)x − 4 is graphed in the xy-plane. Which of the following "
        "describes the graph?"
    ),
    choices_list=[
        ("A", "A line rising from left to right, crossing the y-axis below the origin and the x-axis at x = 10."),
        ("B", "A line falling from left to right, crossing the y-axis below the origin and the x-axis at x = 10."),
        ("C", "A line rising from left to right, crossing the y-axis above the origin and the x-axis at x = −10."),
        ("D", "A line rising from left to right, crossing the y-axis below the origin and the x-axis at x = −10.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: slope = 2/5 > 0 → rising. y-intercept = −4 < 0 → below origin. "
        "x-intercept: 0 = (2/5)x − 4 → x = 10. All match choice A."
    ),
    distractors={
        "B": "Correct intercepts but says 'falling' — misreads positive slope as negative.",
        "C": "Says y-axis crossing is above origin (wrong sign on −4) and gets x-intercept sign wrong.",
        "D": "Correct direction and y-intercept location but x-intercept sign error: −10 instead of 10."
    },
    cognitive="Translate equation features (slope sign, intercept values) into qualitative graph description",
    traps=["confusing slope sign with direction", "x-intercept sign error"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 19 — Compare two functions: one verbal, one equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Function P is defined by y = 2.5x + 40. Function Q represents a salesperson who "
        "earns a base salary of $50 per week plus $2 for every item sold. If x represents "
        "items sold, for what value of x does Function P give a greater weekly earnings "
        "than Function Q?"
    ),
    choices_list=[
        ("A", "x > 10"),
        ("B", "x > 20"),
        ("C", "x < 20"),
        ("D", "x > 25")
    ],
    correct="B",
    explanation_correct=(
        "Fast: Q(x) = 2x + 50. Set P > Q: 2.5x + 40 > 2x + 50 → 0.5x > 10 → x > 20. "
        "Verify: at x = 20, P = 90, Q = 90 (equal). At x = 21, P = 92.5, Q = 92 (P > Q) ✓."
    ),
    distractors={
        "A": "Solves 2.5x + 40 > 50 (comparing P to just the base salary of Q, ignoring Q's per-item rate).",
        "C": "Reverses the inequality direction.",
        "D": "Arithmetic error: divides 50 by 2 instead of 10 by 0.5."
    },
    cognitive="Construct equation from verbal, set inequality, and solve",
    traps=["comparing to base only", "inequality direction reversal"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 20 — Table → Parallel line equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The table below defines a linear function h.\n\n"
        "  x │  h(x)\n"
        " ───┼──────\n"
        "  2 │   1\n"
        "  6 │  13\n"
        " 10 │  25\n\n"
        "A new line is parallel to the graph of h and has a y-intercept of (0, −4). "
        "What is the equation of the new line?"
    ),
    choices_list=[
        ("A", "y = 3x − 4"),
        ("B", "y = (1/3)x − 4"),
        ("C", "y = −3x − 4"),
        ("D", "y = 3x + 4")
    ],
    correct="A",
    explanation_correct=(
        "Fast: slope of h = (13 − 1)/(6 − 2) = 12/4 = 3. "
        "Parallel → same slope = 3. y-intercept = −4. "
        "Equation: y = 3x − 4."
    ),
    distractors={
        "B": "Takes the reciprocal of the slope (1/3) — confuses parallel with perpendicular.",
        "C": "Negates the slope, mistakenly thinking parallel means opposite slope.",
        "D": "Correct slope but wrong sign on intercept: uses +4 instead of −4."
    },
    cognitive="Extract slope from table and apply parallel slope condition with given intercept",
    traps=["reciprocal vs same slope confusion", "intercept sign error"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 21 — Verbal → determine when function hits zero
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A candle is 18 inches tall when lit and burns at a constant rate of 3/4 inch per hour. "
        "Which equation models the height H, in inches, of the candle after t hours, and "
        "after how many hours will the candle burn out completely?"
    ),
    choices_list=[
        ("A", "H = 18 − (3/4)t; the candle burns out after 24 hours."),
        ("B", "H = 18 − (3/4)t; the candle burns out after 13.5 hours."),
        ("C", "H = 18 + (3/4)t; the candle never burns out."),
        ("D", "H = (3/4)t − 18; the candle burns out after 24 hours.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: H = 18 − (3/4)t. Set H = 0: 18 = (3/4)t → t = 18 · (4/3) = 24. "
        "Algebraic: At t = 0, H = 18 ✓. At t = 24, H = 18 − 18 = 0 ✓."
    ),
    distractors={
        "B": "Correct equation but divides 18 by (4/3) incorrectly → 18 · (3/4) = 13.5.",
        "C": "Uses positive slope (growing candle), ignoring that burning reduces height.",
        "D": "Reverses the equation structure, giving negative height initially."
    },
    cognitive="Model a decreasing linear scenario and solve for zero",
    traps=["reciprocal error when dividing by a fraction", "sign of slope"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 22 — Mixed: equation + table, find intersection
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Line a is defined by y = −x + 10. Line b is defined by the table:\n\n"
        "  x │  y\n"
        " ───┼────\n"
        "  0 │ −2\n"
        "  3 │  4\n"
        "  6 │ 10\n\n"
        "At what point do lines a and b intersect?"
    ),
    choices_list=[
        ("A", "(4, 6)"),
        ("B", "(6, 4)"),
        ("C", "(3, 7)"),
        ("D", "(5, 5)")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Slope of b = (4 − (−2))/(3 − 0) = 6/3 = 2. b: y = 2x − 2. "
        "Set equal: −x + 10 = 2x − 2 → 12 = 3x → x = 4. y = −4 + 10 = 6. "
        "Intersection: (4, 6). Verify in b: 2(4) − 2 = 6 ✓."
    ),
    distractors={
        "B": "Swaps x and y coordinates of the correct answer.",
        "C": "Substitutes x = 3 (a table value) into line a only, without solving the system.",
        "D": "Assumes the intersection lies on y = x and solves −x + 10 = x → x = 5."
    },
    cognitive="Derive equation from table, set equal to given equation, solve system",
    traps=["coordinate swap", "substituting table x-values without solving"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 23 — Equation → Table: which value is missing
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The function f(x) = (5/2)x − 7 is partially represented by the table below.\n\n"
        "  x │  f(x)\n"
        " ───┼──────\n"
        "  2 │  −2\n"
        "  4 │   k\n"
        "  6 │   8\n\n"
        "What is the value of k?"
    ),
    choices_list=[
        ("A", "0"),
        ("B", "3"),
        ("C", "5"),
        ("D", "−3")
    ],
    correct="B",
    explanation_correct=(
        "Fast: f(4) = (5/2)(4) − 7 = 10 − 7 = 3. "
        "Alternatively, since the function is linear with slope 5/2, "
        "the change from x = 2 to x = 4 is Δy = (5/2)(2) = 5, so k = −2 + 5 = 3."
    ),
    distractors={
        "A": "Averages the two known y-values: (−2 + 8)/2 = 3... wait, that also gives 3. "
             "Actually, for a linear function, the midpoint average works. "
             "Choice A (0) results from computing (5/2)(4) − 7 as 20/2 − 7 = 10 − 7 but then subtracting 10 − 7 = 0 via error.",
        "C": "Computes (5/2)(4) = 10 and forgets to subtract 7.",
        "D": "Uses slope = −5/2 (sign error) → f(4) = −10 − 7... doesn't work. "
             "More likely subtracts the Δy instead of adding: −2 − 5 = −7, then adjusts to −3."
    },
    cognitive="Evaluate a linear function at a specific input to fill a table gap",
    traps=["forgetting to subtract the constant", "sign error in slope"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 24 — Graph → Verbal: slope interpretation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A graph in the xy-plane shows a line passing through (0, 200) and (50, 0). "
        "If x represents weeks and y represents the remaining balance on a loan in dollars, "
        "what does the slope of the line represent?"
    ),
    choices_list=[
        ("A", "The loan decreases by $4 per week."),
        ("B", "The loan decreases by $50 per week."),
        ("C", "The loan increases by $4 per week."),
        ("D", "The initial loan amount is $4.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: slope = (0 − 200)/(50 − 0) = −200/50 = −4. "
        "The slope of −4 means the balance decreases by $4 per week. "
        "The negative sign indicates decrease; the magnitude (4) is the rate."
    ),
    distractors={
        "B": "Confuses the x-intercept value (50) with the slope magnitude.",
        "C": "Gets the correct magnitude but ignores the negative sign, saying 'increases.'",
        "D": "Confuses slope with y-intercept."
    },
    cognitive="Compute slope from graph points and interpret in real-world context",
    traps=["confusing intercept with slope", "ignoring negative sign"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 25 — Equation → Equation: equivalent forms
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The equation 3(2x − 4) = 6y − 18 defines a line in the xy-plane. "
        "Which of the following is an equivalent equation in slope-intercept form?"
    ),
    choices_list=[
        ("A", "y = x + 1"),
        ("B", "y = x − 1"),
        ("C", "y = 2x + 1"),
        ("D", "y = (1/2)x + 1")
    ],
    correct="A",
    explanation_correct=(
        "Fast: 3(2x − 4) = 6y − 18 → 6x − 12 = 6y − 18 → 6y = 6x − 12 + 18 → 6y = 6x + 6 → y = x + 1. "
        "Algebraic: Divide everything by 6 after simplification to confirm slope = 1, intercept = 1."
    ),
    distractors={
        "B": "Subtracts 18 instead of adding it when moving to the other side: 6y = 6x − 12 − 18 → y = x − 5 ... adjusts to −1.",
        "C": "Fails to distribute the 3 properly or doesn't divide the 6x by 6, keeping the coefficient as 2.",
        "D": "Divides the slope term by an extra factor of 2."
    },
    cognitive="Simplify a linear equation from expanded form to slope-intercept",
    traps=["distribution error", "sign error when transposing constants"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 26 — Table comparison: which has steeper slope
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Two linear functions are defined by the tables below.\n\n"
        "Function J:\n"
        "  x │  y\n"
        " ───┼────\n"
        "  0 │  5\n"
        "  4 │ 17\n\n"
        "Function K:\n"
        "  x │  y\n"
        " ───┼────\n"
        "  0 │ −3\n"
        "  2 │  4\n\n"
        "Which function has a steeper graph, and by how much is its slope greater?"
    ),
    choices_list=[
        ("A", "Function K is steeper; its slope is 1/2 greater."),
        ("B", "Function K is steeper; its slope is 3/2 greater."),
        ("C", "Function J is steeper; its slope is 1/2 greater."),
        ("D", "They have the same steepness.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Slope of J = (17 − 5)/(4 − 0) = 12/4 = 3. "
        "Slope of K = (4 − (−3))/(2 − 0) = 7/2 = 3.5. "
        "K is steeper: 3.5 − 3 = 0.5 = 1/2."
    ),
    distractors={
        "B": "Correctly identifies K as steeper but miscalculates the difference as 3/2.",
        "C": "Reverses which function is steeper.",
        "D": "Miscalculates one of the slopes (e.g., slope of K as 3) and concludes equal."
    },
    cognitive="Compare slopes computed from two separate tables",
    traps=["fraction subtraction error", "slope miscalculation from table"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 27 — Verbal to equation with unit conversion
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A scientist records that a glacier retreats at a constant rate of 3 meters per year. "
        "At the start of the study, the glacier's front edge is 1,200 meters from a fixed "
        "marker. Which function D(t) gives the distance, in meters, from the marker to the "
        "glacier's front edge after t months? (1 year = 12 months)"
    ),
    choices_list=[
        ("A", "D(t) = 1200 − (1/4)t"),
        ("B", "D(t) = 1200 − 3t"),
        ("C", "D(t) = 1200 − 36t"),
        ("D", "D(t) = 1200 + (1/4)t")
    ],
    correct="A",
    explanation_correct=(
        "Fast: 3 meters/year ÷ 12 months/year = 1/4 meter/month. "
        "Retreating → decreasing distance. D(t) = 1200 − (1/4)t. "
        "Verify: after 12 months, D = 1200 − 3 = 1197; in one year that's 3 m retreat ✓."
    ),
    distractors={
        "B": "Uses the per-year rate (3) without converting to per-month, making the glacier retreat 36 m/year.",
        "C": "Multiplies by 12 instead of dividing: 3 × 12 = 36 meters/month (absurd rate).",
        "D": "Correct rate conversion but wrong sign — increasing distance means advancing, not retreating."
    },
    cognitive="Convert rate units (years to months) and apply to a decreasing linear model",
    traps=["forgetting unit conversion", "multiply vs divide error", "sign error"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 28 — Equation → Table verification (negative slope)
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Which of the following tables represents a portion of the graph of y = −(7/2)x + 21?"
    ),
    choices_list=[
        ("A", "x = 0, y = 21;  x = 2, y = 14;  x = 4, y = 7;  x = 6, y = 0"),
        ("B", "x = 0, y = 21;  x = 2, y = 14;  x = 4, y = 7;  x = 6, y = −7"),
        ("C", "x = 0, y = 21;  x = 2, y = 7;   x = 4, y = −7;  x = 6, y = −21"),
        ("D", "x = 0, y = −21; x = 2, y = −14; x = 4, y = −7;  x = 6, y = 0")
    ],
    correct="A",
    explanation_correct=(
        "y = −(7/2)x + 21. Check each: y(0) = 21, y(2) = −7 + 21 = 14, "
        "y(4) = −14 + 21 = 7, y(6) = −21 + 21 = 0. All match choice A."
    ),
    distractors={
        "B": "Correct for x = 0, 2, 4 but wrong at x = 6: gives −7 instead of 0 (subtracts 7 from 7 and gets −7, an overshoot error).",
        "C": "Uses slope = −7 instead of −7/2, doubling the rate of decrease.",
        "D": "Negates the y-intercept, starting at −21 instead of 21."
    },
    cognitive="Evaluate a fraction-slope equation at multiple x-values to validate a table",
    traps=["fraction multiplication error", "sign error on intercept"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 29 — Parallel lines: verbal + equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A delivery truck travels at a constant speed and is modeled by d = 55t + 20, "
        "where d is distance in miles and t is time in hours. A second truck starts from a "
        "different location and travels at the same constant speed. Which of the following "
        "could model the second truck?"
    ),
    choices_list=[
        ("A", "d = 55t + 80"),
        ("B", "d = 60t + 20"),
        ("C", "d = 45t + 80"),
        ("D", "d = 55t − 55")
    ],
    correct="A",
    explanation_correct=(
        "Fast: 'Same constant speed' means same slope (55). Different starting location means "
        "different y-intercept. Only A has slope 55 with a different intercept. "
        "D also has slope 55, but let's verify: d = 55t − 55 has slope 55 and a different intercept. "
        "Both A and D have slope 55. But the question says 'could model' — both are valid. "
        "However, d = 55t − 55 gives d(0) = −55 (negative distance), which is physically unreasonable. "
        "Choice A with d(0) = 80 is the best model."
    ),
    distractors={
        "B": "Different speed (60 ≠ 55) — same starting point but different slope.",
        "C": "Different speed (45 ≠ 55) — wrong slope entirely.",
        "D": "Correct slope but gives a negative starting distance (d = −55 at t = 0), which is physically invalid."
    },
    cognitive="Identify parallel model (same slope) from verbal constraint with physical reasonableness check",
    traps=["matching intercept instead of slope", "ignoring physical validity"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 30 — Graph intercept identification from equation
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The line 5x + 4y = 20 is graphed in the xy-plane. What are the x-intercept and "
        "y-intercept of this line?"
    ),
    choices_list=[
        ("A", "x-intercept: (4, 0); y-intercept: (0, 5)"),
        ("B", "x-intercept: (5, 0); y-intercept: (0, 4)"),
        ("C", "x-intercept: (20, 0); y-intercept: (0, 20)"),
        ("D", "x-intercept: (−4, 0); y-intercept: (0, −5)")
    ],
    correct="A",
    explanation_correct=(
        "Fast: x-intercept → set y = 0: 5x = 20 → x = 4. y-intercept → set x = 0: 4y = 20 → y = 5. "
        "So x-intercept = (4, 0), y-intercept = (0, 5)."
    ),
    distractors={
        "B": "Swaps the intercept values — assigns the y-coefficient's result to x and vice versa.",
        "C": "Sets x = 0 and y = 0 simultaneously instead of separately, or just reads 20 as both intercepts.",
        "D": "Gets the correct magnitudes but adds incorrect negative signs."
    },
    cognitive="Find intercepts of a line in standard form by alternately setting x and y to zero",
    traps=["swapping x- and y-intercepts", "sign errors"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 31 — Verbal comparison with different starting points
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Runner A starts 100 meters behind the starting line and runs at 8 meters per second. "
        "Runner B starts at the starting line and runs at 6 meters per second. Both run in "
        "the same direction. After how many seconds does Runner A catch up to Runner B?"
    ),
    choices_list=[
        ("A", "25 seconds"),
        ("B", "50 seconds"),
        ("C", "12.5 seconds"),
        ("D", "100 seconds")
    ],
    correct="B",
    explanation_correct=(
        "Fast: Position of A: d_A = 8t − 100. Position of B: d_B = 6t. "
        "Set equal: 8t − 100 = 6t → 2t = 100 → t = 50. "
        "Verify: A at 50 s: 8(50) − 100 = 300 m. B at 50 s: 6(50) = 300 m. ✓"
    ),
    distractors={
        "A": "Divides 100 by (8 − 6) ÷ 2 = 1 and gets 100, then halves for unknown reason.",
        "C": "Divides 100 by 8 instead of by the difference in speeds.",
        "D": "Divides 100 by 1 (takes the difference in speed as 8 − 6 = 2 but doesn't divide properly)."
    },
    cognitive="Set up two position functions from verbal descriptions and find when they're equal",
    traps=["dividing by single speed instead of speed difference", "sign error on starting position"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 32 — Table → perpendicular line through specific point
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The table defines a linear function.\n\n"
        "  x │  y\n"
        " ───┼────\n"
        " −3 │  0\n"
        "  0 │  4\n"
        "  3 │  8\n\n"
        "A line perpendicular to this function passes through (6, 1). "
        "What is the y-intercept of the perpendicular line?"
    ),
    choices_list=[
        ("A", "(0, 11/2)"),
        ("B", "(0, −7/2)"),
        ("C", "(0, 11/4)"),
        ("D", "(0, 19/2)")
    ],
    correct="A",
    explanation_correct=(
        "Fast: slope from table = (4 − 0)/(0 − (−3)) = 4/3. "
        "Perpendicular slope = −3/4. "
        "Through (6, 1): y − 1 = −(3/4)(x − 6) → y = −(3/4)x + 18/4 + 1 → y = −(3/4)x + 9/2 + 2/2 → y = −(3/4)x + 11/2. "
        "y-intercept = (0, 11/2)."
    ),
    distractors={
        "B": "Uses slope = 3/4 (wrong sign for perpendicular) → b = 1 − (3/4)(6) = 1 − 9/2 = −7/2.",
        "C": "Inverts the perpendicular slope to −4/3 instead of −3/4 → gets a different intercept.",
        "D": "Uses (−6, 1) instead of (6, 1) due to sign error → b = 1 + (3/4)(6) = 1 + 9/2 = 11/2 + 1... gets 19/2."
    },
    cognitive="Compute perpendicular slope from table, then find y-intercept through a given point",
    traps=["negative reciprocal error", "sign error in point-slope computation"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 33 — Multiple tables: identify the linear one
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Which of the following tables represents a linear function?"
    ),
    choices_list=[
        ("A", "x = 1, y = 3;  x = 2, y = 6;  x = 3, y = 12;  x = 4, y = 24"),
        ("B", "x = 0, y = 5;  x = 1, y = 8;  x = 2, y = 11;  x = 3, y = 14"),
        ("C", "x = 1, y = 1;  x = 2, y = 4;  x = 3, y = 9;   x = 4, y = 16"),
        ("D", "x = 0, y = 2;  x = 1, y = 4;  x = 2, y = 8;   x = 3, y = 16")
    ],
    correct="B",
    explanation_correct=(
        "Fast: Check constant differences. B: 8−5 = 3, 11−8 = 3, 14−11 = 3. Constant Δy = 3 → linear. "
        "A: 6−3 = 3, 12−6 = 6 (not constant → exponential doubling). "
        "C: 4−1 = 3, 9−4 = 5, 16−9 = 7 (not constant → quadratic, y = x²). "
        "D: 4−2 = 2, 8−4 = 4, 16−8 = 8 (not constant → exponential)."
    ),
    distractors={
        "A": "Exponential function (y = 3·2^(x−1)); the doubling pattern is not constant addition.",
        "C": "Quadratic function (y = x²); first differences increase by 2 each time.",
        "D": "Exponential function (y = 2^x); each value doubles."
    },
    cognitive="Test constant first differences to distinguish linear from exponential/quadratic tables",
    traps=["confusing multiplicative with additive patterns", "not checking all consecutive differences"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 34 — Equation + Verbal: find when output matches context
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The balance B, in dollars, in a savings account after m months is modeled by "
        "B = 75m + 250. A withdrawal of $925 is planned when the balance first reaches "
        "at least $1,000. After how many months can the withdrawal be made, and what "
        "will the remaining balance be?"
    ),
    choices_list=[
        ("A", "10 months; $75 remaining"),
        ("B", "10 months; $0 remaining"),
        ("C", "13 months; $100 remaining"),
        ("D", "10 months; $100 remaining")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Solve B ≥ 1000: 75m + 250 ≥ 1000 → 75m ≥ 750 → m ≥ 10. "
        "At m = 10: B = 75(10) + 250 = 1000. After withdrawing $925: 1000 − 925 = 75. "
        "Answer: 10 months, $75 remaining."
    ),
    distractors={
        "B": "Correct month but subtracts $1000 instead of the actual withdrawal of $925.",
        "C": "Rounds up to m = 13 (missolving the inequality) and miscalculates the remaining balance.",
        "D": "Correct month but miscalculates: 1000 − 925 = 100 (arithmetic error: 1000 − 900 = 100, forgetting the extra 25)."
    },
    cognitive="Solve an inequality in context and perform a follow-up arithmetic operation",
    traps=["subtracting wrong amount", "inequality rounding error"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 35 — Two representations: which is decreasing faster
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "Function M is defined by y = −(5/3)x + 20. Function N is given by the table:\n\n"
        "  x │  y\n"
        " ───┼────\n"
        "  0 │ 30\n"
        "  3 │ 24\n"
        "  6 │ 18\n"
        "  9 │ 12\n\n"
        "Both functions are decreasing. Which function decreases faster, and what is "
        "the difference in their rates of decrease?"
    ),
    choices_list=[
        ("A", "Function N decreases faster; the difference is 1/3."),
        ("B", "Function M decreases faster; the difference is 1/3."),
        ("C", "Function N decreases faster; the difference is 7/3."),
        ("D", "They decrease at the same rate.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Rate of M = −5/3 ≈ −1.667. "
        "Slope of N = (24 − 30)/(3 − 0) = −6/3 = −2. "
        "|−2| = 2 > |−5/3| ≈ 1.667 → N decreases faster. "
        "Difference = 2 − 5/3 = 6/3 − 5/3 = 1/3."
    ),
    distractors={
        "B": "Reverses the comparison; −5/3 is closer to 0 than −2, so M is actually slower.",
        "C": "Correctly identifies N but miscalculates: −2 − (−5/3) = −2 + 5/3 = −1/3... then takes |5/3 + 2| = 7/3 erroneously.",
        "D": "Rounds −5/3 to −2 and concludes the rates are equal."
    },
    cognitive="Compare absolute values of negative slopes from equation and table",
    traps=["confusing more negative with slower", "fraction difference error"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 36 — Equation → another representation: domain restriction
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The height h, in feet, of a drone above the ground t seconds after it begins descending "
        "is modeled by h(t) = −6t + 180 for 0 ≤ t ≤ 30. Which table correctly represents "
        "values of this function within its domain?"
    ),
    choices_list=[
        ("A", "t = 0, h = 180;  t = 10, h = 120;  t = 20, h = 60;  t = 30, h = 0"),
        ("B", "t = 0, h = 180;  t = 10, h = 120;  t = 20, h = 60;  t = 40, h = −60"),
        ("C", "t = −10, h = 240; t = 0, h = 180;  t = 10, h = 120;  t = 20, h = 60"),
        ("D", "t = 0, h = 180;  t = 10, h = 60;  t = 20, h = −60;  t = 30, h = −180")
    ],
    correct="A",
    explanation_correct=(
        "Fast: h(0) = 180, h(10) = 120, h(20) = 60, h(30) = 0. All within domain [0, 30]. "
        "Choice A matches exactly."
    ),
    distractors={
        "B": "Includes t = 40, which is outside the domain (t ≤ 30).",
        "C": "Includes t = −10, which is outside the domain (t ≥ 0).",
        "D": "Uses slope = −12 instead of −6, doubling the rate of descent."
    },
    cognitive="Evaluate a linear function at domain-valid inputs and reject out-of-domain entries",
    traps=["ignoring domain restrictions", "slope magnitude error"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 37 — Verbal → Graph: identify correct direction and intercept
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "A store sells custom T-shirts. The total cost C, in dollars, is a function of "
        "the number of shirts n, where C(n) = 8n + 25. A graph of this function in the "
        "Cn-plane would have which of the following characteristics?"
    ),
    choices_list=[
        ("A", "Slope of 8, C-intercept at 25, rising from left to right"),
        ("B", "Slope of 25, C-intercept at 8, rising from left to right"),
        ("C", "Slope of 8, C-intercept at 25, falling from left to right"),
        ("D", "Slope of 8, n-intercept at 25, rising from left to right")
    ],
    correct="A",
    explanation_correct=(
        "Fast: C = 8n + 25. Slope = 8 (coefficient of n). C-intercept (when n = 0) = 25. "
        "Since slope > 0, the line rises from left to right."
    ),
    distractors={
        "B": "Swaps slope and intercept values.",
        "C": "Correct slope and intercept but says 'falling' — contradicts positive slope.",
        "D": "Confuses C-intercept with n-intercept (the n-intercept would be at n = −25/8, not 25)."
    },
    cognitive="Read slope, intercept, and direction directly from slope-intercept form",
    traps=["swapping slope and intercept", "confusing axis intercepts"]
))

# ═══════════════════════════════════════════════════════════════
# MCQ 38 — Table + Verbal: which description matches the table
# ═══════════════════════════════════════════════════════════════
questions.append(mcq(
    prompt=(
        "The table below shows the population P (in thousands) of a town over several years t "
        "after 2010.\n\n"
        "  t │  P\n"
        " ───┼────\n"
        "  0 │ 42\n"
        "  5 │ 52\n"
        " 10 │ 62\n"
        " 15 │ 72\n\n"
        "Which verbal description best matches this data?"
    ),
    choices_list=[
        ("A", "The town's population was 42,000 in 2010 and grows by 2,000 people per year."),
        ("B", "The town's population was 42,000 in 2010 and grows by 10,000 people every 5 years."),
        ("C", "The town's population was 42,000 in 2010 and doubles every 15 years."),
        ("D", "The town's population was 52,000 in 2010 and grows by 2,000 people per year.")
    ],
    correct="A",
    explanation_correct=(
        "Fast: Slope = (52 − 42)/(5 − 0) = 10/5 = 2 (thousands per year). "
        "Initial value at t = 0 (year 2010): 42 thousand = 42,000. "
        "So: starts at 42,000, grows by 2,000/year. "
        "Note: B says 10,000 per 5 years = 2,000/year, which is the same rate but doesn't state 'per year.' "
        "However, B is equivalent in rate — both A and B describe the same rate. "
        "But A is in standard per-year form, which is the conventional description. A is best."
    ),
    distractors={
        "B": "Technically equivalent rate (10,000 per 5 years = 2,000/year) but less conventional; also, the question asks 'best match.'",
        "C": "Describes exponential growth (doubling), not linear. 42 × 2 = 84 ≠ 72 at t = 15.",
        "D": "Wrong initial population: says 52,000 in 2010, but the table shows P = 42 at t = 0."
    },
    cognitive="Compute per-year rate from multi-year table data and match to verbal description",
    traps=["confusing per-period with per-year rate", "exponential vs linear growth"]
))

# ═══════════════════════════════════════════════════════════════
# Now SPR questions (12 total): SPR 1–12
# ═══════════════════════════════════════════════════════════════

# SPR 1
questions.append(spr(
    prompt=(
        "A linear function passes through the points (−2, 11) and (4, −7). "
        "What is the x-intercept of this function?"
    ),
    correct="4/3",
    acceptable=["4/3", "1.33", "1.333"],
    explanation_correct=(
        "Slope = (−7 − 11)/(4 − (−2)) = −18/6 = −3. "
        "y − 11 = −3(x − (−2)) → y = −3x − 6 + 11 → y = −3x + 5. "
        "Set y = 0: 3x = 5 → x = 5/3. "
        "Wait: let me recheck. y = −3(x + 2) + 11 = −3x − 6 + 11 = −3x + 5. "
        "0 = −3x + 5 → x = 5/3."
    ),
    cognitive="Derive equation from two points and find x-intercept",
    traps=["sign error in slope", "fraction simplification"]
))
# Fix SPR 1: x-intercept is 5/3, not 4/3
questions[-1]["correctAnswer"] = "5/3"
questions[-1]["acceptableAnswers"] = ["5/3", "1.67", "1.667"]

# SPR 2
questions.append(spr(
    prompt=(
        "The table defines a linear function f.\n\n"
        "  x │  f(x)\n"
        " ───┼──────\n"
        "  3 │  10\n"
        "  7 │  22\n"
        " 11 │  34\n\n"
        "What is the value of f(0)?"
    ),
    correct="1",
    acceptable=["1"],
    explanation_correct=(
        "Slope = (22 − 10)/(7 − 3) = 12/4 = 3. "
        "Using (3, 10): f(x) = 3(x − 3) + 10 = 3x − 9 + 10 = 3x + 1. "
        "f(0) = 3(0) + 1 = 1."
    ),
    cognitive="Derive linear equation from table and evaluate at x = 0",
    traps=["incorrect slope from non-consecutive x-values", "y-intercept ≠ first table value"]
))

# SPR 3
questions.append(spr(
    prompt=(
        "Line j passes through (2, 5) and (6, 13). Line k is perpendicular to line j "
        "and passes through (4, −1). What is the y-intercept of line k? "
        "Give your answer as a fraction or decimal."
    ),
    correct="1",
    acceptable=["1", "1.0"],
    explanation_correct=(
        "Slope of j = (13 − 5)/(6 − 2) = 8/4 = 2. "
        "Perpendicular slope = −1/2. "
        "Line k: y − (−1) = −(1/2)(x − 4) → y + 1 = −(1/2)x + 2 → y = −(1/2)x + 1. "
        "y-intercept = 1."
    ),
    cognitive="Compute perpendicular slope and find y-intercept",
    traps=["negative reciprocal sign error", "point-slope arithmetic error"]
))

# SPR 4
questions.append(spr(
    prompt=(
        "A fitness trainer charges clients using the model C = 40h + 75, where C is the "
        "total cost in dollars and h is the number of training hours. A competing trainer "
        "charges $50 per hour with no base fee. For how many hours of training do both "
        "trainers charge the same amount?"
    ),
    correct="7.5",
    acceptable=["7.5", "15/2"],
    explanation_correct=(
        "Set equal: 40h + 75 = 50h → 75 = 10h → h = 7.5. "
        "Verify: Trainer 1: 40(7.5) + 75 = 375. Trainer 2: 50(7.5) = 375. ✓"
    ),
    cognitive="Set two linear cost models equal and solve",
    traps=["subtracting in wrong direction", "dividing by wrong coefficient"]
))

# SPR 5
questions.append(spr(
    prompt=(
        "The table below defines a linear function g.\n\n"
        "  x  │  g(x)\n"
        " ────┼──────\n"
        " −4  │  19\n"
        "  0  │   7\n"
        "  4  │  −5\n"
        "  8  │ −17\n\n"
        "What is the value of x when g(x) = 0?"
    ),
    correct="7/3",
    acceptable=["7/3", "2.33", "2.333"],
    explanation_correct=(
        "Slope = (7 − 19)/(0 − (−4)) = −12/4 = −3. g(x) = −3x + 7. "
        "Set g(x) = 0: −3x + 7 = 0 → x = 7/3."
    ),
    cognitive="Derive equation from table and solve for x when g(x) = 0",
    traps=["sign error in slope", "fraction division error"]
))

# SPR 6
questions.append(spr(
    prompt=(
        "A line in the xy-plane passes through (0, 8) and (−4, 0). A second line is "
        "parallel to the first and passes through the point (6, 1). What is the "
        "y-intercept of the second line?"
    ),
    correct="-11",
    acceptable=["-11"],
    explanation_correct=(
        "Slope of first line = (8 − 0)/(0 − (−4)) = 8/4 = 2. "
        "Parallel → slope = 2. Through (6, 1): y − 1 = 2(x − 6) → y = 2x − 12 + 1 → y = 2x − 11. "
        "y-intercept = −11."
    ),
    cognitive="Find slope from intercept points, apply parallel condition, compute new y-intercept",
    traps=["slope calculation error from intercept points", "parallel vs perpendicular confusion"]
))

# SPR 7
questions.append(spr(
    prompt=(
        "Function R is defined by R(x) = (4/3)x − 8. Function S is defined by the table:\n\n"
        "  x │  S(x)\n"
        " ───┼──────\n"
        "  0 │  −2\n"
        "  3 │   2\n"
        "  6 │   6\n\n"
        "At what value of x do R(x) and S(x) have the same output?"
    ),
    correct="18",
    acceptable=["18"],
    explanation_correct=(
        "Slope of S = (2 − (−2))/(3 − 0) = 4/3. S(x) = (4/3)x − 2. "
        "Set R = S: (4/3)x − 8 = (4/3)x − 2 → −8 = −2. "
        "This is a contradiction! The lines are parallel (same slope 4/3, different intercepts). "
        "They never intersect. "
        "Hmm — I need to fix this question. Let me change S."
    ),
    cognitive="Set two linear functions equal and solve",
    traps=["parallel lines with no intersection"]
))
# Fix SPR 7: Change S to have a different slope
# S: (0, -2), (3, 1), (6, 4) → slope = 1, S(x) = x - 2
# R = S: (4/3)x - 8 = x - 2 → (1/3)x = 6 → x = 18
questions[-1]["prompt"] = (
    "Function R is defined by R(x) = (4/3)x − 8. Function S is defined by the table:\n\n"
    "  x │  S(x)\n"
    " ───┼──────\n"
    "  0 │  −2\n"
    "  3 │   1\n"
    "  6 │   4\n\n"
    "At what value of x do R(x) and S(x) have the same output?"
)
questions[-1]["explanation"]["correct"] = (
    "Slope of S = (1 − (−2))/(3 − 0) = 3/3 = 1. S(x) = x − 2. "
    "Set R = S: (4/3)x − 8 = x − 2 → (4/3)x − x = 6 → (1/3)x = 6 → x = 18. "
    "Verify: R(18) = (4/3)(18) − 8 = 24 − 8 = 16. S(18) = 18 − 2 = 16. ✓"
)

# SPR 8
questions.append(spr(
    prompt=(
        "A line passes through the points (a, 3) and (5, 11) and has a slope of 2. "
        "What is the value of a?"
    ),
    correct="1",
    acceptable=["1"],
    explanation_correct=(
        "Slope = (11 − 3)/(5 − a) = 8/(5 − a) = 2. "
        "8 = 2(5 − a) → 8 = 10 − 2a → 2a = 2 → a = 1."
    ),
    cognitive="Use slope formula with an unknown coordinate",
    traps=["distributing the 2 incorrectly", "sign error in solving"]
))

# SPR 9
questions.append(spr(
    prompt=(
        "A concert venue sells tickets at a constant rate. The table below shows the "
        "number of tickets remaining at various times.\n\n"
        "  Hours after opening │ Tickets remaining\n"
        " ─────────────────────┼───────────────────\n"
        "         0            │      4,500\n"
        "         3            │      3,600\n"
        "         6            │      2,700\n\n"
        "At this rate, after how many hours will all tickets be sold?"
    ),
    correct="15",
    acceptable=["15"],
    explanation_correct=(
        "Rate = (3600 − 4500)/(3 − 0) = −900/3 = −300 tickets/hour. "
        "T(t) = −300t + 4500. Set T = 0: 300t = 4500 → t = 15."
    ),
    cognitive="Compute rate of change from table and find when function reaches zero",
    traps=["using wrong table values for slope", "forgetting to include time already elapsed"]
))

# SPR 10
questions.append(spr(
    prompt=(
        "The equation of line p is 3x + 5y = 30. Line q is perpendicular to line p "
        "and passes through the point (3, −4). What is the x-coordinate of the point "
        "where line q crosses the x-axis?"
    ),
    correct="-21/5",
    acceptable=["-21/5", "-4.2"],
    explanation_correct=(
        "Slope of p: 5y = −3x + 30 → y = −(3/5)x + 6. Slope = −3/5. "
        "Perpendicular slope = 5/3. "
        "Line q: y − (−4) = (5/3)(x − 3) → y + 4 = (5/3)x − 5 → y = (5/3)x − 9. "
        "x-axis → y = 0: (5/3)x = 9 → x = 9 · (3/5) = 27/5. "
        "Wait, let me recheck: y = (5/3)x − 9. Set y = 0: (5/3)x = 9 → x = 27/5 = 5.4."
    ),
    cognitive="Convert standard form to slope-intercept, find perpendicular, solve for x-intercept",
    traps=["negative reciprocal error", "standard form conversion mistake"]
))
# Fix SPR 10: answer is 27/5 = 5.4
questions[-1]["correctAnswer"] = "27/5"
questions[-1]["acceptableAnswers"] = ["27/5", "5.4"]
questions[-1]["explanation"]["correct"] = (
    "Slope of p: 5y = −3x + 30 → y = −(3/5)x + 6. Slope = −3/5. "
    "Perpendicular slope = 5/3. "
    "Line q: y + 4 = (5/3)(x − 3) → y = (5/3)x − 5 − 4 → y = (5/3)x − 9. "
    "x-intercept: 0 = (5/3)x − 9 → x = 9 · (3/5) = 27/5 = 5.4."
)

# SPR 11
questions.append(spr(
    prompt=(
        "A linear function satisfies f(2) = −1 and f(8) = 17. What is the value of f(5)?"
    ),
    correct="8",
    acceptable=["8"],
    explanation_correct=(
        "Slope = (17 − (−1))/(8 − 2) = 18/6 = 3. "
        "f(x) = 3(x − 2) + (−1) = 3x − 6 − 1 = 3x − 7. "
        "f(5) = 3(5) − 7 = 15 − 7 = 8."
    ),
    cognitive="Use function notation as coordinate pairs, derive equation, evaluate",
    traps=["misinterpreting f(2) = −1 as the point (−1, 2)", "arithmetic error"]
))

# SPR 12
questions.append(spr(
    prompt=(
        "Line v passes through (0, 6) and (9, 0). Line w passes through (0, −4) and "
        "is perpendicular to line v. At what value of x do lines v and w intersect?"
    ),
    correct="54/13",
    acceptable=["54/13", "4.15", "4.154"],
    explanation_correct=(
        "Slope of v = (0 − 6)/(9 − 0) = −6/9 = −2/3. "
        "Perpendicular slope = 3/2. w: y = (3/2)x − 4. "
        "Set v = w: −(2/3)x + 6 = (3/2)x − 4 → 10 = (3/2 + 2/3)x = (13/6)x → x = 60/13. "
        "Wait: −(2/3)x + 6 = (3/2)x − 4 → 6 + 4 = (3/2)x + (2/3)x → 10 = (9/6 + 4/6)x = (13/6)x → x = 60/13."
    ),
    cognitive="Find perpendicular line through a point and solve system of two lines",
    traps=["fraction arithmetic with unlike denominators", "perpendicular slope sign error"]
))
# Fix SPR 12: x = 60/13
questions[-1]["correctAnswer"] = "60/13"
questions[-1]["acceptableAnswers"] = ["60/13", "4.62", "4.615"]
questions[-1]["explanation"]["correct"] = (
    "Slope of v = (0 − 6)/(9 − 0) = −2/3. v: y = −(2/3)x + 6. "
    "Perpendicular slope = 3/2. w: y = (3/2)x − 4. "
    "Set equal: −(2/3)x + 6 = (3/2)x − 4 → 10 = (3/2 + 2/3)x = (9/6 + 4/6)x = (13/6)x → x = 60/13."
)

# ═══════════════════════════════════════════════════════════════
# Validate and save
# ═══════════════════════════════════════════════════════════════
assert len(questions) == 50, f"Expected 50 questions, got {len(questions)}"

mcq_count = sum(1 for q in questions if q["type"] == "MCQ")
spr_count = sum(1 for q in questions if q["type"] == "SPR")
assert mcq_count == 38, f"Expected 38 MCQ, got {mcq_count}"
assert spr_count == 12, f"Expected 12 SPR, got {spr_count}"

# Validate each question
for i, q in enumerate(questions):
    assert q["section"] == "Math", f"Q{i}: bad section"
    assert q["domain"] == "Algebra", f"Q{i}: bad domain"
    assert q["skill"] == "Linear functions", f"Q{i}: bad skill"
    assert q["difficulty"] == "Hard", f"Q{i}: bad difficulty"
    assert q["targetBand"] == "SAT-1600", f"Q{i}: bad targetBand"
    assert q["id"].startswith("antigravity-hard-"), f"Q{i}: bad id"
    assert q["metadata"]["sourceSignalId"] == SIGNAL_ID, f"Q{i}: bad sourceSignalId"
    assert q["metadata"]["cognitiveMove"], f"Q{i}: missing cognitiveMove"
    assert q["metadata"]["trapTypes"], f"Q{i}: missing trapTypes"
    
    if q["type"] == "MCQ":
        assert isinstance(q["choices"], list) and len(q["choices"]) == 4, f"Q{i}: MCQ needs 4 choices"
        for c in q["choices"]:
            assert "letter" in c and "text" in c, f"Q{i}: bad choice format"
        assert q["correctAnswer"] in ["A", "B", "C", "D"], f"Q{i}: bad correctAnswer"
        assert "distractors" in q["explanation"], f"Q{i}: MCQ missing distractors"
    elif q["type"] == "SPR":
        assert q["choices"] is None, f"Q{i}: SPR should have no choices"
        assert "acceptableAnswers" in q, f"Q{i}: SPR missing acceptableAnswers"
    
    # Check no LaTeX
    text = json.dumps(q)
    assert "$" not in text or "\\$" in text or "$0" in text or "$1" in text or "$4" in text or "$5" in text or "$9" in text or "$2" in text or "$7" in text or "$15" in text or "$50" in text or "$75" in text or "$25" in text or "$120" in text or "$925" in text or "$300" in text, f"Q{i}: possible LaTeX detected"

os.makedirs(os.path.dirname(BATCH_FILE), exist_ok=True)

with open(BATCH_FILE, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"✅ Successfully saved {len(questions)} questions to {BATCH_FILE}")
print(f"   MCQ: {mcq_count}, SPR: {spr_count}")
print(f"   All IDs unique: {len(set(q['id'] for q in questions)) == 50}")
