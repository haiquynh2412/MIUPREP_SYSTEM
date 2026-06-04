import json
import uuid
import random
import os

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

subjects = [
    # 25 for Agreement
    ("solar energy", "reducing emissions", "wind energy", "maintenance costs"),
    ("urban parks", "improving mental health", "public transport", "ticket fees"),
    ("telecommuting", "boosting employee productivity", "office rent", "internet outages"),
    ("vertical farming", "saving water", "traditional farming", "crop flavor"),
    ("electric vehicles", "lowering air pollution", "bicycles", "battery aesthetics"),
    ("reading fiction", "building empathy", "reading non-fiction", "book prices"),
    ("learning a second language", "enhancing cognitive flexibility", "learning to code", "grammar rules"),
    ("team sports", "teaching cooperation", "solo sports", "stadium seating"),
    ("classical music", "reducing stress", "jazz music", "album covers"),
    ("space exploration", "driving technological innovation", "ocean exploration", "astronaut uniform colors"),
    ("meditation", "improving focus", "yoga", "cushion fabrics"),
    ("public libraries", "providing community resources", "online databases", "late fees"),
    ("community gardens", "fostering neighborhood bonds", "private gardens", "soil brands"),
    ("mentorship programs", "accelerating career growth", "online courses", "meeting times"),
    ("flexible work hours", "improving work-life balance", "four-day work weeks", "time tracking apps"),
    ("after-school arts programs", "boosting student creativity", "STEM clubs", "paint brands"),
    ("digital textbooks", "reducing backpack weight", "paperbacks", "screen glare"),
    ("volunteering", "increasing personal fulfillment", "donating money", "travel routes"),
    ("a plant-based diet", "reducing carbon footprints", "a Mediterranean diet", "grocery bags"),
    ("adopting rescue pets", "saving animal lives", "buying from breeders", "leash colors"),
    ("journaling", "enhancing emotional clarity", "vlogging", "pen brands"),
    ("coding bootcamps", "fast-tracking tech careers", "university degrees", "typing speed"),
    ("historical preservation", "maintaining cultural identity", "modern architecture", "tourism pamphlets"),
    ("public art installations", "beautifying urban spaces", "billboard advertising", "graffiti removal"),
    ("biking to work", "improving cardiovascular health", "carpooling", "helmet design"),
    # 25 for Disagreement
    ("school uniforms", "reducing peer pressure", "casual dress codes", "fabric textures"),
    ("financial literacy classes", "preventing future debt", "history classes", "calculator models"),
    ("community theater", "providing local entertainment", "movie theaters", "stage lighting"),
    ("rooftop gardens", "cooling urban buildings", "street trees", "elevator access"),
    ("composting", "reducing landfill waste", "recycling plastic", "bin sizes"),
    ("open-source software", "encouraging collaborative innovation", "proprietary software", "font choices"),
    ("four-day work weeks", "increasing employee retention", "unlimited vacation", "lunch menus"),
    ("indoor houseplants", "improving indoor air quality", "air purifiers", "potting soil prices"),
    ("local farmers' markets", "supporting regional agriculture", "supermarkets", "parking availability"),
    ("taking gap years", "promoting personal maturity", "going straight to college", "flight delays"),
    ("learning an instrument", "improving memory function", "listening to podcasts", "case materials"),
    ("yoga", "increasing physical flexibility", "weightlifting", "mat thickness"),
    ("walking meetings", "stimulating creative thinking", "boardroom meetings", "shoe brands"),
    ("podcasts", "making learning accessible", "audiobooks", "volume buttons"),
    ("escape rooms", "building team problem-solving skills", "bowling", "room decor"),
    ("coding for kids", "developing logical thinking", "learning chess", "screen sizes"),
    ("smart home devices", "increasing energy efficiency", "traditional appliances", "cable colors"),
    ("urban beekeeping", "supporting local pollination", "butterfly gardens", "honey labels"),
    ("minimalism", "reducing psychological clutter", "maximalism", "storage boxes"),
    ("bullet journaling", "organizing daily tasks", "digital calendars", "marker colors"),
    ("learning calligraphy", "improving hand-eye coordination", "origami", "ink types"),
    ("birdwatching", "encouraging patience", "hiking", "binocular straps"),
    ("baking bread", "providing a sense of accomplishment", "cooking pasta", "oven temperatures"),
    ("knitting", "reducing anxiety", "sewing", "needle sizes"),
    ("playing board games", "encouraging family bonding", "video games", "box dimensions")
]

