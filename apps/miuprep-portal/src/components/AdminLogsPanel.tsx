import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { SystemLog } from '@miuprep/db';
import { useTranslation } from '@miuprep/i18n/src/react';

interface AdminLogsPanelProps {
  adminLogs: SystemLog[];
  terminalCommand: string;
  setTerminalCommand: Dispatch<SetStateAction<string>>;
  handleTerminalSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

export default function AdminLogsPanel({
  adminLogs,
  terminalCommand,
  setTerminalCommand,
  handleTerminalSubmit,
}: AdminLogsPanelProps) {
  const { t } = useTranslation();
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
        <h3 className="text-sm font-black text-slate-350 uppercase tracking-widest text-left flex items-center gap-2">
          <span>MIUPREP REAL-TIME AUDIT & CONTROL TERMINAL</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden shadow-inner flex flex-col">
        <div className="p-4 max-h-60 overflow-y-auto scrollbar-thin flex flex-col gap-2 font-mono text-[11px] border-b border-slate-850 text-left min-h-[120px]">
          {adminLogs.length === 0 ? (
            <span className="text-slate-650 italic">{t('alp_empty')}</span>
          ) : (
            adminLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 leading-relaxed">
                <span className="text-slate-500 shrink-0">
                  [{log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN') : '-'}]
                </span>
                <span
                  className={`font-black shrink-0 ${
                    log.level === 'ERROR'
                      ? 'text-rose-400'
                      : log.level === 'WARN'
                        ? 'text-amber-400'
                        : 'text-emerald-450'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="text-slate-300 font-medium flex-1">{log.message}</span>
                {log.payload && (
                  <span
                    className="text-slate-500 text-[10px] bg-slate-900 border border-slate-855 px-1 rounded max-w-[200px] truncate"
                    title={log.payload}
                  >
                    {log.payload}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleTerminalSubmit}
          className="flex items-center bg-slate-900/40 px-4 py-3 gap-2 text-left border-t border-slate-900"
        >
          <span className="font-mono text-xs font-bold text-emerald-450 shrink-0">MiuPrep@Admin:~$</span>
          <input
            type="text"
            value={terminalCommand}
            onChange={(event) => setTerminalCommand(event.target.value)}
            placeholder={t('alp_cli_placeholder')}
            className="flex-1 bg-transparent border-0 outline-none text-emerald-400 font-mono text-xs placeholder:text-slate-700 min-w-0"
          />
          <button
            type="submit"
            className="bg-emerald-950/80 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-400 px-3.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-100 hover:scale-[1.02] cursor-pointer"
          >
            {t('alp_execute')}
          </button>
        </form>
      </div>
    </section>
  );
}
