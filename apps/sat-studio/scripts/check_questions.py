import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

try:
    from scripts.math_verifier import (
        all_explanation_text,
        explanation_mentions_correct_answer,
        is_grid_in,
        verify_acceptable_answers,
        verify_math_answer,
    )
except ModuleNotFoundError:
    from math_verifier import (
        all_explanation_text,
        explanation_mentions_correct_answer,
        is_grid_in,
        verify_acceptable_answers,
        verify_math_answer,
    )


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DEFAULT_REPORT = DATA_DIR / "question-integrity-report.json"
DEFAULT_STUDY_POLICY = DATA_DIR / "question-study-policy.json"
TOPIC_THRESHOLD = 35
TOPIC_KEEP_TARGET = 35
TOPIC_SAMPLE_LIMIT = 8
TOPIC_CANDIDATE_LIMIT = 20

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

RW_COMMON = {
    "which",
    "choice",
    "complete",
    "completes",
    "text",
    "student",
    "notes",
    "research",
    "researching",
    "researcher",
    "researchers",
    "study",
    "studies",
    "passage",
    "according",
    "following",
    "effectively",
    "standard",
    "english",
    "conventions",
    "conforms",
    "information",
    "writing",
    "sentence",
    "grammatically",
    "author",
    "claim",
    "evidence",
    "suggest",
    "suggests",
    "understanding",
    "finding",
    "findings",
    "because",
    "however",
    "therefore",
    "data",
    "table",
    "participant",
    "participants",
    "population",
    "populations",
    "relationship",
    "relationships",
    "result",
    "results",
    "transition",
    "transitions",
    "punctuation",
    "purpose",
    "function",
    "describes",
    "described",
    "compared",
    "comparison",
    "planning",
    "review",
    "reviewing",
    "represents",
    "represented",
    "represent",
    "exactly",
    "independent",
    "interpretation",
    "observations",
    "positive",
}

MATH_COMMON = {
    "value",
    "equation",
    "equations",
    "function",
    "functions",
    "number",
    "numbers",
    "exactly",
    "linear",
    "quadratic",
    "circle",
    "circles",
    "triangle",
    "triangles",
    "percent",
    "percentage",
    "percentages",
    "points",
    "slope",
    "answer",
    "equivalent",
    "defined",
    "following",
    "through",
    "solution",
    "solutions",
    "system",
    "systems",
    "expression",
    "expressions",
    "inequality",
    "inequalities",
    "satisfies",
    "approximately",
    "centimeter",
    "centimeters",
    "meter",
    "meters",
    "inches",
    "units",
    "quantity",
    "quantities",
    "values",
    "constant",
    "coefficient",
    "coordinate",
    "coordinates",
    "corresponding",
    "circular",
    "x-coordinate",
    "y-coordinate",
    "hypotenuse",
    "interpretation",
    "positive",
    "radius",
    "rectangular",
    "graph",
    "graphs",
    "xy-plane",
    "table",
    "passes",
    "given",
    "shown",
    "greater",
    "planning",
    "review",
    "reviewing",
    "represents",
    "represented",
    "represent",
    "population",
    "populations",
}


def normalize(text):
    return re.sub(r"\s+", " ", str(text or "")).strip()


def prompt_key(text):
    return normalize(str(text).lower())


def load_payload(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"WARNING: could not load {path.name}: {exc}")
        return []


