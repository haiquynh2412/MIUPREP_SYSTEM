import type { CognitiveLevel, ContentDomainId, QuestionChoice, QuestionItem } from './standard';
import { queryContentItems } from './content-query';
import { validateQuestionItem, type ValidationError } from './validator';

export type SatJsonPrimitive = string | number | boolean | null;
export type SatJsonValue = SatJsonPrimitive | SatJsonValue[] | { [key: string]: SatJsonValue };

export interface SatPublicQuestionItem {
  id: string;
  section: string;
  domain: string;
  skill: string;
  difficulty: string;
  questionType: string;
  type?: string;
  targetBand?: string;
  modulePlacement?: string;
  estimatedTimeSeconds?: number;
  practicePool?: string;
  tags?: string[] | string;
  calculator?: string | boolean;
  calculatorTag?: string;
  desmos?: string | boolean;
  desmosTag?: string;
  toolTag?: string;
  mathTool?: string;
  lessonKey?: string;
  vocab?: string[] | string;
  prompt: string;
  choices?: Record<string, SatJsonValue> | SatJsonValue[];
  correctAnswer?: SatJsonValue;
  acceptableAnswers?: SatJsonValue;
  answerFormat?: string;
  explanation?: string | Record<string, unknown>;
}

export interface SatPublicStudentPackage {
  schemaVersion: string;
  contractVersion: string;
  contentVersion: string;
  generatedAt: string;
  manifest?: {
    total?: number;
    counts?: Record<string, Record<string, number>>;
  };
  items: SatPublicQuestionItem[];
}

export interface SatQuestionReadinessIssue {
  code: string;
  severity: 'blocker' | 'warning';
  message: string;
  questionId?: string;
  path: string;
}

export interface SatContentReadinessSnapshot {
  schemaVersion: 'sat_content_guard_v1';
  generatedAt: string;
  contentVersion: string;
  totalItems: number;
  uniqueIds: number;
  duplicateIds: number;
  learningReadyItems: number;
  blockerItems: number;
  warningItems: number;
  adapter: {
    convertedItems: number;
    validationErrors: number;
    pass: boolean;
  };
  bySection: Record<string, number>;
  byDomain: Record<string, number>;
  byDifficulty: Record<string, number>;
  byQuestionType: Record<string, number>;
  byPracticePool: Record<string, number>;
  topIssues: Record<string, number>;
}

export interface SatLearningCatalogCoverage {
  totalQuestions: number;
  readyQuestions: number;
  bySection: Record<string, number>;
  byDomain: Record<string, number>;
  bySkill: Record<string, number>;
  byDifficulty: Record<string, number>;
  byPracticePool: Record<string, number>;
}

export interface SatLearningCatalog {
  items: QuestionItem[];
  byId: Map<string, QuestionItem>;
  coverage: SatLearningCatalogCoverage;
}

export interface SatDiagnosticSelectionOptions {
  limit?: number;
  section?: string;
  domain?: string;
}

export interface SatPracticeSelectionOptions extends SatDiagnosticSelectionOptions {
  skillIds?: string[];
  attemptedItemIds?: string[];
  difficulty?: string;
  includeRemedialPool?: boolean;
}

interface SatTagMap {
  domainId: ContentDomainId;
  conceptIds: string[];
  skillIds: string[];
  misconceptionIds?: string[];
  cognitiveLevel?: CognitiveLevel;
}

const SAT_MATH_DOMAIN_MAP: Record<string, SatTagMap> = {
  algebra: {
    domainId: 'mathematics',
    conceptIds: ['math.linear_equation', 'math.algebraic_expression'],
    skillIds: ['math.solve_linear_equation', 'math.solve_system', 'math.simplify_expression'],
    cognitiveLevel: 'apply',
  },
  'advanced math': {
    domainId: 'mathematics',
    conceptIds: ['math.quadratic_equation', 'math.functions_graphs', 'math.algebraic_expression'],
    skillIds: ['math.solve_quadratic_by_factor', 'math.analyze_function_graph', 'math.simplify_expression'],
    cognitiveLevel: 'analyze',
  },
  'problem-solving and data analysis': {
    domainId: 'mathematics',
    conceptIds: ['math.statistics', 'math.probability', 'math.word_problem_modeling'],
    skillIds: ['math.interpret_statistics', 'math.compute_probability', 'math.model_word_problem'],
    cognitiveLevel: 'analyze',
  },
  'geometry and trigonometry': {
    domainId: 'mathematics',
    conceptIds: ['math.plane_geometry', 'math.trigonometry', 'math.spatial_geometry'],
    skillIds: ['math.prove_circle_geometry', 'math.use_trig_ratios', 'math.compute_solid_measure'],
    cognitiveLevel: 'apply',
  },
};

