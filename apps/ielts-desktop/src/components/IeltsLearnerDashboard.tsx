import { useMemo } from 'react';
import { isCorrectAnswer } from '@miuprep/core';
import type { ExamAttempt } from '@miuprep/db';
import type { IeltsTest } from '@miuprep/content';
import { toQuestionItemFromEnglishExam } from '@miuprep/content';
import { createSeedKnowledgeGraph, type KnowledgeGraph } from '@miuprep/knowledge';
import {
  buildLearningPath,
  computeMastery,
  emptyStudentModel,
  recordLearningItemAttempt,
  recommendNextAction,
  type ErrorCategory,
  type LearningPathEdge,
  type LearningPathNode,
  type LearningPathResult,
  type MasteryEstimate,
  type Recommendation,
  type StudentModel,
} from '@miuprep/learning';

type EnglishTrack = 'ielts' | 'cpe' | 'cae';

interface IeltsLearnerDashboardProps {
  attempts: ExamAttempt[];
  availableTests: IeltsTest[];
  userId: string;
  activeTrack: EnglishTrack;
  onOpenAdaptivePractice: () => void;
}

interface LearnerDashboardModel {
  state: StudentModel;
  mastery: MasteryEstimate[];
  recommendation: Recommendation;
  learningPath: LearningPathResult;
  submittedAttemptCount: number;
  trackedQuestionCount: number;
  feedbackOnlyQuestionCount: number;
  accuracy: number;
  correctCount: number;
}

const ENGLISH_DOMAIN_ID = 'english_core';

