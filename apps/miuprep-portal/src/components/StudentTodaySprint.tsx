import { useMemo, useState } from 'react';
import type { LocalUser } from '@miuprep/db';
import type { LearningEventRecord } from '@miuprep/learning';
import type { ErrorNotebookQuestion } from '../lib/satPractice';
import {
  DAILY_STUDY_TIME_MODES,
  buildDailyLearningPlan,
  deriveDailyPlanCompletedStepsFromEvents,
  getTodayPlanDateKey,
  loadDailyPlanCompletedSteps,
  loadDailyPlanTimeMode,
  persistDailyPlanCompletedSteps,
  persistDailyPlanTimeMode,
  toggleDailyPlanStep,
  type DailyLoopStepAction,
  type DailyLoopStepId,
  type StudyTimeMode,
} from '../lib/studentProgress';
import {
  buildLearnerSnapshot,
  normalizeAssignedTracks,
  type PortalTrackInfo,
} from './UnifiedLearnerDashboard';

interface StudentTodaySprintProps {
  currentUser: LocalUser;
  tracks: PortalTrackInfo[];
  fishCoins: number;
  mouseTrapsCount: number;
  activeErrorQuestions: ErrorNotebookQuestion[];
  activeErrorQuestionCount: number;
  learningEvents?: LearningEventRecord[];
  onStartRepair: () => void;
  onOpenCourses: () => void;
  onOpenTutor: () => void;
  onDailyStepCompleted?: (stepId: DailyLoopStepId) => void;
  onDailyPlanCompleted?: () => void;
}

