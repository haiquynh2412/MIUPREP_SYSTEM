import type {
  ContentProgramId,
  EnglishExamTest,
  EnglishLearningCatalog,
  QuestionItem,
} from '@miuprep/content';
import type { TemplatePracticeTemplate } from './templatePractice';

export type EnglishItemBankPracticeProgramId = 'ielts' | 'cae' | 'cpe';
export type EnglishItemBankPracticeChoiceKey = 'A' | 'B' | 'C' | 'D';
export type EnglishItemBankPracticeSourceSurface = 'english_item_bank_practice';

export interface EnglishItemBankPracticeChoice {
  key: EnglishItemBankPracticeChoiceKey;
  text: string;
  sourceKey?: string;
  sourceValue: string;
}

export interface EnglishItemBankPracticeQuestion {
  id: string;
  sourceId?: string;
  source?: string;
  prompt: string;
  choices: EnglishItemBankPracticeChoice[];
  correctAnswer: EnglishItemBankPracticeChoiceKey;
  correctValue: string;
  explanation: string;
  difficulty: string;
  cognitiveLevel: string;
  type: string;
  conceptIds: string[];
  skillIds: string[];
  misconceptionIds: string[];
  metadata: Record<string, unknown>;
}

export interface EnglishItemBankPracticeCoverage {
  readyQuestions: number;
  blockedQuestions: number;
  warningIssues: number;
  bySkill: Record<string, number>;
  byQuestionType: Record<string, number>;
  bySourceTest: Record<string, number>;
}

export interface EnglishItemBankPracticeState {
  programId: EnglishItemBankPracticeProgramId;
  domainId: 'english_core';
  sourceSurface: EnglishItemBankPracticeSourceSurface;
  templateId: string;
  templateTitle: string;
  templateConceptIds: string[];
  templateSkillIds: string[];
  questions: EnglishItemBankPracticeQuestion[];
  currentIndex: number;
  score: number;
  selectedAnswer: EnglishItemBankPracticeChoiceKey | '';
  answered: boolean;
  startedAt: string;
  coverage: EnglishItemBankPracticeCoverage;
}

const PROGRAM_IDS: EnglishItemBankPracticeProgramId[] = ['ielts', 'cae', 'cpe'];
const CHOICE_KEYS: EnglishItemBankPracticeChoiceKey[] = ['A', 'B', 'C', 'D'];

type EnglishContentModule = typeof import('@miuprep/content');

const catalogCache = new Map<EnglishItemBankPracticeProgramId, EnglishLearningCatalog>();
let englishContentModulePromise: Promise<EnglishContentModule> | null = null;

export function isEnglishItemBankProgramId(value: string): value is EnglishItemBankPracticeProgramId {
  return PROGRAM_IDS.includes(value as EnglishItemBankPracticeProgramId);
}

export async function createEnglishItemBankPracticeState(input: {
  programId: EnglishItemBankPracticeProgramId;
  template: TemplatePracticeTemplate;
  attemptedItemIds?: string[];
  limit?: number;
  now?: string;
}): Promise<EnglishItemBankPracticeState | null> {
  const contentModule = await loadEnglishContentModule();
  const catalog = await getEnglishCatalog(input.programId, contentModule);
  const limit = Math.max(1, Number(input.limit || 6));
  const selectedItems = selectScorablePracticeItems({
    contentModule,
    catalog,
    programId: input.programId,
    template: input.template,
    attemptedItemIds: input.attemptedItemIds || [],
    limit,
  });

  const questions = selectedItems
    .map((item, index) => toPracticeQuestion(item, index, catalog.items))
    .filter((question): question is EnglishItemBankPracticeQuestion => Boolean(question));

  if (!questions.length) return null;

  return {
    programId: input.programId,
    domainId: 'english_core',
    sourceSurface: 'english_item_bank_practice',
    templateId: input.template.id,
    templateTitle: input.template.title,
    templateConceptIds: uniqueStrings(input.template.conceptIds),
    templateSkillIds: uniqueStrings(input.template.skillIds),
    questions,
    currentIndex: 0,
    score: 0,
    selectedAnswer: '',
    answered: false,
    startedAt: input.now || new Date().toISOString(),
    coverage: {
      readyQuestions: catalog.coverage.readyQuestions,
      blockedQuestions: catalog.coverage.blockedQuestions,
      warningIssues: catalog.coverage.warningIssues,
      bySkill: catalog.coverage.bySkill,
      byQuestionType: catalog.coverage.byQuestionType,
      bySourceTest: catalog.coverage.bySourceTest,
    },
  };
}

