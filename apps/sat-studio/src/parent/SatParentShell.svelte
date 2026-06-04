<script lang="ts">
  import { onMount } from "svelte";
  import { loadAccountState } from "../domain/account-ops";
  import { buildParentCoachModel, type ParentCoachModel } from "../domain/parent-coach";
  import {
    CLASSROOM_ASSIGNMENTS_STORAGE_KEY,
    buildTeacherClassroomModel,
    createClassroomAssignment,
    type ClassroomAssignment,
    type ClassroomAssignmentDraft,
    type ClassroomAssignmentMode,
    type TeacherClassroomModel,
  } from "../domain/teacher-classroom";
  import { emptyLearnerState, loadLearnerState, loadPublicStudentPackage, type LearnerState } from "../domain/student-learning";
  import { buildExamReviewModel } from "../domain/student-tools";
  import {
    buildRewardOperationsModel,
    createRewardProgram,
    loadRewardState,
    resolveRewardClaim,
    saveRewardState,
    type RewardOperationsModel,
    type RewardState,
    type RewardType,
  } from "../domain/rewards";
  import {
    DEFAULT_PUBLIC_BACKEND_BASE_URL,
    PUBLIC_BACKEND_COOKIE_SESSION,
    createBackendClass,
    createBackendClassAssignment,
    getBackendClassReport,
    getBackendProfile,
    getBackendToken,
    listBackendClasses,
    listBackendAccounts,
    loadPublicBackendState,
    loginBackend,
    logoutBackend,
    normalizeBackendAccount,
    savePublicBackendState,
    serverProfileBody,
    setBackendToken,
    type BackendAccount,
    type BackendClassAssignment,
    type BackendClassReport,
    type BackendClassroom,
  } from "../domain/public-backend";

  let learner: LearnerState = emptyLearnerState();
  let model: ParentCoachModel = buildParentCoachModel(learner);
  let loading = true;
  let loadError = "";
  let backendBaseUrl = DEFAULT_PUBLIC_BACKEND_BASE_URL;
  let backendToken = "";
  let backendAccount: BackendAccount | null = null;
  let backendUsername = "";
  let backendPassword = "";
  let backendMessage = "Đăng nhập phụ huynh hoặc admin để xem tiến trình đã đồng bộ.";
  let backendBusy = "";
  let backendStudents: BackendAccount[] = [];
  let selectedBackendStudentId = "";
  let teacherClasses: BackendClassroom[] = [];
  let selectedTeacherClassId = "";
  let teacherClassName = "SAT 1600 Cohort";
  let teacherClassReport: BackendClassReport | null = null;
  let teacherBackendAssignments: BackendClassAssignment[] = [];
  let teacherClassMessage = "";
  let classroomModel: TeacherClassroomModel = buildTeacherClassroomModel(loadAccountState());
  let classroomAssignments: ClassroomAssignment[] = [];
  let assignmentForm: ClassroomAssignmentDraft = classroomModel.assignmentDraft;
  let assignmentMessage = "";
  let rewardState: RewardState = loadRewardState();
  let rewardModel: RewardOperationsModel = buildRewardOperationsModel(rewardState, "parent-admin");
  let rewardForm = {
    title: "Practice milestone reward",
    description: "Parent-approved reward after the student completes the assigned SAT milestone.",
    costPoints: 60,
    rewardType: "experience" as RewardType,
  };
  let rewardTargetStudentId = "";
  let rewardMessage = "";

  $: examModel = buildExamReviewModel(learner);
  $: backendConnected = Boolean(backendToken && backendAccount);
  $: canManageTeacherClasses = Boolean(backendAccount && ["teacher", "admin", "content_admin"].includes(backendAccount.role));
  $: selectedTeacherClass = teacherClasses.find((classroom) => classroom.id === selectedTeacherClassId) || null;

  onMount(async () => {
    try {
      learner = loadLearnerState();
      classroomModel = buildTeacherClassroomModel(loadAccountState());
      refreshParentRewards();
      classroomAssignments = loadClassroomAssignments();
      assignmentForm = { ...classroomModel.assignmentDraft };
      const loadedBackend = loadPublicBackendState();
      backendBaseUrl = loadedBackend.backend.baseUrl || DEFAULT_PUBLIC_BACKEND_BASE_URL;
      backendToken = getBackendToken();
      backendAccount = loadedBackend.backend.account;
      if (backendToken) {
        await loadBackendStudents();
        await loadTeacherClasses();
      }
      const contentPackage = await loadPublicStudentPackage();
      model = buildParentCoachModel(learner, { packageCount: contentPackage.items.length });
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Could not load parent dashboard.";
      model = buildParentCoachModel(learner);
    } finally {
      loading = false;
    }
  });

  function learnerFromServerProfile(record: Record<string, unknown>): LearnerState {
    const body = serverProfileBody(record);
    return {
      ...emptyLearnerState(),
      attempts: Array.isArray(body.attempts) ? (body.attempts as LearnerState["attempts"]) : [],
      learningEvents: Array.isArray(body.learningEvents) ? (body.learningEvents as LearnerState["learningEvents"]) : [],
      learningEventRevision: String(body.learningEventRevision || ""),
      learningEventUpdatedAt: String(body.learningEventUpdatedAt || ""),
      officialExamLogs: Array.isArray(body.officialLogs) ? (body.officialLogs as LearnerState["officialExamLogs"]) : [],
      knownVocabIds: Array.isArray(body.vocabKnown) ? body.vocabKnown.map(String) : [],
      vocabQuizAttempts: Array.isArray(body.vocabQuizAttempts) ? (body.vocabQuizAttempts as LearnerState["vocabQuizAttempts"]) : [],
      savedQuestionIds: Array.isArray(body.savedQuestionIds) ? body.savedQuestionIds.map(String) : [],
      targetScore: Number(body.targetScore || 1500),
      lastContentVersion: String(body.lastContentVersion || ""),
    };
  }

  async function submitBackendLogin(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!backendUsername || !backendPassword) {
      backendMessage = "Enter backend username and password.";
      return;
    }
    backendBusy = "login";
    try {
      const result = await loginBackend({ username: backendUsername, password: backendPassword }, { baseUrl: backendBaseUrl });
      const account = normalizeBackendAccount(result.account);
      const token = result.cookieAuth ? PUBLIC_BACKEND_COOKIE_SESSION : String(result.token || PUBLIC_BACKEND_COOKIE_SESSION);
      if (!account || !token) throw new Error("Backend login response is incomplete.");
      backendAccount = account;
      backendToken = token;
      backendPassword = "";
      setBackendToken(token);
      const loaded = loadPublicBackendState();
      savePublicBackendState(loaded.accountState, {
        ...loaded.backend,
        baseUrl: backendBaseUrl,
        account,
        sessionExpiresAt: Number(result.expiresAt || 0),
        statusLevel: "ok",
        statusTitle: "Parent backend session active",
        statusMessage: "Parent dashboard is using backend progress.",
      });
      await loadBackendStudents();
      await loadTeacherClasses();
    } catch (error) {
      backendMessage = error instanceof Error ? error.message : "Backend login failed.";
    } finally {
      backendBusy = "";
    }
  }

  async function loadBackendStudents(): Promise<void> {
    if (!backendToken) return;
    backendBusy = backendBusy || "students";
    try {
      const response = await listBackendAccounts(backendToken, { baseUrl: backendBaseUrl });
      const items = Array.isArray(response.items) ? response.items.map(normalizeBackendAccount).filter((item): item is BackendAccount => Boolean(item)) : [];
      backendStudents = items.filter((item) => item.role === "student");
      selectedBackendStudentId = selectedBackendStudentId || backendStudents[0]?.id || "";
      if (selectedBackendStudentId) await loadSelectedBackendStudent();
      backendMessage = backendStudents.length ? `Loaded ${backendStudents.length} linked student account(s).` : "No linked student accounts are available for this backend session.";
    } catch (error) {
      backendMessage = error instanceof Error ? `Could not load backend students: ${error.message}` : "Could not load backend students.";
    } finally {
      if (backendBusy === "students") backendBusy = "";
    }
  }

  async function loadSelectedBackendStudent(): Promise<void> {
    if (!backendToken || !selectedBackendStudentId) return;
    backendBusy = "profile";
    try {
      const record = await getBackendProfile(backendToken, selectedBackendStudentId, { baseUrl: backendBaseUrl });
      learner = learnerFromServerProfile(record);
      const contentPackage = await loadPublicStudentPackage();
      model = buildParentCoachModel(learner, { packageCount: contentPackage.items.length });
      backendMessage = "Backend student profile loaded.";
    } catch (error) {
      backendMessage = error instanceof Error ? `Could not load backend profile: ${error.message}` : "Could not load backend profile.";
    } finally {
      backendBusy = "";
    }
  }

  async function loadTeacherClasses(): Promise<void> {
    if (!backendToken || !backendAccount) return;
    if (!["teacher", "admin", "content_admin", "parent", "student"].includes(backendAccount.role)) return;
    backendBusy = backendBusy || "classes";
    try {
      const response = await listBackendClasses(backendToken, { baseUrl: backendBaseUrl });
      teacherClasses = Array.isArray(response.items) ? response.items : [];
      selectedTeacherClassId = selectedTeacherClassId || teacherClasses[0]?.id || "";
      if (selectedTeacherClassId && canManageTeacherClasses) await loadTeacherClassReport();
      teacherClassMessage = teacherClasses.length ? `Loaded ${teacherClasses.length} classroom(s).` : "No backend classrooms yet.";
    } catch (error) {
      teacherClassMessage = error instanceof Error ? `Could not load classrooms: ${error.message}` : "Could not load classrooms.";
    } finally {
      if (backendBusy === "classes") backendBusy = "";
    }
  }

  async function createTeacherClass(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const name = teacherClassName.trim();
    if (!backendToken || !canManageTeacherClasses) {
      teacherClassMessage = "Teacher/admin backend login is required to create a class.";
      return;
    }
    if (!name) {
      teacherClassMessage = "Class name is required.";
      return;
    }
    backendBusy = "create-class";
    try {
      const response = await createBackendClass(backendToken, { name }, { baseUrl: backendBaseUrl });
      selectedTeacherClassId = response.class.id;
      teacherClassMessage = `Created class ${response.class.name}. Join code: ${response.class.joinCode}.`;
      await loadTeacherClasses();
    } catch (error) {
      teacherClassMessage = error instanceof Error ? error.message : "Could not create class.";
    } finally {
      if (backendBusy === "create-class") backendBusy = "";
    }
  }

  async function loadTeacherClassReport(): Promise<void> {
    if (!backendToken || !selectedTeacherClassId || !canManageTeacherClasses) return;
    backendBusy = backendBusy || "class-report";
    try {
      teacherClassReport = await getBackendClassReport(backendToken, selectedTeacherClassId, { baseUrl: backendBaseUrl });
      teacherBackendAssignments = teacherClassReport.assignments || [];
      teacherClassMessage = "Classroom report loaded.";
    } catch (error) {
      teacherClassReport = null;
      teacherBackendAssignments = [];
      teacherClassMessage = error instanceof Error ? `Could not load class report: ${error.message}` : "Could not load class report.";
    } finally {
      if (backendBusy === "class-report") backendBusy = "";
    }
  }

  async function createTeacherBackendAssignment(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const title = assignmentForm.title.trim();
    const focusSkill = assignmentForm.focusSkill.trim();
    if (!backendToken || !selectedTeacherClassId || !canManageTeacherClasses) {
      teacherClassMessage = "Select a backend class before creating an assignment.";
      return;
    }
    if (!title || !focusSkill || !assignmentForm.dueDate) {
      teacherClassMessage = "Title, focus skill, and due date are required.";
      return;
    }
    backendBusy = "backend-assignment";
    try {
      const targetStudentIds = selectedBackendStudentId ? [selectedBackendStudentId] : backendStudents.map((student) => student.id);
      const response = await createBackendClassAssignment(
        backendToken,
        selectedTeacherClassId,
        {
          title,
          focusSkill,
          mode: assignmentForm.mode,
          dueDate: assignmentForm.dueDate,
          targetStudentIds,
        },
        { baseUrl: backendBaseUrl },
      );
      teacherClassMessage = `Created backend assignment: ${response.assignment.title}.`;
      await loadTeacherClassReport();
    } catch (error) {
      teacherClassMessage = error instanceof Error ? error.message : "Could not create backend assignment.";
    } finally {
      if (backendBusy === "backend-assignment") backendBusy = "";
    }
  }

  async function logoutParentBackend(): Promise<void> {
    backendBusy = "logout";
    try {
      if (backendToken) await logoutBackend(backendToken, { baseUrl: backendBaseUrl });
    } catch {
      // Local token is cleared even when the server already revoked it.
    } finally {
      backendToken = "";
      backendAccount = null;
      backendStudents = [];
      selectedBackendStudentId = "";
      teacherClasses = [];
      selectedTeacherClassId = "";
      teacherClassReport = null;
      teacherBackendAssignments = [];
      setBackendToken("");
      backendMessage = "Backend session cleared.";
      backendBusy = "";
    }
  }

  function loadClassroomAssignments(): ClassroomAssignment[] {
    try {
      const raw = localStorage.getItem(CLASSROOM_ASSIGNMENTS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as ClassroomAssignment[]) : [];
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.status === "assigned" && item.classCode) : [];
    } catch {
      return [];
    }
  }

  function saveClassroomAssignments(assignments: ClassroomAssignment[]): void {
    localStorage.setItem(CLASSROOM_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments.slice(0, 25)));
  }

  function parentRewardManagerId(state: RewardState): string {
    const active = state.accounts.find((account) => account.id === state.accountState.activeAccountId && (account.role === "parent" || account.role === "admin"));
    const parent = state.accounts.find((account) => account.role === "parent" && account.status === "active");
    const admin = state.accounts.find((account) => account.role === "admin" && account.status === "active");
    return active?.id || parent?.id || admin?.id || "";
  }

  function refreshParentRewards(state: RewardState = loadRewardState()): void {
    rewardState = state;
    rewardModel = buildRewardOperationsModel(state, parentRewardManagerId(state));
    rewardTargetStudentId = rewardTargetStudentId || rewardModel.students[0]?.id || "";
  }

  function createParentReward(event: SubmitEvent): void {
    event.preventDefault();
    const title = rewardForm.title.trim();
    const costPoints = Number(rewardForm.costPoints);
    if (!title || !Number.isFinite(costPoints) || costPoints < 1) {
      rewardMessage = "Điền tiêu đề và chi phí điểm hợp lệ trước khi tạo phần thưởng.";
      return;
    }
    const result = createRewardProgram(
      rewardState,
      {
        ...rewardForm,
        title,
        costPoints,
        targetStudentIds: rewardTargetStudentId ? [rewardTargetStudentId] : rewardModel.students.map((student) => student.id),
      },
      rewardModel.manager?.id,
    );
    rewardMessage = result.reason;
    if (!result.ok) return;
    refreshParentRewards(saveRewardState(result.state));
  }

  function resolveParentRewardClaim(claimId: string, action: "fulfill" | "cancel"): void {
    const result = resolveRewardClaim(rewardState, claimId, action, rewardModel.manager?.id);
    rewardMessage = result.reason;
    if (!result.ok) return;
    refreshParentRewards(saveRewardState(result.state));
  }

  function updateAssignmentMode(mode: string): void {
    assignmentForm = { ...assignmentForm, mode: mode as ClassroomAssignmentMode };
  }

  function createAssignment(event: SubmitEvent): void {
    event.preventDefault();
    const title = assignmentForm.title.trim();
    const focusSkill = assignmentForm.focusSkill.trim();
    if (!title || !focusSkill || !assignmentForm.dueDate) {
      assignmentMessage = "Điền đủ tiêu đề, kỹ năng trọng tâm và hạn nộp trước khi giao bài.";
      return;
    }
    const assignment = createClassroomAssignment({
      ...assignmentForm,
      title,
      focusSkill,
      targetStudentIds: assignmentForm.targetStudentIds.length ? assignmentForm.targetStudentIds : classroomModel.priorityStudents.slice(0, 1).map((student) => student.accountId),
    });
    classroomAssignments = [assignment, ...classroomAssignments].slice(0, 25);
    saveClassroomAssignments(classroomAssignments);
    assignmentMessage = `Đã tạo bài giao cho lớp ${assignment.classCode}.`;
  }

  function riskLabel(risk: string): string {
    const labels: Record<string, string> = {
      needs_baseline: "Cần baseline",
      needs_repair: "Cần sửa lỗi",
      pacing_risk: "Rủi ro tốc độ",
      on_track: "Đúng lộ trình",
    };
    return labels[risk] || risk.replace(/_/g, " ");
  }

  function assignmentModeLabel(mode: string): string {
    const labels: Record<string, string> = {
      diagnostic: "Diagnostic",
      remedial_sprint: "Remedial sprint",
      proof_review: "Sửa lỗi bằng proof",
      timed_mixed: "Timed mixed",
    };
    return labels[mode] || mode.replace(/_/g, " ");
  }

  function assignmentAttempts(assignment: ClassroomAssignment): LearnerState["attempts"] {
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

  function flagLabel(flag: string): string {
    const labels: Record<string, string> = {
      baseline_needed: "Cần baseline",
      mistake_review_due: "Có lỗi cần proof review",
      pacing_risk: "Cần kiểm soát thời gian",
      skill_repair_needed: "Có kỹ năng cần sửa nền",
    };
    return labels[flag] || flag.replace(/_/g, " ");
  }

</script>

<main class="parent-app">
  <header class="parent-topbar">
    <div>
      <p class="eyebrow">SAT Studio</p>
      <h1>Bảng điều khiển phụ huynh</h1>
      <span class="sr-only">Bảng điều khiển phụ huynh</span>
    </div>
  </header>

  {#if loading}
    <section class="state-panel">Đang tải bảng phụ huynh...</section>
  {:else if loadError}
    <section class="state-panel error">{loadError}</section>
  {:else}
    <section class="parent-hero">
      <div>
        <p class="eyebrow">Việc nên làm tiếp theo</p>
        <h2>{model.nextAction.title}</h2>
        <p>{model.nextAction.detail}</p>
      </div>
      <div class={`status-chip ${model.nextAction.tone}`}>
        {model.nextAction.tone === "baseline" ? "Nền tảng" : model.nextAction.tone === "repair" ? "Sửa lỗi" : "Sprint"}
      </div>
    </section>

    <section class="roadmap-strip" aria-label="Lộ trình SAT 1600">
      <article class:active={model.attempts < 8}>
        <small>Giai đoạn 1</small>
        <strong>Nền tảng chính xác</strong>
        <p>Thu đủ dữ liệu để biết band hiện tại và 3-5 điểm nghẽn đầu tiên.</p>
      </article>
      <article class:active={model.openMistakes > 0}>
        <small>Giai đoạn 2</small>
        <strong>Sửa lỗi có proof</strong>
        <p>Mỗi lỗi sai phải quay lại bằng câu proof khác khuôn, không chỉ xem đáp án.</p>
      </article>
      <article class:active={model.attempts >= 8 && model.openMistakes === 0}>
        <small>Giai đoạn 3</small>
        <strong>Chuyển đổi câu khó 1500+</strong>
        <p>Khi nền sạch, chuyển sang timed Hard và mixed transfer để nâng trần điểm.</p>
      </article>
    </section>

    <section class="panel classroom-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Bảng lớp học</p>
          <h2>Hàng đợi ưu tiên của lớp</h2>
        </div>
        <span>{classroomModel.recommendedClassAssignment}</span>
      </div>
      <div class="metric-grid compact-classroom-metrics" aria-label="Classroom metrics">
        {#each classroomModel.metrics as metric}
          <article>
            <span>{metric.value}</span>
            <small>{metric.label}</small>
            <p>{metric.detail}</p>
          </article>
        {/each}
      </div>
      <section class="teacher-backend-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Teacher Classroom V2</p>
            <h3>Backend class, join code, assignment evidence</h3>
          </div>
          <span>{selectedTeacherClass?.joinCode || "Chưa chọn lớp"}</span>
        </div>
        {#if backendConnected && canManageTeacherClasses}
          <div class="teacher-backend-grid">
            <form class="teacher-class-create" on:submit={createTeacherClass}>
              <label>
                Tên lớp
                <input bind:value={teacherClassName} />
              </label>
              <button class="primary" disabled={Boolean(backendBusy)} type="submit">Tạo lớp backend</button>
            </form>
            <div class="teacher-class-select">
              <label>
                Lớp backend
                <select bind:value={selectedTeacherClassId} on:change={loadTeacherClassReport}>
                  <option value="">Chọn lớp</option>
                  {#each teacherClasses as classroom}
                    <option value={classroom.id}>{classroom.name} · {classroom.joinCode}</option>
                  {/each}
                </select>
              </label>
              <button disabled={Boolean(backendBusy)} type="button" on:click={loadTeacherClasses}>Tải lớp</button>
              <button disabled={Boolean(backendBusy) || !selectedTeacherClassId} type="button" on:click={loadTeacherClassReport}>Tải report</button>
            </div>
          </div>
          <form class="assignment-builder backend-assignment-builder" on:submit={createTeacherBackendAssignment}>
            <label>
              Tiêu đề
              <input bind:value={assignmentForm.title} />
            </label>
            <label>
              Kỹ năng
              <input bind:value={assignmentForm.focusSkill} />
            </label>
            <label>
              Chế độ
              <select value={assignmentForm.mode} on:change={(event) => updateAssignmentMode(event.currentTarget.value)}>
                <option value="diagnostic">Diagnostic</option>
                <option value="remedial_sprint">Remedial sprint</option>
                <option value="proof_review">Sửa lỗi bằng proof</option>
                <option value="timed_mixed">Timed mixed</option>
              </select>
            </label>
            <label>
              Hạn nộp
              <input bind:value={assignmentForm.dueDate} type="date" />
            </label>
            <label>
              Target
              <select bind:value={selectedBackendStudentId}>
                <option value="">Tất cả học sinh backend</option>
                {#each backendStudents as student}
                  <option value={student.id}>{student.displayName || student.username || student.id}</option>
                {/each}
              </select>
            </label>
            <button class="primary" disabled={Boolean(backendBusy) || !selectedTeacherClassId} type="submit">Giao qua backend</button>
          </form>
          {#if teacherClassReport}
            <div class="teacher-report-grid">
              <article>
                <strong>{teacherClassReport.students.length}</strong>
                <small>Học sinh</small>
              </article>
              <article>
                <strong>{teacherBackendAssignments.length}</strong>
                <small>Assignments</small>
              </article>
              <article>
                <strong>{teacherClassReport.skillStats[0]?.skill || "No weak skill"}</strong>
                <small>Skill yếu nhất</small>
              </article>
              <article>
                <strong>{teacherClassReport.itemStats[0]?.questionId || "No item data"}</strong>
                <small>Câu sai nhiều nhất</small>
              </article>
            </div>
            <div class="assignment-list teacher-report-list">
              {#each teacherClassReport.skillStats.slice(0, 4) as skill}
                <article>
                  <div>
                    <strong>{String(skill.skill || "Unmapped skill")}</strong>
                    <small>{String(skill.attempts || 0)} attempts · {String(skill.wrong || 0)} wrong</small>
                  </div>
                  <span>{String(skill.accuracyPct || 0)}%</span>
                </article>
              {/each}
            </div>
          {/if}
        {:else}
          <p class="muted">Đăng nhập backend bằng tài khoản teacher/admin để tạo lớp, lấy join code và xem evidence report.</p>
        {/if}
        {#if teacherClassMessage}
          <p class="muted">{teacherClassMessage}</p>
        {/if}
      </section>
      <form class="assignment-builder" on:submit={createAssignment}>
        <div>
          <p class="eyebrow">Assignment builder</p>
          <h3>Lớp {classroomModel.classCode}</h3>
        </div>
        <label>
          Tiêu đề
          <input bind:value={assignmentForm.title} />
        </label>
        <label>
          Kỹ năng trọng tâm
          <input bind:value={assignmentForm.focusSkill} />
        </label>
        <label>
          Chế độ
          <select value={assignmentForm.mode} on:change={(event) => updateAssignmentMode(event.currentTarget.value)}>
            <option value="diagnostic">Diagnostic</option>
            <option value="remedial_sprint">Remedial sprint</option>
            <option value="proof_review">Sửa lỗi bằng proof</option>
            <option value="timed_mixed">Timed mixed</option>
          </select>
        </label>
        <label>
          Hạn nộp
          <input bind:value={assignmentForm.dueDate} type="date" />
        </label>
        <button class="primary" type="submit">Tạo bài giao</button>
      </form>
      {#if assignmentMessage}
        <p class="muted">{assignmentMessage}</p>
      {/if}
      {#if classroomAssignments.length}
        <div class="assignment-list">
          {#each classroomAssignments.slice(0, 5) as assignment}
            <article>
              <div>
                <strong>{assignment.title}</strong>
                <small>{assignmentModeLabel(assignment.mode)} · {assignmentDueLabel(assignment)}</small>
                <p>{assignment.focusSkill}</p>
              </div>
              <span class:done={assignmentDone(assignment)}>{assignmentDone(assignment) ? "Đã có evidence" : assignment.classCode}</span>
            </article>
          {/each}
        </div>
      {/if}
      <section class="parent-reward-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Tạo phần thưởng</p>
            <h3>Phần thưởng thực tế theo milestone</h3>
          </div>
          <span>{rewardModel.pendingClaims} yêu cầu chờ duyệt</span>
        </div>
        <form class="assignment-builder reward-builder" on:submit={createParentReward}>
          <label>
            Tên phần thưởng
            <input bind:value={rewardForm.title} />
          </label>
          <label>
            Mô tả
            <input bind:value={rewardForm.description} />
          </label>
          <label>
            Loại
            <select bind:value={rewardForm.rewardType}>
              <option value="experience">Experience</option>
              <option value="privilege">Privilege</option>
              <option value="gift">Gift</option>
              <option value="study_bonus">Study bonus</option>
            </select>
          </label>
          <label>
            Chi phí điểm
            <input bind:value={rewardForm.costPoints} min="1" type="number" />
          </label>
          <label>
            Học sinh
            <select bind:value={rewardTargetStudentId}>
              <option value="">Tất cả học sinh liên kết</option>
              {#each rewardModel.students as student}
                <option value={student.id}>{student.name}</option>
              {/each}
            </select>
          </label>
          <button class="primary" disabled={!rewardModel.canManage} type="submit">Tạo phần thưởng</button>
        </form>
        {#if rewardMessage}
          <p class="muted">{rewardMessage}</p>
        {/if}
        {#if rewardModel.programs.length}
          <div class="assignment-list reward-program-list">
            {#each rewardModel.programs.slice(0, 4) as row}
              <article>
                <div>
                  <strong>{row.program.title}</strong>
                  <small>{row.program.costPoints} pts · {row.targetLabel}</small>
                  <p>{row.program.description}</p>
                </div>
                <span>{row.pendingClaims ? `${row.pendingClaims} pending` : row.program.status}</span>
              </article>
            {/each}
          </div>
        {/if}
        {#if rewardModel.claims.length}
          <div class="assignment-list reward-claim-list">
            {#each rewardModel.claims.slice(0, 4) as row}
              <article>
                <div>
                  <strong>{row.programTitle}</strong>
                  <small>{row.studentName} · {row.claim.costPoints} pts</small>
                </div>
                {#if row.canResolve}
                  <div class="reward-claim-actions">
                    <button type="button" on:click={() => resolveParentRewardClaim(row.claim.id, "fulfill")}>Duyệt</button>
                    <button type="button" on:click={() => resolveParentRewardClaim(row.claim.id, "cancel")}>Hủy</button>
                  </div>
                {:else}
                  <span>{row.claim.status}</span>
                {/if}
              </article>
            {/each}
          </div>
        {/if}
      </section>
      <div class="classroom-list">
        {#each classroomModel.priorityStudents as student}
          <article class={`risk-${student.risk}`}>
            <div>
              <strong>{student.name}</strong>
              <small>{student.band} · mục tiêu {student.targetScore} · {student.accuracy}% đúng</small>
            </div>
            <span>{riskLabel(student.risk)}</span>
            <p>{student.recommendedAssignment}</p>
          </article>
        {/each}
        {#if classroomModel.priorityStudents.length === 0}
          <div class="empty">Chưa có học sinh active trong lớp.</div>
        {/if}
      </div>
    </section>

    <section class="panel parent-backend-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Đồng bộ tiến trình</p>
          <h2>{backendConnected ? "Hồ sơ học sinh đã đồng bộ" : "Đăng nhập phụ huynh"}</h2>
        </div>
        <span>{backendConnected ? backendAccount?.username || backendAccount?.displayName || backendAccount?.id : "Chế độ local"}</span>
      </div>
      {#if backendConnected}
        <div class="backend-parent-row">
          <label>
            Học sinh
            <select bind:value={selectedBackendStudentId} on:change={loadSelectedBackendStudent}>
              {#each backendStudents as student}
                <option value={student.id}>{student.displayName || student.username || student.id}</option>
              {/each}
            </select>
          </label>
          <button disabled={Boolean(backendBusy) || !selectedBackendStudentId} type="button" on:click={loadSelectedBackendStudent}>Tải lại hồ sơ</button>
          <button disabled={Boolean(backendBusy)} type="button" on:click={logoutParentBackend}>Đăng xuất</button>
        </div>
      {:else}
        <form class="backend-parent-row" on:submit={submitBackendLogin}>
          <label>
            Tên đăng nhập
            <input bind:value={backendUsername} autocomplete="username" />
          </label>
          <label>
            Mật khẩu
            <input bind:value={backendPassword} autocomplete="current-password" type="password" />
          </label>
          <button class="primary" disabled={Boolean(backendBusy)} type="submit">Đăng nhập</button>
        </form>
      {/if}
      <p class="muted">{backendMessage}</p>
    </section>

    <section class="metric-grid" aria-label="Parent dashboard metrics">
      {#each model.metrics as metric}
        <article>
          <span>{metric.value}</span>
          <strong>{metric.label}</strong>
          <small>{metric.detail}</small>
        </article>
      {/each}
    </section>

    <section class="parent-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Rủi ro kỹ năng</p>
            <h2>Kỹ năng cần theo dõi</h2>
          </div>
          <span>{model.weakRows.length} mục</span>
        </div>
        {#if model.weakRows.length}
          <div class="skill-list">
            {#each model.weakRows as row}
              <article>
                <div>
                  <strong>{row.skill}</strong>
                  <small>{row.section} / {row.domain}</small>
                </div>
                <span>{row.accuracy}%</span>
                <em>{row.status}</em>
              </article>
            {/each}
          </div>
        {:else}
          <div class="empty">Chưa có attempts local. Hãy cho học sinh làm diagnostic trước.</div>
        {/if}
      </section>

      <section class="panel">
        <p class="eyebrow">Sức khỏe lộ trình</p>
        <h2>Tín hiệu can thiệp</h2>
        {#if model.flags.length}
          <div class="flag-list">
            {#each model.flags as flag}
              <span>{flagLabel(flag)}</span>
            {/each}
          </div>
        {:else}
          <div class="empty">Chưa có cờ rủi ro trong tiến trình local.</div>
        {/if}
        <div class="fact-list">
          <article><small>Cập nhật</small><strong>{model.generatedAt}</strong></article>
          <article><small>Attempts local</small><strong>{model.attempts}</strong></article>
          <article><small>Lượt đúng</small><strong>{model.correct}</strong></article>
          <article><small>Lỗi mở</small><strong>{model.openMistakes}</strong></article>
        </div>
      </section>

      <section class="panel exam-panel">
        <p class="eyebrow">Rà soát điểm thi</p>
        <h2>{examModel.latestScore || "Cần thêm official log"}</h2>
        <p>{examModel.recommendation}</p>
        <div class="fact-list">
          <article><small>Số log official</small><strong>{examModel.logs.length}</strong></article>
          <article><small>Điểm tốt nhất</small><strong>{examModel.bestScore || "--"}</strong></article>
          <article><small>RW gần nhất</small><strong>{examModel.latestRw || "--"}</strong></article>
          <article><small>Math gần nhất</small><strong>{examModel.latestMath || "--"}</strong></article>
        </div>
      </section>
    </section>
  {/if}
</main>

<style>
  .parent-app {
    color: #18212b;
    display: grid;
    gap: 22px;
    margin: 0 auto;
    max-width: 1180px;
    min-height: 100vh;
    padding: 24px;
  }

  .sr-only {
    clip: rect(0 0 0 0);
    border: 0;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .parent-topbar,
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

  button.primary {
    background: #163b5c;
    border-color: #163b5c;
    color: #ffffff;
  }

  .parent-hero,
  .panel,
  .state-panel,
  .metric-grid article {
    background: #ffffff;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    padding: 20px;
  }

  .parent-hero {
    align-items: center;
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .roadmap-strip {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .roadmap-strip article {
    background: #ffffff;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    display: grid;
    gap: 8px;
    padding: 16px;
  }

  .roadmap-strip article.active {
    border-color: #163b5c;
    box-shadow: inset 0 0 0 1px #163b5c;
  }

  .roadmap-strip strong {
    color: #172033;
  }

  .roadmap-strip p {
    color: #516477;
    margin-bottom: 0;
  }

  .parent-hero h2 {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .parent-hero p,
  small,
  .empty,
  .muted {
    color: #516477;
    line-height: 1.5;
  }

  .parent-backend-panel .panel-head span {
    background: #eef3f8;
    border-radius: 999px;
    color: #31546f;
    font-weight: 850;
    padding: 7px 10px;
  }

  .classroom-panel .panel-head span {
    background: #f0f7ff;
    border-radius: 999px;
    color: #245176;
    font-weight: 850;
    padding: 7px 10px;
  }

  .backend-parent-row {
    align-items: end;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto auto;
    margin-top: 12px;
  }

  .teacher-backend-panel {
    background: #fbfcff;
    border: 1px solid #d9e6f2;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    margin: 14px 0;
    padding: 16px;
  }

  .teacher-backend-grid,
  .teacher-class-create,
  .teacher-class-select {
    align-items: end;
    display: grid;
    gap: 12px;
  }

  .teacher-backend-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  }

  .teacher-class-create {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .teacher-class-select {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }

  .backend-assignment-builder {
    grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
    margin: 0;
  }

  .teacher-report-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .teacher-report-grid article {
    background: #ffffff;
    border: 1px solid #d9e6f2;
    border-radius: 8px;
    display: grid;
    gap: 5px;
    padding: 12px;
  }

  .teacher-report-grid strong {
    color: #163b5c;
    font-size: 1.1rem;
  }

  .assignment-builder {
    align-items: end;
    background: #f8fbff;
    border: 1px solid #d9e6f2;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: 1.1fr minmax(160px, 1fr) minmax(160px, 1fr) minmax(150px, 0.8fr) minmax(140px, 0.7fr) auto;
    margin: 14px 0;
    padding: 14px;
  }

  .assignment-builder h3 {
    margin: 0;
  }

  .assignment-list {
    display: grid;
    gap: 10px;
    margin: 12px 0;
  }

  .assignment-list article {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 12px;
  }

  .assignment-list span {
    background: #eef3f8;
    border-radius: 999px;
    color: #31546f;
    font-weight: 850;
    padding: 6px 10px;
  }

  .assignment-list span.done {
    background: #e7f7ee;
    color: #23613d;
  }

  .assignment-list p {
    color: #4c5e70;
    line-height: 1.45;
    margin: 6px 0 0;
  }

  .parent-reward-panel {
    border-top: 1px solid #dbe4ee;
    display: grid;
    gap: 14px;
    margin-top: 10px;
    padding-top: 18px;
  }

  .parent-reward-panel .panel-head span {
    background: #fff4d8;
    border-radius: 999px;
    color: #77520b;
    font-weight: 850;
    padding: 7px 10px;
  }

  .reward-builder {
    grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
  }

  .reward-program-list article,
  .reward-claim-list article {
    background: #fbfdff;
  }

  .reward-claim-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
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
    min-height: 40px;
    padding: 0 12px;
  }

  .status-chip {
    border-radius: 999px;
    font-weight: 850;
    padding: 8px 12px;
    text-transform: uppercase;
  }

  .status-chip.baseline {
    background: #eef3f8;
    color: #31546f;
  }

  .status-chip.repair {
    background: #fff1ed;
    color: #9a3412;
  }

  .status-chip.practice {
    background: #e7f7ee;
    color: #137547;
  }

  .metric-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .compact-classroom-metrics {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    margin: 14px 0;
  }

  .metric-grid article {
    display: grid;
    gap: 8px;
    min-height: 126px;
  }

  .metric-grid span {
    font-size: 1.7rem;
    font-weight: 900;
  }

  .parent-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.7fr);
  }

  .skill-list,
  .fact-list,
  .flag-list,
  .classroom-list {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }

  .classroom-list article {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(0, 1fr) 140px minmax(180px, 0.8fr);
    padding: 12px;
  }

  .classroom-list article.risk-needs_repair {
    background: #fff3e6;
    border-color: #f0c48e;
  }

  .classroom-list article.risk-needs_baseline {
    background: #f8fbff;
    border-color: #cbddee;
  }

  .classroom-list span {
    font-weight: 850;
    text-transform: capitalize;
  }

  .classroom-list p {
    color: #516477;
    font-weight: 760;
    margin-bottom: 0;
  }

  .skill-list article,
  .fact-list article {
    align-items: center;
    border: 1px solid #e1e8f0;
    border-radius: 8px;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(0, 1fr) 70px 120px;
    padding: 12px;
  }

  .skill-list strong,
  .skill-list small {
    display: block;
  }

  .skill-list span,
  .skill-list em,
  .panel-head span {
    font-style: normal;
    font-weight: 850;
  }

  .flag-list {
    display: flex;
    flex-wrap: wrap;
  }

  .flag-list span {
    background: #fff8e6;
    border: 1px solid #f2d58a;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 760;
    padding: 6px 10px;
  }

  .fact-list article {
    grid-template-columns: minmax(0, 1fr);
  }

  .fact-list strong {
    overflow-wrap: anywhere;
  }

  .state-panel.error {
    border-color: #e6a4a4;
    color: #8a2727;
  }

  @media (max-width: 900px) {
    .parent-topbar,
    .panel-head,
    .parent-hero {
      align-items: stretch;
      grid-template-columns: 1fr;
    }

    .metric-grid,
    .compact-classroom-metrics,
    .roadmap-strip,
    .parent-grid,
    .skill-list article,
    .classroom-list article,
    .teacher-backend-grid,
    .teacher-class-create,
    .teacher-class-select,
    .teacher-report-grid,
    .assignment-builder,
    .assignment-list article,
    .backend-parent-row {
      grid-template-columns: 1fr;
    }
  }
</style>
