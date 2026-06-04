import json
import uuid
import os
import random

def generate_q(p1, p2, correct, d1, d2, d3, exp_correct, exp_distractors, cog, traps):
    all_choices = [correct, d1, d2, d3]
    random.shuffle(all_choices)
    correct_letter = chr(65 + all_choices.index(correct))
    
    return {
        "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
        "section": "Reading and Writing",
        "domain": "Expression of Ideas",
        "skill": "Transitions",
        "difficulty": "Hard",
        "type": "MCQ",
        "targetBand": "SAT-1600",
        "prompt": f"{p1} _____ {p2}\n\nWhich choice completes the text with the most logical transition?",
        "choices": [
            {"letter": "A", "text": all_choices[0]},
            {"letter": "B", "text": all_choices[1]},
            {"letter": "C", "text": all_choices[2]},
            {"letter": "D", "text": all_choices[3]}
        ],
        "correctAnswer": correct_letter,
        "explanation": {
            "correct": exp_correct,
            "distractors": exp_distractors
        },
        "metadata": {
            "sourceSignalId": "antigravity-1600-rw-expression1",
            "generationEngine": "antigravity-master-prompt-1600",
            "cognitiveMove": cog,
            "trapTypes": traps
        }
    }

qs_data = [
    [
        "In analyzing the architectural shift from Gothic to Renaissance styles, Vasari (1550) argued that the adoption of classical proportions was driven by an aesthetic pursuit of divine symmetry, fundamentally rejecting the chaotic verticality of previous centuries.",
        "modern structural engineers have demonstrated that the transition was equally necessitated by material constraints, as the soaring heights of Gothic cathedrals had reached the absolute limits of contemporary stone masonry.",
        "Be that as it may,", "Consequently,", "By the same token,", "In other words,",
        "'Be that as it may' introduces a concession followed by a new, potentially overriding factor (material constraints) that complicates the aesthetic explanation provided by Vasari.",
        "'Consequently' incorrectly suggests the modern finding was caused by Vasari's argument. 'By the same token' suggests a parallel aesthetic argument, missing the shift to structural constraints. 'In other words' implies a restatement, which this is not.",
        "Concession into Pivot", ["Illogical Causation", "Restatement Trap"]
    ],
    [
        "Proponents of the efficient-market hypothesis (Fama, 1970) assert that financial markets perfectly assimilate all available information, rendering it impossible for investors to consistently achieve returns exceeding average market performance through fundamental analysis.",
        "the persistent success of certain value-oriented hedge funds over multi-decade horizons poses a significant empirical challenge to the theory's strictest interpretations.",
        "Nevertheless,", "Likewise,", "Hence,", "Namely,",
        "The first sentence presents a strict theoretical framework, while the second introduces an empirical anomaly that challenges it. 'Nevertheless,' accurately establishes this critical pivot.",
        "'Likewise' implies agreement. 'Hence' implies causation. 'Namely' specifies.",
        "Empirical Contrast", ["False Agreement", "Illogical Causation"]
    ],
    [
        "According to the competitive exclusion principle (Gause, 1934), two species competing for the exact same resources cannot stably coexist; the one with even the slightest reproductive advantage will eventually displace the other.",
        "field observations by Hutchinson (1961) revealed the 'paradox of the plankton,' wherein dozens of phytoplankton species cohabitate in the same homogenous aquatic environment without any single species achieving total dominance.",
        "Notwithstanding this,", "Accordingly,", "Similarly,", "To that end,",
        "'Notwithstanding this' effectively juxtaposes the theoretical principle of competitive exclusion with the contradictory field observations made by Hutchinson.",
        "'Accordingly' would mean the observation aligned with the principle. 'Similarly' implies parallel, not contrast. 'To that end' implies purposeful action towards a goal.",
        "Theoretical Constraint vs Empirical Reality", ["False Agreement", "Causal Trap"]
    ],
    [
        "Literary critics have long debated the function of the unreliable narrator in Ford Madox Ford's 'The Good Soldier' (1915), with some positing that Dowell's chronological inconsistencies are a deliberate metafictional strategy designed to highlight the subjective nature of memory.",
        "other scholars view these temporal fractures not as a sophisticated narrative device, but simply as a reflection of the protagonist's profound psychological trauma and emotional paralysis.",
        "Conversely,", "Indeed,", "Consequently,", "By the same token,",
        "The sentences contrast two differing interpretations of the novel's structure (metafictional strategy vs. psychological reflection). 'Conversely' accurately signals this shift in perspective.",
        "'Indeed' emphasizes the previous point rather than contrasting it. 'Consequently' implies causation. 'By the same token' implies an identical logic applied elsewhere.",
        "Interpretive Pivot", ["False Extension", "Illogical Causation"]
    ],
    [
        "During the Late Heavy Bombardment period approximately 4 billion years ago, the inner solar system experienced an abnormally high rate of asteroid and comet impacts, which extensively cratered the lunar surface.",
        "geologists hypothesize that these intense impacts may have delivered a substantial portion of Earth's water and vital organic molecules, paradoxically seeding the conditions for early life.",
        "Furthermore,", "In contrast,", "Therefore,", "Regardless,",
        "The first sentence introduces the destructive bombardment, while the second introduces an additional, unexpectedly creative outcome. 'Furthermore,' correctly appends this elaboration.",
        "'In contrast' introduces opposition, but delivering water is an additional effect. 'Therefore' is too strict a causation for 'may have delivered'. 'Regardless' dismisses the first point.",
        "Elaborative Extension", ["False Contrast", "Strict Causation Trap"]
    ],
    [
        "In his analysis of the 'tragedy of the commons,' Hardin (1968) posited that rational individuals acting in their self-interest will inevitably deplete shared resources, leading to collective ruin.",
        "Ostrom's (1990) subsequent field research demonstrated that numerous local communities have historically developed complex, self-governing institutional arrangements to manage common-pool resources sustainably, entirely bypassing the need for state intervention.",
        "On the contrary,", "As such,", "Likewise,", "To that end,",
        "Ostrom's findings directly contradict Hardin's theoretical inevitability. 'On the contrary' accurately establishes this direct refutation.",
        "'As such' implies a continuation or conclusion. 'Likewise' incorrectly signals agreement. 'To that end' suggests an action taken to achieve Hardin's ruin.",
        "Direct Refutation", ["False Extension", "Action-Goal Trap"]
    ],
    [
        "The fossilization of soft tissue is notoriously rare, typically requiring extremely specific anoxic conditions and rapid burial to halt the microbial decomposition that usually destroys organic material.",
        "the discovery of preserved medusoid (jellyfish) impressions in the Ediacaran biota (Narbonne, 2005) suggests that Precambrian taphonomic environments may have operated under fundamentally different chemical rules than modern marine ecosystems.",
        "Accordingly,", "In fact,", "Nevertheless,", "In conclusion,",
        "The first sentence establishes the rarity and difficulty of soft tissue preservation. The second notes a surprising discovery that defies this, requiring a pivot. 'Nevertheless' signals this unexpected exception.",
        "'Accordingly' would imply the discovery perfectly matched the usual rarity. 'In fact' could work to intensify, but 'Nevertheless' better captures the contrast between typical rarity and this specific, rule-breaking discovery. 'In conclusion' is too final.",
        "Rule vs Exception Pivot", ["False Agreement", "False Finality"]
    ],
    [
        "Classical macroeconomic theory dictates that an increase in the money supply will inherently lead to proportional inflation, assuming the velocity of money and real output remain relatively constant.",
        "the quantitative easing programs initiated after the 2008 financial crisis vastly expanded the monetary base without triggering immediate hyperinflation, prompting economists to reevaluate the behavior of institutional reserves.",
        "Yet,", "Hence,", "Correspondingly,", "Namely,",
        "The second sentence presents an empirical outcome that violates the classical theory presented in the first. 'Yet' correctly establishes this contrast.",
        "'Hence' implies the lack of inflation was caused by the classical theory. 'Correspondingly' implies the outcome matched the theory. 'Namely' is used for specification.",
        "Theoretical Violation", ["Causal Trap", "False Agreement"]
    ],
    [
        "While studying the linguistic evolution of Proto-Indo-European, scholars (Mallory, 1989) noted that the reconstructed vocabulary contains numerous terms for wheeled vehicles and domesticated horses.",
        "archaeological evidence indicates that wheeled transport was not invented until the mid-fourth millennium BCE, establishing a firm absolute chronological baseline for the divergence of the language family.",
        "Accordingly,", "Conversely,", "Even so,", "Regardless,",
        "The linguistic evidence matches the archaeological timeline to establish a baseline. 'Accordingly,' effectively maps this logical correspondence between the two disciplines.",
        "'Conversely' incorrectly suggests a contradiction. 'Even so' suggests the archaeological evidence is true despite the linguistics. 'Regardless' dismisses the linguistic data.",
        "Synthesizing Evidence", ["False Contrast", "Dismissal Trap"]
    ],
    [
        "Many sociologists argue that the rapid suburbanization of post-war America fostered an intense sense of social isolation, as sprawling residential layouts prioritized the privacy of the nuclear family over communal engagement.",
        "some urban historians point to the rise of robust voluntary associations, neighborhood watch groups, and local PTA meetings during this era as evidence that civic participation merely evolved rather than disappeared.",
        "Alternatively,", "Consequently,", "Similarly,", "For this reason,",
        "The first sentence suggests a decline in social engagement, while the second presents an alternative view that engagement merely evolved. 'Alternatively' correctly introduces this differing perspective.",
        "'Consequently' suggests the isolation caused the robust associations. 'Similarly' incorrectly suggests agreement. 'For this reason' makes an illogical causal link.",
        "Perspective Shift", ["Causal Trap", "False Extension"]
    ],
    [
        "Quantum entanglement famously defies the principle of local realism, as measuring the state of one particle instantaneously determines the state of its entangled partner, regardless of the spatial distance separating them.",
        "Einstein, Podolsky, and Rosen (1935) originally proposed this phenomenon as a reductio ad absurdum argument intended to expose the fundamental incompleteness of quantum mechanics, rather than describing a physical reality.",
        "In fact,", "By the same token,", "Conversely,", "To that end,",
        "'In fact' serves to elaborate on the strange nature of entanglement by highlighting the historical context of its bizarre reception, even by Einstein.",
        "'By the same token' implies a parallel rule. 'Conversely' implies contrast, but the EPR paradox is an elaboration on the weirdness. 'To that end' implies a goal.",
        "Historical Elaboration", ["False Parallel", "Action-Goal Trap"]
    ],
    [
        "The implementation of the 'three-field system' in medieval European agriculture significantly boosted crop yields by dedicating one-third of arable land to nitrogen-fixing legumes like peas and beans.",
        "this crucial innovation mitigated the risk of catastrophic famine, as the diverse planting schedule meant that a localized blight affecting one crop would not necessarily obliterate the entire seasonal harvest.",
        "Furthermore,", "Nevertheless,", "In contrast,", "Alternatively,",
        "The second sentence extends the positive effects of the three-field system (boosting yields AND mitigating famine). 'Furthermore' correctly adds this point.",
        "'Nevertheless' incorrectly introduces a contrast to the positive first sentence. 'In contrast' does the same. 'Alternatively' suggests a substitute, not an addition.",
        "Additive Benefit", ["False Contrast", "Substitution Trap"]
    ],
    [
        "Early interpretations of the Maya collapse (c. 900 CE) heavily favored monocausal explanations, such as a cataclysmic drought or sudden foreign invasion that entirely decimated the lowland population.",
        "contemporary archaeologists (Demarest, 2004) advocate for a complex systems approach, arguing that subtle ecological degradation, shifting trade routes, and endemic elite warfare operated synergistically over several centuries.",
        "In contrast,", "Accordingly,", "Namely,", "As such,",
        "The first sentence describes monocausal, sudden explanations, while the second describes multicausal, gradual explanations. 'In contrast' perfectly captures this shift in scholarly consensus.",
        "'Accordingly' would mean the modern view aligns with the old view. 'Namely' suggests the modern view is a specific example of the old view. 'As such' implies consequence.",
        "Scholarly Pivot", ["False Agreement", "False Specification"]
    ],
    [
        "In behavioral psychology, operant conditioning suggests that behaviors followed by positive reinforcement will be executed with increasing frequency and intensity.",
        "if the reinforcement is delivered on a strictly continuous schedule, the subject may experience rapid satiation, leading to an unexpected and precipitous decline in the target behavior.",
        "However,", "Therefore,", "Likewise,", "In essence,",
        "The second sentence introduces an exception to the rule in the first sentence (satiation leading to decline). 'However' introduces this critical caveat.",
        "'Therefore' incorrectly suggests the positive reinforcement naturally causes the decline. 'Likewise' implies similarity. 'In essence' implies a summary.",
        "Caveat / Condition", ["Causal Trap", "Summary Trap"]
    ],
    [
        "The neoclassical architectural movement of the 18th century sought to visually articulate the rationalist ideals of the Enlightenment, heavily utilizing austere geometries and rejecting the ornate frivolity of the Rococo style.",
        "the movement's insistence on absolute symmetry often compromised the practical interior functionality of buildings, forcing architects to conceal necessary asymmetrical domestic spaces behind rigid, uniform facades.",
        "That being said,", "Thus,", "Similarly,", "Namely,",
        "The first sentence praises the ideological purity of the style, while the second introduces a pragmatic drawback. 'That being said' effectively bridges the ideological goal with the practical concession.",
        "'Thus' implies the structural problems were the intended result of the Enlightenment ideals. 'Similarly' misses the contrast. 'Namely' specifies, it doesn't contrast.",
        "Ideology vs Pragmatism", ["Causal Trap", "False Parallel"]
    ],
    [
        "In epidemiology, the basic reproduction number (R0) calculates the expected number of secondary infections generated by a single infectious individual in a completely susceptible population.",
        "this metric alone is insufficient for predicting a pathogen's real-world spread, as it fundamentally fails to account for heterogeneous mixing patterns, existing immunity, and behavioral interventions.",
        "Crucially,", "Consequently,", "Granted,", "In other words,",
        "The first sentence defines the metric. The second highlights a profound limitation. 'Crucially,' correctly emphasizes this vital caveat.",
        "'Consequently' suggests the definition causes the insufficiency. 'Granted' is a concession, but the second sentence isn't conceding, it's critiquing. 'In other words' is a restatement.",
        "Definitional Critique", ["Causal Trap", "Restatement Trap"]
    ],
    [
        "Many political theorists argue that the proliferation of bilateral trade agreements inherently destabilizes global economic integration by creating fragmented, overlapping regulatory environments known as the 'spaghetti bowl effect.'",
        "some economists (Bhagwati, 1995) contend that these targeted agreements can actually serve as essential 'building blocks,' progressively familiarizing hesitant nations with liberalization before they commit to larger multilateral frameworks.",
        "Conversely,", "Therefore,", "Indeed,", "By the same token,",
        "The first sentence presents a negative view of bilateral agreements, while the second presents a positive 'building block' view. 'Conversely' appropriately introduces the opposing argument.",
        "'Therefore' implies the negative effect causes the positive effect. 'Indeed' would reinforce the negative view. 'By the same token' implies agreement.",
        "Opposing Viewpoints", ["Causal Trap", "False Reinforcement"]
    ],
    [
        "The principle of parsimony, or Occam's razor, dictates that when confronted with multiple competing hypotheses that predict the same outcome, scientists should select the one that makes the fewest assumptions.",
        "in the realm of evolutionary biology, specifically regarding horizontal gene transfer, the most parsimonious phylogenetic tree often contradicts overwhelming molecular evidence, forcing researchers to accept highly complex historical pathways.",
        "Be that as it may,", "Hence,", "Likewise,", "In doing so,",
        "The first introduces a general rule (parsimony). The second introduces a specific field where the rule fails. 'Be that as it may' (or 'However') perfectly transitions from the rule to the exception.",
        "'Hence' implies the rule causes the contradiction. 'Likewise' implies the rule works similarly in biology. 'In doing so' suggests a sequential action.",
        "Rule vs Exception", ["Causal Trap", "Action-Goal Trap"]
    ],
    [
        "Post-colonial literature often utilizes the narrative technique of 'abrogation'—the deliberate rejection of standard metropolitan linguistic norms—to reclaim cultural autonomy and decentralize the imperial power structure.",
        "authors like Chinua Achebe chose to master and subvert the colonizer's language from within, demonstrating that linguistic appropriation could be just as potent a tool for anti-colonial resistance as outright rejection.",
        "Alternatively,", "Consequently,", "Similarly,", "In particular,",
        "Abrogation (rejection) is contrasted with Achebe's approach (appropriation). 'Alternatively' introduces this distinct methodological approach to the same goal.",
        "'Consequently' implies abrogation caused Achebe's approach. 'Similarly' glosses over the fundamental difference between rejection and appropriation. 'In particular' incorrectly frames Achebe as an example of abrogation.",
        "Methodological Contrast", ["False Specification", "False Parallel"]
    ],
    [
        "In materials science, the addition of carbon to iron significantly increases the tensile strength and hardness of the resulting steel alloy by disrupting the regular sliding of the iron crystal lattice.",
        "this increased hardness inevitably reduces the metal's ductility, rendering high-carbon steel far more brittle and susceptible to catastrophic structural failure under sudden impact.",
        "At the same time,", "Accordingly,", "Namely,", "To reiterate,",
        "The first sentence describes a positive effect of carbon. The second describes a simultaneous negative tradeoff. 'At the same time' beautifully captures this dual nature.",
        "'Accordingly' would imply the brittleness is a logical extension of the goal, rather than a tradeoff. 'Namely' specifies. 'To reiterate' repeats.",
        "Tradeoff Introduction", ["Goal-Extension Trap", "Restatement Trap"]
    ],
    [
        "According to the dopamine hypothesis of schizophrenia, the disorder's positive symptoms—such as auditory hallucinations and delusions—are primarily driven by hyperactive dopaminergic signaling in the mesolimbic pathway.",
        "third-generation antipsychotics, which act as partial agonists rather than full antagonists at dopamine receptors, have proven remarkably effective at stabilizing patients without inducing severe motor side effects.",
        "Correspondingly,", "Nevertheless,", "On the contrary,", "In contrast,",
        "The symptoms are driven by hyperactive dopamine, and a drug reducing that activity naturally works. 'Correspondingly,' effectively maps this consistent pharmacological application.",
        "'Nevertheless' suggests the drug's success contradicts the hypothesis. 'On the contrary' and 'In contrast' also incorrectly suggest a contradiction to the hypothesis.",
        "Hypothesis and Consistent Application", ["False Contrast", "Opposition Trap"]
    ],
    [
        "The ratification of the 14th Amendment in 1868 fundamentally altered American constitutional law by introducing the Equal Protection Clause, which theoretically guaranteed absolute legal parity for all citizens.",
        "the subsequent Supreme Court ruling in Plessy v. Ferguson (1896) institutionalized the 'separate but equal' doctrine, functionally neutralizing the Amendment's egalitarian promise for decades.",
        "However,", "Thus,", "In fact,", "By the same token,",
        "The first sentence sets up a theoretical legal guarantee. The second describes a ruling that destroyed that guarantee. 'However' introduces the functional contradiction.",
        "'Thus' implies the 14th Amendment caused the racist ruling. 'In fact' might work if emphasizing, but 'However' is the stronger pivot. 'By the same token' implies a parallel.",
        "Theoretical vs Functional Pivot", ["Causal Trap", "False Parallel"]
    ],
    [
        "In the study of oceanic currents, the Coriolis effect dictates that large-scale fluid movements will be deflected to the right in the Northern Hemisphere and to the left in the Southern Hemisphere, profoundly shaping global climate systems.",
        "at the equator, the Coriolis force drops precisely to zero, completely preventing the formation of cyclonic weather systems like hurricanes within five degrees of latitude of the equator.",
        "Consequently,", "Even so,", "Conversely,", "Similarly,",
        "The first sentence defines the general rule, and the second describes a specific consequence of the physical parameters. 'Consequently,' perfectly maps this causal outcome.",
        "'Even so' implies hurricanes should form despite the lack of force. 'Conversely' implies a contrast with the rule, but it's a direct result of the physics. 'Similarly' misses the unique nature of the equator.",
        "Physical Consequence", ["False Contrast", "Concession Trap"]
    ],
    [
        "Philosopher John Rawls (1971) proposed the 'veil of ignorance' as a thought experiment, arguing that individuals designing a society without knowing their eventual class or race would naturally formulate strictly egalitarian policies.",
        "critics like Nozick (1974) maintained that this artificial abstraction from historical reality fundamentally ignores the intrinsic human right to self-ownership and the just acquisition of unequal property.",
        "In contrast,", "Therefore,", "Namely,", "Ultimately,",
        "Rawls proposes an egalitarian thought experiment. Nozick criticizes it. 'In contrast' clearly establishes the opposing philosophical stance.",
        "'Therefore' implies Rawls caused Nozick's exact theory. 'Namely' incorrectly specifies. 'Ultimately' suggests a final synthesis, which this is not.",
        "Philosophical Opposition", ["Causal Trap", "False Synthesis"]
    ],
    [
        "During the Renaissance, the rediscovery of Vitruvius's text *De architectura* convinced many humanists that classical Roman structures were inherently superior because their proportions mathematically mirrored the idealized human body.",
        "many modern historians argue that this anatomical analogy was largely a retrospective intellectual justification, an attempt to map philosophical grandeur onto what were merely pragmatic engineering solutions.",
        "Conversely,", "Therefore,", "Indeed,", "To that end,",
        "The sentences contrast the historical Renaissance justification with modern skepticism. 'Conversely,' precisely signals this historiographical reinterpretation.",
        "'Rather' implies a replacement of the previous sentence's subject. 'Indeed' implies agreement. 'To that end' implies a purposeful action based on the first sentence.",
        "Historical Reinterpretation", ["False Agreement", "Action-Goal Trap"]
    ],
    [
        "The advent of the CRISPR-Cas9 genome editing system drastically reduced the financial cost and technical barriers associated with modifying specific DNA sequences in vivo.",
        "the technology's propensity for introducing unpredictable 'off-target' mutations has severely stymied its immediate application in human clinical therapeutics, relegating it primarily to laboratory research.",
        "Nevertheless,", "Accordingly,", "Similarly,", "In particular,",
        "CRISPR is cheap and easy (positive). Off-target mutations stymie its clinical use (negative). 'Nevertheless' introduces this critical limitation.",
        "'Accordingly' would imply the off-target mutations were the intended result of the low cost. 'Similarly' implies parallel. 'In particular' incorrectly specifies.",
        "Advantage vs Limitation", ["Causal Trap", "False Specification"]
    ],
    [
        "In analyzing visual art, formalist critics prioritize intrinsic compositional elements—such as line, color, and texture—arguing that a painting's aesthetic value is entirely independent of its historical context or narrative content.",
        "Marxist art historians assert that focusing exclusively on form acts as a bourgeois smokescreen, intentionally obscuring the socio-economic labor conditions that facilitated the artwork's creation.",
        "Conversely,", "Hence,", "Likewise,", "In essence,",
        "Formalists ignore context; Marxists demand context. 'Conversely' highlights the diametric opposition between the two critical methodologies.",
        "'Hence' suggests formalists caused the Marxist methodology. 'Likewise' implies agreement. 'In essence' implies a summary.",
        "Methodological Opposition", ["Causal Trap", "Summary Trap"]
    ],
    [
        "The Sapir-Whorf hypothesis, in its strongest form, posits that the syntactic structure and vocabulary of a person's native language strictly determine their cognitive paradigms and limits of perception.",
        "extensive cognitive linguistics research over the past fifty years has decisively debunked linguistic determinism, proving that bilingual individuals do not fundamentally alter their sensory perception when switching languages.",
        "In reality,", "Consequently,", "Granted,", "Regardless,",
        "The second sentence decisively refutes the hypothesis presented in the first. 'In reality,' effectively introduces this empirical correction.",
        "'Indeed' typically reinforces the preceding statement. 'Consequently' implies the hypothesis caused its own debunking. 'Granted' concedes.",
        "Hypothesis vs Reality", ["Reinforcement Trap", "Concession Trap"]
    ],
    [
        "The standard model of particle physics elegantly unifies the electromagnetic, weak, and strong nuclear forces into a single theoretical framework, accurately predicting the existence of the Higgs boson decades before its empirical discovery.",
        "the model remains fundamentally incomplete; it cannot mathematically incorporate the force of gravity, nor can it account for the existence of dark matter, which constitutes the vast majority of the universe's mass.",
        "That being said,", "Therefore,", "Correspondingly,", "To reiterate,",
        "The standard model is deeply successful (first sentence). The model is fundamentally incomplete (second sentence). 'That being said' (or 'However') effectively transitions to the model's profound limitations.",
        "'Therefore' implies the success caused the incompleteness. 'Correspondingly' implies the incompleteness aligns with the success. 'To reiterate' means to say again.",
        "Success vs Limitation", ["Causal Trap", "False Parallel"]
    ],
    [
        "Classical utilitarianism, as articulated by Jeremy Bentham, argues that the moral worth of an action is determined solely by its capacity to maximize overall aggregate happiness, regardless of the individual pain inflicted to achieve it.",
        "Deontological ethics, championed by Immanuel Kant, insists that certain actions are intrinsically immoral—such as the violation of fundamental human rights—even if they generate a massive net increase in societal pleasure.",
        "In contrast,", "Thus,", "Similarly,", "Namely,",
        "Utilitarianism focuses on outcomes; Deontology focuses on intrinsic rules. 'In contrast' beautifully sets up this classic philosophical dichotomy.",
        "'Thus' implies utilitarianism causes deontology. 'Similarly' ignores the fundamental clash. 'Namely' specifies.",
        "Philosophical Dichotomy", ["Causal Trap", "False Parallel"]
    ],
    [
        "During the carboniferous period, the proliferation of massive, woody trees resulted in a massive sequestration of atmospheric carbon dioxide, drastically lowering global temperatures and contributing to extensive glaciation.",
        "the immense accumulation of un-decayed lignin in stagnant swamps laid the biochemical foundation for the vast underground coal reserves that currently fuel modern industrial society.",
        "Furthermore,", "Conversely,", "Regardless,", "Nevertheless,",
        "The trees lowered temperatures (effect 1). The trees created coal reserves (effect 2). 'Furthermore' correctly links these two independent consequences of the same phenomenon.",
        "'Conversely' incorrectly suggests a contradiction. 'Regardless' dismisses the temperature effect. 'Nevertheless' implies the coal formed despite the glaciation.",
        "Compound Consequence", ["False Contrast", "Dismissal Trap"]
    ],
    [
        "In macroeconomics, a purely floating exchange rate theoretically insulates a nation's domestic monetary policy from foreign shocks, allowing central banks to independently adjust interest rates to manage local inflation.",
        "in heavily globalized economies, abrupt currency depreciations can instantly inflate the cost of imported raw materials, forcing central banks to react to international pressures despite their theoretical autonomy.",
        "In practice,", "Accordingly,", "Likewise,", "To that end,",
        "The first sentence presents theoretical insulation. The second sentence presents practical vulnerability. 'In practice,' directly establishes this theory-vs-reality pivot.",
        "'Accordingly' would imply the vulnerability is a logical extension of the insulation. 'Likewise' implies similarity. 'To that end' implies a goal-oriented action.",
        "Theory vs Practice", ["Extension Trap", "Action-Goal Trap"]
    ],
    [
        "Many interpretations of the Cold War frame it as a strictly bipolar ideological struggle between the democratic capitalism of the United States and the state communism of the Soviet Union.",
        "the Non-Aligned Movement, spearheaded by nations like India and Yugoslavia, actively resisted this binary categorization, frequently leveraging the superpower rivalry to secure independent economic development and regional sovereignty.",
        "Nevertheless,", "Hence,", "By the same token,", "Namely,",
        "The first sentence presents a bipolar view. The second introduces actors who resisted that view. 'Nevertheless,' appropriately introduces this historical counter-narrative.",
        "'Hence' implies the bipolar view created the resistance without acknowledging the contrast. 'By the same token' implies parallel agreement.",
        "Historical Counter-narrative", ["Causal Trap", "False Extension"]
    ],
    [
        "When assessing ecological resilience, scientists often look at 'functional redundancy'—the presence of multiple distinct species that perform identical roles, such as nitrogen fixation, within a given ecosystem.",
        "if an environmental stressor like extreme drought disproportionately targets one of these species, the ecosystem can seamlessly rely on the unaffected parallel species to maintain its critical biogeochemical cycles.",
        "Consequently,", "Granted,", "In contrast,", "Alternatively,",
        "The functional redundancy (first sentence) causes the ecosystem to survive the stressor seamlessly (second sentence). 'Consequently' perfectly maps this causal relationship.",
        "'Granted' introduces a concession. 'In contrast' suggests a failure of resilience. 'Alternatively' suggests a different option, not the result of the redundancy.",
        "Functional Causality", ["Concession Trap", "False Contrast"]
    ],
    [
        "The literary movement of Naturalism heavily relied on deterministic philosophy, portraying human beings as largely helpless creatures strictly governed by their biological heredity and inescapable socioeconomic environments.",
        "authors like Émile Zola frequently infused their narratives with a palpable sense of moral outrage regarding systemic poverty, implicitly suggesting that societal reform was both necessary and possible.",
        "Paradoxically,", "Therefore,", "Similarly,", "Namely,",
        "Naturalism is deterministic (no free will/change is impossible). Zola suggests reform is possible. 'Paradoxically' perfectly captures the tension between the philosophy and the author's tone.",
        "'Therefore' implies determinism causes reform, which is contradictory. 'Similarly' misses the philosophical conflict. 'Namely' specifies without acknowledging the tension.",
        "Philosophical Tension", ["Causal Trap", "False Parallel"]
    ],
    [
        "The discovery of the cosmic microwave background (CMB) radiation in 1965 provided overwhelming empirical support for the Big Bang theory, effectively discrediting the competing Steady State model of the universe.",
        "subsequent, highly detailed measurements of the CMB's minute temperature fluctuations have allowed astrophysicists to precisely calculate the universe's age, geometry, and exact dark matter composition.",
        "Moreover,", "Nevertheless,", "In contrast,", "Admittedly,",
        "The CMB disproved the Steady State model (first achievement). The CMB measurements allow precise cosmological calculations (second achievement). 'Moreover' correctly strings these additive scientific victories.",
        "'Nevertheless' suggests the second achievement happened despite the first. 'In contrast' suggests a failure. 'Admittedly' is for concession.",
        "Scientific Accumulation", ["False Concession", "False Contrast"]
    ],
    [
        "In modern contract law, the doctrine of 'promissory estoppel' allows a court to enforce a promise even if a formal legal contract was never finalized, provided the promisee reasonably relied on that promise to their profound financial detriment.",
        "this equitable doctrine prevents a promisor from exploiting a technical lack of consideration to walk away from an agreement after the other party has already incurred significant costs.",
        "Essentially,", "Conversely,", "However,", "Nevertheless,",
        "The second sentence merely unpacks the practical intent and definition of the legal doctrine introduced in the first sentence. 'Essentially' accurately signals this elaborative clarification.",
        "'Conversely' and 'However' signal an opposition that does not exist. 'Nevertheless' implies the doctrine works despite the first sentence.",
        "Elaborative Clarification", ["False Contrast", "Opposition Trap"]
    ],
    [
        "Early sociological theories of assimilation posited a 'straight-line' trajectory, wherein immigrants to the United States would inevitably shed their distinct ethnic markers over several generations to seamlessly merge into the white middle class.",
        "contemporary researchers advocate for 'segmented assimilation,' observing that structural economic barriers frequently force certain immigrant cohorts to assimilate into marginalized, impoverished underclasses rather than the dominant mainstream.",
        "Instead,", "Thus,", "Accordingly,", "Similarly,",
        "Straight-line theory predicts merging into the middle class. Segmented assimilation observes merging into the underclass. 'Instead' sets up the modern, contrasting sociological observation.",
        "'Thus' and 'Accordingly' imply the new theory is a logical result of the old one. 'Similarly' completely ignores the stark difference in outcomes.",
        "Theoretical Shift", ["Causal Trap", "False Parallel"]
    ],
    [
        "The use of 'soft power'—the ability to influence international relations through cultural appeal, democratic values, and diplomatic institutions—allows a nation to achieve strategic objectives without resorting to military coercion.",
        "the global export of American cinema and popular music during the 20th century functioned as a potent, non-violent geopolitical asset, subtly cultivating ideological sympathies far beyond the reach of formal diplomacy.",
        "For instance,", "On the other hand,", "Regardless,", "Even so,",
        "The first sentence defines soft power. The second sentence provides American cinema as a specific historical application of it. 'For instance' correctly signals the example.",
        "'On the other hand' introduces a contrast. 'Regardless' dismisses the definition. 'Even so' introduces a concession.",
        "Specific Application", ["False Contrast", "Dismissal Trap"]
    ],
    [
        "When engineering aerodynamic surfaces, reducing form drag often requires smoothing the object's profile to delay flow separation, creating a sleek, highly streamlined shape.",
        "the intentional addition of microscopic surface roughness, such as the dimples on a golf ball, can actually induce a turbulent boundary layer that paradoxically dramatically reduces overall drag at high velocities.",
        "Counterintuitively,", "Hence,", "Likewise,", "To that end,",
        "Smooth surfaces reduce drag, but rough surfaces can also reduce drag under specific conditions. 'Counterintuitively,' perfectly introduces this engineering paradox.",
        "'Hence' implies smoothness causes roughness. 'Likewise' implies agreement but ignores the apparent contradiction. 'To that end' implies a goal.",
        "Engineering Paradox", ["Causal Trap", "False Parallel"]
    ],
    [
        "The ratification of the Treaty of Versailles explicitly assigned absolute moral and financial guilt for World War I to Germany, imposing ruinous reparation schedules designed to permanently cripple its industrial capacity.",
        "Keynes (1919) vehemently argued that these punitive economic measures would inevitably destabilize the entire European continent, creating the desperate socioeconomic conditions necessary for radical authoritarianism to flourish.",
        "Presciently,", "Granted,", "Similarly,", "In particular,",
        "The treaty assigned ruinous reparations. Keynes accurately predicted the disastrous outcome of those reparations. 'Presciently,' characterizes the foresight of his argument.",
        "'Granted' is a concession. 'Similarly' implies parallel. 'In particular' specifies.",
        "Historical Response", ["Concession Trap", "False Specification"]
    ],
    [
        "In evolutionary biology, 'convergent evolution' occurs when distantly related organisms independently evolve striking structural similarities, such as the streamlined bodies of sharks and dolphins.",
        "these analogous traits are not derived from a shared genetic ancestor, but rather represent optimal, independent engineering solutions to the identical physical constraints of high-speed aquatic locomotion.",
        "Crucially,", "Thus,", "Alternatively,", "Regardless,",
        "The first sentence introduces the concept. The second clarifies a key mechanical nuance (not a shared ancestor, but environmental constraint). 'Crucially' effectively highlights this important definitional distinction.",
        "'Thus' implies the lack of an ancestor is caused by the convergence. 'Alternatively' implies another option. 'Regardless' dismisses the previous point.",
        "Nuance / Clarification", ["Causal Trap", "Alternative Trap"]
    ],
    [
        "The widespread adoption of Agile software development methodologies prioritized rapid iteration, continuous delivery, and highly flexible response to shifting client requirements over exhaustive upfront planning.",
        "this intense focus on speed and adaptability occasionally results in massive accumulations of 'technical debt,' as developers bypass optimal long-term architectural designs to meet immediate, frantic sprint deadlines.",
        "Unfortunately,", "Therefore,", "Correspondingly,", "Namely,",
        "Agile brings rapid iteration (positive intent). It also brings technical debt (negative outcome). 'Unfortunately' perfectly introduces the negative consequence of the methodology.",
        "'Therefore' implies the speed logically mandates the debt, which is too strong (it 'occasionally results'). 'Correspondingly' implies a positive parallel. 'Namely' specifies.",
        "Negative Consequence", ["Strict Causation Trap", "False Specification"]
    ],
    [
        "Historically, linguistic prescriptivism—the rigid enforcement of standardized grammar rules—was utilized by elite institutions to effectively marginalize working-class dialects and solidify socioeconomic hierarchies.",
        "modern sociolinguists heavily favor a descriptivist approach, meticulously documenting how language is naturally utilized in diverse communities without attempting to impose arbitrary, moralizing strictures on its evolution.",
        "In contrast,", "As a result,", "Indeed,", "By the same token,",
        "Prescriptivism enforces rules (first sentence). Descriptivism documents natural use (second sentence). 'In contrast' perfectly juxtaposes these two opposing linguistic philosophies.",
        "'As a result' incorrectly suggests the prescriptivism caused the descriptivism. 'Indeed' suggests agreement. 'By the same token' suggests parallel application.",
        "Philosophical Juxtaposition", ["Causal Trap", "False Parallel"]
    ],
    [
        "In the realm of quantum computing, maintaining the delicate state of superposition required for complex calculations necessitates chilling the processor core to temperatures colder than deep space to minimize thermal interference.",
        "engineers must shield the sensitive quantum bits from even the faintest stray electromagnetic radiation, as a single ambient photon can collapse the system and instantly erase the ongoing computation.",
        "Furthermore,", "Nevertheless,", "Conversely,", "Alternatively,",
        "Requires extreme chilling (constraint 1). Requires electromagnetic shielding (constraint 2). 'Furthermore' correctly links these additive engineering constraints.",
        "'Nevertheless' implies the shielding happens despite the chilling. 'Conversely' implies contrast. 'Alternatively' implies you can do one OR the other.",
        "Additive Constraints", ["Opposition Trap", "Alternative Trap"]
    ],
    [
        "During the Gilded Age, the explosive expansion of the American railroad network created unprecedented national markets, allowing industrial conglomerates to achieve staggering economies of scale and amass unimaginable wealth.",
        "this rapid, virtually unregulated monopolization systematically decimated small-scale regional manufacturers, artificially inflated freight rates for struggling agrarian communities, and precipitated intense, violent labor strikes.",
        "At the same time,", "Accordingly,", "Namely,", "In essence,",
        "The railroads brought massive wealth and scale (positive). They also destroyed local economies and caused strikes (negative). 'At the same time' links the simultaneous positive and negative impacts of the same historical phenomenon.",
        "'Accordingly' incorrectly suggests the destruction was the intended result of the wealth. 'Namely' incorrectly specifies. 'In essence' incorrectly summarizes.",
        "Simultaneous Impacts", ["Goal-Extension Trap", "Summary Trap"]
    ],
    [
        "The psychological phenomenon of 'groupthink' typically occurs in highly cohesive, isolated groups, where the immense social pressure to maintain internal harmony completely overrides the individuals' motivation to realistically appraise alternative courses of action.",
        "this dynamic frequently culminates in catastrophic, hyper-risky decision-making, as dissenting voices are aggressively suppressed and the group convinces itself of its inherent invulnerability.",
        "Consequently,", "Granted,", "In contrast,", "Alternatively,",
        "Groupthink overrides appraisal of alternatives (condition). It results in catastrophic decision-making (result). 'Consequently' perfectly maps this cause-and-effect relationship.",
        "'Granted' introduces a concession. 'In contrast' introduces an opposition. 'Alternatively' implies a different choice.",
        "Psychological Causality", ["Concession Trap", "Alternative Trap"]
    ],
    [
        "When implementing machine learning algorithms in criminal justice risk assessments, designers often unintentionally utilize highly correlated proxy variables, such as zip codes, to circumvent legal prohibitions against explicit racial profiling.",
        "these superficially neutral algorithms frequently replicate and mathematically launder historical systemic biases, resulting in wildly disproportionate incarceration recommendations for minority defendants.",
        "Ultimately,", "Conversely,", "Likewise,", "To that end,",
        "Designers use proxy variables (action). The algorithms launder bias and punish minorities (final outcome). 'Ultimately' correctly introduces the final, sweeping consequence of the action.",
        "'Conversely' suggests a contrast, but the outcome is a direct result of the proxy variables. 'Likewise' implies a parallel. 'To that end' implies the racial bias was the explicit goal.",
        "Final Consequence", ["False Contrast", "Explicit Goal Trap"]
    ],
    [
        "The theory of plate tectonics postulates that the Earth's lithosphere is divided into massive, constantly shifting rigid plates, floating upon the slowly churning, highly viscous asthenosphere beneath.",
        "when two continental plates collide at a convergent boundary, their relatively low density prevents them from deeply subducting, forcing the landmass to dramatically buckle upwards and form immense mountain ranges like the Himalayas.",
        "Specifically,", "In contrast,", "Nevertheless,", "By the same token,",
        "The first sentence presents the broad theory of plate tectonics. The second sentence presents a highly detailed, specific mechanical example of the theory in action. 'Specifically' correctly signals this narrowing of focus.",
        "'In contrast' implies opposition. 'Nevertheless' implies the mountains form despite the theory. 'By the same token' implies a parallel rule, not an example.",
        "Broad to Specific", ["Opposition Trap", "Parallel Trap"]
    ],
    [
        "In art conservation, the application of highly synthetic acrylic varnishes in the mid-20th century was initially celebrated because the transparent polymers theoretically provided superior long-term UV protection for classical oil paintings.",
        "decades of exposure to gallery lighting caused these untested synthetic layers to cross-link and irreversibly fuse with the underlying, centuries-old original paint, rendering safe removal completely impossible.",
        "Regrettably,", "Accordingly,", "Likewise,", "In essence,",
        "Acrylics were celebrated for protection (initial hope). They fused and ruined the paintings (unfortunate reality). 'Regrettably' beautifully captures the shift from initial optimism to disastrous outcome.",
        "'Accordingly' implies the fusion was the intended result. 'Likewise' implies agreement. 'In essence' implies a summary of the first point.",
        "Optimism to Failure", ["Goal-Extension Trap", "Summary Trap"]
    ],
    [
        "In his seminal defense of the newly drafted United States Constitution, James Madison argued in Federalist No. 10 that the vast geographic expanse of the republic would inherently prevent any single tyrannical faction from consolidating absolute political power.",
        "prominent Anti-Federalists vehemently countered that historically, expansive republics inevitably required highly centralized, standing armies to maintain order, thereby guaranteeing the eventual destruction of localized civic liberties.",
        "On the contrary,", "Consequently,", "Similarly,", "For this reason,",
        "Madison argues size prevents tyranny. Anti-Federalists argue size guarantees tyranny. 'On the contrary' accurately maps this direct, fundamental ideological opposition.",
        "'Consequently' implies Madison's argument caused the Anti-Federalists' theory. 'Similarly' implies agreement. 'For this reason' implies causation.",
        "Ideological Opposition", ["Causal Trap", "False Parallel"]
    ],
    [
        "Upon their initial publication, Beethoven's late string quartets were widely dismissed by contemporary critics as the chaotic, incomprehensible noise of a tragically deaf composer who had completely lost touch with musical form.",
        "subsequent generations of avant-garde composers, including Stravinsky, revered these exact same dense, highly fragmented compositions as profound visionary masterpieces that single-handedly birthed modern harmonic theory.",
        "Over time,", "Therefore,", "Correspondingly,", "Namely,",
        "Initial critical dismissal gives way to later reverence by future generations. 'Over time,' effectively transitions between these temporally separated critical paradigms.",
        "'Therefore' incorrectly suggests the initial dismissal caused the later reverence. 'Correspondingly' implies parallel agreement. 'Namely' specifies.",
        "Temporal Shift", ["Causal Trap", "False Parallel"]
    ],
    [
        "The concept of a 'keystone species' suggests that certain predators, despite having relatively low population numbers, exert a massively disproportionate, top-down regulatory influence on the overall structure of their ecological community.",
        "the artificial removal of gray wolves from Yellowstone National Park resulted in an explosive overpopulation of elk, which rapidly overgrazed riparian flora and drastically altered the physical flow of local rivers.",
        "For instance,", "Nevertheless,", "In contrast,", "Alternatively,",
        "The first sentence defines the theoretical concept of a keystone species. The second sentence provides a textbook historical example of the concept in action. 'For instance,' is the perfect transition.",
        "'Nevertheless' suggests the wolves' removal contradicted the theory. 'In contrast' introduces a false opposition. 'Alternatively' suggests a different option.",
        "Theory to Example", ["Opposition Trap", "Alternative Trap"]
    ],
    [
        "According to foundational microeconomic theory, the demand for a specific consumer good will predictably decrease as its market price increases, reflecting rational consumer behavior and budget constraints.",
        "so-called 'Veblen goods,' such as hyper-luxury watches and designer handbags, experience a paradoxical surge in demand exactly when their prices are artificially inflated, as the exorbitant cost itself serves to signal the buyer's exclusive social status.",
        "However,", "Hence,", "Likewise,", "To that end,",
        "The first sentence presents the standard law of demand. The second presents an economic anomaly (Veblen goods) that violates this law. 'However,' introduces this stark theoretical exception.",
        "'Hence' implies the law of demand causes the anomaly. 'Likewise' implies parallel behavior. 'To that end' implies a goal-oriented continuation.",
        "Theoretical Exception", ["Causal Trap", "Parallel Trap"]
    ],
    [
        "When desperate linguistic groups with entirely mutually unintelligible native tongues are forced into sustained economic contact, they frequently develop a 'pidgin'—a drastically simplified, rudimentary communication system completely lacking complex grammatical syntax.",
        "when the children of these diverse populations natively acquire this rudimentary system as their first language, they instinctively embed complex syntactic rules, rapidly evolving the impoverished pidgin into a fully functional, highly structured 'creole.'",
        "Remarkably,", "Accordingly,", "Similarly,", "In particular,",
        "A pidgin has no grammar. A creole suddenly has complex grammar added by children. 'Remarkably,' captures the astounding, spontaneous cognitive leap described in the second sentence.",
        "'Accordingly' would imply the lack of grammar logically caused the complex grammar. 'Similarly' misses the fundamental transformation. 'In particular' incorrectly specifies.",
        "Astounding Transformation", ["Causal Trap", "False Parallel"]
    ],
    [
        "For decades, the rigid 'Clovis First' archaeological model asserted that the original human inhabitants of the Americas crossed the Bering land bridge no earlier than 13,000 years ago, quickly populating the continents via an ice-free corridor.",
        "rigorous radiocarbon dating of the Monte Verde site in southern Chile has definitively placed a thriving, highly complex human settlement at roughly 14,500 years ago, completely collapsing the traditional chronological timeline.",
        "However,", "Therefore,", "Correspondingly,", "In essence,",
        "The Clovis model asserts a strict timeline. Monte Verde breaks that timeline. 'However,' properly sets up this definitive refutation.",
        "'Therefore' implies the Clovis model caused the Monte Verde dating. 'Correspondingly' implies agreement. 'In essence' is a summary.",
        "Definitive Refutation", ["Causal Trap", "Parallel Trap"]
    ],
    [
        "Traditional literary realism meticulously attempts to maintain the 'fourth wall,' crafting seamless, highly immersive narratives that intentionally conceal the author's artificial hand in constructing the fictional universe.",
        "postmodern metafiction gleefully shatters this illusion, deliberately interrupting the narrative flow with highly self-conscious commentary to constantly remind the reader that they are consuming a fabricated text.",
        "In contrast,", "Thus,", "Similarly,", "Namely,",
        "Realism hides the author. Metafiction exposes the author. 'In contrast' perfectly highlights this diametric opposition in literary methodology.",
        "'Thus' implies realism causes metafiction. 'Similarly' implies a false parallel. 'Namely' implies a specification.",
        "Methodological Opposition", ["Causal Trap", "False Parallel"]
    ]
]

# Save to the JSON file
def main():
    target_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    # Generate the 50 formatted questions
    questions = []
    for item in qs_data:
        q = generate_q(item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8], item[9])
        questions.append(q)
    
    # Load existing or create new
    if os.path.exists(target_path):
        with open(target_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        
    # Append
    data.extend(questions)
    
    # Save
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print(f"Successfully generated and injected {len(questions)} Hard R&W Transitions questions into {target_path}.")

if __name__ == '__main__':
    main()
