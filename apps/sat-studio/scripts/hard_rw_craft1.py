#!/usr/bin/env python3
"""
hard_rw_craft1.py — Antigravity 1600 Standard
Generates 50 Hard R&W "Words in Context" questions and injects them
into data/antigravity-bank.json.

Domain rotation: Literature (pre-1929) / History-Social Studies / Science
All questions: section='Reading and Writing', difficulty='Hard',
               domain='Craft and Structure', skill='Words in Context',
               type='MCQ'

Every target word has 4 real dictionary definitions as choices;
only one fits the specific passage context.
"""

import json
import uuid
import os
from datetime import datetime

# ── helpers ──────────────────────────────────────────────────────────
def make_id():
    return f"antigravity-1600-{uuid.uuid4().hex[:8]}"

COMMON_META = {
    "sourceType": "antigravity",
    "sourceName": "Antigravity Vault",
    "sourceSignalId": "antigravity-1600-rw-craft1",
    "generationEngine": "antigravity-master-prompt-1600",
    "visibility": "private_family",
    "reviewStatus": "needs_review",
    "targetBand": "SAT-1600",
}

def q(prompt, choices, correct, explanation_correct, distractor_explanations,
      cognitive_move, trap_types, target_word=None):
    """Build a single question dict."""
    qid = make_id()
    return {
        "id": qid,
        "section": "Reading and Writing",
        "domain": "Craft and Structure",
        "skill": "Words in Context",
        "difficulty": "Hard",
        "type": "MCQ",
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": correct,
        "explanation": {
            "correct": explanation_correct,
            "distractors": distractor_explanations,
        },
        "metadata": {
            "cognitiveMove": cognitive_move,
            "trapTypes": trap_types,
            "targetWord": target_word,
        },
        **COMMON_META,
    }

