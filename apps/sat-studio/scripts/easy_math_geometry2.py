import json
import uuid
import os
import random

def generate_id():
    return f"antigravity-easy-{uuid.uuid4().hex[:8]}"

BANK_PATH = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

questions = []

# Generate Lines, Angles, and Triangles (15 MCQ, 5 SPR)
# MCQ
for i in range(15):
    t = i % 3
    if t == 0: # Supplementary angles
        angle = random.randint(40, 140)
        ans = 180 - angle
        choices = [
            str(ans),
            str(angle),
            str(abs(90 - angle)),
            str(360 - angle)
        ]
        # remove duplicates just in case
        choices = list(dict.fromkeys(choices))
        while len(choices) < 4:
            choices.append(str(random.randint(10, 170)))
        random.shuffle(choices)
        
        prompt = f"In the figure, points A, B, and C lie on a straight line. If the measure of angle ABD is {angle} degrees, what is the measure of angle CBD in degrees?"
        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Lines, angles, and triangles",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": str(ans),
            "explanation": {
                "correct": f"Angles on a straight line are supplementary and add to 180 degrees. 180 - {angle} = {ans}.",
                "distractors": {
                    str(angle): "Trap: Vertical angle assumption. Assumed the angles are equal instead of supplementary.",
                    str(abs(90 - angle)): "Trap: Complementary angle assumption. Confused supplementary (180) with complementary (90).",
                    str(360 - angle): "Trap: Full circle assumption. Subtracted from 360 instead of 180."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom2",
                "cognitiveMove": "Recall supplementary angles",
                "trapTypes": ["Misapplied concept", "Calculation Error"]
            }
        }
    elif t == 1: # Triangle sum
        a1 = random.randint(30, 80)
        a2 = random.randint(30, 80)
        ans = 180 - a1 - a2
        choices = [
            str(ans),
            str(180 - a1),
            str(180 - a2),
            str(a1 + a2)
        ]
        choices = list(dict.fromkeys(choices))
        while len(choices) < 4:
            choices.append(str(random.randint(10, 170)))
        random.shuffle(choices)
        prompt = f"A triangle has two angles that measure {a1} degrees and {a2} degrees. What is the measure of the third angle in degrees?"
        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Lines, angles, and triangles",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": str(ans),
            "explanation": {
                "correct": f"The sum of angles in a triangle is always 180 degrees. {a1} + {a2} = {a1+a2}. 180 - {a1+a2} = {ans}.",
                "distractors": {
                    str(180 - a1): "Trap: Ignored the second angle.",
                    str(180 - a2): "Trap: Ignored the first angle.",
                    str(a1 + a2): "Trap: Added the two angles but forgot to subtract from 180."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom2",
                "cognitiveMove": "Recall triangle angle sum",
                "trapTypes": ["Incomplete procedure"]
            }
        }
    else: # Parallel lines
        angle = random.randint(50, 130)
        ans = angle
        choices = [
            str(ans),
            str(180 - angle),
            str(abs(90 - angle)),
            str(int(angle / 2))
        ]
        choices = list(dict.fromkeys(choices))
        while len(choices) < 4:
            choices.append(str(random.randint(10, 170)))
        random.shuffle(choices)
        prompt = f"Line m is parallel to line n, and they are intersected by a transversal line t. If one of the acute or obtuse angles formed is {angle} degrees, what is the measure of its corresponding angle in degrees?"
        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Lines, angles, and triangles",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": str(ans),
            "explanation": {
                "correct": f"When two parallel lines are intersected by a transversal, corresponding angles are equal. Therefore, the corresponding angle is also {angle} degrees.",
                "distractors": {
                    str(180 - angle): "Trap: Confused corresponding angles with consecutive interior angles (which are supplementary).",
                    str(abs(90 - angle)): "Trap: Assumed complementary angles.",
                    str(int(angle / 2)): "Trap: Divided the angle by 2 arbitrarily."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom2",
                "cognitiveMove": "Identify corresponding angles",
                "trapTypes": ["Misapplied concept"]
            }
        }
    questions.append(q)

