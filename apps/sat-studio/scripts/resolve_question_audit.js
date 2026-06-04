const fs = require("node:fs");
const path = require("node:path");

const auditEngine = require("../sat_question_audit_engine.js");
const exporter = require("./export_public_manifest_artifact.js");
const promotionWorkflow = require("./review_and_promote_public_safe_questions.js");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const ARTIFACTS_DIR = path.join(ROOT, "artifacts");
const QUESTION_AUDITS_JSON = path.join(DATA_DIR, "question-audits.json");
const REPORT_JSON = path.join(DATA_DIR, "question-audit-resolution-report.json");
const AUDIT_LOG = path.join(DATA_DIR, "question-audit-resolution-log.jsonl");
const WORKFLOW_VERSION = "question-audit-resolution-workflow-v1-2026-05-28";
const ACTIONS = new Set(["pass", "block", "reject"]);

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
  }
  return payload;
}

function backupFile(filePath, artifactsDir, nowIso, label) {
  if (!fs.existsSync(filePath)) return "";
  fs.mkdirSync(artifactsDir, { recursive: true });
  const base = path.basename(filePath).replace(/\.json$/i, "");
  const backupName = `${base}.before-${label}-${nowIso.replace(/[:.]/g, "-")}.json`;
  const backupPath = path.join(artifactsDir, backupName);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function questionState(question = {}) {
  return {
    reviewStatus: question.reviewStatus || "",
    visibility: question.visibility || "",
    publicationStatus: question.publicationStatus || "",
    auditStatus: question.auditStatus || "",
    auditUpdatedAt: question.auditUpdatedAt || "",
  };
}

function ensureAuditBucket(questionAudits, questionId) {
  if (!questionAudits[questionId]) questionAudits[questionId] = [];
  if (!Array.isArray(questionAudits[questionId])) questionAudits[questionId] = [];
  return questionAudits[questionId];
}

function findQuestionById(dataDir, questionFiles, id) {
  for (const filename of questionFiles) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) continue;
    const payload = readJson(filePath);
    const records = recordsFromPayload(payload);
    const index = records.findIndex((record, rowIndex) => {
      const normalized = exporter.normalizeRawQuestion(record, filename, rowIndex);
      return String(record?.id || normalized?.id || "") === id;
    });
    if (index >= 0) {
      return {
        filename,
        filePath,
        payload,
        records,
        index,
        question: records[index],
      };
    }
  }
  return null;
}

function resolvedPassEntry(questionId, account, nowIso, note) {
  return {
    id: `audit-pass-${nowIso.replace(/[^0-9]/g, "")}-${questionId}`,
    questionId,
    issueType: "admin_pass",
    severity: "low",
    note: note || "Admin verified answer, explanation, source safety, and duplicate risk.",
    status: "resolved",
    reportedBy: account.id,
    reportedByName: account.name,
    reportedByRole: account.role,
    reportedAt: nowIso,
    resolvedBy: account.id,
    resolvedAt: nowIso,
    resolution: note || "Audit checked: answer, explanation, source policy, and duplicate risk passed.",
  };
}

function applyAction(question, questionAudits, action, account, options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const note = options.note || "";
  const bucket = ensureAuditBucket(questionAudits, question.id);

  if (action === "pass") {
    if (bucket.length === 0) bucket.unshift(resolvedPassEntry(question.id, account, nowIso, note));
    auditEngine.applyAuditPass(question, bucket, account, { nowIso, resolution: note });
    return { resolution: "passed", auditEntry: bucket[0] || null };
  }

  if (action === "block") {
    const entry = auditEngine.createAdminBlockEntry(question, account, {
      id: options.auditId,
      nowIso,
      note: note || "Content Admin blocked this question pending correction.",
    });
    auditEngine.applyQuestionAuditBlock(question, questionAudits, entry);
    return { resolution: "blocked", auditEntry: entry };
  }

  if (action === "reject") {
    const entry = auditEngine.createAdminBlockEntry(question, account, {
      id: options.auditId,
      nowIso,
      note: note || "Content Admin rejected this question from trusted study and public use.",
    });
    entry.issueType = "admin_reject";
    entry.status = "resolved";
    entry.resolvedBy = account.id;
    entry.resolvedAt = nowIso;
    entry.resolution = note || "Rejected after admin audit resolution.";
    bucket.unshift(entry);
    question.reviewStatus = "rejected";
    question.visibility = "private_family";
    question.publicationStatus = "rejected_audit";
    question.auditStatus = "blocked";
    question.auditUpdatedAt = nowIso;
    return { resolution: "rejected", auditEntry: entry };
  }

  throw new Error(`Unsupported audit action: ${action}`);
}

