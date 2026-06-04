import json
import os

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
BANK_PATH = os.path.join(DATA_DIR, "antigravity-bank.json")

new_questions = [
  {
    "id": "antigravity-1600-systems-quadratic-param",
    "section": "Math",
    "domain": "Advanced Math",
    "skill": "Systems of equations in two variables",
    "difficulty": "Hard",
    "targetBand": "SAT-Elite",
    "prompt": "A system of two equations is shown below, where $k$ is a constant.\n\n$$y = x^2 - 4x + 6$$\n$$y = kx - 3$$\n\nIf the system has exactly one real solution $(x, y)$, and the $x$-coordinate of this solution is positive, what is the value of $k$?",
    "type": "MCQ",
    "choices": {
      "A": "-10",
      "B": "2",
      "C": "-10 or 2",
      "D": "-2"
    },
    "correctAnswer": "B",
    "explanation": {
      "correct": "Fast: Since the system has exactly one solution, the quadratic formed by setting the equations equal, $x^2 - (4+k)x + 9 = 0$, must be a perfect square. Since the constant term is $9$, the trinomial must be $(x - 3)^2 = 0$ or $(x + 3)^2 = 0$. The $x$-coordinate must be positive, so we choose the solution $x = 3$, giving $(x - 3)^2 = x^2 - 6x + 9 = 0$. Matching the linear coefficients gives $-(4+k) = -6 \\implies k = 2$.\nSlow: Setting the two equations equal yields $x^2 - 4x + 6 = kx - 3$, which simplifies to the standard quadratic form $x^2 - (4+k)x + 9 = 0$. For the system to have exactly one real solution, the discriminant of this quadratic equation must equal zero. The discriminant is given by $b^2 - 4ac = (-(4+k))^2 - 4(1)(9) = 0$. This simplifies to $(4+k)^2 - 36 = 0$, which yields $(4+k)^2 = 36$. Taking the square root of both sides gives $4+k = 6$ or $4+k = -6$, resulting in $k = 2$ or $k = -10$. The $x$-coordinate of the single solution is given by the formula $x = -b / (2a) = (4+k) / 2$. We are given that the $x$-coordinate of this solution must be positive, which means $(4+k)/2 > 0 \\implies 4+k > 0$. Evaluating our two candidate values: for $k = 2$, we have $4+2 = 6 > 0$ (yielding $x = 3$); for $k = -10$, we have $4-10 = -6 < 0$ (yielding $x = -3$, which is extraneous under the given constraint). Thus, the only statistically and mathematically sound value of $k$ is $2$.",
      "distractors": {
        "A": "Discriminant trap: solves for the extraneous root of the discriminant, $k = -10$, which results in a negative $x$-coordinate of $x = -3$ for the single solution.",
        "C": "Double solution trap: fails to apply the constraint that the $x$-coordinate of the solution must be positive, thus incorrectly including both roots of the discriminant equation.",
        "D": "Sign error: occurs when solving the perfect square equation, resulting in a value of $k = -2$ due to an arithmetic sign slip."
      }
    },
    "sourceType": "antigravity",
    "sourceName": "Antigravity Testbank",
    "sourceReference": "data/antigravity-bank.json",
    "sourceSignalId": "antigravity-testbank",
    "generationEngine": "antigravity",
    "licenseNote": "Original, non-templated high-difficulty item targeting Systems of Equations in Two Variables (Advanced Math).",
    "visibility": "public_candidate",
    "reviewStatus": "reviewed",
    "publicationStatus": "public_candidate_reviewed",
    "metadata": {
      "blueprintId": "bp_systems_quad_param",
      "templateFormId": "tmpl_systems_quad_param_001",
      "cognitiveMove": "Set linear quadratic system equal, apply zero discriminant, and filter by coordinate constraint.",
      "representation": "equation",
      "trapModel": "extraneous discriminant root from coordinate constraint",
      "difficultyReason": "Requires integrating discriminant criteria with coordinate inequality bounds under algebraic parameters.",
      "calculationEaseScore": 4,
      "trapTypes": [
        "Coordinate sign constraint omission",
        "Extraneous discriminant root",
        "Sign Error"
      ]
    }
  },
  {
    "id": "antigravity-1600-stats-tomato-experiment",
    "section": "Math",
    "domain": "Problem-Solving and Data Analysis",
    "skill": "Evaluating statistical claims: observational studies and experiments",
    "difficulty": "Hard",
    "targetBand": "SAT-Elite",
    "prompt": "An agricultural researcher designed a study to evaluate whether a new organic liquid bio-fertilizer increases the crop yield of heirloom tomato plants. The researcher selected a homogeneous plot of land and divided it into 100 identical equal-sized subplots. The researcher then randomly assigned 50 subplots to be treated with the organic bio-fertilizer (the treatment group) and 50 subplots to be treated with a standard water solution (the control group). All subplots received identical amounts of sunlight, water, and soil nutrients. At the end of the growing season, the researcher found that the subplots treated with the organic bio-fertilizer had a statistically significant $18\\%$ higher yield of tomatoes than the control subplots. Which of the following is the most appropriate conclusion from this study?",
    "type": "MCQ",
    "choices": {
      "A": "The organic bio-fertilizer causes an increase in crop yield for heirloom tomato plants grown under these conditions.",
      "B": "The organic bio-fertilizer will cause an $18\\%$ increase in crop yield for any variety of agricultural crop grown anywhere.",
      "C": "There is a correlation between the use of the organic bio-fertilizer and tomato yield, but a causal relationship cannot be established because the plants were grown on the same plot of land.",
      "D": "The study is invalid because it did not include a third group treated with a synthetic chemical fertilizer to act as an active comparator."
    },
    "correctAnswer": "A",
    "explanation": {
      "correct": "Fast: In a well-designed randomized controlled experiment where environmental variables are strictly controlled and treatments are randomly assigned, a causal relationship can be established between the treatment and the observed effect. Since this is an experiment, not an observational study, we can conclude that the fertilizer causes an increase in yield for the tested population under these conditions. Thus, Choice A is correct.\nSlow: Let us evaluate the options through a systematic process of elimination. Choice B is incorrect because it is an overgeneralization. The study was conducted specifically on heirloom tomato plants under controlled conditions, so we cannot generalize an exact $18\\%$ yield increase to all agricultural crops grown under any environmental conditions. Choice C is a common trap: while it is true that correlation does not imply causation in observational studies, this study is a randomized controlled experiment. Random assignment to treatment and control groups effectively isolates the treatment as the single variable causing the observed difference, allowing for causal inference. Choice D is incorrect because a control group treated with water (a placebo/negative control) is a perfectly sufficient and valid baseline to establish the bio-fertilizer's efficacy; an active chemical comparator is not a prerequisite for internal validity. Therefore, Choice A is the only statistically sound conclusion.",
      "distractors": {
        "B": "Overgeneralization trap: extends a specific yield increase percentage from a single plant variety under controlled conditions to all crops grown under any conditions globally.",
        "C": "Skepticism trap: over-applies the 'correlation does not imply causation' rule of observational studies to a randomized controlled experiment where causal inference is actually valid.",
        "D": "Design misconception: falsely claims that a study requires an active synthetic chemical comparator control to be statistically valid, ignoring the role of a negative control."
      }
    },
    "sourceType": "antigravity",
    "sourceName": "Antigravity Testbank",
    "sourceReference": "data/antigravity-bank.json",
    "sourceSignalId": "antigravity-testbank",
    "generationEngine": "antigravity",
    "licenseNote": "Original, non-templated high-difficulty item targeting Evaluating Statistical Claims (Problem-Solving and Data Analysis).",
    "visibility": "public_candidate",
    "reviewStatus": "reviewed",
    "publicationStatus": "public_candidate_reviewed",
    "metadata": {
      "blueprintId": "bp_stats_tomato_experiment",
      "templateFormId": "tmpl_stats_tomato_experiment_001",
      "cognitiveMove": "Identify randomized controlled experiment features and justify causal inference boundaries.",
      "representation": "word problem",
      "trapModel": "over-application of correlation vs causation skepticism to experiments",
      "difficultyReason": "Requires distinguishing randomized controlled experiments from observational studies to license a causal claim rather than mere correlation.",
      "calculationEaseScore": 5,
      "trapTypes": [
        "Causation vs correlation confusion",
        "Overgeneralization",
        "Experimental control misconception"
      ]
    }
  },
  {
    "id": "antigravity-1600-stats-voter-margin-error",
    "section": "Math",
    "domain": "Problem-Solving and Data Analysis",
    "skill": "Inference from sample statistics and margin of error",
    "difficulty": "Hard",
    "targetBand": "SAT-Elite",
    "prompt": "A research organization conducted a survey using a random sample of 1,200 registered voters in a certain state. Based on the survey data, the organization estimated that $54\\%$ of all registered voters in the state support a proposed environmental amendment, with an associated margin of error of $3\\%$ at a $95\\%$ confidence level. Which of the following statements is a correct interpretation of the margin of error?",
    "type": "MCQ",
    "choices": {
      "A": "There is a $95\\%$ probability that the true proportion of all registered voters in the state who support the amendment is between $51\\%$ and $57\\%$.",
      "B": "We can be highly confident that if another random sample of 1,200 registered voters from the state were surveyed, the sample proportion would fall between $51\\%$ and $57\\%$.",
      "C": "It is plausible that the true proportion of all registered voters in the state who support the amendment is between $51\\%$ and $57\\%$.",
      "D": "Exactly $95\\%$ of all registered voters in the state support the amendment, with a variation of up to $3\\%$ depending on the region."
    },
    "correctAnswer": "C",
    "explanation": {
      "correct": "Fast: On the SAT, a confidence interval (calculated as the sample percentage $\\pm$ the margin of error) indicates a plausible range of values for the true population percentage. With a sample estimate of $54\\%$ and a margin of error of $3\\%$, the plausible range is $54\\% - 3\\% = 51\\%$ to $54\\% + 3\\% = 57\\%$. This means it is plausible that the true proportion of all registered voters in the state who support the amendment is between $51\\%$ and $57\\%$. Thus, Choice C is correct.\nSlow: Let us dissect the statistical nuances of the options. Choice A is a classic frequentist trap: in classical statistics, the true population proportion is a fixed, constant value, not a random variable. Therefore, it either lies within the interval or it does not; it is not a matter of probability. The $95\\%$ confidence level describes the long-run success rate of the estimation process itself, not the probability of a specific calculated interval. Choice B is incorrect because a confidence interval estimates the *population* parameter, not the results of future *samples*. Future sample percentages will vary and are not guaranteed to fall within this specific interval $95\\%$ of the time. Choice D is incorrect because the $95\\%$ refers to the confidence level of the survey methodology, not a physical proportion of voters or a regional breakdown of support. Therefore, Choice C is the only mathematically precise and SAT-aligned interpretation.",
      "distractors": {
        "A": "Probability trap: misinterprets the confidence level as the probability of a fixed population parameter falling within a specific calculated interval.",
        "B": "Sample replication error: falsely assumes the confidence interval predicts the range of future sample statistics rather than estimating the population parameter.",
        "D": "Conceptual misunderstanding: misinterprets the confidence level as a physical proportion of the voter population or a regional variance."
      }
    },
    "sourceType": "antigravity",
    "sourceName": "Antigravity Testbank",
    "sourceReference": "data/antigravity-bank.json",
    "sourceSignalId": "antigravity-testbank",
    "generationEngine": "antigravity",
    "licenseNote": "Original, non-templated high-difficulty item targeting Inference from Sample Statistics and Margin of Error (Problem-Solving and Data Analysis).",
    "visibility": "public_candidate",
    "reviewStatus": "reviewed",
    "publicationStatus": "public_candidate_reviewed",
    "metadata": {
      "blueprintId": "bp_stats_voter_margin_error",
      "templateFormId": "tmpl_stats_voter_margin_error_001",
      "cognitiveMove": "Interpret margin of error and confidence interval boundaries in terms of population plausibility.",
      "representation": "word problem",
      "trapModel": "probability misinterpretation of classical confidence level",
      "difficultyReason": "Requires high conceptual precision to reject common probability and sample-replication traps when interpreting confidence intervals.",
      "calculationEaseScore": 5,
      "trapTypes": [
        "Confidence level probability trap",
        "Sample replication fallacy",
        "Voter proportion misconception"
      ]
    }
  },
  {
    "id": "antigravity-1600-systems-circle-parabola",
    "section": "Math",
    "domain": "Advanced Math",
    "skill": "Systems of equations in two variables",
    "difficulty": "Hard",
    "targetBand": "SAT-Elite",
    "prompt": "A system of two equations is shown below, where $k$ is a constant.\n\n$$x^2 + y^2 = 25$$\n$$y = x^2 - k$$\n\nIf the system has exactly three distinct real solutions $(x, y)$, what is the value of $k$?",
    "type": "MCQ",
    "choices": {
      "A": "-5",
      "B": "5",
      "C": "25",
      "D": "-25"
    },
    "correctAnswer": "B",
    "explanation": {
      "correct": "Fast: Since both the circle $x^2 + y^2 = 25$ (centered at the origin with radius $5$) and the parabola $y = x^2 - k$ (opening upwards with vertex at $(0, -k)$) are symmetric with respect to the $y$-axis, any intersection point off the $y$-axis must occur in a symmetric pair. To have an odd number of intersection points (exactly three), one of the solutions *must* lie exactly on the $y$-axis (where $x = 0$). Substituting $x = 0$ into the circle equation gives $y = \\pm 5$. The vertex of the parabola is at $(0, -k)$. If the vertex touches the bottom of the circle at $(0, -5)$, then $-k = -5 \\implies k = 5$. Let's verify the number of solutions: if $k = 5$, the parabola is $y = x^2 - 5 \\implies x^2 = y + 5$. Substituting this into the circle equation yields $(y+5) + y^2 = 25 \\implies y^2 + y - 20 = 0 \\implies (y+5)(y-4) = 0$. This gives $y = -5$ (yielding $x=0$, giving solution $(0, -5)$) and $y = 4$ (yielding $x = \\pm 3$, giving solutions $(3, 4)$ and $(-3, 4)$). This yields exactly three distinct real solutions, so $k = 5$ is correct. If the vertex touched the top at $(0, 5)$, we would have $-k = 5 \\implies k = -5$, giving $x^2 = y - 5 \\implies y^2 + y - 30 = 0 \\implies (y-5)(y+6) = 0$, which yields $y=5$ ($x=0$) and $y=-6$ (no real $x$, since $x^2 = -11$), resulting in only one real solution. Thus, $k = 5$.\nSlow: Let's solve the system algebraically. Express the second equation as $x^2 = y + k$. Substitute this expression into the circle equation: $(y+k) + y^2 = 25$, which simplifies to the standard quadratic equation $y^2 + y + (k - 25) = 0$. For the system to have exactly three distinct real solutions, the quadratic equation in $y$ must have two distinct real roots. One root must be $y = -k$ (so that $x^2 = y+k = 0$, giving exactly one $x$-value, $x=0$), and the other root must be greater than $-k$ (so that $x^2 = y+k > 0$, giving two distinct real $x$-values, $x = \\pm\\sqrt{y+k}$). To find the value of $k$ where $y = -k$ is a root of the quadratic, substitute $y = -k$ into $y^2 + y + k - 25 = 0$: $(-k)^2 + (-k) + k - 25 = 0 \\implies k^2 - 25 = 0 \\implies k = \\pm 5$. If $k = 5$, the quadratic in $y$ is $y^2 + y - 20 = 0 \\implies (y+5)(y-4) = 0$. The roots are $y = -5$ (which matches $-k = -5$, yielding $x=0$) and $y = 4$ (which is greater than $-k = -5$, yielding $x = \\pm 3$). This gives exactly three distinct real solutions. If $k = -5$, the quadratic in $y$ is $y^2 + y - 30 = 0 \\implies (y-5)(y+6) = 0$. The roots are $y = 5$ (which matches $-k = 5$, yielding $x=0$) and $y = -6$ (which is less than $-k = 5$, yielding no real $x$-values). This gives only one real solution. Thus, we reject $k = -5$ and choose $k = 5$.",
      "distractors": {
        "A": "Vertex top trap: incorrectly chooses $k = -5$, which places the parabola's vertex at $(0, 5)$ at the top of the circle, yielding only one real intersection point $(0, 5)$ because the other algebraic intersection occurs at $y = -6$, where $x^2 = -11$ has no real solutions.",
        "C": "Radius squared confusion: confuses the squared radius of the circle ($25$) with the vertex shift parameter $k$.",
        "D": "Sign and radius confusion: combines a sign error with the radius squared value, resulting in $-25$."
      }
    },
    "sourceType": "antigravity",
    "sourceName": "Antigravity Testbank",
    "sourceReference": "data/antigravity-bank.json",
    "sourceSignalId": "antigravity-testbank",
    "generationEngine": "antigravity",
    "licenseNote": "Original, non-templated high-difficulty item targeting Systems of Equations in Two Variables (Advanced Math).",
    "visibility": "public_candidate",
    "reviewStatus": "reviewed",
    "publicationStatus": "public_candidate_reviewed",
    "metadata": {
      "blueprintId": "bp_systems_circle_parabola",
      "templateFormId": "tmpl_systems_circle_parabola_001",
      "cognitiveMove": "Apply symmetry conditions to non-linear systems of conic sections to isolate tangent and secant boundaries.",
      "representation": "equation",
      "trapModel": "extraneous algebraic root yielding imaginary coordinates due to domain boundaries",
      "difficultyReason": "Requires geometric visualization of symmetries combined with deep algebraic root analysis of a quadratic-quadratic system.",
      "calculationEaseScore": 4,
      "trapTypes": [
        "Symmetry misinterpretation",
        "Extraneous solution from radical domain",
        "Radius vs vertex confusion"
      ]
    }
  }
]

if __name__ == "__main__":
    if not os.path.exists(BANK_PATH):
        print(f"Error: {BANK_PATH} not found.")
        exit(1)
        
    with open(BANK_PATH, "r", encoding="utf-8") as f:
        try:
            bank = json.load(f)
        except Exception as e:
            print(f"Error reading bank: {e}")
            exit(1)
            
    print(f"Loaded bank with {len(bank)} questions.")
    
    # Check if these IDs already exist
    existing_ids = {q.get("id") for q in bank}
    appended_count = 0
    for q in new_questions:
        if q["id"] in existing_ids:
            print(f"Warning: Question with ID {q['id']} already exists. Skipping.")
        else:
            bank.append(q)
            appended_count += 1
            print(f"Appending question: {q['id']}")
            
    if appended_count > 0:
        with open(BANK_PATH, "w", encoding="utf-8") as f:
            json.dump(bank, f, indent=2, ensure_ascii=False)
        print(f"Successfully appended {appended_count} questions to the bank.")
        print(f"New bank size: {len(bank)}")
    else:
        print("No new questions appended.")
