export default function StudentProgressModal({ student, questions, getStoredJson, onClose }) {
  if (!student) return null;

  const username = student.username;
  const solved = getStoredJson(`miu_math_understood_${username}`, []);
  const traps = getStoredJson(`miu_math_traps_${username}`, []);
  const bookmarks = getStoredJson(`miu_math_bookmarks_${username}`, []);
  const coins = localStorage.getItem(`miu_math_fish_coins_${username}`) || '100';
  const diaries = getStoredJson(`miu_math_diary_${username}`, []);
  const progressPercent = questions.length > 0 ? (solved.length / questions.length) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(6, 78, 59, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          border: '2px solid rgba(16, 185, 129, 0.15)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <button
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#9ca3af',
          }}
          onClick={onClose}
        >
          Close
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '3rem', background: '#e6f7f0', padding: '12px', borderRadius: '50%' }}>🎒</div>
          <div>
            <h3 style={{ margin: 0, color: '#064e3b', fontSize: '1.4rem', fontWeight: 800 }}>{student.fullName}</h3>
            <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
              Tai khoan: @{student.username} | SDT: {student.phone}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f0faf5', padding: '14px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
              <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>TIEN TRINH</span>
              <h4 style={{ fontSize: '1.1rem', color: '#065f46', margin: '4px 0 0', fontWeight: 800 }}>
                {solved.length}/{questions.length} ({progressPercent.toFixed(0)}%)
              </h4>
            </div>
            <div style={{ background: '#f0faf5', padding: '14px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
              <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>VI XU</span>
              <h4 style={{ fontSize: '1.1rem', color: '#065f46', margin: '4px 0 0', fontWeight: 800 }}>{coins} xu</h4>
            </div>
            <div style={{ background: '#f0faf5', padding: '14px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
              <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>DIEM HIEN TAI</span>
              <h4 style={{ fontSize: '1.1rem', color: '#065f46', margin: '4px 0 0', fontWeight: 800 }}>
                {student.currentScore ? `${student.currentScore}/10` : 'Chua thi'}
              </h4>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#e6f7f0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '-8px',
            }}
          >
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem' }}>
            <div
              style={{
                flex: 1,
                border: '1.5px solid #fee2e2',
                padding: '10px 14px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <span style={{ color: '#ef4444', fontWeight: 700 }}>So tay bay chuot</span>
              <h5 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#ef4444', fontWeight: 800 }}>
                {traps.length} cau
              </h5>
            </div>
            <div
              style={{
                flex: 1,
                border: '1.5px solid #d1fae5',
                padding: '10px 14px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <span style={{ color: '#10b981', fontWeight: 700 }}>Cau hoi yeu thich</span>
              <h5 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#10b981', fontWeight: 800 }}>
                {bookmarks.length} cau
              </h5>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.98rem',
                color: '#064e3b',
                fontWeight: 800,
                borderBottom: '1px solid #e6f7f0',
                paddingBottom: '6px',
              }}
            >
              Nhat ky hoc tap cua {student.fullName} ({diaries.length} trang)
            </h4>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '200px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {diaries.length > 0 ? (
                diaries.map((diary) => (
                  <div
                    key={diary.id}
                    style={{
                      background: '#f9fdfb',
                      border: '1px solid #e6f7f0',
                      borderLeft: '4px solid #10b981',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#15803d',
                      }}
                    >
                      <span>{diary.date}</span>
                      <span>{diary.mood}</span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#064e3b',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.4,
                      }}
                    >
                      {diary.content}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', fontStyle: 'italic', padding: '10px 0' }}>
                  Hoc sinh nay chua viet trang nhat ky hoc tap nao.
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ padding: '12px', borderRadius: '12px', fontWeight: 700, marginTop: '8px' }}
          onClick={onClose}
        >
          Dong cua so
        </button>
      </div>
    </div>
  );
}