export default function IeltsLearnerDashboard({
  attempts,
  availableTests,
  userId,
  activeTrack,
  onOpenAdaptivePractice,
}: IeltsLearnerDashboardProps) {
  const model = useMemo(
    () => buildLearnerDashboardModel(userId || 'anonymous_learner', attempts, availableTests, activeTrack),
    [activeTrack, attempts, availableTests, userId],
  );
  const graph = useMemo(() => createSeedKnowledgeGraph(), []);
  const nextStep = model.learningPath.nextStep;
  const weakestRows = model.mastery.filter((row) => row.domainId === ENGLISH_DOMAIN_ID).slice(0, 6);
  const hasEvidence = model.trackedQuestionCount > 0;

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-5 text-left">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Adaptive Learner
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 bg-blue-50 px-2 py-1 rounded">
              {activeTrack.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 m-0 mt-3">Learner dashboard theo Knowledge Graph</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Mastery duoc tinh tu bai lam da nop, bo qua Writing/Speaking feedback-only de tranh lam sai diem thanh thao.
          </p>
        </div>
        <button
          onClick={onOpenAdaptivePractice}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded shadow-sm transition-colors border-0 cursor-pointer whitespace-nowrap"
        >
          Open adaptive practice
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile label="Mock attempts" value={String(model.submittedAttemptCount)} />
        <MetricTile label="Tracked answers" value={String(model.trackedQuestionCount)} />
        <MetricTile label="Accuracy" value={hasEvidence ? `${Math.round(model.accuracy * 100)}%` : '--'} />
        <MetricTile label="Mastery nodes" value={String(model.mastery.length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-black text-slate-900 m-0">Next action</h3>
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {model.recommendation.reason}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded p-4">
            <p className="text-sm font-black text-slate-900 m-0">{localizeRecommendationTitle(model.recommendation)}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{localizeRecommendationDetail(model.recommendation, graph)}</p>
            {nextStep && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 m-0">Next graph node</p>
                <p className="text-sm font-bold text-slate-800 m-0 mt-1">{nextStep.label}</p>
                <p className="text-xs text-slate-500 m-0 mt-1">
                  {statusLabel(nextStep.status)} · {Math.round(nextStep.masteryScore)}% · {nextStep.attempts} attempts
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-black text-slate-900 m-0">Weakest areas</h3>
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {hasEvidence ? 'live mastery' : 'waiting evidence'}
            </span>
          </div>
          {weakestRows.length ? (
            <div className="flex flex-col gap-3">
              {weakestRows.map((row) => (
                <MasteryRow key={row.key} row={row} label={labelForId(row.id, graph)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded p-4 m-0">
              Chua co du lieu tracked. Hay nop diagnostic/mock test dau tien de tao baseline.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-black text-slate-900 m-0">Learning path</h3>
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {model.learningPath.steps.length} steps
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {model.learningPath.steps.map((step) => (
            <div
              key={`${step.rank}-${step.id}`}
              className={`border rounded p-3 min-h-[118px] ${step.unlocked ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-slate-400">#{step.rank}</span>
                <span className={`text-[10px] font-black uppercase ${step.unlocked ? 'text-emerald-600' : 'text-amber-700'}`}>
                  {step.unlocked ? 'open' : 'locked'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 m-0 mt-2 leading-snug">{step.label}</p>
              <p className="text-[11px] text-slate-500 m-0 mt-2 leading-relaxed">
                {statusLabel(step.status)} · {Math.round(step.masteryScore)}% · {step.attempts} attempts
              </p>
              <p className="text-[11px] text-slate-500 m-0 mt-2 leading-relaxed">{step.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {model.feedbackOnlyQuestionCount > 0 && (
        <p className="text-[11px] text-slate-500 m-0 border-t border-slate-100 pt-3">
          {model.feedbackOnlyQuestionCount} Writing/Speaking items were detected as feedback-only and excluded from mastery scoring.
        </p>
      )}
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 m-0">{label}</p>
      <p className="text-2xl font-black text-slate-900 m-0 mt-1">{value}</p>
    </div>
  );
}

function MasteryRow({ row, label }: { row: MasteryEstimate; label: string }) {
  const width = `${Math.max(4, Math.min(100, Math.round(row.score)))}%`;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate-800 m-0 truncate">{label}</p>
        <p className="text-xs font-black text-slate-700 m-0">{Math.round(row.score)}%</p>
      </div>
      <div className="h-2 bg-slate-100 rounded mt-1 overflow-hidden">
        <div className={`h-full rounded ${row.status === 'repair' ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width }} />
      </div>
      <p className="text-[11px] text-slate-500 m-0 mt-1">
        {statusLabel(row.status)} · {row.correct}/{row.attempts} correct
      </p>
    </div>
  );
}

function buildLearnerDashboardModel(
  userId: string,
  attempts: ExamAttempt[],
  availableTests: IeltsTest[],
  activeTrack: EnglishTrack,
): LearnerDashboardModel {
  const graph = createSeedKnowledgeGraph();
  let state = emptyStudentModel(userId, [activeTrack]);
  let feedbackOnlyQuestionCount = 0;
  let trackedQuestionCount = 0;
  let submittedAttemptCount = 0;
  const testById = new Map(availableTests.map((test) => [test.id, test]));

  for (const attempt of attempts) {
    if (attempt.status !== 'submitted') continue;
    const test = testById.get(attempt.testId);
    if (!test || getExamTrackOfTest(test) !== activeTrack) continue;
    submittedAttemptCount += 1;

    for (const section of test.sections || []) {
      for (const group of section.questionGroups || []) {
        for (const question of group.questions || []) {
          const item = toQuestionItemFromEnglishExam(test, section, group, question);
          if (item.masteryPolicy === 'feedback_only') {
            feedbackOnlyQuestionCount += 1;
            continue;
          }

          const answeredAt = attempt.submittedAt || attempt.updatedAt || attempt.lastSavedAt || new Date().toISOString();
          const answer = stringifyAnswerValue(attempt.answers[question.id]?.rawValue);
          const correct = isCorrectAnswer(answer, question.acceptedAnswers || []);
          const result = recordLearningItemAttempt(state, item, {
            learnerId: userId,
            programId: activeTrack,
            correct,
            mode: 'mock_test',
            answeredAt,
            errorCategories: correct ? ['none'] : inferEnglishErrorCategories(item),
            payload: {
              attemptId: attempt.local_id,
              sourceQuestionId: question.id,
              testId: test.id,
              skill: test.skill,
            },
          });
          state = result.state;
          trackedQuestionCount += 1;
        }
      }
    }
  }

  const mastery = computeMastery(state);
  const recommendation = recommendNextAction(state, { diagnosticMinAttempts: 8 });
  const learningPath = buildLearningPath(mastery, buildEnglishGraphNodes(graph), buildEnglishGraphEdges(graph), {
    domainId: ENGLISH_DOMAIN_ID,
    includeSupportEdges: true,
    maxSteps: 6,
    targetIds: pickPathTargets(graph, activeTrack, recommendation, mastery),
  });
  const correctCount = state.attempts.filter((attempt) => attempt.correct).length;

  return {
    state,
    mastery,
    recommendation,
    learningPath,
    submittedAttemptCount,
    trackedQuestionCount,
    feedbackOnlyQuestionCount,
    accuracy: trackedQuestionCount ? correctCount / trackedQuestionCount : 0,
    correctCount,
  };
}

function buildEnglishGraphNodes(graph: KnowledgeGraph): LearningPathNode[] {
  return [
    ...graph.concepts
      .filter((concept) => concept.domainId === ENGLISH_DOMAIN_ID)
      .map((concept) => ({ id: concept.id, domainId: concept.domainId, scope: 'concept', label: concept.name })),
    ...graph.skills
      .filter((skill) => skill.domainId === ENGLISH_DOMAIN_ID)
      .map((skill) => ({ id: skill.id, domainId: skill.domainId, scope: 'skill', label: skill.name })),
  ];
}

function buildEnglishGraphEdges(graph: KnowledgeGraph): LearningPathEdge[] {
  const graphEdges = graph.edges.map((edge) => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    type: edge.type,
    weight: edge.weight,
  }));
  const conceptToSkillEdges = graph.skills.flatMap((skill) =>
    skill.conceptIds.map((conceptId) => ({
      id: `edge.${conceptId}.${skill.id}`,
      from: conceptId,
      to: skill.id,
      type: 'supports',
      weight: 0.6,
    })),
  );

  return [...graphEdges, ...conceptToSkillEdges];
}

function pickPathTargets(
  graph: KnowledgeGraph,
  activeTrack: EnglishTrack,
  recommendation: Recommendation,
  mastery: MasteryEstimate[],
): string[] {
  const recommendationTargets = [...recommendation.conceptIds, ...recommendation.skillIds];
  if (recommendationTargets.length) return uniqueStrings(recommendationTargets).slice(0, 3);

  const weakTargets = mastery.filter((row) => row.domainId === ENGLISH_DOMAIN_ID).slice(0, 3).map((row) => row.id);
  if (weakTargets.length) return weakTargets;

  const programMap = graph.programMaps.find((map) => map.programId === activeTrack) || graph.programMaps.find((map) => map.programId === 'ielts');
  const objectiveTargets = (programMap?.entryObjectiveIds || programMap?.objectiveIds || [])
    .flatMap((objectiveId) => {
      const objective = graph.objectives.find((item) => item.id === objectiveId);
      return objective ? [...objective.conceptIds, ...objective.skillIds] : [];
    });

  return uniqueStrings(objectiveTargets.length ? objectiveTargets : [...(programMap?.conceptIds || []), ...(programMap?.skillIds || [])]).slice(0, 3);
}

function getExamTrackOfTest(test: IeltsTest): EnglishTrack {
  if (test.exam === 'cpe' || test.exam === 'cae' || test.exam === 'ielts') return test.exam;
  const text = `${test.id} ${test.title}`.toLowerCase();
  if (text.includes('cpe') || text.includes('proficiency')) return 'cpe';
  if (text.includes('cae') || text.includes('advanced')) return 'cae';
  return 'ielts';
}

function stringifyAnswerValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item ?? '')).join(' ');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return '';
  return String(value);
}

function inferEnglishErrorCategories(item: ReturnType<typeof toQuestionItemFromEnglishExam>): ErrorCategory[] {
  const haystack = [...item.conceptIds, ...item.skillIds, item.type, String(item.metadata?.category || '')].join(' ').toLowerCase();
  if (haystack.includes('inference') || haystack.includes('heading')) return ['inference'];
  if (haystack.includes('collocation')) return ['collocation'];
  if (haystack.includes('grammar') || haystack.includes('sentence') || haystack.includes('tense') || haystack.includes('gap')) return ['grammar'];
  if (haystack.includes('vocabulary') || haystack.includes('word')) return ['vocabulary'];
  if (haystack.includes('time')) return ['time_management'];
  return ['strategy'];
}

function labelForId(id: string, graph: KnowledgeGraph): string {
  return (
    graph.concepts.find((item) => item.id === id)?.name ||
    graph.skills.find((item) => item.id === id)?.name ||
    graph.objectives.find((item) => item.id === id)?.name ||
    id
  );
}

function localizeRecommendationTitle(recommendation: Recommendation): string {
  if (recommendation.kind === 'diagnostic') return 'Can chay diagnostic baseline';
  if (recommendation.kind === 'review') return 'Sua diem yeu truoc';
  if (recommendation.kind === 'practice') return 'Luyen them de tang do tin cay';
  return 'Chuyen sang mixed challenge';
}

function localizeRecommendationDetail(recommendation: Recommendation, graph: KnowledgeGraph): string {
  const targets = [...recommendation.conceptIds, ...recommendation.skillIds].map((id) => labelForId(id, graph));
  if (recommendation.kind === 'diagnostic') {
    return 'He thong can them evidence tu diagnostic/mock test truoc khi ca nhan hoa sau hon.';
  }
  if (targets.length) {
    return `${recommendation.detail} Target: ${targets.join(', ')}.`;
  }
  return recommendation.detail;
}

function statusLabel(status: string): string {
  if (status === 'not_started') return 'Not started';
  if (status === 'collect_evidence') return 'Collect evidence';
  if (status === 'repair') return 'Repair';
  if (status === 'building' || status === 'build') return 'Build';
  if (status === 'hard_proof') return 'Hard proof';
  if (status === 'stable') return 'Stable';
  return status;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
