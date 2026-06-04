import argparse
import json
import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sat_public_backend import PUBLIC_BACKEND_TABLES, SCHEMA_VERSION, split_sql_script


MIGRATION_PATH = ROOT / "migrations" / "postgresql" / f"{SCHEMA_VERSION}.sql"


def validate_postgres_migration(sql_text):
    lower = sql_text.lower()
    missing_tables = [table for table in PUBLIC_BACKEND_TABLES if f"create table if not exists {table}" not in lower]
    missing_indexes = [
        marker
        for marker in [
            "idx_sessions_account_status",
            "idx_progress_account_source",
            "idx_profile_account_source",
            "idx_classes_teacher_status",
            "idx_assignment_evidence_assignment",
        ]
        if marker not in lower
    ]
    issues = []
    if missing_tables:
        issues.append(f"missing table DDL: {', '.join(missing_tables)}")
    if missing_indexes:
        issues.append(f"missing index DDL: {', '.join(missing_indexes)}")
    if SCHEMA_VERSION not in sql_text:
        issues.append(f"missing schema version marker: {SCHEMA_VERSION}")
    if "on conflict (version) do nothing" not in lower:
        issues.append("missing idempotent schema_migrations insert")
    if "begin;" not in lower or "commit;" not in lower:
        issues.append("migration must be transactional")
    return {
        "ok": not issues,
        "path": str(MIGRATION_PATH),
        "schemaVersion": SCHEMA_VERSION,
        "statementCount": len(split_sql_script(sql_text)),
        "tables": list(PUBLIC_BACKEND_TABLES),
        "issues": issues,
    }


def apply_migration(database_url, sql_text):
    try:
        import psycopg
    except ImportError as error:
        raise RuntimeError("psycopg is not installed. Run: pip install -r requirements-public.txt") from error
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql_text)
        connection.commit()


def main():
    parser = argparse.ArgumentParser(description="Validate or apply the PostgreSQL migration artifact.")
    parser.add_argument("--database-url", default=os.environ.get("SAT_STUDIO_PUBLIC_DATABASE_URL") or os.environ.get("DATABASE_URL") or "")
    parser.add_argument("--apply", action="store_true", help="Apply migration to --database-url.")
    args = parser.parse_args()
    if not MIGRATION_PATH.exists():
        report = {"ok": False, "path": str(MIGRATION_PATH), "issues": ["migration file missing"]}
        print(json.dumps(report, ensure_ascii=False, indent=2))
        raise SystemExit(1)
    sql_text = MIGRATION_PATH.read_text(encoding="utf-8")
    report = validate_postgres_migration(sql_text)
    if args.apply:
        if not args.database_url:
            report["ok"] = False
            report["issues"].append("--apply requires --database-url or SAT_STUDIO_PUBLIC_DATABASE_URL")
        elif report["ok"]:
            try:
                apply_migration(args.database_url, sql_text)
                report["applied"] = True
            except Exception as error:
                report["ok"] = False
                report["issues"].append(str(error))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["ok"] else 1)


if __name__ == "__main__":
    main()
