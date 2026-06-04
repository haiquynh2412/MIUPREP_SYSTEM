import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INTEGRITY_REPORT = ROOT / "data" / "question-integrity-report.json"
READINESS_REPORT = ROOT / "data" / "sat-2026-readiness-audit.json"
SMOKE_REPORT = ROOT / "artifacts" / "browser_smoke_last.log"
PUBLIC_MANIFEST_ARTIFACT = ROOT / "artifacts" / "sat-studio-public-manifest-latest.json"
PUBLIC_CONTENT_PACKAGE = ROOT / "artifacts" / "sat-studio-public-content-package-latest.json"
RELEASE_CONTRACT_VERSION = "2026-05-22-p4-production-readiness"

PRODUCTION_CONTRACT_SOURCE_FILES = {
    "backend": ROOT / "sat_public_backend.py",
    "public_app": ROOT / "sat_public_app.py",
    "question_bank": ROOT / "sat_question_query_engine.js",
    "architecture": ROOT / "sat_architecture_manifest.js",
    "backup": ROOT / "scripts" / "backup_public_backend.py",
    "restore": ROOT / "scripts" / "restore_public_backend_backup.py",
    "health_check": ROOT / "scripts" / "check_public_backend_health.py",
    "deploy_readiness": ROOT / "scripts" / "check_public_deploy_readiness.py",
    "load_smoke": ROOT / "scripts" / "public_backend_load_smoke.py",
    "postgres_migration": ROOT / "scripts" / "check_postgres_migration_artifact.py",
    "postgres_sql": ROOT / "migrations" / "postgresql" / "0010_teacher_classroom_v2.sql",
    "domain_verify": ROOT / "scripts" / "verify_public_domain.py",
    "public_manifest_export": ROOT / "scripts" / "export_public_manifest_artifact.js",
    "deploy_docs": ROOT / "PUBLIC_BACKEND.md",
    "deploy_env": ROOT / ".env.public.example",
    "quality_runner": ROOT / "scripts" / "run_quality_checks.js",
}

PRODUCTION_READINESS_CONTRACT = {
    "version": RELEASE_CONTRACT_VERSION,
    "requiredGates": {
        "dataSafety": [
            "backend sync contract",
            "official and question content redaction",
            "sanitized export and backup",
        ],
        "operations": [
            "schema migrations",
            "admin monitoring endpoint",
            "health check script with thresholds",
            "session maintenance",
        ],
        "security": [
            "RBAC-scoped accounts",
            "session token rotation",
            "public API rate limiting",
            "blocked private content in public views",
        ],
        "contentDelivery": [
            "versioned question bank contract",
            "scoped question retrieval",
            "backend content package source of truth",
            "public manifest gate",
            "exported public manifest and content package artifact",
        ],
        "release": [
            "question integrity report",
            "SAT 2026 readiness audit",
            "role smoke",
        "browser smoke",
        "public manifest artifact export",
        "deploy docs and environment template",
        ],
    },
    "launchBlockers": [
        "critical question integrity issue",
        "browser runtime error",
        "public account can see protected/private source content",
        "missing production contract source",
        "missing backend migration, monitoring, backup, health, or rate-limit guardrail",
    ],
}


def load_json(path):
    path = Path(path)
    if not path.exists():
        return None
    for encoding in ("utf-8", "utf-8-sig", "utf-16"):
        try:
            return json.loads(path.read_text(encoding=encoding))
        except UnicodeDecodeError:
            continue
        except json.JSONDecodeError:
            return None
    return None


def check_item(name, ok, detail="", severity="required"):
    return {
        "name": name,
        "ok": bool(ok),
        "severity": severity,
        "detail": detail,
    }


def load_source_texts(paths=None):
    paths = paths or PRODUCTION_CONTRACT_SOURCE_FILES
    texts = {}
    for key, path in paths.items():
        path = Path(path)
        texts[key] = path.read_text(encoding="utf-8") if path.exists() else ""
    return texts


def has_all_markers(text, markers):
    return all(marker in (text or "") for marker in markers)


