import json

import check_public_backend_health as health_check


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, _exc_type, _exc, _tb):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


def fake_opener_factory(calls, responses):
    def opener(request, timeout=10):
        calls.append({"url": request.full_url, "headers": dict(request.header_items()), "timeout": timeout})
        payload = responses.get(request.full_url)
        if payload is None:
            raise AssertionError(f"Unexpected URL: {request.full_url}")
        return FakeResponse(payload)

    return opener


def run():
    assert health_check.normalize_base_url("http://x/api/public/") == "http://x/api/public"
    assert health_check.endpoint_url("http://x/api/public/", "/health") == "http://x/api/public/health"

    calls = []
    base_url = "http://test/api/public"
    report = health_check.build_report(
        base_url,
        token="token-1",
        thresholds={"min_admins": 1, "max_open_audits": 5, "max_db_mb": 1},
        opener=fake_opener_factory(
            calls,
            {
                "http://test/api/public/health": {"ok": True, "adminCount": 1},
                "http://test/api/public/monitoring": {
                    "counts": {"openQuestionAudits": 3},
                    "database": {"sizeBytes": 512},
                },
            },
        ),
    )
    assert report["ok"] is True
    assert calls[1]["headers"]["Authorization"] == "Bearer token-1"

    failing = health_check.evaluate_report(
        {
            "health": {"ok": True, "adminCount": 0},
            "monitoring": {"counts": {"openQuestionAudits": 8}, "database": {"sizeBytes": 3 * 1024 * 1024}},
        },
        {"min_admins": 1, "max_open_audits": 5, "max_db_mb": 2},
    )
    assert failing["ok"] is False
    assert "admin_count_below_1" in failing["issues"]
    assert "open_audits_above_5" in failing["issues"]
    assert "db_size_above_2mb" in failing["issues"]

    webhook_calls = []
    sent = health_check.post_webhook(
        "http://hook",
        {"ok": False},
        opener=fake_opener_factory(webhook_calls, {"http://hook": {"ok": True}}),
    )
    assert sent is True
    assert webhook_calls[0]["url"] == "http://hook"


if __name__ == "__main__":
    run()
    print("public_health_check_unit_tests: pass")
