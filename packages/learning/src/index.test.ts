import {
  buildDiagnosticSet,
  buildErrorNotebookEntryFromAttempt,
  buildLearningEvent,
  buildLearningEventSyncAuditReport,
  buildEmpiricalDifficultyShadowReport,
  buildLearningPath,
  buildStudentModelFromLearningEvents,
  computeMastery,
  computeMasteryV2ShadowReport,
  emptyStudentModel,
  getDueErrorNotebookEntries,
  inferMisconceptionIds,
  listLearningEventsFromStorage,
  makeAttempt,
  mergeLearningEventLogs,
  normalizeLearningEvents,
  recommendNextAction,
  recordLearningFeedback,
  recordAttempt,
  recordLearningItemAttempt,
  scheduleErrorNotebookReview,
  saveLearningEventToStorage,
  saveLearningEventsToStorage,
  sharedLearningEventStorageKey,
  SHARED_LEARNING_EVENTS_LIST_KEY,
  summarizeErrorNotebook,
} from './index';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

let state = emptyStudentModel('learner-1', ['vn_math_6_9']);
assert(recommendNextAction(state).kind === 'diagnostic', 'Empty learner should start with diagnostic.');

const baseAttempt = {
  learnerId: 'learner-1',
  itemId: 'q1',
  domainId: 'mathematics',
  programId: 'vn_math_6_9',
  conceptIds: ['math.quadratic_equation'],
  skillIds: ['math.solve_quadratic_by_factor'],
  difficulty: 'hard',
  mode: 'practice',
  timeSpentSeconds: 90,
};

state = recordAttempt(state, {
  ...baseAttempt,
  itemId: 'q1',
  correct: false,
  answeredAt: '2026-01-01T00:00:00.000Z',
}).state;
state = recordAttempt(state, {
  ...baseAttempt,
  itemId: 'q2',
  correct: true,
  answeredAt: '2026-01-02T00:00:00.000Z',
}).state;
state = recordAttempt(state, {
  ...baseAttempt,
  itemId: 'q3',
  correct: true,
  answeredAt: '2026-01-03T00:00:00.000Z',
}).state;

const mastery = computeMastery(state);
assert(
  mastery.some((row) => row.id === 'math.solve_quadratic_by_factor'),
  'Skill mastery row should be created.',
);
assert(
  mastery.every((row) => row.attempts >= 3),
  'Concept and skill rows should aggregate all attempts.',
);

let stuckHardState = emptyStudentModel('stuck-hard-learner', ['vn_math_6_9']);
for (let index = 0; index < 5; index += 1) {
  stuckHardState = recordAttempt(stuckHardState, {
    ...baseAttempt,
    itemId: `stuck-hard-${index + 1}`,
    correct: false,
    difficulty: 'hard',
    answeredAt: `2026-01-${String(index + 1).padStart(2, '0')}T02:00:00.000Z`,
  }).state;
}
const stuckHardMastery = computeMastery(stuckHardState);
assert(
  stuckHardMastery.some((row) => row.consecutiveFailures === 5 && row.lastAttemptDifficulty === 'hard'),
  'Mastery should expose consecutive failure streaks.',
);
const stuckHardRecommendation = recommendNextAction(stuckHardState, { diagnosticMinAttempts: 1 });
assert(
  stuckHardRecommendation.reason === 'consecutive_failures_5',
  'Five consecutive hard misses should trigger rerouting before normal repair.',
);
assert(stuckHardRecommendation.difficulty === 'medium', 'Hard stuck learners should be rerouted to medium practice.');

let stuckEasyState = emptyStudentModel('stuck-easy-learner', ['vn_math_6_9']);
for (let index = 0; index < 5; index += 1) {
  stuckEasyState = recordAttempt(stuckEasyState, {
    ...baseAttempt,
    itemId: `stuck-easy-${index + 1}`,
    correct: false,
    difficulty: 'easy',
    answeredAt: `2026-01-${String(index + 1).padStart(2, '0')}T03:00:00.000Z`,
  }).state;
}
const stuckEasyRecommendation = recommendNextAction(stuckEasyState, { diagnosticMinAttempts: 1 });
assert(
  stuckEasyRecommendation.reason === 'consecutive_failures_prerequisite',
  'Easy-level stuck learners should be routed back to prerequisite review.',
);
assert(
  stuckEasyRecommendation.kind === 'review',
  'Easy-level rerouting should avoid assigning more practice before reteaching.',
);

