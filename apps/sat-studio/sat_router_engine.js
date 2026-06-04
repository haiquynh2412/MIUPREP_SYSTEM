(function initSatStudioRouterEngine(root, factory) {
  const routerEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = routerEngine;
  }
  if (root) {
    root.SatStudioRouterEngine = routerEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioRouterEngine() {
  const DEFAULT_VIEW = "dashboard";

  const pageCopyEn = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Start with a short diagnostic, then study by weak skills and review mistakes.",
    },
    admin: {
      title: "Admin Center",
      subtitle: "Release readiness, content queue, public firewall, and SAT 2026 balance in one place.",
    },
    pretest: {
      title: "Pretest",
      subtitle: "A short diagnostic to estimate baseline and rank weak skills.",
    },
    roadmap: {
      title: "Roadmap",
      subtitle: "A generated learning path based on diagnostic results, practice, and error logs.",
    },
    lessons: {
      title: "Lessons",
      subtitle: "Subskill lessons, traps, examples, and scaffold drills from Pre-SAT Grade 10 to SAT 1600.",
    },
    topics: {
      title: "Topics",
      subtitle: "Choose a section, domain, skill, and difficulty for student-led practice.",
    },
    practice: {
      title: "Practice",
      subtitle: "Practice one focused skill at a time, then review the rule, trap, and proof step.",
    },
    review: {
      title: "Review",
      subtitle: "Return to wrong answers, bookmarks, and skills that keep recurring.",
    },
    vocab: {
      title: "SAT Vocab",
      subtitle: "Study vocabulary by category, flashcards, and quizzes that skip words already known.",
    },
    guide: {
      title: "Guide",
      subtitle: "How learners, parents, and content admins should use each workflow.",
    },
    notes: {
      title: "Notes",
      subtitle: "Capture study rules, mistakes, formulas, and review reminders.",
    },
    bank: {
      title: "Bank Manager",
      subtitle: "Admin-only bulk import and source processing workflow.",
    },
    sources: {
      title: "Sources",
      subtitle: "Track what can be reused, what needs review, and what should remain metadata only.",
    },
    official: {
      title: "Official Log",
      subtitle: "Track official practice without storing official question text.",
    },
    author: {
      title: "Authoring",
      subtitle: "Create original question drafts that can become the safe public question bank.",
    },
    accounts: {
      title: "Accounts",
      subtitle: "Create local accounts, separate public access from family access, and link parents to students.",
    },
    news: {
      title: "News",
      subtitle: "Read admin-published announcements, weekly priorities, and member updates.",
    },
  };

  const pageCopyVi = {
    admin: {
      title: "Trung tâm Admin",
      subtitle: "Theo dõi người dùng, hàng đợi duyệt câu hỏi, tường lửa phát hành công khai và trạng thái hệ thống.",
    },
    lessons: {
      title: "Bài học",
      subtitle: "Bài học theo subskill, bẫy sai, ví dụ mẫu và drill từ Pre-SAT Grade 10 đến SAT 1600.",
    },
    dashboard: {
      title: "Tổng quan",
      subtitle: "Bắt đầu bằng bài đầu vào, sau đó học theo kỹ năng yếu và ôn lỗi sai.",
    },
    pretest: {
      title: "Kiểm tra đầu vào",
      subtitle: "Bài đánh giá nhanh để ước lượng mức nền và xếp hạng kỹ năng yếu.",
    },
    roadmap: {
      title: "Lộ trình",
      subtitle: "Lộ trình học sinh ra từ pretest, luyện tập và sổ lỗi sai.",
    },
    topics: {
      title: "Chuyên đề",
      subtitle: "Chọn phần thi, nhóm kỹ năng, kỹ năng nhỏ và độ khó để luyện theo chủ đề.",
    },
    practice: {
      title: "Luyện tập",
      subtitle: "Luyện một kỹ năng trọng tâm, rồi đọc quy tắc, bẫy sai và bước chứng minh.",
    },
    review: {
      title: "Ôn lỗi sai",
      subtitle: "Quay lại câu sai, câu đã lưu và các kỹ năng lặp lỗi.",
    },
    vocab: {
      title: "SAT Vocab",
      subtitle: "Học từ theo danh mục, flashcard và quiz bỏ qua các từ đã biết.",
    },
    guide: {
      title: "Hướng dẫn",
      subtitle: "Cách học sinh, phụ huynh và admin nội dung sử dụng từng luồng trong app.",
    },
    notes: {
      title: "Ghi chú",
      subtitle: "Lưu quy tắc, lỗi sai, công thức và nhắc nhở ôn tập.",
    },
    bank: {
      title: "Ngân hàng đề",
      subtitle: "Khu vực admin để nhập hàng loạt và xử lý nguồn dữ liệu.",
    },
    sources: {
      title: "Nguồn dữ liệu",
      subtitle: "Theo dõi nội dung nào được dùng, cần duyệt hoặc chỉ nên lưu dạng metadata.",
    },
    official: {
      title: "Log bài chính thức",
      subtitle: "Theo dõi bài chính thức mà không lưu nguyên văn câu hỏi chính thức.",
    },
    author: {
      title: "Nhập từng câu",
      subtitle: "Tạo câu hỏi gốc để xây ngân hàng câu hỏi an toàn.",
    },
    accounts: {
      title: "Tài khoản",
      subtitle: "Tạo tài khoản gia đình trong bản MVP local.",
    },
    news: {
      title: "Tin tức",
      subtitle: "Xem thông báo, trọng tâm tuần và cập nhật do admin đăng.",
    },
  };

  const validViews = new Set(Object.keys(pageCopyEn));
  const bankPreloadViews = new Set(["admin", "topics", "lessons", "sources", "practice", "pretest", "bank"]);
  const sourcePreloadViews = new Set(["admin", "sources"]);
  const externalResourceViews = new Set(["dashboard", "roadmap", "lessons", "topics", "practice"]);
  const roleViewPolicy = Object.freeze({
    admin: Object.freeze({
      defaultView: "admin",
      views: Object.freeze(["admin", "practice", "sources", "bank", "author", "accounts", "official", "news", "guide"]),
    }),
    parent: Object.freeze({
      defaultView: "dashboard",
      views: Object.freeze(["dashboard", "accounts", "official", "news", "guide"]),
      optionalViews: Object.freeze(["author"]),
    }),
    student: Object.freeze({
      defaultView: "dashboard",
      views: Object.freeze(["dashboard", "pretest", "roadmap", "lessons", "topics", "practice", "review", "notes", "vocab", "official", "news", "guide"]),
    }),
  });
  const navOrder = Object.freeze(["dashboard", "admin", "pretest", "roadmap", "lessons", "topics", "practice", "review", "notes", "vocab", "bank", "sources", "official", "author", "accounts", "news", "guide"]);
  const studentNavViewGroups = Object.freeze([
    Object.freeze({ key: "today", labels: Object.freeze({ en: "Today", vi: "Hôm nay" }), views: Object.freeze(["dashboard", "roadmap"]) }),
    Object.freeze({ key: "learn", labels: Object.freeze({ en: "Learn", vi: "Học" }), views: Object.freeze(["lessons", "topics"]) }),
    Object.freeze({ key: "practice", labels: Object.freeze({ en: "Practice", vi: "Luyện" }), views: Object.freeze(["pretest", "practice", "review"]) }),
    Object.freeze({ key: "tools", labels: Object.freeze({ en: "Tools", vi: "Công cụ" }), views: Object.freeze(["notes", "vocab", "official", "news", "guide"]) }),
  ]);
  const studentNavText = Object.freeze({
    dashboard: Object.freeze({ en: "Today", vi: "Hôm nay" }),
    roadmap: Object.freeze({ en: "Roadmap", vi: "Lộ trình" }),
    lessons: Object.freeze({ en: "Lessons", vi: "Bài học" }),
    topics: Object.freeze({ en: "Topics", vi: "Chuyên đề" }),
    pretest: Object.freeze({ en: "Pretest", vi: "Kiểm tra đầu vào" }),
    practice: Object.freeze({ en: "Practice", vi: "Luyện tập" }),
    review: Object.freeze({ en: "Mistake review", vi: "Ôn lỗi sai" }),
    notes: Object.freeze({ en: "Notes", vi: "Ghi chú" }),
    vocab: Object.freeze({ en: "Vocab", vi: "Từ vựng" }),
    official: Object.freeze({ en: "Official log", vi: "Log bài chính thức" }),
    news: Object.freeze({ en: "News", vi: "Tin tức" }),
    guide: Object.freeze({ en: "Guide", vi: "Hướng dẫn" }),
  });

  function languageKey(language = "en") {
    return language === "vi" ? "vi" : "en";
  }

  function roleForAccount(account = null) {
    const role = String(account?.role || "student").trim();
    return roleViewPolicy[role] ? role : "student";
  }

  function defaultViewForAccount(account = null) {
    return roleViewPolicy[roleForAccount(account)].defaultView;
  }

  function allowedViewsForAccount(account = null, options = {}) {
    const role = roleForAccount(account);
    const policy = roleViewPolicy[role];
    const views = new Set(policy.views);
    if (role === "parent" && options.canAuthorQuestions) {
      (policy.optionalViews || []).forEach((view) => views.add(view));
    }
    return views;
  }

  function navOrderForRole() {
    return [...navOrder];
  }

  function parentDashboardLabel(language = "en") {
    return languageKey(language) === "vi" ? "Phụ huynh" : "Parent Coach";
  }

  function studentNavLabels(language = "en") {
    const lang = languageKey(language);
    return Object.fromEntries(Object.entries(studentNavText).map(([view, copy]) => [view, copy[lang] || copy.en]));
  }

  function studentNavGroups(language = "en") {
    const lang = languageKey(language);
    return studentNavViewGroups.map((group) => ({
      key: group.key,
      label: group.labels[lang] || group.labels.en,
      views: [...group.views],
    }));
  }

  function studentNavBadges({ language = "en", hasBaseline = false, dueCount = 0, notesDue = 0 } = {}) {
    const vi = languageKey(language) === "vi";
    return {
      pretest: hasBaseline ? "" : vi ? "20 câu" : "20 q",
      review: Number(dueCount || 0) ? String(Number(dueCount || 0)) : "",
      lessons: hasBaseline ? (vi ? "1 bài" : "1 lesson") : "",
      notes: Number(notesDue || 0) ? String(Number(notesDue || 0)) : "",
    };
  }

  function normalizeView(view, fallback = DEFAULT_VIEW) {
    const candidate = String(view || "").trim();
    if (validViews.has(candidate)) return candidate;
    return validViews.has(fallback) ? fallback : DEFAULT_VIEW;
  }

  function pageCopy(view = DEFAULT_VIEW, language = "en") {
    const normalized = normalizeView(view);
    const fallback = pageCopyEn[normalized] || pageCopyEn[DEFAULT_VIEW];
    if (language === "vi") return pageCopyVi[normalized] || fallback;
    return fallback;
  }

  function buildViewState(view = DEFAULT_VIEW, language = "en") {
    const activeView = normalizeView(view);
    const copy = pageCopy(activeView, language);
    return {
      activeView,
      viewNodeId: `view-${activeView}`,
      title: copy.title,
      subtitle: copy.subtitle,
    };
  }

  function buildViewPreloadPlan(view = DEFAULT_VIEW) {
    const activeView = normalizeView(view);
    return {
      activeView,
      banks: bankPreloadViews.has(activeView),
      archiveRegistry: sourcePreloadViews.has(activeView),
      questionIntegrityReport: sourcePreloadViews.has(activeView),
      externalResources: externalResourceViews.has(activeView),
    };
  }

  function applyViewDom(view = DEFAULT_VIEW, doc = null) {
    const activeView = normalizeView(view);
    if (!doc || typeof doc.querySelectorAll !== "function") return buildViewState(activeView);
    doc.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.view === activeView);
    });
    doc.querySelectorAll(".view").forEach((viewNode) => {
      viewNode.classList.toggle("active", viewNode.id === `view-${activeView}`);
    });
    return buildViewState(activeView);
  }

  return {
    allowedViewsForAccount,
    applyViewDom,
    buildViewPreloadPlan,
    buildViewState,
    defaultViewForAccount,
    normalizeView,
    navOrderForRole,
    pageCopy,
    parentDashboardLabel,
    roleForAccount,
    studentNavBadges,
    studentNavGroups,
    studentNavLabels,
  };
});
