import type { ErrorNotebookEntry } from '@miuprep/db';

interface ErrorNotebookProps {
  errorEntries: ErrorNotebookEntry[];
  notebookSearch: string;
  setNotebookSearch: (val: string) => void;
  notebookFilter: 'all' | 'due';
  setNotebookFilter: (val: 'all' | 'due') => void;
  currentReviewIdx: number;
  setCurrentReviewIdx: (val: number) => void;
  reviewQueue: ErrorNotebookEntry[];
  setReviewQueue: (val: ErrorNotebookEntry[]) => void;
  reviewUserAnswer: string;
  setReviewUserAnswer: (val: string) => void;
  reviewShowCorrect: boolean;
  setReviewShowCorrect: (val: boolean) => void;
  startNotebookReview: () => void;
  handleSrsGrade: (grade: number) => Promise<void>;
  onViewInExam?: (questionId: string, attemptId: string) => void;
}

export default function ErrorNotebook({
  errorEntries,
  notebookSearch,
  setNotebookSearch,
  notebookFilter,
  setNotebookFilter,
  currentReviewIdx,
  setCurrentReviewIdx,
  reviewQueue,
  setReviewQueue,
  reviewUserAnswer,
  setReviewUserAnswer,
  reviewShowCorrect,
  setReviewShowCorrect,
  startNotebookReview,
  handleSrsGrade,
  onViewInExam,
}: ErrorNotebookProps) {
  const getDueCount = () => {
    return errorEntries.filter((e) => new Date(e.nextReviewAt) <= new Date()).length;
  };

  // Grouping into Leitner boxes based on educational spacing metrics
  const box1 = errorEntries.filter((e) => (e.repetitions ?? 0) <= 1);
  const box2 = errorEntries.filter((e) => (e.repetitions ?? 0) > 1 && (e.intervalDays ?? 0) <= 7);
  const box3 = errorEntries.filter((e) => (e.repetitions ?? 0) > 1 && (e.intervalDays ?? 0) > 7);

  const totalEntries = errorEntries.length || 1;
  const pct1 = Math.round((box1.length / totalEntries) * 100);
  const pct2 = Math.round((box2.length / totalEntries) * 100);
  const pct3 = Math.round((box3.length / totalEntries) * 100);

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-left">
      {currentReviewIdx !== -1 && reviewQueue.length > 0 ? (
        /* Active Spaced Repetition Review Panel */
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 max-w-2xl mx-auto w-full flex flex-col gap-5 text-left">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Spaced Repetition Mode
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-1">
                Đang ôn tập câu hỏi: {currentReviewIdx + 1} / {reviewQueue.length}
              </h3>
            </div>
            <button
              onClick={() => {
                setCurrentReviewIdx(-1);
                setReviewQueue([]);
              }}
              className="text-slate-500 hover:text-slate-700 font-bold text-xs bg-slate-50 border px-2.5 py-1.5 rounded transition-colors cursor-pointer"
            >
              Thoát ôn tập
            </button>
          </div>

          {/* Card question info */}
          <div className="bg-slate-50 border rounded-lg p-4 text-xs leading-normal">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-slate-500 font-semibold border-b pb-1.5">
                <span>Question ID: {reviewQueue[currentReviewIdx].questionId}</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase text-[9px]">
                  {reviewQueue[currentReviewIdx].questionType}
                </span>
              </div>
              <div className="text-slate-700 font-medium py-1">
                <span className="font-bold text-indigo-900 block mb-1">
                  Nội dung / Ngữ cảnh câu hỏi:
                </span>
                Cần trả lời chính xác thông tin dựa trên kiến thức đã ghi nhận trong bài thi gốc.
              </div>
              <div className="bg-red-50 border border-red-100 p-2.5 rounded">
                <strong className="text-red-700">Câu trả lời sai trước đây của bạn:</strong>
                <span className="font-mono ml-1.5 bg-white border px-1.5 py-0.5 rounded text-xs font-bold text-red-800">
                  {reviewQueue[currentReviewIdx].userAnswer || '(Trống)'}
                </span>
              </div>
            </div>
          </div>

          {/* User Re-attempt Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Thử lại câu trả lời mới của bạn:
            </label>
            <input
              type="text"
              placeholder="Điền đáp án mới..."
              value={reviewUserAnswer}
              onChange={(e) => setReviewUserAnswer(e.target.value)}
              disabled={reviewShowCorrect}
              className="border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 focus:outline-none"
            />
            {!reviewShowCorrect && (
              <button
                onClick={() => setReviewShowCorrect(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded shadow-sm transition-all mt-1 cursor-pointer border-0 outline-none"
              >
                Hiện đáp án & Đánh giá trí nhớ
              </button>
            )}
          </div>

          {/* Solution & Spaced Repetition Grading Panel */}
          {reviewShowCorrect && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-center gap-1.5 text-left">
                  <strong className="text-emerald-900 font-bold text-sm">Đáp án đúng chuẩn xác:</strong>
                  <span className="font-mono text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded text-sm font-bold">
                    {reviewQueue[currentReviewIdx].correctAnswer}
                  </span>
                </div>
                {reviewUserAnswer && (
                  <div className="flex items-center gap-1.5 text-left">
                    <strong className="text-slate-600">Bạn vừa điền thử:</strong>
                    <span
                      className={`font-mono px-2 py-0.5 rounded border ${
                        reviewUserAnswer.trim().toLowerCase() ===
                        reviewQueue[currentReviewIdx].correctAnswer.trim().toLowerCase()
                          ? 'text-emerald-700 font-bold bg-white border-emerald-200'
                          : 'text-red-700 font-bold bg-white border-red-200'
                      }`}
                    >
                      {reviewUserAnswer}
                    </span>
                  </div>
                )}
                <div className="mt-1.5 border-t border-emerald-100 pt-1.5 text-left">
                  <strong className="text-emerald-900 block mb-1">Giải thích sư phạm:</strong>
                  <p className="m-0 text-emerald-800 leading-relaxed font-sans text-left">
                    {reviewQueue[currentReviewIdx].explanation}
                  </p>
                </div>
              </div>

              {/* SM2 Memory Grading controls */}
              <div className="border-t border-emerald-200 pt-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2 text-center">
                  Bạn đánh giá mức độ nhớ bài thế nào? (Kích hoạt Spaced Repetition)
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  <button
                    onClick={() => handleSrsGrade(0)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[10px] py-2 px-1 rounded text-center transition-all cursor-pointer border border-red-200 outline-none"
                  >
                    Grade 0<span className="block font-normal text-[8px]">Quên hẳn</span>
                  </button>
                  <button
                    onClick={() => handleSrsGrade(1)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[10px] py-2 px-1 rounded text-center transition-all cursor-pointer border border-red-200 outline-none"
                  >
                    Grade 1<span className="block font-normal text-[8px]">Mơ hồ</span>
                  </button>
                  <button
                    onClick={() => handleSrsGrade(2)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[10px] py-2 px-1 rounded text-center transition-all cursor-pointer border border-red-200 outline-none"
                  >
                    Grade 2<span className="block font-normal text-[8px]">Mới quên</span>
                  </button>
                  <button
                    onClick={() => handleSrsGrade(3)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[10px] py-2 px-1 rounded text-center transition-all cursor-pointer border border-blue-200 outline-none"
                  >
                    Grade 3<span className="block font-normal text-[8px]">Nhớ có gợi ý</span>
                  </button>
                  <button
                    onClick={() => handleSrsGrade(4)}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] py-2 px-1 rounded text-center transition-all cursor-pointer border border-emerald-200 outline-none"
                  >
                    Grade 4<span className="block font-normal text-[8px]">Nhớ tốt</span>
                  </button>
                  <button
                    onClick={() => handleSrsGrade(5)}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] py-2 px-1 rounded text-center transition-all cursor-pointer border border-emerald-200 outline-none"
                  >
                    Grade 5<span className="block font-normal text-[8px]">Nhớ tuyệt đối</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* General Error Notebook Dashboard */
        <div className="flex flex-col gap-6">
          {/* LEITNER BOXES DASHBOARD HEADER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                    🌱 Hộp Khởi Động
                  </span>
                  <span className="text-2xl font-black text-slate-800">{box1.length} thẻ</span>
                </div>
                <h4 className="text-xs font-bold text-slate-600 mt-3 mb-1">Daily Review (Ôn mỗi ngày)</h4>
                <p className="text-[10px] text-slate-400 leading-normal m-0 font-medium">
                  Chứa câu hỏi mới lưu hoặc câu trả lời bị đánh giá quên, cần luyện tập chuyên sâu ngay để củng cố.
                </p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span>Tỉ lệ phân bố</span>
                  <span>{pct1}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all" style={{ width: `${pct1}%` }} />
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full">
                    ⚡ Hộp Tăng Tốc
                  </span>
                  <span className="text-2xl font-black text-slate-800">{box2.length} thẻ</span>
                </div>
                <h4 className="text-xs font-bold text-slate-600 mt-3 mb-1">3-7 Days Review (Củng cố)</h4>
                <p className="text-[10px] text-slate-400 leading-normal m-0 font-medium">
                  Chứa câu có trí nhớ vừa phải, khoảng cách ôn tập tăng dần để đẩy nhanh tiến độ lưu trữ dữ liệu.
                </p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span>Tỉ lệ phân bố</span>
                  <span>{pct2}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${pct2}%` }} />
                </div>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                    🏆 Hộp Làm Chủ
                  </span>
                  <span className="text-2xl font-black text-slate-800">{box3.length} thẻ</span>
                </div>
                <h4 className="text-xs font-bold text-slate-600 mt-3 mb-1">Mastered (&gt; 7 Days Review)</h4>
                <p className="text-[10px] text-slate-400 leading-normal m-0 font-medium">
                  Đã đi sâu vào trí nhớ dài hạn. Khoảng cách ôn tập thưa thớt, giúp giảm tải áp lực cho người học.
                </p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span>Tỉ lệ phân bố</span>
                  <span>{pct3}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${pct3}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side: filter & start review session */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                <svg className="w-5 h-5 text-blue-600 fill-current" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
                SRS Spaced Repetition Panel
              </h3>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Bộ lọc câu hỏi
                </span>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-md">
                  <button
                    onClick={() => setNotebookFilter('due')}
                    className={`py-1.5 px-2 rounded text-xs font-semibold text-center transition-all border-0 outline-none cursor-pointer ${
                      notebookFilter === 'due'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                    }`}
                  >
                    Cần ôn hôm nay
                  </button>
                  <button
                    onClick={() => setNotebookFilter('all')}
                    className={`py-1.5 px-2 rounded text-xs font-semibold text-center transition-all border-0 outline-none cursor-pointer ${
                      notebookFilter === 'all'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                    }`}
                  >
                    Tất cả câu lỗi
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border p-4 rounded-lg flex flex-col justify-center items-center text-center shadow-inner">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Số câu cần ôn hôm nay
                </span>
                <span className="text-4xl font-black text-rose-600 mt-1 animate-pulse">
                  {getDueCount()}
                </span>
              </div>

              <button
                onClick={startNotebookReview}
                disabled={
                  errorEntries.filter((e) => {
                    if (notebookFilter === 'all') return true;
                    return new Date(e.nextReviewAt) <= new Date();
                  }).length === 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0 outline-none"
              >
                Bắt đầu ôn tập lặp quãng
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            {/* Right side: search & mistakes list */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-2">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-blue-600 fill-current" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
                  </svg>
                  Danh sách lỗi sai trong bài thi
                </h3>
                <input
                  type="text"
                  placeholder="Tìm kiếm mã câu hỏi, đáp án..."
                  value={notebookSearch}
                  onChange={(e) => setNotebookSearch(e.target.value)}
                  className="border border-slate-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 max-w-xs bg-white text-slate-800 focus:outline-none"
                />
              </div>

              {errorEntries.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-6 text-center border border-dashed rounded bg-slate-50/50 animate-pulse w-full">
                  Chúc mừng! Bạn chưa có lỗi sai nào được lưu.
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                  {errorEntries
                    .filter((entry) => {
                      if (notebookFilter === 'due' && new Date(entry.nextReviewAt) > new Date()) return false;
                      if (notebookSearch.trim() === '') return true;
                      return (
                        entry.questionId.toLowerCase().includes(notebookSearch.toLowerCase()) ||
                        entry.correctAnswer.toLowerCase().includes(notebookSearch.toLowerCase())
                      );
                    })
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="border border-slate-100 bg-slate-50/45 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition-all text-xs text-left"
                      >
                        <div className="flex flex-col gap-1 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800">Q. {entry.questionId}</span>
                            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase text-[9px]">
                              {entry.questionType}
                            </span>
                          </div>
                          <div className="mt-1 leading-normal text-left">
                            <span className="text-slate-500">Bạn đã điền:</span>{' '}
                            <span className="line-through text-rose-600 font-mono font-bold mr-3">
                              {entry.userAnswer || '(Trống)'}
                            </span>
                            <span className="text-slate-500">Đáp án đúng:</span>{' '}
                            <span className="text-green-700 font-mono font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                              {entry.correctAnswer}
                            </span>
                          </div>
                          {entry.explanation && (
                            <p className="m-0 text-slate-500 mt-1 italic text-[11px] leading-relaxed text-left">
                              Giải thích: {entry.explanation}
                            </p>
                          )}
                          {onViewInExam && (
                            <button
                              onClick={() => onViewInExam(entry.questionId, entry.attemptId)}
                              className="mt-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer outline-none transition-colors whitespace-nowrap self-start"
                            >
                              🔍 Xem câu hỏi gốc
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 font-semibold shrink-0 text-[10px] text-right">
                          <span className="text-slate-400 uppercase tracking-wider">Kế hoạch ôn tập</span>
                          <span className="text-slate-700 font-bold bg-slate-100 border px-2 py-0.5 rounded">
                            {new Date(entry.nextReviewAt).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            Khoảng cách: {entry.intervalDays} ngày
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
