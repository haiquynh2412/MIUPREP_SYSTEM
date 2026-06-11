import type { CriteriaScore, SpeakingFeedback, WritingFeedback } from '@miuprep/db';
import {
  recordLearningFeedback,
  type ErrorCategory,
  type LearningEventRecord,
  type StudentModel,
} from '@miuprep/learning';

export const AI_TUTOR_FEEDBACK_SCHEMA_VERSION = 'ai_tutor_feedback_v1';

export type TutorTrack = 'math' | 'ielts' | 'sat' | 'cae' | 'cpe' | string;

export interface AITutorQuestionInput {
  learnerId: string;
  itemId: string;
  track?: TutorTrack;
  domainId?: string;
  programId?: string;
  questionText?: string;
  userAnswer?: string;
  correctAnswer?: string;
  workedSolution?: string;
  conceptIds?: string[];
  skillIds?: string[];
  misconceptionIds?: string[];
  errorCategories?: ErrorCategory[];
  metadataLabels?: Record<string, string>;
  occurredAt?: string;
  source?: string;
}

export interface RemediationLessonSuggestion {
  id: string;
  title: string;
  objective: string;
  actionType: 'review_concept' | 'drill_skill' | 'redo_question' | 'micro_lesson';
  conceptIds: string[];
  skillIds: string[];
  estimatedMinutes: number;
}

export interface AITutorFeedback {
  schemaVersion: typeof AI_TUTOR_FEEDBACK_SCHEMA_VERSION;
  id: string;
  learnerId: string;
  itemId: string;
  track: TutorTrack;
  domainId: string;
  programId: string;
  conceptIds: string[];
  skillIds: string[];
  misconceptionIds: string[];
  classifiedErrorCategories: ErrorCategory[];
  explanation: string;
  socraticHints: string[];
  remediationLessons: RemediationLessonSuggestion[];
  confidence: number;
  confidenceReasons: string[];
  createdAt: string;
  source: string;
}

export interface TutorWritingAdapter {
  gradeWriting(params: {
    attemptId: string;
    essay: string;
    taskNumber: 1 | 2;
    promptInstruction?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  }): Promise<WritingFeedback>;
}

export interface TutorSpeakingAdapter {
  gradeSpeaking(params: {
    attemptId: string;
    audioPath?: string;
    audioBase64?: string;
    transcriptMock?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  }): Promise<SpeakingFeedback>;
}

export interface TutorEventResult<TFeedback> {
  state: StudentModel;
  event: LearningEventRecord;
  feedback: TFeedback;
}

export type ProductiveFeedbackType = 'writing' | 'speaking';

export type ProductiveSkillActionArea =
  | 'task_response'
  | 'coherence'
  | 'lexical_resource'
  | 'grammar'
  | 'register'
  | 'fluency'
  | 'pronunciation'
  | 'lexical_range'
  | 'grammar_accuracy'
  | 'interaction';

export interface FeedbackPracticeTask {
  id: string;
  feedbackType: ProductiveFeedbackType;
  track: TutorTrack;
  attemptId: string;
  area: ProductiveSkillActionArea;
  sourceCriterion: string;
  priority: number;
  title: string;
  prompt: string;
  instructions: string[];
  successCriteria: string[];
  estimatedMinutes: number;
  outputType: 'rewritten_paragraph' | 'sentence_bank' | 'recorded_response' | 'transcript_review' | 'checklist';
  evidence: string[];
  targetScore?: number;
}

export interface FeedbackRevisionLoop {
  id: string;
  feedbackType: ProductiveFeedbackType;
  track: TutorTrack;
  steps: {
    label: string;
    action: string;
    evidence: string;
  }[];
  compareChecklist: string[];
  validityGate: {
    masteryEligible: boolean;
    requirements: string[];
  };
}

export interface FeedbackToPracticePlan {
  schemaVersion: 'feedback_to_practice_v1';
  id: string;
  feedbackType: ProductiveFeedbackType;
  track: TutorTrack;
  attemptId: string;
  weakestAreas: ProductiveSkillActionArea[];
  tasks: FeedbackPracticeTask[];
  revisionLoop: FeedbackRevisionLoop;
  confidence: number;
  createdAt: string;
  source: string;
}

export interface ProductiveSkillGoldenSample {
  sampleId: string;
  feedbackType: ProductiveFeedbackType;
  feedback: WritingFeedback | SpeakingFeedback;
  responseText?: string;
  expertOverall?: number;
  expertCriteria?: Record<string, number>;
  provider?: string;
  allowedOverallDeviation?: number;
  allowedCriterionDeviation?: number;
}

export interface ProductiveFeedbackReliability {
  schemaVersion: 'productive_feedback_reliability_v1';
  feedbackType: ProductiveFeedbackType;
  provider: string;
  confidence: number;
  rawConfidence: number;
  outputWordCount: number;
  evidenceCount: number;
  issueDensityPer100Words: number;
  reasons: string[];
}

export interface ProductiveSkillGovernanceFinding {
  sampleId: string;
  feedbackType: ProductiveFeedbackType;
  severity: 'pass' | 'watch' | 'blocked';
  reason: string;
  detail: string;
}

export interface ProductiveSkillGovernanceReport {
  schemaVersion: 'productive_skill_governance_v1';
  generatedAt: string;
  status: 'pass' | 'watch' | 'blocked';
  samples: number;
  passedSamples: number;
  watchSamples: number;
  blockedSamples: number;
  averageOverallDeviation: number;
  maxOverallDeviation: number;
  averageReliabilityConfidence: number;
  minReliabilityConfidence: number;
  masteryPolicy: 'feedback_only_locked';
  masteryEligible: false;
  consensusPolicy: 'validation_only';
  requiredFields: string[];
  findings: ProductiveSkillGovernanceFinding[];
  detail: string;
}

export interface SpeakingRecordingSlot {
  id: string;
  label: 'Original attempt' | 'Targeted rerecord' | 'Teacher check';
  status: 'available' | 'pending';
  transcriptRequired: boolean;
  audioRequired: boolean;
  evidenceType: 'audio_or_transcript' | 'rubric_review';
}

export interface SpeakingFeedbackPracticeState {
  schemaVersion: 'speaking_feedback_practice_state_v1';
  id: string;
  attemptId: string;
  track: TutorTrack;
  originalTranscript: string;
  transcriptStatus: 'captured' | 'missing';
  recordingSlots: SpeakingRecordingSlot[];
  linkedPracticeTaskIds: string[];
  scoringReady: boolean;
  nextScoringRequirements: string[];
  updatedAt: string;
}

export interface FeedbackToPracticeOptions {
  track?: TutorTrack;
  learnerId?: string;
  promptInstruction?: string;
  maxTasks?: number;
  now?: string;
}

