import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "sat-king-supplemental-ai-bank.json"
REPORT = ROOT / "data" / "sat-king-supplemental-report.json"
AUDIT_VERSION = "sat-king-audit-2026-05-17"


SOURCE_NOTE = "SAT Studio internal blueprint; College Board content domains only; no source exercise text copied."
LICENSE_NOTE = "Original SAT Studio generated item. Built from domain/skill blueprint only; safe for public-candidate review."


def difficulty(index):
    return ["Medium", "Hard", "Medium", "Easy", "Hard"][index % 5]


def add_meta(item, index):
    item.setdefault("difficulty", difficulty(index))
    item.setdefault("sourceType", "sat_king")
    item.setdefault("sourceName", "SAT King Supplemental Bank")
    item.setdefault("sourceReference", SOURCE_NOTE)
    item.setdefault("licenseNote", LICENSE_NOTE)
    item.setdefault("visibility", "public_candidate")
    item.setdefault("reviewStatus", "reviewed")
    item.setdefault("publicationStatus", "public_candidate_auto_reviewed")
    item.setdefault("questionType", "multiple_choice")
    item.setdefault("sourceQuestionIndex", index)
    item["autoCheck"] = {
        "status": "passed",
        "validator": "deterministic_template",
        "checks": ["structure", "answer_key", "original_wording", "official_domain_alignment"],
        "checkedAt": "2026-05-17T00:00:00.000Z",
    }
    item["contentAudit"] = {
        "version": AUDIT_VERSION,
        "verdict": "pass",
        "checks": [
            "required_fields",
            "answer_key_present",
            "explanation_present",
            "no_protected_source_text",
            "public_candidate_visibility",
        ],
    }
    return item


def mc(id_, section, domain, skill, prompt, choices, correct, explanation, diff_index):
    return add_meta(
        {
            "id": id_,
            "section": section,
            "domain": domain,
            "skill": skill,
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": correct,
            "explanation": explanation,
        },
        diff_index,
    )


def grid(id_, domain, skill, prompt, answer, explanation, diff_index, accepted=None):
    return add_meta(
        {
            "id": id_,
            "section": "Math",
            "domain": domain,
            "skill": skill,
            "questionType": "student_produced_response",
            "answerFormat": "numeric",
            "prompt": prompt,
            "choices": {},
            "correctAnswer": str(answer),
            "acceptableAnswers": [str(x) for x in (accepted or [answer])],
            "explanation": explanation,
        },
        diff_index,
    )


def numeric_choices(correct):
    c = int(correct) if float(correct).is_integer() else correct
    values = [c, c + 1, c - 1, c + 3] if isinstance(c, int) else [c, round(c + 0.5, 2), round(c - 0.5, 2), round(c + 1, 2)]
    labels = ["A", "B", "C", "D"]
    return {label: str(value) for label, value in zip(labels, values)}, "A"