def normalize_raw_question(item, filename, index):
    question = dict(item)
    if question.get("prompt"):
        question["_sourceFile"] = filename
        question["_sourceIndex"] = index
        return question
    nested = question.get("question")
    if isinstance(nested, dict):
        prompt_parts = [nested.get("paragraph"), nested.get("question")]
        question["prompt"] = "\n\n".join(str(part).strip() for part in prompt_parts if str(part or "").strip())
        question["choices"] = nested.get("choices") or question.get("choices") or {}
        question["correctAnswer"] = nested.get("correct_answer") or nested.get("correctAnswer") or question.get("correctAnswer")
        question["explanation"] = nested.get("explanation") or question.get("explanation")
        source_section = str(question.get("_satStudioSourceSection") or question.get("section") or "").lower()
        question["section"] = "Math" if source_section == "math" else "Reading and Writing"
        question["skill"] = question.get("skill") or question.get("domain") or "OpenSAT imported skill"
        question["sourceType"] = question.get("sourceType") or "opensat"
    question["_sourceFile"] = filename
    question["_sourceIndex"] = index
    return question


def iter_questions():
    for filename in QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload = load_payload(path)
        records = payload.get("questions") if isinstance(payload, dict) else payload
        if not isinstance(records, list):
            continue
        for index, item in enumerate(records):
            if not isinstance(item, dict) or not item.get("prompt"):
                item = normalize_raw_question(item, filename, index) if isinstance(item, dict) else item
            if not isinstance(item, dict) or not item.get("prompt"):
                continue
            question = normalize_raw_question(item, filename, index)
            yield question


def explanation_text(question):
    return all_explanation_text(question.get("explanation"))


def word_count(text):
    return len(re.findall(r"\b\w+\b", str(text or "")))


def answer_integrity_issues(question):
    issues = []
    warnings = []
    correct = question.get("correctAnswer")
    choices = question.get("choices") or {}

    if is_grid_in(question):
        issues.extend(verify_acceptable_answers(question))
    elif not isinstance(choices, dict) or set(choices.keys()) != {"A", "B", "C", "D"}:
        issues.append("mc_missing_A_D_choices")
    elif correct not in choices:
        issues.append("mc_correct_answer_not_in_choices")
    elif len({normalize(choices.get(key)).lower() for key in ["A", "B", "C", "D"]}) < 4:
        issues.append("mc_duplicate_choice_text")

    if not question.get("explanation"):
        issues.append("missing_explanation")
    elif not explanation_mentions_correct_answer(question) and question.get("section") != "Math":
        warnings.append("rw_explanation_does_not_mention_correct_answer")

    math_check = verify_math_answer(question)
    for issue in math_check.get("issues", []):
        issues.append(f"math:{issue}")
    for warning in math_check.get("warnings", []):
        warnings.append(f"math:{warning}")
    return issues, warnings, math_check


def length_issues(question):
    issues = []
    prompt = question.get("prompt", "")
    if question.get("section") == "Reading and Writing":
        limit = 250 if question.get("skill") == "Cross-Text Connections" else 150
        words = word_count(prompt)
        if words > limit:
            issues.append(f"rw_prompt_too_long:{words}>{limit}")
    return issues


def topic_key(question):
    prompt = str(question.get("prompt") or "").lower()
    section = question.get("section")
    stopwords = RW_COMMON if section == "Reading and Writing" else MATH_COMMON
    tokens = [
        token
        for token in re.findall(r"[a-z][a-z-]{5,}", prompt)
        if token not in stopwords and not token.isdigit()
    ]
    if not tokens:
        return ""
    counts = Counter(tokens)
    ranked = sorted(counts, key=lambda token: (-len(token), -counts[token], prompt.find(token)))
    # A single distinctive token catches overused contexts such as "bioluminescence".
    return ranked[0]


def section_balance_issue(section_counts):
    total = sum(section_counts.values())
    if not total:
        return None
    rw = section_counts.get("Reading and Writing", 0)
    math = section_counts.get("Math", 0)
    if rw / total < 0.35:
        return f"reading_writing_underrepresented:{rw}/{total}"
    if math / total < 0.35:
        return f"math_underrepresented:{math}/{total}"
    if rw / total > 0.65:
        return f"reading_writing_overrepresented:{rw}/{total}"
    if math / total > 0.65:
        return f"math_overrepresented:{math}/{total}"
    return None