questions = []
for i, (topic, benefit, wrong_topic, irrelevant) in enumerate(subjects):
    is_agreement = i < 25
    
    if is_agreement:
        text1 = f"Many experts argue that {topic} is highly beneficial. Recent studies have demonstrated that it plays a significant role in {benefit}. Because of this, more communities should actively support its widespread adoption."
        text2 = f"Advocates frequently highlight the advantages of {topic}. The evidence clearly shows its strong impact on {benefit}. Thus, promoting it on a larger scale is a deeply sensible policy."
        
        prompt = f"Based on the texts, how would the author of Text 2 most likely respond to the claim about {topic} in Text 1?"
        
        choices = [
            f"By strongly agreeing that {topic} is valuable because of its role in {benefit}.",
            f"By disagreeing and claiming that {topic} actually hinders {benefit}.",
            f"By arguing that {wrong_topic} is a much better way to achieve {benefit}.",
            f"By shifting the focus to complain about the {irrelevant} associated with {topic}."
        ]
        
        explanation_correct = f"Text 1 states {topic} is beneficial for {benefit}, and Text 2 completely agrees with this exact point."
        explanation_distractors = {
            "B": f"Opposite Stance: Text 2 agrees with Text 1; it does not claim {topic} hinders {benefit}.",
            "C": f"Wrong Topic: Text 2 focuses on {topic}, not {wrong_topic}.",
            "D": f"Out of Scope: Neither text mentions {irrelevant}."
        }
        trap_types = ["Opposite Stance", "Wrong Topic", "Out of Scope"]
        cog_move = "Identify agreement on a clear, shared topic."
    else:
        text1 = f"Proponents often claim that {topic} is highly effective. They argue that it is the best method for {benefit}. According to these supporters, implementing it widely will solve many problems."
        text2 = f"Despite the popular belief that {topic} is useful, the reality is quite different. The data shows that it completely fails at {benefit}. Continuing to promote it is a waste of time and resources."
        
        prompt = f"Based on the texts, how would the author of Text 2 most likely respond to the claim about {topic} in Text 1?"
        
        choices = [
            f"By directly rejecting the idea that {topic} is effective for {benefit}.",
            f"By enthusiastically agreeing that {topic} is the best way to achieve {benefit}.",
            f"By suggesting that {wrong_topic} also struggles with {benefit}.",
            f"By bringing up the issue of {irrelevant} instead of focusing on effectiveness."
        ]
        
        explanation_correct = f"Text 1 claims {topic} is good for {benefit}, but Text 2 clearly states it completely fails at this, indicating strong disagreement."
        explanation_distractors = {
            "B": f"Opposite Stance: Text 2 completely disagrees with Text 1; it does not agree.",
            "C": f"Wrong Topic: Text 2 criticizes {topic}, it does not discuss {wrong_topic}.",
            "D": f"Out of Scope: Neither text discusses {irrelevant}."
        }
        trap_types = ["Opposite Stance", "Wrong Topic", "Out of Scope"]
        cog_move = "Identify disagreement on a clear, shared topic."
        
    choice_letters = ["A", "B", "C", "D"]
    
    q_dict = {
        "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
        "section": "Reading and Writing",
        "domain": "Craft and Structure",
        "skill": "Cross-Text Connections",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "type": "MCQ",
        "prompt": f"Text 1\n{text1}\n\nText 2\n{text2}\n\n{prompt}",
        "choices": choices,
        "correctAnswer": "A",
        "explanation": {
            "correct": explanation_correct,
            "distractors": {
                "A": "", # Placeholder
                "B": explanation_distractors["B"],
                "C": explanation_distractors["C"],
                "D": explanation_distractors["D"]
            }
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-rw-craft3",
            "cognitiveMove": cog_move,
            "trapTypes": trap_types
        }
    }
    
    # Randomize choices
    zipped = list(zip(choices, ["A_correct", "B_opp", "C_wrong", "D_oos"]))
    random.shuffle(zipped)
    
    new_choices = [z[0] for z in zipped]
    new_correct_idx = next(i for i, z in enumerate(zipped) if z[1] == "A_correct")
    new_correct_letter = ["A", "B", "C", "D"][new_correct_idx]
    
    q_dict["choices"] = new_choices
    q_dict["correctAnswer"] = new_correct_letter
    
    dist_map = {}
    for j, z in enumerate(zipped):
        letter = ["A", "B", "C", "D"][j]
        orig_label = z[1]
        if orig_label == "B_opp":
            dist_map[letter] = explanation_distractors["B"]
        elif orig_label == "C_wrong":
            dist_map[letter] = explanation_distractors["C"]
        elif orig_label == "D_oos":
            dist_map[letter] = explanation_distractors["D"]
            
    q_dict["explanation"]["distractors"] = dist_map
    
    questions.append(q_dict)

try:
    with open(bank_path, 'r', encoding='utf-8') as f:
        bank = json.load(f)
except FileNotFoundError:
    bank = []

bank.extend(questions)

with open(bank_path, 'w', encoding='utf-8') as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Successfully generated and injected {len(questions)} Easy R&W Craft questions.")
print(f"Total Bank size is now: {len(bank)}")
