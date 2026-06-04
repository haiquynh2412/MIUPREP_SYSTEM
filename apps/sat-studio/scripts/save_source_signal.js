const fs = require("node:fs");
const path = require("node:path");

const authoringEngine = require("../sat_authoring_engine.js");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const ARTIFACTS_DIR = path.join(ROOT, "artifacts");
const SOURCE_SIGNALS_JSON = path.join(DATA_DIR, "source-signals.json");
const REPORT_JSON = path.join(DATA_DIR, "source-signal-save-report.json");
const AUDIT_LOG = path.join(DATA_DIR, "source-signal-save-log.jsonl");
const WORKFLOW_VERSION = "source-signal-save-workflow-v1-2026-05-28";

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

function backupFile(filePath, artifactsDir, nowIso) {
  if (!fs.existsSync(filePath)) return "";
  fs.mkdirSync(artifactsDir, { recursive: true });
  const backupName = `${path.basename(filePath).replace(/\.json$/i, "")}.before-source-signal-save-${nowIso.replace(/[:.]/g, "-")}.json`;
  const backupPath = path.join(artifactsDir, backupName);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function inputRowsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.signals)) return payload.signals;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

function sourceSignalsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.signals)) return payload.signals;
  return [];
}

function setSignalsOnPayload(payload, signals) {
  if (Array.isArray(payload)) return signals;
  if (payload && typeof payload === "object" && Array.isArray(payload.signals)) {
    payload.signals = signals;
    return payload;
  }
  return signals;
}

function signalState(signal = {}) {
  return {
    id: signal.id || "",
    sourceKind: signal.sourceKind || "",
    sourceReference: signal.sourceReference || "",
    section: signal.section || "",
    domain: signal.domain || "",
    skill: signal.skill || "",
    difficulty: signal.difficulty || "",
    risk: signal.risk || "",
    visibility: signal.visibility || "",
    protectedTextExcluded: Boolean(signal.protectedTextExcluded),
  };
}

function saveSourceSignals(options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const nowMs = options.nowMs || Date.parse(nowIso) || Date.now();
  const apply = Boolean(options.apply);
  const dataDir = options.dataDir || DATA_DIR;
  const artifactsDir = options.artifactsDir || ARTIFACTS_DIR;
  const inputPath = options.inputPath ? path.resolve(options.inputPath) : "";
  const sourceSignalsPath = options.sourceSignalsPath || path.join(dataDir, path.basename(SOURCE_SIGNALS_JSON));
  const reportJson = options.reportJson || path.join(dataDir, path.basename(REPORT_JSON));
  const auditLog = options.auditLog || path.join(dataDir, path.basename(AUDIT_LOG));
  const actor = options.actor || "content-admin";
  if (!inputPath) throw new Error("Source signal save requires --input <json-file>.");
  const inputRows = inputRowsFromPayload(readJson(inputPath));
  if (!inputRows.length) throw new Error("Source signal input did not contain a signal or signals array.");

  const payload = readJson(sourceSignalsPath, []);
  const currentSignals = sourceSignalsFromPayload(payload);
  const existingIds = new Set(currentSignals.map((signal) => String(signal.id || "")));
  const accepted = [];
  const rejected = [];

  inputRows.forEach((input, index) => {
    const result = authoringEngine.buildSourceSignalDraft(input, {
      isContentAdmin: true,
      canAccessPrivateContent: true,
      accountId: actor,
      nowIso,
      nowMs: nowMs + index,
    });
    if (!result.ok) {
      rejected.push({ index, ok: false, reason: result.reason || "source_signal_invalid" });
      return;
    }
    const signal = {
      ...result.signal,
      workflowVersion: WORKFLOW_VERSION,
      status: "saved_signal",
    };
    if (existingIds.has(signal.id)) {
      rejected.push({ index, id: signal.id, ok: false, reason: "duplicate_signal_id" });
      return;
    }
    existingIds.add(signal.id);
    accepted.push({ index, id: signal.id, ok: true, signal });
  });

  const backups = [];
  if (apply && accepted.length) {
    backups.push(backupFile(sourceSignalsPath, artifactsDir, nowIso));
    const nextSignals = currentSignals.concat(accepted.map((row) => row.signal));
    writeJson(sourceSignalsPath, setSignalsOnPayload(payload, nextSignals));
    appendJsonl(
      auditLog,
      accepted.map((row) => ({
        version: WORKFLOW_VERSION,
        action: "save_source_signal",
        id: row.id,
        actor,
        appliedAt: nowIso,
        state: signalState(row.signal),
      }))
    );
  }

  const report = {
    version: WORKFLOW_VERSION,
    generatedAt: nowIso,
    mode: apply ? "apply" : "dry_run",
    inputPath,
    sourceSignalsPath,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    accepted: accepted.map((row) => ({ index: row.index, id: row.id, ok: true, state: signalState(row.signal) })),
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
    else if (arg === "--actor") args.actor = argv[++index];
  }
  return args;
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = saveSourceSignals(args);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      [
        `Source signal save mode: ${report.mode}`,
        `Accepted: ${report.acceptedCount}`,
        `Rejected: ${report.rejectedCount}`,
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
  SOURCE_SIGNALS_JSON,
  WORKFLOW_VERSION,
  parseArgs,
  saveSourceSignals,
};
