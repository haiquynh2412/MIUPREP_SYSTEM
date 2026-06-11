import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './App.css';

export interface PhysicsQuestionOption { key: string; content: string }

export interface PhysicsQuestion {
  id: string;
  grade?: number | string;
  chapter?: string;
  chapter_vn?: string;
  topic?: string;
  topic_vn?: string;
  type?: string;
  difficulty?: string;
  question_text?: string;
  question_text_en?: string;
  options?: PhysicsQuestionOption[] | null;
  correct_answer?: string;
  explanation?: Record<string, any> | null;
  thinking_guide?: any;
  real_world_connection?: any;
  formula?: any;
}

export interface PhysicsChapter {
  id?: string;
  name?: string;
  nameVn?: string;
  icon?: string;
  grade?: number | string;
  [key: string]: any;
}
import {
  buildMiuPhysicsDiagnosticQuestions,
  buildMiuPhysicsErrorNotebookSummary,
  buildMiuPhysicsLearningDashboard,
  loadMiuPhysicsErrorNotebook,
  loadMiuPhysicsLearningState,
  recordMiuPhysicsAttempt,
  recordMiuPhysicsErrorNotebookMistake,
  reviewMiuPhysicsErrorNotebookEntry,
  saveMiuPhysicsLearningState,
  // New gamification imports
  loadStreak,
  updateStreak,
  loadXp,
  addXp,
  loadUnlockedAchievements,
  checkAndUnlockAchievements,
  loadDiaryEntries,
  addDiaryEntry,
  deleteDiaryEntry,
  loadCompletedMissions,
  completeMission,
  loadCompletedExperiments,
  completeExperiment,
} from './learning.js';

// Components
import ChapterMap from './components/ChapterMap';
import QuestionCard from './components/QuestionCard';
import ThinkingGuide from './components/ThinkingGuide';
import Dashboard from './components/Dashboard';
import ProgressRing from './components/ProgressRing';
import RealWorldCard from './components/RealWorldCard';
import DailyFact from './components/DailyFact';
import AchievementPanel from './components/AchievementPanel';
import DetectiveMission from './components/DetectiveMission';
import HomeLabCard from './components/HomeLabCard';
import ObservationDiary from './components/ObservationDiary';
import QuickChallenge from './components/QuickChallenge';
import StreakTracker from './components/StreakTracker';
import LanguageToggle from './components/LanguageToggle';
import DiscoveryMap from './components/DiscoveryMap';
import PhysicsMatrix from './components/PhysicsMatrix';

// Data
import { DAILY_FACTS } from './data/dailyFacts.js';
import { DETECTIVE_MISSIONS } from './data/detectiveMissions.js';
import { HOME_EXPERIMENTS } from './data/homeExperiments.js';
import { ACHIEVEMENTS, LEVELS } from './data/achievementDefs.js';
import { CHAPTER_RESOURCES } from './data/chapterResources.js';
import { t, loadLanguage, saveLanguage } from './data/i18n.js';
import { ACHIEVEMENT_ICONS } from './data/achievementIcons.js';
import { DISCOVERY_ZONES, getZoneForChapter } from './data/discoveryZones.js';

/* ---- Constants ---- */
const SANITIZE_OPTIONS = { USE_PROFILES: { html: true, mathMl: true } };
const sanitizeRenderedHtml = (html) => DOMPurify.sanitize(html, SANITIZE_OPTIONS);

