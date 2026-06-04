const assert = require("node:assert/strict");
const importEngine = require("../sat_import_engine.js");

function run() {
  assert.equal(importEngine.fileNameFromPath("SAT/PRACTICE TESTS/Ivy Global/Ivy Global SAT 2016.pdf"), "Ivy Global SAT 2016.pdf");

  const questions = [
    { id: "v1", sourceType: "private_vault", sourceReference: "source-a", reviewStatus: "reviewed", sourceName: "A" },
    { id: "v2", sourceType: "private_vault", sourceReference: "source-a", reviewStatus: "needs_review", sourceName: "A" },
    { id: "v3", sourceType: "private_vault", sourceReference: "source-b", reviewStatus: "rejected", sourceName: "B" },
    { id: "a1", sourceType: "ai_generated", sourceReference: "source-a", reviewStatus: "reviewed" },
  ];
  assert.equal(importEngine.vaultQuestionsForSourceReference("source-a", questions).length, 2);

  const importOptions = importEngine.buildBankImportOptions({
    fileName: "upload.json",
    forcePrivateVault: true,
    activeVaultSourceName: "Private Source",
    activeVaultSourceReference: "source-a",
  });
  assert.deepEqual(importOptions, {
    defaultSourceName: "Private Source",
    defaultSourceReference: "source-a",
    forcePrivateVault: true,
  });

  const publicOptions = importEngine.buildBankImportOptions({ fileName: "upload.json" });
  assert.deepEqual(publicOptions, {
    defaultSourceName: "upload.json",
    defaultSourceReference: "",
    forcePrivateVault: false,
  });

  const intake = importEngine.buildVaultIntakeState({ path: "SAT/Test <One>.pdf" });
  assert.equal(intake.sourceReference, "SAT/Test <One>.pdf");
  assert.equal(intake.sourceName, "Test <One>.pdf");

  const hiddenSummary = importEngine.buildVaultSummary([], { canAccessPrivateContent: false });
  assert.equal(hiddenSummary.hidden, true);
  assert.equal(hiddenSummary.startDisabled, true);

  const summary = importEngine.buildVaultSummary(questions.filter((question) => question.sourceType === "private_vault"), {
    canAccessPrivateContent: true,
    activeVaultSourceReference: "source-a",
  });
  assert.equal(summary.total, 3);
  assert.equal(summary.reviewed, 1);
  assert.equal(summary.needsReview, 1);
  assert.equal(summary.sources, 2);
  assert.equal(summary.startDisabled, false);

  const pending = importEngine.buildPdfInspectPending({ name: "Practice.pdf", size: 2 * 1024 * 1024 });
  assert.equal(pending.fileName, "Practice.pdf");
  assert.equal(pending.sizeMb, "2.00");

  const error = importEngine.buildPdfInspectError({ name: "Practice.pdf", size: 1024 }, new Error("server down"));
  assert.equal(error.className, "pdf-workflow warning");
  assert.equal(error.message, "server down");

  const inspection = importEngine.buildPdfInspectionModel({
    filename: "Official.pdf",
    title: "Official Test",
    sizeBytes: 1048576,
    pageCount: 32,
    extractablePagesSampled: 4,
    risk: "High",
    recommendation: "metadata_only",
    warnings: ["Official source"],
  });
  assert.equal(inspection.className, "pdf-workflow warning");
  assert.equal(inspection.metadataOnly, true);
  assert.equal(inspection.sizeMb, "1.00");
  assert.equal(inspection.recommendation, "Metadata-only log recommended. Do not import question text.");

  const log = importEngine.buildOfficialPdfLog(
    { title: "Official Test", filename: "official.pdf", pageCount: 32, risk: "High" },
    { nowMs: 1779046800000, nowIso: "2026-05-18T00:00:00.000Z" },
  );
  assert.equal(log.id, "official-pdf-1779046800000");
  assert.equal(log.reference, "Official Test (32 pages)");
  assert.ok(log.note.includes("No prompt, passage, answer choice, or explanation text was imported."));
}

run();
console.log("import_engine_unit_tests: pass");
