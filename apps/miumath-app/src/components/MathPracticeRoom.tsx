const parseJsonSafely = (rawValue, fallback) => {
  if (!rawValue) return fallback;
  try {
    return JSON.parse(rawValue) ?? fallback;
  } catch {
    return fallback;
  }
};

const getCasioPracticeSubCategory = (question) => {
  if (question.sub_category) {
    return {
      id: question.sub_category,
      name: question.sub_category_vn || question.sub_category,
    };
  }

  const text = `${question.question_text || ""} ${question.explanation?.casio || ""}`.toLowerCase();
  if (text.includes("phương trình") || text.includes("hệ phương trình") || text.includes("solve")) {
    return { id: "casio-equations-systems", name: "Phương trình & Hệ phương trình" };
  }
  if (text.includes("vi-et") || text.includes("tham số") || text.includes("m =")) {
    return { id: "casio-viet-applications", name: "Định lý Vi-et & Tham số m" };
  }
  if (text.includes("hình") || text.includes("sin") || text.includes("cos") || text.includes("tan")) {
    return { id: "casio-geometry-trig", name: "Hình học & Lượng giác thực tế" };
  }
  if (text.includes("thực tế") || text.includes("thống kê") || text.includes("bảng")) {
    return { id: "casio-word-problems", name: "Giải toán thực tế & Thống kê" };
  }
  return { id: "casio-algebra-simplification", name: "Rút gọn & Đại số Casio" };
};

function PracticeTheoryCard({ currentChuyenDeId, renderMath }) {
  if (currentChuyenDeId === "algebra-simplification") {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: renderMath(
            `- **BĐT Cauchy (AM-GM)** cho 2 số không âm $x, y$: $\\frac{x+y}{2} \\geq \\sqrt{xy}$. Dấu "=" xảy ra khi $x = y$.\n` +
              `- **BĐT Bunhiacopxki (Cauchy-Schwarz)** cho 2 bộ số $(a, b)$ và $(x, y)$: $(ax+by)^2 \\leq (a^2+b^2)(x^2+y^2)$. Dấu "=" xảy ra khi $\\frac{a}{x} = \\frac{b}{y}$.\n` +
              `- **Mẹo tìm cực trị**: Sử dụng biến đổi thêm bớt tạo bình phương hoặc chia khoảng giá trị $x$ hợp lý. Không được dùng đạo hàm của cấp 3 khi làm bài thi tự luận!`,
          ),
        }}
      />
    );
  }

  if (currentChuyenDeId === "trigonometry-practice") {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: renderMath(
            `- **Tỉ số lượng giác góc nhọn**: $\\sin = \\frac{Doi}{Huyen}$, $\\cos = \\frac{Ke}{Huyen}$, $\\tan = \\frac{Doi}{Ke}$, $\\cot = \\frac{Ke}{Doi}$.\n` +
              `- **Hệ thức cơ bản**: $\\sin^2 x + \\cos^2 x = 1$; $\\tan x \\cdot \\cot x = 1$; $\\tan x = \\frac{\\sin x}{\\cos x}$.\n` +
              "- **Casio Hacks**: Dùng phím `[sin]`, `[cos]`, `[tan]` và phím độ-phút-giây `[°'\"]` để tính nhanh góc của tháp hoặc máy bay.",
          ),
        }}
      />
    );
  }

  if (currentChuyenDeId === "casio-hacks") {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: renderMath(
            "- **Tính năng SOLVE (SHIFT CALC)**: Tìm nghiệm xấp xỉ cực nhanh của phương trình chứa căn phức tạp. Nhập phương trình, ấn `[SHIFT]` `[CALC]`, nhập điểm xuất phát dò nghiệm và ấn `[=]`.\n" +
              "- **Tính năng TABLE (MENU 8)**: Quét bảng giá trị tìm nghiệm nguyên, tìm cực trị đại số hoặc khảo sát miền xác định. Nhập hàm $f(x)$, Start: $-10$, End: $10$, Step: $1$.\n" +
              "- **Kỹ thuật Tham số hóa đặc biệt**: Thay $m = 100$ hoặc $m = 1000$ vào phương trình để máy tính giải ra nghiệm số thập phân, sau đó phân tích ngược ra đa thức chứa tham số $m$ cực kỳ vi diệu!",
          ),
        }}
      />
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: renderMath(
          "- Học sinh lớp 9 ôn thi Chuyên cần ghi nhớ: Chỉ sử dụng các công cụ hình học phẳng (tam giác đồng dạng, tứ giác nội tiếp) và biến đổi đại số sơ cấp của THCS.\n" +
            "- **Casio Tips**: Sử dụng phím tính năng giải phương trình/hệ phương trình (`MENU 9`) hoặc rà bảng giá trị (`MENU 8`) để đẩy nhanh tốc độ thử đáp án trắc nghiệm.",
        ),
      }}
    />
  );
}

