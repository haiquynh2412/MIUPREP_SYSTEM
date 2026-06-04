import { toQuestionItemsFromMiuMath, type MiuMathQuestion } from './standard';
import { validateStandardContentBundle, type ValidationError } from './validator';

export type MiuMathContentIssueSeverity = 'blocker' | 'warning';

export interface MiuMathContentIssue {
  code: string;
  severity: MiuMathContentIssueSeverity;
  message: string;
  path: string;
  questionId?: string;
  field?: string;
}

export interface MiuMathChangedQuestion {
  id: string;
  examName: string;
  category: string;
  subCategory: string;
  fields: string[];
  currentQuestionText: string;
  sourceQuestionText: string;
}

export interface MiuMathContentGuardReport {
  schemaVersion: 'miumath_content_guard_v1';
  generatedAt: string;
  input: {
    currentPath: string;
    sourcePath?: string;
    currentQuestions: number;
    sourceQuestions?: number;
  };
  stats: {
    exams: number;
    categories: number;
    subCategories: number;
    difficulty: Record<string, number>;
    byCategory: Record<string, number>;
    byProgram: Record<string, number>;
    byGrade: Record<string, number>;
    byTopic: Record<string, number>;
    byLevel: Record<string, number>;
  };
  comparison?: {
    added: string[];
    removed: string[];
    changed: MiuMathChangedQuestion[];
    changedByField: Record<string, number>;
  };
  qualitySummary: {
    questions: number;
    blockers: number;
    warnings: number;
    byCode: Record<string, number>;
  };
  adapter: {
    convertedItems: number;
    errors: ValidationError[];
    pass: boolean;
  };
  issues: MiuMathContentIssue[];
}

export interface BuildMiuMathContentGuardReportOptions {
  currentPath: string;
  sourcePath?: string;
  sourceQuestions?: MiuMathQuestion[];
  knownAssetPaths?: Set<string>;
  generatedAt?: string;
}

const REQUIRED_STRING_FIELDS: Array<keyof MiuMathQuestion> = [
  'id',
  'exam_name',
  'type',
  'difficulty',
  'category',
  'category_vn',
  'question_text',
  'correct_answer',
  'sub_category',
  'sub_category_vn',
];

const COMPARISON_FIELDS: Array<keyof MiuMathQuestion> = [
  'exam_id',
  'exam_name',
  'type',
  'difficulty',
  'category',
  'category_vn',
  'question_text',
  'options',
  'correct_answer',
  'explanation',
  'sub_category',
  'sub_category_vn',
  'image',
];

const VALID_TYPES = new Set(['multiple_choice', 'fill_in_the_blank']);
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

export function buildMiuMathContentGuardReport(
  currentQuestions: MiuMathQuestion[],
  options: BuildMiuMathContentGuardReportOptions,
): MiuMathContentGuardReport {
  const issues = auditMiuMathQuestions(currentQuestions, options.knownAssetPaths);
  const items = toQuestionItemsFromMiuMath(currentQuestions);
  const adapterErrors = validateStandardContentBundle({ questions: items });

  return {
    schemaVersion: 'miumath_content_guard_v1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    input: {
      currentPath: options.currentPath,
      sourcePath: options.sourcePath,
      currentQuestions: currentQuestions.length,
      sourceQuestions: options.sourceQuestions?.length,
    },
    stats: summarizeMiuMathQuestions(currentQuestions),
    comparison: options.sourceQuestions
      ? compareMiuMathQuestions(currentQuestions, options.sourceQuestions)
      : undefined,
    qualitySummary: summarizeMiuMathIssues(currentQuestions.length, issues),
    adapter: {
      convertedItems: items.length,
      errors: adapterErrors,
      pass: adapterErrors.length === 0,
    },
    issues,
  };
}

export function auditMiuMathQuestions(
  questions: MiuMathQuestion[],
  knownAssetPaths = new Set<string>(),
): MiuMathContentIssue[] {
  const issues: MiuMathContentIssue[] = [];
  const seenIds = new Set<string>();

  questions.forEach((question, index) => {
    const id = typeof question?.id === 'string' && question.id.trim() ? question.id : `index_${index}`;
    const path = `questions[${index}]`;

    if (!question || typeof question !== 'object') {
      issues.push({
        code: 'schema.question_object',
        severity: 'blocker',
        message: 'Question must be an object.',
        path,
      });
      return;
    }

    if (seenIds.has(id)) {
      issues.push({
        code: 'schema.duplicate_id',
        severity: 'blocker',
        message: `Duplicate question id "${id}".`,
        path: `${path}.id`,
        questionId: id,
        field: 'id',
      });
    }
    seenIds.add(id);

    REQUIRED_STRING_FIELDS.forEach((field) => {
      const value = question[field];
      if (typeof value !== 'string' || !value.trim()) {
        issues.push({
          code: `schema.${field}`,
          severity: 'blocker',
          message: `${String(field)} must be a non-empty string.`,
          path: `${path}.${String(field)}`,
          questionId: id,
          field: String(field),
        });
      }
    });

    if (!Number.isInteger(question.exam_id) || question.exam_id <= 0) {
      issues.push({
        code: 'schema.exam_id',
        severity: 'blocker',
        message: 'exam_id must be a positive integer.',
        path: `${path}.exam_id`,
        questionId: id,
        field: 'exam_id',
      });
    }

    if (!VALID_TYPES.has(String(question.type))) {
      issues.push({
        code: 'schema.type',
        severity: 'blocker',
        message: `Unsupported question type "${String(question.type)}".`,
        path: `${path}.type`,
        questionId: id,
        field: 'type',
      });
    }

    if (!VALID_DIFFICULTIES.has(String(question.difficulty))) {
      issues.push({
        code: 'schema.difficulty',
        severity: 'warning',
        message: `Unexpected difficulty "${String(question.difficulty)}".`,
        path: `${path}.difficulty`,
        questionId: id,
        field: 'difficulty',
      });
    }

    auditQuestionType(question, path, id, issues);
    auditTextContent(question, path, id, issues);
    auditImage(question, path, id, knownAssetPaths, issues);
  });

  return dedupeMiuMathIssues(issues);
}

