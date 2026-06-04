import json

with open("data/antigravity-bank.json", "r", encoding="utf-8") as f:
    bank = json.load(f)

# 1. Check if all correct answers are A
ans_counts = {}
for q in bank:
    if "choices" in q:
        ans = q.get("correctAnswer", "UNKNOWN")
        ans_counts[ans] = ans_counts.get(ans, 0) + 1
print(f"Correct answer distribution: {ans_counts}")

# 2. Check Grid-in questions
grid_in_qs = [q for q in bank if q.get("skill") == "Grid-in" or "[Grid-in]" in q.get("prompt", "")]
print(f"Found {len(grid_in_qs)} Grid-in questions.")
if grid_in_qs:
    print("Sample Grid-in:")
    print(json.dumps({k: v for k, v in grid_in_qs[0].items() if k in ["id", "prompt", "choices", "correctAnswer"]}, indent=2))

# 3. Check antigravity-760ca1d2
q_760 = next((q for q in bank if q.get("id") == "antigravity-760ca1d2"), None)
if q_760:
    print(f"Found 760ca1d2: {json.dumps(q_760.get('choices'), indent=2)}")
else:
    print("Question antigravity-760ca1d2 not found.")

# 4. Check antigravity-0ed20ae6
q_0ed = next((q for q in bank if q.get("id") == "antigravity-0ed20ae6"), None)
if q_0ed:
    print(f"Found 0ed20ae6 prompt: {q_0ed.get('prompt')[:100]}...")
else:
    print("Question antigravity-0ed20ae6 not found.")
