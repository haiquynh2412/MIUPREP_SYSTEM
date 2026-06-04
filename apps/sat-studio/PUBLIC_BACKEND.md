# SAT Studio Public Backend Direction

SAT Studio is moving toward a public free app, not a local-only family app.

## Current Public Backend Slice

- `sat_public_backend.py`: SQLite service layer with password hashing, HttpOnly cookie sessions, CSRF guard, RBAC, linked parent/student accounts, teacher classrooms, class assignments, assignment evidence, progress/profile records, public-content sanitization, question audit records, expert review version ledger, and audit logs.
- `server.py`: local/static server now routes `/api/public/*` into the backend service.
- `sat_public_app.py`: FastAPI app for public deployment; it reuses the same backend service and can serve the current static app.
- `sat_public_api.js` and `src/domain/public-backend.ts`: frontend adapters for health, bootstrap, public signup, login, accounts, account status, teacher classroom routing, progress sync, full profile sync, content package sync, question audit, expert review ledger, audit log, export, monitoring, and session maintenance calls.
- Vite Student route: public students can create/login to a backend account, join a teacher class by code, load backend assignments, submit assignment evidence, load backend content package pages when available, and sync attempts, learning events, official logs, vocabulary, saved items, and progress summaries after learning actions.
- Vite Parent route: parent/admin/teacher users can login, list linked or visible student accounts, create backend classes, share join codes, create assignments, load class reports, and load server profiles into the coaching dashboard.
- Accounts tab: local admins can check backend health, bootstrap the first admin, login, rotate/refresh the backend session, auto-sync the current learner's progress after login, manually sync progress, sync/load full profile metadata, review/apply a server profile before overwrite, export a server snapshot, read monitoring, and logout the server session.
- Admin Center public manifest export also builds a learner-safe public content package and saves it to the backend when the release gate is clear; public student accounts read that package first and fall back to local reviewed banks if no backend package is available.
- `requirements-public.txt`: target dependencies for a deployable FastAPI/uvicorn server.
- `scripts/run_public_backend.py`: local uvicorn runner for the public backend path.
- `scripts/backup_public_backend.py`: creates sanitized JSON backups and optional SQLite recovery copies for scheduled jobs.
- `scripts/restore_public_backend_backup.py`: validates sanitized backup JSON, validates SQLite recovery copies, and can restore a SQLite copy into a target DB for disaster-recovery drills.
- `scripts/check_public_backend_health.py`: CI/scheduler health check for `/health` and optional admin `/monitoring`, with nonzero exit and optional webhook on unhealthy status.
- `scripts/check_public_deploy_readiness.py`: deployment readiness gate for SQLite WAL/timeout, PostgreSQL guard, secure cookies, rate-limit backend guard, restore/load scripts, and container config.
- `scripts/public_backend_load_smoke.py`: concurrent read/write smoke for SQLite WAL pilot deployments.
- `migrations/postgresql/0010_teacher_classroom_v2.sql` and `scripts/check_postgres_migration_artifact.py`: managed PostgreSQL migration artifact and validation/apply helper for scale-out deployments.
- `scripts/verify_public_domain.py`: HTTPS/domain verification gate for a deployed public URL.
- `Dockerfile.public`, `.dockerignore`, and `.env.public.example`: baseline container deployment configuration.

## Current Endpoints

