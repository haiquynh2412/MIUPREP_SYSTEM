import { createSeedKnowledgeGraph } from '@miuprep/knowledge';
import { emptyStudentModel, recordAttempt } from '@miuprep/learning';
import {
  auditRecommendationQuality,
  auditRecommendationSanity,
  buildBetaReadinessReport,
  buildChangeImpactReport,
  buildInternalBetaRunPlan,
  buildRealLearningKpiReport,
  buildWeeklyBetaCohortReview,
  type BetaContentUnit,
  type BetaLearner,
  type BetaReadinessReport,
  type BetaTelemetryEvent,
} from './index';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const graph = createSeedKnowledgeGraph();

const mathUnits: BetaContentUnit[] = Array.from({ length: 9 }).map((_, index) => ({
  id: `math-9-${index}`,
  title: `Toan 9 unit ${index}`,
  programId: 'vn_math_6_9',
  questionCount: 35,
  status: 'Active',
  conceptIds:
    index % 2 === 0 ? ['math.quadratic_equation', 'math.vieta'] : ['math.plane_geometry', 'math.geometry_proof'],
  skillIds:
    index % 2 === 0
      ? ['math.solve_quadratic_by_factor', 'math.apply_vieta']
      : ['math.prove_circle_geometry', 'math.geometry_reasoning'],
}));

const ieltsUnits: BetaContentUnit[] = [
  {
    id: 'ielts-read-1',
    title: 'IELTS Reading passage 1',
    programId: 'ielts',
    questionCount: 13,
    tags: ['reading'],
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
  },
  {
    id: 'ielts-read-2',
    title: 'IELTS Reading gap fill',
    programId: 'ielts',
    questionCount: 13,
    tags: ['reading'],
    conceptIds: ['eng.vocabulary_range', 'eng.grammar_accuracy'],
    skillIds: ['eng.use_collocation', 'eng.control_clause_structure'],
  },
  {
    id: 'ielts-read-3',
    title: 'IELTS Reading passage 3',
    programId: 'ielts',
    questionCount: 14,
    tags: ['reading'],
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
  },
  {
    id: 'ielts-list-1',
    title: 'IELTS Listening section 1',
    programId: 'ielts',
    questionCount: 10,
    tags: ['listening'],
    conceptIds: ['eng.listening_detail'],
    skillIds: ['eng.identify_specific_detail'],
  },
  {
    id: 'ielts-list-2',
    title: 'IELTS Listening section 3',
    programId: 'ielts',
    questionCount: 10,
    tags: ['listening'],
    conceptIds: ['eng.listening_detail'],
    skillIds: ['eng.identify_specific_detail'],
  },
];

let mathState = emptyStudentModel('learner-math', ['vn_math_6_9']);
for (let index = 0; index < 8; index += 1) {
  mathState = recordAttempt(mathState, {
    itemId: `math-attempt-${index}`,
    domainId: 'mathematics',
    programId: 'vn_math_6_9',
    conceptIds: ['math.quadratic_equation'],
    skillIds: ['math.solve_quadratic_by_factor'],
    correct: index >= 3,
    difficulty: index > 5 ? 'hard' : 'medium',
    mode: index === 0 ? 'diagnostic' : 'practice',
    answeredAt: `2026-06-02T0${index}:00:00.000Z`,
  }).state;
}

let ieltsState = emptyStudentModel('learner-ielts', ['ielts']);
for (let index = 0; index < 3; index += 1) {
  ieltsState = recordAttempt(ieltsState, {
    itemId: `ielts-grammar-${index}`,
    domainId: 'english_core',
    programId: 'ielts',
    conceptIds: ['eng.grammar_clause_structure'],
    skillIds: ['eng.control_clause_structure'],
    correct: false,
    mode: 'practice',
    errorCategories: ['grammar'],
    answeredAt: `2026-06-02T09:0${index}:00.000Z`,
  }).state;
}

const learners: BetaLearner[] = [
  { id: 'learner-math', targetProgramIds: ['vn_math_6_9'], state: mathState },
  { id: 'learner-ielts', targetProgramIds: ['ielts'], state: ieltsState },
];

