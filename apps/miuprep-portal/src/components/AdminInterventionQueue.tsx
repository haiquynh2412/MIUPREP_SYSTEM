import { useMemo, type ReactNode } from 'react';
import { useTranslation } from '@miuprep/i18n/src/react';
import { buildRepairRerouteCandidates, type BetaLearner, type RepairRerouteCandidate } from '@miuprep/beta';
import type { LocalUser, SystemLog } from '@miuprep/db';
import { createSeedKnowledgeGraph } from '@miuprep/knowledge';
import { buildStudentModelFromLearningEvents, type LearningEventRecord } from '@miuprep/learning';
import { loadStudentProgressSnapshot } from '../lib/studentProgress';
import {
  buildLearnerSnapshot,
  buildLearnerSnapshotFromLiveEvents,
  normalizeAssignedTracks,
  type PortalTrackInfo,
  type PortalTrackId,
} from './UnifiedLearnerDashboard';

type ProgramId = 'vn_math_6_9' | 'sat' | 'ielts' | 'cae' | 'cpe';

type TFunc = (key: string, params?: Record<string, string | number>) => string;

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
  standardErrorCount?: number;
  conceptIds?: string[];
  skillIds?: string[];
  reviewStatus?: 'unchecked' | 'checked' | 'needs_fix';
  reviewer?: string;
  reviewedAt?: string;
}

interface ErrorQuestionLike {
  id: string;
  text: string;
  stage: number;
  conceptIds?: string[];
  skillIds?: string[];
  retryAttempts?: number;
  repairLessonTitle?: string;
}

interface AdminInterventionQueueProps {
  tracks: PortalTrackInfo[];
  users: Omit<LocalUser, 'passwordHash'>[];
  mathLessons: MathLessonLike[];
  importedExams: ExamLike[];
  errorQuestions: ErrorQuestionLike[];
  adminLogs: SystemLog[];
  learningEvents: LearningEventRecord[];
  onOpenUsers: () => void;
  onOpenContent: (track: 'math' | 'sat' | 'ielts' | 'cae' | 'cpe') => void;
}

interface LearnerIntervention {
  id: string;
  student: Omit<LocalUser, 'passwordHash'>;
  priority: 'urgent' | 'watch' | 'routine';
  score: number;
  mastery: number;
  attempts: number;
  errorPressure: number;
  focus: string;
  reason: string;
  action: string;
}

interface ContentIntervention {
  id: string;
  title: string;
  track: 'math' | 'sat' | 'ielts' | 'cae' | 'cpe';
  priority: 'urgent' | 'watch' | 'routine';
  reason: string;
  action: string;
  metric: string;
}

interface ParentDigest {
  parent: Omit<LocalUser, 'passwordHash'>;
  studentNames: string[];
  wins: string[];
  focus: string[];
  action: string;
}

interface RecurringMisconception {
  id: string;
  name: string;
  kind: string;
  track: 'math' | 'sat' | 'ielts' | 'cae' | 'cpe';
  priority: 'urgent' | 'watch' | 'routine';
  score: number;
  evidenceCount: number;
  learnerCount: number;
  sample: string;
  action: string;
  conceptIds: string[];
  skillIds: string[];
}

const TRACK_TO_PROGRAM: Record<PortalTrackId, ProgramId> = {
  math: 'vn_math_6_9',
  sat: 'sat',
  ielts: 'ielts',
  cae: 'cae',
  cpe: 'cpe',
};