- `GET /api/public/health`
- `POST /api/public/bootstrap`
- `POST /api/public/signup`
- `POST /api/public/login`
- `POST /api/public/session/refresh`
- `POST /api/public/logout`
- `GET /api/public/me`
- `GET /api/public/sync-contract`
- `GET /api/public/accounts`
- `POST /api/public/accounts`
- `POST /api/public/accounts/{accountId}/status`
- `POST /api/public/progress`
- `GET /api/public/progress?accountId=...&source=sat_studio`
- `POST /api/public/profile`
- `GET /api/public/profile?accountId=...&source=sat_studio_profile`
- `GET /api/public/content-package?scope=public`
- `GET /api/public/content-package?scope=public&section=...&domain=...&skill=...&difficulty=...&limit=50&offset=0&includeContent=false`
- `POST /api/public/content-package`
- `POST /api/public/question-audits`
- `POST /api/public/question-audits/{auditId}/resolve`
- `GET /api/public/question-reviews?questionId=...&limit=50`
- `POST /api/public/question-reviews`
- `GET /api/public/classes`
- `POST /api/public/classes`
- `POST /api/public/classes/join`
- `GET /api/public/classes/{classId}/assignments`
- `POST /api/public/classes/{classId}/assignments`
- `GET /api/public/classes/{classId}/report`
- `POST /api/public/assignments/{assignmentId}/evidence`
- `GET /api/public/audit-log?limit=50&action=...&targetType=...&actorAccountId=...`
- `GET /api/public/schema-version`
- `GET /api/public/export`
- `GET /api/public/monitoring`
- `POST /api/public/maintenance/purge-sessions`

## Production Rules

- Public users must never receive `private_family`, `admin_only`, or vault content.
- Public backend progress/profile sync is not a question-bank sync. Embedded question objects in learner profile/progress records are reduced to metadata and all prompt, choices, answers, explanations, protected source references, private vault rows, and source signals are stripped before storage/export.
- Public question delivery goes through `/api/public/content-package`. Content package writes are admin-only and reject private, high-risk, blocked, unreviewed, or non-public-candidate question rows.
- Production clients can request scoped package slices by section/domain/skill/difficulty/source/tool tag with limit/offset; `includeContent=false` returns metadata-only rows for lightweight curriculum navigation.
- Question promotion remains server-governed: reviewed, no open audit, low-risk source, public-safe visibility, and public-candidate publication status.
- Parent accounts may view linked student progress only.
- Account listing is RBAC-scoped: admins/content admins see all accounts, parents see themselves plus linked students, and students see only themselves.
- Public signup is restricted to student and parent roles. It cannot create admin, content admin, or teacher accounts.
- Teacher accounts are provisioned by admins/content admins. Teachers can create and manage their own classes, create assignments, and view class reports. Students join by class code and can submit assignment evidence for their own targeted assignments. Parents can see classes for linked students.
- Admins/content admins can suspend or disable accounts; disabling an account revokes its active sessions and cannot remove the final active admin.
- Students may create audit reports but cannot resolve or hide them.
- Content admins can resolve audits, block questions from public release, and save expert review versions for prompt/answer/explanation/metadata edits.
- Official or high-risk source text should remain metadata-only unless explicit written rights exist.
- Public backend exports must never include password salts or password hashes.
- Frontend bearer tokens are no longer stored in `sessionStorage`; browser clients use HttpOnly session cookies plus a readable CSRF cookie/header for mutating requests.
- Cookie-authenticated `POST`, `PUT`, `PATCH`, and `DELETE` requests must include `X-CSRF-Token` matching the `sat_studio_public_csrf` cookie, except bootstrap/signup/login.
- Backend sessions expire and can be rotated with `/api/public/session/refresh`; logout revokes the current token.
- Admins can purge expired/revoked session rows with `/api/public/maintenance/purge-sessions`; do this after backups or as a scheduled maintenance job.
- Full profile sync uses `serverRevision` conflict detection. A stale client receives `409` and must review or explicitly overwrite.
- Server profile restore is review-first: the frontend stores only a pending comparison summary in local state, keeps the full pending profile in the current browser session, and requires an explicit Apply action before replacing the local learner profile.
- Scheduled backups should run `python scripts\backup_public_backend.py --copy-sqlite` and store the output outside the web root.
- Restore drills should run `python scripts\restore_public_backend_backup.py --backup-json <backup.json> --sqlite-copy <backup.sqlite3>` first in validation mode, then use `--apply --restore-db <target.sqlite3>` only for a controlled recovery target.
- Scheduled monitoring should run `python scripts\check_public_backend_health.py --base-url https://your-domain/api/public`; add `SAT_PUBLIC_BACKEND_TOKEN` to also check admin monitoring thresholds.
- Deployment readiness should run `python scripts\check_public_deploy_readiness.py --json` before container release.
- Pilot concurrency should be checked with `python scripts\public_backend_load_smoke.py --workers 8 --operations 80` against a disposable DB before larger test sessions.
- PostgreSQL migration artifacts should be validated with `python scripts\check_postgres_migration_artifact.py`; apply with `--apply --database-url <postgres-url>` only after provisioning managed PostgreSQL and setting `SAT_STUDIO_ENABLE_POSTGRES=true`.
- Public domain verification should run `python scripts\verify_public_domain.py --base-url https://your-domain.example/` after deployment.
- Release checks should run `python scripts\release_checklist.py --strict` after integrity, readiness, role, and browser smoke artifacts are generated.
- Public content should be exported before deployment with `node scripts\export_public_manifest_artifact.js`; the strict release checklist now requires both `artifacts/sat-studio-public-manifest-latest.json` and `artifacts/sat-studio-public-content-package-latest.json`.
- FastAPI public routes include an in-memory rate limiter with pruning. `SAT_STUDIO_RATE_LIMIT_BACKEND=memory` is explicit in the deploy template; `SAT_STUDIO_RATE_LIMIT_BACKEND=redis` activates the Redis-backed distributed limiter when `SAT_STUDIO_REDIS_URL` or `REDIS_URL` is configured.
- FastAPI public routes expose admin-only `/api/public/ops/metrics` and can write structured JSONL request logs with `SAT_STUDIO_ACCESS_LOG_JSONL`.
- SQLite now runs with WAL, `busy_timeout`, and a 30 second connection timeout for pilot/public testing.
- `SAT_STUDIO_PUBLIC_DATABASE_URL` or `DATABASE_URL` is detected for PostgreSQL scale-out planning. The runtime PostgreSQL adapter is opt-in with `SAT_STUDIO_ENABLE_POSTGRES=true` and requires the `psycopg` dependency plus the PostgreSQL migration artifact; health and monitoring expose migration readiness so production cannot silently run against the wrong backend.

