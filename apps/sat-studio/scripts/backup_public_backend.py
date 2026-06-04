import argparse
import json
import os
import shutil
import sys
import time


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from sat_public_backend import DEFAULT_DB_PATH, SatPublicBackend


def timestamp_slug():
    return time.strftime("%Y%m%d-%H%M%S", time.gmtime())


def prune_backups(directory, keep):
    if keep <= 0 or not os.path.isdir(directory):
        return []
    entries = []
    for name in os.listdir(directory):
        if name.startswith("sat-public-backup-") and (name.endswith(".json") or name.endswith(".sqlite3")):
            path = os.path.join(directory, name)
            entries.append((os.path.getmtime(path), path))
    entries.sort(reverse=True)
    removed = []
    for _, path in entries[keep:]:
        os.remove(path)
        removed.append(path)
    return removed


def main():
    parser = argparse.ArgumentParser(description="Create a sanitized SAT Studio public backend backup.")
    parser.add_argument("--db", default=os.environ.get("SAT_STUDIO_PUBLIC_DB", DEFAULT_DB_PATH), help="SQLite database path.")
    parser.add_argument("--out-dir", default=os.path.join(ROOT, "data", "public-backups"), help="Backup output directory.")
    parser.add_argument("--keep", type=int, default=30, help="How many backup artifacts to keep.")
    parser.add_argument("--copy-sqlite", action="store_true", help="Also copy the SQLite file for disaster recovery.")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    backend = SatPublicBackend(args.db)
    stamp = timestamp_slug()
    snapshot = backend.export_system_snapshot()
    json_path = os.path.join(args.out_dir, f"sat-public-backup-{stamp}.json")
    with open(json_path, "w", encoding="utf-8") as file:
        json.dump(snapshot, file, ensure_ascii=True, indent=2, sort_keys=True)

    sqlite_path = ""
    if args.copy_sqlite and os.path.exists(args.db):
        sqlite_path = os.path.join(args.out_dir, f"sat-public-backup-{stamp}.sqlite3")
        shutil.copy2(args.db, sqlite_path)

    removed = prune_backups(args.out_dir, args.keep)
    print(
        json.dumps(
            {
                "ok": True,
                "jsonBackup": json_path,
                "sqliteBackup": sqlite_path,
                "accounts": len(snapshot.get("accounts", [])),
                "progressRecords": len(snapshot.get("progressRecords", [])),
                "questionAudits": len(snapshot.get("questionAudits", [])),
                "removedOldBackups": len(removed),
            },
            ensure_ascii=True,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
