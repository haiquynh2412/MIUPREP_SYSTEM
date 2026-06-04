const fs = require("node:fs");
const path = require("node:path");

const manifestEngine = require("../sat_public_manifest_engine.js");
const exporter = require("./export_public_manifest_artifact.js");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const ARTIFACTS_DIR = path.join(ROOT, "artifacts");
const REPORT_JSON = path.join(DATA_DIR, "public-promotion-review-report.json");
const REPORT_CSV = path.join(DATA_DIR, "public-promotion-review-decisions.csv");
const AUDIT_LOG = path.join(DATA_DIR, "public-promotion-audit-log.jsonl");
const GATE_VERSION = "public-promotion-quality-copyright-gate-2026-05-26";

const DIRECT_COPYRIGHT_BLOCKED_SOURCE_TYPES = new Set([
  "private_vault",
  "college_board",
  "cracksat_reference",
  "official_log",
]);

const LICENSE_UNCLEAR_SOURCE_TYPES = new Set([
  "opensat",
]);

const SAFE_GENERATED_SOURCE_TYPES = new Set([
  "ai_generated",
  "antigravity",
  "foundation",
  "sat_1590",
  "sat_king",
  "sat_studio_original",
]);

function lower(value) {
  return String(value || "").toLowerCase();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function appendJsonl(filePath, rows) {
  if (!rows.length) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

function recordsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.questions)) return payload.questions;
  return [];
}

function setRecordsOnPayload(payload, records) {
  if (Array.isArray(payload)) return records;
  if (payload && typeof payload === "object" && Array.isArray(payload.questions)) {
    payload.questions = records;
  }
  return payload;
}

function reviewStatusOk(question) {
  return lower(question.reviewStatus) === "reviewed";
}

function blockedLifecycle(question) {
  const status = `${lower(question.reviewStatus)} ${lower(question.publicationStatus)} ${lower(question.auditStatus)} ${lower(question.practicePool)}`;
  return status.includes("reject") || status.includes("blocked") || status.includes("hidden_duplicate");
}

function hasOriginalityAttestation(question) {
  const text = [
    question.licenseNote,
    question.publicReviewNote,
    question.sourceUsagePolicy,
    question.sourceName,
  ].join(" ");
  const normalized = lower(text);
  return (
    normalized.includes("original")
    || normalized.includes("no source exercise text copied")
    || normalized.includes("no third-party prompt")
    || normalized.includes("no source prompt")
    || normalized.includes("no kaplan prompt")
    || normalized.includes("no source text copied")
    || normalized.includes("blueprint-only")
    || normalized.includes("provenance_only_unified_pool")
  );
}

function sourceTypeForGate(question) {
  const sourceType = lower(question.sourceType);
  if (!sourceType && question._sourceFile === "antigravity-bank.json") return "sat_studio_original";
  return sourceType || "unknown";
}

function copyrightDecision(question) {
  const sourceType = sourceTypeForGate(question);
  const text = lower([
    question.sourceType,
    question.sourceName,
    question.sourceReference,
    question.sourceUrl,
    question.licenseNote,
    question.publicReviewNote,
  ].join(" "));

  if (question.neverPublic) return { ok: false, reason: "never_public" };
  if (DIRECT_COPYRIGHT_BLOCKED_SOURCE_TYPES.has(sourceType)) return { ok: false, reason: `copyright_blocked_source:${sourceType}` };
  if (LICENSE_UNCLEAR_SOURCE_TYPES.has(sourceType)) return { ok: false, reason: `license_unclear_source:${sourceType}` };
  if (text.includes("do not publish") || text.includes("do not public") || text.includes("private family vault")) {
    return { ok: false, reason: "explicit_private_or_do_not_publish" };
  }
  if (sourceType === "unknown") return { ok: false, reason: "source_type_unknown" };
  if (!SAFE_GENERATED_SOURCE_TYPES.has(sourceType)) return { ok: false, reason: `source_type_not_public_safe:${sourceType}` };
  if (!hasOriginalityAttestation(question)) return { ok: false, reason: "missing_originality_attestation" };
  return { ok: true, reason: "copyright_safe_original_or_generated" };
}

