import os
import json
import uuid
import random
import re

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

base_templates = [
    {
        "text_template": "For many years, scientists believed that {phenomenon} was caused primarily by {old_cause}. However, recent studies using {new_tool} have revealed a different reality. Researchers now know that {new_cause} is the main driving force behind this phenomenon.",
        "phenomenons": ["the migration of Monarch butterflies", "the formation of deep ocean currents", "the coloration of certain frogs", "the rapid growth of bamboo", "the decay of ancient ruins"],
        "old_causes": ["temperature changes", "wind patterns", "dietary habits", "soil composition", "solar radiation"],
        "new_tools": ["advanced satellite imaging", "genetic sequencing", "high-speed cameras", "microscopic sensors", "chemical analysis"],
        "new_causes": ["magnetic fields", "subterranean geothermal activity", "specific genetic mutations", "fungal networks", "microbial activity"],
        
        "purpose_correct": "To explain how a new scientific understanding replaced an older theory.",
        "purpose_d1": "To argue that {old_cause} is completely unrelated to {phenomenon}.",
        "purpose_d2": "To promote the use of {new_tool} in modern scientific research.",
        "purpose_d3": "To describe the complete historical timeline of studying {phenomenon}.",
        
        "structure_correct": "It introduces a previously held belief, then describes how new evidence overturned it.",
        "structure_d1": "It outlines a scientific problem, then suggests several potential but unproven solutions.",
        "structure_d2": "It presents a widespread phenomenon, then lists the negative impacts it has on the environment.",
        "structure_d3": "It describes the invention of a new tool, then explains how that tool is manufactured."
    },
    {
        "text_template": "The artist {artist} is most famous for her large-scale murals in major cities. Yet, early in her career, she focused almost entirely on {early_work}. It was only after a trip to {location} that she began painting the massive, vibrant public works she is known for today.",
        "artists": ["Elena Rossi", "Maria Santos", "Sarah Jenkins", "Lin Chen", "Anita Desai"],
        "early_works": ["small charcoal sketches", "miniature watercolor portraits", "delicate pottery", "black-and-white photography", "woodblock prints"],
        "locations": ["Mexico City", "Paris", "Kyoto", "Rome", "Buenos Aires"],
        
        "purpose_correct": "To trace the evolution of an artist's signature style.",
        "purpose_d1": "To explain the cultural and historical significance of murals in major cities.",
        "purpose_d2": "To argue that {early_work} requires more artistic skill than painting murals.",
        "purpose_d3": "To detail the geography and artistic history of {location}.",
        
        "structure_correct": "It highlights an artist's well-known work, contrasts it with her early focus, and explains what caused the shift.",
        "structure_d1": "It compares two different artistic mediums, then argues why one is superior to the other.",
        "structure_d2": "It describes an artist's early life, details her formal education, and lists her major awards.",
        "structure_d3": "It introduces a famous location, then explains how various artists have depicted it over time."
    },
    {
        "text_template": "When {inventor} first designed the {invention}, the goal was simply to help {group} complete tasks faster. The device was bulky and expensive. Over time, however, the design was refined and manufactured cheaply, allowing the general public to use it for everyday convenience.",
        "inventors": ["Thomas Croft", "Lydia Vance", "Arthur Pendelton", "Samuel Reed", "Clara Hughes"],
        "inventions": ["mechanical loom", "portable typewriter", "hand-cranked generator", "pneumatic pump", "calculating engine"],
        "groups": ["factory workers", "accountants", "sailors", "miners", "farmers"],
        
        "purpose_correct": "To describe how an invention transformed from a specialized tool into a common household item.",
        "purpose_d1": "To criticize the initial design of the {invention} for being too bulky and difficult to use.",
        "purpose_d2": "To explain the precise technical specifications of how the {invention} works.",
        "purpose_d3": "To highlight the massive financial success of {inventor}'s original manufacturing company.",
        
        "structure_correct": "It explains the original purpose of a device, then describes how its use expanded and became widespread over time.",
        "structure_d1": "It introduces an inventor, outlines their childhood struggles, and praises their eventual success.",
        "structure_d2": "It details the mechanical flaws of an early invention, then explains how a competing inventor fixed them.",
        "structure_d3": "It defines a specific group of workers, then lists the various tools they used throughout history."
    },
    {
        "text_template": "The {building} was originally constructed in {year} as a {original_use}. For decades, it stood abandoned as the city around it modernized. Recently, a local community group raised funds to renovate the structure, transforming it into a {new_use} that now serves the neighborhood.",
        "buildings": ["Grand Station", "River Mill", "Ironworks Building", "Central Armory", "Harbor Warehouse"],
        "years": ["1890", "1912", "1875", "1920", "1888"],
        "original_uses": ["train depot", "textile factory", "military barracks", "shipping center", "coal storage facility"],
        "new_uses": ["vibrant community center", "public library", "modern art museum", "botanical greenhouse", "performing arts theater"],
        
        "purpose_correct": "To detail the history and recent revitalization of a specific historic building.",
        "purpose_d1": "To argue that the city needs to allocate more government funding for historical preservation.",
        "purpose_d2": "To compare the classical architectural style of the {building} with modern structures.",
        "purpose_d3": "To thoroughly explain the economic reasons why the {building} was abandoned in the first place.",
        
        "structure_correct": "It states a building's original function, notes a period of disuse, and concludes with its modern restoration.",
        "structure_d1": "It outlines a city's zoning laws, then uses a specific building to show how those laws are enforced.",
        "structure_d2": "It describes the architectural features of a building in detail, then explains how they were constructed.",
        "structure_d3": "It lists the various businesses that once occupied a building, then explains why they all failed."
    },
    {
        "text_template": "The {animal} is uniquely adapted to its harsh desert environment. First, its {trait_1} allows it to survive extreme daytime heat. Furthermore, its {trait_2} enables it to extract moisture from dry vegetation, minimizing its need for fresh water.",
        "animals": ["sand cat", "thorny devil", "fennec fox", "camel spider", "spadefoot toad"],
        "trait_1s": ["pale coloration", "thick burrowing claws", "specialized cooling ears", "reflective scales", "nocturnal resting habit"],
        "trait_2s": ["highly efficient digestive system", "specialized mouthparts", "unique kidney function", "water-storing tissue", "slow metabolism"],
        
        "purpose_correct": "To describe specific physical adaptations that help an animal survive in the desert.",
        "purpose_d1": "To explain the geological processes that formed the harsh desert environment.",
        "purpose_d2": "To argue that the {animal} is the absolute most resilient creature in the entire desert ecosystem.",
        "purpose_d3": "To compare the daily diet of the {animal} with that of other desert predators.",
        
        "structure_correct": "It introduces an animal's habitat, then provides two distinct examples of how the animal thrives there.",
        "structure_d1": "It presents a scientific debate about an animal's origins, then sides with one particular theory.",
        "structure_d2": "It describes an animal's physical appearance, then tells a story about its typical hunting behavior.",
        "structure_d3": "It states a common misconception about a desert animal, then provides evidence to correct it."
    },
    {
        "text_template": "In the early 20th century, the city of {city} suffered from severe traffic congestion due to its narrow, winding streets. To solve this problem, city planners implemented a radical redesign. They widened main avenues, installed a grid system, and created large public parks to improve traffic flow and livability.",
        "citys": ["Oakhaven", "Maplewood", "Stonebridge", "Pinecrest", "Elmridge"],
        
        "purpose_correct": "To explain a historical problem faced by a city and the measures taken to resolve it.",
        "purpose_d1": "To sharply criticize the original founders of {city} for their incredibly poor urban planning.",
        "purpose_d2": "To promote the creation of public parks as the absolute best modern solution to urban pollution.",
        "purpose_d3": "To describe the exact physical dimensions and materials of the widened main avenues in {city}.",
        
        "structure_correct": "It identifies an urban issue from the past, then outlines the specific solutions city planners implemented.",
        "structure_d1": "It outlines the history of a city's founding, then describes the various industries that grew there.",
        "structure_d2": "It presents a proposal for a new transportation system, then lists the financial costs associated with it.",
        "structure_d3": "It describes a common urban design flaw, then explains why it is impossible to ever fully fix."
    },
    {
        "text_template": "In her novel '{novel}', author {author} uses the setting of a dark, isolated mansion to mirror the protagonist's emotional state. As the character becomes more anxious, the descriptions of the house become more claustrophobic and decaying, reinforcing the psychological tension of the story.",
        "novels": ["The Shadowed Hall", "Whispers in the Dark", "The Silent Estate", "Echoes of the Past", "The Forgotten Room"],
        "authors": ["Miriam Vance", "Julian Thorne", "Eleanor Vance", "Samuel Black", "Clara Reed"],
        
        "purpose_correct": "To analyze how a specific literary element reflects a character's internal experience.",
        "purpose_d1": "To summarize the complete overarching plot of the novel '{novel}'.",
        "purpose_d2": "To argue that dark mansions are the absolute best setting for any psychological thriller.",
        "purpose_d3": "To explore the real-world historical architecture of the mansion described in the novel.",
        
        "structure_correct": "It states an author's narrative technique, then provides an example of how this technique functions within the story.",
        "structure_d1": "It introduces a famous author, lists their most popular books, and explains their typical writing schedule.",
        "structure_d2": "It provides a positive review of a novel, then compares it favorably to a film adaptation.",
        "structure_d3": "It describes a character's background, then explains how their past directly caused their current anxiety."
    },
    {
        "text_template": "The space probe {probe} was initially launched to capture close-up images of {target}. However, as it traveled through the solar system, scientists realized it could also be used to gather data on {bonus_target}. Consequently, the mission was extended to include this secondary objective.",
        "probes": ["Voyager 3", "Helios-X", "Astra-9", "Stardust-II", "Pioneer-Alpha"],
        "targets": ["Mars's moons", "Jupiter's rings", "Saturn's atmosphere", "Venus's surface", "the asteroid belt"],
        "bonus_targets": ["cosmic radiation levels", "solar winds", "distant comets", "interstellar dust", "magnetic fluctuations"],
        
        "purpose_correct": "To explain how a space mission's goals evolved while it was in progress.",
        "purpose_d1": "To argue that {target} is a significantly less important subject to study than {bonus_target}.",
        "purpose_d2": "To describe the highly complex mechanical components and launch process of the {probe}.",
        "purpose_d3": "To thoroughly explain the specific scientific data that was gathered exclusively from {target}.",
        
        "structure_correct": "It outlines the initial goal of a mission, then describes how and why an additional goal was added.",
        "structure_d1": "It introduces a piece of technology, explains how it was built, and lists the scientists who created it.",
        "structure_d2": "It details a failed scientific experiment, then explains what researchers learned from their mistakes.",
        "structure_d3": "It compares two different space probes, arguing why one is vastly superior to the other."
    },
    {
        "text_template": "For centuries, farmers in the region grew only {crop}, relying entirely on its steady yield. However, a devastating blight in the 1800s wiped out most of the harvest. In response, farmers diversified their fields, planting {new_crop} and {new_crop2} to ensure they would never be vulnerable to a single crop failure again.",
        "crops": ["wheat", "corn", "barley", "rye", "oats"],
        "new_crops": ["potatoes", "soybeans", "carrots", "turnips", "beans"],
        "new_crop2s": ["cabbage", "peas", "onions", "squash", "lentils"],
        
        "purpose_correct": "To explain the historical cause of an agricultural shift toward crop diversity.",
        "purpose_d1": "To argue that {crop} is highly susceptible to devastating diseases in modern farming.",
        "purpose_d2": "To detail the specific, microscopic biological mechanisms of the blight in the 1800s.",
        "purpose_d3": "To heavily compare the exact nutritional value of {new_crop} versus {new_crop2}.",
        
        "structure_correct": "It establishes a traditional farming practice, describes a crisis that disrupted it, and outlines the resulting change.",
        "structure_d1": "It introduces a popular crop, explains the best climate for growing it, and lists common recipes using it.",
        "structure_d2": "It describes a historical event, then provides multiple contradictory accounts of how it actually happened.",
        "structure_d3": "It outlines the economic benefits of farming, then argues that more people should become farmers."
    },
    {
        "text_template": "Jazz musician {musician} is celebrated for his complex, high-energy solos. But listeners who only focus on his solos miss the foundation of his work. His true genius lies in his ability to collaborate seamlessly with his rhythm section, ensuring the entire band sounds unified before he ever takes the spotlight.",
        "musicians": ["Marcus Hayes", "Leo Vance", "Julian Porter", "Silas Cole", "Nathaniel Reed"],
        
        "purpose_correct": "To highlight a frequently overlooked collaborative aspect of a musician's talent.",
        "purpose_d1": "To argue that {musician}'s solos are actually very simple and entirely unoriginal.",
        "purpose_d2": "To provide a comprehensive biographical overview of {musician}'s early life and musical training.",
        "purpose_d3": "To explain the highly specific technical differences between jazz solos and rhythm sections.",
        
        "structure_correct": "It mentions a common perception of an artist, then shifts to emphasize a deeper, more collaborative skill.",
        "structure_d1": "It describes a musical genre, lists its most famous performers, and explains how it originated.",
        "structure_d2": "It details a musician's creative process, then analyzes the lyrics of their most popular song.",
        "structure_d3": "It compares the differing styles of two musicians, ultimately declaring one to be the more talented artist."
    }
]

