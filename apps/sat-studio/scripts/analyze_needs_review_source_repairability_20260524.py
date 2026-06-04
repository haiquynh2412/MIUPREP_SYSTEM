"""Analyze needs_review sources and repairability.

This report is intentionally non-mutating. It answers three questions:
1. Which source created each needs_review row?
2. Why is the row still blocked from reviewed?
3. Can the row be repaired mechanically, upgraded pedagogically, or does it
   need expert answer/structure validation first?
"""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
OUT_JSON = DATA_DIR / "needs-review-source-repairability-20260524.json"
OUT_CSV = DATA_DIR / "needs-review-source-repairability-20260524.csv"
OUT_MD = ARTIFACTS_DIR / "needs-review-repair-plan-20260524.md"

BANK_FILES = [
    "antigravity-bank.json",
    "archive-source-ai-bank.json",
    "kaplan-sat-math-ai-bank.json",
    "opensat-pinesat.json",
    "private-vault-archive-bank.json",
    "sat-1590-elite-ai-bank.json",
    "sat-king-supplemental-ai-bank.json",
    "sat-studio-foundation-bank.json",
]

AUDIT_REASON_FIELDS = ("blockers", "failures", "issues", "warnings", "depthFlags")

ACCURACY_OR_STRUCTURE_PATTERNS = [
    r"^choice_[A-D]_equivalent_to_correct_choice$",
    r"^duplicate_prompt",
    r"^math:(?!explanation_does_not_mention_correct_answer)",
    r"^mc_(missing|duplicate|correct_answer_not_in_choices)",
    r"^spr_(should_not_have_choices|correct_answer_is_choice_letter)",
    r"answer_key",
    r"equivalent_choice",
]

SYMBOL_FORMAT_PATTERNS = [
    r"raw_latex",
    r"math_delimiter",
    r"possible_missing_math_operator",
    r"ambiguous_fraction",
    r"latex",
]

