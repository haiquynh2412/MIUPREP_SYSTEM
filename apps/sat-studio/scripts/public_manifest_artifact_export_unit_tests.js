const assert = require("node:assert/strict");
const exporter = require("./export_public_manifest_artifact.js");

function run() {
  const nested = exporter.normalizeRawQuestion(
    {
      _satStudioSourceSection: "math",
      question: {
        paragraph: "If x + 2 = 5,",
        question: "what is x?",
        choices: { A: "1", B: "2", C: "3", D: "5" },
        correct_answer: "C",
        explanation: "Subtract 2 from both sides.",
      },
    },
    "opensat-pinesat.json",
    0
  );
  assert.equal(nested.prompt, "If x + 2 = 5,\n\nwhat is x?");
  assert.equal(nested.section, "Math");
  assert.equal(nested.correctAnswer, "C");
  assert.equal(nested.sourceType, "opensat");

  const publicQuestion = {
    id: "public-hard-math",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Medium",
    sourceType: "ai_generated",
    sourceName: "SAT Studio Original",
    reviewStatus: "reviewed",
    publicationStatus: "public_candidate_reviewed",
    visibility: "public_candidate",
    promotedBy: "admin",
    promotedAt: "2026-05-26T00:00:00.000Z",
    prompt: "If x + 2 = 5, what is x?",
    choices: { A: "1", B: "2", C: "3", D: "5" },
    correctAnswer: "C",
    explanation: "Subtract 2 from both sides.",
    sourceReference: "internal-only",
  };
  const privateQuestion = {
    ...publicQuestion,
    id: "private-copy",
    visibility: "private_family",
    publicationStatus: "private_family_only",
  };
  const artifacts = exporter.buildReleaseArtifacts([publicQuestion, privateQuestion], {
    nowIso: "2026-05-26T00:00:00.000Z",
    integrity: { summary: { totalQuestions: 2, criticalQuestionCount: 0 } },
  });
  assert.equal(artifacts.summary.ready, true);
  assert.equal(artifacts.summary.manifestReadyCount, 1);
  assert.equal(artifacts.summary.contentPackageItems, 1);
  assert.equal(artifacts.manifestArtifact.publicContentIncluded, false);
  assert.ok(artifacts.manifestArtifact.stableContentChecksum.startsWith("fnv1a32:"));
  assert.equal(artifacts.contentPackage.items[0].id, "public-hard-math");
  assert.equal(artifacts.contentPackage.items[0].sourceReference, undefined);

  const blocked = exporter.buildReleaseArtifacts([{ ...publicQuestion, id: "bad", reviewStatus: "needs_review" }], {
    nowIso: "2026-05-26T00:00:00.000Z",
    integrity: { summary: { totalQuestions: 1, criticalQuestionCount: 0 } },
  });
  assert.equal(blocked.summary.ready, false);
  assert.equal(blocked.summary.contentPackageItems, 0);
  assert.equal(blocked.summary.blockedPublicCandidateCount, 1);
}

run();
console.log("public_manifest_artifact_export_unit_tests: pass");