const learningPath = buildLearningPath(
  mastery,
  [
    { id: 'math.factorization', domainId: 'mathematics', scope: 'concept', label: 'Factorization' },
    { id: 'math.quadratic_equation', domainId: 'mathematics', scope: 'concept', label: 'Quadratic Equation' },
    { id: 'math.vieta', domainId: 'mathematics', scope: 'concept', label: 'Vieta Theorem' },
    { id: 'math.apply_vieta', domainId: 'mathematics', scope: 'skill', label: 'Apply Vieta theorem' },
  ],
  [
    { from: 'math.factorization', to: 'math.quadratic_equation', type: 'prerequisite', weight: 0.9 },
    { from: 'math.quadratic_equation', to: 'math.vieta', type: 'prerequisite', weight: 0.8 },
    { from: 'math.vieta', to: 'math.apply_vieta', type: 'supports', weight: 0.8 },
  ],
  { domainId: 'mathematics', targetIds: ['math.apply_vieta'], maxSteps: 4 },
);
assert(
  learningPath.steps.map((step) => step.id).join('>') ===
    'math.factorization>math.quadratic_equation>math.vieta>math.apply_vieta',
  'Learning path should order prerequisites before the target skill.',
);
assert(
  learningPath.steps.some((step) => step.id === 'math.quadratic_equation' && step.status === 'repair'),
  'Learning path should surface repair status from mastery.',
);
assert(
  learningPath.nextStep?.id === 'math.factorization',
  'Learning path should start at the first unresolved prerequisite.',
);

const diagnostic = buildDiagnosticSet(
  [
    {
      id: 'q1',
      domainId: 'mathematics',
      programIds: ['vn_math_6_9'],
      conceptIds: ['math.quadratic_equation'],
      skillIds: ['math.solve_quadratic_by_factor'],
      difficulty: 'medium',
    },
    {
      id: 'q4',
      domainId: 'mathematics',
      programIds: ['vn_math_6_9'],
      conceptIds: ['math.linear_equation'],
      skillIds: ['math.solve_linear_equation'],
      difficulty: 'medium',
    },
  ],
  state.attempts,
  { limit: 2, programId: 'vn_math_6_9' },
);
assert(diagnostic.length === 1 && diagnostic[0].id === 'q4', 'Diagnostic should prefer unattempted items.');

const attempt = makeAttempt({ ...baseAttempt, itemId: 'q5', correct: false });
assert(attempt.id.startsWith('attempt-'), 'makeAttempt should create stable attempt ids.');
const inferredMathMisconceptions = inferMisconceptionIds({
  domainId: 'mathematics',
  conceptIds: ['math.factorization'],
  skillIds: ['math.solve_quadratic_by_factor'],
  errorCategories: ['algebra_transform'],
});
assert(
  inferredMathMisconceptions.includes('mis.math.factor_vs_expand'),
  'Learning core should infer math misconception ids from error taxonomy and graph-like metadata.',
);

let englishState = emptyStudentModel('english-learner-1', ['cpe']);
const englishItem = {
  id: 'english.cpe.sample.q1',
  domainId: 'english_core',
  programIds: ['cpe'],
  conceptIds: ['eng.grammar_accuracy'],
  skillIds: ['eng.control_clause_structure'],
  difficulty: 'hard',
  tags: ['cpe', 'use_of_english'],
};

englishState = recordLearningItemAttempt(englishState, englishItem, {
  correct: false,
  mode: 'diagnostic',
  answeredAt: '2026-01-04T00:00:00.000Z',
  errorCategories: ['grammar'],
}).state;

const englishMastery = computeMastery(englishState);
assert(englishState.attempts[0].programId === 'cpe', 'Learning item attempt should infer target program.');
assert(
  englishState.attempts[0].misconceptionIds?.includes('mis.eng.grammar_role_mismatch'),
  'Learning item attempt should infer English grammar misconception ids.',
);
assert(
  englishMastery.some((row) => row.id === 'eng.grammar_accuracy'),
  'English concept mastery should be computed from item attempts.',
);
assert(
  englishMastery.some((row) => row.errorCategories.includes('grammar')),
  'English mastery should preserve error taxonomy.',
);
assert(
  englishMastery.some((row) => row.misconceptionIds.includes('mis.eng.grammar_role_mismatch')),
  'English mastery should aggregate inferred misconceptions.',
);

const feedbackOnlyResult = recordLearningFeedback(englishState, {
  item: {
    id: 'english.ielts.writing.feedback.q1',
    domainId: 'english_core',
    programIds: ['ielts'],
    conceptIds: ['eng.academic_writing'],
    skillIds: ['eng.develop_academic_argument'],
    masteryPolicy: 'feedback_only',
    feedbackArea: 'writing',
  },
  area: 'writing',
  feedback: 'Coherence is improving; keep feedback out of mastery until rubric calibration is ready.',
  rubricScores: { task_response: 6, coherence: 6 },
  occurredAt: '2026-01-04T01:00:00.000Z',
});
assert(
  feedbackOnlyResult.state.attempts.length === englishState.attempts.length,
  'Feedback-only events should not create attempts.',
);
assert(
  feedbackOnlyResult.event.payload.masteryPolicy === 'feedback_only',
  'Feedback-only event should declare its mastery policy.',
);
assert(
  !computeMastery(feedbackOnlyResult.state).some((row) => row.id === 'eng.academic_writing'),
  'Feedback-only events should not create writing mastery rows.',
);

