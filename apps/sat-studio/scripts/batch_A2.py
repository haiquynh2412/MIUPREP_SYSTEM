"""
batch_A2.py – Generate 50 Hard SAT Math questions
Domain : Algebra
Skill  : Systems of two linear equations in two variables
Focus  : Complex word problems (mixture, rate, cost, age, production)
MCQ 38 + SPR 12 = 50
"""

import json, uuid, pathlib

OUT = pathlib.Path(r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\batch_A2.json")
OUT.parent.mkdir(parents=True, exist_ok=True)

SECTION = "Math"
DOMAIN  = "Algebra"
SKILL   = "Systems of two linear equations in two variables"
DIFF    = "Hard"
BAND    = "SAT-1600"
SIGNAL  = "antigravity-hard-algebra-systems-word"

def uid():
    return f"antigravity-hard-{uuid.uuid4().hex[:8]}"

def mcq(prompt, choices, correct, explanation, cognitive, traps):
    """Build an MCQ dict. `choices` is a list of 4 text strings."""
    letters = ["A","B","C","D"]
    clist = [{"letter": letters[i], "text": t} for i, t in enumerate(choices)]
    return {
        "id": uid(),
        "section": SECTION, "domain": DOMAIN, "skill": SKILL,
        "difficulty": DIFF, "targetBand": BAND,
        "prompt": prompt, "type": "MCQ",
        "choices": clist,
        "correctAnswer": correct,
        "explanation": explanation,
        "metadata": {"cognitiveMove": cognitive, "trapTypes": traps, "sourceSignalId": SIGNAL}
    }

def spr(prompt, correct_answer, acceptable, explanation, cognitive, traps):
    """Build an SPR dict. No choices."""
    return {
        "id": uid(),
        "section": SECTION, "domain": DOMAIN, "skill": SKILL,
        "difficulty": DIFF, "targetBand": BAND,
        "prompt": prompt, "type": "SPR",
        "correctAnswer": correct_answer,
        "acceptableAnswers": acceptable,
        "explanation": explanation,
        "metadata": {"cognitiveMove": cognitive, "trapTypes": traps, "sourceSignalId": SIGNAL}
    }

questions = []

# ═══════════════════════════════════════════════════════
# MCQ 1  — Mixture (salt solutions)
# x + y = 50, 0.15x + 0.40y = 15 → x = 20
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A chemist has Solution X (15% salt) and Solution Y (40% salt). She mixes them to obtain "
    "50 liters of a 30% salt solution. How many liters of Solution X does she use?",
    ["20","25","30","35"], "A",
    {"correct": "x + y = 50, 0.15x + 0.40y = 15. Sub y = 50 − x → −0.25x = −5 → x = 20. "
               "Alligation: X:Y = (40−30):(30−15) = 2:3, X = 2/5 · 50 = 20.",
     "distractors": {
         "B": "Equal-split fallacy — divides 50/2 = 25 ignoring concentrations.",
         "C": "Variable swap — solves for Y (30 liters) instead of X.",
         "D": "Percentage mismap — uses (30/40)·50 ≈ 37.5, rounds to 35."
     }},
    "Set up weighted-average equation; solve for the specified variable",
    ["variable swap","equal-split fallacy"]
))

# ═══════════════════════════════════════════════════════
# MCQ 2  — Mixture (coffee blending)
# a + b = 80, 9a + 14b = 880 → b = 32
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A coffee shop blends Brand A ($9/lb) with Brand B ($14/lb) to create 80 lb of a blend "
    "priced at $11/lb. How many pounds of Brand B are used?",
    ["24","32","40","48"], "B",
    {"correct": "a + b = 80, 9a + 14b = 880. Sub a = 80 − b → 5b = 160 → b = 32.",
     "distractors": {
         "A": "Uses wrong alligation ratio → 24.",
         "C": "Equal-split: 80/2 = 40.",
         "D": "Variable swap — gives Brand A (48) instead of B."
     }},
    "Cost-per-unit mixture equation; solve for correct brand",
    ["variable swap","equal-split assumption"]
))

# ═══════════════════════════════════════════════════════
# MCQ 3  — Mixture (alloy)
# 0.70x + 0.45(200−x) = 104 → x = 56
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "An alloy that is 70% copper is mixed with an alloy that is 45% copper to produce "
    "200 kg of a 52% copper alloy. How many kg of the 70% alloy are needed?",
    ["48","56","64","144"], "B",
    {"correct": "0.70x + 0.45(200 − x) = 104 → 0.25x = 14 → x = 56.",
     "distractors": {
         "A": "Arithmetic slip rounding 14/0.25.",
         "C": "Off-by-8 from alligation-table error.",
         "D": "Variable swap — gives the 45% alloy amount (200 − 56 = 144)."
     }},
    "Two-alloy alligation equation",
    ["variable swap","percentage arithmetic slip"]
))

