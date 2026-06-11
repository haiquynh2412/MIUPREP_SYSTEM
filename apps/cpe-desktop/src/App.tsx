/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, lazy, useState, useEffect } from 'react';
import { 
  isCorrectAnswer
} from '@miuprep/core';
import { 
  LocalStorageAdapter,
  IndexedDbAdapter,
  TauriSqliteAdapter 
} from '@miuprep/db';
import type {
  LearnerProfile,
  SpeakingFeedback,
  LocalUser
} from '@miuprep/db';
import { 
  getActiveCredentialStore
} from '@miuprep/ai';
import type { ValidationError, IeltsQuestion, QuestionGroup } from '@miuprep/content';


// Specialized Hook Imports
import { useLearnerProfile, useErrorNotebook, useAiEvaluation, useExam } from '@miuprep/exam-desktop';
import { TRACK_CONFIG } from './trackConfig';

// Modular Presentation Component Imports
import Onboarding from './components/Onboarding';

import { ModeSelectorModal, ImportErrorModal } from '@miuprep/exam-desktop';
import DashboardPanel from './components/modules/DashboardPanel';
import ExamRunner from './components/modules/ExamRunner';
import { loadCpeSeedTests, validateContentTest } from './lib/contentRuntime';

const ErrorNotebook = lazy(() => import('@miuprep/exam-desktop/src/components/ErrorNotebook'));
const SpeakingAiRoom = lazy(() => import('./components/SpeakingAiRoom'));
const AdaptivePracticeRoom = lazy(() => import('@miuprep/exam-desktop/src/components/AdaptivePracticeRoom'));
const WritingAiRoom = lazy(() => import('./components/WritingAiRoom'));

// User ID state is now fully abstracted into a reactive component state (currentUserId)

// Helper to generate unique local IDs without violating react-hooks/purity rule
function generateLocalId(prefix: string): string {
  return `${prefix}_${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2, 7)}`;
}

function LazyPanelFallback() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-sm font-semibold text-slate-400">
      Loading module...
    </div>
  );
}

function categorizeTest(test: any): 'diagnostic' | 'topic_bank' | 'practice_bank' | 'full_exam' {
  const id = (test.id || '').toLowerCase();
  const title = (test.title || '').toLowerCase();
  
  if (id.includes('entry') || id.includes('diagnostic') || title.includes('entry') || title.includes('chẩn đoán')) {
    return 'diagnostic';
  }
  if (id.includes('topic') || title.includes('topic') || title.includes('chuyên đề')) {
    return 'topic_bank';
  }
  if (id.includes('cpe2') || title.includes('cpe2') || (test.sections && test.sections.length === 6)) {
    return 'practice_bank';
  }
  
  return 'full_exam';
}

// Helper to highlight answer locations inside Reading passages during Review Mode
function getHighlightedPassageHtml(passage: string, questionGroups: QuestionGroup[], isReviewMode: boolean): string {
  if (!isReviewMode) return passage;
  let temp = passage;
  questionGroups.forEach(grp => {
    if (!grp.questions) return;
    grp.questions.forEach((q: IeltsQuestion) => {
      if (q.answerLocation && q.answerLocation.trim()) {
        const escaped = q.answerLocation.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        temp = temp.replace(
          regex, 
          `<mark class="bg-amber-100 border-b-2 border-amber-400 font-bold px-1 rounded text-slate-900 select-all cursor-help" title="Answer source for Q. ${q.id} (Correct Answer: ${q.correctAnswer})">$1</mark>`
        );
      }
    });
  });
  return temp;
}

