(function initSatStudentExperienceEngine(root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  if (root) root.SatStudentExperienceEngine = engine;
})(typeof window !== "undefined" ? window : globalThis, function createSatStudentExperienceEngine() {
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function diagnosticConfidenceBand(test = {}, options = {}) {
    const vi = Boolean(options.vi);
    const total = Number(test.total || test.reviewItems?.length || 0);
    const correct = Number(test.correct || 0);
    const score = Number(test.scoreEstimate || 0);
    const noAnswer = Number(options.noAnswer || 0);
    const fullLength = total >= 80 || test.mode === "full";
    const moduleEvidence = Array.isArray(test.moduleResults) && test.moduleResults.length >= 2;
    const timedOut = Boolean(test.timedOut || test.endedReason === "timeout");
    const evidenceScore = (fullLength ? 3 : moduleEvidence ? 2 : total >= 20 ? 1.25 : 0.75) - (total < 20 ? 1 : total < 44 ? 0.5 : 0) - (noAnswer > Math.max(2, total * 0.12) ? 0.5 : 0) - (timedOut ? 0.5 : 0);
    const level = evidenceScore >= 2.5 ? "high" : evidenceScore >= 1.25 ? "medium" : "low";
    const width = level === "high" ? 35 : level === "medium" ? 60 : 90;
    const lower = score ? Math.max(400, score - width) : null;
    const upper = score ? Math.min(1600, score + width) : null;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const label = vi ? (level === "high" ? "Độ tin cậy cao" : level === "medium" ? "Độ tin cậy vừa" : "Độ tin cậy thấp") : level === "high" ? "High confidence" : level === "medium" ? "Medium confidence" : "Low confidence";
    const interval = lower && upper ? `${lower}-${upper}` : vi ? "Cần thêm dữ liệu" : "Needs more data";
    const reason = vi
      ? fullLength ? `Dựa trên bài dài, ${accuracy}% đúng${timedOut ? ", có áp lực thời gian" : ""}.` : `Dựa trên ${total || 0} câu nên chỉ là band sàng lọc; cần proof/module để khóa band.`
      : fullLength ? `Based on a long diagnostic, ${accuracy}% correct${timedOut ? ", with timing pressure" : ""}.` : `Based on ${total || 0} questions, so this is a screening band; confirm it with proof/module work.`;
    return { level, label, interval, reason, width, accuracy };
  }

  function renderPretestConfidenceBandCard(test = {}, options = {}) {
    const vi = Boolean(options.vi);
    const band = diagnosticConfidenceBand(test, options);
    return `<section class="pretest-confidence-card confidence-${escapeHtml(band.level)}"><div><p class="eyebrow">${vi ? "Độ tin cậy của điểm" : "Score confidence"}</p><h4>${escapeHtml(band.label)} · ${escapeHtml(band.interval)}</h4><p>${escapeHtml(band.reason)}</p></div><span>${vi ? "Dùng để chọn bài học và độ khó tiếp theo" : "Used to choose the next lesson and difficulty"}</span></section>`;
  }

  function snippet(value, max = 180) {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
  }

  function renderPretestCoachSummary(test = {}, options = {}) {
    const vi = Boolean(options.vi);
    const correct = Number(test.correct || 0);
    const total = Number(test.total || test.reviewItems?.length || 0);
    const noAnswer = Number(options.noAnswer || 0);
    const band = diagnosticConfidenceBand(test, { vi, noAnswer });
    const plan = Array.isArray(options.plan) ? options.plan : [];
    const next = options.next || buildPretestNextBestAction({ test, plan, vi });
    const blockers = plan.length ? plan.map((item) => item.question?.skill).filter(Boolean).slice(0, 3).join(" · ") : vi ? "Chưa thấy lỗi ưu tiên rõ" : "No clear priority blocker";
    const calibration = total >= 44 ? (vi ? "Dữ liệu đủ dài hơn, band đáng tin hơn." : "Longer evidence makes this estimate more stable.") : (vi ? "Dự đoán còn sơ bộ vì đây là bài ngắn; hệ thống sẽ chắc hơn sau proof/module tiếp theo." : "This is still a screening estimate; proof/module work will make it more reliable.");
    return `<section class="pretest-coach-summary"><article><span>${vi ? "1. Bạn đang ở đâu" : "1. Where you are"}</span><strong>${escapeHtml(options.scoreLabel || test.scoreEstimate || "--")}</strong><p>${escapeHtml(`${correct}/${total} ${vi ? "câu đúng" : "correct"} · ${band.interval}`)}</p></article><article><span>${vi ? "2. Lỗi đang kéo điểm" : "2. Score blockers"}</span><strong>${escapeHtml(blockers)}</strong><p>${escapeHtml(plan.length ? (vi ? "Sửa đúng 3 cụm này trước khi làm thêm bài mới." : "Fix these clusters before adding new volume.") : calibration)}</p></article><article><span>${vi ? "3. Làm ngay 15 phút" : "3. Next 15 minutes"}</span><strong>${escapeHtml(next.title)}</strong><p>${escapeHtml(next.body)}</p></article></section><p class="pretest-calibration-note">${escapeHtml(calibration)}</p>`;
  }

  function renderMicroLessonCoachCard({ lesson = {}, vi = false, rule = "", example = "", trap = "", proof = "" } = {}) {
    const title = lesson.skill || lesson.title || (vi ? "Skill cần học" : "Target skill");
    return `<section class="student-micro-lesson-card"><div><p class="eyebrow">${vi ? "Bài học 3 phút" : "3-minute lesson"}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(vi ? "Đọc rất ngắn, tự kiểm tra bẫy, rồi luyện ngay. Đừng đọc dài trước khi làm bài." : "Read briefly, check the trap, then practice immediately.")}</p></div><div class="student-micro-lesson-grid"><article><span>${vi ? "Quy tắc 1 câu" : "One-sentence rule"}</span><p>${escapeHtml(rule || (vi ? "Đọc lại quy tắc, xác định đề hỏi gì, rồi chứng minh bằng dữ kiện." : "Review the rule, then prove it with a fresh item."))}</p></article><article><span>${vi ? "Ví dụ SAT mẫu" : "SAT-style example"}</span><p>${escapeHtml(snippet(example || (vi ? "Tự viết một ví dụ ngắn trước khi làm câu mới." : "Write one short example before doing a new item.")))}</p></article><article><span>${vi ? "Bẫy hay gặp" : "Common trap"}</span><p>${escapeHtml(snippet(trap || (vi ? "Đáp án sai thường giống chủ đề nhưng thiếu điều kiện." : "Wrong choices often match the topic but miss a condition.")))}</p></article><article><span>${vi ? "Cách kiểm tra nhanh" : "Quick check"}</span><p>${escapeHtml(proof || (vi ? "Làm đúng một câu mới cùng kỹ năng và tự giải thích được." : "Pass one fresh same-skill question."))}</p></article></div></section>`;
  }

  function buildPretestNextBestAction({ test = {}, plan = [], vi = false } = {}) {
    const first = plan[0];
    if (first?.question) {
      return {
        title: vi ? `Việc cần làm ngay: ${first.question.skill}` : `Do now: ${first.question.skill}`,
        body: vi ? "Đọc quy tắc ngắn, làm 10 câu cùng kỹ năng, rồi làm 2 câu mới để chứng minh đã sửa được lỗi." : "Read the short rule, run 10 same-skill items, then pass 2 fresh proof items.",
        action: "lesson",
        button: vi ? "Bắt đầu sửa lỗi" : "Start fixing",
        scope: first.question,
      };
    }
    if (Number(test.scoreEstimate || 0) >= 1300) return { title: vi ? "Tìm điểm đang chặn trần" : "Find the score ceiling blocker", body: vi ? "Không có lỗi ưu tiên rõ; làm một set khó có thời gian để xem skill nào còn vỡ khi áp lực tăng." : "No clear priority miss; use a hard timed set to see which skill breaks under pressure.", action: "practice", button: vi ? "Làm set khó" : "Start hard set", scope: { section: "All", domain: "All", skill: "All", difficulty: "Hard", source: "All" } };
    return { title: vi ? "Củng cố skill yếu nhất" : "Rebuild the weakest skill", body: vi ? "Làm 10 câu medium theo skill yếu nhất; nếu sai, mở ôn lỗi ngay thay vì làm tiếp thật nhiều câu." : "Do 10 medium items on the weakest skill; if a miss appears, review it before adding volume.", action: "practice", button: vi ? "Luyện 10 câu" : "Start 10 items", scope: { section: "All", domain: "All", skill: "All", difficulty: "Medium", source: "All" } };
  }

  function desmosMoveForQuestion(question = null, vi = false) {
    if (!question || question.section !== "Math") return null;
    const text = `${question.domain || ""} ${question.skill || ""} ${question.prompt || ""}`.toLowerCase();
    const move = (titleVi, titleEn, bodyVi, bodyEn) => ({ label: vi ? "Cách dùng Desmos" : "Desmos move", title: vi ? titleVi : titleEn, body: vi ? bodyVi : bodyEn });
    if (/system|intersection|two variables|line and parabola|parabola and line/.test(text)) return move("Vẽ hai quan hệ và đọc giao điểm", "Graph both relations and read intersections", "Nhập từng phương trình, dùng giao điểm để kiểm tra nghiệm; sau đó vẫn đối chiếu ý nghĩa trong đề.", "Enter each relation, use intersections to verify solutions, then check what the solution means in context.");
    if (/scatter|regression|line of best fit|model|exponential/.test(text)) return move("Dùng bảng hoặc regression để kiểm tra mô hình", "Use a table or regression to check the model", "Tạo bảng, nhập dữ liệu, so sánh tốc độ tăng/giảm; đừng chọn chỉ vì hệ số nhìn quen.", "Build a table, compare growth/decay, and avoid choosing a familiar-looking coefficient without checking fit.");
    if (/quadratic|vertex|minimum|maximum|x\^2|x²|parabola/.test(text)) return move("Graph để thấy đỉnh, nghiệm hoặc số giao điểm", "Graph to see vertex, roots, or number of intersections", "Dùng đồ thị để kiểm tra số nghiệm/đỉnh; dùng đại số nếu câu hỏi cần giá trị chính xác.", "Use the graph to verify roots/vertex count; use algebra when the item asks for an exact value.");
    if (question.difficulty === "Hard") return move("Dùng Desmos như bước kiểm tra thứ hai", "Use Desmos as the second-method check", "Giải bằng cấu trúc trước, rồi dùng graph/table để bắt lỗi dấu, đơn vị hoặc nghiệm ngoại lai.", "Solve structurally first, then use graph/table to catch sign, unit, or extraneous-solution errors.");
    return { label: vi ? "Tool choice" : "Tool choice", title: vi ? "Chọn mental/algebra nếu nhanh hơn Desmos" : "Choose mental/algebra if faster than Desmos", body: vi ? "SAT Math không phải câu nào cũng nên mở Desmos; chỉ dùng khi graph/table giúp tiết kiệm thời gian." : "Not every SAT Math item needs Desmos; use it only when graph/table saves time." };
  }

  function scorePathBand(score = 0) {
    const value = Number(score || 0);
    return value >= 1550 ? "1550+" : value >= 1450 ? "1450" : value >= 1300 ? "1300" : value >= 1100 ? "1100" : "starter";
  }

  function scoreCeilingBlocker(skillRows = [], evaluation = {}) {
    return [...(evaluation.priorityRows || []), ...(skillRows || [])].filter((row) => row?.skill).sort((a, b) => Number(a.mastery || a.accuracy || 0) - Number(b.mastery || b.accuracy || 0) || Number(b.wrong || 0) - Number(a.wrong || 0))[0] || null;
  }

  function render1600PathPanel({ baseline = 0, target = 1600, skillRows = [], readiness = {}, evaluation = {}, vi = false } = {}) {
    const score = Number(baseline || 0);
    const active = scorePathBand(score);
    const blocker = scoreCeilingBlocker(skillRows, evaluation);
    const projectedGain = blocker ? (Number(blocker.mastery || blocker.accuracy || 0) < 50 ? 35 : Number(blocker.mastery || blocker.accuracy || 0) < 70 ? 25 : 15) : 0;
    const bands = [
      ["1100", vi ? "Khóa nền đại số, grammar, evidence literal." : "Lock algebra, grammar, and literal evidence.", vi ? "80% easy/medium, không bỏ trống." : "80% easy/medium, no blank answers."],
      ["1300", vi ? "Chuyển sang medium/hard transfer và bẫy lựa chọn." : "Move into medium/hard transfer and answer traps.", vi ? "10 câu targeted + 2 proof fresh." : "10 targeted items + 2 fresh proof items."],
      ["1450", vi ? "Giảm lỗi careless/time pressure; mixed set theo module." : "Reduce careless/time-pressure errors with module-mixed sets.", vi ? "Hard accuracy 80%+, pacing ổn." : "80%+ hard accuracy with stable pacing."],
      ["1550+", vi ? "Mixed hard, stamina module, proof đa dạng skeleton." : "Mixed hard sets, stamina modules, and varied proof skeletons.", vi ? "3 hard timed proof khác form." : "3 hard timed proof items across forms."],
    ];
    const blockerText = blocker ? (vi ? `Trần điểm hiện tại đang bị chặn bởi ${blocker.skill}; hoàn tất block này có thể mở khoảng +${projectedGain} điểm.` : `Score-ceiling blocker: ${blocker.skill}; this block can unlock about +${projectedGain} points if completed.`) : vi ? "Cần thêm dữ liệu làm bài để xác định skill đang chặn trần điểm." : "More evidence is needed to identify the ceiling blocker.";
    const hardReady = score >= 1300;
    return `<section class="student-1600-path-panel"><div class="section-heading compact"><div><p class="eyebrow">${vi ? "Đường lên 1600" : "1600 Path"}</p><h3>${escapeHtml(vi ? `Mức hiện tại: ${score || "--"} -> mục tiêu ${target}` : `Current band: ${score || "--"} -> target ${target}`)}</h3><p class="muted">${escapeHtml(blockerText)}</p></div></div><div class="student-1600-path-grid">${bands.map(([id, body, gate]) => `<article class="${id === active || (active === "starter" && id === "1100") ? "active" : ""}"><span>${escapeHtml(id)}</span><strong>${escapeHtml(body)}</strong><small>${escapeHtml(gate)}</small></article>`).join("")}</div><div class="student-1600-next"><strong>${escapeHtml(hardReady ? (vi ? "Đã nên luyện sức bền module" : "Module stamina should be active") : (vi ? "Chưa nên tăng bài hard ồ ạt" : "Hard stamina not active yet"))}</strong><p>${escapeHtml(hardReady ? (vi ? "Mỗi tuần cần 1 mixed hard set và 1 module timed để kiểm tra sức bền." : "Each week needs one mixed hard set and one timed module to test stamina.") : (vi ? "Ưu tiên sửa skill nền và làm đúng 2 câu mới trước khi tăng khối lượng hard." : "Prioritize foundation repair and 2 fresh proof items before raising hard volume."))}</p><span>${vi ? "Mức sẵn sàng" : "Readiness"}: ${escapeHtml(readiness.band || "--")}</span></div></section>`;
  }

  function renderMasteryGatePanel(skillRows = [], options = {}) {
    const vi = Boolean(options.vi);
    const errorTagLabel = options.errorTagLabel || ((value) => value || "none");
    const rows = [...(skillRows || [])].filter((row) => row?.skill).sort((a, b) => Number(b.priorityScore || 0) - Number(a.priorityScore || 0) || Number(a.mastery || 0) - Number(b.mastery || 0)).slice(0, 4);
    if (!rows.length) return "";
    return `<section class="mastery-gate-panel"><div class="section-heading compact"><div><p class="eyebrow">${vi ? "Điều kiện qua skill" : "Mastery gate"}</p><h3>${vi ? "Chỉ tăng độ khó khi qua đủ 4 cửa" : "A skill is stable only after all 4 gates"}</h3></div></div><div class="mastery-gate-grid">${rows.map((row) => {
      const mastery = Number(row.mastery || row.accuracy || 0);
      const cleanPacing = !["time_pressure", "slow_correct"].includes(String(row.dominantErrorType || ""));
      const proofCount = Number(row.hardTimedFreshProofCount || 0);
      const gates = [
        [vi ? "Độ chính xác" : "Accuracy", mastery >= 80, `${mastery}%`],
        [vi ? "Tốc độ" : "Pacing", cleanPacing && mastery >= 68, cleanPacing ? (vi ? "ổn" : "stable") : errorTagLabel(row.dominantErrorType)],
        [vi ? "Làm lại không trợ giúp" : "No-help proof", proofCount >= 1, `${proofCount}/2`],
        [vi ? "Đổi dạng vẫn đúng" : "Mixed transfer", proofCount >= 3 || /Maintenance/i.test(String(row.masteryStage || "")), row.masteryStage || "Build"],
      ];
      return `<article><strong>${escapeHtml(row.skill)}</strong><small>${escapeHtml(row.domain || row.section || "")} · ${escapeHtml(row.proofRequirement?.passCondition || row.action || "")}</small><div class="mastery-gate-pills">${gates.map(([label, ok, detail]) => `<span class="${ok ? "ok" : "open"}">${escapeHtml(label)}: ${escapeHtml(detail)}</span>`).join("")}</div></article>`;
    }).join("")}</div></section>`;
  }

  return { buildPretestNextBestAction, desmosMoveForQuestion, diagnosticConfidenceBand, render1600PathPanel, renderMasteryGatePanel, renderMicroLessonCoachCard, renderPretestCoachSummary, renderPretestConfidenceBandCard, scoreCeilingBlocker, scorePathBand };
});