export default function AdminInterventionQueue({
  tracks,
  users,
  mathLessons,
  importedExams,
  errorQuestions,
  adminLogs,
  learningEvents,
  onOpenUsers,
  onOpenContent,
}: AdminInterventionQueueProps) {
  const { t } = useTranslation();
  const queue = useMemo(
    () => buildQueue({ tracks, users, mathLessons, importedExams, errorQuestions, adminLogs, learningEvents }, t),
    [adminLogs, errorQuestions, importedExams, learningEvents, mathLessons, tracks, users, t],
  );

  return (
    <section className="max-w-6xl mx-auto bg-slate-900/70 border border-orange-500/30 rounded-3xl p-5 sm:p-6 shadow-xl text-left space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300 bg-orange-950/40 border border-orange-800/60 px-2 py-1 rounded">
              {t('aiq_badge_intervention_queue')}
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              {t('aiq_badge_roles')}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-50 m-0 mt-3">{t('aiq_heading_today')}</h3>
          <p className="text-sm text-slate-400 mt-2 mb-0 max-w-3xl leading-relaxed">
            {t('aiq_intro')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 min-w-full lg:min-w-[720px]">
          <QueueMetric label={t('aiq_metric_learners')} value={String(queue.learners.length)} tone="rose" />
          <QueueMetric label={t('aiq_metric_content')} value={String(queue.content.length)} tone="amber" />
          <QueueMetric label={t('aiq_metric_parents')} value={String(queue.parentDigests.length)} tone="cyan" />
          <QueueMetric label={t('aiq_metric_misconcept')} value={String(queue.misconceptions.length)} tone="cyan" />
          <QueueMetric label={t('aiq_metric_reroutes')} value={String(queue.repairReroutes.length)} tone="amber" />
          <QueueMetric label={t('aiq_metric_urgent')} value={String(queue.urgentCount)} tone="orange" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Panel title={t('aiq_panel_teacher_title')} meta={t('aiq_panel_teacher_meta')}>
          <div className="space-y-3">
            {queue.learners.slice(0, 5).map((item) => (
              <LearnerRow key={item.id} item={item} onOpenUsers={onOpenUsers} />
            ))}
            {queue.learners.length === 0 && <EmptyState text={t('aiq_empty_learners')} />}
          </div>
        </Panel>

        <Panel title={t('aiq_panel_content_title')} meta={t('aiq_panel_content_meta')}>
          <div className="space-y-3">
            {queue.content.slice(0, 6).map((item) => (
              <ContentRow key={item.id} item={item} onOpenContent={onOpenContent} />
            ))}
            {queue.content.length === 0 && <EmptyState text={t('aiq_empty_content')} />}
          </div>
        </Panel>
      </div>

      <Panel title={t('aiq_panel_reroute_title')} meta={t('aiq_panel_reroute_meta')}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {queue.repairReroutes.slice(0, 6).map((item) => (
            <RepairRerouteCard key={`${item.learnerId}-${item.scope}-${item.targetId}`} item={item} onOpenUsers={onOpenUsers} onOpenContent={onOpenContent} />
          ))}
          {queue.repairReroutes.length === 0 && <EmptyState text={t('aiq_empty_reroutes')} />}
        </div>
      </Panel>

      <Panel title={t('aiq_panel_misconception_title')} meta={t('aiq_panel_misconception_meta')}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {queue.misconceptions.slice(0, 6).map((item) => (
            <MisconceptionCard key={item.id} item={item} onOpenContent={onOpenContent} />
          ))}
          {queue.misconceptions.length === 0 && <EmptyState text={t('aiq_empty_misconceptions')} />}
        </div>
      </Panel>

      <Panel title={t('aiq_panel_parent_title')} meta={t('aiq_panel_parent_meta')}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {queue.parentDigests.slice(0, 4).map((digest) => (
            <ParentDigestCard key={digest.parent.username} digest={digest} />
          ))}
          {queue.parentDigests.length === 0 && <EmptyState text={t('aiq_empty_parents')} />}
        </div>
      </Panel>
    </section>
  );
}

function RepairRerouteCard({
  item,
  onOpenUsers,
  onOpenContent,
}: {
  item: RepairRerouteCandidate;
  onOpenUsers: () => void;
  onOpenContent: (track: ContentIntervention['track']) => void;
}) {
  const { t } = useTranslation();
  const priority = repairReroutePriority(item);
  const track = programToTrack(item.programId);
  return (
    <article className={`rounded-2xl border p-4 ${priorityClass(priority)}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityPill priority={priority} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.evidenceSource}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{readableRerouteAction(item.action)}</span>
          </div>
          <h4 className="text-sm font-black text-slate-100 mt-2 mb-1">{item.targetId}</h4>
          <p className="text-xs text-slate-400 leading-relaxed m-0">{item.reason}</p>
          <p className="text-[11px] text-slate-500 mt-2 mb-0">
            {item.suspectedPrerequisiteIds.length ? t('aiq_reroute_prereq', { ids: compactIds(item.suspectedPrerequisiteIds) }) : ''}
            {item.misconceptionIds.length ? t('aiq_reroute_misconception', { ids: compactIds(item.misconceptionIds) }) : ''}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-[240px]">
          <TinyMetric label={t('aiq_tiny_evidence')} value={String(item.evidenceCount)} />
          <TinyMetric label={t('aiq_tiny_wrong')} value={String(item.wrongAttempts)} />
          <TinyMetric label={t('aiq_tiny_streak')} value={String(item.consecutiveWrongAttempts)} />
          <TinyMetric label={t('aiq_tiny_score')} value={`${Math.round(item.score)}%`} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-slate-300 m-0">
          {t('aiq_reroute_learner_review_pre')}<span className="font-mono text-orange-200">{item.learnerId}</span>{t('aiq_reroute_learner_review_post')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenUsers}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            {t('aiq_btn_open_user')}
          </button>
          <button
            type="button"
            onClick={() => onOpenContent(track)}
            className="px-3 py-2 rounded-xl bg-orange-400 hover:bg-orange-300 text-slate-950 text-[10px] font-black uppercase tracking-wider cursor-pointer border-0"
          >
            {t('aiq_btn_open_content')}
          </button>
        </div>
      </div>
    </article>
  );
}

function LearnerRow({ item, onOpenUsers }: { item: LearnerIntervention; onOpenUsers: () => void }) {
  const { t } = useTranslation();
  return (
    <article className={`rounded-2xl border p-4 ${priorityClass(item.priority)}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityPill priority={item.priority} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('aiq_learner_evidence', { count: item.attempts })}</span>
          </div>
          <h4 className="text-sm font-black text-slate-100 mt-2 mb-1">{item.student.displayName || item.student.username}</h4>
          <p className="text-xs text-slate-400 leading-relaxed m-0">{item.reason}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[260px]">
          <TinyMetric label={t('aiq_tiny_mastery')} value={`${Math.round(item.mastery)}%`} />
          <TinyMetric label={t('aiq_tiny_errors')} value={String(item.errorPressure)} />
          <TinyMetric label={t('aiq_tiny_score')} value={String(item.score)} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-slate-300 m-0">
          {t('aiq_learner_focus_label')}<span className="text-orange-200 font-bold">{item.focus}</span>. {item.action}
        </p>
        <button
          type="button"
          onClick={onOpenUsers}
          className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-wider cursor-pointer"
        >
          {t('aiq_btn_open_user')}
        </button>
      </div>
    </article>
  );
}

function ContentRow({ item, onOpenContent }: { item: ContentIntervention; onOpenContent: (track: ContentIntervention['track']) => void }) {
  const { t } = useTranslation();
  return (
    <article className={`rounded-2xl border p-4 ${priorityClass(item.priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityPill priority={item.priority} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.track.toUpperCase()}</span>
          </div>
          <h4 className="text-sm font-black text-slate-100 mt-2 mb-1 truncate">{item.title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed m-0">{item.reason}</p>
          <p className="text-[11px] text-slate-500 mt-2 mb-0">{item.action}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-amber-300 font-mono m-0">{item.metric}</p>
          <button
            type="button"
            onClick={() => onOpenContent(item.track)}
            className="mt-3 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider cursor-pointer border-0"
          >
            {t('aiq_btn_open')}
          </button>
        </div>
      </div>
    </article>
  );
}

function ParentDigestCard({ digest }: { digest: ParentDigest }) {
  const { t } = useTranslation();
  return (
    <article className="bg-slate-950/55 border border-slate-850 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{t('aiq_parent_digest_label')}</p>
          <h4 className="text-sm font-black text-slate-100 mt-1 mb-0">{digest.parent.displayName || digest.parent.username}</h4>
        </div>
        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-900/60 rounded px-2 py-1">
          {digest.studentNames.join(', ') || t('aiq_parent_no_student')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <DigestBox title={t('aiq_digest_3_wins')} items={digest.wins} />
        <DigestBox title={t('aiq_digest_2_focus')} items={digest.focus} />
        <DigestBox title={t('aiq_digest_1_action')} items={[digest.action]} />
      </div>
    </article>
  );
}

function MisconceptionCard({
  item,
  onOpenContent,
}: {
  item: RecurringMisconception;
  onOpenContent: (track: RecurringMisconception['track']) => void;
}) {
  const { t } = useTranslation();
  return (
    <article className={`rounded-2xl border p-4 ${priorityClass(item.priority)}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityPill priority={item.priority} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.kind}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.track.toUpperCase()}</span>
          </div>
          <h4 className="text-sm font-black text-slate-100 mt-2 mb-1">{item.name}</h4>
          <p className="text-xs text-slate-400 leading-relaxed m-0">{item.sample}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[260px]">
          <TinyMetric label={t('aiq_tiny_evidence')} value={String(item.evidenceCount)} />
          <TinyMetric label={t('aiq_tiny_learners')} value={String(item.learnerCount)} />
          <TinyMetric label={t('aiq_tiny_score')} value={String(item.score)} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-slate-300 m-0">
          {item.action}
          <span className="block text-[11px] text-slate-500 mt-1">
            {compactIds([...item.conceptIds, ...item.skillIds])}
          </span>
        </p>
        <button
          type="button"
          onClick={() => onOpenContent(item.track)}
          className="px-3 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[10px] font-black uppercase tracking-wider cursor-pointer border-0"
        >
          {t('aiq_btn_open_content')}
        </button>
      </div>
    </article>
  );
}

function DigestBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 m-0">{title}</p>
      <ul className="list-none p-0 mt-2 mb-0 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-[11px] text-slate-300 leading-relaxed flex gap-2">
            <span className="text-cyan-300 font-black">-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildQueue(input: {
  tracks: PortalTrackInfo[];
  users: Omit<LocalUser, 'passwordHash'>[];
  mathLessons: MathLessonLike[];
  importedExams: ExamLike[];
  errorQuestions: ErrorQuestionLike[];
  adminLogs: SystemLog[];
  learningEvents: LearningEventRecord[];
}, t: TFunc) {
  const learners = buildLearnerInterventions(input.users, input.tracks, input.errorQuestions, input.learningEvents, t);
  const content = buildContentInterventions(input.mathLessons, input.importedExams, input.errorQuestions, t);
  const misconceptions = buildRecurringMisconceptions(input.errorQuestions, input.learningEvents, t);
  const repairReroutes = buildRepairRerouteCandidates(
    createSeedKnowledgeGraph(),
    buildBetaLearners(input.users, input.tracks, input.errorQuestions, input.learningEvents),
  );
  const parentDigests = buildParentDigests(input.users, learners, t);
  const urgentCount =
    learners.filter((item) => item.priority === 'urgent').length +
    content.filter((item) => item.priority === 'urgent').length +
    misconceptions.filter((item) => item.priority === 'urgent').length +
    repairReroutes.filter((item) => repairReroutePriority(item) === 'urgent').length +
    input.users.filter((user) => user.status === 'pending').length;

  return {
    learners,
    content,
    misconceptions,
    repairReroutes,
    parentDigests,
    urgentCount,
    logCount: input.adminLogs.length,
  };
}

