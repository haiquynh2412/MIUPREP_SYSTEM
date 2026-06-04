import json
import uuid
import random
import os

BANK_PATH = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

questions = []

def generate_id():
    return f"antigravity-easy-{uuid.uuid4().hex[:8]}"

def make_mcq(prompt, correct, distractors_dict, trapTypes, skill):
    choices = [correct] + list(distractors_dict.keys())
    choices = list(dict.fromkeys(choices))
    
    while len(choices) < 4:
        if correct.startswith("(") and "," in correct and "=" not in correct:
            new_choice = f"({random.randint(-10, 10)}, {random.randint(-10, 10)})"
        elif "=" in correct and "x" in correct and "y" in correct:
            new_choice = f"(x - {random.randint(1,5)})² + (y - {random.randint(1,5)})² = {random.randint(2,9)**2}"
        elif correct.isdigit() or (correct.startswith("-") and correct[1:].isdigit()):
            val = int(correct)
            new_choice = str(val + random.randint(1, 10))
        elif "π" in correct:
            val = correct.replace("π", "")
            if val.isdigit():
                new_choice = f"{int(val) + random.randint(1, 10)}π"
            else:
                new_choice = f"{random.randint(10, 50)}π"
        else:
            new_choice = str(random.randint(10, 100))
            
        if new_choice not in choices:
            choices.append(new_choice)
            distractors_dict[new_choice] = "Calculation Error."
            
    choices = choices[:4]
    if correct not in choices:
        choices[0] = correct
        
    random.shuffle(choices)
    
    final_distractors = {k: v for k, v in distractors_dict.items() if k in choices and k != correct}
    
    explanation = {
        "correct": f"Calculated correctly to find {correct}.",
        "distractors": final_distractors
    }
    
    return {
        "id": generate_id(),
        "section": "Math",
        "domain": "Geometry and Trigonometry",
        "skill": skill,
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": "MCQ",
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": correct,
        "explanation": explanation,
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-geom1",
            "cognitiveMove": "Direct application of geometric formula.",
            "trapTypes": trapTypes
        }
    }

