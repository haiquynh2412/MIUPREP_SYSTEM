from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_PATH = DATA_DIR / "sat-studio-implementation-tracker.json"
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


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def load_questions() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for filename in QUESTION_FILES:
        payload = load_json(DATA_DIR / filename, [])
        questions = payload.get("questions") if isinstance(payload, dict) else payload
        if isinstance(questions, list):
            for question in questions:
                if isinstance(question, dict):
                    rows.append({**question, "_sourceFile": filename})
    return rows


def read_text(path: str) -> str:
    file_path = ROOT / path
    return file_path.read_text(encoding="utf-8") if file_path.exists() else ""


def practice_pool(question: dict[str, Any]) -> str:
    diversity = question.get("skeletonDiversity") if isinstance(question.get("skeletonDiversity"), dict) else {}
    return str(question.get("practicePool") or diversity.get("practicePool") or "core_pool")


def is_rejected(question: dict[str, Any]) -> bool:
    text = " ".join(str(question.get(key) or "") for key in ("reviewStatus", "publicationStatus", "visibility", "status")).lower()
    return any(token in text for token in ("rejected", "blocked", "hidden_duplicate"))


def active_reviewed(question: dict[str, Any]) -> bool:
    return question.get("reviewStatus") == "reviewed" and not is_rejected(question)


def nested_value(question: dict[str, Any], *paths: str) -> Any:
    for path in paths:
        current: Any = question
        for key in path.split("."):
            current = current.get(key) if isinstance(current, dict) else None
        if current not in (None, "", [], {}):
            return current
    return None


def has_skeleton(question: dict[str, Any]) -> bool:
    return bool(nested_value(question, "skeletonDiversity.skeletonId", "skeletonId", "templateFormId", "formKey", "templateId"))


def has_trap_metadata(question: dict[str, Any]) -> bool:
    return bool(nested_value(question, "trapTypes", "trapType", "metadata.trapTypes"))


def has_cognitive_move(question: dict[str, Any]) -> bool:
    return bool(nested_value(question, "cognitiveMove", "metadata.cognitiveMove"))


def has_semantic_field(question: dict[str, Any]) -> bool:
    return bool(nested_value(question, "semanticField", "metadata.semanticField", "passageSpec.semanticField", "discipline", "contentField"))


def has_math_tool_tag(question: dict[str, Any]) -> bool:
    return bool(
        nested_value(question, "mathToolTag", "mathToolTags", "calculatorTags", "calculatorUse.tags", "toolTag")
        or question.get("desmosUseful") is not None
    )


def has_multi_step_level(question: dict[str, Any]) -> bool:
    return bool(nested_value(question, "multiStepLevel", "metadata.multiStepLevel", "reasoningComplexity", "complexityLevel"))


def pct(part: int, total: int) -> float:
    return round((part / total) * 100, 1) if total else 0.0


def status_from(done: bool, partial: bool = False) -> str:
    if done:
        return "done"
    if partial:
        return "partial"
    return "pending"


def code_has(text: str, *needles: str) -> bool:
    return all(needle in text for needle in needles)