# ═══════════════════════════════════════════════════════
# MCQ 4  — Mixture (juice / sugar)
# 0.10a + 0.35(100−a) = 20 → a = 60
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A bartender mixes juice A (10% sugar) with juice B (35% sugar) to make 100 oz of a drink "
    "that is 20% sugar. How many ounces of juice A does she use?",
    ["40","50","60","75"], "C",
    {"correct": "0.10a + 0.35(100 − a) = 20 → −0.25a = −15 → a = 60.",
     "distractors": {
         "A": "Variable swap — solves for juice B (40).",
         "B": "Equal-split: 100/2 = 50.",
         "D": "Ratio inversion: (35/45)·100 ≈ 78, rounds to 75."
     }},
    "Mixture setup — verify which variable is requested",
    ["variable swap","ratio inversion"]
))

# ═══════════════════════════════════════════════════════
# MCQ 5  — Mixture (paint pigment)
# 0.30a + 0.70(60−a) = 30 → a = 30
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A painter mixes Paint A (30% pigment) with Paint B (70% pigment) to get 60 gallons of "
    "50% pigment paint. How many gallons of Paint A are used?",
    ["20","25","30","40"], "C",
    {"correct": "0.30a + 0.70(60 − a) = 30 → −0.40a = −12 → a = 30.",
     "distractors": {
         "A": "Uses 12/0.60 = 20 (wrong coefficient).",
         "B": "Averages 20 and 30 → 25.",
         "D": "Variable swap — gives Paint B amount (30) then mis-picks 40."
     }},
    "Weighted-average pigment equation",
    ["coefficient confusion","variable swap"]
))

# ═══════════════════════════════════════════════════════
# MCQ 6  — Mixture (cashews / peanuts)
# 12c + 5(70−c) = 490 → c = 20
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A store mixes cashews ($12/kg) with peanuts ($5/kg) to get 70 kg of a $7/kg mixture. "
    "How many kilograms of cashews are used?",
    ["10","15","20","25"], "C",
    {"correct": "12c + 5(70 − c) = 490 → 7c = 140 → c = 20.",
     "distractors": {
         "A": "Halves the correct answer: 20/2 = 10.",
         "B": "Uses 140/10 = 14, rounds to 15.",
         "D": "Ratio inversion: (5/7)·70/2 = 25."
     }},
    "Cost-per-kg mixture equation",
    ["ratio inversion","halving error"]
))

# ═══════════════════════════════════════════════════════
# MCQ 7  — Mixture (antifreeze)
# 0.80x + 0.50(40−x) = 26 → x = 20
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A mechanic needs 40 liters of a 65% antifreeze solution. He has 80% and 50% solutions. "
    "How many liters of the 80% solution should he use?",
    ["15","20","25","30"], "B",
    {"correct": "0.80x + 0.50(40 − x) = 0.65·40 = 26 → 0.30x = 6 → x = 20.",
     "distractors": {
         "A": "Wrong target (uses 0.60 instead of 0.65): 0.30x = 4.5 → 15.",
         "C": "Wrong coefficient: 6/0.25 = 24, rounds to 25.",
         "D": "Variable swap — gives 50% solution (20) then adds 10."
     }},
    "Antifreeze concentration mixture",
    ["arithmetic slip","variable swap"]
))

# ═══════════════════════════════════════════════════════
# MCQ 8  — Mixture (acid dilution)
# 0.60x + 0.30·20 = 0.50(x + 20) → x = 40
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "How many liters of a 60% acid solution must be mixed with 20 liters of a 30% acid solution "
    "to obtain a 50% acid solution?",
    ["30","40","50","60"], "B",
    {"correct": "0.60x + 6 = 0.50(x + 20) → 0.10x = 4 → x = 40.",
     "distractors": {
         "A": "Uses 0.10x = 3 (subtraction error) → 30.",
         "C": "Uses 4/0.08 = 50 (wrong coefficient).",
         "D": "Uses 4/0.60 · 10 ≈ 67, rounds to 60."
     }},
    "Open-ended mixture where total is a variable",
    ["forgetting variable total","coefficient error"]
))

# ═══════════════════════════════════════════════════════
# MCQ 9  — Rate (opposite directions)
# 3b + 3(b+4) = 114 → b = 17, A = 21
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Two cyclists start from the same point riding in opposite directions. Cyclist A rides "
    "4 km/h faster than Cyclist B. After 3 hours they are 114 km apart. What is Cyclist A's "
    "speed in km/h?",
    ["17","19","21","23"], "C",
    {"correct": "3b + 3(b+4) = 114 → 6b = 102 → b = 17 → A = 21.",
     "distractors": {
         "A": "Variable swap — gives B's speed (17).",
         "B": "Adds 2 instead of 4 to B's speed: 17 + 2 = 19.",
         "D": "Doubles the difference: 17 + 6 = 23."
     }},
    "Relative speeds in opposite directions",
    ["variable swap","doubling the difference"]
))

