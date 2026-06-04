import json, os

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
BANK_PATH = os.path.join(DATA_DIR, "antigravity-bank.json")

def validate_q(q):
    errors = []
    if q.get("type") != "MCQ":
        errors.append("Not MCQ")
    
    expl = q.get("explanation", {}).get("correct", "")
    if len(expl) < 200:
        errors.append(f"Explanation too short ({len(expl)} chars)")
    
    dual_keywords = ["Fast", "Slow", "Step", "Method"]
    if not any(k in expl for k in dual_keywords):
        errors.append("Missing dual-path keywords")
    
    draft_markers = ["Hmm", "Wait", "Let me", "Actually", "Redesign"]
    for m in draft_markers:
        if m in json.dumps(q, ensure_ascii=False):
            errors.append(f"Contains draft marker '{m}'")
            break
            
    if "choices" in q:
        letters = [c.get("letter") for c in q["choices"]]
        correct = q.get("correctAnswer")
        if correct not in letters:
            errors.append(f"correctAnswer '{correct}' not in choices {letters}")
            
        dists = q.get("explanation", {}).get("distractors", {})
        expected = set(letters) - {correct}
        if set(dists.keys()) != expected:
            errors.append(f"Distractor keys {set(dists.keys())} do not match expected {expected}")
            
    return errors

