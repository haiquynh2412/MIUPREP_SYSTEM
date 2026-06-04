import json
import os
from collections import Counter

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
BANK_PATH = os.path.join(DATA_DIR, "antigravity-bank.json")
TAXONOMY_PATH = os.path.join(DATA_DIR, "canonical-sat-taxonomy.json")

if not os.path.exists(BANK_PATH) or not os.path.exists(TAXONOMY_PATH):
    print("Required files not found.")
    exit(1)

with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
    taxonomy = json.load(f)

with open(BANK_PATH, "r", encoding="utf-8") as f:
    bank = json.load(f)

# Build a mapping from aliases and normalized names to canonical skill names
canonical_skills = {}
for section, s_info in taxonomy["sections"].items():
    for domain, d_info in s_info["domains"].items():
        for canonical_name, c_info in d_info["canonicalSkills"].items():
            # Add canonical name (lower case and exact)
            canonical_skills[canonical_name.lower()] = canonical_name
            # Add all aliases (lower case)
            for alias in c_info.get("aliases", []):
                canonical_skills[alias.lower()] = canonical_name

# Count in bank
qs = bank.get("questions", []) if isinstance(bank, dict) else bank
raw_counts = Counter()
canonical_counts = Counter()
unmapped_skills = Counter()

for q in qs:
    skill = q.get("skill") or q.get("domain") or "Unknown"
    raw_counts[skill] += 1
    
    skill_lower = skill.strip().lower()
    if skill_lower in canonical_skills:
        canonical_counts[canonical_skills[skill_lower]] += 1
    else:
        unmapped_skills[skill] += 1

print(f"Total questions in bank: {len(qs)}")
print("\nCANONICAL SKILL COVERAGE SUMMARY (Normalized):")
print("=" * 70)

# Print all canonical skills and their active counts
all_canonical_list = []
for section, s_info in taxonomy["sections"].items():
    for domain, d_info in s_info["domains"].items():
        for canonical_name in d_info["canonicalSkills"].keys():
            all_canonical_list.append((section, domain, canonical_name))

# Sort by count (increasing)
sorted_canonical = []
for sec, dom, name in all_canonical_list:
    count = canonical_counts[name]
    sorted_canonical.append((sec, dom, name, count))

sorted_canonical.sort(key=lambda x: x[3])

for sec, dom, name, count in sorted_canonical:
    print(f"- [{sec} | {dom}] '{name}' -> {count} questions")

if unmapped_skills:
    print("\nUNMAPPED SKILL LABELS FOUND IN BANK (Provenance/Legacy labels):")
    print("-" * 70)
    for skill, count in unmapped_skills.most_common(10):
        print(f"  - '{skill}': {count} questions")
