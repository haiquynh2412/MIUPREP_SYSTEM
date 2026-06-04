import assert from "node:assert/strict";
import { buildPublicStudentPackage, type RawQuestionRecord } from "./public-content-contract";
import { createQuestionRepository, emptyLearnerState, makeAttempt, type AttemptRecord } from "./student-learning";
import {
  analyzeSatPacing,
  buildMixedAdaptiveSet,
  buildModule2Readiness,
  buildSatStrategyRemediationCards,
  classifySatTrap,
} from "./sat-optimization";

function question(index: number, overrides: Partial<RawQuestionRecord> = {}): RawQuestionRecord {
  const math = index % 2 === 0;
  return {
    id: `sat-opt-q${index}`,
    section: math ? "Math" : "Reading and Writing",
    domain: math ? "Algebra" : "Information and Ideas",
    skill: math ? "Linear equations" : "Command of Evidence",
    difficulty: index % 5 === 0 ? "Hard" : index % 3 === 0 ? "Easy" : "Medium",
    questionType: "multiple_choice",
    prompt: math ? "Which equation represents the linear relationship?" : "Which choice best supports the claim with evidence?",
    choices: { A: "1", B: "2", C: "3", D: "4" },
    correctAnswer: "B",
    explanation: { correct: "Because B is supported by the evidence." },
    ...overrides,
  };
}

function timedAttempt(questionIndex: number, selectedAnswer: string, elapsedSeconds: number): AttemptRecord {
  const item = repo.items.find((row) => row.id === `sat-opt-q${questionIndex}`);
  if (!item) throw new Error(`Missing question ${questionIndex}`);
  const attempt = makeAttempt(item, selectedAnswer, "bluebook", Date.now() - elapsedSeconds * 1000);
  return {
    ...attempt,
    elapsedMs: elapsedSeconds * 1000,
    timeSpentSeconds: elapsedSeconds,
  };
}

const records = [
  ...Array.from({ length: 36 }, (_, index) => question(index + 1)),
  question(101, { domain: "Standard English Conventions", skill: "Boundaries", difficulty: "Medium", prompt: "Which choice completes the sentence with correct punctuation?" }),
  question(102, { section: "Math", domain: "Geometry and Trigonometry", skill: "Circle theorems", difficulty: "Hard", prompt: "In the circle shown, what is the angle measure?" }),
  question(103, { domain: "Craft and Structure", skill: "Words in Context", difficulty: "Easy", prompt: "As used in the text, what does novel most nearly mean?" }),
];
const repo = createQuestionRepository(buildPublicStudentPackage(records, { contentVersion: "sat-optimization-test" }));

const riskyAttempts = [
  timedAttempt(3, "A", 70),
  timedAttempt(5, "B", 110),
  timedAttempt(1, "A", 90),
  timedAttempt(2, "B", 62),
];

const pacing = analyzeSatPacing(riskyAttempts, { moduleQuestionCount: 8, changedAnswerCount: 2 });
assert.equal(pacing.total, 8);
assert.equal(pacing.skipped, 4);
assert.equal(pacing.changedAnswers, 2);
assert.ok(pacing.flags.includes("skipped"));
assert.ok(pacing.flags.includes("changed_answer"));
assert.equal(pacing.pacingRisk, "high");

const evidenceTrap = classifySatTrap(riskyAttempts[2], repo.byId.get(riskyAttempts[2].questionId));
assert.equal(evidenceTrap.trapType, "evidence_trap");

const grammarAttempt = makeAttempt(repo.byId.get("sat-opt-q101")!, "A", "practice", Date.now() - 40_000);
const grammarTrap = classifySatTrap(grammarAttempt, repo.byId.get("sat-opt-q101"));
assert.equal(grammarTrap.trapType, "grammar_exception");

const geometryAttempt = makeAttempt(repo.byId.get("sat-opt-q102")!, "A", "practice", Date.now() - 40_000);
const geometryTrap = classifySatTrap(geometryAttempt, repo.byId.get("sat-opt-q102"));
assert.equal(geometryTrap.trapType, "geometry_visual_trap");

const supportReadiness = buildModule2Readiness(riskyAttempts, {
  moduleQuestionCount: 8,
  changedAnswerCount: 2,
  questionLookup: (id) => repo.byId.get(id),
});
assert.equal(supportReadiness.route, "support");
assert.equal(supportReadiness.readiness, "repair");
assert.ok(supportReadiness.trapSignals.length > 0);

const strongAttempts = [
  timedAttempt(5, "B", 45),
  timedAttempt(10, "B", 50),
  timedAttempt(15, "B", 55),
  timedAttempt(20, "B", 60),
  timedAttempt(25, "B", 65),
  timedAttempt(30, "B", 60),
];
const hardReadiness = buildModule2Readiness(strongAttempts, { moduleQuestionCount: 6 });
assert.equal(hardReadiness.route, "hard");
assert.equal(hardReadiness.readiness, "accelerate");

const cards = buildSatStrategyRemediationCards([riskyAttempts[2], grammarAttempt, geometryAttempt], {
  questionLookup: (id) => repo.byId.get(id),
});
assert.ok(cards.some((card) => card.trapType === "evidence_trap"));
assert.ok(cards.some((card) => card.trapType === "grammar_exception"));
assert.ok(cards.length <= 3);

const adaptiveHard = buildMixedAdaptiveSet(repo, { ...emptyLearnerState(), attempts: riskyAttempts }, {
  route: "hard",
  focusSkill: "Linear equations",
  limit: 12,
});
assert.equal(adaptiveHard.length, 12);
assert.ok(adaptiveHard.some((item) => item.difficulty === "Hard"));
assert.ok(adaptiveHard.some((item) => item.skill === "Linear equations"));

console.log("sat-optimization.test: pass");