function buildBetaLearners(
  users: Omit<LocalUser, 'passwordHash'>[],
  tracks: PortalTrackInfo[],
  errorQuestions: ErrorQuestionLike[],
  learningEvents: LearningEventRecord[],
): BetaLearner[] {
  const activeErrors = errorQuestions.filter((question) => question.stage > 0);
  return users
    .filter((user) => user.role === 'student' && (user.status || 'approved') === 'approved')
    .map((student) => {
      const assignedTrackIds = normalizeAssignedTracks(toLocalUser(student));
      const activeTracks = tracks.filter((track) => assignedTrackIds.includes(track.id));
      const targetProgramIds = assignedTrackIds.map((trackId) => TRACK_TO_PROGRAM[trackId]);
      const canonicalLearnerId = student.id || student.username;
      const studentEvents = learningEvents
        .filter((event) => event.learnerId === student.id || event.learnerId === student.username)
        .map((event) => ({ ...event, learnerId: canonicalLearnerId }));
      const liveModelReport = studentEvents.length
        ? buildStudentModelFromLearningEvents(studentEvents, { learnerId: canonicalLearnerId, targetProgramIds })
        : null;
      if (liveModelReport && liveModelReport.acceptedAttempts > 0) {
        return {
          id: canonicalLearnerId,
          username: student.username,
          targetProgramIds,
          state: liveModelReport.state,
          stateKind: 'live' as const,
        };
      }

      const progress = readProgress(student.username);
      const snapshot = buildLearnerSnapshot(toLocalUser(student), activeTracks, progress.coins, Math.max(progress.traps, activeErrors.length));
      return {
        id: canonicalLearnerId,
        username: student.username,
        targetProgramIds,
        state: snapshot.state,
        stateKind: 'synthetic' as const,
      };
    });
}

