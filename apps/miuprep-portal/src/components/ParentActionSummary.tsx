import { useMemo } from 'react';
import type { LocalUser } from '@miuprep/db';
import type { LearningEventRecord } from '@miuprep/learning';
import { loadStudentProgressSnapshot } from '../lib/studentProgress';
import {
  buildLearnerSnapshotFromLiveEvents,
  normalizeAssignedTracks,
  type PortalTrackInfo,
} from './UnifiedLearnerDashboard';

interface ParentActionSummaryProps {
  linkedStudents: LocalUser[];
  tracks: PortalTrackInfo[];
  learningEvents?: LearningEventRecord[];
  rewardsAllocated: number;
}

interface ParentChildSignal {
  student: LocalUser;
  averageMastery: number;
  errorCount: number;
  coins: number;
  weakestFocus: string;
  nextAction: string;
  status: 'stable' | 'watch' | 'support';
}

export default function ParentActionSummary({ linkedStudents, tracks, learningEvents = [], rewardsAllocated }: ParentActionSummaryProps) {
  const signals = useMemo(
    () => linkedStudents.map((student) => buildParentChildSignal(student, tracks, learningEvents)),
    [learningEvents, linkedStudents, tracks],
  );
  const focusChild = signals.slice().sort((a, b) => riskRank(b.status) - riskRank(a.status))[0];
  const headline = buildHeadline(focusChild);

  return (
    <section className="max-w-5xl mx-auto bg-orange-950/25 border border-orange-500/30 rounded-3xl p-5 sm:p-6 shadow-xl text-left space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300 bg-orange-950/60 border border-orange-800/60 px-2 py-1 rounded">
            Parent Next Action
          </span>
          <h2 className="text-2xl font-black text-slate-50 m-0 mt-3">{headline.title}</h2>
          <p className="text-sm text-slate-300 mt-2 mb-0 max-w-3xl leading-relaxed">{headline.detail}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 min-w-full lg:min-w-[360px]">
          <MiniMetric label="Số con" value={String(linkedStudents.length)} />
          <MiniMetric label="Đã thưởng" value={`${rewardsAllocated || 0}`} />
          <MiniMetric label="Cần chú ý" value={String(signals.filter((item) => item.status !== 'stable').length)} />
        </div>
      </div>

      {focusChild ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionTile
            label="Tình hình"
            value={`${focusChild.student.displayName || focusChild.student.username}: ${Math.round(focusChild.averageMastery)}% mastery`}
            detail={statusLabel(focusChild.status)}
          />
          <ActionTile
            label="Việc nên làm hôm nay"
            value={focusChild.nextAction}
            detail={`Tập trung vào ${focusChild.weakestFocus}.`}
          />
          <ActionTile
            label="Khen thưởng đúng lúc"
            value={focusChild.errorCount > 0 ? 'Thưởng sau khi con sửa xong lỗi' : 'Thưởng khi con giữ nhịp học'}
            detail={`${focusChild.coins} xu hiện có, ${focusChild.errorCount} lỗi cần ôn.`}
          />
        </div>
      ) : (
        <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl p-5">
          <p className="text-sm font-bold text-slate-300 m-0">Chưa có học sinh liên kết.</p>
          <p className="text-xs text-slate-500 mt-2 mb-0">
            Nên dùng mã mời hoặc QR để phụ huynh liên kết với con, tránh phải nhập username thủ công.
          </p>
        </div>
      )}
    </section>
  );
}

function buildParentChildSignal(student: LocalUser, tracks: PortalTrackInfo[], learningEvents: LearningEventRecord[]): ParentChildSignal {
  const assignedTracks = normalizeAssignedTracks(student);
  const activeTracks = tracks.filter((track) => assignedTracks.includes(track.id));
  const progress = readProgress(student.username);
  const snapshot = buildLearnerSnapshotFromLiveEvents(student, activeTracks, learningEvents, progress.coins, progress.traps);
  const weakestProgram = snapshot.programSummaries.slice().sort((a, b) => a.score - b.score)[0];
  const status = progress.traps >= 6 || snapshot.averageMastery < 55 ? 'support' : progress.traps >= 3 ? 'watch' : 'stable';

  return {
    student,
    averageMastery: snapshot.averageMastery,
    errorCount: progress.traps,
    coins: progress.coins,
    weakestFocus: weakestProgram?.weakestLabel || 'kỹ năng nền tảng',
    nextAction: localizeRecommendation(snapshot.recommendation.title),
    status,
  };
}

function readProgress(username: string) {
  if (typeof localStorage === 'undefined') {
    return { coins: 150, traps: 4, diaryList: [] };
  }

  return loadStudentProgressSnapshot(localStorage, username);
}

function buildHeadline(focusChild?: ParentChildSignal): { title: string; detail: string } {
  if (!focusChild) {
    return {
      title: 'Chưa có học sinh để theo dõi',
      detail: 'Sau khi liên kết tài khoản con, phụ huynh sẽ thấy tình hình học tập và gợi ý hành động trong một màn hình.',
    };
  }

  if (focusChild.status === 'support') {
    return {
      title: `${focusChild.student.displayName || focusChild.student.username} cần được hỗ trợ hôm nay`,
      detail: `Con đang có ${focusChild.errorCount} lỗi cần ôn. Phụ huynh nên nhắc con làm sprint sửa lỗi trước khi học bài mới.`,
    };
  }

  if (focusChild.status === 'watch') {
    return {
      title: `${focusChild.student.displayName || focusChild.student.username} đang cần giữ nhịp`,
      detail: 'Con có vài lỗi đang chờ ôn. Một phiên học ngắn 15 phút là đủ để giữ đà tiến bộ.',
    };
  }

  return {
    title: 'Con đang học ổn định',
    detail: 'Phụ huynh có thể khen thưởng nhỏ sau khi con hoàn thành sprint hoặc duy trì nhật ký học tập.',
  };
}

function statusLabel(status: ParentChildSignal['status']): string {
  if (status === 'support') return 'Cần hỗ trợ';
  if (status === 'watch') return 'Cần theo dõi';
  return 'Ổn định';
}

function localizeRecommendation(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes('repair')) return 'Ôn lại vùng kiến thức yếu nhất';
  if (normalized.includes('diagnostic')) return 'Làm bài chẩn đoán ngắn';
  if (normalized.includes('practice')) return 'Làm phiên luyện tập ngắn';
  if (normalized.includes('review')) return 'Xem lại lỗi cũ';
  return title || 'Làm phiên học 15 phút';
}

function riskRank(status: ParentChildSignal['status']): number {
  if (status === 'support') return 2;
  if (status === 'watch') return 1;
  return 0;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className="text-xl font-black text-orange-300 m-0 mt-1 font-mono">{value}</p>
    </div>
  );
}

function ActionTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="bg-slate-950/55 border border-slate-850 rounded-2xl p-4 min-h-[118px]">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <h3 className="text-sm font-black text-slate-100 m-0 mt-2 leading-snug">{value}</h3>
      <p className="text-xs text-slate-500 mt-2 mb-0 leading-relaxed">{detail}</p>
    </article>
  );
}
