const assert = require("node:assert/strict");
const engine = require("../sat_content_admin_engine.js");

function run() {
  const model = engine.buildContentAdminCommandModel({
    readiness: {
      inventory: { coreReadyReviewed: 7258, studyVisibleExcludingHidden: 7727 },
      domainBalance: {
        coreReadyMath: [
          {
            domain: "Algebra",
            count: 1070,
            actualPct: 28.9,
            officialPct: 35,
            deltaPctPoints: -6.1,
            additionalNeededIfOnlyAddingThisDomain: 348,
            balance: "underrepresented",
          },
          {
            domain: "Problem-Solving and Data Analysis",
            count: 844,
            actualPct: 22.8,
            officialPct: 15,
            deltaPctPoints: 7.8,
            additionalNeededIfOnlyAddingThisDomain: 0,
            balance: "overrepresented",
          },
        ],
        coreReadyReadingWriting: [],
      },
      thinCoreReadyMathSubskills: [{ skill: "Nonlinear equations in one variable", count: 22, hardCount: 14 }],
    },
    integrityReport: {
      summary: { warningQuestionCount: 956, overrepresentedTopicCount: 3 },
      topicGovernancePlan: {
        hypotenuse: { count: 103, visibleCount: 78, overflowCount: 43, candidateIds: ["q1", "q2"] },
      },
    },
    expertAudit: {
      scorecard: { overallExpertScore10: 6.2, accuracyBlockerCount: 0, depthGapCount: 2855, verdict: "accurate_pool_with_blueprint_balance_gaps" },
      depth: { genericDistractorTeachingCount: 1388, hardMathMultiStepHeuristicPctOfHardMath: 8.5 },
    },
    itemAnalytics: {
      version: "item-analytics-v1-2026-05-26",
      attemptCount: 150,
      calibrationAttemptCount: 120,
      readyPValue: 2,
      readyDiscrimination: 1,
      lowQuality: 1,
      rows: [
        {
          questionId: "q-low",
          section: "Math",
          domain: "Algebra",
          skill: "Linear functions",
          difficulty: "Hard",
          responseCount: 120,
          calibrationResponseCount: 100,
          helpedResponseCount: 20,
          pValue: 0.41,
          discriminationIndex: 0.05,
          flags: ["low_discrimination"],
        },
      ],
    },
    questions: [{ id: "q1" }],
  });

  assert.equal(model.phaseA.total, 64);
  assert.equal(model.uploadGate.phase.domains[0].domain, "Algebra");
  assert.ok(model.domainGaps.some((gap) => gap.domain === "Algebra" && gap.priority === "P1"));
  assert.ok(model.domainGaps.some((gap) => gap.domain === "Problem-Solving and Data Analysis" && gap.tone === "surplus"));
  assert.equal(model.quality.accuracyBlockers, 0);
  assert.equal(model.quality.depthGapCount, 2855);
  assert.equal(model.quality.itemAnalytics.readyPValue, 2);
  assert.equal(model.quality.itemAnalytics.helpedResponseCount, 20);
  assert.equal(model.quality.itemAnalytics.flaggedRows[0].questionId, "q-low");
  assert.ok(model.quality.flags.some((item) => item.label.includes("item analytics")));
  assert.equal(model.surplusTopics[0].topic, "hypotenuse");
  assert.ok(model.topPriorities.some((item) => item.label.includes("Algebra")));
  assert.ok(model.uploadGate.postUploadChecks.some((item) => item.command.includes("run_quality_checks.js")));
}

run();
console.log("content_admin_engine_unit_tests: pass");
