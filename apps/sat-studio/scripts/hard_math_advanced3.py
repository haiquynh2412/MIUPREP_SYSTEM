import json
import uuid
import os

def generate_id():
    return f"antigravity-1600-{uuid.uuid4().hex[:8]}"

questions = []

# Group 1: Quadratic, exactly one solution
for a_var, h_var, k_var, d_val, c_var, m_var in [('a','h','k',2,'c','m'), ('p','q','r',3,'v','w'), ('a','b','c',4,'d','p'), ('m','n','p',5,'k','q'), ('r','s','t',6,'u','v')]:
    d_sq = d_val**2
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The function f is defined by f(x) = {a_var}(x - {h_var})² + {k_var}, where {a_var}, {h_var}, and {k_var} are constants, and {a_var} < 0. The equation f(x) = {c_var} has exactly one real solution. If f({h_var} + {d_val}) = {m_var}, what is the value of {c_var} in terms of {m_var} and {a_var}?",
        "choices": [
            f"{m_var} - {d_sq}{a_var}",
            f"{m_var} + {d_sq}{a_var}",
            f"{m_var} - {d_val}{a_var}",
            f"{m_var} + {d_val}{a_var}"
        ],
        "correctAnswer": f"{m_var} - {d_sq}{a_var}",
        "explanation": {
            "correct": f"For the quadratic equation f(x) = {c_var} to have exactly one real solution, {c_var} must be the maximum value of the function (since {a_var} < 0), which occurs at the vertex. Thus, {c_var} = {k_var}. We are given f({h_var} + {d_val}) = {m_var}. Substituting into the function: {a_var}({h_var} + {d_val} - {h_var})² + {k_var} = {m_var}. This simplifies to {a_var}({d_val})² + {k_var} = {m_var}, or {d_sq}{a_var} + {k_var} = {m_var}. Solving for {k_var} gives {k_var} = {m_var} - {d_sq}{a_var}.",
            "distractors": {
                f"{m_var} + {d_sq}{a_var}": "Sign error: added the term instead of subtracting when isolating the vertex constant.",
                f"{m_var} - {d_val}{a_var}": "Squaring error: failed to square the difference inside the parenthesis.",
                f"{m_var} + {d_val}{a_var}": "Sign and squaring error."
            }
        },
        "metadata": {
            "cognitiveMove": "Identify vertex condition for exactly one solution, then algebraic substitution.",
            "trapTypes": ["Sign Error", "Algebraic Manipulation"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 2: Exponential Transformation
for A_var, b_var, c_var, k_var in [('A','b','c','k'), ('P','r','d','m'), ('C','a','h','n'), ('M','q','p','v'), ('K','w','z','t')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The function f is defined by f(x) = {A_var} · {b_var}ˣ, where {A_var} and {b_var} are positive constants. The function g is defined by g(x) = f(x - {c_var}), where {c_var} is a positive constant. If g(x) is rewritten in the form g(x) = {k_var} · f(x), which of the following represents {k_var} in terms of {b_var} and {c_var}?",
        "choices": [
            f"1 / ({b_var}^{c_var})",
            f"{b_var}^{c_var}",
            f"-{c_var} · {b_var}",
            f"1 / ({c_var}^{b_var})"
        ],
        "correctAnswer": f"1 / ({b_var}^{c_var})",
        "explanation": {
            "correct": f"We are given g(x) = f(x - {c_var}) = {A_var} · {b_var}^(x - {c_var}). By the rules of exponents, {b_var}^(x - {c_var}) = {b_var}ˣ · {b_var}^(-{c_var}). So, g(x) = {A_var} · {b_var}ˣ · {b_var}^(-{c_var}). Since f(x) = {A_var} · {b_var}ˣ, we can substitute f(x) into the equation: g(x) = f(x) · {b_var}^(-{c_var}). A negative exponent means taking the reciprocal, so {b_var}^(-{c_var}) = 1 / ({b_var}^{c_var}). Thus, {k_var} = 1 / ({b_var}^{c_var}).",
            "distractors": {
                f"{b_var}^{c_var}": "Sign error in exponent rules, effectively transforming f(x + c) instead of f(x - c).",
                f"-{c_var} · {b_var}": "Multiplied the base by the exponent, misunderstanding exponential rules.",
                f"1 / ({c_var}^{b_var})": "Swapped the base and the exponent."
            }
        },
        "metadata": {
            "cognitiveMove": "Apply exponent rules to separate the variable and constant parts of the exponent.",
            "trapTypes": ["Exponent Rule Error", "Sign Error"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 3: Polynomial Roots
for a_var, b_var, c_var, r_var in [('a','b','c','r'), ('p','q','r','k'), ('m','n','p','d'), ('u','v','w','z'), ('c','d','e','h')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The polynomial P(x) = x³ - {a_var}x² + {b_var}x - {c_var} has exactly three distinct positive real roots. If one of the roots is {r_var}, which of the following expressions represents the product of the other two roots?",
        "choices": [
            f"{c_var} / {r_var}",
            f"{c_var} - {r_var}",
            f"{b_var} / {r_var}",
            f"-{c_var} / {r_var}"
        ],
        "correctAnswer": f"{c_var} / {r_var}",
        "explanation": {
            "correct": f"By Vieta's formulas, the product of the roots of a cubic polynomial x³ + A x² + B x + C = 0 is -C. Here, the constant term is -{c_var}, so the product of the three roots is -(-{c_var}) = {c_var}. Let the three roots be {r_var}, s, and t. We have {r_var} · s · t = {c_var}. Dividing both sides by {r_var} gives the product of the other two roots: s · t = {c_var} / {r_var}.",
            "distractors": {
                f"{c_var} - {r_var}": "Subtracted the known root instead of dividing, confusing additive and multiplicative properties.",
                f"{b_var} / {r_var}": "Used the coefficient of x ({b_var}), which relates to the sum of pairwise products, instead of the constant term.",
                f"-{c_var} / {r_var}": "Sign error when applying Vieta's formulas; forgot that the product of roots for a cubic relates to the negative of the constant term."
            }
        },
        "metadata": {
            "cognitiveMove": "Recall and apply Vieta's formulas for cubic polynomials to isolate a subset of roots.",
            "trapTypes": ["Formula Error", "Sign Error"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 4: Intersection of Line and Parabola
for m_var, b_var, k_var, c_var in [('m','b','k','c'), ('p','q','r','s'), ('c','d','a','h'), ('u','v','w','z'), ('n','p','m','r')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"In the xy-plane, the line y = {m_var}x + {b_var} intersects the parabola y = x² + {k_var}x + {c_var} at exactly one point. What is {c_var} in terms of {m_var}, {b_var}, and {k_var}?",
        "choices": [
            f"({k_var} - {m_var})² / 4 + {b_var}",
            f"({k_var} - {m_var})² / 4 - {b_var}",
            f"({k_var} + {m_var})² / 4 + {b_var}",
            f"({k_var} - {m_var})² + {b_var}"
        ],
        "correctAnswer": f"({k_var} - {m_var})² / 4 + {b_var}",
        "explanation": {
            "correct": f"Set the equations equal to find intersection points: x² + {k_var}x + {c_var} = {m_var}x + {b_var}, which simplifies to the standard quadratic form x² + ({k_var} - {m_var})x + ({c_var} - {b_var}) = 0. For the line and parabola to intersect at exactly one point, the quadratic must have exactly one real solution, meaning its discriminant must be zero. The discriminant is ({k_var} - {m_var})² - 4(1)({c_var} - {b_var}) = 0. Solving for {c_var}: 4({c_var} - {b_var}) = ({k_var} - {m_var})², so {c_var} - {b_var} = ({k_var} - {m_var})² / 4, and finally {c_var} = ({k_var} - {m_var})² / 4 + {b_var}.",
            "distractors": {
                f"({k_var} - {m_var})² / 4 - {b_var}": "Sign error when isolating the constant term; subtracted instead of adding.",
                f"({k_var} + {m_var})² / 4 + {b_var}": "Sign error when grouping the linear terms into the discriminant.",
                f"({k_var} - {m_var})² + {b_var}": "Forgot to divide by 4 from the '4ac' part of the discriminant."
            }
        },
        "metadata": {
            "cognitiveMove": "Set equations equal, arrange into standard quadratic form, and apply the zero discriminant condition.",
            "trapTypes": ["Discriminant Error", "Sign Error"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 5: Rational Function Equivalent Forms
for a_var, b_var, c_var, d_var, k_var in [('a','b','c','d','k'), ('p','q','r','s','m'), ('m','n','p','v','w'), ('c','d','e','f','h'), ('u','v','w','z','t')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The expression ({a_var}x² + {b_var}x + {c_var}) / (x - {d_var}) can be rewritten in the form {a_var}x + {k_var} + R / (x - {d_var}), where R and {k_var} are constants. What is the value of R in terms of {a_var}, {b_var}, {c_var}, and {d_var}?",
        "choices": [
            f"{a_var}{d_var}² + {b_var}{d_var} + {c_var}",
            f"-{a_var}{d_var}² - {b_var}{d_var} + {c_var}",
            f"{a_var}{d_var}² - {b_var}{d_var} + {c_var}",
            f"{a_var}{d_var} + {b_var} + {c_var}"
        ],
        "correctAnswer": f"{a_var}{d_var}² + {b_var}{d_var} + {c_var}",
        "explanation": {
            "correct": f"By the Polynomial Remainder Theorem, the remainder R when dividing a polynomial P(x) by (x - {d_var}) is found by evaluating P({d_var}). Here, P(x) = {a_var}x² + {b_var}x + {c_var}. Substituting x = {d_var} yields R = {a_var}({d_var})² + {b_var}({d_var}) + {c_var} = {a_var}{d_var}² + {b_var}{d_var} + {c_var}. Alternatively, using long division leads to the exact same remainder.",
            "distractors": {
                f"-{a_var}{d_var}² - {b_var}{d_var} + {c_var}": "Evaluated P(-d) instead of P(d), a common error with the Remainder Theorem.",
                f"{a_var}{d_var}² - {b_var}{d_var} + {c_var}": "Sign error on the linear term during evaluation.",
                f"{a_var}{d_var} + {b_var} + {c_var}": "Forgot to square the d term in the leading polynomial component."
            }
        },
        "metadata": {
            "cognitiveMove": "Recognize remainder structure and apply Polynomial Remainder Theorem directly.",
            "trapTypes": ["Sign Error", "Theorem Misapplication"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 6: Radical Equation
for a_var, b_var, c_var in [('a','b','c'), ('p','q','r'), ('m','n','k'), ('u','v','w'), ('c','d','e')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"Given the equation √({a_var}x + {b_var}) = x + {c_var}, where {a_var}, {b_var}, and {c_var} are positive constants. Squaring both sides yields a quadratic equation with two distinct roots, but only one root is a valid solution to the original equation. Which of the following conditions definitively identifies that a root y is extraneous?",
        "choices": [
            f"y < -{c_var}",
            f"y > -{c_var}",
            f"y < {b_var}/{a_var}",
            f"y > -{b_var}/{a_var}"
        ],
        "correctAnswer": f"y < -{c_var}",
        "explanation": {
            "correct": f"The symbol √ denotes the principal (non-negative) square root. Therefore, for the original equation √({a_var}x + {b_var}) = x + {c_var} to be true, the right side must be non-negative: x + {c_var} ≥ 0, which means x ≥ -{c_var}. If squaring both sides introduces a root y such that y < -{c_var}, then y + {c_var} would be negative, making it impossible to equal a principal square root. Thus, y < -{c_var} guarantees the root is extraneous.",
            "distractors": {
                f"y > -{c_var}": "This is the condition for a root to potentially be VALID, not extraneous.",
                f"y < {b_var}/{a_var}": "Confuses the domain of the square root (which is x ≥ -b/a) with the condition for the output being positive.",
                f"y > -{b_var}/{a_var}": "This is simply the domain requirement for the expression under the radical to be positive, not the test for an extraneous root."
            }
        },
        "metadata": {
            "cognitiveMove": "Analyze domain and range restrictions of principal square roots.",
            "trapTypes": ["Logical Reversal", "Domain vs Range Confusion"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 7: Systems of Nonlinear Equations
for a_var, b_var, c_var in [('a','b','c'), ('p','q','r'), ('m','n','k'), ('u','v','w'), ('c','d','h')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The system consisting of the equations y = {a_var}x² and y = {b_var}x² + {c_var} has exactly two distinct real solutions. If {a_var}, {b_var}, and {c_var} are constants such that {a_var} > {b_var}, which of the following must be true?",
        "choices": [
            f"{c_var} > 0",
            f"{c_var} < 0",
            f"{c_var} = 0",
            f"{c_var} = {a_var} - {b_var}"
        ],
        "correctAnswer": f"{c_var} > 0",
        "explanation": {
            "correct": f"To find intersections, set the equations equal: {a_var}x² = {b_var}x² + {c_var}. Rearranging gives ({a_var} - {b_var})x² = {c_var}. We are given that {a_var} > {b_var}, so ({a_var} - {b_var}) is a strictly positive number. For the equation x² = {c_var} / ({a_var} - {b_var}) to have exactly two distinct real solutions for x, the right side must be strictly positive. Since the denominator is positive, the numerator {c_var} must also be positive: {c_var} > 0.",
            "distractors": {
                f"{c_var} < 0": "If c was negative, a positive number times x² would equal a negative number, yielding zero real solutions.",
                f"{c_var} = 0": "If c was zero, x² would equal 0, yielding exactly one real solution (x=0).",
                f"{c_var} = {a_var} - {b_var}": "This is a specific possible value for c (yielding x = ±1), but not a universally required condition."
            }
        },
        "metadata": {
            "cognitiveMove": "Algebraically isolate x² and use inequality constraints to determine parameter signs.",
            "trapTypes": ["Inequality Reversal", "False Specificity"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 8: Exponential Exponents Manipulation
for a_var, b_var, c_var, m_var, n_var in [('a','b','c','m','n'), ('p','q','r','v','w'), ('x','y','z','u','k'), ('b','c','d','A','B'), ('r','s','t','P','Q')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The expression {a_var}^({b_var}x + {c_var}) can be rewritten in the form {m_var} · ({n_var})ˣ for all values of x. What is the value of {m_var} in terms of {a_var} and {c_var}?",
        "choices": [
            f"{a_var}^{c_var}",
            f"{a_var}^{b_var}",
            f"{a_var} · {c_var}",
            f"{c_var}^{a_var}"
        ],
        "correctAnswer": f"{a_var}^{c_var}",
        "explanation": {
            "correct": f"Using the laws of exponents, addition in the exponent implies multiplication of bases: {a_var}^({b_var}x + {c_var}) = {a_var}^({b_var}x) · {a_var}^{c_var}. By the power of a power rule, {a_var}^({b_var}x) = ({a_var}^{b_var})ˣ. So the expression becomes {a_var}^{c_var} · ({a_var}^{b_var})ˣ. Comparing this to the target form {m_var} · ({n_var})ˣ, we see that the constant multiplier {m_var} corresponds to {a_var}^{c_var}, and the base {n_var} corresponds to {a_var}^{b_var}.",
            "distractors": {
                f"{a_var}^{b_var}": "This corresponds to n, the base of the exponential function, not the constant multiplier m.",
                f"{a_var} · {c_var}": "Misapplied exponent rules, treating an exponent as a regular multiplication.",
                f"{c_var}^{a_var}": "Swapped the base and exponent."
            }
        },
        "metadata": {
            "cognitiveMove": "Deconstruct exponential expressions using exponent addition and multiplication rules.",
            "trapTypes": ["Variable Misidentification", "Exponent Rule Error"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 9: Transformations
for d_var, a_var, h_var, k_var in [('d','a','h','k'), ('p','m','n','q'), ('c','b','r','s'), ('v','w','z','u'), ('r','p','c','d')]:
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The graph of y = f(x) has an x-intercept at ({d_var}, 0). The function g is defined by g(x) = {a_var} · f(x - {h_var}) + {k_var}, where {a_var}, {h_var}, and {k_var} are constants. If it is known that {k_var} = 0 and {a_var} ≠ 0, what is the corresponding x-intercept of the graph of y = g(x)?",
        "choices": [
            f"({d_var} + {h_var}, 0)",
            f"({d_var} - {h_var}, 0)",
            f"({a_var}{d_var} + {h_var}, 0)",
            f"({d_var} / {a_var} + {h_var}, 0)"
        ],
        "correctAnswer": f"({d_var} + {h_var}, 0)",
        "explanation": {
            "correct": f"To find the x-intercept of g(x), we set g(x) = 0. Since {k_var} = 0, the equation becomes {a_var} · f(x - {h_var}) = 0. Dividing by {a_var} (since {a_var} ≠ 0) gives f(x - {h_var}) = 0. We know that the function f outputs 0 when its input is {d_var}. Therefore, we set the input of f to {d_var}: x - {h_var} = {d_var}. Solving for x yields x = {d_var} + {h_var}. The x-intercept is ({d_var} + {h_var}, 0).",
            "distractors": {
                f"({d_var} - {h_var}, 0)": "Applied the horizontal shift in the wrong direction (a common error when transforming f(x - h)).",
                f"({a_var}{d_var} + {h_var}, 0)": "Incorrectly multiplied the original x-intercept by the vertical stretch factor a.",
                f"({d_var} / {a_var} + {h_var}, 0)": "Confused horizontal and vertical transformations, applying the vertical stretch a as a horizontal compression."
            }
        },
        "metadata": {
            "cognitiveMove": "Map the zero of a base function through horizontal and vertical transformations.",
            "trapTypes": ["Transformation Direction Error", "Stretch/Shift Confusion"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 10: Polynomial Remainder Theorem (SPR)
for b_val, c_val in [(5, 7), (3, 2), (8, 4), (2, 9), (6, 5)]:
    r1 = 2*b_val + c_val - 4
    r2 = b_val + c_val - 2
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "SPR",
        "prompt": f"When the polynomial p(x) = x³ - 3x² + bx + c is divided by (x - 2), the remainder is {r1}. When p(x) is divided by (x - 1), the remainder is {r2}. What is the value of the constant b?",
        "correctAnswer": str(b_val),
        "explanation": {
            "correct": f"By the Polynomial Remainder Theorem, p(2) = {r1} and p(1) = {r2}.\nFirst, substitute x = 2: p(2) = (2)³ - 3(2)² + b(2) + c = 8 - 12 + 2b + c = 2b + c - 4. Thus, 2b + c - 4 = {r1}, so 2b + c = {r1 + 4}.\nSecond, substitute x = 1: p(1) = (1)³ - 3(1)² + b(1) + c = 1 - 3 + b + c = b + c - 2. Thus, b + c - 2 = {r2}, so b + c = {r2 + 2}.\nSubtracting the second equation from the first: (2b + c) - (b + c) = {r1 + 4} - {r2 + 2}, which simplifies to b = {b_val}.",
            "distractors": {}
        },
        "metadata": {
            "cognitiveMove": "Apply the Remainder Theorem twice to generate a system of linear equations to solve for a coefficient.",
            "trapTypes": ["System of Equations Error", "Sign Error"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 11: Exponential Decay Base (SPR)
for h_val in [10, 14, 26, 38, 42]:
    k_val = h_val // 2
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "SPR",
        "prompt": f"The population of a bacteria colony is modeled by the function P(t) = P₀ · 4^(t/{h_val}), where P₀ is the initial population and t is the time in hours. If the model is rewritten in the equivalent form P(t) = P₀ · 2^(t/k), what is the value of the constant k?",
        "correctAnswer": str(k_val),
        "explanation": {
            "correct": f"We are given the exponential term 4^(t/{h_val}). We need to rewrite the base from 4 to 2. Since 4 = 2², we can substitute this into the expression: (2²)^(t/{h_val}). By the power of a power rule, we multiply the exponents: 2^(2t/{h_val}). This simplifies to 2^(t/({h_val}/2)) = 2^(t/{k_val}). Setting this equal to 2^(t/k), we see that k = {k_val}.",
            "distractors": {}
        },
        "metadata": {
            "cognitiveMove": "Convert exponential bases and match corresponding denominators in rational exponents.",
            "trapTypes": ["Exponent Rule Error", "Fraction Division Error"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Group 12: Nonlinear System Solutions (SPR)
for S, P, m, b_val in [(4, 3, 2, 1), (5, 2, 3, 4), (6, 5, 2, 3), (7, 4, 3, 2), (8, 6, 2, 5)]:
    ans = m*(S + m) + 2*b_val
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Nonlinear functions",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "SPR",
        "prompt": f"The graphs of y = x² - {S}x + {P} and y = {m}x + {b_val} intersect at the points (x₁, y₁) and (x₂, y₂). What is the value of y₁ + y₂?",
        "correctAnswer": str(ans),
        "explanation": {
            "correct": f"To find the intersection points, set the equations equal: x² - {S}x + {P} = {m}x + {b_val}. Rearranging gives x² - ({S+m})x + ({P-b_val}) = 0. The sum of the x-coordinates of the intersection points is x₁ + x₂. By Vieta's formulas, the sum of the roots is the negative of the x coefficient, so x₁ + x₂ = {S+m}.\nSince the points lie on the line y = {m}x + {b_val}, we know y₁ = {m}x₁ + {b_val} and y₂ = {m}x₂ + {b_val}. Therefore, y₁ + y₂ = ({m}x₁ + {b_val}) + ({m}x₂ + {b_val}) = {m}(x₁ + x₂) + 2({b_val}).\nSubstitute x₁ + x₂ = {S+m} into the equation: y₁ + y₂ = {m}({S+m}) + {2*b_val} = {ans}.",
            "distractors": {}
        },
        "metadata": {
            "cognitiveMove": "Use Vieta's formulas to find the sum of x-coordinates, then map linearly to find the sum of y-coordinates without explicitly solving for intersections.",
            "trapTypes": ["Brute Force Calculation Trap", "Algebraic Error"],
            "sourceSignalId": "antigravity-1600-math-advanced3",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)


# Saving to JSON
bank_path = os.path.join(r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT", "data", "antigravity-bank.json")
os.makedirs(os.path.dirname(bank_path), exist_ok=True)

if os.path.exists(bank_path):
    with open(bank_path, "r", encoding="utf-8") as f:
        try:
            bank = json.load(f)
        except json.JSONDecodeError:
            bank = []
else:
    bank = []

bank.extend(questions)

with open(bank_path, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Generated {len(questions)} questions.")
mcq_count = sum(1 for q in questions if q['type'] == 'MCQ')
spr_count = sum(1 for q in questions if q['type'] == 'SPR')
print(f"MCQ: {mcq_count}, SPR: {spr_count}")
print(f"Total in bank: {len(bank)}")
