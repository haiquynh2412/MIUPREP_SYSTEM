import json
import uuid
import random

def create_bank():
    raw_data = """1|Owls|hearing|hunt at night|hear a mouse moving under the snow|Their ears are placed at different heights|owls do not need to rely only on their eyes|Owls rely on their excellent hearing to hunt in the dark.|Owls have ears placed at different heights.|Animals have many different ways to hunt for food.|Owls can hear mice under the snow.
1|Camels|humps|survive in the desert|go for days without water|The humps store fat that the camel uses for energy|camels can travel long distances in very harsh conditions|Camels are well adapted to survive in harsh desert conditions.|Camels store fat in their humps for energy.|Desert animals must find ways to deal with the heat.|Camels can go for days without drinking water.
1|Cheetahs|incredible speed|catch fast prey|run up to 70 miles per hour|They have long legs and a flexible spine|cheetahs are the best sprinters in the animal kingdom|Cheetahs use their speed and bodies to catch prey.|Cheetahs have a flexible spine.|Many wild cats are good hunters.|Cheetahs can run up to 70 miles per hour.
1|Penguins|thick feathers|stay warm in cold places|swim in icy ocean water|Their feathers trap a layer of warm air next to their skin|penguins can live in the freezing environment of Antarctica|Penguins have special feathers that keep them warm in freezing environments.|Penguins trap warm air next to their skin.|Birds live in many different climates.|Penguins swim in icy ocean water.
1|Elephants|trunks|grab things and drink water|pick up heavy logs easily|They also use their trunks to spray themselves with cool water|elephants use their trunks as very helpful tools|Elephants use their trunks for many important daily tasks.|Elephants use their trunks to spray themselves with water.|Large animals need special body parts to survive.|Elephants can pick up heavy logs.
1|Dolphins|echolocation|find fish underwater|make clicking sounds that bounce off objects|They can locate small fish even in dark water|dolphins are excellent at finding their next meal|Dolphins use sound to help them locate food in the water.|Dolphins make clicking sounds that bounce off objects.|Ocean animals have many ways to find food.|Dolphins can locate small fish.
1|Honeybees|special dances|communicate with the hive|wiggle their bodies in a specific pattern|This dance tells other bees exactly where to find flowers|bees work together perfectly to gather food|Honeybees use dances to tell each other where to find food.|Honeybees wiggle their bodies in a specific pattern.|Insects often live together in large groups.|The dance tells other bees about flowers.
1|Frogs|sticky tongues|catch flying insects|shoot their tongues out in a fraction of a second|The sticky surface grabs onto fast-moving bugs|frogs do not have to chase their food around|Frogs catch their food easily using their special sticky tongues.|The sticky surface grabs onto bugs.|Amphibians eat many different types of food.|Frogs can shoot their tongues out quickly.
1|Woodpeckers|strong beaks|find bugs hidden in trees|drill deep holes into thick bark|They have a special skull that protects their brain while they peck|woodpeckers can reach food that other birds cannot|Woodpeckers use their strong beaks to get food from inside trees.|Woodpeckers have a special skull to protect their brain.|Birds use their beaks for many different things.|Woodpeckers drill holes into thick bark.
1|Kangaroos|powerful back legs|jump across long distances|travel very fast across the Australian outback|They use their large tails to keep their balance while hopping|kangaroos can move swiftly without running|Kangaroos use their strong legs and tails to travel quickly.|Kangaroos use their tails to keep balance.|Australian animals have unique ways of moving.|Kangaroos travel across the outback.
2|Amelia Earhart|being a brave pioneer in aviation|flew solo across the Atlantic Ocean|set many speed and distance records in her airplane|she is remembered as an inspiring hero|Amelia Earhart was a brave and record-setting pilot.|Amelia Earhart flew solo across the Atlantic Ocean.|Many people have contributed to the history of flying.|Amelia Earhart set speed records.
2|Thomas Edison|inventing the practical light bulb|tested thousands of different materials in his lab|created a bulb that could stay lit for a long time|he is known for changing how we light our homes|Thomas Edison worked hard to invent a useful light bulb.|Edison tested thousands of materials in his lab.|Inventors often have to try many times to succeed.|Edison created a bulb that stayed lit.
2|Marie Curie|her groundbreaking work in science|discovered new radioactive elements like radium|worked tirelessly in her laboratory for many years|her discoveries continue to help in medicine|Marie Curie made important scientific discoveries through hard work.|Marie Curie discovered radium.|Scientists work in laboratories for many years.|Marie Curie worked tirelessly in her laboratory.
2|George Washington Carver|finding new uses for crops|discovered hundreds of products that could be made from peanuts|taught farmers how to keep their soil healthy|he is celebrated as a great agricultural scientist|George Washington Carver found new ways to use crops and help farmers.|Carver discovered products made from peanuts.|Farming requires a lot of knowledge and hard work.|Carver taught farmers to keep soil healthy.
2|Florence Nightingale|improving how hospitals care for the sick|checked on patients late at night with a lamp|trained other nurses to keep everything clean and safe|she is considered the founder of modern nursing|Florence Nightingale changed nursing by making hospitals safer and cleaner.|Nightingale checked on patients with a lamp.|Hospitals have changed a lot over the years.|Nightingale trained other nurses.
2|Alexander Graham Bell|his invention of the telephone|experimented with different ways to send sound over wires|made the first famous phone call to his assistant|his invention changed how people communicate forever|Alexander Graham Bell changed communication by inventing the telephone.|Bell made the first famous phone call to his assistant.|Communication has always been important to people.|Bell experimented with wires.
2|Rosa Parks|helping to start the civil rights movement|bravely refused to give up her bus seat|inspired a huge boycott of the city buses|she is known as a symbol of courage and fairness|Rosa Parks showed great courage and helped start the civil rights movement.|Rosa Parks refused to give up her bus seat.|Many people fought for fairness in the past.|Rosa Parks inspired a bus boycott.
2|Neil Armstrong|being the first person to walk on the moon|flew the Apollo 11 spacecraft on a dangerous mission|took a giant leap for humanity|he is famous around the world for his space journey|Neil Armstrong is famous for successfully landing and walking on the moon.|Armstrong flew the Apollo 11 spacecraft.|Space travel is very difficult and dangerous.|Armstrong took a giant leap.
2|Sally Ride|being the first American woman in space|operated the robotic arm on the space shuttle|spent her later years writing science books for children|she continues to inspire young girls to study science|Sally Ride was an inspiring astronaut who encouraged girls in science.|Sally Ride operated a robotic arm.|Space shuttles have carried many astronauts into space.|Sally Ride wrote science books for children.
2|Leonardo da Vinci|his amazing art and creative inventions|painted masterpieces like the Mona Lisa|drew detailed sketches of flying machines long before airplanes existed|he is remembered as a true genius|Leonardo da Vinci was a highly creative artist and inventor.|Da Vinci painted the Mona Lisa.|The Renaissance was a time of great art and ideas.|Da Vinci drew sketches of flying machines.
3|plants|need sunlight to survive|their leaves will turn yellow and fall off|they will not have enough energy to make their own food|sunlight is the most essential thing for a plant to grow|Sunlight is necessary for plants to produce energy and survive.|A plant's leaves will turn yellow without sunlight.|Plants need several things to stay healthy.|Plants make their own food.
3|the human heart|works constantly to pump blood|muscles would not receive oxygen|the body could not remove waste quickly enough|the heart is vital for keeping the entire body alive|The heart is a vital organ that keeps the body functioning.|The heart pumps blood so muscles get oxygen.|The human body is made of many complex systems.|The body removes waste.
3|sleep|helps the brain function properly|it is very hard to remember things learned during the day|people often feel cranky and cannot focus|getting enough rest is crucial for a healthy mind|Getting enough sleep is important for memory and focus.|People often feel cranky without enough sleep.|Health requires a balance of many different habits.|Sleep helps the brain store information.
3|recycling|saves important natural resources|we would run out of space in landfills very quickly|we would have to cut down more forests for paper|recycling is an easy way to protect our environment|Recycling is a simple practice that protects the earth's resources.|We would cut down more forests without recycling.|There are many ways people can help the planet.|Landfills would fill up quickly.
3|water|makes up a large part of the human body|people become dehydrated and very tired|organs cannot perform their daily tasks|drinking water regularly is necessary for good health|Drinking water is essential because the body relies on it.|People become dehydrated without enough water.|Staying healthy involves many daily choices.|Organs need water to perform tasks.
3|gravity|keeps everything anchored to the ground|we would float away into the sky|the moon would not stay in orbit around the Earth|gravity is the invisible force that holds our world together|Gravity is an invisible force that keeps things in place.|Without gravity, we would float into the sky.|There are many forces at work in the universe.|The moon stays in orbit.
3|exercise|strengthens both the muscles and the heart|people might become weak over time|the body becomes more easily stressed and tired|physical activity is a key part of staying strong|Exercise is important for keeping the body strong and healthy.|Without exercise, people might become weak.|People enjoy many different types of physical activity.|Exercise strengthens the muscles.
3|brushing your teeth|prevents painful cavities from forming|sugar and bacteria would slowly destroy the tooth enamel|visiting the dentist would be much more unpleasant|brushing daily is the best way to maintain a healthy smile|Brushing teeth daily is essential for preventing cavities.|Sugar and bacteria destroy tooth enamel.|Dental care is an important part of personal hygiene.|Visiting the dentist can be unpleasant.
3|teamwork|makes it easier to finish large projects|one person might feel completely overwhelmed by the work|the project might take much longer to complete|working together is often the most effective way to succeed|Teamwork is an effective way to complete large projects efficiently.|One person might feel overwhelmed working alone.|Large projects require a lot of planning.|The project might take much longer.
3|saving money|provides a safety net for the future|unexpected emergencies can cause serious financial trouble|it becomes very hard to buy a house or a car later|putting money away is important for financial stability|Saving money is important because it provides future financial stability.|Unexpected emergencies can cause financial trouble.|Everyone manages their finances differently.|It can be hard to buy a car later.
4|the Sahara Desert|its extreme heat and dryness|it receives very little rain throughout the entire year|only a few tough plants and animals can survive there|The Sahara Desert is known for its extremely hot and dry climate.|It receives very little rain throughout the year.|Deserts are difficult places for most animals to live.|Only a few plants can survive there.
4|Mount Everest|being the highest mountain on Earth|the air is very thin and freezing cold near the top|climbers must train for years before trying to reach the peak|Mount Everest is famous for being a very high and challenging mountain.|Climbers must train for years before going.|Mountains can be found on every continent.|The air is thin and freezing near the top.
4|the Amazon Rainforest|its incredible variety of living things|it is home to millions of different plants and insects|heavy rainfall keeps the trees green all year long|The Amazon Rainforest is famous for its wide variety of plants and animals.|It is home to millions of different insects.|Rainforests are very important for the earth's environment.|Heavy rainfall keeps the trees green.
4|Antarctica|being the coldest and iciest continent|massive glaciers cover almost all of the land|Emperor penguins gather in huge groups to stay warm|Antarctica is known as an extremely cold continent covered in ice.|Massive glaciers cover almost all of the land.|The world has many different types of climates.|Emperor penguins gather to stay warm.
4|the Great Barrier Reef|its massive and colorful coral structures|thousands of bright fish swim among the reefs every day|the warm waters attract divers from all over the globe|The Great Barrier Reef is famous for its large and beautiful coral structures.|Thousands of bright fish swim there every day.|The oceans contain many beautiful natural wonders.|The warm waters attract divers.
4|the Grand Canyon|its deep and colorful rocky walls|the vast canyon was carved by a river over millions of years|the amazing views look different as the sun moves|The Grand Canyon is known for its huge size and beautiful rock walls.|The canyon was carved over millions of years.|National parks protect many beautiful landscapes.|The views change as the sun moves.
4|Venice|having unique water canals instead of normal roads|people travel by riding in small boats called gondolas|beautiful footbridges connect the different parts of the city|Venice is famous for using canals and boats instead of roads.|People travel in boats called gondolas.|Italy is a country with many interesting cities.|Beautiful footbridges connect the city.
4|the Dead Sea|its incredibly salty water|people can float easily on the surface without trying|the water is too salty for any fish to live in|The Dead Sea is known for being so salty that people float easily.|The water is too salty for fish to live in.|There are many interesting bodies of water in the world.|People can float on the surface.
4|Yellowstone National Park|its bubbling hot springs and geysers|giant bison roam freely across the green valleys|the Old Faithful geyser shoots hot water high into the air|Yellowstone is famous for its unique hot springs and wildlife.|Bison roam freely across the valleys.|America has many wonderful national parks.|Old Faithful shoots hot water.
4|the Mariana Trench|being the deepest part of the ocean|the water pressure is high enough to crush a submarine|pitch black darkness hides strange and glowing sea creatures|The Mariana Trench is known as the deepest and darkest part of the ocean.|The water pressure could crush a submarine.|The ocean is full of unexplored and mysterious places.|Pitch black darkness hides strange creatures.
5|the automobile|people traveled slowly by horse and carriage|trips between towns took days instead of hours|cars let people drive comfortably over long distances|the automobile completely changed how quickly people travel|Cars revolutionized travel by making long-distance trips much faster.|Trips between towns used to take days.|Transportation has changed a lot over time.|People used to travel by horse and carriage.
5|the refrigerator|food spoiled very quickly in the summer heat|families had to buy fresh food almost every day|fridges kept milk and vegetables cold and safe for weeks|the refrigerator made storing food much easier and safer|The refrigerator made it easier and safer to store food for longer.|Families used to buy fresh food every day.|Kitchen appliances have made cooking much simpler.|Food used to spoil quickly in the heat.
5|the airplane|crossing oceans took weeks on a crowded ship|travelers were often tired and seasick during the long journey|planes could fly across the world in just a few hours|the airplane revolutionized long-distance travel forever|Airplanes completely changed how people travel long distances.|Crossing oceans used to take weeks on a ship.|Travel used to be much more difficult than it is now.|Travelers were often tired and seasick.
5|the internet|finding information required trips to the local library|looking up simple facts was slow and required heavy encyclopedias|computers could connect to vast amounts of information instantly|the internet transformed how we learn and share facts|The internet changed how people find and share information.|Finding information used to require library trips.|Technology has advanced rapidly in recent years.|Computers connect to information instantly.
5|the camera|painting portraits took a very long time|capturing a specific moment accurately was nearly impossible|photos could freeze a scene in a fraction of a second|the camera gave us a simple way to preserve visual memories|Cameras provided a fast and easy way to capture visual memories.|Painting portraits used to take a long time.|Art has taken many forms throughout history.|Photos freeze a scene in a fraction of a second.
5|the magnetic compass|sailors easily got lost at sea when it was cloudy|navigating by the stars was risky in bad weather|the compass needle always pointed north to guide the ship|the compass made ocean navigation much safer and more reliable|The compass made it much safer and easier to navigate the ocean.|Navigating by the stars was risky in bad weather.|Exploring the world has always involved some risks.|Sailors got lost when it was cloudy.
5|antibiotics|minor cuts could easily cause serious and deadly problems|doctors had very few medicines to fight off infections|these new drugs killed the harmful bacteria quickly|antibiotics saved millions of lives by stopping dangerous infections|Antibiotics changed medicine by effectively stopping dangerous infections.|Minor cuts used to cause serious problems.|Medicine has improved greatly over the last century.|The drugs killed harmful bacteria.
5|the printing press|books were copied by hand one word at a time|they were very rare and expensive for normal people to buy|machines could print hundreds of pages very quickly|the printing press made books available to everyone|The printing press made it possible for everyone to have books.|Books were copied by hand one word at a time.|Reading is an important skill for everyone to learn.|Books were rare and expensive.
5|air conditioning|hot summers made indoor work extremely difficult|people had to leave their windows open and hope for a breeze|AC cooled the air inside and made rooms comfortable|air conditioning made living in hot places much easier|Air conditioning made indoor spaces comfortable during hot weather.|People used to leave their windows open for a breeze.|Summer weather can be very uncomfortable.|Hot summers made indoor work difficult.
5|the telescope|the night sky was mostly a complete mystery|people could only see nearby stars with their own eyes|special lenses made distant planets look close and clear|the telescope changed our understanding of the universe|The telescope allowed people to see and understand the universe better.|People could only see nearby stars with their eyes.|Scientists have always wanted to learn about space.|Special lenses made distant planets look close.
6|Learning to swim|staying safe in the water|you know how to float if you get tired|prevents dangerous accidents at the pool or beach|Learning to swim is important for staying safe in the water.|You know how to float if you get tired.|Summer activities often involve water sports.|It prevents accidents at the pool.
6|Practicing a musical instrument|becoming a skilled musician|you learn to read the notes quickly|trains your fingers to move smoothly over the keys|Practicing regularly helps you become a better musician.|You learn to read the notes quickly.|Music is a beautiful form of art.|It trains your fingers to move smoothly.
6|Cooking at home|eating healthier and cheaper meals|you can choose exactly which fresh ingredients to use|saves you money that you would spend at restaurants|Cooking your own meals is a healthy and affordable choice.|You can choose fresh ingredients.|Food is an important part of daily life.|It saves money spent at restaurants.
6|Stretching before running|preventing painful muscle injuries|you warm up your body for the heavy exercise|makes your legs flexible and ready to move fast|Stretching is an important way to prevent injuries during exercise.|You warm up your body for exercise.|Running is a very popular sport.|It makes your legs flexible.
6|Writing a rough draft|creating a well-organized essay|you get all of your main ideas onto the paper|makes it much easier to fix mistakes later on|Writing a rough draft makes it easier to write a good essay.|You get your main ideas onto the paper.|Writing takes a lot of practice to master.|It makes it easier to fix mistakes.
6|Taking good notes in class|remembering what the teacher said|you have something useful to study before a big test|highlights the most important points from the lesson|Taking notes is a great way to remember and study information.|You have something to study before a test.|School requires a lot of hard work.|It highlights important points.
6|Asking questions|understanding confusing topics better|you get direct help from the teacher when you need it|clears up any doubts so you can learn more effectively|Asking questions helps you understand topics you find confusing.|You get direct help from the teacher.|Teachers are there to help students learn.|It clears up your doubts.
6|Planting trees|improving the air quality in your neighborhood|you provide nice shade for people on hot days|gives local birds and squirrels a safe home|Planting trees improves the neighborhood by cleaning the air and providing shade.|You provide shade on hot days.|Nature is full of beautiful plants.|It gives birds a safe home.
6|Cleaning your room|finding your things easily when you need them|you keep dust away and have a neat space|makes you feel more relaxed at the end of the day|Cleaning your room helps you stay organized and feel relaxed.|You can find things easily when you need them.|A messy room can be annoying.|You keep dust away.
6|Being kind to others|building a happy and supportive community|you make good friends who will help you in return|brings comfort to someone who might be feeling sad|Being kind helps create a happy community and strong friendships.|You make good friends who will help you.|Communities are made of many different people.|It brings comfort to someone who is sad."""

    questions = []
    lines = raw_data.strip().split('\n')
    for line in lines:
        if not line.strip(): continue
        parts = line.split('|')
        t_id = parts[0]
        
        if t_id == '1':
            name, feature, goal, d1, d2, conc, correct, spec, broad, tnm = parts[1:]
            text = f"{name} use their {feature} to {goal}. For example, they can {d1}. {d2}. Because of this, {conc}."
        elif t_id == '2':
            name, achievement, d1, d2, conc, correct, spec, broad, tnm = parts[1:]
            text = f"{name} is remembered for {achievement}. During their life, they {d1}. They also {d2}. Today, {conc}."
        elif t_id == '3':
            subject, feature, d1, d2, conc, correct, spec, broad, tnm = parts[1:]
            text = f"Many people do not realize that {subject} {feature}. Without this, {d1}. Furthermore, {d2}. Therefore, {conc}."
        elif t_id == '4':
            place, feature, d1, d2, correct, spec, broad, tnm = parts[1:]
            text = f"{place} is well known for {feature}. Visitors will notice that {d1}. Additionally, {d2}. It is truly one of the most interesting environments in the world."
        elif t_id == '5':
            invention, past, d1, d2, conc, correct, spec, broad, tnm = parts[1:]
            text = f"Before the invention of {invention}, {past}. People had to {d1}. However, {d2}. Thus, {conc}."
        elif t_id == '6':
            habit, benefit, d1, d2, correct, spec, broad, tnm = parts[1:]
            text = f"{habit} is very important for {benefit}. When you do this, {d1}. It also {d2}. If you want to stay healthy and happy, you should make this a part of your daily routine."
        else:
            continue

        q_id = f"antigravity-easy-{uuid.uuid4().hex[:8]}"
        
        options = [
            ("Correct", correct),
            ("Too Specific", spec),
            ("Too Broad", broad),
            ("True but not Main Idea", tnm)
        ]
        random.shuffle(options)
        
        choices = []
        correct_letter = ""
        explanations = {}
        
        for i, (label, content) in enumerate(options):
            letter = chr(65 + i)
            choices.append(content)
            if label == "Correct":
                correct_letter = letter
                explanations["correct"] = "This choice accurately captures the main idea by synthesizing the key points."
            else:
                if label == "Too Specific":
                    explanations[letter] = "This is too specific. It focuses on a minor detail rather than the central idea."
                elif label == "Too Broad":
                    explanations[letter] = "This is too broad. The text is specifically about the subject mentioned, not the general category."
                else:
                    explanations[letter] = "This is true according to the text, but it is a supporting detail, not the main idea."
        
        question = {
            "id": q_id,
            "section": "Reading and Writing",
            "domain": "Information and Ideas",
            "skill": "Central Ideas and Details",
            "difficulty": "Easy",
            "type": "MCQ",
            "prompt": f"{text}\n\nWhich choice best states the main idea of the text?",
            "choices": choices,
            "correctAnswer": correct_letter,
            "explanation": {
                "correct": explanations["correct"],
                "distractors": {
                    k: v for k, v in explanations.items() if k != "correct"
                }
            },
            "metadata": {
                "targetBand": "SAT-1200",
                "sourceSignalId": "antigravity-easy-rw-info1",
                "cognitiveMove": "Synthesize explicit details to identify the central theme",
                "trapTypes": ["Too Specific", "Too Broad", "True but not Main Idea"]
            }
        }
        questions.append(question)
        
    return questions

if __name__ == "__main__":
    bank_file = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

    with open(bank_file, "r", encoding="utf-8") as f:
        bank = json.load(f)

    new_questions = create_bank()
    bank.extend(new_questions)

    with open(bank_file, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)

    print(f"Added {len(new_questions)} Easy R&W Central Ideas questions. Total questions in bank: {len(bank)}")
