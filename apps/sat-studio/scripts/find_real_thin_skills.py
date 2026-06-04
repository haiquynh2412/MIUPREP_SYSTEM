import json
import os
from collections import Counter

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
path = os.path.join(DATA_DIR, "antigravity-bank.json")

if not os.path.exists(path):
    print("Database not found.")
    exit(1)

with open(path, "r", encoding="utf-8") as f:
    bank = json.load(f)

# Some banks are lists of questions, some might have "questions" key
qs = bank.get("questions", []) if isinstance(bank, dict) else bank

skill_counts = Counter()
for q in qs:
    skill = q.get("skill") or q.get("domain") or "Unknown"
    skill_counts[skill] += 1

print(f"Total questions in bank: {len(qs)}")
print("\nREAL CURRENT THIN SKILLS IN THE ACTIVE BANK (Fewer than 15 questions):")
print("=" * 70)
thin_found = False
for skill, count in sorted(skill_counts.items(), key=lambda x: x[1]):
    if count < 15:
        thin_found = True
        print(f"- Skill: '{skill}' -> Only {count} questions")

if not thin_found:
    print("No skills found with fewer than 15 questions. All skills have robust coverage!")
