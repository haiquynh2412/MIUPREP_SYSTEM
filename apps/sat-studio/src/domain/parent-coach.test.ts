import assert from "node:assert/strict";
import { buildParentCoachModel } from "./parent-coach";
import { emptyLearnerState, type AttemptRecord, type LearnerState } from "./student-learning";
import { ATTEMPT_SCHEMA_VERSION } from "./learning-events";

function attempt(overrides: Partial<AttemptRecord>): AttemptRecord {
  const id = String(overrides.id || "attempt");
  const correct = Boolean(overrides.correct);
  return {
    attemptSchemaVersion: ATTEMPT_SCHEMA_VERSION,
    id,
    questionId: String(overrides.questionId || "q"),
    selectedAnswer: String(overrides.selectedAnswer || "A"),
    selectedAnswerText: String(overrides.selectedAnswerText || overrides.selectedAnswer || "A"),
    correctAnswer: String(overrides.correctAnswer || "B"),
    correctAnswerText: String(overrides.correctAnswerText || overrides.correctAnswer || "B"),
    correct,
    answeredAt: String(overrides.answeredAt || "2026-05-28T00:00:00.000Z"),
    elapsedMs: Number(overrides.elapsedMs || 50000),
    timeSpentSeconds: Math.round(Number(overrides.elapsedMs || 50000) / 1000),
    mode: overrides.mode || "practice",
    practiceMode: overrides.practiceMode || overrides.mode || "practice",
    section: String(overrides.section || "Math"),
    domain: String(overrides.domain || "Algebra"),
    skill: String(overrides.skill || "Linear equations"),
    difficulty: String(overrides.difficulty || "Medium"),
    questionType: String(overrides.questionType || "multiple_choice"),
    contentVersion: String(overrides.contentVersion || "test"),
    attemptNumber: Number(overrides.attemptNumber || Number(id.replace(/\D/g, "")) || 1),
    studentScoreBand: String(overrides.studentScoreBand || "unestimated"),
    targetScore: Number(overrides.targetScore || 1500),
    hintUsed: Boolean(overrides.hintUsed),
    hintCount: Number(overrides.hintCount || 0),
    fullSolutionViewed: Boolean(overrides.fullSolutionViewed),
    helpTiming: overrides.helpTiming || "none",
    independentAttempt: overrides.independentAttempt ?? true,
    errorType: overrides.errorType || (correct ? "none" : "wrong_answer"),
    proofPass: overrides.proofPass ?? null,
    learningEvidence: overrides.learningEvidence || {
      required: !correct,
      status: correct ? "not_required" : "pending",
      rootCause: correct ? "" : "wrong_answer",
      helpTelemetry: {
        hintUsed: false,
        hintCount: 0,
        fullSolutionViewed: false,
        helpTiming: "none",
        independentAttempt: true,
      },
    },
  };
}

function run(): void {
  const empty = buildParentCoachModel(emptyLearnerState(), { packageCount: 9305, generatedAt: "2026-05-28T00:00:00.000Z" });
  assert.equal(empty.nextAction.tone, "baseline");
  assert.ok(empty.flags.includes("baseline_needed"));
  assert.equal(empty.metrics.find((metric) => metric.label === "Kho public-safe")?.value, "9305");

  const state: LearnerState = {
    ...emptyLearnerState(),
    attempts: [
      attempt({
        id: "a1",
        questionId: "q1",
        selectedAnswer: "A",
        correctAnswer: "B",
        correct: false,
        answeredAt: "2026-05-28T00:00:00.000Z",
        elapsedMs: 100000,
        mode: "practice",
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations",
        difficulty: "Medium",
      }),
      attempt({
        id: "a2",
        questionId: "q2",
        selectedAnswer: "C",
        correctAnswer: "C",
        correct: true,
        answeredAt: "2026-05-28T00:01:00.000Z",
        elapsedMs: 92000,
        mode: "practice",
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations",
        difficulty: "Hard",
      }),
      attempt({
        id: "a3",
        questionId: "q3",
        selectedAnswer: "B",
        correctAnswer: "B",
        correct: true,
        answeredAt: "2026-05-28T00:02:00.000Z",
        elapsedMs: 60000,
        mode: "practice",
        section: "Reading and Writing",
        domain: "Craft and Structure",
        skill: "Words in Context",
        difficulty: "Hard",
      }),
      attempt({
        id: "a4",
        questionId: "q4",
        selectedAnswer: "D",
        correctAnswer: "D",
        correct: true,
        answeredAt: "2026-05-28T00:03:00.000Z",
        elapsedMs: 50000,
        mode: "practice",
        section: "Math",
        domain: "Algebra",
        skill: "Linear equations",
        difficulty: "Easy",
      }),
      attempt({
        id: "a5",
        questionId: "q5",
        selectedAnswer: "A",
        correctAnswer: "A",
        correct: true,
        answeredAt: "2026-05-28T00:04:00.000Z",
        elapsedMs: 50000,
        mode: "practice",
        section: "Math",
        domain: "Advanced Math",
        skill: "Quadratic equations",
        difficulty: "Hard",
      }),
      attempt({
        id: "a6",
        questionId: "q6",
        selectedAnswer: "A",
        correctAnswer: "A",
        correct: true,
        answeredAt: "2026-05-28T00:05:00.000Z",
        elapsedMs: 50000,
        mode: "practice",
        section: "Math",
        domain: "Advanced Math",
        skill: "Quadratic equations",
        difficulty: "Hard",
      }),
      attempt({
        id: "a7",
        questionId: "q7",
        selectedAnswer: "A",
        correctAnswer: "A",
        correct: true,
        answeredAt: "2026-05-28T00:06:00.000Z",
        elapsedMs: 50000,
        mode: "practice",
        section: "Math",
        domain: "Advanced Math",
        skill: "Quadratic equations",
        difficulty: "Medium",
      }),
      attempt({
        id: "a8",
        questionId: "q8",
        selectedAnswer: "A",
        correctAnswer: "A",
        correct: true,
        answeredAt: "2026-05-28T00:07:00.000Z",
        elapsedMs: 50000,
        mode: "practice",
        section: "Math",
        domain: "Advanced Math",
        skill: "Quadratic equations",
        difficulty: "Easy",
      }),
    ],
  };
  const model = buildParentCoachModel(state, { packageCount: 9305 });
  assert.equal(model.accuracy, 88);
  assert.equal(model.openMistakes, 1);
  assert.equal(model.nextAction.tone, "repair");
  assert.ok(model.flags.includes("mistake_review_due"));
  assert.ok(model.flags.includes("pacing_risk"));
  assert.ok(model.weakRows.length > 0);
}

run();
console.log("parent-coach.test: pass");
