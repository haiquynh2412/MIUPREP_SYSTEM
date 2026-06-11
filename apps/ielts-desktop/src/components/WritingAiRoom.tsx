import { useState } from 'react';
import type { WritingFeedback } from '@miuprep/db';

type WritingCriterion = WritingFeedback['criteria'][number];
type WritingCorrection = WritingFeedback['corrections'][number];
type SentenceUpgrade = NonNullable<WritingFeedback['sentenceUpgrades']>[number];

interface WritingTheme {
  name: string;
  primary: string;
  hover: string;
  bgLight: string;
  borderLight: string;
  textDark: string;
  gradientFrom: string;
  gradientTo: string;
}

interface WritingCollocation {
  phrase: string;
  vietnamese: string;
  example: string;
}

interface WritingOutlineSection {
  sectionName: string;
  description: string;
}

interface WritingSample {
  id: string;
  title: string;
  type: string;
  testNum: number | string;
  taskNum: 1 | 2 | number;
  prompt: string;
  sampleAnswer: string;
  wordCount: number;
  collocations?: WritingCollocation[];
  outline?: WritingOutlineSection[];
}

interface WritingAiRoomProps {
  writingFeedback: WritingFeedback | null;
  isAiLoading: boolean;
  aiErrorMsg: string | null;
  runWritingAiEvaluation: (essay: string, taskNum: 1 | 2, track: 'ielts' | 'cpe' | 'cae', prompt: string) => Promise<void>;
  activeTrack: 'ielts' | 'cpe' | 'cae';
  activeTheme: WritingTheme;
  availableWritingSamples: WritingSample[];
}

