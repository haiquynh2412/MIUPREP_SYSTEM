import assert from "node:assert/strict";
import {
  assertPublicPackageHasNoInternalKeys,
  buildPublicStudentPackage,
  findPublicInternalKeys,
  sanitizePublicQuestion,
} from "./public-content-contract";

const rawQuestion = {
  id: "q1",
  section: "Math",
  domain: "Algebra",
  skill: "Linear equations",
  difficulty: "Medium",
  sourceType: "antigravity",
  sourceName: "Antigravity Vault",
  sourceReference: "internal-only",
  reviewStatus: "reviewed",
  publicationStatus: "public_candidate_reviewed",
  visibility: "public_candidate",
  licenseNote: "admin note",
  questionType: "multiple_choice",
  prompt: "If x + 3 = 7, what is x?",
  choices: { A: "2", B: "3", C: "4", D: "10" },
  correctAnswer: "C",
  explanation: {
    correct: "Subtract 3 from both sides.",
    distractors: { A: "This subtracts too much." },
  },
  contentAudit: { reviewer: "admin" },
};

const sanitized = sanitizePublicQuestion(rawQuestion);

assert.equal(sanitized.id, "q1");
assert.equal(sanitized.prompt, rawQuestion.prompt);
assert.deepEqual(sanitized.choices, rawQuestion.choices);
assert.equal((sanitized as Record<string, unknown>).sourceType, undefined);
assert.equal((sanitized as Record<string, unknown>).reviewStatus, undefined);
assert.equal((sanitized as Record<string, unknown>).visibility, undefined);

const contentPackage = buildPublicStudentPackage([rawQuestion], {
  generatedAt: "2026-05-27T00:00:00.000Z",
  contentVersion: "test-content-version",
  revision: 3,
});

assert.equal(contentPackage.schemaVersion, "sat_content_package_v1");
assert.equal(contentPackage.items.length, 1);
assert.equal(contentPackage.manifest.total, 1);
assert.equal(contentPackage.manifest.counts.section?.Math, 1);
assert.equal(contentPackage.manifest.counts.difficulty?.Medium, 1);
assert.equal((contentPackage.manifest.counts as Record<string, unknown>).sourceType, undefined);
assert.equal((contentPackage.manifest.counts as Record<string, unknown>).reviewStatus, undefined);
assert.deepEqual(findPublicInternalKeys(contentPackage), []);
assert.doesNotThrow(() => assertPublicPackageHasNoInternalKeys(contentPackage));
assert.throws(() => assertPublicPackageHasNoInternalKeys({ items: [{ id: "q", reviewStatus: "reviewed" }] }), /internal fields/);

console.log("public-content-contract.test: pass");
