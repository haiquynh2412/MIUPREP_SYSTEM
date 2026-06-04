const assert = require("node:assert/strict");
const viewRenderers = require("../sat_view_renderers.js");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function run() {
  const html = viewRenderers.renderDiagnosticReadinessCards([
    {
      label: 'Preview <script>alert("x")</script>',
      confidence: "high",
      canStart: true,
      readinessScore: 104,
      selectedCount: 20,
      expectedCount: 20,
      readyCount: 120,
      officialStructure: { moduleCount: 1, totalMinutes: 25 },
      warnings: [],
    },
    {
      label: "Adaptive Diagnostic v2",
      confidence: "medium",
      canStart: false,
      readinessScore: 63.4,
      selectedCount: 70,
      expectedCount: 98,
      readyCount: 90,
      officialStructure: { moduleCount: 4, totalMinutes: 134 },
      warnings: ["Math: No grid-in proof item.", "Expression of Ideas: Needs 2 more ready item(s).", "Extra warning"],
    },
  ]);

  assert.ok(html.includes("Preview &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("data-score=\"100\""), "Readiness score should be capped at 100.");
  assert.ok(html.includes("data-score=\"63\""), "Readiness score should be rounded for the meter.");
  assert.ok(html.includes("Ready - confidence high"));
  assert.ok(html.includes("Needs more coverage - confidence medium"));
  assert.ok(!html.includes("Needs bank review"));
  assert.ok(!html.includes("ready local questions"));
  assert.ok(html.includes("25 min timer required"));
  assert.ok(html.includes("4 modules - 134 min timer required"));
  assert.ok(html.includes("Math: No grid-in proof item."));
  assert.ok(!html.includes("Extra warning"), "Readiness cards should only show the first two warnings.");

  const adminHtml = viewRenderers.renderAdminCenter({
    visible: true,
    release: { ready: true, label: "System health clear", detail: "10 questions, 8 approved, 2 waiting for review" },
    publicRelease: {
      ready: false,
      label: "Public release blocked",
      detail: "Blocked public candidates: 1",
      manifestReady: 4,
      publicCandidates: 5,
      blockedCandidates: 1,
      sourceSigned: 4,
      sourceUnsigned: 0,
      openAuditEntries: 0,
      blockers: [{ label: "Blocked public candidates clear", value: 1 }],
    },
    metrics: [{ label: "Questions", value: 10, detail: "8 approved", tone: "ok" }],
    queue: [{ title: "<bad>", eyebrow: "Data", body: "Review row", detail: "blocked", priority: "blocked", targetView: "sources" }],
    users: { total: 3, admins: 1, parents: 1, students: 1, publicLearners: 0, unlinkedStudents: 0, missingProfiles: 0 },
    questions: {
      total: 10,
      approved: 8,
      pending: 2,
      blocked: 1,
      publicReady: 4,
      publicPending: 1,
      generatedNeedsReview: 1,
      openAuditQuestions: 1,
      openAuditEntries: 2,
      fileBacked: 7,
      localDrafts: 3,
      browserLoaded: 10,
      originalDrafts: 1,
    },
    firewall: { publicCandidates: 10, privateFamily: 20, vaultItems: 2, blockedAudit: 1, highRiskPublicCandidates: 3 },
    system: { reportLoaded: true, readinessLoaded: true, critical: 0, blockedRows: 1, warnings: 2, warningIssues: 3, loadedTotal: 10, coreReadyReviewed: 8 },
    curriculum: {
      topPriorities: [{ priority: "P1", label: "Math / Advanced Math", detail: "27.3% now vs 35% official", target: "author" }],
      domainGaps: [{ priority: "P1", section: "Math", domain: "Advanced Math", actualPct: 27.3, officialPct: 35, deltaPctPoints: -7.7, additionalNeededIfOnlyAddingThisDomain: 437, tone: "warn", action: "Create targeted items." }],
      uploadGate: {
        title: "Hợp đồng batch tiếp theo",
        phase: {
          label: "Phase A",
          total: 64,
          purpose: "High ROI Algebra and Advanced Math upload gate.",
          domains: [
            {
              domain: "Algebra",
              total: 28,
              familyAllocation: [["Linear functions", 6]],
              difficulty: { Medium: 13, Hard: 12 },
              format: { MC: 22, SPR: 6 },
              bands: { "SAT-Core": 9, "SAT-Elite": 6 },
            },
          ],
        },
        gates: [{ label: "Schema and taxonomy", status: "required", detail: "Stable metadata." }],
        postUploadChecks: [{ label: "Quality suite", command: "node scripts\\run_quality_checks.js", purpose: "Run all gates." }],
      },
      quality: {
        cards: [{ label: "Expert score", value: "6.2/10", detail: "accurate_pool_with_blueprint_balance_gaps", tone: "warn" }],
        flags: [{ priority: "P1", label: "Upgrade explanations.", target: "bank" }],
      },
      thinSkills: [{ skill: "Nonlinear equations in one variable", count: 22, hardCount: 14 }],
      surplusTopics: [{ topic: "hypotenuse", visibleCount: 78, totalCount: 103, overflowCount: 43, recommendedAction: "review_or_hide_easy_medium_clones" }],
    },
    contentPlanner: {
      hydrated: true,
      heatmap: [
        { section: "Math", domain: "Algebra", count: 1840, actualPct: 33.2, officialPct: 35, needed: 154, difficulty: { Easy: 200, Medium: 300, Hard: 400 } },
      ],
      bandRows: [{ band: "1550+", focus: "hard transfer", ready: 4500 }],
      targets: [{ section: "Math", domain: "Advanced Math", skills: ["Nonlinear equations"], guidance: "Add hard context items." }],
    },
    actions: [{ label: "Bank Manager", targetView: "bank" }],
    rolePreview: {
      parent: { accountId: "parent-1", name: "Parent One", childCount: 1 },
      student: { accountId: "student-1", name: "Student One" },
    },
  });
  assert.ok(adminHtml.includes("Tổng quan vận hành admin"));
  assert.ok(adminHtml.includes("Bảng điều phối admin"));
  assert.ok(adminHtml.includes("Scope số liệu"));
  assert.ok(adminHtml.includes("Review SOP"));
  assert.ok(adminHtml.includes("Chỉ duyệt khi qua đủ 6 cửa"));
  assert.ok(adminHtml.includes("Content admin workflow"));
  assert.ok(adminHtml.includes("Trung tâm kế hoạch nội dung"));
  assert.ok(adminHtml.includes("Hợp đồng batch tiếp theo"));
  assert.ok(adminHtml.includes("Phòng kiểm định chất lượng"));
  assert.ok(adminHtml.includes("Content heatmap"));
  assert.ok(adminHtml.includes("node scripts\\run_quality_checks.js"));
  assert.ok(adminHtml.includes("Math / Advanced Math"));
  assert.ok(adminHtml.includes("Xem thử vai trò"));
  assert.ok(adminHtml.includes("data-admin-account-target=\"parent-1\""));
  assert.ok(adminHtml.includes("data-admin-account-target=\"student-1\""));
  assert.ok(adminHtml.includes("Hộp việc ưu tiên"));
  assert.ok(adminHtml.includes("Việc có ROI cao nhất trước"));
  assert.ok(adminHtml.includes("Mở Sources"));
  assert.ok(adminHtml.includes("Cổng phát hành public"));
  assert.ok(adminHtml.includes("Public release blocked") || adminHtml.includes("Phát hành đang bị chặn"));
  assert.ok(adminHtml.includes("Sẵn sàng public"));
  assert.ok(adminHtml.includes("admin-export-public-manifest"));
  assert.ok(adminHtml.includes("Xuất artifact manifest"));
  assert.ok(adminHtml.includes("Blocked public candidates clear"));
  assert.ok(adminHtml.includes("Quản lý người dùng"));
  assert.ok(adminHtml.includes("Ngân hàng câu hỏi"));
  assert.ok(adminHtml.includes("Toàn bank audit"));
  assert.ok(adminHtml.includes("Original Draft source"));
  assert.ok(adminHtml.includes("Tường an toàn public"));
  assert.ok(adminHtml.includes("One-click confidence"));
  assert.ok(!adminHtml.includes("SAT 2026 balance"));
  assert.ok(adminHtml.includes("&lt;bad&gt;"));
  assert.ok(!adminHtml.includes("<bad>"));

  let selectedAnswerForExplanation = "";
  const reviewHtml = viewRenderers.renderDiagnosticReview(
    {
      reviewItems: [
        {
          questionId: "q1",
          selectedAnswer: "C",
          correctAnswer: "B",
          correct: false,
          moduleLabel: "RW Module 1",
          adaptiveRoute: "standard",
        },
      ],
    },
    {
      getQuestionById: () => ({
        id: "q1",
        section: "Reading and Writing",
        domain: "Craft and Structure",
        difficulty: "Hard",
        prompt: "Which choice best completes the text?",
        choices: { A: "Therefore", B: "However", C: "Similarly", D: "For example" },
        correctAnswer: "B",
        explanation: { correct: "Contrast is required.", distractors: { C: "Similarly removes the contrast." } },
        sourceType: "ai_generated",
        sourceName: "SAT Studio",
        licenseNote: "Original draft",
      }),
      isGridInQuestion: () => false,
      labelFor: (value) => (value === "standard" ? "Standard" : value),
      renderExplanation: (value, selectedAnswer) => {
        selectedAnswerForExplanation = selectedAnswer;
        return `Explanation for ${selectedAnswer}: ${value.correct}`;
      },
    },
  );

  assert.ok(reviewHtml.includes("Wrong: chose C"));
  assert.ok(reviewHtml.includes("correct-answer"));
  assert.ok(reviewHtml.includes("selected-wrong"));
  assert.ok(reviewHtml.includes("RW Module 1 - Standard"));
  assert.equal(selectedAnswerForExplanation, "C", "Diagnostic review should pass the student's selected answer to explanation rendering.");

  const roadmapHtml = viewRenderers.renderRoadmapEvaluationPanel(
    {
      baseline: 1450,
      target: 1600,
      gap: 150,
      confidence: { label: "Medium", detail: "Needs one full timed diagnostic." },
      skillCount: 18,
      testReadyCount: 12,
      practiceAttempts: 44,
      attemptsSinceBuild: 6,
      taggedErrors: 9,
      topError: { label: "careless error" },
      weakCount: 4,
      masteredCount: 7,
      priorityRows: [{ skill: "Cross-text connections <x>", status: "Weak", mastery: 42, dominantErrorType: "evidence_gap" }],
      nextReview: "Review after 2 proof attempts.",
      risks: ["Too few hard RW items."],
      actions: ["Run hard transfer set."],
    },
    { errorTagLabel: (value) => (value === "evidence_gap" ? "Evidence gap" : value) },
  );
  assert.ok(roadmapHtml.includes("Baseline 1450 -&gt; target 1600"));
  assert.ok(roadmapHtml.includes("Cross-text connections &lt;x&gt;"));
  assert.ok(roadmapHtml.includes("Evidence gap"));

  const eliteHtml = viewRenderers.renderEliteReadinessPanel({
    score: 88,
    band: "Elite-ready",
    averageMastery: 91,
    hardAttempts: 20,
    hardAccuracy: 85,
    fullDiagnostics: 2,
    coverage: { checks: [{ label: "Hard grid-in", count: 8, target: 10 }] },
    missions: [{ title: "Hard transfer", body: "Finish 10 no-calculator proof items." }],
  });
  assert.ok(eliteHtml.includes("Elite-ready"));
  assert.ok(eliteHtml.includes("Hard grid-in"));
  assert.ok(eliteHtml.includes("value=\"80\""));

  const remediationHtml = viewRenderers.renderRemediationQueue(
    [
      {
        status: "due",
        errorType: "concept_gap",
        dueAt: "2026-05-18T00:00:00Z",
        skill: "Quadratic equations",
        domain: "Advanced Math",
        difficulty: "Hard",
        lessonTitle: "Quadratic traps",
        action: "Review vertex and roots.",
        tutorDiagnosis: {
          label: "Knowledge gap",
          rootCause: "Quadratic structure is not stable.",
          teachFirst: "Quadratic traps",
          proofTarget: "Pass a transfer item.",
          severity: "high",
        },
        scaffoldDrill: {
          title: "Foundation scaffold",
          prompt: "Do 3 scaffold items.",
        },
        passCondition: {
          condition: "Correct and on pace.",
        },
        failAction: {
          action: "Return to deeper lesson.",
        },
        proofQuestion: { difficulty: "Hard", domain: "Advanced Math" },
        proofQuestionId: "q-proof",
        attemptId: "attempt-1",
        lessonTaskKey: "lesson-1",
      },
    ],
    {
      labelFor: (value) => value.toUpperCase(),
      errorTagLabel: () => "Concept gap",
      formatDate: () => "May 18",
      lessonScopeKey: () => "Math|Advanced Math|Quadratic equations",
    },
  );
  assert.ok(remediationHtml.includes("Quadratic equations"));
  assert.ok(remediationHtml.includes("data-proof-question-id=\"q-proof\""));
  assert.ok(remediationHtml.includes("Math|Advanced Math|Quadratic equations"));
  assert.ok(remediationHtml.includes("Tutor: high"));
  assert.ok(remediationHtml.includes("Teach first: Quadratic traps"));
  assert.ok(remediationHtml.includes("Scaffold: Foundation scaffold"));
  assert.ok(remediationHtml.includes("Pass condition: Correct and on pace."));
  assert.ok(remediationHtml.includes("Fail route: Return to deeper lesson."));
  assert.ok(remediationHtml.includes("Proof target: Pass a transfer item."));

  const stem = viewRenderers.renderQuestionStem({
    section: "Reading and Writing",
    prompt:
      "A researcher compared two texts about migration patterns. The first text emphasized wind patterns, while the second emphasized food supply.\n\nWhich choice best describes the relationship between the two texts?",
  });
  assert.ok(stem.includes("split-question-layout"));
  assert.ok(stem.includes("Which choice best describes"));

  const mathStem = viewRenderers.renderQuestionStem({
    section: "Math",
    prompt: "The equation $y = x^2 - 6x + k$ has exactly one real solution when $y = 0$. What is $k$?",
  });
  assert.ok(mathStem.includes("math-inline"));
  assert.ok(mathStem.includes("x<sup>2</sup>"));
  assert.equal(mathStem.includes("$y"), false);

  const answerHtml = viewRenderers.renderAnswerInputHtml(
    { choices: { A: "Less than < 5", B: "$x^2$" }, questionType: "multiple_choice" },
    "answer",
    { isGridInQuestion: () => false },
  );
  assert.ok(answerHtml.includes("Less than &lt; 5"));
  assert.ok(answerHtml.includes("x<sup>2</sup>"));
  assert.ok(answerHtml.includes("eliminate-choice"));

  const navHtml = viewRenderers.renderPracticeQuestionNavigator([
    { index: 0, current: true, answered: true, marked: true },
    { index: 1, current: false, answered: false, marked: false },
  ]);
  assert.ok(navHtml.includes("practice-nav-button current answered marked"));
  assert.ok(navHtml.includes("data-practice-index=\"0\""));
  assert.ok(navHtml.includes(">M</small>"));

  const gridHtml = viewRenderers.renderAnswerInputHtml({ questionType: "grid_in" }, "grid", { isGridInQuestion: () => true });
  assert.ok(gridHtml.includes("grid-response-input"));
  assert.ok(gridHtml.includes("name=\"grid\""));

  const endedFeedback = viewRenderers.renderPracticeSessionEndedFeedback({ mode: "Exam Drill <x>", reason: "time_expired" });
  assert.ok(endedFeedback.includes("Exam Drill &lt;x&gt; ended"));
  assert.ok(endedFeedback.includes("Time expired."));
  assert.ok(!endedFeedback.includes("<x>"));

  const knowledgeHtml = viewRenderers.renderKnowledgeReviewCard(
    { skill: "Transitions" },
    {
      title: "Review <transition>",
      rule: "Contrast needs a contrast word.",
      steps: [["1. Read", "Compare sentence roles <carefully>"]],
      drill: "Same direction or contrast?",
    },
    { resourcesHtml: '<a href="https://example.com">Resource</a>' },
  );
  assert.ok(knowledgeHtml.includes("Review &lt;transition&gt;"));
  assert.ok(knowledgeHtml.includes("Compare sentence roles &lt;carefully&gt;"));
  assert.ok(knowledgeHtml.includes("review-same-skill"));
  assert.ok(knowledgeHtml.includes("<a href=\"https://example.com\">Resource</a>"));

  const feedbackHtml = viewRenderers.renderPracticeFeedback(
    {
      questionType: "grid_in",
      explanation: "Subtract <2> from both sides.",
    },
    {
      correct: false,
      selectedAnswer: "3",
      attempt: { selectedAnswer: "3", timeSpentSeconds: 95, pacingFlag: "slow_correct" },
      knowledgeReviewHtml: '<section class="knowledge-review-card">Review first</section>',
      tutorExplanationLayer: {
        title: "AI Tutor explanation",
        provider: { mode: "local_rule_based" },
        errorLabel: "Calculation",
        selectedAnswer: "3",
        selectedAnswerText: "Intermediate value <x>",
        correctAnswer: "7/2",
        correctAnswerText: "Accepted value",
        rootCause: "The setup was close <check arithmetic>.",
        choiceAnalysis: {
          likelyReason: "The submitted value missed the final operation.",
          selectedRationale: "Redo the last operation before choosing.",
        },
        selectedTrapCoaching: { repairMove: "Redo the arithmetic before selecting." },
        hintSteps: [
          { title: "Hint 1: Find the task", prompt: "Write the first equation." },
          { title: "Full solution", prompt: "Subtract correctly." },
        ],
        lesson: { title: "Review equations" },
        scaffoldDrill: { title: "Clean execution", prompt: "Write each step." },
        proof: { target: "Pass one fresh proof question.", questionId: "q-proof" },
      },
    },
    {
      isGridInQuestion: () => true,
      getCorrectAnswerLabel: () => "7/2",
      pacingLabel: () => "Slow correct",
      targetSecondsForQuestion: () => 75,
      renderExplanation: (value, selected) => `Expl ${selected}: ${escapeHtml(value)}`,
    },
  );
  assert.ok(feedbackHtml.includes("Needs review"));
  assert.ok(feedbackHtml.includes("Slow correct: 95s"));
  assert.ok(feedbackHtml.includes("about 75s"));
  assert.ok(feedbackHtml.includes("Accepted answer: <strong>7/2</strong>"));
  assert.ok(feedbackHtml.includes("AI Tutor explanation"));
  assert.ok(feedbackHtml.includes("Intermediate value &lt;x&gt;"));
  assert.ok(feedbackHtml.includes("The setup was close &lt;check arithmetic&gt;."));
  assert.ok(feedbackHtml.includes("Progressive hints"));
  assert.ok(feedbackHtml.includes("Redo the arithmetic before selecting."));
  assert.ok(feedbackHtml.includes("Proof question: q-proof"));
  assert.ok(feedbackHtml.includes("Expl 3: Subtract &lt;2&gt;"));
  assert.ok(feedbackHtml.includes("Review first"));

  const tutorHtml = viewRenderers.renderTutorExplanationLayer({
    title: "AI Tutor explanation",
    provider: { mode: "local_rule_based" },
    errorLabel: "Trap answer",
    selectedAnswer: "C",
    selectedAnswerText: "True but irrelevant detail",
    correctAnswer: "D",
    rootCause: "The choice answers a different task.",
    choiceAnalysis: {
      likelyReason: "Choice C was tempting because it matched the topic.",
      selectedRationale: "It does not answer the actual question.",
    },
    selectedTrapCoaching: { repairMove: "Write the task before choosing." },
    hintSteps: [{ title: "Hint 1: Find the task", prompt: "Compare the two text claims." }],
    lesson: { title: "Cross-text connections" },
    scaffoldDrill: { title: "Trap elimination", prompt: "Name why every wrong choice is wrong." },
    proof: { target: "Pass a transfer item." },
  });
  assert.ok(tutorHtml.includes("data-tutor-provider=\"local_rule_based\""));
  assert.ok(tutorHtml.includes("Trap answer"));
  assert.ok(tutorHtml.includes("Cross-text connections"));
  assert.ok(tutorHtml.includes("Progressive hints"));
  assert.ok(tutorHtml.includes("Write the task before choosing."));

  const practiceView = viewRenderers.renderPracticeQuestionView(
    {
      section: "Reading and Writing",
      domain: "Craft <Structure>",
      skill: "Transitions <x>",
      difficulty: "Hard",
      reviewStatus: "needs_review",
      sourceType: "ai_generated",
      sourceName: "SAT Studio",
      licenseNote: "Original <draft>",
      prompt:
        "A researcher compared two city plans. The first plan reduced downtown traffic, while the second plan increased transit access.\n\nWhich choice best describes the relationship between the two plans?",
    },
    {
      index: 2,
      total: 5,
      targetSeconds: 75,
      labelFor: (value) => ({ needs_review: "Needs review", ai_generated: "AI Generated" })[value] || value,
    },
  );
  assert.equal(practiceView.counterText, "Question 3 of 5");
  assert.equal(practiceView.skillText, "Craft <Structure> - Transitions <x>");
  assert.ok(practiceView.badgesHtml.includes("Needs review"));
  assert.ok(practiceView.badgesHtml.includes("AI Generated"));
  assert.ok(practiceView.badgesHtml.includes("Target 75s"));
  assert.ok(practiceView.stemHtml.includes("split-question-layout"));
  assert.ok(practiceView.stemHtml.includes("Which choice best describes"));
  assert.equal(practiceView.splitStem, true);
  assert.equal(practiceView.sourceText, "SAT Studio");
  assert.equal(practiceView.licenseText, "Original <draft>");
  assert.ok(!practiceView.badgesHtml.includes("<x>"));

  const studentPracticeView = viewRenderers.renderPracticeQuestionView(
    {
      section: "Reading and Writing",
      domain: "Craft and Structure",
      skill: "Transitions",
      difficulty: "Hard",
      reviewStatus: "needs_review",
      sourceType: "ai_generated",
      sourceName: "SAT Studio",
      licenseNote: "Original draft",
      prompt: "A researcher compared two city plans.\n\nWhich choice best describes the relationship?",
    },
    {
      index: 0,
      total: 1,
      studentMode: true,
      targetSeconds: 75,
      labelFor: (value) => ({ needs_review: "Needs review", ai_generated: "AI Generated" })[value] || value,
    },
  );
  assert.ok(!studentPracticeView.badgesHtml.includes("Needs review"));
  assert.ok(!studentPracticeView.badgesHtml.includes("AI Generated"));
  assert.ok(studentPracticeView.badgesHtml.includes("Reading and Writing"));
  assert.ok(studentPracticeView.badgesHtml.includes("Target 75s"));
  assert.equal(studentPracticeView.sourceText, "");
  assert.equal(studentPracticeView.licenseText, "");

  const emptyPracticeView = viewRenderers.renderPracticeQuestionView(null);
  assert.equal(emptyPracticeView.counterText, "Question 0 of 0");
  assert.ok(emptyPracticeView.stemHtml.includes("No questions match"));

  const pacingHtml = viewRenderers.renderPacingAnalyticsPanel(
    [
      { questionId: "q0", fromPretest: true, timeSpentSeconds: 999, pacingFlag: "slow_correct" },
      { questionId: "q1", timeSpentSeconds: 80, pacingFlag: "slow_correct" },
      { questionId: "q2", timeSpentSeconds: 20, pacingFlag: "fast_wrong" },
      { questionId: "q3", timeSpentSeconds: 60, pacingFlag: "time_pressure" },
    ],
    {
      getQuestionById: (id) => ({ skill: id === "q3" ? "Transitions <x>" : "Other" }),
      pacingLabel: (value) => (value === "time_pressure" ? "Time pressure" : value),
    },
  );
  assert.ok(pacingHtml.includes("53s"));
  assert.ok(pacingHtml.includes("slow correct"));
  assert.ok(pacingHtml.includes("fast wrong"));
  assert.ok(pacingHtml.includes("time pressure"));
  assert.ok(pacingHtml.includes("Transitions &lt;x&gt;"));
  assert.ok(pacingHtml.includes("Time pressure"));
  assert.ok(viewRenderers.renderPacingAnalyticsPanel([]).includes("Pacing appears"));

  const lessonListHtml = viewRenderers.renderLessonList(
    [
      { key: "lesson-1", stage: "SAT Core", skill: "Transitions <x>", domain: "Expression <Ideas>", questions: [1, 2], queueCount: 1 },
      { key: "lesson-2", stage: "SAT Transfer", skill: "Boundaries", domain: "Conventions", questions: [], queueCount: 0 },
    ],
    "lesson-1",
  );
  assert.ok(lessonListHtml.includes("lesson-list-card active"));
  assert.ok(lessonListHtml.includes("Transitions &lt;x&gt;"));
  assert.ok(lessonListHtml.includes("Expression &lt;Ideas&gt;"));
  assert.ok(viewRenderers.renderLessonList([]).includes("No lessons match"));

  const lessonDetailHtml = viewRenderers.renderLessonDetail(
    {
      key: "lesson-1",
      section: "Reading and Writing",
      domain: "Expression <Ideas>",
      skill: "Transitions <x>",
      stage: "SAT Core",
      mastery: 64,
      status: "Needs review",
      queueCount: 1,
      coverageScore: 88,
      ladder: [{ stage: "SAT Core", goal: "Choose logical transitions.", exit: "Pass two drills.", active: true }],
      subskills: ["Contrast <however>"],
      stagePlaybook: [{ stage: "SAT Core", focus: "Map sentence relationship.", drill: "Contrast or result?", pass: "2/2", active: true }],
      rule: "Choose the transition that matches the relationship.",
      steps: [["1. Compare", "Check direction <first>"]],
      example: "Sentence two contrasts with sentence one.",
      drill: "Same direction or contrast?",
      traps: ["Choosing familiar words <blindly>"],
      scaffold: [{ difficulty: "Hard", sourceType: "ai_generated" }],
      scaffoldDrills: [
        {
          title: "Foundation scaffold <fast>",
          instructions: "Translate first, then prove.",
          count: 3,
          questionIds: ["q1", "q2"],
        },
      ],
      proofDrills: [
        {
          title: "Timed proof <hard>",
          passCondition: "Correct under target time.",
          count: 2,
          questionIds: ["q3"],
        },
      ],
      externalLinkTargets: [
        {
          provider: "Khan <Academy>",
          intent: "digital-sat-reading-writing",
          match: "Expression / Transitions",
        },
      ],
    },
    { labelFor: (value) => (value === "ai_generated" ? "AI Generated" : value), resourcesHtml: '<a href="https://example.com">Resource</a>' },
  );
  assert.ok(lessonDetailHtml.includes("Transitions &lt;x&gt;"));
  assert.ok(lessonDetailHtml.includes("64% mastery"));
  assert.ok(lessonDetailHtml.includes("Contrast &lt;however&gt;"));
  assert.ok(lessonDetailHtml.includes("AI Generated"));
  assert.ok(lessonDetailHtml.includes("Foundation scaffold &lt;fast&gt;"));
  assert.ok(lessonDetailHtml.includes("Proof drills"));
  assert.ok(lessonDetailHtml.includes("Timed proof &lt;hard&gt;"));
  assert.ok(lessonDetailHtml.includes("External link targets"));
  assert.ok(lessonDetailHtml.includes("Khan &lt;Academy&gt;"));
  assert.ok(lessonDetailHtml.includes("lesson-start-drill"));
  assert.ok(lessonDetailHtml.includes("<a href=\"https://example.com\">Resource</a>"));
  assert.ok(!lessonDetailHtml.includes("<script>"));
  assert.ok(viewRenderers.renderLessonDetail(null).includes("Choose a lesson"));

  const topicSummaryHtml = viewRenderers.renderTopicSummary({ count: 12, reviewed: 8, needsReview: 4, skillLabel: "Transitions <x>", sourceLabels: "AI <Generated>" });
  assert.ok(topicSummaryHtml.includes("12"));
  assert.ok(topicSummaryHtml.includes("Transitions &lt;x&gt;"));
  assert.ok(topicSummaryHtml.includes("AI &lt;Generated&gt;"));

  const topicCardsHtml = viewRenderers.renderTopicCards([
    { section: "Reading and Writing", domain: "Expression <Ideas>", skill: "Transitions <x>", count: 12, reviewed: 8, needsReview: 4 },
  ]);
  assert.ok(topicCardsHtml.includes("topic-card-button"));
  assert.ok(topicCardsHtml.includes("data-skill=\"Transitions &lt;x&gt;\""));
  assert.ok(topicCardsHtml.includes("Expression &lt;Ideas&gt;"));
  assert.ok(viewRenderers.renderTopicCards([]).includes("No topics match"));

  const examReportHtml = viewRenderers.renderExamReviewReport(
    {
      mode: "5-Minute Sprint <x>",
      correct: 1,
      totalQuestions: 2,
      accuracy: 50,
      attempted: 2,
      avgSeconds: 74,
      endedAt: "2026-05-18T02:00:00Z",
      issueCounts: { wrong: 1, skipped: 0, slowCorrect: 1, timePressure: 0, marked: 1 },
      readinessSignal: {
        label: "Teach before retest <script>",
        detail: "Clear the queue first.",
        nextAction: "Review priority queue.",
      },
      pacingProfile: { label: "Accuracy too slow", budgetDelta: -18, onPaceRate: 50, overTarget: 1, fastWrong: 0, slowCorrect: 1 },
      coachPlan: {
        summary: "Tutor plan <strong>",
        nextBestAction: "Review the missed transition.",
        weeklyPlan: [{ label: "Day 1", action: "Redo the explanation." }],
      },
      reviewPriorityQueue: [
        {
          index: 2,
          skill: "Transitions <x>",
          domain: "Craft and Structure",
          errorType: "concept_gap",
          reviewPriority: { reason: "Wrong answer; review explanation." },
        },
      ],
      domainBreakdown: [
        { section: "Reading and Writing", domain: "Craft <Structure>", correct: 1, attempted: 2, total: 2, accuracy: 50, avgSeconds: 74, skipped: 0, pacingDelta: -18 },
      ],
      skillGroups: [
        { skill: "Transitions <x>", masteryStage: "Build", correct: 1, total: 2, avgSeconds: 74, recommendation: "Do one transfer item." },
      ],
      mistakeLedger: [
        {
          status: "open",
          skill: "Transitions <x>",
          domain: "Craft and Structure",
          difficulty: "Hard",
          errorType: "concept_gap",
          selectedAnswer: "C",
          correctAnswer: "B",
          timeSpentSeconds: 91,
          taggedBy: "student",
          taggedAt: "2026-05-18T02:01:00Z",
          remediationAction: "Review contrast transitions.",
          dueAt: "2026-05-19T00:00:00Z",
        },
      ],
      rows: [
        {
          index: 1,
          attempted: true,
          correct: true,
          timeSpentSeconds: 57,
          targetSeconds: 65,
          pacingLabel: "On pace",
          skill: "Linear equations",
          domain: "Algebra",
          masteryStage: "Prove",
          mastery: 82,
          recommendation: "Maintain.",
        },
        {
          index: 2,
          attempted: true,
          correct: false,
          markedForReview: true,
          timeSpentSeconds: 91,
          targetSeconds: 70,
          pacingLabel: "Slow",
          skill: "Transitions <x>",
          domain: "Craft and Structure",
          errorType: "concept_gap",
          masteryStage: "Build",
          mastery: 34,
          recommendation: "Review then retry.",
        },
      ],
    },
    {
      formatDateTime: (value) => `date-time:${value}`,
      formatDate: (value) => `date:${value}`,
      errorTagLabel: (value) => (value === "concept_gap" ? "Concept gap" : value),
    },
  );
  assert.ok(examReportHtml.includes("Exam Review Report"));
  assert.ok(examReportHtml.includes("5-Minute Sprint &lt;x&gt;"));
  assert.ok(examReportHtml.includes("date-time:2026-05-18T02:00:00Z"));
  assert.ok(examReportHtml.includes("18s over target budget"));
  assert.ok(examReportHtml.includes("Tutor plan &lt;strong&gt;"));
  assert.ok(examReportHtml.includes("Transitions &lt;x&gt;"));
  assert.ok(examReportHtml.includes("Craft &lt;Structure&gt;"));
  assert.ok(examReportHtml.includes("Concept gap"));
  assert.ok(examReportHtml.includes("date:2026-05-19T00:00:00Z"));
  assert.ok(examReportHtml.includes("82% mastery"));
  assert.ok(!examReportHtml.includes("<script>"));

  const emptyLedgerHtml = viewRenderers.renderExamMistakeLedger([]);
  assert.ok(emptyLedgerHtml.includes("No wrong, slow, skipped, or marked attempts"));

  const backendStatus = viewRenderers.renderPublicBackendStatus(
    {
      statusLevel: "ok",
      statusTitle: "Backend session active",
      statusMessage: "Synced.",
      account: { username: "admin", role: "admin" },
      lastHealth: { service: "SAT Studio public backend", adminCount: 1 },
      sessionExpiresAt: 1779060000,
      lastProfileSyncAt: "2026-05-18T01:00:00Z",
      lastServerProfileRevision: 2,
      lastServerProfileSummary: { attempts: 12 },
      pendingServerProfileRevision: 3,
      pendingServerProfileSummary: { attempts: 15 },
      pendingServerProfileDiff: {
        local: { attempts: 12, pretests: 1, studyNotes: 2, vocabKnown: 3, lessonProgress: 4, practiceReports: 1 },
        server: { attempts: 15, pretests: 2, studyNotes: 2, vocabKnown: 5, lessonProgress: 4, practiceReports: 2 },
      },
      lastMonitoring: { counts: { accounts: 4, activeSessions: 1 }, database: { sizeBytes: 2048 } },
    },
    { formatDateTime: (value) => `date:${value}`, formatBytes: (value) => `${value} bytes`, hasPendingProfileRecord: true },
  );
  assert.equal(backendStatus.className, "public-backend-status ok");
  assert.ok(backendStatus.html.includes("Backend session active"));
  assert.ok(backendStatus.html.includes("admin - admin"));
  assert.ok(backendStatus.html.includes("revision 2"));
  assert.ok(backendStatus.html.includes("Server profile pending review"));
  assert.ok(backendStatus.html.includes("Local 12 -> Server 15"));
  assert.ok(backendStatus.html.includes("ready to apply"));
  assert.ok(backendStatus.html.includes("2048 bytes"));
  assert.ok(!backendStatus.html.includes("<script>"));

  const weakSkillsHtml = viewRenderers.renderDashboardWeakSkills([{ skill: "Transitions <x>", section: "RW", wrong: 3, priority: "high" }]);
  assert.ok(weakSkillsHtml.includes("Transitions &lt;x&gt;"));
  assert.ok(weakSkillsHtml.includes("3 wrong"));
  assert.ok(viewRenderers.renderDashboardWeakSkills([]).includes("empty-state"));

  const loopHtml = viewRenderers.renderDashboardLoop([{ step: "1", title: "Pretest", body: "Baseline <1500>" }]);
  assert.ok(loopHtml.includes("Baseline &lt;1500&gt;"));

  const questHtml = viewRenderers.renderDailyQuests([{ title: "Answer <10>", current: 10, target: 10, reward: "+20 pts", pct: 100 }]);
  assert.ok(questHtml.includes("complete"));
  assert.ok(questHtml.includes("Answer &lt;10&gt;"));
  const hiddenQuestHtml = viewRenderers.renderDailyQuests([{ title: "Proof <1>", current: 0, target: 1, reward: "+15 pts", pct: 0, hidden: true, revealed: false }]);
  assert.ok(hiddenQuestHtml.includes("Hidden SAT mission"));
  assert.ok(hiddenQuestHtml.includes("Make progress to reveal"));

  const rewardHtml = viewRenderers.renderRewardBoard([{ icon: "*", name: "Starter <Spark>", unlocked: false, remaining: 15, pointsToUnlockLabel: "pts left" }]);
  assert.ok(rewardHtml.includes("Starter &lt;Spark&gt;"));
  assert.ok(rewardHtml.includes("15 pts left"));
  const hiddenRewardHtml = viewRenderers.renderRewardBoard([{ icon: "?", name: "Hidden <Badge>", hidden: true, description: "Reveal <soon>", unlocked: false }]);
  assert.ok(hiddenRewardHtml.includes("reward-sticker locked hidden"));
  assert.ok(hiddenRewardHtml.includes("Reveal &lt;soon&gt;"));

  const logsHtml = viewRenderers.renderExternalStudyLogs(
    [{ source: "Khan <Academy>", minutes: 15, topic: "Algebra", note: "Watched <video>", at: "2026-05-18" }],
    { formatDate: () => "May 18" },
  );
  assert.ok(logsHtml.includes("Khan &lt;Academy&gt;"));
  assert.ok(logsHtml.includes("Watched &lt;video&gt;"));

  const parentHome = {
    summary: {
      studentCount: 1,
      scheduledStudents: 1,
      nextSessionLabel: "May 20",
      nextSessionStudent: "Learner <One>",
      dueWork: 2,
      openMistakes: 3,
      officialLogs: 1,
      externalMinutes: 40,
    },
    priority: {
      title: "Due work needs attention",
      body: "Start with remediation <proof>.",
      needsAction: 1,
      unscheduled: 0,
      dueNow: 2,
    },
    weeklyReport: {
      studyMinutes: 42,
      practiceMinutes: 22,
      externalMinutes: 20,
      questions: 12,
      accuracy: 67,
      proofPassed: 1,
      proofFailed: 1,
      officialLogs: 1,
      blockers: ["Learner <One>: Boundaries <x> (42%)"],
      stuckSkills: [
        {
          studentName: "Learner <One>",
          skill: "Boundaries <x>",
          accuracy: 42,
          projectedGain: 35,
          action: "Learn 3 min -> targeted 10 -> proof 2 fresh on Boundaries <x>.",
        },
      ],
      parentActions: ["Start with 2 due remediation items before fresh practice."],
      qualitySignals: { slowCorrect: 1, marked: 2, proofPassRate: 50 },
    },
    rows: [
      {
        id: "student-1",
        name: "Learner <One>",
        targetScore: 1500,
        weeklyTarget: 4,
        nextSessionLabel: "May 20",
        dueRemediation: 2,
        openMistakes: 3,
        proofPassed: 1,
        proofFailed: 0,
        officialLogCount: 1,
        latestOfficialLog: { label: "Bluebook - wrong", reference: "Practice Test <8>" },
        latestExternalLog: { label: "Khan - 20 min", topic: "Boundaries <x>" },
        weakFocus: "Boundaries <x>",
        priority: "due",
        actionLabel: "Review due remediation",
      },
    ],
  };
  const parentSummaryHtml = viewRenderers.renderParentHomeSummary(parentHome);
  const parentPlanHtml = viewRenderers.renderParentHomePlan(parentHome);
  assert.ok(parentSummaryHtml.includes("Learner &lt;One&gt;"));
  assert.ok(parentPlanHtml.includes("Schedule and parent action"));
  assert.ok(parentPlanHtml.includes("Weekly report"));
  assert.ok(parentPlanHtml.includes("Start with 2 due remediation items"));
  assert.ok(parentPlanHtml.includes("+35 point potential"));
  assert.ok(parentPlanHtml.includes("targeted 10"));
  assert.ok(parentPlanHtml.includes("Review due remediation"));
  assert.ok(parentPlanHtml.includes("Practice Test &lt;8&gt;"));
  assert.ok(parentPlanHtml.includes("Boundaries &lt;x&gt;"));
  assert.ok(!parentPlanHtml.includes("<proof>"));

  const coachHtml = viewRenderers.renderCoachDashboard({
    visible: true,
    title: "Admin <Coach>",
    subtitle: "Progress <audit>",
    summary: {
      studentCount: 1,
      attemptedStudentCount: 1,
      accuracy: 66,
      avgSeconds: 74,
      openMistakes: 3,
      dueRemediation: 2,
      proofPassed: 1,
      proofFailed: 1,
      externalMinutes: 40,
    },
    students: [
      {
        id: "student-1",
        name: "Learner <One>",
        targetScore: 1500,
        latestBaseline: 1320,
        accuracy: 66,
        avgSeconds: 74,
        attempts: 12,
        openMistakes: 3,
        dueRemediation: 2,
        proofPassed: 1,
        proofFailed: 1,
        externalMinutes: 40,
        externalLogCount: 2,
        officialLogCount: 1,
        weeklyTarget: 4,
        nextSessionLabel: "May 20",
        latestOfficialLog: { label: "Bluebook - wrong", skill: "Boundaries <x>" },
        latestExternalLog: { label: "Khan Academy - 20 min", topic: "Boundaries <x>" },
        topSubskill: { skill: "Boundaries", accuracy: 42 },
        subskills: [{ skill: "Boundaries <x>", accuracy: 42, wrong: 4 }],
      },
    ],
    adminAudit: {
      openAuditCount: 1,
      openAuditEntries: 2,
      needsReviewCount: 9,
      blockedCount: 3,
      generatedNeedsReviewCount: 4,
      integrityBlockedCount: 2,
      integrityCriticalCount: 1,
      overrepresentedTopicCount: 5,
      publicCandidateCount: 20,
      privateFamilyCount: 30,
      adminOnlyCount: 2,
      vaultCount: 6,
      firewallRiskCount: 0,
    },
  });
  assert.ok(coachHtml.includes("Admin &lt;Coach&gt;"));
  assert.ok(coachHtml.includes("Learner &lt;One&gt;"));
  assert.ok(coachHtml.includes("Subskill accuracy"));
  assert.ok(coachHtml.includes("Remediation due"));
  assert.ok(coachHtml.includes("Proof pass/fail"));
  assert.ok(coachHtml.includes("Official logs"));
  assert.ok(coachHtml.includes("Question audit"));
  assert.ok(coachHtml.includes("Public/private/vault firewall"));
  assert.ok(coachHtml.includes("Boundaries &lt;x&gt;"));
  assert.ok(!coachHtml.includes("<script>"));
  assert.equal(viewRenderers.renderCoachDashboard({ visible: false }), "");
}

run();
console.log("view_renderers_unit_tests: pass");
