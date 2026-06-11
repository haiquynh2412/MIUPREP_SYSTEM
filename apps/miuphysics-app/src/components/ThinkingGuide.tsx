import { useState } from 'react';
import { t } from '../data/i18n.js';

const STEPS = [
  { key: 'understand', icon: '📖', title: 'Hiểu đề', titleEn: 'Understand' },
  { key: 'identify_knowledge', icon: '🔍', title: 'Kiến thức', titleEn: 'Knowledge' },
  { key: 'plan', icon: '📋', title: 'Kế hoạch', titleEn: 'Plan' },
  { key: 'steps', icon: '✏️', title: 'Thực hiện', titleEn: 'Execute' },
  { key: 'verify', icon: '✅', title: 'Kiểm tra', titleEn: 'Verify' },
  { key: 'extend', icon: '🚀', title: 'Mở rộng', titleEn: 'Extend' },
];

const DEFAULT_EXPLANATIONS = {
  vi: {
    understand: 'Đọc kỹ đề bài, xác định các đại lượng đã cho và cần tìm.',
    identify_knowledge: 'Xác định các công thức và kiến thức liên quan.',
    plan: 'Lập kế hoạch giải: xác định trình tự các bước cần thực hiện.',
    steps: 'Thực hiện từng bước theo kế hoạch, tính toán cẩn thận.',
    verify: 'Kiểm tra lại đơn vị, thứ nguyên và kết quả.',
    extend: 'Suy nghĩ mở rộng: bài toán có thể áp dụng vào đâu?',
  },
  en: {
    understand: 'Read the question carefully, identify the given values and what needs to be found.',
    identify_knowledge: 'Identify relevant formulas and concepts.',
    plan: 'Formulate a plan: decide the sequence of steps to execute.',
    steps: 'Execute steps according to the plan, perform calculations carefully.',
    verify: 'Double check units, dimensions, and the final result.',
    extend: 'Think deeper: how can this problem be applied in real life?',
  },
};

