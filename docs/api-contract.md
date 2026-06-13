# MiuPrep Central API — Contract Design (roadmap 2.4.1)

> Status: **DESIGN** (no implementation yet). This is the contract the central
> backend must satisfy so the 6 apps can move from local-only/localStorage to a
> shared server (auth, multi-device sync, AI proxy, PII-at-rest).
>
> Base to extend: `apps/sat-studio/src/domain/public-backend.ts`
> (already has rate-limit + session primitives + a sqlite→postgres path).
> Grounding from existing code:
>
> - Learner events already expose `idempotencyKey` (= event `id`) for dedupe
>   (`packages/learning/src/index.ts:81`).
> - DB rows already carry `sync_status: 'synced' | 'pending' | 'failed'`
>   (`packages/db/src/index.ts:72`).

## 0. Cross-cutting conventions

- **Base URL:** `/api/v1`
- **Format:** JSON; UTF-8; `Content-Type: application/json`.
- **Auth:** `Authorization: Bearer <accessToken>` (short-lived) + httpOnly
  refresh cookie. NO API keys ever reach the client (see §3 AI proxy).
- **Error envelope (all non-2xx):**
  ```json
  { "error": { "code": "string_enum", "message": "human readable", "details": {} } }
  ```
  Codes: `unauthenticated`, `forbidden`, `not_found`, `validation`,
  `rate_limited`, `conflict`, `quota_exceeded`, `internal`.
- **Rate limiting:** per-IP + per-user token bucket (reuse public-backend limiter).
  429 → `rate_limited` with `Retry-After` header.
- **Idempotency:** mutating endpoints accept `Idempotency-Key` header; server
  dedupes (24h window). Sync uses per-event `idempotencyKey` (see §2).
- **Roles:** `admin | admincontent | parent | student`. Role checks are
  **server-side** (never trust a client flag) — see §1.4.
- **Versioning:** breaking changes → `/api/v2`. Additive fields are non-breaking.

---

## 1. Auth (replaces client-side PBKDF2-in-localStorage; closes roadmap 1.1.2/1.1.5)

Server owns password hashing (PBKDF2/argon2), sessions, and role authority.

| Method | Path             | Role     | Body → Result                                                                                |
| ------ | ---------------- | -------- | -------------------------------------------------------------------------------------------- |
| POST   | `/auth/register` | public\* | `{username, password, displayName, role, contactInfo?, linkStudentUsername?}` → `201 {user}` |
| POST   | `/auth/login`    | public   | `{username, password}` → `200 {user, accessToken}` + refresh cookie                          |
| POST   | `/auth/refresh`  | cookie   | → `200 {accessToken}`                                                                        |
| POST   | `/auth/logout`   | auth     | → `204` (revoke refresh)                                                                     |
| GET    | `/auth/me`       | auth     | → `200 {user}`                                                                               |

\* `role: 'admin'` self-register allowed ONLY when zero admins exist (first-run);
otherwise an existing admin must issue admin/admincontent accounts via §1.3.
`role: 'parent'` requires a valid `linkStudentUsername`.

`User` (response shape — never includes hash):

```json
{ "id", "username", "displayName", "role", "status": "pending|approved|rejected",
  "contactInfo?", "assignedTracks": ["math","sat",...], "linkedStudents?": [],
  "targetBand?", "createdAt" }
```

### 1.3 Admin user management

| Method | Path                         | Role  | Notes                                         |
| ------ | ---------------------------- | ----- | --------------------------------------------- |
| GET    | `/admin/users?role=&status=` | admin | list (no hashes)                              |
| POST   | `/admin/users`               | admin | issue admin/teacher account                   |
| PATCH  | `/admin/users/:username`     | admin | `{status}` approve/reject, `{assignedTracks}` |
| DELETE | `/admin/users/:username`     | admin | hard-delete + audit log (see 2.4.5)           |

### 1.4 Authorization rule (test target)

Every `/admin/*` route asserts `req.user.role === 'admin'` server-side.
**Contract test:** a `student` token calling any `/admin/*` → `403 forbidden`.
**Pentest target (vòng 2):** flipping a client role flag, replaying an expired
token, and brute-forcing `/auth/login` must all fail (rate-limit + server role).

---

