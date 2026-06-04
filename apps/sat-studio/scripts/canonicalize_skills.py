# -*- coding: utf-8 -*-
"""Canonicalize SAT Skills and Domains across all bank files."""
import json
import os
import glob
from pathlib import Path

DATA_DIR = Path(os.path.join(os.path.dirname(__file__), "..", "data"))

BANK_FILES = [
    "antigravity-bank.json",
    "archive-source-ai-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "opensat-pinesat.json",
    "private-vault-archive-bank.json",
    "sat-1590-elite-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
    "sat-studio-foundation-bank.json",
]

# Mapping dictionary
SKILL_MAP = {
    # RW
    "Form, structure, and sense": "Form, Structure, and Sense",
    "Command of Evidence": "Command of Evidence: Textual", # fallback
    "Data interpretation": "Command of Evidence: Quantitative", # When in RW
    
    # Math - Algebra
    "Linear functions and slope": "Linear functions",
    "Linear equations, inequalities, and functions": "Linear functions",
    "Linear inequalities": "Linear inequalities in one or two variables",
    "Systems of equations in two variables": "Systems of two linear equations in two variables",
    "Systems of linear equations": "Systems of two linear equations in two variables",
    
    # Math - PSDA
    "Probability": "Probability and conditional probability",
    "Rates and units": "Ratios, rates, proportional relationships, and units",
    "Ratios and rates": "Ratios, rates, proportional relationships, and units",
    "Statistics": "One-variable data: distributions and measures of center and spread",
    "Data, rates, percentages, and probability": "Ratios, rates, proportional relationships, and units",
    
    # Math - Geometry
    "Geometry and trigonometry": "Right triangles and trigonometry",
    "Right triangles": "Right triangles and trigonometry",
    
    # Math - Advanced
    "Advanced equations and functions": "Nonlinear equations in one variable and systems of equations in two variables",
    "Nonlinear equations and functions": "Nonlinear equations in one variable and systems of equations in two variables",
    "Nonlinear equations in one variable": "Nonlinear equations in one variable and systems of equations in two variables",
    "Quadratic equations": "Nonlinear equations in one variable and systems of equations in two variables",
    "Exponential functions": "Nonlinear functions",
}

def clean_question(q):
    changed = False
    
    # Standardize Domain
    sec = q.get("section")
    dom = q.get("domain")
    sk = q.get("skill")
    
    # Fix Grid-in pseudo-skill
    if sk == "Grid-in":
        if dom == "Algebra":
            q["skill"] = "Linear equations in one variable"
        elif dom == "Advanced Math":
            q["skill"] = "Nonlinear equations in one variable and systems of equations in two variables"
        elif dom == "Geometry and Trigonometry":
            q["skill"] = "Area and volume"
        elif dom == "Problem-Solving and Data Analysis":
            q["skill"] = "Percentages"
        else:
            q["skill"] = "Linear equations in one variable"
        sk = q["skill"]
        changed = True

    # Fix Data interpretation in Math
    if sk == "Data interpretation" and sec == "Math":
        q["skill"] = "Two-variable data: models and scatterplots"
        sk = q["skill"]
        changed = True

    # Apply mapping
    if sk in SKILL_MAP:
        q["skill"] = SKILL_MAP[sk]
        changed = True
        
    # Command of Evidence fallback logic
    if q["skill"] == "Command of Evidence: Textual" and sec == "Reading and Writing":
        # check if there's quantitative data
        prompt = q.get("prompt", "")
        if "table" in prompt.lower() or "chart" in prompt.lower() or "graph" in prompt.lower() or "data" in prompt.lower():
            q["skill"] = "Command of Evidence: Quantitative"
            changed = True

    return changed

def main():
    total_changed = 0
    total_questions = 0
    
    for filename in BANK_FILES:
        filepath = DATA_DIR / filename
        if not filepath.exists():
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except:
                continue
                
        file_changed = False
        
        if isinstance(data, list):
            q_list = data
        elif isinstance(data, dict) and "questions" in data:
            q_list = data["questions"]
        else:
            continue
            
        for q in q_list:
            total_questions += 1
            if clean_question(q):
                file_changed = True
                total_changed += 1
                
        if file_changed:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Updated {filename}")

    print(f"\nCanonicalization Complete!")
    print(f"Processed: {total_questions} questions")
    print(f"Updated: {total_changed} skills")

if __name__ == "__main__":
    main()