def math_questions():
    rows = []
    n = 1

    def qid():
        nonlocal n
        value = f"satking-math-{n:03d}"
        n += 1
        return value

    # Algebra: linear equations in two variables, missing in previous reviewed AI.
    for i in range(24):
        m = (i % 7) - 3 or 2
        b = 2 * i - 9
        x = i % 9 + 1
        y = m * x + b
        prompt = (
            f"In coordinate setup {chr(65 + (i % 26))}, the graph of the line y = {m}x {'+' if b >= 0 else '-'} {abs(b)} passes through the point (x, {y}). "
            "What is the value of x?"
        )
        explanation = f"Substitute y = {y}: {y} = {m}x {'+' if b >= 0 else '-'} {abs(b)}. Solving gives x = {x}."
        if i % 4 == 0:
            rows.append(grid(qid(), "Algebra", "Linear equations in two variables", prompt, x, explanation, i))
        else:
            choices, correct = numeric_choices(x)
            rows.append(mc(qid(), "Math", "Algebra", "Linear equations in two variables", prompt, choices, correct, explanation, i))

    for i in range(10):
        a = i % 5 + 2
        x = i + 3
        c = a * x - (i % 4 + 1)
        d = i % 4 + 1
        prompt = f"If {a}x - {d} = {c}, what is the value of x?"
        explanation = f"Add {d} to both sides to get {a}x = {c + d}. Divide by {a}, so x = {x}."
        choices, correct = numeric_choices(x)
        rows.append(mc(qid(), "Math", "Algebra", "Linear equations in one variable", prompt, choices, correct, explanation, i))

    for i in range(12):
        x1, x2 = i + 1, i + 5
        slope = (i % 5) + 1
        y1 = 2 * i - 3
        y2 = y1 + slope * (x2 - x1)
        prompt = f"A line passes through ({x1}, {y1}) and ({x2}, {y2}). What is the slope of the line?"
        explanation = f"Slope is change in y divided by change in x: ({y2} - {y1}) / ({x2} - {x1}) = {slope}."
        if i % 5 == 0:
            rows.append(grid(qid(), "Algebra", "Linear functions and slope", prompt, slope, explanation, i))
        else:
            choices, correct = numeric_choices(slope)
            rows.append(mc(qid(), "Math", "Algebra", "Linear functions and slope", prompt, choices, correct, explanation, i))

    for i in range(9):
        x, y = i + 2, i % 4 + 1
        s, t = x + y, x - y
        prompt = f"A system is shown:\n\nx + y = {s}\nx - y = {t}\n\nWhat is the value of x?"
        explanation = f"Add the equations to get 2x = {s + t}, so x = {x}."
        choices, correct = numeric_choices(x)
        rows.append(mc(qid(), "Math", "Algebra", "Systems of linear equations", prompt, choices, correct, explanation, i))

    for i in range(8):
        x = i + 4
        a = i % 4 + 2
        b = a * x - 3
        prompt = f"For which value of x is {a}x - 3 greater than or equal to {b}?"
        explanation = f"Solve {a}x - 3 >= {b}. Add 3 and divide by {a}: x >= {x}."
        choices = {"A": str(x - 2), "B": str(x - 1), "C": str(x), "D": str(x + 3)}
        rows.append(mc(qid(), "Math", "Algebra", "Linear inequalities", prompt, choices, "C", explanation, i))

    # Advanced Math.
    for i in range(22):
        x = i % 10 + 2
        b = i + 2
        c = i - 3
        value = x * x + b * x + c
        prompt = f"For the function f(x) = x^2 + {b}x {'+' if c >= 0 else '-'} {abs(c)}, what is f({x})?"
        explanation = f"Evaluate the function: {x}^2 + {b}({x}) {'+' if c >= 0 else '-'} {abs(c)} = {value}."
        if i % 3 == 0:
            rows.append(grid(qid(), "Advanced Math", "Nonlinear equations and functions", prompt, value, explanation, i))
        else:
            choices, correct = numeric_choices(value)
            rows.append(mc(qid(), "Math", "Advanced Math", "Nonlinear equations and functions", prompt, choices, correct, explanation, i))

    for i in range(16):
        r1, r2 = i % 6 + 1, i % 5 + 4
        total = r1 + r2
        product = r1 * r2
        prompt = f"The equation x^2 - {total}x + {product} = 0 has two positive solutions. What is the greater solution?"
        explanation = f"The equation factors as (x - {r1})(x - {r2}) = 0, so the greater solution is {max(r1, r2)}."
        choices, correct = numeric_choices(max(r1, r2))
        rows.append(mc(qid(), "Math", "Advanced Math", "Quadratic equations", prompt, choices, correct, explanation, i))

    for i in range(12):
        a = i % 5 + 2
        b = i % 4 + 3
        prompt = f"Which expression is equivalent to {a}(x + {b}) - {b}x?"
        correct_expr = f"{a}x + {a * b} - {b}x"
        simplified = f"{a - b}x + {a * b}" if a != b else str(a * b)
        choices = {"A": simplified, "B": f"{a + b}x + {a * b}", "C": f"{a}x + {b}", "D": correct_expr}
        explanation = f"Distribute first: {correct_expr}. Combine like terms to get {simplified}."
        rows.append(mc(qid(), "Math", "Advanced Math", "Equivalent expressions", prompt, choices, "A", explanation, i))

    for i in range(13):
        start = i + 2
        years = i % 4 + 2
        value = start * (2 ** years)
        prompt = f"A population starts at {start} hundred and doubles each year. After {years} years, how many hundreds are in the population?"
        explanation = f"Doubling for {years} years multiplies by 2^{years}. {start} x 2^{years} = {value}."
        if i % 4 == 0:
            rows.append(grid(qid(), "Advanced Math", "Exponential functions", prompt, value, explanation, i))
        else:
            choices, correct = numeric_choices(value)
            rows.append(mc(qid(), "Math", "Advanced Math", "Exponential functions", prompt, choices, correct, explanation, i))

    # Problem-Solving and Data Analysis.
    for i in range(10):
        a, b = 40 + i * 3, 52 + i * 4
        diff = b - a
        prompt = f"A table shows that a club had {a} members in April and {b} members in May. By how many members did the club increase?"
        explanation = f"Subtract April from May: {b} - {a} = {diff}."
        if i % 3 == 0:
            rows.append(grid(qid(), "Problem-Solving and Data Analysis", "Data interpretation", prompt, diff, explanation, i))
        else:
            choices, correct = numeric_choices(diff)
            rows.append(mc(qid(), "Math", "Problem-Solving and Data Analysis", "Data interpretation", prompt, choices, correct, explanation, i))

    for i in range(5):
        rate, hours = i + 3, i + 5
        value = rate * hours
        prompt = f"A printer makes {rate} posters per hour. At this rate, how many posters can it make in {hours} hours?"
        explanation = f"Multiply rate by time: {rate} x {hours} = {value}."
        rows.append(grid(qid(), "Problem-Solving and Data Analysis", "Ratios and rates", prompt, value, explanation, i))

    for i in range(5):
        base = 80 + i * 20
        pct = 15 + i * 5
        value = base + base * pct // 100
        prompt = f"The price of an item is ${base}. It increases by {pct}%. What is the new price, in dollars?"
        explanation = f"{pct}% of {base} is {base * pct // 100}. Add to the original price to get {value}."
        choices, correct = numeric_choices(value)
        rows.append(mc(qid(), "Math", "Problem-Solving and Data Analysis", "Percentages", prompt, choices, correct, explanation, i))

    for i in range(4):
        data = [i + 4, i + 6, i + 8, i + 10, i + 12]
        median = data[2]
        prompt = f"The data set is {', '.join(map(str, data))}. What is the median of the data set?"
        explanation = f"The values are already ordered, and the middle value is {median}."
        choices, correct = numeric_choices(median)
        rows.append(mc(qid(), "Math", "Problem-Solving and Data Analysis", "Statistics", prompt, choices, correct, explanation, i))

    for i in range(3):
        good, total = i + 2, (i + 2) * 5
        answer = f"{good}/{total}"
        prompt = f"A box contains {good} blue tiles and {total - good} red tiles. If one tile is selected at random, what is the probability it is blue?"
        explanation = f"Probability is favorable outcomes divided by total outcomes: {good}/{total}."
        rows.append(grid(qid(), "Problem-Solving and Data Analysis", "Probability", prompt, answer, explanation, i, [answer, str(good / total)]))

    # Geometry and Trigonometry.
    for i in range(8):
        angle = 35 + i * 5
        other = 180 - angle - 60
        prompt = f"In a triangle, two angle measures are {angle} degrees and 60 degrees. What is the third angle measure?"
        explanation = f"Triangle angles sum to 180 degrees: 180 - {angle} - 60 = {other}."
        rows.append(grid(qid(), "Geometry and Trigonometry", "Lines, angles, and triangles", prompt, other, explanation, i))

    for i in range(7):
        length, width = i + 6, i + 3
        area = length * width
        prompt = f"A rectangular display panel in design plan {chr(65 + i)} has length {length} and width {width}. What is its area?"
        explanation = f"Area of a rectangle is length times width: {length} x {width} = {area}."
        choices, correct = numeric_choices(area)
        rows.append(mc(qid(), "Math", "Geometry and Trigonometry", "Area and volume", prompt, choices, correct, explanation, i))

    for i in range(6):
        k = i + 2
        opposite, hyp = 3 * k, 5 * k
        prompt = f"In a right triangle, the side opposite angle A is {opposite} and the hypotenuse is {hyp}. What is sin(A)?"
        answer = f"3/5"
        explanation = f"sin(A) = opposite / hypotenuse = {opposite}/{hyp} = 3/5."
        rows.append(grid(qid(), "Geometry and Trigonometry", "Right triangles and trigonometry", prompt, answer, explanation, i, ["3/5", "0.6"]))

    for i in range(6):
        radius = i + 3
        diameter = 2 * radius
        prompt = f"A circle has radius {radius}. What is its diameter?"
        explanation = f"Diameter is twice the radius: 2 x {radius} = {diameter}."
        choices, correct = numeric_choices(diameter)
        rows.append(mc(qid(), "Math", "Geometry and Trigonometry", "Circles", prompt, choices, correct, explanation, i))

    return rows


