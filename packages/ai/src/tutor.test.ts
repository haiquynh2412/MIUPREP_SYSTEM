import type { SpeakingFeedback, WritingFeedback } from '@miuprep/db';
import { computeMastery, emptyStudentModel } from '@miuprep/learning';
import {
  classifyTutorError,
  buildProductiveSkillGovernanceReport,
  generateSpeakingFeedbackPracticePlan,
  generateQuestionTutorFeedback,
  generateWritingFeedbackPracticePlan,
  gradeSpeakingWithTutorEvent,
  gradeWritingWithTutorEvent,
  recordQuestionTutorFeedback,
  scoreProductiveFeedbackReliability,
  type TutorSpeakingAdapter,
  type TutorWritingAdapter,
  buildSpeakingFeedbackPracticeState,
} from './tutor';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const mathFeedback = generateQuestionTutorFeedback({
  learnerId: 'learner-ai-1',
  itemId: 'q-quadratic-1',
  track: 'math',
  domainId: 'mathematics',
  programId: 'vn_math_6_9',
  questionText: 'Solve the quadratic equation by factorization.',
  userAnswer: 'x = 2',
  correctAnswer: 'x = 2 or x = 3',
  conceptIds: ['math.quadratic_equation'],
  skillIds: ['math.solve_quadratic_by_factor'],
});

assert(
  mathFeedback.classifiedErrorCategories.includes('algebra_transform'),
  'Tutor should classify algebra transform errors.',
);
assert(mathFeedback.socraticHints.length >= 2, 'Tutor should generate Socratic hints.');
assert(mathFeedback.remediationLessons.length === 1, 'Tutor should recommend a remediation lesson.');
assert(mathFeedback.confidence >= 0.7, 'Tutor confidence should be higher when metadata exists.');

const inferredCategories = classifyTutorError({
  learnerId: 'learner-ai-1',
  itemId: 'q-grammar-1',
  track: 'ielts',
  questionText: 'Choose the sentence with correct subject verb agreement.',
  userAnswer: 'Some people finds it hard.',
  correctAnswer: 'Some people find it hard.',
});
assert(inferredCategories.includes('grammar'), 'Tutor should infer grammar errors when metadata is missing.');

const state = emptyStudentModel('learner-ai-1', ['vn_math_6_9']);
const recorded = recordQuestionTutorFeedback(state, {
  learnerId: 'learner-ai-1',
  itemId: 'q-quadratic-1',
  track: 'math',
  domainId: 'mathematics',
  programId: 'vn_math_6_9',
  conceptIds: ['math.quadratic_equation'],
  skillIds: ['math.solve_quadratic_by_factor'],
  errorCategories: ['algebra_transform'],
  correctAnswer: 'x = 2 or x = 3',
  userAnswer: 'x = 2',
});

assert(recorded.state.attempts.length === 0, 'AI tutor feedback should not create mastery attempts.');
assert(recorded.state.learningEvents.length === 1, 'AI tutor feedback should create a learning event.');
assert(recorded.event.payload.confidence === recorded.feedback.confidence, 'AI tutor event should persist confidence.');
assert(computeMastery(recorded.state).length === 0, 'AI tutor feedback should not alter mastery.');

const writingFeedback: WritingFeedback = {
  attemptId: 'writing-1',
  taskNumber: 2,
  bandOverall: 7,
  criteria: [
    { criterionName: 'Task Response', band: 7, feedbackText: 'Clear response.', nextAction: 'Add sharper evidence.' },
    {
      criterionName: 'Coherence and Cohesion',
      band: 6.5,
      feedbackText: 'Mostly clear.',
      nextAction: 'Improve paragraph links.',
    },
    { criterionName: 'Lexical Resource', band: 7, feedbackText: 'Good vocabulary.' },
    { criterionName: 'Grammatical Range and Accuracy', band: 6.5, feedbackText: 'Some grammar slips.' },
  ],
  corrections: [],
  suggestionsForImprovement: ['Improve paragraph links.'],
  modelUsed: 'fake-writing',
  createdAt: '2026-06-02T00:00:00.000Z',
  confidence: 0.91,
};

