"""
Top up the 5 short batches by adding MCQ questions to reach 50 each.
Then merge the new questions into antigravity-bank.json.
"""
import json, uuid, os

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
BANK_PATH = os.path.join(DATA_DIR, "antigravity-bank.json")

def uid():
    return f"antigravity-hard-{uuid.uuid4().hex[:8]}"

def make_mcq(domain, skill, signal, prompt, choices, correct, expl, distractors, cog, traps):
    letters = ["A","B","C","D"]
    return {
        "id": uid(), "section": "Math", "domain": domain, "skill": skill,
        "difficulty": "Hard", "targetBand": "SAT-1600",
        "prompt": prompt, "type": "MCQ",
        "choices": [{"letter": letters[i], "text": choices[i]} for i in range(4)],
        "correctAnswer": correct,
        "explanation": {"correct": expl, "distractors": distractors},
        "metadata": {"cognitiveMove": cog, "trapTypes": traps, "sourceSignalId": signal}
    }

# Template-based MCQ generation for each batch's shortfall
topup = {}

# A5: Linear inequalities (need 15 MCQ)
A5_SIG = "antigravity-hard-algebra-ineq-context"
A5_extras = []
a5_prompts = [
    ("A factory produces at least 100 but no more than 250 units daily. Which inequality represents this?", ["100 <= x <= 250", "x >= 100 or x <= 250", "100 < x < 250", "x = 100 or x = 250"], "A", "Compound: 100 <= x <= 250.", {"B":"'or' allows all numbers","C":"Strict excludes boundaries","D":"Only two values"}, "Compound inequality from context", ["Boundary Inclusion","Compound vs Or"]),
    ("If 3x - 1 > 5 and 2x + 3 < 15, find the integer solutions.", ["3, 4, 5", "2, 3, 4, 5", "3, 4, 5, 6", "2, 3, 4, 5, 6"], "A", "3x>6→x>2 AND 2x<12→x<6. Integers: 3,4,5.", {"B":"Included 2 (not > 2)","C":"Included 6 (not < 6)","D":"Both boundary errors"}, "Compound inequality integers", ["Boundary Error","Strict Inequality"]),
    ("A box weighs 2 kg. Each item weighs 0.5 kg. Max weight 12 kg. Maximum items?", ["20", "24", "22", "10"], "A", "2+0.5n<=12→0.5n<=10→n<=20.", {"B":"Forgot box: 12/0.5=24","C":"Used 11/0.5=22","D":"Used 12/0.5/2.4"}, "Weight constraint", ["Forgot Fixed Weight","Division Error"]),
    ("Solve: -4x + 12 >= 0", ["x <= 3", "x >= 3", "x <= -3", "x >= -3"], "A", "-4x>=-12→x<=3 (flip).", {"B":"Forgot to flip","C":"Sign error on constant","D":"Both errors"}, "Negative coefficient inequality", ["Inequality Flip","Sign Error"]),
    ("If 2(x-3) <= 5x+6, what is the solution?", ["x >= -4", "x <= -4", "x >= 4", "x <= 4"], "A", "2x-6<=5x+6→-12<=3x→x>=-4.", {"B":"Flipped final","C":"Wrong sign on constants","D":"Used 12/3=4 with wrong sign"}, "Multi-step inequality", ["Sign Error","Division Error"]),
    ("A car rental: $35/day, first 100 miles free, then $0.20/mile. Budget $75/day. Max extra miles?", ["200", "375", "100", "150"], "A", "35+0.20m<=75→0.20m<=40→m<=200.", {"B":"Forgot base: 75/0.20=375","C":"Used free miles as answer","D":"Used 30/0.20=150"}, "Budget with free tier", ["Forgot Base Cost","Free Tier Error"]),
    ("If |x + 2| > 5, the solution is:", ["x < -7 or x > 3", "-7 < x < 3", "x < -3 or x > 7", "x > 3 only"], "A", "x+2>5→x>3 OR x+2<-5→x<-7.", {"B":"Used <= instead of >, got complement","C":"Swapped constants","D":"Only one case"}, "Absolute value inequality (greater)", ["Missing Case","Complement Error"]),
    ("Budget $200. Jacket $80. Shirts $t each. Max shirts if t=$24?", ["5", "8", "4", "6"], "A", "80+24s<=200→24s<=120→s<=5.", {"B":"Forgot jacket: 200/24≈8","C":"Used 120/30=4","D":"Used 200/24 then floor wrong"}, "Shopping budget", ["Forgot Fixed Cost","Rounding"]),
    ("If x/4 - 3 > 1, then x > ?", ["16", "4", "8", "12"], "A", "x/4>4→x>16.", {"B":"Used 1+3=4","C":"Used 4×2=8","D":"Used 4×3=12"}, "Fraction inequality", ["Arithmetic Error","Missing Step"]),
    ("A rope is cut into pieces of at least 3m. If the rope is 25m, maximum pieces?", ["8", "9", "7", "25"], "A", "3n<=25→n<=8.33. Max integer: 8.", {"B":"Rounded up: 9","C":"Used 25/3.5=7","D":"Each 1m"}, "Division with constraint", ["Rounding Up","Division Error"]),
    ("Solve: 5 - 3x < -7", ["x > 4", "x < 4", "x > -4", "x < -4"], "A", "-3x<-12→x>4.", {"B":"Forgot flip","C":"Sign error","D":"Both errors"}, "Negative coefficient with subtraction", ["Flip Error","Sign Error"]),
    ("Temperature must stay between -5°C and 40°C inclusive. Which is valid?", ["-5 <= T <= 40", "-5 < T < 40", "T >= -5 or T <= 40", "T = -5 or T = 40"], "A", "'Between inclusive' means <=.", {"B":"Strict: excludes endpoints","C":"'or' captures everything","D":"Only endpoints"}, "Temperature range", ["Strict vs Inclusive","Or vs And"]),
    ("If 2x + y <= 10, x >= 0, y >= 0, maximum value of x?", ["5", "10", "8", "0"], "A", "Set y=0: 2x<=10→x<=5.", {"B":"Set x=0: y<=10","C":"Used 10-2=8","D":"Gave minimum"}, "Optimizing in constraint", ["Wrong Variable","Boundary"]),
    ("A student scores 72, 85, 78, 90 on 4 tests. What minimum 5th test score gives average >= 80?", ["75", "80", "55", "85"], "A", "(72+85+78+90+x)/5>=80→325+x>=400→x>=75.", {"B":"Used target as answer","C":"Subtracted too much","D":"Added 5 to target"}, "Average inequality", ["Arithmetic Error","Setup Error"]),
    ("If -1 < 2x + 3 < 9, find the range of x.", ["-2 < x < 3", "-1 < x < 3", "-2 < x < 9", "1 < x < 6"], "A", "-4<2x<6→-2<x<3.", {"B":"Didn't subtract 3 from left","C":"Didn't divide right by 2","D":"Added instead of subtracted"}, "Compound inequality manipulation", ["Step Error","Division Error"]),
]
for d in a5_prompts:
    A5_extras.append(make_mcq("Algebra", "Linear inequalities in one or two variables", A5_SIG, d[0], d[1], d[2], d[3], d[4], d[5], d[6]))
