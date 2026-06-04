import { useMemo, useState } from 'react';
import type { LocalUser } from '@miuprep/db';
import type { LearningEventRecord } from '@miuprep/learning';
import {
  buildEnglishCoreRemediationPlan,
  recommendEnglishCoreLessonTemplates,
  type EnglishCoreLessonTemplate,
  type EnglishCoreRemediationPlan,
  type LessonTemplateStage,
} from '../lib/lessonTemplates';
import type { LessonTemplateAction } from '../lib/studentProgress';
import {
  buildLearnerSnapshotFromLiveEvents,
  normalizeAssignedTracks,
  type PortalTrackInfo,
} from './UnifiedLearnerDashboard';

interface EnglishCoreLessonTemplatePanelProps {
  currentUser: LocalUser;
  tracks: PortalTrackInfo[];
  fishCoins: number;
  mouseTrapsCount: number;
  learningEvents?: LearningEventRecord[];
  onOpenPractice: () => void;
  onOpenTutor: () => void;
  onTemplateAction?: (template: EnglishCoreLessonTemplate, action: LessonTemplateAction) => void;
}

const ENGLISH_TRACK_IDS = new Set(['ielts', 'cpe', 'cae', 'sat']);

export default function EnglishCoreLessonTemplatePanel({
  currentUser,
  tracks,
  fishCoins,
  mouseTrapsCount,
  learningEvents = [],
  onOpenPractice,
  onOpenTutor,
  onTemplateAction,
}: EnglishCoreLessonTemplatePanelProps) {
  const assignedTrackIds = useMemo(() => normalizeAssignedTracks(currentUser), [currentUser]);
  const activeTracks = useMemo(
    () => tracks.filter((track) => assignedTrackIds.includes(track.id)),
    [assignedTrackIds, tracks],
  );
  const activeEnglishTracks = activeTracks.filter((track) => ENGLISH_TRACK_IDS.has(track.id));
  const snapshot = useMemo(
    () => buildLearnerSnapshotFromLiveEvents(currentUser, activeTracks, learningEvents, fishCoins, mouseTrapsCount),
    [activeTracks, currentUser, fishCoins, learningEvents, mouseTrapsCount],
  );

  const englishSummary = snapshot.programSummaries.find((summary) => ENGLISH_TRACK_IDS.has(summary.track.id));
  const englishNextStep = snapshot.learningPath.steps.find((step) => step.domainId === 'english_core');
  const weakConceptIds = uniqueIds([
    ...snapshot.recommendation.conceptIds,
    ...(englishNextStep?.scope === 'concept' ? [englishNextStep.id] : []),
  ]).filter((id) => id.startsWith('eng.'));
  const weakSkillIds = uniqueIds([
    ...snapshot.recommendation.skillIds,
    ...(englishNextStep?.scope === 'skill' ? [englishNextStep.id] : []),
  ]).filter((id) => id.startsWith('eng.'));
  const weakLabel = englishSummary?.weakestLabel || englishNextStep?.label || 'English Core repair';
  const remediationPlan = useMemo(
    () =>
      buildEnglishCoreRemediationPlan({
        weakConceptIds,
        weakSkillIds,
        weakLabel,
        errorText: snapshot.recommendation.reason,
        limit: 6,
      }),
    [snapshot.recommendation.reason, weakConceptIds, weakLabel, weakSkillIds],
  );
  const recommendations = remediationPlan.templates.length
    ? remediationPlan.templates
    : recommendEnglishCoreLessonTemplates({ weakConceptIds, weakSkillIds, weakLabel, limit: 6 });
  const [selectedTemplateId, setSelectedTemplateId] = useState(recommendations[0]?.template.id || '');
  const selectedRecommendation = recommendations.find((item) => item.template.id === selectedTemplateId) || recommendations[0];

  if (!activeEnglishTracks.length) return null;
  if (!selectedRecommendation) return null;

  const selectedTemplate = selectedRecommendation.template;

  return (
    <section className="bg-slate-950/70 border border-sky-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-sky-950/20 text-left space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2 py-1 rounded">
              English Core
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
              Reusable for IELTS/CAE/CPE/SAT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-3 mb-2">English repair loop theo Knowledge Graph</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed m-0">
            English Core tach grammar, vocabulary, collocation, reading, listening, writing va speaking thanh lesson loop ngan.
            Moi loop co transfer task de hoc sinh dua kien thuc vao de thi nhanh hon.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:min-w-[520px]">
          <LessonMetric label="Weak focus" value={compactLabel(weakLabel)} />
          <LessonMetric label="Error lens" value={compactLabel(remediationPlan.errorLens.label)} />
          <LessonMetric label="Target" value={`${selectedTemplate.masteryTarget}%`} />
          <LessonMetric label="Minutes" value={String(selectedTemplate.estimatedMinutes)} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.55fr] gap-5">
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => {
            const template = recommendation.template;
            const isSelected = template.id === selectedTemplate.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full text-left border rounded-2xl p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-400/50 shadow-lg shadow-sky-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-sky-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-sky-300' : 'text-slate-500'}`}>
                      Rank {index + 1} - {recommendation.matchReason}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-100 mt-1 mb-1">{template.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed m-0">{template.focus}</p>
                  </div>
                  <span className="text-[10px] font-black text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-1 shrink-0">
                    {template.estimatedMinutes}m
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <TinyStat label="Area" value={compactLabel(template.area)} />
                  <TinyStat label="Exams" value={String(template.examLayers.length)} />
                  <TinyStat label="Skills" value={String(template.skillIds.length)} />
                </div>
              </button>
            );
          })}
        </div>

        <EnglishTemplateDetail
          template={selectedTemplate}
          matchReason={selectedRecommendation.matchReason}
          remediationPlan={remediationPlan}
          onOpenPractice={onOpenPractice}
          onOpenTutor={onOpenTutor}
          onTemplateAction={onTemplateAction}
        />
      </div>
    </section>
  );
}