def extract_keys(template_str):
    return list(set(re.findall(r'\{([a-z_0-9]+)\}', template_str)))

questions = []
used_texts = set()

for i in range(50):
    template = base_templates[i % 10]
    
    # Extract keys from all strings that might be formatted
    combined_strings = template["text_template"] + " " + template.get("purpose_d1", "") + " " + template.get("structure_d1", "") + " " + template.get("purpose_d3", "")
    keys = extract_keys(combined_strings)
    
    q_type = "purpose" if i % 2 == 0 else "structure"

    # Ensure uniqueness across generations
    while True:
        replacements = {}
        for k in keys:
            list_key = k + "s"
            if list_key in template:
                replacements[k] = random.choice(template[list_key])

        text = template["text_template"].format(**replacements)
        if text not in used_texts:
            used_texts.add(text)
            break
            
    if q_type == "purpose":
        prompt = "Which choice best states the main purpose of the text?"
        correct_answer = template["purpose_correct"].format(**replacements)
        d1 = template["purpose_d1"].format(**replacements)
        d2 = template["purpose_d2"].format(**replacements)
        d3 = template["purpose_d3"].format(**replacements)
    else:
        prompt = "Which choice best describes the overall structure of the text?"
        correct_answer = template["structure_correct"].format(**replacements)
        d1 = template["structure_d1"].format(**replacements)
        d2 = template["structure_d2"].format(**replacements)
        d3 = template["structure_d3"].format(**replacements)
        
    choices = [correct_answer, d1, d2, d3]
    random.shuffle(choices)
    
    question = {
        "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
        "section": "Reading and Writing",
        "domain": "Craft and Structure",
        "skill": "Text Structure and Purpose",
        "difficulty": "Easy",
        "targetBand": "SAT-1200",
        "prompt": text + "\n\n" + prompt,
        "type": "MCQ",
        "choices": choices,
        "correctAnswer": correct_answer,
        "explanation": {
            "correct": "The text clearly exhibits this structure/purpose. It explicitly uses transitions to guide the reader towards the main point, which perfectly aligns with the selected choice.",
            "distractors": {
                "Wrong focus": "This choice focuses on a detail or an argument not present in the text.",
                "Too specific": "This choice exaggerates a minor detail into the main purpose/structure.",
                "Inaccurate": "This choice describes an action or argument that does not occur in the text."
            }
        },
        "metadata": {
            "sourceSignalId": "antigravity-easy-rw-craft2",
            "cognitiveMove": "Identify the primary function or structural shift in a straightforward text.",
            "trapTypes": ["Wrong focus", "Too specific", "Inaccurate"]
        }
    }
    questions.append(question)

# Ensure directory exists
os.makedirs(os.path.dirname(bank_path), exist_ok=True)

if os.path.exists(bank_path):
    with open(bank_path, "r", encoding="utf-8") as f:
        try:
            bank = json.load(f)
        except json.JSONDecodeError:
            bank = []
else:
    bank = []

bank.extend(questions)

with open(bank_path, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Added {len(questions)} Easy R&W Craft & Structure questions.")
print(f"Total questions in bank: {len(bank)}")
