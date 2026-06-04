import LearnerProfileCard from '../LearnerProfileCard';

interface DashboardPanelProps {
  availableTests: any[];
  dashboardCategory: 'all' | 'full_exam' | 'practice_bank' | 'topic_bank' | 'diagnostic';
  setDashboardCategory: (cat: any) => void;
  categorizeTest: (test: any) => 'diagnostic' | 'topic_bank' | 'practice_bank' | 'full_exam';
  setSelectedTestForMode: (test: any) => void;
  setShowModeSelectorModal: (show: boolean) => void;
  attempts: any[];
  handleReviewAttempt: (attempt: any) => void;
  isAdmin: boolean;
  aiConfig: any;
  setAiConfig: (conf: any) => void;
  hasOpenAiKey: boolean;
  hasGeminiKey: boolean;
  openaiKeyInput: string;
  geminiKeyInput: string;
  setOpenaiKeyInput: (val: string) => void;
  setGeminiKeyInput: (val: string) => void;
  setHasOpenAiKey: (has: boolean) => void;
  setHasGeminiKey: (has: boolean) => void;
  credentialStore: any;
  handleTestConnection: () => Promise<void>;
  isTestingConnection: boolean;
  testConnectionResult: any;
  handleImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importSuccessMsg: string | null;
  activeAttempt: any;
  resumeExam: (attempt: any) => void;
  
  // Learner profile card props
  learnerProfile: any;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  targetBandInput: number;
  setTargetBandInput: (val: number) => void;
  examDateInput: string;
  setExamDateInput: (val: string) => void;
  saveLearnerProfile: () => Promise<void>;
  getDaysRemaining: () => number | null;
  getGlobalWeaknessAnalysis: () => any[];
  getMicroSkillsAnalysis: () => any[];
  setActiveTab: (tab: any) => void;
  setReviewQueue: (val: any[]) => void;
  setCurrentReviewIdx: (val: number) => void;
}

