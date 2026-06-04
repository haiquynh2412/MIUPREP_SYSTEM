from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_PATH = DATA_DIR / "sat-training-metadata-enrichment-report.json"
VERSION = "sat-training-metadata-enrichment-v1-2026-05-26"

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

SEMANTIC_FIELDS = {
    "science",
    "history",
    "literature",
    "social_science",
    "economics",
    "arts",
    "technology",
    "interdisciplinary",
}
MATH_TOOL_TAGS = {"mental", "algebra", "desmos_helpful", "calculator_required"}
MULTI_STEP_LEVELS = {"1-step", "2-step", "3-step", "synthesis"}

SCIENCE_TERMS = {
    "astronom",
    "bacteria",
    "biology",
    "botan",
    "carbon",
    "cell",
    "chemical",
    "climate",
    "dna",
    "ecology",
    "experiment",
    "fossil",
    "genetic",
    "geolog",
    "laboratory",
    "molecule",
    "organism",
    "physics",
    "planet",
    "researcher",
    "scientist",
    "species",
    "temperature",
}
HISTORY_TERMS = {
    "ancient",
    "archaeolog",
    "century",
    "civil war",
    "colonial",
    "dynasty",
    "empire",
    "historian",
    "history",
    "migration",
    "revolution",
    "treaty",
}
LITERATURE_TERMS = {
    "adapted from",
    "character",
    "fiction",
    "literary",
    "narrator",
    "novel",
    "poem",
    "poet",
    "short story",
    "speaker",
    "stanza",
}
SOCIAL_SCIENCE_TERMS = {
    "anthropolog",
    "community",
    "culture",
    "education",
    "language",
    "linguist",
    "policy",
    "political",
    "psycholog",
    "social",
    "sociolog",
    "survey",
}
ECONOMICS_TERMS = {
    "business",
    "company",
    "consumer",
    "cost",
    "economic",
    "economist",
    "firm",
    "labor",
    "market",
    "price",
    "tax",
    "trade",
    "wage",
}
ARTS_TERMS = {
    "architecture",
    "artist",
    "composer",
    "dance",
    "design",
    "exhibition",
    "film",
    "museum",
    "music",
    "painting",
    "sculpture",
    "theater",
}
TECH_TERMS = {
    "algorithm",
    "artificial intelligence",
    "computer",
    "data",
    "digital",
    "engineer",
    "internet",
    "machine learning",
    "robot",
    "sensor",
    "software",
    "technology",
}


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def question_list(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, dict):
        rows = payload.get("questions")
    else:
        rows = payload
    return [row for row in rows if isinstance(row, dict)] if isinstance(rows, list) else []


def stable_hash(value: str) -> str:
    hash_value = 2166136261
    for char in value:
        hash_value ^= ord(char)
        hash_value = (hash_value * 16777619) & 0xFFFFFFFF
    return f"{hash_value:08x}"


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def flatten_text(value: Any) -> str:
    parts: list[str] = []
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        for key in (
            "paragraph",
            "passage",
            "stimulus",
            "prompt",
            "question",
            "questionText",
            "stem",
            "text",
            "body",
            "source",
        ):
            if isinstance(value.get(key), str):
                parts.append(value[key])
    return " ".join(parts)


def extract_item_text(question: dict[str, Any]) -> str:
    parts: list[str] = []
    for key in (
        "paragraph",
        "passage",
        "stimulus",
        "prompt",
        "questionText",
        "stem",
        "text",
        "body",
        "source",
    ):
        if isinstance(question.get(key), str):
            parts.append(question[key])
    if isinstance(question.get("question"), str):
        parts.append(question["question"])
    else:
        nested = flatten_text(question.get("question"))
        if nested:
            parts.append(nested)
    notes = question.get("studentNotes")
    if isinstance(notes, list):
        parts.extend(str(note) for note in notes if note)
    elif isinstance(notes, str):
        parts.append(notes)
    return normalize_space(" ".join(parts))


