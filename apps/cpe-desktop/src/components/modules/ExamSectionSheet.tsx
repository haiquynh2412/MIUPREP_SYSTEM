/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import type { IeltsTest, IeltsQuestion, QuestionGroup } from '@miuprep/content';
import type { ExamAttempt } from '@miuprep/db';
import { 
  IeltsAudioPlayer, 
  SplitScreenReading,
  sanitizeHtml
} from '@miuprep/ui';

interface ExamSectionSheetProps {
  selectedTest: IeltsTest;
  userAnswers: Record<string, string>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isReviewMode: boolean;
  currentExamMode: 'practice' | 'exam';
  reviewAttempt: ExamAttempt | null;
  listeningReviewTab: 'questions' | 'transcript';
  setListeningReviewTab: React.Dispatch<React.SetStateAction<'questions' | 'transcript'>>;
  getHighlightedPassageHtml: (passage: string, questionGroups: QuestionGroup[], isReviewMode: boolean) => string;
  getSocraticHintForQuestion: (q: IeltsQuestion) => string;
  isCorrectAnswer: (userAnswer: string | null | undefined, acceptedNormalizedAnswers: string[][]) => boolean;
  analyzeWeaknesses: (userAnswers: Record<string, string>, test: IeltsTest) => Array<{
    questionType: string;
    correct: number;
    total: number;
    accuracy: number;
    status: string;
  }>;
}