function buildLearnerInterventions(
  users: Omit<LocalUser, 'passwordHash'>[],
  tracks: PortalTrackInfo[],
  errorQuestions: ErrorQuestionLike[],
  learningEvents: LearningEventRecord[],
  t: TFunc,
): LearnerIntervention[] {
  const activeErrors = errorQuestions.filter((question) => question.stage > 0);
  const recurringErrors = activeErrors.filter((question) => question.stage >= 2 || (question.retryAttempts || 0) >= 2).length;
  const students = users.filter((user) => user.role === 'student' && (user.status || 'approved') === 'approved');

  return students.map((student) => {
    const localStudent = toLocalUser(student);
    const activeTracks = tracks.filter((track) => normalizeAssignedTracks(localStudent).includes(track.id));
    const progress = readProgress(student.username);
    const snapshot = buildLearnerSnapshotFromLiveEvents(localStudent, activeTracks, learningEvents, progress.coins, Math.max(progress.traps, activeErrors.length));
    const weakest = snapshot.programSummaries.slice().sort((a, b) => a.score - b.score)[0];
    const studentEvents = learningEvents.filter((event) => event.learnerId === student.id || event.learnerId === student.username);
    const attempts = Math.max(snapshot.state.attempts.length, studentEvents.length);
    const errorPressure = Math.max(progress.traps, recurringErrors);
    const score = Math.round((100 - snapshot.averageMastery) + errorPressure * 8 + (attempts > 14 && snapshot.averageMastery < 72 ? 15 : 0));
    const priority: LearnerIntervention['priority'] = score >= 58 ? 'urgent' : score >= 35 ? 'watch' : 'routine';

    return {
      id: student.id || student.username,
      student,
      priority,
      score,
      mastery: snapshot.averageMastery,
      attempts,
      errorPressure,
      focus: weakest?.weakestLabel || snapshot.learningPath.nextStep?.label || t('aiq_focus_foundation_repair'),
      reason: buildLearnerReason(priority, attempts, snapshot.averageMastery, errorPressure, t),
      action: buildLearnerAction(priority, weakest?.weakestLabel || snapshot.learningPath.nextStep?.label, t),
    };
  })
    .filter((item) => item.priority !== 'routine' || item.errorPressure > 0)
    .sort((left, right) => right.score - left.score || right.errorPressure - left.errorPressure);
}

