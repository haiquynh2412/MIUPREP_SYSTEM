import type { ReactNode } from 'react';
import type { LocalUser } from '@miuprep/db';
import { useTranslation } from '@miuprep/i18n/src/react';

type UserSummary = Omit<LocalUser, 'passwordHash'>;

interface AdminOverviewPanelProps {
  users: UserSummary[];
  circulatingCoins: number;
  systemPreview: ReactNode;
  onSendEmergencyIntervention: () => void | Promise<void>;
  onApproveAllPendingUsers: () => void | Promise<void>;
  onBoostStudentCoins: () => void | Promise<void>;
  onClearTelemetryLogs: () => void | Promise<void>;
}

export default function AdminOverviewPanel({
  users,
  circulatingCoins,
  systemPreview,
  onSendEmergencyIntervention,
  onApproveAllPendingUsers,
  onBoostStudentCoins,
  onClearTelemetryLogs,
}: AdminOverviewPanelProps) {
  const { t } = useTranslation();
  const activeStudentCount = users.filter((user) => user.role === 'student').length;
  const pendingUserCount = users.filter((user) => (user.status || 'pending') === 'pending').length;

  return (
    <>
      <div className="max-w-5xl mx-auto text-left">
        <div className="bg-rose-950/40 border-2 border-dashed border-rose-500/40 rounded-3xl p-5 shadow-lg relative overflow-hidden bg-gradient-to-r from-slate-900 to-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.005]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 text-rose-400 text-xl font-bold animate-pulse shrink-0">
              ⚠️
            </div>
            <div>
              <span className="text-[9px] font-black text-rose-455 uppercase tracking-widest block font-sans">
                HỆ THỐNG CẢNH BÁO SỚM HỌC THUẬT (TELEMETRY ALARMS)
              </span>
              <p className="text-xs text-slate-350 font-semibold mt-0.5 leading-relaxed">
                Phát hiện học viên <strong className="text-rose-400">@con.cung</strong> có tỷ lệ Bẫy Chuột sai sót tăng đột biến{' '}
                <strong className="text-rose-455 font-mono">82%</strong> tại bài{' '}
                <strong className="text-slate-100">Tứ giác nội tiếp</strong>!
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onSendEmergencyIntervention}
              className="bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-rose-300 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all duration-100 cursor-pointer border-none outline-none"
            >
              {t('aov_fix_now')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-left">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-emerald-500/30 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold border border-emerald-500/20">
            👥
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t('aov_active_students')}</span>
            <h3 className="text-2xl font-black text-slate-100 mt-0.5">
              {activeStudentCount} <span className="text-xs text-slate-500 font-bold">con</span>
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl font-bold border border-indigo-500/20">
            🎯
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t('aov_system_score')}</span>
            <h3 className="text-sm font-black text-slate-100 mt-1">
              SAT: <span className="text-rose-400 font-mono font-bold">1340</span> • IELTS:{' '}
              <span className="text-indigo-400 font-mono font-bold">7.2</span>
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-orange-500/30 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-xl font-bold border border-orange-500/20">
            🐟
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t('aov_circulating')}</span>
            <h3 className="text-2xl font-black text-slate-100 mt-0.5">
              {circulatingCoins} <span className="text-xs text-slate-500 font-bold">🐟</span>
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden">
          {pendingUserCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-ping" />}
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-xl font-bold border border-amber-500/20">
            ⏳
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t('aov_new_requests')}</span>
            <h3 className="text-2xl font-black text-slate-100 mt-0.5">
              {pendingUserCount} <span className="text-xs text-slate-500 font-bold">{t('aov_requests_unit')}</span>
            </h3>
          </div>
        </div>
      </div>

      {systemPreview}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>{t('aov_heatmap_title')}</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: '🧮 Toán 9: Tứ giác nội tiếp & Cực trị', value: 78, tone: 'text-orange-400', bar: 'bg-orange-500' },
                { label: '🎓 SAT RW: Standard English Conventions', value: 65, tone: 'text-rose-400', bar: 'bg-rose-500' },
                { label: '🎙️ IELTS: Speaking Pronunciation', value: 58, tone: 'text-indigo-400', bar: 'bg-indigo-500' },
              ].map((skill) => (
                <div key={skill.label}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400 font-semibold">{skill.label}</span>
                    <span className={`${skill.tone} font-bold`}>{t('aov_weakness', { value: skill.value })}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                    <div className={`${skill.bar} h-full rounded-full`} style={{ width: `${skill.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[9px] text-slate-500 mt-4 leading-relaxed font-light">
            {t('aov_heatmap_note')}
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>{t('aov_quick_title')}</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onApproveAllPendingUsers}
                className="py-3 bg-emerald-950/60 hover:bg-emerald-900/45 border border-emerald-900/60 rounded-2xl text-[10px] font-black uppercase text-emerald-450 tracking-wider transition-all cursor-pointer text-center"
              >
                {t('aov_approve_all')}
              </button>
              <button
                type="button"
                onClick={onBoostStudentCoins}
                className="py-3 bg-orange-950/60 hover:bg-orange-900/45 border border-orange-900/60 rounded-2xl text-[10px] font-black uppercase text-orange-450 tracking-wider transition-all cursor-pointer text-center"
              >
                {t('aov_boost_coins')}
              </button>
              <button
                type="button"
                onClick={onClearTelemetryLogs}
                className="py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-wider transition-all cursor-pointer text-center col-span-2"
              >
                {t('aov_clear_logs')}
              </button>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 mt-4 leading-relaxed font-light">
            {t('aov_quick_warn')}
          </div>
        </section>
      </div>
    </>
  );
}