export function compareMiuMathQuestions(
  currentQuestions: MiuMathQuestion[],
  sourceQuestions: MiuMathQuestion[],
): MiuMathContentGuardReport['comparison'] {
  const currentById = new Map(currentQuestions.map((question) => [question.id, question]));
  const sourceById = new Map(sourceQuestions.map((question) => [question.id, question]));
  const changed: MiuMathChangedQuestion[] = [];
  const changedByField: Record<string, number> = {};

  currentQuestions.forEach((question) => {
    const sourceQuestion = sourceById.get(question.id);
    if (!sourceQuestion) return;

    const fields = COMPARISON_FIELDS.filter(
      (field) => JSON.stringify(question[field]) !== JSON.stringify(sourceQuestion[field]),
    ).map(String);

    if (!fields.length) return;
    fields.forEach((field) => {
      changedByField[field] = (changedByField[field] || 0) + 1;
    });

    changed.push({
      id: question.id,
      examName: question.exam_name || sourceQuestion.exam_name || '',
      category: question.category || sourceQuestion.category || '',
      subCategory: question.sub_category || sourceQuestion.sub_category || '',
      fields,
      currentQuestionText: previewText(question.question_text),
      sourceQuestionText: previewText(sourceQuestion.question_text),
    });
  });

  return {
    added: currentQuestions.filter((question) => !sourceById.has(question.id)).map((question) => question.id),
    removed: sourceQuestions.filter((question) => !currentById.has(question.id)).map((question) => question.id),
    changed,
    changedByField,
  };
}

export function summarizeMiuMathQuestions(questions: MiuMathQuestion[]): MiuMathContentGuardReport['stats'] {
  const exams = new Set<number>();
  const categories = new Set<string>();
  const subCategories = new Set<string>();
  const difficulty: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byProgram: Record<string, number> = {};
  const byGrade: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  const byLevel: Record<string, number> = {};

  questions.forEach((question) => {
    exams.add(question.exam_id);
    categories.add(question.category);
    subCategories.add(`${question.category}:${question.sub_category}`);
    difficulty[question.difficulty] = (difficulty[question.difficulty] || 0) + 1;
    byCategory[question.category] = (byCategory[question.category] || 0) + 1;
  });

  toQuestionItemsFromMiuMath(questions).forEach((item) => {
    item.programIds.forEach((programId) => {
      byProgram[programId] = (byProgram[programId] || 0) + 1;
    });

    const grade = String(item.metadata?.grade || 'unknown');
    const topic = String(item.metadata?.topicId || 'unknown');
    const level = String(item.metadata?.level || 'unknown');
    byGrade[grade] = (byGrade[grade] || 0) + 1;
    byTopic[topic] = (byTopic[topic] || 0) + 1;
    byLevel[level] = (byLevel[level] || 0) + 1;
  });

  return {
    exams: exams.size,
    categories: categories.size,
    subCategories: subCategories.size,
    difficulty,
    byCategory,
    byProgram,
    byGrade,
    byTopic,
    byLevel,
  };
}

export function summarizeMiuMathIssues(
  questions: number,
  issues: MiuMathContentIssue[],
): MiuMathContentGuardReport['qualitySummary'] {
  const byCode: Record<string, number> = {};
  issues.forEach((issue) => {
    byCode[issue.code] = (byCode[issue.code] || 0) + 1;
  });

  return {
    questions,
    blockers: issues.filter((issue) => issue.severity === 'blocker').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    byCode,
  };
}