const SAT_RW_DOMAIN_MAP: Record<string, SatTagMap> = {
  'information and ideas': {
    domainId: 'english_core',
    conceptIds: ['eng.reading_main_idea', 'eng.reading_detail', 'eng.reading_inference'],
    skillIds: ['eng.identify_main_idea', 'eng.identify_specific_detail', 'eng.infer_implicit_meaning'],
    misconceptionIds: ['mis.eng.inference_literal_only'],
    cognitiveLevel: 'analyze',
  },
  'craft and structure': {
    domainId: 'english_core',
    conceptIds: ['eng.vocabulary_range', 'eng.reading_argument_structure', 'eng.reading_inference'],
    skillIds: ['eng.use_collocation', 'eng.evaluate_argument_flow', 'eng.infer_implicit_meaning'],
    cognitiveLevel: 'analyze',
  },
  'standard english conventions': {
    domainId: 'english_core',
    conceptIds: ['eng.grammar_accuracy', 'eng.sentence_structure', 'eng.verb_tense_aspect'],
    skillIds: ['eng.control_clause_structure', 'eng.edit_sentence_errors', 'eng.control_tense_aspect'],
    misconceptionIds: ['mis.eng.grammar_role_mismatch'],
    cognitiveLevel: 'apply',
  },
  'expression of ideas': {
    domainId: 'english_core',
    conceptIds: ['eng.cohesion_reference', 'eng.reading_argument_structure', 'eng.academic_register'],
    skillIds: ['eng.track_cohesive_reference', 'eng.evaluate_argument_flow', 'eng.choose_register'],
    cognitiveLevel: 'evaluate',
  },
};

export function toQuestionItemFromSatPublicQuestion(question: SatPublicQuestionItem, contentVersion = ''): QuestionItem {
  const tagMap = inferSatTagMap(question);
  const choices = toSatQuestionChoices(question.choices);
  const type = normalizeSatQuestionType(question.questionType || question.type || '');

  return {
    id: `sat.${slugComponent(question.id)}`,
    sourceId: question.id,
    source: 'sat_public_package',
    domainId: tagMap.domainId,
    programIds: ['sat'],
    conceptIds: tagMap.conceptIds,
    skillIds: tagMap.skillIds,
    misconceptionIds: tagMap.misconceptionIds || [],
    type,
    prompt: String(question.prompt || '').trim(),
    choices: choices.length ? choices : undefined,
    correctAnswer: normalizeSatCorrectAnswer(question),
    explanation: normalizeSatExplanation(question.explanation),
    difficulty: normalizeDifficulty(question.difficulty),
    cognitiveLevel: tagMap.cognitiveLevel || inferSatCognitiveLevel(question),
    masteryPolicy: 'tracked',
    tags: uniqueStrings([
      'sat',
      question.section,
      question.domain,
      question.skill,
      question.targetBand || '',
      question.modulePlacement || '',
      question.practicePool || '',
      ...normalizeStringList(question.tags),
    ]),
    metadata: {
      contentVersion,
      section: question.section,
      satDomain: question.domain,
      satSkill: question.skill,
      targetBand: question.targetBand || '',
      modulePlacement: question.modulePlacement || '',
      estimatedTimeSeconds: Number(question.estimatedTimeSeconds || 0),
      practicePool: question.practicePool || '',
      calculator: question.calculator ?? '',
      calculatorTag: question.calculatorTag || '',
      desmos: question.desmos ?? '',
      desmosTag: question.desmosTag || '',
      toolTag: question.toolTag || '',
      mathTool: question.mathTool || '',
      lessonKey: question.lessonKey || '',
      answerFormat: question.answerFormat || '',
      vocab: normalizeStringList(question.vocab),
    },
  };
}

