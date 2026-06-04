"""Repair the 2026-05-28 RW prompt-length warning batch.

The integrity checker caps single-passage Reading and Writing prompts at 150
words. These reviewed rows were structurally usable but had bloated imported
stimuli. This script rewrites only the 53 warning rows, preserving the SAT task,
answer key, and reviewed/public status while fixing a few obvious quality
issues found during the prompt compression pass.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


DATA = Path("data")
WORD_LIMIT = 150


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", str(text or "")))


def clean(text: str) -> str:
    return "\n".join(line.rstrip() for line in str(text).strip().splitlines())


ANTIGRAVITY_PROMPTS: dict[str, str] = {
    "antigravity-a18b3bf1": """While researching color psychology in marketing, a student has taken the following notes:
• Singh (2006): up to 90% of snap product judgments can be based on color.
• Blue often signals trust and stability in corporate branding; red often signals urgency in sales and fast-food branding.
• Color effectiveness depends on perceived fit with brand personality, not universal associations alone.
• Labrecque and Milne (2012): color-personality incongruence reduced purchase intent by 24%.

The student wants to argue that brand color choices should prioritize contextual fit over universal color psychology. Which choice most effectively uses relevant information from the notes to accomplish this goal?""",
    "antigravity-8028af15": """While researching the philosophy of artificial intelligence, a student has taken the following notes:
• Searle's "Chinese Room" thought experiment argues that rule-based symbol manipulation does not equal genuine understanding.
• In the thought experiment, a person who knows no Chinese follows a rulebook to produce correct Chinese responses.
• Searle concluded that passing a language test can show only the appearance of comprehension.
• Critics such as Dennett argue that understanding may come in degrees and that sufficiently complex processing may count as a form of understanding.
• The debate remains unresolved and has intensified with fluent large language models.

The student wants to present both sides without taking a position. Which choice most effectively uses relevant information from the notes to accomplish this goal?""",
    "antigravity-063e9b3f": """While researching deep-sea hydrothermal vents, a student has taken the following notes:
• Hydrothermal vents were discovered in 1977 on the Galápagos Rift, about 2,500 meters deep.
• Vents emit superheated, mineral-rich water, including hydrogen sulfide.
• Chemosynthetic bacteria convert hydrogen sulfide into organic compounds, supporting food chains independent of sunlight.
• Giant tube worms (Riftia pachyptila) can grow up to 2 meters and lack a digestive system, relying on symbiotic chemosynthetic bacteria.
• Vent ecosystems challenged the assumption that complex life ultimately depends on photosynthesis.

The student wants to use a specific organism to show how vent ecosystems differ from surface ecosystems. Which choice best accomplishes this goal?""",
    "antigravity-1600-4aeb5d56": """CRISPR-Cas9 uses guide RNA to direct Cas9 to a DNA sequence, where Cas9 creates a double-strand break. The cell repairs the break through non-homologous end joining (NHEJ), which is error-prone and can introduce insertions or deletions, or through homology-directed repair (HDR), which uses a template for precise edits. Because NHEJ predominates in most human cells, precise knock-in edits are inefficient. Some strategies deliver Cas9 during the S/G2 phase, when HDR machinery is most active.

Based on the text, what can most reasonably be inferred about the primary obstacle to precise CRISPR-based gene editing?""",
    "antigravity-1600-25717480": """In W. E. B. Du Bois's The Quest of the Silver Fleece (1911), the swamp is contested symbolic space. The white planter class sees it as worthless land outside productive cotton country, but Bles and Zora turn it into a site of autonomous labor and self-determination. Du Bois describes their cotton as "golden" and "luminous," contrasting it with exploited plantation cotton. The swamp's transformation into fertile ground becomes a parable of Black self-directed economic activity.

Based on the text, what can most reasonably be inferred about Du Bois's symbolic use of the swamp?""",
}


