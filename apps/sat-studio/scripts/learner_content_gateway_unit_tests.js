const assert = require("node:assert/strict");
const gateway = require("../sat_learner_content_gateway.js");

async function run() {
  const state = {
    questions: [
      { id: "old-backend", prompt: "Old", backendContentPackage: true },
      { id: "local-keep", prompt: "Keep this local question" },
    ],
  };
  const response = {
    contentVersion: "content-v1",
    scope: "public",
    package: {
      generatedAt: "2026-05-25T00:00:00.000Z",
      items: [
        {
          id: "public-algebra",
          section: "Math",
          domain: "Algebra",
          skill: "Linear equations",
          difficulty: "Medium",
          reviewStatus: "reviewed",
          visibility: "public_candidate",
          publicationStatus: "public_candidate_reviewed",
          questionType: "multiple_choice",
          prompt: "If x + 4 = 10, what is x?",
          choices: { A: "4", B: "5", C: "6", D: "10" },
          correctAnswer: "C",
          explanation: { correct: "Subtract 4 from both sides." },
        },
      ],
    },
  };
  let touched = 0;
  let saved = 0;
  let hydrated = 0;
  const backendState = {};

  const result = await gateway.loadBackendContentPackage({
    account: { role: "student", scope: "public" },
    token: "token",
    backendAccount: { id: "acct" },
    backendState,
    api: { getContentPackage: async () => response },
    baseUrl: "http://127.0.0.1:8765",
    state,
    normalizeQuestionRecord: (record) => ({ ...record }),
    touchQuestionBank: () => { touched += 1; },
    saveState: () => { saved += 1; },
    hydrateFilters: () => { hydrated += 1; },
    reviewedStudyContentRepository: () => ({ manifest: { total: 1 } }),
    silent: true,
  });

  assert.equal(result.loadedFromBackend, true);
  assert.equal(result.studyQuestionCount, 1);
  assert.deepEqual(state.questions.map((question) => question.id), ["local-keep", "public-algebra"]);
  assert.equal(state.questions[1].backendContentPackage, true);
  assert.equal(state.questions[1].backendContentVersion, "content-v1");
  assert.equal(backendState.lastContentPackageVersion, "content-v1");
  assert.equal(touched, 1);
  assert.equal(hydrated, 1);
  assert.ok(saved >= 1);

  const skipped = await gateway.loadBackendContentPackage({
    account: { role: "parent", scope: "family" },
    token: "token",
    backendAccount: { id: "acct" },
    api: { getContentPackage: async () => assert.fail("parent should not load learner public package") },
  });
  assert.equal(skipped, null);

  let policyCalls = 0;
  let fallbackStatus = null;
  let localLoaderCalls = 0;
  const fallbackResult = await gateway.loadReviewedStudyBank({
    account: { role: "student", scope: "public" },
    token: "token",
    backendAccount: { id: "acct" },
    api: { getContentPackage: async () => { throw new Error("backend down"); } },
    baseUrl: "http://backend",
    state: { questions: [] },
    normalizeQuestionRecord: (record) => ({ ...record }),
    ensureQuestionStudyPolicy: async () => { policyCalls += 1; },
    loaders: [
      async () => { localLoaderCalls += 1; return 3; },
      async () => { localLoaderCalls += 1; throw new Error("source missing"); },
    ],
    reviewedStudyContentRepository: () => ({ manifest: { total: 7, contentVersion: "local-v1" } }),
    visibleQuestionBank: () => [{ id: "visible-1" }],
    isStudyAvailableQuestion: () => true,
    onBackendFallback: (status) => { fallbackStatus = status; },
    silent: true,
  });
  assert.equal(policyCalls, 1);
  assert.equal(localLoaderCalls, 2);
  assert.equal(fallbackStatus.level, "warning");
  assert.equal(fallbackStatus.extra.baseUrl, "http://backend");
  assert.equal(fallbackResult.loadedSources, 1);
  assert.equal(fallbackResult.failedSources, 1);
  assert.equal(fallbackResult.studyQuestionCount, 7);
  assert.equal(fallbackResult.contentVersion, "local-v1");

  const fallback = gateway.fallbackStatus(new Error("down"), "http://backend");
  assert.equal(fallback.level, "warning");
  assert.equal(fallback.extra.baseUrl, "http://backend");
}

run().then(() => {
  console.log("learner_content_gateway_unit_tests: pass");
});
