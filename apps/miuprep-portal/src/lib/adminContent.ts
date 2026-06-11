import type {
  AdminEnglishExamTrack,
  AdminEnglishImportAdapterReport,
  AdminEnglishStandardStatus,
} from '@miuprep/content/src/admin-import';

export type EnglishExamTrack = AdminEnglishExamTrack;

export interface MathLesson {
  id: string;
  title: string;
  topic: string;
  count: number;
  status: 'Active';
}

export interface CasioTip {
  id: string;
  title: string;
  syntax: string;
  explanation: string;
}

export type ContentReviewStatus = 'unchecked' | 'checked' | 'needs_fix';
export type ContentReviewFilter = ContentReviewStatus | 'all';

export interface ContentReviewSummary {
  totalExams: number;
  totalQuestions: number;
  checked: number;
  needsFix: number;
  unchecked: number;
  completionRate: number;
}

export interface EditableExamQuestion {
  id: string;
  text: string;
  answer: string;
  options?: string[];
  note?: string;
}

export interface EditableExamSection {
  id: string;
  title: string;
  passageHtml?: string;
  transcript?: string;
  questions: EditableExamQuestion[];
}

export interface ImportedExam {
  id: string;
  title: string;
  exam: string;
  questions: number;
  duration: number;
  status: 'Active' | string;
  standardStatus?: AdminEnglishStandardStatus;
  standardReadyQuestions?: number;
  standardMockTests?: number;
  standardPassages?: number;
  standardErrorCount?: number;
  conceptIds?: string[];
  skillIds?: string[];
  editableSections?: EditableExamSection[];
  reviewStatus?: ContentReviewStatus;
  reviewer?: string;
  reviewedAt?: string;
  sourceJson?: string;
}

export interface ContentQuestionChange {
  id: string;
  sectionId: string;
  status: 'added' | 'edited' | 'removed' | 'unchanged';
  changedFields: string[];
  before?: EditableExamQuestion;
  after?: EditableExamQuestion;
}

export interface ContentExamChangeSet {
  schemaVersion: 'miuprep_content_change_set_v1';
  exportedAt: string;
  examId: string;
  exam: string;
  title: string;
  reviewStatus: ContentReviewStatus;
  reviewer: string;
  reviewedAt: string;
  summary: {
    sections: number;
    questions: number;
    changedQuestions: number;
    addedQuestions: number;
    removedQuestions: number;
    changedFields: string[];
  };
  questionChanges: ContentQuestionChange[];
  current: Pick<ImportedExam, 'id' | 'title' | 'exam' | 'duration' | 'questions' | 'reviewStatus' | 'reviewer' | 'reviewedAt' | 'editableSections'>;
  syncHint: string;
}

export interface ContentReviewChangeSetExport {
  schemaVersion: 'miuprep_content_review_export_v1';
  exportedAt: string;
  reviewer: string;
  track: string;
  totalExams: number;
  exams: ContentExamChangeSet[];
}

export interface DemoExamPayload {
  id: string;
  title: string;
  exam: string;
  duration: number;
  questions: Array<{
    id: string;
    text: string;
    answer: string;
  }>;
}

export type ExamImportResult =
  | { ok: true; exam: ImportedExam; adapter: AdminEnglishImportAdapterReport; successMessage: string }
  | { ok: false; error: string };

const DEFAULT_MATH_TOPIC = 'Đại số (Algebra)';

type AdminContentModule = typeof import('@miuprep/content/src/admin-import');

let adminContentModulePromise: Promise<AdminContentModule> | null = null;

function loadAdminContentModule(): Promise<AdminContentModule> {
  if (!adminContentModulePromise) {
    adminContentModulePromise = import('@miuprep/content/src/admin-import');
  }
  return adminContentModulePromise;
}

export function createCasioTip(
  input: { title: string; syntax: string; explanation: string },
  now = Date.now()
): CasioTip | null {
  const title = input.title.trim();
  const syntax = input.syntax.trim();

  if (!title || !syntax) {
    return null;
  }

  return {
    id: `tip-${now}`,
    title,
    syntax,
    explanation: input.explanation.trim() || 'Chưa có giải thích',
  };
}