OPENSAT_UPDATES: dict[str, dict[str, object]] = {
    "99315200": {
        "paragraph": "The passage argues that the internet has changed how information is distributed. Once controlled mainly by institutions and governments, information can now be gathered and shared by individuals, as in citizen journalism. The author mentions misinformation and declining trust as drawbacks, but emphasizes that the internet has made information more accessible and has empowered ordinary people to participate in public communication.",
        "question": "Which statement best describes the author’s main point?",
    },
    "4567ab90": {
        "paragraph": "A scholar argues that Sappho’s poetry often uses direct address, speaking as if to a specific person. In one poem, this directness conveys longing; in another, Sappho turns inward: \"My mind is at war, and my whole body is in a fever, because I long for you, but you are not here.\" The author would most likely say that the shift from direct address to an introspective tone is intended to _____.",
        "question": "Which choice best completes the sentence?",
    },
    "random_id_c4": {
        "paragraph": "The passage argues that art is best understood from multiple perspectives. It uses a painting as an example: a viewer who knows the painting’s history may notice different meanings than someone who does not, and a viewer familiar with its symbolism may interpret it differently from someone without that background. The passage’s conversational tone invites readers to consider how their own experiences shape interpretation.",
        "question": "The main idea of the passage is that",
    },
    "83b354c7": {
        "paragraph": "A guide to precise writing explains that language should match the subject. When discussing a historical event, a writer should use words that accurately reflect the period rather than modern slang; when discussing a scientific discovery, the writer should use language that reflects the scientific process. The guide emphasizes clarity, concision, and accuracy.",
        "question": "Which sentence is most likely to appear in a work about the need for precision in writing?",
    },
    "926a764b": {
        "paragraph": "The passage traces computer development from simple calculating tools such as the abacus to punched-card machines and electronic computers. It says this development transformed work and communication, but it also stresses that no single cause drove the change: people wanted to automate tasks, improve calculation accuracy, and create more powerful tools.",
        "question": "Which choice best exemplifies the passage’s claim about factors driving computer development?",
    },
    "random_id_e9": {
        "paragraph": "In the early days of the internet, \"cyberspace\" described the virtual world of computers and networks. Science fiction writer William Gibson coined the word to imagine a place where people could interact in ways impossible in the physical world. Gibson’s vision of cyberspace was a world of interconnected computers, data, and information. It was also a world that was constantly evolving and changing.",
        "question": "Which choice best combines the underlined sentences with a comma and coordinating conjunction?",
        "choices": {
            "A": "Gibson’s vision of cyberspace was a world of interconnected computers, data, and information, it was also a world that was constantly evolving and changing.",
            "B": "Gibson’s vision of cyberspace was a world of interconnected computers, data, and information, and it was also a world that was constantly evolving and changing.",
            "C": "Gibson’s vision of cyberspace was a world of interconnected computers, data, and information, and, it was also a world that was constantly evolving and changing.",
            "D": "Gibson’s vision of cyberspace was a world of interconnected computers, data, and information; and it was also a world that was constantly evolving and changing.",
        },
    },
    "84a521ab": {
        "paragraph": "The passage explains that The Great Gatsby remains popular because its themes of wealth, love, and ambition still resonate, but it emphasizes the novel’s warning about the American Dream. Gatsby’s pursuit of Daisy and his inability to let go of the past lead to disappointment and ruin, so the novel is presented as a cautionary tale about chasing dreams without considering their consequences.",
        "question": "According to the author, what is the main idea of this passage?",
    },
    "e32a2215": {
        "paragraph": "The author explains why some people share opinions on social media, presenting this sharing as self-expression that is not always fully conscious. The author also notes that social media can spread information for good or harmful purposes, including dangerous misinformation.",
        "question": "The author likely mentions social media being used to spread dangerous misinformation to",
    },
    "2487f39f": {
        "paragraph": "Many people focus on major parts of diet, such as fat and sugar, but small choices like condiments can matter. Ketchup may seem healthy because it is tomato-based and contains lycopene; however, many commercial ketchups contain enough sugar to contribute to health problems. So, while a tomato-based ketchup may seem like a healthy choice",
        "question": "Which choice completes the text so that it conforms to the conventions of Standard English?",
    },
    "f347892a": {
        "paragraph": "The poem opens with a young man on a mountaintop, physically and emotionally isolated. As the speaker reflects on his inner world and the natural world around him, the poem shows how isolation can lead to reflection and growth. The author uses imagery and other literary devices to explore the speaker’s feelings.",
        "question": "What is the most likely reason the author uses a variety of literary devices?",
    },
    "14f51290": {
        "paragraph": "The passage describes the Industrial Revolution in the United States as a period of rapid change. Factories and new technologies created jobs and economic opportunity, drawing many people into cities. At the same time, industrialization produced serious challenges, including pollution, overcrowding, and social upheaval.",
        "question": "Which sentence best summarizes the author’s perspective on the Industrial Revolution in the United States?",
    },
    "8a4d4672": {
        "paragraph": "The passage explains that the author uses language to create both concrete and symbolic effects. Specific details help readers picture the setting, while figurative language, such as comparing the night sky to a canvas of deep blue dotted with silver stars, creates a more abstract sense of wonder.",
        "question": "The author’s use of figurative language is most likely intended to",
    },
    "3c59a3a6": {
        "paragraph": "Two independent clauses can be joined with a semicolon. For example, the sentences \"She went to the store\" and \"She bought bread\" can be combined without changing their wording.",
        "question": "Which choice correctly combines the two independent clauses with a semicolon?",
    },
    "6c74b494": {
        "paragraph": "The passage says that sources of information should be evaluated carefully, especially online. It lists several factors to consider, including purpose and date of publication, but identifies credibility as one of the most important: a credible source is reliable, accurate, and unbiased.",
        "question": "According to the passage, what is the most important factor in evaluating a source of information?",
    },
    "a84e518f": {
        "paragraph": "A news article describes GJ 3470b, a planet about 70 percent as massive as Jupiter that orbits its star in only 8.5 days. The planet orbits at just 1 percent of Jupiter’s distance from the Sun; as a result, it is estimated to have a surface temperature above 1,600 degrees Fahrenheit.",
        "question": "Which choice best combines the second and third sentences so that the result follows Standard English conventions?",
    },
    "a6f8b97d": {
        "paragraph": "Scientists long believed giraffes were mostly silent and communicated mainly by sight. After analyzing hundreds of hours of zoo recordings, biologist Angela Stöger’s team found that giraffes make a very low-pitched humming sound, which they may use when visual signals are not possible.",
        "question": "Which inference is best supported by the passage?",
    },
    "83dc91b2": {
        "paragraph": "The Master and Margarita presents a complex view of society, religion, and ideas, often using satire and irony. Its characters are caught between opposing forces: good and evil, reason and faith, tradition and modernity. The Master’s personal struggle reflects the larger conflicts faced throughout the novel.",
        "question": "What is the primary message of The Master and Margarita?",
    },
    "65482aa8": {
        "paragraph": "A narrator recalls a dog he first feared but later loved deeply. After describing the dog’s change and eventual death, the narrator insists, \"I never want to see a dog again,\" then repeats, \"I’m lying! I’m lying! I’m lying!\"",
        "question": "How does the structure of the last sentence contribute to the passage’s overall effect?",
    },
    "234234e5": {
        "paragraph": "The 1960s saw a flowering of experimental poetry as poets challenged expectations about form and style. E. E. Cummings became known for unconventional punctuation and capitalization; for instance, \"i sing of Olaf glad and big\" uses unusual line breaks and spacing. The poem \"i carry your heart with me(i carry it in my heart)\" provides another example of Cummings’s unconventional punctuation.",
        "question": "Which choice best explains the purpose of the sentence about \"i carry your heart with me(i carry it in my heart)\"?",
        "choices": {
            "A": "To emphasize that Cummings’s unconventional punctuation is often used to set off extended metaphors.",
            "B": "To provide a second example of Cummings’s unconventional punctuation.",
            "C": "To illustrate how Cummings’s punctuation creates intimacy and connection with the reader.",
            "D": "To introduce the reader to the specific unconventional techniques that Cummings is known for.",
        },
    },
    "7c57718d": {
        "paragraph": "The speaker remembers once loving new challenges but now being more cautious and risk-averse. Although the speaker sometimes misses being younger and more adventurous, the speaker also recognizes having learned and grown from past risks and concludes that caution may not be entirely negative.",
        "question": "Which choice best describes the speaker’s attitude toward their current cautiousness?",
    },
    "6e22d484": {
        "paragraph": "The article \"The Power of Play\" argues that games can support learning rather than merely distract students. It cites studies, including one in which students who played a fractions game improved their understanding more than students who did not, and concludes that educators should use game-based learning to create engaging instruction.",
        "question": "Which statement best summarizes the author’s main point?",
    },
    "e9342c71": {
        "paragraph": "The writer wants to show that natural phenomena can inspire awe. The narrator recalls seeing the northern lights and describes the sky as alive with a symphony of color, dancing overhead.",
        "question": "Which choice most effectively completes the passage?",
    },
    "5168a520": {
        "paragraph": "Although quality improvement is often linked to focusing on the process of creation, a study of origami cranes suggests that focusing on the desired outcome can also help. Participants asked to focus on creating a beautiful crane produced higher-quality work than those asked to focus only on folding technique.",
        "question": "In the passage, the phrase \"even though\" most likely indicates that the author believes",
    },
    "75f852f9": {
        "paragraph": "The passage explains that an analogy compares two different things that share an important similarity. For instance, an author might compare learning a language to learning a dance to show that both require time and practice. The passage says such analogies make an argument clearer and more persuasive.",
        "question": "The use of analogies in the passage is most likely to",
    },
    "8a77a4b5": {
        "paragraph": "The author argues that digital technology can help teenagers maintain friendships but can also weaken the quality of those relationships. As an example, the author notes that some teenagers text each other even while sitting in the same room, a behavior contrasted with earlier face-to-face interactions.",
        "question": "The author cites the example of teenagers texting each other while sitting in the same room to",
    },
    "a7893d9d": {
        "paragraph": "Michael Franti formed the Disposable Heroes of Hiphoprisy in the late 1980s. The group blended hip-hop, funk, and world music with political themes. Its song \"Television, the Drug of the Nation\" critiques media influence and calls for awareness and engagement. In later years, Franti continued using music as a platform for social change.",
        "question": "Which choice most effectively combines the two sentences about the song’s message while keeping the original meaning?",
    },
    "8a39f125": {
        "paragraph": "A passage about Anya first introduces her as a portrait painter who values painting as emotional expression. The second paragraph explains that her husband Tom encourages her, helping her explore new ideas and develop her artistic vision. A later paragraph contrasts her traditional technique with her interest in digital tools.",
        "question": "The second paragraph primarily functions to",
    },
    "86e80d9c": {
        "paragraph": "A woman moves from a small town to a city, expecting exciting possibilities. She soon finds the city lonelier than expected, which makes her appreciate her hometown’s simplicity. Although she misses familiar routines and neighbors, she eventually decides to embrace the city’s challenges.",
        "question": "Which choice best describes the function of the underlined sentence in the text as a whole?",
    },
    "c8c2e146": {
        "paragraph": "The excerpt describes Mark Twain as a humorist whose satirical stories often criticized society. Although his writing includes serious themes, the excerpt emphasizes that his humor and satire highlighted the absurdity of human behavior, making those techniques distinctive features of his work.",
        "question": "The writer supports the idea that Twain’s writing is both humorous and satirical by",
    },
    "random_id_english_6": {
        "paragraph": "The novel presents ordinary experiences as magical. A character smells a pine tree and experiences it as \"a tiny, powerful world\"; even the tree’s changing scent from morning to afternoon becomes meaningful. These sensory details create awe and suggest that small observations can transform perception.",
        "question": "The author’s use of sensory details primarily serves to",
    },
    "a982e8b8": {
        "paragraph": "A book cover can guide a reader’s expectations. Bright colors may suggest a lighthearted story, while dark colors may suggest suspense; however, these signals are not always reliable. The passage concludes that cover design is useful but is only one part of a book.",
        "question": "Which revision best maintains consistent verb tense in the sentence?",
    },
    "13865c71": {
        "paragraph": "In \"The Figure a Poem Makes,\" Marianne Moore argues that a poem’s \"figure\" is not its subject matter but the shape or form it takes. A poem about a single person, for example, could be a sonnet, free verse poem, narrative poem, or dramatic monologue, and each form would produce a different figure.",
        "question": "In the passage, the phrase \"figure a poem makes\" is used to",
    },
    "f2745a1b": {
        "paragraph": "An excerpt describes a tourist attraction whose buildings are unexpectedly modern yet rooted in an eighteenth-century style, creating a distinctive effect. The author then says the real draw is the food, which locals present as a culinary art form rather than as an ordinary meal.",
        "question": "The author most likely introduces the buildings before the food in order to",
    },
    "1214d568": {
        "paragraph": "The passage explains that \"jazz\" once referred broadly to several kinds of music, including blues and ragtime. Today, it more specifically names a style that originated in African American communities in New Orleans, though it is still sometimes used broadly for improvisational, rhythmic, energetic music.",
        "question": "The phrase about jazz’s specific origin and broader use is included to",
    },
    "9874239a": {
        "paragraph": "In a play, Sarah is a set designer trying to keep working at a local theater while facing financial trouble. John offers to pay her rent, but Sarah resists because she is proud and independent. John tells Sarah that he understands her feelings but that she needs help to continue her work.",
        "question": "Which choice most effectively combines the two sentences with a coordinating conjunction?",
    },
    "7d6217a7": {
        "paragraph": "The passage contrasts two groups in early nineteenth-century America. The upper class is described as drawn to nature, taking walks in woods or sailing on rivers and lakes. The middle class is described as drawn to the \"artificial\" attractions of city life, including social events and theater.",
        "question": "What two groups does the author distinguish in this passage?",
    },
    "a44897d3": {
        "paragraph": "The passage compares a train’s slow, steady movement to the pace of life and then compares the train to a ship traveling through time. These comparisons suggest that the journey should be savored rather than rushed.",
        "question": "What is the most likely reason the author uses the word \"ship\" to describe the train?",
    },
    "2a69865c": {
        "paragraph": "The passage describes a butterfly’s life cycle: egg, larva, pupa, and adult. It also emphasizes the butterfly’s relationships with other species, including plants that support larvae, predators, and ants that form a symbiotic relationship with the butterfly.",
        "question": "Which choice best summarizes the central idea of the passage?",
    },
    "d82c611c": {
        "paragraph": "Television programs about home renovation have become popular, but critics argue that they promote a narrow, idealized version of design. The shows often focus on expensive contemporary remodels and overlook sustainability, accessibility, and design styles beyond a sleek modern look.",
        "question": "The author likely includes the sentence about sustainability and accessibility to",
    },
    "64f4e4a9": {
        "paragraph": "The essay challenges the traditional view of history as a simple series of events. Instead, it argues that history should be understood through social, economic, and cultural forces that make the past a complex, dynamic process of change and transformation.",
        "question": "The author cites social, economic, and cultural forces in order to",
    },
    "14f5733f": {
        "paragraph": "The narrator is a member of a royal family being prepared for power. He learns to be polite to authorities but also to notice that influence is often hidden: people who appear powerful may operate subtly, and understanding power requires reading indirect signs.",
        "question": "Which choice best describes the lesson the narrator is learning?",
    },
    "74e41e9f": {
        "paragraph": "The passage explains the arrow of time, the idea that time seems to move only from past to present to future. This concept appears obvious, but it raises difficult questions about memory, identity, planning, and whether the past and future exist in any meaningful way.",
        "question": "What is the main point made by the passage?",
    },
    "8c04f4c1": {
        "paragraph": "The passage uses vivid imagery to describe a long, narrow valley surrounded by wooded hills; pale morning light and the scent of pine; and a winding path, hidden houses, and strange sounds in the woods. These details help readers picture the setting, understand the speaker’s experience, and feel mystery and suspense.",
        "question": "The use of vivid imagery in the passage most likely serves to",
        "choices": {
            "A": "create a sense of mystery and suspense.",
            "B": "help the reader understand the speaker’s feelings and experiences.",
            "C": "describe the setting of the passage.",
            "D": "combine description of the setting, the speaker’s experience, and suspenseful atmosphere.",
        },
    },
    "78f24c9a": {
        "paragraph": "A comma splice occurs when two independent clauses are joined by a comma without a coordinating conjunction or semicolon. For example, \"I went to the store, I bought some milk\" is a comma splice; it can be corrected as \"I went to the store, and I bought some milk.\"",
        "question": "What is the name of this error?",
    },
    "f13e0657": {
        "paragraph": "As a child, the narrator struggled to remember classmates’ names. The narrator later discovered a method: connect a name to a physical or personal trait. For example, a classmate named Eric had big eyes, so that feature helped the narrator remember Eric’s name.",
        "question": "The detail about Eric is included to",
    },
    "9e89235d": {
        "paragraph": "The passage compares two ways of studying animal behavior: observing animals in their natural habitats and observing captured animals in a laboratory. Natural settings are realistic but hard to control; laboratories offer control but may change how animals behave. Each approach therefore provides useful but limited evidence.",
        "question": "Which choice best describes the main idea of the passage?",
    },
    "18961d20": {
        "paragraph": "The ancient Olympic Games were held in Greece every four years and combined athletic competition with religious ritual. A sacred truce allowed travel during the Games. The Games were abolished in the fourth century CE. They were revived in the late nineteenth century by Pierre de Coubertin.",
        "question": "Which choice best combines the final two sentences using a conjunctive adverb to show contrast?",
        "choices": {
            "A": "The Games were abolished in the fourth century CE and were revived in the late nineteenth century by Pierre de Coubertin.",
            "B": "The Games were abolished in the fourth century CE; but, they were revived in the late nineteenth century by Pierre de Coubertin.",
            "C": "The Games were abolished in the fourth century CE; however, they were revived in the late nineteenth century by Pierre de Coubertin.",
            "D": "The Games were abolished in the fourth century CE, they were revived in the late nineteenth century by Pierre de Coubertin.",
        },
    },
    "7796753e": {
        "paragraph": "The story begins with William, a farmer’s son who has always loved the land. He spends his youth exploring fields, observing seasonal changes, and learning about farming, earning respect in his community. After his father dies, he must choose between keeping the family farm and accepting a higher-paying city job.",
        "question": "The primary function of the first paragraph is to",
    },
}