def is_rejected_row(row):
    status_bits = [
        str(row.get("reviewStatus") or "").lower(),
        str(row.get("publicationStatus") or "").lower(),
    ]
    return any("reject" in bit or "blocked" in bit for bit in status_bits)


def is_hidden_duplicate_row(row):
    pool = str(row.get("practicePool") or "").lower()
    status = str(row.get("publicationStatus") or "").lower()
    return pool == "hidden_duplicate" or status == "hidden_duplicate"


def is_remedial_pool_row(row):
    pool = str(row.get("practicePool") or "").lower()
    return pool == "remedial_pool"


def is_core_visible_row(row):
    return not is_rejected_row(row) and not is_hidden_duplicate_row(row) and not is_remedial_pool_row(row)


def topic_candidate_priority(row):
    difficulty_rank = {"easy": 0, "medium": 1, "hard": 3}
    source_rank = {
        "ai_generated": 0,
        "sat_studio_ai": 0,
        "antigravity_generated": 0,
        "generated": 1,
        "opensat": 2,
        "vault_original": 4,
    }
    review_rank = {
        "needs_review": 0,
        "draft": 1,
        "reviewed": 2,
    }
    difficulty = str(row.get("difficulty") or "").lower()
    source_type = str(row.get("sourceType") or "").lower()
    review_status = str(row.get("reviewStatus") or "").lower()
    return (
        difficulty_rank.get(difficulty, 2),
        source_rank.get(source_type, 2),
        review_rank.get(review_status, 1),
        str(row.get("sourceFile") or ""),
        str(row.get("id") or ""),
    )


def is_generated_topic_candidate(row):
    source_type = str(row.get("sourceType") or "").lower()
    source_file = str(row.get("sourceFile") or "").lower()
    if "generated" in source_type or source_type in {"ai", "ai_generated"}:
        return True
    generated_files = (
        "antigravity-bank.json",
        "archive-source-ai-bank.json",
        "kaplan-sat-math-ai-bank.json",
        "sat-1590-elite-ai-bank.json",
        "sat-king-supplemental-ai-bank.json",
    )
    return source_file in generated_files


def build_topic_governance_plan(overrepresented_topics, by_topic_rows, keep_target=TOPIC_KEEP_TARGET):
    plan = {}
    for topic, topic_info in overrepresented_topics.items():
        rows = list(by_topic_rows.get(topic, []))
        rejected_rows = [row for row in rows if is_rejected_row(row)]
        hidden_rows = [row for row in rows if is_hidden_duplicate_row(row)]
        remedial_rows = [row for row in rows if is_remedial_pool_row(row)]
        visible_rows = [row for row in rows if is_core_visible_row(row)]
        overflow_count = max(0, len(visible_rows) - keep_target)
        candidate_rows = []
        if overflow_count > 0:
            candidate_rows = sorted(
                [
                    row
                    for row in visible_rows
                    if str(row.get("difficulty") or "").lower() in {"easy", "medium", ""}
                    and is_generated_topic_candidate(row)
                ],
                key=topic_candidate_priority,
            )
        if overflow_count > 0 and candidate_rows:
            action = "review_or_hide_easy_medium_clones"
        elif overflow_count > 0:
            action = "review_context_variety"
        else:
            action = "monitor"

        plan[topic] = {
            "count": topic_info.get("count", len(rows)),
            "visibleCount": len(visible_rows),
            "hiddenDuplicateCount": len(hidden_rows),
            "remedialPoolCount": len(remedial_rows),
            "rejectedCount": len(rejected_rows),
            "keepTarget": keep_target,
            "overflowCount": overflow_count,
            "recommendedAction": action,
            "candidateIds": [row.get("id") for row in candidate_rows[:TOPIC_CANDIDATE_LIMIT]],
            "sampleIds": topic_info.get("sampleIds", [])[:TOPIC_SAMPLE_LIMIT],
        }
    return plan