const masteryV2Shadow = computeMasteryV2ShadowReport(feedbackOnlyResult.state, {
  generatedAt: '2026-01-10T00:00:00.000Z',
  now: '2026-01-10T00:00:00.000Z',
});
assert(masteryV2Shadow.schemaVersion === 'mastery_v2_shadow_v1', 'Mastery V2 shadow report should be versioned.');
assert(
  masteryV2Shadow.studentFacingEnabled === false,
  'Mastery V2 shadow report should not enable student-facing behavior.',
);
assert(
  masteryV2Shadow.recommendationPolicy === 'v1_only',
  'Mastery V2 shadow report should preserve V1 recommendation policy.',
);
assert(
  masteryV2Shadow.summary.protectedFeedbackOnlyEvents === 1,
  'Mastery V2 shadow should count protected feedback-only events.',
);
assert(
  !masteryV2Shadow.rows.some((row) => row.id === 'eng.academic_writing'),
  'Mastery V2 shadow should not convert feedback-only writing into mastery rows.',
);
assert(
  masteryV2Shadow.rows.some((row) => row.id === 'eng.grammar_accuracy' && row.weakestEvidence.length > 0),
  'Mastery V2 shadow rows should expose explainability evidence.',
);

const wrongEnglishAttempt = englishState.attempts[0];
const notebookEntry = buildErrorNotebookEntryFromAttempt(wrongEnglishAttempt, {
  questionType: 'gap_fill',
  userAnswer: 'has been',
  correctAnswer: 'had been',
  explanation: 'Past perfect is required by the time marker.',
});
assert(notebookEntry !== null, 'Wrong attempts should create an error notebook entry.');
assert(notebookEntry?.schemaVersion === 'error_notebook_v1', 'Error notebook entries should be versioned.');
assert(notebookEntry?.difficulty === 'hard', 'Error notebook entry should preserve attempt difficulty for SRS tuning.');
assert(Boolean(notebookEntry?.srsReason), 'Error notebook entry should expose an SRS reason.');
assert(notebookEntry?.errorCategories?.includes('grammar'), 'Error notebook entry should preserve error categories.');
assert(
  notebookEntry?.misconceptionIds?.includes('mis.eng.grammar_role_mismatch'),
  'Error notebook entry should preserve inferred misconception ids.',
);
assert(
  notebookEntry?.skillIds?.includes('eng.control_clause_structure'),
  'Error notebook entry should preserve skill metadata.',
);

const correctAttempt = makeAttempt({
  ...baseAttempt,
  itemId: 'q6',
  correct: true,
  answeredAt: '2026-01-05T00:00:00.000Z',
});
assert(
  buildErrorNotebookEntryFromAttempt(correctAttempt) === null,
  'Correct attempts should not create error notebook entries.',
);

const reviewedOnce = scheduleErrorNotebookReview(notebookEntry!, 4, '2026-01-05T00:00:00.000Z');
assert(reviewedOnce.repetitions === 1, 'Successful review should increment repetitions.');
assert(reviewedOnce.intervalDays === 1, 'First successful review should use a 1-day interval.');
assert(reviewedOnce.nextReviewAt === '2026-01-06T00:00:00.000Z', 'SRS next review date should be deterministic.');
assert(
  reviewedOnce.srsReason?.includes('difficulty hard'),
  'Successful review should explain difficulty-aware SRS tuning.',
);

const reviewedFailed = scheduleErrorNotebookReview(reviewedOnce, 2, '2026-01-06T00:00:00.000Z');
assert(reviewedFailed.repetitions === 0, 'Failed review should reset repetitions.');
assert(reviewedFailed.intervalDays === 1, 'Failed review should return to a 1-day interval.');
assert(reviewedFailed.lapseCount === 1, 'Failed review should increment lapse count.');
assert(
  reviewedFailed.srsReason?.includes('lapse count 0 -> 1'),
  'Failed review should explain recurrence/lapse tuning.',
);

const easyRetained = scheduleErrorNotebookReview(
  { ...notebookEntry!, difficulty: 'easy', repetitions: 2, intervalDays: 6, lapseCount: 0 },
  5,
  '2026-01-08T00:00:00.000Z',
);
const hardLapsedRetained = scheduleErrorNotebookReview(
  { ...notebookEntry!, difficulty: 'hard', repetitions: 2, intervalDays: 6, lapseCount: 2 },
  5,
  '2026-01-08T00:00:00.000Z',
);
assert(
  easyRetained.intervalDays > hardLapsedRetained.intervalDays,
  'SRS tuning should shorten hard/recurrent items relative to easy retained items.',
);
assert(hardLapsedRetained.srsReason?.includes('lapse count 2'), 'SRS reason should expose recurrence pressure.');