export function toQuestionItemsFromSatPublicPackage(contentPackage: SatPublicStudentPackage): QuestionItem[] {
  return (contentPackage.items || []).map((question) => toQuestionItemFromSatPublicQuestion(question, contentPackage.contentVersion || ''));
}

export function getSatQuestionReadinessIssues(question: SatPublicQuestionItem, path = 'items[]'): SatQuestionReadinessIssue[] {
  const issues: SatQuestionReadinessIssue[] = [];
  const id = String(question.id || '').trim();

  if (!id) {
    issues.push({ code: 'missing_question_id', severity: 'blocker', message: 'SAT question id is required.', path: `${path}.id` });
  }
  if (!String(question.prompt || '').trim()) {
    issues.push({ code: 'missing_prompt', severity: 'blocker', message: 'SAT question prompt is required.', questionId: id, path: `${path}.prompt` });
  }
  if (!String(question.section || '').trim()) {
    issues.push({ code: 'missing_section', severity: 'blocker', message: 'SAT question section is required.', questionId: id, path: `${path}.section` });
  }
  if (!String(question.domain || '').trim()) {
    issues.push({ code: 'missing_domain', severity: 'blocker', message: 'SAT question domain is required.', questionId: id, path: `${path}.domain` });
  }
  if (!String(question.skill || '').trim()) {
    issues.push({ code: 'missing_skill', severity: 'warning', message: 'SAT question skill is missing, mastery granularity will be weaker.', questionId: id, path: `${path}.skill` });
  }
  if (normalizeSatCorrectAnswer(question) === null) {
    issues.push({ code: 'missing_answer_key', severity: 'blocker', message: 'SAT question needs correctAnswer or acceptableAnswers.', questionId: id, path: `${path}.correctAnswer` });
  }
  if (normalizeSatQuestionType(question.questionType || question.type || '') === 'multiple_choice' && toSatQuestionChoices(question.choices).length < 2) {
    issues.push({ code: 'missing_choices', severity: 'blocker', message: 'SAT multiple-choice question needs at least two choices.', questionId: id, path: `${path}.choices` });
  }
  if (!String(question.explanation || '').trim() && typeof question.explanation !== 'object') {
    issues.push({ code: 'missing_explanation', severity: 'warning', message: 'SAT explanation is missing.', questionId: id, path: `${path}.explanation` });
  }

  return issues;
}

export function buildSatContentReadinessSnapshot(
  contentPackage: SatPublicStudentPackage,
  generatedAt = new Date().toISOString(),
): SatContentReadinessSnapshot {
  const items = contentPackage.items || [];
  const ids = items.map((item) => String(item.id || '').trim()).filter(Boolean);
  const uniqueIds = new Set(ids);
  const readinessIssues = items.flatMap((item, index) => getSatQuestionReadinessIssues(item, `items[${index}]`));
  const blockerIds = new Set(readinessIssues.filter((issue) => issue.severity === 'blocker').map((issue) => issue.questionId || ''));
  const warningIds = new Set(readinessIssues.filter((issue) => issue.severity === 'warning').map((issue) => issue.questionId || ''));
  const adapted = toQuestionItemsFromSatPublicPackage(contentPackage);
  const validationErrors = adapted.flatMap((item, index) => validateQuestionItem(item, `questions[${index}]`));

  return {
    schemaVersion: 'sat_content_guard_v1',
    generatedAt,
    contentVersion: contentPackage.contentVersion || '',
    totalItems: items.length,
    uniqueIds: uniqueIds.size,
    duplicateIds: ids.length - uniqueIds.size,
    learningReadyItems: items.length - blockerIds.size,
    blockerItems: blockerIds.size,
    warningItems: warningIds.size,
    adapter: {
      convertedItems: adapted.length,
      validationErrors: validationErrors.length,
      pass: adapted.length === items.length && validationErrors.length === 0,
    },
    bySection: countBy(items, (item) => item.section),
    byDomain: countBy(items, (item) => item.domain),
    byDifficulty: countBy(items, (item) => normalizeDifficulty(item.difficulty)),
    byQuestionType: countBy(items, (item) => normalizeSatQuestionType(item.questionType || item.type || '')),
    byPracticePool: countBy(items, (item) => item.practicePool || 'public_package'),
    topIssues: countIssues(readinessIssues, validationErrors),
  };
}