function EnglishTemplateDetail({
  template,
  matchReason,
  remediationPlan,
  onOpenPractice,
  onOpenTutor,
  onTemplateAction,
}: {
  template: EnglishCoreLessonTemplate;
  matchReason: string;
  remediationPlan: EnglishCoreRemediationPlan;
  onOpenPractice: () => void;
  onOpenTutor: () => void;
  onTemplateAction?: (template: EnglishCoreLessonTemplate, action: LessonTemplateAction) => void;
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">{matchReason}</span>
          <h3 className="text-xl font-black text-slate-100 mt-1 mb-1">{template.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed m-0">{template.focus}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onTemplateAction?.(template, 'open_practice');
              onOpenPractice();
            }}
            className="px-4 py-2 rounded-xl border border-sky-400/40 bg-sky-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-sky-400 transition-colors"
          >
            Open practice
          </button>
          <button
            type="button"
            onClick={() => {
              onTemplateAction?.(template, 'open_tutor');
              onOpenTutor();
            }}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-xs font-black uppercase tracking-wider hover:border-sky-400/40 transition-colors"
          >
            Ask AI Tutor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="space-y-2">
          {template.stages.map((stage, index) => (
            <LessonStageRow key={stage.id} stage={stage} index={index} />
          ))}
        </div>

        <div className="space-y-4">
          <InfoBox title="Error lens" items={[
            remediationPlan.errorLens.repairMode,
            remediationPlan.errorLens.evidenceCheck,
          ]} />
          <InfoBox title="Micro cycle" items={remediationPlan.microCycle} />
          <InfoBox title="Transfer targets" items={remediationPlan.transferTargets} />
          <InfoBox title="Common traps" items={template.commonTraps} />
          <InfoBox title="Quick check" items={[`${template.quickCheck.prompt} -> ${template.quickCheck.expectedMove}`]} />
          <InfoBox title="Graph links" items={[
            `Concepts: ${template.conceptIds.join(', ')}`,
            `Skills: ${template.skillIds.join(', ')}`,
            `Remediation: ${template.remediationObjectiveIds.join(', ')}`,
          ]} />
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Transfer task</p>
            <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-0">{template.transferTask.prompt}</p>
            <p className="text-[11px] text-sky-300/90 leading-relaxed mt-2 mb-0">{template.transferTask.expectedMove}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonStageRow({ stage, index }: { stage: LessonTemplateStage; index: number }) {
  return (
    <div className="grid grid-cols-[36px_1fr] gap-3 bg-slate-950/55 border border-slate-800 rounded-2xl p-3">
      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-black font-mono">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-black text-slate-100 m-0">{stage.title}</h4>
          <span className="text-[10px] font-black text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5">
            {stage.durationMinutes}m
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mt-2 mb-0">{stage.teacherMove}</p>
        <p className="text-[11px] text-sky-300/90 leading-relaxed mt-1 mb-0">{stage.studentAction}</p>
      </div>
    </div>
  );
}

function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{title}</p>
      <ul className="mt-3 mb-0 space-y-2 pl-0 list-none">
        {items.map((item) => (
          <li key={item} className="text-xs text-slate-300 leading-relaxed flex gap-2">
            <span className="text-sky-300 font-black">-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LessonMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 min-h-[72px]">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className="text-base sm:text-lg font-black text-slate-100 m-0 mt-1 leading-tight">{value}</p>
    </div>
  );
}

function TinyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/55 border border-slate-800 rounded-xl px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 m-0">{label}</p>
      <p className="text-sm font-black text-slate-100 m-0 mt-0.5 font-mono">{value}</p>
    </div>
  );
}

function uniqueIds(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function compactLabel(value: string): string {
  if (value.length <= 24) return value;
  return `${value.slice(0, 21)}...`;
}
