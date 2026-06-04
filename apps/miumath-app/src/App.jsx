import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './App.css';
import {
  buildMiuMathDiagnosticQuestions,
  buildMiuMathErrorNotebookSummary,
  buildMiuMathLearningDashboard,
  loadMiuMathErrorNotebook,
  recordMiuMathErrorNotebookMistake,
  loadMiuMathLearningState,
  recordMiuMathAttempt,
  reviewMiuMathErrorNotebookEntry,
  saveMiuMathLearningState,
  saveMiuMathSharedLearningEvent,
  saveMiuMathSharedLearningEvents,
} from './learning.js';

const SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true, mathMl: true },
};

const sanitizeRenderedHtml = (html) => DOMPurify.sanitize(html, SANITIZE_OPTIONS);

const safeJsonParse = (rawValue, fallback) => {
  if (!rawValue) return fallback;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const getStoredJson = (key, fallback) => safeJsonParse(localStorage.getItem(key), fallback);

const pickRandom = (items) => {
  if (!items.length) return "";
  return items[Math.floor(Math.random() * items.length)];
};

// 11 Chuyên đề lớn lớp 9 Chuyên
const CHUYEN_DE_LIST = [
  { id: "algebra-simplification", name: "Rút gọn biểu thức & Cực trị đại số", icon: "💡" },
  { id: "equations-systems", name: "Phương trình & Hệ phương trình", icon: "🔑" },
  { id: "viet-applications", name: "Định lý Vi-et & Ứng dụng", icon: "🎯" },
  { id: "functions-graphs", name: "Hàm số & Đồ thị tương giao", icon: "📈" },
  { id: "word-problems", name: "Giải bài toán bằng cách lập PT/HPT", icon: "🏘️" },
  { id: "plane-geometry", name: "Hình học phẳng (Đường tròn & Tiếp tuyến)", icon: "📐" },
  { id: "trigonometry-practice", name: "Hệ thức lượng & Lượng giác thực tế", icon: "🏔️" },
  { id: "spatial-geometry", name: "Hình học không gian thực tế", icon: "📦" },
  { id: "statistics", name: "Thống kê & Biểu đồ", icon: "📊" },
  { id: "probability", name: "Xác suất & Biến cố", icon: "🎲" },
  { id: "casio-hacks", name: "Bí kíp Casio FX-580VN X giải nhanh", icon: "🧮" }
];

// Helper to translate LaTeX structures to standard Unicode text symbols
const translateLatexToUnicode = (latex) => {
  if (!latex) return "";
  let s = latex.trim();
  
  // 1. Support multi-line system of equations (begin{cases}) in Unicode fallback!
  s = s.replace(/\\begin\{cases\}([\s\S]+?)\\end\{cases\}/g, (match, body) => {
    let lines = body.split(/\\\\/);
    lines = lines.map(line => line.trim()).filter(line => line.length > 0);
    // Translate each line recursively to support nested LaTeX symbols
    let translatedLines = lines.map(line => translateLatexToUnicode(line));
    // Render as a beautiful stacked layout with a large curly brace
    let braceSize = translatedLines.length > 2 ? '3.2em' : '2.2em';
    return `<span style="display: inline-flex; align-items: center; vertical-align: middle; margin: 0 4px;"><span style="font-size: ${braceSize}; font-weight: 300; margin-right: 4px; line-height: 1; color: currentColor; font-family: system-ui, sans-serif; transform: translateY(-1px);">{</span><span style="display: inline-flex; flex-direction: column; text-align: left; line-height: 1.4; justify-content: center;">` + translatedLines.map(line => `<span style="white-space: nowrap;">${line}</span>`).join("") + `</span></span>`;
  });

  // 2. Replace sqrt first with stylized overline span (compatible with global font overrides)
  s = s.replace(/\\sqrt\{([\s\S]+?)\}/g, '<span style="display: inline-flex; align-items: baseline; white-space: nowrap;"><span style="font-family: inherit; font-size: 1.1em; transform: translateY(1px); line-height: 1; margin-right: 0.5px;">√</span><span style="border-top: 1.2px solid currentColor; padding-top: 1px; margin-left: 0.5px;">$1</span></span>');
  s = s.replace(/\\sqrt/g, "√");
  
  // 3. Replace frac
  s = s.replace(/\\frac\{([\s\S]+?)\}\{([\s\S]+?)\}/g, "($1)/($2)");
  
  // 4. Blackboards / Double-struck letters (R, N, Z, Q)
  s = s.replace(/\\mathbb\{R\}/g, "ℝ");
  s = s.replace(/\\mathbb\{N\}/g, "ℕ");
  s = s.replace(/\\mathbb\{Z\}/g, "ℤ");
  s = s.replace(/\\mathbb\{Q\}/g, "ℚ");
  s = s.replace(/\\mathbb\{([\s\S]+?)\}/g, "$1");
  
  // 5. Special decorations
  s = s.replace(/\\widehat\{([\s\S]+?)\}/g, "góc($1)");
  s = s.replace(/\\underline\{([\s\S]+?)\}/g, "<u>$1</u>");
  s = s.replace(/\\text\{([\s\S]+?)\}/g, "$1");
  
  // 6. Formatting controls (strip left/right scaling modifiers)
  s = s.replace(/\\left/g, "");
  s = s.replace(/\\right/g, "");
  
  // 7. Math symbols translation (order: longer keywords before shorter prefixes)
  s = s.replace(/\\Delta/g, "Δ");
  s = s.replace(/\\Omega/g, "Ω");
  s = s.replace(/\\alpha/g, "α");
  s = s.replace(/\\beta/g, "β");
  s = s.replace(/\\theta/g, "θ");
  s = s.replace(/\\pi/g, "π");
  s = s.replace(/\\approx/g, "≈");
  s = s.replace(/\\geq/g, "≥");
  s = s.replace(/\\ge/g, "≥");
  s = s.replace(/\\leq/g, "≤");
  s = s.replace(/\\le/g, "≤");
  s = s.replace(/\\neq/g, "≠");
  s = s.replace(/\\iff/g, "⇔");
  s = s.replace(/\\implies/g, "⇒");
  s = s.replace(/\\cdot/g, "·");
  s = s.replace(/\\times/g, "×");
  s = s.replace(/\\div/g, "÷");
  s = s.replace(/\\pm/g, "±");
  s = s.replace(/\\parallel/g, "∥");
  s = s.replace(/\\perp/g, "⊥");
  s = s.replace(/\\sim/g, "∽");
  s = s.replace(/\\cong/g, "≅");
  s = s.replace(/\\equiv/g, "≡");
  s = s.replace(/\\infty/g, "∞");
  s = s.replace(/\\in/g, "∈");
  s = s.replace(/\\cap/g, "∩");
  s = s.replace(/\\cup/g, "∪");
  s = s.replace(/\\to/g, "→");
  s = s.replace(/\\triangle/g, "△");
  
  // Degree symbol replacements
  s = s.replace(/\^\\circ/g, "°");
  s = s.replace(/\\degree/g, "°");
  s = s.replace(/\\circ/g, "°");
  
  // Spaces and other modifiers
  s = s.replace(/\\quad/g, "  ");
  s = s.replace(/\\gcd/g, "gcd");
  s = s.replace(/\\sin/g, "sin");
  s = s.replace(/\\cos/g, "cos");
  s = s.replace(/\\tan/g, "tan");
  
  // 8. Subscripts & Superscripts
  s = s.replace(/\^2/g, "²");
  s = s.replace(/\^3/g, "³");
  s = s.replace(/\^4/g, "⁴");
  s = s.replace(/\^n/g, "ⁿ");
  s = s.replace(/_1/g, "₁");
  s = s.replace(/_2/g, "₂");
  s = s.replace(/_3/g, "₃");
  s = s.replace(/_4/g, "₄");
  s = s.replace(/_o/g, "₀");
  s = s.replace(/_0/g, "₀");
  s = s.replace(/_M/g, "ₘ");
  s = s.replace(/_N/g, "ₙ");
  s = s.replace(/_xq/g, "ₓq");
  
  // Strip remaining backslashes
  s = s.replace(/\\/g, "");
  
  return s;
};

// Helper to render mixed LaTeX string to HTML securely (supports high-compatibility Unicode fallback!)
const renderMathCore = (text, useUnicodeFallback = false) => {
  if (!text) return "";
  
  if (useUnicodeFallback) {
    // High compatibility mode: translate math formulas into simple Unicode text blocks
    let rendered = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
      return `<span style="font-family: inherit; font-weight: 700; color: #0f766e; background: rgba(16, 185, 129, 0.04); padding: 4px 8px; border-radius: 6px; display: block; margin: 8px 0; overflow-x: auto; border-left: 3px solid #10b981;">${translateLatexToUnicode(expr)}</span>`;
    });
    rendered = rendered.replace(/\$([\s\S]+?)\$/g, (match, expr) => {
      return `<strong style="font-family: inherit; color: #0f766e; padding: 1px 4px; background: rgba(16, 185, 129, 0.03); border-radius: 4px; font-size: 0.95em;">${translateLatexToUnicode(expr)}</strong>`;
    });
    rendered = rendered.replace(/\n/g, "<br/>");
    rendered = rendered.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return sanitizeRenderedHtml(rendered);
  }
  
  // Replace double dollar signs first (display mode)
  let rendered = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return match;
    }
  });
  
  // Replace single dollar signs (inline mode)
  rendered = rendered.replace(/\$([\s\S]+?)\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return match;
    }
  });

  // Simple markdown bullet points and bolding
  rendered = rendered.replace(/\n/g, "<br/>");
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  return sanitizeRenderedHtml(rendered);
};

// Helper to map original subcategories to custom Casio subcategories
const getCasioSubCategory = (q) => {
  const sc = q.sub_category || "";
  if (
    sc.startsWith("algebra-simplification") || 
    sc === "algebra-evaluation" || 
    sc === "algebra-extrema-sub" || 
    sc === "casio-algebra"
  ) {
    return { id: "casio-algebra-simplification", name: "Rút gọn & Đại số Casio" };
  }
  if (
    sc.startsWith("eqsys-") || 
    sc === "func-parabola-line"
  ) {
    return { id: "casio-equations-systems", name: "Phương trình & Hệ phương trình" };
  }
  if (
    sc.startsWith("viet-")
  ) {
    return { id: "casio-viet-applications", name: "Định lý Vi-et & Tham số m" };
  }
  if (
    sc.startsWith("word-") || 
    sc.startsWith("stats-")
  ) {
    return { id: "casio-word-problems", name: "Giải toán thực tế & Thống kê" };
  }
  if (
    sc.startsWith("plane-") || 
    sc.startsWith("spatial-") || 
    sc.startsWith("trig-") || 
    sc === "func-coordinate-geometry"
  ) {
    return { id: "casio-geometry-trig", name: "Hình học & Lượng giác thực tế" };
  }
  return { id: "casio-other", name: "Thao tác Casio khác" };
};

const masteryStatusLabel = (status) => {
  const labels = {
    not_started: "Chua bat dau",
    collect_evidence: "Can them du lieu",
    repair: "Can sua loi",
    build: "Dang xay nen",
    building: "Dang xay nen",
    hard_proof: "Can bai kho",
    stable: "On dinh",
  };
  return labels[status] || status;
};

const recommendationLabel = (kind) => {
  const labels = {
    diagnostic: "Lam diagnostic",
    review: "Sua loi",
    practice: "Luyen tap",
    challenge: "Tang do kho",
  };
  return labels[kind] || kind;
};

