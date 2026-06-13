import { useMemo } from 'react';
import { useTranslation } from '@miuprep/i18n/src/react';
import type { LocalUser } from '@miuprep/db';
import { createSeedKnowledgeGraph, type KnowledgeGraph } from '@miuprep/knowledge';
import {
  buildLearningPath,
  buildStudentModelFromLearningEvents,
  computeMastery,
  emptyStudentModel,
  recordAttempt,
  recommendNextAction,
  type ErrorCategory,
  type LearningEventRecord,
  type LearningPathEdge,
  type LearningPathNode,
  type LearningPathResult,
  type MasteryEstimate,
  type Recommendation,
  type StudentModel,
} from '@miuprep/learning';

type TFunc = (key: string, params?: Record<string, string | number>) => string;

export type PortalTrackId = 'math' | 'sat' | 'ielts' | 'cpe' | 'cae';
type ProgramId = 'vn_math_6_9' | 'sat' | 'ielts' | 'cpe' | 'cae';

export interface PortalTrackInfo {
  id: PortalTrackId;
  title: string;
  subtitle: string;
  icon: string;
}

interface UnifiedLearnerDashboardProps {
  currentUser: LocalUser;
  tracks: PortalTrackInfo[];
  fishCoins: number;
  mouseTrapsCount: number;
  errorQuestionCount: number;
  learningEvents?: LearningEventRecord[];
}

export interface ProgramSummary {
  track: PortalTrackInfo;
  programId: ProgramId;
  score: number;
  attempts: number;
  weakestLabel: string;
  status: string;
}

export interface LearnerSnapshot {
  state: StudentModel;
  mastery: MasteryEstimate[];
  recommendation: Recommendation;
  learningPath: LearningPathResult;
  programSummaries: ProgramSummary[];
  averageMastery: number;
  evidenceSource: 'live' | 'synthetic';
}

const TRACK_TO_PROGRAM: Record<PortalTrackId, ProgramId> = {
  math: 'vn_math_6_9',
  sat: 'sat',
  ielts: 'ielts',
  cpe: 'cpe',
  cae: 'cae',
};

