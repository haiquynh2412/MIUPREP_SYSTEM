import sys, json, os

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
BANK_PATH = os.path.join(DATA_DIR, "antigravity-bank.json")

def validate_q(q):
    errors = []
    if q.get("type") != "MCQ":
        errors.append("Not MCQ")
    
    expl = q.get("explanation", {}).get("correct", "")
    if len(expl) < 200:
        errors.append(f"Explanation too short ({len(expl)} chars)")
    
    dual_keywords = ["Fast", "Slow", "Step", "Method"]
    if not any(k in expl for k in dual_keywords):
        errors.append("Missing dual-path keywords")
    
    draft_markers = ["Hmm", "Wait", "Let me", "Actually", "Redesign"]
    for m in draft_markers:
        if m in json.dumps(q, ensure_ascii=False):
            errors.append(f"Contains draft marker '{m}'")
            break
            
    if "choices" in q:
        letters = [c.get("letter") for c in q["choices"]]
        correct = q.get("correctAnswer")
        if correct not in letters:
            errors.append(f"correctAnswer '{correct}' not in choices {letters}")
            
        dists = q.get("explanation", {}).get("distractors", {})
        expected = set(letters) - {correct}
        if set(dists.keys()) != expected:
            errors.append(f"Distractor keys {set(dists.keys())} do not match expected {expected}")
            
    return errors

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("FAIL: No file provided")
        sys.exit(1)
        
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        raw = f.read().strip()
        
    # Find the JSON block
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        print("FAIL: No JSON object found")
        sys.exit(1)
        
    json_str = raw[start:end+1]
    try:
        q = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"FAIL: Invalid JSON - {e}")
        sys.exit(1)
        
    errs = validate_q(q)
    if errs:
        print("FAIL: Validation errors:")
        for e in errs:
            print(f"  - {e}")
        sys.exit(1)
        
    # Append to bank
    try:
        with open(BANK_PATH, "r", encoding="utf-8") as f:
            bank = json.load(f)
    except Exception:
        bank = []
        
    bank.append(q)
    
    with open(BANK_PATH, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"SUCCESS: Saved {q.get('id')} to bank")
