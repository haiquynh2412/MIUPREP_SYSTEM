(function initSatStudioPublicApi(root, factory) {
  const publicApi = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = publicApi;
  }
  if (root) {
    root.SatStudioPublicApi = publicApi;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioPublicApi() {
  const DEFAULT_BASE_URL = "/api/public";
  const PUBLIC_BACKEND_COOKIE_SESSION = "__sat_studio_http_only_cookie_session__";
  const PUBLIC_BACKEND_CSRF_COOKIE_NAME = "sat_studio_public_csrf";
  const PUBLIC_BACKEND_CSRF_HEADER_NAME = "X-CSRF-Token";
  const PROFILE_SYNC_CONTRACT_VERSION = "sat_profile_v2_learning_evidence";
  const PROFILE_SOURCE_OF_TRUTH = {
    profile: "backend.profile_records",
    attempts: "backend.profile_records:profile.attempts",
    learningEvents: "backend.profile_records:profile.learningEvents",
    learningEvidence: "backend.profile_records:profile.attempts[].learningEvidence",
    progressSummary: "backend.progress_records",
  };

  function normalizeBaseUrl(baseUrl = DEFAULT_BASE_URL) {
    return String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  function authHeaders(token) {
    if (token === PUBLIC_BACKEND_COOKIE_SESSION) return {};
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function cookieValue(name) {
    if (typeof document === "undefined") return "";
    const prefix = `${encodeURIComponent(name)}=`;
    const row = String(document.cookie || "")
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    return row ? decodeURIComponent(row.slice(prefix.length)) : "";
  }

  function csrfHeaders(method, token) {
    const normalized = String(method || "GET").toUpperCase();
    if (["GET", "HEAD", "OPTIONS"].includes(normalized)) return {};
    if (token && token !== PUBLIC_BACKEND_COOKIE_SESSION) return {};
    const csrfToken = cookieValue(PUBLIC_BACKEND_CSRF_COOKIE_NAME);
    return csrfToken ? { [PUBLIC_BACKEND_CSRF_HEADER_NAME]: csrfToken } : {};
  }

  async function request(path, options = {}) {
    const fetchImpl = options.fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
    if (!fetchImpl) throw new Error("Fetch is not available in this environment.");
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const headers = {
      Accept: "application/json",
      ...authHeaders(options.token),
      ...csrfHeaders(options.method || "GET", options.token),
      ...(options.headers || {}),
    };
    const init = {
      method: options.method || "GET",
      headers,
      credentials: "include",
    };
    if (options.body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }

    const response = await fetchImpl(`${baseUrl}${path}`, init);
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      const error = new Error(payload.error || `Request failed with ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  function health(options = {}) {
    return request("/health", options);
  }

  function bootstrapAdmin(body, options = {}) {
    return request("/bootstrap", { ...options, method: "POST", body });
  }

  function login(body, options = {}) {
    return request("/login", { ...options, method: "POST", body });
  }

  function signup(body, options = {}) {
    return request("/signup", { ...options, method: "POST", body });
  }

  function refreshSession(token, options = {}) {
    return request("/session/refresh", { ...options, method: "POST", token });
  }

  function logout(token, options = {}) {
    return request("/logout", { ...options, method: "POST", token });
  }

  function me(token, options = {}) {
    return request("/me", { ...options, token });
  }

  function createAccount(token, account, options = {}) {
    return request("/accounts", { ...options, method: "POST", token, body: account });
  }

  function listAccounts(token, options = {}) {
    return request("/accounts", { ...options, token });
  }

  function updateAccountStatus(token, accountId, status, options = {}) {
    return request(`/accounts/${encodeURIComponent(accountId)}/status`, {
      ...options,
      method: "POST",
      token,
      body: { status },
    });
  }

  function saveProgress(token, accountId, progress, options = {}) {
    return request("/progress", {
      ...options,
      method: "POST",
      token,
      body: {
        accountId,
        progress,
        source: options.source || "sat_studio",
      },
    });
  }

  function getProgress(token, accountId, options = {}) {
    const params = new URLSearchParams();
    if (accountId) params.set("accountId", accountId);
    params.set("source", options.source || "sat_studio");
    return request(`/progress?${params.toString()}`, { ...options, token });
  }

  function saveProfile(token, accountId, profile, options = {}) {
    return request("/profile", {
      ...options,
      method: "POST",
      token,
      body: {
        accountId,
        profile,
        source: options.source || "sat_studio_profile",
        clientRevision: options.clientRevision || 0,
        baseServerRevision: options.baseServerRevision,
        mergeStrategy: options.mergeStrategy || "reject_conflict",
      },
    });
  }

  function getProfile(token, accountId, options = {}) {
    const params = new URLSearchParams();
    if (accountId) params.set("accountId", accountId);
    params.set("source", options.source || "sat_studio_profile");
    return request(`/profile?${params.toString()}`, { ...options, token });
  }

  function createQuestionAudit(token, audit, options = {}) {
    return request("/question-audits", { ...options, method: "POST", token, body: audit });
  }

  function listQuestionReviews(token, questionId = "", options = {}) {
    const params = new URLSearchParams();
    if (questionId) params.set("questionId", questionId);
    if (options.limit) params.set("limit", options.limit);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request(`/question-reviews${suffix}`, { ...options, token });
  }

  function saveQuestionReview(token, review, options = {}) {
    return request("/question-reviews", { ...options, method: "POST", token, body: review });
  }

  function getContentPackage(token, options = {}) {
    const params = new URLSearchParams();
    params.set("scope", options.scope || "public");
    ["id", "section", "domain", "skill", "difficulty", "sourceType", "reviewStatus", "visibility", "questionType", "calculator", "desmos"].forEach((key) => {
      if (options[key]) params.set(key, options[key]);
    });
    if (options.limit !== undefined) params.set("limit", options.limit);
    if (options.offset !== undefined) params.set("offset", options.offset);
    if (options.includeContent !== undefined) params.set("includeContent", options.includeContent ? "true" : "false");
    return request(`/content-package?${params.toString()}`, { ...options, token });
  }

  function saveContentPackage(token, contentPackage, options = {}) {
    return request("/content-package", {
      ...options,
      method: "POST",
      token,
      body: {
        scope: options.scope || "public",
        package: contentPackage,
      },
    });
  }

  function resolveQuestionAudit(token, auditId, resolution, options = {}) {
    return request(`/question-audits/${encodeURIComponent(auditId)}/resolve`, {
      ...options,
      method: "POST",
      token,
      body: resolution,
    });
  }

  function listAuditLog(token, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit);
    if (options.action) params.set("action", options.action);
    if (options.targetType) params.set("targetType", options.targetType);
    if (options.actorAccountId) params.set("actorAccountId", options.actorAccountId);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request(`/audit-log${suffix}`, { ...options, token });
  }

  function schemaVersion(token, options = {}) {
    return request("/schema-version", { ...options, token });
  }

  function exportSnapshot(token, options = {}) {
    return request("/export", { ...options, token });
  }

  function monitoring(token, options = {}) {
    return request("/monitoring", { ...options, token });
  }

  function purgeSessions(token, options = {}) {
    return request("/maintenance/purge-sessions", { ...options, method: "POST", token });
  }

  function listClasses(token, options = {}) {
    return request("/classes", { ...options, token });
  }

  function createClass(token, classroom, options = {}) {
    return request("/classes", { ...options, method: "POST", token, body: classroom });
  }

  function joinClass(token, payload, options = {}) {
    return request("/classes/join", { ...options, method: "POST", token, body: payload });
  }

  function listClassAssignments(token, classId, options = {}) {
    return request(`/classes/${encodeURIComponent(classId)}/assignments`, { ...options, token });
  }

  function createClassAssignment(token, classId, assignment, options = {}) {
    return request(`/classes/${encodeURIComponent(classId)}/assignments`, {
      ...options,
      method: "POST",
      token,
      body: assignment,
    });
  }

  function getClassReport(token, classId, options = {}) {
    return request(`/classes/${encodeURIComponent(classId)}/report`, { ...options, token });
  }

  function submitAssignmentEvidence(token, assignmentId, payload, options = {}) {
    return request(`/assignments/${encodeURIComponent(assignmentId)}/evidence`, {
      ...options,
      method: "POST",
      token,
      body: payload,
    });
  }

  function buildProgressSnapshot(profile = {}, account = {}) {
    const attempts = Array.isArray(profile.attempts) ? profile.attempts : [];
    const learningEvents = Array.isArray(profile.learningEvents) ? profile.learningEvents : [];
    const attemptsWithLearningEvidence = attempts.filter((attempt) => attempt?.learningEvidence?.status === "provided").length;
    const missingRequiredEvidence = attempts.filter((attempt) => attempt?.learningEvidence?.required && attempt.learningEvidence.status !== "provided").length;
    return {
      accountId: account.id || "",
      targetScore: Number(account.targetScore || 0),
      attempts: attempts.length,
      attemptsWithLearningEvidence,
      missingRequiredEvidence,
      learningEvents: learningEvents.length,
      pretests: Array.isArray(profile.pretests) ? profile.pretests.length : 0,
      latestDiagnostic: profile.pretests?.[0] || null,
      attendance: profile.attendance || {},
      streak: profile.streak || {},
      skillMastery: profile.skillMastery || {},
      lessonProgress: profile.lessonProgress || {},
      updatedAt: new Date().toISOString(),
    };
  }

  function jsonClone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function buildFullProfileSnapshot(profile = {}, account = {}) {
    const clonedProfile = jsonClone(profile);
    delete clonedProfile.currentPretest;
    return {
      schemaVersion: PROFILE_SYNC_CONTRACT_VERSION,
      syncContractVersion: PROFILE_SYNC_CONTRACT_VERSION,
      sourceOfTruth: PROFILE_SOURCE_OF_TRUTH,
      accountId: account.id || "",
      account: {
        id: account.id || "",
        name: account.name || account.displayName || "",
        role: account.role || "student",
        targetScore: Number(account.targetScore || 0),
      },
      summary: buildProgressSnapshot(profile, account),
      profile: clonedProfile,
      clientUpdatedAt: new Date().toISOString(),
    };
  }

  return {
    DEFAULT_BASE_URL,
    PUBLIC_BACKEND_COOKIE_SESSION,
    PUBLIC_BACKEND_CSRF_COOKIE_NAME,
    PUBLIC_BACKEND_CSRF_HEADER_NAME,
    PROFILE_SOURCE_OF_TRUTH,
    PROFILE_SYNC_CONTRACT_VERSION,
    bootstrapAdmin,
    buildFullProfileSnapshot,
    buildProgressSnapshot,
    createAccount,
    createClass,
    createClassAssignment,
    createQuestionAudit,
    exportSnapshot,
    getClassReport,
    getProfile,
    getProgress,
    getContentPackage,
    health,
    listAccounts,
    listAuditLog,
    listClassAssignments,
    listClasses,
    listQuestionReviews,
    login,
    logout,
    me,
    monitoring,
    normalizeBaseUrl,
    purgeSessions,
    refreshSession,
    request,
    resolveQuestionAudit,
    joinClass,
    saveQuestionReview,
    saveProfile,
    saveProgress,
    saveContentPackage,
    schemaVersion,
    submitAssignmentEvidence,
    signup,
    updateAccountStatus,
  };
});
