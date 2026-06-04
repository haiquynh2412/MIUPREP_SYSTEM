"""
Phase 1: Backfill metadata, de-dupe, normalize taxonomy
"""
import json, os, uuid
from collections import Counter

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
ANTIGRAVITY = os.path.join(DATA_DIR, "antigravity-bank.json")
OPENSAT = os.path.join(DATA_DIR, "opensat-pinesat.json")

# ============================================================
# STEP 1: Backfill trapTypes + cognitiveMove in antigravity-bank
# ============================================================
print("=" * 60)
print("STEP 1: Backfill metadata for antigravity-bank.json")
print("=" * 60)

with open(ANTIGRAVITY, "r", encoding="utf-8") as f:
    bank = json.load(f)

# Default cognitive moves by domain/skill
COGNITIVE_DEFAULTS = {
    "Algebra": "Algebraic manipulation and equation solving",
    "Advanced Math": "Recognizing structural patterns in nonlinear expressions",
    "Problem-Solving and Data Analysis": "Interpreting data and applying statistical reasoning",
    "Geometry and Trigonometry": "Spatial reasoning and geometric relationships",
    "Information and Ideas": "Identifying main claims and evaluating evidence",
    "Craft and Structure": "Analyzing word choice, text structure, and rhetorical purpose",
    "Expression of Ideas": "Evaluating rhetorical effectiveness and logical transitions",
    "Standard English Conventions": "Applying grammar and punctuation rules in context",
}

TRAP_DEFAULTS = {
    "Algebra": ["Sign Error", "Opposite Operation", "Solved for Wrong Variable"],
    "Advanced Math": ["Partial Simplification", "Extraneous Solution Included", "Sign Error"],
    "Problem-Solving and Data Analysis": ["Correlation vs Causation", "Sample vs Population", "Misread Graph"],
    "Geometry and Trigonometry": ["Wrong Formula", "Unit Mismatch", "Forgot to Convert"],
    "Information and Ideas": ["True but Irrelevant", "Too Broad", "Opposite Inference"],
    "Craft and Structure": ["Related but Wrong Tone", "Too Literal", "Wrong Scope"],
    "Expression of Ideas": ["Redundant Transition", "Wrong Logical Direction", "Grammatically Correct but Illogical"],
    "Standard English Conventions": ["Comma Splice", "Run-on Accepted", "Wrong Tense"],
}

backfilled = 0
for q in bank:
    meta = q.setdefault("metadata", {})
    domain = q.get("domain", "Algebra")

    if not meta.get("trapTypes"):
        meta["trapTypes"] = TRAP_DEFAULTS.get(domain, ["Calculation Error", "Misread Prompt", "Partial Answer"])
        backfilled += 1

    if not meta.get("cognitiveMove"):
        meta["cognitiveMove"] = COGNITIVE_DEFAULTS.get(domain, "Multi-step reasoning")

with open(ANTIGRAVITY, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Backfilled metadata for {backfilled} questions")

# ============================================================
# STEP 2: De-duplicate IDs in opensat-pinesat.json
# ============================================================
print("\n" + "=" * 60)
print("STEP 2: De-duplicate IDs in opensat-pinesat.json")
print("=" * 60)

with open(OPENSAT, "r", encoding="utf-8") as f:
    opensat = json.load(f)

seen_ids = set()
deduped = []
removed = 0
for q in opensat:
    qid = q.get("id", "")
    if qid in seen_ids:
        removed += 1
    else:
        seen_ids.add(qid)
        deduped.append(q)

with open(OPENSAT, "w", encoding="utf-8") as f:
    json.dump(deduped, f, indent=2, ensure_ascii=False)

print(f"Removed {removed} duplicate IDs. Remaining: {len(deduped)}")

# ============================================================
# STEP 3: Normalize skill names in antigravity-bank.json
# ============================================================
print("\n" + "=" * 60)
print("STEP 3: Normalize skill names to canonical taxonomy")
print("=" * 60)

# Reload after step 1 changes
with open(ANTIGRAVITY, "r", encoding="utf-8") as f:
    bank = json.load(f)

SKILL_MAP = {
    # Split the combined skill into the correct canonical names
    # We'll assign based on domain context
    "One-variable data: Distributions and measures of center and spread": "One-variable data: distributions and measures of center and spread",
    "Two-variable data: Models and scatterplots": "Two-variable data: models and scatterplots",
    "Evaluating statistical claims: Observational studies and experiments": "Evaluating statistical claims: observational studies and experiments",
    "Systems of linear equations": "Systems of two linear equations in two variables",
    "Two-variable data": "Two-variable data: models and scatterplots",
    "One-variable data": "One-variable data: distributions and measures of center and spread",
    "Probability": "Probability and conditional probability",
}

normalized = 0
split_count = 0
for q in bank:
    old_skill = q.get("skill", "")
    domain = q.get("domain", "")

    # Fix casing/naming inconsistencies
    if old_skill in SKILL_MAP:
        q["skill"] = SKILL_MAP[old_skill]
        normalized += 1

    # Split the combined "Nonlinear equations in one variable and systems of equations in two variables"
    if old_skill == "Nonlinear equations in one variable and systems of equations in two variables":
        prompt = q.get("prompt", "").lower()
        explanation = json.dumps(q.get("explanation", {})).lower()
        combined_text = prompt + " " + explanation

        # Heuristic: if prompt mentions "system", "two equations", "intersection", etc. → Systems
        system_keywords = ["system", "intersection", "two equations", "simultaneous", "line and", "parabola and", "where the graphs"]
        is_system = any(kw in combined_text for kw in system_keywords)

        if is_system:
            q["skill"] = "Systems of equations in two variables"
        else:
            q["skill"] = "Nonlinear equations in one variable"
        split_count += 1

with open(ANTIGRAVITY, "w", encoding="utf-8") as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Normalized {normalized} skill names (casing/alias fix)")
print(f"Split {split_count} combined nonlinear+systems into separate skills")

# Final verification
with open(ANTIGRAVITY, "r", encoding="utf-8") as f:
    bank = json.load(f)

print(f"\n=== FINAL VERIFICATION ===")
print(f"Total questions: {len(bank)}")
no_trap = sum(1 for q in bank if not q.get("metadata", {}).get("trapTypes"))
no_cog = sum(1 for q in bank if not q.get("metadata", {}).get("cognitiveMove"))
print(f"Missing trapTypes: {no_trap}")
print(f"Missing cognitiveMove: {no_cog}")

skill_counts = Counter(q.get("skill", "N/A") for q in bank)
print(f"\nSkill distribution:")
for s, c in skill_counts.most_common():
    print(f"  {s}: {c}")
