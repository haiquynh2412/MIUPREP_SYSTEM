import type {
  EnglishItemBankPracticeChoiceKey,
  EnglishItemBankPracticeQuestion,
  EnglishItemBankPracticeState,
} from '../lib/englishItemBankPractice';

interface EnglishItemBankPracticePanelProps {
  state: EnglishItemBankPracticeState;
  onAnswer: (choice: EnglishItemBankPracticeChoiceKey) => void;
  onNext: () => void;
  onClose: () => void;
}

export default function EnglishItemBankPracticePanel({
  state,
  onAnswer,
  onNext,
  onClose,
}: EnglishItemBankPracticePanelProps) {
  const question = state.questions[state.currentIndex];
  const progress = `${state.currentIndex + 1}/${state.questions.length}`;
  const sectionTitle = String(question.metadata.sectionTitle || question.metadata.testSkill || 'English practice');
  const testTitle = String(question.metadata.testTitle || state.programId.toUpperCase());

  return (
    <section
      data-testid="english-item-bank-practice-panel"
      className="bg-slate-950/80 border border-sky-500/25 rounded-3xl p-5 sm:p-6 max-w-5xl mx-auto shadow-2xl text-left space-y-5"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-850 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300">
            Scored item-bank practice
          </span>
          <h2 className="text-xl font-black text-slate-100 m-0">{state.programId.toUpperCase()} question bank</h2>
          <p className="text-xs text-slate-500 m-0">
            {state.templateTitle} - question {progress}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Metric label="Score" value={`${state.score}/${state.questions.length}`} />
          <Metric label="Type" value={formatCompact(question.type)} />
          <Metric label="Level" value={formatCompact(question.difficulty)} />
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge>{testTitle}</Badge>
              <Badge>{sectionTitle}</Badge>
              <Badge>{formatCompact(question.cognitiveLevel)}</Badge>
            </div>
            <p className="text-sm sm:text-base text-slate-150 font-extrabold leading-relaxed m-0 whitespace-pre-wrap">
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
                <span className="text-xs font-black uppercase tracking-widest text-sky-300">
                  Source answer review
                </span>
                <span className="text-[10px] font-black text-slate-400">
                  Correct answer: {question.correctAnswer} ({question.correctValue})
                </span>
              </div>
              <p className="text-sm text-slate-300 font-semibold leading-relaxed m-0">
                {question.explanation}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  data-testid="english-item-bank-practice-next"
                  onClick={onNext}
                  className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase tracking-widest border-0 cursor-pointer"
                >
                  {state.currentIndex + 1 < state.questions.length ? 'Next question' : 'Finish session'}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4">
          <InfoBlock title="Catalog guard" lines={[
            `${state.coverage.readyQuestions} ready items`,
            `${state.coverage.blockedQuestions} blocked by guard`,
            `${state.coverage.warningIssues} warnings retained for review`,
          ]} />
          <InfoBlock title="Knowledge tags" lines={[
            `Concepts: ${question.conceptIds.slice(0, 4).join(', ') || 'none'}`,
            `Skills: ${question.skillIds.slice(0, 4).join(', ') || 'none'}`,
          ]} />
          <InfoBlock title="Source" lines={[
            `Item: ${question.id}`,
            `Test: ${String(question.metadata.testId || 'unknown')}`,
          ]} />
        </aside>
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
  question: EnglishItemBankPracticeQuestion;
  choice: EnglishItemBankPracticeQuestion['choices'][number];
  selectedAnswer: EnglishItemBankPracticeChoiceKey | '';
  answered: boolean;
  onAnswer: (choice: EnglishItemBankPracticeChoiceKey) => void;
}) {
  const isSelected = selectedAnswer === choice.key;
  const isCorrect = question.correctAnswer === choice.key;
  let className = 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-sky-500/40';
  if (answered && isCorrect) className = 'bg-sky-950/50 border-sky-500 text-sky-300';
  if (answered && isSelected && !isCorrect) className = 'bg-rose-950/50 border-rose-500 text-rose-300';
  if (answered && !isSelected && !isCorrect) className = 'bg-slate-950/50 border-slate-900 text-slate-600';

  return (
    <button
      type="button"
      data-testid={`english-item-bank-practice-choice-${choice.key}`}
      disabled={answered}
      onClick={() => onAnswer(choice.key)}
      className={`min-h-[104px] rounded-2xl border p-4 text-left transition-all cursor-pointer disabled:cursor-default ${className}`}
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

function Badge({ children }: { children: string }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-1">
      {children}
    </span>
  );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{title}</p>
      <div className="mt-2 space-y-1">
        {lines.map((line) => (
          <p key={line} className="text-[11px] text-slate-300 leading-relaxed m-0 break-words">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function formatCompact(value: string): string {
  return String(value || 'unknown').replace(/_/g, ' ');
}