# ═══════════════════════════════════════════════════════
# MCQ 10 — Rate (upstream / downstream)
# b−c = 12, b+c = 16 → c = 2
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A boat travels 48 km upstream in 4 hours and 48 km downstream in 3 hours. "
    "What is the speed of the current in km/h?",
    ["1","2","4","14"], "B",
    {"correct": "Upstream = 48/4 = 12, downstream = 48/3 = 16. "
               "b − c = 12, b + c = 16 → 2c = 4 → c = 2.",
     "distractors": {
         "A": "Halves too far: 2/2 = 1.",
         "C": "Forgets to halve: 16 − 12 = 4.",
         "D": "Variable swap — gives the boat's speed (14)."
     }},
    "Boat-current speed system; solve for current",
    ["forgetting to halve","variable swap"]
))

# ═══════════════════════════════════════════════════════
# MCQ 11 — Rate (head-start meeting)
# After 1 h, Car A covered 60 km → 280 km gap. Combined = 140. t = 2.
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A car leaves City A at 60 km/h toward City B. One hour later, a second car leaves City B "
    "at 80 km/h toward City A. The cities are 340 km apart. How many hours after the second "
    "car departs do they meet?",
    ["1.5","2","2.5","3"], "B",
    {"correct": "After 1 h Car A covers 60 km → 280 km remain. Combined speed = 140. t = 280/140 = 2.",
     "distractors": {
         "A": "Uses 340/200 − adjustment = 1.5.",
         "C": "Ignores head-start: 340/140 ≈ 2.43 → 2.5.",
         "D": "Adds head-start time: 2 + 1 = 3."
     }},
    "Account for head-start distance, then use combined speed",
    ["time-reference confusion","ignoring head-start"]
))

# ═══════════════════════════════════════════════════════
# MCQ 12 — Rate (pursuit catch-up)
# Gap = 100 km, relative = 25 km/h → t = 4
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A car departs at 50 km/h. Two hours later a motorcycle departs at 75 km/h on the same route. "
    "How many hours after the motorcycle departs does it catch up?",
    ["2","3","4","6"], "C",
    {"correct": "Gap = 50·2 = 100 km. Relative speed = 25 km/h. Time = 100/25 = 4.",
     "distractors": {
         "A": "Confuses head-start time (2 h) with catch-up time.",
         "B": "Divides 75/25 = 3.",
         "D": "Doubles the correct answer: 4·1.5 = 6."
     }},
    "Identify gap and relative speed in a pursuit",
    ["confusing head-start with catch-up","wrong relative speed"]
))

# ═══════════════════════════════════════════════════════
# MCQ 13 — Rate (combined work / pipes)
# 1/6 + 1/10 = 4/15 → t = 15/4
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Pipe A fills a tank in 6 hours and Pipe B fills it in 10 hours. Working together, "
    "how many hours does it take to fill the tank?",
    ["3","15/4","4","8"], "B",
    {"correct": "Combined rate = 1/6 + 1/10 = 4/15. Time = 15/4 = 3.75 h.",
     "distractors": {
         "A": "Mis-applies harmonic mean, gets 3.",
         "C": "Rounds 3.75 up to 4.",
         "D": "Averages times: (6+10)/2 = 8."
     }},
    "Combine work rates and invert to find time",
    ["averaging times instead of rates","rounding"]
))

# ═══════════════════════════════════════════════════════
# MCQ 14 — Rate (round-trip average speed)
# harmonic mean: 2·90·60/(90+60) = 72
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A train travels from Station A to Station B at 90 km/h and returns at 60 km/h. "
    "What is the average speed for the entire round trip, in km/h?",
    ["70","72","75","80"], "B",
    {"correct": "Harmonic mean = 2·90·60/(90+60) = 10800/150 = 72.",
     "distractors": {
         "A": "Subtracts 5 from the arithmetic mean.",
         "C": "Arithmetic-mean trap: (90+60)/2 = 75.",
         "D": "Weighted guess closer to 90."
     }},
    "Apply harmonic mean for equal-distance round trip",
    ["arithmetic mean trap","equal-distance weighting"]
))

# ═══════════════════════════════════════════════════════
# MCQ 15 — Rate (two planes meeting)
# 3000 / (500+700) = 2.5
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Two planes fly toward each other from airports 3,000 km apart. Plane A flies at 500 km/h "
    "and Plane B at 700 km/h. How many hours until they meet?",
    ["2","2.5","3","4"], "B",
    {"correct": "Combined speed = 1200. t = 3000/1200 = 2.5.",
     "distractors": {
         "A": "Uses 3000/1500 = 2.",
         "C": "Uses 3000/1000 = 3.",
         "D": "Divides by one speed: 3000/700 ≈ 4.3 → 4."
     }},
    "Sum approach speeds and divide distance",
    ["dividing by one speed","arithmetic slip"]
))

# ═══════════════════════════════════════════════════════
# MCQ 16 — Rate (wind problem — plane)
# p+w = 300, p−w = 200 → w = 50
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A plane flies 600 km with a tailwind in 2 hours and returns against the wind in 3 hours. "
    "What is the speed of the wind in km/h?",
    ["25","50","75","100"], "B",
    {"correct": "With wind: p + w = 300. Against: p − w = 200. Subtract: 2w = 100 → w = 50.",
     "distractors": {
         "A": "Halves again: 50/2 = 25.",
         "C": "Adds adjustment: 50 + 25 = 75.",
         "D": "Forgets to halve: 300 − 200 = 100."
     }},
    "Plane-wind system analogous to boat-current",
    ["forgetting to halve","variable swap"]
))

