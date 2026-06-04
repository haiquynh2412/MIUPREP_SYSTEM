#!/usr/bin/env python3
"""
hard_rw_craft2.py — Generate 50 Hard R&W questions
Skill: Text Structure and Purpose
Domain: Craft and Structure
Section: Reading and Writing

All passages are dense academic prose (80-150 words).
Rotates: Literature (pre-1929), History/Social Studies, Science.
Trap taxonomy: Surface Function, Scope Error, Purpose Reversal.
Cognitive move: Distinguishing surface-level rhetorical function from the author's deeper strategic intent.
"""

import json
import uuid
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data" / "antigravity-bank.json"


def make_id():
    return f"antigravity-1600-{uuid.uuid4().hex[:8]}"


def shared_meta():
    return {
        "sourceType": "antigravity",
        "sourceName": "Antigravity Vault",
        "sourceSignalId": "antigravity-1600-rw-craft2",
        "generationEngine": "antigravity-master-prompt-1600",
        "visibility": "private_family",
        "reviewStatus": "needs_review",
        "targetBand": "SAT-1600",
    }


def q(passage, question_stem, choices, correct, expl_correct, expl_distractors):
    """Build one Text Structure and Purpose MCQ."""
    prompt = passage + "\n\n" + question_stem
    meta = shared_meta()
    return {
        "id": make_id(),
        "section": "Reading and Writing",
        "domain": "Craft and Structure",
        "skill": "Text Structure and Purpose",
        "difficulty": "Hard",
        "type": "MCQ",
        "prompt": prompt,
        "choices": choices,
        "correctAnswer": correct,
        "explanation": {
            "correct": expl_correct,
            "distractors": expl_distractors,
        },
        "metadata": {
            "cognitiveMove": "Distinguishing surface-level rhetorical function from the author's deeper strategic intent",
            "trapTypes": ["Surface Function", "Scope Error", "Purpose Reversal"],
        },
        **meta,
    }


# ─────────────────────────────────────────────
# 50 QUESTIONS — rotating Literature / History / Science
# ─────────────────────────────────────────────

questions = []

# ── Q1 — Science ──────────────────────────────
questions.append(q(
    "Coral reefs occupy less than one percent of the ocean floor, yet they harbor roughly a quarter of all marine species. This extraordinary biodiversity has long been attributed to the structural complexity of reef habitats, which provide niches for organisms of vastly different sizes and feeding strategies. Recent isotopic analyses, however, suggest that nutrient recycling within reef ecosystems — particularly the tight coupling between coral hosts and their symbiotic algae — may be equally critical. In nutrient-poor tropical waters, this internal recycling effectively creates an oasis of productivity, sustaining food webs that would otherwise collapse.\n\n— Adapted from A. Muscatine and J. Porter, \"Reef Corals: Mutualistic Symbioses Adapted to Nutrient-Poor Environments,\" BioScience, 1977.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents a widely held explanation for a phenomenon and then introduces research that suggests an additional, possibly equally important contributing factor.",
        "B": "It describes an environmental problem and then proposes a solution that scientists have recently developed.",
        "C": "It contrasts two mutually exclusive hypotheses about coral reef biodiversity and argues that one is definitively correct.",
        "D": "It catalogs the various species found in coral reefs and explains how each species benefits from reef habitats."
    },
    "A",
    "The passage opens with the established explanation (structural complexity → biodiversity), then pivots with 'however' to introduce isotopic evidence for nutrient recycling as an equally critical factor. The structure is supplementation, not replacement: the text adds a new contributing factor rather than refuting the old one. Choice A precisely captures this 'accepted explanation + additional factor' architecture.",
    {
        "B": "Purpose Reversal — The passage does not describe an environmental problem or propose a solution; it explains competing factors behind biodiversity, which is framed as a positive phenomenon to be understood, not a crisis to be solved.",
        "C": "Scope Error — The text does not present the two explanations as 'mutually exclusive'; the word 'equally' signals that both may operate simultaneously. The passage supplements, it does not debunk.",
        "D": "Surface Function — While the passage mentions species diversity, it does not catalog specific species or explain individual species' benefits; it analyzes why biodiversity exists at a systemic level."
    }
))

# ── Q2 — Literature ──────────────────────────
questions.append(q(
    "In Thomas Hardy's Far from the Madding Crowd (1874), Gabriel Oak watches Bathsheba Everdene's farmhouse burn while she sleeps inside, unaware. Hardy describes Oak's rescue in deliberately restrained prose: no heroic declarations, no dramatic interior monologue — only a laconic sequence of physical actions. Oak beats flames with a rug, carries Bathsheba outside, and returns to extinguish the remaining fire. The narrator's detachment during this crisis stands in stark contrast to the emotional intensity of scenes where Oak merely observes Bathsheba from afar. By withholding emotional commentary precisely when action is most dramatic, Hardy implies that Oak's character is defined by competence rather than self-regard.\n\n— Adapted from Thomas Hardy, Far from the Madding Crowd, 1874.",
    "Which choice best describes the function of the underlined sentence in the overall structure of the text?",
    {
        "A": "It summarizes the plot of the novel for readers unfamiliar with Hardy's work.",
        "B": "It provides a contrasting stylistic observation that supports the claim that Hardy's narrative restraint during the rescue is a deliberate characterization strategy.",
        "C": "It argues that Hardy considers emotional passages to be more important than action sequences.",
        "D": "It introduces a new character whose behavior contrasts with Gabriel Oak's."
    },
    "B",
    "The underlined sentence (the contrast between detached rescue prose and emotionally intense observation scenes) does not merely describe two tones — it functions as evidence for the passage's interpretive claim. By showing that Hardy *can* write emotional intensity but *chooses* restraint during the rescue, the contrast proves the restraint is deliberate, not a limitation. Choice B identifies this evidential function: the contrast supports the argument about characterization strategy.",
    {
        "A": "Surface Function — While the sentence mentions plot events, its purpose is analytical (establishing a contrast to support a claim), not summarizing the novel.",
        "C": "Purpose Reversal — The passage argues the opposite: Hardy's restraint in action scenes is the meaningful artistic choice. The contrast highlights the rescue's restraint as significant, not the emotional passages.",
        "D": "Scope Error — The sentence references no new character; it discusses narrative style applied to the same character (Oak) in different contexts."
    }
))

# ── Q3 — History/Social Studies ──────────────
questions.append(q(
    "In Common Sense (1776), Thomas Paine does not begin with the case for American independence. Instead, he devotes the first two sections to abstract reflections on the origin of government and the absurdity of hereditary monarchy. Only after establishing that kingship itself is irrational does Paine turn to the specific grievances of the colonies. This structural choice transforms the pamphlet from a catalog of complaints into a philosophical argument: colonial independence becomes not merely a practical response to British policy but a logical consequence of principles that any rational reader must accept.\n\n— Adapted from Thomas Paine, Common Sense, 1776.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that Paine's philosophical abstractions weaken his practical case for independence by distracting from specific grievances.",
        "B": "To analyze how Paine's structural decision to begin with philosophical principles rather than specific grievances elevates his argument from pragmatic complaint to universal rational necessity.",
        "C": "To compare Common Sense unfavorably with other revolutionary pamphlets that took a more direct approach.",
        "D": "To summarize the historical events that led to the publication of Common Sense in 1776."
    },
    "B",
    "The passage's analytical focus is on Paine's structural choice — beginning with abstract philosophy before turning to specific grievances — and what that structure accomplishes rhetorically (transforming complaint into rational argument). The key phrase 'this structural choice transforms' signals the author's purpose: to explain HOW structure serves strategy. Choice B identifies this meta-rhetorical analysis.",
    {
        "A": "Purpose Reversal — The passage argues that the philosophical opening strengthens Paine's argument by making independence a 'logical consequence of principles'; Choice A claims the opposite — that it weakens the argument.",
        "C": "Scope Error — The passage analyzes Paine's pamphlet alone; no other pamphlets are mentioned or compared.",
        "D": "Surface Function — While the passage references the publication date, it does not narrate historical events leading to the pamphlet; it analyzes rhetorical structure."
    }
))

# ── Q4 — Science ──────────────────────────────
questions.append(q(
    "The standard model of plate tectonics explains surface volcanism through subduction zones and mid-ocean ridges, yet volcanic hotspots such as Hawaii exist far from any plate boundary. The mantle plume hypothesis, first proposed by W. Jason Morgan in 1971, posits that narrow columns of abnormally hot rock rise from the core-mantle boundary, creating volcanic activity independent of plate motions. Critics note, however, that seismic tomography has failed to detect the deep thermal anomalies predicted by the model in several supposed plume locations. Supporters counter that current imaging resolution may be insufficient to capture narrow conduits, and that geochemical signatures of hotspot lavas remain consistent with a deep mantle source.\n\n— Adapted from W. J. Morgan, \"Convection Plumes in the Lower Mantle,\" Nature, 1971; and review in Annual Review of Earth and Planetary Sciences, 2010.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents an established framework, introduces a hypothesis that extends it, describes a challenge to that hypothesis, and then notes the proponents' rebuttal.",
        "B": "It refutes the standard model of plate tectonics and replaces it with the mantle plume hypothesis.",
        "C": "It describes a series of volcanic eruptions in chronological order and explains their geological causes.",
        "D": "It presents two scientific theories and concludes that both are equally unsupported by evidence."
    },
    "A",
    "The passage follows a four-step architecture: (1) established framework (plate tectonics), (2) extension (mantle plume hypothesis), (3) challenge (seismic tomography objections), (4) counter-rebuttal (resolution limits, geochemical consistency). This is a claim-challenge-response structure. Choice A maps this sequence precisely.",
    {
        "B": "Purpose Reversal — The passage does not refute plate tectonics; it notes that hotspots are anomalies the standard model cannot explain, then presents the plume hypothesis as a supplement, not a replacement.",
        "C": "Surface Function — While volcanic activity is discussed, no chronological sequence of eruptions is described; the text's structure is argumentative (claim-counter-response), not narrative.",
        "D": "Scope Error — The passage does not conclude that both theories are 'equally unsupported'; it presents an ongoing debate with evidence cited on multiple sides."
    }
))

# ── Q5 — Literature ──────────────────────────
questions.append(q(
    "In George Eliot's Middlemarch (1871), the narrator pauses the main plot to deliver an extended meditation on the unhistoric lives of ordinary people. Eliot writes that 'the growing good of the world is partly dependent on unhistoric acts,' and that many who lived faithfully a 'hidden life' rest in 'unvisited tombs.' This passage appears to be a sentimental tribute to anonymous virtue. But positioned at the novel's conclusion, after hundreds of pages depicting Dorothea Brooke's frustrated ambitions, the passage functions differently: it reframes Dorothea's apparent failure as a form of success, arguing that diffuse influence matters even when it never crystallizes into public achievement.\n\n— Adapted from George Eliot, Middlemarch, 1871-1872.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To demonstrate that Middlemarch is a sentimental novel primarily concerned with praising ordinary domestic life.",
        "B": "To explain how a passage that appears to be a general moral reflection actually serves the specific narrative function of redefining the protagonist's story arc.",
        "C": "To argue that George Eliot believed public achievement is less valuable than private virtue in all circumstances.",
        "D": "To summarize the plot of Middlemarch for readers who have not read the novel."
    },
    "B",
    "The passage explicitly contrasts how Eliot's meditation 'appears to be' (sentimental tribute) versus how it 'functions' (reframing Dorothea's arc). The author's purpose is to reveal this gap between surface appearance and deeper narrative strategy — precisely the distinction between what a passage seems to do and what it actually accomplishes. Choice B captures this analytical purpose.",
    {
        "A": "Surface Function — This trap accepts the surface reading ('sentimental tribute') that the passage explicitly challenges. The author argues the passage functions strategically, not sentimentally.",
        "C": "Scope Error — The passage does not make a universal claim about Eliot's philosophy ('in all circumstances'); it analyzes one specific passage's function within one novel's conclusion.",
        "D": "Surface Function — While plot elements are mentioned (Dorothea's frustrated ambitions), the text's purpose is analysis of narrative technique, not plot summary."
    }
))