function resolveQuestionAudit(options = {}) {
  const id = String(options.id || "").trim();
  const action = String(options.action || "").trim().toLowerCase();
  const nowIso = options.nowIso || new Date().toISOString();
  const apply = Boolean(options.apply);
  const dataDir = options.dataDir || DATA_DIR;
  const artifactsDir = options.artifactsDir || ARTIFACTS_DIR;
  const questionFiles = options.questionFiles || exporter.QUESTION_FILES;
  const questionAuditsPath = options.questionAuditsPath || path.join(dataDir, path.basename(QUESTION_AUDITS_JSON));
  const reportJson = options.reportJson || path.join(dataDir, path.basename(REPORT_JSON));
  const auditLog = options.auditLog || path.join(dataDir, path.basename(AUDIT_LOG));
  const actor = options.actor || "content-admin";
  const account = { id: actor, name: options.actorName || "Content Admin", role: "admin" };

  if (!id) throw new Error("Question audit resolution requires --id.");
  if (!ACTIONS.has(action)) throw new Error("Question audit resolution action must be pass, block, or reject.");

  const match = findQuestionById(dataDir, questionFiles, id);
  if (!match) {
    const notFoundReport = {
      version: WORKFLOW_VERSION,
      generatedAt: nowIso,
      mode: apply ? "apply" : "dry_run",
      id,
      action,
      found: false,
      error: "question_not_found",
    };
    writeJson(reportJson, notFoundReport);
    return notFoundReport;
  }

  const questionAudits = readJson(questionAuditsPath, {}) || {};
  const workingQuestion = apply ? match.question : cloneJson(match.question);
  const workingAudits = apply ? questionAudits : cloneJson(questionAudits);
  const before = questionState(workingQuestion);
  const beforeOpenEntries = ensureAuditBucket(workingAudits, id).filter((entry) => !["resolved", "dismissed"].includes(entry.status)).length;
  const result = applyAction(workingQuestion, workingAudits, action, account, {
    nowIso,
    note: options.note,
    auditId: options.auditId,
  });
  const after = questionState(workingQuestion);
  const afterOpenEntries = ensureAuditBucket(workingAudits, id).filter((entry) => !["resolved", "dismissed"].includes(entry.status)).length;

  let artifactReport = null;
  const backups = [];
  if (apply) {
    backups.push(backupFile(match.filePath, artifactsDir, nowIso, "audit-resolution"));
    backups.push(backupFile(questionAuditsPath, artifactsDir, nowIso, "audit-resolution"));
    writeJson(match.filePath, setRecordsOnPayload(match.payload, match.records));
    writeJson(questionAuditsPath, workingAudits);
    if (options.regeneratePackage !== false) {
      artifactReport = promotionWorkflow.regeneratePublicArtifacts({
        dataDir,
        artifactsDir,
        questionFiles,
        nowIso,
        writeDated: options.writeDated,
        revision: options.revision,
      });
    }
  }

  const report = {
    version: WORKFLOW_VERSION,
    generatedAt: nowIso,
    mode: apply ? "apply" : "dry_run",
    found: true,
    id,
    action,
    sourceFile: match.filename,
    sourceIndex: match.index,
    before,
    after,
    beforeOpenEntries,
    afterOpenEntries,
    resolution: result.resolution,
    auditEntry: result.auditEntry,
    backups: backups.filter(Boolean),
    regeneratedPublicArtifacts: artifactReport,
  };
  writeJson(reportJson, report);
  if (apply) {
    appendJsonl(auditLog, [
      {
        version: WORKFLOW_VERSION,
        action: `audit_${action}`,
        id,
        sourceFile: match.filename,
        sourceIndex: match.index,
        actor,
        appliedAt: nowIso,
        before,
        after,
        auditEntryId: result.auditEntry?.id || "",
        artifact: artifactReport
          ? {
              ready: artifactReport.ready,
              manifestReadyCount: artifactReport.manifestReadyCount,
              contentPackageItems: artifactReport.contentPackageItems,
              contentVersion: artifactReport.contentVersion,
            }
          : null,
      },
    ]);
  }
  return report;
}

function parseArgs(argv) {
  const args = {
    apply: argv.includes("--apply"),
    regeneratePackage: !argv.includes("--no-regenerate"),
    writeDated: !argv.includes("--no-dated"),
    json: argv.includes("--json"),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--id") args.id = argv[++index];
    else if (arg === "--action") args.action = argv[++index];
    else if (arg === "--note") args.note = argv[++index];
    else if (arg === "--actor") args.actor = argv[++index];
  }
  return args;
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = resolveQuestionAudit(args);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      [
        `Audit resolution mode: ${report.mode}`,
        `Question: ${report.id}`,
        `Action: ${report.action}`,
        `Found: ${report.found ? "yes" : "no"}`,
        `Before: ${report.before ? JSON.stringify(report.before) : "n/a"}`,
        `After: ${report.after ? JSON.stringify(report.after) : "n/a"}`,
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
  ACTIONS,
  WORKFLOW_VERSION,
  applyAction,
  parseArgs,
  resolveQuestionAudit,
};
