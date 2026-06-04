import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAdminContentModel,
  buildAdminOperationsModel,
  choiceViews,
  correctAnswerText,
  addExpertReviewVersion,
  emptyExpertReviewWorkspace,
  expertDraftToQuestion,
  expertReviewBackendPayload,
  explanationViews,
  INTERNAL_QUESTION_BANK_FILES,
  latestExpertReviewVersions,
  publicPromotionGate,
  questionToExpertReviewDraft,
  requiredContentIssues,
  sourceFacts,
  validateExpertReviewDraft,
  type AdminQuestionRecord,
} from "./admin-content";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadFixtureRows(limitPerFile = 5): AdminQuestionRecord[] {
  return INTERNAL_QUESTION_BANK_FILES.flatMap((filename) => {
    const payload = JSON.parse(fs.readFileSync(path.join(root, "data", filename), "utf8"));
    const rows = Array.isArray(payload) ? payload : payload.questions || [];
    return rows.slice(0, limitPerFile).map((row: AdminQuestionRecord, index: number) => ({ ...row, _sourceFile: filename, _sourceIndex: index }));
  });
}

function run(): void {
  const reviewedPublic: AdminQuestionRecord = {
    id: "admin-test-public",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations",
    difficulty: "Medium",
    sourceType: "sat_studio_original",
    reviewStatus: "reviewed",
    visibility: "public_candidate",
    publicationStatus: "public_candidate_reviewed",
    prompt: "If x + 2 = 5, what is x?",
    choices: { A: "2", B: "3", C: "5", D: "7" },
    correctAnswer: "B",
    explanation: { correct: "Choice B is correct because subtracting 2 from both sides gives x = 3." },
  };
  assert.equal(publicPromotionGate(reviewedPublic).ok, true);
  assert.equal(correctAnswerText(reviewedPublic), "B. 3");
  assert.equal(choiceViews(reviewedPublic).find((choice) => choice.correct)?.letter, "B");
  assert.equal(explanationViews(reviewedPublic)[0].label, "Correct route");
  assert.ok(sourceFacts({ ...reviewedPublic, _sourceFile: "unit.json" }).some((fact) => fact.label === "Source file" && fact.value === "unit.json"));

  const draft = questionToExpertReviewDraft({ ...reviewedPublic, _sourceFile: "unit.json", _sourceIndex: 4 });
  draft.prompt = "If x + 2 = 6, what is x?";
  draft.choiceB = "4";
  draft.explanationCorrect = "Choice B is correct because subtracting 2 from both sides gives x = 4.";
  draft.reviewStatus = "reviewed";
  draft.visibility = "public_candidate";
  draft.publicationStatus = "public_candidate_reviewed";
  draft.copyrightNote = "SAT Studio original draft; no third-party prompt, choices, data, or explanation copied.";
  const validation = validateExpertReviewDraft({ ...reviewedPublic, _sourceFile: "unit.json", _sourceIndex: 4 }, draft);
  assert.equal(validation.ok, true);
  assert.ok(validation.changedFields.includes("prompt"));
  assert.equal((expertDraftToQuestion(reviewedPublic, draft).choices as Record<string, string>).B, "4");
  const workspace = addExpertReviewVersion(emptyExpertReviewWorkspace("2026-05-30T00:00:00Z"), { ...reviewedPublic, _sourceFile: "unit.json", _sourceIndex: 4 }, draft, {
    actor: "unit-admin",
    note: "Corrected arithmetic context.",
    status: "expert_reviewed",
    now: "2026-05-30T00:01:00Z",
  });
  const latestVersion = latestExpertReviewVersions(workspace, "admin-test-public")[0];
  assert.equal(latestVersion.versionNumber, 1);
  assert.equal(latestVersion.status, "expert_reviewed");
  assert.equal(workspace.latestByQuestionId["admin-test-public"], latestVersion.id);
  const backendPayload = expertReviewBackendPayload(latestVersion, reviewedPublic);
  assert.equal(backendPayload.questionId, "admin-test-public");
  assert.equal((backendPayload.draft as AdminQuestionRecord).prompt, draft.prompt);

  const privateVault = { ...reviewedPublic, id: "admin-test-vault", sourceType: "private_vault", visibility: "private_family" };
  const privateGate = publicPromotionGate(privateVault);
  assert.equal(privateGate.ok, false);
  assert.ok(privateGate.blockers.includes("blocked_source_type"));

  const broken = { ...reviewedPublic, id: "", prompt: "", choices: {}, correctAnswer: "" };
  assert.deepEqual(requiredContentIssues(broken).slice(0, 2), ["missing_id", "missing_prompt"]);
  assert.equal(publicPromotionGate(broken).ok, false);

  const fixtureRows = loadFixtureRows();
  const model = buildAdminContentModel(fixtureRows, { generatedAt: "2026-05-28T00:00:00.000Z" });
  const publicPackage = {
    schemaVersion: "sat_content_package_v1",
    contractVersion: "sat_public_student_contract_v1",
    contentVersion: "unit",
    generatedAt: "2026-05-28T00:00:00.000Z",
    manifest: { total: 1 },
    items: [{ id: "safe", section: "Math", domain: "Algebra", skill: "Linear equations", difficulty: "Easy", questionType: "multiple_choice", prompt: "Prompt" }],
  };
  const operations = buildAdminOperationsModel(model, model.queue.map((item) => item.question), {
    publicPackage,
    integrityReport: {
      summary: { criticalIssueCount: 0, criticalQuestionCount: 0, warningIssueCount: 2, warningQuestionCount: 2, overrepresentedTopicCount: 0 },
      issueBreakdown: { warning: { rw_prompt_too_long: 2 } },
      studyPolicy: { suppressedDefaultStudyIds: ["a"], rwLongPromptIds: ["a", "b"] },
    },
    readinessAudit: {
      inventory: { loadedTotal: 10, coreReadyReviewed: 9, publicCandidateReadyReviewed: 7, strict1600HardNonBlocked: 4, sourceCountsLoaded: { antigravity: 2 }, sourceCountsCoreReady: { antigravity: 1 } },
      coreFormat: { mathGridInPct: 25, hardMathMultiStepPctOfHardMath: 18 },
      domainBalance: {
        coreReadyReadingWriting: [{ domain: "Information and Ideas", count: 1, actualPct: 25, officialPct: 26, deltaPctPoints: -1, balance: "near_target" }],
        coreReadyMath: [{ domain: "Algebra", count: 1, actualPct: 35, officialPct: 35, deltaPctPoints: 0, balance: "near_target" }],
      },
    },
  });
  assert.equal(model.generatedAt, "2026-05-28T00:00:00.000Z");
  assert.equal(model.summary.total, fixtureRows.length);
  assert.ok(model.summary.reviewed > 0);
  assert.ok(model.summary.sources.antigravity > 0);
  assert.ok(model.summary.actionQueueTotal >= model.queue.length);
  assert.equal(Object.values(model.summary.queueCounts).reduce((sum, count) => sum + count, 0), model.summary.total);
  assert.ok(model.summary.queueCounts.ready_public >= 0);
  assert.ok(model.topDomains.length > 0);
  assert.ok(model.queue.every((item) => item.kind !== "ready_public"));
  assert.equal(operations.release.ready, true);
  assert.equal(operations.integrity.warningTypes[0].type, "rw_prompt_too_long");
  assert.equal(operations.readiness.domainRows.length, 2);
  assert.ok(operations.authoringChecklist.length >= 4);

  console.log("admin-content.test: pass");
}

run();
