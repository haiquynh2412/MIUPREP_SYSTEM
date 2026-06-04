#!/usr/bin/env python3
"""
hard_rw_info1.py — Generate 50 Hard R&W questions
Skill: Central Ideas and Details
Domain: Information and Ideas
Section: Reading and Writing

All passages are dense academic prose (80-150 words).
Rotates: Literature (pre-1929), History/Social Studies, Science.
Trap taxonomy: Too Broad, Detail as Main Idea, Distortion, Outside Knowledge.
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
        "sourceSignalId": "antigravity-1600-rw-info1",
        "generationEngine": "antigravity-master-prompt-1600",
        "visibility": "private_family",
        "reviewStatus": "needs_review",
        "targetBand": "SAT-1600",
    }


def q(passage, question_stem, choices, correct, expl_correct, expl_distractors):
    """Build one Central Ideas and Details MCQ."""
    prompt = passage + "\n\n" + question_stem
    meta = shared_meta()
    return {
        "id": make_id(),
        "section": "Reading and Writing",
        "domain": "Information and Ideas",
        "skill": "Central Ideas and Details",
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
            "cognitiveMove": "Synthesizing implicit thesis across multi-layered academic prose",
            "trapTypes": ["Too Broad", "Detail as Main Idea", "Distortion", "Outside Knowledge"],
        },
        **meta,
    }


# ─────────────────────────────────────────────
# 50 QUESTIONS — rotating Literature / History / Science
# ─────────────────────────────────────────────

questions = []

# ── Q1 — Science ──────────────────────────────
questions.append(q(
    "Recent studies of mycorrhizal networks reveal that mature trees transfer carbon compounds to shaded seedlings through fungal hyphae, effectively subsidizing their growth. Isotopic labeling experiments demonstrate that this transfer is not merely passive leakage; the volume of carbon delivered increases when recipient seedlings are under greater stress. However, the same networks also transmit allelopathic chemicals that suppress competitors of the donor species, suggesting that the apparent generosity may serve the donor's genetic interests rather than constituting altruism in any conventional ecological sense.\n\n— Adapted from S. Simard et al., \"Net transfer of carbon between ectomycorrhizal tree species in the field,\" Nature, 1997.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Mycorrhizal networks are the most important factor determining seedling survival in temperate forests.",
        "B": "Although mycorrhizal networks facilitate carbon transfer to stressed seedlings, the process may ultimately benefit donor trees rather than representing true ecological altruism.",
        "C": "Isotopic labeling experiments have proven that carbon transfer through fungal hyphae is an active, regulated process.",
        "D": "Allelopathic chemicals transmitted through fungal networks are the primary mechanism by which dominant tree species suppress competitors."
    },
    "B",
    "The passage presents two layers: first, that mature trees transfer carbon to stressed seedlings (suggesting generosity), and second, that the same networks transmit allelopathic chemicals that suppress the donor's competitors. Synthesizing both layers yields the implicit thesis: the transfer may serve the donor's self-interest rather than being true altruism. Choice B captures this synthesis.",
    {
        "A": "Too Broad — The passage never claims mycorrhizal networks are the 'most important factor' for seedling survival; it focuses specifically on whether the carbon transfer constitutes altruism.",
        "C": "Detail as Main Idea — The isotopic labeling detail supports the argument but is not the central claim; it is evidence for the active nature of transfer, which is one building block of the larger argument.",
        "D": "Distortion — The passage mentions allelopathic chemicals as one piece of evidence that the transfer may be self-serving, but it does not claim they are the 'primary mechanism' of suppression."
    }
))

# ── Q2 — Literature ──────────────────────────
questions.append(q(
    "The narrator of Edith Wharton's The House of Mirth (1905) describes Lily Bart's social maneuvers at a dinner party with meticulous precision: Lily adjusts her conversation to flatter each guest individually, calibrating her wit to the listener's vanity. Yet throughout these performances, Wharton interweaves Lily's private awareness that every charming gesture is also a calculated bid for financial security. When Lily momentarily drops her guard and speaks with genuine warmth to Selden, the narrator notes that this unscripted honesty threatens to unravel the very social fabric Lily has spent years weaving.\n\n— Adapted from Edith Wharton, The House of Mirth, 1905.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Wharton's novel is primarily a critique of the superficiality of early twentieth-century American dinner parties.",
        "B": "Lily Bart's genuine moment of honesty with Selden proves that she is fundamentally different from the other characters in Wharton's novel.",
        "C": "The passage illustrates Wharton's portrayal of Lily Bart as someone whose social performances mask economic desperation, with authentic emotion posing a danger to her carefully maintained persona.",
        "D": "Wharton uses the dinner party scene to argue that financial security is more important than personal relationships in Gilded Age society."
    },
    "C",
    "The passage layers Lily's outward charm over her private economic anxiety, then introduces a moment of genuine warmth that 'threatens to unravel' her careful performance. Synthesizing all three elements — performance, economic motive, and the danger of authenticity — yields the central idea that Lily's social identity is a fragile construction serving economic ends, endangered by genuine feeling. Choice C captures this full synthesis.",
    {
        "A": "Too Broad — The passage is about Lily Bart's specific psychological predicament, not a general critique of dinner parties.",
        "B": "Distortion — The passage does not claim Lily is 'fundamentally different' from everyone else; it shows that her rare honesty threatens her position, not that she is morally superior.",
        "D": "Outside Knowledge — While the passage mentions financial security, it does not argue that money is 'more important than personal relationships' as a thesis; that is a reader's extrapolation beyond the text."
    }
))

# ── Q3 — History/Social Studies ──────────────
questions.append(q(
    "In Federalist No. 51, James Madison argues that the structure of government must furnish 'the proper checks and balances between the different departments.' He acknowledges that dependence on the people is the 'primary control on the government,' yet insists that 'experience has taught mankind the necessity of auxiliary precautions.' Madison's architecture of separated powers does not rest on trust in virtue; instead, it channels individual ambition so that 'the private interest of every individual may be a sentinel over the public rights,' converting self-interest into a structural safeguard.\n\n— Adapted from James Madison, Federalist No. 51, 1788.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Madison believed that democratic elections alone are sufficient to prevent governmental abuse of power.",
        "B": "Madison's constitutional design harnesses personal ambition as a structural mechanism of governmental restraint, rather than relying solely on the virtue of officeholders or popular oversight.",
        "C": "Federalist No. 51 primarily advocates for the supremacy of the legislative branch over the executive and judicial branches.",
        "D": "Madison's main concern in Federalist No. 51 is the importance of popular elections as the foundation of republican government."
    },
    "B",
    "Madison states that popular control is 'primary' but insufficient, then introduces 'auxiliary precautions' — structural checks that convert private ambition into a guard over public rights. The central idea synthesizes these layers: the constitutional design is engineered so that self-interest itself becomes a safeguard, rather than depending on virtue alone. Choice B captures this synthesis.",
    {
        "A": "Distortion — Madison explicitly says elections are the 'primary control' but NOT sufficient alone; he insists on 'auxiliary precautions,' directly contradicting 'sufficient.'",
        "C": "Outside Knowledge — The passage does not discuss the supremacy of any particular branch; this is information a student might import from other knowledge of the Constitution.",
        "D": "Detail as Main Idea — Popular elections are mentioned as one element ('dependence on the people'), but the main idea is the need for structural mechanisms beyond elections."
    }
))

# ── Q4 — Science ──────────────────────────────
questions.append(q(
    "The 'hygiene hypothesis' originally proposed that reduced childhood exposure to infections in industrialized nations explained rising rates of allergic disease. Subsequent research has refined this model substantially: epidemiological data now suggest that microbial diversity in the gut, rather than infection frequency per se, is the critical variable. Children raised on farms with diverse livestock show lower allergy rates even when their infection histories are unremarkable. Furthermore, germ-free mouse models develop exaggerated immune responses that can be normalized only by early-life exposure to a complex microbiome, not by introducing individual pathogens.\n\n— Adapted from D. P. Strachan et al., \"Hay fever, hygiene, and household size,\" BMJ, 1989; updated review, Journal of Allergy and Clinical Immunology, 2015.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Research on the hygiene hypothesis has shifted the focus from infection frequency to gut microbial diversity as the key factor in preventing allergic disease.",
        "B": "Children raised on farms are healthier than children raised in cities because of their exposure to livestock.",
        "C": "The hygiene hypothesis has been proven wrong by germ-free mouse experiments.",
        "D": "Industrialization is the primary cause of all allergic diseases in developed nations."
    },
    "A",
    "The passage traces an evolution: the original hygiene hypothesis linked infection reduction to allergies, but newer evidence (farm children, germ-free mice) points to microbial diversity, not infection count, as the decisive factor. Synthesizing these multiple lines of evidence yields the central idea that the hypothesis has been refined, not abandoned — with diversity replacing frequency as the critical variable. Choice A captures this nuanced shift.",
    {
        "B": "Detail as Main Idea — Farm children are cited as one piece of supporting evidence, but the passage's central idea is the broader conceptual shift in the hypothesis, not a simple urban-rural health comparison.",
        "C": "Distortion — The passage says the hypothesis was 'refined,' not 'proven wrong.' The mouse experiments support the refined version, not a wholesale rejection.",
        "D": "Too Broad — The passage discusses allergic disease specifically in relation to microbial diversity; it does not claim industrialization causes 'all allergic diseases.'"
    }
))

# ── Q5 — Literature ──────────────────────────
questions.append(q(
    "In Joseph Conrad's Heart of Darkness (1899), Marlow recounts the manager's curious patience when the steamer breaks down: rather than urgently seeking repairs, the manager seems content to let the delay stretch for months. Marlow gradually realizes that the breakdown serves the manager's interests by keeping Kurtz isolated and weakening his influence at the Inner Station. The mechanical failure, ostensibly a neutral event, thus becomes legible as a political instrument. Conrad embeds this insight not through direct exposition but through Marlow's slow, reluctant inference, forcing the reader to piece together the manager's motives from scattered observations.\n\n— Adapted from Joseph Conrad, Heart of Darkness, 1899.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Conrad's narrative technique forces readers to reconstruct the manager's political manipulation through Marlow's gradual, indirect realization that the steamer's breakdown serves strategic rather than accidental purposes.",
        "B": "Heart of Darkness is primarily a novel about the difficulties of repairing steamships in colonial Africa.",
        "C": "Marlow's narrative reveals that Kurtz is the true antagonist of the novel, using the steamer breakdown to consolidate his own power.",
        "D": "Conrad uses the manager character to critique all forms of European colonialism as inherently corrupt."
    },
    "A",
    "The passage presents two interlocking layers: the plot detail (the manager benefits from the delay) and the narrative technique (Conrad withholds direct exposition, making Marlow and the reader piece together the truth). The central idea fuses both: the mechanical breakdown becomes a political instrument, and Conrad's indirect method mirrors Marlow's own dawning awareness. Choice A synthesizes both layers.",
    {
        "B": "Too Broad — reframed as 'Too Narrow' in spirit: this reduces the passage to a literal summary of the mechanical plot event, ignoring the political and narrative dimensions entirely.",
        "C": "Distortion — The passage says the manager benefits from isolating Kurtz; it does not claim Kurtz engineered the breakdown or is the 'true antagonist.'",
        "D": "Outside Knowledge — While Conrad's novel is often read as a critique of colonialism, the passage focuses specifically on narrative technique and the manager's manipulation, not on a broad anti-colonial argument."
    }
))

# ── Q6 — History/Social Studies ──────────────
questions.append(q(
    "In her 1892 address 'The Subjective Necessity for Social Settlements,' Jane Addams argues that the settlement movement serves not only the immigrant poor but also the educated young people who staff it. She describes a generation of college graduates burdened by theoretical knowledge but starving for practical engagement, who experience what she calls 'the snare of preparation' — perpetual study that never translates into action. Addams contends that Hull-House provides these graduates with the democratic contact necessary to transform abstract sympathy into informed social understanding, thereby fulfilling a psychological need as much as a philanthropic one.\n\n— Adapted from Jane Addams, 'The Subjective Necessity for Social Settlements,' 1892.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Addams argues that settlements like Hull-House serve a dual purpose, meeting the needs of immigrant communities while also satisfying educated young people's psychological need to connect abstract learning with practical democratic engagement.",
        "B": "Addams believes that college education is fundamentally useless without direct experience in immigrant neighborhoods.",
        "C": "The primary purpose of Hull-House was to provide charitable services to immigrant families in Chicago.",
        "D": "Addams's address focuses on the economic benefits of social settlements for municipal governments."
    },
    "A",
    "The passage's implicit thesis emerges from synthesizing two claims: settlements help the poor (mentioned at the start) and they fulfill a 'psychological need' of educated volunteers trapped in 'the snare of preparation.' Addams frames this dual benefit — not just charity but mutual transformation — as the central justification. Choice A captures both halves.",
    {
        "B": "Distortion — Addams says college graduates need practical engagement, not that their education is 'fundamentally useless.' She describes a gap, not a wholesale rejection of education.",
        "C": "Detail as Main Idea — Charitable service to immigrants is mentioned, but the passage's emphasis is on the subjective necessity — the benefit to the volunteers themselves — which is what makes Addams's argument distinctive.",
        "D": "Outside Knowledge — The passage says nothing about economic benefits to municipal governments; this imports external assumptions about settlements' fiscal impact."
    }
))

# ── Q7 — Science ──────────────────────────────
questions.append(q(
    "Tardigrades, microscopic invertebrates, survive extreme desiccation by entering a state called cryptobiosis, in which metabolism drops to undetectable levels. Early researchers assumed that survival depended entirely on the formation of the sugar trehalose, which replaces water in cell membranes. However, proteomic analyses have since identified a family of intrinsically disordered proteins (IDPs) unique to tardigrades that vitrify upon drying, forming a glass-like matrix that physically stabilizes cellular structures. Notably, when tardigrade IDPs are expressed in yeast cells, those cells also gain desiccation tolerance — a result that trehalose alone cannot replicate.\n\n— Adapted from T. C. Boothby et al., \"Tardigrades use intrinsically disordered proteins to survive desiccation,\" Molecular Cell, 2017.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Tardigrades are the most resilient organisms on Earth, capable of surviving conditions no other animal can endure.",
        "B": "The discovery of intrinsically disordered proteins has revised the understanding of tardigrade desiccation tolerance, demonstrating that these proteins, not trehalose alone, are critical for cellular stabilization during cryptobiosis.",
        "C": "Yeast cells can be made completely immune to environmental stress by inserting tardigrade genes.",
        "D": "Trehalose is the primary mechanism of desiccation tolerance in all known organisms that survive extreme drying."
    },
    "B",
    "The passage presents an older explanation (trehalose) and then introduces newer evidence (IDPs that vitrify and confer tolerance even in yeast), showing that the understanding has been revised. The central idea is the shift from trehalose-centric to IDP-centric explanation. Choice B synthesizes this revision narrative.",
    {
        "A": "Too Broad — The passage focuses on the specific mechanism of desiccation tolerance, not a general claim about tardigrades being the 'most resilient organisms.'",
        "C": "Distortion — The passage says yeast gain desiccation tolerance with tardigrade IDPs, not that they become 'completely immune to environmental stress' broadly.",
        "D": "Distortion — The passage explicitly challenges the primacy of trehalose, stating that IDPs are critical where 'trehalose alone cannot replicate' the effect."
    }
))

# ── Q8 — Literature ──────────────────────────
questions.append(q(
    "In Charlotte Brontë's Jane Eyre (1847), Jane's refusal of St. John Rivers's marriage proposal is often read as a straightforward assertion of romantic preference. Yet Brontë's narration reveals a more complex calculus: Jane describes St. John's missionary zeal as a form of 'despotism' that would annihilate her individuality, reducing her to an instrument of his vocation. Her rejection, therefore, is not merely the choice of one man over another but a defense of selfhood against a relationship structured as subordination. Brontë reinforces this reading by having Jane compare the proposed marriage to a form of voluntary enslavement.\n\n— Adapted from Charlotte Brontë, Jane Eyre, 1847.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Brontë portrays Jane's rejection of St. John as primarily a defense of personal autonomy against a relationship that would subordinate her identity, rather than simply a romantic preference for Rochester.",
        "B": "Jane Eyre is fundamentally a novel about the dangers of religious missionary work in the nineteenth century.",
        "C": "Jane rejects St. John because she finds his personality unattractive compared to Rochester's passionate temperament.",
        "D": "Brontë's novel demonstrates that all marriages in Victorian England were oppressive to women."
    },
    "A",
    "The passage reframes a common reading: Jane's refusal is not 'merely the choice of one man over another' but a 'defense of selfhood' against subordination. Synthesizing the characterization of St. John's zeal as 'despotism,' the comparison to 'voluntary enslavement,' and the explicit contrast with a simple romantic reading yields the central idea in Choice A.",
    {
        "B": "Too Broad — The passage discusses one specific scene and its psychological stakes, not a general critique of missionary work.",
        "C": "Detail as Main Idea — While romantic preference is mentioned, the passage explicitly says the rejection goes beyond choosing 'one man over another'; reducing it to personality comparison misses the deeper argument about autonomy.",
        "D": "Outside Knowledge — The passage analyzes one specific proposed marriage; it does not generalize to 'all marriages in Victorian England.'"
    }
))

# ── Q9 — History/Social Studies ──────────────
questions.append(q(
    "In Democracy in America (1835), Alexis de Tocqueville observes that Americans' passion for equality paradoxically isolates them from one another. As hereditary distinctions dissolve, each citizen imagines himself self-sufficient, retreating into a small circle of family and friends. Tocqueville warns that this 'individualism' — a word he helped popularize — differs from selfishness in that it is born not from vice but from democratic sentiment itself. The danger, he argues, is that isolated citizens will gradually cede public affairs to a centralized state, trading participatory liberty for administrative convenience.\n\n— Adapted from Alexis de Tocqueville, Democracy in America, Volume II, 1840.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Tocqueville argues that democratic equality produces an individualism that, by isolating citizens from public life, creates conditions favorable to the growth of centralized state power.",
        "B": "Tocqueville believes that American democracy is superior to European aristocracy in every respect.",
        "C": "The concept of individualism was unknown before Tocqueville coined the term in Democracy in America.",
        "D": "Tocqueville's primary argument is that selfishness and individualism are identical moral failings."
    },
    "A",
    "The passage connects three elements: equality dissolves old ties, citizens retreat into private life (individualism), and this isolation enables centralization. Tocqueville explicitly distinguishes individualism from selfishness and traces it to democratic equality itself. Choice A synthesizes this causal chain: equality → individualism → vulnerability to centralization.",
    {
        "B": "Too Broad — Tocqueville here identifies a danger within democracy; the passage does not claim democracy is 'superior in every respect.'",
        "C": "Outside Knowledge — While the passage mentions Tocqueville 'helped popularize' the word, it does not claim he invented the concept; this is an exaggeration that imports external debate.",
        "D": "Distortion — The passage explicitly states that individualism 'differs from selfishness'; claiming they are identical directly contradicts the text."
    }
))

# ── Q10 — Science ─────────────────────────────
questions.append(q(
    "Coral bleaching events have intensified globally, but certain reef populations exhibit surprising thermal resilience. Researchers studying Palau's inner lagoon corals found that these populations maintain symbiosis with their algal partners at temperatures that cause mass bleaching on outer reefs. Transcriptomic analysis revealed constitutive upregulation of heat-shock proteins and antioxidant pathways — defenses that outer-reef corals activate only under acute stress. Critically, reciprocal transplant experiments showed that this resilience is partly heritable: offspring of lagoon corals bleached less than offspring of outer-reef corals when both were raised in identical thermal conditions.\n\n— Adapted from S. Palumbi et al., \"Mechanisms of reef coral resistance to future climate change,\" Science, 2014.",
    "Which choice best states the main idea of the text?",
    {
        "A": "All coral species will eventually adapt to rising ocean temperatures through natural selection.",
        "B": "Certain coral populations possess heritable, constitutively active stress defenses that confer thermal resilience, suggesting that adaptation to warming is possible but population-specific.",
        "C": "Transcriptomic analysis is the most effective method for studying coral bleaching.",
        "D": "Reciprocal transplant experiments prove that environment, not genetics, determines coral bleaching resistance."
    },
    "B",
    "The passage presents evidence from multiple methods (transcriptomics, transplant experiments) converging on one conclusion: specific coral populations have innate, heritable stress defenses that are constitutively active, not just reactive. The 'critically' marker signals that heritability is the key finding. Choice B synthesizes these layers into the central idea: adaptation exists but is population-specific.",
    {
        "A": "Too Broad — The passage describes specific populations (Palau's lagoon corals), not 'all coral species,' and does not claim universal adaptation is inevitable.",
        "C": "Detail as Main Idea — Transcriptomic analysis is one method used, but the main idea concerns what was discovered, not the superiority of the method.",
        "D": "Distortion — The transplant experiments showed that resilience IS partly heritable (genetic), directly contradicting the claim that 'environment, not genetics' determines resistance."
    }
))

# ── Q11 — Literature ──────────────────────────
questions.append(q(
    "In Henry James's The Portrait of a Lady (1881), Isabel Archer's decision to return to Rome and her unhappy marriage has puzzled readers for over a century. James's narration emphasizes not duty or love but Isabel's commitment to the consequences of her own freely made choice. Even as she recognizes that Osmond married her for her fortune, Isabel treats her decision as irreversible — a position that James frames not as passive submission but as a form of moral agency. Her return, James implies, is an assertion that personal integrity requires honoring one's commitments, even those founded on deception.\n\n— Adapted from Henry James, The Portrait of a Lady, 1881.",
    "Which choice best states the main idea of the text?",
    {
        "A": "James portrays Isabel's return to her marriage as an exercise in moral agency — honoring the consequences of her own free choice — rather than as simple submission to duty or romantic attachment.",
        "B": "The Portrait of a Lady is fundamentally a novel about the legal difficulties of obtaining a divorce in nineteenth-century Europe.",
        "C": "Isabel returns to Osmond because she still loves him despite his deception.",
        "D": "James criticizes Isabel for lacking the courage to leave an unhappy marriage."
    },
    "A",
    "The passage distinguishes Isabel's return from 'duty or love' and from 'passive submission,' instead framing it as 'moral agency' and 'personal integrity.' The central idea is James's reinterpretation of what appears to be submission as actually an assertion of selfhood through commitment. Choice A synthesizes these layers.",
    {
        "B": "Outside Knowledge — The passage discusses Isabel's psychological and moral reasoning, not the legal framework of divorce; this imports historical context not present in the text.",
        "C": "Distortion — The passage explicitly states that the return is not motivated by 'love' and that Isabel 'recognizes that Osmond married her for her fortune.'",
        "D": "Distortion — The passage frames Isabel's choice as moral agency, not cowardice; James 'implies' her return is an 'assertion,' not a failure of courage."
    }
))

# ── Q12 — History/Social Studies ──────────────
questions.append(q(
    "Frederick Douglass's 1852 speech 'What to the Slave Is the Fourth of July?' does not merely denounce slavery; it strategically deploys the rhetoric of American patriotism against itself. Douglass opens by praising the founders' courage, aligning himself with their ideals before pivoting to argue that those very principles indict the nation's tolerance of slavery. By occupying the rhetorical ground of patriotic reverence, Douglass denies his opponents the ability to dismiss him as an outsider. His critique gains force precisely because it claims American values as its own foundation.\n\n— Adapted from Frederick Douglass, 'What to the Slave Is the Fourth of July?', 1852.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Douglass's speech is effective because he turns American patriotic ideals into the basis of his critique of slavery, making it impossible to dismiss his argument as unpatriotic.",
        "B": "Douglass's speech is a straightforward condemnation of the American founders for establishing a slaveholding republic.",
        "C": "The Fourth of July was meaningless to all African Americans in the nineteenth century.",
        "D": "Douglass's rhetorical strategy involves rejecting all elements of American political tradition."
    },
    "A",
    "The passage identifies Douglass's specific rhetorical strategy: he praises the founders first, then uses their ideals to indict slavery. The central idea is the strategic deployment of patriotism against itself — claiming American values as the foundation of the critique. Choice A captures this synthesis.",
    {
        "B": "Distortion — Douglass does NOT condemn the founders; the passage says he 'praises the founders' courage' and 'aligns himself with their ideals' before turning those ideals against current practice.",
        "C": "Too Broad — The passage analyzes Douglass's rhetorical strategy, not the subjective experience of 'all African Americans.'",
        "D": "Distortion — The passage explicitly says Douglass 'claims American values as its own foundation' rather than rejecting them; his power comes from embracing, not rejecting, the tradition."
    }
))

# ── Q13 — Science ─────────────────────────────
questions.append(q(
    "The prevailing model of memory consolidation holds that hippocampal traces are gradually transferred to the neocortex during sleep. Recent optogenetic studies complicate this view: researchers found that cortical memory traces form simultaneously with hippocampal ones at the moment of learning, but remain 'silent' — inactive during recall — for approximately two weeks. During this maturation period, the cortical traces require hippocampal input to strengthen; severing the connection prematurely causes the cortical trace to decay. The hippocampus, therefore, does not simply transfer memories but actively nurtures cortical traces until they can sustain recall independently.\n\n— Adapted from T. Kitamura et al., \"Engrams and circuits crucial for systems consolidation of a memory,\" Science, 2017.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Memory is stored exclusively in the hippocampus and never involves the neocortex.",
        "B": "New research shows that cortical memory traces form at the time of learning but require sustained hippocampal support to mature, revising the view that the hippocampus merely transfers memories to the cortex.",
        "C": "Optogenetic studies have demonstrated that sleep is unnecessary for memory consolidation.",
        "D": "The neocortex is more important than the hippocampus for all forms of long-term memory."
    },
    "B",
    "The passage revises the 'prevailing model' of sequential transfer by showing that cortical traces form simultaneously but need hippocampal nurturing. The key insight is the shift from 'transfer' to 'nurture' — the hippocampus doesn't hand off memories but actively supports cortical traces. Choice B synthesizes this revision.",
    {
        "A": "Distortion — The passage describes cortical traces forming alongside hippocampal ones; memory is NOT 'exclusively' hippocampal.",
        "C": "Outside Knowledge — The passage mentions sleep in the 'prevailing model' but does not claim sleep is unnecessary; optogenetic studies revised the transfer model, not the role of sleep.",
        "D": "Too Broad — The passage compares hippocampal and cortical roles in one specific context; it does not rank one as universally 'more important.'"
    }
))

# ── Q14 — Literature ──────────────────────────
questions.append(q(
    "In Kate Chopin's The Awakening (1899), Edna Pontellier's learning to swim is freighted with symbolic significance that extends beyond physical accomplishment. Chopin describes Edna's first solo swim as producing 'a feeling of exultation' coupled with a 'quick vision of death,' juxtaposing liberation and danger in a single moment. Earlier in the novel, Edna could not venture into the water without clutching a companion's hand; her sudden ability to swim alone mirrors her broader movement toward psychological independence. Yet Chopin's pairing of exultation with mortality suggests that the autonomy Edna seeks carries existential costs that the narrative will ultimately exact.\n\n— Adapted from Kate Chopin, The Awakening, 1899.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Chopin uses Edna's swimming as a symbol in which liberation and mortal danger coexist, foreshadowing that her pursuit of autonomy carries profound existential risks.",
        "B": "The Awakening is primarily a novel about a woman's journey to become a competitive swimmer.",
        "C": "Edna's exultation while swimming proves that she has fully achieved the independence she seeks.",
        "D": "Chopin portrays swimming as a universally dangerous activity in late nineteenth-century Louisiana."
    },
    "A",
    "The passage links Edna's swimming to two simultaneous elements: exultation (liberation) and a 'vision of death' (danger). It explicitly connects the swim to her 'broader movement toward psychological independence' while noting that Chopin pairs this with mortality. Choice A synthesizes the symbolic duality — freedom and existential cost — as the central idea.",
    {
        "B": "Too Broad — Reducing the passage to a literal reading about competitive swimming ignores the symbolic and psychological analysis entirely.",
        "C": "Detail as Main Idea — Exultation is only half of the passage's point; it is paired with the 'vision of death,' and the passage argues that autonomy carries costs, not that it is fully achieved.",
        "D": "Outside Knowledge — The passage discusses swimming as symbolic, not as a general commentary on swimming safety in Louisiana."
    }
))

# ── Q15 — History/Social Studies ──────────────
questions.append(q(
    "In The Wealth of Nations (1776), Adam Smith does not, contrary to popular characterization, argue that unregulated self-interest automatically produces social good. Smith stipulates that the 'invisible hand' operates only within a framework of justice — the enforcement of contracts, the prohibition of fraud, and the provision of public goods that no private party would supply. He devotes extensive passages to critiquing merchants who collude to fix prices, warning that their self-interest, unchecked by legal constraint, harms consumers. Smith's market theory, properly read, is conditional: it presupposes institutional guardrails that channel competition toward socially beneficial outcomes.\n\n— Adapted from Adam Smith, An Inquiry into the Nature and Causes of the Wealth of Nations, 1776.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Smith's argument for market competition is conditional, requiring institutional safeguards like contract enforcement and fraud prevention to channel self-interest toward social benefit.",
        "B": "Adam Smith opposed all forms of government intervention in the economy.",
        "C": "Smith's primary contribution to economics was his theory of price-fixing among merchants.",
        "D": "The Wealth of Nations argues that public goods should be provided exclusively by private enterprise."
    },
    "A",
    "The passage corrects a 'popular characterization' by emphasizing that Smith's invisible hand requires a 'framework of justice.' It synthesizes his critique of colluding merchants with his demand for institutional guardrails, yielding the central idea that his market theory is conditional. Choice A captures this conditional argument.",
    {
        "B": "Distortion — The passage explicitly states that Smith requires enforcement of contracts, prohibition of fraud, and public goods provision — forms of government intervention that contradict 'opposed all forms.'",
        "C": "Detail as Main Idea — Price-fixing is mentioned as one example of unchecked self-interest, but it is supporting evidence for the broader point about conditional market theory.",
        "D": "Distortion — The passage says Smith calls for 'provision of public goods that no private party would supply,' directly contradicting the claim that private enterprise should be exclusive."
    }
))

# ── Q16 — Science ─────────────────────────────
questions.append(q(
    "The microplastic contamination of deep-ocean sediments was initially attributed solely to gravitational settling of surface debris. However, thermohaline circulation models combined with sediment-core analyses reveal that bottom currents concentrate microplastics into 'hotspots' along the ocean floor, much as they aggregate organic matter into nutrient-rich deposits. Concentrations in these hotspots can exceed surface-water levels by an order of magnitude, challenging the assumption that the deep sea merely accumulates surface waste passively. The finding implies that deep-sea biodiversity hotspots, which often coincide with nutrient-rich current convergences, may face disproportionate microplastic exposure.\n\n— Adapted from I. Kane et al., \"Seafloor microplastic hotspots controlled by deep-sea circulation,\" Science, 2020.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Deep-ocean bottom currents actively concentrate microplastics into hotspots rather than merely receiving passive surface fallout, potentially exposing deep-sea biodiversity centers to disproportionate contamination.",
        "B": "Microplastic pollution exists only in the surface waters of the world's oceans.",
        "C": "Thermohaline circulation is the primary driver of nutrient distribution throughout all ocean ecosystems.",
        "D": "Sediment-core analyses have proven that deep-sea organisms are unaffected by microplastic contamination."
    },
    "A",
    "The passage revises the passive-settling model by showing that currents actively create hotspots, and then connects this to biodiversity risk. The central idea is the active concentration mechanism and its ecological implication. Choice A synthesizes both elements.",
    {
        "B": "Distortion — The passage's entire point is that deep-ocean sediments contain microplastics, contradicting the claim that pollution exists 'only in surface waters.'",
        "C": "Too Broad — Thermohaline circulation is discussed as a mechanism for microplastic concentration, not as 'the primary driver of nutrient distribution throughout all ocean ecosystems.'",
        "D": "Distortion — The passage implies deep-sea organisms face 'disproportionate exposure,' the opposite of being 'unaffected.'"
    }
))

# ── Q17 — Literature ──────────────────────────
questions.append(q(
    "In Fyodor Dostoevsky's Notes from Underground (1864), the narrator's famous opening declaration — 'I am a sick man... I am a spiteful man' — is immediately complicated by his confession that he is 'not sure' whether he is actually spiteful. This self-undermining gesture recurs throughout the text: the narrator asserts a position only to retract or qualify it within the same paragraph. Dostoevsky uses this technique not to portray mere indecisiveness but to dramatize a consciousness so hyperaware of its own motivations that every self-description becomes suspect. The Underground Man's inability to commit to any stable self-portrait becomes, paradoxically, his most consistent characteristic.\n\n— Adapted from Fyodor Dostoevsky, Notes from Underground, 1864.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Dostoevsky uses the narrator's compulsive self-contradiction to dramatize a hyper-self-aware consciousness whose very inability to fix a stable self-image becomes its defining trait.",
        "B": "Notes from Underground is primarily a medical narrative about a physically ill man seeking treatment.",
        "C": "The narrator's opening declaration proves that he is genuinely spiteful throughout the entire novel.",
        "D": "Dostoevsky wrote Notes from Underground to demonstrate that all people are fundamentally indecisive."
    },
    "A",
    "The passage shows that the narrator asserts, then retracts, then the passage interprets this as 'hyper-awareness' rather than 'mere indecisiveness,' and finally identifies the paradox: instability is the most consistent trait. Choice A synthesizes all three analytical layers.",
    {
        "B": "Too Broad — The word 'sick' is part of the narrator's self-description, but the passage immediately complicates its meaning; reducing the text to a medical narrative ignores the psychological and literary analysis.",
        "C": "Detail as Main Idea — The narrator's claim of spitefulness is the opening assertion, but the passage's entire point is that this claim is immediately retracted and qualified.",
        "D": "Outside Knowledge — The passage analyzes one specific literary character's hyper-self-awareness; it does not generalize to 'all people.'"
    }
))

# ── Q18 — History/Social Studies ──────────────
questions.append(q(
    "W. E. B. Du Bois's concept of 'double consciousness,' introduced in The Souls of Black Folk (1903), describes the experience of 'always looking at one's self through the eyes of others.' While this is commonly interpreted as a purely psychological burden, Du Bois's original formulation is more nuanced: he argues that double consciousness also produces a unique epistemic advantage. The African American, forced to understand both Black and white American perspectives, develops an analytical vantage point unavailable to those who see the world from a single cultural position. Du Bois thus frames the experience as simultaneously a wound and a cognitive resource.\n\n— Adapted from W. E. B. Du Bois, The Souls of Black Folk, 1903.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Du Bois's double consciousness is both a psychological burden and an epistemic advantage, giving African Americans a dual perspective that constitutes a unique analytical resource.",
        "B": "Du Bois believed that African Americans should abandon their own cultural perspective and assimilate entirely into white American society.",
        "C": "The Souls of Black Folk is primarily a sociological study of economic conditions in the post-Reconstruction South.",
        "D": "Double consciousness affects all minority groups equally regardless of historical context."
    },
    "A",
    "The passage corrects a 'common interpretation' (purely a burden) by showing that Du Bois also sees an 'epistemic advantage.' The central idea synthesizes both dimensions: wound AND cognitive resource. Choice A captures this duality.",
    {
        "B": "Distortion — Du Bois describes a dual perspective as a 'cognitive resource,' meaning he values the African American viewpoint; advocating abandonment of that perspective contradicts his argument.",
        "C": "Too Broad — The passage focuses specifically on the concept of double consciousness, not the full scope of The Souls of Black Folk as a sociological study.",
        "D": "Outside Knowledge — The passage discusses Du Bois's analysis of African American experience specifically; generalizing to 'all minority groups' imports claims not present in the text."
    }
))

# ── Q19 — Science ─────────────────────────────
questions.append(q(
    "CRISPR-Cas9 gene editing has been celebrated for its precision, but recent whole-genome sequencing of edited cells reveals a more complex picture. Studies have detected large-scale chromosomal rearrangements — deletions spanning thousands of base pairs and even chromothripsis-like shattering events — at a frequency previously unrecognized by standard PCR-based quality checks. These structural alterations often escape detection because they occur outside the narrow genomic window typically examined after editing. The findings do not invalidate CRISPR as a research tool, but they raise significant concerns for therapeutic applications where unintended genomic disruption could trigger oncogenesis or disable essential genes.\n\n— Adapted from M. Kosicki et al., \"Repair of double-strand breaks induced by CRISPR–Cas9 leads to large deletions and complex rearrangements,\" Nature Biotechnology, 2018.",
    "Which choice best states the main idea of the text?",
    {
        "A": "CRISPR-Cas9 is a completely safe and precise tool that produces no unintended genomic effects.",
        "B": "Whole-genome sequencing reveals that CRISPR editing can cause large-scale chromosomal rearrangements undetected by standard checks, raising concerns for therapeutic use without invalidating the technology for research.",
        "C": "PCR-based quality checks are the gold standard for assessing the accuracy of all gene editing technologies.",
        "D": "Chromothripsis is the most common outcome of CRISPR-Cas9 editing in all cell types."
    },
    "B",
    "The passage balances two claims: CRISPR causes previously unrecognized large-scale damage AND this doesn't 'invalidate' research use but raises 'significant concerns for therapeutic applications.' The central idea requires holding both halves together. Choice B does this.",
    {
        "A": "Distortion — The entire passage documents unintended genomic effects, directly contradicting 'completely safe and precise.'",
        "C": "Distortion — The passage says standard PCR checks MISS these rearrangements, implying they are inadequate, not the 'gold standard.'",
        "D": "Too Broad — Chromothripsis-like events are mentioned as one type of rearrangement, not the 'most common outcome' in 'all cell types.'"
    }
))

# ── Q20 — Literature ──────────────────────────
questions.append(q(
    "In Virginia Woolf's Mrs Dalloway (1925), Clarissa Dalloway's party preparations serve as the occasion for a narrative technique in which external actions dissolve into interior monologue. As Clarissa buys flowers, Woolf shifts imperceptibly from describing the street scene to representing Clarissa's memory of a morning at Bourton decades earlier. The transition is unmarked by any typographic or syntactic break, creating the effect of past and present existing simultaneously in consciousness. Woolf's method implies that identity is not a stable entity persisting through time but a continuous process of reconstitution in which memory and perception interpenetrate.\n\n— Adapted from Virginia Woolf, Mrs Dalloway, 1925.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Woolf's seamless blending of present action and past memory in Mrs Dalloway implies that identity is a continuous process of reconstitution rather than a fixed entity.",
        "B": "Mrs Dalloway is primarily a novel about the social customs of London flower shops in the 1920s.",
        "C": "Woolf's narrative technique relies heavily on typographic markers to distinguish past from present.",
        "D": "Clarissa Dalloway's memories of Bourton prove that she prefers her past life to her present one."
    },
    "A",
    "The passage connects a specific narrative technique (unmarked transition from present to past) to a philosophical implication (identity as continuous reconstitution). The central idea emerges from synthesizing form and meaning: HOW Woolf writes reveals WHAT she implies about identity. Choice A captures both dimensions.",
    {
        "B": "Too Broad — The flower-buying is a surface-level plot detail; the passage's concern is with narrative technique and its philosophical implications.",
        "C": "Distortion — The passage explicitly says the transition is 'unmarked by any typographic or syntactic break,' directly contradicting this claim.",
        "D": "Outside Knowledge — The passage does not claim Clarissa prefers the past; it says past and present coexist in consciousness, which is a structural observation, not a character preference."
    }
))

# ── Q21 — History/Social Studies ──────────────
questions.append(q(
    "In her 1791 Declaration of the Rights of Woman and the Female Citizen, Olympe de Gouges mirrors the language of the 1789 Declaration of the Rights of Man, substituting 'woman' for 'man' throughout. This formal parallelism is itself an argument: by demonstrating that the original document's universalist language can accommodate female subjects without logical strain, de Gouges exposes the contradiction between the Revolution's egalitarian principles and its exclusion of women. Her method is immanent critique — she does not appeal to external moral standards but shows that the Revolution's own premises, consistently applied, demand women's rights.\n\n— Adapted from Olympe de Gouges, Declaration of the Rights of Woman and the Female Citizen, 1791.",
    "Which choice best states the main idea of the text?",
    {
        "A": "De Gouges uses the Revolution's own egalitarian language to demonstrate that its principles, consistently applied, logically require the inclusion of women's rights.",
        "B": "De Gouges rejected all aspects of the French Revolution and advocated for a return to monarchical rule.",
        "C": "The Declaration of the Rights of Man was the most progressive political document of the eighteenth century.",
        "D": "De Gouges's document was primarily concerned with economic reforms for working-class women in Paris."
    },
    "A",
    "The passage identifies de Gouges's method as 'immanent critique' — using the Revolution's own premises against its exclusions. The central idea is that formal parallelism serves as an argument exposing contradiction. Choice A synthesizes the method and its purpose.",
    {
        "B": "Distortion — De Gouges does not reject the Revolution; she embraces its principles and demands their consistent application to include women.",
        "C": "Outside Knowledge — The passage does not evaluate the Declaration of the Rights of Man as 'most progressive'; this is an external judgment not present in the text.",
        "D": "Outside Knowledge — The passage discusses rights language and political principles, not specific economic reforms or working-class women in Paris."
    }
))

# ── Q22 — Science ─────────────────────────────
questions.append(q(
    "The human gut microbiome varies more between individuals than between body sites within the same individual, and this inter-individual variation has hindered the identification of a 'core' microbiome. However, metagenomic studies have shown that while taxonomic composition differs widely, functional gene profiles are remarkably conserved. Different bacterial species in different people perform the same metabolic tasks — fermenting dietary fiber, synthesizing vitamins, modulating immune signaling — using homologous but taxonomically distinct enzyme systems. This functional redundancy suggests that the relevant unit of microbiome analysis is not the species but the metabolic pathway.\n\n— Adapted from Human Microbiome Project Consortium, \"Structure, function and diversity of the healthy human microbiome,\" Nature, 2012.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Despite wide taxonomic variation in the gut microbiome across individuals, functional gene profiles are conserved, suggesting that metabolic pathways rather than species identity may be the fundamental unit of microbiome analysis.",
        "B": "The human gut microbiome is identical in all healthy adults.",
        "C": "Metagenomic studies have proven that dietary fiber is the only nutrient processed by gut bacteria.",
        "D": "Variation between body sites within the same individual is the greatest challenge in microbiome research."
    },
    "A",
    "The passage contrasts high taxonomic variability with conserved functional profiles, then draws the conclusion that metabolic pathways are the relevant analytic unit. Choice A synthesizes the contrast and the conclusion.",
    {
        "B": "Distortion — The passage emphasizes that the microbiome 'varies more between individuals,' directly contradicting 'identical in all healthy adults.'",
        "C": "Detail as Main Idea — Dietary fiber fermentation is one example of a conserved function, not the passage's main claim.",
        "D": "Distortion — The passage says inter-individual variation is GREATER than between-body-site variation, the opposite of this claim."
    }
))

# ── Q23 — Literature ──────────────────────────
questions.append(q(
    "In Thomas Hardy's Tess of the d'Urbervilles (1891), the narrator describes the Vale of Blackmoor as a landscape of 'fertile and sheltered' beauty, yet Hardy repeatedly associates this apparent paradise with entrapment. Tess's family home, nestled in the valley, is both a refuge and a cage; the same hills that shield the vale from harsh weather also limit Tess's vision of the wider world. When Tess finally leaves the valley, Hardy describes her journey in language that echoes an expulsion from Eden — but with the crucial difference that the world beyond, though harsher, offers possibilities the sheltered valley could never provide.\n\n— Adapted from Thomas Hardy, Tess of the d'Urbervilles, 1891.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Hardy uses the Vale of Blackmoor as an ambivalent symbol in which shelter and entrapment coexist, and Tess's departure, though echoing Edenic expulsion, opens possibilities unavailable within the valley's confines.",
        "B": "Hardy's primary concern in the novel is accurate botanical description of the English countryside.",
        "C": "The Vale of Blackmoor is portrayed as an entirely positive and nurturing environment for Tess throughout the novel.",
        "D": "Tess leaves the valley because she is expelled by her neighbors for violating community moral standards."
    },
    "A",
    "The passage presents the valley as 'both a refuge and a cage' and Tess's departure as Edenic expulsion WITH a crucial difference (the outside world offers possibilities). Choice A synthesizes the ambivalent symbolism and the paradox of departure.",
    {
        "C": "Distortion — The passage explicitly states that the apparent paradise is also associated with 'entrapment'; 'entirely positive' contradicts the text's dual framing.",
        "B": "Too Broad — The passage uses landscape symbolically; Hardy's 'primary concern' is not botanical accuracy but the psychological and symbolic dimensions of setting.",
        "D": "Outside Knowledge — The passage does not mention neighbors or moral standards as reasons for Tess's departure; this imports plot details not present in the passage."
    }
))

# ── Q24 — History/Social Studies ──────────────
questions.append(q(
    "In his 1963 'Letter from Birmingham Jail,' Martin Luther King Jr. addresses white moderate clergymen who advocate patience, arguing that 'justice too long delayed is justice denied.' King distinguishes between just and unjust laws by invoking St. Augustine and natural law theory, but he also provides a concrete political criterion: a just law is one that the majority imposes on itself equally, while an unjust law is one that a majority imposes on a minority without binding itself to the same standard. This dual framework — philosophical and political — enables King to argue that civil disobedience is not lawlessness but a higher form of legal respect.\n\n— Adapted from Martin Luther King Jr., 'Letter from Birmingham Jail,' 1963.",
    "Which choice best states the main idea of the text?",
    {
        "A": "King uses both philosophical (natural law) and political (equal application) criteria to distinguish just from unjust laws, thereby framing civil disobedience as a form of respect for law rather than lawlessness.",
        "B": "King's letter is primarily a personal response to imprisonment and has no broader political argument.",
        "C": "King advocates breaking all laws as a strategy for achieving social change.",
        "D": "The white moderate clergymen fully supported King's methods of nonviolent protest."
    },
    "A",
    "The passage identifies King's dual framework (Augustine/natural law AND political criterion of equal application) and shows how both converge on the conclusion that civil disobedience represents 'a higher form of legal respect.' Choice A synthesizes this dual framework and its conclusion.",
    {
        "B": "Too Broad — Reducing the letter to a personal response ignores the detailed philosophical and political argument the passage describes.",
        "C": "Distortion — King distinguishes just from unjust laws; he advocates disobeying unjust laws specifically, not 'breaking all laws.'",
        "D": "Distortion — The passage says King 'addresses white moderate clergymen who advocate patience,' implying they oppose his timing and methods."
    }
))

# ── Q25 — Science ─────────────────────────────
questions.append(q(
    "Epigenetic inheritance — the transmission of gene-regulatory information across generations without changes to DNA sequence — has been documented in plants, nematodes, and, controversially, in mammals. In a widely cited experiment, mice conditioned to associate a cherry-blossom odor with electric shock produced offspring that exhibited heightened startle responses to the same odor despite never being exposed to the conditioning. Bisulfite sequencing revealed altered methylation at the olfactory receptor gene Olfr151 in both parents and offspring. Critics note, however, that the mechanism by which sperm methylation patterns survive the extensive epigenetic reprogramming that occurs after fertilization remains poorly understood.\n\n— Adapted from B. Dias and K. Bhatt, \"Parental olfactory experience influences behavior and neural structure in subsequent generations,\" Nature Neuroscience, 2014.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Experiments suggest that epigenetic marks associated with learned fear can be transmitted across mouse generations, but the mechanism by which these marks survive post-fertilization reprogramming remains contested.",
        "B": "Epigenetic inheritance has been conclusively proven to occur in all mammalian species.",
        "C": "Bisulfite sequencing is the only reliable method for studying gene methylation patterns.",
        "D": "Electric shock conditioning permanently alters the DNA sequence of the Olfr151 gene."
    },
    "A",
    "The passage presents both the striking finding (transgenerational fear-odor association with methylation evidence) and the critique (mechanism unknown for surviving reprogramming). The central idea holds both in tension: evidence exists, but mechanistic understanding is incomplete. Choice A captures this balance.",
    {
        "B": "Too Broad — The passage describes the mammalian case as 'controversially' documented and notes critics; 'conclusively proven in all mammalian species' overstates the evidence.",
        "C": "Detail as Main Idea — Bisulfite sequencing is mentioned as one technique used; the passage is not about the superiority of that method.",
        "D": "Distortion — The passage explicitly describes epigenetic (methylation) changes, not DNA sequence alterations; confusing epigenetics with genetics is a fundamental misreading."
    }
))

# ── Q26 — Literature ──────────────────────────
questions.append(q(
    "In Herman Melville's 'Bartleby, the Scrivener' (1853), the lawyer-narrator's bewildered response to Bartleby's 'I would prefer not to' has been read as a satire of managerial authority confronted by passive resistance. Yet Melville's narration also emphasizes the lawyer's genuine, if ultimately inadequate, compassion: he offers Bartleby alternative employment, invites him to his home, and agonizes over his own moral responsibility. The story's power derives from the tension between the lawyer's humane impulses and the institutional logic that ultimately requires him to abandon Bartleby. Melville presents not a simple villain but a sympathetic figure whose goodwill is structurally insufficient.\n\n— Adapted from Herman Melville, 'Bartleby, the Scrivener,' 1853.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Melville's story derives its power from the tension between the lawyer's genuine compassion and the institutional constraints that render his goodwill structurally insufficient to help Bartleby.",
        "B": "Bartleby's phrase 'I would prefer not to' is simply a polite way of declining work assignments.",
        "C": "The lawyer-narrator is portrayed as a heartless villain who deliberately destroys Bartleby's life.",
        "D": "Melville wrote 'Bartleby' primarily as a realistic account of nineteenth-century office management practices."
    },
    "A",
    "The passage identifies a tension: the lawyer is genuinely compassionate (not a villain) but his compassion is 'structurally insufficient' within institutional logic. This tension, not either extreme, is the story's power. Choice A synthesizes both elements.",
    {
        "B": "Detail as Main Idea — The phrase is a famous element of the story, but the passage's analysis goes far beyond its surface meaning to explore the structural tension between compassion and institutional logic.",
        "C": "Distortion — The passage explicitly states the lawyer is 'not a simple villain' and describes his 'genuine compassion,' directly contradicting 'heartless villain.'",
        "D": "Too Broad — The passage treats the story as a literary work about moral and structural tension, not as a realistic management account."
    }
))

# ── Q27 — History/Social Studies ──────────────
questions.append(q(
    "Hannah Arendt's distinction between labor, work, and action in The Human Condition (1958) argues that modern society collapses these three activities into a single category of 'labor' — the cyclical maintenance of biological life. For Arendt, 'work' produces durable objects that outlast their makers, while 'action' — speech and deed in the public sphere — is the uniquely human capacity to begin something genuinely new. She warns that when political life is reduced to economic management, the space for action contracts, and citizens become laborers rather than agents. The danger is not poverty but meaninglessness.\n\n— Adapted from Hannah Arendt, The Human Condition, 1958.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Arendt argues that modern society's reduction of all human activity to labor threatens the space for genuine political action, risking not poverty but meaninglessness.",
        "B": "Arendt's primary argument is that economic prosperity is the most important goal of political life.",
        "C": "The Human Condition is a practical guide to improving workplace productivity in modern industrial societies.",
        "D": "Arendt believes that all three categories of human activity — labor, work, and action — are equally valued in contemporary society."
    },
    "A",
    "The passage traces Arendt's three-part distinction and then identifies her warning: collapsing everything into 'labor' eliminates the space for 'action,' and the resulting danger is 'meaninglessness,' not poverty. Choice A synthesizes the conceptual framework and its warning.",
    {
        "B": "Distortion — Arendt explicitly warns against reducing politics to 'economic management'; valuing economic prosperity as the primary goal is precisely what she critiques.",
        "C": "Too Broad — The passage discusses philosophical categories of human activity, not workplace productivity.",
        "D": "Distortion — The passage's central argument is that modern society does NOT value them equally but collapses them all into 'labor.'"
    }
))

# ── Q28 — Science ─────────────────────────────
questions.append(q(
    "Gravitational-wave detectors like LIGO achieve sensitivities sufficient to measure displacements smaller than a proton's diameter, yet their observations are limited to transient events — mergers of black holes and neutron stars that last seconds or less. A proposed next-generation detector, the Laser Interferometer Space Antenna (LISA), would extend sensitivity to millihertz frequencies, enabling detection of gravitational waves from supermassive black hole mergers and compact binary systems that orbit for years before merging. This frequency regime would open a window onto astrophysical processes currently invisible to ground-based detectors, but LISA's space-based design introduces engineering challenges — thermal stability, laser pointing, and drag-free flight — that remain unsolved at the required precision.\n\n— Adapted from K. Danzmann et al., \"LISA: A proposal in response to the ESA call for L3 mission concepts,\" 2017.",
    "Which choice best states the main idea of the text?",
    {
        "A": "The proposed LISA detector would extend gravitational-wave observations to previously inaccessible astrophysical processes, but its space-based design poses significant unsolved engineering challenges.",
        "B": "LIGO has already detected all types of gravitational waves that exist in the universe.",
        "C": "LISA's primary advantage over LIGO is its lower construction cost.",
        "D": "Ground-based gravitational-wave detectors are inherently superior to space-based ones for all purposes."
    },
    "A",
    "The passage balances LISA's scientific promise (millihertz sensitivity, new astrophysical processes) against its engineering obstacles (thermal stability, pointing, drag-free flight). The central idea holds both in tension. Choice A captures this promise-versus-challenge structure.",
    {
        "B": "Too Broad — The passage explicitly says LIGO is limited to transient events at higher frequencies; an entire regime (millihertz) remains undetected.",
        "C": "Outside Knowledge — The passage does not discuss construction costs; this imports information not present in the text.",
        "D": "Distortion — The passage argues that ground-based detectors are limited ('observations are limited to transient events'), which is why LISA is needed — contradicting 'inherently superior.'"
    }
))

# ── Q29 — Literature ──────────────────────────
questions.append(q(
    "In Nathaniel Hawthorne's The Scarlet Letter (1850), Roger Chillingworth's transformation from a scholarly physician into a figure of malevolent obsession is rendered through subtle changes in physical description. Hawthorne initially presents Chillingworth as stooped and elderly but intellectually vigorous; as his fixation on Dimmesdale intensifies, the narrator describes a 'dark, quiet' expression, a 'glare of red light' from his eyes, and finally a 'fiend-like' aspect. These accumulating details are focalized through the community's perception, making it unclear whether Chillingworth physically changes or the townspeople's suspicion projects evil onto his appearance. Hawthorne thus implicates the reader in the same interpretive uncertainty.\n\n— Adapted from Nathaniel Hawthorne, The Scarlet Letter, 1850.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Hawthorne portrays Chillingworth's transformation through progressive physical descriptions that may reflect either genuine change or the community's projected suspicion, implicating readers in the interpretive ambiguity.",
        "B": "Chillingworth undergoes a literal, supernatural transformation from a human physician into a demonic entity.",
        "C": "Hawthorne uses Chillingworth to argue that all physicians in Puritan New England were morally corrupt.",
        "D": "The community in The Scarlet Letter consistently views Chillingworth with admiration and respect."
    },
    "A",
    "The passage presents progressive physical details and then introduces interpretive uncertainty: is the change real or projected? Hawthorne 'implicates the reader' in this ambiguity. Choice A synthesizes the descriptive progression, the ambiguity of focalization, and the reader's involvement.",
    {
        "B": "Distortion — The passage explicitly says it is 'unclear whether Chillingworth physically changes'; claiming a 'literal, supernatural transformation' ignores the ambiguity.",
        "C": "Outside Knowledge — The passage discusses one specific character, not 'all physicians'; generalizing to a moral claim about Puritan physicians imports external assumptions.",
        "D": "Distortion — The community perceives 'fiend-like' aspects and projects 'evil' onto his appearance, the opposite of 'admiration and respect.'"
    }
))

# ── Q30 — History/Social Studies ──────────────
questions.append(q(
    "In 'The Significance of the Frontier in American History' (1893), Frederick Jackson Turner argues that the existence of free land on the western frontier shaped American democratic institutions and national character. Turner contends that the frontier promoted individualism, practical inventiveness, and egalitarian social relations by stripping settlers of inherited European status hierarchies. However, Turner's thesis has been extensively criticized for erasing the presence and dispossession of Indigenous peoples, whose removal was the precondition for the 'free land' he celebrates. The frontier, in this revised view, was not an empty space but a zone of colonial violence.\n\n— Adapted from Frederick Jackson Turner, 'The Significance of the Frontier in American History,' 1893; with critical commentary.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Turner's frontier thesis attributes American democratic character to the availability of free land, but subsequent criticism has exposed the thesis's erasure of Indigenous dispossession as the precondition for that availability.",
        "B": "Turner's frontier thesis has been universally accepted by all subsequent historians as the definitive explanation of American democracy.",
        "C": "The passage argues that European status hierarchies were successfully maintained throughout the American frontier experience.",
        "D": "Turner's primary concern was documenting the agricultural techniques used by frontier settlers."
    },
    "A",
    "The passage presents Turner's thesis (free land → democratic character) and then introduces the critical revision (free land required Indigenous dispossession). The central idea holds both in tension. Choice A captures the thesis and its critique.",
    {
        "B": "Distortion — The passage says the thesis 'has been extensively criticized,' directly contradicting 'universally accepted.'",
        "C": "Distortion — Turner argues the frontier 'stripped settlers of inherited European status hierarchies'; this claim contradicts the passage.",
        "D": "Detail as Main Idea — The passage mentions 'practical inventiveness' as one frontier quality, but Turner's concern is with democratic institutions and national character, not agricultural techniques specifically."
    }
))

# ── Q31 — Science ─────────────────────────────
questions.append(q(
    "Rapid advances in single-cell RNA sequencing have revealed that tissues once considered homogeneous contain dozens of distinct cell types, each defined by unique transcriptomic profiles. In the human lung, for example, researchers have identified ionocytes — rare cells expressing the cystic fibrosis transmembrane conductance regulator (CFTR) at levels far exceeding those of other epithelial cells. This discovery is clinically significant because cystic fibrosis was previously assumed to result from CFTR dysfunction distributed broadly across airway epithelium. The concentration of CFTR expression in ionocytes suggests that therapeutic strategies should target this specific cell population, fundamentally reorienting the approach to gene therapy for the disease.\n\n— Adapted from D. Montoro et al., \"A revised airway epithelial hierarchy includes CFTR-expressing ionocytes,\" Nature, 2018.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Single-cell RNA sequencing has been applied to every organ in the human body with equal success.",
        "B": "The discovery that CFTR expression is concentrated in rare ionocytes challenges the assumption of broad epithelial dysfunction in cystic fibrosis and redirects therapeutic strategies toward targeting this specific cell type.",
        "C": "Ionocytes are the most abundant cell type in the human lung.",
        "D": "Cystic fibrosis has already been cured by gene therapy targeting ionocytes."
    },
    "B",
    "The passage traces a discovery narrative: new sequencing technology reveals ionocytes, which concentrate CFTR expression, which revises the clinical model of cystic fibrosis and 'fundamentally reorients' therapeutic strategy. Choice B synthesizes all three layers.",
    {
        "A": "Too Broad — The passage discusses lung tissue specifically; it does not claim sequencing has been applied to every organ 'with equal success.'",
        "C": "Distortion — The passage describes ionocytes as 'rare cells,' directly contradicting 'most abundant.'",
        "D": "Outside Knowledge — The passage says the discovery 'suggests' therapeutic strategies 'should' target ionocytes, not that a cure has been achieved."
    }
))

# ── Q32 — Literature ──────────────────────────
questions.append(q(
    "In Leo Tolstoy's Anna Karenina (1877), Levin's experience of mowing alongside peasant laborers is rendered not as pastoral idealization but as a moment of unselfconscious absorption. Tolstoy describes Levin losing awareness of his body's effort as the scythe begins to move 'of itself,' a state the narrator compares to artistic inspiration. Yet Tolstoy immediately complicates this moment: Levin's absorption is temporary, and he is embarrassed to find that the peasants have continued without tiring while he must rest. The scene thus presents physical labor as a site of momentary transcendence that also exposes the social gulf between Levin's recreational participation and the peasants' economic necessity.\n\n— Adapted from Leo Tolstoy, Anna Karenina, 1877.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Tolstoy uses Levin's mowing scene to present labor as a site of momentary transcendence that simultaneously reveals the unbridgeable social divide between Levin's voluntary participation and the peasants' economic compulsion.",
        "B": "Tolstoy portrays Levin as a man who prefers agricultural work to all other activities and wishes to become a peasant.",
        "C": "The mowing scene demonstrates that aristocrats are physically stronger and more skilled than peasant laborers.",
        "D": "Anna Karenina is primarily a novel about agricultural techniques in nineteenth-century Russia."
    },
    "A",
    "The passage presents two layers: Levin's moment of absorption (transcendence) and its immediate qualification (he tires while peasants continue, exposing the social gulf). Choice A captures both the transcendence and the class divide it reveals.",
    {
        "B": "Distortion — The passage says Levin's absorption is 'temporary' and 'recreational'; it does not claim he wishes to become a peasant.",
        "C": "Distortion — The passage says the opposite: Levin must rest while peasants continue, showing the peasants' greater endurance.",
        "D": "Too Broad — The mowing scene is one episode analyzed for its literary and social significance, not a representation of the novel's primary concern with agricultural techniques."
    }
))

# ── Q33 — History/Social Studies ──────────────
questions.append(q(
    "Mary Wollstonecraft's A Vindication of the Rights of Woman (1792) has been celebrated as a foundational feminist text, but Wollstonecraft's argument is more conservative than modern readers might expect. She does not challenge the domestic role of women; instead, she argues that educated women would be better mothers and more rational companions to their husbands. Her feminism is instrumental: she demands education for women not because education is an intrinsic right but because ignorance produces the frivolity and dependence that men then cite as proof of women's inferiority. Wollstonecraft's radicalism, therefore, lies not in rejecting gender roles but in dismantling the circular logic used to justify women's exclusion from intellectual life.\n\n— Adapted from Mary Wollstonecraft, A Vindication of the Rights of Woman, 1792.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Wollstonecraft's feminism is instrumental, demanding education for women to improve their domestic performance and break the circular reasoning that uses women's imposed ignorance as evidence of their natural inferiority.",
        "B": "Wollstonecraft was the first person in history to argue that women should receive any form of education.",
        "C": "A Vindication of the Rights of Woman argues that women should abandon domestic roles entirely and pursue professional careers.",
        "D": "Wollstonecraft's text is a radical rejection of all Enlightenment values and rationalist philosophy."
    },
    "A",
    "The passage qualifies the common celebratory reading by showing Wollstonecraft's argument is 'more conservative than modern readers might expect': she supports domestic roles but demands education to break circular justifications of exclusion. Choice A synthesizes the instrumental nature of her feminism and its logical target.",
    {
        "B": "Outside Knowledge — The passage does not claim Wollstonecraft was the 'first person' to argue for women's education; this imports historical priority claims not in the text.",
        "C": "Distortion — The passage explicitly says Wollstonecraft 'does not challenge the domestic role of women,' directly contradicting 'abandon domestic roles entirely.'",
        "D": "Distortion — Wollstonecraft uses Enlightenment rationalism to argue for education; she is applying rationalist values, not rejecting them."
    }
))

# ── Q34 — Science ─────────────────────────────
questions.append(q(
    "Recent measurements of the cosmic microwave background (CMB) confirm the Lambda-CDM model's predictions to extraordinary precision, yet several persistent anomalies trouble cosmologists. The 'Hubble tension' — a statistically significant discrepancy between the expansion rate measured from the CMB and from local distance-ladder observations — has survived increasingly refined measurements by both camps. Some theorists propose that the tension signals new physics beyond the standard model, such as early dark energy or modified neutrino interactions, while others argue that systematic errors in distance-ladder calibrations could resolve the disagreement without invoking exotic mechanisms.\n\n— Adapted from A. Riess et al., \"Large Magellanic Cloud Cepheid Standards Provide a 1% Foundation for the Determination of H₀,\" The Astrophysical Journal, 2019.",
    "Which choice best states the main idea of the text?",
    {
        "A": "The Hubble tension represents a persistent discrepancy in expansion-rate measurements that may either signal new physics beyond the standard cosmological model or stem from unresolved systematic errors.",
        "B": "The Lambda-CDM model has been completely invalidated by recent measurements of the cosmic microwave background.",
        "C": "All cosmologists agree that early dark energy is the correct explanation for the Hubble tension.",
        "D": "The cosmic microwave background provides no useful information about the expansion rate of the universe."
    },
    "A",
    "The passage presents the Hubble tension as a persistent anomaly and then offers two competing interpretations: new physics or systematic errors. The central idea holds both possibilities without resolving the debate. Choice A captures this open tension.",
    {
        "B": "Distortion — The passage says the CMB confirms Lambda-CDM 'to extraordinary precision'; the model has anomalies but has not been 'completely invalidated.'",
        "C": "Too Broad — The passage presents early dark energy as one proposal from 'some theorists,' not a consensus; 'all cosmologists agree' overstates the case.",
        "D": "Distortion — The passage explicitly discusses expansion-rate measurements derived from the CMB, contradicting 'no useful information.'"
    }
))

# ── Q35 — Literature ──────────────────────────
questions.append(q(
    "In Emily Dickinson's poem 'Because I could not stop for Death' (c. 1862), Death is personified as a courteous carriage driver who escorts the speaker past scenes of ordinary life — a school, fields of grain, the setting sun. This genial portrayal defies conventional associations of death with terror, yet Dickinson's final stanza introduces a disorienting temporal shift: 'Since then — 'tis Centuries — and yet / Feels shorter than the Day.' The compression of centuries into a single sensation disrupts the poem's measured civility, suggesting that what initially appeared as a leisurely journey was, in fact, an irrevocable transition whose full implications the speaker only belatedly grasps.\n\n— Adapted from Emily Dickinson, 'Because I could not stop for Death,' c. 1862.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Dickinson's personification of Death as a courteous driver creates an initial impression of civility that is undercut by the final stanza's disorienting temporal compression, revealing the journey as an irrevocable transition grasped only in retrospect.",
        "B": "Dickinson's poem is a straightforward celebration of death as a peaceful and welcome experience.",
        "C": "The poem's imagery of schools and grain fields proves that Dickinson longed for a simple rural life.",
        "D": "Dickinson wrote the poem to express her religious belief in a specific Christian afterlife."
    },
    "A",
    "The passage moves from the genial surface (courteous driver, ordinary scenes) to the final stanza's disruption (centuries compressed into a day), interpreting the whole as an irrevocable transition grasped 'belatedly.' Choice A synthesizes the surface civility, the disruption, and the retrospective realization.",
    {
        "B": "Distortion — The passage says the genial portrayal is disrupted by temporal compression; calling the poem a 'straightforward celebration' ignores the final stanza's disorienting effect.",
        "C": "Detail as Main Idea — Schools and grain fields are passing images in the carriage ride, not evidence of Dickinson's personal longing for rural life.",
        "D": "Outside Knowledge — The passage does not discuss Dickinson's religious beliefs or a specific afterlife doctrine; this imports biographical speculation not in the text."
    }
))

# ── Q36 — History/Social Studies ──────────────
questions.append(q(
    "John Stuart Mill's On Liberty (1859) distinguishes between 'self-regarding' actions that affect only the individual and 'other-regarding' actions that affect others. Mill argues that society may legitimately restrict only other-regarding actions, but his critics have noted that the boundary between these categories is far less stable than Mill acknowledges. Virtually every private decision — from diet to substance use — can be shown to have social consequences through health-care costs, lost productivity, or familial harm. Mill's 'harm principle,' therefore, depends on a prior judgment about which harms are significant enough to warrant collective intervention, a judgment that is itself political rather than purely philosophical.\n\n— Adapted from John Stuart Mill, On Liberty, 1859; with critical commentary.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Mill's harm principle rests on a distinction between self-regarding and other-regarding actions that critics argue is unstable, since nearly all private decisions have social consequences, making the boundary a political judgment rather than a fixed philosophical line.",
        "B": "Mill believed that the government should regulate every aspect of citizens' private lives.",
        "C": "The distinction between self-regarding and other-regarding actions was universally accepted by all philosophers after Mill.",
        "D": "Mill's On Liberty is primarily concerned with economic policy and trade regulation."
    },
    "A",
    "The passage presents Mill's distinction, then introduces the critique that the boundary is unstable because private decisions have social effects, concluding that the harm principle requires a prior political judgment. Choice A synthesizes the principle, the critique, and the conclusion.",
    {
        "B": "Distortion — Mill argues the opposite: society may restrict ONLY other-regarding actions, defending the sphere of private liberty.",
        "C": "Too Broad — The passage presents extensive criticism of the distinction, contradicting 'universally accepted.'",
        "D": "Outside Knowledge — The passage discusses the harm principle and the self/other boundary, not economic policy; this imports subject matter not present in the text."
    }
))

# ── Q37 — Science ─────────────────────────────
questions.append(q(
    "Artificial photosynthesis systems aim to convert sunlight, water, and carbon dioxide into chemical fuels, mimicking the natural process. Current prototypes achieve light-harvesting efficiencies exceeding those of natural leaves, yet their practical deployment is limited by catalyst degradation: the molecular complexes that split water oxidize within hours, whereas biological photosystems replace damaged components through continuous protein turnover. The central engineering challenge, therefore, is not improving initial efficiency but achieving the self-repair capability that sustains biological photosynthesis over months and years of operation.\n\n— Adapted from D. Nocera, \"The artificial leaf,\" Accounts of Chemical Research, 2012.",
    "Which choice best states the main idea of the text?",
    {
        "A": "The main obstacle to practical artificial photosynthesis is not initial light-harvesting efficiency but the absence of self-repair mechanisms that biological systems use to sustain long-term operation.",
        "B": "Artificial photosynthesis has already been commercialized and is widely used for industrial fuel production.",
        "C": "Natural photosynthesis is less efficient at light harvesting than all existing artificial systems.",
        "D": "Catalyst degradation is a minor issue that does not significantly affect the feasibility of artificial photosynthesis."
    },
    "A",
    "The passage contrasts high initial efficiency with rapid catalyst degradation, then identifies self-repair as the central challenge. The key word 'therefore' signals the main claim: longevity, not initial performance, is the bottleneck. Choice A captures this.",
    {
        "B": "Outside Knowledge — The passage describes 'prototypes' and 'challenges,' indicating the technology is not yet commercialized.",
        "C": "Detail as Main Idea — The passage mentions prototypes exceed natural leaf efficiency, but this is a supporting detail contrasted with the main issue of durability.",
        "D": "Distortion — The passage identifies catalyst degradation as the central limiting factor, directly contradicting 'minor issue.'"
    }
))

# ── Q38 — Literature ──────────────────────────
questions.append(q(
    "In Anton Chekhov's 'The Lady with the Dog' (1899), Gurov initially pursues Anna as a trivial seaside affair, confident that the encounter will follow the predictable arc of his previous infidelities. Chekhov subverts this expectation not through dramatic revelation but through incremental emotional accumulation: Gurov finds himself remembering Anna's expressions weeks after returning to Moscow, comparing her sincerity unfavorably against his wife's social performances. The story's conclusion offers no resolution — Gurov and Anna remain trapped between their respective marriages and their feelings — but this absence of closure is itself Chekhov's point: genuine emotional transformation does not conform to the narrative conventions of beginning, climax, and resolution.\n\n— Adapted from Anton Chekhov, 'The Lady with the Dog,' 1899.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Chekhov subverts the expected arc of a trivial affair through incremental emotional deepening, using the absence of narrative closure to suggest that genuine transformation resists conventional story structures.",
        "B": "Chekhov's story ends with Gurov and Anna happily leaving their marriages to start a new life together.",
        "C": "The story's main theme is the danger of seaside vacations to marital fidelity.",
        "D": "Gurov remains emotionally unchanged throughout the story, treating Anna as no different from his previous affairs."
    },
    "A",
    "The passage traces the subversion (trivial affair → genuine feeling), identifies the method (incremental accumulation, not dramatic revelation), and interprets the lack of closure as Chekhov's thematic point about transformation resisting narrative conventions. Choice A synthesizes all three elements.",
    {
        "B": "Distortion — The passage explicitly says 'the story's conclusion offers no resolution' and that Gurov and Anna 'remain trapped'; a happy departure contradicts the text.",
        "C": "Too Broad — The passage analyzes narrative technique and emotional transformation, not the dangers of vacations.",
        "D": "Distortion — The passage describes Gurov's change: he remembers Anna's expressions, compares her to his wife, and experiences genuine emotional transformation."
    }
))

# ── Q39 — History/Social Studies ──────────────
questions.append(q(
    "Simone de Beauvoir's The Second Sex (1949) argues that 'one is not born, but rather becomes, a woman.' By this, Beauvoir does not deny biological difference but contends that the social meaning attached to that difference — femininity as passivity, domesticity, and emotional dependency — is a cultural construction. Critically, Beauvoir argues that women participate in this construction: by accepting the role of the 'Other' to man's 'Subject,' women collaborate in their own subordination. Her argument thus places responsibility on both the structures that impose femininity and the individuals who internalize it.\n\n— Adapted from Simone de Beauvoir, The Second Sex, 1949.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Beauvoir argues that femininity is a cultural construction sustained by both imposed social structures and women's own internalization of subordinate roles, distributing responsibility between external forces and individual complicity.",
        "B": "Beauvoir denies all biological differences between men and women.",
        "C": "The Second Sex argues that women bear no responsibility for their social position because all oppression is externally imposed.",
        "D": "Beauvoir's primary concern is with workplace discrimination in mid-twentieth-century France."
    },
    "A",
    "The passage presents Beauvoir's distinction (biology vs. cultural construction) and then her critical argument about women's complicity ('women participate in this construction'). The central idea requires holding both external structures AND individual internalization. Choice A synthesizes both.",
    {
        "B": "Distortion — The passage explicitly says Beauvoir 'does not deny biological difference'; she distinguishes biology from the social meaning attached to it.",
        "C": "Distortion — The passage's key insight is that women 'collaborate in their own subordination,' directly contradicting 'no responsibility.'",
        "D": "Outside Knowledge — The passage discusses the philosophical concept of femininity as cultural construction, not specific workplace discrimination in France."
    }
))

# ── Q40 — Science ─────────────────────────────
questions.append(q(
    "The discovery of extremophilic archaea thriving in deep-sea hydrothermal vents at temperatures exceeding 120°C challenged the prevailing assumption that life requires moderate conditions. Subsequent research has expanded the catalogue of extreme environments supporting life — highly acidic mine drainage, sub-glacial lakes, deep crustal rock — each discovery extending the known boundaries of habitability. Astrobiologists argue that this expanding 'envelope of life' has direct implications for the search for extraterrestrial organisms: if Earth's biosphere extends into environments once considered sterile, then the number of potentially habitable sites in the solar system — Europa's subsurface ocean, Enceladus's hydrothermal plumes — must be revised upward.\n\n— Adapted from C. McKay, \"Requirements and limits for life in the context of exoplanets,\" PNAS, 2014.",
    "Which choice best states the main idea of the text?",
    {
        "A": "The progressive discovery of life in Earth's extreme environments expands the definition of habitability, strengthening the case that extraterrestrial sites once considered sterile may support organisms.",
        "B": "All deep-sea hydrothermal vents contain identical species of extremophilic archaea.",
        "C": "Europa has already been confirmed to harbor microbial life beneath its ice shell.",
        "D": "Extremophilic organisms can survive only at temperatures above 120°C and in no other extreme conditions."
    },
    "A",
    "The passage connects a sequence: extremophile discoveries → expanded habitability envelope → revised astrobiology expectations for places like Europa and Enceladus. The central idea is the logical chain from Earth's extremophiles to extraterrestrial implications. Choice A synthesizes this chain.",
    {
        "B": "Detail as Main Idea — Hydrothermal vent archaea are mentioned as the first discovery in a series, not as a claim about identical species across all vents.",
        "C": "Outside Knowledge — The passage mentions Europa as 'potentially habitable,' not as confirmed to harbor life.",
        "D": "Distortion — The passage lists multiple extreme environments (acidic drainage, sub-glacial lakes, deep rock) beyond high-temperature vents, contradicting 'only at temperatures above 120°C.'"
    }
))

# ── Q41 — Literature ──────────────────────────
questions.append(q(
    "In Mark Twain's Adventures of Huckleberry Finn (1884), Huck's famous decision not to turn Jim in to the authorities — declaring 'All right, then, I'll go to hell' — has often been celebrated as a triumph of natural conscience over social indoctrination. Yet Twain's narration complicates this reading: Huck never intellectually rejects the institution of slavery; he continues to believe that helping Jim escape is sinful. His decision is affective rather than rational — an emotional bond overriding a moral framework he cannot articulate reasons to doubt. Twain's irony works because the reader recognizes what Huck cannot: that the 'sin' he chooses is, by any humane standard, the only ethical action.\n\n— Adapted from Mark Twain, Adventures of Huckleberry Finn, 1884.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Twain's irony in Huck's decision lies in the gap between Huck's emotional refusal to betray Jim and his continued intellectual acceptance of slavery's moral framework — a gap the reader, but not Huck, can recognize as validating his choice.",
        "B": "Huck's decision proves that he has fully rejected the institution of slavery on rational and moral grounds.",
        "C": "Twain wrote Huckleberry Finn primarily as an adventure story with no deeper social commentary.",
        "D": "Huck's declaration 'I'll go to hell' reflects his sincere religious fear rather than any concern for Jim."
    },
    "A",
    "The passage identifies the gap between Huck's emotional response and his unchanged intellectual framework, then explains that Twain's irony depends on the reader recognizing what Huck cannot. Choice A synthesizes all three elements: emotion, intellectual limitation, and readerly irony.",
    {
        "B": "Distortion — The passage explicitly says Huck 'never intellectually rejects the institution of slavery' and 'continues to believe that helping Jim escape is sinful.'",
        "C": "Too Broad — The passage discusses a specific moral and ironic dimension of the novel, demonstrating significant social commentary.",
        "D": "Detail as Main Idea — Huck's religious fear is one component, but the passage argues that the significance lies in the gap between his feeling and his belief, not in the religious fear alone."
    }
))

# ── Q42 — History/Social Studies ──────────────
questions.append(q(
    "In The Wretched of the Earth (1961), Frantz Fanon argues that colonialism is not merely an economic or political system but a comprehensive structure that reshapes the psychology of both colonizer and colonized. Fanon contends that the colonial subject internalizes the colonizer's devaluation, producing what he calls a 'zone of non-being' in which the colonized person's self-image is constituted by the oppressor's gaze. Decolonization, for Fanon, therefore requires not just political independence but a psychological reconstruction — a process that is inherently violent because it must dismantle an identity imposed through violence.\n\n— Adapted from Frantz Fanon, The Wretched of the Earth, 1961.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Fanon argues that colonialism reshapes the psychology of the colonized, making decolonization a process of psychological as well as political liberation that mirrors the violence through which colonial identity was imposed.",
        "B": "Fanon believes that colonialism affects only the economic conditions of colonized peoples.",
        "C": "The Wretched of the Earth is primarily a manual for military strategy in anticolonial wars.",
        "D": "Fanon argues that the colonized willingly adopt the colonizer's values through free and informed choice."
    },
    "A",
    "The passage presents Fanon's argument in layers: colonialism is psychological (not merely economic), it creates a 'zone of non-being,' and decolonization must therefore be psychological reconstruction that is 'inherently violent.' Choice A synthesizes these interconnected claims.",
    {
        "B": "Distortion — The passage's opening sentence explicitly says colonialism is 'not merely an economic or political system' but reshapes psychology.",
        "C": "Too Broad — The passage discusses Fanon's theoretical framework about psychology and identity, not military strategy.",
        "D": "Distortion — Fanon describes internalization as a process of imposed devaluation ('zone of non-being'), not 'free and informed choice.'"
    }
))

# ── Q43 — Science ─────────────────────────────
questions.append(q(
    "Satellite imagery reveals that the Greenland ice sheet is losing mass at an accelerating rate, primarily through increased surface melting and the calving of marine-terminating glaciers. However, the spatial pattern of loss is highly uneven: outlet glaciers on the island's southeast coast have retreated dramatically, while those in the northwest have responded more slowly. Researchers attribute this asymmetry to differences in fjord geometry and ocean-water temperature: narrow fjords with warm Atlantic water intrusion promote rapid undercutting of glacier fronts, while wide, shallow fjords with cold polar water provide relative stability. The finding complicates projections of sea-level rise, which have often treated the ice sheet as a single unit.\n\n— Adapted from E. Rignot et al., \"Changes in the velocity structure of the Greenland Ice Sheet,\" Science, 2006.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Greenland ice loss is spatially uneven due to differences in fjord geometry and ocean temperature, complicating sea-level projections that treat the ice sheet as a uniform entity.",
        "B": "The Greenland ice sheet is gaining mass overall despite localized glacier retreat.",
        "C": "All marine-terminating glaciers in Greenland are retreating at exactly the same rate.",
        "D": "Fjord geometry has no measurable effect on glacier behavior in Greenland."
    },
    "A",
    "The passage identifies spatial unevenness, explains it (fjord geometry + ocean temperature), and draws the implication (projections must account for heterogeneity). Choice A synthesizes cause, pattern, and consequence.",
    {
        "B": "Distortion — The passage states the ice sheet is 'losing mass at an accelerating rate,' directly contradicting 'gaining mass.'",
        "C": "Distortion — The passage's central point is that retreat rates differ dramatically between southeast and northwest glaciers.",
        "D": "Distortion — The passage identifies fjord geometry as a key explanatory variable, contradicting 'no measurable effect.'"
    }
))

# ── Q44 — Literature ──────────────────────────
questions.append(q(
    "In George Eliot's Middlemarch (1871), Dorothea Brooke's marriage to the elderly scholar Casaubon is initially framed as an intellectual quest: she hopes to contribute to his 'Key to All Mythologies.' Eliot gradually reveals that Casaubon's project is not only unfinishable but intellectually stagnant — his research method is obsolete, and he refuses to engage with contemporary German scholarship that has superseded his approach. Dorothea's disillusionment, therefore, is not merely romantic but epistemological: she discovers that the knowledge she sought to serve is hollow. Eliot uses this discovery to explore how idealism, when attached to an unworthy object, can both ennoble and imprison the idealist.\n\n— Adapted from George Eliot, Middlemarch, 1871.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Eliot portrays Dorothea's disillusionment with Casaubon as epistemological rather than purely romantic, using the marriage to explore how idealism attached to an unworthy intellectual object can simultaneously ennoble and imprison the idealist.",
        "B": "Middlemarch is primarily a critique of the German scholarly tradition in the nineteenth century.",
        "C": "Dorothea's marriage to Casaubon is entirely happy because she successfully contributes to his research project.",
        "D": "Eliot argues that all scholarly projects are inherently futile and not worth pursuing."
    },
    "A",
    "The passage reframes Dorothea's disappointment: it is epistemological (the knowledge is hollow) rather than merely romantic. The central idea is the paradox of idealism — ennobling AND imprisoning. Choice A synthesizes both the reframing and the paradox.",
    {
        "B": "Detail as Main Idea — German scholarship is mentioned as context for Casaubon's obsolescence, not as the novel's primary critique.",
        "C": "Distortion — The passage describes Dorothea's 'disillusionment' and calls Casaubon's project 'unfinishable' and 'intellectually stagnant,' directly contradicting a happy outcome.",
        "D": "Too Broad — The passage critiques one specific scholar's project as hollow; it does not generalize to 'all scholarly projects.'"
    }
))

# ── Q45 — History/Social Studies ──────────────
questions.append(q(
    "Antonio Gramsci's concept of 'cultural hegemony,' developed in his Prison Notebooks (1929–1935), argues that the ruling class maintains power not primarily through coercion but through the dissemination of ideas that make existing social arrangements appear natural and inevitable. Education, media, and religious institutions — what Gramsci calls 'civil society' — function as vehicles for this ideological consensus. Crucially, Gramsci argues that hegemony is never total: subordinate groups retain the capacity for 'counter-hegemonic' thought, and intellectuals who articulate alternative worldviews can catalyze shifts in popular consciousness that precede political change.\n\n— Adapted from Antonio Gramsci, Selections from the Prison Notebooks, 1929–1935.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Gramsci argues that ruling-class power operates primarily through cultural consensus rather than coercion, but this hegemony is never total, leaving space for counter-hegemonic thought and potential social transformation.",
        "B": "Gramsci believed that political revolution can occur only through military force, not through cultural or intellectual activity.",
        "C": "Cultural hegemony means that all members of society share identical beliefs and values without exception.",
        "D": "Gramsci's Prison Notebooks are primarily concerned with prison reform in early twentieth-century Italy."
    },
    "A",
    "The passage presents hegemony (cultural consensus, not coercion) and then qualifies it (never total, counter-hegemonic capacity exists). The central idea requires both elements: dominance through culture AND the possibility of resistance. Choice A synthesizes this.",
    {
        "B": "Distortion — Gramsci's argument is that power operates through culture, not military force; counter-hegemonic intellectuals catalyze change through ideas, contradicting 'only through military force.'",
        "C": "Distortion — The passage explicitly states hegemony is 'never total' and subordinate groups retain capacity for counter-hegemonic thought.",
        "D": "Outside Knowledge — The Prison Notebooks were written in prison, but their content is political theory about hegemony, not prison reform."
    }
))

# ── Q46 — Science ─────────────────────────────
questions.append(q(
    "The leading theory of the Moon's formation — the giant-impact hypothesis — proposes that a Mars-sized body, Theia, collided with the proto-Earth approximately 4.5 billion years ago, producing a debris disk from which the Moon accreted. The hypothesis elegantly explains the Moon's angular momentum and iron-poor composition. However, high-precision isotopic analyses of lunar and terrestrial rocks reveal nearly identical oxygen, titanium, and tungsten isotope ratios, a finding difficult to reconcile with the standard model, which predicts that the impactor's distinct isotopic signature should be detectable in lunar material. This 'isotopic crisis' has prompted revised impact models — from high-energy synestias to hit-and-run scenarios — that attempt to homogenize the two bodies' material more thoroughly.\n\n— Adapted from R. Canup, \"Forming a Moon with an Earth-like composition via a giant impact,\" Science, 2012.",
    "Which choice best states the main idea of the text?",
    {
        "A": "The giant-impact hypothesis successfully explains the Moon's formation but faces an 'isotopic crisis' because lunar and terrestrial rocks share unexpectedly similar compositions, prompting revised impact models.",
        "B": "The giant-impact hypothesis has been definitively disproven by isotopic analyses.",
        "C": "The Moon was formed from material captured from an asteroid belt between Earth and Mars.",
        "D": "Oxygen isotope ratios are irrelevant to understanding planetary formation processes."
    },
    "A",
    "The passage presents the hypothesis (successful in some respects), the anomaly (isotopic similarity), and the response (revised models). The central idea holds all three in tension: the hypothesis is strong but faces a specific challenge that drives further refinement. Choice A captures this.",
    {
        "B": "Distortion — The passage says the hypothesis 'elegantly explains' angular momentum and composition; the isotopic crisis prompts revision, not definitive disproof.",
        "C": "Outside Knowledge — The passage discusses the giant-impact hypothesis specifically; asteroid-belt capture is an unrelated theory not mentioned in the text.",
        "D": "Distortion — The passage treats oxygen isotope ratios as central evidence creating the 'isotopic crisis,' showing they are highly relevant."
    }
))

# ── Q47 — Literature ──────────────────────────
questions.append(q(
    "In Franz Kafka's The Trial (1914–15, published 1925), Josef K. is arrested but never informed of his crime. Throughout the novel, K. encounters a legal system characterized by opaque procedures, inaccessible judges, and courtrooms located in obscure attic apartments. Critics often read the novel as an allegory of modern bureaucratic oppression, but Kafka's narrative technique suggests a more unsettling possibility: K. himself may be constructing the system's impenetrability through his own anxious interpretations. Every ambiguous gesture — a washerwoman's glance, a painter's conversation — is retrospectively assigned legal significance by K., blurring the line between external persecution and self-generated paranoia.\n\n— Adapted from Franz Kafka, The Trial, 1925.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Kafka's narrative technique in The Trial blurs the boundary between external bureaucratic oppression and K.'s own anxious interpretation, suggesting that the legal system's impenetrability may be partly a product of his paranoia.",
        "B": "The Trial is a realistic depiction of the Austrian-Hungarian legal system in the early twentieth century.",
        "C": "Josef K. clearly understands his crime but refuses to admit it to the reader.",
        "D": "Kafka intended The Trial as a humorous satire with no serious philosophical content."
    },
    "A",
    "The passage presents the common allegorical reading (bureaucratic oppression) and then complicates it: K.'s own interpretive activity may generate the system's opacity. The central idea is the ambiguity between external and self-generated oppression. Choice A captures this blurring.",
    {
        "B": "Too Broad — The passage describes 'courtrooms in attic apartments' and opaque procedures, clearly not realistic legal depiction; the novel is analyzed as allegorical/psychological.",
        "C": "Distortion — The passage says K. is 'never informed of his crime'; claiming he 'clearly understands' contradicts the text's emphasis on ambiguity.",
        "D": "Outside Knowledge — The passage treats the novel's philosophical dimensions seriously; describing it as purely humorous imports a characterization not supported by the text."
    }
))

# ── Q48 — History/Social Studies ──────────────
questions.append(q(
    "In Federalist No. 10, James Madison identifies 'faction' — a group of citizens united by a common interest adverse to the rights of others — as the greatest threat to republican government. Rather than attempting to eliminate faction by controlling its causes, which would require destroying liberty itself, Madison proposes controlling its effects through a large republic. In a vast polity with numerous competing factions, no single group can easily form a majority capable of oppressing others. Madison's solution is architectural rather than moral: it relies on structural design, not civic virtue, to prevent tyranny.\n\n— Adapted from James Madison, Federalist No. 10, 1787.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Madison proposes managing the danger of faction not by suppressing it but by designing a large republic in which competing interests structurally prevent any single faction from achieving tyrannical majority power.",
        "B": "Madison argues that factions should be eliminated entirely through strict government censorship.",
        "C": "Federalist No. 10 advocates for a small, homogeneous republic as the best defense against faction.",
        "D": "Madison's primary solution to faction is to cultivate civic virtue among all citizens."
    },
    "A",
    "The passage identifies the problem (faction), rejects one solution (eliminating causes = destroying liberty), and presents Madison's preferred solution (large republic with competing factions, structural rather than moral). Choice A synthesizes the problem, the rejected alternative, and the structural solution.",
    {
        "B": "Distortion — Madison explicitly rejects controlling faction's causes because it would 'require destroying liberty itself'; censorship would be precisely such a cause-controlling measure.",
        "C": "Distortion — Madison argues for a LARGE republic with NUMEROUS competing factions, the opposite of 'small, homogeneous.'",
        "D": "Distortion — The passage explicitly says Madison's solution is 'architectural rather than moral' and 'relies on structural design, not civic virtue.'"
    }
))

# ── Q49 — Science ─────────────────────────────
questions.append(q(
    "Neuroimaging studies of bilingual individuals reveal that both languages remain co-activated even when only one is being used, requiring continuous inhibitory control to suppress interference from the non-target language. This constant cognitive exercise has been hypothesized to strengthen domain-general executive functions — attention, task-switching, and conflict resolution — producing a 'bilingual advantage.' However, large-scale replication studies have yielded inconsistent results: while some find small advantages on specific executive-function tasks, others find no measurable difference between bilingual and monolingual participants. The discrepancy may reflect variations in bilingual experience (age of acquisition, proficiency, frequency of language switching) that are difficult to control experimentally.\n\n— Adapted from E. Bialystok, \"Reshaping the mind: the benefits of bilingualism,\" Canadian Journal of Experimental Psychology, 2011.",
    "Which choice best states the main idea of the text?",
    {
        "A": "The hypothesized 'bilingual advantage' in executive function remains contested because large-scale replication studies yield inconsistent results, possibly due to uncontrolled variations in bilingual experience.",
        "B": "Bilingualism has been definitively proven to improve all cognitive abilities in every individual.",
        "C": "Monolingual individuals consistently outperform bilingual individuals on all executive-function tasks.",
        "D": "The only benefit of bilingualism is the ability to speak two languages."
    },
    "A",
    "The passage presents the hypothesis (bilingual advantage from inhibitory control), the complication (inconsistent replication), and a possible explanation (variations in bilingual experience). The central idea is the contested status of the hypothesis. Choice A synthesizes all three elements.",
    {
        "B": "Too Broad — The passage describes 'inconsistent results' and notes that 'others find no measurable difference,' contradicting 'definitively proven.'",
        "C": "Distortion — The passage says SOME studies find small bilingual advantages; it never claims monolinguals outperform bilinguals consistently.",
        "D": "Outside Knowledge — The passage discusses hypothesized cognitive benefits beyond language ability; dismissing all other benefits contradicts the text's discussion."
    }
))

# ── Q50 — Literature ──────────────────────────
questions.append(q(
    "In James Joyce's Dubliners (1914), the final story, 'The Dead,' culminates in Gabriel Conroy's realization that his wife Gretta has been silently mourning a young man, Michael Furey, who died for love of her years before Gabriel entered her life. Joyce renders Gabriel's response not as jealousy but as an epiphanic dissolution of self-importance: Gabriel perceives that his own carefully constructed identity — urbane, literary, cosmopolitan — is insubstantial compared to the intensity of Furey's devotion. The snow falling 'upon all the living and the dead' in the story's closing image universalizes Gabriel's private humiliation, suggesting that every self-construct dissolves before the encompassing fact of mortality.\n\n— Adapted from James Joyce, 'The Dead,' in Dubliners, 1914.",
    "Which choice best states the main idea of the text?",
    {
        "A": "Joyce uses Gabriel's discovery of Gretta's past to dramatize an epiphanic dissolution of self-importance, universalized by the closing snow image into a meditation on the fragility of all self-constructs before mortality.",
        "B": "Gabriel is consumed by jealous rage upon learning about Michael Furey and resolves to confront Gretta about her past.",
        "C": "The snow at the end of 'The Dead' is simply a weather detail with no symbolic significance.",
        "D": "Joyce's Dubliners is primarily a travel guide to early twentieth-century Dublin."
    },
    "A",
    "The passage identifies Gabriel's response (not jealousy but dissolution of self-importance), connects it to the snow image (universalization), and draws the thematic conclusion (all self-constructs dissolve before mortality). Choice A synthesizes all three analytical layers.",
    {
        "B": "Distortion — The passage explicitly says Joyce renders Gabriel's response 'not as jealousy'; jealous rage contradicts the text's characterization.",
        "C": "Detail as Main Idea misapplied — The passage says the snow 'universalizes' Gabriel's experience, giving it profound symbolic weight; calling it 'simply a weather detail' contradicts the analysis.",
        "D": "Too Broad — Dubliners contains stories about Dublin, but the passage analyzes the literary and philosophical dimensions of 'The Dead,' not tourism."
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

    # Collect existing IDs
    existing_ids = {item["id"] for item in bank}

    # Add new questions, skip duplicates
    added = 0
    skipped = 0
    for item in questions:
        if item["id"] in existing_ids:
            skipped += 1
            continue
        bank.append(item)
        existing_ids.add(item["id"])
        added += 1

    # Save
    with open(BANK, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)

    after = len(bank)

    # Summary
    print("=" * 60)
    print("  ANTIGRAVITY 1600 — Central Ideas & Details Injection")
    print("=" * 60)
    print(f"  Questions defined:     {len(questions)}")
    print(f"  Bank before:           {before}")
    print(f"  Added:                 {added}")
    print(f"  Skipped (duplicate):   {skipped}")
    print(f"  Bank after:            {after}")
    print()

    # Answer distribution
    ans_dist = Counter(item["correctAnswer"] for item in questions)
    print("  Answer distribution:")
    for letter in "ABCD":
        print(f"    {letter}: {ans_dist.get(letter, 0)}")

    # Source categories
    lit = sum(1 for item in questions if any(
        kw in item["prompt"].lower() for kw in ["wharton", "conrad", "brontë", "chopin", "dostoevsky", "woolf",
                                                  "james", "hardy", "tolstoy", "melville", "dickinson", "chekhov",
                                                  "kafka", "joyce", "twain", "eliot"]
    ))
    hist = sum(1 for item in questions if any(
        kw in item["prompt"].lower() for kw in ["madison", "addams", "tocqueville", "douglass", "king",
                                                  "gouges", "wollstonecraft", "du bois", "mill", "turner",
                                                  "arendt", "beauvoir", "fanon", "gramsci"]
    ))
    sci = len(questions) - lit - hist
    print()
    print("  Source categories:")
    print(f"    Literature:           {lit}")
    print(f"    History/Social:       {hist}")
    print(f"    Science:              {sci}")
    print()
    print(f"  Bank saved to: {BANK}")
    print("=" * 60)


if __name__ == "__main__":
    main()
