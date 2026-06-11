import type React from 'react';
import { getSatExplanation, type SatPracticeState } from '../lib/satPractice';
import type { TemplatePracticeState } from '../lib/templatePractice';
import type { EnglishItemBankPracticeState } from '../lib/englishItemBankPractice';
import PromptWithAssets from './PromptWithAssets';

type ActiveStudentTab = 'dashboard' | 'sat-board';

interface SatTaxonomyDomain {
  targetPct?: number;
  canonicalSkills?: Record<string, unknown>;
}

interface SatTaxonomySection {
  domains?: Record<string, SatTaxonomyDomain>;
}

export interface SatTaxonomy {
  sections?: Record<string, SatTaxonomySection>;
}

interface StudentSatBoardWorkspaceProps {
  satEstimatedScore: number;
  satTargetScore: number;
  fishCoins: number;
  selectedSatBank: string;
  setSelectedSatBank: React.Dispatch<React.SetStateAction<string>>;
  isLoadingQuestions: boolean;
  activePracticeState: SatPracticeState | null;
  setActivePracticeState: React.Dispatch<React.SetStateAction<SatPracticeState | null>>;
  setTemplatePracticeState: React.Dispatch<React.SetStateAction<TemplatePracticeState | null>>;
  setEnglishItemBankPracticeState: React.Dispatch<React.SetStateAction<EnglishItemBankPracticeState | null>>;
  satTaxonomy: SatTaxonomy | null;
  setActiveStudentTab: React.Dispatch<React.SetStateAction<ActiveStudentTab>>;
  handleAnswerSatQuestion: (choice: string) => void;
  handleNextSatQuestion: () => void;
  handleStartPractice: (domain: string, skill: string) => void;
}