# ── Q6 — History/Social Studies ──────────────
questions.append(q(
    "In his 1963 'Letter from Birmingham Jail,' Martin Luther King Jr. addresses white clergymen who had urged him to wait for a more opportune moment to protest segregation. King's response systematically dismantles the logic of 'wait,' arguing that 'justice too long delayed is justice denied.' Notably, King does not frame his urgency as emotional impatience; instead, he constructs a philosophical argument drawing on Augustine, Aquinas, and the natural law tradition to distinguish just from unjust laws. By grounding his case in the Western intellectual canon that his clerical audience reveres, King transforms an act of civil disobedience into an exercise in moral reasoning that his critics cannot dismiss without repudiating their own traditions.\n\n— Adapted from Martin Luther King Jr., 'Letter from Birmingham Jail,' 1963.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that King's letter was primarily an emotional appeal to the conscience of white Americans.",
        "B": "To analyze how King strategically employed his audience's own intellectual tradition to make his argument logically inescapable for them.",
        "C": "To provide a comprehensive biography of Martin Luther King Jr.'s involvement in the civil rights movement.",
        "D": "To compare King's rhetorical strategy unfavorably with that of other civil rights leaders."
    },
    "B",
    "The passage's analytical focus is on King's strategic choice to use Augustine, Aquinas, and natural law — the very tradition his clerical audience claims — to construct his argument. The key insight is that this choice makes dismissal self-defeating: the critics would have to 'repudiate their own traditions.' The text analyzes rhetorical strategy, not emotion or biography. Choice B captures this.",
    {
        "A": "Purpose Reversal — The passage explicitly states King 'does not frame his urgency as emotional impatience'; it argues the opposite — that he constructs a philosophical argument. This choice inverts the passage's central claim.",
        "C": "Scope Error — The passage analyzes one letter's rhetorical strategy, not King's biography or broader career.",
        "D": "Surface Function — No other civil rights leaders are mentioned or compared; the passage focuses exclusively on King's strategic use of Western intellectual tradition."
    }
))

# ── Q7 — Science ──────────────────────────────
questions.append(q(
    "For decades, researchers assumed that the human gut microbiome was established during infancy and remained relatively stable throughout adulthood. Longitudinal metagenomic studies have challenged this view, revealing that dietary shifts, antibiotic exposure, and geographic relocation can substantially restructure microbial communities within weeks. Yet these perturbations are not random: the microbiome tends to return toward its pre-disturbance configuration once the disrupting factor is removed, a phenomenon termed 'resilience.' Crucially, resilience capacity varies among individuals and declines with age, suggesting that the microbiome's apparent stability in earlier studies may have been an artifact of sampling populations with high resilience rather than evidence of true compositional permanence.\n\n— Adapted from J. Faith et al., \"The Long-Term Stability of the Human Gut Microbiota,\" Science, 2013.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents an established assumption, introduces evidence that complicates it, and then reinterprets the original assumption as potentially an artifact of a confounding variable.",
        "B": "It describes two competing theories of gut microbiome development and concludes that neither is supported by evidence.",
        "C": "It argues that antibiotic use is the most significant threat to human gut health.",
        "D": "It provides a chronological history of microbiome research from its origins to the present."
    },
    "A",
    "The passage moves through three distinct structural phases: (1) old assumption (stable microbiome), (2) complicating evidence (rapid restructuring after perturbation), (3) reinterpretation of stability as an artifact of resilience capacity, not true permanence. The final move is the most sophisticated — it does not simply refute the old view but explains why the old data seemed to support it. Choice A captures this three-phase architecture.",
    {
        "B": "Scope Error — The passage does not present two equally unsupported theories; it traces how one assumption was refined and reinterpreted through newer evidence.",
        "C": "Surface Function — Antibiotic exposure is mentioned as one of several perturbing factors, but the passage's structure is not organized around antibiotic threats; it is about the stability-vs-resilience question.",
        "D": "Surface Function — Although the passage mentions temporal changes in understanding, it does not provide a chronological history of the field; its structure is argumentative (assumption → challenge → reinterpretation)."
    }
))

# ── Q8 — Literature ──────────────────────────
questions.append(q(
    "In Willa Cather's My Ántonia (1918), Jim Burden narrates his childhood memories of Ántonia Shimerda with an intensity that borders on idealization. He describes her vitality, her laugh, her capacity for hard work in terms that seem designed to preserve her as a symbol of frontier resilience. Yet Cather frames the entire narrative as a manuscript Jim has written years later, after becoming a disillusioned corporate lawyer in New York. This framing device transforms the portrait of Ántonia: what appears to be a celebration of her character becomes equally a record of Jim's nostalgia — his need to construct a past untouched by the compromises of his present life.\n\n— Adapted from Willa Cather, My Ántonia, 1918.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that Ántonia Shimerda is an unrealistic character whom Cather fails to develop beyond a stereotype.",
        "B": "To show how Cather's framing device reveals that the novel's portrait of Ántonia is simultaneously a characterization of Jim's psychological need for an idealized past.",
        "C": "To provide a biography of Willa Cather and explain the autobiographical origins of the novel.",
        "D": "To praise Cather's depiction of frontier resilience as historically accurate."
    },
    "B",
    "The passage's analytical purpose is to expose the double function of Cather's framing device: Jim's manuscript 'appears to be a celebration' of Ántonia but 'becomes equally a record of Jim's nostalgia.' The text argues that the framing transforms the surface purpose (character portrait) into something more complex (a revelation of Jim's psychology). Choice B captures this dual-function analysis.",
    {
        "A": "Purpose Reversal — The passage does not criticize Ántonia as unrealistic; it analyzes the narrative device that shapes her portrayal, acknowledging idealization as a deliberate strategy with meaning.",
        "C": "Scope Error — The passage discusses the novel's literary structure, not Cather's biography or the work's autobiographical sources.",
        "D": "Surface Function — The passage does not evaluate historical accuracy; it analyzes how the framing device complicates what 'appears to be' a straightforward celebration."
    }
))

# ── Q9 — History/Social Studies ──────────────
questions.append(q(
    "In The Second Treatise of Government (1689), John Locke argues that political authority derives from the consent of the governed. What is often overlooked in casual readings, however, is Locke's careful qualification: consent need not be explicit. Locke introduces the concept of 'tacit consent,' arguing that anyone who enjoys the benefits of a society — by traveling its roads, owning property under its laws — has implicitly consented to its authority. Critics from Hume onward have noted that this move dramatically expands the reach of Locke's theory, effectively making dissent nearly impossible without physical emigration. The concept appears to protect individual liberty but, in practice, anchors citizens to obligations they never consciously chose.\n\n— Adapted from John Locke, Two Treatises of Government, 1689; and D. Hume, 'Of the Original Contract,' 1748.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents Locke's well-known principle, identifies a less-noticed qualification within it, and then shows how that qualification paradoxically undermines the principle's apparent commitment to individual choice.",
        "B": "It describes Locke's political philosophy and argues that it was universally accepted by subsequent Enlightenment thinkers.",
        "C": "It compares Locke's and Hume's political philosophies and concludes that Hume's is superior.",
        "D": "It provides a chronological account of the development of democratic theory from the seventeenth century to the present."
    },
    "A",
    "The passage follows a three-step structure: (1) the well-known principle (consent of the governed), (2) the often-overlooked qualification (tacit consent), (3) the paradox that this qualification effectively prevents dissent, undermining the liberty the principle claims to protect. This is a principle-qualification-paradox architecture. Choice A maps this precisely.",
    {
        "B": "Scope Error — The passage explicitly cites Hume as a critic of Locke, contradicting the claim of 'universal acceptance.'",
        "C": "Surface Function — While Hume's criticism is mentioned, the passage does not systematically compare two philosophies or declare one 'superior'; Hume is cited as evidence of the paradox within Locke's theory.",
        "D": "Surface Function — The passage analyzes one specific concept (tacit consent) within one text; it does not trace the chronological development of democratic theory."
    }
))

# ── Q10 — Science ─────────────────────────────
questions.append(q(
    "Classical evolutionary theory predicts that cooperation between unrelated individuals should be unstable, since defectors who exploit cooperators gain a fitness advantage. Yet large-scale cooperation among non-kin pervades human societies. Evolutionary game theorists have proposed 'indirect reciprocity' as a solution: individuals cooperate not because they expect direct return favors but because cooperation enhances their reputation, which increases the likelihood that third parties will help them in the future. Computational models demonstrate that reputation-based cooperation can persist even in large anonymous groups, provided that information about individuals' past behavior is sufficiently reliable. When gossip networks are unreliable, however, reputation systems collapse and defection dominates.\n\n— Adapted from M. Nowak and K. Sigmund, \"Evolution of Indirect Reciprocity,\" Nature, 2005.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that all forms of human cooperation can be explained by direct reciprocity between individuals.",
        "B": "To present a theoretical puzzle about cooperation, introduce a proposed solution based on reputation, and identify the conditions under which that solution succeeds or fails.",
        "C": "To prove that gossip is the most important social behavior in human evolution.",
        "D": "To describe a series of laboratory experiments that definitively resolve the debate about human cooperation."
    },
    "B",
    "The passage has a clear three-part structure: (1) puzzle (cooperation shouldn't exist among non-kin), (2) proposed solution (indirect reciprocity via reputation), (3) conditions (reliable information enables cooperation; unreliable gossip collapses it). The purpose is to present a puzzle-solution-conditions framework. Choice B captures all three elements.",
    {
        "A": "Purpose Reversal — The passage explicitly distinguishes indirect reciprocity from direct reciprocity; Choice A claims direct reciprocity explains everything, which is the view the passage moves beyond.",
        "C": "Surface Function — Gossip networks are mentioned as a variable that affects the reputation system, not as the central topic or 'most important social behavior.'",
        "D": "Scope Error — The passage describes 'computational models,' not laboratory experiments, and it presents conditions rather than a 'definitive resolution.'"
    }
))

# ── Q11 — Literature ──────────────────────────
questions.append(q(
    "In Herman Melville's 'Bartleby, the Scrivener' (1853), the narrator — a pragmatic Wall Street lawyer — describes Bartleby's refusal to work with increasing bewilderment. The narrator's lengthy explanations of his own reasonableness appear, on the surface, to be self-justification: he wants the reader to understand that he has been patient and generous. But Melville's irony cuts deeper. The more the narrator protests his charity, the more the reader perceives that his concern for Bartleby is inseparable from his concern for his own reputation and comfort. The self-portrait of benevolence becomes, through accumulation, a self-indictment — a revelation that the narrator's 'charity' is structured around his need to feel virtuous rather than Bartleby's actual welfare.\n\n— Adapted from Herman Melville, 'Bartleby, the Scrivener,' 1853.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To explain how Melville uses the narrator's self-justifying rhetoric to create an ironic self-indictment that reveals the true nature of his supposed charity.",
        "B": "To praise the narrator of 'Bartleby' for his genuine compassion toward a difficult employee.",
        "C": "To argue that Bartleby is the true protagonist of the story and that the narrator is merely a minor character.",
        "D": "To summarize the legal disputes that drive the plot of 'Bartleby, the Scrivener.'"
    },
    "A",
    "The passage traces a specific ironic mechanism: the narrator's self-justifying rhetoric ('protests his charity') accumulates until it reveals the opposite of what the narrator intends (self-indictment). The text's purpose is to analyze how Melville's irony transforms apparent benevolence into exposed self-interest. Choice A identifies this analytical purpose precisely.",
    {
        "B": "Purpose Reversal — The passage argues that the narrator's 'charity' is actually self-serving ('structured around his need to feel virtuous'). Praising his compassion as genuine directly contradicts the passage's thesis.",
        "C": "Scope Error — The passage analyzes the narrator's rhetorical self-portrayal and Melville's ironic technique; it does not make claims about character hierarchy or who the 'true protagonist' is.",
        "D": "Surface Function — No legal disputes are mentioned; the passage focuses entirely on narrative technique and irony."
    }
))

# ── Q12 — History/Social Studies ──────────────
questions.append(q(
    "In 'A Vindication of the Rights of Woman' (1792), Mary Wollstonecraft does not simply demand that women receive the same education as men. Her argument is more structurally complex: she first concedes that women in her era are indeed frivolous and vain, accepting the very characterization her opponents deploy against them. Only then does she pivot, attributing these traits not to female nature but to the deficient education system that cultivates them. By conceding the symptoms while reattributing the cause, Wollstonecraft transforms what appears to be an admission of weakness into an indictment of the social order that produces that weakness.\n\n— Adapted from Mary Wollstonecraft, A Vindication of the Rights of Woman, 1792.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To analyze how Wollstonecraft's rhetorical strategy of conceding her opponents' characterization of women before reattributing its cause transforms an apparent admission into an indictment.",
        "B": "To argue that Wollstonecraft agreed with her critics that women were inherently inferior to men.",
        "C": "To provide a comprehensive summary of all the arguments in A Vindication of the Rights of Woman.",
        "D": "To compare Wollstonecraft's views on education with those of Jean-Jacques Rousseau."
    },
    "A",
    "The passage focuses on a specific rhetorical move: concede-then-reattribute. The analytical purpose is to show how this structure converts what seems like agreement with opponents into an argument against them. The key phrase 'transforms what appears to be an admission of weakness into an indictment' signals the author's interest in the gap between surface and strategic function. Choice A captures this.",
    {
        "B": "Purpose Reversal — The passage explicitly states Wollstonecraft attributes women's failings to 'deficient education,' NOT to inherent inferiority. Accepting the surface concession without the reattribution inverts the argument.",
        "C": "Scope Error — The passage analyzes one specific rhetorical strategy, not the totality of Wollstonecraft's arguments in the treatise.",
        "D": "Surface Function — While Rousseau's influence on Wollstonecraft is a common topic in scholarship, the passage does not mention Rousseau or make any comparison."
    }
))

