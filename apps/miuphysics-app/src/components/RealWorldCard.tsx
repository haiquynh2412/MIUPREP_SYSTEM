import { useState } from 'react';
import { t } from '../data/i18n.js';

const INSPIRING_MESSAGES_MAP = {
  vi: [
    'Hãy quan sát thế giới xung quanh — Vật lý ở khắp nơi! 🔭',
    'Em có thể thấy điều này trong cuộc sống hàng ngày! 🌟',
    'Thử để ý hiện tượng này lần tới nhé! 👀',
    'Vật lý không chỉ trong sách — hãy khám phá ngoài đời! 🚀',
    'Mỗi ngày là một cơ hội để khám phá khoa học! 🔬',
  ],
  en: [
    'Observe the world around you — Physics is everywhere! 🔭',
    'You can see this in your everyday life! 🌟',
    'Try to notice this phenomenon next time! 👀',
    'Physics is not just in books — explore it in real life! 🚀',
    'Every day is an opportunity to discover science! 🔬',
  ],
};

export default function RealWorldCard({ connection, chapter = '', renderMath, lang = 'vi' }: any) {
  const [expanded, setExpanded] = useState(true);

  if (!connection) return null;

  const safeRender = (text) => {
    if (renderMath) return renderMath(String(text || ''));
    return String(text || '');
  };

  const messages = INSPIRING_MESSAGES_MAP[lang] || INSPIRING_MESSAGES_MAP.vi;
  const messageIndex = chapter
    ? chapter.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % messages.length
    : 0;
  const inspiringMsg = messages[messageIndex];

  return (
    <div className="real-world-card animate-slideUp">
      <div
        className="real-world-card-header"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: expanded ? 16 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>🌍</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-heading)' }}>
              {t('real_world_title', lang)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {lang === 'en' ? 'Real-world Connection' : 'Liên hệ thực tế'}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: '1rem',
            transition: 'transform 0.3s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </div>

      {expanded && (
        <div className="animate-fadeIn">
          <div
            className="real-world-card-content"
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--text)',
              marginBottom: 16,
            }}
            dangerouslySetInnerHTML={{ __html: safeRender(connection) }}
          />

          {chapter && (
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                marginBottom: 12,
              }}
            >
              📘 {chapter.replace(/_/g, ' ')}
            </div>
          )}

          <div
            style={{
              padding: '10px 14px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              fontStyle: 'italic',
            }}
          >
            {inspiringMsg}
          </div>
        </div>
      )}
    </div>
  );
}
