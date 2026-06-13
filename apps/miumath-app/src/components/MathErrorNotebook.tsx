function TrapActionButtons({
  currentQuestion,
  hintLevel,
  isAnswerCorrect,
  userAnswers,
  handleSubmitAnswer,
  handleBuyHint,
  handleBuySolution,
  isFillInBlank = false,
}) {
  const questionId = currentQuestion.id;
  const level = hintLevel[questionId] || 0;
  const hasAnswer = isFillInBlank ? (userAnswers[questionId] || '').trim() : userAnswers[questionId];

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
      {!isAnswerCorrect[questionId] && hintLevel[questionId] !== 2 && (
        <button className="btn btn-primary" onClick={() => handleSubmitAnswer(questionId)} disabled={!hasAnswer}>
          {hintLevel[questionId] === 1
            ? isFillInBlank
              ? '💡 Điền lại đáp án lần 2'
              : '💡 Nộp bài lại lần 2'
            : '⚡ Giải lại bẫy này'}
        </button>
      )}

      {level === 0 && (
        <button
          className="btn"
          style={{
            background: '#fffbeb',
            border: '1px solid #d97706',
            color: '#b45309',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '12px',
          }}
          onClick={() => handleBuyHint(questionId)}
        >
          💡 Mua Gợi ý (-15 🐟)
        </button>
      )}
      {level < 2 && (
        <button
          className="btn"
          style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#047857',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '12px',
          }}
          onClick={() => handleBuySolution(questionId)}
        >
          🔓 Mua Lời giải chi tiết (-30 🐟)
        </button>
      )}
    </div>
  );
}