def issue_family(issue):
    text = str(issue or "")
    if text.startswith("topic_overrepresented:"):
        return "topic_overrepresented"
    if text.startswith("duplicate_prompt:"):
        return "duplicate_prompt"
    if text.startswith("rw_prompt_too_long:"):
        return "rw_prompt_too_long"
    if text.startswith("math:"):
        return text
    return text.split(":", 1)[0]


def count_issue_types(rows, field):
    counts = Counter()
    for row in rows:
        for issue in row.get(field, []):
            counts[issue_family(issue)] += 1
    return dict(counts.most_common())


STUDY_BLOCKING_ISSUES = {
    "mc_missing_A_D_choices",
    "mc_duplicate_choice_text",
    "mc_correct_answer_not_in_choices",
    "missing_explanation",
    "grid_in_missing_correct_answer",
    "grid_in_missing_acceptable_answers",
    "grid_in_correct_answer_not_in_acceptable_answers",
    "spr_should_not_have_choices",
    "spr_correct_answer_is_choice_letter",
}


def is_integrity_blocked_row(row):
    if row.get("sourceFile") == "opensat-pinesat.json":
        return True
    if is_rejected_row(row) or is_hidden_duplicate_row(row):
        return True
    issue_families = {issue_family(issue) for issue in row.get("issues", [])}
    return bool(issue_families & STUDY_BLOCKING_ISSUES)


def repeated_topic_breakdown(overrepresented_topics):
    return [
        {
            "topicKey": topic,
            "coreVisibleCount": item.get("coreVisibleCount", item.get("count", 0)),
            "totalCount": item.get("count", 0),
            "sampleIds": item.get("sampleIds", [])[:TOPIC_SAMPLE_LIMIT],
        }
        for topic, item in overrepresented_topics.items()
    ]


def build_study_policy(rows, topic_governance_plan):
    topic_overflow_ids = sorted(
        {
            str(question_id)
            for item in topic_governance_plan.values()
            for question_id in item.get("candidateIds", [])
            if question_id
        }
    )
    rw_long_prompt_ids = sorted(
        {
            str(row.get("id"))
            for row in rows
            if row.get("id")
            and row.get("section") == "Reading and Writing"
            and any(issue_family(warning) == "rw_prompt_too_long" for warning in row.get("warnings", []))
            and is_core_visible_row(row)
        }
    )
    suppressed_ids = sorted(set(topic_overflow_ids) | set(rw_long_prompt_ids))
    return {
        "schemaVersion": "sat_study_policy_v1",
        "purpose": "Suppress technically valid but low-priority rows from default learner flows without deleting them from the bank.",
        "suppressedDefaultStudyIds": suppressed_ids,
        "topicOverflowCandidateIds": topic_overflow_ids,
        "rwLongPromptIds": rw_long_prompt_ids,
        "counts": {
            "suppressedDefaultStudy": len(suppressed_ids),
            "topicOverflowCandidates": len(topic_overflow_ids),
            "rwLongPrompts": len(rw_long_prompt_ids),
        },
    }