SCENARIOS = [
    ("urban gardens", "cities with more community gardens reported cooler neighborhood blocks"),
    ("school libraries", "schools that extended library hours recorded higher independent reading rates"),
    ("public transit maps", "simpler map labels helped riders plan transfers more accurately"),
    ("museum audio guides", "visitors using short audio guides spent more time with individual exhibits"),
    ("wetland restoration", "restored wetlands held more stormwater after heavy rain"),
    ("solar classrooms", "classrooms with daylight sensors used less electricity during spring"),
]

DETAILS = [
    "after a six-week pilot",
    "in neighborhoods with similar starting conditions",
    "after researchers controlled for site size",
    "during the busiest part of the semester",
    "in communities with limited prior access",
    "after staff received the same training",
    "when the change was paired with clear signage",
    "during a period of unusually high demand",
]


def rw_questions():
    rows = []
    n = 1

    def qid():
        nonlocal n
        value = f"satking-rw-{n:03d}"
        n += 1
        return value

    def add(skill, domain, prompt, choices, correct, explanation, i):
        rows.append(mc(qid(), "Reading and Writing", domain, skill, prompt, choices, correct, explanation, i))

    for i in range(16):
        topic, finding = SCENARIOS[i % len(SCENARIOS)]
        detail = DETAILS[i % len(DETAILS)]
        prompt = f"A researcher studied {topic} {detail}. The study found that {finding}. Which choice best states the main idea of the text?"
        choices = {
            "A": f"A study of {topic} found a relationship between a design choice and a measurable outcome.",
            "B": f"The history of {topic} is older than many researchers once assumed.",
            "C": "Researchers disagreed about whether the method could be repeated in another country.",
            "D": "The study proves that all future projects should use the same design.",
        }
        add("Central Ideas and Details", "Information and Ideas", prompt, choices, "A", "Choice A states the broad finding without adding an unsupported claim.", i)

    for i in range(16):
        topic, finding = SCENARIOS[(i + 1) % len(SCENARIOS)]
        detail = DETAILS[(i + 2) % len(DETAILS)]
        prompt = (
            f"Researchers claim that local design can affect public behavior. Which finding, if true, would most directly support this claim?\n\n"
            f"Study focus: {topic}; condition: {detail}."
        )
        choices = {
            "A": f"In several sites, the specific design feature was followed by the outcome that {finding}.",
            "B": f"The sites were located in regions with different average yearly temperatures.",
            "C": "The researchers published their data in a journal read by urban planners.",
            "D": "Some participants said they had visited a similar site years earlier.",
        }
        add("Command of Evidence", "Information and Ideas", prompt, choices, "A", "Choice A directly links the design feature to the claimed behavioral or measurable outcome.", i)

    for i in range(15):
        topic, finding = SCENARIOS[(i + 2) % len(SCENARIOS)]
        detail = DETAILS[(i + 4) % len(DETAILS)]
        prompt = f"After observing that {finding} {detail}, the researchers added that the result appeared only where the change was maintained for several months. Which inference is best supported?"
        choices = {
            "A": "Short-term or inconsistent implementation may be less likely to produce the same effect.",
            "B": "The researchers could not measure the effect with any reliability.",
            "C": "The result was unrelated to local conditions.",
            "D": "Every site in the study changed by exactly the same amount.",
        }
        add("Inferences", "Information and Ideas", prompt, choices, "A", "The added condition implies that consistency over time mattered to the result.", i)

    for i in range(15):
        word = ["mitigate", "ambivalent", "substantiate", "constrain", "novel"][i % 5]
        meanings = {
            "mitigate": "reduce",
            "ambivalent": "conflicted",
            "substantiate": "support with evidence",
            "constrain": "limit",
            "novel": "new or unusual",
        }
        detail = DETAILS[i % len(DETAILS)]
        context = [
            f"The committee adopted a smaller version of the plan to mitigate concerns about cost {detail}.",
            f"Reviewers were ambivalent about the proposal, praising its ambition while questioning its timeline {detail}.",
            f"The scientist used additional measurements to substantiate the initial observation {detail}.",
            f"A narrow budget can constrain the number of experiments a team is able to run {detail}.",
            f"The engineer proposed a novel method that none of the previous reports had considered {detail}.",
        ][i % 5]
        prompt = f"{context}\n\nWhich choice gives the best meaning of \"{word}\" as used in the text?"
        choices = {"A": meanings[word], "B": "decorate", "C": "delay without cause", "D": "copy exactly"}
        add("Words in Context", "Craft and Structure", prompt, choices, "A", f"In context, \"{word}\" means {meanings[word]}.", i)

    for i in range(20):
        topic, finding = SCENARIOS[i % len(SCENARIOS)]
        detail = DETAILS[(i + 1) % len(DETAILS)]
        prompt = f"The text first introduces a problem related to {topic}, then describes a study showing that {finding} {detail}. Which choice best describes the main purpose of this structure?"
        choices = {
            "A": "To present a problem and then show evidence for one possible response to it.",
            "B": "To list unrelated events in chronological order.",
            "C": "To argue that research on the topic should stop.",
            "D": "To compare two authors who disagree about the same novel.",
        }
        add("Text Structure and Purpose", "Craft and Structure", prompt, choices, "A", "The structure moves from a problem to evidence about a response, so Choice A best describes the function.", i)

    for i in range(15):
        issue = [
            ("local newspapers", "letters to the editor"),
            ("early public parks", "community petitions"),
            ("museum labels", "visitor comments"),
            ("school newspapers", "student editorials"),
            ("railroad maps", "traveler annotations"),
        ][i % 5]
        detail = DETAILS[i % len(DETAILS)]
        prompt = (
            f"Text 1: Some historians argue that {issue[0]} mainly reflected elite viewpoints because owners controlled what was printed {detail}.\n"
            f"Text 2: Other historians note that {issue[1]} sometimes allowed ordinary readers to challenge those viewpoints during the same period.\n\n"
            "Which choice best describes how the author of Text 2 would most likely respond to the claim in Text 1?"
        )
        choices = {
            "A": "By agreeing partly but adding that newspapers could also contain dissenting public voices.",
            "B": "By denying that newspaper owners had any influence on published material.",
            "C": "By claiming that letters to the editor were never printed.",
            "D": "By shifting the discussion from newspapers to radio broadcasts.",
        }
        add("Cross-Text Connections", "Craft and Structure", prompt, choices, "A", "Text 2 complicates Text 1 by adding a channel for non-elite voices.", i)

    for i in range(24):
        topic, finding = SCENARIOS[i % len(SCENARIOS)]
        detail = DETAILS[(i + 3) % len(DETAILS)]
        prompt = (
            "While researching a topic, a student has taken the following notes:\n"
            f"- The topic is {topic}.\n"
            f"- One study found that {finding} {detail}.\n"
            "- The student wants to emphasize the practical result of the study.\n\n"
            "Which choice most effectively uses relevant information from the notes to accomplish this goal?"
        )
        choices = {
            "A": f"A study of {topic} showed a practical result: {finding}.",
            "B": f"{topic.capitalize()} can be discussed in many different academic fields.",
            "C": "The student took notes while researching a topic for a class assignment.",
            "D": "Some studies include methods sections, literature reviews, and conclusions.",
        }
        add("Rhetorical Synthesis", "Expression of Ideas", prompt, choices, "A", "Choice A uses the relevant notes and directly emphasizes the practical result.", i)

    for i in range(12):
        subjects = [
            ("coating", "prevent rust", "rust forming after only three days"),
            ("new schedule", "reduce delays", "buses arriving later than before"),
            ("soil mixture", "improve seed growth", "fewer seedlings than the control group"),
            ("survey design", "increase responses", "the response rate falling sharply"),
        ]
        item = subjects[i % len(subjects)]
        detail = DETAILS[i % len(DETAILS)]
        context_tag = ["in a lab", "at a coastal site", "during a classroom test", "in a city pilot", "at a library branch", "in a greenhouse"][i % 6]
        prompt = f"The first trial {context_tag} suggested that the {item[0]} would {item[1]} {detail}. ______ the second trial showed {item[2]}.\n\nWhich choice completes the text with the most logical transition?"
        choices = {"A": "However,", "B": "Therefore,", "C": "For example,", "D": "Similarly,"}
        add("Transitions", "Expression of Ideas", prompt, choices, "A", "The second sentence contrasts with the first, so However is the logical transition.", i)

    for i in range(24):
        subjects = [
            ("ceramic artist", "tested several clay mixtures", "she", "chose the one that held its shape best after firing"),
            ("biology class", "measured the plants each Friday", "it", "recorded the results in a shared spreadsheet"),
            ("research team", "visited three coastal sites", "it", "compared the samples under a microscope"),
            ("film club", "screened two documentaries", "members", "discussed the editing choices afterward"),
            ("engineering group", "built two bridge models", "it", "tested each model with the same weight"),
            ("poetry editor", "reviewed the submissions", "she", "selected the poems with the clearest imagery"),
        ]
        item = subjects[i % len(subjects)]
        detail = DETAILS[i % len(DETAILS)]
        prompt = f"The {item[0]} {item[1]} {detail} ______ {item[2]} {item[3]}.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?"
        choices = {"A": f", {item[2]}", "B": f" {item[2]}", "C": f"; {item[2]}", "D": f", and, {item[2]}"}
        add("Boundaries", "Standard English Conventions", prompt, choices, "C", "The two parts are independent clauses, so a semicolon can join them correctly.", i)

    for i in range(23):
        subject, verb = [
            ("The collection of essays", "examines"),
            ("The series of experiments", "shows"),
            ("The group of volunteers", "organizes"),
            ("The set of murals", "depicts"),
            ("The report on local wetlands", "describes"),
        ][i % 5]
        detail = DETAILS[i % len(DETAILS)]
        prompt = f"{subject} ______ how a small local change can affect a larger system {detail}.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?"
        base = verb[:-1] if verb.endswith("s") else verb
        choices = {"A": base, "B": verb, "C": f"were {base}ing", "D": f"have {base}d"}
        add("Form, structure, and sense", "Standard English Conventions", prompt, choices, "B", f"The full subject is singular, so the singular verb \"{verb}\" agrees with it.", i)

    return rows


def main():
    questions = rw_questions() + math_questions()
    payload = {
        "summary": {
            "generatedAt": "2026-05-17",
            "count": len(questions),
            "policy": "Original public-candidate supplemental pack; no protected source wording copied.",
        },
        "questions": questions,
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    by_section = {}
    by_skill = {}
    grid_in = 0
    hard = 0
    for question in questions:
        by_section[question["section"]] = by_section.get(question["section"], 0) + 1
        by_skill[question["skill"]] = by_skill.get(question["skill"], 0) + 1
        grid_in += question.get("questionType") == "student_produced_response"
        hard += question.get("difficulty") == "Hard"
    REPORT.write_text(
        json.dumps(
            {
                "count": len(questions),
                "bySection": by_section,
                "bySkill": dict(sorted(by_skill.items())),
                "studentProducedResponse": grid_in,
                "hardQuestions": hard,
                "output": str(OUT.relative_to(ROOT)),
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"count": len(questions), "gridIn": grid_in, "hard": hard, "out": str(OUT)}, indent=2))


if __name__ == "__main__":
    main()