EXPLANATION_PATTERNS = [
    r"^thin_",
    r"generic_distractor_teaching",
    r"incomplete_distractor_teaching",
    r"explanation_does_not_mention_correct_answer",
    r"hard_item_low_total_rationale",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def load_rows(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = payload.get("questions") if isinstance(payload, dict) else payload
    return rows if isinstance(rows, list) else []


def infer_source_group(filename: str, question: dict[str, Any]) -> str:
    source_type = clean(question.get("sourceType"))
    source_name = clean(question.get("sourceName"))
    if source_type:
        return source_type
    qid = clean(question.get("id"))
    if filename == "antigravity-bank.json":
        if qid.startswith("antigravity-easy-"):
            return "antigravity_easy_batch_unattributed"
        if qid.startswith("antigravity-1600-"):
            return "antigravity_1600_batch_unattributed"
        if qid.startswith("antigravity-ph1im-"):
            return "antigravity_phase1_improvement_unattributed"
        if qid.startswith("antigravity-ph2e2-"):
            return "antigravity_phase2_expression_unattributed"
        if qid.startswith("antigravity-ph2e3-"):
            return "antigravity_phase2_expansion_unattributed"
        return "antigravity_unattributed"
    if filename == "opensat-pinesat.json":
        return "opensat_pinesat_import"
    return source_name or filename.replace(".json", "")


def audit_reasons(question: dict[str, Any]) -> tuple[list[str], str, str]:
    audit = question.get("contentAudit") if isinstance(question.get("contentAudit"), dict) else {}
    reasons: list[str] = []
    for field in AUDIT_REASON_FIELDS:
        values = audit.get(field) or []
        if isinstance(values, list):
            reasons.extend(clean(value) for value in values if clean(value))
    if not reasons:
        reasons = ["no_recorded_failure"]
    return reasons, clean(audit.get("bucket")), clean(audit.get("verdict"))


def matches_any(reason: str, patterns: list[str]) -> bool:
    return any(re.search(pattern, reason) for pattern in patterns)


def classify_repair(question: dict[str, Any], reasons: list[str], bucket: str) -> dict[str, Any]:
    has_accuracy = any(matches_any(reason, ACCURACY_OR_STRUCTURE_PATTERNS) for reason in reasons)
    has_symbol = any(matches_any(reason, SYMBOL_FORMAT_PATTERNS) for reason in reasons)
    has_explanation = any(matches_any(reason, EXPLANATION_PATTERNS) for reason in reasons)
    has_unclear = "no_recorded_failure" in reasons or bucket == "human_quality_review_required"

    if has_accuracy:
        category = "P0_manual_answer_or_structure_repair"
        repairability = "manual_expert_required"
        action = "Verify answer key and/or rebuild choices before any explanation upgrade."
    elif has_symbol and has_explanation:
        category = "P1_symbol_cleanup_plus_explanation_upgrade"
        repairability = "repairable_after_retest"
        action = "Normalize math display, then rewrite explanation and wrong-choice trap analysis."
    elif has_symbol:
        category = "P1_symbol_cleanup_then_gate"
        repairability = "mostly_mechanical_then_retest"
        action = "Run safe LaTeX/symbol cleanup, then re-run expert gate before promotion."
    elif has_explanation:
        category = "P1_explanation_and_trap_upgrade"
        repairability = "highly_repairable"
        action = "Rewrite solution with SAT reasoning steps, answer proof, and distractor traps."
    elif has_unclear:
        category = "P2_human_quality_review_or_unclear_gate"
        repairability = "manual_review_required"
        action = "Open row manually; prior audit did not record a narrow machine-actionable reason."
    else:
        category = "P2_metadata_or_light_quality_review"
        repairability = "likely_repairable"
        action = "Check tags, taxonomy fit, and explanation completeness, then re-run gate."

    return {
        "category": category,
        "repairability": repairability,
        "action": action,
        "hasAccuracyOrStructureRisk": has_accuracy,
        "hasSymbolFormatRisk": has_symbol,
        "hasExplanationDepthRisk": has_explanation,
    }


def summarize_counter(counter: Counter, limit: int | None = None) -> dict[str, int]:
    items = counter.most_common(limit)
    return {str(key): value for key, value in items}


def write_markdown(report: dict[str, Any]) -> None:
    s = report["summary"]
    lines = [
        "# Needs Review Source and Repairability Plan - 2026-05-24",
        "",
        "This is a non-mutating triage of every `needs_review` question.",
        "",
        "## Executive Summary",
        "",
        f"- Total `needs_review`: {s['totalNeedsReview']}",
        f"- Highly repairable by explanation/trap upgrade: {s['byRepairCategory'].get('P1_explanation_and_trap_upgrade', 0)}",
        f"- Symbol cleanup then gate: {s['byRepairCategory'].get('P1_symbol_cleanup_then_gate', 0)}",
        f"- Symbol plus explanation upgrade: {s['byRepairCategory'].get('P1_symbol_cleanup_plus_explanation_upgrade', 0)}",
        f"- Manual answer/structure repair first: {s['byRepairCategory'].get('P0_manual_answer_or_structure_repair', 0)}",
        f"- Human/unclear review: {s['byRepairCategory'].get('P2_human_quality_review_or_unclear_gate', 0)}",
        "",
        "## By Bank",
        "",
        "| Bank | Needs review | Main source |",
        "|---|---:|---|",
    ]
    for bank, data in report["byBank"].items():
        main_source = max(data["bySourceGroup"].items(), key=lambda item: item[1])[0] if data["bySourceGroup"] else ""
        lines.append(f"| `{bank}` | {data['total']} | `{main_source}` |")

    lines.extend(
        [
            "",
            "## Repair Order",
            "",
            "1. P0: Fix rows with answer/structure risk first. These cannot be promoted by explanation rewrite alone.",
            "2. P1: Run symbol cleanup on rows with LaTeX/math display risk, then re-run the expert gate.",
            "3. P1: Upgrade explanation and trap analysis for rows whose answer/format is otherwise usable.",
            "4. P2: Open human/unclear rows manually; these need source-level judgment.",
            "",
            "## Top Reasons",
            "",
            "| Reason | Count |",
            "|---|---:|",
        ]
    )
    for reason, count in report["topReasons"].items():
        lines.append(f"| `{reason}` | {count} |")

    lines.extend(
        [
            "",
            "## Source Groups",
            "",
            "| Source group | Count |",
            "|---|---:|",
        ]
    )
    for source, count in report["summary"]["bySourceGroup"].items():
        lines.append(f"| `{source}` | {count} |")

    lines.extend(
        [
            "",
            "## Output Files",
            "",
            f"- JSON: `{OUT_JSON.relative_to(ROOT)}`",
            f"- CSV queue: `{OUT_CSV.relative_to(ROOT)}`",
        ]
    )
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    rows_out: list[dict[str, Any]] = []
    by_bank: dict[str, Any] = {}
    totals = {
        "byBank": Counter(),
        "bySourceGroup": Counter(),
        "bySourceType": Counter(),
        "bySourceName": Counter(),
        "byRepairCategory": Counter(),
        "byRepairability": Counter(),
        "byBucket": Counter(),
        "byVerdict": Counter(),
        "bySection": Counter(),
        "byDomain": Counter(),
        "byDifficulty": Counter(),
        "byVisibility": Counter(),
        "byPublicationStatus": Counter(),
        "topReasons": Counter(),
    }

    for filename in BANK_FILES:
        bank_rows = load_rows(DATA_DIR / filename)
        bank_counters = defaultdict(Counter)
        bank_total = 0
        for index, question in enumerate(bank_rows):
            if not isinstance(question, dict) or question.get("reviewStatus") != "needs_review":
                continue
            bank_total += 1
            reasons, bucket, verdict = audit_reasons(question)
            source_group = infer_source_group(filename, question)
            repair = classify_repair(question, reasons, bucket)
            section = clean(question.get("section"))
            domain = clean(question.get("domain"))
            row = {
                "sourceFile": filename,
                "sourceIndex": index,
                "id": clean(question.get("id")),
                "sourceGroup": source_group,
                "sourceType": clean(question.get("sourceType")),
                "sourceName": clean(question.get("sourceName")),
                "visibility": clean(question.get("visibility")),
                "publicationStatus": clean(question.get("publicationStatus")),
                "section": section,
                "domain": domain,
                "skill": clean(question.get("skill")),
                "canonicalSkill": clean(question.get("canonicalSkill")),
                "difficulty": clean(question.get("difficulty")),
                "questionType": clean(question.get("questionType") or question.get("type")),
                "bucket": bucket,
                "verdict": verdict,
                "repairCategory": repair["category"],
                "repairability": repair["repairability"],
                "recommendedAction": repair["action"],
                "hasAccuracyOrStructureRisk": repair["hasAccuracyOrStructureRisk"],
                "hasSymbolFormatRisk": repair["hasSymbolFormatRisk"],
                "hasExplanationDepthRisk": repair["hasExplanationDepthRisk"],
                "reasons": "; ".join(reasons),
                "promptPreview": clean(question.get("prompt"))[:180],
            }
            rows_out.append(row)

            totals["byBank"][filename] += 1
            totals["bySourceGroup"][source_group] += 1
            totals["bySourceType"][row["sourceType"] or "(blank)"] += 1
            totals["bySourceName"][row["sourceName"] or "(blank)"] += 1
            totals["byRepairCategory"][repair["category"]] += 1
            totals["byRepairability"][repair["repairability"]] += 1
            totals["byBucket"][bucket or "(blank)"] += 1
            totals["byVerdict"][verdict or "(blank)"] += 1
            totals["bySection"][section or "(blank)"] += 1
            totals["byDomain"][f"{section} > {domain}"] += 1
            totals["byDifficulty"][row["difficulty"] or "(blank)"] += 1
            totals["byVisibility"][row["visibility"] or "(blank)"] += 1
            totals["byPublicationStatus"][row["publicationStatus"] or "(blank)"] += 1
            for reason in reasons:
                totals["topReasons"][reason] += 1

            bank_counters["bySourceGroup"][source_group] += 1
            bank_counters["byRepairCategory"][repair["category"]] += 1
            bank_counters["byBucket"][bucket or "(blank)"] += 1
            bank_counters["bySection"][section or "(blank)"] += 1
            bank_counters["topReasons"].update(reasons)

        by_bank[filename] = {
            "total": bank_total,
            "bySourceGroup": summarize_counter(bank_counters["bySourceGroup"]),
            "byRepairCategory": summarize_counter(bank_counters["byRepairCategory"]),
            "byBucket": summarize_counter(bank_counters["byBucket"]),
            "bySection": summarize_counter(bank_counters["bySection"]),
            "topReasons": summarize_counter(bank_counters["topReasons"], 12),
        }

    report = {
        "version": "needs-review-source-repairability-2026-05-24",
        "generatedAt": now_iso(),
        "summary": {
            "totalNeedsReview": len(rows_out),
            "byBank": summarize_counter(totals["byBank"]),
            "bySourceGroup": summarize_counter(totals["bySourceGroup"]),
            "bySourceType": summarize_counter(totals["bySourceType"]),
            "bySourceName": summarize_counter(totals["bySourceName"]),
            "byRepairCategory": summarize_counter(totals["byRepairCategory"]),
            "byRepairability": summarize_counter(totals["byRepairability"]),
            "byBucket": summarize_counter(totals["byBucket"]),
            "byVerdict": summarize_counter(totals["byVerdict"]),
            "bySection": summarize_counter(totals["bySection"]),
            "byDomain": summarize_counter(totals["byDomain"]),
            "byDifficulty": summarize_counter(totals["byDifficulty"]),
            "byVisibility": summarize_counter(totals["byVisibility"]),
            "byPublicationStatus": summarize_counter(totals["byPublicationStatus"]),
        },
        "topReasons": summarize_counter(totals["topReasons"], 80),
        "byBank": by_bank,
        "repairQueueCsv": str(OUT_CSV.relative_to(ROOT)),
        "markdownPlan": str(OUT_MD.relative_to(ROOT)),
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    fieldnames = list(rows_out[0].keys()) if rows_out else []
    with OUT_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows_out)

    write_markdown(report)
    print(
        json.dumps(
            {
                "totalNeedsReview": len(rows_out),
                "byRepairCategory": report["summary"]["byRepairCategory"],
                "byBank": report["summary"]["byBank"],
                "outJson": str(OUT_JSON.relative_to(ROOT)),
                "outCsv": str(OUT_CSV.relative_to(ROOT)),
                "outMarkdown": str(OUT_MD.relative_to(ROOT)),
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
