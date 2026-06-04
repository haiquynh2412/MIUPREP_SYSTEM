import json

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

with open(bank_path, "r", encoding="utf-8") as f:
    bank = json.load(f)

easy_questions = [
    q for q in bank 
    if q.get("difficulty") == "Easy" 
    and q.get("metadata", {}).get("sourceSignalId", "").startswith("antigravity-easy")
]
print(f"Total newly generated Easy questions: {len(easy_questions)}")

errors = {
    "latex_found": 0,
    "missing_metadata": 0,
    "missing_trapTypes": 0,
    "missing_cognitiveMove": 0,
    "missing_explanation": 0,
    "invalid_choice_length": 0
}

for q in easy_questions:
    q_str = json.dumps(q)
    
    if "$" in q_str:
        errors["latex_found"] += 1
        
    meta = q.get("metadata", {})
    if not meta:
        errors["missing_metadata"] += 1
    else:
        if "trapTypes" not in meta:
            errors["missing_trapTypes"] += 1
        if "cognitiveMove" not in meta:
            errors["missing_cognitiveMove"] += 1
            
    if not q.get("explanation") or "correct" not in q.get("explanation"):
        errors["missing_explanation"] += 1
        
    if len(q.get("choices", [])) != 4 and q.get("type") == "MCQ":
        errors["invalid_choice_length"] += 1

print("\n--- Error Report ---")
for k, v in errors.items():
    print(f"{k}: {v}")