export default function WritingAiRoom({
  writingFeedback,
  isAiLoading,
  aiErrorMsg,
  runWritingAiEvaluation,
  activeTrack,
  activeTheme,
  availableWritingSamples
}: WritingAiRoomProps) {
  const [writingEssay, setWritingEssay] = useState('');
  const [writingTaskNum, setWritingTaskNum] = useState<1 | 2>(2);
  const [selectedWritingSampleId, setSelectedWritingSampleId] = useState(() => availableWritingSamples[0]?.id || '');
  const [showWritingSampleModal, setShowWritingSampleModal] = useState(false);
  const [writingModalTab, setWritingModalTab] = useState<'outline' | 'sample' | 'vocab'>('outline');

  const activeWritingSample = availableWritingSamples.find(s => s.id === selectedWritingSampleId) || availableWritingSamples[0];

  const handleWritingSampleChange = (id: string) => {
    setSelectedWritingSampleId(id);
    const found = availableWritingSamples.find(s => s.id === id);
    if (found) {
      setWritingTaskNum(found.taskNum as 1 | 2);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-left">
      {/* Left: Input Essay area */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <span className={`text-[10px] text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-${activeTheme.primary}`}>
            {activeTheme.name} Writing Tutor
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2 font-sans">
            Phòng Luyện Viết {activeTrack?.toUpperCase()} & Đề cương mẫu
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Luyện tập các đề thi tự luận {activeTheme.name} chính thức. Nhập bài viết và kích hoạt AI chấm điểm theo chuẩn {activeTrack === 'cpe' ? 'C2' : activeTrack === 'cae' ? 'C1' : 'IELTS'}.
          </p>
        </div>

        {/* Selected Prompt Panel */}
        <div className={`border rounded-xl p-4 flex flex-col gap-3 ${activeTheme.bgLight} ${activeTheme.borderLight}`}>
          <div className="flex flex-col gap-1.5">
            <label className={`text-[10px] font-black uppercase tracking-wide text-${activeTheme.textDark}`}>
              1. Chọn đề luyện viết {activeTrack?.toUpperCase()}:
            </label>
            <select
              value={selectedWritingSampleId}
              onChange={(e) => handleWritingSampleChange(e.target.value)}
              className={`bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-${activeTrack === 'cpe' ? 'emerald' : activeTrack === 'cae' ? 'violet' : 'blue'}-500 focus:border-${activeTrack === 'cpe' ? 'emerald' : activeTrack === 'cae' ? 'violet' : 'blue'}-500 cursor-pointer font-bold text-slate-700 outline-none w-full`}
            >
              {availableWritingSamples.map((sample: WritingSample) => (
                <option key={sample.id} value={sample.id}>
                  [Test {sample.testNum} - Task {sample.taskNum}] {sample.title} ({sample.type})
                </option>
              ))}
            </select>
          </div>

          {activeWritingSample && (
            <div className="bg-white/80 border border-slate-150 rounded-lg p-3 text-xs leading-relaxed text-slate-600 flex flex-col gap-2 relative">
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  activeTrack === 'cpe' ? 'bg-emerald-100 text-emerald-800' : activeTrack === 'cae' ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activeWritingSample.type} - Task {activeWritingSample.taskNum}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ≈ {activeWritingSample.wordCount} words sample
                </span>
              </div>
              <p className="m-0 font-serif italic text-slate-700 select-all whitespace-pre-line">
                {activeWritingSample.prompt}
              </p>
            </div>
          )}

          {/* Actions for Prompt */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowWritingSampleModal(true)}
              className={`flex-1 bg-${activeTheme.primary} hover:bg-${activeTheme.hover} text-white font-bold text-xs py-2.5 px-3.5 rounded-lg shadow-sm transition-all border-0 cursor-pointer outline-none flex items-center justify-center gap-1.5 uppercase tracking-wide`}
            >
              <span>💡</span> Xem dàn ý & Bài mẫu
            </button>
            <button
              onClick={() => {
                setWritingEssay('');
                if (activeWritingSample) {
                  setWritingTaskNum(activeWritingSample.taskNum as 1 | 2);
                }
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-3.5 rounded-lg transition-all border-0 cursor-pointer outline-none flex items-center justify-center gap-1.5 uppercase"
            >
              Xóa bài
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bài viết của bạn (Essay Input):</label>
            {writingEssay.trim() && (
              <span className="text-[10px] text-slate-400 font-mono">
                Độ dài: <strong className="text-slate-650">{writingEssay.trim().split(/\s+/).length}</strong> từ
              </span>
            )}
          </div>
          <textarea
            value={writingEssay}
            onChange={(e) => setWritingEssay(e.target.value)}
            placeholder={`Nhập bài essay Writing của bạn ở đây... (Tối thiểu ${writingTaskNum === 1 ? '150' : '250'} từ cho Task ${writingTaskNum})`}
            rows={13}
            className={`border border-slate-350 rounded-lg p-4 font-sans text-sm focus:ring-1 focus:ring-${activeTrack === 'cpe' ? 'emerald' : activeTrack === 'cae' ? 'violet' : 'blue'}-500 focus:border-${activeTrack === 'cpe' ? 'emerald' : activeTrack === 'cae' ? 'violet' : 'blue'}-500 w-full resize-y bg-white text-slate-800 leading-relaxed outline-none`}
          />
        </div>

        <button
          onClick={() => runWritingAiEvaluation(writingEssay, writingTaskNum, activeTrack || 'ielts', activeWritingSample?.prompt)}
          disabled={isAiLoading || !writingEssay.trim()}
          className={`w-full bg-${activeTheme.primary} hover:bg-${activeTheme.hover} text-white font-bold py-3.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border-0 outline-none uppercase tracking-wider text-xs`}
        >
          {isAiLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Đang phân tích bài viết bằng Socratic AI...
            </>
          ) : (
            <>
              Phân tích bài viết & Chấm điểm (AI Evaluate)
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/></svg>
            </>
          )}
        </button>
      </div>

      {/* Right: AI Feedback panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5 overflow-y-auto max-h-[85vh]">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-2 flex items-center gap-2">
          <svg className={`w-5 h-5 text-${activeTheme.primary} fill-current`} viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>
          Kết quả Chẩn đoán & Gợi ý Sư phạm
        </h3>

        {isAiLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <span className={`w-12 h-12 border-4 border-${activeTheme.primary} border-t-transparent rounded-full animate-spin`}></span>
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-bold text-slate-800 m-0">Đang khởi chạy Socratic Analytical Engine...</h4>
              <p className="text-xs text-slate-400 max-w-xs m-0 leading-normal">
                AI đang kiểm tra cấu trúc câu, đo độ mạch lạc và thiết kế lộ trình nâng band side-by-side.
              </p>
            </div>
          </div>
        )}

        {aiErrorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-xs leading-relaxed">
            <strong>Lỗi API:</strong> {aiErrorMsg}. Vui lòng kiểm tra lại cấu hình API key trong Panel cài đặt AI bên Dashboard.
          </div>
        )}

        {!isAiLoading && !writingFeedback && !aiErrorMsg && activeWritingSample && (
          <div className="flex flex-col gap-4">
            {/* Vocabulary Collocations Side Panel */}
            <div className={`border rounded-xl p-4 flex flex-col gap-3 text-xs text-slate-700 leading-relaxed bg-${activeTrack === 'cpe' ? 'emerald' : activeTrack === 'cae' ? 'violet' : 'blue'}-50/10 border-${activeTrack === 'cpe' ? 'emerald' : activeTrack === 'cae' ? 'violet' : 'blue'}-100`}>
              <h4 className={`font-bold m-0 text-xs uppercase tracking-wide flex items-center gap-1.5 text-${activeTheme.primary}`}>
                <span>🚀</span> Gợi ý Từ vựng nâng điểm (Collocations Booster)
              </h4>
              <p className="text-slate-500 m-0 leading-normal">
                Hãy tham khảo và tích hợp các từ vựng/cụm từ nâng cao này vào bài viết của bạn để ghi điểm **Lexical Resource** ấn tượng:
              </p>
              <div className="flex flex-col gap-3 mt-1 max-h-[48vh] overflow-y-auto pr-1">
                {activeWritingSample.collocations?.map((col: WritingCollocation, idx: number) => (
                  <div key={idx} className="bg-white border rounded-lg p-3 flex flex-col gap-1.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className={`text-white font-mono text-[9px] px-1.5 py-0.2 rounded font-black bg-${activeTheme.primary}`}>
                        {activeTrack === 'cpe' ? 'C2' : activeTrack === 'cae' ? 'C1' : 'C1/C2'}
                      </span>
                      <strong className={`font-bold text-xs font-mono text-${activeTheme.primary}`}>{col.phrase}</strong>
                      <span className="text-[10px] text-slate-400 italic">({col.vietnamese})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 leading-normal m-0 select-all">
                      Ví dụ: "{col.example}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 gap-1.5 border border-dashed rounded-lg bg-slate-50/50">
              <span className="text-2xl">📝</span>
              <p className="text-[11px] italic leading-normal max-w-xs m-0 text-slate-500">
                Soạn thảo xong bài viết, hãy nhấn nút "Phân tích bài viết & Chấm điểm" để Socratic AI chấm điểm và kiểm tra chính xác ngữ pháp chi tiết!
              </p>
            </div>
          </div>
        )}

        {!isAiLoading && writingFeedback && (
          <div className="flex flex-col gap-6 animate-fade-in text-left">
            {/* Band score block */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between text-white text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  {activeTrack === 'cpe' || activeTrack === 'cae' || writingFeedback.bandOverall > 10 ? 'Cambridge Scale Verification' : 'IELTS Grading Verification'}
                </span>
                <h4 className={`text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r mt-1 m-0 ${
                  activeTrack === 'cpe' ? 'from-emerald-400 via-emerald-300 to-purple-400' : activeTrack === 'cae' ? 'from-violet-400 via-violet-300 to-purple-400' : 'from-blue-400 via-indigo-300 to-purple-400'
                }`}>
                  {activeTrack === 'cpe' || activeTrack === 'cae' || writingFeedback.bandOverall > 10
                    ? `${activeTrack === 'cae' ? 'Cambridge C1 Score' : 'Cambridge C2 Score'}: ${writingFeedback.bandOverall?.toFixed(0) || '0'}`
                    : `Estimated Band: ${writingFeedback.bandOverall?.toFixed(1) || '0.0'} ± 0.5`}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal m-0 italic">
                  *Lưu ý: Kết quả được tính toán chuẩn theo {activeTrack === 'cpe' || activeTrack === 'cae' || writingFeedback.bandOverall > 10 ? 'C1/C2 Proficiency Writing Descriptors' : 'IELTS Official Band Descriptors'}.
                </p>
              </div>
              <div className={`text-white rounded-2xl w-14 h-14 flex items-center justify-center font-black text-lg shadow-lg shrink-0 border ${
                activeTrack === 'cpe' ? 'bg-gradient-to-tr from-emerald-600 to-emerald-600 border-emerald-400' : activeTrack === 'cae' ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 border-violet-400' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-400'
              }`}>
                ✓
              </div>
            </div>

            {/* Rubric Version & Confidence Info */}
            <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-xl text-[10px] text-slate-500 font-mono text-left">
              <div>
                <span className="font-bold">Rubric:</span> {writingFeedback.rubricVersion || 'v1.0.0-academic'}
              </div>
              <div className="text-right">
                <span className="font-bold">Confidence:</span> {writingFeedback.confidence ? `${(writingFeedback.confidence * 100).toFixed(0)}%` : '95%'}
              </div>
            </div>

            {/* 4 Rubric Criteria Breakdowns Premium Grid */}
            <div className="flex flex-col gap-4 text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide m-0 font-sans">
                Điểm Chi Tiết Theo Tiêu Chí IELTS Writing Rubric
              </h4>
              <div className="flex flex-col gap-4">
                {writingFeedback.criteria?.map((crit: WritingCriterion) => (
                  <div
                    key={crit.criterionName}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col text-xs text-left"
                  >
                    {/* Criterion Title & Score Bar */}
                    <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                      <span className="font-black text-slate-800 text-xs tracking-wide">{crit.criterionName}</span>
                      <span className={`text-white font-bold px-3 py-0.5 rounded-full text-xs shadow-sm ${
                        activeTrack === 'cpe' ? 'bg-emerald-600' : activeTrack === 'cae' ? 'bg-violet-600' : 'bg-blue-600'
                      }`}>
                        {activeTrack === 'cpe' || activeTrack === 'cae' || writingFeedback.bandOverall > 10
                          ? `Score ${crit.band !== null && crit.band !== undefined ? crit.band.toFixed(0) : 'N/A'}`
                          : `Band ${crit.band !== null && crit.band !== undefined ? crit.band.toFixed(1) : 'N/A'}`}
                      </span>
                    </div>

                    {/* Analysis details */}
                    <div className="p-4 flex flex-col gap-3 text-left">
                      {/* Analysis Feedback */}
                      <p className="text-slate-600 m-0 leading-relaxed font-sans">{crit.feedbackText}</p>

                      {/* Evidence Quotes */}
                      {crit.evidence && crit.evidence.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bằng chứng từ bài làm (Direct Evidence):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {crit.evidence.map((quote: string, qIdx: number) => (
                              <span
                                key={qIdx}
                                className="bg-slate-100 text-slate-700 font-serif italic text-[11px] px-2.5 py-1 rounded-md border border-slate-200 shadow-sm leading-relaxed"
                              >
                                "{quote}"
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gaps & Pedagogics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-100 pt-3 text-left">
                        {crit.whyNotHigher && (
                          <div className="flex flex-col gap-1 bg-amber-50/50 border border-amber-100 p-3 rounded-lg text-left">
                            <span className="text-[9px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                              ⚠️ Nguyên nhân chưa đạt band cao hơn
                            </span>
                            <p className="text-[11px] text-amber-900 leading-relaxed m-0">{crit.whyNotHigher}</p>
                          </div>
                        )}
                        {crit.nextAction && (
                          <div className="flex flex-col gap-1 bg-green-50/50 border border-green-100 p-3 rounded-lg text-left">
                            <span className="text-[9px] text-green-700 font-bold uppercase tracking-wider flex items-center gap-1">
                              🎯 Hành động cụ thể tiếp theo
                            </span>
                            <p className="text-[11px] text-green-900 leading-relaxed m-0">{crit.nextAction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Socratic Hints Guiding Questions */}
            {writingFeedback.socraticHints && writingFeedback.socraticHints.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-5 flex flex-col gap-3 text-left">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5 m-0">
                  <span className="text-base">💡</span> AI Tutor: Gợi Ý Sư Phạm Socratic
                </h4>
                <p className="text-[11px] text-indigo-950/80 leading-normal m-0">
                  AI không sửa bài trực tiếp để bạn học thụ động. Hãy suy ngẫm và tự trả lời 3 câu hỏi định hướng tư duy dưới đây để tự nâng cấp bài viết:
                </p>
                <ul className="text-xs text-indigo-950 flex flex-col gap-2 list-disc list-inside p-0 m-0 leading-relaxed font-medium">
                  {writingFeedback.socraticHints.map((hint: string, idx: number) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Side-by-Side Sentence Elevation Upgrades */}
            {writingFeedback.sentenceUpgrades && writingFeedback.sentenceUpgrades.length > 0 && (
              <div className="flex flex-col gap-4 text-left">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide m-0">Bản Đồ Nâng Cấp Câu Chi Tiết (+0.5 Strategy)</h4>
                <div className="flex flex-col gap-4">
                  {writingFeedback.sentenceUpgrades.map((upg: SentenceUpgrade, idx: number) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                      <div className="grid grid-cols-1 sm:grid-cols-2 border-b">
                        {/* Original sentence panel (Red tint) */}
                        <div className="bg-red-50/40 p-4 border-r border-slate-100 flex flex-col gap-1 text-left">
                          <span className="text-[9px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded self-start uppercase">Câu gốc của bạn</span>
                          <p className="text-xs text-slate-800 leading-relaxed mt-2 italic m-0">"{upg.original}"</p>
                        </div>
                        {/* Elevated sentence panel (Green tint) */}
                        <div className="bg-green-50/40 p-4 flex flex-col gap-1 text-left">
                          <span className="text-[9px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded self-start uppercase">Nâng cấp (+0.5 Band)</span>
                          <p className="text-xs font-bold text-slate-900 leading-relaxed mt-2 m-0 text-left">"{upg.upgraded}"</p>
                          <span className="text-[9px] text-indigo-600 font-black mt-1 uppercase text-left">Target Band: {upg.targetedBand.toFixed(1)}</span>
                        </div>
                      </div>
                      {/* Explanation sub-box */}
                      <div className="bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 text-left">
                        <strong className="text-slate-800 font-semibold">Phân tích sư phạm:</strong> {upg.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard grammar check list */}
            <div className="flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide m-0">Các Lỗi Ngữ Pháp & Từ Vựng Phát Hiện</h4>
              <div className="flex flex-col gap-2.5">
                {writingFeedback.corrections?.map((c: WritingCorrection, idx: number) => (
                  <div key={idx} className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg text-xs leading-normal flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-500">Lỗi sai:</span>
                      <span className="font-mono text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-bold">"{c.originalText}"</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-slate-500">Sửa lại:</span>
                      <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">"{c.correctedText}"</span>
                    </div>
                    <div className="mt-1 text-slate-600">
                      <strong className="font-semibold text-slate-700">Giải thích:</strong> {c.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Outline & Sample Answer Modal */}
      {showWritingSampleModal && activeWritingSample && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <header className={`bg-gradient-to-r ${activeTheme.gradientFrom} ${activeTheme.gradientTo} text-white px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏆</span>
                <div>
                  <h3 className="text-base font-bold tracking-tight m-0 text-white leading-tight">
                    Đề cương & Bài viết mẫu {activeTrack?.toUpperCase()} Proficiency
                  </h3>
                  <span className="text-[10px] text-white/80 font-semibold tracking-wide uppercase mt-0.5 block font-sans">
                    {activeWritingSample.title}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWritingSampleModal(false)}
                className="text-white/85 hover:text-white font-bold text-lg bg-transparent border-0 cursor-pointer outline-none font-sans"
              >
                &times;
              </button>
            </header>

            {/* Tab Navigation in Modal */}
            <div className="flex bg-slate-50 border-b px-6 pt-2">
              <button
                onClick={() => setWritingModalTab('outline')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  writingModalTab === 'outline'
                    ? `border-${activeTheme.primary} text-${activeTheme.textDark} font-black`
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                📖 Dàn ý Outline
              </button>
              <button
                onClick={() => setWritingModalTab('sample')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  writingModalTab === 'sample'
                    ? `border-${activeTheme.primary} text-${activeTheme.textDark} font-black`
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                ✍️ Bài viết mẫu Band Cao
              </button>
              <button
                onClick={() => setWritingModalTab('vocab')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  writingModalTab === 'vocab'
                    ? `border-${activeTheme.primary} text-${activeTheme.textDark} font-black`
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                🚀 Từ vựng Collocations
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
              {writingModalTab === 'outline' && (
                <div className="flex flex-col gap-3">
                  <p className="text-slate-500 m-0 leading-relaxed">
                    Bố cục dàn ý chuẩn giúp tối ưu điểm **Organisation** và **Content** của bài thi tự luận:
                  </p>
                  <div className="flex flex-col gap-3.5 mt-1">
                    {activeWritingSample.outline?.map((o: WritingOutlineSection, idx: number) => (
                      <div key={idx} className={`border-l-4 border-${activeTheme.primary} bg-slate-50 p-3.5 rounded-r-lg shadow-sm`}>
                        <h4 className="font-bold text-slate-800 m-0 text-xs uppercase tracking-wide">
                          {idx + 1}. {o.sectionName}
                        </h4>
                        <p className="m-0 text-slate-600 mt-1.5 leading-relaxed">
                          {o.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {writingModalTab === 'sample' && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-lg">
                    <span className="font-semibold text-slate-655">Bài mẫu đạt chuẩn band cao ({activeTrack === 'cpe' ? 'C2 scale 200+' : 'Estimated Band 8.5+'}):</span>
                    <span className="text-[10px] text-slate-400 font-mono">Word Count: {activeWritingSample.wordCount} words</span>
                  </div>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-serif text-[13px] leading-relaxed max-h-[35vh] overflow-y-auto shadow-inner select-all whitespace-pre-line border border-slate-800">
                    {activeWritingSample.sampleAnswer}
                  </div>
                  <div className="flex gap-2.5 mt-1 justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeWritingSample.sampleAnswer);
                        alert('Đã sao chép bài mẫu vào bộ nhớ tạm!');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg shadow-sm border-0 cursor-pointer outline-none uppercase transition-all text-[10px]"
                    >
                      📋 Sao chép bài mẫu
                    </button>
                    <button
                      onClick={() => {
                        setWritingEssay(activeWritingSample.sampleAnswer);
                        setShowWritingSampleModal(false);
                      }}
                      className={`bg-${activeTheme.primary} hover:bg-${activeTheme.hover} text-white font-bold py-2 px-4 rounded-lg shadow-sm border-0 cursor-pointer outline-none uppercase transition-all text-[10px]`}
                      title="Điền thử bài viết này vào khu vực soạn thảo để chấm thử!"
                    >
                      🚀 Chạy thử bài mẫu
                    </button>
                  </div>
                </div>
              )}

              {writingModalTab === 'vocab' && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <p className="text-slate-500 m-0">
                    Các cụm từ cố định học thuật (Collocations) đắt giá được chèn khéo léo trong bài viết mẫu:
                  </p>
                  <div className="flex flex-col gap-3.5 mt-1">
                    {activeWritingSample.collocations?.map((col: WritingCollocation, idx: number) => (
                      <div key={idx} className="bg-slate-50 border rounded-lg p-3.5 flex flex-col gap-1.5 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className={`text-white font-mono text-[10px] px-1.5 py-0.2 rounded font-black bg-${activeTheme.primary}`}>
                            {activeTrack === 'cpe' ? 'C2' : activeTrack === 'cae' ? 'C1' : 'C1/C2'}
                          </span>
                          <strong className={`font-bold text-xs font-mono text-${activeTheme.primary}`}>{col.phrase}</strong>
                          <span className="text-[10px] text-slate-400 italic">({col.vietnamese})</span>
                        </div>
                        <div className="text-[11px] text-slate-650 mt-1 leading-normal italic bg-white p-2 rounded border border-slate-150 leading-normal m-0 select-all">
                          Ví dụ: "{col.example}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="bg-slate-50 px-6 py-3.5 flex justify-end border-t border-slate-150">
              <button
                onClick={() => setShowWritingSampleModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition-all border-0 cursor-pointer outline-none uppercase"
              >
                Đóng lại
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
