import json
import os
import glob
import re
from collections import defaultdict

data_dir = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
files = glob.glob(os.path.join(data_dir, "*.json"))

questions = []
for f in files:
    if 'bank' in os.path.basename(f) or 'sat' in os.path.basename(f):
        try:
            with open(f, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if isinstance(data, list):
                    for q in data:
                        questions.append(q)
                elif isinstance(data, dict) and 'questions' in data:
                    for q in data['questions']:
                        questions.append(q)
        except Exception as e:
            pass

def get_template_skeleton(prompt):
    if not prompt: return ""
    # Remove numbers
    text = re.sub(r'\d+', '#', prompt)
    # Convert to lowercase
    text = text.lower()
    # Remove special characters except '#'
    text = re.sub(r'[^\w\s#]', '', text)
    # Simplify spaces
    text = re.sub(r'\s+', ' ', text).strip()
    # Extract first 150 characters to group templates
    return text[:150]

difficulty_stats = {
    'Easy': {'total': 0, 'templates': defaultdict(int)},
    'Medium': {'total': 0, 'templates': defaultdict(int)},
    'Hard': {'total': 0, 'templates': defaultdict(int)},
    'Unknown': {'total': 0, 'templates': defaultdict(int)}
}

for q in questions:
    diff = q.get('difficulty', 'Unknown')
    if diff not in difficulty_stats:
         diff = 'Unknown'
    
    prompt = q.get('prompt', '')
    if not prompt: continue
    
    difficulty_stats[diff]['total'] += 1
    skeleton = get_template_skeleton(prompt)
    difficulty_stats[diff]['templates'][skeleton] += 1

print("Repetition Analysis by Difficulty:")
for diff in ['Easy', 'Medium', 'Hard', 'Unknown']:
    stats = difficulty_stats[diff]
    total = stats['total']
    if total == 0: continue
    
    templates = stats['templates']
    unique_templates = len(templates)
    
    # Calculate how many templates are repeated > 3 times
    repeated_templates = {k: v for k, v in templates.items() if v > 3}
    
    print(f"\n[{diff}] Total Questions: {total}")
    print(f"  - Unique skeletons: {unique_templates}")
    print(f"  - Diversity Ratio (Unique / Total): {(unique_templates / total)*100:.1f}%")
    print(f"  - Heavily repeated templates (>3 times): {len(repeated_templates)}")
    
    if repeated_templates:
        print(f"  - Top 3 repeated templates:")
        sorted_rep = sorted(repeated_templates.items(), key=lambda x: x[1], reverse=True)
        for skeleton, count in sorted_rep[:3]:
            print(f"      * {count} times: '{skeleton[:70]}...'")