function buildContentInterventions(
  mathLessons: MathLessonLike[],
  importedExams: ExamLike[],
  errorQuestions: ErrorQuestionLike[],
  t: TFunc,
): ContentIntervention[] {
  const mathRows: ContentIntervention[] = mathLessons
    .filter((lesson) => !(lesson.conceptIds?.length && lesson.skillIds?.length))
    .slice(0, 4)
    .map((lesson) => ({
      id: `math.${lesson.id}`,
      title: lesson.title,
      track: 'math',
      priority: 'watch',
      reason: t('aiq_content_math_missing_meta_reason'),
      action: t('aiq_content_math_missing_meta_action'),
      metric: t('aiq_metric_metadata'),
    }));

  const examRows: ContentIntervention[] = importedExams
    .filter((exam) => exam.reviewStatus === 'needs_fix' || exam.reviewStatus === 'unchecked' || exam.standardErrorCount)
    .slice(0, 8)
    .map((exam) => {
      const track = normalizeTrack(exam.exam);
      const hasErrors = Number(exam.standardErrorCount || 0) > 0;
      return {
        id: `exam.${exam.id}`,
        title: exam.title,
        track,
        priority: exam.reviewStatus === 'needs_fix' || hasErrors ? 'urgent' : 'watch',
        reason: hasErrors
          ? t('aiq_content_exam_errors_reason', { count: Number(exam.standardErrorCount || 0) })
          : exam.reviewStatus === 'unchecked'
            ? t('aiq_content_exam_unchecked_reason')
            : t('aiq_content_exam_needs_fix_reason'),
        action: track === 'math' ? t('aiq_content_action_math') : t('aiq_content_action_other', { track: track.toUpperCase() }),
        metric: hasErrors ? `${exam.standardErrorCount}` : exam.reviewStatus || 'draft',
      };
    });

  const riskRows: ContentIntervention[] = errorQuestions
    .filter((question) => question.stage >= 2)
    .map((question) => ({
      id: `risk.${question.id}`,
      title: question.text,
      track: inferTrackFromError(question),
      priority: question.stage >= 3 ? 'urgent' : 'watch',
      reason: t('aiq_content_risk_reason', { stage: question.stage }),
      action: question.repairLessonTitle
        ? t('aiq_content_risk_action_with_lesson', { lesson: question.repairLessonTitle })
        : t('aiq_content_risk_action_default'),
      metric: t('aiq_metric_stage', { stage: question.stage }),
    }));

  return [...riskRows, ...examRows, ...mathRows].sort(
    (left, right) => priorityRank(right.priority) - priorityRank(left.priority) || left.title.localeCompare(right.title),
  );
}

function buildRecurringMisconceptions(
  errorQuestions: ErrorQuestionLike[],
  learningEvents: LearningEventRecord[],
  t: TFunc,
): RecurringMisconception[] {
  const graph = createSeedKnowledgeGraph();
  return graph.misconceptions
    .map((misconception) => {
      let score = 0;
      let evidenceCount = 0;
      const learnerIds = new Set<string>();
      const samples: string[] = [];
      const targetIds = new Set([...misconception.conceptIds, ...misconception.skillIds]);

      errorQuestions.forEach((question) => {
        const matched = hasTargetOverlap(targetIds, [...(question.conceptIds || []), ...(question.skillIds || [])])
          || matchesMisconceptionText(question, misconception.id);
        if (!matched) return;
        const weight = Math.max(1, question.stage) + Math.max(0, question.retryAttempts || 0);
        score += weight;
        evidenceCount += 1;
        if (samples.length < 2) samples.push(question.text);
      });

      learningEvents.forEach((event) => {
        const payload = event.payload || {};
        const eventTargets = [
          ...readStringArray(payload.conceptIds),
          ...readStringArray(payload.skillIds),
          ...readStringArray(payload.misconceptionIds),
        ];
        const directMisconception = readStringArray(payload.misconceptionIds).includes(misconception.id);
        const matched = directMisconception || hasTargetOverlap(targetIds, eventTargets);
        const isWrongEvidence = payload.correct === false || event.type === 'feedback_only' || directMisconception;
        if (!matched || !isWrongEvidence) return;
        score += directMisconception ? 4 : 2;
        evidenceCount += 1;
        if (event.learnerId) learnerIds.add(event.learnerId);
        if (samples.length < 2) samples.push(String(payload.itemId || payload.feedbackArea || event.entityId || event.type));
      });

      const priority: RecurringMisconception['priority'] = score >= 10 ? 'urgent' : score >= 4 ? 'watch' : 'routine';
      return {
        id: misconception.id,
        name: misconception.name,
        kind: misconception.kind,
        track: misconception.domainId === 'mathematics' ? ('math' as const) : ('ielts' as const),
        priority,
        score,
        evidenceCount,
        learnerCount: learnerIds.size || (evidenceCount ? 1 : 0),
        sample: samples[0] || t('aiq_misconception_no_sample'),
        action: buildMisconceptionAction(misconception.id, misconception.domainId, t),
        conceptIds: misconception.conceptIds,
        skillIds: misconception.skillIds,
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || priorityRank(right.priority) - priorityRank(left.priority) || left.name.localeCompare(right.name));
}

function buildParentDigests(
  users: Omit<LocalUser, 'passwordHash'>[],
  learners: LearnerIntervention[],
  t: TFunc,
): ParentDigest[] {
  const learnerByUsername = new Map(learners.map((item) => [item.student.username, item]));
  return users
    .filter((user) => user.role === 'parent')
    .map((parent) => {
      const linked = parent.linkedStudents || [];
      const linkedLearners = linked.map((username) => learnerByUsername.get(username)).filter(Boolean) as LearnerIntervention[];
      const focusLearner = linkedLearners.slice().sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority) || b.score - a.score)[0];
      return {
        parent,
        studentNames: linked,
        wins: [
          linkedLearners.length ? t('aiq_parent_win_linked', { count: linkedLearners.length }) : t('aiq_parent_win_ready'),
          t('aiq_parent_win_daily_loop'),
          t('aiq_parent_win_reward_wallet'),
        ],
        focus: [
          focusLearner ? t('aiq_parent_focus_student', { name: focusLearner.student.displayName || focusLearner.student.username, focus: focusLearner.focus }) : t('aiq_parent_focus_link'),
          focusLearner ? t('aiq_parent_focus_errors', { count: focusLearner.errorPressure }) : t('aiq_parent_focus_set_target'),
        ],
        action: focusLearner
          ? t('aiq_parent_action_sprint')
          : t('aiq_parent_action_invite'),
      };
    });
}

