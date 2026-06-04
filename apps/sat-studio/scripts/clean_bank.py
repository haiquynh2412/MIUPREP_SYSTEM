import json
import random

random.seed(42) # For reproducible shuffling

BANK_PATH = "data/antigravity-bank.json"

with open(BANK_PATH, "r", encoding="utf-8") as f:
    bank = json.load(f)

# 1. Delete duplicate foundation question antigravity-0ed20ae6
bank = [q for q in bank if q.get("id") != "antigravity-0ed20ae6"]

for q in bank:
    # 2. Fix antigravity-760ca1d2 duplicate choice
    if q.get("id") == "antigravity-760ca1d2":
        if "D" in q.get("choices", {}):
            q["choices"]["D"] = "38\u00b0"
        if "D" in q.get("explanation", {}).get("distractors", {}):
            q["explanation"]["distractors"]["D"] = "38\u00b0 is an incorrect angle, confusing complementary with supplementary angles."

    # 3. Fix Grid-in format
    is_grid_in = q.get("skill") == "Grid-in" or "[Grid-in]" in q.get("prompt", "")
    has_choices = bool(q.get("choices"))
    
    if is_grid_in and has_choices:
        ans_letter = q.get("correctAnswer")
        num_val = q.get("choices", {}).get(ans_letter)
        if num_val:
            # Clean prompt
            prompt = q.get("prompt", "")
            if prompt.startswith("[Grid-in] "):
                q["prompt"] = prompt.replace("[Grid-in] ", "")
            
            # Format as SPR
            del q["choices"]
            q["type"] = "SPR"
            q["correctAnswer"] = num_val
            q["acceptableAnswers"] = [num_val]
            
            if "distractors" in q.get("explanation", {}):
                del q["explanation"]["distractors"]

    # 4. Randomize MC questions
    if q.get("type") != "SPR" and q.get("choices") and len(q["choices"]) == 4:
        # Check if it's multiple choice
        orig_keys = list(q["choices"].keys())
        if set(orig_keys) == {"A", "B", "C", "D"}:
            new_keys = ["A", "B", "C", "D"]
            random.shuffle(new_keys)
            
            mapping = {orig: new for orig, new in zip(orig_keys, new_keys)}
            
            # Update choices
            new_choices = {mapping[k]: v for k, v in q["choices"].items()}
            q["choices"] = {k: new_choices[k] for k in sorted(new_choices.keys())} # Sort A, B, C, D
            
            # Update correct answer
            old_ans = q.get("correctAnswer")
            if old_ans in mapping:
                q["correctAnswer"] = mapping[old_ans]
                
            # Update distractors in explanation
            expl = q.get("explanation", {})
            if "distractors" in expl:
                old_distractors = expl["distractors"]
                new_distractors = {mapping[k]: v for k, v in old_distractors.items() if k in mapping}
                expl["distractors"] = {k: new_distractors[k] for k in sorted(new_distractors.keys())}

with open(BANK_PATH, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Bank processing complete. New size: {len(bank)}")

# Verify the changes
ans_counts = {}
for q in bank:
    if "choices" in q:
        ans = q.get("correctAnswer", "UNKNOWN")
        ans_counts[ans] = ans_counts.get(ans, 0) + 1
print(f"New correct answer distribution for MC: {ans_counts}")

grid_in_count = sum(1 for q in bank if q.get("type") == "SPR" or q.get("skill") == "Grid-in")
print(f"Grid-in (SPR) questions total: {grid_in_count}")