export function answerEnglishItemBankPracticeQuestion(
  state: EnglishItemBankPracticeState,
  choice: EnglishItemBankPracticeChoiceKey,
): { currentQuestion: EnglishItemBankPracticeQuestion; isCorrect: boolean; nextState: EnglishItemBankPracticeState } {
  const currentQuestion = getCurrentEnglishItemBankPracticeQuestion(state);
  const isCorrect = choice === currentQuestion.correctAnswer;

  return {
    currentQuestion,
    isCorrect,
    nextState: {
      ...state,
      selectedAnswer: choice,
      answered: true,
      score: state.score + (isCorrect ? 1 : 0),
    },
  };
}

export function advanceEnglishItemBankPractice(
  state: EnglishItemBankPracticeState,
): { completed: boolean; finalScore: number; totalQuestions: number; nextState: EnglishItemBankPracticeState | null } {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex < state.questions.length) {
    return {
      completed: false,
      finalScore: state.score,
      totalQuestions: state.questions.length,
      nextState: {
        ...state,
        currentIndex: nextIndex,
        selectedAnswer: '',
        answered: false,
      },
    };
  }

  return {
    completed: true,
    finalScore: state.score,
    totalQuestions: state.questions.length,
    nextState: null,
  };
}

export function getCurrentEnglishItemBankPracticeQuestion(state: EnglishItemBankPracticeState): EnglishItemBankPracticeQuestion {
  return state.questions[state.currentIndex];
}

export async function getEnglishItemBankPracticeCatalogCoverage(programId: EnglishItemBankPracticeProgramId): Promise<EnglishItemBankPracticeCoverage> {
  const catalog = await getEnglishCatalog(programId, await loadEnglishContentModule());
  return {
    readyQuestions: catalog.coverage.readyQuestions,
    blockedQuestions: catalog.coverage.blockedQuestions,
    warningIssues: catalog.coverage.warningIssues,
    bySkill: catalog.coverage.bySkill,
    byQuestionType: catalog.coverage.byQuestionType,
    bySourceTest: catalog.coverage.bySourceTest,
  };
}

async function loadEnglishContentModule(): Promise<EnglishContentModule> {
  if (!englishContentModulePromise) {
    englishContentModulePromise = import('@miuprep/content');
  }
  return englishContentModulePromise;
}

async function getEnglishCatalog(programId: EnglishItemBankPracticeProgramId, contentModule: EnglishContentModule): Promise<EnglishLearningCatalog> {
  const cached = catalogCache.get(programId);
  if (cached) return cached;

  const catalog = contentModule.buildEnglishLearningCatalog(getEnglishExamTests(contentModule), {
    programIds: [programId],
    displayModes: ['topic', 'both', 'test'],
  });
  catalogCache.set(programId, catalog);
  return catalog;
}

function getEnglishExamTests(contentModule: EnglishContentModule): EnglishExamTest[] {
  return Object.values(contentModule)
    .filter(isEnglishExamTest)
    .filter((test) => isEnglishItemBankProgramId(String(test.exam || '').toLowerCase()))
    .sort((left, right) => `${left.exam}.${left.id}`.localeCompare(`${right.exam}.${right.id}`));
}

function isEnglishExamTest(value: unknown): value is EnglishExamTest {
  const test = value as EnglishExamTest;
  return Boolean(test && typeof test === 'object' && typeof test.id === 'string' && Array.isArray(test.sections));
}

