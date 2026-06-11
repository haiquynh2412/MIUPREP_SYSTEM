/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo } from 'react';
import type { SpeakingFeedback, StorageAdapter } from '@miuprep/db';
import { AIAdapterFactory } from '@miuprep/ai';
import type { AIConfig } from '@miuprep/ai';
import type { CredentialStore } from '@miuprep/ai';
import { IELTS_SPEAKING_SAMPLES } from '@miuprep/content/src/mocks/ielts-writing-speaking-samples';
import { CPE_SPEAKING_SAMPLES } from '@miuprep/content/src/mocks/cpe-writing-speaking-samples';

interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface SpeakingAiRoomProps {
  speakingTopic: string;
  setSpeakingTopic: (val: string) => void;
  speakingFeedback: SpeakingFeedback | null;
  setSpeakingFeedback: (val: SpeakingFeedback | null) => void;
  aiConfig: AIConfig;
  credentialStore: CredentialStore;
  generateLocalId: (prefix: string) => string;
  db: StorageAdapter;
  track?: 'ielts' | 'cpe' | 'cae';
}

export default function SpeakingAiRoom({
  speakingTopic,
  setSpeakingTopic,
  speakingFeedback,
  setSpeakingFeedback,
  aiConfig,
  credentialStore,
  generateLocalId,
  db,
  track,
}: SpeakingAiRoomProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [speakingErrorMsg, setSpeakingErrorMsg] = useState<string | null>(null);
  const [isSpeakingLoading, setIsSpeakingLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const availableSpeakingSamples = useMemo(
    () => (track === 'cpe' || track === 'cae' ? CPE_SPEAKING_SAMPLES : IELTS_SPEAKING_SAMPLES),
    [track],
  );

  const [selectedSpeakingSampleId, setSelectedSpeakingSampleId] = useState(availableSpeakingSamples[0].id);
  const [showSpeakingOutlineModal, setShowSpeakingOutlineModal] = useState(false);
  const [speakingModalTab, setSpeakingModalTab] = useState<'outline' | 'sample' | 'vocab'>('outline');

  useEffect(() => {
    const currentSample = availableSpeakingSamples.find((s: any) => s.prompt === speakingTopic) || availableSpeakingSamples[0];
    setTimeout(() => {
      setSelectedSpeakingSampleId(currentSample.id);
      if (speakingTopic !== currentSample.prompt) {
        setSpeakingTopic(currentSample.prompt);
      }
    }, 0);
  }, [availableSpeakingSamples, speakingTopic, setSpeakingTopic]);

  const activeSpeakingSample = availableSpeakingSamples.find((s: any) => s.id === selectedSpeakingSampleId) || availableSpeakingSamples[0];

  const handleSpeakingSampleChange = (id: string) => {
    setSelectedSpeakingSampleId(id);
    const found = availableSpeakingSamples.find((s: any) => s.id === id);
    if (found) {
      setSpeakingTopic(found.prompt);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerAnimationFrameRef = useRef<number | null>(null);
  const recordingTimerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isCpeCae = track === 'cpe' || track === 'cae' || (speakingFeedback && speakingFeedback.bandOverall > 10);

  // Audio Visualizer Drawing Loop
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current) return;
      visualizerAnimationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(15, 23, 42)'; // Tailwind slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.0;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;

        // Beautiful curated gradients
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        if (isCpeCae) {
          gradient.addColorStop(0, '#059669'); // emerald-600
          gradient.addColorStop(0.5, '#10b981'); // emerald-500
          gradient.addColorStop(1, '#34d399'); // emerald-400
        } else {
          gradient.addColorStop(0, '#2563eb'); // blue-600
          gradient.addColorStop(0.5, '#3b82f6'); // blue-500
          gradient.addColorStop(1, '#60a5fa'); // blue-400
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  const startRecording = async () => {
    setSpeakingErrorMsg(null);
    setSpeakingFeedback(null);
    setAudioBase64(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          setAudioBase64(base64data);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      const AudioCtx = window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
        setTimeout(() => drawVisualizer(), 100);
      }

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic recording failed:', err);
      setSpeakingErrorMsg('Không thể truy cập Microphone. Vui lòng cấp quyền ghi âm cho thiết bị!');
      try {
        await db.logSystemEvent({
          id: generateLocalId('log'),
          level: 'ERROR',
          module: 'MICROPHONE',
          message: `Mic recording failed: ${err instanceof Error ? err.message : String(err)}`,
          payload: JSON.stringify({ speakingTopic })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerIntervalRef.current) {
        clearInterval(recordingTimerIntervalRef.current);
      }

      if (visualizerAnimationFrameRef.current) {
        cancelAnimationFrame(visualizerAnimationFrameRef.current);
      }
    }
  };

  const runSpeakingAiEvaluation = async () => {
    if (!audioBase64) return;
    setIsSpeakingLoading(true);
    setSpeakingFeedback(null);
    setSpeakingErrorMsg(null);
    try {
      const activeAi = AIAdapterFactory.create(aiConfig, credentialStore);
      const feedback = await activeAi.gradeSpeaking({
        attemptId: generateLocalId('speaking'),
        audioBase64: audioBase64,
        track,
        transcriptMock:
          aiConfig.provider === 'mock'
            ? 'Well, in my opinion, learning English is extremely crucial because it is spoken worldwide. However, some people finds it hard.'
            : undefined,
      });
      setSpeakingFeedback(feedback);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : String(e);
      setSpeakingErrorMsg(errMsg);
      try {
        await db.logSystemEvent({
          id: generateLocalId('log'),
          level: 'ERROR',
          module: 'AI',
          message: `Speaking AI evaluation failed: ${errMsg}`,
          payload: JSON.stringify({
            provider: aiConfig.provider,
            model: aiConfig.provider === 'openai' ? aiConfig.openaiModel : aiConfig.geminiModel,
            topic: speakingTopic,
            track
          })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
    } finally {
      setIsSpeakingLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerIntervalRef.current) {
        clearInterval(recordingTimerIntervalRef.current);
      }
      if (visualizerAnimationFrameRef.current) {
        cancelAnimationFrame(visualizerAnimationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {/* Audio Recorder panel */}
      <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-2 text-left">
          <svg className={`w-5 h-5 fill-current ${isCpeCae ? 'text-emerald-600' : 'text-blue-600'}`} viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
          Practice Room: Real Speech Capture
        </h2>

        {speakingErrorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3 shadow-sm text-xs leading-relaxed text-left">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0">
              !
            </span>
            <div>
              <span className="font-bold block">Ghi âm thất bại</span>
              <span className="opacity-90">{speakingErrorMsg}</span>
            </div>
          </div>
        )}

        {/* Speech topics */}
        <div className={`border rounded-xl p-4 flex flex-col gap-3 text-left ${
          isCpeCae ? 'bg-emerald-50/20 border-emerald-100 text-emerald-800' : 'bg-blue-50/20 border-blue-100 text-blue-800'
        }`}>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-black uppercase tracking-wide">
              1. Chọn chủ đề nói {track?.toUpperCase()}:
            </label>
            <select
              value={selectedSpeakingSampleId}
              onChange={(e) => handleSpeakingSampleChange(e.target.value)}
              className="bg-white border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 cursor-pointer text-slate-850 focus:outline-none w-full font-bold outline-none"
            >
              {availableSpeakingSamples.map((sample: any) => (
                <option key={sample.id} value={sample.id}>
                  Part {sample.part}: {sample.title}
                </option>
              ))}
            </select>
          </div>

          {activeSpeakingSample && (
            <div className="bg-white/80 border border-slate-150 rounded-lg p-3 text-xs leading-relaxed text-slate-600 flex flex-col gap-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase self-start ${
                isCpeCae ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Part {activeSpeakingSample.part} Speaking Card
              </span>
              <p className="m-0 font-serif italic text-slate-700 select-all">
                "{activeSpeakingSample.prompt}"
              </p>
            </div>
          )}

          <button
            onClick={() => setShowSpeakingOutlineModal(true)}
            className={`w-full text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-all border-0 cursor-pointer outline-none flex items-center justify-center gap-1.5 uppercase tracking-wide ${
              isCpeCae ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>💡</span> Xem dàn ý & tapescript mẫu
          </button>
        </div>

        {/* Audio Visualizer Canvas */}
        <div className="bg-slate-900 border rounded-xl overflow-hidden shadow-inner flex flex-col justify-center items-center p-6 gap-4 min-h-[25vh]">
          <canvas ref={canvasRef} width="400" height="120" className="w-full max-w-md rounded h-[120px]" />
          <div className="flex flex-col items-center text-center">
            {isRecording ? (
              <>
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping mb-2"></span>
                <span className="text-red-400 font-bold text-sm">Đang thu âm...</span>
                <span className="text-white font-mono text-lg font-black mt-1">
                  {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, '0')}
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-400 text-xs">Mic ghi âm chưa hoạt động</span>
                {audioBase64 && (
                  <span className="text-emerald-400 font-bold text-xs mt-2 flex items-center gap-1.5 animate-pulse">
                    ✓ Đã sẵn sàng truyền âm thanh Base64 ({Math.round(audioBase64.length / 1024)} KB)
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-sm bg-slate-50 p-4 rounded-lg border">
          <div className="flex gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isSpeakingLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                Bắt đầu thu âm
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-slate-800 hover:bg-slate-955 text-white font-bold text-xs py-2.5 px-4 rounded shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Dừng & Lưu ghi âm
              </button>
            )}
          </div>

          <button
            onClick={runSpeakingAiEvaluation}
            disabled={isSpeakingLoading || !audioBase64 || isRecording}
            className={`px-5 py-2.5 text-white font-bold rounded shadow transition-all text-xs cursor-pointer ${
              isSpeakingLoading || !audioBase64 || isRecording
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : isCpeCae
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSpeakingLoading ? 'Đang chấm điểm...' : 'Gửi audio & Chấm điểm Speaking'}
          </button>
        </div>
      </div>

      {/* AI Report panel */}
      <div className="flex flex-col gap-6">
        {speakingFeedback ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between text-white text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  {isCpeCae ? 'Cambridge English Scale Verification' : 'IELTS Grading Verification'}
                </span>
                <h4 className={`text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r mt-1 m-0 ${
                  isCpeCae ? 'from-emerald-400 via-emerald-300 to-purple-400' : 'from-blue-400 via-indigo-300 to-purple-400'
                }`}>
                  {isCpeCae
                    ? `Cambridge Scale Score: ${speakingFeedback.bandOverall?.toFixed(0) || '0'}`
                    : `Estimated Band: ${speakingFeedback.bandOverall?.toFixed(1) || '0.0'} ± 0.5`}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal m-0 italic">
                  *Lưu ý: Kết quả được tính toán chuẩn theo {isCpeCae ? 'C1/C2 Proficiency Speaking Descriptors' : 'IELTS Official Band Descriptors'}.
                </p>
              </div>
              <div className={`text-white rounded-2xl w-14 h-14 flex items-center justify-center font-black text-lg shadow-lg shrink-0 border ${
                isCpeCae ? 'bg-gradient-to-tr from-emerald-600 to-emerald-600 border-emerald-400' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-400'
              }`}>
                ✓
              </div>
            </div>

            {/* Rubric Version & Confidence Info */}
            <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-xl text-[10px] text-slate-500 font-mono text-left">
              <div>
                <span className="font-bold">Rubric:</span> {speakingFeedback.rubricVersion || 'v1.2.0'}
              </div>
              <div className="text-right">
                <span className="font-bold">Confidence:</span> {speakingFeedback.confidence ? `${(speakingFeedback.confidence * 100).toFixed(0)}%` : '95%'}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-slate-50 border p-3.5 rounded-lg text-xs leading-normal text-left">
              <strong className={`block mb-1 ${isCpeCae ? 'text-emerald-950' : 'text-indigo-900'}`}>
                Bản dịch Whisper STT từ giọng nói của bạn:
              </strong>
              <p className="m-0 font-serif italic text-slate-700 text-[11px] leading-relaxed">
                "{speakingFeedback.transcript}"
              </p>
            </div>

            {/* Criteria Bands Premium Grid */}
            <div className="flex flex-col gap-4 text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide m-0">
                Điểm Chi Tiết Theo Tiêu Chí {isCpeCae ? 'C2 Proficiency' : 'IELTS'} Speaking Rubric
              </h4>
              <div className="flex flex-col gap-4">
                {speakingFeedback.criteria.map((crit) => (
                  <div
                    key={crit.criterionName}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col text-xs text-left"
                  >
                    {/* Criterion Title & Score Bar */}
                    <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                      <span className="font-black text-slate-800 text-xs tracking-wide">{crit.criterionName}</span>
                      <span className={`text-white font-bold px-3 py-0.5 rounded-full text-xs shadow-sm ${
                        isCpeCae ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}>
                        {isCpeCae ? `Score ${crit.band !== null && crit.band !== undefined ? crit.band.toFixed(0) : 'N/A'}` : `Band ${crit.band !== null && crit.band !== undefined ? crit.band.toFixed(1) : 'N/A'}`}
                      </span>
                    </div>

                    {/* Analysis details */}
                    <div className="p-4 flex flex-col gap-3 text-left">
                      {/* Analysis Feedback */}
                      <p className="text-slate-600 m-0 leading-relaxed font-sans">{crit.feedbackText}</p>

                      {/* Evidence Quotes */}
                      {crit.evidence && crit.evidence.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Từ vựng & Cách nói ghi nhận (Direct Evidence):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {crit.evidence.map((quote, qIdx) => (
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
                              ⚠️ Nguyên nhân chưa đạt điểm cao hơn
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

            {/* Pronunciation Errors */}
            {speakingFeedback.pronunciationErrors && speakingFeedback.pronunciationErrors.length > 0 && (
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Phân tích lỗi phát âm IPA
                </h4>
                <div className="flex flex-col gap-2">
                  {speakingFeedback.pronunciationErrors.map((err, idx) => (
                    <div key={idx} className="border border-red-100 bg-red-50/50 p-3 rounded text-xs animate-fade-in text-left">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-red-700 font-bold">"{err.word}"</span>
                        {err.ipaSymbol && (
                          <span className="bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-sans text-[10px]">
                            {err.ipaSymbol}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-normal mt-1 m-0 text-left">
                        <strong className="text-slate-700">Gợi ý phát âm:</strong> {err.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fluency Review */}
            {speakingFeedback.fluencyReview && (
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Phân tích tốc độ nói & Độ trôi chảy
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 m-0 text-left">
                  {speakingFeedback.fluencyReview}
                </p>
              </div>
            )}

            {/* Socratic Hints */}
            {speakingFeedback.socraticHints && speakingFeedback.socraticHints.length > 0 && (
              <div className={`border-t pt-4 mt-2 text-left ${isCpeCae ? 'border-emerald-100' : 'border-indigo-100'}`}>
                <h4 className={`text-sm font-bold uppercase tracking-wide mb-2.5 flex items-center gap-1.5 ${
                  isCpeCae ? 'text-emerald-900' : 'text-indigo-900'
                }`}>
                  <span>💡</span> Hướng Dẫn Tư Duy Socratic (Speaking)
                </h4>
                <div className={`p-4 rounded-lg flex flex-col gap-2 border ${
                  isCpeCae ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                }`}>
                  {speakingFeedback.socraticHints.map((hint, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs leading-relaxed text-left">
                      <span className={`font-bold shrink-0 ${isCpeCae ? 'text-emerald-600' : 'text-indigo-600'}`}>?</span>
                      <p className="m-0 font-medium text-left">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-Side Sentence Upgrades */}
            {speakingFeedback.sentenceUpgrades && speakingFeedback.sentenceUpgrades.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-2 text-left">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5 text-left">
                  <span>🚀</span> Chiến Lược Nâng Band (+0.5 Speaking Upgrades)
                </h4>
                <div className="flex flex-col gap-4 text-left">
                  {speakingFeedback.sentenceUpgrades.map((upg, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 flex flex-col text-left">
                      {/* Comparison Side-by-Side */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 border-b">
                        {/* Original */}
                        <div className="p-4 bg-red-50/30 border-r border-slate-200/80 flex flex-col gap-1 text-xs text-left">
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-left">Your Speech (Câu nói của bạn)</span>
                          <p className="m-0 text-slate-700 italic text-left">"{upg.original}"</p>
                        </div>
                        {/* Elevated */}
                        <div className="p-4 bg-green-50/30 flex flex-col gap-1 text-xs text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider text-left">Elevated Speech (Câu nâng cấp)</span>
                            <span className="bg-green-100 text-green-800 text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                              {isCpeCae ? `Score ${upg.targetedBand.toFixed(0)}` : `Band ${upg.targetedBand.toFixed(1)}`}
                            </span>
                          </div>
                          <p className="m-0 text-slate-800 font-bold text-left">"{upg.upgraded}"</p>
                        </div>
                      </div>
                      {/* Explanation in Vietnamese */}
                      <div className="p-3 bg-white text-xs leading-normal text-slate-600 border-t border-slate-100 text-left">
                        <strong className="text-slate-700 block mb-0.5 font-bold text-left">💡 Điểm nâng cấp phát âm & từ vựng:</strong>
                        <p className="m-0 text-[11px] leading-relaxed text-slate-600 text-left">{upg.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isSpeakingLoading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
            <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
              isCpeCae ? 'border-emerald-600' : 'border-blue-600'
            }`}></div>
            <h3 className="text-base font-bold text-slate-700">Whisper STT & AI Grading...</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Động cơ Whisper đang giải mã nhị phân âm thanh Base64 và dịch giọng nói sang văn bản dạng tapescript. Sau
              đó, LLM chấm điểm theo chuẩn 4 tiêu chí và IPA. Mất khoảng 3 giây.
            </p>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-center text-slate-500 shadow-sm animate-pulse">
            <svg className="w-10 h-10 text-slate-400 mx-auto fill-current mb-2" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <h4 className="text-sm font-bold">Chưa có kết quả nói</h4>
            <p className="text-xs mt-1 leading-normal">
              Chọn chủ đề, nhấn thu âm nói câu trả lời của bạn và gửi chấm điểm để nhận phân tích.
            </p>
          </div>
        )}
      </div>

      {/* Speaking Outline & Sample Transcript Modal */}
      {showSpeakingOutlineModal && activeSpeakingSample && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <header className={`bg-gradient-to-r ${
              isCpeCae ? 'from-emerald-700 to-emerald-800' : 'from-blue-700 to-blue-800'
            } text-white px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🗣️</span>
                <div>
                  <h3 className="text-base font-bold tracking-tight m-0 text-white leading-tight">
                    Đề cương & Tapescript mẫu {track?.toUpperCase()} Speaking
                  </h3>
                  <span className="text-[10px] text-white/80 font-semibold tracking-wide uppercase mt-0.5 block font-sans">
                    {activeSpeakingSample.title}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSpeakingOutlineModal(false)}
                className="text-white/85 hover:text-white font-bold text-lg bg-transparent border-0 cursor-pointer outline-none font-sans"
              >
                &times;
              </button>
            </header>

            {/* Tab Navigation in Modal */}
            <div className="flex bg-slate-50 border-b px-6 pt-2">
              <button
                onClick={() => setSpeakingModalTab('outline')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  speakingModalTab === 'outline'
                    ? `${isCpeCae ? 'border-emerald-600 text-emerald-700' : 'border-blue-600 text-blue-750'} font-black`
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                📢 Ý tưởng & Dàn ý nói
              </button>
              <button
                onClick={() => setSpeakingModalTab('sample')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  speakingModalTab === 'sample'
                    ? `${isCpeCae ? 'border-emerald-600 text-emerald-700' : 'border-blue-600 text-blue-750'} font-black`
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                📻 Tapescript mẫu bản xứ
              </button>
              <button
                onClick={() => setSpeakingModalTab('vocab')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  speakingModalTab === 'vocab'
                    ? `${isCpeCae ? 'border-emerald-600 text-emerald-700' : 'border-blue-600 text-blue-750'} font-black`
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                🚀 Nâng cấp Từ vựng (Vocabulary)
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
              {speakingModalTab === 'outline' && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <p className="text-slate-500 m-0">
                    Phát triển ý tưởng nói trôi chảy và mạch lạc theo cấu trúc phân đoạn thông minh:
                  </p>
                  <div className="flex flex-col gap-3 mt-1">
                    {activeSpeakingSample.outline.map((stepText: any, idx: number) => (
                      <div key={idx} className={`bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl shadow-sm flex gap-3 items-start`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-sm ${
                          isCpeCae ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <p className="m-0 text-slate-750 font-medium leading-relaxed pt-0.5">{stepText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {speakingModalTab === 'sample' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-lg">
                    <span className="font-semibold text-slate-655">Bản tapescript mẫu đạt band {isCpeCae ? 'C2/C1' : '8.5+'} chuẩn bản xứ:</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded-full uppercase font-bold">Native Flow</span>
                  </div>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-serif text-[13px] leading-relaxed max-h-[30vh] overflow-y-auto shadow-inner select-all whitespace-pre-line border border-slate-800 italic">
                    "{activeSpeakingSample.sampleTranscript}"
                  </div>
                  
                  {/* Shadowing Guide Section */}
                  <div className={`border rounded-xl p-4 flex flex-col gap-3 bg-${isCpeCae ? 'emerald' : 'blue'}-50/10 border-${isCpeCae ? 'emerald' : 'blue'}-100`}>
                    <h4 className={`font-bold m-0 text-xs uppercase tracking-wide flex items-center gap-1.5 ${
                      isCpeCae ? 'text-emerald-800' : 'text-blue-800'
                    }`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCpeCae ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isCpeCae ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                      </span>
                      Phương pháp luyện nói Shadowing (Bám đuôi âm thanh)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed m-0">
                      Hãy sao chép bản tapescript trên, vừa đọc to vừa bắt chước tốc độ, ngữ điệu lên xuống và nối âm giống hệt bản xứ để tự động nạp phản xạ cơ miệng tự nhiên.
                    </p>
                  </div>
                </div>
              )}

              {speakingModalTab === 'vocab' && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <p className="text-slate-500 m-0">
                    Bản đồ thay đổi cụm từ vựng nâng cấp (Lexical Upgrades) giúp tăng điểm **Lexical Resource**:
                  </p>
                  <div className="flex flex-col gap-3.5 mt-1">
                    {activeSpeakingSample.lexicalUpgrades.map((item: any, idx: number) => (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
                        <div className="grid grid-cols-2 border-b">
                          <div className="p-3.5 bg-red-50/20 border-r border-slate-200/80 flex flex-col gap-0.5 text-left">
                            <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Từ vựng thông thường (Basic)</span>
                            <span className="text-xs text-slate-700 italic mt-1 font-mono">"{item.basic}"</span>
                          </div>
                          <div className="p-3.5 bg-green-50/20 flex flex-col gap-0.5 text-left">
                            <span className="text-[9px] text-green-600 font-bold uppercase tracking-wider">Từ vựng nâng band (Upgrade)</span>
                            <span className={`text-xs font-bold mt-1 font-mono ${isCpeCae ? 'text-emerald-800' : 'text-blue-800'}`}>"{item.upgrade}"</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white text-xs leading-normal text-slate-650 border-t border-slate-100 flex items-center gap-1">
                          <strong className="text-slate-750 font-bold">Nghĩa tiếng Việt:</strong>
                          <span className="italic">{item.meaning}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="bg-slate-50 px-6 py-3.5 flex justify-end border-t border-slate-150">
              <button
                onClick={() => setShowSpeakingOutlineModal(false)}
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
