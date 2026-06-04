import json
import uuid
import random
import os

BANK_PATH = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

# Unicode exponents
SUPERSCRIPTS = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
}

def to_sup(num_str):
    return "".join(SUPERSCRIPTS.get(c, c) for c in str(num_str))

def generate_mcq_combining_like_terms():
    a = random.randint(2, 9)
    b = random.randint(2, 9)
    c = random.randint(2, 9)
    d = random.randint(2, 9)
    
    prompt = f"Which of the following expressions is equivalent to {a}x + {b} + {c}x + {d}?"
    
    correct = f"{a+c}x + {b+d}"
    distractor1 = f"{a+c}x + {b-d}"
    distractor2 = f"{abs(a-c)}x + {b+d}"
    distractor3 = f"{a+c+b+d}x"
    
    if random.choice([True, False]):
        correct = f"{b+d} + {a+c}x"
        distractor1 = f"{b-d} + {a+c}x"
        distractor2 = f"{b+d} + {abs(a-c)}x"
    
    return {
        "prompt": prompt,
        "type": "MCQ",
        "correct": correct,
        "distractors": [distractor1, distractor2, distractor3],
        "trap_types": ["Sign Error", "Opposite Operation", "Calculation Error"],
        "explanation": f"**Path 1 (Algebraic Manipulation):**\nCombine the like terms with x: {a}x + {c}x = {a+c}x.\nCombine the constant terms: {b} + {d} = {b+d}.\nAdd them together to get {correct}.\n\n**Path 2 (Substitution):**\nLet x = 1. The original expression is {a}(1) + {b} + {c}(1) + {d} = {a+b+c+d}.\nEvaluating the correct answer when x = 1 yields {a+c}(1) + {b+d} = {a+b+c+d}."
    }

def generate_mcq_distributive():
    a = random.randint(2, 5)
    b = random.randint(2, 7)
    c = random.randint(2, 5)
    
    prompt = f"Which of the following expressions is equivalent to {a}(x + {b}) + {c}x?"
    
    correct = f"{a+c}x + {a*b}"
    distractor1 = f"{a+c}x + {b}"
    distractor2 = f"{a+c}x + {a+b}"
    distractor3 = f"{a*c}x + {a*b}"
    
    return {
        "prompt": prompt,
        "type": "MCQ",
        "correct": correct,
        "distractors": [distractor1, distractor2, distractor3],
        "trap_types": ["Did not distribute to second term", "Added instead of multiplied", "Multiplied instead of added x terms"],
        "explanation": f"**Path 1 (Algebraic Manipulation):**\nDistribute the {a} into the parentheses: {a}(x) + {a}({b}) = {a}x + {a*b}.\nThen, add the remaining {c}x term: {a}x + {a*b} + {c}x.\nCombine like terms to get {a+c}x + {a*b}.\n\n**Path 2 (Substitution):**\nLet x = 0. The original expression is {a}(0 + {b}) + {c}(0) = {a*b}.\nEvaluating the correct answer when x = 0 yields {a+c}(0) + {a*b} = {a*b}."
    }

def generate_mcq_exponents():
    t = random.choice(["mult", "power"])
    if t == "mult":
        a = random.randint(2, 6)
        b = random.randint(2, 6)
        while a == b:
            b = random.randint(2, 6)
        prompt = f"Which of the following expressions is equivalent to (x{to_sup(a)})(x{to_sup(b)}) for all x > 0?"
        correct = f"x{to_sup(a+b)}"
        distractor1 = f"x{to_sup(a*b)}"
        distractor2 = f"2x{to_sup(a+b)}"
        distractor3 = f"2x{to_sup(a*b)}"
        
        trap_types = ["Multiplied exponents instead of adding", "Added coefficients", "Calculation Error"]
        expl = f"**Path 1 (Exponent Rules):**\nWhen multiplying expressions with the same base, you add the exponents: x{to_sup(a)} · x{to_sup(b)} = x{to_sup(a+b)}.\n\n**Path 2 (Expansion):**\nWrite out the terms: (x · x ... {a} times) · (x · x ... {b} times), which is {a+b} total x's multiplied together, yielding x{to_sup(a+b)}."
    else:
        a = random.randint(2, 5)
        b = random.randint(2, 5)
        prompt = f"Which of the following expressions is equivalent to (x{to_sup(a)}){to_sup(b)} for all x > 0?"
        correct = f"x{to_sup(a*b)}"
        distractor1 = f"x{to_sup(a+b)}"
        distractor2 = f"x{to_sup(a**b if a**b < 100 else 99)}"
        distractor3 = f"{b}x{to_sup(a)}"
        
        trap_types = ["Added exponents instead of multiplying", "Raised exponent to a power", "Misapplied rule"]
        expl = f"**Path 1 (Exponent Rules):**\nWhen raising a power to a power, you multiply the exponents: (x{to_sup(a)}){to_sup(b)} = x{to_sup(a*b)}.\n\n**Path 2 (Expansion):**\nWrite it out: (x{to_sup(a)}) multiplied by itself {b} times, which means adding {a} to itself {b} times, yielding x{to_sup(a*b)}."

    return {
        "prompt": prompt,
        "type": "MCQ",
        "correct": correct,
        "distractors": [distractor1, distractor2, distractor3],
        "trap_types": trap_types,
        "explanation": expl
    }

