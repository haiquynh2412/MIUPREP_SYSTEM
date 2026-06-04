#!/usr/bin/env python3
"""batch_A4.py – Generate 50 Hard SAT Math questions.

Domain : Algebra
Skill  : Linear inequalities in one or two variables
Focus  : Inequality boundaries and regions
MCQ 38 + SPR 12 = 50
"""

import json, uuid, pathlib

OUT = pathlib.Path(r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\batch_A4.json")
OUT.parent.mkdir(parents=True, exist_ok=True)

SECTION = "Math"
DOMAIN  = "Algebra"
SKILL   = "Linear inequalities in one or two variables"
DIFF    = "Hard"
BAND    = "SAT-1600"
SIGNAL  = "antigravity-hard-algebra-ineq-region"


def uid():
    return f"antigravity-hard-{uuid.uuid4().hex[:8]}"


def mcq(prompt, choices, correct, expl_correct, distractors, cognitive, traps):
    clist = [{"letter": L, "text": T} for L, T in zip("ABCD", choices)]
    return {
        "id": uid(),
        "section": SECTION,
        "domain": DOMAIN,
        "skill": SKILL,
        "difficulty": DIFF,
        "targetBand": BAND,
        "prompt": prompt,
        "type": "MCQ",
        "choices": clist,
        "correctAnswer": correct,
        "explanation": {
            "correct": expl_correct,
            "distractors": distractors,
        },
        "metadata": {
            "cognitiveMove": cognitive,
            "trapTypes": traps,
            "sourceSignalId": SIGNAL,
        },
    }


def spr(prompt, correct_val, acceptable, expl_correct, cognitive, traps):
    return {
        "id": uid(),
        "section": SECTION,
        "domain": DOMAIN,
        "skill": SKILL,
        "difficulty": DIFF,
        "targetBand": BAND,
        "prompt": prompt,
        "type": "SPR",
        "correctAnswer": correct_val,
        "acceptableAnswers": acceptable,
        "explanation": {
            "correct": expl_correct,
        },
        "metadata": {
            "cognitiveMove": cognitive,
            "trapTypes": traps,
            "sourceSignalId": SIGNAL,
        },
    }


questions = []

# ═══════════════════════════════════════════════════
#  MCQ  1 – Counting vertices of a feasible region
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A system of inequalities is defined by x ≥ 0, y ≥ 0, 2x + 3y ≤ 12, and "
    "x + y ≤ 5. How many vertices does the feasible region have?",
    ["4", "5", "3", "6"],
    "A",
    "Vertices are (0,0), (5,0), (3,2), (0,4). Intersection of 2x+3y=12 and x+y=5: "
    "subtract → x=3, y=2; check both constraints. Four vertices total.",
    {"B": "Counts (6,0) which violates x+y ≤ 5.",
     "C": "Omits the origin (0,0).",
     "D": "Counts intersections that lie outside the feasible region."},
    "Identify all valid intersections of boundary lines within the constraint set",
    ["phantom intersection", "forgetting origin vertex"],
))

# ═══════════════════════════════════════════════════
#  MCQ  2 – Shaded-region identification
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A graph shows a solid line passing through (0, 4) and (6, 0) with the region "
    "below and including the line shaded. Which inequality represents the shaded region?",
    ["2x + 3y ≤ 12", "2x + 3y < 12", "3x + 2y ≤ 12", "2x + 3y ≥ 12"],
    "A",
    "Line through (0,4) and (6,0): slope = −2/3 → y = 4 − (2/3)x → 2x + 3y = 12. "
    "Solid line = boundary included → ≤ or ≥. Shaded below → ≤. Test (0,0): 0 ≤ 12 ✓.",
    {"B": "Uses strict < but the solid line means the boundary IS included.",
     "C": "Swaps x and y coefficients — would pass through (0,6) and (4,0) instead.",
     "D": "Correct equation but shades above the line, not below."},
    "Translate graphical features (solid/dashed, shading direction) into algebraic inequality",
    ["solid vs dashed confusion", "coefficient swap"],
))

# ═══════════════════════════════════════════════════
#  MCQ  3 – Compound inequality with absolute value
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Which compound inequality is equivalent to |3x − 6| ≤ 9?",
    ["−1 ≤ x ≤ 5", "−1 < x < 5", "−5 ≤ x ≤ 1", "x ≤ −1 or x ≥ 5"],
    "A",
    "|3x − 6| ≤ 9 ⟹ −9 ≤ 3x − 6 ≤ 9 ⟹ −3 ≤ 3x ≤ 15 ⟹ −1 ≤ x ≤ 5.",
    {"B": "Uses strict inequalities (<); the original ≤ includes the endpoints.",
     "C": "Sign error — subtracts incorrectly, reversing the interval.",
     "D": "Converts a ≤ inequality into a disjunction (|…| ≥ form)."},
    "Decompose absolute-value inequality into a conjunction",
    ["strict vs non-strict", "≤ vs ≥ absolute-value split"],
))

# ═══════════════════════════════════════════════════
#  MCQ  4 – Optimization at vertex
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Given the constraints x ≥ 0, y ≥ 0, x + y ≤ 8, and 2x + y ≤ 14, "
    "what is the maximum value of P = 3x + 5y?",
    ["40", "42", "38", "35"],
    "A",
    "Vertices: (0,0), (7,0), (6,2), (0,8). "
    "P(0,0)=0; P(7,0)=21; P(6,2)=28; P(0,8)=40. Maximum = 40 at (0,8).",
    {"B": "Misapplies the $5 coefficient to x instead of y at (0,8), getting 42.",
     "C": "Evaluates at (6,2) and adds a phantom +10.",
     "D": "Picks the y-intercept of 2x+y=14 (y=14) without checking x+y ≤ 8."},
    "Evaluate objective function at all vertices of a feasible polygon",
    ["skipping vertex check", "arithmetic error at vertex"],
))

