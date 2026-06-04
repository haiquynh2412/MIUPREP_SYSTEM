import {
  getEnglishQuestionLearningReadinessIssues,
  type ContentQualitySeverity,
  type EnglishExamTest,
  type MockTest,
  type Passage,
  type QuestionItem,
} from './standard';

// Validates IELTS-style mock exam JSON data structure schemas cleanly.
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Performs rigorous structural and constraint validations on an IELTS-style JSON test schema.
 * Decouples content verification from app engines.
 */
export function validateIeltsTest(test: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!test) {
    errors.push({ path: 'root', message: 'Test content is null or undefined.', severity: 'error' });
    return errors;
  }

  // 1. Validate root level properties
  if (typeof test.id !== 'string' || !test.id.trim()) {
    errors.push({ path: 'id', message: 'Test ID must be a non-empty string.', severity: 'error' });
  }

  if (typeof test.title !== 'string' || !test.title.trim()) {
    errors.push({ path: 'title', message: 'Test title must be a non-empty string.', severity: 'error' });
  }

  if (test.type !== 'academic' && test.type !== 'general') {
    errors.push({ path: 'type', message: 'Test type must be "academic" or "general".', severity: 'error' });
  }

  const validSkills = ['listening', 'reading', 'writing', 'speaking', 'use_of_english'];
  if (!validSkills.includes(test.skill)) {
    errors.push({ path: 'skill', message: `Test skill must be one of: ${validSkills.join(', ')}`, severity: 'error' });
  }

  // 2. Validate sections
  if (!Array.isArray(test.sections) || test.sections.length === 0) {
    errors.push({ path: 'sections', message: 'Test must contain at least one section.', severity: 'error' });
    return errors;
  }

  test.sections.forEach((sec: any, secIdx: number) => {
    const secPath = `sections[${secIdx}]`;
    validateSection(sec, secPath, test, errors);
  });

  return errors;
}

function validateSection(sec: any, path: string, test: any, errors: ValidationError[]) {
  const skill = test.skill;
  const isCambridge = test.exam === 'cpe' || test.exam === 'cae' || (test.id && (test.id.includes('cpe') || test.id.includes('cae'))) || path.includes('cpe') || path.includes('cae');
  const isTopicOnlyBank = test.displayMode === 'topic';

  if (typeof sec.id !== 'string' || !sec.id.trim()) {
    errors.push({ path: `${path}.id`, message: 'Section ID must be a non-empty string.', severity: 'error' });
  }

  if (typeof sec.title !== 'string' || !sec.title.trim()) {
    errors.push({ path: `${path}.title`, message: 'Section title must be a non-empty string.', severity: 'error' });
  }

  // Skill specific rules
  if (skill === 'listening') {
    if (!isTopicOnlyBank && (typeof sec.audioPath !== 'string' || !sec.audioPath.trim())) {
      errors.push({ path: `${path}.audioPath`, message: 'Listening sections must specify an audioPath.', severity: 'error' });
    }
    if (sec.audioChecksum && typeof sec.audioChecksum !== 'string') {
      errors.push({ path: `${path}.audioChecksum`, message: 'Audio checksum must be a string.', severity: 'error' });
    }
    if (typeof sec.transcript !== 'string' || !sec.transcript.trim()) {
      errors.push({ path: `${path}.transcript`, message: 'Warning: Educational tapescript/transcript is missing for listening review.', severity: 'warning' });
    }
  }

  if (skill === 'reading') {
    if (typeof sec.passageHtml !== 'string' || !sec.passageHtml.trim()) {
      if (!isCambridge) {
        errors.push({ path: `${path}.passageHtml`, message: 'Reading sections must contain non-empty passageHtml.', severity: 'error' });
      } else {
        errors.push({ path: `${path}.passageHtml`, message: 'Warning: Reading section is missing passageHtml.', severity: 'warning' });
      }
    }
  }

  // Validate question groups
  if (!Array.isArray(sec.questionGroups) || sec.questionGroups.length === 0) {
    errors.push({ path: `${path}.questionGroups`, message: 'Section must contain at least one question group.', severity: 'error' });
    return;
  }

  sec.questionGroups.forEach((grp: any, grpIdx: number) => {
    const grpPath = `${path}.questionGroups[${grpIdx}]`;
    validateQuestionGroup(grp, grpPath, test, errors);
  });
}

