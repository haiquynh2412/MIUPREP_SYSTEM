import json
import os
import sys
import tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from sat_public_backend import CSRF_COOKIE_NAME, SESSION_COOKIE_NAME, PublicBackendError, SatPublicBackend


def assert_raises_status(status, fn):
    try:
        fn()
    except PublicBackendError as error:
        assert error.status == status, f"expected status {status}, got {error.status}: {error.message}"
        return
    raise AssertionError(f"expected PublicBackendError {status}")


def set_cookie_headers(payload):
    values = payload.get("_headers", {}).get("Set-Cookie", [])
    if isinstance(values, str):
        return [values]
    return list(values)


def cookie_pair(payload, name):
    for header in set_cookie_headers(payload):
        if header.startswith(f"{name}="):
            return header.split(";", 1)[0]
    raise AssertionError(f"missing cookie {name}")


def run():
    with tempfile.TemporaryDirectory() as tmp:
        try:
            SatPublicBackend(os.path.join(tmp, "pg_guard.sqlite3"), database_url="postgresql://user:pass@localhost/sat")
        except RuntimeError as error:
            assert "PostgreSQL DATABASE_URL" in str(error)
        else:
            raise AssertionError("expected PostgreSQL guard to fail fast until the adapter is enabled")

        backend = SatPublicBackend(os.path.join(tmp, "sat_public.sqlite3"))

        status, health = backend.handle_http("GET", "/api/public/health")
        assert status == 200
        assert health["features"]["sqlite"]
        assert health["features"]["sqliteWal"]
        assert health["features"]["httpOnlyCookieAuth"]
        assert health["features"]["csrfProtection"]
        assert health["features"]["postgresqlUpgradeGuard"]
        assert health["features"]["questionReviewVersionApi"]
        assert health["features"]["classroomApi"]
        assert health["features"]["assignmentEvidenceApi"]
        assert health["databaseConfig"]["engine"] == "sqlite"
        assert health["features"]["schemaMigrations"]
        assert health["features"]["monitoring"]
        assert health["features"]["publicSignup"]
        assert health["migrationReadiness"]["ok"]
        assert health["migrationReadiness"]["sqlite"]["journalMode"] == "WAL"
        assert health["migrationReadiness"]["postgresql"]["runtimeReady"] is False
        assert health["adminCount"] == 0
        db = backend.connect()
        try:
            assert db.execute("PRAGMA journal_mode").fetchone()[0].lower() == "wal"
            assert db.execute("PRAGMA busy_timeout").fetchone()[0] >= 30000
        finally:
            db.close()

        status, early_signup = backend.handle_http(
            "POST",
            "/api/public/signup",
            body=b'{"username":"earlystudent","password":"StudentPass123","displayName":"Early Student","role":"student"}',
        )
        assert status == 201
        assert early_signup["account"]["role"] == "student"
        assert early_signup["token"]

        assert_raises_status(
            403,
            lambda: backend.handle_http(
                "POST",
                "/api/public/signup",
                body=b'{"username":"badadmin","password":"AdminPass123","displayName":"Bad Admin","role":"admin"}',
            ),
        )

        status, bootstrap = backend.handle_http(
            "POST",
            "/api/public/bootstrap",
            body=b'{"username":"admin","password":"AdminPass123","displayName":"Admin"}',
        )
        assert status == 201
        assert bootstrap["account"]["role"] == "admin"
        assert backend.admin_count() == 1

        assert_raises_status(
            409,
            lambda: backend.handle_http(
                "POST",
                "/api/public/bootstrap",
                body=b'{"username":"admin2","password":"AdminPass123"}',
            ),
        )

        status, login = backend.handle_http(
            "POST",
            "/api/public/login",
            body=b'{"username":"admin","password":"AdminPass123"}',
        )
        assert status == 200
        admin_token = login["token"]
        assert login["expiresAt"] > 0
        login_cookie_headers = set_cookie_headers(login)
        assert any("HttpOnly" in header for header in login_cookie_headers)
        assert all("SameSite=" in header for header in login_cookie_headers)
        assert any(header.startswith(f"{CSRF_COOKIE_NAME}=") for header in login_cookie_headers)
        auth = {"Authorization": f"Bearer {admin_token}"}

        status, refreshed = backend.handle_http("POST", "/api/public/session/refresh", headers=auth)
        assert status == 200
        assert refreshed["token"] != admin_token
        assert refreshed["expiresAt"] > 0
        assert refreshed["account"]["role"] == "admin"
        refreshed_cookie = cookie_pair(refreshed, SESSION_COOKIE_NAME)
        refreshed_csrf = cookie_pair(refreshed, CSRF_COOKIE_NAME)
        cookie_header = f"{refreshed_cookie}; {refreshed_csrf}"
        status, cookie_me = backend.handle_http("GET", "/api/public/me", headers={"Cookie": cookie_header})
        assert status == 200
        assert cookie_me["account"]["username"] == "admin"
        assert_raises_status(
            403,
            lambda: backend.handle_http("POST", "/api/public/session/refresh", headers={"Cookie": cookie_header}),
        )
        status, cookie_refreshed = backend.handle_http(
            "POST",
            "/api/public/session/refresh",
            headers={"Cookie": cookie_header, "X-CSRF-Token": refreshed_csrf.split("=", 1)[1]},
        )
        assert status == 200
        assert cookie_refreshed["cookieAuth"]
        assert_raises_status(
            401,
            lambda: backend.handle_http("GET", "/api/public/schema-version", headers=auth),
        )
        admin_token = cookie_refreshed["token"]
        auth = {"Authorization": f"Bearer {admin_token}"}

        status, sync_contract = backend.handle_http("GET", "/api/public/sync-contract", headers=auth)
        assert status == 200
        assert sync_contract["sourceOfTruth"]["accounts"] == "backend.accounts"
        assert sync_contract["sourceOfTruth"]["contentLifecycle"] == "backend.content_packages"
        assert sync_contract["sourceOfTruth"]["officialLogs"] == "backend.profile_records:metadata_only"
        assert sync_contract["sourceOfTruth"]["learningEvidence"] == "backend.profile_records:profile.attempts[].learningEvidence"
        assert sync_contract["sourceOfTruth"]["classes"] == "backend.classes"
        assert sync_contract["sourceOfTruth"]["assignmentEvidence"] == "backend.assignment_evidence"
        assert "sat_profile_v2_learning_evidence" in sync_contract["profileSchemas"]
        assert "officialQuestionText" in sync_contract["redactionRules"]["questionContentFields"]
        assert sync_contract["canonicalSources"]["officialLogs"] == "sat_studio_official_logs"

        status, parent = backend.handle_http(
            "POST",
            "/api/public/accounts",
            headers=auth,
            body=b'{"username":"parent1","password":"ParentPass123","displayName":"Parent One","role":"parent","scope":"public"}',
        )
        assert status == 201
        parent_id = parent["account"]["id"]

        status, student = backend.handle_http(
            "POST",
            "/api/public/accounts",
            headers=auth,
            body=f'{{"username":"student1","password":"StudentPass123","displayName":"Student One","role":"student","scope":"public","parentId":"{parent_id}"}}'.encode(
                "utf-8"
            ),
        )
        assert status == 201
        student_id = student["account"]["id"]
        assert student["account"]["parentId"] == parent_id

        status, parent_login = backend.handle_http(
            "POST",
            "/api/public/login",
            body=b'{"username":"parent1","password":"ParentPass123"}',
        )
        parent_auth = {"Authorization": f"Bearer {parent_login['token']}"}

        status, parent_student = backend.handle_http(
            "POST",
            "/api/public/accounts",
            headers=parent_auth,
            body=b'{"username":"student2","password":"StudentPass123","displayName":"Student Two","role":"student","scope":"public"}',
        )
        assert status == 201
        assert parent_student["account"]["parentId"] == parent_id
        assert parent_student["account"]["scope"] == "family"
        parent_student_id = parent_student["account"]["id"]

        status, teacher = backend.handle_http(
            "POST",
            "/api/public/accounts",
            headers=auth,
            body=b'{"username":"teacher1","password":"TeacherPass123","displayName":"Teacher One","role":"teacher","scope":"public"}',
        )
        assert status == 201
        teacher_id = teacher["account"]["id"]

        status, teacher_login = backend.handle_http(
            "POST",
            "/api/public/login",
            body=b'{"username":"teacher1","password":"TeacherPass123"}',
        )
        assert status == 200
        teacher_auth = {"Authorization": f"Bearer {teacher_login['token']}"}

        status, admin_accounts = backend.handle_http("GET", "/api/public/accounts", headers=auth)
        assert status == 200
        assert admin_accounts["count"] >= 4
        assert any(item["username"] == "admin" for item in admin_accounts["items"])

        status, parent_accounts = backend.handle_http("GET", "/api/public/accounts", headers=parent_auth)
        assert status == 200
        parent_usernames = {item["username"] for item in parent_accounts["items"]}
        assert {"parent1", "student1", "student2"}.issubset(parent_usernames)
        assert "admin" not in parent_usernames

        assert_raises_status(
            403,
            lambda: backend.handle_http(
                "POST",
                "/api/public/accounts",
                headers=parent_auth,
                body=b'{"username":"badteacher","password":"TeacherPass123","displayName":"Bad Teacher","role":"teacher"}',
            ),
        )

        status, saved = backend.handle_http(
            "POST",
            "/api/public/progress",
            headers=parent_auth,
            body=f'{{"accountId":"{student_id}","progress":{{"targetScore":1600,"attempts":12}}}}'.encode("utf-8"),
        )
        assert status == 200
        assert saved["progress"]["targetScore"] == 1600

        status, loaded = backend.handle_http(
            "GET",
            f"/api/public/progress?accountId={student_id}",
            headers=parent_auth,
        )
        assert status == 200
        assert loaded["progress"]["attempts"] == 12

        assert_raises_status(
            400,
            lambda: backend.handle_http(
                "POST",
                "/api/public/progress",
                headers=parent_auth,
                body=f'{{"accountId":"{student_id}","source":"bad source name","progress":{{"attempts":1}}}}'.encode("utf-8"),
            ),
        )

        status, official_saved = backend.handle_http(
            "POST",
            "/api/public/progress",
            headers=parent_auth,
            body=f'''{{
              "accountId":"{student_id}",
              "source":"sat_studio_official_logs",
              "progress":{{
                "officialLogs":[{{
                  "testName":"Bluebook Practice Test 1",
                  "score":1450,
                  "officialQuestionText":"Official prompt must not be stored.",
                  "officialAnswerChoices":["A","B","C","D"],
                  "questionStem":"Another protected field."
                }}]
              }}
            }}'''.encode("utf-8"),
        )
        assert status == 200
        official_log = official_saved["progress"]["officialLogs"][0]
        assert official_log["testName"] == "Bluebook Practice Test 1"
        assert official_log["score"] == 1450
        assert "officialQuestionText" not in official_log
        assert "officialAnswerChoices" not in official_log
        assert "questionStem" not in official_log
        assert official_saved["contentSafety"]["redactions"] == 3

        status, profile_saved = backend.handle_http(
            "POST",
            "/api/public/profile",
            headers=parent_auth,
            body=f'{{"accountId":"{student_id}","profile":{{"schemaVersion":"sat_profile_v1","profile":{{"attempts":[{{"questionId":"q1"}}]}}}},"clientRevision":1}}'.encode(
                "utf-8"
            ),
        )
        assert status == 200
        assert profile_saved["serverRevision"] == 1
        assert profile_saved["profile"]["profile"]["attempts"][0]["questionId"] == "q1"

        status, profile_loaded = backend.handle_http(
            "GET",
            f"/api/public/profile?accountId={student_id}",
            headers=parent_auth,
        )
        assert status == 200
        assert profile_loaded["serverRevision"] == 1

        status, profile_updated = backend.handle_http(
            "POST",
            "/api/public/profile",
            headers=parent_auth,
            body=f'{{"accountId":"{student_id}","profile":{{"schemaVersion":"sat_profile_v1","profile":{{"attempts":[{{"questionId":"q2"}}]}}}},"baseServerRevision":1,"clientRevision":2}}'.encode(
                "utf-8"
            ),
        )
        assert status == 200
        assert profile_updated["serverRevision"] == 2

        status, profile_conflict = backend.handle_http(
            "POST",
            "/api/public/profile",
            headers=parent_auth,
            body=f'{{"accountId":"{student_id}","profile":{{"schemaVersion":"sat_profile_v1","profile":{{"attempts":[]}}}},"baseServerRevision":1,"clientRevision":3}}'.encode(
                "utf-8"
            ),
        )
        assert status == 409
        assert profile_conflict["conflict"]
        assert profile_conflict["serverRevision"] == 2

        status, sensitive_profile = backend.handle_http(
            "POST",
            "/api/public/profile",
            headers=parent_auth,
            body=f'''{{
              "accountId":"{student_id}",
              "profile":{{
                "schemaVersion":"sat_profile_v1",
                "profile":{{"attempts":[{{"questionId":"q2"}}]}},
                "questions":[{{
                  "id":"vault-q1",
                  "section":"Math",
                  "domain":"Algebra",
                  "skill":"Linear equations",
                  "difficulty":"Easy",
                  "sourceType":"private_vault",
                  "visibility":"private_family",
                  "prompt":"Protected family vault prompt must not export.",
                  "choices":{{"A":"1","B":"2","C":"3","D":"4"}},
                  "correctAnswer":"C",
                  "explanation":"Protected explanation."
                }}],
                "sourceSignals":[{{"id":"sig1","sourceReference":"commercial.pdf","mistakePattern":"protected metadata"}}]
              }},
              "baseServerRevision":2,
              "clientRevision":4
            }}'''.encode("utf-8"),
        )
        assert status == 200
        assert sensitive_profile["serverRevision"] == 3
        assert sensitive_profile["contentSafety"]["redactions"] == 2
        redacted_question = sensitive_profile["profile"]["questions"][0]
        assert redacted_question["contentRedacted"]
        assert redacted_question["sourceType"] == "redacted"
        assert redacted_question["visibility"] == "redacted"
        assert "prompt" not in redacted_question
        assert sensitive_profile["profile"]["sourceSignals"] == []

        status, student_login = backend.handle_http(
            "POST",
            "/api/public/login",
            body=b'{"username":"student1","password":"StudentPass123"}',
        )
        student_auth = {"Authorization": f"Bearer {student_login['token']}"}

        status, student_accounts = backend.handle_http("GET", "/api/public/accounts", headers=student_auth)
        assert status == 200
        assert student_accounts["count"] == 1
        assert student_accounts["items"][0]["id"] == student_id

        assert_raises_status(
            403,
            lambda: backend.handle_http(
                "POST",
                "/api/public/classes",
                headers=student_auth,
                body=b'{"name":"Student class"}',
            ),
        )

        status, teacher_class = backend.handle_http(
            "POST",
            "/api/public/classes",
            headers=teacher_auth,
            body=b'{"name":"SAT 1600 Cohort"}',
        )
        assert status == 201
        class_id = teacher_class["class"]["id"]
        join_code = teacher_class["class"]["joinCode"]
        assert teacher_class["class"]["teacherAccountId"] == teacher_id
        assert join_code.startswith("SAT-")

        status, joined_class = backend.handle_http(
            "POST",
            "/api/public/classes/join",
            headers=student_auth,
            body=json.dumps({"joinCode": join_code}).encode("utf-8"),
        )
        assert status == 200
        assert joined_class["studentAccountId"] == student_id
        assert joined_class["class"]["memberCount"] == 1

        status, student_classes = backend.handle_http("GET", "/api/public/classes", headers=student_auth)
        assert status == 200
        assert student_classes["count"] == 1
        assert student_classes["items"][0]["id"] == class_id

        status, parent_classes = backend.handle_http("GET", "/api/public/classes", headers=parent_auth)
        assert status == 200
        assert any(item["id"] == class_id for item in parent_classes["items"])

        status, teacher_assignment = backend.handle_http(
            "POST",
            f"/api/public/classes/{class_id}/assignments",
            headers=teacher_auth,
            body=json.dumps(
                {
                    "title": "Linear proof sprint",
                    "mode": "proof_review",
                    "focusSkill": "Linear equations",
                    "dueDate": "2026-06-02",
                    "targetStudentIds": [student_id],
                }
            ).encode("utf-8"),
        )
        assert status == 201
        assignment_id = teacher_assignment["assignment"]["id"]
        assert teacher_assignment["assignment"]["targetStudentIds"] == [student_id]

        status, student_assignments = backend.handle_http(
            "GET",
            f"/api/public/classes/{class_id}/assignments",
            headers=student_auth,
        )
        assert status == 200
        assert student_assignments["items"][0]["id"] == assignment_id

        assert_raises_status(
            403,
            lambda: backend.handle_http(
                "POST",
                f"/api/public/classes/{class_id}/assignments",
                headers=student_auth,
                body=b'{"title":"Bad","mode":"proof_review","focusSkill":"Linear equations","dueDate":"2026-06-02"}',
            ),
        )

        status, evidence = backend.handle_http(
            "POST",
            f"/api/public/assignments/{assignment_id}/evidence",
            headers=student_auth,
            body=json.dumps({"status": "completed", "evidence": {"attempts": 4, "correct": 3, "weakSkills": ["Linear equations"]}}).encode("utf-8"),
        )
        assert status == 200
        assert evidence["assignment"]["evidenceByStudent"][student_id]["status"] == "completed"

        status, class_report = backend.handle_http("GET", f"/api/public/classes/{class_id}/report", headers=teacher_auth)
        assert status == 200
        assert class_report["class"]["memberCount"] == 1
        assert class_report["students"][0]["account"]["id"] == student_id
        assert class_report["assignments"][0]["evidenceByStudent"][student_id]["evidence"]["correct"] == 3

        assert_raises_status(
            403,
            lambda: backend.handle_http("GET", f"/api/public/classes/{class_id}/report", headers=student_auth),
        )

        safe_package = {
            "schemaVersion": "sat_content_package_v1",
            "contentVersion": "content-v1",
            "manifest": {"total": 1, "contentVersion": "content-v1"},
            "items": [
                {
                    "id": "q-public-1",
                    "section": "Math",
                    "domain": "Algebra",
                    "skill": "Linear equations",
                    "difficulty": "Medium",
                    "sourceType": "sat_king",
                    "visibility": "public_candidate",
                    "reviewStatus": "reviewed",
                    "publicationStatus": "public_candidate_reviewed",
                    "prompt": "What is x?",
                    "choices": {"A": "1", "B": "2", "C": "3", "D": "4"},
                    "correctAnswer": "A",
                    "explanation": "Solve the equation.",
                },
                {
                    "id": "q-public-2",
                    "section": "Math",
                    "domain": "Advanced Math",
                    "skill": "Nonlinear equations",
                    "difficulty": "Hard",
                    "sourceType": "sat_1590",
                    "visibility": "public_candidate",
                    "reviewStatus": "reviewed",
                    "publicationStatus": "public_candidate_reviewed",
                    "tags": ["desmos_recommended"],
                    "prompt": "What is x^2 when x = 4?",
                    "choices": {"A": "4", "B": "8", "C": "16", "D": "32"},
                    "correctAnswer": "C",
                    "explanation": "Square 4.",
                }
            ],
        }
        status, content_package = backend.handle_http(
            "POST",
            "/api/public/content-package",
            headers=auth,
            body=json.dumps({"package": safe_package}).encode("utf-8"),
        )
        assert status == 200
        assert content_package["contentVersion"] == "content-v1"
        assert content_package["package"]["items"][0]["id"] == "q-public-1"

        status, student_content_package = backend.handle_http("GET", "/api/public/content-package", headers=student_auth)
        assert status == 200
        assert student_content_package["package"]["items"][0]["prompt"] == "What is x?"

        status, scoped_content_package = backend.handle_http(
            "GET",
            "/api/public/content-package?section=Math&domain=Advanced%20Math&desmos=desmos_recommended&includeContent=false&limit=1",
            headers=student_auth,
        )
        assert status == 200
        assert scoped_content_package["package"]["query"]["total"] == 1
        assert scoped_content_package["package"]["items"][0]["id"] == "q-public-2"
        assert "prompt" not in scoped_content_package["package"]["items"][0]

        unsafe_package = {
            "schemaVersion": "sat_content_package_v1",
            "items": [
                {
                    "id": "q-private-1",
                    "section": "Math",
                    "domain": "Algebra",
                    "skill": "Linear equations",
                    "difficulty": "Easy",
                    "sourceType": "private_vault",
                    "visibility": "private_family",
                    "reviewStatus": "reviewed",
                    "publicationStatus": "public_candidate_reviewed",
                    "prompt": "Private prompt",
                }
            ],
        }
        assert_raises_status(
            400,
            lambda: backend.handle_http(
                "POST",
                "/api/public/content-package",
                headers=auth,
                body=json.dumps({"package": unsafe_package}).encode("utf-8"),
            ),
        )

        assert_raises_status(
            403,
            lambda: backend.handle_http(
                "GET",
                f"/api/public/progress?accountId={parent_id}",
                headers=student_auth,
            ),
        )

        status, audit = backend.handle_http(
            "POST",
            "/api/public/question-audits",
            headers=student_auth,
            body=b'{"questionId":"q-123","issueType":"wrong_answer_key","severity":"high","note":"Answer key looks wrong."}',
        )
        assert status == 201
        assert audit["audit"]["status"] == "open"
        audit_id = audit["audit"]["id"]

        status, resolved = backend.handle_http(
            "POST",
            f"/api/public/question-audits/{audit_id}/resolve",
            headers=auth,
            body=b'{"status":"blocked","resolutionNote":"Blocked until content review."}',
        )
        assert status == 200
        assert resolved["audit"]["status"] == "blocked"
        assert resolved["audit"]["resolverAccountId"] == bootstrap["account"]["id"]

        review_payload = {
            "questionId": "q-123",
            "sourceFile": "unit-bank.json",
            "sourceIndex": 2,
            "status": "expert_reviewed",
            "note": "Expert verified answer key and explanation.",
            "draft": {
                "id": "q-123",
                "prompt": "What is 2 + 2?",
                "choices": {"A": "3", "B": "4", "C": "5", "D": "6"},
                "correctAnswer": "B",
                "explanation": {"correct": "2 + 2 = 4."},
                "reviewStatus": "reviewed",
            },
            "before": {"id": "q-123", "prompt": "Old prompt"},
            "validation": {"ok": True, "blockers": [], "warnings": []},
            "localVersionId": "local-v1",
            "localVersionNumber": 1,
        }
        status, saved_review = backend.handle_http(
            "POST",
            "/api/public/question-reviews",
            headers=auth,
            body=json.dumps(review_payload).encode("utf-8"),
        )
        assert status == 201
        assert saved_review["version"]["questionId"] == "q-123"
        assert saved_review["version"]["versionNumber"] == 1
        assert saved_review["version"]["status"] == "expert_reviewed"
        status, review_history = backend.handle_http("GET", "/api/public/question-reviews?questionId=q-123&limit=5", headers=auth)
        assert status == 200
        assert review_history["count"] == 1
        assert review_history["items"][0]["draft"]["correctAnswer"] == "B"
        assert_raises_status(
            403,
            lambda: backend.handle_http(
                "POST",
                "/api/public/question-reviews",
                headers=student_auth,
                body=json.dumps(review_payload).encode("utf-8"),
            ),
        )

        assert_raises_status(
            403,
            lambda: backend.handle_http("GET", "/api/public/audit-log", headers=student_auth),
        )

        status, audit_log = backend.handle_http("GET", "/api/public/audit-log?limit=100", headers=auth)
        assert status == 200
        actions = {item["action"] for item in audit_log["items"]}
        assert "bootstrap_admin" in actions
        assert "create_question_audit" in actions
        assert "resolve_question_audit" in actions
        assert "save_question_review_version" in actions

        assert_raises_status(
            403,
            lambda: backend.handle_http(
                "POST",
                f"/api/public/accounts/{parent_student_id}/status",
                headers=parent_auth,
                body=b'{"status":"disabled"}',
            ),
        )

        status, student2_login = backend.handle_http(
            "POST",
            "/api/public/login",
            body=b'{"username":"student2","password":"StudentPass123"}',
        )
        assert status == 200
        status, disabled = backend.handle_http(
            "POST",
            f"/api/public/accounts/{parent_student_id}/status",
            headers=auth,
            body=b'{"status":"disabled"}',
        )
        assert status == 200
        assert disabled["account"]["status"] == "disabled"
        assert disabled["revokedSessions"] >= 1
        assert_raises_status(
            401,
            lambda: backend.handle_http("GET", "/api/public/me", headers={"Authorization": f"Bearer {student2_login['token']}"}),
        )
        assert_raises_status(
            401,
            lambda: backend.handle_http(
                "POST",
                "/api/public/login",
                body=b'{"username":"student2","password":"StudentPass123"}',
            ),
        )

        status, status_logs = backend.handle_http("GET", "/api/public/audit-log?action=update_account_status&targetType=account", headers=auth)
        assert status == 200
        assert status_logs["filters"]["action"] == "update_account_status"
        assert status_logs["items"]
        assert all(item["action"] == "update_account_status" and item["targetType"] == "account" for item in status_logs["items"])

        assert_raises_status(
            409,
            lambda: backend.handle_http(
                "POST",
                f"/api/public/accounts/{bootstrap['account']['id']}/status",
                headers=auth,
                body=b'{"status":"disabled"}',
            ),
        )

        status, schema = backend.handle_http("GET", "/api/public/schema-version", headers=auth)
        assert status == 200
        assert schema["currentVersion"] == "0010_teacher_classroom_v2"
        assert schema["syncContractVersion"] == "0010_teacher_classroom_v2"
        assert schema["migrations"]

        status, export = backend.handle_http("GET", "/api/public/export", headers=auth)
        assert status == 200
        assert export["schema"]["currentVersion"] == "0010_teacher_classroom_v2"
        assert len(export["accounts"]) >= 3
        assert export["contentPackages"][0]["contentVersion"] == "content-v1"
        assert export["progressRecords"][0]["progress"]["targetScore"] == 1600
        assert export["profileRecords"][0]["serverRevision"] == 3
        exported_profile_text = json.dumps(export["profileRecords"], sort_keys=True)
        assert "Protected family vault prompt must not export" not in exported_profile_text
        assert "Protected explanation" not in exported_profile_text
        assert "commercial.pdf" not in exported_profile_text
        assert export["profileRecords"][0]["profile"]["questions"][0]["contentRedacted"]
        assert export["questionAudits"][0]["questionId"] == "q-123"
        assert export["questionReviewVersions"][0]["questionId"] == "q-123"
        assert export["classes"][0]["id"] == class_id
        assert export["classMemberships"][0]["studentAccountId"] == student_id
        assert export["classAssignments"][0]["id"] == assignment_id
        assert export["assignmentEvidence"][0]["studentAccountId"] == student_id
        assert "passwordHash" not in export["accounts"][0]
        assert "password_hash" not in export["accounts"][0]
        system_export = backend.export_system_snapshot()
        assert system_export["schema"]["currentVersion"] == "0010_teacher_classroom_v2"
        assert "passwordHash" not in system_export["accounts"][0]

        status, monitoring = backend.handle_http("GET", "/api/public/monitoring", headers=auth)
        assert status == 200
        assert monitoring["counts"]["accounts"] >= 3
        assert monitoring["counts"]["profileRecords"] == 1
        assert monitoring["counts"]["contentPackages"] == 1
        assert monitoring["counts"]["questionReviewVersions"] == 1
        assert monitoring["counts"]["classes"] == 1
        assert monitoring["counts"]["classMemberships"] == 1
        assert monitoring["counts"]["classAssignments"] == 1
        assert monitoring["counts"]["assignmentEvidence"] == 1
        assert monitoring["counts"]["openQuestionAudits"] == 0
        assert monitoring["database"]["sizeBytes"] > 0
        assert monitoring["database"]["engine"] == "sqlite"
        assert monitoring["database"]["postgresqlUpgradeGuard"]
        assert monitoring["migrationReadiness"]["ok"]
        assert monitoring["migrationReadiness"]["currentVersion"] == monitoring["schema"]["currentVersion"]
        assert monitoring["sessions"]["revoked"] >= 1

        status, purged = backend.handle_http("POST", "/api/public/maintenance/purge-sessions", headers=auth)
        assert status == 200
        assert purged["ok"]
        assert purged["deleted"] >= 1

        assert_raises_status(
            403,
            lambda: backend.handle_http("GET", "/api/public/export", headers=student_auth),
        )
        assert_raises_status(
            403,
            lambda: backend.handle_http("GET", "/api/public/monitoring", headers=student_auth),
        )
        assert_raises_status(
            403,
            lambda: backend.handle_http("POST", "/api/public/maintenance/purge-sessions", headers=student_auth),
        )

        status, logged_out = backend.handle_http("POST", "/api/public/logout", headers=auth)
        assert status == 200
        assert logged_out["ok"]
        assert all("Max-Age=0" in header for header in set_cookie_headers(logged_out))
        assert_raises_status(
            401,
            lambda: backend.handle_http("GET", "/api/public/schema-version", headers=auth),
        )


if __name__ == "__main__":
    run()
    print("public_backend_unit_tests: pass")
