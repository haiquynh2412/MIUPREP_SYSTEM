import json
import uuid
import random
import os

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

scenarios = [
    # Contrast
    ("The team practiced every day for a month.", "they lost the final game.", "contrast"),
    ("Apples are usually harvested in the fall.", "this new variety can be picked in mid-summer.", "contrast"),
    ("The restaurant is famous for its spicy dishes.", "the desserts are completely mild and sweet.", "contrast"),
    ("Many birds migrate south for the winter.", "the snowy owl often stays in the cold northern regions.", "contrast"),
    ("The instructions said the furniture would be easy to assemble.", "it took us five hours and three different tools.", "contrast"),
    ("Most cats dislike water.", "the Turkish Van breed enjoys swimming.", "contrast"),
    ("The scientist expected the chemical reaction to happen quickly.", "it took several days to complete.", "contrast"),
    ("Early computers were the size of entire rooms.", "modern smartphones fit easily in a pocket.", "contrast"),
    ("The novel received terrible reviews from critics.", "it became a massive bestseller among readers.", "contrast"),
    ("He set his alarm for 6:00 AM to go jogging.", "he stayed in bed until 8:00 AM.", "contrast"),
    ("The desert is extremely hot during the day.", "temperatures can drop below freezing at night.", "contrast"),
    ("She planned to study engineering in college.", "she ended up majoring in art history.", "contrast"),
    ("The museum usually charges a high admission fee.", "on Tuesdays, entry is completely free.", "contrast"),

    # Cause and Effect
    ("Heavy snow covered the roads overnight.", "all local schools were closed the next morning.", "cause"),
    ("The company introduced a highly popular new product.", "their profits doubled in the second quarter.", "cause"),
    ("The baker accidentally used salt instead of sugar.", "the cake tasted awful.", "cause"),
    ("The city built a new subway line.", "traffic congestion on the main highway decreased significantly.", "cause"),
    ("He forgot to water his indoor plants for a month.", "all of the leaves turned brown and fell off.", "cause"),
    ("The factory upgraded its old machinery.", "production speed increased by fifty percent.", "cause"),
    ("A massive storm damaged the power lines.", "thousands of homes were left without electricity.", "cause"),
    ("The author won a prestigious literary award.", "book sales skyrocketed overnight.", "cause"),
    ("She studied diligently for the final exam.", "she received the highest grade in the class.", "cause"),
    ("The concert tickets were priced too high.", "the venue was mostly empty on the night of the show.", "cause"),
    ("The bridge was closed for emergency repairs.", "drivers had to take a long detour.", "cause"),
    ("The soil in the garden was lacking essential nutrients.", "the vegetables failed to grow properly.", "cause"),
    ("They missed their connecting flight.", "they had to spend the night at the airport.", "cause"),

    # Addition
    ("The new smartphone features an improved camera.", "it has a much longer battery life.", "addition"),
    ("Reading every day expands your vocabulary.", "it helps reduce stress levels.", "addition"),
    ("The candidate has a degree in business management.", "she has five years of experience in the industry.", "addition"),
    ("This jacket is completely waterproof.", "it is lined with warm fleece for cold weather.", "addition"),
    ("The park offers beautiful hiking trails.", "there are several picnic areas near the lake.", "addition"),
    ("Learning a second language improves cognitive skills.", "it can open up new career opportunities.", "addition"),
    ("The hotel provides a complimentary breakfast buffet.", "guests have free access to the indoor pool.", "addition"),
    ("Regular exercise strengthens the heart muscle.", "it improves overall lung capacity.", "addition"),
    ("The festival will feature live music performances.", "there will be dozens of food trucks.", "addition"),
    ("The updated software fixes several major bugs.", "it introduces a sleek new user interface.", "addition"),
    ("Volunteering helps the local community.", "it gives participants a sense of personal fulfillment.", "addition"),
    ("The new car model is highly fuel-efficient.", "it comes with advanced safety features.", "addition"),

    # Illustration
    ("Many fruits are rich in vitamin C.", "oranges and strawberries contain high amounts of this nutrient.", "illustration"),
    ("The region is home to various predatory birds.", "eagles and hawks can often be seen hunting here.", "illustration"),
    ("Some mammals are capable of true flight.", "bats use their webbed wings to fly through the air.", "illustration"),
    ("The chef loves using fresh herbs in his cooking.", "he frequently adds basil and cilantro to his signature dishes.", "illustration"),
    ("Several planets in our solar system have rings.", "Saturn is famous for its large and visible ring system.", "illustration"),
    ("Extreme weather events can cause significant damage.", "hurricanes can destroy coastal homes and flood entire cities.", "illustration"),
    ("Exercise can take many different forms.", "yoga and swimming are both excellent ways to stay fit.", "illustration"),
    ("Many everyday devices rely on batteries.", "TV remotes and cell phones require portable power sources.", "illustration"),
    ("There are several ways to conserve water at home.", "taking shorter showers can save gallons of water each day.", "illustration"),
    ("Certain animals have adapted to survive in extreme cold.", "polar bears have a thick layer of blubber to stay warm.", "illustration"),
    ("The artist used unconventional materials in her sculptures.", "she built a life-sized horse entirely out of recycled wire.", "illustration"),
    ("Some insects play a crucial role in pollination.", "bees transfer pollen from one flower to another.", "illustration")
]

