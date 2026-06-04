import assert from "node:assert/strict";
import {
  answerIsCorrect,
  buildDiagnosticSet,
  buildPracticeSet,
  buildReviewSet,
  createQuestionRepository,
  emptyLearnerState,
  makeAttempt,
  masteryRows,
  nextAction,
  recordAttempt,
  syncAttemptToAccountProfile,
  type LearnerState,
} from "./student-learning";
import { buildPublicStudentPackage, type RawQuestionRecord } from "./public-content-contract";
import { ACCOUNT_STATE_STORAGE_KEY } from "./account-ops";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

function question(index: number, overrides: Partial<RawQuestionRecord> = {}): RawQuestionRecord {
  return {
    id: `q${index}`,
    section: index % 2 === 0 ? "Math" : "Reading and Writing",
    domain: index % 2 === 0 ? "Algebra" : "Information and Ideas",
    skill: index % 3 === 0 ? "Linear equations" : "Inference",
    difficulty: index % 5 === 0 ? "Hard" : "Medium",
    questionType: "multiple_choice",
    prompt: `Question ${index}`,
    choices: { A: "1", B: "2", C: "3", D: "4" },
    correctAnswer: "B",
    explanation: { correct: "Because B is correct." },
    ...overrides,
  };
}

const records = Array.from({ length: 40 }, (_, index) => question(index + 1));
const repo = createQuestionRepository(buildPublicStudentPackage(records, { contentVersion: "test" }));
const state = emptyLearnerState();

assert.equal(repo.items.length, 40);
assert.equal(repo.standardCatalog.items.length, 40);
assert.equal(answerIsCorrect(repo.items[0], "B"), true);
assert.equal(answerIsCorrect(repo.items[0], "A"), false);

const diagnostic = buildDiagnosticSet(repo, state, 20);
assert.equal(diagnostic.length, 20);
assert.ok(diagnostic.some((item) => item.section === "Math"));
assert.ok(diagnostic.some((item) => item.section === "Reading and Writing"));

const diagnosticAttemptState: LearnerState = {
  ...state,
  attempts: [makeAttempt(diagnostic[0], "A", "diagnostic", Date.now() - 1000)],
};
const nextDiagnostic = buildDiagnosticSet(repo, diagnosticAttemptState, 20);
assert.ok(!nextDiagnostic.some((item) => item.id === diagnostic[0].id), "Diagnostic should skip prior raw SAT ids through the standard catalog bridge.");

const practice = buildPracticeSet(repo, state, { skill: "Inference", limit: 10 });
assert.ok(practice.length > 0);
assert.ok(practice.every((item) => item.skill === "Inference"));

const hardPractice = buildPracticeSet(repo, state, { difficulty: "Hard", limit: 5 });
assert.ok(hardPractice.length > 0);
assert.ok(hardPractice.every((item) => item.difficulty === "Hard"));

const withAttempts: LearnerState = {
  ...state,
  attempts: [
    makeAttempt(repo.items[0], "A", "practice", Date.now() - 1000),
    makeAttempt(repo.items[1], "B", "practice", Date.now() - 1000),
    makeAttempt(repo.items[2], "A", "practice", Date.now() - 1000),
  ],
};

assert.ok(buildReviewSet(repo, withAttempts, 4).length > 0);
assert.ok(masteryRows(withAttempts).length > 0);
assert.equal(nextAction(emptyLearnerState()).view, "diagnostic");
assert.equal(nextAction(withAttempts).view, "diagnostic");

const recorded = recordAttempt({ ...emptyLearnerState(), lastContentVersion: "test" }, repo.items[0], "A", "practice", Date.now() - 2100);
assert.equal(recorded.state.attempts.length, 1);
assert.equal(recorded.state.learningEvents.length, 1);
assert.equal(recorded.attempt.attemptSchemaVersion, "sat_attempt_v2");
assert.equal(recorded.attempt.contentVersion, "test");
assert.equal(recorded.attempt.selectedAnswerText, "A. 1");
assert.equal(recorded.attempt.correctAnswerText, "B. 2");
assert.equal(recorded.attempt.timeSpentSeconds >= 2, true);
assert.equal(recorded.event.type, "practice_attempt");
assert.equal(recorded.event.payload.questionId, repo.items[0].id);

const storage = new MemoryStorage();
storage.setItem(
  ACCOUNT_STATE_STORAGE_KEY,
  JSON.stringify({
    version: 2,
    activeAccountId: "student-demo",
    accounts: [{ id: "student-demo", name: "Demo", role: "student", scope: "public", passcode: "1111", status: "active" }],
    profiles: {},
  }),
);
const synced = syncAttemptToAccountProfile(recorded.attempt, recorded.event, storage);
assert.equal(synced.accountId, "student-demo");
assert.equal(synced.event.accountId, "student-demo");
const storedState = JSON.parse(storage.getItem(ACCOUNT_STATE_STORAGE_KEY) || "{}");
assert.equal(storedState.profiles["student-demo"].attempts.length, 1);
assert.equal(storedState.profiles["student-demo"].learningEvents.length, 1);
assert.ok(storedState.profiles["student-demo"].learningEventRevision);

console.log("student-learning.test: pass");
