<script lang="ts">
  import { onMount } from "svelte";
  import type { AnnouncementAudience, AnnouncementState, AnnouncementStatus } from "../domain/announcements";
  import {
    announcementFeed,
    createAnnouncementPost,
    deleteAnnouncementPost,
    loadAnnouncementState,
    saveAnnouncementState,
    setAnnouncementStatus,
  } from "../domain/announcements";
  import type { AccountDraftInput, AccountOperationsModel, AccountState, SatAccount } from "../domain/account-ops";
  import {
    buildAccountOperationsModel,
    changeAccountStatus as changeLocalAccountStatus,
    createAccount,
    deleteAccount as deleteLocalAccount,
    loadAccountState,
    saveAccountState,
    updateAccount,
  } from "../domain/account-ops";
  import type { BackendProfileRecord, BackendSessionModel, ProfileDiffSummary, PublicBackendState } from "../domain/public-backend";
  import {
    PUBLIC_BACKEND_COOKIE_SESSION,
    applyBackendPatch,
    applyServerProfileToAccountState,
    backendHealth,
    backendMonitoring,
    backendStatusPatch,
    bootstrapBackendAdmin,
    buildBackendSessionModel,
    buildFullProfileSnapshot,
    buildProfileDiffSummary,
    exportBackendSnapshot,
    getBackendProfile,
    getBackendToken,
    listBackendQuestionReviews,
    loadPublicBackendState,
    loginBackend,
    logoutBackend,
    normalizeBaseUrl,
    normalizeBackendProfileRecord,
    refreshBackendSession,
    saveBackendProfile,
    saveBackendQuestionReview,
    savePublicBackendState,
    serverProfileSummary,
    setBackendToken,
  } from "../domain/public-backend";
  import type { RewardOperationsModel, RewardProgramStatus, RewardScope, RewardState, RewardType } from "../domain/rewards";
  import {
    buildRewardOperationsModel,
    buildRewardState,
    createRewardProgram,
    deleteRewardProgram as deleteLocalRewardProgram,
    resolveRewardClaim,
    saveRewardState,
    setRewardProgramStatus,
  } from "../domain/rewards";
  import type {
    AdminContentModel,
    AdminOperationsModel,
    AdminQueueItem,
    AdminQueueKind,
    AdminQuestion,
    ExpertReviewDraft,
    ExpertReviewStatus,
    ExpertReviewVersion,
    ExpertReviewWorkspace,
  } from "../domain/admin-content";
  import {
    addExpertReviewVersion,
    buildAdminContentModel,
    buildAdminOperationsModel,
    choiceViews,
    correctAnswerText,
    expertReviewBackendPayload,
    explanationViews,
    latestExpertReviewVersions,
    loadAdminReportBundle,
    loadExpertReviewWorkspace,
    loadInternalQuestionBanks,
    questionToExpertReviewDraft,
    saveExpertReviewWorkspace,
    sourceFacts,
    validateExpertReviewDraft,
  } from "../domain/admin-content";

  interface RewardFormState {
    title: string;
    description: string;
    costPoints: number;
    rewardType: RewardType;
    scope: RewardScope;
    status: RewardProgramStatus;
    targetStudentId: string;
  }

  interface AnnouncementFormState {
    title: string;
    body: string;
    audience: AnnouncementAudience;
    status: AnnouncementStatus;
    pinned: boolean;
  }

  let model: AdminContentModel | null = null;
  let operations: AdminOperationsModel | null = null;
  let accountState: AccountState | null = null;
  let accountModel: AccountOperationsModel | null = null;
  let backendState: PublicBackendState | null = null;
  let backendModel: BackendSessionModel | null = null;
  let rewardState: RewardState | null = null;
  let rewardModel: RewardOperationsModel | null = null;
  let announcementState: AnnouncementState = loadAnnouncementState();
  let expertWorkspace: ExpertReviewWorkspace = loadExpertReviewWorkspace();
  let expertDraft: ExpertReviewDraft | null = null;
  let expertStatus: ExpertReviewStatus = "expert_reviewed";
  let expertNote = "";
  let expertMessage = "";
  let expertBusy = "";
  let expertBackendHistory: Array<Record<string, unknown>> = [];
  let pendingProfileRecord: BackendProfileRecord | null = null;
  let profileSyncLocalAccountId = "";
  let questions: AdminQuestion[] = [];
  let loading = true;
  let loadError = "";
  let accountMessage = "";
  let backendMessage = "";
  let rewardMessage = "";
  let announcementMessage = "";
  let backendBusy = "";
  let backendBaseUrl = "/api/public";
  let backendUsername = "";
  let backendPassword = "";
  let activeTab: "review" | "expert" | "release" | "readiness" | "sources" | "authoring" | "accounts" | "rewards" | "news" | "backend" = "review";
  let activeKind: AdminQueueKind | "all" = "all";
  let search = "";
  let selectedId = "";
  let editingAccountId = "";
  let accountForm: AccountDraftInput = blankAccountForm();
  let rewardForm: RewardFormState = blankRewardForm();
  let announcementForm: AnnouncementFormState = blankAnnouncementForm();

  $: queue = model?.queue || [];
  $: filteredQueue = queue.filter((item) => {
    const haystack = [item.id, item.kind, item.detail, item.question.prompt, item.question.sourceType, item.question.sourceName].join(" ").toLowerCase();
    return (activeKind === "all" || item.kind === activeKind) && (!search.trim() || haystack.includes(search.trim().toLowerCase()));
  });
  $: selected = filteredQueue.find((item) => item.id === selectedId) || filteredQueue[0] || null;
  $: profileOptions = accountModel?.accounts.filter((row) => row.account.role === "student").map((row) => row.account) || [];
  $: selectedProfileAccount = profileOptions.find((account) => account.id === profileSyncLocalAccountId) || profileOptions[0] || null;
  $: pendingProfileDiff =
    pendingProfileRecord && accountState && selectedProfileAccount
      ? buildProfileDiffSummary(pendingProfileRecord, accountState.profiles[selectedProfileAccount.id])
      : null;
  $: adminAnnouncements = announcementFeed(announcementState, "admin");
  $: expertQuestion = selected?.question || null;
  $: expertValidation = expertQuestion && expertDraft ? validateExpertReviewDraft(expertQuestion, expertDraft) : null;
  $: expertLocalVersions = expertQuestion ? latestExpertReviewVersions(expertWorkspace, expertQuestion.id) : [];

  onMount(async () => {
    try {
      const [loadedQuestions, reportBundle] = await Promise.all([loadInternalQuestionBanks(), loadAdminReportBundle()]);
      questions = loadedQuestions;
      model = buildAdminContentModel(loadedQuestions);
      operations = buildAdminOperationsModel(model, loadedQuestions, reportBundle);
      announcementState = loadAnnouncementState();
      refreshAccountModel();
      refreshBackendModel();
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Could not load internal question banks.";
    } finally {
      loading = false;
    }
  });

  function setKind(kind: AdminQueueKind | "all"): void {
    activeKind = kind;
    selectedId = "";
  }

  function gateLabel(item: AdminQueueItem): string {
    if (item.gate.ok) return "Gate pass";
    return `${item.gate.blockers.length} blocker${item.gate.blockers.length === 1 ? "" : "s"}`;
  }

  function kindCount(kind: AdminQueueKind): number {
    return model?.summary.queueCounts[kind] || 0;
  }

  function percentWidth(value: number, total: number): number {
    if (!total) return 6;
    return Math.max(6, Math.min(100, (value / total) * 100));
  }

  function blankAccountForm(): AccountDraftInput {
    return {
      name: "",
      email: "",
      gradeLevel: "",
      avatarInitials: "",
      avatarColor: "teal",
      passcode: "",
      role: "student",
      scope: "family",
      parentId: "",
      targetScore: 1500,
      uiTheme: "studio",
      permissionRewards: true,
      permissionAuthoring: false,
      weeklyTarget: 4,
      nextSessionLocal: "",
    };
  }

  function blankRewardForm(): RewardFormState {
    return {
      title: "",
      description: "",
      costPoints: 60,
      rewardType: "privilege",
      scope: "family",
      status: "active",
      targetStudentId: "",
    };
  }

  function blankAnnouncementForm(): AnnouncementFormState {
    return {
      title: "",
      body: "",
      audience: "students",
      status: "published",
      pinned: false,
    };
  }

  function refreshAccountModel(state: AccountState = loadAccountState()): void {
    accountState = state;
    accountModel = buildAccountOperationsModel(state, "content-admin");
    const defaultProfileAccount = state.accounts.find((account) => account.id === "student-demo" && account.role === "student") || state.accounts.find((account) => account.role === "student");
    if (!profileSyncLocalAccountId || !state.accounts.some((account) => account.id === profileSyncLocalAccountId && account.role === "student")) {
      profileSyncLocalAccountId = defaultProfileAccount?.id || "";
    }
    refreshRewardModel(state);
  }

  function refreshRewardModel(state: AccountState = loadAccountState()): void {
    rewardState = buildRewardState(state);
    rewardModel = buildRewardOperationsModel(rewardState, "content-admin");
  }

  function refreshBackendModel(): void {
    const loaded = loadPublicBackendState();
    refreshAccountModel(loaded.accountState);
    backendState = loaded.backend;
    backendBaseUrl = loaded.backend.baseUrl;
    backendModel = buildBackendSessionModel(loaded.backend, getBackendToken(), accountModel?.manager || null);
  }

  function persistAccountResult(result: { ok: boolean; reason: string; state: AccountState }): void {
    accountMessage = result.reason;
    if (!result.ok) return;
    const saved = saveAccountState(result.state);
    refreshAccountModel(saved);
  }

  function persistRewardResult(result: { ok: boolean; reason: string; state: RewardState }): void {
    rewardMessage = result.reason;
    if (!result.ok) return;
    const saved = saveRewardState(result.state);
    refreshAccountModel(saved.accountState);
  }

  function persistBackendPatch(patch: Partial<PublicBackendState>, token?: string, stateOverride: AccountState | null = accountState): void {
    if (!stateOverride || !backendState) return;
    if (token !== undefined) setBackendToken(token);
    const backend = applyBackendPatch(backendState, { baseUrl: normalizeBaseUrl(backendBaseUrl), ...patch });
    const saved = savePublicBackendState(stateOverride, backend);
    refreshAccountModel(saved.accountState);
    backendState = saved.backend;
    backendModel = buildBackendSessionModel(saved.backend, getBackendToken(), accountModel?.manager || null);
  }

  function submitAccount(event: SubmitEvent): void {
    event.preventDefault();
    if (!accountState) return;
    const result = editingAccountId
      ? updateAccount(accountState, editingAccountId, accountForm, "content-admin")
      : createAccount(accountState, accountForm, "content-admin");
    persistAccountResult(result);
    if (result.ok) resetAccountForm();
  }

  function resetAccountForm(): void {
    editingAccountId = "";
    accountForm = blankAccountForm();
  }

  function editAccount(account: SatAccount): void {
    editingAccountId = account.id;
    accountMessage = "";
    accountForm = {
      name: account.name,
      email: account.email,
      gradeLevel: account.gradeLevel,
      avatarInitials: account.avatarInitials,
      avatarColor: account.avatarColor,
      passcode: account.passcode,
      role: account.role,
      scope: account.scope,
      parentId: account.parentIds[0] || "",
      targetScore: account.targetScore,
      uiTheme: account.uiTheme,
      permissionRewards: account.permissions.rewardManager,
      permissionAuthoring: account.permissions.questionContributor,
      weeklyTarget: account.studyPlan.weeklyTarget,
      nextSessionLocal: account.studyPlan.nextSessionAt ? account.studyPlan.nextSessionAt.slice(0, 16) : "",
    };
  }

  function setAccountStatus(account: SatAccount): void {
    if (!accountState) return;
    const nextStatus = account.status === "active" ? "suspended" : "active";
    persistAccountResult(changeLocalAccountStatus(accountState, account.id, nextStatus, "content-admin"));
  }

  function removeAccount(account: SatAccount): void {
    if (!accountState) return;
    if (!window.confirm(`Delete ${account.name || account.id}? This removes the local account and profile from this browser.`)) return;
    persistAccountResult(deleteLocalAccount(accountState, account.id, "content-admin"));
    if (editingAccountId === account.id) resetAccountForm();
  }

  function submitRewardProgram(event: SubmitEvent): void {
    event.preventDefault();
    if (!rewardState) return;
    const result = createRewardProgram(
      rewardState,
      {
        title: rewardForm.title,
        description: rewardForm.description,
        costPoints: rewardForm.costPoints,
        rewardType: rewardForm.rewardType,
        scope: rewardForm.scope,
        status: rewardForm.status,
        targetStudentIds: rewardForm.targetStudentId ? [rewardForm.targetStudentId] : [],
      },
      "content-admin",
    );
    persistRewardResult(result);
    if (result.ok) rewardForm = blankRewardForm();
  }

  function toggleRewardProgram(programId: string, status: RewardProgramStatus): void {
    if (!rewardState) return;
    persistRewardResult(setRewardProgramStatus(rewardState, programId, status, "content-admin"));
  }

  function removeRewardProgram(programId: string, title: string): void {
    if (!rewardState) return;
    if (!window.confirm(`Delete reward program "${title}"?`)) return;
    persistRewardResult(deleteLocalRewardProgram(rewardState, programId, "content-admin"));
  }

  function resolveClaim(claimId: string, action: "fulfill" | "cancel"): void {
    if (!rewardState) return;
    persistRewardResult(resolveRewardClaim(rewardState, claimId, action, "content-admin"));
  }

  function persistAnnouncementState(state: AnnouncementState): void {
    announcementState = saveAnnouncementState(state);
  }

  function submitAnnouncement(event: SubmitEvent): void {
    event.preventDefault();
    const result = createAnnouncementPost(announcementState, announcementForm);
    announcementMessage = result.reason;
    if (!result.ok) return;
    persistAnnouncementState(result.state);
    announcementForm = blankAnnouncementForm();
  }

  function toggleAnnouncementStatus(postId: string, status: AnnouncementStatus): void {
    persistAnnouncementState(setAnnouncementStatus(announcementState, postId, status));
    announcementMessage = status === "published" ? "Announcement published." : "Announcement moved to draft.";
  }

  function removeAnnouncement(postId: string): void {
    persistAnnouncementState(deleteAnnouncementPost(announcementState, postId));
    announcementMessage = "Announcement removed.";
  }

  function formatDateTime(value: string): string {
    if (!value) return "none";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  async function checkBackendHealth(): Promise<void> {
    backendBusy = "health";
    try {
      const health = await backendHealth({ baseUrl: backendBaseUrl });
      backendMessage = "Backend health check passed.";
      persistBackendPatch(backendStatusPatch("ok", "Backend reachable", `${health.service || "SAT Studio backend"} is responding.`, { lastHealth: health }));
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Backend health check failed.";
      persistBackendPatch(backendStatusPatch("error", "Backend unreachable", backendMessage));
    } finally {
      backendBusy = "";
    }
  }

  async function bootstrapBackend(): Promise<void> {
    if (!backendUsername || !backendPassword) {
      backendMessage = "Enter backend username and password first.";
      return;
    }
    backendBusy = "bootstrap";
    try {
      const result = await bootstrapBackendAdmin(
        { username: backendUsername, password: backendPassword, displayName: accountModel?.manager.name || backendUsername },
        { baseUrl: backendBaseUrl },
      );
      backendPassword = "";
      backendMessage = "Backend admin bootstrap completed.";
      persistBackendPatch(
        backendStatusPatch("ok", "Backend admin created", `Created ${(result.account as { username?: string } | undefined)?.username || backendUsername}. You can now login.`, {
          account: result.account,
        }),
      );
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Backend bootstrap failed.";
      persistBackendPatch(backendStatusPatch("error", "Bootstrap failed", backendMessage));
    } finally {
      backendBusy = "";
    }
  }

  async function loginToBackend(): Promise<void> {
    if (!backendUsername || !backendPassword) {
      backendMessage = "Enter backend username and password first.";
      return;
    }
    backendBusy = "login";
    try {
      const result = await loginBackend({ username: backendUsername, password: backendPassword }, { baseUrl: backendBaseUrl });
      backendPassword = "";
      backendMessage = "Backend session active.";
      persistBackendPatch(
        backendStatusPatch("ok", "Backend session active", `Logged in as ${(result.account as { username?: string } | undefined)?.username || backendUsername}.`, {
          account: result.account,
          sessionExpiresAt: Number(result.expiresAt || 0),
        }),
        result.cookieAuth ? PUBLIC_BACKEND_COOKIE_SESSION : String(result.token || PUBLIC_BACKEND_COOKIE_SESSION),
      );
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Backend login failed.";
      persistBackendPatch(backendStatusPatch("error", "Backend login failed", backendMessage, { account: null, sessionExpiresAt: 0 }), "");
    } finally {
      backendBusy = "";
    }
  }

  async function refreshBackend(): Promise<void> {
    const token = getBackendToken();
    if (!token) {
      backendMessage = "Login before refreshing the backend session.";
      return;
    }
    backendBusy = "refresh";
    try {
      const result = await refreshBackendSession(token, { baseUrl: backendBaseUrl });
      backendMessage = "Backend session refreshed.";
      persistBackendPatch(
        backendStatusPatch("ok", "Backend session refreshed", `Session rotated for ${(result.account as { username?: string } | undefined)?.username || "backend account"}.`, {
          account: result.account || backendState?.account,
          sessionExpiresAt: Number(result.expiresAt || 0),
        }),
        result.cookieAuth ? PUBLIC_BACKEND_COOKIE_SESSION : String(result.token || PUBLIC_BACKEND_COOKIE_SESSION),
      );
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Session refresh failed.";
      persistBackendPatch(backendStatusPatch("error", "Session refresh failed", backendMessage, { account: null, sessionExpiresAt: 0 }), "");
    } finally {
      backendBusy = "";
    }
  }

  async function loadBackendMonitoring(): Promise<void> {
    const token = getBackendToken();
    if (!token) {
      backendMessage = "Login as backend admin before monitoring.";
      return;
    }
    backendBusy = "monitoring";
    try {
      const monitoring = await backendMonitoring(token, { baseUrl: backendBaseUrl });
      backendMessage = "Backend monitoring loaded.";
      const counts = (monitoring.counts || {}) as { accounts?: number; openQuestionAudits?: number };
      persistBackendPatch(
        backendStatusPatch("ok", "Backend monitoring checked", `${counts.accounts || 0} accounts, ${counts.openQuestionAudits || 0} open audits.`, {
          lastMonitoring: monitoring,
        }),
      );
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Backend monitoring failed.";
      persistBackendPatch(backendStatusPatch("error", "Backend monitoring failed", backendMessage));
    } finally {
      backendBusy = "";
    }
  }

  async function exportBackend(): Promise<void> {
    const token = getBackendToken();
    if (!token) {
      backendMessage = "Login as backend admin before exporting.";
      return;
    }
    backendBusy = "export";
    try {
      const snapshot = await exportBackendSnapshot(token, { baseUrl: backendBaseUrl });
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sat-studio-public-backend-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      backendMessage = "Backend snapshot exported.";
      persistBackendPatch(backendStatusPatch("ok", "Server snapshot exported", "Backend export downloaded.", { lastExportAt: new Date().toISOString() }));
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Backend export failed.";
      persistBackendPatch(backendStatusPatch("error", "Server export failed", backendMessage));
    } finally {
      backendBusy = "";
    }
  }

  function backendProfileClearPatch(): Partial<PublicBackendState> {
    return {
      pendingServerProfileAt: "",
      pendingServerProfileRevision: 0,
      pendingServerProfileLoadedFor: "",
      pendingServerProfileLocalAccountId: "",
      pendingServerProfileSummary: null,
      pendingServerProfileDiff: null,
    };
  }

  function errorPayload(error: unknown): Record<string, unknown> {
    if (error && typeof error === "object" && "payload" in error && typeof (error as { payload?: unknown }).payload === "object") {
      return ((error as { payload?: Record<string, unknown> }).payload || {}) as Record<string, unknown>;
    }
    return {};
  }

  function profileDiffRows(diff: ProfileDiffSummary | null): Array<{ label: string; local: number; server: number; changed: boolean }> {
    if (!diff) return [];
    return (Object.keys(diff.local) as Array<keyof ProfileDiffSummary["local"]>).map((key) => ({
      label: key,
      local: diff.local[key],
      server: diff.server[key],
      changed: diff.local[key] !== diff.server[key],
    }));
  }

  async function syncBackendProfile(): Promise<void> {
    const token = getBackendToken();
    if (!token || !backendState?.account || !accountState || !selectedProfileAccount) {
      backendMessage = "Login and choose a local learner before syncing the full profile.";
      return;
    }
    backendBusy = "profile-sync";
    const localProfile = accountState.profiles[selectedProfileAccount.id];
    try {
      const snapshot = buildFullProfileSnapshot(localProfile, selectedProfileAccount);
      const saved = await saveBackendProfile(token, backendState.account.id, snapshot, {
        baseUrl: backendBaseUrl,
        baseServerRevision: backendState.lastServerProfileRevision || undefined,
        clientRevision: Date.now(),
        mergeStrategy: "reject_conflict",
      });
      const record = normalizeBackendProfileRecord(saved);
      pendingProfileRecord = null;
      backendMessage = "Full profile synced.";
      persistBackendPatch(
        backendStatusPatch("ok", "Full profile synced", `Saved server profile revision ${record.serverRevision || 0} for ${selectedProfileAccount.name}.`, {
          lastProfileSyncAt: record.updatedAt || new Date().toISOString(),
          lastServerProfileAt: record.updatedAt || "",
          lastServerProfileRevision: record.serverRevision,
          lastServerProfileSummary: serverProfileSummary(record),
          lastLearningSyncAt: record.updatedAt || new Date().toISOString(),
          lastLearningSyncReason: "manual_profile_sync",
          lastLearningSyncMode: "backend",
          ...backendProfileClearPatch(),
        }),
      );
    } catch (error) {
      const payload = errorPayload(error);
      if (payload.serverProfile || payload.profile) {
        pendingProfileRecord = normalizeBackendProfileRecord({ ...payload, profile: payload.serverProfile || payload.profile });
        backendMessage = "Profile conflict detected. Review the server profile before applying or syncing again.";
        persistBackendPatch(
          backendStatusPatch("warning", "Profile conflict detected", backendMessage, {
            lastServerProfileAt: pendingProfileRecord.updatedAt || "",
            lastServerProfileRevision: pendingProfileRecord.serverRevision,
            lastServerProfileSummary: serverProfileSummary(pendingProfileRecord),
            lastLearningSyncAt: new Date().toISOString(),
            lastLearningSyncReason: "profile_conflict",
            lastLearningSyncMode: "local",
            pendingServerProfileAt: pendingProfileRecord.updatedAt || new Date().toISOString(),
            pendingServerProfileRevision: pendingProfileRecord.serverRevision,
            pendingServerProfileLoadedFor: backendState.account.id,
            pendingServerProfileLocalAccountId: selectedProfileAccount.id,
            pendingServerProfileSummary: serverProfileSummary(pendingProfileRecord),
            pendingServerProfileDiff: buildProfileDiffSummary(pendingProfileRecord, localProfile),
          }),
        );
      } else {
        backendMessage = error instanceof Error ? error.message : "Full profile sync failed.";
        persistBackendPatch(backendStatusPatch("error", "Full profile sync failed", backendMessage));
      }
    } finally {
      backendBusy = "";
    }
  }

  async function loadBackendProfileForReview(): Promise<void> {
    const token = getBackendToken();
    if (!token || !backendState?.account || !accountState || !selectedProfileAccount) {
      backendMessage = "Login and choose a local learner before loading a server profile.";
      return;
    }
    backendBusy = "profile-load";
    try {
      const loaded = await getBackendProfile(token, backendState.account.id, { baseUrl: backendBaseUrl });
      pendingProfileRecord = normalizeBackendProfileRecord(loaded);
      backendMessage = "Server profile loaded for review. Local profile was not overwritten.";
      persistBackendPatch(
        backendStatusPatch("ok", "Server profile loaded", `Server revision ${pendingProfileRecord.serverRevision || 0} is ready for review.`, {
          lastServerProfileAt: pendingProfileRecord.updatedAt || new Date().toISOString(),
          lastServerProfileRevision: pendingProfileRecord.serverRevision,
          lastServerProfileSummary: serverProfileSummary(pendingProfileRecord),
          pendingServerProfileAt: pendingProfileRecord.updatedAt || new Date().toISOString(),
          pendingServerProfileRevision: pendingProfileRecord.serverRevision,
          pendingServerProfileLoadedFor: backendState.account.id,
          pendingServerProfileLocalAccountId: selectedProfileAccount.id,
          pendingServerProfileSummary: serverProfileSummary(pendingProfileRecord),
          pendingServerProfileDiff: buildProfileDiffSummary(pendingProfileRecord, accountState.profiles[selectedProfileAccount.id]),
        }),
      );
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Server profile load failed.";
      persistBackendPatch(backendStatusPatch("error", "Server profile load failed", backendMessage));
    } finally {
      backendBusy = "";
    }
  }

  function applyLoadedBackendProfile(): void {
    if (!accountState || !backendState?.account || !selectedProfileAccount || !pendingProfileRecord) {
      backendMessage = "Load a server profile first, then review the comparison before applying it.";
      return;
    }
    const ok = window.confirm(`Apply server profile revision ${pendingProfileRecord.serverRevision || 0} to ${selectedProfileAccount.name}? This replaces that local learner profile.`);
    if (!ok) return;
    try {
      const applied = applyServerProfileToAccountState(accountState, selectedProfileAccount.id, pendingProfileRecord);
      pendingProfileRecord = null;
      backendMessage = "Server profile applied to local learner.";
      persistBackendPatch(
        backendStatusPatch("ok", "Server profile applied", `Applied server profile to ${selectedProfileAccount.name}.`, {
          lastServerProfileAt: new Date().toISOString(),
          lastServerProfileRevision: backendState.lastServerProfileRevision,
          ...backendProfileClearPatch(),
        }),
        undefined,
        applied,
      );
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Could not apply server profile.";
    }
  }

  function openExpertGateFromSelected(): void {
    if (!selected) {
      expertMessage = "Select a review queue item first.";
      activeTab = "expert";
      return;
    }
    expertDraft = questionToExpertReviewDraft(selected.question);
    expertNote = "";
    expertStatus = selected.gate.ok ? "public_ready" : "expert_reviewed";
    expertMessage = `Loaded ${selected.question.id} into the expert gate.`;
    expertBackendHistory = [];
    activeTab = "expert";
  }

  function ensureExpertDraft(): boolean {
    if (!expertDraft && expertQuestion) {
      expertDraft = questionToExpertReviewDraft(expertQuestion);
    }
    return Boolean(expertDraft && expertQuestion);
  }

  function saveLocalExpertVersion(status: ExpertReviewStatus = expertStatus): ExpertReviewVersion | null {
    if (!ensureExpertDraft() || !expertQuestion || !expertDraft) {
      expertMessage = "Select a question before saving an expert version.";
      return null;
    }
    const next = addExpertReviewVersion(expertWorkspace, expertQuestion, expertDraft, {
      actor: backendState?.account?.username || "content-admin",
      note: expertNote,
      status,
    });
    expertWorkspace = saveExpertReviewWorkspace(next);
    const version = next.versions[0];
    expertMessage = `Saved local expert version ${version.versionNumber} for ${version.questionId}.`;
    return version;
  }

  function markExpertReviewed(): void {
    if (!ensureExpertDraft() || !expertDraft) return;
    expertDraft.reviewStatus = "reviewed";
    expertDraft.visibility = expertDraft.visibility === "public_candidate" ? expertDraft.visibility : "public_candidate";
    expertDraft.publicationStatus = "public_candidate_reviewed";
    expertStatus = "expert_reviewed";
    saveLocalExpertVersion("expert_reviewed");
  }

  function exportExpertPatch(): void {
    if (!ensureExpertDraft() || !expertQuestion || !expertDraft) return;
    const preview = addExpertReviewVersion(expertWorkspace, expertQuestion, expertDraft, {
      actor: backendState?.account?.username || "content-admin",
      note: expertNote,
      status: expertStatus,
    }).versions[0];
    const payload = expertReviewBackendPayload(preview, expertQuestion);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${preview.questionId}-expert-review-v${preview.versionNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
    expertMessage = "Exported expert patch JSON for external audit or scripted apply.";
  }

  async function loadBackendExpertHistory(): Promise<void> {
    const token = getBackendToken();
    if (!token || !expertQuestion) {
      expertMessage = "Login as backend admin and select a question before loading backend history.";
      return;
    }
    expertBusy = "history";
    try {
      const result = await listBackendQuestionReviews(token, expertQuestion.id, { baseUrl: backendBaseUrl, limit: 10 });
      expertBackendHistory = Array.isArray(result.items) ? (result.items as Array<Record<string, unknown>>) : [];
      expertMessage = `Loaded ${expertBackendHistory.length} backend review version(s).`;
    } catch (error) {
      expertMessage = error instanceof Error ? error.message : "Could not load backend expert history.";
    } finally {
      expertBusy = "";
    }
  }

  async function submitExpertVersionToBackend(): Promise<void> {
    const token = getBackendToken();
    if (!token || !backendModel?.loggedIn) {
      expertMessage = "Login as backend admin before submitting an expert review version.";
      return;
    }
    if (!ensureExpertDraft() || !expertQuestion || !expertDraft) return;
    const version = saveLocalExpertVersion(expertStatus);
    if (!version) return;
    expertBusy = "submit";
    try {
      const result = await saveBackendQuestionReview(token, expertReviewBackendPayload(version, expertQuestion), { baseUrl: backendBaseUrl });
      const history = (result.history as { items?: Array<Record<string, unknown>> } | undefined)?.items || [];
      expertBackendHistory = history;
      expertMessage = `Submitted backend expert version ${(result.version as { versionNumber?: number } | undefined)?.versionNumber || version.versionNumber}.`;
      persistBackendPatch(
        backendStatusPatch("ok", "Expert review saved", `Question ${version.questionId} has a backend review ledger entry.`, {
          lastExpertReviewAt: new Date().toISOString(),
          lastExpertReviewQuestionId: version.questionId,
        }),
      );
    } catch (error) {
      expertMessage = error instanceof Error ? error.message : "Backend expert review submit failed.";
    } finally {
      expertBusy = "";
    }
  }

  async function logoutFromBackend(): Promise<void> {
    const token = getBackendToken();
    backendBusy = "logout";
    try {
      if (token) await logoutBackend(token, { baseUrl: backendBaseUrl });
    } catch {
      // Clear the browser token even if the server-side session already expired.
    } finally {
      backendMessage = "Backend session cleared.";
      pendingProfileRecord = null;
      persistBackendPatch(backendStatusPatch("warning", "Backend session cleared", "Backend session was revoked or cleared from this browser tab.", { account: null, sessionExpiresAt: 0 }), "");
      backendBusy = "";
    }
  }
</script>

<main class="admin-app">
  <header class="admin-topbar">
    <div>
      <p class="eyebrow">SAT Studio</p>
      <h1>Content Review</h1>
    </div>
  </header>

  {#if loading}
    <section class="state-panel">Loading internal bank...</section>
  {:else if loadError}
    <section class="state-panel error">{loadError}</section>
  {:else if model && operations}
    <section class="admin-metrics" aria-label="Content review summary">
      <article>
        <span>{model.summary.total}</span>
        <small>Total items</small>
      </article>
      <article>
        <span>{model.summary.reviewed}</span>
        <small>Reviewed</small>
      </article>
      <article>
        <span>{model.summary.needsReview}</span>
        <small>Needs review</small>
      </article>
      <article>
        <span>{model.summary.readyForPublic}</span>
        <small>Public ready</small>
      </article>
      <article>
        <span>{model.summary.qualityWarnings}</span>
        <small>Quality warnings</small>
      </article>
    </section>

    <nav class="admin-tabs" aria-label="Admin content sections">
      <button class:active={activeTab === "review"} type="button" on:click={() => (activeTab = "review")}>Review queue</button>
      <button class:active={activeTab === "expert"} type="button" on:click={() => { activeTab = "expert"; ensureExpertDraft(); }}>Expert gate</button>
      <button class:active={activeTab === "release"} type="button" on:click={() => (activeTab = "release")}>Release gate</button>
      <button class:active={activeTab === "readiness"} type="button" on:click={() => (activeTab = "readiness")}>SAT readiness</button>
      <button class:active={activeTab === "sources"} type="button" on:click={() => (activeTab = "sources")}>Source governance</button>
      <button class:active={activeTab === "authoring"} type="button" on:click={() => (activeTab = "authoring")}>Authoring checks</button>
      <button class:active={activeTab === "accounts"} type="button" on:click={() => (activeTab = "accounts")}>Accounts</button>
      <button class:active={activeTab === "rewards"} type="button" on:click={() => (activeTab = "rewards")}>Rewards</button>
      <button class:active={activeTab === "news"} type="button" on:click={() => (activeTab = "news")}>News</button>
      <button class:active={activeTab === "backend"} type="button" on:click={() => (activeTab = "backend")}>Backend sync</button>
    </nav>

    {#if activeTab === "review"}
      <section class="admin-grid">
      <aside class="admin-panel queue-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Action queue</p>
            <h2>{filteredQueue.length}/{model.summary.actionQueueTotal} items</h2>
          </div>
        </div>

        <div class="filters" aria-label="Queue filters">
          <button class:active={activeKind === "all"} type="button" on:click={() => setKind("all")}>All</button>
          <button class:active={activeKind === "needs_review"} type="button" on:click={() => setKind("needs_review")}>Needs review {kindCount("needs_review")}</button>
          <button class:active={activeKind === "quality_warning"} type="button" on:click={() => setKind("quality_warning")}>Warnings {kindCount("quality_warning")}</button>
          <button class:active={activeKind === "public_candidate"} type="button" on:click={() => setKind("public_candidate")}>Promote {kindCount("public_candidate")}</button>
          <button class:active={activeKind === "blocked"} type="button" on:click={() => setKind("blocked")}>Blocked {kindCount("blocked")}</button>
        </div>

        <label class="search-box">
          Search
          <input bind:value={search} placeholder="ID, source, skill, prompt" />
        </label>

        <div class="queue-list">
          {#each filteredQueue.slice(0, 60) as item}
            <button class:active={selected?.id === item.id} class="queue-row" type="button" on:click={() => (selectedId = item.id)}>
              <span>{item.priority}</span>
              <strong>{item.question.skill}</strong>
              <small>{item.question.section} / {item.question.domain}</small>
              <em>{gateLabel(item)}</em>
            </button>
          {/each}
          {#if filteredQueue.length === 0}
            <div class="empty">No queue items match this filter.</div>
          {/if}
        </div>
      </aside>

      <section class="admin-panel detail-panel">
        {#if selected}
          <div class="question-meta">
            <span>{selected.kind}</span>
            <span>{selected.question.sourceType}</span>
            <span>{selected.question.difficulty}</span>
            <span>{selected.qualityScore}/100</span>
          </div>
          <div class="backend-actions compact-actions">
            <button type="button" on:click={openExpertGateFromSelected}>Open in expert gate</button>
          </div>
          <h2>{selected.question.skill}</h2>
          <p class="muted">{selected.detail}</p>
          <p class="prompt">{selected.question.prompt}</p>

          <section class="answer-review">
            <div class="answer-head">
              <div>
                <p class="eyebrow">Answer review</p>
                <h3>{correctAnswerText(selected.question) || "No answer"}</h3>
              </div>
              <small>{selected.question.questionType || selected.question.type || "multiple_choice"}</small>
            </div>
            {#if choiceViews(selected.question).length}
              <div class="choice-list">
                {#each choiceViews(selected.question) as choice}
                  <article class:correct-choice={choice.correct}>
                    <strong>{choice.letter}</strong>
                    <p>{choice.text}</p>
                  </article>
                {/each}
              </div>
            {/if}
          </section>

          <div class="gate-grid">
            <article>
              <strong>Public gate</strong>
              <span class:pass={selected.gate.ok} class:fail={!selected.gate.ok}>{selected.gate.ok ? "Pass" : "Blocked"}</span>
              <p>{selected.gate.reason}</p>
            </article>
            <article>
              <strong>Review status</strong>
              <span>{selected.question.reviewStatus || "needs_review"}</span>
              <p>{selected.question.publicationStatus || "No publication status"}</p>
            </article>
          </div>

          {#if selected.gate.blockers.length}
            <section class="issue-list danger">
              <strong>Blockers</strong>
              {#each selected.gate.blockers as blocker}
                <span>{blocker}</span>
              {/each}
            </section>
          {/if}

          {#if selected.gate.warnings.length}
            <section class="issue-list warn">
              <strong>Warnings</strong>
              {#each selected.gate.warnings as warning}
                <span>{warning}</span>
              {/each}
            </section>
          {/if}

          <section class="admin-subgrid">
            <div class="review-block">
              <p class="eyebrow">Explanation coaching</p>
              {#if explanationViews(selected.question).length}
                {#each explanationViews(selected.question) as row}
                  <article class:correct-explanation={row.kind === "correct"} class:trap-explanation={row.kind === "distractor"}>
                    <strong>{row.label}</strong>
                    <p>{row.text}</p>
                  </article>
                {/each}
              {:else}
                <div class="empty">No explanation text available.</div>
              {/if}
            </div>

            <div class="review-block">
              <p class="eyebrow">Source and routing</p>
              <div class="fact-list">
                {#each sourceFacts(selected.question) as fact}
                  <article>
                    <small>{fact.label}</small>
                    <strong>{fact.value}</strong>
                  </article>
                {/each}
              </div>
            </div>
          </section>
        {:else}
          <div class="empty">No item selected.</div>
        {/if}
      </section>

      <section class="admin-panel distribution-panel">
        <div>
          <p class="eyebrow">Source distribution</p>
          <h2>Top sources</h2>
        </div>
        <div class="bar-list">
          {#each model.topSources as row}
            <article>
              <span style={`width:${percentWidth(row.count, model.summary.total)}%`}></span>
              <strong>{row.sourceType}</strong>
              <em>{row.count}</em>
            </article>
          {/each}
        </div>
      </section>

      <section class="admin-panel distribution-panel">
        <div>
          <p class="eyebrow">Domain distribution</p>
          <h2>Top domains</h2>
        </div>
        <div class="domain-list">
          {#each model.topDomains as row}
            <article>
              <strong>{row.domain}</strong>
              <small>{row.section}</small>
              <span>{row.count}</span>
            </article>
          {/each}
        </div>
      </section>
      </section>
    {:else if activeTab === "expert"}
      <section class="expert-gate-grid">
        <section class="admin-panel expert-editor-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Expert Gate Web UI</p>
              <h2>{expertQuestion ? expertQuestion.id : "No question selected"}</h2>
              <p class="muted">Edit the question, answer key, explanation, metadata, trap notes, and copyright attestation before saving a version.</p>
            </div>
            <button type="button" on:click={openExpertGateFromSelected}>Load selected</button>
          </div>
          {#if expertMessage}
            <div class="account-message">{expertMessage}</div>
          {/if}
          {#if expertQuestion && expertDraft}
            <div class="expert-form-grid">
              <label class="full-row">
                Prompt
                <textarea bind:value={expertDraft.prompt} rows="8"></textarea>
              </label>
              <label>
                Choice A
                <textarea bind:value={expertDraft.choiceA}></textarea>
              </label>
              <label>
                Choice B
                <textarea bind:value={expertDraft.choiceB}></textarea>
              </label>
              <label>
                Choice C
                <textarea bind:value={expertDraft.choiceC}></textarea>
              </label>
              <label>
                Choice D
                <textarea bind:value={expertDraft.choiceD}></textarea>
              </label>
              <label>
                Correct answer
                <select bind:value={expertDraft.correctAnswer}>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </label>
              <label>
                Question type
                <select bind:value={expertDraft.questionType}>
                  <option value="multiple_choice">multiple_choice</option>
                  <option value="student_produced_response">student_produced_response</option>
                </select>
              </label>
              <label>
                Review status
                <select bind:value={expertDraft.reviewStatus}>
                  <option value="needs_review">needs_review</option>
                  <option value="reviewed">reviewed</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
              <label>
                Visibility
                <select bind:value={expertDraft.visibility}>
                  <option value="private_family">private_family</option>
                  <option value="public_candidate">public_candidate</option>
                  <option value="admin_only">admin_only</option>
                </select>
              </label>
              <label class="full-row">
                Correct explanation
                <textarea bind:value={expertDraft.explanationCorrect} rows="5"></textarea>
              </label>
              <label>
                Trap A
                <textarea bind:value={expertDraft.explanationA}></textarea>
              </label>
              <label>
                Trap B
                <textarea bind:value={expertDraft.explanationB}></textarea>
              </label>
              <label>
                Trap C
                <textarea bind:value={expertDraft.explanationC}></textarea>
              </label>
              <label>
                Trap D
                <textarea bind:value={expertDraft.explanationD}></textarea>
              </label>
              <label>
                Section
                <input bind:value={expertDraft.section} />
              </label>
              <label>
                Domain
                <input bind:value={expertDraft.domain} />
              </label>
              <label>
                Skill
                <input bind:value={expertDraft.skill} />
              </label>
              <label>
                Difficulty
                <select bind:value={expertDraft.difficulty}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </label>
              <label>
                Source type
                <input bind:value={expertDraft.sourceType} />
              </label>
              <label>
                Publication status
                <input bind:value={expertDraft.publicationStatus} />
              </label>
              <label class="full-row">
                Trap / distractor note
                <textarea bind:value={expertDraft.trapNote}></textarea>
              </label>
              <label class="full-row">
                Copyright / originality attestation
                <textarea bind:value={expertDraft.copyrightNote}></textarea>
              </label>
              <label class="full-row">
                Version note
                <textarea bind:value={expertNote} placeholder="What changed, why it is academically/copyright safe, and what should happen next."></textarea>
              </label>
            </div>
            <div class="backend-actions">
              <select bind:value={expertStatus}>
                <option value="draft">draft</option>
                <option value="needs_review">needs_review</option>
                <option value="expert_reviewed">expert_reviewed</option>
                <option value="public_ready">public_ready</option>
                <option value="rejected">rejected</option>
              </select>
              <button type="button" on:click={() => saveLocalExpertVersion(expertStatus)}>Save local version</button>
              <button type="button" on:click={markExpertReviewed}>Mark expert reviewed</button>
              <button type="button" on:click={exportExpertPatch}>Export patch JSON</button>
              <button disabled={Boolean(expertBusy)} type="button" on:click={loadBackendExpertHistory}>Load backend history</button>
              <button disabled={Boolean(expertBusy)} type="button" on:click={submitExpertVersionToBackend}>Submit backend ledger</button>
            </div>
          {:else}
            <div class="empty">Choose an item in Review queue, then open it in Expert gate.</div>
          {/if}
        </section>

        <section class="admin-panel">
          <p class="eyebrow">Validation</p>
          <h2>{expertValidation?.ok ? "Draft passes required checks" : "Draft needs correction"}</h2>
          {#if expertValidation}
            <div class="gate-grid compact">
              <article><strong>Changed fields</strong><span>{expertValidation.changedFields.length}</span><p>{expertValidation.changedFields.slice(0, 8).join(", ") || "No changes yet"}</p></article>
              <article><strong>Blockers</strong><span class:pass={expertValidation.blockers.length === 0} class:fail={expertValidation.blockers.length > 0}>{expertValidation.blockers.length}</span><p>{expertValidation.blockers.join(", ") || "None"}</p></article>
              <article><strong>Warnings</strong><span>{expertValidation.warnings.length}</span><p>{expertValidation.warnings.join(", ") || "None"}</p></article>
              <article><strong>Public gate</strong><span>{expertDraft?.visibility || "none"}</span><p>{selected ? gateLabel(selected) : "No selected queue gate"}</p></article>
            </div>
          {/if}
          <div class="workflow-rail">
            <article class="done"><strong>SourceSignal</strong><span>Provenance is stored as metadata only.</span></article>
            <article class="done"><strong>AI draft</strong><span>Draft must pass structural and safety validation.</span></article>
            <article class={expertValidation?.ok ? "done" : "pending"}><strong>Expert review</strong><span>Answer, explanation, trap, and copyright checks are versioned here.</span></article>
            <article class={expertDraft?.visibility === "public_candidate" && expertValidation?.ok ? "done" : "pending"}><strong>Public package</strong><span>Only reviewed public candidates can flow to learner packages.</span></article>
          </div>
        </section>

        <section class="admin-panel">
          <p class="eyebrow">Local version history</p>
          <h2>{expertLocalVersions.length} saved version(s)</h2>
          <div class="version-list">
            {#each expertLocalVersions as version}
              <article>
                <strong>v{version.versionNumber} · {version.status}</strong>
                <small>{version.createdAt} · {version.actor}</small>
                <p>{version.note || "No note"}</p>
                <span>{version.changedFields.join(", ") || "no changes"}</span>
              </article>
            {/each}
            {#if expertLocalVersions.length === 0}
              <div class="empty">No local expert versions saved for this question.</div>
            {/if}
          </div>
        </section>

        <section class="admin-panel">
          <p class="eyebrow">Backend review ledger</p>
          <h2>{expertBackendHistory.length} backend version(s)</h2>
          <div class="version-list">
            {#each expertBackendHistory as row}
              <article>
                <strong>v{row.versionNumber || "?"} · {row.status || "draft"}</strong>
                <small>{row.createdAt || "not synced"} · {row.createdByAccountId || "backend"}</small>
                <p>{row.note || "No note"}</p>
                <span>{row.id || row.localVersionId || ""}</span>
              </article>
            {/each}
            {#if expertBackendHistory.length === 0}
              <div class="empty">Login to backend sync, then submit or load question review history.</div>
            {/if}
          </div>
        </section>
      </section>
    {:else if activeTab === "release"}
      <section class="admin-two-column">
        <section class="admin-panel">
          <p class="eyebrow">Public release gate</p>
          <h2>{operations.release.ready ? "Release package clean" : "Release package blocked"}</h2>
          <div class="release-status" class:pass={operations.release.ready} class:fail={!operations.release.ready}>
            <strong>{operations.release.publicItemCount}</strong>
            <span>learner-safe public items</span>
          </div>
          <div class="fact-list">
            <article><small>Contract</small><strong>{operations.release.contractVersion || "missing"}</strong></article>
            <article><small>Content version</small><strong>{operations.release.contentVersion || "missing"}</strong></article>
            <article><small>Generated at</small><strong>{operations.release.generatedAt || "missing"}</strong></article>
            <article><small>Manifest total</small><strong>{operations.release.manifestTotal}</strong></article>
            <article><small>Internal field hits</small><strong>{operations.release.internalFieldHits}</strong></article>
          </div>
          {#if operations.release.blockers.length}
            <section class="issue-list danger">
              <strong>Release blockers</strong>
              {#each operations.release.blockers as blocker}
                <span>{blocker}</span>
              {/each}
            </section>
          {/if}
        </section>

        <section class="admin-panel">
          <p class="eyebrow">Integrity gate</p>
          <h2>{operations.integrity.criticalQuestionCount} critical questions</h2>
          <div class="gate-grid compact">
            <article><strong>Critical issues</strong><span>{operations.integrity.criticalIssueCount}</span><p>Must be zero before release.</p></article>
            <article><strong>Warnings</strong><span>{operations.integrity.warningQuestionCount}</span><p>Suppressed from default study when needed.</p></article>
            <article><strong>Repeated topics</strong><span>{operations.integrity.overrepresentedTopicCount}</span><p>Topic governance overflow.</p></article>
            <article><strong>Suppressed rows</strong><span>{operations.integrity.suppressedDefaultStudyCount}</span><p>Kept out of default learner flow.</p></article>
          </div>
          {#if operations.integrity.warningTypes.length}
            <section class="issue-list warn">
              <strong>Warning types</strong>
              {#each operations.integrity.warningTypes as warning}
                <span>{warning.type}: {warning.count}</span>
              {/each}
            </section>
          {/if}
        </section>
      </section>
    {:else if activeTab === "readiness"}
      <section class="admin-two-column wide-left">
        <section class="admin-panel">
          <p class="eyebrow">SAT readiness</p>
          <h2>Blueprint balance</h2>
          <div class="admin-metrics compact-metrics">
            <article><span>{operations.readiness.coreReadyReviewed}</span><small>Core-ready reviewed</small></article>
            <article><span>{operations.readiness.publicCandidateReadyReviewed}</span><small>Public candidates</small></article>
            <article><span>{operations.readiness.strict1600HardNonBlocked}</span><small>Strict 1600 hard</small></article>
            <article><span>{operations.readiness.mathGridInPct}%</span><small>Math grid-in</small></article>
            <article><span>{operations.readiness.hardMathMultiStepPct}%</span><small>Hard Math multi-step</small></article>
          </div>
          <div class="readiness-table">
            {#each operations.readiness.domainRows as row}
              <article>
                <strong>{row.domain}</strong>
                <small>{row.section}</small>
                <span>{row.count}</span>
                <span>{row.actualPct}% / {row.officialPct}%</span>
                <em class:warn={Math.abs(row.deltaPctPoints) >= 3}>{row.deltaPctPoints > 0 ? "+" : ""}{row.deltaPctPoints} pp</em>
              </article>
            {/each}
          </div>
        </section>

        <section class="admin-panel">
          <p class="eyebrow">Readiness interpretation</p>
          <h2>Routing implication</h2>
          <p class="muted">Near-target domains can stay in normal routing. Any row outside tolerance should become an authoring or promotion target before adding more broad content.</p>
          <div class="issue-list warn">
            <strong>Current editorial watch</strong>
            {#each operations.integrity.rwLongPromptIds.slice(0, 8) as id}
              <span>{id}</span>
            {/each}
          </div>
        </section>
      </section>
    {:else if activeTab === "sources"}
      <section class="admin-panel">
        <p class="eyebrow">Source governance</p>
        <h2>Unified pool, protected boundaries</h2>
        <div class="source-table">
          {#each operations.sourceGovernance as row}
            <article class:protected-source={row.protectedSource}>
              <strong>{row.sourceType}</strong>
              <span>{row.loaded}</span>
              <span>{row.coreReady}</span>
              <span>{row.publicCandidate}</span>
              <em>{row.protectedSource ? "Protected" : "Eligible"}</em>
              <p>{row.action}</p>
            </article>
          {/each}
        </div>
      </section>
    {:else if activeTab === "authoring"}
      <section class="admin-two-column">
        <section class="admin-panel">
          <p class="eyebrow">Authoring and import checks</p>
          <h2>Pre-save contract</h2>
          <div class="checklist">
            {#each operations.authoringChecklist as item}
              <article class={item.status}>
                <strong>{item.label}</strong>
                <span>{item.status}</span>
                <p>{item.detail}</p>
              </article>
            {/each}
          </div>
        </section>

        <section class="admin-panel">
          <p class="eyebrow">Governed write boundary</p>
          <h2>Guarded write paths</h2>
          <p class="muted">This Vite admin route is suitable for review, inspection, source governance, account operations, and release readiness. Content mutations stay behind explicit guarded workflows until each write path has isolated tests.</p>
          <div class="command-list">
            <code>npm run admin:promote-public -- --id &lt;question_id&gt;</code>
            <code>npm run admin:promote-public -- --apply --id &lt;question_id&gt;</code>
            <code>npm run admin:resolve-audit -- --id &lt;question_id&gt; --action pass</code>
            <code>npm run admin:resolve-audit -- --apply --id &lt;question_id&gt; --action block</code>
            <code>npm run admin:save-question -- --input &lt;drafts.json&gt;</code>
            <code>npm run admin:save-question -- --apply --input &lt;drafts.json&gt;</code>
            <code>npm run admin:save-source-signal -- --input &lt;signals.json&gt;</code>
            <code>npm run admin:save-source-signal -- --apply --input &lt;signals.json&gt;</code>
          </div>
          <div class="issue-list warn">
            <strong>Implemented write path</strong>
            <span>public promotion with explicit target</span>
            <span>audit pass/block/reject with explicit target</span>
            <span>manual authoring/import save through intake gate</span>
            <span>source signal save with protected-text gate</span>
            <span>backup before write</span>
            <span>audit log JSONL</span>
            <span>public artifact regeneration</span>
          </div>
          <div class="issue-list warn">
            <strong>Production hardening reminders</strong>
            <span>HTTPS, env secrets, and CORS allowlist per deployment</span>
            <span>scheduled backend export and restore runbook</span>
          </div>
        </section>
      </section>
    {:else if activeTab === "accounts" && accountModel}
      <section class="account-ops-grid">
        <section class="admin-panel account-form-panel">
          <p class="eyebrow">Local account operations</p>
          <h2>{editingAccountId ? "Edit account" : "Create account"}</h2>
          <p class="muted">These local operations are for family/demo management. Public users should authenticate through the backend sync tab or the student signup flow.</p>
          {#if accountMessage}
            <div class="account-message">{accountMessage}</div>
          {/if}
          <form class="account-form-grid" on:submit={submitAccount}>
            <label>
              Name
              <input bind:value={accountForm.name} required />
            </label>
            <label>
              Passcode
              <input bind:value={accountForm.passcode} required />
            </label>
            <label>
              Email
              <input bind:value={accountForm.email} type="email" />
            </label>
            <label>
              Grade
              <input bind:value={accountForm.gradeLevel} />
            </label>
            <label>
              Role
              <select bind:value={accountForm.role}>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Scope
              <select bind:value={accountForm.scope}>
                <option value="family">Family</option>
                <option value="public">Public learner</option>
              </select>
            </label>
            <label>
              Linked parent
              <select bind:value={accountForm.parentId}>
                <option value="">No linked parent</option>
                {#each accountModel.parentOptions as parent}
                  <option value={parent.id}>{parent.name}</option>
                {/each}
              </select>
            </label>
            <label>
              Target score
              <input bind:value={accountForm.targetScore} min="1000" max="1600" step="10" type="number" />
            </label>
            <label>
              Weekly target
              <input bind:value={accountForm.weeklyTarget} min="1" max="14" type="number" />
            </label>
            <label>
              Next session
              <input bind:value={accountForm.nextSessionLocal} type="datetime-local" />
            </label>
            <label>
              Avatar initials
              <input bind:value={accountForm.avatarInitials} maxlength="2" />
            </label>
            <label>
              Avatar color
              <select bind:value={accountForm.avatarColor}>
                <option value="teal">Teal</option>
                <option value="blue">Blue</option>
                <option value="coral">Coral</option>
                <option value="amber">Amber</option>
                <option value="slate">Slate</option>
              </select>
            </label>
            <label>
              Interface
              <select bind:value={accountForm.uiTheme}>
                <option value="studio">Focus Studio</option>
                <option value="teen_quest">Teen Quest</option>
              </select>
            </label>
            <label class="check-line">
              <input bind:checked={accountForm.permissionRewards} type="checkbox" />
              Reward manager
            </label>
            <label class="check-line">
              <input bind:checked={accountForm.permissionAuthoring} type="checkbox" />
              Question contributor
            </label>
            <div class="form-actions">
              <button type="submit">{editingAccountId ? "Save account" : "Create account"}</button>
              <button type="button" on:click={resetAccountForm}>Reset</button>
            </div>
          </form>
        </section>

        <section class="admin-panel account-list-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Account register</p>
              <h2>{accountModel.total} visible accounts</h2>
            </div>
            <button type="button" on:click={() => refreshAccountModel()}>Reload local state</button>
          </div>
          <div class="admin-metrics compact-metrics">
            <article><span>{accountModel.active}</span><small>Active</small></article>
            <article><span>{accountModel.students}</span><small>Students</small></article>
            <article><span>{accountModel.parents}</span><small>Parents</small></article>
            <article><span>{accountModel.admins}</span><small>Admins</small></article>
            <article><span>{accountModel.locked}</span><small>Locked</small></article>
          </div>
          <div class="account-storage-line">
            <strong>Storage</strong>
            <span>{accountModel.storage.exists ? `${accountModel.storage.approximateBytes} bytes` : "not initialized"}</span>
            <span>{accountModel.storage.chunked ? `${accountModel.storage.chunks} chunks` : "single record"}</span>
          </div>
          <div class="account-table">
            {#each accountModel.accounts as row}
              <article class={`account-row-card status-${row.account.status}`}>
                <div>
                  <strong>{row.account.name}</strong>
                  <span>{row.account.id}</span>
                </div>
                <div>
                  <strong>{row.account.role} / {row.account.scope}</strong>
                  <span>{row.account.status}</span>
                </div>
                <div>
                  <strong>{row.accuracy}% accuracy</strong>
                  <span>{row.attempts} attempts / {row.latestBaseline}</span>
                </div>
                <div>
                  <strong>Target {row.account.targetScore}</strong>
                  <span>{row.parentNames.length ? row.parentNames.join(", ") : "No linked parent"}</span>
                </div>
                <div class="table-actions">
                  <button disabled={!row.canEdit} type="button" on:click={() => editAccount(row.account)}>Edit</button>
                  <button disabled={!row.canSuspendOrActivate} type="button" on:click={() => setAccountStatus(row.account)}>
                    {row.account.status === "active" ? "Suspend" : "Activate"}
                  </button>
                  <button class="danger-button" disabled={!row.canDelete} type="button" on:click={() => removeAccount(row.account)}>Delete</button>
                </div>
              </article>
            {/each}
          </div>
        </section>
      </section>
    {:else if activeTab === "rewards" && rewardModel}
      <section class="reward-ops-grid">
        <section class="admin-panel reward-form-panel">
          <p class="eyebrow">Reward operations</p>
          <h2>Reward programs</h2>
          <p class="muted">Local reward programs share the same account state as the legacy app. Pending redemptions reserve points until a parent or admin fulfills or cancels the claim.</p>
          {#if rewardMessage}
            <div class="account-message">{rewardMessage}</div>
          {/if}
          <div class="admin-metrics compact-metrics reward-metrics">
            <article><span>{rewardModel.totalPrograms}</span><small>Programs</small></article>
            <article><span>{rewardModel.activePrograms}</span><small>Active</small></article>
            <article><span>{rewardModel.pendingClaims}</span><small>Pending claims</small></article>
            <article><span>{rewardModel.students.length}</span><small>Eligible students</small></article>
          </div>
          <form class="account-form-grid" on:submit={submitRewardProgram}>
            <label>
              Title
              <input bind:value={rewardForm.title} required />
            </label>
            <label>
              Cost points
              <input bind:value={rewardForm.costPoints} min="1" type="number" />
            </label>
            <label>
              Reward type
              <select bind:value={rewardForm.rewardType}>
                <option value="privilege">Privilege</option>
                <option value="experience">Experience</option>
                <option value="gift">Gift</option>
                <option value="study_bonus">Study bonus</option>
              </select>
            </label>
            <label>
              Scope
              <select bind:value={rewardForm.scope}>
                <option value="family">Family</option>
                <option value="global">Global</option>
              </select>
            </label>
            <label>
              Status
              <select bind:value={rewardForm.status}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label>
              Target student
              <select bind:value={rewardForm.targetStudentId}>
                <option value="">All linked students</option>
                {#each rewardModel.students as student}
                  <option value={student.id}>{student.name}</option>
                {/each}
              </select>
            </label>
            <label class="full-span">
              Description
              <input bind:value={rewardForm.description} />
            </label>
            <div class="form-actions">
              <button disabled={!rewardModel.canManage} type="submit">Create reward</button>
              <button type="button" on:click={() => (rewardForm = blankRewardForm())}>Reset</button>
            </div>
          </form>
        </section>

        <div class="reward-stack">
          <section class="admin-panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Programs</p>
                <h2>{rewardModel.programs.length} visible programs</h2>
              </div>
              <button type="button" on:click={() => refreshAccountModel()}>Reload local state</button>
            </div>
            <div class="reward-table">
              {#each rewardModel.programs as row}
                <article class={`reward-row-card status-${row.program.status}`}>
                  <div>
                    <strong>{row.program.title}</strong>
                    <span>{row.program.description || "Parent/admin reward"}</span>
                  </div>
                  <div>
                    <strong>{row.program.costPoints} pts</strong>
                    <span>{row.program.rewardType} / {row.program.scope}</span>
                  </div>
                  <div>
                    <strong>{row.program.status}</strong>
                    <span>{row.targetLabel}</span>
                  </div>
                  <div>
                    <strong>{row.pendingClaims} pending</strong>
                    <span>{row.claimCount} total claims</span>
                  </div>
                  <div class="table-actions">
                    <button disabled={!row.canToggle} type="button" on:click={() => toggleRewardProgram(row.program.id, row.program.status === "active" ? "paused" : "active")}>
                      {row.program.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button class="danger-button" disabled={!row.canDelete} type="button" on:click={() => removeRewardProgram(row.program.id, row.program.title)}>Delete</button>
                  </div>
                </article>
              {/each}
              {#if rewardModel.programs.length === 0}
                <div class="empty">No reward program is visible for this manager.</div>
              {/if}
            </div>
          </section>

          <section class="admin-panel">
            <p class="eyebrow">Claims</p>
            <h2>{rewardModel.pendingClaims} pending redemptions</h2>
            <div class="reward-table">
              {#each rewardModel.claims as row}
                <article class={`reward-row-card status-${row.claim.status}`}>
                  <div>
                    <strong>{row.programTitle}</strong>
                    <span>{row.studentName}</span>
                  </div>
                  <div>
                    <strong>{row.claim.costPoints} pts</strong>
                    <span>{row.claim.status}</span>
                  </div>
                  <div>
                    <strong>Requested</strong>
                    <span>{formatDateTime(row.claim.requestedAt)}</span>
                  </div>
                  <div>
                    <strong>Resolved</strong>
                    <span>{formatDateTime(row.claim.fulfilledAt)}</span>
                  </div>
                  <div class="table-actions">
                    <button disabled={!row.canResolve} type="button" on:click={() => resolveClaim(row.claim.id, "fulfill")}>Fulfill</button>
                    <button class="danger-button" disabled={!row.canResolve} type="button" on:click={() => resolveClaim(row.claim.id, "cancel")}>Cancel</button>
                  </div>
                </article>
              {/each}
              {#if rewardModel.claims.length === 0}
                <div class="empty">No redemption requests yet.</div>
              {/if}
            </div>
          </section>
        </div>
      </section>
    {:else if activeTab === "news"}
      <section class="admin-two-column wide-left">
        <section class="admin-panel">
          <p class="eyebrow">News</p>
          <h2>Announcement publishing</h2>
          <p class="muted">Publish short operational updates to the Vite student announcement feed. Draft posts stay hidden from learners.</p>
          {#if announcementMessage}
            <div class="account-message">{announcementMessage}</div>
          {/if}
          <form class="account-form-grid" on:submit={submitAnnouncement}>
            <label>
              Title
              <input bind:value={announcementForm.title} required />
            </label>
            <label>
              Audience
              <select bind:value={announcementForm.audience}>
                <option value="students">Students</option>
                <option value="parents">Parents</option>
                <option value="all">All</option>
              </select>
            </label>
            <label>
              Status
              <select bind:value={announcementForm.status}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label class="check-line">
              <input bind:checked={announcementForm.pinned} type="checkbox" />
              Pin announcement
            </label>
            <label class="full-span">
              Body
              <textarea bind:value={announcementForm.body} required rows="4"></textarea>
            </label>
            <div class="form-actions">
              <button type="submit">Save announcement</button>
              <button type="button" on:click={() => (announcementForm = blankAnnouncementForm())}>Reset</button>
            </div>
          </form>
        </section>

        <section class="admin-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Announcement feed</p>
              <h2>{adminAnnouncements.length} published / {announcementState.posts.length} total</h2>
            </div>
            <button type="button" on:click={() => (announcementState = loadAnnouncementState())}>Reload</button>
          </div>
          <div class="news-table">
            {#each announcementState.posts as post}
              <article class:pinned={post.pinned}>
                <div>
                  <strong>{post.title}</strong>
                  <span>{post.audience} / {post.status}</span>
                  <p>{post.body}</p>
                </div>
                <div class="table-actions">
                  <button type="button" on:click={() => toggleAnnouncementStatus(post.id, post.status === "published" ? "draft" : "published")}>
                    {post.status === "published" ? "Draft" : "Publish"}
                  </button>
                  <button class="danger-button" disabled={post.id === "announcement-vite-public-ready"} type="button" on:click={() => removeAnnouncement(post.id)}>Delete</button>
                </div>
              </article>
            {/each}
          </div>
        </section>
      </section>
    {:else if activeTab === "backend" && backendModel}
      <section class="admin-two-column wide-left">
        <section class="admin-panel">
          <p class="eyebrow">Backend sync</p>
          <h2>{backendModel.state.statusTitle}</h2>
          <p class="muted">{backendModel.state.statusMessage}</p>
          {#if backendMessage}
            <div class="account-message">{backendMessage}</div>
          {/if}
          <div class="backend-form-grid">
            <label>
              Base URL
              <input bind:value={backendBaseUrl} placeholder="/api/public" />
            </label>
            <label>
              Username
              <input bind:value={backendUsername} autocomplete="username" />
            </label>
            <label>
              Password
              <input bind:value={backendPassword} autocomplete="current-password" type="password" />
            </label>
          </div>
          <div class="backend-actions">
            <button disabled={Boolean(backendBusy)} type="button" on:click={checkBackendHealth}>Health check</button>
            <button disabled={Boolean(backendBusy) || !backendModel.canBootstrap} type="button" on:click={bootstrapBackend}>Bootstrap admin</button>
            <button disabled={Boolean(backendBusy)} type="button" on:click={loginToBackend}>Login</button>
            <button disabled={Boolean(backendBusy) || backendModel.actionDisabled.refresh} type="button" on:click={refreshBackend}>Refresh session</button>
            <button disabled={Boolean(backendBusy) || backendModel.actionDisabled.monitoring} type="button" on:click={loadBackendMonitoring}>Monitoring</button>
            <button disabled={Boolean(backendBusy) || backendModel.actionDisabled.exportSnapshot} type="button" on:click={exportBackend}>Export snapshot</button>
            <button disabled={Boolean(backendBusy) || backendModel.actionDisabled.logout} type="button" on:click={logoutFromBackend}>Logout</button>
          </div>
        </section>

        <section class="admin-panel">
          <p class="eyebrow">Session and sync state</p>
          <h2>{backendModel.loggedIn ? "Connected" : "No backend session"}</h2>
          <div class="fact-list">
            <article><small>Session</small><strong>{backendModel.sessionLabel}</strong></article>
            <article><small>Health</small><strong>{backendModel.healthLabel}</strong></article>
            <article><small>Monitoring</small><strong>{backendModel.monitoringLabel}</strong></article>
            <article><small>Auto sync</small><strong>{backendModel.state.autoSync ? "Enabled" : "Disabled"}</strong></article>
            <article><small>Last progress sync</small><strong>{backendModel.state.lastSyncAt || "none"}</strong></article>
            <article><small>Last profile sync</small><strong>{backendModel.state.lastProfileSyncAt || "none"}</strong></article>
            <article><small>Last content package</small><strong>{backendModel.state.lastContentPackageVersion || "none"}</strong></article>
            <article><small>Last export</small><strong>{backendModel.state.lastExportAt || "none"}</strong></article>
          </div>
          <div class="issue-list warn">
            <strong>Phase 5 boundary</strong>
            <span>Vite owns session state, health, login, monitoring, export controls</span>
            <span>Vite owns full-profile conflict review and explicit local apply</span>
            <span>server enforces password hashing, RBAC, session revocation</span>
          </div>
        </section>

        <section class="admin-panel backend-profile-panel">
          <p class="eyebrow">Profile conflict review</p>
          <h2>{pendingProfileRecord ? `Server revision ${pendingProfileRecord.serverRevision}` : "No server profile loaded"}</h2>
          <p class="muted">Sync rejects stale local writes by default. If the server has a newer profile, review the count-level diff here before applying it to the selected local learner.</p>
          <div class="backend-form-grid profile-sync-grid">
            <label>
              Local learner
              <select bind:value={profileSyncLocalAccountId}>
                {#each profileOptions as account}
                  <option value={account.id}>{account.name}</option>
                {/each}
              </select>
            </label>
            <label>
              Backend account
              <input disabled value={backendModel.state.account?.username || backendModel.state.account?.id || "No backend session"} />
            </label>
          </div>
          <div class="backend-actions">
            <button disabled={Boolean(backendBusy) || !backendModel.loggedIn || !selectedProfileAccount} type="button" on:click={syncBackendProfile}>Sync local profile</button>
            <button disabled={Boolean(backendBusy) || !backendModel.loggedIn || !selectedProfileAccount} type="button" on:click={loadBackendProfileForReview}>Load server profile</button>
            <button class="danger-button" disabled={Boolean(backendBusy) || !pendingProfileRecord || !selectedProfileAccount} type="button" on:click={applyLoadedBackendProfile}>Apply server profile</button>
          </div>
          {#if pendingProfileDiff}
            <div class="profile-diff-table">
              {#each profileDiffRows(pendingProfileDiff) as row}
                <article class:changed={row.changed}>
                  <strong>{row.label}</strong>
                  <span>Local {row.local}</span>
                  <span>Server {row.server}</span>
                </article>
              {/each}
            </div>
          {:else}
            <div class="empty">Load a server profile or trigger a conflict to see the profile comparison.</div>
          {/if}
        </section>
      </section>
    {/if}
  {/if}
</main>

<style>
  .admin-app {
    color: #18212b;
    display: grid;
    gap: 22px;
    margin: 0 auto;
    max-width: 1280px;
    min-height: 100vh;
    padding: 24px;
  }

  .admin-topbar,
  .panel-head {
    align-items: center;
    display: flex;
    gap: 18px;
    justify-content: space-between;
  }

  .eyebrow {
    color: #526779;
    font-size: 0.74rem;
    font-weight: 850;
    letter-spacing: 0;
    margin: 0 0 6px;
    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin-top: 0;
  }

  h1 {
    font-size: 2rem;
    letter-spacing: 0;
    margin-bottom: 0;
  }

  h2 {
    margin-bottom: 10px;
  }

  h3 {
    font-size: 1.05rem;
    margin: 0;
  }

  button {
    background: #ffffff;
    border: 1px solid #cbd6e2;
    border-radius: 8px;
    color: #1d2c3a;
    cursor: pointer;
    font-weight: 760;
    min-height: 38px;
    padding: 0 12px;
  }

  button.active,
  .filters button.active {
    background: #19384f;
    border-color: #19384f;
    color: #ffffff;
  }

  .admin-metrics {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .admin-tabs {
    background: #e9eef5;
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
  }

  .admin-metrics article,
  .admin-panel,
  .state-panel {
    background: #ffffff;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    padding: 18px;
  }

  .admin-metrics article {
    display: grid;
    gap: 8px;
    min-height: 96px;
  }

  .admin-metrics span {
    font-size: 1.7rem;
    font-weight: 900;
  }

  small,
  .muted,
  .prompt,
  .empty,
  .gate-grid p {
    color: #516477;
    line-height: 1.5;
  }

  .admin-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: 380px minmax(0, 1fr);
  }

  .admin-two-column {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-two-column.wide-left {
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  }

  .expert-gate-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.65fr);
  }

  .expert-editor-panel {
    grid-row: span 3;
  }

  .expert-form-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 14px;
  }

  .expert-form-grid label {
    color: #26384a;
    display: grid;
    font-size: 0.86rem;
    font-weight: 760;
    gap: 8px;
  }

  .expert-form-grid .full-row {
    grid-column: 1 / -1;
  }

  .compact-metrics {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    margin: 14px 0;
  }

  .compact-metrics article {
    min-height: 86px;
  }

  .reward-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .queue-panel {
    align-self: start;
    display: grid;
    gap: 14px;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .search-box {
    color: #26384a;
    display: grid;
    font-weight: 760;
    gap: 8px;
  }

  input,
  select,
  textarea {
    border: 1px solid #cbd6e2;
    border-radius: 8px;
    min-height: 40px;
    padding: 0 12px;
  }

  textarea {
    font: inherit;
    min-height: 110px;
    padding: 10px 12px;
    resize: vertical;
  }

  select {
    background: #ffffff;
  }

  .queue-list {
    display: grid;
    gap: 8px;
    max-height: 680px;
    overflow: auto;
  }

  .queue-row {
    align-items: start;
    display: grid;
    gap: 4px 10px;
    grid-template-columns: 38px minmax(0, 1fr);
    height: auto;
    min-height: 78px;
    padding: 10px;
    text-align: left;
  }

  .queue-row span {
    background: #edf3f8;
    border-radius: 999px;
    display: grid;
    font-size: 0.78rem;
    height: 30px;
    place-items: center;
    width: 30px;
  }

  .queue-row small,
  .queue-row em {
    grid-column: 2;
  }

  .queue-row em {
    color: #48637a;
    font-style: normal;
  }

  .detail-panel {
    min-height: 560px;
  }

  .question-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .question-meta span {
    background: #edf3f8;
    border-radius: 999px;
    color: #31546f;
    font-size: 0.8rem;
    font-weight: 760;
    padding: 6px 10px;
  }

  .prompt {
    border-top: 1px solid #e3ebf2;
    font-size: 1.02rem;
    margin-top: 16px;
    max-height: 260px;
    overflow: auto;
    padding-top: 16px;
    white-space: pre-wrap;
  }

  .answer-review {
    background: #f8fafc;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    margin-top: 16px;
    padding: 14px;
  }

  .answer-head {
    align-items: start;
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  .choice-list {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }

  .choice-list article {
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 10px;
    grid-template-columns: 32px minmax(0, 1fr);
    padding: 10px;
  }

  .choice-list article.correct-choice {
    border-color: #8bc8a7;
    background: #edf8f1;
  }

  .choice-list strong {
    background: #e9eef5;
    border-radius: 999px;
    display: grid;
    height: 30px;
    place-items: center;
    width: 30px;
  }

  .choice-list p {
    margin: 4px 0 0;
  }

  .gate-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 18px;
  }

  .gate-grid.compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gate-grid article {
    background: #f6f8fb;
    border: 1px solid #e0e8f0;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    padding: 14px;
  }

  .gate-grid span {
    font-weight: 900;
  }

  .gate-grid span.pass {
    color: #137547;
  }

  .gate-grid span.fail {
    color: #9a3412;
  }

  .issue-list {
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    padding: 12px;
  }

  .issue-list strong {
    flex-basis: 100%;
  }

  .issue-list span {
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 760;
    padding: 6px 10px;
  }

  .issue-list.danger {
    background: #fff1ed;
    border: 1px solid #ffc4ae;
  }

  .issue-list.warn {
    background: #fff8e6;
    border: 1px solid #f2d58a;
  }

  .issue-list.danger span {
    background: #ffd8cc;
  }

  .issue-list.warn span {
    background: #fae6a5;
  }

  .release-status {
    align-items: end;
    border-radius: 8px;
    display: grid;
    gap: 4px;
    margin: 14px 0;
    min-height: 116px;
    padding: 18px;
  }

  .release-status.pass {
    background: #e7f7ee;
    border: 1px solid #9bd6b2;
  }

  .release-status.fail {
    background: #fff1ed;
    border: 1px solid #ffc4ae;
  }

  .release-status strong {
    font-size: 2.2rem;
  }

  .readiness-table,
  .source-table,
  .checklist {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }

  .command-list {
    display: grid;
    gap: 8px;
    margin: 14px 0;
  }

  .command-list code {
    background: #eef3f8;
    border: 1px solid #d6e0ea;
    border-radius: 8px;
    color: #26384a;
    display: block;
    overflow-wrap: anywhere;
    padding: 10px 12px;
  }

  .account-ops-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: 420px minmax(0, 1fr);
  }

  .reward-ops-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: 420px minmax(0, 1fr);
  }

  .reward-stack {
    display: grid;
    gap: 18px;
  }

  .account-form-panel,
  .account-list-panel,
  .reward-form-panel {
    align-self: start;
  }

  .account-form-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 14px;
  }

  .account-form-grid label {
    color: #26384a;
    display: grid;
    font-size: 0.86rem;
    font-weight: 760;
    gap: 7px;
  }

  .account-form-grid .check-line {
    align-items: center;
    display: flex;
    gap: 8px;
    min-height: 40px;
  }

  .check-line input {
    min-height: 0;
  }

  .form-actions {
    display: flex;
    gap: 8px;
    grid-column: 1 / -1;
  }

  .full-span {
    grid-column: 1 / -1;
  }

  .account-message {
    background: #edf6ff;
    border: 1px solid #bedaf2;
    border-radius: 8px;
    color: #224862;
    font-weight: 760;
    margin-top: 12px;
    padding: 10px 12px;
  }

  .account-storage-line {
    align-items: center;
    background: #f6f8fb;
    border: 1px solid #e0e8f0;
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 14px 0;
    padding: 10px 12px;
  }

  .account-storage-line span {
    background: #e8eff6;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 760;
    padding: 5px 9px;
  }

  .account-table {
    display: grid;
    gap: 10px;
  }

  .reward-table {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }

  .news-table {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }

  .account-row-card {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(180px, 1.2fr) 120px minmax(160px, 1fr) minmax(150px, 1fr) auto;
    padding: 12px;
  }

  .reward-row-card {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(190px, 1.25fr) 120px minmax(150px, 0.9fr) 120px auto;
    padding: 12px;
  }

  .news-table article {
    align-items: start;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 12px;
  }

  .news-table article.pinned {
    background: #f0f7ff;
    border-color: #bcd5ef;
  }

  .news-table strong,
  .news-table span {
    display: block;
  }

  .news-table span,
  .news-table p {
    color: #516477;
    line-height: 1.5;
    margin: 4px 0 0;
  }

  .account-row-card.status-suspended,
  .account-row-card.status-disabled {
    background: #fff8e6;
    border-color: #f2d58a;
  }

  .reward-row-card.status-paused,
  .reward-row-card.status-cancelled {
    background: #fff8e6;
    border-color: #f2d58a;
  }

  .reward-row-card.status-fulfilled {
    background: #f1faf5;
    border-color: #b9dfc7;
  }

  .account-row-card strong,
  .account-row-card span,
  .reward-row-card strong,
  .reward-row-card span {
    display: block;
  }

  .account-row-card span,
  .reward-row-card span {
    color: #516477;
    font-size: 0.84rem;
    margin-top: 3px;
  }

  .danger-button {
    border-color: #e0b4a4;
    color: #8a2f18;
  }

  .backend-form-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 14px;
  }

  .backend-form-grid label {
    color: #26384a;
    display: grid;
    font-size: 0.86rem;
    font-weight: 760;
    gap: 7px;
  }

  .backend-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .backend-actions.compact-actions {
    margin: 0 0 12px;
  }

  .backend-actions select {
    min-height: 38px;
  }

  .backend-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .backend-profile-panel {
    grid-column: 1 / -1;
  }

  .profile-sync-grid {
    grid-template-columns: minmax(220px, 0.6fr) minmax(260px, 1fr);
  }

  .profile-diff-table {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }

  .profile-diff-table article {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) 120px 120px;
    padding: 12px;
  }

  .profile-diff-table article.changed {
    background: #fff8e6;
    border-color: #f2d58a;
  }

  .profile-diff-table span {
    color: #516477;
    font-size: 0.88rem;
    font-weight: 760;
    text-align: right;
  }

  .readiness-table article,
  .source-table article,
  .checklist article {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    padding: 12px;
  }

  .readiness-table article {
    grid-template-columns: minmax(0, 1fr) 80px 120px 78px;
  }

  .readiness-table small {
    display: block;
  }

  .readiness-table em {
    color: #137547;
    font-style: normal;
    font-weight: 850;
    text-align: right;
  }

  .readiness-table em.warn {
    color: #9a3412;
  }

  .source-table article {
    grid-template-columns: minmax(0, 1fr) 86px 86px 110px 90px;
  }

  .source-table p {
    color: #516477;
    grid-column: 1 / -1;
    margin: 0;
  }

  .source-table span,
  .source-table em {
    font-style: normal;
    font-weight: 850;
    text-align: right;
  }

  .source-table article.protected-source {
    background: #fff8e6;
    border-color: #f2d58a;
  }

  .checklist article {
    grid-template-columns: minmax(0, 1fr) 86px;
  }

  .checklist article.pass {
    background: #f1faf5;
    border-color: #b9dfc7;
  }

  .checklist article.warn {
    background: #fff9e8;
    border-color: #f1d58a;
  }

  .checklist article.block {
    background: #fff1ed;
    border-color: #ffc4ae;
  }

  .checklist span {
    font-weight: 900;
    text-align: right;
    text-transform: uppercase;
  }

  .checklist p {
    color: #516477;
    grid-column: 1 / -1;
    margin: 0;
  }

  .admin-subgrid {
    display: grid;
    gap: 14px;
    grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
    margin-top: 16px;
  }

  .review-block {
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    padding: 14px;
  }

  .review-block article {
    border-top: 1px solid #e8eef5;
    padding: 12px 0;
  }

  .review-block article:first-of-type {
    border-top: 0;
  }

  .review-block p {
    color: #516477;
    line-height: 1.5;
    margin-bottom: 0;
  }

  .workflow-rail {
    display: grid;
    gap: 10px;
    margin-top: 16px;
  }

  .workflow-rail article,
  .version-list article {
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 6px;
    padding: 12px;
  }

  .workflow-rail article.done {
    background: #edf8f1;
    border-color: #9bd6b2;
  }

  .workflow-rail article.pending {
    background: #fff8e6;
    border-color: #f2d58a;
  }

  .workflow-rail span,
  .version-list span,
  .version-list small {
    color: #516477;
    line-height: 1.4;
  }

  .version-list {
    display: grid;
    gap: 10px;
    max-height: 360px;
    overflow: auto;
  }

  .correct-explanation strong {
    color: #137547;
  }

  .trap-explanation strong {
    color: #9a3412;
  }

  .fact-list {
    display: grid;
    gap: 8px;
  }

  .fact-list article {
    border: 0;
    border-bottom: 1px solid #e8eef5;
    display: grid;
    gap: 4px;
    padding: 8px 0;
  }

  .fact-list strong {
    overflow-wrap: anywhere;
  }

  .distribution-panel {
    display: grid;
    gap: 12px;
  }

  .bar-list,
  .domain-list {
    display: grid;
    gap: 10px;
  }

  .bar-list article {
    align-items: center;
    background: #f6f8fb;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) auto;
    overflow: hidden;
    padding: 10px;
    position: relative;
  }

  .bar-list article > span {
    background: #d9e9f4;
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    z-index: 0;
  }

  .bar-list strong,
  .bar-list em {
    position: relative;
    z-index: 1;
  }

  .bar-list em {
    font-style: normal;
    font-weight: 850;
  }

  .domain-list article {
    align-items: center;
    border-bottom: 1px solid #e3ebf2;
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) 72px;
    padding: 10px 0;
  }

  .domain-list small {
    display: block;
  }

  .domain-list span {
    font-weight: 900;
    text-align: right;
  }

  .state-panel.error {
    border-color: #e6a4a4;
    color: #8a2727;
  }

  @media (max-width: 960px) {
    .admin-topbar,
    .panel-head {
      align-items: stretch;
      flex-direction: column;
    }

    .admin-metrics,
    .admin-grid,
    .account-ops-grid,
    .reward-ops-grid,
    .expert-gate-grid,
    .expert-form-grid,
    .admin-two-column,
    .admin-two-column.wide-left,
    .gate-grid,
    .admin-subgrid,
    .compact-metrics,
    .account-form-grid,
    .backend-form-grid,
    .profile-sync-grid,
    .account-row-card,
    .reward-row-card,
    .news-table article,
    .profile-diff-table article,
    .readiness-table article,
    .source-table article,
    .checklist article {
      grid-template-columns: 1fr;
    }

    .source-table span,
    .profile-diff-table span,
    .source-table em,
    .readiness-table em,
    .checklist span {
      text-align: left;
    }
  }
</style>