export async function importExamFromJson(input: string, trackId: EnglishExamTrack): Promise<ExamImportResult> {
  const { parseAdminEnglishExamImportJson } = await loadAdminContentModule();
  return parseAdminEnglishExamImportJson(input, trackId);
}

export function createEditableExamSectionsFromJson(input: string): EditableExamSection[] {
  try {
    return createEditableExamSections(JSON.parse(input));
  } catch {
    return [];
  }
}

export function createEditableExamSections(raw: unknown): EditableExamSection[] {
  if (!isRecord(raw)) return [];

  if (Array.isArray(raw.questions)) {
    return [
      {
        id: 'main',
        title: readString(raw.title) || 'Main section',
        questions: raw.questions.map((question, index) => normalizeEditableQuestion(question, index)),
      },
    ];
  }

  if (!Array.isArray(raw.sections)) return [];

  return raw.sections.map((section, sectionIndex) => {
    const sectionRecord = isRecord(section) ? section : {};
    const questionGroups = Array.isArray(sectionRecord.questionGroups) ? sectionRecord.questionGroups : [];
    const directQuestions = Array.isArray(sectionRecord.questions) ? sectionRecord.questions : [];
    const groupedQuestions = questionGroups.flatMap((group) => {
      if (!isRecord(group) || !Array.isArray(group.questions)) return [];
      return group.questions;
    });
    const questions = (directQuestions.length ? directQuestions : groupedQuestions).map((question, questionIndex) =>
      normalizeEditableQuestion(question, questionIndex),
    );

    return {
      id: readString(sectionRecord.id) || `section-${sectionIndex + 1}`,
      title:
        readString(sectionRecord.title) ||
        readString(sectionRecord.name) ||
        readString(sectionRecord.part) ||
        `Section ${sectionIndex + 1}`,
      passageHtml: readString(sectionRecord.passageHtml) || readString(sectionRecord.passage),
      transcript: readString(sectionRecord.transcript),
      questions,
    };
  });
}

export function ensureEditableExamSections(exam: ImportedExam): EditableExamSection[] {
  if (exam.editableSections?.length) return exam.editableSections;
  return [
    {
      id: `${exam.id}-content`,
      title: 'Nội dung đề hiển thị',
      questions: [],
    },
  ];
}

export function countEditableExamQuestions(sections: EditableExamSection[]): number {
  return sections.reduce((total, section) => total + section.questions.length, 0);
}

export function summarizeContentReview(exams: ImportedExam[]): ContentReviewSummary {
  const summary = exams.reduce<ContentReviewSummary>(
    (result, exam) => {
      const status = normalizeReviewStatus(exam.reviewStatus) || 'unchecked';
      return {
        totalExams: result.totalExams + 1,
        totalQuestions: result.totalQuestions + readPositiveInteger(exam.questions, 0),
        checked: result.checked + (status === 'checked' ? 1 : 0),
        needsFix: result.needsFix + (status === 'needs_fix' ? 1 : 0),
        unchecked: result.unchecked + (status === 'unchecked' ? 1 : 0),
        completionRate: 0,
      };
    },
    { totalExams: 0, totalQuestions: 0, checked: 0, needsFix: 0, unchecked: 0, completionRate: 0 },
  );

  return {
    ...summary,
    completionRate: summary.totalExams ? Math.round((summary.checked / summary.totalExams) * 100) : 0,
  };
}

export function filterImportedExamsByReviewStatus(exams: ImportedExam[], filter: ContentReviewFilter): ImportedExam[] {
  if (filter === 'all') return exams;
  return exams.filter((exam) => (normalizeReviewStatus(exam.reviewStatus) || 'unchecked') === filter);
}

