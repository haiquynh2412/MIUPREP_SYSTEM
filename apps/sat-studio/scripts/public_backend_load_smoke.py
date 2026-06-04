import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
import sys
import tempfile
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sat_public_backend import PublicBackendError, SatPublicBackend


def json_bytes(payload):
    return json.dumps(payload, ensure_ascii=True, sort_keys=True).encode("utf-8")


def bootstrap_student(backend, index):
    username = f"load_student_{index}"
    status, payload = backend.handle_http(
        "POST",
        "/api/public/signup",
        body=json_bytes(
            {
                "username": username,
                "password": "StudentPass123",
                "displayName": f"Load Student {index}",
            }
        ),
    )
    if status != 201:
        raise RuntimeError(f"signup failed for {username}: {status}")
    return payload["account"]["id"], payload["token"]


def run_operation(backend, student, operation_index):
    account_id, token = student
    source = f"load.{account_id[-6:]}.{operation_index}"
    headers = {"Authorization": f"Bearer {token}"}
    status, saved = backend.handle_http(
        "POST",
        "/api/public/progress",
        headers=headers,
        body=json_bytes(
            {
                "accountId": account_id,
                "source": source,
                "progress": {
                    "targetScore": 1600,
                    "attempts": operation_index,
                    "loadSmoke": True,
                },
            }
        ),
    )
    if status != 200:
        raise RuntimeError(f"save progress failed: {status}")
    status, loaded = backend.handle_http(
        "GET",
        f"/api/public/progress?accountId={account_id}&source={source}",
        headers=headers,
    )
    if status != 200 or loaded["progress"].get("attempts") != operation_index:
        raise RuntimeError(f"read-after-write failed for {source}")
    return saved["source"]


def run_load_smoke(db_path, workers=8, operations=80):
    backend = SatPublicBackend(db_path)
    start = time.time()
    backend.handle_http(
        "POST",
        "/api/public/bootstrap",
        body=b'{"username":"load_admin","password":"AdminPass123","displayName":"Load Admin"}',
    )
    students = [bootstrap_student(backend, index) for index in range(max(1, int(workers)))]
    failures = []
    completed = 0
    with ThreadPoolExecutor(max_workers=max(1, int(workers))) as pool:
        futures = [
            pool.submit(run_operation, backend, students[index % len(students)], index)
            for index in range(max(1, int(operations)))
        ]
        for future in as_completed(futures):
            try:
                future.result()
                completed += 1
            except (PublicBackendError, RuntimeError, OSError) as error:
                failures.append(str(error))
    elapsed = time.time() - start
    status, monitoring = backend.handle_http(
        "GET",
        "/api/public/monitoring",
        headers={"Authorization": f"Bearer {backend.login({'username': 'load_admin', 'password': 'AdminPass123'})['token']}"},
    )
    return {
        "ok": not failures and status == 200,
        "workers": int(workers),
        "operationsRequested": int(operations),
        "operationsCompleted": completed,
        "failures": failures[:10],
        "elapsedSeconds": round(elapsed, 3),
        "progressRecords": monitoring.get("counts", {}).get("progressRecords"),
        "sqlite": monitoring.get("migrationReadiness", {}).get("sqlite", {}),
    }


def main():
    parser = argparse.ArgumentParser(description="Run a small concurrent load smoke against the SQLite public backend.")
    parser.add_argument("--db", help="SQLite DB path. Defaults to a temporary DB.")
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--operations", type=int, default=80)
    args = parser.parse_args()
    if args.db:
        report = run_load_smoke(args.db, workers=args.workers, operations=args.operations)
    else:
        with tempfile.TemporaryDirectory() as tmp:
            report = run_load_smoke(os.path.join(tmp, "sat_load.sqlite3"), workers=args.workers, operations=args.operations)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["ok"] else 1)


if __name__ == "__main__":
    main()
