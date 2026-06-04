import argparse
import json
import os
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sat_public_app import create_rate_limiter
from sat_public_backend import (
    SCHEMA_VERSION,
    SatPublicBackend,
    migration_readiness_payload,
)


REQUIRED_FILES = [
    "Dockerfile.public",
    ".dockerignore",
    ".env.public.example",
    "PUBLIC_BACKEND.md",
    "scripts/backup_public_backend.py",
    "scripts/check_public_backend_health.py",
    "scripts/restore_public_backend_backup.py",
    "scripts/public_backend_load_smoke.py",
    "scripts/check_postgres_migration_artifact.py",
    "scripts/verify_public_domain.py",
    "migrations/postgresql/0010_teacher_classroom_v2.sql",
]


def check_item(name, ok, detail="", severity="release_blocker"):
    return {
        "name": name,
        "ok": bool(ok),
        "detail": detail,
        "severity": severity,
    }


def read_text(path):
    path = ROOT / path
    return path.read_text(encoding="utf-8") if path.exists() else ""


def check_postgresql_guard():
    with tempfile.TemporaryDirectory() as tmp:
        try:
            SatPublicBackend(str(Path(tmp) / "guard.sqlite3"), database_url="postgresql://example")
        except RuntimeError as error:
            return "PostgreSQL DATABASE_URL" in str(error)
    return False


def check_redis_rate_limit_guard():
    old_value = os.environ.get("SAT_STUDIO_RATE_LIMIT_BACKEND")
    os.environ["SAT_STUDIO_RATE_LIMIT_BACKEND"] = "redis"
    try:
        create_rate_limiter()
    except RuntimeError as error:
        return "SAT_STUDIO_REDIS_URL" in str(error) or "redis is not installed" in str(error)
    finally:
        if old_value is None:
            os.environ.pop("SAT_STUDIO_RATE_LIMIT_BACKEND", None)
        else:
            os.environ["SAT_STUDIO_RATE_LIMIT_BACKEND"] = old_value
    return False


def evaluate_deploy_readiness():
    env_example = read_text(".env.public.example")
    docs = read_text("PUBLIC_BACKEND.md")
    dockerfile = read_text("Dockerfile.public")
    migration = migration_readiness_payload("")
    checks = [
        check_item(
            "required production files",
            all((ROOT / path).exists() for path in REQUIRED_FILES),
            ", ".join(path for path in REQUIRED_FILES if not (ROOT / path).exists()) or "all required files present",
        ),
        check_item(
            "sqlite pilot settings",
            migration["ok"]
            and migration["engine"] == "sqlite"
            and migration["sqlite"]["journalMode"] == "WAL"
            and float(migration["sqlite"]["timeoutSeconds"]) >= 30.0,
            f"schema={SCHEMA_VERSION}, journal={migration['sqlite']['journalMode']}, timeout={migration['sqlite']['timeoutSeconds']}",
        ),
        check_item(
            "postgresql scale-out guard",
            check_postgresql_guard()
            and "postgresql_adapter_disabled" in migration_readiness_payload("postgresql://example")["blockers"]
            and (ROOT / "migrations" / "postgresql" / f"{SCHEMA_VERSION}.sql").exists(),
            "PostgreSQL URL fails fast unless explicitly enabled; migration artifact is present for managed Postgres.",
        ),
        check_item(
            "rate limiter production guard",
            check_redis_rate_limit_guard()
            and "SAT_STUDIO_RATE_LIMIT_BACKEND=memory" in env_example
            and "SAT_STUDIO_RATE_LIMIT_MAX_BUCKETS=" in env_example,
            "In-memory limiter is explicit; Redis config requires a real Redis URL.",
        ),
        check_item(
            "observability template",
            "SAT_STUDIO_ACCESS_LOG_JSONL=" in env_example
            and "SAT_STUDIO_METRICS_MAX_PATHS=" in env_example,
            "JSONL request logging and metrics retention settings are present.",
        ),
        check_item(
            "secure cookie deploy template",
            "SAT_STUDIO_SESSION_COOKIE_SECURE=true" in env_example
            and "SAT_STUDIO_SESSION_COOKIE_SAMESITE=Lax" in env_example
            and "SAT_STUDIO_ALLOWED_ORIGINS=https://" in env_example,
            "production cookie and origin defaults are present.",
        ),
        check_item(
            "container deploy target",
            "python:3.12-slim" in dockerfile
            and "requirements-public.txt" in dockerfile
            and "scripts/run_public_backend.py" in dockerfile,
            "Dockerfile.public builds the FastAPI public backend.",
        ),
        check_item(
            "restore and load-drill docs",
            "restore_public_backend_backup.py" in docs
            and "public_backend_load_smoke.py" in docs
            and "check_public_deploy_readiness.py" in docs,
            "deployment docs mention readiness, restore, and load smoke drills.",
        ),
        check_item(
            "production domain verification",
            "verify_public_domain.py" in docs,
            "deployment docs mention HTTPS/public-domain verification.",
        ),
    ]
    failed = [item for item in checks if not item["ok"] and item["severity"] == "release_blocker"]
    return {
        "ok": not failed,
        "checkedAt": os.environ.get("SAT_STUDIO_READINESS_CHECKED_AT", ""),
        "schemaVersion": SCHEMA_VERSION,
        "migrationReadiness": migration,
        "checks": checks,
        "failed": failed,
    }


def main():
    parser = argparse.ArgumentParser(description="Check SAT Studio public deployment readiness guardrails.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    args = parser.parse_args()
    report = evaluate_deploy_readiness()
    print(json.dumps(report, ensure_ascii=False, indent=2) if args.json else json.dumps(report, ensure_ascii=False))
    raise SystemExit(0 if report["ok"] else 1)


if __name__ == "__main__":
    main()