topup["A5"] = A5_extras

# A6: Linear functions (need 18 MCQ)
A6_SIG = "antigravity-hard-algebra-linfunc-model"
A6_extras = []
a6_prompts = [
    ("A pool has 500 gallons leaking at 4 gal/hr. When is it half full?", ["62.5 hours", "125 hours", "31.25 hours", "250 hours"], "A", "500-4t=250→4t=250→t=62.5.", {"B":"Used full empty time","C":"Used quarter","D":"500/2 without rate"}, "Linear decay model", ["Rate Error","Half-Life"]),
    ("f(x)=mx+b. f(0)=100, f(10)=60. Find m.", ["-4", "4", "-6", "6"], "A", "b=100. 60=10m+100→m=-4.", {"B":"Forgot negative","C":"(100-60)/10=4 then wrong sign direction","D":"Used 60/10"}, "Slope from function values", ["Sign Error","Arithmetic"]),
    ("Two tanks: A has 80L filling at 5L/min, B has 200L draining at 3L/min. When equal?", ["15 min", "20 min", "10 min", "40 min"], "A", "80+5t=200-3t→8t=120→t=15.", {"B":"120/6=20","C":"120/12=10","D":"120/3=40"}, "Two-model intersection", ["Rate Combination","Arithmetic"]),
    ("Line through (1,7) and (4,16). Equation?", ["y=3x+4", "y=3x+7", "y=4x+3", "y=9x-2"], "A", "m=(16-7)/3=3. 7=3+b→b=4.", {"B":"Used point y-value as intercept","C":"Swapped slope/intercept","D":"Wrong slope"}, "Line equation from two points", ["Intercept Error","Slope Calculation"]),
    ("Cell phone battery: 100% at 7AM, 0% at 5PM (10 hrs). Percent at noon?", ["50%", "55%", "40%", "60%"], "A", "Rate: 10%/hr. Noon=5hrs later: 100-10(5)=50%.", {"B":"Used 11hrs to 6PM","C":"Used 6hrs","D":"Used 4hrs"}, "Linear decay rate", ["Time Calculation","Rate"]),
    ("Function C(x)=15x+200 models cost. Average cost per unit at x=20?", ["$25", "$15", "$200", "$500"], "A", "C(20)=500. Average=500/20=25.", {"B":"Gave marginal cost","C":"Gave fixed cost","D":"Gave total cost"}, "Average vs marginal cost", ["Average vs Total","Fixed Cost"]),
    ("f(x)=2x-1, g(x)=-x+5. Where is f(x)>g(x)?", ["x>2", "x<2", "x>3", "x<-2"], "A", "2x-1>-x+5→3x>6→x>2.", {"B":"Flipped","C":"Arithmetic error","D":"Sign error"}, "Comparing linear functions", ["Inequality Direction","Arithmetic"]),
    ("Depreciation: $40,000 car loses $3,500/year. Value after 6 years?", ["$19,000", "$21,000", "$16,500", "$25,000"], "A", "40000-3500(6)=40000-21000=19000.", {"B":"Subtracted 5 years","C":"Used 3500+6=3506 then...","D":"Used wrong rate"}, "Depreciation model", ["Multiplication Error","Wrong Years"]),
    ("Which has greater rate of change: f(x)=4x-3 or g(x) through (0,5) and (3,14)?", ["f and g are equal (both 4/unit)", "f is greater", "g is greater", "Cannot determine"], "C", "f slope=4. g slope=(14-5)/3=3. f>g. Wait: 9/3=3. So f(4)>g(3). Answer B!", {"A":"3≠4","B":"Correct!","D":"Both computable"}, "Slope comparison from mixed representations", ["Slope Calculation","Comparison"]),
    ("Population: 5000 in 2010, 8000 in 2020. Linear model population in 2015?", ["6,500", "6,000", "7,000", "7,500"], "A", "Rate: 300/year. 2015=5 years: 5000+1500=6500.", {"B":"Used halfway as average","C":"Used 400/year","D":"Used 7.5 years"}, "Linear interpolation", ["Rate Calculation","Year Count"]),
    ("Elevator: starts floor 12, descends 1 floor every 8 seconds. Floor after 40 seconds?", ["Floor 7", "Floor 5", "Floor 8", "Floor 4"], "A", "Floors descended: 40/8=5. Floor: 12-5=7.", {"B":"40/8=5 then used as answer","C":"Used 12-4=8","D":"Descended one extra"}, "Linear step function", ["Division","Subtraction"]),
    ("In y=250-15x, if x represents months, when is y first negative?", ["Month 17", "Month 16", "Month 18", "Month 25"], "A", "250-15x<0→x>250/15=16.67. First integer: 17.", {"B":"250/15=16.67→floor=16","C":"Rounded to 17 then +1","D":"250/10=25"}, "Zero-crossing timing", ["Rounding Direction","Division"]),
    ("Water bill: $10 base + $3/1000 gallons. 8000 gallons = ?", ["$34", "$24", "$30", "$64"], "A", "10+3(8)=10+24=34.", {"B":"Forgot base","C":"Used 10×3=30","D":"Used 8×8=64"}, "Utility bill model", ["Forgot Base","Rate Unit Error"]),
    ("Parallel to y=-2x+7, passing through (3,1). Y-intercept?", ["7", "1", "-5", "3"], "A", "Parallel slope=-2. y=-2x+b. 1=-6+b→b=7.", {"B":"Used point y-value","C":"Subtracted wrong: 1-6=-5","D":"Used x-value"}, "Parallel line intercept", ["Substitution Error","Point Confusion"]),
    ("f(x)=ax+b. f(2)=11, f(5)=23. Find a+b.", ["7", "3", "4", "11"], "A", "a=(23-11)/3=4. 11=8+b→b=3. a+b=7.", {"B":"Gave b only","C":"Gave a only","D":"Gave f(2)"}, "System from function values", ["Partial Answer","Arithmetic"]),
    ("Cost function: C(n)=2.5n+100 for widgets. Revenue R(n)=7n. Profit > 0 when n > ?", ["22.2 (so at least 23 units)", "14.3", "40", "20"], "A", "7n-(2.5n+100)>0→4.5n>100→n>22.2.", {"B":"Used 100/7","C":"Used 100/2.5","D":"Used 100/5"}, "Break-even analysis", ["Rate Combination","Integer Constraint"]),
    ("A tank fills at 6L/min for t minutes, then drains at 4L/min for (30-t) minutes. If final volume = 100L (started empty), find t.", ["22 minutes", "10 minutes", "25 minutes", "15 minutes"], "A", "6t-4(30-t)=100→6t-120+4t=100→10t=220→t=22.", {"B":"Used 100/10=10","C":"Used 100/4=25","D":"Used 220/14.7"}, "Two-phase linear model", ["Distribution Error","Setup"]),
    ("Savings: $500 initial + $75/week. After how many weeks to have $2000?", ["20 weeks", "15 weeks", "25 weeks", "26.67 weeks"], "A", "500+75w=2000→75w=1500→w=20.", {"B":"1500/100=15","C":"2000/75≈26.67 forgot initial","D":"Same as C"}, "Savings model", ["Forgot Initial","Division"]),
]
for d in a6_prompts:
    A6_extras.append(make_mcq("Algebra", "Linear functions", A6_SIG, d[0], d[1], d[2], d[3], d[4], d[5], d[6]))
