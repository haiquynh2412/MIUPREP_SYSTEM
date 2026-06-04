import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

try:
    from scripts.check_questions import DATA_DIR, QUESTION_FILES, is_core_visible_row, normalize_raw_question, topic_key
except ModuleNotFoundError:
    from check_questions import DATA_DIR, QUESTION_FILES, is_core_visible_row, normalize_raw_question, topic_key


ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "data" / "product-governance-audit-20260520.json"
OUT_MD = ROOT / "artifacts" / "product-governance-audit-20260520-vi.md"
BLOCKED_PUBLIC_SOURCE_TYPES = {"private_vault", "college_board", "cracksat_reference", "official_log"}
HIGH_RISK_SOURCE_HINTS = ("cracksat", "college board", "archive", "kaplan")


def load_payload(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    questions = payload.get("questions") if isinstance(payload, dict) else payload
    return [item for item in questions if isinstance(item, dict)] if isinstance(questions, list) else []


def is_grid_in(question: dict[str, Any]) -> bool:
    value = str(question.get("questionType") or question.get("type") or "").lower()
    return value in {"student_produced_response", "student-produced-response", "grid_in", "grid-in", "numeric", "spr"}


def has_explanation(question: dict[str, Any]) -> bool:
    explanation = question.get("explanation")
    if not explanation:
        return False
    if isinstance(explanation, str):
        return bool(explanation.strip())
    if isinstance(explanation, dict):
        return any(str(value or "").strip() for value in explanation.values())
    return True


def structurally_incomplete(question: dict[str, Any]) -> bool:
    if not has_explanation(question):
        return True
    if is_grid_in(question):
        answer = str(question.get("correctAnswer") or "").strip()
        acceptable = question.get("acceptableAnswers")
        return not answer or not any(str(value or "").strip() for value in acceptable or [])
    choices = question.get("choices") if isinstance(question.get("choices"), dict) else {}
    return not all(str(choices.get(letter) or "").strip() for letter in "ABCD") or not choices.get(question.get("correctAnswer"))


def is_blocked_for_study(question: dict[str, Any]) -> bool:
    review = str(question.get("reviewStatus") or "").lower()
    publication = str(question.get("publicationStatus") or "").lower()
    audit = str(question.get("auditStatus") or "").lower()
    verdict = str((question.get("contentAudit") or {}).get("verdict") or "").lower() if isinstance(question.get("contentAudit"), dict) else ""
    return (
        review == "rejected"
        or audit == "blocked"
        or publication == "audit_blocked"
        or publication.startswith("rejected")
        or verdict in {"blocked", "fail"}
        or structurally_incomplete(question)
    )


def public_safety_reasons(question: dict[str, Any]) -> list[str]:
    reasons: list[str] = []
    visibility = str(question.get("visibility") or "").lower()
    review = str(question.get("reviewStatus") or "").lower()
    publication = str(question.get("publicationStatus") or "").lower()
    audit = str(question.get("auditStatus") or "").lower()
    source_type = str(question.get("sourceType") or "").lower()
    source_risk = str(question.get("sourceRisk") or question.get("risk") or "").lower()
    verdict = str((question.get("contentAudit") or {}).get("verdict") or "").lower() if isinstance(question.get("contentAudit"), dict) else ""
    source_text = " ".join(
        str(question.get(key) or "").lower()
        for key in ("sourceName", "sourceReference", "sourceSignalId", "licenseNote", "sourceUsagePolicy")
    )
    if visibility != "public_candidate":
        reasons.append("visibility_not_public_candidate")
    if review != "reviewed":
        reasons.append("review_not_reviewed")
    if not publication.startswith("public_candidate"):
        reasons.append("publication_not_public_candidate")
    if source_type in BLOCKED_PUBLIC_SOURCE_TYPES:
        reasons.append(f"blocked_source_type:{source_type}")
    if source_risk == "high":
        reasons.append("source_risk_high")
    if question.get("neverPublic"):
        reasons.append("never_public")
    if audit == "blocked":
        reasons.append("audit_blocked")
    if publication == "audit_blocked" or publication.startswith("rejected") or publication.startswith("hidden_duplicate"):
        reasons.append(f"blocked_publication:{publication}")
    if verdict in {"blocked", "fail"}:
        reasons.append(f"content_audit_{verdict}")
    if structurally_incomplete(question):
        reasons.append("structurally_incomplete")
    if source_type in {"private_vault", "official_log"} or any(hint in source_text for hint in HIGH_RISK_SOURCE_HINTS):
        reasons.append("source_signal_needs_manifest_review")
    return reasons


def public_safe(question: dict[str, Any]) -> bool:
    return not [reason for reason in public_safety_reasons(question) if reason != "source_signal_needs_manifest_review"]


def source_file_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for filename in QUESTION_FILES:
        path = DATA_DIR / filename
        if not path.exists():
            continue
        for index, question in enumerate(load_payload(path)):
            row = normalize_raw_question(question, filename, index)
            rows.append({"filename": filename, "index": index, "question": question, "row": row})
    return rows


def lifecycle_state(question: dict[str, Any]) -> str:
    review = str(question.get("reviewStatus") or "").lower()
    publication = str(question.get("publicationStatus") or "").lower()
    visibility = str(question.get("visibility") or "").lower()
    pool = str(question.get("practicePool") or (question.get("skeletonDiversity") or {}).get("practicePool") or "core_pool").lower()
    audit = str(question.get("auditStatus") or "").lower()
    verdict = str((question.get("contentAudit") or {}).get("verdict") or "").lower() if isinstance(question.get("contentAudit"), dict) else ""
    if review == "rejected" or publication.startswith("rejected"):
        return "rejected"
    if audit == "blocked" or publication == "audit_blocked" or verdict in {"blocked", "fail"}:
        return "blocked"
    if pool == "hidden_duplicate" or publication.startswith("hidden_duplicate"):
        return "hidden_duplicate"
    if pool == "remedial_pool":
        return "remedial_only"
    if review != "reviewed":
        return "needs_expert_review"
    if visibility == "public_candidate" and publication.startswith("public_candidate"):
        return "public_candidate_reviewed"
    if visibility == "private_family":
        return "reviewed_private"
    return "reviewed_unclear_publication"


def sample(records: list[dict[str, Any]], limit: int = 8) -> list[dict[str, Any]]:
    return records[:limit]


def main() -> None:
    records = source_file_rows()
    questions = [record["question"] for record in records]
    public_candidates = [record for record in records if str(record["question"].get("visibility") or "").lower() == "public_candidate"]
    admin_public_ready = [
        record
        for record in public_candidates
        if record["question"].get("reviewStatus") == "reviewed"
        and str(record["question"].get("publicationStatus") or "").startswith("public_candidate")
        and record["question"].get("auditStatus") != "blocked"
    ]
    manifest_safe = [record for record in records if public_safe(record["question"])]
    manifest_needs_source_review = [
        record
        for record in manifest_safe
        if "source_signal_needs_manifest_review" in public_safety_reasons(record["question"])
    ]
    admin_ready_but_not_manifest_safe = [
        {
            "id": record["question"].get("id"),
            "sourceFile": record["filename"],
            "sourceType": record["question"].get("sourceType"),
            "publicationStatus": record["question"].get("publicationStatus"),
            "reasons": public_safety_reasons(record["question"]),
        }
        for record in admin_public_ready
        if not public_safe(record["question"])
    ]
    public_candidates_blocked = [
        {
            "id": record["question"].get("id"),
            "sourceFile": record["filename"],
            "sourceType": record["question"].get("sourceType"),
            "reviewStatus": record["question"].get("reviewStatus"),
            "publicationStatus": record["question"].get("publicationStatus"),
            "reasons": public_safety_reasons(record["question"]),
        }
        for record in public_candidates
        if not public_safe(record["question"])
    ]
    manifest_scripts = sorted(str(path.relative_to(ROOT)) for path in (ROOT / "scripts").glob("*manifest*"))
    manifest_engine_path = ROOT / "sat_public_manifest_engine.js"
    if manifest_engine_path.exists():
        manifest_scripts.insert(0, str(manifest_engine_path.relative_to(ROOT)))
    release_gate_scripts = sorted(str(path.relative_to(ROOT)) for path in (ROOT / "scripts").glob("*release*gate*"))
    app_text = (ROOT / "app.js").read_text(encoding="utf-8")
    release_split_implemented = "systemHealthReady" in app_text and "publicRelease:" in app_text and "SatPublicManifestEngine.buildPublicManifest" in app_text
    renderer_text = (ROOT / "sat_view_renderers.js").read_text(encoding="utf-8")
    manifest_engine_text = manifest_engine_path.read_text(encoding="utf-8") if manifest_engine_path.exists() else ""
    manifest_export_present = (
        "SatPublicManifestEngine.buildPublicManifestArtifact" in app_text
        and "admin-export-public-manifest" in renderer_text
        and "stableContentChecksum" in manifest_engine_text
    )
    manifest_gate_present = bool(manifest_scripts or release_gate_scripts)

    lifecycle_counts = Counter(lifecycle_state(question) for question in questions)
    publication_counts = Counter(str(question.get("publicationStatus") or "missing") for question in questions)
    review_counts = Counter(str(question.get("reviewStatus") or "missing") for question in questions)
    visibility_counts = Counter(str(question.get("visibility") or "missing") for question in questions)
    ambiguous_reviewed = [
        {
            "id": question.get("id"),
            "sourceFile": record["filename"],
            "visibility": question.get("visibility"),
            "publicationStatus": question.get("publicationStatus"),
            "reviewStatus": question.get("reviewStatus"),
            "sourceType": question.get("sourceType"),
        }
        for record in records
        for question in [record["question"]]
        if lifecycle_state(question) == "reviewed_unclear_publication"
    ]

    integrity_path = DATA_DIR / "question-integrity-report.json"
    integrity = json.loads(integrity_path.read_text(encoding="utf-8")) if integrity_path.exists() else {}
    topic_plan = integrity.get("topicGovernancePlan") or {}
    unresolved_topics = []
    by_topic = defaultdict(list)
    for record in records:
        topic = topic_key(record["row"])
        if topic:
            by_topic[topic].append(record)
    topic_names = list(topic_plan.keys()) or ["hypotenuse", "probability", "circumference"]
    for topic in topic_names:
        core_visible = [record for record in by_topic.get(topic, []) if is_core_visible_row(record["row"])]
        plan_row = topic_plan.get(topic) or {}
        target_count = int(plan_row.get("target", 35) or 35)
        overflow = max(0, len(core_visible) - target_count)
        if not overflow and not plan_row:
            continue
        difficulty = Counter(str(record["question"].get("difficulty") or "missing") for record in core_visible)
        source = Counter(str(record["question"].get("sourceType") or "missing") for record in core_visible)
        mutable_easy_medium = [
            record
            for record in core_visible
            if str(record["filename"]) in {
                "antigravity-bank.json",
                "archive-source-ai-bank.json",
                "kaplan-sat-math-ai-bank.json",
                "sat-1590-elite-ai-bank.json",
                "sat-king-supplemental-ai-bank.json",
            }
            and str(record["question"].get("difficulty") or "").lower() in {"easy", "medium", ""}
            and str(record["question"].get("sourceType") or "").lower() in {"ai_generated", "antigravity", "sat_king", "sat_1590"}
        ]
        unresolved_topics.append(
            {
                "topic": topic,
                "coreVisible": len(core_visible),
                "target": target_count,
                "overflow": int(plan_row.get("overflowCount", overflow) or overflow),
                "difficulty": dict(difficulty),
                "sourceType": dict(source),
                "remainingEasyMediumGeneratedCandidates": len(mutable_easy_medium),
                "sampleIds": [record["question"].get("id") for record in core_visible[:10]],
                "auditAction": plan_row.get("recommendedAction", "manual_review_or_remedial_routing"),
            }
        )
    unresolved_topics.sort(key=lambda row: row["overflow"], reverse=True)

    written_work_fields = ("studentWork", "workShown", "evidenceCitation", "proofPhrase", "firstMove", "scratchWork", "writtenProof")
    attempt_field_hits = Counter()
    attempt_count = 0
    app_js = (ROOT / "app.js").read_text(encoding="utf-8")
    for field in written_work_fields:
        if field in app_js:
            attempt_field_hits[field] += 1
    capture_gaps = [
        "No structured attempt field for Math written work / scratch-work.",
        "No structured attempt field for R&W evidence citation before answer choice selection.",
        "Mistake note exists, but it is stored as profile notes rather than attached to the attempt as proof evidence.",
        "Remediation can prescribe evidence-first or written-work drills, but completion proof is inferred from later attempts, not captured directly.",
    ]

    report = {
        "generatedAt": str(date.today()),
        "inventory": {
            "loadedRows": len(questions),
            "reviewStatus": dict(review_counts),
            "visibility": dict(visibility_counts),
            "publicationStatusTop": dict(publication_counts.most_common(20)),
            "lifecycleState": dict(lifecycle_counts),
        },
        "publicReleaseGate": {
            "adminPublicReadyHeuristicCount": len(admin_public_ready),
            "manifestSafeCount": len(manifest_safe),
            "manifestNeedsSourceReviewCount": len(manifest_needs_source_review),
            "publicCandidateCount": len(public_candidates),
            "publicCandidateBlockedCount": len(public_candidates_blocked),
            "adminReadyButNotManifestSafeCount": len(admin_ready_but_not_manifest_safe),
            "publicManifestScripts": manifest_scripts,
            "releaseGateScripts": release_gate_scripts,
            "hasPublicManifestGate": manifest_gate_present,
            "hasPublicManifestArtifactExport": manifest_export_present,
            "publicCandidateBlockedSamples": sample(public_candidates_blocked),
            "adminReadyButNotManifestSafeSamples": sample(admin_ready_but_not_manifest_safe),
            "sourceTypeManifestSafe": dict(Counter(str(record["question"].get("sourceType") or "missing") for record in manifest_safe)),
        },
        "contentLifecycle": {
            "ambiguousReviewedCount": len(ambiguous_reviewed),
            "ambiguousReviewedSamples": sample(ambiguous_reviewed),
            "stateMachineDebt": [
                "reviewStatus, visibility, publicationStatus, auditStatus, practicePool, and contentAudit can drift independently.",
                "Several legacy publicationStatus values such as 'reviewed' and 'private_reviewed' are not canonical lifecycle states.",
                "Admin public-ready counts do not currently share one manifest gate with learner-facing permission checks.",
            ],
        },
        "topicOverload": unresolved_topics,
        "writtenWorkEvidenceCapture": {
            "appFieldPresence": dict(attempt_field_hits),
            "captureGaps": capture_gaps,
            "recommendation": "Add attempt-level studentWork/evidenceCitation fields and require them for hard Math proof sets and R&W evidence/misread errors.",
        },
        "priorityFindings": [
            *(
                []
                if release_split_implemented
                else [
                    {
                        "priority": "P0",
                        "title": "Admin release readiness is too permissive for public launch language.",
                        "evidence": "Admin releaseReady is based on integrity criticalCount == 0; it does not require open audits = 0, pending review = 0, or a signed public manifest.",
                        "action": "Rename current status to system-health clear, then add a separate public release gate/manifest.",
                    }
                ]
            ),
            *(
                []
                if manifest_gate_present and manifest_export_present
                else [
                    {
                        "priority": "P1",
                        "title": "Runtime public manifest gate is implemented; export artifact is still missing.",
                        "evidence": f"Admin heuristic count = {len(admin_public_ready)} and manifest-safe count = {len(manifest_safe)} currently match; runtime manifest gate present = {manifest_gate_present}.",
                        "action": "Keep Admin Center on the shared manifest gate; next add a signed JSON export artifact when preparing an actual public deployment.",
                    }
                ]
                if manifest_gate_present
                else [
                    {
                        "priority": "P0",
                        "title": "Public-ready count uses a weaker heuristic than the permission/public-safe gate.",
                        "evidence": f"Admin heuristic count = {len(admin_public_ready)} and manifest-safe count = {len(manifest_safe)}.",
                        "action": "Build a public manifest exporter and make Admin Center display manifest-ready, source-signed, and blocked counts from that artifact.",
                    }
                ]
            ),
            {
                "priority": "P1",
                "title": "Content lifecycle needs canonical states.",
                "evidence": f"{len(ambiguous_reviewed)} reviewed rows fall into reviewed_unclear_publication under the proposed lifecycle mapping.",
                "action": "Add a canonical lifecycleState derivation and migrate legacy publicationStatus values gradually.",
            },
            *(
                [
                    {
                        "priority": "P1",
                        "title": "Some rejected rows still retain public_candidate visibility.",
                        "evidence": f"{len(public_candidates_blocked)} public_candidate rows are blocked by the strict gate, mostly rejected template variants.",
                        "action": "Normalize rejected public candidates to hidden_duplicate or rejected visibility/state so admin metrics do not need to infer intent.",
                    }
                ]
                if public_candidates_blocked
                else []
            ),
            {
                "priority": "P1",
                "title": "Written-work/evidence-citation proof is not captured at attempt level.",
                "evidence": "The app stores selected answer, timing, error tag, and notes, but no structured proof/evidence field on the attempt.",
                "action": "Add proof fields to attempt creation and surface them in remediation/parent reports.",
            },
            {
                "priority": "P2",
                "title": f"{len(unresolved_topics)} repeated topics still need manual keep/remedial decisions.",
                "evidence": ", ".join(f"{row['topic']} overflow {row['overflow']}" for row in unresolved_topics),
                "action": "Review hard/immutable variants manually; keep only distinct cognitive moves.",
            },
        ],
    }

    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "summary": report["inventory"], "priorityFindings": report["priorityFindings"]}, indent=2, ensure_ascii=False))