function App() {

  // --- AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("student");

  // --- ADMIN PANEL STATE ---
  const [adminPreviewMode, setAdminPreviewMode] = useState(false);
  const [adminTab, setAdminTab] = useState("members"); // "members" or "add_question"
  const [newQId, setNewQId] = useState("");
  const [newQText, setNewQText] = useState("");
  const [newQCategory, setNewQCategory] = useState("algebra-simplification");
  const [newQSubCategory, setNewQSubCategory] = useState("");
  const [newQSubCategoryVn, setNewQSubCategoryVn] = useState("");
  const [newQOptionA, setNewQOptionA] = useState("");
  const [newQOptionB, setNewQOptionB] = useState("");
  const [newQOptionC, setNewQOptionC] = useState("");
  const [newQOptionD, setNewQOptionD] = useState("");
  const [newQCorrectAnswer, setNewQCorrectAnswer] = useState("A");
  const [newQHint1, setNewQHint1] = useState("");
  const [newQHint2, setNewQHint2] = useState("");
  const [newQThinkingSpecial, setNewQThinkingSpecial] = useState("");
  const [newQThinkingIntuition, setNewQThinkingIntuition] = useState("");
  const [newQSteps, setNewQSteps] = useState("");

  // Login handler
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("Vui lòng điền đầy đủ tài khoản và mật khẩu meow!");
      return;
    }
    const foundUser = users.find(
      u => u.username.toLowerCase() === authUsername.trim().toLowerCase() && u.password === authPassword
    );
    if (!foundUser) {
      setAuthError("Tài khoản hoặc mật khẩu không chính xác meow! 😿");
      return;
    }
    if (foundUser.approved === false) {
      setAuthError("Tài khoản của bạn đang chờ Quản trị viên phê duyệt meow! Vui lòng liên hệ Giáo viên hoặc thử lại sau nhé! ⏳🐾");
      return;
    }
    if (foundUser.active === false) {
      setAuthError("Tài khoản của bạn đã bị Quản trị viên khóa meow! 🔒");
      return;
    }
    
    // Success login
    setCurrentUser(foundUser);
    localStorage.setItem("miu_math_current_user", JSON.stringify(foundUser));
    setUserName(foundUser.username);
    setAuthUsername("");
    setAuthPassword("");
    
    // Load this user's data
    setMouseTrapList(getStoredJson(`miu_math_traps_${foundUser.username}`, []));
    setErrorNotebookEntries(loadMiuMathErrorNotebook(foundUser.username));

    setBookmarkedList(getStoredJson(`miu_math_bookmarks_${foundUser.username}`, []));

    const userCoins = localStorage.getItem(`miu_math_fish_coins_${foundUser.username}`);
    if (userCoins) setFishCoins(parseInt(userCoins));
    else setFishCoins(100);

    setDiaryEntries(getStoredJson(`miu_math_diary_${foundUser.username}`, []));

    setUnderstoodList(getStoredJson(`miu_math_understood_${foundUser.username}`, []));
    setLearningState(loadMiuMathLearningState(foundUser.username));

    setMode("dashboard");
    setMascotState("success");
    setMascotBubble(`Meow! Chào mừng ${foundUser.username} (${foundUser.role === 'admin' ? 'Quản trị viên' : 'Học sinh'}) đã đăng nhập thành công! 🎉`);
  };

  // Register handler
  const handleRegister = (e) => {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("Vui lòng điền đầy đủ tài khoản và mật khẩu meow!");
      return;
    }
    if (authUsername.trim().length < 3) {
      setAuthError("Tên tài khoản phải từ 3 ký tự trở lên meow!");
      return;
    }
    if (authPassword.length < 4) {
      setAuthError("Mật khẩu phải từ 4 ký tự trở lên meow!");
      return;
    }
    const exist = users.some(
      u => u.username.toLowerCase() === authUsername.trim().toLowerCase()
    );
    if (exist) {
      setAuthError("Tài khoản đã tồn tại trên hệ thống meow! 😿");
      return;
    }

    const newUser = {
      username: authUsername.trim(),
      password: authPassword,
      fullName: authFullName.trim() || authUsername.trim(),
      phone: authPhone.trim() || "Chưa cung cấp",
      role: "student",
      active: true,
      approved: false // New registered users are pending approval
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("miu_math_users", JSON.stringify(updatedUsers));
    
    setAuthSuccess("Đăng ký thành công meow! Đang chuyển sang màn hình đăng nhập và chờ Admin phê duyệt... ⏳🐾");
    setTimeout(() => {
      setAuthMode("login");
      setAuthUsername(newUser.username);
      setAuthPassword("");
      setAuthFullName("");
      setAuthPhone("");
      setAuthSuccess("");
      setAuthError("Tài khoản của bạn đã được đăng ký và đang chờ Quản trị viên phê duyệt kích hoạt meow! 🐾");
    }, 2500);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("miu_math_current_user");
    setLearningState(loadMiuMathLearningState("guest"));
    setErrorNotebookEntries(loadMiuMathErrorNotebook("guest"));
    setMode("dashboard");
    setMascotState("idle");
    setMascotBubble("Tạm biệt bạn meow! Hẹn gặp lại bạn sớm để cùng học nhé! 🐾");
  };

  // Admin panel functions
  const handleApproveUser = (username) => {
    const updated = users.map(u => u.username === username ? { ...u, approved: true } : u);
    setUsers(updated);
    localStorage.setItem("miu_math_users", JSON.stringify(updated));
    triggerMascotReaction("success", `Meow meow! Quản trị viên đã phê duyệt kích hoạt tài khoản cho @${username} thành công! 🎉🐾`);
  };

  const handleUpdateUserRole = (username, newRole) => {
    const updated = users.map(u => u.username === username ? { ...u, role: newRole } : u);
    setUsers(updated);
    localStorage.setItem("miu_math_users", JSON.stringify(updated));
    if (currentUser && currentUser.username === username) {
      const updatedCurrent = { ...currentUser, role: newRole };
      setCurrentUser(updatedCurrent);
      localStorage.setItem("miu_math_current_user", JSON.stringify(updatedCurrent));
    }
  };

  const handleToggleUserActive = (username) => {
    const updated = users.map(u => u.username === username ? { ...u, active: !u.active } : u);
    setUsers(updated);
    localStorage.setItem("miu_math_users", JSON.stringify(updated));
  };

  const handleDeleteUser = (username) => {
    if (username === "admin") {
      alert("Không thể xóa tài khoản admin mặc định meow!");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn từ chối/xóa thành viên ${username} không meow?`)) {
      const updated = users.filter(u => u.username !== username);
      setUsers(updated);
      localStorage.setItem("miu_math_users", JSON.stringify(updated));
    }
  };

  const handleSaveEditUser = (e) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    
    const updated = users.map(u => {
      if (u.username === editingUser) {
        return {
          ...u,
          fullName: editFullName.trim(),
          phone: editPhone.trim(),
          password: editPassword,
          role: editRole
        };
      }
      return u;
    });
    
    setUsers(updated);
    localStorage.setItem("miu_math_users", JSON.stringify(updated));
    
    // If the admin edited themselves, sync currentUser
    if (currentUser && currentUser.username === editingUser) {
      const updatedCurrent = {
        ...currentUser,
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        password: editPassword,
        role: editRole
      };
      setCurrentUser(updatedCurrent);
      localStorage.setItem("miu_math_current_user", JSON.stringify(updatedCurrent));
    }
    
    setEditingUser(null);
    triggerMascotReaction("success", `Meow meow! Đã cập nhật thông tin thành viên @${editingUser} thành công! 🎉🐾`);
  };

  // Add Question handler
  const handleAddQuestion = (e) => {
    if (e) e.preventDefault();
    if (!newQId.trim() || !newQText.trim() || !newQOptionA.trim() || !newQOptionB.trim() || !newQOptionC.trim() || !newQOptionD.trim()) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc meow!");
      return;
    }
    
    if (questions.some(q => q.id === newQId.trim())) {
      alert("Mã câu hỏi (ID) đã tồn tại meow! Vui lòng chọn ID khác.");
      return;
    }

    const newQuestion = {
      id: newQId.trim(),
      question_text: newQText.trim(),
      category: newQCategory,
      sub_category: newQSubCategory.trim() || null,
      sub_category_vn: newQSubCategoryVn.trim() || null,
      options: [
        { key: "A", content: newQOptionA.trim() },
        { key: "B", content: newQOptionB.trim() },
        { key: "C", content: newQOptionC.trim() },
        { key: "D", content: newQOptionD.trim() }
      ],
      correct_answer: newQCorrectAnswer,
      explanation: {
        thinking: `**Nhìn vào đề có gì đặc biệt?**\n${newQThinkingSpecial.trim() || "Chưa có phân tích dấu hiệu đặc biệt."}\n\n**Tại sao lại nghĩ ra cách làm như vậy?**\n${newQThinkingIntuition.trim() || "Chưa có phân tích trực giác sư phạm."}`,
        steps: newQSteps.trim() || "Chưa có các bước giải chi tiết.",
        hint1: newQHint1.trim() || null,
        hint2: newQHint2.trim() || null
      }
    };

    const customQuestions = getStoredJson("miu_math_custom_questions", []);
    const updatedCustom = [...customQuestions, newQuestion];
    localStorage.setItem("miu_math_custom_questions", JSON.stringify(updatedCustom));

    setQuestions([...questions, newQuestion]);
    
    setNewQId("");
    setNewQText("");
    setNewQOptionA("");
    setNewQOptionB("");
    setNewQOptionC("");
    setNewQOptionD("");
    setNewQHint1("");
    setNewQHint2("");
    setNewQThinkingSpecial("");
    setNewQThinkingIntuition("");
    setNewQSteps("");

    alert("Thêm câu hỏi mới thành công meow! Bạn có thể xem ngay câu hỏi này trong chuyên đề tương ứng.");
  };

  const handleDownloadJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(questions, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "questions_db.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Database state
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [learningState, setLearningState] = useState(() => loadMiuMathLearningState("guest"));
  
  // Core tracks & selections
  const [grade, setGrade] = useState("Lớp 9 Chuyên");
  const [mode, setMode] = useState("dashboard"); // "dashboard", "chuyen_de", "diagnostic_adaptive", "lam_de", "so_tay_bay_chuot"
  const [selectedChuyenDe, setSelectedChuyenDe] = useState(null); // Chuyen đề index
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedExamId, setSelectedExamId] = useState(null); // Exam paper ID
  const [diagnosticQuestionIds, setDiagnosticQuestionIds] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [spentCoinsMap, setSpentCoinsMap] = useState({}); // { questionId: number }
  const [understoodList, setUnderstoodList] = useState([]); // [questionId]
  
  // Interactive answers & hinting states
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: answer }
  const [hintLevel, setHintLevel] = useState({}); // { questionId: 0, 1, 2 }
  const [isAnswerCorrect, setIsAnswerCorrect] = useState({}); // { questionId: boolean }
  const [draftPadText, setDraftPadText] = useState(""); // Digital draft pad
  
  // User profile & personalized name & diary & gamification
  const [userName, setUserName] = useState("bạn");
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryText, setDiaryText] = useState("");
  const [diaryMood, setDiaryMood] = useState("😸");
  const [fishCoins, setFishCoins] = useState(100);
  const [useUnicodeFallback, setUseUnicodeFallback] = useState(false);
  const renderMath = (text) => renderMathCore(text, useUnicodeFallback);

  // Mascots states ("idle", "success", "failed", "hint")
  const [mascotState, setMascotState] = useState("idle");
  const [mascotBubble, setMascotBubble] = useState("Chào mừng bạn! Hôm nay chúng ta sẽ học chuyên đề nào đây meow? 🐾");
  
  // Spaced repetition & bookmarks
  const [mouseTrapList, setMouseTrapList] = useState([]); // Questions in incorrect notebook
  const [errorNotebookEntries, setErrorNotebookEntries] = useState(() => loadMiuMathErrorNotebook("guest"));
  const [bookmarkedList, setBookmarkedList] = useState([]);
  
  // Exam Mode states
  const [examActive, setExamActive] = useState(false);
  const [examTimeRemaining, setExamTimeRemaining] = useState(7200); // 120 minutes
  const [examAnswers, setExamAnswers] = useState({}); // temporary answers during exam
  const [examFinished, setExamFinished] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [examAnalysis, setExamAnalysis] = useState([]);

  // Timer reference
  const timerRef = useRef(null);

  const currentLearnerId = currentUser?.username || "guest";
  const errorNotebookSummary = buildMiuMathErrorNotebookSummary(errorNotebookEntries);

  const persistLearningState = (nextState, learnerId = currentLearnerId) => {
    setLearningState(nextState);
    saveMiuMathLearningState(learnerId, nextState);
  };

  // Load database and users session
  useEffect(() => {
    // Load default questions + custom questions
    fetch('/data/questions_db.json')
      .then(res => res.json())
      .then(data => {
        const customQ = getStoredJson("miu_math_custom_questions", []);
        setQuestions([...data, ...customQ]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi nạp ngân hàng câu hỏi:", err);
        const customQ = getStoredJson("miu_math_custom_questions", []);
        setQuestions(customQ);
        setLoading(false);
      });

    // Initialize users
    const savedUsers = localStorage.getItem("miu_math_users");
    let parsedUsers;
    if (!savedUsers) {
      parsedUsers = [
        { username: "admin", password: "admin", fullName: "Quản trị viên hệ thống", phone: "0999999999", role: "admin", active: true, approved: true },
        { username: "student", password: "student", fullName: "Học sinh chuyên cần", phone: "0888888888", role: "student", active: true, approved: true }
      ];
      localStorage.setItem("miu_math_users", JSON.stringify(parsedUsers));
    } else {
      parsedUsers = getStoredJson("miu_math_users", []);
      // Migrate existing accounts to have approved: true by default if not present
      let migrated = false;
      parsedUsers = parsedUsers.map(u => {
        if (u.approved === undefined) {
          migrated = true;
          return { ...u, approved: true };
        }
        return u;
      });
      if (migrated) {
        localStorage.setItem("miu_math_users", JSON.stringify(parsedUsers));
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsers(parsedUsers);

    // Initialize session
    const activeSession = localStorage.getItem("miu_math_current_user");
    if (activeSession) {
      const userObj = safeJsonParse(activeSession, null);
      if (!userObj) {
        localStorage.removeItem("miu_math_current_user");
        return;
      }
      setCurrentUser(userObj);
      setUserName(userObj.username);

      setMouseTrapList(getStoredJson(`miu_math_traps_${userObj.username}`, []));
      setErrorNotebookEntries(loadMiuMathErrorNotebook(userObj.username));

      setBookmarkedList(getStoredJson(`miu_math_bookmarks_${userObj.username}`, []));

      const userCoins = localStorage.getItem(`miu_math_fish_coins_${userObj.username}`);
      if (userCoins) setFishCoins(parseInt(userCoins));
      else setFishCoins(100);

      setDiaryEntries(getStoredJson(`miu_math_diary_${userObj.username}`, []));

      setUnderstoodList(getStoredJson(`miu_math_understood_${userObj.username}`, []));
      setLearningState(loadMiuMathLearningState(userObj.username));
    } else {
      // Load local storage for guest
      setMouseTrapList(getStoredJson("miu_math_traps", []));
      setErrorNotebookEntries(loadMiuMathErrorNotebook("guest"));
      
      setBookmarkedList(getStoredJson("miu_math_bookmarks", []));

      const savedName = localStorage.getItem("miu_math_username");
      if (savedName) {
        setUserName(savedName);
        setMascotBubble(`Chào mừng ${savedName} yêu quý! Hôm nay chúng ta sẽ học chuyên đề nào đây meow? 🐾`);
      }

      setDiaryEntries(getStoredJson("miu_math_diary", []));

      const savedCoins = localStorage.getItem("miu_math_fish_coins");
      if (savedCoins) setFishCoins(parseInt(savedCoins));

      setUnderstoodList(getStoredJson("miu_math_understood", []));
      setLearningState(loadMiuMathLearningState("guest"));
    }

    const savedFallback = localStorage.getItem("miu_math_unicode_fallback");
    if (savedFallback === "false") setUseUnicodeFallback(false);
    else if (savedFallback === "true") setUseUnicodeFallback(true);

    setSpentCoinsMap(getStoredJson("miu_math_spent_coins", {}));
  }, []);

  const saveUserName = (name) => {
    setUserName(name);
    localStorage.setItem("miu_math_username", name);
  };

  const saveDiary = (entries) => {
    setDiaryEntries(entries);
    if (currentUser) {
      localStorage.setItem(`miu_math_diary_${currentUser.username}`, JSON.stringify(entries));
    } else {
      localStorage.setItem("miu_math_diary", JSON.stringify(entries));
    }
  };

  const saveFishCoins = (coins) => {
    setFishCoins(coins);
    if (currentUser) {
      localStorage.setItem(`miu_math_fish_coins_${currentUser.username}`, coins);
    } else {
      localStorage.setItem("miu_math_fish_coins", coins);
    }
  };

  const saveUnicodeFallback = (val) => {
    setUseUnicodeFallback(val);
    localStorage.setItem("miu_math_unicode_fallback", val ? "true" : "false");
  };

  // Sync back to local storage
  const saveTraps = (newList) => {
    setMouseTrapList(newList);
    if (currentUser) {
      localStorage.setItem(`miu_math_traps_${currentUser.username}`, JSON.stringify(newList));
    } else {
      localStorage.setItem("miu_math_traps", JSON.stringify(newList));
    }
  };
  
  const saveBookmarks = (newList) => {
    setBookmarkedList(newList);
    if (currentUser) {
      localStorage.setItem(`miu_math_bookmarks_${currentUser.username}`, JSON.stringify(newList));
    } else {
      localStorage.setItem("miu_math_bookmarks", JSON.stringify(newList));
    }
  };

  const saveUnderstood = (newList) => {
    setUnderstoodList(newList);
    if (currentUser) {
      localStorage.setItem(`miu_math_understood_${currentUser.username}`, JSON.stringify(newList));
    } else {
      localStorage.setItem("miu_math_understood", JSON.stringify(newList));
    }
  };

  const addSpentCoins = (qId, amount) => {
    const newSpent = { ...spentCoinsMap, [qId]: (spentCoinsMap[qId] || 0) + amount };
    setSpentCoinsMap(newSpent);
    localStorage.setItem("miu_math_spent_coins", JSON.stringify(newSpent));
  };

  // Mascot dynamic reaction bubbles
  const triggerMascotReaction = (state, customText = "") => {
    setMascotState(state);
    if (customText) {
      setMascotBubble(customText);
      return;
    }
    
    if (state === "success") {
      const bubbleTexts = [
        `Meo meo! Quá xuất sắc ${userName} ơi! Miu tự hào về ${userName} lắm đó! 🎉`,
        `Tuyệt vời quá meo! ${userName} làm Miu nhảy cẫng lên vì vui sướng nè! 😸`,
        `Chính xác hoàn toàn! Tư duy của ${userName} đỉnh cao luôn meo meo! 🌟`
      ];
      setMascotBubble(pickRandom(bubbleTexts));
    } else if (state === "failed") {
      const bubbleTexts = [
        `Ui da... Sai mất tiêu rồi meow! Đừng nản lòng nhé ${userName}, Miu tin ${userName} sẽ làm được! 💕`,
        `Hình như có chút nhầm lẫn rồi ${userName} ơi! Thử rà lại các bước xem sao meow! 😼`,
        `Bình tĩnh nào ${userName}! Xem lại cạm bẫy để tránh bị chú chuột cắn nhé meow! 🐾`
      ];
      setMascotBubble(pickRandom(bubbleTexts));
    } else if (state === "hint") {
      setMascotBubble(`Miu đã mở khóa Gợi ý Tư duy rồi nè meow! ${userName} thử suy nghĩ lại một chút xem nào!`);
    } else {
      setMascotBubble(`Cố lên nhé! Miu luôn ngồi đây sưởi nắng và cổ vũ cho ${userName} meow meow! 😽`);
    }
  };

  // Answer submission logic (Topic Practice mode - 2 stage hint!)
  const handleSubmitAnswer = (qId, optionKey = null) => {
    const q = questions.find(item => item.id === qId);
    if (!q) return;

    const currentAnswer = optionKey || userAnswers[qId] || "";
    if (!currentAnswer.trim()) return;

    const cleanUser = currentAnswer.trim().toLowerCase();
    const cleanCorrect = q.correct_answer.trim().toLowerCase();
    const isCorrect = cleanUser === cleanCorrect;

    // Save temporary answer
    setUserAnswers(prev => ({ ...prev, [qId]: currentAnswer }));
    let recorded = null;
    if (hintLevel[qId] !== 2) {
      const attemptMode = mode === "diagnostic_adaptive" ? "diagnostic" : mode === "so_tay_bay_chuot" ? "review" : "practice";
      recorded = recordMiuMathAttempt(learningState, q, currentAnswer, attemptMode, currentLearnerId);
      if (recorded) {
        persistLearningState(recorded.state, currentLearnerId);
        saveMiuMathSharedLearningEvent(recorded.event);
      }
    }

    if (isCorrect) {
      const wasCorrect = isAnswerCorrect[qId];
      setIsAnswerCorrect(prev => ({ ...prev, [qId]: true }));
      setHintLevel(prev => ({ ...prev, [qId]: 2 })); // Unlock full explanation
      
      let coinMsg = "";
      if (!wasCorrect) {
        saveFishCoins(fishCoins + 15);
        coinMsg = ` (+15 xu cá hồi 🐟)`;
      }

      // Remove from traps if solved
      if (mouseTrapList.includes(qId)) {
        saveTraps(mouseTrapList.filter(id => id !== qId));
        const reviewedNotebook = reviewMiuMathErrorNotebookEntry(currentLearnerId, qId, 5, errorNotebookEntries);
        setErrorNotebookEntries(reviewedNotebook.entries);
      }

      const bubbleTexts = [
        `Meo meo! Quá xuất sắc ${userName} ơi! Miu tự hào về ${userName} lắm đó! 🎉${coinMsg}`,
        `Tuyệt vời quá meo! ${userName} làm Miu nhảy cẫng lên vì vui sướng nè! 😸${coinMsg}`,
        `Chính xác hoàn toàn! Tư duy của ${userName} đỉnh cao luôn meo meo! 🌟${coinMsg}`
      ];
      triggerMascotReaction("success", pickRandom(bubbleTexts));
    } else {
      setIsAnswerCorrect(prev => ({ ...prev, [qId]: false }));
      const currentLevel = hintLevel[qId] || 0;
      
      if (currentLevel === 0) {
        // First failed attempt -> Show Hint
        setHintLevel(prev => ({ ...prev, [qId]: 1 }));
        triggerMascotReaction("hint");
        
        // Add to spaced repetition traps list
        if (!mouseTrapList.includes(qId)) {
          saveTraps([...mouseTrapList, qId]);
        }
        if (recorded?.attempt) {
          const notebook = recordMiuMathErrorNotebookMistake(currentLearnerId, q, currentAnswer, recorded.attempt, errorNotebookEntries);
          setErrorNotebookEntries(notebook.entries);
        }
      } else {
        // Second failed attempt -> Unlock full explanation
        setHintLevel(prev => ({ ...prev, [qId]: 2 }));
        triggerMascotReaction("failed");
        if (recorded?.attempt) {
          const notebook = recordMiuMathErrorNotebookMistake(currentLearnerId, q, currentAnswer, recorded.attempt, errorNotebookEntries);
          setErrorNotebookEntries(notebook.entries);
        }
      }
    }
  };

  const handleBuyHint = (qId) => {
    if (fishCoins >= 15) {
      saveFishCoins(fishCoins - 15);
      addSpentCoins(qId, 15);
      setHintLevel(prev => ({ ...prev, [qId]: 1 }));
      triggerMascotReaction("hint", `Meow meow! Miu đã dùng phép thuật mở khóa Gợi ý Tư duy cho ${userName} rồi nhé! Đọc kỹ gợi ý để tự giải ra bài toán meow! 🐾✨`);
    } else {
      triggerMascotReaction("failed", `Meow meow... Số dư xu cá hồi không đủ rồi ${userName} ơi! Hãy làm đúng các câu hỏi hoặc hoàn thành đề thi thử để kiếm thêm xu nhé! 🐟😿`);
    }
  };

  const handleBuySolution = (qId) => {
    if (fishCoins >= 30) {
      saveFishCoins(fishCoins - 30);
      addSpentCoins(qId, 30);
      setHintLevel(prev => ({ ...prev, [qId]: 2 }));
      triggerMascotReaction("success", `Meow meow! Toàn bộ lời giải chi tiết, cạm bẫy và bí kíp Casio đã được mở khóa rồi meo! Chúc ${userName} học thật tốt nhé! 🌟🐾`);
    } else {
      triggerMascotReaction("failed", `Meow meow... Số dư xu cá hồi không đủ rồi ${userName} ơi! Hãy làm đúng các câu hỏi hoặc hoàn thành đề thi thử để kiếm thêm xu nhé! 🐟😿`);
    }
  };


  // Bookmark toggler
  const toggleBookmark = (qId) => {
    if (bookmarkedList.includes(qId)) {
      saveBookmarks(bookmarkedList.filter(id => id !== qId));
    } else {
      saveBookmarks([...bookmarkedList, qId]);
    }
  };

  // Start exam mode
  const handleStartExam = (examId) => {
    setSelectedExamId(examId);
    setSelectedSubCategory("all");
    setDiagnosticQuestionIds([]);
    setExamActive(true);
    setExamTimeRemaining(7200); // 120 mins
    setExamAnswers({});
    setExamFinished(false);
    setCurrentQuestionIndex(0);
    setMode("lam_de");
    triggerMascotReaction("idle", "Bắt đầu làm bài thi thử nào meow! Hãy giữ tập trung cao độ và căn thời gian chuẩn nhé!");
  };

  // Submit exam
  const handleFinishExam = () => {
    clearTimeout(timerRef.current);
    setExamActive(false);
    setExamFinished(true);

    const examQuestions = questions.filter(q => q.exam_id === selectedExamId);
    let correctCount = 0;
    const categoryStats = {}; // { category: { total: 0, correct: 0 } }
    let nextLearningState = learningState;
    let nextErrorNotebookEntries = errorNotebookEntries;
    const nextTrapList = [...mouseTrapList];
    const submittedLearningEvents = [];

    examQuestions.forEach(q => {
      // Initialize stats
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0, name: q.category_vn };
      }
      categoryStats[q.category].total += 1;

      const userAns = examAnswers[q.id] || "";
      const isCorrect = userAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
      const recorded = recordMiuMathAttempt(nextLearningState, q, userAns || "__blank__", "mock_test", currentLearnerId);
      if (recorded) {
        nextLearningState = recorded.state;
        submittedLearningEvents.push(recorded.event);
      }

      if (isCorrect) {
        correctCount += 1;
        categoryStats[q.category].correct += 1;
      } else {
        // Add wrong questions to spaced repetition notebook automatically
        if (!nextTrapList.includes(q.id)) {
          nextTrapList.push(q.id);
        }
        if (recorded?.attempt) {
          const notebook = recordMiuMathErrorNotebookMistake(currentLearnerId, q, userAns || "__blank__", recorded.attempt, nextErrorNotebookEntries);
          nextErrorNotebookEntries = notebook.entries;
        }
      }
    });

    persistLearningState(nextLearningState, currentLearnerId);
    saveMiuMathSharedLearningEvents(submittedLearningEvents);
    setErrorNotebookEntries(nextErrorNotebookEntries);
    saveTraps(nextTrapList);
    setExamScore(correctCount);

    const finalScoreFloat = (correctCount / examQuestions.length) * 10;
    const scoreStr = finalScoreFloat.toFixed(1);

    // Save student's exam score to the user list & local storage
    if (currentUser) {
      const updatedUsers = users.map(u => u.username === currentUser.username ? { ...u, currentScore: scoreStr } : u);
      setUsers(updatedUsers);
      localStorage.setItem("miu_math_users", JSON.stringify(updatedUsers));
      // Update session user as well so it stays synced
      const updatedCurrent = { ...currentUser, currentScore: scoreStr };
      setCurrentUser(updatedCurrent);
      localStorage.setItem("miu_math_current_user", JSON.stringify(updatedCurrent));
    }
    
    // Reward for completing mock exam: +100 fish coins
    saveFishCoins(fishCoins + 100);
    const coinMsg = ` (+100 xu cá hồi 🐟)`;
    
    // Compile stats
    const statsArray = Object.keys(categoryStats).map(key => ({
      category: key,
      category_vn: categoryStats[key].name,
      correct: categoryStats[key].correct,
      total: categoryStats[key].total,
      rate: Math.round((categoryStats[key].correct / categoryStats[key].total) * 100)
    }));
    
    setExamAnalysis(statsArray);
    
    let finalBubble;
    if (finalScoreFloat >= 8.0) {
      finalBubble = `Quá đỉnh meow! ${userName} đạt được ${correctCount}/${examQuestions.length} câu (${finalScoreFloat.toFixed(1)} điểm)! Ăn mừng mở tiệc thôi meow meow! 🐟🎉${coinMsg}`;
      setMascotState("success");
    } else if (finalScoreFloat >= 5.0) {
      finalBubble = `Hoàn thành tốt rồi meow! ${userName} đạt được ${correctCount}/${examQuestions.length} câu (${finalScoreFloat.toFixed(1)} điểm)${coinMsg}. Một vài chuyên đề còn bẫy chuột, rà lại cùng Miu nhé!`;
      setMascotState("idle");
    } else {
      finalBubble = `Cố gắng lên ${userName} ơi! Kết quả là ${correctCount}/${examQuestions.length} câu (${finalScoreFloat.toFixed(1)} điểm)${coinMsg}. Miu luôn ở bên đồng hành, cùng luyện chuyên đề lại nào! 🐾`;
      setMascotState("failed");
    }
    setMascotBubble(finalBubble);
  };

  // Exam timer logic
  useEffect(() => {
    if (examActive && examTimeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setExamTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (examActive && examTimeRemaining === 0) {
      timerRef.current = setTimeout(() => {
        handleFinishExam();
      }, 0);
    }
    return () => clearTimeout(timerRef.current);
    // handleFinishExam closes over current exam state; rerunning this effect on every
    // render would recreate the timeout loop unnecessarily.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examActive, examTimeRemaining]);

  // Back to dashboard
  const handleBackToDashboard = () => {
    setMode("dashboard");
    setSelectedChuyenDe(null);
    setSelectedSubCategory("all");
    setSelectedExamId(null);
    setDiagnosticQuestionIds([]);
    setExamActive(false);
    setExamFinished(false);
    triggerMascotReaction("idle", `Chào mừng ${userName} đáng yêu quay lại Bảng điều khiển học tập meow! 🐾`);
  };

  // Helper to format remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '5px solid #e6f7f0', borderTop: '5px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#064e3b', fontWeight: 600 }}>Mèo Miu đang sắp xếp bàn học meow meow...</p>
      </div>
    );
  }

  // If not logged in, render the login/register screen
  if (!currentUser) {
    return (
      <div className="App" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e6f7f0 0%, #f0faf5 50%, #d1fae5 100%)',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div className="card" style={{
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
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
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
                color: authMode === "login" ? '#059669' : '#9ca3af',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '10px',
                cursor: 'pointer',
                borderBottom: authMode === "login" ? '3px solid #10b981' : 'none'
              }}
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setAuthSuccess("");
              }}
            >
              Đăng Nhập
            </button>
            <button 
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: authMode === "register" ? '#059669' : '#9ca3af',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '10px',
                cursor: 'pointer',
                borderBottom: authMode === "register" ? '3px solid #10b981' : 'none'
              }}
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
                setAuthSuccess("");
              }}
            >
              Đăng Ký
            </button>
          </div>

          {authError && (
            <div style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              {authError}
            </div>
          )}

          {authSuccess && (
            <div style={{ background: '#d1fae5', borderLeft: '4px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              {authSuccess}
            </div>
          )}

          <form onSubmit={authMode === "login" ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  background: '#ffffff'
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
                  background: '#ffffff'
                }}
                required
              />
            </div>

            {authMode === "register" && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#064e3b' }}>📛 Tên hiển thị / Họ tên</label>
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
                      background: '#ffffff'
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
                      background: '#ffffff'
                    }}
                    required
                  />
                </div>

                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '10px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 600 }}>
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
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
            >
              {authMode === "login" ? "Đăng Nhập Ngay meow! 🐾" : "Tạo Tài Khoản Mới ✨"}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
            {authMode === "login" ? (
              <span>
                Chưa có tài khoản?{" "}
                <strong 
                  onClick={() => { setAuthMode("register"); setAuthError(""); }}
                  style={{ color: '#10b981', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Đăng ký ngay meow!
                </strong>
              </span>
            ) : (
              <span>
                Đã có tài khoản?{" "}
                <strong 
                  onClick={() => { setAuthMode("login"); setAuthError(""); }}
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

  // Filter questions based on selection
  const currentChuyenDeId = selectedChuyenDe !== null ? CHUYEN_DE_LIST[selectedChuyenDe].id : null;
  const activeQuestions = mode === "chuyen_de" 
    ? questions.filter(q => {
        const matchCategory = currentChuyenDeId === "casio-hacks"
          ? (q.category === "casio-hacks" || (q.explanation && q.explanation.casio))
          : q.category === currentChuyenDeId;
        if (!matchCategory) return false;
        
        if (selectedSubCategory === "all") return true;
        if (currentChuyenDeId === "casio-hacks") {
          return getCasioSubCategory(q).id === selectedSubCategory;
        } else {
          return q.sub_category === selectedSubCategory;
        }
      })
    : mode === "diagnostic_adaptive"
      ? diagnosticQuestionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
    : mode === "lam_de"
      ? questions.filter(q => q.exam_id === selectedExamId)
      : mode === "so_tay_bay_chuot"
        ? questions.filter(q => mouseTrapList.includes(q.id))
        : [];

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const learningDashboard = buildMiuMathLearningDashboard(learningState, questions);

  const openRecommendedQuestion = () => {
    const recommended = learningDashboard.nextQuestion;
    if (!recommended) {
      triggerMascotReaction("idle", "Learning core chua tim thay cau goi y moi. Hay lam them vai cau diagnostic hoac chuyen de truoc nhe.");
      return;
    }

    const categoryIndex = CHUYEN_DE_LIST.findIndex(cd => {
      if (cd.id === recommended.category) return true;
      return cd.id === "casio-hacks" && (recommended.category === "casio-hacks" || (recommended.explanation && recommended.explanation.casio));
    });
    const nextCategoryIndex = categoryIndex >= 0 ? categoryIndex : 0;
    const nextCategory = CHUYEN_DE_LIST[nextCategoryIndex];
    const targetQuestions = questions.filter(q => {
      if (nextCategory.id === "casio-hacks") return q.category === "casio-hacks" || (q.explanation && q.explanation.casio);
      return q.category === nextCategory.id;
    });
    const targetIndex = targetQuestions.findIndex(q => q.id === recommended.id);

    setSelectedChuyenDe(nextCategoryIndex);
    setSelectedSubCategory("all");
    setDiagnosticQuestionIds([]);
    setCurrentQuestionIndex(Math.max(0, targetIndex));
    setMode("chuyen_de");
    triggerMascotReaction("idle", "Learning core da chon mot cau phu hop voi du lieu mastery hien tai.");
  };

  const startAdaptiveDiagnostic = () => {
    const selected = buildMiuMathDiagnosticQuestions(learningState, questions, 10);
    if (!selected.length) {
      triggerMascotReaction("idle", "Chua co du cau hoi diagnostic moi. Hay kiem tra ngan hang cau hoi hoac lam them bai chuyen de.");
      return;
    }

    setDiagnosticQuestionIds(selected.map(q => q.id));
    setSelectedChuyenDe(null);
    setSelectedSubCategory("all");
    setSelectedExamId(null);
    setExamActive(false);
    setExamFinished(false);
    setCurrentQuestionIndex(0);
    setMode("diagnostic_adaptive");
    triggerMascotReaction("idle", `Learning core da tao diagnostic ${selected.length} cau de do baseline hien tai.`);
  };

  return (
    <div className="App">
      {/* Header Area */}
      <header style={{ background: '#ffffff', borderBottom: '2px solid rgba(16, 185, 129, 0.12)', sticky: 'top', zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleBackToDashboard}>
            <span className="decor-paw"></span>
            <h1 style={{ fontSize: '1.4rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              MiuMath <span style={{ fontSize: '0.8rem', background: '#e6f7f0', color: '#10b981', padding: '3px 8px', borderRadius: '12px' }}>Vite+React</span>
            </h1>
          </div>
          {/* Grade Selector & Diary Button - Extensible to any level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                border: '2px solid ' + (useUnicodeFallback ? '#f59e0b' : 'rgba(16, 185, 129, 0.2)'),
                transition: 'var(--transition)'
              }}
              onClick={() => {
                const newVal = !useUnicodeFallback;
                saveUnicodeFallback(newVal);
                triggerMascotReaction("idle", newVal 
                  ? `Đã bật chế độ Unicode tương thích cao meow! Nếu máy ${userName} bị lỗi không nhìn thấy dấu căn (√), chế độ này sẽ giúp hiển thị hoàn hảo! ⚙️🐾`
                  : `Đã tắt chế độ Unicode, quay lại hiển thị công thức sắc nét meow! 🐾`
                );
              }}
              title="Nhấn để đổi chế độ hiển thị ký tự toán nếu máy bạn bị lỗi font meow!"
            >
              {useUnicodeFallback ? "⚙️ Chế độ: Chữ Đẹp (Unicode)" : "⚙️ Chế độ: Mặc Định"}
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
                  transition: 'var(--transition)'
                }}
                onClick={() => {
                  setMode("admin_panel");
                  setSelectedChuyenDe(null);
                  setSelectedExamId(null);
                  setDiagnosticQuestionIds([]);
                  setExamActive(false);
                  setExamFinished(false);
                  triggerMascotReaction("idle", "Chào mừng Sếp quay lại phòng điều khiển tối cao meow! 🐾💻");
                }}
              >
                💻 Quản Trị Hệ Thống
              </button>
            )}

            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, border: '2px solid rgba(16, 185, 129, 0.2)', color: '#064e3b' }}
              onClick={() => {
                setMode("nhat_ky");
                setSelectedChuyenDe(null);
                setSelectedExamId(null);
                setDiagnosticQuestionIds([]);
                setExamActive(false);
                setExamFinished(false);
                triggerMascotReaction("idle", `Hôm nay ${userName} muốn ghi chép lại điều gì với Miu meow meow? 📔`);
              }}
            >
              📔 Nhật ký của {userName}
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ 
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontWeight: 600, 
                color: '#ef4444', 
                borderColor: 'rgba(239, 68, 68, 0.2)' 
              }}
              onClick={handleLogout}
            >
              Đăng xuất 🚪
            </button>

            <select 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '20px', border: '2px solid #10b981', outline: 'none', fontWeight: 600, color: '#064e3b', cursor: 'pointer', background: '#ffffff' }}
            >
              <option value="Lớp 9 Chuyên">🎓 Toán Lớp 9 Chuyên</option>
              <option value="Lớp 9 Thường">📘 Toán Lớp 9 Thường (Mở rộng)</option>
              <option value="Lớp 6">🧒 Toán Lớp 6 (Mở rộng)</option>
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
          fontFamily: 'system-ui, sans-serif'
        }}>
          <span>💡 Bạn đang xem ứng dụng dưới vai trò **HỌC SINH** để kiểm thử giao diện & tính năng.</span>
          <button 
            className="btn btn-primary"
            style={{ padding: '4px 12px', fontSize: '0.78rem', background: '#f59e0b', borderColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => {
              setAdminPreviewMode(false);
              triggerMascotReaction("idle", "Đã quay trở lại Giao diện Quản trị viên meow! 👑🐾");
            }}
          >
            Quay lại Admin Dashboard 👑
          </button>
        </div>
      )}

      <main className="container" style={{ padding: '20px 16px', minHeight: 'calc(100vh - 100px)' }}>
        
        {/* Core Layout Grid: Left Content, Right Mascot Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Dashboard Mode */}
            {/* DEDICATED ADMIN DASHBOARD */}
            {mode === "dashboard" && currentUser && currentUser.role === "admin" && !adminPreviewMode && (
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
            )}

            {mode === "dashboard" && (!currentUser || currentUser.role !== "admin" || adminPreviewMode) && (
              <>
                {/* Welcoming Mascot Jumbotron */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f9fdfb 100%)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ background: '#e6f7f0', padding: '16px', borderRadius: '50%' }}>
                    <span style={{ fontSize: '2.5rem' }}>🎓</span>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      Chào mừng 
                      <input 
                        type="text" 
                        value={userName} 
                        onChange={(e) => saveUserName(e.target.value)} 
                        placeholder="tên của bạn..."
                        style={{ 
                          border: 'none', 
                          borderBottom: '2px dashed #10b981', 
                          background: 'transparent', 
                          color: '#10b981', 
                          fontWeight: 800, 
                          outline: 'none', 
                          width: '140px',
                          padding: '0 4px',
                          textAlign: 'center',
                          fontSize: '1.35rem'
                        }}
                        title="Bấm để thay đổi tên của bạn meow!"
                      /> 
                      đến với MiuMath của {grade}!
                    </h2>
                    <p style={{ color: '#15803d', fontSize: '0.95rem' }}>
                      Cùng mèo Miu vượt qua mọi thử thách cạm bẫy toán học thi vào 10 chuyên meow! Hãy chọn một hướng học tập dưới đây.
                    </p>
                  </div>
                </div>

                <div className="card" style={{ background: '#ffffff', border: '2px solid rgba(16, 185, 129, 0.16)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: '#047857', fontSize: '0.78rem', fontWeight: 800, letterSpacing: 0 }}>ADAPTIVE LEARNING CORE</span>
                      <h3 style={{ color: '#064e3b', fontSize: '1.18rem', fontWeight: 800, margin: '4px 0' }}>
                        Knowledge Graph + Mastery Model
                      </h3>
                      <p style={{ color: '#15803d', fontSize: '0.9rem', margin: 0 }}>
                        Du lieu luyen tap hien duoc ghi vao learning core chung de tinh diem thanh thao va goi y bai tiep theo.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: 800 }}
                        onClick={startAdaptiveDiagnostic}
                      >
                        Lam diagnostic
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: 800 }}
                        onClick={openRecommendedQuestion}
                      >
                        Mo bai goi y
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#f0faf5', padding: '12px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                      <span style={{ color: '#047857', fontSize: '0.74rem', fontWeight: 800 }}>ATTEMPTS</span>
                      <strong style={{ display: 'block', color: '#064e3b', fontSize: '1.35rem', marginTop: '4px' }}>{learningDashboard.totalAttempts}</strong>
                    </div>
                    <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                      <span style={{ color: '#c2410c', fontSize: '0.74rem', fontWeight: 800 }}>CAN SUA LOI</span>
                      <strong style={{ display: 'block', color: '#9a3412', fontSize: '1.35rem', marginTop: '4px' }}>{learningDashboard.repairSkills}</strong>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      <span style={{ color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 800 }}>ON DINH</span>
                      <strong style={{ display: 'block', color: '#1e3a8a', fontSize: '1.35rem', marginTop: '4px' }}>{learningDashboard.stableSkills}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#475569', fontSize: '0.74rem', fontWeight: 800 }}>NEXT</span>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '1rem', marginTop: '7px' }}>{recommendationLabel(learningDashboard.recommendation.kind)}</strong>
                    </div>
                  </div>

                  {learningDashboard.topRows.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      {learningDashboard.topRows.map(row => (
                        <div key={row.key} style={{ border: '1px solid #e6f7f0', borderRadius: '12px', padding: '10px', background: '#ffffff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                            <strong style={{ color: '#064e3b', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>{row.id}</strong>
                            <span style={{ color: row.status === 'repair' ? '#dc2626' : '#047857', fontSize: '0.75rem', fontWeight: 800 }}>
                              {masteryStatusLabel(row.status)}
                            </span>
                          </div>
                          <div style={{ marginTop: '8px', height: '8px', background: '#e6f7f0', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${row.score}%`, height: '100%', background: row.status === 'repair' ? '#fb923c' : '#10b981' }}></div>
                          </div>
                          <small style={{ display: 'block', color: '#64748b', marginTop: '6px' }}>
                            Score {row.score}% | Accuracy {row.accuracy}% | {row.attempts} attempts
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#475569', padding: '12px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600 }}>
                      Chua co du lieu mastery. Hay lam diagnostic hoac vai cau chuyen de de he thong bat dau ca nhan hoa.
                    </div>
                  )}

                  {(learningDashboard.learningPath?.steps || []).length > 0 && (
                    <div style={{ border: '1px solid #dbeafe', borderRadius: '12px', padding: '12px', background: '#f8fbff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div>
                          <span style={{ color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 800 }}>LEARNING PATH</span>
                          <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.98rem', marginTop: '3px' }}>
                            Next: {learningDashboard.learningPath?.nextStep?.label || 'Mixed challenge'}
                          </strong>
                        </div>
                        <span style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700 }}>
                          {learningDashboard.learningPath?.steps?.length || 0} buoc
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px' }}>
                        {(learningDashboard.learningPath?.steps || []).map((step, index) => (
                          <div key={step.id} style={{ background: '#ffffff', border: step.target ? '1px solid #60a5fa' : '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', minHeight: '112px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                              <span style={{ width: '24px', height: '24px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: step.status === 'repair' ? '#ffedd5' : '#eff6ff', color: step.status === 'repair' ? '#c2410c' : '#1d4ed8', fontWeight: 900, fontSize: '0.78rem', flex: '0 0 auto' }}>
                                {index + 1}
                              </span>
                              <span style={{ color: step.unlocked ? '#047857' : '#64748b', fontSize: '0.72rem', fontWeight: 800 }}>
                                {step.unlocked ? 'OPEN' : 'LOCKED'}
                              </span>
                            </div>
                            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.84rem', marginTop: '8px', lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                              {step.label}
                            </strong>
                            <small style={{ display: 'block', color: step.status === 'repair' ? '#c2410c' : '#475569', marginTop: '6px', fontWeight: 700 }}>
                              {masteryStatusLabel(step.status)} | {step.masteryScore}% | {step.attempts} attempts
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Study Track 1: Learn & Practice by Topic/Theme */}
                <div>
                  <h3 style={{ margin: '20px 0 12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="decor-paw"></span> Hướng 1: Tự Học & Luyện Tập Chuyên Đề
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {CHUYEN_DE_LIST.map((cd, index) => {
                      // Count number of questions for this topic
                      const qCount = cd.id === "casio-hacks"
                        ? questions.filter(q => q.category === "casio-hacks" || (q.explanation && q.explanation.casio)).length
                        : questions.filter(q => q.category === cd.id).length;
                      return (
                        <div 
                          key={cd.id} 
                          className="card" 
                          style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                          onClick={() => {
                            if (qCount === 0) {
                              triggerMascotReaction("idle", "Chuyên đề này hiện đang được mèo Miu số hóa meow! Sen thử ôn tập chuyên đề khác nhé!");
                              return;
                            }
                            setSelectedChuyenDe(index);
                            setSelectedSubCategory("all");
                            setDiagnosticQuestionIds([]);
                            setCurrentQuestionIndex(0);
                            setMode("chuyen_de");
                            triggerMascotReaction("idle", `Bắt đầu học chuyên đề '${cd.name}' meow! Hãy xem tóm tắt lý thuyết trước nhé!`);
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.8rem', background: '#e6f7f0', padding: '8px', borderRadius: '12px' }}>{cd.icon}</span>
                            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, background: '#e6f7f0', padding: '3px 8px', borderRadius: '12px' }}>
                              {qCount} bài tập
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1rem', color: '#064e3b', fontWeight: 600, lineHeight: 1.4 }}>{cd.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '6px' }}>
                            {qCount > 0 ? "👉 Học lý thuyết & Giải bẫy ngay" : "⏳ Đang cập nhật meow"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Study Track 2: Mock Exam Real Test */}
                <div>
                  <h3 style={{ margin: '28px 0 12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="decor-paw"></span> Hướng 2: Thi Thử Bộ Đề Thực Chiến
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {Array.from(new Set(questions.map(q => q.exam_id))).filter(Boolean).sort((a, b) => a - b).map(examId => {
                      const qCount = questions.filter(q => q.exam_id === examId).length;
                      return (
                        <div 
                          key={examId} 
                          className="card"
                          style={{ cursor: 'pointer', borderLeft: '5px solid #10b981' }}
                          onClick={() => handleStartExam(examId)}
                        >
                          <h4 style={{ fontSize: '1.1rem', color: '#064e3b', fontWeight: 700 }}>Đề Ôn Luyện Số {examId.toString().padStart(2, '0')}</h4>
                          <p style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '4px' }}>
                            {qCount > 0 ? `📝 Bộ đề ${qCount} câu - 120 phút` : "⏳ Dự phòng meow"}
                          </p>
                          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '12px', padding: '6px 12px', fontSize: '0.85rem' }}>
                            Bắt đầu thi thử ⚡
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Topic Practice Mode */}
                        {/* Admin Panel Mode */}
            {mode === "admin_panel" && currentUser && currentUser.role === "admin" && (
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
            )}

            {(mode === "diagnostic_adaptive" || (mode === "chuyen_de" && selectedChuyenDe !== null)) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Subheader bar */}
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" onClick={handleBackToDashboard}>
                    ⬅️ Trở lại Bảng điều khiển
                  </button>
                  <h3 style={{ color: '#064e3b', fontWeight: 700, fontSize: '1.15rem' }}>
                    {mode === "diagnostic_adaptive" ? `Adaptive Diagnostic: ${activeQuestions.length} cau` : `Chuyen de: ${CHUYEN_DE_LIST[selectedChuyenDe].name}`}
                  </h3>
                </div>

                {/* Theory Section Jumbotron */}
                {mode === "chuyen_de" && (
                <div className="card" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                  <h4 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    📚 Tóm Tắt Kiến Thức Cốt Lõi Lớp 9 Chuyên
                  </h4>
                  <div style={{ fontSize: '0.92rem', color: '#78350f' }}>
                    {currentChuyenDeId === "algebra-simplification" && (
                      <div dangerouslySetInnerHTML={{ __html: renderMath(
                        `- **BĐT Cauchy (AM-GM)** cho 2 số không âm $x, y$: $\\frac{x+y}{2} \\geq \\sqrt{xy}$. Dấu "=" xảy ra khi $x = y$.\n` +
                        `- **BĐT Bunhiacopxki (Cauchy-Schwarz)** cho 2 bộ số $(a, b)$ và $(x, y)$: $(ax+by)^2 \\leq (a^2+b^2)(x^2+y^2)$. Dấu "=" xảy ra khi $\\frac{a}{x} = \\frac{b}{y}$.\n` +
                        `- **Mẹo tìm cực trị**: Sử dụng biến đổi thêm bớt tạo bình phương hoặc chia khoảng giá trị $x$ hợp lý. Không được dùng đạo hàm của cấp 3 khi làm bài thi tự luận!`
                      ) }} />
                    )}
                    {currentChuyenDeId === "trigonometry-practice" && (
                      <div dangerouslySetInnerHTML={{ __html: renderMath(
                        `- **Tỉ số lượng giác góc nhọn**: $\\sin = \\frac{Doi}{Huyen}$, $\\cos = \\frac{Ke}{Huyen}$, $\\tan = \\frac{Doi}{Ke}$, $\\cot = \\frac{Ke}{Doi}$.\n` +
                        `- **Hệ thức cơ bản**: $\\sin^2 x + \\cos^2 x = 1$; $\\tan x \\cdot \\cot x = 1$; $\\tan x = \\frac{\\sin x}{\\cos x}$.\n` +
                        `- **Casio Hacks**: Dùng phím \`[sin]\`, \`[cos]\`, \`[tan]\` và phím độ-phút-giây \`[°'"]\` để tính nhanh góc của tháp hoặc máy bay.`
                      ) }} />
                    )}
                    {currentChuyenDeId === "casio-hacks" && (
                      <div dangerouslySetInnerHTML={{ __html: renderMath(
                        `- **Tính năng SOLVE (SHIFT CALC)**: Tìm nghiệm xấp xỉ cực nhanh của phương trình chứa căn phức tạp. Nhập phương trình, ấn \`[SHIFT]\` \`[CALC]\`, nhập điểm xuất phát dò nghiệm và ấn \`[=]\`.\n` +
                        `- **Tính năng TABLE (MENU 8)**: Quét bảng giá trị tìm nghiệm nguyên, tìm cực trị đại số hoặc khảo sát miền xác định. Nhập hàm $f(x)$, Start: $-10$, End: $10$, Step: $1$.\n` +
                        `- **Kỹ thuật Tham số hóa đặc biệt**: Thay $m = 100$ hoặc $m = 1000$ vào phương trình để máy tính giải ra nghiệm số thập phân, sau đó phân tích ngược ra đa thức chứa tham số $m$ cực kỳ vi diệu!`
                      ) }} />
                    )}
                    {currentChuyenDeId !== "algebra-simplification" && currentChuyenDeId !== "trigonometry-practice" && currentChuyenDeId !== "casio-hacks" && (
                      <div dangerouslySetInnerHTML={{ __html: renderMath(
                        `- Học sinh lớp 9 ôn thi Chuyên cần ghi nhớ: Chỉ sử dụng các công cụ hình học phẳng (tam giác đồng dạng, tứ giác nội tiếp) và biến đổi đại số sơ cấp của THCS.\n` +
                        `- **Casio Tips**: Sử dụng phím tính năng giải phương trình/hệ phương trình (\`MENU 9\`) hoặc rà bảng giá trị (\`MENU 8\`) để đẩy nhanh tốc độ thử đáp án trắc nghiệm.`
                      ) }} />
                    )}
                  </div>
                </div>
                )}

                {/* Subcategory Filter Pills */}
                {mode === "chuyen_de" && (() => {
                  const activeSubCategories = currentChuyenDeId === "casio-hacks"
                    ? [
                        { id: "casio-algebra-simplification", name: "Rút gọn & Đại số Casio" },
                        { id: "casio-equations-systems", name: "Phương trình & Hệ phương trình" },
                        { id: "casio-viet-applications", name: "Định lý Vi-et & Tham số m" },
                        { id: "casio-word-problems", name: "Giải toán thực tế & Thống kê" },
                        { id: "casio-geometry-trig", name: "Hình học & Lượng giác thực tế" }
                      ]
                    : Array.from(new Set(
                        questions
                          .filter(q => q.category === currentChuyenDeId)
                          .map(q => JSON.stringify({ id: q.sub_category, name: q.sub_category_vn }))
                    )).map(str => safeJsonParse(str, null)).filter(x => x?.id);

                  if (activeSubCategories.length === 0) return null;

                  return (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', margin: '5px 0 10px 0', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
                      <button
                        className="btn"
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          background: selectedSubCategory === 'all' ? '#10b981' : '#f0faf5',
                          color: selectedSubCategory === 'all' ? '#ffffff' : '#047857',
                          border: '2px solid ' + (selectedSubCategory === 'all' ? '#10b981' : 'rgba(16, 185, 129, 0.15)'),
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => {
                          setSelectedSubCategory('all');
                          setCurrentQuestionIndex(0);
                        }}
                      >
                        🐾 Tất cả ({questions.filter(q => currentChuyenDeId === "casio-hacks" ? (q.category === "casio-hacks" || (q.explanation && q.explanation.casio)) : q.category === currentChuyenDeId).length})
                      </button>
                      {activeSubCategories.map(sc => {
                         const scCount = questions.filter(q => {
                           const matchCategory = currentChuyenDeId === "casio-hacks"
                             ? (q.category === "casio-hacks" || (q.explanation && q.explanation.casio))
                             : q.category === currentChuyenDeId;
                           if (!matchCategory) return false;
                           
                           if (currentChuyenDeId === "casio-hacks") {
                             return getCasioSubCategory(q).id === sc.id;
                           } else {
                             return q.sub_category === sc.id;
                           }
                         }).length;
                         return (
                           <button
                             key={sc.id}
                             className="btn"
                             style={{
                               padding: '6px 14px',
                               borderRadius: '20px',
                               fontSize: '0.85rem',
                               fontWeight: 600,
                               whiteSpace: 'nowrap',
                               background: selectedSubCategory === sc.id ? '#10b981' : '#ffffff',
                               color: selectedSubCategory === sc.id ? '#ffffff' : '#064e3b',
                               border: '2px solid ' + (selectedSubCategory === sc.id ? '#10b981' : 'rgba(16, 185, 129, 0.15)'),
                               transition: 'all 0.2s ease'
                             }}
                             onClick={() => {
                               setSelectedSubCategory(sc.id);
                               setCurrentQuestionIndex(0);
                             }}
                           >
                             📌 {sc.name} ({scCount})
                           </button>
                         );
                      })}
                    </div>
                  );
                })()}

                {/* Main Question Display Card */}
                {currentQuestion ? (
                  <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    
                    {/* Page tracker & Bookmark */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                      <span style={{ fontWeight: 600, color: '#15803d', fontSize: '0.9rem' }}>
                        Câu {currentQuestionIndex + 1} / {activeQuestions.length} ({currentQuestion.exam_name})
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 12px', background: bookmarkedList.includes(currentQuestion.id) ? '#fffbeb' : '#f0faf5', border: '1px solid #10b981', fontSize: '0.85rem' }}
                          onClick={() => toggleBookmark(currentQuestion.id)}
                        >
                          {bookmarkedList.includes(currentQuestion.id) ? "⭐ Đã lưu" : "☆ Lưu câu hỏi"}
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div style={{ fontSize: '1.05rem', fontWeight: 500, color: '#064e3b' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.question_text) }} />

                    {currentQuestion.image && (
                      <div style={{ margin: '14px 0', textAlign: 'center', background: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <img src={currentQuestion.image} alt="Hình vẽ minh họa" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* DẠNG BÀI 1: TRẮC NGHIỆM */}
                    {currentQuestion.type === "multiple_choice" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        {currentQuestion.options.map(opt => {
                          const isSelected = userAnswers[currentQuestion.id] === opt.key;
                          const isSubmitted = hintLevel[currentQuestion.id] === 2;
                          const isWrongAns = isSubmitted && isSelected && !isAnswerCorrect[currentQuestion.id];
                          const isCorrectAns = isSubmitted && opt.key === currentQuestion.correct_answer;
                          
                          let bg = '#ffffff';
                          let borderClr = 'var(--color-border)';
                          if (isSelected) {
                            bg = 'var(--color-primary-soft)';
                            borderClr = 'var(--color-primary)';
                          }
                          if (isCorrectAns) {
                            bg = '#ecfdf5';
                            borderClr = '#10b981';
                          } else if (isWrongAns) {
                            bg = '#fef2f2';
                            borderClr = '#ef4444';
                          }

                          return (
                            <div 
                              key={opt.key}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                padding: '14px 20px', 
                                borderRadius: '16px', 
                                border: `2px solid ${borderClr}`, 
                                background: bg, 
                                cursor: isSubmitted ? 'not-allowed' : 'pointer',
                                transition: 'var(--transition)'
                              }}
                              onClick={() => {
                                if (isSubmitted) return;
                                setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.key }));
                              }}
                            >
                              <span style={{ 
                                display: 'inline-flex', 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                border: '2px solid', 
                                borderColor: isSelected ? 'var(--color-primary)' : '#cbd5e1', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 700,
                                background: isSelected ? 'var(--color-primary)' : 'transparent',
                                color: isSelected ? '#ffffff' : '#475569'
                              }}>
                                {opt.key}
                              </span>
                              <div style={{ color: '#064e3b', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: renderMath(opt.content) }} />
                            </div>
                          );
                        })}

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                          {!isAnswerCorrect[currentQuestion.id] && hintLevel[currentQuestion.id] !== 2 && (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleSubmitAnswer(currentQuestion.id)}
                              disabled={!userAnswers[currentQuestion.id]}
                            >
                              {hintLevel[currentQuestion.id] === 1 ? "💡 Nộp bài lại lần 2" : "⚡ Nộp bài & Check bẫy"}
                            </button>
                          )}
                          
                          {(hintLevel[currentQuestion.id] || 0) === 0 && (
                            <button 
                              className="btn" 
                              style={{ background: '#fffbeb', border: '1px solid #d97706', color: '#b45309', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuyHint(currentQuestion.id)}
                            >
                              💡 Mua Gợi ý (-15 🐟)
                            </button>
                          )}
                          {(hintLevel[currentQuestion.id] || 0) < 2 && (
                            <button 
                              className="btn" 
                              style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuySolution(currentQuestion.id)}
                            >
                              🔓 Mua Lời giải chi tiết (-30 🐟)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* DẠNG BÀI 2: ĐIỀN LỜI GIẢI / ĐÁP SỐ */}
                    {currentQuestion.type === "fill_in_the_blank" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="math-input" 
                            placeholder="Nhập con số đáp án cuối cùng của bạn tại đây..."
                            value={userAnswers[currentQuestion.id] || ""}
                            onChange={(e) => {
                              if (hintLevel[currentQuestion.id] === 2) return;
                              setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
                            }}
                            disabled={hintLevel[currentQuestion.id] === 2}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                          {!isAnswerCorrect[currentQuestion.id] && hintLevel[currentQuestion.id] !== 2 && (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleSubmitAnswer(currentQuestion.id)}
                              disabled={!(userAnswers[currentQuestion.id] || "").trim()}
                            >
                              {hintLevel[currentQuestion.id] === 1 ? "💡 Điền đáp số lại lần 2" : "⚡ Nộp bài & Check bẫy"}
                            </button>
                          )}
                          
                          {(hintLevel[currentQuestion.id] || 0) === 0 && (
                            <button 
                              className="btn" 
                              style={{ background: '#fffbeb', border: '1px solid #d97706', color: '#b45309', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuyHint(currentQuestion.id)}
                            >
                              💡 Mua Gợi ý (-15 🐟)
                            </button>
                          )}
                          {(hintLevel[currentQuestion.id] || 0) < 2 && (
                            <button 
                              className="btn" 
                              style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuySolution(currentQuestion.id)}
                            >
                              🔓 Mua Lời giải chi tiết (-30 🐟)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* EXPLANATIONS CONTAINER (INTEGRATES THINKING, STEPS, TRAPS, CASIO!) */}
                    {hintLevel[currentQuestion.id] >= 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', borderTop: '2px dashed var(--color-border)', paddingTop: '20px' }}>
                        
                        {/* Section 1: Thinking Hint (Level 1 and 2) */}
                        <div style={{ background: 'var(--color-accent-cream)', padding: '16px', borderRadius: '16px', border: '1px solid #fef3c7' }}>
                          <h5 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                            💡 Cách tư duy giải quyết bài toán:
                          </h5>
                          <div style={{ fontSize: '0.92rem', color: '#78350f' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.thinking) }} />
                        </div>

                        {/* Section 2, 3, 4: Steps, Traps, Casio (Only unlocked at Level 2) */}
                        {hintLevel[currentQuestion.id] === 2 ? (
                          <>
                            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '2px solid var(--color-border)' }}>
                              <h5 style={{ color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '8px' }}>
                                📝 Các bước giải chi tiết (Kiến thức THCS Lớp 9):
                              </h5>
                              <div style={{ fontSize: '0.92rem', color: '#0f766e' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.steps) }} />
                            </div>

                            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                              <h5 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                                ⚠️ Cạm bẫy học sinh cần tránh:
                              </h5>
                              <div style={{ fontSize: '0.92rem', color: '#991b1b' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.traps) }} />
                            </div>

                            {currentQuestion.explanation.casio && (
                              <div style={{ background: 'var(--color-primary-soft)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <h5 style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                                  🧮 Hướng dẫn thủ thuật máy tính Casio FX-580VN X:
                                </h5>
                                <div style={{ fontSize: '0.92rem', color: '#065f46' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.casio) }} />
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ padding: '8px', color: '#15803d', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            🔒 Điền sai hoặc nộp bài lần 2 để mở khóa toàn bộ giải thích chi tiết, cạm bẫy và thủ thuật bấm máy Casio!
                          </div>
                        )}

                        {/* Section 5: "Đã hiểu meow! 🐾" Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '12px 16px', borderRadius: '16px', border: '1px solid #a7f3d0', marginTop: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.4rem' }}>😸</span>
                            <div>
                              <strong style={{ color: '#065f46', fontSize: '0.92rem', display: 'block' }}>Đã hiểu cạm bẫy chưa meow?</strong>
                              <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                                Tích đã hiểu để nhận lại 50% số xu cá hồi đã dùng mở khóa gợi ý/lời giải!
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn"
                            disabled={understoodList.includes(currentQuestion.id)}
                            style={{
                              padding: '6px 16px',
                              borderRadius: '20px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              background: understoodList.includes(currentQuestion.id) ? '#e6f7f0' : '#10b981',
                              color: understoodList.includes(currentQuestion.id) ? '#047857' : '#ffffff',
                              border: 'none',
                              cursor: understoodList.includes(currentQuestion.id) ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: understoodList.includes(currentQuestion.id) ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => {
                              const qId = currentQuestion.id;
                              if (understoodList.includes(qId)) return;
                              
                              const newUnderstood = [...understoodList, qId];
                              saveUnderstood(newUnderstood);
                              
                              const spent = spentCoinsMap[qId] || 0;
                              const refund = Math.ceil(spent * 0.5);
                              
                              if (refund > 0) {
                                saveFishCoins(fishCoins + refund);
                                triggerMascotReaction("success", `Meow meow! ${userName} tự học xuất sắc quá! Miu hoàn lại ${refund} xu cá hồi 🐟 (50% của ${spent} xu) cho ${userName} nhé! 🐾💖`);
                              } else {
                                triggerMascotReaction("success", `Miu vô cùng vui sướng vì ${userName} đã tự học và hiểu bài meow! Cố gắng giải đúng các câu tiếp theo nhé! 🐾💖`);
                              }
                            }}
                          >
                            {understoodList.includes(currentQuestion.id) ? "✔️ Đã hiểu meow!" : "🐾 Đã hiểu meow!"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pagination controller */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                      <button 
                        className="btn btn-secondary" 
                        disabled={currentQuestionIndex === 0}
                        onClick={() => {
                          setCurrentQuestionIndex(prev => prev - 1);
                          triggerMascotReaction("idle");
                        }}
                      >
                        👈 Câu trước
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        disabled={currentQuestionIndex === activeQuestions.length - 1}
                        onClick={() => {
                          setCurrentQuestionIndex(prev => prev + 1);
                          triggerMascotReaction("idle");
                        }}
                      >
                        Câu tiếp theo 👉
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <p style={{ fontWeight: 600 }}>Không tìm thấy câu hỏi nào cho chuyên đề này meow meow...</p>
                    <button className="btn btn-primary" onClick={handleBackToDashboard}>Quay lại</button>
                  </div>
                )}
              </div>
            )}

            {/* Mock Exam Mode */}
            {mode === "lam_de" && selectedExamId !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Exam Subheader bar */}
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: '12px', flexWrap: 'wrap', background: '#ffffff', padding: '16px', borderRadius: '16px', border: '2px solid var(--color-border)' }}>
                  <div>
                    <h3 style={{ color: '#064e3b', fontWeight: 800, fontSize: '1.2rem' }}>
                      Đang thi thử: Đề số {selectedExamId.toString().padStart(2, '0')}
                    </h3>
                    <p style={{ color: '#15803d', fontSize: '0.85rem' }}>Số lượng: {activeQuestions.length} câu</p>
                  </div>
                  
                  {/* Timer & Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!examFinished ? (
                      <>
                        <div style={{ background: '#fef2f2', border: '2px solid #fecdd3', color: '#ef4444', padding: '8px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '1.15rem' }}>
                          ⏱️ {formatTime(examTimeRemaining)}
                        </div>
                        <button className="btn btn-primary" onClick={handleFinishExam}>
                          ✔️ Nộp bài thi
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-secondary" onClick={handleBackToDashboard}>
                        ⬅️ Bảng điều khiển
                      </button>
                    )}
                  </div>
                </div>

                {/* Exam score reporting */}
                {examFinished && (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #e6f7f0 100%)' }}>
                    <h4 style={{ color: '#064e3b', fontSize: '1.3rem', fontWeight: 800 }}>🏆 KẾT QUẢ THI THỬ CỦA BẠN</h4>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#15803d' }}>
                      Điểm số: <strong style={{ color: '#10b981', fontSize: '2rem' }}>{((examScore / activeQuestions.length) * 10).toFixed(1)}</strong> / 10 điểm (Đúng {examScore}/{activeQuestions.length} câu)
                    </p>
                    
                    {/* Dynamic topic weakness analysis */}
                    <div>
                      <h5 style={{ fontWeight: 700, color: '#064e3b', marginBottom: '8px' }}>📊 Phân tích năng lực theo Chuyên đề:</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {examAnalysis.map(stat => (
                          <div key={stat.category} style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                            <h6 style={{ fontWeight: 600, color: '#064e3b', fontSize: '0.9rem' }}>{stat.category_vn}</h6>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                              <span style={{ fontSize: '0.85rem', color: '#15803d' }}>Đúng {stat.correct}/{stat.total}</span>
                              <span style={{ fontWeight: 700, color: stat.rate >= 80 ? '#10b981' : stat.rate >= 50 ? '#fb923c' : '#ef4444' }}>
                                {stat.rate}% {stat.rate >= 80 ? "🔥 Rất tốt" : stat.rate >= 50 ? "⚠️ Cần rà" : "🚨 Rất yếu"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Exam Layout Grid (Left: Active Question, Right: Grid Index selector) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
                  
                  {/* Active Question Box */}
                  {currentQuestion && (
                    <div className="card">
                      <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                        Câu hỏi số {currentQuestionIndex + 1}
                      </div>

                      <div style={{ fontSize: '1.05rem', fontWeight: 500, color: '#064e3b' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.question_text) }} />

                      {currentQuestion.image && (
                        <div style={{ margin: '14px 0', textAlign: 'center', background: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                          <img src={currentQuestion.image} alt="Hình vẽ minh họa" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                        </div>
                      )}

                      {/* Options or text input */}
                      {currentQuestion.type === "multiple_choice" ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                          {currentQuestion.options.map(opt => {
                            const isSelected = examAnswers[currentQuestion.id] === opt.key;
                            return (
                              <div 
                                key={opt.key}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '12px', 
                                  padding: '14px 20px', 
                                  borderRadius: '16px', 
                                  border: isSelected ? '2px solid var(--color-primary)' : '2px solid var(--color-border)', 
                                  background: isSelected ? 'var(--color-primary-soft)' : '#ffffff', 
                                  cursor: examFinished ? 'not-allowed' : 'pointer',
                                  transition: 'var(--transition)'
                                }}
                                onClick={() => {
                                  if (examFinished) return;
                                  setExamAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.key }));
                                }}
                              >
                                <span style={{ 
                                  display: 'inline-flex', 
                                  width: '28px', 
                                  height: '28px', 
                                  borderRadius: '50%', 
                                  border: '2px solid', 
                                  borderColor: isSelected ? 'var(--color-primary)' : '#cbd5e1', 
                                  alignItems: 'center', 
                                  justify: 'center',
                                  fontWeight: 700,
                                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                                  color: isSelected ? '#ffffff' : '#475569'
                                }}>
                                  {opt.key}
                                </span>
                                <div style={{ color: '#064e3b', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: renderMath(opt.content) }} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ marginTop: '16px' }}>
                          <input 
                            type="text" 
                            className="math-input" 
                            placeholder="Điền đáp số cuối cùng của bạn tại đây..."
                            value={examAnswers[currentQuestion.id] || ""}
                            onChange={(e) => {
                              if (examFinished) return;
                              setExamAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
                            }}
                            disabled={examFinished}
                          />
                        </div>
                      )}

                      {/* Display explanation post-exam */}
                      {examFinished && (
                        <div style={{ marginTop: '20px', borderTop: '2px dashed var(--color-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', border: '1px solid #10b981', color: '#065f46', fontWeight: 600 }}>
                            ✔️ Đáp án đúng của Miu: <strong>{currentQuestion.correct_answer}</strong> (Đáp án của bạn: {examAnswers[currentQuestion.id] || "Không có"})
                          </div>

                          <div style={{ background: 'var(--color-accent-cream)', padding: '16px', borderRadius: '16px', border: '1px solid #fef3c7' }}>
                            <h5 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                              💡 Cách tư duy giải quyết bài toán:
                            </h5>
                            <div style={{ fontSize: '0.92rem', color: '#78350f' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.thinking) }} />
                          </div>

                          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '2px solid var(--color-border)' }}>
                            <h5 style={{ color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '8px' }}>
                              📝 Các bước giải chi tiết (Kiến thức THCS Lớp 9):
                            </h5>
                            <div style={{ fontSize: '0.92rem', color: '#0f766e' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.steps) }} />
                          </div>

                          <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                            <h5 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                              ⚠️ Cạm bẫy học sinh cần tránh:
                            </h5>
                            <div style={{ fontSize: '0.92rem', color: '#991b1b' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.traps) }} />
                          </div>

                          {currentQuestion.explanation.casio && (
                            <div style={{ background: 'var(--color-primary-soft)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <h5 style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                                🧮 Hướng dẫn thủ thuật máy tính Casio FX-580VN X:
                              </h5>
                              <div style={{ fontSize: '0.92rem', color: '#065f46' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.casio) }} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pagination in Exam */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                        <button 
                          className="btn btn-secondary" 
                          disabled={currentQuestionIndex === 0}
                          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        >
                          👈 Câu trước
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          disabled={currentQuestionIndex === activeQuestions.length - 1}
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        >
                          Câu tiếp theo 👉
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Right Side grid sheet */}
                  <div className="card" style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                      📋 Phiếu trả lời
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {activeQuestions.map((q, index) => {
                        const isDone = !!examAnswers[q.id];
                        const isActive = index === currentQuestionIndex;
                        let bg = '#ffffff';
                        let clr = '#475569';
                        let borderClr = 'var(--color-border)';

                        if (isDone) {
                          bg = 'var(--color-primary)';
                          clr = '#ffffff';
                          borderClr = 'var(--color-primary)';
                        }
                        if (isActive) {
                          borderClr = '#ef4444';
                        }
                        if (examFinished) {
                          const isCorrect = (examAnswers[q.id] || "").trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                          bg = isCorrect ? '#ecfdf5' : '#fef2f2';
                          clr = isCorrect ? '#10b981' : '#ef4444';
                          borderClr = isCorrect ? '#10b981' : '#ef4444';
                        }

                        return (
                          <button 
                            key={q.id}
                            style={{ 
                              height: '36px', 
                              borderRadius: '8px', 
                              border: `2px solid ${borderClr}`, 
                              background: bg, 
                              color: clr, 
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justify: 'center'
                            }}
                            onClick={() => setCurrentQuestionIndex(index)}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Mouse Trap Spaced-Repetition Notebook Mode */}
            {mode === "so_tay_bay_chuot" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" onClick={handleBackToDashboard}>
                    ⬅️ Trở lại Bảng điều khiển
                  </button>
                  <h3 style={{ color: '#064e3b', fontWeight: 800, fontSize: '1.2rem' }}>
                    📓 Sổ Tay Bẫy Chuột (Các câu đã làm sai meow)
                  </h3>
                </div>

                <div className="card" style={{ background: '#fef2f2', borderColor: '#fecdd3' }}>
                  <p style={{ fontSize: '0.92rem', color: '#991b1b' }}>
                    🐱 **Mèo Miu khuyên học tập**: Đây là danh sách các cạm bẫy ${userName} đã vướng phải trong các bài tập! Hãy ôn luyện giải lại các câu này theo chu kỳ **1 ngày, 3 ngày, 7 ngày** để khắc cốt ghi tâm meow meow!
                  </p>
                </div>

                {currentQuestion ? (
                  <div className="card">
                    <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                      Bẫy số {currentQuestionIndex + 1} / {activeQuestions.length} ({currentQuestion.category_vn})
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 500, color: '#064e3b' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.question_text) }} />

                    {currentQuestion.image && (
                      <div style={{ margin: '14px 0', textAlign: 'center', background: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <img src={currentQuestion.image} alt="Hình vẽ minh họa" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* DẠNG BÀI 1: TRẮC NGHIỆM */}
                    {currentQuestion.type === "multiple_choice" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                        {currentQuestion.options.map(opt => {
                          const isSelected = userAnswers[currentQuestion.id] === opt.key;
                          const isSubmitted = hintLevel[currentQuestion.id] === 2;
                          const isWrongAns = isSubmitted && isSelected && !isAnswerCorrect[currentQuestion.id];
                          const isCorrectAns = isSubmitted && opt.key === currentQuestion.correct_answer;
                          
                          let bg = '#ffffff';
                          let borderClr = 'var(--color-border)';
                          if (isSelected) {
                            bg = 'var(--color-primary-soft)';
                            borderClr = 'var(--color-primary)';
                          }
                          if (isCorrectAns) {
                            bg = '#ecfdf5';
                            borderClr = '#10b981';
                          } else if (isWrongAns) {
                            bg = '#fef2f2';
                            borderClr = '#ef4444';
                          }

                          return (
                            <div 
                              key={opt.key}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                padding: '14px 20px', 
                                borderRadius: '16px', 
                                border: `2px solid ${borderClr}`, 
                                background: bg, 
                                cursor: isSubmitted ? 'not-allowed' : 'pointer',
                                transition: 'var(--transition)'
                              }}
                              onClick={() => {
                                if (isSubmitted) return;
                                setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.key }));
                              }}
                            >
                              <span style={{ 
                                display: 'inline-flex', 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                border: '2px solid', 
                                borderColor: isSelected ? 'var(--color-primary)' : '#cbd5e1', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 700,
                                background: isSelected ? 'var(--color-primary)' : 'transparent',
                                color: isSelected ? '#ffffff' : '#475569'
                              }}>
                                {opt.key}
                              </span>
                              <div style={{ color: '#064e3b', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: renderMath(opt.content) }} />
                            </div>
                          );
                        })}

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                          {!isAnswerCorrect[currentQuestion.id] && hintLevel[currentQuestion.id] !== 2 && (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleSubmitAnswer(currentQuestion.id)}
                              disabled={!userAnswers[currentQuestion.id]}
                            >
                              {hintLevel[currentQuestion.id] === 1 ? "💡 Nộp bài lại lần 2" : "⚡ Giải lại bẫy này"}
                            </button>
                          )}
                          
                          {(hintLevel[currentQuestion.id] || 0) === 0 && (
                            <button 
                              className="btn" 
                              style={{ background: '#fffbeb', border: '1px solid #d97706', color: '#b45309', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuyHint(currentQuestion.id)}
                            >
                              💡 Mua Gợi ý (-15 🐟)
                            </button>
                          )}
                          {(hintLevel[currentQuestion.id] || 0) < 2 && (
                            <button 
                              className="btn" 
                              style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuySolution(currentQuestion.id)}
                            >
                              🔓 Mua Lời giải chi tiết (-30 🐟)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* DẠNG BÀI 2: ĐIỀN ĐÁP SỐ */}
                    {currentQuestion.type === "fill_in_the_blank" && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                        <input 
                          type="text" 
                          className="math-input" 
                          placeholder="Điền đáp số đúng của bạn..."
                          value={userAnswers[currentQuestion.id] || ""}
                          onChange={(e) => {
                            if (hintLevel[currentQuestion.id] === 2) return;
                            setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
                          }}
                          disabled={hintLevel[currentQuestion.id] === 2}
                        />
                        
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                          {!isAnswerCorrect[currentQuestion.id] && hintLevel[currentQuestion.id] !== 2 && (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleSubmitAnswer(currentQuestion.id)}
                              disabled={!(userAnswers[currentQuestion.id] || "").trim()}
                            >
                              {hintLevel[currentQuestion.id] === 1 ? "💡 Điền lại đáp án lần 2" : "⚡ Giải lại bẫy này"}
                            </button>
                          )}
                          
                          {(hintLevel[currentQuestion.id] || 0) === 0 && (
                            <button 
                              className="btn" 
                              style={{ background: '#fffbeb', border: '1px solid #d97706', color: '#b45309', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuyHint(currentQuestion.id)}
                            >
                              💡 Mua Gợi ý (-15 🐟)
                            </button>
                          )}
                          {(hintLevel[currentQuestion.id] || 0) < 2 && (
                            <button 
                              className="btn" 
                              style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', fontWeight: 600, padding: '8px 16px', borderRadius: '12px' }}
                              onClick={() => handleBuySolution(currentQuestion.id)}
                            >
                              🔓 Mua Lời giải chi tiết (-30 🐟)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Explanations in Traps list */}
                    {hintLevel[currentQuestion.id] >= 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', borderTop: '2px dashed var(--color-border)', paddingTop: '20px' }}>
                        
                        <div style={{ background: 'var(--color-accent-cream)', padding: '16px', borderRadius: '16px', border: '1px solid #fef3c7' }}>
                          <h5 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                            💡 Cách tư duy giải quyết bài toán:
                          </h5>
                          <div style={{ fontSize: '0.92rem', color: '#78350f' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.thinking) }} />
                        </div>

                        {hintLevel[currentQuestion.id] === 2 && (
                          <>
                            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '2px solid var(--color-border)' }}>
                              <h5 style={{ color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '8px' }}>
                                📝 Các bước giải chi tiết (Kiến thức THCS Lớp 9):
                              </h5>
                              <div style={{ fontSize: '0.92rem', color: '#0f766e' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.steps) }} />
                            </div>

                            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                              <h5 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                                ⚠️ Cạm bẫy học sinh cần tránh:
                              </h5>
                              <div style={{ fontSize: '0.92rem', color: '#991b1b' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.traps) }} />
                            </div>

                            {currentQuestion.explanation.casio && (
                              <div style={{ background: 'var(--color-primary-soft)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <h5 style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '6px' }}>
                                  🧮 Hướng dẫn thủ thuật máy tính Casio FX-580VN X:
                                </h5>
                                <div style={{ fontSize: '0.92rem', color: '#065f46' }} dangerouslySetInnerHTML={{ __html: renderMath(currentQuestion.explanation.casio) }} />
                              </div>
                            )}
                          </>
                        )}

                        {/* Section 5: "Đã hiểu meow! 🐾" Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', background: '#ecfdf5', padding: '12px 16px', borderRadius: '16px', border: '1px solid #a7f3d0', marginTop: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.4rem' }}>😸</span>
                            <div>
                              <strong style={{ color: '#065f46', fontSize: '0.92rem', display: 'block' }}>Đã hiểu cạm bẫy chưa meow?</strong>
                              <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                                Tích đã hiểu để nhận lại 50% số xu cá hồi đã dùng mở khóa gợi ý/lời giải!
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn"
                            disabled={understoodList.includes(currentQuestion.id)}
                            style={{
                              padding: '6px 16px',
                              borderRadius: '20px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              background: understoodList.includes(currentQuestion.id) ? '#e6f7f0' : '#10b981',
                              color: understoodList.includes(currentQuestion.id) ? '#047857' : '#ffffff',
                              border: 'none',
                              cursor: understoodList.includes(currentQuestion.id) ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: understoodList.includes(currentQuestion.id) ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => {
                              const qId = currentQuestion.id;
                              if (understoodList.includes(qId)) return;
                              
                              const newUnderstood = [...understoodList, qId];
                              saveUnderstood(newUnderstood);
                              
                              const spent = spentCoinsMap[qId] || 0;
                              const refund = Math.ceil(spent * 0.5);
                              
                              if (refund > 0) {
                                saveFishCoins(fishCoins + refund);
                                triggerMascotReaction("success", `Meow meow! ${userName} tự học xuất sắc quá! Miu hoàn lại ${refund} xu cá hồi 🐟 (50% của ${spent} xu) cho ${userName} nhé! 🐾💖`);
                              } else {
                                triggerMascotReaction("success", `Miu vô cùng vui sướng vì ${userName} đã tự học và hiểu bài meow! Cố gắng giải đúng các câu tiếp theo nhé! 🐾💖`);
                              }
                            }}
                          >
                            {understoodList.includes(currentQuestion.id) ? "✔️ Đã hiểu meow!" : "🐾 Đã hiểu meow!"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                      <button 
                        className="btn btn-secondary" 
                        disabled={currentQuestionIndex === 0}
                        onClick={() => {
                          setCurrentQuestionIndex(prev => prev - 1);
                          triggerMascotReaction("idle");
                        }}
                      >
                        👈 Câu trước
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        disabled={currentQuestionIndex === activeQuestions.length - 1}
                        onClick={() => {
                          setCurrentQuestionIndex(prev => prev + 1);
                          triggerMascotReaction("idle");
                        }}
                      >
                        Câu tiếp theo 👉
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <p style={{ fontWeight: 600, color: '#15803d' }}>🐾 Sạch bóng bẫy chuột meow meow! Sen quá giỏi!</p>
                    <button className="btn btn-primary" onClick={handleBackToDashboard}>Quay lại</button>
                  </div>
                )}
              </div>
            )}

            {/* Personal Diary Mode */}
            {mode === "nhat_ky" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" onClick={handleBackToDashboard}>
                    ⬅️ Trở lại Bảng điều khiển
                  </button>
                  <h3 style={{ color: '#064e3b', fontWeight: 800, fontSize: '1.2rem' }}>
                    📔 Nhật Ký Học Tập Của {userName} meow
                  </h3>
                </div>

                <div className="card" style={{ background: 'var(--color-primary-soft)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <p style={{ fontSize: '0.92rem', color: '#065f46', fontWeight: 600 }}>
                    🐱 **Mèo Miu lắng nghe**: Mỗi ngày ôn thi là một bước chân nhỏ tiến tới giấc mơ lớp 10 Chuyên! Hãy viết lại những vui buồn, thành tích hoặc khó khăn hôm nay của {userName} để Miu cùng đồng hành nhé meow!
                  </p>
                </div>

                {/* Add new entry form */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '1.15rem', color: '#064e3b', fontWeight: 700 }}>✍️ Viết nhật ký hôm nay:</h4>
                  
                  {/* Mood Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 600 }}>Cảm xúc hôm nay:</span>
                    {["😸 Hạnh phúc", "😿 Lo lắng", "😾 Mệt mỏi", "😼 Quyết tâm", "💤 Lười meow"].map(moodStr => {
                      const moodIcon = moodStr.split(" ")[0];
                      const isActive = diaryMood === moodIcon;
                      return (
                        <button 
                          key={moodIcon}
                          className="btn"
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '16px', 
                            fontSize: '0.85rem',
                            background: isActive ? 'var(--color-primary)' : '#f0faf5',
                            color: isActive ? '#ffffff' : '#047857',
                            border: '1px solid #10b981',
                            fontWeight: 600
                          }}
                          onClick={() => setDiaryMood(moodIcon)}
                        >
                          {moodStr}
                        </button>
                      );
                    })}
                  </div>

                  <textarea 
                    value={diaryText}
                    onChange={(e) => setDiaryText(e.target.value)}
                    placeholder={`Hôm nay ${userName} đã làm được bài toán nào khó? Có gặp chiếc bẫy nào đáng nhớ không? Hãy ghi lại tại đây nhé meow...`}
                    style={{ 
                      width: '100%', 
                      height: '100px', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: '12px', 
                      padding: '10px 14px', 
                      fontSize: '0.9rem', 
                      color: '#064e3b', 
                      outline: 'none', 
                      resize: 'none',
                      background: '#fcfcfc'
                    }}
                  />

                  <button 
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => {
                      if (!diaryText.trim()) return;
                      const newEntry = {
                        id: Date.now().toString(),
                        date: new Date().toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        content: diaryText.trim(),
                        mood: diaryMood
                      };
                      const newEntries = [newEntry, ...diaryEntries];
                      saveDiary(newEntries);
                      setDiaryText("");
                      triggerMascotReaction("success", `Miu đã lưu trang nhật ký hôm nay của ${userName} rồi meow! Hãy kiên trì nhé! 💕`);
                    }}
                    disabled={!diaryText.trim()}
                  >
                    Lưu trang nhật ký 💾
                  </button>
                </div>

                {/* Timeline of past entries */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#064e3b', fontWeight: 700, margin: '10px 0 4px' }}>
                    📖 Lịch sử nhật ký của {userName} ({diaryEntries.length} trang)
                  </h4>
                  
                  {diaryEntries.length > 0 ? (
                    diaryEntries.map(entry => (
                      <div key={entry.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '5px solid #10b981', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>{entry.date}</span>
                          <span style={{ fontSize: '1.3rem' }} title="Cảm xúc">{entry.mood}</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: '#064e3b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{entry.content}</p>
                        <button 
                          style={{ 
                            position: 'absolute', 
                            bottom: '12px', 
                            right: '16px', 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#ef4444', 
                            fontSize: '0.75rem', 
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => {
                            if (window.confirm("Miu meow! Bạn có chắc muốn xóa trang nhật ký này không?")) {
                              const newEntries = diaryEntries.filter(e => e.id !== entry.id);
                              saveDiary(newEntries);
                            }
                          }}
                        >
                          Xóa trang 🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="card" style={{ textAlign: 'center', color: '#15803d', padding: '30px' }}>
                      <span style={{ fontSize: '3rem' }}>📖</span>
                      <p style={{ marginTop: '10px', fontWeight: 600 }}>Chưa có trang nhật ký nào được viết meow! Hãy đặt bút viết dòng đầu tiên nhé!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Mascot Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px', sticky: 'top', top: '100px' }}>
            
            {/* Mascot interaction card */}
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
                width: '100%'
              }}>
                {mascotBubble}
              </div>
            </div>

            {/* Quick stats board */}
            <div className="card" style={{ background: '#ffffff', padding: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '12px' }}>
                🐾 Bảng thành tích meow
              </h4>
              
              {/* Fish Coins Balance & Feed Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #e6f7f0 0%, #d1fae5 100%)', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🐟</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Xu Cá Hồi</span>
                    <strong style={{ fontSize: '1.1rem', color: '#065f46' }}>{fishCoins} xu</strong>
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '14px', background: '#10b981', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                  onClick={() => {
                    if (fishCoins >= 10) {
                      saveFishCoins(fishCoins - 10);
                      const feedPhrases = [
                        `Măm măm! Cá hồi ngon tuyệt meow! Cảm ơn ${userName} nhiều nhé! Miu đã được sưởi ấm cái bụng tròn xoe rồi meo meo! 🐟😸🐾`,
                        `Ngon quá meow! Cá hồi béo ngậy luôn! Miu chúc ${userName} học thật tốt và tránh được mọi bẫy chuột hôm nay nhé! 😻🐟`,
                        `Meo meo! Có cá hồi ăn là Miu thích nhất! Miu nạp đầy 100% năng lượng để đồng hành cùng ${userName} đây! 🐾✨`
                      ];
                      triggerMascotReaction("success", pickRandom(feedPhrases));
                    } else {
                      triggerMascotReaction("failed", `Meow... Không đủ xu cá hồi rồi ${userName} ơi! Kiếm thêm xu bằng cách làm đúng câu hỏi hoặc hoàn thành đề thi thử để kiếm thêm xu nhé! 😿🐟`);
                    }
                  }}
                >
                  🐟 Cho Miu ăn (-10)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#15803d' }}>📓 Sổ tay Bẫy chuột:</span>
                  <strong style={{ color: '#ef4444' }}>{mouseTrapList.length} câu</strong>
                </div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#15803d' }}>SRS core due:</span>
                  <strong style={{ color: '#f97316' }}>{errorNotebookSummary.due}/{errorNotebookSummary.total}</strong>
                </div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#15803d' }}>⭐ Câu hỏi yêu thích:</span>
                  <strong style={{ color: '#10b981' }}>{bookmarkedList.length} câu</strong>
                </div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setMode("so_tay_bay_chuot")}>
                  <span style={{ color: '#10b981', textDecoration: 'underline', fontWeight: 600 }}>👉 Luyện bẫy ngay</span>
                </div>
              </div>
            </div>

            {/* Digital Draft Pad */}
            <div className="card" style={{ background: '#ffffff', padding: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '12px' }}>
                📝 Bảng nháp tự do meow
              </h4>
              <textarea 
                value={draftPadText}
                onChange={(e) => setDraftPadText(e.target.value)}
                placeholder={`${userName} viết nháp phương trình hoặc ghi chú công thức tại đây nhé...`}
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
                  background: '#fcfcfc'
                }}
              />
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '8px', padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setDraftPadText("")}
              >
                Xóa nháp 🗑️
              </button>
            </div>

          </aside>

        </div>

      </main>

      {/* STUDENT PROGRESS DETAILS MODAL */}
      {selectedStudentProgress && (
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
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div className="card" style={{
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
            position: 'relative'
          }}>
            <button 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
              onClick={() => setSelectedStudentProgress(null)}
            >
              ❌
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '3rem', background: '#e6f7f0', padding: '12px', borderRadius: '50%' }}>🎒</div>
              <div>
                <h3 style={{ margin: 0, color: '#064e3b', fontSize: '1.4rem', fontWeight: 800 }}>
                  {selectedStudentProgress.fullName}
                </h3>
                <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
                  Tài khoản: @{selectedStudentProgress.username} | SĐT: {selectedStudentProgress.phone}
                </span>
              </div>
            </div>

            {/* Read metrics from localStorage */}
            {(() => {
              const username = selectedStudentProgress.username;
              const solved = getStoredJson(`miu_math_understood_${username}`, []);
              const traps = getStoredJson(`miu_math_traps_${username}`, []);
              const bookmarks = getStoredJson(`miu_math_bookmarks_${username}`, []);
              const coins = localStorage.getItem(`miu_math_fish_coins_${username}`) || "100";
              const diaries = getStoredJson(`miu_math_diary_${username}`, []);
              const progressPercent = questions.length > 0 ? (solved.length / questions.length) * 100 : 0;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Progress Indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#f0faf5', padding: '14px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
                      <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>TIẾN TRÌNH</span>
                      <h4 style={{ fontSize: '1.1rem', color: '#065f46', margin: '4px 0 0', fontWeight: 800 }}>
                        {solved.length}/{questions.length} ({progressPercent.toFixed(0)}%)
                      </h4>
                    </div>
                    <div style={{ background: '#f0faf5', padding: '14px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
                      <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>VÍ XU 🐟</span>
                      <h4 style={{ fontSize: '1.1rem', color: '#065f46', margin: '4px 0 0', fontWeight: 800 }}>
                        {coins} xu
                      </h4>
                    </div>
                    <div style={{ background: '#f0faf5', padding: '14px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
                      <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>ĐIỂM HIỆN TẠI</span>
                      <h4 style={{ fontSize: '1.1rem', color: '#065f46', margin: '4px 0 0', fontWeight: 800 }}>
                        {selectedStudentProgress.currentScore ? `${selectedStudentProgress.currentScore}/10 ⭐` : "Chưa thi 📝"}
                      </h4>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: '#e6f7f0', borderRadius: '4px', overflow: 'hidden', marginTop: '-8px' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981' }}></div>
                  </div>

                  {/* Summary counts */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem' }}>
                    <div style={{ flex: 1, border: '1.5px solid #fee2e2', padding: '10px 14px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>📓 Sổ tay bẫy chuột</span>
                      <h5 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#ef4444', fontWeight: 800 }}>{traps.length} câu</h5>
                    </div>
                    <div style={{ flex: 1, border: '1.5px solid #d1fae5', padding: '10px 14px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>⭐ Câu hỏi yêu thích</span>
                      <h5 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#10b981', fontWeight: 800 }}>{bookmarks.length} câu</h5>
                    </div>
                  </div>

                  {/* Learning Diary Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#064e3b', fontWeight: 800, borderBottom: '1px solid #e6f7f0', paddingBottom: '6px' }}>
                      📖 Nhật ký học tập của {selectedStudentProgress.fullName} ({diaries.length} trang)
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {diaries.length > 0 ? (
                        diaries.map(diary => (
                          <div key={diary.id} style={{ background: '#f9fdfb', border: '1px solid #e6f7f0', borderLeft: '4px solid #10b981', padding: '10px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>
                              <span>{diary.date}</span>
                              <span>{diary.mood}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#064e3b', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{diary.content}</p>
                          </div>
                        ))
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', fontStyle: 'italic', padding: '10px 0' }}>Học sinh này chưa viết trang nhật ký học tập nào meow meow. 😸🐾</p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })()}

            <button 
              className="btn btn-primary"
              style={{ padding: '12px', borderRadius: '12px', fontWeight: 700, marginTop: '8px' }}
              onClick={() => setSelectedStudentProgress(null)}
            >
              Đóng cửa sổ meow 🐾
            </button>
          </div>
        </div>
      )}
      {/* EDIT MEMBER DETAILS MODAL */}
      {editingUser && (
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
          fontFamily: 'system-ui, sans-serif'
        }}>
          <form 
            onSubmit={handleSaveEditUser}
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
              position: 'relative'
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
                color: '#9ca3af'
              }}
              onClick={() => setEditingUser(null)}
            >
              ❌
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '2rem', background: '#e0f2fe', padding: '10px', borderRadius: '50%' }}>✏️</div>
              <div>
                <h3 style={{ margin: 0, color: '#064e3b', fontSize: '1.2rem', fontWeight: 800 }}>
                  Chỉnh Sửa Thành Viên
                </h3>
                <span style={{ color: '#0369a1', fontSize: '0.82rem', fontWeight: 600 }}>
                  Tài khoản: @{editingUser}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>📛 Tên hiển thị / Họ tên</label>
              <input 
                type="text" 
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>📞 Số điện thoại</label>
              <input 
                type="text" 
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>🔑 Mật khẩu</label>
              <input 
                type="text" 
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>🎒 Vai trò thành viên</label>
              <select 
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.88rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
                disabled={editingUser === "admin"}
              >
                <option value="student">Học sinh 🎒</option>
                <option value="admin">Quản trị viên 💻</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '10px', borderRadius: '12px' }}
                onClick={() => setEditingUser(null)}
              >
                Hủy meow 🐾
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px', borderRadius: '12px' }}
              >
                Lưu thay đổi ✨
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Footer Area */}
      <footer style={{ background: '#ffffff', borderTop: '2px solid rgba(16, 185, 129, 0.08)', padding: '20px 16px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
          MiuMath - Phần Mềm Luyện Thi Lớp 10 Chuyên. Thiết kế bởi Antigravity 🐾 meow meow.
        </p>
      </footer>
    </div>
  );
}

export default App;
