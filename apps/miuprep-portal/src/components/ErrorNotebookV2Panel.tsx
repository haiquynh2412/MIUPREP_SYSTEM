import type { ErrorNotebookQuestion } from '../lib/satPractice';
import {
  buildErrorNotebookV2Entries,
  buildErrorNotebookV2Groups,
  type ErrorNotebookV2Entry,
  type ErrorNotebookV2Group,
} from '../lib/studentProgress';

interface ErrorNotebookV2PanelProps {
  errorQuestions: ErrorNotebookQuestion[];
  onClose: () => void;
  onRetry: (questionId: string, selectedAnswer: string, correctAnswer: string) => void;
  onOpenTutor: () => void;
}

export default function ErrorNotebookV2Panel({
  errorQuestions,
  onClose,
  onRetry,
  onOpenTutor,
}: ErrorNotebookV2PanelProps) {
  const entries = buildErrorNotebookV2Entries(errorQuestions);
  const groups = buildErrorNotebookV2Groups(entries);
  const prerequisiteCount = entries.filter((entry) => entry.retryStatusCode === 'prerequisite').length;
  const dueCount = entries.filter((entry) => entry.dueLabel === 'Due today').length;

  return (
    <section className="bg-slate-900/60 border-2 border-rose-500/30 rounded-3xl p-6 max-w-6xl mx-auto shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 to-rose-950/20 text-left transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-900 px-2 py-1 rounded-full font-bold font-mono uppercase tracking-widest">
              Error Notebook V2
            </span>
            <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-1 rounded-full font-bold uppercase tracking-widest">
              root cause repair
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-100 mt-3 mb-1">So loi sua den tan goc</h3>
          <p className="text-xs text-slate-500 leading-relaxed m-0 max-w-3xl">
            Moi loi duoc tach thanh root cause, missed step, repair lesson, due date va retry status. Neu sai lai 2 lan,
            he thong se dua ve prerequisite thay vi bat lam them cau cung dang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTutor}
            className="bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-700 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
          >
            Ask AI Tutor
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-950 hover:bg-slate-850 text-slate-350 hover:text-white border-0 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
          >
            x
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <NotebookMetric label="Active errors" value={String(entries.length)} tone="text-rose-300" />
        <NotebookMetric label="Due today" value={String(dueCount)} tone="text-amber-300" />
        <NotebookMetric label="Prerequisite" value={String(prerequisiteCount)} tone="text-orange-300" />
        <NotebookMetric label="Groups" value={String(groups.length)} tone="text-cyan-300" />
      </div>

      {entries.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-6 text-xs text-slate-500 text-center">
          Tuyet voi. Khong con loi dang can sua trong notebook.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[0.82fr_1.5fr] gap-5">
          <ErrorGroupColumn groups={groups} />
          <div className="space-y-4">
            {entries.map((entry) => (
              <ErrorEntryCard key={entry.question.id} entry={entry} onRetry={onRetry} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ErrorGroupColumn({ groups }: { groups: ErrorNotebookV2Group[] }) {
  return (
    <aside className="space-y-3">
      <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">
          Grouped by concept / skill
        </p>
        <div className="space-y-2 mt-3">
          {groups.map((group) => (
            <div key={group.key} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-100 m-0 truncate">{group.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-0">
                    {group.count} errors · stage {group.highestStage}
                  </p>
                </div>
                <span
                  className={`text-xs font-black font-mono ${group.prerequisiteCount ? 'text-orange-300' : group.dueCount ? 'text-amber-300' : 'text-cyan-300'}`}
                >
                  {group.prerequisiteCount ? `${group.prerequisiteCount} prereq` : `${group.dueCount} due`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ErrorEntryCard({
  entry,
  onRetry,
}: {
  entry: ErrorNotebookV2Entry;
  onRetry: (questionId: string, selectedAnswer: string, correctAnswer: string) => void;
}) {
  const statusTone =
    entry.retryStatusCode === 'prerequisite'
      ? 'text-orange-300 border-orange-500/30 bg-orange-500/10'
      : entry.retryStatusCode === 'repairing'
        ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
        : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10';

  return (
    <article className="p-4 bg-slate-955 rounded-2xl border border-slate-850 text-xs flex flex-col gap-4 relative">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[9px] bg-rose-950/70 text-rose-300 border border-rose-900 px-2 py-1 rounded font-mono font-bold uppercase">
              Stage {entry.question.stage}
            </span>
            <span className={`text-[9px] border px-2 py-1 rounded font-mono font-bold uppercase ${statusTone}`}>
              {entry.retryStatusLabel}
            </span>
            <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded font-mono font-bold uppercase">
              {entry.errorTypeLabel}
            </span>
          </div>
          <p className="font-extrabold text-slate-200 leading-relaxed m-0">{entry.question.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:min-w-[220px]">
          <MiniBox label="Due" value={entry.dueLabel} />
          <MiniBox label="Retries" value={String(entry.retryAttempts)} />
          <MiniBox label="Severity" value={entry.severityLabel} />
          <MiniBox label="Group" value={entry.groupLabel} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <RepairBox title="Root cause" body={entry.rootCause} />
        <RepairBox title="Missed step" body={entry.missedStep} />
        <RepairBox title="Repair lesson" body={`${entry.repairLessonTitle}: ${entry.repairLessonDetail}`} />
      </div>

      {entry.retryStatusCode === 'prerequisite' && (
        <div className="bg-orange-500/10 border border-orange-500/25 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-300 m-0">Redo until stable</p>
          <p className="text-xs text-orange-100/80 leading-relaxed mt-1 mb-0">
            Loi nay da sai lai tu 2 lan. Nen quay ve prerequisite/repair lesson truoc, sau do moi lam cau retry.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {entry.question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onRetry(entry.question.id, option, entry.question.answer)}
            className="py-2 bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
          >
            {option}
          </button>
        ))}
      </div>

      <details className="text-[10px] text-slate-500 font-light cursor-pointer select-none">
        <summary className="font-bold text-slate-400 hover:text-slate-300">Xem explanation goc</summary>
        <p className="mt-2 bg-slate-900 p-3 rounded-lg border border-slate-850 leading-relaxed text-slate-400">
          {entry.question.answerExpl}
        </p>
      </details>
    </article>
  );
}

function NotebookMetric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className={`text-2xl font-black font-mono mt-1 mb-0 ${tone}`}>{value}</p>
    </div>
  );
}

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 m-0">{label}</p>
      <p className="text-[11px] font-bold text-slate-200 mt-1 mb-0 truncate">{value}</p>
    </div>
  );
}

function RepairBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{title}</p>
      <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-0">{body}</p>
    </div>
  );
}