export function generateQuestionTutorFeedback(input: AITutorQuestionInput): AITutorFeedback {
  const createdAt = input.occurredAt || new Date().toISOString();
  const classifiedErrorCategories = classifyTutorError(input);
  const conceptIds = uniqueStrings(input.conceptIds || []);
  const skillIds = uniqueStrings(input.skillIds || []);
  const confidence = estimateTutorConfidence(input, classifiedErrorCategories);

  return {
    schemaVersion: AI_TUTOR_FEEDBACK_SCHEMA_VERSION,
    id: `ai-tutor-${stableChecksum([input.learnerId, input.itemId, createdAt].join('|'))}`,
    learnerId: input.learnerId,
    itemId: input.itemId,
    track: input.track || inferTrack(input),
    domainId: input.domainId || inferDomain(input),
    programId: input.programId || inferProgram(input),
    conceptIds,
    skillIds,
    misconceptionIds: uniqueStrings(input.misconceptionIds || []),
    classifiedErrorCategories,
    explanation: buildTutorExplanation(input, classifiedErrorCategories),
    socraticHints: buildSocraticHints(input, classifiedErrorCategories),
    remediationLessons: buildRemediationLessons(input, classifiedErrorCategories),
    confidence,
    confidenceReasons: buildConfidenceReasons(input, confidence),
    createdAt,
    source: input.source || 'miuprep_ai_tutor_core',
  };
}

export function recordQuestionTutorFeedback(
  state: StudentModel,
  input: AITutorQuestionInput,
  feedback: AITutorFeedback = generateQuestionTutorFeedback(input),
): TutorEventResult<AITutorFeedback> {
  const recorded = recordLearningFeedback(state, {
    learnerId: input.learnerId || state.learnerId,
    itemId: input.itemId,
    domainId: feedback.domainId,
    programId: feedback.programId,
    conceptIds: feedback.conceptIds,
    skillIds: feedback.skillIds,
    area: 'ai_tutor',
    feedback: feedback.explanation,
    occurredAt: feedback.createdAt,
    source: feedback.source,
    payload: {
      aiFeedbackType: 'wrong_answer_tutor',
      confidence: feedback.confidence,
      confidenceReasons: feedback.confidenceReasons,
      classifiedErrorCategories: feedback.classifiedErrorCategories,
      misconceptionIds: feedback.misconceptionIds,
      socraticHints: feedback.socraticHints,
      remediationLessons: feedback.remediationLessons,
      schemaVersion: feedback.schemaVersion,
    },
  });

  return { ...recorded, feedback };
}

export async function gradeWritingWithTutorEvent(
  adapter: TutorWritingAdapter,
  state: StudentModel,
  params: {
    attemptId: string;
    essay: string;
    taskNumber: 1 | 2;
    promptInstruction?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  },
  context: Partial<AITutorQuestionInput> = {},
): Promise<TutorEventResult<WritingFeedback>> {
  const feedback = await adapter.gradeWriting(params);
  const provider = inferProvider(feedback.modelUsed, context.source);
  const reliability = scoreProductiveFeedbackReliability(feedback, 'writing', { responseText: params.essay, provider });
  const practicePlan = generateWritingFeedbackPracticePlan(feedback, {
    track: params.track || context.programId || 'ielts',
    learnerId: context.learnerId || state.learnerId,
    promptInstruction: params.promptInstruction,
  });
  const recorded = recordLearningFeedback(state, {
    learnerId: context.learnerId || state.learnerId,
    itemId: context.itemId || params.attemptId,
    domainId: context.domainId || 'english_core',
    programId: context.programId || params.track || 'ielts',
    conceptIds: uniqueStrings(context.conceptIds || ['eng.academic_writing']),
    skillIds: uniqueStrings(context.skillIds || ['eng.develop_academic_argument']),
    area: 'writing',
    feedback: summarizeWritingFeedback(feedback),
    rubricScores: rubricScores(feedback),
    source: context.source || 'miuprep_ai_writing_tutor',
    occurredAt: feedback.createdAt,
    payload: {
      aiFeedbackType: 'writing',
      attemptId: feedback.attemptId,
      modelUsed: feedback.modelUsed,
      provider,
      confidence: reliability.confidence,
      rawConfidence: reliability.rawConfidence,
      confidenceReasons: reliability.reasons,
      reliability,
      rubricVersion: feedback.rubricVersion || '',
      descriptorSource: feedback.descriptorSource || '',
      evidence: collectFeedbackEvidence(feedback),
      createdAt: feedback.createdAt,
      practicePlan,
      feedback,
    },
  });

  return { ...recorded, feedback };
}

export async function gradeSpeakingWithTutorEvent(
  adapter: TutorSpeakingAdapter,
  state: StudentModel,
  params: {
    attemptId: string;
    audioPath?: string;
    audioBase64?: string;
    transcriptMock?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  },
  context: Partial<AITutorQuestionInput> = {},
): Promise<TutorEventResult<SpeakingFeedback>> {
  const feedback = await adapter.gradeSpeaking(params);
  const provider = inferProvider(feedback.modelUsed, context.source);
  const reliability = scoreProductiveFeedbackReliability(feedback, 'speaking', { responseText: feedback.transcript || params.transcriptMock || '', provider });
  const practicePlan = generateSpeakingFeedbackPracticePlan(feedback, {
    track: params.track || context.programId || 'ielts',
    learnerId: context.learnerId || state.learnerId,
  });
  const speakingPracticeState = buildSpeakingFeedbackPracticeState(feedback, practicePlan);
  const recorded = recordLearningFeedback(state, {
    learnerId: context.learnerId || state.learnerId,
    itemId: context.itemId || params.attemptId,
    domainId: context.domainId || 'english_core',
    programId: context.programId || params.track || 'ielts',
    conceptIds: uniqueStrings(context.conceptIds || ['eng.academic_register']),
    skillIds: uniqueStrings(context.skillIds || []),
    area: 'speaking',
    feedback: summarizeSpeakingFeedback(feedback),
    rubricScores: rubricScores(feedback),
    source: context.source || 'miuprep_ai_speaking_tutor',
    occurredAt: feedback.createdAt,
    payload: {
      aiFeedbackType: 'speaking',
      attemptId: feedback.attemptId,
      modelUsed: feedback.modelUsed,
      provider,
      confidence: reliability.confidence,
      rawConfidence: reliability.rawConfidence,
      confidenceReasons: reliability.reasons,
      reliability,
      rubricVersion: feedback.rubricVersion || '',
      descriptorSource: feedback.descriptorSource || '',
      evidence: collectFeedbackEvidence(feedback),
      createdAt: feedback.createdAt,
      practicePlan,
      speakingPracticeState,
      feedback,
    },
  });

  return { ...recorded, feedback };
}

export function generateWritingFeedbackPracticePlan(
  feedback: WritingFeedback,
  options: FeedbackToPracticeOptions = {},
): FeedbackToPracticePlan {
  const track = options.track || inferTrackFromFeedback(feedback, 'writing');
  const createdAt = options.now || feedback.createdAt || new Date().toISOString();
  const maxTasks = clampWholeNumber(options.maxTasks || 3, 1, 3);
  const signals = selectProductiveSignals(feedback.criteria, 'writing', track, maxTasks, [
    ...(feedback.suggestionsForImprovement || []),
    ...(feedback.corrections || []).map((item) => item.reason),
    options.promptInstruction || '',
  ]);
  const tasks = signals.map((signal, index) => buildPracticeTask({
    attemptId: feedback.attemptId,
    feedbackType: 'writing',
    track,
    signal,
    priority: index + 1,
    createdAt,
    feedback,
  }));

  return {
    schemaVersion: 'feedback_to_practice_v1',
    id: `writing-plan-${stableChecksum([feedback.attemptId, track, createdAt, tasks.map((task) => task.area).join(',')].join('|'))}`,
    feedbackType: 'writing',
    track,
    attemptId: feedback.attemptId,
    weakestAreas: tasks.map((task) => task.area),
    tasks,
    revisionLoop: buildRevisionLoop('writing', track, feedback.attemptId, tasks, createdAt),
    confidence: normalizeConfidence(feedback.confidence),
    createdAt,
    source: 'miuprep_feedback_to_practice_core',
  };
}

