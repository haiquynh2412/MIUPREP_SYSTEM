BEGIN;

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

INSERT INTO schema_migrations (version, applied_at)
VALUES ('0010_teacher_classroom_v2', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
ON CONFLICT (version) DO NOTHING;

COMMIT;