EXPLANATION_UPDATES: dict[str, dict[str, object]] = {
    "antigravity-8028af15": {
        "correct": "Choice D presents Searle's position and Dennett's counterargument in a balanced 'While X, Y counter that' structure, and it notes that the debate remains unresolved. That directly presents both sides without endorsing either one.",
        "distractors": {
            "A": "This presents Searle's position as definitive proof, taking one side rather than neutrally presenting the debate.",
            "B": "This mentions that the debate intensified but does not explain both sides' arguments.",
            "C": "This presents only Dennett's perspective and implicitly favors it over Searle's position.",
        },
    },
    "antigravity-063e9b3f": {
        "correct": "Choice D uses the giant tube worm as the specific organism and connects its lack of a digestive system and chemosynthetic symbiosis to the broader contrast with photosynthesis-dependent surface ecosystems.",
        "distractors": {
            "A": "This describes chemosynthetic bacteria generally rather than using a specific organism to illustrate the contrast.",
            "B": "This describes the vent environment broadly without focusing on a particular organism.",
            "C": "This states the broader scientific implication but does not use a specific organism as the example.",
        },
    },
    "random_id_e9": {
        "correct": "Choice B correctly combines the two independent clauses with a comma and the coordinating conjunction 'and' while preserving the idea that cyberspace was also constantly changing.",
        "distractors": {
            "A": "Choice A creates a comma splice by joining two independent clauses with only a comma.",
            "C": "Choice C adds an unnecessary comma after the coordinating conjunction, disrupting the sentence boundary.",
            "D": "Choice D uses a semicolon rather than the comma-plus-conjunction structure requested in the question.",
        },
    },
    "3c59a3a6": {
        "correct": "Choice B correctly joins two independent clauses with a semicolon: 'She went to the store; she bought bread.'",
        "distractors": {
            "A": "Choice A is grammatical, but it uses a comma and coordinating conjunction rather than the semicolon requested.",
            "C": "Choice C changes the logical relationship by adding 'but,' implying a contrast that is not in the original sentences.",
            "D": "Choice D changes the wording and emphasis instead of preserving the original wording with a semicolon.",
        },
    },
    "234234e5": {
        "correct": "Choice B is correct because the sentence supplies another example of Cummings's unconventional punctuation, reinforcing the previous example rather than introducing a new topic.",
        "distractors": {
            "A": "Choice A narrows the point to extended metaphors, but the sentence is being used as an additional punctuation example.",
            "C": "Choice C focuses on reader intimacy, a possible effect of the poem but not the sentence's stated role in the paragraph.",
            "D": "Choice D is too broad; the paragraph has already introduced Cummings's unconventional techniques.",
        },
    },
    "9874239a": {
        "correct": "Choice C correctly joins the two independent clauses with the coordinating conjunction 'and' while preserving the meaning of both original sentences.",
        "distractors": {
            "A": "Choice A creates a comma splice between independent clauses.",
            "B": "Choice B uses a semicolon, but the question asks for a coordinating conjunction.",
            "D": "Choice D creates an illogical and ungrammatical combination with both 'although' and 'but.'",
        },
    },
    "8c04f4c1": {
        "correct": "Choice D is correct because the imagery serves several functions at once: it describes the setting, conveys the speaker's sensory experience, and builds a mysterious atmosphere.",
        "distractors": {
            "A": "Choice A captures only the suspenseful effect and misses the setting and sensory experience.",
            "B": "Choice B captures only the speaker's experience and misses the setting and suspense.",
            "C": "Choice C captures only the setting and misses the emotional and atmospheric effects.",
        },
    },
    "18961d20": {
        "correct": "Choice C correctly uses a semicolon before the conjunctive adverb 'however' and a comma after it to join two closely related independent clauses while showing contrast.",
        "distractors": {
            "A": "Choice A is grammatical but does not use a conjunctive adverb to signal the contrast requested in the question.",
            "B": "Choice B incorrectly pairs a semicolon with 'but,' which is a coordinating conjunction rather than a conjunctive adverb.",
            "D": "Choice D creates a comma splice by joining two independent clauses with only a comma.",
        },
    },
}


