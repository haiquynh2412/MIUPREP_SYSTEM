import json, re
from collections import Counter

with open(r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data\antigravity-bank.json", "r", encoding="utf-8") as f:
    bank = json.load(f)

new_qs = [q for q in bank if q.get("id","").startswith("antigravity-hard-")]
print(f"Total new hard questions: {len(new_qs)}")
print()

# ISSUE 1: Explanation depth
lengths = [len(q.get("explanation",{}).get("correct","")) for q in new_qs]
for t in [80, 100, 150, 200, 300]:
    c = sum(1 for l in lengths if l < t)
    print(f"  Explanation < {t} chars: {c} ({c/len(new_qs)*100:.1f}%)")
avg = sum(lengths)/len(lengths)
print(f"  Average explanation length: {avg:.0f} chars")
print()

# Check for dual-path (Fast/Slow, Step 1/Step 2, Method 1/Method 2)
no_dual = 0
for q in new_qs:
    expl = q.get("explanation",{}).get("correct","")
    has_dual = any(kw in expl for kw in ["Fast", "Slow", "Step 1", "Step 2", "Method 1", "Method 2", "Approach 1", "Path 1"])
    if not has_dual:
        no_dual += 1
print(f"Missing dual-path format: {no_dual} ({no_dual/len(new_qs)*100:.1f}%)")
print()

# ISSUE 2: Draft/generation notes left in
draft_markers = ["Hmm", "Wait,", "Wait:", "Let me", "Redesign", "Fix:", "not clean", "Not clean", "answer should be", "Hmm,"]
draft_count = 0
draft_ids = []
for q in new_qs:
    text = json.dumps(q, ensure_ascii=False)
    found = [m for m in draft_markers if m in text]
    if found:
        draft_count += 1
        if len(draft_ids) < 5:
            draft_ids.append((q["id"], found))
print(f"Draft/generation notes: {draft_count}")
for did, markers in draft_ids:
    print(f"  {did}: {markers}")
print()

# ISSUE 3: LaTeX
latex_count = 0
for q in new_qs:
    text = json.dumps(q, ensure_ascii=False)
    if any(x in text for x in ["\\frac", "\\sqrt", "\\text{", "\\(", "\\["]):
        latex_count += 1
    elif "$" in q.get("prompt",""):
        latex_count += 1
print(f"LaTeX/symbol issues: {latex_count}")
print()

# ISSUE 4: Schema integrity
schema_issues = 0
schema_details = []
for q in new_qs:
    if q["type"] == "MCQ":
        choices = q.get("choices", [])
        if not choices:
            schema_issues += 1
            continue
        if isinstance(choices[0], dict):
            letters = [c.get("letter","") for c in choices]
            correct = q.get("correctAnswer","")
            if correct not in letters:
                schema_issues += 1
                schema_details.append(f"{q['id']}: correct={correct} not in {letters}")
            dist_keys = set(q.get("explanation",{}).get("distractors",{}).keys())
            expected = set(letters) - {correct}
            if dist_keys != expected:
                schema_issues += 1
                if len(schema_details) < 5:
                    schema_details.append(f"{q['id']}: dist_keys={dist_keys} != expected={expected}")
        else:
            schema_issues += 1
print(f"Schema/integrity issues: {schema_issues}")
for s in schema_details[:5]:
    print(f"  {s}")
print()

# ISSUE 5: Thin distractor explanations
thin_dist = 0
for q in new_qs:
    if q["type"] == "MCQ":
        dists = q.get("explanation",{}).get("distractors",{})
        if any(len(str(v)) < 20 for v in dists.values()):
            thin_dist += 1
print(f"MCQ with very thin distractor analysis (<20 chars): {thin_dist}")
print()

# Sample explanations
print("=" * 60)
print("SAMPLE SHORT EXPLANATION:")
for q in new_qs:
    expl = q.get("explanation",{}).get("correct","")
    if 40 < len(expl) < 80:
        print(f"  ID: {q['id']}")
        print(f"  Prompt: {q['prompt'][:100]}")
        print(f"  Explanation: {expl}")
        print()
        break

print("SAMPLE DRAFT-NOTE CONTAMINATION:")
for q in new_qs:
    expl = q.get("explanation",{}).get("correct","")
    if "Hmm" in expl or "Let me" in expl or "Redesign" in expl:
        print(f"  ID: {q['id']}")
        print(f"  Explanation: {expl[:300]}")
        print()
        break

print("SAMPLE GOOD EXPLANATION:")
for q in new_qs:
    expl = q.get("explanation",{}).get("correct","")
    if len(expl) > 250:
        print(f"  ID: {q['id']}")
        print(f"  Explanation ({len(expl)} chars): {expl[:300]}")
        break
