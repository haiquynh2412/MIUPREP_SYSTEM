import base64
from contextlib import contextmanager
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
import uuid
from http.cookies import SimpleCookie
from urllib.parse import parse_qs, urlparse

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:  # pragma: no cover - optional production dependency.
    psycopg = None
    dict_row = None


ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_DB_PATH = os.path.join(ROOT_DIR, "data", "sat_studio_public.sqlite3")
PASSWORD_ITERATIONS = 210_000
DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
SESSION_TTL_SECONDS = int(os.environ.get("SAT_STUDIO_SESSION_TTL_SECONDS", DEFAULT_SESSION_TTL_SECONDS))
SQLITE_TIMEOUT_SECONDS = float(os.environ.get("SAT_STUDIO_SQLITE_TIMEOUT_SECONDS", "30.0"))
SQLITE_JOURNAL_MODE = os.environ.get("SAT_STUDIO_SQLITE_JOURNAL_MODE", "WAL").strip().upper()
PUBLIC_DATABASE_URL = os.environ.get("SAT_STUDIO_PUBLIC_DATABASE_URL") or os.environ.get("DATABASE_URL") or ""
POSTGRESQL_ADAPTER_ENABLED = os.environ.get("SAT_STUDIO_ENABLE_POSTGRES", "").strip().lower() in {"1", "true", "yes", "on"}
SESSION_COOKIE_NAME = os.environ.get("SAT_STUDIO_SESSION_COOKIE_NAME", "sat_studio_session")
SESSION_COOKIE_SAMESITE = os.environ.get("SAT_STUDIO_SESSION_COOKIE_SAMESITE", "Lax")
SESSION_COOKIE_SECURE = os.environ.get("SAT_STUDIO_SESSION_COOKIE_SECURE", "").strip().lower() in {"1", "true", "yes", "on"}
CSRF_COOKIE_NAME = os.environ.get("SAT_STUDIO_CSRF_COOKIE_NAME", "sat_studio_public_csrf")
CSRF_HEADER_NAME = "X-CSRF-Token"
CSRF_EXEMPT_PATHS = {"/api/public/bootstrap", "/api/public/signup", "/api/public/login"}
SCHEMA_VERSION = "0010_teacher_classroom_v2"
SYNC_SOURCE_PATTERN = re.compile(r"^[A-Za-z0-9_.:-]{1,80}$")
BLOCKED_PUBLIC_SOURCE_TYPES = {"private_vault", "college_board", "cracksat_reference", "official_log"}
PRIVATE_VISIBILITIES = {"private_family", "admin_only"}
CONTENT_PACKAGE_QUERY_FIELDS = {"id", "section", "domain", "skill", "difficulty", "sourceType", "reviewStatus", "visibility", "questionType", "calculator", "desmos"}
CONTENT_PACKAGE_METADATA_FIELDS = {"id", "section", "domain", "skill", "difficulty", "sourceType", "reviewStatus", "publicationStatus", "visibility", "questionType", "targetBand", "modulePlacement", "estimatedTimeSeconds", "practicePool", "calculator", "desmos"}
QUESTION_CONTENT_FIELDS = {
    "prompt",
    "choices",
    "choiceA",
    "choiceB",
    "choiceC",
    "choiceD",
    "correctAnswer",
    "correctChoice",
    "acceptableAnswers",
    "explanation",
    "sourceReference",
    "sourceSignalId",
    "sourceName",
    "licenseNote",
}
SENSITIVE_COLLECTION_KEYS = {"sourceSignals", "privateVault", "vaultQuestions", "questionBank"}
PROTECTED_CONTENT_FIELD_KEYS = {
    "answerChoices",
    "officialAnswerChoices",
    "officialExplanation",
    "officialPassage",
    "officialPrompt",
    "officialQuestionText",
    "passageText",
    "questionStem",
    "questionText",
}
PUBLIC_BACKEND_TABLES = (
    "accounts",
    "sessions",
    "progress_records",
    "profile_records",
    "question_audits",
    "question_review_versions",
    "classes",
    "class_memberships",
    "class_assignments",
    "assignment_evidence",
    "content_packages",
    "audit_log",
    "schema_migrations",
)
POSTGRESQL_ADAPTER_READY = psycopg is not None


def configured_database_engine(database_url=""):
    clean = str(database_url or "").strip().lower()
    if clean.startswith(("postgres://", "postgresql://")):
        return "postgresql"
    if clean.startswith("sqlite://") or not clean:
        return "sqlite"
    return "unknown"


def postgresql_adapter_runtime_ready():
    return POSTGRESQL_ADAPTER_ENABLED and psycopg is not None


def migration_readiness_payload(database_url=""):
    engine = configured_database_engine(database_url)
    blockers = []
    mode = "sqlite_inline"
    ok = engine == "sqlite"
    adapter_ready = postgresql_adapter_runtime_ready()
    if engine == "postgresql":
        mode = "postgresql_runtime_adapter" if adapter_ready else "postgresql_blocked_until_adapter"
        ok = adapter_ready
        if not POSTGRESQL_ADAPTER_ENABLED:
            blockers.append("postgresql_adapter_disabled")
        if psycopg is None:
            blockers.append("psycopg_dependency_missing")
    elif engine == "unknown":
        mode = "unsupported_database_url"
        blockers = ["unsupported_database_url"]
    return {
        "ok": ok,
        "currentVersion": SCHEMA_VERSION,
        "engine": engine,
        "mode": mode,
        "requiredTables": list(PUBLIC_BACKEND_TABLES),
        "sqlite": {
            "inlineMigrations": True,
            "journalMode": SQLITE_JOURNAL_MODE,
            "timeoutSeconds": SQLITE_TIMEOUT_SECONDS,
            "busyTimeoutMs": int(SQLITE_TIMEOUT_SECONDS * 1000),
        },
        "postgresql": {
            "adapterReady": POSTGRESQL_ADAPTER_READY,
            "runtimeEnabled": POSTGRESQL_ADAPTER_ENABLED,
            "runtimeReady": adapter_ready,
            "migrationRunnerReady": adapter_ready,
            "plannedTables": list(PUBLIC_BACKEND_TABLES),
        },
        "blockers": blockers,
    }

BACKEND_SYNC_CONTRACT = {
    "version": SCHEMA_VERSION,
    "sourceOfTruth": {
        "accounts": "backend.accounts",
        "progress": "backend.progress_records",
        "profiles": "backend.profile_records",
        "attempts": "backend.profile_records:profile.attempts",
        "learningEvents": "backend.profile_records:profile.learningEvents",
        "learningEvidence": "backend.profile_records:profile.attempts[].learningEvidence",
        "contentLifecycle": "backend.content_packages",
        "officialLogs": "backend.profile_records:metadata_only",
        "questionAudits": "backend.question_audits",
        "questionReviewVersions": "backend.question_review_versions",
        "classes": "backend.classes",
        "classMemberships": "backend.class_memberships",
        "assignments": "backend.class_assignments",
        "assignmentEvidence": "backend.assignment_evidence",
        "auditLog": "backend.audit_log",
    },
    "canonicalSources": {
        "progress": "sat_studio",
        "profile": "sat_studio_profile",
        "officialLogs": "sat_studio_official_logs",
    },
    "profileSchemas": ["sat_profile_v1", "sat_profile_v2_learning_evidence"],
    "redactionRules": {
        "questionContentFields": sorted(PROTECTED_CONTENT_FIELD_KEYS),
        "sensitiveCollections": sorted(SENSITIVE_COLLECTION_KEYS),
        "blockedPublicSourceTypes": sorted(BLOCKED_PUBLIC_SOURCE_TYPES),
    },
    "sourceNamePolicy": "Only A-Z, a-z, 0-9, underscore, dot, colon, and hyphen; 1-80 characters.",
}


class PublicBackendError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


def backend_integrity_errors():
    errors = [sqlite3.IntegrityError]
    if psycopg is not None:
        errors.append(psycopg.IntegrityError)
    return tuple(errors)


def translate_postgresql_sql(sql):
    text = str(sql)
    compact = " ".join(text.split())
    if compact == "INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)":
        return "INSERT INTO schema_migrations (version, applied_at) VALUES (%s, %s) ON CONFLICT (version) DO NOTHING"
    return text.replace("?", "%s")


def split_sql_script(script):
    statements = []
    current = []
    in_single = False
    in_double = False
    previous = ""
    for char in str(script):
        if char == "'" and not in_double and previous != "\\":
            in_single = not in_single
        elif char == '"' and not in_single and previous != "\\":
            in_double = not in_double
        if char == ";" and not in_single and not in_double:
            statement = "".join(current).strip()
            if statement:
                statements.append(statement)
            current = []
        else:
            current.append(char)
        previous = char
    trailing = "".join(current).strip()
    if trailing:
        statements.append(trailing)
    return statements


class PostgresCompatConnection:
    def __init__(self, database_url):
        if psycopg is None:
            raise RuntimeError("psycopg is not installed. Run: pip install -r requirements-public.txt")
        self.connection = psycopg.connect(database_url, row_factory=dict_row, connect_timeout=int(SQLITE_TIMEOUT_SECONDS))

    def execute(self, sql, params=None):
        params = tuple(params or ())
        return self.connection.execute(translate_postgresql_sql(sql), params)

    def executescript(self, script):
        cursor = None
        for statement in split_sql_script(script):
            cursor = self.execute(statement)
        return cursor

    def commit(self):
        self.connection.commit()

    def rollback(self):
        self.connection.rollback()

    def close(self):
        self.connection.close()


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def now_unix():
    return int(time.time())


def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:18]}"


def normalize_role(value):
    role = str(value or "student").strip().lower()
    allowed = {"student", "parent", "teacher", "admin", "content_admin"}
    if role not in allowed:
        raise PublicBackendError("Unsupported account role.", status=400)
    return role


def normalize_scope(value):
    scope = str(value or "public").strip().lower()
    allowed = {"public", "family", "private_family"}
    if scope not in allowed:
        raise PublicBackendError("Unsupported account scope.", status=400)
    return scope


def normalize_sync_source(value, default):
    source = str(value or default).strip() or default
    if not SYNC_SOURCE_PATTERN.fullmatch(source):
        raise PublicBackendError("Unsupported sync source name.", status=400)
    return source


def hash_password(password, salt=None):
    if not password or len(str(password)) < 8:
        raise PublicBackendError("Password must be at least 8 characters.", status=400)
    salt_bytes = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", str(password).encode("utf-8"), salt_bytes, PASSWORD_ITERATIONS)
    return {
        "salt": base64.b64encode(salt_bytes).decode("ascii"),
        "hash": base64.b64encode(digest).decode("ascii"),
    }


