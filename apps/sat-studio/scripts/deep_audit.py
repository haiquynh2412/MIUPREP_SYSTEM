"""Deep audit: Skill × Difficulty matrix across ALL active banks."""
import json, os, glob, re
from collections import defaultdict, Counter

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Only active banks loaded by the app
ACTIVE_BANKS = [
    "opensat-pinesat.json",
    "sat-studio-foundation-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "archive-source-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
    "sat-1590-elite-ai-bank.json",
    "private-vault-archive-bank.json",
    "antigravity-bank.json",
]

def infer_section(domain):
    rw = ["Information and Ideas","Craft and Structure","Expression of Ideas","Standard English Conventions"]
    math = ["Algebra","Advanced Math","Problem-Solving and Data Analysis","Geometry and Trigonometry"]
    if domain in rw: return "Reading and Writing"
    if domain in math: return "Math"
    return "Unknown"

def extract_questions(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ["questions","items","data"]:
            if key in data and isinstance(data[key], list):
                return data[key]
    return []

# Collect all questions
all_qs = []
bank_stats = {}
for bf in ACTIVE_BANKS:
    path = os.path.join(DATA_DIR, bf)
    if not os.path.exists(path):
        continue
    qs = extract_questions(path)
    bank_stats[bf] = len(qs)
    for q in qs:
        sec = q.get("section","")
        dom = q.get("domain","Unknown")
        sk = q.get("skill","Unknown")
        diff = q.get("difficulty","Medium")
        if not sec or sec == "Unknown":
            sec = infer_section(dom)
        all_qs.append({"section":sec,"domain":dom,"skill":sk,"difficulty":diff,"bank":bf})

# Build matrices
skill_diff = defaultdict(lambda: defaultdict(int))
domain_diff = defaultdict(lambda: defaultdict(int))
section_count = Counter()
domain_count = Counter()
skill_count = Counter()
diff_count = Counter()

for q in all_qs:
    key = f"{q['section']} > {q['domain']} > {q['skill']}"
    skill_diff[key][q["difficulty"]] += 1
    domain_diff[f"{q['section']} > {q['domain']}"][q["difficulty"]] += 1
    section_count[q["section"]] += 1
    domain_count[f"{q['section']} > {q['domain']}"] += 1
    skill_count[key] += 1
    diff_count[q["difficulty"]] += 1

# Print results
print(f"TOTAL QUESTIONS: {len(all_qs)}")
print(f"\n{'='*80}")
print(f"BANK BREAKDOWN")
print(f"{'='*80}")
for b, c in sorted(bank_stats.items(), key=lambda x: x[1], reverse=True):
    print(f"  {b}: {c}")

print(f"\n{'='*80}")
print(f"SECTION TOTALS")
print(f"{'='*80}")
for s, c in section_count.most_common():
    print(f"  {s}: {c}")

print(f"\n{'='*80}")
print(f"DIFFICULTY DISTRIBUTION")
print(f"{'='*80}")
for d, c in [("Easy", diff_count["Easy"]), ("Medium", diff_count["Medium"]), ("Hard", diff_count["Hard"])]:
    pct = round(c / len(all_qs) * 100, 1)
    print(f"  {d}: {c} ({pct}%)")

print(f"\n{'='*80}")
print(f"SKILL × DIFFICULTY MATRIX (Full)")
print(f"{'='*80}")
print(f"{'Skill':<65} {'Easy':>6} {'Med':>6} {'Hard':>6} {'Total':>6}")
print("-" * 95)

for key in sorted(skill_diff.keys()):
    e = skill_diff[key].get("Easy", 0)
    m = skill_diff[key].get("Medium", 0)
    h = skill_diff[key].get("Hard", 0)
    t = e + m + h
    label = key if len(key) <= 64 else key[:61] + "..."
    print(f"{label:<65} {e:>6} {m:>6} {h:>6} {t:>6}")

print(f"\n{'='*80}")
print(f"DOMAIN × DIFFICULTY SUMMARY")
print(f"{'='*80}")
print(f"{'Domain':<55} {'Easy':>6} {'Med':>6} {'Hard':>6} {'Total':>6}")
print("-" * 85)
for key in sorted(domain_diff.keys()):
    e = domain_diff[key].get("Easy", 0)
    m = domain_diff[key].get("Medium", 0)
    h = domain_diff[key].get("Hard", 0)
    t = e + m + h
    print(f"{key:<55} {e:>6} {m:>6} {h:>6} {t:>6}")