# ═══════════════════════════════════════════════════════
# MCQ 17 — Cost / revenue (break-even)
# 18n = 4800 + 6n → n = 400
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A company's fixed costs are $4,800/month. Each widget costs $6 to make and sells for $18. "
    "How many widgets must be sold to break even?",
    ["200","267","400","800"], "C",
    {"correct": "18n = 4800 + 6n → 12n = 4800 → n = 400.",
     "distractors": {
         "A": "Divides by sum: 4800/24 = 200.",
         "B": "Divides by selling price: 4800/18 ≈ 267.",
         "D": "Divides by variable cost: 4800/6 = 800."
     }},
    "Contribution-margin break-even",
    ["ignoring variable cost","dividing by wrong quantity"]
))

# ═══════════════════════════════════════════════════════
# MCQ 18 — Cost (ticket sales)
# a + c = 350, 12a + 7c = 3300 → a = 170
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A theater sold 350 tickets. Adult tickets cost $12 and child tickets cost $7. "
    "Total revenue was $3,300. How many adult tickets were sold?",
    ["140","170","180","210"], "B",
    {"correct": "12a + 7(350 − a) = 3300 → 5a = 850 → a = 170.",
     "distractors": {
         "A": "Divides 850/6 ≈ 142, rounds to 140.",
         "C": "Variable swap — gives child tickets (180).",
         "D": "Divides 3300/12 ≈ 275, adjusts to 210."
     }},
    "Revenue + count system; solve for adult tickets",
    ["variable swap","dividing by one price"]
))

# ═══════════════════════════════════════════════════════
# MCQ 19 — Cost (bakery)
# 3.50c + 1.50(200−c) = 460 → c = 80
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A bakery sells cupcakes for $3.50 and cookies for $1.50 each. On Monday it sold 200 items "
    "for $460. How many cupcakes were sold?",
    ["60","80","120","140"], "B",
    {"correct": "3.50c + 1.50(200 − c) = 460 → 2c = 160 → c = 80.",
     "distractors": {
         "A": "Uses 160/2.50 = 64, rounds to 60.",
         "C": "Variable swap — gives cookies (120).",
         "D": "Divides 460/3.50 ≈ 131, rounds to 140."
     }},
    "Two-price sales system",
    ["variable swap","dividing by selling price"]
))

# ═══════════════════════════════════════════════════════
# MCQ 20 — Cost (phone plan)
# f + 300r = 47, f + 500r = 63 → r = 0.08, f = 23
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A phone plan has a monthly fee plus a per-minute charge. Last month 300 minutes cost $47; "
    "this month 500 minutes cost $63. What is the monthly fee?",
    ["$20","$23","$25","$30"], "B",
    {"correct": "Subtract: 200r = 16 → r = 0.08. f = 47 − 24 = 23.",
     "distractors": {
         "A": "Rounds 23 down to 20.",
         "C": "Mis-computes 47 − 300·0.07 = 26, picks 25.",
         "D": "Uses 63 − 500·0.066 = 30."
     }},
    "Subtract two linear cost equations to isolate rate, then find fixed fee",
    ["subtraction order error","unit-rate confusion"]
))

# ═══════════════════════════════════════════════════════
# MCQ 21 — Cost (printing break-even)
# 500 + 0.03p = 200 + 0.06p → p = 10000
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Company X charges $500 setup + $0.03/page. Company Y charges $200 setup + $0.06/page. "
    "Above how many pages does Company X become cheaper?",
    ["5,000","8,000","10,000","15,000"], "C",
    {"correct": "500 + 0.03p = 200 + 0.06p → 300 = 0.03p → p = 10,000.",
     "distractors": {
         "A": "Divides 300/0.06 = 5000.",
         "B": "Divides 500/0.06 ≈ 8333 → 8000.",
         "D": "Uses wrong rate diff: 300/0.02 = 15000."
     }},
    "Set two cost functions equal",
    ["wrong rate difference","dividing by single rate"]
))

# ═══════════════════════════════════════════════════════
# MCQ 22 — Production (bolts)
# p + q = 120, 3p + 5q = 480 → q = 60
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A factory makes Type P bolts (3 min each) and Type Q bolts (5 min each). In a 480-minute shift "
    "exactly 120 bolts are produced using all time. How many Type Q bolts are produced?",
    ["30","40","60","80"], "C",
    {"correct": "p + q = 120, 3p + 5q = 480. Sub p = 120 − q → 2q = 120 → q = 60.",
     "distractors": {
         "A": "Uses 480/16 = 30.",
         "B": "Splits: 120/3 = 40.",
         "D": "Solves for P then doubles."
     }},
    "Quantity + time constraint system",
    ["variable swap","misidentifying constraint"]
))

