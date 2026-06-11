import { t } from '../data/i18n.js';

const FALLBACK_FACTS = [
  { fact: 'Ánh sáng mất khoảng 8 phút 20 giây để đi từ Mặt Trời đến Trái Đất. ☀️', factEn: 'Light takes about 8 minutes 20 seconds to travel from the Sun to Earth. ☀️', emoji: '☀️' },
  { fact: 'Sấm sét nóng gấp 5 lần bề mặt Mặt Trời — khoảng 30.000°C! ⚡', factEn: 'Lightning is 5 times hotter than the surface of the Sun — about 30,000°C! ⚡', emoji: '⚡' },
  { fact: 'Trong không gian, không ai có thể nghe thấy bạn la hét — vì không có môi trường truyền âm! 🚀', factEn: 'In space, no one can hear you scream — because there is no medium for sound! 🚀', emoji: '🚀' },
];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function DailyFact({ facts = [], selectedGrade = null, lang = 'vi' }) {
  const daySeed = Math.floor(Date.now() / 86400000);

  const filteredFacts = selectedGrade
    ? facts.filter((f) => !f.grade || f.grade === selectedGrade)
    : facts;

  const pool = filteredFacts.length > 0 ? filteredFacts : FALLBACK_FACTS;
  const index = Math.floor(seededRandom(daySeed) * pool.length);
  const fact = pool[index];

  const emoji = fact.emoji || '🔬';
  const text = lang === 'en' ? (fact.factEn || fact.fact || fact.text || fact) : (fact.fact || fact.text || fact);

  return (
    <div className="daily-fact-card animate-fadeIn">
      <div
        className="daily-fact-gradient"
        style={{
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary), var(--accent-cyan))',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background emoji */}
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            fontSize: '5rem',
            opacity: 0.1,
            transform: 'rotate(15deg)',
            pointerEvents: 'none',
          }}
        >
          {emoji}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '2rem', flexShrink: 0 }}>{emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 4 }}>
              {t('daily_fact_title', lang)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
              {t('daily_fact_sub', lang)}
            </div>
            <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#fff' }}>
              {typeof text === 'string' ? text : JSON.stringify(text)}
            </div>
          </div>
        </div>

        {selectedGrade && (
          <div
            style={{
              marginTop: 14,
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'right',
            }}
          >
            {lang === 'en' ? `Grade ${selectedGrade}` : `Lớp ${selectedGrade}`}
          </div>
        )}
      </div>
    </div>
  );
}
