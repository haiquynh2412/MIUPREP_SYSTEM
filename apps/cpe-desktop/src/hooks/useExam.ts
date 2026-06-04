import { useState, useEffect, useRef, useCallback } from 'react';
import type { ExamAttempt, StorageAdapter, ErrorNotebookEntry, AnswerState } from '@miuprep/db';
import type { IeltsTest } from '@miuprep/content';
import { buildLearningEvent } from '@miuprep/learning';
import { 
  calculateRemainingTime, 
  normalizeAnswer, 
  isCorrectAnswer, 
  getEstimatedBandInfo,
  convertRawToCambridgeScale,
  calculateCpeWeightedScore
} from '@miuprep/core';

const LEARNING_EVENT_SOURCE = 'miuprep_cpe_desktop';

function inferProgramId(test: IeltsTest): string {
  if (test.exam) return test.exam;
  const text = `${test.id} ${test.title} ${test.type}`.toLowerCase();
  if (text.includes('cpe')) return 'cpe';
  if (text.includes('cae')) return 'cae';
  if (text.includes('sat')) return 'sat';
  return 'ielts';
}

function inferLearningEventType(test: IeltsTest): 'diagnostic_attempt' | 'practice_attempt' {
  const text = `${test.id} ${test.title}`.toLowerCase();
  if (text.includes('diagnostic') || text.includes('entry')) return 'diagnostic_attempt';
  return 'practice_attempt';
}

interface UseExamProps {
  db: StorageAdapter;
  userId: string;
  isTauri: boolean;
  generateLocalId: (prefix: string) => string;
  onUpdateWeaknesses: () => Promise<void>;
}

