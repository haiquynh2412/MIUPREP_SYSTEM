import { useTranslation } from '@miuprep/i18n/src/react';
import type { LocalUser } from '@miuprep/db';
import {
  ensureEditableExamSections,
  type ContentReviewFilter,
  type ContentReviewStatus,
  type ContentReviewSummary,
  type EditableExamQuestion,
  type EditableExamSection,
  type EnglishExamTrack,
  type ImportedExam,
} from '../lib/adminContent';

type UserSummary = Omit<LocalUser, 'passwordHash'>;

interface AdminContentReviewPanelProps {
  track: EnglishExamTrack;
  currentUser: UserSummary | null;
  reviewFilter: ContentReviewFilter;
  reviewSummary: ContentReviewSummary;
  filteredExams: ImportedExam[];
  selectedExamId: string | null;
  examDraft: ImportedExam | null;
  onSetReviewFilter: (filter: ContentReviewFilter) => void;
  onExportReviewSet: () => void;
  onOpenExam: (exam: ImportedExam) => void;
  onSaveDraft: (reviewStatus: ContentReviewStatus) => void;
  onExportChangeSet: () => void;
  onCloseDraft: () => void;
  onUpdateDraft: (patch: Partial<ImportedExam>) => void;
  onUpdateSection: (sectionIndex: number, patch: Partial<EditableExamSection>) => void;
  onUpdateQuestion: (sectionIndex: number, questionIndex: number, patch: Partial<EditableExamQuestion>) => void;
  onAddSection: () => void;
  onAddQuestion: (sectionIndex: number) => void;
  onRemoveQuestion: (sectionIndex: number, questionIndex: number) => void;
}

const REVIEW_FILTERS: Array<{
  id: ContentReviewFilter;
  labelKey: string;
  countKey: keyof Pick<ContentReviewSummary, 'totalExams' | 'unchecked' | 'needsFix' | 'checked'>;
}> = [
  { id: 'all', labelKey: 'acr_filter_all', countKey: 'totalExams' },
  { id: 'unchecked', labelKey: 'acr_filter_draft', countKey: 'unchecked' },
  { id: 'needs_fix', labelKey: 'acr_filter_needs_fix', countKey: 'needsFix' },
  { id: 'checked', labelKey: 'acr_filter_checked', countKey: 'checked' },
];

const REVIEW_METRICS: Array<{
  labelKey: string;
  key: keyof ContentReviewSummary;
  tone: string;
}> = [
  { labelKey: 'acr_metric_exams', key: 'totalExams', tone: 'text-indigo-300' },
  { labelKey: 'acr_metric_questions', key: 'totalQuestions', tone: 'text-cyan-300' },
  { labelKey: 'acr_metric_checked', key: 'checked', tone: 'text-emerald-300' },
  { labelKey: 'acr_metric_needs_fix', key: 'needsFix', tone: 'text-rose-300' },
  { labelKey: 'acr_metric_draft', key: 'unchecked', tone: 'text-amber-300' },
];

function reviewStatusKey(status: ImportedExam['reviewStatus']) {
  if (status === 'checked') return 'acr_status_checked';
  if (status === 'needs_fix') return 'acr_status_needs_fix';
  return 'acr_status_unchecked';
}

function reviewStatusClass(status: ImportedExam['reviewStatus']) {
  if (status === 'checked') {
    return 'bg-emerald-950/70 border-emerald-900 text-emerald-400';
  }

  if (status === 'needs_fix') {
    return 'bg-rose-950/70 border-rose-900 text-rose-400';
  }

  return 'bg-amber-950/70 border-amber-900 text-amber-400';
}

