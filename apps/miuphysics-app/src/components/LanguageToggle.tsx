import type { CSSProperties } from 'react';
// ─────────────────────────────────────────────────────────
// MiuPhysics — Language Toggle Component
// Compact VI / EN pill switch
// ─────────────────────────────────────────────────────────

export default function LanguageToggle({ lang = 'vi', onToggle }: any) {
  return (
    <button
      className="language-toggle"
      onClick={() => onToggle(lang === 'vi' ? 'en' : 'vi')}
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      style={styles.toggle}
    >
      <span
        style={{
          ...styles.option,
          ...(lang === 'vi' ? styles.active : styles.inactive),
        }}
      >
        VI
      </span>
      <span style={styles.separator}>/</span>
      <span
        style={{
          ...styles.option,
          ...(lang === 'en' ? styles.active : styles.inactive),
        }}
      >
        EN
      </span>
    </button>
  );
}

// Inline styles that honour the dark-violet theme via CSS variable fallbacks
const styles: Record<string, CSSProperties> = {
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(139, 92, 246, 0.08)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    lineHeight: 1,
    transition: 'border-color 0.2s, background 0.2s',
    color: 'inherit',
    fontFamily: 'inherit',
  },
  option: {
    padding: '2px 4px',
    borderRadius: '4px',
    transition: 'color 0.2s, background 0.2s',
  },
  active: {
    color: '#F5F3FF',
    background: 'rgba(139, 92, 246, 0.6)',
  },
  inactive: {
    color: 'rgba(196, 181, 253, 0.5)',
    background: 'transparent',
  },
  separator: {
    color: 'rgba(196, 181, 253, 0.3)',
    fontSize: '11px',
    userSelect: 'none',
  },
};