function validateQuestionGroup(grp: any, path: string, test: any, errors: ValidationError[]) {
  if (typeof grp.id !== 'string' || !grp.id.trim()) {
    errors.push({ path: `${path}.id`, message: 'Question group ID must be a non-empty string.', severity: 'error' });
  }

  if (typeof grp.instruction !== 'string' || !grp.instruction.trim()) {
    errors.push({ path: `${path}.instruction`, message: 'Question group instruction must be a non-empty string.', severity: 'error' });
  }

  if (!Array.isArray(grp.questions) || grp.questions.length === 0) {
    errors.push({ path: `${path}.questions`, message: 'Question group must contain at least one question.', severity: 'error' });
    return;
  }

  grp.questions.forEach((q: any, qIdx: number) => {
    const qPath = `${path}.questions[${qIdx}]`;
    validateQuestion(q, qPath, test, errors);
  });
}

function validateQuestion(q: any, path: string, test: any, errors: ValidationError[]) {
  const isCambridge = test && (test.exam === 'cpe' || test.exam === 'cae' || (test.id && (test.id.includes('cpe') || test.id.includes('cae'))) || path.includes('cpe') || path.includes('cae'));

  if (typeof q.id !== 'string' || !q.id.trim()) {
    errors.push({ path: `${path}.id`, message: 'Question ID must be a non-empty string.', severity: 'error' });
  }

  const validTypes = ['multiple_choice', 'true_false_not_given', 'matching_headings', 'gap_fill', 'map_labeling', 'multiple_select', 'table_completion', 'gapped_text', 'multiple_matching'];
  if (!validTypes.includes(q.type)) {
    errors.push({ path: `${path}.type`, message: `Invalid question type: "${q.type}". Must be one of: ${validTypes.join(', ')}`, severity: 'error' });
  }

  if (typeof q.instruction !== 'string' || !q.instruction.trim()) {
    errors.push({ path: `${path}.instruction`, message: 'Question instruction must be a non-empty string.', severity: 'error' });
  }

  // Educational metadata warnings (does not block compilation)
  if (typeof q.explanation !== 'string' || !q.explanation.trim()) {
    errors.push({ path: `${path}.explanation`, message: 'Warning: Educational explanation is missing for this question.', severity: 'warning' });
  }
  if (typeof q.answerLocation !== 'string' || !q.answerLocation.trim()) {
    errors.push({ path: `${path}.answerLocation`, message: 'Warning: Educational answer location text reference is missing.', severity: 'warning' });
  }
  if (q.displayMode !== undefined) {
    const validModes = ['topic', 'test', 'both'];
    if (!validModes.includes(q.displayMode)) {
      errors.push({ path: `${path}.displayMode`, message: `Invalid displayMode: "${q.displayMode}". Must be one of: ${validModes.join(', ')}`, severity: 'error' });
    }
  }

  // Type-specific validations
  if (q.type === 'gap_fill' || q.type === 'table_completion') {
    if (typeof q.blankIndex !== 'number' || q.blankIndex <= 0) {
      if (!isCambridge) {
        errors.push({ path: `${path}.blankIndex`, message: 'Gap fill questions must have a positive blankIndex.', severity: 'error' });
      } else {
        errors.push({ path: `${path}.blankIndex`, message: 'Warning: Cambridge gap fill question is missing blankIndex.', severity: 'warning' });
      }
    }
  }

  if (q.type === 'multiple_choice') {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push({ path: `${path}.options`, message: 'Multiple choice questions must have at least 2 options.', severity: 'error' });
    }
  }

  if (q.type === 'gapped_text') {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push({ path: `${path}.options`, message: 'Gapped text questions must have at least 2 paragraph options.', severity: 'error' });
    }
  }

  if (q.type === 'multiple_matching') {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push({ path: `${path}.options`, message: 'Multiple matching questions must have at least 2 text options.', severity: 'error' });
    }
  }

  // Accepted Answers validation
  if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
    errors.push({ path: `${path}.acceptedAnswers`, message: 'Question must define at least one acceptedAnswer variant group.', severity: 'error' });
  } else {
    q.acceptedAnswers.forEach((variantGroup: any, grpIdx: number) => {
      if (!Array.isArray(variantGroup) || variantGroup.length === 0) {
        errors.push({ path: `${path}.acceptedAnswers[${grpIdx}]`, message: 'Variant group must be a non-empty array of strings.', severity: 'error' });
      } else {
        variantGroup.forEach((variant: any, varIdx: number) => {
          if (typeof variant !== 'string' || !variant.trim()) {
            errors.push({ path: `${path}.acceptedAnswers[${grpIdx}][${varIdx}]`, message: 'Answer variant must be a non-empty string.', severity: 'error' });
          }
        });
      }
    });
  }
}

export interface StandardContentBundle {
  questions?: QuestionItem[];
  mockTests?: MockTest[];
  passages?: Passage[];
}

export interface ContentQualityIssue {
  code: string;
  path: string;
  message: string;
  severity: ContentQualitySeverity;
  testId?: string;
  sectionId?: string;
  groupId?: string;
  questionId?: string;
}

