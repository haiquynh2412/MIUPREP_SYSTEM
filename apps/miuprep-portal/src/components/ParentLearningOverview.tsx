import { useMemo } from 'react';
import type { LocalUser } from '@miuprep/db';
import type { LearningEventRecord } from '@miuprep/learning';
import {
  buildLearnerSnapshotFromLiveEvents,
  normalizeAssignedTracks,
  type PortalTrackInfo,
} from './UnifiedLearnerDashboard';

interface ParentLearningOverviewProps {
  linkedStudents: LocalUser[];
  tracks: PortalTrackInfo[];
  learningEvents?: LearningEventRecord[];
}

interface ChildProgressRow {
  student: LocalUser;
  trackLabels: string[];
  averageMastery: number;
  evidence: number;
  weakestFocus: string;
  nextAction: string;
  errorNotebookCount: number;
}

export default function ParentLearningOverview({
  linkedStudents,
  tracks,
  learningEvents = [],
}: ParentLearningOverviewProps) {
  const rows = useMemo(
    () => linkedStudents.map((student) => buildChildProgressRow(student, tracks, learningEvents)),
    [learningEvents, linkedStudents, tracks],
  );

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl text-left space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-400 bg-orange-950/40 border border-orange-900/50 px-2 py-1 rounded">
            Parent Learning Overview
          </span>
          <h2 className="text-xl font-black text-slate-100 m-0 mt-3">Tiến độ và điểm yếu của từng học sinh</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Phụ huynh xem nhanh con đang học chương trình nào, mức thành thạo hiện tại và nội dung cần ôn tiếp theo.
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3 min-w-[160px]">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">Linked students</p>
          <p className="text-2xl font-black text-slate-100 m-0 mt-1 font-mono">{linkedStudents.length}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6 text-center m-0">
          Chưa có học sinh nào được liên kết.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map((row) => (
            <article key={row.student.id} className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-100 m-0">
                    {row.student.displayName || row.student.username}
                  </h3>
                  <p className="text-[11px] text-slate-500 m-0 mt-1">@{row.student.username}</p>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-1 rounded uppercase">
                  {Math.round(row.averageMastery)}% mastery
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Overall progress</span>
                  <span className="text-slate-300 font-mono">{row.evidence} evidence</span>
                </div>
                <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${Math.max(4, Math.min(100, row.averageMastery))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoTile label="Programs" value={row.trackLabels.join(', ')} />
                <InfoTile label="Error notebook" value={`${row.errorNotebookCount} due`} />
                <InfoTile label="Cần ôn tiếp" value={row.weakestFocus} />
                <InfoTile label="Việc nên làm" value={row.nextAction} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 min-h-[72px]">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className="text-xs font-bold text-slate-200 m-0 mt-1 leading-relaxed">{value || '-'}</p>
    </div>
  );
}

function buildChildProgressRow(
  student: LocalUser,
  tracks: PortalTrackInfo[],
  learningEvents: LearningEventRecord[],
): ChildProgressRow {
  const assigned = normalizeAssignedTracks(student);
  const activeTracks = tracks.filter((track) => assigned.includes(track.id));
  const coins = readNumber(`miu_math_fish_coins_${student.username}`, 150);
  const errorNotebookCount = readTrapCount(student.username);
  const snapshot = buildLearnerSnapshotFromLiveEvents(
    student,
    activeTracks,
    learningEvents,
    coins,
    errorNotebookCount || 4,
  );
  const weakestProgram = snapshot.programSummaries.slice().sort((a, b) => a.score - b.score)[0];

  return {
    student,
    trackLabels: activeTracks.map((track) => track.title),
    averageMastery: snapshot.averageMastery,
    evidence: snapshot.state.attempts.length,
    weakestFocus: weakestProgram?.weakestLabel || 'Đang chờ thêm dữ liệu học tập',
    nextAction: localizeRecommendation(snapshot.recommendation.title),
    errorNotebookCount,
  };
}

function localizeRecommendation(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes('repair')) return 'Ôn lại vùng kiến thức yếu nhất';
  if (normalized.includes('diagnostic')) return 'Làm bài chẩn đoán ngắn';
  if (normalized.includes('practice')) return 'Làm phiên luyện tập ngắn';
  if (normalized.includes('review')) return 'Xem lại lỗi cũ';
  return title || 'Làm phiên học 15 phút';
}

function readNumber(key: string, fallback: number): number {
  if (typeof localStorage === 'undefined') return fallback;
  const raw = Number(localStorage.getItem(key));
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function readTrapCount(username: string): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = localStorage.getItem(`miu_math_traps_${username}`);
  if (!raw) return 4;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 4;
  } catch {
    return 4;
  }
}
