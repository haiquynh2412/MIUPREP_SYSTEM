const assert = require("node:assert/strict");
const adminViewRenderers = require("../sat_admin_view_renderers.js");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function run() {
  const html = adminViewRenderers.renderGenerationIntakePanel(
    {
      maxActivePerTopic: 35,
      summary: {
        total: 3,
        blocked: 1,
        needsReview: 1,
        remedial: 0,
        ready: 1,
        bySource: {
          'ai_generated<script>': 2,
          antigravity: 1,
        },
      },
      rows: [
        {
          id: "ai-1<script>",
          status: "blocked",
          section: "Math",
          skill: "Linear equations",
          promptPreview: "If x < y, which <choice> is true?",
          issues: ["duplicate_prompt<script>"],
          warnings: [],
        },
      ],
    },
    {
      labelFor: (value) => String(value).replace(/_/g, " "),
      lastApplied: {
        appliedAt: "2026-05-18T00:00:00.000Z",
        changedCount: 3,
      },
    },
  );

  assert.ok(html.includes("Generated bank intake gate"));
  assert.ok(html.includes("integrity-apply-intake"));
  assert.ok(html.includes("changed 3"));
  assert.ok(html.includes("ai generated&lt;script&gt;"));
  assert.ok(html.includes("ai-1&lt;script&gt;"));
  assert.ok(html.includes("which &lt;choice&gt; is true?"));
  assert.ok(!html.includes("<script>"), "Admin renderer must escape generated source and prompt text.");

  const sourceHtml = adminViewRenderers.renderSourceLedgerCards(
    {
      'ai_generated<script>': {
        name: "AI <Generated>",
        note: "Review <carefully>",
        use: "Private review",
        risk: "Medium",
      },
    },
    {
      'ai_generated<script>': {
        count: 12,
        rejectedTemplate: 2,
        hiddenSkeleton: 3,
      },
    },
  );
  assert.ok(sourceHtml.includes("AI &lt;Generated&gt;"));
  assert.ok(sourceHtml.includes("12 questions"));
  assert.ok(sourceHtml.includes("2 template variants hidden"));
  assert.ok(sourceHtml.includes("3 skeleton duplicates hidden"));
  assert.ok(!sourceHtml.includes("<Generated>"));

  const archiveSummary = adminViewRenderers.renderArchiveRegistrySummary(
    {
      documents: [{ path: "SAT/Test <One>.pdf", fileType: "pdf", risk: "High" }],
      summary: { totalFiles: 1, fileTypes: { pdf: 1 }, riskCounts: { High: 1 } },
    },
    { generatedTotal: 4, vaultTotal: 2 },
  );
  assert.ok(archiveSummary.includes("1</strong><span>source files"));
  assert.ok(archiveSummary.includes("4</strong><span>AI drafts"));

  const archiveList = adminViewRenderers.renderArchiveRegistryList(
    [
      {
        path: "SAT/Test <One>.pdf",
        risk: "High",
        sourceType: "commercial_prep",
        role: "practice_test",
        recommendation: "private",
        pageCount: 10,
        sizeBytes: 1048576,
        vaultCount: 2,
        stats: { total: 4, needsReview: 1, reviewed: 2, rejected: 1 },
      },
    ],
    { labelFor: (value) => value.replace(/_/g, " ") },
  );
  assert.ok(archiveList.includes("Test &lt;One&gt;.pdf"));
  assert.ok(archiveList.includes("4</strong><span>generated"));
  assert.ok(archiveList.includes("data-source-reference=\"SAT/Test &lt;One&gt;.pdf\""));
  assert.ok(!archiveList.includes("<One>"));

  const noPublication = adminViewRenderers.renderPublicationStatus(null, { ok: false, reason: "No question selected." }, { isContentAdmin: true });
  assert.equal(noPublication.buttonHidden, true);
  assert.equal(noPublication.buttonDisabled, true);
  assert.equal(noPublication.statusClassName, "publication-status blocked");
  assert.equal(noPublication.statusText, "Choose a question to review publication status.");

  const readyPublication = adminViewRenderers.renderPublicationStatus(
    { id: "q1", visibility: "private_family" },
    { ok: true, reason: "Ready for review." },
    { isContentAdmin: true },
  );
  assert.equal(readyPublication.buttonHidden, false);
  assert.equal(readyPublication.buttonDisabled, false);
  assert.equal(readyPublication.buttonText, "Promote to Public Candidate");
  assert.equal(readyPublication.statusClassName, "publication-status ready");

  const publicPublication = adminViewRenderers.renderPublicationStatus(
    { id: "q2", visibility: "public_candidate" },
    { ok: false, reason: "Already visible as a public candidate." },
    { isContentAdmin: true },
  );
  assert.equal(publicPublication.buttonText, "Public Candidate");
  assert.equal(publicPublication.statusClassName, "publication-status public");

  const emptyAudit = adminViewRenderers.renderQuestionAuditLog(null, []);
  assert.equal(emptyAudit.className, "question-audit-log empty-state");
  assert.ok(emptyAudit.html.includes("Choose a question"));

  const auditLog = adminViewRenderers.renderQuestionAuditLog(
    { id: "q1" },
    [
      {
        issueType: "wrong_answer<script>",
        severity: "high",
        status: "open",
        reportedByName: "Student <One>",
        reportedAt: "2026-05-18T01:00:00.000Z",
        note: "Answer seems <wrong>",
      },
      {
        issueType: "source_policy",
        severity: "medium",
        status: "resolved",
        reportedBy: "admin",
        reportedAt: "2026-05-18T02:00:00.000Z",
        note: "Reviewed",
        resolution: "Fixed <source>",
        resolvedAt: "2026-05-18T03:00:00.000Z",
      },
    ],
    {
      labelFor: (value) => String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      formatDateTime: (value) => `date:${value}`,
    },
  );
  assert.equal(auditLog.className, "question-audit-log");
  assert.ok(auditLog.html.includes("2 audit reports"));
  assert.ok(auditLog.html.includes("1 open"));
  assert.match(auditLog.html, /Wrong Answer&lt;[sS]cript&gt;/);
  assert.ok(auditLog.html.includes("Student &lt;One&gt;"));
  assert.ok(auditLog.html.includes("Answer seems &lt;wrong&gt;"));
  assert.ok(!auditLog.html.includes("<script>"));

  const draftHtml = adminViewRenderers.renderGeneratedDraftReviewCard(
    {
      id: "draft-1",
      section: "Math",
      domain: "Algebra",
      skill: "Linear <Equations>",
      difficulty: "Hard",
      sourceType: "ai_generated",
      reviewStatus: "reviewed",
      visibility: "private_family",
      practicePool: "core_pool",
      prompt: "If <x> + 2 = 5, what is x?",
      choices: { A: "2<script>", B: "3", C: "4", D: "5" },
      correctAnswer: "B",
      explanation: "Subtract <2> from both sides.",
      sourceReference: "Kaplan <Book>.pdf",
      sourceSignalId: "sig<1>",
      sourceQuestionIndex: 7,
      autoCheck: { status: "passed" },
    },
    {
      labelFor: (value) => String(value).replace(/_/g, " "),
      practicePool: (question) => question.practicePool,
      renderExplanation: (value) => `<em>${escapeHtml(value)}</em>`,
    },
  );
  assert.ok(draftHtml.includes("Readable review"));
  assert.ok(draftHtml.includes("Linear &lt;Equations&gt;"));
  assert.ok(draftHtml.includes("If &lt;x&gt; + 2 = 5"));
  assert.ok(draftHtml.includes("Auto-check passed"));
  assert.ok(draftHtml.includes("B. 3"));
  assert.ok(draftHtml.includes("Kaplan &lt;Book&gt;.pdf"));
  assert.ok(draftHtml.includes("sig&lt;1&gt; #7"));
  assert.ok(!draftHtml.includes("<script>"));

  const gridDraftHtml = adminViewRenderers.renderGeneratedDraftReviewCard({
    section: "Math",
    domain: "Advanced Math",
    skill: "Quadratic equations",
    difficulty: "Medium",
    questionType: "grid_in",
    prompt: "What is 7/2 as a decimal?",
    correctAnswer: "3.5",
    acceptableAnswers: ["7/2", "3.5"],
    explanation: "7 divided by 2 = 3.5.",
  });
  assert.ok(gridDraftHtml.includes("Student-produced response"));
  assert.ok(gridDraftHtml.includes("Accepted: 7/2"));

  const hiddenSignals = adminViewRenderers.renderSourceSignalList([], { canAccessPrivateContent: false });
  assert.equal(hiddenSignals.className, "signal-list empty-state");
  assert.ok(hiddenSignals.html.includes("Public accounts cannot view private source signals."));

  const signalsHtml = adminViewRenderers.renderSourceSignalList(
    [
      {
        id: "archive-signal-1<script>",
        sourceKind: "commercial_prep",
        sourceReference: "Book <One>.pdf",
        domain: "Algebra",
        skill: "Linear <equations>",
        difficulty: "Hard",
        mistakePattern: "Student copied <wrong> operation.",
      },
    ],
    {
      canAccessPrivateContent: true,
      labelFor: (value) => String(value).replace(/_/g, " "),
      getSignalDraftStats: () => ({ total: 2, needsReview: 1, reviewed: 1, rejected: 0 }),
    },
  );
  assert.equal(signalsHtml.className, "signal-list");
  assert.ok(signalsHtml.html.includes("1 source signals ready"));
  assert.ok(signalsHtml.html.includes("1 from SAT archive"));
  assert.ok(signalsHtml.html.includes("Linear &lt;equations&gt;"));
  assert.ok(signalsHtml.html.includes("Book &lt;One&gt;.pdf"));
  assert.ok(signalsHtml.html.includes("2 draft"));
  assert.ok(signalsHtml.html.includes("data-signal-id=\"archive-signal-1&lt;script&gt;\""));
  assert.ok(!signalsHtml.html.includes("<script>"));

  const importResultHtml = adminViewRenderers.renderBankImportResult({
    imported: 4,
    fileName: "Bank <A>.json",
    forcePrivateVault: true,
    activeVaultSourceReference: "SAT/File <One>.pdf",
  });
  assert.ok(importResultHtml.includes("4 questions imported"));
  assert.ok(importResultHtml.includes("Bank &lt;A&gt;.json"));
  assert.ok(importResultHtml.includes("SAT/File &lt;One&gt;.pdf"));
  assert.ok(!importResultHtml.includes("<A>"));

  const intakeHtml = adminViewRenderers.renderVaultIntakeReady({ sourceReference: "SAT/File <One>.pdf" });
  assert.ok(intakeHtml.includes("Vault intake ready"));
  assert.ok(intakeHtml.includes("SAT/File &lt;One&gt;.pdf"));

  const vaultSummaryHtml = adminViewRenderers.renderVaultSummary({
    total: 8,
    reviewed: 3,
    needsReview: 5,
    sources: 2,
    activeVaultSourceReference: "SAT/File <One>.pdf",
  });
  assert.ok(vaultSummaryHtml.includes("8</strong><span>private vault questions"));
  assert.ok(vaultSummaryHtml.includes("SAT/File &lt;One&gt;.pdf"));

  const hiddenVaultHtml = adminViewRenderers.renderVaultSummary({ hidden: true });
  assert.ok(hiddenVaultHtml.includes("Vault Mode is hidden"));

  const pendingPdfHtml = adminViewRenderers.renderPdfInspectPending({ fileName: "Official <Test>.pdf", sizeMb: "1.25" });
  assert.ok(pendingPdfHtml.includes("Official &lt;Test&gt;.pdf"));
  assert.ok(pendingPdfHtml.includes("Inspecting the PDF locally"));

  const errorPdfHtml = adminViewRenderers.renderPdfInspectError({ fileName: "Official.pdf", sizeMb: "1.25", message: "server <down>" });
  assert.ok(errorPdfHtml.includes("server &lt;down&gt;"));

  const inspectionHtml = adminViewRenderers.renderPdfInspection({
    title: "Official <Test>",
    filename: "Official.pdf",
    sizeMb: "1.25",
    pageCount: 32,
    extractablePagesSampled: 4,
    risk: "High",
    recommendation: "Metadata-only log recommended. Do not import question text.",
    warnings: ["Do not copy <text>"],
    metadataOnly: true,
  });
  assert.ok(inspectionHtml.includes("Official &lt;Test&gt;"));
  assert.ok(inspectionHtml.includes("Do not copy &lt;text&gt;"));
  assert.ok(inspectionHtml.includes("log-pdf-metadata"));

  const questionManagerHtml = adminViewRenderers.renderQuestionAdminManager(
    {
      summary: { total: 2, reviewed: 1, needsReview: 1, blocked: 0, hiddenDuplicate: 0, publicReady: 1 },
      groups: [{ section: "Math", domain: "Algebra", skill: "Linear <equations>", total: 2, needsReview: 1 }],
      rows: [
        {
          id: "q<1>",
          section: "Math",
          domain: "Algebra",
          skill: "Linear <equations>",
          difficulty: "Medium",
          sourceType: "original",
          sourceName: "Original <Bank>",
          reviewStatus: "needs_review",
          visibility: "private_family",
          publicationStatus: "private_similarity_review",
          practicePool: "core_pool",
          prompt: "What is x if x + 1 = 2?",
          choices: { A: "0", B: "1", C: "2", D: "3" },
          correctAnswer: "B",
          explanation: "Subtract 1.",
        },
      ],
      selectedQuestionId: "q<1>",
      selectedQuestion: {
        id: "q<1>",
        section: "Math",
        domain: "Algebra",
        skill: "Linear <equations>",
        difficulty: "Medium",
        sourceType: "original",
        sourceName: "Original <Bank>",
        licenseNote: "Original <safe>",
        reviewStatus: "needs_review",
        visibility: "private_family",
        publicationStatus: "private_similarity_review",
        practicePool: "core_pool",
        prompt: "What is x if x + 1 = 2?",
        choices: { A: "0", B: "1", C: "2", D: "3" },
        correctAnswer: "B",
        explanation: "Subtract 1.",
      },
      filteredCount: 1,
    },
    { labelFor: (value) => String(value).replace(/_/g, " "), renderExplanation: (value) => value },
  );
  assert.ok(questionManagerHtml.includes("question-management-table"));
  assert.ok(questionManagerHtml.includes("Linear &lt;equations&gt;"));
  assert.ok(questionManagerHtml.includes("Original &lt;Bank&gt;"));
  assert.ok(questionManagerHtml.includes("Quality gate"));
  assert.ok(questionManagerHtml.includes("Format"));
  assert.ok(questionManagerHtml.includes("Trap"));
  assert.ok(questionManagerHtml.includes('data-question-action="reviewed"'));
  assert.ok(questionManagerHtml.includes('data-question-group-action="open"'));
  assert.ok(!questionManagerHtml.includes("<equations>"));
}

run();
console.log("admin_view_renderers_unit_tests: pass");