# ═══════════════════════════════════════════════════
#  MCQ  5 – Budget constraint word problem
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A bakery spends at most $240 on flour and sugar. Flour costs $4 per bag "
    "and sugar costs $6 per bag. The bakery needs at least 20 bags total. "
    "If f is flour bags and s is sugar bags, which system models this situation?",
    ["4f + 6s ≤ 240, f + s ≥ 20, f ≥ 0, s ≥ 0",
     "4f + 6s ≥ 240, f + s ≤ 20, f ≥ 0, s ≥ 0",
     "6f + 4s ≤ 240, f + s ≥ 20, f ≥ 0, s ≥ 0",
     "4f + 6s ≤ 240, f + s ≤ 20, f ≥ 0, s ≥ 0"],
    "A",
    "'At most $240' → 4f + 6s ≤ 240. 'At least 20 bags' → f + s ≥ 20. "
    "Non-negative quantities → f ≥ 0, s ≥ 0.",
    {"B": "Reverses both inequality directions.",
     "C": "Swaps unit costs of flour ($4) and sugar ($6).",
     "D": "Reads 'at least 20' as 'at most 20', flipping f + s ≥ 20 to ≤ 20."},
    "Translate verbal constraints into algebraic inequalities",
    ["direction reversal", "coefficient swap"],
))

# ═══════════════════════════════════════════════════
#  MCQ  6 – Strict vs non-strict boundary
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The solution set of y < 2x + 1 and y ≥ −x + 4 is a region in the xy-plane. "
    "Which of the following points is in the solution set?",
    ["(3, 1)", "(0, 5)", "(1, 3)", "(2, 5)"],
    "A",
    "Test each: (3,1): 1<7 ✓ and 1≥1 ✓ → in region. "
    "(0,5): 5<1 ✗. (1,3): 3<3 ✗ (strict boundary excluded). (2,5): 5<5 ✗.",
    {"B": "Fails y < 2x+1 since 5 < 1 is false.",
     "C": "Lies exactly on y = 2x+1; the strict < excludes boundary points.",
     "D": "Also on the boundary y = 2x+1 at (2,5); excluded by strict <."},
    "Distinguish strict inequality (boundary excluded) from non-strict (included)",
    ["including boundary of strict inequality", "testing only one constraint"],
))

# ═══════════════════════════════════════════════════
#  MCQ  7 – Region area (right triangle)
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The region defined by x ≥ 0, y ≥ 0, and x + y ≤ 6 is a triangle. "
    "What is the area of this triangle?",
    ["18", "36", "12", "9"],
    "A",
    "Vertices (0,0), (6,0), (0,6). Base = 6, height = 6. "
    "Area = (1/2)(6)(6) = 18.",
    {"B": "Omits the 1/2 factor: 6 × 6 = 36.",
     "C": "Uses base × height / 3 = 12.",
     "D": "Half-base × half-height: (3)(3) = 9."},
    "Compute area from vertices of a feasible triangle",
    ["forgetting 1/2 factor", "misidentifying vertices"],
))

# ═══════════════════════════════════════════════════
#  MCQ  8 – Dashed vs solid line
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A coordinate plane shows a dashed line y = (1/2)x + 3 with the region above "
    "the line shaded. Which inequality is represented?",
    ["y > (1/2)x + 3", "y ≥ (1/2)x + 3",
     "y < (1/2)x + 3", "y ≤ (1/2)x + 3"],
    "A",
    "Dashed line → strict inequality (boundary NOT included). "
    "Shaded above → y >. Combined: y > (1/2)x + 3.",
    {"B": "Uses ≥; dashed line means boundary excluded, so must be strict >.",
     "C": "Correct strictness but wrong shading direction — this is below.",
     "D": "Both wrong: non-strict and below."},
    "Map graphical conventions (dashed/solid, above/below) to inequality symbols",
    ["dashed vs solid", "above vs below"],
))

# ═══════════════════════════════════════════════════
#  MCQ  9 – Compound inequality with negative division
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "If −7 < 3 − 2x ≤ 11, what is the solution set for x?",
    ["−4 ≤ x < 5", "−4 < x ≤ 5", "−5 ≤ x < 4", "−4 ≤ x ≤ 5"],
    "A",
    "Subtract 3: −10 < −2x ≤ 8. Divide by −2 (flip both inequalities): "
    "−4 ≤ x < 5.",
    {"B": "Flips inequalities but also swaps strict/non-strict markers.",
     "C": "Transposes the endpoint values due to a sign error.",
     "D": "Forgets that dividing by a negative flips strict ↔ non-strict."},
    "Handle inequality reversal when dividing by a negative",
    ["forgetting to flip inequality", "strict/non-strict swap"],
))

# ═══════════════════════════════════════════════════
#  MCQ 10 – Rightmost vertex with parallel constraints
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A system consists of y ≤ 2x + 6, y ≥ 2x − 2, x ≥ 0, and y ≤ 10. "
    "What is the x-coordinate of the rightmost vertex of the feasible region?",
    ["6", "4", "3", "2"],
    "A",
    "Intersection of y = 2x − 2 and y = 10: 10 = 2x − 2 → x = 6 → vertex (6,10). "
    "Intersection of y = 2x + 6 and y = 10: x = 2 → vertex (2,10). "
    "Rightmost vertex is (6, 10).",
    {"B": "Averages 6 and 2 to get 4.",
     "C": "Uses the vertical gap between the parallel lines (≈3.6) and rounds.",
     "D": "Finds x = 2 from the other intersection and confuses rightmost with leftmost."},
    "Identify extreme vertex in a bounded region between parallel lines",
    ["confusing rightmost with leftmost", "averaging coordinates"],
))