def evaluate_production_contract_sources(source_texts=None):
    source_texts = source_texts or load_source_texts()
    checks = [
        check_item(
            "backend migrations and sync contract",
            has_all_markers(
                source_texts.get("backend"),
                ["SCHEMA_VERSION", "schema_migrations", "BACKEND_SYNC_CONTRACT", "PROTECTED_CONTENT_FIELD_KEYS", "content_packages", "query_content_package_payload", "migration_readiness_payload", "PostgresCompatConnection"],
            ),
            "schema migrations, sync contract, redaction rules, queryable content package store, and migration readiness payload",
            severity="release_blocker",
        ),
        check_item(
            "backend monitoring and maintenance",
            has_all_markers(source_texts.get("backend"), ["def monitoring", "def purge_sessions", "export_system_snapshot"]),
            "monitoring, session purge, and export snapshot",
            severity="release_blocker",
        ),
        check_item(
            "public API rate limiting",
            has_all_markers(
                source_texts.get("public_app"),
                ["InMemoryRateLimiter", "RedisRateLimiter", "PublicBackendMetrics", "SAT_STUDIO_RATE_LIMIT", "SAT_STUDIO_AUTH_RATE_LIMIT", "SAT_STUDIO_RATE_LIMIT_BACKEND", "Retry-After"],
            ),
            "per-path limiter with auth-specific threshold, Retry-After, pruning, Redis option, metrics, and backend guard",
            severity="release_blocker",
        ),
        check_item(
            "versioned question bank API contract",
            has_all_markers(
                source_texts.get("question_bank"),
                ["QUESTION_BANK_CONTRACT_VERSION", "queryQuestionBank", "buildQuestionBankManifest"],
            ),
            "scoped retrieval and manifest generation",
            severity="release_blocker",
        ),
        check_item(
            "sanitized backup script",
            has_all_markers(source_texts.get("backup"), ["export_system_snapshot", "--copy-sqlite", "prune_backups"]),
            "JSON snapshot, optional SQLite copy, and retention pruning",
            severity="release_blocker",
        ),
        check_item(
            "restore drill script",
            has_all_markers(source_texts.get("restore"), ["validate_snapshot", "validate_sqlite_copy", "--apply", "--restore-db"]),
            "sanitized JSON validation and SQLite recovery-copy restore drill",
            severity="release_blocker",
        ),
        check_item(
            "scheduled health check script",
            has_all_markers(
                source_texts.get("health_check"),
                ["SAT_PUBLIC_BACKEND_URL", "SAT_PUBLIC_BACKEND_TOKEN", "SAT_PUBLIC_HEALTH_WEBHOOK", "max_open_audits", "max_db_mb"],
            ),
            "health, monitoring thresholds, and webhook notification",
            severity="release_blocker",
        ),
        check_item(
            "deploy readiness script",
            has_all_markers(
                source_texts.get("deploy_readiness"),
                ["evaluate_deploy_readiness", "postgresql scale-out guard", "rate limiter production guard", "observability template", "production domain verification"],
            ),
            "static and runtime deploy guardrails before public release",
            severity="release_blocker",
        ),
        check_item(
            "public backend load smoke",
            has_all_markers(source_texts.get("load_smoke"), ["ThreadPoolExecutor", "run_load_smoke", "operationsCompleted", "progressRecords"]),
            "small concurrent read/write smoke for SQLite WAL pilot deployments",
            severity="release_blocker",
        ),
        check_item(
            "postgres migration artifact",
            has_all_markers(source_texts.get("postgres_sql"), ["CREATE TABLE IF NOT EXISTS accounts", "CREATE TABLE IF NOT EXISTS assignment_evidence", "ON CONFLICT (version) DO NOTHING"])
            and has_all_markers(source_texts.get("postgres_migration"), ["validate_postgres_migration", "--apply", "PUBLIC_BACKEND_TABLES"]),
            "transactional PostgreSQL migration artifact and validation/apply helper",
            severity="release_blocker",
        ),
        check_item(
            "public domain verification script",
            has_all_markers(source_texts.get("domain_verify"), ["verify_public_domain", "public domain must use HTTPS", "api/public/health"]),
            "deployed HTTPS domain verification gate",
            severity="release_blocker",
        ),
        check_item(
            "public manifest artifact exporter",
            has_all_markers(
                source_texts.get("public_manifest_export"),
                ["buildReleaseArtifacts", "sat-studio-public-manifest-latest.json", "sat-studio-public-content-package-latest.json"],
            ),
            "standalone release manifest and learner-safe content package export",
            severity="release_blocker",
        ),
        check_item(
            "deploy documentation",
            has_all_markers(
                source_texts.get("deploy_docs"),
                ["backup_public_backend.py --copy-sqlite", "restore_public_backend_backup.py", "check_public_backend_health.py", "check_public_deploy_readiness.py", "public_backend_load_smoke.py", "check_postgres_migration_artifact.py", "verify_public_domain.py", "export_public_manifest_artifact.js", "release_checklist.py --strict"],
            ),
            "backup, restore, monitoring, readiness, load smoke, public artifact export, and strict release checklist commands",
            severity="release_blocker",
        ),
        check_item(
            "deploy environment template",
            has_all_markers(
                source_texts.get("deploy_env"),
                ["SAT_STUDIO_ALLOWED_ORIGINS=", "SAT_STUDIO_RATE_LIMIT=", "SAT_STUDIO_RATE_LIMIT_BACKEND=memory", "SAT_STUDIO_RATE_LIMIT_MAX_BUCKETS=", "SAT_STUDIO_ACCESS_LOG_JSONL=", "SAT_STUDIO_ENABLE_POSTGRES=false", "SAT_PUBLIC_HEALTH_WEBHOOK="],
            ),
            "origin, rate-limit backend, limiter size, and health-alert configuration",
            severity="release_blocker",
        ),
        check_item(
            "quality runner covers production gates",
            has_all_markers(
                source_texts.get("quality_runner"),
                [
                    "public_backup_unit_tests.py",
                    "public_restore_unit_tests.py",
                    "public_health_check_unit_tests.py",
                    "public_deploy_static_tests.py",
                    "public_deploy_readiness_unit_tests.py",
                    "public_backend_load_smoke_unit_tests.py",
                    "public_postgres_migration_unit_tests.py",
                    "public_domain_verify_unit_tests.py",
                    "release_checklist_unit_tests.py",
                    "public_manifest_artifact_export_unit_tests.js",
                    "export_public_manifest_artifact.js\", \"--check",
                ],
            ),
            "backup, health, deploy, manifest export, and release checklist tests",
            severity="release_blocker",
        ),
        check_item(
            "architecture manifest tracks P4",
            has_all_markers(source_texts.get("architecture"), [RELEASE_CONTRACT_VERSION, "production-readiness"]),
            "P4 production-readiness layer and version",
            severity="release_blocker",
        ),
    ]
    failed = [item for item in checks if not item["ok"]]
    return {
        "version": RELEASE_CONTRACT_VERSION,
        "ok": not failed,
        "failed": failed,
        "checks": checks,
    }


