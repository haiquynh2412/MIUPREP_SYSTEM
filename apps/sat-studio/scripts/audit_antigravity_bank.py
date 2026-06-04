import csv
import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

try:
    from scripts.math_verifier import is_grid_in, parse_numeric_value, verify_math_answer
except ModuleNotFoundError:
    from math_verifier import is_grid_in, parse_numeric_value, verify_math_answer


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUT_JSON = DATA_DIR / "antigravity-bank-audit-report.json"
OUT_CSV = DATA_DIR / "antigravity-bank-audit-report.csv"

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

SAT_DOMAIN_TARGETS = {
    "Reading and Writing": {
        "Information and Ideas": 26.0,
        "Craft and Structure": 28.0,
        "Expression of Ideas": 20.0,
        "Standard English Conventions": 26.0,
    },
    "Math": {
        "Algebra": 35.0,
        "Advanced Math": 35.0,
        "Problem-Solving and Data Analysis": 15.0,
        "Geometry and Trigonometry": 15.0,
    },
}

RW_DOMAINS = set(SAT_DOMAIN_TARGETS["Reading and Writing"])
MATH_DOMAINS = set(SAT_DOMAIN_TARGETS["Math"])

COMMON_WORDS = {
    "about",
    "above",
    "according",
    "after",
    "again",
    "against",
    "answer",
    "based",
    "because",
    "before",
    "being",
    "below",
    "between",
    "choice",
    "claim",
    "complete",
    "correct",
    "could",
    "does",
    "each",
    "following",
    "from",
    "given",
    "have",
    "into",
    "most",
    "number",
    "question",
    "research",
    "researchers",
    "sentence",
    "student",
    "students",
    "study",
    "text",
    "than",
    "that",
    "their",
    "there",
    "these",
    "this",
    "which",
    "with",
    "would",
    "value",
}


