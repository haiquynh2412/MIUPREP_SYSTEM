import type { JSX } from 'react';
import React, { Suspense } from 'react';
import type { LocalUser } from '@miuprep/db';
import { useTranslation } from '@miuprep/i18n/src/react';
import type { LearningEventRecord } from '@miuprep/learning';
import {
  MASCOT_STORE_ITEMS,
  STUDENT_DIARY_MOODS,
  getErrorNotebookSummary,
  openErrorNotebookFromOverview,
  type DailyLoopStepId,
  type DiaryEntry,
  type LessonTemplateAction,
  type StudentWorkspaceTab,
  type StudentWorkspaceTabId,
} from '../lib/studentProgress';
import type { ErrorNotebookQuestion } from '../lib/satPractice';
import type {
  TemplatePracticeChoiceKey,
  TemplatePracticeState,
  TemplatePracticeTemplate,
} from '../lib/templatePractice';
import type {
  EnglishItemBankPracticeChoiceKey,
  EnglishItemBankPracticeState,
} from '../lib/englishItemBankPractice';
import type { PortalTrackId, PortalTrackInfo } from './UnifiedLearnerDashboard';

const UnifiedLearnerDashboard = React.lazy(() => import('./UnifiedLearnerDashboard'));
const AITutorPreviewPanel = React.lazy(() => import('./AITutorPreviewPanel'));
const StudentTodaySprint = React.lazy(() => import('./StudentTodaySprint'));
const MathLessonTemplatePanel = React.lazy(() => import('./MathLessonTemplatePanel'));
const EnglishCoreLessonTemplatePanel = React.lazy(() => import('./EnglishCoreLessonTemplatePanel'));
const TemplatePracticeSessionPanel = React.lazy(() => import('./TemplatePracticeSessionPanel'));
const EnglishItemBankPracticePanel = React.lazy(() => import('./EnglishItemBankPracticePanel'));
const ErrorNotebookV2Panel = React.lazy(() => import('./ErrorNotebookV2Panel'));

type ActiveStudentTab = 'dashboard' | 'sat-board';
type LessonTemplateActionTemplate = TemplatePracticeTemplate;

interface StudentTrackInfo extends PortalTrackInfo {
  id: PortalTrackId;
  description: string;
  badge: string;
  colorClass: string;
  buttonText: string;
  bubbleText: string;
}

interface StudentDashboardWorkspaceProps {
  currentUser: LocalUser;
  tracks: StudentTrackInfo[];
  studentWorkspaceTabs: StudentWorkspaceTab[];
  studentWorkspaceTab: StudentWorkspaceTabId;
  setStudentWorkspaceTab: React.Dispatch<React.SetStateAction<StudentWorkspaceTabId>>;
  fishCoins: number;
  mouseTrapsCount: number;
  activeErrorQuestions: ErrorNotebookQuestion[];
  activeErrorQuestionCount: number;
  studentLearningEvents: LearningEventRecord[];
  handleOpenStudentRepair: () => void;
  handleDailyStepCompleted: (stepId: DailyLoopStepId) => void;
  handleDailyPlanCompleted: () => void | Promise<void>;
  errorQuestions: ErrorNotebookQuestion[];
  englishItemBankPracticeState: EnglishItemBankPracticeState | null;
  handleAnswerEnglishItemBankPractice: (choice: EnglishItemBankPracticeChoiceKey) => void | Promise<void>;
  handleNextEnglishItemBankPractice: () => void | Promise<void>;
  setEnglishItemBankPracticeState: React.Dispatch<React.SetStateAction<EnglishItemBankPracticeState | null>>;
  templatePracticeState: TemplatePracticeState | null;
  handleAnswerTemplatePractice: (choice: TemplatePracticeChoiceKey) => void | Promise<void>;
  handleNextTemplatePractice: () => void | Promise<void>;
  setTemplatePracticeState: React.Dispatch<React.SetStateAction<TemplatePracticeState | null>>;
  showErrorNotebook: boolean;
  setShowErrorNotebook: React.Dispatch<React.SetStateAction<boolean>>;
  handleRetryErrorQuestionV2: (questionId: string, selectedAnswer: string, correctAnswer: string) => void;
  handleRetryErrorQuestion: (questionId: string, selectedAnswer: string, correctAnswer: string) => void;
  unlockedMascotItems: string[];
  equippedMascotItem: string;
  handleBuyMascotItem: (item: string, price: number) => void;
  handleEquipMascotItem: (item: string) => void;
  showDesmos: boolean;
  setShowDesmos: React.Dispatch<React.SetStateAction<boolean>>;
  studyDiary: string;
  setStudyDiary: React.Dispatch<React.SetStateAction<string>>;
  diaryMood: string;
  setDiaryMood: React.Dispatch<React.SetStateAction<string>>;
  diaryList: DiaryEntry[];
  handleSaveDiary: (event: React.FormEvent) => void;
  setHoveredTrack: React.Dispatch<React.SetStateAction<PortalTrackId | null>>;
  setActiveStudentTab: React.Dispatch<React.SetStateAction<ActiveStudentTab>>;
  showNotif: (message: string, type?: 'success' | 'error' | 'info') => void;
  handleMathLessonTemplateAction: (template: LessonTemplateActionTemplate, action: LessonTemplateAction) => void;
  handleEnglishLessonTemplateAction: (template: LessonTemplateActionTemplate, action: LessonTemplateAction) => void | Promise<void>;
}