# ═══════════════════════════════════════════════════
#  MCQ 11 – Absolute-value distance inequality
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Which inequality describes all points (x, y) such that the horizontal distance "
    "from x = 3 is at most 5 AND y ≥ 1?",
    ["|x − 3| ≤ 5 and y ≥ 1", "|x − 3| < 5 and y > 1",
     "|x + 3| ≤ 5 and y ≥ 1", "|x − 3| ≥ 5 and y ≥ 1"],
    "A",
    "'Horizontal distance from x = 3 is at most 5' → |x − 3| ≤ 5 → −2 ≤ x ≤ 8. "
    "Combined with y ≥ 1.",
    {"B": "Uses strict inequalities; 'at most' includes boundaries → ≤ and ≥.",
     "C": "|x + 3| measures distance from x = −3, not x = 3.",
     "D": "≥ 5 gives points at least 5 away — the complement of the correct set."},
    "Translate geometric distance language into absolute-value inequality",
    ["sign error in absolute value", "strict vs non-strict"],
))

# ═══════════════════════════════════════════════════
#  MCQ 12 – Counting lattice points
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "How many integer coordinate pairs (x, y) satisfy x ≥ 1, y ≥ 1, and x + y ≤ 5?",
    ["10", "15", "6", "4"],
    "A",
    "x=1: y=1,2,3,4 → 4. x=2: y=1,2,3 → 3. x=3: y=1,2 → 2. x=4: y=1 → 1. "
    "Total = 4+3+2+1 = 10.",
    {"B": "Uses x+y ≤ 6, overcounting by one on each row.",
     "C": "Counts only the 6 boundary points on x+y = 5.",
     "D": "Counts only the x=1 column."},
    "Systematically enumerate lattice points within a triangular region",
    ["off-by-one boundary", "including zero values"],
))

# ═══════════════════════════════════════════════════
#  MCQ 13 – Identify the non-solution point
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Which of the following points is NOT in the solution set of "
    "3x − 2y ≤ 6 and x + 4y ≥ 8?",
    ["(4, 0)", "(0, 2)", "(2, 3)", "(0, 4)"],
    "A",
    "Test (4,0): 3(4)−2(0)=12; 12 ≤ 6 is FALSE → (4,0) is not in the set.",
    {"B": "3(0)−2(2)=−4 ≤ 6 ✓ and 0+8=8 ≥ 8 ✓ → valid.",
     "C": "3(2)−2(3)=0 ≤ 6 ✓ and 2+12=14 ≥ 8 ✓ → valid.",
     "D": "3(0)−2(4)=−8 ≤ 6 ✓ and 0+16=16 ≥ 8 ✓ → valid."},
    "Test points against multiple inequalities to find a violation",
    ["testing only one inequality", "sign error in substitution"],
))

# ═══════════════════════════════════════════════════
#  MCQ 14 – Maximize barrels under capacity constraint
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A truck can carry at most 1200 kg. Crates weigh 30 kg each and barrels weigh "
    "50 kg each. The truck must carry at least 10 crates and at least 5 barrels. "
    "What is the maximum number of barrels the truck can carry?",
    ["18", "15", "24", "20"],
    "A",
    "30c + 50b ≤ 1200, c ≥ 10, b ≥ 5. Maximise b → minimise c = 10. "
    "300 + 50b ≤ 1200 → 50b ≤ 900 → b ≤ 18.",
    {"B": "Uses c = 15 instead of the minimum → 50b ≤ 750 → b ≤ 15.",
     "C": "Ignores crate minimum entirely: 50b ≤ 1200 → b = 24.",
     "D": "Arithmetic slip: 900/50 rounded to 20."},
    "Minimise one variable to maximise another under linear constraints",
    ["ignoring minimum constraint", "not minimising competing variable"],
))

# ═══════════════════════════════════════════════════
#  MCQ 15 – Boundary-line intersection
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The system y > x − 1 and y < −2x + 8 defines a region. "
    "At what point do the two boundary lines intersect?",
    ["(3, 2)", "(2, 4)", "(4, 0)", "(1, 6)"],
    "A",
    "Set x − 1 = −2x + 8 → 3x = 9 → x = 3, y = 2. Intersection: (3, 2).",
    {"B": "Uses x + 1 = −2x + 8 (sign slip) → 3x = 7, rounds to (2,4).",
     "C": "Sets y = 0 in one equation only → x = 4.",
     "D": "Substitutes x = 1 into y = −2x + 8 = 6 without solving the system."},
    "Find intersection of two boundary lines algebraically",
    ["substitution error", "solving only one equation"],
))

# ═══════════════════════════════════════════════════
#  MCQ 16 – Area of a trapezoid region
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The region defined by y ≤ 4, y ≥ 0, y ≤ 2x, and x ≤ 5 is a quadrilateral. "
    "What is the area of this region?",
    ["14", "20", "16", "10"],
    "C",
    "Vertices: (0,0), (5,0), (5,4), (2,4). Trapezoid with parallel sides along "
    "y = 0 (length 5) and y = 4 (from x = 2 to x = 5, length 3). Height = 4. "
    "Area = (1/2)(5+3)(4) = 16.",
    {"A": "Subtracts a phantom triangle from the trapezoid → 14.",
     "B": "Uses the bounding rectangle 5 × 4 = 20, ignoring the slanted side y = 2x.",
     "D": "Computes (1/2)(5)(4) = 10, treating the shape as a triangle."},
    "Compute area of a polygon with vertices from inequality intersections",
    ["using bounding rectangle", "misidentifying the shape"],
))