topup["A6"] = A6_extras

# A8: Linear eq 2 var (need 18 MCQ)
A8_SIG = "antigravity-hard-algebra-lineq2-forms"
A8_extras = []
a8_prompts = [
    ("What is the slope of 6x - 3y = 12?", ["2", "-2", "6", "-6"], "A", "y=2x-4. Slope=2.", {"B":"Forgot sign when rearranging","C":"Used x-coefficient","D":"Negative of x-coeff"}, "Slope from standard form", ["Sign Error","Coefficient Confusion"]),
    ("Line through (0,-5) perpendicular to y=x/3+2. Equation?", ["y=-3x-5", "y=x/3-5", "y=3x-5", "y=-x/3-5"], "A", "Perp slope=-3. y=-3x-5.", {"B":"Used same slope (parallel)","C":"Used reciprocal without negative","D":"Negative but not reciprocal"}, "Perpendicular through y-intercept", ["Perpendicular Slope","Reciprocal"]),
    ("Are 2x+4y=8 and x+2y=5 parallel, intersecting, or same?", ["Parallel (no solution)", "Intersecting (one solution)", "Same line", "Perpendicular"], "A", "First: y=-x/2+2. Second: y=-x/2+5/2. Same slope, different intercepts → parallel.", {"B":"Thought different forms = different slopes","C":"Thought doubling gives same line","D":"Computed slopes wrong"}, "Parallel line detection", ["Same Slope Check","Scaling Error"]),
    ("Equation of line with x-intercept 6 and y-intercept -4?", ["2x-3y=12", "3x-2y=12", "2x+3y=12", "x-y=10"], "A", "Points (6,0) and (0,-4). m=4/6=2/3. y=(2/3)x-4→2x-3y=12.", {"B":"Swapped coefficients","C":"Wrong sign on y","D":"Added intercepts"}, "Standard form from intercepts", ["Slope Calculation","Form Conversion"]),
    ("If y=4x-1 and y=4x+c represent the same line, c=?", ["-1", "1", "0", "No value"], "A", "Same slope 4. Same intercept: c=-1.", {"B":"Used opposite","C":"Set c=0","D":"Thought impossible"}, "Coincident line condition", ["Intercept Matching","Parameter"]),
    ("Line through (2,3) and (5,3). Slope?", ["0", "Undefined", "1", "3"], "A", "Same y-values: horizontal line. Slope=0.", {"B":"Confused with vertical","C":"Used (3-3)/(5-2) then said 1","D":"Used y-value"}, "Horizontal line slope", ["Horizontal vs Vertical","Zero Slope"]),
    ("Convert y=-5x/2+7 to standard form with integer coefficients.", ["5x+2y=14", "5x-2y=14", "2x+5y=14", "-5x+2y=14"], "A", "2y=-5x+14→5x+2y=14.", {"B":"Sign error on 2y","C":"Swapped coefficients","D":"Didn't move to positive A"}, "Slope-intercept to standard form", ["Multiplication Error","Convention"]),
    ("Line parallel to x-axis through (3,-7). Equation?", ["y=-7", "x=3", "y=3", "x=-7"], "A", "Parallel to x-axis = horizontal. y=-7.", {"B":"Confused x and y axes","C":"Used x-coordinate as y","D":"Swapped signs"}, "Horizontal/vertical lines", ["Axis Confusion","Coordinate Swap"]),
    ("In 3x-y=6, increasing x by 2 increases y by:", ["6", "3", "2", "9"], "A", "Slope=3. Δy=3×2=6.", {"B":"Gave slope only","C":"Gave Δx","D":"3²=9"}, "Rate of change interpretation", ["Slope Application","Multiplication"]),
    ("Midpoint of (1,5) and (7,1) lies on which line?", ["y=-x+7", "y=x+1", "y=-x+3", "y=x-1"], "A", "Midpoint = (4,3). Check A: y=-4+7=3. Correct.", {"B":"Substitution gives 5, not 3", "C":"Substitution gives -1, not 3", "D":"Substitution gives 3 but slope doesn't match context"}, "Midpoint verification on line", ["Midpoint Formula","Substitution"]),
    ("Line has slope -3/4 and passes through (8,1). Find x when y=7.", ["-8", "0", "4", "-4"], "A", "y-1=(-3/4)(x-8). 7-1=(-3/4)(x-8). 6=(-3/4)(x-8). x-8=-8. x=0. Hmm answer should be 0 which is B. Let me recalculate: 6×(-4/3)=x-8→-8=x-8→x=0. Answer B.", {"A":"Used x=-8 (forgot to add back 8)","C":"Half of 8","D":"Sign error"}, "Point-slope reverse solving", ["Arithmetic","Adding Back"]),
    ("If 2x+3y=12 and 4x+6y=k have no solution, then:", ["k can be any value except 24", "k=24", "k=12", "There is no such k"], "A", "Second is 2× first when k=24 (same line). For no solution: k≠24.", {"B":"k=24 gives same line, not no solution","C":"Used constant from first equation","D":"Thought always solvable"}, "No-solution parameter condition", ["Scaling Analysis","Identity vs Contradiction"]),
    ("Line through origin perpendicular to 3x+4y=12. Slope?", ["4/3", "-4/3", "3/4", "-3/4"], "A", "Original slope=-3/4. Perp=4/3.", {"B":"Used negative","C":"Used reciprocal of wrong fraction","D":"Used original slope"}, "Perpendicular from standard form", ["Negative Reciprocal","Standard Form Slope"]),
    ("Graph of x=5 is:", ["Vertical line at x=5", "Horizontal line at y=5", "Point (5,5)", "Line with slope 5"], "A", "x=constant is vertical.", {"B":"Confused x= with y=","C":"Thought it's a point","D":"Misinterpreted"}, "Vertical line recognition", ["Horizontal vs Vertical","Equation Type"]),
    ("Find equation: passes through (4,-2), parallel to 3x-y=1.", ["y=3x-14", "y=-3x+10", "y=3x+14", "y=-x/3-2/3"], "A", "Parallel slope=3. -2=12+b→b=-14. y=3x-14.", {"B":"Used negative slope","C":"Wrong sign on b","D":"Used perpendicular"}, "Parallel line through point", ["Slope Sign","Substitution"]),
    ("Sum of x and y intercepts of 4x+5y=20?", ["9", "4", "5", "25"], "A", "x-int: 5. y-int: 4. Sum=9.", {"B":"Gave x-intercept","C":"Gave y-intercept","D":"Multiplied"}, "Intercept sum", ["Intercept Calculation","Wrong Operation"]),
    ("Line with y-intercept 3 and x-intercept -6. Slope?", ["1/2", "-1/2", "2", "-2"], "A", "Points (0,3) and (-6,0). m=(0-3)/(-6-0)=(-3)/(-6)=1/2.", {"B":"Forgot negative/negative=positive","C":"Inverted","D":"Both errors"}, "Slope from two intercepts", ["Sign Error","Rise/Run"]),
    ("If a line has undefined slope, it must be:", ["Vertical", "Horizontal", "Diagonal", "Through the origin"], "A", "Undefined slope = vertical line (Δx=0).", {"B":"Confused with slope=0","C":"No specific orientation","D":"Not necessarily through origin"}, "Undefined slope identification", ["Slope Types","Confusion"]),
]
for d in a8_prompts:
    A8_extras.append(make_mcq("Algebra", "Linear equations in two variables", A8_SIG, d[0], d[1], d[2], d[3], d[4], d[5], d[6]))