## 2. Learner-event sync — multi-device (roadmap 2.4.4)

Client keeps the **offline-first** local store; a background queue pushes pending
events and pulls remote ones. Dedupe is by `idempotencyKey` (already on every
event), so re-pushing the same event is a no-op.

| Method | Path                              | Role               | Body → Result                                                                                         |
| ------ | --------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| POST   | `/sync/events`                    | student/parent     | `{events: LearningEventRecord[]}` → `200 {accepted: [id], duplicates: [id], rejected: [{id,reason}]}` |
| GET    | `/sync/events?since=<ISO>&limit=` | owner/parent/admin | → `200 {events, nextSince}`                                                                           |
| GET    | `/sync/state`                     | owner              | → `200 {lastServerSeq, pendingCount}`                                                                 |

- **Write:** server upserts by `idempotencyKey`; existing key → counted in
  `duplicates` (idempotent). Each stored row keeps `sync_status` server-side.
- **Conflict policy:** events are append-only/immutable ⇒ no field conflicts;
  ordering by `occurredAt` then `idempotencyKey`. Derived state (mastery) is
  recomputed from the event log, so last-write-wins is unnecessary.
- **Ownership:** a learner reads only their own events; a parent reads linked
  students'; admin reads all.

**Contract test (vòng 1):** make attempts on device A → `GET /sync/events` from
device B returns them; pushing the same batch twice → second call all `duplicates`.
**Test (vòng 2):** offline queue replays after reconnect with **0 duplicate**
rows (idempotencyKey dedupe).

---

## 3. AI proxy — client never holds a provider key (roadmap 2.4.3)

All Writing/Speaking grading + tutoring calls go through the server, which holds
the OpenAI/Gemini keys and enforces per-user cost quota (reuse `UsageLedger`
from `@miuprep/ai`, already built in 3.2.3).

| Method | Path               | Role        | Body → Result                                                                      |
| ------ | ------------------ | ----------- | ---------------------------------------------------------------------------------- |
| POST   | `/ai/grade`        | student     | `{track, task, submission}` → `200 {feedback, scores, promptVersion, cached:bool}` |
| POST   | `/ai/grade/stream` | student     | SSE stream of partial feedback (roadmap 3.2.1)                                     |
| GET    | `/ai/usage`        | owner/admin | → `200 {billedUsd, calls, quotaUsd}`                                               |

- Server applies the existing `CachingAIAdapter` (hash of submission+task+track+
  PROMPT_VERSION) → identical submission returns cached, 0 provider cost.
- Over-quota → `402/429 quota_exceeded` (maps to `QuotaExceededError`).
- **Test:** DevTools shows **no** request to `api.openai.com` / `googleapis.com`
  from the client; desktop CSP drops those two origins.

---

## 4. PII at-rest + deletion (roadmap 2.4.5)

- Encrypt `email/phone/displayName` columns at rest (app-level AEAD or pgcrypto);
  dump of DB shows ciphertext for those fields.
- `DELETE /admin/users/:username` (and a self-serve `DELETE /auth/me`) performs a
  **real** cascade delete of user + events + AI artifacts; an `audit_log` row
  records who/when (the audit row itself stores no PII, only ids).

---

## 5. Storage & rollout

- Start on the sat-studio sqlite adapter; the public-backend already abstracts a
  **sqlite → postgres** path — promote to postgres for multi-device/at-rest.
- Tables: `users`, `sessions`, `learning_events` (PK `idempotency_key`,
  `sync_status`), `ai_usage`, `audit_log`.
- Migration: clients keep working offline; first authenticated sync uploads the
  local backlog (idempotent), then the server becomes source of truth.

## 6. Contract-test plan (deliverable of 2.4.1)

1. Schema tests: every request/response validates against the shapes above (zod).
2. AuthZ matrix: each role × each route → expected 2xx/403.
3. Sync idempotency: double-push → no duplicate rows.
4. AI proxy: key never leaves server; cache hit returns `cached:true`.

> Next tasks unblocked by this contract: 2.4.2 (auth impl) → 2.4.3 (AI proxy) →
> 2.4.4 (sync) → 2.4.5 (PII), and retroactively 1.1.5 (server-side scoring hides
> answer keys) + 3.1.1 (community-calibrated difficulty needs the event corpus).