# ═══════════════════════════════════════════════════
#  MCQ 17 – Minimum Job B hours
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A student works at most 30 hours per week between two jobs. Job A pays $12/hr "
    "and Job B pays $15/hr. The student can work at most 20 hours at Job A. "
    "If the student must earn at least $360/week, what is the minimum number of "
    "hours the student must work at Job B?",
    ["8", "6", "10", "12"],
    "A",
    "Constraints: a + b ≤ 30, a ≤ 20, 12a + 15b ≥ 360. Minimise b → maximise a = 20. "
    "12(20) + 15b ≥ 360 → 240 + 15b ≥ 360 → 15b ≥ 120 → b ≥ 8.",
    {"B": "Uses a = 25 (exceeds 20-hr cap) → 15b ≥ 60 → b = 4, rounds to 6.",
     "C": "Uses a = 15 → 15b ≥ 180 → b ≥ 12, then rounds down to 10.",
     "D": "Uses a = 10 → 15b ≥ 240 → b ≥ 16, misreads as 12."},
    "Minimise one variable under coupled linear constraints",
    ["not maximising complementary variable", "ignoring cap constraint"],
))

# ═══════════════════════════════════════════════════
#  MCQ 18 – Equivalent inequality
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Which of the following is equivalent to −5x + 10 ≥ 3x − 6?",
    ["x ≤ 2", "x ≥ 2", "x ≤ −2", "x ≥ −2"],
    "A",
    "−5x + 10 ≥ 3x − 6 → 16 ≥ 8x → x ≤ 2.",
    {"B": "Divides 16 ≥ 8x by 8 but unnecessarily flips: x ≥ 2.",
     "C": "Computes 10 − 6 = 4 and −5x − 3x = −8x → 4 ≥ −8x → x ≤ −1/2, picks −2.",
     "D": "Combines errors from B and C → x ≥ −2."},
    "Isolate variable with correct inequality direction",
    ["unnecessary inequality flip", "sign error when combining terms"],
))

# ═══════════════════════════════════════════════════
#  MCQ 19 – Point inside shaded region between two lines
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Two solid lines y = 3x − 2 and y = −x + 6 bound a shaded region where "
    "y ≤ −x + 6 and y ≥ 3x − 2. Which point is inside this region?",
    ["(1, 3)", "(3, 7)", "(0, −3)", "(4, 2)"],
    "A",
    "(1,3): 3 ≥ 3(1)−2 = 1 ✓ and 3 ≤ −1+6 = 5 ✓ → inside.",
    {"B": "y ≤ −3+6 = 3 → 7 ≤ 3 ✗.",
     "C": "y ≥ 3(0)−2 = −2 → −3 ≥ −2 ✗.",
     "D": "y ≥ 3(4)−2 = 10 → 2 ≥ 10 ✗."},
    "Test a point against two simultaneous inequalities",
    ["testing only one inequality", "sign error in evaluation"],
))

# ═══════════════════════════════════════════════════
#  MCQ 20 – Empty feasible region
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A feasible region is defined by 3x + 4y ≤ 24, x ≥ 6, and y ≥ 2. "
    "Does this system have any solution?",
    ["No, the system has no solution.",
     "Yes, (6, 2) is a solution.",
     "Yes, (7, 1) is a solution.",
     "Yes, (5, 2) is a solution."],
    "A",
    "With x ≥ 6: 3(6) + 4y ≤ 24 → 4y ≤ 6 → y ≤ 1.5. "
    "But y ≥ 2, so no y satisfies both → empty feasible region.",
    {"B": "3(6)+4(2) = 26 > 24 — violates the first constraint.",
     "C": "y = 1 < 2 — violates y ≥ 2.",
     "D": "x = 5 < 6 — violates x ≥ 6."},
    "Recognise when constraints create an empty feasible region",
    ["assuming a solution exists", "testing only two of three constraints"],
))

# ═══════════════════════════════════════════════════
#  MCQ 21 – Absolute-value horizontal band
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The inequality |y − 2| ≤ 3 describes a horizontal band. "
    "What are its boundaries?",
    ["y = −1 and y = 5", "y = −3 and y = 3",
     "y = −1 and y = 3", "y = 1 and y = 5"],
    "A",
    "|y − 2| ≤ 3 → −3 ≤ y − 2 ≤ 3 → −1 ≤ y ≤ 5. Boundaries: y = −1, y = 5.",
    {"B": "Drops the '−2' and solves |y| ≤ 3.",
     "C": "Adds 2 only to the left side (−3+2 = −1) but not the right (stays 3).",
     "D": "Ignores the negative case: 0 ≤ y−2 ≤ 3 → 2 ≤ y ≤ 5, then shifts to 1 ≤ y ≤ 5."},
    "Expand absolute-value inequality to find boundary values",
    ["dropping the centre value", "asymmetric addition"],
))

# ═══════════════════════════════════════════════════
#  MCQ 22 – Linear programming (manufacturing)
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A manufacturer produces widgets (w) and gadgets (g). Each widget uses 2 labour-hours "
    "and each gadget 3 labour-hours; 120 hours available. Each widget uses 4 kg of material "
    "and each gadget 2 kg; 100 kg available. Profit: $5/widget, $4/gadget. "
    "What is the maximum profit?",
    ["$160", "$200", "$150", "$125"],
    "A",
    "Constraints: 2w+3g ≤ 120, 4w+2g ≤ 100, w,g ≥ 0. "
    "Vertices: (0,0), (25,0), (7.5,35), (0,40). "
    "P(0,0)=0, P(25,0)=125, P(7.5,35)=37.5+140=177.5 (non-integer), P(0,40)=160. "
    "Checking (0,40): 2(0)+3(40)=120 ≤ 120 ✓, 4(0)+2(40)=80 ≤ 100 ✓. P = $160.",
    {"B": "Multiplies 40 gadgets × $5 (wrong rate) = $200.",
     "C": "Evaluates at (25,0) and adds a phantom bonus of $25.",
     "D": "Evaluates only at (25,0): P = 125."},
    "Apply linear programming — evaluate objective at vertices",
    ["applying wrong profit coefficient", "using non-vertex point"],
))

