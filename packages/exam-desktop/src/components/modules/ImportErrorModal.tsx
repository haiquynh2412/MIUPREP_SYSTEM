import type { ValidationError } from '@miuprep/content';
import { useTrackConfig } from '../../track-config';

interface ImportErrorModalProps {
  importErrors: ValidationError[];
  onClose: () => void;
}

export default function ImportErrorModal({
  importErrors,
  onClose,
}: ImportErrorModalProps) {
  const track = useTrackConfig();
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]">
        <header className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h3 className="text-base font-bold tracking-tight m-0 text-white leading-none">Exam Package Conformance Failure</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-bold text-lg bg-transparent border-0 cursor-pointer"
            aria-label="Close modal"
          >
            &times;
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <p className="text-sm text-slate-600 m-0 leading-normal">
            The imported JSON file did not pass the standard {track.label}-style schema validation rules. Please review and correct the following errors before re-importing:
          </p>
          
          <div className="flex flex-col gap-2">
            {importErrors.map((err, idx) => (
              <div 
                key={idx} 
                className={`border p-3 rounded-lg text-xs flex flex-col gap-1 ${
                  err.severity === 'error' 
                    ? 'border-red-100 bg-red-50 text-red-800' 
                    : 'border-amber-100 bg-amber-50 text-amber-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Path: <code className="bg-white/60 px-1 py-0.5 rounded font-mono text-[10px]">{err.path}</code></span>
                  <span className="uppercase text-[9px] bg-white/80 px-1.5 py-0.5 rounded">{err.severity}</span>
                </div>
                <p className="m-0 leading-normal text-slate-700 mt-1">{err.message}</p>
              </div>
            ))}
          </div>
        </div>
        
        <footer className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2.5 px-4 rounded shadow transition-all cursor-pointer border-0 outline-none"
          >
            Acknowledge & Close
          </button>
        </footer>
      </div>
    </div>
  );
}
