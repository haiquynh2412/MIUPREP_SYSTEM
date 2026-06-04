import json
import os
import re

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "opensat-pinesat.json")

def tag_rw_skill(domain, q_text, p_text, c_text):
    text = (q_text + " " + p_text + " " + c_text).lower()
    
    if domain == "Standard English Conventions":
        # Boundaries: Punctuation linking clauses (commas, semicolons, colons, dashes, periods)
        if re.search(r'\b(comma|semicolon|colon|dash|punctuation|independent clause|clauses|splice|run-on|conjunction)\b', text):
            return "Boundaries"
        # Form, Structure, and Sense: Verbs, pronouns, modifiers, plurals, possessives
        if re.search(r'\b(verb|subject|pronoun|modifier|possessive|plural|singular|tense|agreement|parallelism|apostrophe)\b', text):
            return "Form, Structure, and Sense"
        
        # Super-brain heuristic: Look at choices. If choices differ by punctuation, it's Boundaries.
        choices_only = c_text.lower()
        if re.search(r'([,;:\.\-].*){2,}', choices_only): # Multiple choices with punctuation differences
             return "Boundaries"
        return "Form, Structure, and Sense" # Default grammar is usually Form

    elif domain == "Expression of Ideas":
        if re.search(r'\b(transition|logical|however|therefore|nevertheless|similarly|consequently|moreover|subsequently)\b', text) or "most logical transition" in text:
            return "Transitions"
        if re.search(r'\b(student wants|notes|synthesize|accomplish this goal|relevant information|bullet points)\b', text):
            return "Rhetorical Synthesis"
        # Default fallback
        if "transition" in q_text.lower():
            return "Transitions"
        return "Rhetorical Synthesis"

    elif domain == "Information and Ideas":
        if re.search(r'\b(main idea|central|best states|summarizes|primarily|main purpose of the text)\b', q_text.lower()):
            return "Central Ideas and Details"
        if re.search(r'\b(inference|infer|suggests|implies|most likely|logically completes)\b', q_text.lower()):
            return "Inferences"
        if re.search(r'\b(support|evidence|claim|finding|data|table|graph|chart|illustrate|weaken|strengthen)\b', q_text.lower()):
            if re.search(r'\b(table|graph|chart|data|percent|rate)\b', p_text.lower()):
                return "Command of Evidence: Quantitative"
            return "Command of Evidence: Textual"
        
        # Heuristic fallback based on question structure
        if "completes the text" in q_text.lower():
            return "Inferences"
        return "Central Ideas and Details"

    elif domain == "Craft and Structure":
        if re.search(r'\b(meaning|most nearly means|used in text|vocabulary|word)\b', q_text.lower()):
            return "Words in Context"
        if re.search(r'\b(structure|purpose|function|serves mainly to|overall structure|characterize)\b', q_text.lower()):
            return "Text Structure and Purpose"
        if re.search(r'\b(both texts|text 1|text 2|relationship|respond to)\b', text):
            return "Cross-Text Connections"
        return "Text Structure and Purpose"
        
    return "Unknown"

def tag_math_skill(domain, q_text, p_text, c_text):
    text = (q_text + " " + p_text + " " + c_text).lower()
    
    if domain == "Algebra":
        if "inequalit" in text or ">" in text or "<" in text:
            return "Linear inequalities in one or two variables"
        if "system" in text and ("equations" in text or "solution" in text):
            return "Systems of two linear equations in two variables"
        if re.search(r'\b(slope|y-intercept|parallel|perpendicular|graph of a line)\b', text):
            return "Linear functions"
        return "Linear equations in one variable"
        
    elif domain == "Advanced Math":
        if re.search(r'\b(parabola|quadratic|vertex|roots|x-intercepts|x\^2|maximum value|minimum value)\b', text):
            return "Quadratic equations"
        if re.search(r'\b(exponential|grows by|decays by|doubles|half-life|x as an exponent)\b', text):
            return "Exponential functions"
        if re.search(r'\b(equivalent|expression|rewrite|factor)\b', q_text.lower()):
            return "Equivalent expressions"
        return "Nonlinear equations in one variable and systems of equations in two variables"

    elif domain == "Problem-Solving and Data Analysis":
        if re.search(r'\b(percent|increase|decrease|discount)\b', text):
            return "Percentages"
        if re.search(r'\b(ratio|rate|proportion|miles per hour|speed)\b', text):
            return "Ratios, rates, proportional relationships, and units"
        if re.search(r'\b(mean|median|mode|range|standard deviation|margin of error|survey|sample)\b', text):
            return "One-variable data: distributions and measures of center and spread"
        if re.search(r'\b(scatter plot|line of best fit|model|predict)\b', text):
            return "Two-variable data: models and scatterplots"
        if re.search(r'\b(probability|randomly selected|chance)\b', text):
            return "Probability and conditional probability"
        return "Ratios, rates, proportional relationships, and units"

    elif domain == "Geometry and Trigonometry":
        if re.search(r'\b(circle|radius|diameter|arc|circumference|radian|equation of a circle)\b', text):
            return "Circles"
        if re.search(r'\b(triangle|angle|parallel lines|similar|congruent)\b', text):
            if re.search(r'\b(sin|cos|tan|sine|cosine|tangent|right triangle|hypotenuse)\b', text):
                return "Right triangles and trigonometry"
            return "Lines, angles, and triangles"
        if re.search(r'\b(area|volume|perimeter|surface area|cube|cylinder|sphere)\b', text):
            return "Area and volume"
        return "Lines, angles, and triangles"

    return "Unknown"

def run_auto_tagger():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    tagged_count = 0
    
    for q in data:
        # Standardize missing section
        domain = q.get("domain", "")
        if not q.get("section") or q.get("section") == "Unknown":
            if domain in ["Information and Ideas", "Craft and Structure", "Expression of Ideas", "Standard English Conventions"]:
                q["section"] = "Reading and Writing"
            elif domain in ["Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry"]:
                q["section"] = "Math"
                
        # Tag missing skills
        if not q.get("skill") or q.get("skill") == "Unknown":
            q_node = q.get("question", {})
            q_text = q_node.get("question", "")
            p_text = q_node.get("paragraph", "")
            c_text = " ".join(q_node.get("choices", {}).values()) if isinstance(q_node.get("choices"), dict) else ""
            
            if q["section"] == "Reading and Writing":
                q["skill"] = tag_rw_skill(domain, q_text, p_text, c_text)
            elif q["section"] == "Math":
                q["skill"] = tag_math_skill(domain, q_text, p_text, c_text)
                
            if q.get("skill") and q.get("skill") != "Unknown":
                tagged_count += 1
                
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully auto-tagged {tagged_count} questions in {os.path.basename(DATA_FILE)}.")

if __name__ == "__main__":
    run_auto_tagger()