export default function StudentSatBoardWorkspace({
  satEstimatedScore,
  satTargetScore,
  fishCoins,
  selectedSatBank,
  setSelectedSatBank,
  isLoadingQuestions,
  activePracticeState,
  setActivePracticeState,
  setTemplatePracticeState,
  setEnglishItemBankPracticeState,
  satTaxonomy,
  setActiveStudentTab,
  handleAnswerSatQuestion,
  handleNextSatQuestion,
  handleStartPractice,
}: StudentSatBoardWorkspaceProps): JSX.Element {
  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* SAT Header Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-rose-950/5 to-slate-950">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setActiveStudentTab('dashboard');
              setActivePracticeState(null);
              setEnglishItemBankPracticeState(null);
            }}
            className="px-4 py-2 bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            ← Quay lại Dashboard
          </button>
          <div>
            <h2 className="text-lg font-black text-rose-400 font-sans tracking-tight">STUDIO SAT THÍCH ỨNG</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Tích hợp lý thuyết IRT & Động cơ thi thử Bluebook</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Dynamic IRT Gauge */}
          <div className="bg-slate-955 border border-slate-850 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xl">🧠</span>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Estimated IRT</span>
              <span className="text-sm font-black text-rose-400 font-mono">{satEstimatedScore} <span className="text-[10px] text-slate-500">/ 1600</span></span>
            </div>
          </div>

          {/* Target Score */}
          <div className="bg-slate-955 border border-slate-850 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Mục tiêu</span>
              <span className="text-sm font-black text-amber-400 font-mono">{satTargetScore} <span className="text-[10px] text-slate-500">/ 1600</span></span>
            </div>
          </div>

          {/* Coins Balance */}
          <div className="bg-slate-955 border border-slate-850 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xl">🐟</span>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Salmon Coins</span>
              <span className="text-sm font-black text-emerald-400 font-mono">{fishCoins} Xu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic JSON Bank Selector Card */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <span className="text-3xl bg-slate-955 p-2 rounded-2xl border border-slate-850">🎓</span>
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Chọn Ngân Hàng Đề Thi SAT (10,000+ Câu)</span>
            <p className="text-xs text-slate-300 font-bold">
              {selectedSatBank === 'antigravity-bank.json' 
                ? 'Master Antigravity Bank (7,158 câu cực lớn • Đầy đủ Reading, Writing & Math)' 
                : selectedSatBank === 'opensat-pinesat.json'
                  ? 'OpenSAT Pinesat (1,026 câu thi thử thích ứng)'
                  : selectedSatBank === 'sat-1590-elite-ai-bank.json'
                    ? 'Elite AI Bank (661 câu tinh hoa nâng cao)'
                    : selectedSatBank === 'sat-studio-foundation-bank.json'
                      ? 'SAT Studio Foundation Bank (219 câu chuyên đề nền tảng)'
                      : selectedSatBank === 'private-vault-archive-bank.json'
                        ? 'Private Vault Archive Bank (165 câu lưu trữ đặc biệt)'
                        : selectedSatBank === 'kaplan-sat-math-ai-bank.json'
                          ? 'Kaplan SAT Math AI Bank (148 câu toán cao cấp)'
                          : 'Supplemental SAT AI Question Pack'}
            </p>
          </div>
        </div>

        <select
          value={selectedSatBank}
          onChange={e => {
            setSelectedSatBank(e.target.value);
            setActivePracticeState(null);
            setTemplatePracticeState(null);
            setEnglishItemBankPracticeState(null);
          }}
          className="bg-slate-955 border border-slate-850 text-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer focus:border-rose-500 min-w-[240px]"
        >
          <option value="sat-1590-elite-ai-bank.json">1. Elite AI Bank (661 câu - Nạp nhanh 🚀)</option>
          <option value="antigravity-bank.json">2. Antigravity Bank (7,158 câu - Dung lượng lớn 50MB 🐘)</option>
          <option value="opensat-pinesat.json">3. OpenSAT Pinesat (1,026 câu)</option>
          <option value="sat-king-supplemental-ai-bank.json">4. Supplemental AI Bank (354 câu)</option>
          <option value="archive-source-ai-bank.json">5. Archive AI Bank (792 câu)</option>
          <option value="sat-studio-foundation-bank.json">6. Foundation Bank (219 câu)</option>
          <option value="private-vault-archive-bank.json">7. Private Vault Bank (165 câu)</option>
          <option value="kaplan-sat-math-ai-bank.json">8. Kaplan Math AI Bank (148 câu)</option>
        </select>
      </div>

      {/* Loading Indicator */}
      {isLoadingQuestions && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold font-sans">
            Đang nạp cơ sở dữ liệu SAT thích ứng meow... {selectedSatBank === 'antigravity-bank.json' ? '(Tệp dữ liệu siêu lớn 50MB, vui lòng đợi trong giây lát...)' : 'Tải cực nhanh...'}
          </p>
        </div>
      )}

      {/* Main Workspace Display */}
      {!isLoadingQuestions && (
        activePracticeState ? (
          /* ==========================================
             PRACTICE MODE ACTIVE
             ========================================== */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Left: Active Question Board */}
            <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
              
              {/* Breadcrumb info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-805">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-455">
                    {activePracticeState.domain} • {activePracticeState.skill}
                  </span>
                  <h3 className="text-xs font-black text-slate-400">
                    Câu hỏi {activePracticeState.currentIndex + 1} trên {activePracticeState.questions.length}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                    activePracticeState.questions[activePracticeState.currentIndex].difficulty === 'Hard'
                      ? 'bg-rose-950/70 border-rose-900 text-rose-400'
                      : activePracticeState.questions[activePracticeState.currentIndex].difficulty === 'Medium'
                        ? 'bg-amber-950/70 border-amber-900 text-amber-400'
                        : 'bg-emerald-950/70 border-emerald-900 text-emerald-400'
                  }`}>
                    Độ khó: {activePracticeState.questions[activePracticeState.currentIndex].difficulty || 'Medium'}
                  </span>
                  <span className="text-[9px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                    ID: {activePracticeState.questions[activePracticeState.currentIndex].id}
                  </span>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="space-y-4">
                <PromptWithAssets
                  text={activePracticeState.questions[activePracticeState.currentIndex].prompt}
                  className="text-sm font-extrabold text-slate-150 leading-relaxed bg-slate-955 p-5 rounded-2xl border border-slate-850/60 font-sans shadow-inner whitespace-pre-line"
                />
              </div>

              {/* Choices Panel */}
              <div className="space-y-3">
                {activePracticeState.questions[activePracticeState.currentIndex].choices ? (
                  /* Multiple Choice Questions */
                  Object.entries(activePracticeState.questions[activePracticeState.currentIndex].choices).map(([opt, text]) => {
                    const isSelected = activePracticeState.selectedAnswer === opt;
                    const isCorrectAns = activePracticeState.questions[activePracticeState.currentIndex].correctAnswer?.trim().toUpperCase() === opt.toUpperCase();
                    const hasBeenAnswered = activePracticeState.answered;

                    let btnStyle = "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300";
                    if (hasBeenAnswered) {
                      if (isCorrectAns) {
                        btnStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-400 font-extrabold";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-950/30 border-rose-500 text-rose-455 font-extrabold";
                      } else {
                        btnStyle = "bg-slate-950/30 border-slate-900 text-slate-600 opacity-60";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-rose-950/30 border-rose-500 text-rose-400";
                    }

                    return (
                      <button
                        key={opt}
                        disabled={hasBeenAnswered}
                        onClick={() => handleAnswerSatQuestion(opt)}
                        className={`w-full p-4 rounded-2xl border text-xs text-left transition-all duration-150 flex items-start gap-3 hover:scale-[1.002] cursor-pointer ${btnStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg font-black flex items-center justify-center shrink-0 border uppercase text-[10px] ${
                          isSelected 
                            ? 'bg-rose-500 border-rose-400 text-slate-950' 
                            : hasBeenAnswered && isCorrectAns
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {opt}
                        </span>
                        <span className="flex-1 leading-normal font-semibold">{text as string}</span>
                      </button>
                    );
                  })
                ) : (
                  /* Student-Produced Response (SPR) Math questions */
                  <div className="p-4 bg-slate-955 rounded-2xl border border-slate-850 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Nhập kết quả số của bạn</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={activePracticeState.answered}
                        placeholder="Ví dụ: 5, -2.5, 7/3..."
                        value={activePracticeState.customInput}
                        onChange={e => setActivePracticeState({ ...activePracticeState, customInput: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-500 text-slate-200"
                      />
                      <button
                        disabled={activePracticeState.answered || !activePracticeState.customInput.trim()}
                        onClick={() => handleAnswerSatQuestion(activePracticeState.customInput.trim())}
                        className="px-6 bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all border-0 cursor-pointer shadow disabled:opacity-50"
                      >
                        Gửi Đáp Án
                      </button>
                    </div>
                    {activePracticeState.answered && (
                      <p className="text-xs text-slate-400 font-medium">
                        Đáp án chính xác: <strong className="text-emerald-400 font-mono">{activePracticeState.questions[activePracticeState.currentIndex].correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Explanation box */}
              {activePracticeState.explanationOpened && (
                <div className="bg-slate-955 rounded-2xl border border-slate-850 p-5 space-y-3 text-xs leading-relaxed animate-fade-in">
                  <span className="font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                    <span>💡 HƯỚNG DẪN GIẢI THÍCH SƯ PHẠM CHI TIẾT</span>
                  </span>
                  <p className="text-slate-300 font-medium font-sans bg-slate-950 p-4 rounded-xl border border-slate-900 whitespace-pre-line leading-relaxed">
                    {getSatExplanation(activePracticeState.questions[activePracticeState.currentIndex])}
                  </p>
                </div>
              )}

              {/* Next Question Bar */}
              {activePracticeState.answered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextSatQuestion}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl border-0 shadow active:scale-95 duration-100 cursor-pointer"
                  >
                    {activePracticeState.currentIndex + 1 < activePracticeState.questions.length 
                      ? 'Câu Tiếp Theo ➔' 
                      : 'Kết Thúc & Tổng Kết'}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Collapsible Desmos Math Calculator */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 font-sans flex items-center gap-1.5">
                  🧮 Máy tính vẽ đồ thị Desmos
                </span>
                <span className="text-[9px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono">LIVE PREP</span>
              </div>
              
              <div className="border border-slate-850 rounded-2xl overflow-hidden h-[360px] bg-slate-950 relative shadow-inner">
                <iframe
                  src="https://www.desmos.com/calculator?embed=true"
                  width="100%"
                  height="100%"
                  style={{ border: 'none', filter: 'invert(90%) hue-rotate(180deg)' }}
                  title="Desmos Live Inside SAT Studio"
                />
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed font-light">
                * Dành cho phần Math: Vẽ các phương trình giao nhau để giải tìm nghiệm nhanh nhất. Máy tính được tích hợp chuẩn giao diện tối.
              </p>
            </div>
          </div>
        ) : (
          /* ==========================================
             OVERVIEW: KEY MATRIX OF TOPICS
             ========================================== */
          <div className="space-y-8 animate-fade-in">
            
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-rose-950/20 via-slate-900 to-rose-900/10 border border-rose-500/20 rounded-3xl p-6 text-left flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 bg-rose-500 h-full" />
              <div className="space-y-2">
                <h2 className="text-lg font-black text-rose-455 font-sans tracking-wide uppercase">⚡ LUYỆN TẬP CHUYÊN ĐỀ HỆ THỐNG THÍCH ỨNG</h2>
                <p className="text-xs text-slate-350 leading-relaxed font-light font-sans max-w-2xl">
                  Hệ thống tự động điều chỉnh độ khó của câu hỏi theo mức năng lực thời gian thực dựa trên Lý thuyết Ứng đáp Câu hỏi (IRT). Hãy chọn một kỹ năng nhỏ bất kỳ bên dưới để bắt đầu meow!
                </p>
              </div>
              <button
                onClick={() => handleStartPractice('all', 'all')}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-extrabold uppercase text-xs tracking-wider rounded-2xl border-0 shadow active:scale-95 duration-100 cursor-pointer shrink-0"
              >
                🔥 Thi thử thích ứng tổng hợp
              </button>
            </div>

            {/* Skill Taxonomy Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              
              {/* Section 1: Reading & Writing */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <span>📚 READING & WRITING DOMAINS</span>
                  </h3>
                  <span className="text-[10px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold">4 DOMAINS</span>
                </div>

                {satTaxonomy?.sections?.["Reading and Writing"]?.domains ? (
                  Object.entries(satTaxonomy.sections["Reading and Writing"].domains).map(([domainName, domainObj]: [string, SatTaxonomyDomain]) => (
                    <div key={domainName} className="space-y-3">
                      <span className="text-xs font-black text-slate-200 block border-l-2 border-indigo-500 pl-2 bg-indigo-500/5 py-1 rounded-r-md">
                        {domainName} <span className="text-[10px] text-slate-500 font-mono font-normal">({domainObj.targetPct}% Tỷ trọng)</span>
                      </span>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {Object.keys(domainObj.canonicalSkills || {}).map(skillName => (
                          <div
                            key={skillName}
                            className="p-3 bg-slate-955 rounded-xl border border-slate-850 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-300 block">{skillName}</span>
                              <span className="text-[9px] text-slate-500 font-light block">Kỹ năng chuẩn College Board</span>
                            </div>
                            <button
                              onClick={() => handleStartPractice(domainName, skillName)}
                              className="px-3 py-1.5 bg-indigo-900/50 hover:bg-indigo-600 border border-indigo-850 text-indigo-300 hover:text-white text-[10px] font-black uppercase rounded-lg transition-colors border-0 cursor-pointer"
                            >
                              Luyện ➔
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Fallback reading taxonomy if fetch delayed */
                  <div className="text-xs text-slate-500 italic py-6 text-center">Đang nạp cấu trúc chuyên đề Đọc hiểu meow...</div>
                )}
              </div>

              {/* Section 2: Math */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-rose-455 uppercase tracking-widest flex items-center gap-2">
                    <span>📐 MATHEMATICS DOMAINS</span>
                  </h3>
                  <span className="text-[10px] bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold">4 DOMAINS</span>
                </div>

                {satTaxonomy?.sections?.["Math"]?.domains ? (
                  Object.entries(satTaxonomy.sections["Math"].domains).map(([domainName, domainObj]: [string, SatTaxonomyDomain]) => (
                    <div key={domainName} className="space-y-3">
                      <span className="text-xs font-black text-slate-200 block border-l-2 border-rose-500 pl-2 bg-rose-500/5 py-1 rounded-r-md">
                        {domainName} <span className="text-[10px] text-slate-500 font-mono font-normal">({domainObj.targetPct}% Tỷ trọng)</span>
                      </span>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {Object.keys(domainObj.canonicalSkills || {}).map(skillName => (
                          <div
                            key={skillName}
                            className="p-3 bg-slate-955 rounded-xl border border-slate-850 flex items-center justify-between hover:border-rose-500/40 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-300 block">{skillName}</span>
                              <span className="text-[9px] text-slate-500 font-light block">Chuyên đề con thích ứng</span>
                            </div>
                            <button
                              onClick={() => handleStartPractice(domainName, skillName)}
                              className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-600 border border-rose-900 text-rose-400 hover:text-white text-[10px] font-black uppercase rounded-lg transition-colors border-0 cursor-pointer"
                            >
                              Luyện ➔
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Fallback math taxonomy */
                  <div className="text-xs text-slate-500 italic py-6 text-center">Đang nạp cấu trúc chuyên đề Toán meow...</div>
                )}
              </div>

            </div>
          </div>
        )
      )}
    </div>
  );
}