const speakingFeedback: SpeakingFeedback = {
  attemptId: 'speaking-1',
  transcript: 'I think learning English is useful.',
  bandOverall: 6.5,
  criteria: [
    { criterionName: 'Fluency and Coherence', band: 6.5, feedbackText: 'Natural pace.' },
    { criterionName: 'Lexical Resource', band: 6.5, feedbackText: 'Enough vocabulary.' },
    { criterionName: 'Grammatical Range and Accuracy', band: 6, feedbackText: 'Grammar needs control.' },
    { criterionName: 'Pronunciation', band: 6.5, feedbackText: 'Generally clear.' },
  ],
  pronunciationErrors: [],
  fluencyReview: 'Natural pace with minor hesitation.',
  modelUsed: 'fake-speaking',
  createdAt: '2026-06-02T00:01:00.000Z',
  confidence: 0.88,
};

const writingAdapter: TutorWritingAdapter = {
  async gradeWriting() {
    return writingFeedback;
  },
};
const speakingAdapter: TutorSpeakingAdapter = {
  async gradeSpeaking() {
    return speakingFeedback;
  },
};

const writingPlan = generateWritingFeedbackPracticePlan(writingFeedback, {
  track: 'ielts',
  maxTasks: 3,
  now: '2026-06-02T00:02:00.000Z',
});
assert(
  writingPlan.tasks.length >= 1 && writingPlan.tasks.length <= 3,
  'Writing plan should create 1-3 practice tasks.',
);
assert(
  writingPlan.tasks.some((task) => task.area === 'coherence'),
  'Writing plan should target the weakest criterion.',
);
assert(
  writingPlan.revisionLoop.steps.some((step) => step.label === 'Rewrite'),
  'Writing plan should include rewrite loop.',
);
assert(
  writingPlan.revisionLoop.validityGate.masteryEligible === false,
  'Writing/Speaking mastery should remain gated.',
);

const speakingPlan = generateSpeakingFeedbackPracticePlan(speakingFeedback, {
  track: 'cpe',
  maxTasks: 3,
  now: '2026-06-02T00:03:00.000Z',
});
assert(
  speakingPlan.tasks.length >= 1 && speakingPlan.tasks.length <= 3,
  'Speaking plan should create 1-3 practice tasks.',
);
assert(
  speakingPlan.tasks.some((task) => task.area === 'grammar_accuracy'),
  'Speaking plan should target the weakest criterion.',
);
assert(
  speakingPlan.revisionLoop.steps.some((step) => step.label === 'Rerecord'),
  'Speaking plan should include rerecord loop.',
);

const speakingState = buildSpeakingFeedbackPracticeState(speakingFeedback, speakingPlan, {
  track: 'cpe',
  now: '2026-06-02T00:04:00.000Z',
});
assert(speakingState.transcriptStatus === 'captured', 'Speaking practice state should capture transcript status.');
assert(
  speakingState.recordingSlots.length === 3,
  'Speaking practice state should include original, rerecord, and teacher slots.',
);
assert(speakingState.scoringReady === false, 'Speaking practice state should stay scoring-gated.');

