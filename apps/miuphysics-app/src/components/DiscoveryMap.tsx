import type { CSSProperties } from 'react';
import { useState } from 'react';

export default function DiscoveryMap({
  zones = [],
  chapters = [],
  questions = [],
  learningState = {},
  onSelectChapter,
  onSelectZone,
  selectedGrade,
  lang = 'vi',
}: any) {
  const [expandedZone, setExpandedZone] = useState(null);

  const getZoneProgress = (zone) => {
    const zoneChapterIds = zone.chapters;
    const gradeChapters = chapters.filter(
      (ch) => zoneChapterIds.includes(ch.id) && (!selectedGrade || ch.grade === selectedGrade),
    );
    if (gradeChapters.length === 0) return { total: 0, correct: 0, progress: 0, chaptersInGrade: 0 };

    const attempts = learningState?.attempts || [];
    let totalQ = 0;
    let correctQ = 0;

    gradeChapters.forEach((ch) => {
      const chQ = questions.filter((q) => q.chapter === ch.id);
      totalQ += chQ.length;
      const correctIds = new Set(
        attempts.filter((a) => a.payload?.chapter === ch.id && a.correct).map((a) => a.payload?.sourceId),
      );
      correctQ += correctIds.size;
    });

    return {
      total: totalQ,
      correct: correctQ,
      progress: totalQ > 0 ? (correctQ / totalQ) * 100 : 0,
      chaptersInGrade: gradeChapters.length,
    };
  };

  const handleZoneClick = (zone) => {
    if (expandedZone === zone.id) {
      setExpandedZone(null);
    } else {
      setExpandedZone(zone.id);
    }
  };

  // Filter zones that have chapters in the selected grade
  const visibleZones = zones.filter((zone) => {
    const gradeChapters = chapters.filter(
      (ch) => zone.chapters.includes(ch.id) && (!selectedGrade || ch.grade === selectedGrade),
    );
    return gradeChapters.length > 0;
  });

  return (
    <div className="discovery-map">
      <div className="discovery-map-grid">
        {visibleZones.map((zone) => {
          const stats = getZoneProgress(zone);
          const isExpanded = expandedZone === zone.id;
          const zoneChaptersInGrade = chapters.filter(
            (ch) => zone.chapters.includes(ch.id) && (!selectedGrade || ch.grade === selectedGrade),
          );

          return (
            <div key={zone.id} className={`discovery-zone-wrapper ${isExpanded ? 'expanded' : ''}`}>
              <div
                className={`discovery-zone-card ${isExpanded ? 'active' : ''}`}
                style={{ '--zone-color': zone.color, '--zone-gradient': zone.gradient } as CSSProperties}
                onClick={() => handleZoneClick(zone)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick(zone)}
              >
                {/* Glow background */}
                <div className="zone-glow" />

                {/* Background emoji */}
                <div className="zone-bg-emoji">{zone.bgEmoji}</div>

                {/* Header */}
                <div className="zone-header">
                  <div className="zone-icon-container">
                    <span className="zone-icon">{zone.icon}</span>
                  </div>
                  <div className="zone-info">
                    <h3 className="zone-name">{lang === 'en' ? zone.nameEn : zone.name}</h3>
                    <p className="zone-name-sub">{lang === 'en' ? zone.name : zone.nameEn}</p>
                  </div>
                </div>

                {/* Curiosity Hook */}
                <div className="zone-curiosity">
                  <span className="zone-curiosity-icon">💡</span>
                  <p className="zone-curiosity-text">{lang === 'en' ? zone.curiosityHookEn : zone.curiosityHook}</p>
                </div>

                {/* Progress */}
                <div className="zone-footer">
                  <div className="zone-progress-bar">
                    <div
                      className="zone-progress-fill"
                      style={{ width: `${stats.progress}%`, background: zone.gradient }}
                    />
                  </div>
                  <div className="zone-stats">
                    <span className="zone-stat-chapters">
                      {stats.chaptersInGrade} {lang === 'en' ? 'chapters' : 'chương'}
                    </span>
                    <span className="zone-stat-progress">{Math.round(stats.progress)}%</span>
                  </div>
                </div>

                {/* Badge preview */}
                <div className="zone-badge-preview">
                  <span>{zone.badge.icon}</span>
                  <span className="zone-badge-title">{lang === 'en' ? zone.badge.title : zone.badge.titleVn}</span>
                </div>

                {/* Expand indicator */}
                <div className="zone-expand-hint">
                  {isExpanded ? '▲' : '▼'} {lang === 'en' ? 'Chapters' : 'Xem chương'}
                </div>
              </div>

              {/* Expanded chapter list */}
              {isExpanded && (
                <div className="zone-chapters-panel animate-fadeIn">
                  {zoneChaptersInGrade.map((ch) => {
                    const chQ = questions.filter((q) => q.chapter === ch.id);
                    const attempts = learningState?.attempts || [];
                    const correctIds = new Set(
                      attempts.filter((a) => a.payload?.chapter === ch.id && a.correct).map((a) => a.payload?.sourceId),
                    );
                    const progress = chQ.length > 0 ? (correctIds.size / chQ.length) * 100 : 0;

                    return (
                      <div
                        key={ch.id}
                        className="zone-chapter-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectChapter(ch);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelectChapter(ch)}
                      >
                        <span className="zone-chapter-icon">{ch.icon}</span>
                        <div className="zone-chapter-info">
                          <div className="zone-chapter-name">{lang === 'en' ? ch.name : ch.nameVn}</div>
                          <div className="zone-chapter-sub">
                            {correctIds.size}/{chQ.length} {lang === 'en' ? 'correct' : 'câu đúng'}
                          </div>
                        </div>
                        <div className="zone-chapter-progress-ring">
                          <svg viewBox="0 0 36 36" className="zone-mini-ring">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={zone.color}
                              strokeWidth="3"
                              strokeDasharray={`${progress}, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="zone-mini-ring-text">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