def diagnostic_smoke_ok(diagnostic):
    readiness_text = diagnostic.get("readinessText", "") or ""
    has_quick_test = (
        "Preview" in readiness_text
        or "20-question quick test" in readiness_text
        or "20 questions" in readiness_text
    )
    has_adaptive = "Adaptive Diagnostic v2" in readiness_text or "Adaptive v2" in readiness_text
    return diagnostic.get("count", 0) >= 20 and has_quick_test and has_adaptive


def public_manifest_artifact_ok(public_manifest):
    if not isinstance(public_manifest, dict):
        return False
    counts = public_manifest.get("counts") or {}
    release_gate = public_manifest.get("releaseGate") or {}
    return (
        public_manifest.get("schemaVersion") == "sat-public-manifest-artifact-v1"
        and release_gate.get("ready") is True
        and int(counts.get("manifestReady") or 0) > 0
        and int(counts.get("blockedPublicCandidates") or 0) == 0
        and int(counts.get("sourceUnsigned") or 0) == 0
        and bool(public_manifest.get("stableContentChecksum"))
    )


def public_content_package_ok(public_content_package, public_manifest):
    if not isinstance(public_content_package, dict) or not isinstance(public_manifest, dict):
        return False
    items = public_content_package.get("items") or []
    manifest_ready = int((public_manifest.get("counts") or {}).get("manifestReady") or 0)
    protected_keys = {
        "_sourceFile",
        "_sourceIndex",
        "sourceType",
        "sourceName",
        "sourceReference",
        "sourceUrl",
        "sourceUsagePolicy",
        "sourceRisk",
        "risk",
        "licenseNote",
        "reviewStatus",
        "publicationStatus",
        "visibility",
        "auditStatus",
        "contentAudit",
        "strict1600Review",
        "publicReviewNote",
        "promotedBy",
        "promotedAt",
        "publicSafetyReasons",
        "neverPublic",
    }
    if public_content_package.get("schemaVersion") != "sat_content_package_v1":
        return False
    if public_content_package.get("contractVersion") != "sat_public_student_contract_v1":
        return False
    if not items or len(items) != manifest_ready:
        return False
    manifest_counts = (public_content_package.get("manifest") or {}).get("counts") or {}
    if protected_keys.intersection(manifest_counts.keys()):
        return False
    for item in items:
        if protected_keys.intersection(item.keys()):
            return False
        if not item.get("id") or not item.get("prompt"):
            return False
    return True


