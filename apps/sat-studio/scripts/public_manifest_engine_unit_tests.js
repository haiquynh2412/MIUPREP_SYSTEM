const assert = require("node:assert/strict");
const manifestEngine = require("../sat_public_manifest_engine.js");

const completePublicQuestion = {
  id: "q-public",
  section: "Math",
  domain: "Algebra",
  skill: "Linear equations",
  difficulty: "Medium",
  sourceType: "foundation",
  sourceName: "SAT Studio Foundation Bank",
  visibility: "public_candidate",
  reviewStatus: "reviewed",
  publicationStatus: "public_candidate_reviewed",
  choices: { A: "1", B: "2", C: "3", D: "4" },
  correctAnswer: "B",
  explanation: { correct: "Choice B is correct because x = 2." },
  licenseNote: "Original SAT Studio item; no source exercise text copied.",
  strict1600Review: { version: "strict-v1", status: "reviewed" },
  contentAudit: { version: "audit-v1", verdict: "pass" },
};

function run() {
  assert.equal(manifestEngine.isPublicSafeQuestion(completePublicQuestion), true);
  assert.equal(manifestEngine.sourceSignature(completePublicQuestion).signed, true);

  const privateVault = {
    ...completePublicQuestion,
    id: "q-vault",
    sourceType: "private_vault",
  };
  assert.equal(manifestEngine.isPublicSafeQuestion(privateVault), false);
  assert.ok(manifestEngine.publicSafetyReasons(privateVault).includes("blocked_source_type:private_vault"));

  const unsigned = {
    ...completePublicQuestion,
    id: "q-unsigned",
    licenseNote: "",
    strict1600Review: {},
    contentAudit: {},
  };
  assert.equal(manifestEngine.isPublicSafeQuestion(unsigned), true);
  assert.equal(manifestEngine.sourceSignature(unsigned).signed, false);

  const rejectedPublic = {
    ...completePublicQuestion,
    id: "q-rejected",
    reviewStatus: "rejected",
    publicationStatus: "rejected_template_easy",
  };

  const cleanManifest = manifestEngine.buildPublicManifest([completePublicQuestion], {
    integrityLoaded: true,
    criticalCount: 0,
    openAuditEntries: 0,
    nowIso: "2026-05-20T00:00:00.000Z",
  });
  assert.equal(cleanManifest.manifestReadyCount, 1);
  assert.equal(cleanManifest.publicCandidateCount, 1);
  assert.equal(cleanManifest.sourceUnsignedCount, 0);
  assert.equal(cleanManifest.blockedPublicCandidateCount, 0);
  assert.equal(cleanManifest.releaseGate.ready, true);
  assert.equal(cleanManifest.releaseGate.label, "Public release ready");
  assert.equal(cleanManifest.manifestRows[0].id, "q-public");
  assert.equal(cleanManifest.manifestRows[0].sourceSignature.signed, true);
  const artifact = manifestEngine.buildPublicManifestArtifact([completePublicQuestion], {
    manifest: cleanManifest,
    exportedAt: "2026-05-20T00:00:00.000Z",
  });
  assert.equal(artifact.schemaVersion, "sat-public-manifest-artifact-v1");
  assert.equal(artifact.publicContentIncluded, false);
  assert.equal(artifact.exportStatus, "ready");
  assert.equal(artifact.counts.manifestReady, 1);
  assert.equal(artifact.manifestRows[0].manifestIndex, 1);
  assert.ok(artifact.stableContentChecksum.startsWith("fnv1a32:"));
  assert.ok(artifact.stableAuditChecksum.startsWith("fnv1a32:"));

  const blockedManifest = manifestEngine.buildPublicManifest([completePublicQuestion, rejectedPublic, unsigned], {
    integrityLoaded: true,
    criticalCount: 0,
    openAuditEntries: 1,
    nowIso: "2026-05-20T00:00:00.000Z",
  });
  assert.equal(blockedManifest.publicCandidateCount, 3);
  assert.equal(blockedManifest.publicSafeCount, 2);
  assert.equal(blockedManifest.manifestReadyCount, 1);
  assert.equal(blockedManifest.sourceUnsignedCount, 1);
  assert.equal(blockedManifest.blockedPublicCandidateCount, 1);
  assert.equal(blockedManifest.releaseGate.ready, false);
  assert.ok(blockedManifest.releaseGate.blockers.some((item) => item.id === "open_audits_clear"));
  assert.ok(blockedManifest.releaseGate.blockers.some((item) => item.id === "public_candidates_clean"));
  assert.ok(blockedManifest.releaseGate.blockers.some((item) => item.id === "source_signatures_clear"));
}

run();
console.log("public_manifest_engine_unit_tests: pass");