def generate_spr_combining():
    a = random.randint(5, 9)
    d = random.randint(1, 4)
    A = a - d
    b = random.randint(1, 5)
    e = random.randint(1, 5)
    c = random.randint(1, 5)
    f = random.randint(1, 5)
    
    prompt = f"The expression ({a}x² + {b}x + {c}) - ({d}x² + {e}x + {f}) is equivalent to Ax² + Bx + C, where A, B, and C are constants. What is the value of A?"
    correct = str(A)
    
    return {
        "prompt": prompt,
        "type": "SPR",
        "correct": correct,
        "trap_types": ["Added instead of subtracted", "Calculation Error"],
        "explanation": f"**Path 1 (Algebraic Manipulation):**\nDistribute the negative sign to the second polynomial: -{d}x² - {e}x - {f}.\nCombine the x² terms: {a}x² - {d}x² = {a-d}x².\nTherefore, A = {A}.\n\n**Path 2 (Observation):**\nThe value of A is solely determined by the coefficients of x². We have {a} from the first group and we are subtracting {d} from the second group. {a} - {d} = {A}."
    }

def generate_spr_distributive():
    a = random.randint(2, 6)
    b = random.randint(2, 6)
    c = random.randint(2, 6)
    A = a * b
    B = a * c
    
    prompt = f"The expression {a}({b}x + {c}) is equivalent to Ax + B, where A and B are constants. What is the value of A + B?"
    correct = str(A + B)
    
    return {
        "prompt": prompt,
        "type": "SPR",
        "correct": correct,
        "trap_types": ["Did not distribute to second term", "Calculation Error"],
        "explanation": f"**Path 1 (Algebraic Manipulation):**\nDistribute the {a}: {a}({b}x) + {a}({c}) = {A}x + {B}.\nThis matches Ax + B, so A = {A} and B = {B}.\nThe sum A + B is {A} + {B} = {A+B}.\n\n**Path 2 (Substitution):**\nThe sum of the coefficients A + B is equivalent to evaluating the expression Ax + B at x = 1.\nSubstitute x = 1 into the original expression: {a}({b}(1) + {c}) = {a}({b+c}) = {a*(b+c)}."
    }

questions = []

for _ in range(10):
    questions.append(generate_mcq_combining_like_terms())
for _ in range(10):
    questions.append(generate_mcq_distributive())
for _ in range(10):
    questions.append(generate_mcq_exponents())
for _ in range(5):
    questions.append(generate_spr_combining())
for _ in range(5):
    questions.append(generate_spr_distributive())

formatted = []
for q in questions:
    qid = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
    item = {
        "id": qid,
        "section": "Math",
        "domain": "Advanced Math",
        "skill": "Equivalent expressions",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": q["type"],
        "prompt": q["prompt"],
        "explanation": {
            "correct": q["explanation"]
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-adv1",
            "cognitiveMove": "Algebraic manipulation and structure recognition",
            "trapTypes": q["trap_types"]
        }
    }
    if q["type"] == "MCQ":
        choices = [{"text": q["correct"], "correct": True}]
        for i, dist in enumerate(q["distractors"]):
            choices.append({"text": dist, "correct": False})
            item["explanation"]["distractors"] = item["explanation"].get("distractors", {})
            trap_name = q["trap_types"][i] if i < len(q["trap_types"]) else "Calculation Error"
            item["explanation"]["distractors"][dist] = f"Trap: {trap_name}."
        random.shuffle(choices)
        item["choices"] = choices
        item["correctAnswer"] = q["correct"]
    else:
        item["correctAnswer"] = q["correct"]
    
    formatted.append(item)

os.makedirs(os.path.dirname(BANK_PATH), exist_ok=True)
try:
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        bank = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    bank = []

bank.extend(formatted)

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Generated {len(formatted)} Easy Math questions (30 MCQ, 10 SPR) for Equivalent Expressions.")
print(f"Total questions in bank: {len(bank)}")
