from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_PATH = DATA_DIR / "closed-loop-training-audit.json"


def read_text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def load_json(path: str) -> dict:
    file_path = ROOT / path
    if not file_path.exists():
        return {}
    return json.loads(file_path.read_text(encoding="utf-8"))


def status_from(condition: bool) -> str:
    return "done" if condition else "fail"


def main() -> int:
    roadmap = read_text("sat_roadmap_engine.js")
    practice = read_text("sat_practice_engine.js")
    routing = read_text("sat_adaptive_routing_engine.js")
    remediation = read_text("sat_remediation_engine.js")
    mastery = read_text("sat_mastery_engine.js")
    integrity = load_json("data/question-integrity-report.json").get("summary", {})
    expert = load_json("data/reviewed-question-expert-audit.json").get("scorecard", {})
    readiness = load_json("data/sat-2026-readiness-audit.json").get("inventory", {})

    checks = [
        {
            "id": "closed_loop_phase_contract",
            "label": "Roadmap can classify the learner into a closed-loop training phase.",
            "status": status_from("buildClosedLoopTrainingPlan" in roadmap and "closedLoopPhaseFor" in roadmap),
            "evidence": "sat_roadmap_engine.js exports buildClosedLoopTrainingPlan and closedLoopPhaseFor.",
        },
        {
            "id": "sprint_prescription_contract",
            "label": "Daily sprint type, count, exit rule, and routing bias are explicit.",
            "status": status_from("buildSprintPrescription" in practice and "1500+ Crucible" in practice),
            "evidence": "sat_practice_engine.js exports buildSprintPrescription.",
        },
        {
            "id": "adaptive_crucible_routing",
            "label": "1500+ mode has same-skill, transfer, mixed, and timed proof buckets.",
            "status": status_from("crucibleMode" in routing and "crucible-mixed" in routing and "crucible-timed-proof" in routing),
            "evidence": "sat_adaptive_routing_engine.js builds the four Crucible routing buckets.",
        },
        {
            "id": "remediation_proof_loop",
            "label": "Wrong answers route into lesson, proof, proof failure, and due review states.",
            "status": status_from("proof_failed" in remediation and "proof_due" in remediation and "reviewCadence" in remediation),
            "evidence": "sat_remediation_engine.js contains proof lifecycle states and review cadence.",
        },
        {
            "id": "mastery_requires_hard_fresh_proof",
            "label": "Mastered status is gated by hard/timed fresh proof, not raw accuracy alone.",
            "status": status_from("hardTimedFreshProofForms" in mastery and "Pass 3 hard or timed fresh proof" in mastery),
            "evidence": "sat_mastery_engine.js tracks hard/timed fresh proof forms.",
        },
        {
            "id": "bank_quality_blockers",
            "label": "Reviewed question bank has no critical blockers, rejected rows, or topic overload.",
            "status": status_from(
                integrity.get("criticalIssueCount") == 0
                and integrity.get("blockedSourceQuestionCount") == 0
                and integrity.get("overrepresentedTopicCount") == 0
            ),
            "evidence": {
                "criticalIssueCount": integrity.get("criticalIssueCount"),
                "blockedSourceQuestionCount": integrity.get("blockedSourceQuestionCount"),
                "overrepresentedTopicCount": integrity.get("overrepresentedTopicCount"),
                "warningIssueCount": integrity.get("warningIssueCount"),
            },
        },
        {
            "id": "expert_review_pool_quality",
            "label": "Reviewed pool remains academically ready for high-quality SAT practice.",
            "status": status_from(
                expert.get("accuracyBlockerCount") == 0
                and expert.get("depthGapCount") == 0
                and float(expert.get("overallExpertScore10") or 0) >= 9.5
            ),
            "evidence": expert,
        },
        {
            "id": "all_active_questions_reviewed",
            "label": "Active study rows are reviewed or content-audit pass.",
            "status": status_from(readiness.get("needsReviewOrContentAuditNotPass") == 0),
            "evidence": {
                "loadedTotal": readiness.get("loadedTotal"),
                "coreReadyReviewed": readiness.get("coreReadyReviewed"),
                "needsReviewOrContentAuditNotPass": readiness.get("needsReviewOrContentAuditNotPass"),
            },
        },
    ]

    remaining = [
        {
            "id": "irt_live_calibration",
            "status": "pending",
            "reason": "Needs real student logs before difficulty and discrimination parameters are statistically defensible.",
            "nextStep": "Collect attempt logs, then fit per-item difficulty/discrimination and compare against current heuristic routing.",
        },
        {
            "id": "long_rw_prompt_rewrite",
            "status": "deferred",
            "reason": "53 technically valid long RW prompts are suppressed from default study by policy, not quality blockers.",
            "nextStep": "Rewrite or split only if the product wants them in default learner flow.",
        },
    ]

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "verdict": "closed_loop_core_ready" if all(item["status"] == "done" for item in checks) else "closed_loop_core_has_failures",
        "phases": [
            "Diagnostic",
            "Remedial Drill",
            "Standard SAT Build",
            "Proof Transfer",
            "1500+ Crucible",
            "Maintenance",
        ],
        "closedLoop": [
            "diagnostic",
            "sprint",
            "review",
            "lesson",
            "proof",
            "spaced_repetition",
            "refresh",
        ],
        "checks": checks,
        "remaining": remaining,
    }
    DATA_DIR.mkdir(exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"closed-loop audit: {report['verdict']}")
    print(f"report: {REPORT_PATH}")
    failed = [item for item in checks if item["status"] != "done"]
    if failed:
        for item in failed:
            print(f"FAIL {item['id']}: {item['label']}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
