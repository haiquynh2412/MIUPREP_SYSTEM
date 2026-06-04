<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { announcementFeed, loadAnnouncementState, type AnnouncementState } from "../domain/announcements";
  import type { AttemptRecord, LearnerState, PublicQuestionItem, PublicStudentPackage, QuestionRepository, StudyMode } from "../domain/student-learning";
  import {
    buildDiagnosticSet,
    buildPracticeSet,
    buildReviewSet,
    choiceEntries,
    correctAnswerText,
    createQuestionRepository,
    emptyLearnerState,
    estimatedBand,
    explanationText,
    isGridIn,
    learnerEventSummary,
    loadBackendPublicStudentPackage,
    loadLearnerState,
    loadPublicStudentPackage,
    masteryRows,
    nextAction,
    recordAttempt,
    replaceLearningEvent,
    saveLearnerState,
    syncAttemptToAccountProfile,
  } from "../domain/student-learning";
  import { saveSharedLearningEvent, saveSharedLearningEvents } from "../domain/learning-events";
  import type { RewardState, StudentRewardStoreModel } from "../domain/rewards";
  import { buildStudentRewardStoreModel, loadRewardState, redeemRewardProgram, saveRewardState } from "../domain/rewards";
  import { applyMissionReward, buildTodayMission, missionClaimKey, missionCompleted } from "../domain/student-missions";
  import { deleteOfflineValue, loadOfflineValue, saveOfflineValue } from "../domain/offline-store";
  import type { OfficialExamLog } from "../domain/student-tools";
  import {
    addOfficialExamLog,
    buildExamReviewModel,
    buildLessonLibrary,
    buildVocabModel,
    recordVocabQuizAttempt,
    removeOfficialExamLog,
    syncStudentToolsToAccountProfile,
    toggleVocabKnown,
    vocabQuizChoices,
  } from "../domain/student-tools";
  import { CLASSROOM_ASSIGNMENTS_STORAGE_KEY, buildAssignmentEvidenceFromAttempts, type ClassroomAssignment, type ClassroomAssignmentMode } from "../domain/teacher-classroom";
  import {
    buildMixedAdaptiveSet,
    buildModule2Readiness,
    buildSatStrategyRemediationCards,
    type Module2Readiness,
    type SatPacingSummary,
    type SatStrategyRemediationCard,
  } from "../domain/sat-optimization";
  import {
    DEFAULT_PUBLIC_BACKEND_BASE_URL,
    PUBLIC_BACKEND_COOKIE_SESSION,
    getBackendMe,
    getBackendToken,
    joinBackendClass,
    listBackendClassAssignments,
    listBackendClasses,
    loadPublicBackendState,
    loginBackend,
    logoutBackend,
    normalizeBackendAccount,
    saveBackendProfile,
    saveBackendProgress,
    savePublicBackendState,
    setBackendToken,
    submitBackendAssignmentEvidence,
    signupBackend,
    type BackendAccount,
    type BackendClassAssignment,
    type BackendClassroom,
  } from "../domain/public-backend";

  const BLUEBOOK_SESSION_STORAGE_KEY = "sat-studio:vite-bluebook-session-v1";
  const BACKEND_SYNC_QUEUE_STORAGE_KEY = "sat-studio:vite-backend-sync-queue-v1";
  const PUBLIC_PACKAGE_CACHE_KEY = "sat-studio:vite-public-package-cache-v1";
  const BLUEBOOK_MODULE_SECONDS = 35 * 60;

  type BluebookRoute = "standard" | "hard" | "support";
  type BluebookStage = 1 | 2;

  interface BackendSyncQueueItem {
    id: string;
    accountId: string;
    reason: string;
    clientRevision: number;
    profilePayload: Record<string, unknown>;
    progressPayload: Record<string, unknown>;
    createdAt: string;
  }

  interface BluebookSessionSnapshot {
    version: 1;
    active: boolean;
    contentVersion: string;
    questionIds: string[];
    activeIndex: number;
    route?: BluebookRoute;
    stage?: BluebookStage;
    introOpen?: boolean;
    remainingSeconds: number;
    timerHidden: boolean;
    selectedAnswers: Record<string, string>;
    flaggedQuestionIds: string[];
    highlightedQuestionIds?: string[];
    promptHighlights: Record<string, string[]>;
    eliminatedByQuestion: Record<string, string[]>;
    updatedAt: string;
  }

  interface BluebookModuleSummary {
    stage: BluebookStage;
    route: BluebookRoute;
    accuracy: number;
    correct: number;
    answered: number;
    weakSkill: string;
    pacingRisk?: string;
    routeReason?: string;
    completedAt: string;
  }

  interface PublicPackageCacheSnapshot {
    version: 1;
    source: "backend" | "static";
    cachedAt: string;
    contentVersion: string;
    package: PublicStudentPackage;
  }

  type DesmosCalculator = {
    destroy?: () => void;
    setExpression?: (expression: { id: string; latex: string }) => void;
  };

  declare global {
    interface Window {
      Desmos?: {
        GraphingCalculator: (element: HTMLElement, options?: Record<string, unknown>) => DesmosCalculator;
      };
    }
  }

  let repo: QuestionRepository | null = null;
  let learner: LearnerState = emptyLearnerState();
  let loading = true;
  let loadError = "";
  let activeQuestions: PublicQuestionItem[] = [];
  let activeIndex = 0;
  let activeMode: StudyMode = "practice";
  let selectedAnswer = "";
  let startedAt = Date.now();
  let feedback: AttemptRecord | null = null;
  let practiceSkill = "";
  let rewardState: RewardState | null = null;
  let rewardStore: StudentRewardStoreModel | null = null;
  let rewardMessage = "";
  let announcementState: AnnouncementState = loadAnnouncementState();
  let vocabCategory = "All";
  let vocabSearch = "";
  let vocabHideKnown = false;
  let vocabIndex = 0;
  let vocabFlipped = false;
  let vocabSelectedDefinition = "";
  let vocabFeedback = "";
  let officialForm: Pick<OfficialExamLog, "testDate" | "source" | "rwScore" | "mathScore" | "notes"> = {
    testDate: new Date().toISOString().slice(0, 10),
    source: "Bluebook",
    rwScore: 700,
    mathScore: 700,
    notes: "",
  };
  let backendBaseUrl = DEFAULT_PUBLIC_BACKEND_BASE_URL;
  let backendToken = "";
  let backendAccount: BackendAccount | null = null;
  let backendUsername = "";
  let backendPassword = "";
  let backendDisplayName = "";
  let backendAuthMode: "login" | "signup" = "login";
  let backendBusy = "";
  let backendMessage = "Có thể học trên máy này. Đăng nhập để đồng bộ tiến trình giữa nhiều thiết bị.";
  let contentSource = "Gói câu hỏi tĩnh";
  let examRemainingSeconds = BLUEBOOK_MODULE_SECONDS;
  let bluebookRoute: BluebookRoute = "standard";
  let bluebookStage: BluebookStage = 1;
  let bluebookModuleHistory: BluebookModuleSummary[] = [];
  let examTimerHidden = false;
  let examSelectedAnswers: Record<string, string> = {};
  let flaggedQuestionIds: string[] = [];
  let promptHighlights: Record<string, string[]> = {};
  let eliminatedByQuestion: Record<string, string[]> = {};
  let bluebookIntroOpen = false;
  let bluebookReviewOpen = false;
  let bluebookReviewResults: AttemptRecord[] = [];
  let examTimerId: ReturnType<typeof setInterval> | null = null;
  let desmosContainer: HTMLDivElement | null = null;
  let desmosCalculator: DesmosCalculator | null = null;
  let desmosLoading = false;
  let desmosApiReady = false;
  let desmosApiStatus = "Desmos API sẵn sàng tải trong câu Math.";
  let offlineQueueCount = 0;
  let classroomAssignments: ClassroomAssignment[] = [];
  let backendClasses: BackendClassroom[] = [];
  let classJoinCode = "";
  let classJoinMessage = "";

  $: rows = masteryRows(learner);
  $: action = nextAction(learner);
  $: band = estimatedBand(learner);
  $: currentQuestion = activeQuestions[activeIndex] || null;
  $: totalCorrect = learner.attempts.filter((attempt) => attempt.correct).length;
  $: dueMistakes = learner.attempts.filter((attempt) => !attempt.correct).length;
  $: packageCount = repo?.items.length || 0;
  $: eventSummary = learnerEventSummary(learner);
  $: lessonCards = buildLessonLibrary(repo, learner, 8);
  $: vocabModel = buildVocabModel(learner, { category: vocabCategory, query: vocabSearch, hideKnown: vocabHideKnown });
  $: todayMission = buildTodayMission(learner, { vocabLearning: vocabModel.learning });
  $: todayMissionDone = missionCompleted(todayMission, learner);
  $: todayMissionClaimed = missionRewardAlreadyClaimed();
  $: rewardStudentProfile = rewardState ? rewardState.profiles[defaultRewardStudentId(rewardState)] || null : null;
  $: studentStreakCount = Number(rewardStudentProfile?.streak?.count || 0);
  $: studentFreezeCredits = Number(rewardStudentProfile?.streak?.freezeCredits || 0);
  $: currentVocab = vocabModel.entries.length ? vocabModel.entries[((vocabIndex % vocabModel.entries.length) + vocabModel.entries.length) % vocabModel.entries.length] : null;
  $: currentVocabChoices = currentVocab ? vocabQuizChoices(currentVocab) : [];
  $: examModel = buildExamReviewModel(learner);
  $: studentAnnouncements = announcementFeed(announcementState, "student");
  $: backendConnected = Boolean(backendToken && backendAccount);
  $: hasBaseline = learner.attempts.length > 0 || learner.officialExamLogs.length > 0;
  $: currentEliminatedChoices = currentQuestion ? eliminatedByQuestion[currentQuestion.id] || [] : [];
  $: currentFlagged = currentQuestion ? flaggedQuestionIds.includes(currentQuestion.id) : false;
  $: currentPromptHighlights = currentQuestion ? promptHighlights[currentQuestion.id] || [] : [];
  $: currentHighlighted = currentPromptHighlights.length > 0;
  $: examTimeLabel = `${String(Math.floor(examRemainingSeconds / 60)).padStart(2, "0")}:${String(examRemainingSeconds % 60).padStart(2, "0")}`;
  $: bluebookAnsweredCount = activeMode === "bluebook" ? activeQuestions.filter((question) => (examSelectedAnswers[question.id] || "").trim()).length : 0;
  $: bluebookSkippedCount = activeMode === "bluebook" ? Math.max(0, activeQuestions.length - bluebookAnsweredCount) : 0;
  $: bluebookFlaggedCount = activeMode === "bluebook" ? flaggedQuestionIds.length : 0;
  $: bluebookProgressPct = activeQuestions.length ? Math.round((bluebookAnsweredCount / activeQuestions.length) * 100) : 0;
  $: bluebookTimerWarning = activeMode === "bluebook" && examRemainingSeconds <= 300;
  $: bluebookCorrectCount = bluebookReviewResults.filter((attempt) => attempt.correct).length;
  $: bluebookReviewAccuracy = bluebookReviewResults.length ? Math.round((bluebookCorrectCount / bluebookReviewResults.length) * 100) : 0;
  $: bluebookOptimization = buildModule2Readiness(bluebookReviewResults, {
    moduleQuestionCount: activeMode === "bluebook" && activeQuestions.length ? activeQuestions.length : bluebookReviewResults.length,
    questionLookup: (id) => repo?.byId.get(id),
  }) as Module2Readiness;
  $: bluebookReviewPacing = bluebookOptimization.pacing as SatPacingSummary;
  $: bluebookReviewCards = buildSatStrategyRemediationCards(bluebookReviewResults, {
    questionLookup: (id) => repo?.byId.get(id),
  }) as SatStrategyRemediationCard[];
  $: bluebookReviewWeakSkill = bluebookOptimization.focusSkill || bluebookReviewResults.find((attempt) => !attempt.correct)?.skill || bluebookReviewResults[0]?.skill || "Mixed SAT";
  $: bluebookReviewNextRoute = bluebookOptimization.route as BluebookRoute;
  $: bluebookReviewComplete = bluebookReviewOpen && bluebookStage >= 2;
  $: bluebookReviewNextStep =
    bluebookReviewResults.length === 0
      ? "Hãy làm một module Bluebook để có báo cáo."
      : bluebookReviewComplete
        ? "Đã hoàn tất mô phỏng adaptive 2 module. Hệ thống sẽ dùng lỗi sai, tốc độ và nhánh đã route để mở lộ trình sửa lỗi."
        : bluebookOptimization.readiness === "accelerate"
          ? "Module 1 sạch lỗi. Module 2 sẽ tăng độ khó để kiểm tra trần điểm."
          : `Module 2 route theo ${bluebookReviewWeakSkill}. ${bluebookOptimization.reason}`;
  $: visibleClassroomAssignments = classroomAssignments.slice(0, 4);
  $: openClassroomAssignments = visibleClassroomAssignments.filter((assignment) => !assignmentDone(assignment));

  onMount(async () => {
    try {
      learner = loadLearnerState();
      announcementState = loadAnnouncementState();
      classroomAssignments = loadClassroomAssignments();
      refreshRewards();
      const loadedBackend = loadPublicBackendState();
      backendBaseUrl = loadedBackend.backend.baseUrl || DEFAULT_PUBLIC_BACKEND_BASE_URL;
      backendToken = getBackendToken();
      backendAccount = loadedBackend.backend.account;
      if (backendToken) {
        await refreshBackendIdentity();
        await loadBackendClassroomAssignments();
      }
      const contentPackage = await loadStudentContentPackage();
      repo = createQuestionRepository(contentPackage);
      learner = { ...learner, lastContentVersion: contentPackage.contentVersion };
      await restoreBluebookSession();
      offlineQueueCount = (await loadBackendSyncQueue()).length;
      persist();
      startExamTimer();
      window.addEventListener("online", flushQueuedBackendSync);
      void flushQueuedBackendSync();
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Could not load SAT Studio content.";
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (examTimerId) clearInterval(examTimerId);
    desmosCalculator?.destroy?.();
    if (typeof window !== "undefined") window.removeEventListener("online", flushQueuedBackendSync);
  });

  afterUpdate(() => {
    if (activeMode === "bluebook" && currentQuestion?.section === "Math") {
      void ensureDesmosCalculator();
    }
  });

  function loadDesmosApi(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.Desmos?.GraphingCalculator) return Promise.resolve();
    const scriptId = "sat-studio-desmos-api";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Desmos API failed to load.")), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = "https://www.desmos.com/api/v1.11/calculator.js?apiKey=sat-studio";
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", () => reject(new Error("Desmos API failed to load.")), { once: true });
      document.head.appendChild(script);
    });
  }

  async function ensureDesmosCalculator(): Promise<void> {
    if (typeof window === "undefined" || !desmosContainer || desmosCalculator || desmosLoading) return;
    desmosLoading = true;
    desmosApiStatus = "Đang tải Desmos API...";
    try {
      await loadDesmosApi();
      if (!window.Desmos?.GraphingCalculator || !desmosContainer) throw new Error("Desmos API unavailable.");
      desmosCalculator = window.Desmos.GraphingCalculator(desmosContainer, {
        expressions: false,
        settingsMenu: false,
        zoomButtons: true,
        keypad: true,
      });
      desmosApiReady = true;
      desmosApiStatus = "Desmos API đã sẵn sàng trong màn hình làm bài.";
    } catch {
      desmosApiReady = false;
      desmosApiStatus = "Không tải được Desmos API; dùng tab mới nếu cần.";
    } finally {
      desmosLoading = false;
    }
  }

  function persist(): void {
    saveLearnerState(learner);
  }

  async function loadStudentContentPackage(): Promise<PublicStudentPackage> {
    if (backendToken) {
      try {
        const backendPackage = await loadBackendPublicStudentPackage({ baseUrl: backendBaseUrl, token: backendToken });
        contentSource = "Gói câu hỏi từ server";
        await savePublicPackageCache(backendPackage, "backend");
        return backendPackage;
      } catch (error) {
        backendMessage = error instanceof Error ? `Chưa tải được gói câu hỏi từ server, đang dùng gói tĩnh. ${error.message}` : "Chưa tải được gói câu hỏi từ server, đang dùng gói tĩnh.";
      }
    }
    try {
      const staticPackage = await loadPublicStudentPackage();
      contentSource = "Gói câu hỏi tĩnh";
      await savePublicPackageCache(staticPackage, "static");
      return staticPackage;
    } catch (error) {
      const cachedPackage = await loadCachedPublicPackage();
      if (cachedPackage) {
        const reason = error instanceof Error ? error.message : "Không tải được gói câu hỏi tĩnh.";
        backendMessage = `Using cached public package because live content could not load. ${reason}`;
        return cachedPackage;
      }
      throw error;
    }
  }

  async function savePublicPackageCache(contentPackage: PublicStudentPackage, source: PublicPackageCacheSnapshot["source"]): Promise<void> {
    await saveOfflineValue<PublicPackageCacheSnapshot>(PUBLIC_PACKAGE_CACHE_KEY, {
      version: 1,
      source,
      cachedAt: new Date().toISOString(),
      contentVersion: contentPackage.contentVersion,
      package: contentPackage,
    });
  }

  async function loadCachedPublicPackage(): Promise<PublicStudentPackage | null> {
    const cached = await loadOfflineValue<PublicPackageCacheSnapshot | null>(PUBLIC_PACKAGE_CACHE_KEY, null);
    if (!cached || cached.version !== 1 || !cached.package || !Array.isArray(cached.package.items) || !cached.package.items.length) return null;
    contentSource = `Offline cache: ${cached.source}`;
    return cached.package;
  }

  function persistTools(): void {
    syncStudentToolsToAccountProfile(learner);
    persist();
    void syncBackendLearnerProfile("tool_update");
  }

  function loadClassroomAssignments(): ClassroomAssignment[] {
    if (typeof localStorage === "undefined") return [];
    try {
      const raw = localStorage.getItem(CLASSROOM_ASSIGNMENTS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as ClassroomAssignment[]) : [];
      return Array.isArray(parsed)
        ? parsed
            .filter((item) => item && item.classCode && item.title && item.focusSkill)
            .sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")))
            .slice(0, 10)
        : [];
    } catch {
      return [];
    }
  }

  function safeAssignmentMode(mode: string): ClassroomAssignmentMode {
    if (mode === "diagnostic" || mode === "remedial_sprint" || mode === "proof_review" || mode === "timed_mixed") return mode;
    return "remedial_sprint";
  }

  function backendAssignmentToClassroom(assignment: BackendClassAssignment, classroom: BackendClassroom): ClassroomAssignment {
    const evidenceByStudent = assignment.evidenceByStudent && typeof assignment.evidenceByStudent === "object" ? assignment.evidenceByStudent : {};
    const hasEvidence = Boolean(backendAccount?.id && Object.prototype.hasOwnProperty.call(evidenceByStudent, backendAccount.id));
    return {
      id: assignment.id,
      classCode: classroom.joinCode,
      title: assignment.title,
      focusSkill: assignment.focusSkill,
      mode: safeAssignmentMode(assignment.mode),
      targetStudentIds: assignment.targetStudentIds || [],
      dueDate: assignment.dueDate,
      createdAt: assignment.createdAt,
      status: hasEvidence ? "completed" : "assigned",
    };
  }

  function mergeClassroomAssignments(assignments: ClassroomAssignment[]): ClassroomAssignment[] {
    const byId = new Map<string, ClassroomAssignment>();
    assignments.forEach((assignment) => byId.set(assignment.id, assignment));
    return [...byId.values()]
      .sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, 25);
  }

  async function loadBackendClassroomAssignments(): Promise<void> {
    if (!backendToken) return;
    try {
      const response = await listBackendClasses(backendToken, { baseUrl: backendBaseUrl });
      backendClasses = Array.isArray(response.items) ? response.items : [];
      const backendAssignments: ClassroomAssignment[] = [];
      for (const classroom of backendClasses) {
        const assignmentResponse = await listBackendClassAssignments(backendToken, classroom.id, { baseUrl: backendBaseUrl });
        const items = Array.isArray(assignmentResponse.items) ? assignmentResponse.items : [];
        items.forEach((assignment) => backendAssignments.push(backendAssignmentToClassroom(assignment, classroom)));
      }
      classroomAssignments = mergeClassroomAssignments([...backendAssignments, ...loadClassroomAssignments()]);
      if (backendClasses.length) classJoinMessage = `Đang theo học ${backendClasses.length} lớp backend.`;
    } catch (error) {
      classJoinMessage = error instanceof Error ? `Chưa tải được lớp backend: ${error.message}` : "Chưa tải được lớp backend.";
    }
  }

  async function joinStudentClass(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const joinCode = classJoinCode.trim();
    if (!backendToken || !backendAccount) {
      classJoinMessage = "Đăng nhập học sinh trước khi tham gia lớp.";
      return;
    }
    if (!joinCode) {
      classJoinMessage = "Nhập mã lớp do giáo viên cung cấp.";
      return;
    }
    backendBusy = "join-class";
    try {
      const result = await joinBackendClass(backendToken, { joinCode }, { baseUrl: backendBaseUrl });
      classJoinCode = "";
      classJoinMessage = `Đã tham gia lớp ${result.class.name}.`;
      await loadBackendClassroomAssignments();
    } catch (error) {
      classJoinMessage = error instanceof Error ? error.message : "Không tham gia được lớp.";
    } finally {
      if (backendBusy === "join-class") backendBusy = "";
    }
  }

  async function submitAssignmentEvidenceFor(assignment: ClassroomAssignment): Promise<void> {
    if (!backendToken || !backendAccount) {
      classJoinMessage = "Đăng nhập học sinh trước khi gửi evidence.";
      return;
    }
    backendBusy = "assignment-evidence";
    try {
      const evidence = buildAssignmentEvidenceFromAttempts(assignment, backendAccount.id, assignmentAttempts(assignment));
      await submitBackendAssignmentEvidence(
        backendToken,
        assignment.id,
        {
          studentAccountId: backendAccount.id,
          status: assignmentDone(assignment) ? "completed" : "submitted",
          evidence: { ...evidence },
        },
        { baseUrl: backendBaseUrl },
      );
      classJoinMessage = "Đã gửi evidence assignment cho giáo viên.";
      await loadBackendClassroomAssignments();
    } catch (error) {
      classJoinMessage = error instanceof Error ? `Không gửi được evidence: ${error.message}` : "Không gửi được evidence assignment.";
    } finally {
      if (backendBusy === "assignment-evidence") backendBusy = "";
    }
  }

  function assignmentAttempts(assignment: ClassroomAssignment): AttemptRecord[] {
    const createdAt = Date.parse(assignment.createdAt || "");
    return learner.attempts.filter((attempt) => {
      if (!Number.isFinite(createdAt)) return true;
      const answeredAt = Date.parse(attempt.answeredAt || "");
      return Number.isFinite(answeredAt) && answeredAt >= createdAt;
    });
  }

  function assignmentDone(assignment: ClassroomAssignment): boolean {
    if (assignment.status === "completed") return true;
    const attempts = assignmentAttempts(assignment);
    if (assignment.mode === "diagnostic") return attempts.filter((attempt) => attempt.mode === "diagnostic").length >= 8;
    if (assignment.mode === "proof_review") return attempts.filter((attempt) => attempt.mode === "review").length >= 4;
    if (assignment.mode === "timed_mixed") return attempts.filter((attempt) => attempt.mode === "bluebook").length >= 5;
    const focusedPractice = attempts.filter((attempt) => attempt.mode === "practice" && (!assignment.focusSkill || attempt.skill === assignment.focusSkill));
    return focusedPractice.length >= 5 || attempts.filter((attempt) => attempt.mode === "practice").length >= 8;
  }

  function assignmentDueLabel(assignment: ClassroomAssignment): string {
    if (assignmentDone(assignment)) return "Đã có evidence";
    if (!assignment.dueDate) return "Chưa có hạn nộp";
    const due = new Date(`${assignment.dueDate}T23:59:59`);
    if (Number.isNaN(due.getTime())) return assignment.dueDate;
    const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
    if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
    if (days === 0) return "Hạn hôm nay";
    if (days === 1) return "Hạn ngày mai";
    return `Còn ${days} ngày`;
  }

  function assignmentModeLabel(mode: ClassroomAssignmentMode): string {
    const labels: Record<ClassroomAssignmentMode, string> = {
      diagnostic: "Diagnostic",
      remedial_sprint: "Remedial sprint",
      proof_review: "Sửa lỗi bằng proof",
      timed_mixed: "Timed mixed",
    };
    return labels[mode];
  }

  function assignmentActionLabel(mode: ClassroomAssignmentMode): string {
    const labels: Record<ClassroomAssignmentMode, string> = {
      diagnostic: "Làm diagnostic",
      remedial_sprint: "Làm sprint",
      proof_review: "Sửa lỗi",
      timed_mixed: "Vào Bluebook",
    };
    return labels[mode];
  }

  function startAssignment(assignment: ClassroomAssignment): void {
    if (assignment.mode === "diagnostic") {
      startDiagnostic();
      return;
    }
    if (assignment.mode === "proof_review") {
      startReview();
      return;
    }
    if (assignment.mode === "timed_mixed") {
      startBluebookMode();
      return;
    }
    const focusedSkill = repo?.skills.includes(assignment.focusSkill) ? assignment.focusSkill : "";
    practiceSkill = focusedSkill;
    startPractice(focusedSkill);
  }

  function missionRewardAlreadyClaimed(): boolean {
    if (!rewardState) return false;
    const studentId = defaultRewardStudentId(rewardState);
    const claimed = rewardState.profiles[studentId]?.attendance?.questRewardsClaimed || [];
    return claimed.map(String).includes(missionClaimKey(todayMission));
  }

  function runTodayMission(): void {
    if (todayMission.id === "diagnostic") {
      startDiagnostic();
      return;
    }
    if (todayMission.id === "proof_review") {
      startReview();
      return;
    }
    if (todayMission.id === "focused_sprint") {
      practiceSkill = todayMission.skill || "";
      startPractice(todayMission.skill || "");
      return;
    }
    if (todayMission.id === "vocab") {
      setView("vocab");
      return;
    }
    startBluebookMode();
  }

  function claimTodayMissionReward(): void {
    const base = rewardState || loadRewardState();
    const studentId = defaultRewardStudentId(base);
    if (!studentId) {
      rewardMessage = "Chưa có tài khoản học sinh để cộng điểm.";
      return;
    }
    const applied = applyMissionReward({ ...base.accountState, accounts: base.accounts, profiles: base.profiles }, studentId, todayMission);
    rewardMessage = applied.reason;
    if (!applied.ok) return;
    refreshRewards(
      saveRewardState({
        ...base,
        accountState: applied.state,
        accounts: applied.state.accounts,
        profiles: applied.state.profiles,
      }),
    );
  }

  function setView(view: LearnerState["activeView"]): void {
    if (view === "rewards") refreshRewards();
    learner = { ...learner, activeView: view };
    persist();
  }

  function resetSession(mode: StudyMode, questions: PublicQuestionItem[], view: LearnerState["activeView"]): void {
    syncCurrentExamAnswer();
    activeMode = mode;
    activeQuestions = questions;
    activeIndex = 0;
    selectedAnswer = mode === "bluebook" && questions[0] ? examSelectedAnswers[questions[0].id] || "" : "";
    feedback = null;
    bluebookIntroOpen = false;
    bluebookReviewOpen = false;
    bluebookReviewResults = [];
    startedAt = Date.now();
    setView(view);
  }

  function startDiagnostic(): void {
    if (!repo) return;
    resetSession("diagnostic", buildDiagnosticSet(repo, learner, 20), "diagnostic");
  }

  function bluebookRouteLabel(route: BluebookRoute): string {
    const labels: Record<BluebookRoute, string> = {
      standard: "Nhánh chuẩn",
      hard: "Nhánh nâng độ khó",
      support: "Nhánh củng cố nền",
    };
    return labels[route];
  }

  function bluebookRouteDetail(route: BluebookRoute): string {
    const details: Record<BluebookRoute, string> = {
      standard: "Module cân bằng để đo baseline, pacing và lỗi chính.",
      hard: "Module ưu tiên câu khó để kiểm tra trần 1500+.",
      support: "Module Easy/Medium để sửa nền trước khi tăng áp lực.",
    };
    return details[route];
  }

  function bluebookRouteIntro(route: BluebookRoute, stage = bluebookStage): string {
    if (stage === 1) return "Module 1 chuẩn: hệ thống đo baseline trước khi tự chọn nhánh Module 2.";
    return `Module 2 tự động: ${bluebookRouteDetail(route)}`;
  }

  function buildBluebookQuestions(route: BluebookRoute, focusSkill = "", stage = bluebookStage): PublicQuestionItem[] {
    if (!repo) return [];
    if (stage === 1 && route === "standard") return buildDiagnosticSet(repo, learner, 22);
    const adaptive = buildMixedAdaptiveSet(repo, learner, { route, focusSkill, limit: 22 });
    if (adaptive.length >= 18) return adaptive.slice(0, 22);
    const ids = new Set(adaptive.map((question) => question.id));
    const fallback = buildDiagnosticSet(repo, learner, 22).filter((question) => !ids.has(question.id));
    return [...adaptive, ...fallback].slice(0, 22);
  }

  function startBluebookMode(
    route: BluebookRoute = "standard",
    options: { stage?: BluebookStage; resetHistory?: boolean; focusSkill?: string } = {},
  ): void {
    if (!repo) return;
    const stage = options.stage || 1;
    const questions = buildBluebookQuestions(route, options.focusSkill || "", stage);
    bluebookRoute = route;
    bluebookStage = stage;
    if (options.resetHistory !== false || stage === 1) bluebookModuleHistory = [];
    examRemainingSeconds = BLUEBOOK_MODULE_SECONDS;
    examTimerHidden = false;
    examSelectedAnswers = {};
    flaggedQuestionIds = [];
    promptHighlights = {};
    eliminatedByQuestion = {};
    bluebookIntroOpen = true;
    bluebookReviewOpen = false;
    bluebookReviewResults = [];
    resetSession("bluebook", questions, "bluebook");
    bluebookIntroOpen = true;
    persistBluebookSession();
  }

  function continueBluebookAdaptive(): void {
    if (bluebookReviewComplete) {
      startReview();
      return;
    }
    startBluebookMode(bluebookReviewNextRoute, {
      stage: 2,
      resetHistory: false,
      focusSkill: bluebookReviewWeakSkill,
    });
  }

  function beginBluebookModule(): void {
    if (!activeQuestions.length) return;
    bluebookIntroOpen = false;
    selectedAnswer = currentQuestion ? examSelectedAnswers[currentQuestion.id] || "" : "";
    startedAt = Date.now();
    persistBluebookSession();
  }

  function startPractice(skill = practiceSkill): void {
    if (!repo) return;
    const questions = buildPracticeSet(repo, learner, { skill: skill || undefined, limit: 10 });
    resetSession("practice", questions, "practice");
  }

  function startReview(): void {
    if (!repo) return;
    resetSession("review", buildReviewSet(repo, learner, 8), "review");
  }

  function submitAnswer(): void {
    if (!currentQuestion || !selectedAnswer.trim()) return;
    if (activeMode === "bluebook") {
      saveBluebookAnswerAndAdvance();
      return;
    }
    syncCurrentExamAnswer();
    const recorded = recordAttempt(learner, currentQuestion, selectedAnswer, activeMode, startedAt, {
      contentVersion: repo?.package.contentVersion || learner.lastContentVersion,
    });
    const synced = syncAttemptToAccountProfile(recorded.attempt, recorded.event);
    learner = synced.accountId ? replaceLearningEvent(recorded.state, synced.event) : recorded.state;
    saveSharedLearningEvent(synced.accountId ? synced.event : recorded.event);
    feedback = recorded.attempt;
    persist();
    void syncBackendLearnerProfile("attempt");
  }

  function nextQuestion(): void {
    syncCurrentExamAnswer();
    if (activeIndex + 1 >= activeQuestions.length) {
      if (activeMode === "bluebook") {
        submitBluebookModule();
        return;
      }
      activeQuestions = [];
      feedback = null;
      selectedAnswer = "";
      setView("today");
      return;
    }
    activeIndex += 1;
    selectedAnswer = activeMode === "bluebook" && currentQuestion ? examSelectedAnswers[activeQuestions[activeIndex]?.id || ""] || "" : "";
    feedback = null;
    startedAt = Date.now();
    persistBluebookSession();
  }

  function saveBluebookAnswerAndAdvance(): void {
    if (!currentQuestion || !selectedAnswer.trim()) return;
    syncCurrentExamAnswer();
    if (activeIndex + 1 < activeQuestions.length) {
      jumpToQuestion(activeIndex + 1);
      return;
    }
    submitBluebookModule();
  }

  function submitBluebookModule(): void {
    if (activeMode !== "bluebook" || !activeQuestions.length || bluebookReviewOpen) return;
    syncCurrentExamAnswer();
    const answeredQuestions = activeQuestions.filter((question) => (examSelectedAnswers[question.id] || "").trim());
    if (!answeredQuestions.length) return;
    const elapsedPerAnswer = Math.max(
      5_000,
      Math.min(180_000, Math.round(((BLUEBOOK_MODULE_SECONDS - examRemainingSeconds) * 1000) / Math.max(1, answeredQuestions.length))),
    );
    let nextLearner = learner;
    const results: AttemptRecord[] = [];
    const submittedEvents = [];
    for (const question of answeredQuestions) {
      const answer = (examSelectedAnswers[question.id] || "").trim();
      const recorded = recordAttempt(nextLearner, question, answer, "bluebook", Date.now() - elapsedPerAnswer, {
        contentVersion: repo?.package.contentVersion || learner.lastContentVersion,
      });
      const synced = syncAttemptToAccountProfile(recorded.attempt, recorded.event);
      nextLearner = synced.accountId ? replaceLearningEvent(recorded.state, synced.event) : recorded.state;
      submittedEvents.push(synced.accountId ? synced.event : recorded.event);
      results.push(recorded.attempt);
    }
    learner = nextLearner;
    saveSharedLearningEvents(submittedEvents);
    bluebookReviewResults = results;
    bluebookModuleHistory = [
      ...bluebookModuleHistory,
      {
        stage: bluebookStage,
        route: bluebookRoute,
        accuracy: Math.round((results.filter((attempt) => attempt.correct).length / Math.max(1, results.length)) * 100),
        correct: results.filter((attempt) => attempt.correct).length,
        answered: results.length,
        weakSkill: results.find((attempt) => !attempt.correct)?.skill || results[0]?.skill || "Mixed SAT",
        pacingRisk: buildModule2Readiness(results, {
          moduleQuestionCount: activeQuestions.length,
          questionLookup: (id) => repo?.byId.get(id),
        }).pacing.pacingRisk,
        routeReason: buildModule2Readiness(results, {
          moduleQuestionCount: activeQuestions.length,
          questionLookup: (id) => repo?.byId.get(id),
        }).reason,
        completedAt: new Date().toISOString(),
      },
    ].slice(-2);
    bluebookIntroOpen = false;
    bluebookReviewOpen = true;
    feedback = null;
    selectedAnswer = "";
    clearBluebookSession();
    persist();
    void syncBackendLearnerProfile("bluebook_module");
  }

  function jumpToQuestion(index: number): void {
    if (index < 0 || index >= activeQuestions.length) return;
    syncCurrentExamAnswer();
    activeIndex = index;
    selectedAnswer = examSelectedAnswers[activeQuestions[activeIndex]?.id || ""] || "";
    feedback = null;
    startedAt = Date.now();
    persistBluebookSession();
  }

  function selectAnswer(value: string): void {
    selectedAnswer = value;
    syncCurrentExamAnswer();
  }

  function syncCurrentExamAnswer(): void {
    if (activeMode !== "bluebook" || !currentQuestion) return;
    examSelectedAnswers = { ...examSelectedAnswers, [currentQuestion.id]: selectedAnswer };
    persistBluebookSession();
  }

  function toggleFlag(): void {
    if (!currentQuestion) return;
    const flags = new Set(flaggedQuestionIds);
    if (flags.has(currentQuestion.id)) flags.delete(currentQuestion.id);
    else flags.add(currentQuestion.id);
    flaggedQuestionIds = [...flags];
    persistBluebookSession();
  }

  function togglePromptHighlight(): void {
    if (!currentQuestion) return;
    const rawSelectedText = selectedPromptText(currentQuestion);
    if (!rawSelectedText && currentPromptHighlights.length) {
      promptHighlights = { ...promptHighlights, [currentQuestion.id]: [] };
      persistBluebookSession();
      return;
    }
    const selectedText = rawSelectedText || defaultPromptHighlight(currentQuestion);
    if (!selectedText) return;
    const highlights = new Set(currentPromptHighlights);
    if (highlights.has(selectedText)) highlights.delete(selectedText);
    else highlights.add(selectedText);
    promptHighlights = { ...promptHighlights, [currentQuestion.id]: [...highlights].slice(-4) };
    if (typeof window !== "undefined") window.getSelection()?.removeAllRanges();
    persistBluebookSession();
  }

  function selectedPromptText(question: PublicQuestionItem): string {
    if (typeof window === "undefined") return "";
    const selected = window.getSelection()?.toString().replace(/\s+/g, " ").trim() || "";
    if (!selected || selected.length < 3) return "";
    const prompt = String(question.prompt || "").replace(/\s+/g, " ");
    return prompt.includes(selected) ? selected : "";
  }

  function defaultPromptHighlight(question: PublicQuestionItem): string {
    return String(question.prompt || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 90);
  }

  function promptSegments(prompt: string, highlights: string[]): Array<{ text: string; highlighted: boolean }> {
    const cleanHighlights = [...new Set(highlights.map((item) => item.trim()).filter(Boolean))];
    if (!cleanHighlights.length) return [{ text: prompt, highlighted: false }];
    const ranges: Array<{ start: number; end: number }> = [];
    for (const highlight of cleanHighlights) {
      let start = prompt.indexOf(highlight);
      while (start >= 0) {
        ranges.push({ start, end: start + highlight.length });
        start = prompt.indexOf(highlight, start + highlight.length);
      }
    }
    const merged = ranges
      .sort((a, b) => a.start - b.start || b.end - a.end)
      .reduce<Array<{ start: number; end: number }>>((acc, range) => {
        const last = acc[acc.length - 1];
        if (!last || range.start > last.end) acc.push(range);
        else last.end = Math.max(last.end, range.end);
        return acc;
      }, []);
    if (!merged.length) return [{ text: prompt, highlighted: false }];
    const segments: Array<{ text: string; highlighted: boolean }> = [];
    let cursor = 0;
    for (const range of merged) {
      if (range.start > cursor) segments.push({ text: prompt.slice(cursor, range.start), highlighted: false });
      segments.push({ text: prompt.slice(range.start, range.end), highlighted: true });
      cursor = range.end;
    }
    if (cursor < prompt.length) segments.push({ text: prompt.slice(cursor), highlighted: false });
    return segments;
  }

  function bluebookReviewQuestion(attempt: AttemptRecord): PublicQuestionItem | null {
    return repo?.byId.get(attempt.questionId) || null;
  }

  function bluebookReviewCorrectText(attempt: AttemptRecord): string {
    const question = bluebookReviewQuestion(attempt);
    return question ? correctAnswerText(question) : attempt.correctAnswerText;
  }

  function bluebookReviewExplanation(attempt: AttemptRecord): string {
    const question = bluebookReviewQuestion(attempt);
    return question ? explanationText(question) : "Review this item in the question bank.";
  }

  function toggleEliminatedChoice(letter: string): void {
    if (!currentQuestion) return;
    const choices = new Set(eliminatedByQuestion[currentQuestion.id] || []);
    if (choices.has(letter)) choices.delete(letter);
    else choices.add(letter);
    eliminatedByQuestion = { ...eliminatedByQuestion, [currentQuestion.id]: [...choices] };
    persistBluebookSession();
  }

  function toggleExamTimer(): void {
    examTimerHidden = !examTimerHidden;
    persistBluebookSession();
  }

  function startExamTimer(): void {
    if (examTimerId) return;
    examTimerId = setInterval(() => {
      if (activeMode !== "bluebook" || !activeQuestions.length || feedback || bluebookIntroOpen || bluebookReviewOpen || examRemainingSeconds <= 0) return;
      examRemainingSeconds = Math.max(0, examRemainingSeconds - 1);
      persistBluebookSession();
    }, 1000);
  }

  function bluebookSessionSnapshot(): BluebookSessionSnapshot {
    return {
      version: 1,
      active: true,
      contentVersion: repo?.package.contentVersion || learner.lastContentVersion,
      questionIds: activeQuestions.map((question) => question.id),
      activeIndex,
      route: bluebookRoute,
      stage: bluebookStage,
      introOpen: bluebookIntroOpen,
      remainingSeconds: examRemainingSeconds,
      timerHidden: examTimerHidden,
      selectedAnswers: examSelectedAnswers,
      flaggedQuestionIds,
      promptHighlights,
      eliminatedByQuestion,
      updatedAt: new Date().toISOString(),
    };
  }

  function persistBluebookSession(): void {
    if (activeMode !== "bluebook" || !activeQuestions.length || bluebookReviewOpen) return;
    void saveOfflineValue(BLUEBOOK_SESSION_STORAGE_KEY, bluebookSessionSnapshot());
  }

  function clearBluebookSession(): void {
    void deleteOfflineValue(BLUEBOOK_SESSION_STORAGE_KEY);
  }

  async function restoreBluebookSession(): Promise<void> {
    if (!repo) return;
    try {
      const legacyParsed =
        typeof localStorage === "undefined"
          ? null
          : (JSON.parse(localStorage.getItem(BLUEBOOK_SESSION_STORAGE_KEY) || "null") as Partial<BluebookSessionSnapshot> | null);
      const parsed = await loadOfflineValue<Partial<BluebookSessionSnapshot> | null>(BLUEBOOK_SESSION_STORAGE_KEY, legacyParsed);
      if (!parsed || parsed.version !== 1 || parsed.active !== true || !Array.isArray(parsed.questionIds)) return;
      const questions = parsed.questionIds.map((id) => repo?.byId.get(String(id))).filter(Boolean) as PublicQuestionItem[];
      if (!questions.length) return;
      activeMode = "bluebook";
      activeQuestions = questions;
      activeIndex = Math.max(0, Math.min(questions.length - 1, Number(parsed.activeIndex || 0)));
      bluebookRoute = parsed.route === "hard" || parsed.route === "support" ? parsed.route : "standard";
      bluebookStage = parsed.stage === 2 ? 2 : 1;
      bluebookIntroOpen = Boolean(parsed.introOpen);
      examRemainingSeconds = Math.max(0, Math.min(BLUEBOOK_MODULE_SECONDS, Number(parsed.remainingSeconds || BLUEBOOK_MODULE_SECONDS)));
      examTimerHidden = Boolean(parsed.timerHidden);
      examSelectedAnswers = typeof parsed.selectedAnswers === "object" && parsed.selectedAnswers ? (parsed.selectedAnswers as Record<string, string>) : {};
      flaggedQuestionIds = Array.isArray(parsed.flaggedQuestionIds) ? parsed.flaggedQuestionIds.map(String) : [];
      if (typeof parsed.promptHighlights === "object" && parsed.promptHighlights) {
        promptHighlights = parsed.promptHighlights as Record<string, string[]>;
      } else {
        const legacyHighlighted = Array.isArray(parsed.highlightedQuestionIds) ? parsed.highlightedQuestionIds.map(String) : [];
        promptHighlights = Object.fromEntries(
          legacyHighlighted
            .map((id) => {
              const prompt = repo?.byId.get(id)?.prompt || "";
              return prompt ? [id, [String(prompt).slice(0, 120)]] : null;
            })
            .filter((entry): entry is [string, string[]] => Boolean(entry)),
        );
      }
      eliminatedByQuestion = typeof parsed.eliminatedByQuestion === "object" && parsed.eliminatedByQuestion ? (parsed.eliminatedByQuestion as Record<string, string[]>) : {};
      selectedAnswer = examSelectedAnswers[questions[activeIndex]?.id || ""] || "";
      feedback = null;
      bluebookReviewOpen = false;
      bluebookReviewResults = [];
      learner = { ...learner, activeView: "bluebook" };
    } catch {
      clearBluebookSession();
    }
  }

  function toggleSave(question: PublicQuestionItem): void {
    const saved = new Set(learner.savedQuestionIds);
    if (saved.has(question.id)) saved.delete(question.id);
    else saved.add(question.id);
    learner = { ...learner, savedQuestionIds: [...saved] };
    persist();
  }

  function applyNextAction(): void {
    if (action.view === "diagnostic") startDiagnostic();
    else if (action.view === "review") startReview();
    else startPractice(action.skill || "");
  }

  function startLessonPractice(skill: string): void {
    practiceSkill = skill;
    startPractice(skill);
  }

  function moveVocab(delta: number): void {
    if (!vocabModel.entries.length) return;
    vocabIndex = (vocabIndex + delta + vocabModel.entries.length) % vocabModel.entries.length;
    vocabFlipped = false;
    vocabSelectedDefinition = "";
    vocabFeedback = "";
  }

  function markCurrentVocabKnown(): void {
    if (!currentVocab) return;
    learner = toggleVocabKnown(learner, currentVocab.id);
    persistTools();
  }

  function submitVocabQuiz(): void {
    if (!currentVocab || !vocabSelectedDefinition) return;
    const result = recordVocabQuizAttempt(learner, currentVocab, vocabSelectedDefinition);
    learner = result.state;
    vocabFeedback = result.attempt.correct ? "Đúng. Từ này đã sẵn sàng đưa vào lịch ôn giữ kiến thức." : "Xem lại đúng nghĩa trước khi chuyển tiếp.";
    persistTools();
  }

  function submitOfficialLog(event: SubmitEvent): void {
    event.preventDefault();
    learner = addOfficialExamLog(learner, officialForm);
    officialForm = { ...officialForm, notes: "" };
    persistTools();
  }

  function deleteOfficialLog(logId: string): void {
    learner = removeOfficialExamLog(learner, logId);
    persistTools();
  }

  function clearProgress(): void {
    learner = { ...emptyLearnerState(), lastContentVersion: learner.lastContentVersion };
    activeQuestions = [];
    feedback = null;
    selectedAnswer = "";
    persist();
    void syncBackendLearnerProfile("reset");
  }

  function rememberBackendSession(result: Record<string, unknown>, message: string): void {
    const account = normalizeBackendAccount(result.account);
    const token = result.cookieAuth ? PUBLIC_BACKEND_COOKIE_SESSION : String(result.token || backendToken || PUBLIC_BACKEND_COOKIE_SESSION);
    if (!account || !token) throw new Error("Backend session response is incomplete.");
    backendToken = token;
    backendAccount = account;
    setBackendToken(token);
    const loaded = loadPublicBackendState();
    savePublicBackendState(loaded.accountState, {
      ...loaded.backend,
      baseUrl: backendBaseUrl,
      account,
      sessionExpiresAt: Number(result.expiresAt || loaded.backend.sessionExpiresAt || 0),
      lastLearningSyncMode: "backend",
      statusLevel: "ok",
      statusTitle: "Phiên server đang hoạt động",
      statusMessage: message,
    });
    backendMessage = message;
  }

  async function refreshBackendIdentity(): Promise<void> {
    try {
      const result = await getBackendMe(backendToken, { baseUrl: backendBaseUrl });
      const account = normalizeBackendAccount(result.account);
      if (account) backendAccount = account;
      backendMessage = account ? `Đã kết nối: ${account.username || account.displayName || account.id}.` : backendMessage;
    } catch (error) {
      backendToken = "";
      backendAccount = null;
      setBackendToken("");
      backendMessage = error instanceof Error ? `Phiên đăng nhập đã hết hạn. ${error.message}` : "Phiên đăng nhập đã hết hạn.";
    }
  }

  async function submitBackendAuth(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!backendUsername || !backendPassword) {
      backendMessage = "Nhập tên đăng nhập và mật khẩu.";
      return;
    }
    backendBusy = backendAuthMode;
    try {
      const result =
        backendAuthMode === "signup"
          ? await signupBackend({ username: backendUsername, password: backendPassword, displayName: backendDisplayName || backendUsername, role: "student" }, { baseUrl: backendBaseUrl })
          : await loginBackend({ username: backendUsername, password: backendPassword }, { baseUrl: backendBaseUrl });
      backendPassword = "";
      rememberBackendSession(result, backendAuthMode === "signup" ? "Đã tạo tài khoản học sinh và bật đồng bộ." : "Đã đăng nhập và bật đồng bộ.");
      void syncBackendLearnerProfile("auth");
      await loadBackendClassroomAssignments();
      const contentPackage = await loadStudentContentPackage();
      repo = createQuestionRepository(contentPackage);
      learner = { ...learner, lastContentVersion: contentPackage.contentVersion };
      persist();
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Không đăng nhập được backend.";
    } finally {
      backendBusy = "";
    }
  }

  async function logoutPublicAccount(): Promise<void> {
    backendBusy = "logout";
    try {
      if (backendToken) await logoutBackend(backendToken, { baseUrl: backendBaseUrl });
    } catch {
      // A stale or already-revoked token should still be cleared locally.
    } finally {
      backendToken = "";
      backendAccount = null;
      backendClasses = [];
      classJoinMessage = "";
      setBackendToken("");
      const loaded = loadPublicBackendState();
      savePublicBackendState(loaded.accountState, {
        ...loaded.backend,
        account: null,
        sessionExpiresAt: 0,
        lastLearningSyncMode: "local",
        statusLevel: "warning",
        statusTitle: "Chế độ máy này",
        statusMessage: "Đã xóa phiên backend khỏi trình duyệt này.",
      });
      backendMessage = "Đã đăng xuất backend. Tiến trình local vẫn giữ trên máy này.";
      backendBusy = "";
    }
  }

  function backendProfilePayload(reason: string): Record<string, unknown> {
    return {
      schemaVersion: "sat_student_profile_v2_learning_evidence",
      syncContractVersion: "sat_profile_v2_learning_evidence",
      accountId: backendAccount?.id || "",
      reason,
      summary: backendProgressPayload(),
      profile: {
        attempts: learner.attempts,
        learningEvents: learner.learningEvents,
        learningEventRevision: learner.learningEventRevision,
        learningEventUpdatedAt: learner.learningEventUpdatedAt,
        officialLogs: learner.officialExamLogs,
        vocabKnown: learner.knownVocabIds,
        vocabQuizAttempts: learner.vocabQuizAttempts,
        savedQuestionIds: learner.savedQuestionIds,
        targetScore: learner.targetScore,
        lastContentVersion: learner.lastContentVersion,
      },
      clientUpdatedAt: new Date().toISOString(),
    };
  }

  function backendProgressPayload(): Record<string, unknown> {
    return {
      targetScore: learner.targetScore,
      estimatedBand: estimatedBand(learner),
      attempts: learner.attempts.length,
      correctAttempts: learner.attempts.filter((attempt) => attempt.correct).length,
      openMistakes: learner.attempts.filter((attempt) => !attempt.correct).length,
      learningEvents: learner.learningEvents.length,
      officialLogs: learner.officialExamLogs.length,
      contentVersion: learner.lastContentVersion,
      contentSource,
      updatedAt: new Date().toISOString(),
    };
  }

  function backendSyncRevision(): number {
    return learner.attempts.length + learner.learningEvents.length + learner.vocabQuizAttempts.length + learner.officialExamLogs.length;
  }

  async function loadBackendSyncQueue(): Promise<BackendSyncQueueItem[]> {
    try {
      const legacyParsed =
        typeof localStorage === "undefined"
          ? []
          : (JSON.parse(localStorage.getItem(BACKEND_SYNC_QUEUE_STORAGE_KEY) || "[]") as BackendSyncQueueItem[]);
      const parsed = await loadOfflineValue<BackendSyncQueueItem[]>(BACKEND_SYNC_QUEUE_STORAGE_KEY, legacyParsed);
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.accountId && item.profilePayload && item.progressPayload).slice(-25) : [];
    } catch {
      return [];
    }
  }

  async function saveBackendSyncQueue(items: BackendSyncQueueItem[]): Promise<void> {
    const trimmed = items.slice(-25);
    await saveOfflineValue(BACKEND_SYNC_QUEUE_STORAGE_KEY, trimmed);
    offlineQueueCount = trimmed.length;
  }

  async function enqueueBackendSync(reason: string, profilePayload: Record<string, unknown>, progressPayload: Record<string, unknown>, clientRevision: number): Promise<void> {
    if (!backendAccount) return;
    const queue = await loadBackendSyncQueue();
    queue.push({
      id: `sync-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      accountId: backendAccount.id,
      reason,
      clientRevision,
      profilePayload,
      progressPayload,
      createdAt: new Date().toISOString(),
    });
    await saveBackendSyncQueue(queue);
  }

  async function pushBackendPayloads(
    accountId: string,
    profilePayload: Record<string, unknown>,
    progressPayload: Record<string, unknown>,
    clientRevision: number,
  ): Promise<Record<string, unknown>> {
    const profileResult = await saveBackendProfile(backendToken, accountId, profilePayload, {
      baseUrl: backendBaseUrl,
      clientRevision,
      mergeStrategy: "client_wins",
    });
    await saveBackendProgress(backendToken, accountId, progressPayload, { baseUrl: backendBaseUrl });
    return profileResult;
  }

  async function flushQueuedBackendSync(): Promise<void> {
    if (!backendToken || !backendAccount) return;
    const queue = await loadBackendSyncQueue();
    if (!queue.length) return;
    const remaining: BackendSyncQueueItem[] = [];
    let latestProfileResult: Record<string, unknown> | null = null;
    for (const item of queue) {
      if (item.accountId !== backendAccount.id) {
        remaining.push(item);
        continue;
      }
      try {
        latestProfileResult = await pushBackendPayloads(item.accountId, item.profilePayload, item.progressPayload, item.clientRevision);
      } catch {
        remaining.push(item);
      }
    }
    await saveBackendSyncQueue(remaining);
    if (latestProfileResult) {
      const loaded = loadPublicBackendState();
      savePublicBackendState(loaded.accountState, {
        ...loaded.backend,
        baseUrl: backendBaseUrl,
        account: backendAccount,
        lastLearningSyncAt: new Date().toISOString(),
        lastLearningSyncReason: "queued_flush",
        lastLearningSyncMode: "backend",
        lastServerProfileRevision: Number(latestProfileResult.serverRevision || loaded.backend.lastServerProfileRevision || 0),
        statusLevel: "ok",
        statusTitle: "Đã gửi dữ liệu chờ đồng bộ",
        statusMessage: "Các lượt học offline đã được đồng bộ lại.",
      });
      backendMessage = "Các lượt học offline đã được đồng bộ lại.";
    }
  }

  async function syncBackendLearnerProfile(reason = "manual", allowQueue = true): Promise<void> {
    if (!backendToken || !backendAccount) return;
    backendBusy = backendBusy || "sync";
    const revision = backendSyncRevision();
    const profilePayload = backendProfilePayload(reason);
    const progressPayload = backendProgressPayload();
    try {
      await flushQueuedBackendSync();
      const profileResult = await pushBackendPayloads(backendAccount.id, profilePayload, progressPayload, revision);
      const loaded = loadPublicBackendState();
      savePublicBackendState(loaded.accountState, {
        ...loaded.backend,
        baseUrl: backendBaseUrl,
        account: backendAccount,
        lastLearningSyncAt: new Date().toISOString(),
        lastLearningSyncReason: reason,
        lastLearningSyncMode: "backend",
        lastServerProfileRevision: Number(profileResult.serverRevision || loaded.backend.lastServerProfileRevision || 0),
        statusLevel: "ok",
        statusTitle: "Đã đồng bộ hồ sơ học tập",
        statusMessage: `Đã đồng bộ ${learner.attempts.length} lượt làm và ${learner.learningEvents.length} sự kiện học tập.`,
      });
      backendMessage = `Đã đồng bộ ${learner.attempts.length} lượt làm và ${learner.learningEvents.length} sự kiện học tập.`;
    } catch (error) {
      if (allowQueue) await enqueueBackendSync(reason, profilePayload, progressPayload, revision);
      backendMessage = error instanceof Error ? `Đồng bộ backend lỗi, đã lưu vào hàng chờ: ${error.message}` : "Đồng bộ backend lỗi, đã lưu vào hàng chờ.";
    } finally {
      if (backendBusy === "sync") backendBusy = "";
    }
  }

  function defaultRewardStudentId(state: RewardState): string {
    const active = state.accounts.find((account) => account.id === state.accountState.activeAccountId && account.role === "student");
    const demo = state.accounts.find((account) => account.id === "student-demo" && account.role === "student");
    return active?.id || demo?.id || state.accounts.find((account) => account.role === "student")?.id || "";
  }

  function refreshRewards(state: RewardState = loadRewardState()): void {
    rewardState = state;
    rewardStore = buildStudentRewardStoreModel(state, defaultRewardStudentId(state));
  }

  function redeemReward(programId: string): void {
    if (!rewardState || !rewardStore?.student) return;
    const result = redeemRewardProgram(rewardState, programId, rewardStore.student.id);
    rewardMessage = result.reason;
    if (!result.ok) return;
    refreshRewards(saveRewardState(result.state));
  }
</script>

<main class="student-app">
  <header class="topbar">
    <div>
      <p class="eyebrow">SAT Studio</p>
      <h1>Hôm nay</h1>
    </div>
    <nav aria-label="Student sections">
      <button class:active={learner.activeView === "today"} type="button" on:click={() => setView("today")}>Hôm nay</button>
      <button class:active={learner.activeView === "diagnostic"} type="button" on:click={startDiagnostic}>Chẩn đoán</button>
      <button class:active={learner.activeView === "bluebook"} type="button" on:click={() => startBluebookMode()}>Bluebook</button>
      <button class:active={learner.activeView === "practice"} type="button" on:click={() => startPractice()}>Luyện tập</button>
      <button class:active={learner.activeView === "review"} type="button" on:click={startReview}>Sửa lỗi</button>
      <button class:active={learner.activeView === "lessons"} type="button" on:click={() => setView("lessons")}>Bài học</button>
      <button class:active={learner.activeView === "vocab"} type="button" on:click={() => setView("vocab")}>Từ vựng</button>
      <button class:active={learner.activeView === "official"} type="button" on:click={() => setView("official")}>Điểm thi</button>
      <button class:active={learner.activeView === "news"} type="button" on:click={() => setView("news")}>Tin báo</button>
      <button class:active={learner.activeView === "rewards"} type="button" on:click={() => setView("rewards")}>Thưởng</button>
    </nav>
  </header>

  {#if loading}
    <section class="state-panel">Đang tải kho câu hỏi SAT công khai...</section>
  {:else if loadError}
    <section class="state-panel error">{loadError}</section>
  {:else}
    {#if learner.activeView === "today"}
      <section class:baseline-grid={!hasBaseline} class="today-grid" aria-label="Today dashboard">
        <div class="focus-panel">
          <p class="eyebrow">{hasBaseline ? "Việc nên làm tiếp theo" : "Bắt đầu đúng điểm xuất phát"}</p>
          <h2>{hasBaseline ? action.label : "Làm chẩn đoán 20 câu"}</h2>
          <p>{hasBaseline ? action.detail : "SAT Studio sẽ dùng bài chẩn đoán ngắn để tìm 3-5 kỹ năng yếu đầu tiên, rồi mở lộ trình luyện tập phù hợp."}</p>
          <button class="primary" type="button" on:click={hasBaseline ? applyNextAction : startDiagnostic}>{hasBaseline ? action.label : "Bắt đầu chẩn đoán"}</button>
        </div>

        {#if hasBaseline}
          <div class="metrics">
            <article>
              <span>{band}</span>
              <small>Band ước tính</small>
            </article>
            <article>
              <span>{totalCorrect}/{learner.attempts.length}</span>
              <small>Câu đã làm đúng</small>
            </article>
            <article>
              <span>{dueMistakes}</span>
              <small>Lỗi cần sửa</small>
            </article>
            <article>
              <span>{packageCount}</span>
              <small>Câu sẵn sàng luyện</small>
            </article>
            <article>
              <span>{contentSource.includes("server") ? "Server" : "Local"}</span>
              <small>Nguồn nội dung</small>
            </article>
            <article>
              <span>{eventSummary.total}</span>
              <small>Dữ liệu học tập</small>
            </article>
          </div>
        {/if}

        <section class="panel mission-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Nhiệm vụ hôm nay</p>
              <h2>{todayMission.title}</h2>
            </div>
            <span>+{todayMission.rewardPoints} điểm</span>
          </div>
          <p>{todayMission.detail}</p>
          <div class="streak-strip" aria-label="Study streak">
            <strong>{studentStreakCount} ngày streak</strong>
            <span>{studentFreezeCredits} streak-freeze</span>
          </div>
          <div class="answer-bar mission-actions">
            {#if todayMissionDone}
              <button class="primary" disabled={todayMissionClaimed} type="button" on:click={claimTodayMissionReward}>
                {todayMissionClaimed ? "Đã nhận thưởng" : "Nhận thưởng"}
              </button>
              <small>{todayMissionClaimed ? "Điểm đã được cộng cho nhiệm vụ hôm nay." : "Hoàn thành rồi. Nhận điểm để giữ streak."}</small>
            {:else}
              <button class="primary" type="button" on:click={runTodayMission}>{todayMission.actionLabel}</button>
              <small>Hoàn thành nhiệm vụ để mở thưởng và cập nhật streak.</small>
            {/if}
          </div>
          {#if rewardMessage}
            <div class="reward-message compact">{rewardMessage}</div>
          {/if}
        </section>

        <section class="panel public-account-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Tài khoản học sinh</p>
              <h2>{backendConnected ? "Đang đồng bộ tiến trình" : "Đăng nhập để đồng bộ"}</h2>
            </div>
            <span>{backendConnected ? backendAccount?.username || backendAccount?.displayName || backendAccount?.id : "Chế độ máy này"}</span>
          </div>
          {#if backendConnected}
            <p class="muted">{backendMessage}</p>
            {#if offlineQueueCount}
              <p class="sync-queue-note">{offlineQueueCount} lượt đồng bộ đang chờ mạng ổn định.</p>
            {/if}
            <div class="answer-bar account-actions">
              <button disabled={Boolean(backendBusy)} type="button" on:click={() => syncBackendLearnerProfile("manual")}>Đồng bộ ngay</button>
              <button disabled={Boolean(backendBusy)} type="button" on:click={loadBackendClassroomAssignments}>Tải lớp</button>
              <button disabled={Boolean(backendBusy)} type="button" on:click={logoutPublicAccount}>Đăng xuất</button>
            </div>
            <form class="class-join-row" on:submit={joinStudentClass}>
              <label>
                Mã lớp
                <input bind:value={classJoinCode} placeholder="SAT-ABC123" />
              </label>
              <button class="primary" disabled={Boolean(backendBusy)} type="submit">Tham gia lớp</button>
              <small>{backendClasses.length ? `${backendClasses.length} lớp đang liên kết` : "Nhập mã lớp của giáo viên để nhận assignment."}</small>
            </form>
            {#if classJoinMessage}
              <p class="muted">{classJoinMessage}</p>
            {/if}
          {:else}
            <form class="backend-auth-form" on:submit={submitBackendAuth}>
              <label>
                Chế độ
                <select bind:value={backendAuthMode}>
                  <option value="login">Đăng nhập</option>
                  <option value="signup">Tạo tài khoản</option>
                </select>
              </label>
              {#if backendAuthMode === "signup"}
                <label>
                  Tên
                  <input bind:value={backendDisplayName} autocomplete="name" placeholder="Tên học sinh" />
                </label>
              {/if}
              <label>
                Tên đăng nhập
                <input bind:value={backendUsername} autocomplete="username" placeholder="ten_hoc_sinh" />
              </label>
              <label>
                Mật khẩu
                <input bind:value={backendPassword} autocomplete={backendAuthMode === "signup" ? "new-password" : "current-password"} type="password" />
              </label>
              <button class="primary" disabled={Boolean(backendBusy)} type="submit">{backendAuthMode === "signup" ? "Tạo và đồng bộ" : "Đăng nhập"}</button>
            </form>
            <p class="muted">{backendMessage}</p>
          {/if}
        </section>

        <section class="panel assignment-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Bài được giao</p>
              <h2>{openClassroomAssignments.length ? "Việc cần xử lý hôm nay" : "Không còn bài mở"}</h2>
            </div>
            <span>{openClassroomAssignments.length ? `${openClassroomAssignments.length} việc mở` : "Sạch queue"}</span>
          </div>
          {#if visibleClassroomAssignments.length}
            <div class="assignment-cards">
              {#each visibleClassroomAssignments as assignment}
                <article class:completed={assignmentDone(assignment)}>
                  <div>
                    <small>{assignmentModeLabel(assignment.mode)} · {assignmentDueLabel(assignment)}</small>
                    <strong>{assignment.title}</strong>
                    <p>{assignment.focusSkill}</p>
                  </div>
                  {#if assignmentDone(assignment)}
                    <button disabled={backendBusy === "assignment-evidence"} type="button" on:click={() => submitAssignmentEvidenceFor(assignment)}>Gửi evidence</button>
                  {:else}
                    <button type="button" on:click={() => startAssignment(assignment)}>{assignmentActionLabel(assignment.mode)}</button>
                  {/if}
                </article>
              {/each}
            </div>
          {:else}
            <div class="empty">Chưa có bài được giao từ phụ huynh hoặc coach. Hệ thống vẫn route theo next best action của học sinh.</div>
          {/if}
        </section>

        {#if hasBaseline}
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Trọng tâm kỹ năng</p>
                <h2>Đường luyện ngắn nhất</h2>
              </div>
              <button type="button" on:click={clearProgress}>Xóa tiến trình local</button>
            </div>
            {#if rows.length}
              <div class="skill-list">
                {#each rows.slice(0, 6) as row}
                  <article class="skill-row">
                    <div>
                      <strong>{row.skill}</strong>
                      <small>{row.section} · {row.domain}</small>
                    </div>
                    <span>{row.accuracy}%</span>
                    <em>{row.status}</em>
                    <button type="button" on:click={() => startPractice(row.skill)}>Luyện</button>
                  </article>
                {/each}
              </div>
            {:else}
              <div class="empty">Làm chẩn đoán trước. Lộ trình kỹ năng chỉ mở khi có dữ liệu thật.</div>
            {/if}
          </section>
        {/if}
      </section>
    {:else if learner.activeView === "lessons"}
      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Thư viện bài học</p>
            <h2>Bài học theo kỹ năng</h2>
          </div>
          <span>{lessonCards.length} bài học</span>
        </div>
        <div class="lesson-grid">
          {#each lessonCards as lesson}
            <article class={`lesson-${lesson.level}`}>
              <div>
                <span>{lesson.level}</span>
                <h3>{lesson.title}</h3>
                <small>{lesson.section} / {lesson.domain}</small>
                <p>{lesson.reason}</p>
              </div>
              <div class="lesson-footer">
                <strong>{lesson.questionCount} câu · {lesson.hardCount} câu khó</strong>
                <button type="button" on:click={() => startLessonPractice(lesson.skill)}>Luyện kỹ năng</button>
              </div>
              <div class="resource-links" aria-label="resource links">
                {#each lesson.resources as resource}
                  <a href={resource.url} rel="noreferrer" target="_blank">{resource.label}</a>
                {/each}
              </div>
            </article>
          {/each}
        </div>
      </section>
    {:else if learner.activeView === "vocab"}
      <section class="vocab-dashboard">
        <section class="focus-panel">
          <p class="eyebrow">Flashcard từ vựng</p>
          <h2>{currentVocab?.word || "No word"}</h2>
          {#if currentVocab}
            <button class="flashcard" type="button" on:click={() => (vocabFlipped = !vocabFlipped)}>
              {#if vocabFlipped}
                <strong>{currentVocab.definition}</strong>
                <span>{currentVocab.example}</span>
                <small>{currentVocab.trapNote}</small>
              {:else}
                <strong>{currentVocab.partOfSpeech}</strong>
                <span>{currentVocab.category}</span>
                <small>Bấm để lật thẻ.</small>
              {/if}
            </button>
          {/if}
          <div class="answer-bar">
            <button type="button" on:click={() => moveVocab(-1)}>Từ trước</button>
            <button type="button" on:click={markCurrentVocabKnown}>{currentVocab && learner.knownVocabIds.includes(currentVocab.id) ? "Đưa lại vào học" : "Đã thuộc"}</button>
            <button type="button" on:click={() => moveVocab(1)}>Từ tiếp</button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">SAT Vocabulary</p>
              <h2>{vocabModel.learning} đang học · {vocabModel.known} đã thuộc</h2>
            </div>
            <strong>{vocabModel.accuracy}% đúng quiz</strong>
          </div>
          <div class="tool-filter-row">
            <label>
              Nhóm từ
              <select bind:value={vocabCategory} on:change={() => (vocabIndex = 0)}>
                {#each vocabModel.categories as category}
                  <option value={category}>{category}</option>
                {/each}
              </select>
            </label>
            <label>
              Tìm từ
              <input bind:value={vocabSearch} on:input={() => (vocabIndex = 0)} />
            </label>
            <label class="check-line">
              <input bind:checked={vocabHideKnown} type="checkbox" on:change={() => (vocabIndex = 0)} />
              Ẩn từ đã thuộc
            </label>
          </div>
          {#if currentVocab}
            <div class="vocab-quiz">
              <strong>Quiz nhanh</strong>
              {#each currentVocabChoices as choice}
                <label class:chosen={vocabSelectedDefinition === choice}>
                  <input bind:group={vocabSelectedDefinition} name="vocab-definition" type="radio" value={choice} />
                  <span>{choice}</span>
                </label>
              {/each}
              <div class="answer-bar">
                <button class="primary" disabled={!vocabSelectedDefinition} type="button" on:click={submitVocabQuiz}>Kiểm tra</button>
                {#if vocabFeedback}
                  <span>{vocabFeedback}</span>
                {/if}
              </div>
            </div>
          {/if}
          <div class="vocab-word-list">
            {#each vocabModel.entries.slice(0, 8) as entry}
              <article>
                <strong>{entry.word}</strong>
                <span>{entry.definition}</span>
                <small>{entry.category}</small>
              </article>
            {/each}
          </div>
        </section>
      </section>
    {:else if learner.activeView === "official"}
      <section class="official-grid">
        <section class="focus-panel">
          <p class="eyebrow">Rà soát điểm thi</p>
          <h2>{examModel.latestScore || "Chưa có điểm thi"}</h2>
          <p>{examModel.recommendation}</p>
          <div class="fact-grid">
            <article><small>Cao nhất</small><strong>{examModel.bestScore || "--"}</strong></article>
            <article><small>Cách mục tiêu</small><strong>{examModel.targetGap || "--"}</strong></article>
            <article><small>Xu hướng</small><strong>{examModel.trend}</strong></article>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Nhật ký điểm thi</p>
              <h2>Hiệu chỉnh bằng điểm Bluebook/practice test</h2>
            </div>
          </div>
          <form class="official-form" on:submit={submitOfficialLog}>
            <label>
              Ngày thi
              <input bind:value={officialForm.testDate} required type="date" />
            </label>
            <label>
              Nguồn
              <select bind:value={officialForm.source}>
                <option value="Bluebook">Bluebook</option>
                <option value="Khan Academy">Khan Academy</option>
                <option value="Practice Test">Practice Test</option>
                <option value="Other">Khác</option>
              </select>
            </label>
            <label>
              Điểm RW
              <input bind:value={officialForm.rwScore} max="800" min="200" step="10" type="number" />
            </label>
            <label>
              Điểm Math
              <input bind:value={officialForm.mathScore} max="800" min="200" step="10" type="number" />
            </label>
            <label class="full-span">
              Ghi chú
              <input bind:value={officialForm.notes} placeholder="Tốc độ, mệt section, lỗi bất cẩn..." />
            </label>
            <button class="primary" type="submit">Lưu điểm thi</button>
          </form>
          <div class="official-list">
            {#each examModel.logs.slice().reverse().slice(0, 6) as log}
              <article>
                <div>
                  <strong>{log.totalScore}</strong>
                  <small>{log.source} · {log.testDate} · RW {log.rwScore} / Math {log.mathScore}</small>
                  {#if log.notes}
                    <p>{log.notes}</p>
                  {/if}
                </div>
                <button type="button" on:click={() => deleteOfficialLog(log.id)}>Xóa</button>
              </article>
            {/each}
            {#if examModel.logs.length === 0}
              <div class="empty">Thêm một kết quả Bluebook hoặc practice test chính thức để hiệu chỉnh lộ trình.</div>
            {/if}
          </div>
        </section>
      </section>
    {:else if learner.activeView === "news"}
      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Tin báo</p>
            <h2>Thông báo mới</h2>
          </div>
          <button type="button" on:click={() => (announcementState = loadAnnouncementState())}>Tải lại</button>
        </div>
        <div class="announcement-list">
          {#each studentAnnouncements as post}
            <article class:pinned={post.pinned}>
              <span>{post.audience}</span>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <small>{post.updatedAt}</small>
            </article>
          {/each}
          {#if studentAnnouncements.length === 0}
            <div class="empty">Chưa có thông báo công khai.</div>
          {/if}
        </div>
      </section>
    {:else if learner.activeView === "rewards" && rewardStore}
      <section class="reward-dashboard">
        <section class="focus-panel reward-balance">
          <p class="eyebrow">Kho phần thưởng</p>
          <h2>{rewardStore.availablePoints} điểm khả dụng</h2>
          <p>{rewardStore.student ? `${rewardStore.student.name} có thể đổi thưởng sau khi tích điểm từ luyện SAT.` : "Chưa có tài khoản học sinh để đổi thưởng."}</p>
          <div class="streak-strip reward-streak">
            <strong>{studentStreakCount} ngày streak</strong>
            <span>{studentFreezeCredits} streak-freeze</span>
          </div>
          {#if rewardMessage}
            <div class="reward-message">{rewardMessage}</div>
          {/if}
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Phần thưởng</p>
              <h2>{rewardStore.programs.length} chương trình đang mở</h2>
            </div>
            <button type="button" on:click={() => refreshRewards()}>Tải lại</button>
          </div>
          <div class="reward-grid">
            {#each rewardStore.programs as program}
              <article class:locked={!program.affordable || program.pending} class="reward-card">
                <div>
                  <span>{program.rewardType}</span>
                  <h3>{program.title}</h3>
                  <p>{program.description || "Parent/admin reward"}</p>
                </div>
                <div class="reward-card-footer">
                  <strong>{program.costPoints} pts</strong>
                  <button class:primary={program.affordable && !program.pending} disabled={!program.affordable || program.pending} type="button" on:click={() => redeemReward(program.id)}>
                    {program.pending ? "Đang chờ" : program.affordable ? "Đổi thưởng" : "Chưa đủ điểm"}
                  </button>
                </div>
              </article>
            {/each}
            {#if rewardStore.programs.length === 0}
              <div class="empty">Chưa có phần thưởng đang mở.</div>
            {/if}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Lịch sử đổi thưởng</p>
              <h2>{rewardStore.claims.length} yêu cầu</h2>
            </div>
          </div>
          <div class="reward-claim-list">
            {#each rewardStore.claims.slice(0, 8) as row}
              <article class={`claim-${row.claim.status}`}>
                <div>
                  <strong>{row.programTitle}</strong>
                  <small>{row.claim.costPoints} pts</small>
                </div>
                <span>{row.claim.status}</span>
              </article>
            {/each}
            {#if rewardStore.claims.length === 0}
              <div class="empty">Chưa có yêu cầu đổi thưởng.</div>
            {/if}
          </div>
        </section>
      </section>
    {:else}
      <section class="workbench">
        <aside class="session-panel">
          <p class="eyebrow">{learner.activeView === "bluebook" ? "Mô phỏng Bluebook" : activeMode}</p>
          <h2>{activeQuestions.length ? `${activeIndex + 1}/${activeQuestions.length}` : "Sẵn sàng"}</h2>
          {#if learner.activeView === "bluebook"}
            <div class:warning={bluebookTimerWarning} class="exam-timer">
              <small>Thời gian module</small>
              <strong>{examTimerHidden ? "--:--" : examTimeLabel}</strong>
              <button type="button" on:click={toggleExamTimer}>{examTimerHidden ? "Hiện giờ" : "Ẩn giờ"}</button>
              {#if bluebookTimerWarning && !examTimerHidden}
                <em>Còn dưới 5 phút. Ưu tiên câu chưa trả lời.</em>
              {/if}
            </div>
            <div class="bluebook-module-card">
              <span>Module {bluebookStage} · {bluebookRouteLabel(bluebookRoute)}</span>
              <p>{bluebookRouteIntro(bluebookRoute)}</p>
              <div class="bluebook-progress" aria-label="Bluebook module progress">
                <i style={`width: ${bluebookProgressPct}%`}></i>
              </div>
              <div class="bluebook-stats">
                <strong>{bluebookAnsweredCount} trả lời</strong>
                <strong>{bluebookSkippedCount} bỏ trống</strong>
                <strong>{bluebookFlaggedCount} đánh dấu</strong>
              </div>
            </div>
            <div class="bluebook-route-actions" aria-label="Bluebook adaptive routing">
              <span>Route tự động sau Module 1</span>
            </div>
            <button class="primary" type="button" on:click={() => startBluebookMode()}>{activeQuestions.length ? "Làm lại từ Module 1" : "Bắt đầu mô phỏng"}</button>
            {#if activeQuestions.length}
              <div class="question-navigator" aria-label="Bluebook question navigator">
                {#each activeQuestions as question, index}
                  <button
                    class:active={index === activeIndex}
                    class:answered={Boolean(examSelectedAnswers[question.id])}
                    class:flagged={flaggedQuestionIds.includes(question.id)}
                    type="button"
                    on:click={() => jumpToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                {/each}
              </div>
            {/if}
          {:else if learner.activeView === "practice"}
            <label>
              Lọc kỹ năng
              <select bind:value={practiceSkill}>
                <option value="">Trộn kỹ năng</option>
                {#each repo?.skills || [] as skill}
                  <option value={skill}>{skill}</option>
                {/each}
              </select>
            </label>
            <button class="primary" type="button" on:click={() => startPractice()}>Bắt đầu sprint</button>
          {:else if learner.activeView === "diagnostic"}
            <button class="primary" type="button" on:click={startDiagnostic}>Bắt đầu chẩn đoán 20 câu</button>
          {:else}
            <button class="primary" type="button" on:click={startReview}>Bắt đầu sửa lỗi</button>
          {/if}
        </aside>

        <section class:bluebook-exam-surface={learner.activeView === "bluebook"} class="question-panel">
          {#if learner.activeView === "bluebook" && bluebookIntroOpen && activeQuestions.length}
            <section class="bluebook-intro-panel">
              <div>
                <p class="eyebrow">Hướng dẫn module Bluebook</p>
                <h2>Module {bluebookStage}: {bluebookRouteLabel(bluebookRoute)}</h2>
                <p>{bluebookRouteIntro(bluebookRoute)}</p>
              </div>
              <div class="bluebook-direction-grid">
                <article>
                  <strong>{activeQuestions.length} câu</strong>
                  <span>Đi theo một module rút gọn, đủ dài để đo pacing nhưng vẫn phù hợp daily practice.</span>
                </article>
                <article>
                  <strong>{Math.floor(BLUEBOOK_MODULE_SECONDS / 60)} phút</strong>
                  <span>Timer chỉ bắt đầu khi bấm vào module. Có thể ẩn giờ như Bluebook thật.</span>
                </article>
                <article>
                  <strong>Công cụ</strong>
                  <span>Đánh dấu, highlight, gạch lựa chọn và Desmos nằm ngay trong bề mặt làm bài.</span>
                </article>
              </div>
              <div class="bluebook-intro-actions">
                <button type="button" on:click={() => setView("today")}>Về dashboard</button>
                <button class="primary" type="button" on:click={beginBluebookModule}>Bắt đầu module</button>
              </div>
            </section>
          {:else if learner.activeView === "bluebook" && bluebookReviewOpen}
            <section class="bluebook-review-panel">
              <div class="bluebook-review-hero">
                <div>
                  <p class="eyebrow">Báo cáo module Bluebook</p>
                  <h2>{bluebookCorrectCount}/{bluebookReviewResults.length} đúng · {bluebookReviewAccuracy}%</h2>
                  <p>{bluebookAnsweredCount} câu đã trả lời. {bluebookReviewNextStep}</p>
                </div>
                <div class="review-score-ring">
                  <span>{bluebookReviewAccuracy}%</span>
                  <small>module</small>
                </div>
              </div>
              <div class="bluebook-review-actions">
                <button type="button" on:click={() => setView("today")}>Về dashboard</button>
                <button type="button" on:click={startReview}>Sửa lỗi ngay</button>
                <button class="primary" type="button" on:click={continueBluebookAdaptive}>
                  {bluebookReviewComplete ? "Mở lộ trình sửa lỗi" : `Tiếp tục Module 2 · ${bluebookRouteLabel(bluebookReviewNextRoute)}`}
                </button>
              </div>
              <div class="bluebook-branch-card">
                <strong>{bluebookReviewComplete ? "Đã hoàn tất mô phỏng adaptive" : `Nhánh tiếp theo: ${bluebookRouteLabel(bluebookReviewNextRoute)}`}</strong>
                <p>{bluebookReviewComplete ? "Chuyển sang sửa lỗi và proof sprint để khóa lại các kỹ năng còn hở." : bluebookRouteDetail(bluebookReviewNextRoute)}</p>
              </div>
              <div class="bluebook-optimization-grid" aria-label="SAT pacing and trap optimization">
                <article>
                  <strong>Pacing risk</strong>
                  <span>{bluebookReviewPacing.pacingRisk}</span>
                  <p>{bluebookReviewPacing.overTime} over-time - {bluebookReviewPacing.skipped} skipped - {bluebookReviewPacing.changedAnswers} changed</p>
                </article>
                <article>
                  <strong>Module 2 readiness</strong>
                  <span>{bluebookOptimization.readiness}</span>
                  <p>{bluebookReviewPacing.easyWrong} easy-wrong - {bluebookReviewPacing.hardCorrect} hard-correct</p>
                </article>
                <article>
                  <strong>Focus skill</strong>
                  <span>{bluebookReviewWeakSkill}</span>
                  <p>{bluebookReviewPacing.flags.join(" / ") || "No pacing flags"}</p>
                </article>
              </div>
              <div class="sat-strategy-card-grid" aria-label="SAT strategy remediation cards">
                {#each bluebookReviewCards as card}
                  <article>
                    <div>
                      <strong>{card.title}</strong>
                      <span>{card.estimatedMinutes} min</span>
                    </div>
                    <p>{card.trigger}</p>
                    <small>{card.strategy}</small>
                  </article>
                {/each}
              </div>
              <div class="bluebook-review-list">
                {#each bluebookReviewResults as attempt, index}
                  <article class:correct={attempt.correct} class:incorrect={!attempt.correct}>
                    <div>
                      <strong>Câu {index + 1}: {attempt.correct ? "Đúng" : "Cần sửa"}</strong>
                      <small>{attempt.skill} / {attempt.difficulty}</small>
                    </div>
                    <p>Em chọn: {attempt.selectedAnswerText || attempt.selectedAnswer}</p>
                    <p>Đáp án đúng: {bluebookReviewCorrectText(attempt)}</p>
                    <p>{bluebookReviewExplanation(attempt)}</p>
                  </article>
                {/each}
              </div>
            </section>
          {:else if currentQuestion}
            {#if activeMode === "bluebook"}
              <div class="bluebook-toolbar">
                <button class:active={currentFlagged} type="button" on:click={toggleFlag}>{currentFlagged ? "Đã đánh dấu" : "Đánh dấu"}</button>
                <button class:active={currentHighlighted} type="button" on:click={togglePromptHighlight}>{currentHighlighted ? "Bỏ highlight" : "Highlight phần chọn"}</button>
                <span>{examTimerHidden ? "--:--" : examTimeLabel}</span>
              </div>
            {/if}
            <div class="question-meta">
              <span>{currentQuestion.section}</span>
              <span>{currentQuestion.domain}</span>
              <span>{currentQuestion.difficulty}</span>
            </div>
            <h2>{currentQuestion.skill}</h2>
            <p class="prompt">
              {#each promptSegments(currentQuestion.prompt, currentPromptHighlights) as segment}
                {#if segment.highlighted}
                  <mark class="bluebook-highlight">{segment.text}</mark>
                {:else}
                  {segment.text}
                {/if}
              {/each}
            </p>

            {#if activeMode === "bluebook"}
              <aside class="desmos-panel">
                <div>
                  <strong>Desmos</strong>
                  <small>{currentQuestion.section === "Math" ? "Máy tính đồ thị sẵn sàng cho câu Math." : "Desmos sẽ mở khi chuyển sang câu Math."}</small>
                </div>
                <div
                  class:ready={desmosApiReady}
                  class="desmos-api-container"
                  aria-label="Desmos API graphing calculator"
                  bind:this={desmosContainer}
                ></div>
                <small class="desmos-api-status">{desmosApiStatus}</small>
                <a href="https://www.desmos.com/calculator" rel="noreferrer" target="_blank">Mở Desmos tab mới</a>
              </aside>
            {/if}

            {#if isGridIn(currentQuestion)}
              <label>
                Câu trả lời
                <input bind:value={selectedAnswer} disabled={Boolean(feedback)} inputmode="decimal" on:input={syncCurrentExamAnswer} />
              </label>
            {:else}
              <div class="choices" role="radiogroup" aria-label="Answer choices">
                {#each choiceEntries(currentQuestion) as [letter, text]}
                  <label class:chosen={selectedAnswer === letter} class:eliminated={currentEliminatedChoices.includes(letter)}>
                    <input checked={selectedAnswer === letter} disabled={Boolean(feedback)} name="answer" type="radio" value={letter} on:change={() => selectAnswer(letter)} />
                    <span>{letter}</span>
                    <p>{text}</p>
                    {#if activeMode === "bluebook"}
                      <button class="eliminate-choice" type="button" on:click|preventDefault|stopPropagation={() => toggleEliminatedChoice(letter)}>
                        {currentEliminatedChoices.includes(letter) ? "Khôi phục" : "Gạch"}
                      </button>
                    {/if}
                  </label>
                {/each}
              </div>
            {/if}

            <div class="answer-bar">
              <button type="button" on:click={() => toggleSave(currentQuestion)}>
                {learner.savedQuestionIds.includes(currentQuestion.id) ? "Đã lưu" : "Lưu câu"}
              </button>
              {#if activeMode === "bluebook"}
                <button type="button" on:click={submitBluebookModule}>Kết thúc module</button>
              {/if}
              {#if feedback}
                <button class="primary" type="button" on:click={nextQuestion}>Câu tiếp</button>
              {:else}
                <button class="primary" disabled={!selectedAnswer.trim()} type="button" on:click={submitAnswer}>
                  {activeMode === "bluebook" ? (activeIndex + 1 >= activeQuestions.length ? "Nộp module" : "Lưu & tiếp") : "Nộp đáp án"}
                </button>
              {/if}
            </div>

            {#if feedback}
              <section class:correct={feedback.correct} class:incorrect={!feedback.correct} class="feedback">
                <strong>{feedback.correct ? "Đúng" : "Cần sửa lỗi"}</strong>
                <p>Đáp án đúng: {correctAnswerText(currentQuestion)}</p>
                <p>{explanationText(currentQuestion)}</p>
              </section>
            {/if}
          {:else}
            <div class="empty">
              {#if learner.activeView === "review" && dueMistakes === 0}
                Chưa có lỗi nào cần sửa. Hãy làm một sprint ngắn để thu thêm dữ liệu.
              {:else if learner.activeView === "bluebook"}
                Bắt đầu mô phỏng Bluebook từ panel bên trái.
              {:else}
                Bắt đầu một set ở panel bên trái.
              {/if}
            </div>
          {/if}
        </section>
      </section>
    {/if}
  {/if}
</main>

<style>
  .student-app {
    color: #172033;
    display: grid;
    gap: 24px;
    margin: 0 auto;
    max-width: 1180px;
    min-height: 100vh;
    padding: 24px;
  }

  .topbar {
    align-items: center;
    display: flex;
    gap: 24px;
    justify-content: space-between;
  }

  .eyebrow {
    color: #47627c;
    font-size: 0.74rem;
    font-weight: 800;
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
    letter-spacing: 0;
    margin-bottom: 10px;
  }

  h3 {
    margin: 8px 0;
  }

  nav {
    background: #e9eef5;
    border-radius: 8px;
    display: flex;
    gap: 4px;
    padding: 4px;
  }

  button {
    background: #ffffff;
    border: 1px solid #cbd6e2;
    border-radius: 8px;
    color: #1b2a3a;
    cursor: pointer;
    font-weight: 750;
    min-height: 40px;
    padding: 0 14px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  button.active,
  button.primary {
    background: #163b5c;
    border-color: #163b5c;
    color: #ffffff;
  }

  .today-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  }

  .today-grid.baseline-grid {
    grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1.05fr);
  }

  .reward-dashboard {
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }

  .vocab-dashboard,
  .official-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(300px, 0.8fr) minmax(0, 1.2fr);
  }

  .focus-panel,
  .panel,
  .session-panel,
  .question-panel,
  .state-panel {
    background: #ffffff;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    padding: 24px;
  }

  .focus-panel {
    align-content: center;
    display: grid;
    min-height: 240px;
  }

  .focus-panel h2 {
    font-size: 2.2rem;
  }

  .reward-balance {
    min-height: 220px;
  }

  .reward-message {
    background: #edf6ff;
    border: 1px solid #bedaf2;
    border-radius: 8px;
    color: #224862;
    font-weight: 760;
    margin-top: 12px;
    padding: 10px 12px;
  }

  .metrics {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .metrics article {
    background: #eef4f9;
    border-radius: 8px;
    display: grid;
    min-height: 112px;
    padding: 18px;
  }

  .metrics span {
    font-size: 1.8rem;
    font-weight: 850;
  }

  .lesson-grid,
  .announcement-list,
  .official-list,
  .vocab-word-list {
    display: grid;
    gap: 12px;
    margin-top: 14px;
  }

  .lesson-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lesson-grid article,
  .announcement-list article,
  .official-list article,
  .vocab-word-list article {
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    padding: 16px;
  }

  .lesson-grid article {
    min-height: 230px;
  }

  .lesson-grid article.lesson-foundation {
    background: #fff8e6;
    border-color: #f2d58a;
  }

  .lesson-grid article.lesson-hard_transfer {
    background: #f0f7ff;
    border-color: #bcd5ef;
  }

  .lesson-grid span,
  .announcement-list span {
    background: #eef4f9;
    border-radius: 999px;
    color: #31546f;
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 800;
    padding: 5px 9px;
    width: fit-content;
  }

  .lesson-footer,
  .resource-links,
  .fact-grid {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .lesson-footer {
    justify-content: space-between;
  }

  .resource-links a {
    background: #eef4f9;
    border-radius: 999px;
    color: #163b5c;
    font-size: 0.82rem;
    font-weight: 800;
    padding: 7px 10px;
    text-decoration: none;
  }

  .tool-filter-row,
  .official-form {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 14px 0;
  }

  .official-form {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .check-line {
    align-items: center;
    display: flex;
    gap: 8px;
    min-height: 42px;
  }

  .check-line input {
    min-height: auto;
  }

  .flashcard {
    align-items: start;
    background: #eef4f9;
    display: grid;
    gap: 10px;
    min-height: 178px;
    padding: 18px;
    text-align: left;
    white-space: normal;
  }

  .flashcard strong {
    color: #172033;
    font-size: 1.25rem;
  }

  .flashcard span,
  .flashcard small {
    color: #4c5e70;
    line-height: 1.5;
  }

  .vocab-quiz {
    background: #f8fafc;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 10px;
    margin-top: 16px;
    padding: 14px;
  }

  .vocab-quiz label {
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: flex;
    font-weight: 650;
    padding: 10px;
  }

  .vocab-quiz label.chosen {
    border-color: #163b5c;
  }

  .vocab-word-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .vocab-word-list article {
    gap: 6px;
  }

  .fact-grid article {
    background: #eef4f9;
    border-radius: 8px;
    display: grid;
    min-width: 110px;
    padding: 12px;
  }

  .fact-grid strong {
    font-size: 1.2rem;
  }

  .official-list article {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .official-list p,
  .announcement-list p {
    color: #4c5e70;
    line-height: 1.5;
    margin-bottom: 0;
  }

  .announcement-list article.pinned {
    background: #f0f7ff;
    border-color: #bcd5ef;
  }

  small,
  .prompt,
  .empty,
  .focus-panel p,
  .feedback p {
    color: #4c5e70;
    line-height: 1.55;
  }

  .panel {
    grid-column: 1 / -1;
  }

  .panel-head,
  .answer-bar {
    align-items: center;
    display: flex;
    gap: 14px;
    justify-content: space-between;
  }

  .muted {
    color: #4c5e70;
    line-height: 1.55;
  }

  .public-account-panel {
    background: #f8fbff;
  }

  .mission-panel {
    background: #fffdf7;
    border-color: #ead9a9;
  }

  .mission-panel .panel-head span {
    background: #fff3c4;
    border-radius: 999px;
    color: #74510a;
    font-weight: 900;
    padding: 7px 10px;
  }

  .mission-panel > p {
    color: #4c5e70;
    line-height: 1.55;
    margin-bottom: 14px;
  }

  .streak-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0 14px;
  }

  .streak-strip strong,
  .streak-strip span {
    background: #ffffff;
    border: 1px solid #ead9a9;
    border-radius: 999px;
    color: #68490a;
    font-size: 0.84rem;
    font-weight: 850;
    padding: 7px 10px;
  }

  .reward-streak strong,
  .reward-streak span {
    border-color: #cfe0ee;
    color: #31546f;
  }

  .mission-actions {
    justify-content: flex-start;
  }

  .reward-message.compact {
    margin-top: 12px;
  }

  .public-account-panel .panel-head span {
    background: #eef4f9;
    border-radius: 999px;
    color: #31546f;
    font-weight: 850;
    padding: 7px 10px;
  }

  .assignment-panel {
    background: #fbfcf8;
  }

  .assignment-panel .panel-head span {
    background: #edf6e7;
    border-radius: 999px;
    color: #2e6036;
    font-weight: 850;
    padding: 7px 10px;
  }

  .assignment-cards {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .assignment-cards article {
    align-items: center;
    background: #ffffff;
    border: 1px solid #d8e6ce;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) auto;
    min-height: 118px;
    padding: 14px;
  }

  .assignment-cards article.completed {
    background: #f5f7f2;
    opacity: 0.78;
  }

  .assignment-cards strong,
  .assignment-cards small {
    display: block;
  }

  .assignment-cards p {
    color: #4c5e70;
    line-height: 1.45;
    margin: 6px 0 0;
  }

  .assignment-cards small {
    color: #3f6f44;
    font-weight: 800;
  }

  .sync-queue-note {
    background: #fff8e6;
    border: 1px solid #f2d58a;
    border-radius: 8px;
    color: #6c4a08;
    font-weight: 780;
    margin: 10px 0;
    padding: 10px 12px;
  }

  .backend-auth-form {
    align-items: end;
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  }

  .backend-auth-form button {
    min-width: 150px;
  }

  .class-join-row {
    align-items: end;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(160px, 1fr) auto minmax(180px, 1fr);
    margin-top: 12px;
  }

  .class-join-row small {
    align-self: center;
    color: #596a7a;
    font-weight: 760;
  }

  .account-actions {
    justify-content: flex-start;
  }

  .skill-list {
    display: grid;
    gap: 10px;
  }

  .skill-row {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) 70px 120px auto;
    padding: 12px;
  }

  .skill-row strong,
  .skill-row small {
    display: block;
  }

  .skill-row span {
    font-weight: 850;
  }

  .skill-row em {
    color: #31546f;
    font-style: normal;
    font-weight: 750;
  }

  .reward-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .reward-card {
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 14px;
    min-height: 190px;
    padding: 16px;
  }

  .reward-card.locked {
    background: #f7f9fb;
  }

  .reward-card span {
    background: #eef4f9;
    border-radius: 999px;
    color: #31546f;
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 800;
    padding: 5px 9px;
  }

  .reward-card p {
    color: #4c5e70;
    line-height: 1.5;
    margin-bottom: 0;
  }

  .reward-card-footer {
    align-items: center;
    align-self: end;
    display: flex;
    gap: 10px;
    justify-content: space-between;
  }

  .reward-card-footer strong {
    font-size: 1.1rem;
  }

  .reward-claim-list {
    display: grid;
    gap: 10px;
  }

  .reward-claim-list article {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 12px;
  }

  .reward-claim-list span {
    font-weight: 850;
    text-transform: capitalize;
  }

  .reward-claim-list .claim-fulfilled {
    background: #f1faf5;
    border-color: #b9dfc7;
  }

  .reward-claim-list .claim-cancelled {
    background: #fff8e6;
    border-color: #f2d58a;
  }

  .workbench {
    display: grid;
    gap: 20px;
    grid-template-columns: 300px minmax(0, 1fr);
  }

  .session-panel {
    align-self: start;
    display: grid;
    gap: 16px;
  }

  .bluebook-exam-surface {
    min-height: 720px;
  }

  .exam-timer {
    background: #eef4f9;
    border: 1px solid #d5e0eb;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    padding: 14px;
  }

  .exam-timer strong {
    color: #172033;
    font-size: 1.55rem;
  }

  .exam-timer.warning {
    background: #fff3e6;
    border-color: #efb979;
  }

  .exam-timer em {
    color: #8a3b00;
    font-style: normal;
    font-weight: 800;
  }

  .bluebook-module-card {
    background: #f8fafc;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .bluebook-module-card span,
  .bluebook-branch-card strong {
    color: #163b5c;
    font-weight: 850;
  }

  .bluebook-module-card p,
  .bluebook-branch-card p {
    color: #4c5e70;
    line-height: 1.45;
    margin: 0;
  }

  .bluebook-progress {
    background: #e4ebf3;
    border-radius: 999px;
    height: 8px;
    overflow: hidden;
  }

  .bluebook-progress i {
    background: #163b5c;
    display: block;
    height: 100%;
  }

  .bluebook-stats {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr;
  }

  .bluebook-stats strong {
    background: #eef4f9;
    border-radius: 8px;
    color: #31546f;
    font-size: 0.84rem;
    padding: 8px 10px;
  }

  .bluebook-route-actions {
    background: #eef4f9;
    border-radius: 8px;
    color: #31546f;
    font-size: 0.84rem;
    padding: 8px 10px;
  }

  .question-navigator {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .question-navigator button {
    min-height: 36px;
    padding: 0;
  }

  .question-navigator button.flagged {
    border-color: #a56200;
    box-shadow: inset 0 0 0 2px #f0c26d;
  }

  .question-navigator button.answered {
    background: #e7f7ee;
    border-color: #9bd6b2;
  }

  .bluebook-toolbar {
    align-items: center;
    border-bottom: 1px solid #e1e8f0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
    margin: -2px 0 18px;
    padding-bottom: 14px;
  }

  .bluebook-toolbar span {
    color: #31546f;
    font-weight: 850;
  }

  label {
    color: #26384a;
    display: grid;
    font-weight: 750;
    gap: 8px;
  }

  input,
  select {
    border: 1px solid #cbd6e2;
    border-radius: 8px;
    min-height: 42px;
    padding: 0 12px;
  }

  .question-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .question-meta span {
    background: #eef4f9;
    border-radius: 999px;
    color: #31546f;
    font-size: 0.8rem;
    font-weight: 750;
    padding: 6px 10px;
  }

  .prompt {
    font-size: 1.08rem;
    white-space: pre-wrap;
  }

  .prompt mark.bluebook-highlight {
    background: #fff3a3;
    border-radius: 6px;
    color: #172033;
    padding: 1px 3px;
  }

  .desmos-panel {
    background: #f8fafc;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 14px;
    grid-template-columns: minmax(180px, 0.32fr) minmax(260px, 1fr) minmax(120px, 0.24fr) auto;
    margin: 16px 0;
    padding: 12px 14px;
  }

  .desmos-panel > div:first-child {
    display: grid;
    gap: 4px;
  }

  .desmos-panel a {
    align-self: center;
    background: #163b5c;
    border-radius: 8px;
    color: #ffffff;
    font-weight: 800;
    padding: 10px 12px;
    text-decoration: none;
  }

  .desmos-api-container {
    aspect-ratio: 16 / 9;
    background: #ffffff;
    border: 1px solid #cbd6e2;
    border-radius: 8px;
    min-height: 210px;
    overflow: hidden;
    width: 100%;
  }

  .desmos-api-container.ready {
    border-color: #7fb3d5;
  }

  .desmos-api-status {
    align-self: center;
    color: #536579;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .bluebook-intro-panel {
    align-content: center;
    display: grid;
    gap: 22px;
    min-height: 620px;
  }

  .bluebook-intro-panel h2 {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .bluebook-intro-panel p {
    color: #4c5e70;
    line-height: 1.55;
    max-width: 720px;
  }

  .bluebook-direction-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bluebook-direction-grid article {
    background: #f8fafc;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    min-height: 132px;
    padding: 16px;
  }

  .bluebook-direction-grid strong {
    color: #163b5c;
    font-size: 1.05rem;
  }

  .bluebook-direction-grid span {
    color: #526779;
    line-height: 1.45;
  }

  .bluebook-intro-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .choices {
    display: grid;
    gap: 10px;
    margin: 20px 0;
  }

  .choices label {
    align-items: start;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    cursor: pointer;
    display: grid;
    gap: 12px;
    grid-template-columns: auto 32px minmax(0, 1fr) auto;
    padding: 12px;
  }

  .choices label.chosen {
    border-color: #163b5c;
    box-shadow: inset 0 0 0 1px #163b5c;
  }

  .choices label.eliminated {
    background: #f7f9fb;
    opacity: 0.72;
  }

  .choices label.eliminated p {
    text-decoration: line-through;
  }

  .choices span {
    background: #e9eef5;
    border-radius: 999px;
    display: grid;
    font-weight: 850;
    height: 32px;
    place-items: center;
    width: 32px;
  }

  .choices p {
    margin: 4px 0 0;
  }

  .eliminate-choice {
    min-height: 32px;
    padding: 0 10px;
  }

  .bluebook-review-panel {
    display: grid;
    gap: 18px;
  }

  .bluebook-review-hero {
    align-items: center;
    background: #f7fbff;
    border: 1px solid #d7e6f2;
    border-radius: 8px;
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 18px;
  }

  .review-score-ring {
    align-items: center;
    aspect-ratio: 1;
    background: #ffffff;
    border: 8px solid #163b5c;
    border-radius: 999px;
    display: grid;
    height: 112px;
    justify-items: center;
    padding: 14px;
  }

  .review-score-ring span {
    color: #163b5c;
    font-size: 1.6rem;
    font-weight: 900;
  }

  .review-score-ring small {
    color: #516477;
    font-weight: 800;
  }

  .bluebook-review-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .bluebook-branch-card {
    background: #f8fafc;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 6px;
    padding: 14px;
  }

  .bluebook-optimization-grid,
  .sat-strategy-card-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bluebook-optimization-grid article,
  .sat-strategy-card-grid article {
    background: #f8fafc;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 6px;
    min-width: 0;
    padding: 14px;
  }

  .bluebook-optimization-grid strong,
  .sat-strategy-card-grid strong {
    color: #13293d;
    font-size: 0.78rem;
    letter-spacing: 0;
  }

  .bluebook-optimization-grid span,
  .sat-strategy-card-grid span {
    color: #0f766e;
    font-size: 1.05rem;
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  .bluebook-optimization-grid p,
  .sat-strategy-card-grid p,
  .sat-strategy-card-grid small {
    color: #516477;
    line-height: 1.45;
    margin: 0;
  }

  .sat-strategy-card-grid article div {
    align-items: start;
    display: flex;
    gap: 10px;
    justify-content: space-between;
  }

  .sat-strategy-card-grid article div span {
    color: #2563eb;
    flex: 0 0 auto;
    font-size: 0.72rem;
  }

  .bluebook-review-list {
    display: grid;
    gap: 12px;
  }

  .bluebook-review-list article {
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    padding: 14px;
  }

  .bluebook-review-list article.correct {
    background: #f3fbf6;
    border-color: #9bd6b2;
  }

  .bluebook-review-list article.incorrect {
    background: #fff8ef;
    border-color: #f2c58e;
  }

  .bluebook-review-list p {
    margin-bottom: 0;
  }

  .feedback {
    border-radius: 8px;
    margin-top: 18px;
    padding: 16px;
  }

  .feedback.correct {
    background: #e7f7ee;
    border: 1px solid #9bd6b2;
  }

  .feedback.incorrect {
    background: #fff3e6;
    border: 1px solid #f2c58e;
  }

  .state-panel.error {
    border-color: #e6a4a4;
    color: #8a2727;
  }

  @media (max-width: 860px) {
    .topbar,
    .panel-head,
    .answer-bar {
      align-items: stretch;
      flex-direction: column;
    }

    nav,
    .today-grid,
    .lesson-grid,
    .vocab-dashboard,
    .official-grid,
    .tool-filter-row,
    .official-form,
    .reward-dashboard,
    .workbench,
    .metrics,
    .assignment-cards,
    .reward-grid,
    .bluebook-direction-grid,
    .bluebook-optimization-grid,
    .sat-strategy-card-grid,
    .vocab-word-list,
    .official-list article,
    .assignment-cards article,
    .skill-row {
      grid-template-columns: 1fr;
    }

    .backend-auth-form {
      grid-template-columns: 1fr;
    }

    .class-join-row {
      grid-template-columns: 1fr;
    }

    .desmos-panel,
    .bluebook-toolbar,
    .bluebook-review-hero {
      align-items: stretch;
      flex-direction: column;
      grid-template-columns: 1fr;
    }

    .question-navigator {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .bluebook-route-actions {
      grid-template-columns: 1fr;
    }

    nav {
      display: grid;
      width: 100%;
    }
  }
</style>
