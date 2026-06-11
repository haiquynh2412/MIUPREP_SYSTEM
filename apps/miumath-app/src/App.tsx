import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './App.css';
import type { MiuMathRawQuestion } from './learning';
import type { LearningEventRecord } from '@miuprep/learning';
import { hashPassword, verifyPassword } from '@miuprep/db';

export interface MiuMathUser {
  username: string;
  /** PBKDF2 hash (legacy plaintext records are re-hashed on next successful login) */
  password?: string;
  fullName?: string;
  phone?: string;
  role: string;
  active?: boolean;
  approved?: boolean;
}
import MathDiaryRoom from './components/MathDiaryRoom';
import MathExamRoom from './components/MathExamRoom';
import MathErrorNotebook from './components/MathErrorNotebook';
import MathPracticeRoom from './components/MathPracticeRoom';
import EditMemberModal from './components/EditMemberModal';
import MiuMathSidebar from './components/MiuMathSidebar';
import MiuMathStudentDashboard from './components/MiuMathStudentDashboard';
import MiuMathAppHeader from './components/MiuMathAppHeader';
import MiuMathAdminDashboard from './components/MiuMathAdminDashboard';
import MiuMathAdminPanel from './components/MiuMathAdminPanel';
import MiuMathAuthScreen from './components/MiuMathAuthScreen';
import StudentProgressModal from './components/StudentProgressModal';
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
} from './learning';

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
  const [users, setUsers] = useState<MiuMathUser[]>([]);
  const [currentUser, setCurrentUser] = useState<MiuMathUser | null>(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [selectedStudentProgress, setSelectedStudentProgress] = useState<MiuMathUser | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
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
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("Vui lòng điền đầy đủ tài khoản và mật khẩu meow!");
      return;
    }
    const foundUser = users.find(
      u => u.username.toLowerCase() === authUsername.trim().toLowerCase()
    );
    if (!foundUser) {
      setAuthError("Tài khoản hoặc mật khẩu không chính xác meow! 😿");
      return;
    }
    const verdict = await verifyPassword(authPassword, foundUser.password);
    if (!verdict.ok) {
      setAuthError("Tài khoản hoặc mật khẩu không chính xác meow! 😿");
      return;
    }
    // Transparently upgrade legacy plaintext records to PBKDF2
    if (verdict.needsRehash) {
      const upgradedHash = await hashPassword(authPassword);
      const upgradedUsers = users.map(u => (u.username === foundUser.username ? { ...u, password: upgradedHash } : u));
      setUsers(upgradedUsers);
      localStorage.setItem("miu_math_users", JSON.stringify(upgradedUsers));
    }
    if (foundUser.approved === false) {
      setAuthError("Tài khoản của bạn đang chờ Quản trị viên phê duyệt meow! Vui lòng liên hệ Giáo viên hoặc thử lại sau nhé! ⏳🐾");
      return;
    }
    if (foundUser.active === false) {
      setAuthError("Tài khoản của bạn đã bị Quản trị viên khóa meow! 🔒");
      return;
    }
    
    // Success login (never persist the password hash with the session)
    const { password: _sessionPw, ...sessionUser } = foundUser;
    setCurrentUser(sessionUser);
    localStorage.setItem("miu_math_current_user", JSON.stringify(sessionUser));
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
  const handleRegister = async (e) => {
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

    // First-run setup: the very first account on this device becomes the
    // approved admin (no default credentials ship with the app).
    const isFirstAccount = users.length === 0;
    const newUser = {
      username: authUsername.trim(),
      password: await hashPassword(authPassword),
      fullName: authFullName.trim() || authUsername.trim(),
      phone: authPhone.trim() || "Chưa cung cấp",
      role: isFirstAccount ? "admin" : "student",
      active: true,
      approved: isFirstAccount // Later registrations wait for admin approval
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

  const handleSaveEditUser = async (e) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    // Empty password field means: keep the current hash
    const nextPasswordHash = editPassword.trim() ? await hashPassword(editPassword.trim()) : undefined;
    
    const updated = users.map(u => {
      if (u.username === editingUser) {
        return {
          ...u,
          fullName: editFullName.trim(),
          phone: editPhone.trim(),
          password: nextPasswordHash ?? u.password,
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
  const [questions, setQuestions] = useState<MiuMathRawQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningState, setLearningState] = useState(() => loadMiuMathLearningState("guest"));
  
  // Core tracks & selections
  const [grade, setGrade] = useState("Lớp 9 Chuyên");
  const [mode, setMode] = useState("dashboard"); // "dashboard", "chuyen_de", "diagnostic_adaptive", "lam_de", "so_tay_bay_chuot"
  const [selectedChuyenDe, setSelectedChuyenDe] = useState<string | number | null>(null); // Chuyen đề index
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedExamId, setSelectedExamId] = useState<string | number | null>(null); // Exam paper ID
  const [diagnosticQuestionIds, setDiagnosticQuestionIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [spentCoinsMap, setSpentCoinsMap] = useState({}); // { questionId: number }
  const [understoodList, setUnderstoodList] = useState<string[]>([]); // [questionId]
  
  // Interactive answers & hinting states
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: answer }
  const [hintLevel, setHintLevel] = useState({}); // { questionId: 0, 1, 2 }
  const [isAnswerCorrect, setIsAnswerCorrect] = useState({}); // { questionId: boolean }
  const [draftPadText, setDraftPadText] = useState(""); // Digital draft pad
  
  // User profile & personalized name & diary & gamification
  const [userName, setUserName] = useState("bạn");
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [diaryText, setDiaryText] = useState("");
  const [diaryMood, setDiaryMood] = useState("😸");
  const [fishCoins, setFishCoins] = useState(100);
  const [useUnicodeFallback, setUseUnicodeFallback] = useState(false);
  const renderMath = (text) => renderMathCore(text, useUnicodeFallback);

  // Mascots states ("idle", "success", "failed", "hint")
  const [mascotState, setMascotState] = useState("idle");
  const [mascotBubble, setMascotBubble] = useState("Chào mừng bạn! Hôm nay chúng ta sẽ học chuyên đề nào đây meow? 🐾");
  
  // Spaced repetition & bookmarks
  const [mouseTrapList, setMouseTrapList] = useState<string[]>([]); // Questions in incorrect notebook
  const [errorNotebookEntries, setErrorNotebookEntries] = useState(() => loadMiuMathErrorNotebook("guest"));
  const [bookmarkedList, setBookmarkedList] = useState<string[]>([]);
  
  // Exam Mode states
  const [examActive, setExamActive] = useState(false);
  const [examTimeRemaining, setExamTimeRemaining] = useState(7200); // 120 minutes
  const [examAnswers, setExamAnswers] = useState({}); // temporary answers during exam
  const [examFinished, setExamFinished] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [examAnalysis, setExamAnalysis] = useState<any[]>([]);

  // Timer reference
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
      // No default credentials: the first registered account becomes the admin
      parsedUsers = [];
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
    const cleanCorrect = (q.correct_answer || '').trim().toLowerCase();
    const isCorrect = cleanUser === cleanCorrect;

    // Save temporary answer
    setUserAnswers(prev => ({ ...prev, [qId]: currentAnswer }));
    let recorded: ReturnType<typeof recordMiuMathAttempt> = null;
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
    const categoryStats: Record<string, { total: number; correct: number; name?: string | null }> = {}; // { category: { total: 0, correct: 0 } }
    let nextLearningState = learningState;
    let nextErrorNotebookEntries = errorNotebookEntries;
    const nextTrapList = [...mouseTrapList];
    const submittedLearningEvents: LearningEventRecord[] = [];

    examQuestions.forEach(q => {
      // Initialize stats
      const cat = q.category || 'unknown';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, correct: 0, name: q.category_vn };
      }
      categoryStats[cat].total += 1;

      const userAns = examAnswers[q.id] || "";
      const isCorrect = userAns.trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();
      const recorded = recordMiuMathAttempt(nextLearningState, q, userAns || "__blank__", "mock_test", currentLearnerId);
      if (recorded) {
        nextLearningState = recorded.state;
        submittedLearningEvents.push(recorded.event);
      }

      if (isCorrect) {
        correctCount += 1;
        categoryStats[cat].correct += 1;
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
      <MiuMathAuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        setAuthError={setAuthError}
        authSuccess={authSuccess}
        setAuthSuccess={setAuthSuccess}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        authUsername={authUsername}
        setAuthUsername={setAuthUsername}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authFullName={authFullName}
        setAuthFullName={setAuthFullName}
        authPhone={authPhone}
        setAuthPhone={setAuthPhone}
      />
    );
  }

  // Filter questions based on selection
  const currentChuyenDeId = selectedChuyenDe !== null ? CHUYEN_DE_LIST[selectedChuyenDe].id : null;
  const activeQuestions = mode === "chuyen_de" 
    ? questions.filter(q => {
        const matchCategory = currentChuyenDeId === "casio-hacks"
          ? (q.category === "casio-hacks" || Boolean(typeof q.explanation === 'object' && q.explanation !== null && (q.explanation as Record<string, unknown>).casio))
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
      return cd.id === "casio-hacks" && (recommended.category === "casio-hacks" || Boolean(typeof recommended.explanation === 'object' && recommended.explanation !== null && (recommended.explanation as Record<string, unknown>).casio));
    });
    const nextCategoryIndex = categoryIndex >= 0 ? categoryIndex : 0;
    const nextCategory = CHUYEN_DE_LIST[nextCategoryIndex];
    const targetQuestions = questions.filter(q => {
      if (nextCategory.id === "casio-hacks") return q.category === "casio-hacks" || Boolean(typeof q.explanation === "object" && q.explanation !== null && (q.explanation as Record<string, unknown>).casio);
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
      <MiuMathAppHeader
        currentUser={currentUser}
        mode={mode}
        grade={grade}
        setGrade={setGrade}
        userName={userName}
        useUnicodeFallback={useUnicodeFallback}
        saveUnicodeFallback={saveUnicodeFallback}
        adminPreviewMode={adminPreviewMode}
        setAdminPreviewMode={setAdminPreviewMode}
        handleBackToDashboard={handleBackToDashboard}
        handleLogout={handleLogout}
        triggerMascotReaction={triggerMascotReaction}
        setMode={setMode}
        setSelectedChuyenDe={setSelectedChuyenDe}
        setSelectedExamId={setSelectedExamId}
        setDiagnosticQuestionIds={setDiagnosticQuestionIds}
        setExamActive={setExamActive}
        setExamFinished={setExamFinished}
      />

      <main className="container" style={{ padding: '20px 16px', minHeight: 'calc(100vh - 100px)' }}>
        
        {/* Core Layout Grid: Left Content, Right Mascot Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Dashboard Mode */}
            {mode === "dashboard" && currentUser && currentUser.role === "admin" && !adminPreviewMode && (
              <MiuMathAdminDashboard
                currentUser={currentUser}
                questions={questions}
                users={users}
                chuyenDeList={CHUYEN_DE_LIST}
                setMode={setMode}
                setAdminTab={setAdminTab}
                setAdminPreviewMode={setAdminPreviewMode}
                triggerMascotReaction={triggerMascotReaction}
                handleDownloadJSON={handleDownloadJSON}
              />
            )}

            {mode === "dashboard" && (!currentUser || currentUser.role !== "admin" || adminPreviewMode) && (
              <MiuMathStudentDashboard
                userName={userName}
                saveUserName={saveUserName}
                grade={grade}
                learningDashboard={learningDashboard}
                recommendationLabel={recommendationLabel}
                masteryStatusLabel={masteryStatusLabel}
                startAdaptiveDiagnostic={startAdaptiveDiagnostic}
                openRecommendedQuestion={openRecommendedQuestion}
                chuyenDeList={CHUYEN_DE_LIST}
                questions={questions}
                setSelectedChuyenDe={setSelectedChuyenDe}
                setSelectedSubCategory={setSelectedSubCategory}
                setDiagnosticQuestionIds={setDiagnosticQuestionIds}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                setMode={setMode}
                triggerMascotReaction={triggerMascotReaction}
                handleStartExam={handleStartExam}
              />
            )}

            {/* Admin Panel Mode */}
            {mode === "admin_panel" && currentUser && currentUser.role === "admin" && (
              <MiuMathAdminPanel
                currentUser={currentUser}
                users={users}
                questions={questions}
                chuyenDeList={CHUYEN_DE_LIST}
                adminTab={adminTab}
                setAdminTab={setAdminTab}
                getStoredJson={getStoredJson}
                handleBackToDashboard={handleBackToDashboard}
                handleApproveUser={handleApproveUser}
                handleDeleteUser={handleDeleteUser}
                handleUpdateUserRole={handleUpdateUserRole}
                handleToggleUserActive={handleToggleUserActive}
                setSelectedStudentProgress={setSelectedStudentProgress}
                setEditingUser={setEditingUser}
                setEditFullName={setEditFullName}
                setEditPhone={setEditPhone}
                setEditPassword={setEditPassword}
                setEditRole={setEditRole}
                triggerMascotReaction={triggerMascotReaction}
                handleDownloadJSON={handleDownloadJSON}
                handleAddQuestion={handleAddQuestion}
                newQId={newQId}
                setNewQId={setNewQId}
                newQText={newQText}
                setNewQText={setNewQText}
                newQCategory={newQCategory}
                setNewQCategory={setNewQCategory}
                newQSubCategory={newQSubCategory}
                setNewQSubCategory={setNewQSubCategory}
                newQSubCategoryVn={newQSubCategoryVn}
                setNewQSubCategoryVn={setNewQSubCategoryVn}
                newQOptionA={newQOptionA}
                setNewQOptionA={setNewQOptionA}
                newQOptionB={newQOptionB}
                setNewQOptionB={setNewQOptionB}
                newQOptionC={newQOptionC}
                setNewQOptionC={setNewQOptionC}
                newQOptionD={newQOptionD}
                setNewQOptionD={setNewQOptionD}
                newQCorrectAnswer={newQCorrectAnswer}
                setNewQCorrectAnswer={setNewQCorrectAnswer}
                newQHint1={newQHint1}
                setNewQHint1={setNewQHint1}
                newQHint2={newQHint2}
                setNewQHint2={setNewQHint2}
                newQThinkingSpecial={newQThinkingSpecial}
                setNewQThinkingSpecial={setNewQThinkingSpecial}
                newQThinkingIntuition={newQThinkingIntuition}
                setNewQThinkingIntuition={setNewQThinkingIntuition}
                newQSteps={newQSteps}
                setNewQSteps={setNewQSteps}
              />
            )}

            {(mode === "diagnostic_adaptive" || (mode === "chuyen_de" && selectedChuyenDe !== null)) && (
              <MathPracticeRoom
                mode={mode}
                selectedChuyenDe={selectedChuyenDe}
                chuyenDeList={CHUYEN_DE_LIST}
                currentChuyenDeId={currentChuyenDeId}
                questions={questions}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={setSelectedSubCategory}
                activeQuestions={activeQuestions}
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
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
                handleBackToDashboard={handleBackToDashboard}
              />
            )}

            {/* Mock Exam Mode */}
            {mode === "lam_de" && selectedExamId !== null && (
              <MathExamRoom
                selectedExamId={selectedExamId}
                activeQuestions={activeQuestions}
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                examFinished={examFinished}
                examTimeRemaining={examTimeRemaining}
                formatTime={formatTime}
                handleFinishExam={handleFinishExam}
                handleBackToDashboard={handleBackToDashboard}
                examScore={examScore}
                examAnalysis={examAnalysis}
                examAnswers={examAnswers}
                setExamAnswers={setExamAnswers}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                renderMath={renderMath}
              />
            )}

            {/* Mouse Trap Spaced-Repetition Notebook Mode */}
            {mode === "so_tay_bay_chuot" && (
              <MathErrorNotebook
                userName={userName}
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                activeQuestions={activeQuestions}
                renderMath={renderMath}
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
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}

            {/* Personal Diary Mode */}
            {mode === "nhat_ky" && (
              <MathDiaryRoom
                userName={userName}
                diaryText={diaryText}
                setDiaryText={setDiaryText}
                diaryMood={diaryMood}
                setDiaryMood={setDiaryMood}
                diaryEntries={diaryEntries}
                saveDiary={saveDiary}
                triggerMascotReaction={triggerMascotReaction}
                handleBackToDashboard={handleBackToDashboard}
              />
            )}

          </div>

          <MiuMathSidebar
            mascotState={mascotState}
            mascotBubble={mascotBubble}
            fishCoins={fishCoins}
            saveFishCoins={saveFishCoins}
            userName={userName}
            triggerMascotReaction={triggerMascotReaction}
            mouseTrapCount={mouseTrapList.length}
            errorNotebookSummary={errorNotebookSummary}
            bookmarkedCount={bookmarkedList.length}
            setMode={setMode}
            draftPadText={draftPadText}
            setDraftPadText={setDraftPadText}
          />

        </div>

      </main>

      <StudentProgressModal
        student={selectedStudentProgress}
        questions={questions}
        getStoredJson={getStoredJson}
        onClose={() => setSelectedStudentProgress(null)}
      />

      <EditMemberModal
        editingUser={editingUser}
        editFullName={editFullName}
        setEditFullName={setEditFullName}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editPassword={editPassword}
        setEditPassword={setEditPassword}
        editRole={editRole}
        setEditRole={setEditRole}
        onClose={() => setEditingUser(null)}
        onSubmit={handleSaveEditUser}
      />

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
