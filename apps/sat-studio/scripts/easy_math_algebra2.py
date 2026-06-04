import json
import uuid
import random
import os

BANK_PATH = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

def generate_easy_math_questions():
    questions = []
    
    # 25 Linear equations in two variables (19 MCQ, 6 SPR)
    for i in range(25):
        is_mcq = i < 19
        q = generate_linear_equations_2var(is_mcq)
        questions.append(q)
        
    # 25 Linear functions (19 MCQ, 6 SPR)
    for i in range(25):
        is_mcq = i < 19
        q = generate_linear_functions(is_mcq)
        questions.append(q)
        
    return questions

def generate_linear_equations_2var(is_mcq):
    _id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
    
    subtype = random.choice(["evaluate", "intercept", "standard_to_slope"])
    
    if subtype == "evaluate":
        a = random.randint(1, 5)
        b = random.randint(1, 5)
        x_val = random.randint(1, 5)
        y_val = random.randint(1, 5)
        c = a * x_val + b * y_val
        
        prompt = f"In the equation {a}x + {b}y = {c}, if x = {x_val}, what is the value of y?"
        correct_answer = str(y_val)
        
        if is_mcq:
            distractor1 = str(y_val + b) 
            distractor2 = str(x_val) 
            distractor3 = str((c + a*x_val)//b if (c + a*x_val)%b==0 else y_val + 2)
            distractors = list(set([distractor1, distractor2, distractor3]))
            while len(distractors) < 3 or correct_answer in distractors:
                distractors.append(str(random.randint(10, 20)))
                distractors = list(set(distractors))
                if correct_answer in distractors: distractors.remove(correct_answer)
            
            choices = [{"text": d} for d in distractors[:3]] + [{"text": correct_answer}]
            random.shuffle(choices)
            correct_index = [c["text"] for c in choices].index(correct_answer)
            correct_ans_val = chr(65 + correct_index)
        else:
            choices = None
            correct_ans_val = correct_answer

        explanation = {
            "correct": f"Substitute x = {x_val} into the equation:\n{a}({x_val}) + {b}y = {c}\n{a*x_val} + {b}y = {c}\nSubtract {a*x_val} from both sides:\n{b}y = {c - a*x_val}\nDivide by {b}:\ny = {y_val}.",
            "distractors": {
                "Sign Error": "Added instead of subtracting when isolating y.",
                "Variable Confusion": "Solved for x instead of y, or mixed up the variables.",
                "Calculation Error": "Made a basic arithmetic error during subtraction or division."
            } if is_mcq else {}
        }
        
    elif subtype == "intercept":
        a = random.choice([2, 3, 4, 5])
        b = random.choice([2, 3, 4, 5])
        y_int = random.randint(2, 6)
        c = b * y_int
        
        prompt = f"What is the y-coordinate of the y-intercept of the graph of {a}x + {b}y = {c} in the xy-plane?"
        correct_answer = str(y_int)
        
        if is_mcq:
            distractor1 = str(c) 
            x_int = c/a
            distractor2 = str(int(x_int)) if c%a==0 else str(y_int + a) 
            distractor3 = str(-y_int) 
            distractors = list(set([distractor1, distractor2, distractor3]))
            while len(distractors) < 3 or correct_answer in distractors:
                distractors.append(str(random.randint(10, 20)))
                distractors = list(set(distractors))
                if correct_answer in distractors: distractors.remove(correct_answer)
            
            choices = [{"text": d} for d in distractors[:3]] + [{"text": correct_answer}]
            random.shuffle(choices)
            correct_index = [c["text"] for c in choices].index(correct_answer)
            correct_ans_val = chr(65 + correct_index)
        else:
            choices = None
            correct_ans_val = correct_answer
            
        explanation = {
            "correct": f"To find the y-intercept, set x = 0 and solve for y.\n{a}(0) + {b}y = {c}\n{b}y = {c}\ny = {y_int}.",
            "distractors": {
                "Missed Division": "Used the constant term as the intercept without dividing by the coefficient of y.",
                "x-intercept Confusion": "Found the x-intercept by setting y to 0.",
                "Sign Error": "Divided by a negative or flipped the sign incorrectly."
            } if is_mcq else {}
        }
        
    else: 
        a = random.randint(2, 6)
        c = random.randint(5, 15)
        
        prompt = f"The equation {a}x + y = {c} is graphed in the xy-plane. What is the slope of the line?"
        correct_answer = str(-a)
        
        if is_mcq:
            distractor1 = str(a) 
            distractor2 = str(c) 
            distractor3 = str(-c) 
            distractors = list(set([distractor1, distractor2, distractor3]))
            while len(distractors) < 3 or correct_answer in distractors:
                distractors.append(str(random.randint(7, 20)))
                distractors = list(set(distractors))
                if correct_answer in distractors: distractors.remove(correct_answer)
            
            choices = [{"text": d} for d in distractors[:3]] + [{"text": correct_answer}]
            random.shuffle(choices)
            correct_index = [c["text"] for c in choices].index(correct_answer)
            correct_ans_val = chr(65 + correct_index)
        else:
            choices = None
            correct_ans_val = correct_answer
            
        explanation = {
            "correct": f"Rewrite the equation in slope-intercept form, y = mx + b, where m is the slope.\nSubtract {a}x from both sides:\ny = -{a}x + {c}\nThe slope is -{a}.",
            "distractors": {
                "Sign Error": "Forgot to change the sign of the x coefficient when moving it to the other side.",
                "Intercept Confusion": "Identified the y-intercept instead of the slope.",
                "Calculation Error": "Confused both the sign and the role of the constant."
            } if is_mcq else {}
        }
        
    return {
        "id": _id,
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear equations in two variables",
        "difficulty": "Easy",
        "prompt": prompt,
        "type": "MCQ" if is_mcq else "SPR",
        "choices": choices,
        "correctAnswer": correct_ans_val,
        "explanation": explanation,
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-alg2",
            "targetBand": "SAT-1200",
            "cognitiveMove": "Procedural calculation or basic algebraic manipulation.",
            "trapTypes": ["Sign Error", "Variable Confusion", "Intercept Confusion"]
        }
    }