function hasTargetOverlap(targetIds: Set<string>, values: string[]): boolean {
  return values.some((value) => targetIds.has(value));
}

function matchesMisconceptionText(question: ErrorQuestionLike, misconceptionId: string): boolean {
  const text = `${question.id} ${question.text}`.toLowerCase();
  if (misconceptionId === 'mis.math.missing_domain_condition') return text.includes('sqrt') || text.includes('domain') || text.includes('condition');
  if (misconceptionId === 'mis.math.geometry_proof_gap') return text.includes('circle') || text.includes('geometry') || text.includes('duong') || text.includes('goc');
  if (misconceptionId === 'mis.math.casio_operation_error') return text.includes('casio') || text.includes('calculator') || text.includes('delta');
  if (misconceptionId === 'mis.eng.grammar_role_mismatch') return text.includes('grammar') || text.includes('although');
  if (misconceptionId === 'mis.eng.inference_literal_only') return text.includes('inference');
  return false;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item || '')).filter(Boolean) : [];
}

function buildMisconceptionAction(misconceptionId: string, domainId: string, t: TFunc): string {
  if (misconceptionId === 'mis.math.geometry_proof_gap') return t('aiq_misconception_action_geometry');
  if (misconceptionId === 'mis.math.casio_operation_error') return t('aiq_misconception_action_casio');
  if (misconceptionId === 'mis.math.missing_domain_condition') return t('aiq_misconception_action_domain');
  if (domainId === 'mathematics') return t('aiq_misconception_action_math');
  return t('aiq_misconception_action_english');
}

function compactIds(values: string[]): string {
  const text = values.slice(0, 4).join(', ');
  if (values.length <= 4) return text;
  return `${text}, +${values.length - 4}`;
}

function readableRerouteAction(action: RepairRerouteCandidate['action']): string {
  return action.replace(/_/g, ' ');
}

function repairReroutePriority(item: RepairRerouteCandidate): 'urgent' | 'watch' | 'routine' {
  if (item.evidenceSource === 'live' && (item.action === 'teacher_review' || item.consecutiveWrongAttempts >= 3)) return 'urgent';
  if (item.evidenceCount >= 5 || item.consecutiveWrongAttempts >= 3) return 'watch';
  return 'routine';
}

function programToTrack(programId: string): ContentIntervention['track'] {
  if (programId === 'sat') return 'sat';
  if (programId === 'ielts') return 'ielts';
  if (programId === 'cae') return 'cae';
  if (programId === 'cpe') return 'cpe';
  return 'math';
}