def audit_questions():
    questions = list(iter_questions())
    seen_prompts = {}
    rows = []
    section_counts = Counter()
    file_counts = Counter()
    by_topic_rows = defaultdict(list)

    for question in questions:
        qid = question.get("id") or f"{question.get('_sourceFile')}#{question.get('_sourceIndex')}"
        file_counts[question.get("_sourceFile")] += 1
        section_counts[question.get("section") or "Unknown"] += 1
        key = prompt_key(question.get("prompt"))
        topic = topic_key(question)

        issues = []
        warnings = []
        if key in seen_prompts:
            warnings.append(f"duplicate_prompt:{seen_prompts[key]}")
        elif key:
            seen_prompts[key] = qid

        warnings.extend(length_issues(question))
        answer_issues, answer_warnings, math_check = answer_integrity_issues(question)
        issues.extend(answer_issues)
        warnings.extend(answer_warnings)

        row = {
            "id": qid,
            "sourceIndex": question.get("_sourceIndex"),
            "sourceFile": question.get("_sourceFile"),
            "sourceType": question.get("sourceType"),
            "sourceName": question.get("sourceName"),
            "sourceReference": question.get("sourceReference"),
            "section": question.get("section"),
            "domain": question.get("domain"),
            "skill": question.get("skill"),
            "difficulty": question.get("difficulty"),
            "reviewStatus": question.get("reviewStatus"),
            "publicationStatus": question.get("publicationStatus"),
            "visibility": question.get("visibility"),
            "practicePool": question.get("practicePool"),
            "topicKey": topic,
            "issues": issues,
            "warnings": warnings,
            "mathVerification": math_check if question.get("section") == "Math" else None,
        }
        rows.append(row)
        if topic:
            by_topic_rows[topic].append(row)

    overrepresented_topics = {}
    for topic, topic_rows in sorted(by_topic_rows.items(), key=lambda item: len(item[1]), reverse=True):
        core_visible_rows = [row for row in topic_rows if is_core_visible_row(row)]
        if len(core_visible_rows) > TOPIC_KEEP_TARGET:
            overrepresented_topics[topic] = {
                "count": len(topic_rows),
                "coreVisibleCount": len(core_visible_rows),
                "sampleIds": [row.get("id") for row in core_visible_rows[:TOPIC_SAMPLE_LIMIT]],
            }
    topic_governance_plan = build_topic_governance_plan(overrepresented_topics, by_topic_rows)
    for row in rows:
        topic = row.get("topicKey")
        if topic in overrepresented_topics and is_core_visible_row(row):
            row["warnings"].append(
                f"topic_overrepresented:{topic}:{overrepresented_topics[topic]['coreVisibleCount']}_core_visible/{overrepresented_topics[topic]['count']}_total"
            )

    balance = section_balance_issue(section_counts)
    blocked_rows = [row for row in rows if row["issues"] and is_integrity_blocked_row(row)]
    critical_rows = [row for row in rows if row["issues"] and not is_integrity_blocked_row(row)]
    warning_rows = [row for row in rows if row["warnings"] and not row["issues"]]
    for row in critical_rows:
        row["severity"] = "critical"
    for row in blocked_rows:
        row["severity"] = "blocked"
    for row in warning_rows:
        row["severity"] = "warning"
    issue_breakdown = {
        "critical": count_issue_types(critical_rows, "issues"),
        "blocked": count_issue_types(blocked_rows, "issues"),
        "warning": count_issue_types(rows, "warnings"),
        "repeatedTopics": repeated_topic_breakdown(overrepresented_topics),
    }

    study_policy = build_study_policy(rows, topic_governance_plan)

    return {
        "summary": {
            "totalQuestions": len(questions),
            "sourceFiles": dict(file_counts),
            "sectionCounts": dict(section_counts),
            "criticalIssueCount": sum(len(row["issues"]) for row in critical_rows),
            "criticalQuestionCount": len(critical_rows),
            "blockedSourceQuestionCount": len(blocked_rows),
            "blockedSourceIssueCount": sum(len(row["issues"]) for row in blocked_rows),
            "warningIssueCount": sum(len(row["warnings"]) for row in rows),
            "warningQuestionCount": len(warning_rows),
            "overrepresentedTopicCount": len(overrepresented_topics),
            "topicGovernancePlanCount": len(topic_governance_plan),
            "sectionBalanceIssue": balance,
            "issueBreakdown": issue_breakdown,
        },
        "issueBreakdown": issue_breakdown,
        "overrepresentedTopics": overrepresented_topics,
        "topicGovernancePlan": topic_governance_plan,
        "studyPolicy": study_policy,
        "criticalRows": critical_rows,
        "blockedRows": blocked_rows,
        "warningRows": warning_rows[:300],
    }


