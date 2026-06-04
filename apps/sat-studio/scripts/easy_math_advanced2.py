import json
import uuid
import random
import os

def generate_questions():
    questions = []
    
    # Needs 34 MCQ and 11 SPR
    mcq_count = 0
    spr_count = 0
    
    # We will generate until we hit the targets.
    
    # Helper to create question dict
    def make_question(q_type, prompt, choices, correct_answer, explanation_correct, explanation_distractors, trap_types, cognitive_move):
        nonlocal mcq_count, spr_count
        
        q_id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
        q = {
            "id": q_id,
            "section": "Math",
            "domain": "Advanced Math",
            "skill": "Nonlinear equations in one variable and systems of equations in two variables",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": q_type,
            "prompt": prompt,
            "correctAnswer": correct_answer,
            "explanation": {
                "correct": explanation_correct,
                "distractors": explanation_distractors
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-adv2",
                "cognitiveMove": cognitive_move,
                "trapTypes": trap_types
            }
        }
        if q_type == "MCQ":
            q["choices"] = choices
            
        return q

    # Generate 11 SPRs
    while spr_count < 11:
        template = random.choice(["factored_quadratic", "system", "radical", "quadratic_no_b"])
        if template == "factored_quadratic":
            a = random.randint(2, 12)
            b = random.randint(2, 12)
            prompt = f"What is the positive solution to the given equation?\n\n(x - {a})(x + {b}) = 0"
            ans = str(a)
            exp_corr = f"By the Zero Product Property, x - {a} = 0 or x + {b} = 0. This gives x = {a} and x = -{b}. The positive solution is {a}."
            trap_types = ["Sign Error"]
            cog_move = "Apply Zero Product Property"
            questions.append(make_question("SPR", prompt, None, ans, exp_corr, None, trap_types, cog_move))
            spr_count += 1
            
        elif template == "system":
            x_val = random.randint(2, 10)
            y_val = x_val ** 2
            prompt = f"The system of equations is given below.\n\ny = x²\ny = {y_val}\n\nIf (x, y) is a solution to the system and x > 0, what is the value of x?"
            ans = str(x_val)
            exp_corr = f"Substitute y = {y_val} into the first equation to get {y_val} = x². Taking the square root of both sides gives x = {x_val} or x = -{x_val}. Since x > 0, the value of x is {x_val}."
            trap_types = ["Calculation Error"]
            cog_move = "Substitution"
            questions.append(make_question("SPR", prompt, None, ans, exp_corr, None, trap_types, cog_move))
            spr_count += 1
            
        elif template == "radical":
            ans_val = random.randint(1, 15)
            b = random.randint(2, 9)
            a = ans_val - b**2
            # √(x - a) = b
            # x - a = b² -> x = b² + a
            if a > 0:
                prompt = f"What is the solution to the given equation?\n\n√(x - {a}) = {b}"
                exp_corr = f"Square both sides to get x - {a} = {b**2}. Add {a} to both sides to find x = {ans_val}."
            elif a < 0:
                prompt = f"What is the solution to the given equation?\n\n√(x + {-a}) = {b}"
                exp_corr = f"Square both sides to get x + {-a} = {b**2}. Subtract {-a} from both sides to find x = {ans_val}."
            else:
                prompt = f"What is the solution to the given equation?\n\n√(x) = {b}"
                exp_corr = f"Square both sides to get x = {b**2}. Thus, x = {ans_val}."
                
            ans = str(ans_val)
            trap_types = ["Opposite Operation"]
            cog_move = "Isolate Variable"
            questions.append(make_question("SPR", prompt, None, ans, exp_corr, None, trap_types, cog_move))
            spr_count += 1
            
        elif template == "quadratic_no_b":
            x_val = random.randint(2, 12)
            c = x_val ** 2
            prompt = f"What is the positive solution to the given equation?\n\nx² - {c} = 0"
            ans = str(x_val)
            exp_corr = f"Add {c} to both sides to get x² = {c}. Taking the square root of both sides yields x = {x_val} or x = -{x_val}. The positive solution is {x_val}."
            trap_types = ["Sign Error"]
            cog_move = "Isolate Variable"
            questions.append(make_question("SPR", prompt, None, ans, exp_corr, None, trap_types, cog_move))
            spr_count += 1
            
    # Generate 34 MCQs
    while mcq_count < 34:
        template = random.choice(["factored_quadratic", "system", "radical", "quadratic_no_b", "rational"])
        if template == "factored_quadratic":
            a = random.randint(2, 12)
            b = random.randint(2, 12)
            prompt = f"Which of the following is a solution to the given equation?\n\n(x - {a})(x + {b}) = 0"
            ans = str(a)
            choices = [
                str(a),
                str(-a),
                str(b),
                str(a + b)
            ]
            # Handle duplicate choices just in case
            choices = list(set(choices))
            while len(choices) < 4:
                choices.append(str(random.randint(15, 50)))
                choices = list(set(choices))
            random.shuffle(choices)
            
            exp_corr = f"By the Zero Product Property, x - {a} = 0 or x + {b} = 0. This gives x = {a} and x = -{b}. Of the given choices, {a} is a solution."
            exp_dist = {
                str(-a): "Sign Error: This is the opposite of the correct root x = a.",
                str(b): "Sign Error: This is the opposite of the correct root x = -b.",
                str(a + b): "Calculation Error: This represents the sum of a and b, not a solution."
            }
            # Fallback for random appended choices
            for c in choices:
                if c not in exp_dist and c != ans:
                    exp_dist[c] = "Calculation Error: Does not satisfy the equation."
                    
            trap_types = ["Sign Error", "Calculation Error"]
            cog_move = "Apply Zero Product Property"
            questions.append(make_question("MCQ", prompt, choices, ans, exp_corr, exp_dist, trap_types, cog_move))
            mcq_count += 1
                
        elif template == "system":
            x_val = random.randint(2, 10)
            y_val = x_val ** 2
            prompt = f"The system of equations is given below.\n\ny = x²\ny = {y_val}\n\nWhich of the following could be the value of x?"
            ans = str(x_val)
            fake1 = str(y_val)
            fake2 = str(x_val * 2)
            fake3 = str(int(x_val ** 0.5)) if int(x_val ** 0.5)**2 == x_val and x_val != 4 else str(x_val + 2)
            choices = [ans, fake1, fake2, fake3]
            choices = list(set(choices))
            while len(choices) < 4:
                choices.append(str(random.randint(15, 50)))
                choices = list(set(choices))
            random.shuffle(choices)
            
            exp_corr = f"Substitute y = {y_val} into the first equation to get {y_val} = x². Taking the square root of both sides gives x = {x_val} or x = -{x_val}. Thus, {x_val} is a possible value."
            exp_dist = {}
            for c in choices:
                if c != ans:
                    if c == str(y_val):
                        exp_dist[c] = "Misread Question: This is the value of y, not x."
                    elif c == str(x_val * 2):
                        exp_dist[c] = "Calculation Error: Divided by 2 instead of taking the square root."
                    else:
                        exp_dist[c] = "Calculation Error: Incorrectly solved for x."
            
            trap_types = ["Misread Question", "Calculation Error"]
            cog_move = "Substitution"
            questions.append(make_question("MCQ", prompt, choices, ans, exp_corr, exp_dist, trap_types, cog_move))
            mcq_count += 1
            
        elif template == "radical":
            ans_val = random.randint(2, 15)
            b = random.randint(2, 9)
            a = ans_val - b**2
            if a > 0:
                prompt = f"What is the solution to the given equation?\n\n√(x - {a}) = {b}"
                exp_corr = f"Square both sides to get x - {a} = {b**2}. Add {a} to both sides to find x = {ans_val}."
            elif a < 0:
                prompt = f"What is the solution to the given equation?\n\n√(x + {-a}) = {b}"
                exp_corr = f"Square both sides to get x + {-a} = {b**2}. Subtract {-a} from both sides to find x = {ans_val}."
            else:
                prompt = f"What is the solution to the given equation?\n\n√(x) = {b}"
                exp_corr = f"Square both sides to get x = {b**2}. Thus, x = {ans_val}."
                
            ans = str(ans_val)
            fake1 = str(b + (a if a > 0 else a))
            fake2 = str(b**2 - a) if a > 0 else str(b**2 + (-a))
            fake3 = str(ans_val + 2)
            choices = list(set([ans, fake1, fake2, fake3]))
            while len(choices) < 4:
                choices.append(str(random.randint(20, 100)))
                choices = list(set(choices))
            random.shuffle(choices)
            
            exp_dist = {}
            for c in choices:
                if c != ans:
                    exp_dist[c] = "Calculation Error or Opposite Operation: Incorrectly isolated x."
                    
            trap_types = ["Opposite Operation", "Calculation Error"]
            cog_move = "Isolate Variable"
            questions.append(make_question("MCQ", prompt, choices, ans, exp_corr, exp_dist, trap_types, cog_move))
            mcq_count += 1
            
        elif template == "quadratic_no_b":
            x_val = random.randint(2, 12)
            c = x_val ** 2
            prompt = f"Which of the following is a solution to the given equation?\n\nx² - {c} = 0"
            ans = str(x_val)
            choices = [
                str(x_val),
                str(c),
                str(c // 2) if c % 2 == 0 else str(c - 2),
                str(x_val * 2)
            ]
            choices = list(set(choices))
            while len(choices) < 4:
                choices.append(str(random.randint(15, 100)))
                choices = list(set(choices))
            random.shuffle(choices)
            
            exp_corr = f"Add {c} to both sides to get x² = {c}. Taking the square root of both sides yields x = {x_val} or x = -{x_val}."
            exp_dist = {}
            for ch in choices:
                if ch != ans:
                    if ch == str(c):
                        exp_dist[ch] = "Calculation Error: Forgot to take the square root."
                    elif ch == str(c // 2):
                        exp_dist[ch] = "Calculation Error: Divided by 2 instead of taking the square root."
                    else:
                        exp_dist[ch] = "Calculation Error: Incorrectly solved for x."
            
            trap_types = ["Calculation Error"]
            cog_move = "Isolate Variable"
            questions.append(make_question("MCQ", prompt, choices, ans, exp_corr, exp_dist, trap_types, cog_move))
            mcq_count += 1
            
        elif template == "rational":
            # c / (x - a) = d
            d = random.randint(2, 6)
            ans_val = random.randint(2, 10)
            a = random.randint(1, 5)
            # We want x - a > 0
            if ans_val <= a:
                ans_val = a + random.randint(1, 5)
            c = d * (ans_val - a)
            
            prompt = f"What is the solution to the given equation?\n\n{c} / (x - {a}) = {d}"
            ans = str(ans_val)
            choices = [
                str(ans_val),
                str(ans_val + 2),
                str(c // d + a + 1),
                str(c * d + a)
            ]
            choices = list(set(choices))
            while len(choices) < 4:
                choices.append(str(random.randint(15, 50)))
                choices = list(set(choices))
            random.shuffle(choices)
            
            exp_corr = f"Multiply both sides by (x - {a}) to get {c} = {d}(x - {a}). Divide by {d} to get {c//d} = x - {a}. Add {a} to both sides to find x = {ans_val}."
            exp_dist = {}
            for ch in choices:
                if ch != ans:
                    exp_dist[ch] = "Calculation Error: Incorrectly isolated x."
                    
            trap_types = ["Calculation Error"]
            cog_move = "Isolate Variable"
            questions.append(make_question("MCQ", prompt, choices, ans, exp_corr, exp_dist, trap_types, cog_move))
            mcq_count += 1

    return questions

def inject_questions(questions, file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        bank = json.load(f)
    
    bank.extend(questions)
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated and injected {len(questions)} questions.")
    mcq_count = sum(1 for q in questions if q['type'] == 'MCQ')
    spr_count = sum(1 for q in questions if q['type'] == 'SPR')
    print(f"Breakdown: {mcq_count} MCQ, {spr_count} SPR")

if __name__ == "__main__":
    target_file = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    questions = generate_questions()
    inject_questions(questions, target_file)
