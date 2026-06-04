const assert = require("node:assert/strict");
const questionImport = require("../sat_question_import.js");

function run() {
  assert.equal(questionImport.normalizeReviewStatus("reviewed"), "reviewed");
  assert.equal(questionImport.normalizeReviewStatus("approved"), "needs_review");
  assert.equal(questionImport.normalizeQuestionType({ answerFormat: "grid-in" }), "student_produced_response");
  assert.deepEqual(questionImport.normalizeAcceptableAnswers([" 3/4 ", "", null, 0]), ["3/4", "0"]);
  assert.equal(questionImport.inferSection("Advanced Math"), "Math");
  assert.equal(questionImport.inferSection("Craft and Structure"), "Reading and Writing");

  const mcq = questionImport.normalizeQuestionRecord(
    {
      id: "manual-1",
      prompt: "Which choice best completes the text?",
      choices: { A: "alpha", B: "beta", C: "gamma", D: "delta" },
      correctAnswer: "B",
      domain: "Expression of Ideas",
      skill: "Transitions",
      reviewStatus: "approved",
    },
    0,
    { defaultSourceName: "Manual JSON Import" },
  );
  assert.equal(mcq.sourceType, "original");
  assert.equal(mcq.sourceName, "Manual JSON Import");
  assert.equal(mcq.reviewStatus, "needs_review");
  assert.equal(mcq.visibility, "public_candidate");
  assert.deepEqual(Object.keys(mcq.choices), ["A", "B", "C", "D"]);

  const grid = questionImport.normalizeQuestionRecord(
    {
      id: "grid-1",
      prompt: "What is x?",
      correctAnswer: "0",
      answerFormat: "numeric",
      acceptableAnswers: ["0", "0.0"],
      domain: "Algebra",
    },
    1,
  );
  assert.equal(grid.questionType, "student_produced_response");
  assert.equal(grid.answerFormat, "numeric");
  assert.deepEqual(grid.choices, {});
  assert.deepEqual(grid.acceptableAnswers, ["0", "0.0"]);
  assert.equal(grid.section, "Math");

  const vault = questionImport.normalizeQuestionRecord(
    {
      id: "vault-1",
      prompt: "Private source prompt",
      choices: { A: "A", B: "B", C: "C", D: "D" },
      correctAnswer: "A",
      sourceType: "private_vault",
    },
    2,
    { forcePrivateVault: true },
  );
  assert.equal(vault.sourceType, "private_vault");
  assert.equal(vault.visibility, "private_family");
  assert.equal(vault.neverPublic, true);
  assert.equal(vault.publicationStatus, "private_family_only");

  const antigravity = questionImport.normalizeQuestionRecord(
    {
      id: "anti-1",
      prompt: "Generated cross-text prompt",
      choices: { A: "A", B: "B", C: "C", D: "D" },
      correctAnswer: "D",
      sourceType: "antigravity",
    },
    3,
    {
      antigravitySourceSignalId: "antigravity-testbank",
      generatedContentAuditVersion: "test-audit-version",
    },
  );
  assert.equal(antigravity.visibility, "private_family");
  assert.equal(antigravity.sourceSignalId, "antigravity-testbank");
  assert.equal(antigravity.generationEngine, "antigravity");
  assert.equal(antigravity.contentAudit.version, "test-audit-version");

  assert.equal(questionImport.normalizeQuestionRecord({ prompt: "", correctAnswer: "A" }, 4), null);

  const openSat = questionImport.normalizeOpenSatQuestion(
    {
      id: "abc",
      domain: "Standard English Conventions",
      difficulty: "Medium",
      _satStudioSourceSection: "english",
      question: {
        paragraph: "The study was complete",
        question: "Which punctuation is correct?",
        choices: { A: ", therefore", B: "; therefore,", C: "therefore", D: ", and therefore," },
        correct_answer: "B",
        explanation: "A semicolon separates independent clauses.",
      },
    },
    9,
    {
      openSatImportAuditVersion: "opensat-test",
      questionReviews: { "opensat-english-9-abc": "reviewed" },
    },
  );
  assert.equal(openSat.id, "opensat-english-9-abc");
  assert.equal(openSat.section, "Reading and Writing");
  assert.equal(openSat.skill, "Boundaries");
  assert.equal(openSat.reviewStatus, "reviewed");
  assert.equal(openSat.contentAudit.version, "opensat-test");

  const auditedOpenSat = questionImport.normalizeOpenSatQuestion(
    {
      id: "audited",
      domain: "Information and Ideas",
      difficulty: "Easy",
      _satStudioSourceSection: "english",
      reviewStatus: "reviewed",
      publicationStatus: "public_candidate_reviewed",
      contentAudit: { version: "strict-audit", verdict: "pass" },
      practicePool: "core_pool",
      question: {
        paragraph: "A study found that more sunlight improved plant growth.",
        question: "Which finding best supports the claim?",
        choices: { A: "More sunlight was measured.", B: "The plants were green.", C: "The room was quiet.", D: "The pots were round." },
        correct_answer: "A",
      },
    },
    11,
  );
  assert.equal(auditedOpenSat.reviewStatus, "reviewed");
  assert.equal(auditedOpenSat.publicationStatus, "public_candidate_reviewed");
  assert.equal(auditedOpenSat.contentAudit.version, "strict-audit");
  assert.equal(auditedOpenSat.practicePool, "core_pool");

  const duplicateChoices = questionImport.normalizeOpenSatQuestion(
    {
      id: "dup",
      domain: "Information and Ideas",
      question: {
        paragraph: "Text",
        choices: { A: "same", B: "same", C: "same", D: "same" },
        correct_answer: "A",
      },
    },
    10,
  );
  assert.equal(duplicateChoices, null);
}

run();
console.log("question_import_unit_tests: pass");
