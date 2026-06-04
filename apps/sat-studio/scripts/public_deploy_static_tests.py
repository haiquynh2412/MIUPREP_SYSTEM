from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run():
    dockerfile = (ROOT / "Dockerfile.public").read_text(encoding="utf-8")
    dockerignore = (ROOT / ".dockerignore").read_text(encoding="utf-8")
    env_example = (ROOT / ".env.public.example").read_text(encoding="utf-8")
    docs = (ROOT / "PUBLIC_BACKEND.md").read_text(encoding="utf-8")

    assert "python:3.12-slim" in dockerfile
    assert "requirements-public.txt" in dockerfile
    assert "scripts/run_public_backend.py" in dockerfile
    assert "SAT_STUDIO_PUBLIC_DB=/app/data/sat_studio_public.sqlite3" in dockerfile
    assert ".env" in dockerignore
    assert "data/*.sqlite3" in dockerignore
    assert "data/*.pdf" in dockerignore
    assert "data/**/*.pdf" in dockerignore
    assert "SAT_STUDIO_ALLOWED_ORIGINS=" in env_example
    assert "SAT_STUDIO_RATE_LIMIT_BACKEND=memory" in env_example
    assert "SAT_STUDIO_RATE_LIMIT_MAX_BUCKETS=" in env_example
    assert "SAT_STUDIO_REDIS_URL=" in env_example
    assert "SAT_STUDIO_ACCESS_LOG_JSONL=" in env_example
    assert "SAT_STUDIO_ENABLE_POSTGRES=false" in env_example
    assert "SAT_STUDIO_SESSION_TTL_SECONDS=" in env_example
    assert "SAT_PUBLIC_HEALTH_WEBHOOK=" in env_example
    assert "docker build -f Dockerfile.public" in docs
    assert "backup_public_backend.py --copy-sqlite" in docs
    assert "restore_public_backend_backup.py" in docs
    assert "check_public_backend_health.py" in docs
    assert "check_public_deploy_readiness.py" in docs
    assert "public_backend_load_smoke.py" in docs
    assert "check_postgres_migration_artifact.py" in docs
    assert "verify_public_domain.py" in docs
    assert "export_public_manifest_artifact.js" in docs
    assert "release_checklist.py --strict" in docs

    requirements = (ROOT / "requirements-public.txt").read_text(encoding="utf-8")
    assert "redis" in requirements
    assert "psycopg" in requirements


if __name__ == "__main__":
    run()
    print("public_deploy_static_tests: pass")