function selectScorablePracticeItems(input: {
  contentModule: EnglishContentModule;
  catalog: EnglishLearningCatalog;
  programId: EnglishItemBankPracticeProgramId;
  template: TemplatePracticeTemplate;
  attemptedItemIds: string[];
  limit: number;
}): QuestionItem[] {
  const focused = input.contentModule.selectEnglishPracticeItems(input.catalog, {
    programId: input.programId as ContentProgramId,
    conceptIds: input.template.conceptIds,
    skillIds: input.template.skillIds,
    attemptedItemIds: input.attemptedItemIds,
    limit: input.limit * 3,
  }).filter(isScorableItem);

  if (focused.length >= input.limit) return focused.slice(0, input.limit);

  const selected = [...focused];
  const selectedIds = new Set(selected.map((item) => item.id));
  const fallback = input.contentModule.selectEnglishPracticeItems(input.catalog, {
    programId: input.programId as ContentProgramId,
    attemptedItemIds: [...input.attemptedItemIds, ...selectedIds],
    limit: input.limit * 8,
  }).filter(isScorableItem);

  for (const item of fallback) {
    if (selectedIds.has(item.id)) continue;
    selected.push(item);
    selectedIds.add(item.id);
    if (selected.length >= input.limit) break;
  }

  return selected;
}

function toPracticeQuestion(
  item: QuestionItem,
  index: number,
  allItems: QuestionItem[],
): EnglishItemBankPracticeQuestion | null {
  const correctValue = getCorrectAnswerValue(item);
  if (!correctValue) return null;

  const choices = buildChoices(item, correctValue, index, allItems);
  const correctChoice = choices.find((choice) => choice.sourceValue === correctValue || normalizeAnswerValue(choice.sourceValue) === normalizeAnswerValue(correctValue));

  if (!choices.length || !correctChoice) return null;

  return {
    id: item.id,
    sourceId: item.sourceId,
    source: item.source,
    prompt: compactPrompt(item.prompt),
    choices,
    correctAnswer: correctChoice.key,
    correctValue,
    explanation: explanationText(item.explanation),
    difficulty: item.difficulty || 'medium',
    cognitiveLevel: String(item.cognitiveLevel || 'apply'),
    type: item.type,
    conceptIds: uniqueStrings(item.conceptIds),
    skillIds: uniqueStrings(item.skillIds),
    misconceptionIds: uniqueStrings(item.misconceptionIds),
    metadata: { ...(item.metadata || {}) },
  };
}

function buildChoices(
  item: QuestionItem,
  correctValue: string,
  index: number,
  allItems: QuestionItem[],
): EnglishItemBankPracticeChoice[] {
  const sourceChoices = item.choices || [];
  const matchingChoice = findMatchingSourceChoice(sourceChoices, correctValue);
  const correctText = matchingChoice ? formatSourceChoiceText(matchingChoice) : correctValue;
  const distractors = uniqueChoiceValues([
    ...sourceChoices
      .filter((choice) => choice !== matchingChoice)
      .map(formatSourceChoiceText),
    ...nearbyAnswerDistractors(item, correctValue, allItems),
    ...typeFallbackDistractors(item.type, correctValue),
  ]).filter((value) => normalizeAnswerValue(value) !== normalizeAnswerValue(correctText));

  const rawChoices = [correctText, ...distractors].slice(0, 4);
  while (rawChoices.length < 4) {
    const fallback = typeFallbackDistractors(item.type, correctValue)[rawChoices.length] || `Alternative ${rawChoices.length + 1}`;
    if (!rawChoices.some((choice) => normalizeAnswerValue(choice) === normalizeAnswerValue(fallback))) {
      rawChoices.push(fallback);
    } else {
      rawChoices.push(`Review option ${rawChoices.length + 1}`);
    }
  }

  const correctIndex = index % CHOICE_KEYS.length;
  const arranged = [...rawChoices.slice(1, correctIndex + 1), correctText, ...rawChoices.slice(correctIndex + 1)];

  return CHOICE_KEYS.map((key, choiceIndex) => {
    const text = arranged[choiceIndex] || '';
    const sourceChoice = sourceChoices.find((choice) => formatSourceChoiceText(choice) === text);
    return {
      key,
      text,
      sourceKey: sourceChoice?.key,
      sourceValue: text === correctText ? correctValue : text,
    };
  });
}

