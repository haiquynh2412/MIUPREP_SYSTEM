export interface SatQuestion {
  id?: string;
  domain?: string;
  skill?: string;
  canonicalSkill?: string;
  difficulty?: string;
  prompt: string;
  choices?: Record<string, string>;
  correctAnswer?: string;
  explanation?: string | { correct?: string; [key: string]: unknown };
}

export interface ErrorNotebookQuestion {
  id: string;
  text: string;
  stage: number;
  answer: string;
  options: string[];
  answerExpl: string;
  domainId?: string;
  programId?: string;
  conceptIds?: string[];
  skillIds?: string[];
  errorType?: 'knowledge' | 'reading_prompt' | 'calculation' | 'time_strategy';
  rootCause?: string;
  missedStep?: string;
  repairLessonId?: string;
  repairLessonTitle?: string;
  retryAttempts?: number;
  correctRetryCount?: number;
  lastTriedAt?: string;
  dueAt?: string;
}

export interface SatPracticeState {
  questions: SatQuestion[];
  currentIndex: number;
  score: number;
  selectedAnswer: string;
  answered: boolean;
  explanationOpened: boolean;
  customInput: string;
  domain: string;
  skill: string;
  bankName: string;
}

export function filterSatQuestions(questions: SatQuestion[], domain: string, skill: string): SatQuestion[] {
  return questions.filter((question) => {
    const matchesDomain = domain === 'all' || question.domain?.toLowerCase() === domain.toLowerCase();
    const matchesSkill =
      skill === 'all' ||
      question.skill?.toLowerCase() === skill.toLowerCase() ||
      question.canonicalSkill?.toLowerCase() === skill.toLowerCase();

    return matchesDomain && matchesSkill;
  });
}

export function createSatPracticeState(
  questions: SatQuestion[],
  domain: string,
  skill: string,
  bankName: string,
  random: () => number = Math.random,
  limit = 10,
): SatPracticeState | null {
  const filtered = filterSatQuestions(questions, domain, skill);
  if (filtered.length === 0) return null;

  const selected = [...filtered].sort(() => 0.5 - random()).slice(0, limit);

  return {
    questions: selected,
    currentIndex: 0,
    score: 0,
    selectedAnswer: '',
    answered: false,
    explanationOpened: false,
    customInput: '',
    domain,
    skill,
    bankName,
  };
}

export function getCurrentSatQuestion(state: SatPracticeState): SatQuestion {
  return state.questions[state.currentIndex];
}

export function isSatAnswerCorrect(question: SatQuestion, choice: string): boolean {
  return choice.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
}

export function getSatExplanation(question: SatQuestion): string {
  if (!question.explanation) return 'Chưa có giải thích.';
  if (typeof question.explanation === 'object') {
    return question.explanation.correct || JSON.stringify(question.explanation);
  }
  return question.explanation;
}

export function createSatErrorQuestion(question: SatQuestion, now = Date.now()): ErrorNotebookQuestion {
  const domain = question.domain || '';
  const skill = question.skill || question.canonicalSkill || '';

  return {
    id: `err-sat-${now}`,
    text: `SAT ${question.domain} (${question.skill}): ${question.prompt}`,
    stage: 1,
    answer: question.correctAnswer || '',
    options: question.choices ? Object.keys(question.choices) : ['A', 'B', 'C', 'D'],
    answerExpl: getSatExplanation(question),
    domainId: domain.toLowerCase().includes('math') ? 'mathematics' : 'english_core',
    programId: 'sat',
    conceptIds: domain ? [`sat.${slugMeta(domain)}`] : [],
    skillIds: skill ? [`sat.${slugMeta(skill)}`] : [],
    errorType: inferSatErrorType(domain, skill),
    retryAttempts: 0,
    correctRetryCount: 0,
  };
}

export function answerSatQuestion(
  state: SatPracticeState,
  choice: string,
): {
  currentQuestion: SatQuestion;
  isCorrect: boolean;
  nextState: SatPracticeState;
} {
  const currentQuestion = getCurrentSatQuestion(state);
  const isCorrect = isSatAnswerCorrect(currentQuestion, choice);

  return {
    currentQuestion,
    isCorrect,
    nextState: {
      ...state,
      selectedAnswer: choice,
      answered: true,
      score: state.score + (isCorrect ? 1 : 0),
      explanationOpened: true,
    },
  };
}

export function advanceSatPractice(state: SatPracticeState): {
  completed: boolean;
  finalScore: number;
  totalQuestions: number;
  nextState: SatPracticeState | null;
} {
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
        explanationOpened: false,
        customInput: '',
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

function inferSatErrorType(domain: string, skill: string): ErrorNotebookQuestion['errorType'] {
  const value = `${domain} ${skill}`.toLowerCase();
  if (value.includes('information') || value.includes('craft') || value.includes('evidence')) return 'reading_prompt';
  if (value.includes('math') || value.includes('algebra') || value.includes('geometry')) return 'calculation';
  if (value.includes('time') || value.includes('pacing')) return 'time_strategy';
  return 'knowledge';
}

function slugMeta(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || 'untagged'
  );
}
