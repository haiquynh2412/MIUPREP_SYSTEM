import { useMemo, type ReactNode } from 'react';
import {
  buildBetaReadinessReport,
  buildInternalBetaRunPlan,
  type BetaCheckStatus,
  type BetaContentUnit,
  type BetaTelemetryEvent,
} from '@miuprep/beta';
import type { LocalUser, SystemLog } from '@miuprep/db';
import { buildGraphBackendEvaluationReport, createSeedKnowledgeGraph } from '@miuprep/knowledge';
import { buildLearningEventSyncAuditReport, type LearningEventRecord } from '@miuprep/learning';
import { buildLearnerSnapshotFromLiveEvents, normalizeAssignedTracks, type PortalTrackInfo, type PortalTrackId } from './UnifiedLearnerDashboard';

type ProgramId = 'vn_math_6_9' | 'sat' | 'ielts' | 'cae' | 'cpe';

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

interface BetaImplementationTrackerProps {
  tracks: PortalTrackInfo[];
  users: Omit<LocalUser, 'passwordHash'>[];
  mathLessons: MathLessonLike[];
  importedExams: ExamLike[];
  adminLogs: SystemLog[];
  learningEvents: LearningEventRecord[];
  errorQuestionCount: number;
}

const TRACK_TO_PROGRAM: Record<PortalTrackId, ProgramId> = {
  math: 'vn_math_6_9',
  sat: 'sat',
  ielts: 'ielts',
  cae: 'cae',
  cpe: 'cpe',
};