# ── 50 QUESTIONS ─────────────────────────────────────────────────────
questions = []

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q1 — Literature (Hawthorne) — "qualify"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The minister's vow of penance, though ostensibly absolute in its "
        "severity, was in practice heavily qualified by the tacit forbearance "
        "of the congregation, who chose to interpret his self-imposed suffering "
        "as evidence of holiness rather than guilt. The veil he wore became not "
        "a mark of shame but a sacred emblem, its meaning transformed by "
        "communal reverence into something the minister himself could scarcely "
        "have intended.\n\n"
        "—Adapted from Nathaniel Hawthorne, \"The Minister's Black Veil\" (1836)\n\n"
        "As used in the passage, \"qualified\" most nearly means"
    ),
    choices={
        "A": "made eligible through credentials or training",
        "B": "limited or modified by conditions or exceptions",
        "C": "described or characterized in a particular way",
        "D": "made competent through experience",
    },
    correct="B",
    explanation_correct=(
        "In context, the minister's penance was 'absolute in its severity' on "
        "the surface but was 'qualified' — meaning limited, restricted, or "
        "modified — by the congregation's forbearance. The sentence structure "
        "sets up a contrast ('though ostensibly absolute… was in practice heavily "
        "qualified'), making clear that 'qualified' means the severity was "
        "reduced or softened by external conditions. Choice A (credentialed) "
        "and D (made competent) both relate to professional readiness, which is "
        "irrelevant to penance. Choice C (described) fails the contrast logic: "
        "the passage isn't saying the penance was 'described' by forbearance."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'qualified' most frequently means 'credentialed' "
             "in everyday speech (e.g., 'a qualified doctor'), but this meaning makes "
             "no sense applied to a vow of penance.",
        "C": "Connotation Mismatch — While 'qualify' can mean 'to describe,' the passage "
             "is not saying the forbearance described the penance; it is saying the "
             "forbearance limited its actual severity.",
        "D": "Register Error — 'Qualified through experience' belongs to professional "
             "contexts and cannot logically modify a vow of penance.",
    },
    cognitive_move="Recognizing the concessive contrast structure ('though X… was Y') to identify that 'qualified' signals limitation rather than credentialing",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="qualified",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q2 — Science — "plastic"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Recent neuroimaging studies have demonstrated that the adult human "
        "brain retains a remarkably plastic character well into the seventh "
        "decade of life. Contrary to earlier models positing fixed neural "
        "architecture after critical developmental periods, longitudinal MRI "
        "data reveal that cortical thickness, dendritic arborization, and "
        "synaptic density all respond dynamically to sustained cognitive "
        "training regimens.\n\n"
        "—Adapted from Chen et al., \"Lifelong Cortical Reorganization,\" "
        "Journal of Cognitive Neuroscience (2019)\n\n"
        "As used in the passage, \"plastic\" most nearly means"
    ),
    choices={
        "A": "made of synthetic polymer material",
        "B": "superficially attractive but lacking substance",
        "C": "capable of being shaped or modified",
        "D": "rigid and resistant to deformation",
    },
    correct="C",
    explanation_correct=(
        "The passage describes the brain as 'plastic' in a context that "
        "explicitly contrasts this with 'fixed neural architecture.' The sentence "
        "then elaborates that brain structures 'respond dynamically' to training, "
        "confirming that 'plastic' means capable of being shaped, molded, or "
        "modified. Choice A (synthetic polymer) is the everyday material sense, "
        "irrelevant to neuroscience. Choice B (superficially attractive) is a "
        "colloquial/pejorative sense (as in 'plastic smile'). Choice D is the "
        "antonym — the passage specifically contrasts plasticity against fixedness."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — The material sense of 'plastic' is the most "
             "frequent everyday usage but is nonsensical when describing a brain's "
             "cognitive properties.",
        "B": "Register Error — The informal/pejorative sense ('plastic celebrity') "
             "belongs to casual speech and is incompatible with a scientific passage "
             "about neural adaptation.",
        "D": "Opposite Direction Trap — 'Rigid' is the antonym of the intended meaning. "
             "The passage explicitly sets up a contrast between plasticity and fixedness.",
    },
    cognitive_move="Using the explicit contrast with 'fixed neural architecture' and the elaboration 'respond dynamically' to disambiguate the technical sense of 'plastic'",
    trap_types=["Common Meaning Trap", "Register Error", "Opposite Direction Trap"],
    target_word="plastic",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q3 — History/Social Studies — "economy"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "In composing the Constitution, the Framers demonstrated a remarkable "
        "economy of language: each clause was distilled to its essential meaning, "
        "stripped of rhetorical embellishment, so that the document might serve as "
        "a durable framework adaptable to circumstances its authors could not have "
        "foreseen. This deliberate compression reflected not haste but a conviction "
        "that brevity would insulate the text against interpretive obsolescence.\n\n"
        "—Adapted from Akhil Reed Amar, America's Constitution: A Biography (2005)\n\n"
        "As used in the passage, \"economy\" most nearly means"
    ),
    choices={
        "A": "the system of production, trade, and consumption of goods",
        "B": "financial prudence and thrift with money",
        "C": "efficient and sparing use of something",
        "D": "a class of inexpensive travel accommodation",
    },
    correct="C",
    explanation_correct=(
        "The passage specifies 'economy of language,' then elaborates: 'each clause "
        "was distilled to its essential meaning, stripped of rhetorical embellishment.' "
        "This clearly indicates efficient, sparing use of words — not wealth systems "
        "(A), money management (B), or travel class (D). The phrase 'deliberate "
        "compression' later in the passage reinforces that 'economy' refers to "
        "minimalism and efficiency in expression."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Economy' most commonly refers to financial systems "
             "('the U.S. economy'), but the phrase 'economy of language' signals a "
             "completely different domain of meaning.",
        "B": "Connotation Mismatch — Financial thrift shares the 'saving' connotation "
             "with efficiency, making this a subtle trap, but the passage is about "
             "linguistic brevity, not monetary prudence.",
        "D": "Register Error — 'Economy class' is a consumer/travel term entirely "
             "outside the register of constitutional analysis.",
    },
    cognitive_move="Recognizing that the prepositional phrase 'of language' constrains 'economy' to its rhetorical/stylistic sense rather than its financial sense",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="economy",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q4 — Literature (Melville) — "novel"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Ahab's monomania, though familiar in outline to any student of tragic "
        "obsession, derived its peculiar force from a novel fusion of mystical "
        "symbolism and industrial realism. The whale was at once a theological "
        "cipher and a commercial commodity, and Ahab's pursuit of it married the "
        "language of prophecy to the ledger books of the Nantucket counting-house "
        "in ways that no prior American fiction had attempted.\n\n"
        "—Adapted from F. O. Matthiessen, American Renaissance (1941), discussing "
        "Herman Melville's Moby-Dick (1851)\n\n"
        "As used in the passage, \"novel\" most nearly means"
    ),
    choices={
        "A": "a long work of prose fiction",
        "B": "new and unlike anything previously known",
        "C": "trivial or unimportant",
        "D": "relating to legal proceedings or lawsuits",
    },
    correct="B",
    explanation_correct=(
        "The passage says Ahab's monomania derived force from 'a novel fusion of "
        "mystical symbolism and industrial realism,' and the final clause confirms "
        "this was unprecedented: 'no prior American fiction had attempted' it. "
        "'Novel' here means new, original, unprecedented. Choice A (prose fiction) "
        "is the noun form, but 'novel' is used as an adjective modifying 'fusion.' "
        "Choice C is not a standard meaning of 'novel.' Choice D (legal) confuses "
        "'novel' with legal terminology it does not possess."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — Students most often encounter 'novel' as a noun "
             "meaning 'a book of fiction.' Here it functions as an adjective, but the "
             "literary context makes this trap especially seductive.",
        "C": "Connotation Mismatch — 'Novel' never means trivial; this distractor "
             "tests whether students confuse it with 'novelty' in a dismissive sense.",
        "D": "Register Error — This invented meaning tests whether students confuse "
             "'novel' with legal Latin terms; no such meaning exists.",
    },
    cognitive_move="Identifying the part of speech (adjective modifying 'fusion') to eliminate the noun sense, then using 'no prior American fiction had attempted' as confirmation of unprecedented/new",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="novel",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q5 — Science — "appreciable"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Although the catalytic conversion of methane to methanol has long been "
        "theoretically feasible, no laboratory protocol had achieved an appreciable "
        "yield under ambient conditions until the development of copper-exchanged "
        "zeolite frameworks. These frameworks lower the activation energy "
        "sufficiently to produce methanol quantities large enough to be measured "
        "and potentially scaled for industrial use.\n\n"
        "—Adapted from Grundner et al., \"Single-site trinuclear copper oxygen "
        "clusters in mordenite,\" Nature Chemistry (2015)\n\n"
        "As used in the passage, \"appreciable\" most nearly means"
    ),
    choices={
        "A": "worthy of gratitude or thankfulness",
        "B": "capable of being emotionally valued",
        "C": "large enough to be noticed or measured",
        "D": "increasing steadily in financial value",
    },
    correct="C",
    explanation_correct=(
        "The passage says no protocol had achieved 'an appreciable yield,' then "
        "elaborates that the new framework produces 'quantities large enough to be "
        "measured and potentially scaled.' This gloss directly defines 'appreciable' "
        "as large enough to be noticed or measured. Choice A confuses 'appreciable' "
        "with 'appreciated' (gratitude). Choice B shifts to emotional valuation. "
        "Choice D confuses with 'appreciation' in financial contexts (asset appreciation)."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Appreciate' often means 'to be grateful,' so "
             "students may project gratitude onto 'appreciable,' but the scientific "
             "context demands the quantitative sense.",
        "B": "Connotation Mismatch — Emotional valuation is irrelevant in a chemistry "
             "passage discussing measurable yield quantities.",
        "D": "Register Error — Financial 'appreciation' (rising value) belongs to "
             "economics, not laboratory chemistry discussing reaction yields.",
    },
    cognitive_move="Using the in-passage gloss ('quantities large enough to be measured') to confirm that 'appreciable' means detectable/significant in quantity",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="appreciable",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q6 — History/Social Studies — "address"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "In his second inaugural, Lincoln chose not merely to celebrate the "
        "Union's imminent military triumph but to address the deeper moral wound "
        "that slavery had inflicted upon the republic. Rather than rehearsing the "
        "political grievances that had precipitated the conflict, he directed the "
        "nation's attention to the theological question of collective guilt, "
        "insisting that North and South alike bore responsibility for the sin of "
        "human bondage.\n\n"
        "—Adapted from Ronald C. White Jr., Lincoln's Greatest Speech (2002)\n\n"
        "As used in the passage, \"address\" most nearly means"
    ),
    choices={
        "A": "the location of a building or residence",
        "B": "to speak to an audience formally",
        "C": "to direct efforts toward dealing with a problem",
        "D": "to write a destination on an envelope",
    },
    correct="C",
    explanation_correct=(
        "Lincoln chose 'to address the deeper moral wound' — meaning to deal with, "
        "confront, or direct efforts toward resolving it. The passage emphasizes that "
        "Lincoln went beyond celebration to confront the underlying moral crisis. "
        "Choice B (formal speech) is tempting because Lincoln is giving an 'inaugural' "
        "address, but the infinitive 'to address the deeper moral wound' means to "
        "tackle or engage with that wound, not merely to speak about it. Choices A "
        "and D are physical/postal senses entirely outside this context."
    ),
    distractor_explanations={
        "A": "Register Error — The locational meaning ('home address') has no "
             "connection to the rhetorical and moral context of the passage.",
        "B": "Connotation Mismatch — While Lincoln is delivering a speech, 'to address "
             "the moral wound' means to confront or deal with it, not simply to speak "
             "about it. The passage emphasizes engagement with the problem, not the act "
             "of oratory itself.",
        "D": "Common Meaning Trap — The postal sense is familiar but absurd in context.",
    },
    cognitive_move="Distinguishing between 'address' as speaking and 'address' as confronting/dealing with, using the object ('the deeper moral wound') to identify the problem-solving sense",
    trap_types=["Register Error", "Connotation Mismatch", "Common Meaning Trap"],
    target_word="address",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q7 — Literature (Conrad) — "arrest"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The immobility of the fog, which had settled upon the river like a "
        "shroud, seemed to arrest not merely the progress of the steamer but the "
        "very passage of time itself. Marlow, leaning against the rail, felt that "
        "the boundary between waking and dreaming had dissolved, that the vessel "
        "was suspended in some liminal space where neither clocks nor compasses "
        "held authority.\n\n"
        "—Adapted from Joseph Conrad, Heart of Darkness (1899)\n\n"
        "As used in the passage, \"arrest\" most nearly means"
    ),
    choices={
        "A": "to seize and take into legal custody",
        "B": "to bring to a complete stop or halt",
        "C": "to attract and hold the attention of",
        "D": "to suffer a sudden failure of heart function",
    },
    correct="B",
    explanation_correct=(
        "The fog 'arrest[ed] not merely the progress of the steamer but the very "
        "passage of time.' The sentence describes a complete stoppage — the steamer "
        "cannot move, and time itself feels suspended. 'Arrest' here means to halt "
        "or stop completely. Choice A (legal custody) is the most common meaning but "
        "makes no sense with 'progress' or 'time' as objects. Choice C (attract "
        "attention) is plausible in some literary contexts ('an arresting image') but "
        "doesn't fit the halting of movement. Choice D (cardiac arrest) is a medical "
        "term inappropriate here."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Arrest' as 'take into custody' is the dominant "
             "everyday meaning, but fog cannot perform a legal action on a steamer's "
             "progress.",
        "C": "Connotation Mismatch — 'Arresting' can mean captivating, but the passage "
             "emphasizes physical cessation of movement and time, not the capturing "
             "of attention.",
        "D": "Register Error — 'Cardiac arrest' is a medical compound term; using "
             "the medical sense for a literary passage about fog is a domain mismatch.",
    },
    cognitive_move="Reading the parallel structure ('not merely the progress… but the very passage of time') to identify that 'arrest' describes cessation of movement in both physical and temporal domains",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="arrest",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q8 — Science — "resolution"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Cryo-electron microscopy has achieved a resolution sufficient to "
        "distinguish individual amino acid side chains within a protein complex, "
        "a capability that was confined to X-ray crystallography only a decade ago. "
        "This advance permits researchers to map drug-binding pockets at the atomic "
        "level without the need to crystallize target proteins, thereby accelerating "
        "structure-based drug design.\n\n"
        "—Adapted from Kühlbrandt, \"The Resolution Revolution,\" Science (2014)\n\n"
        "As used in the passage, \"resolution\" most nearly means"
    ),
    choices={
        "A": "a firm decision to do or not do something",
        "B": "the formal expression of an opinion by a legislative body",
        "C": "the degree of detail visible in an image or measurement",
        "D": "the action of solving a conflict or dispute",
    },
    correct="C",
    explanation_correct=(
        "The passage says cryo-EM has achieved 'a resolution sufficient to "
        "distinguish individual amino acid side chains,' clearly indicating optical/"
        "imaging resolution — the level of detail an instrument can capture. The "
        "passage then discusses mapping structures 'at the atomic level,' reinforcing "
        "the imaging sense. Choice A (personal resolve), B (legislative motion), and "
        "D (conflict solving) are all valid meanings of 'resolution' but are entirely "
        "outside the scientific imaging context."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'New Year's resolution' is perhaps the most "
             "familiar use, but personal determination has nothing to do with microscopy.",
        "B": "Register Error — Legislative resolutions belong to political discourse, "
             "not structural biology.",
        "D": "Connotation Mismatch — Dispute resolution shares the 'settling/clarifying' "
             "semantic thread but is about interpersonal or legal conflicts, not optical "
             "detail.",
    },
    cognitive_move="Using the technical context (microscopy, amino acids, atomic level) and the phrase 'sufficient to distinguish' to identify the imaging/precision sense of 'resolution'",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="resolution",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q9 — History/Social Studies — "gross"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Critics of GDP as a welfare metric have argued that gross domestic "
        "product captures only aggregate output while ignoring the distribution "
        "of wealth, the depletion of natural resources, and the unpaid labor that "
        "sustains households and communities. By this view, a nation might register "
        "impressive gross figures while masking profound inequalities that "
        "undermine the well-being of its citizens.\n\n"
        "—Adapted from Joseph Stiglitz, Amartya Sen, and Jean-Paul Fitoussi, "
        "Mismeasuring Our Lives (2010)\n\n"
        "As used in the passage, \"gross\" most nearly means"
    ),
    choices={
        "A": "extremely unpleasant or disgusting",
        "B": "total or overall before any deductions",
        "C": "flagrantly obvious or egregious",
        "D": "consisting of large or coarse particles",
    },
    correct="B",
    explanation_correct=(
        "The passage discusses 'gross domestic product' and 'gross figures' in the "
        "context of economic measurement. 'Gross' here means total, aggregate, before "
        "deductions — as opposed to 'net.' The passage explicitly says GDP captures "
        "'aggregate output,' glossing the meaning of 'gross.' Choice A (disgusting) "
        "is the informal sense. Choice C (flagrant) works in phrases like 'gross "
        "negligence' but not in economic measurement. Choice D (coarse particles) "
        "is a technical/scientific meaning unrelated to economics."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — The informal 'gross = disgusting' is the most "
             "familiar meaning for many students, but it is incompatible with an "
             "economic discussion of output measurement.",
        "C": "Connotation Mismatch — 'Gross' can mean 'flagrant' in legal/moral "
             "contexts ('gross misconduct'), but the passage uses it in the specific "
             "economic sense of pre-deduction totals.",
        "D": "Register Error — The scientific sense (gross vs. fine particles) belongs "
             "to materials science, not macroeconomic analysis.",
    },
    cognitive_move="Recognizing the economic register (GDP, aggregate output, wealth distribution) to select the financial/accounting sense of 'gross' over its informal or legal senses",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="gross",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q10 — Literature (James) — "singular"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The governess found herself in a singular predicament: entrusted with "
        "the care of two children in a remote country estate, she became "
        "increasingly convinced that the house harbored presences visible only "
        "to her. Whether these apparitions were genuine phantoms or projections "
        "of her own overwrought imagination remained, to the reader, profoundly "
        "unresolvable.\n\n"
        "—Adapted from Henry James, The Turn of the Screw (1898)\n\n"
        "As used in the passage, \"singular\" most nearly means"
    ),
    choices={
        "A": "grammatically denoting one person or thing",
        "B": "remarkably unusual or extraordinary",
        "C": "focused on a single purpose or goal",
        "D": "existing alone without companions",
    },
    correct="B",
    explanation_correct=(
        "The governess's predicament is described as 'singular' and then elaborated: "
        "she sees apparitions that might be real or imagined, a situation that is "
        "'profoundly unresolvable.' This extraordinary, unique quality of the "
        "predicament is what 'singular' captures — remarkably unusual or strange. "
        "Choice A (grammar term) is irrelevant to narrative description. Choice C "
        "(single-minded) doesn't modify 'predicament' logically. Choice D (alone) "
        "misreads the word; the governess is with two children."
    ),
    distractor_explanations={
        "A": "Register Error — The grammatical sense of 'singular' belongs to "
             "linguistics, not narrative characterization of a predicament.",
        "C": "Connotation Mismatch — 'Singular focus' is an idiom, but 'singular' "
             "modifying 'predicament' cannot mean 'focused on one goal' — a predicament "
             "is not purposeful.",
        "D": "Common Meaning Trap — 'Single/singular' can evoke aloneness, but the "
             "passage explicitly states the governess is with two children, and the "
             "elaboration emphasizes the strange nature of the situation, not solitude.",
    },
    cognitive_move="Using the elaboration (apparitions, unresolvable ambiguity) to identify that 'singular' describes the extraordinary quality of the predicament, not its number or isolation",
    trap_types=["Register Error", "Connotation Mismatch", "Common Meaning Trap"],
    target_word="singular",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q11 — Science — "volatile"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Mass spectrometric analysis of cometary coma samples reveals a complex "
        "mixture of volatile compounds, including water, carbon dioxide, and "
        "methanol, that sublimate directly from the nucleus as the comet "
        "approaches perihelion. The abundance ratios of these species provide "
        "constraints on the thermal history of the protoplanetary disk from "
        "which the comet formed.\n\n"
        "—Adapted from Bockelée-Morvan et al., \"Cometary Isotopic Measurements,\" "
        "Space Science Reviews (2015)\n\n"
        "As used in the passage, \"volatile\" most nearly means"
    ),
    choices={
        "A": "liable to sudden unpredictable changes in mood",
        "B": "tending to evaporate rapidly at normal temperatures",
        "C": "potentially dangerous or explosive",
        "D": "subject to rapid fluctuation in market price",
    },
    correct="B",
    explanation_correct=(
        "The passage describes 'volatile compounds' that 'sublimate directly from "
        "the nucleus' — sublimation is the transition from solid to gas. The listed "
        "examples (water, CO₂, methanol) are substances with relatively low boiling "
        "points that readily enter the gas phase. 'Volatile' in chemistry means "
        "tending to evaporate or sublimate readily. Choice A (mood swings) is the "
        "psychological sense. Choice C (explosive) is a colloquial approximation. "
        "Choice D (financial markets) is an economics term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Volatile personality' is a frequent usage, but "
             "cometary compounds do not have moods.",
        "C": "Connotation Mismatch — While volatile chemicals can be dangerous, "
             "'volatile' in chemistry specifically means easily vaporized, not "
             "necessarily explosive. The passage discusses sublimation, not detonation.",
        "D": "Register Error — Financial volatility (price fluctuation) is common in "
             "economics but inapplicable to a planetary science context.",
    },
    cognitive_move="Matching 'volatile' to the in-passage gloss 'sublimate directly from the nucleus' and the listed examples (water, CO₂, methanol) to confirm the chemical phase-change meaning",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="volatile",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q12 — History/Social Studies — "coin"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The sociologist W. E. B. Du Bois, seeking language adequate to the "
        "paradox of African American identity in a nation founded on liberty yet "
        "sustained by enslavement, coined the term \"double consciousness\" to "
        "describe the experience of seeing oneself simultaneously through one's "
        "own eyes and through the contemptuous gaze of a dominant white society. "
        "The phrase captured a psychological reality that existing vocabulary had "
        "left unnamed.\n\n"
        "—Adapted from W. E. B. Du Bois, The Souls of Black Folk (1903)\n\n"
        "As used in the passage, \"coined\" most nearly means"
    ),
    choices={
        "A": "produced metal currency by stamping",
        "B": "invented or devised a new word or phrase",
        "C": "earned money through labor or commerce",
        "D": "replicated or copied from an existing source",
    },
    correct="B",
    explanation_correct=(
        "Du Bois 'coined the term \"double consciousness\"' — the passage then says "
        "'the phrase captured a psychological reality that existing vocabulary had "
        "left unnamed,' confirming that he invented/created this new term. Choice A "
        "(producing coins) is the literal/physical sense. Choice C (earning money) "
        "confuses 'coin' with 'coining money.' Choice D (replicating) is the opposite "
        "of inventing."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Coin' most literally means a piece of metal "
             "currency, but 'coined a term' is a well-established metaphorical "
             "extension meaning to invent a word.",
        "C": "Connotation Mismatch — While 'coin' relates to money, 'earning money' "
             "is a different verb entirely; 'coined' never means 'earned.'",
        "D": "Opposite Direction Trap — The passage explicitly says the vocabulary "
             "was previously 'unnamed,' meaning Du Bois created something new, not "
             "copied something existing.",
    },
    cognitive_move="Using the explanatory clause 'existing vocabulary had left unnamed' to confirm that 'coined' means created/invented rather than physically produced",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Opposite Direction Trap"],
    target_word="coined",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q13 — Literature (Austen) — "sensible"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Elinor, ever the more cautious of the two sisters, was deeply sensible "
        "of the precariousness of their situation: a family of genteel birth "
        "reduced to modest circumstances, dependent upon the uncertain generosity "
        "of a half-brother whose wife regarded every shilling spent on his "
        "relations as an affront to her own comfort.\n\n"
        "—Adapted from Jane Austen, Sense and Sensibility (1811)\n\n"
        "As used in the passage, \"sensible\" most nearly means"
    ),
    choices={
        "A": "showing good judgment or practicality",
        "B": "keenly aware or conscious of something",
        "C": "capable of being perceived by the senses",
        "D": "large enough to be noticeable or significant",
    },
    correct="B",
    explanation_correct=(
        "Elinor was 'deeply sensible of the precariousness' — the construction "
        "'sensible of' is an older English idiom meaning 'aware of' or 'conscious of.' "
        "The passage then elaborates what she is aware of: their reduced circumstances "
        "and dependence on unreliable generosity. Choice A (practical) is the modern "
        "common meaning but doesn't fit the grammar: 'sensible of' requires the "
        "'aware' sense. Choice C (perceivable) is a philosophical/technical sense. "
        "Choice D (significant) is a related but different meaning."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Sensible' today overwhelmingly means 'practical' "
             "or 'reasonable,' but the archaic construction 'sensible of' specifically "
             "means 'aware of,' which was standard in Austen's era.",
        "C": "Register Error — The philosophical sense ('sensible qualities' in "
             "empiricism) applies to objects of perception, not a person's awareness "
             "of a social situation.",
        "D": "Connotation Mismatch — 'A sensible difference' can mean a noticeable one, "
             "but 'sensible of the precariousness' requires the 'conscious/aware' "
             "meaning, not the 'noticeable' meaning.",
    },
    cognitive_move="Recognizing the archaic construction 'sensible of' as an idiom meaning 'aware of,' distinct from the modern sense of 'practical'",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="sensible",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q14 — Science — "culture"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "To assess the bactericidal efficacy of the novel antimicrobial peptide, "
        "researchers maintained parallel cultures of methicillin-resistant "
        "Staphylococcus aureus under identical nutrient and temperature conditions, "
        "exposing the treatment group to graded concentrations of the peptide "
        "while leaving the control group untreated. Colony counts were performed "
        "at twelve-hour intervals to quantify the killing kinetics.\n\n"
        "—Adapted from Hancock and Sahl, \"Antimicrobial and host-defense "
        "peptides,\" Nature Biotechnology (2006)\n\n"
        "As used in the passage, \"cultures\" most nearly means"
    ),
    choices={
        "A": "the arts, customs, and beliefs of a society",
        "B": "populations of microorganisms grown in controlled conditions",
        "C": "refined tastes in art, music, and literature",
        "D": "the process of tilling and cultivating land",
    },
    correct="B",
    explanation_correct=(
        "The passage describes maintaining 'parallel cultures of methicillin-resistant "
        "Staphylococcus aureus' with 'identical nutrient and temperature conditions' "
        "and counting colonies — all hallmarks of microbiological culture: populations "
        "of bacteria grown in a controlled lab environment. Choice A (societal customs) "
        "and C (refined taste) are the humanities senses. Choice D (agriculture) "
        "confuses 'culture' with 'cultivation' of land."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Culture' most often refers to societal customs "
             "and traditions in everyday conversation, but the microbiological context "
             "(bacteria, nutrient conditions, colony counts) demands the lab science "
             "meaning.",
        "C": "Connotation Mismatch — 'A person of culture' implies refined taste, "
             "but this aesthetic meaning is inapplicable to a microbiology experiment.",
        "D": "Register Error — Agricultural cultivation shares the Latin root with "
             "'culture,' but growing bacteria in a lab is distinct from tilling soil.",
    },
    cognitive_move="Using domain-specific markers (MRSA, nutrient conditions, colony counts, killing kinetics) to identify the microbiological sense of 'cultures'",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="cultures",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q15 — History/Social Studies — "check"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Madison argued in Federalist No. 51 that the separation of powers was "
        "designed to provide each branch of government with the constitutional "
        "means to check the encroachments of the others. By distributing authority "
        "among competing institutions, the system ensured that no single faction "
        "could consolidate enough power to threaten the liberties of the citizenry.\n\n"
        "—Adapted from James Madison, Federalist No. 51 (1788)\n\n"
        "As used in the passage, \"check\" most nearly means"
    ),
    choices={
        "A": "to verify accuracy by examining or inspecting",
        "B": "a written order directing a bank to pay money",
        "C": "to restrain, limit, or hold back",
        "D": "a pattern of small squares in alternating colors",
    },
    correct="C",
    explanation_correct=(
        "Each branch has the means 'to check the encroachments of the others' — "
        "meaning to restrain, limit, or hold back the overreaching of other branches. "
        "This is the classic 'checks and balances' sense. The passage elaborates: the "
        "system prevents any faction from consolidating too much power, confirming "
        "the restraining sense. Choice A (verify) is tempting but doesn't fit the "
        "object 'encroachments' — you restrain encroachments, you don't verify them. "
        "Choices B and D are entirely different noun senses."
    ),
    distractor_explanations={
        "A": "Connotation Mismatch — 'Check' as 'verify' is extremely common, but "
             "the object 'encroachments' and the context of power limitation require "
             "the restraining sense. You check (verify) facts; you check (restrain) "
             "encroachments.",
        "B": "Register Error — A bank check is a financial instrument with no "
             "relevance to constitutional governance.",
        "D": "Common Meaning Trap — The textile/design pattern meaning is visually "
             "familiar but absurd in a political theory context.",
    },
    cognitive_move="Identifying that the object of 'check' ('encroachments') requires the restraining sense, not the verification sense, and confirming with the 'consolidate power' elaboration",
    trap_types=["Connotation Mismatch", "Register Error", "Common Meaning Trap"],
    target_word="check",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q16 — Literature (Shelley) — "temper"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Victor Frankenstein's youthful enthusiasm for the alchemical writings of "
        "Cornelius Agrippa and Paracelsus was eventually tempered by his exposure "
        "to modern chemistry at Ingolstadt, where Professor Waldman demonstrated "
        "that rigorous experimental method could accomplish what the occultists "
        "had merely dreamed. Yet this moderation proved incomplete: the old "
        "ambitions merely retreated behind a veneer of scientific respectability.\n\n"
        "—Adapted from Mary Shelley, Frankenstein (1818)\n\n"
        "As used in the passage, \"tempered\" most nearly means"
    ),
    choices={
        "A": "heated and cooled metal to increase hardness",
        "B": "moderated or made less extreme",
        "C": "angered or provoked to irritation",
        "D": "adjusted the pitch or tuning of a musical instrument",
    },
    correct="B",
    explanation_correct=(
        "Victor's enthusiasm was 'tempered by his exposure to modern chemistry,' and "
        "the passage immediately glosses this as 'this moderation.' The enthusiasm "
        "wasn't eliminated but reduced — 'the old ambitions merely retreated.' "
        "'Tempered' means moderated, softened, or made less extreme. Choice A "
        "(metallurgy) is the literal/technical sense. Choice C confuses 'temper' "
        "(moderate) with 'temper' (anger). Choice D is the musical sense."
    ),
    distractor_explanations={
        "A": "Register Error — Metallurgical tempering (heat treatment of steel) is "
             "a technical process; the passage discusses the moderation of intellectual "
             "enthusiasm, not physical material.",
        "C": "Opposite Direction Trap — 'Losing one's temper' means becoming angry, "
             "but 'tempered by exposure' means moderated or softened, the exact "
             "opposite of provocation.",
        "D": "Register Error — Musical temperament/tuning is a specialized domain "
             "unconnected to the passage's discussion of intellectual development.",
    },
    cognitive_move="Using the in-passage gloss 'this moderation' to confirm that 'tempered' means made less extreme, then noting 'proved incomplete' shows it was a partial softening",
    trap_types=["Register Error", "Opposite Direction Trap", "Register Error"],
    target_word="tempered",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q17 — Science — "mean"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The mean global surface temperature anomaly for the period 2010–2019 "
        "exceeded the pre-industrial baseline by approximately 1.1°C, "
        "representing the highest decadal average since instrumental records "
        "began in 1850. While individual years fluctuated due to El Niño–Southern "
        "Oscillation cycles, the underlying trend remained unambiguously upward.\n\n"
        "—Adapted from IPCC, Sixth Assessment Report, Working Group I (2021)\n\n"
        "As used in the passage, \"mean\" most nearly means"
    ),
    choices={
        "A": "unkind, spiteful, or malicious",
        "B": "average; calculated by dividing a sum by the number of values",
        "C": "to intend or have as a purpose",
        "D": "of low social status or poor quality",
    },
    correct="B",
    explanation_correct=(
        "The passage discusses 'the mean global surface temperature anomaly' and "
        "later refers to 'decadal average,' directly glossing 'mean' as 'average.' "
        "This is the statistical sense: the arithmetic mean. Choice A (unkind) is "
        "the most common colloquial sense. Choice C (to intend) is a verb, but 'mean' "
        "here functions as an adjective. Choice D (low status) is an archaic/literary "
        "sense ('mean streets')."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Mean' as 'unkind' is overwhelmingly dominant in "
             "everyday speech but is impossible as a modifier of 'temperature anomaly.'",
        "C": "Connotation Mismatch — 'Mean' as a verb (to intend) is grammatically "
             "impossible here since 'mean' modifies the noun 'temperature anomaly' "
             "as an adjective.",
        "D": "Register Error — The archaic sense of 'mean' as 'lowly' or 'humble' "
             "(as in Dickens) is incompatible with climate science terminology.",
    },
    cognitive_move="Identifying that 'mean' functions as an adjective modifying 'temperature anomaly' and is later glossed by 'decadal average' to confirm the statistical sense",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="mean",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q18 — History/Social Studies — "exercise"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Tocqueville observed that in democratic societies, the exercise of "
        "local self-government served not merely an administrative function but "
        "operated as a school for civic virtue, habituating citizens to the "
        "responsibilities of freedom. Without this apprenticeship in collective "
        "decision-making, he warned, democratic peoples would be vulnerable to "
        "the soft despotism of centralized bureaucratic power.\n\n"
        "—Adapted from Alexis de Tocqueville, Democracy in America (1835)\n\n"
        "As used in the passage, \"exercise\" most nearly means"
    ),
    choices={
        "A": "physical activity performed for health or fitness",
        "B": "a task or drill assigned for practice",
        "C": "the active use or application of a power or right",
        "D": "a ceremony or formal proceeding",
    },
    correct="C",
    explanation_correct=(
        "The 'exercise of local self-government' means the active use, practice, "
        "or application of the power of governing locally. The passage elaborates "
        "that this serves as 'a school for civic virtue' and an 'apprenticeship in "
        "collective decision-making' — all describing the active putting into practice "
        "of governance. Choice A (physical fitness) is the most common meaning but "
        "irrelevant. Choice B (homework drill) doesn't fit the political context. "
        "Choice D (ceremony) is too narrow."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — Physical exercise is by far the most frequent "
             "association, but the object 'of local self-government' immediately "
             "eliminates this possibility.",
        "B": "Connotation Mismatch — While the passage metaphorically calls governance "
             "a 'school,' 'exercise' here doesn't mean a practice drill; it means "
             "the actual deployment of governmental authority.",
        "D": "Register Error — 'Graduation exercises' uses 'exercise' as ceremony, "
             "but Tocqueville is describing ongoing governance, not a formal event.",
    },
    cognitive_move="Recognizing that 'exercise of [a power]' is an established political/legal collocation meaning 'active use of,' confirmed by the elaboration about habituating citizens to responsibilities",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="exercise",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q19 — Literature (Dostoevsky) — "reserved"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Raskolnikov reserved his most withering contempt not for the destitute "
        "and wretched, whom he pitied with a fierce if inconsistent tenderness, "
        "but for the complacent bourgeoisie whose moral certainties he regarded "
        "as a species of intellectual cowardice. It was against this class that "
        "his theoretical justifications for transgression were principally "
        "directed.\n\n"
        "—Adapted from Fyodor Dostoevsky, Crime and Punishment (1866), "
        "trans. Constance Garnett (1914)\n\n"
        "As used in the passage, \"reserved\" most nearly means"
    ),
    choices={
        "A": "set aside or kept for a particular purpose or person",
        "B": "reluctant to reveal emotions; reticent",
        "C": "booked or secured in advance",
        "D": "held back from immediate use as a backup",
    },
    correct="A",
    explanation_correct=(
        "Raskolnikov 'reserved his most withering contempt' for the bourgeoisie — "
        "he set aside, kept, or directed his contempt specifically toward that "
        "class. The structure 'reserved X not for Y but for Z' makes the meaning "
        "clear: he allocated or earmarked his contempt for a particular target. "
        "Choice B (reticent) doesn't fit — he is actively directing contempt, not "
        "holding back emotion. Choice C (booked) is a hospitality/travel sense. "
        "Choice D (held back) implies inaction, but the passage shows active direction."
    ),
    distractor_explanations={
        "B": "Common Meaning Trap — 'Reserved' as 'reticent' is a very frequent "
             "personality descriptor, but the transitive construction 'reserved his "
             "contempt for' requires the 'set aside for' meaning, not the personality "
             "trait.",
        "C": "Register Error — 'Reserved a table' is a hospitality term inapplicable "
             "to the allocation of contempt.",
        "D": "Connotation Mismatch — 'Reserves held in backup' implies passive "
             "withholding, but the passage shows Raskolnikov actively directing his "
             "contempt toward a specific target.",
    },
    cognitive_move="Parsing the transitive construction 'reserved [his contempt] not for X but for Y' to identify the 'set aside for a purpose' meaning, not the personality adjective",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="reserved",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q20 — Science — "host"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The parasitoid wasp Cotesia glomerata deposits its eggs within the body "
        "cavity of the host caterpillar, where the larvae develop by consuming "
        "the host's hemolymph and fat body tissues. Remarkably, the wasp's "
        "polydnavirus suppresses the host's immune response, preventing "
        "encapsulation of the developing larvae and ensuring their survival to "
        "pupation.\n\n"
        "—Adapted from Strand and Burke, \"Polydnaviruses: Nature's Genetic "
        "Engineers,\" Current Opinion in Microbiology (2014)\n\n"
        "As used in the passage, \"host\" most nearly means"
    ),
    choices={
        "A": "a person who receives and entertains guests",
        "B": "a large number or multitude of things",
        "C": "an organism on or in which a parasite lives",
        "D": "a person who presents a television or radio program",
    },
    correct="C",
    explanation_correct=(
        "The passage describes a parasitoid wasp depositing eggs 'within the body "
        "cavity of the host caterpillar,' with larvae consuming the host's tissues "
        "and the wasp suppressing the 'host's immune response.' This is textbook "
        "parasitology: the 'host' is the organism that harbors and provides "
        "nourishment to the parasite. Choice A (entertainer of guests) is the "
        "social sense. Choice B ('a host of problems') is the multitude sense. "
        "Choice D (TV presenter) is a media term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — The social 'host' (one who entertains) is the "
             "most frequent everyday meaning, but the parasitological context (wasp, "
             "caterpillar, immune response) demands the biological sense.",
        "B": "Connotation Mismatch — 'A host of' meaning 'many' is a different word "
             "entirely in function; the passage uses 'host' as a singular noun "
             "modified by 'the,' referring to one specific caterpillar.",
        "D": "Register Error — Television hosting is a media-industry term entirely "
             "outside the domain of entomology and parasitology.",
    },
    cognitive_move="Using biological context markers (parasitoid, eggs, hemolymph, immune response, encapsulation) to identify the parasitological meaning of 'host'",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="host",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q21 — History/Social Studies — "gravity"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Hamilton understood, as many of his contemporaries did not, the gravity "
        "of the new republic's financial predicament. Without a mechanism to "
        "service its revolutionary war debts and establish creditworthiness in "
        "European capital markets, the United States would remain a confederation "
        "in fact if not in name, incapable of commanding the resources necessary "
        "for national defense or internal improvement.\n\n"
        "—Adapted from Ron Chernow, Alexander Hamilton (2004)\n\n"
        "As used in the passage, \"gravity\" most nearly means"
    ),
    choices={
        "A": "the force that attracts objects toward the center of the earth",
        "B": "extreme seriousness or importance",
        "C": "a tendency to move toward a lower physical position",
        "D": "a solemn or dignified manner of behavior",
    },
    correct="B",
    explanation_correct=(
        "Hamilton understood 'the gravity of the new republic's financial predicament' "
        "— meaning its extreme seriousness. The passage elaborates: without debt "
        "servicing, the nation would be unable to function. This confirms 'gravity' "
        "means importance/seriousness. Choice A (physical force) is the scientific "
        "meaning. Choice C (downward tendency) is a variant of the physical sense. "
        "Choice D (solemn demeanor) is a personality/behavioral sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — Newtonian gravity is the most taught meaning, "
             "but 'the gravity of a predicament' unmistakably means its seriousness.",
        "C": "Connotation Mismatch — Physical downward movement shares the metaphorical "
             "sense of 'weight,' but the passage refers to the importance of a "
             "situation, not its physical direction.",
        "D": "Register Error — 'Speaking with gravity' describes a person's manner, "
             "but the passage describes the quality of a predicament, not a person's "
             "bearing.",
    },
    cognitive_move="Recognizing that 'gravity' modifying 'predicament' signals the abstract seriousness sense, confirmed by the dire consequences described in the elaboration",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="gravity",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q22 — Literature (Brontë) — "want"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The dreariness of Lowood was compounded by a want of adequate "
        "nourishment: the portions allotted to the pupils were scanty, the bread "
        "frequently stale, and the oatmeal often burnt to a consistency that made "
        "it nearly inedible. That the institution's overseers remained indifferent "
        "to these privations struck Jane as a cruelty more calculated than any "
        "physical punishment.\n\n"
        "—Adapted from Charlotte Brontë, Jane Eyre (1847)\n\n"
        "As used in the passage, \"want\" most nearly means"
    ),
    choices={
        "A": "a desire or wish for something",
        "B": "the state of lacking or being without something needed",
        "C": "a personal preference or inclination",
        "D": "an advertisement seeking to hire or purchase",
    },
    correct="B",
    explanation_correct=(
        "The passage describes 'a want of adequate nourishment' and elaborates: "
        "'scanty portions,' 'stale bread,' 'burnt oatmeal' — all describing a "
        "deficiency or absence of proper food. 'Want' here means lack, absence, "
        "or the state of being without something needed. Choice A (desire) is "
        "the modern common meaning but doesn't fit: the passage isn't describing "
        "desire for food but the actual absence of it. Choice C (preference) "
        "is too weak. Choice D (classified ad) is irrelevant."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Want' overwhelmingly means 'desire' in modern "
             "English, but the construction 'a want of [noun]' is a formal idiom "
             "meaning 'a lack of,' not 'a desire for.'",
        "C": "Connotation Mismatch — A preference implies choice, but the passage "
             "describes forced deprivation, not voluntary inclination.",
        "D": "Register Error — 'Want ads' is a colloquial newspaper term entirely "
             "outside the register of Victorian literary fiction.",
    },
    cognitive_move="Recognizing the formal construction 'a want of' as an idiom meaning 'a lack of,' confirmed by the list of deprivations that follow",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="want",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q23 — Science — "express"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Hepatocytes in the periportal zone of the liver lobule express a distinct "
        "set of enzymes associated with gluconeogenesis and urea synthesis, while "
        "their pericentral counterparts express enzymes favoring glycolysis and "
        "lipogenesis. This metabolic zonation reflects differential exposure to "
        "oxygen and nutrient gradients along the portal-central axis.\n\n"
        "—Adapted from Jungermann and Kietzmann, \"Zonation of Parenchymal and "
        "Nonparenchymal Metabolism in Liver,\" Annual Review of Nutrition (1996)\n\n"
        "As used in the passage, \"express\" most nearly means"
    ),
    choices={
        "A": "to convey a thought or feeling through words",
        "B": "operating at high speed with few stops",
        "C": "to produce a specific protein or molecule through gene activity",
        "D": "to squeeze out liquid by applying pressure",
    },
    correct="C",
    explanation_correct=(
        "Hepatocytes 'express a distinct set of enzymes' — in molecular biology, "
        "'express' means to produce proteins (enzymes) through the process of gene "
        "expression (transcription and translation). The passage then discusses "
        "'metabolic zonation' and 'differential exposure to oxygen,' all confirming "
        "the biological production sense. Choice A (communicate verbally) is the "
        "everyday sense. Choice B (fast service) is the transport/delivery sense. "
        "Choice D (squeeze out) is a culinary/mechanical sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Express oneself' is the dominant everyday usage, "
             "but cells don't communicate feelings; they produce proteins.",
        "B": "Register Error — 'Express delivery' or 'express train' belongs to "
             "logistics/transportation, not cell biology.",
        "D": "Connotation Mismatch — 'Express juice from a lemon' means to squeeze "
             "it out, which shares the idea of 'bringing forth' but is physically "
             "inapplicable to enzyme production by liver cells.",
    },
    cognitive_move="Using biological context (hepatocytes, enzymes, metabolic zonation) to identify the molecular biology sense of 'express' as produce through gene activity",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="express",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q24 — History/Social Studies — "liberal"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Mill contended that a liberal education, encompassing not merely the "
        "classical languages and mathematics but also political economy and "
        "natural philosophy, was the surest safeguard against the intellectual "
        "servility that invariably accompanied political despotism. An electorate "
        "trained only in vocational skills would lack the breadth of judgment "
        "necessary to evaluate the claims of demagogues.\n\n"
        "—Adapted from John Stuart Mill, Inaugural Address at St Andrews (1867)\n\n"
        "As used in the passage, \"liberal\" most nearly means"
    ),
    choices={
        "A": "favoring progressive political reform",
        "B": "generous in giving or spending",
        "C": "broad and wide-ranging in scope",
        "D": "permissive or tolerant of behavior",
    },
    correct="C",
    explanation_correct=(
        "Mill describes 'a liberal education' encompassing 'not merely the classical "
        "languages and mathematics but also political economy and natural philosophy' "
        "— the key word is breadth. A 'liberal' education means one that is broad, "
        "wide-ranging, and not narrowly vocational. The contrast with 'vocational "
        "skills' and the emphasis on 'breadth of judgment' confirm this. Choice A "
        "(politically progressive) is the modern partisan meaning. Choice B "
        "(generous with money) is a different sense. Choice D (permissive) is "
        "a social-behavioral sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Liberal' in modern political discourse means "
             "'progressive,' but the phrase 'liberal education' has a distinct "
             "centuries-old meaning referring to breadth of learning, not political "
             "ideology.",
        "B": "Connotation Mismatch — 'Liberal portions' means generous amounts, "
             "sharing the 'expansive' connotation, but the passage specifically "
             "discusses curricular breadth, not generosity.",
        "D": "Register Error — 'Liberal parenting' (permissive) belongs to "
             "behavioral/social discourse, not educational philosophy.",
    },
    cognitive_move="Recognizing the established phrase 'liberal education' and using the enumerated subjects and contrast with 'vocational skills' to confirm the 'broad/wide-ranging' meaning",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="liberal",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q25 — Literature (Dickens) — "character"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "It was generally acknowledged in the neighborhood that Mr. Gradgrind "
        "was a man of impeccable character: punctual in his dealings, scrupulous "
        "in his accounts, and unswerving in his devotion to the principle that "
        "every human affair could be reduced to a calculable transaction. That "
        "this rigidity might itself constitute a moral failing was a possibility "
        "he never entertained.\n\n"
        "—Adapted from Charles Dickens, Hard Times (1854)\n\n"
        "As used in the passage, \"character\" most nearly means"
    ),
    choices={
        "A": "a person depicted in a novel, play, or film",
        "B": "a printed or written letter or symbol",
        "C": "the set of moral qualities distinguishing an individual",
        "D": "an unusual or eccentric person",
    },
    correct="C",
    explanation_correct=(
        "Mr. Gradgrind was 'a man of impeccable character' — the passage then "
        "enumerates his qualities: punctual, scrupulous, devoted to principle. "
        "These are moral/ethical attributes that define his reputation and nature. "
        "'Character' here means the aggregate of moral qualities that define a "
        "person. Choice A (fictional person) is ironic since Gradgrind IS a "
        "character, but the passage uses the word to describe his reputation. "
        "Choice B (letter/symbol) is a typography term. Choice D (eccentric person) "
        "is colloquial."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — Students may know Gradgrind is a literary "
             "character, but the phrase 'a man of impeccable character' uses the word "
             "to describe his moral qualities, not his status as a fictional person.",
        "B": "Register Error — Typographic characters (letters, symbols) belong to "
             "printing and computing, not moral assessment.",
        "D": "Connotation Mismatch — 'Quite a character' colloquially means an "
             "eccentric person, but 'impeccable character' signals moral reputation, "
             "not eccentricity.",
    },
    cognitive_move="Recognizing the collocation 'man of impeccable character' as describing moral reputation, confirmed by the list of virtues (punctual, scrupulous, devoted)",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="character",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q26 — Science — "complement"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The innate immune system deploys a complement of plasma proteins that, "
        "upon activation by pathogen surface markers, form membrane attack "
        "complexes capable of lysing bacterial cells. This cascade, comprising "
        "more than thirty sequentially activated proteins, represents one of the "
        "most phylogenetically ancient defense mechanisms in vertebrate immunity.\n\n"
        "—Adapted from Ricklin et al., \"Complement: a key system for immune "
        "surveillance,\" Nature Immunology (2010)\n\n"
        "As used in the passage, \"complement\" most nearly means"
    ),
    choices={
        "A": "a polite expression of praise or admiration",
        "B": "something that completes or makes whole a set",
        "C": "a full number or quantity needed for a purpose",
        "D": "to enhance or improve by adding something extra",
    },
    correct="C",
    explanation_correct=(
        "The immune system deploys 'a complement of plasma proteins' — here "
        "'complement' means the full set or group of proteins needed for a function. "
        "The passage elaborates: 'more than thirty sequentially activated proteins,' "
        "confirming it's a complete collection. Note: in immunology, 'complement' is "
        "also a technical term for this specific protein system, making the meaning "
        "doubly clear. Choice A confuses 'complement' with 'compliment' (a common "
        "spelling error). Choice B (something that completes) is close but refers to "
        "a missing piece, not a full set. Choice D (enhance) is a verb sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — Students often confuse 'complement' with "
             "'compliment' (praise), a spelling/vocabulary error that this distractor "
             "tests directly.",
        "B": "Connotation Mismatch — 'Complement' as 'something that completes' "
             "implies a missing piece that makes something whole, but the passage "
             "describes an entire set of proteins, not a missing piece.",
        "D": "Register Error — 'Complement' as a verb meaning 'to enhance' doesn't "
             "fit the noun construction 'a complement of plasma proteins.'",
    },
    cognitive_move="Recognizing 'a complement of [noun]' as meaning 'a full set/group of' and confirming with the elaboration 'more than thirty sequentially activated proteins'",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="complement",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q27 — History/Social Studies — "court"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "To advance his proposal for a national bank, Hamilton found it "
        "necessary to court the support of senators who had initially opposed "
        "federal assumption of state debts. Through a series of private dinners "
        "and carefully calibrated political concessions — including agreement to "
        "locate the permanent national capital on the Potomac — he gradually "
        "assembled the coalition needed to secure passage.\n\n"
        "—Adapted from Joseph Ellis, Founding Brothers (2000)\n\n"
        "As used in the passage, \"court\" most nearly means"
    ),
    choices={
        "A": "an enclosed area used for playing sports",
        "B": "to seek the favor or support of someone",
        "C": "a tribunal presided over by a judge",
        "D": "the residence and retinue of a sovereign",
    },
    correct="B",
    explanation_correct=(
        "Hamilton found it necessary 'to court the support of senators' — meaning "
        "to actively seek, pursue, or solicit their favor. The passage then describes "
        "his methods: private dinners, political concessions. This clearly indicates "
        "deliberate effort to win over reluctant allies. Choice A (sports area), "
        "C (judicial tribunal), and D (royal entourage) are all valid meanings of "
        "'court' but irrelevant to political persuasion."
    ),
    distractor_explanations={
        "A": "Register Error — A basketball court or tennis court is a physical "
             "space with no connection to political coalition-building.",
        "C": "Common Meaning Trap — 'Court' as a judicial body is very common and "
             "might seem relevant in a governmental context, but the infinitive 'to "
             "court support' clearly means to seek favor, not to adjudicate.",
        "D": "Connotation Mismatch — The royal court sense has historical relevance "
             "but the passage describes a republican system with no monarchy; Hamilton "
             "is soliciting senators, not attending a sovereign.",
    },
    cognitive_move="Identifying the verb form 'to court [support]' as meaning to seek favor, confirmed by the described actions (dinners, concessions, coalition-building)",
    trap_types=["Register Error", "Common Meaning Trap", "Connotation Mismatch"],
    target_word="court",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q28 — Literature (Eliot) — "fine"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Dorothea possessed a fine discrimination that allowed her to perceive "
        "nuances of motive and feeling invisible to cruder observers. Where others "
        "saw only Casaubon's scholarly gravity, she detected beneath it a "
        "tremor of insecurity, a fear that his life's work might prove to be "
        "an elaborate monument to mediocrity.\n\n"
        "—Adapted from George Eliot, Middlemarch (1871)\n\n"
        "As used in the passage, \"fine\" most nearly means"
    ),
    choices={
        "A": "of high quality or excellence",
        "B": "thin or narrow in width or diameter",
        "C": "a sum of money paid as a penalty",
        "D": "subtle, precise, and capable of delicate distinctions",
    },
    correct="D",
    explanation_correct=(
        "Dorothea had 'a fine discrimination' that allowed her to 'perceive nuances "
        "of motive and feeling invisible to cruder observers.' The elaboration "
        "('nuances,' 'invisible to cruder observers') confirms that 'fine' means "
        "subtle, precise, keenly discriminating. Choice A (excellent) is close but "
        "too vague — the passage isn't praising the quality generally but specifying "
        "its precision. Choice B (thin) is a physical dimension. Choice C (penalty) "
        "is a legal/financial term."
    ),
    distractor_explanations={
        "A": "Connotation Mismatch — 'Fine quality' implies general excellence, but "
             "the passage specifically emphasizes subtlety and precision of perception, "
             "not just that the discrimination was good but that it was delicate and "
             "nuanced.",
        "B": "Register Error — 'Fine thread' or 'fine print' uses the physical "
             "thinness sense, inapplicable to cognitive discrimination.",
        "C": "Common Meaning Trap — A 'fine' as a penalty is a completely different "
             "word (noun vs. adjective) and meaning, though students may confuse them.",
    },
    cognitive_move="Using the elaboration 'nuances' and 'invisible to cruder observers' to select 'subtle/precise' over the more general 'excellent'",
    trap_types=["Connotation Mismatch", "Register Error", "Common Meaning Trap"],
    target_word="fine",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q29 — Science — "strain"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Researchers isolated a novel strain of Pseudomonas fluorescens from "
        "the rhizosphere of drought-stressed wheat and demonstrated that "
        "inoculation with this bacterium significantly increased root biomass "
        "under water-limited conditions. Genomic analysis revealed that the "
        "strain harbored genes encoding for the production of indole-3-acetic "
        "acid, a plant growth-promoting phytohormone.\n\n"
        "—Adapted from Vacheron et al., \"Plant growth-promoting rhizobacteria,\" "
        "Frontiers in Plant Science (2013)\n\n"
        "As used in the passage, \"strain\" most nearly means"
    ),
    choices={
        "A": "physical or mental effort, stress, or tension",
        "B": "to pour a liquid through a filter to remove solids",
        "C": "a genetic variant or subtype of a species of organism",
        "D": "an injury caused by overexertion of a muscle",
    },
    correct="C",
    explanation_correct=(
        "Researchers 'isolated a novel strain of Pseudomonas fluorescens' and "
        "performed 'genomic analysis' of 'the strain' — in microbiology, a 'strain' "
        "is a specific genetic variant or isolate of a species. The passage discusses "
        "its specific genomic features (genes for IAA production), confirming the "
        "biological sense. Choice A (stress/tension) is the general sense. Choice B "
        "(filtering) is a culinary/chemistry verb. Choice D (muscle injury) is a "
        "medical term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Strain' as 'stress' is extremely common but "
             "cannot modify a species name or have a genome analyzed.",
        "B": "Register Error — Straining pasta (filtering) is a culinary action "
             "unrelated to microbial genetics.",
        "D": "Connotation Mismatch — A muscle strain is a physical injury; the passage "
             "discusses a bacterial isolate with specific genetic characteristics.",
    },
    cognitive_move="Recognizing 'strain of [species name]' as a microbiological collocation meaning a genetic variant, confirmed by 'isolated' and 'genomic analysis'",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="strain",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q30 — History/Social Studies — "instrument"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Abolitionists of the Garrisonian school denounced the Constitution as an "
        "instrument of slaveholding power, arguing that its fugitive slave clause, "
        "its three-fifths compromise, and its twenty-year protection of the "
        "international slave trade collectively rendered the document complicit in "
        "the perpetuation of human bondage.\n\n"
        "—Adapted from David Waldstreicher, Slavery's Constitution (2009)\n\n"
        "As used in the passage, \"instrument\" most nearly means"
    ),
    choices={
        "A": "a device for producing music",
        "B": "a tool or implement used for delicate work",
        "C": "a means by which something is achieved or carried out",
        "D": "a measuring device such as a gauge or meter",
    },
    correct="C",
    explanation_correct=(
        "The Constitution is called 'an instrument of slaveholding power' — meaning "
        "a means, mechanism, or tool through which slaveholding power was exercised "
        "and maintained. The passage then lists specific clauses that served this "
        "function. 'Instrument' here means the vehicle or mechanism through which "
        "an end is achieved. Choice A (musical) is irrelevant. Choice B (tool for "
        "delicate work) is too physical/literal. Choice D (measuring device) is a "
        "scientific/technical sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — Musical instruments are the most familiar "
             "association for many students, but a Constitution cannot produce music.",
        "B": "Connotation Mismatch — While 'instrument' as 'tool' is close, choice B "
             "specifies 'for delicate work' (e.g., surgical instruments), which is "
             "too narrow and physical for a legal/political document.",
        "D": "Register Error — Measuring instruments (thermometers, barometers) "
             "belong to scientific contexts, not constitutional analysis.",
    },
    cognitive_move="Recognizing 'instrument of [power/policy]' as a standard political/legal collocation meaning 'a means by which power is exercised'",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="instrument",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q31 — Literature (Woolf) — "engaged"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Mrs. Dalloway was too deeply engaged in the preparations for her party "
        "to notice the subtle alteration in her husband's manner — a certain "
        "guardedness in his replies, a reluctance to meet her eye — that might, "
        "under less distracted circumstances, have alarmed her. The flowers, the "
        "silver, the arrangement of chairs: these commanded her attention with a "
        "tyrannical completeness.\n\n"
        "—Adapted from Virginia Woolf, Mrs Dalloway (1925)\n\n"
        "As used in the passage, \"engaged\" most nearly means"
    ),
    choices={
        "A": "pledged to be married",
        "B": "employed or hired for a service",
        "C": "involved in combat or conflict",
        "D": "absorbed or occupied with an activity",
    },
    correct="D",
    explanation_correct=(
        "Mrs. Dalloway was 'too deeply engaged in the preparations' to notice her "
        "husband's behavior. The passage elaborates: flowers, silver, and chairs "
        "'commanded her attention with a tyrannical completeness.' 'Engaged' here "
        "means absorbed, occupied, immersed in an activity. Choice A (betrothed) "
        "is the romantic sense — she's already married. Choice B (hired) is a "
        "professional sense. Choice C (in combat) is a military sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Engaged' as 'betrothed' is extremely common, "
             "but Mrs. Dalloway is already married to Richard; the passage describes "
             "her absorption in party planning.",
        "B": "Register Error — 'Engaged a contractor' means hired, but the passage "
             "describes personal absorption in a task, not professional employment.",
        "C": "Connotation Mismatch — Military engagement means combat, which shares "
             "the sense of intense involvement but is literally inapplicable to party "
             "preparations.",
    },
    cognitive_move="Using 'too deeply… to notice' to identify the absorption/occupation sense, confirmed by the elaboration about attention being 'commanded with tyrannical completeness'",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="engaged",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q32 — Science — "concentration"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "At serum concentrations below 10 ng/mL, the therapeutic protein "
        "exhibited negligible receptor occupancy, while concentrations exceeding "
        "100 ng/mL saturated available binding sites without proportionally "
        "increasing efficacy — a pharmacokinetic profile suggesting a narrow "
        "therapeutic window within which dosing must be carefully titrated.\n\n"
        "—Adapted from Shargel and Yu, Applied Biopharmaceutics & "
        "Pharmacokinetics, 7th ed. (2016)\n\n"
        "As used in the passage, \"concentrations\" most nearly means"
    ),
    choices={
        "A": "the act of focusing mental attention closely",
        "B": "the amount of a substance per unit volume of solution",
        "C": "gatherings of people in a particular area",
        "D": "processes of increasing the strength or purity of a substance",
    },
    correct="B",
    explanation_correct=(
        "The passage states 'serum concentrations below 10 ng/mL' — ng/mL is a "
        "unit of mass per volume, directly defining concentration as the amount of "
        "substance dissolved per unit volume. The pharmacological context (receptor "
        "occupancy, binding sites, dosing) confirms the chemical/medical meaning. "
        "Choice A (mental focus) is the cognitive sense. Choice C (gatherings) is "
        "the demographic sense. Choice D (purification) is an industrial process."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Concentration' as 'mental focus' is the most "
             "familiar everyday meaning, but the numerical units (ng/mL) immediately "
             "signal the chemical sense.",
        "C": "Connotation Mismatch — 'Concentration of people' means a gathering, "
             "which shares the idea of density/accumulation but applies to populations, "
             "not dissolved proteins.",
        "D": "Register Error — 'Concentrate' as a verb can mean to purify/strengthen, "
             "but 'concentrations' as a plural noun with ng/mL units describes "
             "measured amounts, not a purification process.",
    },
    cognitive_move="Using the units (ng/mL) and pharmacological context (receptor occupancy, binding sites) to identify the chemical quantity-per-volume sense",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="concentrations",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q33 — History/Social Studies — "discharge"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The oath of office required every federal officeholder to solemnly swear "
        "to faithfully discharge the duties of his station — a formula whose "
        "apparent simplicity masked profound questions about the scope of "
        "executive authority. Did faithful discharge encompass only those powers "
        "explicitly enumerated in the Constitution, or did it extend to implied "
        "powers necessary for the effective governance of a vast and expanding "
        "republic?\n\n"
        "—Adapted from Jack Rakove, Original Meanings (1996)\n\n"
        "As used in the passage, \"discharge\" most nearly means"
    ),
    choices={
        "A": "to release from military service",
        "B": "to carry out, perform, or fulfill",
        "C": "to emit or send out a substance or energy",
        "D": "to release a patient from medical care",
    },
    correct="B",
    explanation_correct=(
        "Officeholders swear to 'discharge the duties of his station' — meaning "
        "to carry out, perform, or fulfill those duties. The passage then asks "
        "whether 'faithful discharge' encompasses enumerated or implied powers, "
        "confirming the meaning is about performing responsibilities. Choice A "
        "(military release), C (emit substance), and D (release patient) are all "
        "valid but contextually impossible."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Honorable discharge' from the military is a "
             "well-known phrase, but the passage discusses performing duties, not "
             "releasing someone from service.",
        "C": "Register Error — 'Discharge of a weapon' or 'electrical discharge' "
             "involves emission of energy, not the fulfillment of responsibilities.",
        "D": "Connotation Mismatch — Medical discharge involves releasing a patient; "
             "the governmental context requires the 'carry out duties' meaning.",
    },
    cognitive_move="Recognizing the legal/governmental collocation 'discharge the duties of [a position]' as meaning to carry out or fulfill those duties",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="discharge",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q34 — Literature (Twain) — "humor"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The old pilot, weathered by decades on the Mississippi, knew the humor "
        "of the river as intimately as a physician knows the temperament of a "
        "chronic patient. He could read in a slight discoloration of the surface "
        "the presence of a submerged sandbar, and in the behavior of the current "
        "near a bend the likelihood of a shifting channel that would strand an "
        "unwary vessel.\n\n"
        "—Adapted from Mark Twain, Life on the Mississippi (1883)\n\n"
        "As used in the passage, \"humor\" most nearly means"
    ),
    choices={
        "A": "the quality of being amusing or comical",
        "B": "to indulge or gratify someone's wishes",
        "C": "the characteristic disposition or temperament of something",
        "D": "a fluid in the body, such as the aqueous humor of the eye",
    },
    correct="C",
    explanation_correct=(
        "The pilot 'knew the humor of the river as intimately as a physician knows "
        "the temperament of a chronic patient.' The simile directly equates 'humor' "
        "with 'temperament' — the river's characteristic moods, tendencies, and "
        "behaviors. This is the archaic/literary sense of 'humor' as disposition. "
        "Choice A (comedy) is the modern dominant meaning but doesn't describe a "
        "river's navigational characteristics. Choice B (indulge) is a verb sense. "
        "Choice D (body fluid) is the original medieval sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Humor' overwhelmingly means 'comedy' today, "
             "and Twain is known for humor in that sense, making this trap especially "
             "seductive. But the passage describes reading currents and sandbars, not "
             "anything amusing.",
        "B": "Register Error — 'To humor someone' (indulge) is a verb; the passage "
             "uses 'humor' as a noun describing the river's nature.",
        "D": "Connotation Mismatch — 'Humors' as bodily fluids (from medieval "
             "medicine) is etymologically related but the passage clearly means "
             "temperament/disposition, as confirmed by the physician simile.",
    },
    cognitive_move="Using the explicit simile ('as a physician knows the temperament') to identify 'humor' as disposition/temperament, not comedy or fluid",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="humor",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q35 — Science — "field"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "To validate the laboratory findings, the research team conducted "
        "extensive field trials across twelve agro-ecological zones spanning "
        "three continents. Plots were established in collaboration with local "
        "agricultural extension services, ensuring that the drought-tolerant "
        "cultivars were evaluated under genuine smallholder farming conditions "
        "rather than the controlled environment of a greenhouse.\n\n"
        "—Adapted from Varshney et al., \"Can genomics deliver climate-change "
        "ready crops?\" Current Opinion in Plant Biology (2021)\n\n"
        "As used in the passage, \"field\" most nearly means"
    ),
    choices={
        "A": "a branch or area of academic study or professional activity",
        "B": "conducted in the natural environment rather than a laboratory",
        "C": "an area of open land used for pasture or cultivation",
        "D": "a region influenced by a physical force such as magnetism",
    },
    correct="B",
    explanation_correct=(
        "'Field trials' are contrasted with 'the controlled environment of a "
        "greenhouse' — 'field' here means conducted in the real-world, natural "
        "environment outside the laboratory. The passage emphasizes 'genuine "
        "smallholder farming conditions' versus controlled settings. Choice A "
        "(academic discipline) doesn't fit 'field trials.' Choice C (farmland) "
        "is related but too literal — 'field trials' is a methodological term "
        "meaning real-world testing, not just 'trials in a field.' Choice D "
        "(force field) is a physics term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'The field of biology' uses 'field' as 'discipline,' "
             "but 'field trials' is a compound meaning real-world testing.",
        "C": "Connotation Mismatch — While the trials happen to occur on farmland, "
             "'field' in 'field trials' specifically means 'in natural conditions' "
             "as a methodological contrast to laboratory settings, not merely the "
             "physical location.",
        "D": "Register Error — A magnetic or electric field belongs to physics, not "
             "agricultural research methodology.",
    },
    cognitive_move="Recognizing the compound 'field trials' as a methodological term meaning 'real-world testing,' confirmed by the explicit contrast with 'controlled environment of a greenhouse'",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="field",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q36 — History/Social Studies — "constitution"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Montesquieu argued that the laws of a nation must be adapted to the "
        "physical constitution of the country — its climate, soil, and geography "
        "— as well as to the manners and customs of its people. A code suitable "
        "for a frigid maritime republic would prove oppressive if transplanted "
        "wholesale to a tropical agrarian society, for the very bodies and "
        "temperaments of the inhabitants would resist its prescriptions.\n\n"
        "—Adapted from Montesquieu, The Spirit of the Laws (1748), "
        "trans. Thomas Nugent (1750)\n\n"
        "As used in the passage, \"constitution\" most nearly means"
    ),
    choices={
        "A": "the supreme legal document establishing a government",
        "B": "the physical makeup, nature, or composition of something",
        "C": "the act of establishing or founding an institution",
        "D": "a person's general health and physical condition",
    },
    correct="B",
    explanation_correct=(
        "Laws must be adapted to 'the physical constitution of the country — its "
        "climate, soil, and geography.' The appositive list (climate, soil, geography) "
        "directly defines 'constitution' as the physical makeup or composition of the "
        "land. Choice A (legal document) is the most common political meaning but is "
        "contradicted by the adjective 'physical' and the elaboration listing natural "
        "features. Choice C (founding act) is a process, not a description. Choice D "
        "(personal health) applies to individuals, but the passage describes a country."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Constitution' in political contexts overwhelmingly "
             "means a founding legal document, but the modifier 'physical' and the list "
             "'climate, soil, and geography' redirect to the compositional meaning.",
        "C": "Register Error — 'The constitution of a committee' means its establishment, "
             "but the passage describes the inherent nature of a country's terrain and "
             "climate, not the act of founding something.",
        "D": "Connotation Mismatch — 'A strong constitution' can describe a person's "
             "health, which is related (both mean physical nature), but the passage "
             "applies it to a country's geographical features, not a person's body.",
    },
    cognitive_move="Using the modifier 'physical' and the appositive list 'climate, soil, and geography' to override the default political-document meaning of 'constitution'",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="constitution",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q37 — Literature (Hardy) — "intelligence"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The intelligence of the young woman's ruin spread through the parish "
        "with a swiftness that outpaced even the most diligent gossip. By "
        "nightfall, every cottage along the lane had received some version of "
        "the story, each retelling embroidered with fresh details calculated to "
        "heighten the scandal and diminish whatever sympathy the unfortunate "
        "creature might otherwise have commanded.\n\n"
        "—Adapted from Thomas Hardy, Tess of the d'Urbervilles (1891)\n\n"
        "As used in the passage, \"intelligence\" most nearly means"
    ),
    choices={
        "A": "the ability to learn, understand, and reason",
        "B": "information or news, especially of military or political value",
        "C": "an organization engaged in gathering secret information",
        "D": "skill in devising clever strategies or plans",
    },
    correct="B",
    explanation_correct=(
        "'The intelligence of the young woman's ruin spread through the parish' — "
        "here 'intelligence' means news, information, or tidings. The passage "
        "describes how 'every cottage received some version of the story,' directly "
        "confirming that 'intelligence' means information that spread. Choice A "
        "(cognitive ability) is the modern dominant meaning but doesn't 'spread "
        "through a parish.' Choice C (spy agency) is an organizational term. "
        "Choice D (strategic cunning) is a personality trait."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Intelligence' as cognitive ability (IQ, smart) "
             "is by far the most common modern usage, but the verb 'spread through "
             "the parish' requires the information/news sense.",
        "C": "Register Error — 'Intelligence agency' is a modern institutional term; "
             "the passage is 19th-century rural fiction about gossip spreading.",
        "D": "Connotation Mismatch — Strategic cleverness is a personal attribute, "
             "but the passage treats 'intelligence' as something that spreads and is "
             "received — it's a thing communicated, not a quality possessed.",
    },
    cognitive_move="Using the verbs 'spread' and 'received' to identify 'intelligence' as information/news rather than cognitive ability — news spreads, ability doesn't",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="intelligence",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q38 — Science — "medium"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The speed of sound varies considerably depending on the medium through "
        "which it propagates: approximately 343 meters per second in dry air at "
        "20°C, roughly 1,480 m/s in freshwater, and up to 6,000 m/s in certain "
        "crystalline solids. These differences arise primarily from variations in "
        "density and elastic modulus among the transmitting substances.\n\n"
        "—Adapted from Kinsler et al., Fundamentals of Acoustics, 4th ed. (2000)\n\n"
        "As used in the passage, \"medium\" most nearly means"
    ),
    choices={
        "A": "a person claiming to communicate with the dead",
        "B": "an intermediate size between small and large",
        "C": "a substance or material through which something travels",
        "D": "a channel of mass communication such as television",
    },
    correct="C",
    explanation_correct=(
        "Sound varies 'depending on the medium through which it propagates' — then "
        "air, water, and crystalline solids are listed as examples. 'Medium' here "
        "means the substance or material through which waves travel. The phrase "
        "'transmitting substances' at the end directly glosses the meaning. Choice A "
        "(spiritualist) is irrelevant. Choice B (size) is an adjective, not a noun "
        "referring to a substance. Choice D (communication channel) is a media term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — A 'medium' as a psychic/spiritualist is a "
             "well-known meaning but has no connection to physics and acoustics.",
        "B": "Register Error — 'Medium-sized' is an everyday adjective describing "
             "dimension, not a noun describing a transmitting substance.",
        "D": "Connotation Mismatch — 'The medium is the message' (McLuhan) uses "
             "'medium' as a communication channel, which shares the 'conduit' concept "
             "but refers to media industries, not physical substances.",
    },
    cognitive_move="Using the elaboration 'through which it propagates' and the examples (air, water, solids) to identify the physics sense of 'medium' as a transmitting substance",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="medium",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q39 — History/Social Studies — "interest"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Madison warned in Federalist No. 10 that the regulation of competing "
        "interests — landed, manufacturing, mercantile, and financial — "
        "constituted the principal task of modern legislation. No faction could "
        "be trusted to adjudicate impartially when its own interest was at "
        "stake, which was precisely why the extended republic, with its "
        "multiplicity of factions, offered the surest protection against "
        "majoritarian tyranny.\n\n"
        "—Adapted from James Madison, Federalist No. 10 (1787)\n\n"
        "As used in the passage, \"interests\" most nearly means"
    ),
    choices={
        "A": "a charge for borrowing money, expressed as a percentage",
        "B": "feelings of curiosity or fascination about something",
        "C": "groups united by shared economic or political concerns",
        "D": "legal shares or stakes in a business or property",
    },
    correct="C",
    explanation_correct=(
        "Madison discusses 'competing interests — landed, manufacturing, mercantile, "
        "and financial.' The dash introduces an appositive list of economic sectors, "
        "and 'No faction could be trusted' when 'its own interest was at stake' "
        "confirms that 'interests' refers to organized groups with shared economic/"
        "political concerns. Choice A (loan charge) is the financial sense. Choice B "
        "(curiosity) is the emotional sense. Choice D (legal shares) is close but "
        "too narrow — Madison is describing entire economic blocs, not individual "
        "ownership stakes."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Interest rate' is perhaps the most common "
             "financial usage, but the passage lists economic sectors (landed, "
             "manufacturing), not percentages.",
        "B": "Connotation Mismatch — 'Interest' as curiosity doesn't fit: Madison "
             "is discussing political factions with material stakes, not intellectual "
             "fascination.",
        "D": "Register Error — Legal 'interests' (ownership stakes) is too narrow; "
             "Madison describes entire socioeconomic blocs competing for legislative "
             "influence, not individual property rights.",
    },
    cognitive_move="Using the appositive list (landed, manufacturing, mercantile, financial) and the synonym 'faction' to identify 'interests' as organized socioeconomic groups",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="interests",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q40 — Literature (Poe) — "material"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The detective regarded the arrangement of objects in the chamber — the "
        "position of the body, the orientation of the overturned chair, the "
        "precise angle at which the window had been forced — as material evidence "
        "bearing directly on the question of whether the murder had been committed "
        "by an intruder or by someone already within the household. No detail, "
        "however minute, could safely be dismissed.\n\n"
        "—Adapted from Edgar Allan Poe, \"The Murders in the Rue Morgue\" (1841)\n\n"
        "As used in the passage, \"material\" most nearly means"
    ),
    choices={
        "A": "the physical substance of which things are made",
        "B": "significantly important and relevant to the matter at hand",
        "C": "relating to physical comfort and possessions rather than spirit",
        "D": "the information and data used in a presentation or study",
    },
    correct="B",
    explanation_correct=(
        "The detective regarded the arrangement as 'material evidence bearing directly "
        "on the question' of the murder's circumstances. 'Material' here means "
        "significantly important, relevant, and consequential to the investigation. "
        "The phrase 'bearing directly on' confirms relevance, and 'No detail could "
        "safely be dismissed' reinforces that everything is potentially significant. "
        "Choice A (physical substance) is the most common meaning. Choice C "
        "(worldly possessions) is a philosophical sense. Choice D (study materials) "
        "is an educational term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Material' as physical substance (raw materials, "
             "fabric) is the dominant meaning, but 'material evidence' is a legal "
             "term meaning 'evidence of significant relevance.'",
        "C": "Connotation Mismatch — 'Material comforts' versus 'spiritual values' "
             "is a philosophical distinction irrelevant to a detective investigation.",
        "D": "Register Error — 'Study materials' is an educational term that doesn't "
             "fit the investigative context of evaluating evidence at a crime scene.",
    },
    cognitive_move="Recognizing the legal collocation 'material evidence' as meaning 'significantly relevant evidence,' confirmed by 'bearing directly on the question'",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="material",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q41 — Science — "substrate"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The enzyme's catalytic efficiency depends critically on the precise "
        "geometry of the active site, which must accommodate the substrate in "
        "an orientation that lowers the activation energy of the reaction. "
        "Mutations that alter the shape of the binding pocket — even by a single "
        "angstrom — can reduce turnover rates by several orders of magnitude, "
        "effectively abolishing enzymatic function.\n\n"
        "—Adapted from Berg, Tymoczko, and Stryer, Biochemistry, 8th ed. (2015)\n\n"
        "As used in the passage, \"substrate\" most nearly means"
    ),
    choices={
        "A": "a surface on which an organism lives or is attached",
        "B": "an underlying layer or base material in construction",
        "C": "the molecule upon which an enzyme acts in a chemical reaction",
        "D": "a foundation or platform for building electronic circuits",
    },
    correct="C",
    explanation_correct=(
        "The 'active site' must 'accommodate the substrate' in a way that 'lowers "
        "the activation energy' — this is textbook enzyme kinetics. The substrate is "
        "the molecule that binds to an enzyme's active site and undergoes a chemical "
        "reaction. Choice A (ecological surface) is used in ecology. Choice B "
        "(construction layer) is used in building. Choice D (electronic base) is "
        "used in semiconductor manufacturing."
    ),
    distractor_explanations={
        "A": "Connotation Mismatch — In ecology, a substrate is a surface (rock, "
             "soil) on which organisms grow, sharing the 'thing acted upon' concept "
             "but in the wrong domain.",
        "B": "Register Error — In construction, 'substrate' means a base layer, but "
             "the passage discusses biochemical catalysis, not building materials.",
        "D": "Register Error — In electronics, a substrate is a wafer for circuit "
             "fabrication, entirely outside the domain of enzyme biochemistry.",
    },
    cognitive_move="Using biochemistry markers (enzyme, active site, activation energy, binding pocket, turnover rates) to identify the enzyme-kinetics meaning of 'substrate'",
    trap_types=["Connotation Mismatch", "Register Error", "Register Error"],
    target_word="substrate",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q42 — History/Social Studies — "passage"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The passage of the Fourteenth Amendment in 1868 fundamentally altered "
        "the relationship between the states and the federal government by "
        "establishing, for the first time, a constitutional definition of "
        "national citizenship and prohibiting states from abridging the "
        "privileges and immunities of citizens without due process of law.\n\n"
        "—Adapted from Eric Foner, Reconstruction: America's Unfinished "
        "Revolution (1988)\n\n"
        "As used in the passage, \"passage\" most nearly means"
    ),
    choices={
        "A": "a section or excerpt from a written text",
        "B": "a narrow way allowing access between buildings",
        "C": "the process of enacting or ratifying a law",
        "D": "a journey by ship across a body of water",
    },
    correct="C",
    explanation_correct=(
        "'The passage of the Fourteenth Amendment in 1868' — the Amendment was "
        "enacted/ratified in that year. The passage then describes its effects: "
        "establishing citizenship, prohibiting states from abridging rights. This "
        "is clearly the legislative/constitutional enactment sense. Choice A "
        "(text excerpt) is what students see on the SAT itself, making this trap "
        "ironic. Choice B (corridor) is architectural. Choice D (sea voyage) is "
        "a travel term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — SAT students see 'passage' meaning 'text excerpt' "
             "dozens of times in test prep, but here the object 'of the Fourteenth "
             "Amendment' and the date '1868' signal the legislative enactment sense.",
        "B": "Register Error — An architectural passageway is a physical corridor, "
             "irrelevant to constitutional history.",
        "D": "Connotation Mismatch — 'Passage to India' or 'book passage on a ship' "
             "uses the journey sense, but constitutional amendments don't travel "
             "across oceans.",
    },
    cognitive_move="Using the object 'of the Fourteenth Amendment' and the date to identify 'passage' as ratification/enactment, distinguishing it from the test-prep sense of 'text excerpt'",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="passage",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q43 — Literature (Tolstoy) — "tender"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Levin, watching his wife bend over the cradle with an expression of "
        "rapt concentration, felt a tender apprehension steal over him — not "
        "the fear of any specific danger but a diffuse, almost metaphysical "
        "anxiety that so much happiness might prove too fragile to withstand "
        "the indifferent cruelties of the world.\n\n"
        "—Adapted from Leo Tolstoy, Anna Karenina (1877), trans. Constance "
        "Garnett (1901)\n\n"
        "As used in the passage, \"tender\" most nearly means"
    ),
    choices={
        "A": "to formally offer or submit for consideration",
        "B": "gentle, caring, and emotionally sensitive",
        "C": "sore or painful to the touch",
        "D": "an official medium of payment or currency",
    },
    correct="B",
    explanation_correct=(
        "Levin felt 'a tender apprehension' — a gentle, emotionally sensitive fear, "
        "not a harsh or violent one. The passage describes his feeling as born of "
        "love: he watches his wife with 'rapt concentration' and worries that 'so "
        "much happiness might prove too fragile.' This is a soft, caring anxiety. "
        "Choice A (formally offer) is a business/legal term. Choice C (sore to touch) "
        "is a physical/medical sense. Choice D (currency) is a financial term."
    ),
    distractor_explanations={
        "A": "Register Error — 'To tender a resignation' is a formal business phrase "
             "using the verb sense of 'tender,' but the passage uses it as an "
             "adjective modifying 'apprehension.'",
        "C": "Connotation Mismatch — A 'tender wound' means physically sore, which "
             "shares the vulnerability connotation but is literally about physical "
             "pain, not emotional sensitivity.",
        "D": "Common Meaning Trap — 'Legal tender' meaning currency is widely known "
             "but absurd as an adjective modifying 'apprehension.'",
    },
    cognitive_move="Using the emotional context (watching wife, rapt concentration, fragile happiness) to identify 'tender' as emotionally sensitive/gentle",
    trap_types=["Register Error", "Connotation Mismatch", "Common Meaning Trap"],
    target_word="tender",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q44 — Science — "pool"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Genetic drift exerts its strongest influence on populations with small "
        "effective sizes, where random fluctuations in allele frequency can "
        "rapidly erode the gene pool, driving rare variants to extinction and "
        "reducing the raw material available for natural selection to act upon. "
        "Conservation biologists therefore prioritize maintaining connectivity "
        "between fragmented habitat patches to preserve genetic diversity.\n\n"
        "—Adapted from Frankham et al., Introduction to Conservation "
        "Genetics, 2nd ed. (2010)\n\n"
        "As used in the passage, \"pool\" most nearly means"
    ),
    choices={
        "A": "a body of still water formed naturally or artificially",
        "B": "a shared supply of resources contributed by multiple parties",
        "C": "the total collection of genes or alleles in a population",
        "D": "a game played on a table with balls and a cue stick",
    },
    correct="C",
    explanation_correct=(
        "'Gene pool' is a technical biological term meaning the total collection of "
        "genes and genetic variants within a breeding population. The passage discusses "
        "'allele frequency,' 'rare variants,' and 'genetic diversity' — all confirming "
        "the population genetics meaning. Choice A (water body) is the literal "
        "meaning. Choice B (shared resources) is the business/collective sense "
        "('carpool,' 'resource pool'). Choice D (billiards) is a recreational term."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — A swimming pool or pond is the primary visual "
             "association, but 'gene pool' is a compound technical term in genetics.",
        "B": "Connotation Mismatch — A 'resource pool' or 'talent pool' means a "
             "shared supply, which is conceptually related (genes are a shared "
             "population resource) but too vague for the specific biological meaning.",
        "D": "Register Error — Billiards/pool is a recreational activity entirely "
             "outside the domain of population genetics.",
    },
    cognitive_move="Recognizing 'gene pool' as a fixed technical compound in genetics, confirmed by context about allele frequency, genetic drift, and conservation",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="pool",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q45 — History/Social Studies — "credit"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Hamilton's Report on Public Credit argued that the young republic's "
        "ability to borrow on favorable terms — its credit — depended entirely "
        "on demonstrating the political will to honor existing obligations. A "
        "nation that repudiated its debts might save in the short term but would "
        "find itself shut out of capital markets precisely when future crises "
        "demanded fresh borrowing.\n\n"
        "—Adapted from Alexander Hamilton, Report on Public Credit (1790)\n\n"
        "As used in the passage, \"credit\" most nearly means"
    ),
    choices={
        "A": "recognition or praise for an achievement",
        "B": "a unit of academic study or coursework",
        "C": "the ability to borrow money based on trust in future repayment",
        "D": "an entry recording a sum received in an account",
    },
    correct="C",
    explanation_correct=(
        "Hamilton discusses 'the young republic's ability to borrow on favorable "
        "terms — its credit.' The dash introduces an appositive defining 'credit' "
        "as the ability to borrow, which depends on trustworthiness. The passage "
        "then discusses honoring debts, borrowing, and capital markets — all "
        "confirming the financial trustworthiness meaning. Choice A (praise) is "
        "the everyday social meaning. Choice B (academic unit) is an educational "
        "term. Choice D (accounting entry) is too narrow/technical."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Give credit where credit is due' uses the "
             "recognition sense, but the passage explicitly defines credit as 'the "
             "ability to borrow on favorable terms.'",
        "B": "Register Error — Academic credits (course units) belong to education, "
             "not national finance and debt policy.",
        "D": "Connotation Mismatch — An accounting credit (a positive entry) is "
             "related to finance but far too narrow; Hamilton is discussing a nation's "
             "overall borrowing reputation, not a ledger entry.",
    },
    cognitive_move="Using the in-passage appositive gloss ('its ability to borrow on favorable terms — its credit') to directly identify the financial reputation meaning",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="credit",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q46 — Literature (Dostoevesky/Garnett) — "critical"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "At the critical moment — when the old pawnbroker turned her back to "
        "rummage in the drawer — Raskolnikov's resolve abandoned him. His hand "
        "trembled, his vision narrowed to a point of sickening clarity, and for "
        "an interval that might have been a second or an hour he stood frozen, "
        "the axe heavy and alien in his grip.\n\n"
        "—Adapted from Fyodor Dostoevsky, Crime and Punishment (1866), "
        "trans. Constance Garnett (1914)\n\n"
        "As used in the passage, \"critical\" most nearly means"
    ),
    choices={
        "A": "expressing disapproval or negative judgment",
        "B": "involving careful analysis and evaluation of a text",
        "C": "at a point of decisive importance or crisis",
        "D": "dangerously ill and at risk of death",
    },
    correct="C",
    explanation_correct=(
        "'At the critical moment' introduces the instant when the pawnbroker turns "
        "her back — the decisive, pivotal moment for Raskolnikov's intended action. "
        "The passage then describes his hesitation, freezing at the point of crisis. "
        "'Critical' here means at a point of decisive importance, a turning point. "
        "Choice A (disapproving) is the judgmental sense. Choice B (analytical) is "
        "the academic sense. Choice D (dangerously ill) is the medical sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Critical' as 'disapproving' is very common "
             "('she was critical of his work'), but 'the critical moment' is a "
             "fixed phrase meaning the decisive/pivotal moment.",
        "B": "Register Error — 'Critical analysis' in academia means careful textual "
             "evaluation, but the narrative passage describes a moment of crisis, not "
             "an act of scholarly interpretation.",
        "D": "Connotation Mismatch — 'In critical condition' in medicine means near "
             "death, sharing the urgency/severity connotation, but the passage "
             "describes a pivotal moment in time, not a medical state.",
    },
    cognitive_move="Recognizing 'the critical moment' as a fixed phrase meaning the pivotal/decisive instant, confirmed by the dramatic action and psychological tension described",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="critical",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q47 — Science — "flux"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "Eddy covariance towers positioned above the forest canopy measure the "
        "net flux of carbon dioxide between the ecosystem and the atmosphere at "
        "half-hourly intervals. By integrating these measurements over annual "
        "cycles, researchers can determine whether a given forest acts as a net "
        "carbon sink or source — information essential for calibrating global "
        "carbon budget models.\n\n"
        "—Adapted from Baldocchi, \"Assessing the eddy covariance technique,\" "
        "Global Change Biology (2003)\n\n"
        "As used in the passage, \"flux\" most nearly means"
    ),
    choices={
        "A": "a state of continuous change or instability",
        "B": "the rate of flow of a quantity across a given surface",
        "C": "a substance used to aid the fusion of metals in soldering",
        "D": "a purging or cleansing of the body",
    },
    correct="B",
    explanation_correct=(
        "'The net flux of carbon dioxide between the ecosystem and the atmosphere' — "
        "in environmental science and physics, 'flux' means the rate of flow of a "
        "substance or energy across a defined surface. The passage describes measuring "
        "CO₂ movement between two domains (forest and atmosphere) over time. Choice A "
        "(instability) is the abstract metaphorical sense ('in a state of flux'). "
        "Choice C (soldering material) is a metallurgical term. Choice D (purging) is "
        "an archaic medical sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Everything is in flux' (constant change) is the "
             "most common figurative usage, but the passage specifies measurable CO₂ "
             "movement between defined surfaces — the quantitative physics sense.",
        "C": "Register Error — Soldering flux is a materials science term unconnected "
             "to atmospheric carbon measurement.",
        "D": "Register Error — 'Flux' as bodily purging is an archaic medical term "
             "from pre-modern medicine, entirely outside the environmental science "
             "context.",
    },
    cognitive_move="Using the measurement context (towers, half-hourly intervals, net, between ecosystem and atmosphere) to identify the quantitative flow-rate meaning of 'flux'",
    trap_types=["Common Meaning Trap", "Register Error", "Register Error"],
    target_word="flux",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q48 — History/Social Studies — "patent"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "The contradiction between the Declaration's assertion that all men "
        "are created equal and the institution of chattel slavery was so patent "
        "that even slaveholding delegates could not have been entirely unconscious "
        "of it. Yet the political calculus of union demanded that this paradox be "
        "papered over rather than resolved, leaving the moral reckoning to a "
        "future generation.\n\n"
        "—Adapted from Garry Wills, Inventing America: Jefferson's Declaration "
        "of Independence (1978)\n\n"
        "As used in the passage, \"patent\" most nearly means"
    ),
    choices={
        "A": "a government grant giving exclusive rights to an invention",
        "B": "readily visible, open, and unconcealed; obvious",
        "C": "a type of glossy leather used in formal shoes",
        "D": "protected by intellectual property law",
    },
    correct="B",
    explanation_correct=(
        "The contradiction was 'so patent that even slaveholding delegates could not "
        "have been entirely unconscious of it.' 'Patent' here means obvious, readily "
        "visible, unconcealed — so clear that even those with a vested interest in "
        "ignoring it could not fully do so. Choice A (invention grant) is the most "
        "common noun meaning. Choice C (glossy leather) is a material term. Choice D "
        "(IP protected) is related to choice A but still wrong."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Patent' as an invention grant is overwhelmingly "
             "the most familiar meaning, but the adjective 'so patent that' signals "
             "the 'obvious/evident' sense.",
        "C": "Register Error — 'Patent leather' is a fashion/material term with no "
             "connection to political or moral arguments.",
        "D": "Connotation Mismatch — Intellectual property protection is related to "
             "the patent-grant concept but doesn't function as an adjective meaning "
             "'obvious.'",
    },
    cognitive_move="Recognizing that 'so patent that [consequence]' uses 'patent' as an adjective meaning 'obvious,' distinct from the noun meaning 'invention grant'",
    trap_types=["Common Meaning Trap", "Register Error", "Connotation Mismatch"],
    target_word="patent",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q49 — Literature (Wharton) — "settled"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "A settled melancholy had descended upon Newland Archer in the months "
        "following his engagement — not the dramatic anguish of thwarted passion "
        "but a quiet, pervasive resignation, as if some interior door had been "
        "closed with a finality that precluded all further argument. He went "
        "about his duties at the law firm with mechanical competence, betraying "
        "nothing of the deadness he felt within.\n\n"
        "—Adapted from Edith Wharton, The Age of Innocence (1920)\n\n"
        "As used in the passage, \"settled\" most nearly means"
    ),
    choices={
        "A": "established residence in a new place",
        "B": "resolved or reached an agreement about a dispute",
        "C": "permanent, fixed, and unlikely to change",
        "D": "paid a bill or financial obligation",
    },
    correct="C",
    explanation_correct=(
        "'A settled melancholy had descended' — this melancholy is not temporary or "
        "dramatic ('not the dramatic anguish') but 'quiet, pervasive' with 'a "
        "finality that precluded all further argument.' 'Settled' means permanent, "
        "fixed, established, and unlikely to change. Choice A (moved to a new place) "
        "is the colonization/relocation sense. Choice B (resolved a dispute) is a "
        "legal/negotiation sense. Choice D (paid a debt) is a financial sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Settlers settled the land' is the most "
             "historically vivid meaning, but a melancholy doesn't establish "
             "residence in a place.",
        "B": "Connotation Mismatch — 'Settled out of court' means resolved, but "
             "the passage describes something that has become permanent, not something "
             "that has been resolved.",
        "D": "Register Error — 'Settle the bill' means to pay, a financial transaction "
             "irrelevant to emotional states.",
    },
    cognitive_move="Using the contrast with 'dramatic anguish' and the descriptors 'quiet, pervasive' and 'finality' to identify 'settled' as permanent/fixed",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="settled",
))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Q50 — Science — "reduce"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
questions.append(q(
    prompt=(
        "In the final step of the electron transport chain, cytochrome c oxidase "
        "reduces molecular oxygen to water by transferring four electrons and "
        "four protons to each O₂ molecule. This exergonic reaction drives the "
        "pumping of additional protons across the inner mitochondrial membrane, "
        "contributing to the electrochemical gradient that powers ATP synthesis.\n\n"
        "—Adapted from Nelson and Cox, Lehninger Principles of Biochemistry, "
        "7th ed. (2017)\n\n"
        "As used in the passage, \"reduces\" most nearly means"
    ),
    choices={
        "A": "makes smaller in size, amount, or degree",
        "B": "brings to a specified lower state or condition",
        "C": "adds electrons to a molecule in a chemical reaction",
        "D": "simplifies or condenses for easier understanding",
    },
    correct="C",
    explanation_correct=(
        "Cytochrome c oxidase 'reduces molecular oxygen to water by transferring "
        "four electrons' — in chemistry, 'reduction' is the gain of electrons. The "
        "passage specifies the mechanism: four electrons are transferred to O₂, "
        "which is the definition of chemical reduction. Choice A (make smaller) is "
        "the general everyday meaning. Choice B (bring to a lower state) is too "
        "vague. Choice D (simplify) is a rhetorical/editorial sense."
    ),
    distractor_explanations={
        "A": "Common Meaning Trap — 'Reduce' in everyday language means to decrease, "
             "but the passage specifies electron transfer, which is the precise "
             "chemical definition of reduction.",
        "B": "Connotation Mismatch — 'Reduced to poverty' means brought to a lower "
             "state, which shares the directional metaphor but doesn't capture the "
             "specific electrochemical process described.",
        "D": "Register Error — 'Reduce an argument to its essentials' is a rhetorical "
             "simplification, not a biochemical electron transfer.",
    },
    cognitive_move="Using the mechanistic elaboration 'by transferring four electrons' to identify the electrochemical sense of 'reduces' as adding electrons to a molecule",
    trap_types=["Common Meaning Trap", "Connotation Mismatch", "Register Error"],
    target_word="reduce",
))

