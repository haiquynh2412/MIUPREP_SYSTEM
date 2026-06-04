"""
Merge all batch files into antigravity-bank.json and verify totals.
"""
import json, os, glob
from collections import Counter

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
BANK_PATH = os.path.join(DATA_DIR, "antigravity-bank.json")

# Load current bank
with open(BANK_PATH, "r", encoding="utf-8") as f:
    bank = json.load(f)
print(f"Current bank size: {len(bank)}")

# Collect existing IDs
existing_ids = {q["id"] for q in bank}

# Load all batch files
batch_files = sorted(glob.glob(os.path.join(DATA_DIR, "batch_*.json")))
new_total = 0
batch_report = []
for bf in batch_files:
    name = os.path.basename(bf)
    with open(bf, "r", encoding="utf-8") as f:
        batch_qs = json.load(f)
    
    # Skip duplicates
    new_qs = [q for q in batch_qs if q["id"] not in existing_ids]
    dupes = len(batch_qs) - len(new_qs)
    
    for q in new_qs:
        existing_ids.add(q["id"])
    
    bank.extend(new_qs)
    new_total += len(new_qs)
    batch_report.append(f"  {name}: {len(batch_qs)} total, {len(new_qs)} new, {dupes} dupes skipped")

print(f"\nBatch merge report:")
for r in batch_report:
    print(r)
print(f"\nTotal new questions added: {new_total}")
print(f"New bank size: {len(bank)}")

# Save
with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)
print(f"\nSaved to {BANK_PATH}")

# Verify new questions
new_hard_math = [q for q in bank if q.get("difficulty") == "Hard" and q.get("section") == "Math"]
print(f"\nTotal Hard Math in bank: {len(new_hard_math)}")

# Skill breakdown of new questions
new_qs_all = [q for q in bank if q.get("id","").startswith("antigravity-hard-")]
skill_c = Counter(q.get("skill","?") for q in new_qs_all if q.get("difficulty")=="Hard")
print(f"\nHard Math by skill (antigravity-hard-* prefix):")
for s, c in skill_c.most_common():
    print(f"  {s}: {c}")
