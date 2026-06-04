import json
import uuid
import random
import os

def generate_uuid():
    return str(uuid.uuid4())[:8]

def get_unicode_exponent(n):
    superscripts = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'}
    return ''.join(superscripts.get(char, char) for char in str(n))

def generate_questions():
    questions = []
    
    # Category 1: y-intercept of quadratic
    for i in range(15):
        q_type = "MCQ" if i < 11 else "SPR"
        if q_type == "MCQ":
            a = random.randint(-9, 9)
            while a == 0: a = random.randint(-9, 9)
            b = random.randint(-9, 9)
            while b == 0 or abs(a) == abs(b): b = random.randint(-9, 9)
            ans = a * b
            prompt = f"The function f is defined by f(x) = (x {'-' if a > 0 else '+'} {abs(a)})(x {'-' if b > 0 else '+'} {abs(b)}). What is the y-intercept of the graph of y = f(x) in the xy-plane?"
            
            choices = [
                f"(0, {ans})",
                f"({ans}, 0)", # Confused x and y intercepts
                f"(0, {-ans})", # Sign Error
                f"(0, {-(a+b)})" # Wrong operation
            ]
            # Ensure unique choices
            if choices[2] == choices[3]:
                choices[3] = f"(0, {-(a+b)+1})"
            if choices[0] == choices[3]:
                choices[3] = f"(0, {ans+1})"

            correct = choices[0]
            random.shuffle(choices)
            correct_index = chr(65 + choices.index(correct))
            
            distractors = {}
            for ch in choices:
                if ch == correct: continue
                if ch == f"({ans}, 0)":
                    distractors[ch] = "This represents an x-intercept point format, not a y-intercept. The y-intercept has an x-coordinate of 0."
                elif ch == f"(0, {-ans})":
                    distractors[ch] = "Sign Error: Check the multiplication of the constant terms. f(0) requires multiplying the two constants with their correct signs."
                else:
                    distractors[ch] = "Calculation Error: To find the y-intercept, substitute x = 0 and multiply the constants."
                    
            question = {
                "id": f"antigravity-easy-{generate_uuid()}",
                "section": "Math",
                "domain": "Advanced Math",
                "skill": "Nonlinear functions",
                "difficulty": "Easy",
                "targetBand": "SAT-1200",
                "type": "MCQ",
                "prompt": prompt,
                "choices": choices,
                "correctAnswer": correct_index,
                "explanation": {
                    "correct": f"To find the y-intercept, substitute x = 0 into the function:\nf(0) = (0 {'-' if a > 0 else '+'} {abs(a)})(0 {'-' if b > 0 else '+'} {abs(b)})\nf(0) = ({-a})({-b}) = {ans}.\nThe y-intercept is (0, {ans}).",
                    "distractors": distractors
                },
                "metadata": {
                    "cognitiveMove": "Identify y-intercept by evaluating f(0)",
                    "trapTypes": ["Confused x and y intercepts", "Sign Error", "Calculation Error"],
                    "sourceSignalId": "antigravity-easy-math-adv3"
                }
            }
        else:
            a = random.randint(1, 9)
            b = random.randint(1, 9)
            if a == b: b += 1
            ans = a * b
            prompt = f"The function f is defined by f(x) = (x - {a})(x - {b}). The y-intercept of the graph of y = f(x) in the xy-plane is (0, y). What is the value of y?"
            
            question = {
                "id": f"antigravity-easy-{generate_uuid()}",
                "section": "Math",
                "domain": "Advanced Math",
                "skill": "Nonlinear functions",
                "difficulty": "Easy",
                "targetBand": "SAT-1200",
                "type": "SPR",
                "prompt": prompt,
                "correctAnswer": str(ans),
                "explanation": {
                    "correct": f"To find the y-intercept, substitute x = 0 into the function:\nf(0) = (0 - {a})(0 - {b})\nf(0) = ({-a})({-b}) = {ans}.\nThe value of y is {ans}.",
                },
                "metadata": {
                    "cognitiveMove": "Identify y-intercept by evaluating f(0)",
                    "trapTypes": [],
                    "sourceSignalId": "antigravity-easy-math-adv3"
                }
            }
        questions.append(question)
        
    # Category 2: Evaluating exponential f(0) or f(1)
    for i in range(15):
        q_type = "MCQ" if i < 11 else "SPR"
        base_val = random.randint(2, 8)
        coeff = random.randint(2, 12)
        eval_at = random.choice([0, 1])
        
        prompt = f"The function f is defined by f(x) = {coeff}({base_val}){get_unicode_exponent('x')}. What is the value of f({eval_at})?"
        ans = coeff if eval_at == 0 else coeff * base_val
        
        if q_type == "MCQ":
            wrong1 = coeff * base_val if eval_at == 0 else coeff
            wrong2 = base_val if eval_at == 0 else coeff + base_val
            wrong3 = 0 if eval_at == 0 else base_val
            
            # Ensure unique options
            if wrong1 == ans: wrong1 = ans + 1
            if wrong2 in [ans, wrong1]: wrong2 = ans + 2
            if wrong3 in [ans, wrong1, wrong2]: wrong3 = ans + 3
            
            choices = [str(ans), str(wrong1), str(wrong2), str(wrong3)]
            correct = choices[0]
            random.shuffle(choices)
            correct_index = chr(65 + choices.index(correct))
            
            distractors = {}
            for ch in choices:
                if ch != str(ans):
                    if ch == str(coeff * base_val) and eval_at == 0:
                        distractors[ch] = "This is the value of f(1), not f(0). Remember that any non-zero number to the power of 0 is 1."
                    elif ch == str(coeff) and eval_at == 1:
                        distractors[ch] = "This is the value of f(0), not f(1)."
                    else:
                        distractors[ch] = "Calculation error when evaluating the exponential function."
            
            question = {
                "id": f"antigravity-easy-{generate_uuid()}",
                "section": "Math",
                "domain": "Advanced Math",
                "skill": "Nonlinear functions",
                "difficulty": "Easy",
                "targetBand": "SAT-1200",
                "type": "MCQ",
                "prompt": prompt,
                "choices": choices,
                "correctAnswer": correct_index,
                "explanation": {
                    "correct": f"Substitute x = {eval_at} into the function:\nf({eval_at}) = {coeff}({base_val}){get_unicode_exponent(str(eval_at))}\nSince {base_val}{get_unicode_exponent(str(eval_at))} = {1 if eval_at == 0 else base_val}, we have f({eval_at}) = {coeff}({1 if eval_at == 0 else base_val}) = {ans}.",
                    "distractors": distractors
                },
                "metadata": {
                    "cognitiveMove": "Evaluate exponential function at a specific value",
                    "trapTypes": ["Wrong Evaluation", "Calculation Error"],
                    "sourceSignalId": "antigravity-easy-math-adv3"
                }
            }
        else:
            question = {
                "id": f"antigravity-easy-{generate_uuid()}",
                "section": "Math",
                "domain": "Advanced Math",
                "skill": "Nonlinear functions",
                "difficulty": "Easy",
                "targetBand": "SAT-1200",
                "type": "SPR",
                "prompt": prompt,
                "correctAnswer": str(ans),
                "explanation": {
                    "correct": f"Substitute x = {eval_at} into the function:\nf({eval_at}) = {coeff}({base_val}){get_unicode_exponent(str(eval_at))}\nSince {base_val}{get_unicode_exponent(str(eval_at))} = {1 if eval_at == 0 else base_val}, we have f({eval_at}) = {coeff}({1 if eval_at == 0 else base_val}) = {ans}.",
                },
                "metadata": {
                    "cognitiveMove": "Evaluate exponential function at a specific value",
                    "trapTypes": [],
                    "sourceSignalId": "antigravity-easy-math-adv3"
                }
            }
        questions.append(question)
        
    # Category 3: Finding roots/x-intercepts from factored form
    for i in range(15):
        q_type = "MCQ" if i < 12 else "SPR"
        root1 = random.randint(1, 9)
        root2 = random.randint(-9, -1)
        
        prompt = f"The function f is defined by f(x) = (x - {root1})(x {'+' if -root2 > 0 else '-'} {abs(root2)}). What is a positive x-intercept of the graph of y = f(x)?"
        ans = root1
        
        if q_type == "MCQ":
            choices = [
                str(ans),
                str(-ans), # Sign Error
                str(abs(root2)), # Wrong root sign
                str(ans * -root2) # y-intercept
            ]
            # Ensure unique options
            choices = list(dict.fromkeys(choices))
            while len(choices) < 4:
                new_choice = str(random.randint(10, 20))
                if new_choice not in choices:
                    choices.append(new_choice)
                    
            correct = str(ans)
            random.shuffle(choices)
            correct_index = chr(65 + choices.index(correct))
            
            distractors = {}
            for ch in choices:
                if ch == correct: continue
                if ch == str(-ans):
                    distractors[ch] = f"Sign Error: Setting x - {root1} = 0 gives x = {root1}, not -{root1}."
                elif ch == str(abs(root2)):
                    distractors[ch] = "This is related to the other root. The question asks for the positive x-intercept."
                elif ch == str(ans * -root2):
                    distractors[ch] = "Confused x and y intercepts: This is the y-intercept, not an x-intercept."
                else:
                    distractors[ch] = "Calculation error."
                    
            question = {
                "id": f"antigravity-easy-{generate_uuid()}",
                "section": "Math",
                "domain": "Advanced Math",
                "skill": "Nonlinear functions",
                "difficulty": "Easy",
                "targetBand": "SAT-1200",
                "type": "MCQ",
                "prompt": prompt,
                "choices": choices,
                "correctAnswer": correct_index,
                "explanation": {
                    "correct": f"The x-intercepts of the graph occur where f(x) = 0.\n0 = (x - {root1})(x {'+' if -root2 > 0 else '-'} {abs(root2)})\nThe roots are x = {root1} and x = {root2}.\nThe positive x-intercept is {root1}.",
                    "distractors": distractors
                },
                "metadata": {
                    "cognitiveMove": "Identify x-intercepts from factored form",
                    "trapTypes": ["Sign Error", "Confused x and y intercepts"],
                    "sourceSignalId": "antigravity-easy-math-adv3"
                }
            }
        else:
            prompt = f"The function f is defined by f(x) = (x - {root1})(x {'+' if -root2 > 0 else '-'} {abs(root2)}). What is the positive value of x for which f(x) = 0?"
            question = {
                "id": f"antigravity-easy-{generate_uuid()}",
                "section": "Math",
                "domain": "Advanced Math",
                "skill": "Nonlinear functions",
                "difficulty": "Easy",
                "targetBand": "SAT-1200",
                "type": "SPR",
                "prompt": prompt,
                "correctAnswer": str(ans),
                "explanation": {
                    "correct": f"The values of x for which f(x) = 0 are the roots of the equation.\n0 = (x - {root1})(x {'+' if -root2 > 0 else '-'} {abs(root2)})\nThe roots are x = {root1} and x = {root2}.\nThe positive value is {root1}.",
                },
                "metadata": {
                    "cognitiveMove": "Identify roots from factored form",
                    "trapTypes": [],
                    "sourceSignalId": "antigravity-easy-math-adv3"
                }
            }
        questions.append(question)

    return questions

def main():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(bank_path), exist_ok=True)
    
    bank = []
    if os.path.exists(bank_path):
        with open(bank_path, 'r', encoding='utf-8') as f:
            try:
                bank = json.load(f)
            except json.JSONDecodeError:
                pass
                
    new_questions = generate_questions()
    bank.extend(new_questions)
    
    with open(bank_path, 'w', encoding='utf-8') as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated and injected {len(new_questions)} Easy Math Advanced questions.")
    
    mcq_count = sum(1 for q in new_questions if q['type'] == 'MCQ')
    spr_count = sum(1 for q in new_questions if q['type'] == 'SPR')
    print(f"Distribution: {mcq_count} MCQ, {spr_count} SPR")

if __name__ == '__main__':
    main()
