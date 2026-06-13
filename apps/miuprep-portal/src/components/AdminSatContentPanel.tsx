import { useMemo } from 'react';
import { useTranslation } from '@miuprep/i18n/src/react';
import type { SatQuestion } from '../lib/satPractice';
import PromptWithAssets from './PromptWithAssets';

type AdminSatSubTab = 'explorer' | 'integrity' | 'calibration';
export type AdminSatQuestion = SatQuestion & { section?: string };

interface AdminSatContentPanelProps {
  adminSatSubTab: AdminSatSubTab;
  adminSelectedSatBank: string;
  adminSearchQuery: string;
  adminSelectedDomain: string;
  adminCurrentPage: number;
  loadedQuestions: AdminSatQuestion[];
  activeQuestionDetail: AdminSatQuestion | null;
  satDiagnosticThreshold: number;
  satIrtAlpha: number;
  isIrtCalibrating: boolean;
  onSetAdminSatSubTab: (value: AdminSatSubTab) => void;
  onSetAdminSelectedSatBank: (value: string) => void;
  onSetAdminSearchQuery: (value: string) => void;
  onSetAdminSelectedDomain: (value: string) => void;
  onSetAdminSelectedSkill: (value: string) => void;
  onSetAdminCurrentPage: (value: number) => void;
  onSetActiveQuestionDetail: (value: AdminSatQuestion | null) => void;
  onSetSatDiagnosticThreshold: (value: number) => void;
  onSetSatIrtAlpha: (value: number) => void;
  onTriggerIrtCalibration: () => void;
}

const SAT_BANK_OPTIONS = [
  { value: 'sat-1590-elite-ai-bank.json', labelKey: 'asc_bank_label_elite', name: 'Elite AI Bank', count: '661' },
  { value: 'antigravity-bank.json', labelKey: 'asc_bank_label_antigravity', name: 'Antigravity Bank', count: '7,158' },
  { value: 'opensat-pinesat.json', labelKey: 'asc_bank_label_opensat', name: 'OpenSAT Pinesat', count: '1,026' },
  {
    value: 'sat-king-supplemental-ai-bank.json',
    labelKey: 'asc_bank_label_supplemental',
    name: 'Supplemental AI Bank',
    count: '354',
  },
  { value: 'archive-source-ai-bank.json', labelKey: 'asc_bank_label_archive', name: 'Archive AI Bank', count: '792' },
  {
    value: 'sat-studio-foundation-bank.json',
    labelKey: 'asc_bank_label_foundation',
    name: 'Foundation Bank',
    count: '219',
  },
  {
    value: 'private-vault-archive-bank.json',
    labelKey: 'asc_bank_label_private_vault',
    name: 'Private Vault Bank',
    count: '165',
  },
  {
    value: 'kaplan-sat-math-ai-bank.json',
    labelKey: 'asc_bank_label_kaplan',
    name: 'Kaplan Math AI Bank',
    count: '148',
  },
];

const SAT_DOMAIN_OPTIONS = [
  'Information and Ideas',
  'Craft and Structure',
  'Expression of Ideas',
  'Standard English Conventions',
  'Algebra',
  'Advanced Math',
  'Problem-Solving and Data Analysis',
  'Geometry and Trigonometry',
];

const INTEGRITY_BANKS = [
  {
    name: 'antigravity-bank.json',
    size: '50.5 MB',
    countNum: '7,158',
    countKey: 'asc_integrity_count_cau',
    typeKey: 'asc_integrity_type_antigravity',
    certKey: 'asc_integrity_cert_college_board',
    statusKey: 'asc_integrity_status_healthy',
  },
  {
    name: 'opensat-pinesat.json',
    size: '9.3 MB',
    countNum: '1,026',
    countKey: 'asc_integrity_count_cau',
    typeKey: 'asc_integrity_type_opensat',
    certKey: 'asc_integrity_cert_bluebook',
    statusKey: 'asc_integrity_status_healthy',
  },
  {
    name: 'sat-1590-elite-ai-bank.json',
    size: '5.1 MB',
    countNum: '661',
    countKey: 'asc_integrity_count_cau',
    typeKey: 'asc_integrity_type_elite',
    certKey: 'asc_integrity_cert_strict_1600',
    statusKey: 'asc_integrity_status_healthy',
  },
  {
    name: 'sat-king-supplemental-ai-bank.json',
    size: '2.9 MB',
    countNum: '354',
    countKey: 'asc_integrity_count_cau',
    typeKey: 'asc_integrity_type_king_pack',
    certKey: 'asc_integrity_cert_autocheck',
    statusKey: 'asc_integrity_status_healthy',
  },
  {
    name: 'archive-source-ai-bank.json',
    size: '6.7 MB',
    countNum: '792',
    countKey: 'asc_integrity_count_cau',
    typeKey: 'asc_integrity_type_archive',
    certKey: 'asc_integrity_cert_curriculum',
    statusKey: 'asc_integrity_status_healthy',
  },
  {
    name: 'canonical-sat-taxonomy.json',
    size: '16.5 KB',
    countNum: '518',
    countKey: 'asc_integrity_count_dong',
    typeKey: 'asc_integrity_type_taxonomy',
    certKey: 'asc_integrity_cert_official_taxonomy',
    statusKey: 'asc_integrity_status_healthy',
  },
];