function normalizeQuestionForPromotion(question) {
  if (!question.sourceType && question._sourceFile === "antigravity-bank.json") {
    question.sourceType = "sat_studio_original";
    if (!question.sourceName) question.sourceName = "SAT Studio Original Bank";
    if (!question.licenseNote) {
      question.licenseNote = "SAT Studio original item generated for internal SAT blueprint training; no third-party prompt, choices, data, or explanation copied.";
    }
  }
  if (!question.sourceName && SAFE_GENERATED_SOURCE_TYPES.has(lower(question.sourceType))) {
    question.sourceName = "SAT Studio Original Bank";
  }
  question.sourceUsagePolicy = question.sourceUsagePolicy || "provenance_only_unified_pool";
}

function promotedClone(question, nowIso, actor = "sat_studio_admin_workflow") {
  const clone = JSON.parse(JSON.stringify(question));
  normalizeQuestionForPromotion(clone);
  clone.reviewStatus = "reviewed";
  clone.visibility = "public_candidate";
  clone.publicationStatus = "public_candidate_reviewed";
  clone.publicReviewNote = [
    `Public promotion ${nowIso.slice(0, 10)}: expert-reviewed item passed structural/answer/explanation gate.`,
    "Copyright gate: SAT Studio original/generated item; no third-party prompt, passage, answer choice, data table, or explanation text is copied.",
    "Source label is retained only for internal provenance and routing audit.",
  ].join(" ");
  clone.publicPromotionGateVersion = GATE_VERSION;
  clone.publicPromotedAt = nowIso;
  clone.publicPromotedBy = actor;
  clone.promotedAt = nowIso;
  clone.promotedBy = actor;
  clone.publicPromotionDecision = "promoted_public_candidate";
  return clone;
}

function promotionGate(question, nowIso) {
  if (!reviewStatusOk(question)) return { ok: false, reason: "review_not_reviewed" };
  if (blockedLifecycle(question)) return { ok: false, reason: "blocked_or_rejected_lifecycle" };
  const copyright = copyrightDecision(question);
  if (!copyright.ok) return copyright;
  const candidate = promotedClone(question, nowIso);
  const safetyReasons = manifestEngine.publicSafetyReasons(candidate);
  if (safetyReasons.length) return { ok: false, reason: safetyReasons[0], reasons: safetyReasons };
  if (!manifestEngine.sourceSignature(candidate).signed) return { ok: false, reason: "source_signature_missing" };
  return { ok: true, reason: "promote_public_candidate" };
}