def validate_lengths() -> None:
    expected_ids = set(ANTIGRAVITY_PROMPTS) | set(OPENSAT_UPDATES)
    if len(expected_ids) != 53:
        raise SystemExit(f"Expected 53 update ids, got {len(expected_ids)}")

    for qid, prompt in ANTIGRAVITY_PROMPTS.items():
        words = word_count(prompt)
        if words > WORD_LIMIT:
            raise SystemExit(f"Antigravity prompt still too long {qid}: {words}")

    for qid, update in OPENSAT_UPDATES.items():
        prompt = f"{update['paragraph']}\n\n{update['question']}"
        words = word_count(prompt)
        if words > WORD_LIMIT:
            raise SystemExit(f"OpenSAT prompt still too long {qid}: {words}")


def apply_antigravity() -> int:
    path = DATA / "antigravity-bank.json"
    rows = json.loads(path.read_text(encoding="utf-8"))
    seen: set[str] = set()
    for row in rows:
        qid = row.get("id")
        if qid not in ANTIGRAVITY_PROMPTS:
            continue
        row["prompt"] = clean(ANTIGRAVITY_PROMPTS[qid])
        if qid in EXPLANATION_UPDATES:
            row["explanation"] = EXPLANATION_UPDATES[qid]
        seen.add(qid)
    missing = set(ANTIGRAVITY_PROMPTS) - seen
    if missing:
        raise SystemExit(f"Missing Antigravity ids: {sorted(missing)}")
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(seen)