def generate_linear_functions(is_mcq):
    _id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
    
    subtype = random.choice(["evaluate_fx", "interpret_slope", "interpret_yint"])
    
    if subtype == "evaluate_fx":
        m = random.randint(2, 5)
        b = random.randint(1, 10)
        x_val = random.randint(2, 6)
        correct_y = m * x_val + b
        
        prompt = f"The function f is defined by f(x) = {m}x + {b}. What is the value of f({x_val})?"
        correct_answer = str(correct_y)
        
        if is_mcq:
            distractor1 = str(m * x_val) 
            distractor2 = str(x_val + b) 
            distractor3 = str(m * (x_val + b)) 
            distractors = list(set([distractor1, distractor2, distractor3]))
            while len(distractors) < 3 or correct_answer in distractors:
                distractors.append(str(random.randint(10, 40)))
                distractors = list(set(distractors))
                if correct_answer in distractors: distractors.remove(correct_answer)
                
            choices = [{"text": d} for d in distractors[:3]] + [{"text": correct_answer}]
            random.shuffle(choices)
            correct_index = [c["text"] for c in choices].index(correct_answer)
            correct_ans_val = chr(65 + correct_index)
        else:
            choices = None
            correct_ans_val = correct_answer
            
        explanation = {
            "correct": f"Substitute x = {x_val} into the function:\nf({x_val}) = {m}({x_val}) + {b}\nf({x_val}) = {m*x_val} + {b}\nf({x_val}) = {correct_y}.",
            "distractors": {
                "Forgot Constant": "Multiplied x by the slope but forgot to add the y-intercept.",
                "Forgot Slope": "Added x to the y-intercept without multiplying by the slope.",
                "Order of Operations": "Added the intercept to x before multiplying by the slope."
            } if is_mcq else {}
        }
        
    elif subtype == "interpret_slope":
        item = random.choice(["books", "apples", "tickets", "shirts"])
        rate = random.randint(3, 9)
        base = random.randint(10, 50)
        
        prompt = f"A company's total cost C, in dollars, to produce n {item} is given by the function C(n) = {rate}n + {base}. What does the number {rate} represent in the function?"
        
        if is_mcq:
            correct_text = f"The cost to produce each additional {item[:-1]}"
            distractor1 = f"The total cost to produce {rate} {item}"
            distractor2 = f"The initial cost before producing any {item}"
            distractor3 = f"The number of {item} produced for every additional dollar"
            
            choices = [
                {"text": correct_text},
                {"text": distractor1},
                {"text": distractor2},
                {"text": distractor3}
            ]
            random.shuffle(choices)
            correct_index = [c["text"] for c in choices].index(correct_text)
            correct_ans_val = chr(65 + correct_index)
        else:
            return generate_linear_functions_evaluate_fallback()
            
        explanation = {
            "correct": f"In the linear function C(n) = {rate}n + {base}, {rate} is the slope. The slope represents the rate of change, which is the additional cost per {item[:-1]}.",
            "distractors": {
                "Total Cost Confusion": "Interpreted the rate as the total cost for a certain number of items.",
                "Intercept Confusion": "Confused the slope (rate of change) with the y-intercept (initial value).",
                "Inverse Rate Confusion": "Flipped the dependent and independent variables in the rate interpretation."
            }
        }
        
    else: 
        item = random.choice(["savings", "fee", "bonus", "weight"])
        rate = random.randint(2, 8)
        base = random.randint(20, 100)
        
        if item == "savings":
            prompt = f"Tom's total savings S, in dollars, after w weeks is modeled by the function S(w) = {rate}w + {base}. What does the number {base} represent?"
            correct_text = "The amount of money Tom had saved initially"
            distractor1 = "The amount Tom saves each week"
            distractor2 = "The total savings after w weeks"
            distractor3 = "The number of weeks it takes to save the total amount"
        elif item == "fee":
            prompt = f"The total cost F, in dollars, for renting a machine for h hours is given by the function F(h) = {rate}h + {base}. What does the number {base} represent?"
            correct_text = "The base fee for renting the machine"
            distractor1 = "The cost per hour of renting the machine"
            distractor2 = "The total cost for the rental"
            distractor3 = "The number of hours the machine is rented"
        else:
            prompt = f"The total score P, in points, for a player after completing x levels is modeled by the function P(x) = {rate}x + {base}. What does the number {base} represent?"
            correct_text = "The starting score before completing any levels"
            distractor1 = "The points earned per level completed"
            distractor2 = "The total score after x levels"
            distractor3 = "The number of levels completed"

        if is_mcq:
            choices = [
                {"text": correct_text},
                {"text": distractor1},
                {"text": distractor2},
                {"text": distractor3}
            ]
            random.shuffle(choices)
            correct_index = [c["text"] for c in choices].index(correct_text)
            correct_ans_val = chr(65 + correct_index)
        else:
            return generate_linear_functions_evaluate_fallback()

        explanation = {
            "correct": f"In the linear function of the form y = mx + b, the constant term b is the y-intercept. This represents the initial value when the independent variable is 0.",
            "distractors": {
                "Slope Confusion": "Confused the y-intercept (initial value) with the slope (rate of change).",
                "Output Confusion": "Interpreted the constant as the total output value.",
                "Input Confusion": "Interpreted the constant as the input variable."
            }
        }
        
    return {
        "id": _id,
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear functions",
        "difficulty": "Easy",
        "prompt": prompt,
        "type": "MCQ" if is_mcq else "SPR",
        "choices": choices,
        "correctAnswer": correct_ans_val,
        "explanation": explanation,
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-alg2",
            "targetBand": "SAT-1200",
            "cognitiveMove": "Interpret linear models or evaluate functions.",
            "trapTypes": ["Slope-Intercept Confusion", "Calculation Error", "Interpretation Error"]
        }
    }