# ── Q13 — Science ─────────────────────────────
questions.append(q(
    "Mitochondrial DNA (mtDNA) has long been the preferred molecular clock for reconstructing evolutionary timelines because it mutates at a relatively constant rate and is inherited maternally, avoiding the complications of recombination. However, recent analyses have revealed that mtDNA mutation rates vary significantly among lineages and even among different regions of the mitochondrial genome itself. More troublingly, studies comparing molecular dates with well-calibrated fossil records have found systematic discrepancies: molecular clocks consistently overestimate the age of recent divergences and underestimate ancient ones. These findings do not invalidate molecular dating, but they demand that researchers calibrate their clocks with multiple fossil reference points rather than assuming a single universal rate.\n\n— Adapted from S. Ho et al., \"Time-Dependent Rates of Molecular Evolution,\" Molecular Ecology, 2011.",
    "Which choice best describes the function of the final sentence in the context of the overall passage?",
    {
        "A": "It dismisses the preceding evidence as inconclusive and defends the original molecular clock methodology.",
        "B": "It qualifies the critique by affirming the value of molecular dating while specifying how the practice must be reformed in light of the evidence presented.",
        "C": "It introduces an entirely new topic unrelated to the preceding discussion.",
        "D": "It restates the passage's opening claim that mtDNA is the ideal tool for evolutionary analysis."
    },
    "B",
    "The final sentence opens with 'do not invalidate,' which preserves the method's legitimacy, and then requires calibration with 'multiple fossil reference points,' specifying the reform needed. This is a qualification move: it prevents the reader from drawing an overly negative conclusion from the preceding critique while still insisting on methodological change. Choice B captures both the affirmation and the reform demand.",
    {
        "A": "Purpose Reversal — The sentence does not 'dismiss' the evidence; it explicitly retains the critique ('demand that researchers calibrate') while preventing overinterpretation ('do not invalidate').",
        "C": "Surface Function — The sentence directly responds to the problems discussed in the preceding sentences; it is not a non sequitur.",
        "D": "Purpose Reversal — The passage has spent its middle section challenging the original methodology; the final sentence does not restore the opening position but modifies it."
    }
))

# ── Q14 — Literature ──────────────────────────
questions.append(q(
    "In Oscar Wilde's The Importance of Being Earnest (1895), the dialogue is structured around a pervasive pattern of inversion: characters state moral truisms and then immediately reverse them. Lady Bracknell declares that 'ignorance is like a delicate exotic fruit; touch it and the bloom is off,' transforming a defense of ignorance into an epigram with the rhythm of proverbial wisdom. On the surface, these inversions generate comedy. Yet their cumulative effect is more corrosive: by giving absurd propositions the syntactic form of self-evident truths, Wilde exposes how much social authority depends on rhetorical form rather than logical content. The play's humor is inseparable from its critique.\n\n— Adapted from Oscar Wilde, The Importance of Being Earnest, 1895.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It identifies a recurring rhetorical pattern in Wilde's dialogue, acknowledges its obvious comic effect, and then argues that its deeper function is social critique.",
        "B": "It catalogues the funniest lines in The Importance of Being Earnest and ranks them by comedic effectiveness.",
        "C": "It argues that Wilde's play is not actually a comedy but a political treatise disguised as entertainment.",
        "D": "It compares Wilde's use of inversion with similar techniques in the plays of George Bernard Shaw."
    },
    "A",
    "The passage moves from identification (the inversion pattern) through surface effect (comedy) to deeper function (social critique of how authority depends on rhetorical form). The transitional 'yet' signals the move from obvious to deeper purpose. Choice A maps this three-step architecture: pattern → surface effect → deeper function.",
    {
        "B": "Surface Function — The passage uses Lady Bracknell's line as one example to illustrate a pattern, not as part of a ranking exercise.",
        "C": "Scope Error — The passage explicitly states that the play's 'humor is inseparable from its critique,' meaning comedy and critique coexist; it does not deny the comedy.",
        "D": "Surface Function — No comparison with Shaw or any other playwright is made; the passage analyzes Wilde's technique in isolation."
    }
))

# ── Q15 — History/Social Studies ──────────────
questions.append(q(
    "In Federalist No. 10, James Madison addresses the problem of faction — groups of citizens united by an interest 'adverse to the rights of other citizens.' Rather than proposing to eliminate faction, which he considers impossible without destroying liberty itself, Madison argues that a large republic can control faction's effects. His reasoning is counterintuitive: a larger electorate, he contends, is more likely to elect representatives of 'fit character,' and a greater diversity of interests makes it harder for any single faction to form a majority. Madison thus converts the apparent weakness of size — the ungovernable sprawl that critics associated with large republics — into a structural advantage.\n\n— Adapted from James Madison, Federalist No. 10, 1787.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To explain how Madison reframes the size of a republic, traditionally seen as a vulnerability, into a mechanism that controls factional power.",
        "B": "To argue that Madison believed all political factions should be banned by constitutional amendment.",
        "C": "To provide a detailed comparison of Madison's and Hamilton's views on federalism.",
        "D": "To describe the specific faction that most concerned Madison during the Constitutional Convention."
    },
    "A",
    "The passage's analytical purpose is to show how Madison inverts a perceived liability (large size = ungovernable) into an asset (large size = protection against majority faction). The key phrase 'converts the apparent weakness of size into a structural advantage' signals that the text is analyzing a rhetorical and logical reframing. Choice A captures this reframing analysis.",
    {
        "B": "Purpose Reversal — Madison explicitly considers eliminating faction 'impossible without destroying liberty'; he seeks to control faction's effects, not ban factions.",
        "C": "Scope Error — Hamilton is not mentioned in the passage; the analysis focuses exclusively on Madison's argument in Federalist No. 10.",
        "D": "Surface Function — The passage discusses Madison's theoretical framework for controlling faction in general, not any specific historical faction."
    }
))

# ── Q16 — Science ─────────────────────────────
questions.append(q(
    "Antibiotic resistance is frequently framed in public health discourse as a modern crisis accelerated by the overuse of antimicrobial drugs. While overprescription is undeniably a driver, paleogenomic studies have complicated this narrative by identifying antibiotic resistance genes in ancient bacterial DNA extracted from 30,000-year-old permafrost sediments. These genes conferred resistance to classes of antibiotics that were not synthesized until the twentieth century. The implication is that resistance mechanisms predate human antibiotic use by millennia, having evolved in response to natural antibiotic compounds produced by soil microorganisms. Modern overuse, therefore, does not create resistance de novo but accelerates the spread of pre-existing genetic adaptations.\n\n— Adapted from V. D'Costa et al., \"Antibiotic Resistance Is Ancient,\" Nature, 2011.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that antibiotic overprescription is not a significant public health concern.",
        "B": "To complicate the common framing of antibiotic resistance as a purely modern phenomenon by presenting evidence that resistance mechanisms are ancient, while acknowledging that human activity accelerates their spread.",
        "C": "To describe the laboratory methods used in paleogenomic analysis of permafrost sediments.",
        "D": "To compare the effectiveness of modern antibiotics with naturally occurring antimicrobial compounds in soil."
    },
    "B",
    "The passage opens with the 'common framing' (modern crisis from overuse), then introduces paleogenomic evidence that resistance is ancient, and finally reconciles both in the final sentence: overuse 'accelerates the spread of pre-existing adaptations.' The purpose is to complicate — not refute — the standard narrative. Choice B captures this nuanced position.",
    {
        "A": "Purpose Reversal — The passage explicitly states that overprescription is 'undeniably a driver'; it does not dismiss overprescription as insignificant.",
        "C": "Surface Function — Paleogenomic studies are mentioned as a source of evidence, but the passage does not describe laboratory methods; its purpose is argumentative, not methodological.",
        "D": "Surface Function — Soil microorganisms are mentioned as a source of natural antibiotics, but the passage does not compare their effectiveness with modern drugs."
    }
))

# ── Q17 — Literature ──────────────────────────
questions.append(q(
    "In Jane Austen's Persuasion (1817), the narrator describes Sir Walter Elliot's habit of consulting the Baronetage — the registry of titled families — as his favorite reading. What seems like a minor comic detail accumulates significance throughout the novel: Sir Walter's obsession with genealogical rank blinds him to the merit of self-made naval officers like Captain Wentworth. The Baronetage, initially presented as a harmless vanity, becomes by the novel's end an emblem of the entire social system Austen is interrogating — one that values inherited title over demonstrated competence, and that must be surpassed before the protagonists can achieve happiness.\n\n— Adapted from Jane Austen, Persuasion, 1817.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It introduces what appears to be a minor comic detail and traces how it accrues symbolic significance, ultimately functioning as an emblem of the novel's central social critique.",
        "B": "It argues that Persuasion is Austen's least successful novel because it relies too heavily on small details.",
        "C": "It contrasts Sir Walter Elliot's reading habits with those of Captain Wentworth.",
        "D": "It provides a historical account of the Baronetage as an institution in British society."
    },
    "A",
    "The passage follows a trajectory from surface (comic detail) to depth (symbolic emblem of social critique). The phrases 'what seems like a minor comic detail' and 'becomes by the novel's end an emblem' map a clear surface-to-depth progression. Choice A captures this analytical trajectory.",
    {
        "B": "Scope Error — The passage does not evaluate the novel's quality or compare it with other Austen novels; it analyzes how one detail functions within the novel.",
        "C": "Surface Function — While Wentworth is mentioned as a contrast to Sir Walter, the passage does not discuss Wentworth's reading habits; the contrast is about social values, not literary preferences.",
        "D": "Surface Function — The Baronetage is mentioned as a symbolic object within the novel, not as a historical institution to be described in its own right."
    }
))

# ── Q18 — History/Social Studies ──────────────
questions.append(q(
    "In 'Self-Reliance' (1841), Ralph Waldo Emerson famously asserts that 'a foolish consistency is the hobgoblin of little minds.' This aphorism is frequently cited as a celebration of intellectual flexibility. In context, however, Emerson's argument is more radical: he contends that consistency itself — the demand that one's current beliefs align with one's past statements — is a form of cowardice. To be 'misunderstood,' Emerson argues, is the inevitable result of honest thinking, because a mind genuinely engaged with truth will outgrow its earlier positions. The passage thus redefines what conventionally appears to be a character flaw (inconsistency) as evidence of intellectual courage.\n\n— Adapted from Ralph Waldo Emerson, 'Self-Reliance,' 1841.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To show that, in context, Emerson's famous aphorism advances a more radical argument than the popular reading suggests — redefining inconsistency as intellectual courage rather than merely endorsing flexibility.",
        "B": "To argue that Emerson was personally inconsistent in his philosophical views and that this inconsistency weakened his credibility.",
        "C": "To compare Emerson's concept of self-reliance with Thoreau's concept of civil disobedience.",
        "D": "To summarize all major ideas in Emerson's essay 'Self-Reliance.'"
    },
    "A",
    "The passage distinguishes the 'frequently cited' popular reading (celebration of flexibility) from the 'more radical' contextual meaning (inconsistency as courage, consistency as cowardice). The text's purpose is to reveal that the deeper argument exceeds the common interpretation. Choice A captures this analytical purpose of distinguishing popular from contextual meaning.",
    {
        "B": "Purpose Reversal — The passage argues that Emerson DEFENDS inconsistency as intellectual courage; it does not criticize him for being inconsistent or claim his credibility is weakened.",
        "C": "Scope Error — Thoreau and civil disobedience are not mentioned; the passage focuses solely on Emerson's argument about consistency.",
        "D": "Scope Error — The passage analyzes one specific argument within the essay, not the essay's full range of ideas."
    }
))

