import json
import os
import re

json_path = r"public/data/questions_grade9.json"
images_dir = r"public/images"

if not os.path.exists(json_path):
    print(f"Error: {json_path} does not exist!")
    exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions loaded: {len(questions)}")

# 1. Distribution by Chapter
chapters = {}
for q in questions:
    ch = q.get("chapter", "unknown")
    chapters[ch] = chapters.get(ch, 0) + 1

print("\n--- Chapter Distribution ---")
for ch, count in chapters.items():
    print(f"  - {ch}: {count} questions")

# 2. Check bilingual fields and LaTeX syntax
errors = []
warnings = []

latex_regex = re.compile(r'\$[^$]*\$|\\\(.*?\\\)|\\\[.*?\\\]')

new_question_ids = {
    "phys9_resistance_ohm_013", "phys9_resistance_ohm_014",
    "phys9_electric_circuit_013", "phys9_electric_circuit_014",
    "phys9_electric_power_013", "phys9_electric_power_014",
    "phys9_magnetic_force_013", "phys9_magnetic_force_014",
    "phys9_light_spectrum_011", "phys9_light_spectrum_012", "phys9_light_spectrum_013",
    "phys9_nuclear_energy_intro_013", "phys9_nuclear_energy_intro_014"
}

def is_new_question(q):
    q_id = q.get("id")
    return q_id in new_question_ids or q.get("chapter") == "gifted_mechanics_grade9"

def check_latex_brackets(text, q_id, field_name):
    # Check if there are mismatched dollar signs
    dollar_count = text.count('$')
    if dollar_count % 2 != 0:
        errors.append(f"[{q_id}] Mismatched '$' signs in field '{field_name}' (count: {dollar_count}): {text}")
    
    # Check if there are unclosed \( or \[
    open_paren = text.count(r'\(')
    close_paren = text.count(r'\)')
    if open_paren != close_paren:
        errors.append(f"[{q_id}] Mismatched '\\(' and '\\)' in field '{field_name}' (open: {open_paren}, close: {close_paren})")
        
    open_bracket = text.count(r'\[')
    close_bracket = text.count(r'\]')
    if open_bracket != close_bracket:
        errors.append(f"[{q_id}] Mismatched '\\[' and '\\]' in field '{field_name}' (open: {open_bracket}, close: {close_bracket})")

for q in questions:
    q_id = q.get("id")
    q_type = q.get("type")
    is_new = is_new_question(q)
    
    # Check basic fields
    for field in ["question_text", "correct_answer", "difficulty", "chapter"]:
        if not q.get(field):
            errors.append(f"[{q_id}] Missing field '{field}'")
            
    # Check bilingual question_text
    question_text = q.get("question_text", "")
    question_text_en = q.get("question_text_en", "")
    
    check_latex_brackets(question_text, q_id, "question_text")
    if question_text_en:
        check_latex_brackets(question_text_en, q_id, "question_text_en")
    elif is_new:
        warnings.append(f"[{q_id}] Missing 'question_text_en'")
        
    # Check options for multiple choice
    if q_type == "multiple_choice":
        options = q.get("options", [])
        if not options:
            errors.append(f"[{q_id}] Multiple choice question has no options")
        for opt in options:
            if isinstance(opt, dict):
                content = opt.get("content", "")
                content_en = opt.get("content_en", "")
                check_latex_brackets(content, q_id, f"option content ({opt.get('key')})")
                if content_en:
                    check_latex_brackets(content_en, q_id, f"option content_en ({opt.get('key')})")
                elif is_new:
                    warnings.append(f"[{q_id}] Missing 'content_en' for option {opt.get('key')}")
            elif is_new:
                warnings.append(f"[{q_id}] Option is not a dictionary: {opt}")
                
    # Check explanation
    explanation = q.get("explanation", {})
    if not explanation:
        errors.append(f"[{q_id}] Missing 'explanation'")
    else:
        summary = explanation.get("summary", "")
        summary_en = explanation.get("summary_en", "")
        check_latex_brackets(summary, q_id, "explanation.summary")
        if summary_en:
            check_latex_brackets(summary_en, q_id, "explanation.summary_en")
        elif is_new:
            warnings.append(f"[{q_id}] Missing 'explanation.summary_en'")
            
    # Check thinking guide
    tg = q.get("thinking_guide", {})
    if not tg:
        errors.append(f"[{q_id}] Missing 'thinking_guide'")
    else:
        steps_keys = ["understand", "identify_knowledge", "plan", "steps", "verify", "extend"]
        for sk in steps_keys:
            val = tg.get(sk, "")
            val_en = tg.get(f"{sk}En", "")
            
            if isinstance(val, list):
                val = "\n".join(val)
            if isinstance(val_en, list):
                val_en = "\n".join(val_en)
                
            if val:
                check_latex_brackets(val, q_id, f"thinking_guide.{sk}")
            elif is_new:
                warnings.append(f"[{q_id}] Missing thinking_guide step '{sk}'")
                
            if val_en:
                check_latex_brackets(val_en, q_id, f"thinking_guide.{sk}En")
            elif is_new:
                warnings.append(f"[{q_id}] Missing thinking_guide step '{sk}En'")
                
    # Check image path
    img_path = q.get("image")
    if img_path:
        # Resolve path relative to public directory
        # e.g., /images/bridge_circuit.svg -> public/images/bridge_circuit.svg
        rel_img_path = img_path.lstrip("/")
        full_img_path = os.path.join("public", rel_img_path)
        if not os.path.exists(full_img_path):
            errors.append(f"[{q_id}] Referenced image does not exist: {img_path} (resolved: {full_img_path})")
        else:
            print(f"  - Verified image reference: {img_path} exists [OK]")

print(f"\n--- Validation Summary ---")
print(f"Errors found: {len(errors)}")
print(f"Warnings found: {len(warnings)}")

if errors:
    print("\n[ERROR] ERRORS:")
    for err in errors[:20]:
        print(f"  {err}")
    if len(errors) > 20:
        print(f"  ... and {len(errors) - 20} more errors.")
else:
    print("\n[OK] No syntax or structural errors found!")

if warnings:
    print("\n[WARN] WARNINGS (showing first 15):")
    for warn in warnings[:15]:
        print(f"  {warn}")
    if len(warnings) > 15:
        print(f"  ... and {len(warnings) - 15} more warnings.")
else:
    print("\n[OK] No warnings found!")
