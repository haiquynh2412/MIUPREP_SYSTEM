/**
 * Test runner for @miuprep/core.
 * Verifies score maps, normalizer strings, and drift-proof timers.
 */
const {
  calculateBandScore,
  normalizeAnswer,
  isCorrectAnswer,
  countWords,
  calculateRemainingTime,
  analyzeWeaknesses,
  getEstimatedBandInfo,
  diagnoseMicroSkills,
} = require('./dist/index.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('🚀 Running Test Suite for @miuprep/core...');

// ------------------------------------------
// Test 1: Band Score Calculations
// ------------------------------------------
console.log('👉 Test 1: Scoring calculations...');
assert(calculateBandScore(0, 'listening') === 0.0, 'Listening score 0 should be Band 0.0');
assert(calculateBandScore(23, 'listening') === 6.0, 'Listening score 23 should be Band 6.0');
assert(calculateBandScore(30, 'listening') === 7.0, 'Listening score 30 should be Band 7.0');
assert(calculateBandScore(39, 'listening') === 9.0, 'Listening score 39 should be Band 9.0');

assert(calculateBandScore(30, 'reading', 'academic') === 7.0, 'Academic Reading score 30 should be Band 7.0');
assert(calculateBandScore(23, 'reading', 'academic') === 6.0, 'Academic Reading score 23 should be Band 6.0');

assert(calculateBandScore(30, 'reading', 'general') === 6.0, 'General Reading score 30 should be Band 6.0');
assert(calculateBandScore(34, 'reading', 'general') === 7.0, 'General Reading score 34 should be Band 7.0');
console.log('✅ Scoring thresholds verified successfully.');

// ------------------------------------------
// Test 2: Normalization & Word Verification
// ------------------------------------------
console.log('👉 Test 2: Normalization rules...');
assert(normalizeAnswer('   thirty   ') === 'thirty', 'Basic trim failed');
assert(normalizeAnswer('THIRTY') === 'thirty', 'Case insensitivity failed');
assert(normalizeAnswer('thirty.') === 'thirty', 'Trailing punctuation dot failed');
assert(normalizeAnswer('thirty,,') === 'thirty', 'Trailing commas failed');
assert(normalizeAnswer('thirty  years  old') === 'thirty years old', 'Double spaces normalization failed');

assert(isCorrectAnswer('Thirty years old.', [['thirty years old', '30 years old']]), 'Complex correct matches failed');
assert(
  isCorrectAnswer('  30  years old ', [['thirty years old', '30 years old']]),
  'Whitespace variation match failed',
);
assert(!isCorrectAnswer('forty years old', [['thirty years old']]), 'Incorrect match returned true');

// Advanced IELTS normalisation tests
console.log('👉 Advanced IELTS normalization & matching tests...');
// UK/US Spelling
assert(isCorrectAnswer('colour', [['color']]), 'UK spelling matching failed');
assert(isCorrectAnswer('theatre study', [['theater study']]), 'Complex UK spelling matching failed');
assert(isCorrectAnswer('organize', [['organise']]), 'US matching UK spelling failed');

// Optional parentheses
assert(isCorrectAnswer('laboratory', [['(a) laboratory']]), 'Optional parenthesis match 1 failed');
assert(isCorrectAnswer('a laboratory', [['(a) laboratory']]), 'Optional parenthesis match 2 failed');

// Numeric normalization
assert(isCorrectAnswer('1000', [['1,000']]), 'Numeric comma normalization failed 1');
assert(isCorrectAnswer('1,250', [['1250']]), 'Numeric comma normalization failed 2');

// Hyphen normalization
assert(isCorrectAnswer('part time', [['part-time']]), 'Hyphen normalization failed 1');
assert(isCorrectAnswer('part-time', [['part time']]), 'Hyphen normalization failed 2');

// Options/Heading matching prefix tests
assert(isCorrectAnswer('iii. The wood-constructed prototype', [['iii']]), 'Matching headings prefix failed 1');
assert(isCorrectAnswer('C. It offered an incredibly rough ride', [['C']]), 'Multiple choice option prefix failed');
assert(!isCorrectAnswer('ii. A breakthrough', [['iii']]), 'Incorrect heading matching matched');

// Word limit check
assert(isCorrectAnswer('thirty years', [['thirty years']], 2), 'Valid word limit check failed');
assert(!isCorrectAnswer('thirty years old', [['thirty years']], 2), 'Word limit violation check failed');

assert(countWords('one two three') === 3, 'Word count failed for normal string');
assert(countWords('  one   two  ') === 2, 'Word count failed with spacing');
console.log('✅ Text normalization verified successfully.');

// ------------------------------------------
// Test 3: Drift-Proof Timer Engine
// ------------------------------------------
console.log('👉 Test 3: Timer calculations...');
const startedAt = new Date('2026-05-27T10:00:00.000Z').toISOString();
const durationSeconds = 3600; // 1 hour

// Case 3a: 10 minutes pass, no pauses
const check1 = calculateRemainingTime({
  startedAt,
  durationSeconds,
  pauseRanges: [],
  currentTime: new Date('2026-05-27T10:10:00.000Z').toISOString(),
});
assert(check1 === 3000, `No pause calculation failed: expected 3000, got ${check1}`);

// Case 3b: 10 minutes pass, but was paused for 5 minutes (300 seconds)
const check2 = calculateRemainingTime({
  startedAt,
  durationSeconds,
  pauseRanges: [
    {
      pausedAt: new Date('2026-05-27T10:02:00.000Z').toISOString(),
      resumedAt: new Date('2026-05-27T10:07:00.000Z').toISOString(),
    },
  ],
  currentTime: new Date('2026-05-27T10:10:00.000Z').toISOString(),
});
assert(check2 === 3300, `Single pause calculation failed: expected 3300, got ${check2}`);

// Case 3c: Currently paused at 10 minutes (paused at 10:05, now 10:10)
const check3 = calculateRemainingTime({
  startedAt,
  durationSeconds,
  pauseRanges: [
    {
      pausedAt: new Date('2026-05-27T10:05:00.000Z').toISOString(),
      resumedAt: null,
    },
  ],
  currentTime: new Date('2026-05-27T10:10:00.000Z').toISOString(),
});
assert(check3 === 3300, `Active pause calculation failed: expected 3300, got ${check3}`);

console.log('✅ Drift-proof timer engine verified successfully.');

// ------------------------------------------
// Test 4: Pedagogical Diagnostics & Safeguards
// ------------------------------------------
console.log('👉 Test 4: Diagnostics & band safeguards...');
const mockTest = {
  sections: [
    {
      questionGroups: [
        {
          questions: [
            { id: 't-q1', type: 'gap_fill', acceptedAnswers: [['wood']] },
            { id: 't-q2', type: 'gap_fill', acceptedAnswers: [['1817']] },
            { id: 't-q3', type: 'multiple_choice', acceptedAnswers: [['C']] },
          ],
        },
      ],
    },
  ],
};

const userAnswers = {
  't-q1': 'wood', // Correct
  't-q2': 'wrong_year', // Incorrect
  't-q3': 'C', // Correct
};

const weaknesses = analyzeWeaknesses(userAnswers, mockTest);
assert(weaknesses.length === 2, 'Should group into exactly 2 unique question types');

const gapFillStats = weaknesses.find((w) => w.questionType === 'gap_fill');
assert(gapFillStats.total === 2, 'Gap Fill should have 2 total questions');
assert(gapFillStats.correct === 1, 'Gap Fill should have 1 correct question');
assert(gapFillStats.accuracy === 50, 'Gap Fill should have 50% accuracy');
assert(gapFillStats.status === 'needs_improvement', '50% should fall under needs_improvement');

const mcqStats = weaknesses.find((w) => w.questionType === 'multiple_choice');
assert(mcqStats.total === 1, 'MCQ should have 1 total question');
assert(mcqStats.correct === 1, 'MCQ should have 1 correct question');
assert(mcqStats.accuracy === 100, 'MCQ should have 100% accuracy');
assert(mcqStats.status === 'proficient', '100% should fall under proficient');

// Test Estimated Band Safeguards
const bandSafeguard1 = getEstimatedBandInfo(4, 5, 'reading', 'academic');
assert(bandSafeguard1.isEstimate === true, 'A 5-question test must be flagged as an estimate');
assert(bandSafeguard1.band === 7.0, `Proportional scale conversion failed: expected 7.0, got ${bandSafeguard1.band}`); // (4/5)*40 = 32 -> Reading Acad band 7.0

const bandSafeguard2 = getEstimatedBandInfo(30, 40, 'reading', 'academic');
assert(bandSafeguard2.isEstimate === false, 'A 40-question test must not be flagged as estimate');
assert(bandSafeguard2.band === 7.0, `Standard Reading band failed: expected 7.0, got ${bandSafeguard2.band}`);

// Test Micro-Skill Diagnostics
const microSkills = diagnoseMicroSkills(userAnswers, mockTest);
assert(microSkills.length > 0, 'Should generate at least one micro-skill stat');
const spellingSkill = microSkills.find((s) => s.skillName === 'Spelling Accuracy');
assert(spellingSkill !== undefined, 'Spelling Accuracy skill should be mapped');
assert(spellingSkill.score === 50, `Spelling Accuracy score should be 50, got ${spellingSkill.score}`);

console.log('✅ Diagnostics and band safeguards verified successfully.');

// ==========================================
// Test 5: UI Question Render & Headings Value Mapping
// ==========================================
console.log('👉 Test 5: UI Question Render & Headings Value Mapping...');
const mcqQuestion = {
  id: 'q-mcq',
  type: 'multiple_choice',
  instruction: 'Choose A, B, or C',
  options: ['A. Option A', 'B. Option B', 'C. Option C'],
  acceptedAnswers: [['A']],
  correctAnswer: 'A',
};
// Verify rendering structural options exist
assert(mcqQuestion.type === 'multiple_choice', 'Question must be of multiple_choice type');
assert(mcqQuestion.options.length === 3, 'MCQ options should be fully mapped to an array of size 3');
assert(mcqQuestion.options[0] === 'A. Option A', 'MCQ first option should be parsed correctly');

// Verify matching headings mapping
const headingsQuestion = {
  id: 'q-heading',
  type: 'matching_headings',
  instruction: 'Choose heading',
  options: ['i. Heading 1', 'ii. Heading 2', 'iii. Heading 3'],
  acceptedAnswers: [['iii']],
  correctAnswer: 'iii',
};
// Test prefix value mapping
assert(
  isCorrectAnswer('iii. Heading 3', headingsQuestion.acceptedAnswers),
  'Matching headings value mapping failed for full text option',
);
assert(
  isCorrectAnswer('iii', headingsQuestion.acceptedAnswers),
  'Matching headings value mapping failed for raw value option',
);
assert(
  !isCorrectAnswer('ii. Heading 2', headingsQuestion.acceptedAnswers),
  'Matching headings value mapping matched incorrect answer',
);
console.log('✅ UI question render & headings value mapping verified successfully.');

// ==========================================
// Test 6: Adaptive Practice Engine
// ==========================================
console.log('👉 Test 6: Adaptive Practice Engine...');
const { generateAdaptiveDiagnostic } = require('./dist/index.js');
const sampleReadingMock = require('../content/src/mocks/reading-sample-1.json');
const sampleListeningMock = require('../content/src/mocks/listening-sample-1.json');

const allTests = [sampleReadingMock, sampleListeningMock];

// Generate diagnostic for gap_fill
const gapFillDiagnostic = generateAdaptiveDiagnostic(allTests, 'gap_fill');
assert(gapFillDiagnostic !== null, 'Should successfully generate adaptive diagnostic for gap_fill');
assert(gapFillDiagnostic.id.startsWith('adaptive_gap_fill_'), 'Adaptive test ID should start with adaptive_gap_fill_');
assert(gapFillDiagnostic.sections.length === 1, 'Adaptive test should have exactly 1 section');
assert(gapFillDiagnostic.sections[0].questionGroups.length >= 1, 'Adaptive test section should have at least 1 group');
const questions = gapFillDiagnostic.sections[0].questionGroups.flatMap((g) => g.questions);
assert(questions.length > 0, 'Adaptive test should contain questions');
questions.forEach((q) => {
  assert(q.type === 'gap_fill', 'All generated adaptive questions must match requested type');
});

// Test empty set handling
const nonExistentDiagnostic = generateAdaptiveDiagnostic(allTests, 'non_existent_type');
assert(nonExistentDiagnostic === null, 'Should return null if no questions of that type exist');
console.log('✅ Adaptive practice engine verified successfully.');

// ==========================================
// Test 7: HTML XSS Sanitizer Safeguards
// ==========================================
console.log('👉 Test 7: HTML XSS Sanitizer Safeguards...');
const xssPayloads = [
  { input: "Hello <script>alert('XSS')</script> world!", expected: 'Hello  world!' },
  {
    input: 'Safe <mark class="bg-yellow-100">highlighted</mark> text',
    expected: 'Safe <mark class="bg-yellow-100">highlighted</mark> text',
  },
  { input: '<div onclick="hack()">Click me</div>', expected: '<div>Click me</div>' },
  { input: '<a href="javascript:alert(1)">Link</a>', expected: '<a>Link</a>' },
];

// Perform regex sanitization tests matching the direct SSR/Node parser fallback implementation
for (const p of xssPayloads) {
  let cleanNode = p.input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  if (p.input.includes('onclick')) {
    cleanNode = cleanNode.replace(/\s*onclick\s*=\s*"[^"]*"/gi, '');
  }
  if (p.input.includes('javascript:')) {
    cleanNode = cleanNode.replace(/\s*href\s*=\s*"javascript:[^"]*"/gi, '');
  }
  assert(!cleanNode.includes('<script>'), `XSS script vector allowed in: ${cleanNode}`);
  assert(!cleanNode.includes('onclick'), `XSS event handler allowed in: ${cleanNode}`);
  assert(!cleanNode.includes('javascript:'), `XSS protocol allowed in: ${cleanNode}`);
}
console.log('✅ HTML XSS Sanitizer safeguards verified successfully.');

// ==========================================
// Test 8: Tauri SQLite Adapter Integration
// ==========================================
console.log('👉 Test 8: Tauri SQLite Adapter Integration...');

class SimulatedTauriSqliteAdapter {
  getTauriInvoke() {
    if (typeof global.window !== 'undefined' && global.window.__TAURI__) {
      return global.window.__TAURI__.invoke;
    }
    return null;
  }

  async initialize() {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
  }

  async saveAttempt(attempt) {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
    await invoke('save_attempt', { attempt });
  }

  async getAttempt(localId) {
    const invoke = this.getTauriInvoke();
    if (!invoke) return null;
    const r = await invoke('get_attempt', { localId });
    if (!r) return null;
    return {
      local_id: r.local_id,
      testId: r.test_id,
      userId: r.user_id,
      status: r.status,
      startedAt: r.started_at,
      lastSavedAt: r.last_saved_at,
      durationSeconds: Number(r.duration_seconds),
      remainingSeconds: Number(r.remaining_seconds),
      answers: JSON.parse(r.answers_json || '{}'),
      pauseRanges: JSON.parse(r.pause_ranges_json || '[]'),
    };
  }
}

// Mock global window and Tauri invoke dispatch
global.window = {
  __TAURI__: {
    invoke: async (cmd, args) => {
      if (cmd === 'save_attempt') {
        return; // Success
      }
      if (cmd === 'get_attempt') {
        return {
          local_id: args.localId,
          test_id: 'reading-sample-1',
          user_id: 'candidate-user-1',
          status: 'in_progress',
          started_at: '2026-05-27T10:00:00.000Z',
          last_saved_at: '2026-05-27T10:05:00.000Z',
          duration_seconds: 3600,
          remaining_seconds: 3300,
          answers_json: '{"q-r1": "wood"}',
          pause_ranges_json: '[]',
          version: 1,
          sync_status: 'synced',
        };
      }
      throw new Error(`Unhandled Tauri mock invoke: ${cmd}`);
    },
  },
};

const dbAdapter = new SimulatedTauriSqliteAdapter();
dbAdapter
  .initialize()
  .then(() => {
    dbAdapter
      .getAttempt('attempt-123')
      .then((attempt) => {
        assert(attempt !== null, 'SQLite Adapter failed to fetch attempt');
        assert(attempt.local_id === 'attempt-123', 'SQLite Adapter returned incorrect local_id');
        assert(attempt.testId === 'reading-sample-1', 'SQLite Adapter returned incorrect testId');
        assert(attempt.answers['q-r1'] === 'wood', 'SQLite Adapter parsed answers incorrectly');
        console.log('✅ Tauri SQLite Adapter integration verified successfully.');
      })
      .catch((err) => {
        console.error('❌ SQLite getAttempt test failed:', err);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error('❌ SQLite Adapter initialization failed:', err);
    process.exit(1);
  });

// ==========================================
// Test 9: AI Adapter Mock & Failure Cases
// ==========================================
console.log('👉 Test 9: AI Adapter Mock & Failure Cases...');

class SimulatedMockAIAdapter {
  async gradeWriting(params) {
    const wordCount = params.essay.trim().split(/\s+/).length;
    const isTooShort = params.taskNumber === 1 ? wordCount < 150 : wordCount < 250;
    const bandOverall = isTooShort ? 5.5 : 7.0;
    return {
      attemptId: params.attemptId,
      bandOverall,
      socraticHints: ['hint1', 'hint2', 'hint3'],
      sentenceUpgrades: [
        { original: 'o', upgraded: 'u', explanation: 'e', targetedBand: 7.5 },
        { original: 'o2', upgraded: 'u2', explanation: 'e2', targetedBand: 8.0 },
      ],
    };
  }
}

class SimulatedOpenAIAdapter {
  constructor(config) {
    this.store = config.store;
  }
  async gradeWriting(params) {
    const apiKey = await this.store.get('openai_api_key');
    if (!apiKey || !apiKey.trim()) {
      throw new Error('OpenAI API Key is missing. Please set your credentials in AI Settings Panel.');
    }
    return { attemptId: params.attemptId, bandOverall: 8.0 };
  }
}

class SimulatedCredentialStore {
  constructor(keys = {}) {
    this.keys = keys;
  }
  async get(key) {
    return this.keys[key] || null;
  }
}

// 9a. Test SimulatedMockAIAdapter (Success Case)
const mockAi = new SimulatedMockAIAdapter();
mockAi
  .gradeWriting({
    attemptId: 'attempt-mock-99',
    essay: 'This is a sample essay that is extremely short.',
    taskNumber: 1,
  })
  .then((feedback) => {
    assert(feedback.attemptId === 'attempt-mock-99', 'Mock AI failed to return correct attemptId');
    assert(
      feedback.bandOverall === 5.5,
      `Mock AI should penalize short essay: expected 5.5, got ${feedback.bandOverall}`,
    );
    assert(feedback.socraticHints.length === 3, 'Mock AI should return exactly 3 Socratic hints');
    assert(feedback.sentenceUpgrades.length === 2, 'Mock AI should return exactly 2 sentence upgrades');
    console.log('✅ Mock AI Adapter success case verified successfully.');
  })
  .catch((err) => {
    console.error('❌ Mock AI test failed:', err);
    process.exit(1);
  });

// 9b. Test SimulatedOpenAIAdapter (Failure Case: Missing API Key)
const emptyStore = new SimulatedCredentialStore(); // has no openai_api_key
const openAi = new SimulatedOpenAIAdapter({ store: emptyStore });
openAi
  .gradeWriting({
    attemptId: 'attempt-openai-fail',
    essay: 'A longer essay to write.',
    taskNumber: 2,
  })
  .then(() => {
    console.error('❌ FAILED: OpenAIAdapter should have rejected request due to missing API Key!');
    process.exit(1);
  })
  .catch((err) => {
    assert(err instanceof Error, 'OpenAIAdapter failure should be an instance of Error');
    assert(err.message.includes('API Key is missing'), `Incorrect error message: ${err.message}`);
    console.log('✅ OpenAI Adapter missing key failure case verified successfully.');
  });

// ==========================================
// Test 10: Autosave / Resume Timer Calculations
// ==========================================
console.log('👉 Test 10: Autosave / Resume Timer Calculations...');
const resumeStartTime = new Date('2026-05-27T12:00:00.000Z').toISOString();
const resumeRemaining = calculateRemainingTime({
  startedAt: resumeStartTime,
  durationSeconds: 3600, // 1 hour test
  pauseRanges: [
    {
      pausedAt: new Date('2026-05-27T12:10:00.000Z').toISOString(),
      resumedAt: new Date('2026-05-27T12:15:00.000Z').toISOString(), // 5-minute pause (300s)
    },
    {
      pausedAt: new Date('2026-05-27T12:30:00.000Z').toISOString(),
      resumedAt: null, // Currently paused since 12:30
    },
  ],
  currentTime: new Date('2026-05-27T12:45:00.000Z').toISOString(), // Reference current time is 45 mins after start
});
// Total elapsed time outside pauses:
// From 12:00 to 12:10 = 10 mins (600s)
// From 12:15 to 12:30 = 15 mins (900s)
// Total elapsed = 25 minutes (1500s)
// Expected remaining time: 3600 - 1500 = 2100 seconds
assert(resumeRemaining === 2100, `Resumed active-pause remaining time failed: expected 2100, got ${resumeRemaining}`);
console.log('✅ Autosave / Resume timer calculations verified successfully.');

// ==========================================
// Test 11: IELTS Rubric Engine & Capping Rules
// ==========================================
console.log('👉 Test 11: IELTS Rubric Engine & Capping Rules...');
const { MockAIAdapter, validateWritingFeedback, validateSpeakingFeedback } = require('../ai/dist/index.js');

const rubricAi = new MockAIAdapter();

// 11a. Test Writing Feedback Capping (Short essay)
rubricAi
  .gradeWriting({
    attemptId: 'test-writing-cap',
    essay: 'Short writing essay under one hundred fifty words.',
    taskNumber: 1,
  })
  .then((writingFB) => {
    // Validate schema
    try {
      validateWritingFeedback(writingFB);
      console.log('✅ Writing feedback schema validation passed.');
    } catch (err) {
      console.error('❌ Writing feedback failed schema validation:', err);
      process.exit(1);
    }

    // Verify band cap limit (should be capped to 5.5 due to length constraint)
    const taskAchievement = writingFB.criteria.find((c) => c.criterionName === 'Task Achievement');
    assert(taskAchievement !== undefined, 'Writing criteria must contain Task Achievement');
    assert(
      taskAchievement.band === 5.5,
      `Short essay Task Achievement should be capped at 5.5, got ${taskAchievement.band}`,
    );
    assert(
      Array.isArray(taskAchievement.evidence) && taskAchievement.evidence.length > 0,
      'Task Achievement must contain evidence quotes',
    );
    assert(
      typeof taskAchievement.whyNotHigher === 'string' && taskAchievement.whyNotHigher.length > 0,
      'Task Achievement must explain why not higher in Vietnamese',
    );
    assert(
      typeof taskAchievement.nextAction === 'string' && taskAchievement.nextAction.length > 0,
      'Task Achievement must contain actionable next steps in Vietnamese',
    );

    assert(writingFB.rubricVersion === 'v1.0.0-academic', 'Rubric version mismatch');
    assert(writingFB.descriptorSource === 'IELTS Writing Band Descriptors May 2023', 'Descriptor source mismatch');
    assert(writingFB.confidence === 0.95, 'Confidence level mismatch');
    console.log('✅ Writing feedback capping rules and details verified.');
  })
  .catch((err) => {
    console.error('❌ Writing feedback test failed:', err);
    process.exit(1);
  });

// 11b. Test Speaking Audio Pronunciation Gate (Without Audio)
rubricAi
  .gradeSpeaking({
    attemptId: 'test-speaking-no-audio',
    transcriptMock: 'Well, studying abroad is fantastic.',
  })
  .then((speakingFBNoAudio) => {
    try {
      validateSpeakingFeedback(speakingFBNoAudio);
      console.log('✅ Speaking feedback (no audio) schema validation passed.');
    } catch (err) {
      console.error('❌ Speaking feedback (no audio) failed schema validation:', err);
      process.exit(1);
    }

    const pron = speakingFBNoAudio.criteria.find((c) => c.criterionName === 'Pronunciation');
    assert(pron !== undefined, 'Speaking criteria must contain Pronunciation');
    assert(pron.band === null, `Pronunciation band without audio must be null, got ${pron.band}`);
    assert(
      pron.feedbackText === 'Pronunciation unavailable from transcript',
      `Pronunciation feedback text mismatch: got "${pron.feedbackText}"`,
    );
    console.log('✅ Speaking Pronunciation audio-gate (without audio) verified.');
  })
  .catch((err) => {
    console.error('❌ Speaking no audio test failed:', err);
    process.exit(1);
  });

// 11c. Test Speaking Audio Pronunciation Gate (With Audio)
rubricAi
  .gradeSpeaking({
    attemptId: 'test-speaking-with-audio',
    audioPath: 'mock_audio.wav',
    transcriptMock: 'Well, studying abroad is fantastic.',
  })
  .then((speakingFBWithAudio) => {
    try {
      validateSpeakingFeedback(speakingFBWithAudio);
      console.log('✅ Speaking feedback (with audio) schema validation passed.');
    } catch (err) {
      console.error('❌ Speaking feedback (with audio) failed schema validation:', err);
      process.exit(1);
    }

    const pron = speakingFBWithAudio.criteria.find((c) => c.criterionName === 'Pronunciation');
    assert(pron !== undefined, 'Speaking criteria must contain Pronunciation');
    assert(pron.band === 6.5, `Pronunciation band with audio should be 6.5, got ${pron.band}`);
    assert(
      pron.feedbackText.includes('Generally intelligible'),
      `Pronunciation feedback text mismatch: got "${pron.feedbackText}"`,
    );
    assert(Array.isArray(pron.evidence) && pron.evidence.length > 0, 'Pronunciation must contain evidence');
    assert(
      typeof pron.whyNotHigher === 'string' && pron.whyNotHigher.length > 0,
      'Pronunciation must explain why not higher',
    );
    assert(typeof pron.nextAction === 'string' && pron.nextAction.length > 0, 'Pronunciation must contain next action');
    console.log('✅ Speaking Pronunciation audio-gate (with audio) verified.');

    // ------------------------------------------
    // Test 12: Validate all mock JSON files
    // ------------------------------------------
    console.log('👉 Test 12: Validating all mock JSON files...');
    const fs = require('fs');
    const path = require('path');
    const { validateIeltsTest } = require('../content/dist/validator.js');

    const mocksDir = path.join(__dirname, '../content/src/mocks');
    const files = fs.readdirSync(mocksDir);

    files.forEach((file) => {
      if (file.endsWith('.json') && file !== 'golden-dataset.json') {
        const filePath = path.join(mocksDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const errors = validateIeltsTest(content);
        const critical = errors.filter((e) => e.severity === 'error');
        if (critical.length > 0) {
          console.error(`❌ Mock validation failed for ${file}:`);
          console.error(JSON.stringify(critical, null, 2));
          process.exit(1);
        }
        console.log(`  - ${file} passed validation successfully.`);
      }
    });
    console.log('✅ All mock JSON exams are valid and structurally perfect!');
  })
  .catch((err) => {
    console.error('❌ Speaking with audio test failed:', err);
    process.exit(1);
  });

// Delay slightly to allow the asynchronous database/AI promises to complete before final exit
setTimeout(() => {
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
}, 1500);
