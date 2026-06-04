"""Apply SAT Studio P0-P4 content governance artifacts.

This script is intentionally conservative with question text. It blocks
structurally unsafe active questions from student-facing pools, then writes
planning manifests for blueprint balance, explanation upgrades, pool routing,
and mastery-proof policy.
"""

from __future__ import annotations

import csv
import json
import math
import shutil
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from scripts import audit_antigravity_bank as row_audit
    from scripts.math_verifier import is_grid_in
except ModuleNotFoundError:
    import audit_antigravity_bank as row_audit
    from math_verifier import is_grid_in


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
VERSION = "sat-studio-p0-p4-governance-2026-05-24"
LETTERS = ("A", "B", "C", "D")

QUALITY_GATE_JSON = DATA_DIR / "content-quality-gate.json"
BLUEPRINT_JSON = DATA_DIR / "blueprint-expansion-manifest.json"
BLUEPRINT_CSV = DATA_DIR / "blueprint-expansion-manifest.csv"
EXPLANATION_QUEUE_JSON = DATA_DIR / "explanation-coaching-queue-v2.json"
EXPLANATION_QUEUE_CSV = DATA_DIR / "explanation-coaching-queue-v2.csv"
POOL_GOVERNANCE_JSON = DATA_DIR / "question-pool-governance.json"
MASTERY_POLICY_JSON = DATA_DIR / "mastery-proof-policy.json"
GOVERNANCE_REPORT_JSON = DATA_DIR / "sat-studio-p0-p4-governance-report.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def norm(value: Any) -> str:
    return " ".join(str(value or "").strip().lower().split())


def is_blocked(question: dict[str, Any]) -> bool:
    publication = str(question.get("publicationStatus") or "")
    pool = question.get("practicePool") or (question.get("skeletonDiversity") or {}).get("practicePool")
    return (
        question.get("reviewStatus") == "rejected"
        or publication.startswith("rejected")
        or question.get("visibility") == "blocked"
        or pool == "hidden_duplicate"
    )


def is_active(question: dict[str, Any]) -> bool:
    return not is_blocked(question)


