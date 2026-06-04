import type { AccountProfile, AccountState, SatAccount } from "./account-ops";
import { emptyLearnerState, estimatedBand, masteryRows, type AttemptRecord, type LearnerState } from "./student-learning";

export const CLASSROOM_ASSIGNMENTS_STORAGE_KEY = "sat-studio:teacher-classroom-assignments-v1";

export interface ClassroomStudentSummary {
  accountId: string;
  name: string;
  targetScore: number;
  attempts: number;
  accuracy: number;
  openMistakes: number;
  band: string;
  weakestSkill: string;
  risk: "needs_baseline" | "needs_repair" | "pacing_risk" | "on_track";
  recommendedAssignment: string;
}

type ClassroomRisk = ClassroomStudentSummary["risk"];

export interface TeacherClassroomModel {
  generatedAt: string;
  classCode: string;
  students: ClassroomStudentSummary[];
  metrics: Array<{ label: string; value: string; detail: string }>;
  priorityStudents: ClassroomStudentSummary[];
  recommendedClassAssignment: string;
  assignmentDraft: ClassroomAssignmentDraft;
}

export type ClassroomAssignmentMode = "diagnostic" | "remedial_sprint" | "proof_review" | "timed_mixed";

export interface ClassroomAssignmentDraft {
  classCode: string;
  title: string;
  focusSkill: string;
  mode: ClassroomAssignmentMode;
  targetStudentIds: string[];
  dueDate: string;
}

export interface ClassroomAssignment extends ClassroomAssignmentDraft {
  id: string;
  status: "assigned" | "completed";
  createdAt: string;
}

export interface ClassroomAssignmentEvidence {
  assignmentId: string;
  studentAccountId: string;
  submittedAt: string;
  attempts: number;
  correct: number;
  accuracy: number;
  wrongQuestionIds: string[];
  weakSkills: string[];
  lastAttemptAt: string;
}

function profileToLearner(profile: AccountProfile | undefined, account: SatAccount): LearnerState {
  const base = emptyLearnerState();
  if (!profile) return { ...base, targetScore: account.targetScore || base.targetScore };
  return {
    ...base,
    attempts: (Array.isArray(profile.attempts) ? profile.attempts : []) as unknown as AttemptRecord[],
    learningEvents: [],
    officialExamLogs: Array.isArray(profile.officialLogs) ? profile.officialLogs : [],
    knownVocabIds: Array.isArray(profile.vocabKnown) ? profile.vocabKnown.map(String) : [],
    vocabQuizAttempts: Array.isArray(profile.vocabQuizAttempts) ? profile.vocabQuizAttempts : [],
    savedQuestionIds: [],
    targetScore: account.targetScore || base.targetScore,
  };
}