function DeferredPanel({ children, label = 'Loading student workspace' }: { children: React.ReactNode; label?: string }): JSX.Element {
  return (
    <Suspense
      fallback={
        <section className="max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-6 text-left text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}...
        </section>
      }
    >
      {children}
    </Suspense>
  );
}

export default function StudentDashboardWorkspace({
  currentUser,
  tracks,
  studentWorkspaceTabs,
  studentWorkspaceTab,
  setStudentWorkspaceTab,
  fishCoins,
  mouseTrapsCount,
  activeErrorQuestions,
  activeErrorQuestionCount,
  studentLearningEvents,
  handleOpenStudentRepair,
  handleDailyStepCompleted,
  handleDailyPlanCompleted,
  errorQuestions,
  englishItemBankPracticeState,
  handleAnswerEnglishItemBankPractice,
  handleNextEnglishItemBankPractice,
  setEnglishItemBankPracticeState,
  templatePracticeState,
  handleAnswerTemplatePractice,
  handleNextTemplatePractice,
  setTemplatePracticeState,
  showErrorNotebook,
  setShowErrorNotebook,
  handleRetryErrorQuestionV2,
  handleRetryErrorQuestion,
  unlockedMascotItems,
  equippedMascotItem,
  handleBuyMascotItem,
  handleEquipMascotItem,
  showDesmos,
  setShowDesmos,
  studyDiary,
  setStudyDiary,
  diaryMood,
  setDiaryMood,
  diaryList,
  handleSaveDiary,
  setHoveredTrack,
  setActiveStudentTab,
  showNotif,
  handleMathLessonTemplateAction,
  handleEnglishLessonTemplateAction,
}: StudentDashboardWorkspaceProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="space-y-12">

    <section className="max-w-5xl mx-auto">
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 grid grid-cols-2 md:grid-cols-5 gap-2 shadow-xl">
        {studentWorkspaceTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStudentWorkspaceTab(tab.id)}
            className={`rounded-xl px-4 py-3 text-left transition-all border cursor-pointer ${
              studentWorkspaceTab === tab.id
                ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-950/20'
                : 'bg-slate-950/60 text-slate-300 border-slate-850 hover:border-emerald-500/60 hover:text-white'
            }`}
          >
            <span className="block text-sm font-black uppercase tracking-wider">{tab.label}</span>
            <span className={`mt-1 block text-[10px] font-bold ${studentWorkspaceTab === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>
              {tab.detail}
            </span>
          </button>
        ))}
      </div>
    </section>
    
    {/* 1. Student Unified Shared Stats */}
    {studentWorkspaceTab === 'overview' && (
      <>
    <DeferredPanel label="Loading today quest">
      <StudentTodaySprint
        key={`${currentUser.username}-${new Date().toLocaleDateString('en-CA')}`}
        currentUser={currentUser}
        tracks={tracks}
        fishCoins={fishCoins}
        mouseTrapsCount={mouseTrapsCount}
        activeErrorQuestions={activeErrorQuestions}
        activeErrorQuestionCount={activeErrorQuestionCount}
        learningEvents={studentLearningEvents}
        onStartRepair={handleOpenStudentRepair}
        onOpenCourses={() => setStudentWorkspaceTab('courses')}
        onOpenTutor={() => setStudentWorkspaceTab('tutor')}
        onDailyStepCompleted={handleDailyStepCompleted}
        onDailyPlanCompleted={handleDailyPlanCompleted}
      />
    </DeferredPanel>

    <div>
      <h2 className="text-2xl font-black mb-6 text-center sm:text-left text-slate-200 uppercase tracking-widest flex items-center gap-2">
        <span>🚀 LỰA CHỌN PHÂN HỆ HỌC TẬP</span>
        <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">{tracks.length} TRACKS ACTIVE</span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tracks.map((track) => (
          <div
            key={track.id}
            onMouseEnter={() => setHoveredTrack(track.id)}
            onMouseLeave={() => setHoveredTrack(null)}
            className={`border border-slate-800 bg-slate-950/60 rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl shadow-inner relative overflow-hidden bg-gradient-to-br ${track.colorClass}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400">{track.subtitle}</span>
                <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">{track.title}</h3>
              </div>
              <span className="text-4xl bg-slate-900/40 p-3 rounded-2xl border border-white/5">{track.icon}</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed flex-1 text-left">{track.description}</p>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5 self-start">{track.badge}</div>
            <button
              onClick={() => {
                if (track.id === 'sat') {
                  setActiveStudentTab('sat-board');
                  showNotif(t('sdw_notif_open_sat'), 'success');
                } else {
                  setStudentWorkspaceTab('courses');
                }
              }}
              className="mt-2 w-full py-3 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-100 transition-colors shadow flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-95 duration-100 border-0 cursor-pointer"
            >
              <span>{track.buttonText}</span>
              <span>➔</span>
            </button>
          </div>
        ))}
      </div>
    </div>

    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Salmon Coins */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow hover:border-emerald-500/40 transition-colors bg-gradient-to-tr from-slate-900 to-teal-950/20">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">{t('sdw_wallet_title')}</span>
          <span className="text-3xl font-black text-emerald-400 font-mono">{fishCoins} 🐟</span>
          <span className="text-[10px] text-slate-500">{t('sdw_wallet_sub')}</span>
        </div>
        <span className="text-4xl filter drop-shadow">💰</span>
      </div>

      {/* Spaced-Repetition Mouse Traps (Clickable) */}
      <div 
        onClick={() => {
          const notebookAction = openErrorNotebookFromOverview(showErrorNotebook);
          setShowErrorNotebook(notebookAction.nextShowErrorNotebook);
          if (notebookAction.nextWorkspaceTab) {
            setStudentWorkspaceTab(notebookAction.nextWorkspaceTab);
          }
          if (notebookAction.shouldNotify) {
            showNotif(t('sdw_notif_open_leitner'), "info");
          }
        }}
        className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow hover:border-rose-500/40 transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-tr from-slate-900 to-rose-950/20"
        title={t('sdw_traps_tooltip')}
      >
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">{t('sdw_traps_title')}</span>
          <span className="text-3xl font-black text-rose-400 font-mono">{mouseTrapsCount} 😼</span>
          <span className="text-[10px] text-slate-400 font-bold">{t('sdw_traps_sub')}</span>
        </div>
        <span className="text-4xl filter drop-shadow">🪤</span>
      </div>

      {/* Global Progress */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow hover:border-indigo-500/40 transition-colors bg-gradient-to-tr from-slate-900 to-indigo-950/20">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">{t('sdw_irt_title')}</span>
          <span className="text-3xl font-black text-indigo-400 font-mono">92.4% 🧠</span>
          <span className="text-[10px] text-slate-500">Mục tiêu ôn tuần: {currentUser.studyPlan?.weeklyTarget || 4} buổi</span>
        </div>
        <span className="text-4xl filter drop-shadow">🌌</span>
      </div>
    </section>

    <DeferredPanel label="Loading growth map">
      <UnifiedLearnerDashboard
        currentUser={currentUser}
        tracks={tracks}
        fishCoins={fishCoins}
        mouseTrapsCount={mouseTrapsCount}
        errorQuestionCount={activeErrorQuestionCount}
        learningEvents={studentLearningEvents}
      />
    </DeferredPanel>
      </>
    )}

    {studentWorkspaceTab === 'tutor' && (
    <DeferredPanel label="Loading AI tutor">
      <AITutorPreviewPanel
        currentUser={currentUser}
        errorQuestions={errorQuestions}
      />
    </DeferredPanel>
    )}

    {studentWorkspaceTab === 'practice' && englishItemBankPracticeState && (
      <DeferredPanel label="Loading practice session">
        <EnglishItemBankPracticePanel
          state={englishItemBankPracticeState}
          onAnswer={handleAnswerEnglishItemBankPractice}
          onNext={handleNextEnglishItemBankPractice}
          onClose={() => setEnglishItemBankPracticeState(null)}
        />
      </DeferredPanel>
    )}

    {studentWorkspaceTab === 'practice' && !englishItemBankPracticeState && templatePracticeState && (
      <DeferredPanel label="Loading practice session">
        <TemplatePracticeSessionPanel
          state={templatePracticeState}
          onAnswer={handleAnswerTemplatePractice}
          onNext={handleNextTemplatePractice}
          onClose={() => setTemplatePracticeState(null)}
        />
      </DeferredPanel>
    )}

    {/* 1.3. LEITNER ERROR NOTEBOOK (Collapsible) */}
    {studentWorkspaceTab === 'practice' && !englishItemBankPracticeState && !templatePracticeState && !showErrorNotebook && (
      <section className="bg-slate-900/60 border border-rose-500/20 rounded-3xl p-6 max-w-4xl mx-auto shadow-xl text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest">{t('sdw_leitner_title')}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {getErrorNotebookSummary(activeErrorQuestionCount)}
            </p>
          </div>
          <button
            onClick={() => setShowErrorNotebook(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase px-5 py-3 rounded-xl transition-colors border-0 cursor-pointer"
          >
            {t('sdw_open_errors')}
          </button>
        </div>
      </section>
    )}

    {studentWorkspaceTab === 'practice' && !englishItemBankPracticeState && !templatePracticeState && showErrorNotebook && (
      <DeferredPanel label="Loading error notebook">
        <ErrorNotebookV2Panel
          errorQuestions={errorQuestions}
          onClose={() => setShowErrorNotebook(false)}
          onRetry={handleRetryErrorQuestionV2}
          onOpenTutor={() => {
            setShowErrorNotebook(false);
            setStudentWorkspaceTab('tutor');
          }}
        />
      </DeferredPanel>
    )}

    {studentWorkspaceTab === 'practice' && !englishItemBankPracticeState && !templatePracticeState && showErrorNotebook && Boolean(localStorage.getItem('miuprep_show_legacy_error_notebook')) && (
      <section className="bg-slate-900/60 border-2 border-rose-500/30 rounded-3xl p-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 to-rose-950/20 text-left transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
            <span>😼 SỔ TAY BẪY CHUỘT ÔN TẬP LEITNER CỦA BẠN</span>
            <span className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-900 px-2 py-0.5 rounded-full font-bold font-mono">ACTIVE REVIEW</span>
          </h3>
          <button
            onClick={() => setShowErrorNotebook(false)}
            className="bg-slate-950 hover:bg-slate-850 text-slate-350 hover:text-white border-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {activeErrorQuestionCount === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">{t('sdw_all_traps_clear')}😽</p>
          ) : (
            activeErrorQuestions.map((q) => (
                <div key={q.id} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 text-xs flex flex-col gap-3 relative">
                  <span className="absolute top-3 right-3 text-[9px] bg-rose-950/70 text-rose-400 border border-rose-900 px-2 py-0.5 rounded font-mono font-bold">STAGE {q.stage}</span>
                  <p className="font-extrabold text-slate-200 leading-relaxed pr-16">{q.text}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleRetryErrorQuestion(q.id, opt, q.answer)}
                        className="py-2 bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-455 transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <details className="text-[10px] text-slate-500 font-light cursor-pointer select-none">
                    <summary className="font-bold text-slate-450 hover:text-slate-300">{t('sdw_view_theory')}</summary>
                    <p className="mt-1.5 bg-slate-900 p-2.5 rounded-lg border border-slate-850 leading-relaxed text-slate-400">{q.answerExpl}</p>
                  </details>
                </div>
              ))
          )}
        </div>
      </section>
    )}

    {/* 1.4. CỬA HÀNG PHỤ KIỆN MASCOT MIU MIU */}
    {studentWorkspaceTab === 'rewards' && (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-4xl mx-auto shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-orange-950/5 to-slate-950 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
            <span>🛍️ CỬA HÀNG PHỤ KIỆN MASCOT MIU MIU</span>
            <span className="text-[9px] bg-orange-950/60 text-orange-400 border border-orange-900 px-2 py-0.5 rounded-full font-black font-mono">SALMON STORE</span>
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-light">
            {t('sdw_shop_desc')}
          </p>
        </div>
        <div className="text-xs font-black text-emerald-450 font-mono bg-slate-950 px-3 py-1.5 rounded-full border border-slate-850 shadow-inner shrink-0">
          {t('sdw_your_wallet')}{fishCoins} 🐟
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MASCOT_STORE_ITEMS.map(item => {
          const isUnlocked = unlockedMascotItems.includes(item.key);
          const isEquipped = equippedMascotItem === item.key;
          
          return (
            <div key={item.key} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 flex flex-col justify-between gap-3 transition-all hover:border-orange-500/30">
              <div className="flex items-start justify-between">
                <span className="text-4xl bg-slate-900 p-2 rounded-xl border border-slate-850">{item.key}</span>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-[10px] font-black text-slate-200">{item.label}</span>
                  <span className="text-[10px] font-bold text-amber-400 font-mono">{item.price} 🐟</span>
                </div>
              </div>
              
              <p className="text-[9px] text-slate-500 leading-normal font-light">{item.desc}</p>
              
              {isUnlocked ? (
                <button
                  onClick={() => handleEquipMascotItem(item.key)}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    isEquipped 
                      ? 'bg-orange-500/20 border-orange-500 text-orange-450' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isEquipped ? t('sdw_equipped') : t('sdw_try_on')}
                </button>
              ) : (
                <button
                  onClick={() => handleBuyMascotItem(item.key, item.price)}
                  className="w-full py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer shadow hover:scale-[0.98] active:scale-95 duration-100"
                >
                  {t('sdw_unlock')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
    )}

    {/* 2. Course Tracks Grid */}
    {studentWorkspaceTab === 'courses' && (
    <section className="space-y-8">
      {currentUser && (
        <>
          <DeferredPanel label="Loading math lesson templates">
            <MathLessonTemplatePanel
              currentUser={currentUser}
              tracks={tracks}
              fishCoins={fishCoins}
              mouseTrapsCount={mouseTrapsCount}
              learningEvents={studentLearningEvents}
              onOpenPractice={() => setStudentWorkspaceTab('practice')}
              onOpenTutor={() => setStudentWorkspaceTab('tutor')}
              onTemplateAction={handleMathLessonTemplateAction}
            />
          </DeferredPanel>
          <DeferredPanel label="Loading English lesson templates">
            <EnglishCoreLessonTemplatePanel
              currentUser={currentUser}
              tracks={tracks}
              fishCoins={fishCoins}
              mouseTrapsCount={mouseTrapsCount}
              learningEvents={studentLearningEvents}
              onOpenPractice={() => setStudentWorkspaceTab('practice')}
              onOpenTutor={() => setStudentWorkspaceTab('tutor')}
              onTemplateAction={handleEnglishLessonTemplateAction}
            />
          </DeferredPanel>
        </>
      )}
    </section>
    )}

    {/* 2.5. DESMOS INTEGRATED GRAPHING CALCULATOR */}
    {studentWorkspaceTab === 'practice' && (
    <section className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 max-w-4xl mx-auto shadow-inner bg-gradient-to-br from-slate-900/50 to-indigo-950/15 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 font-mono">
          <span>{t('sdw_desmos_label')}</span>
          <span className="text-[9px] bg-indigo-950/60 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full font-bold">DESMOS LIVE</span>
        </h3>
        <button
          onClick={() => setShowDesmos(!showDesmos)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-colors border-0 cursor-pointer"
        >
          {showDesmos ? t('sdw_desmos_hide') : t('sdw_desmos_show')}
        </button>
      </div>

      {showDesmos && (
        <div className="mt-4 border border-indigo-900/50 rounded-2xl overflow-hidden shadow-2xl h-[420px] relative bg-slate-950 transition-all duration-300">
          <iframe
            src="https://www.desmos.com/calculator?embed=true"
            width="100%"
            height="100%"
            style={{ border: 'none', filter: 'invert(90%) hue-rotate(180deg)' }}
            title="Desmos Grapher"
          />
          <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-[9px] text-slate-500 font-mono">
            {t('sdw_desmos_note')}
          </div>
        </div>
      )}
    </section>
    )}

    {/* 3. Study Journal Section */}
    {studentWorkspaceTab === 'rewards' && (
    <section className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 max-w-4xl mx-auto shadow-inner bg-gradient-to-br from-slate-900/50 to-orange-950/15">
      <h2 className="text-xl font-black mb-4 text-slate-200 flex items-center gap-2">
        📔 SỔ TAY NHẬT KÝ HỌC TẬP MIUPREP
      </h2>
      
      <form onSubmit={handleSaveDiary} className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-bold text-slate-400">{t('sdw_mood_q')}</span>
          <div className="flex gap-2">
            {STUDENT_DIARY_MOODS.map(mood => (
              <button
                type="button"
                key={mood}
                onClick={() => setDiaryMood(mood)}
                className={`text-2xl p-2 rounded-xl border transition-all cursor-pointer ${diaryMood === mood ? 'bg-orange-500/30 border-orange-500 scale-110 shadow' : 'border-slate-800 bg-slate-950/40 hover:scale-105'}`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <textarea
            value={studyDiary}
            onChange={(e) => setStudyDiary(e.target.value)}
            placeholder={t('sdw_journal_placeholder')}
            rows={2}
            className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-orange-500/80 transition-colors placeholder:text-slate-700 resize-none font-medium"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 rounded-xl transition-colors text-sm hover:scale-[0.99] active:scale-95 duration-100 shadow border-0 cursor-pointer"
          >
            {t('sdw_journal_button')}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-left">{t('sdw_journal_note')} nhé!</p>
      </form>

      <div className="max-h-48 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin text-left">
        {diaryList.map((entry, idx) => (
          <div key={idx} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-1 bg-slate-900/60 rounded-lg border border-white/5">{entry.mood}</span>
              <p className="text-xs font-semibold text-slate-300">{entry.text}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">{entry.date}</span>
          </div>
        ))}
      </div>
    </section>
    )}
    </div>
  );
}
