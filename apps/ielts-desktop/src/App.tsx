/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, lazy, useState, useEffect } from 'react';
import { 
  isCorrectAnswer, 
  analyzeWeaknesses
} from '@miuprep/core';
import { 
  ExamTimer
} from '@miuprep/ui';
import { 
  LocalStorageAdapter,
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
import { IELTS_WRITING_SAMPLES } from '@miuprep/content/src/mocks/ielts-writing-speaking-samples';
import { CPE_WRITING_SAMPLES } from '@miuprep/content/src/mocks/cpe-writing-speaking-samples';

// Specialized Hook Imports
import useLearnerProfile from './hooks/useLearnerProfile';
import useErrorNotebook from './hooks/useErrorNotebook';
import useAiEvaluation from './hooks/useAiEvaluation';
import useExam from './hooks/useExam';

// Modular Presentation Component Imports
import LearnerProfileCard from './components/LearnerProfileCard';
import Onboarding from './components/Onboarding';

import ModeSelectorModal from './components/modules/ModeSelectorModal';
import ImportErrorModal from './components/modules/ImportErrorModal';
import ExamSectionSheet from './components/modules/ExamSectionSheet';
import { loadEnglishSeedTests, validateContentTest } from './lib/contentRuntime';

const AdminPanel = lazy(() => import('./components/AdminPanel'));
const ErrorNotebook = lazy(() => import('./components/ErrorNotebook'));
const SpeakingAiRoom = lazy(() => import('./components/SpeakingAiRoom'));
const AdaptivePracticeRoom = lazy(() => import('./components/AdaptivePracticeRoom'));
const WritingAiRoom = lazy(() => import('./components/WritingAiRoom'));
const IeltsLearnerDashboard = lazy(() => import('./components/IeltsLearnerDashboard'));
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
  const [db] = useState<LocalStorageAdapter | TauriSqliteAdapter>(() => 
    isTauri ? new TauriSqliteAdapter() : new LocalStorageAdapter()
  );
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exam' | 'writing_ai' | 'error_notebook' | 'speaking_ai' | 'adaptive_room'>('dashboard');
  const [activeTrack, setActiveTrack] = useState<'ielts' | 'cpe' | 'cae' | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [dashboardCategory, setDashboardCategory] = useState<'all' | 'full_exam' | 'practice_bank' | 'topic_bank' | 'diagnostic'>('all');
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if ('__TAURI__' in window) {
        localStorage.setItem('current_user_id', 'user_student');
        localStorage.setItem('diagnostic_done_user_student', 'true');
        return 'user_student';
      }
      const stored = localStorage.getItem('current_user_id');
      if (stored) return stored;
    }
    return '';
  });

  // Persistent track loading effect per user assigned by Admin (declared below localUsers for block-scope safety)

  const trackTheme = {
    ielts: {
      name: 'IELTS Academic & General',
      primaryColor: 'blue',
      bgHeader: 'bg-slate-900',
      bgPrimary: 'bg-blue-600 hover:bg-blue-700',
      textPrimary: 'text-blue-600',
      borderPrimary: 'border-blue-500',
      accentText: 'text-blue-400',
      badge: 'bg-blue-100 text-blue-800',
      gradient: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
      accentPing: 'bg-blue-500',
      glow: 'shadow-blue-500/20'
    },
    cpe: {
      name: 'CPE C2 Proficiency',
      primaryColor: 'emerald',
      bgHeader: 'bg-emerald-950',
      bgPrimary: 'bg-emerald-600 hover:bg-emerald-700',
      textPrimary: 'text-emerald-600',
      borderPrimary: 'border-emerald-500',
      accentText: 'text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-800',
      gradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
      accentPing: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20'
    },
    cae: {
      name: 'CAE C1 Advanced',
      primaryColor: 'violet',
      bgHeader: 'bg-indigo-955',
      bgPrimary: 'bg-violet-600 hover:bg-violet-700',
      textPrimary: 'text-violet-600',
      borderPrimary: 'border-violet-500',
      accentText: 'text-violet-400',
      badge: 'bg-violet-100 text-violet-800',
      gradient: 'from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500',
      accentPing: 'bg-violet-500',
      glow: 'shadow-violet-500/20'
    }
  }[activeTrack || 'ielts'];

  const getExamTrackOfTest = (test: any): 'ielts' | 'cpe' | 'cae' => {
    if (test.exam === 'ielts' || test.exam === 'cpe' || test.exam === 'cae') {
      return test.exam;
    }
    const id = String(test.id || '').toLowerCase();
    if (id.includes('cpe')) return 'cpe';
    if (id.includes('cae')) return 'cae';
    return 'ielts';
  };

  const getExamTrackOfErrorEntry = (entry: any): 'ielts' | 'cpe' | 'cae' => {
    const attempt = attempts.find(a => a.local_id === entry.attemptId);
    if (attempt) {
      const test = availableTests.find(t => t.id === attempt.testId);
      if (test) return getExamTrackOfTest(test);
    }
    for (const test of availableTests) {
      for (const sec of test.sections) {
        for (const grp of sec.questionGroups) {
          if (grp.questions.some(q => q.id === entry.questionId)) {
            return getExamTrackOfTest(test);
          }
        }
      }
    }
    return 'ielts';
  };
  const [localUsers, setLocalUsers] = useState<Omit<LocalUser, 'passwordHash'>[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);

  // Persistent track loading effect per user assigned by Admin
  useEffect(() => {
    setTimeout(() => {
      if (currentUserId) {
        const user = localUsers.find(u => u.id === currentUserId);
        if (user) {
          if (user.role === 'admin') {
            // Admin can choose track freely, load from localStorage if present
            const stored = localStorage.getItem(`active_track_${currentUserId}`);
            if (stored === 'ielts' || stored === 'cpe' || stored === 'cae') {
              setActiveTrack(stored);
            } else {
              setActiveTrack(null);
            }
          } else {
            // Student: can choose from their assigned tracks
            const allowedTracks = (isTauri ? ['ielts', 'cpe', 'cae'] : (user.assignedTracks || [user.assignedTrack || 'ielts'])) as ('ielts' | 'cpe' | 'cae')[];
            const stored = localStorage.getItem(`active_track_${currentUserId}`);
            
            if (stored && allowedTracks.includes(stored as any)) {
              setActiveTrack(stored as any);
            } else if (allowedTracks.length === 1) {
              // Only one track allowed, force it
              setActiveTrack(allowedTracks[0]);
              localStorage.setItem(`active_track_${currentUserId}`, allowedTracks[0]);
            } else {
              // Multiple tracks allowed but none selected yet, show selector
              setActiveTrack(null);
            }
          }
        } else {
          // Fallback before localUsers load completed
          const stored = localStorage.getItem(`active_track_${currentUserId}`);
          if (stored === 'ielts' || stored === 'cpe' || stored === 'cae') {
            setActiveTrack(stored);
          } else {
            setActiveTrack(null);
          }
        }
      } else {
        setActiveTrack(null);
      }
    }, 0);
  }, [currentUserId, isTauri, localUsers]);

  const refreshUsers = async () => {
    try {
      const users = await db.listLocalUsers();
      setLocalUsers(users);
      
      if (isTauri) {
        setCurrentUserId('user_student');
        localStorage.setItem('current_user_id', 'user_student');
        return;
      }
      
      const stored = localStorage.getItem('current_user_id');
      if (stored && users.some(u => u.id === stored)) {
        setCurrentUserId(stored);
      } else {
        setCurrentUserId('');
        localStorage.removeItem('current_user_id');
      }
    } catch (e) {
      console.error('Failed to load local users:', e);
      if (isTauri) {
        setCurrentUserId('user_student');
        localStorage.setItem('current_user_id', 'user_student');
      }
    }
  };

  // Input Package JSON Error States
  const [importErrors, setImportErrors] = useState<ValidationError[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [autoLaunchPracticeType, setAutoLaunchPracticeType] = useState<string | null>(null);

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

  const filteredErrorEntries = errorEntries.filter((e: any) => getExamTrackOfErrorEntry(e) === activeTrack);

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
          el.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-2');
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

  const availableWritingSamples = (activeTrack === 'cpe' || activeTrack === 'cae')
    ? CPE_WRITING_SAMPLES 
    : IELTS_WRITING_SAMPLES;

  const activeTheme = activeTrack === 'cpe' 
    ? {
        primary: 'emerald-600',
        hover: 'emerald-700',
        bgLight: 'bg-emerald-50/20',
        borderLight: 'border-emerald-100',
        textDark: 'text-emerald-800',
        gradientFrom: 'from-emerald-700',
        gradientTo: 'to-emerald-800',
        modalBorder: 'border-emerald-600',
        modalText: 'text-emerald-700',
        badgeBg: 'bg-emerald-600',
        name: 'C2 Proficiency / CPE'
      }
    : activeTrack === 'cae'
    ? {
        primary: 'violet-600',
        hover: 'violet-700',
        bgLight: 'bg-violet-50/20',
        borderLight: 'border-violet-100',
        textDark: 'text-violet-800',
        gradientFrom: 'from-violet-700',
        gradientTo: 'to-violet-800',
        modalBorder: 'border-violet-600',
        modalText: 'text-violet-700',
        badgeBg: 'bg-violet-600',
        name: 'C1 Advanced / CAE'
      }
    : {
        primary: 'blue-600',
        hover: 'blue-700',
        bgLight: 'bg-blue-50/20',
        borderLight: 'border-blue-100',
        textDark: 'text-blue-800',
        gradientFrom: 'from-blue-700',
        gradientTo: 'to-blue-800',
        modalBorder: 'border-blue-600',
        modalText: 'text-blue-700',
        badgeBg: 'bg-blue-650',
        name: 'IELTS Academic'
      };

  // Seeding tests on initialize
  useEffect(() => {
    const initDb = async () => {
      try {
        await db.initialize();
        
        const seedTests = await loadEnglishSeedTests();

        const CURRENT_SEED_VERSION = '1.1.3';
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
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Đang khởi tạo cơ sở dữ liệu học tập cục bộ...</p>
      </div>
    );
  }

  const matchedUser = localUsers.find(u => u.id === currentUserId);
  const isDiagnosticDone = currentUserId 
    ? (localStorage.getItem('diagnostic_done_' + currentUserId) === 'true' || matchedUser?.role === 'admin') 
    : false;

  if (showAdminPanel) {
    return (
      <Suspense fallback={<LazyPanelFallback />}>
        <AdminPanel
          db={db}
          currentUserId="user_admin"
          onLogout={async () => {
            setShowAdminPanel(false);
          }}
        />
      </Suspense>
    );
  }

  if (!isTauri && (!currentUserId || !isDiagnosticDone)) {
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

  if (isAdmin) {
    return (
      <Suspense fallback={<LazyPanelFallback />}>
        <AdminPanel
          db={db}
          currentUserId={currentUserId}
          onLogout={async () => {
            if (isTauri) {
              localStorage.setItem('current_user_id', 'user_student');
              setCurrentUserId('user_student');
              await refreshUsers();
              await loadHistory();
            } else {
              setCurrentUserId('');
              localStorage.removeItem('current_user_id');
              await refreshUsers();
            }
          }}
        />
      </Suspense>
    );
  }

  if (!activeTrack) {
    const allowedTracks = (() => {
      if (isTauri) return ['ielts', 'cpe', 'cae'];
      const user = localUsers.find(u => u.id === currentUserId);
      if (!user) return ['ielts', 'cpe', 'cae'];
      if (user.role === 'admin') return ['ielts', 'cpe', 'cae'];
      return user.assignedTracks || [user.assignedTrack || 'ielts'];
    })();

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
        {/* Dynamic colorful blur backing spots */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl animate-pulse" />

        <div className="w-full max-w-4xl flex flex-col gap-8 relative z-10 text-center">
          {!isTauri && (
            <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
              <span className="text-xs text-slate-400 font-bold ml-2">Đăng nhập với tư cách: <strong className="text-slate-200">{localUsers.find(u => u.id === currentUserId)?.username || 'Học viên'}</strong></span>
              <button
                onClick={async () => {
                  setCurrentUserId('');
                  localStorage.removeItem('current_user_id');
                  await refreshUsers();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs py-1.5 px-3.5 rounded-full border border-slate-700 shadow transition-all cursor-pointer outline-none flex items-center gap-1"
              >
                🚪 Đăng xuất tài khoản
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 items-center">
            <div className="px-4 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Lựa Chọn Đường Đua Của Bạn
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2 mb-0">
              Chọn Lộ Trình Học Tập & Chuyên Đề
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mt-1 font-medium leading-relaxed">
              Hệ thống AI sẽ tự động tối ưu hóa giao diện, các chuyên đề ôn tập, sổ tay lỗi sai và thang chấm điểm phù hợp nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 justify-center">
            {/* IELTS CARD */}
            {allowedTracks.includes('ielts') && (
              <div 
                onClick={async () => {
                  setActiveTrack('ielts');
                  localStorage.setItem(`active_track_${currentUserId}`, 'ielts');
                  try {
                    const profile = await db.getLearnerProfile(currentUserId);
                    if (profile && profile.targetBand >= 10) {
                      const newProfile = {
                        ...profile,
                        targetBand: 7.0,
                        updatedAt: new Date().toISOString()
                      };
                      await db.saveLearnerProfile(newProfile);
                      setLearnerProfile(newProfile);
                      setTargetBandInput(7.0);
                    }
                  } catch (e) {
                    console.error('Failed to update learner profile for IELTS:', e);
                  }
                }}
                className="group border border-slate-850 hover:border-blue-500 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between text-left cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/25 mb-4 group-hover:scale-105 transition-transform">
                    IE
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">IELTS Prep Track</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Lộ trình ôn luyện IELTS chuẩn quốc tế, kiểm tra kỹ năng Reading & Listening chi tiết, chấm điểm Writing/Speaking bằng AI theo thang chuẩn 9.0.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-950/50 border border-blue-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Level B1 - C2
                  </span>
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Vào học →
                  </span>
                </div>
              </div>
            )}

            {/* CPE CARD */}
            {allowedTracks.includes('cpe') && (
              <div 
                onClick={async () => {
                  setActiveTrack('cpe');
                  localStorage.setItem(`active_track_${currentUserId}`, 'cpe');
                  try {
                    const profile = await db.getLearnerProfile(currentUserId);
                    if (profile && profile.targetBand < 10) {
                      const newProfile = {
                        ...profile,
                        targetBand: 200,
                        updatedAt: new Date().toISOString()
                      };
                      await db.saveLearnerProfile(newProfile);
                      setLearnerProfile(newProfile);
                      setTargetBandInput(200);
                    }
                  } catch (e) {
                    console.error('Failed to update learner profile for CPE:', e);
                  }
                }}
                className="group border border-slate-850 hover:border-emerald-500 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between text-left cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/25 mb-4 group-hover:scale-105 transition-transform">
                    C2
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">CPE C2 Proficiency</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Chinh phục đỉnh cao Cambridge C2 Proficiency. Đầy đủ các phần Use of English cực khó, chấm điểm theo thang Cambridge English Scale 160-230.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Level C2 Max
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Vào học →
                  </span>
                </div>
              </div>
            )}

            {/* CARD CAE */}
            {allowedTracks.includes('cae') && (
              <div 
                onClick={async () => {
                  setActiveTrack('cae');
                  localStorage.setItem(`active_track_${currentUserId}`, 'cae');
                  try {
                    const profile = await db.getLearnerProfile(currentUserId);
                    if (profile && profile.targetBand < 10) {
                      const newProfile = {
                        ...profile,
                        targetBand: 180,
                        updatedAt: new Date().toISOString()
                      };
                      await db.saveLearnerProfile(newProfile);
                      setLearnerProfile(newProfile);
                      setTargetBandInput(180);
                    }
                  } catch (e) {
                    console.error('Failed to update learner profile for CAE:', e);
                  }
                }}
                className="group border border-slate-850 hover:border-violet-500 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-violet-500/10 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between text-left cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-black text-lg border border-violet-500/25 mb-4 group-hover:scale-105 transition-transform">
                    C1
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">CAE C1 Advanced</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Đường đua đạt chứng chỉ Cambridge C1 Advanced (CAE). Ôn tập chuyên đề ngữ pháp và từ vựng ngữ pháp nâng cao, bám sát cấu trúc đề thi chính thức của Cambridge.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[10px] text-violet-400 font-bold bg-violet-950/50 border border-violet-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Level C1 Advanced
                  </span>
                  <span className="text-xs font-bold text-violet-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Vào học →
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header bar */}
      <header className={`${trackTheme.bgHeader} text-white px-6 py-4 flex items-center justify-between shadow-md transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <svg className={`w-8 h-8 ${trackTheme.accentText} fill-current`} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div className="text-left">
            <h1 className="text-lg font-bold tracking-tight m-0 text-white leading-none">{trackTheme.name}</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">AI-Powered Prep Platform</span>
          </div>
        </div>

        {currentTab !== 'exam' && (
          <div className="flex items-center gap-4.5">
            {/* User Session profile switcher */}
            {!isTauri && (
              <div className="flex items-center gap-2 bg-slate-850 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
                <span className={`w-5 h-5 rounded-full ${trackTheme.bgPrimary} text-[10px] font-black flex items-center justify-center text-white font-mono uppercase`}>
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
                      {u.username} ({u.role === 'admin' ? 'Admin' : `${activeTrack === 'cpe' ? 'C2' : activeTrack === 'cae' ? 'C1' : 'Band'} ${u.targetBand}`})
                    </option>
                  ))}
                  <option value="new_user" className="bg-slate-900 text-blue-400 font-bold">+ Tạo tài khoản mới</option>
                </select>
              </div>
            )}

            {!isTauri && (
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
            )}

            <div className="flex items-center gap-6">
              {/* Luồng 1: Mock Exams Flow */}
              <div className="flex flex-col gap-1 border-r border-slate-700 pr-5">
                <span className={`text-[9px] ${trackTheme.accentText} font-black uppercase tracking-wider text-left`}>🏆 Luồng Đề Thi Thử</span>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                    activeTab === 'dashboard' ? `${trackTheme.bgPrimary} text-white shadow` : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Đề Mock Test Full
                </button>
              </div>

              {/* Luồng 2: Adaptive Practice Flow */}
              <div className="flex flex-col gap-1 pl-1">
                <span className={`text-[9px] ${trackTheme.accentText} font-black uppercase tracking-wider text-left`}>📖 Luồng Ôn Tập Chuyên Đề & AI</span>
                <nav className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('adaptive_room')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                      activeTab === 'adaptive_room' ? `${trackTheme.bgPrimary} text-white shadow` : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Luyện Chuyên Đề & Từ Vựng
                  </button>
                  <button
                    onClick={() => setActiveTab('speaking_ai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                      activeTab === 'speaking_ai' ? `${trackTheme.bgPrimary} text-white shadow` : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Speaking AI Room
                  </button>
                  <button
                    onClick={() => setActiveTab('writing_ai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 outline-none cursor-pointer ${
                      activeTab === 'writing_ai' ? `${trackTheme.bgPrimary} text-white shadow` : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                      activeTab === 'error_notebook' ? `${trackTheme.bgPrimary} text-white shadow` : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Sổ Lỗi Sai (SRS)
                    {filteredErrorEntries.length > 0 && (
                      <span className="ml-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {filteredErrorEntries.filter(e => new Date(e.nextReviewAt) <= new Date()).length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTrack(null);
                      localStorage.removeItem(`active_track_${currentUserId}`);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-slate-700 outline-none cursor-pointer"
                  >
                    🔄 Đổi Môn Học
                  </button>

                  {isTauri && (
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-850 transition-all border border-indigo-700 hover:border-indigo-500 outline-none cursor-pointer bg-indigo-950/30"
                    >
                      ⚙️ Admin Panel
                    </button>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side: test selection */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {importSuccessMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3 shadow-sm mb-4">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">✓</span>
                  <span className="text-sm font-semibold">{importSuccessMsg}</span>
                </div>
              )}
              {activeAttempt && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg animate-pulse">!</span>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-amber-900">You have an exam session in progress</h3>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Test: <span className="font-semibold">{
                          availableTests.find(t => t.id === activeAttempt.testId)?.title || activeAttempt.testId
                        }</span> | 
                        Remaining: <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded text-xs">{Math.floor(activeAttempt.remainingSeconds / 60)}m {activeAttempt.remainingSeconds % 60}s</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => resumeExam(activeAttempt)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 px-4 rounded shadow transition-all whitespace-nowrap cursor-pointer border-0 outline-none"
                  >
                    Resume Active Session
                  </button>
                </div>
              )}

              {/* Premium Learner Profile Card */}
              <LearnerProfileCard
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
                activeTrack={activeTrack || 'ielts'}
                onNavigateTab={(tab) => {
                  setReviewQueue([]);
                  setCurrentReviewIdx(-1);
                  setActiveTab(tab);
                }}
              />

              <Suspense fallback={<LazyPanelFallback />}>
                <IeltsLearnerDashboard
                  attempts={attempts}
                  availableTests={availableTests.filter(t => getExamTrackOfTest(t) === activeTrack)}
                  userId={currentUserId}
                  activeTrack={activeTrack || 'ielts'}
                  onOpenAdaptivePractice={() => {
                    setReviewQueue([]);
                    setCurrentReviewIdx(-1);
                    setActiveTab('adaptive_room');
                  }}
                />
              </Suspense>

              {/* Luyện Tập Theo Chuyên Đề Card Panel */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-4 text-left">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 m-0 text-left">
                    <span className="text-xl">📖</span>
                    Luyện Tập Theo Chuyên Đề ({activeTrack.toUpperCase()})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 text-left">
                    Học và luyện tập các dạng bài, chuyên đề cụ thể (5 phút/bài luyện tập thích ứng).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                  {activeTrack === 'ielts' ? (
                    <>
                      {[
                        { id: 'multiple_choice', name: 'Reading: Multiple Choice', icon: '📑' },
                        { id: 'true_false_not_given', name: 'Reading: True / False / Not Given', icon: '✅' },
                        { id: 'gap_fill', name: 'Reading: Gap Fill (Điền từ)', icon: '✏️' },
                        { id: 'matching_headings', name: 'Reading: Matching Headings', icon: '📌' },
                        { id: 'multiple_select', name: 'Reading: Multiple Select', icon: '🗂️' },
                        { id: 'listening_gap_fill', name: 'Listening: Note Completion', icon: '🎧', internalId: 'gap_fill' },
                        { id: 'map_labeling', name: 'Listening: Map Labeling', icon: '🗺️' },
                        { id: 'table_completion', name: 'Listening: Table Completion', icon: '📊' }
                      ].map(topic => (
                        <div
                          key={topic.id}
                          onClick={() => {
                            setAutoLaunchPracticeType(topic.internalId || topic.id);
                            setActiveTab('adaptive_room');
                          }}
                          className="group relative border border-slate-150 rounded-xl p-4 bg-slate-50 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 text-left cursor-pointer flex flex-col justify-between min-h-[110px]"
                        >
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-2xl filter group-hover:scale-110 transition-transform">{topic.icon}</span>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug m-0 group-hover:text-indigo-600 transition-colors text-left">{topic.name}</h4>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-left">
                            <span className="text-[9px] bg-slate-200/60 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-left">Luyện Tập</span>
                            <span className="text-[10px] text-indigo-500 font-black opacity-0 group-hover:opacity-100 transition-opacity text-left">Luyện ngay →</span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { id: 'category:collocations', name: 'UoE: Collocations (Part 1/4)', icon: '🔗' },
                        { id: 'category:phrasal_verbs', name: 'UoE: Phrasal Verbs (Part 1/2)', icon: '🎯' },
                        { id: 'category:idioms', name: 'UoE: Idioms & Cleft Sentences', icon: '💡' },
                        { id: 'category:prepositions', name: 'UoE: Prepositions & Phrases', icon: '📍' },
                        { id: 'category:word_formation', name: 'UoE: Word Formation (Part 3)', icon: '🛠️' },
                        { id: 'category:reading_comprehension', name: 'Reading: Multiple Choice (Part 5)', icon: '📑' },
                        { id: 'gapped_text', name: 'Reading: Gapped Text (Part 6)', icon: '🧩' },
                        { id: 'multiple_matching', name: 'Reading: Multiple Matching (Part 7)', icon: '🎯' },
                        { id: 'cpe_listen_part_1', name: 'Listening: Multiple Choice Extracts (Part 1)', icon: '🎧' },
                        { id: 'cpe_listen_part_2', name: 'Listening: Sentence Completion (Part 2)', icon: '✏️' },
                        { id: 'cpe_listen_part_3', name: 'Listening: Multiple Choice Talk (Part 3)', icon: '📻' },
                        { id: 'cpe_listen_part_4', name: 'Listening: Multiple Matching (Part 4)', icon: '🔗' }
                      ].map(topic => (
                        <div
                          key={topic.id}
                          onClick={() => {
                            setAutoLaunchPracticeType(topic.id);
                            setActiveTab('adaptive_room');
                          }}
                          className="group relative border border-slate-150 rounded-xl p-4 bg-slate-50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 text-left cursor-pointer flex flex-col justify-between min-h-[110px]"
                        >
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-2xl filter group-hover:scale-110 transition-transform">{topic.icon}</span>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug m-0 group-hover:text-emerald-600 transition-colors text-left">{topic.name}</h4>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-left">
                            <span className="text-[9px] bg-slate-200/60 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-left">C2 Focus</span>
                            <span className="text-[10px] text-emerald-500 font-black opacity-0 group-hover:opacity-100 transition-opacity text-left">Luyện ngay →</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b pb-4">
                  <h2 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
                    <svg className={`w-5 h-5 ${trackTheme.textPrimary} fill-current`} viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    Available Mock Exams ({activeTrack.toUpperCase()})
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'full_exam', label: 'Standard' },
                      { id: 'practice_bank', label: 'Practice Bank' },
                      { id: 'topic_bank', label: 'Chuyên Đề' },
                      { id: 'diagnostic', label: 'Chẩn Đoán' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setDashboardCategory(cat.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border outline-none cursor-pointer ${
                          dashboardCategory === cat.id
                            ? `${trackTheme.bgPrimary} border-transparent text-white shadow-sm`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTests.filter(t => getExamTrackOfTest(t) === activeTrack && (t as any).displayMode !== 'topic').filter(test => {
                    if (dashboardCategory === 'all') return true;
                    return categorizeTest(test) === dashboardCategory;
                  }).map(test => (
                    <div key={test.id} className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col justify-between shadow-sm text-left hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trackTheme.badge}`}>
                            {test.type}
                          </span>
                          <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded uppercase">
                            {categorizeTest(test) === 'full_exam' ? 'Standard Exam' : categorizeTest(test) === 'practice_bank' ? 'Practice' : categorizeTest(test) === 'topic_bank' ? 'Topic Bank' : 'Diagnostic'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mt-2">{test.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Skill: <span className="capitalize">{test.skill}</span> | Time: {test.skill === 'listening' ? '30' : '60'} mins
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTestForMode(test);
                          setShowModeSelectorModal(true);
                        }}
                        className={`mt-4 ${trackTheme.bgPrimary} text-white text-sm font-semibold py-2 px-4 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer border-0 outline-none`}
                      >
                        Start Mock Test
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    </div>
                  ))}
                  {availableTests.filter(t => getExamTrackOfTest(t) === activeTrack && (t as any).displayMode !== 'topic').filter(test => {
                    if (dashboardCategory === 'all') return true;
                    return categorizeTest(test) === dashboardCategory;
                  }).length === 0 && (
                    <p className="col-span-2 text-sm text-slate-500 italic p-4 text-center border border-dashed rounded bg-slate-50/50">Không có đề thi nào thuộc chuyên mục này.</p>
                  )}
                </div>
              </div>

              {/* History Attempts table */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className={`w-5 h-5 ${trackTheme.textPrimary} fill-current`} viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
                  My Mock Exam History ({activeTrack.toUpperCase()})
                </h2>
                {attempts.filter(attempt => {
                  const test = availableTests.find(t => t.id === attempt.testId);
                  const track = test ? getExamTrackOfTest(test) : 'ielts';
                  return track === activeTrack;
                }).length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed rounded bg-slate-50/50">No completed attempts recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="p-3 font-semibold">Test Title</th>
                          <th className="p-3 font-semibold">Date Completed</th>
                          <th className="p-3 font-semibold">Raw Score</th>
                          <th className="p-3 font-semibold">{activeTrack === 'ielts' ? 'IELTS Band' : activeTrack === 'cpe' ? 'CPE Scale' : 'CAE Scale'}</th>
                          <th className="p-3 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.filter(attempt => {
                          const test = availableTests.find(t => t.id === attempt.testId);
                          const track = test ? getExamTrackOfTest(test) : 'ielts';
                          return track === activeTrack;
                        }).map(attempt => {
                          const test = availableTests.find(t => t.id === attempt.testId);
                          const testTitle = test ? test.title : attempt.testId;
                          return (
                            <tr key={attempt.local_id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 font-medium text-slate-800">{testTitle}</td>
                              <td className="p-3 text-slate-500 text-xs">{new Date(attempt.createdAt).toLocaleString()}</td>
                              <td className="p-3 text-slate-600">
                                {attempt.scores?.rawScore ?? 0} / {attempt.scores?.totalQuestions ?? (attempt.testId === 'reading-sample-1' ? 5 : 3)} correct
                                {attempt.scores?.isMockScoring !== false && (
                                  <span className="text-[10px] text-slate-400 block italic">(Mock Test)</span>
                                )}
                              </td>
                              <td className={`p-3 font-bold ${trackTheme.textPrimary} text-base`}>
                                {attempt.scores?.bandScore ? (activeTrack === 'ielts' ? attempt.scores.bandScore.toFixed(1) : attempt.scores.bandScore.toFixed(0)) : '0'}
                                <span className="text-[10px] text-slate-400 block font-normal">
                                  {attempt.scores?.isMockScoring ? 'Estimated' : 'Official'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleReviewAttempt(attempt)}
                                  className={`text-white font-semibold text-xs py-1.5 px-3 rounded shadow transition-all whitespace-nowrap cursor-pointer border-0 outline-none ${trackTheme.bgPrimary}`}
                                >
                                  Review Answers
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

             {/* Right side: instructions, help, imports */}
             <div className="flex flex-col gap-6 text-left">
               {/* AI Evaluation Settings Card */}
               {isAdmin && (
                 <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-6 shadow-md flex flex-col gap-4">
                   <h3 className="text-base font-bold text-white flex items-center gap-2">
                     <svg className="w-5 h-5 text-blue-400 fill-current" viewBox="0 0 24 24">
                       <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0,-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 c-0.12,0.21-0.08,0.47,0.12,0.61l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12c0,0.31,0.04,0.63,0.08,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                     </svg>
                     AI Evaluation Panel
                   </h3>
                   
                   <div className="flex flex-col gap-3 text-xs">
                     {/* Active Provider selector */}
                     <div className="flex flex-col gap-1">
                       <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Active Evaluator</span>
                       <div className="grid grid-cols-3 gap-1.5 mt-1 bg-slate-800 p-1 rounded-md">
                         {['mock', 'openai', 'gemini'].map(prov => (
                           <button
                             key={prov}
                             onClick={() => setAiConfig({ ...aiConfig, provider: prov as 'mock' | 'openai' | 'gemini' })}
                             className={`py-1.5 px-2 rounded font-semibold text-center uppercase tracking-wide transition-all cursor-pointer border-0 outline-none ${
                               aiConfig.provider === prov 
                                 ? 'bg-blue-600 text-white shadow-sm' 
                                 : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                             }`}
                           >
                             {prov}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* OpenAI specific Settings */}
                     {aiConfig.provider === 'openai' && (
                       <div className="flex flex-col gap-2.5 mt-1 border-t border-slate-800 pt-2.5">
                         <div className="flex flex-col gap-1">
                           <div className="flex justify-between items-center">
                             <span className="text-slate-400 font-medium">OpenAI API Key</span>
                             {hasOpenAiKey && (
                               <button
                                 onClick={async () => {
                                   await credentialStore.delete('openai_api_key');
                                   setHasOpenAiKey(false);
                                   setOpenaiKeyInput('');
                                 }}
                                 className="text-[10px] text-red-400 hover:text-red-300 underline bg-transparent border-none cursor-pointer"
                               >
                                 Clear Saved Key
                               </button>
                             )}
                           </div>
                           <input
                             type="password"
                             placeholder={hasOpenAiKey ? "•••••••• (Key saved)" : "Enter OpenAI API Key"}
                             value={openaiKeyInput}
                             onChange={(e) => setOpenaiKeyInput(e.target.value)}
                             onBlur={async () => {
                               if (openaiKeyInput.trim()) {
                                 await credentialStore.set('openai_api_key', openaiKeyInput);
                                 setHasOpenAiKey(true);
                                 setOpenaiKeyInput('');
                               }
                             }}
                             className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                           />
                         </div>
                         <div className="flex flex-col gap-1">
                           <span className="text-slate-400 font-medium">Model Selection</span>
                           <select
                             value={aiConfig.openaiModel || 'gpt-4o'}
                             onChange={(e) => setAiConfig({ ...aiConfig, openaiModel: e.target.value })}
                             className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                           >
                             <option value="gpt-4o">gpt-4o (Premium)</option>
                             <option value="gpt-4o-mini">gpt-4o-mini (Cost-effective)</option>
                             <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                           </select>
                         </div>
                       </div>
                     )}

                     {/* Gemini specific Settings */}
                     {aiConfig.provider === 'gemini' && (
                       <div className="flex flex-col gap-2.5 mt-1 border-t border-slate-800 pt-2.5">
                         <div className="flex flex-col gap-1">
                           <div className="flex justify-between items-center">
                             <span className="text-slate-400 font-medium">Gemini API Key</span>
                             {hasGeminiKey && (
                               <button
                                 onClick={async () => {
                                   await credentialStore.delete('gemini_api_key');
                                   setHasGeminiKey(false);
                                   setGeminiKeyInput('');
                                 }}
                                 className="text-[10px] text-red-400 hover:text-red-300 underline bg-transparent border-none cursor-pointer"
                               >
                                 Clear Saved Key
                               </button>
                             )}
                           </div>
                           <input
                             type="password"
                             placeholder={hasGeminiKey ? "•••••••• (Key saved)" : "Enter Gemini API Key"}
                             value={geminiKeyInput}
                             onChange={(e) => setGeminiKeyInput(e.target.value)}
                             onBlur={async () => {
                               if (geminiKeyInput.trim()) {
                                 await credentialStore.set('gemini_api_key', geminiKeyInput);
                                 setHasGeminiKey(true);
                                 setGeminiKeyInput('');
                               }
                             }}
                             className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                           />
                         </div>
                         <div className="flex flex-col gap-1">
                           <span className="text-slate-400 font-medium">Model Selection</span>
                           <select
                             value={aiConfig.geminiModel || 'gemini-1.5-flash'}
                             onChange={(e) => setAiConfig({ ...aiConfig, geminiModel: e.target.value })}
                             className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                           >
                             <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & lightweight)</option>
                             <option value="gemini-1.5-pro">gemini-1.5-pro (High intelligence)</option>
                           </select>
                         </div>
                       </div>
                     )}

                     {/* Test Connection Button */}
                     <div className="mt-2 flex flex-col gap-2">
                       <button
                         onClick={handleTestConnection}
                         disabled={isTestingConnection}
                         className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-650 text-white font-bold py-2 px-3 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0 outline-none"
                       >
                         {isTestingConnection ? (
                           <>
                             <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                             Testing...
                           </>
                         ) : (
                           'Test Connection'
                         )}
                       </button>

                       {testConnectionResult && (
                         <div className={`p-2.5 rounded text-xs leading-relaxed border ${
                           testConnectionResult.success 
                             ? 'bg-green-950/45 border-green-800 text-green-300' 
                             : 'bg-red-950/45 border-red-800 text-red-300'
                         }`}>
                           <div className="font-bold flex items-center gap-1.5">
                             {testConnectionResult.success ? '✓ Valid Configuration' : '✗ Connection Failed'}
                           </div>
                           <div className="mt-0.5 text-[11px] opacity-90">{testConnectionResult.message}</div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )}

               {/* Import Test Card */}
               {isAdmin && (
                 <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-4">
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <svg className="w-5 h-5 text-blue-600 fill-current" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                     Import Exam Package
                   </h3>
                   <p className="text-xs text-slate-500 m-0">
                     Upload an independently compiled exam package in `.json` format to load it instantly. The engine will run schema compliance checks.
                   </p>
                   <div className="flex flex-col gap-2">
                     <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-all flex flex-col items-center justify-center gap-2">
                       <input
                         type="file"
                         accept=".json"
                         onChange={handleImportJson}
                         className="hidden"
                       />
                       <svg className="w-8 h-8 text-slate-400 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                       <span className="text-xs font-semibold text-slate-600">Select Exam JSON File</span>
                     </label>
                   </div>
                 </div>
               )}

               <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                 <h3 className="text-lg font-bold text-blue-900 mb-2">Platform Instructions</h3>
                 <ul className="text-sm text-blue-800 flex flex-col gap-2 list-disc list-inside p-0 m-0">
                   <li>This interface closely matches standard **computer-delivered exam-style grids**.</li>
                   <li>In **Reading**, you will see a two-panel split layout: the passage text on the left, and the input sheet on the right.</li>
                   <li>In **Listening**, the audio is controlled via a locked media player that allows only a single run.</li>
                   <li>The countdown timers utilize **drift-proof clock calculations** to remain accurate even if your device sleeps.</li>
                 </ul>
               </div>
             </div>
          </div>
        )}

        {/* TAB 2: EXAM MODULE */}
        {currentTab === 'exam' && selectedTest && (
          <div className="flex flex-col gap-6">
            {/* Header bar during exam / review */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
              {isReviewMode ? (
                <div className="text-left">
                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Educational Review Mode
                  </span>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight mt-1">{selectedTest.title}</h2>
                </div>
              ) : (
                <div className="text-left">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{selectedTest.skill} exam in progress</span>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">{selectedTest.title}</h2>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                {isReviewMode ? (
                  <>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Performance Result</span>
                      <span className="text-sm font-bold text-slate-700">
                        Raw Score: <span className="text-blue-600 font-mono">{reviewAttempt?.scores?.rawScore ?? 0}/{reviewAttempt?.scores?.totalQuestions ?? 0}</span> | 
                        Band: <span className="text-indigo-600 font-mono font-black">{reviewAttempt?.scores?.bandScore?.toFixed(1) ?? '0.0'}</span>
                        {reviewAttempt?.scores?.isMockScoring && (
                          <span className="text-[9px] text-amber-600 ml-1.5 font-normal italic">(Estimated)</span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTest(null);
                        setActiveTab('dashboard');
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2.5 px-4 rounded shadow transition-all cursor-pointer border-0 outline-none"
                    >
                      Exit Review
                    </button>
                  </>
                ) : (
                  <>
                    {currentExamMode === 'practice' ? (
                      <button
                        onClick={togglePause}
                        className={`px-3 py-2 rounded text-xs font-semibold border shadow transition-all cursor-pointer ${
                          isPaused 
                            ? 'bg-amber-600 border-transparent text-white hover:bg-amber-700' 
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isPaused ? 'Resume Exam' : 'Pause Exam'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded font-bold uppercase select-none">
                        Exam Lock (Pause Blocked)
                      </span>
                    )}
                    <ExamTimer 
                      remainingSeconds={remainingSeconds} 
                      onTimeUp={handleAutoSubmit} 
                      isPaused={isPaused}
                    />
                    <button
                      onClick={submitExam}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded shadow transition-all cursor-pointer border-0 outline-none"
                    >
                      Submit Exam
                    </button>
                  </>
                )}
              </div>
            </div>

             {/* Exam Content panel */}
            {!isPaused ? (
              <ExamSectionSheet
                selectedTest={selectedTest}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                isReviewMode={isReviewMode}
                currentExamMode={currentExamMode}
                reviewAttempt={reviewAttempt}
                listeningReviewTab={listeningReviewTab}
                setListeningReviewTab={setListeningReviewTab}
                getHighlightedPassageHtml={getHighlightedPassageHtml}
                getSocraticHintForQuestion={getSocraticHintForQuestion}
                isCorrectAnswer={isCorrectAnswer}
                analyzeWeaknesses={analyzeWeaknesses}
              />
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-12 rounded-xl text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto shadow-sm">
                <span className="text-4xl animate-bounce">⏱️</span>
                <h3 className="text-lg font-black text-amber-900 m-0">Bài thi đang được tạm dừng</h3>
                <p className="text-xs text-amber-700 leading-relaxed max-w-sm m-0">
                  Đây là tính năng độc quyền của **Practice Mode**. Bộ đếm ngược thời gian thi và trình phát âm thanh đã tạm dừng. Bạn có thể nhấn nút Tiếp tục bất kỳ lúc nào để tiếp tục làm bài.
                </p>
                <button
                  onClick={togglePause}
                  className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-6 rounded-lg shadow transition-all cursor-pointer border-0 outline-none uppercase tracking-wider"
                >
                  Tiếp tục làm bài (Resume)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WRITING AI MODULE */}
        {currentTab === 'writing_ai' && (
          <Suspense fallback={<LazyPanelFallback />}>
            <WritingAiRoom
              writingFeedback={writingFeedback}
              isAiLoading={isAiLoading}
              aiErrorMsg={aiErrorMsg}
              runWritingAiEvaluation={runWritingAiEvaluation as any}
              activeTrack={activeTrack || 'ielts'}
              activeTheme={activeTheme}
              availableWritingSamples={availableWritingSamples}
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
              track={activeTrack || 'ielts'}
            />
          </Suspense>
        )}

        {/* TAB 6: ADAPTIVE LEARNING PRACTICE ROOM */}
        {currentTab === 'adaptive_room' && (
          <Suspense fallback={<LazyPanelFallback />}>
            <AdaptivePracticeRoom
              availableTests={availableTests.filter(t => getExamTrackOfTest(t) === activeTrack)}
              db={db}
              userId={currentUserId}
              activeTrack={activeTrack}
              weaknesses={getGlobalWeaknessAnalysis()}
              onHistoryReload={loadHistory}
              autoLaunchPracticeType={autoLaunchPracticeType}
              clearAutoLaunch={() => setAutoLaunchPracticeType(null)}
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