const report = buildBetaReadinessReport({
  graph,
  contentUnits: [...mathUnits, ...ieltsUnits],
  learners,
  telemetryEvents: [
    {
      id: 'log-1',
      type: 'diagnostic',
      learnerId: 'learner-math',
      programId: 'vn_math_6_9',
      message: 'diagnostic attempt submitted',
      occurredAt: '2026-06-02T10:00:00.000Z',
    },
    {
      id: 'log-2',
      type: 'practice',
      learnerId: 'learner-math',
      programId: 'vn_math_6_9',
      message: 'Hoc sinh giai dung cau on tap',
      occurredAt: '2026-06-02T11:00:00.000Z',
    },
    {
      id: 'log-3',
      type: 'diagnostic',
      learnerId: 'learner-ielts',
      programId: 'ielts',
      message: 'IELTS Reading/Listening diagnostic submitted',
      occurredAt: '2026-06-02T11:10:00.000Z',
    },
  ],
  generatedAt: '2026-06-02T12:00:00.000Z',
});

assert(report.schemaVersion === 'miuprep_beta_readiness_v1', 'Report schema should be stable.');
assert(
  report.scopes.find((scope) => scope.scopeId === 'math_9_internal')?.questionCount === 315,
  'Math beta should count active questions.',
);
assert(
  report.scopes.find((scope) => scope.scopeId === 'ielts_reading_listening_internal')?.questionCount === 60,
  'IELTS R/L beta should count reading/listening questions.',
);
assert(
  report.scopes.find((scope) => scope.scopeId === 'ielts_reading_listening_internal')?.targetCoverage === 100,
  'IELTS R/L beta should measure coverage against the focused R/L objective.',
);
assert(
  report.scopes.find((scope) => scope.scopeId === 'ielts_reading_listening_internal')?.status === 'pass',
  'IELTS R/L beta should pass when the focused beta objective is covered.',
);
assert(report.learningEvents.status === 'pass', 'Learning event readiness should pass with telemetry/state events.');
assert(
  report.learningEvents.realTelemetryEvents === 3,
  'Live telemetry should be counted separately from seeded export events.',
);
assert(report.learningEvents.seededTelemetryEvents === 0, 'Live beta report should not count seeded telemetry.');
assert(report.learningEvents.evidenceBreakdown.liveLearners === 2, 'Evidence breakdown should count live learners.');
assert(
  report.learningEvents.evidenceBreakdown.syntheticLearners === 0,
  'Evidence breakdown should not mark default learners as synthetic.',
);
assert(report.diagnosticAudit.status === 'pass', 'Diagnostic audit should pass with diagnostic telemetry.');
assert(report.recommendationAudit.status === 'pass', 'Recommendation audit should pass for in-scope recommendations.');
assert(report.learningQualityKpis.attemptSamples === 11, 'Real learning KPI should count live learner attempts.');
assert(report.learningQualityKpis.realAttemptSamples === 11, 'Real learning KPI should expose live attempt samples.');
assert(
  report.learningQualityKpis.syntheticAttemptSamples === 0,
  'Real learning KPI should keep synthetic attempts separate.',
);
assert(report.learningQualityKpis.evidenceSource === 'live', 'Real learning KPI should label live evidence.');
assert(report.learningQualityKpis.masteryLift >= 0, 'Real learning KPI should compute mastery lift.');
assert(report.masteryShadowAudit.learners === 2, 'Mastery shadow audit should inspect learner states.');
assert(report.masteryShadowAudit.rows > 0, 'Mastery shadow audit should expose V1/V2 comparison rows.');
assert(
  report.masteryShadowAudit.learnerReports.every((item) => item.studentFacingEnabled === false),
  'Mastery shadow audit should keep V2 student-facing behavior disabled.',
);
assert(
  report.masteryShadowAudit.learnerReports.every((item) => item.recommendationPolicy === 'v1_only'),
  'Mastery shadow audit should keep recommendations on V1.',
);
assert(report.empiricalDifficultyAudit.rows > 0, 'Empirical difficulty audit should inspect learner attempt items.');
assert(
  report.empiricalDifficultyAudit.learnerReports.every(
    (item) => item.calibrationPolicy === 'shadow_only_prior_preserved',
  ),
  'Empirical difficulty audit should preserve teacher-authored priors.',
);
assert(
  report.empiricalDifficultyAudit.learnerReports.every((item) => item.highStakesPlacementEnabled === false),
  'Empirical difficulty audit should keep high-stakes placement disabled.',
);
assert(
  report.recommendationQualityAudit.checkedLearners === 2,
  'Recommendation quality audit should inspect live learner states.',
);
assert(report.checklist.length === 6, 'Checklist should mirror Phase 10 beta tasks.');
assert(
  report.graphAdjustmentCandidates.some(
    (candidate) => candidate.kind === 'misconception_signal' && candidate.id === 'mis.eng.grammar_role_mismatch',
  ),
  'Repeated inferred misconceptions should create graph adjustment candidates.',
);
assert(
  report.graphAdjustmentCandidates.every((candidate) => candidate.autoApply === false),
  'Graph adjustment candidates should never auto-apply.',
);
assert(
  report.graphAdjustmentCandidates.every((candidate) => candidate.evidenceSource === 'live'),
  'Live learner graph candidates should preserve evidence source.',
);
assert(
  report.repairRerouteCandidates.some(
    (candidate) => candidate.learnerId === 'learner-ielts' && candidate.evidenceSource === 'live',
  ),
  'Repeated repair failures should create live reroute candidates.',
);

