import type { IeltsTest } from '@miuprep/content';

interface ModeSelectorModalProps {
  selectedTestForMode: IeltsTest;
  onClose: () => void;
  onSelectMode: (test: IeltsTest, mode: 'practice' | 'exam') => void;
}

export default function ModeSelectorModal({ selectedTestForMode, onClose, onSelectMode }: ModeSelectorModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        <header className="bg-gradient-to-r from-accent-700 to-accentdeep-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏆</span>
            <div className="text-left">
              <h3 className="text-base font-bold tracking-tight m-0 text-white leading-tight">
                Lựa chọn chế độ làm bài
              </h3>
              <span className="text-[10px] text-accentdeep-200 font-semibold tracking-wide uppercase mt-0.5 block">
                {selectedTestForMode.title}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-bold text-lg bg-transparent border-0 cursor-pointer outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </header>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-xs text-slate-500 m-0 leading-relaxed text-left">
            Hệ thống hỗ trợ 2 chế độ luyện tập sư phạm. Hãy chọn một chế độ phù hợp với mục tiêu hiện tại của bạn:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Practice Mode card */}
            <div
              id="practice-mode-select"
              onClick={() => onSelectMode(selectedTestForMode, 'practice')}
              className="border border-slate-200 hover:border-accent-400 bg-slate-50/50 hover:bg-accent-50/10 p-5 rounded-xl cursor-pointer transition-all flex flex-col gap-2.5 hover:shadow-md group text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">💡</span>
                <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200 uppercase">
                  Học tập
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 m-0 group-hover:text-accent-700">Practice Mode</h4>
              <ul className="text-[10px] text-slate-500 flex flex-col gap-1 list-disc list-inside p-0 m-0 leading-relaxed">
                <li>Cho phép tạm dừng thời gian</li>
                <li>Tua audio phát thoải mái</li>
                <li>Có gợi ý Socratic từng câu</li>
              </ul>
            </div>

            {/* Exam Mode card */}
            <div
              id="exam-mode-select"
              onClick={() => onSelectMode(selectedTestForMode, 'exam')}
              className="border border-slate-200 hover:border-red-400 bg-slate-50/50 hover:bg-red-50/10 p-5 rounded-xl cursor-pointer transition-all flex flex-col gap-2.5 hover:shadow-md group text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">⏱️</span>
                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200 uppercase">
                  Thi thật
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 m-0 group-hover:text-red-700">Exam Mode</h4>
              <ul className="text-[10px] text-slate-500 flex flex-col gap-1 list-disc list-inside p-0 m-0 leading-relaxed">
                <li>Không thể dừng thời gian</li>
                <li>Khóa cứng thanh tua audio</li>
                <li>Tự động nộp khi hết giờ</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="bg-slate-50 px-6 py-3.5 flex justify-end border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-350 text-slate-700 hover:text-slate-800 font-semibold text-xs py-2 px-3.5 rounded shadow-sm transition-all cursor-pointer border-0 outline-none"
          >
            Hủy bỏ
          </button>
        </footer>
      </div>
    </div>
  );
}