def print_report(report, sample_limit=12):
    summary = report["summary"]
    print(f"Total questions loaded: {summary['totalQuestions']}")
    print(f"Section counts: {summary['sectionCounts']}")
    print(f"Critical questions: {summary['criticalQuestionCount']} ({summary['criticalIssueCount']} issues)")
    print(f"Blocked source questions: {summary['blockedSourceQuestionCount']} ({summary['blockedSourceIssueCount']} issues)")
    print(f"Warning questions: {summary['warningQuestionCount']} ({summary['warningIssueCount']} warnings)")
    if summary["sectionBalanceIssue"]:
        print(f"Section balance warning: {summary['sectionBalanceIssue']}")
    print(f"Overrepresented topics: {summary['overrepresentedTopicCount']}")

    breakdown = report.get("issueBreakdown") or summary.get("issueBreakdown") or {}
    for label, key in [("Critical issue types", "critical"), ("Blocked issue types", "blocked"), ("Warning types", "warning")]:
        counts = breakdown.get(key) or {}
        if not counts:
            continue
        top = ", ".join(f"{name}={count}" for name, count in list(counts.items())[:5])
        print(f"{label}: {top}")

    if report["overrepresentedTopics"]:
        print("\nTop repeated topic keys:")
        for topic, item in list(report["overrepresentedTopics"].items())[:10]:
            print(
                f" - {topic}: {item.get('coreVisibleCount', item['count'])} core-visible / {item['count']} total questions; "
                f"samples: {', '.join(item['sampleIds'][:4])}"
            )

    if report.get("topicGovernancePlan"):
        print("\nTopic governance plan:")
        for topic, item in list(report["topicGovernancePlan"].items())[:10]:
            print(
                " - "
                f"{topic}: visible {item['visibleCount']}/{item['count']}, "
                f"remedial {item.get('remedialPoolCount', 0)}, hidden {item['hiddenDuplicateCount']}, "
                f"overflow {item['overflowCount']}, action {item['recommendedAction']}; "
                f"review candidates: {', '.join(item['candidateIds'][:4])}"
            )

    if report["criticalRows"]:
        print("\nCritical samples:")
        for row in report["criticalRows"][:sample_limit]:
            print(f" - {row['id']} [{row['sourceFile']}]: {', '.join(row['issues'])}")

    if report["blockedRows"]:
        print("\nBlocked source samples:")
        for row in report["blockedRows"][:sample_limit]:
            print(f" - {row['id']} [{row['sourceFile']}]: {', '.join(row['issues'])}")

    if report["warningRows"]:
        print("\nWarning samples:")
        for row in report["warningRows"][:sample_limit]:
            print(f" - {row['id']} [{row['sourceFile']}]: {', '.join(row['warnings'][:3])}")


def main():
    parser = argparse.ArgumentParser(description="SAT Studio question integrity checks.")
    parser.add_argument("--report", default=str(DEFAULT_REPORT), help="JSON report path.")
    parser.add_argument("--study-policy", default=str(DEFAULT_STUDY_POLICY), help="Lightweight learner study policy JSON path.")
    parser.add_argument("--summary-only", action="store_true", help="Write report and print compact summary.")
    parser.add_argument("--fail-on-critical", action="store_true", help="Exit nonzero if critical issues are found.")
    args = parser.parse_args()

    report = audit_questions()
    report_path = Path(args.report)
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    policy_path = Path(args.study_policy)
    policy_path.write_text(json.dumps(report.get("studyPolicy") or {}, indent=2, ensure_ascii=False), encoding="utf-8")
    print_report(report, sample_limit=8 if args.summary_only else 12)
    print(f"\nReport written: {report_path}")
    print(f"Study policy written: {policy_path}")

    if args.fail_on_critical and report["summary"]["criticalQuestionCount"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