export function buildSatLearningCatalog(contentPackage: SatPublicStudentPackage): SatLearningCatalog {
  const items = toQuestionItemsFromSatPublicPackage(contentPackage);
  return {
    items,
    byId: new Map(items.map((item) => [item.id, item])),
    coverage: {
      totalQuestions: items.length,
      readyQuestions: items.length,
      bySection: countBy(items, (item) => String(item.metadata?.section || 'unknown')),
      byDomain: countBy(items, (item) => String(item.metadata?.satDomain || 'unknown')),
      bySkill: countBy(items, (item) => String(item.metadata?.satSkill || 'unknown')),
      byDifficulty: countBy(items, (item) => item.difficulty),
      byPracticePool: countBy(items, (item) => String(item.metadata?.practicePool || 'public_package')),
    },
  };
}

export function selectSatDiagnosticItems(
  catalog: SatLearningCatalog,
  attemptedItemIds: string[] = [],
  options: SatDiagnosticSelectionOptions = {},
): QuestionItem[] {
  const limit = Math.max(1, Number(options.limit || 44));
  const pool = querySatCatalogDetails(catalog, {
    mode: 'diagnostic',
    limit: Math.max(limit * 8, 200),
    excludeItemIds: attemptedItemIds,
    domainIds: satDiagnosticDomainIds(options),
    tags: satScopeTags(options),
  }).filter((item) => String(item.metadata?.practicePool || '') !== 'remedial_pool');
  const scopedPool = pool.filter((item) => matchesSatScope(item, options));

  const selected = balancedSelect(scopedPool, limit, (item) => [
    String(item.metadata?.section || 'unknown'),
    String(item.metadata?.satDomain || 'unknown'),
    item.difficulty,
  ]);

  if (selected.length >= limit) return selected;
  return fillSelection(selected, scopedPool, limit);
}

export function selectSatPracticeItems(catalog: SatLearningCatalog, options: SatPracticeSelectionOptions = {}): QuestionItem[] {
  const limit = Math.max(1, Number(options.limit || 10));
  const pool = querySatCatalogDetails(catalog, {
    mode: 'practice',
    limit: Math.max(limit * 8, 100),
    excludeItemIds: options.attemptedItemIds || [],
    skillIds: options.skillIds,
    difficulty: options.difficulty,
    tags: satScopeTags(options),
  })
    .filter((item) => options.includeRemedialPool || String(item.metadata?.practicePool || '') !== 'remedial_pool')
    .sort((a, b) => difficultyRank(b.difficulty) - difficultyRank(a.difficulty) || a.id.localeCompare(b.id));

  return pool.slice(0, limit);
}

function querySatCatalogDetails(catalog: SatLearningCatalog, query: {
  mode: string;
  limit: number;
  excludeItemIds?: string[];
  domainIds?: string[];
  skillIds?: string[];
  difficulty?: string;
  tags?: string[];
}): QuestionItem[] {
  const domainIds = query.domainIds && query.domainIds.length > 0 ? query.domainIds : [undefined];
  const summaries = domainIds.flatMap((domainId) => queryContentItems(catalog.items, {
      programId: 'sat',
      domainId,
      mode: query.mode,
      limit: query.limit,
      excludeItemIds: query.excludeItemIds,
      skillIds: query.skillIds,
      difficulty: query.difficulty,
      tags: query.tags,
    }, {
      defaultLimit: query.limit,
      maxLimit: Math.max(query.limit, 100),
    }).items);

  return uniqueById(summaries)
    .map((summary) => catalog.byId.get(summary.id))
    .filter((item): item is QuestionItem => Boolean(item));
}

