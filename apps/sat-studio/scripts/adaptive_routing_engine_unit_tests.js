const assert = require("node:assert/strict");
const adaptive = require("../sat_adaptive_routing_engine.js");

function run() {
  const lowEvidenceRoute = adaptive.routeForModule(
    { label: "Math Module 1", section: "Math", correct: 2, total: 2, route: "standard" },
    { section: "Math", adaptiveFromPreviousSection: true },
  );
  assert.equal(lowEvidenceRoute, "standard");

  const strongRoute = adaptive.routeForModule(
    { label: "Math Module 1", section: "Math", correct: 9, total: 10, route: "standard" },
    { section: "Math", adaptiveFromPreviousSection: true },
  );
  assert.equal(strongRoute, "hard");

  const timedOutRoute = adaptive.routeForModule(
    { label: "RW Module 1", section: "Reading and Writing", correct: 5, total: 10, route: "standard", timedOut: true },
    { section: "Reading and Writing", adaptiveFromPreviousSection: true },
  );
  assert.equal(timedOutRoute, "easy");

  const profile = adaptive.buildAdaptiveRoutingProfile(
    {
      total: 20,
      correct: 12,
      timeLimitSeconds: 1500,
      bySection: {
        Math: { label: "Math", section: "Math", total: 10, correct: 7, weightedTotal: 13.5, weightedCorrect: 9.5, difficultyCounts: { Easy: 3, Medium: 5, Hard: 2 } },
        "Reading and Writing": {
          label: "Reading and Writing",
          section: "Reading and Writing",
          total: 10,
          correct: 5,
          weightedTotal: 13.5,
          weightedCorrect: 6,
          difficultyCounts: { Easy: 3, Medium: 5, Hard: 2 },
        },
      },
      byDomain: {
        Algebra: { label: "Algebra", section: "Math", domain: "Algebra", total: 5, correct: 2, weightedTotal: 6.75, weightedCorrect: 2.7, difficultyCounts: { Easy: 1, Medium: 3, Hard: 1 } },
      },
      bySkill: {
        Linear: { label: "Linear equations", section: "Math", domain: "Algebra", total: 5, correct: 2, weightedTotal: 6.75, weightedCorrect: 2.7, difficultyCounts: { Easy: 1, Medium: 3, Hard: 1 } },
      },
      moduleResults: [{ label: "Math Module 1", section: "Math", correct: 7, total: 10, route: "standard" }],
      reviewItems: [],
    },
    { targetScore: 1500, nowIso: "2026-05-24T00:00:00.000Z" },
  );
  assert.equal(profile.version, "adaptive-routing-2026-05-24");
  assert.equal(profile.scoreSignals.length, 2);
  assert.equal(profile.prioritySkills[0].label, "Linear equations");
  assert.equal(profile.nextActions[0].target.skill, "Linear equations");
  assert.match(profile.scoreDisclosure, /not an official SAT score/i);

  const plan = adaptive.buildQuestionRecommendationPlan({
    routingProfile: profile,
    profile: {
      attempts: [{ questionId: "done-1" }],
      pretests: [{ answers: [{ questionId: "done-2" }] }],
    },
    questions: [
      { id: "done-1", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Medium", reviewStatus: "reviewed" },
      { id: "done-2", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Medium", reviewStatus: "reviewed" },
      { id: "draft-1", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Medium", reviewStatus: "needs_review" },
      { id: "hidden-1", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Medium", reviewStatus: "reviewed", practicePool: "hidden_duplicate" },
      { id: "use-1", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Easy", reviewStatus: "reviewed" },
      { id: "use-2", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Medium", reviewStatus: "reviewed" },
      { id: "use-3", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Hard", reviewStatus: "reviewed", tags: ["calculator_allowed"] },
      { id: "use-desmos", section: "Math", domain: "Advanced Math", skill: "Quadratics", difficulty: "Hard", reviewStatus: "reviewed", tags: ["desmos_recommended"] },
    ],
    limit: 5,
  });
  const recommendedIds = plan.buckets.flatMap((bucket) => bucket.questions.map((question) => question.id));
  assert.deepEqual(recommendedIds.sort(), ["use-1", "use-2", "use-3", "use-desmos"]);
  assert.equal(plan.version, "question-recommendation-plan-2026-05-25");
  assert.equal(plan.crucibleMode, true);
  assert.ok(plan.buckets.every((bucket) => bucket.id.startsWith("crucible-")));
  assert.ok(plan.buckets[0].questions.every((question) => question.difficulty === "Hard"));
  assert.equal(plan.excludesAttempted, true);
  assert.equal(plan.excludesUnreviewed, true);
  assert.equal(plan.buckets.reduce((sum, bucket) => sum + bucket.toolMix.calculator, 0) >= 1, true);
  assert.equal(plan.buckets.reduce((sum, bucket) => sum + bucket.toolMix.desmos, 0) >= 1, true);

  const crucibleBank = [
    ...Array.from({ length: 6 }, (_, index) => ({ id: `lin-hard-${index}`, section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Hard", reviewStatus: "reviewed", skeletonId: `lin-${index}` })),
    ...Array.from({ length: 4 }, (_, index) => ({ id: `adv-hard-${index}`, section: "Math", domain: "Advanced Math", skill: "Quadratics", difficulty: "Hard", reviewStatus: "reviewed", skeletonId: `adv-${index}` })),
    ...Array.from({ length: 4 }, (_, index) => ({ id: `mix-hard-${index}`, section: "Reading and Writing", domain: "Craft and Structure", skill: "Words in Context", difficulty: "Hard", reviewStatus: "reviewed", skeletonId: `mix-${index}` })),
  ];
  const cruciblePlan = adaptive.buildQuestionRecommendationPlan({
    routingProfile: {
      ...profile,
      priorityDomains: [{ section: "Math", domain: "Advanced Math", label: "Advanced Math", weightedAccuracy: 0.62 }],
      nextActions: [
        { target: { section: "Math", domain: "Algebra", skill: "Linear equations", label: "Linear equations" } },
        { target: { section: "Math", domain: "Advanced Math", skill: "Quadratics", label: "Quadratics" } },
      ],
    },
    profile: { attempts: [] },
    questions: crucibleBank,
    limit: 12,
  });
  const bucketIds = cruciblePlan.buckets.map((bucket) => bucket.id);
  assert.ok(bucketIds.includes("crucible-same-skill"));
  assert.ok(bucketIds.includes("crucible-transfer"));
  assert.ok(bucketIds.includes("crucible-mixed"));
  assert.ok(bucketIds.includes("crucible-timed-proof"));
}

run();
console.log("adaptive_routing_engine_unit_tests: pass");
