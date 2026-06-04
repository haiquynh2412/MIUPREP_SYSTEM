import json
import uuid
import random
import os

items = [
    ("enhance", "The city council plans to ______ the local park by planting new trees, fixing the benches, and installing better playground equipment.", ["enhance", "abandon", "hide", "complicate"], "planting new trees and fixing benches indicates improving or making something better"),
    ("exhausted", "After hiking for ten hours straight up the steep mountain trail without a break, the climbers were completely ______.", ["exhausted", "refreshed", "curious", "annoyed"], "hiking for ten hours straight without a break leads to severe tiredness"),
    ("clear", "The teacher's explanation was so ______ that every single student in the class understood the new math concept immediately.", ["clear", "confusing", "quiet", "lengthy"], "every student understanding it immediately means it was easy to understand"),
    ("predictable", "Because the movie followed a standard romantic comedy formula, the ending was very ______.", ["predictable", "shocking", "mysterious", "complex"], "following a standard formula means the outcome was expected"),
    ("postpone", "The concert organizers had to ______ the outdoor festival until next month due to severe weather warnings.", ["postpone", "start", "cancel", "attend"], "moving the event until next month indicates delaying it"),
    ("abundant", "During the summer, fresh strawberries are ______ at the local market, with dozens of farmers selling them daily.", ["abundant", "rare", "expensive", "hidden"], "dozens of farmers selling them daily means there is a large amount"),
    ("fragile", "The museum carefully transported the ______ ancient pottery in special padded boxes to prevent it from cracking.", ["fragile", "sturdy", "modern", "heavy"], "preventing it from cracking implies it breaks easily"),
    ("permanent", "He wanted to get a ______ tattoo to remember his grandfather, something that would stay on his skin forever.", ["permanent", "temporary", "colorful", "painful"], "staying on his skin forever means lasting indefinitely"),
    ("cautious", "The ice on the sidewalk was very slippery, so the pedestrians were extremely ______ as they walked to work.", ["cautious", "reckless", "speedy", "joyful"], "slippery ice requires careful walking to avoid falling"),
    ("ancient", "Archaeologists discovered ______ ruins in the desert that dated back thousands of years before the current era.", ["ancient", "recent", "fake", "shiny"], "dating back thousands of years indicates very old age"),
    ("brief", "The manager gave a ______ introduction that lasted only two minutes before handing the microphone to the main speaker.", ["brief", "endless", "detailed", "boring"], "lasting only two minutes means very short"),
    ("identical", "The two buildings were completely ______; they had the exact same layout, paint color, and window design.", ["identical", "different", "ugly", "empty"], "the exact same layout and color means exactly alike"),
    ("decline", "Because fewer people are buying physical CDs, music stores have seen a sharp ______ in their sales over the last decade.", ["decline", "increase", "balance", "mystery"], "fewer people buying means sales go down"),
    ("visible", "The bright yellow sign was easily ______ from the highway, ensuring that drivers wouldn't miss the turn.", ["visible", "hidden", "confusing", "ignored"], "ensuring drivers wouldn't miss it means it can be seen clearly"),
    ("frequent", "The train makes ______ stops along this route, picking up passengers every five minutes.", ["frequent", "rare", "accidental", "dangerous"], "every five minutes means happening often"),
    ("flexible", "Yoga helps keep your muscles ______, making it easier to bend and stretch without injury.", ["flexible", "stiff", "weak", "frozen"], "making it easier to bend and stretch means able to move easily"),
    ("accurate", "The scientist double-checked her measurements to ensure the data was completely ______ before publishing the report.", ["accurate", "flawed", "creative", "lost"], "double-checking measurements implies needing exact correctness"),
    ("eager", "The students were ______ to start the science experiment, raising their hands excitedly when the teacher brought out the materials.", ["eager", "reluctant", "bored", "asleep"], "raising hands excitedly means very willing and excited"),
    ("massive", "The earthquake created a ______ crack in the road that was over twenty feet wide and impossible to drive across.", ["massive", "tiny", "invisible", "smooth"], "twenty feet wide and impossible to drive across means very large"),
    ("steady", "Despite the rough waves, the experienced sailor kept the boat at a ______ pace, never speeding up or slowing down.", ["steady", "wild", "pausing", "random"], "never speeding up or slowing down means constant"),
    ("harsh", "The desert environment is incredibly ______, with extreme heat during the day and freezing temperatures at night.", ["harsh", "gentle", "welcoming", "crowded"], "extreme heat and freezing temperatures indicate a difficult and severe environment"),
    ("artificial", "Instead of using real sugar, the diet soda is sweetened with ______ ingredients made in a laboratory.", ["artificial", "natural", "healthy", "expensive"], "made in a laboratory instead of using real sugar indicates fake or synthetic"),
    ("rare", "Finding a pearl inside an oyster is a ______ event; it happens to only a tiny fraction of the shells collected.", ["rare", "common", "daily", "loud"], "happening to only a tiny fraction indicates it does not happen often"),
    ("expand", "As the business grew, the owners decided to ______ their shop by renting the building next door.", ["expand", "shrink", "close", "hide"], "renting the building next door indicates making the shop larger"),
    ("essential", "Water is ______ for all living creatures; without it, plants and animals cannot survive.", ["essential", "optional", "harmful", "tasty"], "cannot survive without it means absolutely necessary"),
    ("reluctant", "Although she knew she needed to see the dentist, Maya was ______ to make an appointment because she hated the drill.", ["reluctant", "thrilled", "quick", "ready"], "hating the drill means she was hesitant or unwilling"),
    ("hostile", "The opposing fans were incredibly ______, shouting insults and throwing trash at the visiting team's bus.", ["hostile", "friendly", "quiet", "polite"], "shouting insults and throwing trash indicates aggressive or unfriendly behavior"),
    ("confident", "After studying for three weeks, Leo felt ______ that he would get a high score on his final exam.", ["confident", "nervous", "doubtful", "confused"], "studying for three weeks leads to feeling sure of success"),
    ("isolate", "To prevent the contagious virus from spreading, the doctors decided to ______ the sick patients in a separate ward.", ["isolate", "mix", "release", "entertain"], "preventing spread by putting in a separate ward means to separate"),
    ("modern", "The city skyline is filled with ______ skyscrapers made of glass and steel, replacing the old brick buildings.", ["modern", "ancient", "ruined", "wooden"], "glass and steel replacing old brick indicates new or contemporary"),
    ("brilliant", "The scientist came up with a ______ solution to the problem that no one else in the laboratory had thought of.", ["brilliant", "foolish", "obvious", "slow"], "a solution that no one else had thought of implies it is very smart"),
    ("complex", "The instructions for the model airplane were so ______ that it took the hobbyist three days to figure them out.", ["complex", "simple", "clear", "funny"], "taking three days to figure them out implies they are complicated"),
    ("nervous", "Before her first piano recital, Sarah felt so ______ that her hands were shaking and her stomach was in knots.", ["nervous", "calm", "bored", "angry"], "hands shaking and stomach in knots indicates anxiety"),
    ("polite", "The waiter was always ______ to the customers, saying 'please' and 'thank you' with a warm smile.", ["polite", "rude", "clumsy", "loud"], "saying please and thank you indicates good manners"),
    ("wealthy", "The ______ businessman owned three mansions, a private jet, and a collection of expensive sports cars.", ["wealthy", "poor", "generous", "modest"], "owning mansions and private jets indicates having a lot of money"),
    ("typical", "It is ______ for it to rain heavily in April, so no one was surprised when the storm hit.", ["typical", "unusual", "shocking", "illegal"], "no one being surprised indicates it is expected or normal"),
    ("vague", "The directions to the cabin were too ______, so we got lost because they didn't specify which dirt road to take.", ["vague", "detailed", "helpful", "strict"], "not specifying which road indicates lacking detail"),
    ("secure", "After installing new locks and an alarm system, the homeowners finally felt ______ in their neighborhood.", ["secure", "threatened", "confused", "trapped"], "new locks and an alarm system indicate feeling safe"),
    ("repair", "The mechanic needed two days to ______ the engine of the old car so it could run smoothly again.", ["repair", "break", "sell", "wash"], "running smoothly again implies fixing it"),
    ("combine", "To make the perfect shade of green paint, you must ______ blue and yellow in equal amounts.", ["combine", "separate", "drink", "ignore"], "blue and yellow making green means putting them together"),
    ("display", "The art gallery will ______ the newly discovered painting in the main lobby so everyone can see it.", ["display", "hide", "destroy", "steal"], "so everyone can see it implies showing it publicly"),
    ("prevent", "Wearing sunscreen is the best way to ______ sunburns when spending a long day at the beach.", ["prevent", "cause", "enjoy", "cure"], "the best way to handle sunburns means stopping them from happening"),
    ("gather", "The teacher asked the students to ______ in a circle on the rug for story time.", ["gather", "scatter", "shout", "sleep"], "in a circle means coming together"),
    ("select", "Out of the fifty applicants, the committee will only ______ three candidates to move on to the final interview.", ["select", "reject", "ignore", "punish"], "only three candidates moving on means choosing them"),
    ("ignore", "Although the dog barked loudly at the mail carrier, the man chose to ______ the noise and keep walking.", ["ignore", "chase", "reward", "fear"], "keeping walking means not paying attention to the noise"),
    ("replace", "Because his old phone battery wouldn't hold a charge, he had to ______ it with a brand new one.", ["replace", "keep", "break", "admire"], "a brand new one implies taking out the old and putting in the new"),
    ("defend", "The lawyer worked tirelessly to ______ her client in court, presenting evidence that proved his innocence.", ["defend", "accuse", "attack", "forget"], "presenting evidence of innocence implies protecting or supporting"),
    ("create", "The chef wanted to ______ a brand new dessert that blended the flavors of chocolate, chili, and sea salt.", ["create", "destroy", "copy", "eat"], "a brand new dessert implies making something new"),
    ("attach", "Please ______ a copy of your resume to the email before sending your job application to the manager.", ["attach", "remove", "read", "delete"], "to the email indicates adding or connecting it"),
    ("reduce", "To save money on their electric bill, the family decided to ______ their energy usage by turning off unnecessary lights.", ["reduce", "increase", "maintain", "measure"], "turning off unnecessary lights means using less"),
    ("reveal", "At the end of the magic trick, the illusionist pulled off the cloth to ______ a live bird sitting in the previously empty cage.", ["reveal", "conceal", "harm", "forget"], "pulling off the cloth indicates showing something hidden"),
    ("adjust", "The tailor had to ______ the suit jacket because the sleeves were two inches too long for the customer.", ["adjust", "ruin", "sell", "wear"], "sleeves being too long implies making a change to fit"),
    ("observe", "The scientists set up cameras in the forest to quietly ______ the behavior of the rare wolves without disturbing them.", ["observe", "scare", "feed", "hunt"], "without disturbing them indicates watching carefully"),
    ("maintain", "It takes a lot of hard work to ______ a large garden, requiring daily watering, weeding, and pruning.", ["maintain", "destroy", "abandon", "buy"], "daily watering and weeding indicates keeping it in good condition"),
    ("rescue", "The brave firefighters managed to ______ the terrified cat that had been stuck in the tall oak tree all morning.", ["rescue", "frighten", "leave", "feed"], "stuck in the tree indicates saving from danger"),
    ("wander", "Without a map or a specific destination, the tourists decided to just ______ through the narrow streets of the old city.", ["wander", "sprint", "march", "drive"], "without a map or destination indicates walking aimlessly"),
    ("discover", "While digging in the backyard, the children were thrilled to ______ an old metal box filled with ancient coins.", ["discover", "lose", "bury", "ignore"], "digging and finding a box implies uncovering something hidden"),
    ("persuade", "The salesman tried to ______ the customer to buy the more expensive car by highlighting its superior safety features.", ["persuade", "force", "discourage", "trick"], "highlighting safety features indicates trying to convince"),
    ("hesitate", "When asked the difficult question, the politician seemed to ______ for a moment before giving her answer.", ["hesitate", "shout", "rush", "laugh"], "for a moment before giving her answer implies pausing"),
    ("survive", "Camels are well adapted to the desert and can ______ for long periods without drinking any water.", ["survive", "perish", "drown", "freeze"], "without drinking water implies staying alive in harsh conditions")
]

