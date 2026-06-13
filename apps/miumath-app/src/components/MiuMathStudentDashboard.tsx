export default function MiuMathStudentDashboard({
  userName,
  saveUserName,
  grade,
  learningDashboard,
  recommendationLabel,
  masteryStatusLabel,
  startAdaptiveDiagnostic,
  openRecommendedQuestion,
  chuyenDeList,
  questions,
  setSelectedChuyenDe,
  setSelectedSubCategory,
  setDiagnosticQuestionIds,
  setCurrentQuestionIndex,
  setMode,
  triggerMascotReaction,
  handleStartExam,
}) {
  const CHUYEN_DE_LIST = chuyenDeList;

  return (
    <>
      {/* Welcoming Mascot Jumbotron */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fdfb 100%)',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        <div style={{ background: '#e6f7f0', padding: '16px', borderRadius: '50%' }}>
          <span style={{ fontSize: '2.5rem' }}>🎓</span>
        </div>
        <div>
          <h2
            style={{
              fontSize: '1.4rem',
              color: '#064e3b',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            Chào mừng
            <input
              type="text"
              value={userName}
              onChange={(e) => saveUserName(e.target.value)}
              placeholder="tên của bạn..."
              style={{
                border: 'none',
                borderBottom: '2px dashed #10b981',
                background: 'transparent',
                color: '#10b981',
                fontWeight: 800,
                outline: 'none',
                width: '140px',
                padding: '0 4px',
                textAlign: 'center',
                fontSize: '1.35rem',
              }}
              title="Bấm để thay đổi tên của bạn meow!"
            />
            đến với MiuMath của {grade}!
          </h2>
          <p style={{ color: '#15803d', fontSize: '0.95rem' }}>
            Cùng mèo Miu vượt qua mọi thử thách cạm bẫy toán học thi vào 10 chuyên meow! Hãy chọn một hướng học tập dưới
            đây.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          background: '#ffffff',
          border: '2px solid rgba(16, 185, 129, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ color: '#047857', fontSize: '0.78rem', fontWeight: 800, letterSpacing: 0 }}>
              ADAPTIVE LEARNING CORE
            </span>
            <h3 style={{ color: '#064e3b', fontSize: '1.18rem', fontWeight: 800, margin: '4px 0' }}>
              Knowledge Graph + Mastery Model
            </h3>
            <p style={{ color: '#15803d', fontSize: '0.9rem', margin: 0 }}>
              Du lieu luyen tap hien duoc ghi vao learning core chung de tinh diem thanh thao va goi y bai tiep theo.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: 800 }}
              onClick={startAdaptiveDiagnostic}
            >
              Lam diagnostic
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: 800 }}
              onClick={openRecommendedQuestion}
            >
              Mo bai goi y
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#f0faf5', padding: '12px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
            <span style={{ color: '#047857', fontSize: '0.74rem', fontWeight: 800 }}>ATTEMPTS</span>
            <strong style={{ display: 'block', color: '#064e3b', fontSize: '1.35rem', marginTop: '4px' }}>
              {learningDashboard.totalAttempts}
            </strong>
          </div>
          <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
            <span style={{ color: '#c2410c', fontSize: '0.74rem', fontWeight: 800 }}>CAN SUA LOI</span>
            <strong style={{ display: 'block', color: '#9a3412', fontSize: '1.35rem', marginTop: '4px' }}>
              {learningDashboard.repairSkills}
            </strong>
          </div>
          <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <span style={{ color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 800 }}>ON DINH</span>
            <strong style={{ display: 'block', color: '#1e3a8a', fontSize: '1.35rem', marginTop: '4px' }}>
              {learningDashboard.stableSkills}
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#475569', fontSize: '0.74rem', fontWeight: 800 }}>NEXT</span>
            <strong style={{ display: 'block', color: '#0f172a', fontSize: '1rem', marginTop: '7px' }}>
              {recommendationLabel(learningDashboard.recommendation.kind)}
            </strong>
          </div>
        </div>

        {learningDashboard.topRows.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {learningDashboard.topRows.map((row) => (
              <div
                key={row.key}
                style={{ border: '1px solid #e6f7f0', borderRadius: '12px', padding: '10px', background: '#ffffff' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                  <strong style={{ color: '#064e3b', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>{row.id}</strong>
                  <span
                    style={{
                      color: row.status === 'repair' ? '#dc2626' : '#047857',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {masteryStatusLabel(row.status)}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: '8px',
                    height: '8px',
                    background: '#e6f7f0',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${row.score}%`,
                      height: '100%',
                      background: row.status === 'repair' ? '#fb923c' : '#10b981',
                    }}
                  ></div>
                </div>
                <small style={{ display: 'block', color: '#64748b', marginTop: '6px' }}>
                  Score {row.score}% | Accuracy {row.accuracy}% | {row.attempts} attempts
                </small>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              color: '#475569',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            Chua co du lieu mastery. Hay lam diagnostic hoac vai cau chuyen de de he thong bat dau ca nhan hoa.
          </div>
        )}

        {(learningDashboard.learningPath?.steps || []).length > 0 && (
          <div style={{ border: '1px solid #dbeafe', borderRadius: '12px', padding: '12px', background: '#f8fbff' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                marginBottom: '10px',
              }}
            >
              <div>
                <span style={{ color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 800 }}>LEARNING PATH</span>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.98rem', marginTop: '3px' }}>
                  Next: {learningDashboard.learningPath?.nextStep?.label || 'Mixed challenge'}
                </strong>
              </div>
              <span style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700 }}>
                {learningDashboard.learningPath?.steps?.length || 0} buoc
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px' }}>
              {(learningDashboard.learningPath?.steps || []).map((step, index) => (
                <div
                  key={step.id}
                  style={{
                    background: '#ffffff',
                    border: step.target ? '1px solid #60a5fa' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px',
                    minHeight: '112px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: step.status === 'repair' ? '#ffedd5' : '#eff6ff',
                        color: step.status === 'repair' ? '#c2410c' : '#1d4ed8',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        flex: '0 0 auto',
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      style={{ color: step.unlocked ? '#047857' : '#64748b', fontSize: '0.72rem', fontWeight: 800 }}
                    >
                      {step.unlocked ? 'OPEN' : 'LOCKED'}
                    </span>
                  </div>
                  <strong
                    style={{
                      display: 'block',
                      color: '#0f172a',
                      fontSize: '0.84rem',
                      marginTop: '8px',
                      lineHeight: 1.35,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {step.label}
                  </strong>
                  <small
                    style={{
                      display: 'block',
                      color: step.status === 'repair' ? '#c2410c' : '#475569',
                      marginTop: '6px',
                      fontWeight: 700,
                    }}
                  >
                    {masteryStatusLabel(step.status)} | {step.masteryScore}% | {step.attempts} attempts
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Study Track 1: Learn & Practice by Topic/Theme */}
      <div>
        <h3 style={{ margin: '20px 0 12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="decor-paw"></span> Hướng 1: Tự Học & Luyện Tập Chuyên Đề
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {CHUYEN_DE_LIST.map((cd, index) => {
            // Count number of questions for this topic
            const qCount =
              cd.id === 'casio-hacks'
                ? questions.filter((q) => q.category === 'casio-hacks' || (q.explanation && q.explanation.casio)).length
                : questions.filter((q) => q.category === cd.id).length;
            return (
              <div
                key={cd.id}
                className="card"
                style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                onClick={() => {
                  if (qCount === 0) {
                    triggerMascotReaction(
                      'idle',
                      'Chuyên đề này hiện đang được mèo Miu số hóa meow! Sen thử ôn tập chuyên đề khác nhé!',
                    );
                    return;
                  }
                  setSelectedChuyenDe(index);
                  setSelectedSubCategory('all');
                  setDiagnosticQuestionIds([]);
                  setCurrentQuestionIndex(0);
                  setMode('chuyen_de');
                  triggerMascotReaction(
                    'idle',
                    `Bắt đầu học chuyên đề '${cd.name}' meow! Hãy xem tóm tắt lý thuyết trước nhé!`,
                  );
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontSize: '1.8rem', background: '#e6f7f0', padding: '8px', borderRadius: '12px' }}>
                    {cd.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: '#10b981',
                      fontWeight: 700,
                      background: '#e6f7f0',
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {qCount} bài tập
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', color: '#064e3b', fontWeight: 600, lineHeight: 1.4 }}>{cd.name}</h4>
                <p style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '6px' }}>
                  {qCount > 0 ? '👉 Học lý thuyết & Giải bẫy ngay' : '⏳ Đang cập nhật meow'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Track 2: Mock Exam Real Test */}
      <div>
        <h3 style={{ margin: '28px 0 12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="decor-paw"></span> Hướng 2: Thi Thử Bộ Đề Thực Chiến
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {Array.from(
            new Set<number>(
              questions
                .map((q: { exam_id?: number | null }) => q.exam_id)
                .filter((id: number | null | undefined): id is number => typeof id === 'number' && id > 0),
            ),
          )
            .sort((a, b) => a - b)
            .map((examId) => {
              const qCount = questions.filter((q) => q.exam_id === examId).length;
              return (
                <div
                  key={examId}
                  className="card"
                  style={{ cursor: 'pointer', borderLeft: '5px solid #10b981' }}
                  onClick={() => handleStartExam(examId)}
                >
                  <h4 style={{ fontSize: '1.1rem', color: '#064e3b', fontWeight: 700 }}>
                    Đề Ôn Luyện Số {examId.toString().padStart(2, '0')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '4px' }}>
                    {qCount > 0 ? `📝 Bộ đề ${qCount} câu - 120 phút` : '⏳ Dự phòng meow'}
                  </p>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '12px', padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Bắt đầu thi thử ⚡
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