const governedWritingFeedback: WritingFeedback = {
  ...writingFeedback,
  rubricVersion: 'v1.0.0-academic',
  descriptorSource: 'IELTS Writing Band Descriptors May 2023',
  criteria: writingFeedback.criteria.map((criterion) => ({
    ...criterion,
    evidence: criterion.evidence || ['expert-aligned rubric evidence'],
  })),
};
const governanceReport = buildProductiveSkillGovernanceReport(
  [
    {
      sampleId: 'writing-governance-pass',
      feedbackType: 'writing',
      feedback: governedWritingFeedback,
      expertOverall: 7,
      expertCriteria: {
        'Task Response': 7,
        'Coherence and Cohesion': 6.5,
      },
      provider: 'mock',
    },
  ],
  { generatedAt: '2026-06-02T00:05:00.000Z' },
);
assert(
  governanceReport.schemaVersion === 'productive_skill_governance_v1',
  'Productive-skill governance report should be versioned.',
);
assert(governanceReport.status === 'pass', 'Governance report should pass clean golden samples.');
assert(
  governanceReport.masteryPolicy === 'feedback_only_locked',
  'Governance report should keep productive-skill mastery locked.',
);
assert(governanceReport.masteryEligible === false, 'Governance report should not make AI scoring mastery eligible.');
assert(governanceReport.consensusPolicy === 'validation_only', 'Consensus should remain validation-only.');
assert(
  governanceReport.averageReliabilityConfidence >= 0.9,
  'Governance report should expose reliability confidence for clean samples.',
);

const shortSpeakingReliability = scoreProductiveFeedbackReliability(speakingFeedback, 'speaking', {
  responseText: speakingFeedback.transcript,
  provider: 'mock',
});
assert(
  shortSpeakingReliability.confidence < Number(speakingFeedback.confidence),
  'Reliability scoring should lower confidence for short/thin speaking evidence.',
);
assert(
  shortSpeakingReliability.reasons.includes('short speaking sample'),
  'Reliability scoring should explain short speaking samples.',
);

const lowReliabilitySpeakingFeedback: SpeakingFeedback = {
  ...speakingFeedback,
  transcript: 'Too short.',
  rubricVersion: 'v1.0.0-speaking',
  descriptorSource: 'IELTS Speaking Band Descriptors',
  confidence: 0.62,
  criteria: speakingFeedback.criteria.map((criterion) => ({ ...criterion, evidence: ['sample evidence'] })),
};
const watchGovernanceReport = buildProductiveSkillGovernanceReport(
  [
    {
      sampleId: 'speaking-governance-watch',
      feedbackType: 'speaking',
      feedback: lowReliabilitySpeakingFeedback,
      responseText: lowReliabilitySpeakingFeedback.transcript,
      expertOverall: 6.5,
      provider: 'mock',
    },
  ],
  { generatedAt: '2026-06-02T00:05:30.000Z' },
);
assert(
  watchGovernanceReport.status === 'watch',
  'Governance report should watch low reliability even when metadata is present.',
);
assert(
  watchGovernanceReport.findings.some((finding) => finding.reason === 'low_reliability_confidence'),
  'Governance report should expose low adjusted confidence.',
);

const blockedGovernanceReport = buildProductiveSkillGovernanceReport(
  [
    {
      sampleId: 'writing-governance-blocked',
      feedbackType: 'writing',
      feedback: writingFeedback,
      expertOverall: 8,
    },
  ],
  { generatedAt: '2026-06-02T00:06:00.000Z' },
);
assert(
  blockedGovernanceReport.status === 'blocked',
  'Governance report should block missing provenance or excessive deviation.',
);
assert(
  blockedGovernanceReport.findings.some((finding) => finding.reason === 'missing_required_fields'),
  'Governance report should expose missing metadata.',
);

runAsyncChecks().catch((error) => {
  throw error;
});

testSessionCredentialStore().catch((error) => {
  throw error;
});