# ═══════════════════════════════════════════════════════
# MCQ 23 — Production (chairs & tables)
# 2c + 3t = 120, c + 2t = 70 → t = 20, c = 30
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Each chair needs 2 h carpentry and 1 h finishing. Each table needs 3 h carpentry and 2 h finishing. "
    "A shop has 120 h carpentry and 70 h finishing weekly (all used). How many chairs are made?",
    ["20","24","30","36"], "C",
    {"correct": "2c + 3t = 120, c + 2t = 70. Sub c = 70 − 2t → −t = −20, t = 20, c = 30.",
     "distractors": {
         "A": "Variable swap — gives tables (20).",
         "B": "Uses 120/5 = 24.",
         "D": "Uses 120/2 − 70/3 ≈ 37, rounds to 36."
     }},
    "Resource-constraint system; solve for correct product",
    ["variable swap","dividing by wrong coefficient"]
))

# ═══════════════════════════════════════════════════════
# MCQ 24 — Age (Maria & son)
# 3s + 12 = 2(s + 12) → s = 12, Maria = 36
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Today Maria is 3 times as old as her son. In 12 years she will be exactly twice as old "
    "as her son. How old is Maria today?",
    ["24","30","36","48"], "C",
    {"correct": "3s + 12 = 2(s + 12) → s = 12 → Maria = 36.",
     "distractors": {
         "A": "Son's future age: 12 + 12 = 24.",
         "B": "Uses 12 × 2.5 = 30.",
         "D": "Maria's future age: 36 + 12 = 48."
     }},
    "Time-shifted age equations",
    ["future-age shift error","variable swap"]
))

# ═══════════════════════════════════════════════════════
# MCQ 25 — Age (father & daughter, past + future)
# f − 5 = 7(d − 5), f + 5 = 3(d + 5) → d = 10, f = 40
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Five years ago a father was 7 times as old as his daughter. Five years from now he will be "
    "3 times as old as she will be. How old is the father now?",
    ["30","35","40","45"], "C",
    {"correct": "f = 7d − 30 and f = 3d + 10 → 7d − 30 = 3d + 10 → d = 10, f = 40.",
     "distractors": {
         "A": "Uses 3·10 = 30 (stops too early).",
         "B": "Gives f − 5 = 35.",
         "D": "Gives f + 5 = 45."
     }},
    "Two time-shifted age equations (past & future)",
    ["sign error in time shifts","solving for wrong person"]
))

# ═══════════════════════════════════════════════════════
# MCQ 26 — Age (mother & daughter, sum + past ratio)
# m + d = 50, m − 5 = 7(d − 5) → d = 10, m = 40
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "The sum of a mother's and daughter's ages is 50. Five years ago the mother was 7 times "
    "as old as the daughter. How old is the mother now?",
    ["35","38","40","45"], "C",
    {"correct": "m + d = 50, m − 5 = 7(d − 5). Sub m = 50 − d → 8d = 80 → d = 10, m = 40.",
     "distractors": {
         "A": "Uses d = 10 and adds 25 → 35.",
         "B": "Arithmetic slip: (50 + 30)/2 − 1 = 38.",
         "D": "Uses 7(d) instead of 7(d − 5): off by +5."
     }},
    "Sum + past-ratio age system",
    ["sign error in past ages","wrong multiplier"]
))

# ═══════════════════════════════════════════════════════
# MCQ 27 — Investment / interest
# 0.05a + 0.08(12000−a) = 810 → a = 5000, b = 7000
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Liam invests $12,000 total in two accounts: A pays 5% and B pays 8% annually. "
    "After one year he earns $810 interest. How much did he invest in Account B?",
    ["$3,000","$5,000","$7,000","$9,000"], "C",
    {"correct": "0.05(12000 − b) + 0.08b = 810 → 0.03b = 210 → b = 7000.",
     "distractors": {
         "A": "Uses 810/0.08 − 12000 logic → 3000.",
         "B": "Variable swap — gives Account A ($5,000).",
         "D": "Uses 810/0.08 ≈ 10125, rounds to 9000."
     }},
    "Two-account interest system; solve for correct account",
    ["variable swap","dividing total interest by one rate"]
))

# ═══════════════════════════════════════════════════════
# MCQ 28 — Coins (dimes & quarters)
# d + q = 54, 10d + 25q = 945 → q = 27
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A jar has only dimes and quarters — 54 coins worth $9.45 total. How many quarters "
    "are in the jar?",
    ["18","22","27","32"], "C",
    {"correct": "d + q = 54, 10d + 25q = 945. Sub d = 54 − q → 15q = 405 → q = 27.",
     "distractors": {
         "A": "Uses 945/54 ≈ 17.5, rounds to 18.",
         "B": "Mis-values dimes as nickels → 22.",
         "D": "Solves for dimes (27) and adds 5."
     }},
    "Count + value coin system",
    ["unit confusion (cents vs dollars)","variable swap"]
))

