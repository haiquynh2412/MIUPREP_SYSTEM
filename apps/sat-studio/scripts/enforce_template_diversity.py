import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUTS = [
    ROOT / "data" / "kaplan-sat-math-ai-bank.json",
    ROOT / "data" / "archive-source-ai-bank.json",
    ROOT / "data" / "sat-king-supplemental-ai-bank.json",
    ROOT / "data" / "sat-1590-elite-ai-bank.json",
]
OUT = ROOT / "data" / "template-diversity-report.json"
MAX_PER_FORM = 3

SOURCE_PRIORITY = {
    "sat_1590": 0,
    "sat_king": 1,
    "ai_generated": 2,
}

DIFFICULTY_PRIORITY = {
    "Hard": 0,
    "Medium": 1,
    "Easy": 2,
}


def load_payload(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload["questions"] if isinstance(payload, dict) and "questions" in payload else payload
    return payload, questions


def write_payload(path, payload, questions):
    if isinstance(payload, dict) and "questions" in payload:
        payload["questions"] = questions
        if isinstance(payload.get("summary"), dict):
            payload["summary"]["activeAfterTemplateDiversity"] = sum(q.get("reviewStatus") != "rejected" for q in questions)
            payload["summary"]["templateDiversityMaxPerForm"] = MAX_PER_FORM
    else:
        payload = questions
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def normalize_template(prompt):
    text = str(prompt).lower()
    text = text.replace("≥", ">=").replace("≤", "<=")
    text = re.sub(r"\$?\b\d+(?:,\d{3})*(?:\.\d+)?\b%?", "#", text)
    text = re.sub(r"\b[abcdwxyz]\b(?=\s*[=+\-*/^<>()])", "v", text)
    text = re.sub(r"(?<=[=+\-*/^<>()])\s*\b[abcdwxyz]\b", " v", text)
    text = re.sub(r"\bf\(#\)|g\(#\)|h\(#\)", "f(#)", text)
    text = re.sub(r"\bsite [a-d]\b", "site @", text)
    text = re.sub(r"\b(point|set|case|calibration set|design plan|setup) [a-z]\b", r"\1 @", text)
    text = re.sub(r"\b[a-z]\(\s*v\s*\)", "f(v)", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def form_key(question):
    return "|".join(
        [
            str(question.get("section") or ""),
            str(question.get("domain") or ""),
            str(question.get("skill") or ""),
            str(question.get("questionType") or "multiple_choice"),
            normalize_template(question.get("prompt") or ""),
        ]
    )


def reset_previous_template_rejections(question):
    if str(question.get("publicationStatus") or "").startswith("rejected_template_"):
        question["reviewStatus"] = "reviewed"
        question["publicationStatus"] = "public_candidate_auto_reviewed" if question.get("visibility") == "public_candidate" else "private_auto_reviewed"
        question.pop("templateDiversity", None)
    return question


def stable_form_id(key):
    value = 2166136261
    for char in key:
        value ^= ord(char)
        value = (value * 16777619) & 0xFFFFFFFF
    return f"form-{value:08x}"


def max_number(text):
    values = [abs(float(match)) for match in re.findall(r"-?\d+(?:\.\d+)?", str(text))]
    return max(values) if values else 0


def numbers_in(text):
    return [float(match.replace(",", "")) for match in re.findall(r"-?\d+(?:,\d{3})*(?:\.\d+)?", str(text))]


def correct_answer_text(question):
    if question.get("questionType") == "student_produced_response":
        return str(question.get("correctAnswer") or (question.get("acceptableAnswers") or [""])[0])
    return str((question.get("choices") or {}).get(question.get("correctAnswer"), ""))


def parse_numberish(text):
    text = str(text).strip().replace(",", "")
    if not text:
        return None
    if "/" in text:
        parts = text.split("/")
        if len(parts) == 2:
            try:
                numerator = float(parts[0])
                denominator = float(parts[1])
                if denominator:
                    return numerator / denominator
            except ValueError:
                return None
    text = text.replace("pi", "").replace("\u03c0", "").strip()
    try:
        return float(text)
    except ValueError:
        return None


def answer_roundness_score(question):
    answer = correct_answer_text(question)
    value = parse_numberish(answer)
    if value is None:
        if re.fullmatch(r"-?\d+\s*/\s*(2|3|4|5|8|10|12|13)", answer):
            return 1
        if "/" in answer:
            return 3
        if "pi" in answer.lower() or "\u03c0" in answer:
            return 2
        return 4

    if abs(value - round(value)) < 1e-9:
        n = abs(round(value))
        if n <= 20:
            return 0
        if n <= 100 and n % 5 == 0:
            return 0
        if n <= 100:
            return 1
        if n <= 500 and n % 10 == 0:
            return 1
        return 2

    doubled = value * 2
    quartered = value * 4
    tenthed = value * 10
    if abs(doubled - round(doubled)) < 1e-9:
        return 1
    if abs(quartered - round(quartered)) < 1e-9 or abs(tenthed - round(tenthed)) < 1e-9:
        return 2
    return 4


def calculation_ease_score(question):
    prompt_numbers = numbers_in(question.get("prompt") or "")
    score = answer_roundness_score(question)

    if len(prompt_numbers) <= 4:
        score -= 1
    elif len(prompt_numbers) >= 9:
        score += 2

    if prompt_numbers:
        largest = max(abs(value) for value in prompt_numbers)
        if largest <= 50:
            score -= 1
        elif largest > 500:
            score += 2
        if any(abs(value - round(value)) > 1e-9 for value in prompt_numbers):
            score += 2

    prompt = str(question.get("prompt") or "").lower()
    if any(token in prompt for token in ["doubles", "triples", "half", "radius", "diameter", "mean", "slope"]):
        score -= 1
    if any(token in prompt for token in ["sales tax", "discounted", "similar solids", "arc length", "probability"]):
        score += 1

    return max(0, score)


def is_quick_mental_math(question):
    if question.get("section") != "Math":
        return False
    if question.get("difficulty") != "Easy":
        return False
    skill = question.get("skill")
    quick_skills = {
        "Linear equations in one variable",
        "Linear functions and slope",
        "Percentages",
        "Ratios and rates",
        "Rates and units",
        "Statistics",
        "Data interpretation",
        "Circles",
        "Lines, angles, and triangles",
    }
    return skill in quick_skills and len(str(question.get("prompt") or "")) <= 240 and max_number(question.get("prompt")) <= 250


def keep_sort_key(record):
    question = record["question"]
    return (
        calculation_ease_score(question),
        DIFFICULTY_PRIORITY.get(question.get("difficulty"), 9),
        SOURCE_PRIORITY.get(question.get("sourceType"), 9),
        0 if question.get("questionType") == "student_produced_response" else 1,
        record["path"].name,
        str(question.get("id") or ""),
    )


def main():
    payloads = {}
    all_records = []

    for path in INPUTS:
        payload, questions = load_payload(path)
        normalized = [reset_previous_template_rejections(q) for q in questions]
        payloads[path] = {"payload": payload, "questions": normalized}
        for index, question in enumerate(normalized):
            if question.get("reviewStatus") == "rejected":
                continue
            if question.get("sourceType") not in {"ai_generated", "sat_king", "sat_1590"}:
                continue
            all_records.append({"path": path, "index": index, "question": question, "key": form_key(question)})

    groups = defaultdict(list)
    for record in all_records:
        groups[record["key"]].append(record)

    kept = []
    rejected = []
    oversized_groups = []
    annotated = []
    easy_rejected = []

    for key, records in groups.items():
        ranked = sorted(records, key=keep_sort_key)
        form_id = stable_form_id(key)
        for rank, record in enumerate(ranked, start=1):
            question = record["question"]
            if len(records) > 1:
                question["templateDiversity"] = {
                    "status": "active_template_variant",
                    "formId": form_id,
                    "maxVisibleBeforeMastery": MAX_PER_FORM,
                    "formSize": len(records),
                    "formRank": rank,
                    "calculationEaseScore": calculation_ease_score(question),
                    "roundAnswerPreferred": answer_roundness_score(question) <= 1,
                    "formKey": key[:260],
                    "policy": "Hide this form after the learner answers any variant correctly. While unmastered, show a small set of variants; show more only after repeated misses.",
                }
                annotated.append(record)

            if len(records) > MAX_PER_FORM and question.get("difficulty") == "Easy" and not is_quick_mental_math(question):
                question["reviewStatus"] = "rejected"
                question["publicationStatus"] = "rejected_template_easy"
                question["templateDiversity"] = {
                    **question.get("templateDiversity", {}),
                    "status": "rejected_easy_template",
                    "reason": "Easy repeated template without quick mental-math value.",
                }
                rejected.append(record)
                easy_rejected.append(record)
                continue

            if len(records) > MAX_PER_FORM:
                question["publicationStatus"] = question.get("publicationStatus") or (
                    "public_candidate_auto_reviewed" if question.get("visibility") == "public_candidate" else "private_auto_reviewed"
                )
                kept.append(record)
                continue
            kept.append(record)
        if len(records) > MAX_PER_FORM:
            sample = ranked[0]["question"]
            oversized_groups.append(
                {
                    "formSizeBeforeLimit": len(records),
                    "keptActive": sum(1 for r in ranked if r["question"].get("reviewStatus") != "rejected"),
                    "rejectedEasy": sum(1 for r in ranked if r["question"].get("publicationStatus") == "rejected_template_easy"),
                    "section": sample.get("section"),
                    "domain": sample.get("domain"),
                    "skill": sample.get("skill"),
                    "questionType": sample.get("questionType", "multiple_choice"),
                    "difficultyMix": dict(Counter(r["question"].get("difficulty") for r in records)),
                    "sourceMix": dict(Counter(r["question"].get("sourceType") for r in records)),
                    "samplePrompt": sample.get("prompt"),
                    "formKey": key[:260],
                }
            )

    for path, data in payloads.items():
        write_payload(path, data["payload"], data["questions"])

    active_by_file = {}
    rejected_by_file = {}
    for path, data in payloads.items():
        active_by_file[path.name] = sum(q.get("reviewStatus") != "rejected" for q in data["questions"])
        rejected_by_file[path.name] = sum(str(q.get("publicationStatus") or "").startswith("rejected_template_") for q in data["questions"])

    report = {
        "maxVisibleBeforeMastery": MAX_PER_FORM,
        "auditedGeneratedQuestions": len(all_records),
        "forms": len(groups),
        "oversizedForms": len(oversized_groups),
        "annotatedTemplateVariants": len(annotated),
        "keptReady": sum(1 for record in all_records if record["question"].get("reviewStatus") != "rejected"),
        "rejectedEasyTemplate": len(easy_rejected),
        "activeByFile": active_by_file,
        "rejectedByFile": rejected_by_file,
        "largestOversizedForms": sorted(oversized_groups, key=lambda item: item["formSizeBeforeLimit"], reverse=True)[:80],
        "policy": "Repeated hard/medium forms stay active but are annotated with a formId. The app hides a form after the learner answers any variant correctly and shows only a small set while unmastered. Easy repeated forms are rejected unless they are quick mental-math drills.",
    }
    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ["maxVisibleBeforeMastery", "auditedGeneratedQuestions", "forms", "oversizedForms", "annotatedTemplateVariants", "keptReady", "rejectedEasyTemplate", "activeByFile", "rejectedByFile"]}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
