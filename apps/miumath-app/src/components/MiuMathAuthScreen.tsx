export default function MiuMathAuthScreen({
  authMode,
  setAuthMode,
  authError,
  setAuthError,
  authSuccess,
  setAuthSuccess,
  handleLogin,
  handleRegister,
  authUsername,
  setAuthUsername,
  authPassword,
  setAuthPassword,
  authFullName,
  setAuthFullName,
  authPhone,
  setAuthPhone,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e6f7f0 0%, #f0faf5 50%, #d1fae5 100%)',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '450px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(16, 185, 129, 0.15)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(4, 120, 87, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <div
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '4.5rem', animation: 'bounce 2s infinite' }}>🐱</span>
          <h2 style={{ color: '#064e3b', fontWeight: 800, fontSize: '1.75rem', margin: '8px 0 0' }}>MiuMath 🐾</h2>
          <p style={{ color: '#059669', fontSize: '0.88rem', fontWeight: 600 }}>Cổng Luyện Thi Lớp 10 Chuyên Meow!</p>
        </div>

        <div style={{ display: 'flex', borderBottom: '2px solid #e6f7f0', paddingBottom: '4px', gap: '16px' }}>
          <button
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: authMode === 'login' ? '#059669' : '#9ca3af',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '10px',
              cursor: 'pointer',
              borderBottom: authMode === 'login' ? '3px solid #10b981' : 'none',
            }}
            onClick={() => {
              setAuthMode('login');
              setAuthError('');
              setAuthSuccess('');
            }}
          >
            Đăng Nhập
          </button>
          <button
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: authMode === 'register' ? '#059669' : '#9ca3af',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '10px',
              cursor: 'pointer',
              borderBottom: authMode === 'register' ? '3px solid #10b981' : 'none',
            }}
            onClick={() => {
              setAuthMode('register');
              setAuthError('');
              setAuthSuccess('');
            }}
          >
            Đăng Ký
          </button>
        </div>

        {authError && (
          <div
            style={{
              background: '#fee2e2',
              borderLeft: '4px solid #ef4444',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {authError}
          </div>
        )}

        {authSuccess && (
          <div
            style={{
              background: '#d1fae5',
              borderLeft: '4px solid #10b981',
              color: '#065f46',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {authSuccess}
          </div>
        )}

        <form
          onSubmit={authMode === 'login' ? handleLogin : handleRegister}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#064e3b' }}>👤 Tên tài khoản</label>
            <input
              type="text"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
              placeholder="Tên đăng nhập..."
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1.5px solid #10b981',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#ffffff',
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#064e3b' }}>🔑 Mật khẩu</label>
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1.5px solid #10b981',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#ffffff',
              }}
              required
            />
          </div>

          {authMode === 'register' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#064e3b' }}>
                  📛 Tên hiển thị / Họ tên
                </label>
                <input
                  type="text"
                  value={authFullName}
                  onChange={(e) => setAuthFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #10b981',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#064e3b' }}>📞 Số điện thoại</label>
                <input
                  type="text"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  placeholder="Ví dụ: 0987654321..."
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #10b981',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                  required
                />
              </div>

              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                Tài khoản mới luôn được tạo ở vai trò học sinh và chờ quản trị viên phê duyệt.
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '14px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            }}
          >
            {authMode === 'login' ? 'Đăng Nhập Ngay meow! 🐾' : 'Tạo Tài Khoản Mới ✨'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
          {authMode === 'login' ? (
            <span>
              Chưa có tài khoản?{' '}
              <strong
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                style={{ color: '#10b981', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Đăng ký ngay meow!
              </strong>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{' '}
              <strong
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                style={{ color: '#10b981', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Đăng nhập ngay!
              </strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
