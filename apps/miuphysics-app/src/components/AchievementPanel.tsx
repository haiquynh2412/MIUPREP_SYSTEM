import { t } from '../data/i18n.js';

const DEFAULT_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Người mới bắt đầu', titleEn: 'Beginner' },
  { level: 2, xpRequired: 100, title: 'Học sinh chăm chỉ', titleEn: 'Hard Worker' },
  { level: 3, xpRequired: 300, title: 'Nhà khám phá', titleEn: 'Explorer' },
  { level: 4, xpRequired: 600, title: 'Nhà Vật lý trẻ', titleEn: 'Young Physicist' },
  { level: 5, xpRequired: 1000, title: 'Thiên tài Vật lý', titleEn: 'Physics Genius' },
];

function getCurrentLevel(xp, levels) {
  let current = levels[0];
  for (const lvl of levels) {
    if (xp >= (lvl.xpRequired !== undefined ? lvl.xpRequired : lvl.minXp)) current = lvl;
    else break;
  }
  return current;
}

function getNextLevel(xp, levels) {
  for (const lvl of levels) {
    if (xp < (lvl.xpRequired !== undefined ? lvl.xpRequired : lvl.minXp)) return lvl;
  }
  return null;
}

export default function AchievementPanel({
  achievements = [],
  unlockedIds = [],
  xp = 0,
  streak = 0,
  levels = DEFAULT_LEVELS,
  lang = 'vi',
}: any) {
  const currentLevel = getCurrentLevel(xp, levels);
  const nextLevel = getNextLevel(xp, levels);
  const currentMinXp = currentLevel.xpRequired !== undefined ? currentLevel.xpRequired : currentLevel.minXp;
  const nextMinXp = nextLevel ? (nextLevel.xpRequired !== undefined ? nextLevel.xpRequired : nextLevel.minXp) : 0;

  const xpInLevel = xp - currentMinXp;
  const xpNeeded = nextLevel ? nextMinXp - currentMinXp : 1;
  const progress = nextLevel ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

  const unlockedSet = new Set(unlockedIds);

  const levelTitle = lang === 'en' ? currentLevel.titleEn || currentLevel.title : currentLevel.title;

  return (
    <div className="achievement-panel animate-fadeIn">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        🏆 {t('achievement_title_text', lang)}
      </h2>

      {/* Level & XP */}
      <div className="card level-display" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
              ⭐ {t('achievement_level_prefix', lang, { level: currentLevel.level, title: levelTitle })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {nextLevel
                ? t('achievement_level_progress', lang, { xpInLevel, xpNeeded, nextLevel: nextLevel.level })
                : t('achievement_max_level', lang)}
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary)' }}>{xp} XP</div>
        </div>
        <div className="xp-bar">
          <div
            className="xp-bar-fill"
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
              borderRadius: 'var(--radius-pill)',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="card streak-counter" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '2rem' }} className={streak > 0 ? 'animate-float' : ''}>
            🔥
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-heading)' }}>
              {t('achievement_streak_title', lang, { count: streak })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('achievement_streak_desc', lang)}</div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      {achievements.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 14,
          }}
        >
          {achievements.map((ach) => {
            const unlocked = unlockedSet.has(ach.id);
            const title = lang === 'en' ? ach.titleEn || ach.title : ach.title;
            const description = lang === 'en' ? ach.descriptionEn || ach.description : ach.description;

            return (
              <div
                key={ach.id}
                className={`achievement-badge ${unlocked ? 'achievement-unlocked' : 'achievement-locked'}`}
                title={description}
              >
                {ach.svgIcon ? (
                  <div className="achievement-badge-svg" dangerouslySetInnerHTML={{ __html: ach.svgIcon }} />
                ) : (
                  <span
                    style={{
                      fontSize: '2rem',
                      display: 'block',
                      marginBottom: 8,
                      filter: unlocked ? 'none' : 'grayscale(1) brightness(0.5)',
                    }}
                  >
                    {ach.icon || '🏅'}
                  </span>
                )}
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: unlocked ? 'var(--text-heading)' : 'var(--text-dim)',
                    marginBottom: 4,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: unlocked ? 'var(--text-muted)' : 'var(--text-dim)',
                  }}
                >
                  {unlocked ? '✅' : '🔒'}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>🎯</span>
          {t('achievement_locked_msg', lang)}
        </div>
      )}
    </div>
  );
}
