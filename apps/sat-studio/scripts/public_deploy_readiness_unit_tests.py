from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.check_public_deploy_readiness import evaluate_deploy_readiness


def run():
    report = evaluate_deploy_readiness()
    assert report["ok"], report["failed"]
    assert report["migrationReadiness"]["ok"]
    assert report["migrationReadiness"]["engine"] == "sqlite"
    assert report["migrationReadiness"]["postgresql"]["runtimeReady"] is False
    check_names = {item["name"] for item in report["checks"]}
    assert "postgresql scale-out guard" in check_names
    assert "rate limiter production guard" in check_names
    assert "observability template" in check_names
    assert "restore and load-drill docs" in check_names
    assert "production domain verification" in check_names


if __name__ == "__main__":
    run()
    print("public_deploy_readiness_unit_tests: pass")
