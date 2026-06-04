#!/usr/bin/env python3
"""
batch_A5.py – Generate 50 Hard SAT Math questions
Domain: Algebra
Skill: Linear inequalities in one or two variables
Focus: Context-rich inequality problems
"""

import json
import uuid
import os

SECTION = "Math"
DOMAIN = "Algebra"
SKILL = "Linear inequalities in one or two variables"
DIFFICULTY = "Hard"
TARGET_BAND = "SAT-1600"
SOURCE_SIGNAL = "antigravity-hard-algebra-ineq-context"

def uid():
    return f"antigravity-hard-{uuid.uuid4().hex[:8]}"

questions = []

# ────────────────────────────────────────────────────────────
# MCQ 1 – Budget constraint with two items
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A teacher has a budget of at most $120 to buy notebooks and pens for a class. "
        "Each notebook costs $4 and each pen costs $2. She must buy at least 10 notebooks "
        "and at least 15 pens. If n represents the number of notebooks and p represents "
        "the number of pens, which of the following systems of inequalities represents "
        "all the constraints?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "4n + 2p ≤ 120, n ≥ 10, p ≥ 15"},
        {"letter": "B", "text": "4n + 2p ≥ 120, n ≥ 10, p ≥ 15"},
        {"letter": "C", "text": "4n + 2p ≤ 120, n ≤ 10, p ≤ 15"},
        {"letter": "D", "text": "2n + 4p ≤ 120, n ≥ 10, p ≥ 15"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Fast path: 'at most $120' means total cost ≤ 120, so 4n + 2p ≤ 120. "
            "'At least 10 notebooks' → n ≥ 10, 'at least 15 pens' → p ≥ 15. "
            "Algebraic check: substitute n = 10, p = 15 → 4(10) + 2(15) = 70 ≤ 120 ✓, "
            "satisfies the minimum requirements."
        ),
        "distractors": {
            "B": "Direction error – reverses ≤ to ≥ for the budget, which would require spending AT LEAST $120 instead of at most.",
            "C": "Minimum/maximum confusion – uses ≤ for notebook and pen counts, meaning she buys at most 10 notebooks and 15 pens instead of at least.",
            "D": "Coefficient swap – assigns $2 to notebooks and $4 to pens, reversing the given unit prices."
        }
    },
    "metadata": {
        "cognitiveMove": "Translate verbal constraints into algebraic inequality system",
        "trapTypes": ["inequality direction reversal", "coefficient swap"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 2 – Graph → inequality identification
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A graph in the xy-plane shows a solid line passing through (0, 6) and (3, 0), "
        "with the region below and including the line shaded. Which inequality represents "
        "the shaded region?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "y ≤ −2x + 6"},
        {"letter": "B", "text": "y ≥ −2x + 6"},
        {"letter": "C", "text": "y < −2x + 6"},
        {"letter": "D", "text": "y ≤ 2x + 6"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Fast path: slope = (0 − 6)/(3 − 0) = −2, y-intercept = 6, so y = −2x + 6. "
            "Shaded BELOW → y ≤. Solid line → include equality (≤ not <). "
            "Verification: (0, 0) → 0 ≤ −2(0) + 6 = 6 ✓."
        ),
        "distractors": {
            "B": "Shade direction error – uses ≥ which represents the region ABOVE the line, opposite of the shaded region described.",
            "C": "Boundary inclusion error – uses strict < instead of ≤, ignoring the solid line that indicates equality is included.",
            "D": "Sign error on slope – uses +2x instead of −2x, producing a line through (0, 6) with positive slope that doesn't pass through (3, 0)."
        }
    },
    "metadata": {
        "cognitiveMove": "Convert graphical representation to algebraic inequality",
        "trapTypes": ["shade direction reversal", "strict vs non-strict boundary"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 3 – Time-limit scheduling constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A student has at most 5 hours to complete homework assignments. Math homework "
        "takes 45 minutes per assignment, and science homework takes 30 minutes per "
        "assignment. If m is the number of math assignments and s is the number of science "
        "assignments, the student must complete at least 2 math assignments and at least "
        "3 science assignments. What is the maximum number of math assignments the student "
        "can complete?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "4"},
        {"letter": "B", "text": "5"},
        {"letter": "C", "text": "6"},
        {"letter": "D", "text": "3"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Convert to minutes: 5 hours = 300 minutes. Constraint: 45m + 30s ≤ 300. "
            "To maximize m, minimize s at its lower bound s = 3. Then 45m + 30(3) ≤ 300 → "
            "45m + 90 ≤ 300 → 45m ≤ 210 → m ≤ 4.67. Since m must be a whole number, "
            "m = 4. Check: 45(4) + 30(3) = 180 + 90 = 270 ≤ 300 ✓."
        ),
        "distractors": {
            "B": "Rounding error – rounds 4.67 up to 5 instead of down, violating the time constraint: 45(5) + 30(3) = 315 > 300.",
            "C": "Ignored science minimum – neglects the s ≥ 3 constraint and solves 45m ≤ 300 → m ≤ 6.67 → m = 6.",
            "D": "Premature stop – confuses the minimum requirement (m ≥ 2) neighborhood and picks 3 without maximizing."
        }
    },
    "metadata": {
        "cognitiveMove": "Optimize one variable under multiple inequality constraints",
        "trapTypes": ["rounding direction error", "ignoring constraint"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 4 – Capacity constraint interpretation
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A freight elevator has a maximum capacity of 2,000 pounds. Boxes of type A weigh "
        "50 pounds each and boxes of type B weigh 80 pounds each. If a ≥ 5 and b ≥ 3, "
        "and 50a + 80b ≤ 2000, which of the following describes the maximum number of "
        "type B boxes that can be loaded?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "21"},
        {"letter": "B", "text": "22"},
        {"letter": "C", "text": "25"},
        {"letter": "D", "text": "18"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "To maximize b, minimize a at its lower bound: a = 5. "
            "50(5) + 80b ≤ 2000 → 250 + 80b ≤ 2000 → 80b ≤ 1750 → b ≤ 21.875. "
            "Since b must be a whole number, b ≤ 21. Check: 50(5) + 80(21) = 250 + 1680 = 1930 ≤ 2000 ✓."
        ),
        "distractors": {
            "B": "Rounding error – rounds 21.875 up to 22; 50(5) + 80(22) = 250 + 1760 = 2010 > 2000, exceeding capacity.",
            "C": "Ignoring constraint on a – solves 80b ≤ 2000 → b ≤ 25, forgetting the required minimum of 5 type A boxes.",
            "D": "Arithmetic error – incorrectly computes 50(5) = 300 instead of 250, then 80b ≤ 1700 → b ≤ 21.25 → rounds differently to 18."
        }
    },
    "metadata": {
        "cognitiveMove": "Maximize one variable while respecting multiple constraints",
        "trapTypes": ["rounding direction error", "ignoring constraint"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 5 – Interpreting solution meaning in context
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A bakery sells cupcakes for $3 each and cookies for $2 each. The bakery needs "
        "to earn more than $150 per day. If c represents the number of cupcakes and k "
        "represents the number of cookies sold, the inequality 3c + 2k > 150 models "
        "the situation. If the bakery sells exactly 30 cupcakes, what does the solution "
        "k > 15 mean in this context?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "The bakery must sell more than 15 cookies to meet its daily revenue goal."},
        {"letter": "B", "text": "The bakery must sell at least 15 cookies to meet its daily revenue goal."},
        {"letter": "C", "text": "The bakery earns $15 from cookie sales."},
        {"letter": "D", "text": "The bakery can sell at most 15 cookies."}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Substituting c = 30: 3(30) + 2k > 150 → 90 + 2k > 150 → 2k > 60 → k > 15. "
            "Since the inequality is strict (>), the bakery must sell MORE than 15 cookies, "
            "meaning 16 or more. This ensures revenue exceeds $150."
        ),
        "distractors": {
            "B": "Strict vs non-strict confusion – 'at least 15' means k ≥ 15, but the inequality is k > 15 (strictly more than 15).",
            "C": "Variable misinterpretation – confuses the solution value 15 with a dollar amount; 15 is the number of cookies, not revenue.",
            "D": "Direction reversal – interprets k > 15 as k ≤ 15, completely reversing the inequality direction."
        }
    },
    "metadata": {
        "cognitiveMove": "Interpret algebraic inequality solution in real-world context",
        "trapTypes": ["strict vs non-strict boundary", "inequality direction reversal"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 6 – Multi-step inequality chain
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A company pays its employees between $12 and $20 per hour, inclusive. An employee "
        "works between 25 and 40 hours per week, inclusive. If the company deducts 15% of "
        "the gross pay for taxes, which inequality represents the range of the employee's "
        "weekly take-home pay, t, in dollars?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "255 ≤ t ≤ 680"},
        {"letter": "B", "text": "300 ≤ t ≤ 800"},
        {"letter": "C", "text": "255 ≤ t ≤ 800"},
        {"letter": "D", "text": "45 ≤ t ≤ 120"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Minimum gross = 12 × 25 = $300. Maximum gross = 20 × 40 = $800. "
            "After 15% deduction, take-home = 85% of gross. "
            "Min take-home = 0.85 × 300 = $255. Max take-home = 0.85 × 800 = $680. "
            "So 255 ≤ t ≤ 680."
        ),
        "distractors": {
            "B": "Tax deduction omission – uses the gross pay range $300 to $800 without applying the 15% tax deduction.",
            "C": "Partial application – applies the 15% deduction only to the minimum (255) but not the maximum (800), mixing gross and net values.",
            "D": "Computed tax amount instead – calculates the TAX amount (15% of gross) rather than take-home pay: 0.15 × 300 = 45, 0.15 × 800 = 120."
        }
    },
    "metadata": {
        "cognitiveMove": "Chain multiply ranges and apply percentage reduction",
        "trapTypes": ["partial computation", "tax vs take-home confusion"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 7 – Inequality ↔ graph identification
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "The system of inequalities y ≥ (1/2)x − 1 and y ≤ −x + 5 is graphed in "
        "the xy-plane. A solution to the system is a point in the region where the "
        "shading overlaps. Which of the following points is in the solution region?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "(2, 2)"},
        {"letter": "B", "text": "(6, 1)"},
        {"letter": "C", "text": "(0, −3)"},
        {"letter": "D", "text": "(8, 0)"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Test (2, 2): y ≥ (1/2)(2) − 1 → 2 ≥ 0 ✓; y ≤ −2 + 5 → 2 ≤ 3 ✓. "
            "Both satisfied. Quick check: the intersection region is bounded and (2, 2) "
            "sits between the two lines."
        ),
        "distractors": {
            "B": "Fails second inequality – (6, 1): y ≤ −6 + 5 = −1, but 1 > −1 ✗. Point is above the second line.",
            "C": "Fails first inequality – (0, −3): y ≥ (1/2)(0) − 1 = −1, but −3 < −1 ✗. Point is below the first line.",
            "D": "Fails both inequalities – (8, 0): y ≥ (1/2)(8) − 1 = 3, but 0 < 3 ✗; y ≤ −8 + 5 = −3, but 0 > −3 ✗."
        }
    },
    "metadata": {
        "cognitiveMove": "Test points against a system of linear inequalities",
        "trapTypes": ["partial satisfaction", "boundary misidentification"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 8 – Profit constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A small business sells handmade candles for $18 each and soaps for $8 each. "
        "The monthly fixed costs are $500. The owner wants the monthly profit to be at "
        "least $1,300. If c is the number of candles and s is the number of soaps sold "
        "per month, which inequality represents this situation?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "18c + 8s − 500 ≥ 1300"},
        {"letter": "B", "text": "18c + 8s ≥ 1300"},
        {"letter": "C", "text": "18c + 8s + 500 ≥ 1300"},
        {"letter": "D", "text": "18c + 8s − 500 ≤ 1300"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Revenue = 18c + 8s. Profit = Revenue − Fixed Costs = 18c + 8s − 500. "
            "Owner wants profit ≥ 1300, so 18c + 8s − 500 ≥ 1300. "
            "Equivalently, 18c + 8s ≥ 1800."
        ),
        "distractors": {
            "B": "Ignores fixed costs – omits the $500 fixed cost entirely, treating revenue as profit.",
            "C": "Adds instead of subtracts – adds 500 to revenue instead of subtracting, getting costs backwards.",
            "D": "Direction error – uses ≤ instead of ≥, which would cap profit at $1,300 rather than requiring at least $1,300."
        }
    },
    "metadata": {
        "cognitiveMove": "Construct profit inequality from revenue minus cost",
        "trapTypes": ["omitting fixed cost", "inequality direction reversal"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 9 – Mixture / concentration constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A chemist mixes x liters of a 30% acid solution with y liters of a 60% acid "
        "solution. The final mixture must be at least 20 liters and have an acid "
        "concentration of no more than 50%. Which system of inequalities models "
        "these constraints?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "x + y ≥ 20 and 0.3x + 0.6y ≤ 0.5(x + y)"},
        {"letter": "B", "text": "x + y ≥ 20 and 0.3x + 0.6y ≥ 0.5(x + y)"},
        {"letter": "C", "text": "x + y ≤ 20 and 0.3x + 0.6y ≤ 0.5(x + y)"},
        {"letter": "D", "text": "x + y ≥ 20 and 0.3x + 0.6y ≤ 0.5x"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "'At least 20 liters' → x + y ≥ 20. 'No more than 50%' means acid amount ≤ 50% of total: "
            "0.3x + 0.6y ≤ 0.5(x + y). Simplifying: 0.3x + 0.6y ≤ 0.5x + 0.5y → 0.1y ≤ 0.2x → y ≤ 2x."
        ),
        "distractors": {
            "B": "Concentration direction error – uses ≥ for concentration, which means at LEAST 50% concentration, opposite of 'no more than.'",
            "C": "Volume direction error – uses x + y ≤ 20, meaning at most 20 liters instead of at least.",
            "D": "Denominator error – compares acid to 0.5x instead of 0.5(x + y), using only the first solution's volume as the base."
        }
    },
    "metadata": {
        "cognitiveMove": "Translate mixture concentration constraint into algebraic inequality",
        "trapTypes": ["inequality direction reversal", "denominator error in concentration"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 10 – Range of values under constraints
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A parking garage charges $5 for the first hour and $3 for each additional hour. "
        "A customer has at most $20 to spend. If h represents the total number of hours "
        "parked (h ≥ 1), what is the maximum number of whole hours the customer can park?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "6"},
        {"letter": "B", "text": "5"},
        {"letter": "C", "text": "7"},
        {"letter": "D", "text": "4"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Cost = 5 + 3(h − 1) for h ≥ 1. Constraint: 5 + 3(h − 1) ≤ 20 → "
            "5 + 3h − 3 ≤ 20 → 3h + 2 ≤ 20 → 3h ≤ 18 → h ≤ 6. "
            "Maximum whole hours = 6. Cost check: 5 + 3(5) = 5 + 15 = $20 ✓."
        ),
        "distractors": {
            "B": "Off-by-one error – treats h as additional hours only (not total), solving 5 + 3h ≤ 20 → h ≤ 5, forgetting h includes the first hour.",
            "C": "Rounding up – gets h ≤ 6 but adds 1 thinking the first hour is separate from the count, yielding 7.",
            "D": "Double-counting the first hour charge – sets up 5 + 3h ≤ 20 and then subtracts 1, getting h = 4."
        }
    },
    "metadata": {
        "cognitiveMove": "Model piecewise pricing as linear inequality and solve for integer bound",
        "trapTypes": ["off-by-one error", "variable definition confusion"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 11 – Reverse graph identification
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "Which of the following describes the graph of the solution set of "
        "the system y > 2x − 4 and y < −x + 5?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "The region above the dashed line y = 2x − 4 and below the dashed line y = −x + 5"},
        {"letter": "B", "text": "The region below the dashed line y = 2x − 4 and above the dashed line y = −x + 5"},
        {"letter": "C", "text": "The region above the solid line y = 2x − 4 and below the solid line y = −x + 5"},
        {"letter": "D", "text": "The region above the dashed line y = 2x − 4 and above the dashed line y = −x + 5"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "y > 2x − 4 → shade ABOVE y = 2x − 4 (dashed because strict >). "
            "y < −x + 5 → shade BELOW y = −x + 5 (dashed because strict <). "
            "The solution is the overlap: above the first dashed line and below the second dashed line."
        ),
        "distractors": {
            "B": "Both directions reversed – shades below the first line and above the second, which is the complement of the solution region.",
            "C": "Boundary type error – uses solid lines instead of dashed; strict inequalities (> and <) require dashed boundary lines.",
            "D": "Second shade direction error – correctly identifies 'above' for the first but also shades above the second, when y < means below."
        }
    },
    "metadata": {
        "cognitiveMove": "Convert algebraic inequality system to graphical description",
        "trapTypes": ["shade direction reversal", "dashed vs solid boundary confusion"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 12 – Production constraint with labor
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A factory produces tables and chairs. Each table requires 3 hours of labor and "
        "each chair requires 1.5 hours. The factory has at most 90 hours of labor available "
        "per day. Each table uses 20 board-feet of lumber and each chair uses 8 board-feet. "
        "The factory has at most 600 board-feet of lumber per day. If t ≥ 0 and c ≥ 0, "
        "which point (t, c) is in the feasible region and maximizes the total number of "
        "items produced (t + c)?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "(0, 60)"},
        {"letter": "B", "text": "(30, 0)"},
        {"letter": "C", "text": "(15, 30)"},
        {"letter": "D", "text": "(10, 50)"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Check (0, 60): Labor: 3(0) + 1.5(60) = 90 ≤ 90 ✓. Lumber: 20(0) + 8(60) = 480 ≤ 600 ✓. "
            "Total items = 0 + 60 = 60. "
            "Check others: (30, 0) → t + c = 30. (15, 30) → labor = 45 + 45 = 90 ✓, lumber = 300 + 240 = 540 ✓, total = 45. "
            "(10, 50) → labor = 30 + 75 = 105 > 90 ✗. So (0, 60) maximizes total items."
        ),
        "distractors": {
            "B": "Maximizes tables only – produces only 30 tables with 0 chairs, totaling only 30 items.",
            "C": "Balanced but suboptimal – produces 45 items total, feasible but fewer than 60.",
            "D": "Infeasible – labor = 3(10) + 1.5(50) = 30 + 75 = 105, which exceeds the 90-hour limit."
        }
    },
    "metadata": {
        "cognitiveMove": "Identify feasible region vertex that maximizes objective under multiple constraints",
        "trapTypes": ["infeasible point trap", "suboptimal feasible point"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 13 – Compound inequality from word problem
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "The temperature T, in degrees Fahrenheit, in a greenhouse must be kept between "
        "60°F and 85°F, inclusive. The relationship between Fahrenheit and Celsius is "
        "T = (9/5)C + 32. Which compound inequality represents the acceptable range "
        "of temperatures in Celsius?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "140/9 ≤ C ≤ 265/9"},
        {"letter": "B", "text": "60 ≤ C ≤ 85"},
        {"letter": "C", "text": "28 ≤ C ≤ 53"},
        {"letter": "D", "text": "15 ≤ C ≤ 30"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "60 ≤ (9/5)C + 32 ≤ 85. Subtract 32: 28 ≤ (9/5)C ≤ 53. "
            "Multiply by 5/9: 140/9 ≤ C ≤ 265/9. "
            "As decimals: 15.56 ≤ C ≤ 29.44."
        ),
        "distractors": {
            "B": "No conversion performed – simply uses the Fahrenheit values as Celsius values.",
            "C": "Incomplete conversion – subtracts 32 but forgets to multiply by 5/9, giving 28 ≤ C ≤ 53.",
            "D": "Approximation with wrong rounding – rounds 15.56 down to 15 and 29.44 up to 30, altering the inequality bounds."
        }
    },
    "metadata": {
        "cognitiveMove": "Apply unit conversion within compound inequality",
        "trapTypes": ["incomplete conversion", "no conversion at all"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 14 – Shipping cost constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "An online store charges a flat shipping fee of $7 plus $0.50 per pound for each "
        "package. A customer wants to keep the total shipping cost under $25. If w "
        "represents the weight of the package in pounds, which inequality models the "
        "situation, and what is the maximum whole-number weight the customer can ship?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "7 + 0.5w < 25; maximum weight is 35 pounds"},
        {"letter": "B", "text": "7 + 0.5w ≤ 25; maximum weight is 36 pounds"},
        {"letter": "C", "text": "7 + 0.5w < 25; maximum weight is 36 pounds"},
        {"letter": "D", "text": "0.5w < 25; maximum weight is 49 pounds"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "'Under $25' means strictly less than: 7 + 0.5w < 25. "
            "Solve: 0.5w < 18 → w < 36. The maximum whole number less than 36 is 35. "
            "Check: 7 + 0.5(35) = 7 + 17.5 = 24.50 < 25 ✓."
        ),
        "distractors": {
            "B": "Strict vs non-strict error – uses ≤ instead of <, and picks w = 36 which gives 7 + 18 = 25, not under 25.",
            "C": "Correct inequality but wrong max – states w < 36 correctly but reports 36 as the max; 36 doesn't satisfy w < 36.",
            "D": "Omits flat fee – ignores the $7 flat fee, solving 0.5w < 25 → w < 50 → max 49."
        }
    },
    "metadata": {
        "cognitiveMove": "Translate 'under' as strict inequality and solve for integer bound",
        "trapTypes": ["strict vs non-strict boundary", "omitting constant term"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 15 – Speed and distance constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A delivery driver must complete a 180-mile route in no more than 4 hours. "
        "Due to traffic, the driver averages 35 miles per hour for the first portion of "
        "the trip. If d represents the distance (in miles) driven at 35 mph, and the "
        "remaining distance is driven at 55 mph, which inequality ensures the driver "
        "completes the route on time?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "d/35 + (180 − d)/55 ≤ 4"},
        {"letter": "B", "text": "d/35 + (180 − d)/55 ≥ 4"},
        {"letter": "C", "text": "35d + 55(180 − d) ≤ 4"},
        {"letter": "D", "text": "d/35 + d/55 ≤ 4"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Time = distance / speed. First portion: d/35 hours. Remaining: (180 − d)/55 hours. "
            "Total time must be ≤ 4 hours: d/35 + (180 − d)/55 ≤ 4. "
            "This correctly models the time constraint for two segments at different speeds."
        ),
        "distractors": {
            "B": "Direction error – uses ≥ 4 which means the trip takes at LEAST 4 hours, opposite of 'no more than.'",
            "C": "Formula inversion – multiplies speed × distance instead of dividing distance by speed for time.",
            "D": "Remainder error – uses d/55 for the second portion instead of (180 − d)/55, not accounting for the remaining distance."
        }
    },
    "metadata": {
        "cognitiveMove": "Model two-segment travel time as inequality using distance/speed",
        "trapTypes": ["rate formula inversion", "remainder distance error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 16 – Revenue vs cost break-even
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A food truck has fixed daily costs of $200 and variable costs of $3 per meal. "
        "Each meal is sold for $8. For the food truck to make a profit on a given day, "
        "the number of meals sold, m, must satisfy which inequality?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "m > 40"},
        {"letter": "B", "text": "m ≥ 40"},
        {"letter": "C", "text": "m > 25"},
        {"letter": "D", "text": "m ≥ 67"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Profit > 0 means Revenue > Total Cost: 8m > 200 + 3m → 5m > 200 → m > 40. "
            "At m = 40, profit = 8(40) − (200 + 3(40)) = 320 − 320 = 0, which is break-even, not profit. "
            "So m must be strictly greater than 40."
        ),
        "distractors": {
            "B": "Break-even included – m ≥ 40 includes m = 40 where profit = 0, but the question asks for profit (> 0).",
            "C": "Omits variable cost – solves 8m > 200 → m > 25, ignoring the $3-per-meal variable cost.",
            "D": "Wrong operation – divides total cost at some point incorrectly, e.g., 200/3 ≈ 67."
        }
    },
    "metadata": {
        "cognitiveMove": "Set up profit inequality (revenue > total cost) and solve",
        "trapTypes": ["break-even vs profit", "omitting variable cost"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 17 – Weighted average constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A student's grade is based on tests (70% weight) and homework (30% weight). "
        "The student has a test average of 78. What is the minimum homework average h "
        "the student needs to achieve an overall grade of at least 80?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "h ≥ 268/3"},
        {"letter": "B", "text": "h ≥ 80"},
        {"letter": "C", "text": "h ≥ 82"},
        {"letter": "D", "text": "h ≥ 85"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Weighted average: 0.70(78) + 0.30h ≥ 80 → 54.6 + 0.30h ≥ 80 → "
            "0.30h ≥ 25.4 → h ≥ 25.4/0.30 = 254/3 = 84.67 (wait, let me recalculate). "
            "Actually: 0.70(78) = 54.6. 80 − 54.6 = 25.4. h ≥ 25.4/0.30 = 84.67. "
            "But as a fraction: 0.7(78) = 546/10. 0.3h ≥ 80 − 546/10 = 254/10. "
            "h ≥ 254/3 ≈ 84.67. The exact answer is 254/3."
        ),
        "distractors": {
            "B": "Ignores weighting – assumes the homework average simply needs to equal the target grade of 80.",
            "C": "Arithmetic error – incorrectly computes 0.7 × 78 = 55.6 instead of 54.6, then gets h ≥ 81.33 → rounds to 82.",
            "D": "Wrong weight assignment – swaps weights, using 30% for tests and 70% for homework, getting a different result."
        }
    },
    "metadata": {
        "cognitiveMove": "Solve weighted average inequality for one unknown component",
        "trapTypes": ["ignoring weights", "arithmetic error in decimals"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# Fix MCQ 17 - recalculate correctly
# 0.70(78) + 0.30h >= 80
# 54.6 + 0.30h >= 80
# 0.30h >= 25.4
# h >= 254/3 ≈ 84.666...
# Let me fix the explanation
questions[-1]["explanation"]["correct"] = (
    "Weighted average: 0.70(78) + 0.30h ≥ 80 → 54.6 + 0.30h ≥ 80 → "
    "0.30h ≥ 25.4 → h ≥ 254/3 ≈ 84.67. "
    "As a fraction: 0.7 × 78 = 54.6. Need 0.3h ≥ 80 − 54.6 = 25.4. "
    "h ≥ 25.4/0.3 = 254/3."
)
questions[-1]["choices"][0]["text"] = "h ≥ 254/3"

# ────────────────────────────────────────────────────────────
# MCQ 18 – Number line interpretation
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A number line shows a closed circle at −3 and an open circle at 7, with the "
        "region between them shaded. Which inequality represents this graph?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "−3 ≤ x < 7"},
        {"letter": "B", "text": "−3 < x ≤ 7"},
        {"letter": "C", "text": "−3 ≤ x ≤ 7"},
        {"letter": "D", "text": "−3 < x < 7"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Closed circle at −3 means the endpoint IS included → ≤ at −3. "
            "Open circle at 7 means the endpoint is NOT included → < at 7. "
            "So −3 ≤ x < 7."
        ),
        "distractors": {
            "B": "Circle type swap – reverses which endpoint is open and closed, using < at −3 and ≤ at 7.",
            "C": "Both closed – treats both circles as closed (filled), using ≤ for both endpoints.",
            "D": "Both open – treats both circles as open (unfilled), using < for both endpoints."
        }
    },
    "metadata": {
        "cognitiveMove": "Read number line notation (open/closed circles) and convert to compound inequality",
        "trapTypes": ["open vs closed circle confusion", "endpoint inclusion error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 19 – Water tank capacity
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A water tank currently holds 150 gallons and is being filled at a rate of "
        "8 gallons per minute. The tank's maximum capacity is 500 gallons. At the same "
        "time, a drain removes water at 3 gallons per minute. Which inequality can be "
        "used to find the number of minutes, t, until the tank is full, and what is "
        "the solution?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "150 + 5t ≤ 500; t ≤ 70"},
        {"letter": "B", "text": "150 + 8t ≤ 500; t ≤ 43.75"},
        {"letter": "C", "text": "150 + 11t ≤ 500; t ≤ 31.8"},
        {"letter": "D", "text": "150 + 5t ≥ 500; t ≥ 70"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Net fill rate = 8 − 3 = 5 gallons per minute. Water level at time t: 150 + 5t. "
            "Must not exceed capacity: 150 + 5t ≤ 500 → 5t ≤ 350 → t ≤ 70 minutes."
        ),
        "distractors": {
            "B": "Ignores drain – uses 8 gal/min without subtracting the 3 gal/min drain rate.",
            "C": "Adds rates instead of subtracting – uses 8 + 3 = 11 gal/min net rate, as if both sources add water.",
            "D": "Direction error – uses ≥ which would find when the tank has at least 500 gallons, and the direction is backwards."
        }
    },
    "metadata": {
        "cognitiveMove": "Compute net rate in fill/drain problem and apply to capacity constraint",
        "trapTypes": ["ignoring drain rate", "adding instead of subtracting rates"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 20 – Event ticket pricing
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A theater sells adult tickets for $12 and child tickets for $7. The theater "
        "has 200 seats and wants to earn at least $1,800 from a sold-out show. If a "
        "represents the number of adult tickets, which inequality gives the minimum "
        "number of adult tickets that must be sold?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "a ≥ 80"},
        {"letter": "B", "text": "a ≥ 120"},
        {"letter": "C", "text": "a ≥ 90"},
        {"letter": "D", "text": "a ≥ 72"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Sold out: a + c = 200, so c = 200 − a. Revenue: 12a + 7(200 − a) ≥ 1800 → "
            "12a + 1400 − 7a ≥ 1800 → 5a ≥ 400 → a ≥ 80."
        ),
        "distractors": {
            "B": "Forgot to substitute – tries to solve 12a ≥ 1800 without accounting for child ticket revenue at all, getting a ≥ 150, then adjusts incorrectly to 120.",
            "C": "Arithmetic error – computes 7 × 200 = 1300 instead of 1400, then 5a ≥ 500 → a ≥ 100, approximately 90.",
            "D": "Uses total instead of difference – divides 1800/25 or makes an error in combining the ticket prices."
        }
    },
    "metadata": {
        "cognitiveMove": "Substitute capacity constraint into revenue inequality to solve for one variable",
        "trapTypes": ["failing to substitute", "arithmetic error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 21 – Fundraiser goal
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A school fundraiser sells candy bars for $2 each and gift baskets for $15 each. "
        "The school has 300 candy bars and 50 gift baskets available. The school wants to "
        "raise more than $1,000. If x candy bars and y gift baskets are sold, which system "
        "of inequalities models the constraints?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "2x + 15y > 1000, 0 ≤ x ≤ 300, 0 ≤ y ≤ 50"},
        {"letter": "B", "text": "2x + 15y ≥ 1000, x ≥ 300, y ≥ 50"},
        {"letter": "C", "text": "2x + 15y > 1000, x ≥ 0, y ≥ 0"},
        {"letter": "D", "text": "15x + 2y > 1000, 0 ≤ x ≤ 300, 0 ≤ y ≤ 50"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "'More than $1,000' → strict inequality: 2x + 15y > 1000. "
            "Inventory limits: 0 ≤ x ≤ 300 (can't sell more candy bars than available) "
            "and 0 ≤ y ≤ 50 (can't sell more gift baskets than available)."
        ),
        "distractors": {
            "B": "Inventory direction error – uses x ≥ 300 and y ≥ 50, meaning the school must sell all inventory or more, which is impossible to exceed.",
            "C": "Missing upper bounds – omits the inventory limits (300 and 50), which are essential constraints.",
            "D": "Coefficient swap – assigns $15 to candy bars and $2 to gift baskets, reversing the given prices."
        }
    },
    "metadata": {
        "cognitiveMove": "Model multiple real-world constraints including inventory limits",
        "trapTypes": ["coefficient swap", "missing inventory constraints"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 22 – Distance/time constraint for travel
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A cyclist and a jogger start from the same point and travel in the same direction. "
        "The cyclist travels at 15 miles per hour and the jogger at 6 miles per hour. After "
        "how many hours, h, will the cyclist be more than 36 miles ahead of the jogger?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "h > 4"},
        {"letter": "B", "text": "h ≥ 4"},
        {"letter": "C", "text": "h > 2.4"},
        {"letter": "D", "text": "h > 36"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Distance between them after h hours: 15h − 6h = 9h. "
            "Need 9h > 36 → h > 4. After exactly 4 hours, the gap is 36 miles (not MORE than 36). "
            "So h must be strictly greater than 4."
        ),
        "distractors": {
            "B": "Strict vs non-strict – h ≥ 4 includes h = 4 where the gap is exactly 36, not MORE than 36.",
            "C": "Uses wrong rate – might have computed 36/15 = 2.4, using only the cyclist's speed instead of the rate difference.",
            "D": "Confuses distance with time – sets h > 36, treating the distance value as a time value."
        }
    },
    "metadata": {
        "cognitiveMove": "Model relative speed gap as inequality and solve",
        "trapTypes": ["strict vs non-strict boundary", "using single speed instead of difference"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 23 – Exam score needed
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A student has scored 72, 85, and 68 on three tests. Each test is worth 100 points. "
        "To earn a B in the course, the student's average across all four tests must be at "
        "least 75. What is the minimum score the student needs on the fourth test?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "75"},
        {"letter": "B", "text": "80"},
        {"letter": "C", "text": "73"},
        {"letter": "D", "text": "78"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Average ≥ 75: (72 + 85 + 68 + x)/4 ≥ 75 → (225 + x)/4 ≥ 75 → "
            "225 + x ≥ 300 → x ≥ 75. Minimum score = 75."
        ),
        "distractors": {
            "B": "Overcompensation error – thinks the student needs to 'make up' for low scores by scoring significantly above 75.",
            "C": "Averages the three scores (225/3 = 75) and assumes matching this average minus adjustment is enough.",
            "D": "Arithmetic error – miscalculates 72 + 85 + 68 as 222 instead of 225, then x ≥ 78."
        }
    },
    "metadata": {
        "cognitiveMove": "Set up average inequality and solve for the unknown score",
        "trapTypes": ["arithmetic error in sum", "overcompensation intuition"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 24 – Two-variable graph: identify system from intercepts
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "In the xy-plane, a shaded region is bounded by two solid lines. Line 1 passes "
        "through (0, 8) and (4, 0). Line 2 passes through (0, 0) and (6, 3). The shaded "
        "region is below Line 1 and above Line 2. Which system represents the shaded region?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "y ≤ −2x + 8 and y ≥ (1/2)x"},
        {"letter": "B", "text": "y ≥ −2x + 8 and y ≤ (1/2)x"},
        {"letter": "C", "text": "y ≤ −2x + 8 and y ≤ (1/2)x"},
        {"letter": "D", "text": "y ≤ 2x + 8 and y ≥ (1/2)x"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Line 1: slope = (0 − 8)/(4 − 0) = −2, y-intercept = 8 → y = −2x + 8. Below → y ≤. "
            "Line 2: slope = (3 − 0)/(6 − 0) = 1/2, through origin → y = (1/2)x. Above → y ≥. "
            "System: y ≤ −2x + 8 and y ≥ (1/2)x."
        ),
        "distractors": {
            "B": "Both directions reversed – shades above Line 1 and below Line 2, the complement region.",
            "C": "Same direction for both – shades below both lines, which doesn't create the described enclosed region.",
            "D": "Slope sign error – uses +2x instead of −2x for Line 1, which would pass through (0, 8) with a positive slope."
        }
    },
    "metadata": {
        "cognitiveMove": "Determine line equations from intercepts and assign correct inequality direction",
        "trapTypes": ["shade direction reversal", "slope sign error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 25 – Manufacturing constraint with waste
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A factory produces widgets and gadgets. Each widget produces 2 kg of waste and "
        "each gadget produces 5 kg of waste. Environmental regulations require that total "
        "daily waste not exceed 200 kg. The factory must produce at least 10 widgets and "
        "at least 8 gadgets per day. What is the maximum number of gadgets the factory "
        "can produce per day?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "36"},
        {"letter": "B", "text": "40"},
        {"letter": "C", "text": "38"},
        {"letter": "D", "text": "32"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Minimize widgets at w = 10. Waste constraint: 2(10) + 5g ≤ 200 → "
            "20 + 5g ≤ 200 → 5g ≤ 180 → g ≤ 36. Maximum gadgets = 36. "
            "Check: 2(10) + 5(36) = 20 + 180 = 200 ≤ 200 ✓."
        ),
        "distractors": {
            "B": "Ignores widget minimum – solves 5g ≤ 200 → g ≤ 40, forgetting the required 10 widgets.",
            "C": "Arithmetic error – miscalculates 2 × 10 = 30 instead of 20, giving 5g ≤ 170 → g ≤ 34, then adjusts incorrectly to 38.",
            "D": "Uses wrong waste rate – swaps rates (5 kg for widgets, 2 kg for gadgets), then 5(10) + 2g ≤ 200 → 2g ≤ 150 → g ≤ 75, but then caps differently to 32."
        }
    },
    "metadata": {
        "cognitiveMove": "Maximize one variable by minimizing the other at its constraint bound",
        "trapTypes": ["ignoring constraint", "coefficient swap"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 26 – Reading inequality from table of values
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "The table below shows the cost C (in dollars) of renting a kayak for h hours:\n"
        "h: 1, 2, 3, 4, 5\n"
        "C: 25, 40, 55, 70, 85\n"
        "A customer has $100 to spend. Based on the pattern, which inequality represents "
        "the cost, and what is the maximum number of whole hours the customer can rent?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "C = 15h + 10; maximum 6 hours"},
        {"letter": "B", "text": "C = 15h + 10; maximum 5 hours"},
        {"letter": "C", "text": "C = 25h; maximum 4 hours"},
        {"letter": "D", "text": "C = 15h + 25; maximum 5 hours"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Pattern: each additional hour costs $15 (40 − 25 = 15). "
            "C = 15h + b. At h = 1: 25 = 15(1) + b → b = 10. So C = 15h + 10. "
            "Set C ≤ 100: 15h + 10 ≤ 100 → 15h ≤ 90 → h ≤ 6. Maximum = 6 hours. "
            "Verify: 15(6) + 10 = 100 ≤ 100 ✓."
        ),
        "distractors": {
            "B": "Correct formula, wrong max – finds C = 15h + 10 correctly but stops at h = 5 from the table without solving the inequality.",
            "C": "Wrong formula – uses C = 25h (the rate for the first hour applied to all hours), then 25h ≤ 100 → h ≤ 4.",
            "D": "Wrong intercept – uses the first cost value as the base: C = 15h + 25, then 15h + 25 ≤ 100 → h ≤ 5."
        }
    },
    "metadata": {
        "cognitiveMove": "Extract linear pattern from table and solve inequality",
        "trapTypes": ["stopping at table boundary", "wrong intercept extraction"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 27 – Investment return constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "An investor has $10,000 to allocate between two funds. Fund A returns 4% annually "
        "and Fund B returns 7% annually. The investor wants the total annual return to be "
        "at least $550. If x dollars are invested in Fund A, which inequality models the "
        "situation, and what is the maximum amount that can be invested in Fund A?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "0.04x + 0.07(10000 − x) ≥ 550; x ≤ 5000"},
        {"letter": "B", "text": "0.04x + 0.07(10000 − x) ≥ 550; x ≤ 6000"},
        {"letter": "C", "text": "0.04x + 0.07x ≥ 550; x ≤ 5000"},
        {"letter": "D", "text": "0.04x + 0.07(10000 − x) ≤ 550; x ≤ 5000"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Fund B gets the remainder: 10000 − x. Total return: 0.04x + 0.07(10000 − x) ≥ 550. "
            "Expand: 0.04x + 700 − 0.07x ≥ 550 → −0.03x ≥ −150 → x ≤ 5000. "
            "Maximum in Fund A = $5,000."
        ),
        "distractors": {
            "B": "Arithmetic error – incorrectly computes −150/−0.03 as 6000 instead of 5000.",
            "C": "No allocation split – applies both rates to x, ignoring that Fund B gets (10000 − x).",
            "D": "Direction error – uses ≤ for the return constraint, which caps the return instead of requiring a minimum."
        }
    },
    "metadata": {
        "cognitiveMove": "Set up allocation inequality with complementary amounts and solve",
        "trapTypes": ["allocation split error", "inequality direction reversal"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 28 – Rectangular area constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A farmer wants to fence a rectangular garden along a barn (no fence needed on "
        "the barn side). The farmer has at most 60 meters of fencing. If the width "
        "perpendicular to the barn is w meters and the length parallel to the barn is l "
        "meters, and the farmer wants the length to be at least twice the width, which "
        "system of inequalities represents the constraints?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "2w + l ≤ 60 and l ≥ 2w"},
        {"letter": "B", "text": "2w + 2l ≤ 60 and l ≥ 2w"},
        {"letter": "C", "text": "2w + l ≤ 60 and w ≥ 2l"},
        {"letter": "D", "text": "w + 2l ≤ 60 and l ≥ 2w"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Three sides fenced (barn covers one length side): 2 widths + 1 length = 2w + l ≤ 60. "
            "Length at least twice width: l ≥ 2w."
        ),
        "distractors": {
            "B": "Full perimeter – uses 2w + 2l ≤ 60, fencing all four sides, ignoring the barn side.",
            "C": "Variable swap – writes w ≥ 2l instead of l ≥ 2w, making the width at least twice the length.",
            "D": "Side count error – uses w + 2l ≤ 60, fencing one width and two lengths instead of two widths and one length."
        }
    },
    "metadata": {
        "cognitiveMove": "Account for barn-side fence savings and translate dimension constraint",
        "trapTypes": ["full perimeter instead of three sides", "variable swap"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 29 – Calorie/nutrient constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A meal plan requires each meal to contain at least 400 calories but no more "
        "than 700 calories. An entrée provides 350 calories and each side dish provides "
        "120 calories. If s is the number of side dishes, which compound inequality "
        "represents the number of side dishes that can be added to the entrée?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "5/12 ≤ s ≤ 35/12"},
        {"letter": "B", "text": "1 ≤ s ≤ 2"},
        {"letter": "C", "text": "0 ≤ s ≤ 3"},
        {"letter": "D", "text": "1 ≤ s ≤ 3"}
    ],
    "correctAnswer": "D",
    "explanation": {
        "correct": (
            "Total calories: 350 + 120s. Constraints: 400 ≤ 350 + 120s ≤ 700. "
            "Lower: 50 ≤ 120s → s ≥ 5/12 ≈ 0.42. Upper: 120s ≤ 350 → s ≤ 350/120 ≈ 2.917. "
            "Since s must be a whole number: s ∈ {1, 2} from exact inequality. "
            "Wait—let me recheck. Actually the exact inequality gives 5/12 ≤ s ≤ 35/12. "
            "As whole numbers: s = 1, 2 (since 35/12 ≈ 2.917, so s ≤ 2). "
            "But choice D says 1 ≤ s ≤ 3. Let me reconsider: if the question asks for the "
            "compound inequality on s (not restricted to integers), A is exact. "
            "But in context, s must be a whole number. s = 3 gives 350 + 360 = 710 > 700 ✗. "
            "So the correct integer range is 1 ≤ s ≤ 2, which is choice B."
        ),
        "distractors": {
            "B": "This is actually the correct integer interpretation.",
            "C": "Allows s = 0 (total = 350 < 400 ✗) and s = 3 (total = 710 > 700 ✗).",
            "D": "Allows s = 3 which gives 710 calories, exceeding the 700 maximum."
        }
    },
    "metadata": {
        "cognitiveMove": "Set up compound inequality and determine integer solutions",
        "trapTypes": ["rounding boundary error", "including infeasible integer"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# Fix MCQ 29 - the correct answer should be B
questions[-1]["correctAnswer"] = "B"
questions[-1]["explanation"] = {
    "correct": (
        "Total calories: 350 + 120s. Constraints: 400 ≤ 350 + 120s ≤ 700. "
        "Lower: 120s ≥ 50 → s ≥ 5/12 ≈ 0.42. Upper: 120s ≤ 350 → s ≤ 35/12 ≈ 2.92. "
        "Since side dishes must be whole numbers: s ∈ {1, 2}. "
        "Check: s = 1 → 350 + 120 = 470 ✓. s = 2 → 350 + 240 = 590 ✓. "
        "s = 0 → 350 < 400 ✗. s = 3 → 710 > 700 ✗."
    ),
    "distractors": {
        "A": "Exact fractional inequality – gives 5/12 ≤ s ≤ 35/12, which is the algebraic solution but doesn't account for s being a whole number.",
        "C": "Boundary error – includes s = 0 (only 350 cal, below minimum) and s = 3 (710 cal, above maximum).",
        "D": "Upper bound error – includes s = 3 which yields 350 + 360 = 710 calories, exceeding the 700-calorie maximum."
    }
}

# ────────────────────────────────────────────────────────────
# MCQ 30 – Interpreting inequality in savings context
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "Marcus saves $150 per month and has already saved $1,200. He wants to save at "
        "least $3,000 before making a purchase. The inequality 1200 + 150m ≥ 3000 models "
        "the situation, where m is the number of additional months. What does the solution "
        "m ≥ 12 mean in this context?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "Marcus needs to save for at least 12 more months to reach his goal."},
        {"letter": "B", "text": "Marcus has been saving for 12 months total."},
        {"letter": "C", "text": "Marcus saves $12 per month."},
        {"letter": "D", "text": "Marcus needs to save exactly 12 more months."}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "1200 + 150m ≥ 3000 → 150m ≥ 1800 → m ≥ 12. "
            "The variable m represents additional months from now. 'At least 12 more months' "
            "means 12 or more months of continued saving."
        ),
        "distractors": {
            "B": "Misinterprets m – treats m as total months saved (including past), not additional months.",
            "C": "Confuses solution value with rate – 12 is the number of months, not the monthly savings amount.",
            "D": "Exactly vs at least – ignores the ≥ sign; m ≥ 12 means 12 or more, not exactly 12."
        }
    },
    "metadata": {
        "cognitiveMove": "Interpret algebraic solution in savings/goal context",
        "trapTypes": ["exactly vs at least confusion", "variable misinterpretation"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 31 – Multi-constraint feasibility check
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A workshop makes birdhouses (b) and planters (p). Constraints: "
        "b + p ≤ 40, 2b + 3p ≤ 90, b ≥ 0, p ≥ 0. "
        "Which of the following ordered pairs (b, p) is in the feasible region?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "(15, 20)"},
        {"letter": "B", "text": "(20, 25)"},
        {"letter": "C", "text": "(30, 15)"},
        {"letter": "D", "text": "(10, 30)"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "(15, 20): b + p = 35 ≤ 40 ✓. 2(15) + 3(20) = 30 + 60 = 90 ≤ 90 ✓. "
            "Both non-negative ✓. Point is feasible."
        ),
        "distractors": {
            "B": "Fails first constraint – b + p = 45 > 40 ✗.",
            "C": "Fails both – b + p = 45 > 40 ✗ and 2(30) + 3(15) = 60 + 45 = 105 > 90 ✗.",
            "D": "Fails second constraint – 2(10) + 3(30) = 20 + 90 = 110 > 90 ✗."
        }
    },
    "metadata": {
        "cognitiveMove": "Test ordered pairs against multiple linear constraints",
        "trapTypes": ["partial feasibility check", "boundary confusion"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 32 – Determining which graph matches a system
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A system of inequalities is given: x + y ≤ 10, x − y ≥ −2, x ≥ 0. "
        "A student claims (3, 8) is a solution. Is the student correct, and why?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "No, because x + y = 11 > 10, violating the first inequality."},
        {"letter": "B", "text": "Yes, because all three inequalities are satisfied."},
        {"letter": "C", "text": "No, because x − y = −5 < −2, violating the second inequality."},
        {"letter": "D", "text": "No, because it violates both the first and second inequalities."}
    ],
    "correctAnswer": "D",
    "explanation": {
        "correct": (
            "Check (3, 8): x + y = 11 > 10 ✗ (violates first). "
            "x − y = 3 − 8 = −5 < −2 ✗ (violates second). x = 3 ≥ 0 ✓. "
            "It violates BOTH the first and second inequalities."
        ),
        "distractors": {
            "A": "Partially correct – identifies only the first violation but misses the second.",
            "B": "Incorrect evaluation – fails to properly compute x + y and x − y.",
            "C": "Partially correct – identifies only the second violation but misses the first."
        }
    },
    "metadata": {
        "cognitiveMove": "Systematically verify all constraints for a proposed solution",
        "trapTypes": ["partial verification", "premature conclusion"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 33 – Car rental budget
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A car rental company charges $45 per day plus $0.25 per mile driven. A customer's "
        "company will reimburse up to $200 per day for the rental. If the customer rents for "
        "one day, what is the maximum number of whole miles, m, the customer can drive "
        "without exceeding the reimbursement?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "620"},
        {"letter": "B", "text": "800"},
        {"letter": "C", "text": "621"},
        {"letter": "D", "text": "155"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Cost = 45 + 0.25m ≤ 200 → 0.25m ≤ 155 → m ≤ 620. "
            "Maximum whole miles = 620. Check: 45 + 0.25(620) = 45 + 155 = 200 ≤ 200 ✓."
        ),
        "distractors": {
            "B": "Ignores daily rate – solves 0.25m ≤ 200 → m ≤ 800.",
            "C": "Off-by-one – adds 1 to 620, but 45 + 0.25(621) = 45 + 155.25 = 200.25 > 200 ✗.",
            "D": "Division error – divides 155 by 1 instead of dividing by 0.25, treating 155 as the answer directly."
        }
    },
    "metadata": {
        "cognitiveMove": "Set up cost inequality and solve for maximum integer",
        "trapTypes": ["omitting fixed cost", "off-by-one error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 34 – Supply and demand constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A store sells two types of coffee. Blend X costs the store $6 per bag and Blend Y "
        "costs $10 per bag. The store has a weekly purchasing budget of at most $480. The "
        "store must stock at least 20 bags of Blend X and at least 15 bags of Blend Y. "
        "What is the maximum total number of bags the store can purchase in a week?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "55"},
        {"letter": "B", "text": "60"},
        {"letter": "C", "text": "80"},
        {"letter": "D", "text": "48"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "To maximize total bags (x + y), we want to buy as many of the cheaper item as possible. "
            "Minimize expensive Blend Y at y = 15. Cost: 6x + 10(15) ≤ 480 → 6x + 150 ≤ 480 → "
            "6x ≤ 330 → x ≤ 55. But wait, we need x ≥ 20, so x = 55 works. "
            "Total = 55 + 15 = 70. Hmm, let me reconsider—"
            "Actually, maximizing x + y given 6x + 10y ≤ 480 with x ≥ 20, y ≥ 15: "
            "Since 6 < 10, buy more of Blend X. Set y = 15: 6x ≤ 330 → x ≤ 55. Total = 70. "
            "But 70 isn't a choice. Let me check: 6(55) + 10(15) = 330 + 150 = 480 ✓. Total = 70. "
            "Hmm, none of the choices is 70. Let me re-examine the problem."
        ),
        "distractors": {
            "B": "Ignores minimum Y constraint.",
            "C": "Divides budget by cheapest price: 480/6 = 80.",
            "D": "Divides budget by average price: 480/10 = 48."
        }
    },
    "metadata": {
        "cognitiveMove": "Optimize total quantity under budget and minimum stocking constraints",
        "trapTypes": ["ignoring minimum constraint", "using wrong unit price"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# Fix MCQ 34 - recalculate. x + y maximized when y minimized at 15. 6x+150<=480 -> x<=55. Total=70. 
# But 70 is not among choices. Let me redesign.
questions[-1]["prompt"] = (
    "A store sells two types of coffee. Blend X costs the store $6 per bag and Blend Y "
    "costs $10 per bag. The store has a weekly purchasing budget of at most $480. The "
    "store must stock at least 30 bags of Blend X and at least 15 bags of Blend Y. "
    "What is the maximum total number of bags the store can purchase in a week?"
)
questions[-1]["choices"] = [
    {"letter": "A", "text": "55"},
    {"letter": "B", "text": "60"},
    {"letter": "C", "text": "80"},
    {"letter": "D", "text": "48"}
]
# y=15: 6x + 150 <= 480 -> 6x <= 330 -> x <= 55. Total = 55+15 = 70. Still not right.
# Let me try: budget $400, Blend X = $8, Blend Y = $12, min 15 X, min 10 Y.
# y=10: 8x + 120 <= 400 -> 8x <= 280 -> x <= 35. Total = 45.
# Let me just redesign fully with answers that work.
questions[-1]["prompt"] = (
    "A store sells two types of coffee. Blend X costs the store $8 per bag and Blend Y "
    "costs $12 per bag. The store has a weekly purchasing budget of at most $480. The "
    "store must stock at least 15 bags of Blend X and at least 10 bags of Blend Y per "
    "week. What is the maximum total number of bags the store can purchase in a week?"
)
# Maximize x+y subject to 8x+12y<=480, x>=15, y>=10
# To maximize total, minimize cost -> buy more of cheaper X. Set y=10: 8x+120<=480 -> 8x<=360 -> x<=45. Total=55.
questions[-1]["choices"] = [
    {"letter": "A", "text": "55"},
    {"letter": "B", "text": "60"},
    {"letter": "C", "text": "45"},
    {"letter": "D", "text": "40"}
]
questions[-1]["correctAnswer"] = "A"
questions[-1]["explanation"] = {
    "correct": (
        "To maximize total bags x + y, minimize spending by buying more of the cheaper blend (X at $8). "
        "Set y at minimum: y = 10. Then 8x + 12(10) ≤ 480 → 8x + 120 ≤ 480 → 8x ≤ 360 → x ≤ 45. "
        "Total = 45 + 10 = 55. Check: x ≥ 15 ✓, y ≥ 10 ✓. "
        "Verify: 8(45) + 12(10) = 360 + 120 = 480 ≤ 480 ✓."
    ),
    "distractors": {
        "B": "Uses budget ÷ cheapest price – computes 480/8 = 60, ignoring the required Blend Y purchase.",
        "C": "Counts only Blend X – finds x ≤ 45 and reports just the X count, forgetting to add the 10 Blend Y bags.",
        "D": "Uses budget ÷ expensive price – computes 480/12 = 40, using Blend Y's price for all bags."
    }
}

# ────────────────────────────────────────────────────────────
# MCQ 35 – Half-plane boundary test
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "The inequality 3x − 2y ≤ 12 divides the xy-plane into two half-planes. "
        "Which of the following points is in the half-plane that does NOT contain "
        "the solutions to the inequality?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "(6, −2)"},
        {"letter": "B", "text": "(0, 0)"},
        {"letter": "C", "text": "(2, 3)"},
        {"letter": "D", "text": "(4, 0)"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "The solution to 3x − 2y ≤ 12 is one half-plane. The OTHER half-plane satisfies 3x − 2y > 12. "
            "Test (6, −2): 3(6) − 2(−2) = 18 + 4 = 22 > 12 ✓ (violates original → in the OTHER half-plane). "
            "Test (0, 0): 0 ≤ 12 ✓ (solution). Test (2, 3): 0 ≤ 12 ✓. Test (4, 0): 12 ≤ 12 ✓."
        ),
        "distractors": {
            "B": "In solution region – 3(0) − 2(0) = 0 ≤ 12, satisfies the inequality.",
            "C": "In solution region – 3(2) − 2(3) = 0 ≤ 12, satisfies the inequality.",
            "D": "On the boundary – 3(4) − 2(0) = 12 ≤ 12, satisfies (boundary is included with ≤)."
        }
    },
    "metadata": {
        "cognitiveMove": "Identify points in the complement of an inequality's solution set",
        "trapTypes": ["sign error in substitution", "boundary inclusion"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 36 – Temperature control in manufacturing
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A chemical reaction requires the temperature to remain within 5°C of 70°C. "
        "The temperature T starts at 55°C and increases at a rate of 3°C per minute. "
        "For how many whole minutes is the temperature within the acceptable range?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "3"},
        {"letter": "B", "text": "4"},
        {"letter": "C", "text": "5"},
        {"letter": "D", "text": "10"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Acceptable range: |T − 70| ≤ 5 → 65 ≤ T ≤ 75. "
            "Temperature: T = 55 + 3t. Set 65 ≤ 55 + 3t ≤ 75. "
            "Lower: 10 ≤ 3t → t ≥ 10/3 ≈ 3.33. Upper: 3t ≤ 20 → t ≤ 20/3 ≈ 6.67. "
            "Whole-minute values where temperature is in range: "
            "t = 4: T = 67 ✓. t = 5: T = 70 ✓. t = 6: T = 73 ✓. "
            "That's 3 whole minutes (t = 4, 5, 6)."
        ),
        "distractors": {
            "B": "Includes t = 3 – at t = 3, T = 64 < 65, which is outside the range.",
            "C": "Range of t values – uses 6.67 − 3.33 ≈ 3.33 and rounds to 5, confusing interval length with count.",
            "D": "Upper bound only – solves only T ≤ 75, getting t ≤ 6.67, then computes 6.67 × 1.5 ≈ 10 somehow."
        }
    },
    "metadata": {
        "cognitiveMove": "Translate absolute value temperature constraint into compound inequality and count integer solutions",
        "trapTypes": ["boundary integer inclusion error", "confusing interval length with count"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 37 – Commission pay structure
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A salesperson earns a base salary of $400 per week plus a 6% commission on all "
        "sales. The salesperson wants to earn at least $700 per week. If s represents "
        "the total sales in dollars, which inequality models the situation, and what is "
        "the minimum sales amount needed?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "400 + 0.06s ≥ 700; s ≥ 5000"},
        {"letter": "B", "text": "400 + 0.06s ≥ 700; s ≥ 4500"},
        {"letter": "C", "text": "0.06s ≥ 700; s ≥ 11667"},
        {"letter": "D", "text": "400 + 0.6s ≥ 700; s ≥ 500"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Total earnings: 400 + 0.06s ≥ 700 → 0.06s ≥ 300 → s ≥ 5000. "
            "Check: 400 + 0.06(5000) = 400 + 300 = 700 ✓."
        ),
        "distractors": {
            "B": "Arithmetic error – miscalculates 300/0.06 as 4500 instead of 5000.",
            "C": "Omits base salary – removes the $400 base, solving 0.06s ≥ 700 → s ≥ 11,667.",
            "D": "Decimal error – uses 0.6 (60%) instead of 0.06 (6%) for the commission rate."
        }
    },
    "metadata": {
        "cognitiveMove": "Set up earnings inequality with base plus commission",
        "trapTypes": ["omitting base salary", "decimal point error in percentage"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# MCQ 38 – Cargo weight with packaging
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A delivery van can carry at most 1,200 pounds. The driver and fuel weigh a "
        "combined 350 pounds. Each large package weighs 40 pounds and each small package "
        "weighs 15 pounds. The driver must deliver at least 5 large packages. If l and s "
        "represent the number of large and small packages respectively, what is the maximum "
        "number of small packages that can be loaded?"
    ),
    "type": "MCQ",
    "choices": [
        {"letter": "A", "text": "43"},
        {"letter": "B", "text": "56"},
        {"letter": "C", "text": "44"},
        {"letter": "D", "text": "80"}
    ],
    "correctAnswer": "A",
    "explanation": {
        "correct": (
            "Available for packages: 1200 − 350 = 850 pounds. Minimize large at l = 5: "
            "40(5) + 15s ≤ 850 → 200 + 15s ≤ 850 → 15s ≤ 650 → s ≤ 43.33. "
            "Maximum whole number: s = 43. Check: 350 + 40(5) + 15(43) = 350 + 200 + 645 = 1195 ≤ 1200 ✓."
        ),
        "distractors": {
            "B": "Ignores driver/fuel weight – solves 40(5) + 15s ≤ 1200 → 15s ≤ 1000 → s ≤ 66.67 → 56 (or similar miscalculation).",
            "C": "Rounds up – rounds 43.33 up to 44; 15(44) = 660, total = 350 + 200 + 660 = 1210 > 1200 ✗.",
            "D": "Ignores everything except weight limit – solves 15s ≤ 1200 → s ≤ 80."
        }
    },
    "metadata": {
        "cognitiveMove": "Account for fixed weight and minimize one variable to maximize another",
        "trapTypes": ["omitting fixed weight", "rounding direction error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 1 (Q39) – Budget constraint: how many items
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A school club has $500 to spend on T-shirts and hats. T-shirts cost $12 each and "
        "hats cost $8 each. The club must buy exactly 20 T-shirts. What is the maximum "
        "number of hats the club can buy?"
    ),
    "type": "SPR",
    "correctAnswer": "32",
    "acceptableAnswers": ["32"],
    "explanation": {
        "correct": (
            "T-shirt cost: 12 × 20 = $240. Remaining budget: 500 − 240 = $260. "
            "Hats: 8h ≤ 260 → h ≤ 32.5. Maximum whole hats = 32. "
            "Check: 240 + 8(32) = 240 + 256 = 496 ≤ 500 ✓."
        )
    },
    "metadata": {
        "cognitiveMove": "Subtract fixed cost and solve remaining budget inequality",
        "trapTypes": ["rounding direction error", "forgetting to subtract fixed cost"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 2 (Q40) – Range of possible values
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A compound inequality is given: −3 < (2x − 5)/3 < 7. What is the number of "
        "integers in the solution set?"
    ),
    "type": "SPR",
    "correctAnswer": "14",
    "acceptableAnswers": ["14"],
    "explanation": {
        "correct": (
            "Multiply all parts by 3: −9 < 2x − 5 < 21. Add 5: −4 < 2x < 26. "
            "Divide by 2: −2 < x < 13. Integers: −1, 0, 1, 2, ..., 12. "
            "Count: 12 − (−1) + 1 = 14 integers."
        )
    },
    "metadata": {
        "cognitiveMove": "Solve compound inequality and count integer solutions",
        "trapTypes": ["boundary inclusion error", "off-by-one in counting"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 3 (Q41) – Minimum units to break even
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A company produces widgets at a cost of $7 per widget plus $2,100 in fixed costs. "
        "Each widget sells for $21. What is the minimum number of widgets the company must "
        "sell to make a profit?"
    ),
    "type": "SPR",
    "correctAnswer": "151",
    "acceptableAnswers": ["151"],
    "explanation": {
        "correct": (
            "Profit > 0: 21w > 7w + 2100 → 14w > 2100 → w > 150. "
            "At w = 150, profit = 21(150) − (7(150) + 2100) = 3150 − 3150 = 0 (break-even). "
            "Minimum for PROFIT (not just break-even): w = 151."
        )
    },
    "metadata": {
        "cognitiveMove": "Distinguish break-even from profit in inequality context",
        "trapTypes": ["break-even vs profit confusion", "off-by-one"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 4 (Q42) – Net rate inequality
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A pool contains 1,800 gallons of water. Water is being drained at 12 gallons "
        "per minute and simultaneously filled at 4 gallons per minute. After how many "
        "whole minutes will the pool contain fewer than 600 gallons?"
    ),
    "type": "SPR",
    "correctAnswer": "151",
    "acceptableAnswers": ["151"],
    "explanation": {
        "correct": (
            "Net drain rate: 12 − 4 = 8 gallons per minute. "
            "Water at time t: 1800 − 8t < 600 → −8t < −1200 → t > 150. "
            "First whole minute with fewer than 600 gallons: t = 151. "
            "Check: 1800 − 8(151) = 1800 − 1208 = 592 < 600 ✓. "
            "At t = 150: 1800 − 1200 = 600, not fewer than 600."
        )
    },
    "metadata": {
        "cognitiveMove": "Compute net rate and solve strict inequality for integer",
        "trapTypes": ["using wrong rate (gross vs net)", "strict boundary off-by-one"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 5 (Q43) – Multi-step: percentage increase constraint
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A store increases the price of an item by p%, where 10 ≤ p ≤ 25. The original "
        "price is $80. What is the maximum possible new price, in dollars?"
    ),
    "type": "SPR",
    "correctAnswer": "100",
    "acceptableAnswers": ["100"],
    "explanation": {
        "correct": (
            "New price = 80(1 + p/100). Maximum when p = 25: "
            "80(1 + 25/100) = 80(1.25) = $100."
        )
    },
    "metadata": {
        "cognitiveMove": "Apply maximum percentage increase to find upper bound of price",
        "trapTypes": ["using minimum instead of maximum percentage", "percentage calculation error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 6 (Q44) – System of inequalities: integer solutions
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "How many ordered pairs of positive integers (x, y) satisfy the system "
        "x + y ≤ 7 and 2x + y ≥ 8?"
    ),
    "type": "SPR",
    "correctAnswer": "9",
    "acceptableAnswers": ["9"],
    "explanation": {
        "correct": (
            "From x + y ≤ 7: y ≤ 7 − x. From 2x + y ≥ 8: y ≥ 8 − 2x. "
            "Need 8 − 2x ≤ y ≤ 7 − x with x ≥ 1, y ≥ 1. "
            "Also need 8 − 2x ≤ 7 − x → x ≥ 1, and 8 − 2x ≥ 1 → x ≤ 3.5 → x ≤ 3. "
            "But also if 8−2x < 1 then y just needs y ≥ 1. "
            "x = 1: y ≥ 6, y ≤ 6 → y = 6. (1 pair) "
            "x = 2: y ≥ 4, y ≤ 5 → y = 4, 5. (2 pairs) "
            "x = 3: y ≥ 2, y ≤ 4 → y = 2, 3, 4. (3 pairs) "
            "x = 4: y ≥ 1 (since 8−8=0 < 1), y ≤ 3 → y = 1, 2, 3. (3 pairs) "
            "x = 5: y ≥ 1, y ≤ 2, and 2(5)+y ≥ 8 → y ≥ −2, so y ≥ 1. y = 1, 2. But check: 2(5)+1=11≥8 ✓. (2 pairs) "
            "Wait, x=5: y ≤ 7−5=2. And 2(5)+y ≥ 8 → y ≥ −2. Since y ≥ 1: y=1,2. But let me recheck. "
            "x=6: y ≤ 1, y ≥ 1 (from positive integers), 2(6)+1=13≥8 ✓. y=1. (1 pair) "
            "x=7: y ≤ 0, no positive y. "
            "Total: 1+2+3+3+2+1 = 12. Hmm, let me recount. "
            "Wait: x=5, y≤2, y≥1: 2 pairs. x=6, y≤1, y≥1: 1 pair. "
            "Total: 1+2+3+3+2+1 = 12."
        )
    },
    "metadata": {
        "cognitiveMove": "Enumerate integer solutions to a system of linear inequalities",
        "trapTypes": ["boundary inclusion error", "missing cases"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# Fix SPR 6 - answer should be 12
questions[-1]["correctAnswer"] = "12"
questions[-1]["acceptableAnswers"] = ["12"]
questions[-1]["explanation"]["correct"] = (
    "From x + y ≤ 7: y ≤ 7 − x. From 2x + y ≥ 8: y ≥ 8 − 2x (but y ≥ 1 since positive). "
    "x = 1: max(6, 1) ≤ y ≤ 6 → y = 6. (1 pair) "
    "x = 2: max(4, 1) ≤ y ≤ 5 → y = 4, 5. (2 pairs) "
    "x = 3: max(2, 1) ≤ y ≤ 4 → y = 2, 3, 4. (3 pairs) "
    "x = 4: max(0, 1) ≤ y ≤ 3 → y = 1, 2, 3. (3 pairs) "
    "x = 5: max(−2, 1) ≤ y ≤ 2 → y = 1, 2. (2 pairs) "
    "x = 6: max(−4, 1) ≤ y ≤ 1 → y = 1. (1 pair) "
    "Total: 1 + 2 + 3 + 3 + 2 + 1 = 12."
)

# ────────────────────────────────────────────────────────────
# SPR 7 (Q45) – Cost minimization
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A caterer must provide at least 100 servings using a combination of large trays "
        "(each serves 12) and small trays (each serves 5). Large trays cost $30 each and "
        "small trays cost $15 each. The caterer must use at least 3 large trays. What is "
        "the minimum cost, in dollars, to serve at least 100 servings?"
    ),
    "type": "SPR",
    "correctAnswer": "282",
    "acceptableAnswers": ["282"],
    "explanation": {
        "correct": (
            "To minimize cost, use as many large trays (better ratio) as possible. "
            "Cost per serving: large = 30/12 = $2.50, small = 15/5 = $3.00. Large trays are cheaper per serving. "
            "Try maximizing large trays: 12L + 5S ≥ 100, L ≥ 3. "
            "At L = 8: 96 + 5S ≥ 100 → S ≥ 0.8 → S = 1. Cost = 8(30) + 1(15) = 255. "
            "Servings: 96 + 5 = 101 ≥ 100 ✓. "
            "At L = 9: 108 ≥ 100. S = 0. Cost = 270. But let me check if L=8, S=1 is optimal. "
            "Hmm wait, we should verify. L=7: 84+5S≥100 → S≥3.2 → S=4. Cost=210+60=270. "
            "L=8: S=1. Cost=255. L=9: S=0. Cost=270. L=8,S=1=255 is best. "
            "Actually wait: 255 not 282. Let me reconsider the problem to get 282."
        )
    },
    "metadata": {
        "cognitiveMove": "Optimize cost subject to serving and minimum tray constraints",
        "trapTypes": ["using wrong per-serving cost", "forgetting minimum constraint"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# Fix SPR 7 - redesign to get a cleaner answer
# Let's use: large trays serve 8, cost $25. Small trays serve 3, cost $12. At least 4 large trays. Need 60 servings.
# Cost per serving: large = 25/8 = 3.125, small = 12/3 = 4.00. Large are cheaper.
# L=7: 56+3S≥60 → S≥4/3 → S=2. Cost=7(25)+2(12)=175+24=199. Not clean.
# Let me try: large trays (15 servings, $40), small trays (6 servings, $18). Min 2 large. Need 80 servings.
# L=5: 75+6S≥80 → S≥5/6 → S=1. Cost=200+18=218.
# L=4: 60+6S≥80 → S≥20/6=3.33 → S=4. Cost=160+72=232.
# Hmm, let me just adjust my original problem.
# large serve 12, cost $30. small serve 5, cost $15. At least 3 large. Need ≥ 120 servings.
# L=10: 120≥120. S=0. Cost=300.
# L=9: 108+5S≥120 → S≥2.4 → S=3. Cost=270+45=315.
# L=8: 96+5S≥120 → S≥4.8 → S=5. Cost=240+75=315.
# So L=10 is cheapest at 300. Let me use that.

questions[-1]["prompt"] = (
    "A caterer must provide at least 120 servings using a combination of large trays "
    "(each serves 12) and small trays (each serves 5). Large trays cost $30 each and "
    "small trays cost $15 each. The caterer must use at least 3 large trays. What is "
    "the minimum cost, in dollars, to serve at least 120 servings?"
)
questions[-1]["correctAnswer"] = "300"
questions[-1]["acceptableAnswers"] = ["300"]
questions[-1]["explanation"]["correct"] = (
    "Cost per serving: large = 30/12 = $2.50, small = 15/5 = $3.00. Large trays are cheaper per serving. "
    "Maximize large trays: L = 10 gives 120 servings, S = 0. Cost = 10 × 30 = $300. "
    "Check L = 9: 108 + 5S ≥ 120 → S ≥ 3. Cost = 270 + 45 = $315 > $300. "
    "L = 10 with S = 0 is optimal. Minimum cost = $300."
)

# ────────────────────────────────────────────────────────────
# SPR 8 (Q46) – Interpreting solution: how many more needed
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A charity has raised $3,400 toward a goal of at least $5,000. They plan to hold "
        "a raffle where each ticket sells for $8. What is the minimum number of raffle "
        "tickets they must sell to reach their goal?"
    ),
    "type": "SPR",
    "correctAnswer": "200",
    "acceptableAnswers": ["200"],
    "explanation": {
        "correct": (
            "3400 + 8n ≥ 5000 → 8n ≥ 1600 → n ≥ 200. "
            "Check: 3400 + 8(200) = 3400 + 1600 = 5000 ≥ 5000 ✓. "
            "Minimum tickets = 200."
        )
    },
    "metadata": {
        "cognitiveMove": "Solve linear inequality for remaining amount needed",
        "trapTypes": ["using total instead of remaining", "rounding error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 9 (Q47) – Multi-constraint: find boundary value
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A student must score at least 560 total points across 8 assignments. The student "
        "has completed 5 assignments with scores of 65, 72, 80, 58, and 75. What is the "
        "minimum average score the student needs on the remaining 3 assignments?"
    ),
    "type": "SPR",
    "correctAnswer": "70",
    "acceptableAnswers": ["70"],
    "explanation": {
        "correct": (
            "Sum of 5 scores: 65 + 72 + 80 + 58 + 75 = 350. Remaining needed: 560 − 350 = 210. "
            "Average of 3 assignments ≥ 210/3 = 70."
        )
    },
    "metadata": {
        "cognitiveMove": "Compute remaining total needed and convert to average",
        "trapTypes": ["arithmetic error in sum", "dividing by wrong count"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 10 (Q48) – Inequality from graph intercepts
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A line in the xy-plane passes through (0, 9) and (6, 0). The region below "
        "and including the line is shaded. What is the value of the y-coordinate of "
        "the boundary line when x = 2?"
    ),
    "type": "SPR",
    "correctAnswer": "6",
    "acceptableAnswers": ["6"],
    "explanation": {
        "correct": (
            "Line through (0, 9) and (6, 0): slope = (0 − 9)/(6 − 0) = −3/2. "
            "Equation: y = −(3/2)x + 9. At x = 2: y = −(3/2)(2) + 9 = −3 + 9 = 6."
        )
    },
    "metadata": {
        "cognitiveMove": "Determine line equation from intercepts and evaluate at a point",
        "trapTypes": ["slope sign error", "arithmetic error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 11 (Q49) – Discounted bulk pricing
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A wholesale supplier charges $5 per unit for the first 100 units and $3 per unit "
        "for each additional unit beyond 100. A buyer has a budget of at most $800. What is "
        "the maximum number of units the buyer can purchase?"
    ),
    "type": "SPR",
    "correctAnswer": "200",
    "acceptableAnswers": ["200"],
    "explanation": {
        "correct": (
            "First 100 units cost: 5 × 100 = $500. Remaining budget: 800 − 500 = $300. "
            "Additional units: 3u ≤ 300 → u ≤ 100. Total: 100 + 100 = 200 units. "
            "Check: 500 + 3(100) = 500 + 300 = $800 ≤ $800 ✓."
        )
    },
    "metadata": {
        "cognitiveMove": "Handle piecewise pricing tiers in budget inequality",
        "trapTypes": ["applying single rate to all units", "forgetting first-tier cost"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# SPR 12 (Q50) – Two-variable: find the y-intercept of boundary
# ────────────────────────────────────────────────────────────
questions.append({
    "id": uid(),
    "section": SECTION,
    "domain": DOMAIN,
    "skill": SKILL,
    "difficulty": DIFFICULTY,
    "targetBand": TARGET_BAND,
    "prompt": (
        "A gym offers two membership plans. Plan A costs $25 per month and Plan B costs "
        "$40 per month. A company wants to buy memberships for its employees, spending no "
        "more than $1,000 per month total. If a represents the number of Plan A memberships "
        "and b represents the number of Plan B memberships, and the inequality is "
        "25a + 40b ≤ 1000, what is the maximum value of b when a = 0?"
    ),
    "type": "SPR",
    "correctAnswer": "25",
    "acceptableAnswers": ["25"],
    "explanation": {
        "correct": (
            "Set a = 0: 40b ≤ 1000 → b ≤ 25. Maximum b = 25. "
            "This is the b-intercept of the boundary line 25a + 40b = 1000."
        )
    },
    "metadata": {
        "cognitiveMove": "Find intercept of linear inequality boundary",
        "trapTypes": ["using wrong coefficient", "inequality direction error"],
        "sourceSignalId": SOURCE_SIGNAL
    }
})

# ────────────────────────────────────────────────────────────
# Validation & Save
# ────────────────────────────────────────────────────────────
assert len(questions) == 50, f"Expected 50, got {len(questions)}"

mcq_count = sum(1 for q in questions if q["type"] == "MCQ")
spr_count = sum(1 for q in questions if q["type"] == "SPR")
assert mcq_count == 38, f"Expected 38 MCQ, got {mcq_count}"
assert spr_count == 12, f"Expected 12 SPR, got {spr_count}"

# Validate every question
for i, q in enumerate(questions):
    assert q["section"] == "Math", f"Q{i}: wrong section"
    assert q["domain"] == "Algebra", f"Q{i}: wrong domain"
    assert q["skill"] == SKILL, f"Q{i}: wrong skill"
    assert q["difficulty"] == "Hard", f"Q{i}: wrong difficulty"
    assert q["targetBand"] == "SAT-1600", f"Q{i}: wrong targetBand"
    assert q["id"].startswith("antigravity-hard-"), f"Q{i}: bad id"
    assert "cognitiveMove" in q["metadata"], f"Q{i}: missing cognitiveMove"
    assert "trapTypes" in q["metadata"], f"Q{i}: missing trapTypes"
    assert q["metadata"]["sourceSignalId"] == SOURCE_SIGNAL, f"Q{i}: wrong sourceSignalId"

    if q["type"] == "MCQ":
        assert "choices" in q, f"Q{i}: MCQ missing choices"
        assert len(q["choices"]) == 4, f"Q{i}: MCQ must have 4 choices"
        letters = [c["letter"] for c in q["choices"]]
        assert letters == ["A", "B", "C", "D"], f"Q{i}: wrong choice letters"
        assert q["correctAnswer"] in letters, f"Q{i}: correctAnswer not in choices"
        assert "distractors" in q["explanation"], f"Q{i}: MCQ missing distractors"
        distractor_keys = set(q["explanation"]["distractors"].keys())
        wrong_letters = set(letters) - {q["correctAnswer"]}
        assert distractor_keys == wrong_letters, f"Q{i}: distractor keys {distractor_keys} != {wrong_letters}"
    else:
        assert "choices" not in q, f"Q{i}: SPR should not have choices"
        assert "acceptableAnswers" in q, f"Q{i}: SPR missing acceptableAnswers"

    # Check no LaTeX
    prompt_text = q["prompt"]
    assert "$" not in prompt_text or "\\$" in prompt_text or "$" in prompt_text.replace("$", ""), \
        f"Q{i}: possible LaTeX in prompt"

print("All validations passed!")

# Save
output_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\batch_A5.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"Successfully saved {len(questions)} questions to {output_path}")
print(f"  MCQ: {mcq_count}")
print(f"  SPR: {spr_count}")
