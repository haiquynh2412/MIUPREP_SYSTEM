#!/usr/bin/env python3
"""
hard_rw_info2.py — Generate 50 Hard R&W questions
Skill: Inferences
Domain: Information and Ideas
Section: Reading and Writing

All passages are dense academic prose (80-150 words).
Rotates: Literature (pre-1929), History/Social Studies, Science.
Trap taxonomy: Reasonable But Unsupported, Over-Inference,
               Misattributed Claim, Reversed Causation.

The correct inference requires combining information from multiple
sentences AND ruling out inferences that are plausible but go BEYOND
the text.
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
        "sourceSignalId": "antigravity-1600-rw-info2",
        "generationEngine": "antigravity-master-prompt-1600",
        "visibility": "private_family",
        "reviewStatus": "needs_review",
        "targetBand": "SAT-1600",
    }


def q(passage, question_stem, choices, correct, expl_correct, expl_distractors):
    """Build one Inferences MCQ."""
    prompt = passage + "\n\n" + question_stem
    meta = shared_meta()
    return {
        "id": make_id(),
        "section": "Reading and Writing",
        "domain": "Information and Ideas",
        "skill": "Inferences",
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
            "cognitiveMove": "Synthesizing a multi-step inference while maintaining strict textual boundaries",
            "trapTypes": ["Reasonable But Unsupported", "Over-Inference", "Misattributed Claim", "Reversed Causation"],
        },
        **meta,
    }


# ─────────────────────────────────────────────
# 50 QUESTIONS — rotating Literature / History / Science
# ─────────────────────────────────────────────

questions = []

# ── Q1 — Science ──────────────────────────────
questions.append(q(
    "Researchers investigating the decline of amphibian populations in montane tropical forests initially hypothesized that the chytrid fungus Batrachochytrium dendrobatidis (Bd) was solely responsible for mass die-offs observed since the 1980s. Subsequent climate analyses, however, revealed that the regions with the most severe declines had simultaneously experienced shifts in cloud-base altitude, reducing persistent cloud immersion and increasing daytime temperature fluctuations. Laboratory experiments confirmed that Bd's pathogenicity intensifies within the narrow thermal window created by these altered conditions, while amphibians' immune responses weaken at the same temperature range.\n\n— Adapted from A. Pounds et al., \"Widespread amphibian extinctions from epidemic disease driven by global warming,\" Nature, 2006.",
    "Which of the following inferences about amphibian declines is most strongly supported by the text?",
    {
        "A": "Climate shifts alone, independent of Bd infection, are sufficient to cause amphibian population crashes in montane forests.",
        "B": "The interaction between altered microclimates and Bd pathogenicity, rather than either factor in isolation, best explains the severity of montane amphibian declines.",
        "C": "Bd was introduced to montane forests as a direct result of climate change altering migration routes.",
        "D": "Amphibians in lowland tropical forests are equally vulnerable to the combined effects of climate change and Bd infection."
    },
    "B",
    "The passage presents two factors: (1) Bd pathogenicity increases in the altered thermal window, and (2) amphibian immune responses weaken at the same temperatures. Neither factor alone is identified as sufficient — the passage says the initial 'solely Bd' hypothesis was complicated by climate data. Combining these two pieces of information supports the inference that it is the interaction of both factors that explains the severity. Choice B captures this multi-sentence synthesis.",
    {
        "A": "Over-Inference — The passage says climate shifts altered conditions that enhanced Bd's effect; it never states that climate alone is sufficient to cause crashes without the fungus.",
        "C": "Reasonable But Unsupported — While plausible, the passage says nothing about how Bd arrived in montane forests or about altered migration routes introducing it.",
        "D": "Over-Inference — The passage discusses only montane tropical forests; extending the conclusion to lowland forests goes beyond the textual evidence."
    }
))

# ── Q2 — Literature ──────────────────────────
questions.append(q(
    "In Thomas Hardy's Tess of the d'Urbervilles (1891), the narrator describes Tess's return to Marlott after her experience at Trantridge as a journey through a landscape that mirrors her internal state: the lush summer fields she passed on her departure have given way to stubble and frost. Yet Hardy's narration is careful to note that the villagers greet Tess with the same casual familiarity as before; their world has not changed. Hardy thus establishes a dissonance between Tess's transformed inner life and the unaltered social surface she must re-enter, a dissonance that will govern the novel's tragic trajectory.\n\n— Adapted from Thomas Hardy, Tess of the d'Urbervilles, 1891.",
    "Based on the text, what can most reasonably be inferred about Hardy's use of landscape in this passage?",
    {
        "A": "Hardy uses the changed landscape to signal that the villagers of Marlott are aware of Tess's experiences at Trantridge.",
        "B": "The landscape functions primarily as a realistic depiction of seasonal agricultural change with no symbolic significance.",
        "C": "Hardy employs the landscape as an external correlate for Tess's psychological transformation, heightening the contrast with the unchanged social world she re-enters.",
        "D": "The shift from summer to winter in the landscape indicates that Tess spent several years away from Marlott."
    },
    "C",
    "Two textual clues must be combined: (1) the landscape 'mirrors her internal state' (lush → stubble/frost), and (2) the villagers 'greet Tess with the same casual familiarity.' The inference is that Hardy deliberately uses landscape as a psychological mirror while keeping the social world static, creating a dissonance. Choice C synthesizes both observations.",
    {
        "A": "Misattributed Claim — The passage explicitly states the villagers' world 'has not changed' and they greet her with 'the same casual familiarity,' contradicting awareness of her experiences.",
        "B": "Reasonable But Unsupported — The passage explicitly says the landscape 'mirrors her internal state,' ruling out a purely realistic, non-symbolic reading.",
        "D": "Over-Inference — The seasonal change from summer to frost is described as symbolic; the passage does not specify how long Tess was away, and Hardy uses the imagery for psychological, not chronological, purposes."
    }
))

# ── Q3 — History/Social Studies ──────────────
questions.append(q(
    "In her 1791 Declaration of the Rights of Woman and of the Female Citizen, Olympe de Gouges mirrors the structure of the 1789 Declaration of the Rights of Man article by article, substituting 'woman' for 'man' in each clause. This strategy does more than merely demand inclusion; by demonstrating that the original document's logic applies with equal force to women, de Gouges exposes the contradiction at the heart of the Revolution's universalist claims. If reason and natural rights are truly universal, she implies, then excluding women requires an arbitrary exception that undermines the document's own philosophical premises.\n\n— Adapted from Olympe de Gouges, Declaration of the Rights of Woman and of the Female Citizen, 1791.",
    "What can most reasonably be inferred from the text about de Gouges's rhetorical strategy?",
    {
        "A": "De Gouges believed the 1789 Declaration was fundamentally flawed and should be entirely replaced rather than amended.",
        "B": "De Gouges's mirroring technique forces readers to confront the inconsistency between the Revolution's universal principles and its exclusion of women, using the original document's logic as the instrument of critique.",
        "C": "De Gouges intended her Declaration to apply only to French women of the aristocratic class.",
        "D": "De Gouges's strategy was unsuccessful because the revolutionary government immediately adopted her proposed amendments."
    },
    "B",
    "The passage states that de Gouges 'mirrors the structure' of the 1789 Declaration and that this 'exposes the contradiction' in the Revolution's universalist claims. Combining these observations yields the inference that the mirroring itself is the critique: the original document's own logic is turned against the exclusion of women. Choice B captures this two-step inference.",
    {
        "A": "Over-Inference — The passage says de Gouges mirrors the original document, using its own logic; this implies she accepts its philosophical framework while exposing its inconsistent application, not that she wants it 'entirely replaced.'",
        "C": "Reasonable But Unsupported — The passage makes no reference to class distinctions within de Gouges's claims; this introduces a limitation not present in the text.",
        "D": "Reasonable But Unsupported — The passage discusses de Gouges's rhetorical strategy but says nothing about the government's response or the strategy's political outcome."
    }
))

# ── Q4 — Science ──────────────────────────────
questions.append(q(
    "Astronomers studying fast radio bursts (FRBs) — millisecond-duration pulses of radio waves from cosmological distances — initially categorized them as exclusively one-off events. The 2016 detection of FRB 121102 as a repeating source overturned this classification, suggesting at least two distinct populations. Analysis of the repeating bursts revealed a systematic downward drift in frequency within each pulse, a feature absent from the non-repeating sample at the time. More recently, however, some apparently non-repeating FRBs have exhibited the same downward drift, raising the possibility that all FRBs originate from a single mechanism and that the distinction between repeating and non-repeating sources may reflect observational sensitivity rather than intrinsic physical differences.\n\n— Adapted from CHIME/FRB Collaboration, \"A second source of repeating fast radio bursts,\" Nature, 2019.",
    "Based on the text, what can most reasonably be inferred about the classification of FRBs?",
    {
        "A": "All FRBs have now been confirmed to originate from a single physical mechanism.",
        "B": "The distinction between repeating and non-repeating FRBs may be an artifact of detection limitations rather than a genuine physical difference between the sources.",
        "C": "Non-repeating FRBs are caused by a completely different astrophysical process than repeating FRBs.",
        "D": "The downward frequency drift has been shown to be caused by the expansion of the universe."
    },
    "B",
    "The passage builds a three-step argument: (1) FRBs were first split into two categories, (2) a shared spectral feature (downward drift) was found in both, and (3) this 'raises the possibility' that the distinction 'may reflect observational sensitivity rather than intrinsic physical differences.' Combining all three steps yields the inference in Choice B — that the two-population model may be an artifact of detection limits.",
    {
        "A": "Over-Inference — The passage says the shared drift 'raises the possibility' of a single mechanism; it does not confirm this. Choice A converts a tentative possibility into a settled fact.",
        "C": "Reversed Causation — The passage's argument moves in the opposite direction: the shared spectral feature suggests the processes may NOT be 'completely different.'",
        "D": "Reasonable But Unsupported — The passage never mentions cosmic expansion as a cause of the downward drift; this introduces an astrophysical explanation not discussed in the text."
    }
))

# ── Q5 — Literature ──────────────────────────
questions.append(q(
    "In Virginia Woolf's Mrs Dalloway (1925), the character Septimus Warren Smith, a shell-shocked veteran, perceives London's ordinary sounds — a motorcar backfiring, an aeroplane skywriting — as portents of cosmic significance. His wife Rezia, by contrast, sees only the mundane reality. Woolf places these two perceptions in immediate juxtaposition without privileging either: the same stimulus is narrated twice, first through Septimus's visionary terror and then through Rezia's practical confusion. Critics have noted that this technique refuses to label Septimus's perceptions as simply delusional, instead granting them a poetic authority that competes with the everyday.\n\n— Adapted from Virginia Woolf, Mrs Dalloway, 1925.",
    "What can most reasonably be inferred from the text about Woolf's narrative technique regarding Septimus's perceptions?",
    {
        "A": "Woolf endorses Septimus's visionary perceptions as objectively more truthful than Rezia's practical view.",
        "B": "By narrating the same event through both Septimus's and Rezia's perspectives without privileging either, Woolf complicates any simple dismissal of Septimus's experience as mere delusion.",
        "C": "Woolf uses Rezia's perspective to demonstrate that Septimus's condition is entirely self-inflicted.",
        "D": "The dual narration technique was invented by Woolf specifically for Mrs Dalloway and had no precedent in earlier literature."
    },
    "B",
    "The passage states two key facts: (1) Woolf narrates the same stimulus through both perspectives 'without privileging either,' and (2) this 'refuses to label Septimus's perceptions as simply delusional.' Combining these yields the inference that Woolf's technique deliberately complicates a reductive clinical reading of Septimus. Choice B synthesizes both observations.",
    {
        "A": "Over-Inference — The passage says Woolf does not privilege either perspective; endorsing Septimus's view as 'objectively more truthful' would privilege it, contradicting the text's emphasis on balance.",
        "C": "Misattributed Claim — The passage uses Rezia's perspective to show 'practical confusion,' not to assign blame or suggest the condition is 'self-inflicted.' That judgment is nowhere in the text.",
        "D": "Reasonable But Unsupported — The passage discusses the technique but makes no historical claim about whether it was invented for this novel or had precedents."
    }
))

# ── Q6 — History/Social Studies ──────────────
questions.append(q(
    "In his 1963 'Letter from Birmingham Jail,' Martin Luther King Jr. distinguishes between just and unjust laws by appealing to natural law theory: a just law is one that 'squares with the moral law or the law of God,' while an unjust law 'is a code that is out of harmony with the moral law.' Crucially, King adds a sociological criterion — an unjust law is also one 'inflicted on a minority that, as a result of being denied the right to vote, had no part in enacting or devising.' By combining philosophical and democratic standards, King builds a case for civil disobedience that draws authority from both religious tradition and democratic theory.\n\n— Adapted from Martin Luther King Jr., 'Letter from Birmingham Jail,' 1963.",
    "Based on the text, what can most reasonably be inferred about King's argument for civil disobedience?",
    {
        "A": "King's argument derives its persuasive force entirely from religious authority, with no reference to democratic principles.",
        "B": "King strengthens his justification for civil disobedience by grounding it in two independent frameworks — natural law and democratic participation — so that the argument does not depend on any single philosophical tradition.",
        "C": "King argues that all laws enacted without universal voter participation are automatically unjust and should be disobeyed.",
        "D": "King's sociological criterion replaces his natural law criterion, indicating that he abandoned religious reasoning."
    },
    "B",
    "The passage identifies two distinct criteria King uses: (1) natural/moral law and (2) a sociological criterion about democratic participation. It then states King 'combines' them. The reasonable inference is that the dual foundation makes the argument stronger because it draws from two independent traditions rather than relying on one alone. Choice B synthesizes these observations.",
    {
        "A": "Misattributed Claim — The passage explicitly states King combines religious/philosophical AND democratic standards; claiming the argument derives 'entirely from religious authority' ignores the sociological criterion.",
        "C": "Over-Inference — King specifies that an unjust law is inflicted on a minority denied the vote; this is narrower than claiming ALL laws without universal participation are unjust.",
        "D": "Reversed Causation — The passage says King 'adds' the sociological criterion to the natural law standard; 'adds' implies supplementation, not replacement."
    }
))

# ── Q7 — Science ──────────────────────────────
questions.append(q(
    "The octopus central nervous system presents a puzzle for comparative neuroscience: approximately two-thirds of an octopus's neurons reside not in the brain but in the arms, which can execute complex motor programs — such as opening a jar — even when severed from the central brain. Recent electrophysiological recordings show that arm neural networks generate their own rhythmic motor patterns and process local sensory information without central brain input. However, when the brain is connected, it modulates arm behavior through a small number of high-level command signals rather than controlling individual movements directly.\n\n— Adapted from G. Sumbre et al., \"Control of octopus arm extension by a peripheral motor program,\" Science, 2001.",
    "Based on the text, what can most reasonably be inferred about the relationship between the octopus brain and its arm neural networks?",
    {
        "A": "The octopus brain is vestigial and plays no meaningful role in coordinating behavior.",
        "B": "The arm neural networks function as semi-autonomous processors that can operate independently but are coordinated by high-level brain signals when the brain is connected.",
        "C": "Each octopus arm contains a fully independent brain that is equivalent in processing power to the central brain.",
        "D": "The octopus brain directly controls every individual muscle contraction in each arm."
    },
    "B",
    "The passage provides two key pieces of information: (1) arms can execute complex programs even when severed (autonomy), and (2) when connected, the brain sends 'high-level command signals rather than controlling individual movements directly' (modulation). The inference combining both is that the arms are semi-autonomous, with the brain providing oversight rather than direct control. Choice B synthesizes both observations.",
    {
        "A": "Over-Inference — The passage says the brain 'modulates arm behavior' through command signals, which means it plays a meaningful coordinative role — not vestigial.",
        "C": "Over-Inference — The passage says arms can execute motor programs independently, but never claims the arm networks are 'equivalent in processing power' to the central brain.",
        "D": "Reversed Causation — The passage explicitly states the brain modulates behavior through 'high-level command signals rather than controlling individual movements directly,' directly contradicting direct control of every contraction."
    }
))

# ── Q8 — Literature ──────────────────────────
questions.append(q(
    "In Herman Melville's 'Bartleby, the Scrivener' (1853), the unnamed narrator — a prosperous lawyer — repeatedly describes himself as an 'eminently safe man' who 'from his youth upwards, has been filled with a profound conviction that the easiest way of life is the best.' When Bartleby begins his passive refusals, the narrator's initial responses are not anger but bewilderment and self-examination: he wonders whether Bartleby's behavior exposes something inadequate in his own comfortable worldview. Melville thus structures the story so that Bartleby's inaction becomes a mirror that reflects the narrator's previously unexamined assumptions about industry, compliance, and moral obligation.\n\n— Adapted from Herman Melville, 'Bartleby, the Scrivener,' 1853.",
    "Based on the text, what can most reasonably be inferred about the function of Bartleby's refusals in the narrative?",
    {
        "A": "Bartleby's refusals serve primarily as a realistic depiction of employee insubordination in a nineteenth-century law office.",
        "B": "Bartleby's passive refusals function as a narrative device that forces the narrator — and by extension the reader — to scrutinize assumptions about work, compliance, and moral comfort that would otherwise remain unexamined.",
        "C": "The narrator's bewilderment proves that he is a morally superior character who genuinely cares about Bartleby's welfare above all else.",
        "D": "Melville uses Bartleby to argue that all forms of employment in capitalist society are inherently exploitative."
    },
    "B",
    "The passage makes two connected claims: (1) the narrator's response to Bartleby is 'self-examination' rather than anger, and (2) Melville structures Bartleby's inaction as 'a mirror that reflects the narrator's previously unexamined assumptions.' Combining these yields the inference that Bartleby's refusals serve as a catalyst for critical reflection on the narrator's worldview. Choice B captures this synthesis.",
    {
        "A": "Reasonable But Unsupported — The passage frames Bartleby's refusals as philosophically and narratively significant (a 'mirror'); a purely realistic workplace reading ignores this explicit interpretive framing.",
        "C": "Misattributed Claim — The narrator's bewilderment leads to self-examination, not to proof of moral superiority. The passage says he questions his own worldview, not that he is ethically elevated.",
        "D": "Over-Inference — The passage discusses the narrator's specific assumptions about 'industry, compliance, and moral obligation,' not a sweeping critique of all capitalist employment."
    }
))

# ── Q9 — History/Social Studies ──────────────
questions.append(q(
    "In The Second Sex (1949), Simone de Beauvoir argues that woman is constructed as 'the Other' — the negative term against which man defines himself as the subject. Unlike other instances of othering, however, Beauvoir notes that women have not historically formed a collective identity in opposition to male dominance, because they live dispersed among men, bonded to their oppressors by 'residence, housework, economic condition, and social standing.' This structural integration, she contends, makes women's situation unlike that of racial or colonial minorities who can consolidate group solidarity through shared territory or institutions.\n\n— Adapted from Simone de Beauvoir, The Second Sex, 1949.",
    "Based on the text, what can most reasonably be inferred about Beauvoir's analysis of women's collective action?",
    {
        "A": "Beauvoir believes women are inherently incapable of forming political movements due to biological differences.",
        "B": "Beauvoir argues that women's dispersal among men and structural integration into male-dominated households creates distinctive barriers to collective solidarity that differ from those faced by other marginalized groups.",
        "C": "Beauvoir claims that racial minorities face no significant obstacles to forming collective identity.",
        "D": "Beauvoir suggests that women should physically separate from men in order to achieve political liberation."
    },
    "B",
    "The passage identifies a specific obstacle: women live 'dispersed among men,' bonded by residence and economic condition, which prevents the consolidation of group solidarity. It then explicitly contrasts this with racial or colonial minorities who share territory. Combining both points yields the inference that women's structural integration creates unique barriers distinct from other forms of marginalization. Choice B captures this synthesis.",
    {
        "A": "Over-Inference — Beauvoir attributes the obstacle to structural conditions (dispersal, economic bonding), not to biological incapability. The argument is sociological, not essentialist.",
        "C": "Misattributed Claim — Beauvoir says racial minorities 'can consolidate group solidarity,' not that they face 'no significant obstacles.' She contrasts degrees of difficulty, not presence versus absence of obstacles.",
        "D": "Reasonable But Unsupported — The passage diagnoses the problem of dispersal but never prescribes physical separation as the solution."
    }
))

# ── Q10 — Science ─────────────────────────────
questions.append(q(
    "Researchers developing mRNA vaccines for SARS-CoV-2 faced a critical design challenge: unmodified mRNA triggers innate immune sensors (Toll-like receptors) that degrade the molecule before it can be translated into the target protein. The solution involved replacing uridine with N1-methylpseudouridine, a naturally occurring modified nucleoside that evades detection by TLRs. This substitution not only increased mRNA stability but also, unexpectedly, enhanced translational efficiency — the modified mRNA produced more spike protein per molecule than unmodified versions in cell-culture assays. The dual benefit of immune evasion and improved protein yield proved essential for achieving protective antibody levels with clinically feasible doses.\n\n— Adapted from K. Karikó et al., \"Incorporation of pseudouridine into mRNA yields superior nonimmunogenic vector,\" Molecular Therapy, 2008.",
    "Based on the text, what can most reasonably be inferred about the role of N1-methylpseudouridine in mRNA vaccine development?",
    {
        "A": "N1-methylpseudouridine was chosen primarily because it was less expensive to manufacture than standard uridine.",
        "B": "The substitution of N1-methylpseudouridine addressed a fundamental obstacle — innate immune degradation — while also providing an unanticipated benefit in translational output, both of which were necessary for clinical viability.",
        "C": "N1-methylpseudouridine completely eliminates all immune responses to the mRNA vaccine, including adaptive immunity.",
        "D": "Without the enhanced translational efficiency, mRNA vaccines would have been equally effective at lower doses."
    },
    "B",
    "The passage states: (1) unmodified mRNA is degraded by innate immune sensors — a critical obstacle, (2) the pseudouridine substitution evades TLRs (solves the obstacle), (3) it 'unexpectedly' enhanced translational efficiency (unanticipated bonus), and (4) the 'dual benefit' was 'essential' for clinical doses. Combining all four points yields the inference that both the intended and unexpected benefits were necessary. Choice B captures this multi-step synthesis.",
    {
        "A": "Reasonable But Unsupported — The passage discusses immunological and translational reasons for the substitution; manufacturing cost is never mentioned.",
        "C": "Over-Inference — The passage says the modification evades innate immune sensors (TLRs) specifically; the vaccine is designed to produce spike protein that triggers adaptive immunity, so eliminating all immune responses would defeat the purpose.",
        "D": "Reversed Causation — The passage says the dual benefit 'proved essential for achieving protective antibody levels with clinically feasible doses,' implying that without enhanced efficiency, feasible dosing would have been a problem, not that vaccines would have been 'equally effective.'"
    }
))

# ── Q11 — Literature ──────────────────────────
questions.append(q(
    "In Anton Chekhov's 'The Lady with the Dog' (1899), Gurov's initial attitude toward Anna is one of practiced cynicism: he mentally catalogs her as another in a series of interchangeable affairs. Chekhov's narration, however, subtly disrupts this taxonomy by devoting unusual attention to the details of Anna's distress — her nervous laughter, her self-recrimination after their first intimate encounter. When Gurov later finds himself unable to forget Anna despite returning to his Moscow routine, the story's free indirect discourse shifts: his internal language no longer deploys the cynical categories of the opening but instead gropes toward an emotional register he has never previously needed.\n\n— Adapted from Anton Chekhov, 'The Lady with the Dog,' 1899.",
    "Based on the text, what can most reasonably be inferred about the change in Gurov's character?",
    {
        "A": "Gurov's transformation is immediate, occurring the moment he first meets Anna at Yalta.",
        "B": "Gurov's internal shift from cynical categorization to genuine emotional engagement is signaled through a change in narrative language, suggesting that his encounter with Anna has disrupted his habitual modes of thinking.",
        "C": "Chekhov uses Gurov's transformation to argue that all cynical men are ultimately reformed by romantic love.",
        "D": "Gurov's Moscow routine remains entirely unchanged by his encounter with Anna."
    },
    "B",
    "The passage establishes two states: (1) Gurov initially deploys 'cynical categories' (practiced taxonomy), and (2) later his internal language 'no longer deploys' those categories but 'gropes toward an emotional register.' The shift in free indirect discourse signals the inner change. Choice B synthesizes the linguistic evidence with the psychological transformation.",
    {
        "A": "Misattributed Claim — The passage describes the transformation as gradual: Gurov finds himself 'unable to forget Anna' only after returning to Moscow, and the narrative language shifts 'later' — not immediately at the first meeting.",
        "C": "Over-Inference — The passage analyzes one specific character's development; generalizing to 'all cynical men' extends far beyond the text's scope.",
        "D": "Reversed Causation — The passage says Gurov's internal language undergoes a fundamental shift, directly contradicting the claim that his routine is 'entirely unchanged.'"
    }
))

# ── Q12 — History/Social Studies ──────────────
questions.append(q(
    "In A Vindication of the Rights of Woman (1792), Mary Wollstonecraft does not simply argue that women deserve the same education as men; she contends that the prevailing system of female education actively manufactures the very weaknesses that men then cite as evidence of women's natural inferiority. Women are trained in 'docility and a scrupulous attention to a puerile kind of propriety,' then faulted for lacking reason. Wollstonecraft's argument is thus circular in structure: the effects of unequal education are presented as justification for continuing it, creating a self-reinforcing cycle that masquerades as natural law.\n\n— Adapted from Mary Wollstonecraft, A Vindication of the Rights of Woman, 1792.",
    "Based on the text, what can most reasonably be inferred about Wollstonecraft's view of claims regarding women's 'natural inferiority'?",
    {
        "A": "Wollstonecraft accepts that women are naturally less rational than men but argues they deserve education regardless.",
        "B": "Wollstonecraft contends that claims of women's natural inferiority are the product of a self-reinforcing cycle in which unequal education creates the very deficiencies used to justify that inequality.",
        "C": "Wollstonecraft believes that the prevailing education system affects men and women equally.",
        "D": "Wollstonecraft's argument focuses exclusively on economic barriers to women's education, not on curriculum content."
    },
    "B",
    "The passage identifies a circular logic: (1) women are trained in docility, (2) this training produces the appearance of irrationality, (3) that appearance is cited as evidence of natural inferiority, (4) the alleged natural inferiority justifies continuing the training. The inference is that 'natural inferiority' is an artifact of the educational system, not a genuine natural fact. Choice B captures this chain of reasoning.",
    {
        "A": "Reversed Causation — The passage's central argument is that apparent irrationality is manufactured by education, not natural; Wollstonecraft challenges the very premise of natural inferiority.",
        "C": "Misattributed Claim — The passage explicitly describes a system that trains women differently ('docility and puerile propriety'), so the education is NOT equal.",
        "D": "Reasonable But Unsupported — The passage discusses curriculum content ('docility,' 'puerile propriety') as the core problem; economic barriers are never mentioned."
    }
))

# ── Q13 — Science ─────────────────────────────
questions.append(q(
    "Paleontologists have long debated whether the end-Cretaceous mass extinction was caused solely by the Chicxulub asteroid impact or whether Deccan Traps volcanism contributed significantly. High-precision geochronology of Deccan lava flows reveals that the most voluminous eruptions began approximately 250,000 years before the impact and continued for 500,000 years after it. Notably, the biotic record shows that marine ecosystems were already under stress before the impact — foraminifera diversity had begun declining — but that the catastrophic collapse of food webs and the disappearance of non-avian dinosaurs coincide precisely with the impact horizon, not with any volcanic pulse.\n\n— Adapted from C. Schoene et al., \"U-Pb constraints on pulsed eruption of the Deccan Traps,\" Science, 2019.",
    "Based on the text, what can most reasonably be inferred about the relative roles of volcanism and the asteroid impact in the mass extinction?",
    {
        "A": "Deccan volcanism had no measurable effect on late-Cretaceous ecosystems.",
        "B": "Volcanism may have weakened ecosystems before the impact, but the catastrophic extinction event itself aligns with the asteroid impact rather than with any specific volcanic pulse.",
        "C": "The asteroid impact occurred as a direct consequence of the Deccan Traps eruptions destabilizing Earth's orbit.",
        "D": "Foraminifera diversity declined because of the asteroid impact, not because of volcanic activity."
    },
    "B",
    "The passage provides two linked observations: (1) foraminifera diversity was already declining before the impact (pre-stress from volcanism), and (2) the 'catastrophic collapse' coincides 'precisely with the impact horizon, not with any volcanic pulse.' Combining these yields the inference that volcanism contributed to pre-existing stress while the impact triggered the mass extinction itself. Choice B synthesizes both observations.",
    {
        "A": "Over-Inference — The passage says marine ecosystems 'were already under stress before the impact' and foraminifera were declining, suggesting volcanism did have measurable effects, even if it didn't cause the mass extinction.",
        "C": "Reasonable But Unsupported — The passage discusses both events as concurrent geological processes; it never suggests any causal link between eruptions and the asteroid's arrival.",
        "D": "Reversed Causation — The passage says foraminifera diversity 'had begun declining' before the impact, meaning the decline preceded the asteroid and was associated with the pre-impact period, not caused by the impact."
    }
))

# ── Q14 — Literature ──────────────────────────
questions.append(q(
    "In Leo Tolstoy's Anna Karenina (1877), Levin's experience of mowing alongside the peasants is presented not as aristocratic slumming but as a moment of genuine self-dissolution: Tolstoy describes the scythe moving 'of itself,' Levin's thoughts emptying, and the work producing a 'joyful consciousness' that erases the boundary between effort and rest. Yet the narrator notes that this experience is temporary; by evening, Levin returns to his estate management concerns and his intellectual anxieties. Tolstoy thus presents physical labor as offering a mode of being that Levin's habitual intellectual consciousness cannot sustain, though it can briefly access.\n\n— Adapted from Leo Tolstoy, Anna Karenina, 1877.",
    "Based on the text, what can most reasonably be inferred about Tolstoy's depiction of Levin's mowing experience?",
    {
        "A": "Tolstoy portrays physical labor as permanently transforming Levin's character, eliminating his intellectual anxieties.",
        "B": "Tolstoy presents Levin's mowing as an experience of self-dissolution and absorbed consciousness that his normal intellectual mode of being can access only temporarily, not sustain.",
        "C": "Tolstoy uses the mowing scene to criticize the peasants for lacking intellectual sophistication.",
        "D": "Levin's return to estate management concerns proves that the mowing experience had no psychological significance."
    },
    "B",
    "The passage establishes: (1) mowing produces 'self-dissolution' and 'joyful consciousness' in Levin, and (2) this is 'temporary' — by evening he reverts to intellectual anxieties. The inference is that the experience is genuine but unsustainable for someone in Levin's habitual intellectual mode. Choice B synthesizes the value of the experience with its impermanence.",
    {
        "A": "Over-Inference — The passage explicitly states the experience is 'temporary' and that Levin returns to his anxieties by evening, directly contradicting 'permanently transforming.'",
        "C": "Misattributed Claim — The passage presents the peasants' mode of labor positively (Levin achieves something valuable alongside them); criticizing the peasants is the opposite of the text's implication.",
        "D": "Over-Inference — The passage says Levin's return to intellectual anxieties does not negate the mowing experience; Tolstoy presents it as offering 'a mode of being' that Levin's consciousness 'cannot sustain, though it can briefly access' — indicating significance, not meaninglessness."
    }
))

# ── Q15 — History/Social Studies ──────────────
questions.append(q(
    "In The Communist Manifesto (1848), Marx and Engels describe the bourgeoisie as a revolutionary class that 'cannot exist without constantly revolutionising the instruments of production.' This perpetual disruption, they argue, dissolves all 'fixed, fast-frozen relations' of feudal society, replacing stable hierarchies with ceaseless change. Yet Marx and Engels do not frame this entirely negatively: they credit the bourgeoisie with creating productive forces 'more massive and more colossal than have all preceding generations together.' The Manifesto's critique is thus directed not at capitalist productivity itself but at the social relations through which that productivity is organized — relations that, they argue, ultimately become barriers to the forces they unleashed.\n\n— Adapted from Karl Marx and Friedrich Engels, The Communist Manifesto, 1848.",
    "Based on the text, what can most reasonably be inferred about Marx and Engels's attitude toward bourgeois capitalism?",
    {
        "A": "Marx and Engels regard bourgeois capitalism as purely destructive, offering no historical benefits.",
        "B": "Marx and Engels acknowledge the bourgeoisie's unprecedented productive achievements while arguing that the social relations organizing that productivity will eventually become obstacles to further progress.",
        "C": "Marx and Engels advocate a return to feudal social structures as preferable to bourgeois capitalism.",
        "D": "The Manifesto's primary concern is environmental destruction caused by industrial production."
    },
    "B",
    "The passage presents two facets: (1) Marx and Engels credit the bourgeoisie with creating unprecedented productive forces, and (2) they argue that the social relations of capitalism 'ultimately become barriers' to those forces. The inference is a dialectical assessment — admiration for productivity, critique of social organization. Choice B captures both dimensions.",
    {
        "A": "Misattributed Claim — The passage explicitly states that Marx and Engels 'credit the bourgeoisie' with massive productive achievements; calling capitalism 'purely destructive' contradicts this.",
        "C": "Reversed Causation — The passage says the bourgeoisie dissolved feudal 'fixed, fast-frozen relations,' and Marx and Engels credit this disruption positively; advocating a return to feudalism contradicts the text's forward-looking analysis.",
        "D": "Reasonable But Unsupported — The passage discusses productive forces and social relations; environmental destruction is never mentioned."
    }
))

# ── Q16 — Science ─────────────────────────────
questions.append(q(
    "The prevailing model of plate tectonics assumes that subducting oceanic slabs drive mantle convection by pulling plates downward through gravitational sinking. Recent seismic tomography, however, has imaged several subducted slabs stagnating at the 660-kilometer mantle discontinuity rather than penetrating directly into the lower mantle. Mineral physics experiments suggest that this stagnation occurs because the post-spinel phase transition at 660 km creates a density contrast that temporarily resists slab descent. Eventually, the accumulated material appears to avalanche through the barrier in episodic pulses, potentially explaining periods of accelerated plate motion observed in the geological record.\n\n— Adapted from S. Goes et al., \"Subduction-transition zone interaction,\" Annual Review of Earth and Planetary Sciences, 2017.",
    "Based on the text, what can most reasonably be inferred about the movement of subducted slabs through the mantle?",
    {
        "A": "All subducted slabs pass continuously and smoothly from the upper mantle into the lower mantle without interruption.",
        "B": "Some subducted slabs temporarily stall at the 660-km discontinuity before eventually breaking through in episodic events, which may produce observable variations in plate motion over geological time.",
        "C": "The 660-km discontinuity permanently blocks all subducted material from reaching the lower mantle.",
        "D": "Seismic tomography has disproven the role of gravitational sinking in plate tectonics."
    },
    "B",
    "Three pieces combine: (1) slabs 'stagnating' at 660 km (temporary blockage), (2) accumulated material 'avalanches through' in episodic pulses (eventual breakthrough), and (3) this 'potentially explains' periods of accelerated plate motion (observable variation). Choice B synthesizes all three into a single inference.",
    {
        "A": "Reversed Causation — The passage's key finding is that slabs do NOT pass smoothly; they stagnate, directly contradicting 'continuously and smoothly.'",
        "C": "Over-Inference — The passage says the barrier 'temporarily resists' descent and material eventually 'avalanches through'; 'permanently blocks all material' contradicts the episodic breakthrough described.",
        "D": "Over-Inference — The passage says tomography revealed stagnation that 'complicates' the simple sinking model but does not disprove gravitational sinking as a driving force."
    }
))

# ── Q17 — Literature ──────────────────────────
questions.append(q(
    "In Mary Shelley's Frankenstein (1818), the creature's account of learning language by eavesdropping on the De Lacey family is often read as a parable of education's civilizing power. Yet the creature's subsequent discovery of Milton's Paradise Lost, Plutarch's Lives, and Goethe's Sorrows of Young Werther produces not contentment but anguish: the creature learns enough to articulate its own exclusion from human society. Shelley thus presents literacy not as a straightforward liberation but as a double-edged acquisition that grants the creature the conceptual vocabulary to comprehend its own suffering without providing any means of remedy.\n\n— Adapted from Mary Shelley, Frankenstein; or, The Modern Prometheus, 1818.",
    "Based on the text, what can most reasonably be inferred about Shelley's treatment of the creature's education?",
    {
        "A": "Shelley portrays education as entirely beneficial, enabling the creature to integrate successfully into human society.",
        "B": "Shelley presents the creature's education as paradoxical: literacy provides the means to understand its exclusion but simultaneously deepens its suffering by making that exclusion articulable.",
        "C": "The creature's reading of Paradise Lost causes it to reject all human values entirely.",
        "D": "Shelley uses the De Lacey family to demonstrate that rural communities are more accepting of difference than urban ones."
    },
    "B",
    "The passage links two observations: (1) the creature's literacy allows it to 'articulate its own exclusion,' and (2) this produces 'anguish,' not contentment, making education 'double-edged.' The inference is that comprehension of suffering deepens suffering — a paradox. Choice B synthesizes both elements.",
    {
        "A": "Reversed Causation — The passage explicitly states that education produces 'anguish' and does not lead to integration; 'entirely beneficial' reverses the text's argument.",
        "C": "Over-Inference — The passage says reading produces anguish about exclusion, not a wholesale rejection of human values. The creature's pain comes from wanting inclusion, not from rejecting humanity.",
        "D": "Reasonable But Unsupported — The passage discusses the De Lacey family only as a source of language learning; it makes no urban/rural comparison about acceptance of difference."
    }
))

# ── Q18 — History/Social Studies ──────────────
questions.append(q(
    "In The Origins of Totalitarianism (1951), Hannah Arendt argues that totalitarian regimes differ from traditional tyrannies not merely in degree of repression but in kind: they seek to eliminate all spontaneous human action by making individuals superfluous. Traditional despots want obedience; totalitarian rulers want to render even obedience unnecessary by destroying the capacity for independent thought. Arendt locates the precondition for this project in mass loneliness — the condition of 'being deserted by all human companionship' — which she distinguishes from solitude, a state that preserves inner dialogue. Loneliness, she argues, destroys the inner plurality that makes thinking possible.\n\n— Adapted from Hannah Arendt, The Origins of Totalitarianism, 1951.",
    "Based on the text, what can most reasonably be inferred about Arendt's distinction between loneliness and solitude?",
    {
        "A": "Arendt considers loneliness and solitude to be identical psychological states with the same political consequences.",
        "B": "For Arendt, the critical difference is that solitude preserves the inner dialogue necessary for independent thought, while loneliness destroys it — making loneliness a precondition for totalitarian control.",
        "C": "Arendt argues that solitude is a more dangerous political condition than loneliness.",
        "D": "Arendt believes that traditional tyrannies create loneliness while totalitarian regimes create solitude."
    },
    "B",
    "The passage makes three linked claims: (1) totalitarianism seeks to destroy independent thought, (2) loneliness is the precondition because it 'destroys the inner plurality that makes thinking possible,' and (3) solitude is distinguished because it 'preserves inner dialogue.' Combining these yields: solitude maintains thought; loneliness destroys it, enabling totalitarianism. Choice B synthesizes this chain.",
    {
        "A": "Reversed Causation — The passage's entire point is to distinguish the two: loneliness destroys thinking while solitude preserves it. Calling them identical contradicts the text.",
        "C": "Reversed Causation — The passage identifies loneliness, not solitude, as the precondition for totalitarianism; solitude is presented as preserving thought, making it less dangerous.",
        "D": "Misattributed Claim — The passage associates loneliness with totalitarianism (not tyranny), and solitude is presented as a protective state, not as something regimes create."
    }
))

# ── Q19 — Science ─────────────────────────────
questions.append(q(
    "Quantum entanglement allows two particles to exhibit correlated measurement outcomes regardless of the distance separating them. A common misconception holds that entanglement enables faster-than-light communication. However, the correlations become apparent only when measurement results from both particles are compared through a classical (light-speed-limited) communication channel. No individual measurement at one site reveals any information about the measurement performed at the other site; the results at each location, taken in isolation, appear entirely random. The no-communication theorem formalizes this constraint, proving that entanglement alone cannot transmit classical information.\n\n— Adapted from J. Bell, \"On the Einstein Podolsky Rosen paradox,\" Physics, 1964; N. Gisin et al., \"Quantum cryptography,\" Reviews of Modern Physics, 2002.",
    "Based on the text, what can most reasonably be inferred about entanglement and information transfer?",
    {
        "A": "Entanglement proves that signals can travel faster than the speed of light under certain conditions.",
        "B": "While entangled particles show correlated outcomes, extracting usable information from those correlations requires classical communication, meaning entanglement does not enable superluminal information transfer.",
        "C": "The no-communication theorem has been experimentally disproven by recent quantum computing advances.",
        "D": "Individual measurements on one entangled particle reveal the measurement setting chosen at the distant location."
    },
    "B",
    "The passage presents: (1) correlations appear only when results are compared via classical channels, (2) individual measurements appear random, and (3) the no-communication theorem proves entanglement cannot transmit classical information. Combining all three yields the inference that entanglement's correlations are real but do not enable faster-than-light communication. Choice B synthesizes these constraints.",
    {
        "A": "Reversed Causation — The passage identifies faster-than-light communication as a 'misconception' and explains why entanglement does not enable it.",
        "C": "Reasonable But Unsupported — The passage cites the no-communication theorem as established; it says nothing about it being disproven by any subsequent work.",
        "D": "Reversed Causation — The passage explicitly states that 'no individual measurement at one site reveals any information about the measurement performed at the other site.'"
    }
))

# ── Q20 — Literature ──────────────────────────
questions.append(q(
    "In Gustave Flaubert's Madame Bovary (1857), the famous agricultural fair scene intercuts Rodolphe's romantic seductions of Emma with the prize announcements for livestock below. Flaubert's juxtaposition is not merely comic; critics have observed that the technique establishes a structural equivalence between the language of romantic idealism and the language of commercial transaction. Rodolphe's declarations of transcendent love are literally framed by announcements of prizes for manure and merino sheep. The effect, amplified by Flaubert's notoriously detached narration, is to expose the formulaic quality of romantic discourse by placing it in acoustic proximity to the equally formulaic language of market exchange.\n\n— Adapted from Gustave Flaubert, Madame Bovary, 1857; see also J. Culler, Flaubert: The Uses of Uncertainty, 1974.",
    "Based on the text, what can most reasonably be inferred about Flaubert's purpose in juxtaposing the seduction scene with the agricultural fair?",
    {
        "A": "Flaubert's primary aim is to provide comic relief from the novel's otherwise tragic tone.",
        "B": "By placing romantic declarations alongside commercial announcements, Flaubert exposes the formulaic and transactional nature of the romantic language Rodolphe employs, undermining its claims to sincerity.",
        "C": "Flaubert uses the scene to celebrate rural French agricultural traditions.",
        "D": "The juxtaposition is accidental, resulting from Flaubert's well-documented difficulty in organizing narrative sequences."
    },
    "B",
    "The passage identifies: (1) a 'structural equivalence' between romantic and commercial language, (2) Rodolphe's declarations framed by livestock prizes, and (3) the effect is to 'expose the formulaic quality of romantic discourse.' Combining these yields the inference that the juxtaposition is a deliberate technique to undermine Rodolphe's romantic language by revealing its transactional nature. Choice B synthesizes all three observations.",
    {
        "A": "Reasonable But Unsupported — The passage says the juxtaposition is 'not merely comic' and serves a deeper analytical function; reducing it to comic relief ignores the structural critique.",
        "C": "Misattributed Claim — The agricultural fair serves as a foil for romantic language, not as a celebration of rural traditions; the prizes are used ironically.",
        "D": "Reasonable But Unsupported — The passage says critics have observed the technique's deliberate critical function; 'accidental' organization contradicts the interpretive analysis presented."
    }
))

# ── Q21 — History/Social Studies ──────────────
questions.append(q(
    "In On Liberty (1859), John Stuart Mill argues that silencing an opinion is harmful regardless of whether the opinion is true or false. If true, society loses access to the truth; if false, society loses the opportunity to strengthen its understanding of truth through debate. Mill further contends that most opinions are neither wholly true nor wholly false but contain partial truths, and that free discussion is the only reliable mechanism for separating the valid elements from the erroneous. Suppression, he warns, freezes partial truths into unchallenged dogma, which then degrades into mere prejudice unsupported by understanding.\n\n— Adapted from John Stuart Mill, On Liberty, 1859.",
    "Based on the text, what can most reasonably be inferred about Mill's view of opinions that are only partially true?",
    {
        "A": "Mill considers partially true opinions to be the most dangerous category and advocates their suppression above all others.",
        "B": "Mill argues that partially true opinions are the most common case, and that their valid elements can be extracted only through open debate — making free discussion essential even when the opinion in question contains errors.",
        "C": "Mill believes that partially true opinions should be tolerated only until their errors are identified, at which point they should be censored.",
        "D": "Mill treats partially true opinions as irrelevant to his argument, which focuses exclusively on opinions that are either entirely true or entirely false."
    },
    "B",
    "The passage states: (1) 'most opinions' contain partial truths, (2) 'free discussion is the only reliable mechanism' for separating valid from erroneous elements, and (3) suppression freezes partial truths into 'unchallenged dogma.' Combining these yields the inference that free debate is essential precisely because most opinions mix truth and error, and only discussion can sort them. Choice B synthesizes all three points.",
    {
        "A": "Reversed Causation — Mill's argument is that suppression (not tolerance) is dangerous; he advocates free discussion of all opinions, not suppression of partially true ones.",
        "C": "Over-Inference — Mill's argument against suppression applies even to erroneous opinions; he never advocates censoring opinions after identifying their errors.",
        "D": "Misattributed Claim — The passage explicitly discusses partial truths as a central category in Mill's argument, stating that 'most opinions' fall into this category."
    }
))

# ── Q22 — Science ─────────────────────────────
questions.append(q(
    "CRISPR-Cas9 genome editing relies on a guide RNA directing the Cas9 nuclease to a specific DNA sequence, where it creates a double-strand break. The cell then repairs the break through one of two pathways: non-homologous end joining (NHEJ), which is error-prone and often introduces insertions or deletions, or homology-directed repair (HDR), which uses a supplied template to make precise edits. A persistent challenge is that NHEJ predominates in most human cell types, making precise knock-in edits inefficient. Recent strategies have attempted to shift the balance toward HDR by delivering Cas9 as a ribonucleoprotein complex timed to the S/G2 phase of the cell cycle, when HDR machinery is most active.\n\n— Adapted from F. A. Ran et al., \"Genome engineering using the CRISPR-Cas9 system,\" Nature Protocols, 2013.",
    "Based on the text, what can most reasonably be inferred about the primary obstacle to precise CRISPR-based gene editing?",
    {
        "A": "The primary obstacle is that Cas9 cannot be directed to specific DNA sequences with sufficient accuracy.",
        "B": "The primary obstacle is that cells preferentially use NHEJ over HDR, leading to imprecise repairs, and current strategies attempt to overcome this by timing delivery to cell-cycle phases that favor HDR.",
        "C": "CRISPR editing is limited solely by the inability to synthesize guide RNA molecules in the laboratory.",
        "D": "HDR is the dominant repair pathway in all human cell types, making insertions and deletions rare."
    },
    "B",
    "The passage identifies: (1) NHEJ is 'error-prone' and 'predominates,' (2) HDR is precise but inefficient, and (3) strategies target S/G2 timing to shift the balance toward HDR. The inference is that NHEJ dominance is the core obstacle and researchers address it through cell-cycle timing. Choice B synthesizes the problem and the solution strategy.",
    {
        "A": "Misattributed Claim — The passage says the guide RNA directs Cas9 to a 'specific DNA sequence,' implying targeting accuracy is not the problem; the issue is repair pathway choice.",
        "C": "Reasonable But Unsupported — Guide RNA synthesis is presented as routine in the passage; no difficulty with it is mentioned.",
        "D": "Reversed Causation — The passage explicitly states that NHEJ, not HDR, predominates, and that HDR is the precise but less frequent pathway."
    }
))

# ── Q23 — Literature ──────────────────────────
questions.append(q(
    "In James Joyce's 'The Dead' (1914), Gabriel Conroy delivers an after-dinner speech praising Irish hospitality and tradition, but his rhetorical confidence is progressively undermined by a series of encounters at the party: Miss Ivors challenges his cultural authenticity, and his wife Gretta is revealed to be absorbed in a memory of a young man who died for love of her. By the story's close, Gabriel stands at a hotel window watching snow fall 'upon all the living and the dead,' and his earlier certainties about his own identity and his marriage dissolve into a recognition of how little he has understood.\n\n— Adapted from James Joyce, Dubliners, 1914.",
    "Based on the text, what can most reasonably be inferred about the trajectory of Gabriel's self-understanding over the course of the story?",
    {
        "A": "Gabriel's after-dinner speech represents his genuine and lasting understanding of Irish culture, which remains unchanged by the evening's events.",
        "B": "Gabriel moves from confident self-assurance to a humbling recognition of his own ignorance, prompted by encounters that expose the gap between his public persona and his actual comprehension of others.",
        "C": "Gabriel's final vision of the snow falling represents his triumph over the insecurities raised during the party.",
        "D": "The story suggests that Gabriel's marriage is strengthened by the revelations of the evening."
    },
    "B",
    "The passage traces a trajectory: (1) Gabriel starts with 'rhetorical confidence,' (2) encounters 'progressively undermine' that confidence, and (3) his 'earlier certainties dissolve into a recognition of how little he has understood.' The inference is a movement from assurance to humility. Choice B synthesizes this arc.",
    {
        "A": "Reversed Causation — The passage says Gabriel's confidence is 'progressively undermined'; claiming it 'remains unchanged' directly contradicts the described trajectory.",
        "C": "Misattributed Claim — The passage presents the snow scene as a moment where certainties 'dissolve,' not as a triumph; the dissolution indicates humility, not victory.",
        "D": "Reasonable But Unsupported — The passage reveals that Gabriel did not know about Gretta's memory of the dead young man; the text implies he realizes 'how little he has understood,' suggesting disruption rather than strengthening."
    }
))

# ── Q24 — History/Social Studies ──────────────
questions.append(q(
    "In Discourse on Colonialism (1950), Aimé Césaire argues that colonialism degrades not only the colonized but also the colonizer. He contends that the practice of dehumanizing colonial subjects requires the colonizer to adopt a moral framework incompatible with the humanist values Europe professes. Césaire points out that the brutalities of colonial administration — forced labor, cultural suppression, summary violence — 'boomerang' back to the metropole, coarsening its political culture and preparing the ground for fascism within Europe itself. In this analysis, Nazism was not an aberration but a logical extension of colonial violence redirected inward.\n\n— Adapted from Aimé Césaire, Discourse on Colonialism, 1950.",
    "Based on the text, what can most reasonably be inferred about Césaire's argument regarding the relationship between colonialism and European fascism?",
    {
        "A": "Césaire views fascism as an entirely unrelated phenomenon that arose from economic conditions within Europe alone.",
        "B": "Césaire argues that the moral and political habits developed through colonial domination created the conditions for fascist violence to emerge within Europe, making fascism a consequence rather than an aberration of European colonial practice.",
        "C": "Césaire contends that colonialism was a benign process that was corrupted only by fascist governments.",
        "D": "Césaire's primary focus is on the economic costs of colonialism to European treasuries."
    },
    "B",
    "The passage connects: (1) colonial brutalities 'boomerang' to the metropole, (2) they coarsen political culture, and (3) Nazism was 'not an aberration but a logical extension of colonial violence.' The inference is that Césaire sees a causal chain from colonialism to fascism. Choice B synthesizes this argument.",
    {
        "A": "Reversed Causation — The passage's central argument is precisely that colonialism and fascism ARE related; calling fascism 'entirely unrelated' contradicts Césaire's thesis.",
        "C": "Misattributed Claim — The passage describes colonialism itself as involving 'forced labor, cultural suppression, summary violence' — these are not benign. Césaire's point is that colonialism was inherently brutal.",
        "D": "Reasonable But Unsupported — The passage discusses moral and political degradation, not economic costs to treasuries."
    }
))

# ── Q25 — Science ─────────────────────────────
questions.append(q(
    "Studies of the gut-brain axis have demonstrated that the enteric nervous system — sometimes called the 'second brain' — communicates with the central nervous system through the vagus nerve. Germ-free mice, raised without gut microbiota, exhibit elevated stress hormone levels and altered anxiety-like behavior compared to conventionally colonized controls. Introducing specific Lactobacillus strains normalizes these behaviors, but only when the vagus nerve is intact: vagotomized mice receiving the same bacterial supplementation show no behavioral improvement. These findings suggest that gut bacteria influence brain function through vagal signaling rather than through systemic metabolite circulation.\n\n— Adapted from J. Bravo et al., \"Ingestion of Lactobacillus strain regulates emotional behavior via the vagus nerve,\" PNAS, 2011.",
    "Based on the text, what can most reasonably be inferred about the mechanism by which gut bacteria influence behavior in these experiments?",
    {
        "A": "Gut bacteria influence behavior exclusively through chemical metabolites circulating in the bloodstream.",
        "B": "The behavioral effects of Lactobacillus supplementation depend on an intact vagus nerve, suggesting that the primary mechanism of gut-brain communication in these experiments is neural rather than circulatory.",
        "C": "Vagotomy eliminates all effects of gut bacteria on every aspect of host physiology.",
        "D": "Germ-free mice exhibit lower stress levels than conventionally colonized mice."
    },
    "B",
    "The passage presents a controlled comparison: (1) Lactobacillus normalizes behavior in mice with intact vagus nerves, (2) vagotomized mice show 'no behavioral improvement' with the same bacteria. This contrast supports the inference that vagal signaling is the primary mechanism in these experiments. Choice B synthesizes both conditions.",
    {
        "A": "Reversed Causation — The passage's key finding is that vagotomy abolishes behavioral effects, arguing against systemic metabolite circulation as the primary mechanism.",
        "C": "Over-Inference — The passage shows vagotomy blocks the behavioral effects of one bacterial strain; it does not claim vagotomy eliminates ALL effects of gut bacteria on ALL aspects of physiology.",
        "D": "Reversed Causation — The passage states germ-free mice have 'elevated stress hormone levels' — i.e., higher stress, not lower."
    }
))

# ── Q26 — Literature ──────────────────────────
questions.append(q(
    "In Emily Brontë's Wuthering Heights (1847), Nelly Dean serves as the primary narrator, yet her reliability has long been debated. She consistently portrays herself as a voice of reason and moral stability amid the passions of Heathcliff and Catherine. However, her narrative choices reveal biases: she withholds letters, conceals information from her employers, and shapes events through selective silence. Brontë never provides an external corrective to Nelly's account, leaving the reader dependent on a narrator whose self-presentation as neutral is undermined by her active role in the events she recounts.\n\n— Adapted from Emily Brontë, Wuthering Heights, 1847.",
    "Based on the text, what can most reasonably be inferred about how Brontë structures the reader's relationship to Nelly's narration?",
    {
        "A": "Brontë provides independent evidence that confirms every element of Nelly's account.",
        "B": "Brontë creates a narrative structure in which the reader must depend on a narrator whose claim to neutrality is contradicted by her own participatory actions, generating an irreducible interpretive uncertainty.",
        "C": "Nelly Dean is presented as the novel's moral authority whose judgments the reader is meant to accept without question.",
        "D": "Brontë uses multiple narrators who corroborate each other's accounts, ensuring narrative reliability."
    },
    "B",
    "The passage identifies: (1) Nelly 'portrays herself as a voice of reason' (claims neutrality), (2) her actions (withholding letters, selective silence) 'undermine' this self-presentation, and (3) Brontë provides 'no external corrective.' Combining these yields the inference that the reader is trapped with an unreliable narrator and no way to verify her account. Choice B synthesizes this interpretive predicament.",
    {
        "A": "Reversed Causation — The passage says Brontë 'never provides an external corrective,' directly contradicting the claim of independent confirming evidence.",
        "C": "Misattributed Claim — The passage argues that Nelly's moral self-presentation is 'undermined' by her biased actions; presenting her as an unquestionable authority ignores this tension.",
        "D": "Misattributed Claim — The passage emphasizes that Nelly is the 'primary narrator' with no external corrective, contradicting the claim of multiple corroborating narrators."
    }
))

# ── Q27 — History/Social Studies ──────────────
questions.append(q(
    "In The Wretched of the Earth (1961), Frantz Fanon argues that decolonization is by definition a violent process because the colonial order itself is maintained by violence. He contends that the colonial system creates a Manichean world — a rigid division between colonizer and colonized — that can be dissolved only by the same force that established it. Fanon further argues that participation in anti-colonial struggle has a psychological dimension: it enables the colonized to reclaim agency and selfhood that the colonial system systematically denied. Violence, in Fanon's analysis, is not merely instrumental but transformative — it reshapes the subjectivity of those who engage in it.\n\n— Adapted from Frantz Fanon, The Wretched of the Earth, 1961.",
    "Based on the text, what can most reasonably be inferred about Fanon's view of the role of violence in decolonization?",
    {
        "A": "Fanon regards anti-colonial violence as regrettable but having no psychological effects on participants.",
        "B": "Fanon argues that violence in decolonization serves a dual function: it is both a practical means of dismantling the colonial order and a psychological process through which the colonized reconstitute their sense of agency.",
        "C": "Fanon advocates violence as a permanent political strategy for all post-colonial societies.",
        "D": "Fanon believes that non-violent negotiation is the most effective means of achieving decolonization."
    },
    "B",
    "The passage identifies two dimensions: (1) violence dissolves the colonial order (practical/instrumental), and (2) it 'enables the colonized to reclaim agency and selfhood' (psychological/transformative). The inference combining both is that violence serves a dual purpose. Choice B captures this synthesis.",
    {
        "A": "Reversed Causation — The passage explicitly states that violence 'reshapes the subjectivity of those who engage in it,' directly contradicting 'no psychological effects.'",
        "C": "Over-Inference — The passage discusses violence specifically in the context of decolonization; extending this to 'a permanent political strategy for all post-colonial societies' goes beyond the text.",
        "D": "Reversed Causation — The passage argues that decolonization is 'by definition a violent process' because the colonial order was established by violence; this directly contradicts advocacy for non-violent negotiation as the primary strategy."
    }
))

# ── Q28 — Science ─────────────────────────────
questions.append(q(
    "Epigenetic clocks — mathematical models that estimate biological age from DNA methylation patterns — have revealed a discrepancy between chronological and biological aging. Individuals with the same calendar age can differ by a decade or more in their epigenetic age. Longitudinal studies show that accelerated epigenetic aging (biological age exceeding chronological age) predicts increased mortality, cardiovascular disease, and cognitive decline, even after controlling for traditional risk factors like smoking and BMI. However, the causal direction remains unclear: accelerated methylation changes might drive pathology, or they might merely reflect underlying physiological deterioration caused by other processes.\n\n— Adapted from S. Horvath, \"DNA methylation age of human tissues and cell types,\" Genome Biology, 2013.",
    "Based on the text, what can most reasonably be inferred about the current understanding of accelerated epigenetic aging?",
    {
        "A": "Accelerated epigenetic aging has been proven to cause cardiovascular disease independently of all other risk factors.",
        "B": "While accelerated epigenetic aging reliably predicts adverse health outcomes, whether it causes those outcomes or merely reflects other underlying processes remains an open question.",
        "C": "Epigenetic clocks have been shown to be inaccurate and unreliable predictors of health outcomes.",
        "D": "Chronological age and biological age are always identical in healthy individuals."
    },
    "B",
    "The passage provides: (1) accelerated epigenetic aging 'predicts increased mortality' and disease (reliable association), and (2) 'the causal direction remains unclear.' Combining both yields the inference that the predictive power is established but the causal mechanism is not. Choice B synthesizes this distinction between correlation and causation.",
    {
        "A": "Over-Inference — The passage says the 'causal direction remains unclear'; stating that accelerated aging 'has been proven to cause' disease converts an unresolved question into a settled fact.",
        "C": "Reversed Causation — The passage says epigenetic age predicts mortality, cardiovascular disease, and cognitive decline 'even after controlling for traditional risk factors' — this establishes reliability, not inaccuracy.",
        "D": "Misattributed Claim — The passage explicitly states that individuals with the same chronological age can differ 'by a decade or more' in epigenetic age, contradicting the claim of identity."
    }
))

# ── Q29 — Literature ──────────────────────────
questions.append(q(
    "In George Eliot's Middlemarch (1871), Dorothea Brooke's decision to marry Edward Casaubon is presented as a sincere intellectual aspiration: she imagines herself as a helpmate in his scholarly project, analogous to Milton's daughters transcribing Paradise Lost. Eliot's narrator, however, quietly signals the mismatch between Dorothea's idealized vision and Casaubon's actual character through a series of ironic qualifications — Casaubon's research is described as a labyrinth without a center, his manner as 'rayless' sunlight. The irony depends on the reader perceiving what Dorothea cannot: that her intellectual generosity has been directed toward an unworthy object, and that her idealism is both her greatest virtue and the source of her deepest error.\n\n— Adapted from George Eliot, Middlemarch, 1871-72.",
    "Based on the text, what can most reasonably be inferred about Eliot's narrative technique in presenting Dorothea's marriage decision?",
    {
        "A": "Eliot's narrator fully endorses Dorothea's assessment of Casaubon and presents the marriage as a wise intellectual partnership.",
        "B": "Eliot creates dramatic irony by allowing the narrator to signal Casaubon's inadequacy through ironic description while Dorothea remains unaware, positioning the reader to see that Dorothea's idealism is both admirable and self-defeating.",
        "C": "Eliot uses Dorothea's marriage to argue that all scholarly pursuits are ultimately meaningless.",
        "D": "Casaubon's research is described favorably, indicating that Dorothea's assessment of his intellectual value is correct."
    },
    "B",
    "The passage identifies: (1) Dorothea sincerely believes in Casaubon's project, (2) the narrator 'quietly signals the mismatch' through ironic qualifications, and (3) idealism is 'both her greatest virtue and the source of her deepest error.' The inference is that Eliot uses dramatic irony (reader sees what Dorothea cannot) to show idealism as simultaneously admirable and self-defeating. Choice B synthesizes all three elements.",
    {
        "A": "Reversed Causation — The passage says the narrator provides 'ironic qualifications' of Casaubon, signaling a mismatch; full endorsement contradicts the established irony.",
        "C": "Over-Inference — The passage critiques the specific mismatch between Dorothea's idealism and Casaubon's inadequacy; it does not generalize to all scholarly pursuits being meaningless.",
        "D": "Reversed Causation — Casaubon's research is described as 'a labyrinth without a center' and his manner as 'rayless' — these are unfavorable, not favorable, descriptions."
    }
))

# ── Q30 — History/Social Studies ──────────────
questions.append(q(
    "In 'The Historian's Craft' (1949), Marc Bloch argues that historical understanding requires empathy with past actors without surrendering critical judgment. The historian must 'understand' a medieval peasant's belief in miracles — reconstructing the mental world in which such beliefs were rational — without endorsing miracles as explanatory categories. Bloch calls this dual stance 'comprehension without approval' and warns against two symmetrical errors: the anachronistic imposition of modern categories on the past, and an uncritical relativism that treats all beliefs as equally valid simply because they were sincerely held.\n\n— Adapted from Marc Bloch, The Historian's Craft, 1949 (published posthumously).",
    "Based on the text, what can most reasonably be inferred about Bloch's position on historical empathy?",
    {
        "A": "Bloch believes that the historian should adopt the beliefs of past actors and treat them as currently valid explanatory frameworks.",
        "B": "Bloch argues for a balanced method that combines empathetic reconstruction of past worldviews with critical judgment, avoiding both anachronistic condescension and uncritical acceptance.",
        "C": "Bloch advocates applying modern scientific categories directly to all historical periods to ensure objectivity.",
        "D": "Bloch considers empathy with past actors to be irrelevant to historical scholarship."
    },
    "B",
    "The passage defines Bloch's method as 'comprehension without approval' and identifies two errors to avoid: (1) anachronistic imposition of modern categories and (2) uncritical relativism. The inference is that his position navigates between both extremes. Choice B synthesizes this balanced methodology.",
    {
        "A": "Over-Inference — Bloch advocates 'comprehension without approval'; adopting past beliefs as 'currently valid' falls into the uncritical relativism he explicitly warns against.",
        "C": "Reversed Causation — The passage identifies 'anachronistic imposition of modern categories' as one of the two errors Bloch warns against, directly contradicting this choice.",
        "D": "Reversed Causation — The passage's central argument is that empathy (reconstructing past mental worlds) is essential to the historian's craft."
    }
))

# ── Q31 — Science ─────────────────────────────
questions.append(q(
    "Horizontal gene transfer (HGT) — the movement of genetic material between organisms outside of parent-to-offspring inheritance — is well documented in prokaryotes but was long considered negligible in multicellular eukaryotes. Genome sequencing of bdelloid rotifers, however, revealed that approximately 8% of their genes were acquired from bacteria, fungi, and plants. These foreign genes are not pseudogenes or non-functional remnants; many are actively transcribed and encode functional enzymes involved in desiccation tolerance and antioxidant defense. The discovery challenges the traditional view that metazoan genomes evolve primarily through vertical descent and suggests that HGT may be an underappreciated source of adaptive novelty in animals.\n\n— Adapted from C. Boschetti et al., \"Foreign genes and novel hydrophilic protein genes participate in the desiccation response of bdelloid rotifers,\" Journal of Experimental Biology, 2012.",
    "Based on the text, what can most reasonably be inferred about the significance of HGT in bdelloid rotifers?",
    {
        "A": "HGT in rotifers is limited to non-functional pseudogenes with no adaptive role.",
        "B": "The presence of functional foreign genes in rotifers suggests that HGT can contribute to adaptive capabilities in multicellular animals, challenging the assumption that such organisms evolve primarily through vertical inheritance.",
        "C": "Bdelloid rotifers acquired all of their genes through horizontal transfer rather than vertical descent.",
        "D": "HGT has now been confirmed as the dominant mode of evolution in all animal lineages."
    },
    "B",
    "The passage establishes: (1) foreign genes constitute ~8% of the rotifer genome, (2) they are functional and contribute to desiccation tolerance, and (3) this challenges the view that metazoan genomes evolve 'primarily through vertical descent.' The inference is that HGT can meaningfully contribute to adaptive evolution in animals. Choice B synthesizes these findings.",
    {
        "A": "Reversed Causation — The passage explicitly states the foreign genes 'are not pseudogenes' and are 'actively transcribed' and 'encode functional enzymes,' directly contradicting non-functional.",
        "C": "Over-Inference — The passage says approximately 8% of genes were acquired through HGT; the remaining 92% were inherited vertically. 'All' vastly overstates the finding.",
        "D": "Over-Inference — The passage discusses one group (bdelloid rotifers) and says HGT 'may be an underappreciated source'; extending to 'all animal lineages' as the 'dominant mode' goes far beyond the evidence."
    }
))

# ── Q32 — Literature ──────────────────────────
questions.append(q(
    "In Joseph Conrad's Lord Jim (1900), the narrator Marlow repeatedly acknowledges the limits of his own understanding: 'I don't pretend I understood him,' he says of Jim after hours of conversation. Conrad structures the novel so that Jim's character is reconstructed through multiple witnesses — Marlow, Stein, Jewel, Gentleman Brown — none of whom possesses the complete picture. The narrative's refusal to resolve Jim's motivations into a single explanation has led critics to describe Conrad's technique as a 'perspectival parallax,' in which the truth of Jim's character can only be approximated through the accumulation of partial, sometimes contradictory, viewpoints.\n\n— Adapted from Joseph Conrad, Lord Jim, 1900.",
    "Based on the text, what can most reasonably be inferred about Conrad's approach to characterization in Lord Jim?",
    {
        "A": "Conrad presents Jim's character through a single omniscient narrator who provides definitive judgments.",
        "B": "Conrad deliberately fragments the presentation of Jim's character across multiple partial perspectives, suggesting that definitive understanding of a person may be unattainable and can only be approximated through accumulated viewpoints.",
        "C": "The multiple narrators ultimately converge on a single, unified interpretation of Jim's character.",
        "D": "Conrad uses the multiple perspectives to prove that Jim's motivations are trivial and unworthy of serious analysis."
    },
    "B",
    "The passage establishes: (1) Marlow admits the limits of his understanding, (2) 'none' of the multiple witnesses 'possesses the complete picture,' and (3) critics describe the result as 'perspectival parallax' — truth approximated through partial viewpoints. Combining these yields the inference that Conrad deliberately structures characterization as irreducibly partial. Choice B captures this synthesis.",
    {
        "A": "Reversed Causation — The passage describes multiple narrators, not a single omniscient one, and emphasizes that understanding is limited and partial.",
        "C": "Misattributed Claim — The passage says the viewpoints are 'sometimes contradictory' and the narrative 'refuses to resolve' Jim into a single explanation; convergence on a unified interpretation contradicts this.",
        "D": "Reasonable But Unsupported — The elaborate multi-perspectival structure suggests the opposite of triviality; Conrad devotes enormous narrative architecture to Jim's character precisely because it resists simple judgment."
    }
))

# ── Q33 — History/Social Studies ──────────────
questions.append(q(
    "In The Souls of Black Folk (1903), W. E. B. Du Bois critiques Booker T. Washington's accommodationist program not by disputing its practical achievements — he acknowledges Washington's success in promoting industrial education — but by arguing that Washington's strategy implicitly accepts a bargain that trades political rights and higher education for economic concessions. Du Bois contends that without the ballot and access to liberal education, African Americans cannot protect even the economic gains Washington secures. His critique is thus structural: short-term vocational progress, he argues, is unsustainable without the political and intellectual foundations that Washington's program deliberately de-emphasizes.\n\n— Adapted from W. E. B. Du Bois, The Souls of Black Folk, 1903.",
    "Based on the text, what can most reasonably be inferred about Du Bois's disagreement with Washington?",
    {
        "A": "Du Bois argues that Washington's industrial education programs produced no practical benefits for African Americans.",
        "B": "Du Bois's disagreement is structural rather than total: he accepts Washington's practical achievements but argues that economic gains are unsustainable without the political rights and higher education that Washington's program sacrifices.",
        "C": "Du Bois opposes all forms of vocational education for African Americans.",
        "D": "Du Bois and Washington held identical views on the importance of political rights."
    },
    "B",
    "The passage states: (1) Du Bois 'acknowledges Washington's success' (not total rejection), (2) he argues the strategy 'trades political rights and higher education for economic concessions,' and (3) without political and intellectual foundations, gains are 'unsustainable.' The inference is a structural, not absolute, disagreement. Choice B captures this nuance.",
    {
        "A": "Misattributed Claim — The passage explicitly says Du Bois acknowledges Washington's 'practical achievements'; claiming 'no practical benefits' contradicts this.",
        "C": "Over-Inference — Du Bois's critique targets Washington's de-emphasis of political rights and liberal education, not vocational education per se. The passage does not suggest opposition to all vocational training.",
        "D": "Reversed Causation — The passage's entire point is that Du Bois and Washington disagreed about the importance of political rights; Du Bois insisted on them while Washington 'deliberately de-emphasizes' them."
    }
))

# ── Q34 — Science ─────────────────────────────
questions.append(q(
    "The discovery of gravitational waves by LIGO in 2015 confirmed a prediction of general relativity, but it also opened an unexpected observational window. The first detected event — a binary black hole merger — revealed that stellar-mass black holes of approximately 30 solar masses exist as orbiting pairs, a configuration that several formation models had predicted was highly unlikely. Subsequent detections have identified a population of similar high-mass mergers, challenging models that assumed such massive stellar remnants would be rare. The emerging catalog of merger events now provides empirical constraints on binary stellar evolution, the metallicity of progenitor stars, and the efficiency of common-envelope ejection.\n\n— Adapted from B. P. Abbott et al. (LIGO Scientific Collaboration), \"Observation of gravitational waves from a binary black hole merger,\" Physical Review Letters, 2016.",
    "Based on the text, what can most reasonably be inferred about the impact of gravitational wave detections on astrophysical models?",
    {
        "A": "Gravitational wave detections have confirmed that all existing models of binary black hole formation were correct.",
        "B": "The observed population of high-mass binary black hole mergers challenges prior assumptions and provides new empirical data that constrains models of stellar evolution and binary formation.",
        "C": "LIGO has detected gravitational waves from every type of astrophysical event predicted by general relativity.",
        "D": "The gravitational wave catalog has proven that metallicity has no effect on black hole formation."
    },
    "B",
    "The passage identifies: (1) the first detection revealed a 'highly unlikely' configuration, (2) subsequent detections challenged models assuming high-mass remnants would be rare, and (3) the catalog 'provides empirical constraints' on stellar evolution. The inference is that observations are both challenging and constraining existing models. Choice B synthesizes these points.",
    {
        "A": "Reversed Causation — The passage says detections 'challenged models' that assumed massive mergers were unlikely; confirming all models contradicts this.",
        "C": "Over-Inference — The passage discusses binary black hole mergers; it makes no claim about detecting every type of predicted event.",
        "D": "Misattributed Claim — The passage says the catalog constrains our understanding of 'metallicity of progenitor stars,' implying metallicity is relevant, not irrelevant."
    }
))

# ── Q35 — Literature ──────────────────────────
questions.append(q(
    "In Nathaniel Hawthorne's The Scarlet Letter (1850), the narrator of the introductory 'Custom-House' sketch presents the discovery of the embroidered letter 'A' as a historical fact, complete with details about the manuscript from which the story was purportedly drawn. Literary scholars have long recognized this frame as a deliberate fiction: Hawthorne crafts the appearance of documentary authority to heighten the reader's imaginative engagement with a story he freely invented. The tension between the documentary frame and the acknowledged romance creates what the narrator calls 'a neutral territory, somewhere between the real world and fairy-land, where the Actual and the Imaginary may each imbue itself with the nature of the other.'\n\n— Adapted from Nathaniel Hawthorne, The Scarlet Letter, 1850.",
    "Based on the text, what can most reasonably be inferred about Hawthorne's use of the 'Custom-House' frame?",
    {
        "A": "Hawthorne genuinely discovered a historical scarlet letter and based his novel directly on documented events.",
        "B": "The documentary frame is a deliberate literary strategy that creates a productive tension between factual authority and fictional imagination, enhancing the reader's engagement with the invented narrative.",
        "C": "The 'Custom-House' sketch is unrelated to the main narrative and serves no narrative function.",
        "D": "Hawthorne wrote the 'Custom-House' sketch reluctantly, under pressure from his publisher."
    },
    "B",
    "The passage states: (1) the frame is 'a deliberate fiction,' (2) it is designed to 'heighten the reader's imaginative engagement,' and (3) it creates a 'neutral territory' where actual and imaginary 'imbue' each other. The inference is that the frame is a strategic device that enhances engagement through productive ambiguity. Choice B synthesizes these observations.",
    {
        "A": "Misattributed Claim — The passage explicitly identifies the documentary presentation as 'a deliberate fiction'; the discovery is not genuine.",
        "C": "Reversed Causation — The passage describes the frame as creating a 'neutral territory' that shapes the reader's experience of the main narrative, directly establishing a functional relationship.",
        "D": "Reasonable But Unsupported — The passage discusses Hawthorne's artistic strategy; publisher pressure is never mentioned."
    }
))

# ── Q36 — History/Social Studies ──────────────
questions.append(q(
    "In his 1964 speech 'The Ballot or the Bullet,' Malcolm X reframes the struggle for civil rights as a struggle for human rights, arguing that by defining themselves as seeking civil rights, African Americans limit their appeal to domestic audiences and domestic legal frameworks. Human rights, by contrast, fall under international jurisdiction, allowing the case to be brought before the United Nations. Malcolm X contends that this reframing would internationalize the struggle, connecting it to anti-colonial movements in Africa and Asia and transforming it from a domestic minority complaint into a global majority's demand for justice.\n\n— Adapted from Malcolm X, 'The Ballot or the Bullet,' 1964.",
    "Based on the text, what can most reasonably be inferred about Malcolm X's rationale for the shift from 'civil rights' to 'human rights'?",
    {
        "A": "Malcolm X believed that the term 'civil rights' was more legally powerful than 'human rights' in international courts.",
        "B": "Malcolm X argues that reframing the struggle as one of human rights would expand its jurisdictional scope and its political alliances, connecting African Americans to a global anti-colonial majority.",
        "C": "Malcolm X rejected all domestic legal strategies in favor of armed revolution.",
        "D": "The speech argues that the United Nations had already formally endorsed the American civil rights movement."
    },
    "B",
    "The passage provides: (1) 'civil rights' limits the audience to domestic frameworks, (2) 'human rights' brings international jurisdiction (UN), and (3) this connects to anti-colonial movements, transforming the struggle into 'a global majority's demand.' The inference is that the terminological shift is strategic: expanding both legal and political scope. Choice B synthesizes all three elements.",
    {
        "A": "Reversed Causation — The passage argues the opposite: 'civil rights' is limiting while 'human rights' expands jurisdictional scope, making human rights the more strategically powerful term.",
        "C": "Over-Inference — The passage discusses reframing the legal and rhetorical strategy, not rejecting domestic legal strategies entirely or advocating armed revolution.",
        "D": "Reasonable But Unsupported — The passage says bringing the case to the UN would be a strategic move; it does not claim the UN had already endorsed the movement."
    }
))

# ── Q37 — Science ─────────────────────────────
questions.append(q(
    "Artificial photosynthesis research aims to replicate the water-splitting reaction of natural photosystem II (PSII), which oxidizes water into oxygen and protons using sunlight. A major obstacle is catalyst degradation: PSII's manganese-calcium cluster is damaged by reactive oxygen species every 30 minutes but is continuously repaired by the D1 protein turnover cycle. Synthetic catalysts lack this self-repair mechanism and suffer irreversible degradation under operating conditions. Recent approaches have incorporated bio-inspired self-healing strategies — such as modular catalyst architectures that can shed and replace damaged subunits — but these systems remain orders of magnitude less efficient than the biological system they emulate.\n\n— Adapted from J. Barber, \"Photosynthetic energy conversion: natural and artificial,\" Chemical Society Reviews, 2009.",
    "Based on the text, what can most reasonably be inferred about the main challenge in developing artificial photosynthesis systems?",
    {
        "A": "Synthetic catalysts successfully replicate all features of natural photosystem II, including self-repair.",
        "B": "The central challenge is that synthetic catalysts degrade irreversibly under operating conditions because they lack the biological system's continuous self-repair capability, and bio-inspired solutions have not yet matched PSII's efficiency.",
        "C": "Natural photosystem II never experiences damage to its catalytic components during operation.",
        "D": "The primary obstacle to artificial photosynthesis is the inability to absorb sunlight rather than catalyst degradation."
    },
    "B",
    "The passage identifies: (1) PSII's cluster is damaged but continuously repaired, (2) synthetic catalysts lack self-repair and degrade irreversibly, and (3) bio-inspired solutions exist but 'remain orders of magnitude less efficient.' The inference is that irreversible degradation is the central challenge, and current solutions are inadequate. Choice B synthesizes all three observations.",
    {
        "A": "Reversed Causation — The passage's central argument is that synthetic catalysts fail precisely because they cannot replicate self-repair.",
        "C": "Misattributed Claim — The passage explicitly states PSII's cluster 'is damaged every 30 minutes'; it does experience damage but has a repair mechanism.",
        "D": "Reasonable But Unsupported — The passage identifies catalyst degradation, not light absorption, as the 'major obstacle'; sunlight capture is not discussed as problematic."
    }
))

# ── Q38 — Literature ──────────────────────────
questions.append(q(
    "In Mark Twain's Adventures of Huckleberry Finn (1884), the moment when Huck decides not to turn in the escaped slave Jim is narrated as a moral crisis: Huck believes he is committing a sin by helping Jim escape, and tells himself he will 'go to hell' rather than betray his friend. Twain's irony operates on the gap between Huck's self-condemnation and the reader's understanding: what Huck experiences as damnation, the reader recognizes as the novel's highest moral act. Twain thus dramatizes the possibility that authentic moral insight can occur even when the individual's conscious moral framework condemns the very action being performed.\n\n— Adapted from Mark Twain, Adventures of Huckleberry Finn, 1884.",
    "Based on the text, what can most reasonably be inferred about Twain's treatment of morality in this scene?",
    {
        "A": "Twain presents Huck's decision to help Jim as morally wrong and expects the reader to share Huck's self-condemnation.",
        "B": "Twain uses dramatic irony to show that genuine moral action can contradict the agent's own moral beliefs, positioning the reader to recognize the ethical value that Huck himself cannot see.",
        "C": "Huck's decision demonstrates that he has abandoned all moral reasoning in favor of pure self-interest.",
        "D": "Twain's primary purpose in the scene is to advocate for the abolition of organized religion."
    },
    "B",
    "The passage presents: (1) Huck believes he is sinning, (2) the reader recognizes the act as morally right, and (3) Twain dramatizes the possibility that 'authentic moral insight' can occur within a framework that condemns it. The inference is that Twain uses dramatic irony to separate the moral act from the actor's moral self-understanding. Choice B synthesizes all three elements.",
    {
        "A": "Reversed Causation — The passage identifies a gap between Huck's self-condemnation and the reader's understanding; Twain positions the reader to disagree with Huck's self-judgment, not to share it.",
        "C": "Misattributed Claim — Huck is deeply engaged in moral reasoning — he agonizes over the decision as a 'moral crisis.' His action is not self-interested but self-sacrificing (he believes he is risking damnation).",
        "D": "Over-Inference — The passage discusses Twain's treatment of the gap between internalized social morality and authentic moral action; it makes no argument about abolishing organized religion."
    }
))

# ── Q39 — History/Social Studies ──────────────
questions.append(q(
    "In her 1988 essay 'Can the Subaltern Speak?', Gayatri Chakravorty Spivak argues that Western intellectual attempts to 'recover' the voices of colonized populations often reproduce the very epistemic violence they claim to address. Spivak contends that the subaltern — the most marginalized within a colonial or post-colonial society — cannot 'speak' in any politically effective sense, not because subalterns lack voices but because the institutional structures of knowledge production systematically prevent those voices from being heard as authoritative speech. Efforts by Western scholars to 'represent' subaltern experience, she warns, frequently substitute the scholar's framework for the subaltern's own, thereby reinforcing rather than dismantling hierarchies of knowledge.\n\n— Adapted from Gayatri Chakravorty Spivak, 'Can the Subaltern Speak?', 1988.",
    "Based on the text, what can most reasonably be inferred about Spivak's critique of Western scholarly representation of subaltern voices?",
    {
        "A": "Spivak encourages Western scholars to represent subaltern voices because they can do so more effectively than subalterns themselves.",
        "B": "Spivak argues that well-intentioned scholarly attempts to represent subaltern experience risk reproducing epistemic hierarchies by substituting the scholar's interpretive framework for the subaltern's own voice.",
        "C": "Spivak contends that subalterns lack the capacity for meaningful thought or speech.",
        "D": "Spivak's essay focuses primarily on the economic exploitation of colonial populations rather than on knowledge production."
    },
    "B",
    "The passage identifies: (1) Western attempts to 'recover' voices may 'reproduce epistemic violence,' (2) subalterns cannot speak effectively because institutional structures prevent it (not because they lack voices), and (3) scholarly representation often 'substitutes the scholar's framework.' The inference is that representation risks reinforcing the very hierarchies it aims to dismantle. Choice B synthesizes these observations.",
    {
        "A": "Reversed Causation — Spivak's argument is precisely that Western representation is problematic because it reinforces hierarchies; encouraging more of it contradicts her thesis.",
        "C": "Misattributed Claim — The passage explicitly states subalterns cannot speak 'not because subalterns lack voices but because institutional structures prevent those voices from being heard.' The problem is structural, not cognitive.",
        "D": "Reasonable But Unsupported — The passage focuses on 'epistemic violence' and 'knowledge production,' not economic exploitation."
    }
))

# ── Q40 — Science ─────────────────────────────
questions.append(q(
    "Deep-sea hydrothermal vent communities derive energy not from photosynthesis but from chemosynthesis, in which sulfur-oxidizing bacteria convert hydrogen sulfide into organic compounds. Giant tube worms (Riftia pachyptila) lack a digestive system entirely, instead housing these chemosynthetic bacteria in a specialized organ called the trophosome. The worms' highly vascularized plume absorbs hydrogen sulfide from the vent fluid and delivers it to the trophosome, where bacterial symbionts produce the nutrients the worm requires. Intriguingly, juvenile tube worms possess a rudimentary gut that is colonized by free-living bacteria before being reabsorbed as the trophosome develops, suggesting that the symbiosis is re-established each generation rather than transmitted directly from parent to offspring.\n\n— Adapted from C. Cavanaugh et al., \"Prokaryotic cells in the hydrothermal vent tube worm Riftia pachyptila,\" Science, 1981.",
    "Based on the text, what can most reasonably be inferred about the transmission of symbiotic bacteria in Riftia pachyptila?",
    {
        "A": "Symbiotic bacteria are transmitted directly from parent tube worms to their offspring through eggs.",
        "B": "The fact that juvenile tube worms acquire symbionts through a temporary gut suggests that the bacteria are obtained from the environment each generation rather than inherited directly from parents.",
        "C": "Adult Riftia pachyptila maintain a fully functional digestive system alongside the trophosome.",
        "D": "Chemosynthetic bacteria are unnecessary for tube worm survival because vent communities also rely on photosynthesis."
    },
    "B",
    "The passage provides: (1) juveniles have a 'rudimentary gut' that is colonized by free-living bacteria, (2) this gut is later reabsorbed as the trophosome develops, and (3) this 'suggests that the symbiosis is re-established each generation rather than transmitted directly.' The inference is environmental acquisition rather than parental inheritance. Choice B synthesizes these observations.",
    {
        "A": "Reversed Causation — The passage explicitly states the symbiosis is 're-established each generation' through colonization of the juvenile gut, rather than transmitted directly from parent to offspring.",
        "C": "Misattributed Claim — The passage says adult tube worms 'lack a digestive system entirely'; the rudimentary gut exists only in juveniles and is reabsorbed.",
        "D": "Reversed Causation — The passage states these communities 'derive energy not from photosynthesis but from chemosynthesis,' making chemosynthetic bacteria essential, not unnecessary."
    }
))

# ── Q41 — Literature ──────────────────────────
questions.append(q(
    "In Jane Austen's Persuasion (1817), Captain Wentworth's letter to Anne Elliot — 'You pierce my soul. I am half agony, half hope' — is often celebrated for its emotional transparency. Yet Austen places this eruption of feeling at the end of a novel devoted to restraint, misreading, and unexpressed affection. The letter's intensity is powerful precisely because the entire preceding narrative has established how rare such directness is in the social world Austen depicts. Without the sustained pressure of repression, the release would lack its force, suggesting that Austen views candor not as a natural default but as an achievement wrested from the constraints of social convention.\n\n— Adapted from Jane Austen, Persuasion, 1817 (published posthumously, 1818).",
    "Based on the text, what can most reasonably be inferred about Austen's treatment of emotional directness in Persuasion?",
    {
        "A": "Austen treats emotional directness as the norm in her fictional social world, with repression being the rare exception.",
        "B": "Austen presents emotional candor as deriving its power from the sustained social repression that precedes it, implying that directness is a hard-won achievement rather than a default mode of interaction.",
        "C": "Wentworth's letter fails to convey genuine emotion because it is too direct for the novel's social context.",
        "D": "Austen disapproves of Wentworth's letter and positions it as a breach of proper social behavior."
    },
    "B",
    "The passage establishes: (1) the letter's intensity is 'powerful precisely because' the preceding narrative established the rarity of directness, (2) 'without the sustained pressure of repression, the release would lack its force,' and (3) candor is 'an achievement wrested from the constraints of social convention.' The inference is that directness gains meaning only against a background of restraint. Choice B synthesizes this relationship.",
    {
        "A": "Reversed Causation — The passage states the opposite: restraint and misreading are the norm; directness is 'rare' in this social world.",
        "C": "Misattributed Claim — The passage says the letter's intensity is 'powerful,' not that it fails; the text celebrates the letter's emotional force, not its inadequacy.",
        "D": "Reasonable But Unsupported — The passage does not indicate Austen's disapproval; it analyzes how the letter's power depends on the narrative structure of preceding repression."
    }
))

# ── Q42 — History/Social Studies ──────────────
questions.append(q(
    "In The Federalist No. 10, James Madison argues that the greatest danger to republican government is 'faction' — a group of citizens united by a passion or interest adverse to the rights of others. Rather than attempting to remove the causes of faction, which would require either destroying liberty or making all citizens think alike, Madison proposes controlling its effects through an extended republic. In a large republic with many diverse factions, no single group can easily form a majority tyranny because coalitions must be broad and therefore moderate. Madison's solution thus relies on multiplicity rather than unity to protect minority rights.\n\n— Adapted from James Madison, Federalist No. 10, 1787.",
    "Based on the text, what can most reasonably be inferred about why Madison favors a large republic over a small one?",
    {
        "A": "Madison believes that a large republic eliminates factions entirely by promoting national unity.",
        "B": "Madison argues that a large republic's diversity of factions makes it harder for any single faction to dominate, because majority coalitions must incorporate diverse interests and therefore tend toward moderation.",
        "C": "Madison prefers a large republic primarily because it allows the federal government to exercise unlimited power over local communities.",
        "D": "Madison favors a large republic because it makes direct democracy more practical."
    },
    "B",
    "The passage states: (1) faction is the danger, (2) removing its causes would require destroying liberty, (3) a large republic contains many diverse factions, and (4) coalitions must be 'broad and therefore moderate.' The inference is that size creates diversity, diversity prevents domination, and moderation results. Choice B synthesizes this causal chain.",
    {
        "A": "Over-Inference — Madison explicitly argues against removing factions; his solution is to control their effects, not eliminate them. Multiplicity, not unity, is his strategy.",
        "C": "Reasonable But Unsupported — The passage discusses structural protection against faction tyranny, not unlimited federal power over localities.",
        "D": "Reversed Causation — Madison's extended republic argument is about representative government, not direct democracy; a large republic makes direct democracy less practical, not more."
    }
))

# ── Q43 — Science ─────────────────────────────
questions.append(q(
    "Circadian rhythm research has demonstrated that the suprachiasmatic nucleus (SCN) of the hypothalamus serves as the master clock in mammals, synchronizing peripheral clocks in organs such as the liver, kidneys, and heart. However, feeding-schedule experiments reveal that peripheral clocks can become decoupled from the SCN: when mice are fed exclusively during their normal rest phase, liver clock gene expression shifts to align with feeding times while the SCN remains entrained to the light-dark cycle. This decoupling correlates with metabolic dysregulation, including impaired glucose tolerance and increased hepatic lipid accumulation, suggesting that misalignment between central and peripheral clocks may contribute to metabolic disease.\n\n— Adapted from F. Damiola et al., \"Restricted feeding uncouples circadian oscillators in peripheral tissues from the central pacemaker,\" Genes & Development, 2000.",
    "Based on the text, what can most reasonably be inferred about the relationship between feeding schedules and circadian clock synchrony?",
    {
        "A": "The SCN adjusts its timing to match feeding schedules, ensuring all clocks remain synchronized regardless of when meals are consumed.",
        "B": "Feeding at abnormal times can desynchronize peripheral organ clocks from the central SCN clock, and this internal misalignment is associated with metabolic dysfunction.",
        "C": "Peripheral clocks operate independently of both the SCN and feeding schedules under all conditions.",
        "D": "Metabolic disease is caused exclusively by SCN dysfunction, with peripheral clocks playing no role."
    },
    "B",
    "The passage establishes: (1) peripheral clocks shift to align with feeding while the SCN stays with light-dark, (2) this creates decoupling, and (3) decoupling 'correlates with metabolic dysregulation.' The inference is that abnormal feeding timing drives misalignment, which is associated with metabolic problems. Choice B synthesizes all three observations.",
    {
        "A": "Reversed Causation — The passage says the SCN 'remains entrained to the light-dark cycle' even when feeding shifts peripheral clocks; the SCN does NOT adjust to feeding schedules.",
        "C": "Misattributed Claim — The passage shows peripheral clocks DO respond to feeding schedules (they shift timing); they are not independent of feeding cues.",
        "D": "Over-Inference — The passage identifies the misalignment between central and peripheral clocks as a contributor; it does not claim SCN dysfunction alone causes metabolic disease or that peripheral clocks are irrelevant."
    }
))

# ── Q44 — Literature ──────────────────────────
questions.append(q(
    "In Charles Dickens's Great Expectations (1861), Pip's discovery that his benefactor is not the genteel Miss Havisham but the convict Magwitch constitutes the novel's central reversal. Dickens structures this revelation to challenge Pip's — and the reader's — assumptions about social class: the wealth that funded Pip's 'great expectations' derives from convict labor in the colonies, not from aristocratic generosity. The reversal forces Pip to confront the uncomfortable truth that his gentility is rooted in the very social stratum he has been taught to despise. Dickens thus uses the benefactor plot not merely as a surprise but as a mechanism for exposing the material foundations that polite society prefers to conceal.\n\n— Adapted from Charles Dickens, Great Expectations, 1861.",
    "Based on the text, what can most reasonably be inferred about Dickens's purpose in structuring the benefactor revelation?",
    {
        "A": "Dickens uses the revelation primarily as a plot twist to surprise readers, with no thematic significance.",
        "B": "Dickens uses the revelation to expose the concealed material origins of gentility, forcing Pip to recognize that his social elevation depends on a source his adopted values would condemn.",
        "C": "The revelation proves that Miss Havisham actively conspired with Magwitch to deceive Pip.",
        "D": "Dickens intends the revelation to celebrate the colonial system that produced Magwitch's wealth."
    },
    "B",
    "The passage identifies: (1) the revelation challenges class assumptions, (2) Pip's wealth comes from the social stratum he 'has been taught to despise,' and (3) Dickens uses the plot to 'expose material foundations that polite society prefers to conceal.' The inference is that the revelation serves a thematic purpose — unmasking gentility's hidden material basis. Choice B synthesizes all three elements.",
    {
        "A": "Misattributed Claim — The passage explicitly says Dickens uses the benefactor plot 'not merely as a surprise' but as a thematic mechanism, ruling out the purely plot-twist interpretation.",
        "C": "Reasonable But Unsupported — The passage discusses Pip's mistaken assumption about Miss Havisham but says nothing about an active conspiracy between her and Magwitch.",
        "D": "Reversed Causation — The passage describes the colonial origin of wealth as an 'uncomfortable truth' that Pip must 'confront'; this framing is critical, not celebratory."
    }
))

# ── Q45 — History/Social Studies ──────────────
questions.append(q(
    "In The Feminine Mystique (1963), Betty Friedan identifies what she calls 'the problem that has no name' — the widespread dissatisfaction among educated suburban housewives in postwar America. Friedan argues that women's magazines, Freudian psychology, and advertising conspired to define feminine fulfillment exclusively in terms of domesticity and consumption. She contends that this cultural script trapped women in a cycle of unfulfillment that they could not diagnose because their society offered no language for articulating a desire beyond homemaking. Friedan's analysis is thus both psychological and structural: the problem persists not because individual women lack will but because the cultural apparatus systematically denies the legitimacy of their aspirations.\n\n— Adapted from Betty Friedan, The Feminine Mystique, 1963.",
    "Based on the text, what can most reasonably be inferred about Friedan's explanation for why the problem 'had no name'?",
    {
        "A": "The problem had no name because it did not actually exist; Friedan invented it to sell books.",
        "B": "Friedan argues that the problem lacked a name because the cultural apparatus — media, psychology, advertising — defined feminine fulfillment so narrowly that aspirations outside domesticity were rendered linguistically and conceptually invisible.",
        "C": "The problem had no name because women in the 1950s lacked the intelligence to articulate their dissatisfaction.",
        "D": "Friedan attributes the problem entirely to individual psychological weakness rather than to cultural structures."
    },
    "B",
    "The passage states: (1) cultural forces defined fulfillment exclusively as domesticity, (2) women could not 'diagnose' their unfulfillment because society 'offered no language,' and (3) the problem is structural, not individual. The inference is that the absence of a name is itself a product of cultural suppression of alternative frameworks. Choice B synthesizes these observations.",
    {
        "A": "Reasonable But Unsupported — The passage treats the problem as real and widespread; dismissing it as invented contradicts the analytical framework presented.",
        "C": "Misattributed Claim — The passage says women were 'educated' but society offered 'no language'; the obstacle is cultural, not cognitive. Friedan specifically denies individual deficit as the explanation.",
        "D": "Reversed Causation — The passage explicitly states 'the problem persists not because individual women lack will but because the cultural apparatus systematically denies' their aspirations — this is structural, not individual."
    }
))

# ── Q46 — Science ─────────────────────────────
questions.append(q(
    "The axolotl (Ambystoma mexicanum) can regenerate entire limbs, including bone, muscle, nerves, and vasculature, a capacity lost in most adult vertebrates. Lineage-tracing experiments demonstrate that axolotl regeneration does not involve dedifferentiation into a pluripotent state: muscle cells produce only muscle, cartilage cells produce only cartilage, and Schwann cells produce only Schwann cells. Instead, the regenerating blastema — a mound of proliferating cells at the wound site — consists of a heterogeneous population of lineage-restricted progenitors. This finding challenges the widespread assumption that vertebrate regeneration requires a return to embryonic-like pluripotency and suggests that coordinated tissue restoration can occur through a modular system of lineage-faithful cells.\n\n— Adapted from E. Kragl et al., \"Cells keep a memory of their tissue origin during axolotl limb regeneration,\" Nature, 2009.",
    "Based on the text, what can most reasonably be inferred about the mechanism of axolotl limb regeneration?",
    {
        "A": "Axolotl regeneration proceeds through cells that fully revert to an embryonic stem-cell state before re-differentiating.",
        "B": "Axolotl blastema cells retain their original tissue identity and regenerate only their own cell type, indicating that limb restoration relies on coordinated lineage-restricted progenitors rather than pluripotent cells.",
        "C": "Only nerve cells are capable of contributing to axolotl limb regeneration; other cell types play no role.",
        "D": "The axolotl's regenerative ability proves that all vertebrates retain latent limb regeneration capacity."
    },
    "B",
    "The passage provides: (1) regeneration does NOT involve dedifferentiation to pluripotency, (2) each cell type produces only its own kind, and (3) the blastema is 'heterogeneous' but 'lineage-restricted.' The inference is that regeneration is modular and lineage-faithful, not pluripotent. Choice B synthesizes these findings.",
    {
        "A": "Reversed Causation — The passage explicitly states regeneration 'does not involve dedifferentiation into a pluripotent state'; this directly contradicts reverting to embryonic stem cells.",
        "C": "Misattributed Claim — The passage names muscle, cartilage, and Schwann cells as all maintaining lineage-restricted regeneration; nerve cells are one contributor among many.",
        "D": "Over-Inference — The passage describes axolotl capacity and notes it is 'lost in most adult vertebrates'; extending this to a latent universal capacity goes beyond the evidence."
    }
))

# ── Q47 — Literature ──────────────────────────
questions.append(q(
    "In Fyodor Dostoevsky's Crime and Punishment (1866), Raskolnikov's theory that extraordinary individuals are exempt from ordinary moral laws is systematically tested by the narrative itself. After murdering the pawnbroker, Raskolnikov cannot sustain the psychological isolation his theory demands; he compulsively returns to the scene of the crime, makes reckless confessions, and develops a fever that blurs the boundary between guilt and physical illness. Dostoevsky structures the novel so that the body itself — trembling, sweating, collapsing — rebels against the intellectual framework Raskolnikov has constructed, suggesting that moral law is not merely a social convention but is inscribed in embodied human experience.\n\n— Adapted from Fyodor Dostoevsky, Crime and Punishment, 1866.",
    "Based on the text, what can most reasonably be inferred about Dostoevsky's treatment of Raskolnikov's theory of the 'extraordinary individual'?",
    {
        "A": "Dostoevsky endorses Raskolnikov's theory and presents the murder as a justified act of rational self-assertion.",
        "B": "Dostoevsky uses the narrative to undermine Raskolnikov's theory by showing that his body and psyche rebel against the moral transgression his intellect tried to authorize, implying that moral law has physiological and psychological force.",
        "C": "Raskolnikov's fever is presented as a random illness unrelated to his psychological state or his crime.",
        "D": "Dostoevsky argues that all laws are merely social conventions with no deeper foundation."
    },
    "B",
    "The passage establishes: (1) Raskolnikov's theory claims exemption from moral law, (2) his body rebels (trembling, fever) against the crime, and (3) this suggests moral law is 'inscribed in embodied human experience.' The inference is that the narrative tests and undermines the theory by showing its physical and psychological costs. Choice B synthesizes this argument.",
    {
        "A": "Reversed Causation — The passage describes the narrative systematically undermining the theory through bodily rebellion; endorsing the theory contradicts the described narrative structure.",
        "C": "Misattributed Claim — The passage says the fever 'blurs the boundary between guilt and physical illness,' explicitly linking it to the crime and psychological state.",
        "D": "Reversed Causation — The passage's conclusion is that moral law is 'not merely a social convention' but has deeper, embodied foundations — the opposite of all laws being mere conventions."
    }
))

# ── Q48 — History/Social Studies ──────────────
questions.append(q(
    "In The Condition of the Working Class in England (1845), Friedrich Engels documents not only the poverty of Manchester's industrial workers but also the city's physical layout, which he argues is designed to make that poverty invisible to the middle class. Main thoroughfares are lined with shops whose facades conceal the slums behind them; a prosperous Mancunian can commute daily without ever seeing a working-class neighborhood. Engels contends that this spatial arrangement is not accidental but reflects the logic of a society that requires the exploitation it cannot bear to witness, producing what he calls a 'systematic shutting out of the working class from the thoroughfares.'\n\n— Adapted from Friedrich Engels, The Condition of the Working Class in England, 1845.",
    "Based on the text, what can most reasonably be inferred about Engels's analysis of Manchester's urban design?",
    {
        "A": "Engels views the spatial layout as a fortunate accident that happens to separate social classes.",
        "B": "Engels argues that Manchester's physical design functions as a structural mechanism of concealment, allowing the middle class to benefit from exploitation while remaining insulated from direct awareness of it.",
        "C": "Engels focuses exclusively on the health conditions of workers without discussing the city's spatial organization.",
        "D": "Engels praises Manchester's urban planning as a model of efficient industrial design."
    },
    "B",
    "The passage identifies: (1) the layout makes poverty 'invisible to the middle class,' (2) this is 'not accidental,' and (3) it reflects a society that 'requires the exploitation it cannot bear to witness.' The inference is that the urban design functions as a system of concealment enabling ignorant consumption. Choice B synthesizes these observations.",
    {
        "A": "Reversed Causation — The passage explicitly states the arrangement is 'not accidental'; calling it a 'fortunate accident' directly contradicts Engels's analysis.",
        "C": "Misattributed Claim — The passage specifically discusses the city's 'physical layout' and 'spatial arrangement' as central to Engels's argument.",
        "D": "Reversed Causation — Engels's analysis is critical, not praising; the layout enables concealment of exploitation, which he denounces."
    }
))

# ── Q49 — Science ─────────────────────────────
questions.append(q(
    "Optogenetic techniques allow neuroscientists to activate or silence specific neuron populations using light-sensitive proteins. In a recent experiment, researchers used optogenetics to activate a small population of neurons in the mouse dentate gyrus that had been active during the formation of a fear memory. Remarkably, reactivating these neurons in a neutral context caused the mice to exhibit freezing behavior — the characteristic fear response — even though no actual threat was present. When the same technique was used to activate a different, non-memory-associated set of dentate gyrus neurons, no fear response occurred, demonstrating that the behavioral response was specific to the memory-encoding population.\n\n— Adapted from X. Liu et al., \"Optogenetic stimulation of a hippocampal engram activates fear memory recall,\" Nature, 2012.",
    "Based on the text, what can most reasonably be inferred about the relationship between specific neuron populations and memory recall?",
    {
        "A": "Activating any neurons in the dentate gyrus is sufficient to trigger fear memories in mice.",
        "B": "The experiment demonstrates that reactivating the specific neurons active during memory formation is sufficient to trigger the associated behavioral response, and that this recall is population-specific rather than a general effect of dentate gyrus stimulation.",
        "C": "The experiment proves that human fear memories can be erased through optogenetic manipulation.",
        "D": "Freezing behavior in mice is caused by exposure to light, regardless of which neurons are activated."
    },
    "B",
    "The passage presents a controlled experiment: (1) activating memory-encoding neurons in a neutral context triggers freezing, (2) activating non-memory neurons does not trigger freezing. The contrast demonstrates population-specificity — the response is tied to the specific neurons that encoded the memory. Choice B synthesizes both conditions.",
    {
        "A": "Over-Inference — The control condition explicitly shows that activating non-memory neurons does NOT trigger fear, so 'any neurons' is incorrect.",
        "C": "Over-Inference — The experiment was conducted in mice, and it activated (recalled) memories rather than erasing them. Extending to human memory erasure goes far beyond the evidence.",
        "D": "Misattributed Claim — The control condition shows that light activation of a different neuron population produces no fear response, proving the effect is neuron-specific, not light-specific."
    }
))

# ── Q50 — Literature ──────────────────────────
questions.append(q(
    "In W. E. B. Du Bois's novel The Quest of the Silver Fleece (1911), the swamp serves as a contested symbolic space: for the white planter class, it represents worthless land at the margins of productive cotton country, while for the Black protagonists Bles and Zora, the swamp becomes a site of autonomous labor and self-determination. Du Bois's narration describes the cotton they grow there as possessing an almost supernatural quality — 'golden' and 'luminous' — contrasting sharply with the exploited cotton of the plantation fields. The swamp's transformation from wasteland to fertile ground under Bles and Zora's cultivation functions as a parable of the potential Du Bois sees in Black self-directed economic activity.\n\n— Adapted from W. E. B. Du Bois, The Quest of the Silver Fleece, 1911.",
    "Based on the text, what can most reasonably be inferred about Du Bois's symbolic use of the swamp in the novel?",
    {
        "A": "Du Bois uses the swamp to argue that Black Americans should avoid agriculture and pursue industrial employment instead.",
        "B": "The swamp functions as a symbol in which land deemed worthless by the dominant class becomes, through Black autonomous labor, a site of economic self-determination and creative potential, embodying Du Bois's vision of self-directed progress.",
        "C": "The swamp symbolizes the inevitability of failure for Black agricultural ventures in the post-Reconstruction South.",
        "D": "Du Bois portrays the swamp as ecologically dangerous, warning against any attempt at cultivation."
    },
    "B",
    "The passage establishes: (1) the planter class sees the swamp as 'worthless,' (2) Bles and Zora transform it into a site of 'autonomous labor and self-determination,' and (3) this transformation functions as 'a parable of the potential Du Bois sees in Black self-directed economic activity.' The inference is that the swamp symbolizes the transformative possibility of autonomous Black labor. Choice B synthesizes all three observations.",
    {
        "A": "Misattributed Claim — Du Bois's protagonists are engaged in agriculture (cotton cultivation) in the swamp; the novel celebrates this rather than advocating against agriculture.",
        "C": "Reversed Causation — The passage describes the swamp's transformation as successful and parabolic of 'potential'; inevitability of failure contradicts the narrative arc.",
        "D": "Reasonable But Unsupported — The passage presents the swamp's cultivation as yielding 'golden and luminous' cotton; no ecological danger is mentioned or implied."
    }
))


# ─────────────────────────────────────────────
# MAIN — load bank, append, save, print summary
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
    print("  ANTIGRAVITY 1600 — Inferences Injection")
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
        kw in item["prompt"].lower() for kw in ["hardy", "woolf", "chekhov", "shelley", "brontë",
                                                  "flaubert", "joyce", "austen", "melville", "twain",
                                                  "dostoevsky", "tolstoy", "eliot", "dickens",
                                                  "hawthorne", "conrad", "du bois's novel"]
    ))
    hist = sum(1 for item in questions if any(
        kw in item["prompt"].lower() for kw in ["gouges", "king jr", "beauvoir", "wollstonecraft",
                                                  "arendt", "mill", "fanon", "spivak", "césaire",
                                                  "malcolm x", "marx", "engels", "madison",
                                                  "bloch", "friedan"]
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
