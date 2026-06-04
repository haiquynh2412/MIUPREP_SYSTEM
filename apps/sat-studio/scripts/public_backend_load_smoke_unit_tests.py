import os
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.public_backend_load_smoke import run_load_smoke


def run():
    with tempfile.TemporaryDirectory() as tmp:
        report = run_load_smoke(os.path.join(tmp, "load.sqlite3"), workers=3, operations=12)
    assert report["ok"], report
    assert report["operationsCompleted"] == 12
    assert report["progressRecords"] == 12
    assert report["sqlite"]["journalMode"] == "WAL"


if __name__ == "__main__":
    run()
    print("public_backend_load_smoke_unit_tests: pass")