export default function AdminContentReviewPanel({
  track,
  currentUser,
  reviewFilter,
  reviewSummary,
  filteredExams,
  selectedExamId,
  examDraft,
  onSetReviewFilter,
  onExportReviewSet,
  onOpenExam,
  onSaveDraft,
  onExportChangeSet,
  onCloseDraft,
  onUpdateDraft,
  onUpdateSection,
  onUpdateQuestion,
  onAddSection,
  onAddQuestion,
  onRemoveQuestion,
}: AdminContentReviewPanelProps) {
  const { t } = useTranslation();
  const trackLabel = track.toUpperCase();
  const activeDraft = examDraft && examDraft.exam.toLowerCase() === track ? examDraft : null;

  return (
    <div className="lg:col-span-2 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-sans">
        {t('acr_exam_list_heading', { track: trackLabel })}
      </h4>

      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <p className="text-[11px] text-slate-500 mt-0 mb-0">
          {t('acr_review_progress', {
            rate: reviewSummary.completionRate,
            checked: reviewSummary.checked,
            total: reviewSummary.totalExams,
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportReviewSet}
            className="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase cursor-pointer transition-all bg-emerald-500 text-slate-950 border-emerald-300 hover:bg-emerald-400"
          >
            {t('acr_export_review_set')}
          </button>
          {REVIEW_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onSetReviewFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase cursor-pointer transition-all ${
                reviewFilter === filter.id
                  ? 'bg-indigo-400 text-slate-950 border-indigo-300'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-indigo-300 hover:border-indigo-900'
              }`}
            >
              {t(filter.labelKey)} {reviewSummary[filter.countKey]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {REVIEW_METRICS.map((metric) => (
          <div key={metric.labelKey} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black m-0">{t(metric.labelKey)}</p>
            <p className={`text-xl font-black mt-1 mb-0 ${metric.tone}`}>{reviewSummary[metric.key]}</p>
          </div>
        ))}
      </div>

      <div className="border border-slate-855 rounded-2xl overflow-hidden bg-slate-950/40">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold font-sans">
              <th className="p-3">{t('acr_col_exam_name')}</th>
              <th className="p-3">{t('acr_col_track')}</th>
              <th className="p-3">{t('acr_col_questions')}</th>
              <th className="p-3">{t('acr_col_duration')}</th>
              <th className="p-3">{t('acr_col_status')}</th>
              <th className="p-3">{t('acr_col_review')}</th>
              <th className="p-3 text-center">{t('acr_col_action')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-slate-500 font-bold" colSpan={7}>
                  {t('acr_no_exams_match')}
                </td>
              </tr>
            ) : (
              filteredExams.map((exam) => (
                <tr key={exam.id} className="border-b border-slate-850/60 hover:bg-slate-900/40 font-sans">
                  <td className="p-3 font-bold text-slate-200">{exam.title}</td>
                  <td className="p-3 font-mono text-indigo-400">{exam.exam}</td>
                  <td className="p-3 text-slate-350">{t('acr_questions_count', { count: exam.questions })}</td>
                  <td className="p-3 text-slate-350">{t('acr_minutes_count', { count: exam.duration })}</td>
                  <td className="p-3">
                    <span className="text-[9px] bg-emerald-950/70 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">
                      {exam.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black border ${reviewStatusClass(exam.reviewStatus)}`}>
                      {t(reviewStatusKey(exam.reviewStatus))}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenExam(exam)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border cursor-pointer transition-all ${
                        selectedExamId === exam.id
                          ? 'bg-indigo-400 text-slate-950 border-indigo-300'
                          : 'bg-slate-950 text-indigo-300 border-indigo-900 hover:bg-indigo-950/60'
                      }`}
                    >
                      {t('acr_open_edit')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {activeDraft && (
        <div className="bg-slate-950/70 border border-indigo-900/50 rounded-3xl p-5 space-y-5 shadow-xl">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-300 m-0">{t('acr_editor_title')}</p>
              <h4 className="text-lg font-black text-slate-100 mt-1 mb-0">{activeDraft.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 mb-0 font-mono">
                {t('acr_editor_meta', {
                  id: activeDraft.id,
                  exam: activeDraft.exam,
                  reviewer: activeDraft.reviewer || currentUser?.username || 'admin',
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSaveDraft('unchecked')}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-black uppercase cursor-pointer"
              >
                {t('acr_save_draft')}
              </button>
              <button
                type="button"
                onClick={() => onSaveDraft('needs_fix')}
                className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-900 text-[10px] font-black uppercase cursor-pointer"
              >
                {t('acr_mark_needs_fix')}
              </button>
              <button
                type="button"
                onClick={() => onSaveDraft('checked')}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 text-[10px] font-black uppercase cursor-pointer"
              >
                {t('acr_save_checked')}
              </button>
              <button
                type="button"
                onClick={onExportChangeSet}
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300 text-[10px] font-black uppercase cursor-pointer"
              >
                {t('acr_export_change_set')}
              </button>
              <button
                type="button"
                onClick={onCloseDraft}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-black uppercase cursor-pointer"
              >
                {t('acr_close')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px] gap-3">
            <div>
              <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">{t('acr_label_exam_title')}</label>
              <input
                value={activeDraft.title}
                onChange={(event) => onUpdateDraft({ title: event.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">{t('acr_label_questions')}</label>
              <input
                type="number"
                min={1}
                value={activeDraft.questions}
                onChange={(event) => onUpdateDraft({ questions: Number(event.target.value) || 1 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">{t('acr_label_minutes')}</label>
              <input
                type="number"
                min={1}
                value={activeDraft.duration}
                onChange={(event) => onUpdateDraft({ duration: Number(event.target.value) || 1 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {ensureEditableExamSections(activeDraft).map((section, sectionIndex) => (
              <div key={`${section.id}-${sectionIndex}`} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                  <div>
                    <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">{t('acr_label_section_title')}</label>
                    <input
                      value={section.title}
                      onChange={(event) => onUpdateSection(sectionIndex, { title: event.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddQuestion(sectionIndex)}
                    className="px-3 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 text-[10px] font-black uppercase cursor-pointer"
                  >
                    {t('acr_add_question')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">{t('acr_label_passage')}</label>
                    <textarea
                      rows={3}
                      value={section.passageHtml || ''}
                      onChange={(event) => onUpdateSection(sectionIndex, { passageHtml: event.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-indigo-500 resize-y"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">{t('acr_label_transcript')}</label>
                    <textarea
                      rows={3}
                      value={section.transcript || ''}
                      onChange={(event) => onUpdateSection(sectionIndex, { transcript: event.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-indigo-500 resize-y"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {section.questions.length === 0 ? (
                    <div className="border border-dashed border-slate-750 rounded-xl p-4 text-[11px] text-slate-500">
                      {t('acr_empty_questions_hint')}
                    </div>
                  ) : (
                    section.questions.map((question, questionIndex) => (
                      <div key={`${question.id}-${questionIndex}`} className="bg-slate-950/75 border border-slate-850 rounded-2xl p-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_140px_auto] gap-2 items-start">
                          <input
                            value={question.id}
                            onChange={(event) => onUpdateQuestion(sectionIndex, questionIndex, { id: event.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-indigo-300 font-mono outline-none"
                          />
                          <textarea
                            rows={2}
                            value={question.text}
                            onChange={(event) => onUpdateQuestion(sectionIndex, questionIndex, { text: event.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-100 outline-none resize-y"
                          />
                          <input
                            value={question.answer}
                            onChange={(event) => onUpdateQuestion(sectionIndex, questionIndex, { answer: event.target.value })}
                            placeholder={t('acr_placeholder_answer')}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-emerald-300 font-mono outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveQuestion(sectionIndex, questionIndex)}
                            className="px-2 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-900 text-[10px] font-black cursor-pointer"
                          >
                            {t('acr_remove')}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <textarea
                            rows={2}
                            value={(question.options || []).join('\n')}
                            onChange={(event) =>
                              onUpdateQuestion(sectionIndex, questionIndex, {
                                options: event.target.value
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder={t('acr_placeholder_options')}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-300 outline-none resize-y"
                          />
                          <textarea
                            rows={2}
                            value={question.note || ''}
                            onChange={(event) => onUpdateQuestion(sectionIndex, questionIndex, { note: event.target.value })}
                            placeholder={t('acr_placeholder_note')}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-300 outline-none resize-y"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onAddSection}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-black uppercase cursor-pointer"
            >
              {t('acr_add_section')}
            </button>
            <button
              type="button"
              onClick={() => onSaveDraft('unchecked')}
              className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 border border-indigo-300 text-[10px] font-black uppercase cursor-pointer"
            >
              {t('acr_save_draft')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