def normalize_template_text(text: str) -> str:
    value = normalize_space(text).lower()
    value = re.sub(r"https?://\S+", " url ", value)
    value = re.sub(r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b", " month ", value)
    value = re.sub(r"\b\d{4}s?\b", " year ", value)
    value = re.sub(r"\b\d+(?:\.\d+)?%?\b", " # ", value)
    value = re.sub(r"\b[a-z]\b(?=\s*[\+\-\*/=<>])", " v ", value)
    value = re.sub(r"(?<=[\+\-\*/=<>]\s)\b[a-z]\b", " v ", value)
    value = re.sub(r"\bfigure\s+\d+\b", " figure # ", value)
    value = re.sub(r"\btable\s+\d+\b", " table # ", value)
    value = re.sub(r"[^a-z0-9#%+\-*/=<>() ]+", " ", value)
    return normalize_space(value)[:700]


def normalized_section(question: dict[str, Any]) -> str:
    section = str(question.get("section") or "").strip()
    if section:
        return section
    if question.get("domain") in {"Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry"}:
        return "Math"
    return "Reading and Writing"


def normalized_difficulty(question: dict[str, Any]) -> str:
    value = str(question.get("difficulty") or "").strip().title()
    return value if value in {"Easy", "Medium", "Hard"} else "Medium"


def normalized_question_type(question: dict[str, Any]) -> str:
    value = str(question.get("questionType") or question.get("type") or "").strip()
    if value:
        return value
    if question.get("choices") or isinstance(question.get("question"), dict) and question["question"].get("choices"):
        return "multiple_choice"
    return "student_produced_response" if normalized_section(question) == "Math" else "multiple_choice"


def template_keys(question: dict[str, Any]) -> tuple[str, str]:
    text = normalize_template_text(extract_item_text(question))
    section = normalized_section(question)
    domain = str(question.get("domain") or "unknown_domain").strip()
    skill = str(question.get("skill") or question.get("canonicalSkill") or "unknown_skill").strip()
    question_type = normalized_question_type(question)
    form_key = "|".join([section, domain, skill, question_type, text])
    skeleton_key = "|".join([normalized_difficulty(question), form_key])
    return form_key, skeleton_key


def template_form_id(question: dict[str, Any]) -> str:
    form_key, _ = template_keys(question)
    return f"tmpl_{stable_hash(form_key)}"


def skeleton_id(question: dict[str, Any]) -> str:
    _, skeleton_key = template_keys(question)
    return f"skel_{stable_hash(skeleton_key)}"


def contains_any(text: str, terms: set[str]) -> bool:
    return any(term in text for term in terms)


def infer_semantic_field(question: dict[str, Any]) -> str:
    existing = str(question.get("semanticField") or "").strip().lower()
    if existing in SEMANTIC_FIELDS:
        return existing
    text = extract_item_text(question).lower()
    if contains_any(text, TECH_TERMS):
        return "technology"
    if contains_any(text, ECONOMICS_TERMS):
        return "economics"
    if contains_any(text, SCIENCE_TERMS):
        return "science"
    if contains_any(text, LITERATURE_TERMS):
        return "literature"
    if contains_any(text, HISTORY_TERMS):
        return "history"
    if contains_any(text, ARTS_TERMS):
        return "arts"
    if contains_any(text, SOCIAL_SCIENCE_TERMS):
        return "social_science"
    return "interdisciplinary"


def truthy_tag_source(value: Any) -> str:
    if isinstance(value, str):
        return value.lower()
    if isinstance(value, list):
        return " ".join(str(item).lower() for item in value)
    if isinstance(value, dict):
        return " ".join(str(item).lower() for item in value.values())
    return ""


def infer_math_tool_tag(question: dict[str, Any]) -> str:
    existing = str(question.get("mathToolTag") or "").strip().lower()
    if existing in MATH_TOOL_TAGS:
        return existing
    text = extract_item_text(question).lower()
    tag_blob = " ".join(
        truthy_tag_source(value)
        for value in (
            question.get("mathToolTags"),
            question.get("calculatorTags"),
            question.get("calculatorUse"),
            question.get("toolTag"),
        )
    )
    if "calculator required" in tag_blob or "calculator_required" in tag_blob:
        return "calculator_required"
    if "desmos" in tag_blob or question.get("desmosUseful") is True:
        return "desmos_helpful"
    desmos_terms = {"graph", "intersection", "scatterplot", "regression", "quadratic", "parabola", "function", "system of equations"}
    calculator_terms = {"standard deviation", "exponential", "percent change", "margin of error", "least-squares", "rational exponent"}
    if contains_any(text, calculator_terms):
        return "calculator_required"
    if contains_any(text, desmos_terms):
        return "desmos_helpful"
    numbers = re.findall(r"-?\d+(?:\.\d+)?", text)
    if normalized_difficulty(question) == "Easy" and len(numbers) <= 3 and len(text) < 170:
        return "mental"
    return "algebra"


def infer_math_step_level(question: dict[str, Any]) -> str:
    text = extract_item_text(question).lower()
    difficulty = normalized_difficulty(question)
    numbers = re.findall(r"-?\d+(?:\.\d+)?", text)
    complex_terms = {
        "system",
        "intersection",
        "similar",
        "circle",
        "triangle",
        "function",
        "quadratic",
        "exponential",
        "probability",
        "standard deviation",
        "table",
        "graph",
        "model",
    }
    synthesis_terms = {"which of the following", "must be true", "equivalent", "minimum", "maximum", "both", "respectively"}
    complexity = 0
    complexity += 1 if difficulty == "Medium" else 2 if difficulty == "Hard" else 0
    complexity += 1 if len(numbers) >= 5 else 0
    complexity += 1 if contains_any(text, complex_terms) else 0
    complexity += 1 if len(text) > 260 else 0
    if difficulty == "Hard" and contains_any(text, synthesis_terms) and complexity >= 3:
        return "synthesis"
    if difficulty == "Hard" or complexity >= 3:
        return "3-step"
    if difficulty == "Medium" or complexity >= 1:
        return "2-step"
    return "1-step"


def infer_rw_step_level(question: dict[str, Any]) -> str:
    text = extract_item_text(question).lower()
    difficulty = normalized_difficulty(question)
    skill = str(question.get("skill") or "").lower()
    cross_text = "text 1" in text and "text 2" in text
    data_task = any(term in text for term in ("table", "graph", "data", "survey", "experiment"))
    hard_reasoning = any(term in skill for term in ("inferences", "command of evidence", "cross-text", "rhetorical synthesis"))
    if cross_text or (difficulty == "Hard" and data_task and hard_reasoning):
        return "synthesis"
    if difficulty == "Hard" or hard_reasoning:
        return "3-step"
    if difficulty == "Medium" or data_task:
        return "2-step"
    return "1-step"


def infer_multi_step_level(question: dict[str, Any]) -> str:
    existing = str(question.get("multiStepLevel") or "").strip().lower()
    if existing in MULTI_STEP_LEVELS:
        return existing
    return infer_math_step_level(question) if normalized_section(question) == "Math" else infer_rw_step_level(question)


def is_rejected(question: dict[str, Any]) -> bool:
    text = " ".join(str(question.get(key) or "") for key in ("reviewStatus", "publicationStatus", "visibility", "status")).lower()
    return any(token in text for token in ("rejected", "blocked", "hidden_duplicate"))


def is_active_reviewed(question: dict[str, Any]) -> bool:
    return question.get("reviewStatus") == "reviewed" and not is_rejected(question)


def maybe_set(question: dict[str, Any], key: str, value: Any, changed: list[str]) -> None:
    if question.get(key) != value:
        question[key] = value
        changed.append(key)


def enrich_question(question: dict[str, Any]) -> list[str]:
    changed: list[str] = []
    form_key, skeleton_key = template_keys(question)
    form_id = f"tmpl_{stable_hash(form_key)}"
    skel_id = f"skel_{stable_hash(skeleton_key)}"

    maybe_set(question, "templateFormId", form_id, changed)
    maybe_set(question, "skeletonId", skel_id, changed)

    diversity = question.get("skeletonDiversity") if isinstance(question.get("skeletonDiversity"), dict) else {}
    updated_diversity = {
        **diversity,
        "templateFormId": form_id,
        "skeletonId": skel_id,
        "templateKey": form_key,
        "skeletonKey": skeleton_key,
        "metadataVersion": VERSION,
    }
    if question.get("skeletonDiversity") != updated_diversity:
        question["skeletonDiversity"] = updated_diversity
        changed.append("skeletonDiversity")

    section = normalized_section(question)
    if section == "Reading and Writing":
        maybe_set(question, "semanticField", infer_semantic_field(question), changed)
    if section == "Math":
        maybe_set(question, "mathToolTag", infer_math_tool_tag(question), changed)

    maybe_set(question, "multiStepLevel", infer_multi_step_level(question), changed)

    if is_active_reviewed(question) and normalized_difficulty(question) == "Hard":
        maybe_set(question, "cruciblePool", "crucible_pool", changed)
        eligibility = {
            "freshItemRequired": True,
            "allowedBuckets": ["same_skill", "transfer", "mixed", "timed_proof"],
            "sourceDifficulty": "Hard",
            "metadataVersion": VERSION,
        }
        maybe_set(question, "crucibleEligibility", eligibility, changed)

    maybe_set(question, "metadataEnrichmentVersion", VERSION, changed)
    return changed


def has_value(question: dict[str, Any], *paths: str) -> bool:
    for path in paths:
        current: Any = question
        for key in path.split("."):
            current = current.get(key) if isinstance(current, dict) else None
        if current not in (None, "", [], {}):
            return True
    return False


def coverage(rows: list[dict[str, Any]]) -> dict[str, Any]:
    active = [row for row in rows if is_active_reviewed(row)]
    rw = [row for row in active if normalized_section(row) == "Reading and Writing"]
    math = [row for row in active if normalized_section(row) == "Math"]

    def pct(count: int, total: int) -> float:
        return round((count / total) * 100, 1) if total else 0.0

    hard = [row for row in active if normalized_difficulty(row) == "Hard"]
    return {
        "totalRows": len(rows),
        "activeReviewed": len(active),
        "skeletonOrTemplatePct": pct(sum(has_value(row, "skeletonDiversity.skeletonId", "skeletonId", "templateFormId") for row in active), len(active)),
        "rwSemanticFieldPct": pct(sum(str(row.get("semanticField") or "").lower() in SEMANTIC_FIELDS for row in rw), len(rw)),
        "mathToolTagPct": pct(sum(str(row.get("mathToolTag") or "").lower() in MATH_TOOL_TAGS for row in math), len(math)),
        "multiStepLevelPct": pct(sum(str(row.get("multiStepLevel") or "").lower() in MULTI_STEP_LEVELS for row in active), len(active)),
        "cruciblePoolPct": pct(sum(row.get("cruciblePool") == "crucible_pool" for row in hard), len(hard)),
        "cruciblePoolCount": sum(row.get("cruciblePool") == "crucible_pool" for row in hard),
        "hardReviewedCount": len(hard),
    }


def run_enrichment(apply: bool) -> dict[str, Any]:
    all_before: list[dict[str, Any]] = []
    all_after: list[dict[str, Any]] = []
    file_reports: list[dict[str, Any]] = []
    total_changed = 0

    for filename in QUESTION_FILES:
        path = DATA_DIR / filename
        payload = load_json(path, [])
        rows = question_list(payload)
        before_rows = json.loads(json.dumps(rows))
        all_before.extend(before_rows)
        changed_rows = 0
        changed_fields: dict[str, int] = {}
        for row in rows:
            changed = enrich_question(row)
            if changed:
                changed_rows += 1
                total_changed += 1
                for field in changed:
                    changed_fields[field] = changed_fields.get(field, 0) + 1
        all_after.extend(rows)
        if apply and changed_rows:
            write_json(path, payload)
        file_reports.append(
            {
                "file": filename,
                "rows": len(rows),
                "changedRows": changed_rows,
                "changedFields": changed_fields,
            }
        )

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "mode": "apply" if apply else "check",
        "version": VERSION,
        "changedRows": total_changed,
        "coverageBefore": coverage(all_before),
        "coverageAfter": coverage(all_after),
        "files": file_reports,
    }
    write_json(REPORT_PATH, report)
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize SAT Studio training metadata for routing and audits.")
    parser.add_argument("--apply", action="store_true", help="Write enriched metadata to question bank files.")
    args = parser.parse_args()

    report = run_enrichment(apply=args.apply)
    print(f"metadata enrichment: {report['mode']}")
    print(f"changed rows: {report['changedRows']}")
    print(f"coverage after: {json.dumps(report['coverageAfter'], ensure_ascii=False)}")
    print(f"report: {REPORT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
