import csv
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUTS = [
    ROOT / "data" / "kaplan-sat-math-ai-bank.json",
    ROOT / "data" / "archive-source-ai-bank.json",
    ROOT / "data" / "sat-king-supplemental-ai-bank.json",
    ROOT / "data" / "sat-1590-elite-ai-bank.json",
]
OUT_JSON = ROOT / "data" / "generated-question-audit-report.json"
OUT_CSV = ROOT / "data" / "generated-question-audit-report.csv"
AUDIT_VERSION = "sat-king-audit-2026-05-17"


QUESTION_LIKE_FIELDS = ["prompt", "explanation"]


def load_questions(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload["questions"] if isinstance(payload, dict) else payload
    for question in questions:
        yield {**question, "_bankFile": path.name}


def tokenize(text):
    return re.findall(r"[a-z0-9]+", str(text).lower())


def unique_choices(question):
    if question.get("questionType") == "student_produced_response":
        return bool(question.get("correctAnswer") or question.get("acceptableAnswers"))
    choices = question.get("choices") or {}
    values = [str(choices.get(key, "")).strip().lower() for key in ["A", "B", "C", "D"]]
    return len(values) == 4 and len(set(values)) == 4 and all(values)


def has_required_fields(question):
    required = ["id", "section", "domain", "skill", "difficulty", "prompt", "correctAnswer", "explanation"]
    if not all(question.get(field) for field in required):
        return False
    if question.get("questionType") == "student_produced_response":
        return True
    return bool(question.get("choices"))


def explanation_mentions_answer(question):
    if question.get("questionType") == "student_produced_response":
        return True
    choices = question.get("choices") or {}
    answer_key = question.get("correctAnswer")
    answer = str(choices.get(answer_key, "")).strip().lower()
    explanation = str(question.get("explanation", "")).lower()
    if not answer:
        return False
    if answer in explanation:
        return True
    if answer.replace("pi", "π") in explanation or answer.replace("π", "pi") in explanation:
        return True
    return False


def max_number(text):
    numbers = [abs(int(match)) for match in re.findall(r"-?\d+", str(text))]
    return max(numbers) if numbers else 0


def prompt_quality_issues(question):
    issues = []
    prompt = str(question.get("prompt", ""))
    explanation = str(question.get("explanation", ""))
    skill = str(question.get("skill", ""))

    if len(prompt) < 35:
        issues.append("prompt_too_short")
    if len(explanation) < 20:
        issues.append("explanation_too_short")
    if re.search(r"\b(case|checkpoint|pilot group|survey group)\s+\d{3,}\b", prompt, re.I):
        issues.append("artificial_tracking_label")
    if re.search(r"\btrial\s+\d{3,}\b", prompt, re.I):
        issues.append("artificial_trial_number")
    if re.search(r",\s+[A-Z][a-z]+", prompt) and "______" in prompt:
        issues.append("awkward_capitalization_after_comma")
    if question.get("section") == "Math" and max_number(prompt) > 5000:
        issues.append("math_numbers_too_large")
    if question.get("section") == "Math" and skill in {"Circles", "Right triangles and trigonometry"} and max_number(prompt) > 250:
        issues.append("geometry_numbers_too_large")
    if question.get("section") == "Reading and Writing" and not re.search(r"Which choice|Which inference|Which finding", prompt):
        issues.append("rw_missing_standard_stem")
    if question.get("section") == "Math" and not any(stem in prompt.lower() for stem in ["what is", "which", "how many"]):
        issues.append("math_missing_question_stem")
    return issues


def audit_question(question, seen_prompts):
    if question.get("reviewStatus") == "rejected" and str(question.get("publicationStatus") or "").startswith("rejected_template_"):
        return "rejected", [question.get("publicationStatus")]

    issues = []
    grid_in = question.get("questionType") == "student_produced_response"
    if not has_required_fields(question):
        issues.append("missing_required_field")
    if not unique_choices(question):
        issues.append("duplicate_or_missing_choices")
    if not grid_in and question.get("correctAnswer") not in ["A", "B", "C", "D"]:
        issues.append("invalid_correct_answer")
    if question.get("visibility") != "private_family":
        if question.get("sourceType") not in {"sat_king", "sat_1590"} or question.get("visibility") != "public_candidate":
            issues.append("unexpected_visibility")
    if question.get("reviewStatus") != "reviewed":
        issues.append("not_reviewed")
    if question.get("autoCheck", {}).get("status") != "passed":
        issues.append("auto_check_not_passed")
    if question.get("contentAudit", {}).get("version") != AUDIT_VERSION:
        issues.append("missing_current_content_audit_version")
    if not explanation_mentions_answer(question):
        # Some Reading/Writing explanations name the concept instead of repeating the exact full sentence.
        if question.get("section") == "Math":
            issues.append("explanation_does_not_include_answer")
    normalized_prompt = " ".join(tokenize(question.get("prompt", "")))
    if normalized_prompt in seen_prompts:
        issues.append("duplicate_prompt")
    else:
        seen_prompts.add(normalized_prompt)
    issues.extend(prompt_quality_issues(question))

    if any(issue.startswith(("missing", "invalid", "duplicate_or_missing", "visibility", "auto_check", "duplicate_prompt")) for issue in issues):
        verdict = "fail"
    elif issues:
        verdict = "needs_polish"
    else:
        verdict = "pass"
    return verdict, issues


def main():
    rows = []
    seen_prompts = set()
    for path in INPUTS:
        for question in load_questions(path):
            verdict, issues = audit_question(question, seen_prompts)
            rows.append(
                {
                    "id": question.get("id"),
                    "bankFile": question.get("_bankFile"),
                    "section": question.get("section"),
                    "domain": question.get("domain"),
                    "skill": question.get("skill"),
                    "difficulty": question.get("difficulty"),
                    "sourceSignalId": question.get("sourceSignalId"),
                    "sourceReference": question.get("sourceReference"),
                    "practicePool": question.get("practicePool") or question.get("skeletonDiversity", {}).get("practicePool", "core_pool"),
                    "skeletonId": question.get("skeletonDiversity", {}).get("skeletonId", ""),
                    "skeletonRank": question.get("skeletonDiversity", {}).get("skeletonRank", ""),
                    "skeletonSize": question.get("skeletonDiversity", {}).get("skeletonSize", ""),
                    "verdict": verdict,
                    "issues": ";".join(issues),
                    "prompt": question.get("prompt"),
                    "correctAnswer": question.get("correctAnswer"),
                    "correctChoice": (question.get("choices") or {}).get(question.get("correctAnswer")),
                }
            )

    active_rows = [row for row in rows if row["verdict"] != "rejected"]
    core_rows = [row for row in active_rows if row.get("practicePool") == "core_pool"]
    remedial_rows = [row for row in active_rows if row.get("practicePool") == "remedial_pool"]
    hidden_rows = [row for row in active_rows if row.get("practicePool") == "hidden_duplicate"]
    summary = {
        "activeTotal": len(active_rows),
        "corePoolTotal": len(core_rows),
        "remedialPoolTotal": len(remedial_rows),
        "hiddenDuplicateSkeleton": len(hidden_rows),
        "auditedTotalIncludingRejected": len(rows),
        "rejectedTemplateVariant": sum(1 for row in rows if row["verdict"] == "rejected"),
        "byVerdict": Counter(row["verdict"] for row in rows),
        "byPracticePool": Counter(row.get("practicePool") or "core_pool" for row in active_rows),
        "byIssue": Counter(issue for row in rows for issue in row["issues"].split(";") if issue),
        "byBank": Counter(row["bankFile"] for row in active_rows),
        "bySkill": Counter(row["skill"] for row in active_rows),
        "outputs": {
            "json": str(OUT_JSON.relative_to(ROOT)),
            "csv": str(OUT_CSV.relative_to(ROOT)),
        },
    }
    payload = {"summary": summary, "items": rows}
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