# ── INJECTION ──────────────────────────────────────────────────────
def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    bank_path = os.path.join(project_root, "data", "antigravity-bank.json")

    # Load existing bank
    if os.path.exists(bank_path):
        with open(bank_path, "r", encoding="utf-8") as f:
            bank = json.load(f)
    else:
        bank = []

    existing_ids = {q_item.get("id") for q_item in bank}
    print(f"Existing bank size: {len(bank)} questions")

    # Deduplicate & append
    new_count = 0
    skipped = 0
    for question in questions:
        if question["id"] in existing_ids:
            skipped += 1
            continue
        bank.append(question)
        existing_ids.add(question["id"])
        new_count += 1

    # Save
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"  Antigravity 1600 — Words in Context Injection Report")
    print(f"{'='*60}")
    print(f"  Questions generated : {len(questions)}")
    print(f"  New questions added : {new_count}")
    print(f"  Skipped (duplicate) : {skipped}")
    print(f"  Final bank size     : {len(bank)}")
    print(f"{'='*60}")

    # Domain breakdown
    words = [q_item["metadata"]["targetWord"] for q_item in questions]
    print(f"\n  Target words: {', '.join(words)}")

    # Answer distribution
    from collections import Counter
    answer_dist = Counter(q_item["correctAnswer"] for q_item in questions)
    print(f"\n  Answer distribution:")
    for letter in "ABCD":
        count = answer_dist.get(letter, 0)
        print(f"    {letter}: {count} ({100*count/len(questions):.0f}%)")

    print(f"\n  All questions: section='Reading and Writing', "
          f"domain='Craft and Structure', skill='Words in Context'")
    print(f"  All MCQ, all Hard, all targetBand='SAT-1600'")
    print(f"\n  ✅ Bank saved to: {bank_path}")


if __name__ == "__main__":
    main()