const noMisconceptionRetained = scheduleErrorNotebookReview(
  { ...notebookEntry!, difficulty: 'medium', repetitions: 2, intervalDays: 6, lapseCount: 0, misconceptionIds: [] },
  5,
  '2026-01-08T00:00:00.000Z',
);
const misconceptionRetained = scheduleErrorNotebookReview(
  {
    ...notebookEntry!,
    difficulty: 'medium',
    repetitions: 2,
    intervalDays: 6,
    lapseCount: 0,
    misconceptionIds: ['mis.eng.grammar_role_mismatch'],
  },
  5,
  '2026-01-08T00:00:00.000Z',
);
assert(
  misconceptionRetained.intervalDays < noMisconceptionRetained.intervalDays,
  'Misconception-tagged reviews should return sooner than ordinary retained reviews.',
);
assert(
  misconceptionRetained.srsReason?.includes('misconception signals 1'),
  'SRS reason should expose misconception pressure.',
);

const calibrationAttempts = [
  ...Array.from({ length: 5 }, (_, index) =>
    makeAttempt({
      learnerId: index < 3 ? 'cal-high' : 'cal-low',
      itemId: 'cal-hard-overstated',
      domainId: 'mathematics',
      programId: 'vn_math_6_9',
      conceptIds: ['math.linear_equation'],
      skillIds: ['math.solve_linear_equation'],
      correct: true,
      difficulty: 'hard',
      mode: 'practice',
      answeredAt: `2026-01-0${index + 1}T00:00:00.000Z`,
      timeSpentSeconds: 40 + index,
    }),
  ),
  makeAttempt({
    learnerId: 'cal-low',
    itemId: 'cal-sparse',
    domainId: 'english_core',
    programId: 'ielts',
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    correct: false,
    difficulty: 'medium',
    mode: 'practice',
    answeredAt: '2026-01-06T00:00:00.000Z',
    timeSpentSeconds: 120,
  }),
];
const empiricalDifficulty = buildEmpiricalDifficultyShadowReport(calibrationAttempts, {
  generatedAt: '2026-01-10T00:00:00.000Z',
  minAttemptsPerItem: 5,
});
const overstatedRow = empiricalDifficulty.rows.find((row) => row.itemId === 'cal-hard-overstated');
const sparseRow = empiricalDifficulty.rows.find((row) => row.itemId === 'cal-sparse');
assert(
  empiricalDifficulty.schemaVersion === 'empirical_difficulty_shadow_v1',
  'Empirical difficulty shadow report should be versioned.',
);
assert(
  empiricalDifficulty.calibrationPolicy === 'shadow_only_prior_preserved',
  'Empirical difficulty should preserve teacher-authored priors.',
);
assert(
  empiricalDifficulty.highStakesPlacementEnabled === false,
  'Empirical difficulty should not enable high-stakes placement.',
);
assert(overstatedRow?.priorDifficulty === 'hard', 'Empirical row should preserve prior difficulty.');
assert(overstatedRow?.empiricalDifficulty === 'easy', 'Empirical row should expose drift candidates.');
assert(overstatedRow?.applied === false, 'Empirical row should never apply calibration automatically.');
assert(
  typeof overstatedRow?.eloDelta === 'number',
  'Empirical row should expose lightweight Elo only as a secondary signal.',
);
assert(sparseRow?.sparse === true, 'Sparse item should be marked sparse.');
assert(sparseRow?.empiricalDifficulty === sparseRow?.priorDifficulty, 'Sparse item should keep prior difficulty.');

const dueEntries = getDueErrorNotebookEntries([reviewedFailed], '2026-01-07T00:00:00.000Z');
assert(dueEntries.length === 1, 'Due selector should return entries ready for review.');

const notebookSummary = summarizeErrorNotebook([reviewedFailed], '2026-01-07T00:00:00.000Z');
assert(notebookSummary.total === 1 && notebookSummary.due === 1, 'Notebook summary should count due entries.');
assert(notebookSummary.byErrorCategory.grammar === 1, 'Notebook summary should group by error category.');

