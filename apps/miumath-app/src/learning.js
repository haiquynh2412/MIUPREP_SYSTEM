import { toQuestionItemFromMiuMath, toQuestionItemsFromMiuMath } from '@miuprep/content/src/standard';
import { createSeedKnowledgeGraph } from '@miuprep/knowledge';
import {
  buildDiagnosticSet,
  buildReviewSet,
  buildErrorNotebookEntryFromAttempt,
  buildLearningPath,
  computeMastery,
  emptyStudentModel,
  getDueErrorNotebookEntries,
  normalizeErrorNotebookEntry,
  recommendNextAction,
  recordAttempt,
  saveLearningEventToStorage,
  saveLearningEventsToStorage,
  scheduleErrorNotebookReview,
  summarizeErrorNotebook,
} from '@miuprep/learning';

export const MIU_MATH_PROGRAM_ID = 'vn_math_6_9';
export const MIU_MATH_DOMAIN_ID = 'mathematics';

const STORAGE_PREFIX = 'miu_math_learning_state';
const ERROR_NOTEBOOK_PREFIX = 'miu_math_error_notebook';
const SHARED_LEARNING_EVENT_SOURCE = 'miumath_app';

export const learningStorageKey = (learnerId) => `${STORAGE_PREFIX}_${learnerId || 'guest'}`;
export const errorNotebookStorageKey = (learnerId) => `${ERROR_NOTEBOOK_PREFIX}_${learnerId || 'guest'}`;

export function loadMiuMathLearningState(learnerId = 'guest') {
  const base = emptyStudentModel(learnerId, [MIU_MATH_PROGRAM_ID]);
  try {
    const stored = localStorage.getItem(learningStorageKey(learnerId));
    if (!stored) return base;
    const parsed = JSON.parse(stored);
    return {
      ...base,
      ...parsed,
      learnerId,
      targetProgramIds: Array.isArray(parsed?.targetProgramIds) && parsed.targetProgramIds.length ? parsed.targetProgramIds : [MIU_MATH_PROGRAM_ID],
      attempts: Array.isArray(parsed?.attempts) ? parsed.attempts : [],
      learningEvents: Array.isArray(parsed?.learningEvents) ? parsed.learningEvents : [],
      updatedAt: parsed?.updatedAt || base.updatedAt,
    };
  } catch {
    return base;
  }
}

export function saveMiuMathLearningState(learnerId, state) {
  localStorage.setItem(learningStorageKey(learnerId), JSON.stringify(state));
}

export function saveMiuMathSharedLearningEvent(event) {
  return saveLearningEventToStorage(prepareMiuMathSharedLearningEvent(event));
}

export function saveMiuMathSharedLearningEvents(events) {
  return saveLearningEventsToStorage((Array.isArray(events) ? events : []).map(prepareMiuMathSharedLearningEvent).filter(Boolean));
}

export function loadMiuMathErrorNotebook(learnerId = 'guest') {
  try {
    const stored = localStorage.getItem(errorNotebookStorageKey(learnerId));
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeErrorNotebookEntry) : [];
  } catch {
    return [];
  }
}

export function saveMiuMathErrorNotebook(learnerId, entries) {
  const normalized = (Array.isArray(entries) ? entries : []).map(normalizeErrorNotebookEntry);
  localStorage.setItem(errorNotebookStorageKey(learnerId), JSON.stringify(normalized));
  return normalized;
}

export function recordMiuMathAttempt(state, question, selectedAnswer, mode = 'practice', learnerId = state.learnerId || 'guest') {
  const answer = String(selectedAnswer || '').trim();
  if (!question || !answer) return null;

  const item = toQuestionItemFromMiuMath(normalizeMiuMathQuestion(question));
  const correct = answer.toLowerCase() === String(question.correct_answer || '').trim().toLowerCase();
  return recordAttempt(
    {
      ...state,
      learnerId,
      targetProgramIds: state.targetProgramIds?.length ? state.targetProgramIds : [MIU_MATH_PROGRAM_ID],
    },
    {
      learnerId,
      itemId: item.id,
      domainId: item.domainId,
      programId: MIU_MATH_PROGRAM_ID,
      conceptIds: item.conceptIds,
      skillIds: item.skillIds,
      correct,
      difficulty: item.difficulty,
      mode,
      timeSpentSeconds: 0,
      errorCategories: correct ? ['none'] : inferErrorCategories(question),
      misconceptionIds: correct ? [] : item.misconceptionIds,
      payload: {
        source: 'miumath',
        sourceId: question.id,
        category: question.category || '',
        subCategory: question.sub_category || '',
        selectedAnswer: answer,
        correctAnswer: question.correct_answer || '',
      },
    },
  );
}

