import json
import os
import uuid

def generate_questions():
    questions = []
    
    def make_id():
        return f"antigravity-1600-{uuid.uuid4().hex[:8]}"

    def add_q(domain, skill, q_type, prompt, choices, correct, expl_c, expl_d, move, traps):
        q = {
            "id": make_id(),
            "section": "Math",
            "domain": domain,
            "skill": skill,
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "type": q_type,
            "prompt": prompt,
            "explanation": {
                "correct": expl_c,
                "distractors": expl_d if expl_d else {}
            },
            "metadata": {
                "cognitiveMove": move,
                "trapTypes": traps,
                "sourceSignalId": "antigravity-1600-math-geometry2",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        }
        if q_type == "MCQ":
            q["choices"] = [{"text": str(c), "isCorrect": (str(c) == str(correct))} for c in choices]
            q["correctAnswer"] = str(correct)
        else:
            q["correctAnswer"] = str(correct)
        questions.append(q)

    # --- TRIGONOMETRY MCQ ---
    # Group 1: Cofunction Quadratics
    for a_expr, b_expr, ans, traps_list in [
        ("x² + 5x", "3x + 10", "4", ["10", "8", "2"]),
        ("x² - 3x", "4x + 60", "5", ["6", "10", "3"]),
        ("2x² + 2x", "-x² - x + 70", "4", ["5", "8", "10"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Right triangles and trigonometry", "MCQ",
            f"For acute angles A and B, sin(A) = cos(B). The measure of angle A in degrees is {a_expr}, and the measure of angle B in degrees is {b_expr}. If x > 0, what is the value of x?",
            [ans] + traps_list, ans,
            f"Since sin(A) = cos(B) for acute angles, A + B = 90. Therefore, ({a_expr}) + ({b_expr}) = 90. Simplifying this yields a quadratic equation. Solving for the positive root gives x = {ans}.",
            {traps_list[0]: "Set the two angles equal to each other instead of summing to 90.", traps_list[1]: "Sign error when factoring the quadratic.", traps_list[2]: "Used a complementary sum of 180 instead of 90."},
            "Applying the cofunction identity to form a quadratic equation.",
            ["False equivalence", "Algebraic factoring error"]
        )

    # Group 2: Product of sines from difference
    for diff, prod, traps_list in [
        ("1/5", "12/25", ["24/25", "1/25", "13/25"]),
        ("1/3", "4/9", ["8/9", "1/9", "5/9"]),
        ("1/7", "24/49", ["48/49", "1/49", "25/49"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Right triangles and trigonometry", "MCQ",
            f"In a right triangle, the difference between the sine of the two acute angles is {diff}. What is the product of their sines?",
            [prod] + traps_list, prod,
            f"Let the acute angles be α and β. We know sin(α) - sin(β) = {diff}. Since α and β are complementary, sin(β) = cos(α). Thus, sin(α) - cos(α) = {diff}. Squaring both sides: sin²α - 2sinαcosα + cos²α = (1/{diff.split('/')[1]})². Since sin²α + cos²α = 1, we get 1 - 2sinαcosα = (1/{diff.split('/')[1]})². Solving for sinαcosα (the product of their sines) yields {prod}.",
            {traps_list[0]: "Forgot to divide by 2 when solving for the product.", traps_list[1]: "Simply squared the difference and stopped.", traps_list[2]: "Used an incorrect trig identity for the sum of squares."},
            "Recognizing that the sine of the other acute angle is the cosine of the first, and utilizing the Pythagorean identity.",
            ["Omission of step", "Identity confusion"]
        )

    # Group 3: Altitude to hypotenuse
    for h, xw, ans, traps_list in [
        ("6", "4", "13/6", ["5/6", "9/4", "2"]),
        ("12", "9", "25/12", ["7/12", "16/9", "2"]),
        ("8", "4", "5/2", ["3/2", "4", "2"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Right triangles and trigonometry", "MCQ",
            f"In right triangle XYZ with right angle at Y, the length of altitude YW drawn to the hypotenuse XZ is {h}. If XW = {xw}, what is the value of tan(X) + tan(Z)?",
            [ans] + traps_list, ans,
            f"Using the altitude on hypotenuse theorem, YW² = XW · WZ. So {h}² = {xw} · WZ, which gives WZ = {int(h)**2 // int(xw)}. In right triangle XYW, tan(X) = YW / XW = {h}/{xw}. In right triangle YZW, tan(Z) = YW / WZ = {h}/{int(h)**2 // int(xw)}. Adding these together yields {ans}.",
            {traps_list[0]: "Calculated the difference instead of the sum.", traps_list[1]: "Used sine instead of tangent for the ratios.", traps_list[2]: "Made a proportional error when calculating WZ."},
            "Applying geometric mean theorems to find segments of the hypotenuse, then evaluating trig ratios in embedded right triangles.",
            ["Ratio misidentification", "Geometric mean error"]
        )

    # Group 4: Algebraic side lengths
    for hyp, leg, sin_val, ans, traps_list in [
        ("3x + 2", "x + 2", "1/2", "4√3", ["4", "8", "6"]),
        ("4x + 1", "2x - 1", "1/3", "6√2", ["3", "9", "4√2"]),
        ("2x - 2", "x - 3", "1/3", "8√2", ["4", "12", "6√2"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Right triangles and trigonometry", "MCQ",
            f"A right triangle has hypotenuse {hyp} and a leg {leg}. If the sine of the angle opposite to this leg is {sin_val}, what is the length of the other leg?",
            [ans] + traps_list, ans,
            f"By definition, sine is opposite/hypotenuse. So ({leg}) / ({hyp}) = {sin_val}. Cross-multiplying and solving for x gives the actual lengths of the hypotenuse and leg. Using the Pythagorean theorem, the other leg is the square root of the difference of their squares, giving {ans}.",
            {traps_list[0]: "Stopped after finding the value of the given leg.", traps_list[1]: "Calculated the hypotenuse instead of the missing leg.", traps_list[2]: "Failed to take the square root or simplified the radical incorrectly."},
            "Translating a sine ratio into an algebraic equation to find exact side lengths.",
            ["Omission of step", "Pythagorean error"]
        )

    # Group 5: 3D prism diagonal angle
    for b1, b2, sin_val, ans, traps_list in [
        ("6", "8", "12/13", "1152", ["115.2", "240", "144"]),
        ("9", "12", "8/17", "864", ["1080", "120", "432"]),
        ("15", "20", "12/13", "18000", ["300", "15000", "720"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Right triangles and trigonometry", "MCQ",
            f"A rectangular prism has a base of dimensions {b1} by {b2}, and a height of h. The angle between the space diagonal of the prism and the base plane is θ. If sin(θ) = {sin_val}, what is the volume of the prism?",
            [ans] + traps_list, ans,
            f"The diagonal of the base is √({b1}² + {b2}²). The height h, the base diagonal, and the space diagonal form a right triangle where θ is the angle with the base. Using sin(θ) = {sin_val}, we find tan(θ) and set it equal to h / (base diagonal) to solve for h. The volume is {b1} · {b2} · h = {ans}.",
            {traps_list[0]: "Calculated only the area of the base.", traps_list[1]: "Used sine directly as the ratio of height to base diagonal.", traps_list[2]: "Confused the space diagonal with the height."},
            "Mapping a 3D geometry problem onto a 2D right triangle and converting sine to tangent.",
            ["Trig ratio misapplication", "Dimensionality error"]
        )

    # --- TRIGONOMETRY SPR ---
    add_q("Geometry and Trigonometry", "Right triangles and trigonometry", "SPR",
          "For acute angles α and β, sin(2α - 10°) = cos(3β + 20°). If α = β + 5°, what is the value of α?",
          None, "19",
          "Using the cofunction identity, (2α - 10) + (3β + 20) = 90. Substituting β = α - 5 (or α = β + 5) into the equation allows us to solve for β = 14, which means α = 19.",
          None, "Solving a linear system utilizing complementary angles.", ["Substitution error"])

    add_q("Geometry and Trigonometry", "Right triangles and trigonometry", "SPR",
          "In right triangle ABC, angle C is 90°. The altitude from C to AB intersects AB at D. If AD = 18 and DB = 32, what is the length of AC?",
          None, "30",
          "By the geometric mean theorem for the leg of a right triangle, AC² = AD · AB. Here AB = 18 + 32 = 50. AC² = 18 · 50 = 900, so AC = 30.",
          None, "Applying the altitude-on-hypotenuse leg theorem.", ["Misidentifying segments"])

    add_q("Geometry and Trigonometry", "Right triangles and trigonometry", "SPR",
          "Given that sin(θ) = 0.6 and cos(θ) = 0.8 for an acute angle θ. What is the value of 150 · tan(θ)?",
          None, "112.5",
          "tan(θ) = sin(θ) / cos(θ) = 0.6 / 0.8 = 0.75. Multiplying by 150 gives 112.5.",
          None, "Using trig identities to evaluate an expression.", ["Identity confusion"])

    add_q("Geometry and Trigonometry", "Right triangles and trigonometry", "SPR",
          "In right triangle XYZ, angles X and Y are acute. If sin(X) = 0.28 and the hypotenuse is 50, what is the perimeter of the triangle?",
          None, "112",
          "Since sin(X) = 0.28 = 7/25, the leg opposite X is 50 · (7/25) = 14. The other leg is √(50² - 14²) = 48. The perimeter is 50 + 14 + 48 = 112.",
          None, "Scaling a Pythagorean triple based on a trig ratio and hypotenuse.", ["Omission of step"])

    add_q("Geometry and Trigonometry", "Right triangles and trigonometry", "SPR",
          "In a right triangle, the tangent of one acute angle is 1.05. If the leg adjacent to this angle is 40, what is the length of the hypotenuse?",
          None, "58",
          "tan(θ) = opposite/adjacent. So opp / 40 = 1.05, yielding opp = 42. The hypotenuse is √(40² + 42²) = 58.",
          None, "Using tangent to find a missing leg, then applying Pythagorean theorem.", ["Pythagorean error"])

    # --- LINES, ANGLES, TRIANGLES MCQ ---
    # Group 1: Parallel transversals intersecting
    for a1, a2, p_angle, ans, traps_list in [
        ("3x + 10", "2x - 5", "105", "20", ["22", "18", "25"]),
        ("4x - 15", "x + 20", "95", "18", ["19", "17", "22"]),
        ("2x + 30", "3x - 10", "120", "20", ["24", "18", "22"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Lines, angles, and triangles", "MCQ",
            f"In the figure, lines L₁ and L₂ are parallel. Two transversals intersect at point P between the parallel lines. The acute angles formed with the parallel lines are ({a1})° and ({a2})°. The angle at P is {p_angle}°. What is the value of x?",
            [ans] + traps_list, ans,
            f"Drawing a line through P parallel to L₁ and L₂ reveals that the angle at P is the sum of the two acute angles formed with the parallel lines. So, ({a1}) + ({a2}) = {p_angle}. Solving this equation gives x = {ans}.",
            {traps_list[0]: "Algebraic error when combining like terms.", traps_list[1]: "Subtracted instead of adding the constant terms.", traps_list[2]: "Set the sum to 180 minus the angle at P."},
            "Using the zig-zag parallel line theorem to set up an algebraic equation.",
            ["Geometric property misapplication", "Algebraic simplification error"]
        )

    # Group 2: Similar triangles area and perimeters
    for a1, a2, p1, ans, traps_list in [
        ("144", "324", "10x + 4", "15x + 6", ["22.5x + 9", "6.67x + 2.67", "10x + 4"]),
        ("50", "128", "15x - 5", "24x - 8", ["9.37x - 3.12", "38.4x - 12.8", "15x - 5"]),
        ("27", "75", "12x + 9", "20x + 15", ["7.2x + 5.4", "33.3x + 25", "12x + 9"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Lines, angles, and triangles", "MCQ",
            f"Triangles ABC and DEF are similar. The area of ABC is {a1} and the area of DEF is {a2}. If the perimeter of ABC is {p1}, what is the perimeter of DEF?",
            [ans] + traps_list, ans,
            f"The ratio of the areas of similar triangles is the square of the ratio of their corresponding lengths. Area ratio = {a1}/{a2}. Taking the square root gives the perimeter ratio. Multiplying the perimeter of ABC ({p1}) by this scale factor yields {ans}.",
            {traps_list[0]: "Used the area ratio directly as the perimeter ratio without square rooting.", traps_list[1]: "Inverted the ratio, scaling down instead of up.", traps_list[2]: "Assumed perimeters are equal regardless of area."},
            "Relating area ratios to linear ratios for similar figures.",
            ["Dimensional scaling error", "Inverted ratio"]
        )

    # Group 3: Star polygon
    for p1, p2, p3, p4, ans, traps_list in [
        ("25", "35", "40", "50", "30", ["40", "150", "10"]),
        ("20", "40", "40", "60", "20", ["40", "160", "10"]),
        ("20", "30", "40", "45", "45", ["55", "35", "25"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Lines, angles, and triangles", "MCQ",
            f"In a five-pointed star, four of the point angles measure {p1}°, {p2}°, {p3}°, and {p4}°. What is the measure of the fifth point angle?",
            [ans] + traps_list, ans,
            f"The sum of the angles at the five points of any five-pointed star is always 180°. Subtracting the given angles ({p1} + {p2} + {p3} + {p4}) from 180° yields the missing angle, which is {ans}°.",
            {traps_list[0]: "Guessed based on the sequence of numbers.", traps_list[1]: "Calculated the sum of the four angles and stopped.", traps_list[2]: "Used 360° as the sum and divided incorrectly."},
            "Applying the constant sum of the vertices of a 5-pointed star (180°).",
            ["Theorem ignorance", "Omission of step"]
        )

    # Group 4: Abstract exterior angle theorem
    for ext, int1, int2, ans, traps_list in [
        ("4x + 20", "x + 30", "2x + 10", "80", ["100", "20", "60"]),
        ("5x - 10", "2x + 15", "x + 25", "65", ["115", "25", "55"]),
        ("6x - 5", "2x + 15", "3x - 10", "125", ["55", "10", "60"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Lines, angles, and triangles", "MCQ",
            f"In triangle ABC, the exterior angle at vertex A measures ({ext})°. The remote interior angles at B and C measure ({int1})° and ({int2})° respectively. What is the measure of the interior angle at A?",
            [ans] + traps_list, ans,
            f"By the Exterior Angle Theorem, {ext} = ({int1}) + ({int2}). Solving for x gives the value of the variable. The exterior angle is then calculated, and the interior angle at A is 180° minus the exterior angle, resulting in {ans}°.",
            {traps_list[0]: "Found the measure of the exterior angle instead of the interior angle.", traps_list[1]: "Found the value of x and stopped.", traps_list[2]: "Set the sum of all three expressions to 180."},
            "Applying the exterior angle theorem algebraically to find a supplementary interior angle.",
            ["Answering the wrong question", "Geometric property misapplication"]
        )

    # Group 5: Isosceles base extension angle relations
    for p_expr, q_expr, ans, traps_list in [
        ("3x", "2x + 20", "20", ["28", "32", "40"]),
        ("4x - 10", "x + 35", "20", ["31", "15", "25"]),
        ("6x", "4x - 15", "15", ["21", "25", "18"])
    ]:
        add_q(
            "Geometry and Trigonometry", "Lines, angles, and triangles", "MCQ",
            f"In triangle PQR, PQ = PR. The measure of angle P is ({p_expr})° and the measure of angle Q is ({q_expr})°. What is the value of x?",
            [ans] + traps_list, ans,
            f"Since PQ = PR, the triangle is isosceles with base QR, meaning angle Q = angle R. Thus, R = ({q_expr})°. The sum of angles is P + 2Q = 180. So ({p_expr}) + 2({q_expr}) = 180. Solving for x yields {ans}.",
            {traps_list[0]: "Forgot to double angle Q in the sum, using P + Q = 180.", traps_list[1]: "Algebraic error when distributing the 2.", traps_list[2]: "Assumed the triangle was equilateral."},
            "Recognizing isosceles base angles and setting up a sum-of-angles equation.",
            ["Omission of step", "Property misidentification"]
        )

    # --- LINES, ANGLES, TRIANGLES SPR ---
    add_q("Geometry and Trigonometry", "Lines, angles, and triangles", "SPR",
          "The sum of the interior angles of a regular polygon is 2880°. How many sides does the polygon have?",
          None, "18",
          "The formula for the sum of interior angles is (n - 2) · 180 = 2880. Dividing by 180 gives n - 2 = 16, so n = 18.",
          None, "Using the interior angle sum formula backwards.", ["Formula error"])

    add_q("Geometry and Trigonometry", "Lines, angles, and triangles", "SPR",
          "In triangle DEF, angle D is 35° and angle E is 85°. An altitude FG is drawn from F to DE. What is the measure of angle EFG in degrees?",
          None, "5",
          "Triangle FEG is a right triangle because FG is an altitude. Since angle E is 85°, angle EFG = 90° - 85° = 5°.",
          None, "Recognizing the right triangle formed by an altitude to find a complementary angle.", ["Misidentifying angles"])

    add_q("Geometry and Trigonometry", "Lines, angles, and triangles", "SPR",
          "Two similar triangles have perimeters of 36 and 84. If the area of the smaller triangle is 45, what is the area of the larger triangle?",
          None, "245",
          "The ratio of perimeters is 36/84 = 3/7. The ratio of areas is the square of this, or 9/49. So 45 / Area = 9 / 49, giving Area = 45 · (49/9) = 245.",
          None, "Squaring the linear ratio to find the area ratio.", ["Dimensional scaling error"])

    add_q("Geometry and Trigonometry", "Lines, angles, and triangles", "SPR",
          "A triangle has side lengths of 14, 23, and x. What is the greatest possible integer value of x?",
          None, "36",
          "By the Triangle Inequality Theorem, the third side x must be strictly less than the sum of the other two sides. x < 14 + 23 = 37. The greatest integer less than 37 is 36.",
          None, "Applying the strict inequality of the triangle inequality theorem.", ["Off-by-one error"])

    add_q("Geometry and Trigonometry", "Lines, angles, and triangles", "SPR",
          "In triangle ABC, the measure of angle A is 48°. The angle bisectors of angles B and C intersect at point I. What is the degree measure of angle BIC?",
          None, "114",
          "The angle formed by the intersection of two angle bisectors in a triangle is 90° + (A/2). So angle BIC = 90° + (48°/2) = 90° + 24° = 114°.",
          None, "Applying the incenter angle theorem.", ["Theorem ignorance"])

    return questions

def main():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    os.makedirs(os.path.dirname(bank_path), exist_ok=True)
    
    if os.path.exists(bank_path):
        with open(bank_path, "r", encoding="utf-8") as f:
            try:
                bank = json.load(f)
            except json.JSONDecodeError:
                bank = []
    else:
        bank = []
        
    new_questions = generate_questions()
    bank.extend(new_questions)
    
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Added {len(new_questions)} questions. Total in bank: {len(bank)}")

if __name__ == "__main__":
    main()