export default function StudentTodaySprint({
  currentUser,
  tracks,
  fishCoins,
  mouseTrapsCount,
  activeErrorQuestions,
  activeErrorQuestionCount,
  learningEvents = [],
  onStartRepair,
  onOpenCourses,
  onOpenTutor,
  onDailyStepCompleted,
  onDailyPlanCompleted,
}: StudentTodaySprintProps) {
  const dateKey = getTodayPlanDateKey();
  const [timeMode, setTimeMode] = useState<StudyTimeMode>(() => loadDailyPlanTimeMode(localStorage, currentUser.username));
  const [completedStepIds, setCompletedStepIds] = useState<DailyLoopStepId[]>(() =>
    loadDailyPlanCompletedSteps(localStorage, currentUser.username, dateKey),
  );
  const eventCompletedStepIds = useMemo(
    () => deriveDailyPlanCompletedStepsFromEvents(learningEvents, currentUser.username, dateKey),
    [currentUser.username, dateKey, learningEvents],
  );
  const effectiveCompletedStepIds = useMemo(
    () => uniqueStepIds([...completedStepIds, ...eventCompletedStepIds]),
    [completedStepIds, eventCompletedStepIds],
  );
  const assignedTracks = useMemo(() => normalizeAssignedTracks(currentUser), [currentUser]);
  const activeTracks = useMemo(
    () => tracks.filter((track) => assignedTracks.includes(track.id)),
    [assignedTracks, tracks],
  );
  const snapshot = useMemo(
    () => buildLearnerSnapshot(currentUser, activeTracks, fishCoins, mouseTrapsCount),
    [activeTracks, currentUser, fishCoins, mouseTrapsCount],
  );

  const firstError = activeErrorQuestions[0];
  const weakestProgram = snapshot.programSummaries.slice().sort((a, b) => a.score - b.score)[0];
  const hasDueErrors = activeErrorQuestionCount > 0;
  const nextStep = snapshot.learningPath.nextStep;
  const dailyPlan = useMemo(
    () =>
      buildDailyLearningPlan({
        username: currentUser.username,
        timeMode,
        completedStepIds: effectiveCompletedStepIds,
        averageMastery: snapshot.averageMastery,
        hasDueErrors,
        activeErrorCount: activeErrorQuestionCount,
        firstErrorStage: firstError?.stage,
        firstErrorText: firstError?.text,
        weakestProgramTitle: weakestProgram?.track.title,
        weakestLabel: weakestProgram?.weakestLabel,
        recommendationKind: snapshot.recommendation.kind,
        recommendationReason: snapshot.recommendation.reason,
        nextStepLabel: nextStep?.label,
        nextStepStatus: nextStep?.status,
        nextStepMastery: nextStep?.masteryScore,
        nextStepUnlocked: nextStep?.unlocked,
        dateKey,
      }),
    [
      activeErrorQuestionCount,
      currentUser.username,
      dateKey,
      effectiveCompletedStepIds,
      firstError?.stage,
      firstError?.text,
      hasDueErrors,
      nextStep?.label,
      nextStep?.masteryScore,
      nextStep?.status,
      nextStep?.unlocked,
      snapshot.averageMastery,
      snapshot.recommendation.kind,
      snapshot.recommendation.reason,
      timeMode,
      weakestProgram?.track.title,
      weakestProgram?.weakestLabel,
    ],
  );

  const primaryAction = hasDueErrors ? onStartRepair : onOpenCourses;

  const handleTimeModeChange = (nextMode: StudyTimeMode) => {
    setTimeMode(nextMode);
    persistDailyPlanTimeMode(localStorage, currentUser.username, nextMode);
  };

  const handleStepToggle = (stepId: DailyLoopStepId) => {
    const wasEffectivelyCompleted = effectiveCompletedStepIds.includes(stepId);
    const nextCompletedStepIds = toggleDailyPlanStep(completedStepIds, stepId);
    const nextEffectiveCompletedStepIds = uniqueStepIds([...nextCompletedStepIds, ...eventCompletedStepIds]);
    const nextPlan = buildDailyLearningPlan({
      username: currentUser.username,
      timeMode,
      completedStepIds: nextEffectiveCompletedStepIds,
      averageMastery: snapshot.averageMastery,
      hasDueErrors,
      activeErrorCount: activeErrorQuestionCount,
      firstErrorStage: firstError?.stage,
      firstErrorText: firstError?.text,
      weakestProgramTitle: weakestProgram?.track.title,
      weakestLabel: weakestProgram?.weakestLabel,
      recommendationKind: snapshot.recommendation.kind,
      recommendationReason: snapshot.recommendation.reason,
      nextStepLabel: nextStep?.label,
      nextStepStatus: nextStep?.status,
      nextStepMastery: nextStep?.masteryScore,
      nextStepUnlocked: nextStep?.unlocked,
      dateKey,
    });

    setCompletedStepIds(nextCompletedStepIds);
    persistDailyPlanCompletedSteps(localStorage, currentUser.username, nextCompletedStepIds, dateKey);
    if (!wasEffectivelyCompleted && nextEffectiveCompletedStepIds.includes(stepId)) onDailyStepCompleted?.(stepId);
    if (nextPlan.isCompleted && !dailyPlan.isCompleted) onDailyPlanCompleted?.();
  };

  const markAllDone = () => {
    const allStepIds = dailyPlan.steps.map((step) => step.id);
    setCompletedStepIds(allStepIds);
    persistDailyPlanCompletedSteps(localStorage, currentUser.username, allStepIds, dateKey);
    allStepIds
      .filter((stepId) => !effectiveCompletedStepIds.includes(stepId))
      .forEach((stepId) => onDailyStepCompleted?.(stepId));
    if (!dailyPlan.isCompleted) onDailyPlanCompleted?.();
  };

  const resetToday = () => {
    setCompletedStepIds([]);
    persistDailyPlanCompletedSteps(localStorage, currentUser.username, [], dateKey);
  };

  const runStepAction = (action: DailyLoopStepAction) => {
    if (action === 'courses') onOpenCourses();
    if (action === 'practice') onStartRepair();
    if (action === 'tutor') onOpenTutor();
  };

  return (
    <section className="max-w-6xl mx-auto bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl text-left overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2 py-1 rounded">
              Daily Learning Loop V2
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-950/60 border border-slate-800 px-2 py-1 rounded">
              {dailyPlan.completedStepCount}/{dailyPlan.totalStepCount} steps - {dailyPlan.completedMinutes}/{dailyPlan.totalMinutes} min
            </span>
            {dailyPlan.isCompleted && (
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-950 bg-emerald-300 px-2 py-1 rounded">
                Completed
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-50 m-0 tracking-tight">{dailyPlan.primaryTitle}</h2>
            <p className="text-sm text-slate-300 mt-2 mb-0 max-w-2xl leading-relaxed">{dailyPlan.primaryDetail}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-3xl">
            <MiniMetric label="Mastery" value={`${Math.round(snapshot.averageMastery)}%`} />
            <MiniMetric label="Due errors" value={String(activeErrorQuestionCount)} />
            <MiniMetric label="Coins" value={String(fishCoins)} />
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
              <span>Today target</span>
              <span>{dailyPlan.completionPercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all ${dailyPlan.isCompleted ? 'bg-emerald-300' : 'bg-emerald-500'}`}
                style={{ width: `${Math.max(4, dailyPlan.completionPercent)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 min-w-full lg:min-w-[340px] lg:max-w-[380px]">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 m-0">{dailyPlan.whyTitle}</p>
            <p className="text-xs text-slate-300 mt-2 mb-0 leading-relaxed">{dailyPlan.whyDetail}</p>
            {firstError && (
              <p className="text-[11px] text-slate-500 mt-3 mb-0 line-clamp-2">
                First due item: {firstError.text}
              </p>
            )}
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 m-0">{dailyPlan.unlockTitle}</p>
            <p className="text-xs text-emerald-50/80 mt-2 mb-0 leading-relaxed">{dailyPlan.unlockDetail}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mt-5 pt-5 border-t border-emerald-500/20">
        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-2 flex flex-wrap gap-2 lg:min-w-[300px]">
          {DAILY_STUDY_TIME_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleTimeModeChange(mode.id)}
              className={`flex-1 min-w-[84px] rounded-xl px-3 py-2 border cursor-pointer text-left transition-colors ${
                timeMode === mode.id
                  ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-500/70'
              }`}
            >
              <span className="block text-xs font-black">{mode.label}</span>
              <span className={`block text-[10px] font-bold mt-0.5 ${timeMode === mode.id ? 'text-slate-800' : 'text-slate-600'}`}>
                {mode.description}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <button
            type="button"
            onClick={primaryAction}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm px-5 py-3 rounded-2xl border-0 cursor-pointer shadow-lg shadow-emerald-950/30 transition-colors flex-1"
          >
            Start now
          </button>
          <button
            type="button"
            onClick={onOpenTutor}
            className="bg-slate-950 hover:bg-slate-900 text-slate-200 font-bold text-xs px-4 py-3 rounded-2xl border border-slate-800 cursor-pointer transition-colors flex-1 sm:flex-none"
          >
            Ask AI Tutor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mt-5">
        {dailyPlan.steps.map((step, index) => (
          <div
            key={step.id}
            className={`border rounded-2xl p-3 min-h-[190px] flex flex-col transition-colors ${
              step.completed
                ? 'bg-emerald-400/10 border-emerald-400/60'
                : 'bg-slate-950/45 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => handleStepToggle(step.id)}
                aria-pressed={step.completed}
                className={`w-8 h-8 rounded-xl border text-xs font-black cursor-pointer shrink-0 ${
                  step.completed
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                    : 'bg-slate-950 text-slate-500 border-slate-700 hover:text-emerald-300'
                }`}
                title={step.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {step.completed ? 'OK' : index + 1}
              </button>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{step.durationMinutes} min</span>
            </div>
            <h3 className="text-sm font-black text-slate-100 mt-3 mb-0 leading-snug">{step.title}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2 mb-3 flex-1">{step.detail}</p>
            <button
              type="button"
              onClick={() => runStepAction(step.action)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-[11px] px-3 py-2 rounded-xl border border-slate-800 cursor-pointer transition-colors"
            >
              {step.actionLabel}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 mt-5 pt-5 border-t border-emerald-500/20">
        <div className="bg-slate-950/45 border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 m-0">Loop logic</p>
          <p className="text-xs text-slate-300 mt-2 mb-0 leading-relaxed">
            Mini diagnostic finds the bottleneck, micro lesson repairs the exact link, guided practice builds the method,
            independent practice collects evidence, and error review protects retention.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[220px]">
          <button
            type="button"
            onClick={markAllDone}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm px-5 py-3 rounded-2xl border-0 cursor-pointer shadow-lg shadow-emerald-950/30 transition-colors"
          >
            Mark target done
          </button>
          <button
            type="button"
            onClick={resetToday}
            className="bg-slate-950 hover:bg-slate-900 text-slate-200 font-bold text-xs px-4 py-3 rounded-2xl border border-slate-800 cursor-pointer transition-colors"
          >
            Reset today
          </button>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className="text-xl font-black text-emerald-300 m-0 mt-1 font-mono">{value}</p>
    </div>
  );
}

function uniqueStepIds(values: DailyLoopStepId[]): DailyLoopStepId[] {
  return [...new Set(values)];
}
