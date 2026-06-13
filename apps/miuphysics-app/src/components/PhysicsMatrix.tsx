import type { CSSProperties } from 'react';
import { t } from '../data/i18n.js';

export default function PhysicsMatrix({
  zones = [],
  chapters = [],
  questions = [],
  learningState = {},
  onSelectChapter,
  selectedGrade = null,
  lang = 'vi',
}: any) {
  // Calculate completion stats for a specific chapter
  const getChapterStats = (chapterId) => {
    const chapterQuestions = (questions || []).filter((q) => q.chapter === chapterId);
    if (!chapterQuestions.length) return { total: 0, correct: 0, progress: 0 };

    const attempts = learningState?.attempts || [];
    const correctIds = new Set(
      attempts.filter((a) => a.payload?.chapter === chapterId && a.correct).map((a) => a.payload?.sourceId),
    );

    return {
      total: chapterQuestions.length,
      correct: correctIds.size,
      progress: chapterQuestions.length > 0 ? (correctIds.size / chapterQuestions.length) * 100 : 0,
    };
  };

  const grades = [6, 7, 8, 9];

  return (
    <div className="matrix-outer-container animate-fadeIn">
      <div className="matrix-scroll-wrapper">
        <div className="physics-matrix-grid">
          {/* Header Row: Corner + Grades */}
          <div className="matrix-header-cell matrix-corner-cell">
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              {lang === 'en' ? 'THEME \\ GRADE' : 'CHUYÊN ĐỀ \\ LỚP'}
            </span>
          </div>
          {grades.map((g) => (
            <div
              key={g}
              className={`matrix-header-cell column-header-grade-${g} ${
                selectedGrade === g ? 'highlighted-header' : selectedGrade ? 'dimmed-header' : ''
              }`}
            >
              <span className="grade-badge">Lớp {g}</span>
            </div>
          ))}

          {/* Matrix Rows (One row per Zone/Theme) */}
          {zones.map((zone) => {
            return (
              <div key={zone.id} className="matrix-row-contents">
                {/* Row Header Cell (Zone Theme) */}
                <div
                  className="matrix-row-header-cell"
                  style={{
                    borderLeft: `5px solid ${zone.color}`,
                    background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${zone.color}05)`,
                  }}
                >
                  <div className="zone-row-header-title">
                    <span className="zone-row-emoji">{zone.icon}</span>
                    <div>
                      <h4 className="zone-row-name">{lang === 'en' ? zone.nameEn : zone.name}</h4>
                      <span className="zone-row-sub">{lang === 'en' ? zone.name : zone.nameEn}</span>
                    </div>
                  </div>
                </div>

                {/* Chapters by Grade columns */}
                {grades.map((g) => {
                  // Filter chapters in this zone that belong to this grade
                  const cellChapters = chapters.filter((ch) => zone.chapters.includes(ch.id) && ch.grade === g);
                  const isHighlighted = selectedGrade === g;
                  const isDimmed = selectedGrade && selectedGrade !== g;

                  return (
                    <div
                      key={`${zone.id}-grade-${g}`}
                      className={`matrix-cell cell-grade-${g} ${
                        isHighlighted ? 'highlighted-cell' : isDimmed ? 'dimmed-cell' : ''
                      }`}
                    >
                      {cellChapters.length > 0 ? (
                        <div className="cell-chapters-list">
                          {cellChapters.map((ch) => {
                            const stats = getChapterStats(ch.id);
                            const name = lang === 'en' ? ch.name : ch.nameVn;

                            return (
                              <div
                                key={ch.id}
                                className="matrix-chapter-card"
                                onClick={() => onSelectChapter(ch)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onSelectChapter(ch)}
                                style={{ '--chapter-color': ch.color } as CSSProperties}
                              >
                                <div className="matrix-chapter-header">
                                  <span className="matrix-chapter-icon">{ch.icon}</span>
                                  <span className="matrix-chapter-progress-text">
                                    {stats.correct}/{stats.total}
                                  </span>
                                </div>
                                <div className="matrix-chapter-title" title={name}>
                                  {name}
                                </div>
                                <div className="matrix-chapter-progress-bar">
                                  <div
                                    className="matrix-chapter-progress-fill"
                                    style={{
                                      width: `${stats.progress}%`,
                                      backgroundColor: ch.color,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="matrix-empty-cell">
                          <span className="empty-dash">—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="matrix-legend">
        <span className="legend-dot"></span>
        <span>
          {lang === 'en' ? 'Select any topic to start practicing' : 'Chọn chuyên đề bất kỳ để bắt đầu luyện tập'}
        </span>
      </div>
    </div>
  );
}
