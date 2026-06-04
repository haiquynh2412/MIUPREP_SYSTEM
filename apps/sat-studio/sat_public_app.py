import hashlib
import json
import os
import time
import uuid

from sat_public_backend import (
    CSRF_COOKIE_NAME,
    CSRF_EXEMPT_PATHS,
    CSRF_HEADER_NAME,
    DEFAULT_DB_PATH,
    SESSION_COOKIE_NAME,
    PublicBackendError,
    SatPublicBackend,
    authorization_bearer_token,
    clear_csrf_cookie_value,
    clear_session_cookie_value,
    csrf_cookie_value,
    new_csrf_token,
    session_cookie_value,
)


try:
    from fastapi import Depends, FastAPI, Header, Request, Response
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from fastapi.staticfiles import StaticFiles
except ImportError:  # pragma: no cover - optional runtime dependency for public deployment.
    Depends = FastAPI = Header = Request = Response = CORSMiddleware = JSONResponse = StaticFiles = None


ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
RATE_LIMIT_BACKEND = os.environ.get("SAT_STUDIO_RATE_LIMIT_BACKEND", "memory").strip().lower() or "memory"

try:
    import redis
except ImportError:  # pragma: no cover - optional production dependency.
    redis = None


class InMemoryRateLimiter:
    def __init__(self, limit=120, window_seconds=60, auth_limit=20, max_buckets=50000):
        self.limit = int(limit)
        self.window_seconds = int(window_seconds)
        self.auth_limit = int(auth_limit)
        self.max_buckets = int(max_buckets)
        self.last_pruned_at = 0.0
        self.buckets = {}

    def limit_for_path(self, path):
        if path.endswith("/login") or path.endswith("/bootstrap"):
            return self.auth_limit
        return self.limit

    def check(self, key, path):
        now = time.time()
        if now - self.last_pruned_at >= self.window_seconds:
            self.prune(now)
        limit = self.limit_for_path(path)
        window_start = now - self.window_seconds
        bucket = [stamp for stamp in self.buckets.get(key, []) if stamp >= window_start]
        if len(bucket) >= limit:
            self.buckets[key] = bucket
            return False, max(1, int(bucket[0] + self.window_seconds - now))
        bucket.append(now)
        self.buckets[key] = bucket
        return True, 0

    def prune(self, now=None):
        now = now or time.time()
        window_start = now - self.window_seconds
        compacted = {}
        for key, bucket in self.buckets.items():
            fresh = [stamp for stamp in bucket if stamp >= window_start]
            if fresh:
                compacted[key] = fresh
        if len(compacted) > self.max_buckets:
            oldest_first = sorted(compacted.items(), key=lambda item: item[1][-1])
            compacted = dict(oldest_first[-self.max_buckets :])
        self.buckets = compacted
        self.last_pruned_at = now


class RedisRateLimiter:
    def __init__(
        self,
        url,
        limit=120,
        window_seconds=60,
        auth_limit=20,
        prefix="sat-studio:public-rate",
        client=None,
        fail_closed=True,
    ):
        if client is None and redis is None:
            raise RuntimeError("redis is not installed. Run: pip install -r requirements-public.txt")
        self.limit = int(limit)
        self.window_seconds = int(window_seconds)
        self.auth_limit = int(auth_limit)
        self.prefix = str(prefix or "sat-studio:public-rate").strip(":")
        self.fail_closed = bool(fail_closed)
        self.client = client or redis.Redis.from_url(url, decode_responses=True, socket_timeout=2, socket_connect_timeout=2)

    def limit_for_path(self, path):
        if path.endswith("/login") or path.endswith("/bootstrap"):
            return self.auth_limit
        return self.limit

    def cache_key(self, key, path):
        digest = hashlib.sha256(f"{key}:{path}".encode("utf-8")).hexdigest()
        window = int(time.time() // self.window_seconds)
        return f"{self.prefix}:{window}:{digest}"

    def check(self, key, path):
        limit = self.limit_for_path(path)
        redis_key = self.cache_key(key, path)
        try:
            count = int(self.client.incr(redis_key))
            if count == 1:
                self.client.expire(redis_key, self.window_seconds + 1)
            if count > limit:
                ttl = int(self.client.ttl(redis_key))
                return False, max(1, ttl if ttl > 0 else self.window_seconds)
            return True, 0
        except Exception:
            if self.fail_closed:
                return False, self.window_seconds
            return True, 0


class PublicBackendMetrics:
    def __init__(self, max_path_stats=200):
        self.started_at = time.time()
        self.total_requests = 0
        self.error_count = 0
        self.total_latency_ms = 0.0
        self.max_path_stats = int(max_path_stats)
        self.path_stats = {}

    def record(self, path, method, status_code, latency_ms):
        self.total_requests += 1
        self.total_latency_ms += float(latency_ms)
        if int(status_code or 0) >= 500:
            self.error_count += 1
        key = f"{method} {path}"
        stats = self.path_stats.get(key, {"count": 0, "errors": 0, "totalLatencyMs": 0.0, "maxLatencyMs": 0.0})
        stats["count"] += 1
        stats["totalLatencyMs"] += float(latency_ms)
        stats["maxLatencyMs"] = max(float(stats["maxLatencyMs"]), float(latency_ms))
        if int(status_code or 0) >= 500:
            stats["errors"] += 1
        self.path_stats[key] = stats
        if len(self.path_stats) > self.max_path_stats:
            oldest_key = next(iter(self.path_stats))
            self.path_stats.pop(oldest_key, None)

    def snapshot(self, rate_limit_backend="memory"):
        average_latency = self.total_latency_ms / self.total_requests if self.total_requests else 0.0
        return {
            "ok": True,
            "startedAtUnix": int(self.started_at),
            "uptimeSeconds": int(time.time() - self.started_at),
            "rateLimitBackend": rate_limit_backend,
            "requests": {
                "total": self.total_requests,
                "serverErrors": self.error_count,
                "averageLatencyMs": round(average_latency, 3),
            },
            "paths": {
                key: {
                    "count": value["count"],
                    "errors": value["errors"],
                    "averageLatencyMs": round(value["totalLatencyMs"] / value["count"], 3) if value["count"] else 0,
                    "maxLatencyMs": round(value["maxLatencyMs"], 3),
                }
                for key, value in sorted(self.path_stats.items())
            },
        }


def append_jsonl(path, payload):
    if not path:
        return
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "a", encoding="utf-8") as file:
        file.write(json.dumps(payload, ensure_ascii=False, sort_keys=True) + "\n")


