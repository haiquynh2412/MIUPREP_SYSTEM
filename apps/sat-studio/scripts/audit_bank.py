"""Audit antigravity bank data integrity."""
import json
from pathlib import Path
from collections import Counter

bank_path = Path(__file__).resolve().parents[1] / "data" / "antigravity-bank.json"
bank = json.loads(bank_path.read_text(encoding="utf-8"))
print(f"Bank size: {len(bank)} questions\n")

# Check Grid-in answers are mentioned in explanations
print("=== Grid-in answer verification ===")
for q in bank:
    if q.get("skill") != "Grid-in":
        continue
    qid = q.get("id", "")
    correct = q.get("correctAnswer", "")
    expl = q.get("explanation", {})
    expl_text = expl.get("correct", "") if isinstance(expl, dict) else str(expl)
    snippet = q["prompt"][:65].replace("\n", " ")
    status = "OK" if correct in expl_text else "WARNING: answer not in explanation"
    print(f"  {qid}: answer={correct} | {status}")
    print(f"    {snippet}...")

# Verify the delivery driver question math
print("\n=== Manual math verification ===")
for q in bank:
    if "delivery driver" in q.get("prompt", "").lower():
        # Expected: $48 + 32*2.25 = $48 + $72 = $120 gross
        # Fuel: 105/25 = 4.2 gal * $3.60 = $15.12
        # Net: $120 - $15.12 = $104.88
        print(f"  {q['id']}: claimed answer = {q['correctAnswer']}")
        print(f"    Calculated: 48 + 32*2.25 = {48+32*2.25}")
        print(f"    Fuel: 105/25 * 3.60 = {(105/25)*3.60:.2f}")
        print(f"    Net: {48+32*2.25 - (105/25)*3.60:.2f}")
        if abs(float(q["correctAnswer"]) - (48 + 32*2.25 - (105/25)*3.60)) > 0.01:
            print("    BUG: correctAnswer does NOT match calculation!")
        else:
            print("    MATCH: correctAnswer is mathematically correct")

# Skill distribution
print("\n=== Skill distribution ===")
skills = Counter(q.get("skill", "?") for q in bank)
for skill, count in skills.most_common():
    print(f"  {skill}: {count}")

# Check for missing metadata fields
print("\n=== Metadata completeness ===")
required = ["id", "section", "domain", "skill", "difficulty", "sourceType",
            "reviewStatus", "prompt", "correctAnswer", "explanation"]
issues = []
for q in bank:
    for key in required:
        if key not in q or not q[key]:
            issues.append(f"{q.get('id','?')}: missing '{key}'")
if issues:
    print(f"  {len(issues)} issues found:")
    for iss in issues[:10]:
        print(f"    {iss}")
else:
    print("  All questions have complete metadata")