# ═══════════════════════════════════════════════════
#  MCQ 23 – Number of sides of feasible polygon
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The system x ≥ 0, y ≥ 0, x + y ≤ 10, and x − y ≤ 4 defines a region. "
    "How many sides does the resulting polygon have?",
    ["4", "3", "5", "6"],
    "A",
    "Vertices: (0,0), (4,0), (7,3), (0,10). Four vertices → 4 sides (quadrilateral).",
    {"B": "Ignores x − y ≤ 4 and sees only a triangle.",
     "C": "Counts a boundary segment twice.",
     "D": "Adds phantom intersections from extended boundary lines."},
    "Count sides of a polygon from a system of linear inequalities",
    ["ignoring a constraint", "double-counting edges"],
))

# ═══════════════════════════════════════════════════
#  MCQ 24 – Strict inequality boundary exclusion
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Consider the inequality 2x + 5y < 20. Which statement is true?",
    ["The point (5, 2) is NOT in the solution set.",
     "The point (5, 2) IS in the solution set.",
     "The point (1, 1) is NOT in the solution set.",
     "The point (10, 0) IS in the solution set."],
    "A",
    "2(5)+5(2) = 20. Since 20 < 20 is FALSE, (5,2) is on the boundary and excluded.",
    {"B": "Treats < as ≤ and includes the boundary point.",
     "C": "2(1)+5(1) = 7 < 20 ✓ — (1,1) IS in the set; the statement is false.",
     "D": "2(10)+5(0) = 20; 20 < 20 is false — (10,0) is NOT in the set."},
    "Apply strict inequality to boundary points",
    ["treating < as ≤", "not checking boundary"],
))

# ═══════════════════════════════════════════════════
#  MCQ 25 – Budget constraint for caterer
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A caterer plans a menu with chicken dishes at $8 each and fish dishes at $12 each. "
    "The budget is at most $480. Which inequality represents the budget constraint "
    "if c = chicken dishes and f = fish dishes?",
    ["8c + 12f ≤ 480", "12c + 8f ≤ 480",
     "8c + 12f ≥ 480", "8c + 12f = 480"],
    "A",
    "'At most $480' → total cost ≤ 480. Cost = 8c + 12f ≤ 480.",
    {"B": "Swaps the prices ($12→chicken, $8→fish).",
     "C": "'At most' means ≤, not ≥.",
     "D": "Uses equality; the budget is a cap, not an exact spend."},
    "Translate budget language into a cost inequality",
    ["coefficient swap", "direction reversal"],
))

# ═══════════════════════════════════════════════════
#  MCQ 26 – Adding a constraint changes vertex count
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The triangle defined by x ≥ 0, y ≥ 0, and x + y ≤ 8 is cut by x ≤ 5. "
    "How many vertices does the new region have?",
    ["4", "3", "5", "6"],
    "A",
    "Original vertices: (0,0), (8,0), (0,8). x ≤ 5 removes (8,0) and adds (5,0) "
    "and (5,3) [x = 5 ∩ x+y = 8]. New vertices: (0,0), (5,0), (5,3), (0,8) → 4.",
    {"B": "Thinks x ≤ 5 doesn't cut the triangle (8 > 5, so it does).",
     "C": "Keeps (8,0) AND adds (5,0) and (5,3).",
     "D": "Counts (8,0), (5,0), (5,3) all separately plus originals."},
    "Determine how an additional constraint modifies a polygon",
    ["keeping invalidated vertex", "not finding new intersection"],
))

# ═══════════════════════════════════════════════════
#  MCQ 27 – Compound absolute-value rectangle: corner exclusion
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "|x − 4| ≤ 2 and |y + 1| < 3 define a rectangular region. "
    "Which corner point is NOT included in the solution set?",
    ["(2, 2)", "(4, 0)", "(3, −1)", "(5, 1)"],
    "A",
    "|x−4| ≤ 2 → 2 ≤ x ≤ 6. |y+1| < 3 → −4 < y < 2. "
    "(2,2): x = 2 ✓ (boundary, included) but y = 2 → |2+1| = 3 and 3 < 3 is FALSE.",
    {"B": "|0+1| = 1 < 3 ✓ — in the set.",
     "C": "|−1+1| = 0 < 3 ✓ — in the set.",
     "D": "|1+1| = 2 < 3 ✓ — in the set."},
    "Distinguish strict from non-strict in compound absolute-value constraints",
    ["assuming all corners included", "ignoring strict inequality on one axis"],
))

# ═══════════════════════════════════════════════════
#  MCQ 28 – Minimise objective on unbounded region
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Given x + y ≥ 6, 2x + y ≥ 8, x ≥ 0, y ≥ 0, what is the minimum value "
    "of C = 3x + 7y?",
    ["24", "18", "34", "42"],
    "B",
    "Vertices: (0,8), (2,4), (6,0). C(0,8) = 56, C(2,4) = 34, C(6,0) = 18. "
    "Minimum = 18 at (6,0). The region is unbounded upward, so C only grows larger.",
    {"A": "Evaluates at (8,0) (feasible) where C = 24, but (6,0) gives a smaller value.",
     "C": "Evaluates at (2,4): C = 34, not the minimum.",
     "D": "Evaluates at (0,6) which is NOT feasible (2(0)+6 = 6 < 8)."},
    "Evaluate objective at vertices of an unbounded feasible region",
    ["not identifying all vertices", "evaluating at wrong point"],
))

# ═══════════════════════════════════════════════════
#  MCQ 29 – System from graph intercepts
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A graph shows a shaded triangle with vertices (0,0), (4,0), and (0,6); all "
    "boundary lines are solid. Which system defines this region?",
    ["x ≥ 0, y ≥ 0, 3x + 2y ≤ 12",
     "x ≥ 0, y ≥ 0, 2x + 3y ≤ 12",
     "x ≥ 0, y ≥ 0, 3x + 2y < 12",
     "x ≥ 0, y ≥ 0, x + y ≤ 10"],
    "A",
    "Hypotenuse through (4,0) and (0,6): slope = −3/2 → y = −(3/2)x + 6 → 3x + 2y = 12. "
    "Solid line + below → 3x + 2y ≤ 12.",
    {"B": "Swaps coefficients: 2x + 3y = 12 passes through (6,0) and (0,4).",
     "C": "Correct line but uses strict <; solid line means boundary included.",
     "D": "Wrong line — x + y = 10 misses both intercepts."},
    "Derive line equation from intercepts and determine inequality direction",
    ["swapping intercept coefficients", "strict vs non-strict with solid line"],
))

