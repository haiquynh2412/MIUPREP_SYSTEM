(function initSatStudioPublicManifestEngine(root, factory) {
  let permissions = root?.SatStudioPermissions;
  let lifecycleEngine = root?.SatStudioContentLifecycleEngine;
  if (!permissions && typeof require === "function") {
    permissions = require("./sat_permissions.js");
  }
  if (!lifecycleEngine && typeof require === "function") {
    lifecycleEngine = require("./sat_content_lifecycle_engine.js");
  }
  const publicManifestEngine = factory(permissions, lifecycleEngine);
  if (typeof module === "object" && module.exports) {
    module.exports = publicManifestEngine;
  }
  if (root) {
    root.SatPublicManifestEngine = publicManifestEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioPublicManifestEngine(permissions, lifecycleEngine) {
  const BLOCKED_PUBLIC_SOURCE_TYPES = new Set(["private_vault", "college_board", "cracksat_reference", "official_log", "opensat"]);

  function lower(value) {
    return String(value || "").toLowerCase();
  }

  function isGridInQuestion(question = {}) {
    const normalizedType = lower(question.questionType || question.type);
    return ["student_produced_response", "student-produced-response", "grid_in", "grid-in", "numeric", "spr"].includes(normalizedType);
  }

  function hasExplanation(question = {}) {
    const explanation = question.explanation;
    if (!explanation) return false;
    if (typeof explanation === "string") return Boolean(explanation.trim());
    if (typeof explanation === "object") return Object.values(explanation).some((value) => Boolean(String(value || "").trim()));
    return true;
  }

  function isStructurallyIncomplete(question = {}) {
    if (!hasExplanation(question)) return true;
    if (isGridInQuestion(question)) {
      const correctAnswer = String(question.correctAnswer || "").trim();
      const acceptableAnswers = Array.isArray(question.acceptableAnswers) ? question.acceptableAnswers : [];
      return !correctAnswer || !acceptableAnswers.some((value) => String(value || "").trim());
    }
    const choices = question.choices && typeof question.choices === "object" ? question.choices : {};
    return !["A", "B", "C", "D"].every((letter) => String(choices[letter] || "").trim()) || !choices[question.correctAnswer];
  }

  function publicSafetyReasons(question = {}) {
    const reasons = [];
    const lifecycle = lifecycleEngine?.deriveLifecycleState ? lifecycleEngine.deriveLifecycleState(question) : null;
    const visibility = lower(question.visibility);
    const reviewStatus = lower(question.reviewStatus);
    const publicationStatus = lower(question.publicationStatus);
    const auditStatus = lower(question.auditStatus);
    const sourceType = lower(question.sourceType);
    const sourceRisk = lower(question.sourceRisk || question.risk);
    const contentVerdict = lower(question.contentAudit?.verdict);

    if (lifecycle && !lifecycle.publicReady) reasons.push(`lifecycle:${lifecycle.state}`);
    if (visibility !== "public_candidate") reasons.push("visibility_not_public_candidate");
    if (reviewStatus !== "reviewed") reasons.push("review_not_reviewed");
    if (!publicationStatus.startsWith("public_candidate")) reasons.push("publication_not_public_candidate");
    if (BLOCKED_PUBLIC_SOURCE_TYPES.has(sourceType)) reasons.push(`blocked_source_type:${sourceType}`);
    if (sourceRisk === "high") reasons.push("source_risk_high");
    if (question.neverPublic) reasons.push("never_public");
    if (auditStatus === "blocked") reasons.push("audit_blocked");
    if (publicationStatus === "audit_blocked" || publicationStatus.startsWith("rejected") || publicationStatus.startsWith("hidden_duplicate")) {
      reasons.push(`blocked_publication:${publicationStatus || "missing"}`);
    }
    if (contentVerdict === "blocked" || contentVerdict === "fail") reasons.push(`content_audit_${contentVerdict}`);
    if (isStructurallyIncomplete(question)) reasons.push("structurally_incomplete");
    return reasons;
  }

  function isPublicSafeQuestion(question = {}) {
    if (permissions?.isPublicSafeQuestion) return permissions.isPublicSafeQuestion(question);
    return publicSafetyReasons(question).length === 0;
  }

  function sourceSignature(question = {}) {
    const text = [
      question.licenseNote,
      question.sourceUsagePolicy,
      question.publicReviewNote,
      question.sourceName,
      question.contentAudit?.sourceUsagePolicy,
      question.strict1600Review?.status,
      question.contentAudit?.verdict,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const reasons = [];
    if (question.promotedBy && question.promotedAt) reasons.push("admin_promotion_record");
    if (question.publicReviewNote) reasons.push("public_review_note");
    if (question.contentAudit?.verdict === "pass") reasons.push("content_audit_pass");
    if (question.strict1600Review?.status === "reviewed") reasons.push("strict_reviewed");
    if (/\boriginal\b|no source exercise text copied|no .* copied|provenance|internal blueprint|source is provenance/.test(text)) {
      reasons.push("source_policy_original_or_provenance");
    }
    return {
      signed: reasons.length > 0,
      reasons,
    };
  }

  function publicManifestRecord(question = {}) {
    const lifecycle = lifecycleEngine?.deriveLifecycleState ? lifecycleEngine.deriveLifecycleState(question) : null;
    return {
      id: question.id || "",
      section: question.section || "",
      domain: question.domain || "",
      skill: question.skill || "",
      difficulty: question.difficulty || "",
      sourceType: question.sourceType || "",
      sourceName: question.sourceName || "",
      publicationStatus: question.publicationStatus || "",
      reviewStatus: question.reviewStatus || "",
      visibility: question.visibility || "",
      questionType: question.questionType || question.type || "multiple_choice",
      targetBand: question.targetBand || "",
      modulePlacement: question.modulePlacement || "",
      estimatedTimeSeconds: question.estimatedTimeSeconds || null,
      contentAuditVersion: question.contentAudit?.version || "",
      strictReviewVersion: question.strict1600Review?.version || "",
      lifecycleState: lifecycle?.state || question.lifecycleState || "",
      lifecycleVersion: lifecycle?.version || question.lifecycleVersion || "",
      sourceSignature: sourceSignature(question),
    };
  }

  function countBy(rows = [], key) {
    return rows.reduce((counts, row) => {
      const value = typeof key === "function" ? key(row) : row?.[key];
      const normalized = value || "missing";
      counts[normalized] = (counts[normalized] || 0) + 1;
      return counts;
    }, {});
  }

  function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === "object") {
      return Object.keys(value)
        .sort()
        .reduce((result, key) => {
          result[key] = stableValue(value[key]);
          return result;
        }, {});
    }
    if (value === undefined) return null;
    return value;
  }

  function stableJson(value) {
    return JSON.stringify(stableValue(value));
  }

  function stableChecksum(value) {
    const text = typeof value === "string" ? value : stableJson(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function openAuditEntriesCount(questionAudits = {}) {
    return Object.values(questionAudits || {}).reduce((sum, entries) => {
      if (!Array.isArray(entries)) return sum;
      return sum + entries.filter((entry) => !["resolved", "closed", "passed", "dismissed"].includes(entry.status || "open")).length;
    }, 0);
  }

  function buildReleaseChecks({ integrityLoaded = false, criticalCount = 0, openAuditEntries = 0, manifestCount = 0, blockedPublicCandidateCount = 0, unsignedSourceCount = 0 } = {}) {
    return [
      { id: "integrity_report_loaded", ok: Boolean(integrityLoaded), label: "Integrity report loaded" },
      { id: "critical_clear", ok: Number(criticalCount || 0) === 0, label: "Critical issues clear", value: Number(criticalCount || 0) },
      { id: "open_audits_clear", ok: Number(openAuditEntries || 0) === 0, label: "Open audit reports clear", value: Number(openAuditEntries || 0) },
      { id: "manifest_has_questions", ok: Number(manifestCount || 0) > 0, label: "Manifest has public questions", value: Number(manifestCount || 0) },
      { id: "public_candidates_clean", ok: Number(blockedPublicCandidateCount || 0) === 0, label: "Blocked public candidates clear", value: Number(blockedPublicCandidateCount || 0) },
      { id: "source_signatures_clear", ok: Number(unsignedSourceCount || 0) === 0, label: "Source signatures clear", value: Number(unsignedSourceCount || 0) },
    ];
  }

  function buildPublicManifest(questions = [], context = {}) {
    const rows = Array.isArray(questions) ? questions.filter(Boolean) : [];
    const publicCandidates = rows.filter((question) => lower(question.visibility) === "public_candidate");
    const safeCandidates = publicCandidates.filter((question) => isPublicSafeQuestion(question));
    const safeRecords = safeCandidates.map((question) => ({ question, signature: sourceSignature(question) }));
    const unsignedSourceRows = safeRecords.filter((record) => !record.signature.signed);
    const manifestQuestions = safeRecords.filter((record) => record.signature.signed).map((record) => record.question);
    const blockedPublicCandidates = publicCandidates
      .filter((question) => !isPublicSafeQuestion(question))
      .map((question) => ({
        id: question.id || "",
        sourceType: question.sourceType || "",
        reviewStatus: question.reviewStatus || "",
        publicationStatus: question.publicationStatus || "",
        reasons: publicSafetyReasons(question),
      }));
    const openAuditEntries =
      context.openAuditEntries !== undefined ? Number(context.openAuditEntries || 0) : openAuditEntriesCount(context.questionAudits || {});
    const checks = buildReleaseChecks({
      integrityLoaded: Boolean(context.integrityLoaded),
      criticalCount: Number(context.criticalCount || 0),
      openAuditEntries,
      manifestCount: manifestQuestions.length,
      blockedPublicCandidateCount: blockedPublicCandidates.length,
      unsignedSourceCount: unsignedSourceRows.length,
    });
    const blockers = checks.filter((check) => !check.ok);
    return {
      version: "public-manifest-gate-v1-2026-05-20",
      generatedAt: context.nowIso || new Date().toISOString(),
      publicCandidateCount: publicCandidates.length,
      publicSafeCount: safeCandidates.length,
      manifestReadyCount: manifestQuestions.length,
      sourceSignedCount: manifestQuestions.length,
      sourceUnsignedCount: unsignedSourceRows.length,
      blockedPublicCandidateCount: blockedPublicCandidates.length,
      sourceTypeCounts: countBy(manifestQuestions, "sourceType"),
      blockedPublicCandidates: blockedPublicCandidates.slice(0, Number(context.sampleLimit || 12)),
      unsignedSourceRows: unsignedSourceRows
        .slice(0, Number(context.sampleLimit || 12))
        .map((record) => ({ id: record.question.id || "", sourceType: record.question.sourceType || "", sourceName: record.question.sourceName || "" })),
      manifestRows: manifestQuestions.map(publicManifestRecord),
      releaseGate: {
        ready: blockers.length === 0,
        label: blockers.length === 0 ? "Public release ready" : "Public release blocked",
        detail:
          blockers.length === 0
            ? `${manifestQuestions.length} source-signed public questions can be exported.`
            : blockers.map((check) => `${check.label}: ${check.value ?? "missing"}`).slice(0, 3).join("; "),
        checks,
        blockers,
      },
    };
  }

  function buildPublicManifestArtifact(questions = [], context = {}) {
    const manifest = context.manifest || buildPublicManifest(questions, context);
    const checks = Array.isArray(manifest.releaseGate?.checks) ? manifest.releaseGate.checks : [];
    const blockers = Array.isArray(manifest.releaseGate?.blockers) ? manifest.releaseGate.blockers : [];
    const manifestRows = (Array.isArray(manifest.manifestRows) ? manifest.manifestRows : []).map((row, index) => ({
      manifestIndex: index + 1,
      ...row,
    }));
    const counts = {
      publicCandidates: Number(manifest.publicCandidateCount || 0),
      publicSafe: Number(manifest.publicSafeCount || 0),
      manifestReady: Number(manifest.manifestReadyCount || 0),
      sourceSigned: Number(manifest.sourceSignedCount || 0),
      sourceUnsigned: Number(manifest.sourceUnsignedCount || 0),
      blockedPublicCandidates: Number(manifest.blockedPublicCandidateCount || 0),
    };
    const contentLedger = {
      schemaVersion: "sat-public-manifest-artifact-v1",
      gateVersion: manifest.version,
      counts,
      sourceTypeCounts: manifest.sourceTypeCounts || {},
      checks,
      manifestRows,
    };
    const artifact = {
      schemaVersion: "sat-public-manifest-artifact-v1",
      gateVersion: manifest.version,
      exportedAt: context.exportedAt || context.nowIso || manifest.generatedAt || new Date().toISOString(),
      exportStatus: manifest.releaseGate?.ready ? "ready" : "blocked_report",
      publicContentIncluded: false,
      publicContentPolicy: "Manifest artifact contains release metadata only; prompts, answer choices, explanations, and private source text are excluded.",
      releaseGate: manifest.releaseGate || { ready: false, checks: [], blockers: [] },
      counts,
      sourceTypeCounts: manifest.sourceTypeCounts || {},
      blockedPublicCandidates: Array.isArray(manifest.blockedPublicCandidates) ? manifest.blockedPublicCandidates : [],
      unsignedSourceRows: Array.isArray(manifest.unsignedSourceRows) ? manifest.unsignedSourceRows : [],
      manifestRows,
      stableContentChecksum: stableChecksum(contentLedger),
    };
    artifact.stableAuditChecksum = stableChecksum({
      ...contentLedger,
      exportedAt: artifact.exportedAt,
      exportStatus: artifact.exportStatus,
      blockers,
      blockedPublicCandidates: artifact.blockedPublicCandidates,
      unsignedSourceRows: artifact.unsignedSourceRows,
    });
    return artifact;
  }

  return {
    buildPublicManifestArtifact,
    buildPublicManifest,
    buildReleaseChecks,
    isPublicSafeQuestion,
    publicManifestRecord,
    publicSafetyReasons,
    stableChecksum,
    sourceSignature,
  };
});