export function buildContentExamChangeSet(
  exam: ImportedExam,
  options: { previousExam?: ImportedExam | null; reviewer?: string; exportedAt?: string } = {},
): ContentExamChangeSet {
  const exportedAt = options.exportedAt || new Date().toISOString();
  const currentSections = ensureEditableExamSections(exam);
  const previousSections = resolvePreviousEditableSections(exam, options.previousExam);
  const questionChanges = diffEditableQuestions(currentSections, previousSections);
  const changedQuestionCount = questionChanges.filter((change) => change.status === 'edited' || change.status === 'added').length;
  const removedQuestionCount = questionChanges.filter((change) => change.status === 'removed').length;
  const changedFields = uniqueStrings(questionChanges.flatMap((change) => change.changedFields));

  return {
    schemaVersion: 'miuprep_content_change_set_v1',
    exportedAt,
    examId: exam.id,
    exam: exam.exam,
    title: exam.title,
    reviewStatus: normalizeReviewStatus(exam.reviewStatus) || 'unchecked',
    reviewer: options.reviewer || exam.reviewer || 'admincontent',
    reviewedAt: exam.reviewedAt || exportedAt,
    summary: {
      sections: currentSections.length,
      questions: countEditableExamQuestions(currentSections),
      changedQuestions: changedQuestionCount,
      addedQuestions: questionChanges.filter((change) => change.status === 'added').length,
      removedQuestions: removedQuestionCount,
      changedFields,
    },
    questionChanges,
    current: {
      id: exam.id,
      title: exam.title,
      exam: exam.exam,
      duration: exam.duration,
      questions: exam.questions,
      reviewStatus: normalizeReviewStatus(exam.reviewStatus) || 'unchecked',
      reviewer: options.reviewer || exam.reviewer,
      reviewedAt: exam.reviewedAt,
      editableSections: currentSections,
    },
    syncHint: 'Apply this change set back to the source JSON/test file, then rerun the content adapter guard before publishing.',
  };
}

export function buildContentReviewChangeSetExport(
  exams: ImportedExam[],
  options: { track?: string; reviewer?: string; exportedAt?: string } = {},
): ContentReviewChangeSetExport {
  const exportedAt = options.exportedAt || new Date().toISOString();
  return {
    schemaVersion: 'miuprep_content_review_export_v1',
    exportedAt,
    reviewer: options.reviewer || 'admincontent',
    track: options.track || 'all',
    totalExams: exams.length,
    exams: exams.map((exam) => buildContentExamChangeSet(exam, { reviewer: options.reviewer, exportedAt })),
  };
}

export const ADMIN_CONTENT_EXAMS_STORAGE_KEY = 'miuprep_admin_content_exams_v1';

