const assert = require("node:assert/strict");
const queryEngine = require("../sat_question_query_engine.js");

const questions = [
  {
    id: "rw-1",
    section: "Reading and Writing",
    domain: "Information and Ideas",
    skill: "Central Ideas and Details",
    difficulty: "Medium",
    sourceType: "ai_generated",
    reviewStatus: "reviewed",
    visibility: "public_candidate",
  },
  {
    id: "rw-2",
    section: "Reading and Writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    difficulty: "Hard",
    sourceType: "private_vault",
    reviewStatus: "needs_review",
    visibility: "private_family",
  },
  {
    id: "math-1",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Easy",
    sourceType: "sat_1590",
    reviewStatus: "reviewed",
    practicePool: "hidden_duplicate",
    visibility: "public_candidate",
  },
  {
    id: "math-fail",
    section: "Math",
    domain: "Advanced Math",
    skill: "Quadratics",
    difficulty: "Hard",
    sourceType: "ai_generated",
    reviewStatus: "reviewed",
    contentAudit: { verdict: "fail" },
    visibility: "private_family",
  },
];

function run() {
  const publicVisible = queryEngine.visibleQuestionBank(questions, { scope: "public" }, {
    isQuestionVisible: (question, account) => question.visibility !== "private_family" || account.scope !== "public",
  });
  assert.deepEqual(publicVisible.map((question) => question.id), ["rw-1", "math-1"]);

  const filtered = queryEngine.filterQuestions(questions, {
    section: "Reading and Writing",
    sourceType: "ai_generated",
    reviewStatus: "reviewed",
  });
  assert.deepEqual(filtered.map((question) => question.id), ["rw-1"]);

  const idFiltered = queryEngine.filterQuestions(questions, { idSet: new Set(["rw-2", "math-1"]) }, {
    predicate: (question) => question.reviewStatus !== "needs_review",
  });
  assert.deepEqual(idFiltered.map((question) => question.id), ["math-1"]);

  const cards = queryEngine.buildTopicCards(questions, { section: "Reading and Writing" });
  assert.equal(cards.length, 2);
  assert.equal(cards[0].count, 1);

  const stats = queryEngine.sourceLedgerStats(questions, ["ai_generated", "private_vault", "sat_1590"]);
  assert.equal(stats.ai_generated.count, 2);
  assert.equal(stats.private_vault.count, 1);
  assert.equal(stats.sat_1590.hiddenSkeleton, 1);

  const manifest = queryEngine.buildQuestionBankManifest(questions, { revision: 7, scope: "study", generatedAt: "2026-05-22T00:00:00Z" });
  assert.equal(manifest.contractVersion, "question_bank_contract_v1");
  assert.equal(manifest.revision, 7);
  assert.ok(manifest.contentVersion);
  assert.equal(manifest.counts.section.Math, 2);
  assert.equal(manifest.defaults.maxLimit, 200);

  const reviewedPackage = queryEngine.buildVersionedContentPackage(queryEngine.reviewedStudyQuestions(questions), { includeContent: false });
  assert.equal(reviewedPackage.schemaVersion, "sat_content_package_v1");
  assert.deepEqual(reviewedPackage.items.map((question) => question.id), ["rw-1"]);
  assert.equal(reviewedPackage.items[0].prompt, undefined);

  const reviewedQuery = queryEngine.queryReviewedStudyContent(questions, { section: "Reading and Writing" });
  assert.deepEqual(reviewedQuery.items.map((question) => question.id), ["rw-1"]);

  const defaultStudyQuery = queryEngine.queryQuestionBank(questions, { scope: "study", includeContent: false });
  assert.deepEqual(defaultStudyQuery.items.map((question) => question.id), ["rw-1"]);

  const toolTagged = [
    ...questions,
    {
      id: "math-desmos",
      section: "Math",
      domain: "Advanced Math",
      skill: "Quadratics",
      difficulty: "Hard",
      reviewStatus: "reviewed",
      visibility: "public_candidate",
      tags: ["desmos_recommended", "calculator_allowed"],
    },
    {
      id: "math-stale-metadata",
      section: "Math",
      domain: "Advanced Math",
      skill: "Quadratics",
      difficulty: "Hard",
      reviewStatus: "reviewed",
      metadata: { reviewStatus: "needs_review" },
      visibility: "private_family",
      tags: ["desmos_recommended"],
    },
  ];
  const repo = queryEngine.createReviewedContentRepository(toolTagged, {
    predicate: (question) => question.practicePool !== "hidden_duplicate",
    revision: 11,
  });
  assert.equal(repo.version, "reviewed-content-repository-v1");
  assert.equal(repo.manifest.revision, 11);
  assert.equal(repo.manifest.counts.calculator.calculator_allowed, 1);
  assert.equal(repo.manifest.counts.desmos.desmos_recommended, 1);
  assert.deepEqual(repo.query({ desmos: "desmos_recommended" }).items.map((question) => question.id), ["math-desmos"]);
  assert.equal(repo.package({ includeContent: false }).items.find((question) => question.id === "math-desmos").calculator, "calculator_allowed");

  const normalized = queryEngine.normalizeQuestionQuery({ section: "Math", limit: 999, offset: -5, scope: "bad" });
  assert.equal(normalized.scope, "study");
  assert.equal(normalized.criteria.section, "Math");
  assert.equal(normalized.limit, 200);
  assert.equal(normalized.offset, 0);

  questions[0].publicationStatus = "public_candidate_reviewed";
  const publicQuery = queryEngine.queryQuestionBank(questions, { scope: "public", includeContent: false });
  assert.deepEqual(publicQuery.items.map((question) => question.id), ["rw-1"]);
  assert.equal(publicQuery.items[0].prompt, undefined);
  assert.equal(publicQuery.items[0].practicePool, "core_pool");

  const remediationQuery = queryEngine.queryQuestionBank(
    [
      ...questions,
      { id: "remedial-1", section: "Math", domain: "Algebra", skill: "Systems", difficulty: "Hard", reviewStatus: "reviewed", practicePool: "remedial_pool" },
    ],
    { scope: "remediation" },
  );
  assert.deepEqual(remediationQuery.items.map((question) => question.id), ["remedial-1"]);

  const adminQuery = queryEngine.queryQuestionBank(questions, { scope: "admin", limit: 2 }, { includeContent: true });
  assert.equal(adminQuery.items.length, 2);
  assert.equal(adminQuery.items[0].visibility !== undefined, true);

  assert.deepEqual(queryEngine.uniqueValues(questions, "section"), ["Math", "Reading and Writing"]);
  assert.equal(queryEngine.countBy(questions, "difficulty").Hard, 2);
}

run();
console.log("question_query_engine_unit_tests: pass");
