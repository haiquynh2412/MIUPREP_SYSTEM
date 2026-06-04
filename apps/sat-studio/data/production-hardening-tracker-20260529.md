# SAT Studio Production Hardening Tracker

Updated: 2026-05-29

## Completed in local public build

- [x] Vite/Svelte student shell is the public student route.
- [x] Parent coach dashboard includes teacher cockpit foundation.
- [x] Admin account is seeded locally for public-demo administration.
- [x] Public package gate strips internal metadata before student use.
- [x] Student progress can sync to the local backend when authenticated.
- [x] Backend sync queue survives offline states through the Vite offline store.
- [x] Bluebook mode persists timer, flags, selected answers, highlights, and eliminations.
- [x] Bluebook module now supports end-of-module review instead of only per-question feedback.
- [x] Public content package has an IndexedDB-backed offline cache with static/backend fallback.
- [x] Classroom foundation includes stable class code, assignment draft, and local assignment ledger.
- [x] Public build, public contract, parity, smoke, and release checks are part of validation.

## Still required before real cloud public launch

- [ ] Replace SQLite demo storage with a managed PostgreSQL adapter and migration path.
- [ ] Move auth from local bearer token storage to secure HTTP-only cookie sessions.
- [ ] Add CSRF protection for state-changing endpoints.
- [ ] Add durable rate limiting backed by server-side storage, not process memory.
- [ ] Add deployment health monitoring, uptime probes, structured logs, and alerting.
- [ ] Add backup/restore policy for accounts, progress, assignments, and item analytics.
- [ ] Add teacher role auth UI and backend assignment APIs.
- [ ] Add full class reports with item-level analytics and due assignment status.
- [ ] Replace Desmos external link with embedded/approved calculator UX if licensing and integration are cleared.
- [ ] Calibrate IRT only after enough real student response logs exist.

## Release stance

The current build is suitable for a controlled public demo or private beta on the local backend. It should not be described as a fully cloud-hardened production deployment until the server-side security, storage, monitoring, and backup items above are complete.