# ── Q19 — Science ─────────────────────────────
questions.append(q(
    "The 'grandmother hypothesis' proposes that human menopause evolved because post-reproductive women who assisted in rearing grandchildren enhanced their descendants' survival, thereby spreading genes for early cessation of fertility. A recent analysis of historical Finnish church records tested this hypothesis by examining whether the presence of a maternal grandmother correlated with grandchild survival rates. The results were mixed: grandmothers who lived nearby significantly improved infant survival, but grandmothers who resided with the family actually correlated with slightly higher child mortality, possibly due to resource competition within the household. The study thus partially supports the grandmother hypothesis while revealing that the relationship between grandmaternal presence and fitness is contingent on ecological and social conditions.\n\n— Adapted from V. Lummaa et al., \"Fitness Benefits of Prolonged Post-Reproductive Lifespan,\" Nature, 2004.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It introduces a hypothesis, describes a study that tested it, presents mixed results that partially support and partially complicate the hypothesis, and identifies the conditions on which the relationship depends.",
        "B": "It argues that menopause is a maladaptive trait that evolution failed to eliminate.",
        "C": "It describes the Finnish church records as a primary source for understanding Scandinavian religious history.",
        "D": "It refutes the grandmother hypothesis by showing that grandmothers have no effect on child survival."
    },
    "A",
    "The passage follows a hypothesis-test-results-qualification structure: (1) the grandmother hypothesis, (2) the Finnish study, (3) mixed results (nearby = beneficial, co-resident = harmful), (4) conclusion that the relationship depends on conditions. Choice A maps all four structural phases.",
    {
        "B": "Purpose Reversal — The passage presents evidence that post-reproductive lifespan CAN be adaptive (nearby grandmothers improve survival); it does not argue menopause is 'maladaptive.'",
        "C": "Surface Function — The church records are mentioned only as a data source for the survival analysis, not as objects of interest for religious history.",
        "D": "Scope Error — The results are 'mixed,' not uniformly negative; nearby grandmothers significantly improved survival, partially supporting the hypothesis."
    }
))

# ── Q20 — Literature ──────────────────────────
questions.append(q(
    "In Nathaniel Hawthorne's The Scarlet Letter (1850), the narrator's opening chapter describes the prison door and the rosebush beside it with equal attention. The rosebush, the narrator suggests, may have 'survived out of the stern old wilderness' or 'sprung up under the footsteps of the sainted Ann Hutchinson.' By offering two contradictory origins — natural survival and miraculous growth — without resolving the ambiguity, Hawthorne signals to the reader that the novel will resist single explanations. The rosebush thus functions not as a symbol with a fixed meaning but as a declaration of interpretive method: the narrative will consistently present multiple possible readings without privileging one.\n\n— Adapted from Nathaniel Hawthorne, The Scarlet Letter, 1850.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that the rosebush represents Ann Hutchinson and that Hawthorne intended a single allegorical meaning.",
        "B": "To explain how the rosebush passage functions as a meta-narrative signal — a declaration that the novel will sustain interpretive ambiguity rather than resolve it.",
        "C": "To describe the botanical characteristics of wild roses in seventeenth-century New England.",
        "D": "To provide background information about Ann Hutchinson's trial and banishment from the Massachusetts Bay Colony."
    },
    "B",
    "The passage argues that the rosebush is not just a symbol but a 'declaration of interpretive method' — it signals how the novel will handle meaning throughout. The purpose is to show how a seemingly decorative detail functions as a programmatic statement about the narrative's approach to ambiguity. Choice B captures this meta-narrative analysis.",
    {
        "A": "Purpose Reversal — The passage explicitly states that Hawthorne 'offers two contradictory origins without resolving the ambiguity,' directly contradicting the claim of 'a single allegorical meaning.'",
        "C": "Surface Function — The rosebush is discussed as a literary device, not as a botanical specimen; no botanical characteristics are described.",
        "D": "Surface Function — Ann Hutchinson is mentioned within the passage to illustrate one of the two possible origins, but the text does not provide historical background about her trial."
    }
))

# ── Q21 — History/Social Studies ──────────────
questions.append(q(
    "In her 1851 speech 'Ain't I a Woman?', Sojourner Truth responds to male speakers who had argued that women are too delicate to deserve political rights. Truth's counter-strategy is striking: rather than arguing that women are not delicate, she recounts her own experiences of grueling physical labor — plowing, planting, bearing thirteen children — and asks, 'And ain't I a woman?' The rhetorical question does not reject femininity; it expands the definition. By demonstrating that she is indisputably a woman who has endured hardships far exceeding those of the men who claim women are fragile, Truth exposes the opposition's argument as based not on women's actual nature but on a definition of womanhood that excludes Black women.\n\n— Adapted from Sojourner Truth, 'Ain't I a Woman?', 1851.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To analyze how Truth's rhetorical strategy redefines womanhood by expanding its definition rather than rejecting the category, thereby exposing the racial bias in her opponents' argument.",
        "B": "To provide a biographical account of Sojourner Truth's life as an enslaved person.",
        "C": "To argue that Truth's speech was less effective than other abolitionist arguments of the same period.",
        "D": "To explain that Truth's speech was primarily concerned with labor rights rather than gender equality."
    },
    "A",
    "The passage focuses on how Truth's rhetorical question functions strategically: it 'does not reject femininity; it expands the definition.' The analytical purpose is to show how this expansion exposes the opposition's 'definition of womanhood that excludes Black women.' Choice A captures both the strategy (redefine rather than reject) and the exposure of racial bias.",
    {
        "B": "Scope Error — The passage analyzes Truth's rhetorical strategy, not her biography. While her experiences are mentioned, they are cited as rhetorical evidence, not biographical narrative.",
        "C": "Surface Function — The passage does not evaluate the speech's effectiveness relative to other arguments; it analyzes its internal rhetorical mechanism.",
        "D": "Purpose Reversal — The passage explicitly frames Truth's argument as being about the definition of womanhood and the racial bias in gender arguments, not about labor rights per se."
    }
))

# ── Q22 — Science ─────────────────────────────
questions.append(q(
    "For decades, neuroscientists believed that adult neurogenesis — the production of new neurons in the mature brain — was limited to two regions: the hippocampus and the olfactory bulb. A landmark 2018 study challenged even this limited consensus by reporting that adult hippocampal neurogenesis in humans declines sharply after childhood and is undetectable in adults, based on examination of postmortem brain tissue. Within months, however, a competing team published findings using different tissue preparation methods and antibody markers, reporting robust neurogenesis in human adults up to the ninth decade of life. The controversy hinges not on theoretical disagreement but on methodological divergence: the tissues degrade rapidly after death, and different fixation protocols may preserve or destroy the markers of new neurons.\n\n— Adapted from S. Sorrells et al. and M. Boldrini et al., contrasting studies published in Nature and Cell Stem Cell, 2018.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents a longstanding consensus, describes a study that challenged it, introduces a counter-study that contradicts the challenge, and identifies a methodological root cause for the conflicting results.",
        "B": "It argues that adult neurogenesis has been definitively proven impossible in humans.",
        "C": "It describes the career trajectories of the two competing research teams.",
        "D": "It explains the biological mechanisms by which new neurons are produced in the hippocampus."
    },
    "A",
    "The passage follows a four-phase structure: (1) consensus (neurogenesis in two regions), (2) challenge (2018 study finds no adult neurogenesis), (3) counter-challenge (competing study finds robust neurogenesis), (4) root cause analysis (methodological divergence in tissue preparation). Choice A maps all four phases.",
    {
        "B": "Scope Error — The passage presents conflicting evidence and identifies methodological sources of disagreement; it does not claim neurogenesis has been 'definitively proven impossible.'",
        "C": "Surface Function — The passage discusses the studies' methods and findings, not the researchers' personal careers.",
        "D": "Surface Function — The passage does not explain the biological mechanisms of neurogenesis; it analyzes the structure of a scientific controversy."
    }
))

# ── Q23 — Literature ──────────────────────────
questions.append(q(
    "In Fyodor Dostoevsky's Crime and Punishment (1866), Raskolnikov's confession to Sonya occurs not in a dramatic public setting but in a cramped, impoverished room. Dostoevsky describes the physical details — the peeling wallpaper, the crooked furniture, the dim light — with a precision that seems merely atmospheric. Yet these details mirror Raskolnikov's psychological state: the room's decay reflects his moral disintegration, while its enclosure dramatizes his entrapment. By locating the confession in such a space, Dostoevsky ensures that the setting does not merely background the action but participates in it, making the physical environment an extension of the character's internal crisis.\n\n— Adapted from Fyodor Dostoevsky, Crime and Punishment, 1866.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To explain how Dostoevsky's detailed setting description functions not as mere atmosphere but as an active extension of the protagonist's psychological state during a pivotal scene.",
        "B": "To argue that Dostoevsky was primarily interested in realistic depictions of urban poverty rather than psychological exploration.",
        "C": "To compare the confession scene in Crime and Punishment with similar scenes in other Russian novels.",
        "D": "To describe the architectural style of nineteenth-century St. Petersburg apartments."
    },
    "A",
    "The passage distinguishes the 'surface' reading of the setting details (atmospheric description) from their deeper function (mirroring Raskolnikov's psychology). The key phrase 'seems merely atmospheric' signals the surface-vs-depth distinction. The purpose is to show that setting 'participates in' the action rather than merely backgrounding it. Choice A captures this analysis.",
    {
        "B": "Purpose Reversal — The passage argues that physical details serve psychological exploration, not that Dostoevsky prioritizes realistic description over psychology. This choice inverts the passage's hierarchy.",
        "C": "Scope Error — No other Russian novels are mentioned or compared.",
        "D": "Surface Function — The passage discusses architectural details as literary devices, not as historical documentation of St. Petersburg architecture."
    }
))

# ── Q24 — History/Social Studies ──────────────
questions.append(q(
    "Abraham Lincoln's Gettysburg Address (1863) begins by invoking the founding of the nation — 'Four score and seven years ago' — rather than the battle itself. This temporal displacement has often been noted but rarely analyzed for its rhetorical function. By dating the nation's birth to 1776 (the Declaration of Independence) rather than 1788 (the Constitution's ratification), Lincoln implicitly commits to the Declaration's principle that 'all men are created equal' as the nation's foundational premise. This seemingly neutral chronological reference thus performs constitutional argument: it subordinates the Constitution, which permitted slavery, to the Declaration, which asserted equality, reframing the Civil War as a test of the Declaration's unfulfilled promise.\n\n— Adapted from Garry Wills, Lincoln at Gettysburg, 1992.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To reveal how Lincoln's seemingly neutral dating of the nation's founding functions as a covert constitutional argument that privileges the Declaration of Independence over the Constitution.",
        "B": "To provide a chronological account of the Battle of Gettysburg and its military significance.",
        "C": "To argue that Lincoln considered the Constitution a fundamentally flawed document that should be abolished.",
        "D": "To compare the Gettysburg Address with other Civil War speeches by Union and Confederate leaders."
    },
    "A",
    "The passage analyzes a specific rhetorical move: Lincoln's choice of 1776 over 1788 as the founding date. The text shows this is not neutral but 'performs constitutional argument' by subordinating the Constitution to the Declaration. The purpose is to expose the strategic function concealed within an apparently simple chronological reference. Choice A captures this.",
    {
        "B": "Surface Function — The passage does not describe the battle; it analyzes the rhetorical structure of Lincoln's speech about the battle.",
        "C": "Scope Error — The passage says Lincoln 'subordinates' the Constitution to the Declaration in rhetorical priority, not that he wanted it abolished. Subordination is not abolition.",
        "D": "Surface Function — No other speeches are mentioned or compared; the analysis focuses exclusively on the Gettysburg Address."
    }
))

# ── Q25 — Science ─────────────────────────────
questions.append(q(
    "The discovery of CRISPR-Cas9 gene editing was widely celebrated as a revolutionary tool for precision medicine, with early media coverage emphasizing its potential to cure genetic diseases. Subsequent research, however, has revealed significant off-target effects: the Cas9 enzyme sometimes cuts DNA at unintended sites, potentially causing dangerous mutations. These findings do not render CRISPR useless, but they have redirected the field's focus from therapeutic applications to the development of high-fidelity variants — engineered versions of Cas9 with reduced off-target activity. The narrative arc of CRISPR research thus illustrates a pattern common in biotechnology: initial euphoria followed by sobering complexity, which in turn catalyzes more refined approaches.\n\n— Adapted from E. Doudna and E. Charpentier, \"Genome Editing,\" Science, 2014; and review in Nature Reviews Genetics, 2019.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It traces a three-stage pattern — initial optimism, complicating evidence, and adaptive refinement — using CRISPR as a case study of a broader biotechnology cycle.",
        "B": "It argues that CRISPR technology has been proven too dangerous for any medical application.",
        "C": "It describes the molecular mechanism of CRISPR-Cas9 gene editing in technical detail.",
        "D": "It compares CRISPR with previous gene-editing technologies and concludes that older methods are superior."
    },
    "A",
    "The passage maps CRISPR's trajectory onto a three-stage pattern explicitly: 'initial euphoria' → 'sobering complexity' → 'more refined approaches.' The final sentence identifies this as 'a pattern common in biotechnology,' revealing that CRISPR functions as a case study of a broader cycle. Choice A captures both the three stages and the case-study function.",
    {
        "B": "Purpose Reversal — The passage states that off-target effects 'do not render CRISPR useless'; it argues for refinement, not abandonment.",
        "C": "Surface Function — The passage mentions Cas9 cutting DNA, but its purpose is to trace a narrative arc, not to explain molecular mechanisms.",
        "D": "Surface Function — No previous gene-editing technologies are mentioned or compared."
    }
))

