import { useMemo } from 'react';
import type { LocalUser, SpeakingFeedback, WritingFeedback } from '@miuprep/db';
import { emptyStudentModel } from '@miuprep/learning';
import {
  generateQuestionTutorFeedback,
  generateSpeakingFeedbackPracticePlan,
  generateWritingFeedbackPracticePlan,
  recordQuestionTutorFeedback,
  type AITutorQuestionInput,
  type FeedbackPracticeTask,
  type FeedbackToPracticePlan,
  type ProductiveSkillActionArea,
} from '@miuprep/ai/src/tutor';

interface ErrorQuestion {
  id: string;
  text: string;
  stage: number;
  answer?: string;
  answerExpl?: string;
}

interface AITutorPreviewPanelProps {
  currentUser: LocalUser;
  errorQuestions: ErrorQuestion[];
}

export default function AITutorPreviewPanel({ currentUser, errorQuestions }: AITutorPreviewPanelProps) {
  const productiveTrack = useMemo(() => resolveProductiveTrack(currentUser), [currentUser]);
  const productivePlans = useMemo(
    () => buildProductivePlans(currentUser, productiveTrack),
    [currentUser, productiveTrack],
  );
  const activeQuestion = useMemo(
    () => errorQuestions.filter((item) => item.stage > 0).sort((a, b) => b.stage - a.stage)[0],
    [errorQuestions],
  );

  const snapshot = useMemo(() => {
    if (!activeQuestion) return null;
    const input = buildTutorInput(currentUser, activeQuestion);
    const feedback = generateQuestionTutorFeedback(input);
    const model = emptyStudentModel(currentUser.id || currentUser.username, [input.programId || '']);
    const recorded = recordQuestionTutorFeedback(model, input, feedback);
    return { input, feedback, event: recorded.event };
  }, [activeQuestion, currentUser]);

  if (!activeQuestion || !snapshot) {
    return (
      <div className="max-w-6xl mx-auto space-y-5">
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl text-left">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 px-2 py-1 rounded">
                AI Tutor
              </span>
              <h3 className="text-lg font-black text-slate-100 mt-3 mb-0">No repair target</h3>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                The tutor will activate when the error notebook has a due item.
              </p>
            </div>
          </div>
        </section>
        <ProductiveSkillsPracticePanel plans={productivePlans} />
      </div>
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-6xl mx-auto shadow-xl text-left space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 px-2 py-1 rounded">
              AI Tutor
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              Feedback event ready
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-100 mt-3 mb-0">Wrong-answer repair coach</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl mb-0">
            Uses concept, skill and error taxonomy to explain the current notebook item, then stores the tutor output as
            a feedback learning event.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 min-w-full lg:min-w-[360px]">
          <MetricTile label="Confidence" value={`${Math.round(snapshot.feedback.confidence * 100)}%`} />
          <MetricTile label="Event type" value={String(snapshot.event.type)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black m-0">
                {snapshot.input.programId} / {snapshot.feedback.classifiedErrorCategories.join(', ')}
              </p>
              <h4 className="text-sm font-black text-slate-100 mt-1 mb-0 truncate">{activeQuestion.text}</h4>
            </div>
            <span className="text-[10px] font-mono text-amber-400 shrink-0">STAGE {activeQuestion.stage}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-4 mb-0">{snapshot.feedback.explanation}</p>
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-500">AI confidence</span>
              <span className={snapshot.feedback.confidence >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}>
                {Math.round(snapshot.feedback.confidence * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${Math.max(4, snapshot.feedback.confidence * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 mb-0">{snapshot.feedback.confidenceReasons.join(' / ')}</p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black m-0">Remediation lesson</p>
          <h4 className="text-sm font-black text-slate-100 mt-2 mb-0">
            {snapshot.feedback.remediationLessons[0]?.title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-0">
            {snapshot.feedback.remediationLessons[0]?.objective}
          </p>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500">Estimated time</span>
            <span className="text-cyan-400 font-mono">
              {snapshot.feedback.remediationLessons[0]?.estimatedMinutes || 0} min
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-3">Socratic hints</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {snapshot.feedback.socraticHints.map((hint, index) => (
            <div key={`${index}-${hint}`} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3">
              <span className="text-[10px] text-cyan-400 font-mono font-black">HINT {index + 1}</span>
              <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-0">{hint}</p>
            </div>
          ))}
        </div>
      </div>
      <ProductiveSkillsPracticePanel plans={productivePlans} />
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 m-0">{label}</p>
      <p className="text-lg font-black text-slate-100 m-0 mt-1 font-mono truncate">{value}</p>
    </div>
  );
}

function buildTutorInput(currentUser: LocalUser, question: ErrorQuestion): AITutorQuestionInput {
  const isEnglish =
    question.text.toLowerCase().includes('ielts') || /grammar|sentence|although|english/i.test(question.text);
  const isGeometry = /circle|geometry|triangle|duong tron|tam giac/i.test(normalizeText(question.text));

  if (isEnglish) {
    return {
      learnerId: currentUser.id || currentUser.username,
      itemId: question.id,
      track: 'ielts',
      domainId: 'english_core',
      programId: 'ielts',
      questionText: question.text,
      correctAnswer: question.answer,
      userAnswer: 'last submitted answer',
      workedSolution: question.answerExpl,
      conceptIds: ['eng.grammar_accuracy', 'eng.sentence_structure'],
      skillIds: ['eng.edit_sentence_errors'],
      metadataLabels: {
        'eng.grammar_accuracy': 'Grammar accuracy',
        'eng.sentence_structure': 'Sentence structure',
        'eng.edit_sentence_errors': 'Edit sentence errors',
      },
    };
  }

  if (isGeometry) {
    return {
      learnerId: currentUser.id || currentUser.username,
      itemId: question.id,
      track: 'math',
      domainId: 'mathematics',
      programId: 'vn_math_6_9',
      questionText: question.text,
      correctAnswer: question.answer,
      userAnswer: 'last submitted answer',
      workedSolution: question.answerExpl,
      conceptIds: ['math.plane_geometry'],
      skillIds: ['math.geometry_reasoning'],
      metadataLabels: {
        'math.plane_geometry': 'Plane geometry',
        'math.geometry_reasoning': 'Geometry reasoning',
      },
    };
  }

  return {
    learnerId: currentUser.id || currentUser.username,
    itemId: question.id,
    track: 'math',
    domainId: 'mathematics',
    programId: 'vn_math_6_9',
    questionText: question.text,
    correctAnswer: question.answer,
    userAnswer: 'last submitted answer',
    workedSolution: question.answerExpl,
    conceptIds: ['math.algebraic_expression', 'math.factorization'],
    skillIds: ['math.simplify_expression'],
    metadataLabels: {
      'math.algebraic_expression': 'Algebraic expression',
      'math.factorization': 'Factorization',
      'math.simplify_expression': 'Simplify expression',
    },
  };
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

type ProductiveTrack = 'ielts' | 'cpe' | 'cae';

interface ProductivePlans {
  writing: FeedbackToPracticePlan;
  speaking: FeedbackToPracticePlan;
}

function ProductiveSkillsPracticePanel({ plans }: { plans: ProductivePlans }) {
  return (
    <section className="bg-slate-950/60 border border-emerald-900/40 rounded-2xl p-4 text-left space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 bg-emerald-950/50 border border-emerald-900 px-2 py-1 rounded">
              Feedback-to-practice
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
              {plans.writing.track.toUpperCase()} / Writing + Speaking
            </span>
          </div>
          <h4 className="text-base font-black text-slate-100 mt-3 mb-0">Productive skills repair loop</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl mb-0">
            Rubric feedback now creates focused drills, then sends the learner back to rewrite or rerecord with a
            before-after checklist.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full lg:w-[390px]">
          <MetricTile label="Writing" value={`${plans.writing.tasks.length} tasks`} />
          <MetricTile label="Speaking" value={`${plans.speaking.tasks.length} tasks`} />
          <MetricTile label="Mastery" value="Gated" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PracticePlanCard title="Writing revision loop" plan={plans.writing} />
        <PracticePlanCard title="Speaking rerecord loop" plan={plans.speaking} />
      </div>
    </section>
  );
}

function PracticePlanCard({ title, plan }: { title: string; plan: FeedbackToPracticePlan }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black m-0">{plan.feedbackType}</p>
          <h5 className="text-sm font-black text-slate-100 mt-1 mb-0">{title}</h5>
        </div>
        <span className="shrink-0 text-[10px] font-mono text-emerald-300 bg-emerald-950/50 border border-emerald-900 rounded px-2 py-1">
          {Math.round(plan.confidence * 100)}%
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {plan.tasks.map((task) => (
          <PracticeTaskRow key={task.id} task={task} />
        ))}
      </div>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Loop</p>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-5 gap-2">
          {plan.revisionLoop.steps.map((step, index) => (
            <div
              key={`${plan.id}-${step.label}`}
              className="bg-slate-950/70 border border-slate-850 rounded-xl p-2 min-w-0"
            >
              <span className="text-[9px] text-emerald-300 font-mono font-black">0{index + 1}</span>
              <p className="text-[10px] text-slate-200 font-black mt-1 mb-0">{step.label}</p>
              <p className="text-[10px] text-slate-500 leading-snug mt-1 mb-0">{step.action}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-slate-950/70 border border-amber-900/40 rounded-xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 m-0">Validity gate</p>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1 mb-0">
            Productive skills stay feedback-only until the same rubric, before-after evidence, and teacher or stable
            double-AI validation are present.
          </p>
        </div>
      </div>
    </div>
  );
}

function PracticeTaskRow({ task }: { task: FeedbackPracticeTask }) {
  return (
    <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-3 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black m-0">
            Priority {task.priority} / {areaLabel(task.area)}
          </p>
          <h6 className="text-xs font-black text-slate-100 mt-1 mb-0">{task.title}</h6>
        </div>
        <span className="text-[10px] text-cyan-300 font-mono shrink-0">{task.estimatedMinutes}m</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 mb-0">{task.prompt}</p>
      <ul className="mt-2 space-y-1 pl-4">
        {task.instructions.slice(0, 2).map((instruction) => (
          <li key={instruction} className="text-[10px] text-slate-500 leading-snug">
            {instruction}
          </li>
        ))}
      </ul>
    </div>
  );
}

function resolveProductiveTrack(currentUser: LocalUser): ProductiveTrack {
  const candidates = [currentUser.assignedTrack, ...(currentUser.assignedTracks || [])].filter(Boolean);
  if (candidates.includes('cpe')) return 'cpe';
  if (candidates.includes('cae')) return 'cae';
  return 'ielts';
}

function buildProductivePlans(currentUser: LocalUser, track: ProductiveTrack): ProductivePlans {
  const learnerId = currentUser.id || currentUser.username;
  const now = new Date().toISOString();
  const writing = buildWritingFeedbackPreview(learnerId, track, now);
  const speaking = buildSpeakingFeedbackPreview(learnerId, track, now);
  return {
    writing: generateWritingFeedbackPracticePlan(writing, { track, learnerId, now, maxTasks: 3 }),
    speaking: generateSpeakingFeedbackPracticePlan(speaking, { track, learnerId, now, maxTasks: 3 }),
  };
}

function buildWritingFeedbackPreview(learnerId: string, track: ProductiveTrack, now: string): WritingFeedback {
  const isCambridge = track === 'cpe' || track === 'cae';
  const base = isCambridge
    ? [
        {
          criterionName: 'Content',
          band: track === 'cpe' ? 198 : 186,
          feedbackText: 'Relevant but one point is underdeveloped.',
          nextAction: 'Add a sharper claim and concrete support.',
        },
        {
          criterionName: 'Organisation',
          band: track === 'cpe' ? 192 : 181,
          feedbackText: 'Paragraphs are clear but links are mechanical.',
          nextAction: 'Repair paragraph bridges.',
        },
        {
          criterionName: 'Language (Vocabulary)',
          band: track === 'cpe' ? 200 : 188,
          feedbackText: 'Good range with occasional imprecision.',
          nextAction: 'Swap vague wording for exact collocations.',
        },
        {
          criterionName: 'Language (Grammar)',
          band: track === 'cpe' ? 190 : 179,
          feedbackText: 'Complex sentences sometimes lose control.',
          nextAction: 'Rewrite error-prone sentences with clear clause boundaries.',
        },
        {
          criterionName: 'Register and audience fit',
          band: track === 'cpe' ? 188 : 178,
          feedbackText: 'Tone needs a more consistent reader fit.',
          nextAction: 'Rewrite the opening and closing for the intended audience.',
        },
      ]
    : [
        {
          criterionName: 'Task Response',
          band: 6,
          feedbackText: 'The position is clear but evidence is still general.',
          nextAction: 'Add one concrete example and explain its relevance.',
        },
        {
          criterionName: 'Coherence and Cohesion',
          band: 6.5,
          feedbackText: 'Paragraph order is logical but links are thin.',
          nextAction: 'Repair one topic sentence and one transition.',
        },
        {
          criterionName: 'Lexical Resource',
          band: 7,
          feedbackText: 'Vocabulary range is solid.',
          nextAction: 'Replace repeated general nouns with precise collocations.',
        },
        {
          criterionName: 'Grammatical Range and Accuracy',
          band: 6.5,
          feedbackText: 'Some complex sentences need control.',
          nextAction: 'Rewrite three sentences with clean clause structure.',
        },
      ];

  return {
    attemptId: `${learnerId}-${track}-writing-plan-preview`,
    taskNumber: 2,
    bandOverall: isCambridge ? (track === 'cpe' ? 194 : 183) : 6.5,
    criteria: base,
    corrections: [
      {
        originalText: 'This is a very big problem.',
        correctedText: 'This is a pressing structural problem.',
        reason: 'The corrected phrase is more precise and academic.',
        severity: 'medium',
      },
    ],
    suggestionsForImprovement: ['Move from feedback to a targeted rewrite instead of writing a new essay immediately.'],
    sentenceUpgrades: [
      {
        original: 'People should solve this.',
        upgraded: 'Policy-makers should address this through targeted incentives.',
        explanation: 'More precise subject and action.',
        targetedBand: isCambridge ? 200 : 7,
      },
    ],
    modelUsed: 'miuprep-feedback-plan-preview',
    createdAt: now,
    rubricVersion: isCambridge ? 'v1.2.0-cambridge' : 'v1.2.0-academic',
    descriptorSource: isCambridge ? 'Cambridge English Writing Descriptors' : 'IELTS Writing Band Descriptors',
    confidence: 0.86,
    isMockScoring: true,
  };
}

function buildSpeakingFeedbackPreview(learnerId: string, track: ProductiveTrack, now: string): SpeakingFeedback {
  const isCambridge = track === 'cpe' || track === 'cae';
  const criteria = isCambridge
    ? [
        {
          criterionName: 'Grammatical Resource',
          band: track === 'cpe' ? 190 : 180,
          feedbackText: 'Complex grammar is attempted but not always controlled.',
          nextAction: 'Use two target structures accurately in a fresh answer.',
        },
        {
          criterionName: 'Lexical Resource',
          band: track === 'cpe' ? 196 : 185,
          feedbackText: 'Range is good but topic vocabulary could be sharper.',
          nextAction: 'Upgrade five topic phrases and reuse them naturally.',
        },
        {
          criterionName: 'Discourse Management',
          band: track === 'cpe' ? 193 : 182,
          feedbackText: 'The answer has ideas but needs cleaner signposting.',
          nextAction: 'Answer in three planned chunks.',
        },
        {
          criterionName: 'Pronunciation',
          band: track === 'cpe' ? 191 : 181,
          feedbackText: 'Stress patterns are mostly clear.',
          nextAction: 'Repair stress in high-value topic words.',
        },
        {
          criterionName: 'Interactive Communication',
          band: track === 'cpe' ? 188 : 178,
          feedbackText: 'The turn closes too quickly.',
          nextAction: 'Extend, contrast, and invite continuation.',
        },
      ]
    : [
        {
          criterionName: 'Fluency and Coherence',
          band: 6.5,
          feedbackText: 'Generally clear but pauses break the argument.',
          nextAction: 'Use answer-reason-example chunks.',
        },
        {
          criterionName: 'Lexical Resource',
          band: 6.5,
          feedbackText: 'Vocabulary is adequate but safe.',
          nextAction: 'Upgrade basic phrases into natural topic language.',
        },
        {
          criterionName: 'Grammatical Range and Accuracy',
          band: 6,
          feedbackText: 'Errors appear in longer sentences.',
          nextAction: 'Use two controlled structures accurately.',
        },
        {
          criterionName: 'Pronunciation',
          band: 6.5,
          feedbackText: 'Mostly intelligible with some word stress issues.',
          nextAction: 'Repair word stress before rerecording.',
        },
      ];

  return {
    attemptId: `${learnerId}-${track}-speaking-plan-preview`,
    transcript:
      'I think online learning is useful because it is convenient, but sometimes students need more discipline.',
    bandOverall: isCambridge ? (track === 'cpe' ? 192 : 181) : 6.5,
    criteria,
    pronunciationErrors: [
      { word: 'discipline', suggestion: 'Keep stress on the first syllable and avoid dropping the final consonant.' },
    ],
    fluencyReview: 'The answer is understandable, but the middle idea needs cleaner chunking before the final example.',
    modelUsed: 'miuprep-feedback-plan-preview',
    createdAt: now,
    rubricVersion: isCambridge ? 'v1.2.0-cambridge' : 'v1.2.0-speaking',
    descriptorSource: isCambridge ? 'Cambridge English Speaking Descriptors' : 'IELTS Speaking Band Descriptors',
    confidence: 0.84,
    isMockScoring: true,
  };
}

function areaLabel(area: ProductiveSkillActionArea): string {
  const labels: Record<ProductiveSkillActionArea, string> = {
    task_response: 'Task response',
    coherence: 'Coherence',
    lexical_resource: 'Lexis',
    grammar: 'Grammar',
    register: 'Register',
    fluency: 'Fluency',
    pronunciation: 'Pronunciation',
    lexical_range: 'Lexical range',
    grammar_accuracy: 'Grammar accuracy',
    interaction: 'Interaction',
  };
  return labels[area];
}