def generate_questions():
    bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"
    
    os.makedirs(os.path.dirname(bank_path), exist_ok=True)
    
    try:
        with open(bank_path, "r", encoding="utf-8") as f:
            bank = json.load(f)
    except FileNotFoundError:
        bank = []
        
    count = 0
    for word, text_body, raw_choices, clue in items:
        prompt = f"{text_body}\n\nWhich choice completes the text with the most logical and precise word or phrase?"
        
        correct_word = raw_choices[0]
        
        shuffled_choices = list(raw_choices)
        random.shuffle(shuffled_choices)
        
        correct_letter = chr(65 + shuffled_choices.index(correct_word))
        
        distractor_explanations = {}
        for i, c in enumerate(shuffled_choices):
            letter = chr(65 + i)
            if c != correct_word:
                distractor_explanations[letter] = f"This word does not fit the context. The context emphasizes that {clue}."
                
        explanation_correct = f"The word '{correct_word}' is the most logical and precise choice because {clue}."
        
        q = {
            "id": f"antigravity-easy-{uuid.uuid4().hex[:8]}",
            "section": "Reading and Writing",
            "domain": "Craft and Structure",
            "skill": "Words in Context",
            "difficulty": "Easy",
            "prompt": prompt,
            "type": "MCQ",
            "choices": shuffled_choices,
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": explanation_correct,
                "distractors": distractor_explanations
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "sourceSignalId": "antigravity-easy-rw-craft1",
                "cognitiveMove": "Synthesize context clues to determine the meaning of the missing word.",
                "trapTypes": ["Opposite Meaning", "Related but Wrong Tone"]
            }
        }
        
        bank.append(q)
        count += 1
        
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"Added {count} Easy R&W Craft questions. Total in bank: {len(bank)}")

if __name__ == '__main__':
    generate_questions()
