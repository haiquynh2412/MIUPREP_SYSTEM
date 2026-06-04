import { buildEnglishLearningCatalog } from './english-learning';
import type { EnglishExamTest } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type AdminEnglishExamTrack = 'ielts' | 'cae' | 'cpe';
export type AdminEnglishStandardStatus = 'summary_only' | 'learning_ready' | 'needs_review';

export interface AdminImportedExamSummary {
  id: string;
  title: string;
  exam: string;
  questions: number;
  duration: number;
  status: 'Active';
  standardStatus: AdminEnglishStandardStatus;
  standardReadyQuestions: number;
  standardMockTests: number;
  standardPassages: number;
  standardErrorCount: number;
}

export interface AdminEnglishImportAdapterReport {
  attempted: boolean;
  status: AdminEnglishStandardStatus;
  readyQuestions: number;
  mockTests: number;
  passages: number;
  blockers: number;
  warnings: number;
  errors: ValidationError[];
}

export type AdminEnglishExamImportResult =
  | {
      ok: true;
      exam: AdminImportedExamSummary;
      adapter: AdminEnglishImportAdapterReport;
      successMessage: string;
    }
  | {
      ok: false;
      error: string;
    };

export function parseAdminEnglishExamImportJson(input: string, trackId: AdminEnglishExamTrack): AdminEnglishExamImportResult {
  const rawJson = input.trim();

  if (!rawJson) {
    return { ok: false, error: 'Nội dung JSON không được để trống meow!' };
  }

  try {
    return normalizeAdminEnglishExamImport(JSON.parse(rawJson), trackId);
  } catch {
    return {
      ok: false,
      error: 'Lỗi cú pháp: Chuỗi nhập vào không phải là định dạng JSON hợp lệ meow! 😿',
    };
  }
}

export function normalizeAdminEnglishExamImport(raw: unknown, trackId: AdminEnglishExamTrack): AdminEnglishExamImportResult {
  if (!isRecord(raw)) {
    return {
      ok: false,
      error: "Lỗi cấu trúc: File JSON phải là một object chứa 'id', 'title', 'exam' meow!",
    };
  }

  const id = readTrimmedString(raw.id);
  const title = readTrimmedString(raw.title);
  const exam = readTrimmedString(raw.exam);

  if (!id || !title || !exam) {
    return {
      ok: false,
      error: "Lỗi cấu trúc: File JSON phải chứa các trường bắt buộc 'id', 'title', 'exam' meow!",
    };
  }

  if (exam.toLowerCase() !== trackId) {
    return {
      ok: false,
      error: `Lỗi tương thích: Đề thi này dành cho ${exam.toUpperCase()} nhưng bạn đang nhập vào tab ${trackId.toUpperCase()} meow!`,
    };
  }

  const adapter = buildAdminEnglishAdapterReport(raw, trackId);
  const examRecord: AdminImportedExamSummary = {
    id,
    title,
    exam: exam.toUpperCase(),
    questions: countQuestions(raw),
    duration: readPositiveNumber(raw.duration, readPositiveNumber(raw.durationMinutes, 60)),
    status: 'Active',
    standardStatus: adapter.status,
    standardReadyQuestions: adapter.readyQuestions,
    standardMockTests: adapter.mockTests,
    standardPassages: adapter.passages,
    standardErrorCount: adapter.errors.length,
  };

  return {
    ok: true,
    exam: examRecord,
    adapter,
    successMessage: `Đã nhập đề thi thành công: "${examRecord.title}" (${examRecord.exam})! 🚀`,
  };
}

function buildAdminEnglishAdapterReport(raw: Record<string, unknown>, trackId: AdminEnglishExamTrack): AdminEnglishImportAdapterReport {
  if (!Array.isArray(raw.sections)) {
    return {
      attempted: false,
      status: 'summary_only',
      readyQuestions: 0,
      mockTests: 0,
      passages: 0,
      blockers: 0,
      warnings: 0,
      errors: [],
    };
  }

  const test = { ...raw, exam: trackId } as unknown as EnglishExamTest;
  const catalog = buildEnglishLearningCatalog([test], { programIds: [trackId] });
  const errors = validateStandardContentBundle({
    questions: catalog.items,
    mockTests: catalog.mockTests,
    passages: catalog.passages,
  });
  const status: AdminEnglishStandardStatus = errors.length || catalog.qualitySummary.blockers ? 'needs_review' : 'learning_ready';

  return {
    attempted: true,
    status,
    readyQuestions: catalog.items.length,
    mockTests: catalog.mockTests.length,
    passages: catalog.passages.length,
    blockers: catalog.qualitySummary.blockers,
    warnings: catalog.qualitySummary.warnings,
    errors,
  };
}

function countQuestions(raw: Record<string, unknown>): number {
  if (Array.isArray(raw.questions)) return raw.questions.length;
  const totalQuestions = readPositiveNumber(raw.totalQuestions, 0);
  if (totalQuestions) return totalQuestions;

  if (!Array.isArray(raw.sections)) return 40;

  const sectionQuestionCount = raw.sections.reduce((total, section) => {
    if (!isRecord(section) || !Array.isArray(section.questionGroups)) return total;
    return (
      total +
      section.questionGroups.reduce((sectionTotal, group) => {
        if (!isRecord(group) || !Array.isArray(group.questions)) return sectionTotal;
        return sectionTotal + group.questions.length;
      }, 0)
    );
  }, 0);

  return sectionQuestionCount || 40;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readPositiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}