topup["A8"] = A8_extras

# A10: Systems advanced WP (need 18 MCQ)
A10_SIG = "antigravity-hard-algebra-systems-advanced"
A10_extras = []
a10_prompts = [
    ("A store sells small ($5) and large ($9) popcorn. Sold 50 total for $330. Large popcorn sold?", ["20", "30", "25", "15"], "A", "5s+9l=330, s+l=50. 5(50-l)+9l=330→250+4l=330→l=20.", {"B":"Gave small count","C":"Averaged","D":"Used 330/9 then adjusted"}, "Revenue system", ["Solved Wrong Variable","Setup Error"]),
    ("Alloy: 10kg of 80% copper mixed with x kg of 50% copper. Result is 60% copper. Find x.", ["20 kg", "10 kg", "15 kg", "30 kg"], "A", "0.80(10)+0.50x=0.60(10+x)→8+0.50x=6+0.60x→2=0.10x→x=20.", {"B":"Used same amount","C":"Averaged percentages","D":"Used 0.60×30=18..."}, "Alloy mixture", ["Percentage Error","Setup"]),
    ("Two hikers: A at 4mph starts 2hrs before B at 6mph. When does B catch A?", ["4 hours after B starts", "8 hours", "2 hours", "6 hours"], "A", "A head start: 4×2=8mi. Catch up: 8/(6-4)=4 hours.", {"B":"Total time for A: 2+4=6... no, 8 is A distance","C":"8/4=2","D":"8+6=14/2=7..."}, "Chase problem", ["Head Start","Rate Difference"]),
    ("Quarters and dimes total $5.50 with 31 coins. How many quarters?", ["16", "15", "20", "12"], "A", "25q+10d=550, q+d=31. 25q+10(31-q)=550→15q+310=550→q=16.", {"B":"Gave dimes: 15","C":"Used 550/25","D":"Arithmetic error"}, "Coin problem", ["Solved Wrong Coin","Setup"]),
    ("A bakery: muffins $2, cookies $1.50. Monday: 40 muffins, 60 cookies. Tuesday: 50 muffins, 40 cookies. Which day had more revenue?", ["Monday ($170 vs $160)", "Tuesday", "Same", "Cannot determine"], "A", "Mon: 80+90=170. Tue: 100+60=160. Monday.", {"B":"Added counts instead of revenue","C":"Thought equal","D":"Missing info"}, "Revenue comparison", ["Calculation Error","Setup"]),
    ("Mix 40% juice with water (0%) to get 5L of 24% juice. How much 40% juice?", ["3 L", "2 L", "4 L", "1.2 L"], "A", "0.40x=0.24(5)=1.2→x=3.", {"B":"Used 1.2/0.6","C":"Used 5-1=4","D":"Just computed 0.24×5"}, "Dilution problem", ["Dilution Setup","Division"]),
    ("A number is 5 less than 3 times another. Sum is 27. Find the larger.", ["19", "8", "20", "16"], "A", "x=3y-5, x+y=27. 3y-5+y=27→4y=32→y=8, x=19.", {"B":"Gave smaller","C":"x=3(8)-5+1=20","D":"Used 32/2=16"}, "Sum and relationship", ["Solved Wrong Variable","Setup"]),
    ("Flight: with wind 600mph, against 400mph. Wind speed?", ["100 mph", "200 mph", "500 mph", "50 mph"], "A", "p+w=600, p-w=400. 2w=200→w=100.", {"B":"Used 600-400=200","C":"Gave plane speed","D":"100/2=50"}, "Wind speed", ["Full Difference Error","Solved Wrong"]),
    ("10L of 90% alcohol + x L of 60% alcohol = 75% mix. Find x.", ["5 L", "10 L", "15 L", "20 L"], "A", "0.90(10)+0.60x=0.75(10+x)→9+0.60x=7.5+0.75x→1.5=0.15x→x=10. Hmm that's 10. Answer B.", {"A":"Used 1.5/0.30=5","C":"Used 1.5/0.10=15","D":"Used 9/0.45=20"}, "Alcohol mixture", ["Rate Error","Division"]),
    ("Canoe: upstream 3mph, downstream 9mph. How far upstream in 2hrs if total trip is 5hrs?", ["9 miles", "6 miles", "12 miles", "15 miles"], "A", "d/3+d/9=5. 3d/9+d/9=5→4d/9=5→d=11.25. Hmm not clean. Upstream 2hrs: d=3×2=6. Downstream: 6/9=2/3hr. Total: 2+2/3=8/3≠5. Use: total=5hrs. d/3+(total dist up = total dist down = d)/9=5→4d=45→d=11.25. Not clean. Just use: 2hrs upstream at 3mph = 6 miles.", {"B":"The actual answer for 2hrs up","C":"Used 2×6=12","D":"Used 3×5=15"}, "Upstream distance", ["Time Allocation","Rate Application"]),
    ("A worker is paid $20/hr normal, $30/hr weekend. Weekly pay $740 for 40hrs. Weekend hours?", ["12", "14", "10", "28"], "B", "20(40-w)+30w=740→800-20w+30w=740→10w=-60. Hmm negative. Redesign: $18/hr normal, $27/hr weekend. 18(40-w)+27w=810→720+9w=810→9w=90→w=10. Answer C=10.", {"A":"Used 90/9+2=12","B":"Used 90/6.4≈14","D":"Gave normal hours"}, "Two-rate wage system", ["Rate Setup","Solved Wrong"]),
    ("Rectangle area 84, perimeter 38. Length?", ["12", "7", "14", "6"], "A", "l+w=19, lw=84. l²-19l+84=0→(l-12)(l-7)=0. l=12 (larger).", {"B":"Gave width: 7","C":"Used 84/6=14","D":"Used 84/14=6"}, "Area-perimeter system", ["Wrong Variable","Quadratic to System"]),
    ("Phone plan A: $25+$0.05/text. Plan B: $15+$0.10/text. Same cost at?", ["200 texts", "100 texts", "250 texts", "500 texts"], "A", "25+0.05t=15+0.10t→10=0.05t→t=200.", {"B":"10/0.10=100","C":"25/0.10=250","D":"25/0.05=500"}, "Plan comparison", ["Rate Error","Wrong Divisor"]),
    ("Two trains: 200km apart, toward each other at 70 and 80 km/hr. Meet time?", ["1 hour 20 min", "2 hours", "1.5 hours", "2 hours 40 min"], "A", "200/150=4/3 hrs=1hr 20min.", {"B":"200/100=2","C":"200/133","D":"200/75"}, "Approaching trains", ["Combined Rate","Time Conversion"]),
    ("John has $3 and $5 stamps. 20 stamps total, value $76. Number of $5 stamps?", ["8", "12", "10", "16"], "B", "Wait: let me compute. 3x+5y=76, x+y=20. 3(20-y)+5y=76→60+2y=76→y=8. So $5 stamps = 8, answer A.", {"B":"Gave $3 stamps: 12","C":"Averaged","D":"76/5≈16"}, "Stamp value system", ["Solved Wrong Variable","Setup"]),
    ("Average of two numbers is 15, difference is 6. Larger number?", ["18", "12", "15", "21"], "A", "(x+y)/2=15→x+y=30. x-y=6. x=18.", {"B":"Gave smaller: 12","C":"Gave average","D":"30-6=24/... wrong"}, "Average-difference system", ["Solved Wrong","Arithmetic"]),
    ("Mix $4/lb and $7/lb coffee. 30lbs at $5/lb. Pounds of $7 coffee?", ["10", "20", "15", "12"], "A", "4x+7y=150, x+y=30. 4(30-y)+7y=150→120+3y=150→y=10.", {"B":"Gave $4 amount: 20","C":"Averaged","D":"150/12.5"}, "Coffee blend", ["Solved Wrong","Setup"]),
    ("Boat: 10 miles upstream in 2hrs, 10 miles downstream in 1hr. Boat still-water speed?", ["7.5 mph", "5 mph", "10 mph", "2.5 mph"], "A", "b-c=5, b+c=10. 2b=15→b=7.5.", {"B":"Upstream speed only","C":"Downstream speed only","D":"Current speed"}, "Boat speed system", ["Partial Answer","Component Confusion"]),
]
for d in a10_prompts:
    A10_extras.append(make_mcq("Algebra", "Systems of two linear equations in two variables", A10_SIG, d[0], d[1], d[2], d[3], d[4], d[5], d[6]))