def generate_linear_functions_evaluate_fallback():
    _id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
    m = random.randint(3, 8)
    b = random.randint(5, 15)
    x_val = random.randint(2, 7)
    correct_y = m * x_val + b
    prompt = f"A plant's height H, in centimeters, after t days is modeled by the function H(t) = {m}t + {b}. What is the height of the plant, in centimeters, after {x_val} days?"
    
    return {
        "id": _id,
        "section": "Math",
        "domain": "Algebra",
        "skill": "Linear functions",
        "difficulty": "Easy",
        "prompt": prompt,
        "type": "SPR",
        "choices": None,
        "correctAnswer": str(correct_y),
        "explanation": {
            "correct": f"Substitute t = {x_val} into the function H(t).\nH({x_val}) = {m}({x_val}) + {b}\nH({x_val}) = {m*x_val} + {b} = {correct_y}.",
            "distractors": {}
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-math-alg2",
            "targetBand": "SAT-1200",
            "cognitiveMove": "Evaluate a linear function for a given input.",
            "trapTypes": ["Calculation Error"]
        }
    }

def main():
    questions = generate_easy_math_questions()
    
    try:
        with open(BANK_PATH, "r", encoding="utf-8") as f:
            bank = json.load(f)
    except FileNotFoundError:
        bank = []
        
    bank.extend(questions)
    
    with open(BANK_PATH, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Generated and added {len(questions)} Easy Math questions to the bank.")

if __name__ == "__main__":
    main()