def render_markdown(report: dict[str, Any]) -> str:
    release = report["publicReleaseGate"]
    lifecycle = report["contentLifecycle"]
    topics = report["topicOverload"]
    findings = report["priorityFindings"]
    lines = [
        "# Product Governance Audit - 2026-05-20",
        "",
        "## Ket luan nhanh",
        "",
        "He thong content hien an toan ve answer-key blocker va da co runtime public manifest gate + artifact export. Chua nen goi la public-release-grade vi con no lifecycle state, rejected public-candidate cleanup, va proof evidence capture.",
        "",
        "## So lieu chinh",
        "",
        f"- Loaded rows: {report['inventory']['loadedRows']}",
        f"- Public candidate rows: {release['publicCandidateCount']}",
        f"- Admin public-ready heuristic: {release['adminPublicReadyHeuristicCount']}",
        f"- Manifest-safe theo gate chat hon: {release['manifestSafeCount']}",
        f"- Public manifest gate: {'co' if release['hasPublicManifestGate'] else 'chua co'}",
        f"- Public manifest artifact export: {'co' if release.get('hasPublicManifestArtifactExport') else 'chua co'}",
        f"- Public candidates dang bi gate chan: {release['publicCandidateBlockedCount']}",
        f"- Reviewed rows co publication state chua ro: {lifecycle['ambiguousReviewedCount']}",
        "",
        "## Findings uu tien",
        "",
    ]
    for item in findings:
        lines.extend(
            [
                f"### {item['priority']} - {item['title']}",
                f"- Evidence: {item['evidence']}",
                f"- Action: {item['action']}",
                "",
            ]
        )
    lines.extend(["## Topic overload con lai", ""])
    for item in topics:
        lines.append(
            f"- {item['topic']}: core-visible {item['coreVisible']}, overflow {item['overflow']}, difficulty {item['difficulty']}, remaining easy/medium generated candidates {item['remainingEasyMediumGeneratedCandidates']}."
        )
    lines.extend(
        [
            "",
            "## Written-work / evidence capture",
            "",
            "- Hien co selected answer, timing, error tag, mistake note, remediation status.",
            "- Chua co attempt-level `studentWork`, `evidenceCitation`, `firstMove`, hoac `writtenProof`.",
            "- Neu muon thanh SAT tutor top-tier, proof phai duoc bat ngay luc submit bai, khong chi suy ra tu cau dung/sai tiep theo.",
            "",
            "## De xuat thu tu tiep theo",
            "",
            "1. Tao lifecycleState canonical de gom `reviewStatus`, `visibility`, `publicationStatus`, `auditStatus`, `practicePool`, va `contentAudit`.",
            "2. Normalize 6 rejected/blocked public-candidate rows thanh hidden/rejected state de Admin metric khong phai suy doan.",
            "3. Them written-work/evidence-citation capture vao attempt model.",
            f"4. Review {len(topics)} topic overload con lai bang manual keep/remedial decision.",
            "5. Sau khi blockers = 0, export `sat-studio-public-manifest-*.json` tu Admin Center lam deploy artifact.",
            "",
        ]
    )
    return "\n".join(lines)


if __name__ == "__main__":
    main()
