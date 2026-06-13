import { useState } from 'react';
import { t } from '../data/i18n.js';

export default function HomeLabCard({ experiments = [], onMarkComplete, completedIds = [], lang = 'vi' }: any) {
  const [showAnswers, setShowAnswers] = useState({});

  const completedSet = new Set(completedIds);

  const toggleAnswer = (expId) => {
    setShowAnswers((prev) => ({ ...prev, [expId]: !prev[expId] }));
  };

  if (experiments.length === 0) {
    return (
      <div className="card animate-fadeIn" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>🧪</span>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('homelab_no_experiments', lang)}</div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        🏠 {t('homelab_title', lang)}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {experiments.map((exp) => {
          const id = exp.id || exp.title;
          const isCompleted = completedSet.has(id);
          const answerVisible = showAnswers[id];

          const title = lang === 'en' ? exp.titleEn || exp.title : exp.title;
          const subtitle = lang === 'en' ? exp.subtitleEn || exp.subtitle : exp.subtitle;
          const materials = lang === 'en' ? exp.materialsEn || exp.materials : exp.materials;
          const steps = lang === 'en' ? exp.stepsEn || exp.steps : exp.steps;
          const safety = lang === 'en' ? exp.safetyEn || exp.safety : exp.safety;
          const question = lang === 'en' ? exp.questionEn || exp.question : exp.question;
          const answer = lang === 'en' ? exp.answerEn || exp.answer : exp.answer;

          return (
            <div
              key={id}
              className={`home-lab-card card ${isCompleted ? 'lab-completed' : ''}`}
              style={{
                borderColor: isCompleted ? 'var(--success)' : undefined,
                opacity: isCompleted ? 0.85 : 1,
              }}
            >
              {/* Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: '1.5rem' }}>🧪</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-heading)' }}>{title}</div>
                  {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</div>}
                </div>
                {isCompleted && (
                  <span style={{ marginLeft: 'auto', color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>
                    {t('homelab_completed_badge', lang)}
                  </span>
                )}
              </div>

              {/* Materials */}
              {materials && materials.length > 0 && (
                <div className="lab-materials" style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)', marginBottom: 6 }}>
                    {t('homelab_materials_label', lang)}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {materials.map((mat, i) => (
                      <li key={i} style={{ marginBottom: 3 }}>
                        {mat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              {steps && steps.length > 0 && (
                <div className="lab-steps" style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)', marginBottom: 6 }}>
                    {t('homelab_steps_label', lang)}
                  </div>
                  <ol
                    style={{ margin: 0, paddingLeft: 20, color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.8 }}
                  >
                    {steps.map((step, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Safety note */}
              {safety && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--warning)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: 'var(--warning)',
                    marginBottom: 14,
                  }}
                >
                  <strong>{t('homelab_safety_label', lang)}</strong> {safety}
                </div>
              )}

              {/* Question & Answer */}
              {question && (
                <div className="lab-question" style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      color: 'var(--text)',
                      marginBottom: 8,
                    }}
                  >
                    <strong>{t('homelab_question_label', lang)}</strong> {question}
                  </div>
                  {answer && (
                    <div>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => toggleAnswer(id)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        {answerVisible ? t('homelab_answer_hide', lang) : t('homelab_answer_show', lang)}
                      </button>
                      {answerVisible && (
                        <div
                          className="animate-fadeIn"
                          style={{
                            marginTop: 8,
                            padding: '10px 14px',
                            background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            color: 'var(--accent-cyan)',
                          }}
                        >
                          💡 {answer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Complete button */}
              {!isCompleted && onMarkComplete && (
                <button
                  className="btn btn-primary"
                  onClick={() => onMarkComplete(id)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {t('homelab_mark_completed', lang)}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
