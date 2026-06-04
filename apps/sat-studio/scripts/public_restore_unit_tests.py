import json
import os
import subprocess
import sys
import tempfile


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from sat_public_backend import SatPublicBackend
from scripts.restore_public_backend_backup import load_snapshot, validate_snapshot, validate_sqlite_copy


def run():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = os.path.join(tmp, "sat_public.sqlite3")
        out_dir = os.path.join(tmp, "backups")
        restore_db = os.path.join(tmp, "restored.sqlite3")
        backend = SatPublicBackend(db_path)
        backend.handle_http(
            "POST",
            "/api/public/bootstrap",
            body=b'{"username":"admin","password":"AdminPass123","displayName":"Admin"}',
        )
        backup_result = subprocess.run(
            [
                sys.executable,
                os.path.join(ROOT, "scripts", "backup_public_backend.py"),
                "--db",
                db_path,
                "--out-dir",
                out_dir,
                "--copy-sqlite",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        backup = json.loads(backup_result.stdout)
        snapshot = load_snapshot(backup["jsonBackup"])
        snapshot_report = validate_snapshot(snapshot)
        sqlite_report = validate_sqlite_copy(backup["sqliteBackup"])
        assert snapshot_report["ok"], snapshot_report
        assert sqlite_report["ok"], sqlite_report

        restore_result = subprocess.run(
            [
                sys.executable,
                os.path.join(ROOT, "scripts", "restore_public_backend_backup.py"),
                "--backup-json",
                backup["jsonBackup"],
                "--sqlite-copy",
                backup["sqliteBackup"],
                "--restore-db",
                restore_db,
                "--apply",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        restore = json.loads(restore_result.stdout)
        assert restore["ok"], restore
        assert restore["applied"]
        assert os.path.exists(restore_db)


if __name__ == "__main__":
    run()
    print("public_restore_unit_tests: pass")