function PracticeSubcategoryFilter({
  currentChuyenDeId,
  questions,
  selectedSubCategory,
  setSelectedSubCategory,
  setCurrentQuestionIndex,
}) {
  const activeSubCategories =
    currentChuyenDeId === "casio-hacks"
      ? [
          { id: "casio-algebra-simplification", name: "Rút gọn & Đại số Casio" },
          { id: "casio-equations-systems", name: "Phương trình & Hệ phương trình" },
          { id: "casio-viet-applications", name: "Định lý Vi-et & Tham số m" },
          { id: "casio-word-problems", name: "Giải toán thực tế & Thống kê" },
          { id: "casio-geometry-trig", name: "Hình học & Lượng giác thực tế" },
        ]
      : Array.from(
          new Set(
            questions
              .filter((question) => question.category === currentChuyenDeId)
              .map((question) => JSON.stringify({ id: question.sub_category, name: question.sub_category_vn })),
          ),
        )
          .map((value) => parseJsonSafely(value, null))
          .filter((item) => item?.id);

  if (activeSubCategories.length === 0) return null;

  const getQuestionCount = (subCategoryId) =>
    questions.filter((question) => {
      const matchCategory =
        currentChuyenDeId === "casio-hacks"
          ? question.category === "casio-hacks" || (question.explanation && question.explanation.casio)
          : question.category === currentChuyenDeId;
      if (!matchCategory) return false;

      if (subCategoryId === "all") return true;
      if (currentChuyenDeId === "casio-hacks") {
        return getCasioPracticeSubCategory(question).id === subCategoryId;
      }

      return question.sub_category === subCategoryId;
    }).length;

  const selectSubCategory = (subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setCurrentQuestionIndex(0);
  };

  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", margin: "5px 0 10px 0", borderBottom: "1px solid rgba(16, 185, 129, 0.1)" }}>
      <button
        className="btn"
        style={{
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "0.85rem",
          fontWeight: 600,
          whiteSpace: "nowrap",
          background: selectedSubCategory === "all" ? "#10b981" : "#f0faf5",
          color: selectedSubCategory === "all" ? "#ffffff" : "#047857",
          border: `2px solid ${selectedSubCategory === "all" ? "#10b981" : "rgba(16, 185, 129, 0.15)"}`,
          transition: "all 0.2s ease",
        }}
        onClick={() => selectSubCategory("all")}
      >
        🐾 Tất cả ({getQuestionCount("all")})
      </button>

      {activeSubCategories.map((subCategory) => (
        <button
          key={subCategory.id}
          className="btn"
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: selectedSubCategory === subCategory.id ? "#10b981" : "#ffffff",
            color: selectedSubCategory === subCategory.id ? "#ffffff" : "#064e3b",
            border: `2px solid ${selectedSubCategory === subCategory.id ? "#10b981" : "rgba(16, 185, 129, 0.15)"}`,
            transition: "all 0.2s ease",
          }}
          onClick={() => selectSubCategory(subCategory.id)}
        >
          📌 {subCategory.name} ({getQuestionCount(subCategory.id)})
        </button>
      ))}
    </div>
  );
}