export default function ThinkingGuide({
  guide,
  currentStep = 0,
  onStepChange,
  mode = 'guided',
  isVisible = true,
  renderMath,
  lang = 'vi',
}: any) {
  const [expanded, setExpanded] = useState(true);
  const [hintLevel, setHintLevel] = useState(0);

  if (!guide || !isVisible) return null;

  const isStepUnlocked = (index) => {
    if (mode === 'review') return true;
    if (mode === 'practice') return false;
    return index <= currentStep;
  };

  const isStepCompleted = (index) => {
    if (mode === 'review') return true;
    return index < currentStep;
  };

  const isStepCurrent = (index) => {
    if (mode === 'review') return false;
    return index === currentStep;
  };

  const getStepContent = (step) => {
    if (!guide) return '';
    const tg = guide.thinking_guide || {};
    const explanation = guide.explanation || guide;
    const defaults = DEFAULT_EXPLANATIONS[lang] || DEFAULT_EXPLANATIONS.vi;

    // Use translation versions if available in guide (e.g. understandEn)
    const suffix = lang === 'en' ? 'En' : '';
    const keyWithLang = `${step.key}${suffix}`;

    switch (step.key) {
      case 'understand':
        return tg[keyWithLang] || tg.understand || explanation[keyWithLang] || explanation.understand || explanation.thinking || defaults.understand;
      case 'identify_knowledge':
        return tg[keyWithLang] || tg.identify_knowledge || explanation[keyWithLang] || explanation.identify_knowledge || explanation.knowledge || defaults.identify_knowledge;
      case 'plan':
        return tg[keyWithLang] || tg.plan || explanation[keyWithLang] || explanation.plan || defaults.plan;
      case 'steps':
        const stepsVal = tg[keyWithLang] || tg.steps || explanation[keyWithLang] || explanation.steps;
        return (Array.isArray(stepsVal) ? stepsVal.join('\n') : stepsVal) || defaults.steps;
      case 'verify':
        return tg[keyWithLang] || tg.verify || explanation[keyWithLang] || explanation.verify || defaults.verify;
      case 'extend':
        return tg[keyWithLang] || tg.extend || explanation[keyWithLang] || explanation.extend || explanation.traps || defaults.extend;
      default:
        return '';
    }
  };

  const getIndicatorContent = (index) => {
    if (isStepCompleted(index)) return '✅';
    if (isStepCurrent(index)) return '▶';
    return '🔒';
  };

  const getIndicatorClass = (index) => {
    if (isStepCompleted(index)) return 'step-indicator completed';
    if (isStepCurrent(index)) return 'step-indicator current';
    return 'step-indicator locked';
  };

  const handleStepClick = (index) => {
    if (mode === 'review') return;
    if (mode === 'guided' && index === currentStep + 1 && onStepChange) {
      onStepChange(index);
    }
  };

  const hints: any[] = [];
  const tgHints = guide?.thinking_guide?.hints || [];
  if (Array.isArray(tgHints) && tgHints.length > 0) {
    tgHints.forEach(h => {
      // support hintEn or translation object
      const text = lang === 'en' && typeof h === 'object' && h.en ? h.en : (typeof h === 'object' ? h.vi || h.text : h);
      hints.push(text);
    });
  } else {
    // legacy format
    const prefix = lang === 'en' ? 'hintEn' : 'hint';
    for (let i = 1; i <= 3; i++) {
      const legacyKey = `${prefix}${i}`;
      const fallbackKey = `hint${i}`;
      const legacyHint = guide?.explanation?.[legacyKey] || guide?.[legacyKey] || guide?.explanation?.[fallbackKey] || guide?.[fallbackKey];
      if (legacyHint) hints.push(legacyHint);
    }
  }

  const traps = lang === 'en'
    ? (guide?.thinking_guide?.common_traps_en || guide?.explanation?.traps_en || guide?.traps_en || '')
    : '';
  const finalTraps = traps || (guide?.thinking_guide?.common_traps
    ? (Array.isArray(guide.thinking_guide.common_traps) ? guide.thinking_guide.common_traps.join('\n') : guide.thinking_guide.common_traps)
    : (guide?.explanation?.traps || guide?.traps || ''));

  const safeRender = (text) => {
    if (renderMath) return renderMath(String(text || ''));
    return String(text || '');
  };

  return (
    <div className="thinking-guide animate-slideUp">
      <div className="thinking-guide-header" onClick={() => setExpanded(!expanded)}>
        <h3>🧠 {t('thinking_guide_title', lang)}</h3>
        <span style={{ fontSize: '1.2rem', transition: 'transform 0.3s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </div>

      {expanded && (
        <div>
          {STEPS.map((step, index) => {
            const title = lang === 'en' ? step.titleEn : step.title;
            return (
              <div key={step.key} className="thinking-step">
                <div
                  className="thinking-step-header"
                  onClick={() => handleStepClick(index)}
                  style={{ cursor: mode === 'guided' && index === currentStep + 1 ? 'pointer' : 'default' }}
                >
                  <span className={getIndicatorClass(index)}>{getIndicatorContent(index)}</span>
                  <div>
                    <div className="step-title">{step.icon} {title}</div>
                  </div>
                </div>

                {isStepUnlocked(index) && (isStepCurrent(index) || isStepCompleted(index) || mode === 'review') ? (
                  <div
                    className="step-content"
                    dangerouslySetInnerHTML={{ __html: safeRender(getStepContent(step)) }}
                  />
                ) : (
                  mode === 'guided' && index === currentStep + 1 && (
                    <div className="step-locked-msg">
                      {t('thinking_guide_locked_hint', lang)}
                    </div>
                  )
                )}
              </div>
            );
          })}

          {/* Hints Section */}
          {hints.length > 0 && (
            <div className="hints-section" style={{ margin: '12px 20px 16px' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--warning)' }}>{t('thinking_guide_hints', lang)}</div>
              {hints.slice(0, hintLevel + 1).map((hint, i) => (
                <div key={i} className="hint-item">
                  <span>💡</span>
                  <span dangerouslySetInnerHTML={{ __html: safeRender(hint) }} />
                </div>
              ))}
              {hintLevel < hints.length - 1 && (
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ marginTop: 8 }}
                  onClick={() => setHintLevel((prev) => Math.min(prev + 1, hints.length - 1))}
                >
                  {t('thinking_guide_next_hint', lang, { current: hintLevel + 2, total: hints.length })}
                </button>
              )}
            </div>
          )}

          {/* Traps Section */}
          {finalTraps && mode === 'review' && (
            <div className="traps-section" style={{ margin: '0 20px 16px' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--error)' }}>{t('thinking_guide_traps', lang)}</div>
              <div dangerouslySetInnerHTML={{ __html: safeRender(finalTraps) }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
