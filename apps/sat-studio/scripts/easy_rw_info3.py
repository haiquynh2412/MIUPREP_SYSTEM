import json
import uuid
import random
import os

def generate_easy_rw_info3():
    bank = []
    
    textual_subjects = ["Biologist", "Historian", "Archaeologist", "Linguist", "Sociologist", "Astronomer", "Geologist", "Botanist", "Economist", "Physicist"]
    topics = [
        ("the local bird population", "increases when more trees are planted", "Bird numbers doubled after the city planted 500 trees.", "Bird numbers declined after new trees were planted.", "The birds have bright blue feathers.", "Many cities have large bird populations."),
        ("the ancient empire", "relied primarily on agricultural trade", "Historical records show that 85 percent of the empire's wealth came from selling crops.", "Historical records show the empire banned all agricultural exports.", "The empire is known for its intricate pottery.", "Other empires also traded goods."),
        ("the newly discovered planet", "has a surface covered mostly in ice", "Telescope data confirms that 90 percent of the planet's surface is frozen water.", "Telescope data indicates the planet's surface is entirely molten rock.", "The planet orbits a star similar to our Sun.", "Ice is common in many parts of the solar system."),
        ("the author's writing style", "became much simpler in her later years", "Her final three novels use shorter sentences and simpler vocabulary than her early work.", "Her final three novels are known for their highly complex, lengthy sentences.", "She wrote her first novel in 1920.", "Many authors change their style over time."),
        ("the new battery technology", "lasts longer than standard batteries", "Tests prove the new battery powers a device for 40 hours, compared to 20 hours for standard ones.", "Tests show the new battery dies twice as fast as the standard models.", "The new battery is painted silver and black.", "Standard batteries are sold in most stores."),
        ("the community garden", "improved neighborhood satisfaction", "Surveys show 95 percent of residents felt happier after the garden was built.", "Surveys show residents were highly dissatisfied with the new garden.", "The garden contains tomatoes and carrots.", "Community gardens require regular watering."),
        ("the ancient language", "borrowed heavily from neighboring cultures", "Linguists found that half of the language's vocabulary matches words from nearby regions.", "Linguists found the language has no vocabulary in common with its neighbors.", "The language was written on clay tablets.", "Neighboring cultures often trade with each other."),
        ("the local economy", "grew rapidly after the factory opened", "City data reveals a 30 percent increase in local jobs immediately following the factory's opening.", "City data reveals a massive loss of jobs after the factory opened.", "The factory produces automotive parts.", "The local economy is studied by many experts."),
        ("the ocean temperature", "rises significantly during the summer months", "Thermometer readings show a 10-degree increase in water temperature from June to August.", "Thermometer readings show the water is coldest during August.", "The ocean is home to many species of fish.", "Tourists flock to the beach in the summer."),
        ("the new fertilizer", "dramatically increases crop yields", "Farms using the fertilizer produced twice as much corn as farms that did not.", "Farms using the fertilizer produced half as much corn as those that did not.", "The fertilizer is sold in 50-pound bags.", "Corn is a major crop in the region.")
    ]
    
    for i in range(25):
        subj = textual_subjects[i % len(textual_subjects)]
        topic, claim, correct, opposite, irrelevant, wrong = topics[i % len(topics)]
        
        intro = f"A {subj.lower()} claims that {topic} {claim}. \n\nWhich finding, if true, would most directly support the {subj.lower()}'s claim?"
        
        question = {
            "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Information and Ideas",
            "skill": "Command of Evidence",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": intro,
            "choices": [correct, wrong, opposite, irrelevant],
            "correctAnswer": correct,
            "explanation": {
                "correct": f"This choice directly supports the claim that {topic} {claim}.",
                "distractors": {
                    wrong: "Wrong Data Point: This provides a loosely related fact but does not directly support the specific claim.",
                    opposite: "Opposite Trend: This contradicts the claim.",
                    irrelevant: "Irrelevant Detail: This provides a descriptive detail that has no bearing on the claim."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-rw-info3",
                "cognitiveMove": "Identify direct evidence",
                "trapTypes": ["Wrong Data Point", "Opposite Trend", "Irrelevant Detail"]
            }
        }
        
        c_copy = question["choices"].copy()
        random.shuffle(c_copy)
        question["choices"] = c_copy
        
        bank.append(question)
        
    entities = [
        "city park attendance", "library book checkouts", "smartphone sales", "rainfall in millimeters", 
        "student enrollment", "bakery daily profits", "train ticket sales", "museum visitors", 
        "solar energy production", "coffee shop customers", "bicycle rentals", "gym memberships",
        "movie theater ticket sales", "online course sign-ups", "highway toll collections"
    ]
    
    for i in range(25):
        entity = entities[i % len(entities)]
        y1 = 2010 + i
        y2 = y1 + 1
        y3 = y2 + 1
        v1 = 100 + i * 50
        v2 = v1 + 100
        v3 = v2 + 100
        
        prompt = f"A researcher compiled data on {entity} over three years. In {y1}, the number was {v1}. In {y2}, it rose to {v2}. In {y3}, it reached {v3}. The researcher claims that the {entity} increased steadily over this period.\n\nWhich choice most effectively uses data from the text to support this claim?"
        
        correct = f"The number grew consistently, going from {v1} in {y1} to {v3} in {y3}."
        wrong = f"The number was {v3} in {y1} and {v1} in {y3}."
        opposite = f"The number decreased steadily from {v3} down to {v1}."
        irrelevant = f"The {entity} is an important part of the local community."
        
        question = {
            "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Information and Ideas",
            "skill": "Command of Evidence",
            "difficulty": "Easy",
            "targetBand": "SAT-1200",
            "type": "MCQ",
            "prompt": prompt,
            "choices": [correct, wrong, opposite, irrelevant],
            "correctAnswer": correct,
            "explanation": {
                "correct": "This choice accurately cites the data showing a steady increase, directly supporting the claim.",
                "distractors": {
                    wrong: "Wrong Data Point: This choice misstates the data from the text.",
                    opposite: "Opposite Trend: This choice claims a decrease, contradicting the data.",
                    irrelevant: "Irrelevant Detail: This choice provides an opinion rather than data to support the claim."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-rw-info3",
                "cognitiveMove": "Interpret quantitative data",
                "trapTypes": ["Wrong Data Point", "Opposite Trend", "Irrelevant Detail"]
            }
        }
        
        c_copy = question["choices"].copy()
        random.shuffle(c_copy)
        question["choices"] = c_copy
        
        bank.append(question)
        
    return bank

if __name__ == '__main__':
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    if os.path.exists(bank_path):
        with open(bank_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except:
                data = []
    else:
        data = []
        
    new_questions = generate_easy_rw_info3()
    data.extend(new_questions)
    
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Added {len(new_questions)} Easy R&W Command of Evidence questions. Total is now {len(data)}.")
