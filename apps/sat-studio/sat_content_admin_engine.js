(function initSatContentAdminEngine(root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }
  if (root) {
    root.SatContentAdminEngine = engine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatContentAdminEngine() {
  const PHASE_A_PLAN = {
    label: "Phase A",
    total: 64,
    purpose: "High-ROI upload gate for Algebra and Advanced Math only.",
    domains: [
      {
        domain: "Algebra",
        total: 28,
        familyAllocation: [
          ["Linear equations in one variable", 5],
          ["Linear equations in two variables", 6],
          ["Linear functions", 6],
          ["Systems of two linear equations in two variables", 7],
          ["Linear inequalities in one or two variables", 4],
        ],
        difficulty: { Easy: 3, Medium: 13, Hard: 12 },
        format: { MC: 22, SPR: 6 },
        bands: { "G10-Bridge": 5, "SAT-Core": 9, "SAT-Advanced": 8, "SAT-Elite": 6 },
      },
      {
        domain: "Advanced Math",
        total: 36,
        familyAllocation: [
          ["Equivalent expressions", 8],
          ["Nonlinear equations in one variable", 11],
          ["Systems of equations in two variables", 7],
          ["Nonlinear functions", 10],
        ],
        difficulty: { Easy: 2, Medium: 11, Hard: 23 },
        format: { MC: 28, SPR: 8 },
        bands: { "G10-Bridge": 6, "SAT-Core": 12, "SAT-Advanced": 11, "SAT-Elite": 7 },
      },
    ],
  };

  const PHASE_B_PLAN = {
    label: "Phase B",
    total: 160,
    purpose: "Run only after Phase A passes integrity, expert-quality, readiness, and browser smoke checks.",
    domains: [
      {
        domain: "Algebra",
        total: 70,
        familyAllocation: [
          ["Linear equations in one variable", 13],
          ["Linear equations in two variables", 14],
          ["Linear functions", 15],
          ["Systems of two linear equations in two variables", 18],
          ["Linear inequalities in one or two variables", 10],
        ],
        difficulty: { Easy: 7, Medium: 32, Hard: 31 },
        format: { MC: 55, SPR: 15 },
        bands: { "G10-Bridge": 13, "SAT-Core": 22, "SAT-Advanced": 21, "SAT-Elite": 14 },
      },
      {
        domain: "Advanced Math",
        total: 90,
        familyAllocation: [
          ["Equivalent expressions", 20],
          ["Nonlinear equations in one variable", 27],
          ["Systems of equations in two variables", 18],
          ["Nonlinear functions", 25],
        ],
        difficulty: { Easy: 6, Medium: 27, Hard: 57 },
        format: { MC: 70, SPR: 20 },
        bands: { "G10-Bridge": 16, "SAT-Core": 29, "SAT-Advanced": 27, "SAT-Elite": 18 },
      },
    ],
  };

  const POST_UPLOAD_CHECKS = [
    {
      label: "Quality suite",
      command: "node scripts\\run_quality_checks.js",
      purpose: "Syntax, unit, backend, integrity, and readiness checks.",
    },
    {
      label: "Expert reviewed-pool audit",
      command: "python scripts\\audit_reviewed_question_expert_quality.py",
      purpose: "Answer accuracy, explanation depth, distractor teaching, and breadth.",
    },
    {
      label: "Algebra and Advanced Math blueprint",
      command: "python scripts\\analyze_algebra_advanced_blueprint.py",
      purpose: "Confirms the upload improves the intended SAT Math gaps.",
    },
    {
      label: "Browser smoke",
      command: "python scripts\\browser_smoke_test.py --url http://127.0.0.1:8765/",
      purpose: "Checks student/admin flows after the bank changes.",
    },
  ];

  function asNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function arraysFrom(value) {
    return Array.isArray(value) ? value : [];
  }

  function readinessDomainRows(readiness = {}) {
    const balance = readiness.domainBalance || {};
    return [
      ...arraysFrom(balance.coreReadyReadingWriting).map((row) => ({ ...row, section: "Reading and Writing" })),
      ...arraysFrom(balance.coreReadyMath).map((row) => ({ ...row, section: "Math" })),
    ];
  }

  function priorityForDomainGap(row = {}) {
    const section = row.section || "";
    const domain = row.domain || "";
    const delta = asNumber(row.deltaPctPoints);
    if (section === "Math" && ["Algebra", "Advanced Math"].includes(domain) && delta <= -3) return "P1";
    if (delta <= -3 || delta >= 3) return "P2";
    return "P3";
  }

  function buildDomainGaps(readiness = {}) {
    return readinessDomainRows(readiness)
      .filter((row) => Math.abs(asNumber(row.deltaPctPoints)) >= 3)
      .map((row) => {
        const delta = asNumber(row.deltaPctPoints);
        return {
          section: row.section || "",
          domain: row.domain || "",
          count: asNumber(row.count),
          actualPct: asNumber(row.actualPct),
          officialPct: asNumber(row.officialPct),
          deltaPctPoints: delta,
          additionalNeededIfOnlyAddingThisDomain: asNumber(row.additionalNeededIfOnlyAddingThisDomain),
          balance: row.balance || (delta < 0 ? "underrepresented" : "overrepresented"),
          priority: priorityForDomainGap(row),
          tone: delta < 0 ? "warn" : "surplus",
          action:
            delta < 0
              ? "Create or promote targeted core items for this domain."
              : "Do not add more normal core items; route surplus clones to remediation or hidden duplicate.",
        };
      })
      .sort((a, b) => {
        const order = { P1: 0, P2: 1, P3: 2 };
        return order[a.priority] - order[b.priority] || Math.abs(b.deltaPctPoints) - Math.abs(a.deltaPctPoints);
      });
  }

  function buildThinSkillRows(readiness = {}, expertAudit = {}) {
    const readinessRows = arraysFrom(readiness.thinCoreReadyMathSubskills || readiness.thinCoreMathSubskills);
    const expertRows = arraysFrom(expertAudit.breadth?.thinCoreMathSkillsUnder35);
    const bySkill = new Map();
    [...readinessRows, ...expertRows].forEach((row) => {
      const skill = row.skill || row.subskill || "";
      if (!skill) return;
      const current = bySkill.get(skill) || { skill, count: 0, hardCount: 0 };
      current.count = Math.max(asNumber(current.count), asNumber(row.count));
      current.hardCount = Math.max(asNumber(current.hardCount), asNumber(row.hardCount));
      bySkill.set(skill, current);
    });
    return [...bySkill.values()].sort((a, b) => a.count - b.count || a.skill.localeCompare(b.skill)).slice(0, 8);
  }

  function buildSurplusTopics(integrityReport = {}) {
    return Object.entries(integrityReport.topicGovernancePlan || {})
      .map(([topic, row]) => ({
        topic,
        visibleCount: asNumber(row?.visibleCount),
        totalCount: asNumber(row?.count),
        overflowCount: asNumber(row?.overflowCount),
        keepTarget: asNumber(row?.keepTarget, 35),
        recommendedAction: row?.recommendedAction || "review_or_hide_easy_medium_clones",
        candidateIds: arraysFrom(row?.candidateIds).slice(0, 6),
      }))
      .filter((row) => row.overflowCount > 0)
      .sort((a, b) => b.overflowCount - a.overflowCount || b.visibleCount - a.visibleCount)
      .slice(0, 6);
  }

  function buildItemAnalyticsSignals(itemAnalytics = {}) {
    const rows = arraysFrom(itemAnalytics.rows);
    const flaggedRows = rows
      .filter((row) => arraysFrom(row.flags).some((flag) => ["low_discrimination", "very_hard_or_unclear", "too_easy_for_routing"].includes(flag)))
      .sort((a, b) => arraysFrom(b.flags).length - arraysFrom(a.flags).length || asNumber(b.responseCount) - asNumber(a.responseCount))
      .slice(0, 8)
      .map((row) => ({
        questionId: row.questionId || "",
        section: row.section || "",
        domain: row.domain || "",
        skill: row.skill || "",
        difficulty: row.difficulty || "",
        responseCount: asNumber(row.responseCount),
        calibrationResponseCount: asNumber(row.calibrationResponseCount),
        helpedResponseCount: asNumber(row.helpedResponseCount),
        pValue: row.pValue,
        discriminationIndex: row.discriminationIndex,
        flags: arraysFrom(row.flags),
      }));
    return {
      loaded: Boolean(itemAnalytics.version),
      attemptCount: asNumber(itemAnalytics.attemptCount),
      calibrationAttemptCount: asNumber(itemAnalytics.calibrationAttemptCount),
      readyPValue: asNumber(itemAnalytics.readyPValue),
      readyDiscrimination: asNumber(itemAnalytics.readyDiscrimination),
      lowQuality: asNumber(itemAnalytics.lowQuality),
      helpedResponseCount: rows.reduce((sum, row) => sum + asNumber(row.helpedResponseCount), 0),
      readiness: itemAnalytics.readiness || {},
      flaggedRows,
    };
  }

  function buildQualitySignals({ expertAudit = {}, integrityReport = {}, readiness = {}, itemAnalytics = {} } = {}) {
    const scorecard = expertAudit.scorecard || {};
    const depth = expertAudit.depth || {};
    const summary = integrityReport.summary || {};
    const inventory = readiness.inventory || {};
    const accuracyBlockers = asNumber(scorecard.accuracyBlockerCount);
    const depthGapCount = asNumber(scorecard.depthGapCount || depth.depthGapQuestionCount);
    const genericDistractors = asNumber(depth.genericDistractorTeachingCount);
    const hardMultiStepPct = asNumber(depth.hardMathMultiStepHeuristicPctOfHardMath);
    const warningQuestions = asNumber(summary.warningQuestionCount);
    const repeatedTopics = asNumber(summary.overrepresentedTopicCount);
    const loaded = Boolean(expertAudit && Object.keys(expertAudit).length);
    const itemSignals = buildItemAnalyticsSignals(itemAnalytics);

    const cards = [
      {
        label: "Expert score",
        value: loaded ? `${asNumber(scorecard.overallExpertScore10).toFixed(1)}/10` : "Missing",
        detail: scorecard.verdict || "Run expert audit after each upload.",
        tone: loaded && asNumber(scorecard.overallExpertScore10) >= 8 ? "ok" : "warn",
      },
      {
        label: "Accuracy blockers",
        value: accuracyBlockers,
        detail: "must remain zero before any publish gate",
        tone: accuracyBlockers ? "danger" : "ok",
      },
      {
        label: "Depth gaps",
        value: depthGapCount,
        detail: "items that need stronger teaching value",
        tone: depthGapCount ? "warn" : "ok",
      },
      {
        label: "Generic traps",
        value: genericDistractors,
        detail: "MC explanations with weak distractor teaching",
        tone: genericDistractors ? "warn" : "ok",
      },
      {
        label: "Hard Math depth",
        value: `${hardMultiStepPct.toFixed(1)}%`,
        detail: "hard Math that looks context-rich and multi-step",
        tone: hardMultiStepPct >= 15 ? "ok" : "warn",
      },
      {
        label: "Core-ready reviewed",
        value: asNumber(inventory.coreReadyReviewed),
        detail: `${asNumber(inventory.studyVisibleExcludingHidden)} study-visible excluding hidden`,
        tone: "neutral",
      },
      {
        label: "p-value ready",
        value: itemSignals.loaded ? itemSignals.readyPValue : "No logs",
        detail: `${itemSignals.calibrationAttemptCount} independent calibration attempts`,
        tone: itemSignals.readyPValue ? "ok" : "warn",
      },
      {
        label: "Discrimination ready",
        value: itemSignals.loaded ? itemSignals.readyDiscrimination : "No logs",
        detail: `${itemSignals.lowQuality} low-quality item flag(s)`,
        tone: itemSignals.lowQuality ? "warn" : itemSignals.readyDiscrimination ? "ok" : "neutral",
      },
      {
        label: "Helped responses",
        value: itemSignals.helpedResponseCount,
        detail: "excluded from calibration when help was pre-submit",
        tone: itemSignals.helpedResponseCount ? "neutral" : "ok",
      },
    ];

    const flags = [
      accuracyBlockers
        ? {
            priority: "P0",
            label: "Repair accuracy blockers before any new release.",
            target: "bank",
          }
        : null,
      depthGapCount
        ? {
            priority: "P1",
            label: "Upgrade explanations and trap teaching before expanding public use.",
            target: "bank",
          }
        : null,
      repeatedTopics
        ? {
            priority: "P2",
            label: "Route repeated topic overflow to remediation or hidden duplicate.",
            target: "sources",
          }
        : null,
      warningQuestions
        ? {
            priority: "P2",
            label: "Keep warnings visible but separate from launch blockers.",
            target: "bank",
          }
        : null,
      itemSignals.lowQuality
        ? {
            priority: "P1",
            label: "Review item analytics flags before trusting calibrated routing.",
            target: "bank",
          }
        : null,
    ].filter(Boolean);

    return {
      loaded,
      cards,
      flags,
      accuracyBlockers,
      depthGapCount,
      genericDistractors,
      hardMultiStepPct,
      warningQuestions,
      repeatedTopics,
      itemAnalytics: itemSignals,
    };
  }

  function buildUploadGate({ domainGaps = [], quality = {} } = {}) {
    const algebraAdvancedGap = domainGaps.some((row) => row.section === "Math" && ["Algebra", "Advanced Math"].includes(row.domain) && row.deltaPctPoints < 0);
    return {
      title: "Next upload contract",
      phase: PHASE_A_PLAN,
      nextPhase: PHASE_B_PLAN,
      gates: [
        {
          label: "Schema and taxonomy",
          status: "required",
          detail: "Every uploaded row needs section, domain, skill, difficulty, source, review status, and stable id.",
        },
        {
          label: "Targeted blueprint",
          status: algebraAdvancedGap ? "active" : "monitor",
          detail: algebraAdvancedGap ? "Prioritize Algebra and Advanced Math; avoid new PSDA/Geometry core rows for now." : "Blueprint gap is stable; use expert audit to choose the next batch.",
        },
        {
          label: "Teaching depth",
          status: quality.depthGapCount ? "required" : "clear",
          detail: "Each new MC item should include correct route, fast route, and specific traps for wrong choices.",
        },
        {
          label: "Source safety",
          status: "required",
          detail: "Official/commercial source text must stay metadata-only unless rights are explicit.",
        },
        {
          label: "Post-upload audit",
          status: "required",
          detail: "Run integrity, expert-quality, readiness, and browser smoke checks before marking the batch done.",
        },
      ],
      postUploadChecks: POST_UPLOAD_CHECKS,
    };
  }

  function buildContentAdminCommandModel({ readiness = {}, integrityReport = {}, expertAudit = {}, questions = [], itemAnalytics = {} } = {}) {
    const domainGaps = buildDomainGaps(readiness);
    const quality = buildQualitySignals({ expertAudit, integrityReport, readiness, itemAnalytics });
    const thinSkills = buildThinSkillRows(readiness, expertAudit);
    const surplusTopics = buildSurplusTopics(integrityReport);
    const uploadGate = buildUploadGate({ domainGaps, quality });
    const topPriorities = [
      ...domainGaps.filter((row) => row.priority === "P1").slice(0, 4).map((row) => ({
        priority: row.priority,
        label: `${row.section} / ${row.domain}`,
        detail: `${row.actualPct}% now vs ${row.officialPct}% official (${row.deltaPctPoints > 0 ? "+" : ""}${row.deltaPctPoints} pp)`,
        target: "author",
      })),
      ...quality.flags.slice(0, 3),
      ...surplusTopics.slice(0, 2).map((row) => ({
        priority: "P2",
        label: `Topic overflow: ${row.topic}`,
        detail: `${row.visibleCount}/${row.totalCount} visible; overflow ${row.overflowCount}`,
        target: "sources",
      })),
    ].slice(0, 8);

    return {
      reportLoaded: Boolean(readiness && Object.keys(readiness).length) || Boolean(integrityReport && Object.keys(integrityReport).length),
      questionCount: arraysFrom(questions).length,
      domainGaps,
      quality,
      thinSkills,
      surplusTopics,
      uploadGate,
      topPriorities,
      phaseA: PHASE_A_PLAN,
      phaseB: PHASE_B_PLAN,
    };
  }

  function firstAdminCount(...values) {
    for (const value of values) {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
    return null;
  }

  function isAdminBankHydrated(reportTotal, browserTotal) {
    const report = Number(reportTotal || 0);
    const browser = Number(browserTotal || 0);
    return report > 0 && browser >= Math.max(1, Math.floor(report * 0.95));
  }

  function buildAdminContentHeatmap(readiness = {}, questions = [], reportTotal = 0) {
    const domainRows = [...arraysFrom(readiness.domainBalance?.coreReadyMath), ...arraysFrom(readiness.domainBalance?.coreReadyReadingWriting)];
    const coreQuestions = arraysFrom(questions).filter(
      (q) =>
        q.reviewStatus === "reviewed" &&
        !["rejected", "blocked", "audit_blocked", "intake_blocked", "hidden_duplicate"].includes(q.publicationStatus) &&
        (q.practicePool || q.skeletonDiversity?.practicePool || "core_pool") === "core_pool",
    );
    const hydrated = isAdminBankHydrated(reportTotal, questions.length);
    const byDomainDifficulty = new Map();
    coreQuestions.forEach((question) => {
      const key = `${question.section || ""}||${question.domain || ""}`;
      const entry = byDomainDifficulty.get(key) || { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };
      const difficulty = ["Easy", "Medium", "Hard"].includes(question.difficulty) ? question.difficulty : "Unknown";
      entry[difficulty] += 1;
      byDomainDifficulty.set(key, entry);
    });
    const heatmap = domainRows.map((row) => {
      const section = ["Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry"].includes(row.domain) ? "Math" : "Reading and Writing";
      const needed = Math.max(Number(row.additionalNeededIfOnlyAddingThisDomain || 0), Math.max(-Number(row.deltaCountAtCurrentTotal || 0), 0));
      return {
        section,
        domain: row.domain,
        count: Number(row.count || 0),
        actualPct: row.actualPct,
        officialPct: row.officialPct,
        needed,
        balance: row.balance || "unknown",
        difficulty: byDomainDifficulty.get(`${section}||${row.domain}`) || {},
        confidence: hydrated ? "full_bank" : "report_only",
      };
    });
    const targets = Array.isArray(readiness.balancePlan?.nextGenerationTargets) ? readiness.balancePlan.nextGenerationTargets : [];
    const bandRows = [
      { band: "G10", focus: "nền tảng Easy/Medium", ready: Number(readiness.difficulty?.coreReadyReviewed?.Easy?.count || 0) + Number(readiness.difficulty?.coreReadyReviewed?.Medium?.count || 0) },
      { band: "SAT Core", focus: "core reviewed đủ blueprint", ready: Number(readiness.inventory?.coreReadyReviewed || 0) },
      { band: "1450", focus: "Hard có trap rõ", ready: Number(readiness.difficulty?.coreReadyReviewed?.Hard?.count || 0) },
      { band: "1550+", focus: "1590/hard transfer", ready: Number(readiness.inventory?.strict1600HardNonBlocked || 0) },
    ];
    return { heatmap, targets, bandRows, hydrated };
  }

  function adminReleaseText(value = "") {
    return String(value || "")
      .replace(/Public release ready/g, "Public đã sẵn sàng")
      .replace(/Public release blocked/g, "Phát hành public đang bị chặn")
      .replace(/Integrity report loaded/g, "Báo cáo kiểm định")
      .replace(/Critical issues clear/g, "Lỗi nghiêm trọng")
      .replace(/Open audit reports clear/g, "Report lỗi mở")
      .replace(/Manifest has public questions/g, "Có câu public trong manifest")
      .replace(/Blocked public candidates clear/g, "Câu public bị chặn")
      .replace(/Source signatures clear/g, "Nguồn chưa ký")
      .replace(/source-signed public questions can be exported/g, "câu public đã ký nguồn có thể export")
      .replace(/missing/g, "thiếu");
  }

  function adminRowToQueueItem(row, priority, targetView = "sources", priorityLabel = "P0", sortWeight = 80) {
    const issueText = String(row.issue || row.reason || row.issues || "");
    return {
      priority,
      priorityLabel,
      sortWeight,
      targetView,
      title: row.id || row.questionId || "Integrity row",
      eyebrow: row.sourceFile || row.section || "Data quality",
      body: [row.section, row.domain, row.skill].filter(Boolean).join(" / ") || row.prompt || "Needs content review",
      detail: Array.isArray(row.issues) ? row.issues.join("; ") : String(row.issue || row.reason || ""),
      qualityScore: Math.max(0, 100 - (Array.isArray(row.issues) ? row.issues.length : row.issue || row.reason ? 1 : 0) * 18),
      gates: [
        { label: "Format", status: /format|choice|answer|prompt/i.test(issueText) ? "danger" : "ok" },
        { label: "Blueprint", status: row.section && row.domain ? "ok" : "warn" },
        { label: "Source", status: /source|license|risk/i.test(issueText) ? "danger" : "ok" },
      ],
    };
  }

  function buildAdminQueue({
    openAuditEntries = [],
    openAuditIds = [],
    pendingReviewQuestions = [],
    generatedNeedsReview = [],
    publicPending = [],
    highRiskPublicCandidates = [],
    publicManifest = {},
    criticalRows = [],
    blockedRows = [],
    domainActionRows = [],
    warningRows = [],
  } = {}) {
    const auditQuestionCount = Number(openAuditIds.size ?? openAuditIds.length ?? 0);
    const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return [
      openAuditEntries.length
        ? {
            priority: "critical",
            priorityLabel: "P0",
            sortWeight: 100,
            targetView: "bank",
            title: `${auditQuestionCount} câu có report chưa xử lý`,
            eyebrow: "Báo cáo từ người dùng",
            body: `${openAuditEntries.length} entry cần admin quyết định`,
            detail: "Resolve, pass, hoặc block trước khi câu tiếp tục được tin cậy.",
            qualityScore: 40,
            gates: [{ label: "Audit", status: "danger" }, { label: "Answer", status: "warn" }, { label: "Publish", status: "danger" }],
          }
        : null,
      pendingReviewQuestions.length
        ? {
            priority: "blocked",
            priorityLabel: "P0",
            sortWeight: 92,
            targetView: "bank",
            title: `${pendingReviewQuestions.length} câu cần review`,
            eyebrow: "Duyệt câu hỏi",
            body: "Draft phải qua đủ quality gate trước khi vào pool học tin cậy.",
            detail: `${generatedNeedsReview.length} draft AI/Antigravity nằm trong nhóm này.`,
            qualityScore: 55,
            gates: [{ label: "Format", status: "warn" }, { label: "Explanation", status: "warn" }, { label: "Trap", status: "warn" }, { label: "Tags", status: "warn" }],
          }
        : null,
      publicPending.length
        ? {
            priority: "warning",
            priorityLabel: "P1",
            sortWeight: 72,
            targetView: "sources",
            title: `${publicPending.length} ứng viên public chưa duyệt`,
            eyebrow: "Hàng đợi phát hành",
            body: "Cần xác nhận review status và an toàn nguồn trước khi public.",
            detail: `${highRiskPublicCandidates.length} source signal rủi ro cao.`,
            qualityScore: highRiskPublicCandidates.length ? 60 : 75,
            gates: [{ label: "Review", status: "warn" }, { label: "Source", status: highRiskPublicCandidates.length ? "danger" : "ok" }, { label: "Publish", status: "warn" }],
          }
        : null,
      publicManifest.releaseGate && !publicManifest.releaseGate.ready
        ? {
            priority: "critical",
            priorityLabel: "P0",
            sortWeight: 96,
            targetView: "sources",
            title: adminReleaseText(publicManifest.releaseGate.label || "Public release blocked"),
            eyebrow: "Manifest public",
            body: adminReleaseText(publicManifest.releaseGate.detail || "Public release cần manifest có chữ ký trước launch."),
            detail: arraysFrom(publicManifest.releaseGate.blockers).map((item) => adminReleaseText(item.label || item.id)).slice(0, 3).join("; "),
            qualityScore: 35,
            gates: [{ label: "Preview", status: "warn" }, { label: "Source", status: "danger" }, { label: "Export", status: "danger" }],
          }
        : null,
      ...arraysFrom(criticalRows).slice(0, 3).map((row) => adminRowToQueueItem(row, "critical", "bank")),
      ...arraysFrom(blockedRows).slice(0, 4).map((row) => adminRowToQueueItem(row, "blocked", "sources", "P0", 88)),
      ...arraysFrom(domainActionRows).filter((action) => action.balance === "underrepresented").slice(0, 5).map((action) => {
        const highRoiMathGap = action.section === "Math" && ["Algebra", "Advanced Math"].includes(action.domain);
        return {
          priority: "topic",
          priorityLabel: highRoiMathGap ? "P1" : "P2",
          sortWeight: highRoiMathGap ? 76 : 48,
          targetView: "author",
          title: `${action.section} / ${action.domain}`,
          eyebrow: "Gap coverage",
          body: `${action.actualPct}% hiện tại vs ${action.officialPct}% target (${Number(action.deltaPctPoints || 0) > 0 ? "+" : ""}${action.deltaPctPoints} pp).`,
          detail: `Bổ sung/promote core items; cần thêm nếu chỉ bổ sung domain này: ${action.additionalNeededIfOnlyAddingThisDomain}.`,
          qualityScore: highRoiMathGap ? 85 : 75,
          gates: [{ label: "Blueprint", status: "warn" }, { label: "ROI", status: highRoiMathGap ? "ok" : "warn" }, { label: "Batch", status: "warn" }],
        };
      }),
      ...arraysFrom(warningRows).slice(0, 2).map((row) => adminRowToQueueItem(row, "warning", "bank", "P2", 40)),
    ]
      .filter(Boolean)
      .sort((a, b) => priorityRank[a.priorityLabel] - priorityRank[b.priorityLabel] || Number(b.sortWeight || 0) - Number(a.sortWeight || 0))
      .slice(0, 10);
  }

  return {
    PHASE_A_PLAN,
    PHASE_B_PLAN,
    POST_UPLOAD_CHECKS,
    buildContentAdminCommandModel,
    adminReleaseText,
    buildAdminContentHeatmap,
    buildAdminQueue,
    firstAdminCount,
    isAdminBankHydrated,
    buildDomainGaps,
    buildItemAnalyticsSignals,
    buildQualitySignals,
    buildSurplusTopics,
    buildThinSkillRows,
    buildUploadGate,
  };
});
