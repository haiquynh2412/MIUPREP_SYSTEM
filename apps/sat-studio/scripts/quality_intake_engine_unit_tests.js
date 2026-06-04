const assert = require("node:assert/strict");
const qualityIntake = require("../sat_quality_intake_engine.js");

function baseQuestion(overrides = {}) {
  return {
    id: `q-${Math.random().toString(36).slice(2, 8)}`,
    section: "Reading and Writing",
    domain: "Craft and Structure",
    skill: "Transitions",
    difficulty: "Medium",
    questionType: "multiple_choice",
    prompt: "Which choice best completes the text?",
    choices: {
      A: "Therefore",
      B: "However",
      C: "For example",
      D: "Similarly",
    },
    correctAnswer: "B",
    explanation: "However is correct because the second sentence contrasts with the first.",
    reviewStatus: "reviewed",
    visibility: "private_family",
    sourceType: "ai_generated",
    sourceName: "SAT Studio AI Draft Workspace",
    sourceReference: "unit-test",
    ...overrides,
  };
}

function run() {
  const duplicate = baseQuestion({
    id: "ai-duplicate",
    prompt: "The experiment was carefully designed. ___, its result could not be reproduced.",
  });
  const existing = baseQuestion({
    id: "original-existing",
    sourceType: "original",
    prompt: duplicate.prompt,
  });
  const antigravity = baseQuestion({
    id: "antigravity-1",
    sourceType: "antigravity",
    prompt: "The critic praised the novel's setting. ___, she questioned its pacing.",
  });
  const ready = baseQuestion({
    id: "sat1590-1",
    sourceType: "sat_1590",
    skill: "Command of Evidence",
    prompt: "Which finding would most directly support the researcher's claim?",
    choices: {
      A: "A small unrelated survey produced mixed results.",
      B: "A replicated study found the same pattern in a larger sample.",
      C: "The researcher's dataset omitted several variables.",
      D: "The study used an older measurement tool.",
    },
    correctAnswer: "B",
    explanation: "Choice B is correct because replication in a larger sample directly supports the claim.",
  });
  const report = qualityIntake.buildGenerationIntakeReport([duplicate, existing, antigravity, ready], { maxActivePerTopic: 10 });

  assert.equal(report.version, "quality-intake-v2");
  assert.equal(report.summary.total, 3, "Only generated candidates should enter the intake report.");
  assert.equal(report.summary.blocked, 1, "Exact duplicate generated prompts should be blocked.");
  assert.equal(report.summary.needsReview, 1, "Antigravity reviewed rows should still require intake approval.");
  assert.equal(report.summary.ready, 1, "Unique reviewed generated rows should pass the private intake gate.");

  const duplicateRow = report.rows.find((row) => row.id === "ai-duplicate");
  assert.ok(duplicateRow.issues.some((issue) => issue.includes("exactly matches")), "Duplicate prompt should carry a concrete issue.");

  const result = qualityIntake.applyGenerationIntakePolicy([duplicate, existing, antigravity, ready], report, {
    nowIso: "2026-05-18T00:00:00.000Z",
    reviewer: "content-admin",
  });
  assert.equal(result.changedCount, 3);
  assert.equal(duplicate.practicePool, "hidden_duplicate");
  assert.equal(duplicate.publicationStatus, "intake_blocked");
  assert.equal(antigravity.reviewStatus, "needs_review");
  assert.equal(antigravity.publicationStatus, "intake_needs_admin_review");
  assert.equal(ready.publicationStatus, "private_intake_passed");
  assert.equal(ready.intakeGate.approvedAt, "2026-05-18T00:00:00.000Z");
}

run();
console.log("quality_intake_engine_unit_tests: pass");
