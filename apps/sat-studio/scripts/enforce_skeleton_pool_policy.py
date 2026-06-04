import csv
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
OUT_JSON = ROOT / "data" / "skeleton-repetition-report.json"
OUT_CSV = ROOT / "data" / "skeleton-repetition-report.csv"

CORE_LIMITS = {"Easy": 3, "Medium": 5, "Hard": 8}
ACTIVE_LIMITS = {"Easy": 10, "Medium": 10, "Hard": 10}

SOURCE_PRIORITY = {
    "sat_1590": 0,
    "sat_king": 1,
    "ai_generated": 2,
}

QUESTION_TYPE_PRIORITY = {
    "student_produced_response": 0,
    "grid_in": 0,
    "numeric": 0,
    "multiple_choice": 1,
}


def load_payload(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload["questions"] if isinstance(payload, dict) and "questions" in payload else payload
    return payload, questions


def write_payload(path, payload, questions):
    if isinstance(payload, dict) and "questions" in payload:
        payload["questions"] = questions
        payload.setdefault("summary", {})
        if isinstance(payload.get("summary"), dict):
            payload["summary"]["skeletonPolicy"] = {
                "coreLimits": CORE_LIMITS,
                "activeLimits": ACTIVE_LIMITS,
                "updatedBy": "scripts/enforce_skeleton_pool_policy.py",
            }
            payload["summary"]["corePool"] = sum(pool_of(q) == "core_pool" for q in questions)
            payload["summary"]["remedialPool"] = sum(pool_of(q) == "remedial_pool" for q in questions)
            payload["summary"]["hiddenDuplicate"] = sum(pool_of(q) == "hidden_duplicate" for q in questions)
    else:
        payload = questions
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def pool_of(question):
    return question.get("practicePool") or question.get("skeletonDiversity", {}).get("practicePool")


def normalize_skeleton(prompt):
    text = str(prompt or "").lower()
    text = text.replace("≥", ">=").replace("≤", "<=").replace("−", "-")
    text = re.sub(r"\btext\s*1\b", "text one", text)
    text = re.sub(r"\btext\s*2\b", "text two", text)
    text = re.sub(r"\$?\b\d+(?:,\d{3})*(?:\.\d+)?(?:/\d+(?:\.\d+)?)?%?", "#", text)
    text = re.sub(r"\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b", "@month", text)
    text = re.sub(r"\b\d{4}\b", "#year", text)
    text = re.sub(r"\b[a-z]\b(?=\s*[=+\-*/^<>()])", "v", text)
    text = re.sub(r"(?<=[=+\-*/^<>()])\s*\b[a-z]\b", " v", text)
    text = re.sub(r"\bf\(#\)|g\(#\)|h\(#\)", "f(#)", text)
    text = re.sub(r"\b[a-z]\(\s*v\s*\)", "f(v)", text)
    text = re.sub(r"\b(point|set|case|site|sample|trial|group|plan|route|project) [a-z]\b", r"\1 @", text)
    text = re.sub(r"\b[a-z][a-z]+(?:ian|son|ton|ley|man|berg|ez|ski|ova|ov)\b", "@name", text)
    text = re.sub(r"\s*([,.;:?!()=+\-*/<>])\s*", r" \1 ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def skeleton_key(question):
    return "|".join(
        [
            str(question.get("difficulty") or ""),
            str(question.get("section") or ""),
            str(question.get("domain") or ""),
            str(question.get("skill") or ""),
            str(question.get("questionType") or "multiple_choice"),
            normalize_skeleton(question.get("prompt") or ""),
        ]
    )


def stable_id(prefix, key):
    value = 2166136261
    for char in key:
        value ^= ord(char)
        value = (value * 16777619) & 0xFFFFFFFF
    return f"{prefix}-{value:08x}"


def numbers_in(text):
    return [float(match.replace(",", "")) for match in re.findall(r"-?\d+(?:,\d{3})*(?:\.\d+)?", str(text or ""))]


def correct_answer_text(question):
    if question.get("questionType") == "student_produced_response":
        return str(question.get("correctAnswer") or (question.get("acceptableAnswers") or [""])[0])
    return str((question.get("choices") or {}).get(question.get("correctAnswer"), ""))


def parse_numberish(text):
    text = str(text or "").strip().replace(",", "").lower()
    if not text:
        return None
    if "/" in text:
        parts = text.split("/")
        if len(parts) == 2:
            try:
                bottom = float(parts[1])
                return float(parts[0]) / bottom if bottom else None
            except ValueError:
                return None
    text = text.replace("pi", "").replace("π", "").strip()
    try:
        return float(text)
    except ValueError:
        return None


def answer_roundness_score(question):
    answer = correct_answer_text(question)
    value = parse_numberish(answer)
    if value is None:
        if "/" in answer:
            return 2
        if "pi" in answer.lower() or "π" in answer:
            return 1
        return 3
    if abs(value - round(value)) < 1e-9:
        n = abs(round(value))
        if n <= 100 and (n <= 20 or n % 5 == 0):
            return 0
        return 1 if n <= 500 else 2
    if abs(value * 2 - round(value * 2)) < 1e-9:
        return 1
    if abs(value * 4 - round(value * 4)) < 1e-9 or abs(value * 10 - round(value * 10)) < 1e-9:
        return 2
    return 4


def calculation_ease_score(question):
    values = numbers_in(question.get("prompt") or "")
    score = answer_roundness_score(question)
    if question.get("section") != "Math":
        return score
    if len(values) <= 4:
        score -= 1
    elif len(values) >= 9:
        score += 2
    if values:
        largest = max(abs(value) for value in values)
        if largest <= 50:
            score -= 1
        elif largest > 500:
            score += 2
        if any(abs(value - round(value)) > 1e-9 for value in values):
            score += 2
    return max(0, score)


def explanation_score(question):
    explanation = str(question.get("explanation") or "")
    return min(8, len(explanation.split()) // 18)


def keep_sort_key(record):
    question = record["question"]
    return (
        calculation_ease_score(question),
        -explanation_score(question),
        SOURCE_PRIORITY.get(question.get("sourceType"), 9),
        QUESTION_TYPE_PRIORITY.get(question.get("questionType") or "multiple_choice", 1),
        record["path"].name,
        str(question.get("id") or ""),
    )


def clear_previous(question):
    question.pop("skeletonDiversity", None)
    question.pop("practicePool", None)
    if question.get("publicationStatus") == "hidden_duplicate_skeleton_overflow":
        question["publicationStatus"] = "private_auto_reviewed" if question.get("visibility") == "private_family" else "public_candidate_auto_reviewed"
    return question


def main():
    payloads = {}
    records = []

    for path in INPUTS:
        payload, questions = load_payload(path)
        normalized = [clear_previous(question) for question in questions]
        payloads[path] = {"payload": payload, "questions": normalized}
        for index, question in enumerate(normalized):
            if question.get("reviewStatus") == "rejected":
                continue
            if question.get("sourceType") not in {"ai_generated", "sat_king", "sat_1590"}:
                continue
            key = skeleton_key(question)
            records.append({"path": path, "index": index, "question": question, "key": key})

    groups = defaultdict(list)
    for record in records:
        groups[record["key"]].append(record)

    group_rows = []
    pool_counts = Counter()
    hidden_records = []

    for key, group in groups.items():
        ranked = sorted(group, key=keep_sort_key)
        sample = ranked[0]["question"]
        difficulty = sample.get("difficulty") or "Medium"
        core_limit = CORE_LIMITS.get(difficulty, 5)
        active_limit = ACTIVE_LIMITS.get(difficulty, 10)
        skeleton_id = stable_id("skel", key)
        for rank, record in enumerate(ranked, start=1):
            question = record["question"]
            if rank <= core_limit:
                pool = "core_pool"
                reason = "Within core diversity cap."
            elif rank <= active_limit:
                pool = "remedial_pool"
                reason = "Repeated skeleton kept only for learners who miss this form."
            else:
                pool = "hidden_duplicate"
                reason = "Skeleton overflow beyond active cap."
                hidden_records.append(record)
                question["publicationStatus"] = "hidden_duplicate_skeleton_overflow"

            question["practicePool"] = pool
            question["skeletonDiversity"] = {
                "skeletonId": skeleton_id,
                "skeletonRank": rank,
                "skeletonSize": len(group),
                "coreLimit": core_limit,
                "activeLimit": active_limit,
                "practicePool": pool,
                "calculationEaseScore": calculation_ease_score(question),
                "roundAnswerPreferred": answer_roundness_score(question) <= 1,
                "skeletonKey": key[:280],
                "reason": reason,
                "policy": "Core pool is visible by default. Remedial pool opens only after misses. Hidden duplicates stay out of normal practice.",
            }
            pool_counts[pool] += 1

        if len(group) > active_limit or len(group) > core_limit:
            group_rows.append(
                {
                    "skeletonId": skeleton_id,
                    "size": len(group),
                    "coreLimit": core_limit,
                    "activeLimit": active_limit,
                    "corePool": min(len(group), core_limit),
                    "remedialPool": max(0, min(len(group), active_limit) - core_limit),
                    "hiddenDuplicate": max(0, len(group) - active_limit),
                    "difficulty": difficulty,
                    "section": sample.get("section"),
                    "domain": sample.get("domain"),
                    "skill": sample.get("skill"),
                    "questionType": sample.get("questionType", "multiple_choice"),
                    "sourceMix": dict(Counter(record["question"].get("sourceType") for record in group)),
                    "sampleId": sample.get("id"),
                    "samplePrompt": sample.get("prompt"),
                    "skeletonKey": key[:280],
                }
            )

    for path, data in payloads.items():
        write_payload(path, data["payload"], data["questions"])

    by_difficulty = {}
    for difficulty in ["Easy", "Medium", "Hard"]:
        rows = [record for record in records if record["question"].get("difficulty") == difficulty]
        keys = {record["key"] for record in rows}
        by_difficulty[difficulty] = {
            "questions": len(rows),
            "skeletons": len(keys),
            "diversityPct": round(len(keys) / len(rows) * 100, 1) if rows else 0,
            "overCoreLimit": sum(1 for row in group_rows if row["difficulty"] == difficulty and row["size"] > row["coreLimit"]),
            "overActiveLimit": sum(1 for row in group_rows if row["difficulty"] == difficulty and row["size"] > row["activeLimit"]),
        }

    report = {
        "policy": {
            "coreLimits": CORE_LIMITS,
            "activeLimits": ACTIVE_LIMITS,
            "corePool": "Visible in normal practice.",
            "remedialPool": "Hidden until the learner misses the same skeleton/form.",
            "hiddenDuplicate": "Excluded from normal practice and generation should avoid creating more.",
        },
        "summary": {
            "auditedQuestions": len(records),
            "skeletons": len(groups),
            "poolCounts": dict(pool_counts),
            "hiddenDuplicate": len(hidden_records),
            "byDifficulty": by_difficulty,
        },
        "largestRepeatedSkeletons": sorted(group_rows, key=lambda row: row["size"], reverse=True)[:120],
    }

    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with OUT_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "skeletonId",
                "size",
                "coreLimit",
                "activeLimit",
                "corePool",
                "remedialPool",
                "hiddenDuplicate",
                "difficulty",
                "section",
                "domain",
                "skill",
                "questionType",
                "sampleId",
                "samplePrompt",
                "skeletonKey",
            ],
        )
        writer.writeheader()
        for row in sorted(group_rows, key=lambda item: item["size"], reverse=True):
            writer.writerow({field: row.get(field, "") for field in writer.fieldnames})

    print(json.dumps(report["summary"], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