export function generateSpeakingFeedbackPracticePlan(
  feedback: SpeakingFeedback,
  options: FeedbackToPracticeOptions = {},
): FeedbackToPracticePlan {
  const track = options.track || inferTrackFromFeedback(feedback, 'speaking');
  const createdAt = options.now || feedback.createdAt || new Date().toISOString();
  const maxTasks = clampWholeNumber(options.maxTasks || 3, 1, 3);
  const signals = selectProductiveSignals(feedback.criteria, 'speaking', track, maxTasks, [
    feedback.fluencyReview || '',
    ...(feedback.pronunciationErrors || []).map((item) => `${item.word} ${item.suggestion}`),
    feedback.transcript || '',
  ]);
  const tasks = signals.map((signal, index) => buildPracticeTask({
    attemptId: feedback.attemptId,
    feedbackType: 'speaking',
    track,
    signal,
    priority: index + 1,
    createdAt,
    feedback,
  }));

  return {
    schemaVersion: 'feedback_to_practice_v1',
    id: `speaking-plan-${stableChecksum([feedback.attemptId, track, createdAt, tasks.map((task) => task.area).join(',')].join('|'))}`,
    feedbackType: 'speaking',
    track,
    attemptId: feedback.attemptId,
    weakestAreas: tasks.map((task) => task.area),
    tasks,
    revisionLoop: buildRevisionLoop('speaking', track, feedback.attemptId, tasks, createdAt),
    confidence: normalizeConfidence(feedback.confidence),
    createdAt,
    source: 'miuprep_feedback_to_practice_core',
  };
}

export function buildSpeakingFeedbackPracticeState(
  feedback: SpeakingFeedback,
  plan: FeedbackToPracticePlan = generateSpeakingFeedbackPracticePlan(feedback),
  options: FeedbackToPracticeOptions = {},
): SpeakingFeedbackPracticeState {
  const track = options.track || plan.track || inferTrackFromFeedback(feedback, 'speaking');
  const updatedAt = options.now || feedback.createdAt || new Date().toISOString();
  const originalTranscript = (feedback.transcript || '').trim();
  return {
    schemaVersion: 'speaking_feedback_practice_state_v1',
    id: `speaking-state-${stableChecksum([feedback.attemptId, track, updatedAt].join('|'))}`,
    attemptId: feedback.attemptId,
    track,
    originalTranscript,
    transcriptStatus: originalTranscript ? 'captured' : 'missing',
    recordingSlots: [
      {
        id: `${feedback.attemptId}-original`,
        label: 'Original attempt',
        status: originalTranscript ? 'available' : 'pending',
        transcriptRequired: true,
        audioRequired: false,
        evidenceType: 'audio_or_transcript',
      },
      {
        id: `${feedback.attemptId}-rerecord`,
        label: 'Targeted rerecord',
        status: 'pending',
        transcriptRequired: true,
        audioRequired: true,
        evidenceType: 'audio_or_transcript',
      },
      {
        id: `${feedback.attemptId}-teacher-check`,
        label: 'Teacher check',
        status: 'pending',
        transcriptRequired: false,
        audioRequired: false,
        evidenceType: 'rubric_review',
      },
    ],
    linkedPracticeTaskIds: plan.tasks.map((task) => task.id),
    scoringReady: false,
    nextScoringRequirements: [
      'Attach the targeted rerecording or verified transcript.',
      'Run the same speaking rubric on the original and revised response.',
      'Require teacher validation or stable double-scored AI agreement before mastery updates.',
    ],
    updatedAt,
  };
}

export function scoreProductiveFeedbackReliability(
  feedback: WritingFeedback | SpeakingFeedback,
  feedbackType: ProductiveFeedbackType,
  options: { responseText?: string; provider?: string } = {},
): ProductiveFeedbackReliability {
  const provider = options.provider || inferProvider(feedback.modelUsed, '');
  const rawConfidence = normalizeConfidence(feedback.confidence);
  const responseText = options.responseText || ('transcript' in feedback ? feedback.transcript : '');
  const outputWordCount = countWords(responseText);
  const evidenceCount = collectFeedbackEvidence(feedback).length;
  const issueCount = 'corrections' in feedback ? (feedback.corrections || []).length : (feedback.pronunciationErrors || []).length;
  const issueDensityPer100Words = outputWordCount > 0 ? round2((issueCount / outputWordCount) * 100) : issueCount > 0 ? 100 : 0;
  const reasons: string[] = [];
  let score = rawConfidence;

  if (feedback.rubricVersion) {
    score += 0.02;
    reasons.push('rubric version present');
  } else {
    score -= 0.08;
    reasons.push('missing rubric version');
  }

  if (feedback.descriptorSource) {
    score += 0.02;
    reasons.push('descriptor source present');
  } else {
    score -= 0.08;
    reasons.push('missing descriptor source');
  }

  if ((feedback.criteria || []).length >= 4) {
    score += 0.04;
    reasons.push('complete rubric criteria');
  } else {
    score -= 0.1;
    reasons.push('incomplete rubric criteria');
  }

  if (evidenceCount >= 4) {
    score += 0.04;
    reasons.push('sufficient scoring evidence');
  } else {
    score -= 0.06;
    reasons.push('thin scoring evidence');
  }

  const minimumWords = feedbackType === 'writing' ? 80 : 20;
  const strongWords = feedbackType === 'writing' ? 180 : 50;
  if (outputWordCount === 0) {
    score -= 0.03;
    reasons.push('response text unavailable for length check');
  } else if (outputWordCount < minimumWords) {
    score -= 0.1;
    reasons.push(`short ${feedbackType} sample`);
  } else if (outputWordCount >= strongWords) {
    score += 0.03;
    reasons.push(`adequate ${feedbackType} length`);
  }

  if (issueDensityPer100Words > 8) {
    score -= 0.05;
    reasons.push('high issue density');
  }

  if (!provider || provider === 'unknown') {
    score -= 0.08;
    reasons.push('unknown provider');
  } else {
    reasons.push(`provider ${provider}`);
  }

  return {
    schemaVersion: 'productive_feedback_reliability_v1',
    feedbackType,
    provider: provider || 'unknown',
    confidence: round2(clamp(score, 0.35, 0.99)),
    rawConfidence,
    outputWordCount,
    evidenceCount,
    issueDensityPer100Words,
    reasons: uniqueStrings(reasons),
  };
}

