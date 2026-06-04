import json, os, sys

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
BANK_PATH = os.path.join(DATA_DIR, "antigravity-bank.json")
BRAIN_DIR = r"c:\Users\HAIQUYNH\.gemini\antigravity\brain"

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
        print("Provide conversation IDs as arguments")
        sys.exit(1)
        
    cids = sys.argv[1:]
    
    try:
        with open(BANK_PATH, "r", encoding="utf-8") as f:
            bank = json.load(f)
    except Exception:
        bank = []
        
    valid_count = 0
    for cid in cids:
        log_path = os.path.join(BRAIN_DIR, cid, ".system_generated", "logs", "transcript.jsonl")
        if not os.path.exists(log_path):
            print(f"SKIP: Log not found for {cid}")
            continue
            
        # We look for the last message from the MODEL
        last_json = None
        with open(log_path, "r", encoding="utf-8") as f:
            for line in f:
                step = json.loads(line)
                if step.get("source") == "MODEL" and step.get("type") == "PLANNER_RESPONSE":
                    content = step.get("content", "")
                    start = content.find("{")
                    end = content.rfind("}")
                    if start != -1 and end != -1:
                        last_json = content[start:end+1]
                        
        if not last_json:
            print(f"FAIL: No JSON found in {cid}")
            continue
            
        try:
            q = json.loads(last_json)
        except json.JSONDecodeError as e:
            print(f"FAIL: Invalid JSON in {cid} - {e}")
            continue
            
        errs = validate_q(q)
        if errs:
            print(f"FAIL: Validation failed for {q.get('id', cid)}")
            for e in errs:
                print(f"  - {e}")
        else:
            bank.append(q)
            valid_count += 1
            print(f"PASS: {q.get('id')}")
            
    with open(BANK_PATH, "w", encoding="utf-8") as f:
        json.dump(bank, f, indent=2, ensure_ascii=False)
        
    print(f"\nAdded {valid_count} valid questions. Bank total: {len(bank)}")
