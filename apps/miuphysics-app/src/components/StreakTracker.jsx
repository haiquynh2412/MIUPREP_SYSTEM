export default function StreakTracker({ streak = 0, bestStreak = 0, lang = 'vi' }) {
  const displayBest = bestStreak > streak;

  return (
    <div
      className="streak-widget"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        background: streak > 0 ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-surface)',
        borderRadius: 'var(--radius-pill)',
        border: streak > 0 ? '1px solid var(--primary)' : '1px solid var(--border)',
        transition: 'var(--transition)',
      }}
      title={lang === 'en' ? `Streak: ${streak} | Record: ${bestStreak}` : `Chuỗi ngày: ${streak} | Kỷ lục: ${bestStreak}`}
    >
      <span
        style={{
          fontSize: '1.1rem',
          display: 'inline-block',
        }}
        className={streak > 0 ? 'animate-float' : ''}
      >
        🔥
      </span>

      <span
        style={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: streak > 0 ? 'var(--primary-light)' : 'var(--text-dim)',
        }}
      >
        {streak}
      </span>

      {displayBest && (
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            marginLeft: 2,
          }}
        >
          (🏆 {bestStreak})
        </span>
      )}
    </div>
  );
}
