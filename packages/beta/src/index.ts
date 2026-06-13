import type { KnowledgeGraph, ProgramMap } from '@miuprep/knowledge';
import {
  buildLearningEvent,
  buildEmpiricalDifficultyShadowReport,
  computeMastery,
  computeMasteryV2ShadowReport,
  normalizeLearningEvents,
  recommendNextAction,
  summarizeLearningEvents,
  type AttemptRecord,
  type LearningEventRecord,
  type MasteryEstimate,
  type MasteryV2ShadowReport,
  type EmpiricalDifficultyShadowReport,
  type Recommendation,
  type StudentModel,
} from '@miuprep/learning';

export const BETA_READINESS_SCHEMA_VERSION = 'miuprep_beta_readiness_v1';
export const CHANGE_IMPACT_SCHEMA_VERSION = 'miuprep_change_impact_v1';
export const WEEKLY_BETA_REVIEW_SCHEMA_VERSION = 'miuprep_weekly_beta_review_v1';

export type BetaScopeId = 'math_9_internal' | 'ielts_reading_listening_internal';
export type BetaCheckStatus = 'pass' | 'watch' | 'blocked';
export type BetaEvidenceSource = 'live' | 'synthetic' | 'mixed';

export interface BetaContentUnit {
  id: string;
  title: string;
  programId: string;
  status?: string;
  questionCount?: number;
  conceptIds?: string[];
  skillIds?: string[];
  tags?: string[];
}

export interface BetaLearner {
  id: string;
  username?: string;
  targetProgramIds: string[];
  state?: StudentModel;
  stateKind?: 'live' | 'synthetic';
}

export interface BetaTelemetryEvent {
  id: string;
  type?: string;
  learnerId?: string;
  programId?: string;
  message?: string;
  occurredAt?: string;
  source?: string;
  payload?: Record<string, unknown>;
}

export interface BetaReadinessInput {
  graph: KnowledgeGraph;
  contentUnits: BetaContentUnit[];
  learners?: BetaLearner[];
  telemetryEvents?: BetaTelemetryEvent[];
  generatedAt?: string;
}

export interface BetaScopeReport {
  scopeId: BetaScopeId;
  title: string;
  programId: string;
  status: BetaCheckStatus;
  contentUnits: number;
  questionCount: number;
  learners: number;
  targetCoverage: number;
  diagnosticStatus: BetaCheckStatus;
  recommendationStatus: BetaCheckStatus;
  blockers: string[];
  nextActions: string[];
}

export interface DiagnosticAudit {
  status: BetaCheckStatus;
  scopedContentUnits: number;
  diagnosticEvents: number;
  targetCoverage: number;
  invalidTargetIds: string[];
  detail: string;
}

export interface RecommendationAudit {
  status: BetaCheckStatus;
  checkedLearners: number;
  saneRecommendations: number;
  questionableRecommendations: RecommendationIssue[];
  detail: string;
}

export interface RealLearningKpiReport {
  status: BetaCheckStatus;
  learners: number;
  realLearners: number;
  syntheticLearners: number;
  attemptSamples: number;
  realAttemptSamples: number;
  syntheticAttemptSamples: number;
  eventSamples: number;
  realEventSamples: number;
  seededEventSamples: number;
  evidenceSource: BetaEvidenceSource;
  masteryLift: number;
  retentionAfter7Days: number;
  timeToStableDays: number | null;
  errorRecurrenceRate: number;
  lessonCompletionQuality: number;
  detail: string;
}

export interface RecommendationQualityAudit {
  status: BetaCheckStatus;
  checkedLearners: number;
  passedRecommendations: number;
  watchIssues: RecommendationQualityIssue[];
  blockedIssues: RecommendationQualityIssue[];
  detail: string;
}

export interface MasteryShadowAudit {
  status: BetaCheckStatus;
  learners: number;
  rows: number;
  changedStatusRows: number;
  largestAbsoluteDelta: number;
  protectedFeedbackOnlyEvents: number;
  evidenceSource: BetaEvidenceSource;
  learnerReports: Pick<
    MasteryV2ShadowReport,
    'generatedAt' | 'summary' | 'studentFacingEnabled' | 'recommendationPolicy'
  >[];
  detail: string;
}

export interface EmpiricalDifficultyAudit {
  status: BetaCheckStatus;
  learners: number;
  rows: number;
  calibratedCandidates: number;
  sparseItems: number;
  driftWatchItems: number;
  evidenceSource: BetaEvidenceSource;
  learnerReports: Pick<
    EmpiricalDifficultyShadowReport,
    'generatedAt' | 'summary' | 'calibrationPolicy' | 'highStakesPlacementEnabled'
  >[];
  detail: string;
}

export interface RecommendationIssue {
  learnerId: string;
  reason: string;
  recommendationKind: Recommendation['kind'];
  targetIds: string[];
}

export interface RecommendationQualityIssue {
  learnerId: string;
  reason:
    | 'missing_graph_target'
    | 'out_of_program_target'
    | 'prerequisite_not_stable'
    | 'challenge_too_early'
    | 'stale_diagnostic'
    | 'repeated_without_progress';
  severity: BetaCheckStatus;
  recommendationKind: Recommendation['kind'];
  targetIds: string[];
  detail: string;
}

export interface LearningEventReadiness {
  status: BetaCheckStatus;
  totalEvents: number;
  realTelemetryEvents: number;
  seededTelemetryEvents: number;
  stateLearningEvents: number;
  syntheticStateLearningEvents: number;
  evidenceBreakdown: BetaEvidenceBreakdown;
  byType: Record<string, number>;
  firstAt: string;
  lastAt: string;
  detail: string;
}

export interface BetaEvidenceBreakdown {
  liveTelemetryEvents: number;
  seededTelemetryEvents: number;
  liveStateLearningEvents: number;
  syntheticStateLearningEvents: number;
  liveLearners: number;
  syntheticLearners: number;
}

export interface GraphAdjustmentCandidate {
  id: string;
  kind: 'weak_mastery' | 'missing_metadata' | 'high_risk' | 'misconception_signal';
  programId: string;
  evidenceCount: number;
  score: number;
  evidenceSource: BetaEvidenceSource;
  autoApply: false;
  reason: string;
}

export interface RepairRerouteCandidate {
  learnerId: string;
  programId: string;
  targetId: string;
  scope: 'concept' | 'skill';
  status: MasteryEstimate['status'];
  evidenceCount: number;
  wrongAttempts: number;
  consecutiveWrongAttempts: number;
  score: number;
  suspectedPrerequisiteIds: string[];
  misconceptionIds: string[];
  action: 'prerequisite_micro_diagnostic' | 'lower_difficulty_practice' | 'remediation_lesson' | 'teacher_review';
  evidenceSource: BetaEvidenceSource;
  reason: string;
}

export type ChangeImpactKind = 'scope' | 'checklist' | 'kpi' | 'recommendation' | 'graph' | 'reroute' | 'content';
export type ChangeImpactType = 'baseline' | 'added' | 'updated' | 'unchanged_risk';

export interface ChangeImpactItem {
  id: string;
  kind: ChangeImpactKind;
  changeType: ChangeImpactType;
  severity: BetaCheckStatus;
  title: string;
  whatChanged: string;
  why: string;
  impact: string;
  evidenceCount: number;
}

export interface ChangeImpactReport {
  schemaVersion: typeof CHANGE_IMPACT_SCHEMA_VERSION;
  generatedAt: string;
  sourceLabel: string;
  previousGeneratedAt?: string;
  status: BetaCheckStatus;
  summary: {
    totalItems: number;
    changedItems: number;
    blockers: number;
    watches: number;
    passes: number;
  };
  items: ChangeImpactItem[];
}

export interface WeeklyBetaCohortReview {
  schemaVersion: typeof WEEKLY_BETA_REVIEW_SCHEMA_VERSION;
  generatedAt: string;
  weekOf: string;
  status: BetaCheckStatus;
  cohortReviews: WeeklyBetaCohortReviewItem[];
  graphBacklog: WeeklyBetaGraphBacklogItem[];
  repairReroutes: WeeklyBetaRepairRerouteItem[];
  decisions: string[];
  nextActions: string[];
}

export interface WeeklyBetaCohortReviewItem {
  cohortId: string;
  scopeId: BetaScopeId;
  title: string;
  status: BetaCheckStatus;
  learnerProgress: string;
  evidenceProgress: string;
  readiness: string;
  nextAction: string;
}

export interface WeeklyBetaGraphBacklogItem {
  id: string;
  kind: GraphAdjustmentCandidate['kind'];
  programId: string;
  severity: BetaCheckStatus;
  evidenceCount: number;
  evidenceSource: BetaEvidenceSource;
  autoApply: false;
  decision: 'review' | 'defer' | 'fix_now';
  reason: string;
}

export interface WeeklyBetaRepairRerouteItem {
  learnerId: string;
  programId: string;
  targetId: string;
  action: RepairRerouteCandidate['action'];
  evidenceCount: number;
  consecutiveWrongAttempts: number;
  evidenceSource: BetaEvidenceSource;
  decision: 'review' | 'defer';
  reason: string;
}

export interface BetaChecklistItem {
  id:
    | 'math_9_beta'
    | 'ielts_reading_listening_beta'
    | 'real_learning_events'
    | 'diagnostic_validity'
    | 'recommendation_sanity'
    | 'graph_adjustment_backlog';
  label: string;
  status: BetaCheckStatus;
  detail: string;
  evidenceCount: number;
}

export interface BetaReadinessReport {
  schemaVersion: typeof BETA_READINESS_SCHEMA_VERSION;
  generatedAt: string;
  scopes: BetaScopeReport[];
  learningEvents: LearningEventReadiness;
  diagnosticAudit: DiagnosticAudit;
  recommendationAudit: RecommendationAudit;
  learningQualityKpis: RealLearningKpiReport;
  recommendationQualityAudit: RecommendationQualityAudit;
  masteryShadowAudit: MasteryShadowAudit;
  empiricalDifficultyAudit: EmpiricalDifficultyAudit;
  graphAdjustmentCandidates: GraphAdjustmentCandidate[];
  repairRerouteCandidates: RepairRerouteCandidate[];
  checklist: BetaChecklistItem[];
  readyForInternalBeta: boolean;
}

export interface InternalBetaRunPlan {
  id: string;
  generatedAt: string;
  status: BetaCheckStatus;
  cohorts: InternalBetaCohort[];
  entryGates: string[];
  exitGates: string[];
  telemetryRequired: string[];
  nextActions: string[];
}

export interface InternalBetaCohort {
  id: string;
  scopeId: BetaScopeId;
  programId: string;
  title: string;
  status: BetaCheckStatus;
  targetLearners: number;
  currentLearners: number;
  minimumLearningEvents: number;
  minimumDiagnosticAttempts: number;
  focus: string[];
}

