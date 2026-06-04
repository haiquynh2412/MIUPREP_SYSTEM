import json
import os
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_PATH = os.path.join(ROOT, "data", "vite-legacy-parity-audit.json")


FEATURES = [
    {
        "id": "student_dashboard",
        "area": "student",
        "requirement": "Vite student dashboard shows the next best action, progress metrics, and public-safe bank count.",
        "required": True,
        "vite_files": ["src/student/SatStudentShell.svelte"],
        "vite_markers": ["Việc nên làm tiếp theo", "Câu sẵn sàng luyện", "Trọng tâm kỹ năng"],
        "legacy_markers": ["flow-start-pretest", "student-pretest-coach"],
    },
    {
        "id": "student_diagnostic",
        "area": "student",
        "requirement": "Vite student app can run a 20-question diagnostic from the public package.",
        "required": True,
        "vite_files": ["src/student/SatStudentShell.svelte", "src/domain/student-learning.ts"],
        "vite_markers": ["buildDiagnosticSet", "Bắt đầu chẩn đoán 20 câu", "diagnostic"],
        "legacy_markers": ["startPretest", "diagnosticBlueprint"],
    },
    {
        "id": "student_practice",
        "area": "student",
        "requirement": "Vite student app can run focused practice sprints with skill filtering.",
        "required": True,
        "vite_files": ["src/student/SatStudentShell.svelte", "src/domain/student-learning.ts"],
        "vite_markers": ["buildPracticeSet", "Bắt đầu sprint", "Lọc kỹ năng"],
        "legacy_markers": ["start-topic-practice", "practiceSessionMode"],
    },
    {
        "id": "student_review",
        "area": "student",
        "requirement": "Vite student app can route missed questions into fresh proof review.",
        "required": True,
        "vite_files": ["src/student/SatStudentShell.svelte", "src/domain/student-learning.ts"],
        "vite_markers": ["buildReviewSet", "Bắt đầu sửa lỗi", "Cần sửa lỗi"],
        "legacy_markers": ["review-list", "start-due-review"],
    },
    {
        "id": "learning_event_logging",
        "area": "data",
        "requirement": "Vite attempts write a normalized learning event stream for analytics and later IRT calibration.",
        "required": True,
        "vite_files": ["src/domain/learning-events.ts", "src/domain/student-learning.ts", "src/student/SatStudentShell.svelte"],
        "vite_markers": ["LEARNING_EVENT_SCHEMA_VERSION", "recordAttempt", "syncAttemptToAccountProfile", "Dữ liệu học tập"],
        "legacy_markers": ["sat_learning_event_engine.js", "practiceHelpTelemetryByQuestionId"],
    },
    {
        "id": "parent_coach",
        "area": "parent",
        "requirement": "Vite parent route shows learner progress, weak skills, and coaching actions.",
        "required": True,
        "vite_files": ["src/parent/SatParentShell.svelte", "src/domain/parent-coach.ts"],
        "vite_markers": ["buildParentCoachModel", "Việc nên làm tiếp theo", "Sức khỏe lộ trình"],
        "legacy_markers": ["app_parent.js", "parent-approved reward"],
    },
    {
        "id": "admin_content_review",
        "area": "admin",
        "requirement": "Vite admin route can inspect content queue, gates, answers, explanations, and source facts.",
        "required": True,
        "vite_files": ["src/admin/SatAdminShell.svelte", "src/domain/admin-content.ts"],
        "vite_markers": ["buildAdminContentModel", "publicPromotionGate", "choiceViews", "explanationViews"],
        "legacy_markers": ["Question Governance", "metric-needs-review"],
    },
    {
        "id": "release_gate",
        "area": "admin",
        "requirement": "Vite admin route exposes public package release readiness and internal-field blockers.",
        "required": True,
        "vite_files": ["src/admin/SatAdminShell.svelte", "src/domain/admin-content.ts"],
        "vite_markers": ["buildReleaseModel", "Public package contract", "internal_fields_in_public_package"],
        "legacy_markers": ["exportPublicManifestArtifact", "public manifest"],
    },
    {
        "id": "account_operations",
        "area": "admin",
        "requirement": "Vite admin route owns local account CRUD, passcode policy, parent links, and profile preservation.",
        "required": True,
        "vite_files": ["src/admin/SatAdminShell.svelte", "src/domain/account-ops.ts"],
        "vite_markers": ["createAccount", "changeAccountStatus", "deleteAccount", "passcode"],
        "legacy_markers": ["sat_account_engine.js", "sat_account_view_renderers.js"],
    },
    {
        "id": "reward_operations",
        "area": "student_admin",
        "requirement": "Vite student/admin routes own reward browsing, redemption, program status, and claim resolution.",
        "required": True,
        "vite_files": ["src/student/SatStudentShell.svelte", "src/admin/SatAdminShell.svelte", "src/domain/rewards.ts"],
        "vite_markers": ["Kho phần thưởng", "redeemRewardProgram", "resolveRewardClaim", "RewardOperationsModel"],
        "legacy_markers": ["parent-approved reward", "attendance points"],
    },
    {
        "id": "backend_sync",
        "area": "admin",
        "requirement": "Vite admin route owns backend health, session, monitoring, export, and profile conflict review controls.",
        "required": True,
        "vite_files": ["src/admin/SatAdminShell.svelte", "src/domain/public-backend.ts"],
        "vite_markers": ["buildBackendSessionModel", "backendHealth", "Profile conflict review", "saveBackendProfile"],
        "legacy_markers": ["sat_public_backend.py", "backend"],
    },
    {
        "id": "route_wrappers",
        "area": "routing",
        "requirement": "HTML entry points default to Vite and preserve explicit legacy fallback.",
        "required": True,
        "vite_files": ["student.html", "admin.html", "parent.html"],
        "vite_markers": ["dist/vite/vite-student.html", "dist/vite/vite-admin.html", "dist/vite/vite-parent.html", "legacy"],
        "legacy_markers": ["index.html?entry=student", "index.html?entry=admin", "index.html?entry=parent"],
    },
    {
        "id": "lesson_library",
        "area": "student",
        "requirement": "Structured lesson library and resource links beyond immediate practice feedback.",
        "required": False,
        "vite_files": ["src/student/SatStudentShell.svelte"],
        "vite_markers": ["Thư viện bài học", "resource-links"],
        "legacy_markers": ["renderLessonList", "practice-resource-links"],
    },
    {
        "id": "vocabulary_trainer",
        "area": "student",
        "requirement": "Vocabulary flashcards, quiz, custom word import, and known-word tracking.",
        "required": False,
        "vite_files": ["src/student/SatStudentShell.svelte"],
        "vite_markers": ["Vocabulary", "flashcard", "vocab"],
        "legacy_markers": ["vocab-start-quiz", "vocab-submit-quiz", "vocab-add-word"],
    },
    {
        "id": "official_exam_logs",
        "area": "student_parent",
        "requirement": "Official/Bluebook score logs, exam review reports, and score trend evidence.",
        "required": False,
        "vite_files": ["src/student/SatStudentShell.svelte", "src/parent/SatParentShell.svelte"],
        "vite_markers": ["Nhật ký điểm thi", "Rà soát điểm thi"],
        "legacy_markers": ["officialLogs", "renderExamReviewReport", "exam-review-report"],
    },
    {
        "id": "news_feed",
        "area": "admin_student",
        "requirement": "Admin-authored news posts and learner-facing announcements.",
        "required": False,
        "vite_files": ["src/admin/SatAdminShell.svelte", "src/student/SatStudentShell.svelte"],
        "vite_markers": ["Tin báo", "Announcement"],
        "legacy_markers": ["news-submit", "news-list", "newsPosts"],
    },
    {
        "id": "advanced_source_ledger",
        "area": "admin",
        "requirement": "Full source ledger/archive registry dashboards beyond the current source governance summary.",
        "required": False,
        "vite_files": ["src/admin/SatAdminShell.svelte", "src/domain/admin-content.ts"],
        "vite_markers": ["Source governance", "sourceFacts"],
        "legacy_markers": ["renderSourceLedger", "archive registry", "source ledger"],
    },
]


