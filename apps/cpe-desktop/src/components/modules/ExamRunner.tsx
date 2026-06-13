import { ExamTimer } from '@miuprep/ui';
import { ExamSectionSheet } from '@miuprep/exam-desktop';
import { isCorrectAnswer, analyzeWeaknesses } from '@miuprep/core';
import type { IeltsQuestion, IeltsTest, QuestionGroup } from '@miuprep/content';
import type { ExamAttempt } from '@miuprep/db';

type DashboardTab = 'dashboard' | 'exam' | 'writing_ai' | 'error_notebook' | 'speaking_ai' | 'adaptive_room';

interface ExamRunnerProps {
  selectedTest: IeltsTest;
  isReviewMode: boolean;
  reviewAttempt: ExamAttempt | null;
  currentExamMode: 'practice' | 'exam';
  togglePause: () => void;
  isPaused: boolean;
  remainingSeconds: number;
  handleAutoSubmit: () => void;
  submitExam: () => void;
  userAnswers: Record<string, string>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  listeningReviewTab: 'transcript' | 'questions';
  setListeningReviewTab: React.Dispatch<React.SetStateAction<'transcript' | 'questions'>>;
  getHighlightedPassageHtml: (passage: string, questionGroups: QuestionGroup[], isReviewMode: boolean) => string;
  getSocraticHintForQuestion: (q: IeltsQuestion) => string;
  setSelectedTest: (test: IeltsTest | null) => void;
  setActiveTab: (tab: DashboardTab) => void;
}

export default function ExamRunner({
  selectedTest,
  isReviewMode,
  reviewAttempt,
  currentExamMode,
  togglePause,
  isPaused,
  remainingSeconds,
  handleAutoSubmit,
  submitExam,
  userAnswers,
  setUserAnswers,
  listeningReviewTab,
  setListeningReviewTab,
  getHighlightedPassageHtml,
  getSocraticHintForQuestion,
  setSelectedTest,
  setActiveTab,
}: ExamRunnerProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header bar during exam / review */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
        {isReviewMode ? (
          <div className="text-left">
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Educational Review Mode
            </span>
            <h2 className="text-lg font-bold text-slate-800 leading-tight mt-1">{selectedTest.title}</h2>
          </div>
        ) : (
          <div className="text-left">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {selectedTest.skill} exam in progress
            </span>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{selectedTest.title}</h2>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isReviewMode ? (
            <>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Performance Result</span>
                <span className="text-sm font-bold text-slate-700">
                  Raw Score:{' '}
                  <span className="text-emerald-600 font-mono">
                    {reviewAttempt?.scores?.rawScore ?? 0}/{reviewAttempt?.scores?.totalQuestions ?? 0}
                  </span>{' '}
                  | Band:{' '}
                  <span className="text-emerald-600 font-mono font-black">
                    {reviewAttempt?.scores?.bandScore?.toFixed(1) ?? '0.0'}
                  </span>
                  {reviewAttempt?.scores?.isMockScoring && (
                    <span className="text-[9px] text-amber-600 ml-1.5 font-normal italic">(Estimated)</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedTest(null);
                  setActiveTab('dashboard');
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2.5 px-4 rounded shadow transition-all cursor-pointer border-0 outline-none"
              >
                Exit Review
              </button>
            </>
          ) : (
            <>
              {currentExamMode === 'practice' ? (
                <button
                  onClick={togglePause}
                  className={`px-3 py-2 rounded text-xs font-semibold border shadow transition-all cursor-pointer ${
                    isPaused
                      ? 'bg-amber-600 border-transparent text-white hover:bg-amber-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isPaused ? 'Resume Exam' : 'Pause Exam'}
                </button>
              ) : (
                <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded font-bold uppercase select-none">
                  Exam Lock (Pause Blocked)
                </span>
              )}
              <ExamTimer remainingSeconds={remainingSeconds} onTimeUp={handleAutoSubmit} isPaused={isPaused} />
              <button
                onClick={submitExam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-4 rounded shadow transition-all cursor-pointer border-0 outline-none"
              >
                Submit Exam
              </button>
            </>
          )}
        </div>
      </div>

      {/* Exam Content panel */}
      {!isPaused ? (
        <ExamSectionSheet
          selectedTest={selectedTest}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          isReviewMode={isReviewMode}
          currentExamMode={currentExamMode}
          reviewAttempt={reviewAttempt}
          listeningReviewTab={listeningReviewTab}
          setListeningReviewTab={setListeningReviewTab}
          getHighlightedPassageHtml={getHighlightedPassageHtml}
          getSocraticHintForQuestion={getSocraticHintForQuestion}
          isCorrectAnswer={isCorrectAnswer}
          analyzeWeaknesses={analyzeWeaknesses}
        />
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-12 rounded-xl text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto shadow-sm">
          <span className="text-4xl animate-bounce">⏱️</span>
          <h3 className="text-lg font-black text-amber-900 m-0">Bài thi đang được tạm dừng</h3>
          <p className="text-xs text-amber-700 leading-relaxed max-w-sm m-0">
            Đây là tính năng độc quyền của **Practice Mode**. Bộ đếm ngược thời gian thi và trình phát âm thanh đã tạm
            dừng. Bạn có thể nhấn nút Tiếp tục bất kỳ lúc nào để tiếp tục làm bài.
          </p>
          <button
            onClick={togglePause}
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-6 rounded-lg shadow transition-all cursor-pointer border-0 outline-none uppercase tracking-wider"
          >
            Tiếp tục làm bài (Resume)
          </button>
        </div>
      )}
    </div>
  );
}