function PracticeActionButtons({
  currentQuestion,
  hintLevel,
  isAnswerCorrect,
  userAnswers,
  handleSubmitAnswer,
  handleBuyHint,
  handleBuySolution,
  isFillInBlank = false,
}) {
  const questionId = currentQuestion.id;
  const hasAnswer = isFillInBlank ? (userAnswers[questionId] || "").trim() : userAnswers[questionId];
  const level = hintLevel[questionId] || 0;

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
      {!isAnswerCorrect[questionId] && hintLevel[questionId] !== 2 && (
        <button className="btn btn-primary" onClick={() => handleSubmitAnswer(questionId)} disabled={!hasAnswer}>
          {hintLevel[questionId] === 1 ? (isFillInBlank ? "💡 Điền đáp số lại lần 2" : "💡 Nộp bài lại lần 2") : "⚡ Nộp bài & Check bẫy"}
        </button>
      )}

      {level === 0 && (
        <button
          className="btn"
          style={{ background: "#fffbeb", border: "1px solid #d97706", color: "#b45309", fontWeight: 600, padding: "8px 16px", borderRadius: "12px" }}
          onClick={() => handleBuyHint(questionId)}
        >
          💡 Mua Gợi ý (-15 🐟)
        </button>
      )}
      {level < 2 && (
        <button
          className="btn"
          style={{ background: "#ecfdf5", border: "1px solid #10b981", color: "#047857", fontWeight: 600, padding: "8px 16px", borderRadius: "12px" }}
          onClick={() => handleBuySolution(questionId)}
        >
          🔓 Mua Lời giải chi tiết (-30 🐟)
        </button>
      )}
    </div>
  );
}

