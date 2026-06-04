import json
import uuid
import os
import random

random.seed(42)

def get_explanations(q_type):
    if q_type == "type_A":
        return (
            "The sentence contains two independent clauses. The first clause ends at the blank, and the second clause begins immediately after. A semicolon correctly joins two independent clauses without a coordinating conjunction.",
            "Using a comma creates a comma splice. Using no punctuation creates a run-on sentence. Adding an illogical subordinating conjunction or 'and' improperly turns the second clause into a fragment or creates structural errors.",
            ["Comma Splice", "Run-On Sentence"]
        )
    elif q_type == "type_B":
        return (
            "The phrase following the blank is a summative appositive or explanatory phrase that modifies the preceding independent clause. A colon is perfectly suited to introduce such an explanation.",
            "A semicolon must separate two independent clauses, but the phrase following the blank is a dependent fragment. Providing no punctuation merges the independent clause and the appositive incorrectly, causing a run-on. Using a comma with 'being' introduces an awkward, unnecessary gerund that disrupts the concise nature of the appositive.",
            ["Semicolon Before Fragment", "Missing Punctuation", "Awkward Gerund"]
        )
    elif q_type == "type_C":
        return (
            "The text prior to the blank forms a non-essential interrupting modifier that began with a comma. A closing comma is required to separate the end of this modifier from the main verb.",
            "Omitting the comma leaves the non-essential modifier open, disrupting the boundary between the subject and the main verb. A semicolon cannot be used to separate a subject from its verb. An em dash cannot be used to close a modifier that was opened with a comma; the punctuation marks must match.",
            ["Missing Essential Comma", "Punctuation Mismatch", "Subject-Verb Separation"]
        )
    elif q_type == "type_D":
        return (
            "The sentence contains two independent clauses joined by a coordinating conjunction. A comma must be placed immediately before the coordinating conjunction.",
            "Omitting the comma before the coordinating conjunction when linking two independent clauses creates a run-on. A semicolon should not be placed before a coordinating conjunction that joins two standard independent clauses. Adding an extra comma after the conjunction unnecessarily interrupts the grammatical flow.",
            ["Missing Comma Before FANBOYS", "Semicolon Misuse", "Unnecessary Comma"]
        )
    elif q_type == "type_E":
        return (
            "The participial phrase or relative clause that begins at the blank is essential to defining the subject. Therefore, no commas should be used to separate it from the noun it modifies.",
            "Surrounding the phrase with commas incorrectly marks the essential information as non-essential. Using only an opening or closing comma erroneously separates the subject from its essential modifier and disrupts the sentence flow.",
            ["Unnecessary Comma Before Essential Modifier", "Subject-Verb Separation"]
        )

