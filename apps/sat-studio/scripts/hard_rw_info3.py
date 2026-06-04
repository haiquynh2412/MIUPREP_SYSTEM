import os
import json
import random
import uuid

def generate_questions():
    questions = []
    
    textual_data = [
        ("historian Aris Thorne", "the collapse of the Bronze Age city of Ugarit", "foreign maritime invasions", "internal economic stratification driven by agricultural failure", "supports", 
         "Records from Ugarit's final years show massive debt pardons aimed at appeasing a starving, rebellious peasantry.", 
         "Letters from neighboring empires mention a decline in luxury goods exported from Ugarit.", 
         "Archaeological digs reveal destruction layers consistent with fire and collapsed walls.", 
         "Ugaritic military outposts were abandoned a decade prior to the collapse."),
        ("literary critic M. K. Vance", "Emily Dickinson's later poetry", "increasing psychological isolation", "a deliberate philosophical experiment in linguistic minimalism", "weakens", 
         "Dickinson's letters from this period explicitly state her intention to withdraw from social life to avoid emotional distress.", 
         "Her later poems feature fewer words and shorter stanzas than her early work.", 
         "Many of her contemporaries also began experimenting with sparse poetic forms.", 
         "She often revised early poems to remove adjectives and adverbs."),
        ("biologist Dr. Elena Rostova", "the evolutionary success of the deep-sea Pompeii worm", "extreme thermal tolerance", "symbiotic relationships with specific epibiotic bacteria", "supports", 
         "Specimens deprived of their bacterial fleece fail to thrive even in optimal thermal conditions.", 
         "The worms are consistently found in environments exceeding 80 degrees Celsius.", 
         "Other deep-sea organisms also exhibit high thermal tolerance.", 
         "The bacteria secrete enzymes that break down heavy metals."),
        ("linguist Samira Jalil", "the rapid syntax shift in Nicaraguan Sign Language", "imitation of spoken Spanish syntax", "innate cognitive structuring by its youngest speakers", "supports", 
         "The most complex grammatical features were introduced by the youngest cohort of signers, who had minimal exposure to Spanish.", 
         "Early versions of the language heavily borrowed gestures used by hearing Nicaraguans.", 
         "Adults learning the language later struggle with its spatial grammar.", 
         "The language developed rapidly over just a few decades."),
        ("astrophysicist James Norton", "the formation of hot Jupiters", "in situ formation close to their host stars", "migration from the outer stellar system due to gravitational interactions", "weakens", 
         "Spectroscopic analysis reveals these planets lack the volatile elements typically found in bodies formed in outer stellar regions.", 
         "Many hot Jupiters have highly eccentric orbits.", 
         "Computer simulations show that planetary migration can occur rapidly.", 
         "Some hot Jupiters are found in binary star systems."),
        ("archaeologist Dr. Lin Chen", "the abandonment of the Cahokia mounds", "environmental degradation and resource depletion", "political fragmentation caused by ideological schisms", "supports", 
         "Excavations show no decline in agricultural yield, but reveal defensive palisades built to separate internal neighborhoods.", 
         "Pollen samples indicate a severe drought occurred precisely when the city was abandoned.", 
         "Artifacts from Cahokia have been found hundreds of miles away.", 
         "The population of Cahokia peaked at around 20,000 people."),
        ("psychologist Dr. Aaron Tversky", "the framing effect in decision-making", "emotional manipulation", "cognitive heuristics designed to minimize mental effort", "weakens", 
         "Subjects show identical decision patterns even when physiological arousal is pharmacologically suppressed.", 
         "Participants make choices faster when options are framed positively.", 
         "Individuals with damage to the amygdala, the brain's emotion center, do not exhibit the framing effect.", 
         "Training in statistical reasoning reduces susceptibility to framing."),
        ("sociologist Dr. Maya Patel", "the decline of rural civic organizations", "urban migration of the youth", "the rise of digital, geographically unbound communities", "supports", 
         "Surveys indicate that rural residents spend significantly more time engaged in online interest groups than they did a decade ago.", 
         "The population of rural towns has decreased by 15% over the last twenty years.", 
         "Urban civic organizations have also seen a decline in membership.", 
         "Many rural towns lack reliable high-speed internet access."),
        ("paleontologist Dr. Sarah Jenkins", "the extinction of Pleistocene megafauna", "human overhunting", "rapid climate oscillations at the end of the Last Glacial Maximum", "weakens", 
         "Extinction events of large mammals precisely track the arrival dates of human populations across different continents, regardless of local climate phases.", 
         "Ice core data confirms dramatic temperature shifts occurred during this period.", 
         "Many small mammal species survived the Pleistocene transition without issue.", 
         "Fossil evidence shows humans hunted mammoths and mastodons."),
        ("economist Dr. David Wu", "the stagnation of wages in the late 20th century", "globalization and offshoring", "the decline of union bargaining power", "supports", 
         "Industries that maintained high union density saw wage growth consistent with productivity, unlike de-unionized sectors.", 
         "The volume of imported manufactured goods increased significantly during this period.", 
         "Corporate profits reached record highs in the late 1990s.", 
         "The cost of living rose faster than inflation in major metropolitan areas."),
        ("musicologist Dr. Anna Kowalski", "the development of polyphony in Medieval Europe", "secular folk traditions", "liturgical requirements of the Catholic Church", "weakens", 
         "The earliest known manuscripts of polyphonic music were found in secular songbooks, predating church adoption by a century.", 
         "Monasteries were the primary centers of musical education during the Middle Ages.", 
         "Polyphony requires a high degree of musical literacy to perform correctly.", 
         "The Church officially sanctioned polyphonic singing in the 14th century."),
        ("botanist Dr. Carlos Rivera", "the spread of invasive kudzu in the American South", "its rapid growth rate", "its ability to alter soil chemistry to inhibit native competitors", "supports", 
         "Soil in areas heavily colonized by kudzu exhibits an artificial pH level that is toxic to indigenous saplings.", 
         "Kudzu can grow up to a foot a day under ideal conditions.", 
         "The plant was actively promoted by the government for erosion control.", 
         "Herbivores in the region rarely consume kudzu leaves."),
        ("art historian Dr. Fiona Gallagher", "the use of chiaroscuro by Caravaggio", "a desire for theatrical realism", "an attempt to conceal his poor grasp of anatomical proportion", "weakens", 
         "X-ray analysis of Caravaggio's canvases reveals highly detailed and anatomically flawless underdrawings in the shadowed areas.", 
         "His paintings often feature dramatic, single-source lighting.", 
         "Many of his contemporaries praised his ability to evoke emotion.", 
         "He frequently used ordinary people as models for religious figures."),
        ("geologist Dr. Mark Bould", "the formation of the Grand Canyon", "a slow, uniform process over millions of years", "a rapid carving event triggered by a catastrophic flood", "supports", 
         "Sedimentary layers show signs of massive, sudden erosion patterns consistent with a single, colossal water discharge.", 
         "The Colorado River currently erodes the canyon at a rate of a few millimeters per year.", 
         "The rocks at the bottom of the canyon are nearly two billion years old.", 
         "There are multiple distinct layers of rock visible in the canyon walls."),
        ("anthropologist Dr. Nila Desai", "the adoption of agriculture in the Fertile Crescent", "a need to secure a stable food supply", "the necessity of brewing beer for religious rituals", "weakens", 
         "The earliest cultivated grain varieties found in the region are optimal for baking bread but chemically unsuited for fermentation.", 
         "Residue analysis on ancient pottery confirms the presence of fermented beverages.", 
         "Agriculture requires significantly more labor than foraging.", 
         "Large-scale granaries appear in the archaeological record shortly after domestication."),
        ("historian Dr. Thomas Beck", "the success of the Mongol Empire", "military technological superiority", "an incredibly efficient courier and logistical network", "supports", 
         "Historical accounts emphasize that Mongol armies were smaller and less heavily armed than their foes, relying instead on instantaneous communication and maneuver.", 
         "The Mongols were early adopters of gunpowder weapons from China.", 
         "Genghis Khan instituted a strict legal code across his empire.", 
         "Mongol horses were specifically bred for endurance in harsh climates."),
        ("chemist Dr. Li Wei", "the catalytic efficiency of Enzyme X", "its shape and binding affinity", "quantum tunneling of electrons within the active site", "supports", 
         "Reactions involving Enzyme X proceed at rates mathematically impossible under classical thermodynamics, matching quantum probability models.", 
         "Enzyme X denatures at temperatures exceeding 45 degrees Celsius.", 
         "The active site of the enzyme perfectly fits its target substrate.", 
         "Adding competitive inhibitors significantly reduces the reaction rate."),
        ("political scientist Dr. Jane Doe", "the rise of populist movements", "economic anxiety", "cultural backlash against cosmopolitanism", "weakens", 
         "Data shows that support for populist candidates correlates almost entirely with recent job losses in a region, regardless of the voters' cultural attitudes.", 
         "Populist leaders frequently employ rhetoric emphasizing national identity.", 
         "Many populist voters express dissatisfaction with globalized trade networks.", 
         "The movements often gain traction in rural and suburban areas."),
        ("neuroscientist Dr. Robert Kim", "the function of sleep", "memory consolidation", "the clearance of neurotoxic waste from the brain", "supports", 
         "Tracer dyes injected into the brain are cleared from the cerebral spinal fluid twice as fast during sleep than during wakefulness.", 
         "Rats deprived of sleep show significant deficits in navigating mazes they previously learned.", 
         "During REM sleep, brain wave patterns resemble those of an awake person.", 
         "Most adults require between seven and nine hours of sleep per night."),
        ("climatologist Dr. Sarah O'Connor", "the Little Ice Age in Europe", "decreased solar activity", "massive volcanic eruptions injecting aerosols into the stratosphere", "weakens", 
         "Ice core records show no significant increase in sulfate deposits—a marker of volcanic activity—during the onset of the Little Ice Age.", 
         "Sunspot observations from the period indicate a prolonged solar minimum.", 
         "Crop failures were widespread across Europe during the 17th century.", 
         "Glaciers in the Alps advanced significantly, destroying several villages."),
        ("linguist Dr. David Crystal", "the global dominance of English", "the structural simplicity of its grammar", "the economic and military power of the US and UK", "supports", 
         "Historically, languages with far more complex grammars have served as lingua francas when their native speakers held imperial dominance.", 
         "English has a highly irregular spelling system compared to phonetic languages.", 
         "Many multinational corporations mandate English as their working language.", 
         "English has absorbed vocabulary from dozens of other languages."),
        ("biologist Dr. Emily Park", "the evolution of bird flight", "a 'trees-down' gliding approach", "a 'ground-up' running and leaping approach", "weakens", 
         "Aerodynamic modeling suggests that the primitive wings of early proto-birds would not have generated sufficient lift from a running start.", 
         "Fossils of early birds often show adaptations for perching in trees.", 
         "Many modern ground-dwelling birds use their wings for balance while running.", 
         "The immediate ancestors of birds were small, bipedal dinosaurs."),
        ("economist Dr. John Smith", "the 2008 financial crisis", "the collapse of the housing bubble", "a lack of liquidity in the shadow banking system", "supports", 
         "The crisis became systemic only when short-term lending markets froze, preventing institutions from rolling over their daily debt, independent of their mortgage exposure.", 
         "Millions of homeowners defaulted on their subprime mortgages in 2007 and 2008.", 
         "The federal government intervened to bail out several major financial institutions.", 
         "Interest rates had been kept historically low in the years preceding the crash."),
        ("historian Dr. Alice Walker", "the Salem witch trials", "mass hysteria and religious fanaticism", "localized political rivalries and land disputes", "weakens", 
         "The vast majority of accusations were directed at individuals completely disconnected from local property disputes and were driven purely by religious doctrine.", 
         "Many of the accusers belonged to families that had lost political power in recent years.", 
         "Several of the accused were wealthy widows who owned substantial tracts of land.", 
         "The trials occurred during a period of intense anxiety regarding Native American attacks."),
        ("physicist Dr. Richard Feynman", "the Challenger disaster", "a failure of the O-rings due to cold weather", "a systemic failure in management communication", "supports", 
         "Internal memos reveal that engineers had explicitly warned management about the O-rings, but these warnings were suppressed to meet launch schedules.", 
         "The temperature on the morning of the launch was significantly below freezing.", 
         "The O-rings lost their elasticity and failed to seal the joint properly.", 
         "The explosion occurred 73 seconds after liftoff.")
    ]

    quant_data = [
        ("Dr. L. Chen", "the efficiency of three photovoltaic materials (A, B, C)", "Temperature (°C)", "Efficiency (%)", "Material C experiences the least efficiency degradation as temperatures rise from 20°C to 80°C.", 
         "At 20°C, Material C's efficiency is 18%, and at 80°C, it is 17.5%, whereas A and B drop by over 4%.",
         "Material A's efficiency drops from 22% at 20°C to 15% at 80°C.", 
         "Material C has a lower baseline efficiency at 20°C than both Material A and Material B.", 
         "The overall energy output of Material B exceeds that of Material C across all temperature ranges."),
        ("biologist Dr. K. Sato", "the foraging patterns of two ant species (X, Y)", "Time of Day", "Number of Ants Foraging", "Species X strictly prefers nocturnal foraging, completely avoiding the peak heat of the day.",
         "Species X shows 0 active foragers between 10 AM and 4 PM, but over 500 foragers active at midnight.",
         "Species Y has a relatively constant foraging rate throughout a 24-hour cycle.",
         "At 8 AM, both species have approximately 100 ants foraging outside the nest.",
         "The total number of Species X foragers over a week is greater than that of Species Y."),
        ("chemist Dr. M. Dubois", "the reaction rate of a catalyst at varying pH levels", "pH Level", "Reaction Rate (mol/s)", "The catalyst achieves its maximum efficiency in moderately alkaline environments, rapidly losing function in acidic ones.",
         "The reaction rate is 0.05 mol/s at pH 5, peaks at 1.2 mol/s at pH 8.5, and stays at 1.1 mol/s at pH 9.",
         "The reaction rate at pH 7 is exactly double the reaction rate at pH 6.",
         "The catalyst completely breaks down when the temperature exceeds 50°C.",
         "At pH 10, the reaction rate drops to 0.8 mol/s, showing some decrease in extreme alkalinity."),
        ("ecologist Dr. A. Patel", "the population density of a keystone predator across four regions", "Region", "Density (per sq km)", "Regions with higher structural complexity (like Region 3's dense forests) support significantly greater predator densities than flatland regions (like Region 1).",
         "Region 3 supports 4.5 predators per sq km, while Region 1 supports only 0.8 predators per sq km.",
         "Region 2, a mixed-woodland, supports 2.5 predators per sq km.",
         "The prey population in Region 1 is significantly higher than the prey population in Region 3.",
         "Region 4 recently experienced a wildfire that temporarily displaced both predators and prey."),
        ("physicist Dr. R. Gomez", "the conductivity of experimental alloys", "Alloy Type", "Conductivity (S/m)", "Alloy Z demonstrates a conductivity that is highly sensitive to external magnetic fields, unlike Alloy X and Alloy Y.",
         "Alloy Z's conductivity drops from 10^5 S/m to 10^2 S/m when a 1 Tesla field is applied, while X and Y remain unchanged.",
         "Alloy X has a baseline conductivity of 10^6 S/m, making it the most conductive material tested.",
         "Alloy Y exhibits a slight increase in conductivity when heated.",
         "Alloy Z is composed primarily of copper and rare earth elements."),
        ("agronomist Dr. S. Ndiaye", "the water retention of soil treated with biochar", "Biochar Concentration (%)", "Water Retention (%)", "Adding more than 10% biochar yields diminishing returns regarding water retention improvement.",
         "Water retention increases by 15% when moving from 0% to 10% biochar, but only by 2% when moving from 10% to 20%.",
         "Soil treated with 20% biochar retains 45% of its water after 48 hours.",
         "Untreated soil completely dries out within a week of irrigation.",
         "Biochar concentration also affects the soil's nitrogen levels, though to a lesser extent."),
        ("marine biologist Dr. H. Kim", "coral bleaching rates under different light spectrums", "Light Spectrum", "Bleaching Rate (%)", "Blue light induces significantly more severe bleaching in Coral Species Q than red or green light.",
         "Coral Species Q showed a 60% bleaching rate under blue light, compared to 15% under red light and 12% under green light.",
         "Blue light penetrates deeper into the ocean column than red light.",
         "Coral Species R showed roughly equal bleaching rates across all tested light spectrums.",
         "The temperature was kept strictly constant at 30°C throughout the experiment."),
        ("botanist Dr. E. Martinez", "the growth rate of genetically modified wheat", "Weeks after Planting", "Height (cm)", "The GM wheat exhibits an explosive initial growth phase but slows significantly after the fourth week.",
         "The GM wheat grew 20 cm per week for the first four weeks, but only 2 cm per week from week 5 to week 8.",
         "By week 8, the GM wheat was taller than the non-GM control group.",
         "The non-GM wheat grew at a steady, constant rate of 8 cm per week throughout the entire experiment.",
         "The GM wheat requires less water during its first four weeks of growth."),
        ("pharmacologist Dr. J. Lee", "the absorption time of a new drug formulation", "Patient Age Group", "Time to Peak Concentration (hours)", "The new formulation significantly accelerates absorption in elderly patients (over 65) compared to the standard formulation.",
         "In patients over 65, the new formulation peaks in 1.5 hours, whereas the standard formulation takes 4 hours.",
         "In patients under 30, both formulations peak in approximately 1 hour.",
         "The new formulation has a shorter half-life than the standard formulation.",
         "Elderly patients often have slower metabolisms, affecting drug efficacy."),
        ("materials scientist Dr. W. Zhang", "the tensile strength of carbon nanotube bundles", "Bundle Diameter (nm)", "Tensile Strength (GPa)", "As the bundle diameter increases beyond 50 nm, the overall tensile strength begins to decrease due to internal slippage.",
         "Bundles of 50 nm diameter have a strength of 80 GPa, while 100 nm bundles show a reduced strength of 55 GPa.",
         "A single carbon nanotube has a theoretical tensile strength of over 100 GPa.",
         "Bundles of 10 nm diameter have a strength of 40 GPa.",
         "The bundles were synthesized using a chemical vapor deposition method."),
        ("meteorologist Dr. A. Johnson", "the frequency of Category 5 hurricanes", "Decade", "Number of Hurricanes", "The frequency of Category 5 hurricanes has roughly doubled in the most recent decade compared to the mid-20th century.",
         "There were 18 Category 5 hurricanes recorded between 2010 and 2019, compared to only 8 between 1950 and 1959.",
         "The overall number of named storms has remained relatively constant over the last century.",
         "Advances in satellite technology have made it easier to accurately measure wind speeds.",
         "The 1990s saw a brief dip in hurricane activity due to El Niño patterns."),
        ("geneticist Dr. M. Ali", "the expression levels of Gene X in different tissues", "Tissue Type", "Expression Level (TPM)", "Gene X is heavily expressed in neural tissue but remains almost entirely suppressed in muscular tissue.",
         "Expression in the cerebral cortex is 450 TPM, while expression in skeletal muscle is 0.5 TPM.",
         "Gene X is known to be involved in the formation of synaptic connections.",
         "Expression in liver tissue is approximately 50 TPM.",
         "Mutations in Gene X are associated with severe cognitive deficits."),
        ("economist Dr. R. Gupta", "the impact of a minimum wage increase on employment", "Business Size (Employees)", "Change in Employment (%)", "Small businesses (under 50 employees) experienced a significant drop in employment, while large corporations saw no change.",
         "Businesses with under 50 employees saw a -8% change in employment, while businesses with over 500 employees saw a 0% change.",
         "The minimum wage was increased by 20% in a single year.",
         "Medium-sized businesses (50-499 employees) experienced a -2% change.",
         "Total overall employment in the region remained relatively stable due to corporate hiring."),
        ("psychologist Dr. S. Carter", "the effect of screen time on sleep quality", "Hours of Screen Time", "Sleep Quality Score (1-10)", "Sleep quality sharply deteriorates only when screen time exceeds four hours per day.",
         "Participants with 1 to 3 hours of screen time averaged a score of 8.5, while those with 5 hours averaged 4.2.",
         "Participants who used screens immediately before bed reported the worst sleep quality overall.",
         "The average sleep quality score for all participants was 6.8.",
         "Participants with 0 hours of screen time averaged a score of 8.7."),
        ("sociologist Dr. L. Nguyen", "the correlation between commuting distance and civic engagement", "Commuting Distance (miles)", "Civic Participation Index", "Individuals with commutes exceeding 20 miles exhibit significantly lower civic engagement than those with shorter commutes.",
         "The Index for commutes under 5 miles is 75, but it drops steeply to 30 for commutes over 20 miles.",
         "Individuals with longer commutes also report higher levels of daily stress.",
         "The Index for commutes between 10 and 15 miles is 60.",
         "Civic engagement was measured by tracking attendance at local community meetings."),
        ("epidemiologist Dr. K. O'Brien", "the efficacy of a vaccine against different viral strains", "Viral Strain", "Efficacy (%)", "The vaccine provides near-total protection against Strain A but is largely ineffective against the newly emerged Strain C.",
         "The efficacy against Strain A is 98%, while the efficacy against Strain C is only 15%.",
         "Strain C contains a novel mutation in its spike protein.",
         "The efficacy against Strain B is 85%.",
         "The vaccine was developed using mRNA technology."),
        ("geologist Dr. T. Yamamoto", "the rate of soil erosion in different agricultural systems", "Farming Method", "Erosion Rate (tons/hectare/year)", "No-till farming significantly reduces soil erosion compared to traditional plowing methods.",
         "Fields using no-till farming lost 1.2 tons/hectare/year, while traditionally plowed fields lost 14.5 tons/hectare/year.",
         "No-till farming relies heavily on the use of herbicides to control weeds.",
         "Terraced farming lost 3.4 tons/hectare/year.",
         "Soil erosion is a major contributor to agricultural runoff and water pollution."),
        ("linguist Dr. P. Silva", "the rate of vocabulary acquisition in bilingual children", "Age (Months)", "Total Vocabulary Size", "Bilingual children initially lag behind monolinguals in total vocabulary but surpass them by age four.",
         "At 24 months, bilinguals know 150 words compared to monolinguals' 250, but by 48 months, bilinguals know 1200 compared to monolinguals' 1000.",
         "Bilingual children often mix words from both languages in a single sentence.",
         "At 36 months, both groups have a vocabulary of approximately 600 words.",
         "The study only tracked children exposed to Spanish and English."),
        ("astronomer Dr. F. Rossi", "the luminosity of variable stars", "Time (Days)", "Luminosity (Solar Units)", "Star V pulses with a highly regular period, reaching peak luminosity exactly every 12 days.",
         "Luminosity peaks at 500 units on Day 12, Day 24, and Day 36, dropping to 100 units in between.",
         "Star W has an irregular pulsation period, varying between 8 and 15 days.",
         "The star's color shifts from red to blue as it reaches peak luminosity.",
         "The average luminosity of Star V is higher than that of our Sun."),
        ("nutritionist Dr. E. Davis", "the glycemic index of different carbohydrate sources", "Food Item", "Glycemic Index", "Processed grains exhibit a significantly higher glycemic index than intact whole grains.",
         "White bread has a GI of 75, whereas intact oat groats have a GI of 35.",
         "The glycemic index measures how quickly a food raises blood sugar levels.",
         "Whole wheat bread has a GI of 71, which is only slightly lower than white bread.",
         "Combining carbohydrates with fats or proteins lowers the overall glycemic response."),
        ("ecologist Dr. M. Torres", "the impact of artificial light on moth populations", "Distance from Streetlight (m)", "Moths Captured", "The density of moths is exponentially higher in the immediate vicinity of the streetlight and drops to baseline levels within 50 meters.",
         "300 moths were captured at 5 meters, 40 at 25 meters, and 5 at 50 meters.",
         "The streetlight uses an LED bulb that emits a high proportion of blue light.",
         "Moths captured near the light showed decreased feeding activity.",
         "Different moth species showed varying levels of attraction to the light."),
        ("chemist Dr. A. Ivanov", "the solubility of a compound in different solvents", "Solvent Polarity Index", "Solubility (g/L)", "The compound is highly soluble in polar solvents but nearly insoluble in non-polar ones.",
         "In water (Polarity 9.0), solubility is 150 g/L; in hexane (Polarity 0.1), it is 0.5 g/L.",
         "The compound's molecular structure contains several hydroxyl groups.",
         "In ethanol (Polarity 5.2), the solubility is 85 g/L.",
         "Heating the solvent significantly increases the solubility of the compound."),
        ("physicist Dr. H. Chen", "the friction coefficient of different tire materials", "Road Surface Condition", "Friction Coefficient", "Material B maintains a consistent friction coefficient regardless of whether the road is wet or dry.",
         "Material B's coefficient is 0.75 on dry asphalt and 0.72 on wet asphalt, while Material A drops from 0.85 to 0.40.",
         "Material B wears out 20% faster than Material A under normal driving conditions.",
         "On icy roads, both materials exhibit a friction coefficient below 0.2.",
         "The friction coefficient directly affects the stopping distance of a vehicle."),
        ("biologist Dr. S. Williams", "the metabolic rate of hummingbirds", "Ambient Temperature (°C)", "Metabolic Rate (ml O2/g/hr)", "As temperature drops below 10°C, the hummingbirds enter torpor, drastically reducing their metabolic rate.",
         "At 15°C, the rate is 45 ml O2/g/hr, but at 5°C, it plummets to 2 ml O2/g/hr.",
         "During active flight, the metabolic rate can exceed 80 ml O2/g/hr.",
         "At 25°C, the rate is 30 ml O2/g/hr.",
         "Torpor allows the birds to conserve energy during cold nights when they cannot feed."),
        ("demographer Dr. J. Garcia", "the fertility rate in developing nations", "Female Education Level (Years)", "Total Fertility Rate", "An increase in female education beyond primary school correlates strongly with a sharp decline in the fertility rate.",
         "Women with 0-5 years of education average 5.2 children, while those with 10+ years average 2.1 children.",
         "Access to modern contraceptives has increased significantly in the regions studied.",
         "Women with 6-9 years of education average 3.5 children.",
         "The study did not account for differences in rural versus urban populations.")
    ]

    textual_templates = [
        ("While analyzing {topic}, {scholar} challenges the prevailing consensus that the phenomenon was primarily driven by {traditional}. Instead, {scholar} argues that the shift was fundamentally a result of {new_hyp}.", "Which finding, if true, would most directly {action} {scholar}'s hypothesis?"),
        ("In a recent publication, {scholar} proposes a novel interpretation of {topic}. Traditionally attributed to {traditional}, {scholar} argues that the evidence instead points to {new_hyp}.", "Which choice, if true, would most strongly {action} the new interpretation?"),
        ("{scholar}'s research on {topic} has sparked debate. Opposing the classical view that {traditional}, the researcher asserts that {new_hyp} was the primary catalyst.", "Which finding, if true, would best serve to {action} the researcher's assertion?"),
        ("The standard historical and scientific narrative posits that {traditional} was the main factor behind {topic}. However, {scholar} suggests an alternative: that {new_hyp} played the decisive role.", "Which statement, if true, would most strongly {action} this alternative perspective?"),
        ("Evaluating {topic}, {scholar} notes anomalies that contradict the theory of {traditional}. {scholar} hypothesizes that {new_hyp} offers a more comprehensive explanation.", "Which piece of evidence, if true, would most directly {action} {scholar}'s hypothesis?")
    ]

    quant_templates = [
        "{researcher} investigated {experiment}, tracking both {var_x} and {var_y}. Analyzing the results, {researcher} formulated the hypothesis that {claim}\n\nWhich choice best describes data from the experiment that support {researcher}'s conclusion?",
        "A study led by {researcher} focused on {experiment}. By manipulating {var_x} and observing {var_y}, the team concluded that {claim}\n\nWhich choice best describes data from the table that support the team's conclusion?",
        "To understand {experiment}, {researcher} designed a trial measuring {var_y} across different levels of {var_x}. The researchers assert that {claim}\n\nWhich finding from the data best supports this assertion?",
        "In a paper detailing {experiment}, {researcher} presents data on {var_x} and its effect on {var_y}. The data purportedly show that {claim}\n\nWhich choice best represents data from the study that justify this claim?",
        "Examining the dynamics of {experiment}, {researcher} plotted {var_y} against {var_x}. Based on the graph, the team argues that {claim}\n\nWhich description of the data provides the strongest support for the team's argument?"
    ]

    for item in textual_data:
        scholar, topic, traditional, new_hyp, action, correct, t1, t2, t3 = item
        
        text_part, question_part = random.choice(textual_templates)
        
        action_word = "support" if action == "supports" else "weaken"
        
        scholar_name = scholar.replace("Dr. ", "").replace("historian ", "").replace("literary critic ", "").replace("biologist ", "").replace("linguist ", "").replace("astrophysicist ", "").replace("archaeologist ", "").replace("psychologist ", "").replace("sociologist ", "").replace("paleontologist ", "").replace("economist ", "").replace("musicologist ", "").replace("botanist ", "").replace("art historian ", "").replace("geologist ", "").replace("anthropologist ", "").replace("chemist ", "").replace("political scientist ", "").replace("neuroscientist ", "").replace("climatologist ", "").replace("physicist ", "").strip()
        scholar_surname = scholar_name.split()[-1]
        year = random.randint(2018, 2024)
        topic_words = [w.capitalize() for w in topic.split() if len(w) > 3]
        topic_title = " ".join(topic_words)
        source_citation = f"Source: {scholar_surname}, \"Insights into {topic_title}.\" ©{year} by Academic Press."
        
        text = text_part.format(scholar=scholar, topic=topic, traditional=traditional, new_hyp=new_hyp)
        question = question_part.format(scholar=scholar, action=action_word)
        prompt = f"{text}\n\n{source_citation}\n\n{question}"
        
        options = [
            {"text": correct, "isCorrect": True, "orig": "correct"},
            {"text": t1, "isCorrect": False, "orig": "t1"},
            {"text": t2, "isCorrect": False, "orig": "t2"},
            {"text": t3, "isCorrect": False, "orig": "t3"}
        ]
        random.shuffle(options)
        
        choices = []
        correct_ans = 'A'
        distractors = {}
        letters = ['A', 'B', 'C', 'D']
        for i, opt in enumerate(options):
            choices.append({"text": opt["text"], "isCorrect": opt["isCorrect"]})
            if opt["isCorrect"]:
                correct_ans = letters[i]
            else:
                if opt["orig"] == "t1":
                    reason = "Trap: True but Irrelevant. This statement might be factually consistent with the broader topic but fails to directly address the specific causal mechanism of the hypothesis."
                elif opt["orig"] == "t2":
                    reason = "Trap: Opposite Direction / Contradiction. This piece of evidence would actually support the opposing view or weaken the intended claim rather than supporting it."
                else:
                    reason = "Trap: Partial Support / Out of Scope. While related to the subject, this choice focuses on a secondary detail that does not definitively prove or disprove the core argument."
                distractors[letters[i]] = reason

        q_dict = {
            "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Information and Ideas",
            "skill": "Command of Evidence: Textual",
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "prompt": prompt,
            "type": "MCQ",
            "choices": choices,
            "correctAnswer": correct_ans,
            "explanation": {
                "correct": f"Choice {correct_ans} is correct. {correct}",
                "distractors": distractors
            },
            "metadata": {
                "sourceSignalId": "antigravity-1600-rw-info3",
                "generationEngine": "antigravity-master-prompt-1600",
                "cognitiveMove": "Identify and isolate the specific causal mechanism in the hypothesis and match it to a highly specific piece of evidence, avoiding plausible but irrelevant distractors.",
                "trapTypes": ["True but Irrelevant", "Partial Support", "Opposite Direction"]
            }
        }
        questions.append(q_dict)

    for item in quant_data:
        researcher, experiment, var_x, var_y, claim, correct, t1, t2, t3 = item
        template = random.choice(quant_templates)
        prompt = template.format(researcher=researcher, experiment=experiment, var_x=var_x, var_y=var_y, claim=claim)
        
        options = [
            {"text": correct, "isCorrect": True, "orig": "correct"},
            {"text": t1, "isCorrect": False, "orig": "t1"},
            {"text": t2, "isCorrect": False, "orig": "t2"},
            {"text": t3, "isCorrect": False, "orig": "t3"}
        ]
        random.shuffle(options)
        
        choices = []
        correct_ans = 'A'
        distractors = {}
        letters = ['A', 'B', 'C', 'D']
        for i, opt in enumerate(options):
            choices.append({"text": opt["text"], "isCorrect": opt["isCorrect"]})
            if opt["isCorrect"]:
                correct_ans = letters[i]
            else:
                if opt["orig"] == "t1":
                    reason = "Trap: Partial Support / Misread Data. This choice misrepresents the intended relationship, either pointing in the wrong direction or focusing on a variable that contradicts the core claim."
                elif opt["orig"] == "t2":
                    reason = "Trap: True but Irrelevant. While this statement may be factually accurate within the context of the table, it does not provide direct evidence to support the specific hypothesis regarding the interaction of the variables."
                else:
                    reason = "Trap: Opposite / Out of Scope. This choice presents an observation that is tangentially related but fails to isolate the key mechanism described by the researcher."
                distractors[letters[i]] = reason

        q_dict = {
            "id": f"antigravity-1600-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Information and Ideas",
            "skill": "Command of Evidence: Quantitative",
            "difficulty": "Hard",
            "targetBand": "SAT-1600",
            "prompt": prompt,
            "type": "MCQ",
            "choices": choices,
            "correctAnswer": correct_ans,
            "explanation": {
                "correct": f"Choice {correct_ans} is correct. {correct}",
                "distractors": distractors
            },
            "metadata": {
                "sourceSignalId": "antigravity-1600-rw-info3",
                "generationEngine": "antigravity-master-prompt-1600",
                "cognitiveMove": "Analyze data trends to confirm a nuanced interaction, avoiding data points that are true but fail to address the specific comparative claim.",
                "trapTypes": ["Misread Data", "True but Irrelevant", "Partial Support"]
            }
        }
        questions.append(q_dict)

    return questions

def main():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    # Load existing if available
    existing_data = []
    if os.path.exists(bank_path):
        try:
            with open(bank_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f"Error reading existing bank: {e}")
            existing_data = []
    
    new_questions = generate_questions()
    
    existing_data.extend(new_questions)
    
    os.makedirs(os.path.dirname(bank_path), exist_ok=True)
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=4, ensure_ascii=False)
        
    print(f"Generated {len(new_questions)} Hard R&W questions.")
    print(f"Total questions in bank: {len(existing_data)}")

if __name__ == '__main__':
    main()