function difficultyClass(difficulty?: string) {
  if (difficulty === 'Hard') return 'bg-rose-955 border-rose-900 text-rose-455';
  if (difficulty === 'Medium') return 'bg-amber-955 border-amber-900 text-amber-400';
  return 'bg-emerald-950 border-emerald-900 text-emerald-400';
}

function getExplanation(question: AdminSatQuestion, noExplanationText: string): string {
  if (typeof question.explanation === 'object') {
    return question.explanation.correct || JSON.stringify(question.explanation);
  }
  return question.explanation || noExplanationText;
}

export default function AdminSatContentPanel({
  adminSatSubTab,
  adminSelectedSatBank,
  adminSearchQuery,
  adminSelectedDomain,
  adminCurrentPage,
  loadedQuestions,
  activeQuestionDetail,
  satDiagnosticThreshold,
  satIrtAlpha,
  isIrtCalibrating,
  onSetAdminSatSubTab,
  onSetAdminSelectedSatBank,
  onSetAdminSearchQuery,
  onSetAdminSelectedDomain,
  onSetAdminSelectedSkill,
  onSetAdminCurrentPage,
  onSetActiveQuestionDetail,
  onSetSatDiagnosticThreshold,
  onSetSatIrtAlpha,
  onTriggerIrtCalibration,
}: AdminSatContentPanelProps) {
  const { t } = useTranslation();
  const filteredQuestions = useMemo(() => {
    const query = adminSearchQuery.trim().toLowerCase();
    return loadedQuestions.filter((question) => {
      const matchesDomain =
        adminSelectedDomain === 'all' || question.domain?.toLowerCase() === adminSelectedDomain.toLowerCase();
      const matchesSearch =
        !query || question.id?.toLowerCase().includes(query) || question.prompt?.toLowerCase().includes(query);
      return matchesDomain && matchesSearch;
    });
  }, [adminSearchQuery, adminSelectedDomain, loadedQuestions]);

  const pageSize = 10;
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const currentPage = Math.min(Math.max(adminCurrentPage, 1), totalPages);
  const pageItems = filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 text-left">
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 gap-2 self-start inline-flex">
        {[
          { id: 'explorer' as const, label: t('asc_tab_explorer') },
          { id: 'integrity' as const, label: t('asc_tab_integrity') },
          { id: 'calibration' as const, label: t('asc_tab_calibration') },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSetAdminSatSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-0 cursor-pointer ${
              adminSatSubTab === tab.id
                ? 'bg-rose-500 text-slate-955 font-bold shadow'
                : 'bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {adminSatSubTab === 'explorer' && (
        <div className="space-y-6">
          <div className="bg-slate-955 p-5 rounded-3xl border border-slate-850 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                {t('asc_label_select_bank')}
              </label>
              <select
                value={adminSelectedSatBank}
                onChange={(event) => {
                  onSetAdminSelectedSatBank(event.target.value);
                  onSetAdminCurrentPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-rose-500 animate-pulse-slow"
              >
                {SAT_BANK_OPTIONS.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {t(bank.labelKey, { name: bank.name, count: bank.count })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                {t('asc_label_filter_domain')}
              </label>
              <select
                value={adminSelectedDomain}
                onChange={(event) => {
                  onSetAdminSelectedDomain(event.target.value);
                  onSetAdminSelectedSkill('all');
                  onSetAdminCurrentPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-rose-500"
              >
                <option value="all">{t('asc_option_all_domains')}</option>
                {SAT_DOMAIN_OPTIONS.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                {t('asc_label_search_keyword')}
              </label>
              <input
                type="text"
                placeholder={t('asc_placeholder_search')}
                value={adminSearchQuery}
                onChange={(event) => {
                  onSetAdminSearchQuery(event.target.value);
                  onSetAdminCurrentPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-805 text-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-500 placeholder:text-slate-700"
              />
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-black text-rose-455 font-mono bg-rose-955 border border-rose-900/40 px-3 py-2 rounded-xl block text-center">
                {t('asc_filter_total', { filtered: filteredQuestions.length, total: loadedQuestions.length })}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-850">
              <table className="w-full border-collapse text-left text-xs text-slate-350">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-black uppercase font-sans">
                    <th className="p-3">{t('asc_th_id')}</th>
                    <th className="p-3">{t('asc_th_domain')}</th>
                    <th className="p-3">{t('asc_th_skill')}</th>
                    <th className="p-3">{t('asc_th_content')}</th>
                    <th className="p-3">{t('asc_th_difficulty')}</th>
                    <th className="p-3 text-center">{t('asc_th_answer')}</th>
                    <th className="p-3 text-center">{t('asc_th_action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                        {t('asc_empty_no_questions')}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((question) => (
                      <tr key={question.id} className="border-b border-slate-855 hover:bg-slate-950/40 font-sans">
                        <td className="p-3 font-mono font-bold text-rose-455">{question.id}</td>
                        <td className="p-3">
                          <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded font-medium">
                            {question.domain || 'Math'}
                          </span>
                        </td>
                        <td
                          className="p-3 text-slate-200 font-bold max-w-[120px] truncate"
                          title={question.skill || question.canonicalSkill}
                        >
                          {question.skill || question.canonicalSkill || 'Mixed'}
                        </td>
                        <td className="p-3 text-slate-450 max-w-[280px] truncate" title={question.prompt}>
                          {question.prompt}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${difficultyClass(question.difficulty)}`}
                          >
                            {question.difficulty || 'Hard'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-black text-emerald-400 uppercase">
                          {question.correctAnswer}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => onSetActiveQuestionDetail(question)}
                            className="px-2.5 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all"
                          >
                            {t('asc_btn_review')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                {t('asc_pagination_info', { current: currentPage, total: totalPages, count: filteredQuestions.length })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => onSetAdminCurrentPage(Math.max(1, currentPage - 1))}
                  className="px-3 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  {t('asc_btn_prev_page')}
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => onSetAdminCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className="px-3 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  {t('asc_btn_next_page')}
                </button>
              </div>
            </div>
          </div>

          {activeQuestionDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-md p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative text-left space-y-5 animate-fade-in">
                <button
                  type="button"
                  onClick={() => onSetActiveQuestionDetail(null)}
                  className="absolute top-4 right-4 bg-slate-955 hover:bg-slate-850 text-slate-500 hover:text-white border border-slate-805 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  x
                </button>

                <div className="flex items-center gap-3 pb-3 border-b border-slate-805">
                  <span className="text-2xl">SAT</span>
                  <div>
                    <h3 className="text-sm font-black text-rose-400 font-sans uppercase">{t('asc_modal_title')}</h3>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {t('asc_modal_id_section', {
                        id: activeQuestionDetail.id ?? '-',
                        section: activeQuestionDetail.section || '-',
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-955 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                        {t('asc_modal_domain')}
                      </span>
                      <span className="font-extrabold text-slate-200">{activeQuestionDetail.domain}</span>
                    </div>
                    <div className="bg-slate-955 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                        {t('asc_modal_skill')}
                      </span>
                      <span className="font-extrabold text-slate-200">
                        {activeQuestionDetail.skill || activeQuestionDetail.canonicalSkill}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-955 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                      {t('asc_modal_content')}
                    </span>
                    <PromptWithAssets
                      text={activeQuestionDetail.prompt}
                      className="font-semibold text-slate-150 whitespace-pre-line leading-relaxed font-sans"
                    />
                  </div>

                  {activeQuestionDetail.choices && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block">
                        {t('asc_modal_choices')}
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(activeQuestionDetail.choices).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                              key === activeQuestionDetail.correctAnswer
                                ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400'
                                : 'bg-slate-955 border-slate-855 text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded font-black flex items-center justify-center text-[9px] uppercase border shrink-0 ${
                                key === activeQuestionDetail.correctAnswer
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                  : 'bg-slate-900 border-slate-855 text-slate-550'
                              }`}
                            >
                              {key}
                            </span>
                            <span className="font-semibold leading-normal">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 bg-slate-955 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                      {t('asc_modal_explanation')}
                    </span>
                    <p className="text-slate-350 whitespace-pre-line leading-relaxed font-sans">
                      {getExplanation(activeQuestionDetail, t('asc_no_explanation'))}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-805">
                  <button
                    type="button"
                    onClick={() => onSetActiveQuestionDetail(null)}
                    className="px-5 py-2 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                  >
                    {t('asc_btn_close')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {adminSatSubTab === 'integrity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest font-sans">
                {t('asc_integrity_heading')}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 font-light font-sans leading-relaxed">
                {t('asc_integrity_desc')}
              </p>
            </div>
            <div className="text-xs font-black text-emerald-450 font-mono bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-855 shrink-0">
              {t('asc_integrity_pool_total')}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-850">
            <table className="w-full border-collapse text-left text-xs text-slate-350">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-black uppercase font-sans">
                  <th className="p-4">{t('asc_integrity_th_filename')}</th>
                  <th className="p-4">{t('asc_integrity_th_size')}</th>
                  <th className="p-4">{t('asc_integrity_th_count')}</th>
                  <th className="p-4">{t('asc_integrity_th_type')}</th>
                  <th className="p-4">{t('asc_integrity_th_safety')}</th>
                  <th className="p-4">{t('asc_integrity_th_status')}</th>
                </tr>
              </thead>
              <tbody>
                {INTEGRITY_BANKS.map((bank) => (
                  <tr key={bank.name} className="border-b border-slate-855 hover:bg-slate-950/40 font-sans">
                    <td className="p-4 font-mono font-bold text-rose-455">{bank.name}</td>
                    <td className="p-4 font-mono font-bold text-slate-205">{bank.size}</td>
                    <td className="p-4 font-bold text-slate-300">{t(bank.countKey, { count: bank.countNum })}</td>
                    <td className="p-4 text-slate-450">{t(bank.typeKey)}</td>
                    <td className="p-4">
                      <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-850 px-2.5 py-0.5 rounded font-black font-mono">
                        {t(bank.certKey)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[9px] bg-emerald-950/70 border border-emerald-900 text-emerald-400 px-2.5 py-0.5 rounded-full font-black uppercase">
                        {t(bank.statusKey)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-955 rounded-2xl border border-slate-850 text-xs text-slate-500 font-light leading-relaxed font-sans">
            {t('asc_integrity_security_note')}
          </div>
        </div>
      )}

      {adminSatSubTab === 'calibration' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-sans">
              {t('asc_calib_config_heading')}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 font-sans">
                  {t('asc_calib_target_score')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="800"
                    max="1600"
                    step="50"
                    value={satDiagnosticThreshold}
                    onChange={(event) => onSetSatDiagnosticThreshold(Number(event.target.value))}
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-200 shrink-0 w-12 text-right">
                    {satDiagnosticThreshold}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 font-sans">
                  {t('asc_calib_irt_alpha')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.01"
                    max="0.2"
                    step="0.01"
                    value={satIrtAlpha}
                    onChange={(event) => onSetSatIrtAlpha(Number(event.target.value))}
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-200 shrink-0 w-12 text-right">
                    {satIrtAlpha.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-500 leading-relaxed font-light font-sans">
                {t('asc_calib_irt_note')}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xl">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 font-sans">
                {t('asc_calib_irt_engine_heading')}
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-4 font-light font-sans">
                {t('asc_calib_irt_engine_desc')}
              </p>
            </div>

            <button
              type="button"
              disabled={isIrtCalibrating}
              onClick={onTriggerIrtCalibration}
              className={`w-full py-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl border-0 cursor-pointer shadow-lg shadow-rose-950/20 active:scale-[0.98] duration-100 ${
                isIrtCalibrating ? 'opacity-50 animate-pulse cursor-not-allowed' : ''
              }`}
            >
              {isIrtCalibrating ? t('asc_btn_calibrating') : t('asc_btn_run_calibration')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