transitions = {
    "contrast": [
        ("However,", "Therefore,", "In addition,", "For example,"),
        ("By contrast,", "Consequently,", "Furthermore,", "Specifically,")
    ],
    "cause": [
        ("Therefore,", "However,", "In addition,", "For instance,"),
        ("Consequently,", "On the other hand,", "Moreover,", "For example,"),
        ("As a result,", "Nevertheless,", "Similarly,", "For instance,")
    ],
    "addition": [
        ("In addition,", "However,", "Therefore,", "For example,"),
        ("Furthermore,", "Consequently,", "By contrast,", "Specifically,"),
        ("Moreover,", "On the other hand,", "As a result,", "For instance,")
    ],
    "illustration": [
        ("For example,", "However,", "Therefore,", "In addition,"),
        ("For instance,", "Consequently,", "Furthermore,", "By contrast,"),
        ("Specifically,", "As a result,", "Moreover,", "Nevertheless,")
    ]
}

def generate_id():
    return f"antigravity-easy-{uuid.uuid4().hex[:8]}"

questions = []

for s1, s2, rel in scenarios:
    q_id = generate_id()
    trans_set = random.choice(transitions[rel])
    correct = trans_set[0]
    distractor1 = trans_set[1]
    distractor2 = trans_set[2]
    distractor3 = trans_set[3]

    choices = [correct, distractor1, distractor2, distractor3]
    random.shuffle(choices)
    correct_idx = choices.index(correct)
    correct_letter = chr(65 + correct_idx)

    # Explanation text
    if rel == "contrast":
        rel_desc = "indicates a contrast between"
        d1_desc = "illogically suggests a cause-and-effect relationship"
        d2_desc = "illogically suggests addition"
        d3_desc = "illogically provides an example"
    elif rel == "cause":
        rel_desc = "indicates a cause-and-effect relationship between"
        d1_desc = "illogically introduces a contrast"
        d2_desc = "illogically introduces an additional point without showing the result"
        d3_desc = "illogically suggests an example"
    elif rel == "addition":
        rel_desc = "indicates the addition of a related point to"
        d1_desc = "illogically introduces a contrast"
        d2_desc = "illogically suggests a cause-and-effect relationship"
        d3_desc = "illogically suggests an example"
    elif rel == "illustration":
        rel_desc = "introduces a specific example of"
        d1_desc = "illogically introduces a contrast"
        d2_desc = "illogically suggests a cause-and-effect relationship"
        d3_desc = "illogically suggests an addition rather than a specific instance"

    prompt = f'{s1} ______ {s2}\n\nWhich choice completes the text with the most logical transition?'

    q = {
        "id": q_id,
        "section": "Reading and Writing",
        "domain": "Expression of Ideas",
        "skill": "Transitions",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "prompt": prompt,
        "type": "MCQ",
        "choices": [
            {"letter": "A", "text": choices[0]},
            {"letter": "B", "text": choices[1]},
            {"letter": "C", "text": choices[2]},
            {"letter": "D", "text": choices[3]}
        ],
        "correctAnswer": correct_letter,
        "explanation": {
            "correct": f"The first sentence sets up a situation, and the second sentence {rel_desc} the first sentence. '{correct}' is the only transition that accurately reflects this relationship.",
            "distractors": {
                "Wrong Logic 1": f"This transition {d1_desc}.",
                "Wrong Logic 2": f"This transition {d2_desc}.",
                "Wrong Logic 3": f"This transition {d3_desc}."
            }
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-rw-expression2",
            "cognitiveMove": "Identify the logical relationship between two sentences and select the appropriate transition.",
            "trapTypes": ["Wrong logical relationship"]
        }
    }
    
    questions.append(q)

with open(bank_path, "r", encoding="utf-8") as f:
    bank = json.load(f)

bank.extend(questions)

with open(bank_path, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Successfully generated and injected {len(questions)} Easy R&W Transitions questions.")