function buildLearnerReason(priority: LearnerIntervention['priority'], attempts: number, mastery: number, errors: number, t: TFunc): string {
  if (priority === 'urgent') return t('aiq_learner_reason_urgent', { mastery: Math.round(mastery), attempts, errors });
  if (priority === 'watch') return t('aiq_learner_reason_watch', { errors });
  return t('aiq_learner_reason_routine', { mastery: Math.round(mastery) });
}

function buildLearnerAction(priority: LearnerIntervention['priority'], focus: string | undefined, t: TFunc): string {
  if (priority === 'urgent') return t('aiq_learner_action_urgent', { focus: focus || t('aiq_focus_weakest_prerequisite') });
  if (priority === 'watch') return t('aiq_learner_action_watch', { focus: focus || t('aiq_focus_weakest_skill') });
  return t('aiq_learner_action_routine');
}

function readProgress(username: string) {
  if (typeof localStorage === 'undefined') {
    return { coins: 150, traps: 4, diaryList: [] };
  }
  return loadStudentProgressSnapshot(localStorage, username);
}

function toLocalUser(user: Omit<LocalUser, 'passwordHash'>): LocalUser {
  return {
    ...user,
    passwordHash: '',
    targetBand: user.targetBand || 7,
    examDate: user.examDate || '2026-12-31',
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

function normalizeTrack(value: string): ContentIntervention['track'] {
  const normalized = value.toLowerCase();
  if (normalized === 'sat') return 'sat';
  if (normalized === 'ielts') return 'ielts';
  if (normalized === 'cae') return 'cae';
  if (normalized === 'cpe') return 'cpe';
  return 'math';
}

function inferTrackFromError(question: ErrorQuestionLike): ContentIntervention['track'] {
  const value = `${question.id} ${question.text} ${(question.conceptIds || []).join(' ')} ${(question.skillIds || []).join(' ')}`.toLowerCase();
  if (value.includes('sat')) return 'sat';
  if (value.includes('ielts') || value.includes('eng.')) return 'ielts';
  if (value.includes('cpe')) return 'cpe';
  if (value.includes('cae')) return 'cae';
  return 'math';
}

function priorityRank(priority: 'urgent' | 'watch' | 'routine'): number {
  if (priority === 'urgent') return 3;
  if (priority === 'watch') return 2;
  return 1;
}

function priorityClass(priority: 'urgent' | 'watch' | 'routine'): string {
  if (priority === 'urgent') return 'bg-rose-950/25 border-rose-500/35';
  if (priority === 'watch') return 'bg-amber-950/20 border-amber-500/25';
  return 'bg-slate-950/55 border-slate-850';
}

function PriorityPill({ priority }: { priority: 'urgent' | 'watch' | 'routine' }) {
  const className =
    priority === 'urgent'
      ? 'bg-rose-950/60 text-rose-300 border-rose-900/70'
      : priority === 'watch'
        ? 'bg-amber-950/60 text-amber-300 border-amber-900/70'
        : 'bg-slate-950 text-slate-400 border-slate-800';
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${className}`}>
      {priority}
    </span>
  );
}

function QueueMetric({ label, value, tone }: { label: string; value: string; tone: 'rose' | 'amber' | 'cyan' | 'orange' }) {
  const toneClass = {
    rose: 'text-rose-300',
    amber: 'text-amber-300',
    cyan: 'text-cyan-300',
    orange: 'text-orange-300',
  }[tone];
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className={`text-2xl font-black m-0 mt-1 font-mono ${toneClass}`}>{value}</p>
    </div>
  );
}

function TinyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 m-0">{label}</p>
      <p className="text-sm font-black text-slate-100 m-0 mt-0.5 font-mono">{value}</p>
    </div>
  );
}

function Panel({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <div className="bg-slate-950/40 border border-slate-850 rounded-3xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest m-0">{title}</h4>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest sm:text-right sm:max-w-[220px] truncate">{meta}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-4 text-xs text-slate-500">
      {text}
    </div>
  );
}
