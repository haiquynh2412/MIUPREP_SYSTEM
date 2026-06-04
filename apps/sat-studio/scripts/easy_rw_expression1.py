import json
import uuid
import os
import random

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

templates = [
    # Template 1: Scientist
    {
        "entities": [
            ("Dr. Elena Rostova", "marine biologist", "studying deep-sea vents"),
            ("Dr. Samuel Kim", "astrophysicist", "discovering exoplanets"),
            ("Marie Curie", "physicist", "researching radioactivity"),
            ("Dr. Akira Sato", "botanist", "classifying rare orchids"),
            ("Dr. Linnea Holst", "paleontologist", "finding dinosaur fossils"),
            ("Dr. Omar Tariq", "climatologist", "modeling weather patterns"),
            ("Dr. Sarah Jenkins", "geneticist", "sequencing the human genome"),
            ("Dr. David Chen", "neuroscientist", "mapping brain functions"),
            ("Dr. Maria Garcia", "chemist", "developing new polymers"),
            ("Dr. James Wilson", "geologist", "studying tectonic plates"),
        ],
        "notes_template": [
            "• {name} is a {profession}.",
            "• {name} is famous for {work}."
        ],
        "goal": "introduce the scientist and their profession.",
        "correct": "{name} is a renowned {profession}.",
        "d1": "{name} is famous for {work}.",
        "d2": "The {profession} profession is very interesting.",
        "d3": "Many people are famous for {work}.",
    },
    # Template 2: Animal
    {
        "entities": [
            ("Fennec fox", "Sahara Desert", "large ears"),
            ("Emperor penguin", "Antarctica", "ability to swim fast"),
            ("Koala", "eucalyptus forests", "diet of leaves"),
            ("Snow leopard", "Himalayan mountains", "thick fur"),
            ("Red-eyed tree frog", "rainforest canopies", "bright colors"),
            ("Giant panda", "bamboo forests", "black and white coat"),
            ("Kangaroo", "Australian outback", "powerful hind legs"),
            ("Polar bear", "Arctic tundra", "white fur"),
            ("Sloth", "tropical rainforests", "slow movement"),
            ("Meerkat", "Kalahari Desert", "upright posture"),
        ],
        "notes_template": [
            "• The {name} lives in the {habitat}.",
            "• It is known for its {trait}."
        ],
        "goal": "state where the animal lives.",
        "correct": "The {name} can be found living in the {habitat}.",
        "d1": "The {name} is well known for its {trait}.",
        "d2": "The {habitat} is a vast and beautiful environment.",
        "d3": "Many animals share the trait of having {trait}.",
    },
    # Template 3: Book
    {
        "entities": [
            ("The Great Gatsby", "F. Scott Fitzgerald", "1925"),
            ("To Kill a Mockingbird", "Harper Lee", "1960"),
            ("1984", "George Orwell", "1949"),
            ("Pride and Prejudice", "Jane Austen", "1813"),
            ("The Catcher in the Rye", "J.D. Salinger", "1951"),
            ("Moby-Dick", "Herman Melville", "1851"),
            ("Jane Eyre", "Charlotte Brontë", "1847"),
            ("The Hobbit", "J.R.R. Tolkien", "1937"),
            ("Fahrenheit 451", "Ray Bradbury", "1953"),
            ("Little Women", "Louisa May Alcott", "1868"),
        ],
        "notes_template": [
            "• {author} wrote the book {name}.",
            "• The book was published in {year}."
        ],
        "goal": "state who wrote the book.",
        "correct": "The book {name} was written by {author}.",
        "d1": "The book {name} was originally published in {year}.",
        "d2": "The year {year} was a significant time for literature.",
        "d3": "Many great books were published during {year}.",
    },
    # Template 4: Historical event
    {
        "entities": [
            ("Battle of Waterloo", "Belgium", "1815"),
            ("Signing of the Declaration of Independence", "Philadelphia", "1776"),
            ("Fall of the Berlin Wall", "Germany", "1989"),
            ("Moon Landing", "the Moon", "1969"),
            ("French Revolution", "France", "1789"),
            ("Discovery of America", "the Americas", "1492"),
            ("Sinking of the Titanic", "the North Atlantic", "1912"),
            ("Magna Carta signing", "England", "1215"),
            ("First successful airplane flight", "Kitty Hawk", "1903"),
            ("Completion of the Transcontinental Railroad", "Promontory Summit", "1869"),
        ],
        "notes_template": [
            "• The {name} took place in {location}.",
            "• This event happened in {date}."
        ],
        "goal": "state where the event occurred.",
        "correct": "The {name} took place in {location}.",
        "d1": "The {name} is a historical event from {date}.",
        "d2": "{location} is a place with a rich history.",
        "d3": "The year {date} is an important time in history.",
    },
    # Template 5: Musician
    {
        "entities": [
            ("Miles Davis", "trumpet", "jazz"),
            ("Yo-Yo Ma", "cello", "classical"),
            ("Jimi Hendrix", "guitar", "rock"),
            ("Louis Armstrong", "trumpet", "jazz"),
            ("Beethoven", "piano", "classical"),
            ("Charlie Parker", "saxophone", "jazz"),
            ("Carlos Santana", "guitar", "rock"),
            ("Paganini", "violin", "classical"),
            ("B.B. King", "guitar", "blues"),
            ("John Coltrane", "saxophone", "jazz"),
        ],
        "notes_template": [
            "• {name} is a famous musician.",
            "• {name} plays the {instrument}.",
            "• {name} is known for {genre} music."
        ],
        "goal": "state the instrument the musician plays.",
        "correct": "{name} is famous for playing the {instrument}.",
        "d1": "{name} is well known for their contributions to {genre} music.",
        "d2": "The {instrument} is a popular instrument in {genre} music.",
        "d3": "{genre} music is enjoyed by many people around the world.",
    }
]

