import json
import os
import uuid
import hashlib
import random

def get_id(text):
    return "antigravity-1600-" + hashlib.md5(text.encode('utf-8')).hexdigest()[:8]

def build_question(context, q_data):
    q_text, correct, d1, d2, d3, focus, traps, subject = q_data
    full_text = context + " " + q_text
    
    choices_text = [correct, d1, d2, d3]
    random.seed(get_id(full_text))
    random.shuffle(choices_text)
    
    choices = [{"text": c} for c in choices_text]
    correct_letter = chr(65 + choices_text.index(correct))
    
    if focus == "Subject-Verb Agreement":
        exp_c = f"Structural analysis: The true subject of the sentence is '{subject}'. Intervening phrases or inverted syntax may obscure this, but removing the modifiers reveals that the verb '{correct}' is required."
        exp_d = f"The ear test often misleads readers to select '{d1}' or '{d2}' because of nearby nouns that have a different number. Relying on proximity agreement is a classic trap here."
    elif focus == "Pronoun-Antecedent":
        exp_c = f"Structural analysis: The pronoun must correctly match its antecedent '{subject}' in number and person. Thus, the possessive '{correct}' is the only grammatically valid choice."
        exp_d = f"The ear test might make '{d1}' sound acceptable due to plural distractors in the modifying phrase or colloquial usage. However, formal grammar requires strict number agreement. '{d2}' often introduces a contraction or case error."
    elif focus == "Modifier Placement":
        exp_c = f"Structural analysis: An introductory participial or modifying phrase must be immediately followed by the noun it logically modifies. Only the choice starting with '{correct}' places the logical subject ('{subject}') right after the comma."
        exp_d = f"The ear test is dangerous here because passive constructions like '{d1}' can sound conversational and flow well. However, they create dangling modifiers where the wrong entity is grammatically performing the action."
    else: # Verb Tense
        exp_c = f"Structural analysis: The temporal markers in the sentence ('{subject}') dictate a specific sequence of events. The correct verb '{correct}' maintains logical temporal consistency."
        exp_d = f"The ear test fails because distractors like '{d1}' or '{d2}' might sound grammatically fine in isolation, but they violate the chronological constraint established by the surrounding context."
        
    return {
        "id": get_id(full_text),
        "section": "Reading and Writing",
        "domain": "Standard English Conventions",
        "skill": "Form, Structure, and Sense",
        "difficulty": "Hard",
        "targetBand": "SAT-1600",
        "prompt": full_text,
        "type": "MCQ",
        "choices": choices,
        "correctAnswer": correct_letter,
        "explanation": {
            "correct": exp_c,
            "distractors": exp_d
        },
        "metadata": {
            "focus": focus,
            "trapTypes": traps,
            "cognitiveMove": "Structural syntax parsing over auditory intuition",
            "sourceSignalId": "antigravity-1600-rw-conventions2",
            "generationEngine": "antigravity-master-prompt-1600"
        }
    }