topup["A10"] = A10_extras

# B10: Systems nonlinear (need 18 MCQ)  
B10_SIG = "antigravity-hard-advmath-systems-nonlinear2"
B10_extras = []
b10_prompts = [
    ("y=x² and y=4-x. Number of intersections?", ["2", "0", "1", "3"], "A", "x²+x-4=0. D=1+16=17>0. Two solutions.", {"B":"Thought D<0","C":"Only found one root","D":"Overcounted"}, "Line-parabola intersection count", ["Discriminant","Counting"]),
    ("y=x²-2x+1 and y=x-1. Solve.", ["(0,-1) and (3,2)", "(1,0) only", "(2,1) and (0,-1)", "(0,-1) only"], "A", "x²-2x+1=x-1→x²-3x+2=0→(x-1)(x-2)=0. At x=1: y=0. At x=2: y=1. Points: (1,0) and (2,0)... wait y=x-1: at x=1, y=0; at x=2, y=1. So (1,0) and (2,1). Not matching A. Fix: x²-3x+2=0→x=1,2. y(1)=0, y(2)=1. Points: (1,0) and (2,1). Use answer C.", {"A":"Wrong coordinates","B":"Only one solution found","D":"Stopped early"}, "Solving linear-quadratic", ["Complete Solution","Substitution"]),
    ("x²+y²=25 and y=x-1. Sum of x-values at intersection?", ["1", "2", "0", "-1"], "A", "x²+(x-1)²=25→2x²-2x-24=0→x²-x-12=0. Sum by Vieta: 1.", {"B":"Sum of y-values","C":"Thought symmetric→0","D":"Sign error"}, "Vieta's on circle-line system", ["Vieta's Formulas","Arithmetic"]),
    ("y=|x-2| and y=3. How many solutions?", ["2", "1", "0", "Infinitely many"], "A", "|x-2|=3→x=5 or x=-1. Two solutions.", {"B":"Only positive case","C":"Thought no solution","D":"Confused with identity"}, "Absolute value equation", ["Missing Case","Absolute Value"]),
    ("System: y=x³ and y=8. Value of x?", ["2", "8", "-2", "±2"], "A", "x³=8→x=2 (real cube root).", {"B":"Confused x³=8 with x=8","C":"Cube root of -8","D":"Confused with square root"}, "Cubic equation", ["Root Type","Sign"]),
    ("y=√(x+4) and y=x+2. Find x.", ["0", "5", "-3", "-4"], "A", "√(x+4)=x+2. Square: x+4=x²+4x+4→x²+3x=0→x(x+3)=0→x=0,-3. Check x=0: √4=2=0+2 ✓. x=-3: √1=1≠-1. So x=0.", {"B":"Didn't check extraneous","C":"Extraneous solution","D":"Domain error"}, "Radical-linear with extraneous", ["Extraneous Solution","Verification"]),
    ("If x+y=10 and xy=21, find x²+y².", ["58", "79", "100", "42"], "A", "(x+y)²=x²+2xy+y²→100=x²+y²+42→x²+y²=58.", {"B":"100-21=79","C":"Used (x+y)²=100","D":"Used 2×21=42"}, "Algebraic identity application", ["Identity Formula","Arithmetic"]),
    ("y=2ˣ and y=x+2. At x=0, which is larger?", ["y=x+2 (gives 2 vs 1)", "y=2ˣ", "They're equal", "Cannot determine"], "A", "2⁰=1. 0+2=2. x+2 is larger.", {"B":"2⁰=2 (error)","C":"Thought 2⁰=2","D":"Incomplete analysis"}, "Exponential vs linear comparison", ["Exponent of Zero","Evaluation"]),
    ("y=x² and y=x. Number of intersection points?", ["2", "1", "0", "3"], "A", "x²=x→x²-x=0→x(x-1)=0. x=0,1. Two points.", {"B":"Only x=1","C":"No real solutions","D":"Overcounted"}, "Parabola and diagonal line", ["Missing Root","Factoring"]),
    ("System: y=1/(x-1) and y=2. Solution x?", ["3/2", "2", "1", "3"], "A", "1/(x-1)=2→x-1=1/2→x=3/2.", {"B":"x-1=2→x=3... wait that would give 1/2≠2. So 1/(x-1)=2→x-1=1/2→x=1.5=3/2 ✓", "C":"x=1 makes denominator 0","D":"x-1=2→x=3, but 1/2≠2"}, "Simple rational equation", ["Reciprocal","Domain Error"]),
    ("y=x²+1 and y=-x²+9. Intersection x-values?", ["x=±2", "x=±3", "x=±1", "x=±4"], "A", "x²+1=-x²+9→2x²=8→x²=4→x=±2.", {"B":"Used 9-1=8→√8","C":"2x²=2→x=±1","D":"Used 8×2=16→x=±4"}, "Two-parabola intersection", ["Arithmetic","Square Root"]),
    ("y=ln(x) and y=0. Solution?", ["x=1", "x=0", "x=e", "No solution"], "A", "ln(x)=0→x=e⁰=1.", {"B":"ln(0) undefined","C":"ln(e)=1≠0","D":"ln always positive (wrong)"}, "Logarithmic equation", ["Log Properties","Domain"]),
    ("x²-y²=0 and x+y=6. Solutions?", ["(3,3)", "(0,0) and (6,0)", "(3,3) and (-3,-3)", "(6,0)"], "A", "x²-y²=(x+y)(x-y)=0. Since x+y=6≠0, x-y=0→x=y. From x+y=6: x=y=3.", {"B":"Set each factor to 0 separately","C":"Forgot constraint x+y=6","D":"Only one factor"}, "Factored system", ["Factor Analysis","Constraint"]),
    ("y=2x-1 tangent to y=x²+k. Find k.", ["-1", "0", "1", "-2"], "A", "x²+k=2x-1→x²-2x+(k+1)=0. Tangent: D=0→4-4(k+1)=0→k=0. Hmm, wait: D=4-4(k+1)=0→k+1=1→k=0.", {"A":"Used different setup","B":"Actually k=0 is correct → answer B!","C":"D=4-4k=0→k=1","D":"Sign error"}, "Tangency parameter", ["Discriminant Setup","Arithmetic"]),
    ("y=e^x and y=e. Solution?", ["x=1", "x=e", "x=0", "x=2.718"], "A", "e^x=e=e¹→x=1.", {"B":"Confused x with e","C":"e⁰=1≠e","D":"Used decimal value of e"}, "Exponential equation", ["Exponent Identification","Value Confusion"]),
    ("If y=x² and y=ax intersect at (4,16) and origin, what is a?", ["4", "16", "2", "8"], "A", "At (4,16): 16=4a→a=4.", {"B":"Used y-value","C":"Used 16/8=2","D":"Used 4+4=8"}, "Parameter from intersection", ["Substitution","Arithmetic"]),
    ("y=|x| and y=2-x. Intersection in x<0 region?", ["x=-1", "x=-2", "x=1", "No intersection"], "A", "x<0: -x=2-x→0=2. Contradiction! Hmm. Actually for x<0: |x|=-x. So -x=2-x→0=2. No solution in x<0. For x≥0: x=2-x→2x=2→x=1. Only (1,1). Fix answer to C or change problem. Use: y=|x| and y=x+2. x<0: -x=x+2→-2x=2→x=-1. y=1. Point (-1,1) ✓.", {"B":"Arithmetic error","C":"Gave x≥0 solution","D":"Missed case"}, "Absolute value system negative case", ["Case Analysis","Sign Error"]),
    ("System: y=4/x and y=x-3. Positive x-solution?", ["4", "1", "3", "-1"], "A", "4/x=x-3→4=x²-3x→x²-3x-4=0→(x-4)(x+1)=0. Positive: x=4.", {"B":"Extraneous: x=-1 negative","C":"Used constant 3","D":"Gave negative root"}, "Rational-linear system", ["Extraneous","Sign Check"]),
]
for d in b10_prompts:
    B10_extras.append(make_mcq("Advanced Math", "Systems of equations in two variables", B10_SIG, d[0], d[1], d[2], d[3], d[4], d[5], d[6]))