export default function useExam({ db, userId, isTauri, generateLocalId, onUpdateWeaknesses }: UseExamProps) {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [availableTests, setAvailableTests] = useState<IeltsTest[]>([]);
  
  const [selectedTest, setSelectedTest] = useState<IeltsTest | null>(null);
  const [currentExamMode, setCurrentExamMode] = useState<'practice' | 'exam'>('exam');
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [durationSeconds, setDurationSeconds] = useState(3600);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [pauseRanges, setPauseRanges] = useState<{ pausedAt: string; resumedAt: string | null }[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<ExamAttempt | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [listeningReviewTab, setListeningReviewTab] = useState<'questions' | 'transcript'>('questions');

  const [showModeSelectorModal, setShowModeSelectorModal] = useState(false);
  const [selectedTestForMode, setSelectedTestForMode] = useState<IeltsTest | null>(null);

  // Drift-proof refs to avoid stale closures in intervals/listeners
  const userAnswersRef = useRef(userAnswers);
  const remainingSecondsRef = useRef(remainingSeconds);
  const isSubmittingRef = useRef(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  // Load attempt history and seed default tests
  const loadHistory = useCallback(async () => {
    if (!db) return;
    try {
      let list = await db.listAttempts(userId);

      // Emergency LocalStorage Checkpoint Recovery
      let requiresReload = false;
      if (isTauri) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cpe_tauri_emergency_')) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const localAttempt = JSON.parse(raw);
                if (localAttempt && localAttempt.userId === userId) {
                  const sqliteAttempt = list.find(a => a.local_id === localAttempt.local_id);
                  if (!sqliteAttempt || new Date(localAttempt.updatedAt) > new Date(sqliteAttempt.updatedAt)) {
                    await db.saveAttempt(localAttempt);
                    requiresReload = true;
                  }
                  localStorage.removeItem(key);
                  i--;
                }
              }
            } catch (e) {
              console.error('Failed to sync emergency local checkpoint:', e);
            }
          }
        }
      }

      if (requiresReload) {
        list = await db.listAttempts(userId);
      }

      setAttempts(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      
      const active = list.find(att => att.status === 'in_progress');
      setActiveAttempt(active || null);

      const testsList = await db.listTests();
      setAvailableTests(testsList);
    } catch (e) {
      console.error('Failed to load history in hook:', e);
    }
  }, [db, userId, isTauri]);

  const autosaveAttempt = async () => {
    if (!currentAttemptId || !selectedTest || !db) return;
    try {
      const attempt = await db.getAttempt(currentAttemptId);
      if (!attempt || attempt.status === 'submitted') return;

      const answersState: Record<string, AnswerState> = {};
      for (const [qId, val] of Object.entries(userAnswersRef.current)) {
        answersState[qId] = {
          rawValue: val,
          normalizedValue: normalizeAnswer(val),
          updatedAt: new Date().toISOString()
        };
      }

      const updatedAttempt: ExamAttempt = {
        ...attempt,
        lastSavedAt: new Date().toISOString(),
        remainingSeconds: remainingSecondsRef.current,
        answers: answersState,
        updatedAt: new Date().toISOString()
      };
      await db.saveAttempt(updatedAttempt);
    } catch (e) {
      console.error('Failed to autosave attempt:', e);
    }
  };

  const startExam = async (test: IeltsTest, mode: 'practice' | 'exam' = 'exam') => {
    setSelectedTest(test);
    setCurrentExamMode(mode);
    const duration = test.skill === 'listening' ? 1800 : 3600;
    setRemainingSeconds(duration);
    setDurationSeconds(duration);
    
    const localId = generateLocalId('attempt');
    setCurrentAttemptId(localId);
    setUserAnswers({});
    setPauseRanges([]);
    setIsPaused(false);
    
    const isoNow = new Date().toISOString();
    setStartedAt(isoNow);

    const initialAttempt: ExamAttempt = {
      local_id: localId,
      testId: test.id,
      userId,
      status: 'in_progress',
      examMode: mode,
      startedAt: isoNow,
      lastSavedAt: isoNow,
      durationSeconds: duration,
      remainingSeconds: duration,
      answers: {},
      createdAt: isoNow,
      updatedAt: isoNow,
      sync_status: 'pending',
      version: 1
    };

    if (db) {
      await db.saveAttempt(initialAttempt);
    }
    await loadHistory();
  };

  const resumeExam = async (attempt: ExamAttempt) => {
    const test = availableTests.find(t => t.id === attempt.testId);
    if (!test) return;
    setSelectedTest(test);
    setCurrentExamMode(attempt.examMode || 'exam');
    
    const isoNow = new Date().toISOString();
    
    setStartedAt(attempt.startedAt);
    setDurationSeconds(attempt.durationSeconds);
    setCurrentAttemptId(attempt.local_id);
    
    const updatedRanges = attempt.pauseRanges ? [...attempt.pauseRanges] : [];
    if (updatedRanges.length > 0 && updatedRanges[updatedRanges.length - 1].resumedAt === null) {
      updatedRanges[updatedRanges.length - 1].resumedAt = isoNow;
    } else {
      const pausedStart = attempt.lastSavedAt || attempt.updatedAt || attempt.createdAt || attempt.startedAt;
      updatedRanges.push({ pausedAt: pausedStart, resumedAt: isoNow });
    }
    setPauseRanges(updatedRanges);
    
    const restoredAnswers: Record<string, string> = {};
    for (const [qId, state] of Object.entries(attempt.answers)) {
      restoredAnswers[qId] = String(state.rawValue || '');
    }
    setUserAnswers(restoredAnswers);
    setIsPaused(false);

    const initialRem = calculateRemainingTime({
      startedAt: attempt.startedAt,
      durationSeconds: attempt.durationSeconds,
      pauseRanges: updatedRanges,
      currentTime: isoNow
    });
    setRemainingSeconds(initialRem > 0 ? initialRem : 0);

    const updatedAttempt: ExamAttempt = {
      ...attempt,
      pauseRanges: updatedRanges,
      remainingSeconds: initialRem > 0 ? initialRem : 0,
      lastSavedAt: isoNow,
      updatedAt: isoNow,
      version: attempt.version + 1
    };
    if (db) {
      await db.saveAttempt(updatedAttempt);
    }
    await loadHistory();
  };

  const togglePause = () => {
    const isoNow = new Date().toISOString();
    if (isPaused) {
      const updatedRanges = [...pauseRanges];
      if (updatedRanges.length > 0) {
        updatedRanges[updatedRanges.length - 1].resumedAt = isoNow;
      }
      setPauseRanges(updatedRanges);
      setIsPaused(false);
    } else {
      setPauseRanges([...pauseRanges, { pausedAt: isoNow, resumedAt: null }]);
      setIsPaused(true);
    }
  };

  const handleAutoSubmit = () => {
    submitExam();
  };

  const submitExam = async () => {
    if (!currentAttemptId || !selectedTest || !db) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      const answersState: Record<string, AnswerState> = {};
      let correctCount = 0;
      let totalQuestions = 0;

      for (const sec of selectedTest.sections) {
        for (const grp of sec.questionGroups) {
          for (const q of grp.questions) {
            totalQuestions++;
            const userVal = userAnswers[q.id] || '';
            answersState[q.id] = {
              rawValue: userVal,
              normalizedValue: normalizeAnswer(userVal),
              updatedAt: new Date().toISOString()
            };

            const isCorrect = isCorrectAnswer(userVal, q.acceptedAnswers);
            if (isCorrect) {
              correctCount++;
            } else {
              try {
                const errorEntry: ErrorNotebookEntry = {
                  id: generateLocalId('err_entry'),
                  userId,
                  attemptId: currentAttemptId,
                  questionId: q.id,
                  questionType: q.type,
                  userAnswer: userVal,
                  correctAnswer: q.acceptedAnswers[0]?.[0] || '',
                  explanation: q.explanation || `Dạng câu hỏi: ${q.type}`,
                  intervalDays: 1,
                  easeFactor: 2.5,
                  repetitions: 0,
                  nextReviewAt: new Date().toISOString(),
                  createdAt: new Date().toISOString()
                };
                await db.addErrorEntry(errorEntry);
              } catch (err) {
                console.error('Failed to capture incorrect answer in Notebook:', err);
              }
            }
          }
        }
      }

      let bandScore = 0;
      let isEstimate = false;
      let finalRaw = correctCount;
      let finalTotal = totalQuestions;

      if (selectedTest.id.startsWith('cpe')) {
        const weighted = calculateCpeWeightedScore(userAnswers, selectedTest);
        finalRaw = weighted.rawScore;
        finalTotal = weighted.maxScore;
        bandScore = convertRawToCambridgeScale(finalRaw, finalTotal, 'CPE');
        isEstimate = false;
      } else {
        const bandInfo = getEstimatedBandInfo(
          correctCount,
          totalQuestions,
          selectedTest.skill as 'listening' | 'reading',
          selectedTest.type
        );
        bandScore = bandInfo.band;
        isEstimate = bandInfo.isEstimate;
      }

      const attempt = await db.getAttempt(currentAttemptId);
      if (!attempt) return;

      const submittedAt = new Date().toISOString();
      const finishedAttempt: ExamAttempt = {
        ...attempt,
        status: 'submitted',
        submittedAt,
        lastSavedAt: submittedAt,
        remainingSeconds: 0,
        answers: answersState,
        scores: {
          rawScore: finalRaw,
          bandScore: bandScore,
          totalQuestions: finalTotal,
          isMockScoring: isEstimate
        },
        updatedAt: submittedAt,
        version: attempt.version + 1
      };

      await db.saveAttempt(finishedAttempt);
      await db.saveLearningEvent(buildLearningEvent(inferLearningEventType(selectedTest), {
        attemptId: finishedAttempt.local_id,
        testId: selectedTest.id,
        testTitle: selectedTest.title,
        programId: inferProgramId(selectedTest),
        skill: selectedTest.skill,
        exam: selectedTest.exam || inferProgramId(selectedTest),
        testType: selectedTest.type,
        examMode: finishedAttempt.examMode || currentExamMode,
        rawScore: finalRaw,
        correctCount,
        totalQuestions: finalTotal,
        bandScore,
        isMockScoring: isEstimate,
        accuracyPercent: finalTotal ? Math.round((finalRaw / finalTotal) * 100) : 0,
        durationSeconds: finishedAttempt.durationSeconds,
        remainingSeconds: remainingSecondsRef.current,
        timeSpentSeconds: Math.max(0, finishedAttempt.durationSeconds - remainingSecondsRef.current),
      }, {
        id: `le-${finishedAttempt.local_id}`,
        learnerId: userId,
        entityType: 'exam_attempt',
        entityId: finishedAttempt.local_id,
        occurredAt: submittedAt,
        source: LEARNING_EVENT_SOURCE,
      }));
      await onUpdateWeaknesses();
      
      setStartedAt(null);
      setCurrentAttemptId(null);
      setSelectedTest(null);
      
      await loadHistory();
    } catch (e) {
      console.error('[Submit Exam] Error during submission:', e);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleReviewAttempt = (attempt: ExamAttempt) => {
    const test = availableTests.find(t => t.id === attempt.testId);
    if (!test) return;
    setSelectedTest(test);
    setReviewAttempt(attempt);
    setIsReviewMode(true);
    
    const restoredAnswers: Record<string, string> = {};
    for (const [qId, state] of Object.entries(attempt.answers || {})) {
      restoredAnswers[qId] = String(state.rawValue || '');
    }
    setUserAnswers(restoredAnswers);
    setListeningReviewTab('questions');
  };

  // Timer drift execution logic
  useEffect(() => {
    if (startedAt && !isPaused && remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        const timeNow = new Date().toISOString();
        const rem = calculateRemainingTime({
          startedAt,
          durationSeconds,
          pauseRanges,
          currentTime: timeNow
        });
        setRemainingSeconds(rem);

        if (rem <= 0) {
          clearInterval(timerIntervalRef.current!);
          handleAutoSubmit();
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, isPaused, pauseRanges, durationSeconds]);

  // Synchronous autosave on window beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTauri && startedAt && currentAttemptId && selectedTest) {
        const answersState: Record<string, AnswerState> = {};
        for (const [qId, val] of Object.entries(userAnswersRef.current)) {
          answersState[qId] = {
            rawValue: val,
            normalizedValue: normalizeAnswer(val),
            updatedAt: new Date().toISOString()
          };
        }
        
        const updatedAttempt = {
          local_id: currentAttemptId,
          testId: selectedTest.id,
          userId,
          status: 'in_progress',
          startedAt: startedAt,
          lastSavedAt: new Date().toISOString(),
          durationSeconds: durationSeconds,
          remainingSeconds: remainingSecondsRef.current,
          answers: answersState,
          pauseRanges: pauseRanges,
          createdAt: startedAt,
          updatedAt: new Date().toISOString(),
          sync_status: 'pending',
          version: 999999
        };
        const itemKey = `cpe_tauri_emergency_${currentAttemptId}`;
        localStorage.setItem(itemKey, JSON.stringify(updatedAttempt));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [startedAt, currentAttemptId, selectedTest, durationSeconds, pauseRanges, isTauri, userId]);

  // Autosave interval while active
  useEffect(() => {
    if (startedAt && currentAttemptId) {
      const timer = setTimeout(() => {
        autosaveAttempt();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswers, startedAt, currentAttemptId]);

  return {
    attempts,
    availableTests,
    selectedTest,
    currentExamMode,
    remainingSeconds,
    durationSeconds,
    currentAttemptId,
    userAnswers,
    pauseRanges,
    isPaused,
    startedAt,
    activeAttempt,
    reviewAttempt,
    isReviewMode,
    listeningReviewTab,
    showModeSelectorModal,
    selectedTestForMode,
    setSelectedTest,
    setCurrentExamMode,
    setRemainingSeconds,
    setDurationSeconds,
    setCurrentAttemptId,
    setUserAnswers,
    setPauseRanges,
    setIsPaused,
    setStartedAt,
    setActiveAttempt,
    setReviewAttempt,
    setIsReviewMode,
    setListeningReviewTab,
    setShowModeSelectorModal,
    setSelectedTestForMode,
    loadHistory,
    startExam,
    resumeExam,
    togglePause,
    submitExam,
    handleAutoSubmit,
    handleReviewAttempt
  };
}