# ═══════════════════════════════════════════════════════
# MCQ 29 — Supplies (notebooks & pens)
# 4n + 1.50(150−n) = 375 → n = 60
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A school buys notebooks ($4 each) and pens ($1.50 each). It purchases 150 items for $375. "
    "How many notebooks were purchased?",
    ["36","48","60","90"], "C",
    {"correct": "4n + 1.50(150 − n) = 375 → 2.50n = 150 → n = 60.",
     "distractors": {
         "A": "Divides 375/10 ≈ 38, rounds to 36.",
         "B": "Uses 375/8 ≈ 47, rounds to 48.",
         "D": "Variable swap — gives pens (90)."
     }},
    "Item-count + total-cost system",
    ["variable swap","dividing by sum of prices"]
))

# ═══════════════════════════════════════════════════════
# MCQ 30 — Rental car comparison
# 40 + 0.10m = 25 + 0.25m → m = 100
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Company A charges $40/day plus $0.10/mile. Company B charges $25/day plus $0.25/mile. "
    "For a one-day rental, at how many miles do they charge the same?",
    ["50","80","100","150"], "C",
    {"correct": "40 + 0.10m = 25 + 0.25m → 15 = 0.15m → m = 100.",
     "distractors": {
         "A": "Uses 15/0.30 = 50.",
         "B": "Averages (150 + 50)/2 → 80.",
         "D": "Uses 15/0.10 = 150."
     }},
    "Set two linear cost functions equal",
    ["wrong rate difference","dividing by one rate"]
))

# ═══════════════════════════════════════════════════════
# MCQ 31 — Salary + commission
# 600 + 0.04s = 400 + 0.08s → s = 5000
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Salesperson A earns $600/week + 4% commission. Salesperson B earns $400/week + 8% commission. "
    "At what weekly sales amount do they earn the same?",
    ["$3,000","$4,000","$5,000","$6,000"], "C",
    {"correct": "600 + 0.04s = 400 + 0.08s → 200 = 0.04s → s = 5000.",
     "distractors": {
         "A": "Uses 200/0.06 ≈ 3333, rounds to 3000.",
         "B": "Uses 200/0.05 = 4000.",
         "D": "Uses 200/0.04 + 1000 = 6000."
     }},
    "Set two earnings functions equal",
    ["wrong commission difference","extra addition"]
))

# ═══════════════════════════════════════════════════════
# MCQ 32 — Gym membership comparison
# 50 + 8n = 30 + 12n → n = 5
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Gym A charges $50 membership + $8/class. Gym B charges $30 membership + $12/class. "
    "After how many classes is the total cost the same?",
    ["3","4","5","10"], "C",
    {"correct": "50 + 8n = 30 + 12n → 20 = 4n → n = 5.",
     "distractors": {
         "A": "Uses 20/8 = 2.5, rounds to 3.",
         "B": "Uses 20/5 = 4.",
         "D": "Uses (50+30)/(12−8) = 20."
     }},
    "Set two linear fee functions equal",
    ["dividing by one rate","rounding"]
))

# ═══════════════════════════════════════════════════════
# MCQ 33 — Wage system (two workers)
# 20a + 30b = 1300, 30a + 20b = 1200 → a = 20, b = 30
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Worker A and Worker B are paid different hourly rates. When A works 20 h and B works 30 h, "
    "total pay is $1,300. When A works 30 h and B works 20 h, total pay is $1,200. "
    "What is Worker B's hourly rate?",
    ["$18","$22","$26","$30"], "D",
    {"correct": "Add: 50(a+b) = 2500 → a+b = 50. Subtract: 10(a−b) = −100 → a−b = −10. "
               "So a = 20, b = 30.",
     "distractors": {
         "A": "Divides 1300/72 ≈ 18.",
         "B": "Divides 1200/55 ≈ 22.",
         "C": "Averages: 50/2 = 25, rounds to 26."
     }},
    "Symmetric wage system — add and subtract equations",
    ["variable swap","arithmetic error in elimination"]
))

# ═══════════════════════════════════════════════════════
# MCQ 34 — Sum and difference
# x + y = 84, x − y = 18 → x = 51
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "The sum of two numbers is 84 and their difference is 18. What is the larger number?",
    ["33","42","48","51"], "D",
    {"correct": "x + y = 84, x − y = 18. Add: 2x = 102 → x = 51.",
     "distractors": {
         "A": "Variable swap — gives the smaller number (33).",
         "B": "Ignores difference: 84/2 = 42.",
         "C": "Adds half the difference: 42 + 6 = 48."
     }},
    "Sum-and-difference shortcut",
    ["variable swap","ignoring difference"]
))

# ═══════════════════════════════════════════════════════
# MCQ 35 — Chickens and cows
# c + k = 50, 4c + 2k = 140 → c = 20
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "A farm has chickens and cows — 50 animals with 140 legs total. How many cows are there?",
    ["10","15","20","25"], "C",
    {"correct": "c + k = 50, 4c + 2k = 140. Sub k = 50 − c → 2c = 40 → c = 20.",
     "distractors": {
         "A": "Uses 140/14 = 10.",
         "B": "Uses (140−100)/4 = 10 then adds 5.",
         "D": "Equal-split: 50/2 = 25."
     }},
    "Classic animal-count problem",
    ["leg-count error","variable swap"]
))