export default function ExamSectionSheet({
  selectedTest,
  userAnswers,
  setUserAnswers,
  isReviewMode,
  currentExamMode,
  reviewAttempt,
  listeningReviewTab,
  setListeningReviewTab,
  getHighlightedPassageHtml,
  getSocraticHintForQuestion,
  isCorrectAnswer,
  analyzeWeaknesses,
}: ExamSectionSheetProps) {

  return (
    <div className="flex flex-col gap-6">
      {/* Diagnostic Weakness Panel in Review Mode */}
      {isReviewMode && reviewAttempt && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md flex flex-col gap-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <svg className="w-5 h-5 text-emerald-600 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            Diagnostic Skill Report (Phân tích chẩn đoán điểm yếu)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: metrics list */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Question Type Accuracy</span>
              <div className="flex flex-col gap-2.5">
                {analyzeWeaknesses(userAnswers, selectedTest).map(weak => {
                  const getStatusStyle = (status: string) => {
                    if (status === 'proficient') return 'bg-green-100 text-green-800 border-green-200';
                    if (status === 'needs_improvement') return 'bg-amber-100 text-amber-800 border-amber-200';
                    return 'bg-red-100 text-red-800 border-red-200';
                  };
                  const formatTypeName = (type: string) => {
                    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  };
                  return (
                    <div key={weak.questionType} className="flex items-center justify-between bg-slate-50 border p-3 rounded-lg text-xs text-left">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-800">{formatTypeName(weak.questionType)}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Correct: {weak.correct}/{weak.total} questions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${weak.status === 'proficient' ? 'bg-green-500' : weak.status === 'needs_improvement' ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${weak.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-slate-700 w-10 text-right">{weak.accuracy}%</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded uppercase ${getStatusStyle(weak.status)}`}>
                          {weak.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Right: teacher pedagogical guidance */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-5 flex flex-col justify-between text-left">
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2">Lời khuyên sư phạm cá nhân hóa</h4>
                <div className="text-[11px] text-emerald-950/90 leading-relaxed flex flex-col gap-2.5">
                  {analyzeWeaknesses(userAnswers, selectedTest).map(weak => {
                    if (weak.status === 'critical') {
                      if (weak.questionType === 'true_false_not_given') {
                        return <p key={weak.questionType}>⚠️ <strong>T/F/NG:</strong> Bạn đang yếu dạng phân loại dữ liệu này. Hãy chọn <strong>FALSE</strong> khi bài đọc trái ngược hoàn toàn; chọn <strong>NOT GIVEN</strong> khi thông tin không xuất hiện.</p>;
                      }
                      if (weak.questionType === 'gap_fill') {
                        return <p key={weak.questionType}>⚠️ <strong>Gap Fill (Điền từ):</strong> Cần cẩn thận về giới hạn từ (Word Limit) và dạng từ (danh từ số nhiều/số ít, động từ chia). Luôn kiểm tra ngữ pháp xung quanh ô trống.</p>;
                      }
                      if (weak.questionType === 'multiple_choice') {
                        return <p key={weak.questionType}>⚠️ <strong>Multiple Choice:</strong> Cần cảnh giác với phương án gây nhiễu. Hãy tìm sự paraphrase đồng nghĩa thay vì chọn từ giống hệt trong bài đọc.</p>;
                      }
                      return <p key={weak.questionType}>⚠️ <strong>{weak.questionType}:</strong> Hãy tập trung làm thêm các bài luyện dạng này và phân tích từ vựng đồng nghĩa.</p>;
                    }
                    if (weak.status === 'needs_improvement') {
                      return <p key={weak.questionType}>💡 <strong>{weak.questionType}:</strong> Độ chính xác tạm ổn, hãy chú ý thời gian làm bài dạng này để tăng tốc độ.</p>;
                    }
                    return <p key={weak.questionType}>✨ <strong>{weak.questionType}:</strong> Kỹ năng làm bài rất tốt! Duy trì phong độ.</p>;
                  })}
                  {analyzeWeaknesses(userAnswers, selectedTest).length === 0 && (
                    <p>Chưa có dữ liệu phân tích. Hãy hoàn thành bài thi để xem chẩn đoán.</p>
                  )}
                </div>
              </div>
              <div className="border-t border-emerald-100/80 pt-2.5 mt-3 text-[9px] text-emerald-700 italic">
                Báo cáo từ CPE Analytical Core Engine.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2a. READING SECTION */}
      {selectedTest.skill === 'reading' && selectedTest.sections.map(sec => (
        <SplitScreenReading 
          key={sec.id} 
          passageHtml={getHighlightedPassageHtml(sec.passageHtml || '', sec.questionGroups, isReviewMode)}
        >
          <div className="flex flex-col gap-6 text-left">
            <p className="text-sm font-medium bg-slate-100 p-3 rounded border border-slate-200 text-slate-700 mb-2">
              {sec.instructions}
            </p>
            
            {sec.questionGroups.map(grp => (
              <div key={grp.id} className="border-b border-slate-100 pb-5 last:border-0">
                <h4 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-2 mb-3">
                  {grp.instruction}
                </h4>

                {/* Gapped Text Paragraph Pool */}
                {(grp as any).paragraphOptions && (grp as any).paragraphOptions.length > 0 && (
                  <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-5 mb-5 flex flex-col gap-3">
                    <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-100 pb-2 flex items-center gap-1.5">
                      📄 Danh sách các đoạn văn lựa chọn (Paragraph Options A - H)
                    </h5>
                    <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-1">
                      {(grp as any).paragraphOptions.map((opt: any) => (
                        <div key={opt.label} className="bg-white border border-slate-100 p-3.5 rounded-lg text-xs leading-relaxed text-slate-700 shadow-sm flex gap-3 text-left">
                          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 shrink-0 h-fit">
                            Đoạn {opt.label}
                          </span>
                          <p className="m-0 text-slate-650">{opt.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-4">
                  {grp.questions.map(q => {
                    const isCorrect = isCorrectAnswer(userAnswers[q.id], q.acceptedAnswers);
                    return (
                      <div 
                        key={q.id} 
                        className={`text-sm flex flex-col gap-2 transition-all duration-200 ${
                          isReviewMode 
                            ? `p-4 rounded-lg border ${
                                isCorrect 
                                  ? 'bg-green-50/40 border-green-200 text-green-950 shadow-sm' 
                                  : 'bg-red-50/40 border-red-200 text-red-950 shadow-sm'
                              }` 
                            : 'border-transparent'
                        }`}
                      >
                        <span className="font-semibold text-slate-800 flex items-center gap-2.5">
                          {isReviewMode && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${
                              isCorrect ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {isCorrect ? 'CORRECT' : 'INCORRECT'}
                            </span>
                          )}
                          Q. {q.instruction.replace('______', `(Answer ${q.blankIndex ?? ''})`)}
                        </span>
                        
                        {q.type === 'gap_fill' && (
                          <input
                            type="text"
                            value={userAnswers[q.id] || ''}
                            onChange={e => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                            placeholder={isReviewMode ? "(No response)" : `Type answer for blank ${q.blankIndex}`}
                            disabled={isReviewMode}
                            className="border border-slate-300 rounded px-3 py-1.5 max-w-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800 disabled:bg-white/80 disabled:cursor-not-allowed disabled:text-slate-700"
                          />
                        )}

                        {q.type === 'multiple_choice' && q.options && (
                          <div className="flex flex-col gap-2 mt-1">
                            {q.options.map(opt => {
                              const char = opt.substring(0, 1);
                              return (
                                <label 
                                  key={opt} 
                                  className={`flex items-center gap-2 cursor-pointer border p-2 rounded transition-all text-xs ${
                                    userAnswers[q.id] === char 
                                      ? (isReviewMode 
                                          ? (isCorrect ? 'bg-green-100/70 border-green-300 font-bold' : 'bg-red-100/70 border-red-300 font-bold')
                                          : 'bg-emerald-50 border-emerald-300 font-bold'
                                        ) 
                                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                  } ${isReviewMode ? 'cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={char}
                                    checked={userAnswers[q.id] === char}
                                    onChange={() => setUserAnswers({...userAnswers, [q.id]: char})}
                                    disabled={isReviewMode}
                                    className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-70"
                                  />
                                  <span className="text-slate-700">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'true_false_not_given' && (
                          <div className="flex gap-3 mt-1">
                            {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                              <label 
                                key={opt} 
                                className={`flex items-center gap-2 cursor-pointer border px-3 py-1.5 rounded text-xs transition-all ${
                                  userAnswers[q.id] === opt 
                                    ? (isReviewMode 
                                        ? (isCorrect ? 'bg-green-100/70 border-green-300 font-bold' : 'bg-red-100/70 border-red-300 font-bold')
                                        : 'bg-emerald-50 border-emerald-300 font-bold'
                                      ) 
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                } ${isReviewMode ? 'cursor-not-allowed' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  checked={userAnswers[q.id] === opt}
                                  onChange={() => setUserAnswers({...userAnswers, [q.id]: opt})}
                                  disabled={isReviewMode}
                                  className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-70"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'multiple_select' && q.options && (
                          <div className="flex flex-col gap-2 mt-1">
                            {q.options.map(opt => {
                              const char = opt.substring(0, 1);
                              const currentVal = userAnswers[q.id] || '';
                              const selectedArray = currentVal ? currentVal.split(',').map(s => s.trim()) : [];
                              const isChecked = selectedArray.includes(char);
                              
                              const handleCheckboxChange = () => {
                                let newArray;
                                if (isChecked) {
                                  newArray = selectedArray.filter(item => item !== char);
                                } else {
                                  newArray = [...selectedArray, char];
                                }
                                const newVal = newArray.sort().join(', ');
                                setUserAnswers({...userAnswers, [q.id]: newVal});
                              };

                              return (
                                <label 
                                  key={opt} 
                                  className={`flex items-center gap-2 cursor-pointer border p-2 rounded transition-all text-xs ${
                                    isChecked 
                                      ? (isReviewMode 
                                          ? (isCorrect ? 'bg-green-100/70 border-green-300 font-bold' : 'bg-red-100/70 border-red-300 font-bold')
                                          : 'bg-emerald-50 border-emerald-300 font-bold'
                                        ) 
                                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                  } ${isReviewMode ? 'cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    value={char}
                                    checked={isChecked}
                                    onChange={handleCheckboxChange}
                                    disabled={isReviewMode}
                                    className="text-emerald-600 focus:ring-emerald-500 rounded disabled:opacity-70"
                                  />
                                  <span className="text-slate-700">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'table_completion' && (
                          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded max-w-md">
                            <span className="text-[10px] font-bold text-slate-500 font-mono">CELL</span>
                            <input
                              type="text"
                              value={userAnswers[q.id] || ''}
                              onChange={e => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                              placeholder={isReviewMode ? "(No response)" : "Enter cell value"}
                              disabled={isReviewMode}
                              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 max-w-[160px] bg-white text-slate-800 disabled:bg-white/80 disabled:cursor-not-allowed"
                            />
                          </div>
                        )}

                        {q.type === 'matching_headings' && q.options && (
                          <div className="flex flex-col gap-2 mt-1 max-w-md">
                            <select
                              value={userAnswers[q.id] || ''}
                              onChange={e => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                              disabled={isReviewMode}
                              className="bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer text-slate-800 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-700"
                            >
                              <option value="">-- Choose Heading --</option>
                              {q.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {q.type === 'map_labeling' && (
                          <div className="flex flex-col gap-2 mt-1 max-w-md">
                            {q.options ? (
                              <select
                                value={userAnswers[q.id] || ''}
                                onChange={e => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                                disabled={isReviewMode}
                                className="bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer text-slate-800 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-700"
                              >
                                <option value="">-- Select Location --</option>
                                {q.options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={userAnswers[q.id] || ''}
                                onChange={e => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                                placeholder={isReviewMode ? "(No response)" : "Enter location name"}
                                disabled={isReviewMode}
                                className="border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 max-w-xs bg-white text-slate-800 disabled:bg-white/80 disabled:cursor-not-allowed disabled:text-slate-700"
                              />
                            )}
                          </div>
                        )}

                        {q.type === 'gapped_text' && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {(q.options || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']).map(opt => {
                              const isSelected = userAnswers[q.id] === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={isReviewMode}
                                  onClick={() => setUserAnswers({...userAnswers, [q.id]: opt})}
                                  className={`w-9 h-9 rounded-lg font-bold border transition-all text-xs flex items-center justify-center cursor-pointer ${
                                    isSelected
                                      ? (isReviewMode
                                          ? (isCorrect ? 'bg-green-600 border-green-600 text-white shadow-sm' : 'bg-red-600 border-red-600 text-white shadow-sm')
                                          : 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                        )
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350'
                                  } ${isReviewMode ? 'cursor-not-allowed opacity-80' : ''}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'multiple_matching' && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {(q.options || ['A', 'B', 'C', 'D']).map(opt => {
                              const isSelected = userAnswers[q.id] === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={isReviewMode}
                                  onClick={() => setUserAnswers({...userAnswers, [q.id]: opt})}
                                  className={`w-9 h-9 rounded-lg font-bold border transition-all text-xs flex items-center justify-center cursor-pointer ${
                                    isSelected
                                      ? (isReviewMode
                                          ? (isCorrect ? 'bg-green-600 border-green-600 text-white shadow-sm' : 'bg-red-600 border-red-600 text-white shadow-sm')
                                          : 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                        )
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350'
                                  } ${isReviewMode ? 'cursor-not-allowed opacity-80' : ''}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Socratic Hinting in Practice Mode */}
                        {!isReviewMode && currentExamMode === 'practice' && (
                          <div className="mt-2 text-left">
                            <details className="cursor-pointer group">
                              <summary className="text-[10px] text-emerald-600 font-bold hover:text-emerald-800 flex items-center gap-1 outline-none select-none">
                                <span>💡 Xem gợi ý tư duy Socratic</span>
                              </summary>
                              <div className="mt-1.5 p-2.5 bg-emerald-50 border border-indigo-150 rounded text-[10px] leading-relaxed text-emerald-900 font-sans">
                                {getSocraticHintForQuestion(q)}
                              </div>
                            </details>
                          </div>
                        )}

                        {/* Explanation Educational Box */}
                        {isReviewMode && (
                          <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md text-xs leading-normal flex flex-col gap-1.5 shadow-sm text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-600">Đáp án chuẩn:</strong> 
                              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}
                              </span>
                            </div>
                            
                            {userAnswers[q.id] && (
                              <div className="flex items-center gap-1.5">
                                <strong className="text-slate-600">Bài làm của bạn:</strong> 
                                <span className={`font-mono px-2 py-0.5 rounded border ${
                                  isCorrect 
                                    ? 'text-emerald-700 font-bold bg-emerald-50 border-emerald-100' 
                                    : 'text-rose-700 font-bold bg-rose-50 border-rose-100'
                                }`}>
                                  {userAnswers[q.id]}
                                </span>
                              </div>
                            )}
                            
                            {q.explanation && (
                              <div className="mt-1.5 border-t border-slate-100 pt-1.5">
                                <strong className="text-emerald-900 font-semibold block mb-0.5">Sư phạm giải thích chi tiết:</strong> 
                                <p className="text-slate-600 m-0 leading-relaxed font-sans">{q.explanation}</p>
                              </div>
                            )}
                            
                            {q.answerLocation && (
                              <div className="mt-1.5 border-t border-slate-100 pt-1.5">
                                <strong className="text-slate-500 font-semibold block mb-0.5">Dẫn chứng trực tiếp từ bài đọc:</strong> 
                                <p className="text-slate-600 m-0 font-serif italic text-[11px] bg-slate-50 p-2.5 rounded border border-slate-150 leading-relaxed select-all">
                                  "{q.answerLocation}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SplitScreenReading>
      ))}

      {/* 2b. LISTENING SECTION */}
      {selectedTest.skill === 'listening' && selectedTest.sections.map(sec => (
        <div key={sec.id} className="flex flex-col gap-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm text-left">
          <IeltsAudioPlayer src={sec.audioPath || ''} checksum={sec.audioChecksum} examMode={currentExamMode === 'exam'} />
          
          <p className="text-sm font-medium bg-slate-100 p-3 rounded border border-slate-200 text-slate-700">
            {sec.instructions}
          </p>

          {/* Sub-tab controls in Review Mode */}
          {isReviewMode && sec.transcript && (
            <div className="flex border-b border-slate-200 gap-1.5 mt-2">
              <button
                onClick={() => setListeningReviewTab('questions')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  listeningReviewTab === 'questions'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Questions Sheet (Bảng câu hỏi)
              </button>
              <button
                onClick={() => setListeningReviewTab('transcript')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  listeningReviewTab === 'transcript'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Listening Tapescript (Lời thoại bài nghe)
              </button>
            </div>
          )}

          {(!isReviewMode || listeningReviewTab === 'questions') ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {sec.questionGroups.map((grp, index) => (
                <div key={grp.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-900 border-l-4 border-green-500 pl-2 mb-3">
                    Section {index + 1}: {grp.instruction}
                  </h4>
                  
                  <div className="flex flex-col gap-4">
                    {grp.questions.map(q => {
                      const isCorrect = isCorrectAnswer(userAnswers[q.id], q.acceptedAnswers);
                      return (
                        <div 
                          key={q.id} 
                          className={`text-sm flex flex-col gap-2 transition-all duration-200 ${
                            isReviewMode 
                              ? `p-4 rounded-lg border ${
                                  isCorrect 
                                    ? 'bg-green-50/40 border-green-200 text-green-950 shadow-sm' 
                                    : 'bg-red-50/40 border-red-200 text-red-950 shadow-sm'
                                }` 
                              : 'border-transparent'
                          }`}
                        >
                          <span className="font-semibold text-slate-800 flex items-center gap-2.5">
                            {isReviewMode && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${
                                isCorrect ? 'bg-green-600' : 'bg-red-600'
                              }`}>
                                {isCorrect ? 'CORRECT' : 'INCORRECT'}
                              </span>
                            )}
                            Q. {q.instruction.replace('______', `(Answer ${q.blankIndex ?? ''})`)}
                          </span>
                          
                          {q.type === 'gap_fill' && (
                            <input
                              type="text"
                              value={userAnswers[q.id] || ''}
                              onChange={e => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                              placeholder={isReviewMode ? "(No response)" : `Answer field ${q.blankIndex}`}
                              disabled={isReviewMode}
                              className="border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800 max-w-xs disabled:bg-white/80 disabled:cursor-not-allowed disabled:text-slate-700"
                            />
                          )}

                          {q.type === 'multiple_choice' && q.options && (
                            <div className="flex flex-col gap-2 mt-1">
                              {q.options.map(opt => {
                                const char = opt.substring(0, 1);
                                return (
                                  <label 
                                    key={opt} 
                                    className={`flex items-center gap-2 cursor-pointer border p-2 rounded transition-all text-xs ${
                                      userAnswers[q.id] === char 
                                        ? (isReviewMode 
                                            ? (isCorrect ? 'bg-green-100/70 border-green-300 font-bold' : 'bg-red-100/70 border-red-300 font-bold')
                                            : 'bg-emerald-50 border-emerald-300 font-bold'
                                          ) 
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    } ${isReviewMode ? 'cursor-not-allowed' : ''}`}
                                  >
                                    <input
                                      type="radio"
                                      name={q.id}
                                      value={char}
                                      checked={userAnswers[q.id] === char}
                                      onChange={() => setUserAnswers({...userAnswers, [q.id]: char})}
                                      disabled={isReviewMode}
                                      className="text-emerald-600 focus:ring-emerald-500 disabled:opacity-70"
                                    />
                                    <span className="text-slate-700">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {q.type === 'multiple_select' && q.options && (
                            <div className="flex flex-col gap-2 mt-1">
                              {q.options.map(opt => {
                                const char = opt.substring(0, 1);
                                const currentVal = userAnswers[q.id] || '';
                                const selectedArray = currentVal ? currentVal.split(',').map(s => s.trim()) : [];
                                const isChecked = selectedArray.includes(char);
                                
                                const handleCheckboxChange = () => {
                                  let newArray;
                                  if (isChecked) {
                                    newArray = selectedArray.filter(item => item !== char);
                                  } else {
                                    newArray = [...selectedArray, char];
                                  }
                                  const newVal = newArray.sort().join(', ');
                                  setUserAnswers({...userAnswers, [q.id]: newVal});
                                };

                                return (
                                  <label 
                                    key={opt} 
                                    className={`flex items-center gap-2 cursor-pointer border p-2 rounded transition-all text-xs ${
                                      isChecked 
                                        ? (isReviewMode 
                                            ? (isCorrect ? 'bg-green-100/70 border-green-300 font-bold' : 'bg-red-100/70 border-red-300 font-bold')
                                            : 'bg-emerald-50 border-emerald-300 font-bold'
                                          ) 
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    } ${isReviewMode ? 'cursor-not-allowed' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      value={char}
                                      checked={isChecked}
                                      onChange={handleCheckboxChange}
                                      disabled={isReviewMode}
                                      className="text-emerald-600 focus:ring-emerald-500 rounded disabled:opacity-70"
                                    />
                                    <span className="text-slate-700">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {q.type === 'table_completion' && (
                            <div className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded max-w-md">
                              <span className="text-[10px] font-bold text-slate-500 font-mono">CELL</span>
                              <input
                                type="text"
                                value={userAnswers[q.id] || ''}
                                onChange={e => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                                placeholder={isReviewMode ? "(No response)" : "Enter cell value"}
                                disabled={isReviewMode}
                                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 max-w-[160px] bg-white text-slate-800 disabled:bg-white/80 disabled:cursor-not-allowed"
                              />
                            </div>
                          )}

                          {/* Socratic Hinting in Practice Mode */}
                          {!isReviewMode && currentExamMode === 'practice' && (
                            <div className="mt-2 text-left">
                              <details className="cursor-pointer group">
                                <summary className="text-[10px] text-emerald-600 font-bold hover:text-emerald-800 flex items-center gap-1 outline-none select-none">
                                  <span>💡 Xem gợi ý tư duy Socratic</span>
                                </summary>
                                <div className="mt-1.5 p-2.5 bg-emerald-50 border border-indigo-150 rounded text-[10px] leading-relaxed text-emerald-900 font-sans">
                                  {getSocraticHintForQuestion(q)}
                                </div>
                              </details>
                            </div>
                          )}

                          {/* Explanation Educational Box */}
                          {isReviewMode && (
                            <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md text-xs leading-normal flex flex-col gap-1.5 shadow-sm text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <strong className="text-slate-600">Đáp án chuẩn:</strong> 
                                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}
                                </span>
                              </div>
                              
                              {userAnswers[q.id] && (
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-slate-600">Bài làm của bạn:</strong> 
                                  <span className={`font-mono px-2 py-0.5 rounded border ${
                                    isCorrect 
                                      ? 'text-emerald-700 font-bold bg-emerald-50 border-emerald-100' 
                                      : 'text-rose-700 font-bold bg-rose-50 border-rose-100'
                                  }`}>
                                    {userAnswers[q.id]}
                                  </span>
                                </div>
                              )}
                              
                              {q.explanation && (
                                <div className="mt-1.5 border-t border-slate-100 pt-1.5">
                                  <strong className="text-emerald-900 font-semibold block mb-0.5">Sư phạm giải thích chi tiết:</strong> 
                                  <p className="text-slate-600 m-0 leading-relaxed font-sans">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <InteractiveTapescript htmlText={sanitizeHtml(sec.transcript || '')} />
          )}
        </div>
      ))}
    </div>
  );
}

function InteractiveTapescript({ htmlText }: { htmlText: string }) {
  const [playingText, setPlayingText] = useState<string | null>(null);
  
  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingText(text);
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en-') && v.name.toLowerCase().includes('google')) || 
                       voices.find(v => v.lang.startsWith('en-')) || 
                       voices[0];
      if (engVoice) {
        utterance.voice = engVoice;
      }
      utterance.onend = () => {
        setPlayingText(null);
      };
      utterance.onerror = () => {
        setPlayingText(null);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingText(null);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const paragraph = target.closest('p');
    if (paragraph) {
      const textToSpeak = paragraph.innerText || paragraph.textContent || '';
      if (textToSpeak.trim()) {
        if (playingText === textToSpeak) {
          handleStop();
        } else {
          handleSpeak(textToSpeak);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      {playingText && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between animate-pulse text-left">
          <div className="flex items-center gap-2.5 text-xs text-emerald-900 text-left">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-left">Đang phát audio phân đoạn lời thoại...</span>
          </div>
          <button 
            onClick={handleStop}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0 outline-none shrink-0"
          >
            Dừng phát
          </button>
        </div>
      )}
      
      <div 
        onClick={handleContainerClick}
        className="prose prose-sm font-sans text-slate-750 leading-relaxed max-h-[60vh] overflow-y-auto bg-slate-50 border p-6 rounded-lg select-all cursor-pointer [&_p]:p-2 [&_p]:rounded-lg [&_p]:transition-all [&_p]:duration-200 hover:[&_p]:bg-slate-200/50 hover:[&_p]:text-slate-900 relative text-left"
        title="Click vào bất kỳ dòng thoại nào để phát âm thanh đọc thử của người bản xứ!"
        dangerouslySetInnerHTML={{ __html: htmlText }}
      />
      <span className="text-[10px] text-slate-400 italic text-left">
        *Mẹo sư phạm: Click vào từng đoạn hội thoại để AI đọc phát âm chuẩn học thuật (UK/US English), giúp phân tích sâu lý do làm sai.
      </span>
    </div>
  );
}