export default function BetaImplementationTracker({
  tracks,
  users,
  mathLessons,
  importedExams,
  adminLogs,
  learningEvents,
  errorQuestionCount,
}: BetaImplementationTrackerProps) {
  const graph = useMemo(() => createSeedKnowledgeGraph(), []);
  const report = useMemo(() => {
    const learners = users
      .filter((user) => user.role === 'student' && (user.status || 'approved') === 'approved')
      .map((user) => {
        const assignedTrackIds = normalizeAssignedTracks(user as LocalUser);
        const activeTracks = tracks.filter((track) => assignedTrackIds.includes(track.id));
        const snapshot = buildLearnerSnapshotFromLiveEvents(toLocalUser(user), activeTracks, learningEvents, 150, errorQuestionCount);
        return {
          id: user.id || user.username,
          username: user.username,
          targetProgramIds: assignedTrackIds.map((trackId) => TRACK_TO_PROGRAM[trackId]),
          state: snapshot.state,
          stateKind: snapshot.evidenceSource,
        };
      });

    return buildBetaReadinessReport({
      graph,
      contentUnits: [...mathLessons.map(mathLessonToContentUnit), ...importedExams.map(examToContentUnit)],
      learners,
      telemetryEvents: [...adminLogs.map(logToTelemetryEvent), ...learningEvents.map(learningEventToTelemetryEvent)],
    });
  }, [adminLogs, errorQuestionCount, graph, importedExams, learningEvents, mathLessons, tracks, users]);
  const runPlan = useMemo(() => buildInternalBetaRunPlan(report), [report]);
  const graphBackendEvaluation = useMemo(() => buildGraphBackendEvaluationReport(graph), [graph]);
  const syncAudit = useMemo(() => buildLearningEventSyncAuditReport(learningEvents), [learningEvents]);

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl text-left space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill status={report.readyForInternalBeta ? 'pass' : 'watch'} label="Phase 10" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              Beta Readiness
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-100 m-0 mt-3">Implementation tracker</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Tracks the remaining Phase 10 items from live portal content, users, telemetry logs and shared beta audit rules.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 min-w-full lg:min-w-[720px]">
          <MetricTile label="Scopes ready" value={`${report.scopes.filter((scope) => scope.status !== 'blocked').length}/${report.scopes.length}`} />
          <MetricTile label="Learning events" value={String(report.learningEvents.totalEvents)} />
          <MetricTile label="Diagnostics" value={statusLabel(report.diagnosticAudit.status)} />
          <MetricTile label="KG backlog" value={String(report.graphAdjustmentCandidates.length)} />
          <MetricTile label="Mastery lift" value={formatSignedPercent(report.learningQualityKpis.masteryLift)} />
          <MetricTile label="Recurrence" value={`${report.learningQualityKpis.errorRecurrenceRate}%`} />
        </div>
      </div>

      <Panel title="Phase 10 checklist" meta={report.readyForInternalBeta ? 'ready for internal run' : 'needs evidence'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.checklist.map((item) => (
            <div key={item.id} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-100 m-0">{item.label}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2 mb-0">{item.detail}</p>
                </div>
                <StatusPill status={item.status} label={statusLabel(item.status)} />
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-3 mb-0">evidence: {item.evidenceCount}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Internal beta scopes" meta={`${report.scopes.length} active scopes`}>
          <div className="space-y-3">
            {report.scopes.map((scope) => (
              <div key={scope.scopeId} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{scope.programId}</p>
                    <h4 className="text-sm font-black text-slate-100 mt-1 mb-0">{scope.title}</h4>
                  </div>
                  <StatusPill status={scope.status} label={statusLabel(scope.status)} />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <MiniStat label="Units" value={scope.contentUnits} />
                  <MiniStat label="Questions" value={scope.questionCount} />
                  <MiniStat label="Learners" value={scope.learners} />
                  <MiniStat label="Coverage" value={`${scope.targetCoverage}%`} />
                </div>
                {(scope.blockers.length > 0 || scope.nextActions.length > 0) && (
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-3 mb-0">
                    {[...scope.blockers, ...scope.nextActions].join(' ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Audit signals" meta="diagnostic / recommendation / events">
          <div className="space-y-3">
            <AuditRow title="Learning event capture" status={report.learningEvents.status} detail={report.learningEvents.detail} value={report.learningEvents.totalEvents} />
            <AuditRow title="Diagnostic validity" status={report.diagnosticAudit.status} detail={report.diagnosticAudit.detail} value={`${report.diagnosticAudit.targetCoverage}%`} />
            <AuditRow title="Recommendation sanity" status={report.recommendationAudit.status} detail={report.recommendationAudit.detail} value={report.recommendationAudit.checkedLearners} />
            <AuditRow title="Recommendation quality" status={report.recommendationQualityAudit.status} detail={report.recommendationQualityAudit.detail} value={`${report.recommendationQualityAudit.passedRecommendations}/${report.recommendationQualityAudit.checkedLearners}`} />
          </div>
        </Panel>
      </div>

      <Panel title="Real learning KPI and recommendation quality" meta={`status ${statusLabel(report.learningQualityKpis.status)}`}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MiniStat label="Mastery lift" value={formatSignedPercent(report.learningQualityKpis.masteryLift)} />
          <MiniStat label="Retention 7d" value={`${report.learningQualityKpis.retentionAfter7Days}%`} />
          <MiniStat label="Time stable" value={formatDays(report.learningQualityKpis.timeToStableDays)} />
          <MiniStat label="Error recur" value={`${report.learningQualityKpis.errorRecurrenceRate}%`} />
          <MiniStat label="Completion" value={`${report.learningQualityKpis.lessonCompletionQuality}%`} />
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mt-3 mb-0">{report.learningQualityKpis.detail}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {[...report.recommendationQualityAudit.blockedIssues, ...report.recommendationQualityAudit.watchIssues].slice(0, 4).map((issue) => (
            <div key={`${issue.learnerId}-${issue.reason}-${issue.targetIds.join('-')}`} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-100 m-0">{issue.reason.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2 mb-0">{issue.detail}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-2 mb-0 truncate">
                    {issue.learnerId} / {issue.recommendationKind} / {issue.targetIds.join(', ') || 'no target'}
                  </p>
                </div>
                <StatusPill status={issue.severity} label={statusLabel(issue.severity)} />
              </div>
            </div>
          ))}
          {report.recommendationQualityAudit.blockedIssues.length + report.recommendationQualityAudit.watchIssues.length === 0 && (
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 text-xs text-slate-500">
              No recommendation quality issues detected.
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Architecture and sync gates" meta="Graph DB / event sync">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AuditRow
            title="Graph backend decision"
            status={graphBackendEvaluation.status}
            detail={`${graphBackendEvaluation.detail} Recommendation: ${readableId(graphBackendEvaluation.recommendation)}.`}
            value={`${graphBackendEvaluation.graphDbCriteriaMet}/${graphBackendEvaluation.triggers.length}`}
          />
          <AuditRow
            title="Learning event sync"
            status={syncAudit.status}
            detail={syncAudit.detail}
            value={syncAudit.totalEvents}
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <MiniStat label="Migration" value={graphBackendEvaluation.migrationAllowed ? 'allowed' : 'locked'} />
          <MiniStat label="Rollback" value={graphBackendEvaluation.rollbackPlanRequired ? 'required' : 'not needed'} />
          <MiniStat label="Dupes" value={syncAudit.duplicateIdempotencyKeys} />
          <MiniStat label="Conflicts" value={syncAudit.conflicts.length} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
            <p className="text-xs font-black text-slate-100 m-0">Graph backend triggers</p>
            <div className="space-y-2 mt-3">
              {graphBackendEvaluation.triggers.map((trigger) => (
                <div key={trigger.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-300 m-0">{readableId(trigger.id)}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1 mb-0">{trigger.evidence}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase shrink-0 ${trigger.met ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {trigger.met ? 'met' : 'clear'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
            <p className="text-xs font-black text-slate-100 m-0">Sync import risk</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <MiniStat label="Missing learner" value={syncAudit.missingLearnerIds} />
              <MiniStat label="Missing entity" value={syncAudit.missingEntityIds} />
              <MiniStat label="Bad time" value={syncAudit.invalidTimestamps} />
              <MiniStat label="Feedback only" value={syncAudit.feedbackOnlyEvents} />
            </div>
            {syncAudit.conflicts.length > 0 && (
              <p className="text-[11px] text-rose-300 leading-relaxed mt-3 mb-0">
                {syncAudit.conflicts.slice(0, 2).map((conflict) => readableId(conflict.reason)).join(', ')}
              </p>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Beta run plan" meta={runPlan.id}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            {runPlan.cohorts.map((cohort) => (
              <div key={cohort.id} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{cohort.programId}</p>
                    <h4 className="text-sm font-black text-slate-100 mt-1 mb-0">{cohort.title}</h4>
                  </div>
                  <StatusPill status={cohort.status} label={statusLabel(cohort.status)} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <MiniStat label="Learners" value={`${cohort.currentLearners}/${cohort.targetLearners}`} />
                  <MiniStat label="Events" value={cohort.minimumLearningEvents} />
                  <MiniStat label="Diagnostics" value={cohort.minimumDiagnosticAttempts} />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-3 mb-0">{cohort.focus.slice(0, 2).join(' ')}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <RunPlanList title="Entry gates" items={runPlan.entryGates} />
            <RunPlanList title="Exit gates" items={runPlan.exitGates} />
            <RunPlanList title="Next actions" items={runPlan.nextActions} />
          </div>
        </div>
      </Panel>

      <Panel title="Knowledge Graph adjustment backlog" meta="review before applying">
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {report.graphAdjustmentCandidates.slice(0, 8).map((candidate) => (
            <div key={`${candidate.kind}-${candidate.programId}-${candidate.id}`} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate m-0">{candidate.id}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 mb-0">{candidate.reason}</p>
              </div>
              <span className="text-[10px] font-mono text-amber-400 shrink-0">{candidate.kind}</span>
            </div>
          ))}
          {report.graphAdjustmentCandidates.length === 0 && (
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 text-xs text-slate-500">
              No graph changes should be applied until live beta evidence exists.
            </div>
          )}
        </div>
      </Panel>
    </section>
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

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className="text-xl font-black text-slate-100 m-0 mt-1 font-mono">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 m-0">{label}</p>
      <p className="text-sm font-black text-slate-100 m-0 mt-1 font-mono">{value}</p>
    </div>
  );
}

function AuditRow({ title, status, detail, value }: { title: string; status: BetaCheckStatus; detail: string; value: string | number }) {
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-100 m-0">{title}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-2 mb-0">{detail}</p>
        </div>
        <div className="text-right shrink-0">
          <StatusPill status={status} label={statusLabel(status)} />
          <p className="text-sm font-mono font-black text-slate-300 mt-2 mb-0">{value}</p>
        </div>
      </div>
    </div>
  );
}

function RunPlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
      <h5 className="text-xs font-black text-slate-100 uppercase tracking-widest m-0">{title}</h5>
      <div className="space-y-2 mt-3">
        {items.slice(0, 4).map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-relaxed m-0">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status, label }: { status: BetaCheckStatus; label: string }) {
  const className =
    status === 'pass'
      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
      : status === 'watch'
        ? 'text-amber-400 bg-amber-950/40 border-amber-900/60'
        : 'text-rose-400 bg-rose-950/40 border-rose-900/60';
  return (
    <span className={`text-[10px] font-black uppercase tracking-[0.12em] border px-2 py-1 rounded shrink-0 ${className}`}>
      {label}
    </span>
  );
}

function mathLessonToContentUnit(lesson: MathLessonLike): BetaContentUnit {
  const inferred = inferMathMetadata(lesson);
  return {
    id: lesson.id,
    title: lesson.title,
    programId: 'vn_math_6_9',
    status: lesson.status,
    questionCount: lesson.count,
    conceptIds: lesson.conceptIds?.length ? lesson.conceptIds : inferred.conceptIds,
    skillIds: lesson.skillIds?.length ? lesson.skillIds : inferred.skillIds,
    tags: ['math', 'grade9', lesson.topic],
  };
}

function examToContentUnit(exam: ExamLike): BetaContentUnit {
  const inferred = inferExamMetadata(exam);
  return {
    id: exam.id,
    title: exam.title,
    programId: normalizeProgramId(exam.exam),
    status: exam.status,
    questionCount: exam.questions,
    conceptIds: exam.conceptIds?.length ? exam.conceptIds : inferred.conceptIds,
    skillIds: exam.skillIds?.length ? exam.skillIds : inferred.skillIds,
    tags: inferred.tags,
  };
}

function inferMathMetadata(lesson: MathLessonLike): { conceptIds: string[]; skillIds: string[] } {
  const text = normalizeText(`${lesson.id} ${lesson.title} ${lesson.topic}`);
  if (text.includes('geo') || text.includes('hinh')) {
    return {
      conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
      skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    };
  }
  if (text.includes('test') || text.includes('thi')) {
    return {
      conceptIds: ['math.quadratic_equation', 'math.vieta', 'math.plane_geometry', 'math.statistics'],
      skillIds: ['math.solve_quadratic_by_factor', 'math.apply_vieta', 'math.geometry_reasoning', 'math.interpret_statistics'],
    };
  }
  return {
    conceptIds: ['math.algebraic_expression', 'math.factorization', 'math.quadratic_equation'],
    skillIds: ['math.simplify_expression', 'math.apply_vieta', 'math.solve_quadratic_by_factor'],
  };
}

function inferExamMetadata(exam: ExamLike): { conceptIds: string[]; skillIds: string[]; tags: string[] } {
  const text = normalizeText(`${exam.id} ${exam.title}`);
  if (text.includes('sat-m')) {
    return {
      conceptIds: ['math.linear_equation', 'math.quadratic_equation'],
      skillIds: ['math.solve_linear_equation', 'math.solve_quadratic_by_factor'],
      tags: ['sat', 'math'],
    };
  }
  if (text.includes('sat-rw')) {
    return {
      conceptIds: ['eng.reading_main_idea', 'eng.reading_inference', 'eng.grammar_accuracy'],
      skillIds: ['eng.identify_main_idea', 'eng.infer_implicit_meaning', 'eng.edit_sentence_errors'],
      tags: ['sat', 'reading', 'writing'],
    };
  }
  if (text.includes('list')) {
    return {
      conceptIds: ['eng.listening_detail', 'eng.reading_detail'],
      skillIds: ['eng.identify_specific_detail'],
      tags: ['listening'],
    };
  }
  if (text.includes('read')) {
    return {
      conceptIds: ['eng.reading_main_idea', 'eng.reading_detail', 'eng.reading_inference'],
      skillIds: ['eng.identify_main_idea', 'eng.identify_specific_detail', 'eng.infer_implicit_meaning'],
      tags: ['reading'],
    };
  }
  if (text.includes('write')) {
    return {
      conceptIds: ['eng.academic_writing', 'eng.writing_task_response', 'eng.essay_coherence'],
      skillIds: ['eng.develop_academic_argument', 'eng.plan_essay_response', 'eng.revise_for_coherence'],
      tags: ['writing'],
    };
  }
  return {
    conceptIds: ['eng.vocabulary_range', 'eng.grammar_accuracy', 'eng.reading_inference'],
    skillIds: ['eng.use_collocation', 'eng.edit_sentence_errors', 'eng.infer_implicit_meaning'],
    tags: ['mock'],
  };
}

function logToTelemetryEvent(log: SystemLog): BetaTelemetryEvent {
  return {
    id: log.id,
    type: classifyLogType(log),
    message: log.message,
    occurredAt: log.createdAt,
    programId: inferProgramFromText(log.message),
    source: 'miuprep_portal_admin_log',
    payload: parsePayload(log.payload),
  };
}

function learningEventToTelemetryEvent(event: LearningEventRecord): BetaTelemetryEvent {
  const programId = typeof event.payload?.programId === 'string' ? normalizeProgramId(event.payload.programId) : inferProgramFromText(JSON.stringify(event.payload || {}));
  return {
    id: event.id,
    type: event.type,
    learnerId: event.learnerId,
    programId,
    message: `${event.type} ${event.entityType} ${event.entityId}`,
    occurredAt: event.occurredAt,
    source: event.source,
    payload: event.payload,
  };
}

function classifyLogType(log: SystemLog): string {
  const text = normalizeText(`${log.level} ${log.message}`);
  if (text.includes('diagnostic')) return 'diagnostic';
  if (text.includes('giai dung') || text.includes('luyen tap') || text.includes('practice')) return 'practice';
  if (text.includes('on tap') || text.includes('review')) return 'review';
  if (text.includes('writing') || text.includes('speaking') || text.includes('feedback')) return 'feedback';
  return 'system';
}

function inferProgramFromText(value: string): ProgramId | undefined {
  const text = normalizeText(value);
  if (text.includes('ielts')) return 'ielts';
  if (text.includes('sat')) return 'sat';
  if (text.includes('cae')) return 'cae';
  if (text.includes('cpe')) return 'cpe';
  if (text.includes('toan') || text.includes('math')) return 'vn_math_6_9';
  return undefined;
}

function normalizeProgramId(value: string): ProgramId {
  const normalized = normalizeText(value);
  if (normalized === 'sat' || normalized === 'ielts' || normalized === 'cae' || normalized === 'cpe') return normalized;
  return 'vn_math_6_9';
}

function toLocalUser(user: Omit<LocalUser, 'passwordHash'>): LocalUser {
  return {
    ...user,
    passwordHash: '',
    targetBand: user.targetBand || 6.5,
    examDate: user.examDate || '2026-12-31',
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

function parsePayload(value?: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function statusLabel(status: BetaCheckStatus): string {
  if (status === 'pass') return 'pass';
  if (status === 'watch') return 'watch';
  return 'blocked';
}

function formatSignedPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}%`;
}

function formatDays(value: number | null): string {
  return value === null ? '-' : `${value}d`;
}

function readableId(value: string): string {
  return value.replace(/_/g, ' ');
}

function normalizeText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