# ── Q26 — Literature ──────────────────────────
questions.append(q(
    "In Virginia Woolf's Mrs Dalloway (1925), the character Septimus Warren Smith — a shell-shocked war veteran — inhabits a narrative thread that appears entirely separate from Clarissa Dalloway's society preparations. The two characters never meet. Yet Woolf connects them through shared imagery: both respond to the striking of Big Ben, both perceive London's skywriting airplane, and both experience moments of transcendent beauty interrupted by the intrusion of social obligation. These parallels create a structural argument that Woolf never states explicitly: mental illness and social performance are not opposite conditions but parallel responses to the same pressure — the demand that the self conform to external expectations.\n\n— Adapted from Virginia Woolf, Mrs Dalloway, 1925.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To show how Woolf uses structural parallels between two characters who never meet to make an implicit argument that their seemingly opposite conditions are actually parallel responses to the same social pressure.",
        "B": "To provide a medical explanation of shell shock and its symptoms during World War I.",
        "C": "To argue that Mrs Dalloway would be a better novel if Septimus and Clarissa had interacted directly.",
        "D": "To describe the historical significance of Big Ben and skywriting airplanes in 1920s London."
    },
    "A",
    "The passage analyzes how Woolf's structural design — two separate narrative threads connected through shared imagery — creates an 'argument that Woolf never states explicitly.' The purpose is to reveal how structure itself makes an argument about the relationship between mental illness and social performance. Choice A captures this structural-argument analysis.",
    {
        "B": "Scope Error — The passage mentions shell shock only to identify Septimus's condition; it does not explain the medical condition or its symptoms.",
        "C": "Scope Error — The passage analyzes Woolf's structural choice as effective, not deficient; it does not propose alternative narrative designs.",
        "D": "Surface Function — Big Ben and the airplane are discussed as structural devices connecting two characters, not as objects of historical interest."
    }
))

# ── Q27 — History/Social Studies ──────────────
questions.append(q(
    "In 'Civil Disobedience' (1849), Henry David Thoreau argues that citizens have a moral obligation to disobey unjust laws. What distinguishes Thoreau's version of this ancient argument is his insistence on individual action rather than collective movement. He does not call for organized protest or political parties; he calls for each person to 'be a counter-friction to stop the machine.' This emphasis on solitary resistance appears to be a weakness — a philosopher's impracticality. Yet Thoreau's strategic purpose is to preempt the objection that individuals cannot change systems: by making the unit of resistance the single conscience rather than the organized coalition, he eliminates the excuse that one person is too few to matter.\n\n— Adapted from Henry David Thoreau, 'Civil Disobedience,' 1849.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that Thoreau's insistence on individual action was naive and politically ineffective.",
        "B": "To explain how Thoreau's emphasis on solitary resistance, which appears impractical, actually serves the strategic purpose of eliminating the excuse that individual action is powerless.",
        "C": "To compare Thoreau's approach to civil disobedience with Mahatma Gandhi's philosophy of nonviolent mass resistance.",
        "D": "To provide a historical account of the specific unjust laws Thoreau was protesting."
    },
    "B",
    "The passage distinguishes the surface reading of Thoreau's emphasis on individual action ('appears to be a weakness — a philosopher's impracticality') from its 'strategic purpose' (preempting the excuse that one person cannot matter). The text's purpose is to show how what looks like a flaw is actually a rhetorical strength. Choice B captures this surface-vs-strategy distinction.",
    {
        "A": "Purpose Reversal — The passage argues the opposite: that the emphasis on individual action serves a strategic purpose. Calling it 'naive and politically ineffective' accepts the surface reading that the passage explicitly challenges.",
        "C": "Scope Error — Gandhi is not mentioned; the passage analyzes Thoreau's argument in isolation.",
        "D": "Surface Function — While the passage references 'unjust laws,' it does not specify or historically narrate the laws Thoreau protested; its focus is on his rhetorical strategy."
    }
))

# ── Q28 — Science ─────────────────────────────
questions.append(q(
    "Circadian rhythms — biological cycles of approximately 24 hours — were long assumed to be driven exclusively by light-dark cycles. The discovery of clock genes in the 1990s, however, demonstrated that circadian rhythms are endogenous: they persist even in the absence of external light cues, driven by transcription-translation feedback loops within individual cells. This finding initially seemed to diminish the importance of environmental light. Subsequent research reversed that interpretation by showing that light does not merely trigger rhythms but entrains them — synchronizing the autonomous cellular clocks to the solar cycle and to each other. Without light entrainment, individual cellular clocks drift out of phase, leading to internal desynchrony and metabolic dysfunction.\n\n— Adapted from J. Takahashi, \"Transcriptional Architecture of the Mammalian Circadian Clock,\" Nature Reviews Genetics, 2017.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It traces a sequence of scientific revisions: an original assumption is overturned by genetic evidence, which is then itself reinterpreted to restore a modified role for the original factor.",
        "B": "It argues that clock genes are irrelevant to understanding circadian rhythms.",
        "C": "It describes the evolutionary origins of circadian rhythms in early single-celled organisms.",
        "D": "It presents a simple cause-and-effect relationship between light exposure and sleep quality."
    },
    "A",
    "The passage moves through three stages: (1) old assumption (light drives rhythms), (2) genetic revision (endogenous clocks, light seems diminished), (3) re-revision (light restored as entrainment mechanism). This is a revision-of-revision structure where the original factor is restored in a modified role. Choice A captures this sophisticated three-stage architecture.",
    {
        "B": "Purpose Reversal — The passage describes clock genes as a genuine discovery that demonstrated endogenous rhythms; it does not argue they are 'irrelevant.'",
        "C": "Surface Function — The passage does not discuss evolutionary origins or single-celled organisms; it traces the history of scientific understanding.",
        "D": "Scope Error — The passage discusses complex feedback loops and cellular synchronization, not a 'simple cause-and-effect' relationship, and does not mention sleep quality specifically."
    }
))

# ── Q29 — Literature ──────────────────────────
questions.append(q(
    "In Leo Tolstoy's Anna Karenina (1877), the novel's famous opening — 'All happy families are alike; each unhappy family is unhappy in its own way' — is typically read as an observation about family dynamics. Yet the sentence also functions as a structural prospectus for the novel itself: Tolstoy will devote comparatively little attention to the 'alike' happiness of the Levin-Kitty plot and extensive, individuated attention to the distinct varieties of unhappiness in the Anna-Vronsky and Dolly-Oblonsky storylines. The opening aphorism thus announces the novel's allocation of narrative energy: sameness requires less telling than difference, and difference — the engine of narrative itself — is the province of suffering.\n\n— Adapted from Leo Tolstoy, Anna Karenina, 1877.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To reinterpret Tolstoy's famous opening as a structural plan for the novel's narrative distribution rather than merely an observation about family life.",
        "B": "To argue that Tolstoy believed happy families are unworthy of literary attention.",
        "C": "To summarize the plot relationships of all the main characters in Anna Karenina.",
        "D": "To compare Tolstoy's opening sentence with opening sentences of other nineteenth-century Russian novels."
    },
    "A",
    "The passage distinguishes the 'typical reading' (observation about family dynamics) from a deeper reading (structural prospectus for the novel's narrative allocation). The purpose is to show that the opening sentence functions as more than what it appears — it is a meta-narrative announcement. Choice A captures this reinterpretation.",
    {
        "B": "Scope Error — The passage says happiness requires 'less telling,' not that it is 'unworthy.' Tolstoy includes the Levin-Kitty plot; he simply gives it proportionally less space.",
        "C": "Surface Function — While character pairings are mentioned, they are cited as evidence for the structural argument, not as a comprehensive plot summary.",
        "D": "Surface Function — No other novels' opening sentences are mentioned or compared."
    }
))

# ── Q30 — History/Social Studies ──────────────
questions.append(q(
    "In The Prince (1532), Niccolò Machiavelli advises rulers that it is better to be feared than loved, 'if one cannot be both.' This conditional clause — 'if one cannot be both' — is frequently omitted when the passage is quoted, transforming a pragmatic concession into an endorsement of cruelty. Machiavelli's actual argument is structural: he observes that love depends on the gratitude of subjects, which is unreliable, while fear depends on the threat of punishment, which the prince controls. The preference for fear is therefore not a celebration of tyranny but a risk-management calculus. By framing the choice as a constraint problem rather than a moral one, Machiavelli shifts political theory from ethics to mechanics.\n\n— Adapted from Niccolò Machiavelli, The Prince, 1532.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To show how the common misquotation of Machiavelli transforms a conditional, risk-based argument into an apparent endorsement of cruelty, distorting the original text's pragmatic logic.",
        "B": "To argue that Machiavelli was a cruel tyrant who advocated for the oppression of all citizens.",
        "C": "To provide a historical biography of Machiavelli and the political circumstances of Renaissance Florence.",
        "D": "To compare Machiavelli's political advice with that of Aristotle's Politics."
    },
    "A",
    "The passage's purpose is to correct a misreading by restoring the conditional clause and showing that Machiavelli's argument is about risk management, not moral endorsement of cruelty. The text distinguishes what the passage 'appears to say' when misquoted from what it 'actually argues' in context. Choice A captures this corrective analysis.",
    {
        "B": "Purpose Reversal — The passage explicitly argues against reading Machiavelli as celebrating tyranny; it reframes his argument as pragmatic risk calculation.",
        "C": "Scope Error — The passage analyzes one specific argument in The Prince, not Machiavelli's biography or political context.",
        "D": "Surface Function — Aristotle is not mentioned; the passage focuses exclusively on Machiavelli's text."
    }
))

# ── Q31 — Science ─────────────────────────────
questions.append(q(
    "Photosynthetic organisms convert sunlight into chemical energy with remarkable efficiency, yet the theoretical maximum conversion rate — around 11% for C3 plants under optimal conditions — is rarely approached in nature. The gap between theoretical and actual efficiency has traditionally been attributed to environmental stressors such as drought and temperature extremes. Recent modeling studies, however, suggest that a significant portion of the inefficiency lies within the photosynthetic machinery itself: the enzyme RuBisCO, which fixes carbon dioxide, also binds oxygen in a wasteful side reaction called photorespiration. This inherent enzymatic limitation appears to be a legacy of RuBisCO's evolution in an atmosphere with negligible oxygen — a constraint that evolution has mitigated but never fully overcome.\n\n— Adapted from X. Zhu et al., \"Improving Photosynthetic Efficiency for Greater Yield,\" Annual Review of Plant Biology, 2010.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It identifies a gap between theoretical and actual performance, presents the traditional explanation, and then introduces a deeper structural cause rooted in evolutionary history.",
        "B": "It proposes a new method for increasing photosynthetic efficiency in agricultural crops.",
        "C": "It argues that environmental stressors have no effect on photosynthetic performance.",
        "D": "It describes the chemical steps of photosynthesis in chronological order."
    },
    "A",
    "The passage follows a layered-explanation structure: (1) the gap (theoretical vs. actual efficiency), (2) traditional explanation (environmental stressors), (3) deeper cause (RuBisCO's inherent enzymatic limitation, an evolutionary legacy). The word 'however' signals the structural pivot from surface to deeper cause. Choice A maps this three-layer architecture.",
    {
        "B": "Surface Function — While the passage implies that understanding inefficiency could lead to improvements, it does not propose any specific method for increasing efficiency.",
        "C": "Purpose Reversal — The passage says environmental stressors were 'traditionally attributed' as causes; it does not deny their role, only adds a deeper structural cause.",
        "D": "Surface Function — The passage does not describe photosynthesis step by step; it analyzes the causes of inefficiency."
    }
))

