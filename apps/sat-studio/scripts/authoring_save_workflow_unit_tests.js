const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const workflow = require("./save_authored_question.js");

function baseQuestion(overrides = {}) {
  return {
    id: "existing-q",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Medium",
    sourceType: "sat_studio_original",
    sourceName: "SAT Studio Authored Draft",
    reviewStatus: "reviewed",
    visibility: "private_family",
    publicationStatus: "private_intake_passed",
    questionType: "multiple_choice",
    prompt: "If x + 2 = 5, what is x?",
    choices: { A: "1", B: "2", C: "3", D: "5" },
    correctAnswer: "C",
    explanation: "Subtract 2 from both sides to get x = 3.",
    ...overrides,
  };
}

function authoredInput(overrides = {}) {
  return {
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Easy",
    prompt: "If y + 4 = 9, what is y?",
    choices: { A: "3", B: "4", C: "5", D: "6" },
    correctAnswer: "C",
    explanation: "Subtract 4 from both sides to get y = 5.",
    ...overrides,
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run() {
  assert.throws(() => workflow.saveAuthoredQuestions({}), /requires --input/);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sat-authoring-save-"));
  const dataDir = path.join(tempRoot, "data");
  const artifactsDir = path.join(tempRoot, "artifacts");
  const inputPath = path.join(tempRoot, "drafts.json");
  const bankFile = "sat-studio-foundation-bank.json";
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, bankFile), `${JSON.stringify([baseQuestion()], null, 2)}\n`, "utf8");
  fs.writeFileSync(
    inputPath,
    `${JSON.stringify([
      authoredInput({ id: "new-good" }),
      authoredInput({ id: "bad-answer", correctAnswer: "Z" }),
      authoredInput({ id: "existing-q" }),
      authoredInput({ id: "dup-prompt", prompt: "If x + 2 = 5, what is x?" }),
    ], null, 2)}\n`,
    "utf8"
  );

  const dryRun = workflow.saveAuthoredQuestions({
    inputPath,
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    targetBank: bankFile,
    nowIso: "2026-05-28T04:00:00.000Z",
  });
  assert.equal(dryRun.mode, "dry_run");
  assert.equal(dryRun.acceptedCount, 1);
  assert.equal(dryRun.rejectedCount, 3);
  assert.equal(readJson(path.join(dataDir, bankFile)).length, 1);

  const applied = workflow.saveAuthoredQuestions({
    apply: true,
    inputPath,
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    targetBank: bankFile,
    nowIso: "2026-05-28T04:00:00.000Z",
  });
  const rows = readJson(path.join(dataDir, bankFile));
  assert.equal(applied.acceptedCount, 1);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].id, "new-good");
  assert.equal(rows[1].reviewStatus, "needs_review");
  assert.equal(rows[1].visibility, "private_family");
  assert.equal(rows[1].publicationStatus, "draft_needs_review");
  assert.equal(rows[1].contentAudit.verdict, "needs_review");
  assert.equal(rows[1].authoringIntake.status, "ready_for_review");
  assert.ok(fs.readdirSync(artifactsDir).some((name) => name.includes("before-authoring-save")));
  assert.ok(fs.readFileSync(path.join(dataDir, "authoring-import-save-log.jsonl"), "utf8").includes("new-good"));
}

run();
console.log("authoring_save_workflow_unit_tests: pass");
