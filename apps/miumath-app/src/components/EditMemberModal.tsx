export default function EditMemberModal({
  editingUser,
  editFullName,
  setEditFullName,
  editPhone,
  setEditPhone,
  editPassword,
  setEditPassword,
  editRole,
  setEditRole,
  onClose,
  onSubmit,
}) {
  if (!editingUser) return null;

  return (
    <div style={{
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
    }}>
      <form
        onSubmit={onSubmit}
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          border: '2px solid rgba(16, 185, 129, 0.15)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
        }}
      >
        <button
          type="button"
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '2rem', background: '#e0f2fe', padding: '10px', borderRadius: '50%' }}>✏️</div>
          <div>
            <h3 style={{ margin: 0, color: '#064e3b', fontSize: '1.2rem', fontWeight: 800 }}>
              Chinh Sua Thanh Vien
            </h3>
            <span style={{ color: '#0369a1', fontSize: '0.82rem', fontWeight: 600 }}>
              Tai khoan: @{editingUser}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>Ten hien thi / Ho ten</label>
          <input
            type="text"
            value={editFullName}
            onChange={(event) => setEditFullName(event.target.value)}
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>So dien thoai</label>
          <input
            type="text"
            value={editPhone}
            onChange={(event) => setEditPhone(event.target.value)}
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>Mat khau</label>
          <input
            type="text"
            value={editPassword}
            onChange={(event) => setEditPassword(event.target.value)}
            placeholder="Nhap mat khau moi..."
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>Vai tro thanh vien</label>
          <select
            value={editRole}
            onChange={(event) => setEditRole(event.target.value)}
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
            disabled={editingUser === "admin"}
          >
            <option value="student">Hoc sinh</option>
            <option value="admin">Quan tri vien</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, padding: '10px', borderRadius: '12px' }}
            onClick={onClose}
          >
            Huy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1, padding: '10px', borderRadius: '12px' }}
          >
            Luu thay doi
          </button>
        </div>
      </form>
    </div>
  );
}