function findMatchingSourceChoice(
  choices: NonNullable<QuestionItem['choices']>,
  correctValue: string,
): NonNullable<QuestionItem['choices']>[number] | undefined {
  const normalizedCorrect = normalizeAnswerValue(correctValue);
  return choices.find((choice) => {
    return normalizeAnswerValue(choice.key) === normalizedCorrect || normalizeAnswerValue(choice.content) === normalizedCorrect;
  });
}

function formatSourceChoiceText(choice: NonNullable<QuestionItem['choices']>[number]): string {
  const key = String(choice.key || '').trim();
  const content = String(choice.content || '').trim();
  if (!key) return content;
  if (!content) return key;
  return `${key}. ${content}`;
}

function nearbyAnswerDistractors(item: QuestionItem, correctValue: string, allItems: QuestionItem[]): string[] {
  const normalizedCorrect = normalizeAnswerValue(correctValue);
  const itemProgram = item.programIds[0] || '';
  const sameSkill = new Set(item.skillIds);

  return allItems
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => candidate.programIds.includes(itemProgram))
    .filter((candidate) => candidate.type === item.type || candidate.skillIds.some((skillId) => sameSkill.has(skillId)))
    .map(getCorrectAnswerValue)
    .filter((value): value is string => Boolean(value))
    .filter((value) => normalizeAnswerValue(value) !== normalizedCorrect)
    .slice(0, 12);
}

function typeFallbackDistractors(type: string, correctValue: string): string[] {
  const normalizedType = String(type || '').toLowerCase();
  if (normalizedType === 'true_false_not_given') return ['True', 'False', 'Not Given'];
  if (normalizedType === 'gap_fill' || normalizedType === 'table_completion') {
    return ['No change', 'Not given', 'Different word form', 'Wrong register'].filter((item) => normalizeAnswerValue(item) !== normalizeAnswerValue(correctValue));
  }
  if (normalizedType === 'matching_headings' || normalizedType === 'multiple_matching' || normalizedType === 'gapped_text') {
    return ['Keyword match only', 'Opposite claim', 'Unsupported detail', 'Wrong paragraph role'];
  }
  return ['Closest keyword match', 'Unsupported inference', 'Wrong grammar role', 'Too broad'];
}

function isScorableItem(item: QuestionItem): boolean {
  return (
    item.domainId === 'english_core' &&
    item.masteryPolicy !== 'feedback_only' &&
    Boolean(getCorrectAnswerValue(item))
  );
}

function getCorrectAnswerValue(item: QuestionItem): string {
  const acceptedAnswers = (item.metadata?.acceptedAnswers as unknown) || [];
  const acceptedValue = Array.isArray(acceptedAnswers)
    ? acceptedAnswers.flatMap((entry) => (Array.isArray(entry) ? entry : [entry])).map(String).find((value) => value.trim())
    : '';
  const answer = item.correctAnswer;
  if (typeof answer === 'string') return answer.trim() || String(acceptedValue || '').trim();
  if (typeof answer === 'boolean') return answer ? 'True' : 'False';
  if (Array.isArray(answer)) return String(answer[0] || acceptedValue || '').trim();
  return String(acceptedValue || '').trim();
}

function explanationText(value: QuestionItem['explanation']): string {
  if (!value) return 'Review the item source and compare the answer with the supporting evidence.';
  if (typeof value === 'string') return stripHtml(value).trim();
  return JSON.stringify(value);
}

function compactPrompt(value: string): string {
  const prompt = stripHtml(value).replace(/\s+/g, ' ').trim();
  if (prompt.length <= 900) return prompt;
  return `${prompt.slice(0, 880).trim()}...`;
}

function stripHtml(value: string): string {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function uniqueStrings(values: string[] | undefined): string[] {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

function uniqueChoiceValues(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.map((item) => String(item || '').trim()).filter(Boolean)) {
    const normalized = normalizeAnswerValue(value);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(value);
  }
  return result;
}

function normalizeAnswerValue(value: string): string {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}