inputs = [
r'''{
  "id": "antigravity-hard-algebra-systems-word-1",
  "section": "Math",
  "domain": "Algebra",
  "skill": "Systems of two linear equations in two variables",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "A metallurgist wants to make 120 grams of an alloy that is 45% silver by mass. She has two alloys available: Alloy A, which is 30% silver by mass, and Alloy B, which is 80% silver by mass. If she mixes the two alloys to create exactly the desired amount and concentration, how many more grams of Alloy A does she need to use than Alloy B?",
  "type": "MCQ",
  "choices": [
    {"letter": "A", "text": "48"},
    {"letter": "B", "text": "36"},
    {"letter": "C", "text": "84"},
    {"letter": "D", "text": "54"}
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Set up the system of equations. Let x be the mass of Alloy A and y be the mass of Alloy B. We have two conditions: total mass (x + y = 120) and silver mass (0.30x + 0.80y = 0.45 * 120). \nStep 2: Simplify the silver equation. 0.45 * 120 = 54, so 0.3x + 0.8y = 54. \nStep 3: Solve the system. Multiply the first equation by 0.3 to get 0.3x + 0.3y = 36. Subtract this from the silver equation to eliminate x: (0.8y - 0.3y) = 54 - 36, which gives 0.5y = 18. Solving for y gives y = 36. \nStep 4: Find x. Since x + y = 120, x = 120 - 36 = 84. \nStep 5: Answer the specific question asked. The question asks how many MORE grams of Alloy A are used than Alloy B. So, x - y = 84 - 36 = 48. \nFast Path: You can use the method of alligation to find the ratio of Alloy A to Alloy B. The difference between A (30%) and the target (45%) is 15. The difference between B (80%) and the target (45%) is 35. The required ratio of A to B is 35:15, or 7:3. Since the total parts are 10, each part is 120 / 10 = 12 grams. The difference is 7 - 3 = 4 parts. 4 * 12 = 48 grams. \nVerification: 84g of A (25.2g silver) + 36g of B (28.8g silver) = 120g total (54g silver, which is exactly 45%). 84 - 36 = 48.",
    "distractors": {
      "B": "This is the mass in grams of Alloy B required for the mixture (the value of y). The question asks for the difference in mass between Alloy A and Alloy B, not just the mass of Alloy B alone.",
      "C": "This is the mass in grams of Alloy A required for the mixture (the value of x). Students who select this trap successfully solved the system of equations but forgot to subtract the mass of Alloy B.",
      "D": "This represents the total mass of silver in the final 120-gram mixture (45% of 120 = 54). This is merely the right side of the silver concentration equation, not the difference in alloy masses."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Translate word problem into a system of equations",
      "Solve a linear system",
      "Calculate a relative difference instead of a direct variable"
    ],
    "trapTypes": [
      "Solving for the wrong variable",
      "Partial answer trap",
      "Misinterpreting the final question"
    ],
    "sourceSignalId": "antigravity-hard-algebra-systems-word"
  }
}''',
r'''{
  "id": "antigravity-hard-algebra-systems-param-1",
  "section": "Math",
  "domain": "Algebra",
  "skill": "Systems of two linear equations in two variables",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "(k - 1)x + 4y = 10\n3x + (k + 3)y = 15\n\nIn the given system of equations, k is a constant. If the system has no solution, what is the value of k?",
  "type": "MCQ",
  "choices": [
    {"letter": "A", "text": "-5"},
    {"letter": "B", "text": "3"},
    {"letter": "C", "text": "5"},
    {"letter": "D", "text": "-3"}
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Understand the condition for a system of linear equations to have no solution. The equations must represent parallel lines, which means their coefficients for x and y are proportional, but the constant terms are not. Mathematically, for A₁x + B₁y = C₁ and A₂x + B₂y = C₂, we need A₁/A₂ = B₁/B₂ ≠ C₁/C₂.\n\nFast Path: Set up the proportion for the x and y coefficients: (k - 1) / 3 = 4 / (k + 3).\nCross-multiply to get (k - 1)(k + 3) = 12.\nExpand the left side: k² + 2k - 3 = 12.\nSubtract 12 from both sides: k² + 2k - 15 = 0.\nFactor the quadratic equation: (k + 5)(k - 3) = 0, yielding potential solutions k = -5 and k = 3.\n\nVerification: We must check both values against the constant term ratio C₁/C₂ = 10 / 15 = 2/3.\nIf k = 3, the ratio A₁/A₂ is (3 - 1) / 3 = 2/3. Since A₁/A₂ = B₁/B₂ = C₁/C₂ (all equal 2/3), the lines are identical, yielding infinitely many solutions.\nIf k = -5, the ratio A₁/A₂ is (-5 - 1) / 3 = -6/3 = -2. Here, A₁/A₂ = B₁/B₂ = -2, which does not equal C₁/C₂ (2/3). The lines are parallel and distinct, resulting in no solution. Thus, k = -5 is the only correct answer.",
    "distractors": {
      "B": "This value makes the two lines identical (coincident), which results in infinitely many solutions, not no solution. Students who stop after finding the roots of k² + 2k - 15 = 0 without verifying the constant terms will fall into this trap.",
      "C": "This is the result of a sign error when factoring the quadratic k² + 2k - 15 = 0. A student might incorrectly factor it as (k - 5)(k + 3) = 0, leading to k = 5 instead of k = -5.",
      "D": "This arises from the same sign error as choice C, incorrectly factoring k² + 2k - 15 = 0 as (k - 5)(k + 3) = 0 and selecting the root k = -3 instead of k = 3."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Translate geometrical conditions to algebraic proportions",
      "Verify roots against a secondary constraint"
    ],
    "trapTypes": [
      "Failure to check extraneous solutions (infinitely many solutions trap)",
      "Sign error in factoring quadratics"
    ],
    "sourceSignalId": "antigravity-hard-algebra-systems-param"
  }
}''',
r'''{
  "id": "antigravity-hard-advmath-nlfunc-compose-1",
  "section": "Math",
  "domain": "Advanced Math",
  "skill": "Nonlinear functions",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "The function f is defined by f(x) = a(x - h)² + k, where a, h, and k are constants and a > 0. The function g is defined by g(x) = -3f(x/2 + 1) + 4. In the xy-plane, the graph of y = g(x) has a maximum value of 19 which occurs at x = 6. What is the value of h + k?",
  "type": "MCQ",
  "choices": [
    {"letter": "A", "text": "-1"},
    {"letter": "B", "text": "5"},
    {"letter": "C", "text": "9"},
    {"letter": "D", "text": "15"}
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Understand the vertex of the original function. The function f(x) = a(x - h)² + k is a parabola with its vertex at (h, k). Because a > 0, the parabola opens upward, meaning f(x) has a minimum value of k occurring exactly at x = h.\n\nStep 2: Analyze the vertical transformations for the new function g(x). We are given g(x) = -3f(x/2 + 1) + 4. Because the output of f(x) is multiplied by -3, the graph is reflected across the x-axis, which turns the minimum of f(x) into a maximum for g(x). The new maximum value of g(x) is achieved by applying these same vertical operations to the minimum value of f(x). Thus, the maximum of g is -3(k) + 4.\n\nStep 3: Determine the value of k. We are given the maximum value of g(x) is 19. Setting up the equation: -3k + 4 = 19. Subtracting 4 gives -3k = 15, so dividing by -3 yields k = -5.\n\nFast Path: To find h, we evaluate the horizontal transformation. The extremum of f(x) always occurs when its input is exactly h. For g(x), the expression inside f is (x/2 + 1). We are told the maximum for g(x) occurs at x = 6. Substituting x = 6 into this input expression must therefore equal h. Thus, h = 6/2 + 1 = 3 + 1 = 4.\n\nVerification: We have found h = 4 and k = -5. The question asks for the sum h + k, which evaluates to 4 + (-5) = -1. This matches choice A.",
    "distractors": {
      "B": "This trap happens if you incorrectly apply the horizontal transformation directly to the vertex's x-coordinate. A student might mistakenly set the new x-coordinate to h/2 + 1 = 6, yielding h = 10. Combined with the correct k = -5, h + k incorrectly becomes 5.",
      "C": "This trap occurs if you miscalculate the vertical transformation by ignoring the negative sign on the -3 multiplier. Setting 3k + 4 = 19 gives k = 5. With the correct h = 4, the sum h + k incorrectly becomes 4 + 5 = 9.",
      "D": "This trap is the result of making both common transformation errors simultaneously. Incorrectly solving h/2 + 1 = 6 gives h = 10, and mistakenly solving 3k + 4 = 19 gives k = 5. The sum of these completely incorrect values is 10 + 5 = 15."
    }
  },
  "metadata": {
    "cognitiveMove": ["Abstract formulation", "Reversing transformations"],
    "trapTypes": ["Direction of transformation error", "Sign error"],
    "sourceSignalId": "antigravity-hard-advmath-nlfunc-compose"
  }
}''',
r'''{
  "id": "antigravity-hard-algebra-linfunc-model-1",
  "section": "Math",
  "domain": "Algebra",
  "skill": "Linear functions",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "A commercial agricultural drone begins a flight with a full tank containing 60 liters of liquid fertilizer. The drone sprays the fertilizer at a constant rate of r liters per minute. After exactly 20 minutes of continuous spraying, the tank has lost 30% of its initial volume. At this point, the drone's software automatically increases the spray rate by 0.3 liters per minute for the remainder of the flight. Which of the following functions V(t) models the volume of fertilizer remaining in the tank, in liters, t minutes after the spray rate is increased?",
  "type": "MCQ",
  "choices": [
    {"letter": "A", "text": "V(t) = 42 - 1.2t"},
    {"letter": "B", "text": "V(t) = 42 - 0.9t"},
    {"letter": "C", "text": "V(t) = 60 - 1.2t"},
    {"letter": "D", "text": "V(t) = 18 - 2.4t"}
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Calculate the volume of fertilizer lost and the remaining volume in the tank. The tank loses 30% of its initial 60 liters. 0.30 × 60 = 18 liters lost. The remaining volume at this point is 60 - 18 = 42 liters. This represents the initial value, or y-intercept, for our new function V(t), meaning V(0) = 42.\nStep 2: Calculate the initial spray rate, r. The drone sprayed 18 liters over 20 minutes, so r = 18 / 20 = 0.9 liters per minute.\nStep 3: Determine the new spray rate. The rate increases by 0.3 liters per minute, so the new rate is 0.9 + 0.3 = 1.2 liters per minute. Because the volume is decreasing, the slope of the new linear model is -1.2.\nFast Path: Recognize immediately that the y-intercept must be the remaining volume (42 L). Only choices A and B have 42 as the intercept. Then, simply find the new rate (18/20 + 0.3 = 1.2) to identify A as the correct model.\nVerification: At t = 10 minutes after the rate increase, the drone will have sprayed 10 × 1.2 = 12 additional liters. The remaining volume should be 42 - 12 = 30 liters. Using our model V(t) = 42 - 1.2t, we get V(10) = 42 - 1.2(10) = 42 - 12 = 30, which confirms our model is perfectly accurate.",
    "distractors": {
      "B": "This trap successfully identifies the correct remaining volume (42 L) and calculates the initial spray rate (0.9 L/min) but fails to apply the 0.3 L/min rate increase required for the remainder of the flight.",
      "C": "This distractor correctly calculates the new spray rate of 1.2 L/min but incorrectly uses the original tank volume (60 L) as the y-intercept, completely ignoring the 18 liters that were already sprayed during the first 20 minutes.",
      "D": "This trap misinterprets 'lost 30%' as '30% remaining', incorrectly leaving 18 L as the intercept. It then calculates the initial rate as (60 - 18) / 20 = 2.1 L/min, and adds 0.3 to get a completely erroneous slope of -2.4."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Translating a piecewise real-world scenario into a linear model",
      "Calculating rates from percentage depletion over time"
    ],
    "trapTypes": [
      "Failure to update y-intercept for a shifted time domain",
      "Misinterpreting percentage lost as percentage remaining",
      "Forgetting to apply the parameter change (rate increase)"
    ],
    "sourceSignalId": "antigravity-hard-algebra-linfunc-model"
  }
}''',
r'''{
  "id": "antigravity-hard-advmath-equiv-rational-1",
  "section": "Math",
  "domain": "Advanced Math",
  "skill": "Equivalent expressions",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "For x > 4, which of the following is equivalent to the given expression?\n\n[ (3x² + 4x) / (x² - 16) - 2x / (x - 4) ] ÷ [ x² / (x + 4) ]",
  "type": "MCQ",
  "choices": [
    {
      "letter": "A",
      "text": "1 / x"
    },
    {
      "letter": "B",
      "text": "(x + 12) / (x² - 4x)"
    },
    {
      "letter": "C",
      "text": "x³ / (x + 4)²"
    },
    {
      "letter": "D",
      "text": "(x + 4) / (4x)"
    }
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Simplify the complex numerator. The denominators are x² - 16 and x - 4. Notice that x² - 16 factors to (x - 4)(x + 4). To get a common denominator, multiply the second fraction by (x + 4)/(x + 4):\n2x/(x - 4) = 2x(x + 4) / ((x - 4)(x + 4)) = (2x² + 8x) / (x² - 16).\nSubtract this from the first fraction:\n[(3x² + 4x) - (2x² + 8x)] / (x² - 16) = (x² - 4x) / (x² - 16).\nFactor the numerator and denominator: x(x - 4) / ((x - 4)(x + 4)). Cancel the common (x - 4) factor to get x / (x + 4).\n\nStep 2: Divide by the denominator of the main expression.\nDividing by x²/(x + 4) is equivalent to multiplying by its reciprocal, (x + 4)/x².\n[x / (x + 4)] * [(x + 4) / x²] = x / x² = 1 / x.\n\nFast Path: Substitute a valid value for x. Let x = 5. The numerator evaluates to (75 + 20)/(25 - 16) - 10/1 = 95/9 - 10 = 5/9. The denominator evaluates to 25/(5 + 4) = 25/9. Dividing the two gives (5/9) / (25/9) = 1/5. Testing x = 5 in the choices, only 1/x yields 1/5.\n\nVerification: By analyzing algebraically and testing a sample value, we can verify that the expression simplifies precisely to 1/x.",
    "distractors": {
      "B": "This trap occurs if you misapply the negative sign when distributing -2x into (x + 4), incorrectly yielding -2x² + 8x instead of -2x² - 8x. This error results in a numerator of x² + 12x, which leads directly to this incorrect choice.",
      "C": "This trap is the result of multiplying the simplified numerator by the bottom fraction instead of dividing by it. The student correctly finds x/(x + 4) but then erroneously multiplies by x²/(x + 4) instead of taking the reciprocal.",
      "D": "This error stems from \"illegal cancellation.\" A student might reach (x² - 4x) / (x² - 16) and incorrectly cross out the x² terms, leaving -4x / -16 = x / 4. Dividing x/4 by x²/(x + 4) results in the expression (x + 4) / 4x."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Determine common denominator for rational expressions",
      "Factor polynomials to simplify fractions",
      "Multiply by the reciprocal to divide rational expressions"
    ],
    "trapTypes": [
      "Sign error during distribution",
      "Inverting operations (multiplying instead of dividing)",
      "Illegal cancellation of terms in polynomials"
    ],
    "sourceSignalId": "antigravity-hard-advmath-equiv-rational"
  }
}''',
r'''{
  "id": "antigravity-hard-advmath-nonlineq-extran-1",
  "section": "Math",
  "domain": "Advanced Math",
  "skill": "Nonlinear equations in one variable and systems of equations in two variables",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "2x - √(30 - 6x) = 4\n\nWhat is the sum of the solutions to the given equation?",
  "type": "MCQ",
  "choices": [
    {"letter": "A", "text": "7/2"},
    {"letter": "B", "text": "5/2"},
    {"letter": "C", "text": "-1"},
    {"letter": "D", "text": "-5/2"}
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Isolate the radical by moving terms to get √(30 - 6x) = 2x - 4.\n\nStep 2: Square both sides of the equation to eliminate the square root. \n(√(30 - 6x))² = (2x - 4)²\n30 - 6x = 4x² - 16x + 16\n\nStep 3: Rearrange the equation into standard quadratic form (ax² + bx + c = 0).\n4x² - 10x - 14 = 0\nDivide the entire equation by 2 to simplify:\n2x² - 5x - 7 = 0\n\nStep 4: Factor the quadratic to find the potential solutions.\n(2x - 7)(x + 1) = 0\nThis gives x = 7/2 and x = -1 as the potential solutions.\n\nVerification: Because squaring both sides of an equation can introduce extraneous solutions, we must substitute both potential roots back into the original equation to check their validity.\n\nFor x = 7/2:\n2(7/2) - √(30 - 6(7/2)) = 7 - √(30 - 21) = 7 - √9 = 7 - 3 = 4. This is valid.\n\nFor x = -1:\n2(-1) - √(30 - 6(-1)) = -2 - √(30 + 6) = -2 - √36 = -2 - 6 = -8. This does not equal 4, making x = -1 an extraneous solution.\n\nSince x = 7/2 is the only valid solution, the sum of all valid solutions is simply 7/2.",
    "distractors": {
      "B": "This is the sum of the roots of the intermediate quadratic equation (2x² - 5x - 7 = 0). Using the sum of roots shortcut (-b/a) yields 5/2, but this completely ignores the need to check for and remove the extraneous solution x = -1.",
      "C": "This is the extraneous solution introduced by squaring both sides of the equation. It does not satisfy the original equation and therefore cannot be the sum of the valid solutions.",
      "D": "This is the negative sum of the roots of the intermediate quadratic. A student might arrive here by incorrectly applying the sum of roots formula as b/a while also failing to reject the extraneous solution."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Isolate and square",
      "Factor quadratic",
      "Verify extraneous solutions"
    ],
    "trapTypes": [
      "Extraneous solution inclusion",
      "Unverified -b/a sum of roots formula"
    ],
    "sourceSignalId": "antigravity-hard-advmath-nonlineq-extran"
  }
}''',
r'''{
  "id": "antigravity-hard-advmath-nlfunc-exponential-1",
  "section": "Math",
  "domain": "Advanced Math",
  "skill": "Nonlinear functions",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "An environmental agency models the population of a certain species of fish in a lake. The population is estimated to decrease by p percent every 6 years. The function P(t) = 4500(0.49)^(t/12) gives the estimated population of the fish t years after the agency began monitoring. What is the value of p?",
  "type": "MCQ",
  "choices": [
    {
      "letter": "A",
      "text": "30"
    },
    {
      "letter": "B",
      "text": "49"
    },
    {
      "letter": "C",
      "text": "51"
    },
    {
      "letter": "D",
      "text": "70"
    }
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Understand the structure of the exponential decay function. The function P(t) = 4500(0.49)^(t/12) calculates the population t years after monitoring began. To find the percentage decrease over a 6-year period, we need to determine the ratio of the population after 6 years to the initial population.\n\nStep 2: Evaluate the decay factor for a 6-year period. Substitute t = 6 into the exponent of the decay model. The exponent becomes 6/12, which simplifies to 1/2.\n\nStep 3: Calculate the multiplier. The base is 0.49, so we evaluate (0.49)^(1/2). This is equivalent to the square root of 0.49, which is 0.70. This means that every 6 years, the population is multiplied by 0.70.\n\nStep 4: Convert the multiplier to a percentage decrease. A multiplier of 0.70 indicates that 70% of the population remains after 6 years. To find the percentage decrease, subtract the remaining percentage from 100%.\n100% - 70% = 30%.\n\nFast Path: Evaluate the decay factor at t = 6 to get (0.49)^(6/12) = 0.7. A multiplier of 0.7 corresponds to a 1 - 0.7 = 0.3, or a 30% decrease. Thus, the value of p is 30.",
    "distractors": {
      "B": "This represents the numerical value of the base 0.49. A student selecting this trap incorrectly assumes the base itself directly states the percentage decrease, completely ignoring the exponent t/12 and how multipliers translate to percentages.",
      "C": "This is calculated as 100 - 49 = 51. A student might incorrectly assume that the base 0.49 represents the multiplier for a 6-year period instead of a 12-year period, leading them to conclude the population decreases by 51%.",
      "D": "This is the percentage of the population that remains after 6 years (since the multiplier is 0.7, or 70%). The question asks for the percentage decrease p, not the percentage remaining, which requires subtracting 70 from 100."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Interpret parts of an exponential function",
      "Apply fractional exponents",
      "Convert between a multiplier and a percentage decrease"
    ],
    "trapTypes": [
      "Misinterpreting the base as the parameter of interest",
      "Confusing percentage remaining with percentage decrease",
      "Ignoring the exponent scaling factor"
    ],
    "sourceSignalId": "antigravity-hard-advmath-nlfunc-exponential"
  }
}''',
r'''{
  "id": "antigravity-hard-advmath-systems-nonlinear2-1",
  "section": "Math",
  "domain": "Advanced Math",
  "skill": "Systems of equations in two variables",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "x² + y² - 4x - 2y = c\n5x - 12y = 24\n\nIn the given system of equations, c is a constant. If the system has exactly one distinct real solution, what is the value of c?",
  "type": "MCQ",
  "choices": [
    {"letter": "A", "text": "-3"},
    {"letter": "B", "text": "-1"},
    {"letter": "C", "text": "4"},
    {"letter": "D", "text": "9"}
  ],
  "correctAnswer": "B",
  "explanation": {
    "correct": "Step 1: Understand the geometric meaning of the system having \"exactly one distinct real solution.\" The first equation represents a circle, and the second represents a line. For them to intersect at exactly one point, the line must be tangent to the circle. This means the perpendicular distance from the center of the circle to the line must exactly equal the circle's radius.\n\nStep 2: Find the center and radius (in terms of c) of the circle. Complete the square for the x and y terms in the first equation:\nx² - 4x + 4 + y² - 2y + 1 = c + 4 + 1\n(x - 2)² + (y - 1)² = c + 5\nThe circle has its center at (2, 1) and its radius squared is r² = c + 5.\n\nStep 3: Calculate the perpendicular distance from the center (2, 1) to the line 5x - 12y - 24 = 0. Use the point-to-line distance formula d = |Ax₁ + By₁ + C| / √(A² + B²):\nd = |5(2) - 12(1) - 24| / √(5² + (-12)²)\nd = |10 - 12 - 24| / √(25 + 144)\nd = |-26| / 13 = 2.\nBecause the line is tangent to the circle, the radius r must be 2. Therefore, r² = 4.\n\nStep 4: Solve for c.\nWe established that r² = c + 5. Substituting r² = 4 gives:\n4 = c + 5\nc = -1.\n\nFast Path: Alternatively, solve the linear equation for x: x = (12y + 24) / 5. Substitute this into the circle's equation to form a single-variable quadratic in y. Multiply by 25 to clear denominators, yielding 169y² + 286y + 96 - 25c = 0. For the system to have exactly one solution, the discriminant (b² - 4ac) must equal 0. Setting 286² - 4(169)(96 - 25c) = 0 and dividing by 169 gives 22² - 4(96 - 25c) = 0, which simplifies to 484 - 384 + 100c = 0. Solving 100c = -100 yields c = -1.\n\nVerification: If c = -1, the circle is (x - 2)² + (y - 1)² = 4. The substitution results in 169y² + 286y + 121 = 0, factoring perfectly as (13y + 11)² = 0, which confirms exactly one distinct real solution exists at y = -11/13.",
    "distractors": {
      "A": "This occurs if you correctly determine the radius r = 2, but mistakenly set c = r - 5 instead of c = r² - 5, forgetting that the standard equation of a circle requires the radius to be squared.",
      "C": "This is a trap for students who assume the constant c on the right side of the equation directly equals the squared radius r² (which is 4), failing to account for the constants added when completing the square.",
      "D": "This results from a sign error after completing the square. If you incorrectly evaluate the constant terms or erroneously add the completed square constants (4 and 1) to the radius squared instead of subtracting them, you arrive at c = 4 + 5 = 9."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Translating an algebraic solution count into a geometric tangency condition",
      "Completing the square to extract circle center and radius parametrically",
      "Applying the discriminant (b² - 4ac = 0) to a parameterized quadratic equation"
    ],
    "trapTypes": [
      "Sign error in completing the square",
      "Failing to square the radius when mapping to the circle equation",
      "Equating the raw constant c directly to r² without adjusting for completed square constants"
    ],
    "sourceSignalId": "antigravity-hard-advmath-systems-nonlinear2"
  }
}''',
r'''{
  "id": "antigravity-hard-advmath-nonlineq-discrim-1",
  "section": "Math",
  "domain": "Advanced Math",
  "skill": "Nonlinear equations in one variable and systems of equations in two variables",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "In the xy-plane, the graph of the parabola y = px² - 10x + 5 and the line y = 2x - p have no points of intersection. If p is a constant, which of the following inequalities best describes all possible values of p?",
  "type": "MCQ",
  "choices": [
    {
      "letter": "A",
      "text": "p < -9 or p > 4"
    },
    {
      "letter": "B",
      "text": "-9 < p < 4"
    },
    {
      "letter": "C",
      "text": "p < -4 or p > 9"
    },
    {
      "letter": "D",
      "text": "-4 < p < 9"
    }
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Set the two equations equal to each other to find their intersection points:\npx² - 10x + 5 = 2x - p\n\nStep 2: Rearrange the equation into standard quadratic form (ax² + bx + c = 0):\npx² - 12x + (p + 5) = 0\n\nStep 3: For the graphs to have no points of intersection, the quadratic equation must have no real solutions. This means the discriminant (b² - 4ac) must be strictly less than zero.\n\nStep 4: Set up the discriminant inequality:\n(-12)² - 4(p)(p + 5) < 0\n144 - 4p² - 20p < 0\n\nStep 5: Divide the entire inequality by -4. Remember that dividing by a negative number flips the inequality sign!\np² + 5p - 36 > 0\n\nStep 6: Factor the quadratic expression:\n(p + 9)(p - 4) > 0\n\nStep 7: Determine the intervals where the product is positive. The roots are p = -9 and p = 4. Since the parabola for this inequality opens upward, the expression is positive outside the roots, giving p < -9 or p > 4.\n\nFast Path: Equating the two yields px² - 12x + p + 5 = 0. No intersections means the discriminant is negative, so 144 - 4p(p + 5) < 0. Simplifying gives p² + 5p - 36 > 0, which factors to (p + 9)(p - 4) > 0, directly leading to p < -9 or p > 4.\n\nVerification: Test p = 5 (which falls in p > 4). The equation becomes 5x² - 12x + 10 = 0. The discriminant is 144 - 4(5)(10) = -56, which is negative, confirming there are no real solutions and therefore no intersection points.",
    "distractors": {
      "B": "This represents the interval where the discriminant is positive (-9 < p < 4, excluding p = 0). A student choosing this likely forgot to flip the inequality sign when dividing by -4, solving for two intersections instead of none.",
      "C": "A student choosing this likely made a sign error when factoring the quadratic inequality. Instead of factoring p² + 5p - 36 as (p + 9)(p - 4), they may have incorrectly factored it as (p - 9)(p + 4) > 0, leading to the incorrect roots 9 and -4.",
      "D": "This choice combines two common errors: forgetting to flip the inequality sign when dividing by -4 (solving for two intersections instead of none), and making a sign error when factoring the resulting quadratic expression."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Abstract modeling",
      "Analyzing discriminant constraints"
    ],
    "trapTypes": [
      "Inequality sign flip error",
      "Factoring sign error"
    ],
    "sourceSignalId": "antigravity-hard-advmath-nonlineq-discrim"
  }
}''',
r'''{
  "id": "antigravity-hard-algebra-ineq-region-1",
  "section": "Math",
  "domain": "Algebra",
  "skill": "Linear inequalities in one or two variables",
  "difficulty": "Hard",
  "targetBand": "SAT-1600",
  "prompt": "In the xy-plane, a shaded region represents the solution set to the system of inequalities:\n\ny ≤ -2x + b\ny ≥ 0.5x - 3\nx ≥ 0\n\nIf b is a constant such that b > -3 and the area of the shaded region is 45 square units, what is the value of b?",
  "type": "MCQ",
  "choices": [
    {
      "letter": "A",
      "text": "12"
    },
    {
      "letter": "B",
      "text": "18"
    },
    {
      "letter": "C",
      "text": "3"
    },
    {
      "letter": "D",
      "text": "15"
    }
  ],
  "correctAnswer": "A",
  "explanation": {
    "correct": "Step 1: Identify the shape and boundary lines of the shaded region. The region is bounded on the left by the y-axis (x = 0), above by the line y = -2x + b, and below by the line y = 0.5x - 3. Because the region is closed on the left by the y-axis and the two boundary lines intersect on the right, it forms a triangle.\n\nStep 2: Determine the base of the triangle along the y-axis. The y-intercepts of the boundary lines are (0, b) and (0, -3). Since the problem states b > -3, the length of the base is the difference between these intercepts: b - (-3) = b + 3.\n\nStep 3: Find the height of the triangle by determining the x-coordinate of the intersection point of the two lines. Set the equations equal to find the intersection: -2x + b = 0.5x - 3. Solving for x gives 2.5x = b + 3, so x = (b + 3) / 2.5 = 0.4(b + 3). The horizontal height of the triangle is 0.4(b + 3).\n\nStep 4: Use the area formula for a triangle, Area = (1/2) × base × height. Substitute the known values: 45 = 0.5 × (b + 3) × 0.4(b + 3). This simplifies to 45 = 0.2(b + 3)².\n\nStep 5: Solve for b. Dividing both sides by 0.2 yields 225 = (b + 3)². Taking the square root of both sides gives b + 3 = 15 (we take the positive root since b > -3). Thus, b = 12.\n\nFast Path: The region forms a triangle with its base on the y-axis. Base = b + 3. The height is the x-coordinate where the lines intersect: 2.5x = b + 3 → x = 0.4(b + 3). Area = 0.5 × base × height = 0.2(b + 3)². Setting this to 45 yields (b + 3)² = 225, meaning b + 3 = 15, so b = 12.\n\nVerification: If b = 12, the base is 12 - (-3) = 15. The intersection is at -2x + 12 = 0.5x - 3 → 2.5x = 15 → x = 6. Area = 0.5 × 15 × 6 = 45. This confirms the value of b is 12.",
    "distractors": {
      "B": "This is a trap resulting from a sign error when calculating the length of the base. If you incorrectly compute the distance between the y-intercepts as b - 3 instead of b - (-3) = b + 3, you get an area equation of 0.2(b - 3)² = 45, leading directly to b = 18.",
      "C": "This distractor occurs if you make an algebraic error when isolating x for the intersection point. If you rewrite 2.5x = b + 3 as x = 2.5(b + 3) instead of dividing by 2.5, the area equation becomes 1.25(b + 3)² = 45, which incorrectly yields b = 3.",
      "D": "This incorrect answer comes from ignoring the -3 constant in the second inequality and assuming the line passes through the origin (y ≥ 0.5x). This changes the base to b and the height to 0.4b, giving an area of 0.2b² = 45, which incorrectly leads to b = 15."
    }
  },
  "metadata": {
    "cognitiveMove": [
      "Translate geometric conditions (area) into an algebraic equation",
      "Determine intersection points of linear equations with parameters",
      "Calculate the distance between points on an axis to find a base length"
    ],
    "trapTypes": [
      "Sign error in distance calculation",
      "Algebraic manipulation error when isolating variables",
      "Omission of a constant term when modeling equations"
    ],
    "sourceSignalId": "antigravity-hard-algebra-ineq-region"
  }
}'''
]

valid_count = 0
try:
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        bank = json.load(f)
except Exception:
    bank = []

for raw in inputs:
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1:
        q = json.loads(raw[start:end+1])
        errs = validate_q(q)
        if not errs:
            bank.append(q)
            valid_count += 1
            print(f"PASS: {q['id']}")
        else:
            print(f"FAIL: {q['id']}")
            for e in errs:
                print(f"  - {e}")

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)
    
print(f"\nAdded {valid_count} valid questions. Bank total: {len(bank)}")
