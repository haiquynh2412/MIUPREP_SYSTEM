import { useMemo, type ReactNode } from 'react';
import type { SystemLog } from '@miuprep/db';
import { createSeedKnowledgeGraph, type KnowledgeGraph, type ProgramMap } from '@miuprep/knowledge';
import type { LearningEventRecord } from '@miuprep/learning';
import { ENGLISH_CONTENT_QUALITY_SNAPSHOT } from '../data/contentQualitySnapshot';

type PortalTrackId = 'math' | 'sat' | 'ielts' | 'cae' | 'cpe';
type ProgramId = 'vn_math_6_9' | 'sat' | 'ielts' | 'cae' | 'cpe';

interface TrackInfo {
  id: PortalTrackId;
  title: string;
  subtitle: string;
}

interface MathLessonLike {
  id: string;
  title: string;
  topic: string;
  count: number;
  status: string;
  conceptIds?: string[];
  skillIds?: string[];
}

interface ExamLike {
  id: string;
  title: string;
  exam: string;
  questions: number;
  duration: number;
  status: string;
  conceptIds?: string[];
  skillIds?: string[];
}

interface ErrorQuestionLike {
  id: string;
  text: string;
  stage: number;
  answer?: string;
  conceptIds?: string[];
  skillIds?: string[];
  errorCategories?: string[];
}

interface CoverageRow {
  trackId: PortalTrackId;
  programId: ProgramId;
  title: string;
  totalTargets: number;
  coveredTargets: number;
  coverage: number;
  sourceUnits: number;
  weakestNodeLabel: string;
}

interface MetadataGap {
  id: string;
  title: string;
  kind: string;
  trackId: PortalTrackId;
  missing: string;
}

interface RiskQuestion {
  id: string;
  area: string;
  title: string;
  wrongRate: number;
  stage: number;
}

interface EventRow {
  kind: string;
  count: number;
  share: number;
  latestAt: string;
  source: string;
}

interface AdminLearningAnalyticsProps {
  tracks: TrackInfo[];
  mathLessons: MathLessonLike[];
  importedExams: ExamLike[];
  errorQuestions: ErrorQuestionLike[];
  adminLogs: SystemLog[];
  learningEvents?: LearningEventRecord[];
}

const TRACK_TO_PROGRAM: Record<PortalTrackId, ProgramId> = {
  math: 'vn_math_6_9',
  sat: 'sat',
  ielts: 'ielts',
  cae: 'cae',
  cpe: 'cpe',
};