function satScopeTags(options: SatDiagnosticSelectionOptions): string[] | undefined {
  return uniqueStrings([options.section || '', options.domain || '']);
}

function satDiagnosticDomainIds(options: SatDiagnosticSelectionOptions): string[] | undefined {
  const section = normalizeKey(options.section || '');
  const domain = normalizeKey(options.domain || '');
  if (section.includes('math')) return ['mathematics'];
  if (section.includes('reading') || section.includes('writing')) return ['english_core'];
  if (domain) return undefined;
  return ['english_core', 'mathematics'];
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function inferSatTagMap(question: SatPublicQuestionItem): SatTagMap {
  const section = normalizeKey(question.section);
  const domain = normalizeKey(question.domain);
  const skill = normalizeKey(question.skill);
  const base = section.includes('math')
    ? SAT_MATH_DOMAIN_MAP[domain] || SAT_MATH_DOMAIN_MAP.algebra
    : SAT_RW_DOMAIN_MAP[domain] || SAT_RW_DOMAIN_MAP['information and ideas'];

  if (section.includes('math')) {
    if (skill.includes('quadratic') || skill.includes('polynomial') || skill.includes('function')) {
      return {
        ...base,
        conceptIds: uniqueStrings([...base.conceptIds, 'math.quadratic_equation', 'math.functions_graphs']),
        skillIds: uniqueStrings([...base.skillIds, 'math.solve_quadratic_by_factor', 'math.analyze_function_graph']),
      };
    }
    if (skill.includes('linear') || skill.includes('system')) {
      return {
        ...base,
        conceptIds: uniqueStrings([...base.conceptIds, 'math.linear_equation']),
        skillIds: uniqueStrings([...base.skillIds, 'math.solve_linear_equation', 'math.solve_system']),
      };
    }
    if (skill.includes('data') || skill.includes('percentage') || skill.includes('probability')) {
      return {
        ...base,
        conceptIds: uniqueStrings([...base.conceptIds, 'math.statistics', 'math.probability']),
        skillIds: uniqueStrings([...base.skillIds, 'math.interpret_statistics', 'math.compute_probability']),
      };
    }
    return base;
  }

  if (skill.includes('words in context') || skill.includes('vocabulary')) {
    return {
      ...base,
      conceptIds: uniqueStrings([...base.conceptIds, 'eng.vocabulary_range']),
      skillIds: uniqueStrings([...base.skillIds, 'eng.use_collocation']),
      misconceptionIds: uniqueStrings([...(base.misconceptionIds || []), 'mis.eng.collocation_literal_translation']),
    };
  }
  if (skill.includes('transitions') || skill.includes('rhetorical synthesis')) {
    return {
      ...base,
      conceptIds: uniqueStrings([...base.conceptIds, 'eng.cohesion_reference']),
      skillIds: uniqueStrings([...base.skillIds, 'eng.track_cohesive_reference']),
    };
  }
  if (skill.includes('boundaries') || skill.includes('form') || skill.includes('structure')) {
    return {
      ...base,
      conceptIds: uniqueStrings([...base.conceptIds, 'eng.grammar_accuracy', 'eng.sentence_structure']),
      skillIds: uniqueStrings([...base.skillIds, 'eng.edit_sentence_errors', 'eng.control_clause_structure']),
      misconceptionIds: uniqueStrings([...(base.misconceptionIds || []), 'mis.eng.grammar_role_mismatch']),
    };
  }
  return base;
}

function toSatQuestionChoices(raw: SatPublicQuestionItem['choices']): QuestionChoice[] {
  if (Array.isArray(raw)) {
    return raw
      .map((choice, index) => ({ key: String.fromCharCode(65 + index), content: stringifyChoice(choice) }))
      .filter((choice) => choice.content.trim());
  }
  if (!raw || typeof raw !== 'object') return [];
  return Object.entries(raw)
    .map(([key, value]) => ({ key: String(key).trim(), content: stringifyChoice(value) }))
    .filter((choice) => choice.key && choice.content.trim())
    .sort((a, b) => a.key.localeCompare(b.key));
}

function normalizeSatCorrectAnswer(question: SatPublicQuestionItem): string | string[] | boolean | null {
  const direct = question.correctAnswer;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  if (typeof direct === 'boolean') return direct;
  if (Array.isArray(direct)) return direct.map((answer) => stringifyChoice(answer)).filter(Boolean);

  const acceptable = question.acceptableAnswers;
  if (typeof acceptable === 'string' && acceptable.trim()) return acceptable.trim();
  if (Array.isArray(acceptable)) return acceptable.map((answer) => stringifyChoice(answer)).filter(Boolean);

  return null;
}

function normalizeSatExplanation(value: SatPublicQuestionItem['explanation']): string | Record<string, unknown> | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  return undefined;
}