# ── Q32 — Literature ──────────────────────────
questions.append(q(
    "In Charles Dickens's Bleak House (1853), the description of the Lord Chancellor's court in the opening chapter devotes extraordinary attention to fog — fog 'everywhere,' fog in the eyes, fog in the throat. This atmospheric description appears to establish setting in a conventional Victorian manner. But Dickens embeds a metaphor within the naturalism: the fog becomes indistinguishable from the legal obfuscation of the Chancery court, where cases drag on for generations and no one can see a resolution. The chapter's structure enacts the very confusion it describes — sentences grow longer, subordinate clauses multiply, and the reader's own comprehension becomes fogbound. Form mirrors content; the prose style is itself a piece of evidence.\n\n— Adapted from Charles Dickens, Bleak House, 1853.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To demonstrate that Dickens's fog description functions on three levels simultaneously: as naturalistic setting, as metaphor for legal obfuscation, and as a formal enactment where prose style itself replicates the confusion being described.",
        "B": "To argue that Bleak House is primarily a meteorological novel about London's weather patterns.",
        "C": "To explain the historical procedures of the Chancery court in Victorian England.",
        "D": "To praise Dickens's descriptive abilities while acknowledging that his prose is sometimes unnecessarily verbose."
    },
    "A",
    "The passage identifies three simultaneous functions of the fog passage: (1) naturalistic atmosphere, (2) metaphor for Chancery obfuscation, (3) formal enactment (prose style mirrors fog). The key analytical move is showing that 'form mirrors content' — the description is not just about confusion but IS confusing. Choice A captures all three levels.",
    {
        "B": "Surface Function — Accepting the literal surface reading (London weather) without recognizing the metaphorical and formal functions is the exact mistake the passage warns against.",
        "C": "Surface Function — While the Chancery court is mentioned, the passage does not explain its historical procedures; it uses the court as the subject of Dickens's metaphor.",
        "D": "Scope Error — The passage does not evaluate Dickens's prose as verbose; it argues that the complexity of the prose is deliberately functional, not excessive."
    }
))

# ── Q33 — History/Social Studies ──────────────
questions.append(q(
    "In The Federalist Papers, Alexander Hamilton and James Madison deploy a recurring argumentative strategy: they systematically anticipate and address objections to the proposed Constitution before opponents can articulate them. In Federalist No. 84, for instance, Hamilton confronts the absence of a Bill of Rights not by conceding the omission but by arguing that such a bill would be 'dangerous' — implying that enumerated rights might be construed as exhaustive, thereby limiting freedoms not listed. This preemptive reframing — transforming an apparent vulnerability into a claimed advantage — exemplifies a broader structural pattern in the Papers: convert defensive positions into offensive arguments before the opposition has time to solidify its critique.\n\n— Adapted from Alexander Hamilton, Federalist No. 84, 1788.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To illustrate a recurring structural strategy in The Federalist Papers — preemptive reframing that converts apparent weaknesses into claimed strengths — using Hamilton's Bill of Rights argument as a specific example.",
        "B": "To argue that the original Constitution's lack of a Bill of Rights was a fatal flaw that Hamilton failed to address adequately.",
        "C": "To provide a summary of all 85 Federalist Papers and their main arguments.",
        "D": "To describe the personal rivalry between Hamilton and Madison that eventually split the Federalist movement."
    },
    "A",
    "The passage uses Hamilton's Bill of Rights argument as a specific instance of a 'broader structural pattern' — converting defensive positions into offensive arguments. The purpose is to illustrate a recurring strategy, not just to explain one argument. Choice A captures both the specific example and the general pattern it exemplifies.",
    {
        "B": "Purpose Reversal — The passage analyzes Hamilton's rhetorical strategy as effective reframing, not as an inadequate response. It does not evaluate whether the strategy succeeds or fails as policy.",
        "C": "Scope Error — The passage discusses one specific argumentative strategy using one Paper as an example, not all 85 Papers.",
        "D": "Surface Function — The Hamilton-Madison relationship is not discussed; the passage focuses on their shared argumentative strategy, not personal dynamics."
    }
))

# ── Q34 — Science ─────────────────────────────
questions.append(q(
    "Deep-sea hydrothermal vents support ecosystems that derive energy not from sunlight but from chemosynthesis — the oxidation of hydrogen sulfide and other chemicals expelled from the Earth's interior. When these communities were first discovered in 1977, they were hailed as evidence that life could exist independently of solar energy. Subsequent studies, however, revealed a dependence that is less obvious but no less fundamental: the dissolved oxygen that vent organisms use for chemosynthesis originates from photosynthetic production in surface waters. Remove the photosynthetic oxygen supply, and most vent ecosystems would collapse within centuries. The discovery of vent life thus did not, as initially proclaimed, demonstrate life's independence from the sun but rather revealed a more indirect and previously invisible form of solar dependence.\n\n— Adapted from C. Van Dover, The Ecology of Deep-Sea Hydrothermal Vents, Princeton University Press, 2000.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents an initial interpretation of a discovery, introduces evidence that undermines that interpretation, and concludes by reframing the discovery's significance as revealing a hidden dependence rather than an expected independence.",
        "B": "It describes the geological formation of deep-sea hydrothermal vents and the chemical composition of their emissions.",
        "C": "It argues that chemosynthesis is more efficient than photosynthesis as an energy source for marine ecosystems.",
        "D": "It celebrates the 1977 discovery of hydrothermal vents as proof that life can exist independently of solar energy."
    },
    "A",
    "The passage traces an interpretive arc: (1) initial interpretation (independence from solar energy), (2) complicating evidence (dissolved oxygen from photosynthesis), (3) reframing (indirect solar dependence rather than independence). The structure is claim-complication-reframing. Choice A maps this arc precisely.",
    {
        "B": "Surface Function — The passage mentions hydrogen sulfide and chemicals, but its structure is argumentative (tracing an interpretive shift), not descriptive of geological or chemical processes.",
        "C": "Scope Error — The passage does not compare the efficiency of chemosynthesis and photosynthesis; it argues that chemosynthetic ecosystems depend on photosynthetic oxygen.",
        "D": "Purpose Reversal — The passage's entire argumentative arc works to undermine this initial interpretation, showing that 'independence from the sun' was a premature conclusion."
    }
))

# ── Q35 — Literature ──────────────────────────
questions.append(q(
    "In Emily Brontë's Wuthering Heights (1847), the narrative is relayed through two intermediary narrators — Lockwood, a gentleman visitor, and Nelly Dean, the household servant — rather than through the protagonists themselves. Readers often view this narrative distance as an obstacle, wishing they could hear directly from Heathcliff or Catherine. But Brontë's framing serves a deliberate purpose: by filtering the story through observers who do not fully understand the passions they describe, she preserves an irreducible mystery at the heart of the narrative. Direct access to the protagonists' consciousness would explain them; the double mediation ensures they remain inexplicable — and therefore more powerfully compelling.\n\n— Adapted from Emily Brontë, Wuthering Heights, 1847.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that Brontë's choice of intermediary narrators, often seen as a flaw, actually serves the strategic purpose of preserving the protagonists' mystery by ensuring they are never fully explained.",
        "B": "To suggest that Wuthering Heights would be improved if told from Heathcliff's perspective.",
        "C": "To explain why Nelly Dean is an unreliable narrator whose account should not be trusted.",
        "D": "To provide a biography of Emily Brontë and explain how her personal experiences influenced the novel."
    },
    "A",
    "The passage distinguishes the common perception (narrative distance as 'obstacle') from the deeper strategic purpose (preserving mystery). The key phrase 'Brontë's framing serves a deliberate purpose' signals the text's intent to reinterpret an apparent weakness as a strength. Choice A captures this surface-vs-strategy distinction.",
    {
        "B": "Purpose Reversal — The passage argues that NOT having direct access to Heathcliff's consciousness is the point of Brontë's design. Suggesting the novel would be 'improved' by removing that design contradicts the analysis.",
        "C": "Scope Error — The passage discusses the structural effect of narrative mediation, not Nelly's reliability or unreliability as a specific narrator.",
        "D": "Surface Function — The passage analyzes narrative technique, not Brontë's biography."
    }
))

# ── Q36 — History/Social Studies ──────────────
questions.append(q(
    "In 'The Strenuous Life' (1899), Theodore Roosevelt argues that Americans must embrace hardship, sacrifice, and imperial responsibility rather than retreating into comfortable domesticity. What makes the speech structurally distinctive is Roosevelt's repeated use of gendered language: he equates national passivity with effeminacy and imperial vigor with masculinity. This gendering appears to be incidental rhetoric — the typical martial vocabulary of the era. But scholars have argued that it is foundational to the argument itself: by framing foreign policy choices as tests of manhood, Roosevelt makes it psychologically costly for his audience to oppose imperialism without appearing to renounce their own masculine identity.\n\n— Adapted from Theodore Roosevelt, 'The Strenuous Life,' 1899; and G. Bederman, Manliness and Civilization, 1995.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To analyze how Roosevelt's gendered rhetoric, which appears to be conventional martial language, actually functions as a strategic device that makes opposing imperialism psychologically costly for his audience.",
        "B": "To praise Roosevelt's speech as a model of effective persuasion that all leaders should emulate.",
        "C": "To argue that Roosevelt's foreign policy was entirely motivated by personal insecurity about masculinity.",
        "D": "To provide a summary of American foreign policy debates at the turn of the twentieth century."
    },
    "A",
    "The passage distinguishes the surface function of Roosevelt's gendered language (conventional rhetoric of the era) from its deeper strategic function (making opposition psychologically costly). The text analyzes how 'what appears incidental is actually foundational.' Choice A captures this surface-vs-strategy analysis.",
    {
        "B": "Scope Error — The passage does not evaluate the speech as good or bad, nor recommend emulation; it analyzes a specific rhetorical mechanism.",
        "C": "Scope Error — The passage analyzes how the rhetoric functions to persuade an audience, not Roosevelt's personal psychology or motivations.",
        "D": "Surface Function — The passage does not survey foreign policy debates broadly; it analyzes one speech's rhetorical strategy."
    }
))

# ── Q37 — Science ─────────────────────────────
questions.append(q(
    "Invasive species management traditionally focuses on eradication — removing non-native species from ecosystems they have colonized. However, ecologists studying long-established invasions have documented cases where non-native species have become functionally integrated into local food webs, providing ecosystem services such as erosion control or pollinator support that would be lost if the species were removed. In the Sacramento-San Joaquin Delta, for example, non-native Brazilian waterweed now provides critical habitat for native fish species whose original aquatic vegetation was eliminated decades ago. These findings have prompted some ecologists to advocate for a 'novel ecosystem' framework that evaluates invasive species by their current ecological function rather than their geographic origin.\n\n— Adapted from R. Hobbs et al., \"Novel Ecosystems: Theoretical and Management Aspects,\" Trends in Ecology & Evolution, 2006.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents the traditional approach to invasive species management, introduces evidence that complicates that approach, and then describes an alternative framework prompted by the complicating evidence.",
        "B": "It argues that all invasive species should be preserved because they are always beneficial to native ecosystems.",
        "C": "It provides a comprehensive taxonomy of invasive species found in North American waterways.",
        "D": "It describes the history of Brazilian waterweed's introduction to California and its subsequent spread."
    },
    "A",
    "The passage follows a three-part structure: (1) traditional approach (eradication), (2) complicating evidence (functionally integrated invasives, waterweed example), (3) alternative framework ('novel ecosystem' approach based on function, not origin). Choice A maps this structure precisely.",
    {
        "B": "Scope Error — The passage advocates for evaluating invasive species case-by-case ('by their current ecological function'), not preserving ALL invasive species unconditionally.",
        "C": "Surface Function — One species in one waterway is mentioned as a specific example; the passage does not taxonomically catalog invasive species.",
        "D": "Surface Function — The waterweed's history is not narrated; it is cited as a brief example supporting the broader argument about the novel ecosystem framework."
    }
))

# ── Q38 — Literature ──────────────────────────
questions.append(q(
    "In Mark Twain's Adventures of Huckleberry Finn (1884), Huck's famous moral crisis — when he decides to help Jim escape slavery despite believing he will 'go to hell' for it — is often read as a triumph of natural conscience over social indoctrination. Yet Twain constructs the scene so that Huck never recognizes his action as morally right; he explicitly believes he is sinning. This structural irony — the reader sees moral heroism where the character sees only damnation — prevents the scene from becoming a comfortable lesson about moral progress. Instead, it forces the reader to confront the depth of the slaveholding society's ideological control: even the boy who acts rightly cannot escape the belief system that tells him he is wrong.\n\n— Adapted from Mark Twain, Adventures of Huckleberry Finn, 1884.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To explain how Twain's structural irony — Huck seeing sin where the reader sees heroism — prevents the moral crisis from becoming a simple triumph and instead exposes the depth of ideological control.",
        "B": "To argue that Huck Finn genuinely deserves damnation for his actions in the novel.",
        "C": "To compare Twain's treatment of slavery with that of Harriet Beecher Stowe in Uncle Tom's Cabin.",
        "D": "To summarize the plot of Adventures of Huckleberry Finn from beginning to end."
    },
    "A",
    "The passage distinguishes the 'often read' interpretation (triumph of conscience) from the deeper structural irony (Huck never recognizes his heroism). The purpose is to show how Twain's construction of the scene resists comfortable moralizing by maintaining Huck's belief that he is sinning. Choice A captures this analysis of structural irony and its function.",
    {
        "B": "Purpose Reversal — The passage's entire analytical point is that the reader recognizes Huck's action as morally heroic even though Huck himself does not; arguing he 'deserves damnation' contradicts this.",
        "C": "Scope Error — Stowe and Uncle Tom's Cabin are not mentioned; the passage analyzes Twain's technique in isolation.",
        "D": "Surface Function — The passage focuses on one scene's structural irony, not a comprehensive plot summary."
    }
))

