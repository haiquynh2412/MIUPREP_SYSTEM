import json
import os
import uuid
import random

questions = []

def add_q(domain, skill, q_type, prompt, choices, answer, exp_corr, exp_dist, cog_move, trap_types):
    q = {
        "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
        "section": "Math",
        "domain": domain,
        "skill": skill,
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "prompt": prompt,
        "type": q_type,
        "correctAnswer": answer,
        "explanation": {
            "correct": exp_corr,
            "distractors": exp_dist
        },
        "metadata": {
            "cognitiveMove": cog_move,
            "trapTypes": trap_types,
            "sourceSignalId": "antigravity-1600-math-data1",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    if q_type == "MCQ":
        q["choices"] = choices
    questions.append(q)

# ---------------------------------------------------------
# PERCENTAGES (25 questions: 19 MCQ, 6 SPR)
# ---------------------------------------------------------

# Template P1: Chained percentages (MCQ) - 4 questions
contexts_p1 = [
    ("The population of a city", "increases", "decreases", "final population", "initial population P"),
    ("A company's revenue", "increases", "decreases", "final revenue", "initial revenue R"),
    ("The mass of a crystal", "grows", "shrinks", "final mass", "initial mass M"),
    ("The value of an antique", "appreciates", "depreciates", "final value", "initial value V")
]
vars_p1 = [("p", "2"), ("k", "3"), ("r", "4"), ("m", "2")]

for i in range(4):
    ctx, inc, dec, fin, init = contexts_p1[i]
    var, yrs = vars_p1[i]
    prompt = f"{ctx} {inc} by {var}% each year for {yrs} years, then {dec} by {var}% each year for the next {yrs} years. Which expression represents the {fin} in terms of its {init}?"
    ans = f"{init[-1]} · (1 - ({var}/100)²)^{yrs}" if yrs != "1" else f"{init[-1]} · (1 - ({var}/100)²)"
    
    if yrs == "2":
        choices = [
            f"{init[-1]} · (1 - ({var}/100)⁴)",
            f"{init[-1]}",
            f"{init[-1]} · (1 - ({var}²/100))",
            f"{init[-1]} · (1 - ({var}/100)²)²"
        ]
        ans = choices[3]
    elif yrs == "3":
        choices = [
            f"{init[-1]} · (1 - ({var}/100)⁶)",
            f"{init[-1]} · (1 - ({var}/100)²)³",
            f"{init[-1]}",
            f"{init[-1]} · (1 - ({var}³/100))"
        ]
        ans = choices[1]
    elif yrs == "4":
        choices = [
            f"{init[-1]}",
            f"{init[-1]} · (1 - ({var}/100)²)⁴",
            f"{init[-1]} · (1 - ({var}/100)⁸)",
            f"{init[-1]} · (1 - ({var}⁴/100))"
        ]
        ans = choices[1]

    add_q(
        "Problem-Solving and Data Analysis", "Percentages", "MCQ", prompt, choices, ans,
        f"Path 1 (Algebraic translation): An increase of {var}% corresponds to a multiplier of (1 + {var}/100). A decrease of {var}% corresponds to a multiplier of (1 - {var}/100). Over {yrs} years, the combined multiplier is (1 + {var}/100)^{yrs} · (1 - {var}/100)^{yrs}. Using the difference of squares, ( (1 + {var}/100)(1 - {var}/100) )^{yrs} = (1 - ({var}/100)²)^{yrs}. Path 2 (Plugging in): Let {var} = 10. The multiplier is (1.1)^{yrs} · (0.9)^{yrs} = (0.99)^{yrs}. The choice yielding 0.99^{yrs} when {var}=10 is the correct one.",
        {
            "Base Error": f"Assuming an increase of {var}% followed by a decrease of {var}% results in no net change, leading to {init[-1]}.",
            "Exponent Trap": "Incorrectly combining the exponents, e.g., adding them instead of multiplying the bases.",
            "Fraction Error": f"Writing {var}²/100 instead of ({var}/100)²."
        },
        "Difference of squares applied to percentage multipliers.",
        ["Base Error", "Exponent Trap"]
    )

# Template P2: Finding unknown parameter in percentage relationship (SPR) - 3 questions
contexts_p2 = [
    ("Quantity A is 25% greater than Quantity B. Quantity B is p% less than Quantity C. If Quantity A is equal to Quantity C, what is the value of p?", "20"),
    ("The price of a stock increased by 60%, then decreased by q% returning to its original price. What is the value of q?", "37.5"),
    ("A container's volume is expanded by 150%. To return to the original volume, it must be reduced by r%. What is the value of r?", "60")
]

for prompt, ans in contexts_p2:
    add_q(
        "Problem-Solving and Data Analysis", "Percentages", "SPR", prompt, [], ans,
        "Path 1 (Algebraic Setup): Let the initial value be 100. For the first case, A = 1.25B. If A = C, C = 1.25B. Then B = C / 1.25 = 0.80C. This means B is 20% less than C. The value is exactly symmetric. Path 2: Understand the multiplier. If multiplier 1 is M, multiplier 2 must be 1/M. Calculate 1/M, then convert back to a percentage decrease.",
        {},
        "Inverting a percentage change multiplier.",
        ["Added Percentages Trap", "Symmetry Trap"]
    )

# Template P3: Complex compound interest (MCQ) - 5 questions
contexts_p3 = [
    ("Account X earns an annual interest rate of r% compounded monthly. Account Y earns an annual interest rate of r% compounded semiannually. Both accounts start with deposit D.", "r", "monthly", "semiannually", "12", "2"),
    ("Investment A grows at k% compounded quarterly. Investment B grows at k% compounded annually.", "k", "quarterly", "annually", "4", "1"),
    ("Fund 1 yields a% compounded daily. Fund 2 yields a% compounded quarterly.", "a", "daily", "quarterly", "365", "4"),
    ("Savings P earns m% compounded monthly. Savings Q earns m% compounded yearly.", "m", "monthly", "yearly", "12", "1"),
    ("Bond J earns v% compounded semiannually. Bond K earns v% compounded quarterly.", "v", "semiannually", "quarterly", "2", "4")
]

for i in range(5):
    ctx, var, freq1, freq2, n1, n2 = contexts_p3[i]
    prompt = f"{ctx} Which expression represents the ratio of the amount in the first account to the amount in the second account after t years?"
    ans = f"( (1 + {var}/(100·{n1}))^{n1} / (1 + {var}/(100·{n2}))^{n2} )^t"
    choices = [
        ans,
        f"( (1 + {var}/{n1})^{n1} / (1 + {var}/{n2})^{n2} )^t",
        f"(1 + {var}/100)^({n1}·t - {n2}·t)",
        f"( {n1} / {n2} )^({var}·t)"
    ]
    random.shuffle(choices)
    add_q(
        "Problem-Solving and Data Analysis", "Percentages", "MCQ", prompt, choices, ans,
        f"Path 1 (Formula construction): The amount in an account with principal D, rate {var}%, compounded n times a year is A = D(1 + {var}/(100n))^(nt). Dividing the expressions for {n1} and {n2} times per year, the D cancels out. Grouping the exponent t gives the correct ratio. Path 2 (Analysis): The percentage rate must be divided by 100 and the frequency, forming {var}/(100n). Only the correct answer has the 100 in the denominator.",
        {
            "Missing 100": f"Forgetting to divide the percentage {var} by 100.",
            "Linear Subtraction": "Subtracting the exponents improperly.",
            "Base Ratio Error": "Taking the ratio of the compounding frequencies directly."
        },
        "Constructing and dividing compound interest formulas.",
        ["Missing 100", "Base Ratio Error"]
    )

# Template P4: Mixture variables (MCQ) - 5 questions
for i in range(5):
    var1 = ["x", "a", "m", "p", "c"][i]
    var2 = ["y", "b", "n", "q", "d"][i]
    prompt = f"A chemist mixes V liters of a {var1}% acid solution with 2V liters of a {var2}% acid solution. What is the percentage of acid in the final mixture?"
    ans = f"({var1} + 2{var2}) / 3"
    choices = [
        ans,
        f"({var1} + {var2}) / 3",
        f"({var1} + {var2}) / 2",
        f"({var1} + 2{var2}) / V"
    ]
    add_q(
        "Problem-Solving and Data Analysis", "Percentages", "MCQ", prompt, choices, ans,
        f"Path 1: The amount of acid is V·({var1}/100) + 2V·({var2}/100) = (V/100)({var1} + 2{var2}). The total volume is 3V. The fraction is (V/100)({var1} + 2{var2}) / 3V = ({var1} + 2{var2}) / 300. To convert to a percentage, multiply by 100, yielding ({var1} + 2{var2}) / 3. Path 2: Weighted average. The weights are 1 (for V) and 2 (for 2V). The weighted average percentage is (1·{var1} + 2·{var2}) / (1 + 2).",
        {
            "Simple Average": f"Taking the straight average ({var1} + {var2}) / 2, ignoring the volumes.",
            "Volume Trap": "Leaving V in the denominator.",
            "Wrong Weight": f"Using ({var1} + {var2}) / 3 without multiplying {var2} by 2."
        },
        "Weighted average computation for percentages.",
        ["Simple Average Trap"]
    )

# Template P5: Chained operations with variables (MCQ) - 5 questions
for i in range(5):
    item = ["car", "house", "computer", "machine", "boat"][i]
    var_d = ["d", "x", "k", "r", "w"][i]
    prompt = f"The price of a {item} is discounted by {var_d}%. Then, a tax of {var_d}% is applied to the discounted price. If the final price is F, which expression represents the original price?"
    ans = f"10000F / (10000 - {var_d}²)"
    choices = [
        ans,
        f"F",
        f"F / (1 - {var_d}²)",
        f"100F / (100 - {var_d})"
    ]
    add_q(
        "Problem-Solving and Data Analysis", "Percentages", "MCQ", prompt, choices, ans,
        f"Path 1: Let P be the original price. F = P(1 - {var_d}/100)(1 + {var_d}/100) = P(1 - {var_d}²/10000) = P( (10000 - {var_d}²) / 10000 ). Solving for P gives P = 10000F / (10000 - {var_d}²). Path 2: Plug in {var_d}=10. Multiplier is 0.9 * 1.1 = 0.99. So P = F / 0.99. Evaluate choices with {var_d}=10 to find the one that yields F / 0.99.",
        {
            "Net Zero Error": "Assuming the discount and tax cancel out, so P = F.",
            "Missing 10000": f"Writing F / (1 - {var_d}²) forgetting that the percentage is over 100.",
            "Single Apply": "Only accounting for the discount or making an additive error."
        },
        "Inverse of chained percentage operations.",
        ["Net Zero Error", "Missing 10000 Trap"]
    )

# Template P6: SPR Percentage logic - 3 questions
spr_p6 = [
    ("A radioactive sample decays by 20% every 3 days. What percentage of the original sample remains after 6 days? (Disregard the % sign when gridding your answer)", "64"),
    ("A bacteria colony increases its population by 50% every 4 hours. If it starts with P bacteria, what is the percentage increase after 8 hours? (Disregard the % sign)", "125"),
    ("The price of a commodity drops by 10% each month. After two months, what is the overall percentage decrease? (Disregard the % sign)", "19")
]
for prompt, ans in spr_p6:
    add_q(
        "Problem-Solving and Data Analysis", "Percentages", "SPR", prompt, [], ans,
        "Path 1: Calculate the multiplier. For 2 periods, M = (1 ± r)². For example, two 20% decays means 0.8 * 0.8 = 0.64, which is 64% remaining. For 50% increase, 1.5 * 1.5 = 2.25, which is a 125% increase. For 10% drop, 0.9 * 0.9 = 0.81, which is a 19% decrease.",
        {},
        "Translating multi-period exponential changes into net percentage change.",
        ["Additive Trap"]
    )

# We have: 4(P1) + 3(P2) + 5(P3) + 5(P4) + 5(P5) + 3(P6) = 25 questions
# Types: P1(MCQ,4), P2(SPR,3), P3(MCQ,5), P4(MCQ,5), P5(MCQ,5), P6(SPR,3).
# Total MCQ = 4 + 5 + 5 + 5 = 19. Total SPR = 3 + 3 = 6. Exact match!

# ---------------------------------------------------------
# PROBABILITY (25 questions: 19 MCQ, 6 SPR)
# ---------------------------------------------------------

# Template Pr1: Two-way table with variables (MCQ) - 5 questions
contexts_pr1 = [
    ("Group A", "Group B", "Passed", "Failed", "x", "2x", "3x", "4x"),
    ("Morning", "Evening", "Coffee", "Tea", "a", "3a", "2a", "4a"),
    ("Male", "Female", "Voted", "Did not vote", "k", "5k", "2k", "2k"),
    ("City X", "City Y", "Car", "Transit", "m", "m", "3m", "5m"),
    ("Class 1", "Class 2", "Math", "Science", "y", "4y", "2y", "3y")
]
for i in range(5):
    c1, c2, r1, r2, v11, v12, v21, v22 = contexts_pr1[i]
    var = v11[-1]
    prompt = f"In a survey, participants were categorized by ({c1}, {c2}) and ({r1}, {r2}). The number of participants in each category is given as follows: ({c1}, {r1}) = {v11}, ({c2}, {r1}) = {v12}, ({c1}, {r2}) = {v21}, ({c2}, {r2}) = {v22}. If a participant is selected at random from those who are in '{r1}', what is the probability they are in '{c2}'?"
    # Answer calculation: P(C2 | R1) = C2nR1 / R1 = v12 / (v11 + v12)
    coeff12 = int(v12[:-1]) if len(v12)>1 else 1
    coeff11 = int(v11[:-1]) if len(v11)>1 else 1
    ans_num = coeff12
    ans_den = coeff11 + coeff12
    ans = f"{ans_num}/{ans_den}"
    
    # Constructing choices
    choices = [
        ans,
        f"{ans_num}/{coeff11 + coeff12 + int(v21[:-1] if len(v21)>1 else 1) + int(v22[:-1] if len(v22)>1 else 1)}", # P(C2 and R1)
        f"{coeff12}/{coeff12 + int(v22[:-1] if len(v22)>1 else 1)}", # P(R1 | C2)
        f"{coeff11}/{ans_den}" # P(C1 | R1)
    ]
    add_q(
        "Problem-Solving and Data Analysis", "Probability and conditional probability", "MCQ", prompt, choices, ans,
        f"Path 1 (Formula): The question asks for the conditional probability P({c2} | {r1}). The formula is (Number in {c2} AND {r1}) / (Total in {r1}). The numerator is {v12}. The denominator is {v11} + {v12} = {ans_den}{var}. The probability is {v12} / {ans_den}{var} = {ans_num}/{ans_den}. Path 2 (Logic): Restrict the universe to only those in '{r1}'. There are {ans_den}{var} such people. Of these, {v12} are in '{c2}'. The ratio is {ans_num}/{ans_den}.",
        {
            "Marginal Error": "Dividing by the grand total of all participants instead of just those in the condition.",
            "Reversed Condition": f"Calculating P({r1} | {c2}) instead of P({c2} | {r1}).",
            "Wrong Column": f"Calculating P({c1} | {r1})."
        },
        "Restricting the sample space for conditional probability.",
        ["Marginal vs Conditional Confusion", "Reversed Condition"]
    )

# Template Pr2: Drawing without replacement with variables (MCQ) - 5 questions
contexts_pr2 = [
    ("red", "blue", "r", "b"),
    ("green", "yellow", "g", "y"),
    ("black", "white", "m", "n"),
    ("apples", "oranges", "a", "b"),
    ("cats", "dogs", "c", "d")
]
for i in range(5):
    c1, c2, v1, v2 = contexts_pr2[i]
    prompt = f"A bag contains {v1} {c1} marbles and {v2} {c2} marbles. Two marbles are drawn at random without replacement. Which expression represents the probability that the first marble is {c1} and the second is {c2}?"
    ans = f"({v1}·{v2}) / (({v1} + {v2})({v1} + {v2} - 1))"
    choices = [
        ans,
        f"({v1}·{v2}) / ({v1} + {v2})²",
        f"({v1}({v1} - 1)) / (({v1} + {v2})({v1} + {v2} - 1))",
        f"({v2}) / ({v1} + {v2} - 1)"
    ]
    add_q(
        "Problem-Solving and Data Analysis", "Probability and conditional probability", "MCQ", prompt, choices, ans,
        f"Path 1: The probability of drawing a {c1} marble first is {v1} / ({v1} + {v2}). After drawing one {c1} marble, there are {v1} + {v2} - 1 total marbles left, and {v2} {c2} marbles remain. The probability of the second being {c2} is {v2} / ({v1} + {v2} - 1). Multiplying these gives the answer. Path 2: Using combinations, the number of ways to pick one {c1} and one {c2} in a specific order is {v1} * {v2}. The total ways to pick 2 items in order is ({v1}+{v2})P2.",
        {
            "With Replacement": f"Assuming replacement, yielding ({v1}·{v2}) / ({v1} + {v2})².",
            "Same Color": f"Calculating the probability of drawing two {c1} marbles.",
            "Missing First Draw": f"Only calculating the probability of the second draw given the first."
        },
        "Modeling dependent compound events.",
        ["Independence Assumption Trap"]
    )

# Template Pr3: Expected Value Logic (MCQ) - 4 questions
contexts_pr3 = [
    ("win x dollars with probability p, and lose y dollars with probability 1-p", "x·p - y(1-p)", "x·p + y(1-p)", "p(x-y)", "x - y"),
    ("gain a points with probability q, and lose b points with probability 1-q", "a·q - b(1-q)", "a·q + b(1-q)", "q(a-b)", "a - b"),
    ("earn m credits with probability k, and lose n credits with probability 1-k", "m·k - n(1-k)", "m·k + n(1-k)", "k(m-n)", "m - n"),
    ("score u points with probability r, and lose v points with probability 1-r", "u·r - v(1-r)", "u·r + v(1-r)", "r(u-v)", "u - v")
]
for i in range(4):
    desc, ans, d1, d2, d3 = contexts_pr3[i]
    prompt = f"In a game, a player can {desc}. Which expression represents the expected value of a single play of this game?"
    choices = [ans, d1, d2, d3]
    add_q(
        "Problem-Solving and Data Analysis", "Probability and conditional probability", "MCQ", prompt, choices, ans,
        f"Path 1: Expected value is the sum of each outcome multiplied by its probability. The gain outcome is positive, multiplied by its probability. The loss outcome is negative, multiplied by its probability. Thus, E = (gain)·(prob) + (-loss)·(prob) = {ans}. Path 2: Logical check. If probability is 1, expected value is the gain. If probability is 0, expected value is the negative loss. Only {ans} satisfies these conditions.",
        {
            "Sign Error": f"Adding the loss instead of subtracting it, yielding {d1}.",
            "Factoring Error": f"Incorrectly factoring the variables, yielding {d2}.",
            "Ignoring Probabilities": f"Simply subtracting the raw amounts without weighting by probability, yielding {d3}."
        },
        "Setting up algebraic expected value.",
        ["Sign Trap", "Unweighted Trap"]
    )

# Template Pr4: Independent vs Mutually Exclusive (MCQ) - 5 questions
contexts_pr4 = [
    ("A", "B", "P(A)", "P(B)"),
    ("X", "Y", "P(X)", "P(Y)"),
    ("M", "N", "P(M)", "P(N)"),
    ("C", "D", "P(C)", "P(D)"),
    ("E", "F", "P(E)", "P(F)")
]
for i in range(5):
    e1, e2, p1, p2 = contexts_pr4[i]
    prompt = f"Events {e1} and {e2} are independent. If {p1} = x and P({e1} ∪ {e2}) = y, which expression represents {p2} in terms of x and y?"
    ans = f"(y - x) / (1 - x)"
    choices = [
        ans,
        f"y - x",
        f"x / y",
        f"(x + y) / (1 - xy)"
    ]
    add_q(
        "Problem-Solving and Data Analysis", "Probability and conditional probability", "MCQ", prompt, choices, ans,
        f"Path 1: By the addition rule, P({e1} ∪ {e2}) = {p1} + {p2} - P({e1} ∩ {e2}). Since they are independent, P({e1} ∩ {e2}) = {p1} · {p2}. Substituting the variables: y = x + {p2} - x·{p2}. Factoring out {p2} gives y - x = {p2}(1 - x). Solving for {p2} yields (y - x) / (1 - x). Path 2: Let {p1} = 0.5, {p2} = 0.5. Then y = 0.75. Plugging x = 0.5 and y = 0.75 into the choices: (0.75 - 0.5) / (1 - 0.5) = 0.25 / 0.5 = 0.5, which matches {p2}.",
        {
            "Mutually Exclusive Trap": "Assuming the events are mutually exclusive, so y = x + P(B), leading to y - x.",
            "Ratio Trap": "Assuming independence means proportionality.",
            "Complex Trap": "Using a completely fabricated algebraic relation."
        },
        "Translating independence into the general addition rule.",
        ["Mutually Exclusive Assumption Trap"]
    )

# Template Pr5: SPR Probability (SPR) - 6 questions
contexts_pr5 = [
    ("A jar contains 3 red, 4 blue, and 5 green marbles. Two marbles are drawn simultaneously. What is the probability that both are green?", "5/33"),
    ("If P(A) = 0.4, P(B) = 0.5, and A and B are independent, what is P(A ∪ B)?", "0.7"),
    ("A fair coin is flipped 4 times. What is the probability of getting exactly 2 heads?", "3/8"),
    ("In a class of 20 students, 12 study French, 10 study Spanish, and 4 study both. If a student is chosen at random, what is the probability they study neither?", "1/10"),
    ("A spinner has 5 equal sectors numbered 1 through 5. It is spun twice. What is the probability that the sum of the spins is exactly 6?", "1/5"),
    ("A box contains cards numbered 1 through 10. A card is drawn. What is the probability that the number is prime given that it is odd?", "3/5")
]
for prompt, ans in contexts_pr5:
    add_q(
        "Problem-Solving and Data Analysis", "Probability and conditional probability", "SPR", prompt, [], ans,
        "Path 1: Apply core probability definitions. Use combinations for simultaneous draws. Use P(A ∪ B) = P(A) + P(B) - P(A)P(B) for independent events. Use binomial probability for coin flips. Use inclusion-exclusion principle for sets. Use sample space counting for sums. Use restricted sample spaces for conditional probability. Path 2: Draw a tree diagram or list the sample space directly to count favorable outcomes over total possible outcomes.",
        {},
        "Applying core probability frameworks (combinations, independence, Venn diagrams, conditional).",
        ["Sample Space Error"]
    )

# Types: Pr1(MCQ,5), Pr2(MCQ,5), Pr3(MCQ,4), Pr4(MCQ,5), Pr5(SPR,6).
# Total MCQ = 5+5+4+5 = 19. Total SPR = 6. Exact match!

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
try:
    with open(bank_path, "r", encoding="utf-8") as f:
        bank = json.load(f)
except Exception:
    bank = []

bank.extend(questions)

with open(bank_path, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Generated {len(questions)} questions.")
print(f"Percentages: {len([q for q in questions if q['skill'] == 'Percentages'])}")
print(f"Probability: {len([q for q in questions if q['skill'] == 'Probability and conditional probability'])}")