def apply_opensat() -> int:
    path = DATA / "opensat-pinesat.json"
    rows = json.loads(path.read_text(encoding="utf-8"))
    seen: set[str] = set()
    for row in rows:
        qid = row.get("id")
        if qid not in OPENSAT_UPDATES:
            continue
        update = OPENSAT_UPDATES[qid]
        nested = row.get("question")
        if not isinstance(nested, dict):
            raise SystemExit(f"OpenSAT row has no nested question: {qid}")
        nested["paragraph"] = clean(str(update["paragraph"]))
        nested["question"] = clean(str(update["question"]))
        if "choices" in update:
            nested["choices"] = update["choices"]
            if isinstance(row.get("choices"), dict):
                row["choices"] = update["choices"]
        if qid in EXPLANATION_UPDATES:
            nested["explanation"] = EXPLANATION_UPDATES[qid]
            row["explanation"] = EXPLANATION_UPDATES[qid]
        seen.add(qid)
    missing = set(OPENSAT_UPDATES) - seen
    if missing:
        raise SystemExit(f"Missing OpenSAT ids: {sorted(missing)}")
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(seen)


def main() -> None:
    validate_lengths()
    ant_count = apply_antigravity()
    open_count = apply_opensat()
    print(f"Updated {ant_count} Antigravity rows and {open_count} OpenSAT rows.")


if __name__ == "__main__":
    main()
