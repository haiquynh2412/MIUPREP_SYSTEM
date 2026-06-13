// SAT practice -> learning-event derivation (pure functions).
// Extracted verbatim from App.tsx (roadmap 2.2.3 GĐ2b — slim App.tsx).
// No React/state: deterministic mapping from a SAT question + practice state
// to a structured LearningEventRecord, plus the concept/skill/error inference.
import { buildLearningEvent, type LearningEventRecord } from '@miuprep/learning';
import type { LocalUser } from '@miuprep/db';
import type { SatPracticeState, SatQuestion } from './satPractice';
import { safeFilePart } from './fileUtils';

export function buildSatPracticeLearningEvent(
  learner: LocalUser,
  question: SatQuestion,
  state: SatPracticeState,
  selectedAnswer: string,
  isCorrect: boolean,
): LearningEventRecord {
  const occurredAt = new Date().toISOString();
  const itemId = question.id || `sat-${safeFilePart(state.bankName)}-${state.currentIndex + 1}`;
  const domainId = inferSatLearningDomain(question, state);
  const conceptIds = inferSatLearningConceptIds(question, state, domainId);
  const skillIds = inferSatLearningSkillIds(question, state, domainId);

  return buildLearningEvent(
    'practice_attempt',
    {
      attemptId: `sat-${learner.username}-${itemId}-${safeFilePart(occurredAt)}`,
      itemId,
      domainId,
      programId: 'sat',
      conceptIds,
      skillIds,
      correct: isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      difficulty: question.difficulty || '',
      mode: 'practice',
      selectedAnswer,
      correctAnswer: question.correctAnswer || '',
      errorCategories: isCorrect ? [] : [inferSatErrorCategory(question, domainId)],
      misconceptionIds: isCorrect ? [] : inferSatMisconceptionIds(question, domainId),
      timeSpentSeconds: 0,
      bankName: state.bankName,
      questionIndex: state.currentIndex,
      sourceSurface: 'sat_practice_board',
    },
    {
      learnerId: learner.username,
      entityType: 'learning_item',
      entityId: itemId,
      occurredAt,
      source: 'miuprep_portal_sat_practice',
    },
  );
}

function inferSatLearningDomain(question: SatQuestion, state: SatPracticeState): string {
  const value =
    `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''} ${state.domain || ''}`.toLowerCase();
  return value.includes('math') || value.includes('algebra') || value.includes('geometry')
    ? 'mathematics'
    : 'english_core';
}

function inferSatLearningConceptIds(question: SatQuestion, state: SatPracticeState, domainId: string): string[] {
  const value = satTopicValue(question, state);
  if (domainId === 'mathematics') {
    if (value.includes('advanced') || value.includes('quadratic') || value.includes('function')) {
      return ['math.quadratic_equation', 'math.functions_graphs', 'math.algebraic_expression'];
    }
    if (value.includes('geometry') || value.includes('trigonometry')) {
      return ['math.plane_geometry', 'math.trigonometry', 'math.spatial_geometry'];
    }
    if (value.includes('data') || value.includes('probability') || value.includes('statistics')) {
      return ['math.statistics', 'math.probability', 'math.word_problem_modeling'];
    }
    return ['math.linear_equation', 'math.algebraic_expression'];
  }
  if (value.includes('standard') || value.includes('grammar') || value.includes('convention')) {
    return ['eng.grammar_accuracy', 'eng.sentence_structure', 'eng.verb_tense_aspect'];
  }
  if (value.includes('craft') || value.includes('structure') || value.includes('vocab')) {
    return ['eng.vocabulary_range', 'eng.reading_argument_structure', 'eng.reading_inference'];
  }
  if (value.includes('expression') || value.includes('ideas')) {
    return ['eng.cohesion_reference', 'eng.reading_argument_structure', 'eng.academic_register'];
  }
  return ['eng.reading_main_idea', 'eng.reading_detail', 'eng.reading_inference'];
}

function inferSatLearningSkillIds(question: SatQuestion, state: SatPracticeState, domainId: string): string[] {
  const value = satTopicValue(question, state);
  if (domainId === 'mathematics') {
    if (value.includes('advanced') || value.includes('quadratic') || value.includes('function')) {
      return ['math.solve_quadratic_by_factor', 'math.analyze_function_graph', 'math.simplify_expression'];
    }
    if (value.includes('geometry') || value.includes('trigonometry')) {
      return ['math.prove_circle_geometry', 'math.use_trig_ratios', 'math.compute_solid_measure'];
    }
    if (value.includes('data') || value.includes('probability') || value.includes('statistics')) {
      return ['math.interpret_statistics', 'math.compute_probability', 'math.model_word_problem'];
    }
    return ['math.solve_linear_equation', 'math.solve_system', 'math.simplify_expression'];
  }
  if (value.includes('standard') || value.includes('grammar') || value.includes('convention')) {
    return ['eng.control_clause_structure', 'eng.edit_sentence_errors', 'eng.control_tense_aspect'];
  }
  if (value.includes('craft') || value.includes('structure') || value.includes('vocab')) {
    return ['eng.use_collocation', 'eng.evaluate_argument_flow', 'eng.infer_implicit_meaning'];
  }
  if (value.includes('expression') || value.includes('ideas')) {
    return ['eng.track_cohesive_reference', 'eng.evaluate_argument_flow', 'eng.choose_register'];
  }
  return ['eng.identify_main_idea', 'eng.identify_specific_detail', 'eng.infer_implicit_meaning'];
}

function inferSatErrorCategory(question: SatQuestion, domainId: string): string {
  const value = `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''}`.toLowerCase();
  if (domainId === 'mathematics') return value.includes('geometry') ? 'reading_prompt' : 'calculation';
  if (value.includes('grammar') || value.includes('standard')) return 'grammar';
  if (value.includes('vocab') || value.includes('word')) return 'vocabulary';
  if (value.includes('inference') || value.includes('evidence')) return 'inference';
  return 'reading_prompt';
}

function inferSatMisconceptionIds(question: SatQuestion, domainId: string): string[] {
  const value = `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''}`.toLowerCase();
  if (domainId === 'mathematics') {
    if (value.includes('algebra')) return ['mis.math.factor_vs_expand'];
    return ['mis.math.calculation_slip'];
  }
  if (value.includes('inference') || value.includes('evidence')) return ['mis.eng.inference_literal_only'];
  return [];
}

function satTopicValue(question: SatQuestion, state: SatPracticeState): string {
  return `${question.domain || ''} ${question.skill || ''} ${question.canonicalSkill || ''} ${state.domain || ''} ${state.skill || ''}`.toLowerCase();
}
