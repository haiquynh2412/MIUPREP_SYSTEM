import json, os, re
from collections import Counter

data_dir = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"

# Check which banks the frontend actually loads
print("=== Checking data loaders ===")
with open(r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\sat_data_loaders.js","r",encoding="utf-8") as f:
    content = f.read()
json_refs = re.findall(r'["\']([^"\']*\.json)["\']', content)
print("JSON files referenced in sat_data_loaders.js:")
for r in sorted(set(json_refs)):
    print(f"  {r}")

# antigravity-bank quality audit
with open(os.path.join(data_dir, "antigravity-bank.json"), "r", encoding="utf-8") as f:
    bank = json.load(f)

no_trap = [q for q in bank if not q.get("metadata",{}).get("trapTypes")]
no_cog = [q for q in bank if not q.get("metadata",{}).get("cognitiveMove")]
print(f"\n=== antigravity-bank.json Missing Metadata ===")
print(f"Missing trapTypes: {len(no_trap)}")
print(f"Missing cognitiveMove: {len(no_cog)}")

latex_count = 0
for q in bank:
    qs = json.dumps(q)
    if "\\frac" in qs or "\\sqrt" in qs or "\\pi" in qs or "\\cdot" in qs:
        latex_count += 1
print(f"LaTeX command remnants: {latex_count}")

ids = [q.get("id") for q in bank]
dupes = [qid for qid, c in Counter(ids).items() if c > 1]
print(f"Duplicate IDs: {len(dupes)}")

# Check opensat-pinesat
with open(os.path.join(data_dir, "opensat-pinesat.json"), "r", encoding="utf-8") as f:
    opensat = json.load(f)
print(f"\n=== opensat-pinesat.json ===")
print(f"Total: {len(opensat)}")
opensat_latex = sum(1 for q in opensat if "\\frac" in json.dumps(q) or "\\sqrt" in json.dumps(q))
print(f"LaTeX remnants: {opensat_latex}")
opensat_ids = [q.get("id") for q in opensat]
opensat_dupes = [qid for qid, c in Counter(opensat_ids).items() if c > 1]
print(f"Duplicate IDs: {len(opensat_dupes)}")

# Cross-bank duplicate check
all_ids = ids + opensat_ids
cross_dupes = [qid for qid, c in Counter(all_ids).items() if c > 1]
print(f"\n=== Cross-Bank Duplicate IDs (antigravity + opensat) ===")
print(f"Total cross-duplicates: {len(cross_dupes)}")

# Check how the app.js / index.html loads banks
with open(r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\index.html","r",encoding="utf-8") as f:
    idx = f.read()
html_json_refs = re.findall(r'["\']([^"\']*\.json)["\']', idx)
print(f"\nJSON files in index.html:")
for r in sorted(set(html_json_refs)):
    print(f"  {r}")