interface BetaScopeConfig {
  scopeId: BetaScopeId;
  title: string;
  programId: string;
  minContentUnits: number;
  minQuestions: number;
  minLearners: number;
  requiredTags?: string[];
  targetObjectiveIds?: string[];
}

const BETA_SCOPES: BetaScopeConfig[] = [
  {
    scopeId: 'math_9_internal',
    title: 'Math 9 internal beta',
    programId: 'vn_math_6_9',
    minContentUnits: 8,
    minQuestions: 250,
    minLearners: 1,
  },
  {
    scopeId: 'ielts_reading_listening_internal',
    title: 'IELTS Reading/Listening internal beta',
    programId: 'ielts',
    minContentUnits: 5,
    minQuestions: 50,
    minLearners: 1,
    requiredTags: ['reading', 'listening'],
    targetObjectiveIds: ['obj.ielts.reading_listening_beta'],
  },
];

export function buildBetaReadinessReport(input: BetaReadinessInput): BetaReadinessReport {
  const generatedAt = input.generatedAt || new Date().toISOString();
  const learners = input.learners || [];
  const telemetryEvents = input.telemetryEvents || [];
  const scopes = BETA_SCOPES.map((scope) =>
    buildScopeReport(input.graph, scope, input.contentUnits, learners, telemetryEvents),
  );
  const learningEvents = buildLearningEventReadiness(learners, telemetryEvents);
  const diagnosticAudit = auditDiagnosticValidity(input.graph, input.contentUnits, telemetryEvents);
  const recommendationAudit = auditRecommendationSanity(input.graph, learners);
  const learningQualityKpis = buildRealLearningKpiReport(learners, telemetryEvents);
  const recommendationQualityAudit = auditRecommendationQuality(input.graph, learners);
  const masteryShadowAudit = buildMasteryShadowAudit(learners, generatedAt);
  const empiricalDifficultyAudit = buildEmpiricalDifficultyAudit(learners, generatedAt);
  const graphAdjustmentCandidates = buildGraphAdjustmentCandidates(input.graph, input.contentUnits, learners);
  const repairRerouteCandidates = buildRepairRerouteCandidates(input.graph, learners);
  const checklist = buildChecklist(
    scopes,
    learningEvents,
    diagnosticAudit,
    recommendationAudit,
    graphAdjustmentCandidates,
  );
  const requiredStatuses = checklist
    .filter((item) => item.id !== 'graph_adjustment_backlog')
    .map((item) => item.status);

  return {
    schemaVersion: BETA_READINESS_SCHEMA_VERSION,
    generatedAt,
    scopes,
    learningEvents,
    diagnosticAudit,
    recommendationAudit,
    learningQualityKpis,
    recommendationQualityAudit,
    masteryShadowAudit,
    empiricalDifficultyAudit,
    graphAdjustmentCandidates,
    repairRerouteCandidates,
    checklist,
    readyForInternalBeta: requiredStatuses.every((status) => status !== 'blocked'),
  };
}

export function buildInternalBetaRunPlan(
  report: BetaReadinessReport,
  options: { targetLearnersPerScope?: number; minimumLearningEventsPerLearner?: number } = {},
): InternalBetaRunPlan {
  const targetLearners = Math.max(1, Number(options.targetLearnersPerScope || 3));
  const eventsPerLearner = Math.max(5, Number(options.minimumLearningEventsPerLearner || 20));
  const cohorts = report.scopes.map((scope) => {
    const cohortLearners = Math.max(targetLearners, scope.learners);
    return {
      id: `cohort-${scope.scopeId}`,
      scopeId: scope.scopeId,
      programId: scope.programId,
      title: scope.title,
      status:
        scope.status === 'blocked'
          ? 'blocked'
          : scope.learners >= targetLearners && scope.diagnosticStatus !== 'blocked'
            ? 'pass'
            : 'watch',
      targetLearners,
      currentLearners: scope.learners,
      minimumLearningEvents: cohortLearners * eventsPerLearner,
      minimumDiagnosticAttempts: cohortLearners,
      focus:
        scope.nextActions.length || scope.blockers.length
          ? [...scope.blockers, ...scope.nextActions]
          : ['Run diagnostic, focused practice, review and tutor feedback loops.'],
    } satisfies InternalBetaCohort;
  });
  const status: BetaCheckStatus = cohorts.some((cohort) => cohort.status === 'blocked')
    ? 'blocked'
    : cohorts.every((cohort) => cohort.status === 'pass') && report.learningEvents.status === 'pass'
      ? 'pass'
      : 'watch';

  return {
    id: `internal-beta-${report.generatedAt.slice(0, 10)}`,
    generatedAt: report.generatedAt,
    status,
    cohorts,
    entryGates: [
      'Each beta scope has active content mapped to Knowledge Graph targets.',
      'Each beta learner is assigned to the correct target program.',
      'Diagnostic attempts are captured before adaptive practice recommendations are trusted.',
      'Recommendation audit has no missing or out-of-program graph targets.',
    ],
    exitGates: [
      'Each cohort reaches the minimum learning event target.',
      'Diagnostic placement agrees with observed weak mastery areas after practice.',
      'Recommendation watchlist has no blocked issues for live learner states.',
      'Graph adjustment candidates are reviewed and either accepted, rejected, or deferred.',
    ],
    telemetryRequired: [
      'diagnostic_attempt',
      'practice_attempt',
      'review_attempt',
      'feedback_only',
      'graph_adjustment_decision',
    ],
    nextActions: buildRunPlanNextActions(report, cohorts),
  };
}

export function buildChangeImpactReport(input: {
  current: BetaReadinessReport;
  previous?: BetaReadinessReport | null;
  contentUnits?: BetaContentUnit[];
  generatedAt?: string;
  sourceLabel?: string;
}): ChangeImpactReport {
  const current = input.current;
  const previous = input.previous || undefined;
  const generatedAt = input.generatedAt || current.generatedAt || new Date().toISOString();
  const items = [
    ...buildScopeChangeImpactItems(previous?.scopes || [], current.scopes, Boolean(previous)),
    ...buildChecklistChangeImpactItems(previous?.checklist || [], current.checklist, Boolean(previous)),
    buildLearningKpiChangeImpactItem(previous?.learningQualityKpis, current.learningQualityKpis),
    buildRecommendationQualityChangeImpactItem(
      previous?.recommendationQualityAudit,
      current.recommendationQualityAudit,
    ),
    ...buildGraphChangeImpactItems(previous?.graphAdjustmentCandidates || [], current.graphAdjustmentCandidates),
    ...buildRepairRerouteChangeImpactItems(previous?.repairRerouteCandidates || [], current.repairRerouteCandidates),
    ...buildContentChangeImpactItems(input.contentUnits || []),
  ]
    .filter(isChangeImpactItem)
    .sort(
      (a, b) =>
        statusRank(b.severity) - statusRank(a.severity) ||
        changeTypeRank(b.changeType) - changeTypeRank(a.changeType) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 30);

  const summary = {
    totalItems: items.length,
    changedItems: items.filter((item) => item.changeType !== 'unchanged_risk').length,
    blockers: items.filter((item) => item.severity === 'blocked').length,
    watches: items.filter((item) => item.severity === 'watch').length,
    passes: items.filter((item) => item.severity === 'pass').length,
  };

  return {
    schemaVersion: CHANGE_IMPACT_SCHEMA_VERSION,
    generatedAt,
    sourceLabel: input.sourceLabel || 'miuprep_beta_export',
    previousGeneratedAt: previous?.generatedAt,
    status: summary.blockers > 0 ? 'blocked' : summary.watches > 0 ? 'watch' : 'pass',
    summary,
    items,
  };
}

export function buildWeeklyBetaCohortReview(input: {
  report: BetaReadinessReport;
  runPlan: InternalBetaRunPlan;
  changeImpact?: ChangeImpactReport;
  generatedAt?: string;
  weekOf?: string;
}): WeeklyBetaCohortReview {
  const generatedAt = input.generatedAt || input.report.generatedAt || new Date().toISOString();
  const weekOf = input.weekOf || generatedAt.slice(0, 10);
  const cohortReviews = input.runPlan.cohorts.map((cohort) => {
    const scope = input.report.scopes.find((item) => item.scopeId === cohort.scopeId);
    const learningEventTarget = Math.max(1, cohort.minimumLearningEvents);
    const evidenceCount = input.report.learningEvents.totalEvents;
    const evidencePercent = Math.min(100, Math.round((evidenceCount / learningEventTarget) * 100));
    return {
      cohortId: cohort.id,
      scopeId: cohort.scopeId,
      title: cohort.title,
      status: maxStatus(cohort.status, scope?.status || 'watch'),
      learnerProgress: `${cohort.currentLearners}/${cohort.targetLearners} learners`,
      evidenceProgress: `${evidenceCount}/${learningEventTarget} learning events (${evidencePercent}%)`,
      readiness: scope?.blockers.length
        ? scope.blockers.join(' ')
        : scope?.nextActions.length
          ? scope.nextActions.join(' ')
          : `${scope?.questionCount || 0} questions, ${scope?.targetCoverage || 0}% graph coverage.`,
      nextAction: weeklyCohortNextAction(cohort, scope, evidencePercent),
    } satisfies WeeklyBetaCohortReviewItem;
  });
  const graphBacklog = input.report.graphAdjustmentCandidates.map(
    (candidate) =>
      ({
        id: candidate.id,
        kind: candidate.kind,
        programId: candidate.programId,
        severity: graphCandidateSeverity(candidate),
        evidenceCount: candidate.evidenceCount,
        evidenceSource: candidate.evidenceSource,
        autoApply: candidate.autoApply,
        decision: graphCandidateDecision(candidate),
        reason: candidate.reason,
      }) satisfies WeeklyBetaGraphBacklogItem,
  );
  const repairReroutes = input.report.repairRerouteCandidates.map(
    (candidate) =>
      ({
        learnerId: candidate.learnerId,
        programId: candidate.programId,
        targetId: candidate.targetId,
        action: candidate.action,
        evidenceCount: candidate.evidenceCount,
        consecutiveWrongAttempts: candidate.consecutiveWrongAttempts,
        evidenceSource: candidate.evidenceSource,
        decision: candidate.evidenceSource === 'synthetic' ? 'defer' : 'review',
        reason: candidate.reason,
      }) satisfies WeeklyBetaRepairRerouteItem,
  );
  const decisions = buildWeeklyReviewDecisions(input.report, input.runPlan, input.changeImpact, graphBacklog);
  const nextActions = uniqueStrings([
    ...input.runPlan.nextActions,
    ...cohortReviews.map((item) => item.nextAction),
    ...graphBacklog
      .filter((item) => item.decision !== 'defer')
      .map((item) => `Review graph backlog ${item.id}: ${item.reason}`),
    ...repairReroutes
      .filter((item) => item.decision === 'review')
      .map((item) => `Review stuck repair path for ${item.learnerId} on ${item.targetId}: ${item.reason}`),
  ]).slice(0, 12);
  const statuses = [
    input.runPlan.status,
    input.report.learningQualityKpis.status,
    input.report.recommendationQualityAudit.status,
    ...(input.changeImpact ? [input.changeImpact.status] : []),
    ...cohortReviews.map((item) => item.status),
    ...graphBacklog.map((item) => item.severity),
    ...repairReroutes.map(() => 'watch' as BetaCheckStatus),
  ];

  return {
    schemaVersion: WEEKLY_BETA_REVIEW_SCHEMA_VERSION,
    generatedAt,
    weekOf,
    status: statuses.reduce((current, status) => maxStatus(current, status), 'pass' as BetaCheckStatus),
    cohortReviews,
    graphBacklog,
    repairReroutes,
    decisions,
    nextActions: nextActions.length
      ? nextActions
      : ['Continue the current beta cohorts and collect next-week learning evidence.'],
  };
}