class MemoryLearningEventStorage {
  data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const sharedStorage = new MemoryLearningEventStorage();
const sharedEventA = buildLearningEvent(
  'practice_attempt',
  { itemId: 'storage-q1', domainId: 'mathematics', programId: 'vn_math_6_9' },
  {
    learnerId: 'storage-learner-1',
    entityType: 'learning_item',
    entityId: 'storage-q1',
    occurredAt: '2026-01-08T00:00:00.000Z',
    source: 'unit_test',
  },
);
const sharedEventB = buildLearningEvent(
  'review_attempt',
  { itemId: 'storage-q2', domainId: 'english_core', programId: 'cpe' },
  {
    learnerId: 'storage-learner-2',
    entityType: 'learning_item',
    entityId: 'storage-q2',
    occurredAt: '2026-01-09T00:00:00.000Z',
    source: 'unit_test',
  },
);
assert(sharedEventA.eventId === sharedEventA.id, 'Learning event should expose eventId for sync logs.');
assert(sharedEventA.idempotencyKey === sharedEventA.id, 'Learning event should expose idempotencyKey for dedupe.');
assert(Boolean(sharedEventA.receivedAt), 'Learning event should capture receivedAt metadata.');
assert(Boolean(sharedEventA.payloadHash), 'Learning event should capture a stable payload hash.');

const normalizedLegacyEvent = normalizeLearningEvents([
  {
    id: 'legacy-event-1',
    type: 'practice_attempt',
    learnerId: 'legacy-learner',
    entityType: 'learning_item',
    entityId: 'legacy-q1',
    occurredAt: '2026-01-07T00:00:00.000Z',
    source: 'legacy_import',
    payload: { itemId: 'legacy-q1', correct: true },
  },
])[0];
assert(
  normalizedLegacyEvent.eventId === 'legacy-event-1',
  'Legacy events should backfill eventId during normalization.',
);
assert(
  Boolean(normalizedLegacyEvent.idempotencyKey),
  'Legacy events should backfill idempotencyKey during normalization.',
);
assert(Boolean(normalizedLegacyEvent.payloadHash), 'Legacy events should backfill payloadHash during normalization.');
assert(
  normalizedLegacyEvent.receivedAt === normalizedLegacyEvent.occurredAt,
  'Legacy events should default receivedAt from occurredAt.',
);

const savedSharedEvents = saveLearningEventsToStorage([sharedEventB, sharedEventA, { ...sharedEventA }], sharedStorage);
assert(savedSharedEvents.length === 2, 'Shared storage should normalize and dedupe saved events.');
assert(
  JSON.stringify(JSON.parse(sharedStorage.getItem(SHARED_LEARNING_EVENTS_LIST_KEY) || '[]')) ===
    JSON.stringify([sharedEventA.id, sharedEventB.id]),
  'Shared storage list should preserve chronological normalized ids.',
);
assert(
  JSON.parse(sharedStorage.getItem(sharedLearningEventStorageKey(sharedEventA.id)) || '{}').learnerId ===
    'storage-learner-1',
  'Shared storage should save event payload by stable event key.',
);

const savedSingleEvent = saveLearningEventToStorage(sharedEventB, sharedStorage);
assert(savedSingleEvent?.id === sharedEventB.id, 'Single shared storage save should return the normalized event.');
assert(
  JSON.stringify(listLearningEventsFromStorage(sharedStorage).map((event) => event.id)) ===
    JSON.stringify([sharedEventB.id, sharedEventA.id]),
  'Shared storage listing should default to newest first.',
);
assert(
  JSON.stringify(
    listLearningEventsFromStorage(sharedStorage, { learnerId: 'storage-learner-1', newestFirst: false }).map(
      (event) => event.id,
    ),
  ) === JSON.stringify([sharedEventA.id]),
  'Shared storage listing should filter by learner.',
);
assert(
  listLearningEventsFromStorage(sharedStorage, { limit: 1 }).length === 1,
  'Shared storage listing should support limits.',
);

const mergedSharedEvents = mergeLearningEventLogs([sharedEventA], [{ ...sharedEventA }, sharedEventB]);
assert(mergedSharedEvents.added === 1, 'Event merge should add distinct incoming events.');
assert(mergedSharedEvents.duplicates === 1, 'Event merge should count duplicate idempotency keys.');
assert(mergedSharedEvents.conflicts.length === 0, 'Event merge should not flag exact duplicates as conflicts.');
assert(mergedSharedEvents.events.length === 2, 'Event merge should keep current plus distinct incoming events.');

const conflictingSharedEvent = buildLearningEvent(
  'practice_attempt',
  { itemId: 'storage-q1', domainId: 'mathematics', programId: 'vn_math_6_9', correctedPayload: true },
  {
    id: sharedEventA.id,
    eventId: sharedEventA.eventId,
    learnerId: 'storage-learner-1',
    entityType: 'learning_item',
    entityId: 'storage-q1',
    occurredAt: '2026-01-08T00:00:00.000Z',
    source: 'unit_test',
  },
);
const conflictedMerge = mergeLearningEventLogs([sharedEventA], [conflictingSharedEvent]);
assert(conflictedMerge.added === 0, 'Event merge should not silently add same event id with different payload.');
assert(
  conflictedMerge.conflicts.some((conflict) => conflict.reason === 'same_event_id_different_payload'),
  'Event merge should flag same-id payload conflicts.',
);

const duplicateSyncAudit = buildLearningEventSyncAuditReport([sharedEventA, { ...sharedEventA }], {
  generatedAt: '2026-01-10T00:00:00.000Z',
});
assert(duplicateSyncAudit.schemaVersion === 'learning_event_sync_audit_v1', 'Sync audit report should be versioned.');
assert(duplicateSyncAudit.status === 'watch', 'Sync audit should watch duplicate idempotency keys without conflicts.');
assert(duplicateSyncAudit.duplicateIdempotencyKeys === 1, 'Sync audit should count duplicate idempotency keys.');

const blockedSyncAudit = buildLearningEventSyncAuditReport(
  [{ ...sharedEventA, learnerId: '', entityId: '', occurredAt: 'not-a-date' }],
  {
    generatedAt: '2026-01-10T00:01:00.000Z',
    conflicts: conflictedMerge.conflicts,
  },
);
assert(blockedSyncAudit.status === 'blocked', 'Sync audit should block conflicts and invalid event metadata.');
assert(blockedSyncAudit.conflicts.length === 1, 'Sync audit should surface merge conflicts.');
assert(blockedSyncAudit.missingLearnerIds === 1, 'Sync audit should count missing learner IDs.');
assert(blockedSyncAudit.invalidTimestamps === 1, 'Sync audit should count invalid timestamps.');

const liveTrackedAttemptEvent = buildLearningEvent(
  'practice_attempt',
  {
    attemptId: 'live-attempt-1',
    itemId: 'live-q1',
    domainId: 'mathematics',
    programId: 'vn_math_6_9',
    conceptIds: ['math.quadratic_equation'],
    skillIds: ['math.solve_quadratic_by_factor'],
    correct: 'wrong',
    difficulty: 'hard',
    mode: 'practice',
    timeSpentSeconds: 121,
    hintUsed: true,
    errorCategories: ['algebra_transform'],
    misconceptionIds: ['mis.math.factor_vs_expand'],
  },
  {
    learnerId: 'live-learner-1',
    entityType: 'learning_item',
    entityId: 'live-q1',
    occurredAt: '2026-01-11T00:00:00.000Z',
    source: 'live_unit_test',
  },
);
const liveFeedbackOnlyEvent = buildLearningEvent(
  'feedback_only',
  {
    masteryPolicy: 'feedback_only',
    itemId: 'live-writing-feedback-1',
    domainId: 'english_core',
    programId: 'ielts',
    conceptIds: ['eng.academic_writing'],
    skillIds: ['eng.develop_academic_argument'],
  },
  {
    learnerId: 'live-learner-1',
    entityType: 'learning_item',
    entityId: 'live-writing-feedback-1',
    occurredAt: '2026-01-11T00:10:00.000Z',
    source: 'live_unit_test',
  },
);
const liveSkippedAttemptEvent = buildLearningEvent(
  'review_attempt',
  {
    itemId: 'live-skipped-q1',
    domainId: 'mathematics',
    programId: 'vn_math_6_9',
  },
  {
    learnerId: 'live-learner-1',
    entityType: 'learning_item',
    entityId: 'live-skipped-q1',
    occurredAt: '2026-01-11T00:20:00.000Z',
    source: 'live_unit_test',
  },
);
const otherLearnerAttemptEvent = buildLearningEvent(
  'practice_attempt',
  {
    attemptId: 'other-attempt-1',
    itemId: 'other-q1',
    domainId: 'mathematics',
    programId: 'vn_math_6_9',
    correct: true,
  },
  {
    learnerId: 'other-live-learner',
    entityType: 'learning_item',
    entityId: 'other-q1',
    occurredAt: '2026-01-11T00:30:00.000Z',
    source: 'live_unit_test',
  },
);
const eventDerivedStudentModel = buildStudentModelFromLearningEvents(
  [liveSkippedAttemptEvent, liveFeedbackOnlyEvent, otherLearnerAttemptEvent, liveTrackedAttemptEvent],
  {
    learnerId: 'live-learner-1',
    targetProgramIds: ['vn_math_6_9'],
    generatedAt: '2026-01-12T00:00:00.000Z',
  },
);
assert(
  eventDerivedStudentModel.schemaVersion === 'student_model_from_events_v1',
  'Event-derived StudentModel report should be versioned.',
);
assert(eventDerivedStudentModel.learnerId === 'live-learner-1', 'Event-derived StudentModel should scope by learner.');
assert(
  eventDerivedStudentModel.acceptedAttempts === 1,
  'Event-derived StudentModel should accept complete attempt events.',
);
assert(
  eventDerivedStudentModel.skippedEvents === 1,
  'Event-derived StudentModel should skip incomplete attempt events.',
);
assert(
  eventDerivedStudentModel.skippedEventIds.includes(liveSkippedAttemptEvent.id),
  'Event-derived StudentModel should expose skipped event ids.',
);
assert(
  eventDerivedStudentModel.feedbackOnlyEvents === 1,
  'Event-derived StudentModel should count protected feedback-only events.',
);
assert(
  eventDerivedStudentModel.state.learningEvents.length === 3,
  'Event-derived StudentModel should keep the scoped normalized event log.',
);
assert(
  eventDerivedStudentModel.state.attempts[0].id === 'live-attempt-1',
  'Event-derived StudentModel should preserve source attempt ids.',
);
assert(
  eventDerivedStudentModel.state.attempts[0].correct === false,
  'Event-derived StudentModel should parse string correctness evidence.',
);
assert(
  eventDerivedStudentModel.state.attempts[0].hintUsed === true,
  'Event-derived StudentModel should preserve hint evidence.',
);
assert(
  eventDerivedStudentModel.targetProgramIds.includes('ielts'),
  'Event-derived StudentModel should preserve target programs from protected feedback events.',
);
assert(
  !eventDerivedStudentModel.state.attempts.some((attempt) => attempt.learnerId === 'other-live-learner'),
  'Event-derived StudentModel should exclude other learners.',
);
const inferredLearnerStudentModel = buildStudentModelFromLearningEvents(
  [otherLearnerAttemptEvent, liveTrackedAttemptEvent],
  {
    generatedAt: '2026-01-12T00:01:00.000Z',
  },
);
assert(
  inferredLearnerStudentModel.learnerId === 'live-learner-1',
  'Event-derived StudentModel should infer the first chronological learner when no learnerId is provided.',
);
assert(
  !inferredLearnerStudentModel.state.attempts.some((attempt) => attempt.learnerId === 'other-live-learner'),
  'Event-derived StudentModel should not mix learners when inferring learner scope.',
);
const eventDerivedMastery = computeMastery(eventDerivedStudentModel.state);
assert(
  eventDerivedMastery.some((row) => row.id === 'math.solve_quadratic_by_factor'),
  'Event-derived attempts should feed tracked mastery.',
);
assert(
  !eventDerivedMastery.some((row) => row.id === 'eng.academic_writing'),
  'Feedback-only events should not become mastery rows when importing from event logs.',
);

// ===========================================================================
// Adaptive engine (two-way Elo + CAT) — simulated-learner tests
// ===========================================================================
import {
  calibrateAbilities,
  estimateAbilityEAP,
  expectedScore,
  fisherInformation,
  ratingToDifficultyLabel,
  runCatSession,
  selectNextCatItem,
  buildAdaptiveDiagnostic,
  DEFAULT_ABILITY,
  RATING_SCALE,
  type AdaptiveAttempt,
  type CatItem,
} from './adaptive-engine';

// Deterministic PRNG (mulberry32) so the simulation is reproducible.
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- expectedScore / fisherInformation sanity ---
assert(Math.abs(expectedScore(1200, 1200) - 0.5) < 1e-9, 'Equal ability and difficulty must give p=0.5.');
assert(expectedScore(1600, 1200) > 0.9, 'A much stronger learner should almost always succeed.');
assert(expectedScore(800, 1200) < 0.1, 'A much weaker learner should almost always fail.');
assert(
  fisherInformation(1200, 1200) > fisherInformation(1200, 1800),
  'Information peaks when difficulty matches ability.',
);

// --- Two-way Elo calibration: an item that everyone gets wrong must rate harder ---
(() => {
  const rng = makeRng(11);
  const attempts: AdaptiveAttempt[] = [];
  // 40 average learners attempt a "medium"-labelled item that is secretly very hard.
  for (let i = 0; i < 40; i++) {
    attempts.push({
      learnerId: `L${i}`,
      itemId: 'trap-item',
      correct: rng() < 0.12, // truly hard: ~12% success
      difficulty: 'medium',
      answeredAt: `2026-01-01T00:${String(i).padStart(2, '0')}:00.000Z`,
    });
  }
  const { items } = calibrateAbilities(attempts);
  const trap = items.get('trap-item')!;
  assert(
    trap.rating > trap.priorRating + 80,
    'A mislabelled hard item must calibrate to a higher rating than its prior.',
  );
  assert(
    ratingToDifficultyLabel(trap.rating) === 'hard',
    "Empirical difficulty of the trap item should resolve to 'hard'.",
  );
  assert(!trap.provisional, '40 attempts should clear the provisional flag.');
})();

// --- Two-way Elo: a strong learner's ability rises above default ---
(() => {
  const attempts: AdaptiveAttempt[] = [];
  for (let i = 0; i < 30; i++) {
    attempts.push({
      learnerId: 'ace',
      itemId: `item-${i}`,
      correct: true, // aces every hard item
      difficulty: 'hard',
      answeredAt: `2026-02-01T00:${String(i).padStart(2, '0')}:00.000Z`,
    });
  }
  const { learners } = calibrateAbilities(attempts);
  assert(
    learners.get('ace')!.ability > DEFAULT_ABILITY + 200,
    'A learner who aces hard items should rate well above default ability.',
  );
})();

// --- EAP ability estimate recovers a known ability from simulated responses ---
(() => {
  const rng = makeRng(7);
  const trueAbility = 1500;
  const difficulties = [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700];
  const responses = [] as Array<{ difficulty: number; correct: boolean }>;
  for (let rep = 0; rep < 6; rep++) {
    for (const d of difficulties) {
      responses.push({ difficulty: d, correct: rng() < expectedScore(trueAbility, d) });
    }
  }
  const est = estimateAbilityEAP(responses);
  assert(
    Math.abs(est.ability - trueAbility) < 130,
    `EAP should recover ability within ~130 pts (got ${est.ability.toFixed(0)}).`,
  );
})();

// --- selectNextCatItem picks the most informative unanswered item ---
(() => {
  const pool: CatItem[] = [
    { id: 'a', difficulty: 800 },
    { id: 'b', difficulty: 1180 },
    { id: 'c', difficulty: 1600 },
  ];
  const pick = selectNextCatItem(pool, 1200, []);
  assert(pick?.id === 'b', 'At ability 1200 the closest-difficulty item must be chosen.');
  const pick2 = selectNextCatItem(pool, 1200, ['b']);
  assert(pick2?.id === 'a' || pick2?.id === 'c', 'Already-asked items must be skipped.');
})();

// --- Full CAT converges to the right level in <= random's fixed 20, with fewer items ---
(() => {
  const rng = makeRng(99);
  const pool: CatItem[] = [];
  for (let d = 800; d <= 1700; d += 50) pool.push({ id: `q${d}`, difficulty: d });
  const trueAbility = 1450;
  const result = runCatSession(pool, (item) => rng() < expectedScore(trueAbility, item.difficulty), {
    maxItems: 12,
    minItems: 4,
    seThreshold: 120,
  });
  assert(result.steps.length <= 12, 'CAT must respect the item cap.');
  assert(result.steps.length < 20, 'CAT should finish in fewer items than the legacy fixed 20-item diagnostic.');
  assert(
    Math.abs(result.ability - trueAbility) < 160,
    `CAT should locate ability near 1450 (got ${result.ability.toFixed(0)}).`,
  );
  assert(result.difficultyLabel === 'hard', "A 1450-ability learner should be routed to 'hard' material.");
})();

console.log('Adaptive engine tests passed.');
// --- buildAdaptiveDiagnostic targets the learner's level and spreads difficulty ---
(() => {
  // A weak learner: many wrong on hard, right on easy -> low ability.
  const attempts: AdaptiveAttempt[] = [];
  let k = 0;
  for (let i = 0; i < 10; i++) {
    attempts.push({
      learnerId: 'weak',
      itemId: `seen-${k++}`,
      correct: true,
      difficulty: 'easy',
      answeredAt: `2026-03-01T00:${String(i).padStart(2, '0')}:00Z`,
    });
    attempts.push({
      learnerId: 'weak',
      itemId: `seen-${k++}`,
      correct: false,
      difficulty: 'hard',
      answeredAt: `2026-03-01T01:${String(i).padStart(2, '0')}:00Z`,
    });
  }
  const pool = [
    ...Array.from({ length: 6 }, (_, i) => ({ id: `easy-${i}`, difficulty: 'easy', programIds: ['vn_math_6_9'] })),
    ...Array.from({ length: 6 }, (_, i) => ({ id: `medium-${i}`, difficulty: 'medium', programIds: ['vn_math_6_9'] })),
    ...Array.from({ length: 6 }, (_, i) => ({ id: `hard-${i}`, difficulty: 'hard', programIds: ['vn_math_6_9'] })),
  ];
  const picked = buildAdaptiveDiagnostic(pool, attempts, { learnerId: 'weak', limit: 4, programId: 'vn_math_6_9' });
  assert(picked.length === 4, 'Adaptive diagnostic should return the requested count.');
  assert(
    picked.every((p) => !p.id.startsWith('seen-')),
    'Adaptive diagnostic must exclude already-attempted items.',
  );
  const hardCount = picked.filter((p) => p.difficulty === 'hard').length;
  const easyCount = picked.filter((p) => p.difficulty === 'easy').length;
  assert(easyCount >= hardCount, 'A weak learner should be routed to more easy than hard items.');

  // Filtering by program excludes off-program items.
  const offProgram = buildAdaptiveDiagnostic(
    [...pool, { id: 'other-1', difficulty: 'medium', programIds: ['other_program'] }],
    attempts,
    { learnerId: 'weak', limit: 20, programId: 'vn_math_6_9' },
  );
  assert(!offProgram.some((p) => p.id === 'other-1'), 'Adaptive diagnostic must respect the program filter.');
})();

console.log('buildAdaptiveDiagnostic tests passed.');
