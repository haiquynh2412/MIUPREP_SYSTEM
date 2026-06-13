function ExamQuestionNavigator({
  activeQuestions,
  currentQuestionIndex,
  examAnswers,
  examFinished,
  setCurrentQuestionIndex,
}) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <h4
        style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#064e3b',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px',
          marginBottom: '12px',
        }}
      >
        📋 Phiếu trả lời
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {activeQuestions.map((question, index) => {
          const isDone = !!examAnswers[question.id];
          const isActive = index === currentQuestionIndex;
          let background = '#ffffff';
          let color = '#475569';
          let borderColor = 'var(--color-border)';

          if (isDone) {
            background = 'var(--color-primary)';
            color = '#ffffff';
            borderColor = 'var(--color-primary)';
          }
          if (isActive) {
            borderColor = '#ef4444';
          }
          if (examFinished) {
            const isCorrect =
              (examAnswers[question.id] || '').trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
            background = isCorrect ? '#ecfdf5' : '#fef2f2';
            color = isCorrect ? '#10b981' : '#ef4444';
            borderColor = isCorrect ? '#10b981' : '#ef4444';
          }

          return (
            <button
              key={question.id}
              style={{
                height: '36px',
                borderRadius: '8px',
                border: `2px solid ${borderColor}`,
                background,
                color,
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExamExplanation({ currentQuestion, examAnswers, renderMath }) {
  return (
    <div
      style={{
        marginTop: '20px',
        borderTop: '2px dashed var(--color-border)',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          background: '#ecfdf5',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #10b981',
          color: '#065f46',
          fontWeight: 600,
        }}
      >
        ✔️ Đáp án đúng của Miu: <strong>{currentQuestion.correct_answer}</strong> (Đáp án của bạn:{' '}
        {examAnswers[currentQuestion.id] || 'Không có'})
      </div>

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

      <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecdd3' }}>
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
    </div>
  );
}

function ExamActiveQuestion({
  currentQuestion,
  currentQuestionIndex,
  activeQuestions,
  examFinished,
  examAnswers,
  setExamAnswers,
  setCurrentQuestionIndex,
  renderMath,
}) {
  if (!currentQuestion) return null;

  return (
    <div className="card">
      <div
        style={{
          fontWeight: 700,
          color: '#15803d',
          fontSize: '0.9rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px',
          marginBottom: '16px',
        }}
      >
        Câu hỏi số {currentQuestionIndex + 1}
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

      {currentQuestion.type === 'multiple_choice' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          {currentQuestion.options.map((option) => {
            const isSelected = examAnswers[currentQuestion.id] === option.key;

            return (
              <div
                key={option.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary-soft)' : '#ffffff',
                  cursor: examFinished ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition)',
                }}
                onClick={() => {
                  if (examFinished) return;
                  setExamAnswers((previousAnswers) => ({ ...previousAnswers, [currentQuestion.id]: option.key }));
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
        </div>
      ) : (
        <div style={{ marginTop: '16px' }}>
          <input
            type="text"
            className="math-input"
            placeholder="Điền đáp số cuối cùng của bạn tại đây..."
            value={examAnswers[currentQuestion.id] || ''}
            onChange={(event) => {
              if (examFinished) return;
              setExamAnswers((previousAnswers) => ({ ...previousAnswers, [currentQuestion.id]: event.target.value }));
            }}
            disabled={examFinished}
          />
        </div>
      )}

      {examFinished && (
        <ExamExplanation currentQuestion={currentQuestion} examAnswers={examAnswers} renderMath={renderMath} />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '16px',
        }}
      >
        <button
          className="btn btn-secondary"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((previousIndex) => previousIndex - 1)}
        >
          👈 Câu trước
        </button>
        <button
          className="btn btn-secondary"
          disabled={currentQuestionIndex === activeQuestions.length - 1}
          onClick={() => setCurrentQuestionIndex((previousIndex) => previousIndex + 1)}
        >
          Câu tiếp theo 👉
        </button>
      </div>
    </div>
  );
}

export default function MathExamRoom({
  selectedExamId,
  activeQuestions,
  currentQuestion,
  currentQuestionIndex,
  examFinished,
  examTimeRemaining,
  formatTime,
  handleFinishExam,
  handleBackToDashboard,
  examScore,
  examAnalysis,
  examAnswers,
  setExamAnswers,
  setCurrentQuestionIndex,
  renderMath,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '16px',
          borderRadius: '16px',
          border: '2px solid var(--color-border)',
        }}
      >
        <div>
          <h3 style={{ color: '#064e3b', fontWeight: 800, fontSize: '1.2rem' }}>
            Đang thi thử: Đề số {selectedExamId.toString().padStart(2, '0')}
          </h3>
          <p style={{ color: '#15803d', fontSize: '0.85rem' }}>Số lượng: {activeQuestions.length} câu</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!examFinished ? (
            <>
              <div
                style={{
                  background: '#fef2f2',
                  border: '2px solid #fecdd3',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                }}
              >
                ⏱️ {formatTime(examTimeRemaining)}
              </div>
              <button className="btn btn-primary" onClick={handleFinishExam}>
                ✔️ Nộp bài thi
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={handleBackToDashboard}>
              ⬅️ Bảng điều khiển
            </button>
          )}
        </div>
      </div>

      {examFinished && (
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #e6f7f0 100%)',
          }}
        >
          <h4 style={{ color: '#064e3b', fontSize: '1.3rem', fontWeight: 800 }}>🏆 KẾT QUẢ THI THỬ CỦA BẠN</h4>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#15803d' }}>
            Điểm số:{' '}
            <strong style={{ color: '#10b981', fontSize: '2rem' }}>
              {((examScore / activeQuestions.length) * 10).toFixed(1)}
            </strong>{' '}
            / 10 điểm (Đúng {examScore}/{activeQuestions.length} câu)
          </p>

          <div>
            <h5 style={{ fontWeight: 700, color: '#064e3b', marginBottom: '8px' }}>
              📊 Phân tích năng lực theo Chuyên đề:
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {examAnalysis.map((stat) => (
                <div
                  key={stat.category}
                  style={{
                    background: '#ffffff',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <h6 style={{ fontWeight: 600, color: '#064e3b', fontSize: '0.9rem' }}>{stat.category_vn}</h6>
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}
                  >
                    <span style={{ fontSize: '0.85rem', color: '#15803d' }}>
                      Đúng {stat.correct}/{stat.total}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: stat.rate >= 80 ? '#10b981' : stat.rate >= 50 ? '#fb923c' : '#ef4444',
                      }}
                    >
                      {stat.rate}% {stat.rate >= 80 ? '🔥 Rất tốt' : stat.rate >= 50 ? '⚠️ Cần rà' : '🚨 Rất yếu'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 280px)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <ExamActiveQuestion
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          activeQuestions={activeQuestions}
          examFinished={examFinished}
          examAnswers={examAnswers}
          setExamAnswers={setExamAnswers}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          renderMath={renderMath}
        />

        <ExamQuestionNavigator
          activeQuestions={activeQuestions}
          currentQuestionIndex={currentQuestionIndex}
          examAnswers={examAnswers}
          examFinished={examFinished}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
        />
      </div>
    </div>
  );
}