function getSocraticHintForQuestion(q: IeltsQuestion): string {
  if (q.type === 'true_false_not_given') {
    return "💡 Gợi ý tư duy Socratic: Định vị từ khóa chính trong câu hỏi trên bài đọc. So sánh xem ý nghĩa của bài đọc có trùng khớp hoàn toàn (TRUE), phủ định/trái ngược hoàn toàn (FALSE), hay bài đọc hoàn toàn không đề cập đến khía cạnh này (NOT GIVEN). Hãy bám sát dữ kiện chữ viết, tránh suy diễn thêm!";
  }
  if (q.type === 'gap_fill') {
    return "💡 Gợi ý tư duy Socratic: Xác định từ loại cần điền vào ô trống (danh từ số ít/số nhiều, tính từ hay động từ). Hãy kiểm tra giới hạn từ cho phép (ví dụ: NO MORE THAN TWO WORDS) và phân tích các giới từ/tính từ kề cận để đoán nghĩa phù hợp.";
  }
  if (q.type === 'multiple_choice') {
    return "💡 Gợi ý tư duy Socratic: Đề phòng các phương án nhiễu sử dụng từ khóa giống hệt trong bài đọc nhưng sai lệch về nghĩa. Câu trả lời đúng thường được paraphrase bằng các cấu trúc đồng nghĩa khác.";
  }
  if (q.type === 'matching_headings') {
    return "💡 Gợi ý tư duy Socratic: Đọc lướt (skim) câu đầu và câu cuối của đoạn văn để tìm câu chủ đề (Topic Sentence). Tránh chọn các tiêu đề chỉ nói về một chi tiết nhỏ hỗ trợ trong đoạn.";
  }
  return "💡 Gợi ý tư duy Socratic: Tập trung nghe các từ khóa chuyển ý (But, However, On the other hand) vì đáp án thường xuất hiện ngay sau đó để sửa lại thông tin nói trước.";
}