export function buildProductiveSkillGovernanceReport(
  samples: ProductiveSkillGoldenSample[] = [],
  options: { generatedAt?: string; defaultOverallDeviation?: number; defaultCriterionDeviation?: number } = {},
): ProductiveSkillGovernanceReport {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const findings = samples.flatMap((sample) => evaluateProductiveSkillSample(sample, options));
  const deviations = samples
    .map((sample) => typeof sample.expertOverall === 'number' ? Math.abs(Number(sample.feedback.bandOverall || 0) - sample.expertOverall) : NaN)
    .filter((value) => Number.isFinite(value));
  const reliabilityRows = samples.map((sample) =>
    scoreProductiveFeedbackReliability(sample.feedback, sample.feedbackType, {
      responseText: sample.responseText,
      provider: sample.provider || inferProvider(sample.feedback.modelUsed, ''),
    }),
  );
  const reliabilityConfidences = reliabilityRows.map((row) => row.confidence);
  const blockedSamples = new Set(findings.filter((finding) => finding.severity === 'blocked').map((finding) => finding.sampleId)).size;
  const watchSamples = new Set(findings.filter((finding) => finding.severity === 'watch').map((finding) => finding.sampleId)).size;
  const passedSamples = Math.max(0, samples.length - blockedSamples - watchSamples);
  const status = samples.length === 0 ? 'watch' : blockedSamples > 0 ? 'blocked' : watchSamples > 0 ? 'watch' : 'pass';

  return {
    schemaVersion: 'productive_skill_governance_v1',
    generatedAt,
    status,
    samples: samples.length,
    passedSamples,
    watchSamples,
    blockedSamples,
    averageOverallDeviation: round2(averageNumber(deviations)),
    maxOverallDeviation: deviations.length ? Math.max(...deviations.map((value) => round2(value))) : 0,
    averageReliabilityConfidence: round2(averageNumber(reliabilityConfidences)),
    minReliabilityConfidence: reliabilityConfidences.length ? Math.min(...reliabilityConfidences) : 0,
    masteryPolicy: 'feedback_only_locked',
    masteryEligible: false,
    consensusPolicy: 'validation_only',
    requiredFields: [
      'attemptId',
      'modelUsed',
      'provider',
      'rubricVersion',
      'descriptorSource',
      'confidence',
      'criteria',
      'evidence',
      'createdAt',
    ],
    findings: findings.length ? findings : [
      {
        sampleId: samples.length ? 'all' : 'none',
        feedbackType: samples[0]?.feedbackType || 'writing',
        severity: samples.length ? 'pass' : 'watch',
        reason: samples.length ? 'governance_passed' : 'no_golden_samples',
        detail: samples.length
          ? 'All supplied productive-skill samples met metadata and deviation gates.'
          : 'No golden samples were supplied; productive-skill mastery remains locked.',
      },
    ],
    detail:
      status === 'blocked'
        ? 'At least one productive-skill sample is missing required provenance or exceeds reliability thresholds.'
        : status === 'watch'
          ? 'Productive-skill scoring is available for feedback/practice only; more or cleaner golden samples are needed before policy changes.'
          : 'Productive-skill feedback passed the supplied governance sample checks, but mastery remains feedback-only.',
  };
}

export function classifyTutorError(input: AITutorQuestionInput): ErrorCategory[] {
  const provided = uniqueErrorCategories(input.errorCategories || []).filter((item) => item !== 'none' && item !== 'unknown');
  if (provided.length) return provided;

  const haystack = normalizeText([
    input.questionText || '',
    input.userAnswer || '',
    input.correctAnswer || '',
    input.workedSolution || '',
    ...(input.conceptIds || []),
    ...(input.skillIds || []),
  ].join(' '));
  const result: ErrorCategory[] = [];

  if (containsAny(haystack, ['sqrt', 'quadratic', 'equation', 'factor', 'vieta', 'bien doi', 'phuong trinh'])) {
    result.push('algebra_transform');
  }
  if (containsAny(haystack, ['formula', 'cong thuc', 'geometry', 'circle', 'triangle', 'duong tron', 'tam giac'])) {
    result.push('wrong_formula');
  }
  if (containsAny(haystack, ['condition', 'domain', 'constraint', 'dieu kien'])) {
    result.push('missing_condition');
  }
  if (containsAny(haystack, ['calculate', 'arithmetic', 'compute', 'tinh toan'])) {
    result.push('calculation');
  }
  if (containsAny(haystack, ['vocabulary', 'word meaning', 'collocation', 'lexical', 'phrase'])) {
    result.push(haystack.includes('collocation') ? 'collocation' : 'vocabulary');
  }
  if (containsAny(haystack, ['grammar', 'sentence', 'tense', 'clause', 'agreement'])) {
    result.push('grammar');
  }
  if (containsAny(haystack, ['infer', 'inference', 'implicit', 'main idea', 'reading'])) {
    result.push('inference');
  }
  if (containsAny(haystack, ['time', 'pacing', 'too slow'])) {
    result.push('time_management');
  }

  if (!result.length) result.push(input.domainId === 'mathematics' || input.track === 'math' ? 'strategy' : 'unknown');
  return uniqueErrorCategories(result);
}

interface ProductiveSkillSignal {
  area: ProductiveSkillActionArea;
  criterionName: string;
  score?: number;
  nextAction?: string;
  evidence: string[];
}

interface PracticeTaskBuildInput {
  attemptId: string;
  feedbackType: ProductiveFeedbackType;
  track: TutorTrack;
  signal: ProductiveSkillSignal;
  priority: number;
  createdAt: string;
  feedback: WritingFeedback | SpeakingFeedback;
}

interface PracticeTaskTemplate {
  title: string;
  prompt: string;
  instructions: string[];
  successCriteria: string[];
  estimatedMinutes: number;
  outputType: FeedbackPracticeTask['outputType'];
}

function selectProductiveSignals(
  criteria: CriteriaScore[],
  feedbackType: ProductiveFeedbackType,
  track: TutorTrack,
  maxTasks: number,
  supplementalText: string[],
): ProductiveSkillSignal[] {
  const defaultAreas: ProductiveSkillActionArea[] = feedbackType === 'writing'
    ? ['task_response', 'coherence', 'lexical_resource', 'grammar', 'register']
    : ['fluency', 'pronunciation', 'lexical_range', 'grammar_accuracy', 'interaction'];
  const text = normalizeText([track, ...supplementalText].join(' '));
  const signals = criteria
    .map((criterion) => ({
      area: feedbackType === 'writing'
        ? mapWritingCriterionToArea(criterion.criterionName)
        : mapSpeakingCriterionToArea(criterion.criterionName),
      criterionName: criterion.criterionName,
      score: typeof criterion.band === 'number' ? criterion.band : undefined,
      nextAction: criterion.nextAction,
      evidence: uniqueStrings([
        ...(criterion.evidence || []),
        criterion.whyNotHigher || '',
        criterion.feedbackText || '',
      ]).slice(0, 3),
    }))
    .sort((left, right) => scoreForSort(left.score) - scoreForSort(right.score));

  const byArea = new Map<ProductiveSkillActionArea, ProductiveSkillSignal>();
  signals.forEach((signal) => {
    if (!byArea.has(signal.area)) byArea.set(signal.area, signal);
  });

  if (feedbackType === 'writing' && !byArea.has('register') && (track === 'cpe' || track === 'cae' || containsAny(text, ['register', 'tone', 'formal', 'audience', 'proposal', 'article', 'letter']))) {
    byArea.set('register', {
      area: 'register',
      criterionName: 'Register and audience fit',
      nextAction: 'Rewrite one opening or closing sentence for the exact reader and purpose.',
      evidence: ['Register risk inferred from task type or feedback text.'],
    });
  }
  if (feedbackType === 'speaking' && !byArea.has('pronunciation') && containsAny(text, ['pronunciation', 'pronounce', 'stress', 'intonation'])) {
    byArea.set('pronunciation', {
      area: 'pronunciation',
      criterionName: 'Pronunciation',
      nextAction: 'Repair one sound, word stress, or intonation pattern before rerecording.',
      evidence: ['Pronunciation risk inferred from feedback text.'],
    });
  }
  if (feedbackType === 'speaking' && !byArea.has('interaction') && (track === 'cpe' || track === 'cae' || containsAny(text, ['interaction', 'turn-taking', 'collaborative', 'partner']))) {
    byArea.set('interaction', {
      area: 'interaction',
      criterionName: 'Interactive communication',
      nextAction: 'Extend, contrast, and invite a response instead of giving a single closed answer.',
      evidence: ['Interaction is a high-value Cambridge speaking criterion.'],
    });
  }

  defaultAreas.forEach((area) => {
    if (!byArea.has(area)) {
      byArea.set(area, {
        area,
        criterionName: criterionNameForArea(area),
        nextAction: defaultNextAction(area),
        evidence: ['Default repair path added because the feedback had fewer rubric signals than the practice loop needs.'],
      });
    }
  });

  return [...byArea.values()]
    .sort((left, right) => scoreForSort(left.score) - scoreForSort(right.score))
    .slice(0, maxTasks);
}