function PracticeQuestionCard({
  currentQuestion,
  currentQuestionIndex,
  activeQuestions,
  renderMath,
  bookmarkedList,
  toggleBookmark,
  userAnswers,
  setUserAnswers,
  hintLevel,
  isAnswerCorrect,
  handleSubmitAnswer,
  handleBuyHint,
  handleBuySolution,
  understoodList,
  saveUnderstood,
  spentCoinsMap,
  fishCoins,
  saveFishCoins,
  triggerMascotReaction,
  userName,
  setCurrentQuestionIndex,
}) {
  const markUnderstood = () => {
    const questionId = currentQuestion.id;
    if (understoodList.includes(questionId)) return;

    saveUnderstood([...understoodList, questionId]);

    const spent = spentCoinsMap[questionId] || 0;
    const refund = Math.ceil(spent * 0.5);
    if (refund > 0) {
      saveFishCoins(fishCoins + refund);
      triggerMascotReaction(
        "success",
        `Meow meow! ${userName} tự học xuất sắc quá! Miu hoàn lại ${refund} xu cá hồi 🐟 (50% của ${spent} xu) cho ${userName} nhé! 🐾💖`,
      );
      return;
    }

    triggerMascotReaction(
      "success",
      `Miu vô cùng vui sướng vì ${userName} đã tự học và hiểu bài meow! Cố gắng giải đúng các câu tiếp theo nhé! 🐾💖`,
    );
  };

  const goToQuestionOffset = (offset) => {
    setCurrentQuestionIndex((previousIndex) => previousIndex + offset);
    triggerMascotReaction("idle");
  };

  return (
    <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <span style={{ fontWeight: 600, color: "#15803d", fontSize: "0.9rem" }}>
          Câu {currentQuestionIndex + 1} / {activeQuestions.length} ({currentQuestion.exam_name})
        </span>
        <button
          className="btn"
          style={{ padding: "4px 12px", background: bookmarkedList.includes(currentQuestion.id) ? "#fffbeb" : "#f0faf5", border: "1px solid #10b981", fontSize: "0.85rem" }}
          onClick={() => toggleBookmark(currentQuestion.id)}
        >
          {bookmarkedList.includes(currentQuestion.id) ? "⭐ Đã lưu" : "☆ Lưu câu hỏi"}
        </button>
      </div>

      <div style={{ fontSize: "1.05rem", fontWeight: 500, color: "#064e3b" }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.question_text) }} />

      {currentQuestion.image && (
        <div style={{ margin: "14px 0", textAlign: "center", background: "#ffffff", padding: "10px", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
          <img src={currentQuestion.image} alt="Hình vẽ minh họa" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }} />
        </div>
      )}

      {currentQuestion.type === "multiple_choice" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
          {currentQuestion.options.map((option) => {
            const isSelected = userAnswers[currentQuestion.id] === option.key;
            const isSubmitted = hintLevel[currentQuestion.id] === 2;
            const isWrongAnswer = isSubmitted && isSelected && !isAnswerCorrect[currentQuestion.id];
            const isCorrectAnswer = isSubmitted && option.key === currentQuestion.correct_answer;

            let background = "#ffffff";
            let borderColor = "var(--color-border)";
            if (isSelected) {
              background = "var(--color-primary-soft)";
              borderColor = "var(--color-primary)";
            }
            if (isCorrectAnswer) {
              background = "#ecfdf5";
              borderColor = "#10b981";
            } else if (isWrongAnswer) {
              background = "#fef2f2";
              borderColor = "#ef4444";
            }

            return (
              <div
                key={option.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 20px",
                  borderRadius: "16px",
                  border: `2px solid ${borderColor}`,
                  background,
                  cursor: isSubmitted ? "not-allowed" : "pointer",
                  transition: "var(--transition)",
                }}
                onClick={() => {
                  if (isSubmitted) return;
                  setUserAnswers((previousAnswers) => ({ ...previousAnswers, [currentQuestion.id]: option.key }));
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: isSelected ? "var(--color-primary)" : "#cbd5e1",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    background: isSelected ? "var(--color-primary)" : "transparent",
                    color: isSelected ? "#ffffff" : "#475569",
                  }}
                >
                  {option.key}
                </span>
                <div style={{ color: "#064e3b", fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: renderMath(option.content) }} />
              </div>
            );
          })}

          <PracticeActionButtons
            currentQuestion={currentQuestion}
            hintLevel={hintLevel}
            isAnswerCorrect={isAnswerCorrect}
            userAnswers={userAnswers}
            handleSubmitAnswer={handleSubmitAnswer}
            handleBuyHint={handleBuyHint}
            handleBuySolution={handleBuySolution}
          />
        </div>
      )}

      {currentQuestion.type === "fill_in_the_blank" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              className="math-input"
              placeholder="Nhập con số đáp án cuối cùng của bạn tại đây..."
              value={userAnswers[currentQuestion.id] || ""}
              onChange={(event) => {
                if (hintLevel[currentQuestion.id] === 2) return;
                setUserAnswers((previousAnswers) => ({ ...previousAnswers, [currentQuestion.id]: event.target.value }));
              }}
              disabled={hintLevel[currentQuestion.id] === 2}
            />
          </div>

          <PracticeActionButtons
            currentQuestion={currentQuestion}
            hintLevel={hintLevel}
            isAnswerCorrect={isAnswerCorrect}
            userAnswers={userAnswers}
            handleSubmitAnswer={handleSubmitAnswer}
            handleBuyHint={handleBuyHint}
            handleBuySolution={handleBuySolution}
            isFillInBlank
          />
        </div>
      )}

      {hintLevel[currentQuestion.id] >= 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px", borderTop: "2px dashed var(--color-border)", paddingTop: "20px" }}>
          <div style={{ background: "var(--color-accent-cream)", padding: "16px", borderRadius: "16px", border: "1px solid #fef3c7" }}>
            <h5 style={{ color: "#d97706", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.98rem", marginBottom: "6px" }}>
              💡 Cách tư duy giải quyết bài toán:
            </h5>
            <div style={{ fontSize: "0.92rem", color: "#78350f" }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.thinking) }} />
          </div>

          {hintLevel[currentQuestion.id] === 2 ? (
            <>
              <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", border: "2px solid var(--color-border)" }}>
                <h5 style={{ color: "#064e3b", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.98rem", marginBottom: "8px" }}>
                  📝 Các bước giải chi tiết (Kiến thức THCS Lớp 9):
                </h5>
                <div style={{ fontSize: "0.92rem", color: "#0f766e" }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.steps) }} />
              </div>

              <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "16px", border: "1px solid #fecdd3" }}>
                <h5 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.98rem", marginBottom: "6px" }}>
                  ⚠️ Cạm bẫy học sinh cần tránh:
                </h5>
                <div style={{ fontSize: "0.92rem", color: "#991b1b" }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.traps) }} />
              </div>

              {currentQuestion.explanation.casio && (
                <div style={{ background: "var(--color-primary-soft)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <h5 style={{ color: "#047857", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.98rem", marginBottom: "6px" }}>
                    🧮 Hướng dẫn thủ thuật máy tính Casio FX-580VN X:
                  </h5>
                  <div style={{ fontSize: "0.92rem", color: "#065f46" }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.casio) }} />
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: "8px", color: "#15803d", fontSize: "0.9rem", fontStyle: "italic" }}>
              🔒 Điền sai hoặc nộp bài lần 2 để mở khóa toàn bộ giải thích chi tiết, cạm bẫy và thủ thuật bấm máy Casio!
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ecfdf5", padding: "12px 16px", borderRadius: "16px", border: "1px solid #a7f3d0", marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.4rem" }}>😸</span>
              <div>
                <strong style={{ color: "#065f46", fontSize: "0.92rem", display: "block" }}>Đã hiểu cạm bẫy chưa meow?</strong>
                <span style={{ fontSize: "0.82rem", color: "#047857" }}>
                  Tích đã hiểu để nhận lại 50% số xu cá hồi đã dùng mở khóa gợi ý/lời giải!
                </span>
              </div>
            </div>
            <button
              className="btn"
              disabled={understoodList.includes(currentQuestion.id)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: "0.85rem",
                background: understoodList.includes(currentQuestion.id) ? "#e6f7f0" : "#10b981",
                color: understoodList.includes(currentQuestion.id) ? "#047857" : "#ffffff",
                border: "none",
                cursor: understoodList.includes(currentQuestion.id) ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: understoodList.includes(currentQuestion.id) ? "none" : "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
                transition: "all 0.2s ease",
              }}
              onClick={markUnderstood}
            >
              {understoodList.includes(currentQuestion.id) ? "✔️ Đã hiểu meow!" : "🐾 Đã hiểu meow!"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
        <button className="btn btn-secondary" disabled={currentQuestionIndex === 0} onClick={() => goToQuestionOffset(-1)}>
          👈 Câu trước
        </button>
        <button className="btn btn-secondary" disabled={currentQuestionIndex === activeQuestions.length - 1} onClick={() => goToQuestionOffset(1)}>
          Câu tiếp theo 👉
        </button>
      </div>
    </div>
  );
}

