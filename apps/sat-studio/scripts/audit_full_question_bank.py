import csv
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "data" / "full-question-bank-audit-report.json"
OUT_CSV = ROOT / "data" / "full-question-bank-audit-report.csv"

DATA_FILES = [
    ("OpenSAT / PineSAT", ROOT / "data" / "opensat-pinesat.json"),
    ("SAT Studio Foundation", ROOT / "data" / "sat-studio-foundation-bank.json"),
    ("Kaplan AI", ROOT / "data" / "kaplan-sat-math-ai-bank.json"),
    ("Archive AI", ROOT / "data" / "archive-source-ai-bank.json"),
    ("SAT King Supplemental", ROOT / "data" / "sat-king-supplemental-ai-bank.json"),
    ("SAT 1590 Elite", ROOT / "data" / "sat-1590-elite-ai-bank.json"),
]

AUDIT_VERSION = "sat-king-audit-2026-05-17"


def load_payload(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload["questions"] if isinstance(payload, dict) and "questions" in payload else payload


def normalize_prompt(text):
    return " ".join(str(text).lower().split())


def normalize_opensat(item, index):
    q = item.get("question") or {}
    choices = q.get("choices") or item.get("choices") or {}
    source_section = item.get("_satStudioSourceSection") or item.get("section") or ""
    prompt = "\n\n".join(
        str(part)
        for part in [q.get("paragraph"), q.get("question") or item.get("prompt") or item.get("question")]
        if part and part != "null"
    )
    return {
        "id": f"opensat-{source_section or 'unknown'}-{index}-{item.get('id') or 'item'}",
        "bank": "OpenSAT / PineSAT",
        "sourceType": "opensat",
        "section": "Math" if source_section == "math" else "Reading and Writing" if source_section == "english" else infer_section(item.get("domain", "")),
        "domain": item.get("domain") or "Imported",
        "skill": item.get("skill") or infer_skill(item),
        "difficulty": item.get("difficulty") or "Medium",
        "prompt": prompt,
        "choices": {key: choices.get(key, "") for key in ["A", "B", "C", "D"]},
        "correctAnswer": q.get("correct_answer") or q.get("correctAnswer") or item.get("correct_answer") or item.get("correctAnswer"),
        "explanation": q.get("explanation") or item.get("explanation") or "",
        "sourceReference": item.get("_satStudioSourceUrl") or "data/opensat-pinesat.json",
        "reviewStatus": "needs_review",
        "contentAudit": item.get("contentAudit"),
    }


def normalize_standard(item, bank):
    return {
        "id": item.get("id"),
        "bank": bank,
        "sourceType": item.get("sourceType") or ("ai_generated" if "AI" in bank or "Elite" in bank else "foundation"),
        "section": item.get("section"),
        "domain": item.get("domain"),
        "skill": item.get("skill"),
        "difficulty": item.get("difficulty"),
        "prompt": item.get("prompt") or "",
        "choices": item.get("choices") or {},
        "correctAnswer": item.get("correctAnswer") or item.get("correct_answer"),
        "questionType": item.get("questionType") or "multiple_choice",
        "acceptableAnswers": item.get("acceptableAnswers") or [],
        "explanation": item.get("explanation") or "",
        "sourceReference": item.get("sourceReference") or "",
        "sourceSignalId": item.get("sourceSignalId") or "",
        "reviewStatus": item.get("reviewStatus") or "needs_review",
        "templateDiversity": item.get("templateDiversity") or {},
        "practicePool": item.get("practicePool") or item.get("skeletonDiversity", {}).get("practicePool", "core_pool"),
        "skeletonDiversity": item.get("skeletonDiversity") or {},
        "contentAudit": item.get("contentAudit"),
    }


def infer_section(domain):
    text = str(domain).lower()
    return "Math" if any(term in text for term in ["algebra", "advanced math", "problem-solving", "geometry", "trigonometry"]) else "Reading and Writing"


def has_any(text, needles):
    return any(needle in text for needle in needles)


def infer_skill(item):
    domain = item.get("domain") or "Imported"
    q = item.get("question") or {}
    text = " ".join([domain, q.get("paragraph", ""), q.get("question", ""), q.get("explanation", ""), " ".join((q.get("choices") or {}).values())]).lower()
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
    return domain or "Imported"


def audit_question(question, seen_prompts):
    if question.get("reviewStatus") == "rejected" and question.get("contentAudit", {}).get("version") == AUDIT_VERSION:
        return "rejected", "excluded_template_variant", [question.get("publicationStatus") or "rejected_template_variant"]

    issues = []
    choices = question["choices"] or {}
    grid_in = question.get("questionType") == "student_produced_response"
    choice_keys = set(choices.keys())
    if not question["prompt"]:
        issues.append("missing_prompt")
    if not question["explanation"]:
        issues.append("missing_explanation")
    if grid_in:
        if not question["correctAnswer"] and not question.get("acceptableAnswers"):
            issues.append("missing_student_response_answer")
    else:
        if not {"A", "B", "C", "D"}.issubset(choice_keys):
            issues.append("missing_A_to_D_choices")
        if choice_keys - {"A", "B", "C", "D"}:
            issues.append("extra_choice_keys")
        if question["correctAnswer"] not in {"A", "B", "C", "D"}:
            issues.append("invalid_correct_answer")
        values = [str(choices.get(key, "")).strip().lower() for key in ["A", "B", "C", "D"]]
        if len(set(values)) < 4:
            issues.append("duplicate_choices")
    norm = normalize_prompt(question["prompt"])
    if norm in seen_prompts:
        issues.append("duplicate_prompt")
    else:
        seen_prompts.add(norm)

    source_type = question["sourceType"]
    if source_type in {"ai_generated", "sat_king", "sat_1590"}:
        if question.get("contentAudit", {}).get("version") != AUDIT_VERSION:
            issues.append("missing_current_generated_content_audit")
        if question["reviewStatus"] != "reviewed":
            issues.append("generated_not_reviewed")
    elif source_type == "opensat":
        issues.append("external_dataset_needs_human_review")
    elif source_type == "foundation":
        issues.append("foundation_needs_human_review")
    blocking = {"missing_prompt", "missing_A_to_D_choices", "invalid_correct_answer", "duplicate_choices", "missing_student_response_answer"}
    if any(issue in blocking for issue in issues):
        verdict = "fail"
        student_use = "exclude_until_fixed"
    elif source_type in {"ai_generated", "sat_king", "sat_1590"} and not issues:
        verdict = "pass"
        student_use = "ready"
    elif source_type in {"ai_generated", "sat_king", "sat_1590"}:
        verdict = "needs_review"
        student_use = "generated_needs_review"
    else:
        verdict = "needs_review"
        student_use = "usable_for_family_practice_after_source_review"
    if question.get("practicePool") == "hidden_duplicate":
        issues.append("hidden_duplicate_skeleton_overflow")
        student_use = "hidden_duplicate_skeleton_overflow"
    elif question.get("practicePool") == "remedial_pool":
        student_use = "remedial_only_after_miss"
    return verdict, student_use, issues


def main():
    questions = []
    skipped = []
    opensat_prompts = set()
    for bank, path in DATA_FILES:
        for index, item in enumerate(load_payload(path)):
            if bank == "OpenSAT / PineSAT":
                normalized = normalize_opensat(item, index)
                values = [str((normalized["choices"] or {}).get(key, "")).strip().lower() for key in ["A", "B", "C", "D"]]
                prompt_key = normalize_prompt(normalized["prompt"])
                if len(set(values)) < 4:
                    skipped.append({"bank": bank, "index": index, "reason": "duplicate_A_to_D_choices", "id": normalized["id"]})
                    continue
                if prompt_key in opensat_prompts:
                    skipped.append({"bank": bank, "index": index, "reason": "duplicate_prompt", "id": normalized["id"]})
                    continue
                opensat_prompts.add(prompt_key)
                questions.append(normalized)
            else:
                questions.append(normalize_standard(item, bank))

    rows = []
    seen_prompts = set()
    for question in questions:
        verdict, student_use, issues = audit_question(question, seen_prompts)
        rows.append(
            {
                "id": question["id"],
                "bank": question["bank"],
                "sourceType": question["sourceType"],
                "section": question["section"],
                "domain": question["domain"],
                "skill": question["skill"],
                "difficulty": question["difficulty"],
                "sourceSignalId": question.get("sourceSignalId", ""),
                "sourceReference": question.get("sourceReference", ""),
                "reviewStatus": question.get("reviewStatus", ""),
                "templateFormId": question.get("templateDiversity", {}).get("formId", ""),
                "templateFormRank": question.get("templateDiversity", {}).get("formRank", ""),
                "templateMaxVisible": question.get("templateDiversity", {}).get("maxVisibleBeforeMastery", ""),
                "calculationEaseScore": question.get("templateDiversity", {}).get("calculationEaseScore", ""),
                "roundAnswerPreferred": question.get("templateDiversity", {}).get("roundAnswerPreferred", ""),
                "practicePool": question.get("practicePool", "core_pool"),
                "skeletonId": question.get("skeletonDiversity", {}).get("skeletonId", ""),
                "skeletonRank": question.get("skeletonDiversity", {}).get("skeletonRank", ""),
                "skeletonSize": question.get("skeletonDiversity", {}).get("skeletonSize", ""),
                "skeletonCoreLimit": question.get("skeletonDiversity", {}).get("coreLimit", ""),
                "skeletonActiveLimit": question.get("skeletonDiversity", {}).get("activeLimit", ""),
                "questionType": question.get("questionType", "multiple_choice"),
                "verdict": verdict,
                "studentUse": student_use,
                "issues": ";".join(issues),
                "correctAnswer": question["correctAnswer"],
                "correctChoice": (question["choices"] or {}).get(question["correctAnswer"], ""),
                "prompt": question["prompt"],
            }
        )

    active_rows = [row for row in rows if row["verdict"] != "rejected"]
    normal_practice_rows = [row for row in active_rows if row.get("practicePool", "core_pool") != "hidden_duplicate"]
    summary = {
        "activeTotal": len(active_rows),
        "normalPracticeActiveTotal": len(normal_practice_rows),
        "hiddenDuplicateSkeleton": sum(1 for row in active_rows if row.get("practicePool") == "hidden_duplicate"),
        "remedialOnly": sum(1 for row in active_rows if row.get("practicePool") == "remedial_pool"),
        "auditedTotalIncludingRejected": len(rows),
        "rawTotalIncludingSkipped": len(rows) + len(skipped),
        "skipped": Counter(item["reason"] for item in skipped),
        "byVerdict": Counter(row["verdict"] for row in rows),
        "byStudentUse": Counter(row["studentUse"] for row in rows),
        "byPracticePool": Counter(row.get("practicePool") or "core_pool" for row in active_rows),
        "bySourceType": Counter(row["sourceType"] for row in active_rows),
        "byBank": Counter(row["bank"] for row in active_rows),
        "byIssue": Counter(issue for row in rows for issue in row["issues"].split(";") if issue),
        "bySkill": Counter(row["skill"] for row in active_rows),
        "outputs": {"json": str(OUT_JSON.relative_to(ROOT)), "csv": str(OUT_CSV.relative_to(ROOT))},
        "notes": [
            "This report mirrors app import behavior: OpenSAT duplicate prompts and duplicate A-D choices are skipped.",
            "AI-generated Kaplan/archive questions have current contentAudit pass records.",
            "OpenSAT/PineSAT items pass basic structure checks except rows listed with structural issues, but remain needs_review because they are external dataset items.",
            "Foundation items remain needs_review until human source/answer review is complete.",
        ],
    }

    OUT_JSON.write_text(json.dumps({"summary": summary, "items": rows, "skippedItems": skipped}, indent=2, ensure_ascii=False), encoding="utf-8")
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
