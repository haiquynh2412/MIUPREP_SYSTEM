# SAT Learning App Plan

## Product Direction

Build a free, high-quality SAT learning app for private family use first, with a clean path to public free release later. The product should respect content ownership: original and permissively usable questions can live in the app, while official College Board practice should be tracked as a learning log rather than copied into the database.

## MVP Scope

0. Account access
   - Local MVP accounts for parent/student access.
   - Parent accounts can issue local student accounts and passcodes.
   - Public release must replace this with backend authentication and server-side permissions.

1. Practice bank
   - Store questions with section, domain, skill, difficulty, source, license note, and review status.
   - Show source and review state under every question.
   - Allow users to mark a question as reviewed, needs review, or rejected.

2. Diagnostic pretest
   - 20-question mixed pretest to produce a rough baseline.
   - Select questions by SAT domains rather than taking the first questions in the bank.
   - Show answer review after completion: selected answer, correct answer, explanation, source, and license note.
   - Score estimate is directional only, not an official SAT score.
   - Results generate weak-skill priorities and a roadmap.
   - Offer two in-app modes: Preview (20 questions) and Full Length Simulated (98 questions: 54 Reading/Writing and 44 Math).

3. Personalized roadmap
   - Convert diagnostic and practice attempts into a skill plan.
   - Prioritize low-accuracy skills, mistake notes, and due reviews.
   - Keep official practice as metadata-only logs.

4. Student-selected topic study
   - Let students choose section, domain, skill, difficulty, and source.
   - Show a question-bank map with available topics and counts.
   - Start a focused practice session from the chosen topic.

5. Practice experience
   - Filter by section, domain, difficulty, source, and review status.
   - Answer multiple-choice questions with immediate feedback and explanation.
   - Track correct/wrong attempts, bookmarks, and mistake notes locally.

6. Review system
   - Maintain a review queue from wrong answers and bookmarked questions.
   - Schedule simple spaced review dates locally.
   - Surface weak skills and missed questions.

7. Source governance
   - Keep a source ledger with allowed use notes.
   - Separate official-practice logs from reusable question content.
   - Store OpenSAT/PineSAT as a local snapshot in `data/opensat-pinesat.json`.
   - Support local OpenSAT/PineSAT JSON import with every imported question marked `needs_review`.
   - Keep OpenSAT/PineSAT out of localStorage; load it from local data files and persist only user progress/review overrides.

8. Official practice log
   - Track official Bluebook, Khan Academy, or College Board Question Bank work without copying official question text.
   - Store source, section, skill, reference/id, result, note, and date.

## Product References And What To Learn

- Bluebook: timed test shell, module flow, mark/review behavior, and familiarity with the official exam environment.
- Khan Academy: diagnostic-to-skill-path learning model, short lessons attached to practice, and mastery-style progression.
- DailySAT: daily habit, lightweight streaks, motivational loop, and simple student-friendly practice.
- OpenSAT/PineSAT: open question-bank seed, source labeling, and review-first import workflow.
- SAT Slayer / OnePrep / MyCollegeBook: fast filtering, analytics, Bluebook-like simulators, and teacher/parent dashboard ideas.
- Spaced repetition tools: mistake review, vocab/formula review, and due-date scheduling.

## Data Policy

- `original`: safe to use and publish if authored by the project.
- `opensat`: usable as a seed source according to the OpenSAT database usage note, but every imported question needs review.
- `official_log`: progress metadata only; do not store official prompt text, answer choices, passages, or explanations unless there is explicit written permission.
- `private_vault`: local family/admin-child access only for high-risk material. This must never be exposed to public learner accounts or public exports without a rights review.
- `ai_generated`: original draft generated from skill metadata, not copied wording. Keep `needs_review` until an admin checks accuracy, originality, and source similarity.

CrackSAT-specific note: CrackSAT's copyright page says its material cannot be reproduced in any format. Treat it as reference/link-only for public use. If the family uses it privately, keep it in `private_vault` and use it mainly to identify skills, not to build public question text.

## Protected Source To AI Draft Workflow

1. Save protected/high-risk material only as a `sourceSignal`: source kind, reference/link, SAT section, domain, skill, difficulty idea, mistake pattern, and learning goal.
2. The signal form must confirm that no protected prompt, passage, answer choices, or official explanation was pasted.
3. Generate a new `ai_generated` draft from the signal. The generated item stores `sourceSignalId`, `generationBrief`, `safetyReport`, and `publicationStatus`.
4. Run local safety checks before saving: protected-text pattern warning, source-brief similarity, and similarity to existing local bank.
5. High-risk drafts stay `visibility=private_family` and `publicationStatus=private_similarity_review` until rewritten/reviewed.
6. Public learner accounts cannot view private source signals or private-family drafts, and public exports remove `sourceSignals` plus hidden private questions.

## Near-Term Roadmap

1. Static MVP with localStorage.
2. Local Python proxy for OpenSAT import.
3. Question editor and JSON import/export.
4. Larger reviewed original question bank.
5. Bluebook-like full test mode.
6. Teacher/parent dashboard.
7. Backend database and moderation workflow if the app is released publicly.