export default function MathPracticeRoom({
  mode,
  selectedChuyenDe,
  chuyenDeList,
  currentChuyenDeId,
  questions,
  selectedSubCategory,
  setSelectedSubCategory,
  activeQuestions,
  currentQuestion,
  currentQuestionIndex,
  renderMath,
  bookmarkedList,
  toggleBookmark,
  userAnswers,
  setUserAnswers,
  hintLevel,
  isAnswerCorrect,
  handleSubmitAnswer,
  handleBuyHint,
  handleBuySolution,
  understoodList,
  saveUnderstood,
  spentCoinsMap,
  fishCoins,
  saveFishCoins,
  triggerMascotReaction,
  userName,
  setCurrentQuestionIndex,
  handleBackToDashboard,
}) {
  const isTopicMode = mode === "chuyen_de";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-secondary" onClick={handleBackToDashboard}>
          ⬅️ Trở lại Bảng điều khiển
        </button>
        <h3 style={{ color: "#064e3b", fontWeight: 700, fontSize: "1.15rem" }}>
          {mode === "diagnostic_adaptive" ? `Adaptive Diagnostic: ${activeQuestions.length} câu` : `Chuyên đề: ${chuyenDeList[selectedChuyenDe].name}`}
        </h3>
      </div>

      {isTopicMode && (
        <div className="card" style={{ background: "#fffbeb", borderColor: "#fef3c7" }}>
          <h4 style={{ color: "#d97706", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            📚 Tóm Tắt Kiến Thức Cốt Lõi Lớp 9 Chuyên
          </h4>
          <div style={{ fontSize: "0.92rem", color: "#78350f" }}>
            <PracticeTheoryCard currentChuyenDeId={currentChuyenDeId} renderMath={renderMath} />
          </div>
        </div>
      )}

      {isTopicMode && (
        <PracticeSubcategoryFilter
          currentChuyenDeId={currentChuyenDeId}
          questions={questions}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
        />
      )}

      {currentQuestion ? (
        <PracticeQuestionCard
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          activeQuestions={activeQuestions}
          renderMath={renderMath}
          bookmarkedList={bookmarkedList}
          toggleBookmark={toggleBookmark}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          hintLevel={hintLevel}
          isAnswerCorrect={isAnswerCorrect}
          handleSubmitAnswer={handleSubmitAnswer}
          handleBuyHint={handleBuyHint}
          handleBuySolution={handleBuySolution}
          understoodList={understoodList}
          saveUnderstood={saveUnderstood}
          spentCoinsMap={spentCoinsMap}
          fishCoins={fishCoins}
          saveFishCoins={saveFishCoins}
          triggerMascotReaction={triggerMascotReaction}
          userName={userName}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
        />
      ) : (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <p style={{ fontWeight: 600 }}>Không tìm thấy câu hỏi nào cho chuyên đề này meow meow...</p>
          <button className="btn btn-primary" onClick={handleBackToDashboard}>
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
