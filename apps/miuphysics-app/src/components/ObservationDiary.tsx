import { useState } from 'react';
import { t } from '../data/i18n.js';

const SUGGESTED_TAGS_MAP = {
  vi: ['quang học', 'cơ học', 'nhiệt học', 'điện học', 'âm học', 'từ học', 'lực', 'năng lượng'],
  en: ['optics', 'mechanics', 'thermodynamics', 'electricity', 'acoustics', 'magnetism', 'force', 'energy'],
};

export default function ObservationDiary({
  entries = [],
  onAddEntry,
  onDeleteEntry,
  chapters = [],
  lang = 'vi',
}: any) {
  const [text, setText] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  const suggestedTags = SUGGESTED_TAGS_MAP[lang] || SUGGESTED_TAGS_MAP.vi;

  const handleAddTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      chapter: selectedChapter,
      text: text.trim(),
      tags: [...tags],
    };
    if (onAddEntry) onAddEntry(entry);
    setText('');
    setSelectedChapter('');
    setTags([]);
    setShowForm(false);
  };

  const formatDate = (isoDate) => {
    try {
      return new Date(isoDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="diary-container animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
          📓 {t('diary_title_text', lang)}
        </h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? t('diary_btn_close', lang) : t('diary_btn_new', lang)}
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="diary-form card animate-slideUp" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 14, color: 'var(--text-heading)' }}>
            {t('diary_new_title', lang)}
          </h3>

          {/* Chapter select */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              {t('diary_related_chapter', lang)}
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                fontSize: '0.9rem',
              }}
            >
              <option value="">{t('diary_select_chapter', lang)}</option>
              {chapters.map((ch) => (
                <option key={ch.id || ch} value={ch.id || ch}>
                  {lang === 'en' ? ch.name : (ch.nameVn || ch.name || ch.id || ch)}
                </option>
              ))}
            </select>
          </div>

          {/* Observation text */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              {t('diary_observation_label', lang)}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('diary_observation_placeholder', lang)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              {t('diary_tags_label', lang)}
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="diary-tag"
                  style={{
                    padding: '4px 10px',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {tag}
                  <span onClick={() => removeTag(tag)} style={{ cursor: 'pointer', fontWeight: 700 }}>×</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddTag(tagInput); }
                }}
                placeholder={t('diary_tag_placeholder', lang)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                }}
              />
              <button className="btn btn-sm btn-secondary" onClick={() => handleAddTag(tagInput)}>
                {t('diary_add_tag', lang)}
              </button>
            </div>
            {/* Suggested tags */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
              {suggestedTags.filter((t) => !tags.includes(t)).slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  style={{
                    padding: '2px 8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--text-dim)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('diary_save_btn', lang)}
          </button>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...entries]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((entry) => {
              const chObj = chapters.find((c) => c.id === entry.chapter);
              const chName = chObj ? (lang === 'en' ? chObj.name : chObj.nameVn) : String(entry.chapter || '').replace(/_/g, ' ');

              return (
                <div key={entry.id} className="diary-entry card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          📅 {formatDate(entry.date)}
                        </span>
                        {entry.chapter && (
                          <span
                            className="badge badge-chapter"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {chName}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--text)',
                          lineHeight: 1.7,
                          marginBottom: 8,
                        }}
                      >
                        {entry.text}
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="diary-tag"
                              style={{
                                padding: '2px 8px',
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-muted)',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '0.7rem',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {onDeleteEntry && (
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: 4,
                          flexShrink: 0,
                        }}
                        title={lang === 'en' ? 'Delete' : 'Xóa'}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>📓</span>
          {t('diary_empty_msg', lang)}
        </div>
      )}
    </div>
  );
}
