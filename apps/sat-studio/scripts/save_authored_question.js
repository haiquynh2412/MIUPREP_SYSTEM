const fs = require("node:fs");
const path = require("node:path");

const authoringEngine = require("../sat_authoring_engine.js");
const questionImport = require("../sat_question_import.js");
const exporter = require("./export_public_manifest_artifact.js");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const ARTIFACTS_DIR = path.join(ROOT, "artifacts");
const DEFAULT_TARGET_BANK = "sat-studio-foundation-bank.json";
const REPORT_JSON = path.join(DATA_DIR, "authoring-import-save-report.json");
const AUDIT_LOG = path.join(DATA_DIR, "authoring-import-save-log.jsonl");
const WORKFLOW_VERSION = "authoring-import-save-workflow-v1-2026-05-28";

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
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
    return payload;
  }
  return records;
}

function stableChecksum(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function dateStamp(nowIso) {
  return String(nowIso || new Date().toISOString()).slice(0, 10).replace(/-/g, "");
}

function backupFile(filePath, artifactsDir, nowIso) {
  if (!fs.existsSync(filePath)) return "";
  fs.mkdirSync(artifactsDir, { recursive: true });
  const backupName = `${path.basename(filePath).replace(/\.json$/i, "")}.before-authoring-save-${nowIso.replace(/[:.]/g, "-")}.json`;
  const backupPath = path.join(artifactsDir, backupName);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function inputRowsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.questions)) return payload.questions;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

function normalizeDraft(record, index, options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const normalized = questionImport.normalizeQuestionRecord(
    {
      ...record,
      sourceType: record.sourceType || "sat_studio_original",
      sourceName: record.sourceName || "SAT Studio Authored Draft",
      visibility: "private_family",
      reviewStatus: "needs_review",
      publicationStatus: "draft_needs_review",
    },
    index,
    {
      defaultSourceName: "SAT Studio Authored Draft",
      defaultSourceReference: record.sourceReference || "manual_authoring",
    }
  );
  if (!normalized) return null;
  normalized.id = record.id || `satstudio-${dateStamp(nowIso)}-${stableChecksum(`${normalized.prompt}|${normalized.correctAnswer}`).slice(0, 8)}`;
  normalized.sourceType = record.sourceType || "sat_studio_original";
  normalized.sourceName = record.sourceName || "SAT Studio Authored Draft";
  normalized.sourceUsagePolicy = record.sourceUsagePolicy || "sat_studio_original_authoring";
  normalized.licenseNote = record.licenseNote || "SAT Studio original draft; no third-party prompt, passage, answer choices, data, or explanation copied.";
  normalized.reviewStatus = "needs_review";
  normalized.visibility = "private_family";
  normalized.publicationStatus = "draft_needs_review";
  normalized.neverPublic = Boolean(record.neverPublic);
  normalized.createdAt = record.createdAt || nowIso;
  normalized.createdBy = options.actor || record.createdBy || "content-admin";
  normalized.authoringWorkflowVersion = WORKFLOW_VERSION;
  return normalized;
}

function validateDraft(draft, existingQuestions, options = {}) {
  const issues = [];
  const warnings = [];
  const duplicateId = existingQuestions.some((question) => String(question.id || "") === String(draft.id || ""));
  if (duplicateId) issues.push("duplicate_id");

  const autoCheck = authoringEngine.autoValidateGeneratedDraft(draft);
  if (autoCheck.status === "failed") issues.push(...autoCheck.errors.map((issue) => `auto_${issue}`));
  warnings.push(...autoCheck.warnings.map((warning) => `auto_${warning}`));

  const safetyDraft = cloneJson(draft);
  const safety = authoringEngine.runDraftSafetyChecks(
    safetyDraft,
    { brief: draft.generationBrief || draft.sourceReference || "" },
    { existingQuestions }
  );
  if (safety.blocked) issues.push(...safety.blocks.map((issue) => `safety_${issue}`));
  warnings.push(...safety.warnings.map((warning) => `safety_${warning}`));

  draft.autoCheck = autoCheck;
  draft.safetyReport = safety;
  draft.practicePool = safetyDraft.practicePool || draft.practicePool || "core_pool";
  draft.skeletonDiversity = safetyDraft.skeletonDiversity || draft.skeletonDiversity || null;
  draft.contentAudit = {
    version: WORKFLOW_VERSION,
    verdict: issues.length ? "blocked" : "needs_review",
    checkedAt: options.nowIso || new Date().toISOString(),
    notes: issues.length ? issues.join("; ") : "Saved as original draft; requires expert review before trusted study or public promotion.",
    warnings,
  };
  draft.authoringIntake = {
    version: WORKFLOW_VERSION,
    status: issues.length ? "blocked" : warnings.length ? "needs_review" : "ready_for_review",
    checkedAt: options.nowIso || new Date().toISOString(),
    issues,
    warnings,
  };
  return {
    ok: issues.length === 0,
    id: draft.id,
    issues,
    warnings,
    autoCheck,
    safety,
  };
}