## Next Step

Run the public backend locally after installing dependencies:

```powershell
pip install -r requirements-public.txt
python scripts\run_public_backend.py
```

Run in a container:

```powershell
docker build -f Dockerfile.public -t sat-studio-public .
docker run --env-file .env.public.example -p 8765:8765 sat-studio-public
```

Run a sanitized backup from the host or a scheduled job:

```powershell
python scripts\backup_public_backend.py --copy-sqlite
```

Validate or apply a restore drill:

```powershell
python scripts\restore_public_backend_backup.py --backup-json artifacts\backups\sat-public-backup.json --sqlite-copy artifacts\backups\sat-public.sqlite3
python scripts\restore_public_backend_backup.py --backup-json artifacts\backups\sat-public-backup.json --sqlite-copy artifacts\backups\sat-public.sqlite3 --restore-db data\restore-drill.sqlite3 --apply
```

Run a public health check from CI or a scheduled job:

```powershell
python scripts\check_public_backend_health.py --base-url http://127.0.0.1:8765/api/public --max-open-audits 50
```

Run deployment readiness and load smoke gates:

```powershell
python scripts\check_public_deploy_readiness.py --json
python scripts\public_backend_load_smoke.py --workers 8 --operations 80
```

Validate/apply the PostgreSQL migration artifact:

```powershell
python scripts\check_postgres_migration_artifact.py
python scripts\check_postgres_migration_artifact.py --database-url postgresql://user:pass@host:5432/satstudio --apply
```

Verify the deployed HTTPS domain:

```powershell
python scripts\verify_public_domain.py --base-url https://your-domain.example/
```

Export the reviewed public manifest and learner-safe public content package:

```powershell
node scripts\export_public_manifest_artifact.js
```

Run the strict release gate before public deployment:

```powershell
python scripts\release_checklist.py --strict
```

Next: provision managed PostgreSQL/Redis/observability in the chosen host, apply the migration artifact, set `SAT_STUDIO_ENABLE_POSTGRES=true`, `SAT_STUDIO_PUBLIC_DATABASE_URL`, `SAT_STUDIO_RATE_LIMIT_BACKEND=redis`, and `SAT_STUDIO_REDIS_URL`, then run the domain verification gate.