export interface ContentQualitySummary {
  tests: number;
  questions: number;
  blockers: number;
  warnings: number;
  byCode: Record<string, number>;
  byProgram: Record<string, number>;
}

export function validateQuestionItem(item: QuestionItem, path = 'question'): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!item || typeof item !== 'object') {
    errors.push({ path, message: 'QuestionItem must be an object.', severity: 'error' });
    return errors;
  }

  requireNonEmptyString(item.id, `${path}.id`, 'QuestionItem id is required.', errors);
  requireNonEmptyString(item.domainId, `${path}.domainId`, 'QuestionItem domainId is required.', errors);
  requireStringArray(item.programIds, `${path}.programIds`, 'QuestionItem must target at least one program.', errors);
  requireStringArray(item.conceptIds, `${path}.conceptIds`, 'QuestionItem must map to at least one concept.', errors);
  requireStringArray(item.skillIds, `${path}.skillIds`, 'QuestionItem must map to at least one skill.', errors);
  requireNonEmptyString(item.type, `${path}.type`, 'QuestionItem type is required.', errors);
  requireNonEmptyString(item.prompt, `${path}.prompt`, 'QuestionItem prompt is required.', errors);
  requireNonEmptyString(item.difficulty, `${path}.difficulty`, 'QuestionItem difficulty is required.', errors);
  requireNonEmptyString(item.cognitiveLevel, `${path}.cognitiveLevel`, 'QuestionItem cognitiveLevel is required.', errors);

  if (item.choices !== undefined) {
    if (!Array.isArray(item.choices)) {
      errors.push({ path: `${path}.choices`, message: 'QuestionItem choices must be an array when provided.', severity: 'error' });
    } else {
      item.choices.forEach((choice, index) => {
        requireNonEmptyString(choice?.key, `${path}.choices[${index}].key`, 'Choice key is required.', errors);
        requireNonEmptyString(choice?.content, `${path}.choices[${index}].content`, 'Choice content is required.', errors);
      });
    }
  }

  if (!Array.isArray(item.misconceptionIds)) {
    errors.push({ path: `${path}.misconceptionIds`, message: 'QuestionItem misconceptionIds must be an array.', severity: 'error' });
  }
  if (!Array.isArray(item.tags)) {
    errors.push({ path: `${path}.tags`, message: 'QuestionItem tags must be an array.', severity: 'error' });
  }

  return errors;
}

export function validateMockTest(test: MockTest, knownQuestionIds = new Set<string>(), path = 'mockTest'): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!test || typeof test !== 'object') {
    errors.push({ path, message: 'MockTest must be an object.', severity: 'error' });
    return errors;
  }

  requireNonEmptyString(test.id, `${path}.id`, 'MockTest id is required.', errors);
  requireNonEmptyString(test.programId, `${path}.programId`, 'MockTest programId is required.', errors);
  requireNonEmptyString(test.title, `${path}.title`, 'MockTest title is required.', errors);
  requireStringArray(test.questionIds, `${path}.questionIds`, 'MockTest must contain question ids.', errors);
  validateQuestionRefs(test.questionIds, knownQuestionIds, `${path}.questionIds`, errors);

  if (test.durationMinutes !== undefined && (!Number.isFinite(test.durationMinutes) || test.durationMinutes <= 0)) {
    errors.push({ path: `${path}.durationMinutes`, message: 'MockTest durationMinutes must be positive when provided.', severity: 'error' });
  }

  if (test.sections !== undefined) {
    if (!Array.isArray(test.sections)) {
      errors.push({ path: `${path}.sections`, message: 'MockTest sections must be an array when provided.', severity: 'error' });
    } else {
      test.sections.forEach((section, index) => {
        requireNonEmptyString(section?.id, `${path}.sections[${index}].id`, 'MockTest section id is required.', errors);
        requireNonEmptyString(section?.title, `${path}.sections[${index}].title`, 'MockTest section title is required.', errors);
        requireStringArray(section?.questionIds, `${path}.sections[${index}].questionIds`, 'MockTest section must contain question ids.', errors);
        validateQuestionRefs(section?.questionIds || [], knownQuestionIds, `${path}.sections[${index}].questionIds`, errors);
      });
    }
  }

  return errors;
}

export function validatePassage(passage: Passage, path = 'passage'): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!passage || typeof passage !== 'object') {
    errors.push({ path, message: 'Passage must be an object.', severity: 'error' });
    return errors;
  }

  requireNonEmptyString(passage.id, `${path}.id`, 'Passage id is required.', errors);
  requireNonEmptyString(passage.domainId, `${path}.domainId`, 'Passage domainId is required.', errors);
  requireStringArray(passage.programIds, `${path}.programIds`, 'Passage must target at least one program.', errors);
  requireNonEmptyString(passage.text, `${path}.text`, 'Passage text is required.', errors);

  return errors;
}

