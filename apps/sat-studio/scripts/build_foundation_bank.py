import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "sat-studio-foundation-bank.json"

SOURCE_NAME = "SAT Studio Foundation Bank"
LICENSE_NOTE = (
    "Original SAT Studio item. Concept references are recorded in data/free-source-registry.json; "
    "no source exercise text copied. Needs review before public release."
)
CHOICE_COUNTER = 0


def item(qid, section, domain, skill, difficulty, prompt, choices, correct, explanation):
    return {
        "id": qid,
        "section": section,
        "domain": domain,
        "skill": skill,
        "difficulty": difficulty,
        "sourceType": "foundation",
        "sourceName": SOURCE_NAME,
        "licenseNote": LICENSE_NOTE,
        "reviewStatus": "needs_review",
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": correct,
        "explanation": explanation,
    }


def choices(correct, distractors):
    global CHOICE_COUNTER
    values = []
    for value in [correct, *distractors]:
        text = str(value)
        if text not in [str(item) for item in values]:
            values.append(value)
        if len(values) == 4:
            break
    filler_offset = 1
    while len(values) < 4:
        try:
            filler = str(int(correct) + len(values) + filler_offset)
        except (TypeError, ValueError):
            filler = f"{correct} + {len(values) + filler_offset}"
        if filler not in [str(item) for item in values]:
            values.append(filler)
        filler_offset += 1
    offset = CHOICE_COUNTER % 4
    CHOICE_COUNTER += 1
    rotated = values[offset:] + values[:offset]
    keys = ["A", "B", "C", "D"]
    correct_key = keys[rotated.index(correct)]
    return dict(zip(keys, [str(v) for v in rotated])), correct_key