questions = []
for template in templates:
    for entity in template["entities"]:
        name, prop1, prop2 = entity
        notes = []
        for n in template["notes_template"]:
            if "{author}" in n:
                notes.append(n.format(name=name, author=prop1, year=prop2))
            elif "{work}" in n:
                notes.append(n.format(name=name, profession=prop1, work=prop2))
            elif "{habitat}" in n:
                notes.append(n.format(name=name, habitat=prop1, trait=prop2))
            elif "{location}" in n:
                notes.append(n.format(name=name, location=prop1, date=prop2))
            elif "{instrument}" in n:
                notes.append(n.format(name=name, instrument=prop1, genre=prop2))
        
        kwargs = {"name": name}
        n_combined = " ".join(template["notes_template"])
        if "{author}" in n_combined:
            kwargs.update({"author": prop1, "year": prop2})
        elif "{work}" in n_combined:
            kwargs.update({"profession": prop1, "work": prop2})
        elif "{habitat}" in n_combined:
            kwargs.update({"habitat": prop1, "trait": prop2})
        elif "{location}" in n_combined:
            kwargs.update({"location": prop1, "date": prop2})
        elif "{instrument}" in n_combined:
            kwargs.update({"instrument": prop1, "genre": prop2})

        correct = template["correct"].format(**kwargs)
        d1 = template["d1"].format(**kwargs)
        d2 = template["d2"].format(**kwargs)
        d3 = template["d3"].format(**kwargs)
        prompt = "While researching a topic, a student has taken the following notes:\n" + "\n".join(notes) + "\n\nThe student wants to " + template["goal"] + " Which choice most effectively uses relevant information from the notes to accomplish this goal?"
        
        choices = [correct, d1, d2, d3]
        random.shuffle(choices)
        correct_letter = chr(65 + choices.index(correct))
        
        q = {
            "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Expression of Ideas",
            "skill": "Rhetorical Synthesis",
            "difficulty": "Easy",
            "type": "MCQ",
            "targetBand": "SAT-1200",
            "prompt": prompt,
            "choices": [
                {"letter": "A", "text": choices[0]},
                {"letter": "B", "text": choices[1]},
                {"letter": "C", "text": choices[2]},
                {"letter": "D", "text": choices[3]}
            ],
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": "This choice effectively accomplishes the goal.",
                "distractors": {
                    chr(65 + choices.index(d1)): "This choice focuses on a different aspect from the notes, failing to address the specific goal.",
                    chr(65 + choices.index(d2)): "This choice provides off-topic information rather than achieving the stated goal.",
                    chr(65 + choices.index(d3)): "This choice makes a broad statement rather than using the notes to accomplish the goal."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-rw-expression1",
                "cognitiveMove": "Synthesize information from notes to achieve a specific rhetorical goal.",
                "trapTypes": ["Answers a Different Goal", "Off-topic Information", "Broad Statement"]
            }
        }
        questions.append(q)

print(f"Generated {len(questions)} questions.")

with open(bank_path, "r", encoding="utf-8") as f:
    bank = json.load(f)

bank.extend(questions)

with open(bank_path, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Total questions in bank: {len(bank)}")