export function auditDiagnosticValidity(
  graph: KnowledgeGraph,
  contentUnits: BetaContentUnit[],
  telemetryEvents: BetaTelemetryEvent[] = [],
): DiagnosticAudit {
  const scopedUnits = contentUnits.filter((unit) => ['vn_math_6_9', 'ielts'].includes(unit.programId));
  const diagnosticEvents = telemetryEvents.filter(isDiagnosticEvent).length;
  const targetCoverage = average(
    BETA_SCOPES.map((scope) =>
      calculateScopeTargetCoverage(
        graph,
        scopedUnits.filter((unit) => matchesScopeContent(unit, scope)),
        scope,
      ),
    ),
  );
  const invalidTargetIds = uniqueStrings(
    scopedUnits
      .flatMap((unit) => [...(unit.conceptIds || []), ...(unit.skillIds || [])])
      .filter((id) => !hasGraphNode(graph, id)),
  );
  const hasEnoughDiagnosticSignals = diagnosticEvents > 0 || targetCoverage >= 35;
  const status: BetaCheckStatus = invalidTargetIds.length ? 'blocked' : hasEnoughDiagnosticSignals ? 'pass' : 'watch';

  return {
    status,
    scopedContentUnits: scopedUnits.length,
    diagnosticEvents,
    targetCoverage,
    invalidTargetIds,
    detail: invalidTargetIds.length
      ? 'Diagnostic cannot be trusted while content points to missing graph nodes.'
      : hasEnoughDiagnosticSignals
        ? 'Diagnostic has enough graph coverage or live diagnostic telemetry for internal beta.'
        : 'Diagnostic has content coverage but still needs live diagnostic attempts.',
  };
}

export function auditRecommendationSanity(graph: KnowledgeGraph, learners: BetaLearner[] = []): RecommendationAudit {
  const issues: RecommendationIssue[] = [];
  let checkedLearners = 0;
  let saneRecommendations = 0;

  learners.forEach((learner) => {
    if (!learner.state) return;
    checkedLearners += 1;
    const recommendation = recommendNextAction(learner.state, { diagnosticMinAttempts: 8 });
    const targetIds = uniqueStrings([...recommendation.conceptIds, ...recommendation.skillIds]);
    const allowedIds = new Set(learner.targetProgramIds.flatMap((programId) => programTargetIds(graph, programId)));
    const missingTargets = targetIds.filter((id) => !hasGraphNode(graph, id));
    const outsideProgram = targetIds.filter((id) => !allowedIds.has(id));
    const diagnosticIsValid = recommendation.kind === 'diagnostic' && targetIds.length === 0;
    const challengeIsValid = recommendation.kind === 'challenge' && targetIds.length === 0;

    if (missingTargets.length || outsideProgram.length) {
      issues.push({
        learnerId: learner.id,
        reason: missingTargets.length
          ? 'recommendation_target_missing_graph_node'
          : 'recommendation_target_outside_program_map',
        recommendationKind: recommendation.kind,
        targetIds,
      });
    } else if (targetIds.length || diagnosticIsValid || challengeIsValid) {
      saneRecommendations += 1;
    } else {
      issues.push({
        learnerId: learner.id,
        reason: 'recommendation_has_no_actionable_target',
        recommendationKind: recommendation.kind,
        targetIds,
      });
    }
  });

  const status: BetaCheckStatus = checkedLearners === 0 ? 'watch' : issues.length ? 'blocked' : 'pass';
  return {
    status,
    checkedLearners,
    saneRecommendations,
    questionableRecommendations: issues,
    detail:
      checkedLearners === 0
        ? 'No learner state was available, so recommendation sanity is waiting for beta users.'
        : issues.length
          ? 'At least one recommendation points to a missing or out-of-scope graph target.'
          : 'Recommendations are scoped to the learner target programs and valid graph nodes.',
  };
}

export function buildRealLearningKpiReport(
  learners: BetaLearner[] = [],
  telemetryEvents: BetaTelemetryEvent[] = [],
): RealLearningKpiReport {
  const liveLearners = learners.filter((learner) => learner.state);
  const realLearners = liveLearners.filter((learner) => learner.stateKind !== 'synthetic');
  const syntheticLearners = liveLearners.filter((learner) => learner.stateKind === 'synthetic');
  const attempts = liveLearners.flatMap((learner) => learner.state?.attempts || []);
  const realAttempts = realLearners.flatMap((learner) => learner.state?.attempts || []);
  const syntheticAttempts = syntheticLearners.flatMap((learner) => learner.state?.attempts || []);
  const realEventSamples =
    telemetryEvents.filter((event) => isLearningEvidenceEvent(event) && !isSeedTelemetryEvent(event)).length +
    realLearners.flatMap((learner) => learner.state?.learningEvents || []).length;
  const seededEventSamples =
    telemetryEvents.filter((event) => isLearningEvidenceEvent(event) && isSeedTelemetryEvent(event)).length +
    syntheticLearners.flatMap((learner) => learner.state?.learningEvents || []).length;
  const eventSamples = realEventSamples + seededEventSamples;
  const evidenceSource = mergeEvidenceSources([
    ...(realAttempts.length || realEventSamples ? ['live' as const] : []),
    ...(syntheticAttempts.length || seededEventSamples ? ['synthetic' as const] : []),
  ]);
  const masteryLift = average(
    liveLearners.map((learner) => learnerMasteryLift(learner)).filter((value) => Number.isFinite(value)),
  );
  const retentionAfter7Days = calculateRetentionAfterSevenDays(liveLearners);
  const timeToStableDays = calculateTimeToStableDays(liveLearners);
  const errorRecurrenceRate = calculateErrorRecurrenceRate(attempts);
  const lessonCompletionQuality = calculateLessonCompletionQuality(attempts);
  const status: BetaCheckStatus =
    attempts.length === 0
      ? 'blocked'
      : attempts.length < 10 || eventSamples < 5
        ? 'watch'
        : errorRecurrenceRate >= 70 || lessonCompletionQuality < 45
          ? 'blocked'
          : evidenceSource === 'synthetic' || masteryLift < 0 || retentionAfter7Days < 35
            ? 'watch'
            : 'pass';

  return {
    status,
    learners: liveLearners.length,
    realLearners: realLearners.length,
    syntheticLearners: syntheticLearners.length,
    attemptSamples: attempts.length,
    realAttemptSamples: realAttempts.length,
    syntheticAttemptSamples: syntheticAttempts.length,
    eventSamples,
    realEventSamples,
    seededEventSamples,
    evidenceSource,
    masteryLift,
    retentionAfter7Days,
    timeToStableDays,
    errorRecurrenceRate,
    lessonCompletionQuality,
    detail:
      status === 'blocked'
        ? 'Real learning KPI is blocked because attempts are missing or error recurrence/completion quality is too weak.'
        : status === 'watch'
          ? evidenceSource === 'synthetic'
            ? 'Learning KPI currently relies on seeded/synthetic evidence; collect live events before trusting graph or routing changes.'
            : 'Real learning KPI has signals, but beta needs more events or stronger retention before graph changes are trusted.'
          : 'Real learning KPI has enough attempts, positive lift, acceptable recurrence, and usable retention evidence.',
  };
}

export function buildMasteryShadowAudit(
  learners: BetaLearner[] = [],
  generatedAt: string = new Date().toISOString(),
): MasteryShadowAudit {
  const learnersWithState = learners.filter((learner) => learner.state);
  const reports = learnersWithState.map((learner) =>
    computeMasteryV2ShadowReport(learner.state!, { generatedAt, now: generatedAt }),
  );
  const rows = reports.flatMap((report) => report.rows);
  const changedStatusRows = reports.reduce((sum, report) => sum + report.summary.changedStatusRows, 0);
  const largestAbsoluteDelta = rows.length ? Math.max(...rows.map((row) => Math.abs(row.delta))) : 0;
  const protectedFeedbackOnlyEvents = reports.reduce(
    (sum, report) => sum + report.summary.protectedFeedbackOnlyEvents,
    0,
  );
  const evidenceSource = mergeEvidenceSources(learnersWithState.map(learnerEvidenceSource));
  const status: BetaCheckStatus =
    learnersWithState.length === 0 || rows.length === 0
      ? 'watch'
      : evidenceSource === 'synthetic' || changedStatusRows > 0 || largestAbsoluteDelta >= 20
        ? 'watch'
        : 'pass';

  return {
    status,
    learners: learnersWithState.length,
    rows: rows.length,
    changedStatusRows,
    largestAbsoluteDelta,
    protectedFeedbackOnlyEvents,
    evidenceSource,
    learnerReports: reports.map((report) => ({
      generatedAt: report.generatedAt,
      summary: report.summary,
      studentFacingEnabled: report.studentFacingEnabled,
      recommendationPolicy: report.recommendationPolicy,
    })),
    detail:
      learnersWithState.length === 0 || rows.length === 0
        ? 'Mastery V2 shadow is waiting for learner attempt evidence.'
        : status === 'watch'
          ? 'Mastery V2 shadow is collecting comparison deltas only; review changed statuses or synthetic evidence before enabling any behavior.'
          : 'Mastery V2 shadow produced comparison rows without status drift; recommendations still use V1 only.',
  };
}

