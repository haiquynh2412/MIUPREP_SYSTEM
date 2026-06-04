const assert = require("node:assert/strict");
const sampler = require("../sat_sampler_engine.js");

function question(id, section, domain, difficulty, extras = {}) {
  return {
    id,
    section,
    domain,
    skill: extras.skill || `${domain} skill`,
    difficulty,
    reviewStatus: "reviewed",
    sourceType: extras.sourceType || "foundation",
    choices: { A: "A", B: "B", C: "C", D: "D" },
    correctAnswer: "A",
    explanation: "Because A is supported.",
    prompt: extras.prompt || `${domain} ${difficulty} ${id}`,
    ...extras,
  };
}

function run() {
  assert.deepEqual(sampler.difficultyQuotas(4, "standard"), { Easy: 1, Medium: 2, Hard: 1 });
  assert.deepEqual(sampler.difficultyQuotas(4, "hard"), { Easy: 0, Medium: 2, Hard: 2 });
  assert.equal(sampler.normalizeRoute("foundation"), "easy");
  assert.deepEqual(sampler.buildDomainBlueprint({ section: "Math", total: 20 }), [
    { section: "Math", domain: "Algebra", count: 7 },
    { section: "Math", domain: "Advanced Math", count: 7 },
    { section: "Math", domain: "Problem-Solving and Data Analysis", count: 3 },
    { section: "Math", domain: "Geometry and Trigonometry", count: 3 },
  ]);

  const bank = [
    question("alg-e", "Math", "Algebra", "Easy"),
    question("alg-m", "Math", "Algebra", "Medium"),
    question("alg-h", "Math", "Algebra", "Hard", { questionType: "student_produced_response" }),
    question("adv-e", "Math", "Advanced Math", "Easy"),
    question("adv-m", "Math", "Advanced Math", "Medium"),
    question("adv-h", "Math", "Advanced Math", "Hard", { tags: ["desmos_recommended"] }),
    question("rw-i", "Reading and Writing", "Information and Ideas", "Medium"),
  ];
  const selected = sampler.selectQuestionsByBlueprint(
    bank,
    [
      { section: "Math", domain: "Algebra", count: 2 },
      { section: "Math", domain: "Advanced Math", count: 2 },
    ],
    { route: "hard" },
  );
  assert.equal(selected.length, 4);
  assert.equal(selected.filter((item) => item.domain === "Algebra").length, 2);
  assert.equal(selected.filter((item) => item.domain === "Advanced Math").length, 2);
  assert.ok(selected.some((item) => item.difficulty === "Hard"));

  const audit = sampler.buildSelectionAudit(selected, [], { target: 4 });
  assert.equal(audit.version, "sat_sampler_audit_v1");
  assert.equal(audit.selectedCount, 4);
  assert.equal(audit.bySection.Math, 4);
  assert.equal(audit.mathGridIn, 1);
  assert.equal(audit.toolSummary.desmosRecommended, 1);
  assert.equal(audit.topicCap, 1);
  assert.equal(audit.maxTopicCount, 1);
  assert.ok(Array.isArray(audit.blueprintQuotaDeltas));

  const repeated = sampler.topicRepetitionReport(
    [
      question("dup-1", "Math", "Algebra", "Medium", { prompt: "same 1" }),
      question("dup-2", "Math", "Algebra", "Medium", { prompt: "same 2" }),
    ],
    { topicKey: (item) => `${item.section}|${item.domain}|same`, maxPerTopic: 1 },
  );
  assert.equal(repeated.repeatedTopicCount, 1);
  assert.equal(repeated.maxTopicCount, 2);

  const gaps = sampler.blueprintGapAnalysis(bank, [
    { section: "Math", domain: "Algebra", count: 2 },
    { section: "Math", domain: "Geometry and Trigonometry", count: 2 },
  ]);
  assert.equal(gaps[0].deficit, 0);
  assert.equal(gaps[1].deficit, 2);
}

run();
console.log("sampler_engine_unit_tests: pass");