export default function AdminLearningAnalytics({
  tracks,
  mathLessons,
  importedExams,
  errorQuestions,
  adminLogs,
  learningEvents = [],
}: AdminLearningAnalyticsProps) {
  const analytics = useMemo(() => {
    const graph = createSeedKnowledgeGraph();
    return {
      coverageRows: buildCoverageRows(graph, tracks, mathLessons, importedExams),
      metadataGaps: buildMetadataGaps(mathLessons, importedExams, errorQuestions),
      riskQuestions: buildRiskQuestions(errorQuestions),
      eventRows: buildEventRows(adminLogs, learningEvents),
      graphStats: {
        concepts: graph.concepts.length,
        skills: graph.skills.length,
        objectives: graph.objectives.length,
        edges: graph.edges.length,
      },
    };
  }, [adminLogs, errorQuestions, importedExams, learningEvents, mathLessons, tracks]);

  const averageCoverage = analytics.coverageRows.length
    ? analytics.coverageRows.reduce((sum, row) => sum + row.coverage, 0) / analytics.coverageRows.length
    : 0;
  const contentSnapshot = ENGLISH_CONTENT_QUALITY_SNAPSHOT;
  const explicitTaggedUnits =
    mathLessons.filter(hasExplicitMetadata).length +
    importedExams.filter(hasExplicitMetadata).length +
    errorQuestions.filter(hasExplicitMetadata).length;
  const contentUnitCount = mathLessons.length + importedExams.length + errorQuestions.length;
  const englishReadyRate = contentSnapshot.qualitySummary.questions
    ? Math.round((contentSnapshot.coverage.readyQuestions / contentSnapshot.qualitySummary.questions) * 100)
    : 0;

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl text-left space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 px-2 py-1 rounded">
              Admin Analytics
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              Knowledge Graph Audit
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-100 m-0 mt-3">Learning system control plane</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Tracks content coverage, missing metadata, abnormal review risk and learning events from the shared portal data.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 min-w-full lg:min-w-[620px]">
          <MetricTile label="Coverage" value={`${Math.round(averageCoverage)}%`} />
          <MetricTile label="Explicit tags" value={`${explicitTaggedUnits}/${contentUnitCount}`} />
          <MetricTile label="English ready" value={`${englishReadyRate}%`} />
          <MetricTile label="Risk rows" value={String(analytics.riskQuestions.length)} />
          <MetricTile label="Events" value={String(learningEvents.length || adminLogs.length)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Coverage by program" meta={`${analytics.graphStats.concepts} concepts / ${analytics.graphStats.skills} skills`}>
          <div className="space-y-3">
            {analytics.coverageRows.map((row) => (
              <div key={row.programId} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest m-0">{row.programId}</p>
                    <h4 className="text-sm font-black text-slate-100 mt-1 mb-0">{row.title}</h4>
                  </div>
                  <span className="font-mono font-black text-emerald-400">{Math.round(row.coverage)}%</span>
                </div>
                <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(4, Math.min(100, row.coverage))}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 mb-0">
                  {row.coveredTargets}/{row.totalTargets} graph targets covered by {row.sourceUnits} content units. Focus: <span className="text-slate-300">{row.weakestNodeLabel}</span>
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Metadata gaps" meta={`${analytics.metadataGaps.length} units need tags`}>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {analytics.metadataGaps.slice(0, 10).map((gap) => (
              <div key={`${gap.kind}-${gap.id}`} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate m-0">{gap.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-0">
                    {gap.kind} / {gap.trackId.toUpperCase()} / missing {gap.missing}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-amber-400 shrink-0">{gap.id}</span>
              </div>
            ))}
            {analytics.metadataGaps.length === 0 && (
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 text-xs text-slate-500">
                No metadata gaps detected.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel
        title="English content guard"
        meta={`${contentSnapshot.adapter.pass ? 'adapter pass' : 'adapter errors'} / ${contentSnapshot.qualitySummary.tests} tests`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Learning-ready English</p>
            <p className="text-2xl font-black text-emerald-400 font-mono m-0 mt-1">
              {contentSnapshot.coverage.readyQuestions}/{contentSnapshot.qualitySummary.questions}
            </p>
            <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${englishReadyRate}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 mb-0">
              {contentSnapshot.coverage.blockedQuestions} blocked content items are isolated from adapter errors.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Ready by program</p>
            <div className="space-y-2 mt-3">
              {Object.entries(contentSnapshot.coverage.byProgram).map(([program, count]) => (
                <div key={program} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-300 uppercase">{program}</span>
                  <span className="font-mono font-black text-cyan-400">{count}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 mb-0">
              {contentSnapshot.adapter.mockTests} mock tests / {contentSnapshot.adapter.passages} passages normalized.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Top blockers</p>
            <div className="space-y-2 mt-3">
              {contentSnapshot.qualitySummary.topIssues.map((issue) => (
                <div key={issue.code} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-slate-300 truncate">{issue.code}</span>
                  <span className="font-mono font-black text-amber-400">{issue.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {contentSnapshot.skillReadiness.map((skill) => {
            const readyRate = skill.totalItems ? Math.round(((skill.learningReadyItems + skill.feedbackOnlyItems) / skill.totalItems) * 100) : 0;
            const statusClass =
              readyRate >= 90
                ? 'text-emerald-400'
                : readyRate >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400';
            return (
              <div key={skill.skill} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{skill.skill.replace(/_/g, ' ')}</p>
                    <h5 className="text-sm font-black text-slate-100 mt-1 mb-0 truncate">{skill.label}</h5>
                  </div>
                  <span className={`font-mono font-black ${statusClass}`}>{readyRate}%</span>
                </div>
                <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.max(4, readyRate)}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <MiniMetric label="Ready" value={skill.learningReadyItems} />
                  <MiniMetric label="Feedback" value={skill.feedbackOnlyItems} />
                  <MiniMetric label="Blocked" value={skill.blockerItems} />
                  <MiniMetric label="Warn" value={skill.warningItems} />
                </div>
                <p className="text-[10px] text-slate-500 mt-3 mb-0 truncate">
                  {formatProgramBreakdown(skill.byProgram)}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Abnormal wrong-rate watchlist" meta="from error notebook stages">
          <div className="space-y-2">
            {analytics.riskQuestions.map((risk) => (
              <div key={risk.id} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate m-0">{risk.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-0">{risk.area} / Leitner stage {risk.stage}</p>
                  </div>
                  <span className={risk.wrongRate >= 72 ? 'text-rose-400 font-mono font-black' : 'text-amber-400 font-mono font-black'}>
                    {risk.wrongRate}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${risk.wrongRate}%` }} />
                </div>
              </div>
            ))}
            {analytics.riskQuestions.length === 0 && (
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 text-xs text-slate-500">
                No repeated-error rows are available yet.
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Learning event analytics" meta={`${analytics.graphStats.objectives} objectives / ${analytics.graphStats.edges} edges`}>
          <div className="space-y-2">
            {analytics.eventRows.map((row) => (
              <div key={row.kind} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-200 m-0">{row.kind}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-0">{row.source} / latest {row.latestAt}</p>
                  </div>
                  <span className="font-mono font-black text-cyan-400">{row.count}</span>
                </div>
                <div className="h-1.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.max(4, row.share)}%` }} />
                </div>
              </div>
            ))}
            {analytics.eventRows.length === 0 && (
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 text-xs text-slate-500">
                No learning events have been logged yet.
              </div>
            )}
          </div>
        </Panel>
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

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-2">
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 m-0">{label}</p>
      <p className="text-xs font-black text-slate-100 m-0 mt-1 font-mono">{value}</p>
    </div>
  );
}

function Panel({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest m-0">{title}</h4>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{meta}</span>
      </div>
      {children}
    </div>
  );
}

function formatProgramBreakdown(byProgram: Record<string, number>): string {
  const entries = Object.entries(byProgram);
  if (!entries.length) return 'No mapped sample yet';
  return entries.map(([program, count]) => `${program.toUpperCase()} ${count}`).join(' / ');
}

function buildCoverageRows(
  graph: KnowledgeGraph,
  tracks: TrackInfo[],
  mathLessons: MathLessonLike[],
  importedExams: ExamLike[],
): CoverageRow[] {
  return tracks.map((track) => {
    const programId = TRACK_TO_PROGRAM[track.id];
    const programMap = resolveProgramMap(graph, programId);
    const targetIds = uniqueStrings([...(programMap?.conceptIds || []), ...(programMap?.skillIds || [])]);
    const coveredIds = new Set<string>();
    const sourceUnits = track.id === 'math'
      ? mathLessons.length
      : importedExams.filter((exam) => exam.exam.toLowerCase() === track.id).length;

    if (track.id === 'math') {
      mathLessons.forEach((lesson) => inferMathLessonNodeIds(lesson).forEach((id) => coveredIds.add(id)));
    } else {
      importedExams
        .filter((exam) => exam.exam.toLowerCase() === track.id)
        .forEach((exam) => inferExamNodeIds(exam).forEach((id) => coveredIds.add(id)));
    }

    const coveredTargets = targetIds.filter((id) => coveredIds.has(id)).length;
    const missingTargets = targetIds.filter((id) => !coveredIds.has(id));

    return {
      trackId: track.id,
      programId,
      title: track.title,
      totalTargets: targetIds.length,
      coveredTargets,
      coverage: targetIds.length ? (coveredTargets / targetIds.length) * 100 : 0,
      sourceUnits,
      weakestNodeLabel: labelForId(missingTargets[0] || targetIds[0] || programId, graph),
    };
  });
}

function buildMetadataGaps(
  mathLessons: MathLessonLike[],
  importedExams: ExamLike[],
  errorQuestions: ErrorQuestionLike[],
): MetadataGap[] {
  const mathGaps = mathLessons.filter((item) => !hasExplicitMetadata(item)).map((item) => ({
    id: item.id,
    title: item.title,
    kind: 'math_lesson',
    trackId: 'math' as PortalTrackId,
    missing: missingMetadata(item),
  }));
  const examGaps = importedExams.filter((item) => !hasExplicitMetadata(item)).map((item) => ({
    id: item.id,
    title: item.title,
    kind: 'exam',
    trackId: normalizeTrackId(item.exam),
    missing: missingMetadata(item),
  }));
  const errorGaps = errorQuestions.filter((item) => !hasExplicitMetadata(item)).map((item) => ({
    id: item.id,
    title: previewText(item.text, 72),
    kind: 'error_question',
    trackId: inferTrackFromText(item.text),
    missing: missingMetadata(item),
  }));

  return [...mathGaps, ...examGaps, ...errorGaps];
}

function buildRiskQuestions(errorQuestions: ErrorQuestionLike[]): RiskQuestion[] {
  return errorQuestions
    .map((item) => ({
      id: item.id,
      area: inferArea(item.text),
      title: previewText(item.text, 90),
      wrongRate: Math.min(95, Math.round(46 + item.stage * 17 + (item.text.length % 13))),
      stage: item.stage,
    }))
    .filter((item) => item.wrongRate >= 55)
    .sort((a, b) => b.wrongRate - a.wrongRate)
    .slice(0, 6);
}

function buildEventRows(adminLogs: SystemLog[], learningEvents: LearningEventRecord[] = []): EventRow[] {
  const total = Math.max(1, adminLogs.length + learningEvents.length);
  const byKind = new Map<string, { count: number; latestAt: string; latestMs: number; source: string }>();

  learningEvents.forEach((event) => {
    recordEventRow(byKind, classifyLearningEvent(event), event.occurredAt, normalizeEventSource(event.source || 'shared learning event'));
  });

  adminLogs.forEach((log) => {
    recordEventRow(byKind, classifyEvent(log), log.createdAt, 'admin log');
  });

  return [...byKind.entries()]
    .map(([kind, value]) => ({
      kind,
      count: value.count,
      share: (value.count / total) * 100,
      latestAt: value.latestAt,
      source: value.source,
    }))
    .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind));
}

function recordEventRow(
  rows: Map<string, { count: number; latestAt: string; latestMs: number; source: string }>,
  kind: string,
  occurredAt: string | undefined,
  source: string,
): void {
  const timestamp = Date.parse(String(occurredAt || ''));
  const latestMs = Number.isNaN(timestamp) ? 0 : timestamp;
  const current = rows.get(kind) || { count: 0, latestAt: '-', latestMs: 0, source };
  rows.set(kind, {
    count: current.count + 1,
    latestAt: latestMs >= current.latestMs ? formatDateTime(occurredAt) : current.latestAt,
    latestMs: Math.max(current.latestMs, latestMs),
    source: current.source === source ? source : 'mixed sources',
  });
}

function hasExplicitMetadata(item: { conceptIds?: string[]; skillIds?: string[] }): boolean {
  return Boolean(item.conceptIds?.length || item.skillIds?.length);
}

function missingMetadata(item: { conceptIds?: string[]; skillIds?: string[] }): string {
  const missing = [];
  if (!item.conceptIds?.length) missing.push('conceptIds');
  if (!item.skillIds?.length) missing.push('skillIds');
  return missing.join(', ');
}

function resolveProgramMap(graph: KnowledgeGraph, programId: ProgramId): ProgramMap | undefined {
  return graph.programMaps.find((item) => item.programId === programId) || (programId === 'cae' ? graph.programMaps.find((item) => item.programId === 'cpe') : undefined);
}

function inferMathLessonNodeIds(lesson: MathLessonLike): string[] {
  if (hasExplicitMetadata(lesson)) return uniqueStrings([...(lesson.conceptIds || []), ...(lesson.skillIds || [])]);
  if (lesson.id.includes('geo')) {
    return ['math.plane_geometry', 'math.geometry_proof', 'math.prove_circle_geometry', 'math.geometry_reasoning'];
  }
  if (lesson.id.includes('test')) {
    return ['math.quadratic_equation', 'math.vieta', 'math.plane_geometry', 'math.statistics'];
  }
  return ['math.algebraic_expression', 'math.factorization', 'math.quadratic_equation', 'math.simplify_expression', 'math.apply_vieta'];
}

function inferExamNodeIds(exam: ExamLike): string[] {
  if (hasExplicitMetadata(exam)) return uniqueStrings([...(exam.conceptIds || []), ...(exam.skillIds || [])]);

  const id = exam.id.toLowerCase();
  if (id.includes('sat-m')) return ['math.linear_equation', 'math.quadratic_equation', 'math.solve_linear_equation', 'math.solve_quadratic_by_factor'];
  if (id.includes('sat-full')) return ['math.linear_equation', 'math.quadratic_equation', 'eng.reading_inference', 'eng.grammar_accuracy'];
  if (id.includes('sat-rw')) return ['eng.reading_main_idea', 'eng.reading_inference', 'eng.grammar_accuracy', 'eng.edit_sentence_errors'];
  if (id.includes('read')) return ['eng.reading_main_idea', 'eng.reading_detail', 'eng.reading_inference', 'eng.identify_specific_detail'];
  if (id.includes('list')) return ['eng.listening_detail'];
  if (id.includes('write')) return ['eng.academic_writing', 'eng.develop_academic_argument'];
  if (id.includes('speak')) return ['eng.vocabulary_range', 'eng.academic_register'];
  if (id.includes('uoe-03')) return ['eng.word_formation', 'eng.build_word_family'];
  if (id.includes('uoe-04')) return ['eng.sentence_structure', 'eng.control_clause_structure', 'eng.edit_sentence_errors'];
  if (id.includes('uoe')) return ['eng.vocabulary_range', 'eng.grammar_accuracy', 'eng.use_collocation'];
  if (id.includes('mock')) return ['eng.vocabulary_range', 'eng.grammar_accuracy', 'eng.reading_inference'];
  return [];
}

function normalizeTrackId(value: string): PortalTrackId {
  const normalized = value.toLowerCase();
  if (normalized === 'sat' || normalized === 'ielts' || normalized === 'cae' || normalized === 'cpe') return normalized;
  return 'math';
}

function inferTrackFromText(value: string): PortalTrackId {
  const text = normalizeText(value);
  if (text.includes('ielts')) return 'ielts';
  if (text.includes('sat')) return 'sat';
  if (text.includes('cpe')) return 'cpe';
  if (text.includes('cae')) return 'cae';
  return 'math';
}

function inferArea(value: string): string {
  const text = normalizeText(value);
  if (text.includes('ielts')) return 'English Core / IELTS';
  if (text.includes('sat')) return 'SAT';
  if (text.includes('sqrt') || text.includes('can bac') || text.includes('phuong trinh')) return 'Math / Algebra';
  if (text.includes('duong tron') || text.includes('tam giac')) return 'Math / Geometry';
  return 'Learning error notebook';
}

function classifyEvent(log: SystemLog): string {
  const message = normalizeText(log.message);
  if (log.level === 'ERROR') return 'System error';
  if (message.includes('dang nhap') || message.includes('dang xuat')) return 'Auth activity';
  if (message.includes('cau hoi') || message.includes('de thi') || message.includes('casio') || message.includes('latex')) return 'Content operations';
  if (message.includes('coin') || message.includes('xu') || message.includes('khen thuong')) return 'Reward economy';
  if (message.includes('hoc sinh') || message.includes('hoc tap') || message.includes('giai dung')) return 'Learning activity';
  if (message.includes('admin')) return 'Admin operations';
  return `${log.module || 'SYSTEM'} ${log.level}`;
}

function classifyLearningEvent(event: LearningEventRecord): string {
  const programId = String(event.payload?.programId || event.payload?.domainId || '').toUpperCase();
  const eventType = event.type.replace(/_/g, ' ');
  const entityType = event.entityType ? event.entityType.replace(/_/g, ' ') : 'learning item';
  return programId ? `${programId} / ${eventType}` : `${eventType} / ${entityType}`;
}

function normalizeEventSource(value: string): string {
  return value.replace(/_/g, ' ');
}

function labelForId(id: string, graph: KnowledgeGraph): string {
  return graph.concepts.find((item) => item.id === id)?.name || graph.skills.find((item) => item.id === id)?.name || id;
}

function formatDateTime(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN');
}

function previewText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