export function buildEmpiricalDifficultyAudit(
  learners: BetaLearner[] = [],
  generatedAt: string = new Date().toISOString(),
): EmpiricalDifficultyAudit {
  const learnersWithState = learners.filter((learner) => learner.state);
  const reports = learnersWithState.map((learner) =>
    buildEmpiricalDifficultyShadowReport(learner.state!, { generatedAt, minAttemptsPerItem: 5 }),
  );
  const evidenceSource = mergeEvidenceSources(learnersWithState.map(learnerEvidenceSource));
  const rows = reports.reduce((sum, report) => sum + report.summary.totalItems, 0);
  const calibratedCandidates = reports.reduce((sum, report) => sum + report.summary.calibratedCandidates, 0);
  const sparseItems = reports.reduce((sum, report) => sum + report.summary.sparseItems, 0);
  const driftWatchItems = reports.reduce((sum, report) => sum + report.summary.driftWatchItems, 0);
  const status: BetaCheckStatus =
    learnersWithState.length === 0 || rows === 0
      ? 'watch'
      : evidenceSource === 'synthetic' || calibratedCandidates === 0 || sparseItems > 0 || driftWatchItems > 0
        ? 'watch'
        : 'pass';

  return {
    status,
    learners: learnersWithState.length,
    rows,
    calibratedCandidates,
    sparseItems,
    driftWatchItems,
    evidenceSource,
    learnerReports: reports.map((report) => ({
      generatedAt: report.generatedAt,
      summary: report.summary,
      calibrationPolicy: report.calibrationPolicy,
      highStakesPlacementEnabled: report.highStakesPlacementEnabled,
    })),
    detail:
      status === 'watch'
        ? 'Empirical difficulty and lightweight Elo are shadow-only; keep teacher-authored difficulty until real repeated attempts confirm calibration.'
        : 'Empirical difficulty has enough candidate rows without drift, but remains shadow-only and reversible.',
  };
}

export function auditRecommendationQuality(
  graph: KnowledgeGraph,
  learners: BetaLearner[] = [],
): RecommendationQualityAudit {
  const watchIssues: RecommendationQualityIssue[] = [];
  const blockedIssues: RecommendationQualityIssue[] = [];
  let checkedLearners = 0;
  let passedRecommendations = 0;

  learners.forEach((learner) => {
    if (!learner.state) return;
    checkedLearners += 1;
    const recommendation = recommendNextAction(learner.state, { diagnosticMinAttempts: 8 });
    const targetIds = uniqueStrings([...recommendation.conceptIds, ...recommendation.skillIds]);
    const mastery = computeMastery(learner.state);
    const masteryById = new Map(mastery.map((row) => [row.id, row]));
    const allowedIds = new Set(learner.targetProgramIds.flatMap((programId) => programTargetIds(graph, programId)));
    const issues = [
      ...auditRecommendationGraphScope(graph, learner, recommendation, targetIds, allowedIds),
      ...auditRecommendationPrerequisites(graph, learner, recommendation, targetIds, masteryById),
      ...auditRecommendationDifficulty(learner, recommendation, mastery, targetIds),
      ...auditRecommendationRepetition(learner, recommendation, targetIds),
    ];

    if (!issues.length) {
      passedRecommendations += 1;
      return;
    }

    issues.forEach((issue) => {
      if (issue.severity === 'blocked') blockedIssues.push(issue);
      else watchIssues.push(issue);
    });
  });

  const status: BetaCheckStatus =
    checkedLearners === 0 ? 'watch' : blockedIssues.length ? 'blocked' : watchIssues.length ? 'watch' : 'pass';
  return {
    status,
    checkedLearners,
    passedRecommendations,
    watchIssues,
    blockedIssues,
    detail:
      checkedLearners === 0
        ? 'No learner state is available for recommendation quality audit.'
        : blockedIssues.length
          ? 'At least one recommendation has a graph/program scope issue that must be fixed before assignment.'
          : watchIssues.length
            ? 'Recommendations are valid, but some should be watched for prerequisite, difficulty, or repetition quality.'
            : 'Recommendations pass graph scope, prerequisite, difficulty, and repetition checks.',
  };
}

function learnerMasteryLift(learner: BetaLearner): number {
  const attempts = learner.state?.attempts || [];
  if (attempts.length < 4) return 0;
  const ordered = [...attempts].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
  const splitIndex = Math.max(2, Math.floor(ordered.length / 2));
  const earlyScore = averageMasteryScore(ordered.slice(0, splitIndex));
  const finalScore = averageMasteryScore(ordered);
  return Math.round(finalScore - earlyScore);
}

function averageMasteryScore(attempts: AttemptRecord[]): number {
  const mastery = computeMastery(attempts);
  if (!mastery.length) return 0;
  return average(mastery.map((row) => row.score));
}

function calculateRetentionAfterSevenDays(learners: BetaLearner[]): number {
  let retained = 0;
  let samples = 0;

  learners.forEach((learner) => {
    const attempts = [...(learner.state?.attempts || [])].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    attempts.forEach((attempt, index) => {
      const previousWrong = attempts
        .slice(0, index)
        .reverse()
        .find((previous) => {
          if (previous.correct) return false;
          if (!shareAttemptTarget(previous, attempt)) return false;
          return daysBetween(previous.answeredAt, attempt.answeredAt) >= 7;
        });
      if (!previousWrong) return;
      samples += 1;
      if (attempt.correct) retained += 1;
    });
  });

  return samples ? Math.round((retained / samples) * 100) : 0;
}

function calculateTimeToStableDays(learners: BetaLearner[]): number | null {
  const stableDurations = learners.flatMap((learner) => {
    const attempts = learner.state?.attempts || [];
    if (!attempts.length) return [];
    const firstAttemptAt = attempts.map((attempt) => attempt.answeredAt).sort()[0];
    return computeMastery(attempts)
      .filter((row) => row.status === 'stable' && row.lastCorrectAt)
      .map((row) => Math.max(0, daysBetween(firstAttemptAt, row.lastCorrectAt)));
  });
  if (!stableDurations.length) return null;
  return average(stableDurations);
}