export default function MathErrorNotebook({
  userName,
  currentQuestion,
  currentQuestionIndex,
  activeQuestions,
  renderMath,
  userAnswers,
  setUserAnswers,
  hintLevel,
  isAnswerCorrect,
  handleSubmitAnswer,
  handleBuyHint,
  handleBuySolution,
  understoodList,
  saveUnderstood,
  spentCoinsMap,
  fishCoins,
  saveFishCoins,
  triggerMascotReaction,
  setCurrentQuestionIndex,
  handleBackToDashboard,
}) {
  const markCurrentTrapUnderstood = () => {
    const questionId = currentQuestion.id;
    if (understoodList.includes(questionId)) return;

    saveUnderstood([...understoodList, questionId]);

    const spent = spentCoinsMap[questionId] || 0;
    const refund = Math.ceil(spent * 0.5);

    if (refund > 0) {
      saveFishCoins(fishCoins + refund);
      triggerMascotReaction(
        'success',
        `Meow meow! ${userName} tự học xuất sắc quá! Miu hoàn lại ${refund} xu cá hồi 🐟 (50% của ${spent} xu) cho ${userName} nhé! 🐾💖`,
      );
      return;
    }

    triggerMascotReaction(
      'success',
      `Miu vô cùng vui sướng vì ${userName} đã tự học và hiểu bài meow! Cố gắng giải đúng các câu tiếp theo nhé! 🐾💖`,
    );
  };

  const goToPreviousTrap = () => {
    setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
    triggerMascotReaction('idle');
  };

  const goToNextTrap = () => {
    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    triggerMascotReaction('idle');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button className="btn btn-secondary" onClick={handleBackToDashboard}>
          ⬅️ Trở lại Bảng điều khiển
        </button>
        <h3 style={{ color: '#064e3b', fontWeight: 800, fontSize: '1.2rem' }}>
          📓 Sổ Tay Bẫy Chuột (Các câu đã làm sai meow)
        </h3>
      </div>

      <div className="card" style={{ background: '#fef2f2', borderColor: '#fecdd3' }}>
        <p style={{ fontSize: '0.92rem', color: '#991b1b' }}>
          🐱 <strong>Mèo Miu khuyên học tập</strong>: Đây là danh sách các cạm bẫy {userName} đã vướng phải trong các
          bài tập! Hãy ôn luyện giải lại các câu này theo chu kỳ <strong>1 ngày, 3 ngày, 7 ngày</strong> để khắc cốt ghi
          tâm meow meow!
        </p>
      </div>

      {currentQuestion ? (
        <div className="card">
          <div
            style={{
              fontWeight: 700,
              color: '#ef4444',
              fontSize: '0.9rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '8px',
              marginBottom: '16px',
            }}
          >
            Bẫy số {currentQuestionIndex + 1} / {activeQuestions.length} ({currentQuestion.category_vn})
          </div>

          <div
            style={{ fontSize: '1.05rem', fontWeight: 500, color: '#064e3b' }}
            dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.question_text) }}
          />

          {currentQuestion.image && (
            <div
              style={{
                margin: '14px 0',
                textAlign: 'center',
                background: '#ffffff',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
              }}
            >
              <img
                src={currentQuestion.image}
                alt="Hình vẽ minh họa"
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
              />
            </div>
          )}

          {currentQuestion.type === 'multiple_choice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {currentQuestion.options.map((option) => {
                const isSelected = userAnswers[currentQuestion.id] === option.key;
                const isSubmitted = hintLevel[currentQuestion.id] === 2;
                const isWrongAnswer = isSubmitted && isSelected && !isAnswerCorrect[currentQuestion.id];
                const isCorrectAnswer = isSubmitted && option.key === currentQuestion.correct_answer;

                let background = '#ffffff';
                let borderColor = 'var(--color-border)';
                if (isSelected) {
                  background = 'var(--color-primary-soft)';
                  borderColor = 'var(--color-primary)';
                }
                if (isCorrectAnswer) {
                  background = '#ecfdf5';
                  borderColor = '#10b981';
                } else if (isWrongAnswer) {
                  background = '#fef2f2';
                  borderColor = '#ef4444';
                }

                return (
                  <div
                    key={option.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 20px',
                      borderRadius: '16px',
                      border: `2px solid ${borderColor}`,
                      background,
                      cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onClick={() => {
                      if (isSubmitted) return;
                      setUserAnswers((previousAnswers) => ({ ...previousAnswers, [currentQuestion.id]: option.key }));
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isSelected ? 'var(--color-primary)' : '#cbd5e1',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        background: isSelected ? 'var(--color-primary)' : 'transparent',
                        color: isSelected ? '#ffffff' : '#475569',
                      }}
                    >
                      {option.key}
                    </span>
                    <div
                      style={{ color: '#064e3b', fontWeight: 500 }}
                      dangerouslySetInnerHTML={{ __html: renderMath(option.content) }}
                    />
                  </div>
                );
              })}

              <TrapActionButtons
                currentQuestion={currentQuestion}
                hintLevel={hintLevel}
                isAnswerCorrect={isAnswerCorrect}
                userAnswers={userAnswers}
                handleSubmitAnswer={handleSubmitAnswer}
                handleBuyHint={handleBuyHint}
                handleBuySolution={handleBuySolution}
              />
            </div>
          )}

          {currentQuestion.type === 'fill_in_the_blank' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <input
                type="text"
                className="math-input"
                placeholder="Điền đáp số đúng của bạn..."
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(event) => {
                  if (hintLevel[currentQuestion.id] === 2) return;
                  setUserAnswers((previousAnswers) => ({
                    ...previousAnswers,
                    [currentQuestion.id]: event.target.value,
                  }));
                }}
                disabled={hintLevel[currentQuestion.id] === 2}
              />

              <TrapActionButtons
                currentQuestion={currentQuestion}
                hintLevel={hintLevel}
                isAnswerCorrect={isAnswerCorrect}
                userAnswers={userAnswers}
                handleSubmitAnswer={handleSubmitAnswer}
                handleBuyHint={handleBuyHint}
                handleBuySolution={handleBuySolution}
                isFillInBlank
              />
            </div>
          )}

          {hintLevel[currentQuestion.id] >= 1 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '12px',
                borderTop: '2px dashed var(--color-border)',
                paddingTop: '20px',
              }}
            >
              <div
                style={{
                  background: 'var(--color-accent-cream)',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #fef3c7',
                }}
              >
                <h5
                  style={{
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.98rem',
                    marginBottom: '6px',
                  }}
                >
                  💡 Cách tư duy giải quyết bài toán:
                </h5>
                <div
                  style={{ fontSize: '0.92rem', color: '#78350f' }}
                  dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.thinking) }}
                />
              </div>

              {hintLevel[currentQuestion.id] === 2 && (
                <>
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '2px solid var(--color-border)',
                    }}
                  >
                    <h5
                      style={{
                        color: '#064e3b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.98rem',
                        marginBottom: '8px',
                      }}
                    >
                      📝 Các bước giải chi tiết (Kiến thức THCS Lớp 9):
                    </h5>
                    <div
                      style={{ fontSize: '0.92rem', color: '#0f766e' }}
                      dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.steps) }}
                    />
                  </div>

                  <div
                    style={{
                      background: '#fef2f2',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #fecdd3',
                    }}
                  >
                    <h5
                      style={{
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.98rem',
                        marginBottom: '6px',
                      }}
                    >
                      ⚠️ Cạm bẫy học sinh cần tránh:
                    </h5>
                    <div
                      style={{ fontSize: '0.92rem', color: '#991b1b' }}
                      dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.traps) }}
                    />
                  </div>

                  {currentQuestion.explanation.casio && (
                    <div
                      style={{
                        background: 'var(--color-primary-soft)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <h5
                        style={{
                          color: '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.98rem',
                          marginBottom: '6px',
                        }}
                      >
                        🧮 Hướng dẫn thủ thuật máy tính Casio FX-580VN X:
                      </h5>
                      <div
                        style={{ fontSize: '0.92rem', color: '#065f46' }}
                        dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.casio) }}
                      />
                    </div>
                  )}
                </>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ecfdf5',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  border: '1px solid #a7f3d0',
                  marginTop: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>😸</span>
                  <div>
                    <strong style={{ color: '#065f46', fontSize: '0.92rem', display: 'block' }}>
                      Đã hiểu cạm bẫy chưa meow?
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                      Tích đã hiểu để nhận lại 50% số xu cá hồi đã dùng mở khóa gợi ý/lời giải!
                    </span>
                  </div>
                </div>
                <button
                  className="btn"
                  disabled={understoodList.includes(currentQuestion.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    background: understoodList.includes(currentQuestion.id) ? '#e6f7f0' : '#10b981',
                    color: understoodList.includes(currentQuestion.id) ? '#047857' : '#ffffff',
                    border: 'none',
                    cursor: understoodList.includes(currentQuestion.id) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: understoodList.includes(currentQuestion.id)
                      ? 'none'
                      : '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={markCurrentTrapUnderstood}
                >
                  {understoodList.includes(currentQuestion.id) ? '✔️ Đã hiểu meow!' : '🐾 Đã hiểu meow!'}
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '16px',
            }}
          >
            <button className="btn btn-secondary" disabled={currentQuestionIndex === 0} onClick={goToPreviousTrap}>
              👈 Câu trước
            </button>
            <button
              className="btn btn-secondary"
              disabled={currentQuestionIndex === activeQuestions.length - 1}
              onClick={goToNextTrap}
            >
              Câu tiếp theo 👉
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontWeight: 600, color: '#15803d' }}>🐾 Sạch bóng bẫy chuột meow meow! Sen quá giỏi!</p>
          <button className="btn btn-primary" onClick={handleBackToDashboard}>
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