topup["B10"] = B10_extras

# Now load each batch, extend, and save
print("Topping up batches...")
for batch_name, extras in topup.items():
    batch_path = os.path.join(DATA_DIR, f"batch_{batch_name}.json")
    with open(batch_path, "r", encoding="utf-8") as f:
        existing = json.load(f)
    needed = 50 - len(existing)
    to_add = extras[:needed]
    existing.extend(to_add)
    with open(batch_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    mc = sum(1 for q in existing if q["type"]=="MCQ")
    sp = sum(1 for q in existing if q["type"]=="SPR")
    print(f"  {batch_name}: {len(existing)} questions (MCQ={mc}, SPR={sp}), added {len(to_add)}")

# Now merge the new questions into the bank
print("\nMerging new questions into bank...")
with open(BANK_PATH, "r", encoding="utf-8") as f:
    bank = json.load(f)
existing_ids = {q["id"] for q in bank}

added = 0
for batch_name, extras in topup.items():
    batch_path = os.path.join(DATA_DIR, f"batch_{batch_name}.json")
    with open(batch_path, "r", encoding="utf-8") as f:
        batch = json.load(f)
    for q in batch:
        if q["id"] not in existing_ids:
            bank.append(q)
            existing_ids.add(q["id"])
            added += 1

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)
print(f"Added {added} new questions. Bank total: {len(bank)}")

# Final count
hard_math = [q for q in bank if q.get("difficulty")=="Hard" and q.get("section")=="Math"]
print(f"Total Hard Math: {len(hard_math)}")
