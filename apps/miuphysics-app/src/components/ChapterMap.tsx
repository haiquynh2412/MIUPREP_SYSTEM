import ProgressRing from './ProgressRing';
import { t } from '../data/i18n.js';

export default function ChapterMap({ chapters, questions, learningState, onSelectChapter, lang = 'vi' }: any) {
  const getChapterProgress = (chapterId) => {
    const chapterQuestions = (questions || []).filter((q) => q.chapter === chapterId);
    if (!chapterQuestions.length) return { total: 0, attempted: 0, correct: 0, progress: 0 };

    const attempts = learningState?.attempts || [];
    const attemptedIds = new Set(
      attempts.filter((a) => a.payload?.chapter === chapterId).map((a) => a.payload?.sourceId)
    );
    const correctIds = new Set(
      attempts.filter((a) => a.payload?.chapter === chapterId && a.correct).map((a) => a.payload?.sourceId)
    );

    return {
      total: chapterQuestions.length,
      attempted: attemptedIds.size,
      correct: correctIds.size,
      progress: chapterQuestions.length > 0 ? (correctIds.size / chapterQuestions.length) * 100 : 0,
    };
  };

  return (
    <div className="chapter-grid">
      {chapters.map((chapter) => {
        const stats = getChapterProgress(chapter.id);
        const name = lang === 'en' ? chapter.name : chapter.nameVn;
        const subName = lang === 'en' ? chapter.nameVn : chapter.name;

        return (
          <div
            key={chapter.id}
            className="chapter-card"
            onClick={() => onSelectChapter(chapter)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectChapter(chapter)}
          >
            <div className="chapter-icon">{chapter.icon}</div>
            <div className="chapter-name">{name}</div>
            <div className="chapter-name-vn">{subName}</div>
            <div className="chapter-stats">
              <ProgressRing progress={stats.progress} size={48} strokeWidth={4} color={chapter.color} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  {stats.correct}/{stats.total}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {t('correct_count', lang)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
