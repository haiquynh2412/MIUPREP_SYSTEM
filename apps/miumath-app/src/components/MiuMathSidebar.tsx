const pickRandom = (items) => {
  if (!items.length) return "";
  return items[Math.floor(Math.random() * items.length)];
};

export default function MiuMathSidebar({
  mascotState,
  mascotBubble,
  fishCoins,
  saveFishCoins,
  userName,
  triggerMascotReaction,
  mouseTrapCount,
  errorNotebookSummary,
  bookmarkedCount,
  setMode,
  draftPadText,
  setDraftPadText,
}) {
  const feedMascot = () => {
    if (fishCoins >= 10) {
      saveFishCoins(fishCoins - 10);
      const feedPhrases = [
        `Mam mam! Ca hoi ngon tuyet meow! Cam on ${userName} nhieu nhe! Miu da duoc suoi am cai bung tron xoe roi meo meo!`,
        `Ngon qua meow! Ca hoi beo ngay luon! Miu chuc ${userName} hoc that tot va tranh duoc moi bay chuot hom nay nhe!`,
        `Meo meo! Co ca hoi an la Miu thich nhat! Miu nap day 100% nang luong de dong hanh cung ${userName} day!`,
      ];
      triggerMascotReaction("success", pickRandom(feedPhrases));
      return;
    }

    triggerMascotReaction(
      "failed",
      `Meow... Khong du xu ca hoi roi ${userName} oi! Kiem them xu bang cach lam dung cau hoi hoac hoan thanh de thi thu de kiem them xu nhe!`,
    );
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#ffffff', minHeight: '320px', justifyContent: 'center' }}>
        <div className="mascot-float" style={{ fontSize: '4.5rem', marginBottom: '16px', transition: 'var(--transition)' }}>
          {mascotState === "success" ? "😸" : mascotState === "failed" ? "😾" : mascotState === "hint" ? "😼" : "🐱"}
        </div>
        <div style={{
          background: '#e6f7f0',
          border: '2px solid var(--color-border)',
          padding: '12px 16px',
          borderRadius: '16px',
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#064e3b',
          position: 'relative',
          width: '100%',
        }}>
          {mascotBubble}
        </div>
      </div>

      <div className="card" style={{ background: '#ffffff', padding: '16px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '12px' }}>
          🐾 Bang thanh tich meow
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #e6f7f0 0%, #d1fae5 100%)', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🐟</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Xu Ca Hoi</span>
              <strong style={{ fontSize: '1.1rem', color: '#065f46' }}>{fishCoins} xu</strong>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '14px', background: '#10b981', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
            onClick={feedMascot}
          >
            🐟 Cho Miu an (-10)
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#15803d' }}>📓 So tay Bay chuot:</span>
            <strong style={{ color: '#ef4444' }}>{mouseTrapCount} cau</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#15803d' }}>SRS core due:</span>
            <strong style={{ color: '#f97316' }}>{errorNotebookSummary.due}/{errorNotebookSummary.total}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#15803d' }}>⭐ Cau hoi yeu thich:</span>
            <strong style={{ color: '#10b981' }}>{bookmarkedCount} cau</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setMode("so_tay_bay_chuot")}>
            <span style={{ color: '#10b981', textDecoration: 'underline', fontWeight: 600 }}>👉 Luyen bay ngay</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: '#ffffff', padding: '16px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '12px' }}>
          📝 Bang nhap tu do meow
        </h4>
        <textarea
          value={draftPadText}
          onChange={(event) => setDraftPadText(event.target.value)}
          placeholder={`${userName} viet nhap phuong trinh hoac ghi chu cong thuc tai day nhe...`}
          style={{
            width: '100%',
            height: '120px',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '0.85rem',
            color: '#064e3b',
            outline: 'none',
            resize: 'none',
            background: '#fcfcfc',
          }}
        />
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '8px', padding: '4px 10px', fontSize: '0.75rem' }}
          onClick={() => setDraftPadText("")}
        >
          Xoa nhap 🗑️
        </button>
      </div>
    </aside>
  );
}
