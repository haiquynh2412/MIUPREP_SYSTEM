export default function MiuMathAdminPanel({
  currentUser,
  users,
  questions,
  chuyenDeList,
  adminTab,
  setAdminTab,
  getStoredJson,
  handleBackToDashboard,
  handleApproveUser,
  handleDeleteUser,
  handleUpdateUserRole,
  handleToggleUserActive,
  setSelectedStudentProgress,
  setEditingUser,
  setEditFullName,
  setEditPhone,
  setEditPassword,
  setEditRole,
  triggerMascotReaction,
  handleDownloadJSON,
  handleAddQuestion,
  newQId,
  setNewQId,
  newQText,
  setNewQText,
  newQCategory,
  setNewQCategory,
  newQSubCategory,
  setNewQSubCategory,
  newQSubCategoryVn,
  setNewQSubCategoryVn,
  newQOptionA,
  setNewQOptionA,
  newQOptionB,
  setNewQOptionB,
  newQOptionC,
  setNewQOptionC,
  newQOptionD,
  setNewQOptionD,
  newQCorrectAnswer,
  setNewQCorrectAnswer,
  newQHint1,
  setNewQHint1,
  newQHint2,
  setNewQHint2,
  newQThinkingSpecial,
  setNewQThinkingSpecial,
  newQThinkingIntuition,
  setNewQThinkingIntuition,
  newQSteps,
  setNewQSteps,
}) {
  const CHUYEN_DE_LIST = chuyenDeList;

  return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" onClick={handleBackToDashboard}>
                    ⬅️ Trở lại Bảng điều khiển
                  </button>
                  <h3 style={{ color: '#064e3b', fontWeight: 700, fontSize: '1.25rem' }}>
                    🛠️ Trung Tâm Điều Hành Quản Trị MiuMath
                  </h3>
                </div>

                {/* Tab selector */}
                <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid rgba(16, 185, 129, 0.1)', paddingBottom: '8px' }}>
                  <button 
                    className="btn" 
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '12px', 
                      fontWeight: 700,
                      background: adminTab === "members" ? 'var(--color-primary)' : 'transparent',
                      color: adminTab === "members" ? '#ffffff' : '#047857',
                      border: adminTab === "members" ? 'none' : '1px solid #10b981'
                    }}
                    onClick={() => setAdminTab("members")}
                  >
                    👥 Quản lý thành viên ({users.length})
                  </button>
                  <button 
                    className="btn" 
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '12px', 
                      fontWeight: 700,
                      background: adminTab === "add_question" ? 'var(--color-primary)' : 'transparent',
                      color: adminTab === "add_question" ? '#ffffff' : '#047857',
                      border: adminTab === "add_question" ? 'none' : '1px solid #10b981'
                    }}
                    onClick={() => setAdminTab("add_question")}
                  >
                    ➕ Nhập thêm câu hỏi mới
                  </button>
                </div>

                {/* Tab Members */}
                {adminTab === "members" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                    {(() => {
                      const pendingUsers = users.filter(u => u.approved === false);
                      const approvedUsers = users.filter(u => u.approved !== false);

                      // Compute student metrics dynamically for the activity tracker
                      const studentMetrics = approvedUsers
                        .filter(u => u.role === "student")
                        .map(u => {
                          const solvedList = getStoredJson(`miu_math_understood_${u.username}`, []);
                          const uCoins = parseInt(localStorage.getItem(`miu_math_fish_coins_${u.username}`) || "100");
                          const score = u.currentScore ? parseFloat(u.currentScore) : 0;
                          return {
                            ...u,
                            solvedCount: solvedList.length,
                            coins: uCoins,
                            score: score
                          };
                        });

                      // 1. Top Điểm Thi
                      const topScores = [...studentMetrics]
                        .filter(s => s.score > 0)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5);

                      // 2. Người Chăm Chỉ Nhất
                      const topHardWorking = [...studentMetrics]
                        .sort((a, b) => b.solvedCount - a.solvedCount)
                        .slice(0, 5);

                      // 3. Đại Gia Xu Cá hồi
                      const topFishCoins = [...studentMetrics]
                        .sort((a, b) => b.coins - a.coins)
                        .slice(0, 5);

                      return (
                        <>
                          {/* 1. Pending Approval Section */}
                          {pendingUsers.length > 0 ? (
                            <div className="card" style={{ background: '#fffbeb', border: '1.5px dashed #f59e0b', padding: '20px', borderRadius: '16px' }}>
                              <h4 style={{ color: '#b45309', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ⏳ Thành viên chờ phê duyệt ({pendingUsers.length})
                              </h4>
                              <p style={{ color: '#d97706', fontSize: '0.82rem', marginBottom: '16px' }}>
                                Các tài khoản mới đăng ký dưới đây chưa thể đăng nhập. Vui lòng phê duyệt để cấp quyền truy cập hệ thống meow!
                              </p>
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '2px solid #fef3c7', color: '#b45309' }}>
                                      <th style={{ padding: '10px' }}>Tên hiển thị / Tài khoản</th>
                                      <th style={{ padding: '10px' }}>Số điện thoại</th>
                                      <th style={{ padding: '10px' }}>Vai trò mong muốn</th>
                                      <th style={{ padding: '10px', textAlign: 'center' }}>Thao tác phê duyệt</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pendingUsers.map(u => (
                                      <tr key={u.username} style={{ borderBottom: '1px solid #fef3c7' }}>
                                        <td style={{ padding: '10px' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong style={{ color: '#78350f', fontSize: '0.92rem' }}>{u.fullName || "Chưa đặt tên"}</strong>
                                            <span style={{ fontSize: '0.78rem', color: '#b45309' }}>@{u.username}</span>
                                          </div>
                                        </td>
                                        <td style={{ padding: '10px', color: '#b45309', fontWeight: 500 }}>{u.phone || "Chưa cung cấp"}</td>
                                        <td style={{ padding: '10px' }}>
                                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                                            {u.role === 'admin' ? 'Quản trị viên 💻' : 'Học sinh 🎒'}
                                          </span>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button 
                                              className="btn btn-primary"
                                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', background: '#10b981', boxShadow: 'none' }}
                                              onClick={() => handleApproveUser(u.username)}
                                            >
                                              Phê duyệt ✅
                                            </button>
                                            <button 
                                              className="btn"
                                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', border: 'none' }}
                                              onClick={() => handleDeleteUser(u.username)}
                                            >
                                              Từ chối ❌
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="card" style={{ background: '#f0faf5', border: '1px dashed #34d399', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                              <span style={{ color: '#047857', fontSize: '0.85rem', fontWeight: 600 }}>🐾 Không có thành viên nào đang chờ phê duyệt meow!</span>
                            </div>
                          )}

                          {/* Leaderboard Section */}
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.75)',
                            border: '2px solid rgba(16, 185, 129, 0.15)',
                            borderRadius: '24px',
                            padding: '20px',
                            boxShadow: 'var(--shadow-soft)',
                            backdropFilter: 'blur(12px)'
                          }}>
                            <h4 style={{ color: '#064e3b', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              🏆 Bảng Vàng Vinh Danh & Theo Dõi Hoạt Động Học Sinh
                            </h4>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                              gap: '16px'
                            }}>
                              {/* 1. Top Scores */}
                              <div style={{
                                background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
                                border: '1.5px solid #f59e0b',
                                padding: '16px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                              }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 800, margin: '0 0 12px 0', fontSize: '0.92rem' }}>
                                  👑 Top Điểm Thi Thử
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {topScores.length === 0 ? (
                                    <span style={{ fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic' }}>Chưa có học sinh nào có điểm thi...</span>
                                  ) : (
                                    topScores.map((s, idx) => (
                                      <div key={s.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 8px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 600, color: '#451a03' }}>
                                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`} {s.fullName || s.username}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '6px' }}>
                                          {s.score} / 10 ⭐
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* 2. Top Hard-working */}
                              <div style={{
                                background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
                                border: '1.5px solid #0284c7',
                                padding: '16px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                              }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 800, margin: '0 0 12px 0', fontSize: '0.92rem' }}>
                                  ⚡ Học Sinh Chăm Chỉ Nhất
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {topHardWorking.length === 0 ? (
                                    <span style={{ fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic' }}>Chưa có dữ liệu học tập...</span>
                                  ) : (
                                    topHardWorking.map((s, idx) => (
                                      <div key={s.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 8px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 600, color: '#0c4a6e' }}>
                                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`} {s.fullName || s.username}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '6px' }}>
                                          Đã hiểu: {s.solvedCount} câu
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* 3. Top Fish Coins */}
                              <div style={{
                                background: 'linear-gradient(135deg, #d1fae5 0%, #ffffff 100%)',
                                border: '1.5px solid #059669',
                                padding: '16px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                              }}>
                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 800, margin: '0 0 12px 0', fontSize: '0.92rem' }}>
                                  🐟 Triệu Phú Xu Cá Hồi
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {topFishCoins.length === 0 ? (
                                    <span style={{ fontSize: '0.82rem', color: '#6b7280', fontStyle: 'italic' }}>Chưa có dữ liệu xu...</span>
                                  ) : (
                                    topFishCoins.map((s, idx) => (
                                      <div key={s.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 8px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 600, color: '#064e3b' }}>
                                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`} {s.fullName || s.username}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '2px 6px', borderRadius: '6px' }}>
                                          {s.coins} xu 🐟
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Official Members List */}
                          <div className="card" style={{ background: '#ffffff', padding: '20px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            <h4 style={{ color: '#064e3b', fontWeight: 700, marginBottom: '14px' }}>Danh sách thành viên chính thức</h4>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ borderBottom: '2px solid #e6f7f0', color: '#15803d' }}>
                                    <th style={{ padding: '10px' }}>Thành viên</th>
                                    <th style={{ padding: '10px' }}>Số điện thoại</th>
                                    <th style={{ padding: '10px' }}>Tiến trình học tập</th>
                                    <th style={{ padding: '10px' }}>Điểm thi</th>
                                    <th style={{ padding: '10px' }}>Vai trò</th>
                                    <th style={{ padding: '10px' }}>Trạng thái</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {approvedUsers.map(u => {
                                    // Compute progress statistics on the fly from localStorage keys
                                    const solvedList = getStoredJson(`miu_math_understood_${u.username}`, []);
                                    const uCoins = localStorage.getItem(`miu_math_fish_coins_${u.username}`) || "100";
                                    const solvedPercent = questions.length > 0 ? (solvedList.length / questions.length) * 100 : 0;
                                    
                                    return (
                                      <tr key={u.username} style={{ borderBottom: '1px solid #e6f7f0' }}>
                                        <td style={{ padding: '10px' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong style={{ color: '#064e3b', fontSize: '0.92rem' }}>
                                              {u.fullName || "Chưa đặt tên"}
                                            </strong>
                                            <span style={{ fontSize: '0.78rem', color: '#666' }}>
                                              @{u.username} {u.username === currentUser.username && <span style={{ background: '#d1fae5', color: '#065f46', padding: '1px 4px', borderRadius: '4px', fontSize: '0.7rem' }}>Bạn</span>}
                                            </span>
                                          </div>
                                        </td>
                                        <td style={{ padding: '10px', color: '#15803d', fontWeight: 500 }}>
                                          {u.phone || "Chưa cung cấp"}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                          {u.role === "admin" ? (
                                            <span style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>Không áp dụng (Admin)</span>
                                          ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '160px' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#065f46' }}>
                                                <span>Đã hiểu: {solvedList.length}/{questions.length} câu</span>
                                                <span>{solvedPercent.toFixed(0)}%</span>
                                              </div>
                                              <div style={{ width: '100%', height: '6px', background: '#e6f7f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${solvedPercent}%`, height: '100%', background: '#10b981' }}></div>
                                              </div>
                                              <span style={{ fontSize: '0.75rem', color: '#047857' }}>🐟 Tích lũy: {uCoins} xu</span>
                                            </div>
                                          )}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                          {u.role === "admin" ? (
                                            <span style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>Không thi</span>
                                          ) : (
                                            <span style={{ 
                                              background: u.currentScore ? '#e0f2fe' : '#f3f4f6', 
                                              color: u.currentScore ? '#0369a1' : '#6b7280', 
                                              padding: '4px 8px', 
                                              borderRadius: '8px', 
                                              fontWeight: 700,
                                              fontSize: '0.88rem' 
                                            }}>
                                              {u.currentScore ? `${u.currentScore} / 10 ⭐` : "Chưa thi 📝"}
                                            </span>
                                          )}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                          <select 
                                            value={u.role} 
                                            onChange={(e) => handleUpdateUserRole(u.username, e.target.value)}
                                            style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #10b981', background: '#fff', fontSize: '0.85rem' }}
                                            disabled={u.username === "admin"}
                                          >
                                            <option value="student">Học sinh 🎒</option>
                                            <option value="admin">Quản trị viên 💻</option>
                                          </select>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                          <button 
                                            className="btn"
                                            style={{ 
                                              padding: '4px 10px', 
                                              borderRadius: '8px', 
                                              fontSize: '0.8rem',
                                              background: u.active ? '#d1fae5' : '#fee2e2',
                                              color: u.active ? '#065f46' : '#991b1b',
                                              border: 'none',
                                              cursor: u.username === "admin" ? 'not-allowed' : 'pointer'
                                            }}
                                            onClick={() => u.username !== "admin" && handleToggleUserActive(u.username)}
                                            disabled={u.username === "admin"}
                                          >
                                            {u.active ? "Đang hoạt động 🟢" : "Đã khóa 🔴"}
                                          </button>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            {u.role === "student" && (
                                              <button 
                                                className="btn btn-secondary"
                                                style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem' }}
                                                onClick={() => setSelectedStudentProgress(u)}
                                              >
                                                Chi tiết 📊
                                              </button>
                                            )}
                                            <button 
                                              className="btn btn-secondary"
                                              style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '8px', 
                                                fontSize: '0.8rem',
                                                background: '#dbeafe',
                                                color: '#1e40af'
                                              }}
                                              onClick={() => {
                                                setEditingUser(u.username);
                                                setEditFullName(u.fullName || "");
                                                setEditPhone(u.phone || "");
                                                setEditPassword(u.password || "");
                                                setEditRole(u.role || "student");
                                                triggerMascotReaction("success", `Meow! Bạn đang chuẩn bị sửa thông tin của @${u.username} đó! 🐾📝`);
                                              }}
                                            >
                                              Sửa ✏️
                                            </button>
                                            <button 
                                              className="btn"
                                              style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '8px', 
                                                fontSize: '0.8rem',
                                                background: '#fee2e2',
                                                color: '#ef4444',
                                                border: 'none',
                                                cursor: u.username === "admin" ? 'not-allowed' : 'pointer'
                                              }}
                                              onClick={() => handleDeleteUser(u.username)}
                                              disabled={u.username === "admin"}
                                            >
                                              Xóa 🗑️
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Tab Add Question */}
                {adminTab === "add_question" && (
                  <div className="card" style={{ background: '#ffffff', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <h4 style={{ color: '#064e3b', fontWeight: 700 }}>➕ Nhập câu hỏi ôn luyện mới vào hệ thống</h4>
                      <button 
                        className="btn btn-primary"
                        onClick={handleDownloadJSON}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        📥 Tải về file JSON Database mới (questions_db.json)
                      </button>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#15803d', marginBottom: '16px', background: '#f0faf5', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                      💡 **Mẹo Quản Trị**: Khi bạn thêm câu hỏi, dữ liệu sẽ được lưu tạm thời vào trình duyệt để bạn kiểm thử ngay lập tức. Để lưu trữ vĩnh viễn cho toàn bộ hệ thống web, hãy nhấn nút **Tải về file JSON Database mới**, sau đó chép đè tệp tải về vào đường dẫn thư mục dự án: `public/data/questions_db.json` và tiến hành deploy lên web!
                    </p>

                    <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Mã câu hỏi (ID - ví dụ: DE20_C23) *</label>
                          <input 
                            type="text" 
                            value={newQId}
                            onChange={(e) => setNewQId(e.target.value)}
                            placeholder="Mã duy nhất, ví dụ: DE20_C23"
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }}
                            required
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Chuyên đề lớn *</label>
                          <select 
                            value={newQCategory}
                            onChange={(e) => setNewQCategory(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', background: '#fff' }}
                          >
                            {CHUYEN_DE_LIST.map(cd => (
                              <option key={cd.id} value={cd.id}>{cd.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Chuyên đề con (Mã tiếng Anh - ví dụ: he-phuong-trinh)</label>
                          <input 
                            type="text" 
                            value={newQSubCategory}
                            onChange={(e) => setNewQSubCategory(e.target.value)}
                            placeholder="Ví dụ: rut-gon"
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Chuyên đề con (Tên tiếng Việt - hiển thị bộ lọc)</label>
                          <input 
                            type="text" 
                            value={newQSubCategoryVn}
                            onChange={(e) => setNewQSubCategoryVn(e.target.value)}
                            placeholder="Ví dụ: Rút gọn biểu thức đại số"
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Nội dung câu hỏi (hỗ trợ LaTeX kẹp trong $ hoặc $$) *</label>
                        <textarea 
                          value={newQText}
                          onChange={(e) => setNewQText(e.target.value)}
                          placeholder="Ví dụ: Cho biểu thức $A = \frac{\sqrt{x}}{\sqrt{x}-1}$. Tính giá trị..."
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', height: '80px', resize: 'vertical' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Phương án A *</label>
                          <input type="text" value={newQOptionA} onChange={(e) => setNewQOptionA(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }} required />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Phương án B *</label>
                          <input type="text" value={newQOptionB} onChange={(e) => setNewQOptionB(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }} required />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Phương án C *</label>
                          <input type="text" value={newQOptionC} onChange={(e) => setNewQOptionC(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }} required />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Phương án D *</label>
                          <input type="text" value={newQOptionD} onChange={(e) => setNewQOptionD(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }} required />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '150px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Đáp án đúng *</label>
                        <select value={newQCorrectAnswer} onChange={(e) => setNewQCorrectAnswer(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', background: '#fff' }}>
                          <option value="A">Phương án A</option>
                          <option value="B">Phương án B</option>
                          <option value="C">Phương án C</option>
                          <option value="D">Phương án D</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Gợi ý cấp 1 (mở khóa bằng 5 xu)</label>
                          <input type="text" value={newQHint1} onChange={(e) => setNewQHint1(e.target.value)} placeholder="Nhắc nhớ lý thuyết..." style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>Gợi ý cấp 2 (mở khóa bằng 10 xu)</label>
                          <input type="text" value={newQHint2} onChange={(e) => setNewQHint2(e.target.value)} placeholder="Định hướng hướng đi chính..." style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9f9f9', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#064e3b' }}>📘 Thiết lập lời giải chuẩn MiuMath (Bắt buộc 2 phần mục sư phạm)</span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>Phần 1: Nhìn vào đề có gì đặc biệt? *</label>
                          <textarea 
                            value={newQThinkingSpecial}
                            onChange={(e) => setNewQThinkingSpecial(e.target.value)}
                            placeholder="Mô tả các dấu hiệu đặc biệt, tính chất đối xứng, cấu trúc hàm đặc trưng..."
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', height: '60px', resize: 'vertical' }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>Phần 2: Tại sao lại nghĩ ra cách làm như vậy? *</label>
                          <textarea 
                            value={newQThinkingIntuition}
                            onChange={(e) => setNewQThinkingIntuition(e.target.value)}
                            placeholder="Giải thích chi tiết tư duy toán học, định hướng phương án giải quyết (AM-GM, Bunhiacopxki, tọa độ hóa, Casio...)"
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', height: '80px', resize: 'vertical' }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>Các bước giải chi tiết (các bước cụ thể) *</label>
                          <textarea 
                            value={newQSteps}
                            onChange={(e) => setNewQSteps(e.target.value)}
                            placeholder="Ví dụ: 1. Đặt điều kiện xác định...\n2. Biến đổi rút gọn..."
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', height: '100px', resize: 'vertical' }}
                            required
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ alignSelf: 'flex-start', padding: '10px 24px', fontWeight: 700 }}
                      >
                        Thêm câu hỏi ngay 🚀
                      </button>
                    </form>
                  </div>
                )}
              </div>
  );
}