function buildPracticeTask(input: PracticeTaskBuildInput): FeedbackPracticeTask {
  const template = practiceTemplate(input.feedbackType, input.signal.area);
  const taskEvidence = extractPracticeEvidence(input.feedback, input.signal);
  return {
    id: `${input.feedbackType}-task-${input.priority}-${stableChecksum([input.attemptId, input.track, input.signal.area, input.createdAt].join('|'))}`,
    feedbackType: input.feedbackType,
    track: input.track,
    attemptId: input.attemptId,
    area: input.signal.area,
    sourceCriterion: input.signal.criterionName,
    priority: input.priority,
    title: template.title,
    prompt: template.prompt,
    instructions: uniqueStrings([
      input.signal.nextAction || '',
      ...template.instructions,
    ]).slice(0, 4),
    successCriteria: template.successCriteria,
    estimatedMinutes: template.estimatedMinutes,
    outputType: template.outputType,
    evidence: taskEvidence,
    targetScore: input.signal.score,
  };
}

function practiceTemplate(feedbackType: ProductiveFeedbackType, area: ProductiveSkillActionArea): PracticeTaskTemplate {
  if (feedbackType === 'writing') {
    if (area === 'task_response') {
      return {
        title: 'Claim-evidence-expansion drill',
        prompt: 'Repair the paragraph that least answers the task.',
        instructions: [
          'Write one precise claim that directly answers the prompt.',
          'Add one concrete example or data point.',
          'Add one sentence explaining why the evidence proves the claim.',
        ],
        successCriteria: ['The claim answers the exact prompt.', 'The evidence is specific, not generic.', 'The explanation links back to the thesis.'],
        estimatedMinutes: 10,
        outputType: 'rewritten_paragraph',
      };
    }
    if (area === 'coherence') {
      return {
        title: 'Paragraph bridge drill',
        prompt: 'Make the reader feel the logic before adding new ideas.',
        instructions: [
          'Rewrite the topic sentence of one weak paragraph.',
          'Add one backward link to the previous idea.',
          'Add one forward signpost for the next sentence.',
        ],
        successCriteria: ['Topic sentence states the paragraph role.', 'Transitions show logic, not decoration.', 'No paragraph starts with a vague phrase.'],
        estimatedMinutes: 8,
        outputType: 'rewritten_paragraph',
      };
    }
    if (area === 'lexical_resource') {
      return {
        title: 'Precision vocabulary swap',
        prompt: 'Replace vague words with exact collocations.',
        instructions: [
          'Underline five vague words or repeated phrases.',
          'Replace each one with a natural collocation.',
          'Check that the new phrase fits the register and meaning.',
        ],
        successCriteria: ['Five upgraded phrases are context-appropriate.', 'No word is upgraded just to sound complex.', 'At least two collocations are reusable.'],
        estimatedMinutes: 9,
        outputType: 'sentence_bank',
      };
    }
    if (area === 'grammar') {
      return {
        title: 'Accuracy repair drill',
        prompt: 'Rebuild sentence control before rewriting the full answer.',
        instructions: [
          'Choose three error-prone sentences from the draft.',
          'Rewrite each with one clear main clause.',
          'Add controlled subordination only after the core sentence is correct.',
        ],
        successCriteria: ['Subject-verb agreement is correct.', 'Clause boundaries are clear.', 'Punctuation supports meaning.'],
        estimatedMinutes: 10,
        outputType: 'sentence_bank',
      };
    }
    return {
      title: 'Register and reader-fit pass',
      prompt: 'Make the answer sound right for the task, audience, and genre.',
      instructions: [
        'Name the reader, purpose, and expected tone.',
        'Rewrite the opening and closing in that tone.',
        'Remove one phrase that sounds too casual, inflated, or off-genre.',
      ],
      successCriteria: ['Tone matches the genre.', 'Opening sets the purpose quickly.', 'Closing leaves the right reader impression.'],
      estimatedMinutes: 7,
      outputType: 'checklist',
    };
  }

  if (area === 'fluency') {
    return {
      title: '60-second chunked response',
      prompt: 'Answer once in three clear idea chunks.',
      instructions: [
        'Plan three beats: answer, reason, example.',
        'Record for 60 seconds without restarting.',
        'Mark hesitations and replace only the worst two.',
      ],
      successCriteria: ['The response has a clear beginning, middle, and end.', 'Pauses are purposeful.', 'No memorized-sounding filler dominates.'],
      estimatedMinutes: 9,
      outputType: 'recorded_response',
    };
  }
  if (area === 'pronunciation') {
    return {
      title: 'Pronunciation repair loop',
      prompt: 'Fix one sound or stress pattern, then rerecord the same answer.',
      instructions: [
        'Select up to three words from the feedback.',
        'Say each word slowly, then in a sentence, then at natural speed.',
        'Rerecord the original answer and compare clarity.',
      ],
      successCriteria: ['Target words are intelligible in sentence context.', 'Stress is placed consistently.', 'The rerecording is clearer than the first attempt.'],
      estimatedMinutes: 8,
      outputType: 'recorded_response',
    };
  }
  if (area === 'lexical_range') {
    return {
      title: 'Upgrade-and-use speaking drill',
      prompt: 'Turn basic phrases into natural spoken range.',
      instructions: [
        'List five basic phrases from the transcript.',
        'Replace them with precise but speakable alternatives.',
        'Use at least three upgrades in a fresh answer.',
      ],
      successCriteria: ['Upgrades sound natural aloud.', 'Phrases match the topic.', 'The answer still sounds spontaneous.'],
      estimatedMinutes: 9,
      outputType: 'transcript_review',
    };
  }
  if (area === 'grammar_accuracy') {
    return {
      title: 'Controlled accuracy loop',
      prompt: 'Answer with two target structures under control.',
      instructions: [
        'Choose two structures: contrast, condition, cause, or concession.',
        'Write one model sentence for each.',
        'Record a response that uses both without losing meaning.',
      ],
      successCriteria: ['Both target structures are grammatically correct.', 'The answer remains relevant.', 'Errors do not block meaning.'],
      estimatedMinutes: 10,
      outputType: 'recorded_response',
    };
  }
  return {
    title: 'Turn-taking extension drill',
    prompt: 'Build interaction instead of giving a closed answer.',
    instructions: [
      'Respond to the question in one sentence.',
      'Add a contrast, clarification, or follow-up question.',
      'Record the answer as if speaking with a partner.',
    ],
    successCriteria: ['The answer invites continuation.', 'The speaker extends the point naturally.', 'The turn is neither too short nor over-dominant.'],
    estimatedMinutes: 7,
    outputType: 'recorded_response',
  };
}

