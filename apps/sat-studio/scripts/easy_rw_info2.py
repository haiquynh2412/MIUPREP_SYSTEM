import json
import uuid
import random
import os

def generate_easy_inferences(num=50):
    questions = []
    
    # Template 1: Animal adaptations
    animals = ["desert foxes", "Arctic hares", "mountain goats", "river otters", "forest owls", "ocean dolphins", "prairie dogs", "swamp frogs", "jungle monkeys", "cave bats"]
    traits = ["larger ears", "thicker fur", "sturdier hooves", "sleeker bodies", "wider wings", "stronger flippers", "sharper claws", "stickier toes", "longer tails", "better echolocation"]
    advantages = ["dissipate heat more effectively", "retain body heat better", "climb steep cliffs easily", "swim against strong currents", "fly silently", "navigate deep waters", "dig deeper burrows", "grip wet surfaces", "balance on thin branches", "find insects in total darkness"]
    environments = ["hot deserts", "freezing tundras", "rocky peaks", "fast rivers", "dense forests", "deep oceans", "dry plains", "humid swamps", "rainforest canopies", "pitch-black caves"]
    
    # Template 2: Plant growth
    plants = ["Sunflowers", "Orchids", "Ferns", "Cacti", "Mosses", "Shrubs", "Vines", "Grasses", "Trees", "Bushes"]
    factors = [
        ("received extra direct sunlight", "receiving extra direct sunlight"),
        ("were given nitrogen-rich fertilizer", "being given nitrogen-rich fertilizer"),
        ("were watered twice daily", "being watered twice daily"),
        ("were planted in acidic soil", "being planted in acidic soil"),
        ("were exposed to cooler night temperatures", "being exposed to cooler night temperatures")
    ]
    outcomes = ["grew 20% taller", "produced more flowers", "developed darker green leaves", "survived the dry season longer", "yielded more seeds"]
    
    # Template 3: Ancient Trade
    cities = ["Alexandria", "Babylon", "Carthage", "Ephesus", "Memphis", "Nineveh", "Persepolis", "Thebes", "Tyre", "Uruk"]
    goods = ["purple dye", "silk cloth", "obsidian tools", "bronze weapons", "gold jewelry", "cedar timber", "olive oil", "spice blends", "clay tablets", "glass beads"]
    sources = ["the mountainous northern region", "the eastern coastal empire", "the southern desert nomadic tribes", "the western island confederacy"]
    
    # Template 4: Science/Physics
    materials = ["Copper", "Iron", "Aluminum", "Silver", "Gold", "Lead", "Zinc", "Nickel", "Tin", "Bronze"]
    properties = ["conducts heat faster", "is more malleable", "has a higher melting point", "resists corrosion better", "is denser"]
    applications = ["exposed to rapid heating", "shaped into intricate designs", "placed in extreme heat", "exposed to corrosive seawater", "used to add heavy weight"]
    
    # Template 5: Store Sales
    businesses = ["The local bakery", "A hardware store", "The corner cafe", "A boutique bookstore", "The neighborhood florist", "A toy shop", "The electronics store", "A pet supply shop", "The music store", "A shoe store"]
    interventions = [
        ("played slow-tempo background music", "play slow-tempo background music"), 
        ("offered free samples at the door", "offer free samples at the door"), 
        ("extended their opening hours until 9 PM", "extend opening hours until 9 PM"), 
        ("rearranged the display windows", "rearrange the display windows"), 
        ("lowered prices on older inventory", "lower prices on older inventory")
    ]
    results = [
        "shoppers spent an average of 15 extra minutes browsing", 
        "foot traffic doubled in the afternoon", 
        "evening sales accounted for 30% of daily revenue", 
        "passersby were more likely to enter the store", 
        "inventory turnover increased by 40%"
    ]

    for i in range(num):
        template_choice = i % 5
        
        q_id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
        
        if template_choice == 0:
            animal = animals[i % len(animals)]
            trait = traits[i % len(traits)]
            advantage = advantages[i % len(advantages)]
            env = environments[i % len(environments)]
            
            text = f"Biologists studying {animal} have observed that individuals living in {env} tend to have {trait}. Experimental models show that having {trait} allows the animals to {advantage}. Conversely, individuals of the same species living in milder conditions lack this exaggerated physical feature, which suggests that ______"
            correct = f"they do not face the same environmental pressures to {advantage}."
            d1 = f"they will eventually develop {trait} regardless of their environment."
            d2 = f"they are generally less healthy than those living in {env}."
            d3 = f"having {trait} actually prevents the animals from surviving in {env}."
            
        elif template_choice == 1:
            plant = plants[i % len(plants)]
            factor_text, factor_noun = factors[i % len(factors)]
            outcome = outcomes[i % len(outcomes)]
            
            text = f"In a recent botanical experiment, a group of {plant} that {factor_text} consistently {outcome} compared to the control group. The control group, which was kept under standard greenhouse conditions without any special treatments, showed only average growth metrics. This indicates that ______"
            correct = f"the special treatment of {factor_noun} contributed to the {plant} achieving better growth outcomes."
            d1 = f"plants that are not given this exact treatment will never grow or survive."
            d2 = f"the control group {outcome} just as much as the experimental group."
            d3 = f"other unrelated species in the greenhouse also experienced similar growth spurts."
            
        elif template_choice == 2:
            city = cities[i % len(cities)]
            good = goods[i % len(goods)]
            source = sources[i % len(sources)]
            
            text = f"Archaeologists excavating the ancient city of {city} found large caches of {good}. Historical records indicate that {good} was exclusively produced by artisans from {source} and was highly valued for its rarity. These findings strongly imply that ______"
            correct = f"the inhabitants of {city} established trade connections with the artisans from {source}."
            d1 = f"the artisans of {source} refused to trade with any city other than {city}."
            d2 = f"the inhabitants of {city} manufactured the {good} entirely on their own."
            d3 = f"the {good} was the only valuable item ever traded by the people of {city}."
            
        elif template_choice == 3:
            mat = materials[i % len(materials)]
            prop = properties[i % len(properties)]
            app = applications[i % len(applications)]
            
            text = f"In material science, it is well known that {mat} {prop} compared to most other common metals. For this reason, engineers often prefer it when designing components that will be {app}, leading to the conclusion that ______"
            correct = f"when a component is {app}, it benefits from a material that {prop}."
            d1 = f"{mat} is the only metal in the world that {prop}."
            d2 = f"metals with this property are generally avoided when components are {app}."
            d3 = f"{mat} is the most expensive metal for manufacturing."
            
        else:
            biz = businesses[i % len(businesses)]
            intervention_text, intervention_action = interventions[i % len(interventions)]
            result = results[i % len(results)]
            
            text = f"{biz} recently implemented a new strategy where they {intervention_text}. Following this change, the management noticed a significant shift: {result}, a trend which had not occurred in previous months. It is reasonable to conclude that ______"
            correct = f"the decision to {intervention_action} helped bring about the shift where {result}."
            d1 = f"this change guarantees that the business will never lose money again."
            d2 = f"the trend where {result} was caused by the strategies used in previous months."
            d3 = f"every business in the neighborhood experienced the exact same shift."
            
        choices = [correct, d1, d2, d3]
        random.shuffle(choices)
        correct_idx = choices.index(correct)
        correct_letter = chr(65 + correct_idx)
        
        q_dict = {
            "id": q_id,
            "section": "Reading and Writing",
            "domain": "Information and Ideas",
            "skill": "Inferences",
            "difficulty": "Easy",
            "prompt": f"{text}\n\nWhich choice most logically completes the text?",
            "type": "MCQ",
            "choices": choices,
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": "This choice logically follows from the text. The text outlines a direct cause-and-effect relationship or factual observation, and this choice represents a reasonable, direct conclusion without assuming extra information.",
                "distractors": {
                    chr(65 + choices.index(d1)): "This choice uses extreme language ('never', 'all', 'only', 'guarantees') that is not supported by the brief text.",
                    chr(65 + choices.index(d2)): "This choice directly contradicts the information provided in the text.",
                    chr(65 + choices.index(d3)): "This choice brings in outside knowledge or makes a broad claim not supported by the specific text."
                }
            },
            "metadata": {
                "sourceSignalId": "antigravity-easy-rw-info2",
                "cognitiveMove": "Draw a direct, simple conclusion from stated facts without assuming too much.",
                "trapTypes": ["Extreme Language", "Contradicts the text", "Outside Knowledge"],
                "targetBand": "SAT-1200"
            }
        }
        
        questions.append(q_dict)
        
    return questions

def main():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    if os.path.exists(bank_path):
        with open(bank_path, 'r', encoding='utf-8') as f:
            try:
                bank = json.load(f)
            except json.JSONDecodeError:
                bank = []
    else:
        bank = []
        
    new_questions = generate_easy_inferences(50)
    bank.extend(new_questions)
    
    os.makedirs(os.path.dirname(bank_path), exist_ok=True)
    with open(bank_path, 'w', encoding='utf-8') as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Added {len(new_questions)} new questions. Total bank size: {len(bank)}")

if __name__ == "__main__":
    main()
