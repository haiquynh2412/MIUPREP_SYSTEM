const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const workflow = require("./resolve_question_audit.js");

function baseQuestion(overrides = {}) {
  return {
    id: "q",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Medium",
    sourceType: "foundation",
    sourceName: "SAT Studio Foundation",
    licenseNote: "SAT Studio original item generated for internal SAT blueprint training; no third-party prompt, choices, data, or explanation copied.",
    sourceUsagePolicy: "provenance_only_unified_pool",
    reviewStatus: "reviewed",
    publicationStatus: "public_candidate_reviewed",
    visibility: "public_candidate",
    questionType: "multiple_choice",
    prompt: "If x + 2 = 5, what is x?",
    choices: { A: "1", B: "2", C: "3", D: "5" },
    correctAnswer: "C",
    explanation: { correct: "Subtract 2 from both sides.", distractors: { A: "Too low.", B: "Too low.", D: "Uses the right side." } },
    contentAudit: { verdict: "pass" },
    publicReviewNote: "Original SAT Studio training item; no source exercise text copied.",
    ...overrides,
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run() {
  assert.throws(() => workflow.resolveQuestionAudit({ action: "pass" }), /requires --id/);
  assert.throws(() => workflow.resolveQuestionAudit({ id: "x", action: "delete" }), /pass, block, or reject/);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sat-audit-resolution-"));
  const dataDir = path.join(tempRoot, "data");
  const artifactsDir = path.join(tempRoot, "artifacts");
  const bankFile = "sat-studio-foundation-bank.json";
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, bankFile),
    `${JSON.stringify([
      baseQuestion({ id: "audit-pass", reviewStatus: "needs_review", visibility: "private_family", publicationStatus: "audit_issue_open", auditStatus: "open" }),
      baseQuestion({ id: "audit-block" }),
      baseQuestion({ id: "audit-reject" }),
    ], null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(dataDir, "question-audits.json"),
    `${JSON.stringify({
      "audit-pass": [
        {
          id: "audit-open",
          questionId: "audit-pass",
          issueType: "wrong_answer",
          severity: "high",
          status: "open",
          reportedAt: "2026-05-28T00:00:00.000Z",
        },
      ],
    }, null, 2)}\n`,
    "utf8"
  );

  const dryRun = workflow.resolveQuestionAudit({
    id: "audit-pass",
    action: "pass",
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    nowIso: "2026-05-28T01:00:00.000Z",
  });
  assert.equal(dryRun.mode, "dry_run");
  assert.equal(readJson(path.join(dataDir, bankFile))[0].auditStatus, "open");

  const passReport = workflow.resolveQuestionAudit({
    apply: true,
    id: "audit-pass",
    action: "pass",
    note: "Verified answer and explanation.",
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    nowIso: "2026-05-28T01:00:00.000Z",
    writeDated: false,
  });
  let rows = readJson(path.join(dataDir, bankFile));
  let audits = readJson(path.join(dataDir, "question-audits.json"));
  assert.equal(passReport.after.auditStatus, "passed");
  assert.equal(rows[0].reviewStatus, "reviewed");
  assert.equal(rows[0].publicationStatus, "private_audit_passed");
  assert.equal(audits["audit-pass"][0].status, "resolved");

  const blockReport = workflow.resolveQuestionAudit({
    apply: true,
    id: "audit-block",
    action: "block",
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    nowIso: "2026-05-28T02:00:00.000Z",
    writeDated: false,
  });
  rows = readJson(path.join(dataDir, bankFile));
  audits = readJson(path.join(dataDir, "question-audits.json"));
  assert.equal(blockReport.after.publicationStatus, "audit_blocked");
  assert.equal(rows[1].visibility, "private_family");
  assert.equal(audits["audit-block"][0].issueType, "admin_block");

  const rejectReport = workflow.resolveQuestionAudit({
    apply: true,
    id: "audit-reject",
    action: "reject",
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    nowIso: "2026-05-28T03:00:00.000Z",
    writeDated: false,
  });
  rows = readJson(path.join(dataDir, bankFile));
  assert.equal(rejectReport.after.reviewStatus, "rejected");
  assert.equal(rows[2].publicationStatus, "rejected_audit");
  assert.ok(fs.readdirSync(artifactsDir).some((name) => name.includes("before-audit-resolution")));
  assert.ok(fs.readFileSync(path.join(dataDir, "question-audit-resolution-log.jsonl"), "utf8").includes("audit_reject"));
  assert.equal(readJson(path.join(artifactsDir, "sat-studio-public-content-package-latest.json")).items.length, 0);
}

run();
console.log("audit_resolution_workflow_unit_tests: pass");
