import json

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

with open(bank_path, "r", encoding="utf-8") as f:
    bank = json.load(f)

needs_review_qs = []
stale_metadata_qs = []

for q in bank:
    status = q.get("reviewStatus", "")
    if status == "needs_review":
        needs_review_qs.append(q)
    elif q.get("metadata", {}).get("reviewStatus") == "needs_review":
        stale_metadata_qs.append(q)

print(f"Total questions needing review: {len(needs_review_qs)}")
if stale_metadata_qs:
    print(
        f"Stale metadata reviewStatus markers ignored: {len(stale_metadata_qs)} "
        "(top-level reviewStatus is authoritative)"
    )

# Summarize the domains/skills/difficulty of these questions
summary = {}
for q in needs_review_qs:
    key = f"{q.get('section')} | {q.get('domain')} | {q.get('skill', 'N/A')} | {q.get('difficulty')}"
    summary[key] = summary.get(key, 0) + 1

print("\n--- Breakdown by Category ---")
for k, v in summary.items():
    print(f"{k}: {v}")

# Take a look at the first few to see if there's any obvious issue
print("\n--- Sample IDs and sourceSignalIds ---")
for q in needs_review_qs[:10]:
    print(f"ID: {q.get('id')}")
    print(f"Source Signal ID: {q.get('sourceSignalId') or q.get('metadata', {}).get('sourceSignalId', 'N/A')}")
    print(f"Prompt preview: {q.get('prompt', '')[:100]}...")
    print("-------------------------")