const CHAPTERS = [
  // Grade 6
  { id: 'measurement', name: 'Measurement & Units', nameVn: 'Các phép đo', icon: '📏', color: '#8B5CF6', grade: 6 },
  { id: 'mass_density', name: 'Mass & Density', nameVn: 'Khối lượng riêng', icon: '⚖️', color: '#6D28D9', grade: 6 },
  { id: 'force_basics', name: 'Force Basics', nameVn: 'Lực cơ bản', icon: '💪', color: '#7C3AED', grade: 6 },
  { id: 'motion_basics', name: 'Motion Basics', nameVn: 'Chuyển động', icon: '🏃', color: '#8B5CF6', grade: 6 },
  { id: 'energy_basics', name: 'Energy Basics', nameVn: 'Năng lượng', icon: '⚡', color: '#A78BFA', grade: 6 },
  { id: 'light_basics', name: 'Light Basics', nameVn: 'Ánh sáng', icon: '💡', color: '#C4B5FD', grade: 6 },
  { id: 'sound_basics', name: 'Sound Basics', nameVn: 'Âm thanh', icon: '🔊', color: '#DDD6FE', grade: 6 },
  // Grade 7
  { id: 'speed_graph', name: 'Speed & Motion Graphs', nameVn: 'Tốc độ và đồ thị', icon: '📈', color: '#7C3AED', grade: 7 },
  { id: 'reflection_refraction', name: 'Reflection & Refraction', nameVn: 'Phản xạ và khúc xạ', icon: '🪞', color: '#6D28D9', grade: 7 },
  { id: 'sound_wave', name: 'Sound Waves', nameVn: 'Sóng âm', icon: '🎵', color: '#8B5CF6', grade: 7 },
  { id: 'magnetic_field_basics', name: 'Magnetic Fields', nameVn: 'Từ trường', icon: '🧲', color: '#A78BFA', grade: 7 },
  { id: 'earth_solar_system', name: 'Earth & Solar System', nameVn: 'Trái Đất và Hệ Mặt Trời', icon: '🌍', color: '#C4B5FD', grade: 7 },
  // Grade 8
  { id: 'pressure', name: 'Pressure', nameVn: 'Áp suất', icon: '🔧', color: '#7C3AED', grade: 8 },
  { id: 'liquid_pressure', name: 'Liquid & Atmospheric Pressure', nameVn: 'Áp suất chất lỏng', icon: '🌊', color: '#6D28D9', grade: 8 },
  { id: 'buoyancy', name: 'Buoyancy (Archimedes)', nameVn: 'Lực đẩy Archimedes', icon: '🚢', color: '#8B5CF6', grade: 8 },
  { id: 'moment_of_force', name: 'Moment of Force', nameVn: 'Momen lực', icon: '⚖️', color: '#A78BFA', grade: 8 },
  { id: 'kinetic_energy', name: 'Kinetic Energy', nameVn: 'Động năng', icon: '🏎️', color: '#7C3AED', grade: 8 },
  { id: 'potential_energy', name: 'Potential Energy', nameVn: 'Thế năng', icon: '⛰️', color: '#6D28D9', grade: 8 },
  { id: 'energy_conservation', name: 'Energy Conservation', nameVn: 'Bảo toàn năng lượng', icon: '♻️', color: '#8B5CF6', grade: 8 },
  { id: 'heat_transfer', name: 'Heat Transfer', nameVn: 'Truyền nhiệt', icon: '🔥', color: '#A78BFA', grade: 8 },
  // Grade 9
  { id: 'resistance_ohm', name: 'Resistance & Ohm\'s Law', nameVn: 'Điện trở và Định luật Ohm', icon: '⚡', color: '#7C3AED', grade: 9 },
  { id: 'electric_circuit', name: 'Electric Circuits', nameVn: 'Mạch điện', icon: '🔌', color: '#6D28D9', grade: 9 },
  { id: 'electric_power', name: 'Electric Power', nameVn: 'Công suất điện', icon: '💡', color: '#8B5CF6', grade: 9 },
  { id: 'magnetic_force', name: 'Magnetic Force & EM', nameVn: 'Lực từ và cảm ứng ĐT', icon: '🧲', color: '#A78BFA', grade: 9 },
  { id: 'light_spectrum', name: 'Light Spectrum', nameVn: 'Quang phổ ánh sáng', icon: '🌈', color: '#C4B5FD', grade: 9 },
  { id: 'nuclear_energy_intro', name: 'Nuclear Energy', nameVn: 'Năng lượng hạt nhân', icon: '☢️', color: '#DDD6FE', grade: 9 },
  { id: 'gifted_mechanics_grade9', name: 'Advanced Mechanics', nameVn: 'Cơ học chuyên sâu & Vật lý vui', icon: '⚙️', color: '#6366F1', grade: 9 },
  { id: 'gifted_heat_grade9', name: 'Advanced Heat & Thermodynamics', nameVn: 'Nhiệt học nâng cao & Cân bằng', icon: '🔥', color: '#EF4444', grade: 9 },
];

/* ---- Helpers ---- */
const renderMath = (text) => {
  if (!text) return '';
  let rendered = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
    } catch { return match; }
  });
  rendered = rendered.replace(/\$([\s\S]+?)\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch { return match; }
  });
  rendered = rendered.replace(/\n/g, '<br/>');
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return sanitizeRenderedHtml(rendered);
};

const getLocalizedPhetUrl = (url, lang) => {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}locale=${lang}`;
};

const getLocalizedYoutubeUrl = (url, lang) => {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}hl=${lang}&cc_load_policy=1&cc_lang_pref=${lang}`;
};