function countBy(rows, keyFn) {
  return rows.reduce((counts, row) => {
    const key = keyFn(row) || "(blank)";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeDecisionCsv(rows, filePath = REPORT_CSV) {
  const headers = [
    "id",
    "sourceFile",
    "sourceType",
    "section",
    "domain",
    "skill",
    "difficulty",
    "decision",
    "reason",
    "previousVisibility",
    "previousPublicationStatus",
  ];
  const lines = [headers.join(",")].concat(
    rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  );
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function datedArtifactPath(basePath, artifact, kind) {
  const date = String(artifact.exportedAt || new Date().toISOString()).slice(0, 10);
  const checksum = String(artifact.stableContentChecksum || "checksum").replace(/[^a-zA-Z0-9]+/g, "-");
  return path.join(path.dirname(basePath), `sat-studio-public-${kind}-ready-${date}-${checksum}.json`);
}

function regeneratePublicArtifacts(options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const dataDir = options.dataDir || DATA_DIR;
  const artifactsDir = options.artifactsDir || ARTIFACTS_DIR;
  const questionFiles = options.questionFiles || exporter.QUESTION_FILES;
  const manifestOut = options.manifestOut || path.join(artifactsDir, "sat-studio-public-manifest-latest.json");
  const packageOut = options.packageOut || path.join(artifactsDir, "sat-studio-public-content-package-latest.json");
  const integrityPath = options.integrityPath || path.join(dataDir, "question-integrity-report.json");
  const integrity = fs.existsSync(integrityPath) ? readJson(integrityPath) : {};
  const { questions, loadedFiles } = exporter.loadQuestions({ dataDir, questionFiles });
  const artifacts = exporter.buildReleaseArtifacts(questions, {
    integrity,
    nowIso,
    revision: options.revision || 1,
  });
  const paths = {
    manifestLatest: manifestOut,
    packageLatest: packageOut,
    manifestDated: datedArtifactPath(manifestOut, artifacts.manifestArtifact, "manifest"),
    packageDated: datedArtifactPath(packageOut, artifacts.manifestArtifact, "content-package"),
  };
  writeJson(paths.manifestLatest, artifacts.manifestArtifact);
  writeJson(paths.packageLatest, artifacts.contentPackage);
  if (options.writeDated !== false) {
    writeJson(paths.manifestDated, artifacts.manifestArtifact);
    writeJson(paths.packageDated, artifacts.contentPackage);
  }
  return {
    loadedFiles,
    paths,
    ...artifacts.summary,
  };
}

function applyPromotion(options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const apply = Boolean(options.apply);
  const dataDir = options.dataDir || DATA_DIR;
  const artifactsDir = options.artifactsDir || ARTIFACTS_DIR;
  const questionFiles = options.questionFiles || exporter.QUESTION_FILES;
  const reportJson = options.reportJson || path.join(dataDir, path.basename(REPORT_JSON));
  const reportCsv = options.reportCsv || path.join(dataDir, path.basename(REPORT_CSV));
  const auditLog = options.auditLog || path.join(dataDir, path.basename(AUDIT_LOG));
  const targetIds = new Set((options.ids || []).map((id) => String(id || "").trim()).filter(Boolean));
  const allEligible = Boolean(options.allEligible);
  if (apply && targetIds.size === 0 && !allEligible) {
    throw new Error("Refusing to apply public promotion without explicit --id/--ids or --all-eligible.");
  }
  const decisions = [];
  const auditEntries = [];
  const seenTargetIds = new Set();
  const files = {};
  let promotedCount = 0;
  let alreadyPublicCount = 0;
  let changedCount = 0;

  for (const filename of questionFiles) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) continue;
    const payload = readJson(filePath);
    const records = recordsFromPayload(payload);
    let fileChanged = false;
    let filePromoted = 0;

    records.forEach((record, index) => {
      if (!record || typeof record !== "object") return;
      const normalized = exporter.normalizeRawQuestion(record, filename, index);
      if (!normalized) return;
      const id = String(record.id || normalized.id || `${filename}#${index}`);
      if (targetIds.size > 0 && !targetIds.has(id)) return;
      if (targetIds.has(id)) seenTargetIds.add(id);
      const wasPublic =
        lower(record.visibility) === "public_candidate"
        && lower(record.publicationStatus).startsWith("public_candidate")
        && lower(record.reviewStatus) === "reviewed";
      const gate = promotionGate(normalized, nowIso);
      const decision = gate.ok ? "promote_or_keep_public" : "hold_private";
      decisions.push({
        id,
        sourceFile: filename,
        sourceIndex: index,
        sourceType: sourceTypeForGate(normalized),
        section: normalized.section || "",
        domain: normalized.domain || "",
        skill: normalized.skill || "",
        difficulty: normalized.difficulty || "",
        decision,
        reason: gate.reason,
        previousVisibility: record.visibility || "",
        previousPublicationStatus: record.publicationStatus || "",
      });
      if (!gate.ok) return;
      if (wasPublic) {
        alreadyPublicCount += 1;
        return;
      }
      const promoted = promotedClone(normalized, nowIso, options.actor || "sat_studio_admin_workflow");
      const before = JSON.stringify(record);
      const beforeState = {
        reviewStatus: record.reviewStatus || "",
        visibility: record.visibility || "",
        publicationStatus: record.publicationStatus || "",
      };
      Object.assign(record, promoted);
      if (JSON.stringify(record) !== before) {
        fileChanged = true;
        filePromoted += 1;
        promotedCount += 1;
        changedCount += 1;
        auditEntries.push({
          version: GATE_VERSION,
          action: "promote_public_candidate",
          id,
          sourceFile: filename,
          sourceIndex: index,
          actor: options.actor || "sat_studio_admin_workflow",
          appliedAt: nowIso,
          reason: gate.reason,
          before: beforeState,
          after: {
            reviewStatus: record.reviewStatus || "",
            visibility: record.visibility || "",
            publicationStatus: record.publicationStatus || "",
          },
        });
      }
    });

    files[filename] = {
      total: records.length,
      promoted: filePromoted,
      changed: fileChanged,
    };
    if (apply && fileChanged) {
      fs.mkdirSync(artifactsDir, { recursive: true });
      const backupName = `${filename.replace(/\.json$/i, "")}.before-public-promotion-${nowIso.replace(/[:.]/g, "-")}.json`;
      fs.copyFileSync(filePath, path.join(artifactsDir, backupName));
      writeJson(filePath, setRecordsOnPayload(payload, records));
    }
  }

  const missingTargetIds = [...targetIds].filter((id) => !seenTargetIds.has(id));
  let artifactReport = null;
  if (apply && options.regeneratePackage !== false) {
    artifactReport = regeneratePublicArtifacts({
      dataDir,
      artifactsDir,
      questionFiles,
      nowIso,
      manifestOut: options.manifestOut,
      packageOut: options.packageOut,
      writeDated: options.writeDated,
      revision: options.revision,
    });
  }
  if (apply && auditEntries.length) {
    appendJsonl(
      auditLog,
      auditEntries.map((entry) => ({
        ...entry,
        artifact: artifactReport
          ? {
              ready: artifactReport.ready,
              manifestReadyCount: artifactReport.manifestReadyCount,
              contentPackageItems: artifactReport.contentPackageItems,
              contentVersion: artifactReport.contentVersion,
            }
          : null,
      }))
    );
  }

  const summary = {
    version: GATE_VERSION,
    generatedAt: nowIso,
    mode: apply ? "apply" : "dry_run",
    targetIds: [...targetIds],
    allEligible,
    missingTargetIds,
    totalDecisions: decisions.length,
    promotedCount,
    alreadyPublicCount,
    changedCount,
    heldCount: decisions.filter((row) => row.decision === "hold_private").length,
    byDecision: countBy(decisions, (row) => row.decision),
    byReason: countBy(decisions, (row) => row.reason),
    bySourceType: countBy(decisions, (row) => row.sourceType),
    files,
    auditLog: apply ? auditLog : "",
    regeneratedPublicArtifacts: artifactReport,
  };
  const report = {
    ...summary,
    policy: {
      publicIf: [
        "reviewStatus is reviewed",
        "not rejected, blocked, hidden duplicate, neverPublic, or private vault",
        "source is SAT Studio original/generated or has explicit no-copied-source attestation",
        "public manifest safety gate has no structural/source blockers",
      ],
      heldUntilRightsConfirmed: ["opensat"],
      neverPublic: ["private_vault", "direct official/commercial copied source rows"],
    },
    sampleHeld: decisions.filter((row) => row.decision === "hold_private").slice(0, 30),
    samplePromoted: decisions.filter((row) => row.decision === "promote_or_keep_public" && row.previousVisibility !== "public_candidate").slice(0, 30),
  };
  fs.mkdirSync(dataDir, { recursive: true });
  writeJson(reportJson, report);
  writeDecisionCsv(decisions, reportCsv);
  return report;
}

function parseArgs(argv) {
  const args = {
    apply: argv.includes("--apply"),
    json: argv.includes("--json"),
    allEligible: argv.includes("--all-eligible"),
    regeneratePackage: !argv.includes("--no-regenerate"),
    writeDated: !argv.includes("--no-dated"),
    ids: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--id") {
      args.ids.push(argv[++index]);
    } else if (arg === "--ids") {
      args.ids.push(...String(argv[++index] || "").split(","));
    } else if (arg === "--actor") {
      args.actor = argv[++index];
    }
  }
  args.ids = args.ids.map((id) => String(id || "").trim()).filter(Boolean);
  return args;
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = applyPromotion(args);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      [
        `Public promotion mode: ${report.mode}`,
        `Targets: ${report.targetIds.length ? report.targetIds.join(", ") : report.allEligible ? "all eligible" : "dry-run all"}`,
        `Promoted: ${report.promotedCount}`,
        `Already public: ${report.alreadyPublicCount}`,
        `Held private: ${report.heldCount}`,
        `Missing target ids: ${report.missingTargetIds.length}`,
        report.regeneratedPublicArtifacts ? `Public package items: ${report.regeneratedPublicArtifacts.contentPackageItems}` : "Public package items: not regenerated",
        `Report: ${REPORT_JSON}`,
      ].join("\n")
    );
  }
  return report;
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

module.exports = {
  GATE_VERSION,
  applyPromotion,
  copyrightDecision,
  parseArgs,
  promotionGate,
  promotedClone,
  regeneratePublicArtifacts,
  sourceTypeForGate,
};
