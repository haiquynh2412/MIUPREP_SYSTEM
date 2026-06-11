export default function MiuMathAdminDashboard({
  currentUser,
  questions,
  users,
  chuyenDeList,
  setMode,
  setAdminTab,
  setAdminPreviewMode,
  triggerMascotReaction,
  handleDownloadJSON,
}) {
  const CHUYEN_DE_LIST = chuyenDeList;

  return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'system-ui, sans-serif' }}>
                
                {/* Welcoming Mascot Jumbotron */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', display: 'flex', gap: '20px', alignItems: 'center', color: '#ffffff', padding: '24px', borderRadius: '24px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '20px', borderRadius: '50%', fontSize: '3rem' }}>
                    👑
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                      Xin chào Quản trị viên {currentUser.username}!
                    </h2>
                    <p style={{ color: '#ccfbf1', fontSize: '0.98rem', marginTop: '6px', fontWeight: 500 }}>
                      Chào mừng bạn quay lại Hệ thống quản trị trung tâm MiuMath. Hôm nay chúng ta sẽ bổ sung chuyên đề hay cấp quyền cho thành viên nào đây meow? 🐾💻
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div 
                    className="card stats-hover-card" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      background: '#ffffff', 
                      borderLeft: '6px solid #0f766e', 
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => {
                      setMode("admin_panel");
                      setAdminTab("add_question");
                      triggerMascotReaction("idle", "Đã chuyển sang mục Nhập câu hỏi mới meow! 🐾➕");
                    }}
                  >
                    <span style={{ fontSize: '2.5rem' }}>📚</span>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>TỔNG SỐ CÂU HỎI</span>
                      <h3 style={{ fontSize: '1.8rem', color: '#0f766e', fontWeight: 800, margin: '2px 0 0' }}>{questions.length} câu</h3>
                    </div>
                  </div>

                  <div 
                    className="card stats-hover-card" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      background: '#ffffff', 
                      borderLeft: '6px solid #10b981', 
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => {
                      setMode("admin_panel");
                      setAdminTab("members");
                      triggerMascotReaction("idle", "Đã chuyển sang mục Quản lý thành viên meow! 👥🐾");
                    }}
                  >
                    <span style={{ fontSize: '2.5rem' }}>👥</span>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>TÀI KHOẢN ĐÃ ĐĂNG KÝ</span>
                      <h3 style={{ fontSize: '1.8rem', color: '#047857', fontWeight: 800, margin: '2px 0 0' }}>{users.length} tài khoản</h3>
                    </div>
                  </div>

                  <div 
                    className="card stats-hover-card" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      background: '#ffffff', 
                      borderLeft: '6px solid #f59e0b', 
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => {
                      document.getElementById("chuyen-de-stats-section")?.scrollIntoView({ behavior: 'smooth' });
                      triggerMascotReaction("idle", "Miu đã cuộn xuống xem Thống kê Chuyên đề cho bạn rồi meow! 📊🐾");
                    }}
                  >
                    <span style={{ fontSize: '2.5rem' }}>🧮</span>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>CHUYÊN ĐỀ LỚN</span>
                      <h3 style={{ fontSize: '1.8rem', color: '#b45309', fontWeight: 800, margin: '2px 0 0' }}>11 chuyên đề</h3>
                    </div>
                  </div>
                </div>

                {/* Admin Quick Action Hub */}
                <div className="card" style={{ background: '#ffffff', padding: '24px' }}>
                  <h3 style={{ color: '#0f766e', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e6f7f0', paddingBottom: '8px' }}>
                    ⚡ Phím Tắt Hành Động Nhanh
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <button 
                      className="btn" 
                      style={{ padding: '14px', borderRadius: '16px', background: '#e6f7f0', color: '#047857', border: '1.5px solid #10b981', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => {
                        setMode("admin_panel");
                        setAdminTab("members");
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>👥</span>
                      Quản Lý Thành Viên
                    </button>
                    <button 
                      className="btn" 
                      style={{ padding: '14px', borderRadius: '16px', background: '#e6f7f0', color: '#047857', border: '1.5px solid #10b981', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => {
                        setMode("admin_panel");
                        setAdminTab("add_question");
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>➕</span>
                      Thêm Câu Hỏi Mới
                    </button>
                    <button 
                      className="btn" 
                      style={{ padding: '14px', borderRadius: '16px', background: '#e6f7f0', color: '#047857', border: '1.5px solid #10b981', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={handleDownloadJSON}
                    >
                      <span style={{ fontSize: '1.8rem' }}>📥</span>
                      Tải Về Database (JSON)
                    </button>
                    <button 
                      className="btn" 
                      style={{ padding: '14px', borderRadius: '16px', background: '#fffbeb', color: '#b45309', border: '1.5px solid #f59e0b', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => {
                        setAdminPreviewMode(true);
                        triggerMascotReaction("idle", "Đã chuyển sang chế độ xem trước của Học sinh để kiểm thử meow! 🐾");
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>🎒</span>
                      Xem Với Vai Trò Học Sinh
                    </button>
                  </div>
                </div>

                {/* Question database analyzer & search */}
                <div id="chuyen-de-stats-section" className="card" style={{ background: '#ffffff', padding: '24px' }}>
                  <h3 style={{ color: '#0f766e', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e6f7f0', paddingBottom: '8px' }}>
                    📊 Thống kê Phân bổ Chuyên đề Lớp 9 Chuyên
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {CHUYEN_DE_LIST.map(cd => {
                      const count = cd.id === "casio-hacks"
                        ? questions.filter(q => q.category === "casio-hacks" || (q.explanation && q.explanation.casio)).length
                        : questions.filter(q => q.category === cd.id).length;
                      const percent = questions.length > 0 ? (count / questions.length) * 100 : 0;
                      return (
                        <div key={cd.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                            <span style={{ color: '#064e3b' }}>{cd.icon} {cd.name}</span>
                            <span style={{ color: '#0f766e' }}>{count} câu ({percent.toFixed(1)}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#e6f7f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

  );
}