PASSAGES = [
    {
        "context": "In the study of cellular biology, researchers often face immense difficulties when attempting to track the rapid life cycles of specific microscopic organelles.",
        "q1": ("The synthesis of novel proteins within the endoplasmic reticulum, along with the subsequent complex modifications in the Golgi apparatus, ____ a precise biological sequence that is easily disrupted.", "requires", "require", "requiring", "have required", "Subject-Verb Agreement", ["Plural intervening phrase", "Proximity agreement"], "synthesis"),
        "q2": ("The Golgi apparatus, widely known for its elaborate membranous folding mechanisms, must constantly adjust ____ internal pH to facilitate the delicate process of protein maturation.", "its", "their", "it's", "one's", "Pronoun-Antecedent", ["Plural distractor", "Possessive confusion"], "Golgi apparatus")
    },
    {
        "context": "Modern archaeological techniques have vastly improved our understanding of early urban centers in the fertile crescent, revealing complex administrative systems.",
        "q1": ("Among the excavated ruins of the ancient Mesopotamian city ____ a series of clay tablets detailing early astronomical observations and grain distributions.", "lies", "lie", "laying", "are lying", "Subject-Verb Agreement", ["Inverted syntax", "Plural proximity"], "series"),
        "q2": ("Discovered entirely by accident during a routine survey of the southern sector, ____.", "the clay tablet revolutionized our understanding of early trade.", "scholars realized the clay tablet revolutionized trade.", "our understanding of early trade was revolutionized by the tablet.", "the realization of the tablet's importance shocked scholars.", "Modifier Placement", ["Dangling modifier", "Passive voice trap"], "the clay tablet")
    },
    {
        "context": "The evolution of nineteenth-century orchestral music was heavily shaped by the integration of regional cultural elements into classical forms.",
        "q1": ("The pervasive influence of traditional folk melodies on the composer's later symphonies ____ clearly evident in the unconventional rhythm of the second movement.", "is", "are", "being", "have been", "Subject-Verb Agreement", ["Plural intervening phrase"], "influence"),
        "q2": ("Although the composer currently enjoys immense popularity, he ____ in relative obscurity for the first two decades of his career.", "toiled", "has toiled", "toils", "had toiled", "Verb Tense", ["Inconsistent tense", "Present perfect trap"], "first two decades (simple past)")
    },
    {
        "context": "Analysts constantly monitor local voting behaviors to predict broader national trends and shifts in ideological allegiances.",
        "q1": ("A comprehensive analysis of the voting patterns from the last three municipal elections ____ that significant demographic shifts are occurring in suburban districts.", "reveals", "reveal", "revealing", "have revealed", "Subject-Verb Agreement", ["Plural intervening phrase"], "analysis"),
        "q2": ("The coalition of disparate advocacy groups, despite facing numerous internal disagreements, published ____ highly anticipated manifesto ahead of the upcoming legislative session.", "its", "their", "it's", "there", "Pronoun-Antecedent", ["Collective noun", "Plural distractor"], "coalition")
    },
    {
        "context": "Maintaining strict controls during experimental procedures is essential for ensuring that the resulting data can be reliably interpreted by peers.",
        "q1": ("Neither the graduate students nor the principal investigator ____ anticipated the anomalous results observed in the control group during the final testing phase.", "has", "have", "having", "were", "Subject-Verb Agreement", ["Correlative conjunctions", "Plural proximity"], "investigator"),
        "q2": ("By the time the peer review committee published the critique, the research team ____ the flawed methodology in a subsequent paper.", "had corrected", "corrected", "has corrected", "corrects", "Verb Tense", ["Chronological sequence", "Past perfect required"], "By the time")
    },
    {
        "context": "The geopolitical landscape of the Mediterranean during the classical era was characterized by shifting loyalties and sudden betrayals.",
        "q1": ("The intricate web of political alliances that united the disparate city-states of the peninsula ____ ultimately responsible for the unusually long period of peace.", "was", "were", "being", "have been", "Subject-Verb Agreement", ["Complex subject", "Plural proximity"], "web"),
        "q2": ("The powerful maritime republic, fearing an impending invasion from the north, rapidly expanded ____ naval fleet to secure the lucrative trade routes.", "its", "their", "they're", "it's", "Pronoun-Antecedent", ["Singular collective entity"], "republic")
    },
    {
        "context": "Avian researchers utilize high-speed cameras and computational models to understand the synchronized behaviors of massive bird flocks.",
        "q1": ("Behind the seemingly chaotic movements of the massive flock of starlings ____ a complex set of aerodynamic principles that prevents mid-air collisions.", "operates", "operate", "operating", "are operating", "Subject-Verb Agreement", ["Inverted syntax", "Plural proximity"], "set"),
        "q2": ("Soaring majestically above the vast thermal currents of the canyon, ____.", "the eagle presented a magnificent sight for the observers.", "the observers marveled at the magnificent eagle.", "a magnificent sight was presented by the eagle.", "the eagle's majesty stunned the observers.", "Modifier Placement", ["Dangling modifier"], "the eagle")
    },
    {
        "context": "Island ecosystems are particularly vulnerable to sudden environmental changes due to their evolutionary isolation and limited biodiversity.",
        "q1": ("The introduction of aggressive invasive species into the ecosystem, combined with the devastating effects of sudden climate anomalies, ____ native flora.", "threatens", "threaten", "threatening", "have threatened", "Subject-Verb Agreement", ["Additive phrase trap", "Plural proximity"], "introduction"),
        "q2": ("The unique species of ground-nesting bird, which ____ in the dense coastal underbrush for millennia, is now facing unprecedented threats from imported predators.", "has thrived", "thrived", "had thrived", "thrives", "Verb Tense", ["Present perfect for ongoing state"], "for millennia ... is now")
    },
    {
        "context": "Longitudinal studies tracking brain health over several decades offer unparalleled insights into the gradual progression of neurodegenerative diseases.",
        "q1": ("Each of the elderly participants in the ambitious study on cognitive decline ____ required to complete a comprehensive battery of memory tests annually.", "is", "are", "be", "were", "Subject-Verb Agreement", ["Indefinite pronoun", "Plural intervening phrase"], "Each"),
        "q2": ("The human brain, demonstrating remarkable plasticity, dynamically alters ____ neural pathways to compensate for localized tissue damage.", "its", "their", "it's", "they're", "Pronoun-Antecedent", ["Singular antecedent"], "brain")
    },
    {
        "context": "Deep-sea exploration relies heavily on robotic technology to gather data in environments where extreme pressure makes human presence impossible.",
        "q1": ("The array of sophisticated sensors mounted on the autonomous underwater vehicle ____ continuous monitoring of deep-sea salinity and temperature gradients.", "allows", "allow", "allowing", "have allowed", "Subject-Verb Agreement", ["Collective noun", "Plural proximity"], "array"),
        "q2": ("Equipped with the latest infrared imaging and sonar technology, ____.", "the submersible rapidly detected a previously unknown trench.", "a previously unknown trench was detected by the submersible.", "the detection of a new trench occurred rapidly.", "the researchers used the submersible to detect a trench.", "Modifier Placement", ["Passive voice trap", "Dangling modifier"], "the submersible")
    },
    {
        "context": "Modern theoretical physics constantly grapples with phenomena that defy the intuitive rules governing macroscopic objects.",
        "q1": ("Just beyond the established parameters of the standard model ____ a theoretical anomaly that challenges our fundamental understanding of classical mechanics.", "lies", "lie", "laying", "are lying", "Subject-Verb Agreement", ["Inverted syntax", "Plural proximity"], "anomaly"),
        "q2": ("A phenomenon as complex as quantum entanglement requires a mathematical framework that can seamlessly accommodate ____ inherent logical paradoxes.", "its", "their", "it's", "they're", "Pronoun-Antecedent", ["Singular antecedent", "Plural distractor"], "phenomenon")
    },
    {
        "context": "Urban communities often band together to advocate for infrastructural improvements, bridging cultural divides in the process.",
        "q1": ("The coalition of local business owners, despite their differing ultimate objectives, ____ agreed on a unified strategy to combat the proposed zoning laws.", "has", "have", "having", "are", "Subject-Verb Agreement", ["Collective noun", "Plural proximity"], "coalition"),
        "q2": ("Ever since the implementation of the new community outreach policies in 1998, the neighborhood's crime rate ____ remarkably stable.", "has remained", "remained", "had remained", "remains", "Verb Tense", ["Present perfect with 'Ever since'"], "Ever since ... in 1998")
    },
    {
        "context": "Fossilized remains offer a mere glimpse into the past, requiring extensive anatomical knowledge to interpret correctly.",
        "q1": ("A meticulous reconstruction of the dinosaur's skeletal structure, including the extremely fragile cranial bones, ____ new insights into its specialized diet.", "provides", "provide", "providing", "have provided", "Subject-Verb Agreement", ["Singular subject", "Plural additive phrase"], "reconstruction"),
        "q2": ("Discovered perfectly preserved in a layer of ancient amber, ____.", "the prehistoric insect offered scientists a rare glimpse into the past.", "scientists were offered a rare glimpse by the prehistoric insect.", "a rare glimpse into the past was offered by the insect.", "the amber offered scientists a rare glimpse of the insect.", "Modifier Placement", ["Dangling modifier"], "the prehistoric insect")
    },
    {
        "context": "Logistical delays during wartime can have catastrophic consequences, shifting the balance of power before orders can be executed.",
        "q1": ("By the time the diplomatic envoy finally reached the besieged capital, the rebel factions ____ the crucial strategic outposts along the river.", "had seized", "seized", "have seized", "seize", "Verb Tense", ["Past perfect relative timeline"], "By the time"),
        "q2": ("The advancing army was forced to temporarily halt ____ march due to the unusually harsh winter conditions.", "its", "their", "it's", "there", "Pronoun-Antecedent", ["Collective noun singular"], "army")
    },
    {
        "context": "Interpreting translated texts requires an appreciation not only of the original language but also of the cultural nuances of the era.",
        "q1": ("The scholar's early essays demonstrate that she ____ the foundational tenets of the literary movement long before her peers.", "had formulated", "formulated", "formulates", "has formulated", "Verb Tense", ["Past perfect for earlier past action"], "long before"),
        "q2": ("Written in an entirely cryptic and forgotten medieval dialect, ____.", "the poem proved exceptionally difficult for scholars to translate.", "scholars found the poem exceptionally difficult to translate.", "the translation of the poem proved difficult.", "difficulty arose for scholars translating the poem.", "Modifier Placement", ["Dangling modifier"], "the poem")
    },
    {
        "context": "Central banks must carefully calibrate interest rates to stimulate growth without triggering runaway inflation.",
        "q1": ("The demographic and economic data strongly indicates that the urban housing market ____ steadily over the next two decades.", "will grow", "grows", "has grown", "grew", "Verb Tense", ["Future action"], "over the next two decades"),
        "q2": ("The international monetary fund announced that ____ would be entirely restructuring the debt relief program to assist developing nations.", "it", "they", "its", "one", "Pronoun-Antecedent", ["Singular institutional entity"], "fund")
    },
    {
        "context": "Interstellar probes represent the pinnacle of engineering, designed to operate autonomously for decades in the harsh vacuum of space.",
        "q1": ("Next year, when the space probe finally reaches the outer edges of the solar system, it ____ vital telemetry data for over a quarter of a century.", "will have been transmitting", "will transmit", "has transmitted", "transmitted", "Verb Tense", ["Future perfect continuous"], "Next year ... for over a quarter of a century"),
        "q2": ("Propelled by an advanced ion thruster system, ____.", "the spacecraft achieved unprecedented velocities.", "unprecedented velocities were achieved by the spacecraft.", "the engineers achieved unprecedented velocities with the spacecraft.", "the achievement of unprecedented velocities occurred.", "Modifier Placement", ["Dangling modifier"], "the spacecraft")
    },
    {
        "context": "Mesoamerican ruins scattered across the dense jungle continue to yield artifacts that challenge previous historical timelines.",
        "q1": ("The archeologists theorize that the massive ceremonial complex ____ long before the arrival of the conquering empire from the north.", "had been abandoned", "was abandoned", "has been abandoned", "is abandoned", "Verb Tense", ["Past perfect required"], "long before the arrival"),
        "q2": ("Every single one of the fragile obsidian artifacts must have ____ chemical composition meticulously documented before being archived.", "its", "their", "they're", "it's", "Pronoun-Antecedent", ["Indefinite singular pronoun"], "Every single one")
    },
    {
        "context": "Infrastructure projects in earthquake-prone regions demand rigorous stress testing and innovative architectural designs.",
        "q1": ("If the review board had recognized the structural flaws in the bridge's design earlier, they ____ the catastrophic collapse that occurred last week.", "could have prevented", "could prevent", "prevented", "can prevent", "Verb Tense", ["Third conditional"], "If ... had recognized"),
        "q2": ("To ensure the absolute safety of the newly constructed suspension bridge, ____.", "engineers must inspect the load-bearing cables monthly.", "the load-bearing cables must be inspected monthly.", "a monthly inspection of the cables is required.", "inspecting the cables monthly is mandatory.", "Modifier Placement", ["Infinitive phrase modifier"], "engineers")
    },
    {
        "context": "Coral reefs support a staggering array of biodiversity, but they are highly sensitive to even minor fluctuations in water temperature.",
        "q1": ("Before the widespread implementation of conservation protocols in the 1990s, destructive fishing practices routinely ____ fatal to the delicate reef ecosystems.", "proved", "had proved", "have proved", "prove", "Verb Tense", ["Simple past habitual"], "routinely ... in the 1990s"),
        "q2": ("The massive school of migratory fish alters ____ swimming patterns dynamically to confuse pursuing aquatic predators.", "its", "their", "it's", "they're", "Pronoun-Antecedent", ["Singular collective noun"], "school")
    },
    {
        "context": "Reproducibility is the cornerstone of the scientific method, ensuring that isolated discoveries can be universally validated.",
        "q1": ("While the lead scientist was presenting her groundbreaking findings at the conference, her colleagues in the laboratory ____ to independently replicate the experiment.", "were attempting", "have attempted", "attempt", "had attempted", "Verb Tense", ["Past continuous parallel"], "While ... was presenting"),
        "q2": ("Exhausted from the relentless, month-long marathon of data collection, ____.", "the research assistant finally submitted the finalized report.", "the finalized report was eventually submitted by the research assistant.", "the submission of the report was completed by the assistant.", "the report's submission finally occurred.", "Modifier Placement", ["Participial phrase modifier"], "the research assistant")
    },
    {
        "context": "The transition from agrarian societies to mechanized urban centers profoundly altered the daily rhythms of human existence.",
        "q1": ("By 1850, the rapid proliferation of steam-powered machinery ____ the social fabric of the nation entirely, centralizing labor in massive factories.", "had transformed", "transformed", "has transformed", "transforms", "Verb Tense", ["Past perfect temporal marker"], "By 1850"),
        "q2": ("The burgeoning textile industry relied heavily on the continuous importation of raw cotton to sustain ____ exponential economic growth.", "its", "their", "it's", "there", "Pronoun-Antecedent", ["Singular entity"], "industry")
    },
    {
        "context": "The development of vaccines eradicated several endemic diseases that had plagued humanity for centuries.",
        "q1": ("The physician's radical sanitation theories, which ____ fiercely debated for years, eventually became standard practice across all surgical wards.", "had been", "were", "have been", "are", "Verb Tense", ["Past perfect passive"], "eventually became"),
        "q2": ("Recognized as a leading authority on infectious diseases, ____.", "Dr. Vance published a highly anticipated epidemiological study.", "Dr. Vance's highly anticipated study was published.", "the highly anticipated study by Dr. Vance was published.", "it was Dr. Vance whose study was published.", "Modifier Placement", ["Dangling modifier"], "Dr. Vance")
    },
    {
        "context": "Shifting birth rates and increased life expectancies are forcing policymakers to rethink traditional social safety nets.",
        "q1": ("The newly compiled census data reveals that the national birth rate ____ sharply since the beginning of the economic recession.", "has declined", "declined", "had declined", "declines", "Verb Tense", ["Present perfect ongoing"], "since the beginning"),
        "q2": ("The government agency was forced to comprehensively revise ____ restrictive immigration policies due to severe national labor shortages.", "its", "their", "it's", "they're", "Pronoun-Antecedent", ["Singular agency"], "agency")
    },
    {
        "context": "Enlightenment thinkers challenged the divine right of kings, proposing that political authority stems from the consent of the governed.",
        "q1": ("The revolutionary philosopher argued that society ____ into a state of tyranny if individual liberties were not constitutionally protected.", "would devolve", "will devolve", "devolves", "has devolved", "Verb Tense", ["Conditional past"], "argued ... if ... were not"),
        "q2": ("Burdened by heavy taxation and years of political marginalization, ____.", "the peasant class staged a widespread, violent revolt.", "a widespread, violent revolt was staged by the peasant class.", "the staging of a widespread revolt occurred.", "revolt became an absolute necessity for the peasants.", "Modifier Placement", ["Dangling modifier passive trap"], "the peasant class")
    }
]

def main():
    questions = []
    for p in PASSAGES:
        questions.append(build_question(p["context"], p["q1"]))
        questions.append(build_question(p["context"], p["q2"]))
        
    bank_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'antigravity-bank.json')
    os.makedirs(os.path.dirname(bank_path), exist_ok=True)
    
    bank_data = []
    if os.path.exists(bank_path):
        with open(bank_path, 'r', encoding='utf-8') as f:
            try:
                bank_data = json.load(f)
            except json.JSONDecodeError:
                bank_data = []
                
    bank_data.extend(questions)
    
    with open(bank_path, 'w', encoding='utf-8') as f:
        json.dump(bank_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated 50 Hard R&W Conventions questions.")
    print(f"Injected into {bank_path}. Total questions in bank: {len(bank_data)}")

if __name__ == '__main__':
    main()
