"""
Batch B3 – Discriminant & Parameter Analysis
50 Hard SAT Math questions (38 MCQ + 12 SPR)
Domain: Advanced Math | Skill: Nonlinear equations in one variable
"""

import json, uuid, pathlib

OUT = pathlib.Path(r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\batch_B3.json")
DOMAIN = "Advanced Math"
SKILL  = "Nonlinear equations in one variable"
SIGNAL = "antigravity-hard-advmath-nonlineq-discrim"

def uid():
    return f"antigravity-hard-{uuid.uuid4().hex[:8]}"

def mcq(prompt, choices_text, correct, expl, dB, dC, dD, cog, traps):
    L = ["A","B","C","D"]
    return {
        "id": uid(), "section": "Math", "domain": DOMAIN, "skill": SKILL,
        "difficulty": "Hard", "targetBand": "SAT-1600",
        "prompt": prompt, "type": "MCQ",
        "choices": [{"letter": L[i], "text": choices_text[i]} for i in range(4)],
        "correctAnswer": correct,
        "explanation": {"correct": expl, "distractors": {"B": dB, "C": dC, "D": dD}},
        "metadata": {"cognitiveMove": cog, "trapTypes": traps, "sourceSignalId": SIGNAL}
    }

def spr(prompt, ans, acceptable, expl, cog, traps):
    return {
        "id": uid(), "section": "Math", "domain": DOMAIN, "skill": SKILL,
        "difficulty": "Hard", "targetBand": "SAT-1600",
        "prompt": prompt, "type": "SPR",
        "correctAnswer": ans, "acceptableAnswers": acceptable,
        "explanation": {"correct": expl},
        "metadata": {"cognitiveMove": cog, "trapTypes": traps, "sourceSignalId": SIGNAL}
    }

Q = []

# ── MCQ 1 ──────────────────────────────────────────────
Q.append(mcq(
    "For what value of k does the equation x² + kx + 9 = 0 have exactly one real solution?",
    ["±6", "6", "3", "9"],
    "A",
    "Δ = k² − 36 = 0 ⇒ k² = 36 ⇒ k = ±6. Completing the square: (x + a)² = x² + 2ax + a², so a² = 9 ⇒ a = ±3 ⇒ k = 2a = ±6.",
    "Partial answer – takes only k = 6, ignoring k = −6.",
    "Square-root confusion – uses k = √9 = 3, confusing the constant term with the coefficient.",
    "Coefficient confusion – sets k = 9 by equating the constant directly.",
    "Recognise Δ = 0 yields k² = 36, requiring both ± roots.",
    ["incomplete case analysis", "sign neglect"]
))

# ── MCQ 2 ──────────────────────────────────────────────
Q.append(mcq(
    "The equation x² − 6x + k = 0 has two distinct real solutions. Which of the following could be a value of k?",
    ["8", "9", "10", "12"],
    "A",
    "Δ = 36 − 4k > 0 ⇒ k < 9. Among the choices only k = 8 satisfies k < 9. Completing the square: (x − 3)² = 9 − k > 0 ⇒ k < 9.",
    "Boundary error – k = 9 gives Δ = 0 (one repeated root, not two distinct).",
    "Direction error – k = 10 makes Δ < 0, giving no real solutions.",
    "Direction error – k = 12 makes Δ even more negative.",
    "Translate 'two distinct real solutions' into strict inequality Δ > 0.",
    ["boundary inclusion error", "inequality direction"]
))

# ── MCQ 3 ──────────────────────────────────────────────
Q.append(mcq(
    "For which value of k does the equation 2x² + 4x + k = 0 have no real solutions?",
    ["3", "2", "1", "−1"],
    "A",
    "Δ = 16 − 8k. No real solutions: Δ < 0 ⇒ k > 2. Only k = 3 satisfies this. Dividing by 2: (x + 1)² = 1 − k/2 < 0 ⇒ k > 2.",
    "Boundary error – k = 2 gives Δ = 0, exactly one solution.",
    "Insufficient – k = 1 gives Δ = 8 > 0, two real solutions.",
    "Sign error – k = −1 gives Δ = 24 > 0, two real solutions.",
    "Compute discriminant of a non-monic quadratic and solve the resulting inequality.",
    ["forgetting coefficient of x²", "boundary inclusion error"]
))

# ── MCQ 4 ──────────────────────────────────────────────
Q.append(mcq(
    "The roots of 3x² − 12x + k = 0 sum to 4. What is the product of the roots?",
    ["k/3", "k", "3k", "12/k"],
    "A",
    "Vieta's: sum = −b/a = 12/3 = 4 ✓, product = c/a = k/3. Alternatively, expanding 3(x − r)(x − s) shows the constant is 3rs = k, so rs = k/3.",
    "Coefficient neglect – forgets to divide by a = 3, giving product = k.",
    "Inversion error – multiplies by a instead of dividing, giving 3k.",
    "Formula confusion – inverts the relationship, using 12/k.",
    "Apply Vieta's product formula c/a and resist ignoring the leading coefficient.",
    ["leading coefficient neglect", "formula inversion"]
))

# ── MCQ 5 ──────────────────────────────────────────────
Q.append(mcq(
    "The line y = 2x + k is tangent to the parabola y = x². What is the value of k?",
    ["−1", "1", "0", "−4"],
    "A",
    "Set x² = 2x + k ⇒ x² − 2x − k = 0. Tangency: Δ = 4 + 4k = 0 ⇒ k = −1. Alternatively: slope y' = 2x = 2 ⇒ x = 1, y = 1, so k = 1 − 2 = −1.",
    "Sign error – solves 4 + 4k = 0 but drops the negative, getting k = 1.",
    "Oversight – assumes the tangent passes through the origin, giving k = 0.",
    "Arithmetic error – misapplies Δ = 4 − 4k = 0 and gets k = −4 through further sign slips.",
    "Set discriminant of the combined system to zero for tangency.",
    ["sign error in discriminant", "tangency vs intersection confusion"]
))

# ── MCQ 6 ──────────────────────────────────────────────
Q.append(mcq(
    "The equation x² + 8x + k = 0 can be rewritten as (x + 4)² = 16 − k. For which value of k does this equation have exactly one solution?",
    ["16", "−16", "4", "8"],
    "A",
    "(x + 4)² = 16 − k. Exactly one solution when 16 − k = 0 ⇒ k = 16. Cross-check: Δ = 64 − 4(16) = 0. ✓",
    "Sign confusion – sets 16 + k = 0, getting k = −16.",
    "Square root error – takes √16 = 4 and uses that as k.",
    "Halving error – uses 8 (the coefficient of x) directly as k.",
    "Recognise that a perfect square equals zero yields exactly one solution.",
    ["sign confusion", "coefficient misidentification"]
))

# ── MCQ 7 ──────────────────────────────────────────────
Q.append(mcq(
    "For what value of k does the equation x² − (k/2)x + 4 = 0 have a repeated root?",
    ["±8", "8", "4", "16"],
    "A",
    "Δ = (k/2)² − 16 = k²/4 − 16 = 0 ⇒ k² = 64 ⇒ k = ±8. Cross-check: repeated root r with 2r = k/2 and r² = 4 ⇒ r = ±2 ⇒ k = ±8.",
    "Partial answer – finds only k = 8, ignoring k = −8.",
    "Arithmetic error – confuses k/2 with k, gets Δ = k² − 16 = 0 ⇒ k = 4.",
    "Squaring error – computes (k/2)² as k²/2 and gets k² = 32 ⇒ k ≈ 5.66, rounds to 16.",
    "Handle fractional b-coefficient in the discriminant and include both ± values.",
    ["fractional coefficient error", "incomplete ± analysis"]
))

# ── MCQ 8 ──────────────────────────────────────────────
Q.append(mcq(
    "A rectangle has a perimeter of 20 and an area of k. If the length and width satisfy x² − 10x + k = 0, what is the maximum possible value of k?",
    ["25", "20", "100", "10"],
    "A",
    "Perimeter 20 ⇒ l + w = 10. Area = lw = k. For real dimensions, Δ ≥ 0: 100 − 4k ≥ 0 ⇒ k ≤ 25. By AM-GM: lw ≤ (10/2)² = 25 when l = w = 5.",
    "Perimeter confusion – uses k = 20 (the perimeter itself).",
    "Squaring error – computes 20²/4 = 100.",
    "Halving error – uses half the perimeter k = 10.",
    "Connect Δ ≥ 0 with geometric maximum-area constraint.",
    ["AM-GM vs discriminant equivalence", "perimeter-area confusion"]
))

# ── MCQ 9 ──────────────────────────────────────────────
Q.append(mcq(
    "For k ≠ 0, the equation kx² + 6x + k = 0 has exactly one real solution. What are the possible values of k?",
    ["±3", "3", "−3", "9"],
    "A",
    "Δ = 36 − 4k² = 0 ⇒ k² = 9 ⇒ k = ±3. Both satisfy k ≠ 0. Check: k = 3 gives 3(x + 1)² = 0 ✓; k = −3 gives −3(x − 1)² = 0 ✓.",
    "Partial answer – only considers k = 3.",
    "Partial answer – only considers k = −3.",
    "Formula error – solves 36 − 4k = 0 instead of 36 − 4k² = 0, getting k = 9.",
    "Handle a symmetric quadratic where k appears as both a and c.",
    ["symmetric coefficient oversight", "incomplete ± cases"]
))

# ── MCQ 10 ──────────────────────────────────────────────
Q.append(mcq(
    "If the product of the solutions to 2x² + 5x + c = 0 is −3, what is the value of c?",
    ["−6", "−3", "6", "3"],
    "A",
    "Vieta's product = c/a = c/2. Set c/2 = −3 ⇒ c = −6. Expanding 2(x − r)(x − s): constant = 2rs = c, so c = 2(−3) = −6.",
    "Leading coefficient neglect – sets c = −3 directly.",
    "Sign error – gets c = 6 by dropping the negative.",
    "Double error – ignores a = 2 and drops negative, getting c = 3.",
    "Recall product of roots = c/a and multiply both sides by a.",
    ["leading coefficient neglect", "sign error"]
))

# ── MCQ 11 ──────────────────────────────────────────────
Q.append(mcq(
    "The equation x² + 2kx + k + 6 = 0 has two distinct real roots. Which inequality must k satisfy?",
    ["k < −2 or k > 3", "−2 < k < 3", "k > 3", "k < −2"],
    "A",
    "Δ = 4k² − 4(k + 6) > 0 ⇒ k² − k − 6 > 0 ⇒ (k − 3)(k + 2) > 0, which holds when k < −2 or k > 3.",
    "Inequality reversal – solves (k − 3)(k + 2) < 0 instead of > 0.",
    "Partial interval – only takes k > 3.",
    "Partial interval – only takes k < −2.",
    "Solve a quadratic inequality in k arising from Δ > 0.",
    ["inequality direction reversal", "partial interval selection"]
))

# ── MCQ 12 ──────────────────────────────────────────────
Q.append(mcq(
    "The line y = x + k is tangent to the circle x² + y² = 8. What are the possible values of k?",
    ["±4", "±2√2", "±8", "±√8"],
    "A",
    "Substitute: 2x² + 2kx + k² − 8 = 0. Tangency: Δ = 4k² − 8(k² − 8) = −4k² + 64 = 0 ⇒ k² = 16 ⇒ k = ±4. Alternatively, distance |k|/√2 = √8 ⇒ |k| = 4.",
    "Intermediate confusion – uses 2√2 (= √8), confusing the radius form with k.",
    "Squaring error – uses k = ±8 from a miscalculated discriminant.",
    "Unsimplified – writes ±√8 instead of ±4, failing to recognise √8 ≠ 4.",
    "Combine substitution with Δ = 0 or use point-to-line distance.",
    ["simplification error", "distance formula vs discriminant"]
))

# ── MCQ 13 ──────────────────────────────────────────────
Q.append(mcq(
    "One root of 3x² − 7x + c = 0 is 2. What is the other root?",
    ["1/3", "7/3", "c/6", "−2"],
    "A",
    "Vieta's sum = 7/3. Other root = 7/3 − 2 = 1/3. Cross-check: plug x = 2 ⇒ c = 2, then 3x² − 7x + 2 = (3x − 1)(x − 2) = 0, x = 1/3. ✓",
    "Reports the sum 7/3 itself instead of 7/3 − 2.",
    "Leaves answer in terms of c without substituting.",
    "Sign error – assumes the other root is −2 (negating the given root).",
    "Use Vieta's sum as a shortcut to find the other root.",
    ["reporting sum instead of difference", "sign assumption"]
))

# ── MCQ 14 ──────────────────────────────────────────────
Q.append(mcq(
    "How many real solutions does x² − 4x + (k² + 5) = 0 have for any real value of k?",
    ["Always 0", "Always 1", "Always 2", "Depends on k"],
    "A",
    "Δ = 16 − 4(k² + 5) = −4k² − 4 = −4(k² + 1). Since k² + 1 ≥ 1 for all real k, Δ < 0 always. Completing the square: (x − 2)² = −(k² + 1) < 0, impossible.",
    "Misguess – assumes k can be tuned to give one solution.",
    "Over-optimism – assumes k² + 5 can be small enough for Δ ≥ 0.",
    "Logic error – notes Δ depends on k, but fails to verify Δ < 0 always.",
    "Recognise k² + 1 > 0 for all real k makes Δ permanently negative.",
    ["assuming parameter always yields variable behavior", "sign of composed expression"]
))

# ── MCQ 15 ──────────────────────────────────────────────
Q.append(mcq(
    "The equation 2x² − 12x + k = 0 can be rewritten as 2(x − 3)² = 18 − k. For what value of k does this equation have exactly one solution?",
    ["18", "9", "6", "36"],
    "A",
    "2(x − 3)² = 18 − k. One solution when 18 − k = 0 ⇒ k = 18. Cross-check: Δ = 144 − 8(18) = 0. ✓",
    "Division error – divides 18 by 2, getting k = 9.",
    "Halving error – uses the coefficient 12/2 = 6 as k.",
    "Squaring error – squares 6 to get 36.",
    "Set the right side of the completed-square form to zero.",
    ["unnecessary division", "coefficient confusion"]
))

# ── MCQ 16 ──────────────────────────────────────────────
Q.append(mcq(
    "The line y = 4x + k is tangent to y = x² + 2x + 5. What is the value of k?",
    ["4", "1", "−1", "5"],
    "A",
    "Set x² + 2x + 5 = 4x + k ⇒ x² − 2x + (5 − k) = 0. Tangency: Δ = 4 − 4(5 − k) = 4k − 16 = 0 ⇒ k = 4. Alternatively: y' = 2x + 2 = 4 ⇒ x = 1, y = 8, so k = 8 − 4 = 4.",
    "Premature answer – solves 5 − k = 4 ⇒ k = 1 from a misread setup.",
    "Sign error – computes Δ incorrectly and arrives at k = −1.",
    "Constant confusion – uses k = 5 from the parabola's constant term.",
    "Set up the system, apply Δ = 0 for tangency.",
    ["sign error in discriminant expansion", "misreading constants"]
))

# ── MCQ 17 ──────────────────────────────────────────────
Q.append(mcq(
    "If the sum of the solutions of x² − (2k + 1)x + 5 = 0 is 7, what is the value of k?",
    ["3", "7", "4", "6"],
    "A",
    "Vieta's sum = 2k + 1 = 7 ⇒ 2k = 6 ⇒ k = 3.",
    "Coefficient neglect – sets k = 7, equating the sum directly with k.",
    "Off-by-one – solves 2k = 7 ⇒ k = 3.5, rounds to 4.",
    "Arithmetic error – computes 7 − 1 = 6 but forgets to divide by 2.",
    "Extract sum of roots from the x-coefficient and solve a linear equation.",
    ["confusing sum with parameter", "arithmetic rounding"]
))

# ── MCQ 18 ──────────────────────────────────────────────
Q.append(mcq(
    "The equation −x² + 6x + k = 0 has no real solutions. Which describes all values of k?",
    ["k < −9", "k > −9", "k > 9", "k < 9"],
    "A",
    "Δ = 36 − 4(−1)(k) = 36 + 4k. No real solutions: Δ < 0 ⇒ 36 + 4k < 0 ⇒ k < −9. Multiplying by −1: x² − 6x − k = 0, Δ = 36 + 4k < 0 confirms k < −9.",
    "Sign reversal – solves Δ > 0 instead of Δ < 0, getting k > −9.",
    "Wrong formula – uses Δ = 36 − 4k < 0, getting k > 9.",
    "Arithmetic error – gets Δ = 36 − 4k and sets < 0, giving k < 9.",
    "Handle negative leading coefficient correctly in the discriminant.",
    ["negative leading coefficient", "inequality direction with negative a"]
))

# ── MCQ 19 ──────────────────────────────────────────────
Q.append(mcq(
    "If 4x² + bx + 9 = 0 has a double root, which of the following is a possible value of b?",
    ["12", "6", "18", "9"],
    "A",
    "Δ = b² − 4(4)(9) = b² − 144 = 0 ⇒ b = ±12. So b = 12 is possible. Check: (2x + 3)² = 4x² + 12x + 9. ✓",
    "Square-root shortcut error – computes √(4·9) = 6 instead of the full discriminant.",
    "Multiplication error – uses b = 2 · 9 = 18.",
    "Coefficient confusion – copies the constant term b = 9.",
    "Connect double root with perfect-square trinomial or Δ = 0.",
    ["incorrect square root of product", "coefficient confusion"]
))

# ── MCQ 20 ──────────────────────────────────────────────
Q.append(mcq(
    "The solutions of x² − 10x + k = 0 are r and s, with r − s = 6. What is the value of k?",
    ["16", "25", "24", "9"],
    "A",
    "r + s = 10, r − s = 6 ⇒ r = 8, s = 2. k = rs = 16. Alternatively: (r − s)² = (r + s)² − 4rs ⇒ 36 = 100 − 4k ⇒ k = 16.",
    "Identity confusion – uses (r + s)²/4 = 25.",
    "Arithmetic error – misreads r − s as 5 and gets r·s = 8·3 = 24.",
    "Uses (r − s)²/4 = 9.",
    "Combine Vieta's sum with the given difference to find the product.",
    ["identity misapplication", "arithmetic slip"]
))

# ── MCQ 21 ──────────────────────────────────────────────
Q.append(mcq(
    "A projectile's height is h(t) = −16t² + 48t + k. If h(t) = 0 has no real solutions, which inequality must k satisfy?",
    ["k < −36", "k > 36", "k > −36", "k < 36"],
    "A",
    "Δ = 48² − 4(−16)(k) = 2304 + 64k. No real solutions: Δ < 0 ⇒ 2304 + 64k < 0 ⇒ k < −36. Completing the square: max h = 36 + k; if 36 + k < 0, the parabola never crosses h = 0.",
    "Wrong discriminant sign – uses Δ = 2304 − 64k and gets k > 36.",
    "Sign error – correctly gets 2304 + 64k but solves > 0, giving k > −36.",
    "Weak inequality – gets k < 36 from a computational error.",
    "Compute discriminant with a negative leading coefficient in a real-world context.",
    ["negative leading coefficient in discriminant", "inequality direction"]
))

# ── MCQ 22 ──────────────────────────────────────────────
Q.append(mcq(
    "For what value of k does x⁴ − 5x² + k = 0 have exactly two distinct real solutions?",
    ["25/4", "0", "4", "6"],
    "A",
    "Let u = x². Then u² − 5u + k = 0. For exactly two real x-values, need exactly one positive u (double root). Δ_u = 25 − 4k = 0 ⇒ k = 25/4. Double root u = 5/2 > 0, giving x = ±√(5/2). ✓",
    "Counting error – k = 0 gives u = 0 or 5, yielding x = 0, ±√5 → three real solutions.",
    "Over-count – k = 4 gives u = 1 or 4, yielding x = ±1, ±2 → four real solutions.",
    "Over-count – k = 6 gives two positive u-values, yielding four real solutions.",
    "Substitute u = x² and reason about how many positive u-values produce real x.",
    ["quadratic-in-disguise", "counting real vs complex solutions"]
))

# ── MCQ 23 ──────────────────────────────────────────────
Q.append(mcq(
    "The equation x² + 2√3 · x + k = 0 has a repeated root. What is the value of k?",
    ["3", "√3", "2√3", "12"],
    "A",
    "Δ = (2√3)² − 4k = 12 − 4k = 0 ⇒ k = 3. Check: (x + √3)² = x² + 2√3·x + 3, so k = 3. ✓",
    "Square-root confusion – uses k = √3 instead of (√3)² = 3.",
    "No simplification – copies the coefficient 2√3 as k.",
    "Squaring error – computes (2√3)² = 12 and uses that as k without dividing by 4.",
    "Square an irrational coefficient correctly: (2√3)² = 12, then Δ = 12 − 4k.",
    ["irrational coefficient squaring", "forgetting to divide by 4"]
))

# ── MCQ 24 ──────────────────────────────────────────────
Q.append(mcq(
    "The parabola y = x² + 4 and the line y = mx are tangent. What is the value of m²?",
    ["16", "8", "4", "12"],
    "A",
    "x² + 4 = mx ⇒ x² − mx + 4 = 0. Tangency: Δ = m² − 16 = 0 ⇒ m² = 16. Alternatively: at tangent point, slope 2a = m and a² + 4 = 2a² ⇒ a² = 4 ⇒ m = ±4, m² = 16.",
    "Halving error – computes m² = 4·4/2 = 8.",
    "Missing factor – uses m² = 4 (the constant term).",
    "Arithmetic slip – computes 16 − 4 = 12 from a mis-set discriminant.",
    "Set discriminant to zero for tangency between a line through the origin and a parabola.",
    ["tangency condition setup", "arithmetic in discriminant"]
))

# ── MCQ 25 ──────────────────────────────────────────────
Q.append(mcq(
    "If x² + bx + b = 0 has a double root, and b ≠ 0, what is the value of b?",
    ["4", "2", "−4", "1"],
    "A",
    "Δ = b² − 4b = b(b − 4) = 0. Since b ≠ 0, b = 4. Check: x² + 4x + 4 = (x + 2)² = 0. ✓",
    "Square-root error – takes b = √4 = 2.",
    "Sign error – uses b = −4 from the − sign in Vieta's sum.",
    "Simplification error – gets b = 4 but writes b/b = 1.",
    "Factor the discriminant condition and apply the constraint b ≠ 0.",
    ["extraneous root b = 0", "sign error in Vieta's"]
))

# ── MCQ 26 ──────────────────────────────────────────────
Q.append(mcq(
    "A farmer has 30 m of fencing to enclose a rectangular garden against a wall (3 sides). The area A satisfies −2w² + 30w − A = 0. What is the maximum value of A?",
    ["225/2", "225", "112", "30"],
    "A",
    "Δ = 900 − 8A ≥ 0 ⇒ A ≤ 112.5 = 225/2. Maximum at w = 30/4 = 7.5: A = 30(7.5) − 2(56.25) = 112.5 = 225/2.",
    "Missing factor – uses 900/4 = 225, forgetting the leading coefficient −2.",
    "Rounding error – approximates 225/2 = 112.5 as 112.",
    "Perimeter confusion – uses 30 (the fencing length) as the area.",
    "Link discriminant non-negativity to geometric maximum area.",
    ["forgetting leading coefficient in Δ", "rounding fractions"]
))

# ── MCQ 27 ──────────────────────────────────────────────
Q.append(mcq(
    "For how many integer values of k with −3 ≤ k ≤ 5 does x² + 4x + k = 0 have two distinct real solutions?",
    ["7", "4", "8", "3"],
    "A",
    "Δ = 16 − 4k > 0 ⇒ k < 4. Integers in [−3, 5] with k < 4: {−3, −2, −1, 0, 1, 2, 3} = 7 values. k = 4 gives Δ = 0 (not distinct).",
    "Only counts non-negative k: k ∈ {0, 1, 2, 3} = 4.",
    "Boundary error – includes k = 4 (Δ = 0), counting 8.",
    "Only counts positive k: k ∈ {1, 2, 3} = 3.",
    "Solve the discriminant inequality and count integers in the intersection with the given range.",
    ["boundary inclusion at Δ = 0", "integer counting in intervals"]
))

# ── MCQ 28 ──────────────────────────────────────────────
Q.append(mcq(
    "If r and s are solutions of x² − 6x + 4 = 0, what is r² + s²?",
    ["28", "32", "36", "20"],
    "A",
    "r + s = 6, rs = 4. r² + s² = (r + s)² − 2rs = 36 − 8 = 28. Direct check: roots 3 ± √5, (3+√5)² + (3−√5)² = 14 + 14 = 28. ✓",
    "Factor-of-2 error – computes (r+s)² − rs = 36 − 4 = 32.",
    "Reports (r + s)² = 36 instead of r² + s².",
    "Wrong identity – computes (r+s)² − 4rs = 20, which is actually (r−s)².",
    "Apply the identity r² + s² = (r+s)² − 2rs using Vieta's formulas.",
    ["identity confusion: (r+s)² − 2rs vs (r−s)²", "forgetting factor of 2"]
))

# ── MCQ 29 ──────────────────────────────────────────────
Q.append(mcq(
    "The equation (k − 2)x² + 4x + 1 = 0, with k ≠ 2, has equal roots. What is the value of k?",
    ["6", "2", "−2", "4"],
    "A",
    "Δ = 16 − 4(k − 2) = 16 − 4k + 8 = 24 − 4k = 0 ⇒ k = 6. Check: 4x² + 4x + 1 = (2x + 1)² = 0. ✓",
    "Excluded value trap – uses k = 2, which makes the equation linear.",
    "Sign error – computes 16 − 4(k + 2) = 0 ⇒ k = 2, then tries k = −2.",
    "Division shortcut – computes 16/4 = 4 and uses that as k.",
    "Set discriminant to zero when the parameter is in the leading coefficient.",
    ["excluded value trap", "coefficient expansion error"]
))

# ── MCQ 30 ──────────────────────────────────────────────
Q.append(mcq(
    "Two similar rectangles have dimensions x by (x+2) and (x+2) by (x+6). The proportion x/(x+2) = (x+2)/(x+6) yields a quadratic. What is the positive value of x?",
    ["2", "4", "1", "6"],
    "A",
    "Cross-multiply: x(x+6) = (x+2)². x² + 6x = x² + 4x + 4 ⇒ 2x = 4 ⇒ x = 2. Verify: 2/4 = 4/8 = 1/2. ✓",
    "Misidentification – uses x + 2 = 4 ⇒ x = 4.",
    "Guess – x = 1 gives 1/3 ≠ 3/7.",
    "Uses the larger dimension x = 6; 6/8 ≠ 8/12.",
    "Cross-multiply a proportion from similar figures and solve.",
    ["cross-multiplication errors", "extraneous root rejection"]
))

# ── MCQ 31 ──────────────────────────────────────────────
Q.append(mcq(
    "The system y = x² − 3x and y = k has exactly one solution. What is the value of k?",
    ["−9/4", "0", "9/4", "−3/2"],
    "A",
    "x² − 3x = k ⇒ x² − 3x − k = 0. One solution: Δ = 9 + 4k = 0 ⇒ k = −9/4. Alternatively: vertex of y = (x − 3/2)² − 9/4 is at y = −9/4.",
    "Oversight – k = 0 gives x(x − 3) = 0, two solutions.",
    "Sign error – uses k = 9/4 instead of −9/4.",
    "Coordinate confusion – uses −3/2 (the vertex x-coordinate) as k.",
    "Identify that 'one solution' for y = k means the line passes through the vertex.",
    ["vertex y-value vs x-value confusion", "sign error"]
))

# ── MCQ 32 ──────────────────────────────────────────────
Q.append(mcq(
    "Both roots of x² − 2kx + k² − 1 = 0 are positive. What is the range of k?",
    ["k > 1", "k > 0", "k > −1", "k ≥ 1"],
    "A",
    "Δ = 4k² − 4(k² − 1) = 4 > 0 always. Roots: k ± 1. Both positive: k − 1 > 0 AND k + 1 > 0 ⇒ k > 1. Vieta check: sum = 2k > 0, product = k² − 1 > 0 ⇒ k > 1 or k < −1; combined: k > 1.",
    "Incomplete – only uses sum > 0, getting k > 0.",
    "Uses the weaker root condition k + 1 > 0, giving k > −1.",
    "Boundary error – includes k = 1, but then one root is 0 (not positive).",
    "Find roots explicitly and impose positivity on both.",
    ["missing one constraint", "boundary inclusion error"]
))

# ── MCQ 33 ──────────────────────────────────────────────
Q.append(mcq(
    "For the equation x² − 8x + k = 0 to have two integer solutions, which of the following is NOT a valid value of k?",
    ["8", "7", "15", "12"],
    "A",
    "Integer pairs summing to 8: (1,7)→k=7, (2,6)→k=12, (3,5)→k=15, (4,4)→k=16, (0,8)→k=0, etc. For k = 8: Δ = 64 − 32 = 32, irrational roots. No integer pair has product 8 and sum 8. So k = 8 is NOT valid.",
    "k = 7 IS valid: roots 1 and 7.",
    "k = 15 IS valid: roots 3 and 5.",
    "k = 12 IS valid: roots 2 and 6.",
    "Enumerate integer pairs summing to 8 and check which products are achievable.",
    ["assuming all nice numbers give integer roots", "enumeration oversight"]
))

# ── MCQ 34 ──────────────────────────────────────────────
Q.append(mcq(
    "If x² + kx + 9 > 0 for all real values of x, which describes the values of k?",
    ["−6 < k < 6", "k < −6 or k > 6", "k = ±6", "−6 ≤ k ≤ 6"],
    "A",
    "For x² + kx + 9 > 0 ∀x: a > 0 ✓ and Δ < 0. Δ = k² − 36 < 0 ⇒ |k| < 6 ⇒ −6 < k < 6. Completing the square: (x + k/2)² + 9 − k²/4 > 0 needs 9 − k²/4 > 0.",
    "Inequality reversal – solves Δ > 0.",
    "Boundary confusion – Δ = 0 means the quadratic touches zero, violating strict >.",
    "Boundary error – uses ≤ instead of <; at k = ±6 the expression equals zero at the vertex.",
    "For a quadratic to be always positive, Δ must be strictly negative.",
    ["strict vs non-strict inequality", "inequality direction"]
))

# ── MCQ 35 ──────────────────────────────────────────────
Q.append(mcq(
    "If one root of 5x² − 3x + k = 0 is the reciprocal of the other, what is the value of k?",
    ["5", "1/5", "3", "−5"],
    "A",
    "Roots r and 1/r: product = 1. Vieta's product = k/5 = 1 ⇒ k = 5. Check: 5x² − 3x + 5 = 0, Δ = 9 − 100 < 0 (complex roots, but product = 1 ✓ algebraically).",
    "Inversion error – uses k = 1/5, the reciprocal of a.",
    "Coefficient confusion – uses k = 3 (the |b| value).",
    "Sign error – gets k = −5.",
    "Reciprocal roots ⇒ product = 1, then solve k/a = 1.",
    ["product = c/a not c", "sign confusion with reciprocals"]
))

# ── MCQ 36 ──────────────────────────────────────────────
Q.append(mcq(
    "The line y = 3x + k is tangent to the circle x² + y² = 10. What are the possible values of k?",
    ["±10", "±√10", "±√30", "±100"],
    "A",
    "Distance from origin to 3x − y + k = 0 is |k|/√10. Set = radius √10: |k|/√10 = √10 ⇒ |k| = 10. Substitution check: 10x² + 6kx + k² − 10 = 0, Δ = −4k² + 400 = 0 ⇒ k² = 100.",
    "Radius confusion – uses k = ±√10, confusing k with the radius.",
    "Intermediate error – miscomputes distance to get k = ±√30.",
    "Squaring error – squares the answer, giving k = ±100.",
    "Use point-to-line distance or discriminant for tangency to a circle.",
    ["confusing k with radius", "squaring vs square-root error"]
))

# ── MCQ 37 ──────────────────────────────────────────────
Q.append(mcq(
    "What is the minimum value of x² − 6x + 14?",
    ["5", "14", "−5", "0"],
    "A",
    "x² − 6x + 14 = (x − 3)² + 5. Minimum is 5 at x = 3. Vertex formula: x = 3, y = 9 − 18 + 14 = 5.",
    "No computation – uses the constant term 14 as the minimum.",
    "Sign error – gets (x − 3)² − 5 from a completing-the-square mistake.",
    "Assumes minimum is always 0.",
    "Complete the square to identify the vertex value.",
    ["constant term confusion", "completing the square sign error"]
))

# ── MCQ 38 ──────────────────────────────────────────────
Q.append(mcq(
    "The equations x² − 5x + 6 = 0 and x² − kx + 8 = 0 share exactly one common root. What is the value of k?",
    ["6", "9", "5", "4"],
    "A",
    "First equation: (x − 2)(x − 3) = 0, roots 2, 3. Test x = 2 in second: 4 − 2k + 8 = 0 ⇒ k = 6. Check: x² − 6x + 8 = (x−2)(x−4), roots 2, 4. Common root: 2 only ✓. Test x = 3: k = 17/3, not integer.",
    "If x = 3 were common: k = 17/3 ≈ 5.67, and 9 is a rounding/miscomputation.",
    "Coefficient copy – uses k = 5 from the first equation's middle term.",
    "Guess – k = 4 doesn't satisfy either root substitution.",
    "Factor the first equation, test each root in the second.",
    ["testing only one root", "non-integer trap"]
))

# ── SPR 1 ──────────────────────────────────────────────
Q.append(spr(
    "What positive value of k makes x² − 10x + k = 0 have exactly one real solution?",
    "25", ["25"],
    "Δ = 100 − 4k = 0 ⇒ k = 25. Check: (x − 5)² = 0. ✓",
    "Set discriminant to zero and solve for k.",
    ["forgetting to divide by 4", "sign error"]
))

# ── SPR 2 ──────────────────────────────────────────────
Q.append(spr(
    "What is the sum of the solutions of 4x² − 20x + 9 = 0?",
    "5", ["5", "5.0", "20/4"],
    "Vieta's sum = −(−20)/4 = 5. Solving: x = (20 ± 16)/8, roots 9/2, 1/2. Sum = 5. ✓",
    "Apply Vieta's sum formula instead of solving fully.",
    ["solving fully instead of Vieta's", "sign error on −b"]
))

# ── SPR 3 ──────────────────────────────────────────────
Q.append(spr(
    "What is the product of the solutions of 3x² + 7x − 6 = 0?",
    "-2", ["-2", "-6/3"],
    "Vieta's product = c/a = −6/3 = −2. Factor: (3x − 2)(x + 3) = 0, roots 2/3 and −3. Product: (2/3)(−3) = −2. ✓",
    "Apply Vieta's product formula c/a.",
    ["sign error", "forgetting to divide by a"]
))

# ── SPR 4 ──────────────────────────────────────────────
Q.append(spr(
    "How many real solutions does 5x² − 4x + 1 = 0 have?",
    "0", ["0"],
    "Δ = 16 − 20 = −4 < 0. No real solutions.",
    "Compute the discriminant and check its sign.",
    ["arithmetic error making Δ positive", "confusing −4 with 4"]
))

# ── SPR 5 ──────────────────────────────────────────────
Q.append(spr(
    "The expression 2x² + 12x + 23 can be written as 2(x + h)² + k. What is the value of k?",
    "5", ["5"],
    "2(x² + 6x) + 23 = 2(x + 3)² − 18 + 23 = 2(x + 3)² + 5. So k = 5. Vertex: x = −3, value = 2(9) − 36 + 23 = 5.",
    "Complete the square with a leading coefficient and track the constant.",
    ["forgetting to multiply completion constant by 2", "sign error"]
))

# ── SPR 6 ──────────────────────────────────────────────
Q.append(spr(
    "The line y = −x + k is tangent to the parabola y = x² + 1. What is the value of k?",
    "3/4", ["3/4", "0.75", ".75"],
    "x² + 1 = −x + k ⇒ x² + x + (1 − k) = 0. Tangent: Δ = 1 − 4(1 − k) = 4k − 3 = 0 ⇒ k = 3/4. Check via slope: y' = 2x = −1 ⇒ x = −1/2, y = 5/4; k = 5/4 − (−1)(−1/2) = 5/4 − 1/2 = 3/4. ✓",
    "Set discriminant to zero for tangency.",
    ["sign error in completing the square", "confusing x with k"]
))

# ── SPR 7 ──────────────────────────────────────────────
Q.append(spr(
    "For what value of k does 9x² + kx + 4 = 0 have exactly one solution? Give the positive value of k.",
    "12", ["12"],
    "Δ = k² − 144 = 0 ⇒ k = ±12. Positive: k = 12. Check: (3x + 2)² = 9x² + 12x + 4. ✓",
    "Compute discriminant of a non-monic quadratic.",
    ["forgetting to multiply a·c by 4", "incomplete ± analysis"]
))

# ── SPR 8 ──────────────────────────────────────────────
Q.append(spr(
    "If r and s are the solutions of 2x² − 10x + 3 = 0, what is 1/r + 1/s? Express as a fraction.",
    "10/3", ["10/3"],
    "1/r + 1/s = (r + s)/(rs) = (10/2)/(3/2) = 5/(3/2) = 10/3.",
    "Combine Vieta's sum and product to compute the sum of reciprocals.",
    ["inverting the wrong quantity", "division of fractions error"]
))

# ── SPR 9 ──────────────────────────────────────────────
Q.append(spr(
    "A right triangle has legs of length x and (x + 2). The area is 24. What is the length of the shorter leg?",
    "6", ["6"],
    "Area = x(x + 2)/2 = 24 ⇒ x² + 2x − 48 = 0 ⇒ (x + 8)(x − 6) = 0. Positive root: x = 6.",
    "Translate a geometric area condition into a quadratic and reject the negative root.",
    ["forgetting to divide by 2 for triangle area", "accepting negative root"]
))

# ── SPR 10 ──────────────────────────────────────────────
Q.append(spr(
    "How many distinct real solutions does x² + 6x + 9 = 0 have?",
    "1", ["1"],
    "x² + 6x + 9 = (x + 3)² = 0 ⇒ one repeated root x = −3. Δ = 36 − 36 = 0.",
    "Recognise a perfect-square trinomial.",
    ["confusing 'repeated root' with 'two solutions'", "miscounting"]
))

# ── SPR 11 ──────────────────────────────────────────────
Q.append(spr(
    "What is the largest integer value of k for which x² − 8x + (k + 1) = 0 has two distinct real solutions?",
    "14", ["14"],
    "Δ = 64 − 4(k + 1) > 0 ⇒ 60 − 4k > 0 ⇒ k < 15. Largest integer: k = 14. At k = 15, Δ = 0 (not distinct).",
    "Solve the strict inequality and find the largest integer below the boundary.",
    ["using ≤ instead of <", "off-by-one error"]
))

# ── SPR 12 ──────────────────────────────────────────────
Q.append(spr(
    "If r and s are the solutions of x² − 4x + 1 = 0, what is (r − s)²?",
    "12", ["12"],
    "(r − s)² = (r + s)² − 4rs = 16 − 4 = 12. Check: roots 2 ± √3, difference 2√3, squared = 12. ✓",
    "Apply the identity (r − s)² = (r + s)² − 4rs.",
    ["using −2rs instead of −4rs", "confusing with r² + s²"]
))

# ═══════════════════════════════════════════════════════
# Validation & Output
# ═══════════════════════════════════════════════════════
assert len(Q) == 50, f"Expected 50, got {len(Q)}"
mc = sum(1 for q in Q if q["type"] == "MCQ")
sp = sum(1 for q in Q if q["type"] == "SPR")
assert mc == 38, f"Expected 38 MCQ, got {mc}"
assert sp == 12, f"Expected 12 SPR, got {sp}"

for i, q in enumerate(Q):
    assert q["difficulty"] == "Hard"
    assert q["targetBand"] == "SAT-1600"
    assert q["domain"] == DOMAIN
    assert q["skill"] == SKILL
    assert q["metadata"]["sourceSignalId"] == SIGNAL
    assert "cognitiveMove" in q["metadata"]
    assert "trapTypes" in q["metadata"]
    if q["type"] == "MCQ":
        assert len(q["choices"]) == 4, f"Q{i}: need 4 choices"
        assert "distractors" in q["explanation"]
        for ltr in "BCD":
            assert ltr in q["explanation"]["distractors"]
    else:
        assert "choices" not in q
        assert "acceptableAnswers" in q

ids = [q["id"] for q in Q]
assert len(ids) == len(set(ids)), "Duplicate IDs found!"

OUT.parent.mkdir(parents=True, exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(Q, f, indent=2, ensure_ascii=False)

print(f"✅ Saved {len(Q)} questions to {OUT}")
print(f"   MCQ: {mc} | SPR: {sp}")
print(f"   Domain: {DOMAIN}")
print(f"   Skill: {SKILL}")
print(f"   Signal: {SIGNAL}")
