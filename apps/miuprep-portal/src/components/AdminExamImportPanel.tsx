import type { EnglishExamTrack } from '../lib/adminContent';

interface AdminExamImportPanelProps {
  track: EnglishExamTrack;
  newExamId: string;
  newExamTitle: string;
  newExamQuestions: number;
  newExamDuration: number;
  examJsonInput: string;
  examImportError: string | null;
  examImportSuccess: string | null;
  onSetNewExamId: (value: string) => void;
  onSetNewExamTitle: (value: string) => void;
  onSetNewExamQuestions: (value: number) => void;
  onSetNewExamDuration: (value: number) => void;
  onSetExamJsonInput: (value: string) => void;
  onAddExam: (track: EnglishExamTrack) => void;
  onLoadDemoExam: (track: EnglishExamTrack) => void;
  onImportJsonExam: (track: EnglishExamTrack) => void | Promise<void>;
}

export default function AdminExamImportPanel({
  track,
  newExamId,
  newExamTitle,
  newExamQuestions,
  newExamDuration,
  examJsonInput,
  examImportError,
  examImportSuccess,
  onSetNewExamId,
  onSetNewExamTitle,
  onSetNewExamQuestions,
  onSetNewExamDuration,
  onSetExamJsonInput,
  onAddExam,
  onLoadDemoExam,
  onImportJsonExam,
}: AdminExamImportPanelProps) {
  const trackLabel = track.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 text-left">
        <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider font-sans">
          Tạo nhanh đề {trackLabel} trực quan
        </h4>
        <div>
          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Mã đề thi (tự chọn)</label>
          <input
            type="text"
            placeholder={`Ví dụ: ${track}-mock-02 (để trống tự tạo)...`}
            value={newExamId}
            onChange={(event) => onSetNewExamId(event.target.value)}
            className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
          />
        </div>
        <div>
          <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tên đề thi *</label>
          <input
            type="text"
            placeholder="Ví dụ: Cambridge Academic Mock Test 1..."
            value={newExamTitle}
            onChange={(event) => onSetNewExamTitle(event.target.value)}
            className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Số câu hỏi</label>
            <input
              type="number"
              min={1}
              max={100}
              value={newExamQuestions}
              onChange={(event) => onSetNewExamQuestions(Number.parseInt(event.target.value, 10) || 40)}
              className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Thời gian (phút)</label>
            <input
              type="number"
              min={5}
              max={240}
              value={newExamDuration}
              onChange={(event) => onSetNewExamDuration(Number.parseInt(event.target.value, 10) || 60)}
              className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs outline-none text-slate-250"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onAddExam(track)}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer shadow active:scale-95 duration-100"
        >
          Tạo đề thi nhanh
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-sans">
            Nhập đề thi {trackLabel} (JSON)
          </h4>
          <button
            type="button"
            onClick={() => onLoadDemoExam(track)}
            className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer transition-all font-sans"
          >
            Nạp đề mẫu
          </button>
        </div>

        <div className="space-y-2">
          <textarea
            rows={6}
            placeholder={`Dán chuỗi đề thi JSON ${trackLabel} vào đây...`}
            value={examJsonInput}
            onChange={(event) => onSetExamJsonInput(event.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-3 text-[10px] font-mono outline-none text-slate-250 placeholder:text-slate-700 resize-none focus:border-indigo-500/60"
          />

          {examImportError && (
            <div className="text-[10px] text-rose-400 font-bold bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl text-left leading-relaxed font-sans">
              {examImportError}
            </div>
          )}

          {examImportSuccess && (
            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xl text-left leading-relaxed font-sans">
              {examImportSuccess}
            </div>
          )}

          <button
            type="button"
            onClick={() => void onImportJsonExam(track)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider rounded-xl border-0 cursor-pointer shadow-md transition-all"
          >
            Import đề thi {trackLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
