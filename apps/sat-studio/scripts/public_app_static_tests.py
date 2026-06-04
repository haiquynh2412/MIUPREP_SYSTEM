from pathlib import Path
import os
import sys


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sat_public_app import InMemoryRateLimiter, PublicBackendMetrics, RedisRateLimiter, create_rate_limiter


def run():
    source = (ROOT / "sat_public_app.py").read_text(encoding="utf-8")
    assert "def create_app" in source
    assert "class InMemoryRateLimiter" in source
    assert "def create_rate_limiter" in source
    assert "class RedisRateLimiter" in source
    assert "class PublicBackendMetrics" in source
    assert '@app.get("/api/public/ops/metrics")' in source
    assert "SAT_STUDIO_ACCESS_LOG_JSONL" in source
    assert "SAT_STUDIO_RATE_LIMIT_BACKEND" in source
    assert "def prune" in source
    assert "SAT_STUDIO_RATE_LIMIT_MAX_BUCKETS" in source
    assert "SESSION_COOKIE_NAME" in source
    assert "CSRF_COOKIE_NAME" in source
    assert "CSRF_HEADER_NAME" in source
    assert "Set-Cookie" in source
    assert "csrf_cookie_value" in source
    assert "clear_session_cookie_value" in source
    assert "clear_csrf_cookie_value" in source
    assert '@app.middleware("http")' in source
    assert "status_code=429" in source
    assert "Retry-After" in source
    assert 'FastAPI(' in source
    assert '@app.get("/api/public/health")' in source
    assert '@app.post("/api/public/bootstrap"' in source
    assert '@app.post("/api/public/signup"' in source
    assert '@app.post("/api/public/login")' in source
    assert '@app.post("/api/public/session/refresh")' in source
    assert '@app.post("/api/public/logout")' in source
    assert '@app.get("/api/public/sync-contract")' in source
    assert '@app.post("/api/public/accounts"' in source
    assert '@app.get("/api/public/accounts")' in source
    assert '@app.post("/api/public/accounts/{account_id}/status")' in source
    assert '@app.post("/api/public/progress")' in source
    assert '@app.post("/api/public/profile")' in source
    assert '@app.get("/api/public/profile")' in source
    assert '@app.post("/api/public/question-audits"' in source
    assert '@app.get("/api/public/question-reviews")' in source
    assert '@app.post("/api/public/question-reviews"' in source
    assert '@app.get("/api/public/classes")' in source
    assert '@app.post("/api/public/classes"' in source
    assert '@app.post("/api/public/classes/join")' in source
    assert '@app.get("/api/public/classes/{class_id}/assignments")' in source
    assert '@app.post("/api/public/classes/{class_id}/assignments"' in source
    assert '@app.get("/api/public/classes/{class_id}/report")' in source
    assert '@app.post("/api/public/assignments/{assignment_id}/evidence")' in source
    assert '@app.get("/api/public/content-package")' in source
    assert '@app.post("/api/public/content-package")' in source
    assert '@app.post("/api/public/question-audits/{audit_id}/resolve")' in source
    assert '@app.get("/api/public/schema-version")' in source
    assert '@app.get("/api/public/export")' in source
    assert '@app.get("/api/public/monitoring")' in source
    assert '@app.post("/api/public/maintenance/purge-sessions")' in source
    assert 'app.mount("/", StaticFiles' in source

    runner = (ROOT / "scripts" / "run_public_backend.py").read_text(encoding="utf-8")
    assert "uvicorn.run" in runner
    assert "requirements-public.txt" in runner

    limiter = InMemoryRateLimiter(limit=2, window_seconds=10, auth_limit=1, max_buckets=2)
    limiter.buckets = {
        "expired": [1.0],
        "fresh-old": [91.0],
        "fresh-new": [99.0],
    }
    limiter.prune(now=100.0)
    assert "expired" not in limiter.buckets
    assert set(limiter.buckets) == {"fresh-old", "fresh-new"}
    limiter.buckets["fresh-third"] = [100.0]
    limiter.prune(now=101.0)
    assert len(limiter.buckets) == 2

    old_backend = os.environ.get("SAT_STUDIO_RATE_LIMIT_BACKEND")
    os.environ["SAT_STUDIO_RATE_LIMIT_BACKEND"] = "redis"
    try:
        try:
            create_rate_limiter()
        except RuntimeError as error:
            assert "SAT_STUDIO_REDIS_URL" in str(error)
        else:
            raise AssertionError("expected redis rate limiter guard to fail fast")
    finally:
        if old_backend is None:
            os.environ.pop("SAT_STUDIO_RATE_LIMIT_BACKEND", None)
        else:
            os.environ["SAT_STUDIO_RATE_LIMIT_BACKEND"] = old_backend

    class FakeRedis:
        def __init__(self):
            self.values = {}
            self.ttls = {}

        def incr(self, key):
            self.values[key] = self.values.get(key, 0) + 1
            return self.values[key]

        def expire(self, key, seconds):
            self.ttls[key] = int(seconds)

        def ttl(self, key):
            return self.ttls.get(key, 60)

    redis_limiter = RedisRateLimiter("redis://unit", limit=2, window_seconds=60, auth_limit=1, client=FakeRedis())
    assert redis_limiter.check("client", "/api/public/progress") == (True, 0)
    assert redis_limiter.check("client", "/api/public/progress") == (True, 0)
    allowed, retry_after = redis_limiter.check("client", "/api/public/progress")
    assert allowed is False
    assert retry_after >= 1

    metrics = PublicBackendMetrics()
    metrics.record("/api/public/health", "GET", 200, 12.5)
    metrics.record("/api/public/health", "GET", 500, 25)
    snapshot = metrics.snapshot(rate_limit_backend="memory")
    assert snapshot["requests"]["total"] == 2
    assert snapshot["requests"]["serverErrors"] == 1
    assert snapshot["paths"]["GET /api/public/health"]["count"] == 2


if __name__ == "__main__":
    run()
    print("public_app_static_tests: pass")
