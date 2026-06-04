import re
import os

REPORT_PATH = r"C:\Users\HAIQUYNH\.gemini\antigravity\brain\fd790388-e9ec-42fc-85e9-5587d6dfc49f\thin_skills_comprehensive_audit.md"

if not os.path.exists(REPORT_PATH):
    print("Report file not found.")
    exit(1)

with open(REPORT_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Find skill headings like: ## Skill: `Systems of two linear equations in two variables` (477 questions found)
pattern = r"## Skill:\s+`([^`]+)`\s+\((\d+)\s+questions\s+found\)"
matches = re.findall(pattern, content)

print("COMPREHENSIVE AUDIT SUMMARY BY SKILL:")
print("=" * 60)
for skill, count in matches:
    print(f"Skill: {skill}")
    print(f"Count: {count} questions found across all databases")
    
    # Let's find what files they belong to
    # Search for this skill's section
    start_pos = content.find(f"## Skill: `{skill}`")
    # Find next skill heading or end of file
    next_skill_match = re.search(r"## Skill:", content[start_pos + 1:])
    if next_skill_match:
        end_pos = start_pos + 1 + next_skill_match.start()
    else:
        end_pos = len(content)
        
    section_content = content[start_pos:end_pos]
    file_matches = re.findall(r"- \*\*Source File\*\*: `([^`]+)`", section_content)
    file_counts = {}
    for fm in file_matches:
        file_counts[fm] = file_counts.get(fm, 0) + 1
        
    for fn, f_count in file_counts.items():
        print(f"  - `{fn}`: {f_count} questions")
    print("-" * 60)