function average(values: number[]): number {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function simpleHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function buildClassCode(state: AccountState): string {
  const activeStudentSeed = state.accounts
    .filter((account) => account.role === "student" && account.status === "active")
    .map((account) => account.id)
    .sort()
    .join("|");
  const checksum = simpleHash(activeStudentSeed || "sat-studio-classroom").toString(36).toUpperCase().padStart(5, "0").slice(0, 5);
  return `SAT-${checksum}`;
}

function assignmentFor(student: Omit<ClassroomStudentSummary, "recommendedAssignment">): string {
  if (student.attempts < 8) return "Giao diagnostic 20 câu";
  if (student.openMistakes > 0) return "Giao proof review sprint";
  if (student.weakestSkill !== "No weak skill yet") return `Giao sprint 10 câu: ${student.weakestSkill}`;
  return "Giao timed mixed SAT sprint";
}

function assignmentModeFor(student: ClassroomStudentSummary | undefined): ClassroomAssignmentMode {
  if (!student || student.attempts < 8) return "diagnostic";
  if (student.openMistakes > 0) return "proof_review";
  if (student.weakestSkill !== "No weak skill yet") return "remedial_sprint";
  return "timed_mixed";
}

function dueDateFrom(generatedAt: string, days: number): string {
  const date = new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildAssignmentDraft(classCode: string, priorityStudent: ClassroomStudentSummary | undefined, generatedAt: string): ClassroomAssignmentDraft {
  const mode = assignmentModeFor(priorityStudent);
  const focusSkill = priorityStudent?.weakestSkill && priorityStudent.weakestSkill !== "No weak skill yet" ? priorityStudent.weakestSkill : "SAT baseline";
  const titleByMode: Record<ClassroomAssignmentMode, string> = {
    diagnostic: "Diagnostic 20 câu",
    remedial_sprint: `Sprint 10 câu: ${focusSkill}`,
    proof_review: "Proof review sprint",
    timed_mixed: "Timed mixed SAT sprint",
  };
  return {
    classCode,
    title: titleByMode[mode],
    focusSkill,
    mode,
    targetStudentIds: priorityStudent ? [priorityStudent.accountId] : [],
    dueDate: dueDateFrom(generatedAt, mode === "diagnostic" ? 2 : 3),
  };
}

export function createClassroomAssignment(draft: ClassroomAssignmentDraft, options: { createdAt?: string; id?: string } = {}): ClassroomAssignment {
  const createdAt = options.createdAt || new Date().toISOString();
  const seed = `${draft.classCode}|${draft.title}|${draft.focusSkill}|${draft.mode}|${draft.dueDate}|${draft.targetStudentIds.join(",")}|${createdAt}`;
  return {
    ...draft,
    id: options.id || `assignment-${simpleHash(seed).toString(36)}`,
    createdAt,
    status: "assigned",
  };
}

export function buildAssignmentEvidenceFromAttempts(
  assignment: Pick<ClassroomAssignment, "id" | "focusSkill">,
  studentAccountId: string,
  attempts: AttemptRecord[],
  options: { submittedAt?: string; limit?: number } = {},
): ClassroomAssignmentEvidence {
  const limit = Math.max(1, Math.min(50, Number(options.limit || 25)));
  const focused = attempts
    .filter((attempt) => !assignment.focusSkill || attempt.skill === assignment.focusSkill || attempt.domain === assignment.focusSkill)
    .slice(-limit);
  const sample = focused.length ? focused : attempts.slice(-limit);
  const correct = sample.filter((attempt) => attempt.correct).length;
  const wrong = sample.filter((attempt) => !attempt.correct);
  const skillCounts = new Map<string, number>();
  wrong.forEach((attempt) => {
    const skill = attempt.skill || attempt.domain || "Unmapped SAT skill";
    skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
  });
  const weakSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([skill]) => skill);
  const attemptTimes = sample
    .map((attempt) => String(attempt.answeredAt || ""))
    .filter(Boolean)
    .sort();
  const lastAttemptAt = attemptTimes[attemptTimes.length - 1] || "";
  return {
    assignmentId: assignment.id,
    studentAccountId,
    submittedAt: options.submittedAt || new Date().toISOString(),
    attempts: sample.length,
    correct,
    accuracy: sample.length ? Math.round((correct / sample.length) * 100) : 0,
    wrongQuestionIds: wrong.map((attempt) => attempt.questionId).filter(Boolean),
    weakSkills,
    lastAttemptAt,
  };
}

export function buildTeacherClassroomModel(state: AccountState, options: { generatedAt?: string } = {}): TeacherClassroomModel {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const classCode = buildClassCode(state);
  const activeStudents = state.accounts.filter((account) => account.role === "student" && account.status === "active");
  const students = activeStudents.map((account) => {
    const learner = profileToLearner(state.profiles[account.id], account);
    const attempts = learner.attempts.length;
    const correct = learner.attempts.filter((attempt) => attempt.correct).length;
    const openMistakes = learner.attempts.filter((attempt) => !attempt.correct).length;
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
    const weakRows = masteryRows(learner);
    const weakestSkill = weakRows[0]?.skill || "No weak skill yet";
    const slowCorrect = learner.attempts.filter((attempt) => attempt.correct && attempt.elapsedMs > 90_000).length;
    const risk: ClassroomRisk =
      attempts < 8
        ? "needs_baseline"
        : openMistakes > 0
          ? "needs_repair"
          : slowCorrect > 0
            ? "pacing_risk"
            : "on_track";
    const summary = {
      accountId: account.id,
      name: account.name,
      targetScore: account.targetScore || 1500,
      attempts,
      accuracy,
      openMistakes,
      band: estimatedBand(learner),
      weakestSkill,
      risk,
    };
    return {
      ...summary,
      recommendedAssignment: assignmentFor(summary),
    };
  });

  const priorityRank: Record<ClassroomRisk, number> = { needs_repair: 0, needs_baseline: 1, pacing_risk: 2, on_track: 3 };
  const priorityStudents = [...students].sort((a, b) => priorityRank[a.risk] - priorityRank[b.risk] || b.openMistakes - a.openMistakes || a.name.localeCompare(b.name));
  const totalAttempts = students.reduce((sum, student) => sum + student.attempts, 0);
  const atRisk = students.filter((student) => student.risk !== "on_track").length;
  const averageAccuracy = average(students.filter((student) => student.attempts > 0).map((student) => student.accuracy));
  const recommendedClassAssignment = priorityStudents[0]?.recommendedAssignment || "Tạo bài diagnostic baseline";
  const assignmentDraft = buildAssignmentDraft(classCode, priorityStudents[0], generatedAt);

  return {
    generatedAt,
    classCode,
    students,
    priorityStudents: priorityStudents.slice(0, 5),
    recommendedClassAssignment,
    assignmentDraft,
    metrics: [
      { label: "Học sinh", value: String(students.length), detail: "Số học sinh active trong lớp." },
      { label: "Mã lớp", value: classCode, detail: "Mã chia sẻ để học sinh/phụ huynh tham gia lớp." },
      { label: "Cần can thiệp", value: String(atRisk), detail: "Học sinh cần baseline, sửa lỗi hoặc hỗ trợ pacing." },
      { label: "Lượt làm", value: String(totalAttempts), detail: "Tổng attempts đã đồng bộ/local trong lớp." },
      { label: "Accuracy TB", value: averageAccuracy ? `${averageAccuracy}%` : "--", detail: "Trung bình trên học sinh đã có attempts." },
    ],
  };
}
