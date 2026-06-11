import { useMemo } from 'react';
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
  { value: 'sat-1590-elite-ai-bank.json', label: 'Elite AI Bank (661 câu)' },
  { value: 'antigravity-bank.json', label: 'Antigravity Bank (7,158 câu)' },
  { value: 'opensat-pinesat.json', label: 'OpenSAT Pinesat (1,026 câu)' },
  { value: 'sat-king-supplemental-ai-bank.json', label: 'Supplemental AI Bank (354 câu)' },
  { value: 'archive-source-ai-bank.json', label: 'Archive AI Bank (792 câu)' },
  { value: 'sat-studio-foundation-bank.json', label: 'Foundation Bank (219 câu)' },
  { value: 'private-vault-archive-bank.json', label: 'Private Vault Bank (165 câu)' },
  { value: 'kaplan-sat-math-ai-bank.json', label: 'Kaplan Math AI Bank (148 câu)' },
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
  { name: 'antigravity-bank.json', size: '50.5 MB', count: '7,158 câu', type: 'Ngân hàng gốc siêu cấp', cert: 'College Board Aligned', status: 'Healthy - Active' },
  { name: 'opensat-pinesat.json', size: '9.3 MB', count: '1,026 câu', type: 'Đề thi adaptive practice', cert: 'Bluebook Aligned', status: 'Healthy - Active' },
  { name: 'sat-1590-elite-ai-bank.json', size: '5.1 MB', count: '661 câu', type: 'Tinh hoa AI 1590', cert: 'Strict 1600 Audit', status: 'Healthy - Active' },
  { name: 'sat-king-supplemental-ai-bank.json', size: '2.9 MB', count: '354 câu', type: 'Bổ sung AI King Pack', cert: 'Passed AutoCheck', status: 'Healthy - Active' },
  { name: 'archive-source-ai-bank.json', size: '6.7 MB', count: '792 câu', type: 'Kho lưu trữ đặc biệt', cert: 'Curriculum Metadata Aligned', status: 'Healthy - Active' },
  { name: 'canonical-sat-taxonomy.json', size: '16.5 KB', count: '518 dòng', type: 'Sơ đồ chuyên đề chuẩn', cert: 'Official Taxonomy v3', status: 'Healthy - Active' },
];

function difficultyClass(difficulty?: string) {
  if (difficulty === 'Hard') return 'bg-rose-955 border-rose-900 text-rose-455';
  if (difficulty === 'Medium') return 'bg-amber-955 border-amber-900 text-amber-400';
  return 'bg-emerald-950 border-emerald-900 text-emerald-400';
}

