const assert = require("node:assert/strict");
const dataLoaders = require("../sat_data_loaders.js");

async function run() {
  const questions = [
    {
      id: "opensat-1",
      sourceType: "opensat",
      contentAudit: { version: "opensat-v1", verdict: "reviewed" },
    },
    {
      id: "kaplan-ai-math-1",
      sourceType: "ai_generated",
      sourceSignalId: "kaplan-sat-math-prep",
      reviewStatus: "reviewed",
      contentAudit: { version: "gen-v1", verdict: "pass" },
      skeletonDiversity: { skeletonId: "linear-1" },
    },
    {
      id: "kaplan-ai-math-2",
      sourceType: "ai_generated",
      sourceSignalId: "kaplan-sat-math-prep",
      reviewStatus: "needs_review",
      contentAudit: { version: "gen-v1", verdict: "pass" },
      skeletonDiversity: { skeletonId: "linear-2" },
    },
    {
      id: "archive-ai-1",
      sourceType: "ai_generated",
      sourceSignalId: "archive-signal-alpha",
      reviewStatus: "rejected",
      contentAudit: { version: "gen-v1", verdict: "fail" },
    },
    {
      id: "antigravity-1",
      sourceType: "antigravity",
      publicationStatus: "public_approved",
    },
  ];

  assert.deepEqual(dataLoaders.selectQuestions(questions, { sourceType: "opensat" }).map((q) => q.id), ["opensat-1"]);
  assert.deepEqual(dataLoaders.selectQuestions(questions, { idPrefix: "kaplan-ai-math-" }).map((q) => q.id), [
    "kaplan-ai-math-1",
    "kaplan-ai-math-2",
  ]);
  assert.deepEqual(dataLoaders.selectQuestions(questions, { sourceSignalPrefix: "archive-signal-" }).map((q) => q.id), ["archive-ai-1"]);
  assert.deepEqual(dataLoaders.selectQuestions(questions, { predicate: (q) => q.id.includes("1") }).map((q) => q.id), [
    "opensat-1",
    "kaplan-ai-math-1",
    "archive-ai-1",
    "antigravity-1",
  ]);

  assert.equal(dataLoaders.auditedCount(questions, "gen-v1", "pass"), 2);
  assert.equal(dataLoaders.activeQuestions(questions).length, 4);
  assert.equal(dataLoaders.skeletonAnnotatedCount(dataLoaders.activeQuestions(questions)), 2);

  assert.equal(dataLoaders.shouldReloadOpenSatBank(questions, { minCount: 1, auditVersion: "opensat-v1" }), false);
  assert.equal(dataLoaders.shouldReloadOpenSatBank(questions, { minCount: 2, auditVersion: "opensat-v1" }), true);
  assert.equal(dataLoaders.shouldReloadOpenSatBank(questions, { minCount: 1, minReviewedCount: 1, auditVersion: "opensat-v1" }), true);
  assert.equal(dataLoaders.shouldReloadSimpleBank(questions, { selector: { idPrefix: "kaplan-ai-math-" }, minCount: 2 }), false);
  assert.equal(dataLoaders.shouldReloadSimpleBank(questions, { selector: { idPrefix: "kaplan-ai-math-" }, minCount: 3 }), true);
  assert.equal(
    dataLoaders.shouldReloadAuditedGeneratedBank(questions, {
      selector: { idPrefix: "kaplan-ai-math-" },
      minCount: 2,
      auditVersion: "gen-v1",
    }),
    false,
  );
  assert.equal(
    dataLoaders.shouldReloadAuditedGeneratedBank(questions, {
      selector: { idPrefix: "kaplan-ai-math-" },
      minCount: 2,
      minSettledReviewCount: 2,
      auditVersion: "gen-v1",
    }),
    true,
  );
  assert.equal(
    dataLoaders.shouldReloadAuditedGeneratedBank(
      [
        {
          id: "kaplan-ai-math-3",
          contentAudit: { version: "gen-v1", verdict: "pass" },
          reviewStatus: "reviewed",
        },
      ],
      {
        selector: { idPrefix: "kaplan-ai-math-" },
        minCount: 1,
        auditVersion: "gen-v1",
      },
    ),
    true,
  );
  assert.deepEqual(
    dataLoaders.reviewedUnifiedQuestions(questions, { sourceSignalId: "kaplan-sat-math-prep" }).map((q) => q.id),
    ["kaplan-ai-math-1"],
  );
  assert.equal(
    dataLoaders.shouldReloadReviewedSourceBank(questions, {
      selector: { sourceSignalId: "kaplan-sat-math-prep" },
      minReviewedCount: 1,
    }),
    false,
  );
  assert.equal(
    dataLoaders.shouldReloadReviewedSourceBank(questions, {
      selector: { sourceSignalId: "missing" },
      minReviewedCount: 1,
    }),
    true,
  );

  const kept = dataLoaders.removeBankQuestions(
    questions,
    { predicate: (q) => q.sourceType === "antigravity" || String(q.id || "").startsWith("antigravity-") },
    { keepPublicPromoted: true, isPublicPromoted: (q) => q.publicationStatus === "public_approved" },
  );
  assert.equal(kept.some((q) => q.id === "antigravity-1"), true);

  assert.deepEqual(dataLoaders.extractQuestionRecords([{ id: "a" }]), [{ id: "a" }]);
  assert.deepEqual(dataLoaders.extractQuestionRecords({ questions: [{ id: "b" }] }), [{ id: "b" }]);
  assert.deepEqual(dataLoaders.extractQuestionRecords({ records: [{ id: "ignored" }] }), []);

  const payload = { ok: true };
  const fetched = await dataLoaders.fetchJson(async (url) => {
    assert.equal(url, "data/test.json");
    return { ok: true, json: async () => payload };
  }, "data/test.json", "missing");
  assert.equal(fetched, payload);

  await assert.rejects(
    () => dataLoaders.fetchJson(async () => ({ ok: false, status: 404 }), "missing.json", "bank missing"),
    /bank missing: HTTP 404/,
  );
}

run()
  .then(() => {
    console.log("data_loaders_unit_tests: pass");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