def source_records(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    records = payload.get("questions") if isinstance(payload, dict) else payload
    return records if isinstance(records, list) else []


def write_records(path: Path, records: list[dict[str, Any]], original_payload: Any) -> None:
    if isinstance(original_payload, dict) and isinstance(original_payload.get("questions"), list):
        original_payload["questions"] = records
        payload = original_payload
    else:
        payload = records
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def has_duplicate_choice_text(question: dict[str, Any]) -> bool:
    if is_grid_in(question):
        return False
    choices = question.get("choices")
    if not isinstance(choices, dict):
        return False
    if set(choices.keys()) != set(LETTERS):
        return False
    values = [norm(choices.get(letter)) for letter in LETTERS]
    return len(values) == 4 and all(values) and len(set(values)) < 4


def structural_block_reasons(question: dict[str, Any]) -> list[str]:
    reasons: list[str] = []
    if is_grid_in(question):
        if question.get("choices") not in (None, {}, []):
            reasons.append("spr_should_not_have_choices")
        if str(question.get("correctAnswer") or "").strip() in set(LETTERS):
            reasons.append("spr_correct_answer_is_choice_letter")
        return reasons
    choices = question.get("choices")
    if not isinstance(choices, dict) or set(choices.keys()) != set(LETTERS):
        reasons.append("mc_missing_exact_A_to_D_choices")
    elif has_duplicate_choice_text(question):
        reasons.append("mc_duplicate_choice_text")
    if not is_grid_in(question) and question.get("correctAnswer") not in set(LETTERS):
        reasons.append("mc_invalid_correct_answer")
    return reasons


def block_question(question: dict[str, Any], reasons: list[str], applied_at: str) -> dict[str, Any]:
    previous = {
        "reviewStatus": question.get("reviewStatus"),
        "publicationStatus": question.get("publicationStatus"),
        "visibility": question.get("visibility"),
        "practicePool": question.get("practicePool"),
        "contentAuditVerdict": (question.get("contentAudit") or {}).get("verdict")
        if isinstance(question.get("contentAudit"), dict)
        else None,
    }
    question["reviewStatus"] = "rejected"
    question["publicationStatus"] = "rejected/p0_quality_gate"
    question["visibility"] = "blocked"
    question["practicePool"] = "hidden_duplicate" if "mc_duplicate_choice_text" in reasons else "blocked_quality_gate"
    question["qualityGate"] = {
        "version": VERSION,
        "status": "blocked",
        "verdict": "fail",
        "severity": "P0",
        "reasons": reasons,
        "previous": previous,
        "appliedAt": applied_at,
    }
    question["contentAudit"] = {
        "version": VERSION,
        "verdict": "fail",
        "issues": reasons,
        "reviewedBy": "sat-studio-governance",
        "reviewedAt": applied_at,
        "previousVerdict": previous.get("contentAuditVerdict"),
    }
    return previous


def apply_p0_quality_gate() -> dict[str, Any]:
    applied_at = now_iso()
    ARTIFACTS_DIR.mkdir(exist_ok=True)
    blocked_rows: list[dict[str, Any]] = []
    backups: list[str] = []

    for filename in row_audit.QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        records = payload.get("questions") if isinstance(payload, dict) else payload
        if not isinstance(records, list):
            continue

        changed = False
        for index, question in enumerate(records):
            if not isinstance(question, dict) or is_blocked(question):
                continue
            normalized = row_audit.normalize_question(question, filename, index)
            if not normalized:
                continue
            reasons = structural_block_reasons(normalized)
            if not reasons:
                continue
            previous = block_question(question, reasons, applied_at)
            changed = True
            blocked_rows.append(
                {
                    "id": question.get("id") or f"{filename}#{index}",
                    "sourceFile": filename,
                    "sourceIndex": index,
                    "section": normalized.get("section"),
                    "domain": normalized.get("domain"),
                    "skill": normalized.get("skill"),
                    "difficulty": normalized.get("difficulty"),
                    "reasons": reasons,
                    "previous": previous,
                }
            )

        if changed:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            backup = ARTIFACTS_DIR / f"{path.stem}-before-p0-quality-gate-{timestamp}.json"
            shutil.copy2(path, backup)
            backups.append(str(backup))
            write_records(path, records, payload)

    by_reason = Counter(reason for row in blocked_rows for reason in row["reasons"])
    by_previous_review = Counter((row["previous"].get("reviewStatus") or "Unknown") for row in blocked_rows)
    report = {
        "version": VERSION,
        "appliedAt": applied_at,
        "blockedCount": len(blocked_rows),
        "byReason": dict(by_reason),
        "byPreviousReviewStatus": dict(by_previous_review),
        "backups": backups,
        "blockedRows": blocked_rows,
    }
    QUALITY_GATE_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def active_rows() -> list[dict[str, Any]]:
    return [row for row in row_audit.iter_questions() if is_active(row)]


def reviewed_core_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    for row in rows:
        pool = row.get("practicePool") or (row.get("skeletonDiversity") or {}).get("practicePool") or "core_pool"
        if row.get("reviewStatus") == "reviewed" and pool not in {"hidden_duplicate", "remedial_pool"}:
            result.append(row)
    return result


def recommended_additions(current: int, total: int, target_pct: float) -> int:
    target = target_pct / 100
    if target <= 0 or target >= 1:
        return 0
    needed = (target * total - current) / (1 - target)
    return max(0, math.ceil(needed))


def build_blueprint_manifest(rows: list[dict[str, Any]]) -> dict[str, Any]:
    section_rows: dict[str, list[dict[str, Any]]] = {
        section: [row for row in rows if row.get("section") == section]
        for section in row_audit.SAT_DOMAIN_TARGETS
    }
    focus_domains = {
        ("Math", "Algebra"),
        ("Math", "Advanced Math"),
        ("Reading and Writing", "Expression of Ideas"),
    }
    domains: list[dict[str, Any]] = []
    for section, targets in row_audit.SAT_DOMAIN_TARGETS.items():
        total = len(section_rows[section])
        counts = Counter(row.get("domain") for row in section_rows[section])
        for domain, target in targets.items():
            count = counts[domain]
            actual = round(count * 100 / total, 1) if total else 0.0
            delta = round(actual - target, 1)
            if delta <= -3:
                action = "expand"
            elif delta >= 3:
                action = "deprioritize_surplus"
            else:
                action = "maintain"
            priority = "P1" if (section, domain) in focus_domains and action == "expand" else ("P2" if action != "maintain" else "P3")
            domains.append(
                {
                    "section": section,
                    "domain": domain,
                    "count": count,
                    "sectionTotal": total,
                    "actualPct": actual,
                    "satTargetPct": target,
                    "deltaPctPoints": delta,
                    "action": action,
                    "priority": priority,
                    "recommendedAdditionalReviewedCore": recommended_additions(count, total, target),
                }
            )

    manifest = {
        "version": VERSION,
        "basis": "active reviewed non-remedial core rows after P0 quality gate",
        "generatedAt": now_iso(),
        "domains": domains,
        "highestPriority": [
            row
            for row in domains
            if row["priority"] == "P1"
        ],
    }
    BLUEPRINT_JSON.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with BLUEPRINT_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = [
            "priority",
            "section",
            "domain",
            "count",
            "sectionTotal",
            "actualPct",
            "satTargetPct",
            "deltaPctPoints",
            "action",
            "recommendedAdditionalReviewedCore",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows({key: row.get(key) for key in fieldnames} for row in domains)
    return manifest


def current_question_index(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for row in rows:
        qid = str(row.get("id") or row.get("_auditId") or "")
        if qid:
            result[qid] = row
    return result


def build_explanation_queue(rows: list[dict[str, Any]], quality_gate: dict[str, Any]) -> dict[str, Any]:
    by_id = current_question_index(rows)
    queue: list[dict[str, Any]] = []
    seen: set[str] = set()
    issues_path = DATA_DIR / "reviewed-question-expert-audit-issues.csv"
    if issues_path.exists():
        with issues_path.open(encoding="utf-8-sig", newline="") as handle:
            for source_row in csv.DictReader(handle):
                qid = source_row.get("id") or ""
                if not qid or qid in seen:
                    continue
                question = by_id.get(qid)
                if not question or is_blocked(question):
                    continue
                severity = source_row.get("severity") or "depth_gap"
                flags = source_row.get("depthFlags") or source_row.get("warnings") or source_row.get("issues") or ""
                difficulty = source_row.get("difficulty") or question.get("difficulty") or ""
                priority = "P1" if severity == "accuracy_blocker" or difficulty == "Hard" else ("P2" if severity == "depth_gap" else "P3")
                queue.append(
                    {
                        "id": qid,
                        "priority": priority,
                        "severity": severity,
                        "section": source_row.get("section") or question.get("section"),
                        "domain": source_row.get("domain") or question.get("domain"),
                        "skill": source_row.get("skill") or question.get("skill"),
                        "difficulty": difficulty,
                        "sourceFile": source_row.get("sourceFile") or question.get("_sourceFile"),
                        "sourceIndex": source_row.get("sourceIndex") or question.get("_sourceIndex"),
                        "depthFlags": flags,
                        "requiredUpgrade": required_explanation_upgrade(question, flags),
                    }
                )
                seen.add(qid)

    for row in quality_gate.get("blockedRows", []):
        qid = str(row.get("id") or "")
        if qid and qid not in seen:
            queue.insert(
                0,
                {
                    "id": qid,
                    "priority": "P0",
                    "severity": "accuracy_blocker",
                    "section": row.get("section"),
                    "domain": row.get("domain"),
                    "skill": row.get("skill"),
                    "difficulty": row.get("difficulty"),
                    "sourceFile": row.get("sourceFile"),
                    "sourceIndex": row.get("sourceIndex"),
                    "depthFlags": ";".join(row.get("reasons") or []),
                    "requiredUpgrade": "Rewrite answer choices first, then add correct-answer proof and trap explanations.",
                },
            )
            seen.add(qid)

    priority_order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
    queue.sort(key=lambda item: (priority_order.get(item["priority"], 9), item["section"] or "", item["domain"] or "", item["id"]))
    report = {
        "version": VERSION,
        "generatedAt": now_iso(),
        "total": len(queue),
        "byPriority": dict(Counter(item["priority"] for item in queue)),
        "bySeverity": dict(Counter(item["severity"] for item in queue)),
        "items": queue,
    }
    EXPLANATION_QUEUE_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with EXPLANATION_QUEUE_CSV.open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = [
            "priority",
            "severity",
            "id",
            "sourceFile",
            "sourceIndex",
            "section",
            "domain",
            "skill",
            "difficulty",
            "depthFlags",
            "requiredUpgrade",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows({key: item.get(key) for key in fieldnames} for item in queue)
    return report


def required_explanation_upgrade(question: dict[str, Any], flags: str) -> str:
    section = question.get("section")
    difficulty = question.get("difficulty")
    if "generic_distractor_teaching" in flags:
        return "Add choice-by-choice trap analysis tied to the exact prompt evidence."
    if section == "Math" and difficulty == "Hard":
        return "Add multi-step solution, why the shortcut works, and the common trap path."
    if section == "Math":
        return "Add concise setup, algebraic steps, final value check, and one trap note."
    return "Add exact evidence, reason the correct choice wins, and explain two strongest wrong choices."


def is_mc_ready(question: dict[str, Any]) -> bool:
    choices = question.get("choices")
    return (
        not is_grid_in(question)
        and isinstance(choices, dict)
        and set(choices.keys()) == set(LETTERS)
        and question.get("correctAnswer") in set(LETTERS)
        and not has_duplicate_choice_text(question)
    )


def is_format_ready(question: dict[str, Any]) -> bool:
    return is_mc_ready(question) or (
        is_grid_in(question)
        and bool(question.get("correctAnswer") or question.get("acceptableAnswers"))
    )


def pool_governance_for(question: dict[str, Any], blueprint_by_domain: dict[tuple[str, str], dict[str, Any]]) -> dict[str, Any]:
    pool = question.get("practicePool") or (question.get("skeletonDiversity") or {}).get("practicePool") or "core_pool"
    reviewed = question.get("reviewStatus") == "reviewed"
    active = is_active(question)
    format_ready = is_format_ready(question)
    explanation_ready = bool(question.get("explanation"))
    domain_row = blueprint_by_domain.get((question.get("section"), question.get("domain")), {})
    surplus = domain_row.get("action") == "deprioritize_surplus"
    hard = question.get("difficulty") == "Hard"
    medium_or_hard = question.get("difficulty") in {"Medium", "Hard"}
    diagnostic = active and reviewed and pool == "core_pool" and format_ready and explanation_ready and not surplus
    simulation = active and reviewed and pool == "core_pool" and format_ready and explanation_ready
    remediation = active and (pool == "remedial_pool" or not reviewed or surplus)
    elite = active and reviewed and hard and format_ready and explanation_ready
    proof = active and reviewed and medium_or_hard and format_ready and explanation_ready
    pools = []
    if diagnostic:
        pools.append("diagnostic")
    if simulation:
        pools.append("simulation")
    if remediation:
        pools.append("remediation")
    if elite:
        pools.append("1550_plus")
    if proof:
        pools.append("mastery_proof")
    if active and not pools:
        pools.append("content_review")
    if not active:
        pools.append("excluded")
    return {
        "id": question.get("id") or question.get("_auditId"),
        "section": question.get("section"),
        "domain": question.get("domain"),
        "skill": question.get("skill"),
        "difficulty": question.get("difficulty"),
        "sourceFile": question.get("_sourceFile"),
        "sourceIndex": question.get("_sourceIndex"),
        "practicePool": pool,
        "instructionalPools": pools,
        "diagnosticEligible": diagnostic,
        "simulationEligible": simulation,
        "remediationEligible": remediation,
        "eliteMixedEligible": elite,
        "proofEligible": proof,
        "formatReady": format_ready,
        "explanationReady": explanation_ready,
        "reviewed": reviewed,
        "active": active,
        "blueprintAction": domain_row.get("action"),
    }


def build_pool_governance(rows: list[dict[str, Any]], blueprint: dict[str, Any]) -> dict[str, Any]:
    blueprint_by_domain = {(row["section"], row["domain"]): row for row in blueprint.get("domains", [])}
    entries = [pool_governance_for(row, blueprint_by_domain) for row in rows]
    report = {
        "version": VERSION,
        "generatedAt": now_iso(),
        "total": len(entries),
        "byPool": dict(Counter(pool for entry in entries for pool in entry["instructionalPools"])),
        "entries": entries,
    }
    POOL_GOVERNANCE_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def mastery_policy_for(entry: dict[str, Any]) -> dict[str, Any]:
    difficulty = entry.get("difficulty")
    section = entry.get("section")
    proof_type = "standard"
    if not entry.get("active"):
        proof_type = "excluded"
    elif "1550_plus" in entry.get("instructionalPools", []):
        proof_type = "elite"
    elif difficulty == "Hard":
        proof_type = "transfer"
    elif "remediation" in entry.get("instructionalPools", []):
        proof_type = "foundation"
    elif difficulty == "Medium":
        proof_type = "timed" if section == "Math" else "standard"
    retention_days = 14 if proof_type in {"timed", "transfer", "elite"} else 7
    return {
        "id": entry.get("id"),
        "eligible": bool(entry.get("proofEligible")),
        "proofType": proof_type,
        "requiresFreshContext": proof_type not in {"excluded", "foundation"},
        "minimumDifficulty": "Hard" if proof_type in {"transfer", "elite"} else ("Medium" if proof_type in {"timed", "standard"} else "Easy"),
        "minimumCorrectStreak": 3 if proof_type == "elite" else (2 if proof_type in {"timed", "transfer"} else 1),
        "retentionDays": retention_days,
        "timedRequired": proof_type in {"timed", "elite"},
    }


def build_mastery_policy(pool_report: dict[str, Any]) -> dict[str, Any]:
    policies = [mastery_policy_for(entry) for entry in pool_report.get("entries", [])]
    report = {
        "version": VERSION,
        "generatedAt": now_iso(),
        "stagePolicy": {
            "Collect evidence": "3-5 fresh attempts before any mastery label is trusted.",
            "Foundation repair": "Easy/medium proof after lesson review.",
            "Standard SAT": "Medium proof in the same subskill without repeated-form misses.",
            "Trap recognition": "Explain the trap before speed work.",
            "Hard transfer": "Fresh hard context, not a cloned template.",
            "Timed mastery": "Accuracy and pace proof in a timed set.",
            "Maintenance": "Fresh review after 14 days without recent misses.",
        },
        "total": len(policies),
        "byProofType": dict(Counter(item["proofType"] for item in policies)),
        "items": policies,
    }
    MASTERY_POLICY_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def build_final_report(
    quality_gate: dict[str, Any],
    blueprint: dict[str, Any],
    explanation_queue: dict[str, Any],
    pool_report: dict[str, Any],
    mastery_policy: dict[str, Any],
) -> dict[str, Any]:
    report = {
        "version": VERSION,
        "generatedAt": now_iso(),
        "p0QualityGate": {
            "blockedCount": quality_gate.get("blockedCount", 0),
            "byReason": quality_gate.get("byReason", {}),
            "byPreviousReviewStatus": quality_gate.get("byPreviousReviewStatus", {}),
            "artifact": str(QUALITY_GATE_JSON.relative_to(ROOT)),
        },
        "p1Blueprint": {
            "highestPriority": blueprint.get("highestPriority", []),
            "artifact": str(BLUEPRINT_JSON.relative_to(ROOT)),
            "csv": str(BLUEPRINT_CSV.relative_to(ROOT)),
        },
        "p2ExplanationQueue": {
            "total": explanation_queue.get("total", 0),
            "byPriority": explanation_queue.get("byPriority", {}),
            "artifact": str(EXPLANATION_QUEUE_JSON.relative_to(ROOT)),
            "csv": str(EXPLANATION_QUEUE_CSV.relative_to(ROOT)),
        },
        "p3Pools": {
            "byPool": pool_report.get("byPool", {}),
            "artifact": str(POOL_GOVERNANCE_JSON.relative_to(ROOT)),
        },
        "p4MasteryProof": {
            "byProofType": mastery_policy.get("byProofType", {}),
            "artifact": str(MASTERY_POLICY_JSON.relative_to(ROOT)),
        },
    }
    GOVERNANCE_REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def main() -> None:
    quality_gate = apply_p0_quality_gate()
    rows = active_rows()
    core_rows = reviewed_core_rows(rows)
    blueprint = build_blueprint_manifest(core_rows)
    explanation_queue = build_explanation_queue(rows, quality_gate)
    pool_report = build_pool_governance(rows, blueprint)
    mastery_policy = build_mastery_policy(pool_report)
    report = build_final_report(quality_gate, blueprint, explanation_queue, pool_report, mastery_policy)
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
