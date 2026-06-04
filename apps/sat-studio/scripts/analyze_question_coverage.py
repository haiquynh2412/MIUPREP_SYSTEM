import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OPEN_SAT = ROOT / "data" / "opensat-pinesat.json"
FOUNDATION = ROOT / "data" / "sat-studio-foundation-bank.json"
SAT_KING = ROOT / "data" / "sat-king-supplemental-ai-bank.json"
SAT_1590 = ROOT / "data" / "sat-1590-elite-ai-bank.json"
OUT = ROOT / "data" / "question-coverage-report.json"


def has_any(text, needles):
    return any(needle in text for needle in needles)


def infer_open_sat_skill(record):
    domain = record.get("domain") or "Imported"
    q = record.get("question") or {}
    text = " ".join(
        [
            domain,
            str(q.get("paragraph") or ""),
            str(q.get("question") or ""),
            str(q.get("explanation") or ""),
            " ".join(str(value) for value in (q.get("choices") or {}).values()),
        ]
    ).lower()

    if domain == "Standard English Conventions":
        if has_any(text, ["comma", "semicolon", "colon", "dash", "punctuation", "independent clause", "clauses"]):
            return "Boundaries"
        if has_any(text, ["verb", "subject", "pronoun", "modifier", "possessive", "plural", "singular", "tense"]):
            return "Form, structure, and sense"
        return "Standard English conventions mixed"
    if domain == "Expression of Ideas":
        if has_any(text, ["transition", "logical", "however", "therefore", "nevertheless", "similarly", "consequently"]):
            return "Transitions"
        if has_any(text, ["student wants", "notes", "synthesize", "accomplish this goal", "relevant information"]):
            return "Rhetorical Synthesis"
        return "Expression of ideas mixed"
    if domain == "Information and Ideas":
        if has_any(text, ["main idea", "central", "best states", "summarizes", "primarily"]):
            return "Central Ideas and Details"
        if has_any(text, ["inference", "infer", "suggests", "implies", "most likely"]):
            return "Inferences"
        if has_any(text, ["support", "evidence", "claim", "finding", "data", "table", "graph"]):
            return "Command of Evidence"
        return "Information and ideas mixed"
    if domain == "Craft and Structure":
        if has_any(text, ["word", "phrase", "meaning", "context", "most nearly", "precise", "complete the text"]):
            return "Words in Context"
        if has_any(text, ["function", "purpose", "structure", "overall", "paragraph"]):
            return "Text Structure and Purpose"
        if has_any(text, ["text 1", "text 2", "would respond", "both texts"]):
            return "Cross-Text Connections"
        return "Craft and structure mixed"
    if domain == "Algebra":
        if has_any(text, ["system", "simultaneous"]):
            return "Systems of linear equations"
        if has_any(text, ["slope", "linear function", "line", "y-intercept", "intercept"]):
            return "Linear functions and slope"
        if has_any(text, ["inequality", "less than", "greater than", "at least", "at most"]):
            return "Linear inequalities"
        return "Linear equations in one variable"
    if domain == "Advanced Math":
        if has_any(text, ["quadratic", "parabola", "vertex", "x^2", "x²"]):
            return "Quadratic equations"
        if has_any(text, ["exponential", "growth", "decay", "doubles", "halves"]):
            return "Exponential functions"
        if has_any(text, ["equivalent", "factor", "polynomial", "rational expression", "simplify"]):
            return "Equivalent expressions"
        return "Nonlinear equations and functions"
    if domain == "Problem-Solving and Data Analysis":
        if has_any(text, ["percent", "%", "increase", "decrease", "discount"]):
            return "Percentages"
        if has_any(text, ["rate", "unit", "per", "ratio", "proportion"]):
            return "Rates and units"
        if has_any(text, ["mean", "median", "range", "standard deviation", "survey", "sample"]):
            return "Statistics"
        if has_any(text, ["probability", "random", "chance"]):
            return "Probability"
        return "Data interpretation"
    if domain == "Geometry and Trigonometry":
        if has_any(text, ["circle", "radius", "diameter", "arc", "circumference"]):
            return "Circles"
        if has_any(text, ["right triangle", "sine", "cosine", "tangent", "hypotenuse"]):
            return "Right triangles and trigonometry"
        if has_any(text, ["area", "volume", "surface area"]):
            return "Area and volume"
        if has_any(text, ["angle", "triangle", "parallel", "similar"]):
            return "Lines, angles, and triangles"
        return "Geometry mixed"
    return domain


def normalize_open_sat(record):
    section = "Math" if record.get("_satStudioSourceSection") == "math" else "Reading and Writing"
    return {
        "sourceType": "opensat",
        "section": section,
        "domain": record.get("domain") or "Imported",
        "skill": record.get("skill") or infer_open_sat_skill(record),
    }


def main():
    rows = []
    if OPEN_SAT.exists():
        rows.extend(normalize_open_sat(record) for record in json.loads(OPEN_SAT.read_text(encoding="utf-8")))
    if FOUNDATION.exists():
        rows.extend(json.loads(FOUNDATION.read_text(encoding="utf-8")))
    if SAT_KING.exists():
        payload = json.loads(SAT_KING.read_text(encoding="utf-8"))
        rows.extend(payload["questions"] if isinstance(payload, dict) and "questions" in payload else payload)
    if SAT_1590.exists():
        payload = json.loads(SAT_1590.read_text(encoding="utf-8"))
        rows.extend(payload["questions"] if isinstance(payload, dict) and "questions" in payload else payload)

    rows = [row for row in rows if row.get("reviewStatus") != "rejected"]

    by_source = Counter(row["sourceType"] for row in rows)
    by_section = Counter(row["section"] for row in rows)
    by_domain = Counter((row["section"], row["domain"]) for row in rows)
    by_skill = Counter((row["section"], row["domain"], row["skill"]) for row in rows)

    report = {
        "generatedAt": "2026-05-16",
        "totalQuestions": len(rows),
        "sourceCounts": dict(sorted(by_source.items())),
        "sectionCounts": dict(sorted(by_section.items())),
        "domainCounts": [
            {"section": section, "domain": domain, "count": count}
            for (section, domain), count in sorted(by_domain.items())
        ],
        "skillCounts": [
            {"section": section, "domain": domain, "skill": skill, "count": count}
            for (section, domain, skill), count in sorted(by_skill.items())
        ],
        "thinSkillsUnder10": [
            {"section": section, "domain": domain, "skill": skill, "count": count}
            for (section, domain, skill), count in sorted(by_skill.items())
            if count < 10
        ],
        "notes": [
            "OpenSAT/PineSAT had broad domain labels only; SAT Studio infers sub-skills heuristically for topic navigation.",
            "Foundation items are original SAT Studio draft questions and should remain needs_review until checked.",
        ],
    }
    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(OUT), "totalQuestions": len(rows), "skills": len(by_skill)}, indent=2))


if __name__ == "__main__":
    main()
