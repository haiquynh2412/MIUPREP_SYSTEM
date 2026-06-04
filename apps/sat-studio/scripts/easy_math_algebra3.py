import json
import uuid
import random
import os

def generate_system_eq(is_mcq=True):
    temp = random.choice([1, 2, 3])
    
    if temp == 1:
        # y = kx
        # ax + by = c
        k = random.choice([2, 3, 4, 5])
        a = random.choice([1, 2, 3])
        b = random.choice([1, 2])
        x_ans = random.choice([2, 3, 4, 5])
        y_ans = k * x_ans
        c = a * x_ans + b * y_ans
        
        target = random.choice(['x', 'y'])
        ans = x_ans if target == 'x' else y_ans
        wrong_ans = y_ans if target == 'x' else x_ans
        
        prompt = f"The solution to the given system of equations is (x, y).\n\ny = {k}x\n{a}x + {b}y = {c}\n\nWhat is the value of {target}?"
        
        if is_mcq:
            d1 = str(wrong_ans) # Solved for Wrong Variable
            
            wrong_x2 = c // (a + k) if (a+k) != 0 else x_ans + 1
            if wrong_x2 == x_ans or wrong_x2 == wrong_ans: wrong_x2 = x_ans + 2
            d2 = str(wrong_x2 if target == 'x' else k * wrong_x2) # Calculation Error
            
            d3 = str(-ans) # Sign Error
            if d3 in [d1, d2, str(ans)]: d3 = str(ans + random.choice([1, -1]))
            
            pairs = list(zip([str(ans), d1, d2, d3], ["correct", "Solved for Wrong Variable", "Calculation Error", "Sign Error"]))
            random.shuffle(pairs)
            
            choices = [{"text": p[0]} for p in pairs]
            correct_idx = [p[1] for p in pairs].index("correct")
            distractor_map = {}
            for i, p in enumerate(pairs):
                if p[1] != "correct":
                    distractor_map[str(i)] = p[1]
                    
            return prompt, choices, str(correct_idx), distractor_map, target, ans, x_ans, y_ans, f"y = {k}x", f"{a}x + {b}y = {c}"
        else:
            return prompt, target, ans, x_ans, y_ans, f"y = {k}x", f"{a}x + {b}y = {c}"
            
    elif temp == 2:
        # ax + by = c
        # dx - by = e
        a = random.choice([1, 2, 3])
        d = random.choice([1, 2, 3])
        b = random.choice([1, 2, 3, 4])
        x_ans = random.choice([2, 3, 4, 5])
        y_ans = random.choice([1, 2, 3, 4])
        c = a * x_ans + b * y_ans
        e = d * x_ans - b * y_ans
        
        target = 'x'
        ans = x_ans
        
        eq1 = f"{a}x + {b}y = {c}" if a != 1 else f"x + {b}y = {c}"
        if b == 1: eq1 = f"{a}x + y = {c}" if a != 1 else f"x + y = {c}"
        
        eq2 = f"{d}x - {b}y = {e}" if d != 1 else f"x - {b}y = {e}"
        if b == 1: eq2 = f"{d}x - y = {e}" if d != 1 else f"x - y = {e}"
        
        prompt = f"The solution to the given system of equations is (x, y).\n\n{eq1}\n{eq2}\n\nWhat is the value of x?"
        
        if is_mcq:
            d1 = str(y_ans) # Solved for Wrong Variable
            
            wrong_x2 = (c - e) // (a - d) if (a - d) != 0 else x_ans + 1
            if wrong_x2 in [x_ans, y_ans]: wrong_x2 = x_ans + 2
            d2 = str(wrong_x2) # Opposite Operation
            
            d3 = str(x_ans + 1)
            if d3 in [d1, d2, str(ans)]: d3 = str(x_ans - 1)
            
            pairs = list(zip([str(ans), d1, d2, d3], ["correct", "Solved for Wrong Variable", "Opposite Operation", "Calculation Error"]))
            random.shuffle(pairs)
            
            choices = [{"text": p[0]} for p in pairs]
            correct_idx = [p[1] for p in pairs].index("correct")
            distractor_map = {}
            for i, p in enumerate(pairs):
                if p[1] != "correct":
                    distractor_map[str(i)] = p[1]
                    
            return prompt, choices, str(correct_idx), distractor_map, target, ans, x_ans, y_ans, eq1, eq2
        else:
            return prompt, target, ans, x_ans, y_ans, eq1, eq2
            
    else:
        # ax + by = c
        # ax + dy = e
        a = random.choice([1, 2, 3, 4])
        b = random.choice([2, 3, 4, 5])
        d = random.choice([1, 2, 3])
        if b == d: d = b - 1
        x_ans = random.choice([1, 2, 3, 4])
        y_ans = random.choice([2, 3, 4, 5])
        c = a * x_ans + b * y_ans
        e = a * x_ans + d * y_ans
        
        target = 'y'
        ans = y_ans
        
        eq1 = f"{a}x + {b}y = {c}" if a != 1 else f"x + {b}y = {c}"
        eq2 = f"{a}x + {d}y = {e}" if a != 1 else f"x + {d}y = {e}"
        if d == 1: eq2 = f"{a}x + y = {e}" if a != 1 else f"x + y = {e}"
        
        prompt = f"The solution to the given system of equations is (x, y).\n\n{eq1}\n{eq2}\n\nWhat is the value of y?"
        
        if is_mcq:
            d1 = str(x_ans) # Solved for Wrong Variable
            
            wrong_y2 = (c + e) // (b + d) if (b + d) != 0 else y_ans + 1
            if wrong_y2 in [y_ans, x_ans]: wrong_y2 = y_ans + 2
            d2 = str(wrong_y2) # Opposite Operation
            
            d3 = str(y_ans + 1)
            if d3 in [d1, d2, str(ans)]: d3 = str(y_ans - 1)
            
            pairs = list(zip([str(ans), d1, d2, d3], ["correct", "Solved for Wrong Variable", "Opposite Operation", "Calculation Error"]))
            random.shuffle(pairs)
            
            choices = [{"text": p[0]} for p in pairs]
            correct_idx = [p[1] for p in pairs].index("correct")
            distractor_map = {}
            for i, p in enumerate(pairs):
                if p[1] != "correct":
                    distractor_map[str(i)] = p[1]
                    
            return prompt, choices, str(correct_idx), distractor_map, target, ans, x_ans, y_ans, eq1, eq2
        else:
            return prompt, target, ans, x_ans, y_ans, eq1, eq2