# SPR for Lines, angles, and triangles (5)
for i in range(5):
    if i % 2 == 0:
        base_angle = random.randint(40, 70)
        ans = 180 - 2 * base_angle
        prompt = f"In an isosceles triangle, the two base angles each measure {base_angle} degrees. What is the measure of the vertex angle in degrees?"
        exp = f"The sum of angles in a triangle is 180. The base angles sum to {base_angle} + {base_angle} = {2 * base_angle}. The vertex angle is 180 - {2 * base_angle} = {ans}."
    else:
        angle = random.randint(35, 145)
        ans = angle
        prompt = f"Two intersecting lines form an angle of {angle} degrees. What is the measure, in degrees, of the vertical angle to this angle?"
        exp = f"Vertical angles are equal. The vertical angle is also {angle} degrees."
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Geometry and Trigonometry",
        "skill": "Lines, angles, and triangles",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": "SPR",
        "prompt": prompt,
        "correctAnswer": str(ans),
        "explanation": {
            "correct": exp,
            "distractors": {}
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-geom2",
            "cognitiveMove": "Apply basic angle rules",
            "trapTypes": []
        }
    }
    questions.append(q)

# Right triangles and trigonometry: 15 MCQ, 5 SPR
triples = [(3, 4, 5), (6, 8, 10), (5, 12, 13), (9, 12, 15), (8, 15, 17), (7, 24, 25), (12, 16, 20), (10, 24, 26), (15, 20, 25)]
random.shuffle(triples)
for i in range(15):
    t = i % 3
    a, b, c = triples[i % len(triples)]
    if t == 0: # Pythagorean missing hypotenuse
        choices = [str(c), str(a+b), str(abs(a-b)), str(c+1)]
        choices = list(dict.fromkeys(choices))
        while len(choices) < 4:
            choices.append(str(random.randint(10, 50)))
        random.shuffle(choices)
        prompt = f"In a right triangle, the lengths of the two legs are {a} and {b}. What is the length of the hypotenuse?"
        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Right triangles and trigonometry",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": str(c),
            "explanation": {
                "correct": f"Using the Pythagorean theorem (a² + b² = c²): {a}² + {b}² = {a**2} + {b**2} = {c**2}. The square root of {c**2} is {c}.",
                "distractors": {
                    str(a+b): "Trap: Added the lengths of the two legs instead of squaring them.",
                    str(abs(a-b)): "Trap: Subtracted the lengths instead of using the Pythagorean theorem.",
                    str(c+1): "Trap: Calculation error."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom2",
                "cognitiveMove": "Apply Pythagorean theorem",
                "trapTypes": ["Wrong operation", "Calculation Error"]
            }
        }
    elif t == 1: # Basic SOH CAH TOA
        func = random.choice(["sin", "cos", "tan"])
        if func == "sin":
            ans = f"{a}/{c}"
            dist1 = f"{b}/{c}" # cos
            dist2 = f"{a}/{b}" # tan
            dist3 = f"{c}/{a}" # csc
            prompt = f"Triangle ABC is a right triangle with right angle at C. The side lengths are a = {a}, b = {b}, and c = {c}, where c is the hypotenuse. What is the value of sin(A)?"
            exp = f"sin(A) = opposite / hypotenuse. The side opposite angle A is a={a}, and the hypotenuse is c={c}. So sin(A) = {a}/{c}."
        elif func == "cos":
            ans = f"{b}/{c}"
            dist1 = f"{a}/{c}" # sin
            dist2 = f"{b}/{a}" # cot
            dist3 = f"{c}/{b}" # sec
            prompt = f"Triangle ABC is a right triangle with right angle at C. The side lengths are a = {a}, b = {b}, and c = {c}, where c is the hypotenuse. What is the value of cos(A)?"
            exp = f"cos(A) = adjacent / hypotenuse. The side adjacent to angle A is b={b}, and the hypotenuse is c={c}. So cos(A) = {b}/{c}."
        else:
            ans = f"{a}/{b}"
            dist1 = f"{b}/{a}" # cot
            dist2 = f"{a}/{c}" # sin
            dist3 = f"{b}/{c}" # cos
            prompt = f"Triangle ABC is a right triangle with right angle at C. The side lengths are a = {a}, b = {b}, and c = {c}, where c is the hypotenuse. What is the value of tan(A)?"
            exp = f"tan(A) = opposite / adjacent. The side opposite angle A is a={a}, and the side adjacent is b={b}. So tan(A) = {a}/{b}."
        
        choices = [ans, dist1, dist2, dist3]
        choices = list(dict.fromkeys(choices))
        while len(choices) < 4:
            choices.append(f"1/{random.randint(2,5)}")
        random.shuffle(choices)

        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Right triangles and trigonometry",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": ans,
            "explanation": {
                "correct": exp,
                "distractors": {
                    dist1: "Trap: Confused the trigonometric ratio (e.g., used adjacent instead of opposite).",
                    dist2: "Trap: Used the wrong pair of sides.",
                    dist3: "Trap: Flipped the numerator and denominator."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom2",
                "cognitiveMove": f"Recall {func} definition",
                "trapTypes": ["Misapplied definition"]
            }
        }
    else: # Complementary angles
        val = round(random.uniform(0.1, 0.9), 3)
        prompt = f"In a right triangle, one of the acute angles is x degrees. If sin(x) = {val}, what is the value of cos(90 - x)?"
        ans = str(val)
        choices = [
            str(val),
            str(round(1 - val, 3)),
            str(round(90 - val, 3)),
            str(round(val / 2, 3))
        ]
        choices = list(dict.fromkeys(choices))
        while len(choices) < 4:
            choices.append(str(round(random.uniform(0.1, 0.9), 3)))
        random.shuffle(choices)
        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Right triangles and trigonometry",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": str(val),
            "explanation": {
                "correct": f"For any acute angle x in a right triangle, sin(x) = cos(90 - x). Therefore, cos(90 - x) is also {val}.",
                "distractors": {
                    str(round(1 - val, 3)): "Trap: Subtracted the value from 1, confusing with a probability or incorrect identity.",
                    str(round(90 - val, 3)): "Trap: Subtracted the trig value from 90, confusing angle measures with ratio values.",
                    str(round(val / 2, 3)): "Trap: Guessed and halved the value."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom2",
                "cognitiveMove": "Apply complementary angle identity",
                "trapTypes": ["Misapplied concept", "Calculation Error"]
            }
        }
    questions.append(q)

# SPR Right triangles (5)
for i in range(5):
    a, b, c = triples[i % len(triples)]
    prompt = f"In a right triangle, the hypotenuse has length {c} and one leg has length {b}. What is the length of the other leg?"
    ans = str(a)
    exp = f"By the Pythagorean theorem, a² + b² = c². So, x² + {b}² = {c}². x² + {b**2} = {c**2}. x² = {c**2 - b**2} = {a**2}. The square root is {a}."
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Geometry and Trigonometry",
        "skill": "Right triangles and trigonometry",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": "SPR",
        "prompt": prompt,
        "correctAnswer": ans,
        "explanation": {
            "correct": exp,
            "distractors": {}
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-geom2",
            "cognitiveMove": "Apply Pythagorean theorem for leg",
            "trapTypes": []
        }
    }
    questions.append(q)

print(f"Generated {len(questions)} questions.")

if os.path.exists(BANK_PATH):
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        bank = json.load(f)
else:
    bank = []

bank.extend(questions)

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Successfully saved to {BANK_PATH}. Total questions now: {len(bank)}")