export function recordMiuMathErrorNotebookMistake(learnerId, question, selectedAnswer, attempt, currentEntries) {
  if (!question || !attempt || attempt.correct) return { entries: loadMiuMathErrorNotebook(learnerId), entry: null };

  const entry = buildErrorNotebookEntryFromAttempt(attempt, {
    questionType: question.type || question.category || 'math_question',
    userAnswer: selectedAnswer || '',
    correctAnswer: question.correct_answer || '',
    explanation: formatMiuMathExplanation(question),
  });
  if (!entry) return { entries: loadMiuMathErrorNotebook(learnerId), entry: null };

  const entries = Array.isArray(currentEntries) ? currentEntries.map(normalizeErrorNotebookEntry) : loadMiuMathErrorNotebook(learnerId);
  const existingIndex = entries.findIndex((item) => item.questionId === entry.questionId);
  const normalizedEntry = normalizeErrorNotebookEntry(entry);

  if (existingIndex >= 0) {
    entries[existingIndex] = {
      ...normalizedEntry,
      id: entries[existingIndex].id,
      createdAt: entries[existingIndex].createdAt,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: normalizedEntry.createdAt,
      updatedAt: normalizedEntry.createdAt,
    };
  } else {
    entries.push(normalizedEntry);
  }

  return { entries: saveMiuMathErrorNotebook(learnerId, entries), entry: normalizedEntry };
}

export function reviewMiuMathErrorNotebookEntry(learnerId, questionId, grade = 5, currentEntries) {
  const entries = Array.isArray(currentEntries) ? currentEntries.map(normalizeErrorNotebookEntry) : loadMiuMathErrorNotebook(learnerId);
  const index = entries.findIndex((entry) => entry.questionId === `miumath.${questionId}` || entry.questionId === questionId);
  if (index < 0) return { entries, entry: null };

  const reviewed = scheduleErrorNotebookReview(entries[index], grade);
  entries[index] = reviewed;
  return { entries: saveMiuMathErrorNotebook(learnerId, entries), entry: reviewed };
}

export function buildMiuMathErrorNotebookSummary(entries, now = new Date().toISOString()) {
  return {
    ...summarizeErrorNotebook(entries || [], now),
    dueEntries: getDueErrorNotebookEntries(entries || [], now),
  };
}

export function buildMiuMathLearningDashboard(state, questions) {
  const attempts = Array.isArray(state?.attempts) ? state.attempts : [];
  const items = toQuestionItemsFromMiuMath((questions || []).map(normalizeMiuMathQuestion));
  const mastery = computeMastery({ ...state, attempts });
  const skillMastery = mastery.filter((row) => row.scope === 'skill');
  const recommendation = recommendNextAction({ ...state, attempts }, { diagnosticMinAttempts: 8 });
  const reviewItems = buildReviewSet(items, attempts, 5);
  const diagnosticItems = buildDiagnosticSet(items, attempts, { limit: 5, programId: MIU_MATH_PROGRAM_ID });
  const nextItem = recommendation.kind === 'review' ? reviewItems[0] || diagnosticItems[0] : diagnosticItems[0] || reviewItems[0];
  const nextQuestion = nextItem ? questions.find((question) => `miumath.${question.id}` === nextItem.id) || null : null;
  const learningPath = buildMiuMathLearningPath(mastery, recommendation);

  return {
    attempts,
    mastery,
    skillMastery,
    recommendation,
    learningPath,
    nextQuestion,
    totalAttempts: attempts.length,
    stableSkills: skillMastery.filter((row) => row.status === 'stable').length,
    repairSkills: skillMastery.filter((row) => row.status === 'repair').length,
    collectEvidenceSkills: skillMastery.filter((row) => row.status === 'collect_evidence').length,
    topRows: skillMastery.slice(0, 6),
  };
}

export function buildMiuMathDiagnosticQuestions(state, questions, limit = 10) {
  const attempts = Array.isArray(state?.attempts) ? state.attempts : [];
  const normalizedQuestions = (questions || []).map(normalizeMiuMathQuestion);
  const items = toQuestionItemsFromMiuMath(normalizedQuestions);
  const selectedItems = buildDiagnosticSet(items, attempts, { limit, programId: MIU_MATH_PROGRAM_ID });
  const rawQuestionByItemId = new Map((questions || []).map((question) => [`miumath.${question.id}`, question]));
  return selectedItems.map((item) => rawQuestionByItemId.get(item.id)).filter(Boolean);
}

