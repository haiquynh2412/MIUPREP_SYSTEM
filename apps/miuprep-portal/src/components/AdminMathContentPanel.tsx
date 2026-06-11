import type { FormEvent } from 'react';
import type { CasioTip, MathLesson } from '../lib/adminContent';

interface AdminMathContentPanelProps {
  mathLessons: MathLesson[];
  mathCasioTips: CasioTip[];
  newCasioTitle: string;
  newCasioSyntax: string;
  newCasioExpl: string;
  newMathId: string;
  newMathTitle: string;
  newMathTopic: string;
  newMathCount: number;
  latexMathId: string;
  latexMathTitle: string;
  latexMathEq: string;
  latexMathAns: string;
  latexMathExpl: string;
  onSetNewCasioTitle: (value: string) => void;
  onSetNewCasioSyntax: (value: string) => void;
  onSetNewCasioExpl: (value: string) => void;
  onSetNewMathId: (value: string) => void;
  onSetNewMathTitle: (value: string) => void;
  onSetNewMathTopic: (value: string) => void;
  onSetNewMathCount: (value: number) => void;
  onSetLatexMathId: (value: string) => void;
  onSetLatexMathTitle: (value: string) => void;
  onSetLatexMathEq: (value: string) => void;
  onSetLatexMathAns: (value: string) => void;
  onSetLatexMathExpl: (value: string) => void;
  onAddCasioTip: (event: FormEvent<HTMLFormElement>) => void;
  onAddMathLesson: (event: FormEvent<HTMLFormElement>) => void;
  onCreateLatexQuestion: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AdminMathContentPanel({
  mathLessons,
  mathCasioTips,
  newCasioTitle,
  newCasioSyntax,
  newCasioExpl,
  newMathId,
  newMathTitle,
  newMathTopic,
  newMathCount,
  latexMathId,
  latexMathTitle,
  latexMathEq,
  latexMathAns,
  latexMathExpl,
  onSetNewCasioTitle,
  onSetNewCasioSyntax,
  onSetNewCasioExpl,
  onSetNewMathId,
  onSetNewMathTitle,
  onSetNewMathTopic,
  onSetNewMathCount,
  onSetLatexMathId,
  onSetLatexMathTitle,
  onSetLatexMathEq,
  onSetLatexMathAns,
  onSetLatexMathExpl,
  onAddCasioTip,
  onAddMathLesson,
  onCreateLatexQuestion,
}: AdminMathContentPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-sans">Danh sách chuyên đề toán lớp 9</h4>
        <div className="border border-slate-855 rounded-2xl overflow-hidden bg-slate-950/40">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold">
                <th className="p-3">ID</th>
                <th className="p-3">Tên chuyên đề</th>
                <th className="p-3">Chủ đề</th>
                <th className="p-3">Số bài tập</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mathLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-slate-855/60 hover:bg-slate-900/40">
                  <td className="p-3 font-mono text-slate-500">{lesson.id}</td>
                  <td className="p-3 font-bold text-slate-200">{lesson.title}</td>
                  <td className="p-3 text-slate-450">{lesson.topic}</td>
                  <td className="p-3 font-semibold text-slate-355">{lesson.count}</td>
                  <td className="p-3">
                    <span className="text-[9px] bg-emerald-950/70 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">
                      {lesson.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-sans">Quản lý mẹo Casio FX-580</h4>

          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {mathCasioTips.map((tip) => (
              <div key={tip.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-left">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-orange-400">{tip.title}</span>
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] text-orange-300 font-extrabold whitespace-nowrap">
                    {tip.syntax}
                  </span>
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">{tip.explanation}</p>
              </div>
            ))}
          </div>

          <form onSubmit={onAddCasioTip} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block font-sans">Thêm mẹo bấm Casio mới</span>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tiêu đề mẹo *</label>
              <input
                type="text"
                placeholder="Ví dụ: Tính nhanh lim, đạo hàm..."
                value={newCasioTitle}
                onChange={(event) => onSetNewCasioTitle(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                required
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Cú pháp bấm máy *</label>
              <input
                type="text"
                placeholder="Ví dụ: [MODE] [7]..."
                value={newCasioSyntax}
                onChange={(event) => onSetNewCasioSyntax(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                required
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Giải thích chi tiết</label>
              <textarea
                rows={2}
                placeholder="Nhập hướng dẫn các bước..."
                value={newCasioExpl}
                onChange={(event) => onSetNewCasioExpl(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
            >
              Thêm mẹo Casio
            </button>
          </form>
        </div>

        <form onSubmit={onAddMathLesson} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block font-sans">Đăng ký chuyên đề Toán 9 mới</span>

          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Mã chuyên đề (tự chọn)</label>
            <input
              type="text"
              placeholder="Ví dụ: math-alg-06 (để trống tự tạo)..."
              value={newMathId}
              onChange={(event) => onSetNewMathId(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
            />
          </div>

          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tên chuyên đề *</label>
            <input
              type="text"
              placeholder="Ví dụ: Hàm số bậc nhất nâng cao..."
              value={newMathTitle}
              onChange={(event) => onSetNewMathTitle(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Phân loại</label>
              <select
                value={newMathTopic}
                onChange={(event) => onSetNewMathTopic(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs outline-none text-slate-200 cursor-pointer"
              >
                <option value="Đại số (Algebra)">Đại số (Algebra)</option>
                <option value="Hình học (Geometry)">Hình học (Geometry)</option>
                <option value="Thi thử (Mock)">Thi thử (Mock)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Số câu bài tập</label>
              <input
                type="number"
                min={5}
                max={200}
                value={newMathCount}
                onChange={(event) => onSetNewMathCount(Number.parseInt(event.target.value, 10) || 40)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-255"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
          >
            Thêm chuyên đề Toán
          </button>
        </form>

        <form onSubmit={onCreateLatexQuestion} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block font-sans">Trình soạn câu hỏi LaTeX Toán học</span>
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Mã câu hỏi (tự chọn)</label>
            <input
              type="text"
              placeholder="Ví dụ: math-q-10 (để trống tự tạo)..."
              value={latexMathId}
              onChange={(event) => onSetLatexMathId(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Nội dung câu hỏi *</label>
            <input
              type="text"
              placeholder="Ví dụ: Rút gọn biểu thức chứa căn..."
              value={latexMathTitle}
              onChange={(event) => onSetLatexMathTitle(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              required
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Phương trình toán LaTeX *</label>
            <input
              type="text"
              placeholder="Ví dụ: \\sqrt{x^2+y^2} = 5"
              value={latexMathEq}
              onChange={(event) => onSetLatexMathEq(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Đáp án đúng</label>
              <select
                value={latexMathAns}
                onChange={(event) => onSetLatexMathAns(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-200 cursor-pointer"
              >
                <option value="A">Đáp án A</option>
                <option value="B">Đáp án B</option>
                <option value="C">Đáp án C</option>
                <option value="D">Đáp án D</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Giải thích lời giải</label>
              <input
                type="text"
                placeholder="Giải thích các bước..."
                value={latexMathExpl}
                onChange={(event) => onSetLatexMathExpl(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              />
            </div>
          </div>

          {latexMathTitle && (
            <div className="p-3 bg-slate-900/60 border border-indigo-950 rounded-xl space-y-1.5">
              <span className="text-[8px] font-black uppercase text-indigo-400 block font-mono">Live preview</span>
              <p className="text-[10px] font-semibold text-slate-350">{latexMathTitle}</p>
              <p className="text-xs font-mono bg-slate-955 p-2 rounded border border-slate-850 text-indigo-400 font-bold text-center">
                {latexMathEq || 'f(x) = ...'}
              </p>
              <p className="text-[9px] text-slate-500 italic">Renders LaTeX-style math notation.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
          >
            Tạo câu hỏi LaTeX
          </button>
        </form>
      </div>
    </div>
  );
}