function calculateErrorRecurrenceRate(attempts: AttemptRecord[]): number {
  const wrongByTarget = new Map<string, number>();
  attempts
    .filter((attempt) => !attempt.correct)
    .forEach((attempt) => {
      attemptTargetKeys(attempt).forEach((key) => {
        wrongByTarget.set(key, (wrongByTarget.get(key) || 0) + 1);
      });
    });
  const wrongSignals = [...wrongByTarget.values()].reduce((sum, count) => sum + count, 0);
  const repeatedSignals = [...wrongByTarget.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  return wrongSignals ? Math.round((repeatedSignals / wrongSignals) * 100) : 0;
}

function calculateLessonCompletionQuality(attempts: AttemptRecord[]): number {
  const learningAttempts = attempts.filter((attempt) =>
    ['lesson', 'practice', 'review', 'mock_test'].includes(normalizeText(attempt.mode)),
  );
  if (!learningAttempts.length) return 0;
  const correctRate = learningAttempts.filter((attempt) => attempt.correct).length / learningAttempts.length;
  const hintPenalty = (learningAttempts.filter((attempt) => attempt.hintUsed).length / learningAttempts.length) * 15;
  return Math.max(0, Math.round(correctRate * 100 - hintPenalty));
}

function auditRecommendationGraphScope(
  graph: KnowledgeGraph,
  learner: BetaLearner,
  recommendation: Recommendation,
  targetIds: string[],
  allowedIds: Set<string>,
): RecommendationQualityIssue[] {
  const missingTargets = targetIds.filter((id) => !hasGraphNode(graph, id));
  const outsideProgram = targetIds.filter((id) => !allowedIds.has(id));
  const issues: RecommendationQualityIssue[] = [];
  if (missingTargets.length) {
    issues.push(
      recommendationIssue(
        learner,
        recommendation,
        missingTargets,
        'missing_graph_target',
        'blocked',
        'Recommendation points to graph nodes that do not exist.',
      ),
    );
  }
  if (outsideProgram.length) {
    issues.push(
      recommendationIssue(
        learner,
        recommendation,
        outsideProgram,
        'out_of_program_target',
        'blocked',
        "Recommendation target is outside the learner's assigned program map.",
      ),
    );
  }
  return issues;
}

function auditRecommendationPrerequisites(
  graph: KnowledgeGraph,
  learner: BetaLearner,
  recommendation: Recommendation,
  targetIds: string[],
  masteryById: Map<string, MasteryEstimate>,
): RecommendationQualityIssue[] {
  if (!targetIds.length || recommendation.kind === 'diagnostic') return [];
  return uniqueStrings(
    targetIds.flatMap((targetId) =>
      graph.edges.filter((edge) => edge.to === targetId && edge.type === 'prerequisite').map((edge) => edge.from),
    ),
  )
    .filter((prerequisiteId) => {
      const prerequisite = masteryById.get(prerequisiteId);
      return prerequisite && prerequisite.status !== 'stable' && prerequisite.score < 70;
    })
    .slice(0, 3)
    .map((prerequisiteId) =>
      recommendationIssue(
        learner,
        recommendation,
        [prerequisiteId],
        'prerequisite_not_stable',
        'watch',
        `Prerequisite ${prerequisiteId} is not stable enough before assigning ${targetIds.join(', ')}.`,
      ),
    );
}

function auditRecommendationDifficulty(
  learner: BetaLearner,
  recommendation: Recommendation,
  mastery: MasteryEstimate[],
  targetIds: string[],
): RecommendationQualityIssue[] {
  const attempts = learner.state?.attempts.length || 0;
  const targetRows = targetIds.length ? mastery.filter((row) => targetIds.includes(row.id)) : mastery;
  const averageTargetScore = targetRows.length
    ? average(targetRows.map((row) => row.score))
    : average(mastery.map((row) => row.score));
  const allTargetsStable = targetRows.length > 0 && targetRows.every((row) => row.status === 'stable');

  if (recommendation.kind === 'diagnostic' && attempts >= 12) {
    return [
      recommendationIssue(
        learner,
        recommendation,
        targetIds,
        'stale_diagnostic',
        'watch',
        'Learner already has enough attempts; diagnostic should not keep repeating.',
      ),
    ];
  }
  if (recommendation.kind === 'challenge' && averageTargetScore < 78) {
    return [
      recommendationIssue(
        learner,
        recommendation,
        targetIds,
        'challenge_too_early',
        'watch',
        'Challenge recommendation appears too hard for current mastery evidence.',
      ),
    ];
  }
  if ((recommendation.kind === 'practice' || recommendation.kind === 'review') && allTargetsStable) {
    return [
      recommendationIssue(
        learner,
        recommendation,
        targetIds,
        'repeated_without_progress',
        'watch',
        'Recommendation points to already stable targets; move learner forward or mix challenge practice.',
      ),
    ];
  }
  return [];
}

function auditRecommendationRepetition(
  learner: BetaLearner,
  recommendation: Recommendation,
  targetIds: string[],
): RecommendationQualityIssue[] {
  if (!targetIds.length) return [];
  const recentAttempts = [...(learner.state?.attempts || [])]
    .slice(-6)
    .filter((attempt) => targetIds.some((targetId) => attemptTargetKeys(attempt).includes(targetId)));
  if (recentAttempts.length >= 3 && recentAttempts.every((attempt) => !attempt.correct)) {
    return [
      recommendationIssue(
        learner,
        recommendation,
        targetIds,
        'repeated_without_progress',
        'watch',
        'The same target has repeated recent errors; assign prerequisite repair or teacher intervention before more same-level practice.',
      ),
    ];
  }
  return [];
}

function recommendationIssue(
  learner: BetaLearner,
  recommendation: Recommendation,
  targetIds: string[],
  reason: RecommendationQualityIssue['reason'],
  severity: BetaCheckStatus,
  detail: string,
): RecommendationQualityIssue {
  return {
    learnerId: learner.id,
    reason,
    severity,
    recommendationKind: recommendation.kind,
    targetIds,
    detail,
  };
}

export function buildLearningEventReadiness(
  learners: BetaLearner[] = [],
  telemetryEvents: BetaTelemetryEvent[] = [],
): LearningEventReadiness {
  const liveLearners = learners.filter((learner) => learner.state && learner.stateKind !== 'synthetic');
  const syntheticLearners = learners.filter((learner) => learner.state && learner.stateKind === 'synthetic');
  const stateEvents = liveLearners.flatMap((learner) => learner.state?.learningEvents || []);
  const syntheticStateEvents = syntheticLearners.flatMap((learner) => learner.state?.learningEvents || []);
  const convertedTelemetry = telemetryEvents.map(convertTelemetryEvent);
  const normalized = normalizeLearningEvents([...stateEvents, ...syntheticStateEvents, ...convertedTelemetry]);
  const summary = summarizeLearningEvents(normalized);
  const realTelemetryEvents = telemetryEvents.filter(
    (event) => isLearningEvidenceEvent(event) && !isSeedTelemetryEvent(event),
  ).length;
  const seededTelemetryEvents = telemetryEvents.filter(
    (event) => isLearningEvidenceEvent(event) && isSeedTelemetryEvent(event),
  ).length;
  const stateLearningEvents = stateEvents.length;
  const syntheticStateLearningEvents = syntheticStateEvents.length;
  const status: BetaCheckStatus =
    realTelemetryEvents > 0 || stateLearningEvents >= 5 ? 'pass' : normalized.length > 0 ? 'watch' : 'blocked';
  const evidenceBreakdown: BetaEvidenceBreakdown = {
    liveTelemetryEvents: realTelemetryEvents,
    seededTelemetryEvents,
    liveStateLearningEvents: stateLearningEvents,
    syntheticStateLearningEvents,
    liveLearners: liveLearners.length,
    syntheticLearners: syntheticLearners.length,
  };

  return {
    status,
    totalEvents: normalized.length,
    realTelemetryEvents,
    seededTelemetryEvents,
    stateLearningEvents,
    syntheticStateLearningEvents,
    evidenceBreakdown,
    byType: summary.byType,
    firstAt: summary.firstAt,
    lastAt: summary.lastAt,
    detail:
      status === 'pass'
        ? 'Learning events are being captured from learner state or portal telemetry.'
        : status === 'watch'
          ? seededTelemetryEvents || syntheticStateLearningEvents
            ? 'Only seeded/synthetic learning events are available; collect live learner evidence before widening beta or changing graph edges.'
            : 'Some events exist, but beta should collect more direct learning attempts.'
          : 'No learning event evidence is available yet.',
  };
}

export function buildGraphAdjustmentCandidates(
  graph: KnowledgeGraph,
  contentUnits: BetaContentUnit[],
  learners: BetaLearner[] = [],
): GraphAdjustmentCandidate[] {
  const misconceptionSignals = buildMisconceptionSignalCandidates(graph, learners);
  const weakMastery = learners.flatMap((learner) => {
    if (!learner.state) return [];
    return computeMastery(learner.state)
      .filter((row) => row.status === 'repair' && row.attempts >= 3)
      .map((row) =>
        masteryToAdjustmentCandidate(row, learner.targetProgramIds[0] || row.domainId, learnerEvidenceSource(learner)),
      );
  });
  const missingMetadata = contentUnits
    .filter((unit) => !(unit.conceptIds?.length || unit.skillIds?.length))
    .slice(0, 12)
    .map((unit) => ({
      id: unit.id,
      kind: 'missing_metadata' as const,
      programId: unit.programId,
      evidenceCount: Number(unit.questionCount || 0),
      score: 0,
      evidenceSource: 'live' as const,
      autoApply: false as const,
      reason: `Content unit "${unit.title}" needs conceptIds/skillIds before graph tuning.`,
    }));
  const invalidMetadata = contentUnits
    .flatMap((unit) =>
      [...(unit.conceptIds || []), ...(unit.skillIds || [])]
        .filter((id) => !hasGraphNode(graph, id))
        .map((id) => ({ unit, id })),
    )
    .slice(0, 12)
    .map(({ unit, id }) => ({
      id,
      kind: 'high_risk' as const,
      programId: unit.programId,
      evidenceCount: Number(unit.questionCount || 0),
      score: 0,
      evidenceSource: 'live' as const,
      autoApply: false as const,
      reason: `Metadata from "${unit.title}" points to missing graph node ${id}.`,
    }));

  return [...misconceptionSignals, ...weakMastery, ...invalidMetadata, ...missingMetadata].slice(0, 20);
}

export function buildRepairRerouteCandidates(
  graph: KnowledgeGraph,
  learners: BetaLearner[] = [],
  options: { repairEvidenceThreshold?: number; consecutiveWrongThreshold?: number } = {},
): RepairRerouteCandidate[] {
  const repairEvidenceThreshold = Math.max(3, Number(options.repairEvidenceThreshold || 5));
  const consecutiveWrongThreshold = Math.max(2, Number(options.consecutiveWrongThreshold || 3));
  const candidates = learners.flatMap((learner) => {
    if (!learner.state) return [];
    const mastery = computeMastery(learner.state);
    return mastery
      .filter((row) => row.status === 'repair')
      .flatMap((row) => {
        const targetAttempts = attemptsForMasteryTarget(learner.state?.attempts || [], row);
        const wrongAttempts = targetAttempts.filter((attempt) => !attempt.correct).length;
        const consecutiveWrongAttempts = countConsecutiveWrongAttempts(targetAttempts);
        const isStuck =
          row.attempts >= repairEvidenceThreshold || consecutiveWrongAttempts >= consecutiveWrongThreshold;
        if (!isStuck) return [];

        const prerequisiteIds = graph.edges
          .filter((edge) => edge.type === 'prerequisite' && edge.to === row.id)
          .map((edge) => edge.from);
        const prerequisiteRows = new Map(mastery.map((item) => [item.id, item]));
        const suspectedPrerequisiteIds = uniqueStrings(
          prerequisiteIds.filter((id) => {
            const prerequisite = prerequisiteRows.get(id);
            return !prerequisite || prerequisite.status !== 'stable' || prerequisite.score < 70;
          }),
        ).slice(0, 4);
        const misconceptionIds = uniqueStrings([
          ...row.misconceptionIds,
          ...targetAttempts.flatMap((attempt) => attempt.misconceptionIds || []),
        ]).slice(0, 4);
        const action = selectRerouteAction({
          suspectedPrerequisiteIds,
          misconceptionIds,
          consecutiveWrongAttempts,
          evidenceCount: row.attempts,
          score: row.score,
        });

        return [
          {
            learnerId: learner.id,
            programId: learner.targetProgramIds[0] || row.domainId,
            targetId: row.id,
            scope: row.scope,
            status: row.status,
            evidenceCount: row.attempts,
            wrongAttempts,
            consecutiveWrongAttempts,
            score: row.score,
            suspectedPrerequisiteIds,
            misconceptionIds,
            action,
            evidenceSource: learnerEvidenceSource(learner),
            reason: rerouteReason(row, action, suspectedPrerequisiteIds, misconceptionIds, consecutiveWrongAttempts),
          } satisfies RepairRerouteCandidate,
        ];
      });
  });

  return candidates
    .sort(
      (a, b) =>
        sourceRank(b.evidenceSource) - sourceRank(a.evidenceSource) ||
        b.consecutiveWrongAttempts - a.consecutiveWrongAttempts ||
        b.evidenceCount - a.evidenceCount ||
        a.targetId.localeCompare(b.targetId),
    )
    .slice(0, 20);
}

function buildScopeReport(
  graph: KnowledgeGraph,
  scope: BetaScopeConfig,
  contentUnits: BetaContentUnit[],
  learners: BetaLearner[],
  telemetryEvents: BetaTelemetryEvent[],
): BetaScopeReport {
  const scopedContent = contentUnits.filter((unit) => matchesScopeContent(unit, scope));
  const activeContent = scopedContent.filter((unit) => normalizeStatus(unit.status) !== 'inactive');
  const questionCount = activeContent.reduce((sum, unit) => sum + Number(unit.questionCount || 0), 0);
  const scopedLearners = learners.filter((learner) => learner.targetProgramIds.includes(scope.programId));
  const targetCoverage = calculateScopeTargetCoverage(graph, activeContent, scope);
  const diagnosticStatus = auditScopeDiagnostic(scope, activeContent, telemetryEvents, targetCoverage);
  const recommendationStatus = auditRecommendationSanity(graph, scopedLearners).status;
  const blockers: string[] = [];
  const nextActions: string[] = [];

  if (activeContent.length < scope.minContentUnits)
    blockers.push(`Need ${scope.minContentUnits - activeContent.length} more active content units.`);
  if (questionCount < scope.minQuestions) blockers.push(`Need ${scope.minQuestions - questionCount} more questions.`);
  if (scopedLearners.length < scope.minLearners)
    nextActions.push('Assign at least one internal beta learner to this program.');
  if (targetCoverage < 35) nextActions.push('Add conceptIds/skillIds so beta content covers more graph targets.');
  if (diagnosticStatus !== 'pass') nextActions.push('Collect diagnostic attempts before trusting adaptive placement.');
  if (recommendationStatus === 'blocked') blockers.push('Recommendation audit found out-of-scope targets.');

  const status: BetaCheckStatus = blockers.length
    ? 'blocked'
    : scopedLearners.length < scope.minLearners || diagnosticStatus === 'watch' || targetCoverage < 50
      ? 'watch'
      : 'pass';

  return {
    scopeId: scope.scopeId,
    title: scope.title,
    programId: scope.programId,
    status,
    contentUnits: activeContent.length,
    questionCount,
    learners: scopedLearners.length,
    targetCoverage,
    diagnosticStatus,
    recommendationStatus,
    blockers,
    nextActions,
  };
}

function buildChecklist(
  scopes: BetaScopeReport[],
  learningEvents: LearningEventReadiness,
  diagnosticAudit: DiagnosticAudit,
  recommendationAudit: RecommendationAudit,
  graphAdjustmentCandidates: GraphAdjustmentCandidate[],
): BetaChecklistItem[] {
  const mathScope = scopes.find((scope) => scope.scopeId === 'math_9_internal');
  const ieltsScope = scopes.find((scope) => scope.scopeId === 'ielts_reading_listening_internal');
  return [
    {
      id: 'math_9_beta',
      label: 'Beta noi bo voi Toan lop 9',
      status: mathScope?.status || 'blocked',
      detail: scopeDetail(mathScope),
      evidenceCount: mathScope?.questionCount || 0,
    },
    {
      id: 'ielts_reading_listening_beta',
      label: 'Beta noi bo voi IELTS Reading/Listening',
      status: ieltsScope?.status || 'blocked',
      detail: scopeDetail(ieltsScope),
      evidenceCount: ieltsScope?.questionCount || 0,
    },
    {
      id: 'real_learning_events',
      label: 'Thu thap learning events that',
      status: learningEvents.status,
      detail: learningEvents.detail,
      evidenceCount: learningEvents.totalEvents,
    },
    {
      id: 'diagnostic_validity',
      label: 'Kiem tra do dung cua diagnostic',
      status: diagnosticAudit.status,
      detail: diagnosticAudit.detail,
      evidenceCount: diagnosticAudit.diagnosticEvents || diagnosticAudit.scopedContentUnits,
    },
    {
      id: 'recommendation_sanity',
      label: 'Kiem tra recommendation co hop ly khong',
      status: recommendationAudit.status,
      detail: recommendationAudit.detail,
      evidenceCount: recommendationAudit.checkedLearners,
    },
    {
      id: 'graph_adjustment_backlog',
      label: 'Sua Knowledge Graph theo du lieu that',
      status: graphAdjustmentCandidates.length ? 'watch' : 'blocked',
      detail: graphAdjustmentCandidates.length
        ? 'Graph adjustment backlog is ready; apply changes only after reviewing live beta evidence.'
        : 'No beta evidence is available yet to justify graph changes.',
      evidenceCount: graphAdjustmentCandidates.length,
    },
  ];
}

function buildRunPlanNextActions(report: BetaReadinessReport, cohorts: InternalBetaCohort[]): string[] {
  const actions: string[] = [];
  cohorts.forEach((cohort) => {
    if (cohort.currentLearners < cohort.targetLearners) {
      actions.push(
        `Recruit ${cohort.targetLearners - cohort.currentLearners} more internal learners for ${cohort.title}.`,
      );
    }
    if (cohort.status === 'blocked') {
      actions.push(`Clear blockers before launching ${cohort.title}.`);
    }
  });
  if (report.learningEvents.status !== 'pass')
    actions.push('Collect live learning events from diagnostic/practice/review flows.');
  if (report.diagnosticAudit.status !== 'pass') actions.push('Run at least one diagnostic attempt per beta learner.');
  if (report.recommendationAudit.status === 'blocked')
    actions.push('Fix recommendation targets before assigning adaptive paths.');
  const liveRerouteCandidates = report.repairRerouteCandidates.filter(
    (candidate) => candidate.evidenceSource !== 'synthetic',
  );
  const syntheticRerouteCandidates = report.repairRerouteCandidates.filter(
    (candidate) => candidate.evidenceSource === 'synthetic',
  );
  if (liveRerouteCandidates.length) {
    actions.push(
      `Review ${liveRerouteCandidates.length} live stuck-repair reroute candidate(s) before assigning more same-level practice.`,
    );
  } else if (syntheticRerouteCandidates.length) {
    actions.push(
      `Track ${syntheticRerouteCandidates.length} simulated stuck-repair reroute candidate(s) separately from live beta evidence.`,
    );
  }
  if (!report.graphAdjustmentCandidates.length)
    actions.push('Wait for live beta evidence before changing Knowledge Graph edges.');
  return actions.length ? actions : ['Launch the internal beta cohorts and monitor the Phase 10 checklist daily.'];
}

function buildScopeChangeImpactItems(
  previousScopes: BetaScopeReport[],
  currentScopes: BetaScopeReport[],
  hasPrevious: boolean,
): ChangeImpactItem[] {
  const previousById = new Map(previousScopes.map((scope) => [scope.scopeId, scope]));
  return currentScopes.flatMap((scope) => {
    const previous = previousById.get(scope.scopeId);
    const changed =
      !previous ||
      previous.status !== scope.status ||
      previous.contentUnits !== scope.contentUnits ||
      previous.questionCount !== scope.questionCount ||
      previous.learners !== scope.learners ||
      previous.targetCoverage !== scope.targetCoverage;
    const changeType = !hasPrevious ? 'baseline' : !previous ? 'added' : changed ? 'updated' : 'unchanged_risk';
    if (hasPrevious && changeType === 'unchanged_risk' && scope.status === 'pass') return [];

    return [
      {
        id: `scope:${scope.scopeId}`,
        kind: 'scope',
        changeType,
        severity: scope.status,
        title: scope.title,
        whatChanged: previous
          ? `Status ${previous.status} -> ${scope.status}; questions ${previous.questionCount} -> ${scope.questionCount}; coverage ${previous.targetCoverage}% -> ${scope.targetCoverage}%.`
          : `Baseline captured with ${scope.contentUnits} content units, ${scope.questionCount} questions, ${scope.targetCoverage}% graph coverage.`,
        why: scope.blockers.length
          ? scope.blockers.join(' ')
          : scope.nextActions.length
            ? scope.nextActions.join(' ')
            : scopeDetail(scope),
        impact: betaStatusImpact(
          scope.status,
          'Scope is ready for the internal beta cohort.',
          'Scope can run, but it needs more learner evidence or coverage review.',
          'Scope should not be expanded until blockers are cleared.',
        ),
        evidenceCount: scope.questionCount,
      },
    ];
  });
}

function buildChecklistChangeImpactItems(
  previousItems: BetaChecklistItem[],
  currentItems: BetaChecklistItem[],
  hasPrevious: boolean,
): ChangeImpactItem[] {
  const previousById = new Map(previousItems.map((item) => [item.id, item]));
  return currentItems.flatMap((item) => {
    const previous = previousById.get(item.id);
    const changed =
      !previous ||
      previous.status !== item.status ||
      previous.evidenceCount !== item.evidenceCount ||
      previous.detail !== item.detail;
    const changeType = !hasPrevious ? 'baseline' : !previous ? 'added' : changed ? 'updated' : 'unchanged_risk';
    if (hasPrevious && changeType === 'unchanged_risk' && item.status === 'pass') return [];

    return [
      {
        id: `checklist:${item.id}`,
        kind: 'checklist',
        changeType,
        severity: item.status,
        title: item.label,
        whatChanged: previous
          ? `Status ${previous.status} -> ${item.status}; evidence ${previous.evidenceCount} -> ${item.evidenceCount}.`
          : `Baseline checklist status is ${item.status} with ${item.evidenceCount} evidence signals.`,
        why: item.detail,
        impact: betaStatusImpact(
          item.status,
          'Gate is acceptable for internal beta.',
          'Gate needs monitoring before wider rollout.',
          'Gate blocks rollout until fixed.',
        ),
        evidenceCount: item.evidenceCount,
      },
    ];
  });
}

function buildLearningKpiChangeImpactItem(
  previous: RealLearningKpiReport | undefined,
  current: RealLearningKpiReport,
): ChangeImpactItem {
  const changed =
    !previous ||
    previous.status !== current.status ||
    previous.masteryLift !== current.masteryLift ||
    previous.retentionAfter7Days !== current.retentionAfter7Days ||
    previous.errorRecurrenceRate !== current.errorRecurrenceRate ||
    previous.lessonCompletionQuality !== current.lessonCompletionQuality;
  const changeType: ChangeImpactType = !previous ? 'baseline' : changed ? 'updated' : 'unchanged_risk';

  return {
    id: 'kpi:real_learning',
    kind: 'kpi',
    changeType,
    severity: current.status,
    title: 'Real learning KPI',
    whatChanged: previous
      ? `Mastery lift ${previous.masteryLift} -> ${current.masteryLift}; retention ${previous.retentionAfter7Days}% -> ${current.retentionAfter7Days}%; recurrence ${previous.errorRecurrenceRate}% -> ${current.errorRecurrenceRate}%; completion quality ${previous.lessonCompletionQuality}% -> ${current.lessonCompletionQuality}%; source ${previous.evidenceSource || 'unknown'} -> ${current.evidenceSource}.`
      : `Baseline: mastery lift ${current.masteryLift}, retention ${current.retentionAfter7Days}%, time-to-stable ${formatNullableDays(current.timeToStableDays)}, recurrence ${current.errorRecurrenceRate}%, completion quality ${current.lessonCompletionQuality}%, source ${current.evidenceSource}.`,
    why: current.detail,
    impact: betaStatusImpact(
      current.status,
      'Learning impact is strong enough to trust the current path.',
      'Learning impact has signals but needs more evidence before graph changes.',
      'Learning data is not strong enough for cohort expansion or graph changes.',
    ),
    evidenceCount: current.attemptSamples + current.eventSamples,
  };
}

function buildRecommendationQualityChangeImpactItem(
  previous: RecommendationQualityAudit | undefined,
  current: RecommendationQualityAudit,
): ChangeImpactItem {
  const currentIssues = current.blockedIssues.length + current.watchIssues.length;
  const previousIssues = previous ? previous.blockedIssues.length + previous.watchIssues.length : 0;
  const changed =
    !previous ||
    previous.status !== current.status ||
    previous.checkedLearners !== current.checkedLearners ||
    previousIssues !== currentIssues ||
    previous.passedRecommendations !== current.passedRecommendations;
  const changeType: ChangeImpactType = !previous ? 'baseline' : changed ? 'updated' : 'unchanged_risk';

  return {
    id: 'recommendation:quality',
    kind: 'recommendation',
    changeType,
    severity: current.status,
    title: 'Recommendation quality',
    whatChanged: previous
      ? `Checked learners ${previous.checkedLearners} -> ${current.checkedLearners}; issues ${previousIssues} -> ${currentIssues}; passed ${previous.passedRecommendations} -> ${current.passedRecommendations}.`
      : `Baseline: ${current.checkedLearners} learners checked, ${current.passedRecommendations} recommendations passed, ${current.blockedIssues.length} blocked issues, ${current.watchIssues.length} watch issues.`,
    why: current.detail,
    impact: betaStatusImpact(
      current.status,
      'Adaptive recommendations can be assigned.',
      'Recommendations are usable with teacher/admin monitoring.',
      'Adaptive recommendations must be fixed before student rollout.',
    ),
    evidenceCount: current.checkedLearners,
  };
}

function buildGraphChangeImpactItems(
  previousCandidates: GraphAdjustmentCandidate[],
  currentCandidates: GraphAdjustmentCandidate[],
): ChangeImpactItem[] {
  const previousById = new Map(previousCandidates.map((candidate) => [`${candidate.kind}:${candidate.id}`, candidate]));
  return currentCandidates.slice(0, 12).map((candidate) => {
    const previous = previousById.get(`${candidate.kind}:${candidate.id}`);
    const changed =
      !previous ||
      previous.evidenceCount !== candidate.evidenceCount ||
      previous.score !== candidate.score ||
      previous.reason !== candidate.reason;
    const changeType: ChangeImpactType = !previous ? 'added' : changed ? 'updated' : 'unchanged_risk';
    const severity = graphCandidateSeverity(candidate);

    return {
      id: `graph:${candidate.kind}:${candidate.id}`,
      kind: 'graph',
      changeType,
      severity,
      title: `${candidate.kind}: ${candidate.id}`,
      whatChanged: previous
        ? `Evidence ${previous.evidenceCount} -> ${candidate.evidenceCount}; score ${previous.score} -> ${candidate.score}; source ${previous.evidenceSource || 'unknown'} -> ${candidate.evidenceSource}.`
        : `New graph adjustment candidate from ${candidate.evidenceCount} ${candidate.evidenceSource} evidence signals.`,
      why: candidate.reason,
      impact:
        severity === 'blocked'
          ? 'Fix missing or invalid graph metadata before this content can safely drive adaptive learning.'
          : candidate.evidenceSource === 'synthetic'
            ? 'Keep this as a watch-only candidate until live beta evidence confirms it.'
            : 'Review the evidence, then accept, reject, or defer a Knowledge Graph adjustment.',
      evidenceCount: candidate.evidenceCount,
    };
  });
}

function buildRepairRerouteChangeImpactItems(
  previousCandidates: RepairRerouteCandidate[],
  currentCandidates: RepairRerouteCandidate[],
): ChangeImpactItem[] {
  const previousById = new Map(
    previousCandidates.map((candidate) => [repairRerouteCandidateKey(candidate), candidate]),
  );
  return currentCandidates.slice(0, 8).map((candidate) => {
    const key = repairRerouteCandidateKey(candidate);
    const previous = previousById.get(key);
    const changed =
      !previous ||
      previous.evidenceCount !== candidate.evidenceCount ||
      previous.consecutiveWrongAttempts !== candidate.consecutiveWrongAttempts ||
      previous.action !== candidate.action ||
      previous.evidenceSource !== candidate.evidenceSource;
    const changeType: ChangeImpactType = !previous ? 'added' : changed ? 'updated' : 'unchanged_risk';

    return {
      id: `reroute:${key}`,
      kind: 'reroute',
      changeType,
      severity: 'watch',
      title: `Reroute candidate: ${candidate.targetId}`,
      whatChanged: previous
        ? `Evidence ${previous.evidenceCount} -> ${candidate.evidenceCount}; consecutive wrong ${previous.consecutiveWrongAttempts} -> ${candidate.consecutiveWrongAttempts}; action ${previous.action} -> ${candidate.action}.`
        : `New reroute candidate from ${candidate.evidenceCount} ${candidate.evidenceSource} repair evidence signals.`,
      why: candidate.reason,
      impact:
        candidate.evidenceSource === 'synthetic'
          ? 'Use this to monitor the simulated stuck-repair pattern; do not change student routing until live evidence confirms it.'
          : 'Review this learner path and consider prerequisite micro-diagnostic, lower difficulty, remediation, or teacher review.',
      evidenceCount: candidate.evidenceCount,
    };
  });
}

function buildContentChangeImpactItems(contentUnits: BetaContentUnit[]): ChangeImpactItem[] {
  return contentUnits
    .filter((unit) => !(unit.conceptIds?.length || unit.skillIds?.length))
    .slice(0, 6)
    .map((unit) => ({
      id: `content:${unit.id}`,
      kind: 'content',
      changeType: 'unchanged_risk',
      severity: 'watch',
      title: unit.title,
      whatChanged: `Content unit has ${Number(unit.questionCount || 0)} questions but no conceptIds/skillIds.`,
      why: 'Adaptive paths, diagnostic placement, and error analytics need graph targets for this unit.',
      impact: 'Map this unit to concepts/skills before trusting personalized recommendations from it.',
      evidenceCount: Number(unit.questionCount || 0),
    }));
}

function graphCandidateSeverity(candidate: GraphAdjustmentCandidate): BetaCheckStatus {
  return candidate.kind === 'high_risk' ? 'blocked' : 'watch';
}

function betaStatusImpact(
  status: BetaCheckStatus,
  passImpact: string,
  watchImpact: string,
  blockedImpact: string,
): string {
  if (status === 'blocked') return blockedImpact;
  if (status === 'watch') return watchImpact;
  return passImpact;
}

function isChangeImpactItem(item: ChangeImpactItem | undefined): item is ChangeImpactItem {
  return Boolean(item);
}

function statusRank(status: BetaCheckStatus): number {
  if (status === 'blocked') return 3;
  if (status === 'watch') return 2;
  return 1;
}

function changeTypeRank(changeType: ChangeImpactType): number {
  if (changeType === 'added') return 4;
  if (changeType === 'updated') return 3;
  if (changeType === 'baseline') return 2;
  return 1;
}

function formatNullableDays(value: number | null): string {
  return value === null ? 'not enough evidence' : `${value} days`;
}

function weeklyCohortNextAction(
  cohort: InternalBetaCohort,
  scope: BetaScopeReport | undefined,
  evidencePercent: number,
): string {
  if (cohort.status === 'blocked' || scope?.status === 'blocked')
    return `Clear blockers for ${cohort.title} before adding more learners.`;
  if (cohort.currentLearners < cohort.targetLearners)
    return `Recruit ${cohort.targetLearners - cohort.currentLearners} learner(s) for ${cohort.title}.`;
  if (evidencePercent < 70) return `Collect more diagnostic/practice/review events for ${cohort.title}.`;
  if (scope?.targetCoverage && scope.targetCoverage < 80)
    return `Improve graph coverage for ${cohort.title} before wider rollout.`;
  return `Continue ${cohort.title} and review mastery/retention deltas next week.`;
}

function graphCandidateDecision(candidate: GraphAdjustmentCandidate): WeeklyBetaGraphBacklogItem['decision'] {
  if (candidate.kind === 'high_risk') return 'fix_now';
  if (candidate.evidenceSource === 'synthetic') return 'defer';
  if (candidate.evidenceCount >= 3 || candidate.kind === 'misconception_signal') return 'review';
  return 'defer';
}

function buildWeeklyReviewDecisions(
  report: BetaReadinessReport,
  runPlan: InternalBetaRunPlan,
  changeImpact: ChangeImpactReport | undefined,
  graphBacklog: WeeklyBetaGraphBacklogItem[],
): string[] {
  const decisions: string[] = [];
  if (runPlan.status === 'blocked') {
    decisions.push('Do not expand beta cohorts until blocked run-plan items are fixed.');
  } else if (runPlan.status === 'pass') {
    decisions.push('Internal beta cohorts can continue this week.');
  } else {
    decisions.push('Keep beta cohorts small while watch items gather more evidence.');
  }

  if (report.learningQualityKpis.status !== 'pass') {
    decisions.push('Do not use beta data for hard Knowledge Graph changes until real learning KPIs improve.');
  }
  if (report.recommendationQualityAudit.status === 'blocked') {
    decisions.push(
      'Pause adaptive recommendation assignment for affected learners until recommendation quality issues are fixed.',
    );
  }
  const liveReroutes = report.repairRerouteCandidates.filter(
    (candidate) => candidate.evidenceSource !== 'synthetic',
  ).length;
  const syntheticReroutes = report.repairRerouteCandidates.filter(
    (candidate) => candidate.evidenceSource === 'synthetic',
  ).length;
  if (liveReroutes) {
    decisions.push(
      `${liveReroutes} live stuck-repair reroute candidate(s) need admin/teacher review before more same-level practice.`,
    );
  } else if (syntheticReroutes) {
    decisions.push(
      `${syntheticReroutes} simulated stuck-repair reroute candidate(s) are watch-only until live beta evidence confirms them.`,
    );
  }
  if (changeImpact?.summary.blockers) {
    decisions.push(`${changeImpact.summary.blockers} change-impact blocker(s) must be resolved before rollout.`);
  }
  const fixNow = graphBacklog.filter((item) => item.decision === 'fix_now').length;
  const review = graphBacklog.filter((item) => item.decision === 'review').length;
  if (fixNow) decisions.push(`${fixNow} graph backlog item(s) need immediate metadata/edge fixes.`);
  if (review) decisions.push(`${review} graph backlog item(s) are ready for teacher/content review.`);
  if (!graphBacklog.length)
    decisions.push('No graph changes should be made until live beta evidence creates a backlog item.');

  return uniqueStrings(decisions);
}

function maxStatus(left: BetaCheckStatus, right: BetaCheckStatus): BetaCheckStatus {
  return statusRank(left) >= statusRank(right) ? left : right;
}

function auditScopeDiagnostic(
  scope: BetaScopeConfig,
  contentUnits: BetaContentUnit[],
  telemetryEvents: BetaTelemetryEvent[],
  targetCoverage: number,
): BetaCheckStatus {
  const scopeEvents = telemetryEvents.filter((event) => {
    if (!isDiagnosticEvent(event)) return false;
    return event.programId === scope.programId || normalizeText(event.message || '').includes(scope.programId);
  });
  if (scopeEvents.length > 0) return 'pass';
  if (contentUnits.length >= scope.minContentUnits && targetCoverage >= 35) return 'watch';
  return 'blocked';
}

function calculateScopeTargetCoverage(
  graph: KnowledgeGraph,
  contentUnits: BetaContentUnit[],
  scope: BetaScopeConfig,
): number {
  const targets = scopeTargetIds(graph, scope);
  if (!targets.length) return 0;
  const contentTargets = new Set(
    contentUnits.flatMap((unit) => [...(unit.conceptIds || []), ...(unit.skillIds || [])]),
  );
  const covered = targets.filter((id) => contentTargets.has(id)).length;
  return Math.round((covered / targets.length) * 100);
}

function scopeTargetIds(graph: KnowledgeGraph, scope: BetaScopeConfig): string[] {
  const scopedObjectives = (scope.targetObjectiveIds || [])
    .map((objectiveId) => graph.objectives.find((objective) => objective.id === objectiveId))
    .filter(Boolean);

  if (scopedObjectives.length) {
    return uniqueStrings(
      scopedObjectives.flatMap((objective) => [...(objective?.conceptIds || []), ...(objective?.skillIds || [])]),
    );
  }

  return programTargetIds(graph, scope.programId);
}

function programTargetIds(graph: KnowledgeGraph, programId: string): string[] {
  const map = resolveProgramMap(graph, programId);
  return uniqueStrings([...(map?.conceptIds || []), ...(map?.skillIds || [])]);
}

function resolveProgramMap(graph: KnowledgeGraph, programId: string): ProgramMap | undefined {
  return graph.programMaps.find((programMap) => programMap.programId === programId);
}

function matchesScopeContent(unit: BetaContentUnit, scope: BetaScopeConfig): boolean {
  if (unit.programId !== scope.programId) return false;
  if (!scope.requiredTags?.length) return true;
  const tags = new Set((unit.tags || []).map(normalizeText));
  const title = normalizeText(unit.title);
  return scope.requiredTags.some((tag) => tags.has(tag) || title.includes(tag));
}

function hasGraphNode(graph: KnowledgeGraph, id: string): boolean {
  return (
    graph.concepts.some((concept) => concept.id === id) ||
    graph.skills.some((skill) => skill.id === id) ||
    graph.objectives.some((objective) => objective.id === id) ||
    graph.misconceptions.some((misconception) => misconception.id === id)
  );
}

function masteryToAdjustmentCandidate(
  row: MasteryEstimate,
  programId: string,
  evidenceSource: BetaEvidenceSource,
): GraphAdjustmentCandidate {
  return {
    id: row.id,
    kind: 'weak_mastery',
    programId,
    evidenceCount: row.attempts,
    score: row.score,
    evidenceSource,
    autoApply: false,
    reason: `${row.id} is still in repair after ${row.attempts} attempts; inspect prerequisite/remediation edges.`,
  };
}

function buildMisconceptionSignalCandidates(
  graph: KnowledgeGraph,
  learners: BetaLearner[],
): GraphAdjustmentCandidate[] {
  const byMisconception = new Map<
    string,
    {
      count: number;
      programIds: Map<string, number>;
      conceptIds: Set<string>;
      skillIds: Set<string>;
      evidenceSources: Set<BetaEvidenceSource>;
    }
  >();

  learners.forEach((learner) => {
    learner.state?.attempts.forEach((attempt) => {
      const misconceptionIds = uniqueStrings(attempt.misconceptionIds || []);
      if (!misconceptionIds.length) return;
      const programId = attempt.programId || learner.targetProgramIds[0] || attempt.domainId;
      misconceptionIds.forEach((misconceptionId) => {
        const entry = byMisconception.get(misconceptionId) || {
          count: 0,
          programIds: new Map<string, number>(),
          conceptIds: new Set<string>(),
          skillIds: new Set<string>(),
          evidenceSources: new Set<BetaEvidenceSource>(),
        };
        entry.count += 1;
        entry.programIds.set(programId, (entry.programIds.get(programId) || 0) + 1);
        entry.evidenceSources.add(learnerEvidenceSource(learner));
        attempt.conceptIds.forEach((conceptId) => entry.conceptIds.add(conceptId));
        attempt.skillIds.forEach((skillId) => entry.skillIds.add(skillId));
        byMisconception.set(misconceptionId, entry);
      });
    });
  });

  return [...byMisconception.entries()]
    .filter(([, entry]) => entry.count >= 2)
    .map(([misconceptionId, entry]) => misconceptionToAdjustmentCandidate(graph, misconceptionId, entry))
    .sort((a, b) => b.evidenceCount - a.evidenceCount || a.id.localeCompare(b.id))
    .slice(0, 8);
}

function misconceptionToAdjustmentCandidate(
  graph: KnowledgeGraph,
  misconceptionId: string,
  entry: {
    count: number;
    programIds: Map<string, number>;
    conceptIds: Set<string>;
    skillIds: Set<string>;
    evidenceSources: Set<BetaEvidenceSource>;
  },
): GraphAdjustmentCandidate {
  const programId = [...entry.programIds.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  const misconception = graph.misconceptions.find((item) => item.id === misconceptionId);
  const remediationEdges = graph.edges.filter((edge) => edge.from === misconceptionId && edge.type === 'remediates');
  const relatedTargets = uniqueStrings([...entry.conceptIds, ...entry.skillIds]).slice(0, 4);
  const score = Math.min(100, entry.count * 10 + remediationEdges.length * 5);
  const evidenceSource = mergeEvidenceSources([...entry.evidenceSources]);

  return {
    id: misconceptionId,
    kind: 'misconception_signal',
    programId,
    evidenceCount: entry.count,
    score,
    evidenceSource,
    autoApply: false,
    reason: !misconception
      ? `${formatEvidenceSource(evidenceSource)} attempts repeatedly reference ${misconceptionId}, but Knowledge Graph has no misconception node.`
      : remediationEdges.length === 0
        ? `${misconceptionId} appears in ${entry.count} attempts, but has no remediation edge yet.`
        : `${misconceptionId} appears in ${entry.count} attempts; review remediation edges against ${relatedTargets.join(', ') || 'observed targets'}.`,
  };
}

function learnerEvidenceSource(learner: BetaLearner): BetaEvidenceSource {
  return learner.stateKind === 'synthetic' ? 'synthetic' : 'live';
}

function mergeEvidenceSources(sources: BetaEvidenceSource[]): BetaEvidenceSource {
  const unique = uniqueStrings(sources);
  if (unique.includes('mixed') || (unique.includes('live') && unique.includes('synthetic'))) return 'mixed';
  if (unique.includes('live')) return 'live';
  return 'synthetic';
}

function sourceRank(source: BetaEvidenceSource): number {
  if (source === 'live') return 3;
  if (source === 'mixed') return 2;
  return 1;
}

function formatEvidenceSource(source: BetaEvidenceSource): string {
  if (source === 'live') return 'Live';
  if (source === 'mixed') return 'Mixed live/synthetic';
  return 'Synthetic';
}

function attemptsForMasteryTarget(attempts: AttemptRecord[], row: MasteryEstimate): AttemptRecord[] {
  return attempts.filter((attempt) => {
    if (row.scope === 'concept') return attempt.conceptIds.includes(row.id);
    if (row.scope === 'skill') return attempt.skillIds.includes(row.id);
    return attemptTargetKeys(attempt).includes(row.id);
  });
}

function countConsecutiveWrongAttempts(attempts: AttemptRecord[]): number {
  let count = 0;
  [...attempts]
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
    .some((attempt) => {
      if (attempt.correct) return true;
      count += 1;
      return false;
    });
  return count;
}

function selectRerouteAction(input: {
  suspectedPrerequisiteIds: string[];
  misconceptionIds: string[];
  consecutiveWrongAttempts: number;
  evidenceCount: number;
  score: number;
}): RepairRerouteCandidate['action'] {
  if (input.suspectedPrerequisiteIds.length) return 'prerequisite_micro_diagnostic';
  if (input.misconceptionIds.length) return 'remediation_lesson';
  if (input.consecutiveWrongAttempts >= 3 || input.score < 55) return 'lower_difficulty_practice';
  if (input.evidenceCount >= 8) return 'teacher_review';
  return 'lower_difficulty_practice';
}

function rerouteReason(
  row: MasteryEstimate,
  action: RepairRerouteCandidate['action'],
  suspectedPrerequisiteIds: string[],
  misconceptionIds: string[],
  consecutiveWrongAttempts: number,
): string {
  const prefix = `${row.id} is still in repair after ${row.attempts} evidence signals`;
  if (suspectedPrerequisiteIds.length) {
    return `${prefix}; reroute to prerequisite micro-diagnostic for ${suspectedPrerequisiteIds.join(', ')}.`;
  }
  if (misconceptionIds.length) {
    return `${prefix}; assign remediation lesson for ${misconceptionIds.join(', ')} before more same-level practice.`;
  }
  if (consecutiveWrongAttempts >= 3) {
    return `${prefix}; ${consecutiveWrongAttempts} recent wrong attempts suggest lower-difficulty practice.`;
  }
  if (action === 'teacher_review') {
    return `${prefix}; persistent repair state should be reviewed by teacher/admin before more repetition.`;
  }
  return `${prefix}; reroute to lower-difficulty practice to avoid repeating the same repair loop.`;
}

function repairRerouteCandidateKey(candidate: RepairRerouteCandidate): string {
  return `${candidate.learnerId}:${candidate.scope}:${candidate.targetId}`;
}

function convertTelemetryEvent(event: BetaTelemetryEvent): LearningEventRecord {
  const occurredAt = event.occurredAt || new Date().toISOString();
  return buildLearningEvent(
    normalizeTelemetryType(event),
    {
      message: event.message || '',
      programId: event.programId || '',
      ...(event.payload || {}),
    },
    {
      id: event.id,
      learnerId: event.learnerId || '',
      entityType: 'portal_telemetry',
      entityId: event.programId || event.id,
      occurredAt,
      source: event.source || 'miuprep_portal',
    },
  );
}

function normalizeTelemetryType(event: BetaTelemetryEvent): string {
  const text = normalizeText(`${event.type || ''} ${event.message || ''}`);
  if (text.includes('diagnostic')) return 'diagnostic_attempt';
  if (text.includes('review') || text.includes('on tap')) return 'review_attempt';
  if (text.includes('practice') || text.includes('luyen tap') || text.includes('giai dung')) return 'practice_attempt';
  if (text.includes('writing') || text.includes('speaking') || text.includes('feedback')) return 'feedback_only';
  return event.type || 'learning_update';
}

function isDiagnosticEvent(event: BetaTelemetryEvent): boolean {
  return normalizeTelemetryType(event) === 'diagnostic_attempt';
}

function isLearningEvidenceEvent(event: BetaTelemetryEvent): boolean {
  const text = normalizeText(`${event.type || ''} ${event.message || ''}`);
  return (
    text.includes('diagnostic') ||
    text.includes('practice') ||
    text.includes('luyen tap') ||
    text.includes('review') ||
    text.includes('on tap') ||
    text.includes('giai dung') ||
    text.includes('writing') ||
    text.includes('speaking') ||
    text.includes('hoc sinh')
  );
}

function isSeedTelemetryEvent(event: BetaTelemetryEvent): boolean {
  const text = normalizeText(`${event.source || ''} ${event.type || ''} ${event.message || ''}`);
  return text.includes('seed') || text.includes('synthetic') || text.includes('demo') || text.includes('mock');
}

function normalizeStatus(status?: string): string {
  return normalizeText(status || 'active');
}

function scopeDetail(scope?: BetaScopeReport): string {
  if (!scope) return 'Scope was not generated.';
  if (scope.blockers.length) return scope.blockers.join(' ');
  if (scope.nextActions.length) return scope.nextActions.join(' ');
  return `${scope.contentUnits} units, ${scope.questionCount} questions, ${scope.learners} beta learners.`;
}

function shareAttemptTarget(left: AttemptRecord, right: AttemptRecord): boolean {
  const leftTargets = new Set(attemptTargetKeys(left));
  return attemptTargetKeys(right).some((target) => leftTargets.has(target));
}

function attemptTargetKeys(attempt: AttemptRecord): string[] {
  return uniqueStrings([
    ...(attempt.conceptIds || []),
    ...(attempt.skillIds || []),
    ...(attempt.misconceptionIds || []),
    attempt.itemId,
  ]);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso || '');
  const to = Date.parse(toIso || '');
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.floor((to - from) / 86_400_000);
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function normalizeText(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}
