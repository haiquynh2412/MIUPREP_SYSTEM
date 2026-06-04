import json
import os
import glob
from collections import defaultdict

data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
bank_files = glob.glob(os.path.join(data_dir, "*.json"))

total_qs = 0
sections = defaultdict(int)
domains = defaultdict(int)
skills = defaultdict(int)
difficulties = defaultdict(int)
bank_counts = {}

def process_questions(data, bf):
    global total_qs
    count = 0
    for q in data:
        # Standard schema: section, domain, skill, difficulty
        # Older schema: section is missing, domain contains the section sometimes, etc.
        sec = q.get("section", "Unknown")
        dom = q.get("domain", "Unknown")
        sk = q.get("skill", "Unknown")
        diff = q.get("difficulty", "Unknown")
        
        # Heuristic to fix older schema where domain has section name
        if sec == "Unknown":
            if dom in ["Information and Ideas", "Craft and Structure", "Expression of Ideas", "Standard English Conventions"]:
                sec = "Reading and Writing"
            elif dom in ["Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry"]:
                sec = "Math"
                
        # If skill is missing but we know domain, let's see if there's a sub-domain field
        if sk == "Unknown":
            sk = q.get("subdomain", "Unknown")
            
        sections[sec] += 1
        domains[f"{sec} -> {dom}"] += 1
        skills[f"{dom} -> {sk}"] += 1
        difficulties[diff] += 1
        count += 1
        total_qs += 1
    return count

for bf in bank_files:
    try:
        with open(bf, "r", encoding="utf-8") as f:
            data = json.load(f)
            count = 0
            if isinstance(data, list):
                count = process_questions(data, bf)
            elif isinstance(data, dict):
                # check for 'questions' or 'items' key
                for key in ["questions", "items", "data"]:
                    if key in data and isinstance(data[key], list):
                        count = process_questions(data[key], bf)
                        break
            if count > 0:
                bank_counts[os.path.basename(bf)] = count
    except Exception as e:
        pass

print(f"Total Questions: {total_qs}")
print("\n--- By Bank ---")
for k, v in sorted(bank_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"{k}: {v}")

print("\n--- By Section ---")
for k, v in sorted(sections.items(), key=lambda x: x[1], reverse=True):
    print(f"{k}: {v}")

print("\n--- By Difficulty ---")
for k, v in sorted(difficulties.items(), key=lambda x: x[1], reverse=True):
    print(f"{k}: {v}")

print("\n--- By Domain ---")
for k, v in sorted(domains.items(), key=lambda x: x[1], reverse=True):
    print(f"{k}: {v}")

print("\n--- By Skill (Top 20) ---")
for k, v in sorted(skills.items(), key=lambda x: x[1], reverse=True)[:20]:
    print(f"{k}: {v}")
