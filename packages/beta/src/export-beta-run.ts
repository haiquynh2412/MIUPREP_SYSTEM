import type { EnglishExamTest, MiuMathQuestion, QuestionItem } from '@miuprep/content';
import { createSeedKnowledgeGraph } from '@miuprep/knowledge';
import { emptyStudentModel, recordAttempt } from '@miuprep/learning';
import {
  buildBetaReadinessReport,
  buildChangeImpactReport,
  buildInternalBetaRunPlan,
  buildWeeklyBetaCohortReview,
  type BetaContentUnit,
  type BetaLearner,
  type BetaReadinessReport,
  type BetaTelemetryEvent,
  type ChangeImpactReport,
  type InternalBetaRunPlan,
  type WeeklyBetaCohortReview,
} from './index';

declare function require(name: string): any;
declare const __dirname: string;
declare const process: { argv: string[]; cwd(): string };

const fs = require('node:fs');
const path = require('node:path');
const contentRuntime = require(path.resolve(__dirname, '..', '..', 'content', 'dist', 'index.js')) as {
  buildEnglishLearningCatalog: typeof import('@miuprep/content').buildEnglishLearningCatalog;
  toQuestionItemsFromMiuMath: typeof import('@miuprep/content').toQuestionItemsFromMiuMath;
  [key: string]: unknown;
};

interface BetaRunExport {
  generatedAt: string;
  sourceSummary: {
    mathUnits: number;
    mathQuestions: number;
    miumathSourcePath: string;
    englishTests: number;
    englishLearningReadyQuestions: number;
    learners: number;
    telemetryEvents: number;
  };
  report: BetaReadinessReport;
  runPlan: InternalBetaRunPlan;
  changeImpact: ChangeImpactReport;
  weeklyReview: WeeklyBetaCohortReview;
}