function auditQuestionType(
  question: MiuMathQuestion,
  path: string,
  id: string,
  issues: MiuMathContentIssue[],
): void {
  if (question.type === 'multiple_choice') {
    if (!Array.isArray(question.options)) {
      issues.push({
        code: 'multiple_choice.options_missing',
        severity: 'blocker',
        message: 'Multiple choice question must have options.',
        path: `${path}.options`,
        questionId: id,
        field: 'options',
      });
      return;
    }

    if (question.options.length < 2) {
      issues.push({
        code: 'multiple_choice.options_too_few',
        severity: 'blocker',
        message: 'Multiple choice question must have at least 2 options.',
        path: `${path}.options`,
        questionId: id,
        field: 'options',
      });
    }

    if (question.options.length !== 4) {
      issues.push({
        code: 'multiple_choice.options_not_four',
        severity: 'warning',
        message: 'MiuMath multiple choice convention is 4 options.',
        path: `${path}.options`,
        questionId: id,
        field: 'options',
      });
    }

    const optionKeys = new Set<string>();
    question.options.forEach((option, index) => {
      if (typeof option?.key !== 'string' || !option.key.trim()) {
        issues.push({
          code: 'multiple_choice.option_key',
          severity: 'blocker',
          message: 'Option key must be a non-empty string.',
          path: `${path}.options[${index}].key`,
          questionId: id,
          field: 'options',
        });
      }

      if (typeof option?.content !== 'string' || !option.content.trim()) {
        issues.push({
          code: 'multiple_choice.option_content',
          severity: 'blocker',
          message: 'Option content must be a non-empty string.',
          path: `${path}.options[${index}].content`,
          questionId: id,
          field: 'options',
        });
      }

      const key = String(option?.key || '').trim();
      if (key) {
        if (optionKeys.has(key)) {
          issues.push({
            code: 'multiple_choice.duplicate_option_key',
            severity: 'blocker',
            message: `Duplicate option key "${key}".`,
            path: `${path}.options[${index}].key`,
            questionId: id,
            field: 'options',
          });
        }
        optionKeys.add(key);
      }
    });

    const answer = String(question.correct_answer || '').trim();
    if (answer && !optionKeys.has(answer)) {
      issues.push({
        code: 'multiple_choice.answer_not_in_options',
        severity: 'blocker',
        message: `Correct answer "${answer}" does not match any option key.`,
        path: `${path}.correct_answer`,
        questionId: id,
        field: 'correct_answer',
      });
    }
  }

  if (question.type === 'fill_in_the_blank' && Array.isArray(question.options) && question.options.length) {
    issues.push({
      code: 'fill_in_the_blank.options_present',
      severity: 'warning',
      message: 'Fill-in-the-blank question usually should not define MCQ options.',
      path: `${path}.options`,
      questionId: id,
      field: 'options',
    });
  }
}

function auditTextContent(
  question: MiuMathQuestion,
  path: string,
  id: string,
  issues: MiuMathContentIssue[],
): void {
  const textFields: Array<[string, unknown]> = [
    ['question_text', question.question_text],
    ['explanation', stringifyExplanation(question.explanation)],
    ...(Array.isArray(question.options)
      ? question.options.map((option, index): [string, unknown] => [`options[${index}].content`, option.content])
      : []),
  ];

  textFields.forEach(([field, rawValue]) => {
    const value = typeof rawValue === 'string' ? rawValue : '';
    if (!value) return;

    if (hasSuspiciousPlaceholder(value)) {
      issues.push({
        code: 'content.placeholder_text',
        severity: 'blocker',
        message: 'Content contains suspicious placeholder text.',
        path: `${path}.${field}`,
        questionId: id,
        field,
      });
    }

    if (countUnescapedDollars(value) % 2 !== 0) {
      issues.push({
        code: 'content.unbalanced_latex_dollar',
        severity: 'warning',
        message: 'Text has an odd number of unescaped dollar signs; KaTeX may render incorrectly.',
        path: `${path}.${field}`,
        questionId: id,
        field,
      });
    }
  });
}

function auditImage(
  question: MiuMathQuestion,
  path: string,
  id: string,
  knownAssetPaths: Set<string>,
  issues: MiuMathContentIssue[],
): void {
  if (!question.image) return;
  const normalized = normalizeAssetPath(question.image);
  if (!normalized) {
    issues.push({
      code: 'image.path_invalid',
      severity: 'blocker',
      message: 'Image path must point to a local public asset.',
      path: `${path}.image`,
      questionId: id,
      field: 'image',
    });
    return;
  }

  if (knownAssetPaths.size && !knownAssetPaths.has(normalized)) {
    issues.push({
      code: 'image.file_missing',
      severity: 'blocker',
      message: `Image file "${question.image}" is missing from the public asset folder.`,
      path: `${path}.image`,
      questionId: id,
      field: 'image',
    });
  }
}

function normalizeAssetPath(value: string): string {
  const trimmed = value.trim().replace(/\\/g, '/');
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return '';
  return trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
}

function stringifyExplanation(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return JSON.stringify(value);
  return '';
}

function hasSuspiciousPlaceholder(value: string): boolean {
  return /\b(TODO|TBD|undefined|NaN|\[object Object\])\b/i.test(value);
}

function countUnescapedDollars(value: string): number {
  let count = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '$' && value[index - 1] !== '\\') count += 1;
  }
  return count;
}

function previewText(value: unknown, maxLength = 160): string {
  const text = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function dedupeMiuMathIssues(issues: MiuMathContentIssue[]): MiuMathContentIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.severity}:${issue.code}:${issue.path}:${issue.questionId || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
