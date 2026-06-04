import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from scripts.release_checklist import (
    PRODUCTION_READINESS_CONTRACT,
    RELEASE_CONTRACT_VERSION,
    evaluate_production_contract_sources,
    evaluate_release_inputs,
    public_content_package_ok,
    public_manifest_artifact_ok,
)


def run():
    base_integrity = {"summary": {"totalQuestions": 100, "criticalQuestionCount": 0}}
    base_readiness = {"inventory": {"loadedTotal": 100, "coreReadyReviewed": 80}}
    base_smoke = {
        "runtimeErrors": [],
        "diagnostic": {"count": 20, "readinessText": "20-question quick test ready. Adaptive v2 ready."},
        "fullLength": {"totalQuestions": 98, "moduleCount": 4, "timerRequired": True},
        "coachDashboard": {
            "parent": {"text": "Parent Coach Dashboard"},
            "admin": {"text": "Tổng quan vận hành admin Ngân hàng câu hỏi Tường an toàn public"},
        },
        "aiSignal": {
            "publicVisibleDrafts": 0,
            "publicKaplanVisible": 0,
            "publicArchiveVisible": 0,
            "publicSignalPanel": "Public accounts cannot view private source signals.",
        },
    }
    base_public_manifest = {
        "schemaVersion": "sat-public-manifest-artifact-v1",
        "stableContentChecksum": "fnv1a32:abc123",
        "releaseGate": {"ready": True},
        "counts": {"manifestReady": 2, "blockedPublicCandidates": 0, "sourceUnsigned": 0},
    }
    base_public_package = {
        "schemaVersion": "sat_content_package_v1",
        "contractVersion": "sat_public_student_contract_v1",
        "manifest": {"counts": {"section": {"Math": 2}, "difficulty": {"Medium": 2}}},
        "items": [
            {"id": "q1", "section": "Math", "difficulty": "Medium", "prompt": "p1"},
            {"id": "q2", "section": "Math", "difficulty": "Medium", "prompt": "p2"},
        ],
    }
    assert public_manifest_artifact_ok(base_public_manifest) is True
    assert public_content_package_ok(base_public_package, base_public_manifest) is True

    report = evaluate_release_inputs(base_integrity, base_readiness, base_smoke, public_manifest=base_public_manifest, public_content_package=base_public_package)
    assert report["contractVersion"] == RELEASE_CONTRACT_VERSION
    assert report["ok"] is True
    assert report["releaseReady"] is True
    assert report["productionContract"]["ok"] is True
    assert PRODUCTION_READINESS_CONTRACT["requiredGates"]["operations"]

    critical = evaluate_release_inputs(
        {"summary": {"totalQuestions": 100, "criticalQuestionCount": 1}},
        base_readiness,
        base_smoke,
        public_manifest=base_public_manifest,
        public_content_package=base_public_package,
    )
    assert critical["ok"] is False
    assert critical["releaseReady"] is False
    assert critical["blockingFailed"][0]["name"] == "no critical data issues"

    public_leak = dict(base_smoke)
    public_leak["aiSignal"] = {**base_smoke["aiSignal"], "publicArchiveVisible": 1}
    leak_report = evaluate_release_inputs(base_integrity, base_readiness, public_leak, public_manifest=base_public_manifest, public_content_package=base_public_package)
    assert leak_report["ok"] is False
    assert any(item["name"] == "public account source firewall" for item in leak_report["blockingFailed"])

    broken_sources = {
        "backend": "",
        "public_app": "",
        "question_bank": "",
        "architecture": "",
        "backup": "",
        "restore": "",
        "health_check": "",
        "deploy_readiness": "",
        "load_smoke": "",
        "postgres_migration": "",
        "postgres_sql": "",
        "domain_verify": "",
        "deploy_docs": "",
        "deploy_env": "",
        "quality_runner": "",
    }
    contract = evaluate_production_contract_sources(broken_sources)
    assert contract["ok"] is False
    assert any(item["name"] == "backend migrations and sync contract" for item in contract["failed"])
    blocked_contract = evaluate_release_inputs(
        base_integrity,
        base_readiness,
        base_smoke,
        source_texts=broken_sources,
        public_manifest=base_public_manifest,
        public_content_package=base_public_package,
    )
    assert blocked_contract["ok"] is False
    assert any(item["name"] == "P4 production readiness contract" for item in blocked_contract["blockingFailed"])

    missing_artifact = evaluate_release_inputs(base_integrity, base_readiness, base_smoke, public_manifest=None, public_content_package=None)
    assert missing_artifact["ok"] is False
    assert any(item["name"] == "public manifest artifact ready" for item in missing_artifact["blockingFailed"])

    unsafe_package = {
        "schemaVersion": "sat_content_package_v1",
        "contractVersion": "sat_public_student_contract_v1",
        "manifest": {"counts": {"sourceType": {"antigravity": 1}}},
        "items": [{"id": "q1", "prompt": "p1", "sourceReference": "private"}],
    }
    assert public_content_package_ok(unsafe_package, {**base_public_manifest, "counts": {"manifestReady": 1, "blockedPublicCandidates": 0, "sourceUnsigned": 0}}) is False


if __name__ == "__main__":
    run()
    print("release_checklist_unit_tests: pass")