function buildRevisionLoop(
  feedbackType: ProductiveFeedbackType,
  track: TutorTrack,
  attemptId: string,
  tasks: FeedbackPracticeTask[],
  createdAt: string,
): FeedbackRevisionLoop {
  const isWriting = feedbackType === 'writing';
  return {
    id: `${feedbackType}-revision-loop-${stableChecksum([attemptId, track, createdAt].join('|'))}`,
    feedbackType,
    track,
    steps: isWriting
      ? [
          { label: 'Draft', action: 'Submit the original answer with prompt and task type.', evidence: 'Original draft stored with attempt id.' },
          { label: 'Feedback', action: 'Read rubric feedback and identify the weakest criterion.', evidence: 'Criteria scores and next actions.' },
          { label: 'Targeted practice', action: `Complete ${tasks.length} focused repair task${tasks.length === 1 ? '' : 's'}.`, evidence: 'Practice outputs attached to the feedback event.' },
          { label: 'Rewrite', action: 'Rewrite only after the focused drills are complete.', evidence: 'Second draft linked to the same prompt.' },
          { label: 'Compare', action: 'Compare old vs. new draft against the checklist.', evidence: 'Rubric deltas and teacher/AI notes.' },
        ]
      : [
          { label: 'Record', action: 'Record the original answer or upload a transcript.', evidence: 'Audio/transcript stored with attempt id.' },
          { label: 'Feedback', action: 'Read rubric feedback and isolate the weakest speaking area.', evidence: 'Criteria scores, fluency notes, and pronunciation notes.' },
          { label: 'Targeted practice', action: `Complete ${tasks.length} focused speaking repair task${tasks.length === 1 ? '' : 's'}.`, evidence: 'Practice recording or transcript attached.' },
          { label: 'Rerecord', action: 'Answer the same or parallel prompt again.', evidence: 'Second recording linked to the same prompt family.' },
          { label: 'Compare', action: 'Compare transcript, clarity, and rubric deltas.', evidence: 'Before/after feedback and teacher/AI notes.' },
        ],
    compareChecklist: uniqueStrings([
      ...tasks.flatMap((task) => task.successCriteria.slice(0, 2)),
      isWriting ? 'The rewrite improves the weakest criterion without damaging another criterion.' : 'The rerecording improves clarity and control without becoming memorized.',
    ]).slice(0, 6),
    validityGate: {
      masteryEligible: false,
      requirements: [
        'Same rubric version must be used for the original and revised attempt.',
        'The attempt must include prompt, output, feedback, and before/after evidence.',
        'High-stakes mastery requires either teacher validation or stable double-scored AI agreement.',
      ],
    },
  };
}

function extractPracticeEvidence(feedback: WritingFeedback | SpeakingFeedback, signal: ProductiveSkillSignal): string[] {
  const evidence = [...signal.evidence, signal.nextAction || ''];
  if ('corrections' in feedback) {
    evidence.push(...feedback.corrections.slice(0, 2).map((item) => `${item.originalText} -> ${item.correctedText}`));
    evidence.push(...(feedback.sentenceUpgrades || []).slice(0, 1).map((item) => `${item.original} -> ${item.upgraded}`));
  } else {
    evidence.push(...feedback.pronunciationErrors.slice(0, 3).map((item) => `${item.word}: ${item.suggestion}`));
    if (feedback.fluencyReview) evidence.push(feedback.fluencyReview);
  }
  return uniqueStrings(evidence.filter(Boolean)).slice(0, 4);
}

function evaluateProductiveSkillSample(
  sample: ProductiveSkillGoldenSample,
  options: { defaultOverallDeviation?: number; defaultCriterionDeviation?: number },
): ProductiveSkillGovernanceFinding[] {
  const findings: ProductiveSkillGovernanceFinding[] = [];
  const feedback = sample.feedback;
  const provider = sample.provider || inferProvider(feedback.modelUsed, '');
  const reliability = scoreProductiveFeedbackReliability(feedback, sample.feedbackType, { responseText: sample.responseText, provider });
  const missingFields = [
    !feedback.attemptId ? 'attemptId' : '',
    !feedback.modelUsed ? 'modelUsed' : '',
    !provider || provider === 'unknown' ? 'provider' : '',
    !feedback.rubricVersion ? 'rubricVersion' : '',
    !feedback.descriptorSource ? 'descriptorSource' : '',
    typeof feedback.confidence !== 'number' ? 'confidence' : '',
    !feedback.criteria?.length ? 'criteria' : '',
    !collectFeedbackEvidence(feedback).length ? 'evidence' : '',
    !feedback.createdAt ? 'createdAt' : '',
  ].filter(Boolean);

  if (missingFields.length) {
    findings.push({
      sampleId: sample.sampleId,
      feedbackType: sample.feedbackType,
      severity: 'blocked',
      reason: 'missing_required_fields',
      detail: `Missing productive-skill governance fields: ${missingFields.join(', ')}.`,
    });
  }

  if (typeof sample.expertOverall !== 'number') {
    findings.push({
      sampleId: sample.sampleId,
      feedbackType: sample.feedbackType,
      severity: 'watch',
      reason: 'missing_expert_overall',
      detail: 'No expert overall score was supplied for reliability comparison.',
    });
  } else {
    const allowed = sample.allowedOverallDeviation ?? options.defaultOverallDeviation ?? 0.5;
    const deviation = Math.abs(Number(feedback.bandOverall || 0) - sample.expertOverall);
    if (deviation > allowed) {
      findings.push({
        sampleId: sample.sampleId,
        feedbackType: sample.feedbackType,
        severity: 'blocked',
        reason: 'overall_deviation_exceeded',
        detail: `Overall deviation ${round2(deviation)} exceeds allowed ${allowed}.`,
      });
    }
  }

  const criterionFindings = evaluateCriterionDeviation(sample, options.defaultCriterionDeviation ?? 0.75);
  findings.push(...criterionFindings);

  if (reliability.confidence < 0.7) {
    findings.push({
      sampleId: sample.sampleId,
      feedbackType: sample.feedbackType,
      severity: 'watch',
      reason: 'low_reliability_confidence',
      detail: `Adjusted reliability confidence ${reliability.confidence} is below 0.7 (${reliability.reasons.join('; ')}).`,
    });
  }

  if (!findings.length) {
    findings.push({
      sampleId: sample.sampleId,
      feedbackType: sample.feedbackType,
      severity: 'pass',
      reason: 'sample_passed',
      detail: 'Sample has required provenance and stays within supplied reliability thresholds.',
    });
  }

  return findings;
}