def add_math(items):
    for i, (a, x, b) in enumerate([(3, 7, 5), (4, 6, -2), (5, 4, 11), (6, 8, -10), (7, 5, 9), (8, 3, 12)], 1):
        c = a * x + b
        ch, ans = choices(x, [x + 1, x - 2, c])
        items.append(
            item(
                f"foundation-math-linear-equation-{i:03}",
                "Math",
                "Algebra",
                "Linear equations in one variable",
                "Easy" if i <= 3 else "Medium",
                f"If {a}x {'+' if b >= 0 else '-'} {abs(b)} = {c}, what is the value of x?",
                ch,
                ans,
                f"{'Subtract ' + str(b) if b >= 0 else 'Add ' + str(abs(b))} on both sides and divide by {a}: x = {x}.",
            )
        )

    for i, (x, y) in enumerate([(5, 2), (7, 4), (8, 3), (6, -1), (9, 5), (4, -2)], 1):
        s, d = x + y, x - y
        ch, ans = choices(x, [y, s, d])
        items.append(
            item(
                f"foundation-math-systems-{i:03}",
                "Math",
                "Algebra",
                "Systems of linear equations",
                "Medium",
                f"A system of equations is shown:\n\nx + y = {s}\nx - y = {d}\n\nWhat is the value of x?",
                ch,
                ans,
                f"Adding the equations gives 2x = {2 * x}, so x = {x}.",
            )
        )

    for i, (x1, y1, x2, y2) in enumerate([(1, 4, 5, 12), (2, 9, 6, 17), (-1, 3, 3, 11), (0, -2, 4, 10)], 1):
        slope = (y2 - y1) // (x2 - x1)
        ch, ans = choices(slope, [slope + 1, slope - 1, y2 - y1])
        items.append(
            item(
                f"foundation-math-linear-functions-{i:03}",
                "Math",
                "Algebra",
                "Linear functions and slope",
                "Easy",
                f"A line passes through ({x1}, {y1}) and ({x2}, {y2}). What is the slope of the line?",
                ch,
                ans,
                f"Slope is change in y divided by change in x: ({y2} - {y1}) / ({x2} - {x1}) = {slope}.",
            )
        )

    for i, (a, b, bound) in enumerate([(2, 3, 15), (3, -4, 17), (5, 6, 31), (4, -7, 9)], 1):
        solution = (bound - b) // a
        ch, ans = choices(f"x < {solution}", [f"x > {solution}", f"x < {solution + 2}", f"x > {solution - 1}"])
        items.append(
            item(
                f"foundation-math-inequalities-{i:03}",
                "Math",
                "Algebra",
                "Linear inequalities",
                "Medium",
                f"Which inequality is equivalent to {a}x {'+' if b >= 0 else '-'} {abs(b)} < {bound}?",
                ch,
                ans,
                f"Isolate x: {a}x < {bound - b}, so x < {solution}.",
            )
        )

    for i, (r1, r2) in enumerate([(2, 5), (3, 7), (-1, 4), (-2, 6), (1, 8), (4, 9)], 1):
        b = -(r1 + r2)
        c = r1 * r2
        positive = max(r1, r2)
        ch, ans = choices(positive, [min(r1, r2), positive + 1, c])
        items.append(
            item(
                f"foundation-math-quadratic-{i:03}",
                "Math",
                "Advanced Math",
                "Quadratic equations",
                "Medium",
                f"One solution to x^2 {'+' if b >= 0 else '-'} {abs(b)}x {'+' if c >= 0 else '-'} {abs(c)} = 0 is {min(r1, r2)}. What is the other solution?",
                ch,
                ans,
                f"The equation factors as (x - {r1})(x - {r2}) = 0, so the solutions are {r1} and {r2}.",
            )
        )

    for i, (m, n) in enumerate([(2, 3), (3, 4), (4, 5), (2, 7), (5, 6), (3, 8)], 1):
        middle = m + n
        last = m * n
        ch, ans = choices(f"(x + {m})(x + {n})", [f"(x + {middle})(x + {last})", f"(x - {m})(x - {n})", f"(x + {last})(x + 1)"])
        items.append(
            item(
                f"foundation-math-equivalent-expressions-{i:03}",
                "Math",
                "Advanced Math",
                "Equivalent expressions",
                "Medium",
                f"Which expression is equivalent to x^2 + {middle}x + {last}?",
                ch,
                ans,
                f"Two numbers that add to {middle} and multiply to {last} are {m} and {n}, so the expression factors as (x + {m})(x + {n}).",
            )
        )

    for i, (a, b, x) in enumerate([(3, 2, 4), (5, 2, 3), (2, 3, 3), (4, 3, 2)], 1):
        value = a * (b**x)
        ch, ans = choices(value, [value + a, a * b * x, b**x])
        items.append(
            item(
                f"foundation-math-exponential-{i:03}",
                "Math",
                "Advanced Math",
                "Exponential functions",
                "Medium",
                f"The function f is defined by f(x) = {a}({b})^x. What is f({x})?",
                ch,
                ans,
                f"Substitute {x} for x: f({x}) = {a}({b})^{x} = {value}.",
            )
        )

    for i, (base, pct) in enumerate([(80, 15), (120, 25), (60, 40), (200, 12)], 1):
        inc = base * pct // 100
        total = base + inc
        ch, ans = choices(total, [inc, base - inc, base + pct])
        items.append(
            item(
                f"foundation-math-percent-{i:03}",
                "Math",
                "Problem-Solving and Data Analysis",
                "Percentages",
                "Easy",
                f"A quantity of {base} is increased by {pct}%. What is the new quantity?",
                ch,
                ans,
                f"{pct}% of {base} is {inc}; the new quantity is {base} + {inc} = {total}.",
            )
        )

    for i, (distance, hours) in enumerate([(180, 3), (240, 4), (315, 5), (96, 2)], 1):
        rate = distance // hours
        ch, ans = choices(rate, [rate + 5, rate - 6, distance + hours])
        items.append(
            item(
                f"foundation-math-rates-{i:03}",
                "Math",
                "Problem-Solving and Data Analysis",
                "Rates and units",
                "Easy",
                f"A car travels {distance} miles in {hours} hours at a constant speed. What is the speed in miles per hour?",
                ch,
                ans,
                f"Rate equals distance divided by time: {distance} / {hours} = {rate}.",
            )
        )

    for i, nums in enumerate([[4, 7, 9, 10, 15], [12, 13, 15, 20, 25], [3, 5, 8, 12, 17], [10, 10, 14, 18, 23]], 1):
        median = nums[len(nums) // 2]
        ch, ans = choices(median, [sum(nums) // len(nums), nums[0], nums[-1]])
        items.append(
            item(
                f"foundation-math-statistics-{i:03}",
                "Math",
                "Problem-Solving and Data Analysis",
                "Statistics",
                "Easy",
                f"The data set is {', '.join(map(str, nums))}. What is the median?",
                ch,
                ans,
                "The median is the middle value after the data are ordered.",
            )
        )

    for i, (fav, total) in enumerate([(3, 8), (5, 12), (7, 20), (4, 9)], 1):
        ch, ans = choices(f"{fav}/{total}", [f"{total - fav}/{total}", f"{fav}/{total - fav}", f"{total}/{fav}"])
        items.append(
            item(
                f"foundation-math-probability-{i:03}",
                "Math",
                "Problem-Solving and Data Analysis",
                "Probability",
                "Easy",
                f"A bag contains {fav} red tiles and {total - fav} blue tiles. If one tile is selected at random, what is the probability that it is red?",
                ch,
                ans,
                f"There are {fav} favorable outcomes out of {total} total outcomes, so the probability is {fav}/{total}.",
            )
        )

    for i, (length, width) in enumerate([(8, 5), (12, 7), (15, 6), (9, 9)], 1):
        area = length * width
        ch, ans = choices(area, [2 * (length + width), length + width, area + length])
        items.append(
            item(
                f"foundation-math-area-{i:03}",
                "Math",
                "Geometry and Trigonometry",
                "Area and volume",
                "Easy",
                f"A rectangle has length {length} and width {width}. What is its area?",
                ch,
                ans,
                f"Area of a rectangle is length times width: {length} x {width} = {area}.",
            )
        )

    for i, (a, b, c) in enumerate([(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25)], 1):
        ch, ans = choices(c, [a + b, c - 1, b])
        items.append(
            item(
                f"foundation-math-right-triangle-{i:03}",
                "Math",
                "Geometry and Trigonometry",
                "Right triangles",
                "Medium",
                f"In a right triangle, the legs have lengths {a} and {b}. What is the length of the hypotenuse?",
                ch,
                ans,
                f"By the Pythagorean theorem, c^2 = {a}^2 + {b}^2 = {c*c}, so c = {c}.",
            )
        )

    for i, (radius, pi_mult) in enumerate([(3, 9), (4, 16), (5, 25), (6, 36)], 1):
        ch, ans = choices(f"{pi_mult}π", [f"{2 * radius}π", f"{radius}π", f"{pi_mult + radius}π"])
        items.append(
            item(
                f"foundation-math-circles-{i:03}",
                "Math",
                "Geometry and Trigonometry",
                "Circles",
                "Medium",
                f"A circle has radius {radius}. What is its area?",
                ch,
                ans,
                f"The area of a circle is πr^2. With r = {radius}, the area is {pi_mult}π.",
            )
        )


def add_rw(items):
    rw = [
        (
            "foundation-rw-transitions-001",
            "Expression of Ideas",
            "Transitions",
            "Medium",
            "The team expected the new battery coating to improve performance. ______ early tests showed that the coating made the battery lose charge more quickly.",
            {"A": "However,", "B": "Therefore,", "C": "For example,", "D": "Similarly,"},
            "A",
            "The second sentence contrasts with the expectation in the first, so However is the logical transition.",
        ),
        (
            "foundation-rw-transitions-002",
            "Expression of Ideas",
            "Transitions",
            "Easy",
            "The museum first displayed the artist's sketches. ______ it opened a gallery of the completed paintings.",
            {"A": "Nevertheless,", "B": "Later,", "C": "Instead,", "D": "For this reason,"},
            "B",
            "Later shows that the gallery opened after the sketches were displayed.",
        ),
        (
            "foundation-rw-boundaries-001",
            "Standard English Conventions",
            "Boundaries",
            "Medium",
            "The telescope collected data throughout the night ______ the researchers analyzed the results the next morning.",
            {"A": "night, and", "B": "night and", "C": "night, and,", "D": "night; and"},
            "A",
            "Two independent clauses joined by and need a comma before the conjunction.",
        ),
        (
            "foundation-rw-boundaries-002",
            "Standard English Conventions",
            "Boundaries",
            "Medium",
            "The library extended its evening hours ______ students had more time to study after school.",
            {"A": "hours, students", "B": "hours students", "C": "hours; students", "D": "hours, and, students"},
            "C",
            "A semicolon can correctly join two closely related independent clauses.",
        ),
        (
            "foundation-rw-form-structure-001",
            "Standard English Conventions",
            "Form, structure, and sense",
            "Easy",
            "Each of the dancers ______ a different role in the final scene.",
            {"A": "has", "B": "have", "C": "were having", "D": "are having"},
            "A",
            "Each is singular, so the singular verb has is needed.",
        ),
        (
            "foundation-rw-form-structure-002",
            "Standard English Conventions",
            "Form, structure, and sense",
            "Medium",
            "The results of the survey ______ that most visitors preferred the new entrance.",
            {"A": "suggest", "B": "suggests", "C": "was suggesting", "D": "has suggested"},
            "A",
            "The subject results is plural, so the plural verb suggest is correct.",
        ),
        (
            "foundation-rw-words-context-001",
            "Craft and Structure",
            "Words in Context",
            "Medium",
            "The scientist's explanation was ______: even readers without technical training could understand the main idea.",
            {"A": "lucid", "B": "scarce", "C": "hostile", "D": "ornate"},
            "A",
            "Lucid means clear and easy to understand, which fits the context.",
        ),
        (
            "foundation-rw-words-context-002",
            "Craft and Structure",
            "Words in Context",
            "Medium",
            "The committee did not reject the proposal permanently; it made a ______ decision that could be revised after more data were collected.",
            {"A": "tentative", "B": "lavish", "C": "durable", "D": "reckless"},
            "A",
            "Tentative means not final or subject to change, matching the idea that the decision could be revised.",
        ),
        (
            "foundation-rw-main-idea-001",
            "Information and Ideas",
            "Central Ideas and Details",
            "Medium",
            "Urban trees can lower nearby air temperatures by creating shade and releasing water vapor. Researchers have found that neighborhoods with dense tree cover often use less energy for cooling in summer.\n\nWhich choice best states the main idea of the text?",
            {
                "A": "Urban trees can reduce heat and energy use in neighborhoods.",
                "B": "Most cities plant too many trees in shaded neighborhoods.",
                "C": "Researchers disagree about how trees release water vapor.",
                "D": "Summer temperatures are impossible to predict in cities.",
            },
            "A",
            "The text explains two related benefits of urban trees: cooling the air and reducing energy use.",
        ),
        (
            "foundation-rw-inference-001",
            "Information and Ideas",
            "Inferences",
            "Medium",
            "A new bus route reduced the average commute time between two neighborhoods from 42 minutes to 28 minutes. During the first month, ridership on nearby routes declined slightly.\n\nWhich inference is best supported by the text?",
            {
                "A": "Some riders likely switched from nearby routes to the new faster route.",
                "B": "The new route made all bus trips in the city faster.",
                "C": "Most commuters stopped using public transportation.",
                "D": "The city removed every older bus route.",
            },
            "A",
            "The new route was faster and nearby routes lost some riders, supporting the inference that some riders switched routes.",
        ),
        (
            "foundation-rw-rhetorical-synthesis-001",
            "Expression of Ideas",
            "Rhetorical Synthesis",
            "Medium",
            "A student wants to emphasize that architect Maya Lin's Vietnam Veterans Memorial uses a simple design to create emotional impact. Which choice best accomplishes this goal?",
            {
                "A": "Maya Lin was an undergraduate student when she designed the memorial.",
                "B": "The memorial's polished black granite wall lists names in a restrained form that invites quiet reflection.",
                "C": "The memorial is located near several other monuments in Washington, DC.",
                "D": "Many visitors take photographs when they visit the memorial.",
            },
            "B",
            "Choice B connects the simple design with its emotional effect, which matches the student's goal.",
        ),
        (
            "foundation-rw-cross-text-001",
            "Craft and Structure",
            "Cross-Text Connections",
            "Hard",
            "Text 1: Some historians argue that city parks were designed mainly to improve public health.\nText 2: Other historians emphasize that parks also reflected ideas about beauty, leisure, and civic identity.\n\nBased on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?",
            {
                "A": "By agreeing completely that health was the only reason parks were built",
                "B": "By arguing that public health was irrelevant to park design",
                "C": "By adding that park design also served cultural and civic purposes",
                "D": "By denying that parks affected city residents",
            },
            "C",
            "Text 2 does not reject health as a factor; it broadens the explanation to include cultural and civic purposes.",
        ),
    ]

    for record in rw:
        qid, domain, skill, difficulty, prompt, ch, correct, explanation = record
        items.append(
            item(qid, "Reading and Writing", domain, skill, difficulty, prompt, ch, correct, explanation)
        )


def main():
    items = []
    add_math(items)
    add_rw(items)
    OUT.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(OUT), "count": len(items)}, indent=2))


if __name__ == "__main__":
    main()