async function testSessionCredentialStore(): Promise<void> {
  const { SessionCredentialStore } = await import('./utils/credential-store');

  // Simulate a browser with a legacy XOR-obfuscated key left in localStorage
  const legacySalt = 'ielts-prep-obfuscator-entropy-salt-v1';
  const legacyEncode = (text: string) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ legacySalt.charCodeAt(i % legacySalt.length));
    }
    return Buffer.from(unescape(encodeURIComponent(result)), 'binary').toString('base64');
  };

  const backing = new Map<string, string>();
  backing.set('ielts_app_secure_openai', legacyEncode('sk-legacy-value'));
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => backing.get(k) ?? null,
      setItem: (k: string, v: string) => void backing.set(k, v),
      removeItem: (k: string) => void backing.delete(k),
    },
  };
  (globalThis as any).localStorage = (globalThis as any).window.localStorage;

  try {
    const store = new SessionCredentialStore();
    assert((await store.get('openai')) === 'sk-legacy-value', 'Legacy XOR value should be migrated into memory.');
    assert(
      !backing.has('ielts_app_secure_openai'),
      'Legacy XOR value must be purged from localStorage after migration.',
    );

    await store.set('gemini', 'g-key');
    assert((await store.get('gemini')) === 'g-key', 'Session store should return values set in memory.');
    assert(
      [...backing.keys()].every((k) => !k.includes('gemini')),
      'Session store must never persist keys to localStorage.',
    );

    await store.delete('gemini');
    assert((await store.get('gemini')) === null, 'Deleted keys should be gone.');
  } finally {
    delete (globalThis as any).window;
    delete (globalThis as any).localStorage;
  }
}

async function runAsyncChecks(): Promise<void> {
  const writingRecorded = await gradeWritingWithTutorEvent(writingAdapter, state, {
    attemptId: 'writing-1',
    essay: 'A complete essay body.',
    taskNumber: 2,
    track: 'ielts',
  });
  assert(writingRecorded.event.payload.aiFeedbackType === 'writing', 'Writing tutor event should be typed.');
  assert(
    writingRecorded.event.payload.attemptId === 'writing-1',
    'Writing tutor event should persist attempt id directly.',
  );
  assert(
    writingRecorded.event.payload.modelUsed === 'fake-writing',
    'Writing tutor event should persist model provenance directly.',
  );
  assert(
    writingRecorded.event.payload.provider === 'mock',
    'Writing tutor event should persist provider provenance directly.',
  );
  assert(
    writingRecorded.event.payload.rawConfidence === 0.91,
    'Writing tutor event should persist raw adapter confidence.',
  );
  assert(
    Number(writingRecorded.event.payload.confidence) < 0.91,
    'Writing tutor event should persist adjusted reliability confidence.',
  );
  assert(
    Array.isArray(writingRecorded.event.payload.confidenceReasons),
    'Writing tutor event should persist confidence reasons.',
  );
  assert(
    Array.isArray(writingRecorded.event.payload.evidence),
    'Writing tutor event should persist governance evidence directly.',
  );
  assert(Boolean(writingRecorded.event.payload.practicePlan), 'Writing tutor event should persist the practice plan.');

  const speakingRecorded = await gradeSpeakingWithTutorEvent(speakingAdapter, state, {
    attemptId: 'speaking-1',
    transcriptMock: 'I think learning English is useful.',
    track: 'cpe',
  });
  assert(speakingRecorded.event.payload.aiFeedbackType === 'speaking', 'Speaking tutor event should be typed.');
  assert(
    speakingRecorded.event.payload.attemptId === 'speaking-1',
    'Speaking tutor event should persist attempt id directly.',
  );
  assert(
    speakingRecorded.event.payload.modelUsed === 'fake-speaking',
    'Speaking tutor event should persist model provenance directly.',
  );
  assert(
    speakingRecorded.event.payload.provider === 'mock',
    'Speaking tutor event should persist provider provenance directly.',
  );
  assert(
    speakingRecorded.event.payload.rawConfidence === 0.88,
    'Speaking tutor event should persist raw adapter confidence.',
  );
  assert(
    Number(speakingRecorded.event.payload.confidence) < 0.88,
    'Speaking tutor event should persist adjusted reliability confidence.',
  );
  assert(
    Array.isArray(speakingRecorded.event.payload.confidenceReasons),
    'Speaking tutor event should persist confidence reasons.',
  );
  assert(
    Array.isArray(speakingRecorded.event.payload.evidence),
    'Speaking tutor event should persist governance evidence directly.',
  );
  assert(
    Boolean(speakingRecorded.event.payload.practicePlan),
    'Speaking tutor event should persist the practice plan.',
  );
  assert(
    Boolean(speakingRecorded.event.payload.speakingPracticeState),
    'Speaking tutor event should persist recording/transcript state.',
  );
  assert(computeMastery(speakingRecorded.state).length === 0, 'Speaking feedback plan should not alter mastery.');
}