def load_payload(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    records = payload.get("questions") if isinstance(payload, dict) else payload
    return records if isinstance(records, list) else []


def infer_section(domain: str) -> str:
    if domain in RW_DOMAINS:
        return "Reading and Writing"
    if domain in MATH_DOMAINS or str(domain).startswith("Math -"):
        return "Math"
    return "Unknown"


def normalize_question(item: dict[str, Any], source_file: str, index: int) -> dict[str, Any] | None:
    q = dict(item)
    nested = q.get("question")
    if not q.get("prompt") and isinstance(nested, dict):
        parts = [nested.get("paragraph"), nested.get("question")]
        q["prompt"] = "\n\n".join(str(part).strip() for part in parts if str(part or "").strip())
        q["choices"] = nested.get("choices") or q.get("choices") or {}
        q["correctAnswer"] = nested.get("correct_answer") or nested.get("correctAnswer") or q.get("correctAnswer")
        q["explanation"] = nested.get("explanation") or q.get("explanation")
        source_section = str(q.get("_satStudioSourceSection") or q.get("section") or "").lower()
        if source_section == "math":
            q["section"] = "Math"
        elif source_section == "english":
            q["section"] = "Reading and Writing"
        else:
            q["section"] = infer_section(q.get("domain") or "")
        q["sourceType"] = q.get("sourceType") or "opensat"
        q["skill"] = q.get("skill") or q.get("domain") or "OpenSAT imported skill"
    if not q.get("prompt"):
        return None
    q["_sourceFile"] = source_file
    q["_sourceIndex"] = index
    q["_auditId"] = q.get("id") or f"{source_file}#{index}"
    if not q.get("section"):
        q["section"] = infer_section(q.get("domain") or "")
    return q


def iter_questions() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for filename in QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        for index, item in enumerate(load_payload(path)):
            if isinstance(item, dict):
                normalized = normalize_question(item, filename, index)
                if normalized:
                    rows.append(normalized)
    return rows


def normalize_prompt(text: Any) -> str:
    return re.sub(r"\s+", " ", str(text or "").strip().lower())


def word_count(text: Any) -> int:
    return len(re.findall(r"\b[\w'-]+\b", str(text or "")))


def skeleton_key(text: Any, width: int = 180) -> str:
    cleaned = str(text or "").lower()
    cleaned = re.sub(r"\$?\d+(?:,\d{3})*(?:\.\d+)?(?:/\d+(?:\.\d+)?)?", "#", cleaned)
    cleaned = re.sub(r"\b[a-z]\b", "v", cleaned)
    cleaned = re.sub(r"[^a-z0-9#\s]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:width]


def topic_key(question: dict[str, Any]) -> str:
    text = normalize_prompt(question.get("prompt"))
    tokens = [
        token
        for token in re.findall(r"[a-z][a-z-]{5,}", text)
        if token not in COMMON_WORDS and not token.endswith("ing")
    ]
    if not tokens:
        return ""
    counts = Counter(tokens)
    return sorted(counts, key=lambda token: (-counts[token], -len(token), text.find(token)))[0]


def answer_choice_values(question: dict[str, Any]) -> list[str]:
    choices = question.get("choices") or {}
    if not isinstance(choices, dict):
        return []
    return [str(choices.get(key, "")).strip().lower() for key in ["A", "B", "C", "D"]]


def explanation_parts(question: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        return str(explanation.get("correct") or ""), explanation.get("distractors") or {}
    return str(explanation or ""), {}


def audit_question(question: dict[str, Any], seen_prompts: dict[str, str]) -> dict[str, Any]:
    qid = str(question.get("_auditId"))
    prompt = question.get("prompt") or ""
    choices = question.get("choices") or {}
    qtype = str(question.get("questionType") or "multiple_choice")
    section = question.get("section") or "Unknown"
    skill = str(question.get("skill") or "")
    correct = question.get("correctAnswer")
    prompt_norm = normalize_prompt(prompt)

    issues: list[str] = []
    warnings: list[str] = []
    governance: list[str] = []

    for field in ["id", "section", "domain", "skill", "difficulty", "prompt", "correctAnswer", "explanation"]:
        if not question.get(field):
            issues.append(f"missing_{field}")

    if prompt_norm in seen_prompts:
        warnings.append(f"exact_duplicate_prompt:{seen_prompts[prompt_norm]}")
    else:
        seen_prompts[prompt_norm] = qid

    if section == "Reading and Writing" and qtype == "student_produced_response":
        issues.append("rw_must_be_multiple_choice")

    if skill.lower() in {"grid-in", "grid in", "student-produced response"} and not is_grid_in(question):
        issues.append("grid_in_skill_but_not_spr_format")

    if is_grid_in(question):
        if choices:
            issues.append("spr_should_not_have_choices")
        if str(correct).strip() in {"A", "B", "C", "D"}:
            issues.append("spr_correct_answer_is_choice_letter")
        if not question.get("acceptableAnswers"):
            warnings.append("spr_missing_acceptable_answers")
    else:
        if not isinstance(choices, dict) or set(choices.keys()) != {"A", "B", "C", "D"}:
            issues.append("mc_missing_exact_A_to_D_choices")
        if correct not in {"A", "B", "C", "D"}:
            issues.append("mc_invalid_correct_answer")
        values = answer_choice_values(question)
        if len(values) == 4 and len(set(values)) < 4:
            issues.append("mc_duplicate_choice_text")

    correct_explanation, distractors = explanation_parts(question)
    if not correct_explanation.strip():
        issues.append("missing_correct_explanation")
    if not isinstance(distractors, dict) or len(distractors) < 2:
        warnings.append("weak_or_missing_distractor_explanations")

    if section == "Reading and Writing":
        prompt_words = word_count(prompt)
        if prompt_words > 250:
            warnings.append(f"rw_prompt_possible_length_issue:{prompt_words}_words")
        if question.get("domain") not in RW_DOMAINS:
            issues.append("rw_domain_not_in_sat_blueprint")
    elif section == "Math":
        if question.get("domain") not in MATH_DOMAINS:
            warnings.append("math_domain_not_in_current_sat_blueprint")
        math_check = verify_math_answer(question)
        for issue in math_check.get("issues", []):
            if issue == "explanation_final_value_mismatch" and not is_grid_in(question):
                correct_choice = (question.get("choices") or {}).get(question.get("correctAnswer"))
                if parse_numeric_value(correct_choice) is None:
                    warnings.append(f"math:{issue}")
                    continue
            issues.append(f"math:{issue}")
        for warning in math_check.get("warnings", []):
            warnings.append(f"math:{warning}")
    else:
        issues.append("unknown_section")

    if question.get("reviewStatus") != "reviewed":
        governance.append("not_reviewed")
    if question.get("visibility") == "private_family":
        governance.append("private_family_only")
    if (question.get("contentAudit") or {}).get("verdict") != "pass":
        governance.append("content_audit_not_pass")

    severity = "pass"
    if issues:
        severity = "fail"
    elif warnings:
        severity = "warning"

    return {
        "id": qid,
        "sourceFile": question.get("_sourceFile"),
        "sourceIndex": question.get("_sourceIndex"),
        "sourceType": question.get("sourceType"),
        "section": section,
        "domain": question.get("domain"),
        "skill": question.get("skill"),
        "difficulty": question.get("difficulty"),
        "questionType": "student_produced_response" if is_grid_in(question) else "multiple_choice",
        "correctAnswer": correct,
        "reviewStatus": question.get("reviewStatus"),
        "visibility": question.get("visibility"),
        "publicationStatus": question.get("publicationStatus"),
        "contentAuditVersion": (question.get("contentAudit") or {}).get("version"),
        "contentAuditVerdict": (question.get("contentAudit") or {}).get("verdict"),
        "promptWords": word_count(prompt),
        "skeletonKey": skeleton_key(prompt),
        "topicKey": topic_key(question),
        "severity": severity,
        "issues": issues,
        "warnings": warnings,
        "governance": governance,
        "prompt": prompt,
    }


def pct(part: int, total: int) -> float:
    return round(part * 100 / total, 1) if total else 0.0


def distribution(rows: list[dict[str, Any]], field: str) -> dict[str, int]:
    return dict(Counter(str(row.get(field) or "Unknown") for row in rows))


def domain_alignment(rows: list[dict[str, Any]], section: str) -> list[dict[str, Any]]:
    section_rows = [row for row in rows if row.get("section") == section]
    total = len(section_rows)
    counts = Counter(row.get("domain") for row in section_rows)
    output = []
    for domain, target in SAT_DOMAIN_TARGETS[section].items():
        actual = pct(counts[domain], total)
        output.append(
            {
                "domain": domain,
                "count": counts[domain],
                "actualPct": actual,
                "satTargetPct": target,
                "deltaPctPoints": round(actual - target, 1),
            }
        )
    return output


def mc_answer_distribution(rows: list[dict[str, Any]]) -> dict[str, Any]:
    mc_rows = [row for row in rows if row.get("questionType") == "multiple_choice" and row.get("correctAnswer") in {"A", "B", "C", "D"}]
    counts = Counter(row.get("correctAnswer") for row in mc_rows)
    total = len(mc_rows)
    by_choice = {key: {"count": counts[key], "pct": pct(counts[key], total)} for key in ["A", "B", "C", "D"]}
    max_choice = max(by_choice, key=lambda key: by_choice[key]["pct"]) if total else None
    return {
        "totalMc": total,
        "byChoice": by_choice,
        "maxChoice": max_choice,
        "maxChoicePct": by_choice[max_choice]["pct"] if max_choice else 0,
        "answerLeakageRisk": bool(max_choice and by_choice[max_choice]["pct"] > 40),
    }


def spr_distribution(rows: list[dict[str, Any]]) -> dict[str, Any]:
    math_rows = [row for row in rows if row.get("section") == "Math"]
    spr_rows = [row for row in math_rows if row.get("questionType") == "student_produced_response"]
    return {
        "mathTotal": len(math_rows),
        "sprTotal": len(spr_rows),
        "sprPctOfMath": pct(len(spr_rows), len(math_rows)),
        "satExpectedApproxPct": 25.0,
        "deltaPctPoints": round(pct(len(spr_rows), len(math_rows)) - 25.0, 1) if math_rows else 0,
    }


def compare_repetition(antigravity_rows: list[dict[str, Any]], rest_rows: list[dict[str, Any]]) -> dict[str, Any]:
    ant_prompt_counts = Counter(row["prompt"].strip().lower() for row in antigravity_rows)
    rest_prompt_ids = defaultdict(list)
    for row in rest_rows:
        rest_prompt_ids[row["prompt"].strip().lower()].append(row["id"])

    exact_internal = [
        {"prompt": prompt, "count": count}
        for prompt, count in ant_prompt_counts.items()
        if prompt and count > 1
    ]
    exact_against_rest = [
        {"id": row["id"], "matchedIds": rest_prompt_ids[row["prompt"].strip().lower()][:10]}
        for row in antigravity_rows
        if row["prompt"].strip().lower() in rest_prompt_ids
    ]

    ant_skeleton_counts = Counter(row["skeletonKey"] for row in antigravity_rows if row.get("skeletonKey"))
    rest_skeleton_ids = defaultdict(list)
    for row in rest_rows:
        if row.get("skeletonKey"):
            rest_skeleton_ids[row["skeletonKey"]].append(row["id"])

    repeated_skeletons = [
        {
            "skeletonKey": skeleton,
            "count": count,
            "sampleIds": [row["id"] for row in antigravity_rows if row.get("skeletonKey") == skeleton][:8],
        }
        for skeleton, count in ant_skeleton_counts.most_common()
        if count > 1
    ]
    shared_skeletons = [
        {
            "skeletonKey": row["skeletonKey"],
            "antigravityId": row["id"],
            "matchedRestIds": rest_skeleton_ids[row["skeletonKey"]][:8],
        }
        for row in antigravity_rows
        if row.get("skeletonKey") in rest_skeleton_ids
    ]

    ant_topics = Counter(row.get("topicKey") for row in antigravity_rows if row.get("topicKey"))
    rest_topics = Counter(row.get("topicKey") for row in rest_rows if row.get("topicKey"))
    top_topics = []
    for topic, count in ant_topics.most_common(20):
        top_topics.append(
            {
                "topicKey": topic,
                "antigravityCount": count,
                "restCount": rest_topics.get(topic, 0),
                "antigravitySampleIds": [row["id"] for row in antigravity_rows if row.get("topicKey") == topic][:8],
            }
        )

    return {
        "exactDuplicatePromptsWithinAntigravity": exact_internal,
        "exactDuplicatePromptsAgainstRest": exact_against_rest,
        "repeatedSkeletonsWithinAntigravity": repeated_skeletons[:30],
        "sharedSkeletonsAgainstRest": shared_skeletons[:50],
        "uniqueSkeletonRatio": round(len(ant_skeleton_counts) / len(antigravity_rows), 3) if antigravity_rows else 0,
        "topTopicOverlap": top_topics,
    }


def build_summary(antigravity_rows: list[dict[str, Any]], rest_rows: list[dict[str, Any]]) -> dict[str, Any]:
    issue_counts = Counter(issue for row in antigravity_rows for issue in row["issues"])
    warning_counts = Counter(warning for row in antigravity_rows for warning in row["warnings"])
    governance_counts = Counter(item for row in antigravity_rows for item in row["governance"])

    critical_findings = []
    if issue_counts.get("grid_in_skill_but_not_spr_format", 0):
        critical_findings.append("Grid-in items are tagged as Grid-in but stored as multiple-choice.")
    answer_dist = mc_answer_distribution(antigravity_rows)
    if answer_dist["answerLeakageRisk"]:
        critical_findings.append(f"Answer-position leakage: {answer_dist['maxChoice']} is keyed for {answer_dist['maxChoicePct']}% of MC items.")
    spr_dist = spr_distribution(antigravity_rows)
    if spr_dist["sprPctOfMath"] < 15:
        critical_findings.append("Math SPR/grid-in proportion is far below the Digital SAT target.")

    readiness = "private_review_only"
    if not critical_findings and not issue_counts and governance_counts.get("not_reviewed", 0) == 0:
        readiness = "student_ready"
    elif not critical_findings and not issue_counts:
        readiness = "structurally_ok_but_needs_human_review"

    return {
        "auditedBank": "antigravity-bank.json",
        "antigravityTotal": len(antigravity_rows),
        "restOfSystemTotal": len(rest_rows),
        "readinessVerdict": readiness,
        "criticalFindings": critical_findings,
        "bySeverity": distribution(antigravity_rows, "severity"),
        "bySection": distribution(antigravity_rows, "section"),
        "byDomain": distribution(antigravity_rows, "domain"),
        "bySkill": distribution(antigravity_rows, "skill"),
        "byDifficulty": distribution(antigravity_rows, "difficulty"),
        "byQuestionType": distribution(antigravity_rows, "questionType"),
        "issueCounts": dict(issue_counts.most_common()),
        "warningCounts": dict(warning_counts.most_common()),
        "governanceCounts": dict(governance_counts.most_common()),
        "answerChoiceDistribution": answer_dist,
        "studentProducedResponseDistribution": spr_dist,
        "domainAlignment": {
            "Reading and Writing": domain_alignment(antigravity_rows, "Reading and Writing"),
            "Math": domain_alignment(antigravity_rows, "Math"),
        },
        "restOfSystemComparison": {
            "bySection": distribution(rest_rows, "section"),
            "byDifficulty": distribution(rest_rows, "difficulty"),
            "answerChoiceDistribution": mc_answer_distribution(rest_rows),
            "studentProducedResponseDistribution": spr_distribution(rest_rows),
        },
    }


def main() -> None:
    questions = iter_questions()
    seen: dict[str, str] = {}
    rows = [audit_question(question, seen) for question in questions]
    antigravity_rows = [row for row in rows if row.get("sourceFile") == "antigravity-bank.json"]
    rest_rows = [row for row in rows if row.get("sourceFile") != "antigravity-bank.json"]

    report = {
        "summary": build_summary(antigravity_rows, rest_rows),
        "repetitionAndDiversity": compare_repetition(antigravity_rows, rest_rows),
        "items": antigravity_rows,
    }

    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = [
            "id",
            "sourceFile",
            "sourceType",
            "section",
            "domain",
            "skill",
            "difficulty",
            "questionType",
            "correctAnswer",
            "reviewStatus",
            "visibility",
            "publicationStatus",
            "contentAuditVersion",
            "contentAuditVerdict",
            "promptWords",
            "severity",
            "issues",
            "warnings",
            "governance",
            "topicKey",
            "skeletonKey",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in antigravity_rows:
            csv_row = dict(row)
            for key in ["issues", "warnings", "governance"]:
                csv_row[key] = ";".join(csv_row.get(key) or [])
            writer.writerow({key: csv_row.get(key) for key in fieldnames})

    compact = {
        "antigravityTotal": report["summary"]["antigravityTotal"],
        "readinessVerdict": report["summary"]["readinessVerdict"],
        "criticalFindings": report["summary"]["criticalFindings"],
        "bySeverity": report["summary"]["bySeverity"],
        "answerChoiceDistribution": report["summary"]["answerChoiceDistribution"],
        "studentProducedResponseDistribution": report["summary"]["studentProducedResponseDistribution"],
        "outputs": {"json": str(OUT_JSON.relative_to(ROOT)), "csv": str(OUT_CSV.relative_to(ROOT))},
    }
    print(json.dumps(compact, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
