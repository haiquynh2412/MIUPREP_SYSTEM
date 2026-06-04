import json
import uuid
import random
import os

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

def gen_id():
    return f"antigravity-easy-{uuid.uuid4().hex[:8]}"

questions = []

def generate_mean_question(is_mcq):
    count = random.choice([4, 5])
    nums = [random.randint(10, 50) for _ in range(count - 1)]
    target_mean = random.randint(20, 40)
    last_num = target_mean * count - sum(nums)
    while last_num <= 0 or last_num > 100:
        target_mean = random.randint(20, 40)
        last_num = target_mean * count - sum(nums)
    nums.append(last_num)
    random.shuffle(nums)
    
    nums_str = ", ".join(map(str, nums))
    median = sorted(nums)[count//2] if count % 2 != 0 else (sorted(nums)[count//2 - 1] + sorted(nums)[count//2])/2
    if int(median) == median:
        median = int(median)
        
    prompt = f"The list of numbers is: {nums_str}.\n\nWhat is the mean of these {count} numbers?"
    correct = str(target_mean)
    
    if is_mcq:
        sum_val = sum(nums)
        d1 = str(median) 
        if d1 == correct: d1 = str(target_mean + 2)
        d2 = str(sum_val)
        if d2 == correct or d2 == d1: d2 = str(target_mean + random.randint(3, 5))
        d3 = f"{(sum_val / (count - 1)):.1f}"
        if d3.endswith(".0"): d3 = d3[:-2]
        if d3 in [correct, d1, d2]: d3 = str(target_mean - 2)
        
        choices = [{"text": correct}, {"text": d1}, {"text": d2}, {"text": d3}]
        random.shuffle(choices)
        correct_index = ["A", "B", "C", "D"][choices.index({"text": correct})]
        
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "One-variable data",
            "difficulty": "Easy",
            "type": "MCQ",
            "prompt": prompt,
            "choices": [c["text"] for c in choices],
            "correctAnswer": correct_index,
            "explanation": {
                "correct": f"To find the mean, sum the numbers and divide by the count.\nSum = {sum_val}.\nCount = {count}.\nMean = {sum_val} / {count} = {target_mean}.",
                "distractors": {
                    d1: "Confused Mean and Median",
                    d2: "Calculation Error: Found the sum but forgot to divide by the count.",
                    d3: "Calculation Error: Divided by the wrong count."
                }
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Calculate mean from a list",
                "trapTypes": ["Confused Mean and Median", "Calculation Error"],
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }
    else:
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "One-variable data",
            "difficulty": "Easy",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": correct,
            "explanation": {
                "correct": f"To find the mean, sum the numbers and divide by the count.\nSum = {sum(nums)}.\nCount = {count}.\nMean = {sum(nums)} / {count} = {target_mean}."
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Calculate mean from a list",
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }

def generate_median_question(is_mcq):
    count = random.choice([3, 5, 7])
    nums = set()
    while len(nums) < count:
        nums.add(random.randint(10, 99))
    nums = list(nums)
    random.shuffle(nums)
    
    nums_str = ", ".join(map(str, nums))
    sorted_nums = sorted(nums)
    target_median = sorted_nums[count//2]
    mean_val = round(sum(nums) / count, 1)
    if int(mean_val) == mean_val:
        mean_val = int(mean_val)
    
    prompt = f"The list of numbers is: {nums_str}.\n\nWhat is the median of these {count} numbers?"
    correct = str(target_median)
    
    if is_mcq:
        d1 = str(mean_val)
        if d1 == correct: d1 = str(target_median + random.randint(1, 5))
        d2 = str(nums[count//2])
        if d2 == correct or d2 == d1: d2 = str(sorted_nums[0])
        d3 = str(sorted_nums[-1])
        if d3 in [correct, d1, d2]: d3 = str(sorted_nums[1])
        
        choices = [{"text": correct}, {"text": d1}, {"text": d2}, {"text": d3}]
        random.shuffle(choices)
        correct_index = ["A", "B", "C", "D"][choices.index({"text": correct})]
        
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "One-variable data",
            "difficulty": "Easy",
            "type": "MCQ",
            "prompt": prompt,
            "choices": [c["text"] for c in choices],
            "correctAnswer": correct_index,
            "explanation": {
                "correct": f"To find the median, first sort the numbers: {', '.join(map(str, sorted_nums))}.\nThe middle number is the {count//2 + 1}th value, which is {target_median}.",
                "distractors": {
                    d1: "Confused Mean and Median",
                    d2: "Calculation Error: Selected the middle number of the unsorted list.",
                    d3: "Conceptual Error: Selected the maximum value."
                }
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Calculate median from a list",
                "trapTypes": ["Confused Mean and Median", "Calculation Error", "Conceptual Error"],
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }
    else:
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "One-variable data",
            "difficulty": "Easy",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": correct,
            "explanation": {
                "correct": f"To find the median, sort the numbers: {', '.join(map(str, sorted_nums))}.\nThe middle number is {target_median}."
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Calculate median from a list",
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }

def generate_probability_question(is_mcq):
    items = random.choice([
        ("red marbles", "blue marbles", "green marbles", "marbles"),
        ("apples", "oranges", "bananas", "pieces of fruit"),
        ("dogs", "cats", "birds", "animals"),
        ("math books", "science books", "history books", "books")
    ])
    c1 = random.randint(5, 15)
    c2 = random.randint(5, 15)
    c3 = random.randint(5, 15)
    total = c1 + c2 + c3
    
    prompt = f"A bag contains {c1} {items[0]}, {c2} {items[1]}, and {c3} {items[2]}.\n\nIf one {items[3][:-1]} is chosen at random from the bag, what is the probability that it is a {items[0][:-1]}?"
    correct = f"{c1}/{total}"
    
    if is_mcq:
        d1 = f"{c2}/{total}"
        d2 = f"{c1}/{c1+c2}"
        d3 = f"{total}/{c1}"
        
        if d1 == correct: d1 = f"{c3}/{total}"
        if d2 == correct: d2 = f"{c1}/{c1+c3}"
        
        choices = [{"text": correct}, {"text": d1}, {"text": d2}, {"text": d3}]
        random.shuffle(choices)
        correct_index = ["A", "B", "C", "D"][choices.index({"text": correct})]
        
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "Probability",
            "difficulty": "Easy",
            "type": "MCQ",
            "prompt": prompt,
            "choices": [c["text"] for c in choices],
            "correctAnswer": correct_index,
            "explanation": {
                "correct": f"The total number of {items[3]} is {c1} + {c2} + {c3} = {total}.\nThe number of {items[0]} is {c1}.\nThe probability is {c1}/{total}.",
                "distractors": {
                    d1: "Misread Question: Found the probability for a different category.",
                    d2: "Used wrong total for probability",
                    d3: "Calculation Error: Inverted the fraction."
                }
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Calculate basic probability",
                "trapTypes": ["Misread Question", "Used wrong total for probability", "Calculation Error"],
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }
    else:
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "Probability",
            "difficulty": "Easy",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": correct,
            "explanation": {
                "correct": f"The total number of {items[3]} is {c1} + {c2} + {c3} = {total}.\nThe probability is desired / total = {c1}/{total}."
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Calculate basic probability",
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }

def generate_scatterplot_question(is_mcq):
    var_x = random.choice(["hours studied", "temperature", "years of experience", "advertising dollars"])
    var_y = random.choice(["test score", "ice cream sales", "salary", "revenue"])
    
    val_x = random.randint(2, 10)
    multiplier = random.choice([2, 3, 4, 5])
    
    prompt = f"A scatterplot shows the relationship between {var_x} and {var_y}. The line of best fit predicts that for every 1 additional unit of {var_x}, the {var_y} increases by {val_x} units.\n\nAccording to the line of best fit, how much is the {var_y} expected to increase if {var_x} increases by {multiplier} units?"
    
    correct_val = val_x * multiplier
    correct = str(correct_val)
    
    if is_mcq:
        d1 = str(val_x + multiplier)
        d2 = str(val_x)
        d3 = str(val_x * (multiplier - 1)) if multiplier > 2 else str(val_x * (multiplier + 1))
        
        choices_text = list(set([correct, d1, d2, d3]))
        while len(choices_text) < 4:
            choices_text.append(str(int(correct) + random.randint(1, 10)))
            choices_text = list(set(choices_text))
            
        random.shuffle(choices_text)
        correct_index = ["A", "B", "C", "D"][choices_text.index(correct)]
        
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "Two-variable data",
            "difficulty": "Easy",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices_text,
            "correctAnswer": correct_index,
            "explanation": {
                "correct": f"If the increase is {val_x} per unit, an increase of {multiplier} units will yield an expected increase of {multiplier} · {val_x} = {correct_val}.",
                "distractors": {
                    d1: "Calculation Error: Added the values instead of multiplying.",
                    d2: "Misread Question: Gave the increase for 1 unit instead.",
                    d3: "Calculation Error: Multiplied by the wrong number."
                }
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Interpret slope from a context",
                "trapTypes": ["Calculation Error", "Misread Question"],
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }
    else:
        return {
            "id": gen_id(),
            "section": "Math",
            "domain": "Problem-Solving and Data Analysis",
            "skill": "Two-variable data",
            "difficulty": "Easy",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": correct,
            "explanation": {
                "correct": f"The rate is {val_x} per unit. For {multiplier} units, the expected increase is {multiplier} · {val_x} = {correct_val}."
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "cognitiveMove": "Interpret slope from a context",
                "sourceSignalId": "antigravity-easy-math-data2"
            }
        }

funcs = [generate_mean_question, generate_median_question, generate_probability_question, generate_scatterplot_question]

# Generate 45 MCQ
for i in range(45):
    q = random.choice(funcs)(is_mcq=True)
    questions.append(q)

# Generate 15 SPR
for i in range(15):
    q = random.choice(funcs)(is_mcq=False)
    questions.append(q)

# Ensure directory exists just in case
os.makedirs(os.path.dirname(bank_path), exist_ok=True)

try:
    with open(bank_path, "r", encoding="utf-8") as f:
        bank = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    bank = []

bank.extend(questions)

with open(bank_path, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Generated {len(questions)} questions.")
print(f"Total questions in bank: {len(bank)}")