export function validateStandardContentBundle(bundle: StandardContentBundle): ValidationError[] {
  const errors: ValidationError[] = [];
  const questions = bundle.questions || [];
  const mockTests = bundle.mockTests || [];
  const passages = bundle.passages || [];
  const questionIds = new Set<string>();

  questions.forEach((question, index) => {
    errors.push(...validateQuestionItem(question, `questions[${index}]`));
    if (questionIds.has(question.id)) {
      errors.push({ path: `questions[${index}].id`, message: `Duplicate QuestionItem id "${question.id}".`, severity: 'error' });
    }
    questionIds.add(question.id);
  });

  mockTests.forEach((test, index) => {
    errors.push(...validateMockTest(test, questionIds, `mockTests[${index}]`));
  });

  passages.forEach((passage, index) => {
    errors.push(...validatePassage(passage, `passages[${index}]`));
  });

  return errors;
}

export function auditEnglishExamTest(test: EnglishExamTest): ContentQualityIssue[] {
  const issues: ContentQualityIssue[] = [];
  const testId = String(test?.id || 'unknown');
  const schemaErrors = validateIeltsTest(test);

  schemaErrors.forEach((error) => {
    issues.push({
      code: `schema.${error.path}`,
      path: `tests.${testId}.${error.path}`,
      message: error.message,
      severity: error.severity === 'error' ? 'blocker' : 'warning',
      testId,
    });
  });

  for (const section of test.sections || []) {
    for (const group of section.questionGroups || []) {
      for (const question of group.questions || []) {
        const readinessIssues = getEnglishQuestionLearningReadinessIssues(test, section, group, question);
        readinessIssues.forEach((issue) => {
          issues.push({
            code: issue.code,
            path: issue.path || `tests.${testId}.sections.${section.id}.groups.${group.id}.questions.${question.id}`,
            message: issue.message,
            severity: issue.severity,
            testId,
            sectionId: section.id,
            groupId: group.id,
            questionId: question.id,
          });
        });
      }
    }
  }

  return dedupeQualityIssues(issues);
}

export function auditEnglishExamTests(tests: EnglishExamTest[]): ContentQualityIssue[] {
  return tests.flatMap(auditEnglishExamTest);
}

export function summarizeContentQualityIssues(tests: EnglishExamTest[], issues: ContentQualityIssue[]): ContentQualitySummary {
  const byCode: Record<string, number> = {};
  const byProgram: Record<string, number> = {};
  let questions = 0;

  tests.forEach((test) => {
    const program = String(test.exam || inferProgramFromText(`${test.id} ${test.title}`));
    byProgram[program] = (byProgram[program] || 0) + 1;
    questions += (test.sections || []).reduce(
      (sectionTotal, section) =>
        sectionTotal + (section.questionGroups || []).reduce((groupTotal, group) => groupTotal + (group.questions || []).length, 0),
      0,
    );
  });

  issues.forEach((issue) => {
    byCode[issue.code] = (byCode[issue.code] || 0) + 1;
  });

  return {
    tests: tests.length,
    questions,
    blockers: issues.filter((issue) => issue.severity === 'blocker').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    byCode,
    byProgram,
  };
}

function requireNonEmptyString(value: unknown, path: string, message: string, errors: ValidationError[]): void {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push({ path, message, severity: 'error' });
  }
}

function requireStringArray(value: unknown, path: string, message: string, errors: ValidationError[]): void {
  if (!Array.isArray(value) || value.length === 0 || value.some((entry) => typeof entry !== 'string' || !entry.trim())) {
    errors.push({ path, message, severity: 'error' });
  }
}

function validateQuestionRefs(questionIds: string[], knownQuestionIds: Set<string>, path: string, errors: ValidationError[]): void {
  if (!knownQuestionIds.size) return;
  questionIds.forEach((id, index) => {
    if (!knownQuestionIds.has(id)) {
      errors.push({ path: `${path}[${index}]`, message: `Unknown QuestionItem id "${id}".`, severity: 'error' });
    }
  });
}

function dedupeQualityIssues(issues: ContentQualityIssue[]): ContentQualityIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.severity}:${issue.code}:${issue.path}:${issue.questionId || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferProgramFromText(text: string): string {
  const normalized = text.toLowerCase();
  if (normalized.includes('cpe') || normalized.includes('proficiency')) return 'cpe';
  if (normalized.includes('cae') || normalized.includes('advanced')) return 'cae';
  if (normalized.includes('sat')) return 'sat';
  return 'ielts';
}
