(function initSatStudioAccountEngine(root, factory) {
  let permissions = root?.SatStudioPermissions;
  if (!permissions && typeof require === "function") {
    permissions = require("./sat_permissions.js");
  }
  const accountEngine = factory(permissions);
  if (typeof module === "object" && module.exports) {
    module.exports = accountEngine;
  }
  if (root) {
    root.SatStudioAccountEngine = accountEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioAccountEngine(permissions) {
  const VALID_ROLES = new Set(["admin", "parent", "student"]);
  const VALID_AVATAR_COLORS = new Set(["teal", "blue", "coral", "amber", "slate"]);

  function isAccountManager(account) {
    return permissions?.isAccountManager ? permissions.isAccountManager(account) : account?.role === "admin" || account?.role === "parent";
  }

  function canCreateAnyAccount(account) {
    return permissions?.canCreateAnyAccount ? permissions.canCreateAnyAccount(account) : account?.role === "admin";
  }

  function normalizedRole(role) {
    return VALID_ROLES.has(role) ? role : "student";
  }

  function normalizedScope(scope) {
    return scope === "public" ? "public" : "family";
  }

  function normalizedTheme(theme) {
    return theme === "teen_quest" ? "teen_quest" : "studio";
  }

  function normalizedStatus(status) {
    return ["active", "suspended", "disabled"].includes(status) ? status : "active";
  }

  function initialsFromName(value = "") {
    const initials = String(value || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    return initials.slice(0, 2) || "S";
  }

  function normalizeAvatarInitials(value = "", name = "") {
    const clean = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 2);
    return clean || initialsFromName(name);
  }

  function normalizeAvatarColor(value = "") {
    return VALID_AVATAR_COLORS.has(value) ? value : "teal";
  }

  function normalizeStudyPlan(studyPlan = {}) {
    return {
      weeklyTarget: Number(studyPlan.weeklyTarget) || 4,
      nextSessionAt: typeof studyPlan.nextSessionAt === "string" ? studyPlan.nextSessionAt : "",
    };
  }

  function normalizeAccountPermissions(account = {}) {
    const source = account.permissions && typeof account.permissions === "object" ? account.permissions : {};
    if (account.role === "admin") {
      return { rewardManager: true, questionContributor: true };
    }
    if (account.role === "parent") {
      return {
        rewardManager: source.rewardManager !== false,
        questionContributor: Boolean(source.questionContributor),
      };
    }
    return {
      rewardManager: false,
      questionContributor: false,
    };
  }

  function normalizeAccount(account = {}) {
    return {
      ...account,
      email: typeof account.email === "string" ? account.email.trim() : "",
      gradeLevel: typeof account.gradeLevel === "string" ? account.gradeLevel.trim() : "",
      avatarInitials: normalizeAvatarInitials(account.avatarInitials, account.name || account.id),
      avatarColor: normalizeAvatarColor(account.avatarColor),
      createdAt: typeof account.createdAt === "string" ? account.createdAt : "",
      scope: normalizedScope(account.scope),
      role: normalizedRole(account.role),
      status: normalizedStatus(account.status),
      parentIds: Array.isArray(account.parentIds) ? account.parentIds.filter(Boolean) : [],
      uiTheme: normalizedTheme(account.uiTheme),
      studyPlan: normalizeStudyPlan(account.studyPlan),
      permissions: normalizeAccountPermissions({ ...account, role: normalizedRole(account.role) }),
    };
  }

  function mergeAccounts(existing = [], defaults = []) {
    const byId = new Map();
    (Array.isArray(defaults) ? defaults : []).forEach((account) => {
      if (account?.id) byId.set(account.id, account);
    });
    (Array.isArray(existing) ? existing : []).forEach((account) => {
      if (account?.id) byId.set(account.id, { ...(byId.get(account.id) || {}), ...account });
    });
    return [...byId.values()].map(normalizeAccount);
  }

  function linkedStudentAccountsFor(accounts = [], account = null) {
    if (permissions?.linkedStudentAccountsFor) return permissions.linkedStudentAccountsFor(accounts, account);
    if (!account) return [];
    const students = accounts.filter((item) => item.role === "student");
    if (account.role === "admin") return students;
    if (account.role === "parent") {
      return students.filter((student) => Array.isArray(student.parentIds) && student.parentIds.includes(account.id));
    }
    return students.filter((student) => student.id === account.id);
  }

  function visibleAccountsFor(accounts = [], account = null) {
    if (!account) return [];
    if (account.role === "admin") return accounts;
    if (account.role === "parent") {
      const byId = new Map();
      byId.set(account.id, account);
      linkedStudentAccountsFor(accounts, account).forEach((student) => byId.set(student.id, student));
      return [...byId.values()];
    }
    return [account];
  }

  function currentAccount(accounts = [], activeAccountId = "") {
    return (Array.isArray(accounts) ? accounts : []).find((account) => account.id === activeAccountId) || null;
  }

  function ensureAccountProfile(profiles = {}, accountId = "", emptyProfile = null) {
    const buildEmptyProfile =
      typeof emptyProfile === "function"
        ? emptyProfile
        : () => ({
            attempts: [],
            notes: {},
            studyNotes: [],
            externalLinks: {},
            externalStudyLogs: [],
            bookmarks: [],
            officialLogs: [],
            errorTags: [],
            skillMastery: {},
            lessonProgress: {},
            practiceSessionReports: [],
            vocabKnown: [],
            vocabQuizAttempts: [],
            pretests: [],
            roadmap: [],
            roadmapLastBuiltAt: "",
            roadmapBuildReason: "",
            currentPretest: null,
            streak: { count: 0, lastPracticeDate: "" },
            attendance: { points: 0, daily: {}, stickers: [], questRewardsClaimed: [], spentPoints: 0, rewardRedemptions: [], lastRewardAt: "" },
          });
    const fallback = buildEmptyProfile();
    if (!accountId) return fallback;
    if (!profiles[accountId] || typeof profiles[accountId] !== "object") profiles[accountId] = buildEmptyProfile();
    const profile = profiles[accountId];

    if (!Array.isArray(profile.attempts)) profile.attempts = [];
    if (!profile.notes || typeof profile.notes !== "object") profile.notes = {};
    if (!Array.isArray(profile.studyNotes)) profile.studyNotes = [];
    if (!profile.externalLinks || typeof profile.externalLinks !== "object") profile.externalLinks = fallback.externalLinks || {};
    if (!Array.isArray(profile.externalStudyLogs)) profile.externalStudyLogs = [];
    if (!Array.isArray(profile.bookmarks)) profile.bookmarks = [];
    if (!Array.isArray(profile.officialLogs)) profile.officialLogs = [];
    if (!Array.isArray(profile.errorTags)) profile.errorTags = [];
    if (!profile.skillMastery || typeof profile.skillMastery !== "object") profile.skillMastery = {};
    if (!profile.lessonProgress || typeof profile.lessonProgress !== "object") profile.lessonProgress = {};
    if (!Array.isArray(profile.practiceSessionReports)) profile.practiceSessionReports = [];
    if (!Array.isArray(profile.vocabKnown)) profile.vocabKnown = [];
    if (!Array.isArray(profile.vocabQuizAttempts)) profile.vocabQuizAttempts = [];
    if (!Array.isArray(profile.pretests)) profile.pretests = [];
    if (!Array.isArray(profile.roadmap)) profile.roadmap = [];
    if (typeof profile.roadmapLastBuiltAt !== "string") profile.roadmapLastBuiltAt = "";
    if (typeof profile.roadmapBuildReason !== "string") profile.roadmapBuildReason = "";
    if (!profile.streak || typeof profile.streak !== "object") profile.streak = fallback.streak || { count: 0, lastPracticeDate: "" };
    if (!profile.attendance || typeof profile.attendance !== "object") {
      profile.attendance = fallback.attendance || { points: 0, daily: {}, stickers: [], lastRewardAt: "" };
    }
    if (!profile.attendance.daily || typeof profile.attendance.daily !== "object") profile.attendance.daily = {};
    if (!Array.isArray(profile.attendance.stickers)) profile.attendance.stickers = [];
    if (!Array.isArray(profile.attendance.questRewardsClaimed)) profile.attendance.questRewardsClaimed = [];
    if (!Array.isArray(profile.attendance.rewardRedemptions)) profile.attendance.rewardRedemptions = [];
    if (typeof profile.attendance.points !== "number") profile.attendance.points = Number(profile.attendance.points || 0);
    if (typeof profile.attendance.spentPoints !== "number") profile.attendance.spentPoints = Number(profile.attendance.spentPoints || 0);
    if (typeof profile.attendance.lastRewardAt !== "string") profile.attendance.lastRewardAt = "";
    if (!Object.prototype.hasOwnProperty.call(profile, "currentPretest")) profile.currentPretest = null;
    return profile;
  }

  function activeAccountProfile(state = {}, emptyProfile = null) {
    const account = currentAccount(state.accounts, state.activeAccountId);
    return account ? ensureAccountProfile(state.profiles, account.id, emptyProfile) : ensureAccountProfile({}, "", emptyProfile);
  }

  function resolveCreationPolicy(manager, requested = {}) {
    const canManage = isAccountManager(manager);
    const admin = canCreateAnyAccount(manager);
    const scope = admin && requested.scope === "public" ? "public" : "family";
    const requestedRole = admin ? normalizedRole(requested.role) : "student";
    const role = scope === "public" && requestedRole !== "student" ? "student" : requestedRole;
    return { canManage, admin, scope, role };
  }

  function activeAdminCount(accounts = [], excludeId = "") {
    return (Array.isArray(accounts) ? accounts : []).filter(
      (account) => account?.role === "admin" && account.status !== "disabled" && account.status !== "suspended" && account.id !== excludeId,
    ).length;
  }

  function canEditAccount(accounts = [], manager = null, target = null) {
    if (!isAccountManager(manager) || !target) return false;
    if (canCreateAnyAccount(manager)) return true;
    return manager?.role === "parent" && target.role === "student" && Array.isArray(target.parentIds) && target.parentIds.includes(manager.id);
  }

  function canDeleteAccount(accounts = [], manager = null, target = null) {
    if (!target || !canCreateAnyAccount(manager)) return false;
    if (manager?.id === target.id) return false;
    if (target.role === "admin" && activeAdminCount(accounts, target.id) < 1) return false;
    return true;
  }

  function canChangeAccountStatus(accounts = [], manager = null, target = null, nextStatus = "active") {
    if (!target || !canCreateAnyAccount(manager)) return false;
    const status = normalizedStatus(nextStatus);
    if (manager?.id === target.id && status !== "active") return false;
    if (target.role === "admin" && status !== "active" && activeAdminCount(accounts, target.id) < 1) return false;
    return true;
  }

  function toIsoOrEmpty(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function fallbackSlugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function buildAccountDraft(input = {}, manager = null, options = {}) {
    const policy = resolveCreationPolicy(manager, {
      scope: input.scope,
      role: input.role,
    });
    if (!policy.canManage) {
      return { ok: false, reason: "Only parent or admin accounts can create new accounts.", policy };
    }

    const name = String(input.name || "").trim();
    const passcode = String(input.passcode || "").trim();
    if (!name || !passcode) {
      return { ok: false, reason: "Name and passcode are required.", policy };
    }

    const slugify = typeof options.slugify === "function" ? options.slugify : fallbackSlugify;
    const nowMs = options.nowMs || Date.now();
    const selectedParentId = String(input.parentId || "").trim();
    const parentIds =
      policy.role === "student" && policy.scope === "family"
        ? [selectedParentId || (manager?.role === "parent" ? manager.id : "")].filter(Boolean)
        : [];

    const account = normalizeAccount({
      id: input.id || `account-${slugify(name)}-${nowMs}`,
      name,
      email: String(input.email || "").trim(),
      gradeLevel: String(input.gradeLevel || "").trim(),
      avatarInitials: normalizeAvatarInitials(input.avatarInitials, name),
      avatarColor: normalizeAvatarColor(input.avatarColor),
      createdAt: input.createdAt || new Date(nowMs).toISOString(),
      role: policy.role,
      scope: policy.scope,
      passcode,
      targetScore: Number(input.targetScore) || 1450,
      uiTheme: normalizedTheme(input.uiTheme),
      permissions: {
        rewardManager: Boolean(input.permissionRewards),
        questionContributor: Boolean(input.permissionAuthoring),
      },
      parentIds,
      status: "active",
      studyPlan: {
        weeklyTarget: Number(input.weeklyTarget) || 4,
        nextSessionAt: input.nextSessionAt || toIsoOrEmpty(input.nextSessionLocal),
      },
    });

    return { ok: true, account, policy };
  }

  function buildAccountFormAccess({ accounts = [], manager = null, selectedScope = "family", selectedRole = "student" } = {}) {
    const canManage = isAccountManager(manager);
    const admin = canCreateAnyAccount(manager);
    const baseParents = accounts.filter((item) => item.role === "parent" && item.scope !== "public");
    const allowedParents = manager?.role === "parent" && !admin ? baseParents.filter((item) => item.id === manager.id) : baseParents;

    if (!canManage) {
      return {
        canManage,
        admin,
        scope: "family",
        role: "student",
        roleDisabled: true,
        scopeDisabled: true,
        parentLinkDisabled: true,
        forcedParentId: "",
        allowedParents: [],
      };
    }

    const policy = resolveCreationPolicy(manager, { scope: selectedScope, role: selectedRole });
    const roleDisabled = !admin || policy.scope === "public";
    const scopeDisabled = !admin;
    const forcedParentId = manager?.role === "parent" && !admin ? manager.id : "";
    const parentLinkDisabled = policy.role !== "student" || policy.scope === "public" || Boolean(forcedParentId);

    return {
      canManage,
      admin,
      scope: policy.scope,
      role: policy.role,
      roleDisabled,
      scopeDisabled,
      parentLinkDisabled,
      forcedParentId,
      allowedParents,
    };
  }

  function accountProgressSummary(account = {}, accountProfile = {}, helpers = {}) {
    const emptyProfile = typeof helpers.emptyProfile === "function" ? helpers.emptyProfile : () => ({ attendance: {}, streak: {} });
    const fallback = emptyProfile();
    const profile = accountProfile || {};
    const attempts = Array.isArray(profile.attempts) ? profile.attempts : [];
    const pretests = Array.isArray(profile.pretests) ? profile.pretests : [];
    const correct = attempts.filter((attempt) => attempt.correct).length;
    const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
    const latest = pretests[0];
    const attendance = profile.attendance || fallback.attendance || {};
    const externalLogs = Array.isArray(profile.externalStudyLogs) ? profile.externalStudyLogs : [];
    const externalMinutes = externalLogs.reduce((sum, log) => sum + (Number(log.minutes) || 0), 0);
    const weeklyTarget = Number(account.studyPlan?.weeklyTarget) || 4;
    const formatDateTime = typeof helpers.formatDateTime === "function" ? helpers.formatDateTime : (value) => value || "";
    const nextSession = account.studyPlan?.nextSessionAt ? formatDateTime(account.studyPlan.nextSessionAt) : "No session scheduled";

    return {
      attempts: attempts.length,
      accuracy,
      latestBaseline: latest ? `Baseline ${latest.scoreEstimate}` : "No diagnostic",
      points: attendance.points || 0,
      streak: profile.streak?.count || 0,
      externalMinutes,
      weeklyTarget,
      schedule: nextSession,
    };
  }

  return {
    accountProgressSummary,
    activeAccountProfile,
    activeAdminCount,
    buildAccountDraft,
    buildAccountFormAccess,
    canChangeAccountStatus,
    canCreateAnyAccount,
    canDeleteAccount,
    canEditAccount,
    currentAccount,
    ensureAccountProfile,
    isAccountManager,
    linkedStudentAccountsFor,
    mergeAccounts,
    normalizeAccount,
    normalizeAvatarColor,
    normalizeAvatarInitials,
    normalizedStatus,
    resolveCreationPolicy,
    visibleAccountsFor,
  };
});