def configured_rate_limit_backend():
    return os.environ.get("SAT_STUDIO_RATE_LIMIT_BACKEND", RATE_LIMIT_BACKEND).strip().lower() or "memory"


def create_rate_limiter():
    rate_limit_backend = configured_rate_limit_backend()
    if rate_limit_backend == "memory":
        return InMemoryRateLimiter(
            limit=os.environ.get("SAT_STUDIO_RATE_LIMIT", 120),
            window_seconds=os.environ.get("SAT_STUDIO_RATE_WINDOW_SECONDS", 60),
            auth_limit=os.environ.get("SAT_STUDIO_AUTH_RATE_LIMIT", 20),
            max_buckets=os.environ.get("SAT_STUDIO_RATE_LIMIT_MAX_BUCKETS", 50000),
        )
    if rate_limit_backend == "redis":
        redis_url = os.environ.get("SAT_STUDIO_REDIS_URL") or os.environ.get("REDIS_URL")
        if not redis_url:
            raise RuntimeError("SAT_STUDIO_RATE_LIMIT_BACKEND=redis requires SAT_STUDIO_REDIS_URL or REDIS_URL.")
        return RedisRateLimiter(
            redis_url,
            limit=os.environ.get("SAT_STUDIO_RATE_LIMIT", 120),
            window_seconds=os.environ.get("SAT_STUDIO_RATE_WINDOW_SECONDS", 60),
            auth_limit=os.environ.get("SAT_STUDIO_AUTH_RATE_LIMIT", 20),
            prefix=os.environ.get("SAT_STUDIO_RATE_LIMIT_REDIS_PREFIX", "sat-studio:public-rate"),
            fail_closed=os.environ.get("SAT_STUDIO_RATE_LIMIT_REDIS_FAIL_CLOSED", "true").strip().lower() in {"1", "true", "yes", "on"},
        )
    raise RuntimeError("Unsupported SAT_STUDIO_RATE_LIMIT_BACKEND. Use memory, or enable a supported distributed adapter.")


def require_fastapi():
    if FastAPI is None:
        raise RuntimeError("FastAPI is not installed. Run: pip install -r requirements-public.txt")


