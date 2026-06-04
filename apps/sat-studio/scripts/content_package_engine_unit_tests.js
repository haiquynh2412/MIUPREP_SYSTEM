const assert = require("node:assert/strict");
const engine = require("../sat_content_package_engine.js");

function run() {
  const questions = [
    {
      id: "q-public",
      section: "Math",
      domain: "Advanced Math",
      skill: "Nonlinear equations",
      difficulty: "Hard",
      sourceType: "ai_generated",
      sourceName: "SAT Studio",
      sourceReference: "internal-admin-only-reference",
      reviewStatus: "reviewed",
      publicationStatus: "public_candidate_reviewed",
      visibility: "public_candidate",
      questionType: "multiple_choice",
      prompt: "If x^2 = 9, what is a possible value of x?",
      choices: { A: "2", B: "3", C: "4", D: "9" },
      correctAnswer: "B",
      explanation: { correct: "3 squared is 9.", traps: { D: "This is x^2, not x." } },
      contentAudit: { reviewer: "admin" },
    },
    {
      id: "q-private",
      section: "Math",
      domain: "Algebra",
      skill: "Linear equations",
      reviewStatus: "reviewed",
      publicationStatus: "private_family_only",
      visibility: "private_family",
      prompt: "Private prompt",
    },
  ];

  const contentPackage = engine.buildPublicContentPackage(questions, {
    generatedAt: "2026-05-25T00:00:00.000Z",
    manifest: { manifestRows: [{ id: "q-public" }] },
    revision: 12,
  });
  assert.equal(contentPackage.schemaVersion, "sat_content_package_v1");
  assert.equal(contentPackage.contractVersion, "sat_public_student_contract_v1");
  assert.equal(contentPackage.items.length, 1);
  assert.equal(contentPackage.items[0].id, "q-public");
  assert.equal(contentPackage.items[0].visibility, undefined);
  assert.equal(contentPackage.items[0].reviewStatus, undefined);
  assert.equal(contentPackage.items[0].sourceType, undefined);
  assert.equal(contentPackage.items[0].sourceName, undefined);
  assert.equal(contentPackage.manifest.counts.sourceType, undefined);
  assert.equal(contentPackage.manifest.counts.reviewStatus, undefined);
  assert.equal(contentPackage.items[0].sourceReference, undefined);
  assert.equal(contentPackage.items[0].contentAudit, undefined);
  assert.equal(contentPackage.items[0].prompt.includes("x^2"), true);

  const importable = engine.importablePackageItems({ package: contentPackage, contentVersion: contentPackage.contentVersion });
  assert.equal(importable.length, 1);
  assert.equal(importable[0].publicationStatus, "public_candidate_backend_package");
  assert.equal(importable[0].sourceName, "Public Backend Content Package");
  assert.equal(importable[0].sourceType, "public_content_package");

  assert.equal(engine.canUseBackendPackage({ account: { role: "student", scope: "public" }, token: "t", backendAccount: { id: "acct" }, api: { getContentPackage() {} } }), true);
  assert.equal(engine.canUseBackendPackage({ account: { role: "student", scope: "family" }, token: "t", backendAccount: { id: "acct" }, api: { getContentPackage() {} } }), false);
  const prepared = engine.prepareImportedQuestions(importable, {
    contentVersion: "content-v1",
    normalizeQuestionRecord: (record) => ({ ...record, publicationStatus: "" }),
  });
  assert.equal(prepared[0].backendContentPackage, true);
  assert.equal(prepared[0].publicationStatus, "public_candidate_backend_package");
  assert.equal(engine.backendStatusPatch({ contentVersion: "v1", package: contentPackage }, "test").lastContentPackageCount, 1);

  const empty = engine.importablePackageItems({ package: { items: [{ id: "metadata-only" }] } });
  assert.equal(empty.length, 0);
}

run();
console.log("content_package_engine_unit_tests: pass");
