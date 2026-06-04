import type {
  EnglishCoreLessonTemplate,
  LessonPracticeItem,
  LessonTemplateStageId,
  MathLessonTemplate,
} from './lessonTemplates';

export type TemplatePracticeDomainId = 'mathematics' | 'english_core';
export type TemplatePracticeChoiceKey = 'A' | 'B' | 'C' | 'D';
export type TemplatePracticeSourceSurface = 'math_lesson_template_panel' | 'english_core_lesson_template_panel';

export type TemplatePracticeTemplate = (MathLessonTemplate | EnglishCoreLessonTemplate) & {
  mixedReview?: LessonPracticeItem[];
  transferTask?: LessonPracticeItem;
};

export interface TemplatePracticeChoice {
  key: TemplatePracticeChoiceKey;
  text: string;
}

export interface TemplatePracticeQuestion {
  id: string;
  prompt: string;
  stageId: LessonTemplateStageId;
  stageTitle: string;
  choices: TemplatePracticeChoice[];
  correctAnswer: TemplatePracticeChoiceKey;
  expectedMove: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface TemplatePracticeState {
  templateId: string;
  templateTitle: string;
  domainId: TemplatePracticeDomainId;
  programId: string;
  conceptIds: string[];
  skillIds: string[];
  sourceSurface: TemplatePracticeSourceSurface;
  questions: TemplatePracticeQuestion[];
  currentIndex: number;
  score: number;
  selectedAnswer: TemplatePracticeChoiceKey | '';
  answered: boolean;
  startedAt: string;
}

export function createTemplatePracticeState(input: {
  template: TemplatePracticeTemplate;
  domainId: TemplatePracticeDomainId;
  programId: string;
  sourceSurface: TemplatePracticeSourceSurface;
  now?: string;
}): TemplatePracticeState | null {
  const questions = buildTemplatePracticeQuestions(input.template, input.domainId);
  if (!questions.length) return null;

  return {
    templateId: input.template.id,
    templateTitle: input.template.title,
    domainId: input.domainId,
    programId: input.programId,
    conceptIds: uniqueStrings(input.template.conceptIds),
    skillIds: uniqueStrings(input.template.skillIds),
    sourceSurface: input.sourceSurface,
    questions,
    currentIndex: 0,
    score: 0,
    selectedAnswer: '',
    answered: false,
    startedAt: input.now || new Date().toISOString(),
  };
}

export function getCurrentTemplatePracticeQuestion(state: TemplatePracticeState): TemplatePracticeQuestion {
  return state.questions[state.currentIndex];
}

export function answerTemplatePracticeQuestion(
  state: TemplatePracticeState,
  choice: TemplatePracticeChoiceKey,
): { currentQuestion: TemplatePracticeQuestion; isCorrect: boolean; nextState: TemplatePracticeState } {
  const currentQuestion = getCurrentTemplatePracticeQuestion(state);
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

export function advanceTemplatePractice(
  state: TemplatePracticeState,
): { completed: boolean; finalScore: number; totalQuestions: number; nextState: TemplatePracticeState | null } {
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

function buildTemplatePracticeQuestions(template: TemplatePracticeTemplate, domainId: TemplatePracticeDomainId): TemplatePracticeQuestion[] {
  const blocks: Array<{ stageId: LessonTemplateStageId; stageTitle: string; item: LessonPracticeItem; difficulty: TemplatePracticeQuestion['difficulty'] }> = [
    ...takeItems(template.guidedQuestions, 'guided_steps', 'Guided question', 'Easy', 2),
    ...takeItems(template.independentSet, 'independent_set', 'Independent check', 'Medium', 2),
    ...takeItems(template.mixedReview || [], 'mixed_review', 'Mixed review', 'Hard', 1),
  ];

  if (template.transferTask) {
    blocks.push({ stageId: 'mixed_review', stageTitle: 'Transfer task', item: template.transferTask, difficulty: 'Hard' });
  }
  if (template.quickCheck) {
    blocks.push({ stageId: 'reflection', stageTitle: 'Quick check', item: template.quickCheck, difficulty: 'Medium' });
  }

  return blocks.slice(0, 6).map((block, index) => {
    const choices = buildChoices(block.item.expectedMove, template.commonTraps, domainId, index);
    return {
      id: `${template.id}.practice.${block.stageId}.${index + 1}`,
      prompt: block.item.prompt,
      stageId: block.stageId,
      stageTitle: block.stageTitle,
      choices,
      correctAnswer: choices.find((choice) => choice.text === block.item.expectedMove)?.key || 'A',
      expectedMove: block.item.expectedMove,
      difficulty: block.difficulty,
    };
  });
}

function takeItems(
  items: LessonPracticeItem[] | undefined,
  stageId: LessonTemplateStageId,
  stageTitle: string,
  difficulty: TemplatePracticeQuestion['difficulty'],
  limit: number,
): Array<{ stageId: LessonTemplateStageId; stageTitle: string; item: LessonPracticeItem; difficulty: TemplatePracticeQuestion['difficulty'] }> {
  return (items || []).slice(0, limit).map((item) => ({ stageId, stageTitle, item, difficulty }));
}

function buildChoices(
  expectedMove: string,
  commonTraps: string[] = [],
  domainId: TemplatePracticeDomainId,
  index: number,
): TemplatePracticeChoice[] {
  const distractors = uniqueStrings([
    ...commonTraps.map((trap) => normalizeTrapAsChoice(trap)),
    ...fallbackDistractors(domainId),
  ]).filter((choice) => choice && choice !== expectedMove);
  const raw = [expectedMove, ...distractors].slice(0, 4);
  while (raw.length < 4) raw.push(fallbackDistractors(domainId)[raw.length] || 'Choose based on surface clues only.');

  const correctIndex = index % 4;
  const arranged = [...raw.slice(1, correctIndex + 1), expectedMove, ...raw.slice(correctIndex + 1)];
  return (['A', 'B', 'C', 'D'] as TemplatePracticeChoiceKey[]).map((key, choiceIndex) => ({
    key,
    text: arranged[choiceIndex],
  }));
}

function normalizeTrapAsChoice(value: string): string {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.endsWith('.') ? text : `${text}.`;
}

function fallbackDistractors(domainId: TemplatePracticeDomainId): string[] {
  return domainId === 'english_core'
    ? [
        'Translate each word separately before checking phrase fit.',
        'Pick the most advanced-looking word without checking register.',
        'Ignore surrounding sentence role and answer by sound.',
      ]
    : [
        'Apply the fastest operation before writing the required condition.',
        'Copy the worked example pattern without checking this problem setup.',
        'Use calculation as the first step and skip the reasoning checkpoint.',
      ];
}

function uniqueStrings(values: string[] | undefined): string[] {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}
