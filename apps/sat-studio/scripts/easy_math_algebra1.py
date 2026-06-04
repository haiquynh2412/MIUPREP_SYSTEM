import json
import uuid
import random
import os

def get_id():
    return f"antigravity-easy-{uuid.uuid4().hex[:8]}"

BANK_PATH = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

questions = []

# ----------------- Linear equations in one variable (15 MCQ, 5 SPR) -----------------
eq_mcq_templates = [
    # ax + b = c
    lambda: (
        (a:=random.randint(2, 6)), (x:=random.randint(2, 9)), (b:=random.randint(1, 10)), (c:=a*x+b),
        {
            "prompt": f"If {a}x + {b} = {c}, what is the value of x?",
            "choices": [
                str(x),
                str(x + 2),
                str((c + b) // a) if (c + b) % a == 0 and (c + b) // a != x else str(x + 1),
                str(x - 1)
            ],
            "correct": str(x),
            "distractors": {
                str(x + 2): "Calculation Error: Made an arithmetic error when isolating x.",
                str((c + b) // a) if (c + b) % a == 0 and (c + b) // a != x else str(x + 1): "Opposite Operation: Added b to c instead of subtracting.",
                str(x - 1): "Calculation Error: Incorrect subtraction."
            },
            "exp": f"Subtract {b} from both sides: {a}x = {c - b}.\nDivide by {a}: x = {x}.",
            "type": "MCQ"
        }
    ),
    # a(x - b) = c
    lambda: (
        (a:=random.randint(2, 5)), (x:=random.randint(3, 10)), (b:=random.randint(1, 5)), (c:=a*(x-b)),
        {
            "prompt": f"If {a}(x - {b}) = {c}, what is the value of x?",
            "choices": [
                str(x),
                str(x - 2*b) if x - 2*b > 0 and x-2*b != x else str(x + 2),
                str((c // a) - b) if c//a - b > 0 and (c//a)-b != x else str(x - 1),
                str(x + 1)
            ],
            "correct": str(x),
            "distractors": {
                str(x - 2*b) if x - 2*b > 0 and x-2*b != x else str(x + 2): "Opposite Operation: Subtracted b instead of adding b after dividing.",
                str((c // a) - b) if c//a - b > 0 and (c//a)-b != x else str(x - 1): "Sign Error: Incorrectly handled the negative sign.",
                str(x + 1): "Calculation Error: Arithmetic mistake."
            },
            "exp": f"Divide both sides by {a}: x - {b} = {c//a}.\nAdd {b} to both sides: x = {x}.",
            "type": "MCQ"
        }
    ),
    # x/a = b
    lambda: (
        (a:=random.randint(2, 8)), (b:=random.randint(2, 8)), (x:=a*b),
        {
            "prompt": f"If x/{a} = {b}, what is the value of x?",
            "choices": [
                str(x),
                str(b),
                str(a + b),
                "1"
            ],
            "correct": str(x),
            "distractors": {
                str(b): "Misread: Assumed the equation was x = b.",
                str(a + b): "Opposite Operation: Added instead of multiplying.",
                "1": "Calculation Error: Found the ratio instead of the product."
            },
            "exp": f"Multiply both sides by {a}: x = {a} · {b} = {x}.",
            "type": "MCQ"
        }
    )
]

for _ in range(5):
    for temp in eq_mcq_templates:
        res = temp()
        q = res[-1]
        choices = q["choices"]
        correct = q["correct"]
        
        # Deduplicate choices
        if len(set(choices)) < 4:
            choices = [correct, str(int(correct)+1), str(int(correct)+2), str(int(correct)-1)]
            
        random.shuffle(choices)
        letters = ["A", "B", "C", "D"]
        correct_letter = letters[choices.index(correct)]
        
        questions.append({
            "id": get_id(),
            "section": "Math",
            "domain": "Algebra",
            "skill": "Linear equations in one variable",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": q["prompt"],
            "choices": [f"{letters[i]}) {choices[i]}" for i in range(4)],
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": f"To solve for x, we isolate it. {q['exp']}",
                "distractors": {letters[i]: q["distractors"].get(choices[i], "Calculation error.") for i in range(4) if choices[i] != correct}
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-alg1",
                "cognitiveMove": "Isolate the variable using inverse operations.",
                "trapTypes": ["Calculation Error", "Opposite Operation"]
            }
        })

# 5 SPRs
for _ in range(5):
    a = random.randint(2, 6)
    x = random.randint(2, 10)
    b = random.randint(1, 10)
    c = a * x + b
    
    questions.append({
        "id": get_id(),
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear equations in one variable",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": "SPR",
        "prompt": f"If {a}x + {b} = {c}, what is the value of {a}x?",
        "correctAnswer": str(a * x),
        "explanation": {
            "correct": f"We are asked for the value of {a}x, not x. Subtract {b} from both sides: {a}x = {c} - {b} = {a*x}.\nAlternatively, solve for x: x = {x}, and multiply by {a} to get {a*x}.",
            "distractors": {}
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-alg1",
            "cognitiveMove": "Solve for a composite expression rather than the single variable.",
            "trapTypes": ["Misread Question"]
        }
    })

# ----------------- Linear inequalities in one or two variables (15 MCQ, 5 SPR) -----------------
ineq_mcq_templates = [
    # Which of the following is a solution to ax + b > c?
    lambda: (
        (a:=random.randint(2, 5)), (b:=random.randint(1, 10)), (boundary:=random.randint(1, 5)), (c:=a*boundary+b),
        {
            "prompt": f"Which of the following values of x is a solution to the inequality {a}x + {b} > {c}?",
            "choices": [
                str(boundary + 2),
                str(boundary),
                str(boundary - 1),
                str(boundary - 2)
            ],
            "correct": str(boundary + 2),
            "distractors": {
                str(boundary): "Boundary Trap: This value makes the equation equal, but the inequality is strictly greater than.",
                str(boundary - 1): "Sign Error: This value is less than the boundary, not greater.",
                str(boundary - 2): "Sign Error: This value is less than the boundary, not greater."
            },
            "exp": f"Subtract {b} from both sides: {a}x > {c - b}.\nDivide by {a}: x > {boundary}. The only choice greater than {boundary} is {boundary + 2}.",
            "type": "MCQ"
        }
    ),
    # x/a - b < c
    lambda: (
        (a:=random.randint(2, 4)), (b:=random.randint(1, 5)), (boundary:=random.randint(2, 6)), (c:=boundary-b),
        {
            "prompt": f"If x/{a} - {b} < {c}, which of the following is a possible value for x?",
            "choices": [
                str(a * boundary - a),
                str(a * boundary),
                str(a * boundary + a),
                str(a * boundary + 2*a)
            ],
            "correct": str(a * boundary - a),
            "distractors": {
                str(a * boundary): "Boundary Trap: The inequality is strictly less than.",
                str(a * boundary + a): "Sign Error: This value is greater than the boundary.",
                str(a * boundary + 2*a): "Sign Error: This value is greater than the boundary."
            },
            "exp": f"Add {b} to both sides: x/{a} < {c + b}.\nMultiply by {a}: x < {a * (c + b)}. The only choice less than {a * (c + b)} is {a * boundary - a}.",
            "type": "MCQ"
        }
    ),
    # Point (x, y) in y > ax + b
    lambda: (
        (a:=random.randint(1, 3)), (b:=random.randint(1, 5)),
        {
            "prompt": f"Which of the following points (x, y) satisfies the inequality y > {a}x + {b}?",
            "choices": [
                f"(0, {b + 2})",
                f"(0, {b})",
                f"(1, {a + b})",
                f"(2, {2*a + b - 1})"
            ],
            "correct": f"(0, {b + 2})",
            "distractors": {
                f"(0, {b})": "Boundary Trap: This point lies on the line y = ax + b.",
                f"(1, {a + b})": "Boundary Trap: This point lies on the line y = ax + b.",
                f"(2, {2*a + b - 1})": "Sign Error: This point falls below the line, satisfying y < ax + b."
            },
            "exp": f"Test the points in the inequality.\nFor (0, {b+2}): {b+2} > {a}(0) + {b} -> {b+2} > {b}, which is true.",
            "type": "MCQ"
        }
    )
]

for _ in range(5):
    for temp in ineq_mcq_templates:
        res = temp()
        q = res[-1]
        choices = q["choices"]
        correct = q["correct"]
        
        # Deduplicate choices safely
        if len(set(choices)) < 4:
            choices = [correct, choices[1] + "_alt", choices[2] + "_alt", choices[3] + "_alt"]
        
        temp_choices = list(choices)
        random.shuffle(temp_choices)
        letters = ["A", "B", "C", "D"]
        correct_letter = letters[temp_choices.index(correct)]
        
        questions.append({
            "id": get_id(),
            "section": "Math",
            "domain": "Algebra",
            "skill": "Linear inequalities in one or two variables",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": q["prompt"],
            "choices": [f"{letters[i]}) {temp_choices[i]}" for i in range(4)],
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": q["exp"],
                "distractors": {letters[i]: q["distractors"].get(temp_choices[i], "Incorrect evaluation.") for i in range(4) if temp_choices[i] != correct}
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-alg1",
                "cognitiveMove": "Test boundary conditions or point substitutions.",
                "trapTypes": ["Boundary Trap", "Sign Error"]
            }
        })

# 5 SPRs
for _ in range(5):
    a = random.randint(2, 5)
    b = random.randint(1, 10)
    boundary = random.randint(2, 7)
    c = a * boundary + b
    
    questions.append({
        "id": get_id(),
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear inequalities in one or two variables",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": "SPR",
        "prompt": f"If {a}x + {b} > {c}, what is the smallest integer value of x that satisfies the inequality?",
        "correctAnswer": str(boundary + 1),
        "explanation": {
            "correct": f"Subtract {b} from both sides: {a}x > {c - b}.\nDivide by {a}: x > {boundary}. The smallest integer greater than {boundary} is {boundary + 1}.",
            "distractors": {}
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-alg1",
            "cognitiveMove": "Identify extreme integer values within an open interval.",
            "trapTypes": ["Boundary Trap"]
        }
    })

# Add to bank
if os.path.exists(BANK_PATH):
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        bank = json.load(f)
else:
    bank = []

bank.extend(questions)

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(questions)} Easy Algebra Math questions.")
print(f"Bank now has {len(bank)} questions.")
