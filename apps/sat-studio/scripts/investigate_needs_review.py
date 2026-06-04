import json

bank_path = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json"

with open(bank_path, "r", encoding="utf-8") as f:
    bank = json.load(f)

# Filter active needs_review questions. The top-level reviewStatus is
# authoritative; metadata.reviewStatus can be stale provenance from import.
review_qs = [q for q in bank if q.get("reviewStatus") == "needs_review"]
print(f"Checking {len(review_qs)} questions marked 'needs_review'...\n")

errors = {
    "1. Short/Missing Explanation": 0,
    "2. Missing Distractor Analysis (MCQ)": 0,
    "3. LaTeX/Math Display Errors": 0,
    "4. SPR Format Errors (has choices or A/B/C/D)": 0,
    "5. Invalid SAT Taxonomy (Domain/Skill)": 0,
    "6. Duplicate Options (Equivalent choices)": 0,
    "7. Missing Metadata (trapTypes, cognitiveMove)": 0
}

valid_domains = [
    "Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry",
    "Information and Ideas", "Craft and Structure", "Expression of Ideas", "Standard English Conventions"
]

for q in review_qs:
    q_str = json.dumps(q)
    q_type = q.get("type", "")
    
    # 1. Short/Missing Explanation
    expl = q.get("explanation", {})
    if not expl or "correct" not in expl or len(expl.get("correct", "")) < 30:
        errors["1. Short/Missing Explanation"] += 1
        
    # 2. Missing Distractor Analysis
    if q_type == "MCQ":
        distractors = expl.get("distractors", {})
        if len(distractors) < 3 or any(len(v) < 15 for v in distractors.values()):
            errors["2. Missing Distractor Analysis (MCQ)"] += 1
            
    # 3. LaTeX errors
    if "$" in q_str or "\\frac" in q_str or "\\sqrt" in q_str:
        errors["3. LaTeX/Math Display Errors"] += 1
        
    # 4. SPR Format Errors
    if q_type == "SPR":
        if "choices" in q and len(q["choices"]) > 0:
            errors["4. SPR Format Errors (has choices or A/B/C/D)"] += 1
        elif q.get("correctAnswer") in ["A", "B", "C", "D"]:
            errors["4. SPR Format Errors (has choices or A/B/C/D)"] += 1
            
    # 5. Invalid SAT Taxonomy
    if q.get("domain") not in valid_domains:
        errors["5. Invalid SAT Taxonomy (Domain/Skill)"] += 1
        
    # 6. Duplicate Options
    if q_type == "MCQ" and "choices" in q:
        choice_texts = [c.get("text", "").strip() for c in q["choices"] if isinstance(c, dict)]
        if len(choice_texts) != len(set(choice_texts)) and len(choice_texts) > 0:
            errors["6. Duplicate Options (Equivalent choices)"] += 1
            
    # 7. Missing Metadata
    meta = q.get("metadata", {})
    if "trapTypes" not in meta or "cognitiveMove" not in meta:
        errors["7. Missing Metadata (trapTypes, cognitiveMove)"] += 1

print("--- Error Report for 'needs_review' questions ---")
for k, v in errors.items():
    print(f"{k}: {v}")