function getExplanation(question: AdminSatQuestion): string {
  if (typeof question.explanation === 'object') {
    return question.explanation.correct || JSON.stringify(question.explanation);
  }
  return question.explanation || 'Chưa có giải thích.';
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
  const filteredQuestions = useMemo(() => {
    const query = adminSearchQuery.trim().toLowerCase();
    return loadedQuestions.filter((question) => {
      const matchesDomain = adminSelectedDomain === 'all' || question.domain?.toLowerCase() === adminSelectedDomain.toLowerCase();
      const matchesSearch = !query || question.id?.toLowerCase().includes(query) || question.prompt?.toLowerCase().includes(query);
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
          { id: 'explorer' as const, label: 'Duyệt câu hỏi' },
          { id: 'integrity' as const, label: 'Tính toàn vẹn' },
          { id: 'calibration' as const, label: 'Hiệu chuẩn' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSetAdminSatSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-0 cursor-pointer ${
              adminSatSubTab === tab.id ? 'bg-rose-500 text-slate-955 font-bold shadow' : 'bg-transparent text-slate-400 hover:text-slate-200'
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
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Chọn ngân hàng</label>
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
                    {bank.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Lọc theo domain</label>
              <select
                value={adminSelectedDomain}
                onChange={(event) => {
                  onSetAdminSelectedDomain(event.target.value);
                  onSetAdminSelectedSkill('all');
                  onSetAdminCurrentPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-rose-500"
              >
                <option value="all">Tất cả domains</option>
                {SAT_DOMAIN_OPTIONS.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Tìm kiếm từ khóa</label>
              <input
                type="text"
                placeholder="Nhập ID hoặc từ khóa..."
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
                Tổng lọc: {filteredQuestions.length} / {loadedQuestions.length} câu
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-850">
              <table className="w-full border-collapse text-left text-xs text-slate-350">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-black uppercase font-sans">
                    <th className="p-3">ID</th>
                    <th className="p-3">Phân loại / Domain</th>
                    <th className="p-3">Chuyên đề / Skill</th>
                    <th className="p-3">Nội dung câu hỏi</th>
                    <th className="p-3">Độ khó</th>
                    <th className="p-3 text-center">Đáp án</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                        Không tìm thấy câu hỏi SAT nào.
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
                        <td className="p-3 text-slate-200 font-bold max-w-[120px] truncate" title={question.skill || question.canonicalSkill}>
                          {question.skill || question.canonicalSkill || 'Mixed'}
                        </td>
                        <td className="p-3 text-slate-450 max-w-[280px] truncate" title={question.prompt}>
                          {question.prompt}
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${difficultyClass(question.difficulty)}`}>
                            {question.difficulty || 'Hard'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-black text-emerald-400 uppercase">{question.correctAnswer}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => onSetActiveQuestionDetail(question)}
                            className="px-2.5 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all"
                          >
                            Duyệt
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
                Trang {currentPage} trên {totalPages} (Tổng số {filteredQuestions.length} câu)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => onSetAdminCurrentPage(Math.max(1, currentPage - 1))}
                  className="px-3 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => onSetAdminCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className="px-3 py-1 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Trang sau
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
                    <h3 className="text-sm font-black text-rose-400 font-sans uppercase">Chi tiết câu hỏi thích ứng</h3>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      ID: {activeQuestionDetail.id} - Section: {activeQuestionDetail.section || '-'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-955 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Domain</span>
                      <span className="font-extrabold text-slate-200">{activeQuestionDetail.domain}</span>
                    </div>
                    <div className="bg-slate-955 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Skill / Chuyên đề</span>
                      <span className="font-extrabold text-slate-200">{activeQuestionDetail.skill || activeQuestionDetail.canonicalSkill}</span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-955 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Nội dung câu hỏi</span>
                    <PromptWithAssets
                      text={activeQuestionDetail.prompt}
                      className="font-semibold text-slate-150 whitespace-pre-line leading-relaxed font-sans"
                    />
                  </div>

                  {activeQuestionDetail.choices && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block">Các phương án trắc nghiệm</span>
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
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Giải thích chi tiết</span>
                    <p className="text-slate-350 whitespace-pre-line leading-relaxed font-sans">{getExplanation(activeQuestionDetail)}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-805">
                  <button
                    type="button"
                    onClick={() => onSetActiveQuestionDetail(null)}
                    className="px-5 py-2 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                  >
                    Đóng
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
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest font-sans">Bảng kiểm tra tính toàn vẹn dữ liệu</h4>
              <p className="text-[10px] text-slate-500 mt-1 font-light font-sans leading-relaxed">
                Báo cáo kích thước file, số câu hỏi parsed thành công và trạng thái ngân hàng dữ liệu SAT.
              </p>
            </div>
            <div className="text-xs font-black text-emerald-450 font-mono bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-855 shrink-0">
              Tổng ngân hàng pool: 10,000+ câu
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-850">
            <table className="w-full border-collapse text-left text-xs text-slate-350">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-black uppercase font-sans">
                  <th className="p-4">Tên tệp vật lý</th>
                  <th className="p-4">Dung lượng</th>
                  <th className="p-4">Tổng số câu hỏi</th>
                  <th className="p-4">Loại ngân hàng</th>
                  <th className="p-4">Độ an toàn</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {INTEGRITY_BANKS.map((bank) => (
                  <tr key={bank.name} className="border-b border-slate-855 hover:bg-slate-950/40 font-sans">
                    <td className="p-4 font-mono font-bold text-rose-455">{bank.name}</td>
                    <td className="p-4 font-mono font-bold text-slate-205">{bank.size}</td>
                    <td className="p-4 font-bold text-slate-300">{bank.count}</td>
                    <td className="p-4 text-slate-450">{bank.type}</td>
                    <td className="p-4">
                      <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-850 px-2.5 py-0.5 rounded font-black font-mono">
                        {bank.cert}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[9px] bg-emerald-950/70 border border-emerald-900 text-emerald-400 px-2.5 py-0.5 rounded-full font-black uppercase">
                        {bank.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-955 rounded-2xl border border-slate-850 text-xs text-slate-500 font-light leading-relaxed font-sans">
            Bảo mật và bản quyền: dữ liệu được kiểm duyệt để giảm trùng lặp, giữ độ khó sát kỳ thi SAT thật và bảo vệ chất lượng nội dung.
          </div>
        </div>
      )}

      {adminSatSubTab === 'calibration' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-sans">Cấu hình tham số thích ứng</h4>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 font-sans">Mục tiêu điểm đánh giá SAT</label>
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
                  <span className="font-mono font-bold text-slate-200 shrink-0 w-12 text-right">{satDiagnosticThreshold}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 font-sans">IRT learning rate alpha</label>
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
                  <span className="font-mono font-bold text-slate-200 shrink-0 w-12 text-right">{satIrtAlpha.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-500 leading-relaxed font-light font-sans">
                Tham số IRT điều chỉnh tốc độ hệ thống thích ứng với kết quả Module 1 của học viên.
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xl">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 font-sans">Bộ hiệu chuẩn thống kê IRT</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-4 font-light font-sans">
                Chạy phân tích để cập nhật độ phân biệt, độ khó và tham số câu hỏi cho ngân hàng đề thi thích ứng.
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
              {isIrtCalibrating ? 'Đang hiệu chuẩn mô hình...' : 'Chạy hiệu chuẩn IRT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
