import json
import uuid
import os
import random

def generate_questions():
    questions = []
    
    # Template 1
    t1_data = [
        {"R_A": "Dr. Aris Thorne", "Y_A": "2018", "M_A": "isotopic analysis of tooth enamel", "S": "Bronze Age migration patterns", "F_A": "localized origins for the majority of the population", "R_B": "Dr. Elena Rostova", "Y_B": "2022", "M_B": "ancient DNA (aDNA) sequencing", "F_B": "widespread genetic admixture from distant regions"},
        {"R_A": "Professor Kenji Sato", "Y_A": "2015", "M_A": "computational fluid dynamics simulations", "S": "pterosaur flight mechanics", "F_A": "a reliance on passive gliding", "R_B": "Dr. Maria Velez", "Y_B": "2021", "M_B": "robotic physical modeling", "F_B": "the capacity for powered, sustained flapping"},
        {"R_A": "Dr. Julian Vance", "Y_A": "2010", "M_A": "stratigraphic correlation", "S": "the Permian-Triassic extinction boundary", "F_A": "a gradual decline in biodiversity over a million years", "R_B": "Dr. Sarah Lin", "Y_B": "2019", "M_B": "high-precision U-Pb zircon geochronology", "F_B": "an abrupt collapse occurring in less than 60,000 years"},
        {"R_A": "Sociologist Maya Trent", "Y_A": "2014", "M_A": "qualitative ethnographic interviews", "S": "urban gentrification's cultural impact", "F_A": "a total displacement of localized community traditions", "R_B": "Dr. Omar Farid", "Y_B": "2023", "M_B": "longitudinal geospatial data tracking", "F_B": "the persistence and relocation of community networks"},
        {"R_A": "Astronomer Neil Hayes", "Y_A": "2012", "M_A": "radial velocity measurements", "S": "exoplanet transit signatures in the Kepler-186 system", "F_A": "high orbital eccentricity for the outer planets", "R_B": "Dr. Chloe Zhang", "Y_B": "2020", "M_B": "transit timing variations (TTV)", "F_B": "nearly circular orbits maintained by mean-motion resonance"},
        {"R_A": "Dr. Liam O'Connor", "Y_A": "2016", "M_A": "dendrochronology", "S": "Medieval Warm Period climate anomalies", "F_A": "consistent warming across the Northern Hemisphere", "R_B": "Climatologist Ava Rossi", "Y_B": "2022", "M_B": "speleothem stable isotope analysis", "F_B": "highly variable, regionally isolated temperature spikes"},
        {"R_A": "Dr. Wei Chen", "Y_A": "2017", "M_A": "in vitro cell culture assays", "S": "the efficacy of the experimental drug HX-23", "F_A": "complete suppression of viral replication", "R_B": "Dr. Amina Diallo", "Y_B": "2023", "M_B": "in vivo mammalian models", "F_B": "significant off-target tissue toxicity rendering it ineffective"},
        {"R_A": "Linguist Samuel Reed", "Y_A": "2011", "M_A": "comparative syntax mapping", "S": "the origins of the Basque language", "F_A": "distant links to Caucasian language families", "R_B": "Dr. Clara Hess", "Y_B": "2021", "M_B": "computational phylogenetic reconstruction", "F_B": "complete linguistic isolation predating Indo-European expansion"},
        {"R_A": "Dr. Henry Gable", "Y_A": "2013", "M_A": "spectroscopic reflectance", "S": "the composition of Martian regolith", "F_A": "high concentrations of surface perchlorates", "R_B": "Dr. Fiona Alby", "Y_B": "2020", "M_B": "X-ray diffraction via rover sampling", "F_B": "abundant subsurface smectite clays indicative of past water"},
        {"R_A": "Economist David Park", "Y_A": "2014", "M_A": "macroeconomic aggregate modeling", "S": "the effects of universal basic income", "F_A": "a significant increase in baseline inflation", "R_B": "Dr. Sofia Reyes", "Y_B": "2022", "M_B": "micro-level randomized controlled trials (RCTs)", "F_B": "improved individual well-being without localized price inflation"}
    ]
    
    for d in t1_data:
        prompt_text = "While researching a topic, a student has taken the following notes:\n" \
                      f"- Study 1 by {d['R_A']} in {d['Y_A']} used {d['M_A']} to investigate {d['S']}.\n" \
                      f"- It found {d['F_A']}.\n" \
                      f"- Study 2 by {d['R_B']} in {d['Y_B']} used {d['M_B']} to investigate {d['S']}.\n" \
                      f"- It found {d['F_B']}."
        goal = "emphasize a contrast between the methodologies of the two studies while maintaining an objective tone"
        correct = f"While {d['R_A']} utilized {d['M_A']} to study {d['S']}, {d['R_B']} employed {d['M_B']}."
        dist1 = f"Unlike {d['R_A']}'s flawed approach using {d['M_A']}, {d['R_B']} wisely used {d['M_B']} to study {d['S']}."
        dist2 = f"{d['R_A']} and {d['R_B']} both investigated {d['S']} in {d['Y_A']} and {d['Y_B']}, respectively."
        dist3 = f"{d['R_A']}'s study resulted in {d['F_A']}, whereas {d['R_B']}'s study yielded {d['F_B']}."
        
        q = {
            "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Expression of Ideas",
            "skill": "Rhetorical Synthesis",
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "type": "MCQ",
            "prompt": f"{prompt_text}\n\nThe student wants to {goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
            "choices": [correct, dist1, dist2, dist3],
            "correctAnswer": correct,
            "explanation": {
                "correct": "This choice successfully contrasts the methodologies of the two researchers using an objective tone, meeting all constraints of the prompt.",
                "distractors": {
                    dist1: "This choice fails the objective tone constraint by using subjective language ('flawed approach', 'wisely').",
                    dist2: "This choice fails to mention or contrast the methodologies used in the studies.",
                    dist3: "This choice contrasts the findings rather than the methodologies."
                }
            },
            "metadata": {
                "cognitiveMove": "Synthesize constraints: contrast + methodology + objective tone.",
                "trapTypes": ["Tone Violation Trap", "Wrong Focus Trap (Findings)"],
                "sourceSignalId": "antigravity-1600-rw-expression2",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        }
        questions.append(q)

    # Template 2
    t2_data = [
        {"C": "Minoan civilization", "R": "the Aegean Sea", "D1": "3000 BCE", "D2": "1100 BCE", "A": "elaborate palace architecture and frescoes", "C1": "Mycenaean invasion", "C2": "the Theran volcanic eruption and subsequent tsunamis"},
        {"C": "Harappan civilization", "R": "the Indus Valley", "D1": "3300 BCE", "D2": "1300 BCE", "A": "advanced urban planning and drainage systems", "C1": "Aryan migrations", "C2": "shifts in monsoon patterns leading to severe drought"},
        {"C": "Classic Maya civilization", "R": "Mesoamerica", "D1": "250 CE", "D2": "900 CE", "A": "complex hieroglyphic writing and astronomy", "C1": "peasant uprisings", "C2": "prolonged multi-decadal megadroughts"},
        {"C": "Cahokian civilization", "R": "the Mississippi River basin", "D1": "1050 CE", "D2": "1350 CE", "A": "massive earthen mound construction", "C1": "internal political fragmentation", "C2": "severe environmental degradation and resource depletion"},
        {"C": "Khmer Empire", "R": "Southeast Asia", "D1": "802 CE", "D2": "1431 CE", "A": "monumental temple complexes like Angkor Wat", "C1": "Ayutthaya kingdom invasions", "C2": "the failure of their complex water management network"},
        {"C": "Rapa Nui society", "R": "Easter Island", "D1": "1200 CE", "D2": "1700 CE", "A": "monolithic moai statues", "C1": "inter-tribal warfare", "C2": "the introduction of Polynesian rats that decimated palm forests"},
        {"C": "Ancestral Puebloans", "R": "the American Southwest", "D1": "100 CE", "D2": "1300 CE", "A": "cliff dwellings in regions like Mesa Verde", "C1": "nomadic raider incursions", "C2": "the Great Drought that compromised agricultural yields"},
        {"C": "Western Roman Empire", "R": "Europe and the Mediterranean", "D1": "27 BCE", "D2": "476 CE", "A": "unprecedented engineering and legal systems", "C1": "lead poisoning", "C2": "economic instability combined with sustained Germanic migrations"},
        {"C": "Akkadian Empire", "R": "Mesopotamia", "D1": "2334 BCE", "D2": "2154 BCE", "A": "creating the first known dynastic empire", "C1": "Gutian tribal raids", "C2": "a sudden, aridification event that collapsed agricultural production"},
        {"C": "Tiwanaku state", "R": "the Andes mountains", "D1": "300 CE", "D2": "1150 CE", "A": "high-altitude terraced agriculture", "C1": "Inca conquest", "C2": "drastic shifts in Lake Titicaca's water levels"}
    ]

    for d in t2_data:
        prompt_text = "While researching a topic, a student has taken the following notes:\n" \
                      f"- The {d['C']} thrived in {d['R']} from {d['D1']} to {d['D2']}.\n" \
                      f"- It was known for {d['A']}.\n" \
                      f"- Around {d['D2']}, the civilization experienced a rapid collapse.\n" \
                      f"- Scholars traditionally blamed {d['C1']}.\n" \
                      f"- Recent sediment analysis reveals that {d['C2']} was the primary driver of the collapse."
        goal = "emphasize the primary cause of the civilization's decline without mentioning specific dates"
        correct = f"Although traditional scholarship pointed to {d['C1']}, recent sediment analysis indicates that {d['C2']} was the primary driver of the {d['C']}'s collapse."
        dist1 = f"Between {d['D1']} and {d['D2']}, the {d['C']} thrived before {d['C2']} caused its collapse."
        dist2 = f"The {d['C']}, known for {d['A']}, collapsed due to factors including {d['C1']} and {d['C2']}."
        dist3 = f"Scholars traditionally blamed {d['C1']} for the collapse of the {d['C']}, which was known for {d['A']}."
        
        q = {
            "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Expression of Ideas",
            "skill": "Rhetorical Synthesis",
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "type": "MCQ",
            "prompt": f"{prompt_text}\n\nThe student wants to {goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
            "choices": [correct, dist1, dist2, dist3],
            "correctAnswer": correct,
            "explanation": {
                "correct": "This choice correctly emphasizes the primary cause discovered by recent analysis, contrasting it with the traditional view, and completely avoids mentioning the dates.",
                "distractors": {
                    dist1: "This choice fails the constraint by explicitly mentioning the dates.",
                    dist2: "This choice fails to emphasize the primary cause, instead treating both causes equally.",
                    dist3: "This choice emphasizes the traditional cause rather than the primary cause identified by recent analysis."
                }
            },
            "metadata": {
                "cognitiveMove": "Synthesize constraints: emphasize primary cause + negative constraint (no dates).",
                "trapTypes": ["Negative Constraint Violation", "Emphasis Trap"],
                "sourceSignalId": "antigravity-1600-rw-expression2",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        }
        questions.append(q)

    # Template 3
    t3_data = [
        {"A": "Kazimir Malevich", "D": "1879-1935", "N": "Russian", "P": "painter", "M": "Suprematist", "Y": "1915", "Med": "oil painting", "W": "Black Square", "T": "pure geometric abstraction to express feeling", "L": "the State Tretyakov Gallery"},
        {"A": "Zaha Hadid", "D": "1950-2016", "N": "Iraqi-British", "P": "architect", "M": "Deconstructivist", "Y": "2010", "Med": "building", "W": "Guangzhou Opera House", "T": "fluid, sweeping curves that defy traditional geometry", "L": "Guangzhou, China"},
        {"A": "John Cage", "D": "1912-1992", "N": "American", "P": "composer", "M": "avant-garde", "Y": "1952", "Med": "musical composition", "W": "4'33\"", "T": "ambient environmental sounds rather than performed notes", "L": "musical theory textbooks worldwide"},
        {"A": "Frida Kahlo", "D": "1907-1954", "N": "Mexican", "P": "painter", "M": "Surrealist", "Y": "1939", "Med": "double self-portrait", "W": "The Two Fridas", "T": "deeply personal, symbolic representation of dual identity", "L": "the Museo de Arte Moderno"},
        {"A": "Marcel Duchamp", "D": "1887-1968", "N": "French", "P": "sculptor", "M": "Dada", "Y": "1917", "Med": "readymade sculpture", "W": "Fountain", "T": "elevating mass-produced mundane objects to high art", "L": "the Tate Modern"},
        {"A": "Virginia Woolf", "D": "1882-1941", "N": "British", "P": "novelist", "M": "Modernist", "Y": "1927", "Med": "novel", "W": "To the Lighthouse", "T": "stream-of-consciousness narrative to explore interiority", "L": "the British Library archives"},
        {"A": "Martha Graham", "D": "1894-1991", "N": "American", "P": "choreographer", "M": "Modern Dance", "Y": "1944", "Med": "ballet", "W": "Appalachian Spring", "T": "sharp, angular contraction and release movements", "L": "the Library of Congress"},
        {"A": "Le Corbusier", "D": "1887-1965", "N": "Swiss-French", "P": "architect", "M": "International Style", "Y": "1931", "Med": "residence", "W": "Villa Savoye", "T": "pilotis to elevate the structure and free the floor plan", "L": "Poissy, France"},
        {"A": "Nam June Paik", "D": "1932-2006", "N": "Korean-American", "P": "artist", "M": "Fluxus", "Y": "1974", "Med": "video installation", "W": "TV Buddha", "T": "closed-circuit television to create an infinite feedback loop", "L": "the Stedelijk Museum"},
        {"A": "Isamu Noguchi", "D": "1904-1988", "N": "Japanese-American", "P": "sculptor", "M": "Biomorphic", "Y": "1946", "Med": "glass table", "W": "the Noguchi Table", "T": "interlocking wooden base elements without the use of hardware", "L": "the Herman Miller collection"}
    ]

    for d in t3_data:
        prompt_text = "While researching a topic, a student has taken the following notes:\n" \
                      f"- {d['A']} ({d['D']}) was a {d['N']} {d['P']}.\n" \
                      f"- They were associated with the {d['M']} movement.\n" \
                      f"- Their most significant work is the {d['Y']} {d['Med']} titled {d['W']}.\n" \
                      f"- The work is celebrated for its pioneering use of {d['T']}.\n" \
                      f"- It is currently housed in {d['L']}."
        goal = f"introduce {d['A']}'s most significant work to an audience unfamiliar with the {d['M']} movement"
        correct = f"{d['A']}, a key figure in the {d['M']} movement, is best known for {d['W']}, a pioneering {d['Med']} celebrated for its use of {d['T']}."
        dist1 = f"Exemplifying the core tenets of the {d['M']} movement, {d['W']} utilizes {d['T']}, securing {d['A']}'s legacy."
        dist2 = f"{d['A']} was a prominent {d['N']} {d['P']} who pioneered {d['T']} within the {d['M']} movement."
        dist3 = f"Created in {d['Y']} and currently housed in {d['L']}, {d['W']} is celebrated for its pioneering use of {d['T']}."

        q = {
            "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Expression of Ideas",
            "skill": "Rhetorical Synthesis",
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "type": "MCQ",
            "prompt": f"{prompt_text}\n\nThe student wants to {goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
            "choices": [correct, dist1, dist2, dist3],
            "correctAnswer": correct,
            "explanation": {
                "correct": "This choice effectively introduces the artist, explicitly names the work, and explains the technique and context (the movement) so that an unfamiliar audience can understand its significance.",
                "distractors": {
                    dist1: "This choice assumes the audience already understands the 'core tenets' of the movement, violating the constraint to address an unfamiliar audience.",
                    dist2: "This choice introduces the artist and their technique but completely fails to name their most significant work.",
                    dist3: "This choice introduces the work and technique but fails to provide the context of the artist and movement, which is necessary for a general introduction."
                }
            },
            "metadata": {
                "cognitiveMove": "Synthesize constraints: introduce work + provide context for unfamiliar audience.",
                "trapTypes": ["Missing Context Trap", "Assumed Knowledge Trap"],
                "sourceSignalId": "antigravity-1600-rw-expression2",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        }
        questions.append(q)

    # Template 4
    t4_data = [
        {"I": "MIT", "Y": "2023", "D": "a novel solid-state battery architecture", "M": "sodium-ion electrolytes", "F": "electric vehicle manufacturing", "L": "highly prone to degradation at temperatures below freezing"},
        {"I": "CERN", "Y": "2022", "D": "a compact linear accelerator", "M": "plasma wakefield technology", "F": "medical radiation therapy", "L": "unable to sustain beam stability for more than a microsecond"},
        {"I": "Stanford", "Y": "2021", "D": "an artificial leaf device", "M": "bismuth vanadate photoanodes", "F": "green hydrogen production", "L": "only capable of operating at 2% solar-to-hydrogen efficiency"},
        {"I": "Oxford", "Y": "2024", "D": "a synthetic broad-spectrum enzyme", "M": "CRISPR-directed directed evolution", "F": "plastic waste degradation", "L": "exclusively active in highly acidic laboratory environments"},
        {"I": "Tokyo Tech", "Y": "2023", "D": "a room-temperature superconductor", "M": "nitrogen-doped lutetium hydrides", "F": "global power grid infrastructure", "L": "reliant on immense pressures exceeding 10,000 atmospheres"},
        {"I": "Caltech", "Y": "2022", "D": "a quantum error-correction protocol", "M": "topological qubits", "F": "cryptographic data security", "L": "highly susceptible to interference from cosmic background radiation"},
        {"I": "ETH Zurich", "Y": "2023", "D": "a bio-inspired desalination membrane", "M": "aquaporin protein channels", "F": "global freshwater scarcity", "L": "susceptible to rapid biofouling from marine microorganisms"},
        {"I": "Max Planck Institute", "Y": "2021", "D": "an optogenetic neural implant", "M": "photosensitive channelrhodopsin", "F": "spinal cord injury rehabilitation", "L": "limited to stimulating only superficial layers of nerve tissue"},
        {"I": "Harvard", "Y": "2024", "D": "a printable photovoltaic ink", "M": "perovskite nanocrystals", "F": "urban renewable energy generation", "L": "degrading rapidly when exposed to ambient atmospheric moisture"},
        {"I": "UC Berkeley", "Y": "2022", "D": "an atmospheric carbon capture sponge", "M": "metal-organic frameworks (MOFs)", "F": "climate change mitigation", "L": "prohibitively expensive to scale beyond the pilot phase"}
    ]

    for d in t4_data:
        prompt_text = "While researching a topic, a student has taken the following notes:\n" \
                      f"- In {d['Y']}, {d['I']} researchers discovered {d['D']}.\n" \
                      f"- The discovery is based on {d['M']}.\n" \
                      f"- It has the potential to revolutionize {d['F']}.\n" \
                      f"- However, the current iteration is {d['L']}.\n" \
                      f"- Further research is needed to make it commercially viable."
        goal = "highlight the limitation of the discovery while maintaining an encouraging tone about its future"
        correct = f"While the {d['I']} researchers' discovery of {d['D']} is currently limited by being {d['L']}, it holds exciting potential to revolutionize {d['F']} with further development."
        dist1 = f"Unfortunately, the {d['I']} researchers' discovery of {d['D']} is severely hampered by being {d['L']}, rendering it practically useless for now."
        dist2 = f"The recent discovery of {d['D']} by {d['I']} researchers has the tremendous potential to completely revolutionize {d['F']}."
        dist3 = f"The {d['D']} discovered by {d['I']} researchers has potential in {d['F']}, but the current iteration is {d['L']}."

        q = {
            "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Expression of Ideas",
            "skill": "Rhetorical Synthesis",
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "type": "MCQ",
            "prompt": f"{prompt_text}\n\nThe student wants to {goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
            "choices": [correct, dist1, dist2, dist3],
            "correctAnswer": correct,
            "explanation": {
                "correct": "This choice explicitly mentions the specific limitation while using an upbeat, encouraging tone ('exciting potential to revolutionize') about its future.",
                "distractors": {
                    dist1: "This choice mentions the limitation but violates the tone constraint by being deeply pessimistic ('severely hampered', 'practically useless').",
                    dist2: "This choice maintains an encouraging tone but fails to mention the limitation entirely.",
                    dist3: "This choice mentions the limitation but uses a flat, neutral tone rather than an actively encouraging one."
                }
            },
            "metadata": {
                "cognitiveMove": "Synthesize constraints: highlight specific limitation + encouraging tone.",
                "trapTypes": ["Tone Violation Trap", "Missing Constraint (Limitation)"],
                "sourceSignalId": "antigravity-1600-rw-expression2",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        }
        questions.append(q)

    # Template 5
    t5_data = [
        {"S_A": "Amur leopard", "R_A": "the Russian Far East", "H_A": "temperate broadleaf forests", "F_A": "a thick, pale coat with widely spaced rosettes", "S_B": "African leopard", "R_B": "Sub-Saharan Africa", "H_B": "savannas and rainforests", "F_B": "a shorter, tawny coat with dense, circular rosettes"},
        {"S_A": "Galapagos penguin", "R_A": "the equatorial Galapagos Islands", "H_A": "warm tropical ocean currents", "F_A": "a smaller body size with exposed skin patches for heat dissipation", "S_B": "Emperor penguin", "R_B": "Antarctica", "H_B": "frigid sea ice", "F_B": "a massive body size with dense overlapping feathers for insulation"},
        {"S_A": "Eastern grey squirrel", "R_A": "the eastern United States", "H_A": "deciduous woodlands", "F_A": "a predominantly silvery-grey pelage", "S_B": "Eurasian red squirrel", "R_B": "northern Europe and Siberia", "H_B": "coniferous boreal forests", "F_B": "a vibrant reddish-brown coat with distinct ear tufts"},
        {"S_A": "Mountain gorilla", "R_A": "the Virunga Mountains of Central Africa", "H_A": "high-altitude cloud forests", "F_A": "thick, long hair adapted to freezing temperatures", "S_B": "Western lowland gorilla", "R_B": "the Congo Basin", "H_B": "dense, low-elevation swamps", "F_B": "shorter, brownish-grey hair suited for humid heat"},
        {"S_A": "Andean condor", "R_A": "the Andes mountain range in South America", "H_A": "alpine grasslands", "F_A": "a prominent fleshy crest on the males' heads", "S_B": "California condor", "R_B": "the southwestern United States", "H_B": "coastal scrublands", "F_B": "a smooth, vibrantly colored bald head without any crest"},
        {"S_A": "Snow leopard", "R_A": "the Himalayas and Central Asia", "H_A": "alpine and subalpine zones", "F_A": "an exceptionally long, thick tail used for balance and warmth", "S_B": "Clouded leopard", "R_B": "Southeast Asia", "H_B": "tropical rainforests", "F_B": "proportionately massive canine teeth relative to its skull size"},
        {"S_A": "Bactrian camel", "R_A": "the steppes of Central Asia", "H_A": "cold desert regions", "F_A": "two humps designed to store fat for harsh winters", "S_B": "Dromedary camel", "R_B": "the Middle East and North Africa", "H_B": "hot, arid deserts", "F_B": "a single hump optimized for thermoregulation"},
        {"S_A": "Green sea turtle", "R_A": "tropical and subtropical oceans worldwide", "H_A": "shallow seagrass beds", "F_A": "a smooth, teardrop-shaped carapace", "S_B": "Hawksbill sea turtle", "R_B": "coral reefs of the Indo-Pacific", "H_B": "rocky coastal areas", "F_B": "a sharply pointed beak and overlapping carapace scutes"},
        {"S_A": "Red panda", "R_A": "the eastern Himalayas", "H_A": "high-altitude bamboo forests", "F_A": "a ringed tail and reddish-brown fur", "S_B": "Giant panda", "R_B": "central China", "H_B": "montane bamboo forests", "F_B": "a distinctive black-and-white coat pattern"},
        {"S_A": "Arctic fox", "R_A": "the Arctic tundra", "H_A": "treeless polar regions", "F_A": "small, rounded ears that minimize heat loss", "S_B": "Fennec fox", "R_B": "the Sahara Desert", "H_B": "sandy, arid dunes", "F_B": "enormous, bat-like ears that radiate excess body heat"}
    ]

    for d in t5_data:
        prompt_text = "While researching a topic, a student has taken the following notes:\n" \
                      f"- The {d['S_A']} is native to {d['R_A']}.\n" \
                      f"- It prefers {d['H_A']} habitats.\n" \
                      f"- It is characterized by {d['F_A']}.\n" \
                      f"- The {d['S_B']}, a closely related species, is native to {d['R_B']}.\n" \
                      f"- It prefers {d['H_B']} habitats and is characterized by {d['F_B']}."
        goal = "emphasize the geographic distribution of both species while pointing out a key contrast in their physical characteristics"
        correct = f"Native to {d['R_A']} and {d['R_B']} respectively, the {d['S_A']} and the {d['S_B']} differ notably: the former features {d['F_A']}, whereas the latter is characterized by {d['F_B']}."
        dist1 = f"Although closely related, the {d['S_A']} prefers {d['H_A']} and features {d['F_A']}, while the {d['S_B']} prefers {d['H_B']} and features {d['F_B']}."
        dist2 = f"While the {d['S_A']} is found in {d['R_A']}'s {d['H_A']}, its close relative, the {d['S_B']}, inhabits {d['R_B']}'s {d['H_B']}."
        dist3 = f"While the {d['S_A']} features {d['F_A']}, the {d['S_B']}, a closely related species, is characterized by {d['F_B']}."

        q = {
            "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Expression of Ideas",
            "skill": "Rhetorical Synthesis",
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "type": "MCQ",
            "prompt": f"{prompt_text}\n\nThe student wants to {goal}. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
            "choices": [correct, dist1, dist2, dist3],
            "correctAnswer": correct,
            "explanation": {
                "correct": "This choice explicitly states the geographic distribution (regions) of both species and creates a clear, direct contrast between their specific physical characteristics.",
                "distractors": {
                    dist1: "This choice details habitats instead of geographic distributions.",
                    dist2: "This choice emphasizes geographic distributions but fails to mention or contrast their physical characteristics.",
                    dist3: "This choice highlights the physical characteristics but completely omits the geographic distribution of both species."
                }
            },
            "metadata": {
                "cognitiveMove": "Synthesize constraints: highlight geography + contrast physical characteristics.",
                "trapTypes": ["Wrong Detail Trap (Habitat vs Geography)", "Missing Constraint (Physical Characteristics)", "Missing Constraint (Geography)"],
                "sourceSignalId": "antigravity-1600-rw-expression2",
                "generationEngine": "antigravity-master-prompt-1600"
            }
        }
        questions.append(q)

    # Scramble choices
    for q in questions:
        random.shuffle(q['choices'])

    return questions

def save_to_bank(questions):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    bank_path = os.path.join(base_dir, "data", "antigravity-bank.json")
    
    os.makedirs(os.path.dirname(bank_path), exist_ok=True)
    
    if os.path.exists(bank_path):
        with open(bank_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []
        
    data.extend(questions)
    
    with open(bank_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully injected {len(questions)} Hard R&W Rhetorical Synthesis questions into {bank_path}")

if __name__ == "__main__":
    questions = generate_questions()
    save_to_bank(questions)