/* ---- Main App ---- */
export default function App() {
  // Data state
  const [questions, setQuestions] = useState<PhysicsQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningState, setLearningState] = useState(() => loadMiuPhysicsLearningState('guest'));
  const [errorNotebookEntries, setErrorNotebookEntries] = useState(() => loadMiuPhysicsErrorNotebook('guest'));

  // View state
  const [selectedGrade, setSelectedGrade] = useState(6);
  const [currentView, setCurrentView] = useState('home');
  const [currentChapter, setCurrentChapter] = useState<PhysicsChapter | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PhysicsQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showThinkingGuide, setShowThinkingGuide] = useState(true);
  const [thinkingGuideStep, setThinkingGuideStep] = useState(0);
  const [practiceMode, setPracticeMode] = useState('guided');
  const [practiceQuestions, setPracticeQuestions] = useState<PhysicsQuestion[]>([]);

  // Home view mode: 'matrix' (Thematic Matrix), 'zones' (Discovery Map) or 'chapters' (Classic)
  const [homeViewMode, setHomeViewMode] = useState('matrix');
  // Chapter view tab: 'real_world', 'virtual_lab', 'thinking_quest'
  const [chapterTab, setChapterTab] = useState('real_world');

  // Gamification state
  const [streak, setStreak] = useState(() => loadStreak());
  const [xp, setXp] = useState(() => loadXp());
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => loadUnlockedAchievements());
  const [achievementToast, setAchievementToast] = useState<any>(null);
  const [diaryEntries, setDiaryEntries] = useState(() => loadDiaryEntries());
  const [completedMissionIds, setCompletedMissionIds] = useState(() => loadCompletedMissions());
  const [completedExperimentIds, setCompletedExperimentIds] = useState(() => loadCompletedExperiments());

  // Language state
  const [lang, setLang] = useState(() => loadLanguage());
  const handleLanguageToggle = (newLang) => {
    setLang(newLang);
    saveLanguage(newLang);
  };
  const _ = (key: string, params?: Record<string, string | number>) => t(key, lang, params);

  const learnerId = 'guest';
  const errorNotebookSummary = buildMiuPhysicsErrorNotebookSummary(errorNotebookEntries);

  // Persist learning state
  const persistLearningState = (nextState) => {
    setLearningState(nextState);
    saveMiuPhysicsLearningState(learnerId, nextState);
  };

  // Load questions on mount
  useEffect(() => {
    Promise.all([
      fetch('/data/questions_db.json').then(r => r.json()).catch(() => []),
      fetch('/data/questions_grade7.json').then(r => r.json()).catch(() => []),
      fetch('/data/questions_grade8.json').then(r => r.json()).catch(() => []),
      fetch('/data/questions_grade9.json').then(r => r.json()).catch(() => []),
    ]).then(([g6, g7, g8, g9]) => {
      const all = [
        ...(Array.isArray(g6) ? g6 : []),
        ...(Array.isArray(g7) ? g7 : []),
        ...(Array.isArray(g8) ? g8 : []),
        ...(Array.isArray(g9) ? g9 : []),
      ];
      setQuestions(all);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load questions:', err);
      setQuestions([]);
      setLoading(false);
    });
  }, []);

  // Update streak on mount
  useEffect(() => {
    const s = updateStreak();
    setStreak(s);
  }, []);

  /* ---- Navigation ---- */
  const navigateTo = (view: string, options: { chapter?: PhysicsChapter; question?: PhysicsQuestion; questionIndex?: number } = {}) => {
    setCurrentView(view);
    setSelectedAnswer(null);
    setShowResult(false);
    setThinkingGuideStep(0);
    if (options.chapter) setCurrentChapter(options.chapter);
    if (options.question) setCurrentQuestion(options.question);
    if (options.questionIndex !== undefined) setCurrentQuestionIndex(options.questionIndex);
  };

  const handleSelectChapter = (chapter) => {
    setCurrentChapter(chapter);
    setChapterTab('real_world');
    setCurrentView('chapter');
  };

  // Inject phet_sim into question if available
  const injectPhetSim = (q) => {
    if (!q) return q;
    const chapterRes = CHAPTER_RESOURCES[q.chapter];
    const sim = chapterRes?.question_sims?.[q.id];
    if (sim && !q.phet_sim) {
      return { ...q, phet_sim: sim };
    }
    return q;
  };

  const startPractice = (chapter, mode = 'guided') => {
    const chapterQuestions = questions
      .filter((q) => q.chapter === chapter.id)
      .map(injectPhetSim);
    if (!chapterQuestions.length) return;
    setPracticeQuestions(chapterQuestions);
    setPracticeMode(mode);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(chapterQuestions[0]);
    setSelectedAnswer(null);
    setShowResult(false);
    setThinkingGuideStep(0);
    setCurrentView('practice');
  };

  /* ---- Answer handling ---- */
  const handleSelectAnswer = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const showAchievementToast = (achievementId) => {
    const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (ach) {
      setAchievementToast(ach);
      setTimeout(() => setAchievementToast(null), 4000);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    setShowResult(true);

    const result = recordMiuPhysicsAttempt(learningState, currentQuestion, selectedAnswer, practiceMode, learnerId);
    if (result) {
      persistLearningState(result.state);

      // XP reward
      const xpGain = result.attempt.correct ? 10 : 2;
      const newXp = addXp(xpGain);
      setXp(newXp);

      // Check achievements
      const newStreak = updateStreak();
      setStreak(newStreak);
      const achResult = checkAndUnlockAchievements(result.state, newStreak);
      setUnlockedAchievements(achResult.unlocked);

      // Show toast for first new achievement
      if (achResult.newlyUnlocked.length > 0) {
        showAchievementToast(achResult.newlyUnlocked[0]);
      }

      // Record mistake in error notebook if wrong
      if (!result.attempt.correct) {
        const { entries } = recordMiuPhysicsErrorNotebookMistake(
          learnerId, currentQuestion, selectedAnswer, result.attempt, errorNotebookEntries
        );
        setErrorNotebookEntries(entries);
      }
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < practiceQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(practiceQuestions[nextIndex]);
      setSelectedAnswer(null);
      setShowResult(false);
      setThinkingGuideStep(0);
    } else {
      setCurrentView('chapter');
    }
  };

  /* ---- Error Notebook Review ---- */
  const handleReviewError = (entry, grade) => {
    const { entries } = reviewMiuPhysicsErrorNotebookEntry(learnerId, entry.questionId, grade, errorNotebookEntries);
    setErrorNotebookEntries(entries);
  };

  /* ---- Diary handlers ---- */
  const handleAddDiary = (entry) => {
    const { entries } = addDiaryEntry(entry);
    setDiaryEntries(entries);
  };

  const handleDeleteDiary = (entryId) => {
    const entries = deleteDiaryEntry(entryId);
    setDiaryEntries(entries);
  };

  /* ---- Mission handler ---- */
  const handleCompleteMission = (missionId) => {
    const completed = completeMission(missionId);
    setCompletedMissionIds(completed);
    const newXp = addXp(25);
    setXp(newXp);
  };

  /* ---- Experiment handler ---- */
  const handleCompleteExperiment = (expId) => {
    const completed = completeExperiment(expId);
    setCompletedExperimentIds(completed);
    const newXp = addXp(30);
    setXp(newXp);
  };

  /* ---- Dashboard data ---- */
  const dashboard = buildMiuPhysicsLearningDashboard(learningState, questions);

  /* ---- Loading screen ---- */
  if (loading) {
    return (
      <div className="app-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
          <div className="animate-float" style={{ fontSize: '4rem' }}>⚛️</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-light)' }}>{_('loading')}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{_('loading_subtitle')}</div>
        </div>
      </div>
    );
  }

  /* ---- Render ---- */
  return (
    <div className="app-container">
      {/* Achievement Toast */}
      {achievementToast && (
        <div className="achievement-unlock-toast">
          <span className="achievement-unlock-toast-icon">{achievementToast.icon}</span>
          <div className="achievement-unlock-toast-text">
            <div className="achievement-unlock-toast-title">🏆 {achievementToast.title}!</div>
            <div className="achievement-unlock-toast-desc">{achievementToast.description} • +{achievementToast.xpReward} XP</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-brand">
            <span className="header-brand-icon">⚛️</span>
            <div>
              <h1>{_('app_name')}</h1>
              <span>{_('app_subtitle')}</span>
            </div>
          </div>
          <div className="grade-selector">
            {[6, 7, 8, 9].map((g) => (
              <button
                key={g}
                className={`grade-tab ${selectedGrade === g ? 'active' : ''}`}
                onClick={() => setSelectedGrade(g)}
              >
                {_('grade_prefix')} {g}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StreakTracker streak={streak.current} bestStreak={streak.best} />
            <LanguageToggle lang={lang} onToggle={handleLanguageToggle} />
          </div>
          <nav className="nav-tabs">
            <button className={`nav-tab ${currentView === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home')}>📚 {_('nav_chapters')}</button>
            <button className={`nav-tab ${currentView === 'explore' ? 'active' : ''}`} onClick={() => navigateTo('explore')}>🔍 {_('nav_explore')}</button>
            <button className={`nav-tab ${currentView === 'challenge' ? 'active' : ''}`} onClick={() => navigateTo('challenge')}>⚡ {_('nav_challenge')}</button>
            <button className={`nav-tab ${currentView === 'diary' ? 'active' : ''}`} onClick={() => navigateTo('diary')}>📓 {_('nav_diary')}</button>
            <button className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>📊 {_('nav_dashboard')}</button>
            <button className={`nav-tab ${currentView === 'achievements' ? 'active' : ''}`} onClick={() => navigateTo('achievements')}>🏆 {_('nav_achievements')}</button>
            <button className={`nav-tab ${currentView === 'error_notebook' ? 'active' : ''}`} onClick={() => navigateTo('error_notebook')}>
              📝 {_('nav_errors')}
              {(errorNotebookSummary?.dueEntries?.length || 0) > 0 && (
                <span style={{
                  marginLeft: 6, background: 'var(--error)', color: 'white',
                  borderRadius: 'var(--radius-pill)', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700,
                }}>{errorNotebookSummary.dueEntries.length}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: 24, paddingBottom: 48 }}>

        {/* ===== HOME VIEW ===== */}
        {currentView === 'home' && (
          <div className="animate-fadeIn">
            {/* Daily Fact */}
            <DailyFact facts={DAILY_FACTS} selectedGrade={selectedGrade} lang={lang} />

            <div className="welcome-section">
              <div className="animate-float" style={{ fontSize: '3.5rem', marginBottom: 12 }}>⚛️</div>
              <h1 className="welcome-title">{_('welcome_title')}</h1>
              <p className="welcome-subtitle">
                {_('welcome_subtitle_template', { grade: selectedGrade })}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${homeViewMode === 'matrix' ? 'active' : ''}`}
                onClick={() => setHomeViewMode('matrix')}
              >
                📊 {_('home_thematic_matrix')}
              </button>
              <button
                className={`view-toggle-btn ${homeViewMode === 'zones' ? 'active' : ''}`}
                onClick={() => setHomeViewMode('zones')}
              >
                🌍 {_('home_world_explorer')}
              </button>
              <button
                className={`view-toggle-btn ${homeViewMode === 'chapters' ? 'active' : ''}`}
                onClick={() => setHomeViewMode('chapters')}
              >
                📚 {_('home_by_chapter')}
              </button>
            </div>

            {/* Thematic Matrix Mode */}
            {homeViewMode === 'matrix' && (
              <PhysicsMatrix
                zones={DISCOVERY_ZONES}
                chapters={CHAPTERS}
                questions={questions}
                learningState={learningState}
                onSelectChapter={handleSelectChapter}
                selectedGrade={selectedGrade}
                lang={lang}
              />
            )}

            {/* Discovery Map Mode */}
            {homeViewMode === 'zones' && (
              <DiscoveryMap
                zones={DISCOVERY_ZONES}
                chapters={CHAPTERS}
                questions={questions}
                learningState={learningState}
                onSelectChapter={handleSelectChapter}
                selectedGrade={selectedGrade}
                lang={lang}
              />
            )}

            {/* Classic Chapter Mode */}
            {homeViewMode === 'chapters' && (
              <ChapterMap
                chapters={CHAPTERS.filter(c => c.grade === selectedGrade)}
                questions={questions}
                learningState={learningState}
                onSelectChapter={handleSelectChapter}
                lang={lang}
              />
            )}

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{dashboard.totalAttempts}</div>
                <div className="stat-label">{_('total_attempts')}</div>
              </div>
              <div className="quick-stat">
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  {dashboard.skillMastery.length > 0
                    ? Math.round(dashboard.skillMastery.reduce((s, r) => s + (r.accuracy || 0), 0) / dashboard.skillMastery.length * 100)
                    : 0}%
                </div>
                <div className="stat-label">{_('avg_mastery')}</div>
              </div>
              <div className="quick-stat">
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{xp} XP</div>
                <div className="stat-label">{_('experience')}</div>
              </div>
              <div className="quick-stat">
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{questions.filter(q => q.grade === selectedGrade).length}</div>
                <div className="stat-label">{_('questions_count')}</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== EXPLORE VIEW ===== */}
        {currentView === 'explore' && (
          <div className="animate-fadeIn">
            <h2 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              🔍 {_('explore_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              {_('explore_subtitle')}
            </p>

            {/* Detective Missions for selected grade */}
            <div className="explore-section">
              <div className="explore-section-header">
                <h3 className="explore-section-title">🔍 {_('detective_title')}</h3>
              </div>
              {CHAPTERS.filter(c => c.grade === selectedGrade).map(chapter => {
                const missions = DETECTIVE_MISSIONS[chapter.id];
                if (!missions || missions.length === 0) return null;
                return (
                  <div key={chapter.id} style={{ marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{chapter.icon}</span> {lang === 'en' ? chapter.name : chapter.nameVn}
                    </h4>
                    <DetectiveMission
                      missions={missions}
                      chapterId={chapter.id}
                      completedMissionIds={completedMissionIds}
                      onCompleteMission={handleCompleteMission}
                      lang={lang}
                    />
                  </div>
                );
              })}
            </div>

            {/* Home Experiments */}
            <div className="explore-section">
              <div className="explore-section-header">
                <h3 className="explore-section-title">🧪 {_('home_lab_title')}</h3>
              </div>
              {CHAPTERS.filter(c => c.grade === selectedGrade).map(chapter => {
                const experiments = HOME_EXPERIMENTS[chapter.id];
                if (!experiments || experiments.length === 0) return null;
                return (
                  <div key={chapter.id} style={{ marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{chapter.icon}</span> {lang === 'en' ? chapter.name : chapter.nameVn}
                    </h4>
                    <HomeLabCard
                      experiments={experiments}
                      completedIds={completedExperimentIds}
                      onMarkComplete={handleCompleteExperiment}
                      lang={lang}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== CHALLENGE VIEW ===== */}
        {currentView === 'challenge' && (
          <div className="animate-fadeIn">
            <h2 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              ⚡ {_('challenge_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              {_('challenge_subtitle')}
            </p>
            <QuickChallenge
              questions={questions.filter(q => q.grade === selectedGrade)}
              onComplete={() => navigateTo('home')}
              renderMath={renderMath}
              lang={lang}
            />
          </div>
        )}

        {/* ===== DIARY VIEW ===== */}
        {currentView === 'diary' && (
          <div className="animate-fadeIn">
            <h2 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              📓 {_('diary_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              {_('diary_subtitle')}
            </p>
            <ObservationDiary
              entries={diaryEntries}
              onAddEntry={handleAddDiary}
              onDeleteEntry={handleDeleteDiary}
              chapters={CHAPTERS}
              lang={lang}
            />
          </div>
        )}

        {/* ===== ACHIEVEMENTS VIEW ===== */}
        {currentView === 'achievements' && (
          <div className="animate-fadeIn">
            <h2 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              🏆 {_('achievement_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              {_('achievement_subtitle')}
            </p>
            <AchievementPanel
              achievements={ACHIEVEMENTS.map(a => ({
                ...a,
                svgIcon: ACHIEVEMENT_ICONS[a.id] || ACHIEVEMENT_ICONS.default,
              }))}
              unlockedIds={unlockedAchievements}
              xp={xp}
              streak={streak}
              levels={LEVELS}
              lang={lang}
            />
          </div>
        )}

        {/* ===== CHAPTER VIEW ===== */}
        {currentView === 'chapter' && currentChapter && (
          <div className="animate-fadeIn">
            <button className="back-btn" onClick={() => navigateTo('home')}>
              {_('back_to_chapters')}
            </button>

            <div className="card" style={{ marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${currentChapter.color}, var(--accent-cyan))` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: '3rem' }}>{currentChapter.icon}</span>
                <div>
                  <h2 style={{ marginBottom: 4 }}>{lang === 'en' ? currentChapter.name : currentChapter.nameVn}</h2>
                  <div style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? currentChapter.nameVn : currentChapter.name}</div>
                </div>
              </div>

              {/* Curiosity Banner from Zone */}
              {(() => {
                const zone = getZoneForChapter(currentChapter.id ?? '');
                if (!zone) return null;
                return (
                  <div className="chapter-curiosity-banner">
                    <span className="curiosity-emoji">{zone.icon}</span>
                    <div className="curiosity-content">
                      <h4>{lang === 'en' ? zone.nameEn : zone.name}</h4>
                      <p>{lang === 'en' ? zone.curiosityHookEn : zone.curiosityHook}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3-Tab Navigation */}
            <div className="chapter-tab-bar">
              <button
                className={`chapter-tab-btn ${chapterTab === 'real_world' ? 'active' : ''}`}
                onClick={() => setChapterTab('real_world')}
              >
                🌍 {lang === 'en' ? 'Real World' : 'Thế giới thực'}
              </button>
              <button
                className={`chapter-tab-btn ${chapterTab === 'virtual_lab' ? 'active' : ''}`}
                onClick={() => setChapterTab('virtual_lab')}
              >
                🧪 {lang === 'en' ? 'Virtual Lab' : 'Lab ảo'}
              </button>
              <button
                className={`chapter-tab-btn ${chapterTab === 'thinking_quest' ? 'active' : ''}`}
                onClick={() => setChapterTab('thinking_quest')}
              >
                🧠 {lang === 'en' ? 'Thinking Quest' : 'Thử thách tư duy'}
              </button>
            </div>

            {/* ---- TAB 1: Real World ---- */}
            {chapterTab === 'real_world' && (
              <div className="chapter-tab-content">
                {/* Detective Missions */}
                {DETECTIVE_MISSIONS[currentChapter.id]?.length > 0 && (
                  <div className="detective-section">
                    <h3 className="detective-section-title">🔍 {lang === 'en' ? 'Detective Missions' : 'Nhiệm vụ Thám tử'}</h3>
                    <DetectiveMission
                      missions={DETECTIVE_MISSIONS[currentChapter.id]}
                      chapterId={currentChapter.id}
                      completedMissionIds={completedMissionIds}
                      onCompleteMission={handleCompleteMission}
                      lang={lang}
                    />
                  </div>
                )}

                {/* Home Experiments */}
                {HOME_EXPERIMENTS[currentChapter.id]?.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 className="resource-section-title">
                      <span className="resource-icon">🧪</span>
                      {lang === 'en' ? 'Home Lab — DIY Mission' : 'Thí nghiệm tại nhà — DIY Mission'}
                    </h3>
                    <HomeLabCard
                      experiments={HOME_EXPERIMENTS[currentChapter.id]}
                      completedIds={completedExperimentIds}
                      onMarkComplete={handleCompleteExperiment}
                      lang={lang}
                    />
                  </div>
                )}

                {/* Books */}
                {(() => {
                  const res = CHAPTER_RESOURCES[currentChapter.id];
                  if (!res?.books?.length) return null;
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <h3 className="resource-section-title">
                        <span className="resource-icon">📖</span> {lang === 'en' ? 'Further Reading' : 'Đọc thêm'}
                      </h3>
                      <div className="resource-books">
                        {res.books.map((book, i) => (
                          <div key={i} className="resource-book-card">
                            <span className="book-icon">📚</span>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{book.title}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{book.author}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginTop: 4 }}>{book.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* CTA to start */}
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <button className="btn btn-primary btn-lg" onClick={() => { setChapterTab('thinking_quest'); }}>
                    🧠 {lang === 'en' ? 'Ready? Start Thinking Quest!' : 'Sẵn sàng? Bắt đầu Thử thách!'}
                  </button>
                </div>
              </div>
            )}

            {/* ---- TAB 2: Virtual Lab ---- */}
            {chapterTab === 'virtual_lab' && (
              <div className="chapter-tab-content">
                {/* Intro Lab */}
                {(() => {
                  const introSim = CHAPTER_RESOURCES[currentChapter.id]?.intro;
                  if (!introSim) return null;
                  return (
                    <div className="intro-lab-card animate-fadeIn">
                      <div className="intro-lab-header">
                        <div className="intro-lab-badge">
                          <span className="resource-badge resource-badge-phet">PhET Lab</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>🎬 {lang === 'en' ? 'Chapter Intro' : 'Vào bài'}</span>
                        </div>
                        <h3 className="intro-lab-title">🧪 {lang === 'en' ? introSim.title : introSim.titleVn}</h3>
                        <p className="intro-lab-desc">{lang === 'en' ? introSim.descriptionEn : introSim.description}</p>
                      </div>
                      <div className="phet-embed-container" style={{ borderRadius: 'var(--radius-md)' }}>
                        <iframe src={getLocalizedPhetUrl(introSim.url, lang)} title={introSim.title} className="phet-iframe" allowFullScreen loading="lazy" />
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <a href={getLocalizedPhetUrl(introSim.url, lang)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                          🔗 {lang === 'en' ? 'Full Screen' : 'Toàn màn hình'}
                        </a>
                        <button className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setChapterTab('thinking_quest'); startPractice(currentChapter, 'guided'); }}>
                          ✅ {lang === 'en' ? 'Explored → Start Learning!' : 'Đã khám phá → Bắt đầu học!'}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* PhET Simulations */}
                {(() => {
                  const res = CHAPTER_RESOURCES[currentChapter.id];
                  if (!res?.phet?.length) return null;
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <h3 className="resource-section-title">
                        <span className="resource-icon">🧪</span> {lang === 'en' ? 'Interactive Simulations' : 'Thí nghiệm mô phỏng'}
                      </h3>
                      <div className="resource-grid">
                        {res.phet.map((sim, i) => (
                          <div key={i} className="resource-card resource-card-phet">
                            <div className="resource-card-header">
                              <span className="resource-badge resource-badge-phet">PhET</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>HTML5 Interactive</span>
                            </div>
                            <h4 className="resource-card-title">{lang === 'en' ? sim.title : sim.titleVn}</h4>
                            <p className="resource-card-desc">{sim.description}</p>
                            <div className="phet-embed-container">
                              <iframe src={getLocalizedPhetUrl(sim.url, lang)} title={sim.title} className="phet-iframe" allowFullScreen loading="lazy" />
                            </div>
                            <a href={getLocalizedPhetUrl(sim.url, lang)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                              🔗 {lang === 'en' ? 'Open Full Screen' : 'Mở toàn màn hình'}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* YouTube Videos */}
                {(() => {
                  const res = CHAPTER_RESOURCES[currentChapter.id];
                  if (!res?.videos?.length) return null;
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <h3 className="resource-section-title">
                        <span className="resource-icon">🎬</span> {lang === 'en' ? 'Discovery Videos' : 'Video khám phá'}
                      </h3>
                      <div className="resource-grid">
                        {res.videos.map((vid, i) => (
                          <div key={i} className="resource-card resource-card-video">
                            <div className="resource-card-header">
                              <span className="resource-badge resource-badge-youtube">YouTube</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{vid.channel} • {vid.duration}</span>
                            </div>
                            <h4 className="resource-card-title">{lang === 'en' ? vid.title : vid.titleVn}</h4>
                            <div className="video-embed-container">
                              <iframe src={getLocalizedYoutubeUrl(vid.url, lang)} title={vid.title} className="video-iframe" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ---- TAB 3: Thinking Quest ---- */}
            {chapterTab === 'thinking_quest' && (
              <div className="chapter-tab-content">
                {/* Practice mode buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                  <button className="btn btn-primary" onClick={() => startPractice(currentChapter, 'guided')}>
                    {_('guided_learning')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => startPractice(currentChapter, 'practice')}>
                    {_('self_practice')}
                  </button>
                  <button className="btn btn-outline" onClick={() => startPractice(currentChapter, 'review')}>
                    {_('view_solutions')}
                  </button>
                </div>

                {/* Question list */}
                <h3 style={{ marginBottom: 16 }}>
                  📋 {_('question_list')} ({questions.filter((q) => q.chapter === currentChapter.id).length} {_('questions_unit')})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {questions.filter((q) => q.chapter === currentChapter.id).map((q, idx) => {
                    const diffBadge = { easy: '🟢', medium: '🟡', hard: '🔴' }[q.difficulty || 'medium'] || '🟡';
                    const hasSim = !!CHAPTER_RESOURCES[currentChapter.id]?.question_sims?.[q.id];
                    return (
                      <div
                        key={q.id}
                        className="card"
                        style={{ padding: 16, cursor: 'pointer' }}
                        onClick={() => {
                          const chQ = questions.filter((cq) => cq.chapter === currentChapter.id).map(injectPhetSim);
                          setPracticeQuestions(chQ);
                          setCurrentQuestionIndex(idx);
                          setCurrentQuestion(injectPhetSim(q));
                          setSelectedAnswer(null);
                          setShowResult(false);
                          setThinkingGuideStep(0);
                          setPracticeMode('guided');
                          setCurrentView('practice');
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span>{diffBadge}</span>
                          <span style={{ flex: 1, fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: renderMath(q.question_text?.substring(0, 120) + ((q.question_text?.length || 0) > 120 ? '...' : '')) }} />
                          {hasSim && <span title="Có thí nghiệm mô phỏng" style={{ fontSize: '0.9rem' }}>🧪</span>}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>#{idx + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                  {questions.filter((q) => q.chapter === currentChapter.id).length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <div>{_('no_questions')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PRACTICE VIEW ===== */}
        {currentView === 'practice' && currentQuestion && (
          <div className="animate-fadeIn">
            <button className="back-btn" onClick={() => currentChapter ? navigateTo('chapter') : navigateTo('home')}>
              {_('back')}
            </button>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>{_('question_of', { current: currentQuestionIndex + 1, total: practiceQuestions.length })}</span>
                <span>{practiceMode === 'guided' ? _('mode_guided') : practiceMode === 'practice' ? _('mode_practice') : _('mode_review')}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${((currentQuestionIndex + 1) / practiceQuestions.length) * 100}%` }} />
              </div>
            </div>

            {/* Question */}
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              onSelectAnswer={handleSelectAnswer}
              renderMath={renderMath}
              lang={lang}
            />

            {/* Real World Connection — shown after answering */}
            {showResult && currentQuestion.real_world_connection && (
              <RealWorldCard
                connection={currentQuestion.real_world_connection}
                chapter={currentQuestion.chapter}
                renderMath={renderMath}
                lang={lang}
              />
            )}

            {/* Action buttons */}
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {!showResult && selectedAnswer && (
                <button className="btn btn-primary btn-lg" onClick={handleSubmitAnswer}>
                  {_('submit_answer')}
                </button>
              )}
              {showResult && (
                <>
                  <div style={{ width: '100%', marginBottom: 8 }}>
                    {String(selectedAnswer).toLowerCase() === String(currentQuestion.correct_answer).toLowerCase() ? (
                      <div className="result-correct">
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--success)', marginBottom: 8 }}>
                          {_('correct_answer')} {_('xp_gain', { xp: 10 })}
                        </div>
                        {currentQuestion.explanation && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8 }}>
                            <div style={{ marginBottom: 4 }}>
                              <strong>{lang === 'en' ? 'Explanation:' : 'Lời giải:'}</strong> {lang === 'en' && currentQuestion.explanation.summary_en ? currentQuestion.explanation.summary_en : currentQuestion.explanation.summary}
                            </div>
                            {currentQuestion.explanation.key_concept && (
                              <div style={{ fontStyle: 'italic', color: 'var(--primary-light)' }}>
                                💡 {lang === 'en' ? 'Key Concept:' : 'Ý chính:'} {lang === 'en' && currentQuestion.explanation.key_concept_en ? currentQuestion.explanation.key_concept_en : currentQuestion.explanation.key_concept}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="result-incorrect">
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--error)', marginBottom: 8 }}>
                          {_('wrong_answer')} {currentQuestion.correct_answer}
                        </div>
                        {currentQuestion.explanation && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8 }}>
                            <div style={{ marginBottom: 4 }}>
                              <strong>{lang === 'en' ? 'Explanation:' : 'Lời giải:'}</strong> {lang === 'en' && currentQuestion.explanation.summary_en ? currentQuestion.explanation.summary_en : currentQuestion.explanation.summary}
                            </div>
                            {currentQuestion.explanation.key_concept && (
                              <div style={{ fontStyle: 'italic', color: 'var(--primary-light)' }}>
                                💡 {lang === 'en' ? 'Key Concept:' : 'Ý chính:'} {lang === 'en' && currentQuestion.explanation.key_concept_en ? currentQuestion.explanation.key_concept_en : currentQuestion.explanation.key_concept}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button className="btn btn-primary" onClick={handleNextQuestion}>
                    {currentQuestionIndex + 1 < practiceQuestions.length ? _('next_question') : _('complete')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowThinkingGuide(!showThinkingGuide)}>
                    {showThinkingGuide ? _('hide_thinking') : _('show_thinking')}
                  </button>
                </>
              )}
            </div>

            {/* Thinking Guide */}
            {(practiceMode === 'guided' || (showResult && showThinkingGuide)) && (
              <ThinkingGuide
                guide={currentQuestion}
                currentStep={thinkingGuideStep}
                onStepChange={setThinkingGuideStep}
                mode={showResult ? 'review' : practiceMode}
                isVisible={showThinkingGuide}
                renderMath={renderMath}
                lang={lang}
              />
            )}
          </div>
        )}

        {/* ===== DASHBOARD VIEW ===== */}
        {currentView === 'dashboard' && (
          <Dashboard
            dashboard={dashboard}
            chapters={CHAPTERS}
            onNavigate={(view) => navigateTo(view)}
            errorNotebookSummary={errorNotebookSummary}
            lang={lang}
          />
        )}

        {/* ===== ERROR NOTEBOOK VIEW ===== */}
        {currentView === 'error_notebook' && (
          <div className="animate-fadeIn">
            <h2 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              📝 {_('error_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              {_('error_subtitle')}
            </p>

            <div className="dashboard-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-value">{errorNotebookEntries.length}</div>
                <div className="stat-label">{_('total_errors')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--warning)' }}>
                  {errorNotebookSummary?.dueEntries?.length || 0}
                </div>
                <div className="stat-label">{_('need_review')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                  {errorNotebookEntries.filter((e) => e.repetitions >= 3).length}
                </div>
                <div className="stat-label">{_('mastered')}</div>
              </div>
            </div>

            {(errorNotebookSummary?.dueEntries?.length || 0) > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12, color: 'var(--warning)' }}>⏰ {_('review_now')}</h3>
                {errorNotebookSummary.dueEntries.map((entry) => {
                  const qId = entry.questionId.startsWith('miuphysics.') ? entry.questionId.substring('miuphysics.'.length) : entry.questionId;
                  const matchedQ = questions.find(q => q.id === qId);
                  const questionText = matchedQ 
                    ? (lang === 'en' && matchedQ.question_text_en ? matchedQ.question_text_en : matchedQ.question_text)
                    : entry.questionId;
                  const explanationText = matchedQ
                    ? (matchedQ.explanation 
                        ? (lang === 'en' && matchedQ.explanation.summary_en ? matchedQ.explanation.summary_en : matchedQ.explanation.summary)
                        : '')
                    : entry.explanation;
                  
                  return (
                    <div key={entry.id || entry.questionId} className="error-notebook-card due">
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-heading)', fontSize: '0.95rem' }}
                          dangerouslySetInnerHTML={{ __html: renderMath(questionText) }}
                        />
                        {explanationText && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong>{lang === 'en' ? 'Explanation:' : 'Lời giải:'}</strong> <span dangerouslySetInnerHTML={{ __html: renderMath(explanationText) }} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-success" onClick={() => handleReviewError(entry, 5)}>{_('understood')}</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleReviewError(entry, 3)}>{_('okay')}</button>
                        <button className="btn btn-sm btn-error" onClick={() => handleReviewError(entry, 1)}>{_('not_understood')}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {errorNotebookEntries.length > 0 ? (
              <div>
                <h3 style={{ marginBottom: 12 }}>📋 {_('all_errors')}</h3>
                {errorNotebookEntries.map((entry) => {
                  const qId = entry.questionId.startsWith('miuphysics.') ? entry.questionId.substring('miuphysics.'.length) : entry.questionId;
                  const matchedQ = questions.find(q => q.id === qId);
                  const questionText = matchedQ 
                    ? (lang === 'en' && matchedQ.question_text_en ? matchedQ.question_text_en : matchedQ.question_text)
                    : entry.questionId;
                  const explanationText = matchedQ
                    ? (matchedQ.explanation 
                        ? (lang === 'en' && matchedQ.explanation.summary_en ? matchedQ.explanation.summary_en : matchedQ.explanation.summary)
                        : '')
                    : entry.explanation;

                  return (
                    <div key={entry.id || entry.questionId} className="error-notebook-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6, color: 'var(--text-heading)' }}
                            dangerouslySetInnerHTML={{ __html: renderMath(questionText) }}
                          />
                          {explanationText && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>
                              <strong>{lang === 'en' ? 'Explanation:' : 'Lời giải:'}</strong> <span dangerouslySetInnerHTML={{ __html: renderMath(explanationText) }} />
                            </div>
                          )}
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 8 }}>
                            {_('reviewed_times', { count: entry.repetitions || 0 })} • {_('interval_days', { days: entry.intervalDays || 1 })}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {entry.repetitions >= 3 ? (
                            <span className="badge badge-difficulty-easy">{_('mastered_badge')}</span>
                          ) : (
                            <span className="badge badge-difficulty-medium">{_('reviewing_badge')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🎉</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{_('no_errors_title')}</div>
                <div>{_('no_errors_desc')}</div>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigateTo('home')}>
                  {_('start_learning')}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '20px', borderTop: '1px solid var(--border)',
        color: 'var(--text-dim)', fontSize: '0.8rem',
      }}>
        <span>⚛️ {_('footer_text')}</span>
      </footer>
    </div>
  );
}
