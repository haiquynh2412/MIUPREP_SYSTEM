import { useMemo } from 'react';
import {
  CONTENT_COVERAGE_SNAPSHOT,
  ENGLISH_CONTENT_QUALITY_SNAPSHOT,
  type ContentCoverageProgramSnapshot,
  type ContentQualityIssueSnapshot,
} from '../data/contentQualitySnapshot';

interface AdminContentRepairQueueProps {
  onOpenContent: (track: 'ielts' | 'cae' | 'cpe') => void;
}

const ISSUE_LABELS: Record<string, string> = {
  missing_listening_content: 'Listening thiếu audio, transcript hoặc prompt',
  'schema.sections[*].questionGroups[*].questions[*].blankIndex': 'Gap-fill thiếu blankIndex',
  'schema.sections[*].transcript': 'Section thiếu transcript',
  missing_reading_content: 'Reading thiếu passage hoặc question context',
  'schema.sections[*].passageHtml': 'Section thiếu passageHtml',
};

const ISSUE_ACTIONS: Record<string, string> = {
  missing_listening_content: 'Ưu tiên CPE Listening trước, vì đây là blocker lớn nhất.',
  'schema.sections[*].questionGroups[*].questions[*].blankIndex':
    'Chuẩn hóa lại gap-fill để adapter biết blank nào cần chấm.',
  'schema.sections[*].transcript': 'Bổ sung transcript ở cấp section để learner và AI Tutor có evidence.',
  missing_reading_content: 'Gắn lại passageHtml hoặc source passage trước khi publish.',
  'schema.sections[*].passageHtml': 'Kiểm tra import parser và nội dung HTML của passage.',
};

