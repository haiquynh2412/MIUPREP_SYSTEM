import json
import uuid
import os
import random

def generate_questions():
    random.seed(42)
    questions = []

    def add_mcq(domain, skill, prompt, ans, dist1, dist2, dist3, exp_corr, exp_dist, cog_move, traps):
        choices_text = [ans, dist1, dist2, dist3]
        random.shuffle(choices_text)
        choices = [{"id": chr(65+i), "text": str(text)} for i, text in enumerate(choices_text)]
        correct = next(c["id"] for c in choices if c["text"] == str(ans))
        distractor_dict = {}
        for c in choices:
            if c["id"] != correct:
                if c["text"] == str(dist1):
                    distractor_dict[c["id"]] = exp_dist[0]
                elif c["text"] == str(dist2):
                    distractor_dict[c["id"]] = exp_dist[1]
                elif c["text"] == str(dist3):
                    distractor_dict[c["id"]] = exp_dist[2]
                    
        questions.append({
            "id": f"antigravity-1600-{str(uuid.uuid4())[:8]}",
            "section": "Math",
            "domain": domain,
            "skill": skill,
            "difficulty": "Hard",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": correct,
            "explanation": {
                "correct": exp_corr,
                "distractors": distractor_dict
            },
            "metadata": {
                "targetBand": "SAT-1600",
                "cognitiveMove": cog_move,
                "trapTypes": traps,
                "sourceSignalId": "antigravity-1600-math-geometry1",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        })

    def add_spr(domain, skill, prompt, ans, exp_corr, cog_move):
        questions.append({
            "id": f"antigravity-1600-{str(uuid.uuid4())[:8]}",
            "section": "Math",
            "domain": domain,
            "skill": skill,
            "difficulty": "Hard",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": str(ans),
            "explanation": {
                "correct": exp_corr
            },
            "metadata": {
                "targetBand": "SAT-1600",
                "cognitiveMove": cog_move,
                "sourceSignalId": "antigravity-1600-math-geometry1",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        })

    # AREA AND VOLUME - MCQ (20)
    for a, b, p in [(2, 3, 20), (3, 4, 10)]:
        frac = 1 - p/100.0
        ans = f"{a * b * frac:g}V"
        dist1 = f"{a * b * (p/100.0):g}V"
        dist2 = f"{(a + b) * frac:g}V"
        dist3 = f"{a * b / frac:g}V"
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"A rectangular prism has volume V. If its length is multiplied by {a}, its width by {b}, and its height is reduced by {p}%, what is the new volume in terms of V?",
            ans, dist1, dist2, dist3,
            f"The new volume is the product of the scaling factors. Length is {a}x, width is {b}x, height is {frac}x. Product is {a} * {b} * {frac} = {a * b * frac:g}.",
            ["Used the reduction percentage instead of remaining percentage.", "Added the scale factors.", "Divided by the height scale instead of multiplying."],
            "Dimensional scaling abstraction.", ["Ratio Misinterpretation"])

    for r, h in [("x", "2x"), ("2y", "y")]:
        ans = "2πx³" if r=="x" else "4πy³"
        dist1 = "4πx³" if r=="x" else "2πy³"
        dist2 = "2/3 πx³" if r=="x" else "4/3 πy³"
        dist3 = "6πx²" if r=="x" else "12πy²"
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"A right circular cylinder has a base radius of {r} and a height of {h}. What is its volume?",
            ans, dist1, dist2, dist3,
            f"Volume of cylinder is πr²h. Substituting r={r} and h={h} yields π({r})²({h}) = {ans}.",
            ["Squared height instead of radius.", "Used formula for cone volume.", "Calculated surface area instead of volume."],
            "Applying volume formula with abstract parameters.", ["Formula confusion"])

    for k in [3, 4]:
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"A sphere is inscribed in a cube of side length {k}a. What is the ratio of the volume of the sphere to the volume of the cube?",
            "π/6", "π/3", "4π/3", "π/12",
            f"The sphere has diameter {k}a, so radius r = {k}a/2. Sphere volume = (4/3)π({k}a/2)³ = (4/3)π({k**3/8:g})a³ = ({k**3/6:g})πa³. Cube volume = ({k}a)³ = {k**3}a³. Ratio is ({k**3/6:g})πa³ / {k**3}a³ = π/6.",
            ["Forgot to divide diameter by 2 for radius.", "Used surface area instead of volume.", "Calculated ratio of cube to sphere."],
            "Ratio of embedded shapes.", ["Parameter cancellation trap"])

    for h, r_factor in [(4, 2), (9, 3)]:
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"Cone A has height h and base radius r. Cone B has height {h}h and base radius r/{r_factor}. What is the ratio of the volume of Cone A to the volume of Cone B?",
            f"{r_factor**2 / h:g}", f"{r_factor / h:g}", f"{h / r_factor**2:g}", "1",
            f"Vol A = (1/3)πr²h. Vol B = (1/3)π(r/{r_factor})²({h}h) = (1/3)π(r²/{r_factor**2})({h}h) = ({h}/{r_factor**2:g}) Vol A. Ratio of A to B is 1 / ({h}/{r_factor**2:g}) = {r_factor**2 / h:g}.",
            ["Forgot to square the radius factor.", "Inverted the ratio.", "Assumed volumes are equal."],
            "Scaling volume with inverse parameter changes.", ["Squaring error"])

    for p_change, a_change in [(50, 125), (20, 44)]:
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"The perimeter of a regular polygon is increased by {p_change}%. By what percentage does its area increase?",
            f"{a_change}%", f"{p_change}%", f"{p_change * 2}%", f"{(1+p_change/100)**2:g}%",
            f"Perimeter scales linearly, so side length scales by 1.{p_change:02d}. Area scales by the square of the linear scale factor: (1.{p_change:02d})² = {1+a_change/100:g}. This is an increase of {a_change}%.",
            ["Assumed area scales linearly with perimeter.", "Doubled the percentage instead of squaring the scale factor.", "Forgot to subtract 1 to find the percentage increase."],
            "Relating 1D scaling to 2D scaling.", ["Linear scaling trap"])

    for r1, r2 in [("a", "b"), ("2x", "x")]:
        ans = f"π({r1}² - {r2}²)" if r1 == "a" else "3πx²"
        dist1 = f"π({r1} - {r2})²" if r1 == "a" else "πx²"
        dist2 = f"2π({r1} - {r2})" if r1 == "a" else "2πx"
        dist3 = f"π({r1}² + {r2}²)" if r1 == "a" else "5πx²"
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"Two concentric circles have radii {r1} and {r2}, where {r1} > {r2}. What is the area of the region between them?",
            ans, dist1, dist2, dist3,
            f"Area is the difference of the areas: π({r1})² - π({r2})² = {ans}.",
            ["Subtracted radii before squaring.", "Calculated difference in circumferences.", "Added areas instead of subtracting."],
            "Composite area abstraction.", ["Algebraic precedence trap"])

    for s, factor in [("x", 4), ("2y", 9)]:
        ans = f"{factor}x²" if s=="x" else f"{factor*4}y²"
        dist1 = f"{int(factor**0.5)}x²" if s=="x" else f"{int(factor**0.5)*4}y²"
        dist2 = f"{factor**2}x²" if s=="x" else f"{factor**2 * 4}y²"
        dist3 = f"{factor}x" if s=="x" else f"{factor*2}y"
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"A square has side length {s}. If the side length is multiplied by {int(factor**0.5)}, what is the new area?",
            ans, dist1, dist2, dist3,
            f"New side length is {int(factor**0.5)}({s}). New area is ({int(factor**0.5)}({s}))² = {factor}({s})² = {ans}.",
            ["Did not square the scale factor.", "Squared the scale factor twice.", "Forgot to square the variable."],
            "Scaling 2D dimensions.", ["Scale factor squaring"])

    for ratio in [2, 3]:
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"Two similar cones have a surface area ratio of 1:{ratio**2}. If the larger cone has volume V, what is the volume of the smaller cone?",
            f"V/{ratio**3}", f"V/{ratio**2}", f"V/{ratio}", f"V/{ratio**4}",
            f"Surface area ratio is 1:{ratio**2}, so the linear ratio is 1:{ratio}. The volume ratio is the cube of the linear ratio: 1:{ratio**3}. Small cone volume = V/{ratio**3}.",
            ["Used the square of the ratio for volume.", "Used the linear ratio for volume.", "Raised to the fourth power."],
            "Dimensionality conversions (2D to 3D).", ["Dimensional mismatch"])

    for a, h in [(6, 2), (8, 3)]:
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"A square pyramid has a base side length of {a}k and height {h}k. What is the volume?",
            f"{a*a*h//3}k³", f"{a*a*h}k³", f"{a*a*h//2}k³", f"{a*a*h*3}k³",
            f"Volume = (1/3) * base_area * height = (1/3) * ({a}k)² * ({h}k) = (1/3) * {a*a}k² * {h}k = {a*a*h//3}k³.",
            ["Forgot the 1/3 factor for pyramids.", "Multiplied by 1/2 instead of 1/3.", "Multiplied by 3 instead of 1/3."],
            "Pyramid volume with parameters.", ["Formula coefficient error"])

    for r_cyl, h_cyl, r_sph in [(2, 5, 2), (3, 4, 3)]:
        ans = "76π/3" if r_cyl==2 else "54π"
        dist1 = "28π" if r_cyl==2 else "72π"
        dist2 = "36π" if r_cyl==2 else "45π"
        dist3 = "104π/3" if r_cyl==2 else "90π"
        add_mcq("Geometry and Trigonometry", "Area and volume",
            f"A composite solid consists of a cylinder of radius {r_cyl} and height {h_cyl}, capped by a hemisphere of radius {r_sph} on one end. What is the total volume?",
            ans, dist1, dist2, dist3,
            f"Cylinder volume = π({r_cyl})²({h_cyl}) = {r_cyl**2 * h_cyl}π. Hemisphere volume = (2/3)π({r_sph})³ = {2*(r_sph**3)/3:g}π. Total = {ans}.",
            ["Used full sphere volume instead of hemisphere.", "Used cone volume for the cap.", "Added surface area instead of volume."],
            "Composite volumes.", ["Hemisphere volume trap"])

    # AREA AND VOLUME - SPR (10)
    for init_v, melt_v in [(100, 5), (144, 12)]:
        add_spr("Geometry and Trigonometry", "Area and volume",
            f"A solid gold sphere of volume {init_v}π is melted down and recast into small solid cones, each with a volume of {melt_v}π. If no gold is lost, how many cones are created?",
            int(init_v/melt_v),
            f"Total volume is conserved. Number of cones = {init_v}π / {melt_v}π = {int(init_v/melt_v)}.",
            "Conservation of volume.")

    for side, scale in [(10, 1.2), (20, 1.5)]:
        add_spr("Geometry and Trigonometry", "Area and volume",
            f"A cube has a side length of {side}. If the side length is increased by {int((scale-1)*100 + 0.5)}%, what is the ratio of the new surface area to the original surface area?",
            f"{scale**2:g}",
            f"The scale factor for the side length is {scale}. The surface area scales by the square of the linear scale factor: {scale}² = {scale**2:g}.",
            "Scaling surface area.")

    for w, l_ratio in [(4, 2), (5, 3)]:
        add_spr("Geometry and Trigonometry", "Area and volume",
            f"A rectangular garden has width w and length {l_ratio}w. If the area is {w * w * l_ratio}, what is the value of w?",
            w,
            f"Area = w * {l_ratio}w = {l_ratio}w². We are given {l_ratio}w² = {w * w * l_ratio}, so w² = {w*w}. Since width is positive, w = {w}.",
            "Solving quadratic for dimensions.")

    for r, θ in [(6, 120), (9, 80)]:
        add_spr("Geometry and Trigonometry", "Area and volume",
            f"A sector of a circle with radius {r} has a central angle of {θ}°. What is the area of the sector divided by π?",
            int((θ / 360) * r**2),
            f"Sector Area = (θ/360) * πr² = ({θ}/360) * π({r})² = {θ/360:g} * {r**2}π = {int((θ / 360) * r**2)}π. The value divided by π is {int((θ / 360) * r**2)}.",
            "Sector area calculation.")

    for b1, b2, h in [(4, 8, 5), (6, 10, 7)]:
        area = 0.5 * (b1 + b2) * h
        add_spr("Geometry and Trigonometry", "Area and volume",
            f"A trapezoid has parallel bases of lengths {b1} and {b2}, and a height of {h}. What is its area?",
            int(area),
            f"Area = (1/2)(b1 + b2)h = (1/2)({b1} + {b2})({h}) = (1/2)({b1+b2})({h}) = {int(area)}.",
            "Trapezoid area formula.")

    # CIRCLES - MCQ (20)
    for a, b, c in [(4, -6, 12), (-8, 10, -5)]:
        r_sq = (a/2)**2 + (b/2)**2 + c
        add_mcq("Geometry and Trigonometry", "Circles",
            f"The equation of a circle in the xy-plane is x² + y² {a:+}x {b:+}y = {c}. What is the radius of the circle?",
            f"√({r_sq:g})", f"√({c:g})", f"{r_sq:g}", f"√({((a/2)**2 + (b/2)**2 - c):g})",
            f"Complete the square: (x² {a:+}x + {(a/2)**2:g}) + (y² {b:+}y + {(b/2)**2:g}) = {c} + {(a/2)**2:g} + {(b/2)**2:g}. This simplifies to (x {a/2:+g})² + (y {b/2:+g})² = {r_sq:g}. The radius is √({r_sq:g}).",
            ["Forgot to add completed square terms to right side.", "Did not take square root of r².", "Subtracted constant instead of adding."],
            "Completing the square for circle radius.", ["Constant neglect trap"])

    for a_param, b_param in [("2k", "4k"), ("6m", "-2m")]:
        cx = a_param.replace('2k','k').replace('6m','3m')
        cy = b_param.replace('4k','2k').replace('-2m','-m')
        ans = f"({cx}, {cy})"
        dist1 = f"(-{cx}, -{cy})"
        dist2 = f"({a_param}, {b_param})"
        dist3 = f"(-{a_param}, -{b_param})"
        add_mcq("Geometry and Trigonometry", "Circles",
            f"The equation x² + y² - {a_param}x - {b_param}y = 0 represents a circle. What are the coordinates of its center?",
            ans, dist1, dist2, dist3,
            f"Completing the square gives (x - {cx})² + (y - {cy})² = r². Center is ({cx}, {cy}).",
            ["Flipped the signs of the center.", "Forgot to divide by 2.", "Flipped signs and forgot to divide by 2."],
            "Center from abstract parameters.", ["Sign flip error"])

    for theta_val, r_val in [("π/3", "6"), ("3π/4", "8")]:
        ans = "6π" if r_val=="6" else "24π"
        dist1 = "2π" if r_val=="6" else "6π"
        dist2 = "12π" if r_val=="6" else "12π"
        dist3 = "18π" if r_val=="6" else "32π"
        add_mcq("Geometry and Trigonometry", "Circles",
            f"A sector of a circle has a central angle of {theta_val} radians and a radius of {r_val}. What is the area of the sector?",
            ans, dist1, dist2, dist3,
            f"Area = 1/2 * r² * θ = 1/2 * ({r_val})² * ({theta_val}) = {ans}.",
            ["Calculated arc length instead of area.", "Forgot the 1/2 factor.", "Squared theta instead of radius."],
            "Sector area with radians.", ["Formula confusion"])

    for arc_len, radius in [("4π", 12), ("10π", 15)]:
        ans = "π/3" if radius == 12 else "2π/3"
        dist1 = "π/6" if radius == 12 else "3π/2"
        dist2 = "4π/3" if radius == 12 else "5π/3"
        dist3 = "3π" if radius == 12 else "π/2"
        add_mcq("Geometry and Trigonometry", "Circles",
            f"A circle has radius {radius}. An arc of the circle has length {arc_len}. What is the measure of the central angle that subtends this arc, in radians?",
            ans, dist1, dist2, dist3,
            f"Arc length s = rθ. {arc_len} = {radius} * θ. θ = {arc_len} / {radius} = {ans}.",
            ["Divided radius by arc length.", "Multiplied radius by arc length.", "Calculated in degrees but left pi symbol."],
            "Arc length to radians.", ["Inverse ratio trap"])

    for r, d in [(5, 3), (13, 5)]:
        chord_half = int((r**2 - d**2)**0.5)
        ans = f"{2 * chord_half}"
        dist1 = f"{chord_half}"
        dist2 = f"{r + d}"
        dist3 = f"{int((r**2 + d**2)**0.5)}"
        add_mcq("Geometry and Trigonometry", "Circles",
            f"A circle has radius {r}. A chord is located at a distance of {d} from the center. What is the length of the chord?",
            ans, dist1, dist2, dist3,
            f"Draw a right triangle with hypotenuse r={r} and leg d={d}. The other leg is half the chord. √( {r}² - {d}² ) = {chord_half}. The full chord is 2 * {chord_half} = {ans}.",
            ["Forgot to double the half-chord.", "Added the lengths.", "Used Pythagorean theorem with addition instead of subtraction."],
            "Chord length via Pythagorean theorem.", ["Half-length trap"])

    for k, c in [(4, 25), (6, 49)]:
        add_mcq("Geometry and Trigonometry", "Circles",
            f"The circle with equation (x - {k})² + (y + {k})² = {c} is shifted {k} units to the left and {k} units up. What is the equation of the new circle?",
            f"x² + y² = {c}",
            f"(x - {2*k})² + (y + {2*k})² = {c}",
            f"(x + {k})² + (y - {k})² = {c}",
            f"x² + y² = {int(c**0.5)}",
            f"Original center is ({k}, -{k}). Shifting left {k} gives x = 0. Shifting up {k} gives y = 0. New center is (0,0). Equation is x² + y² = {c}.",
            ["Shifted in the wrong direction.", "Shifted to (-k, k) instead of (0,0).", "Took square root of r² in equation form."],
            "Circle translation.", ["Directional sign error"])

    for cx, cy, r in [(3, 4, 5), (6, 8, 10)]:
        add_mcq("Geometry and Trigonometry", "Circles",
            f"A circle with center ({cx}, {cy}) passes through the origin (0, 0). What is the area of the circle?",
            f"{r**2}π", f"{r}π", f"{2*r}π", f"{cx**2 + cy**2}π",
            f"Radius is distance from (0,0) to ({cx},{cy}), which is √({cx}² + {cy}²) = {r}. Area = πr² = {r**2}π.",
            ["Area is πr not πr².", "Area is circumference 2πr.", "Failed to take distance formula correctly."],
            "Radius from points, then area.", ["Formula confusion"])

    for a_val, b_val in [(1, -3), (2, -5)]:
        ans = f"{abs(b_val)}√2/2"
        dist1 = f"{abs(b_val)}"
        dist2 = f"{abs(a_val - b_val)}"
        dist3 = f"{abs(b_val)}/√2"
        add_mcq("Geometry and Trigonometry", "Circles",
            f"The line y = x + {b_val} is tangent to a circle centered at ({a_val}, {a_val}). What is the radius of the circle?",
            ans, dist1, dist2, dist3,
            f"Radius is distance from ({a_val}, {a_val}) to line x - y + {b_val} = 0. d = |1({a_val}) - 1({a_val}) + {b_val}| / √(1² + (-1)²) = |{b_val}| / √2. Rationalized, this is {ans}.",
            ["Used vertical distance instead of perpendicular.", "Distance to origin.", "Forgot to rationalize or simplify correctly."],
            "Distance from point to line.", ["Vertical distance trap"])

    for angle, x_val in [(40, 70), (50, 65)]:
        add_mcq("Geometry and Trigonometry", "Circles",
            f"Points A, B, and C lie on a circle with center O. If angle AOB is {angle}° and angle BOC is {180-angle}°, what is the measure of inscribed angle ABC?",
            "90°", f"{angle}°", f"{180-angle}°", "180°",
            f"Angle AOC = AOB + BOC = {angle} + {180-angle} = 180°. AC is a diameter. The inscribed angle ABC subtends a semicircle, so it is 90°.",
            ["Assumed inscribed angle equals central angle.", "Subtracted from 180 incorrectly.", "Assumed it was a straight line."],
            "Inscribed angle subtending a diameter.", ["Central angle confusion"])

    for x1, y1 in [(0, 6), (8, 0)]:
        add_mcq("Geometry and Trigonometry", "Circles",
            f"A circle has equation x² + y² = 100. A point P on the circle has coordinates ({x1}, {y1}). What is the slope of the tangent line to the circle at point P?",
            "0" if x1==0 else "Undefined",
            "Undefined" if x1==0 else "0",
            "3/4", "-4/3",
            f"Center is (0,0). P is ({x1},{y1}). Radius slope is {y1-0}/{x1-0}. If x1=0, slope is undefined, so tangent is horizontal (slope 0). If y1=0, radius is horizontal, tangent is vertical (undefined).",
            ["Confused radius slope with tangent slope.", "Used generic 3-4-5 slope.", "Sign error."],
            "Tangent line slope is perpendicular to radius.", ["Radius slope trap"])

    # CIRCLES - SPR (10)
    for h, k, r in [(2, 3, 5), (-4, 1, 6)]:
        add_spr("Geometry and Trigonometry", "Circles",
            f"The circle (x - {h})² + (y - {k})² = {r**2} has center (h, k) and radius r. What is the value of h + k + r?",
            h + k + r,
            f"The center is ({h}, {k}), so h={h}, k={k}. The radius r=√{r**2}={r}. h + k + r = {h} + {k} + {r} = {h + k + r}.",
            "Extracting circle parameters.")

    for cx, r_sq in [(6, 16), (-8, 25)]:
        add_spr("Geometry and Trigonometry", "Circles",
            f"A circle has equation x² - {2*cx}x + y² = {r_sq - cx**2}. What is the radius of the circle?",
            int(r_sq**0.5),
            f"Complete the square: x² - {2*cx}x + {cx**2} + y² = {r_sq - cx**2} + {cx**2}. (x - {cx})² + y² = {r_sq}. Radius is √{r_sq} = {int(r_sq**0.5)}.",
            "Completing the square.")

    for area_ratio in [4, 9]:
        add_spr("Geometry and Trigonometry", "Circles",
            f"Circle A has {area_ratio} times the area of Circle B. If the radius of Circle B is 5, what is the radius of Circle A?",
            5 * int(area_ratio**0.5),
            f"Area ratio is {area_ratio}, so the linear ratio (radius ratio) is √{area_ratio} = {int(area_ratio**0.5)}. Radius A = {int(area_ratio**0.5)} * 5 = {5 * int(area_ratio**0.5)}.",
            "Area to linear ratio.")

    for deg in [60, 45]:
        add_spr("Geometry and Trigonometry", "Circles",
            f"An arc of a circle has a measure of {deg}°. If the circumference of the circle is 72, what is the length of the arc?",
            int(72 * (deg / 360)),
            f"Arc length = Circumference * (degree/360) = 72 * ({deg}/360) = 72 * {deg/360:g} = {int(72 * (deg / 360))}.",
            "Arc length from circumference.")

    for a, b in [(3, 4), (5, 12)]:
        add_spr("Geometry and Trigonometry", "Circles",
            f"A rectangle with sides {a} and {b} is inscribed in a circle. What is the square of the radius of the circle?",
            f"{(a**2 + b**2)/4:g}",
            f"The diagonal of the inscribed rectangle is the diameter of the circle. Diameter² = {a}² + {b}² = {a**2 + b**2}. Radius = Diameter/2. Radius² = Diameter² / 4 = {(a**2 + b**2)/4:g}.",
            "Inscribed rectangle diagonal is diameter.")

    return questions

if __name__ == "__main__":
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_file = os.path.join(root_dir, 'data', 'antigravity-bank.json')
    
    questions = generate_questions()
    
    if os.path.exists(data_file):
        with open(data_file, 'r', encoding='utf-8') as f:
            try:
                bank = json.load(f)
            except json.JSONDecodeError:
                bank = []
    else:
        bank = []
        os.makedirs(os.path.dirname(data_file), exist_ok=True)
        
    bank.extend(questions)
    
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Generated {len(questions)} questions.")
    print(f"Successfully injected into {data_file}")
