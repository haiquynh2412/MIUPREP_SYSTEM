import { useState, useEffect } from 'react';
import { t } from '../data/i18n.js';

const MODES = [
  { key: 'speed', icon: '⚡', count: 5, time: 30 },
  { key: 'daily', icon: '📅', count: 3, time: 0 },
  { key: 'boss', icon: '👹', count: 1, time: 60 },
];

function shuffleWithSeed(arr, seed) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const x = Math.sin(seed + i) * 10000;
    const j = Math.floor((x - Math.floor(x)) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRating(score, total, lang) {
  const pct = total > 0 ? (score / total) * 100 : 0;
  if (pct === 100) return { emoji: '🌟', label: t('challenge_rating_perfect', lang), color: 'var(--primary)' };
  if (pct >= 80) return { emoji: '🎉', label: t('challenge_rating_excellent', lang), color: 'var(--success)' };
  if (pct >= 60) return { emoji: '👍', label: t('challenge_rating_good', lang), color: 'var(--accent-cyan)' };
  if (pct >= 40) return { emoji: '💪', label: t('challenge_rating_try', lang), color: 'var(--warning)' };
  return { emoji: '📚', label: t('challenge_rating_review', lang), color: 'var(--error)' };
}

export default function QuickChallenge({ questions = [], onComplete, renderMath, lang = 'vi' }: any) {
  const [mode, setMode] = useState<any>(null);
  const [challengeQuestions, setChallengeQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState('select'); // 'select' | 'playing' | 'result'
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing' || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timer]);

  const safeRender = (text) => {
    if (renderMath) return renderMath(String(text || ''));
    return String(text || '');
  };

  const startChallenge = (modeKey) => {
    const m = MODES.find((x) => x.key === modeKey);
    if (!m || questions.length === 0) return;

    setMode(m);

    let pool = [...questions];
    if (modeKey === 'boss') {
      pool = questions.filter((q) => q.difficulty === 'hard');
      if (pool.length === 0) pool = [...questions];
    }

    const seed = modeKey === 'daily' ? Math.floor(Date.now() / 86400000) : Date.now();
    const shuffled = shuffleWithSeed(pool, seed).slice(0, m.count);

    setChallengeQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTimer(m.time);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setPhase('playing');
  };

  const handleAnswer = (key) => {
    if (showFeedback) return;
    setSelectedAnswer(key);
    setShowFeedback(true);

    const q = challengeQuestions[currentIndex];
    const isCorrect = String(q.correct_answer).toLowerCase() === String(key).toLowerCase();
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentIndex + 1 >= challengeQuestions.length) {
        setPhase('result');
        if (onComplete) {
          onComplete({
            mode: mode.key,
            score: isCorrect ? score + 1 : score,
            total: challengeQuestions.length,
          });
        }
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 800);
  };

  const resetChallenge = () => {
    setPhase('select');
    setMode(null);
    setChallengeQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setTimer(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  // Mode Selection
  if (phase === 'select') {
    return (
      <div className="challenge-container animate-fadeIn">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          ⚡ {t('challenge_title_text', lang)}
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          {t('challenge_subtitle_text', lang)}
        </div>

        <div className="challenge-mode-select" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MODES.map((m) => {
            const label = t('challenge_mode_' + m.key, lang);
            const desc = t('challenge_desc_' + m.key, lang);
            return (
              <button
                key={m.key}
                className="card"
                onClick={() => startChallenge(m.key)}
                disabled={questions.length === 0}
                style={{
                  textAlign: 'left',
                  cursor: questions.length > 0 ? 'pointer' : 'not-allowed',
                  border: '1px solid var(--border)',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '2rem' }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-heading)' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            {t('challenge_no_questions', lang)}
          </div>
        )}
      </div>
    );
  }

  // Playing
  if (phase === 'playing') {
    const q = challengeQuestions[currentIndex];
    if (!q) return null;

    const timerPct = mode.time > 0 ? (timer / mode.time) * 100 : 100;
    const timerColor = timerPct > 50 ? 'var(--success)' : timerPct > 20 ? 'var(--warning)' : 'var(--error)';
    const modeLabel = t('challenge_mode_' + mode.key, lang);

    return (
      <div className="challenge-container animate-fadeIn">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.3rem' }}>{mode.icon}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{modeLabel}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {currentIndex + 1} / {challengeQuestions.length}
          </div>
        </div>

        {/* Timer */}
        {mode.time > 0 && (
          <div className="challenge-timer" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {t('challenge_timer_label', lang)}
              </span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: timerColor }}>{timer}s</span>
            </div>
            <div
              style={{
                height: 6,
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-pill)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${timerPct}%`,
                  height: '100%',
                  background: timerColor,
                  borderRadius: 'var(--radius-pill)',
                  transition: 'width 1s linear, background 0.3s',
                }}
              />
            </div>
          </div>
        )}

        {/* Question */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div
            className="question-text"
            dangerouslySetInnerHTML={{ __html: safeRender(q.question_text || '') }}
            style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: 16 }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(q.options || []).map((opt) => {
              const key = typeof opt === 'string' ? opt : opt.key;
              const content = typeof opt === 'string' ? opt : opt.content;
              const isCorrectAnswer = String(q.correct_answer).toLowerCase() === String(key).toLowerCase();
              const isWrongSelected = showFeedback && selectedAnswer === key && !isCorrectAnswer;

              let btnStyle = {};
              if (showFeedback && isCorrectAnswer) {
                btnStyle = { borderColor: 'var(--success)', background: 'rgba(16,185,129,0.15)' };
              } else if (isWrongSelected) {
                btnStyle = { borderColor: 'var(--error)', background: 'rgba(239,68,68,0.15)' };
              } else if (selectedAnswer === key) {
                btnStyle = { borderColor: 'var(--primary)' };
              }

              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  disabled={showFeedback}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text)',
                    cursor: showFeedback ? 'default' : 'pointer',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'var(--transition-fast)',
                    ...btnStyle,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: 'var(--primary)',
                      minWidth: 24,
                    }}
                  >
                    {key}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: safeRender(content || key) }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Result
  if (phase === 'result') {
    const total = challengeQuestions.length;
    const rating = getRating(score, total, lang);
    const modeLabel = t('challenge_mode_' + mode.key, lang);

    return (
      <div className="challenge-container animate-fadeIn">
        <div className="challenge-score card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '4rem', marginBottom: 12 }}>{rating.emoji}</div>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-heading)', marginBottom: 6 }}>
            {rating.label}
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: rating.color,
              marginBottom: 8,
            }}
          >
            {score} / {total}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
            {mode.icon} {modeLabel}
            {mode.time > 0 && ` • ${t('challenge_time_used', lang, { seconds: mode.time - timer })}`}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => startChallenge(mode.key)}>
              {t('challenge_retry_btn', lang)}
            </button>
            <button className="btn btn-secondary" onClick={resetChallenge}>
              ↩️ {t('challenge_other_mode_btn', lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
