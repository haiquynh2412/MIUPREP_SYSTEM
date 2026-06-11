import React, { useState, useEffect, useCallback, useRef } from 'react';
import { hashPassword, verifyPassword } from '@miuprep/db';
import type { StorageAdapter, LocalUser } from '@miuprep/db';
import { getDiagnosticBank } from '@miuprep/content';

interface OnboardingProps {
  db: StorageAdapter;
  onComplete: (userId: string) => void;
}

const __diagBank = getDiagnosticBank('cpe');
const DIAGNOSTIC_QUESTIONS = __diagBank.questions;
const GROUND_TRUTH = __diagBank.groundTruth;

export default function Onboarding({ db, onComplete }: OnboardingProps) {
  const [view, setView] = useState<'login' | 'register' | 'diagnostic' | 'result' | 'review'>('register');
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [targetBand, setTargetBand] = useState(200);
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);

  // Diagnostic Test State
  const [activeTab, setActiveTab] = useState<'reading' | 'listening' | 'grammar'>('reading');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [score, setScore] = useState({ correct: 0, total: 15, percent: 0 });
  const [studyPath, setStudyPath] = useState('');
  const [weakSkills, setWeakSkills] = useState<string[]>([]);

  // TTS Audio Player States [NEW]
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [showTapescript, setShowTapescript] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
      }
    };
  }, []);

  // Restore current user on mount if stored in localStorage
  useEffect(() => {
    const restoreUser = async () => {
      const storedId = localStorage.getItem('current_user_id');
      if (storedId && db) {
        try {
          const users = await db.listLocalUsers();
          const matched = users.find(u => u.id === storedId);
          if (matched) {
            const fullUser = await db.getLocalUser(matched.username);
            if (fullUser) {
              setCurrentUser(fullUser);
            }
          }
        } catch (e) {
          console.error("Failed to restore current user in onboarding:", e);
        }
      }
    };
    void restoreUser();
  }, [db]);

  // Helper to stop speech playback (called from event handlers, not effects)
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setSpeechProgress(0);
    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
    }
  }, []);

  const playDiagnosticAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("Trình duyệt không hỗ trợ Text-to-Speech.");
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      setSpeechProgress(0);
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
      }
      return;
    }

    const text = "Good morning, colleagues. Today I’ll be addressing the fascinating phenomenon of neuroplasticity—the brain’s remarkable ability to reorganize itself by forming new neural connections throughout life. Historically, it was believed that the adult brain was a static structure, unable to generate new neurons. However, groundbreaking research in the late twentieth century shattered this dogma, demonstrating that our cognitive architecture remains highly malleable even in senescence. This has profound implications for stroke rehabilitation and learning.";
    
    window.speechSynthesis.cancel(); // Stop any pending speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    speechUtteranceRef.current = utterance;

    // Find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en-GB')) || voices.find(v => v.lang.startsWith('en'));
    if (enVoice) {
      utterance.voice = enVoice;
    }
    
    utterance.rate = 0.85; // Natural British clear CPE pace
    
    utterance.onstart = () => {
      setIsPlayingSpeech(true);
      setSpeechProgress(0);
      
      // Simulate progress bar filling up over ~30 seconds
      let cur = 0;
      const totalSteps = 300; // 30 seconds * 10 steps per second
      speechIntervalRef.current = setInterval(() => {
        cur++;
        const pct = Math.min((cur / totalSteps) * 100, 100);
        setSpeechProgress(pct);
        if (cur >= totalSteps) {
          if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
        }
      }, 100);
    };

    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setSpeechProgress(0);
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsPlayingSpeech(false);
      setSpeechProgress(0);
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Submit Diagnostic (Declared using useCallback before useEffect calls it)
  const handleSubmitDiagnostic = useCallback(async () => {
    let correctCount = 0;
    const errors: string[] = [];

    // Score Reading
    for (let i = 1; i <= 5; i++) {
      const key = `q${i}`;
      const userAns = (answers[key] || '').trim().toLowerCase();
      if (GROUND_TRUTH[key].includes(userAns)) {
        correctCount++;
      } else {
        errors.push(i <= 3 ? 'gap_fill' : 'true_false_not_given');
      }
    }

    // Score Listening
    for (let i = 6; i <= 10; i++) {
      const key = `q${i}`;
      const userAns = (answers[key] || '').trim().toLowerCase();
      if (GROUND_TRUTH[key].includes(userAns)) {
        correctCount++;
      } else {
        errors.push('listening_gap_fill');
      }
    }

    // Score Grammar
    for (let i = 15; i >= 11; i--) {
      const key = `q${i}`;
      const userAns = (answers[key] || '').trim().toLowerCase();
      if (GROUND_TRUTH[key].includes(userAns)) {
        correctCount++;
      } else {
        errors.push('grammar');
      }
    }

    const percent = Math.round((correctCount / 15) * 100);
    setScore({ correct: correctCount, total: 15, percent });

    // Determine study path
    let path = 'Pre-C2 Breakthrough / Foundation';
    if (percent >= 40 && percent <= 70) {
      path = 'Bridge to C2 (180-200)';
    } else if (percent > 70) {
      path = 'Target C2 Mastery (200-230)';
    }
    setStudyPath(path);

    // Filter unique weak skills
    const uniqueWeak = Array.from(new Set(errors));
    setWeakSkills(uniqueWeak);

    setView('result');
  }, [answers]);

  // Diagnostic timer
  useEffect(() => {
    if (view !== 'diagnostic') return;
    if (timeLeft <= 0) {
      const triggerSubmit = async () => {
        await handleSubmitDiagnostic();
      };
      setTimeout(() => {
        void triggerSubmit();
      }, 0);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [view, timeLeft, handleSubmitDiagnostic]);

  // Auth Handlers
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!username.trim() || !password.trim()) {
      setAuthError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    try {
      // First-run setup: the very first admin on this device registers freely.
      // Once an admin exists, additional admin accounts must be issued by them.
      if (role === 'admin') {
        const existingUsers = await db.listLocalUsers();
        if (existingUsers.some(u => u.role === 'admin')) {
          setAuthError('Thiết bị này đã có Quản trị viên. Vui lòng nhờ Quản trị viên hiện tại cấp tài khoản trong trang quản trị.');
          return;
        }
      }

      const existing = await db.getLocalUser(username.trim());
      if (existing) {
        setAuthError('Tên đăng nhập đã tồn tại trên thiết bị này.');
        return;
      }

      const userId = 'user_' + Math.random().toString(36).substring(2, 9);
      const passwordHash = await hashPassword(password);

      const newUser: LocalUser = {
        id: userId,
        username: username.trim(),
        passwordHash,
        targetBand,
        examDate,
        role,
        status: 'approved',
        createdAt: new Date().toISOString()
      };

      await db.registerLocalUser(newUser);

      // Auto Login
      setCurrentUser(newUser);
      localStorage.setItem('current_user_id', userId);

      if (role === 'admin') {
        setAuthSuccess('Đăng ký tài khoản Quản trị thành công! Đang chuyển sang màn hình quản lý...');
        setTimeout(() => {
          localStorage.setItem('diagnostic_done_' + userId, 'true');
          onComplete(userId);
        }, 1000);
      } else {
        setAuthSuccess('Đăng ký tài khoản thành công! Đang chuyển sang bài thi chẩn đoán...');
        setTimeout(() => {
          setView('diagnostic');
        }, 1000);
      }
    } catch (err) {
      setAuthError('Lỗi kết nối cơ sở dữ liệu: ' + String(err));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!username.trim() || !password.trim()) {
      setAuthError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    try {
      const user = await db.getLocalUser(username.trim());

      if (!user) {
        setAuthError('Tên đăng nhập không chính xác hoặc chưa được tạo.');
        return;
      }

      const verdict = await verifyPassword(password, user.passwordHash);
      if (!verdict.ok) {
        setAuthError('Mật khẩu không khớp. Vui lòng thử lại.');
        return;
      }

      // Transparently upgrade legacy password records to the current hash format
      if (verdict.needsRehash) {
        try {
          await db.registerLocalUser({ ...user, passwordHash: await hashPassword(password) });
        } catch (rehashErr) {
          console.warn('Failed to upgrade legacy password hash:', rehashErr);
        }
      }

      setCurrentUser(user);
      localStorage.setItem('current_user_id', user.id);

      // Check if diagnostic test completed
      const done = localStorage.getItem('diagnostic_done_' + user.id) === 'true' || user.role === 'admin';
      if (done) {
        localStorage.setItem('diagnostic_done_' + user.id, 'true');
        onComplete(user.id);
      } else {
        setView('diagnostic');
      }
    } catch (err) {
      setAuthError('Lỗi kết nối cơ sở dữ liệu: ' + String(err));
    }
  };

  const handleStartLearning = async () => {
    const targetUserId = currentUser?.id || localStorage.getItem('current_user_id') || 'user_guest';
    const targetBandVal = currentUser?.targetBand || 6.5;
    const targetExamDate = currentUser?.examDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

    // Save starting learner profile
    const profile = {
      userId: targetUserId,
      targetBand: targetBandVal,
      examDate: targetExamDate,
      weakSkills: weakSkills,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await db.saveLearnerProfile(profile);
      localStorage.setItem('current_user_id', targetUserId);
      localStorage.setItem('diagnostic_done_' + targetUserId, 'true');
      onComplete(targetUserId);
    } catch (e) {
      console.error('Failed to save profile during onboarding:', e);
      // Fallback bypass
      localStorage.setItem('current_user_id', targetUserId);
      localStorage.setItem('diagnostic_done_' + targetUserId, 'true');
      onComplete(targetUserId);
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Dynamic colorful blur backing spots */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />

      {/* AUTH SCREEN: LOGIN / REGISTER */}
      {(view === 'login' || view === 'register') && (
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/85 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 text-left relative z-10 transition-all duration-300 transform scale-100">
          <div className="flex flex-col gap-1.5 items-center text-center">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
              <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white m-0">CPE C2 Proficiency AI Prep Platform</h2>
            <p className="text-xs text-slate-400 font-medium">Bản đồ học tập cá nhân hóa chuẩn xác tuyệt đối</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => { setView('register'); setAuthError(''); }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all border-0 outline-none cursor-pointer ${
                view === 'register' ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng ký mới
            </button>
            <button
              onClick={() => { setView('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all border-0 outline-none cursor-pointer ${
                view === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Đăng nhập
            </button>
          </div>

          {authError && (
            <div className="bg-red-950/60 border border-red-800/80 rounded-lg p-3 text-xs text-red-300 font-medium leading-relaxed">
              ⚠️ {authError}
            </div>
          )}
          {authSuccess && (
            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-lg p-3 text-xs text-emerald-300 font-medium leading-relaxed">
              ✓ {authSuccess}
            </div>
          )}

          <form onSubmit={view === 'register' ? handleRegister : handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tên đăng nhập</label>
              <input
                type="text"
                placeholder="Ví dụ: haiquynh"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-semibold"
              />
            </div>

            {view === 'register' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Vai trò</label>
                  <div className="flex gap-1 bg-slate-950 border border-slate-850 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all border-0 outline-none cursor-pointer ${
                        role === 'student' ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Học viên (Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all border-0 outline-none cursor-pointer ${
                        role === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Quản trị viên (Admin)
                    </button>
                  </div>
                </div>

                {role === 'admin' && (
                  <p className="text-[10px] text-indigo-300 bg-indigo-950/40 border border-indigo-900 rounded-lg py-2 px-3 leading-relaxed">
                    Tài khoản Quản trị đầu tiên trên thiết bị được tạo trực tiếp tại đây. Khi thiết bị đã có Quản trị viên, tài khoản quản trị mới phải do Quản trị viên hiện tại cấp.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Target CPE Score</label>
                    <select
                      value={targetBand}
                      onChange={e => setTargetBand(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-semibold cursor-pointer"
                    >
                      {[180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230].map(s => (
                        <option key={s} value={s} className="bg-slate-900 text-white font-medium">Score {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Ngày thi dự kiến</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={e => setExamDate(e.target.value)}
                      className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-semibold"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all transform hover:-translate-y-0.5 border-0 cursor-pointer text-sm outline-none"
            >
              {view === 'register' ? 'Đăng ký & Bắt đầu khảo sát' : 'Đăng nhập vào Hệ thống'}
            </button>
          </form>
        </div>
      )}

      {/* DIAGNOSTIC TEST SCREEN: MANDATORY GATE */}
      {view === 'diagnostic' && (
        <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 text-left relative z-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
            <div>
              <span className="text-[10px] bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Onboarding Gate</span>
              <h2 className="text-xl font-black tracking-tight text-white mt-1.5 mb-0">Bài Kiểm Tra Chẩn Đoán Khảo Sát Năng Lực (15 Phút)</h2>
            </div>
            <div className="flex items-center gap-3 bg-red-950/40 border border-red-800/40 px-4 py-2 rounded-xl text-red-300 font-mono text-sm font-bold shadow-inner">
              ⏱️ Hạn giờ: <span className="bg-red-900/50 px-2 py-0.5 rounded text-white animate-pulse">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-emerald-950 rounded-xl p-4 text-xs leading-relaxed text-slate-300">
            💡 <strong className="text-white font-bold">Hướng dẫn quan trọng:</strong> Đây là bài thi rút gọn 100% bắt buộc để AI vẽ nên bản đồ kỹ năng hiện tại của bạn. Kết quả bài test sẽ xác định Lộ trình học (Pre-CPE, Bridge to 6.0, hay Advanced) và tự động kích hoạt Sổ tay lỗi sai SRS cho bạn. Hãy tập trung làm bài hết sức mình!
          </div>

          {/* Subsection Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['reading', 'listening', 'grammar'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { stopSpeech(); setActiveTab(tab); }}
                className={`flex-1 py-3 text-center text-xs font-bold rounded-lg transition-all border-0 outline-none cursor-pointer uppercase tracking-wider ${
                  activeTab === tab ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'reading' ? '📖 1. Reading' : tab === 'listening' ? '🎧 2. Listening' : '📝 3. Grammar & Vocab'}
              </button>
            ))}
          </div>

          {/* Test Panels */}
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl min-h-[300px] flex flex-col gap-6">
            {/* READING TAB */}
            {activeTab === 'reading' && (
              <div className="flex flex-col gap-5">
                <div className="border border-slate-800 bg-slate-900/40 p-5 rounded-xl text-slate-300 text-sm leading-relaxed max-h-60 overflow-y-auto">
                  <h4 className="text-white font-black m-0 mb-2 uppercase tracking-wide text-xs">Passage: Quantum Cryptography Commercialization</h4>
                  Advanced quantum networks present unprecedented cryptographic opportunities. However, the sheer vulnerability of quantum states to environmental decoherence has precluded their widespread commercial application. Researchers must stabilize these states before secure quantum communication can become a viable consumer reality.
                </div>
                
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Questions 1-5: CPE Reading & Use of English Diagnostic</h4>
                  
                  <div className="flex flex-col gap-3">
                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q1. He was determined to ______ his mark on the scientific community. (A. make, B. leave, C. print, D. write)</span>
                      <input
                        type="text"
                        placeholder="Nhập đáp án A, B, C hoặc D"
                        value={answers.q1 || ''}
                        onChange={e => setAnswers({ ...answers, q1: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q2. No sooner had he arrived ______ the storm broke.</span>
                      <input
                        type="text"
                        placeholder="Nhập từ còn thiếu"
                        value={answers.q2 || ''}
                        onChange={e => setAnswers({ ...answers, q2: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q3. The beauty of the island is <strong className="text-white">______</strong> (COMPARE). (Điền dạng từ đúng)</span>
                      <input
                        type="text"
                        placeholder="Nhập từ còn thiếu"
                        value={answers.q3 || ''}
                        onChange={e => setAnswers({ ...answers, q3: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q4. It was a mistake for you to buy that expensive car. (SHOULD) {"→"} You <strong className="text-white">______</strong> that expensive car. (Điền phần viết lại hoàn thành)</span>
                      <input
                        type="text"
                        placeholder="Nhập cụm từ còn thiếu"
                        value={answers.q4 || ''}
                        onChange={e => setAnswers({ ...answers, q4: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q5. What is the primary obstacle to the commercialization of quantum networks? (A. Financial constraints, B. Environmental sensitivity, C. Lack of cryptographic interest, D. Hardware shortage)</span>
                      <input
                        type="text"
                        placeholder="Nhập đáp án A, B, C hoặc D"
                        value={answers.q5 || ''}
                        onChange={e => setAnswers({ ...answers, q5: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LISTENING TAB */}
            {activeTab === 'listening' && (
              <div className="flex flex-col gap-5">
                {/* Keyframe animation for dancing visual bars */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes pulse-bar {
                    0%, 100% { height: 4px; }
                    50% { height: 26px; }
                  }
                ` }} />

                {/* Modern Interactive Audio Player Card */}
                <div className="bg-slate-900/70 border border-slate-800/80 p-6 rounded-2xl flex flex-col gap-5 shadow-inner">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={playDiagnosticAudio}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white border-0 cursor-pointer shadow-lg transition-all transform hover:scale-105 active:scale-95 outline-none ${
                          isPlayingSpeech
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/20'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 shadow-emerald-500/20'
                        }`}
                      >
                        {isPlayingSpeech ? (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      
                      <div className="text-left">
                        <h4 className="text-sm font-black text-white m-0 tracking-wide">
                          {isPlayingSpeech ? 'Đang Phát Âm Thanh Bài Nghe...' : 'Sẵn Sàng Phát Âm Thanh Bài Nghe'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          {isPlayingSpeech ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                              🔴 Đang phát băng nghe (Tốc độ 0.85x)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded-full">
                              🔇 Chế độ ẩn tapescript chuẩn Cambridge
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Simulated visual dancing waveform */}
                    <div className="flex items-end gap-1.5 h-9 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-850">
                      {[12, 24, 18, 32, 14, 28, 22, 16, 26, 12, 20, 28, 14, 22, 18].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isPlayingSpeech ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'
                          }`}
                          style={{
                            height: isPlayingSpeech ? `${h}px` : '4px',
                            animation: isPlayingSpeech ? `pulse-bar 1.2s infinite ease-in-out ${i * 0.08}s` : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Playback progress bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850 relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 transition-all duration-100 ease-out"
                        style={{ width: `${speechProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold px-0.5">
                      <span>0:00</span>
                      <span>{isPlayingSpeech ? `Đang phát (${Math.round(speechProgress)}%)` : 'Nhấn nút Play để phát âm thanh bài nghe'}</span>
                      <span>0:30</span>
                    </div>
                  </div>

                  {/* Cambridge Standard Warning */}
                  <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                    💡 <strong className="text-slate-300">Quy tắc khảo thí:</strong> Trong phòng thi thật, thí sinh tuyệt đối không được đọc tapescript. Để đánh giá chính xác, bạn hãy đeo tai nghe và hoàn thành câu hỏi từ Q6 đến Q10 dựa trên audio nghe được.
                  </div>

                  {/* Pedagogy Toggle Button */}
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => setShowTapescript(!showTapescript)}
                      className={`text-[10px] font-bold py-2 px-3 rounded-lg transition-all border outline-none cursor-pointer flex items-center gap-1.5 ${
                        showTapescript
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{showTapescript ? '👁️ Ẩn Tapescript Hỗ Trợ' : '👁️ Xem Tapescript (Chỉ dùng khi nghe không rõ)'}</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Slide-in Tapescript Excerpt */}
                {showTapescript && (
                  <div className="border border-amber-900/40 bg-amber-950/10 p-5 rounded-2xl text-slate-300 text-sm leading-relaxed max-h-60 overflow-y-auto">
                    <h4 className="text-amber-400 font-black m-0 mb-2 uppercase tracking-wide text-xs flex items-center gap-1">
                      <span>📝</span> Listening Excerpt Transcript (Bản Gỡ Băng Để Học)
                    </h4>
                    "Good morning, colleagues. Today I’ll be addressing the fascinating phenomenon of neuroplasticity—the brain’s remarkable ability to reorganize itself by forming new neural connections throughout life. Historically, it was believed that the adult brain was a static structure, unable to generate new neurons. However, groundbreaking research in the late twentieth century shattered this dogma, demonstrating that our cognitive architecture remains highly malleable even in senescence. This has profound implications for stroke rehabilitation and learning."
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Questions 6-10: C2 Neuroplasticity Lecture Notes (Gap Fill)</h4>
                  
                  <div className="flex flex-col gap-3">
                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q6. Historically, the adult brain was considered to be a <strong className="text-white">______</strong> structure.</span>
                      <input
                        type="text"
                        placeholder="Nhập tính chất cấu trúc"
                        value={answers.q6 || ''}
                        onChange={e => setAnswers({ ...answers, q6: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q7. Neuroplasticity refers to the brain's capacity to form new <strong className="text-white">______</strong> connections.</span>
                      <input
                        type="text"
                        placeholder="Nhập loại kết nối"
                        value={answers.q7 || ''}
                        onChange={e => setAnswers({ ...answers, q7: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q8. Groundbreaking research in the late twentieth century shattered the long-held <strong className="text-white">______</strong>.</span>
                      <input
                        type="text"
                        placeholder="Nhập danh từ"
                        value={answers.q8 || ''}
                        onChange={e => setAnswers({ ...answers, q8: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q9. Our cognitive architecture remains highly malleable even in <strong className="text-white">______</strong> (old age).</span>
                      <input
                        type="text"
                        placeholder="Nhập thuật ngữ y học chỉ tuổi già"
                        value={answers.q9 || ''}
                        onChange={e => setAnswers({ ...answers, q9: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>

                    <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400">Q10. This discovery has profound implications for <strong className="text-white">______</strong> rehabilitation.</span>
                      <input
                        type="text"
                        placeholder="Nhập loại phục hồi chức năng"
                        value={answers.q10 || ''}
                        onChange={e => setAnswers({ ...answers, q10: e.target.value })}
                        className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-white outline-none font-semibold w-full max-w-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GRAMMAR TAB */}
            {activeTab === 'grammar' && (
              <div className="flex flex-col gap-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Questions 11-15: Multiple Choice Grammar Core</h4>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">Q11. "She <strong className="text-emerald-400">______</strong> to school every day."</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {['A. go', 'B. goes', 'C. going', 'D. gone'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          (answers.q11 || '').toUpperCase() === opt[0]
                            ? 'bg-emerald-900/60 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}>
                          <input
                            type="radio"
                            name="q11"
                            checked={(answers.q11 || '').toUpperCase() === opt[0]}
                            onChange={() => setAnswers({ ...answers, q11: opt[0] })}
                            className="hidden"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">Q12. "They <strong className="text-emerald-400">______</strong> TV when the phone rang."</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {['A. watched', 'B. are watching', 'C. were watching', 'D. watch'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          (answers.q12 || '').toUpperCase() === opt[0]
                            ? 'bg-emerald-900/60 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}>
                          <input
                            type="radio"
                            name="q12"
                            checked={(answers.q12 || '').toUpperCase() === opt[0]}
                            onChange={() => setAnswers({ ...answers, q12: opt[0] })}
                            className="hidden"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">Q13. "If it rains tomorrow, we <strong className="text-emerald-400">______</strong> the picnic."</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {['A. cancel', 'B. will cancel', 'C. would cancel', 'D. cancelled'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          (answers.q13 || '').toUpperCase() === opt[0]
                            ? 'bg-emerald-900/60 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}>
                          <input
                            type="radio"
                            name="q13"
                            checked={(answers.q13 || '').toUpperCase() === opt[0]}
                            onChange={() => setAnswers({ ...answers, q13: opt[0] })}
                            className="hidden"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">Q14. "This is <strong className="text-emerald-400">______</strong> interesting book I have ever read."</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {['A. the most', 'B. most', 'C. more', 'D. as'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          (answers.q14 || '').toUpperCase() === opt[0]
                            ? 'bg-emerald-900/60 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}>
                          <input
                            type="radio"
                            name="q14"
                            checked={(answers.q14 || '').toUpperCase() === opt[0]}
                            onChange={() => setAnswers({ ...answers, q14: opt[0] })}
                            className="hidden"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-lg flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">Q15. "He is very good <strong className="text-emerald-400">______</strong> playing the guitar."</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {['A. at', 'B. in', 'C. on', 'D. for'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          (answers.q15 || '').toUpperCase() === opt[0]
                            ? 'bg-emerald-900/60 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}>
                          <input
                            type="radio"
                            name="q15"
                            checked={(answers.q15 || '').toUpperCase() === opt[0]}
                            onChange={() => setAnswers({ ...answers, q15: opt[0] })}
                            className="hidden"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2 border-t border-slate-800 pt-5">
            <button
              onClick={handleSubmitDiagnostic}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/10 transition-all transform hover:-translate-y-0.5 border-0 cursor-pointer text-sm outline-none"
            >
              Nộp bài đánh giá năng lực
            </button>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC RESULT SCREEN */}
      {view === 'result' && (
        <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 text-left relative z-10 transition-all duration-300 transform scale-100">
          <div className="flex flex-col gap-1.5 items-center text-center">
            <span className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-full flex items-center justify-center text-3xl font-bold animate-bounce shadow shadow-emerald-500/10 mb-2">🎉</span>
            <h2 className="text-2xl font-black tracking-tight text-white m-0">Đã Hoàn Thành Khảo Sát Onboarding!</h2>
            <p className="text-xs text-slate-400 font-medium">Báo cáo năng lực học thuật & Đề xuất lộ trình của bạn</p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4 border border-slate-800 bg-slate-950/60 p-5 rounded-2xl">
            <div className="flex flex-col items-center justify-center border-r border-slate-800 p-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Điểm số</span>
              <span className="text-xl font-black text-emerald-400 mt-1">{score.correct} / {score.total}</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-slate-800 p-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Độ chính xác</span>
              <span className="text-xl font-black text-emerald-400 mt-1">{score.percent}%</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Target Band gốc</span>
              <span className="text-xl font-black text-amber-400 mt-1">{(currentUser?.targetBand || 6.5).toFixed(1)}</span>
            </div>
          </div>

          {/* Pedagogy Suggestion */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-5 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider m-0 flex items-center gap-1.5">
              <span>🎯</span> Đề xuất phân lớp lộ trình của AI
            </h3>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="text-base font-black px-4 py-1.5 rounded-lg bg-emerald-600 text-white shadow shadow-emerald-600/20 font-mono">
                {studyPath}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2 m-0">
              {studyPath.includes('Pre-CPE') && 'Hệ thống đánh giá kỹ năng ngữ pháp và nghe/đọc của bạn còn các lỗ hổng nền tảng. Bạn nên bắt đầu tại lớp "Pre-CPE Foundation" để củng cố lại từ vựng học thuật cơ bản, cấu trúc chia thì, và mạo từ trước khi làm các đề thi dài.'}
              {studyPath.includes('Bridge') && 'Kỹ năng nền tảng của bạn ở mức trung bình ổn. AI đề xuất lộ trình "Bridge to 6.0" để tập trung rèn luyện các mẹo làm bài Reading Scanning/Synonym và cấu trúc điền từ ngắn của Section 1/2 Listening.'}
              {studyPath.includes('Advanced') && 'Xin chúc mừng! Bạn có gốc tiếng Anh cực kỳ vững vàng. AI khuyến nghị bạn vào thẳng lộ trình "Advanced 7.5+" để tối ưu hóa thời gian thi đấu thực chiến, nâng cao band Writing qua các cấu trúc từ vựng hiếm và cải thiện Pronunciation chuyên sâu.'}
            </p>
          </div>

          {/* Weak Skills identified */}
          {weakSkills.length > 0 && (
            <div className="flex flex-col gap-2 text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Các mảng kỹ năng cần chú ý củng cố ngay:</span>
              <div className="flex gap-2 flex-wrap mt-1">
                {weakSkills.map(skill => (
                  <span key={skill} className="bg-red-950/50 border border-red-800/40 text-red-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    ⚠️ {skill.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              onClick={() => setView('review')}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-3 rounded-lg border border-slate-700 transition-all cursor-pointer text-xs outline-none text-center"
            >
              🔍 Xem Lại Đáp Án & Giải Thích
            </button>
            <button
              onClick={handleStartLearning}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-505 hover:to-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all border-0 cursor-pointer text-xs outline-none text-center"
            >
              Nhận Lộ Trình & Bắt Đầu Học Ngay
            </button>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC REVIEW SCREEN [NEW] */}
      {view === 'review' && (
        <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 text-left relative z-10 max-h-[90vh] overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Educational Audit Panel</span>
              <h2 className="text-xl font-black tracking-tight text-white mt-1.5 mb-0">Xem Lại Đáp Án & Giải Thích Chi Tiết</h2>
            </div>
            <button
              onClick={() => setView('result')}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs py-2 px-4 rounded-xl border border-slate-700 cursor-pointer outline-none"
            >
              ← Quay Lại Bảng Điểm
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-350 leading-relaxed">
            🔍 Hãy đối chiếu câu trả lời của bạn với đáp án chính xác của động cơ khảo thí Cambridge. Đọc kỹ phần <strong className="text-emerald-400">giải thích sư phạm</strong> để hiểu cặn kẽ nguyên nhân làm sai và rút kinh nghiệm sâu sắc.
          </div>

          {/* Question List */}
          <div className="flex flex-col gap-5">
            {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
              const userRaw = (answers[q.id] || '').trim();
              const userAns = userRaw.toLowerCase();
              const isCorrect = GROUND_TRUTH[q.id].includes(userAns);
              
              return (
                <div key={q.id} className="bg-slate-950 border border-slate-850 rounded-xl p-5 shadow-inner flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider m-0 max-w-md">
                      Câu {idx + 1} ({q.skill.toUpperCase()}): {q.questionText}
                    </h4>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                      isCorrect 
                        ? 'bg-green-950/60 border border-green-800/40 text-green-300' 
                        : 'bg-red-950/60 border border-red-800/40 text-red-300'
                    }`}>
                      {isCorrect ? '✓ Chính Xác' : '✗ Chưa Chính Xác'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 border-t border-slate-900 pt-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Câu trả lời của bạn:</span>
                      <span className={`font-mono text-xs font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {userRaw || '(Chưa trả lời)'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Đáp án chính xác:</span>
                      <span className="font-mono text-xs font-bold text-emerald-300">
                        {GROUND_TRUTH[q.id].join(' / ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-lg text-xs leading-relaxed text-slate-350 mt-2">
                    <strong className="text-white font-bold block mb-1">💡 Giải thích chi tiết:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-800 pt-6 mt-2">
            <button
              onClick={() => setView('result')}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-3.5 px-6 rounded-xl border border-slate-700 transition-all cursor-pointer text-xs outline-none text-center"
            >
              ← Quay Lại Bảng Điểm
            </button>
            <button
              onClick={handleStartLearning}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-500/10 transition-all border-0 cursor-pointer text-xs outline-none text-center uppercase tracking-wider"
            >
              Nhận Lộ Trình & Học Ngay ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
