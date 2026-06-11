export default function MiuMathAppHeader({
  currentUser,
  mode,
  grade,
  setGrade,
  userName,
  useUnicodeFallback,
  saveUnicodeFallback,
  adminPreviewMode,
  setAdminPreviewMode,
  handleBackToDashboard,
  handleLogout,
  triggerMascotReaction,
  setMode,
  setSelectedChuyenDe,
  setSelectedExamId,
  setDiagnosticQuestionIds,
  setExamActive,
  setExamFinished,
}) {
  const resetWorkspaceState = () => {
    setSelectedChuyenDe(null);
    setSelectedExamId(null);
    setDiagnosticQuestionIds([]);
    setExamActive(false);
    setExamFinished(false);
  };

  const openAdminPanel = () => {
    setMode("admin_panel");
    resetWorkspaceState();
    triggerMascotReaction("idle", "Chao mung Sep quay lai phong dieu khien toi cao meow!");
  };

  const openDiary = () => {
    setMode("nhat_ky");
    resetWorkspaceState();
    triggerMascotReaction("idle", `Hom nay ${userName} muon ghi chep lai dieu gi voi Miu meow?`);
  };

  const toggleUnicodeFallback = () => {
    const nextValue = !useUnicodeFallback;
    saveUnicodeFallback(nextValue);
    triggerMascotReaction(
      "idle",
      nextValue
        ? "Da bat che do Unicode tuong thich cao de hien thi cong thuc on dinh hon."
        : "Da tat che do Unicode, quay lai hien thi cong thuc mac dinh.",
    );
  };

  return (
    <>
      <header style={{ background: '#ffffff', borderBottom: '2px solid rgba(16, 185, 129, 0.12)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleBackToDashboard}>
            <span className="decor-paw" />
            <h1 style={{ fontSize: '1.4rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              MiuMath <span style={{ fontSize: '0.8rem', background: '#e6f7f0', color: '#10b981', padding: '3px 8px', borderRadius: '12px' }}>Vite+React</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              className="btn"
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: useUnicodeFallback ? '#f59e0b' : '#f0faf5',
                color: useUnicodeFallback ? '#ffffff' : '#047857',
                border: `2px solid ${useUnicodeFallback ? '#f59e0b' : 'rgba(16, 185, 129, 0.2)'}`,
                transition: 'var(--transition)',
              }}
              onClick={toggleUnicodeFallback}
              title="Doi che do hien thi cong thuc neu may bi loi font."
            >
              {useUnicodeFallback ? "Che do: Unicode" : "Che do: Mac dinh"}
            </button>

            {currentUser && currentUser.role === "admin" && (
              <button
                className="btn"
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  background: mode === "admin_panel" ? 'var(--color-primary)' : '#f0faf5',
                  color: mode === "admin_panel" ? '#ffffff' : '#047857',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  transition: 'var(--transition)',
                }}
                onClick={openAdminPanel}
              >
                Quan tri he thong
              </button>
            )}

            <button
              className="btn btn-secondary"
              style={{ padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, border: '2px solid rgba(16, 185, 129, 0.2)', color: '#064e3b' }}
              onClick={openDiary}
            >
              Nhat ky cua {userName}
            </button>

            <button
              className="btn btn-secondary"
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 600,
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.2)',
              }}
              onClick={handleLogout}
            >
              Dang xuat
            </button>

            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              style={{ padding: '6px 12px', borderRadius: '20px', border: '2px solid #10b981', outline: 'none', fontWeight: 600, color: '#064e3b', cursor: 'pointer', background: '#ffffff' }}
            >
              <option value="Lớp 9 Chuyên">Toan Lop 9 Chuyen</option>
              <option value="Lớp 9 Thường">Toan Lop 9 Thuong</option>
              <option value="Lớp 6">Toan Lop 6</option>
            </select>
          </div>
        </div>
      </header>

      {currentUser && currentUser.role === "admin" && adminPreviewMode && (
        <div style={{
          background: '#fffbeb',
          borderBottom: '2.5px solid #f59e0b',
          padding: '10px 16px',
          fontSize: '0.88rem',
          color: '#b45309',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <span>Ban dang xem ung dung duoi vai tro hoc sinh de kiem thu giao dien va tinh nang.</span>
          <button
            className="btn btn-primary"
            style={{ padding: '4px 12px', fontSize: '0.78rem', background: '#f59e0b', borderColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => {
              setAdminPreviewMode(false);
              triggerMascotReaction("idle", "Da quay tro lai giao dien quan tri vien meow!");
            }}
          >
            Quay lai Admin Dashboard
          </button>
        </div>
      )}
    </>
  );
}
