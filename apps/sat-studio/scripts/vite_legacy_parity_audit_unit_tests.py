import importlib.util
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODULE_PATH = os.path.join(ROOT, "scripts", "audit_vite_legacy_parity.py")

spec = importlib.util.spec_from_file_location("audit_vite_legacy_parity", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


def run():
    audit = module.build_audit()
    summary = audit["summary"]
    assert audit["schemaVersion"] == "vite_legacy_parity_audit_v1"
    assert summary["requiredBlockers"] == 0, audit["blockers"]
    assert summary["requiredFeatures"] >= 10
    assert any(feature["id"] == "learning_event_logging" and feature["status"] == "vite_owned" for feature in audit["features"])
    assert summary["missingEvidence"] == 0
    assert summary["legacyOnly"] == 0
    assert all(feature["status"] == "vite_owned" for feature in audit["features"])


if __name__ == "__main__":
    run()
    print("vite_legacy_parity_audit_unit_tests: pass")
