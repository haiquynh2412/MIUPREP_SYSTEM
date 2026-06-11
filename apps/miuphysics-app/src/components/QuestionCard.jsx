import { useState } from 'react';

export default function QuestionCard({
  question,
  selectedAnswer,
  showResult,
  onSelectAnswer,
  renderMath,
  lang = 'vi',
}) {
  const [showSim, setShowSim] = useState(false);
  const [showTraps, setShowTraps] = useState(false);

  if (!question) return null;

  const diffLabels = {
    vi: { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' },
    en: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
  };
  const difficultyClass = `badge-difficulty-${question.difficulty || 'medium'}`;
  const difficultyLabel = (diffLabels[lang] || diffLabels.vi)[question.difficulty] || (lang === 'en' ? 'Medium' : 'Trung bình');

  const isCorrect = (key) =>
    showResult && String(question.correct_answer).toLowerCase() === String(key).toLowerCase();
  const isIncorrect = (key) =>
    showResult &&
    selectedAnswer &&
    String(selectedAnswer).toLowerCase() === String(key).toLowerCase() &&
    String(question.correct_answer).toLowerCase() !== String(key).toLowerCase();
  const isSelected = (key) =>
    !showResult && selectedAnswer && String(selectedAnswer).toLowerCase() === String(key).toLowerCase();

  const getOptionClass = (key) => {
    const classes = ['option-btn'];
    if (isCorrect(key)) classes.push('correct');
    else if (isIncorrect(key)) classes.push('incorrect');
    else if (isSelected(key)) classes.push('selected');
    if (showResult) classes.push('option-disabled');
    return classes.join(' ');
  };

  // Check if the answer is wrong
  const isWrongAnswer = showResult && selectedAnswer &&
    String(selectedAnswer).toLowerCase() !== String(question.correct_answer).toLowerCase();

  // Get common traps from thinking_guide, localized if available
  const rawTraps = lang === 'en'
    ? (question.thinking_guide?.common_traps_en || question.thinking_guide?.common_traps || [])
    : (question.thinking_guide?.common_traps || []);
  const commonTraps = Array.isArray(rawTraps) ? rawTraps : [rawTraps];

  const renderQuestionContent = () => {
    if (question.type === 'true_false') {
      return (
        <div className="options-grid">
          {[lang === 'en' ? 'True' : 'Đúng', lang === 'en' ? 'False' : 'Sai'].map((label, idx) => {
            const key = idx === 0 ? 'True' : 'False';
            return (
              <button
                key={key}
                className={getOptionClass(key)}
                onClick={() => !showResult && onSelectAnswer(key)}
                disabled={showResult}
              >
                <span className="option-key">{label === 'Đúng' || label === 'True' ? '✓' : '✗'}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (question.type === 'fill_in') {
      return (
        <div style={{ marginTop: 16 }}>
          <input
            type="text"
            placeholder={lang === 'en' ? 'Enter your answer...' : 'Nhập đáp án...'}
            value={selectedAnswer || ''}
            onChange={(e) => !showResult && onSelectAnswer(e.target.value)}
            disabled={showResult}
            style={{ maxWidth: 400 }}
          />
        </div>
      );
    }

    // Default: multiple_choice
    return (
      <div className="options-grid">
        {(question.options || []).map((opt) => {
          const key = typeof opt === 'string' ? opt : opt.key;
          const content = typeof opt === 'string' ? opt : (lang === 'en' && opt.content_en ? opt.content_en : opt.content);
          return (
            <button
              key={key}
              className={getOptionClass(key)}
              onClick={() => !showResult && onSelectAnswer(key)}
              disabled={showResult}
            >
              <span className="option-key">{key}</span>
              <span
                dangerouslySetInnerHTML={{ __html: renderMath(content || key) }}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="question-card animate-fadeIn">
      <div className="question-meta">
        <span className={`badge ${difficultyClass}`}>{difficultyLabel}</span>
        {question.chapter && (
          <span className="badge badge-chapter">{question.chapter.replace(/_/g, ' ')}</span>
        )}
        {question.grade && (
          <span className="badge badge-chapter">{lang === 'en' ? 'Grade' : 'Lớp'} {question.grade}</span>
        )}
      </div>
      <div
        className="question-text question-text-enlarged"
        dangerouslySetInnerHTML={{ __html: renderMath((lang === 'en' && question.question_text_en ? question.question_text_en : question.question_text) || '') }}
      />
      {question.image && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <img
            src={question.image}
            alt="Minh họa"
            style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 'var(--radius-md)' }}
          />
        </div>
      )}

      {/* ===== In-Question PhET Simulation ===== */}
      {question.phet_sim && (() => {
        const simTitle = lang === 'en' ? question.phet_sim.title : (question.phet_sim.titleVn || question.phet_sim.title);
        const separator = question.phet_sim.url.includes('?') ? '&' : '?';
        const localizedSimUrl = `${question.phet_sim.url}${separator}locale=${lang}`;
        const instructionText = lang === 'en' && question.phet_sim.instructionEn ? question.phet_sim.instructionEn : question.phet_sim.instruction;
        
        return (
          <div className="question-phet-panel">
            <button
              className="question-phet-toggle"
              onClick={() => setShowSim(!showSim)}
            >
              <span className="question-phet-toggle-icon">
                {showSim ? '🔽' : '▶️'}
              </span>
              <div className="question-phet-toggle-text">
                <span className="question-phet-toggle-title">
                  🧪 {simTitle}
                </span>
                <span className="question-phet-toggle-hint">
                  {showSim
                    ? (lang === 'en' ? 'Hide simulation' : 'Ẩn mô phỏng')
                    : (lang === 'en' ? 'Open simulation to explore!' : 'Mở thí nghiệm để khám phá!')}
                </span>
              </div>
              <span className="resource-badge resource-badge-phet" style={{ marginLeft: 'auto' }}>PhET</span>
            </button>

            {showSim && (
              <div className="question-phet-embed animate-fadeIn">
                {instructionText && (
                  <div className="question-phet-instruction">
                    💡 <strong>{lang === 'en' ? 'Instructions:' : 'Hướng dẫn:'}</strong> {instructionText}
                  </div>
                )}
                <div className="phet-embed-container">
                  <iframe
                    src={localizedSimUrl}
                    title={question.phet_sim.title}
                    className="phet-iframe"
                    allowFullScreen
                  />
                </div>
                <a
                  href={localizedSimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                  style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
                >
                  🔗 {lang === 'en' ? 'Open Fullscreen' : 'Mở toàn màn hình'}
                </a>
              </div>
            )}
          </div>
        );
      })()}

      {renderQuestionContent()}

      {/* ===== Common Traps Alert (shown on wrong answer) ===== */}
      {isWrongAnswer && commonTraps.length > 0 && (
        <div className="common-traps-panel animate-fadeIn">
          <button
            className="common-traps-toggle"
            onClick={() => setShowTraps(!showTraps)}
          >
            <span>⚠️</span>
            <span style={{ flex: 1, fontWeight: 600 }}>
              {lang === 'en' ? 'Watch out for common traps!' : 'Cảnh giác bẫy thường gặp!'}
            </span>
            <span>{showTraps ? '▲' : '▼'}</span>
          </button>
          {showTraps && (
            <div className="common-traps-list">
              {commonTraps.map((trap, i) => (
                <div key={i} className="common-trap-item">
                  <span className="trap-number">⚡ {i + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: renderMath(trap) }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
