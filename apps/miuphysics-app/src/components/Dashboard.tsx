import ProgressRing from './ProgressRing';
import { t } from '../data/i18n.js';

const getMasteryStatusLabel = (status, lang) => {
  const map = {
    not_started: 'mastery_not_started',
    collect_evidence: 'mastery_collect',
    repair: 'mastery_repair',
    build: 'mastery_build',
    building: 'mastery_build',
    hard_proof: 'mastery_hard',
    stable: 'mastery_stable',
  };
  const key = map[status] || status;
  return t(key, lang);
};

const getRecommendationLabel = (kind, lang) => {
  const key = `rec_${kind}`;
  return t(key, lang);
};

export default function Dashboard({
  dashboard,
  chapters,
  onNavigate,
  errorNotebookSummary,
  lang = 'vi',
}: any) {
  if (!dashboard) return null;

  const {
    totalAttempts,
    skillMastery,
    stableSkills,
    repairSkills,
    recommendation,
    topRows,
  } = dashboard;

  const overallMastery = skillMastery.length > 0
    ? skillMastery.reduce((sum, row) => sum + (row.mastery || 0), 0) / skillMastery.length * 100
    : 0;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        📊 {t('dashboard_title_text', lang)}
      </h2>

      {/* Overall Mastery */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <ProgressRing progress={overallMastery} size={120} strokeWidth={8} color="#8B5CF6" />
          <div style={{ marginTop: 12, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            {t('dashboard_overall_mastery', lang)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('dashboard_overall_mastery_sub', lang)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-value">{totalAttempts}</div>
          <div className="stat-label">{t('total_attempts_label', lang)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stableSkills}</div>
          <div className="stat-label">{t('stable_skills', lang)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: repairSkills > 0 ? 'var(--error)' : undefined }}>
            {repairSkills}
          </div>
          <div className="stat-label">{t('needs_repair', lang)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{errorNotebookSummary?.dueEntries?.length || 0}</div>
          <div className="stat-label">{t('due_review', lang)}</div>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-heading)' }}>
                {t('dashboard_recommendation_title', lang)} {getRecommendationLabel(recommendation.kind, lang)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {t('recommendation_based', lang)}
              </div>
            </div>
          </div>
          {recommendation.reason && (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              {recommendation.reason}
            </div>
          )}
        </div>
      )}

      {/* Skill Mastery Bars */}
      {topRows.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            📈 {t('dashboard_progress_title', lang)}
          </h3>
          {topRows.map((row) => {
            const chapterObj = chapters.find(ch => ch.id === row.id);
            const label = chapterObj ? (lang === 'en' ? chapterObj.name : chapterObj.nameVn) : (row.label || row.id);
            return (
              <div key={row.id} className="mastery-bar-container">
                <div className="mastery-bar-label">
                  <span style={{ color: 'var(--text)' }}>{label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {Math.round((row.mastery || 0) * 100)}% — {getMasteryStatusLabel(row.status, lang)}
                  </span>
                </div>
                <div className="mastery-bar-track">
                  <div
                    className="mastery-bar-fill"
                    style={{
                      width: `${Math.round((row.mastery || 0) * 100)}%`,
                      background: row.status === 'stable'
                        ? 'linear-gradient(90deg, var(--success), #059669)'
                        : row.status === 'repair'
                        ? 'linear-gradient(90deg, var(--error), #DC2626)'
                        : 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>⚡ {t('dashboard_actions_title', lang)}</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>
            {t('choose_chapter', lang)}
          </button>
          {(errorNotebookSummary?.dueEntries?.length || 0) > 0 && (
            <button className="btn btn-error" onClick={() => onNavigate('error_notebook')}>
              {t('review_errors', lang)} ({errorNotebookSummary.dueEntries.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
