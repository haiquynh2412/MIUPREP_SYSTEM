import { useState } from 'react';
import { t } from '../data/i18n.js';

export default function DetectiveMission({
  missions = [],
  chapterId = '',
  completedMissionIds = [],
  onCompleteMission,
  lang = 'vi',
}) {
  const [expandedHints, setExpandedHints] = useState({});

  const completedSet = new Set(completedMissionIds);

  const chapterMissions = chapterId
    ? missions.filter((m) => m.chapterId === chapterId || m.chapter === chapterId)
    : missions;

  const toggleHint = (missionId) => {
    setExpandedHints((prev) => ({ ...prev, [missionId]: !prev[missionId] }));
  };

  const handleComplete = (missionId) => {
    if (onCompleteMission) {
      onCompleteMission(missionId);
    }
  };

  if (chapterMissions.length === 0) {
    return (
      <div className="card animate-fadeIn" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>🔍</span>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('detective_no_missions', lang)}</div>
      </div>
    );
  }

  const completedCountInChapter = completedMissionIds.filter((id) =>
    chapterMissions.some((m) => (m.id || m.title) === id)
  ).length;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        🕵️ {t('detective_missions_title', lang)}
      </h2>
      {chapterId && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          📘 {chapterId.replace(/_/g, ' ')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {chapterMissions.map((mission) => {
          const id = mission.id || mission.title;
          const isCompleted = completedSet.has(id);
          const hintOpen = expandedHints[id];

          const title = lang === 'en' ? (mission.titleEn || mission.title) : mission.title;
          const description = lang === 'en' ? (mission.descriptionEn || mission.description) : mission.description;
          const task = lang === 'en' ? (mission.taskEn || mission.task) : mission.task;
          const hint = lang === 'en' ? (mission.hintEn || mission.hint) : mission.hint;

          return (
            <div
              key={id}
              className={`detective-mission-card ${isCompleted ? 'mission-completed' : ''}`}
              style={{
                borderLeft: isCompleted ? '4px solid var(--success)' : '4px solid var(--primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Checkbox */}
                <button
                  onClick={() => handleComplete(id)}
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm)',
                    border: isCompleted ? '2px solid var(--success)' : '2px solid var(--border)',
                    background: isCompleted ? 'var(--success)' : 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    transition: 'var(--transition)',
                    marginTop: 2,
                  }}
                >
                  {isCompleted ? '✓' : ''}
                </button>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: isCompleted ? 'var(--text-muted)' : 'var(--text-heading)',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </div>

                  {description && (
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        marginBottom: 10,
                        lineHeight: 1.6,
                      }}
                    >
                      {description}
                    </div>
                  )}

                  {task && (
                    <div
                      className="mission-task"
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--text)',
                        marginBottom: 10,
                      }}
                    >
                      <strong>{t('detective_task_label', lang)}</strong> {task}
                    </div>
                  )}

                  {hint && (
                    <div>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => toggleHint(id)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        {hintOpen ? t('detective_hint_hide', lang) : t('detective_hint_show', lang)}
                      </button>
                      {hintOpen && (
                        <div
                          className="animate-fadeIn"
                          style={{
                            marginTop: 8,
                            padding: '10px 14px',
                            background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            color: 'var(--warning)',
                            fontStyle: 'italic',
                          }}
                        >
                          💡 {hint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: 16,
          padding: '10px 16px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        {t('detective_completed_summary', lang, { completed: completedCountInChapter, total: chapterMissions.length })}
      </div>
    </div>
  );
}