def verify_password(password, salt_b64, hash_b64):
    try:
        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected = base64.b64decode(hash_b64.encode("ascii"))
    except Exception:
        return False
    actual = hashlib.pbkdf2_hmac("sha256", str(password).encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return hmac.compare_digest(actual, expected)


def hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def row_to_account(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "username": row["username"],
        "displayName": row["display_name"],
        "role": row["role"],
        "scope": row["scope"],
        "parentId": row["parent_id"],
        "status": row["status"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def is_admin_role(account):
    return account and account.get("role") in {"admin", "content_admin"}


def looks_like_question_payload(value):
    if not isinstance(value, dict):
        return False
    if "prompt" in value or "choices" in value or "acceptableAnswers" in value:
        return True
    return bool({"questionType", "correctAnswer", "sourceType", "visibility"} & set(value.keys()) and {"section", "domain", "skill"} & set(value.keys()))


def public_safety_reason(question):
    visibility = str(question.get("visibility") or "").lower()
    source_type = str(question.get("sourceType") or "").lower()
    source_risk = str(question.get("sourceRisk") or question.get("risk") or "").lower()
    review_status = str(question.get("reviewStatus") or "").lower()
    publication_status = str(question.get("publicationStatus") or "").lower()
    audit_status = str(question.get("auditStatus") or "").lower()
    if visibility in PRIVATE_VISIBILITIES:
        return f"visibility:{visibility}"
    if source_type in BLOCKED_PUBLIC_SOURCE_TYPES:
        return f"sourceType:{source_type}"
    if source_risk == "high":
        return "sourceRisk:high"
    if question.get("neverPublic"):
        return "neverPublic"
    if audit_status == "blocked" or publication_status == "audit_blocked" or publication_status.startswith("rejected"):
        return "audit_or_publication_blocked"
    if visibility != "public_candidate":
        return "not_public_candidate"
    if review_status != "reviewed":
        return "not_reviewed"
    if not publication_status.startswith("public_candidate"):
        return "not_publication_reviewed"
    return "embedded_question_content_not_synced"


def public_content_publish_blocker(question):
    visibility = str(question.get("visibility") or "").lower()
    source_type = str(question.get("sourceType") or "").lower()
    source_risk = str(question.get("sourceRisk") or question.get("risk") or "").lower()
    review_status = str(question.get("reviewStatus") or "").lower()
    publication_status = str(question.get("publicationStatus") or "").lower()
    audit_status = str(question.get("auditStatus") or "").lower()
    if visibility in PRIVATE_VISIBILITIES:
        return f"visibility:{visibility}"
    if source_type in BLOCKED_PUBLIC_SOURCE_TYPES:
        return f"sourceType:{source_type}"
    if source_risk == "high":
        return "sourceRisk:high"
    if question.get("neverPublic"):
        return "neverPublic"
    if audit_status == "blocked" or publication_status == "audit_blocked" or publication_status.startswith("rejected"):
        return "audit_or_publication_blocked"
    if visibility != "public_candidate":
        return "not_public_candidate"
    if review_status != "reviewed":
        return "not_reviewed"
    if not publication_status.startswith("public_candidate"):
        return "not_publication_reviewed"
    return None


def content_package_blockers(package):
    items = package.get("items") if isinstance(package, dict) else []
    if not isinstance(items, list):
        return [{"id": "", "reason": "items_not_array"}]
    blockers = []
    for index, item in enumerate(items):
        if not looks_like_question_payload(item):
            continue
        reason = public_content_publish_blocker(item)
        if reason:
            blockers.append({"id": item.get("id") or str(index), "reason": reason})
    return blockers


def first_query_value(query, key, default=""):
    values = query.get(key) if isinstance(query, dict) else None
    return str(values[0] if values else default).strip()


def bounded_query_int(query, key, default, minimum=0, maximum=5000):
    try:
        value = int(first_query_value(query, key, default))
    except (TypeError, ValueError):
        value = default
    return max(minimum, min(maximum, value))


def content_package_filter_value(item, field):
    if field == "calculator":
        tags = [str(value).lower().replace("-", "_") for value in item.get("tags") or []]
        raw = str(item.get("calculator") or item.get("calculatorTag") or item.get("mathTool") or "").lower().replace("-", "_")
        if raw:
            tags.append(raw)
        if any(tag in {"calculator_required", "calc_required", "calculator"} for tag in tags):
            return "calculator_required"
        if any(tag in {"calculator_allowed", "calc_allowed"} for tag in tags):
            return "calculator_allowed"
        if any(tag in {"no_calculator", "non_calculator", "mental_math"} for tag in tags):
            return "no_calculator"
        return ""
    if field == "desmos":
        tags = [str(value).lower().replace("-", "_") for value in item.get("tags") or []]
        raw = str(item.get("desmos") or item.get("desmosTag") or item.get("toolTag") or item.get("mathTool") or "").lower().replace("-", "_")
        if raw:
            tags.append(raw)
        if any(tag in {"desmos", "desmos_recommended", "graphing", "graphing_calculator"} for tag in tags):
            return "desmos_recommended"
        if any(tag in {"desmos_optional", "calculator_optional"} for tag in tags):
            return "desmos_optional"
        return ""
    if field == "questionType":
        return item.get("questionType") or item.get("type") or ""
    return item.get(field) or ""


def query_content_package_payload(package, query=None):
    query = query or {}
    filters = {
        field: first_query_value(query, field)
        for field in CONTENT_PACKAGE_QUERY_FIELDS
        if first_query_value(query, field) not in {"", "All"}
    }
    if not filters and not any(key in query for key in ("limit", "offset", "includeContent")):
        return package
    raw_items = package.get("items") if isinstance(package, dict) else []
    items = raw_items if isinstance(raw_items, list) else []
    if filters:
        items = [
            item for item in items
            if isinstance(item, dict) and all(str(content_package_filter_value(item, field)) == expected for field, expected in filters.items())
        ]
    total = len(items)
    offset = bounded_query_int(query, "offset", 0, 0, total)
    limit = bounded_query_int(query, "limit", total or 0, 0, 5000)
    include_content = first_query_value(query, "includeContent", "true").lower() not in {"0", "false", "no"}
    paged = items[offset: offset + limit] if limit else []
    if not include_content:
        paged = [{key: item.get(key) for key in CONTENT_PACKAGE_METADATA_FIELDS if item.get(key) not in (None, "")} for item in paged]
    output = dict(package)
    manifest = dict(output.get("manifest") or {})
    manifest.update({"queryTotal": total, "queryOffset": offset, "queryLimit": limit})
    output["manifest"] = manifest
    output["items"] = paged
    output["query"] = {"filters": filters, "offset": offset, "limit": limit, "includeContent": include_content, "total": total}
    return output


def redact_question_payload(question):
    reason = public_safety_reason(question)
    source_type = str(question.get("sourceType") or "").lower()
    visibility = str(question.get("visibility") or "").lower()
    metadata = {
        "id": question.get("id"),
        "section": question.get("section"),
        "domain": question.get("domain"),
        "skill": question.get("skill"),
        "difficulty": question.get("difficulty"),
        "questionType": question.get("questionType") or question.get("type"),
        "reviewStatus": question.get("reviewStatus"),
        "publicationStatus": question.get("publicationStatus"),
        "visibility": "redacted" if visibility in PRIVATE_VISIBILITIES else question.get("visibility"),
        "sourceType": "redacted" if source_type in BLOCKED_PUBLIC_SOURCE_TYPES else question.get("sourceType"),
        "contentRedacted": True,
        "redactionReason": reason,
    }
    return {key: value for key, value in metadata.items() if value not in (None, "")}


def sanitize_public_payload(value):
    redactions = []

    def sanitize(item, path=()):
        if isinstance(item, list):
            return [sanitize(child, path + ("[]",)) for child in item]
        if not isinstance(item, dict):
            return item
        if looks_like_question_payload(item):
            redactions.append({"path": ".".join(path) or "$", "reason": public_safety_reason(item), "id": item.get("id") or item.get("questionId")})
            return redact_question_payload(item)
        sanitized = {}
        for key, child in item.items():
            if key in PROTECTED_CONTENT_FIELD_KEYS:
                redactions.append({"path": ".".join(path + (str(key),)), "reason": f"protected_content_field:{key}"})
                continue
            if key in SENSITIVE_COLLECTION_KEYS:
                redactions.append({"path": ".".join(path + (key,)), "reason": f"sensitive_collection:{key}"})
                sanitized[key] = []
                continue
            sanitized[key] = sanitize(child, path + (str(key),))
        return sanitized

    return sanitize(value), redactions


def content_safety_summary(redactions):
    return {
        "redactions": len(redactions or []),
        "reasons": sorted({item.get("reason") for item in redactions or [] if item.get("reason")}),
    }


def cookie_token(headers):
    value = headers.get("Cookie") or headers.get("cookie") or ""
    if not value:
        return ""
    cookie = SimpleCookie()
    try:
        cookie.load(value)
    except Exception:
        return ""
    morsel = cookie.get(SESSION_COOKIE_NAME)
    return morsel.value.strip() if morsel else ""


def csrf_cookie_token(headers):
    value = headers.get("Cookie") or headers.get("cookie") or ""
    if not value:
        return ""
    cookie = SimpleCookie()
    try:
        cookie.load(value)
    except Exception:
        return ""
    morsel = cookie.get(CSRF_COOKIE_NAME)
    return morsel.value.strip() if morsel else ""


def csrf_header_token(headers):
    return (headers.get(CSRF_HEADER_NAME) or headers.get(CSRF_HEADER_NAME.lower()) or "").strip()


def authorization_bearer_token(headers):
    value = headers.get("Authorization") or headers.get("authorization") or ""
    if value.lower().startswith("bearer "):
        return value.split(" ", 1)[1].strip()
    return ""


def new_csrf_token():
    return secrets.token_urlsafe(24)


def session_cookie_value(token, expires_at):
    max_age = max(0, int(expires_at) - now_unix())
    parts = [
        f"{SESSION_COOKIE_NAME}={token}",
        "Path=/api/public",
        f"Max-Age={max_age}",
        "HttpOnly",
        f"SameSite={SESSION_COOKIE_SAMESITE}",
    ]
    if SESSION_COOKIE_SECURE:
        parts.append("Secure")
    return "; ".join(parts)


def csrf_cookie_value(token, expires_at):
    max_age = max(0, int(expires_at) - now_unix())
    parts = [
        f"{CSRF_COOKIE_NAME}={token}",
        "Path=/",
        f"Max-Age={max_age}",
        f"SameSite={SESSION_COOKIE_SAMESITE}",
    ]
    if SESSION_COOKIE_SECURE:
        parts.append("Secure")
    return "; ".join(parts)


def clear_session_cookie_value():
    parts = [
        f"{SESSION_COOKIE_NAME}=",
        "Path=/api/public",
        "Max-Age=0",
        "HttpOnly",
        f"SameSite={SESSION_COOKIE_SAMESITE}",
    ]
    if SESSION_COOKIE_SECURE:
        parts.append("Secure")
    return "; ".join(parts)


def clear_csrf_cookie_value():
    parts = [
        f"{CSRF_COOKIE_NAME}=",
        "Path=/",
        "Max-Age=0",
        f"SameSite={SESSION_COOKIE_SAMESITE}",
    ]
    if SESSION_COOKIE_SECURE:
        parts.append("Secure")
    return "; ".join(parts)


def set_cookie_headers(*values):
    return [value for value in values if value]


class SatPublicBackend:
    def __init__(self, db_path=DEFAULT_DB_PATH, database_url=None):
        self.database_url = PUBLIC_DATABASE_URL if database_url is None else str(database_url or "")
        self.database_engine = configured_database_engine(self.database_url)
        if self.database_engine == "postgresql" and not postgresql_adapter_runtime_ready():
            readiness = migration_readiness_payload(self.database_url)
            raise RuntimeError(
                "PostgreSQL DATABASE_URL was detected, but this build still runs the SQLite repository. "
                "Keep SAT_STUDIO_PUBLIC_DB for pilot deployments or enable the PostgreSQL adapter before production scale-out. "
                f"Blockers: {', '.join(readiness['blockers']) or 'unknown'}."
            )
        if self.database_engine == "unknown":
            raise RuntimeError("Unsupported SAT Studio public database URL. Use sqlite://, postgres://, postgresql://, or leave it empty for SQLite.")
        self.db_path = db_path
        if self.database_engine == "sqlite":
            os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self.initialize()

    def connect(self):
        if self.database_engine == "postgresql":
            return PostgresCompatConnection(self.database_url)
        connection = sqlite3.connect(self.db_path, timeout=SQLITE_TIMEOUT_SECONDS)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute(f"PRAGMA busy_timeout = {int(SQLITE_TIMEOUT_SECONDS * 1000)}")
        if SQLITE_JOURNAL_MODE == "WAL":
            connection.execute("PRAGMA journal_mode = WAL")
            connection.execute("PRAGMA synchronous = NORMAL")
        return connection

    @contextmanager
    def session(self):
        connection = self.connect()
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self):
        with self.session() as db:
            db.executescript(
                """
                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL UNIQUE,
                    display_name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    scope TEXT NOT NULL,
                    parent_id TEXT,
                    password_salt TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(parent_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY,
                    account_id TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    revoked_at INTEGER,
                    FOREIGN KEY(account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS progress_records (
                    id TEXT PRIMARY KEY,
                    account_id TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    source TEXT NOT NULL DEFAULT 'sat_studio',
                    updated_at TEXT NOT NULL,
                    UNIQUE(account_id, source),
                    FOREIGN KEY(account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS profile_records (
                    id TEXT PRIMARY KEY,
                    account_id TEXT NOT NULL,
                    profile_json TEXT NOT NULL,
                    source TEXT NOT NULL DEFAULT 'sat_studio_profile',
                    client_revision INTEGER NOT NULL DEFAULT 0,
                    server_revision INTEGER NOT NULL DEFAULT 1,
                    updated_at TEXT NOT NULL,
                    updated_by_account_id TEXT NOT NULL,
                    UNIQUE(account_id, source),
                    FOREIGN KEY(account_id) REFERENCES accounts(id),
                    FOREIGN KEY(updated_by_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS question_audits (
                    id TEXT PRIMARY KEY,
                    question_id TEXT NOT NULL,
                    reporter_account_id TEXT NOT NULL,
                    issue_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    note TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'open',
                    resolution_note TEXT,
                    created_at TEXT NOT NULL,
                    resolved_at TEXT,
                    resolver_account_id TEXT,
                    FOREIGN KEY(reporter_account_id) REFERENCES accounts(id),
                    FOREIGN KEY(resolver_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS question_review_versions (
                    id TEXT PRIMARY KEY,
                    question_id TEXT NOT NULL,
                    source_file TEXT,
                    source_index INTEGER NOT NULL DEFAULT -1,
                    version_number INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    note TEXT NOT NULL,
                    draft_json TEXT NOT NULL,
                    before_json TEXT NOT NULL,
                    validation_json TEXT NOT NULL,
                    local_version_id TEXT,
                    local_version_number INTEGER,
                    created_at TEXT NOT NULL,
                    created_by_account_id TEXT NOT NULL,
                    FOREIGN KEY(created_by_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS classes (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    join_code TEXT NOT NULL UNIQUE,
                    teacher_account_id TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(teacher_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS class_memberships (
                    id TEXT PRIMARY KEY,
                    class_id TEXT NOT NULL,
                    student_account_id TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    joined_at TEXT NOT NULL,
                    UNIQUE(class_id, student_account_id),
                    FOREIGN KEY(class_id) REFERENCES classes(id),
                    FOREIGN KEY(student_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS class_assignments (
                    id TEXT PRIMARY KEY,
                    class_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    focus_skill TEXT NOT NULL,
                    due_date TEXT NOT NULL,
                    target_student_ids_json TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'assigned',
                    created_at TEXT NOT NULL,
                    created_by_account_id TEXT NOT NULL,
                    FOREIGN KEY(class_id) REFERENCES classes(id),
                    FOREIGN KEY(created_by_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS assignment_evidence (
                    id TEXT PRIMARY KEY,
                    assignment_id TEXT NOT NULL,
                    student_account_id TEXT NOT NULL,
                    evidence_json TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'submitted',
                    submitted_at TEXT NOT NULL,
                    UNIQUE(assignment_id, student_account_id),
                    FOREIGN KEY(assignment_id) REFERENCES class_assignments(id),
                    FOREIGN KEY(student_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS content_packages (
                    scope TEXT PRIMARY KEY,
                    package_json TEXT NOT NULL,
                    content_version TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    updated_by_account_id TEXT NOT NULL,
                    FOREIGN KEY(updated_by_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS audit_log (
                    id TEXT PRIMARY KEY,
                    actor_account_id TEXT,
                    action TEXT NOT NULL,
                    target_type TEXT NOT NULL,
                    target_id TEXT,
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(actor_account_id) REFERENCES accounts(id)
                );

                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version TEXT PRIMARY KEY,
                    applied_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_id);
                CREATE INDEX IF NOT EXISTS idx_accounts_role_status ON accounts(role, status);
                CREATE INDEX IF NOT EXISTS idx_sessions_account_status ON sessions(account_id, revoked_at, expires_at);
                CREATE INDEX IF NOT EXISTS idx_progress_account_source ON progress_records(account_id, source);
                CREATE INDEX IF NOT EXISTS idx_profile_account_source ON profile_records(account_id, source);
                CREATE INDEX IF NOT EXISTS idx_question_audits_status ON question_audits(status, created_at);
                CREATE INDEX IF NOT EXISTS idx_question_review_versions_question ON question_review_versions(question_id, version_number DESC);
                CREATE INDEX IF NOT EXISTS idx_classes_teacher_status ON classes(teacher_account_id, status, created_at);
                CREATE INDEX IF NOT EXISTS idx_class_memberships_student ON class_memberships(student_account_id, status);
                CREATE INDEX IF NOT EXISTS idx_class_assignments_class ON class_assignments(class_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_assignment_evidence_assignment ON assignment_evidence(assignment_id, student_account_id);
                CREATE INDEX IF NOT EXISTS idx_audit_log_action_created ON audit_log(action, target_type, created_at);
                CREATE INDEX IF NOT EXISTS idx_content_packages_updated ON content_packages(updated_at);
                """
            )
            db.execute(
                "INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)",
                (SCHEMA_VERSION, now_iso()),
            )

    def admin_count(self):
        with self.session() as db:
            row = db.execute("SELECT COUNT(*) AS count FROM accounts WHERE role IN ('admin', 'content_admin')").fetchone()
            return int(row["count"])

    def active_admin_count(self, excluding_account_id=None):
        query = "SELECT COUNT(*) AS count FROM accounts WHERE role IN ('admin', 'content_admin') AND status = 'active'"
        params = []
        if excluding_account_id:
            query += " AND id != ?"
            params.append(excluding_account_id)
        with self.session() as db:
            row = db.execute(query, tuple(params)).fetchone()
            return int(row["count"])

    def account_by_id(self, account_id):
        with self.session() as db:
            return row_to_account(db.execute("SELECT * FROM accounts WHERE id = ?", (account_id,)).fetchone())

    def account_by_username_private(self, username):
        with self.session() as db:
            return db.execute("SELECT * FROM accounts WHERE lower(username) = lower(?)", (username,)).fetchone()

    def write_audit_log(self, db, actor_id, action, target_type, target_id=None, payload=None):
        db.execute(
            """
            INSERT INTO audit_log (id, actor_account_id, action, target_type, target_id, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id("log"),
                actor_id,
                action,
                target_type,
                target_id,
                json.dumps(payload or {}, ensure_ascii=True, sort_keys=True),
                now_iso(),
            ),
        )

    def issue_session(self, db, account_id, username, action="login", rotated_from=None):
        token = secrets.token_urlsafe(32)
        token_hash = hash_token(token)
        created_at = now_unix()
        expires_at = created_at + SESSION_TTL_SECONDS
        db.execute(
            "INSERT INTO sessions (token_hash, account_id, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, NULL)",
            (token_hash, account_id, created_at, expires_at),
        )
        payload = {"username": username, "expiresAt": expires_at}
        if rotated_from:
            payload["rotatedFrom"] = rotated_from
        self.write_audit_log(db, account_id, action, "session", token_hash, payload)
        return token, expires_at

    def bootstrap_admin(self, payload):
        if self.admin_count() > 0:
            raise PublicBackendError("Admin bootstrap is closed because an admin already exists.", status=409)
        username = str(payload.get("username") or "").strip()
        display_name = str(payload.get("displayName") or username or "SAT Studio Admin").strip()
        password = payload.get("password") or ""
        if not username:
            raise PublicBackendError("Username is required.", status=400)
        hashed = hash_password(password)
        account_id = new_id("acct")
        timestamp = now_iso()
        with self.session() as db:
            db.execute(
                """
                INSERT INTO accounts
                (id, username, display_name, role, scope, parent_id, password_salt, password_hash, status, created_at, updated_at)
                VALUES (?, ?, ?, 'admin', 'public', NULL, ?, ?, 'active', ?, ?)
                """,
                (account_id, username, display_name, hashed["salt"], hashed["hash"], timestamp, timestamp),
            )
            self.write_audit_log(db, account_id, "bootstrap_admin", "account", account_id, {"username": username})
        return {"account": self.account_by_id(account_id)}

    def public_signup(self, payload):
        role = normalize_role(payload.get("role") or "student")
        if role not in {"student", "parent"}:
            raise PublicBackendError("Public signup only supports student and parent accounts.", status=403)
        username = str(payload.get("username") or "").strip()
        display_name = str(payload.get("displayName") or username).strip()
        password = payload.get("password") or ""
        parent_id = payload.get("parentId") or None
        scope = "public"

        if not username:
            raise PublicBackendError("Username is required.", status=400)
        if role == "student" and parent_id:
            parent = self.account_by_id(parent_id)
            if not parent or parent.get("role") != "parent":
                raise PublicBackendError("Parent account does not exist.", status=400)
            scope = "family"
        if role == "parent":
            parent_id = None

        hashed = hash_password(password)
        account_id = new_id("acct")
        timestamp = now_iso()
        try:
            with self.session() as db:
                db.execute(
                    """
                    INSERT INTO accounts
                    (id, username, display_name, role, scope, parent_id, password_salt, password_hash, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
                    """,
                    (account_id, username, display_name, role, scope, parent_id, hashed["salt"], hashed["hash"], timestamp, timestamp),
                )
                token, expires_at = self.issue_session(db, account_id, username, action="public_signup")
                self.write_audit_log(
                    db,
                    account_id,
                    "create_public_account",
                    "account",
                    account_id,
                    {"username": username, "role": role, "scope": scope, "parentId": parent_id},
                )
        except backend_integrity_errors() as error:
            raise PublicBackendError(f"Account could not be created: {error}", status=409)
        return {"token": token, "expiresAt": expires_at, "account": self.account_by_id(account_id)}

    def login(self, payload):
        username = str(payload.get("username") or "").strip()
        password = payload.get("password") or ""
        row = self.account_by_username_private(username)
        if not row or row["status"] != "active":
            raise PublicBackendError("Invalid username or password.", status=401)
        if not verify_password(password, row["password_salt"], row["password_hash"]):
            raise PublicBackendError("Invalid username or password.", status=401)

        with self.session() as db:
            token, expires_at = self.issue_session(db, row["id"], username, action="login")
        return {"token": token, "expiresAt": expires_at, "account": row_to_account(row)}

    def refresh_session(self, token):
        if not token:
            raise PublicBackendError("Authentication required.", status=401)
        current_hash = hash_token(token)
        with self.session() as db:
            row = db.execute(
                """
                SELECT accounts.*, sessions.token_hash AS current_token_hash
                FROM sessions
                JOIN accounts ON accounts.id = sessions.account_id
                WHERE sessions.token_hash = ?
                  AND sessions.revoked_at IS NULL
                  AND sessions.expires_at > ?
                  AND accounts.status = 'active'
                """,
                (current_hash, now_unix()),
            ).fetchone()
            if not row:
                raise PublicBackendError("Authentication required.", status=401)
            db.execute("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?", (now_unix(), current_hash))
            new_token, expires_at = self.issue_session(
                db,
                row["id"],
                row["username"],
                action="refresh_session",
                rotated_from=current_hash,
            )
        return {"token": new_token, "expiresAt": expires_at, "account": row_to_account(row)}

    def logout(self, token):
        if not token:
            raise PublicBackendError("Authentication required.", status=401)
        token_hash = hash_token(token)
        with self.session() as db:
            row = db.execute(
                """
                SELECT sessions.account_id, accounts.username
                FROM sessions
                JOIN accounts ON accounts.id = sessions.account_id
                WHERE sessions.token_hash = ?
                  AND sessions.revoked_at IS NULL
                """,
                (token_hash,),
            ).fetchone()
            if not row:
                raise PublicBackendError("Authentication required.", status=401)
            db.execute("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?", (now_unix(), token_hash))
            self.write_audit_log(db, row["account_id"], "logout", "session", token_hash, {"username": row["username"]})
        return {"ok": True}

    def account_for_token(self, token):
        if not token:
            raise PublicBackendError("Authentication required.", status=401)
        with self.session() as db:
            row = db.execute(
                """
                SELECT accounts.* FROM sessions
                JOIN accounts ON accounts.id = sessions.account_id
                WHERE sessions.token_hash = ?
                  AND sessions.revoked_at IS NULL
                  AND sessions.expires_at > ?
                  AND accounts.status = 'active'
                """,
                (hash_token(token), now_unix()),
            ).fetchone()
        if not row:
            raise PublicBackendError("Authentication required.", status=401)
        return row_to_account(row)

    def require_role(self, actor, roles):
        if actor["role"] not in set(roles):
            raise PublicBackendError("Permission denied.", status=403)

    def can_view_account(self, actor, account_id):
        if actor["id"] == account_id:
            return True
        if actor["role"] in {"admin", "content_admin", "teacher"}:
            return True
        if actor["role"] == "parent":
            account = self.account_by_id(account_id)
            return bool(account and account.get("parentId") == actor["id"])
        return False

    def list_accounts(self, actor):
        with self.session() as db:
            if actor["role"] in {"admin", "content_admin", "teacher"}:
                rows = db.execute(
                    """
                    SELECT * FROM accounts
                    ORDER BY
                      CASE role WHEN 'admin' THEN 0 WHEN 'content_admin' THEN 1 WHEN 'teacher' THEN 2 WHEN 'parent' THEN 3 ELSE 4 END,
                      created_at ASC
                    """
                ).fetchall()
            elif actor["role"] == "parent":
                rows = db.execute(
                    """
                    SELECT * FROM accounts
                    WHERE id = ? OR parent_id = ?
                    ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, created_at ASC
                    """,
                    (actor["id"], actor["id"], actor["id"]),
                ).fetchall()
            else:
                rows = db.execute("SELECT * FROM accounts WHERE id = ?", (actor["id"],)).fetchall()
        items = [row_to_account(row) for row in rows]
        return {"items": items, "count": len(items)}

    def update_account_status(self, actor, account_id, payload):
        self.require_role(actor, {"admin", "content_admin"})
        status = str(payload.get("status") or "").strip().lower()
        if status not in {"active", "suspended", "disabled"}:
            raise PublicBackendError("Unsupported account status.", status=400)
        if actor["id"] == account_id and status != "active":
            raise PublicBackendError("You cannot deactivate your own backend account.", status=409)
        timestamp = now_iso()
        revoked_sessions = 0
        with self.session() as db:
            row = db.execute("SELECT * FROM accounts WHERE id = ?", (account_id,)).fetchone()
            if not row:
                raise PublicBackendError("Account not found.", status=404)
            target = row_to_account(row)
            if target["role"] in {"admin", "content_admin"} and status != "active":
                active_admins = db.execute(
                    "SELECT COUNT(*) AS count FROM accounts WHERE role IN ('admin', 'content_admin') AND status = 'active' AND id != ?",
                    (account_id,),
                ).fetchone()["count"]
                if int(active_admins) < 1:
                    raise PublicBackendError("At least one active backend admin is required.", status=409)
            db.execute("UPDATE accounts SET status = ?, updated_at = ? WHERE id = ?", (status, timestamp, account_id))
            if status != "active":
                result = db.execute(
                    "UPDATE sessions SET revoked_at = ? WHERE account_id = ? AND revoked_at IS NULL",
                    (now_unix(), account_id),
                )
                revoked_sessions = int(result.rowcount or 0)
            self.write_audit_log(
                db,
                actor["id"],
                "update_account_status",
                "account",
                account_id,
                {"status": status, "previousStatus": target["status"], "revokedSessions": revoked_sessions},
            )
        return {"account": self.account_by_id(account_id), "revokedSessions": revoked_sessions}

    def create_account(self, actor, payload):
        role = normalize_role(payload.get("role") or "student")
        scope = normalize_scope(payload.get("scope") or "public")
        username = str(payload.get("username") or "").strip()
        display_name = str(payload.get("displayName") or username).strip()
        password = payload.get("password") or ""
        parent_id = payload.get("parentId") or None

        if not username:
            raise PublicBackendError("Username is required.", status=400)
        if actor["role"] == "parent":
            if role != "student":
                raise PublicBackendError("Parents can only create linked student accounts.", status=403)
            parent_id = actor["id"]
            scope = "family"
        else:
            self.require_role(actor, {"admin", "content_admin"})
            if parent_id and not self.account_by_id(parent_id):
                raise PublicBackendError("Parent account does not exist.", status=400)

        hashed = hash_password(password)
        account_id = new_id("acct")
        timestamp = now_iso()
        try:
            with self.session() as db:
                db.execute(
                    """
                    INSERT INTO accounts
                    (id, username, display_name, role, scope, parent_id, password_salt, password_hash, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
                    """,
                    (account_id, username, display_name, role, scope, parent_id, hashed["salt"], hashed["hash"], timestamp, timestamp),
                )
                self.write_audit_log(
                    db,
                    actor["id"],
                    "create_account",
                    "account",
                    account_id,
                    {"username": username, "role": role, "scope": scope, "parentId": parent_id},
                )
        except backend_integrity_errors() as error:
            raise PublicBackendError(f"Account could not be created: {error}", status=409)
        return {"account": self.account_by_id(account_id)}

    def save_progress(self, actor, payload):
        account_id = payload.get("accountId") or actor["id"]
        if not self.can_view_account(actor, account_id):
            raise PublicBackendError("Permission denied.", status=403)
        progress = payload.get("progress")
        if not isinstance(progress, dict):
            raise PublicBackendError("Progress payload must be an object.", status=400)
        progress, redactions = sanitize_public_payload(progress)
        source = normalize_sync_source(payload.get("source"), "sat_studio")
        timestamp = now_iso()
        progress_id = new_id("progress")
        with self.session() as db:
            db.execute(
                """
                INSERT INTO progress_records (id, account_id, payload_json, source, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(account_id, source)
                DO UPDATE SET payload_json = excluded.payload_json, updated_at = excluded.updated_at
                """,
                (progress_id, account_id, json.dumps(progress, ensure_ascii=True, sort_keys=True), source, timestamp),
            )
            self.write_audit_log(db, actor["id"], "save_progress", "progress", account_id, {"source": source})
        result = self.get_progress(actor, account_id, source)
        result["contentSafety"] = content_safety_summary(redactions)
        return result

    def get_progress(self, actor, account_id=None, source="sat_studio"):
        account_id = account_id or actor["id"]
        source = normalize_sync_source(source, "sat_studio")
        if not self.can_view_account(actor, account_id):
            raise PublicBackendError("Permission denied.", status=403)
        with self.session() as db:
            row = db.execute(
                "SELECT * FROM progress_records WHERE account_id = ? AND source = ?",
                (account_id, source),
            ).fetchone()
        if not row:
            return {"accountId": account_id, "source": source, "progress": {}, "updatedAt": None}
        progress, redactions = sanitize_public_payload(json.loads(row["payload_json"] or "{}"))
        return {
            "accountId": row["account_id"],
            "source": row["source"],
            "progress": progress,
            "updatedAt": row["updated_at"],
            "contentSafety": content_safety_summary(redactions),
        }

    def save_profile(self, actor, payload):
        account_id = payload.get("accountId") or actor["id"]
        if not self.can_view_account(actor, account_id):
            raise PublicBackendError("Permission denied.", status=403)
        profile = payload.get("profile")
        if not isinstance(profile, dict):
            raise PublicBackendError("Profile payload must be an object.", status=400)
        profile, redactions = sanitize_public_payload(profile)
        source = normalize_sync_source(payload.get("source"), "sat_studio_profile")
        client_revision = int(payload.get("clientRevision") or 0)
        base_server_revision = payload.get("baseServerRevision")
        merge_strategy = str(payload.get("mergeStrategy") or "reject_conflict").strip().lower()
        timestamp = now_iso()

        with self.session() as db:
            existing = db.execute(
                "SELECT * FROM profile_records WHERE account_id = ? AND source = ?",
                (account_id, source),
            ).fetchone()
            if existing:
                current_revision = int(existing["server_revision"])
                if (
                    base_server_revision is not None
                    and int(base_server_revision) != current_revision
                    and merge_strategy not in {"overwrite", "client_wins"}
                ):
                    server_profile, conflict_redactions = sanitize_public_payload(json.loads(existing["profile_json"] or "{}"))
                    return {
                        "conflict": True,
                        "accountId": account_id,
                        "source": source,
                        "serverRevision": current_revision,
                        "updatedAt": existing["updated_at"],
                        "serverProfile": server_profile,
                        "contentSafety": content_safety_summary(conflict_redactions),
                    }, 409
                server_revision = current_revision + 1
                db.execute(
                    """
                    UPDATE profile_records
                    SET profile_json = ?, client_revision = ?, server_revision = ?, updated_at = ?, updated_by_account_id = ?
                    WHERE account_id = ? AND source = ?
                    """,
                    (
                        json.dumps(profile, ensure_ascii=True, sort_keys=True),
                        client_revision,
                        server_revision,
                        timestamp,
                        actor["id"],
                        account_id,
                        source,
                    ),
                )
            else:
                server_revision = 1
                db.execute(
                    """
                    INSERT INTO profile_records
                    (id, account_id, profile_json, source, client_revision, server_revision, updated_at, updated_by_account_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        new_id("profile"),
                        account_id,
                        json.dumps(profile, ensure_ascii=True, sort_keys=True),
                        source,
                        client_revision,
                        server_revision,
                        timestamp,
                        actor["id"],
                    ),
                )
            self.write_audit_log(
                db,
                actor["id"],
                "save_profile",
                "profile",
                account_id,
                {"source": source, "serverRevision": server_revision, "clientRevision": client_revision, "contentRedactions": len(redactions)},
            )
        result = self.get_profile(actor, account_id, source)
        result["contentSafety"] = content_safety_summary(redactions)
        return result

    def get_profile(self, actor, account_id=None, source="sat_studio_profile"):
        account_id = account_id or actor["id"]
        source = normalize_sync_source(source, "sat_studio_profile")
        if not self.can_view_account(actor, account_id):
            raise PublicBackendError("Permission denied.", status=403)
        with self.session() as db:
            row = db.execute(
                "SELECT * FROM profile_records WHERE account_id = ? AND source = ?",
                (account_id, source),
            ).fetchone()
        if not row:
            return {
                "accountId": account_id,
                "source": source,
                "profile": {},
                "clientRevision": 0,
                "serverRevision": 0,
                "updatedAt": None,
                "updatedByAccountId": None,
            }
        profile, redactions = sanitize_public_payload(json.loads(row["profile_json"] or "{}"))
        return {
            "accountId": row["account_id"],
            "source": row["source"],
            "profile": profile,
            "clientRevision": int(row["client_revision"] or 0),
            "serverRevision": int(row["server_revision"] or 0),
            "updatedAt": row["updated_at"],
            "updatedByAccountId": row["updated_by_account_id"],
            "contentSafety": content_safety_summary(redactions),
        }

    def generate_class_join_code(self, db):
        for _attempt in range(20):
            token = secrets.token_urlsafe(5).replace("-", "").replace("_", "").upper()[:6]
            join_code = f"SAT-{token}"
            row = db.execute("SELECT id FROM classes WHERE join_code = ?", (join_code,)).fetchone()
            if not row:
                return join_code
        raise PublicBackendError("Could not allocate a class join code.", status=500)

    def class_payload(self, row, member_count=0):
        return {
            "id": row["id"],
            "name": row["name"],
            "joinCode": row["join_code"],
            "teacherAccountId": row["teacher_account_id"],
            "teacherDisplayName": row["teacher_display_name"] if "teacher_display_name" in row.keys() else "",
            "teacherUsername": row["teacher_username"] if "teacher_username" in row.keys() else "",
            "status": row["status"],
            "memberCount": int(member_count or 0),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }

    def class_query(self):
        return """
            SELECT classes.*, accounts.display_name AS teacher_display_name, accounts.username AS teacher_username
            FROM classes
            JOIN accounts ON accounts.id = classes.teacher_account_id
        """

    def class_row_by_id(self, db, class_id):
        return db.execute(f"{self.class_query()} WHERE classes.id = ?", (class_id,)).fetchone()

    def class_member_count(self, db, class_id):
        row = db.execute(
            "SELECT COUNT(*) AS count FROM class_memberships WHERE class_id = ? AND status = 'active'",
            (class_id,),
        ).fetchone()
        return int(row["count"] or 0)

    def can_manage_class_row(self, actor, class_row):
        return bool(is_admin_role(actor) or (actor["role"] == "teacher" and class_row["teacher_account_id"] == actor["id"]))

    def can_view_class_row(self, db, actor, class_row):
        if self.can_manage_class_row(actor, class_row):
            return True
        if actor["role"] == "student":
            row = db.execute(
                """
                SELECT id FROM class_memberships
                WHERE class_id = ? AND student_account_id = ? AND status = 'active'
                """,
                (class_row["id"], actor["id"]),
            ).fetchone()
            return bool(row)
        if actor["role"] == "parent":
            row = db.execute(
                """
                SELECT class_memberships.id
                FROM class_memberships
                JOIN accounts ON accounts.id = class_memberships.student_account_id
                WHERE class_memberships.class_id = ?
                  AND class_memberships.status = 'active'
                  AND accounts.parent_id = ?
                """,
                (class_row["id"], actor["id"]),
            ).fetchone()
            return bool(row)
        return False

    def require_class_view(self, db, actor, class_id):
        row = self.class_row_by_id(db, class_id)
        if not row:
            raise PublicBackendError("Class not found.", status=404)
        if not self.can_view_class_row(db, actor, row):
            raise PublicBackendError("Permission denied.", status=403)
        return row

    def require_class_manager(self, db, actor, class_id):
        row = self.class_row_by_id(db, class_id)
        if not row:
            raise PublicBackendError("Class not found.", status=404)
        if not self.can_manage_class_row(actor, row):
            raise PublicBackendError("Permission denied.", status=403)
        return row

    def validate_student_for_class_action(self, db, actor, student_account_id):
        student = db.execute("SELECT * FROM accounts WHERE id = ?", (student_account_id,)).fetchone()
        if not student or student["role"] != "student" or student["status"] != "active":
            raise PublicBackendError("Student account not found.", status=404)
        if actor["role"] == "student" and actor["id"] != student_account_id:
            raise PublicBackendError("Permission denied.", status=403)
        if actor["role"] == "parent" and student["parent_id"] != actor["id"]:
            raise PublicBackendError("Permission denied.", status=403)
        if actor["role"] in {"teacher"}:
            raise PublicBackendError("Teachers cannot join students to classes directly.", status=403)
        if actor["role"] not in {"student", "parent", "admin", "content_admin"}:
            raise PublicBackendError("Permission denied.", status=403)
        return student

    def create_class(self, actor, payload):
        self.require_role(actor, {"admin", "content_admin", "teacher"})
        name = str(payload.get("name") or payload.get("className") or "").strip()
        if not name:
            raise PublicBackendError("Class name is required.", status=400)
        teacher_account_id = str(payload.get("teacherAccountId") or actor["id"]).strip()
        timestamp = now_iso()
        with self.session() as db:
            teacher = db.execute("SELECT * FROM accounts WHERE id = ?", (teacher_account_id,)).fetchone()
            if not teacher or teacher["role"] != "teacher" or teacher["status"] != "active":
                raise PublicBackendError("Active teacher account is required.", status=400)
            if actor["role"] == "teacher" and teacher_account_id != actor["id"]:
                raise PublicBackendError("Teachers can only create their own classes.", status=403)
            class_id = new_id("class")
            join_code = self.generate_class_join_code(db)
            db.execute(
                """
                INSERT INTO classes (id, name, join_code, teacher_account_id, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'active', ?, ?)
                """,
                (class_id, name, join_code, teacher_account_id, timestamp, timestamp),
            )
            self.write_audit_log(db, actor["id"], "create_class", "class", class_id, {"name": name, "teacherAccountId": teacher_account_id})
            row = self.class_row_by_id(db, class_id)
            return {"class": self.class_payload(row, 0)}

    def list_classes(self, actor):
        params = []
        where = ""
        if actor["role"] == "teacher":
            where = "WHERE classes.teacher_account_id = ?"
            params.append(actor["id"])
        elif actor["role"] == "student":
            where = """
                JOIN class_memberships ON class_memberships.class_id = classes.id
                WHERE class_memberships.student_account_id = ?
                  AND class_memberships.status = 'active'
            """
            params.append(actor["id"])
        elif actor["role"] == "parent":
            where = """
                JOIN class_memberships ON class_memberships.class_id = classes.id
                JOIN accounts AS student_accounts ON student_accounts.id = class_memberships.student_account_id
                WHERE student_accounts.parent_id = ?
                  AND class_memberships.status = 'active'
            """
            params.append(actor["id"])
        elif not is_admin_role(actor):
            raise PublicBackendError("Permission denied.", status=403)

        with self.session() as db:
            rows = db.execute(
                f"""
                {self.class_query()}
                {where}
                ORDER BY classes.created_at DESC
                """,
                tuple(params),
            ).fetchall()
            items = [self.class_payload(row, self.class_member_count(db, row["id"])) for row in rows]
        return {"items": items, "count": len(items)}

    def join_class(self, actor, payload):
        join_code = str(payload.get("joinCode") or payload.get("classCode") or "").strip().upper()
        if not join_code:
            raise PublicBackendError("joinCode is required.", status=400)
        student_account_id = str(payload.get("studentAccountId") or actor["id"]).strip()
        timestamp = now_iso()
        with self.session() as db:
            class_row = db.execute(f"{self.class_query()} WHERE upper(classes.join_code) = ?", (join_code,)).fetchone()
            if not class_row or class_row["status"] != "active":
                raise PublicBackendError("Class join code is invalid.", status=404)
            self.validate_student_for_class_action(db, actor, student_account_id)
            membership_id = new_id("member")
            db.execute(
                """
                INSERT INTO class_memberships (id, class_id, student_account_id, status, joined_at)
                VALUES (?, ?, ?, 'active', ?)
                ON CONFLICT(class_id, student_account_id)
                DO UPDATE SET status = 'active', joined_at = excluded.joined_at
                """,
                (membership_id, class_row["id"], student_account_id, timestamp),
            )
            self.write_audit_log(
                db,
                actor["id"],
                "join_class",
                "class",
                class_row["id"],
                {"studentAccountId": student_account_id, "joinCode": join_code},
            )
            member_count = self.class_member_count(db, class_row["id"])
        return {"class": self.class_payload(class_row, member_count), "studentAccountId": student_account_id, "joinedAt": timestamp}

    def active_class_student_ids(self, db, class_id):
        rows = db.execute(
            """
            SELECT student_account_id
            FROM class_memberships
            WHERE class_id = ? AND status = 'active'
            ORDER BY joined_at ASC
            """,
            (class_id,),
        ).fetchall()
        return [row["student_account_id"] for row in rows]

    def assignment_payload(self, row, evidence_rows=None):
        evidence_rows = evidence_rows or []
        try:
            target_student_ids = json.loads(row["target_student_ids_json"] or "[]")
        except json.JSONDecodeError:
            target_student_ids = []
        evidence_by_student = {}
        for evidence in evidence_rows:
            try:
                evidence_payload = json.loads(evidence["evidence_json"] or "{}")
            except json.JSONDecodeError:
                evidence_payload = {}
            evidence_by_student[evidence["student_account_id"]] = {
                "id": evidence["id"],
                "studentAccountId": evidence["student_account_id"],
                "status": evidence["status"],
                "submittedAt": evidence["submitted_at"],
                "evidence": evidence_payload,
            }
        return {
            "id": row["id"],
            "classId": row["class_id"],
            "title": row["title"],
            "mode": row["mode"],
            "focusSkill": row["focus_skill"],
            "dueDate": row["due_date"],
            "targetStudentIds": [str(item) for item in target_student_ids if str(item).strip()],
            "status": row["status"],
            "createdAt": row["created_at"],
            "createdByAccountId": row["created_by_account_id"],
            "evidenceByStudent": evidence_by_student,
        }

    def list_class_assignments(self, actor, class_id):
        with self.session() as db:
            self.require_class_view(db, actor, class_id)
            rows = db.execute(
                "SELECT * FROM class_assignments WHERE class_id = ? ORDER BY created_at DESC",
                (class_id,),
            ).fetchall()
            assignment_ids = [row["id"] for row in rows]
            evidence_rows_by_assignment = {}
            if assignment_ids:
                placeholders = ",".join("?" for _ in assignment_ids)
                evidence_rows = db.execute(
                    f"SELECT * FROM assignment_evidence WHERE assignment_id IN ({placeholders}) ORDER BY submitted_at DESC",
                    tuple(assignment_ids),
                ).fetchall()
                for evidence in evidence_rows:
                    evidence_rows_by_assignment.setdefault(evidence["assignment_id"], []).append(evidence)
            items = [self.assignment_payload(row, evidence_rows_by_assignment.get(row["id"], [])) for row in rows]
        return {"items": items, "count": len(items), "classId": class_id}

    def create_class_assignment(self, actor, class_id, payload):
        title = str(payload.get("title") or "").strip()
        focus_skill = str(payload.get("focusSkill") or payload.get("skill") or "").strip()
        mode = str(payload.get("mode") or "remedial_sprint").strip()
        due_date = str(payload.get("dueDate") or "").strip()
        target_student_ids = payload.get("targetStudentIds")
        if not title:
            raise PublicBackendError("Assignment title is required.", status=400)
        if not focus_skill:
            raise PublicBackendError("Assignment focusSkill is required.", status=400)
        if mode not in {"diagnostic", "remedial_sprint", "proof_review", "timed_mixed", "crucible"}:
            raise PublicBackendError("Unsupported assignment mode.", status=400)
        if not due_date:
            raise PublicBackendError("Assignment dueDate is required.", status=400)
        if not isinstance(target_student_ids, list):
            target_student_ids = []
        target_student_ids = [str(item).strip() for item in target_student_ids if str(item).strip()]
        timestamp = now_iso()
        with self.session() as db:
            self.require_class_manager(db, actor, class_id)
            active_student_ids = set(self.active_class_student_ids(db, class_id))
            if target_student_ids:
                invalid = [student_id for student_id in target_student_ids if student_id not in active_student_ids]
                if invalid:
                    raise PublicBackendError("Assignment targets must be active class members.", status=400)
            else:
                target_student_ids = sorted(active_student_ids)
            assignment_id = new_id("assign")
            db.execute(
                """
                INSERT INTO class_assignments
                (id, class_id, title, mode, focus_skill, due_date, target_student_ids_json, status, created_at, created_by_account_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned', ?, ?)
                """,
                (
                    assignment_id,
                    class_id,
                    title,
                    mode,
                    focus_skill,
                    due_date,
                    json.dumps(target_student_ids, ensure_ascii=True, sort_keys=True),
                    timestamp,
                    actor["id"],
                ),
            )
            self.write_audit_log(
                db,
                actor["id"],
                "create_class_assignment",
                "assignment",
                assignment_id,
                {"classId": class_id, "mode": mode, "targetCount": len(target_student_ids)},
            )
            row = db.execute("SELECT * FROM class_assignments WHERE id = ?", (assignment_id,)).fetchone()
        return {"assignment": self.assignment_payload(row)}

    def assignment_row_by_id(self, db, assignment_id):
        return db.execute("SELECT * FROM class_assignments WHERE id = ?", (assignment_id,)).fetchone()

    def submit_assignment_evidence(self, actor, assignment_id, payload):
        student_account_id = str(payload.get("studentAccountId") or actor["id"]).strip()
        evidence = payload.get("evidence")
        if not isinstance(evidence, dict):
            evidence = {}
        status = str(payload.get("status") or "submitted").strip().lower()
        if status not in {"submitted", "completed", "reviewed"}:
            raise PublicBackendError("Unsupported evidence status.", status=400)
        timestamp = now_iso()
        with self.session() as db:
            assignment = self.assignment_row_by_id(db, assignment_id)
            if not assignment:
                raise PublicBackendError("Assignment not found.", status=404)
            class_row = self.require_class_view(db, actor, assignment["class_id"])
            self.validate_student_for_class_action(db, actor, student_account_id)
            active_student_ids = set(self.active_class_student_ids(db, class_row["id"]))
            if student_account_id not in active_student_ids:
                raise PublicBackendError("Student is not an active member of this class.", status=403)
            target_student_ids = set(json.loads(assignment["target_student_ids_json"] or "[]"))
            if target_student_ids and student_account_id not in target_student_ids:
                raise PublicBackendError("Assignment is not targeted to this student.", status=403)
            evidence_id = new_id("evidence")
            sanitized_evidence, redactions = sanitize_public_payload(evidence)
            db.execute(
                """
                INSERT INTO assignment_evidence (id, assignment_id, student_account_id, evidence_json, status, submitted_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(assignment_id, student_account_id)
                DO UPDATE SET evidence_json = excluded.evidence_json, status = excluded.status, submitted_at = excluded.submitted_at
                """,
                (
                    evidence_id,
                    assignment_id,
                    student_account_id,
                    json.dumps(sanitized_evidence, ensure_ascii=True, sort_keys=True),
                    status,
                    timestamp,
                ),
            )
            self.write_audit_log(
                db,
                actor["id"],
                "submit_assignment_evidence",
                "assignment",
                assignment_id,
                {"studentAccountId": student_account_id, "status": status, "contentRedactions": len(redactions)},
            )
            row = self.assignment_row_by_id(db, assignment_id)
            evidence_rows = db.execute("SELECT * FROM assignment_evidence WHERE assignment_id = ?", (assignment_id,)).fetchall()
        return {
            "assignment": self.assignment_payload(row, evidence_rows),
            "studentAccountId": student_account_id,
            "submittedAt": timestamp,
            "contentSafety": content_safety_summary(redactions),
        }

    def profile_body_from_json(self, raw):
        try:
            profile = json.loads(raw or "{}")
        except json.JSONDecodeError:
            return {}
        if isinstance(profile, dict) and isinstance(profile.get("profile"), dict):
            return profile["profile"]
        return profile if isinstance(profile, dict) else {}

    def class_report(self, actor, class_id):
        with self.session() as db:
            class_row = self.require_class_manager(db, actor, class_id)
            student_rows = db.execute(
                """
                SELECT accounts.*
                FROM class_memberships
                JOIN accounts ON accounts.id = class_memberships.student_account_id
                WHERE class_memberships.class_id = ?
                  AND class_memberships.status = 'active'
                  AND accounts.status = 'active'
                ORDER BY accounts.display_name ASC
                """,
                (class_id,),
            ).fetchall()
            student_ids = [row["id"] for row in student_rows]
            profile_rows_by_student = {}
            if student_ids:
                placeholders = ",".join("?" for _ in student_ids)
                profile_rows = db.execute(
                    f"""
                    SELECT *
                    FROM profile_records
                    WHERE source = 'sat_studio_profile'
                      AND account_id IN ({placeholders})
                    """,
                    tuple(student_ids),
                ).fetchall()
                profile_rows_by_student = {row["account_id"]: row for row in profile_rows}
            assignments = db.execute("SELECT * FROM class_assignments WHERE class_id = ? ORDER BY created_at DESC", (class_id,)).fetchall()
            assignment_ids = [row["id"] for row in assignments]
            evidence_rows = []
            if assignment_ids:
                placeholders = ",".join("?" for _ in assignment_ids)
                evidence_rows = db.execute(
                    f"SELECT * FROM assignment_evidence WHERE assignment_id IN ({placeholders}) ORDER BY submitted_at DESC",
                    tuple(assignment_ids),
                ).fetchall()

            item_map = {}
            skill_map = {}
            students = []
            for student in student_rows:
                profile_row = profile_rows_by_student.get(student["id"])
                profile_body = self.profile_body_from_json(profile_row["profile_json"]) if profile_row else {}
                attempts = profile_body.get("attempts") if isinstance(profile_body, dict) else []
                if not isinstance(attempts, list):
                    attempts = []
                correct_count = 0
                last_activity = ""
                skill_wrong = {}
                for attempt in attempts:
                    if not isinstance(attempt, dict):
                        continue
                    is_correct = bool(attempt.get("correct"))
                    correct_count += 1 if is_correct else 0
                    question_id = str(attempt.get("questionId") or attempt.get("id") or "").strip() or "unknown"
                    skill = str(attempt.get("skill") or attempt.get("domain") or "Unmapped SAT skill").strip() or "Unmapped SAT skill"
                    updated = str(attempt.get("answeredAt") or attempt.get("createdAt") or attempt.get("submittedAt") or "")
                    if updated > last_activity:
                        last_activity = updated
                    item = item_map.setdefault(question_id, {"questionId": question_id, "skill": skill, "attempts": 0, "wrong": 0})
                    item["attempts"] += 1
                    if not is_correct:
                        item["wrong"] += 1
                    skill_stat = skill_map.setdefault(skill, {"skill": skill, "attempts": 0, "wrong": 0})
                    skill_stat["attempts"] += 1
                    if not is_correct:
                        skill_stat["wrong"] += 1
                        skill_wrong[skill] = skill_wrong.get(skill, 0) + 1
                total_attempts = len([attempt for attempt in attempts if isinstance(attempt, dict)])
                accuracy = round((correct_count / total_attempts) * 100) if total_attempts else 0
                weakest_skill = sorted(skill_wrong.items(), key=lambda item: (-item[1], item[0]))[0][0] if skill_wrong else "No weak skill yet"
                students.append(
                    {
                        "account": row_to_account(student),
                        "attempts": total_attempts,
                        "accuracy": accuracy,
                        "wrong": max(0, total_attempts - correct_count),
                        "weakestSkill": weakest_skill,
                        "lastActivityAt": last_activity,
                    }
                )

            evidence_by_assignment = {}
            for evidence in evidence_rows:
                evidence_by_assignment.setdefault(evidence["assignment_id"], []).append(evidence)

        item_stats = [
            {**item, "wrongRatePct": round((item["wrong"] / item["attempts"]) * 100) if item["attempts"] else 0}
            for item in item_map.values()
        ]
        skill_stats = [
            {
                **skill,
                "accuracyPct": round(((skill["attempts"] - skill["wrong"]) / skill["attempts"]) * 100) if skill["attempts"] else 0,
                "wrongRatePct": round((skill["wrong"] / skill["attempts"]) * 100) if skill["attempts"] else 0,
            }
            for skill in skill_map.values()
        ]
        item_stats.sort(key=lambda item: (-item["wrongRatePct"], -item["attempts"], item["questionId"]))
        skill_stats.sort(key=lambda item: (item["accuracyPct"], -item["attempts"], item["skill"]))
        return {
            "class": self.class_payload(class_row, len(students)),
            "students": students,
            "assignments": [self.assignment_payload(row, evidence_by_assignment.get(row["id"], [])) for row in assignments],
            "skillStats": skill_stats,
            "itemStats": item_stats[:50],
            "generatedAt": now_iso(),
        }

    def create_question_audit(self, actor, payload):
        question_id = str(payload.get("questionId") or "").strip()
        if not question_id:
            raise PublicBackendError("questionId is required.", status=400)
        issue_type = str(payload.get("issueType") or "content_issue").strip()
        severity = str(payload.get("severity") or "medium").strip().lower()
        if severity not in {"low", "medium", "high", "critical"}:
            raise PublicBackendError("Unsupported audit severity.", status=400)
        note = str(payload.get("note") or "").strip()
        audit_id = new_id("qaudit")
        timestamp = now_iso()
        with self.session() as db:
            db.execute(
                """
                INSERT INTO question_audits
                (id, question_id, reporter_account_id, issue_type, severity, note, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'open', ?)
                """,
                (audit_id, question_id, actor["id"], issue_type, severity, note, timestamp),
            )
            self.write_audit_log(
                db,
                actor["id"],
                "create_question_audit",
                "question",
                question_id,
                {"auditId": audit_id, "severity": severity, "issueType": issue_type},
            )
        return {"audit": self.get_question_audit(audit_id)}

    def get_question_audit(self, audit_id):
        with self.session() as db:
            row = db.execute("SELECT * FROM question_audits WHERE id = ?", (audit_id,)).fetchone()
        if not row:
            raise PublicBackendError("Audit report not found.", status=404)
        return {
            "id": row["id"],
            "questionId": row["question_id"],
            "reporterAccountId": row["reporter_account_id"],
            "issueType": row["issue_type"],
            "severity": row["severity"],
            "note": row["note"],
            "status": row["status"],
            "resolutionNote": row["resolution_note"],
            "createdAt": row["created_at"],
            "resolvedAt": row["resolved_at"],
            "resolverAccountId": row["resolver_account_id"],
        }

    def resolve_question_audit(self, actor, audit_id, payload):
        self.require_role(actor, {"admin", "content_admin"})
        status = str(payload.get("status") or "resolved").strip().lower()
        if status not in {"resolved", "blocked", "rejected"}:
            raise PublicBackendError("Unsupported audit resolution status.", status=400)
        note = str(payload.get("resolutionNote") or "").strip()
        timestamp = now_iso()
        with self.session() as db:
            result = db.execute(
                """
                UPDATE question_audits
                SET status = ?, resolution_note = ?, resolved_at = ?, resolver_account_id = ?
                WHERE id = ?
                """,
                (status, note, timestamp, actor["id"], audit_id),
            )
            if result.rowcount == 0:
                raise PublicBackendError("Audit report not found.", status=404)
            self.write_audit_log(db, actor["id"], "resolve_question_audit", "question_audit", audit_id, {"status": status})
        return {"audit": self.get_question_audit(audit_id)}

    def question_review_version_payload(self, row):
        return {
            "id": row["id"],
            "questionId": row["question_id"],
            "sourceFile": row["source_file"],
            "sourceIndex": int(row["source_index"] or -1),
            "versionNumber": int(row["version_number"] or 0),
            "status": row["status"],
            "note": row["note"],
            "draft": json.loads(row["draft_json"] or "{}"),
            "before": json.loads(row["before_json"] or "{}"),
            "validation": json.loads(row["validation_json"] or "{}"),
            "localVersionId": row["local_version_id"],
            "localVersionNumber": int(row["local_version_number"] or 0),
            "createdAt": row["created_at"],
            "createdByAccountId": row["created_by_account_id"],
        }

    def list_question_review_versions(self, actor, question_id="", limit=50):
        self.require_role(actor, {"admin", "content_admin"})
        safe_limit = max(1, min(200, int(limit or 50)))
        params = []
        where = ""
        if question_id:
            where = "WHERE question_id = ?"
            params.append(str(question_id).strip())
        params.append(safe_limit)
        with self.session() as db:
            rows = db.execute(
                f"SELECT * FROM question_review_versions {where} ORDER BY created_at DESC, version_number DESC LIMIT ?",
                tuple(params),
            ).fetchall()
        return {
            "items": [self.question_review_version_payload(row) for row in rows],
            "count": len(rows),
            "filters": {"questionId": question_id or "", "limit": safe_limit},
        }

    def save_question_review_version(self, actor, payload):
        self.require_role(actor, {"admin", "content_admin"})
        question_id = str(payload.get("questionId") or "").strip()
        if not question_id:
            raise PublicBackendError("questionId is required.", status=400)
        draft = payload.get("draft")
        if not isinstance(draft, dict):
            raise PublicBackendError("draft must be a JSON object.", status=400)
        before = payload.get("before") if isinstance(payload.get("before"), dict) else {}
        validation = payload.get("validation") if isinstance(payload.get("validation"), dict) else {}
        status = str(payload.get("status") or "draft").strip().lower()
        if status not in {"draft", "needs_review", "expert_reviewed", "rejected", "public_ready"}:
            raise PublicBackendError("Unsupported expert review status.", status=400)
        source_file = str(payload.get("sourceFile") or "").strip()
        source_index = int(payload.get("sourceIndex") if payload.get("sourceIndex") is not None else -1)
        local_version_number = int(payload.get("localVersionNumber") or 0)
        local_version_id = str(payload.get("localVersionId") or "").strip()
        note = str(payload.get("note") or "").strip()
        timestamp = now_iso()
        with self.session() as db:
            current = db.execute(
                "SELECT MAX(version_number) AS version_number FROM question_review_versions WHERE question_id = ?",
                (question_id,),
            ).fetchone()
            version_number = int(current["version_number"] or 0) + 1
            version_id = new_id("qrev")
            db.execute(
                """
                INSERT INTO question_review_versions
                (id, question_id, source_file, source_index, version_number, status, note, draft_json, before_json, validation_json, local_version_id, local_version_number, created_at, created_by_account_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    version_id,
                    question_id,
                    source_file,
                    source_index,
                    version_number,
                    status,
                    note,
                    json.dumps(draft, ensure_ascii=True, sort_keys=True),
                    json.dumps(before, ensure_ascii=True, sort_keys=True),
                    json.dumps(validation, ensure_ascii=True, sort_keys=True),
                    local_version_id,
                    local_version_number,
                    timestamp,
                    actor["id"],
                ),
            )
            self.write_audit_log(
                db,
                actor["id"],
                "save_question_review_version",
                "question",
                question_id,
                {
                    "versionNumber": version_number,
                    "status": status,
                    "sourceFile": source_file,
                    "sourceIndex": source_index,
                    "localVersionId": local_version_id,
                },
            )
            row = db.execute("SELECT * FROM question_review_versions WHERE id = ?", (version_id,)).fetchone()
        return {
            "version": self.question_review_version_payload(row),
            "history": self.list_question_review_versions(actor, question_id, 50),
        }

    def save_content_package(self, actor, payload):
        self.require_role(actor, {"admin", "content_admin"})
        package = payload.get("package") if isinstance(payload, dict) and "package" in payload else payload
        if not isinstance(package, dict):
            raise PublicBackendError("package must be a JSON object.", status=400)
        scope = normalize_sync_source(payload.get("scope") if isinstance(payload, dict) else "", "public")
        blockers = content_package_blockers(package)
        if blockers:
            raise PublicBackendError(f"Content package has {len(blockers)} unsafe item(s): {blockers[0]['reason']}", status=400)
        package_text = json.dumps(package, ensure_ascii=True, sort_keys=True)
        content_version = str(package.get("contentVersion") or package.get("manifest", {}).get("contentVersion") or hashlib.sha256(package_text.encode("utf-8")).hexdigest()[:16])
        timestamp = now_iso()
        with self.session() as db:
            db.execute(
                """
                INSERT INTO content_packages (scope, package_json, content_version, updated_at, updated_by_account_id)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(scope) DO UPDATE SET
                  package_json = excluded.package_json,
                  content_version = excluded.content_version,
                  updated_at = excluded.updated_at,
                  updated_by_account_id = excluded.updated_by_account_id
                """,
                (scope, package_text, content_version, timestamp, actor["id"]),
            )
            self.write_audit_log(db, actor["id"], "save_content_package", "content_package", scope, {"contentVersion": content_version})
        return self.get_content_package(actor, scope)

    def get_content_package(self, actor, scope="public", query=None):
        safe_scope = normalize_sync_source(scope, "public")
        with self.session() as db:
            row = db.execute("SELECT * FROM content_packages WHERE scope = ?", (safe_scope,)).fetchone()
        if not row:
            return {
                "scope": safe_scope,
                "contentVersion": "",
                "updatedAt": None,
                "package": query_content_package_payload({"schemaVersion": "sat_content_package_v1", "items": [], "manifest": {"total": 0}}, query),
            }
        package = json.loads(row["package_json"] or "{}")
        return {
            "scope": row["scope"],
            "contentVersion": row["content_version"],
            "updatedAt": row["updated_at"],
            "updatedByAccountId": row["updated_by_account_id"],
            "package": query_content_package_payload(package, query),
        }

    def list_audit_log(self, actor, limit=50, action=None, target_type=None, actor_account_id=None):
        self.require_role(actor, {"admin", "content_admin"})
        safe_limit = max(1, min(200, int(limit or 50)))
        clauses = []
        params = []
        if action:
            clauses.append("action = ?")
            params.append(str(action).strip())
        if target_type:
            clauses.append("target_type = ?")
            params.append(str(target_type).strip())
        if actor_account_id:
            clauses.append("actor_account_id = ?")
            params.append(str(actor_account_id).strip())
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        params.append(safe_limit)
        with self.session() as db:
            rows = db.execute(
                f"SELECT * FROM audit_log {where} ORDER BY created_at DESC LIMIT ?",
                tuple(params),
            ).fetchall()
        return {
            "items": [
                {
                    "id": row["id"],
                    "actorAccountId": row["actor_account_id"],
                    "action": row["action"],
                    "targetType": row["target_type"],
                    "targetId": row["target_id"],
                    "payload": json.loads(row["payload_json"] or "{}"),
                    "createdAt": row["created_at"],
                }
                for row in rows
            ],
            "filters": {
                "action": action or "",
                "targetType": target_type or "",
                "actorAccountId": actor_account_id or "",
                "limit": safe_limit,
            },
        }

    def schema_payload(self):
        with self.session() as db:
            rows = db.execute("SELECT version, applied_at FROM schema_migrations ORDER BY applied_at ASC").fetchall()
        return {
            "currentVersion": rows[-1]["version"] if rows else "",
            "migrations": [{"version": row["version"], "appliedAt": row["applied_at"]} for row in rows],
            "syncContractVersion": BACKEND_SYNC_CONTRACT["version"],
            "migrationReadiness": self.migration_readiness(),
        }

    def migration_readiness(self):
        return migration_readiness_payload(self.database_url)

    def schema_version(self, actor):
        self.require_role(actor, {"admin", "content_admin"})
        return self.schema_payload()

    def sync_contract(self, actor):
        return {
            **BACKEND_SYNC_CONTRACT,
            "actor": {
                "id": actor["id"],
                "role": actor["role"],
                "scope": actor["scope"],
            },
        }

    def build_export_snapshot(self):
        with self.session() as db:
            accounts = db.execute(
                """
                SELECT id, username, display_name, role, scope, parent_id, status, created_at, updated_at
                FROM accounts
                ORDER BY created_at ASC
                """
            ).fetchall()
            progress = db.execute("SELECT id, account_id, payload_json, source, updated_at FROM progress_records ORDER BY updated_at ASC").fetchall()
            profiles = db.execute(
                """
                SELECT id, account_id, profile_json, source, client_revision, server_revision, updated_at, updated_by_account_id
                FROM profile_records
                ORDER BY updated_at ASC
                """
            ).fetchall()
            audits = db.execute("SELECT * FROM question_audits ORDER BY created_at ASC").fetchall()
            review_versions = db.execute("SELECT * FROM question_review_versions ORDER BY created_at ASC, version_number ASC").fetchall()
            classes = db.execute(f"{self.class_query()} ORDER BY classes.created_at ASC").fetchall()
            member_count_rows = db.execute(
                """
                SELECT class_id, COUNT(*) AS count
                FROM class_memberships
                WHERE status = 'active'
                GROUP BY class_id
                """
            ).fetchall()
            member_counts = {row["class_id"]: int(row["count"] or 0) for row in member_count_rows}
            memberships = db.execute("SELECT * FROM class_memberships ORDER BY joined_at ASC").fetchall()
            assignments = db.execute("SELECT * FROM class_assignments ORDER BY created_at ASC").fetchall()
            evidence = db.execute("SELECT * FROM assignment_evidence ORDER BY submitted_at ASC").fetchall()
            content_packages = db.execute("SELECT * FROM content_packages ORDER BY updated_at ASC").fetchall()
            logs = db.execute("SELECT * FROM audit_log ORDER BY created_at ASC").fetchall()
        return {
            "exportedAt": now_iso(),
            "schema": self.schema_payload(),
            "accounts": [
                {
                    "id": row["id"],
                    "username": row["username"],
                    "displayName": row["display_name"],
                    "role": row["role"],
                    "scope": row["scope"],
                    "parentId": row["parent_id"],
                    "status": row["status"],
                    "createdAt": row["created_at"],
                    "updatedAt": row["updated_at"],
                }
                for row in accounts
            ],
            "progressRecords": [
                {
                    "id": row["id"],
                    "accountId": row["account_id"],
                    "source": row["source"],
                    "progress": sanitize_public_payload(json.loads(row["payload_json"] or "{}"))[0],
                    "updatedAt": row["updated_at"],
                    "contentSafety": content_safety_summary(sanitize_public_payload(json.loads(row["payload_json"] or "{}"))[1]),
                }
                for row in progress
            ],
            "profileRecords": [
                {
                    "id": row["id"],
                    "accountId": row["account_id"],
                    "source": row["source"],
                    "profile": sanitize_public_payload(json.loads(row["profile_json"] or "{}"))[0],
                    "clientRevision": int(row["client_revision"] or 0),
                    "serverRevision": int(row["server_revision"] or 0),
                    "updatedAt": row["updated_at"],
                    "updatedByAccountId": row["updated_by_account_id"],
                    "contentSafety": content_safety_summary(sanitize_public_payload(json.loads(row["profile_json"] or "{}"))[1]),
                }
                for row in profiles
            ],
            "questionAudits": [
                {
                    "id": row["id"],
                    "questionId": row["question_id"],
                    "reporterAccountId": row["reporter_account_id"],
                    "issueType": row["issue_type"],
                    "severity": row["severity"],
                    "note": row["note"],
                    "status": row["status"],
                    "resolutionNote": row["resolution_note"],
                    "createdAt": row["created_at"],
                    "resolvedAt": row["resolved_at"],
                    "resolverAccountId": row["resolver_account_id"],
                }
                for row in audits
            ],
            "questionReviewVersions": [self.question_review_version_payload(row) for row in review_versions],
            "classes": [self.class_payload(row, member_counts.get(row["id"], 0)) for row in classes],
            "classMemberships": [
                {
                    "id": row["id"],
                    "classId": row["class_id"],
                    "studentAccountId": row["student_account_id"],
                    "status": row["status"],
                    "joinedAt": row["joined_at"],
                }
                for row in memberships
            ],
            "classAssignments": [self.assignment_payload(row) for row in assignments],
            "assignmentEvidence": [
                {
                    "id": row["id"],
                    "assignmentId": row["assignment_id"],
                    "studentAccountId": row["student_account_id"],
                    "evidence": json.loads(row["evidence_json"] or "{}"),
                    "status": row["status"],
                    "submittedAt": row["submitted_at"],
                }
                for row in evidence
            ],
            "contentPackages": [
                {
                    "scope": row["scope"],
                    "contentVersion": row["content_version"],
                    "updatedAt": row["updated_at"],
                    "updatedByAccountId": row["updated_by_account_id"],
                    "package": json.loads(row["package_json"] or "{}"),
                }
                for row in content_packages
            ],
            "auditLog": [
                {
                    "id": row["id"],
                    "actorAccountId": row["actor_account_id"],
                    "action": row["action"],
                    "targetType": row["target_type"],
                    "targetId": row["target_id"],
                    "payload": json.loads(row["payload_json"] or "{}"),
                    "createdAt": row["created_at"],
                }
                for row in logs
            ],
        }

    def export_snapshot(self, actor):
        self.require_role(actor, {"admin", "content_admin"})
        return self.build_export_snapshot()

    def export_system_snapshot(self):
        return self.build_export_snapshot()

    def purge_sessions(self, actor):
        self.require_role(actor, {"admin", "content_admin"})
        timestamp = now_unix()
        with self.session() as db:
            result = db.execute(
                "DELETE FROM sessions WHERE revoked_at IS NOT NULL OR expires_at <= ?",
                (timestamp,),
            )
            deleted = int(result.rowcount or 0)
            self.write_audit_log(db, actor["id"], "purge_sessions", "session", None, {"deleted": deleted})
        return {"ok": True, "deleted": deleted, "purgedAt": now_iso()}

    def monitoring(self, actor):
        self.require_role(actor, {"admin", "content_admin"})
        with self.session() as db:
            account_count = db.execute("SELECT COUNT(*) AS count FROM accounts").fetchone()["count"]
            progress_count = db.execute("SELECT COUNT(*) AS count FROM progress_records").fetchone()["count"]
            profile_count = db.execute("SELECT COUNT(*) AS count FROM profile_records").fetchone()["count"]
            content_package_count = db.execute("SELECT COUNT(*) AS count FROM content_packages").fetchone()["count"]
            review_version_count = db.execute("SELECT COUNT(*) AS count FROM question_review_versions").fetchone()["count"]
            class_count = db.execute("SELECT COUNT(*) AS count FROM classes").fetchone()["count"]
            membership_count = db.execute("SELECT COUNT(*) AS count FROM class_memberships").fetchone()["count"]
            assignment_count = db.execute("SELECT COUNT(*) AS count FROM class_assignments").fetchone()["count"]
            evidence_count = db.execute("SELECT COUNT(*) AS count FROM assignment_evidence").fetchone()["count"]
            open_audits = db.execute("SELECT COUNT(*) AS count FROM question_audits WHERE status = 'open'").fetchone()["count"]
            active_sessions = db.execute(
                "SELECT COUNT(*) AS count FROM sessions WHERE revoked_at IS NULL AND expires_at > ?",
                (now_unix(),),
            ).fetchone()["count"]
            expired_sessions = db.execute(
                "SELECT COUNT(*) AS count FROM sessions WHERE revoked_at IS NULL AND expires_at <= ?",
                (now_unix(),),
            ).fetchone()["count"]
            revoked_sessions = db.execute("SELECT COUNT(*) AS count FROM sessions WHERE revoked_at IS NOT NULL").fetchone()["count"]
            total_sessions = db.execute("SELECT COUNT(*) AS count FROM sessions").fetchone()["count"]
            last_log = db.execute("SELECT created_at FROM audit_log ORDER BY created_at DESC LIMIT 1").fetchone()
        db_size = os.path.getsize(self.db_path) if self.database_engine == "sqlite" and os.path.exists(self.db_path) else 0
        return {
            "ok": True,
            "checkedAt": now_iso(),
            "schema": self.schema_payload(),
            "database": {
                "engine": self.database_engine,
                "path": os.path.basename(self.db_path) if self.database_engine == "sqlite" else "external",
                "sizeBytes": db_size,
                "databaseUrlConfigured": bool(self.database_url),
                "postgresqlUpgradeGuard": True,
            },
            "migrationReadiness": self.migration_readiness(),
            "counts": {
                "accounts": int(account_count),
                "progressRecords": int(progress_count),
                "profileRecords": int(profile_count),
                "contentPackages": int(content_package_count),
                "questionReviewVersions": int(review_version_count),
                "classes": int(class_count),
                "classMemberships": int(membership_count),
                "classAssignments": int(assignment_count),
                "assignmentEvidence": int(evidence_count),
                "openQuestionAudits": int(open_audits),
                "activeSessions": int(active_sessions),
            },
            "sessions": {
                "total": int(total_sessions),
                "active": int(active_sessions),
                "expired": int(expired_sessions),
                "revoked": int(revoked_sessions),
            },
            "lastAuditLogAt": last_log["created_at"] if last_log else None,
        }

    def attach_session_cookie(self, payload):
        token = payload.get("token") if isinstance(payload, dict) else None
        expires_at = payload.get("expiresAt") if isinstance(payload, dict) else None
        if not token or not expires_at:
            return payload
        csrf_token = new_csrf_token()
        return {
            **payload,
            "cookieAuth": True,
            "csrfToken": csrf_token,
            "_headers": {
                "Set-Cookie": set_cookie_headers(
                    session_cookie_value(str(token), int(expires_at)),
                    csrf_cookie_value(csrf_token, int(expires_at)),
                )
            },
        }

    def attach_clear_session_cookie(self, payload):
        return {
            **(payload or {}),
            "cookieAuth": True,
            "_headers": {"Set-Cookie": set_cookie_headers(clear_session_cookie_value(), clear_csrf_cookie_value())},
        }

    def token_from_headers(self, headers):
        value = authorization_bearer_token(headers)
        if value:
            return value
        token = cookie_token(headers)
        if token:
            return token
        return ""

    def require_csrf_for_cookie_auth(self, method, path, headers):
        if method not in {"POST", "PUT", "PATCH", "DELETE"}:
            return
        if path in CSRF_EXEMPT_PATHS:
            return
        if authorization_bearer_token(headers):
            return
        if not cookie_token(headers):
            return
        expected = csrf_cookie_token(headers)
        actual = csrf_header_token(headers)
        if not expected or not actual or not hmac.compare_digest(expected, actual):
            raise PublicBackendError("CSRF token required for cookie-authenticated write requests.", status=403)

    def handle_http(self, method, raw_path, headers=None, body=b""):
        headers = headers or {}
        parsed = urlparse(raw_path)
        path = parsed.path.rstrip("/") or "/"
        query = parse_qs(parsed.query)
        payload = {}
        if body:
            try:
                payload = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                raise PublicBackendError("Request body must be valid JSON.", status=400)

        self.require_csrf_for_cookie_auth(method, path, headers)

        if method == "GET" and path == "/api/public/health":
            return 200, {
                "ok": True,
                "service": "SAT Studio public backend",
                "database": os.path.basename(self.db_path),
                "databaseConfig": {
                    "engine": self.database_engine,
                    "sqlitePath": os.path.basename(self.db_path),
                    "databaseUrlConfigured": bool(self.database_url),
                    "postgresqlUpgradeGuard": True,
                },
                "sqlite": {
                    "journalMode": SQLITE_JOURNAL_MODE,
                    "timeoutSeconds": SQLITE_TIMEOUT_SECONDS,
                    "busyTimeoutMs": int(SQLITE_TIMEOUT_SECONDS * 1000),
                },
                "migrationReadiness": self.migration_readiness(),
                "adminCount": self.admin_count(),
                "features": {
                    "sqlite": True,
                    "sqliteWal": SQLITE_JOURNAL_MODE == "WAL",
                    "tokenAuth": True,
                    "httpOnlyCookieAuth": True,
                    "csrfProtection": True,
                    "rbac": True,
                    "accountManagement": True,
                    "progressApi": True,
                    "profileSync": True,
                    "questionAuditApi": True,
                    "questionReviewVersionApi": True,
                    "classroomApi": True,
                    "assignmentEvidenceApi": True,
                    "contentPackageApi": True,
                    "auditLogFilters": True,
                    "schemaMigrations": True,
                    "monitoring": True,
                    "sessionMaintenance": True,
                    "sanitizedExport": True,
                    "syncContract": True,
                    "officialContentRedaction": True,
                    "publicSignup": True,
                    "postgresqlUpgradeGuard": True,
                },
            }

        if method == "POST" and path == "/api/public/bootstrap":
            return 201, self.bootstrap_admin(payload)
        if method == "POST" and path == "/api/public/signup":
            return 201, self.attach_session_cookie(self.public_signup(payload))
        if method == "POST" and path == "/api/public/login":
            return 200, self.attach_session_cookie(self.login(payload))
        if method == "POST" and path == "/api/public/session/refresh":
            return 200, self.attach_session_cookie(self.refresh_session(self.token_from_headers(headers)))
        if method == "POST" and path == "/api/public/logout":
            return 200, self.attach_clear_session_cookie(self.logout(self.token_from_headers(headers)))

        actor = self.account_for_token(self.token_from_headers(headers))

        if method == "GET" and path == "/api/public/me":
            return 200, {"account": actor}
        if method == "GET" and path == "/api/public/sync-contract":
            return 200, self.sync_contract(actor)
        if method == "GET" and path == "/api/public/accounts":
            return 200, self.list_accounts(actor)
        if method == "POST" and path == "/api/public/accounts":
            return 201, self.create_account(actor, payload)
        if method == "POST" and path.startswith("/api/public/accounts/") and path.endswith("/status"):
            account_id = path.split("/")[-2]
            return 200, self.update_account_status(actor, account_id, payload)
        if method == "POST" and path == "/api/public/progress":
            return 200, self.save_progress(actor, payload)
        if method == "GET" and path == "/api/public/progress":
            account_id = (query.get("accountId") or [actor["id"]])[0]
            source = (query.get("source") or ["sat_studio"])[0]
            return 200, self.get_progress(actor, account_id, source)
        if method == "POST" and path == "/api/public/profile":
            result = self.save_profile(actor, payload)
            if isinstance(result, tuple):
                payload, status = result
                return status, payload
            return 200, result
        if method == "GET" and path == "/api/public/profile":
            account_id = (query.get("accountId") or [actor["id"]])[0]
            source = (query.get("source") or ["sat_studio_profile"])[0]
            return 200, self.get_profile(actor, account_id, source)
        if method == "POST" and path == "/api/public/question-audits":
            return 201, self.create_question_audit(actor, payload)
        if method == "GET" and path == "/api/public/question-reviews":
            return 200, self.list_question_review_versions(
                actor,
                (query.get("questionId") or [""])[0],
                (query.get("limit") or [50])[0],
            )
        if method == "POST" and path == "/api/public/question-reviews":
            return 201, self.save_question_review_version(actor, payload)
        if method == "GET" and path == "/api/public/classes":
            return 200, self.list_classes(actor)
        if method == "POST" and path == "/api/public/classes":
            return 201, self.create_class(actor, payload)
        if method == "POST" and path == "/api/public/classes/join":
            return 200, self.join_class(actor, payload)
        if path.startswith("/api/public/classes/"):
            parts = path.split("/")
            class_id = parts[4] if len(parts) > 4 else ""
            leaf = parts[5] if len(parts) > 5 else ""
            if method == "GET" and leaf == "assignments":
                return 200, self.list_class_assignments(actor, class_id)
            if method == "POST" and leaf == "assignments":
                return 201, self.create_class_assignment(actor, class_id, payload)
            if method == "GET" and leaf == "report":
                return 200, self.class_report(actor, class_id)
        if method == "POST" and path.startswith("/api/public/assignments/") and path.endswith("/evidence"):
            assignment_id = path.split("/")[-2]
            return 200, self.submit_assignment_evidence(actor, assignment_id, payload)
        if method == "GET" and path == "/api/public/content-package":
            scope = (query.get("scope") or ["public"])[0]
            return 200, self.get_content_package(actor, scope, query)
        if method == "POST" and path == "/api/public/content-package":
            return 200, self.save_content_package(actor, payload)
        if method == "GET" and path == "/api/public/audit-log":
            return 200, self.list_audit_log(
                actor,
                (query.get("limit") or [50])[0],
                (query.get("action") or [""])[0],
                (query.get("targetType") or [""])[0],
                (query.get("actorAccountId") or [""])[0],
            )
        if method == "GET" and path == "/api/public/schema-version":
            return 200, self.schema_version(actor)
        if method == "GET" and path == "/api/public/export":
            return 200, self.export_snapshot(actor)
        if method == "GET" and path == "/api/public/monitoring":
            return 200, self.monitoring(actor)
        if method == "POST" and path == "/api/public/maintenance/purge-sessions":
            return 200, self.purge_sessions(actor)
        if method == "POST" and path.startswith("/api/public/question-audits/") and path.endswith("/resolve"):
            audit_id = path.split("/")[-2]
            return 200, self.resolve_question_audit(actor, audit_id, payload)

        raise PublicBackendError("Not found.", status=404)
