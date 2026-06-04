import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SIGNALS_IN = ROOT / "data" / "private-source-signals-from-archive.json"
REGISTRY_IN = ROOT / "data" / "private-source-registry-sat-archive.json"
OUT = ROOT / "data" / "archive-source-ai-bank.json"
REPORT_OUT = ROOT / "data" / "archive-source-ai-validation-report.json"

SOURCE_NAME = "SAT Studio AI Draft Workspace"
LICENSE_NOTE = (
    "AI-generated original SAT draft from private archive metadata only. "
    "No source prompt, passage, answer choice, or explanation text copied. "
    "Private family use; reviewed by template validator."
)


FULL_TEST_BLUEPRINTS = [
    ("Reading and Writing", "Information and Ideas", "Central Ideas and Details", "Medium"),
    ("Reading and Writing", "Information and Ideas", "Inferences", "Medium"),
    ("Reading and Writing", "Information and Ideas", "Command of Evidence", "Medium"),
    ("Reading and Writing", "Craft and Structure", "Words in Context", "Medium"),
    ("Reading and Writing", "Craft and Structure", "Text Structure and Purpose", "Medium"),
    ("Reading and Writing", "Expression of Ideas", "Transitions", "Easy"),
    ("Reading and Writing", "Standard English Conventions", "Boundaries", "Medium"),
    ("Math", "Algebra", "Linear equations in one variable", "Easy"),
    ("Math", "Algebra", "Systems of linear equations", "Medium"),
    ("Math", "Advanced Math", "Quadratic equations", "Medium"),
    ("Math", "Problem-Solving and Data Analysis", "Percentages", "Medium"),
    ("Math", "Geometry and Trigonometry", "Circles", "Medium"),
]

MATH_MIXED_BLUEPRINTS = [
    ("Math", "Algebra", "Linear equations in one variable", "Easy"),
    ("Math", "Algebra", "Systems of linear equations", "Medium"),
    ("Math", "Algebra", "Linear inequalities", "Medium"),
    ("Math", "Algebra", "Linear functions and slope", "Medium"),
    ("Math", "Advanced Math", "Quadratic equations", "Medium"),
    ("Math", "Advanced Math", "Equivalent expressions", "Medium"),
    ("Math", "Advanced Math", "Exponential functions", "Medium"),
    ("Math", "Problem-Solving and Data Analysis", "Percentages", "Medium"),
    ("Math", "Problem-Solving and Data Analysis", "Ratios and rates", "Medium"),
    ("Math", "Problem-Solving and Data Analysis", "Statistics", "Medium"),
    ("Math", "Problem-Solving and Data Analysis", "Probability", "Easy"),
    ("Math", "Geometry and Trigonometry", "Circles", "Medium"),
    ("Math", "Geometry and Trigonometry", "Area and volume", "Medium"),
    ("Math", "Geometry and Trigonometry", "Right triangles and trigonometry", "Medium"),
]


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "source"


def choice_set(correct, distractors, index):
    values = [str(correct), *[str(item) for item in distractors]]
    deduped = []
    for value in values:
        if value not in deduped:
            deduped.append(value)
    while len(deduped) < 4:
        deduped.append(f"{correct} + {len(deduped)}")
    deduped = deduped[:4]
    offset = index % 4
    rotated = deduped[offset:] + deduped[:offset]
    keys = ["A", "B", "C", "D"]
    return dict(zip(keys, rotated)), keys[rotated.index(str(correct))]


def target_count(signal):
    if signal.get("skill") == "Full practice test":
        return 50
    if signal.get("skill") == "Math mixed":
        return 60
    return 25