# AREA AND VOLUME (15 MCQ, 5 SPR)
for i in range(15):
    q_type = random.choice(["rectangle_area", "triangle_area", "prism_volume", "cylinder_volume"])
    
    if q_type == "rectangle_area":
        l = random.randint(3, 12)
        w = random.randint(2, 10)
        if l == w:
            l += 1
        ans = str(l * w)
        prompt = f"A rectangle has a length of {l} units and a width of {w} units. What is the area of the rectangle in square units?"
        distractors_dict = {
            str(l * w * 2): "This is twice the area.",
            str(l + w): "This is the sum of the length and width.",
            str(2 * (l + w)): "This is the perimeter, not the area."
        }
        trapTypes = ["Calculation Error", "Opposite Operation"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Area and volume")
        q["explanation"]["correct"] = f"The area of a rectangle is length × width. {l} × {w} = {ans}."
        questions.append(q)
        
    elif q_type == "triangle_area":
        b = random.randint(4, 12)
        h = random.randint(3, 10)
        ans_val = 0.5 * b * h
        ans = str(int(ans_val)) if ans_val.is_integer() else str(ans_val)
        
        prompt = f"A triangle has a base of {b} and a height of {h}. What is the area of the triangle?"
        distractors_dict = {
            str(b * h): "This is the product of the base and height, missing the 1/2 factor.",
            str(b + h): "This is the sum of the base and height.",
            str(int(b * h) + 2): "Calculation error."
        }
        trapTypes = ["Forgot to halve", "Calculation Error"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Area and volume")
        q["explanation"]["correct"] = f"The area of a triangle is (1/2) · base · height. (1/2) · {b} · {h} = {ans}."
        questions.append(q)
        
    elif q_type == "prism_volume":
        l = random.randint(2, 6)
        w = random.randint(2, 6)
        h = random.randint(3, 8)
        ans = str(l * w * h)
        prompt = f"A rectangular prism has a length of {l}, a width of {w}, and a height of {h}. What is its volume?"
        distractors_dict = {
            str(l * w): "This is only the area of the base.",
            str(l + w + h): "This is the sum of the dimensions.",
            str((l * w) + h): "This adds the height instead of multiplying."
        }
        trapTypes = ["Partial Calculation", "Calculation Error"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Area and volume")
        q["explanation"]["correct"] = f"The volume of a rectangular prism is length × width × height. {l} × {w} × {h} = {ans}."
        questions.append(q)
        
    else: # cylinder_volume
        r = random.randint(2, 5)
        h = random.randint(3, 10)
        ans = f"{r**2 * h}π"
        prompt = f"A right circular cylinder has a base radius of {r} and a height of {h}. What is its volume?"
        distractors_dict = {
            f"{2 * r * h}π": "This uses 2r instead of r².",
            f"{r * h}π": "This forgets to square the radius.",
            f"{(2 * r)**2 * h}π": "This squares the diameter instead of the radius."
        }
        trapTypes = ["Forgot to square the radius", "Used diameter instead of radius"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Area and volume")
        q["explanation"]["correct"] = f"The volume of a cylinder is πr²h. r = {r}, h = {h}. Volume = π({r})²({h}) = {r**2 * h}π."
        questions.append(q)

for i in range(5):
    l = random.randint(4, 10)
    w = random.randint(3, 8)
    h = random.randint(2, 5)
    ans = str(l * w * h)
    prompt = f"A rectangular box has a length of {l}, a width of {w}, and a height of {h}. What is the volume of the box?"
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Geometry and Trigonometry",
        "skill": "Area and volume",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": "SPR",
        "prompt": prompt,
        "correctAnswer": ans,
        "explanation": {
            "correct": f"Volume = length × width × height. {l} × {w} × {h} = {ans}."
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-geom1",
            "cognitiveMove": "Calculate volume using V=lwh.",
            "trapTypes": ["Calculation Error"]
        }
    }
    questions.append(q)

# CIRCLES (15 MCQ, 5 SPR)
for i in range(15):
    q_type = random.choice(["circle_area", "circle_circumference", "circle_equation", "circle_center"])
    
    if q_type == "circle_area":
        r = random.randint(2, 9)
        ans = f"{r**2}π"
        prompt = f"A circle has a radius of {r}. What is the area of the circle?"
        distractors_dict = {
            f"{2 * r}π": "This is the circumference (2πr), not the area.",
            f"{r}π": "This forgets to square the radius.",
            f"{(2 * r)**2}π": "This calculates the area using the diameter instead of the radius."
        }
        trapTypes = ["Forgot to square the radius", "Used diameter instead of radius"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Circles")
        q["explanation"]["correct"] = f"The area of a circle is πr². π({r})² = {r**2}π."
        questions.append(q)
        
    elif q_type == "circle_circumference":
        r = random.randint(3, 10)
        ans = f"{2 * r}π"
        prompt = f"A circle has a radius of {r}. What is the circumference of the circle?"
        distractors_dict = {
            f"{r**2}π": "This is the area (πr²), not the circumference.",
            f"{r}π": "This forgets to multiply the radius by 2.",
            f"{2 * r}": "This forgets the π."
        }
        trapTypes = ["Confused circumference and area", "Calculation Error"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Circles")
        q["explanation"]["correct"] = f"The circumference is 2πr. 2π({r}) = {2 * r}π."
        questions.append(q)
        
    elif q_type == "circle_equation":
        h_val = random.randint(1, 5)
        k_val = random.randint(1, 5)
        r = random.randint(2, 6)
        ans = f"(x - {h_val})² + (y - {k_val})² = {r**2}"
        prompt = f"A circle in the xy-plane has its center at ({h_val}, {k_val}) and a radius of {r}. Which of the following is the equation of the circle?"
        distractors_dict = {
            f"(x + {h_val})² + (y + {k_val})² = {r**2}": "This uses the wrong signs for the center coordinates.",
            f"(x - {h_val})² + (y - {k_val})² = {r}": "This forgets to square the radius.",
            f"(x + {h_val})² + (y + {k_val})² = {r}": "This uses the wrong signs and forgets to square the radius."
        }
        trapTypes = ["Sign Error", "Forgot to square the radius"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Circles")
        q["explanation"]["correct"] = f"The standard equation of a circle is (x - h)² + (y - k)² = r², where (h, k) is the center and r is the radius. Here, (h, k) = ({h_val}, {k_val}) and r = {r}. Thus, (x - {h_val})² + (y - {k_val})² = {r**2}."
        questions.append(q)
        
    else: # circle_center
        h_val = random.randint(-5, 5)
        k_val = random.randint(-5, 5)
        r2 = random.randint(2, 9)**2
        
        sign_h = "-" if h_val > 0 else "+"
        sign_k = "-" if k_val > 0 else "+"
        
        h_str = f" {sign_h} {abs(h_val)}" if h_val != 0 else ""
        k_str = f" {sign_k} {abs(k_val)}" if k_val != 0 else ""
        
        eq = f"(x{h_str})² + (y{k_str})² = {r2}"
        ans = f"({h_val}, {k_val})"
        prompt = f"The equation of a circle in the xy-plane is {eq}. What is the center of the circle?"
        
        distractors_dict = {
            f"({-h_val}, {-k_val})": "This incorrectly takes the opposite signs for both coordinates.",
            f"({h_val}, {-k_val})": "This incorrectly takes the opposite sign for the y-coordinate.",
            f"({-h_val}, {k_val})": "This incorrectly takes the opposite sign for the x-coordinate."
        }
        trapTypes = ["Sign Error", "Misread equation"]
        q = make_mcq(prompt, ans, distractors_dict, trapTypes, "Circles")
        q["explanation"]["correct"] = f"The standard equation of a circle is (x - h)² + (y - k)² = r², where (h, k) is the center. From the given equation, h = {h_val} and k = {k_val}. The center is {ans}."
        questions.append(q)

for i in range(5):
    q_type = random.choice(["diameter_to_radius", "area_to_radius2"])
    if q_type == "diameter_to_radius":
        r = random.randint(5, 20)
        d = 2 * r
        prompt = f"A circle has a diameter of {d}. What is the length of the radius of the circle?"
        correct = str(r)
        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Circles",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": correct,
            "explanation": {
                "correct": f"The radius is half of the diameter. {d} / 2 = {r}."
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom1",
                "cognitiveMove": "Identify relationship between diameter and radius.",
                "trapTypes": ["Used diameter instead of radius"]
            }
        }
        questions.append(q)
    else:
        r = random.randint(2, 10)
        ans = r**2
        prompt = f"A circle has an area of {ans}π. If the radius of the circle is r, what is the value of r²?"
        correct = str(ans)
        q = {
            "id": generate_id(),
            "section": "Math",
            "domain": "Geometry and Trigonometry",
            "skill": "Circles",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": correct,
            "explanation": {
                "correct": f"The area of a circle is πr². Since the area is {ans}π, r² = {ans}."
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-geom1",
                "cognitiveMove": "Relate area formula to value of r².",
                "trapTypes": ["Misread equation"]
            }
        }
        questions.append(q)

with open(BANK_PATH, "r", encoding="utf-8") as f:
    bank = json.load(f)

bank.extend(questions)

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Added {len(questions)} Easy Geometry & Trigonometry Math questions successfully. New bank size: {len(bank)}")