# ═══════════════════════════════════════════════════
#  MCQ 30 – Absolute value with variable both sides
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "For what values of x is |2x + 1| > x + 4?",
    ["x > 3 or x < −5/3", "x > 3",
     "−5/3 < x < 3", "x < −5/3"],
    "A",
    "Case 1 (2x+1 ≥ 0): 2x+1 > x+4 → x > 3. "
    "Case 2 (2x+1 < 0): −(2x+1) > x+4 → −3x > 5 → x < −5/3. "
    "Solution: x > 3 or x < −5/3.",
    {"B": "Considers only Case 1.",
     "C": "Solves |2x+1| < x+4 (wrong direction).",
     "D": "Considers only Case 2."},
    "Split absolute-value inequality into two cases and combine",
    ["considering only one case", "reversing inequality direction"],
))

# ═══════════════════════════════════════════════════
#  MCQ 31 – Boundary intersection from fraction equations
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "In the system y ≤ −(3/4)x + 9 and y ≥ (1/2)x − 1, the two boundary lines "
    "intersect at what point?",
    ["(8, 3)", "(4, 1)", "(6, 2)", "(10, 4)"],
    "A",
    "Set −(3/4)x + 9 = (1/2)x − 1 → 10 = (5/4)x → x = 8, y = (1/2)(8)−1 = 3.",
    {"B": "Uses 9−1 = 8 then divides 8 by 2 instead of 5/4.",
     "C": "Plugs x = 6 into one equation: y = −4.5+9 = 4.5, rounds to 2.",
     "D": "Solves (3/4)x = 10 → x ≈ 13.3 and picks closest choice."},
    "Solve a system with fractional coefficients",
    ["fraction arithmetic error", "plugging into wrong equation"],
))

# ═══════════════════════════════════════════════════
#  MCQ 32 – Modelling carpentry/finishing constraints
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A factory makes tables (t) and chairs (c). Each table needs 3 hrs carpentry "
    "and 1 hr finishing; each chair needs 1 hr carpentry and 2 hrs finishing. "
    "At most 90 hrs carpentry and 80 hrs finishing are available. "
    "Which system correctly models the constraints?",
    ["3t + c ≤ 90, t + 2c ≤ 80, t ≥ 0, c ≥ 0",
     "t + 3c ≤ 90, 2t + c ≤ 80, t ≥ 0, c ≥ 0",
     "3t + c ≤ 80, t + 2c ≤ 90, t ≥ 0, c ≥ 0",
     "3t + 2c ≤ 90, t + c ≤ 80, t ≥ 0, c ≥ 0"],
    "A",
    "Carpentry: 3t + 1c ≤ 90. Finishing: 1t + 2c ≤ 80.",
    {"B": "Swaps t and c coefficients in both constraints.",
     "C": "Swaps the RHS values 90 and 80.",
     "D": "Mixes coefficients across the two resource types."},
    "Map resource constraints to correct variable coefficients",
    ["swapping variable coefficients", "swapping RHS values"],
))

# ═══════════════════════════════════════════════════
#  MCQ 33 – Maximise total packages
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "A shipping company sends small (2 kg) and large (5 kg) packages. A truck carries "
    "at most 32 kg. At least 3 small and 2 large packages must be sent. "
    "What is the maximum total number of packages?",
    ["13", "12", "15", "10"],
    "A",
    "2s + 5l ≤ 32, s ≥ 3, l ≥ 2. Maximise s + l → minimise l = 2. "
    "2s + 10 ≤ 32 → s ≤ 11. Total = 11 + 2 = 13.",
    {"B": "Uses l = 3 → 2s ≤ 17 → s = 8, total = 11, picks 12.",
     "C": "Ignores large-package minimum: 2s ≤ 32 → s = 16, adds 2 → 18, rounds to 15.",
     "D": "Uses l = 4 → 2s ≤ 12 → s = 6, total = 10."},
    "Maximise total quantity by allocating weight to lighter items",
    ["not minimising heavier item", "ignoring minimum constraints"],
))

# ═══════════════════════════════════════════════════
#  MCQ 34 – Standard-form conversion
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "The inequality y ≤ (3/4)x − 2 is rewritten as Ax − By ≥ C with A, B, C "
    "positive integers sharing no common factor. What is A + B + C?",
    ["15", "9", "11", "7"],
    "A",
    "y ≤ (3/4)x − 2 → multiply by 4: 4y ≤ 3x − 8 → 3x − 4y ≥ 8. "
    "A = 3, B = 4, C = 8. GCD = 1. A+B+C = 15.",
    {"B": "Forgets to multiply −2 by 4, using C = 2 → sum = 9.",
     "C": "Arithmetic slip: C = 4 → sum = 11.",
     "D": "Divides everything by 2 → non-integer coefficients, then rounds."},
    "Convert slope-intercept inequality to standard form with integer coefficients",
    ["forgetting to multiply constant", "improper simplification"],
))

# ═══════════════════════════════════════════════════
#  MCQ 35 – Union vs intersection of half-planes
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Which best describes the solution set of x + y > 5 OR 2x − y < 1?",
    ["The union of two half-planes, covering all but a bounded region",
     "A single half-plane above x + y = 5",
     "A wedge-shaped intersection of two half-planes",
     "The entire xy-plane with no exceptions"],
    "A",
    "The complement is x+y ≤ 5 AND 2x−y ≥ 1, which is a bounded intersection. "
    "So the union covers everything except that bounded strip.",
    {"B": "Ignores the second inequality.",
     "C": "Confuses OR (union) with AND (intersection).",
     "D": "Assumes OR always covers everything, but the complement is non-empty."},
    "Distinguish union from intersection of half-planes",
    ["confusing OR with AND", "assuming union is everything"],
))