const runPlan = buildInternalBetaRunPlan(report, { targetLearnersPerScope: 2, minimumLearningEventsPerLearner: 10 });
assert(runPlan.cohorts.length === 2, 'Run plan should generate one cohort per beta scope.');
assert(runPlan.telemetryRequired.includes('diagnostic_attempt'), 'Run plan should require diagnostic telemetry.');
assert(
  runPlan.exitGates.some((gate) => gate.includes('Graph adjustment')),
  'Run plan should include graph review exit gate.',
);
assert(
  runPlan.cohorts.every((cohort) => cohort.minimumLearningEvents >= 20),
  'Each cohort should have a learning event target.',
);

let brokenRecommendationState = emptyStudentModel('broken', ['ielts']);
for (let index = 0; index < 8; index += 1) {
  brokenRecommendationState = recordAttempt(brokenRecommendationState, {
    itemId: `bad-target-${index}`,
    domainId: 'mathematics',
    programId: 'ielts',
    conceptIds: ['math.quadratic_equation'],
    skillIds: [],
    correct: false,
    mode: 'practice',
    answeredAt: `2026-06-02T12:0${index}:00.000Z`,
  }).state;
}
const brokenAudit = auditRecommendationSanity(graph, [
  { id: 'broken', targetProgramIds: ['ielts'], state: brokenRecommendationState },
]);
assert(brokenAudit.status === 'blocked', 'Out-of-program recommendation targets should not silently pass.');

const realKpis = buildRealLearningKpiReport(learners, []);
assert(realKpis.learners === 2, 'Real KPI report should count live learners.');
assert(realKpis.realLearners === 2, 'Real KPI report should expose live learner count.');
assert(realKpis.syntheticLearners === 0, 'Real KPI report should expose synthetic learner count.');
assert(realKpis.errorRecurrenceRate > 0, 'Real KPI report should detect repeated wrong targets.');

const seededTelemetryEvents: BetaTelemetryEvent[] = [
  {
    id: 'seed-log-1',
    type: 'diagnostic',
    learnerId: 'synthetic-learner-math',
    programId: 'vn_math_6_9',
    message: 'diagnostic attempt submitted',
    occurredAt: '2026-06-02T10:00:00.000Z',
    source: 'beta_export_seed',
  },
];
const syntheticReport = buildBetaReadinessReport({
  graph,
  contentUnits: [...mathUnits, ...ieltsUnits],
  learners: learners.map((learner) => ({ ...learner, id: `synthetic-${learner.id}`, stateKind: 'synthetic' as const })),
  telemetryEvents: seededTelemetryEvents,
  generatedAt: '2026-06-02T13:00:00.000Z',
});
assert(
  syntheticReport.learningEvents.status === 'watch',
  'Seeded/synthetic-only evidence should remain watch, not pass.',
);
assert(
  syntheticReport.learningEvents.realTelemetryEvents === 0,
  'Seeded telemetry should not be counted as real telemetry.',
);
assert(syntheticReport.learningEvents.seededTelemetryEvents === 1, 'Seeded telemetry should be exposed separately.');
assert(
  syntheticReport.learningQualityKpis.evidenceSource === 'synthetic',
  'Synthetic KPI evidence should be labeled synthetic.',
);
assert(
  syntheticReport.learningQualityKpis.status === 'watch',
  'Synthetic KPI evidence should not green-light graph changes.',
);
assert(
  syntheticReport.masteryShadowAudit.evidenceSource === 'synthetic',
  'Synthetic mastery shadow evidence should be labeled synthetic.',
);
assert(syntheticReport.masteryShadowAudit.status === 'watch', 'Synthetic mastery shadow should stay watch-only.');
assert(
  syntheticReport.empiricalDifficultyAudit.evidenceSource === 'synthetic',
  'Synthetic empirical difficulty evidence should be labeled synthetic.',
);
assert(
  syntheticReport.empiricalDifficultyAudit.status === 'watch',
  'Synthetic empirical difficulty should stay watch-only.',
);
assert(
  syntheticReport.graphAdjustmentCandidates.length > 0,
  'Synthetic learner states should still surface watch-only graph candidates.',
);
assert(
  syntheticReport.graphAdjustmentCandidates.every((candidate) => candidate.evidenceSource === 'synthetic'),
  'Synthetic graph candidates should preserve evidence source.',
);
assert(
  syntheticReport.graphAdjustmentCandidates.every((candidate) => candidate.autoApply === false),
  'Synthetic graph candidates should not auto-apply.',
);
assert(
  syntheticReport.repairRerouteCandidates.some((candidate) => candidate.evidenceSource === 'synthetic'),
  'Synthetic repair loops should be tracked as watch-only reroutes.',
);
const syntheticRunPlan = buildInternalBetaRunPlan(syntheticReport, {
  targetLearnersPerScope: 1,
  minimumLearningEventsPerLearner: 10,
});
const syntheticWeeklyReview = buildWeeklyBetaCohortReview({
  report: syntheticReport,
  runPlan: syntheticRunPlan,
  generatedAt: '2026-06-02T13:15:00.000Z',
  weekOf: '2026-06-01',
});
assert(
  syntheticWeeklyReview.graphBacklog.every((item) => item.decision === 'defer'),
  'Synthetic graph backlog should be deferred in weekly review.',
);
assert(
  syntheticWeeklyReview.repairReroutes.every((item) => item.decision === 'defer'),
  'Synthetic reroutes should be deferred in weekly review.',
);