def build_tracker() -> dict[str, Any]:
    questions = load_questions()
    active = [question for question in questions if active_reviewed(question)]
    rw = [question for question in active if question.get("section") == "Reading and Writing"]
    math = [question for question in active if question.get("section") == "Math"]
    coverage = {
        "totalLoaded": len(questions),
        "activeReviewed": len(active),
        "coreMetadataPct": pct(sum(all(question.get(key) for key in ("section", "domain", "skill", "difficulty")) for question in active), len(active)),
        "skeletonOrTemplatePct": pct(sum(has_skeleton(question) for question in active), len(active)),
        "trapTypePct": pct(sum(has_trap_metadata(question) for question in active), len(active)),
        "cognitiveMovePct": pct(sum(has_cognitive_move(question) for question in active), len(active)),
        "rwSemanticFieldPct": pct(sum(has_semantic_field(question) for question in rw), len(rw)),
        "mathToolTagPct": pct(sum(has_math_tool_tag(question) for question in math), len(math)),
        "multiStepLevelPct": pct(sum(has_multi_step_level(question) for question in active), len(active)),
        "poolCounts": {
            "core_training_pool": sum(practice_pool(question) == "core_pool" for question in active),
            "remedial_pool": sum(practice_pool(question) == "remedial_pool" for question in active),
            "public_candidate_pool": sum(
                question.get("visibility") == "public_candidate" or "public_candidate" in str(question.get("publicationStatus") or "")
                for question in active
            ),
            "virtual_crucible_pool": sum(question.get("difficulty") == "Hard" for question in active),
            "crucible_pool": sum(question.get("difficulty") == "Hard" and question.get("cruciblePool") == "crucible_pool" for question in active),
        },
    }

    app = read_text("app.js")
    sampler = read_text("sat_sampler_engine.js")
    diagnostic = read_text("sat_diagnostic_engine.js")
    routing = read_text("sat_adaptive_routing_engine.js")
    content_admin = read_text("sat_content_admin_engine.js")
    view_renderers = read_text("sat_view_renderers.js")
    mastery = read_text("sat_mastery_engine.js")
    remediation = read_text("sat_remediation_engine.js")
    practice = read_text("sat_practice_engine.js")
    dashboard = read_text("sat_dashboard_engine.js")
    item_analytics = read_text("sat_item_analytics_engine.js")
    irt_calibration = read_text("sat_irt_calibration_engine.js")
    integrity = load_json(DATA_DIR / "question-integrity-report.json", {}).get("summary", {})
    hint_telemetry_done = code_has(practice, "helpTelemetry", "hintUsed", "fullSolutionViewed", "independentAttempt") and code_has(
        app,
        "coaching_help_viewed",
        "helpTiming",
        "independentAttempt",
    )
    item_analytics_dashboard_done = (
        code_has(app, "SatItemAnalyticsEngine.buildItemAnalytics")
        and code_has(content_admin, "buildItemAnalyticsSignals", "helpedResponseCount", "flaggedRows")
        and code_has(view_renderers, "renderAdminItemAnalyticsRow", "calibration responses")
    )
    irt_calibration_engine_ready = code_has(irt_calibration, "fitIrt2PL", "deferred_insufficient_data", "calibrated_provisional_2pl")

    phase0_advanced_done = (
        coverage["skeletonOrTemplatePct"] >= 95
        and coverage["trapTypePct"] >= 95
        and coverage["cognitiveMovePct"] >= 95
        and coverage["rwSemanticFieldPct"] >= 90
        and coverage["mathToolTagPct"] >= 90
        and coverage["multiStepLevelPct"] >= 90
        and coverage["poolCounts"]["crucible_pool"] >= max(1, int(coverage["poolCounts"]["virtual_crucible_pool"] * 0.9))
    )
    phases = [
        {
            "id": "phase0_data_question_metadata",
            "title": "Giai đoạn 0: Data & Question Metadata",
            "status": status_from(
                phase0_advanced_done and integrity.get("criticalIssueCount") == 0 and integrity.get("overrepresentedTopicCount") == 0,
                coverage["coreMetadataPct"] >= 99 and coverage["trapTypePct"] >= 90,
            ),
            "evidence": coverage,
            "remaining": [
                item
                for item, value in [
                    ("Materialize semanticField for RW passages.", coverage["rwSemanticFieldPct"] < 90),
                    ("Materialize multiStepLevel for all routed rows.", coverage["multiStepLevelPct"] < 90),
                    (
                        "Materialize crucible_pool label or report, not only virtual hard routing.",
                        coverage["poolCounts"]["crucible_pool"] < max(1, int(coverage["poolCounts"]["virtual_crucible_pool"] * 0.9)),
                    ),
                ]
                if value
            ],
        },
        {
            "id": "phase1_diagnostic",
            "title": "Giai đoạn 1: Diagnostic đa tầng",
            "status": status_from(
                code_has(app, "preview", "full", "rw_module", "math_module", "modulePlan")
                and code_has(diagnostic, "buildDiagnosticModuleSet", "routeForNextModule", "buildDiagnosticV2Insights")
                and code_has(sampler, "selectQuestionsByBlueprint", "buildSelectionAudit")
            ),
            "remaining": [],
        },
        {
            "id": "phase2_skill_tree_mastery",
            "title": "Giai đoạn 2: Skill Tree & Mastery Model",
            "status": status_from(code_has(mastery, "hardTimedFreshProofForms", "recentWrong", "retentionDays", "Mastered")),
            "remaining": [],
        },
        {
            "id": "phase3_remedial_sprint",
            "title": "Giai đoạn 3: Remedial Sprint",
            "status": status_from(code_has(practice, "buildSprintPrescription", "85% foundation accuracy") and code_has(remediation, "scaffoldDrill", "proof_failed")),
            "remaining": [],
        },
        {
            "id": "phase4_crucible",
            "title": "Giai đoạn 4: 1500+ Crucible",
            "status": status_from(code_has(routing, "crucible-same-skill", "crucible-transfer", "crucible-mixed", "crucible-timed-proof")),
            "remaining": [],
        },
        {
            "id": "phase5_spaced_repetition",
            "title": "Giai đoạn 5: Spaced Repetition",
            "status": status_from(code_has(practice, "reviewDelayDaysForAttempt") and code_has(remediation, "reviewDelayDaysForAttempt", "proof_failed")),
            "remaining": [],
        },
        {
            "id": "phase6_explanation_coaching",
            "title": "Giai đoạn 6: Explanation Coaching & Progressive Hints",
            "status": status_from(code_has(remediation, "buildHintSteps", "selectedTrapCoaching", "Full solution") and code_has(practice, "firstMove", "learningEvidence")),
            "remaining": [],
        },
        {
            "id": "phase7_irt_calibration",
            "title": "Giai đoạn 7: IRT & Calibration",
            "status": status_from(False, code_has(item_analytics, "pValue", "discriminationIndex", "irt2plReady", "buildItemAnalytics")),
            "remaining": [
                item
                for item, value in [
                    ("Collect enough live attempts before trusting IRT 2PL.", True),
                    ("Add hintUsed telemetry to attempt logs.", not hint_telemetry_done),
                    ("Fit calibrated item parameters after response thresholds are met.", not irt_calibration_engine_ready),
                ]
                if value
            ],
        },
        {
            "id": "phase8_dashboard_recommendation",
            "title": "Giai đoạn 8: Dashboard & Recommendation Engine",
            "status": status_from(code_has(dashboard, "buildNextActionModel", "buildTodayFlowModel", "buildScoreLadderModel") and code_has(routing, "buildQuestionRecommendationPlan")),
            "remaining": [],
        },
    ]

    sprint_map = [
        ("sprint1_data_sampling", "Sprint 1: Data & Sampling", ["phase0_data_question_metadata", "phase1_diagnostic"]),
        ("sprint2_mastery_proof", "Sprint 2: Mastery & Proof", ["phase2_skill_tree_mastery"]),
        ("sprint3_spaced_repetition", "Sprint 3: Spaced Repetition", ["phase5_spaced_repetition"]),
        ("sprint4_crucible_routing", "Sprint 4: Crucible Routing", ["phase4_crucible"]),
        ("sprint5_hint_coaching", "Sprint 5: Hint & Coaching", ["phase6_explanation_coaching"]),
        ("sprint6_analytics_irt_prep", "Sprint 6: Analytics & IRT Prep", ["phase7_irt_calibration", "phase8_dashboard_recommendation"]),
        ("sprint7_full_calibration", "Sprint 7: Full Calibration", ["phase7_irt_calibration"]),
    ]
    phase_by_id = {phase["id"]: phase for phase in phases}
    sprints = []
    for sprint_id, title, phase_ids in sprint_map:
        statuses = [phase_by_id[phase_id]["status"] for phase_id in phase_ids]
        done = all(status == "done" for status in statuses)
        partial = any(status in {"done", "partial"} for status in statuses)
        sprints.append(
            {
                "id": sprint_id,
                "title": title,
                "status": "pending" if sprint_id == "sprint7_full_calibration" else status_from(done, partial),
                "phaseIds": phase_ids,
                "remaining": [item for phase_id in phase_ids for item in phase_by_id[phase_id].get("remaining", [])],
            }
        )

    backlog = []
    if not phase0_advanced_done:
        backlog.insert(
            0,
            {
                "priority": "P0",
                "id": "metadata_semantic_multistep_enrichment",
                "task": "Run or build an enrichment pass to fill rw semanticField and multiStepLevel, then rerun tracker.",
                "owner": "content_engine",
            },
        )
    if not item_analytics_dashboard_done:
        backlog.insert(
            0,
            {
                "priority": "P1",
                "id": "admin_item_analytics_dashboard",
                "task": "Surface p-value, discrimination, low-quality flags, and sample thresholds in Admin Quality Lab.",
                "owner": "admin_dashboard",
            },
        )
    if not irt_calibration_engine_ready:
        backlog.append(
            {
                "priority": "P2",
                "id": "irt_2pl_after_logs",
                "task": "Fit IRT 2PL only after enough item responses are collected across score bands.",
                "owner": "analytics",
            }
        )
    if not hint_telemetry_done:
        backlog.insert(
            0,
            {
                "priority": "P0",
                "id": "hint_used_telemetry",
                "task": "Persist hintUsed/fullSolutionViewed on attempts so coaching and IRT can measure help dependence.",
                "owner": "learning_event_engine",
            },
        )

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "verdict": "implementation_tracking_ready",
        "planLoop": "Diagnostic -> Skill Tree -> Lesson -> Scaffold Drill -> Proof -> Timed Sprint -> 1500+ Crucible -> Spaced Retention -> Recalibration",
        "phases": phases,
        "sprints": sprints,
        "backlog": backlog,
    }


def main() -> int:
    report = build_tracker()
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"implementation tracker: {report['verdict']}")
    print(f"report: {REPORT_PATH}")
    status_counts: dict[str, int] = {}
    for phase in report["phases"]:
        status_counts[phase["status"]] = status_counts.get(phase["status"], 0) + 1
    print(json.dumps({"phaseStatusCounts": status_counts}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
