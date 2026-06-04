import json
import uuid
import os
import random

def create_questions():
    topics = [
        ("The astronomer", "spotted a new comet", "she", "named it after her grandfather"),
        ("Mr. Henderson", "baked bread every morning", "he", "enjoyed the smell of the bakery"),
        ("The software engineer", "found a critical bug", "she", "fixed it before the release"),
        ("The local artist", "painted a giant mural", "he", "donated it to the community center"),
        ("Dr. Patel", "studied ancient ruins", "she", "discovered a hidden tomb"),
        ("The marathon runner", "trained in the mountains", "he", "built incredible stamina"),
        ("The young musician", "practiced the violin daily", "she", "won the regional competition"),
        ("The marine biologist", "tagged the Great White shark", "he", "tracked its migration pattern"),
        ("The head chef", "tasted the spicy broth", "she", "added a squeeze of lime"),
        ("The pilot", "checked the weather report", "he", "delayed the flight by an hour"),
        ("The botanist", "discovered a rare orchid", "she", "kept its location a secret"),
        ("The detective", "examined the muddy footprints", "he", "took several photographs"),
        ("The novelist", "wrote for ten hours straight", "she", "completed the final chapter"),
        ("The construction crew", "poured the concrete foundation", "they", "waited for it to dry"),
        ("The eager students", "read the assigned chapter", "they", "discussed it in class"),
        ("The park ranger", "patrolled the dense forest", "she", "rescued a stranded hiker"),
        ("The brilliant physicist", "proposed a new theory", "he", "presented it at the conference"),
        ("The experienced tailor", "measured the silk fabric", "she", "cut it with precision"),
        ("The fearless firefighter", "entered the burning building", "he", "carried the dog to safety"),
        ("The dedicated nurse", "checked the patient's vitals", "she", "recorded them on the chart"),
        ("The seasoned journalist", "interviewed the mayor", "he", "wrote a front-page article"),
        ("The talented baker", "mixed the flour and yeast", "she", "kneaded the dough perfectly"),
        ("The energetic dog", "chased the tennis ball", "it", "brought it back to the owner"),
        ("The mountain climber", "reached the snowy summit", "he", "planted a small flag"),
        ("The wildlife photographer", "waited in the blind for hours", "she", "captured a stunning image"),
        ("The software team", "deployed the new update", "they", "monitored the server load"),
        ("The curious toddler", "opened the colorful box", "he", "found a wooden toy inside"),
        ("The experienced surgeon", "completed the operation", "she", "spoke to the relieved family"),
        ("The old sailor", "navigated the stormy sea", "he", "relied on his trusty compass"),
        ("The farm owner", "harvested the ripe tomatoes", "she", "sold them at the local market"),
        ("The math professor", "solved the complex equation", "he", "smiled at his achievement"),
        ("The history teacher", "explained the causes of the war", "she", "showed a map on the screen"),
        ("The loyal golden retriever", "heard the familiar whistle", "it", "ran toward the porch"),
        ("The travel blogger", "visited the remote island", "he", "posted a video online"),
        ("The skilled mechanic", "replaced the worn brake pads", "she", "tested the car on the road"),
        ("The young gymnast", "performed a flawless routine", "he", "scored a perfect ten"),
        ("The enthusiastic volunteer", "sorted the donated clothes", "she", "packed them into boxes"),
        ("The proud grandfather", "built a wooden treehouse", "he", "painted it bright blue"),
        ("The quiet librarian", "organized the new arrivals", "she", "placed them on the display shelf"),
        ("The jazz saxophonist", "played a soulful solo", "he", "received a standing ovation"),
        ("The city planner", "designed a new public park", "she", "included a large playground"),
        ("The stage manager", "cued the lighting effects", "he", "watched the curtain rise"),
        ("The creative graphic designer", "chose a bold color palette", "she", "impressed the strict client"),
        ("The swift cheetah", "spotted the grazing antelope", "it", "sprinted across the savanna"),
        ("The eccentric inventor", "tested the flying machine", "he", "crashed into the haystack"),
        ("The careful accountant", "reviewed the financial statements", "she", "found a minor error"),
        ("The brave knight", "drew his heavy sword", "he", "stepped toward the dragon"),
        ("The experienced florist", "arranged the fresh roses", "she", "tied a ribbon around the vase"),
        ("The nervous actor", "forgot his lines briefly", "he", "recovered with a clever joke"),
        ("The dedicated researcher", "analyzed the soil samples", "she", "noted the high acidity"),
        ("The veteran coach", "called a strategic timeout", "he", "drew a play on the board"),
        ("The ambitious entrepreneur", "pitched the startup idea", "she", "secured the necessary funding"),
        ("The amateur astronomer", "adjusted the telescope lens", "he", "viewed the rings of Saturn"),
        ("The passionate poet", "recited her latest work", "she", "captivated the entire audience"),
        ("The skilled carpenter", "sanded the wooden table", "he", "applied a coat of varnish"),
        ("The vigilant security guard", "checked the locked doors", "she", "patrolled the empty hallway"),
        ("The happy child", "blew a giant bubble", "he", "laughed when it popped"),
        ("The expert chess player", "sacrificed a knight", "she", "checkmated her opponent"),
        ("The tired commuter", "boarded the evening train", "he", "fell asleep immediately"),
        ("The passionate environmentalist", "organized a beach cleanup", "she", "collected fifty bags of trash"),
        ("The local mayor", "cut the ceremonial ribbon", "he", "declared the bridge open"),
        ("The clever magician", "shuffled the deck of cards", "she", "performed an amazing trick"),
        ("The diligent housekeeper", "dusted the antique shelves", "he", "polished the silver vase"),
        ("The brave astronaut", "stepped out of the capsule", "she", "floated in the zero gravity"),
        ("The sleepy cat", "stretched its long legs", "it", "curled up on the warm rug")
    ]

    structures = [
        {
            "text": "{subj_cap} {pred1} [blank] {pred2}.",
            "choices": [
                ". {Pron_cap}",
                ", {pron}",
                " {pron}",
                ", and, {pron}"
            ],
            "traps": ["Comma Splice", "Run-on", "Unnecessary Comma"],
            "exps": [
                "This choice correctly uses a period to separate two independent clauses.",
                "This choice creates a comma splice by joining two independent clauses with only a comma.",
                "This choice creates a run-on sentence by lacking any punctuation.",
                "This choice adds unnecessary commas around the conjunction."
            ]
        },
        {
            "text": "Because {subj_lower} {pred1} [blank] {pred2}.",
            "choices": [
                ", {pron}",
                ". {Pron_cap}",
                " {pron}",
                "; {pron}"
            ],
            "traps": ["Sentence Fragment", "Missing Punctuation", "Punctuation Error"],
            "exps": [
                "This choice correctly uses a comma to separate the introductory dependent clause from the main independent clause.",
                "This choice creates a sentence fragment by separating a dependent clause with a period.",
                "This choice is missing the required comma after the introductory clause.",
                "This choice incorrectly uses a semicolon, which must separate two independent clauses."
            ]
        },
        {
            "text": "{subj_cap} {pred1} [blank] {pred2}.",
            "choices": [
                ", so {pron}",
                " so {pron}",
                ", so, {pron}",
                "; so {pron}"
            ],
            "traps": ["Missing Punctuation", "Unnecessary Comma", "Punctuation Error"],
            "exps": [
                "This choice correctly uses a comma before a coordinating conjunction to join two independent clauses.",
                "This choice is missing the comma required before the coordinating conjunction.",
                "This choice includes an unnecessary comma after the conjunction.",
                "This choice incorrectly uses a semicolon before the coordinating conjunction."
            ]
        },
        {
            "text": "{subj_cap} {pred1} [blank] as a result, {pron} {pred2}.",
            "choices": [
                ";",
                ",",
                "",
                ":"
            ],
            "traps": ["Comma Splice", "Run-on", "Punctuation Error"],
            "exps": [
                "This choice correctly uses a semicolon to separate two independent clauses.",
                "This choice creates a comma splice by joining two independent clauses with only a comma.",
                "This choice creates a run-on sentence by omitting necessary punctuation.",
                "This choice incorrectly uses a colon where a semicolon or period is required."
            ]
        },
        {
            "text": "{subj_cap} {pred1} [blank] which meant {pron} {pred2}.",
            "choices": [
                ",",
                ".",
                ";",
                ""
            ],
            "traps": ["Sentence Fragment", "Punctuation Error", "Missing Punctuation"],
            "exps": [
                "This choice correctly uses a comma before a nonrestrictive dependent clause.",
                "This choice incorrectly uses a period, creating a sentence fragment.",
                "This choice incorrectly uses a semicolon, which must separate two independent clauses.",
                "This choice is missing the comma required to set off the nonrestrictive clause."
            ]
        }
    ]

    def lower_subj(s):
        if s.startswith("The "):
            return "the " + s[4:]
        return s

    questions = []
    
    for i, topic in enumerate(topics):
        subj, pred1, pron, pred2 = topic
        subj_cap = subj[0].upper() + subj[1:]
        subj_lower = lower_subj(subj)
        pron_cap = pron[0].upper() + pron[1:]
        
        struct = structures[i % 5]
        
        text = struct["text"].format(
            subj=subj, 
            subj_cap=subj_cap, 
            subj_lower=subj_lower, 
            pred1=pred1, 
            pred2=pred2, 
            pron=pron, 
            Pron_cap=pron_cap
        )
        
        c0 = struct["choices"][0].format(pron=pron, Pron_cap=pron_cap)
        c1 = struct["choices"][1].format(pron=pron, Pron_cap=pron_cap)
        c2 = struct["choices"][2].format(pron=pron, Pron_cap=pron_cap)
        c3 = struct["choices"][3].format(pron=pron, Pron_cap=pron_cap)
        
        all_choices = [c0, c1, c2, c3]
        labels = ["A", "B", "C", "D"]
        shuffled_pairs = list(zip(all_choices, struct["exps"]))
        random.seed(i + 100) # deterministic
        random.shuffle(shuffled_pairs)
        
        choices_arr = []
        correct_ans = ""
        correct_exp = ""
        distractor_exps = {}
        
        for j, (choice_text, exp_text) in enumerate(shuffled_pairs):
            choices_arr.append(choice_text)
            letter = labels[j]
            if choice_text == c0:
                correct_ans = letter
                correct_exp = exp_text
            elif choice_text == c1:
                distractor_exps[letter] = f"Trap: {struct['traps'][0]}. {exp_text}"
            elif choice_text == c2:
                distractor_exps[letter] = f"Trap: {struct['traps'][1]}. {exp_text}"
            elif choice_text == c3:
                distractor_exps[letter] = f"Trap: {struct['traps'][2]}. {exp_text}"
                
        q_id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
        
        question = {
            "id": q_id,
            "section": "Reading and Writing",
            "domain": "Standard English Conventions",
            "skill": "Boundaries",
            "difficulty": "Easy",
            "type": "MCQ",
            "prompt": {
                "text": text,
                "question": "Which choice completes the text so that it conforms to the conventions of Standard English?"
            },
            "choices": choices_arr,
            "correctAnswer": correct_ans,
            "explanation": {
                "correct": correct_exp,
                "distractors": distractor_exps
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "sourceSignalId": "antigravity-easy-rw-conventions1",
                "cognitiveMove": "Determine the correct punctuation to separate independent and dependent clauses.",
                "trapTypes": struct["traps"]
            }
        }
        questions.append(question)
        
    return questions

def main():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    with open(bank_path, "r", encoding="utf-8") as f:
        bank = json.load(f)
        
    questions = create_questions()
    bank.extend(questions)
    
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated and injected {len(questions)} Easy R&W Boundaries questions.")

if __name__ == "__main__":
    main()