# ── Q39 — History/Social Studies ──────────────
questions.append(q(
    "In his 'Cross of Gold' speech (1896), William Jennings Bryan argues for the free coinage of silver against the gold standard. Bryan's most celebrated rhetorical move is his closing declaration: 'You shall not crucify mankind upon a cross of gold.' The metaphor appears to be a simple emotional appeal — casting gold-standard advocates as persecutors and silver supporters as martyred innocents. But the metaphor operates on a second level: by invoking the crucifixion, Bryan sacralizes an economic policy debate, transforming a dispute about monetary standards into a moral and spiritual struggle. This elevation makes it impossible for opponents to respond with purely technical arguments; they must now defend themselves against an implied charge of sacrilege.\n\n— Adapted from William Jennings Bryan, 'Cross of Gold' speech, 1896.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To analyze how Bryan's crucifixion metaphor operates on two levels — as emotional appeal on the surface, and as a strategic sacralization that forces opponents onto morally defensive ground.",
        "B": "To explain the economic arguments for and against the gold standard in the 1890s.",
        "C": "To argue that Bryan's speech was purely manipulative and contained no substantive policy arguments.",
        "D": "To provide a biography of Bryan and his role in the 1896 presidential election."
    },
    "A",
    "The passage identifies two levels of the metaphor: (1) surface emotional appeal (martyrdom imagery) and (2) deeper strategic function (sacralizing the debate, making technical response insufficient). The purpose is to show how the metaphor's rhetorical mechanics exceed simple emotional persuasion. Choice A captures both levels.",
    {
        "B": "Surface Function — The passage mentions the gold-vs-silver debate as context, but its analytical focus is on the metaphor's rhetorical function, not the economic substance of the debate.",
        "C": "Scope Error — The passage does not claim the speech is 'purely manipulative' or lacks substance; it analyzes how one specific metaphor functions rhetorically.",
        "D": "Surface Function — The passage analyzes one rhetorical device in one speech; it does not provide biographical information about Bryan."
    }
))

# ── Q40 — Science ─────────────────────────────
questions.append(q(
    "Ecological succession — the process by which biological communities change over time following a disturbance — has traditionally been modeled as a predictable sequence culminating in a stable 'climax community.' This deterministic view implies that any given site, if left undisturbed, will converge on the same endpoint. Field studies of volcanic islands and post-fire landscapes, however, have documented multiple stable states: ecosystems that stabilize in fundamentally different configurations depending on the order in which species colonize and on stochastic events like the timing of seed dispersal. These findings suggest that history, not just environment, determines community composition — that ecological communities, like historical events, are path-dependent rather than predetermined.\n\n— Adapted from R. Lewontin, \"The Meaning of Stability,\" Brookhaven Symposia in Biology, 1969; and review in Ecology Letters, 2009.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents the traditional deterministic model of ecological succession, introduces field evidence that challenges it, and reinterprets community development as path-dependent rather than predetermined.",
        "B": "It describes the stages of ecological succession on a volcanic island in chronological order.",
        "C": "It argues that all ecosystems eventually reach the same climax community regardless of initial conditions.",
        "D": "It compares ecological succession in forests with succession in marine environments."
    },
    "A",
    "The passage follows a model-challenge-reinterpretation structure: (1) traditional model (predictable climax), (2) field evidence (multiple stable states), (3) reinterpretation (path-dependence). The final sentence ('like historical events') crystallizes the analogy that structures the reinterpretation. Choice A maps all three phases.",
    {
        "B": "Surface Function — Volcanic islands are mentioned as one setting for field studies, but the passage does not describe chronological stages on any specific island.",
        "C": "Purpose Reversal — This restates the traditional model that the passage explicitly challenges with evidence of multiple stable states.",
        "D": "Scope Error — No marine environments are mentioned or compared; the passage discusses succession theory generally."
    }
))

# ── Q41 — Literature ──────────────────────────
questions.append(q(
    "In Joseph Conrad's Lord Jim (1900), the narrator Marlow interrupts his own storytelling repeatedly to question whether he truly understands Jim. These interruptions appear to be digressions — tangents that slow the narrative. But Conrad's strategy is more purposeful: by having Marlow confess his uncertainty, Conrad transfers the interpretive burden to the reader. Each interruption reminds the audience that they are receiving an already-interpreted version of events and that the 'real' Jim may be inaccessible. The novel's frequent pauses thus function not as narrative weaknesses but as epistemic arguments — assertions that complete knowledge of another person is ultimately impossible.\n\n— Adapted from Joseph Conrad, Lord Jim, 1900.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that Marlow's interruptions, often perceived as narrative digressions, actually function as deliberate epistemic arguments about the impossibility of fully knowing another person.",
        "B": "To criticize Conrad's prose style as unnecessarily fragmented and difficult to follow.",
        "C": "To provide a plot summary of Lord Jim focusing on Jim's actions after the Patna incident.",
        "D": "To compare Marlow's narrative reliability in Lord Jim with his role in Heart of Darkness."
    },
    "A",
    "The passage distinguishes the surface perception (digressions that slow the story) from the deeper function (epistemic arguments about the limits of knowledge). The key phrase 'function not as narrative weaknesses but as epistemic arguments' captures the surface-vs-depth distinction that the text is designed to reveal. Choice A maps this precisely.",
    {
        "B": "Purpose Reversal — The passage argues the interruptions are purposeful and effective, not weaknesses; criticizing them as 'unnecessarily fragmented' accepts the surface perception the passage rejects.",
        "C": "Surface Function — The passage does not summarize the plot; it analyzes a narrative technique.",
        "D": "Scope Error — Heart of Darkness is not mentioned; the passage analyzes Marlow's function in Lord Jim specifically."
    }
))

# ── Q42 — History/Social Studies ──────────────
questions.append(q(
    "In 'The Ballot or the Bullet' (1964), Malcolm X opens by addressing his audience as 'brothers and sisters,' deliberately erasing the distinctions between his organization (the Nation of Islam, at that point) and other civil rights groups. This inclusive address appears to be a conventional gesture of solidarity. In context, however, it performs a more aggressive rhetorical function: by positioning himself alongside mainstream civil rights leaders, Malcolm X implies that his militant message and their integrationist one are equally legitimate branches of the same movement. The address preempts the accusation of extremism by embedding his voice within the broader struggle before his audience can classify him as an outsider.\n\n— Adapted from Malcolm X, 'The Ballot or the Bullet,' 1964.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To analyze how Malcolm X's inclusive address functions not as simple solidarity but as a strategic move to preempt accusations of extremism by embedding his position within the mainstream civil rights movement.",
        "B": "To provide a comprehensive comparison of Malcolm X's and Martin Luther King Jr.'s philosophies.",
        "C": "To argue that Malcolm X's speeches were ineffective because they relied too heavily on emotional appeals.",
        "D": "To describe the organizational structure of the Nation of Islam in the 1960s."
    },
    "A",
    "The passage distinguishes the surface function of 'brothers and sisters' (conventional solidarity) from its strategic function (preempting the extremism charge by claiming membership in the broader movement). The purpose is to reveal how a seemingly routine address performs 'a more aggressive rhetorical function.' Choice A captures this.",
    {
        "B": "Scope Error — King is not mentioned; the passage analyzes Malcolm X's rhetorical strategy in isolation, referring to 'mainstream civil rights leaders' as a category, not a comparison.",
        "C": "Purpose Reversal — The passage analyzes Malcolm X's rhetoric as strategically effective, not as relying on mere emotion or being ineffective.",
        "D": "Surface Function — The Nation of Islam is mentioned as context, but the passage does not describe its organizational structure."
    }
))

# ── Q43 — Science ─────────────────────────────
questions.append(q(
    "Cognitive load theory holds that working memory has a limited capacity, and that instructional design should minimize extraneous processing to maximize learning. This principle has guided educational technology for decades. However, a series of studies on 'desirable difficulties' has introduced a complicating nuance: certain forms of increased cognitive load — such as interleaving practice problems from different topics or spacing study sessions over time — actually enhance long-term retention despite reducing immediate performance. The paradox is that what feels harder in the moment produces more durable learning. These findings do not invalidate cognitive load theory but refine it, distinguishing between extraneous load (which should be minimized) and germane load (productive challenge that strengthens encoding).\n\n— Adapted from R. Bjork and E. Bjork, \"Making Things Hard on Yourself, But in a Good Way,\" in Psychology and the Real World, 2011.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents an established educational principle, introduces research that appears to contradict it, and then reconciles the apparent contradiction by refining the original framework with a new distinction.",
        "B": "It argues that all forms of cognitive load are equally beneficial for learning.",
        "C": "It describes a series of laboratory experiments and evaluates their statistical validity.",
        "D": "It proposes that educational technology should be abandoned in favor of traditional teaching methods."
    },
    "A",
    "The passage follows a principle-challenge-refinement structure: (1) cognitive load theory (minimize load), (2) apparent contradiction (desirable difficulties improve learning), (3) refinement (distinction between extraneous and germane load). The final sentence explicitly states 'do not invalidate... but refine,' signaling reconciliation rather than replacement. Choice A captures this three-phase architecture.",
    {
        "B": "Purpose Reversal — The passage distinguishes between extraneous load (harmful) and germane load (beneficial), explicitly rejecting the idea that all load is equal.",
        "C": "Surface Function — While studies are mentioned, the passage does not describe experimental procedures or statistical methods; it traces an argumentative structure.",
        "D": "Scope Error — The passage refines principles for educational technology design; it does not argue for abandoning technology."
    }
))

# ── Q44 — Literature ──────────────────────────
questions.append(q(
    "In Anton Chekhov's The Cherry Orchard (1904), the sound of a breaking string is heard twice — once in Act II, when the characters are gathered in an open field, and again at the play's conclusion, after the estate has been sold and the family has departed. The first occurrence prompts characters to offer mundane explanations: a bucket falling in a mine, a heron's cry. The second occurrence, heard in an empty stage, resists such domestication. By repeating the sound in a context that strips away all plausible explanations, Chekhov transforms it from an unexplained noise into a theatrical emblem of irreversible loss — the sound of a world that has ended.\n\n— Adapted from Anton Chekhov, The Cherry Orchard, 1904.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To explain how Chekhov uses repetition and contextual stripping to transform an ambiguous sound effect from a naturalistic detail into a theatrical symbol of irreversible loss.",
        "B": "To argue that The Cherry Orchard is a realistic drama that avoids all forms of symbolism.",
        "C": "To describe the acoustic technology available in Russian theaters at the turn of the twentieth century.",
        "D": "To compare the breaking string motif in The Cherry Orchard with similar motifs in Shakespeare's plays."
    },
    "A",
    "The passage traces how the same sound changes function through repetition and changed context: from domesticable noise (Act II, with mundane explanations) to irreducible symbol (final scene, empty stage). The purpose is to analyze how Chekhov's structural technique — repetition with contextual stripping — generates symbolic meaning. Choice A captures this analytical purpose.",
    {
        "B": "Purpose Reversal — The passage's entire analysis demonstrates how the breaking string functions as a symbol, directly contradicting the claim that the play 'avoids all forms of symbolism.'",
        "C": "Surface Function — The passage discusses a sound effect as a literary device, not as a matter of theater technology.",
        "D": "Scope Error — Shakespeare is not mentioned; the passage analyzes Chekhov's technique in isolation."
    }
))

# ── Q45 — History/Social Studies ──────────────
questions.append(q(
    "In Democracy and Education (1916), John Dewey argues that education should not be preparation for future life but should be life itself — a continuous process of experience and reflection. What makes Dewey's formulation structurally distinctive is its implicit attack on the industrial model of schooling prevalent in his era. By defining education as ongoing experience, Dewey denies the premise that schools exist to produce finished products (trained workers) for an external economy. His redefinition of education thus functions as a critique of the social order that the prevailing model serves: to accept Dewey's premise is to reject the reduction of children to future economic inputs.\n\n— Adapted from John Dewey, Democracy and Education, 1916.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To show how Dewey's redefinition of education as continuous experience functions as an implicit critique of the industrial model of schooling and the social order it sustains.",
        "B": "To provide a comprehensive summary of all of Dewey's educational theories.",
        "C": "To argue that Dewey's educational philosophy was impractical and could never be implemented in actual schools.",
        "D": "To compare Dewey's educational philosophy with Montessori's method."
    },
    "A",
    "The passage analyzes how Dewey's seemingly positive redefinition (education as experience) functions as an 'implicit attack' on the industrial schooling model. The text's purpose is to reveal the critical function concealed within a constructive-seeming definition. Choice A captures this surface-vs-depth analysis.",
    {
        "B": "Scope Error — The passage analyzes one specific aspect of Dewey's philosophy (his definition of education as experience) and its structural implications, not all his educational theories.",
        "C": "Surface Function — The passage does not evaluate the practicality of Dewey's philosophy; it analyzes the rhetorical and political function of his redefinition.",
        "D": "Scope Error — Montessori is not mentioned; the passage analyzes Dewey in isolation."
    }
))

