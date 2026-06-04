import json
import os

DATA_DIR = r"c:\Users\HAIQUYNH\OneDrive\CODE AI\SAT\data"
ARTIFACT_DIR = r"C:\Users\HAIQUYNH\.gemini\antigravity\brain\fd790388-e9ec-42fc-85e9-5587d6dfc49f"
REPORT_PATH = os.path.join(ARTIFACT_DIR, "thin_skills_comprehensive_audit.md")

QUESTION_FILES = [
    "antigravity-bank.json",
    "archive-source-ai-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "opensat-pinesat.json",
    "private-vault-archive-bank.json",
    "sat-1590-elite-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
    "sat-studio-foundation-bank.json",
]

target_skills = {
    "Systems of equations in two variables",
    "Systems of two linear equations in two variables",
    "Evaluating statistical claims: observational studies and experiments",
    "Evaluating statistical claims: Observational studies and experiments",
    "Inference from sample statistics and margin of error",
}

found = {}
for skill in target_skills:
    found[skill] = []

print("Starting deep audit of all bank files...")

for fn in QUESTION_FILES:
    path = os.path.join(DATA_DIR, fn)
    if not os.path.exists(path):
        print(f"Skipping {fn} (file not found)")
        continue
    
    print(f"Reading bank: {fn}...")
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error loading {fn}: {e}")
            continue
        
        # Load list of questions
        qs = data.get("questions", []) if isinstance(data, dict) else data
        if not isinstance(qs, list):
            print(f"Warning: {fn} contains unexpected schema type: {type(qs)}")
            continue
            
        for index, q in enumerate(qs):
            skill = q.get("skill") or q.get("domain")
            if skill in target_skills:
                found[skill].append({
                    "id": q.get("id") or f"unnamed-{index}",
                    "file": fn,
                    "section": q.get("section"),
                    "domain": q.get("domain"),
                    "skill": skill,
                    "prompt": q.get("prompt"),
                    "choices": q.get("choices"),
                    "correctAnswer": q.get("correctAnswer"),
                    "explanation": q.get("explanation"),
                    "metadata": q.get("metadata")
                })

# Build the Markdown Report
report_content = []
report_content.append("# Comprehensive Audit: Target Thin Skills across All Banks\n")
report_content.append(f"Generated at: 2026-05-26\n")
report_content.append("This report contains all questions found in the following bank files that target our low-coverage thin skills:\n")
for fn in QUESTION_FILES:
    report_content.append(f"- `{fn}`")
report_content.append("\n---\n")

for skill, qs in found.items():
    report_content.append(f"## Skill: `{skill}` ({len(qs)} questions found)\n")
    if len(qs) == 0:
        report_content.append("No questions found for this skill in any of the databases.\n")
        continue
        
    for idx, q in enumerate(qs):
        report_content.append(f"### [{idx+1}] Question ID: `{q['id']}`")
        report_content.append(f"- **Source File**: `{q['file']}`")
        report_content.append(f"- **Section**: {q['section']}")
        report_content.append(f"- **Domain**: {q['domain']}")
        report_content.append(f"- **Skill**: {q['skill']}")
        report_content.append(f"- **Correct Answer**: `{q['correctAnswer']}`")
        
        metadata = q.get("metadata")
        if metadata:
            report_content.append(f"- **Metadata**:")
            if isinstance(metadata, dict):
                for k, v in metadata.items():
                    report_content.append(f"  - `{k}`: {v}")
            else:
                report_content.append(f"  - `{metadata}`")
                
        report_content.append("\n**Prompt**:\n")
        report_content.append(f"```text\n{q['prompt']}\n```\n")
        
        choices = q.get("choices")
        if choices:
            report_content.append("**Choices**:\n")
            if isinstance(choices, list):
                for c in choices:
                    report_content.append(f"- {c.get('letter') if isinstance(c, dict) else ''}: {c.get('text') if isinstance(c, dict) else c}")
            elif isinstance(choices, dict):
                for k, v in choices.items():
                    report_content.append(f"- **{k}**: {v}")
            report_content.append("")
            
        explanation = q.get("explanation")
        if explanation:
            report_content.append("**Explanation**:\n")
            if isinstance(explanation, dict):
                report_content.append(f"- **Correct Answer Proof**:\n  {explanation.get('correct')}\n")
                distractors = explanation.get("distractors")
                if distractors:
                    report_content.append("- **Distractors Explanations**:")
                    if isinstance(distractors, dict):
                        for k, v in distractors.items():
                            report_content.append(f"  - **{k}**: {v}")
                    else:
                        report_content.append(f"  {distractors}")
            else:
                report_content.append(f"{explanation}\n")
        
        report_content.append("\n---\n")

# Write report to artifacts directory
os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
with open(REPORT_PATH, "w", encoding="utf-8") as f:
    f.write("\n".join(report_content))

print(f"Report successfully written to {REPORT_PATH}")
