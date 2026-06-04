import json
import os
import uuid
import random

BANK_PATH = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

def get_id():
    return f"antigravity-easy-{uuid.uuid4().hex[:8]}"

questions = []

# Domain: Problem-Solving and Data Analysis

names = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Luna", "Mason", "Nora", "Oliver", "Penelope", "Quinn", "Riley", "Sam", "Tara", "Umar", "Violet", "Will", "Xena", "Yusuf", "Zoe"]
items_plural = ["apples", "bananas", "books", "pens", "pencils", "shirts", "hats", "cups", "plates", "chairs"]
units = ["miles", "kilometers", "meters", "centimeters", "liters", "gallons"]

random.seed(12345)

# --- SKILL 1: Ratios, rates, proportional relationships, and units ---
# 15 MCQ, 5 SPR

for i in range(20):
    q_type = "MCQ" if i < 15 else "SPR"
    skill = "Ratios, rates, proportional relationships, and units"
    
    template_type = random.choice(["unit_conversion", "proportion", "rate"])
    
    if template_type == "unit_conversion":
        hours = random.randint(2, 12)
        correct_ans = hours * 60
        name = random.choice(names)
        prompt = f"{name} spent {hours} hours driving to a vacation spot. How many minutes did {name} spend driving?"
        distractors = [
            str(hours * 24),
            str(hours * 3600),
            str(hours * 30),
        ]
        explanation = f"1 hour is equal to 60 minutes. To convert {hours} hours to minutes, multiply {hours} by 60: {hours} × 60 = {correct_ans} minutes.\n\nAlternative method: Think of each hour as 60 minutes and add them up {hours} times."
        trapTypes = ["Unit Conversion Error", "Calculation Error", "Misread Sentence"]
        
    elif template_type == "proportion":
        qty1 = random.randint(2, 5)
        unit_price = random.randint(2, 10)
        cost1 = qty1 * unit_price
        qty2 = random.randint(6, 12)
        correct_ans = unit_price * qty2
        item = random.choice(items_plural)
        prompt = f"If {qty1} {item} cost ${cost1}, how much will {qty2} {item} cost at the same rate?"
        distractors = [
            str(cost1 * qty2),
            str(unit_price + qty2),
            str(cost1 + qty2),
        ]
        explanation = f"First, find the unit price: {cost1} / {qty1} = ${unit_price} per item. Then, multiply by {qty2}: {unit_price} × {qty2} = ${correct_ans}.\n\nAlternative method: Set up a proportion: {qty1}/{cost1} = {qty2}/x, cross-multiply to solve for x."
        trapTypes = ["Calculation Error", "Opposite Operation (divided instead of multiplied)", "Proportion Error"]
        
    else: # rate
        speed = random.randint(30, 70)
        time = random.randint(2, 6)
        correct_ans = speed * time
        unit = random.choice(units)
        prompt = f"A car travels at a constant speed of {speed} {unit} per hour. How far will the car travel in {time} hours?"
        distractors = [
            str(speed + time),
            str(speed // time if time != 0 else speed),
            str(speed * 2)
        ]
        explanation = f"Distance equals speed multiplied by time. {speed} {unit}/hour × {time} hours = {correct_ans} {unit}.\n\nAlternative method: You can also solve by adding the speed for each hour: {speed} added {time} times gives {correct_ans}."
        trapTypes = ["Opposite Operation (divided instead of multiplied)", "Calculation Error", "Incomplete Calculation"]
        
    if q_type == "MCQ":
        choices = list(set(distractors[:3] + [str(correct_ans)]))
        while len(choices) < 4:
            choices.append(str(correct_ans + random.randint(1, 10)))
        random.shuffle(choices)
        correct_idx = choices.index(str(correct_ans))
        choice_letters = ["A", "B", "C", "D"]
        correct_letter = choice_letters[correct_idx]
        formatted_choices = [{"letter": l, "text": t} for l, t in zip(choice_letters, choices)]
        
        q_dict = {
            "id": get_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": skill,
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": formatted_choices,
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": explanation,
                "distractors": {
                    l: f"Trap: {trapTypes[idx % len(trapTypes)]}." for idx, l in enumerate(choice_letters) if l != correct_letter
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-data1",
                "cognitiveMove": "Apply proportional reasoning",
                "trapTypes": trapTypes
            }
        }
    else:
        q_dict = {
            "id": get_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": skill,
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": str(correct_ans),
            "explanation": {
                "correct": explanation
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-data1",
                "cognitiveMove": "Apply proportional reasoning",
                "trapTypes": trapTypes
            }
        }
    questions.append(q_dict)

# --- SKILL 2: Percentages ---
# 15 MCQ, 5 SPR

for i in range(20):
    q_type = "MCQ" if i < 15 else "SPR"
    skill = "Percentages"
    
    template_type = random.choice(["percent_of_number", "percent_increase", "find_whole"])
    
    if template_type == "percent_of_number":
        perc = random.choice([10, 20, 25, 30, 40, 50, 60, 75])
        base = random.choice([40, 50, 60, 80, 100, 120, 150, 200, 250, 300])
        correct_ans = int(base * (perc / 100))
        prompt = f"What is {perc}% of {base}?"
        distractors = [
            str(int(base * (perc / 10))),
            str(int(base * ((100 - perc) / 100))),
            str(base + perc)
        ]
        explanation = f"To find {perc}% of {base}, convert the percentage to a decimal ({perc / 100}) and multiply by {base}: {perc / 100} × {base} = {correct_ans}.\n\nAlternative method: Write the percentage as a fraction ({perc}/100) and multiply by {base}."
        trapTypes = ["Percent to Decimal Error", "Opposite Operation", "Calculation Error"]
        
    elif template_type == "percent_increase":
        perc = random.choice([10, 20, 25, 50])
        base = random.choice([20, 40, 60, 80, 100, 150])
        correct_ans = int(base + (base * (perc / 100)))
        item = random.choice(["book", "shirt", "game", "hat"])
        prompt = f"The price of a {item} is ${base}. If the price increases by {perc}%, what is the new price?"
        distractors = [
            str(int(base * (perc / 100))),
            str(int(base - (base * (perc / 100)))),
            str(base + perc)
        ]
        explanation = f"The increase is {perc}% of {base}, which is {perc / 100} × {base} = {int(base * (perc / 100))}. Add this to the original price: {base} + {int(base * (perc / 100))} = {correct_ans}.\n\nAlternative method: Multiply the original price by the growth factor (1 + {perc / 100}): {base} × 1.{perc:02d} = {correct_ans}."
        trapTypes = ["Incomplete Calculation", "Opposite Operation", "Calculation Error"]
        
    else: # find_whole
        perc = random.choice([10, 20, 25, 40, 50])
        correct_ans = random.choice([40, 50, 60, 80, 100, 120, 150, 200])
        part = int(correct_ans * (perc / 100))
        prompt = f"If {part} is {perc}% of a number, what is the number?"
        distractors = [
            str(int(part * (perc / 100))),
            str(int(part * (100 / (100 - perc))) if perc != 100 else part * 2),
            str(part + perc)
        ]
        explanation = f"Let the number be x. We know that {perc / 100} × x = {part}. To find x, divide {part} by {perc / 100}: {part} / {perc / 100} = {correct_ans}.\n\nAlternative method: Set up the proportion {perc}/100 = {part}/x, and cross-multiply to solve for x."
        trapTypes = ["Opposite Operation", "Calculation Error", "Percent to Decimal Error"]

    if q_type == "MCQ":
        choices = list(set(distractors[:3] + [str(correct_ans)]))
        while len(choices) < 4:
            choices.append(str(correct_ans + random.randint(1, 10)))
        random.shuffle(choices)
        correct_idx = choices.index(str(correct_ans))
        choice_letters = ["A", "B", "C", "D"]
        correct_letter = choice_letters[correct_idx]
        formatted_choices = [{"letter": l, "text": t} for l, t in zip(choice_letters, choices)]
        
        q_dict = {
            "id": get_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": skill,
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": formatted_choices,
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": explanation,
                "distractors": {
                    l: f"Trap: {trapTypes[idx % len(trapTypes)]}." for idx, l in enumerate(choice_letters) if l != correct_letter
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-data1",
                "cognitiveMove": "Translate percentage problem to equation",
                "trapTypes": trapTypes
            }
        }
    else:
        q_dict = {
            "id": get_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": skill,
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": str(correct_ans),
            "explanation": {
                "correct": explanation
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-data1",
                "cognitiveMove": "Translate percentage problem to equation",
                "trapTypes": trapTypes
            }
        }
    questions.append(q_dict)

try:
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        bank = json.load(f)
except FileNotFoundError:
    bank = []

bank.extend(questions)

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Generated {len(questions)} Easy Math questions and added to {BANK_PATH}.")