interface BrowserStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadPersistedImportedExams(storage: BrowserStorageLike): ImportedExam[] {
  try {
    const raw = storage.getItem(ADMIN_CONTENT_EXAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((exam) => normalizePersistedImportedExam(exam))
      .filter((exam): exam is ImportedExam => Boolean(exam));
  } catch {
    return [];
  }
}

export function savePersistedImportedExams(storage: BrowserStorageLike, exams: ImportedExam[]): void {
  try {
    storage.setItem(ADMIN_CONTENT_EXAMS_STORAGE_KEY, JSON.stringify(exams));
  } catch {
    // Browser storage can fail in private mode or when quota is exceeded; UI state still remains live.
  }
}

export function mergeImportedExamState(seedExams: ImportedExam[], persistedExams: ImportedExam[]): ImportedExam[] {
  if (!persistedExams.length) return seedExams;

  const seedIds = new Set(seedExams.map((exam) => exam.id));
  const persistedById = new Map(persistedExams.map((exam) => [exam.id, exam]));
  const customPersistedExams = persistedExams.filter((exam) => !seedIds.has(exam.id));
  const mergedSeedExams = seedExams.map((exam) => ({ ...exam, ...persistedById.get(exam.id) }));

  return [...customPersistedExams, ...mergedSeedExams];
}

export function createDemoExam(trackId: EnglishExamTrack, now = Date.now()): DemoExamPayload {
  const exam = trackId.toUpperCase();

  return {
    id: `demo-${trackId}-${now}`,
    title: `Cam ${exam} Academic Mock Test 2026`,
    exam,
    duration: 60,
    questions: [
      { id: 'q1', text: 'Reading passage 1 question...', answer: 'A' },
      { id: 'q2', text: 'Use of English sentence transformation...', answer: 'B' },
    ],
  };
}

export function createMathLesson(
  input: { id: string; title: string; topic: string; count: number },
  now = Date.now()
): MathLesson | null {
  const title = input.title.trim();

  if (!title) {
    return null;
  }

  return {
    id: input.id.trim() || `math-custom-${now}`,
    title,
    topic: input.topic,
    count: input.count,
    status: 'Active',
  };
}

export function createEnglishExam(
  trackId: EnglishExamTrack,
  input: { id: string; title: string; questions: number; duration: number },
  now = Date.now()
): ImportedExam | null {
  const title = input.title.trim();

  if (!title) {
    return null;
  }

  return {
    id: input.id.trim() || `${trackId}-custom-${now}`,
    title,
    exam: trackId.toUpperCase(),
    questions: input.questions,
    duration: input.duration,
    status: 'Active',
    standardStatus: 'summary_only',
    standardReadyQuestions: 0,
    standardMockTests: 0,
    standardPassages: 0,
    standardErrorCount: 0,
    reviewStatus: 'unchecked',
    editableSections: [
      {
        id: `${input.id.trim() || `${trackId}-custom-${now}`}-content`,
        title: 'Nội dung đề hiển thị',
        questions: [],
      },
    ],
  };
}

export function createLatexMathLesson(
  input: { id: string; title: string; equation: string },
  now = Date.now()
): MathLesson | null {
  const title = input.title.trim();

  if (!title) {
    return null;
  }

  return {
    id: input.id.trim() || `latex-q-${now}`,
    title: `${title} [LaTeX Equation: ${input.equation.trim()}]`,
    topic: DEFAULT_MATH_TOPIC,
    count: 1,
    status: 'Active',
  };
}

function normalizeEditableQuestion(raw: unknown, index: number): EditableExamQuestion {
  const record = isRecord(raw) ? raw : {};
  const id = readString(record.id) || readString(record.questionId) || `q${index + 1}`;
  const text =
    readString(record.text) ||
    readString(record.prompt) ||
    readString(record.question) ||
    readString(record.stem) ||
    `Question ${index + 1}`;
  const answerValue = record.answer ?? record.correctAnswer ?? record.expectedAnswer ?? record.answers;
  const answer = Array.isArray(answerValue) ? answerValue.map(String).join(', ') : readString(answerValue);
  const optionsValue = record.options ?? record.choices;
  const options = Array.isArray(optionsValue) ? optionsValue.map((option) => String(option)) : undefined;

  return {
    id,
    text,
    answer,
    options,
    note: readString(record.note) || readString(record.explanation),
  };
}

function normalizePersistedImportedExam(raw: unknown): ImportedExam | null {
  if (!isRecord(raw)) return null;

  const id = readString(raw.id);
  const title = readString(raw.title);
  const exam = readString(raw.exam);
  if (!id || !title || !exam) return null;

  const editableSections = normalizePersistedEditableSections(raw.editableSections);
  const fallbackQuestionCount = editableSections.length ? countEditableExamQuestions(editableSections) : 1;
  const reviewStatus = normalizeReviewStatus(raw.reviewStatus);
  const standardStatus = normalizeStandardStatus(raw.standardStatus);

  return {
    id,
    title,
    exam,
    questions: readPositiveInteger(raw.questions, fallbackQuestionCount),
    duration: readPositiveInteger(raw.duration, 60),
    status: readString(raw.status) || 'Active',
    standardStatus,
    standardReadyQuestions: readOptionalInteger(raw.standardReadyQuestions),
    standardMockTests: readOptionalInteger(raw.standardMockTests),
    standardPassages: readOptionalInteger(raw.standardPassages),
    standardErrorCount: readOptionalInteger(raw.standardErrorCount),
    conceptIds: readStringArray(raw.conceptIds),
    skillIds: readStringArray(raw.skillIds),
    editableSections,
    reviewStatus,
    reviewer: readString(raw.reviewer) || undefined,
    reviewedAt: readString(raw.reviewedAt) || undefined,
    sourceJson: readString(raw.sourceJson) || undefined,
  };
}

function normalizePersistedEditableSections(raw: unknown): EditableExamSection[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((section, sectionIndex) => {
      if (!isRecord(section)) return null;
      const questionsValue = Array.isArray(section.questions) ? section.questions : [];
      return {
        id: readString(section.id) || `section-${sectionIndex + 1}`,
        title: readString(section.title) || `Section ${sectionIndex + 1}`,
        passageHtml: readString(section.passageHtml) || undefined,
        transcript: readString(section.transcript) || undefined,
        questions: questionsValue.map((question, questionIndex) => normalizeEditableQuestion(question, questionIndex)),
      };
    })
    .filter((section): section is EditableExamSection => Boolean(section));
}

function resolvePreviousEditableSections(exam: ImportedExam, previousExam?: ImportedExam | null): EditableExamSection[] {
  if (previousExam?.editableSections?.length) return previousExam.editableSections;
  if (exam.sourceJson) return createEditableExamSectionsFromJson(exam.sourceJson);
  return [];
}

function diffEditableQuestions(currentSections: EditableExamSection[], previousSections: EditableExamSection[]): ContentQuestionChange[] {
  const current = flattenEditableQuestions(currentSections);
  const previous = flattenEditableQuestions(previousSections);
  const currentByKey = new Map(current.map((item) => [item.key, item]));
  const previousByKey = new Map(previous.map((item) => [item.key, item]));
  const keys = uniqueStrings([...currentByKey.keys(), ...previousByKey.keys()]);

  return keys.map((key) => {
    const currentItem = currentByKey.get(key);
    const previousItem = previousByKey.get(key);
    if (currentItem && !previousItem) {
      return {
        id: currentItem.question.id,
        sectionId: currentItem.sectionId,
        status: 'added' as const,
        changedFields: ['question'],
        after: currentItem.question,
      };
    }
    if (!currentItem && previousItem) {
      return {
        id: previousItem.question.id,
        sectionId: previousItem.sectionId,
        status: 'removed' as const,
        changedFields: ['question'],
        before: previousItem.question,
      };
    }

    const changedFields = diffQuestionFields(previousItem?.question, currentItem?.question);
    return {
      id: currentItem?.question.id || previousItem?.question.id || key,
      sectionId: currentItem?.sectionId || previousItem?.sectionId || 'unknown',
      status: changedFields.length ? 'edited' : 'unchanged',
      changedFields,
      before: previousItem?.question,
      after: currentItem?.question,
    };
  });
}

function flattenEditableQuestions(sections: EditableExamSection[]): Array<{ key: string; sectionId: string; question: EditableExamQuestion }> {
  return sections.flatMap((section) =>
    section.questions.map((question, index) => ({
      key: `${section.id}::${question.id || index}`,
      sectionId: section.id,
      question,
    })),
  );
}

function diffQuestionFields(before?: EditableExamQuestion, after?: EditableExamQuestion): string[] {
  if (!before || !after) return [];
  const fields: Array<keyof EditableExamQuestion> = ['id', 'text', 'answer', 'note'];
  const changed = fields.filter((field) => normalizeComparable(before[field]) !== normalizeComparable(after[field]));
  if (normalizeComparable(before.options) !== normalizeComparable(after.options)) changed.push('options');
  return changed;
}

function normalizeComparable(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).join('\n');
  return String(value || '').trim();
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeReviewStatus(value: unknown): ContentReviewStatus | undefined {
  const status = readString(value);
  return status === 'unchecked' || status === 'checked' || status === 'needs_fix' ? status : undefined;
}

function normalizeStandardStatus(value: unknown): AdminEnglishStandardStatus | undefined {
  const status = readString(value);
  return status === 'learning_ready' || status === 'needs_review' || status === 'summary_only' ? status : undefined;
}

function readPositiveInteger(value: unknown, fallback: number): number {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 1) return fallback;
  return Math.floor(numberValue);
}

function readOptionalInteger(value: unknown): number | undefined {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) return undefined;
  return Math.floor(numberValue);
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.map((item) => readString(item)).filter(Boolean);
  return strings.length ? strings : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
