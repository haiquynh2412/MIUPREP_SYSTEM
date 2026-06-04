# -*- coding: utf-8 -*-
import json
import os
import re

DATA = "data"
BANKS = [
    "opensat-pinesat.json",
    "archive-source-ai-bank.json",
    "sat-1590-elite-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "private-vault-archive-bank.json",
    "sat-studio-foundation-bank.json"
]

def map_cognitive_move(q):
    skill = q.get("skill", "")
    domain = q.get("domain", "")
    
    # R&W
    if skill == "Boundaries":
        return "Identifying independent and dependent clauses to determine appropriate punctuation"
    elif skill == "Central Ideas":
        return "Synthesizing the primary argument of the text while avoiding overly broad or narrow distractors"
    elif skill == "Words in Context":
        return "Using surrounding context clues to determine the precise meaning of the target word"
    elif skill == "Transitions":
        return "Analyzing the logical relationship (e.g., contrast, addition, cause) between two sentences"
    elif skill == "Inferences":
        return "Drawing a logical conclusion that is strictly supported by the text without bringing in outside knowledge"
    elif skill == "Text Structure and Purpose":
        return "Recognizing how specific sentences function within the overall structure of the passage"
    elif skill == "Cross-Text Connections":
        return "Identifying points of agreement or disagreement between two different authors' perspectives"
    elif "Evidence" in skill:
        return "Evaluating which data or quotation most directly supports or weakens the specific claim"
    
    # Math
    elif "Linear equations" in skill:
        return "Setting up and solving a linear equation, paying attention to the specific variable requested"
    elif "Nonlinear" in skill or "Systems" in skill:
        return "Applying algebraic manipulation (such as factoring, substitution, or elimination) to solve complex equations"
    elif "Circles" in skill or "Area" in skill or "Volume" in skill or "Lines" in skill:
        return "Applying geometric formulas and theorems to find the requested measurement"
    elif "Percentages" in skill or "Ratios" in skill:
        return "Translating proportional relationships or percentage changes into mathematical expressions"
    elif "Probability" in skill or "data" in skill.lower() or "statistics" in skill:
        return "Interpreting data from tables, charts, or statistical summaries to draw mathematical conclusions"
    
    return "Applying core analytical reasoning to identify the correct answer based on the prompt's constraints"

def extract_trap_types(distractor_text):
    text = distractor_text.lower()
    traps = []
    
    # Math traps
    if re.search(r"sign error|negative|opposite sign", text): traps.append("Sign Error")
    if re.search(r"intermediate|partial step|didn't finish", text): traps.append("Stopping at Intermediate Value")
    if re.search(r"wrong operation|add instead of subtract|multiply instead of divide", text): traps.append("Operation Error")
    if re.search(r"wrong variable|solve for x instead of y", text): traps.append("Solving for Wrong Variable")
    if re.search(r"calculation|arithmetic", text): traps.append("Arithmetic Error")
    if re.search(r"formula|equation setup", text): traps.append("Formula Error")
    
    # R&W traps
    if re.search(r"too broad|overly broad|generalize", text): traps.append("Too Broad")
    if re.search(r"too narrow|specific detail", text): traps.append("Detail as Main Idea")
    if re.search(r"opposite|contradict", text): traps.append("Opposite Meaning")
    if re.search(r"outside knowledge|not in text|not mentioned", text): traps.append("Outside Knowledge")
    if re.search(r"misread|misinterpret", text): traps.append("Text Misinterpretation")
    if re.search(r"plausible but wrong|sounds good", text): traps.append("Plausible Distractor")
    if re.search(r"wrong relationship|wrong transition", text): traps.append("Logical Relationship Error")
    if re.search(r"comma splice|run-on|fragment", text): traps.append("Punctuation Boundary Error")
    
    if not traps:
        traps.append("Conceptual Misunderstanding")
    
    # Return unique traps up to 3
    return list(dict.fromkeys(traps))[:3]

print("=== PHASE 3: COGNITIVE RETROFITTING ===")

total_retrofitted = 0
for bname in BANKS:
    fp = os.path.join(DATA, bname)
    if not os.path.exists(fp):
        continue
    
    with open(fp, "r", encoding="utf-8") as f:
        bank = json.load(f)
    
    ql = bank if isinstance(bank, list) else bank.get("questions", [])
    is_list = isinstance(bank, list)
    count = 0
    
    for q in ql:
        if "metadata" not in q:
            q["metadata"] = {}
        
        # Add cognitiveMove
        if not q["metadata"].get("cognitiveMove"):
            q["metadata"]["cognitiveMove"] = map_cognitive_move(q)
            count += 1
            
        # Add trapTypes
        if not q["metadata"].get("trapTypes"):
            dist_text = ""
            if isinstance(q.get("explanation"), dict):
                distractors = q["explanation"].get("distractors", {})
                if isinstance(distractors, dict):
                    dist_text = " ".join(str(v) for v in distractors.values())
            q["metadata"]["trapTypes"] = extract_trap_types(dist_text)
            
    if is_list:
        save_data = ql
    else:
        bank["questions"] = ql
        save_data = bank
        
    with open(fp, "w", encoding="utf-8") as f:
        json.dump(save_data, f, indent=2, ensure_ascii=False)
        
    print(f"Retrofitted {count} questions in {bname}")
    total_retrofitted += count

print(f"\nTotal questions retrofitted in supplemental banks: {total_retrofitted}")

print("\n=== EXPANDING SHORT SPR EXPLANATIONS IN ANTIGRAVITY-BANK ===")
def expand_equation(short_text):
    # E.g., "2x+6=18. 2x=12. x=6. Final answer = 6."
    steps = [s.strip() for s in short_text.split('.') if s.strip()]
    if len(steps) < 2:
        return short_text
    
    expanded = f"To solve this problem, we follow a step-by-step mathematical approach. We are given the equation: {steps[0]}. "
    
    if len(steps) > 2:
        expanded += f"Next, we simplify and isolate the variable to obtain {steps[1]}. "
    
    if len(steps) > 3:
        expanded += f"Continuing the algebraic manipulation, we get {steps[2]}. "
    
    expanded += f"Finally, we arrive at the correct value. The final answer is {steps[-1].replace('Final answer =', '').strip()}."
    return expanded

with open(os.path.join(DATA, "antigravity-bank.json"), "r", encoding="utf-8") as f:
    ag_bank = json.load(f)

expanded_count = 0
for q in ag_bank:
    exp = q.get("explanation", {})
    if isinstance(exp, dict):
        txt = str(exp.get("correct", ""))
        # If explanation is very short (e.g. less than 15 words) and contains typical equation steps
        if len(txt.split()) < 15 and q.get("type") == "SPR" and "=" in txt:
            q["explanation"]["correct"] = expand_equation(txt)
            expanded_count += 1

with open(os.path.join(DATA, "antigravity-bank.json"), "w", encoding="utf-8") as f:
    json.dump(ag_bank, f, indent=2, ensure_ascii=False)

print(f"Expanded {expanded_count} short SPR explanations in antigravity-bank.json")
