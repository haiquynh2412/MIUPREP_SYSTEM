import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

try:
    from scripts.check_questions import DATA_DIR, QUESTION_FILES, is_hidden_duplicate_row, is_rejected_row
    from scripts.math_verifier import is_grid_in
except ModuleNotFoundError:
    from check_questions import DATA_DIR, QUESTION_FILES, is_hidden_duplicate_row, is_rejected_row
    from math_verifier import is_grid_in


ROOT = Path(__file__).resolve().parents[1]
TAXONOMY_PATH = DATA_DIR / "canonical-sat-taxonomy.json"
REPORT_PATH = DATA_DIR / "curriculum-metadata-tagging-report.json"
VERSION = "curriculum-routing-v1-2026-05-20"


def load_payload(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload.get("questions") if isinstance(payload, dict) else payload
    return payload, questions if isinstance(questions, list) else []


def write_payload(path: Path, payload: Any, questions: list[dict[str, Any]]) -> None:
    if isinstance(payload, dict):
        payload["questions"] = questions
    else:
        payload = questions
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def word_count(value: Any) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def build_alias_map() -> dict[str, tuple[str, str, str]]:
    taxonomy = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    aliases: dict[str, tuple[str, str, str]] = {}
    for section, section_data in taxonomy["sections"].items():
        for domain, domain_data in section_data["domains"].items():
            for canonical, skill_data in domain_data["canonicalSkills"].items():
                aliases[canonical.lower()] = (section, domain, canonical)
                for alias in skill_data.get("aliases", []):
                    aliases[str(alias).lower()] = (section, domain, canonical)
    return aliases


ALIASES = build_alias_map()


def canonical_skill(question: dict[str, Any]) -> str:
    raw = str(question.get("skill") or "").strip()
    text = f"{question.get('prompt') or ''} {raw}".lower()
    domain = question.get("domain")
    raw_lower = raw.lower()
    if domain == "Algebra" and raw_lower == "systems of equations in two variables":
        return "Systems of two linear equations in two variables"
    if raw_lower == "one-variable data":
        return "One-variable data: distributions and measures of center and spread"
    if raw_lower == "two-variable data":
        return "Two-variable data: models and scatterplots"
    if raw_lower in {"grid-in", "grid in", "student-produced response"}:
        if domain == "Algebra":
            if "system" in text or ("x" in text and "y" in text and "equation" in text):
                return "Systems of two linear equations in two variables"
            if "function" in text or "slope" in text or "rate" in text:
                return "Linear functions"
            if "inequality" in text or any(symbol in text for symbol in ["<", ">", "≤", "≥"]):
                return "Linear inequalities in one or two variables"
            return "Linear equations in one variable"
        if domain == "Advanced Math":
            if "system" in text or "intersect" in text:
                return "Systems of equations in two variables"
            if "function" in text or "exponential" in text:
                return "Nonlinear functions"
            if any(term in text for term in ["factor", "equivalent", "simplify", "expression"]):
                return "Equivalent expressions"
            return "Nonlinear equations in one variable"
        if domain == "Problem-Solving and Data Analysis":
            if "probability" in text:
                return "Probability and conditional probability"
            if "percent" in text or "%" in text:
                return "Percentages"
            if any(term in text for term in ["mean", "median", "standard deviation", "range"]):
                return "One-variable data: distributions and measures of center and spread"
            if any(term in text for term in ["scatter", "line of best fit", "model"]):
                return "Two-variable data: models and scatterplots"
            return "Ratios, rates, proportional relationships, and units"
        if domain == "Geometry and Trigonometry":
            if "circle" in text or "radius" in text or "diameter" in text:
                return "Circles"
            if "volume" in text or "area" in text:
                return "Area and volume"
            if "sin" in text or "cos" in text or "tan" in text or "right triangle" in text:
                return "Right triangles and trigonometry"
            return "Lines, angles, and triangles"
    if raw_lower == "linear equations, inequalities, and functions":
        if "system" in text:
            return "Systems of two linear equations in two variables"
        if "inequality" in text or any(symbol in text for symbol in ["<", ">", "≤", "≥"]):
            return "Linear inequalities in one or two variables"
        if "function" in text or "slope" in text or "rate" in text:
            return "Linear functions"
        return "Linear equations in one variable"
    if raw_lower == "data, rates, percentages, and probability":
        if "probability" in text or "chance" in text or "random" in text:
            return "Probability and conditional probability"
        if "percent" in text or "%" in text:
            return "Percentages"
        if any(term in text for term in ["mean", "median", "standard deviation", "range"]):
            return "One-variable data: distributions and measures of center and spread"
        if any(term in text for term in ["scatter", "line of best fit", "model", "correlation"]):
            return "Two-variable data: models and scatterplots"
        return "Ratios, rates, proportional relationships, and units"
    if raw_lower == "geometry and trigonometry":
        if "circle" in text or "radius" in text or "diameter" in text or "arc" in text:
            return "Circles"
        if "volume" in text or "area" in text or "surface" in text:
            return "Area and volume"
        if "sin" in text or "cos" in text or "tan" in text or "right triangle" in text or "hypotenuse" in text:
            return "Right triangles and trigonometry"
        return "Lines, angles, and triangles"
    if raw_lower == "nonlinear equations in one variable and systems of equations in two variables":
        if "system" in text or "intersect" in text or ("line" in text and "parabola" in text):
            return "Systems of equations in two variables"
        if "function" in text or "exponential" in text:
            return "Nonlinear functions"
        return "Nonlinear equations in one variable"
    if raw_lower in ALIASES:
        return ALIASES[raw_lower][2]
    return raw or "Unknown"


def inferred_micro_skill(question: dict[str, Any], canonical: str) -> str:
    text = f"{question.get('prompt') or ''} {question.get('skill') or ''}".lower()
    if canonical == "Systems of two linear equations in two variables":
        if "no solution" in text or "parallel" in text:
            return "no solution"
        if "infinitely" in text or "same line" in text:
            return "infinite solutions"
        if "intersect" in text or "intersection" in text:
            return "graph intersection"
        if any(term in text for term in ["tickets", "apples", "cost", "total", "mixture"]):
            return "word system"
        return "elimination or substitution"
    if canonical == "Linear functions":
        if "slope" in text or "rate" in text:
            return "rate of change"
        if "intercept" in text:
            return "intercept meaning"
        if "f(" in text or "g(" in text:
            return "function notation"
        return "linear model"
    if canonical == "Nonlinear equations in one variable":
        if "discriminant" in text:
            return "discriminant"
        if "root" in text or "solution" in text:
            return "roots or solutions"
        if "radical" in text or "sqrt" in text:
            return "radical equation"
        if "/" in text:
            return "rational equation"
        return "quadratic or nonlinear equation"
    if canonical == "Nonlinear functions":
        if "exponential" in text or "growth" in text or "decay" in text:
            return "exponential model"
        if "vertex" in text or "maximum" in text or "minimum" in text:
            return "quadratic features"
        return "function features"
    if canonical == "Command of Evidence":
        if any(term in text for term in ["table", "graph", "scatter", "r=", "r^2", "data"]):
            return "quantitative evidence"
        if any(term in text for term in ["weaken", "undermine"]):
            return "weaken claim"
        if any(term in text for term in ["support", "evidence"]):
            return "textual support"
        return "claim evidence alignment"
    if canonical == "Cross-Text Connections":
        if any(term in text for term in ["text 1", "text 2", "respond"]):
            return "predicted response"
        return "paired-text relation"
    if canonical == "Text Structure and Purpose":
        if "function" in text:
            return "function of sentence or paragraph"
        if "purpose" in text:
            return "author purpose"
        return "rhetorical move"
    if canonical == "Rhetorical Synthesis":
        return "goal-specific selection"
    if canonical == "Transitions":
        return "logical relationship"
    if canonical == "Boundaries":
        if ";" in text or "semicolon" in text:
            return "semicolon"
        if "colon" in text:
            return "colon"
        if "comma" in text:
            return "comma usage"
        return "sentence boundary"
    return canonical.lower()


def is_foundational(question: dict[str, Any], canonical: str) -> bool:
    domain = question.get("domain")
    return canonical in {
        "Linear equations in one variable",
        "Linear equations in two variables",
        "Linear functions",
        "Linear inequalities in one or two variables",
        "Central Ideas and Details",
        "Boundaries",
        "Form, Structure, and Sense",
    } or domain in {"Standard English Conventions"}


def is_elite_skill(question: dict[str, Any], canonical: str) -> bool:
    return canonical in {
        "Systems of two linear equations in two variables",
        "Equivalent expressions",
        "Nonlinear equations in one variable",
        "Systems of equations in two variables",
        "Nonlinear functions",
        "Command of Evidence",
        "Words in Context",
        "Text Structure and Purpose",
        "Cross-Text Connections",
    }


def target_band(question: dict[str, Any], canonical: str) -> str:
    difficulty = question.get("difficulty")
    source_type = question.get("sourceType")
    if difficulty == "Easy":
        return "G10-Bridge" if is_foundational(question, canonical) else "SAT-Core"
    if difficulty == "Medium":
        if source_type in {"sat_1590", "sat_king"} and is_elite_skill(question, canonical):
            return "SAT-Advanced"
        return "SAT-Core"
    if difficulty == "Hard":
        if source_type == "sat_1590" and is_elite_skill(question, canonical):
            return "SAT-1600"
        if source_type in {"sat_1590", "sat_king"} or is_elite_skill(question, canonical):
            return "SAT-Elite"
        return "SAT-Advanced"
    return "SAT-Core"


def module_placement(question: dict[str, Any], band: str) -> str:
    if band == "SAT-1600":
        return "elite_drill"
    if question.get("difficulty") == "Hard":
        return "module2_upper"
    if question.get("difficulty") == "Easy":
        return "module2_lower" if band == "G10-Bridge" else "module1"
    return "module1"


def estimated_time_seconds(question: dict[str, Any], band: str) -> int:
    section = question.get("section")
    difficulty = question.get("difficulty")
    if section == "Reading and Writing":
        base = {"Easy": 55, "Medium": 75, "Hard": 95}.get(difficulty, 75)
        base += min(25, max(0, word_count(question.get("prompt")) - 90) // 4)
    else:
        base = {"Easy": 65, "Medium": 95, "Hard": 125}.get(difficulty, 95)
        if is_grid_in(question):
            base += 10
        if band in {"SAT-Elite", "SAT-1600"}:
            base += 10
    return int(base)


def should_tag(question: dict[str, Any]) -> bool:
    if question.get("reviewStatus") != "reviewed":
        return False
    if is_rejected_row(question):
        return False
    return True


def tag_question(question: dict[str, Any]) -> bool:
    canonical = canonical_skill(question)
    micro = inferred_micro_skill(question, canonical)
    band = target_band(question, canonical)
    placement = module_placement(question, band)
    seconds = estimated_time_seconds(question, band)
    new_values = {
        "canonicalSkill": canonical,
        "microSkill": micro,
        "targetBand": band,
        "modulePlacement": placement,
        "estimatedTimeSeconds": seconds,
        "curriculumMetadataVersion": VERSION,
    }
    changed = False
    for key, value in new_values.items():
        if question.get(key) != value:
            question[key] = value
            changed = True
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(description="Tag reviewed SAT questions with curriculum routing metadata.")
    parser.add_argument("--apply", action="store_true", help="Write metadata changes to bank files.")
    args = parser.parse_args()

    summary = {
        "version": VERSION,
        "apply": bool(args.apply),
        "updatedByFile": {},
        "taggedByBand": Counter(),
        "taggedByModulePlacement": Counter(),
        "taggedByCanonicalSkill": Counter(),
        "skippedNeedsReviewOrRejected": 0,
    }

    for filename in QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload, questions = load_payload(path)
        changed = 0
        eligible = 0
        for question in questions:
            if not isinstance(question, dict):
                continue
            if not should_tag(question):
                summary["skippedNeedsReviewOrRejected"] += 1
                continue
            eligible += 1
            before_band = question.get("targetBand")
            if tag_question(question):
                changed += 1
            summary["taggedByBand"][question.get("targetBand")] += 1
            summary["taggedByModulePlacement"][question.get("modulePlacement")] += 1
            summary["taggedByCanonicalSkill"][question.get("canonicalSkill")] += 1
        summary["updatedByFile"][filename] = {"eligibleReviewed": eligible, "changed": changed}
        if args.apply and changed:
            write_payload(path, payload, questions)

    serializable = {
        **summary,
        "taggedByBand": dict(summary["taggedByBand"].most_common()),
        "taggedByModulePlacement": dict(summary["taggedByModulePlacement"].most_common()),
        "taggedByCanonicalSkill": dict(summary["taggedByCanonicalSkill"].most_common()),
    }
    REPORT_PATH.write_text(json.dumps(serializable, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(serializable, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