# ═══════════════════════════════════════════════════
#  MCQ 36 – Parametric constraint: minimum k
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "For what values of k does the system x + y ≤ k and x − y ≤ k have a solution "
    "with x ≥ 3 and y ≥ 2?",
    ["k ≥ 5", "k ≥ 3", "k ≥ 1", "k ≥ 7"],
    "A",
    "Tightest point: (3,2). x+y = 5, x−y = 1. Need k ≥ max(5,1) = 5.",
    {"B": "Only checks x−y = 1, takes k ≥ 3 from the x-value.",
     "C": "Uses x−y = 1 only → k ≥ 1.",
     "D": "Adds x+y and x−y: 2x ≤ 2k → k ≥ 3, then adds y → k ≥ 7."},
    "Find minimum parameter value that keeps a feasible region non-empty",
    ["checking only one constraint", "adding constraints instead of taking max"],
))

# ═══════════════════════════════════════════════════
#  MCQ 37 – Counting bounded regions from three lines
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "Three lines x = 2, y = 3, and x + y = 7 divide the first quadrant (x > 0, y > 0) "
    "into several regions. How many bounded regions are formed?",
    ["3", "2", "4", "6"],
    "A",
    "Intersections in Q1: (2,3), (2,5), (4,3). These three points form a triangle "
    "— one bounded region. The axis-adjacent rectangles (0,0)-(2,0)-(2,3)-(0,3) and "
    "another region also close to form 3 bounded regions total.",
    {"B": "Counts only the central triangle + one adjacent region.",
     "C": "Includes unbounded regions in the count.",
     "D": "Uses the formula n(n+1)/2 + 1 without restricting to bounded regions."},
    "Visualise how lines partition a quadrant into bounded regions",
    ["counting unbounded regions as bounded", "misapplying region-counting formula"],
))

# ═══════════════════════════════════════════════════
#  MCQ 38 – Feasible region: which constraint is redundant?
# ═══════════════════════════════════════════════════
questions.append(mcq(
    "In the system x ≥ 0, y ≥ 0, x + y ≤ 6, and 2x + 2y ≤ 18, "
    "which constraint is redundant (does not affect the feasible region)?",
    ["2x + 2y ≤ 18", "x + y ≤ 6", "x ≥ 0", "y ≥ 0"],
    "A",
    "2x + 2y ≤ 18 simplifies to x + y ≤ 9. Since x + y ≤ 6 is tighter, "
    "x + y ≤ 9 is automatically satisfied and therefore redundant.",
    {"B": "x + y ≤ 6 is the binding constraint, not redundant.",
     "C": "x ≥ 0 restricts the region to the right half-plane — needed.",
     "D": "y ≥ 0 restricts to the upper half-plane — needed."},
    "Identify a redundant constraint by comparing tightness",
    ["confusing redundant with binding", "not simplifying before comparing"],
))

# ═══════════════════════════════════════════════════════
#  SPR  1 – Vertex x-coordinate
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "The feasible region defined by x ≥ 0, y ≥ 0, 2x + y ≤ 14, and x + 3y ≤ 15 "
    "has a vertex at the intersection of 2x + y = 14 and x + 3y = 15. "
    "What is the x-coordinate of this vertex?",
    "5.4", ["5.4", "27/5"],
    "y = 14 − 2x. Substitute: x + 3(14−2x) = 15 → x + 42 − 6x = 15 → "
    "−5x = −27 → x = 27/5 = 5.4.",
    "Solve a 2×2 system from constraint boundaries",
    ["substitution error", "fraction simplification"],
))

# ═══════════════════════════════════════════════════════
#  SPR  2 – Area of right triangle from intercepts
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "The region defined by x ≥ 0, y ≥ 0, and 3x + 4y ≤ 24 is a triangle. "
    "What is the area of this triangle?",
    "24", ["24"],
    "Vertices: (0,0), (8,0), (0,6). Area = (1/2)(8)(6) = 24.",
    "Compute area of right triangle from intercepts",
    ["forgetting 1/2", "swapping intercepts"],
))

# ═══════════════════════════════════════════════════════
#  SPR  3 – Integer solutions of absolute-value inequality
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "How many positive integer values of x satisfy |4x − 10| ≤ 6?",
    "4", ["4"],
    "|4x−10| ≤ 6 → −6 ≤ 4x−10 ≤ 6 → 4 ≤ 4x ≤ 16 → 1 ≤ x ≤ 4. "
    "Positive integers: 1, 2, 3, 4 → 4 values.",
    "Solve absolute-value inequality and count integer solutions",
    ["off-by-one at endpoints", "forgetting to check positivity"],
))

# ═══════════════════════════════════════════════════════
#  SPR  4 – Maximum of objective function
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "Given x ≥ 0, y ≥ 0, x + y ≤ 10, and 2x + y ≤ 16, "
    "what is the maximum value of P = 5x + 3y?",
    "42", ["42"],
    "Vertices: (0,0), (8,0), (6,4), (0,10). "
    "P(8,0) = 40, P(6,4) = 30+12 = 42, P(0,10) = 30. Maximum = 42.",
    "Evaluate objective at all vertices to find maximum",
    ["stopping at first large value", "missing vertex"],
))

# ═══════════════════════════════════════════════════════
#  SPR  5 – Largest integer in compound inequality
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "If −3 < (2x + 5)/3 ≤ 7, what is the largest integer value of x?",
    "8", ["8"],
    "Multiply by 3: −9 < 2x + 5 ≤ 21. Subtract 5: −14 < 2x ≤ 16. "
    "Divide by 2: −7 < x ≤ 8. Largest integer: 8.",
    "Solve compound inequality with rational expression",
    ["forgetting to flip inequality", "off-by-one at strict endpoint"],
))