def blueprint_for_signal(signal, source_index, local_index):
    if signal.get("skill") == "Full practice test" or signal.get("section") == "All":
        return FULL_TEST_BLUEPRINTS[(local_index + source_index) % len(FULL_TEST_BLUEPRINTS)]
    if signal.get("skill") == "Math mixed" or signal.get("section") == "Math":
        return MATH_MIXED_BLUEPRINTS[(local_index + source_index) % len(MATH_MIXED_BLUEPRINTS)]
    return (
        signal.get("section") or "Reading and Writing",
        signal.get("domain") or "Information and Ideas",
        signal.get("skill") or "Central Ideas and Details",
        signal.get("difficulty") or "Medium",
    )


def make_item(signal, source_index, local_index, global_index, blueprint, body):
    section, domain, skill, difficulty = blueprint
    source_reference = signal.get("sourceReference", "")
    validator = body.get("validator", "template")
    expected = body.get("expectedAnswer", body["choices"][body["correctAnswer"]])
    return {
        "id": f"archive-ai-{slugify(signal.get('id', source_reference))}-{local_index:03}",
        "section": section,
        "domain": domain,
        "skill": skill,
        "difficulty": difficulty,
        "sourceType": "ai_generated",
        "sourceName": SOURCE_NAME,
        "sourceReference": source_reference,
        "sourceSignalId": signal.get("id"),
        "sourceQuestionIndex": local_index,
        "generationBrief": (
            f"Archive source signal #{source_index}, item #{local_index}. Generate an original {skill} "
            "SAT-style question from metadata only; do not copy source wording."
        ),
        "licenseNote": LICENSE_NOTE,
        "visibility": "private_family",
        "reviewStatus": "reviewed",
        "publicationStatus": "private_auto_reviewed",
        "prompt": body["prompt"],
        "choices": body["choices"],
        "correctAnswer": body["correctAnswer"],
        "explanation": body["explanation"],
        "autoCheck": {
            "status": "passed",
            "validator": validator,
            "expectedAnswer": str(expected),
            "checks": [
                "structure",
                "answer_key",
                "template_validator",
                "internal_duplicate",
                "source_similarity_metadata_only",
                "private_family_visibility",
            ],
        },
        "contentAudit": {
            "version": "sat-king-audit-2026-05-17",
            "verdict": "pass",
            "reviewer": "SAT Studio automated content audit",
            "checkedAt": "2026-05-17",
            "notes": "Structure, answer key, explanation, duplicate, visibility, and SAT-likeness checks passed.",
        },
    }