function normalizeSatQuestionType(value: string): string {
  const normalized = normalizeKey(value).replace(/-/g, '_').replace(/\s+/g, '_');
  if (!normalized || normalized === 'mcq') return 'multiple_choice';
  if (normalized === 'student_produced_response' || normalized === 'spr') return 'student_produced_response';
  if (normalized === 'grid_in' || normalized === 'gridin') return 'grid_in';
  return normalized;
}

function inferSatCognitiveLevel(question: SatPublicQuestionItem): CognitiveLevel {
  const difficulty = normalizeDifficulty(question.difficulty);
  const domain = normalizeKey(question.domain);
  if (difficulty === 'hard') return 'analyze';
  if (domain.includes('expression') || domain.includes('craft')) return 'evaluate';
  return 'apply';
}

function normalizeDifficulty(value: string): string {
  const normalized = normalizeKey(value);
  if (normalized === 'easy' || normalized === 'medium' || normalized === 'hard') return normalized;
  return normalized || 'medium';
}

function difficultyRank(value: string): number {
  const normalized = normalizeDifficulty(value);
  if (normalized === 'hard') return 3;
  if (normalized === 'medium') return 2;
  return 1;
}

function matchesSatScope(item: QuestionItem, options: SatDiagnosticSelectionOptions): boolean {
  const section = normalizeKey(String(options.section || ''));
  const domain = normalizeKey(String(options.domain || ''));
  const itemSection = normalizeKey(String(item.metadata?.section || ''));
  const itemDomain = normalizeKey(String(item.metadata?.satDomain || ''));
  return (!section || itemSection === section) && (!domain || itemDomain === domain);
}

function balancedSelect(items: QuestionItem[], limit: number, buckets: (item: QuestionItem) => string[]): QuestionItem[] {
  const selected: QuestionItem[] = [];
  const bucketCounts = new Map<string, number>();
  const ordered = [...items].sort((a, b) => a.id.localeCompare(b.id));

  for (const item of ordered) {
    const bucketKey = buckets(item).join('::');
    const count = bucketCounts.get(bucketKey) || 0;
    if (count >= Math.ceil(limit / Math.max(1, Math.min(limit, 12)))) continue;
    selected.push(item);
    bucketCounts.set(bucketKey, count + 1);
    if (selected.length >= limit) break;
  }

  return selected;
}

function fillSelection(selected: QuestionItem[], pool: QuestionItem[], limit: number): QuestionItem[] {
  const selectedIds = new Set(selected.map((item) => item.id));
  for (const item of pool) {
    if (selectedIds.has(item.id)) continue;
    selected.push(item);
    selectedIds.add(item.id);
    if (selected.length >= limit) break;
  }
  return selected;
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const normalized = String(key(item) || 'unknown').trim() || 'unknown';
    counts[normalized] = (counts[normalized] || 0) + 1;
    return counts;
  }, {});
}

function countIssues(readinessIssues: SatQuestionReadinessIssue[], validationErrors: ValidationError[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const issue of readinessIssues) counts[issue.code] = (counts[issue.code] || 0) + 1;
  if (validationErrors.length) counts.validation_error = validationErrors.length;
  return counts;
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueStrings(value.map((item) => String(item || '')));
  if (typeof value === 'string') return uniqueStrings(value.split(/[;,|]/g));
  return [];
}

function stringifyChoice(value: SatJsonValue | unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function normalizeKey(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function slugComponent(value: string): string {
  return String(value || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}