export default function AdminContentRepairQueue({ onOpenContent }: AdminContentRepairQueueProps) {
  const snapshot = ENGLISH_CONTENT_QUALITY_SNAPSHOT;
  const totalQuestions = snapshot.qualitySummary.questions;
  const readyQuestions = snapshot.coverage.readyQuestions;
  const readiness = totalQuestions ? Math.round((readyQuestions / totalQuestions) * 100) : 0;
  const topIssues = snapshot.qualitySummary.topIssues.slice(0, 5);
  const listening = snapshot.skillReadiness.find((item) => item.skill === 'listening');
  const useOfEnglish = snapshot.skillReadiness.find((item) => item.skill === 'use_of_english');
  const generatedDate = useMemo(() => formatDate(snapshot.generatedAt), [snapshot.generatedAt]);
  const coverageDate = formatDate(CONTENT_COVERAGE_SNAPSHOT.generatedAt);

  return (
    <section className="max-w-6xl mx-auto bg-slate-900/70 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl text-left space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-1 rounded">
              English Repair Queue
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              Snapshot: {generatedDate}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-50 m-0 mt-3">Việc cần sửa trước khi mở rộng nội dung</h3>
          <p className="text-sm text-slate-400 mt-2 mb-0 max-w-3xl leading-relaxed">
            Queue này gom blocker từ English guard để admin sửa đúng thứ tự: Listening trước, sau đó gap-fill và reading
            context.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 min-w-full lg:min-w-[420px]">
          <Metric label="Ready" value={`${readiness}%`} tone="emerald" />
          <Metric label="Blocker" value={String(snapshot.qualitySummary.blockers)} tone="rose" />
          <Metric label="Warning" value={String(snapshot.qualitySummary.warnings)} tone="amber" />
        </div>
      </div>

      <div className="bg-slate-950/50 border border-emerald-500/20 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 m-0">
              Unified Content Coverage
            </p>
            <h4 className="text-base font-black text-slate-100 mt-1 mb-0">MiuMath / SAT / IELTS import status</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-950 border border-slate-850 px-2 py-1 rounded">
            Coverage: {coverageDate}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {CONTENT_COVERAGE_SNAPSHOT.programs.map((program) => (
            <CoverageProgramCard key={program.programId} program={program} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
        <div className="space-y-3">
          {topIssues.map((issue, index) => (
            <RepairIssueRow key={issue.code} issue={issue} rank={index + 1} />
          ))}
        </div>

        <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 m-0">Đường sửa tối ưu</p>
            <ol className="mt-3 mb-0 p-0 list-none space-y-2">
              <StepItem index={1} text={`Sửa ${listening?.blockerItems || 0} blocker Listening, chủ yếu CPE.`} />
              <StepItem
                index={2}
                text={`Sửa ${useOfEnglish?.blockerItems || 0} blocker Use of English còn thiếu context.`}
              />
              <StepItem index={3} text="Chạy guard:english rồi sync portal snapshot." />
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => onOpenContent('cpe')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl border-0 cursor-pointer transition-colors"
            >
              Mở Content CPE
            </button>
            <button
              type="button"
              onClick={() => onOpenContent('ielts')}
              className="bg-slate-950 hover:bg-slate-900 text-slate-200 font-bold text-xs px-4 py-3 rounded-2xl border border-slate-800 cursor-pointer transition-colors"
            >
              Kiểm tra IELTS
            </button>
            <button
              type="button"
              onClick={() => onOpenContent('cae')}
              className="bg-slate-950 hover:bg-slate-900 text-slate-200 font-bold text-xs px-4 py-3 rounded-2xl border border-slate-800 cursor-pointer transition-colors"
            >
              Kiểm tra CAE
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverageProgramCard({ program }: { program: ContentCoverageProgramSnapshot }) {
  const readyRate = program.importedQuestions
    ? Math.round((program.readyQuestions / program.importedQuestions) * 100)
    : 0;
  const computedStatus =
    program.blockerItems > 0 || !program.adapterPass
      ? 'needs_repair'
      : program.warningItems > 0 || Number(program.changedQuestions || 0) > 0
        ? 'watch'
        : 'ready';
  const status = program.coverageStatus || computedStatus;
  const statusClass = {
    needs_repair: 'bg-rose-950/40 text-rose-300 border-rose-900/60',
    watch: 'bg-amber-950/40 text-amber-300 border-amber-900/60',
    planned: 'bg-sky-950/40 text-sky-300 border-sky-900/60',
    ready: 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60',
  }[status];
  const statusLabel = status.replace('_', ' ');

  return (
    <article className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 min-h-[178px] flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{program.programId}</p>
            <h5 className="text-sm font-black text-slate-100 mt-1 mb-0 truncate">{program.label}</h5>
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border shrink-0 ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed mt-3 mb-0">{program.note}</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <MiniCoverageMetric label="Source" value={program.sourceQuestions} />
        <MiniCoverageMetric label="Import" value={program.importedQuestions} />
        <MiniCoverageMetric label="Ready" value={`${readyRate}%`} />
        <MiniCoverageMetric
          label="Block"
          value={program.blockerItems}
          tone={program.blockerItems ? 'rose' : 'emerald'}
        />
      </div>
    </article>
  );
}

function RepairIssueRow({ issue, rank }: { issue: ContentQualityIssueSnapshot; rank: number }) {
  return (
    <article className="bg-slate-950/55 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h4 className="text-sm font-black text-slate-100 m-0">{ISSUE_LABELS[issue.code] || issue.code}</h4>
          <span className="text-xs font-black text-rose-300 bg-rose-950/40 border border-rose-900/60 px-2 py-1 rounded font-mono">
            {issue.count} items
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 mb-0 leading-relaxed">
          {ISSUE_ACTIONS[issue.code] || 'Rà lại source parser và schema guard.'}
        </p>
        <p className="text-[10px] text-slate-600 mt-2 mb-0 font-mono break-all">{issue.code}</p>
      </div>
    </article>
  );
}

function MiniCoverageMetric({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: string | number;
  tone?: 'slate' | 'emerald' | 'rose';
}) {
  const toneClass = {
    slate: 'text-slate-200',
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
  }[tone];

  return (
    <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-2 min-w-0">
      <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-600 m-0">{label}</p>
      <p className={`text-sm font-black font-mono mt-1 mb-0 truncate ${toneClass}`}>{value}</p>
    </div>
  );
}

function StepItem({ index, text }: { index: number; text: string }) {
  return (
    <li className="flex gap-3 text-xs font-bold text-slate-300 leading-relaxed">
      <span className="w-6 h-6 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-black flex items-center justify-center shrink-0">
        {index}
      </span>
      <span>{text}</span>
    </li>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'rose' | 'amber' }) {
  const toneClass = {
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
    amber: 'text-amber-300',
  }[tone];

  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className={`text-2xl font-black m-0 mt-1 font-mono ${toneClass}`}>{value}</p>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'chưa rõ';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