const qualityAudit = auditRecommendationQuality(graph, [
  { id: 'broken', targetProgramIds: ['ielts'], state: brokenRecommendationState },
]);
assert(qualityAudit.status === 'blocked', 'Recommendation quality audit should block graph/program scope issues.');
assert(qualityAudit.blockedIssues.length > 0, 'Recommendation quality audit should expose blocked issue details.');

const previousReport: BetaReadinessReport = {
  ...report,
  generatedAt: '2026-06-01T12:00:00.000Z',
  scopes: report.scopes.map((scope) =>
    scope.scopeId === 'math_9_internal'
      ? {
          ...scope,
          status: 'watch',
          questionCount: scope.questionCount - 35,
          targetCoverage: Math.max(0, scope.targetCoverage - 10),
        }
      : scope,
  ),
  learningQualityKpis: {
    ...report.learningQualityKpis,
    masteryLift: report.learningQualityKpis.masteryLift - 5,
    errorRecurrenceRate: report.learningQualityKpis.errorRecurrenceRate + 5,
  },
  graphAdjustmentCandidates: [],
};
const changeImpact = buildChangeImpactReport({
  current: report,
  previous: previousReport,
  contentUnits: [...mathUnits, ...ieltsUnits],
  generatedAt: '2026-06-02T12:30:00.000Z',
});
assert(changeImpact.schemaVersion === 'miuprep_change_impact_v1', 'Change-impact report should have a stable schema.');
assert(
  changeImpact.previousGeneratedAt === previousReport.generatedAt,
  'Change-impact report should preserve the previous comparison timestamp.',
);
assert(
  changeImpact.items.some((item) => item.id === 'scope:math_9_internal' && item.changeType === 'updated'),
  'Change-impact report should expose changed beta scope readiness.',
);
assert(
  changeImpact.items.some((item) => item.kind === 'kpi' && item.changeType === 'updated'),
  'Change-impact report should expose real learning KPI deltas.',
);
assert(
  changeImpact.items.some((item) => item.kind === 'graph' && item.changeType === 'added'),
  'Change-impact report should expose new graph adjustment candidates.',
);

const weeklyReview = buildWeeklyBetaCohortReview({
  report,
  runPlan,
  changeImpact,
  generatedAt: '2026-06-02T12:45:00.000Z',
  weekOf: '2026-06-01',
});
assert(
  weeklyReview.schemaVersion === 'miuprep_weekly_beta_review_v1',
  'Weekly beta review should have a stable schema.',
);
assert(weeklyReview.cohortReviews.length === runPlan.cohorts.length, 'Weekly beta review should cover every cohort.');
assert(
  weeklyReview.graphBacklog.length === report.graphAdjustmentCandidates.length,
  'Weekly beta review should mirror graph adjustment backlog.',
);
assert(weeklyReview.decisions.length > 0, 'Weekly beta review should produce decisions.');
assert(weeklyReview.nextActions.length > 0, 'Weekly beta review should produce next actions.');