# ═══════════════════════════════════════════════════════
#  SPR  6 – Distance from origin to boundary
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "The boundary line 3x + 4y = 24 is part of a feasible region. "
    "What is the perpendicular distance from the origin to this line?",
    "4.8", ["4.8", "24/5"],
    "Distance = |3(0)+4(0)−24| / √(9+16) = 24/5 = 4.8.",
    "Apply point-to-line distance formula",
    ["forgetting absolute value", "incorrect denominator"],
))

# ═══════════════════════════════════════════════════════
#  SPR  7 – Find parameter m from intersection
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "The boundary lines y = mx + 4 and y = 2x − 1 of a system of inequalities "
    "intersect at (2, 3). What is the value of m?",
    "-0.5", ["-0.5", "-1/2"],
    "Verify y = 2x−1 at (2,3): 2(2)−1 = 3 ✓. "
    "On y = mx+4: 3 = 2m+4 → 2m = −1 → m = −1/2.",
    "Find parameter from known intersection point",
    ["substituting into wrong equation", "sign error"],
))

# ═══════════════════════════════════════════════════════
#  SPR  8 – Max notebooks under budget + total constraints
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "A school buys notebooks ($3 each) and pens ($1 each). Budget ≤ $90 and "
    "total items ≥ 50. What is the maximum number of notebooks?",
    "20", ["20"],
    "3n + p ≤ 90, n + p ≥ 50. Maximise n → minimise p = 50 − n. "
    "3n + (50−n) ≤ 90 → 2n ≤ 40 → n ≤ 20.",
    "Maximise one variable subject to coupled budget and quantity constraints",
    ["ignoring minimum total", "incorrect substitution"],
))

# ═══════════════════════════════════════════════════════
#  SPR  9 – Perimeter of feasible triangle
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "The triangular region x ≥ 0, y ≥ 0, x + y ≤ 5 has what perimeter? "
    "Round to the nearest tenth.",
    "17.1", ["17.1"],
    "Sides: 5 (x-axis) + 5 (y-axis) + 5√2 (hypotenuse) ≈ 5+5+7.071 = 17.1.",
    "Calculate perimeter including hypotenuse of constraint triangle",
    ["forgetting hypotenuse", "not using distance formula"],
))

# ═══════════════════════════════════════════════════════
#  SPR 10 – Closest point on boundary to origin
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "On the boundary 3x + 4y = 18 (with x ≥ 0, y ≥ 0), "
    "what is x² + y² at the point closest to the origin?",
    "12.96", ["12.96", "324/25"],
    "Distance = 18/√(9+16) = 18/5 = 3.6. "
    "x² + y² = d² = 12.96.",
    "Find minimum x² + y² on a boundary line using distance formula",
    ["using wrong distance formula", "not squaring correctly"],
))

# ═══════════════════════════════════════════════════════
#  SPR 11 – Agricultural LP: max profit
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "A farmer grows wheat (w acres) and corn (c acres) on at most 100 acres. "
    "Wheat needs 2 workers/acre, corn needs 3; at most 240 workers. "
    "Profit: $200/acre wheat, $300/acre corn. Maximum total profit?",
    "24000", ["24000"],
    "Vertices: (0,0), (100,0), (60,40), (0,80). "
    "P(100,0) = 20000, P(60,40) = 12000+12000 = 24000, P(0,80) = 24000. "
    "Maximum = $24,000.",
    "Apply linear programming to agricultural optimisation",
    ["not checking all vertices", "miscomputing intersection"],
))

# ═══════════════════════════════════════════════════════
#  SPR 12 – Two absolute-value constraints
# ═══════════════════════════════════════════════════════
questions.append(spr(
    "How many integer values of x satisfy |x − 3| ≤ 7 AND |x + 2| > 4?",
    "8", ["8"],
    "|x−3| ≤ 7 → −4 ≤ x ≤ 10. |x+2| > 4 → x > 2 or x < −6. "
    "Intersection: x > 2 ∩ [−4,10] = {3,4,…,10} = 8 integers.",
    "Intersect solution sets of two absolute-value inequalities",
    ["union instead of intersection", "miscounting at boundary"],
))

# ═══════════════════════════════════════════════════════
#  VALIDATION
# ═══════════════════════════════════════════════════════
mcq_count = sum(1 for q in questions if q["type"] == "MCQ")
spr_count = sum(1 for q in questions if q["type"] == "SPR")
print(f"MCQ: {mcq_count}, SPR: {spr_count}, Total: {len(questions)}")
assert mcq_count == 38, f"Expected 38 MCQ, got {mcq_count}"
assert spr_count == 12, f"Expected 12 SPR, got {spr_count}"
assert len(questions) == 50, f"Expected 50, got {len(questions)}"

# validate structure
for q in questions:
    assert q["difficulty"] == "Hard"
    assert q["targetBand"] == "SAT-1600"
    assert q["domain"] == "Algebra"
    assert q["skill"] == "Linear inequalities in one or two variables"
    assert q["metadata"]["sourceSignalId"] == SIGNAL
    assert "cognitiveMove" in q["metadata"]
    assert "trapTypes" in q["metadata"]
    if q["type"] == "MCQ":
        assert len(q["choices"]) == 4
        assert all(c["letter"] in "ABCD" for c in q["choices"])
        dist_keys = set(q["explanation"]["distractors"].keys())
        expected = {"A","B","C","D"} - {q["correctAnswer"]}
        assert dist_keys == expected, f'{q["id"]}: distractors {dist_keys} != {expected}'
    else:
        assert "choices" not in q
        assert "acceptableAnswers" in q

print("✅ All structural validations passed.")

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"✅ Saved {len(questions)} questions to {OUT}")