function saveAuthoredQuestions(options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const apply = Boolean(options.apply);
  const dataDir = options.dataDir || DATA_DIR;
  const artifactsDir = options.artifactsDir || ARTIFACTS_DIR;
  const questionFiles = options.questionFiles || exporter.QUESTION_FILES;
  const targetBank = options.targetBank || DEFAULT_TARGET_BANK;
  const inputPath = options.inputPath ? path.resolve(options.inputPath) : "";
  const reportJson = options.reportJson || path.join(dataDir, path.basename(REPORT_JSON));
  const auditLog = options.auditLog || path.join(dataDir, path.basename(AUDIT_LOG));
  const actor = options.actor || "content-admin";
  if (!inputPath) throw new Error("Authoring save requires --input <json-file>.");
  const inputPayload = readJson(inputPath);
  const inputRows = inputRowsFromPayload(inputPayload);
  if (!inputRows.length) throw new Error("Authoring input did not contain a question or questions array.");

  const { questions } = exporter.loadQuestions({ dataDir, questionFiles });
  const targetPath = path.join(dataDir, targetBank);
  const targetPayload = readJson(targetPath, []);
  const targetRecords = recordsFromPayload(targetPayload);
  const accepted = [];
  const rejected = [];
  const seenInBatch = new Set();
  const existingForValidation = [...questions];

  inputRows.forEach((record, index) => {
    const draft = normalizeDraft(record, index, { nowIso, actor });
    if (!draft) {
      rejected.push({ index, id: record?.id || "", ok: false, issues: ["invalid_question_shape"], warnings: [] });
      return;
    }
    if (seenInBatch.has(draft.id)) {
      rejected.push({ index, id: draft.id, ok: false, issues: ["duplicate_id_in_input"], warnings: [] });
      return;
    }
    seenInBatch.add(draft.id);
    const validation = validateDraft(draft, existingForValidation, { nowIso });
    const row = {
      index,
      id: draft.id,
      ok: validation.ok,
      issues: validation.issues,
      warnings: validation.warnings,
      section: draft.section,
      domain: draft.domain,
      skill: draft.skill,
      difficulty: draft.difficulty,
    };
    if (!validation.ok) {
      rejected.push(row);
      return;
    }
    accepted.push({ row, draft });
    existingForValidation.push(draft);
  });

  const backups = [];
  if (apply && accepted.length) {
    backups.push(backupFile(targetPath, artifactsDir, nowIso));
    accepted.forEach(({ draft }) => targetRecords.push(draft));
    writeJson(targetPath, setRecordsOnPayload(targetPayload, targetRecords));
    appendJsonl(
      auditLog,
      accepted.map(({ row }) => ({
        version: WORKFLOW_VERSION,
        action: "save_authored_question",
        id: row.id,
        actor,
        appliedAt: nowIso,
        targetBank,
        status: "needs_review",
      }))
    );
  }

  const report = {
    version: WORKFLOW_VERSION,
    generatedAt: nowIso,
    mode: apply ? "apply" : "dry_run",
    inputPath,
    targetBank,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    accepted: accepted.map(({ row }) => row),
    rejected,
    backups: backups.filter(Boolean),
    auditLog: apply ? auditLog : "",
  };
  writeJson(reportJson, report);
  return report;
}

function parseArgs(argv) {
  const args = {
    apply: argv.includes("--apply"),
    json: argv.includes("--json"),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.inputPath = argv[++index];
    else if (arg === "--target-bank") args.targetBank = argv[++index];
    else if (arg === "--actor") args.actor = argv[++index];
  }
  return args;
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = saveAuthoredQuestions(args);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      [
        `Authoring save mode: ${report.mode}`,
        `Accepted: ${report.acceptedCount}`,
        `Rejected: ${report.rejectedCount}`,
        `Target bank: ${report.targetBank}`,
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
  DEFAULT_TARGET_BANK,
  WORKFLOW_VERSION,
  normalizeDraft,
  parseArgs,
  saveAuthoredQuestions,
  validateDraft,
};
