import type {
  TemplatePracticeChoiceKey,
  TemplatePracticeQuestion,
  TemplatePracticeState,
} from '../lib/templatePractice';

interface TemplatePracticeSessionPanelProps {
  state: TemplatePracticeState;
  onAnswer: (choice: TemplatePracticeChoiceKey) => void;
  onNext: () => void;
  onClose: () => void;
}

export default function TemplatePracticeSessionPanel({
  state,
  onAnswer,
  onNext,
  onClose,
}: TemplatePracticeSessionPanelProps) {
  const question = state.questions[state.currentIndex];
  const progress = `${state.currentIndex + 1}/${state.questions.length}`;

  return (
    <section
      data-testid="template-practice-panel"
      className="bg-slate-950/80 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 max-w-5xl mx-auto shadow-2xl text-left space-y-5"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-850 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
            Scored template practice
          </span>
          <h2 className="text-xl font-black text-slate-100 m-0">{state.templateTitle}</h2>
          <p className="text-xs text-slate-500 m-0">
            {state.domainId === 'english_core' ? 'English Core' : 'Mathematics'} • {state.programId} • question {progress}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Metric label="Score" value={`${state.score}/${state.questions.length}`} />
          <Metric label="Stage" value={question.stageTitle} />
          <Metric label="Level" value={question.difficulty} />
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
            Choose the strongest next move
          </span>
          <p className="text-sm sm:text-base text-slate-150 font-extrabold leading-relaxed m-0">
            {question.prompt}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.choices.map((choice) => (
            <ChoiceButton
              key={choice.key}
              question={question}
              choice={choice}
              selectedAnswer={state.selectedAnswer}
              answered={state.answered}
              onAnswer={onAnswer}
            />
          ))}
        </div>

        {state.answered && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
                Expected move
              </span>
              <span className="text-[10px] font-black text-slate-400">
                Correct answer: {question.correctAnswer}
              </span>
            </div>
            <p className="text-sm text-slate-300 font-semibold leading-relaxed m-0">
              {question.expectedMove}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                data-testid="template-practice-next"
                onClick={onNext}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-widest border-0 cursor-pointer"
              >
                {state.currentIndex + 1 < state.questions.length ? 'Next question' : 'Finish session'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ChoiceButton({
  question,
  choice,
  selectedAnswer,
  answered,
  onAnswer,
}: {
  question: TemplatePracticeQuestion;
  choice: TemplatePracticeQuestion['choices'][number];
  selectedAnswer: TemplatePracticeChoiceKey | '';
  answered: boolean;
  onAnswer: (choice: TemplatePracticeChoiceKey) => void;
}) {
  const isSelected = selectedAnswer === choice.key;
  const isCorrect = question.correctAnswer === choice.key;
  let className = 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-emerald-500/40';
  if (answered && isCorrect) className = 'bg-emerald-950/50 border-emerald-500 text-emerald-300';
  if (answered && isSelected && !isCorrect) className = 'bg-rose-950/50 border-rose-500 text-rose-300';
  if (answered && !isSelected && !isCorrect) className = 'bg-slate-950/50 border-slate-900 text-slate-600';

  return (
    <button
      type="button"
      data-testid={`template-practice-choice-${choice.key}`}
      disabled={answered}
      onClick={() => onAnswer(choice.key)}
      className={`min-h-[96px] rounded-2xl border p-4 text-left transition-all cursor-pointer disabled:cursor-default ${className}`}
    >
      <span className="flex items-start gap-3">
        <span className="w-7 h-7 shrink-0 rounded-lg bg-slate-950 border border-slate-800 text-xs font-black flex items-center justify-center">
          {choice.key}
        </span>
        <span className="text-xs sm:text-sm font-bold leading-relaxed">{choice.text}</span>
      </span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[96px] rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
      <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <span className="block text-xs font-black text-slate-200 truncate">{value}</span>
    </div>
  );
}
