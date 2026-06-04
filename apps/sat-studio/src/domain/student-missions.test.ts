import assert from "node:assert/strict";
import { emptyLearnerState, type AttemptRecord, type LearnerState } from "./student-learning";
import { emptyProfile, type AccountState } from "./account-ops";
import { ATTEMPT_SCHEMA_VERSION } from "./learning-events";
import { applyMissionReward, buildTodayMission, missionCompleted } from "./student-missions";

function attempt(partial: Partial<AttemptRecord>): AttemptRecord {
  return {
    attemptSchemaVersion: ATTEMPT_SCHEMA_VERSION,
    id: partial.id || `attempt-${Math.random()}`,
    questionId: partial.questionId || "q",
    selectedAnswer: "A",
    selectedAnswerText: "A",
    correctAnswer: "A",
    correctAnswerText: "A",
    correct: partial.correct ?? true,
    answeredAt: partial.answeredAt || "2026-05-30T00:00:00.000Z",
    elapsedMs: 30000,
    timeSpentSeconds: 30,
    mode: partial.mode || "practice",
    practiceMode: partial.practiceMode || partial.mode || "practice",
    section: partial.section || "Math",
    domain: partial.domain || "Algebra",
    skill: partial.skill || "Linear equations",
    difficulty: partial.difficulty || "Medium",
    questionType: "multiple_choice",
    contentVersion: "test",
    attemptNumber: 1,
    studentScoreBand: "1200",
    targetScore: 1500,
    hintUsed: false,
    hintCount: 0,
    fullSolutionViewed: false,
    helpTiming: "none",
    independentAttempt: true,
    errorType: partial.correct === false ? "wrong_answer" : "none",
    proofPass: null,
    learningEvidence: {
      required: false,
      status: "not_required",
      rootCause: "",
      helpTelemetry: { hintUsed: false, hintCount: 0, fullSolutionViewed: false, helpTiming: "none", independentAttempt: true },
    },
  };
}

function accountState(): AccountState {
  return {
    version: 2,
    language: "vi",
    accounts: [{ id: "student-demo", name: "Student", role: "student", status: "active", scope: "family", passcode: "", email: "", gradeLevel: "", avatarInitials: "S", avatarColor: "teal", uiTheme: "studio", parentIds: [], permissions: { rewardManager: false, questionContributor: false }, createdAt: "", studyPlan: { weeklyTarget: 5, nextSessionAt: "" }, targetScore: 1500 }],
    profiles: { "student-demo": emptyProfile() },
    activeAccountId: "student-demo",
    raw: {},
    storage: { exists: false, chunked: false, chunks: 0, missingChunks: [], length: 0, approximateBytes: 0 },
  };
}

const baseline = buildTodayMission(emptyLearnerState());
assert.equal(baseline.id, "diagnostic");
assert.equal(missionCompleted(baseline, emptyLearnerState()), false);

const withMistake: LearnerState = { ...emptyLearnerState(), attempts: Array.from({ length: 8 }, (_, index) => attempt({ id: `a-${index}`, correct: index !== 0 })) };
const review = buildTodayMission(withMistake);
assert.equal(review.id, "proof_review");

const reviewDone: LearnerState = {
  ...withMistake,
  attempts: [...withMistake.attempts, attempt({ id: "r1", mode: "review" }), attempt({ id: "r2", mode: "review" }), attempt({ id: "r3", mode: "review" })],
};
assert.equal(missionCompleted(review, reviewDone), true);

const state = accountState();
const reward = applyMissionReward(state, "student-demo", review, new Date("2026-05-30T12:00:00.000Z"));
assert.equal(reward.ok, true);
assert.equal(reward.state.profiles["student-demo"].attendance.points, review.rewardPoints);
assert.equal(reward.state.profiles["student-demo"].streak.count, 1);
const duplicate = applyMissionReward(reward.state, "student-demo", review, new Date("2026-05-30T13:00:00.000Z"));
assert.equal(duplicate.ok, false);
assert.equal(duplicate.alreadyClaimed, true);

const freezeGrantState = accountState();
freezeGrantState.profiles["student-demo"].streak = { count: 4, lastPracticeDate: "2026-05-29", freezeCredits: 0, lastFreezeUsedAt: "" };
const freezeGrant = applyMissionReward(freezeGrantState, "student-demo", review, new Date("2026-05-30T12:00:00.000Z"));
assert.equal(freezeGrant.ok, true);
assert.equal(freezeGrant.state.profiles["student-demo"].streak.count, 5);
assert.equal(freezeGrant.state.profiles["student-demo"].streak.freezeCredits, 1);
assert.equal(freezeGrant.reason.includes("streak-freeze"), true);

const freezeUseState = accountState();
freezeUseState.profiles["student-demo"].streak = { count: 5, lastPracticeDate: "2026-05-28", freezeCredits: 1, lastFreezeUsedAt: "" };
const freezeUse = applyMissionReward(freezeUseState, "student-demo", review, new Date("2026-05-30T12:00:00.000Z"));
assert.equal(freezeUse.ok, true);
assert.equal(freezeUse.state.profiles["student-demo"].streak.count, 6);
assert.equal(freezeUse.state.profiles["student-demo"].streak.freezeCredits, 0);
assert.equal(freezeUse.state.profiles["student-demo"].streak.lastFreezeUsedAt, "2026-05-30T12:00:00.000Z");

console.log("student-missions.test: pass");
