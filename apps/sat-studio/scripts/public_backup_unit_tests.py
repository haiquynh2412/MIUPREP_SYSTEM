import json
import os
import subprocess
import sys
import tempfile


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from sat_public_backend import SatPublicBackend


def run():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = os.path.join(tmp, "sat_public.sqlite3")
        out_dir = os.path.join(tmp, "backups")
        backend = SatPublicBackend(db_path)
        backend.handle_http(
            "POST",
            "/api/public/bootstrap",
            body=b'{"username":"admin","password":"AdminPass123","displayName":"Admin"}',
        )
        result = subprocess.run(
            [
                sys.executable,
                os.path.join(ROOT, "scripts", "backup_public_backend.py"),
                "--db",
                db_path,
                "--out-dir",
                out_dir,
                "--copy-sqlite",
                "--keep",
                "4",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        assert payload["ok"]
        assert payload["accounts"] == 1
        assert os.path.exists(payload["jsonBackup"])
        assert os.path.exists(payload["sqliteBackup"])
        with open(payload["jsonBackup"], "r", encoding="utf-8") as file:
            snapshot = json.load(file)
        assert snapshot["accounts"][0]["username"] == "admin"
        assert "passwordHash" not in snapshot["accounts"][0]
        assert "password_hash" not in snapshot["accounts"][0]


if __name__ == "__main__":
    run()
    print("public_backup_unit_tests: pass")
