import type { FormEvent } from 'react';
import { useTranslation } from '@miuprep/i18n/src/react';
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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-sans">{t('amc_math_lessons_heading')}</h4>
        <div className="border border-slate-855 rounded-2xl overflow-hidden bg-slate-950/40">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold">
                <th className="p-3">{t('amc_col_id')}</th>
                <th className="p-3">{t('amc_col_lesson_name')}</th>
                <th className="p-3">{t('amc_col_topic')}</th>
                <th className="p-3">{t('amc_col_exercise_count')}</th>
                <th className="p-3">{t('amc_col_status')}</th>
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-sans">{t('amc_casio_manage_heading')}</h4>

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
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block font-sans">{t('amc_casio_add_heading')}</span>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_casio_title_label')}</label>
              <input
                type="text"
                placeholder={t('amc_casio_title_placeholder')}
                value={newCasioTitle}
                onChange={(event) => onSetNewCasioTitle(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                required
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_casio_syntax_label')}</label>
              <input
                type="text"
                placeholder={t('amc_casio_syntax_placeholder')}
                value={newCasioSyntax}
                onChange={(event) => onSetNewCasioSyntax(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
                required
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_casio_expl_label')}</label>
              <textarea
                rows={2}
                placeholder={t('amc_casio_expl_placeholder')}
                value={newCasioExpl}
                onChange={(event) => onSetNewCasioExpl(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
            >
              {t('amc_casio_submit')}
            </button>
          </form>
        </div>

        <form onSubmit={onAddMathLesson} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block font-sans">{t('amc_lesson_add_heading')}</span>

          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_lesson_id_label')}</label>
            <input
              type="text"
              placeholder={t('amc_lesson_id_placeholder')}
              value={newMathId}
              onChange={(event) => onSetNewMathId(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
            />
          </div>

          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_lesson_title_label')}</label>
            <input
              type="text"
              placeholder={t('amc_lesson_title_placeholder')}
              value={newMathTitle}
              onChange={(event) => onSetNewMathTitle(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_lesson_category_label')}</label>
              <select
                value={newMathTopic}
                onChange={(event) => onSetNewMathTopic(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs outline-none text-slate-200 cursor-pointer"
              >
                <option value="Đại số (Algebra)">{t('amc_topic_algebra')}</option>
                <option value="Hình học (Geometry)">{t('amc_topic_geometry')}</option>
                <option value="Thi thử (Mock)">{t('amc_topic_mock')}</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_lesson_count_label')}</label>
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
            {t('amc_lesson_submit')}
          </button>
        </form>

        <form onSubmit={onCreateLatexQuestion} className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block font-sans">{t('amc_latex_heading')}</span>
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_latex_id_label')}</label>
            <input
              type="text"
              placeholder={t('amc_latex_id_placeholder')}
              value={latexMathId}
              onChange={(event) => onSetLatexMathId(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_latex_content_label')}</label>
            <input
              type="text"
              placeholder={t('amc_latex_content_placeholder')}
              value={latexMathTitle}
              onChange={(event) => onSetLatexMathTitle(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              required
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_latex_equation_label')}</label>
            <input
              type="text"
              placeholder={t('amc_latex_equation_placeholder')}
              value={latexMathEq}
              onChange={(event) => onSetLatexMathEq(event.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_latex_answer_label')}</label>
              <select
                value={latexMathAns}
                onChange={(event) => onSetLatexMathAns(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-200 cursor-pointer"
              >
                <option value="A">{t('amc_latex_answer_a')}</option>
                <option value="B">{t('amc_latex_answer_b')}</option>
                <option value="C">{t('amc_latex_answer_c')}</option>
                <option value="D">{t('amc_latex_answer_d')}</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{t('amc_latex_expl_label')}</label>
              <input
                type="text"
                placeholder={t('amc_latex_expl_placeholder')}
                value={latexMathExpl}
                onChange={(event) => onSetLatexMathExpl(event.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-slate-250 placeholder:text-slate-700"
              />
            </div>
          </div>

          {latexMathTitle && (
            <div className="p-3 bg-slate-900/60 border border-indigo-950 rounded-xl space-y-1.5">
              <span className="text-[8px] font-black uppercase text-indigo-400 block font-mono">{t('amc_live_preview')}</span>
              <p className="text-[10px] font-semibold text-slate-350">{latexMathTitle}</p>
              <p className="text-xs font-mono bg-slate-955 p-2 rounded border border-slate-850 text-indigo-400 font-bold text-center">
                {latexMathEq || 'f(x) = ...'}
              </p>
              <p className="text-[9px] text-slate-500 italic">{t('amc_renders_latex_note')}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
          >
            {t('amc_latex_submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