// ==========================================
// Main Application Component
// ==========================================
export default function App() {
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  const [credentialStore] = useState(() => getActiveCredentialStore());
  const [db] = useState<LocalStorageAdapter | TauriSqliteAdapter>(() => {
    if (isTauri) return new TauriSqliteAdapter();
    // IndexedDB lifts the 5MB localStorage quota that seeded banks overflow
    return IndexedDbAdapter.isSupported() ? new IndexedDbAdapter() : new LocalStorageAdapter();
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exam' | 'writing_ai' | 'error_notebook' | 'speaking_ai' | 'adaptive_room'>('dashboard');
  const [currentUserId, setCurrentUserId] = useState<string>(() => localStorage.getItem('current_user_id') || '');
  const [localUsers, setLocalUsers] = useState<Omit<LocalUser, 'passwordHash'>[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dashboardCategory, setDashboardCategory] = useState<'all' | 'full_exam' | 'practice_bank' | 'topic_bank' | 'diagnostic'>('all');

  const refreshUsers = async () => {
    try {
      const users = await db.listLocalUsers();
      setLocalUsers(users);
      
      const stored = localStorage.getItem('current_user_id');
      if (stored && users.some(u => u.id === stored)) {
        setCurrentUserId(stored);
      } else {
        setCurrentUserId('');
        localStorage.removeItem('current_user_id');
      }
    } catch (e) {
      console.error('Failed to load local users:', e);
    }
  };

  // Input Package JSON Error States
  const [importErrors, setImportErrors] = useState<ValidationError[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Decoupled hooks managing isolated state and transactions
  const {
    attempts,
    availableTests,
    selectedTest,
    currentExamMode,
    remainingSeconds,
    userAnswers,
    isPaused,
    activeAttempt,
    reviewAttempt,
    isReviewMode,
    listeningReviewTab,
    showModeSelectorModal,
    selectedTestForMode,
    setSelectedTest,
    setListeningReviewTab,
    setShowModeSelectorModal,
    setSelectedTestForMode,
    loadHistory,
    startExam,
    resumeExam,
    togglePause,
    submitExam,
    handleAutoSubmit,
    handleReviewAttempt,
    setUserAnswers,
    setIsReviewMode,
    setReviewAttempt
  } = useExam({
    db,
    userId: currentUserId,
    isTauri,
    generateLocalId,
    track: TRACK_CONFIG,
    onUpdateWeaknesses: async () => {
      // Recalculate weak skills based on updated history
      try {
        const currentProfile = await db.getLearnerProfile(currentUserId);
        if (currentProfile) {
          const allAttempts = await db.listAttempts(currentUserId);
          const completed = allAttempts.filter(a => a.status === 'submitted');
          
          const dbTests = await db.listTests();
          const typeStats: Record<string, { correct: number; total: number }> = {};
          completed.forEach(att => {
            const test = dbTests.find(t => t.id === att.testId);
            if (!test) return;
            
            test.sections.forEach(sec => {
              sec.questionGroups.forEach(grp => {
                grp.questions.forEach(q => {
                  const val = att.answers[q.id]?.rawValue || '';
                  const correct = isCorrectAnswer(String(val), q.acceptedAnswers);
                  if (!typeStats[q.type]) {
                    typeStats[q.type] = { correct: 0, total: 0 };
                  }
                  typeStats[q.type].total++;
                  if (correct) typeStats[q.type].correct++;
                });
              });
            });
          });
          
          const weakSkills: string[] = [];
          Object.entries(typeStats).forEach(([qType, stats]) => {
            const acc = stats.correct / stats.total;
            if (acc < 0.6) {
              weakSkills.push(qType);
            }
          });
          
          const updatedProfile: LearnerProfile = {
            ...currentProfile,
            weakSkills,
            updatedAt: new Date().toISOString()
          };
          await db.saveLearnerProfile(updatedProfile);
          setLearnerProfile(updatedProfile);
        }
      } catch (err) {
        console.error('Failed to update learner profile weaknesses:', err);
      }
    }
  });

  const currentTab = selectedTest ? 'exam' : activeTab;

  const {
    learnerProfile,
    isEditingProfile,
    targetBandInput,
    examDateInput,
    setLearnerProfile,
    setIsEditingProfile,
    setTargetBandInput,
    setExamDateInput,
    saveLearnerProfile,
    getDaysRemaining,
    getGlobalWeaknessAnalysis,
    getMicroSkillsAnalysis
  } = useLearnerProfile({
    db,
    attempts,
    availableTests,
    userId: currentUserId
  });

  const {
    errorEntries,
    notebookSearch,
    reviewQueue,
    currentReviewIdx,
    reviewUserAnswer,
    reviewShowCorrect,
    notebookFilter,
    setNotebookSearch,
    setReviewQueue,
    setCurrentReviewIdx,
    setReviewUserAnswer,
    setReviewShowCorrect,
    setNotebookFilter,
    startNotebookReview,
    handleSrsGrade
  } = useErrorNotebook({
    db,
    userId: currentUserId,
    onRefreshHistory: loadHistory
  });

  const handleViewInExam = async (questionId: string, attemptId: string) => {
    const attempt = attempts.find(a => a.local_id === attemptId);
    let test = availableTests.find(t => t.id === (attempt ? attempt.testId : ''));
    if (!test) {
      test = availableTests.find(t => 
        t.sections.some(s => 
          s.questionGroups.some(g => 
            g.questions.some(q => q.id === questionId)
          )
        )
      );
    }

    if (test) {
      const targetAttempt = attempt || {
        local_id: attemptId || 'practice_review_fallback',
        testId: test.id,
        userId: currentUserId,
        status: 'submitted',
        answers: {},
        startedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        durationSeconds: 3600,
        remainingSeconds: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sync_status: 'synced',
        version: 1
      } as any;

      const restoredAnswers: Record<string, string> = {};
      if (attempt) {
        for (const [qId, state] of Object.entries(attempt.answers || {})) {
          restoredAnswers[qId] = String(state.rawValue || '');
        }
      }
      restoredAnswers[questionId] = restoredAnswers[questionId] || '';
      setUserAnswers(restoredAnswers);

      setSelectedTest(test);
      setReviewAttempt(targetAttempt);
      setIsReviewMode(true);
      setActiveTab('exam');

      // Scroll to the targeted question smoothly and flash a visual ring indicator
      setTimeout(() => {
        const el = document.getElementById('q_' + questionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-emerald-500', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-emerald-500', 'ring-offset-2');
          }, 3000);
        }
      }, 450);
    } else {
      alert("Không tìm thấy đề thi chứa câu hỏi này.");
    }
  };

  // Reload attempt history when active user profile changes
  useEffect(() => {
    if (db) {
      loadHistory();
    }
  }, [currentUserId, db, loadHistory]);

  // Automated tab transitions derived from selectedTest state natively, eliminating set-state-in-effect warning.

  const {
    aiConfig,
    openaiKeyInput,
    geminiKeyInput,
    hasOpenAiKey,
    hasGeminiKey,
    isAiLoading,
    writingFeedback,
    aiErrorMsg,
    isTestingConnection,
    testConnectionResult,
    setAiConfig,
    setOpenaiKeyInput,
    setGeminiKeyInput,
    setHasOpenAiKey,
    setHasGeminiKey,
    runWritingAiEvaluation,
    handleTestConnection
  } = useAiEvaluation({
    db,
    credentialStore,
    generateLocalId
  });

  const [speakingTopic, setSpeakingTopic] = useState('Describe a beautiful place you would like to visit in the future.');
  const [speakingFeedback, setSpeakingFeedback] = useState<SpeakingFeedback | null>(null);





  // Seeding tests on initialize
  useEffect(() => {
    const initDb = async () => {
      try {
        await db.initialize();
        
        const seedTests = await loadCpeSeedTests();


        const CURRENT_SEED_VERSION = '1.1.2';
        const lastSeedVersion = localStorage.getItem('ielts_db_seed_version');
        const forceReseed = lastSeedVersion !== CURRENT_SEED_VERSION;

        for (const test of seedTests) {
          try {
            // Performance optimization: skip querying DB if forceReseed is false and test exists
            if (!forceReseed) {
              const existing = await db.getTest(test.id);
              if (existing) continue;
            }

            // Run content validation before saving to log specific failures
            const validationErrors = await validateContentTest(test);
            const critical = validationErrors.filter(err => err.severity === 'error');
            if (critical.length > 0) {
              console.error(`[Seeding] Skipping invalid seed test "${test.title || test.id}":`, critical);
              continue;
            }
            await db.saveTest(test);
          } catch (testError) {
            console.error(`[Seeding] Failed to save seed test "${test?.title || test?.id}":`, testError);
          }
        }

        localStorage.setItem('ielts_db_seed_version', CURRENT_SEED_VERSION);

        // Account seeding removed: the first admin account is created through the
        // Onboarding first-run setup flow (no default credentials ship with the app).
      } catch (dbError) {
        console.error('[Initialization] Database initialization failed:', dbError);
      } finally {
        try {
          await refreshUsers();
          await loadHistory();
        } catch (postInitError) {
          console.error('[Initialization] Post-initialization queries failed:', postInitError);
        }
        setIsDbReady(true);
      }
    };

    initDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        const errors = await validateContentTest(parsed);
        const criticalErrors = errors.filter(err => err.severity === 'error');
        
        if (criticalErrors.length > 0) {
          setImportErrors(errors);
          setShowErrorModal(true);
          setImportSuccessMsg(null);
        } else {
          await db.saveTest(parsed);
          setImportSuccessMsg(`Successfully imported test: "${parsed.title}"!`);
          setImportErrors([]);
          setShowErrorModal(false);
          await loadHistory();
          
          setTimeout(() => {
            setImportSuccessMsg(null);
          }, 4000);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setImportErrors([{ path: 'JSON Syntax', message: errorMsg, severity: 'error' }]);
        setShowErrorModal(true);
        setImportSuccessMsg(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Đang khởi tạo cơ sở dữ liệu học tập cục bộ...</p>
      </div>
    );
  }

  const matchedUser = localUsers.find(u => u.id === currentUserId);
  const isDiagnosticDone = currentUserId 
    ? (localStorage.getItem('diagnostic_done_' + currentUserId) === 'true' || matchedUser?.role === 'admin') 
    : false;

  if (!currentUserId || !isDiagnosticDone) {
    return (
      <Onboarding
        db={db}
        onComplete={async (userId) => {
          localStorage.setItem('current_user_id', userId);
          setCurrentUserId(userId);
          await refreshUsers();
          await loadHistory();
        }}
      />
    );
  }

  const isAdmin = matchedUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-emerald-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div>
            <h1 className="text-lg font-bold tracking-tight m-0 text-white leading-none">CPE C2 Proficiency AI Prep Platform</h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Independent Prep Engine</span>
          </div>
        </div>

        {currentTab !== 'exam' && (
          <div className="flex items-center gap-4.5">
            {/* User Session profile switcher */}
            <div className="flex items-center gap-2 bg-slate-800/85 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-black flex items-center justify-center text-white font-mono uppercase">
                {currentUserId ? currentUserId.slice(-1) : '?'}
              </span>
              <select
                value={currentUserId}
                onChange={(e) => {
                  if (e.target.value === 'new_user') {
                    setCurrentUserId('');
                    localStorage.removeItem('current_user_id');
                  } else {
                    setReviewQueue([]);
                    setCurrentReviewIdx(-1);
                    setCurrentUserId(e.target.value);
                    localStorage.setItem('current_user_id', e.target.value);
                  }
                }}
                className="bg-transparent border-0 text-slate-200 text-xs font-bold focus:ring-0 focus:outline-none cursor-pointer pr-1"
              >
                {localUsers.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white font-semibold">
                    {u.username} (Band {u.targetBand})
                  </option>
                ))}
                <option value="new_user" className="bg-slate-900 text-emerald-400 font-bold">+ Tạo tài khoản mới</option>
              </select>
            </div>

            <button
              onClick={async () => {
                setCurrentUserId('');
                localStorage.removeItem('current_user_id');
                await refreshUsers();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs py-1.5 px-3.5 rounded-full border border-slate-700 shadow transition-all cursor-pointer outline-none flex items-center gap-1"
            >
              🚪 Đăng xuất
            </button>

            <div className="flex items-center gap-6">
              {/* Luồng 1: Mock Exams Flow */}
              <div className="flex flex-col gap-1 border-r border-slate-700 pr-5">
                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider text-left">🏆 Luồng Đề Thi Thử</span>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Đề Mock Test Full
                </button>
              </div>

              {/* Luồng 2: Adaptive Practice Flow */}
              <div className="flex flex-col gap-1 pl-1">
                <span className="text-[9px] text-teal-400 font-black uppercase tracking-wider text-left">📖 Luồng Ôn Tập Chuyên Đề & AI</span>
                <nav className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('adaptive_room')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                      activeTab === 'adaptive_room' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Luyện Chuyên Đề & Từ Vựng
                  </button>
                  <button
                    onClick={() => setActiveTab('speaking_ai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                      activeTab === 'speaking_ai' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Speaking AI Room
                  </button>
                  <button
                    onClick={() => setActiveTab('writing_ai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                      activeTab === 'writing_ai' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Writing AI Evaluator
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('error_notebook');
                      setReviewQueue([]);
                      setCurrentReviewIdx(-1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                      activeTab === 'error_notebook' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Sổ Lỗi Sai (SRS)
                    {errorEntries.length > 0 && (
                      <span className="ml-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {errorEntries.filter(e => new Date(e.nextReviewAt) <= new Date()).length}
                      </span>
                    )}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {currentTab === 'dashboard' && (
          <DashboardPanel
            availableTests={availableTests}
            dashboardCategory={dashboardCategory}
            setDashboardCategory={setDashboardCategory}
            categorizeTest={categorizeTest}
            setSelectedTestForMode={setSelectedTestForMode}
            setShowModeSelectorModal={setShowModeSelectorModal}
            attempts={attempts}
            handleReviewAttempt={handleReviewAttempt}
            isAdmin={isAdmin}
            aiConfig={aiConfig}
            setAiConfig={setAiConfig}
            hasOpenAiKey={hasOpenAiKey}
            hasGeminiKey={hasGeminiKey}
            openaiKeyInput={openaiKeyInput}
            geminiKeyInput={geminiKeyInput}
            setOpenaiKeyInput={setOpenaiKeyInput}
            setGeminiKeyInput={setGeminiKeyInput}
            setHasOpenAiKey={setHasOpenAiKey}
            setHasGeminiKey={setHasGeminiKey}
            credentialStore={credentialStore}
            handleTestConnection={handleTestConnection}
            isTestingConnection={isTestingConnection}
            testConnectionResult={testConnectionResult}
            handleImportJson={handleImportJson}
            importSuccessMsg={importSuccessMsg}
            activeAttempt={activeAttempt}
            resumeExam={resumeExam}
            learnerProfile={learnerProfile}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            targetBandInput={targetBandInput}
            setTargetBandInput={setTargetBandInput}
            examDateInput={examDateInput}
            setExamDateInput={setExamDateInput}
            saveLearnerProfile={saveLearnerProfile}
            getDaysRemaining={getDaysRemaining}
            getGlobalWeaknessAnalysis={getGlobalWeaknessAnalysis}
            getMicroSkillsAnalysis={getMicroSkillsAnalysis}
            setActiveTab={setActiveTab}
            setReviewQueue={setReviewQueue}
            setCurrentReviewIdx={setCurrentReviewIdx}
          />
        )}

        {currentTab === 'exam' && selectedTest && (
          <ExamRunner
            selectedTest={selectedTest}
            isReviewMode={isReviewMode}
            reviewAttempt={reviewAttempt}
            currentExamMode={currentExamMode}
            togglePause={togglePause}
            isPaused={isPaused}
            remainingSeconds={remainingSeconds}
            handleAutoSubmit={handleAutoSubmit}
            submitExam={submitExam}
            userAnswers={userAnswers}
            setUserAnswers={setUserAnswers}
            listeningReviewTab={listeningReviewTab}
            setListeningReviewTab={setListeningReviewTab}
            getHighlightedPassageHtml={getHighlightedPassageHtml}
            getSocraticHintForQuestion={getSocraticHintForQuestion}
            setSelectedTest={setSelectedTest}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 3: WRITING AI MODULE */}
        {currentTab === 'writing_ai' && (
          <Suspense fallback={<LazyPanelFallback />}>
            <WritingAiRoom
              writingFeedback={writingFeedback}
              isAiLoading={isAiLoading}
              aiErrorMsg={aiErrorMsg}
              runWritingAiEvaluation={runWritingAiEvaluation}
            />
          </Suspense>
        )}

        {/* TAB 4: ERROR NOTEBOOK SRS */}
        {currentTab === 'error_notebook' && (
          <Suspense fallback={<LazyPanelFallback />}>
            <ErrorNotebook
              errorEntries={errorEntries}
              notebookSearch={notebookSearch}
              setNotebookSearch={setNotebookSearch}
              reviewQueue={reviewQueue}
              setReviewQueue={setReviewQueue}
              currentReviewIdx={currentReviewIdx}
              setCurrentReviewIdx={setCurrentReviewIdx}
              reviewUserAnswer={reviewUserAnswer}
              setReviewUserAnswer={setReviewUserAnswer}
              reviewShowCorrect={reviewShowCorrect}
              setReviewShowCorrect={setReviewShowCorrect}
              notebookFilter={notebookFilter}
              setNotebookFilter={setNotebookFilter}
              startNotebookReview={startNotebookReview}
              handleSrsGrade={handleSrsGrade}
              onViewInExam={handleViewInExam}
            />
          </Suspense>
        )}

        {/* TAB 5: SPEAKING AI ROOM */}
        {currentTab === 'speaking_ai' && (
          <Suspense fallback={<LazyPanelFallback />}>
            <SpeakingAiRoom
              speakingTopic={speakingTopic}
              setSpeakingTopic={setSpeakingTopic}
              speakingFeedback={speakingFeedback}
              setSpeakingFeedback={setSpeakingFeedback}
              aiConfig={aiConfig}
              credentialStore={credentialStore}
              generateLocalId={generateLocalId}
              db={db}
              track="cpe"
            />
          </Suspense>
        )}

        {/* TAB 6: ADAPTIVE LEARNING PRACTICE ROOM */}
        {currentTab === 'adaptive_room' && (
          <Suspense fallback={<LazyPanelFallback />}>
            <AdaptivePracticeRoom
              availableTests={availableTests}
              db={db}
              userId={currentUserId}
              activeTrack="cpe"
              weaknesses={getGlobalWeaknessAnalysis()}
              onHistoryReload={loadHistory}
              onNavigateTab={(tab) => {
                setReviewQueue([]);
                setCurrentReviewIdx(-1);
                setActiveTab(tab);
              }}
            />
          </Suspense>
        )}
      </main>

      {/* Mode Selector Modal rendering */}
      {showModeSelectorModal && selectedTestForMode && (
        <ModeSelectorModal
          selectedTestForMode={selectedTestForMode}
          onClose={() => {
            setShowModeSelectorModal(false);
            setSelectedTestForMode(null);
          }}
          onSelectMode={(test, mode) => {
            startExam(test, mode);
            setShowModeSelectorModal(false);
            setSelectedTestForMode(null);
          }}
        />
      )}

      {/* ImportErrorModal rendering */}
      {showErrorModal && (
        <ImportErrorModal
          importErrors={importErrors}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}
