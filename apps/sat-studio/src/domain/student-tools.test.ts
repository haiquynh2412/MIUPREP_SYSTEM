import assert from "node:assert/strict";
import { buildPublicStudentPackage, type RawQuestionRecord } from "./public-content-contract";
import { createQuestionRepository, emptyLearnerState } from "./student-learning";
import {
  addOfficialExamLog,
  buildExamReviewModel,
  buildLessonLibrary,
  buildVocabModel,
  recordVocabQuizAttempt,
  removeOfficialExamLog,
  toggleVocabKnown,
} from "./student-tools";

function question(index: number, overrides: Partial<RawQuestionRecord> = {}): RawQuestionRecord {
  return {
    id: `q${index}`,
    section: index % 2 ? "Reading and Writing" : "Math",
    domain: index % 2 ? "Craft and Structure" : "Algebra",
    skill: index % 2 ? "Words in Context" : "Linear equations",
    difficulty: index % 3 ? "Medium" : "Hard",
    questionType: "multiple_choice",
    prompt: `Prompt ${index}`,
    choices: { A: "A", B: "B", C: "C", D: "D" },
    correctAnswer: "A",
    explanation: "A is correct.",
    ...overrides,
  };
}

const repo = createQuestionRepository(buildPublicStudentPackage(Array.from({ length: 20 }, (_, index) => question(index + 1)), { contentVersion: "tools-test" }));
let state = emptyLearnerState();

const lessons = buildLessonLibrary(repo, state, 4);
assert.equal(lessons.length, 2);
assert.ok(lessons.some((lesson) => lesson.title === "Words in Context"));
assert.ok(lessons.every((lesson) => lesson.resources.length > 0));

let vocab = buildVocabModel(state);
assert.ok(vocab.total >= 10);
assert.equal(vocab.known, 0);
assert.ok(vocab.current);
state = toggleVocabKnown(state, vocab.current!.id);
vocab = buildVocabModel(state);
assert.equal(vocab.known, 1);

const quiz = recordVocabQuizAttempt(state, vocab.entries[0], vocab.entries[0].definition);
state = quiz.state;
assert.equal(quiz.attempt.correct, true);
assert.equal(buildVocabModel(state).accuracy, 100);

state = addOfficialExamLog(state, {
  testDate: "2026-05-28",
  source: "Bluebook",
  rwScore: 730,
  mathScore: 760,
  notes: "First baseline.",
});
let exam = buildExamReviewModel(state);
assert.equal(exam.latestScore, 1490);
assert.equal(exam.latestRw, 730);
assert.equal(exam.latestMath, 760);
assert.equal(exam.targetGap, 10);
state = removeOfficialExamLog(state, exam.logs[0].id);
exam = buildExamReviewModel(state);
assert.equal(exam.logs.length, 0);
assert.equal(exam.trend, "no_data");

console.log("student-tools.test: pass");
