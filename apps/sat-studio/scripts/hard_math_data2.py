import json
import uuid
import random
import os

def generate_id():
    return "antigravity-1600-" + uuid.uuid4().hex[:8]

questions = []

# ONE-VARIABLE DATA (15 MCQ, 5 SPR)
# T1: Adding a value to change the mean (5 SPR)
for _ in range(5):
    n = random.randint(10, 30)
    mean1 = random.randint(40, 80)
    new_mean = mean1 + random.randint(1, 5)
    added_val = (n + 1) * new_mean - n * mean1
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "One-variable data: Distributions and measures of center and spread",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "SPR",
        "prompt": f"A dataset contains {n} integers and has a mean of {mean1}. When a new integer k is added to the dataset, the mean of the {n+1} integers becomes {new_mean}. What is the value of k?",
        "correctAnswer": str(added_val),
        "explanation": {
            "correct": f"The initial sum of the {n} integers is {n} · {mean1} = {n * mean1}. The new sum of the {n+1} integers is ({n+1}) · {new_mean} = {(n+1)*new_mean}. The value of the added integer k is the difference between the new sum and the initial sum: {(n+1)*new_mean} - {n*mean1} = {added_val}. Alternatively, the mean increases by {new_mean - mean1}. To balance the {n} existing numbers, k must be the new mean plus {n} times the increase: {new_mean} + {n}({new_mean - mean1}) = {added_val}.",
            "distractors": {}
        },
        "metadata": {
            "cognitiveMove": "Translating statistical changes into total sum equations.",
            "trapTypes": ["Mean manipulation error"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T2: Removing outliers (5 MCQ)
for _ in range(5):
    n = random.choice([25, 30, 40])
    mean_val = random.randint(50, 100)
    outlier = mean_val + random.randint(100, 200)
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "One-variable data: Distributions and measures of center and spread",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"A dataset of {n} positive values has a mean of {mean_val} and a median of {mean_val - 2}. The greatest value in the dataset is {outlier}, which is an extreme outlier. If this outlier is removed from the dataset, which of the following best describes the effect on the mean and the median?",
        "choices": [
            "The mean will decrease, and the median could remain the same or decrease slightly.",
            "Both the mean and the median will decrease, but the mean will decrease by a greater amount than the median.",
            "Both the mean and the median will decrease, but the median will decrease by a greater amount than the mean.",
            "The mean will decrease, but the median will remain exactly the same."
        ],
        "correctAnswer": "The mean will decrease, and the median could remain the same or decrease slightly.",
        "explanation": {
            "correct": "Removing an extremely large outlier will always significantly decrease the mean because the mean is sensitive to extreme values. The median, however, is resistant to outliers. Removing the highest value shifts the middle position slightly, which may leave the median unchanged (if there are duplicate values near the center) or cause a very small decrease. It is not guaranteed to decrease.",
            "distractors": {
                "Both the mean and the median will decrease, but the mean will decrease by a greater amount than the median.": "Assumes the median must strictly decrease, which is not guaranteed.",
                "Both the mean and the median will decrease, but the median will decrease by a greater amount than the mean.": "Confuses the sensitivity of the mean and median.",
                "The mean will decrease, but the median will remain exactly the same.": "Assumes the median can never change when an extreme value is removed."
            }
        },
        "metadata": {
            "cognitiveMove": "Conceptual evaluation of resistance to outliers.",
            "trapTypes": ["Absolute certainty trap", "Overstating statistical change"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T3: Comparing Standard Deviations (5 MCQ)
for _ in range(5):
    c1 = random.randint(2, 5)
    c2 = c1 + random.randint(1, 3)
    c3 = c1 + random.randint(4, 6)
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "One-variable data: Distributions and measures of center and spread",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"Dataset X consists of 500 integers strongly clustered around its mean. Dataset Y is formed by taking each integer from Dataset X, multiplying it by {c1}, and then adding {c3}. Dataset Z is formed by taking each integer from Dataset X, multiplying it by {c2}, and then adding {c1}. Let s_X, s_Y, and s_Z be the standard deviations of datasets X, Y, and Z, respectively. Which of the following correctly orders the standard deviations?",
        "choices": [
            f"s_X < s_Y < s_Z",
            f"s_X < s_Z < s_Y",
            f"s_Y < s_Z < s_X",
            f"s_Z < s_Y < s_X"
        ],
        "correctAnswer": f"s_X < s_Y < s_Z",
        "explanation": {
            "correct": f"When every element in a dataset is multiplied by a constant c and then shifted by d, the standard deviation is multiplied by the absolute value of c. Adding a constant does not change the spread. Thus, s_Y = {c1}·s_X and s_Z = {c2}·s_X. Since {c1} < {c2}, it follows that s_X < s_Y < s_Z.",
            "distractors": {
                f"s_X < s_Z < s_Y": "Confuses the effect of addition versus multiplication on standard deviation.",
                f"s_Y < s_Z < s_X": "Reverses the scaling relationship.",
                f"s_Z < s_Y < s_X": "Assumes standard deviation decreases with scaling."
            }
        },
        "metadata": {
            "cognitiveMove": "Isolating the scaling transformation's effect on standard deviation.",
            "trapTypes": ["Additive shift trap"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T4: Unknown max value for given mean (5 MCQ)
for _ in range(5):
    n = random.randint(10, 20)
    mean_val = random.randint(30, 50)
    total = n * mean_val
    min_sum = (n - 1) * n // 2
    max_val = total - min_sum
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "One-variable data: Distributions and measures of center and spread",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"A dataset consists of {n} distinct positive integers. If the mean of the dataset is {mean_val}, what is the maximum possible value of the largest integer in the dataset?",
        "choices": [
            str(max_val),
            str(total - (n - 1)),
            str(max_val + 1),
            str(total)
        ],
        "correctAnswer": str(max_val),
        "explanation": {
            "correct": f"The sum of the {n} integers is {n} · {mean_val} = {total}. To maximize the largest integer, we must minimize the other {n-1} distinct positive integers. The smallest distinct positive integers are 1, 2, 3, ..., {n-1}. Their sum is ({n-1})({n})/2 = {min_sum}. The largest possible value is {total} - {min_sum} = {max_val}.",
            "distractors": {
                str(total - (n - 1)): "Assumes the other integers can all be 1, ignoring the 'distinct' constraint.",
                str(max_val + 1): "Off-by-one error in calculating the sum of the first n-1 integers.",
                str(total): "Assumes the other integers can be 0, but they must be positive integers."
            }
        },
        "metadata": {
            "cognitiveMove": "Extremal principle applied to sums and averages.",
            "trapTypes": ["Missing constraint trap (distinct)"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# TWO-VARIABLE DATA (15 MCQ, 5 SPR)
# T5: Exponential model parameter translation (5 MCQ)
for _ in range(5):
    base = random.choice([2, 3, 4, 5])
    factor = random.choice([2, 3, 4])
    new_base = base ** factor
    a_val = random.randint(10, 50)
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Two-variable data: Models and scatterplots",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"The population of a bacterial colony is modeled by the function P(t) = {a_val}({new_base})^(t/{factor}), where t is the time in hours. The model can be rewritten in the form P(t) = a(b)^t. What is the value of b?",
        "choices": [
            str(base),
            str(new_base),
            str(new_base * factor),
            str(base * factor)
        ],
        "correctAnswer": str(base),
        "explanation": {
            "correct": f"We can rewrite the exponent using properties of exponents: P(t) = {a_val}({new_base})^(t/{factor}) = {a_val}({new_base}^(1/{factor}))^t. Since {base}^{factor} = {new_base}, the {factor}th root of {new_base} is {base}. Thus, the equation becomes P(t) = {a_val}({base})^t, which means b = {base}.",
            "distractors": {
                str(new_base): "Leaves the base as is, ignoring the exponent division.",
                str(new_base * factor): "Multiplies instead of taking the root.",
                str(base * factor): "Multiplies the root by the factor."
            }
        },
        "metadata": {
            "cognitiveMove": "Algebraic manipulation of exponential models.",
            "trapTypes": ["Exponent rules error"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T6: Linear model interpretation (5 MCQ)
for _ in range(5):
    slope = random.randint(3, 9)
    intercept = random.randint(10, 50)
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Two-variable data: Models and scatterplots",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"A manufacturing company models the cost C, in dollars, of producing x units of a specialized component with the equation C = {slope}x + {intercept}. However, the production line only operates in batches of 100 units. Let B be the number of batches produced. If the model is rewritten as C = mB + c, what is the best interpretation of the parameter m?",
        "choices": [
            f"The additional cost in dollars to produce one additional batch of 100 units.",
            f"The total cost in dollars to produce {slope} batches of components.",
            f"The additional cost in dollars to produce one additional unit of the component.",
            f"The fixed cost in dollars associated with setting up the production line."
        ],
        "correctAnswer": f"The additional cost in dollars to produce one additional batch of 100 units.",
        "explanation": {
            "correct": f"Since x represents units and B represents batches of 100 units, x = 100B. Substituting this into the equation gives C = {slope}(100B) + {intercept} = {slope*100}B + {intercept}. The parameter m represents {slope*100}, which is the slope of the new equation. The slope represents the rate of change of the cost with respect to the number of batches, so it is the additional cost to produce one additional batch.",
            "distractors": {
                f"The total cost in dollars to produce {slope} batches of components.": "Misinterprets the slope as a specific total cost value.",
                f"The additional cost in dollars to produce one additional unit of the component.": "This is the interpretation of the original slope {slope}, not the new slope m.",
                f"The fixed cost in dollars associated with setting up the production line.": "This describes the y-intercept, not the slope."
            }
        },
        "metadata": {
            "cognitiveMove": "Translating units of measure within a linear model.",
            "trapTypes": ["Slope vs intercept confusion", "Original vs transformed rate confusion"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T7: Exp vs Lin models (5 MCQ)
for _ in range(5):
    initial = random.randint(10, 50)
    add_val = random.randint(5, 15)
    mult_val = random.choice([1.1, 1.2, 1.5, 2.0])
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Two-variable data: Models and scatterplots",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"A biologist is studying two populations of cells. Population A starts with {initial} cells and increases by {add_val} cells every hour. Population B starts with {initial} cells and increases by {int((mult_val-1)*100)}% every hour. Which of the following statements best describes the models for Population A and Population B?",
        "choices": [
            "Population A is modeled by a linear function because it grows by a constant amount, and Population B is modeled by an exponential function because it grows by a constant percentage.",
            "Population A is modeled by an exponential function because it grows by a constant amount, and Population B is modeled by a linear function because it grows by a constant percentage.",
            "Both populations are modeled by linear functions because they both have a constant rate of change.",
            "Both populations are modeled by exponential functions because they both describe biological growth."
        ],
        "correctAnswer": "Population A is modeled by a linear function because it grows by a constant amount, and Population B is modeled by an exponential function because it grows by a constant percentage.",
        "explanation": {
            "correct": f"A linear function models a quantity that changes by a constant amount per unit of time (addition). Since Population A increases by exactly {add_val} cells every hour, it is a linear model. An exponential function models a quantity that changes by a constant percentage or ratio per unit of time (multiplication). Since Population B increases by {int((mult_val-1)*100)}% every hour, it is an exponential model.",
            "distractors": {
                "Population A is modeled by an exponential function because it grows by a constant amount, and Population B is modeled by a linear function because it grows by a constant percentage.": "This reverses the definitions of linear and exponential growth.",
                "Both populations are modeled by linear functions because they both have a constant rate of change.": "Fails to distinguish between an absolute constant rate (linear) and a relative constant rate (exponential).",
                "Both populations are modeled by exponential functions because they both describe biological growth.": "Biological growth can be modeled linearly depending on the conditions; context alone does not dictate the mathematical model."
            }
        },
        "metadata": {
            "cognitiveMove": "Classifying growth models based on absolute vs relative rates.",
            "trapTypes": ["Terminology reversal", "Contextual assumption"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T8: Scatterplot residual (5 SPR)
for _ in range(5):
    m = random.randint(2, 5)
    b = random.randint(10, 20)
    x_val = random.randint(5, 12)
    predicted = m * x_val + b
    residual = random.choice([-4, -3, -2, 2, 3, 4])
    actual = predicted + residual
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Two-variable data: Models and scatterplots",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "SPR",
        "prompt": f"A scatterplot shows the relationship between two variables, x and y. A line of best fit for the data is given by the equation y = {m}x + {b}. One of the data points has an x-coordinate of {x_val} and a residual of {residual}. What is the y-coordinate of this data point?",
        "correctAnswer": str(actual),
        "explanation": {
            "correct": f"The predicted y-value from the line of best fit when x = {x_val} is y = {m}({x_val}) + {b} = {predicted}. The residual is defined as the actual y-value minus the predicted y-value (Residual = y_actual - y_predicted). Therefore, {residual} = y_actual - {predicted}. Solving for y_actual gives {predicted} + ({residual}) = {actual}.",
            "distractors": {}
        },
        "metadata": {
            "cognitiveMove": "Applying the definition of a residual to find an actual data value.",
            "trapTypes": ["Sign error on residual", "Confusing predicted and actual"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# EVALUATING STATISTICAL CLAIMS (10 MCQ)
# T9: Causation vs Correlation (4 MCQ)
for _ in range(4):
    context = random.choice([
        "observational study of dietary habits",
        "survey of exercise routines",
        "retrospective analysis of sleep patterns",
        "questionnaire on study techniques",
        "review of historical economic data"
    ])
    topic = random.choice([
        "better cardiovascular health",
        "higher academic performance",
        "increased workplace productivity",
        "lower stress levels"
    ])
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Evaluating statistical claims: Observational studies and experiments",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"A researcher conducts a large-scale {context} and finds a strong positive correlation between a specific behavior and {topic}. The researcher concludes that engaging in this behavior directly causes {topic}. Which of the following is the most significant statistical flaw in the researcher's conclusion?",
        "choices": [
            "The study design does not allow for establishing a causal relationship, as there was no random assignment to experimental and control groups.",
            "The sample size of the study was likely not large enough to draw a definitive conclusion about the entire population.",
            "The researcher did not verify the correlation with a secondary dataset before publishing the conclusion.",
            "The study relied on self-reported data, which is always invalid for drawing any statistical associations."
        ],
        "correctAnswer": "The study design does not allow for establishing a causal relationship, as there was no random assignment to experimental and control groups.",
        "explanation": {
            "correct": "In an observational study, researchers merely observe variables without assigning treatments. Because subjects are not randomly assigned to groups, confounding variables could explain the observed relationship. Causation can only be reliably established through a randomized controlled experiment. Correlation does not imply causation.",
            "distractors": {
                "The sample size of the study was likely not large enough to draw a definitive conclusion about the entire population.": "The prompt states it was a 'large-scale' study. Sample size relates to margin of error and representativeness, not to causation.",
                "The researcher did not verify the correlation with a secondary dataset before publishing the conclusion.": "While replication is good practice, it does not magically turn observational correlation into causation.",
                "The study relied on self-reported data, which is always invalid for drawing any statistical associations.": "Self-reported data can have bias, but it is not 'always invalid' for drawing associations (correlations)."
            }
        },
        "metadata": {
            "cognitiveMove": "Distinguishing between observational and experimental study designs regarding causation.",
            "trapTypes": ["Sample size distraction", "Absolute statement trap ('always invalid')"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T10: Sampling Bias and Generalization (3 MCQ)
for _ in range(3):
    group = random.choice([
        "members of a local astronomy club",
        "subscribers to a fitness magazine",
        "frequent shoppers at a luxury boutique",
        "students enrolled in advanced physics",
        "commuters taking the 7 AM express train"
    ])
    pop = random.choice([
        "all adults in the city",
        "the entire nation's population",
        "all high school students",
        "everyone who uses public transportation"
    ])
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Evaluating statistical claims: Observational studies and experiments",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"A market researcher wishes to estimate the average amount of money spent on hobbies by {pop}. To do this, the researcher randomly selects 500 {group} and surveys them. The average amount spent on hobbies in this sample is $450 per year. To which of the following populations can the results of this survey be most reliably generalized?",
        "choices": [
            f"Only to the population of {group}.",
            f"To {pop}.",
            f"To all people who have hobbies.",
            "To no population, because the sample size of 500 is too small."
        ],
        "correctAnswer": f"Only to the population of {group}.",
        "explanation": {
            "correct": f"The results of a survey can only be generalized to the population from which the sample was randomly selected. Because the sample was drawn exclusively from {group}, the findings only represent that specific group. The sample is biased with respect to {pop} because not everyone in that broader group had an equal chance of being selected.",
            "distractors": {
                f"To {pop}.": "The sample was not randomly selected from this broader population, so generalizing to it introduces sampling bias.",
                f"To all people who have hobbies.": "This is overly broad and suffers from the same sampling bias issue.",
                "To no population, because the sample size of 500 is too small.": "A sample size of 500 is generally more than sufficient for statistical inference if drawn randomly."
            }
        },
        "metadata": {
            "cognitiveMove": "Identifying the population boundary constrained by the sampling frame.",
            "trapTypes": ["Overgeneralization trap", "Sample size fallacy"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# T11: Margin of Error Logic (3 MCQ)
for _ in range(3):
    sample_sizes = [random.randint(200, 400), random.randint(800, 1200)]
    
    q = {
        "id": generate_id(),
        "section": "Math",
        "domain": "Problem-Solving and Data Analysis",
        "skill": "Evaluating statistical claims: Observational studies and experiments",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "type": "MCQ",
        "prompt": f"A polling agency conducts two surveys to estimate the proportion of residents in a city who support a new public policy. Survey A uses a random sample of {sample_sizes[0]} residents, while Survey B uses a random sample of {sample_sizes[1]} residents from the same city. Both surveys are conducted using the same methodology. Which of the following statements about the margin of error for these two surveys is most accurate?",
        "choices": [
            "The margin of error for Survey B will be smaller than the margin of error for Survey A because the sample size is larger.",
            "The margin of error for Survey A will be smaller than the margin of error for Survey B because it is easier to control for errors in a smaller sample.",
            "The margins of error for both surveys will be identical because they were drawn from the same population.",
            "The margin of error cannot be compared without knowing the exact proportion of residents who support the policy in each sample."
        ],
        "correctAnswer": "The margin of error for Survey B will be smaller than the margin of error for Survey A because the sample size is larger.",
        "explanation": {
            "correct": "Margin of error is inversely related to sample size. As the sample size increases, the estimate of the population parameter becomes more precise, resulting in a smaller margin of error. Since Survey B has a significantly larger sample size than Survey A, its margin of error will be smaller.",
            "distractors": {
                "The margin of error for Survey A will be smaller than the margin of error for Survey B because it is easier to control for errors in a smaller sample.": "This confuses non-sampling errors (like data entry mistakes) with the statistical margin of error, which strictly decreases as sample size increases.",
                "The margins of error for both surveys will be identical because they were drawn from the same population.": "Fails to recognize that sample size directly impacts the margin of error.",
                "The margin of error cannot be compared without knowing the exact proportion of residents who support the policy in each sample.": "While the exact proportion slightly influences the magnitude, a large difference in sample size guarantees a smaller margin of error for the larger sample regardless of the specific proportions."
            }
        },
        "metadata": {
            "cognitiveMove": "Relating sample size directly to margin of error without calculation.",
            "trapTypes": ["Proportion dependency trap", "Non-sampling error confusion"],
            "sourceSignalId": "antigravity-1600-math-data2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }
    questions.append(q)

# Saving to JSON
bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
os.makedirs(os.path.dirname(bank_path), exist_ok=True)

if os.path.exists(bank_path):
    with open(bank_path, "r", encoding="utf-8") as f:
        data = json.load(f)
else:
    data = []

data.extend(questions)

with open(bank_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Generated {len(questions)} Hard Math questions.")
print(f"Total questions in bank: {len(data)}")

def summarize():
    counts = {
        "One-variable data: Distributions and measures of center and spread": {"MCQ": 0, "SPR": 0},
        "Two-variable data: Models and scatterplots": {"MCQ": 0, "SPR": 0},
        "Evaluating statistical claims: Observational studies and experiments": {"MCQ": 0, "SPR": 0}
    }
    for q in questions:
        counts[q['skill']][q['type']] += 1
    for k, v in counts.items():
        print(f"{k} -> MCQ: {v['MCQ']}, SPR: {v['SPR']}")

summarize()
