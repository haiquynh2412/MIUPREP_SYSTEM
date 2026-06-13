import { useMemo, useState } from 'react';
import type { LocalUser } from '@miuprep/db';
import type { LearningEventRecord } from '@miuprep/learning';
import {
  buildMathRemediationPlan,
  recommendMath9LessonTemplates,
  type Math1012ClusterRecommendation,
  type MathBackfillRecommendation,
  type MathLessonTemplate,
  type MathRemediationPlan,
  type LessonTemplateStage,
} from '../lib/lessonTemplates';
import type { LessonTemplateAction } from '../lib/studentProgress';
import {
  buildLearnerSnapshotFromLiveEvents,
  normalizeAssignedTracks,
  type PortalTrackInfo,
} from './UnifiedLearnerDashboard';

interface MathLessonTemplatePanelProps {
  currentUser: LocalUser;
  tracks: PortalTrackInfo[];
  fishCoins: number;
  mouseTrapsCount: number;
  learningEvents?: LearningEventRecord[];
  onOpenPractice: () => void;
  onOpenTutor: () => void;
  onTemplateAction?: (template: MathLessonTemplate, action: LessonTemplateAction) => void;
}

export default function MathLessonTemplatePanel({
  currentUser,
  tracks,
  fishCoins,
  mouseTrapsCount,
  learningEvents = [],
  onOpenPractice,
  onOpenTutor,
  onTemplateAction,
}: MathLessonTemplatePanelProps) {
  const assignedTrackIds = useMemo(() => normalizeAssignedTracks(currentUser), [currentUser]);
  const activeTracks = useMemo(
    () => tracks.filter((track) => assignedTrackIds.includes(track.id)),
    [assignedTrackIds, tracks],
  );
  const snapshot = useMemo(
    () => buildLearnerSnapshotFromLiveEvents(currentUser, activeTracks, learningEvents, fishCoins, mouseTrapsCount),
    [activeTracks, currentUser, fishCoins, learningEvents, mouseTrapsCount],
  );
  const mathSummary = snapshot.programSummaries.find((summary) => summary.track.id === 'math');
  const mathNextStep =
    snapshot.learningPath.steps.find((step) => step.domainId === 'mathematics') || snapshot.learningPath.nextStep;
  const weakConceptIds = uniqueIds([
    ...snapshot.recommendation.conceptIds,
    ...(mathNextStep?.scope === 'concept' ? [mathNextStep.id] : []),
  ]).filter((id) => id.startsWith('math.'));
  const weakSkillIds = uniqueIds([
    ...snapshot.recommendation.skillIds,
    ...(mathNextStep?.scope === 'skill' ? [mathNextStep.id] : []),
  ]).filter((id) => id.startsWith('math.'));
  const weakLabel = mathSummary?.weakestLabel || mathNextStep?.label || 'Math 9 repair';
  const remediationPlan = useMemo(
    () =>
      buildMathRemediationPlan({
        weakConceptIds,
        weakSkillIds,
        weakLabel,
        errorText: snapshot.recommendation.reason,
        retryAttempts: mouseTrapsCount,
        templateLimit: 4,
        backfillLimit: 5,
      }),
    [mouseTrapsCount, snapshot.recommendation.reason, weakConceptIds, weakLabel, weakSkillIds],
  );
  const recommendations = remediationPlan.templates.length
    ? remediationPlan.templates
    : recommendMath9LessonTemplates({ weakConceptIds, weakSkillIds, weakLabel, limit: 4 });
  const [selectedTemplateId, setSelectedTemplateId] = useState(recommendations[0]?.template.id || '');
  const selectedRecommendation =
    recommendations.find((item) => item.template.id === selectedTemplateId) || recommendations[0];

  if (!selectedRecommendation) return null;

  const selectedTemplate = selectedRecommendation.template;

  return (
    <section className="bg-slate-950/70 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/20 text-left space-y-6 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">
              LessonTemplate core
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
              Math 9 repair
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-3 mb-2">
            Lop hoc sua loi theo Knowledge Graph
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed m-0">
            Moi lesson gom concept summary, worked example, guided questions, independent set, mixed review va
            reflection. He thong uu tien template theo weakest concept/skill hien tai, de hoc sinh hoc nhanh nhung khong
            bi hong mat xich.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:min-w-[520px]">
          <LessonMetric label="Weak focus" value={compactLabel(weakLabel)} />
          <LessonMetric label="Target" value={`${selectedTemplate.masteryTarget}%`} />
          <LessonMetric label="Minutes" value={String(selectedTemplate.estimatedMinutes)} />
          <LessonMetric label="Backfill" value={String(remediationPlan.backfillUnits.length)} />
          <LessonMetric label="Split" value={compactLabel(remediationPlan.errorSplit.label)} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.55fr] gap-5 min-w-0">
        <div className="space-y-3 min-w-0">
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
                    ? 'bg-emerald-500/10 border-emerald-400/50 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-emerald-300' : 'text-slate-500'}`}
                    >
                      Rank {index + 1} · {recommendation.matchReason}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-100 mt-1 mb-1">{template.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed m-0">{template.focus}</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-1 shrink-0">
                    {template.estimatedMinutes}m
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <TinyStat label="Concepts" value={String(template.conceptIds.length)} />
                  <TinyStat label="Skills" value={String(template.skillIds.length)} />
                  <TinyStat label="Prereq" value={String(template.prerequisiteIds.length)} />
                </div>
              </button>
            );
          })}
        </div>

        <LessonTemplateDetail
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

function LessonTemplateDetail({
  template,
  matchReason,
  remediationPlan,
  onOpenPractice,
  onOpenTutor,
  onTemplateAction,
}: {
  template: MathLessonTemplate;
  matchReason: string;
  remediationPlan: MathRemediationPlan;
  onOpenPractice: () => void;
  onOpenTutor: () => void;
  onTemplateAction?: (template: MathLessonTemplate, action: LessonTemplateAction) => void;
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-5 min-w-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{matchReason}</span>
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
            className="px-4 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-colors"
          >
            Open practice
          </button>
          <button
            type="button"
            onClick={() => {
              onTemplateAction?.(template, 'open_tutor');
              onOpenTutor();
            }}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-xs font-black uppercase tracking-wider hover:border-emerald-400/40 transition-colors"
          >
            Ask AI Tutor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 min-w-0">
        <div className="space-y-2 min-w-0">
          {template.stages.map((stage, index) => (
            <LessonStageRow key={stage.id} stage={stage} index={index} />
          ))}
        </div>

        <div className="space-y-4 min-w-0">
          <InfoBox
            title="Error split"
            items={[
              remediationPlan.errorSplit.repairMode,
              `CASIO check: ${remediationPlan.errorSplit.casioCheck}`,
              `Reasoning check: ${remediationPlan.errorSplit.reasoningCheck}`,
            ]}
          />
          <BackfillQueue items={remediationPlan.backfillUnits.slice(0, 3)} />
          {remediationPlan.proofScaffold && <ProofScaffoldBox plan={remediationPlan.proofScaffold} />}
          <InfoBox
            title="Math 10-12 readiness"
            items={[remediationPlan.math1012Readiness.focusCluster, remediationPlan.math1012Readiness.guardrail]}
          />
          <Math1012ExpansionQueue items={remediationPlan.math1012Clusters.slice(0, 3)} />
          <InfoBox title="Common traps" items={template.commonTraps} />
          <InfoBox
            title="Quick check"
            items={[`${template.quickCheck.prompt} -> ${template.quickCheck.expectedMove}`]}
          />
          <InfoBox
            title="Graph links"
            items={[
              `Concepts: ${template.conceptIds.join(', ')}`,
              `Skills: ${template.skillIds.join(', ')}`,
              `Prerequisites: ${template.prerequisiteIds.join(', ')}`,
              `Remediation: ${template.remediationObjectiveIds.join(', ')}`,
            ]}
          />
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Reflection</p>
            <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-0">{template.reflectionPrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackfillQueue({ items }: { items: MathBackfillRecommendation[] }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Prerequisite backfill</p>
        <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
          28-unit map
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={item.unit.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-100 m-0">{item.unit.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-0">
                  {item.matchReason} · {item.unit.cluster}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-2 mb-0">{item.unit.repairMove}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Math1012ExpansionQueue({ items }: { items: Math1012ClusterRecommendation[] }) {
  return (
    <div className="bg-slate-950/60 border border-sky-500/20 rounded-2xl p-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Math 10-12 expansion</p>
        <span className="text-[10px] font-black text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-0.5">
          cluster import
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={item.cluster.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-300 flex items-center justify-center text-[10px] font-black shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black text-slate-100 m-0">{item.cluster.title}</p>
                  <span className="text-[9px] font-black uppercase tracking-wider text-sky-200 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-0.5">
                    {item.cluster.status.replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 mb-0">
                  {item.matchReason} - {item.cluster.gradeBand} - {item.cluster.cluster}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-2 mb-0">{item.cluster.importGuard}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProofScaffoldBox({ plan }: { plan: NonNullable<MathRemediationPlan['proofScaffold']> }) {
  return (
    <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 m-0">{plan.title}</p>
      <div className="mt-3 space-y-2">
        {plan.steps.map((step, index) => (
          <div key={step.prompt} className="grid grid-cols-[28px_1fr] gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black">
              {index + 1}
            </span>
            <div>
              <p className="text-xs font-black text-slate-100 m-0">{step.prompt}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 mb-0">{step.expectedMove}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-emerald-300/90 leading-relaxed mt-3 mb-0">{plan.finalProofRule}</p>
    </div>
  );
}

function LessonStageRow({ stage, index }: { stage: LessonTemplateStage; index: number }) {
  return (
    <div className="grid grid-cols-[36px_1fr] gap-3 bg-slate-950/55 border border-slate-800 rounded-2xl p-3">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-black font-mono">
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
        <p className="text-[11px] text-emerald-300/90 leading-relaxed mt-1 mb-0">{stage.studentAction}</p>
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
            <span className="text-emerald-300 font-black">-</span>
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
