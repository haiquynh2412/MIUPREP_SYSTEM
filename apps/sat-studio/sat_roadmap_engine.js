(function initSatStudioRoadmapEngine(root, factory) {
  const roadmapEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = roadmapEngine;
  }
  if (root) {
    root.SatStudioRoadmapEngine = roadmapEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioRoadmapEngine() {
  function averageNumber(values = []) {
    const clean = values.map(Number).filter(Number.isFinite);
    if (!clean.length) return 0;
    return clean.reduce((sum, value) => sum + value, 0) / clean.length;
  }

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function readinessBand(score) {
    if (score >= 85) return "1600 training ready";
    if (score >= 65) return "Strong path, needs more proof";
    if (score >= 40) return "Useful, but not elite yet";
    return "Starter path";
  }

  function practiceTargetFromSummary(item = {}, overrides = {}) {
    return {
      label: overrides.label || overrides.skill || item.skill || item.label || "Practice",
      section: overrides.section || item.section || "All",
      domain: overrides.domain || item.domain || item.label || "All",
      skill: overrides.skill || item.skill || item.label || "All",
      difficulty: overrides.difficulty || "All",
      source: overrides.source || "All",
    };
  }

  function uniquePracticeTargets(targets = []) {
    const map = new Map();
    targets
      .filter(Boolean)
      .forEach((target) => {
        const normalized = practiceTargetFromSummary(target, target);
        const key = `${normalized.section}|${normalized.domain}|${normalized.skill}|${normalized.difficulty}|${normalized.source}`;
        if (!map.has(key)) map.set(key, normalized);
      });
    return [...map.values()];
  }

  function addDaysIso(value, days = 0) {
    const base = value ? new Date(value) : new Date();
    const safeBase = Number.isFinite(base.getTime()) ? base : new Date();
    safeBase.setDate(safeBase.getDate() + Number(days || 0));
    return safeBase.toISOString();
  }

  function scopeKey(scope = {}) {
    return `${scope.section || "All"}|${scope.domain || "All"}|${scope.skill || scope.label || "All"}`;
  }

  function assignedByLabel(item = {}) {
    if (item.taggedBy === "system" || item.taggedByRole === "system" || item.tagSource === "system_suggested") {
      return { assignedBy: "system", assignedByRole: "system", assignmentSource: item.tagSource || "system_suggested" };
    }
    if (item.taggedBy) {
      return {
        assignedBy: item.taggedBy,
        assignedByRole: item.taggedByRole || (item.tagSource === "parent_admin_review" ? "parent/admin" : "student"),
        assignmentSource: item.tagSource || "manual_error_tag",
      };
    }
    if (item.lessonTaskKey) return { assignedBy: "roadmap", assignedByRole: "system", assignmentSource: "lesson_progress" };
    return { assignedBy: "system", assignedByRole: "system", assignmentSource: "roadmap_v2" };
  }

  function proofAttempt(attempt = {}) {
    return /proof/i.test(String(attempt.practiceMode || ""));
  }

  function practiceAttemptsAfterBuild(profile = {}) {
    const builtAt = Date.parse(profile.roadmapLastBuiltAt || "");
    return (profile.attempts || []).filter((attempt) => {
      if (attempt.fromPretest) return false;
      if (!builtAt) return true;
      return (Date.parse(attempt.at || "") || 0) > builtAt;
    });
  }

  function proofPassedAfterBuild(profile = {}) {
    const builtAt = Date.parse(profile.roadmapLastBuiltAt || "");
    return (profile.attempts || []).some((attempt) => {
      const proofPassedAt = Date.parse(attempt.remediation?.proofPassedAt || "");
      const directProofAt = proofAttempt(attempt) && attempt.correct && attempt.pacingFlag !== "slow_correct" ? Date.parse(attempt.at || "") : 0;
      const timestamp = proofPassedAt || directProofAt;
      return timestamp && (!builtAt || timestamp > builtAt);
    });
  }

  function proofFailedAfterBuild(profile = {}) {
    const builtAt = Date.parse(profile.roadmapLastBuiltAt || "");
    return (profile.attempts || []).some((attempt) => {
      if (!proofAttempt(attempt) || attempt.correct) return false;
      const attemptedAt = Date.parse(attempt.at || "") || 0;
      return attemptedAt && (!builtAt || attemptedAt > builtAt);
    });
  }

  function diagnosticAfterBuild(profile = {}, latest = null) {
    const builtAt = Date.parse(profile.roadmapLastBuiltAt || "");
    const completedAt = Date.parse(latest?.completedAt || latest?.submittedAt || "");
    return Boolean(completedAt && builtAt && completedAt > builtAt);
  }

  function roadmapRefreshSignals({ profile = {}, latest = null, now = Date.now() } = {}) {
    const attempts = practiceAttemptsAfterBuild(profile);
    const proofPassed = proofPassedAfterBuild(profile);
    const proofFailed = proofFailedAfterBuild(profile);
    const diagnosticFresh = diagnosticAfterBuild(profile, latest);
    const builtAt = profile.roadmapLastBuiltAt || "";
    return [
      {
        id: "diagnostic_or_full_test",
        label: "After pretest/full test",
        active: diagnosticFresh || (!builtAt && Boolean(latest)),
        reason: latest ? "A diagnostic/full-test result should become the new baseline." : "No diagnostic result yet.",
      },
      {
        id: "ten_practice_attempts",
        label: "After 10 practice attempts",
        active: attempts.length >= 10,
        progress: attempts.length,
        threshold: 10,
        reason: `${attempts.length} practice attempt${attempts.length === 1 ? "" : "s"} since roadmap build.`,
      },
      {
        id: "proof_passed",
        label: "After proof pass",
        active: proofPassed,
        reason: proofPassed ? "A proof attempt cleared at least one remediation item." : "No proof pass since build.",
      },
      {
        id: "proof_failed",
        label: "After proof fail",
        active: proofFailed,
        reason: proofFailed ? "A remediation proof failed and should route back to lesson depth." : "No failed proof since build.",
      },
      {
        id: "manual_rebuild",
        label: "Parent/admin rebuild",
        active: false,
        reason: "Manual rebuild is available for parent/admin review after audits or study-plan changes.",
      },
    ];
  }

  function defaultRefreshTriggers(profile = {}, latest = null) {
    return roadmapRefreshSignals({ profile, latest }).map((signal) => ({
      id: signal.id,
      label: signal.label,
      active: Boolean(signal.active),
      reason: signal.reason,
      progress: signal.progress,
      threshold: signal.threshold,
    }));
  }

  function learningLoopForStep({ focus = {}, proofQuestionId = "", retryAt = "", proofCondition = "" } = {}) {
    const scope = `${focus.domain || "SAT"} / ${focus.skill || focus.label || "All skills"}`;
    return [
      { stage: "diagnostic", label: "Diagnostic signal", detail: `Identify weakness in ${scope}.` },
      { stage: "lesson", label: "Lesson", detail: "Review the rule, worked example, and common traps before more testing." },
      { stage: "scaffold", label: "Scaffold drill", detail: "Start untimed with easier or same-skill setup items." },
      {
        stage: "proof",
        label: "Proof question",
        detail: proofQuestionId ? `Pass ${proofQuestionId}. ${proofCondition || ""}`.trim() : proofCondition || "Pass a fresh same-skill item.",
      },
      { stage: "timed_sprint", label: "Timed sprint", detail: retryAt ? `Retry under timer on ${retryAt.slice(0, 10)}.` : "Retry under timer after proof passes." },
      { stage: "exam_review", label: "Exam review", detail: "Log wrong choice, pacing, and root cause after the timed set." },
      { stage: "refresh", label: "Roadmap refresh", detail: "Refresh after proof pass/fail, 10 attempts, or the next diagnostic/full test." },
    ];
  }

  function buildRoadmapStepV2({
    step = {},
    focus = {},
    assignment = {},
    diagnosis = {},
    proof = {},
    schedule = {},
    profile = {},
    latest = null,
    refreshTriggers = null,
  } = {}) {
    const normalizedFocus = practiceTargetFromSummary(focus, focus);
    const actor = assignedByLabel(assignment);
    const assignedAt = assignment.taggedAt || assignment.assignedAt || schedule.assignedAt || latest?.completedAt || new Date().toISOString();
    const retryAt = schedule.retryAt || schedule.dueAt || addDaysIso(assignedAt, 2);
    const dueAt = schedule.dueAt || retryAt;
    const proofCondition = proof.condition || diagnosis.proofTarget || step.exitCondition || "Pass one fresh proof question without slow_correct pacing.";
    return {
      ...step,
      targets: Array.isArray(step.targets) && step.targets.length ? step.targets : [normalizedFocus],
      roadmapV2: {
        version: "roadmap-v2-2026-05-19",
        subskillKey: scopeKey(normalizedFocus),
        section: normalizedFocus.section,
        domain: normalizedFocus.domain,
        skill: normalizedFocus.skill,
        rootCause: diagnosis.rootCause || diagnosis.whyLikely || step.detail || "Roadmap identified this as the next learning bottleneck.",
        whyRelearn: diagnosis.whyRelearn || diagnosis.studentPrompt || "Relearn before testing again so practice does not reinforce the same miss.",
        assignedBy: actor.assignedBy,
        assignedByRole: actor.assignedByRole,
        assignmentSource: actor.assignmentSource,
        assignedAt,
        dueAt,
        retryAt,
        proofQuestionId: proof.questionId || assignment.proofQuestionId || "",
        proofCondition,
        proofStatus: proof.status || assignment.status || "assigned",
        learningLoop: learningLoopForStep({ focus: normalizedFocus, proofQuestionId: proof.questionId || assignment.proofQuestionId || "", retryAt, proofCondition }),
        refreshTriggers: refreshTriggers || defaultRefreshTriggers(profile, latest),
      },
    };
  }

  function weightedSummaryRows(items = {}) {
    return Object.values(items)
      .map((item) => ({
        ...item,
        accuracy: item.total ? item.correct / item.total : 0,
        weightedAccuracy: item.weightedTotal ? item.weightedCorrect / item.weightedTotal : 0,
      }))
      .sort((a, b) => a.weightedAccuracy - b.weightedAccuracy || b.total - a.total);
  }

  function buildDiagnosticRoadmap(diagnostic = {}) {
    const domains = weightedSummaryRows(diagnostic.byDomain || {});
    const skills = weightedSummaryRows(diagnostic.bySkill || {});
    const weakDomains = domains.filter((item) => item.weightedAccuracy < 0.75).slice(0, 4);
    const weakSkills = skills.filter((item) => item.weightedAccuracy < 0.75).slice(0, 6);
    const firstDomain = weakDomains[0] || domains[0];
    const firstSkills = weakSkills.filter((item) => !firstDomain || item.domain === firstDomain.label).slice(0, 3);

    return [
      {
        title: firstDomain ? `Stabilize ${firstDomain.label}` : "Stabilize weak skills",
        source: "Khan-style skill path",
        detail: firstSkills.length
          ? `Start with ${firstSkills.map((item) => item.label).join(", ")}. Accuracy here is ${Math.round((firstDomain?.weightedAccuracy || 0) * 100)}%.`
          : "No single weak skill is dominant yet. Rotate through all domains and collect more data.",
        action: "20 targeted questions",
        targets: firstSkills.length
          ? firstSkills.map((item) => practiceTargetFromSummary(item))
          : firstDomain
            ? [practiceTargetFromSummary(firstDomain, { skill: "All" })]
            : [],
      },
      {
        title: "Review every wrong diagnostic answer",
        source: "DailySAT and tutor workflow",
        detail: "For each wrong answer, compare your selected option with the correct option and explanation before doing new questions.",
        action: "10 minutes before practice",
        actionType: "review",
      },
      {
        title: "Build balanced SAT coverage",
        source: "College Board domain model",
        detail: weakDomains.length
          ? `Then rotate into ${weakDomains.slice(1).map((item) => item.label).join(", ") || "the remaining SAT domains"}.`
          : "Practice all SAT domains so the roadmap is not overfitted to a small diagnostic.",
        action: "4 domain blocks per week",
        targets: weakDomains.slice(1, 4).map((item) => practiceTargetFromSummary(item, { skill: "All" })),
      },
      {
        title: "Validate with official practice metadata",
        source: "Bluebook and College Board workflow",
        detail: "Use Bluebook/Khan externally, then log score, domain, reference, and mistake type without copying official question text.",
        action: "1 official session weekly",
      },
      {
        title: "Move toward timed modules",
        source: "Bluebook-style test shell",
        detail: "After the diagnostic bank is reviewed, add timed module sets: RW 32-minute blocks and Math 35-minute blocks.",
        action: "Timed mode after basics",
      },
    ];
  }

  function buildRoadmapV2({
    diagnostic = null,
    skillRows = [],
    remediationQueue = [],
    targetScore = 1500,
    profile = {},
    account = {},
    nowIso = new Date().toISOString(),
  } = {}) {
    const steps = [];
    const target = Number(targetScore) || 1500;
    const insights = diagnostic?.adaptiveInsights || {};
    const weakSkills = Array.isArray(insights.weakSkills) ? insights.weakSkills : [];
    const weakModules = Array.isArray(insights.weakModules) ? insights.weakModules : [];
    const prioritySkills = (skillRows || []).filter((item) => item.status !== "Mastered").slice(0, 4);
    const dueRemediation = (remediationQueue || []).filter((row) => !row.proofPassed).slice(0, 3);
    const refreshTriggers = defaultRefreshTriggers(profile, diagnostic);
    const routingProfile = insights.routingProfile || diagnostic?.adaptiveRouting || {};
    const routingActions = Array.isArray(routingProfile.nextActions) ? routingProfile.nextActions : [];

    if (dueRemediation[0]) {
      const row = dueRemediation[0];
      steps.push(
        buildRoadmapStepV2({
          step: {
            title: `Tutor Brain: relearn ${row.skill}`,
            source: "Adaptive remediation queue",
            detail: row.tutorDiagnosis?.rootCause || row.action || "Review the linked lesson before doing new test items.",
            action: row.tutorDiagnosis?.proofTarget || row.proofRule || "Lesson + proof question",
            actionType: "review",
            exitCondition: row.tutorDiagnosis?.reviewCadence || "Mark lesson reviewed, then pass the proof item.",
            targets: [practiceTargetFromSummary(row)],
          },
          focus: row,
          assignment: {
            ...row,
            taggedBy: row.taggedBy,
            taggedByRole: row.taggedByRole,
            tagSource: row.tagSource,
            taggedAt: row.taggedAt,
            assignedAt: row.assignedAt || row.taggedAt || nowIso,
            proofQuestionId: row.proofQuestionId || "",
          },
          diagnosis: {
            ...(row.tutorDiagnosis || {}),
            whyRelearn: row.tutorDiagnosis?.studentPrompt || row.action,
          },
          proof: {
            questionId: row.proofQuestionId || "",
            condition: row.proofRule || row.tutorDiagnosis?.proofTarget || "",
            status: row.status || "assigned",
          },
          schedule: { assignedAt: row.assignedAt || row.taggedAt || nowIso, dueAt: row.dueAt || row.proofDueAt || addDaysIso(nowIso, 1) },
          profile,
          latest: diagnostic,
          refreshTriggers,
        }),
      );
    }

    if (routingActions[0]) {
      const action = routingActions[0];
      const focus = practiceTargetFromSummary(action.target || {}, action.target || {});
      steps.push(
        buildRoadmapStepV2({
          step: {
            title: action.title || "Adaptive routing proof",
            source: "Adaptive routing engine",
            detail: action.detail || routingProfile.scoreDisclosure || "Use diagnostic confidence and SAT domain coverage before routing harder.",
            action: action.proof || "Run a targeted proof set before changing route.",
            actionType: "adaptive_routing",
            exitCondition: action.proof || "Pass the proof set with stable timing.",
            targets: [focus],
          },
          focus,
          assignment: {
            assignedAt: diagnostic?.completedAt || nowIso,
            tagSource: "adaptive_routing",
            taggedBy: "system",
            taggedByRole: "system",
          },
          diagnosis: {
            rootCause: action.detail || "Routing confidence depends on accuracy, sample size, timing, difficulty, and blueprint coverage.",
            whyRelearn: "The next module route should be chosen only after the priority proof is stable.",
            proofTarget: action.proof || "Pass a fresh proof set.",
          },
          proof: { condition: action.proof || "Pass a fresh proof set.", status: "routing_proof_open" },
          schedule: { assignedAt: diagnostic?.completedAt || nowIso, dueAt: addDaysIso(diagnostic?.completedAt || nowIso, 2) },
          profile,
          latest: diagnostic,
          refreshTriggers,
        }),
      );
    }

    if (weakModules[0]) {
      const module = weakModules[0];
      const focus = module.section ? { section: module.section, domain: "All", skill: "All", label: module.section } : module;
      steps.push(
        buildRoadmapStepV2({
          step: {
            title: `Rebuild ${module.section || module.label} module readiness`,
            source: "Diagnostic v2 adaptive module signal",
            detail: module.rationale || "Module result shows this section is not ready for harder routing yet.",
            action: module.readinessBand === "pacing-risk" ? "Timed mini-module after lesson review" : "Lesson + 12 targeted questions",
            actionType: "diagnostic_module_repair",
            exitCondition: "Retest the same section module at standard route; move to hard route only after 72%+ accuracy without timeout.",
            targets: module.section ? [practiceTargetFromSummary(focus)] : [],
          },
          focus,
          assignment: { assignedAt: diagnostic?.completedAt || nowIso, tagSource: "diagnostic_module", taggedBy: "system", taggedByRole: "system" },
          diagnosis: {
            rootCause: module.rationale || "Module score, pacing, or route readiness is not stable yet.",
            whyRelearn: "Module routing should not move harder until the weak section passes a standard route proof.",
            proofTarget: "Retest the same section module at standard route.",
          },
          proof: { condition: "72%+ module accuracy without timeout.", status: "module_repair" },
          schedule: { assignedAt: diagnostic?.completedAt || nowIso, dueAt: addDaysIso(diagnostic?.completedAt || nowIso, 3) },
          profile,
          latest: diagnostic,
          refreshTriggers,
        }),
      );
    }

    const firstSkill = prioritySkills[0] || weakSkills[0];
    if (firstSkill) {
      const skillName = firstSkill.skill || firstSkill.label;
      steps.push(
        buildRoadmapStepV2({
          step: {
            title: `Close the subskill gap: ${skillName}`,
            source: "Roadmap v2 mastery + diagnostic blend",
            detail: firstSkill.action
              ? `${firstSkill.action}. Mastery ${firstSkill.mastery ?? "--"}%.`
              : `Diagnostic weighted accuracy is ${Math.round((firstSkill.weightedAccuracy || 0) * 100)}%.`,
            action: "Open lesson, run scaffold, then proof on a fresh context",
            targets: [practiceTargetFromSummary(firstSkill, { skill: skillName })],
            exitCondition: "80%+ on medium transfer items, then one hard proof item.",
          },
          focus: { ...firstSkill, skill: skillName },
          assignment: {
            assignedAt: firstSkill.lastAttemptAt || diagnostic?.completedAt || nowIso,
            tagSource: firstSkill.dominantErrorType && firstSkill.dominantErrorType !== "none" ? "mastery_error_cluster" : "diagnostic_skill_gap",
            taggedBy: "system",
            taggedByRole: "system",
          },
          diagnosis: {
            rootCause: firstSkill.dominantErrorType && firstSkill.dominantErrorType !== "none"
              ? `Dominant error pattern: ${firstSkill.dominantErrorType}.`
              : `Weakest available subskill signal: ${skillName}.`,
            whyRelearn: firstSkill.action || "Use lesson and scaffold before more timed testing.",
            proofTarget: "80%+ on medium transfer items, then one hard proof item.",
          },
          proof: { condition: "80%+ medium transfer, then one hard proof item.", status: "skill_gap_open" },
          schedule: { assignedAt: firstSkill.lastAttemptAt || diagnostic?.completedAt || nowIso, dueAt: addDaysIso(firstSkill.lastAttemptAt || diagnostic?.completedAt || nowIso, 2) },
          profile,
          latest: diagnostic,
          refreshTriggers,
        }),
      );
    }

    const secondSkill = prioritySkills.find((item) => item.skill !== firstSkill?.skill) || weakSkills.find((item) => item.label !== firstSkill?.label);
    if (secondSkill) {
      const skillName = secondSkill.skill || secondSkill.label;
      steps.push(
        buildRoadmapStepV2({
          step: {
            title: `Transfer practice: ${skillName}`,
            source: "Roadmap v2 anti-template rotation",
            detail: "Use new contexts and avoid repeating the same skeleton. Keep only hard repeated forms for remediation.",
            action: "10 mixed questions from different sources",
            targets: [practiceTargetFromSummary(secondSkill, { skill: skillName })],
            exitCondition: "Explain every wrong choice and pass one proof question.",
          },
          focus: { ...secondSkill, skill: skillName },
          assignment: { assignedAt: secondSkill.lastAttemptAt || nowIso, tagSource: "anti_template_rotation", taggedBy: "system", taggedByRole: "system" },
          diagnosis: {
            rootCause: `Transfer risk remains open for ${skillName}.`,
            whyRelearn: "A skill is not stable until it works in new contexts, not just repeated templates.",
            proofTarget: "Pass one transfer proof question with wrong-choice explanation.",
          },
          proof: { condition: "Explain every wrong choice and pass one proof question.", status: "transfer_open" },
          schedule: { assignedAt: secondSkill.lastAttemptAt || nowIso, dueAt: addDaysIso(secondSkill.lastAttemptAt || nowIso, 4) },
          profile,
          latest: diagnostic,
          refreshTriggers,
        }),
      );
    }

    if (diagnostic) {
      steps.push(
        buildRoadmapStepV2({
          step: {
            title: "Retest on the right module",
            source: "Bluebook-style adaptive cadence",
            detail: insights.nextAction || "Use a section module after lesson proof, not before.",
            action: "RW or Math module check",
            actionType: "pretest",
            exitCondition: `Keep rebuilding until projected path supports target ${target}.`,
            targets: [],
          },
          focus: { section: "All", domain: "All", skill: "All", label: "Diagnostic retest" },
          assignment: { assignedAt: diagnostic.completedAt || nowIso, tagSource: "diagnostic_completed", taggedBy: "system", taggedByRole: "system" },
          diagnosis: {
            rootCause: "A fresh module is the safest way to validate the lesson/proof loop.",
            whyRelearn: "Retest after proof, not before, so the score reflects repaired skills.",
            proofTarget: `Projected path should support target ${target}.`,
          },
          proof: { condition: `Projected path supports target ${target}.`, status: "diagnostic_retest_due" },
          schedule: { assignedAt: diagnostic.completedAt || nowIso, dueAt: addDaysIso(diagnostic.completedAt || nowIso, 7) },
          profile,
          latest: diagnostic,
          refreshTriggers,
        }),
      );
    }

    steps.push(
      buildRoadmapStepV2({
        step: {
          title: "Weekly parent review and roadmap refresh",
          source: "Tutor governance",
          detail: "Review open audits, repeated wrong patterns, due remediation, and pacing before generating more questions.",
          action: "Manual review weekly; auto-refresh every 10 practice attempts",
          actionType: "review",
          exitCondition: "No due remediation, no open high-risk audit, and next module target selected.",
          targets: [],
        },
        focus: { section: "All", domain: "All", skill: "All", label: "Roadmap review" },
        assignment: { assignedAt: nowIso, tagSource: "weekly_governance", taggedBy: account.id || "system", taggedByRole: account.role || "system" },
        diagnosis: {
          rootCause: "Roadmap quality depends on fresh attempts, proof status, and source/content audit state.",
          whyRelearn: "Parent/admin review keeps the study loop from drifting into stale or low-quality practice.",
          proofTarget: "Confirm the next module target and rebuild when a trigger is active.",
        },
        proof: { condition: "No due remediation, no open high-risk audit, and next module target selected.", status: "governance_review" },
        schedule: { assignedAt: nowIso, dueAt: addDaysIso(nowIso, 7) },
        profile,
        latest: diagnostic,
        refreshTriggers,
      }),
    );

    return steps.slice(0, 6);
  }

  function roadmapDataConfidence({ latest = null, practiceAttempts = 0, taggedErrors = 0, skillRows = [] } = {}) {
    let score = 0;
    if (latest?.total >= 90) score += 3;
    else if (latest?.total >= 20) score += 2;
    else if (latest) score += 1;

    if (practiceAttempts >= 40) score += 3;
    else if (practiceAttempts >= 15) score += 2;
    else if (practiceAttempts >= 5) score += 1;

    if (taggedErrors >= 12) score += 2;
    else if (taggedErrors >= 5) score += 1;

    if ((skillRows || []).filter((item) => item.attempts >= 5).length >= 5) score += 2;
    else if ((skillRows || []).filter((item) => item.attempts >= 3).length >= 3) score += 1;

    const label = score >= 8 ? "High" : score >= 4 ? "Medium" : "Low";
    const detail =
      label === "High"
        ? "Enough diagnostic, practice, and tagged-error evidence to trust the next focus."
        : label === "Medium"
          ? "Good enough for weekly planning, but still needs more timed and tagged data."
          : "Use this roadmap as a starter path until a diagnostic and more attempts are logged.";
    return { label, score: Math.min(score, 10), detail };
  }

  function practiceAttemptsSinceRoadmapBuild(profile = {}) {
    const builtAt = Date.parse(profile.roadmapLastBuiltAt || "");
    return (profile.attempts || []).filter((attempt) => {
      if (attempt.fromPretest) return false;
      if (!builtAt) return true;
      return (Date.parse(attempt.at || "") || 0) > builtAt;
    }).length;
  }

  function topAttemptErrorSummary(attempts = [], helpers = {}) {
    const errorTagLabel = helpers.errorTagLabel || ((value) => value || "No tagged pattern yet");
    const counts = attempts.reduce((acc, attempt) => {
      if (!attempt.errorType) return acc;
      acc[attempt.errorType] = (acc[attempt.errorType] || 0) + 1;
      return acc;
    }, {});
    const [type, count] = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || [];
    return type ? { type, count, label: errorTagLabel(type) } : { type: "", count: 0, label: "No tagged pattern yet" };
  }

  function buildRoadmapEvaluation({
    skillRows = [],
    roadmap = [],
    profile = {},
    latest = null,
    targetScore = 1500,
    now = Date.now(),
    errorTagLabel,
  } = {}) {
    const attempts = profile.attempts || [];
    const practiceAttempts = attempts.filter((attempt) => !attempt.fromPretest).length;
    const taggedErrors = attempts.filter((attempt) => attempt.errorType).length;
    const target = Number(targetScore) || 1500;
    const baseline = latest?.scoreScope === "section_only" ? null : latest?.scoreEstimate || null;
    const gap = baseline ? Math.max(0, target - baseline) : null;
    const weakRows = skillRows.filter((item) => item.status !== "Mastered");
    const priorityRows = weakRows.slice(0, 3);
    const masteredRows = skillRows.filter((item) => item.status === "Mastered");
    const testReadyRows = skillRows.filter((item) => ["Mastered", "Test-ready soon", "Prove on hard/timed"].includes(item.status));
    const attemptsSinceBuild = practiceAttemptsSinceRoadmapBuild(profile);
    const confidence = roadmapDataConfidence({ latest, practiceAttempts, taggedErrors, skillRows });
    const topError = topAttemptErrorSummary(attempts, { errorTagLabel });
    const diagnosticAgeDays = latest?.completedAt ? Math.floor((now - (Date.parse(latest.completedAt) || now)) / 86400000) : null;
    const remaining = 10 - (attemptsSinceBuild % 10);
    const nextReview =
      !latest
        ? "Run a diagnostic first."
        : !profile.roadmapLastBuiltAt
          ? "Rebuild now after the first diagnostic."
          : attemptsSinceBuild >= 10
            ? "Rebuild now: at least 10 practice attempts happened after the last roadmap build."
            : `Auto-refresh in ${remaining} practice attempt${remaining === 1 ? "" : "s"}; parent review weekly.`;

    const risks = [];
    if (!latest) risks.push("No diagnostic baseline yet.");
    if (attempts.length < 30) risks.push("Attempt volume is still light; roadmap confidence is limited.");
    if (taggedErrors < 5 && attempts.some((attempt) => !attempt.correct)) risks.push("Wrong answers need more error tags to separate knowledge gaps from careless errors.");
    if (diagnosticAgeDays !== null && diagnosticAgeDays > 14) risks.push("Diagnostic is more than 14 days old; run a fresh timed check after the next skill block.");
    if (!roadmap.length) risks.push("No saved roadmap steps yet.");

    const actions = [];
    if (!latest) actions.push("Start with Preview or Full Length Pretest so the roadmap has a baseline.");
    if (priorityRows[0]) actions.push(`Teach before testing: ${priorityRows[0].skill} (${priorityRows[0].status}, ${priorityRows[0].mastery}% mastery).`);
    if (priorityRows[1]) actions.push(`Transfer practice: ${priorityRows[1].skill} in new contexts, not repeated templates.`);
    if (attemptsSinceBuild >= 10 || !profile.roadmapLastBuiltAt) actions.push("Press Rebuild From Data after reviewing recent misses.");
    if (!profile.studyNotes?.length && attempts.some((attempt) => !attempt.correct)) actions.push("Create notes for recurring mistakes so review is lesson-driven.");

    return {
      baseline,
      target,
      gap,
      attempts: attempts.length,
      practiceAttempts,
      taggedErrors,
      skillCount: skillRows.length,
      masteredCount: masteredRows.length,
      testReadyCount: testReadyRows.length,
      weakCount: weakRows.length,
      priorityRows,
      confidence,
      topError,
      attemptsSinceBuild,
      nextReview,
      risks,
      actions,
    };
  }

  function defaultIsGridInQuestion(question = {}) {
    return ["student_produced_response", "grid_in", "numeric"].includes(question.questionType);
  }

  function buildEliteCoverage(questions = [], helpers = {}) {
    const isGridInQuestion = helpers.isGridInQuestion || defaultIsGridInQuestion;
    const checks = [
      {
        label: "Cross-text RW",
        target: 30,
        count: questions.filter((question) => question.section === "Reading and Writing" && /cross[-\s]?text|text 1|text 2/i.test(`${question.skill} ${question.prompt}`)).length,
      },
      {
        label: "Rhetorical synthesis",
        target: 30,
        count: questions.filter((question) => /rhetorical synthesis|student notes|bullet/i.test(`${question.skill} ${question.prompt}`)).length,
      },
      {
        label: "Hard Math / grid-in",
        target: 80,
        count: questions.filter((question) => question.section === "Math" && question.difficulty === "Hard" && isGridInQuestion(question)).length,
      },
      {
        label: "Advanced Math hard",
        target: 90,
        count: questions.filter((question) => question.domain === "Advanced Math" && question.difficulty === "Hard").length,
      },
      {
        label: "Data and probability",
        target: 70,
        count: questions.filter((question) => /problem-solving|data|statistics|probability/i.test(`${question.domain} ${question.skill}`)).length,
      },
    ];
    const score = averageNumber(checks.map((item) => Math.min(item.count / item.target, 1)));
    return {
      checks,
      thin: checks.filter((item) => item.count < item.target * 0.6).sort((a, b) => a.count / a.target - b.count / b.target),
      score,
    };
  }

  function buildEliteReadiness({
    skillRows = [],
    evaluation = {},
    latest = null,
    attempts = [],
    pretests = [],
    visibleStudyQuestions = [],
    allQuestions = [],
    dueReviewCount = 0,
    externalStudyLogs = [],
    isGridInQuestion,
  } = {}) {
    const questionById = new Map(allQuestions.map((question) => [question.id, question]));
    const hardAttempts = attempts.filter((attempt) => questionById.get(attempt.questionId)?.difficulty === "Hard");
    const hardCorrect = hardAttempts.filter((attempt) => attempt.correct).length;
    const hardAccuracy = hardAttempts.length ? Math.round((hardCorrect / hardAttempts.length) * 100) : 0;
    const averageMastery = Math.round(averageNumber(skillRows.map((item) => item.mastery || 0)));
    const timedDiagnostics = pretests.filter((test) => test.timeLimitSeconds && !test.timedOut).length;
    const fullDiagnostics = pretests.filter((test) => test.mode === "full").length;
    const externalMinutes = externalStudyLogs.reduce((sum, log) => sum + (Number(log.minutes) || 0), 0);
    const coverage = buildEliteCoverage(visibleStudyQuestions, { isGridInQuestion });
    const baselineScore = latest?.scoreScope !== "section_only" && latest?.scoreEstimate
      ? clampNumber(((latest.scoreEstimate - 1200) / 400) * 25, 0, 25)
      : 0;
    const masteryScore = clampNumber((averageMastery / 100) * 25, 0, 25);
    const hardScore = clampNumber((hardAccuracy / 100) * 20 * Math.min(hardAttempts.length / 30, 1), 0, 20);
    const coverageScore = clampNumber(coverage.score * 15, 0, 15);
    const timedScore = clampNumber((timedDiagnostics ? 5 : 0) + (fullDiagnostics ? 4 : 0) + (externalMinutes >= 120 ? 3 : externalMinutes >= 30 ? 1.5 : 0), 0, 12);
    const reviewScore = clampNumber((dueReviewCount === 0 && attempts.length ? 3 : 0) + ((evaluation.taggedErrors || 0) >= 10 ? 2 : (evaluation.taggedErrors || 0) >= 4 ? 1 : 0), 0, 3);
    const score = Math.round(baselineScore + masteryScore + hardScore + coverageScore + timedScore + reviewScore);

    const missions = [];
    if (!latest) {
      missions.push({
        title: "Get a real baseline",
        body: "Run Preview first; use Full Length once the local bank is ready and the student can sit for the full block.",
      });
    }
    (evaluation.priorityRows || []).slice(0, 2).forEach((item) => {
      missions.push({
        title: `Close ${item.skill}`,
        body: `${item.action}. Exit at 80%+ on new questions before moving to more tests.`,
      });
    });
    if (hardAttempts.length < 30 || hardAccuracy < 85) {
      missions.push({
        title: "Hard-question proof block",
        body: `Do 20 hard mixed questions this week. Current hard accuracy: ${hardAttempts.length ? `${hardAccuracy}% on ${hardAttempts.length}` : "no hard-attempt evidence yet"}.`,
      });
    }
    if (dueReviewCount > 0) {
      missions.push({
        title: "Clear the mistake queue",
        body: `${dueReviewCount} due review item${dueReviewCount === 1 ? "" : "s"} should be reviewed before fresh practice.`,
      });
    }
    coverage.thin.slice(0, 2).forEach((item) => {
      missions.push({
        title: `Strengthen ${item.label}`,
        body: `Only ${item.count}/${item.target} active questions. Add reviewed items or generate safer originals before relying on this as a 1600 path.`,
      });
    });

    return {
      score,
      band: readinessBand(score),
      averageMastery,
      hardAttempts: hardAttempts.length,
      hardAccuracy,
      timedDiagnostics,
      fullDiagnostics,
      dueReviews: dueReviewCount,
      externalMinutes,
      coverage,
      missions: missions.slice(0, 5),
    };
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function formatPlanDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function closedLoopPhaseDefinitions() {
    return [
      {
        id: "diagnostic_baseline",
        label: "Diagnostic",
        objective: "Establish a reliable SAT baseline and map every miss to the skill tree.",
      },
      {
        id: "remedial_drill",
        label: "Remedial Drill",
        objective: "Repair open errors with short daily sprints, lessons, and proof questions.",
      },
      {
        id: "standard_build",
        label: "Standard SAT Build",
        objective: "Grow weak skills from foundation accuracy into timed medium/hard transfer.",
      },
      {
        id: "proof_transfer",
        label: "Proof Transfer",
        objective: "Prove that a skill works on fresh contexts, trap variants, and timed forms.",
      },
      {
        id: "crucible_1500",
        label: "1500+ Crucible",
        objective: "Route only high-value hard items, transfer traps, and mixed proof sets.",
      },
      {
        id: "maintenance",
        label: "Maintenance",
        objective: "Keep mastered skills alive through spacing, pacing checks, and full-test review.",
      },
    ];
  }

  function openRemediationItems(remediationQueue = []) {
    return (remediationQueue || []).filter((item) => item && item.proofPassed !== true && item.status !== "proof_passed");
  }

  function weakestOpenSkill(skillRows = []) {
    return [...(skillRows || [])]
      .filter((row) => row && row.status !== "Mastered")
      .sort((a, b) => Number(a.mastery || 0) - Number(b.mastery || 0) || String(a.skill || "").localeCompare(String(b.skill || "")))[0] || null;
  }

  function closedLoopPhaseFor({
    latest = null,
    remediationQueue = [],
    skillRows = [],
    readiness = {},
    targetScore = 1500,
    dueReviewCount = 0,
  } = {}) {
    const openQueue = openRemediationItems(remediationQueue);
    const weakest = weakestOpenSkill(skillRows);
    const hardTransferSkill = (skillRows || []).find((row) => /Hard transfer|Timed mastery/i.test(String(row.masteryStage || "")));
    const readinessScore = Number(readiness.score || readiness.readinessScore || 0);
    const target = Number(targetScore || 1500);

    if (!latest) {
      return {
        id: "diagnostic_baseline",
        label: "Diagnostic",
        priority: "critical",
        nextAction: "Run a 20-item preview diagnostic, then review every miss before daily practice.",
        entryRule: "No reliable recent baseline is available.",
        exitRule: "Complete baseline and create skill/error evidence.",
      };
    }

    if (openQueue.length || Number(dueReviewCount || 0) > 0) {
      const item = openQueue[0] || {};
      return {
        id: "remedial_drill",
        label: "Remedial Drill",
        priority: "critical",
        nextAction: `Clear ${item.skill || item.label || "the due review queue"} with lesson, short sprint, and proof.`,
        entryRule: "A wrong answer, due spaced review, or unpassed proof is still open.",
        exitRule: "Reach at least 85% on the foundation sprint and pass a fresh proof item.",
      };
    }

    if (target >= 1500 && (readinessScore >= 65 || hardTransferSkill)) {
      return {
        id: "crucible_1500",
        label: "1500+ Crucible",
        priority: "high",
        nextAction: "Run hard-only same-skill, transfer, and mixed proof buckets.",
        entryRule: "Foundation blockers are clear and the 1500+ target is active.",
        exitRule: "Pass 3 hard timed fresh proof items across different forms.",
      };
    }

    if (hardTransferSkill) {
      return {
        id: "proof_transfer",
        label: "Proof Transfer",
        priority: "high",
        nextAction: `Prove ${hardTransferSkill.skill || "the priority skill"} on fresh medium/hard forms.`,
        entryRule: "A skill has foundation evidence but not enough transfer evidence.",
        exitRule: "Pass fresh timed transfer without repeating the same skeleton.",
      };
    }

    if (weakest) {
      return {
        id: "standard_build",
        label: "Standard SAT Build",
        priority: "normal",
        nextAction: `Build ${weakest.skill || "the weakest skill"} from lesson to timed proof.`,
        entryRule: "Baseline exists and no remediation queue is urgent.",
        exitRule: "Pass two clean medium items and one timed hard transfer item.",
      };
    }

    return {
      id: "maintenance",
      label: "Maintenance",
      priority: readinessScore >= 85 ? "normal" : "high",
      nextAction: "Keep mastered skills in spaced mixed practice and schedule the next full review.",
      entryRule: "No urgent weak skill or remediation blocker remains.",
      exitRule: "No overdue review and full-test performance stays near target.",
    };
  }

  function phaseStatusFor(phaseId, currentPhaseId, hasBaseline) {
    const order = closedLoopPhaseDefinitions().map((phase) => phase.id);
    const index = order.indexOf(phaseId);
    const currentIndex = order.indexOf(currentPhaseId);
    if (phaseId === currentPhaseId) return "current";
    if (!hasBaseline && index > 0) return "pending";
    return index < currentIndex ? "done" : "pending";
  }

  function sprintContractForPhase(phase = {}) {
    const contracts = {
      diagnostic_baseline: { mode: "Diagnostic Preview", count: 20, minutes: 35, difficulty: "Blueprint mixed" },
      remedial_drill: { mode: "Remedial Sprint", count: 10, minutes: 15, difficulty: "Easy/Medium first" },
      standard_build: { mode: "Standard Skill Sprint", count: 12, minutes: 20, difficulty: "Easy to Medium to Hard" },
      proof_transfer: { mode: "Proof Transfer Sprint", count: 8, minutes: 12, difficulty: "Medium/Hard fresh forms" },
      crucible_1500: { mode: "1500+ Crucible", count: 12, minutes: 18, difficulty: "Hard only" },
      maintenance: { mode: "Maintenance Spiral", count: 10, minutes: 15, difficulty: "Mixed Medium/Hard" },
    };
    return contracts[phase.id] || contracts.standard_build;
  }

  function buildClosedLoopTrainingPlan({
    latest = null,
    evaluation = {},
    readiness = {},
    remediationQueue = [],
    skillRows = [],
    profile = {},
    targetScore = 1500,
    today = new Date(),
  } = {}) {
    const dueReviewCount = Number(readiness.dueReviewCount || 0);
    const phase = closedLoopPhaseFor({ latest, remediationQueue, skillRows, readiness, targetScore, dueReviewCount });
    const phases = closedLoopPhaseDefinitions().map((item) => ({
      ...item,
      status: phaseStatusFor(item.id, phase.id, Boolean(latest)),
    }));
    const sprint = {
      ...sprintContractForPhase(phase),
      phaseId: phase.id,
      entryRule: phase.entryRule,
      exitRule: phase.exitRule,
      nextAction: phase.nextAction,
    };
    const loop = [
      { stage: "diagnostic", status: latest ? "done" : "current", evidence: latest ? "Baseline exists" : "Baseline required" },
      { stage: "sprint", status: "current", evidence: sprint.mode },
      { stage: "review", status: "ready", evidence: "Wrong, slow-correct, and marked items must be tagged." },
      { stage: "lesson", status: openRemediationItems(remediationQueue).length ? "current" : "ready", evidence: "Remediation lessons feed proof tasks." },
      { stage: "proof", status: phase.id === "maintenance" ? "ready" : "current", evidence: phase.exitRule },
      { stage: "spaced_repetition", status: dueReviewCount ? "current" : "ready", evidence: `${dueReviewCount} due review item(s).` },
      { stage: "refresh", status: "ready", evidence: "Roadmap refreshes after diagnostic, proof pass/fail, or 10 attempts." },
    ];
    const implementationStatus = [
      { id: "diagnostic_mapping", status: "done", evidence: "Diagnostic engine maps module/domain/skill evidence." },
      { id: "remedial_sprints", status: "done", evidence: "Practice engine prescribes daily sprint type, count, exit rule, and routing bias." },
      { id: "proof_mastery", status: "done", evidence: "Mastery requires hard timed fresh proof before mastered status." },
      { id: "spaced_review", status: "done", evidence: "Attempt records and remediation queues schedule due review." },
      { id: "roadmap_refresh", status: "done", evidence: "Refresh signals cover diagnostic, proof pass/fail, manual rebuild, and 10 attempts." },
      { id: "irt_live_calibration", status: "pending", evidence: "Requires accumulated student logs before item parameters are statistically reliable." },
    ];
    return {
      version: "sat_closed_loop_training_v1",
      generatedAt: new Date().toISOString(),
      targetScore,
      phase,
      phases,
      sprint,
      loop,
      dailyPlan: buildSevenDayStudyPlan({ latest, evaluation, readiness, remediationQueue, today }),
      refreshSignals: roadmapRefreshSignals({ profile, latest }),
      implementationStatus,
    };
  }

  function buildSevenDayStudyPlan({
    evaluation = {},
    readiness = {},
    remediationQueue = [],
    latest = null,
    today = new Date(),
  } = {}) {
    const priorityRows = evaluation.priorityRows || [];
    const firstPriority = priorityRows[0];
    const secondPriority = priorityRows[1] || priorityRows[0];
    const queueItem = remediationQueue[0];
    const thinCoverage = readiness.coverage?.thin?.[0];
    const hardProofNeeded = (readiness.hardAttempts || 0) < 30 || (readiness.hardAccuracy || 0) < 85;
    const baselineNeeded = !latest;

    const templates = [
      baselineNeeded
        ? {
            focus: "Diagnostic baseline",
            action: "Run Preview Diagnostic, then review every wrong answer before new practice.",
            minutes: 35,
            targetView: "pretest",
          }
        : queueItem
          ? {
              focus: queueItem.lessonTitle || `Remediate ${queueItem.skill}`,
              action: `${queueItem.action || "Read the lesson and pass one proof question."}`,
              minutes: 25,
              targetView: "review",
            }
          : {
              focus: firstPriority ? `Teach ${firstPriority.skill}` : "Skill maintenance",
              action: firstPriority ? `${firstPriority.action}. Write one note with the rule and trap.` : "Do one mixed set and keep a short error note.",
              minutes: 25,
              targetView: firstPriority ? "lessons" : "practice",
            },
      {
        focus: firstPriority ? `Foundation block: ${firstPriority.skill}` : "Foundation block",
        action: firstPriority ? "Do 10 untimed questions. Stop after every miss and name the error type." : "Do 10 mixed foundation questions and tag any miss.",
        minutes: 30,
        targetView: "practice",
      },
      {
        focus: secondPriority ? `Transfer block: ${secondPriority.skill}` : "Transfer block",
        action: "Use new contexts only; avoid repeating the same template unless the skill is still open.",
        minutes: 30,
        targetView: "practice",
      },
      {
        focus: "5-Minute Sprint",
        action: "Run a short timed sprint. Review slow-correct and marked questions immediately.",
        minutes: 15,
        targetView: "practice",
      },
      hardProofNeeded
        ? {
            focus: "Hard proof",
            action: "Do 12-20 hard mixed questions. A skill is not 1600-ready until it transfers under hard/timed conditions.",
            minutes: 40,
            targetView: "practice",
          }
        : {
            focus: "Timed maintenance",
            action: "Run one medium/hard timed module and keep accuracy within 10 points of untimed practice.",
            minutes: 35,
            targetView: "practice",
          },
      thinCoverage
        ? {
            focus: `Content gap: ${thinCoverage.label}`,
            action: `Only ${thinCoverage.count}/${thinCoverage.target} active items. Add/review original questions before trusting this area.`,
            minutes: 20,
            targetView: "sources",
          }
        : {
            focus: "External reinforcement",
            action: "Open Khan/Bluebook for the weakest skill and log the study minutes.",
            minutes: 25,
            targetView: "dashboard",
          },
      {
        focus: "Parent review + rebuild",
        action: (evaluation.attemptsSinceBuild || 0) >= 10
          ? "Rebuild roadmap from data, inspect top errors, and choose next week's first skill."
          : "Review notes, clear due remediation, and decide whether the next diagnostic is ready.",
        minutes: 20,
        targetView: "roadmap",
      },
    ];

    return templates.map((item, index) => {
      const date = addDays(today, index);
      return {
        ...item,
        day: index + 1,
        date: formatPlanDate(date),
        priority: index === 0 && (baselineNeeded || queueItem) ? "critical" : index >= 4 ? "high" : "normal",
      };
    });
  }

  return {
    averageNumber,
    buildDiagnosticRoadmap,
    buildRoadmapV2,
    buildEliteCoverage,
    buildEliteReadiness,
    buildRoadmapEvaluation,
    buildRoadmapStepV2,
    buildClosedLoopTrainingPlan,
    buildSevenDayStudyPlan,
    closedLoopPhaseFor,
    clampNumber,
    practiceAttemptsSinceRoadmapBuild,
    practiceTargetFromSummary,
    readinessBand,
    roadmapDataConfidence,
    roadmapRefreshSignals,
    scopeKey,
    topAttemptErrorSummary,
    uniquePracticeTargets,
  };
});