# ═══════════════════════════════════════════════════════
# MCQ 36 — Dried fruit trail mix
# 8a + 5(30−a) = 180 → a = 10
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Dried apricots cost $8/lb and dried cranberries cost $5/lb. A grocer makes 30 lb of trail mix "
    "that costs $6/lb. How many pounds of apricots are in the mix?",
    ["5","8","10","15"], "C",
    {"correct": "8a + 5(30 − a) = 180 → 3a = 30 → a = 10.",
     "distractors": {
         "A": "Uses 30/6 = 5.",
         "B": "Uses 30/3.75 = 8.",
         "D": "Equal-split: 30/2 = 15."
     }},
    "Cost-per-pound trail-mix system",
    ["equal-split fallacy","dividing by wrong coefficient"]
))

# ═══════════════════════════════════════════════════════
# MCQ 37 — Investment split
# 0.04x + 0.07(10000−x) = 550 → x = 5000
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "Emma splits $10,000 between a 4% account and a 7% account. Total interest after one year "
    "is $550. How much is in the 4% account?",
    ["$3,000","$4,000","$5,000","$6,000"], "C",
    {"correct": "0.04x + 0.07(10000 − x) = 550 → −0.03x = −150 → x = 5000.",
     "distractors": {
         "A": "Uses 550/0.07 − 10000 ≈ −2143, flips to 3000.",
         "B": "Uses 150/0.04 = 3750, rounds to 4000.",
         "D": "Variable swap — gives the 7% account ($5,000) then picks 6000."
     }},
    "Two-rate interest allocation",
    ["variable swap","dividing by single rate"]
))

# ═══════════════════════════════════════════════════════
# MCQ 38 — Dilution (water added to alcohol solution)
# 0.40·30 = 0.25(30 + w) → w = 18
# ═══════════════════════════════════════════════════════
questions.append(mcq(
    "How many liters of pure water must be added to 30 liters of a 40% alcohol solution to "
    "dilute it to 25%?",
    ["12","15","18","24"], "C",
    {"correct": "0.40·30 = 0.25(30 + w) → 12 = 7.5 + 0.25w → 0.25w = 4.5 → w = 18.",
     "distractors": {
         "A": "Confuses solute amount (12) with water needed.",
         "B": "Uses 4.5/0.30 = 15 (wrong coefficient).",
         "D": "Uses 12/0.50 = 24."
     }},
    "Dilution: water has 0% concentration",
    ["confusing solute with solvent","wrong denominator"]
))


# ═══════════════════════════════════════════════════════════
#                     SPR  QUESTIONS  (12)
# ═══════════════════════════════════════════════════════════

# SPR 1 — Pens & markers
# 2(16−m) + 5m = 50 → m = 6
questions.append(spr(
    "A store sells pens for $2 and markers for $5 each. A customer buys 16 items for $50 total. "
    "How many markers did the customer buy?",
    "6", ["6"],
    {"correct": "2(16 − m) + 5m = 50 → 32 + 3m = 50 → m = 6."},
    "Item-count + value system",
    ["variable swap","arithmetic error"]
))

# SPR 2 — Sum & difference
# x + y = 63, x − y = 19 → y = 22
questions.append(spr(
    "Two numbers have a sum of 63 and a difference of 19. What is the smaller number?",
    "22", ["22"],
    {"correct": "Add: 2x = 82, x = 41. y = 63 − 41 = 22."},
    "Sum-and-difference shortcut",
    ["variable swap","forgetting to halve"]
))

# SPR 3 — Boat still-water speed
# b+c = 20, b−c = 12 → b = 16
questions.append(spr(
    "A boat travels 60 km downstream in 3 hours and 60 km upstream in 5 hours. "
    "What is the boat's speed in still water, in km/h?",
    "16", ["16"],
    {"correct": "Down = 20, up = 12. b + c = 20, b − c = 12 → 2b = 32, b = 16."},
    "Boat-current system; solve for boat speed",
    ["solving for current instead","forgetting to average"]
))

# SPR 4 — Nickels & dimes
# n + d = 100, 5n + 10d = 750 → d = 50
questions.append(spr(
    "A cashier has $7.50 in nickels and dimes — 100 coins total. How many dimes are there?",
    "50", ["50"],
    {"correct": "5(100 − d) + 10d = 750 → 5d = 250 → d = 50."},
    "Coin count + value system",
    ["unit confusion","variable swap"]
))

# SPR 5 — Plane with wind
# p+w = 400, p−w = 200 → w = 100
questions.append(spr(
    "A plane flies 800 km with the wind in 2 hours and 800 km against the wind in 4 hours. "
    "What is the wind speed in km/h?",
    "100", ["100"],
    {"correct": "p + w = 400, p − w = 200. Subtract: 2w = 200, w = 100."},
    "Plane-wind system",
    ["forgetting to halve","variable swap"]
))

