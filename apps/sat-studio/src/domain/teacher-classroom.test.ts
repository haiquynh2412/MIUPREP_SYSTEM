import assert from "node:assert/strict";
import { buildAssignmentEvidenceFromAttempts, buildTeacherClassroomModel, createClassroomAssignment } from "./teacher-classroom";
import { DEFAULT_ACCOUNTS, emptyProfile, type AccountState } from "./account-ops";

const state: AccountState = {
  version: 2,
  language: "en",
  accounts: DEFAULT_ACCOUNTS,
  activeAccountId: "content-admin",
  raw: {},
  storage: { exists: true, chunked: false, chunks: 0, missingChunks: [], length: 0, approximateBytes: 0 },
  profiles: {
    "student-demo": {
      ...emptyProfile(),
      attempts: [
        { id: "a1", correct: false, skill: "Linear equations", domain: "Algebra", section: "Math", difficulty: "Medium", elapsedMs: 45000 },
        { id: "a2", correct: true, skill: "Linear equations", domain: "Algebra", section: "Math", difficulty: "Hard", elapsedMs: 93000 },
        { id: "a3", correct: true, skill: "Words in Context", domain: "Craft and Structure", section: "Reading and Writing", difficulty: "Medium", elapsedMs: 40000 },
      ],
    },
  },
};

const model = buildTeacherClassroomModel(state, { generatedAt: "2026-05-29T00:00:00.000Z" });

assert.equal(model.students.length, 1);
assert.equal(model.metrics[0].value, "1");
assert.match(model.classCode, /^SAT-[A-Z0-9]{5}$/);
assert.equal(model.priorityStudents[0].accountId, "student-demo");
assert.equal(model.priorityStudents[0].risk, "needs_baseline");
assert.equal(model.priorityStudents[0].recommendedAssignment, "Giao diagnostic 20 câu");
assert.equal(model.recommendedClassAssignment, "Giao diagnostic 20 câu");
assert.equal(model.assignmentDraft.classCode, model.classCode);
assert.equal(model.assignmentDraft.mode, "diagnostic");
assert.deepEqual(model.assignmentDraft.targetStudentIds, ["student-demo"]);

const assignment = createClassroomAssignment(model.assignmentDraft, { createdAt: "2026-05-29T00:00:00.000Z" });
assert.equal(assignment.status, "assigned");
assert.equal(assignment.classCode, model.classCode);

const evidence = buildAssignmentEvidenceFromAttempts(
  { id: "assign-1", focusSkill: "Linear equations" },
  "student-demo",
  [
    { id: "a1", questionId: "q1", correct: false, skill: "Linear equations", domain: "Algebra", answeredAt: "2026-05-29T00:00:00.000Z" },
    { id: "a2", questionId: "q2", correct: true, skill: "Linear equations", domain: "Algebra", answeredAt: "2026-05-29T00:02:00.000Z" },
    { id: "a3", questionId: "q3", correct: false, skill: "Words in Context", domain: "Craft and Structure", answeredAt: "2026-05-29T00:03:00.000Z" },
  ] as any,
  { submittedAt: "2026-05-29T00:05:00.000Z" },
);
assert.equal(evidence.assignmentId, "assign-1");
assert.equal(evidence.attempts, 2);
assert.equal(evidence.correct, 1);
assert.equal(evidence.accuracy, 50);
assert.deepEqual(evidence.wrongQuestionIds, ["q1"]);
assert.deepEqual(evidence.weakSkills, ["Linear equations"]);

console.log("teacher-classroom.test: pass");