const generatedAt = new Date().toISOString();
const outputDir = getArgValue('--outDir') || path.resolve(process.cwd(), '..', '..', 'reports', 'beta');
const jsonPath = path.join(outputDir, 'internal-beta-run.json');
const markdownPath = path.join(outputDir, 'internal-beta-run.md');
const weeklyReviewPath = path.join(outputDir, 'internal-beta-weekly-review.md');
const previousReport = readPreviousBetaReadinessReport(jsonPath);
const graph = createSeedKnowledgeGraph();
const englishTests = listEnglishExamTests();
const englishCatalog = contentRuntime.buildEnglishLearningCatalog(englishTests, { programIds: ['ielts'] });
const miumathSourcePath = getMiuMathQuestionsPath();
const mathUnits = buildMath9ContentUnits(miumathSourcePath);
const contentUnits = [...mathUnits, ...buildIeltsReadingListeningUnits(englishCatalog.items)];
const learners = buildSeedBetaLearners();
const telemetryEvents = buildSeedTelemetryEvents(generatedAt);
const report = buildBetaReadinessReport({
  graph,
  contentUnits,
  learners,
  telemetryEvents,
  generatedAt,
});
const runPlan = buildInternalBetaRunPlan(report, {
  targetLearnersPerScope: 1,
  minimumLearningEventsPerLearner: 10,
});
const changeImpact = buildChangeImpactReport({
  current: report,
  previous: previousReport,
  contentUnits,
  generatedAt,
  sourceLabel: 'internal_beta_run_export',
});
const weeklyReview = buildWeeklyBetaCohortReview({
  report,
  runPlan,
  changeImpact,
  generatedAt,
});
const betaExport: BetaRunExport = {
  generatedAt,
  sourceSummary: {
    mathUnits: mathUnits.length,
    mathQuestions: mathUnits.reduce((sum, unit) => sum + Number(unit.questionCount || 0), 0),
    miumathSourcePath,
    englishTests: englishTests.length,
    englishLearningReadyQuestions: englishCatalog.coverage.readyQuestions,
    learners: learners.length,
    telemetryEvents: telemetryEvents.length,
  },
  report,
  runPlan,
  changeImpact,
  weeklyReview,
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(betaExport, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(betaExport));
fs.writeFileSync(weeklyReviewPath, renderWeeklyReviewMarkdown(betaExport.weeklyReview));

console.log(`Beta run export written to ${jsonPath}`);
console.log(`Beta run summary written to ${markdownPath}`);
console.log(`Beta weekly review written to ${weeklyReviewPath}`);
console.log(
  `Status: ${runPlan.status}; scopes: ${report.scopes.map((scope) => `${scope.scopeId}=${scope.status}`).join(', ')}`,
);

function listEnglishExamTests(): EnglishExamTest[] {
  return (Object.values(contentRuntime) as unknown[]).filter(isEnglishExamTest);
}

function isEnglishExamTest(value: unknown): value is EnglishExamTest {
  const candidate = value as Partial<EnglishExamTest> | null;
  return Boolean(
    candidate &&
    typeof candidate === 'object' &&
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.skill === 'string' &&
    Array.isArray(candidate.sections),
  );
}

function buildIeltsReadingListeningUnits(items: QuestionItem[]): BetaContentUnit[] {
  const groups = new Map<string, QuestionItem[]>();
  items
    .filter((item) => item.programIds.includes('ielts'))
    .filter((item) => item.tags.some((tag) => ['reading', 'listening'].includes(String(tag).toLowerCase())))
    .filter((item) => item.masteryPolicy !== 'feedback_only')
    .forEach((item) => {
      const testId = String(item.metadata?.testId || item.id);
      const skill = String(
        item.metadata?.testSkill ||
          item.tags.find((tag) => ['reading', 'listening'].includes(String(tag).toLowerCase())) ||
          'mock',
      );
      const key = `${testId}:${skill}`;
      groups.set(key, [...(groups.get(key) || []), item]);
    });

  return [...groups.values()].map((group) => {
    const first = group[0]!;
    const skill = String(first.metadata?.testSkill || 'mock').toLowerCase();
    const testId = String(first.metadata?.testId || first.id);
    return {
      id: `ielts-${testId}-${skill}`,
      title: String(first.metadata?.testTitle || testId),
      programId: 'ielts',
      status: 'Active',
      questionCount: group.length,
      conceptIds: uniqueStrings(group.flatMap((item) => item.conceptIds)).slice(0, 12),
      skillIds: uniqueStrings(group.flatMap((item) => item.skillIds)).slice(0, 12),
      tags: uniqueStrings(['ielts', skill, ...group.flatMap((item) => item.tags)]).slice(0, 12),
    };
  });
}

function getMiuMathQuestionsPath(): string {
  const provided = getArgValue('--miumathQuestionsPath');
  return (
    provided || path.resolve(__dirname, '..', '..', '..', 'apps', 'miumath-app', 'public', 'data', 'questions_db.json')
  );
}

function buildMath9ContentUnits(questionsPath: string): BetaContentUnit[] {
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8')) as MiuMathQuestion[];
  const items = contentRuntime.toQuestionItemsFromMiuMath(questions);
  const groups = new Map<string, QuestionItem[]>();

  items.forEach((item) => {
    const category = String(item.metadata?.category || 'unknown');
    const subCategory = String(item.metadata?.subCategory || 'unknown');
    const key = `${category}:${subCategory}`;
    groups.set(key, [...(groups.get(key) || []), item]);
  });

  return [...groups.values()]
    .map((group) => {
      const first = group[0]!;
      const category = String(first.metadata?.category || 'unknown');
      const subCategory = String(first.metadata?.subCategory || 'unknown');
      const categoryVn = String(first.metadata?.categoryVn || category);
      const subCategoryVn = String(first.metadata?.subCategoryVn || subCategory);
      return {
        id: `miumath-${category}-${subCategory}`,
        title: `${categoryVn}: ${subCategoryVn}`,
        programId: 'vn_math_6_9',
        status: 'Active',
        questionCount: group.length,
        conceptIds: uniqueStrings(group.flatMap((item) => item.conceptIds)).slice(0, 12),
        skillIds: uniqueStrings(group.flatMap((item) => item.skillIds)).slice(0, 12),
        tags: uniqueStrings(['math', 'grade9', category, subCategory, ...group.flatMap((item) => item.tags)]).slice(
          0,
          12,
        ),
      };
    })
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function buildSeedBetaLearners(): BetaLearner[] {
  let mathState = emptyStudentModel('beta-math-learner-1', ['vn_math_6_9']);
  for (let index = 0; index < 8; index += 1) {
    mathState = recordAttempt(mathState, {
      itemId: `beta-math-attempt-${index}`,
      domainId: 'mathematics',
      programId: 'vn_math_6_9',
      conceptIds: ['math.quadratic_equation'],
      skillIds: ['math.solve_quadratic_by_factor'],
      correct: index >= 3,
      difficulty: index > 5 ? 'hard' : 'medium',
      mode: index === 0 ? 'diagnostic' : 'practice',
      errorCategories: index < 3 ? ['algebra_transform'] : ['none'],
      answeredAt: `2026-06-03T08:0${index}:00.000Z`,
    }).state;
  }

  let ieltsState = emptyStudentModel('beta-ielts-learner-1', ['ielts']);
  for (let index = 0; index < 6; index += 1) {
    ieltsState = recordAttempt(ieltsState, {
      itemId: `beta-ielts-reading-${index}`,
      domainId: 'english_core',
      programId: 'ielts',
      conceptIds: ['eng.reading_inference'],
      skillIds: ['eng.infer_implicit_meaning'],
      correct: index >= 3,
      mode: index === 0 ? 'diagnostic' : 'practice',
      errorCategories: index < 3 ? ['inference'] : ['none'],
      answeredAt: `2026-06-03T09:0${index}:00.000Z`,
    }).state;
  }

  return [
    {
      id: 'beta-math-learner-1',
      username: 'Internal Math Beta Learner',
      targetProgramIds: ['vn_math_6_9'],
      state: mathState,
      stateKind: 'synthetic',
    },
    {
      id: 'beta-ielts-learner-1',
      username: 'Internal IELTS Beta Learner',
      targetProgramIds: ['ielts'],
      state: ieltsState,
      stateKind: 'synthetic',
    },
  ];
}

function buildSeedTelemetryEvents(now: string): BetaTelemetryEvent[] {
  return [
    {
      id: 'beta-telemetry-math-diagnostic',
      type: 'diagnostic',
      learnerId: 'beta-math-learner-1',
      programId: 'vn_math_6_9',
      message: 'diagnostic attempt submitted',
      occurredAt: now,
      source: 'beta_export_seed',
    },
    {
      id: 'beta-telemetry-math-practice',
      type: 'practice',
      learnerId: 'beta-math-learner-1',
      programId: 'vn_math_6_9',
      message: 'practice attempt submitted',
      occurredAt: now,
      source: 'beta_export_seed',
    },
    {
      id: 'beta-telemetry-ielts-diagnostic',
      type: 'diagnostic',
      learnerId: 'beta-ielts-learner-1',
      programId: 'ielts',
      message: 'IELTS diagnostic attempt submitted',
      occurredAt: now,
      source: 'beta_export_seed',
    },
    {
      id: 'beta-telemetry-ielts-practice',
      type: 'practice',
      learnerId: 'beta-ielts-learner-1',
      programId: 'ielts',
      message: 'IELTS reading practice attempt submitted',
      occurredAt: now,
      source: 'beta_export_seed',
    },
  ];
}

function renderMarkdown(betaRun: BetaRunExport): string {
  const report = betaRun.report;
  const runPlan = betaRun.runPlan;
  const evidence = report.learningEvents.evidenceBreakdown;
  const learningKpis = report.learningQualityKpis;
  const masteryShadow = report.masteryShadowAudit;
  const empiricalDifficulty = report.empiricalDifficultyAudit;
  return [
    '# MiuPrep Internal Beta Run',
    '',
    `Generated at: ${betaRun.generatedAt}`,
    '',
    'Note: this export is the internal smoke beta package. Seeded learner states prove the pipeline; replace them with live events before approving a wider production beta run.',
    '',
    '## Summary',
    '',
    `- Run status: ${runPlan.status}`,
    `- Ready for internal beta: ${report.readyForInternalBeta ? 'yes' : 'no'}`,
    `- Math content units: ${betaRun.sourceSummary.mathUnits}`,
    `- Math questions: ${betaRun.sourceSummary.mathQuestions}`,
    `- MiuMath source: ${betaRun.sourceSummary.miumathSourcePath}`,
    `- English tests scanned: ${betaRun.sourceSummary.englishTests}`,
    `- English learning-ready questions: ${betaRun.sourceSummary.englishLearningReadyQuestions}`,
    `- Learners: ${betaRun.sourceSummary.learners}`,
    `- Telemetry events: ${betaRun.sourceSummary.telemetryEvents}`,
    `- Live learning telemetry: ${report.learningEvents.realTelemetryEvents}`,
    `- Seeded learning telemetry: ${report.learningEvents.seededTelemetryEvents}`,
    `- Synthetic learner-state events: ${report.learningEvents.syntheticStateLearningEvents}`,
    `- Learning KPI source: ${learningKpis.evidenceSource}`,
    `- Mastery V2 shadow status: ${masteryShadow.status}`,
    `- Empirical difficulty shadow status: ${empiricalDifficulty.status}`,
    `- Repair reroute candidates: ${report.repairRerouteCandidates.length}`,
    '',
    '## Evidence Source',
    '',
    '| Evidence | Count |',
    '| --- | ---: |',
    `| Live telemetry learning events | ${evidence.liveTelemetryEvents} |`,
    `| Seeded telemetry learning events | ${evidence.seededTelemetryEvents} |`,
    `| Live learner-state learning events | ${evidence.liveStateLearningEvents} |`,
    `| Synthetic learner-state learning events | ${evidence.syntheticStateLearningEvents} |`,
    `| Live learners with state | ${evidence.liveLearners} |`,
    `| Synthetic learners with state | ${evidence.syntheticLearners} |`,
    '',
    '| KPI | Value |',
    '| --- | ---: |',
    `| Evidence source | ${learningKpis.evidenceSource} |`,
    `| Real learners | ${learningKpis.realLearners} |`,
    `| Synthetic learners | ${learningKpis.syntheticLearners} |`,
    `| Real attempt samples | ${learningKpis.realAttemptSamples} |`,
    `| Synthetic attempt samples | ${learningKpis.syntheticAttemptSamples} |`,
    `| Real event samples | ${learningKpis.realEventSamples} |`,
    `| Seeded event samples | ${learningKpis.seededEventSamples} |`,
    '',
    '## Mastery V2 Shadow',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Status | ${masteryShadow.status} |`,
    `| Evidence source | ${masteryShadow.evidenceSource} |`,
    `| Learners inspected | ${masteryShadow.learners} |`,
    `| Comparison rows | ${masteryShadow.rows} |`,
    `| Changed status rows | ${masteryShadow.changedStatusRows} |`,
    `| Largest absolute delta | ${masteryShadow.largestAbsoluteDelta} |`,
    `| Protected feedback-only events | ${masteryShadow.protectedFeedbackOnlyEvents} |`,
    `| Student-facing enabled | no |`,
    `| Recommendation policy | ${masteryShadow.learnerReports[0]?.recommendationPolicy || 'v1_only'} |`,
    '',
    `Detail: ${masteryShadow.detail}`,
    '',
    '## Empirical Difficulty / Elo Shadow',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Status | ${empiricalDifficulty.status} |`,
    `| Evidence source | ${empiricalDifficulty.evidenceSource} |`,
    `| Learners inspected | ${empiricalDifficulty.learners} |`,
    `| Item rows | ${empiricalDifficulty.rows} |`,
    `| Calibrated candidates | ${empiricalDifficulty.calibratedCandidates} |`,
    `| Sparse items | ${empiricalDifficulty.sparseItems} |`,
    `| Drift watch items | ${empiricalDifficulty.driftWatchItems} |`,
    `| High-stakes placement enabled | no |`,
    `| Calibration policy | ${empiricalDifficulty.learnerReports[0]?.calibrationPolicy || 'shadow_only_prior_preserved'} |`,
    '',
    `Detail: ${empiricalDifficulty.detail}`,
    '',
    '## What Changed, Why, Impact',
    '',
    `- Change report status: ${betaRun.changeImpact.status}`,
    `- Compared with: ${betaRun.changeImpact.previousGeneratedAt || 'baseline/no previous export'}`,
    `- Items: ${betaRun.changeImpact.summary.totalItems}; changed: ${betaRun.changeImpact.summary.changedItems}; blockers: ${betaRun.changeImpact.summary.blockers}; watches: ${betaRun.changeImpact.summary.watches}; passes: ${betaRun.changeImpact.summary.passes}`,
    '',
    '| Area | Severity | Change | What changed | Why | Impact |',
    '| --- | --- | --- | --- | --- | --- |',
    ...betaRun.changeImpact.items.map(
      (item) =>
        `| ${escapeMarkdownTable(item.title)} | ${item.severity} | ${item.changeType} | ${escapeMarkdownTable(item.whatChanged)} | ${escapeMarkdownTable(item.why)} | ${escapeMarkdownTable(item.impact)} |`,
    ),
    '',
    '## Weekly Cohort Review',
    '',
    `- Week of: ${betaRun.weeklyReview.weekOf}`,
    `- Weekly status: ${betaRun.weeklyReview.status}`,
    `- Cohorts: ${betaRun.weeklyReview.cohortReviews.length}`,
    `- Graph backlog: ${betaRun.weeklyReview.graphBacklog.length}`,
    `- Repair reroutes: ${betaRun.weeklyReview.repairReroutes.length}`,
    '',
    '| Cohort | Status | Learners | Evidence | Readiness | Next action |',
    '| --- | --- | --- | --- | --- | --- |',
    ...betaRun.weeklyReview.cohortReviews.map(
      (item) =>
        `| ${escapeMarkdownTable(item.title)} | ${item.status} | ${escapeMarkdownTable(item.learnerProgress)} | ${escapeMarkdownTable(item.evidenceProgress)} | ${escapeMarkdownTable(item.readiness)} | ${escapeMarkdownTable(item.nextAction)} |`,
    ),
    '',
    '## Phase 10 Checklist',
    '',
    '| Item | Status | Evidence | Detail |',
    '| --- | --- | ---: | --- |',
    ...report.checklist.map(
      (item) => `| ${item.label} | ${item.status} | ${item.evidenceCount} | ${escapeMarkdownTable(item.detail)} |`,
    ),
    '',
    '## Scopes',
    '',
    '| Scope | Status | Units | Questions | Learners | Coverage |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
    ...report.scopes.map(
      (scope) =>
        `| ${scope.title} | ${scope.status} | ${scope.contentUnits} | ${scope.questionCount} | ${scope.learners} | ${scope.targetCoverage}% |`,
    ),
    '',
    '## Repair Reroute Candidates',
    '',
    ...(report.repairRerouteCandidates.length
      ? report.repairRerouteCandidates
          .slice(0, 12)
          .map(
            (candidate) =>
              `- ${candidate.targetId} for ${candidate.learnerId}: ${candidate.action}; source: ${candidate.evidenceSource}; evidence: ${candidate.evidenceCount}; consecutive wrong: ${candidate.consecutiveWrongAttempts}; suspected prerequisites: ${candidate.suspectedPrerequisiteIds.join(', ') || 'none'}; misconceptions: ${candidate.misconceptionIds.join(', ') || 'none'} - ${candidate.reason}`,
          )
      : ['- No stuck repair reroute candidates yet.']),
    '',
    '## Graph Adjustment Backlog',
    '',
    ...(report.graphAdjustmentCandidates.length
      ? report.graphAdjustmentCandidates
          .slice(0, 12)
          .map(
            (candidate) =>
              `- ${candidate.kind}: ${candidate.id} (${candidate.evidenceCount} evidence; source: ${candidate.evidenceSource}; autoApply: no) - ${candidate.reason}`,
          )
      : ['- No graph adjustment candidates yet.']),
    '',
    '## Run Plan',
    '',
    '### Entry Gates',
    ...runPlan.entryGates.map((gate) => `- ${gate}`),
    '',
    '### Exit Gates',
    ...runPlan.exitGates.map((gate) => `- ${gate}`),
    '',
    '### Next Actions',
    ...runPlan.nextActions.map((action) => `- ${action}`),
    '',
  ].join('\n');
}

function renderWeeklyReviewMarkdown(review: WeeklyBetaCohortReview): string {
  return [
    '# MiuPrep Weekly Beta Cohort Review',
    '',
    `Generated at: ${review.generatedAt}`,
    `Week of: ${review.weekOf}`,
    `Status: ${review.status}`,
    '',
    '## Cohorts',
    '',
    '| Cohort | Status | Learners | Evidence | Readiness | Next action |',
    '| --- | --- | --- | --- | --- | --- |',
    ...review.cohortReviews.map(
      (item) =>
        `| ${escapeMarkdownTable(item.title)} | ${item.status} | ${escapeMarkdownTable(item.learnerProgress)} | ${escapeMarkdownTable(item.evidenceProgress)} | ${escapeMarkdownTable(item.readiness)} | ${escapeMarkdownTable(item.nextAction)} |`,
    ),
    '',
    '## Graph Adjustment Backlog',
    '',
    '| Item | Kind | Severity | Evidence | Source | Auto apply | Decision | Reason |',
    '| --- | --- | --- | ---: | --- | --- | --- | --- |',
    ...(review.graphBacklog.length
      ? review.graphBacklog.map(
          (item) =>
            `| ${item.id} | ${item.kind} | ${item.severity} | ${item.evidenceCount} | ${item.evidenceSource} | ${item.autoApply ? 'yes' : 'no'} | ${item.decision} | ${escapeMarkdownTable(item.reason)} |`,
        )
      : ['| None | - | pass | 0 | - | no | defer | No graph evidence yet. |']),
    '',
    '## Repair Reroutes',
    '',
    '| Learner | Target | Action | Evidence | Consecutive wrong | Source | Decision | Reason |',
    '| --- | --- | --- | ---: | ---: | --- | --- | --- |',
    ...(review.repairReroutes.length
      ? review.repairReroutes.map(
          (item) =>
            `| ${item.learnerId} | ${item.targetId} | ${item.action} | ${item.evidenceCount} | ${item.consecutiveWrongAttempts} | ${item.evidenceSource} | ${item.decision} | ${escapeMarkdownTable(item.reason)} |`,
        )
      : ['| None | - | - | 0 | 0 | - | defer | No stuck repair pattern yet. |']),
    '',
    '## Decisions',
    '',
    ...review.decisions.map((decision) => `- ${decision}`),
    '',
    '## Next Actions',
    '',
    ...review.nextActions.map((action) => `- ${action}`),
    '',
  ].join('\n');
}

function getArgValue(name: string): string | undefined {
  const direct = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readPreviousBetaReadinessReport(jsonPath: string): BetaReadinessReport | undefined {
  try {
    if (!fs.existsSync(jsonPath)) return undefined;
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as { report?: BetaReadinessReport };
    return parsed.report?.schemaVersion ? parsed.report : undefined;
  } catch {
    return undefined;
  }
}

function escapeMarkdownTable(value: string): string {
  return String(value || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}
