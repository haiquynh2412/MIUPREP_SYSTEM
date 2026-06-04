from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.verify_public_domain import verify_public_domain


class FakeResponse:
    def __init__(self, payload, status=200):
        self.payload = payload
        self.status = status
        self.headers = {"server": "unit"}

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        import json

        return json.dumps(self.payload).encode("utf-8")


def run():
    import urllib.request

    original = urllib.request.urlopen

    def fake_urlopen(_request, timeout=10):
        return FakeResponse(
            {
                "ok": True,
                "features": {
                    "httpOnlyCookieAuth": True,
                    "csrfProtection": True,
                    "rbac": True,
                    "contentPackageApi": True,
                    "postgresqlUpgradeGuard": True,
                },
                "migrationReadiness": {"ok": True, "blockers": []},
            }
        )

    urllib.request.urlopen = fake_urlopen
    try:
        report = verify_public_domain("https://sat.example.com")
        assert report["ok"], report
        local = verify_public_domain("http://127.0.0.1:8765", allow_http=True)
        assert local["ok"], local
        blocked = verify_public_domain("http://sat.example.com")
        assert blocked["ok"] is False
        assert "HTTPS" in blocked["issues"][0]
    finally:
        urllib.request.urlopen = original


if __name__ == "__main__":
    run()
    print("public_domain_verify_unit_tests: pass")