def generate():
    raw_data = [
        # 1. Gobekli Tepe
        ("Recent excavations at Gobekli Tepe have revealed dozens of monumental stone", "these massive structures fundamentally challenge the timeline of human societal evolution.", "pillars; these", "pillars, these", "pillars these", "pillars, and while these", "type_A"),
        ("The site's most prominent features are its massive T-shaped", "an architectural anomaly that predates the invention of the wheel by several millennia.", "megaliths: an", "megaliths; an", "megaliths an", "megaliths, being an", "type_B"),
        ("The site's original construction, which likely utilized hunter-gatherers rather than sedentary", "an astonishing level of socio-economic coordination to complete.", "farmers, required", "farmers required", "farmers; required", "farmers \u2014 required", "type_C"),
        ("Radiocarbon dating indicates the structures were built around 9000", "and stratigraphy suggests they were intentionally buried centuries later.", "BCE, and", "BCE and", "BCE; and", "BCE, and,", "type_D"),
        ("Scholars", "the complex iconography on the pillars suggest that the site served as a regional pilgrimage destination.", "analyzing", ", analyzing,", ", analyzing", "analyzing,", "type_E"),

        # 2. CRISPR
        ("The CRISPR-Cas9 system has democratized genetic", "laboratories worldwide can now perform complex gene edits at a fraction of the historical cost.", "engineering; laboratories", "engineering, laboratories", "engineering laboratories", "engineering: while laboratories", "type_A"),
        ("Cas9 relies on a guide RNA sequence to locate its specific genomic", "a mechanism derived from the adaptive immune systems of bacteria.", "target: a", "target; a", "target a", "target, being a", "type_B"),
        ("Jennifer Doudna and Emmanuelle Charpentier, who first elucidated the biochemical mechanics of the CRISPR", "the Nobel Prize in Chemistry in 2020.", "system, received", "system received", "system; received", "system \u2014 received", "type_C"),
        ("Off-target mutations remain a significant concern for therapeutic", "and researchers are continuously engineering high-fidelity variants of the Cas9 enzyme to mitigate this risk.", "applications, and", "applications and", "applications; and", "applications, and,", "type_D"),
        ("Bioethicists", "the implications of germline editing strongly advocate for an international moratorium on heritable genetic modifications.", "studying", ", studying,", ", studying", "studying,", "type_E"),

        # 3. Abstract Expressionism
        ("Jackson Pollock's drip paintings discarded traditional compositional focal", "the entire canvas was treated as a continuous, unified field of dynamic action.", "points; the", "points, the", "points the", "points: while the", "type_A"),
        ("Mark Rothko's multiforms feature large, hovering rectangles of luminous", "an aesthetic strategy designed to evoke profound emotional responses from viewers.", "color: an", "color; an", "color an", "color, being an", "type_B"),
        ("The New York School, which emerged in the aftermath of World War", "the center of the Western art world from Paris to the United States.", "II, shifted", "II shifted", "II; shifted", "II \u2014 shifted", "type_C"),
        ("Abstract Expressionist works often lacked recognizable subject", "and critics initially dismissed them as chaotic displays of unrestrained ego.", "matter, and", "matter and", "matter; and", "matter, and,", "type_D"),
        ("Art historians", "the movement's evolution emphasize the influence of European surrealists who fled to New York during the 1940s.", "tracing", ", tracing,", ", tracing", "tracing,", "type_E"),

        # 4. JWST
        ("The James Webb Space Telescope operates primarily in the infrared", "this allows it to peer through dense clouds of cosmic dust that obscure visible light.", "spectrum; this", "spectrum, this", "spectrum this", "spectrum, and while this", "type_A"),
        ("JWST's primary mirror consists of eighteen gold-coated beryllium", "a highly engineered configuration required to fit inside the launch vehicle's payload fairing.", "segments: a", "segments; a", "segments a", "segments, being a", "type_B"),
        ("The telescope's sunshield, which maintains the instruments at operating temperatures below 50", "of five meticulously tensioned layers of Kapton.", "Kelvin, consists", "Kelvin consists", "Kelvin; consists", "Kelvin \u2014 consists", "type_C"),
        ("Engineers designed the observatory to unfold sequentially in", "and the deployment process involved hundreds of single-point failure mechanisms.", "space, and", "space and", "space; and", "space, and,", "type_D"),
        ("Astronomers", "the telescope's first deep-field images were astounded by the sheer density of mature galaxies present in the early universe.", "analyzing", ", analyzing,", ", analyzing", "analyzing,", "type_E"),

        # 5. Keynesian
        ("John Maynard Keynes argued against the classical view that free markets naturally", "he proposed that government intervention is essential to mitigate severe economic downturns.", "self-correct; he", "self-correct, he", "self-correct he", "self-correct, because he", "type_A"),
        ("A central component of Keynesian theory is the multiplier", "the concept that an initial injection of government spending leads to a proportionally larger increase in national income.", "effect: the", "effect; the", "effect the", "effect, being the", "type_B"),
        ("Keynes's magnum opus, published during the depths of the Great", "the theoretical foundation for modern macroeconomics.", "Depression, established", "Depression established", "Depression; established", "Depression \u2014 established", "type_C"),
        ("Deficit spending can stimulate demand during a", "but excessive borrowing during periods of economic expansion may lead to uncontrollable inflation.", "recession, but", "recession but", "recession; but", "recession, but,", "type_D"),
        ("Policymakers", "strict adherence to austerity measures often overlook the long-term societal costs of high unemployment.", "advocating", ", advocating,", ", advocating", "advocating,", "type_E"),

        # 6. Voyager 1
        ("Voyager 1 officially crossed the heliopause in", "it became the first human-made object to enter interstellar space.", "2012; it", "2012, it", "2012 it", "2012, while it", "type_A"),
        ("The spacecraft carries the Golden", "a phonograph disc containing sounds and images selected to portray the diversity of life and culture on Earth.", "Record: a", "Record; a", "Record a", "Record, being a", "type_B"),
        ("The probe's radioisotope thermoelectric generators, which rely on the decay of", "enough power to keep its essential instruments operational for decades.", "plutonium-238, provided", "plutonium-238 provided", "plutonium-238; provided", "plutonium-238 \u2014 provided", "type_C"),
        ("Mission controllers periodically shut down non-essential systems to conserve the probe's diminishing", "and they anticipate it will lose all power by the mid-2030s.", "energy, and", "energy and", "energy; and", "energy, and,", "type_D"),
        ("Scientists", "the plasma density data from Voyager's sensors confirmed that the heliosphere's protective bubble had indeed been breached.", "reviewing", ", reviewing,", ", reviewing", "reviewing,", "type_E"),

        # 7. Turing
        ("A programming language is considered Turing complete if it can simulate a single-taped Turing", "essentially, this means it is capable of computing any universally computable function given enough time and memory.", "machine; essentially", "machine, essentially", "machine essentially", "machine: and essentially", "type_A"),
        ("Even highly unconventional esoteric programming languages can achieve this theoretical", "a surprising reality that demonstrates the fundamental universality of computation.", "threshold: a", "threshold; a", "threshold a", "threshold, being a", "type_B"),
        ("The concept of Turing completeness, formulated by Alan Turing in", "the foundational metric for evaluating the theoretical power of modern computing systems.", "1936, remains", "1936 remains", "1936; remains", "1936 \u2014 remains", "type_C"),
        ("HTML is inherently a markup language rather than a computational", "but combining it with CSS3 transitions allows it to approximate Turing complete behavior under specific conditions.", "one, but", "one but", "one; but", "one, but,", "type_D"),
        ("Computer scientists", "the theoretical limits of quantum algorithms must still frame their findings within the boundaries of Turing's original framework.", "exploring", ", exploring,", ", exploring", "exploring,", "type_E"),

        # 8. Deep Sea
        ("Hydrothermal vents host thriving ecosystems in the absence of", "the organisms there rely on chemosynthesis rather than photosynthesis to produce energy.", "sunlight; the", "sunlight, the", "sunlight the", "sunlight: while the", "type_A"),
        ("Giant tube worms extract hydrogen sulfide from the superheated vent", "an adaptation made possible by specialized symbiotic bacteria living within their tissues.", "fluids: an", "fluids; an", "fluids an", "fluids, being an", "type_B"),
        ("The discovery of these extremophile communities, which occurred during a 1977 submersible", "researchers to expand their definition of the habitable zones of the universe.", "expedition, forced", "expedition forced", "expedition; forced", "expedition \u2014 forced", "type_C"),
        ("Vent plumes are rich in dissolved minerals that precipitate upon contacting cold", "and these deposits slowly build massive chimney-like structures over thousands of years.", "seawater, and", "seawater and", "seawater; and", "seawater, and,", "type_D"),
        ("Marine biologists", "the genetic divergence of vent-dwelling shrimp species have found significant evolutionary isolation among geographically distinct populations.", "studying", ", studying,", ", studying", "studying,", "type_E"),

        # 9. Byzantine
        ("The Byzantine Empire survived the fall of the Western Roman Empire by nearly a", "its heavily fortified capital of Constantinople proved virtually impregnable.", "millennium; its", "millennium, its", "millennium its", "millennium: because its", "type_A"),
        ("Emperor Justinian I oversaw the compilation of the Corpus Juris", "a comprehensive legal code that forms the basis of civil law in many modern Western nations.", "Civilis: a", "Civilis; a", "Civilis a", "Civilis, being a", "type_B"),
        ("The use of Greek Fire, a highly classified incendiary weapon that continued to burn even on", "Byzantine naval forces to repel repeated Arab sieges.", "water, enabled", "water enabled", "water; enabled", "water \u2014 enabled", "type_C"),
        ("The Fourth Crusade resulted in the disastrous sack of Constantinople in", "and the fractured empire never fully regained its former economic or military supremacy.", "1204, and", "1204 and", "1204; and", "1204, and,", "type_D"),
        ("Historians", "the empire's ultimate decline emphasize the economic devastation wrought by the bubonic plague during the sixth century.", "analyzing", ", analyzing,", ", analyzing", "analyzing,", "type_E"),

        # 10. Epigenetics
        ("Epigenetic modifications can silence specific genes without altering the underlying DNA", "these chemical changes are often influenced by environmental factors such as diet and stress.", "sequence; these", "sequence, these", "sequence these", "sequence: whereas these", "type_A"),
        ("DNA methylation typically occurs at CpG", "a biochemical process that tightly regulates gene expression during embryonic development.", "dinucleotides: a", "dinucleotides; a", "dinucleotides a", "dinucleotides, being a", "type_B"),
        ("The Dutch Hunger Winter cohort, which consisted of individuals exposed to severe famine in", "heightened rates of metabolic disorders decades later due to epigenetic inheritance.", "utero, exhibited", "utero exhibited", "utero; exhibited", "utero \u2014 exhibited", "type_C"),
        ("Chromatin remodeling complexes actively reorganize the physical structure of the", "and this dynamic structural shifting is crucial for cellular differentiation.", "genome, and", "genome and", "genome; and", "genome, and,", "type_D"),
        ("Researchers", "the transgenerational transmission of trauma have identified specific microRNA profiles that persist across multiple generations in mammalian subjects.", "investigating", ", investigating,", ", investigating", "investigating,", "type_E")
    ]

    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    # Load existing data
    if os.path.exists(bank_path):
        with open(bank_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []
        os.makedirs(os.path.dirname(bank_path), exist_ok=True)
        
    generated_count = 0
    for part1, part2, correct, d1, d2, d3, q_type in raw_data:
        exp_correct, exp_distractors, traps = get_explanations(q_type)
        
        choices = [correct, d1, d2, d3]
        random.shuffle(choices)
        
        uid = str(uuid.uuid4())[:8]
        
        question = {
            "id": f"antigravity-1600-{uid}",
            "section": "Reading and Writing",
            "domain": "Standard English Conventions",
            "skill": "Boundaries",
            "difficulty": "Hard",
            "type": "MCQ",
            "targetBand": "SAT-1600",
            "prompt": f"{part1} ______ {part2}",
            "choices": choices,
            "correctAnswer": correct,
            "explanation": {
                "correct": exp_correct,
                "distractors": exp_distractors
            },
            "metadata": {
                "sourceSignalId": "antigravity-1600-rw-conventions1",
                "generationEngine": "antigravity-master-prompt-1600",
                "cognitiveMove": "Identify clause boundaries and modifier essentiality to select grammatically correct punctuation.",
                "trapTypes": traps
            }
        }
        data.append(question)
        generated_count += 1
        
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print(f"Successfully generated and injected {generated_count} Hard R&W Boundaries questions into {bank_path}")

if __name__ == "__main__":
    generate()
