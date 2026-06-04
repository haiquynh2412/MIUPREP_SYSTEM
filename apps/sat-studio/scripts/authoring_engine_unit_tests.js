const assert = require("node:assert/strict");
const authoring = require("../sat_authoring_engine.js");

function baseQuestion(overrides = {}) {
  return {
    id: "q-1",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Medium",
    questionType: "multiple_choice",
    sourceType: "ai_generated",
    visibility: "private_family",
    reviewStatus: "reviewed",
    publicationStatus: "private_auto_reviewed",
    prompt: "If 2x + 4 = 10, what is x?",
    choices: { A: "2", B: "3", C: "4", D: "5" },
    correctAnswer: "B",
    explanation: "Subtract 4 to get 2x = 6, so x = 3.",
    expectedAnswer: "3",
    ...overrides,
  };
}

function run() {
  assert.equal(authoring.sourceKindRisk("commercial_prep"), "high");
  assert.equal(authoring.sourceKindRisk("unknown_archive_doc"), "medium");

  const normalizedSignal = authoring.normalizeSourceSignal(
    {
      sourceKind: "commercial_prep",
      section: "Math",
      difficulty: "Very hard",
      protectedTextExcluded: true,
    },
    { nowIso: "2026-05-18T00:00:00.000Z", nowMs: 1779046800000, accountId: "admin-1" },
  );
  assert.equal(normalizedSignal.difficulty, "Medium");
  assert.equal(normalizedSignal.risk, "high");
  assert.equal(normalizedSignal.createdBy, "admin-1");

  const blockedSignal = authoring.buildSourceSignalDraft(
    { protectedTextExcluded: false },
    { isContentAdmin: true, canAccessPrivateContent: true },
  );
  assert.equal(blockedSignal.ok, false);
  assert.ok(blockedSignal.reason.includes("protected prompt"));

  const signalDraft = authoring.buildSourceSignalDraft(
    {
      sourceKind: "cracksat",
      sourceReference: " https://example.com ",
      section: "Math",
      domain: "",
      skill: "",
      difficulty: "Hard",
      mistakePattern: "Skill signal only.",
      protectedTextExcluded: true,
    },
    {
      isContentAdmin: true,
      canAccessPrivateContent: true,
      accountId: "admin-1",
      nowMs: 1779046800000,
      nowIso: "2026-05-18T00:00:00.000Z",
    },
  );
  assert.equal(signalDraft.ok, true);
  assert.equal(signalDraft.signal.sourceReference, "https://example.com");
  assert.equal(signalDraft.signal.domain, "Algebra");
  assert.equal(signalDraft.signal.skill, "Linear equations in one variable");
  assert.equal(signalDraft.signal.risk, "high");

  const parentSignalDraft = authoring.buildSourceSignalDraft(
    {
      sourceKind: "free",
      sourceReference: "Parent-written worksheet",
      section: "Reading and Writing",
      domain: "Craft and Structure",
      skill: "Words in Context",
      difficulty: "Medium",
      protectedTextExcluded: true,
    },
    {
      canAuthorQuestions: true,
      canAccessPrivateContent: true,
      accountId: "parent-1",
      nowMs: 1779046800001,
      nowIso: "2026-05-18T00:00:01.000Z",
    },
  );
  assert.equal(parentSignalDraft.ok, true);
  assert.equal(parentSignalDraft.signal.createdBy, "parent-1");
  assert.equal(parentSignalDraft.signal.visibility, "private_family");

  const manualDraft = authoring.buildManualQuestionDraft(
    {
      section: "Math",
      domain: "Algebra",
      skill: "Linear equations",
      difficulty: "Easy",
      prompt: "If x + 2 = 5, what is x?",
      choiceA: "2",
      choiceB: "3",
      choiceC: "4",
      choiceD: "5",
      correctAnswer: "B",
      explanation: "Subtract 2.",
    },
    { isContentAdmin: true, nowMs: 1779046800000 },
  );
  assert.equal(manualDraft.ok, true);
  assert.equal(manualDraft.draft.id, "orig-1779046800000");
  assert.equal(manualDraft.draft.choices.B, "3");

  const parentManualDraft = authoring.buildManualQuestionDraft(
    {
      section: "Math",
      domain: "Algebra",
      skill: "Linear equations",
      difficulty: "Medium",
      prompt: "If 3x - 1 = 11, what is x?",
      choiceA: "3",
      choiceB: "4",
      choiceC: "5",
      choiceD: "6",
      correctAnswer: "B",
      explanation: "Add 1 to get 3x = 12, then divide by 3.",
    },
    { canAuthorQuestions: true, isContentAdmin: false, nowMs: 1779046800001 },
  );
  assert.equal(parentManualDraft.ok, true);
  assert.equal(parentManualDraft.draft.sourceName, "Parent Contributor Draft");

  const blockedManualDraft = authoring.buildManualQuestionDraft({ prompt: "Missing pieces" }, { isContentAdmin: true });
  assert.equal(blockedManualDraft.ok, false);
  assert.ok(blockedManualDraft.reason.includes("choice_A"));

  const statsQuestions = [
    baseQuestion({ id: "linked-1", sourceSignalId: "sig-1", sourceReference: "ref", sourceType: "ai_generated", reviewStatus: "needs_review" }),
    baseQuestion({ id: "linked-2", sourceSignalId: "sig-1", sourceReference: "ref", sourceType: "ai_generated", reviewStatus: "reviewed" }),
    baseQuestion({ id: "linked-3", sourceSignalId: "other", sourceReference: "ref", sourceType: "ai_generated", reviewStatus: "rejected" }),
    baseQuestion({ id: "manual", sourceSignalId: "sig-1", sourceReference: "ref", sourceType: "original", reviewStatus: "reviewed" }),
  ];
  assert.equal(authoring.draftsForSourceSignal({ id: "sig-1" }, statsQuestions).length, 2);
  assert.equal(authoring.draftsForSourceReference("ref", statsQuestions).length, 3);
  assert.deepEqual(authoring.sourceSignalDraftStats({ id: "sig-1" }, statsQuestions), {
    total: 2,
    needsReview: 1,
    reviewed: 1,
    rejected: 0,
  });

  assert.equal(
    authoring.publicPromotionGate(baseQuestion(), {
      isContentAdmin: true,
      hasOpenQuestionAudits: false,
      isDiagnosticReadyQuestion: true,
    }).ok,
    true,
  );
  assert.equal(
    authoring.publicPromotionGate(baseQuestion({ sourceType: "private_vault" }), {
      isContentAdmin: true,
      hasOpenQuestionAudits: false,
      isDiagnosticReadyQuestion: true,
    }).ok,
    false,
  );
  assert.equal(
    authoring.publicPromotionGate(baseQuestion({ reviewStatus: "needs_review" }), {
      isContentAdmin: true,
      hasOpenQuestionAudits: false,
      isDiagnosticReadyQuestion: true,
    }).reason.includes("Mark Reviewed"),
    true,
  );

  const promoted = baseQuestion();
  const governance = authoring.applyPublicPromotion(promoted, { accountId: "admin", nowIso: "2026-05-17T00:00:00.000Z" });
  assert.equal(promoted.visibility, "public_candidate");
  assert.equal(governance.publicationStatus, "public_candidate_reviewed");
  assert.equal(governance.promotedBy, "admin");

  const mathPass = authoring.verifyMathDraftAnswer(baseQuestion(), {
    answersMatch: (a, b) => String(a) === String(b),
  });
  assert.equal(mathPass.status, "passed");

  const mathFail = authoring.verifyMathDraftAnswer(
    baseQuestion({ choices: { A: "94.20", B: "104.88", C: "100", D: "90" }, correctAnswer: "A", expectedAnswer: "94.20", explanation: "The final value is x = 104.88." }),
    {},
  );
  assert.equal(mathFail.status, "failed");
  assert.ok(mathFail.issues.includes("explanation_final_value_mismatch"));

  const grid = authoring.autoValidateGeneratedDraft({
    ...baseQuestion({
      questionType: "grid_in",
      choices: {},
      correctAnswer: "3.5",
      acceptableAnswers: ["7/2", "3.5"],
      expectedAnswer: "7/2",
      explanation: "Divide 7 by 2 to get x = 3.5.",
    }),
  });
  assert.equal(grid.status, "passed");

  const existing = Array.from({ length: 10 }, (_, index) => ({
    ...baseQuestion({
      id: `existing-${index}`,
      prompt: `If ${index + 2}x + ${index + 4} = ${index + 4 + (index + 2) * 3}, what is x?`,
      correctAnswer: "B",
      choices: { A: "2", B: "3", C: "4", D: "5" },
    }),
  }));
  const draft = baseQuestion({ id: "draft-new", prompt: "If 12x + 14 = 50, what is x?" });
  const safety = authoring.runDraftSafetyChecks(draft, { brief: "Linear equation metadata only." }, {
    existingQuestions: existing,
    textSimilarity: () => 0,
    normalizePrompt: (text) => String(text).toLowerCase().replace(/\d+/g, "#"),
    looksLikeProtectedQuestionText: () => false,
  });
  assert.equal(safety.blocked, true);
  assert.equal(draft.practicePool, "hidden_duplicate");
}

run();
console.log("authoring_engine_unit_tests: pass");