def read_text(relative_path):
    path = os.path.join(ROOT, relative_path)
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        return handle.read()


def marker_hits(markers, texts):
    haystack = "\n".join(texts)
    return [marker for marker in markers if marker in haystack]


def evaluate_feature(feature):
    vite_texts = [read_text(path) for path in feature["vite_files"]]
    legacy_texts = [read_text("app.js"), read_text("app_student.js"), read_text("app_admin.js"), *vite_texts]
    vite_hits = marker_hits(feature["vite_markers"], vite_texts)
    legacy_hits = marker_hits(feature["legacy_markers"], legacy_texts)
    vite_complete = len(vite_hits) == len(feature["vite_markers"])
    legacy_present = len(legacy_hits) > 0
    if vite_complete:
        status = "vite_owned"
    elif legacy_present:
        status = "legacy_only"
    else:
        status = "missing_evidence"
    return {
        **feature,
        "status": status,
        "viteHits": vite_hits,
        "missingViteMarkers": [marker for marker in feature["vite_markers"] if marker not in vite_hits],
        "legacyHits": legacy_hits,
    }


def build_audit():
    features = [evaluate_feature(feature) for feature in FEATURES]
    required = [feature for feature in features if feature["required"]]
    blockers = [
        {
            "id": feature["id"],
            "status": feature["status"],
            "missingViteMarkers": feature["missingViteMarkers"],
        }
        for feature in required
        if feature["status"] != "vite_owned"
    ]
    remaining = [feature for feature in features if feature["status"] == "legacy_only"]
    return {
        "schemaVersion": "vite_legacy_parity_audit_v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "totalFeatures": len(features),
            "requiredFeatures": len(required),
            "viteOwned": sum(1 for feature in features if feature["status"] == "vite_owned"),
            "legacyOnly": len(remaining),
            "missingEvidence": sum(1 for feature in features if feature["status"] == "missing_evidence"),
            "requiredBlockers": len(blockers),
        },
        "blockers": blockers,
        "remainingLegacyOnly": [
            {
                "id": feature["id"],
                "area": feature["area"],
                "requirement": feature["requirement"],
                "legacyHits": feature["legacyHits"],
                "missingViteMarkers": feature["missingViteMarkers"],
            }
            for feature in remaining
        ],
        "features": features,
    }


def write_audit(audit):
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as handle:
        json.dump(audit, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def main():
    audit = build_audit()
    write_audit(audit)
    print(json.dumps(audit["summary"], indent=2))
    if audit["blockers"]:
        print(json.dumps({"blockers": audit["blockers"]}, indent=2), flush=True)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