export default function DashboardPanel({
  availableTests,
  dashboardCategory,
  setDashboardCategory,
  categorizeTest,
  setSelectedTestForMode,
  setShowModeSelectorModal,
  attempts,
  handleReviewAttempt,
  isAdmin,
  aiConfig,
  setAiConfig,
  hasOpenAiKey,
  hasGeminiKey,
  openaiKeyInput,
  geminiKeyInput,
  setOpenaiKeyInput,
  setGeminiKeyInput,
  setHasOpenAiKey,
  setHasGeminiKey,
  credentialStore,
  handleTestConnection,
  isTestingConnection,
  testConnectionResult,
  handleImportJson,
  importSuccessMsg,
  activeAttempt,
  resumeExam,
  learnerProfile,
  isEditingProfile,
  setIsEditingProfile,
  targetBandInput,
  setTargetBandInput,
  examDateInput,
  setExamDateInput,
  saveLearnerProfile,
  getDaysRemaining,
  getGlobalWeaknessAnalysis,
  getMicroSkillsAnalysis,
  setActiveTab,
  setReviewQueue,
  setCurrentReviewIdx
}: DashboardPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left side: test selection */}
      <div className="md:col-span-2 flex flex-col gap-6">
        {importSuccessMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3 shadow-sm mb-4">
            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">✓</span>
            <span className="text-sm font-semibold">{importSuccessMsg}</span>
          </div>
        )}
        {activeAttempt && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg animate-pulse">!</span>
              <div className="text-left">
                <h3 className="text-sm font-bold text-amber-900">You have an exam session in progress</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Test: <span className="font-semibold">{
                    availableTests.find(t => t.id === activeAttempt.testId)?.title || activeAttempt.testId
                  }</span> | 
                  Remaining: <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded text-xs">{Math.floor(activeAttempt.remainingSeconds / 60)}m {activeAttempt.remainingSeconds % 60}s</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => resumeExam(activeAttempt)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 px-4 rounded shadow transition-all whitespace-nowrap cursor-pointer border-0 outline-none"
            >
              Resume Active Session
            </button>
          </div>
        )}

        {/* Premium Learner Profile Card */}
        <LearnerProfileCard
          learnerProfile={learnerProfile}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          targetBandInput={targetBandInput}
          setTargetBandInput={setTargetBandInput}
          examDateInput={examDateInput}
          setExamDateInput={setExamDateInput}
          saveLearnerProfile={saveLearnerProfile}
          getDaysRemaining={getDaysRemaining}
          getGlobalWeaknessAnalysis={getGlobalWeaknessAnalysis}
          getMicroSkillsAnalysis={getMicroSkillsAnalysis}
          onNavigateTab={(tab) => {
            setReviewQueue([]);
            setCurrentReviewIdx(-1);
            setActiveTab(tab);
          }}
        />

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              Available Mock Exams
            </h2>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'full_exam', label: 'Standard' },
                { id: 'practice_bank', label: 'Practice Bank' },
                { id: 'topic_bank', label: 'Chuyên Đề' },
                { id: 'diagnostic', label: 'Chẩn Đoán' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setDashboardCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border outline-none cursor-pointer ${
                    dashboardCategory === cat.id
                      ? 'bg-emerald-600 border-transparent text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableTests.filter(test => {
              if (dashboardCategory === 'all') return true;
              return categorizeTest(test) === dashboardCategory;
            }).map(test => (
              <div key={test.id} className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col justify-between shadow-sm text-left hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-0.5">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800`}>
                      {test.type}
                    </span>
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded uppercase">
                      {categorizeTest(test) === 'full_exam' ? 'Standard Exam' : categorizeTest(test) === 'practice_bank' ? 'Practice' : categorizeTest(test) === 'topic_bank' ? 'Topic Bank' : 'Diagnostic'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mt-2">{test.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Skill: <span className="capitalize">{test.skill}</span> | Time: {test.skill === 'listening' ? '30' : '60'} mins
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTestForMode(test);
                    setShowModeSelectorModal(true);
                  }}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer border-0 outline-none"
                >
                  Start Mock Test
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            ))}
            {availableTests.filter(test => {
              if (dashboardCategory === 'all') return true;
              return categorizeTest(test) === dashboardCategory;
            }).length === 0 && (
              <p className="col-span-2 text-sm text-slate-500 italic p-4 text-center border border-dashed rounded bg-slate-50/50">Không có đề thi nào thuộc chuyên mục này.</p>
            )}
          </div>
        </div>

        {/* History Attempts table */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 fill-current" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            My Mock Exam History
          </h2>
          {attempts.length === 0 ? (
            <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed rounded bg-slate-50/50">No completed attempts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-semibold">Test Title</th>
                    <th className="p-3 font-semibold">Date Completed</th>
                    <th className="p-3 font-semibold">Raw Score</th>
                    <th className="p-3 font-semibold">CPE Band</th>
                    <th className="p-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map(attempt => {
                    const test = availableTests.find(t => t.id === attempt.testId);
                    const testTitle = test ? test.title : attempt.testId;
                    return (
                      <tr key={attempt.local_id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-medium text-slate-800">{testTitle}</td>
                        <td className="p-3 text-slate-500 text-xs">{new Date(attempt.createdAt).toLocaleString()}</td>
                        <td className="p-3 text-slate-600">
                          {attempt.scores?.rawScore ?? 0} / {attempt.scores?.totalQuestions ?? 30} correct
                          {attempt.scores?.isMockScoring !== false && (
                            <span className="text-[10px] text-slate-400 block italic">(Mock Test)</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-emerald-600 text-base">
                          {attempt.scores?.bandScore ? attempt.scores.bandScore.toFixed(0) : '0'}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {attempt.scores?.isMockScoring ? 'Estimated Scale' : 'Cambridge Scale'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleReviewAttempt(attempt)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded shadow transition-all whitespace-nowrap cursor-pointer border-0 outline-none"
                          >
                            Review Answers
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right side: instructions, help, imports */}
      <div className="flex flex-col gap-6 text-left">
        {/* AI Evaluation Settings Card */}
        {isAdmin && (
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-6 shadow-md flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400 fill-current" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0,-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 c-0.12,0.21-0.08,0.47,0.12,0.61l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12c0,0.31,0.04,0.63,0.08,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              AI Evaluation Panel
            </h3>
            
            <div className="flex flex-col gap-3 text-xs">
              {/* Active Provider selector */}
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Active Evaluator</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1 bg-slate-800 p-1 rounded-md">
                  {['mock', 'openai', 'gemini'].map(prov => (
                    <button
                      key={prov}
                      onClick={() => setAiConfig({ ...aiConfig, provider: prov as 'mock' | 'openai' | 'gemini' })}
                      className={`py-1.5 px-2 rounded font-semibold text-center uppercase tracking-wide transition-all cursor-pointer border-0 outline-none ${
                        aiConfig.provider === prov 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* OpenAI specific Settings */}
              {aiConfig.provider === 'openai' && (
                <div className="flex flex-col gap-2.5 mt-1 border-t border-slate-800 pt-2.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">OpenAI API Key</span>
                      {hasOpenAiKey && (
                        <button
                          onClick={async () => {
                            await credentialStore.delete('openai_api_key');
                            setHasOpenAiKey(false);
                            setOpenaiKeyInput('');
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 underline bg-transparent border-none cursor-pointer"
                        >
                          Clear Saved Key
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      placeholder={hasOpenAiKey ? "•••••••• (Key saved)" : "Enter OpenAI API Key"}
                      value={openaiKeyInput}
                      onChange={(e) => setOpenaiKeyInput(e.target.value)}
                      onBlur={async () => {
                        if (openaiKeyInput.trim()) {
                          await credentialStore.set('openai_api_key', openaiKeyInput);
                          setHasOpenAiKey(true);
                          setOpenaiKeyInput('');
                        }
                      }}
                      className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Model Selection</span>
                    <select
                      value={aiConfig.openaiModel || 'gpt-4o'}
                      onChange={(e) => setAiConfig({ ...aiConfig, openaiModel: e.target.value })}
                      className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="gpt-4o">gpt-4o (Premium)</option>
                      <option value="gpt-4o-mini">gpt-4o-mini (Cost-effective)</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Gemini specific Settings */}
              {aiConfig.provider === 'gemini' && (
                <div className="flex flex-col gap-2.5 mt-1 border-t border-slate-800 pt-2.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Gemini API Key</span>
                      {hasGeminiKey && (
                        <button
                          onClick={async () => {
                            await credentialStore.delete('gemini_api_key');
                            setHasGeminiKey(false);
                            setGeminiKeyInput('');
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 underline bg-transparent border-none cursor-pointer"
                        >
                          Clear Saved Key
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      placeholder={hasGeminiKey ? "•••••••• (Key saved)" : "Enter Gemini API Key"}
                      value={geminiKeyInput}
                      onChange={(e) => setGeminiKeyInput(e.target.value)}
                      onBlur={async () => {
                        if (geminiKeyInput.trim()) {
                          await credentialStore.set('gemini_api_key', geminiKeyInput);
                          setHasGeminiKey(true);
                          setGeminiKeyInput('');
                        }
                      }}
                      className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Model Selection</span>
                    <select
                      value={aiConfig.geminiModel || 'gemini-1.5-flash'}
                      onChange={(e) => setAiConfig({ ...aiConfig, geminiModel: e.target.value })}
                      className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & lightweight)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (High intelligence)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Test Connection Button */}
              <div className="mt-2 flex flex-col gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-650 text-white font-bold py-2 px-3 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0 outline-none"
                >
                  {isTestingConnection ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>

                {testConnectionResult && (
                  <div className={`p-2.5 rounded text-xs leading-relaxed border ${
                    testConnectionResult.success 
                      ? 'bg-green-950/45 border-green-800 text-green-300' 
                      : 'bg-red-950/45 border-red-800 text-red-300'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {testConnectionResult.success ? '✓ Valid Configuration' : '✗ Connection Failed'}
                    </div>
                    <div className="mt-0.5 text-[11px] opacity-90">{testConnectionResult.message}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Import Test Card */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 fill-current" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
              Import Exam Package
            </h3>
            <p className="text-xs text-slate-500 m-0">
              Upload an independently compiled exam package in `.json` format to load it instantly. The engine will run schema compliance checks.
            </p>
            <div className="flex flex-col gap-2">
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-all flex flex-col items-center justify-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
                <svg className="w-8 h-8 text-slate-400 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                <span className="text-xs font-semibold text-slate-600">Select Exam JSON File</span>
              </label>
            </div>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-900 mb-2">Platform Instructions</h3>
          <ul className="text-sm text-emerald-800 flex flex-col gap-2 list-disc list-inside p-0 m-0">
            <li>This interface closely matches standard **computer-delivered exam-style grids**.</li>
            <li>In **Reading**, you will see a two-panel split layout: the passage text on the left, and the input sheet on the right.</li>
            <li>In **Listening**, the audio is controlled via a locked media player that allows only a single run.</li>
            <li>The countdown timers utilize **drift-proof clock calculations** to remain accurate even if your device sleeps.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
