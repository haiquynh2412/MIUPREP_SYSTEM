import json
import uuid
import random
import os

def generate_questions():
    questions = []

    def make_q(prompt, choices, correct_idx, expl_correct, expl_distractors, traps):
        q_id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
        q = {
            "id": q_id,
            "section": "Reading and Writing",
            "domain": "Standard English Conventions",
            "skill": "Form, Structure, and Sense",
            "difficulty": "Easy",
            "type": "MCQ",
            "prompt": prompt,
            "choices": choices,
            "correctAnswer": choices[correct_idx],
            "explanation": {
                "correct": expl_correct,
                "distractors": expl_distractors
            },
            "metadata": {
                "cognitiveMove": "Identify the correct grammatical form based on basic sentence structure.",
                "trapTypes": traps,
                "targetBand": "SAT-1200",
                "sourceSignalId": "antigravity-easy-rw-conventions2"
            }
        }
        return q

    # Type 1: Subject-Verb Agreement (Singular) - 15 questions
    sv_sing_data = [
        ("The talented artist", "paints", "paint", "painting", "to paint", "beautiful landscapes in her studio."),
        ("The experienced chef", "cooks", "cook", "cooking", "to cook", "delicious meals for the guests."),
        ("The brave firefighter", "rescues", "rescue", "rescuing", "to rescue", "people from dangerous situations."),
        ("The local baker", "bakes", "bake", "baking", "to bake", "fresh bread every morning."),
        ("The clever mechanic", "fixes", "fix", "fixing", "to fix", "broken cars quickly."),
        ("The dedicated teacher", "helps", "help", "helping", "to help", "students understand complex topics."),
        ("The loud alarm", "wakes", "wake", "waking", "to wake", "everyone in the house early."),
        ("The careful driver", "stops", "stop", "stopping", "to stop", "at every red light."),
        ("The loyal dog", "barks", "bark", "barking", "to bark", "loudly when strangers approach."),
        ("The quiet cat", "sleeps", "sleep", "sleeping", "to sleep", "on the soft couch all day."),
        ("The wise doctor", "examines", "examine", "examining", "to examine", "patients carefully."),
        ("The friendly neighbor", "waves", "wave", "waving", "to wave", "every time we pass by."),
        ("The old grandfather clock", "ticks", "tick", "ticking", "to tick", "loudly in the hallway."),
        ("The busy manager", "organizes", "organize", "organizing", "to organize", "the daily schedules."),
        ("The young child", "plays", "play", "playing", "to play", "in the sandbox for hours.")
    ]

    for subj, v_sing, v_plur, v_ing, v_to, rest in sv_sing_data:
        prompt = f"{subj} ________ {rest}"
        choices = [v_sing, v_plur, v_ing, v_to]
        correct_idx = 0
        expl_correct = f"The singular subject '{subj.lower()}' requires the singular verb '{v_sing}'."
        expl_distractors = {
            v_plur: "Subject-Verb Disagreement: The subject is singular, but this verb is plural.",
            v_ing: "Sentence Fragment: An '-ing' verb cannot serve as the main verb without a helping verb.",
            v_to: "Sentence Fragment: An infinitive cannot serve as the main verb of the sentence."
        }
        traps = ["Subject-Verb Disagreement"]
        questions.append(make_q(prompt, choices, correct_idx, expl_correct, expl_distractors, traps))

    # Type 2: Subject-Verb Agreement (Plural) - 15 questions
    sv_plur_data = [
        ("The talented artists", "paint", "paints", "painting", "to paint", "beautiful landscapes in their studio."),
        ("The experienced chefs", "cook", "cooks", "cooking", "to cook", "delicious meals for the guests."),
        ("The brave firefighters", "rescue", "rescues", "rescuing", "to rescue", "people from dangerous situations."),
        ("The local bakers", "bake", "bakes", "baking", "to bake", "fresh bread every morning."),
        ("The clever mechanics", "fix", "fixes", "fixing", "to fix", "broken cars quickly."),
        ("The dedicated teachers", "help", "helps", "helping", "to help", "students understand complex topics."),
        ("The loud alarms", "wake", "wakes", "waking", "to wake", "everyone in the house early."),
        ("The careful drivers", "stop", "stops", "stopping", "to stop", "at every red light."),
        ("The loyal dogs", "bark", "barks", "barking", "to bark", "loudly when strangers approach."),
        ("The quiet cats", "sleep", "sleeps", "sleeping", "to sleep", "on the soft couch all day."),
        ("The wise doctors", "examine", "examines", "examining", "to examine", "patients carefully."),
        ("The friendly neighbors", "wave", "waves", "waving", "to wave", "every time we pass by."),
        ("The old grandfather clocks", "tick", "ticks", "ticking", "to tick", "loudly in the hallway."),
        ("The busy managers", "organize", "organizes", "organizing", "to organize", "the daily schedules."),
        ("The young children", "play", "plays", "playing", "to play", "in the sandbox for hours.")
    ]

    for subj, v_plur, v_sing, v_ing, v_to, rest in sv_plur_data:
        prompt = f"{subj} ________ {rest}"
        choices = [v_plur, v_sing, v_ing, v_to]
        correct_idx = 0
        expl_correct = f"The plural subject '{subj.lower()}' requires the plural verb '{v_plur}'."
        expl_distractors = {
            v_sing: "Subject-Verb Disagreement: The subject is plural, but this verb is singular.",
            v_ing: "Sentence Fragment: An '-ing' verb cannot serve as the main verb without a helping verb.",
            v_to: "Sentence Fragment: An infinitive cannot serve as the main verb of the sentence."
        }
        traps = ["Subject-Verb Disagreement"]
        questions.append(make_q(prompt, choices, correct_idx, expl_correct, expl_distractors, traps))

    # Type 3: Plural vs Possessive Nouns (Singular Possessive) - 15 questions
    poss_sing_data = [
        ("The ________ collar was bright red and easy to spot.", "dog's", "dogs'", "dogs", "dog", "dog"),
        ("The ________ engine rumbled loudly as it sped down the highway.", "car's", "cars'", "cars", "car", "car"),
        ("The ________ cover was torn after years of heavy use.", "book's", "books'", "books", "book", "book"),
        ("The ________ uniform was neat and perfectly pressed.", "student's", "students'", "students", "student", "student"),
        ("The ________ screen cracked when it was dropped on the floor.", "phone's", "phones'", "phones", "phone", "phone"),
        ("The ________ nest was carefully hidden in the tall oak tree.", "bird's", "birds'", "birds", "bird", "bird"),
        ("The ________ handle was loose and needed to be tightened.", "door's", "doors'", "doors", "door", "door"),
        ("The ________ fur was soft and completely white.", "cat's", "cats'", "cats", "cat", "cat"),
        ("The ________ tire went flat during the long road trip.", "truck's", "trucks'", "trucks", "truck", "truck"),
        ("The ________ backpack was filled with heavy textbooks.", "boy's", "boys'", "boys", "boy", "boy"),
        ("The ________ lunchbox sat abandoned on the cafeteria table.", "girl's", "girls'", "girls", "girl", "girl"),
        ("The ________ final decision shocked everyone in the courtroom.", "judge's", "judges'", "judges", "judge", "judge"),
        ("The ________ hat blew away in the strong wind.", "farmer's", "farmers'", "farmers", "farmer", "farmer"),
        ("The ________ canvas was filled with vibrant colors.", "painter's", "painters'", "painters", "painter", "painter"),
        ("The ________ melody echoed through the empty concert hall.", "singer's", "singers'", "singers", "singer", "singer")
    ]

    for prompt, sing_poss, plur_poss, plur, sing, noun in poss_sing_data:
        choices = [sing_poss, plur_poss, plur, sing]
        correct_idx = 0
        expl_correct = f"The sentence requires the singular possessive form '{sing_poss}' to show that the object belongs to one {noun}."
        expl_distractors = {
            plur_poss: "Plural/Possessive Confusion: The sentence implies a single owner, so the plural possessive is incorrect.",
            plur: "Plural/Possessive Confusion: This is a plural noun, not a possessive noun. The sentence requires a possessive form.",
            sing: "Plural/Possessive Confusion: A possessive form is needed here, not just a singular noun."
        }
        traps = ["Plural/Possessive Confusion"]
        questions.append(make_q(prompt, choices, correct_idx, expl_correct, expl_distractors, traps))

    # Type 4: Plural vs Possessive Nouns (Plural) - 15 questions
    plur_data = [
        ("The farmer brought three fresh ________ to the market.", "apples", "apple's", "apples'", "apple", "apple"),
        ("The library received a large donation of rare ________.", "books", "book's", "books'", "book", "book"),
        ("The mechanic replaced the four broken ________ on the vehicle.", "tires", "tire's", "tires'", "tire", "tire"),
        ("The baker carefully decorated the beautiful ________ for the party.", "cakes", "cake's", "cakes'", "cake", "cake"),
        ("The explorer discovered several ancient ________ in the cave.", "artifacts", "artifact's", "artifacts'", "artifact", "artifact"),
        ("The artist used bright ________ to complete the mural.", "colors", "color's", "colors'", "color", "color"),
        ("The musician played many different ________ during the show.", "instruments", "instrument's", "instruments'", "instrument", "instrument"),
        ("The gardener planted beautiful ________ in the front yard.", "flowers", "flower's", "flowers'", "flower", "flower"),
        ("The chef used various ________ to flavor the rich soup.", "spices", "spice's", "spices'", "spice", "spice"),
        ("The teacher handed out the final ________ to the class.", "exams", "exam's", "exams'", "exam", "exam"),
        ("The child collected colorful ________ from the sandy beach.", "shells", "shell's", "shells'", "shell", "shell"),
        ("The carpenter drove several long ________ into the wooden board.", "nails", "nail's", "nails'", "nail", "nail"),
        ("The hiker crossed the rushing ________ carefully.", "rivers", "river's", "rivers'", "river", "river"),
        ("The scientist analyzed the small ________ under a microscope.", "samples", "sample's", "samples'", "sample", "sample"),
        ("The writer submitted three short ________ to the magazine.", "stories", "story's", "stories'", "story", "story")
    ]

    for prompt, plur, sing_poss, plur_poss, sing, noun in plur_data:
        choices = [plur, sing_poss, plur_poss, sing]
        correct_idx = 0
        expl_correct = f"The sentence requires the plural noun '{plur}' because there are multiple items, and no possession is indicated."
        expl_distractors = {
            sing_poss: "Plural/Possessive Confusion: The sentence does not indicate possession. A plural noun is needed.",
            plur_poss: "Plural/Possessive Confusion: The sentence does not indicate possession. A plural noun is needed.",
            sing: "Plural/Possessive Confusion: The context implies multiple items, so a singular noun is incorrect."
        }
        traps = ["Plural/Possessive Confusion"]
        questions.append(make_q(prompt, choices, correct_idx, expl_correct, expl_distractors, traps))

    # Type 5: Verb Tense (Past Tense) - 10 questions
    past_data = [
        ("Yesterday, the swift runner ________ the race with a record time.", "finished", "finishes", "finish", "finishing"),
        ("Last night, the bright star ________ clearly in the dark sky.", "shone", "shines", "shine", "shining"),
        ("A few days ago, the heavy package ________ at the front door.", "arrived", "arrives", "arrive", "arriving"),
        ("During the storm last week, the old tree ________ to the ground.", "fell", "falls", "fall", "falling"),
        ("In 1995, the famous scientist ________ a groundbreaking new theory.", "published", "publishes", "publish", "publishing"),
        ("Last month, the small company ________ a brand new product.", "launched", "launches", "launch", "launching"),
        ("Earlier this morning, the loud bird ________ outside my window.", "sang", "sings", "sing", "singing"),
        ("Last summer, the adventurous family ________ across the entire country.", "traveled", "travels", "travel", "traveling"),
        ("A year ago, the ambitious student ________ her own business.", "started", "starts", "start", "starting"),
        ("Last winter, the cold wind ________ fiercely through the valley.", "blew", "blows", "blow", "blowing")
    ]
    for prompt, past_v, pres_sing, pres_plur, v_ing in past_data:
        choices = [past_v, pres_sing, pres_plur, v_ing]
        correct_idx = 0
        expl_correct = f"The sentence contains a past-time context clue, so the past tense verb '{past_v}' is required."
        expl_distractors = {
            pres_sing: "Wrong Tense: The context is in the past, but this verb is in the present tense.",
            pres_plur: "Wrong Tense: The context is in the past, but this verb is in the present tense.",
            v_ing: "Wrong Tense: An '-ing' verb cannot function as the main verb without a helping verb."
        }
        traps = ["Wrong Tense"]
        questions.append(make_q(prompt, choices, correct_idx, expl_correct, expl_distractors, traps))

    random.seed(43)
    random.shuffle(questions)
    selected_questions = questions[:65]

    for q in selected_questions:
        c_ans = q['correctAnswer']
        c_list = q['choices']
        random.shuffle(c_list)
        q['choices'] = c_list
        q['correctAnswer'] = c_ans

    return selected_questions

def main():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    with open(bank_path, 'r', encoding='utf-8') as f:
        bank = json.load(f)
        
    new_qs = generate_questions()
    
    for q in new_qs:
        bank.append(q)
        
    with open(bank_path, 'w', encoding='utf-8') as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Generated and injected {len(new_qs)} questions. Total bank size: {len(bank)}")

if __name__ == '__main__':
    main()
