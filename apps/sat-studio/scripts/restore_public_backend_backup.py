import argparse
import json
import os
import shutil
import sqlite3
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sat_public_backend import PUBLIC_BACKEND_TABLES, SCHEMA_VERSION, SatPublicBackend


REQUIRED_SNAPSHOT_COLLECTIONS = [
    "accounts",
    "progressRecords",
    "profileRecords",
    "questionAudits",
    "questionReviewVersions",
    "classes",
    "classMemberships",
    "classAssignments",
    "assignmentEvidence",
    "contentPackages",
    "auditLog",
]
SENSITIVE_KEYS = {"passwordHash", "password_hash", "passwordSalt", "password_salt"}


def load_snapshot(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def walk_sensitive_keys(value, path="$"):
    findings = []
    if isinstance(value, dict):
        for key, nested in value.items():
            next_path = f"{path}.{key}"
            if key in SENSITIVE_KEYS:
                findings.append(next_path)
            findings.extend(walk_sensitive_keys(nested, next_path))
    elif isinstance(value, list):
        for index, nested in enumerate(value):
            findings.extend(walk_sensitive_keys(nested, f"{path}[{index}]"))
    return findings


def validate_snapshot(snapshot):
    schema = snapshot.get("schema") or {}
    missing = [key for key in REQUIRED_SNAPSHOT_COLLECTIONS if key not in snapshot]
    sensitive = walk_sensitive_keys(snapshot)
    counts = {
        key: len(snapshot.get(key) or [])
        for key in REQUIRED_SNAPSHOT_COLLECTIONS
        if isinstance(snapshot.get(key), list)
    }
    issues = []
    if schema.get("currentVersion") != SCHEMA_VERSION:
        issues.append(f"schema version mismatch: {schema.get('currentVersion')} != {SCHEMA_VERSION}")
    if missing:
        issues.append(f"missing collections: {', '.join(missing)}")
    if sensitive:
        issues.append(f"sanitized JSON contains sensitive password fields: {', '.join(sensitive[:5])}")
    return {
        "ok": not issues,
        "schemaVersion": schema.get("currentVersion") or "",
        "counts": counts,
        "issues": issues,
    }


def validate_sqlite_copy(path):
    path = Path(path)
    if not path.exists():
        return {"ok": False, "issues": [f"SQLite copy not found: {path}"], "tables": []}
    issues = []
    connection = None
    tables = []
    try:
        connection = sqlite3.connect(str(path))
        rows = connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'").fetchall()
        tables = sorted(row[0] for row in rows)
        missing = [table for table in PUBLIC_BACKEND_TABLES if table not in tables]
        if missing:
            issues.append(f"SQLite copy is missing tables: {', '.join(missing)}")
        version_row = connection.execute("SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1").fetchone()
        if not version_row or version_row[0] != SCHEMA_VERSION:
            issues.append(f"SQLite copy schema mismatch: {version_row[0] if version_row else 'none'} != {SCHEMA_VERSION}")
    except sqlite3.Error as error:
        issues.append(str(error))
    finally:
        if connection is not None:
            connection.close()
    return {"ok": not issues, "issues": issues, "tables": tables}


def restore_sqlite_copy(sqlite_copy, restore_db, overwrite=False):
    source = Path(sqlite_copy)
    target = Path(restore_db)
    if target.exists() and not overwrite:
        raise RuntimeError(f"Restore target already exists: {target}. Pass --overwrite to replace it.")
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        target.unlink()
    shutil.copy2(source, target)
    SatPublicBackend(str(target))
    return str(target)


def main():
    parser = argparse.ArgumentParser(description="Validate or restore a SAT Studio public backend backup.")
    parser.add_argument("--backup-json", required=True, help="Sanitized JSON backup produced by backup_public_backend.py.")
    parser.add_argument("--sqlite-copy", help="Optional SQLite copy produced with --copy-sqlite.")
    parser.add_argument("--restore-db", help="Target SQLite DB path when using --apply.")
    parser.add_argument("--apply", action="store_true", help="Actually restore --sqlite-copy into --restore-db.")
    parser.add_argument("--overwrite", action="store_true", help="Allow replacing an existing --restore-db target.")
    args = parser.parse_args()

    snapshot = load_snapshot(args.backup_json)
    snapshot_report = validate_snapshot(snapshot)
    sqlite_report = validate_sqlite_copy(args.sqlite_copy) if args.sqlite_copy else {"ok": None, "issues": [], "tables": []}
    restored_to = ""
    issues = list(snapshot_report["issues"]) + list(sqlite_report["issues"])
    if args.apply:
        if not args.sqlite_copy or not args.restore_db:
            issues.append("--apply requires both --sqlite-copy and --restore-db.")
        elif snapshot_report["ok"] and sqlite_report["ok"]:
            try:
                restored_to = restore_sqlite_copy(args.sqlite_copy, args.restore_db, overwrite=args.overwrite)
            except Exception as error:
                issues.append(str(error))
    report = {
        "ok": not issues,
        "applied": bool(args.apply and restored_to),
        "restoredTo": restored_to,
        "snapshot": snapshot_report,
        "sqliteCopy": sqlite_report,
        "issues": issues,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["ok"] else 1)


if __name__ == "__main__":
    main()