// ===========================================================================
// Cache + cost ledger tests
// ===========================================================================
import { CachingAIAdapter, hashContent, PROMPT_VERSION } from './utils/cache';
import { UsageLedger, QuotaExceededError, estimateCostUsd } from './utils/usage';
import type { AIAdapter } from './index';

async function testCacheAndUsage(): Promise<void> {
  assert(hashContent(['a', 1]) === hashContent(['a', 1]), 'hashContent must be stable for equal inputs.');
  assert(hashContent(['a', 1]) !== hashContent(['a', 2]), 'hashContent must differ for different inputs.');

  let writingCalls = 0;
  let speakingCalls = 0;
  const fake: AIAdapter = {
    async gradeWriting() {
      writingCalls++;
      return {
        attemptId: 'x',
        taskNumber: 2,
        bandOverall: 7,
        criteria: [],
        corrections: [],
        suggestionsForImprovement: [],
      } as any;
    },
    async gradeSpeaking() {
      speakingCalls++;
      return { attemptId: 'x' } as any;
    },
  };

  const ledger = new UsageLedger({ perLearnerUsd: 1 });
  const adapter = new CachingAIAdapter(fake, {
    ledger,
    learnerId: 'L1',
    model: 'gpt-4o',
    now: () => '2026-06-11T00:00:00.000Z',
  });

  const essay = 'A reasonably long essay body that repeats. '.repeat(20);
  await adapter.gradeWriting({ attemptId: 'a1', essay, taskNumber: 2, track: 'ielts' });
  await adapter.gradeWriting({ attemptId: 'a2', essay, taskNumber: 2, track: 'ielts' });
  assert(writingCalls === 1, 'Identical essay must hit cache on the second call (provider invoked once).');

  await adapter.gradeWriting({ attemptId: 'a3', essay: essay + ' extra', taskNumber: 2, track: 'ielts' });
  assert(writingCalls === 2, 'A changed essay must miss the cache and call the provider.');

  const summary = ledger.summary('L1');
  assert(summary.calls === 3, 'Ledger should record all three calls.');
  assert(summary.cachedCalls === 1, 'Exactly one call should be marked cached.');
  assert(summary.billedCostUsd > 0, 'Billed cost should accrue for provider calls.');
  assert(summary.billedCostUsd < summary.totalCostUsd, 'Billed cost must exclude the cached call cost.');

  // Quota enforcement: a tiny per-learner cap blocks before the billable call.
  const strict = new UsageLedger({ perLearnerUsd: 0.0000001 });
  const strictAdapter = new CachingAIAdapter(fake, { ledger: strict, learnerId: 'L2', model: 'gpt-4o' });
  let threw = false;
  try {
    await strictAdapter.gradeSpeaking({ attemptId: 's1', transcriptMock: 'hello '.repeat(50), track: 'cpe' });
  } catch (e) {
    threw = e instanceof QuotaExceededError;
  }
  assert(threw, 'A breached per-learner quota must throw QuotaExceededError before calling the provider.');
  assert(speakingCalls === 0, 'Provider speaking grader must not run when quota is exceeded.');

  assert(estimateCostUsd('gpt-4o', 1_000_000, 0) === 2.5, 'Cost estimate should match the gpt-4o input price.');
  assert(estimateCostUsd('mock', 1_000_000, 1_000_000) === 0, 'Mock model must be free.');
  assert(PROMPT_VERSION.length > 0, 'PROMPT_VERSION must be set for cache invalidation.');
}

testCacheAndUsage()
  .then(() => console.log('Cache + usage tests passed.'))
  .catch((e) => {
    throw e;
  });