def create_app(db_path=None, static_root=ROOT_DIR):
    require_fastapi()
    backend = SatPublicBackend(db_path or os.environ.get("SAT_STUDIO_PUBLIC_DB") or DEFAULT_DB_PATH)
    limiter = create_rate_limiter()
    metrics = PublicBackendMetrics(max_path_stats=os.environ.get("SAT_STUDIO_METRICS_MAX_PATHS", 200))
    access_log_path = os.environ.get("SAT_STUDIO_ACCESS_LOG_JSONL", "").strip()
    app = FastAPI(
        title="SAT Studio Public API",
        version="0.1.0",
        description="Public backend for SAT Studio accounts, progress, permissions, and question audits.",
    )
    app.state.sat_studio_rate_limit_backend = configured_rate_limit_backend()
    app.state.sat_studio_metrics = metrics

    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.environ.get("SAT_STUDIO_ALLOWED_ORIGINS", "http://127.0.0.1:8765,http://localhost:8765").split(","),
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", CSRF_HEADER_NAME],
    )

    @app.middleware("http")
    async def public_api_observability(request, call_next):
        request_id = request.headers.get("x-request-id") or uuid.uuid4().hex
        started = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            latency_ms = (time.perf_counter() - started) * 1000
            if request.url.path.startswith("/api/public/"):
                metrics.record(request.url.path, request.method, status_code, latency_ms)
                append_jsonl(
                    access_log_path,
                    {
                        "event": "public_api_request",
                        "requestId": request_id,
                        "method": request.method,
                        "path": request.url.path,
                        "status": status_code,
                        "latencyMs": round(latency_ms, 3),
                        "rateLimitBackend": configured_rate_limit_backend(),
                        "timestampUnix": int(time.time()),
                    },
                )

    @app.middleware("http")
    async def public_api_rate_limit(request, call_next):
        if request.url.path.startswith("/api/public/"):
            forwarded_for = request.headers.get("x-forwarded-for", "")
            client_ip = forwarded_for.split(",", 1)[0].strip() or (request.client.host if request.client else "unknown")
            token = request.headers.get("authorization", "") or request.cookies.get(SESSION_COOKIE_NAME, "")
            key = f"{client_ip}:{token[:24]}:{request.url.path}"
            allowed, retry_after = limiter.check(key, request.url.path)
            if not allowed:
                return JSONResponse(
                    {"error": "Too many requests. Slow down and retry shortly."},
                    status_code=429,
                    headers={"Retry-After": str(retry_after)},
                )
        return await call_next(request)

    @app.middleware("http")
    async def public_api_csrf_guard(request, call_next):
        if request.url.path.startswith("/api/public/") and request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            if request.url.path not in CSRF_EXEMPT_PATHS and not authorization_bearer_token(request.headers):
                session_cookie = request.cookies.get(SESSION_COOKIE_NAME, "")
                if session_cookie:
                    expected = request.cookies.get(CSRF_COOKIE_NAME, "")
                    actual = request.headers.get(CSRF_HEADER_NAME, "")
                    if not expected or not actual or expected != actual:
                        return JSONResponse({"error": "CSRF token required for cookie-authenticated write requests."}, status_code=403)
        return await call_next(request)

    @app.exception_handler(PublicBackendError)
    async def public_backend_error_handler(_request, exc):
        return JSONResponse({"error": exc.message}, status_code=exc.status)

    def bearer_token(request: Request, authorization: str = Header(default="")):
        if authorization.lower().startswith("bearer "):
            return authorization.split(" ", 1)[1].strip()
        return request.cookies.get(SESSION_COOKIE_NAME, "")

    def set_session_cookie(response: Response, payload):
        token = payload.get("token") if isinstance(payload, dict) else None
        expires_at = payload.get("expiresAt") if isinstance(payload, dict) else None
        if token and expires_at:
            csrf_token = new_csrf_token()
            response.headers.append("Set-Cookie", session_cookie_value(str(token), int(expires_at)))
            response.headers.append("Set-Cookie", csrf_cookie_value(csrf_token, int(expires_at)))
            payload = {**payload, "cookieAuth": True, "csrfToken": csrf_token}
        return payload

    def actor(token: str = Depends(bearer_token)):
        return backend.account_for_token(token)

    @app.get("/api/public/health")
    async def public_health():
        return backend.handle_http("GET", "/api/public/health")[1]

    @app.post("/api/public/bootstrap", status_code=201)
    async def bootstrap_admin(request: Request):
        return backend.bootstrap_admin(await request.json())

    @app.post("/api/public/signup", status_code=201)
    async def public_signup(request: Request, response: Response):
        return set_session_cookie(response, backend.public_signup(await request.json()))

    @app.post("/api/public/login")
    async def login(request: Request, response: Response):
        return set_session_cookie(response, backend.login(await request.json()))

    @app.post("/api/public/session/refresh")
    async def refresh_session(response: Response, token: str = Depends(bearer_token)):
        return set_session_cookie(response, backend.refresh_session(token))

    @app.post("/api/public/logout")
    async def logout(response: Response, token: str = Depends(bearer_token)):
        response.headers.append("Set-Cookie", clear_session_cookie_value())
        response.headers.append("Set-Cookie", clear_csrf_cookie_value())
        payload = backend.logout(token)
        return {**payload, "cookieAuth": True}

    @app.get("/api/public/me")
    async def me(current=Depends(actor)):
        return {"account": current}

    @app.get("/api/public/sync-contract")
    async def sync_contract(current=Depends(actor)):
        return backend.sync_contract(current)

    @app.post("/api/public/accounts", status_code=201)
    async def create_account(request: Request, current=Depends(actor)):
        return backend.create_account(current, await request.json())

    @app.get("/api/public/accounts")
    async def list_accounts(current=Depends(actor)):
        return backend.list_accounts(current)

    @app.post("/api/public/accounts/{account_id}/status")
    async def update_account_status(account_id: str, request: Request, current=Depends(actor)):
        return backend.update_account_status(current, account_id, await request.json())

    @app.post("/api/public/progress")
    async def save_progress(request: Request, current=Depends(actor)):
        return backend.save_progress(current, await request.json())

    @app.get("/api/public/progress")
    async def get_progress(accountId: str = "", source: str = "sat_studio", current=Depends(actor)):
        return backend.get_progress(current, accountId or current["id"], source)

    @app.post("/api/public/profile")
    async def save_profile(request: Request, current=Depends(actor)):
        result = backend.save_profile(current, await request.json())
        if isinstance(result, tuple):
            payload, status = result
            return JSONResponse(payload, status_code=status)
        return result

    @app.get("/api/public/profile")
    async def get_profile(accountId: str = "", source: str = "sat_studio_profile", current=Depends(actor)):
        return backend.get_profile(current, accountId or current["id"], source)

    @app.post("/api/public/question-audits", status_code=201)
    async def create_question_audit(request: Request, current=Depends(actor)):
        return backend.create_question_audit(current, await request.json())

    @app.get("/api/public/question-reviews")
    async def list_question_reviews(questionId: str = "", limit: int = 50, current=Depends(actor)):
        return backend.list_question_review_versions(current, questionId, limit)

    @app.post("/api/public/question-reviews", status_code=201)
    async def save_question_review(request: Request, current=Depends(actor)):
        return backend.save_question_review_version(current, await request.json())

    @app.get("/api/public/classes")
    async def list_classes(current=Depends(actor)):
        return backend.list_classes(current)

    @app.post("/api/public/classes", status_code=201)
    async def create_class(request: Request, current=Depends(actor)):
        return backend.create_class(current, await request.json())

    @app.post("/api/public/classes/join")
    async def join_class(request: Request, current=Depends(actor)):
        return backend.join_class(current, await request.json())

    @app.get("/api/public/classes/{class_id}/assignments")
    async def list_class_assignments(class_id: str, current=Depends(actor)):
        return backend.list_class_assignments(current, class_id)

    @app.post("/api/public/classes/{class_id}/assignments", status_code=201)
    async def create_class_assignment(class_id: str, request: Request, current=Depends(actor)):
        return backend.create_class_assignment(current, class_id, await request.json())

    @app.get("/api/public/classes/{class_id}/report")
    async def class_report(class_id: str, current=Depends(actor)):
        return backend.class_report(current, class_id)

    @app.post("/api/public/assignments/{assignment_id}/evidence")
    async def submit_assignment_evidence(assignment_id: str, request: Request, current=Depends(actor)):
        return backend.submit_assignment_evidence(current, assignment_id, await request.json())

    @app.get("/api/public/content-package")
    async def get_content_package(scope: str = "public", current=Depends(actor)):
        return backend.get_content_package(current, scope)

    @app.post("/api/public/content-package")
    async def save_content_package(request: Request, current=Depends(actor)):
        return backend.save_content_package(current, await request.json())

    @app.post("/api/public/question-audits/{audit_id}/resolve")
    async def resolve_question_audit(audit_id: str, request: Request, current=Depends(actor)):
        return backend.resolve_question_audit(current, audit_id, await request.json())

    @app.get("/api/public/audit-log")
    async def list_audit_log(limit: int = 50, action: str = "", targetType: str = "", actorAccountId: str = "", current=Depends(actor)):
        return backend.list_audit_log(current, limit, action, targetType, actorAccountId)

    @app.get("/api/public/schema-version")
    async def schema_version(current=Depends(actor)):
        return backend.schema_version(current)

    @app.get("/api/public/export")
    async def export_snapshot(current=Depends(actor)):
        return backend.export_snapshot(current)

    @app.get("/api/public/monitoring")
    async def monitoring(current=Depends(actor)):
        return backend.monitoring(current)

    @app.get("/api/public/ops/metrics")
    async def ops_metrics(current=Depends(actor)):
        backend.require_role(current, {"admin", "content_admin"})
        return metrics.snapshot(rate_limit_backend=app.state.sat_studio_rate_limit_backend)

    @app.post("/api/public/maintenance/purge-sessions")
    async def purge_sessions(current=Depends(actor)):
        return backend.purge_sessions(current)

    if static_root:
        app.mount("/", StaticFiles(directory=static_root, html=True), name="sat-studio-static")

    return app


app = create_app() if FastAPI is not None else None
