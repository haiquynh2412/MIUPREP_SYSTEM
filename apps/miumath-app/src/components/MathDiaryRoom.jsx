const DIARY_MOODS = [
  "😸 Hạnh phúc",
  "😿 Lo lắng",
  "😾 Mệt mỏi",
  "😼 Quyết tâm",
  "💤 Lười meow",
];

function buildDiaryEntry(content, mood) {
  return {
    id: Date.now().toString(),
    date: new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    content,
    mood,
  };
}

export default function MathDiaryRoom({
  userName,
  diaryText,
  setDiaryText,
  diaryMood,
  setDiaryMood,
  diaryEntries,
  saveDiary,
  triggerMascotReaction,
  handleBackToDashboard,
}) {
  const saveCurrentEntry = () => {
    const content = diaryText.trim();
    if (!content) return;

    const newEntries = [buildDiaryEntry(content, diaryMood), ...diaryEntries];
    saveDiary(newEntries);
    setDiaryText("");
    triggerMascotReaction(
      "success",
      `Miu đã lưu trang nhật ký hôm nay của ${userName} rồi meow! Hãy kiên trì nhé! 💕`,
    );
  };

  const deleteEntry = (entryId) => {
    if (!window.confirm("Miu meow! Bạn có chắc muốn xóa trang nhật ký này không?")) {
      return;
    }

    saveDiary(diaryEntries.filter((entry) => entry.id !== entryId));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-secondary" onClick={handleBackToDashboard}>
          ⬅️ Trở lại Bảng điều khiển
        </button>
        <h3 style={{ color: "#064e3b", fontWeight: 800, fontSize: "1.2rem" }}>
          📔 Nhật Ký Học Tập Của {userName} meow
        </h3>
      </div>

      <div className="card" style={{ background: "var(--color-primary-soft)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
        <p style={{ fontSize: "0.92rem", color: "#065f46", fontWeight: 600 }}>
          🐱 <strong>Mèo Miu lắng nghe</strong>: Mỗi ngày ôn thi là một bước chân nhỏ tiến tới giấc mơ lớp 10 Chuyên!
          Hãy viết lại những vui buồn, thành tích hoặc khó khăn hôm nay của {userName} để Miu cùng đồng hành nhé meow!
        </p>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h4 style={{ fontSize: "1.15rem", color: "#064e3b", fontWeight: 700 }}>✍️ Viết nhật ký hôm nay:</h4>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.9rem", color: "#15803d", fontWeight: 600 }}>Cảm xúc hôm nay:</span>
          {DIARY_MOODS.map((moodText) => {
            const moodIcon = moodText.split(" ")[0];
            const isActive = diaryMood === moodIcon;

            return (
              <button
                key={moodIcon}
                className="btn"
                style={{
                  padding: "6px 12px",
                  borderRadius: "16px",
                  fontSize: "0.85rem",
                  background: isActive ? "var(--color-primary)" : "#f0faf5",
                  color: isActive ? "#ffffff" : "#047857",
                  border: "1px solid #10b981",
                  fontWeight: 600,
                }}
                onClick={() => setDiaryMood(moodIcon)}
              >
                {moodText}
              </button>
            );
          })}
        </div>

        <textarea
          value={diaryText}
          onChange={(event) => setDiaryText(event.target.value)}
          placeholder={`Hôm nay ${userName} đã làm được bài toán nào khó? Có gặp chiếc bẫy nào đáng nhớ không? Hãy ghi lại tại đây nhé meow...`}
          style={{
            width: "100%",
            height: "100px",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "0.9rem",
            color: "#064e3b",
            outline: "none",
            resize: "none",
            background: "#fcfcfc",
          }}
        />

        <button
          className="btn btn-primary"
          style={{ alignSelf: "flex-start" }}
          onClick={saveCurrentEntry}
          disabled={!diaryText.trim()}
        >
          Lưu trang nhật ký 💾
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h4 style={{ fontSize: "1.1rem", color: "#064e3b", fontWeight: 700, margin: "10px 0 4px" }}>
          📖 Lịch sử nhật ký của {userName} ({diaryEntries.length} trang)
        </h4>

        {diaryEntries.length > 0 ? (
          diaryEntries.map((entry) => (
            <div
              key={entry.id}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: "8px", borderLeft: "5px solid #10b981", position: "relative" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 600 }}>{entry.date}</span>
                <span style={{ fontSize: "1.3rem" }} title="Cảm xúc">
                  {entry.mood}
                </span>
              </div>
              <p style={{ fontSize: "0.95rem", color: "#064e3b", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{entry.content}</p>
              <button
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "16px",
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => deleteEntry(entry.id)}
              >
                Xóa trang 🗑️
              </button>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: "center", color: "#15803d", padding: "30px" }}>
            <span style={{ fontSize: "3rem" }}>📖</span>
            <p style={{ marginTop: "10px", fontWeight: 600 }}>
              Chưa có trang nhật ký nào được viết meow! Hãy đặt bút viết dòng đầu tiên nhé!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