def main():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    with open(bank_path, 'r', encoding='utf-8') as f:
        bank = json.load(f)
        
    questions_generated = 0
    
    for _ in range(38):
        prompt, choices, correct_idx, distractor_map, target, ans, x_ans, y_ans, eq1, eq2 = generate_system_eq(is_mcq=True)
        
        distractor_explanations = {}
        for idx, trap in distractor_map.items():
            if trap == "Solved for Wrong Variable":
                distractor_explanations[idx] = f"This is the {trap} trap. You solved for the other variable instead of {target}."
            elif trap == "Calculation Error" or trap == "Sign Error":
                distractor_explanations[idx] = f"This is the {trap} trap. Check your steps during addition, subtraction, or substitution."
            else:
                distractor_explanations[idx] = f"This is the {trap} trap. You may have added when you should have subtracted, or vice versa."
                
        q = {
            "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
            "section": "Math",
            "domain": "Algebra",
            "skill": "Systems of linear equations",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": correct_idx,
            "explanation": {
                "correct": f"To find {target}, we solve the system:\n1) {eq1}\n2) {eq2}\n\nBy substituting or eliminating variables, we find x = {x_ans} and y = {y_ans}. The question asks for {target}, which is {ans}.",
                "distractors": distractor_explanations
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-alg3",
                "cognitiveMove": "Solve standard system of linear equations",
                "trapTypes": list(set(distractor_map.values()))
            }
        }
        bank.append(q)
        questions_generated += 1
        
    for _ in range(12):
        prompt, target, ans, x_ans, y_ans, eq1, eq2 = generate_system_eq(is_mcq=False)
        q = {
            "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
            "section": "Math",
            "domain": "Algebra",
            "skill": "Systems of linear equations",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "SPR",
            "prompt": prompt,
            "correctAnswer": str(ans),
            "explanation": {
                "correct": f"To find {target}, we solve the system:\n1) {eq1}\n2) {eq2}\n\nBy substituting or eliminating variables, we find x = {x_ans} and y = {y_ans}. The question asks for {target}, which is {ans}."
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-math-alg3",
                "cognitiveMove": "Solve standard system of linear equations"
            }
        }
        bank.append(q)
        questions_generated += 1
        
    with open(bank_path, 'w', encoding='utf-8') as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated and added {questions_generated} Easy Math questions for Systems of linear equations.")

if __name__ == '__main__':
    main()
