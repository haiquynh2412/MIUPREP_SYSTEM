import json

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

with open(bank_path, "r", encoding="utf-8") as f:
    bank = json.load(f)

fixed_count = 0

for q in bank:
    if q.get("difficulty") == "Easy" and q.get("metadata", {}).get("sourceSignalId", "").startswith("antigravity-easy"):
        meta = q.get("metadata", {})
        if "trapTypes" not in meta:
            meta["trapTypes"] = ["Calculation Error", "Concept Error", "Misread Question"]
            fixed_count += 1

if fixed_count > 0:
    with open(bank_path, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Fixed missing trapTypes in {fixed_count} questions.")