def evaluate_release_inputs(integrity=None, readiness=None, smoke=None, source_texts=None, public_manifest=None, public_content_package=None):
    integrity = integrity or {}
    readiness = readiness or {}
    smoke = smoke or {}
    production_contract = evaluate_production_contract_sources(source_texts)
    summary = integrity.get("summary") or {}
    inventory = (readiness.get("inventory") or {}) if isinstance(readiness, dict) else {}
    ai_signal = smoke.get("aiSignal") or {}
    runtime_errors = smoke.get("runtimeErrors") or []
    diagnostic = smoke.get("diagnostic") or {}
    full_length = smoke.get("fullLength") or {}
    coach = smoke.get("coachDashboard") or {}
    public_counts = public_manifest.get("counts") if isinstance(public_manifest, dict) else {}
    public_items = public_content_package.get("items") if isinstance(public_content_package, dict) else []

    checks = [
        check_item(
            "question integrity report generated",
            bool(summary.get("totalQuestions")),
            f"{summary.get('totalQuestions', 0)} questions audited",
        ),
        check_item(
            "no critical data issues",
            int(summary.get("criticalQuestionCount") or 0) == 0,
            f"{summary.get('criticalQuestionCount', 0)} critical question(s)",
            severity="release_blocker",
        ),
        check_item(
            "SAT 2026 readiness report generated",
            bool(inventory.get("loadedTotal")),
            f"{inventory.get('loadedTotal', 0)} loaded questions; {inventory.get('coreReadyReviewed', 0)} core-ready reviewed",
        ),
        check_item("browser smoke completed", bool(smoke), "browser_smoke_last.log parsed"),
        check_item("browser runtime errors", not runtime_errors, f"{len(runtime_errors)} runtime/log errors", severity="release_blocker"),
        check_item("diagnostic smoke", diagnostic_smoke_ok(diagnostic), "20-question preview and adaptive readiness cards"),
        check_item(
            "full-length smoke",
            full_length.get("totalQuestions") == 98 and full_length.get("moduleCount") == 4 and full_length.get("timerRequired"),
            "98 questions, 4 modules, required timer",
        ),
        check_item(
            "coach/admin operations smoke",
            "Parent Coach Dashboard" in (coach.get("parent", {}).get("text") or "")
            and "Ngân hàng câu hỏi" in (coach.get("admin", {}).get("text") or "")
            and "Tường an toàn public" in (coach.get("admin", {}).get("text") or ""),
            "parent coach dashboard and admin operations center present",
        ),
        check_item(
            "public account source firewall",
            ai_signal.get("publicVisibleDrafts") == 0
            and ai_signal.get("publicPrivateSourceVisible", ai_signal.get("publicKaplanVisible", 0)) == 0
            and ai_signal.get("publicArchiveVisible", 0) == 0,
            "public account cannot see private/generated protected drafts",
            severity="release_blocker",
        ),
        check_item(
            "public source signals hidden",
            "cannot view private source signals" in (ai_signal.get("publicSignalPanel") or ""),
            "private source signal panel hidden from public account",
            severity="release_blocker",
        ),
        check_item(
            "P4 production readiness contract",
            production_contract["ok"],
            f"{len(production_contract['checks']) - len(production_contract['failed'])}/{len(production_contract['checks'])} static production gate(s)",
            severity="release_blocker",
        ),
        check_item(
            "public manifest artifact ready",
            public_manifest_artifact_ok(public_manifest),
            f"{public_counts.get('manifestReady', 0) if isinstance(public_counts, dict) else 0} manifest-ready public question(s)",
            severity="release_blocker",
        ),
        check_item(
            "public content package artifact ready",
            public_content_package_ok(public_content_package, public_manifest),
            f"{len(public_items) if isinstance(public_items, list) else 0} learner-safe public item(s)",
            severity="release_blocker",
        ),
    ]
    blocking_failed = [item for item in checks if not item["ok"] and item["severity"] == "release_blocker"]
    required_failed = [item for item in checks if not item["ok"]]
    return {
        "contractVersion": RELEASE_CONTRACT_VERSION,
        "ok": not blocking_failed,
        "releaseReady": not required_failed,
        "productionContract": production_contract,
        "blockingFailed": blocking_failed,
        "failed": required_failed,
        "checks": checks,
    }


def format_report(report):
    lines = [
        "# SAT Studio Release Checklist",
        "",
        f"Contract: {report['contractVersion']}",
        f"Blocking status: {'PASS' if report['ok'] else 'BLOCKED'}",
        f"Release ready: {'YES' if report['releaseReady'] else 'NO'}",
        "",
    ]
    for item in report["checks"]:
        mark = "PASS" if item["ok"] else "FAIL"
        lines.append(f"- [{mark}] {item['name']}: {item['detail']}")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Summarize SAT Studio release readiness from generated quality/smoke artifacts.")
    parser.add_argument("--strict", action="store_true", help="Exit nonzero when any release checklist item fails.")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of a Markdown summary.")
    args = parser.parse_args()

    report = evaluate_release_inputs(
        integrity=load_json(INTEGRITY_REPORT),
        readiness=load_json(READINESS_REPORT),
        smoke=load_json(SMOKE_REPORT),
        public_manifest=load_json(PUBLIC_MANIFEST_ARTIFACT),
        public_content_package=load_json(PUBLIC_CONTENT_PACKAGE),
    )
    print(json.dumps(report, indent=2) if args.json else format_report(report))
    if args.strict and not report["releaseReady"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