function evaluateCriterionDeviation(sample: ProductiveSkillGoldenSample, defaultThreshold: number): ProductiveSkillGovernanceFinding[] {
  const expertCriteria = sample.expertCriteria || {};
  const entries = Object.entries(expertCriteria);
  if (!entries.length) return [];
  const feedbackCriteria = feedbackCriterionMap(sample.feedback);
  const allowed = sample.allowedCriterionDeviation ?? defaultThreshold;
  return entries
    .map(([criterionName, expertScore]) => {
      const aiScore = feedbackCriteria.get(normalizeText(criterionName));
      if (typeof aiScore !== 'number') {
        return {
          sampleId: sample.sampleId,
          feedbackType: sample.feedbackType,
          severity: 'watch',
          reason: 'missing_criterion_score',
          detail: `Missing AI criterion score for ${criterionName}.`,
        } satisfies ProductiveSkillGovernanceFinding;
      }
      const deviation = Math.abs(aiScore - expertScore);
      if (deviation <= allowed) return null;
      return {
        sampleId: sample.sampleId,
        feedbackType: sample.feedbackType,
        severity: 'blocked',
        reason: 'criterion_deviation_exceeded',
        detail: `${criterionName} deviation ${round2(deviation)} exceeds allowed ${allowed}.`,
      } satisfies ProductiveSkillGovernanceFinding;
    })
    .filter(Boolean) as ProductiveSkillGovernanceFinding[];
}

function feedbackCriterionMap(feedback: WritingFeedback | SpeakingFeedback): Map<string, number> {
  const entries = feedback.criteria.map((criterion) => [normalizeText(criterion.criterionName), Number(criterion.band)] as const);
  return new Map(entries.filter(([, score]) => Number.isFinite(score)));
}

function collectFeedbackEvidence(feedback: WritingFeedback | SpeakingFeedback): string[] {
  const criterionEvidence = feedback.criteria.flatMap((criterion) => criterion.evidence || []);
  if ('corrections' in feedback) {
    return uniqueStrings([
      ...criterionEvidence,
      ...(feedback.corrections || []).map((item) => item.reason),
      ...(feedback.suggestionsForImprovement || []),
    ]).slice(0, 12);
  }
  return uniqueStrings([
    ...criterionEvidence,
    feedback.fluencyReview || '',
    ...(feedback.pronunciationErrors || []).map((item) => item.suggestion),
    feedback.transcript ? 'Transcript captured.' : '',
  ]).slice(0, 12);
}

function mapWritingCriterionToArea(name: string): ProductiveSkillActionArea {
  const normalized = normalizeText(name);
  if (containsAny(normalized, ['task response', 'task achievement', 'content'])) return 'task_response';
  if (containsAny(normalized, ['coherence', 'cohesion', 'organisation', 'organization'])) return 'coherence';
  if (containsAny(normalized, ['lexical', 'vocabulary'])) return 'lexical_resource';
  if (containsAny(normalized, ['grammar', 'grammatical', 'accuracy', 'language'])) return 'grammar';
  if (containsAny(normalized, ['register', 'tone', 'style', 'audience'])) return 'register';
  return 'task_response';
}

function mapSpeakingCriterionToArea(name: string): ProductiveSkillActionArea {
  const normalized = normalizeText(name);
  if (containsAny(normalized, ['fluency', 'coherence'])) return 'fluency';
  if (containsAny(normalized, ['pronunciation', 'intonation', 'stress'])) return 'pronunciation';
  if (containsAny(normalized, ['lexical', 'vocabulary'])) return 'lexical_range';
  if (containsAny(normalized, ['grammar', 'grammatical', 'accuracy', 'language'])) return 'grammar_accuracy';
  if (containsAny(normalized, ['interaction', 'interactive', 'communication', 'turn'])) return 'interaction';
  return 'fluency';
}

function criterionNameForArea(area: ProductiveSkillActionArea): string {
  const labels: Record<ProductiveSkillActionArea, string> = {
    task_response: 'Task response',
    coherence: 'Coherence and cohesion',
    lexical_resource: 'Lexical resource',
    grammar: 'Grammar accuracy',
    register: 'Register and audience fit',
    fluency: 'Fluency and coherence',
    pronunciation: 'Pronunciation',
    lexical_range: 'Lexical range',
    grammar_accuracy: 'Grammar accuracy',
    interaction: 'Interactive communication',
  };
  return labels[area];
}

function defaultNextAction(area: ProductiveSkillActionArea): string {
  const actions: Record<ProductiveSkillActionArea, string> = {
    task_response: 'Strengthen one claim with specific evidence and explanation.',
    coherence: 'Repair paragraph flow with a clear topic sentence and logical bridge.',
    lexical_resource: 'Replace vague wording with precise, natural collocations.',
    grammar: 'Rewrite error-prone sentences with controlled clause structure.',
    register: 'Adjust tone and genre fit for the expected reader.',
    fluency: 'Answer in planned idea chunks without restarting.',
    pronunciation: 'Repair one sound, stress, or intonation pattern.',
    lexical_range: 'Upgrade basic spoken phrases and reuse them naturally.',
    grammar_accuracy: 'Use two controlled structures accurately in a fresh answer.',
    interaction: 'Extend the turn and invite continuation.',
  };
  return actions[area];
}

function inferTrackFromFeedback(feedback: WritingFeedback | SpeakingFeedback, fallbackType: ProductiveFeedbackType): TutorTrack {
  const source = normalizeText([feedback.rubricVersion || '', feedback.descriptorSource || '', fallbackType].join(' '));
  if (containsAny(source, ['cambridge', 'c2', 'proficiency', 'cpe'])) return 'cpe';
  if (containsAny(source, ['c1', 'advanced', 'cae'])) return 'cae';
  return 'ielts';
}

function scoreForSort(score: number | undefined): number {
  return typeof score === 'number' && Number.isFinite(score) ? score : Number.POSITIVE_INFINITY;
}

function clampWholeNumber(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}

function buildTutorExplanation(input: AITutorQuestionInput, categories: ErrorCategory[]): string {
  const target = describeTarget(input);
  const primary = categories[0] || 'unknown';
  const answerPart = input.correctAnswer
    ? ` The expected answer is "${input.correctAnswer}", while the submitted answer was "${input.userAnswer || 'blank'}".`
    : '';

  if (primary === 'algebra_transform') {
    return `The error is most likely in the algebra transformation step for ${target}.${answerPart} Rebuild the solution one line at a time and check whether each transformation preserves equality and required conditions.`;
  }
  if (primary === 'wrong_formula') {
    return `The answer suggests the wrong formula or theorem was selected for ${target}.${answerPart} First name the theorem, then verify its assumptions before substituting values.`;
  }
  if (primary === 'missing_condition') {
    return `The missing condition is the key issue for ${target}.${answerPart} Write the domain, constraints, and excluded values before solving.`;
  }
  if (primary === 'calculation') {
    return `The reasoning path may be correct, but the computation needs verification for ${target}.${answerPart} Recalculate the smallest arithmetic step where the result changes.`;
  }
  if (primary === 'grammar') {
    return `The response points to a grammar-control issue in ${target}.${answerPart} Identify the clause structure, then check tense, agreement, and punctuation.`;
  }
  if (primary === 'vocabulary' || primary === 'collocation') {
    return `The issue is likely word meaning, register, or collocation in ${target}.${answerPart} Compare the surrounding context before choosing a synonym or phrase.`;
  }
  if (primary === 'inference') {
    return `The miss is likely an inference problem in ${target}.${answerPart} Anchor the answer to explicit evidence first, then infer only what the text supports.`;
  }
  return `The answer needs a strategy repair for ${target}.${answerPart} Restate the question, identify the tested skill, and solve from the prerequisite concept.`;
}

