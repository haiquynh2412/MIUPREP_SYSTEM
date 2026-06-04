const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const workflow = require("./save_source_signal.js");

function signalInput(overrides = {}) {
  return {
    id: "sig-new",
    sourceKind: "commercial_prep",
    sourceReference: "Metadata-only reference to a prep book chapter.",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Hard",
    mistakePattern: "Student confuses coefficient isolation with moving constants.",
    learningGoal: "Generate original SAT-style linear-equation transfer items.",
    protectedTextExcluded: true,
    ...overrides,
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run() {
  assert.throws(() => workflow.saveSourceSignals({}), /requires --input/);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sat-source-signal-"));
  const dataDir = path.join(tempRoot, "data");
  const artifactsDir = path.join(tempRoot, "artifacts");
  const inputPath = path.join(tempRoot, "signals.json");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "source-signals.json"),
    `${JSON.stringify([{ id: "sig-existing", sourceKind: "free", protectedTextExcluded: true }], null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    inputPath,
    `${JSON.stringify([
      signalInput(),
      signalInput({ id: "sig-missing-proof", protectedTextExcluded: false }),
      signalInput({ id: "sig-existing" }),
    ], null, 2)}\n`,
    "utf8"
  );

  const dryRun = workflow.saveSourceSignals({
    inputPath,
    dataDir,
    artifactsDir,
    nowIso: "2026-05-28T05:00:00.000Z",
    nowMs: 1779944400000,
  });
  assert.equal(dryRun.mode, "dry_run");
  assert.equal(dryRun.acceptedCount, 1);
  assert.equal(dryRun.rejectedCount, 2);
  assert.equal(readJson(path.join(dataDir, "source-signals.json")).length, 1);

  const applied = workflow.saveSourceSignals({
    apply: true,
    inputPath,
    dataDir,
    artifactsDir,
    nowIso: "2026-05-28T05:00:00.000Z",
    nowMs: 1779944400000,
  });
  const rows = readJson(path.join(dataDir, "source-signals.json"));
  assert.equal(applied.acceptedCount, 1);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].id, "sig-new");
  assert.equal(rows[1].risk, "high");
  assert.equal(rows[1].visibility, "private_family");
  assert.equal(rows[1].protectedTextExcluded, true);
  assert.ok(fs.readdirSync(artifactsDir).some((name) => name.includes("before-source-signal-save")));
  assert.ok(fs.readFileSync(path.join(dataDir, "source-signal-save-log.jsonl"), "utf8").includes("sig-new"));
}

run();
console.log("source_signal_save_workflow_unit_tests: pass");