# SPR 6 — Notebooks & folders
# 3n + 2f = 21, 5n + 4f = 37 → n = 5
questions.append(spr(
    "The cost of 3 notebooks and 2 folders is $21. The cost of 5 notebooks and 4 folders is $37. "
    "What is the cost of one notebook in dollars?",
    "5", ["5"],
    {"correct": "Multiply first by 2: 6n + 4f = 42. Subtract: n = 42 − 37 = 5."},
    "Elimination with multiplier",
    ["wrong multiplier","solving for folder"]
))

# SPR 7 — Chickens & goats
# c + g = 40, 2c + 4g = 120 → g = 20
questions.append(spr(
    "A farm has chickens and goats — 40 animals and 120 legs total. How many goats are there?",
    "20", ["20"],
    {"correct": "2(40 − g) + 4g = 120 → 2g = 40 → g = 20."},
    "Animal-leg count system",
    ["leg-count error","variable swap"]
))

# SPR 8 — Open-ended acid mixture
# 0.20·40 + 0.60b = 0.40(40 + b) → b = 40
questions.append(spr(
    "Mixture A is 20% acid and Mixture B is 60% acid. How many liters of Mixture B must be "
    "added to 40 liters of Mixture A to produce a 40% acid solution?",
    "40", ["40"],
    {"correct": "8 + 0.60b = 0.40(40 + b) → 0.20b = 8 → b = 40."},
    "Open-ended mixture with variable total",
    ["forgetting variable total","coefficient error"]
))

# SPR 9 — Carpenter (bookshelves & desks)
# b + d = 16, 6b + 10d = 120 → d = 6
questions.append(spr(
    "A carpenter makes bookshelves (6 boards each) and desks (10 boards each). "
    "He has 120 boards and makes 16 items total, using all boards. How many desks does he make?",
    "6", ["6"],
    {"correct": "6(16 − d) + 10d = 120 → 4d = 24 → d = 6."},
    "Resource allocation system",
    ["variable swap","arithmetic error"]
))

# SPR 10 — Two-rate interest
# 0.03(8000−x) + 0.06x = 390 → x = 5000
questions.append(spr(
    "$8,000 is split between a 3% account and a 6% account. Annual interest totals $390. "
    "How many dollars are invested at 6%?",
    "5000", ["5000","5,000"],
    {"correct": "240 + 0.03x = 390 → 0.03x = 150 → x = 5000."},
    "Two-rate interest allocation",
    ["variable swap","dividing total interest by one rate"]
))

# SPR 11 — Train pursuit
# Gap = 60 km, relative = 40 km/h → t = 1.5
questions.append(spr(
    "An express train at 100 km/h and a local train at 60 km/h start from the same station "
    "going the same direction. The local leaves 1 hour earlier. How many hours after the "
    "express departs does it overtake the local?",
    "1.5", ["1.5","3/2"],
    {"correct": "Gap = 60 km. Relative speed = 40. Time = 60/40 = 1.5 h."},
    "Pursuit with head-start gap",
    ["time-reference confusion","wrong relative speed"]
))

# SPR 12 — Class enrollment
# f + s = 45, s = f + 9 → f = 18
questions.append(spr(
    "In a class of 45 students, each studies either French or Spanish (not both). "
    "There are 9 more students studying Spanish than French. How many study French?",
    "18", ["18"],
    {"correct": "f + (f + 9) = 45 → 2f = 36 → f = 18."},
    "Count system with difference constraint",
    ["variable swap","off-by-one"]
))


# ═══════════════════════════════════════════════════════════
#                 VALIDATION  &  SAVE
# ═══════════════════════════════════════════════════════════

mcq_count = sum(1 for q in questions if q["type"] == "MCQ")
spr_count = sum(1 for q in questions if q["type"] == "SPR")

assert len(questions) == 50, f"Expected 50, got {len(questions)}"
assert mcq_count == 38, f"Expected 38 MCQ, got {mcq_count}"
assert spr_count == 12, f"Expected 12 SPR, got {spr_count}"

for i, q in enumerate(questions):
    assert q["difficulty"] == "Hard", f"Q{i+1} difficulty wrong"
    assert q["targetBand"] == "SAT-1600", f"Q{i+1} band wrong"
    assert q["domain"] == "Algebra", f"Q{i+1} domain wrong"
    assert q["skill"] == SKILL, f"Q{i+1} skill wrong"
    assert q["metadata"]["sourceSignalId"] == SIGNAL, f"Q{i+1} signal wrong"
    if q["type"] == "MCQ":
        assert len(q["choices"]) == 4, f"Q{i+1} needs exactly 4 choices"
        others = [L for L in "ABCD" if L != q["correctAnswer"]]
        for L in others:
            assert L in q["explanation"].get("distractors",{}), \
                f"Q{i+1} missing distractor analysis for {L}"
        assert "choices" in q
    else:
        assert "choices" not in q, f"SPR Q{i+1} must not have choices"
        assert "acceptableAnswers" in q, f"SPR Q{i+1} needs acceptableAnswers"

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"✅ Saved {len(questions)} questions ({mcq_count} MCQ + {spr_count} SPR) → {OUT}")