function buildSocraticHints(input: AITutorQuestionInput, categories: ErrorCategory[]): string[] {
  const primary = categories[0] || 'unknown';
  const target = describeTarget(input);
  const common = `Which exact part of ${target} is being tested here?`;

  if (primary === 'algebra_transform') {
    return [common, 'What operation did you apply to both sides, and is it reversible?', 'Which prerequisite identity or factorization step should be checked first?'];
  }
  if (primary === 'wrong_formula') {
    return [common, 'What conditions must be true before this formula can be used?', 'Can you name a simpler example where this theorem applies?'];
  }
  if (primary === 'missing_condition') {
    return [common, 'What values are excluded before any simplification starts?', 'Does the final answer still satisfy the original condition?'];
  }
  if (primary === 'grammar') {
    return [common, 'What is the main clause and what is the dependent clause?', 'Which verb or connector controls the sentence error?'];
  }
  if (primary === 'vocabulary' || primary === 'collocation') {
    return [common, 'What tone or register does the sentence require?', 'Which nearby word restricts the meaning of the option?'];
  }
  if (primary === 'inference') {
    return [common, 'Which sentence gives direct evidence for the answer?', 'What can be inferred without adding outside knowledge?'];
  }
  return [common, 'What did you assume before solving?', 'Which earlier concept would make this question easier?'];
}

function buildRemediationLessons(input: AITutorQuestionInput, categories: ErrorCategory[]): RemediationLessonSuggestion[] {
  const conceptIds = uniqueStrings(input.conceptIds || []);
  const skillIds = uniqueStrings(input.skillIds || []);
  const primary = categories[0] || 'unknown';
  const target = describeTarget(input);
  const titleByCategory: Record<string, string> = {
    algebra_transform: 'Micro lesson: rebuild algebra transformations',
    wrong_formula: 'Micro lesson: choose and verify the right formula',
    missing_condition: 'Micro lesson: write conditions before solving',
    calculation: 'Drill: isolate arithmetic and computation checks',
    grammar: 'Micro lesson: sentence control and error editing',
    vocabulary: 'Drill: context vocabulary and register',
    collocation: 'Drill: collocation and phraseology',
    inference: 'Micro lesson: evidence-backed inference',
    time_management: 'Practice set: pacing and answer triage',
    strategy: 'Review: problem-solving strategy reset',
    unknown: 'Diagnostic repair: classify the missing skill',
  };

  return [
    {
      id: `remediate-${primary}-${stableChecksum(target)}`,
      title: titleByCategory[primary] || titleByCategory.unknown,
      objective: `Repair ${target} before moving to a harder item.`,
      actionType: conceptIds.length || skillIds.length ? 'micro_lesson' : 'redo_question',
      conceptIds,
      skillIds,
      estimatedMinutes: primary === 'time_management' ? 12 : 8,
    },
  ];
}

function estimateTutorConfidence(input: AITutorQuestionInput, categories: ErrorCategory[]): number {
  let score = 0.54;
  if (input.conceptIds?.length) score += 0.14;
  if (input.skillIds?.length) score += 0.12;
  if (input.errorCategories?.length) score += 0.1;
  if (input.correctAnswer) score += 0.06;
  if (input.workedSolution) score += 0.05;
  if (categories.includes('unknown')) score -= 0.14;
  if (!input.questionText) score -= 0.06;
  return round2(clamp(score, 0.38, 0.96));
}

function buildConfidenceReasons(input: AITutorQuestionInput, confidence: number): string[] {
  const reasons = [];
  if (input.conceptIds?.length) reasons.push('concept metadata present');
  if (input.skillIds?.length) reasons.push('skill metadata present');
  if (input.errorCategories?.length) reasons.push('error taxonomy supplied by engine');
  if (!input.conceptIds?.length && !input.skillIds?.length) reasons.push('metadata inferred from text only');
  if (confidence < 0.65) reasons.push('requires human/content review before high-stakes use');
  return reasons;
}

function summarizeWritingFeedback(feedback: WritingFeedback): string {
  const weakCriterion = [...feedback.criteria].sort((a, b) => Number(a.band ?? 0) - Number(b.band ?? 0))[0];
  return `Writing feedback: overall ${feedback.bandOverall}. Focus on ${weakCriterion?.criterionName || 'the weakest rubric criterion'}. ${weakCriterion?.nextAction || ''}`.trim();
}

function summarizeSpeakingFeedback(feedback: SpeakingFeedback): string {
  const weakCriterion = [...feedback.criteria].sort((a, b) => Number(a.band ?? 0) - Number(b.band ?? 0))[0];
  return `Speaking feedback: overall ${feedback.bandOverall}. Focus on ${weakCriterion?.criterionName || 'the weakest rubric criterion'}. ${feedback.fluencyReview || weakCriterion?.nextAction || ''}`.trim();
}

function rubricScores(feedback: WritingFeedback | SpeakingFeedback): Record<string, number> {
  const result: Record<string, number> = { overall: Number(feedback.bandOverall || 0) };
  feedback.criteria.forEach((criterion) => {
    if (typeof criterion.band === 'number') result[criterion.criterionName] = criterion.band;
  });
  return result;
}

function describeTarget(input: AITutorQuestionInput): string {
  const labels = [
    ...(input.conceptIds || []).map((id) => input.metadataLabels?.[id] || id),
    ...(input.skillIds || []).map((id) => input.metadataLabels?.[id] || id),
  ];
  if (labels.length) return labels.slice(0, 3).join(', ');
  return input.programId || input.track || input.domainId || 'this learning objective';
}

function inferTrack(input: AITutorQuestionInput): TutorTrack {
  if (input.programId) return input.programId === 'vn_math_6_9' ? 'math' : input.programId;
  if (input.domainId === 'mathematics') return 'math';
  return 'english_core';
}

function inferDomain(input: AITutorQuestionInput): string {
  if (input.domainId) return input.domainId;
  if (input.track === 'math' || input.programId === 'vn_math_6_9' || input.conceptIds?.some((id) => id.startsWith('math.'))) return 'mathematics';
  return 'english_core';
}

function inferProgram(input: AITutorQuestionInput): string {
  if (input.programId) return input.programId;
  if (input.track === 'math') return 'vn_math_6_9';
  if (input.track) return input.track;
  return inferDomain(input);
}

function uniqueErrorCategories(values: ErrorCategory[]): ErrorCategory[] {
  return uniqueStrings(values.filter(Boolean)) as ErrorCategory[];
}

function countWords(value: string): number {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function normalizeConfidence(value: unknown): number {
  return typeof value === 'number' ? round2(clamp(value, 0, 1)) : 0.5;
}

function inferProvider(modelUsed = '', source = ''): string {
  const text = normalizeText(`${source} ${modelUsed}`);
  if (containsAny(text, ['openai', 'gpt', 'o1', 'o3', 'o4'])) return 'openai';
  if (containsAny(text, ['anthropic', 'claude'])) return 'anthropic';
  if (containsAny(text, ['google', 'gemini'])) return 'gemini';
  if (containsAny(text, ['azure'])) return 'azure_openai';
  if (containsAny(text, ['mock', 'fake', 'fixture', 'synthetic', 'calibrated'])) return 'mock';
  if (containsAny(text, ['local', 'offline'])) return 'local';
  return 'unknown';
}

function averageNumber(values: number[]): number {
  const finite = values.filter((value) => Number.isFinite(value));
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function containsAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function stableChecksum(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