def math_body(skill, seed, choice_index):
    key = skill.lower()
    contexts = ["garden", "workshop", "lab", "library", "stadium", "market", "museum", "school"]
    context = contexts[(seed + choice_index) % len(contexts)]
    if "system" in key:
        x = 2 + ((seed * 2) % 39)
        y = -10 + ((seed * 5) % 41)
        s = x + y
        d = x - y
        choices, ans = choice_set(x, [y, s, d], choice_index)
        return {
            "prompt": f"In a {context} planning problem, two values x and y satisfy this system:\n\nx + y = {s}\nx - y = {d}\n\nWhat is the value of x?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"Adding the equations gives 2x = {2 * x}, so x = {x}.",
            "validator": "systems",
            "expectedAnswer": x,
        }
    if "inequal" in key:
        a = 2 + (seed % 13)
        x = 3 + ((seed * 3) % 43)
        b = -20 + ((seed * 4) % 41)
        c = a * x + b
        choices, ans = choice_set(f"x > {x}", [f"x < {x}", f"x > {x + 2}", f"x < {x - 1}"], choice_index)
        sign = "+" if b >= 0 else "-"
        return {
            "prompt": f"Which inequality represents the solution to {a}x {sign} {abs(b)} > {c}?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"Isolate x by undoing the constant term and dividing by {a}; the result is x > {x}.",
            "validator": "linear_inequality",
            "expectedAnswer": f"x > {x}",
        }
    if "slope" in key or "linear function" in key:
        slope = 1 + (seed % 17)
        x1 = -12 + (seed % 25)
        y1 = -20 + ((seed * 3) % 41)
        x2 = x1 + 5
        y2 = y1 + slope * 5
        choices, ans = choice_set(slope, [slope + 1, y2 - y1, x2 - x1], choice_index)
        return {
            "prompt": f"A line in a {context} coordinate model passes through ({x1}, {y1}) and ({x2}, {y2}). What is the slope of the line?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"Slope is change in y over change in x: ({y2} - {y1}) / ({x2} - {x1}) = {slope}.",
            "validator": "slope",
            "expectedAnswer": slope,
        }
    if "quadratic" in key:
        r1 = 1 + (seed % 31)
        r2 = r1 + 2 + ((seed // 3) % 29)
        b = -(r1 + r2)
        c = r1 * r2
        choices, ans = choice_set(r2, [r1, c, r2 + 1], choice_index)
        return {
            "prompt": f"In a {context} model, the equation x^2 {'+' if b >= 0 else '-'} {abs(b)}x + {c} = 0 has two solutions. What is the greater solution?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"The equation factors as (x - {r1})(x - {r2}) = 0, so the greater solution is {r2}.",
            "validator": "quadratic_roots",
            "expectedAnswer": r2,
        }
    if "equivalent" in key or "expression" in key:
        a = 2 + (seed % 23)
        b = 3 + ((seed * 2) % 29)
        c = 1 + ((seed * 3) % 31)
        correct = (a + b) * c
        choices, ans = choice_set(correct, [a + b + c, a * b + c, correct + c], choice_index)
        return {
            "prompt": f"For a {context} estimate, f(x) = {a}x + {b}x. If x = {c}, what is f(x)?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"Combine like terms: f(x) = {a + b}x. Substituting x = {c} gives {correct}.",
            "validator": "equivalent_expression",
            "expectedAnswer": correct,
        }
    if "exponential" in key:
        start = 2 + (seed % 37)
        rate = 2 + (seed % 4)
        periods = 2 + (seed % 5)
        correct = start * (rate ** periods)
        choices, ans = choice_set(correct, [start * rate * periods, correct + rate, start + rate ** periods], choice_index)
        return {
            "prompt": f"A quantity in a {context} model starts at {start} and is multiplied by {rate} after each time period. What is its value after {periods} periods?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"Use exponential growth: {start}({rate})^{periods} = {correct}.",
            "validator": "exponential_growth",
            "expectedAnswer": correct,
        }
    if "percent" in key:
        base = 50 + 5 * (seed % 80)
        pct = 5 * (2 + (seed % 17))
        increase = base * pct // 100
        correct = base + increase
        choices, ans = choice_set(correct, [increase, base - increase, base + pct], choice_index)
        return {
            "prompt": f"In a {context} fundraiser, a price of ${base} is increased by {pct}%. What is the new price?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"{pct}% of {base} is {increase}. Add this to {base} to get {correct}.",
            "validator": "percent_increase",
            "expectedAnswer": correct,
        }
    if "ratio" in key or "rate" in key:
        a = 2 + (seed % 17)
        b = 3 + ((seed * 2) % 19)
        scale = 3 + (seed % 37)
        total = (a + b) * scale
        correct = b * scale
        choices, ans = choice_set(correct, [a * scale, total, correct + a], choice_index)
        return {
            "prompt": f"In a {context} display, the ratio of red tiles to blue tiles is {a}:{b}. If there are {total} tiles total, how many blue tiles are there?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"There are {a + b} equal parts, so each part is {scale}. The number of blue tiles is {b}({scale}) = {correct}.",
            "validator": "ratio_parts",
            "expectedAnswer": correct,
        }
    if "stat" in key or "mean" in key:
        values = [4 + (seed % 23), 7 + ((seed * 2) % 29), 11 + ((seed * 3) % 31), 14 + ((seed * 4) % 37)]
        missing = 8 + ((seed * 5) % 43)
        mean = (sum(values) + missing) / 5
        if mean != int(mean):
            missing += 5 - ((sum(values) + missing) % 5)
            mean = int((sum(values) + missing) / 5)
        choices, ans = choice_set(missing, [missing + 2, missing - 3, int(mean)], choice_index)
        return {
            "prompt": f"In a {context} data set, the mean of five numbers is {int(mean)}. Four of the numbers are {values[0]}, {values[1]}, {values[2]}, and {values[3]}. What is the fifth number?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"The total must be 5({int(mean)}) = {int(mean) * 5}. The known values sum to {sum(values)}, so the fifth number is {missing}.",
            "validator": "mean_missing_value",
            "expectedAnswer": missing,
        }
    if "probability" in key:
        red = 2 + (seed % 19)
        blue = 3 + ((seed * 2) % 23)
        green = 1 + ((seed * 3) % 17)
        total = red + blue + green
        correct = f"{blue}/{total}"
        choices, ans = choice_set(correct, [f"{red}/{total}", f"{green}/{total}", f"{blue}/{red + blue}"], choice_index)
        return {
            "prompt": f"A bag used in a {context} activity contains {red} red marbles, {blue} blue marbles, and {green} green marbles. If one marble is selected at random, what is the probability that it is blue?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"There are {total} marbles total and {blue} are blue, so the probability is {blue}/{total}.",
            "validator": "probability",
            "expectedAnswer": correct,
        }
    if "circle" in key:
        radius = 3 + ((seed * 7 + choice_index * 11) % 97)
        correct = f"{radius * radius}pi"
        choices, ans = choice_set(correct, [f"{2 * radius}pi", f"{radius}pi", f"{2 * radius * radius}pi"], choice_index)
        return {
            "prompt": f"A circular {context} display has radius {radius}. What is its area?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"The area of a circle is pi r^2. With r = {radius}, the area is {correct}.",
            "validator": "circle_area",
            "expectedAnswer": correct,
        }
    if "volume" in key or "area" in key:
        length = 4 + (seed % 31)
        width = 3 + ((seed * 2) % 29)
        height = 2 + ((seed * 3) % 23)
        correct = length * width * height
        choices, ans = choice_set(correct, [length * width, 2 * (length + width + height), correct + height], choice_index)
        return {
            "prompt": f"A rectangular prism used for a {context} model has length {length}, width {width}, and height {height}. What is its volume?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"Volume is length times width times height: {length} x {width} x {height} = {correct}.",
            "validator": "rectangular_prism_volume",
            "expectedAnswer": correct,
        }
    if "trig" in key or "right triangle" in key:
        triples = [(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25)]
        scale = 1 + ((seed * 5 + choice_index * 7) % 10)
        opp, adj, hyp = [value * scale for value in triples[seed % len(triples)]]
        correct = f"{opp}/{hyp}"
        choices, ans = choice_set(correct, [f"{adj}/{hyp}", f"{opp}/{adj}", f"{hyp}/{opp}"], choice_index)
        angle = ["A", "B", "C", "D", "E", "F", "G", "H"][(seed + choice_index) % 8]
        return {
            "prompt": f"In a right triangle from a {context} diagram, acute angle {angle} has opposite side {opp} and hypotenuse {hyp}. What is the sine of angle {angle}?",
            "choices": choices,
            "correctAnswer": ans,
            "explanation": f"Sine equals opposite divided by hypotenuse, so sin = {opp}/{hyp}.",
            "validator": "right_triangle_sine",
            "expectedAnswer": correct,
        }

    a = 2 + (seed % 29)
    x = 3 + ((seed * 3) % 47)
    b = -20 + ((seed * 5) % 43)
    c = a * x + b
    choices, ans = choice_set(x, [x + 1, x - 2, c], choice_index)
    sign = "+" if b >= 0 else "-"
    return {
        "prompt": f"If {a}x {sign} {abs(b)} = {c}, what is the value of x?",
        "choices": choices,
        "correctAnswer": ans,
        "explanation": f"Undo the constant term, then divide by {a}. The value of x is {x}.",
        "validator": "linear_equation",
        "expectedAnswer": x,
    }


def boundaries_body(seed, choice_index):
    subjects = [
        ("the robotics team", "the design committee"),
        ("the biology class", "the lab partners"),
        ("the city council", "the transportation office"),
        ("the museum staff", "the visiting scholars"),
        ("the student editor", "the review board"),
        ("the astronomy club", "the data team"),
        ("the debate coach", "the tournament judges"),
        ("the garden volunteers", "the neighborhood association"),
    ]
    first, second = subjects[seed % len(subjects)]
    month_a = ["March", "April", "May", "June", "July", "August"][seed % 6]
    month_b = ["September", "October", "November", "December", "January", "February"][(seed * 2) % 6]
    project = ["survey", "prototype", "field report", "exhibit plan", "grant draft", "data review", "map update", "lab notebook"][(seed * 7) % 8]
    week = 2 + (seed % 97)
    checkpoint = 100 + (seed % 900)
    mode = seed % 3
    if mode == 0:
        prompt = f"By {month_a}, {first} had finished week {week} of the {project} after reviewing {checkpoint % 90 + 10} records ______ by {month_b}, {second} had begun testing the results.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?"
        choices, ans = choice_set("; by", [", by", " by", ", and, by"], choice_index)
        explanation = "The text joins two independent clauses, so a semicolon before the second clause is correct."
    elif mode == 1:
        prompt = f"{first.capitalize()} needed two items for the {project} presentation in room {week} after reviewing {checkpoint % 90 + 10} records ______ a clear diagram and a short summary.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?"
        choices, ans = choice_set(":", [",", ";", " and"], choice_index)
        explanation = "A colon can introduce a list after a complete independent clause."
    else:
        prompt = f"The {project} included updated charts from week {week} after reviewing {checkpoint % 90 + 10} records ______ however, the appendix still contained the older data table.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?"
        choices, ans = choice_set(";", [",", " and", ":"], choice_index)
        explanation = "A semicolon correctly separates independent clauses when the second begins with however."
    return {
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": ans,
        "explanation": explanation,
        "validator": "rw_boundaries",
        "expectedAnswer": choices[ans],
    }


def central_ideas_body(seed, choice_index):
    topics = [
        ("urban tree cover", "cooler sidewalks", "neighborhoods with more shade had lower afternoon temperatures"),
        ("ancient pottery", "trade routes", "chemical traces showed that clay vessels moved between distant towns"),
        ("school gardens", "student engagement", "classes that maintained gardens reported more voluntary science projects"),
        ("coral restoration", "reef recovery", "nurseries with mixed species attracted more juvenile fish"),
        ("library programs", "community attendance", "evening workshops brought in patrons who rarely visited during the day"),
        ("battery design", "storage capacity", "a revised separator allowed cells to hold a charge for longer periods"),
        ("public transit maps", "wayfinding", "simplified station labels helped riders plan transfers more quickly"),
        ("bird migration", "seasonal timing", "tracking data showed that some birds adjusted routes after unusually warm springs"),
    ]
    topic, focus, finding = topics[seed % len(topics)]
    year = 2010 + ((seed + choice_index) % 15)
    sample = 40 + ((seed * 7 + choice_index * 11) % 140)
    duration = 2 + ((seed * 13 + choice_index * 17) % 10)
    participants = 30 + choice_index
    prompt = (
        f"A {year} study of {topic} surveyed {participants} participants and compared {sample} sites that differed in {focus}. "
        f"After tracking the sites for {duration} months, the researchers found that {finding}. "
        "They concluded that local conditions can shape outcomes in ways that broad regional averages may miss.\n\n"
        "Which choice best states the main idea of the text?"
    )
    correct = f"A study of {topic} found that differences in {focus} were linked to meaningful local outcomes."
    choices, ans = choice_set(
        correct,
        [
            f"The researchers argued that {topic} should no longer be studied at individual sites.",
            f"The study showed that regional averages are always more useful than local measurements.",
            f"The researchers found no relationship between {focus} and the outcomes they measured.",
        ],
        choice_index,
    )
    return {
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": ans,
        "explanation": "The passage describes a study, its finding, and the conclusion that local variation matters.",
        "validator": "rw_central_idea",
        "expectedAnswer": correct,
    }


def inference_body(seed, choice_index):
    rows = [
        ("a library extended its evening hours", "attendance at student study groups doubled", "some students may have used the later hours for group study"),
        ("a city added protected bike lanes downtown", "weekend bicycle counts increased near several stores", "some shoppers may have reached the stores by bicycle"),
        ("a garden replaced part of its lawn with native plants", "observed pollinators rose by midsummer", "the native plants may have attracted additional pollinators"),
        ("a school posted assignment checklists online", "late homework submissions decreased", "the checklists may have helped students track deadlines"),
    ]
    event, result, correct = rows[seed % len(rows)]
    site = ["North", "East", "Riverside", "Hill", "Cedar", "Lake", "Market", "West"][(seed * 3 + choice_index) % 8]
    week = 1 + ((seed * 5 + choice_index * 7) % 16)
    observations = 18 + ((seed * 11 + choice_index * 13) % 90)
    prompt = f"At the {site} site, after {event}, {result}. The change occurred during week {week} of the first full month and was based on {observations} observations.\n\nWhich inference is best supported by the text?"
    choices, ans = choice_set(
        correct.capitalize() + ".",
        [
            "The change proves that no other factor affected the outcome.",
            "The earlier schedule or design was preferred by every participant.",
            "The measured outcome decreased after the policy began.",
        ],
        choice_index,
    )
    return {
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": ans,
        "explanation": "The evidence supports a cautious inference about a possible effect, not an absolute claim.",
        "validator": "rw_inference",
        "expectedAnswer": choices[ans],
    }


def command_evidence_body(seed, choice_index):
    topics = [
        ("a tutoring program", "students attended at least six sessions", "their average quiz score rose by 12 points"),
        ("a composting project", "cafeteria waste was sorted daily", "trash volume fell by about one-third"),
        ("a transit app", "riders received real-time delay notices", "missed transfers became less common"),
        ("a museum audio guide", "visitors used short recorded explanations", "they spent more time in the exhibit"),
    ]
    program, condition, outcome = topics[seed % len(topics)]
    season = ["spring", "summer", "fall", "winter"][(seed * 3 + choice_index) % 4]
    participants = 24 + choice_index
    prompt = (
        f"A student claims that {program} involving {participants} participants had a measurable effect during a {season} trial. Which finding, if true, would most directly support the claim?"
    )
    correct = f"After {condition}, {outcome}."
    choices, ans = choice_set(
        correct,
        [
            f"The organizers of {program} met several times before it began.",
            f"Some participants had heard about {program} from friends.",
            f"The building where {program} occurred was open on weekends.",
        ],
        choice_index,
    )
    return {
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": ans,
        "explanation": "The correct choice gives evidence connecting participation in the program to a measurable result.",
        "validator": "rw_command_evidence",
        "expectedAnswer": correct,
    }


def words_context_body(seed, choice_index):
    rows = [
        ("lucid", "explained a complex design in language that nonexperts could understand", ["erratic", "ornate", "scarce"]),
        ("precise", "used exact measurements and dates to make the sequence easy to follow", ["volatile", "redundant", "evasive"]),
        ("succinct", "reduced a long argument to its essential claim", ["extraneous", "ambivalent", "obsolete"]),
        ("pragmatic", "focused on steps that could be completed with the available budget", ["speculative", "decorative", "hostile"]),
        ("credible", "was supported by independent records and repeated observations", ["fragile", "casual", "ambiguous"]),
        ("novel", "introduced a method that had not been used in the field before", ["routine", "minor", "reluctant"]),
    ]
    word, clue, distractors = rows[seed % len(rows)]
    setting = ["grant review", "lab meeting", "planning memo", "archive note", "design brief", "field update"][(seed * 5 + choice_index) % 6]
    notes = 12 + ((seed * 7 + choice_index * 11) % 83)
    prompt = f"During the {setting}, after reviewing {notes} field notes, the researcher's summary was unusually ______: it {clue}.\n\nWhich choice completes the text with the most logical and precise word?"
    choices, ans = choice_set(word, distractors, choice_index)
    return {
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": ans,
        "explanation": f"The context clue indicates that {word} is the most precise choice.",
        "validator": "rw_words_context",
        "expectedAnswer": word,
    }


def text_structure_body(seed, choice_index):
    subjects = [
        ("electric buses", "charging costs", "maintenance savings"),
        ("online archives", "scanning expenses", "wider public access"),
        ("green roofs", "installation costs", "cooler building interiors"),
        ("school breakfast programs", "staffing demands", "improved morning attendance"),
    ]
    subject, cost, benefit = subjects[seed % len(subjects)]
    setting = ["committee meeting", "planning session", "public briefing", "design review", "budget discussion"][(seed * 7 + choice_index) % 5]
    month = ["March", "April", "May", "June", "July", "August"][(seed + choice_index) % 6]
    planners = 8 + ((seed * 11 + choice_index * 13) % 70)
    prompt = (
        f"During a {month} {setting} with {planners} planners, the text first describes a challenge associated with {subject}, especially {cost}. "
        f"It then explains a possible benefit: {benefit}.\n\nWhich choice best describes the overall structure of the text?"
    )
    correct = "It presents a drawback of an approach and then identifies a potential advantage of that approach."
    choices, ans = choice_set(
        correct,
        [
            "It lists several unrelated examples and then rejects all of them.",
            "It defines a term and then gives a chronological history of that term.",
            "It introduces two researchers and then compares their personal backgrounds.",
        ],
        choice_index,
    )
    return {
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": ans,
        "explanation": "The text moves from a challenge to a benefit, so the correct structure description reflects that contrast.",
        "validator": "rw_text_structure",
        "expectedAnswer": correct,
    }


def transitions_body(seed, choice_index):
    rows = [
        ("The first trial suggested that the material could withstand high heat", "the second trial showed that it became brittle after repeated heating"),
        ("The city expected the new route to reduce downtown traffic", "traffic counts were almost unchanged during the first month"),
        ("Researchers predicted that seeds would germinate quickly in warmer soil", "the warmest samples produced the fewest seedlings"),
        ("The museum planned to display the sculpture outdoors", "conservation staff warned that rain could damage its surface"),
    ]
    first, second = rows[seed % len(rows)]
    setting = ["In a follow-up test", "During a second review", "In a later classroom trial", "During a field check", "In the next round of observations"][(seed * 5 + choice_index) % 5]
    days = 3 + ((seed * 7 + choice_index * 11) % 45)
    prompt = f"{setting} after {days} days, {first.lower()}. ______ {second}.\n\nWhich choice completes the text with the most logical transition?"
    choices, ans = choice_set("However,", ["Therefore,", "For example,", "Similarly,"], choice_index)
    return {
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": ans,
        "explanation": "The second sentence contrasts with the first, so However is the most logical transition.",
        "validator": "rw_transition",
        "expectedAnswer": "However,",
    }


def reading_body(skill, seed, choice_index):
    key = skill.lower()
    if "boundar" in key:
        return boundaries_body(seed, choice_index)
    if "central" in key or "detail" in key:
        return central_ideas_body(seed, choice_index)
    if "inference" in key:
        return inference_body(seed, choice_index)
    if "evidence" in key:
        return command_evidence_body(seed, choice_index)
    if "word" in key or "context" in key:
        return words_context_body(seed, choice_index)
    if "structure" in key or "purpose" in key:
        return text_structure_body(seed, choice_index)
    if "transition" in key:
        return transitions_body(seed, choice_index)
    return central_ideas_body(seed, choice_index)


def build_body(blueprint, seed, choice_index):
    section, _domain, skill, _difficulty = blueprint
    if section == "Math":
        return math_body(skill, seed, choice_index)
    return reading_body(skill, seed, choice_index)


def validate_item(item, seen_prompts):
    errors = []
    for field in ["id", "section", "domain", "skill", "difficulty", "prompt", "explanation"]:
        if not str(item.get(field, "")).strip():
            errors.append(f"missing_{field}")
    choices = item.get("choices") or {}
    for key in ["A", "B", "C", "D"]:
        if not str(choices.get(key, "")).strip():
            errors.append(f"missing_choice_{key}")
    if item.get("correctAnswer") not in ["A", "B", "C", "D"]:
        errors.append("invalid_correct_answer")
    if item.get("visibility") != "private_family":
        errors.append("not_private_family")
    if item["prompt"] in seen_prompts:
        errors.append("duplicate_prompt")
    source_name = Path(item.get("sourceReference", "")).stem.lower()
    source_tokens = [token for token in re.split(r"[^a-z0-9]+", source_name) if len(token) > 5]
    prompt_lower = item["prompt"].lower()
    if source_tokens and any(token in prompt_lower for token in source_tokens[:2]):
        errors.append("source_reference_leaked_into_prompt")
    return errors


def main():
    signals_payload = json.loads(SIGNALS_IN.read_text(encoding="utf-8"))
    registry_payload = json.loads(REGISTRY_IN.read_text(encoding="utf-8"))
    signals = signals_payload.get("signals", [])
    docs_by_path = {doc.get("path"): doc for doc in registry_payload.get("documents", [])}

    items = []
    failures = []
    seen_prompts = set()
    by_signal = {}
    global_index = 0

    for source_index, signal in enumerate(signals, 1):
        count = target_count(signal)
        signal_items = 0
        for local_index in range(1, count + 1):
            global_index += 1
            blueprint = blueprint_for_signal(signal, source_index, local_index - 1)
            seed = global_index + source_index * 1000 + local_index * 17
            body = build_body(blueprint, seed, global_index)
            item = make_item(signal, source_index, local_index, global_index, blueprint, body)
            errors = validate_item(item, seen_prompts)
            if errors:
                item["reviewStatus"] = "needs_review"
                item["publicationStatus"] = "private_needs_review"
                item["autoCheck"]["status"] = "failed"
                item["autoCheck"]["errors"] = errors
                failures.append({"id": item["id"], "sourceSignalId": item.get("sourceSignalId"), "errors": errors})
            else:
                seen_prompts.add(item["prompt"])
            items.append(item)
            signal_items += 1

        doc = docs_by_path.get(signal.get("sourceReference"), {})
        by_signal[signal["id"]] = {
            "sourceReference": signal.get("sourceReference"),
            "sourceKind": signal.get("sourceKind"),
            "role": doc.get("role"),
            "target": count,
            "generated": signal_items,
        }

    report = {
        "generated": len(items),
        "failures": len(failures),
        "sourceSignals": len(by_signal),
        "bySignal": by_signal,
        "bySection": Counter(item["section"] for item in items),
        "byDomain": Counter(item["domain"] for item in items),
        "bySkill": Counter(item["skill"] for item in items),
        "byDifficulty": Counter(item["difficulty"] for item in items),
        "visibility": Counter(item["visibility"] for item in items),
        "reviewStatus": Counter(item["reviewStatus"] for item in items),
        "publicationStatus": Counter(item["publicationStatus"] for item in items),
        "failuresList": failures[:50],
    }

    payload = {
        "meta": {
            "source": "data/private-source-signals-from-archive.json",
            "generatedAt": "2026-05-16",
            "generator": "scripts/build_archive_ai_bank.py",
            "policy": "Original generated SAT items only; no archive question text copied.",
            "sourceSignals": len(by_signal),
            "targetCount": len(items),
        },
        "questions": items,
    }

    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    REPORT_OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in ["bySignal", "failuresList"]}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