function buildMiuMathLearningPath(mastery, recommendation) {
  const graph = createSeedKnowledgeGraph();
  const programMap = graph.programMaps.find((map) => map.programId === MIU_MATH_PROGRAM_ID);
  const nodes = [
    ...graph.concepts
      .filter((concept) => concept.domainId === MIU_MATH_DOMAIN_ID)
      .map((concept) => ({
        id: concept.id,
        domainId: concept.domainId,
        scope: 'concept',
        label: concept.name,
        programIds: programMap?.conceptIds?.includes(concept.id) ? [MIU_MATH_PROGRAM_ID] : [],
      })),
    ...graph.skills
      .filter((skill) => skill.domainId === MIU_MATH_DOMAIN_ID)
      .map((skill) => ({
        id: skill.id,
        domainId: skill.domainId,
        scope: 'skill',
        label: skill.name,
        programIds: programMap?.skillIds?.includes(skill.id) ? [MIU_MATH_PROGRAM_ID] : [],
      })),
  ];
  const conceptToSkillEdges = graph.skills
    .filter((skill) => skill.domainId === MIU_MATH_DOMAIN_ID)
    .flatMap((skill) =>
      (skill.conceptIds || []).map((conceptId) => ({
        id: `edge.${conceptId}_to_${skill.id}`,
        from: conceptId,
        to: skill.id,
        type: 'supports',
        weight: 0.75,
      })),
    );
  const targetIds = pickMiuMathLearningTargetIds(recommendation, mastery, programMap);

  return buildLearningPath(mastery, nodes, [...graph.edges, ...conceptToSkillEdges], {
    domainId: MIU_MATH_DOMAIN_ID,
    targetIds,
    maxSteps: 7,
    includeSupportEdges: true,
  });
}

function pickMiuMathLearningTargetIds(recommendation, mastery, programMap) {
  const recommended = uniqueStrings([...(recommendation?.conceptIds || []), ...(recommendation?.skillIds || [])]);
  if (recommended.length) return recommended;

  const weakRows = (mastery || [])
    .filter((row) => row.domainId === MIU_MATH_DOMAIN_ID && row.status !== 'stable')
    .slice(0, 3)
    .map((row) => row.id);
  if (weakRows.length) return uniqueStrings(weakRows);

  const grade9Targets = ['math.quadratic_equation', 'math.vieta', 'math.word_problem_modeling'];
  const mappedTargets = grade9Targets.filter((id) => programMap?.conceptIds?.includes(id) || programMap?.skillIds?.includes(id));
  return mappedTargets.length ? mappedTargets : (programMap?.conceptIds || []).slice(0, 3);
}

function normalizeMiuMathQuestion(question) {
  return {
    ...question,
    exam_id: Number(question.exam_id || 0),
    exam_name: question.exam_name || 'Custom question',
    type: question.type || 'multiple_choice',
    difficulty: question.difficulty || 'medium',
    category: question.category || 'algebra-simplification',
    category_vn: question.category_vn || question.category || 'MiuMath',
    question_text: question.question_text || '',
    options: Array.isArray(question.options) ? question.options : [],
    correct_answer: question.correct_answer || '',
    explanation: question.explanation || {},
    sub_category: question.sub_category || '',
    sub_category_vn: question.sub_category_vn || question.sub_category || '',
  };
}

function inferErrorCategories(question) {
  if (question.category === 'word-problems') return ['reading_prompt'];
  if (question.category === 'algebra-simplification') return ['algebra_transform'];
  if (question.category === 'equations-systems' || question.category === 'viet-applications') return ['wrong_formula'];
  if (question.category === 'statistics' || question.category === 'probability') return ['strategy'];
  return ['unknown'];
}

function formatMiuMathExplanation(question) {
  const explanation = question?.explanation || {};
  const parts = [
    explanation.thinking,
    explanation.steps,
    explanation.traps,
    explanation.casio,
  ].filter(Boolean);
  return parts.join('\n\n') || question?.question_text || '';
}

function uniqueStrings(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

function prepareMiuMathSharedLearningEvent(event) {
  if (!event) return null;
  return {
    ...event,
    source: SHARED_LEARNING_EVENT_SOURCE,
    payload: {
      ...(event.payload || {}),
      domainId: MIU_MATH_DOMAIN_ID,
      programId: MIU_MATH_PROGRAM_ID,
    },
  };
}
