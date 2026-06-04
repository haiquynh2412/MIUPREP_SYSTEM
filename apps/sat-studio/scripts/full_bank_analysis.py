import json
import glob
import os
from collections import Counter

data_dir = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
json_files = glob.glob(os.path.join(data_dir, "*.json"))

total_questions = 0
unique_questions = {}

for fpath in json_files:
    fname = os.path.basename(fpath)
    # skip report files and small config files
    if "report" in fname or "manifest" in fname or "audit" in fname or "metadata" in fname or "taxonomy" in fname:
        continue
    try:
        with open(fpath, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
            if isinstance(data, list):
                for q in data:
                    if isinstance(q, dict) and "id" in q and "section" in q and "domain" in q:
                        q_id = q["id"]
                        unique_questions[q_id] = q
    except Exception as e:
        print(f"Error reading {fname}: {e}")

sections = Counter()
domains = Counter()
skills = Counter()
difficulties = Counter()
sources = Counter()
review_statuses = Counter()
has_explanation = 0
word_counts_rw = []
word_counts_math = []

for q_id, q in unique_questions.items():
    section = q.get("section", "Unknown")
    domain = q.get("domain", "Unknown")
    skill = q.get("skill", "Unknown")
    difficulty = q.get("difficulty", "Unknown")
    source = q.get("sourceType", q.get("sourceName", "Unknown"))
    review = q.get("reviewStatus", "Unknown")
    
    sections[section] += 1
    domains[f"{section} - {domain}"] += 1
    skills[f"{section} - {domain} - {skill}"] += 1
    difficulties[difficulty] += 1
    sources[source] += 1
    review_statuses[review] += 1
    
    if "explanation" in q and q["explanation"]:
        has_explanation += 1
        
    prompt = q.get("prompt", "")
    if isinstance(prompt, str):
        words = len(prompt.split())
    elif isinstance(prompt, list):
        # Maybe rich text format
        words = len(str(prompt).split())
    else:
        words = 0

    if section == "Reading and Writing":
        word_counts_rw.append(words)
    elif section == "Math":
        word_counts_math.append(words)

rw_total = sections.get("Reading and Writing", 0)
math_total = sections.get("Math", 0)

official_rw = {
    "Information and Ideas": 26,
    "Craft and Structure": 28,
    "Expression of Ideas": 20,
    "Standard English Conventions": 26
}

official_math = {
    "Algebra": 35,
    "Advanced Math": 35,
    "Problem-Solving and Data Analysis": 15,
    "Geometry and Trigonometry": 15
}

print("=== FULL BANK ANALYSIS ===")
print(f"Total Unique Questions: {len(unique_questions)}")
print(f"Questions with Explanation: {has_explanation} ({has_explanation/len(unique_questions)*100:.1f}%)")
print("\n--- SECTIONS ---")
for s, c in sections.items():
    print(f"  {s}: {c} ({c/len(unique_questions)*100:.1f}%)")

print("\n--- DOMAIN DISTRIBUTION (vs College Board) ---")
print("Reading & Writing:")
for domain, target in official_rw.items():
    key = f"Reading and Writing - {domain}"
    count = domains.get(key, 0)
    actual_pct = (count / rw_total * 100) if rw_total > 0 else 0
    delta = actual_pct - target
    print(f"  {domain}: {count} ({actual_pct:.1f}% vs {target}%) -> Delta: {delta:+.1f}%")

print("Math:")
for domain, target in official_math.items():
    key = f"Math - {domain}"
    count = domains.get(key, 0)
    actual_pct = (count / math_total * 100) if math_total > 0 else 0
    delta = actual_pct - target
    print(f"  {domain}: {count} ({actual_pct:.1f}% vs {target}%) -> Delta: {delta:+.1f}%")

print("\n--- DIFFICULTY DISTRIBUTION ---")
for d, c in difficulties.most_common():
    print(f"  {d}: {c} ({(c/len(unique_questions))*100:.1f}%)")

print("\n--- SOURCE DISTRIBUTION ---")
for s, c in sources.most_common()[:10]:
    print(f"  {s}: {c}")

print("\n--- REVIEW STATUS ---")
for r, c in review_statuses.most_common():
    print(f"  {r}: {c}")

if word_counts_rw:
    print(f"\n--- AVERAGE PROMPT LENGTH (RW) ---: {sum(word_counts_rw)/len(word_counts_rw):.1f} words")
if word_counts_math:
    print(f"--- AVERAGE PROMPT LENGTH (MATH) ---: {sum(word_counts_math)/len(word_counts_math):.1f} words")

print("\n--- THIN SKILLS (< 20 questions) ---")
for sk, c in skills.most_common()[::-1]:
    if c < 20:
        print(f"  {sk}: {c}")