# ── Q46 — Science ─────────────────────────────
questions.append(q(
    "The 'tragedy of the commons' framework, introduced by Garrett Hardin in 1968, predicts that shared resources will inevitably be depleted because individuals acting rationally will each exploit the resource beyond its sustainable yield. Elinor Ostrom's field research challenged this prediction by documenting hundreds of cases where communities successfully managed common-pool resources — fisheries, forests, irrigation systems — without either privatization or government regulation. Ostrom identified design principles common to successful commons governance, such as clearly defined boundaries, collective decision-making, and graduated sanctions for rule violators. Her work did not merely provide counter-examples to Hardin's theory; it demonstrated that the 'tragedy' is a special case that arises only when specific institutional conditions are absent.\n\n— Adapted from E. Ostrom, Governing the Commons, Cambridge University Press, 1990.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents a widely influential theoretical prediction, introduces empirical research that challenges it, and then recharacterizes the original prediction as a special case rather than a universal law.",
        "B": "It argues that all common-pool resources should be privatized to prevent overexploitation.",
        "C": "It provides a biography of Elinor Ostrom and describes her path to winning the Nobel Prize in Economics.",
        "D": "It describes specific examples of resource depletion caused by the tragedy of the commons."
    },
    "A",
    "The passage follows a prediction-challenge-recharacterization structure: (1) Hardin's prediction (inevitable depletion), (2) Ostrom's counter-evidence (successful community management), (3) recharacterization (the 'tragedy' is a special case, not universal). The final sentence makes the recharacterization explicit. Choice A maps this three-phase architecture.",
    {
        "B": "Purpose Reversal — Ostrom's research shows successful management 'without either privatization or government regulation,' directly contradicting a privatization recommendation.",
        "C": "Surface Function — The passage analyzes Ostrom's research contributions, not her personal biography or career trajectory.",
        "D": "Purpose Reversal — The passage presents Ostrom's work as evidence against inevitable depletion, not as documentation of depletion events."
    }
))

# ── Q47 — Literature ──────────────────────────
questions.append(q(
    "In Henry James's The Turn of the Screw (1898), the governess narrator describes supernatural events — the ghosts of Peter Quint and Miss Jessel — with increasing conviction and sensory detail. James constructs the narrative so that every piece of 'evidence' the governess offers for the ghosts' existence could also be explained by her own psychological instability. The text provides no external confirmation of the hauntings: no other character independently sees the ghosts. This systematic structural ambiguity is not a failure of storytelling; it is the story's central achievement. James designed a narrative machine in which the very evidence that proves the governess's case simultaneously proves the case against her.\n\n— Adapted from Henry James, The Turn of the Screw, 1898.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that James's structural ambiguity — where evidence simultaneously supports and undermines the narrator's claims — is the novella's central artistic achievement rather than a storytelling flaw.",
        "B": "To prove that the ghosts in The Turn of the Screw are real and the governess is a reliable narrator.",
        "C": "To explain that James wrote the novella as a straightforward ghost story with no psychological dimension.",
        "D": "To compare The Turn of the Screw with other ghost stories published in the 1890s."
    },
    "A",
    "The passage explicitly frames structural ambiguity as 'the story's central achievement' and 'not a failure of storytelling.' Its purpose is to reinterpret what might be seen as a flaw (unresolved ambiguity) as a deliberate and sophisticated narrative design. Choice A captures this reinterpretation of ambiguity as achievement.",
    {
        "B": "Scope Error — The passage explicitly states that 'every piece of evidence could also be explained by psychological instability'; it does not resolve the ambiguity in either direction.",
        "C": "Purpose Reversal — The passage's entire argument is that the novella operates on both supernatural and psychological levels simultaneously; claiming it is 'straightforward' with 'no psychological dimension' directly contradicts this.",
        "D": "Surface Function — No other ghost stories are mentioned or compared."
    }
))

# ── Q48 — History/Social Studies ──────────────
questions.append(q(
    "In An Enquiry Concerning Human Understanding (1748), David Hume demonstrates that our belief in causation — the idea that one event necessarily produces another — cannot be rationally justified. We observe that billiard ball A strikes billiard ball B, and B moves; but we never observe the 'necessary connection' between the two events. Hume does not, however, conclude that we should abandon causal reasoning. Instead, he argues that causal belief is a product of custom and habit rather than rational inference. This structural move — undermining the rational foundation of a belief while preserving its practical necessity — allows Hume to critique metaphysics without endorsing skeptical paralysis.\n\n— Adapted from David Hume, An Enquiry Concerning Human Understanding, 1748.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It describes Hume's critique of causal reasoning's rational basis and then explains how he preserves the practice of causal thinking by relocating its foundation from reason to habit, avoiding both dogmatism and paralysis.",
        "B": "It argues that Hume rejected all forms of empirical knowledge and advocated for complete philosophical skepticism.",
        "C": "It provides a detailed description of the billiard ball experiment that Hume conducted in his laboratory.",
        "D": "It compares Hume's theory of causation with Newton's laws of motion."
    },
    "A",
    "The passage traces Hume's two-step structural move: (1) undermine the rational foundation of causal belief, (2) preserve causal reasoning by relocating it to custom/habit. The text's purpose is to show how this structure allows Hume to be critical without being paralyzingly skeptical. Choice A maps both steps and their strategic purpose.",
    {
        "B": "Purpose Reversal — The passage explicitly states Hume does NOT 'conclude that we should abandon causal reasoning'; he preserves it through habit. Claiming he rejected all empirical knowledge contradicts the passage.",
        "C": "Surface Function — The billiard ball example is a thought experiment, not a laboratory experiment; the passage discusses it as an illustration of Hume's philosophical argument.",
        "D": "Scope Error — Newton is not mentioned; the passage analyzes Hume's philosophy in isolation."
    }
))

# ── Q49 — Science ─────────────────────────────
questions.append(q(
    "Epigenetic modifications — heritable changes in gene expression that do not alter the DNA sequence — were once considered mere regulatory fine-tuning, secondary to the primary role of genetic mutations in driving evolution. Recent transgenerational studies in model organisms have challenged this hierarchy. Researchers have shown that environmental stressors can induce epigenetic changes in parents that persist for multiple generations in offspring, even when the original stressor is removed. These findings do not displace genetic mutation as a driver of evolution, but they introduce a complementary channel: one through which organisms can transmit adaptive responses to environmental challenges faster than genetic mutation alone would allow.\n\n— Adapted from E. Jablonka and M. Lamb, Evolution in Four Dimensions, MIT Press, 2005.",
    "Which choice best describes the overall structure of the text?",
    {
        "A": "It presents a traditional hierarchy in evolutionary biology, introduces evidence that challenges it, and then recharacterizes the relationship between the two mechanisms as complementary rather than hierarchical.",
        "B": "It argues that DNA mutations are irrelevant to evolution and should be replaced by epigenetic explanations.",
        "C": "It describes the laboratory techniques used to study epigenetic modifications in model organisms.",
        "D": "It provides a historical account of how the concept of epigenetics was first proposed."
    },
    "A",
    "The passage follows a hierarchy-challenge-recharacterization structure: (1) traditional hierarchy (mutations primary, epigenetics secondary), (2) challenge (transgenerational epigenetic inheritance), (3) recharacterization ('complementary channel,' not replacement). The final sentence explicitly preserves genetic mutation while introducing epigenetics as a 'complementary' mechanism. Choice A captures this architecture.",
    {
        "B": "Purpose Reversal — The passage explicitly states that findings 'do not displace genetic mutation'; claiming mutations are 'irrelevant' directly contradicts this.",
        "C": "Surface Function — 'Model organisms' and 'transgenerational studies' are mentioned as evidence sources, but no laboratory techniques are described.",
        "D": "Surface Function — The passage does not narrate the history of the epigenetics concept; it analyzes the current relationship between epigenetic and genetic mechanisms."
    }
))

# ── Q50 — Literature ──────────────────────────
questions.append(q(
    "In James Joyce's 'The Dead' (1914), the final paragraph describes snow 'falling faintly through the universe and faintly falling' across Ireland — on the living and the dead alike. This passage appears to offer lyrical consolation: the snow equalizes, softens, and unites. But positioned after Gabriel Conroy's painful discovery that his wife Gretta still mourns a dead lover, the snow passage performs a more unsettling function. The universality of the snowfall does not comfort Gabriel; it diminishes him. His jealousy, his self-importance, his carefully maintained identity dissolve into a landscape where individual distinctions — between the living and the dead, the self and the world — are being steadily erased.\n\n— Adapted from James Joyce, 'The Dead,' in Dubliners, 1914.",
    "Which choice best describes the main purpose of the text?",
    {
        "A": "To argue that Joyce's snow passage, which appears to offer consolation through universality, actually performs a more unsettling function — dissolving the protagonist's individual identity and diminishing rather than comforting him.",
        "B": "To describe the weather conditions in Dublin during the winter of 1914.",
        "C": "To praise Joyce's prose style as the finest example of lyrical writing in the English language.",
        "D": "To summarize the entire plot of 'The Dead' from the dinner party to the hotel scene."
    },
    "A",
    "The passage contrasts the surface effect of the snow passage (lyrical consolation, equalization) with its deeper function (diminishment of Gabriel's self-importance, erasure of individual identity). The key phrase 'appears to offer lyrical consolation' versus 'performs a more unsettling function' signals the surface-vs-depth distinction. Choice A captures this.",
    {
        "B": "Surface Function — Snow is discussed as a literary device and symbol, not as a meteorological fact about Dublin's weather.",
        "C": "Scope Error — The passage does not rank Joyce's prose against other writers; it analyzes the specific function of one passage within a larger narrative.",
        "D": "Surface Function — The passage references specific plot details (Gabriel's discovery about Gretta) as context for analyzing the snow passage, not as a comprehensive plot summary."
    }
))


# ─────────────────────────────────────────────
# INJECT INTO BANK
# ─────────────────────────────────────────────

def main():
    # Load existing bank
    if BANK.exists():
        with open(BANK, "r", encoding="utf-8") as f:
            bank = json.load(f)
    else:
        bank = []

    before = len(bank)
    bank.extend(questions)
    after = len(bank)

    with open(BANK, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)

    # Summary
    print("=" * 60)
    print("  HARD R&W — TEXT STRUCTURE AND PURPOSE (Craft & Structure)")
    print("=" * 60)
    print(f"  Questions generated : {len(questions)}")
    print(f"  Bank before         : {before}")
    print(f"  Bank after          : {after}")
    print()

    # Answer distribution
    ans_dist = Counter(q_item["correctAnswer"] for q_item in questions)
    print("  Answer distribution:")
    for letter in "ABCD":
        print(f"    {letter}: {ans_dist.get(letter, 0)}")
    print()

    # Genre rotation
    lit_count = 0
    hist_count = 0
    sci_count = 0
    for i, q_item in enumerate(questions):
        idx = i + 1
        if idx % 3 == 2:  # Q2, Q5, Q8, ... Literature
            lit_count += 1
        elif idx % 3 == 0:  # Q3, Q6, Q9, ... History
            hist_count += 1
        else:  # Q1, Q4, Q7, ... Science
            sci_count += 1

    print("  Genre rotation (by position):")
    print(f"    Science            : {sci_count}")
    print(f"    Literature         : {lit_count}")
    print(f"    History/Social St. : {hist_count}")
    print()

    # Verify all IDs are unique
    ids = [q_item["id"] for q_item in questions]
    unique_ids = set(ids)
    print(f"  Unique IDs           : {len(unique_ids)} / {len(ids)}")
    if len(unique_ids) < len(ids):
        print("  ⚠ DUPLICATE IDS DETECTED!")
    else:
        print("  ✓ All IDs unique")

    # Verify all questions have required fields
    required = ["id", "section", "domain", "skill", "difficulty", "type",
                 "prompt", "choices", "correctAnswer", "explanation", "metadata"]
    missing_fields = []
    for q_item in questions:
        for field in required:
            if field not in q_item:
                missing_fields.append((q_item["id"], field))
    if missing_fields:
        print(f"  ⚠ Missing fields: {missing_fields}")
    else:
        print("  ✓ All required fields present")

    print()
    print("  Done. Bank saved to:", BANK)
    print("=" * 60)


if __name__ == "__main__":
    main()