export default function UnifiedLearnerDashboard({
  currentUser,
  tracks,
  fishCoins,
  mouseTrapsCount,
  errorQuestionCount,
  learningEvents = [],
}: UnifiedLearnerDashboardProps) {
  const { t } = useTranslation();
  const assignedTrackIds = useMemo(() => normalizeAssignedTracks(currentUser), [currentUser]);
  const activeTracks = tracks.filter((track) => assignedTrackIds.includes(track.id));
  const snapshot = useMemo(
    () => buildLearnerSnapshotFromLiveEvents(currentUser, activeTracks, learningEvents, fishCoins, mouseTrapsCount),
    [activeTracks, currentUser, fishCoins, learningEvents, mouseTrapsCount],
  );
  const graph = useMemo(() => createSeedKnowledgeGraph(), []);
  const nextStep = snapshot.learningPath.nextStep;

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-6xl mx-auto shadow-xl text-left space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400 bg-orange-950/40 border border-orange-900/50 px-2 py-1 rounded">
              {t('uld_badge_learning_map')}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              {t('uld_badge_skill_links')}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300 bg-sky-950/40 border border-sky-900/50 px-2 py-1 rounded">
              {snapshot.evidenceSource === 'live' ? t('uld_badge_live_progress') : t('uld_badge_preview_mode')}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100 m-0 mt-3">{t('uld_growth_map_title')}</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            {t('uld_growth_map_subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-full lg:min-w-[520px]">
          <MetricTile label={t('uld_metric_programs')} value={String(activeTracks.length)} />
          <MetricTile label={t('uld_metric_avg_mastery')} value={`${Math.round(snapshot.averageMastery)}%`} />
          <MetricTile label={t('uld_metric_evidence')} value={String(snapshot.state.attempts.length)} />
          <MetricTile label={t('uld_metric_error_notebook')} value={String(errorQuestionCount)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {snapshot.programSummaries.map((summary) => (
          <div key={summary.programId} className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{summary.track.subtitle}</span>
                <h3 className="text-sm font-black text-slate-100 m-0 mt-1">{summary.track.title}</h3>
              </div>
              <span className="text-2xl">{summary.track.icon}</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500">{t('uld_card_mastery')}</span>
                <span className="text-emerald-400 font-mono">{Math.round(summary.score)}%</span>
              </div>
              <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(4, Math.min(100, summary.score))}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-3 mb-0">
                {summaryStatusLabel(summary.status, t)} · {t('uld_card_evidence_count', { count: summary.attempts })} · {t('uld_card_weakest_prefix')} <span className="text-slate-300">{summaryWeakestLabel(summary.weakestLabel, t)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 border-t border-slate-850 pt-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest m-0">{t('uld_best_next_move')}</h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{snapshot.recommendation.reason}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
            <p className="text-sm font-black text-slate-100 m-0">{recommendationTitle(snapshot.recommendation, t)}</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-0">{recommendationDetail(snapshot.recommendation, graph, t)}</p>
            {nextStep && (
              <div className="mt-4 pt-4 border-t border-slate-850">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('uld_next_unlock')}</span>
                <p className="text-sm font-bold text-slate-200 mt-1 mb-0">{nextStep.label}</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-0">
                  {statusLabel(nextStep.status, t)} · {Math.round(nextStep.masteryScore)}% · {nextStep.unlocked ? t('uld_state_open') : t('uld_state_locked')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest m-0">{t('uld_path_to_unlock')}</h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('uld_steps_count', { count: snapshot.learningPath.steps.length })}</span>
          </div>
          <div className="space-y-2">
            {snapshot.learningPath.steps.map((step) => (
              <div key={`${step.rank}-${step.id}`} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${step.unlocked ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {step.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 truncate m-0">{step.label}</p>
                  <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                    {statusLabel(step.status, t)} · {Math.round(step.masteryScore)}% · {t('uld_step_attempts', { count: step.attempts })}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase ${step.unlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {step.unlocked ? t('uld_state_open') : t('uld_state_locked')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className="text-xl font-black text-slate-100 m-0 mt-1 font-mono">{value}</p>
    </div>
  );
}

export function buildLearnerSnapshot(
  currentUser: LocalUser,
  tracks: PortalTrackInfo[],
  fishCoins: number,
  mouseTrapsCount: number,
): LearnerSnapshot {
  const graph = createSeedKnowledgeGraph();
  const targetProgramIds = tracks.map((track) => TRACK_TO_PROGRAM[track.id]);
  let state = emptyStudentModel(currentUser.id || currentUser.username, targetProgramIds);
  const correctnessBias = clamp(0.52 + fishCoins / 900 - mouseTrapsCount * 0.035, 0.35, 0.92);
  const userSeed = stableSeed(currentUser.username);

  targetProgramIds.forEach((programId, programIndex) => {
    const targets = programTargets(graph, programId).slice(0, 5);
    targets.forEach((nodeId, nodeIndex) => {
      for (let attemptIndex = 0; attemptIndex < 3; attemptIndex += 1) {
        const nodeMeta = nodeAttemptMeta(graph, nodeId);
        const correctnessRoll = ((userSeed + programIndex * 7 + nodeIndex * 3 + attemptIndex * 2) % 10) / 10;
        const correct = correctnessRoll < correctnessBias || (attemptIndex === 2 && correctnessRoll < correctnessBias + 0.12);
        const result = recordAttempt(state, {
          itemId: `portal.${programId}.${slugId(nodeId)}.${attemptIndex}`,
          domainId: nodeMeta.domainId,
          programId,
          conceptIds: nodeMeta.conceptIds,
          skillIds: nodeMeta.skillIds,
          correct,
          difficulty: attemptIndex === 2 ? 'hard' : 'medium',
          mode: attemptIndex === 0 ? 'diagnostic' : 'practice',
          answeredAt: demoAttemptDate(programIndex, nodeIndex, attemptIndex),
          errorCategories: correct ? ['none'] : errorCategoriesForNode(nodeId),
        });
        state = result.state;
      }
    });
  });

  return buildLearnerSnapshotFromState(state, tracks, targetProgramIds, 'synthetic');
}

export function buildLearnerSnapshotFromLiveEvents(
  currentUser: LocalUser,
  tracks: PortalTrackInfo[],
  learningEvents: LearningEventRecord[] = [],
  fishCoins: number,
  mouseTrapsCount: number,
): LearnerSnapshot {
  const targetProgramIds = tracks.map((track) => TRACK_TO_PROGRAM[track.id]);
  const canonicalLearnerId = currentUser.username || currentUser.id;
  const learnerEvents = learningEvents
    .filter((event) => eventBelongsToUser(event, currentUser))
    .map((event) => ({ ...event, learnerId: canonicalLearnerId }));
  if (!learnerEvents.length) return buildLearnerSnapshot(currentUser, tracks, fishCoins, mouseTrapsCount);

  const report = buildStudentModelFromLearningEvents(learnerEvents, {
    learnerId: canonicalLearnerId,
    targetProgramIds,
  });
  return report.acceptedAttempts > 0
    ? buildLearnerSnapshotFromState(report.state, tracks, targetProgramIds, 'live')
    : buildLearnerSnapshot(currentUser, tracks, fishCoins, mouseTrapsCount);
}

function buildLearnerSnapshotFromState(
  state: StudentModel,
  tracks: PortalTrackInfo[],
  targetProgramIds: ProgramId[],
  evidenceSource: LearnerSnapshot['evidenceSource'],
): LearnerSnapshot {
  const graph = createSeedKnowledgeGraph();
  const mastery = computeMastery(state);
  const recommendation = recommendNextAction(state, { diagnosticMinAttempts: 8 });
  const learningPath = buildLearningPath(mastery, graphNodes(graph), graphEdges(graph), {
    targetIds: pickPathTargets(graph, targetProgramIds, recommendation, mastery),
    includeSupportEdges: true,
    maxSteps: 5,
  });
  const programSummaries = tracks.map((track) => programSummary(graph, track, TRACK_TO_PROGRAM[track.id], mastery));
  const averageMastery = programSummaries.length
    ? programSummaries.reduce((sum, item) => sum + item.score, 0) / programSummaries.length
    : 0;

  return {
    state,
    mastery,
    recommendation,
    learningPath,
    programSummaries,
    averageMastery,
    evidenceSource,
  };
}

export function normalizeAssignedTracks(user: LocalUser): PortalTrackId[] {
  const source = user.assignedTracks?.length ? user.assignedTracks : [user.assignedTrack || 'math'];
  const allowed = new Set<PortalTrackId>(['math', 'sat', 'ielts', 'cpe', 'cae']);
  const normalized = source.filter((track): track is PortalTrackId => allowed.has(track as PortalTrackId));
  return normalized.length ? normalized : ['math'];
}

function eventBelongsToUser(event: LearningEventRecord, user: LocalUser): boolean {
  const learnerId = String(event.learnerId || '').toLowerCase();
  const candidates = [user.username, user.id]
    .map((value) => String(value || '').toLowerCase())
    .filter(Boolean);
  return candidates.some((candidate) => learnerId === candidate || learnerId === `user-${candidate}` || learnerId.endsWith(`-${candidate}`));
}

function programTargets(graph: KnowledgeGraph, programId: ProgramId): string[] {
  const programMap = resolveProgramMap(graph, programId);
  const objectiveIds = programMap?.entryObjectiveIds?.length ? programMap.entryObjectiveIds : programMap?.objectiveIds || [];
  const objectiveTargets = objectiveIds.flatMap((objectiveId) => {
    const objective = graph.objectives.find((item) => item.id === objectiveId);
    return objective ? [...objective.conceptIds, ...objective.skillIds] : [];
  });
  return uniqueStrings(objectiveTargets.length ? objectiveTargets : [...(programMap?.conceptIds || []), ...(programMap?.skillIds || [])]);
}

function resolveProgramMap(graph: KnowledgeGraph, programId: ProgramId) {
  return graph.programMaps.find((item) => item.programId === programId) || (programId === 'cae' ? graph.programMaps.find((item) => item.programId === 'cpe') : undefined);
}

function nodeAttemptMeta(graph: KnowledgeGraph, nodeId: string) {
  const concept = graph.concepts.find((item) => item.id === nodeId);
  if (concept) {
    return {
      domainId: concept.domainId,
      conceptIds: [concept.id],
      skillIds: graph.skills.filter((skill) => skill.conceptIds.includes(concept.id)).slice(0, 1).map((skill) => skill.id),
    };
  }
  const skill = graph.skills.find((item) => item.id === nodeId);
  if (skill) {
    return {
      domainId: skill.domainId,
      conceptIds: skill.conceptIds,
      skillIds: [skill.id],
    };
  }
  return {
    domainId: nodeId.startsWith('math.') ? 'mathematics' : 'english_core',
    conceptIds: nodeId.startsWith('math.') || nodeId.startsWith('eng.') ? [nodeId] : [],
    skillIds: [],
  };
}

function graphNodes(graph: KnowledgeGraph): LearningPathNode[] {
  return [
    ...graph.concepts.map((concept) => ({ id: concept.id, domainId: concept.domainId, scope: 'concept', label: concept.name })),
    ...graph.skills.map((skill) => ({ id: skill.id, domainId: skill.domainId, scope: 'skill', label: skill.name })),
  ];
}

function graphEdges(graph: KnowledgeGraph): LearningPathEdge[] {
  const graphEdges = graph.edges.map((edge) => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    type: edge.type,
    weight: edge.weight,
  }));
  const conceptToSkillEdges = graph.skills.flatMap((skill) =>
    skill.conceptIds.map((conceptId) => ({
      id: `edge.${conceptId}.${skill.id}`,
      from: conceptId,
      to: skill.id,
      type: 'supports',
      weight: 0.6,
    })),
  );
  return [...graphEdges, ...conceptToSkillEdges];
}

function pickPathTargets(
  graph: KnowledgeGraph,
  programIds: ProgramId[],
  recommendation: Recommendation,
  mastery: MasteryEstimate[],
): string[] {
  const recommendationTargets = [...recommendation.conceptIds, ...recommendation.skillIds];
  if (recommendationTargets.length) return uniqueStrings(recommendationTargets).slice(0, 3);
  const weakTargets = mastery.slice(0, 3).map((row) => row.id);
  if (weakTargets.length) return weakTargets;
  return uniqueStrings(programIds.flatMap((programId) => programTargets(graph, programId))).slice(0, 3);
}

function programSummary(graph: KnowledgeGraph, track: PortalTrackInfo, programId: ProgramId, mastery: MasteryEstimate[]): ProgramSummary {
  const programMap = resolveProgramMap(graph, programId);
  const scopedIds = new Set([...(programMap?.conceptIds || []), ...(programMap?.skillIds || [])]);
  const rows = mastery.filter((row) => scopedIds.has(row.id));
  const score = rows.length ? rows.reduce((sum, row) => sum + row.score, 0) / rows.length : 0;
  const weakest = rows.slice().sort((a, b) => a.score - b.score || b.attempts - a.attempts)[0];

  return {
    track,
    programId,
    score,
    attempts: rows.reduce((sum, row) => sum + row.attempts, 0),
    weakestLabel: weakest ? labelForId(weakest.id, graph) : 'Waiting for evidence',
    status: score >= 80 ? 'Stable' : score >= 60 ? 'Building' : 'Needs repair',
  };
}

function recommendationTitle(recommendation: Recommendation, t: TFunc): string {
  if (recommendation.kind === 'diagnostic') return t('uld_rec_title_diagnostic');
  if (recommendation.kind === 'review') return t('uld_rec_title_review');
  if (recommendation.kind === 'practice') return t('uld_rec_title_practice');
  return t('uld_rec_title_challenge');
}

function recommendationDetail(recommendation: Recommendation, graph: KnowledgeGraph, t: TFunc): string {
  const labels = [...recommendation.conceptIds, ...recommendation.skillIds].map((id) => labelForId(id, graph));
  if (labels.length) return t('uld_rec_detail_with_target', { detail: recommendation.detail, labels: labels.join(', ') });
  return recommendation.detail;
}

function labelForId(id: string, graph: KnowledgeGraph): string {
  return graph.concepts.find((item) => item.id === id)?.name || graph.skills.find((item) => item.id === id)?.name || id;
}

function statusLabel(status: string, t: TFunc): string {
  if (status === 'not_started') return t('uld_status_not_started');
  if (status === 'collect_evidence') return t('uld_status_collect_evidence');
  if (status === 'repair') return t('uld_status_repair');
  if (status === 'building' || status === 'build') return t('uld_status_build');
  if (status === 'hard_proof') return t('uld_status_hard_proof');
  if (status === 'stable') return t('uld_status_stable');
  return status;
}

function summaryStatusLabel(status: string, t: TFunc): string {
  if (status === 'Stable') return t('uld_summary_status_stable');
  if (status === 'Building') return t('uld_summary_status_building');
  if (status === 'Needs repair') return t('uld_summary_status_needs_repair');
  return status;
}

function summaryWeakestLabel(label: string, t: TFunc): string {
  if (label === 'Waiting for evidence') return t('uld_weakest_waiting');
  return label;
}

function errorCategoriesForNode(nodeId: string): ErrorCategory[] {
  if (nodeId.includes('factor') || nodeId.includes('quadratic') || nodeId.includes('linear')) return ['algebra_transform'];
  if (nodeId.includes('geometry')) return ['wrong_formula'];
  if (nodeId.includes('inference')) return ['inference'];
  if (nodeId.includes('grammar') || nodeId.includes('sentence') || nodeId.includes('tense')) return ['grammar'];
  if (nodeId.includes('vocabulary') || nodeId.includes('collocation') || nodeId.includes('word')) return ['vocabulary'];
  return ['strategy'];
}

function demoAttemptDate(programIndex: number, nodeIndex: number, attemptIndex: number): string {
  const base = Date.UTC(2026, 5, 2, 9, 0, 0);
  return new Date(base - (programIndex * 5 + nodeIndex * 2 + attemptIndex) * 60 * 60 * 1000).toISOString();
}

function stableSeed(value: string): number {
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) seed = (seed * 31 + value.charCodeAt(index)) % 997;
  return seed;
}

function slugId(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
