from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.check_postgres_migration_artifact import MIGRATION_PATH, validate_postgres_migration
from sat_public_backend import migration_readiness_payload, translate_postgresql_sql


def run():
    sql_text = MIGRATION_PATH.read_text(encoding="utf-8")
    report = validate_postgres_migration(sql_text)
    assert report["ok"], report
    assert report["statementCount"] >= 25
    translated = translate_postgresql_sql("SELECT * FROM accounts WHERE id = ? AND role = ?")
    assert translated == "SELECT * FROM accounts WHERE id = %s AND role = %s"
    schema_insert = translate_postgresql_sql("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)")
    assert "ON CONFLICT (version) DO NOTHING" in schema_insert
    postgres_readiness = migration_readiness_payload("postgresql://example")
    assert "postgresql_adapter_disabled" in postgres_readiness["blockers"]


if __name__ == "__main__":
    run()
    print("public_postgres_migration_unit_tests: pass")
