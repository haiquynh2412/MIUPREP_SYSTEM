(function initSatStudioRemediationEngine(root, factory) {
  const remediationEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = remediationEngine;
  }
  if (root) {
    root.SatStudioRemediationEngine = remediationEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioRemediationEngine() {
  function remediationActionFor(errorType, question = {}) {
    const skill = question?.skill || "this skill";
    const actions = {
      knowledge_gap: `Read the mini lesson, then do 3 scaffold questions in ${skill}.`,
      calculation: "Redo the solution slowly, write each algebra step, then retry a clean-number variant.",
      careless: "Recheck the ask, units, and answer format before doing another timed item.",
      misread_prompt: "Underline the exact task and constraints, then explain why the chosen answer missed them.",
      trap_answer: "Write one reason each wrong choice is wrong before attempting a transfer question.",
      time_pressure: "Do a shorter timed set and answer every item before reviewing explanations.",
      vocab: "Add the word/phrase to Vocab, then retry a context question.",
      evidence: "Cite the exact phrase or data point that proves the answer.",
      skipped: "Do one untimed foundation pass before returning to timer.",
      slow_correct: "Repeat this form under target time; keep accuracy while reducing seconds.",
      marked: "Write what felt uncertain, then do one transfer question.",
    };
    return actions[errorType] || `Review the explanation, save a note, then retry ${skill}.`;
  }

  function normalizeAttemptErrorType(attempt = {}) {
    if (attempt.errorType) return attempt.errorType;
    if (attempt.pacingFlag) return attempt.pacingFlag;
    if (!attempt.correct && (!attempt.selectedAnswer || attempt.skipped)) return "skipped";
    if (attempt.markedForReview) return "marked";
    return attempt.correct ? "marked" : "trap_answer";
  }

  function compactText(value = "", maxLength = 260) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
  }

  function answerChoiceText(question = {}, key = "") {
    if (!key) return "";
    const choices = question.choices || {};
    if (Array.isArray(choices)) {
      const found = choices.find((choice) => String(choice?.key || choice?.id || choice?.label || "") === String(key));
      return found ? String(found.text || found.value || found.label || "") : "";
    }
    return String(choices[key] || "");
  }

  function explanationObject(question = {}) {
    return question && typeof question.explanation === "object" && question.explanation !== null ? question.explanation : {};
  }

  function selectedDistractorRationale(question = {}, selectedAnswer = "") {
    const explanation = explanationObject(question);
    const distractors = explanation.distractors || explanation.wrongChoices || explanation.choiceRationales || {};
    return compactText(distractors[selectedAnswer] || "");
  }

  function correctRationale(question = {}) {
    const explanation = explanationObject(question);
    return compactText(explanation.correct || (typeof question.explanation === "string" ? question.explanation : ""), 320);
  }

  function taskHintFor(question = {}, diagnosis = {}) {
    const isMath = /math/i.test(question.section || "");
    if (diagnosis.type === "misread_prompt") return "Restate the exact ask and circle the constraint that changes the answer.";
    if (diagnosis.type === "evidence") return "Name the claim first, then find the exact text or data point that proves it.";
    if (diagnosis.type === "vocab") return "Cover the choices and predict a simple word that fits the sentence.";
    if (isMath) return "Write the first equation, relationship, or diagram fact before calculating.";
    return "Identify the question type, then predict the answer's job before looking at choices.";
  }

  function proofHintFor(question = {}, diagnosis = {}) {
    const isMath = /math/i.test(question.section || "");
    if (diagnosis.type === "time_pressure" || diagnosis.type === "slow_correct") return "Look for the shortest valid route: structure, substitution, graph, or elimination.";
    if (diagnosis.type === "trap_answer") return "Compare the tempting choice with the full condition in the prompt.";
    if (isMath) return "Check the setup against the original condition before doing long arithmetic.";
    return "Point to the exact phrase, transition, or data comparison that forces the answer.";
  }

  function trapRepairMove(choiceAnalysis = {}, diagnosis = {}) {
    if (diagnosis.type === "calculation") return "Redo the last algebra or arithmetic step on a separate line.";
    if (diagnosis.type === "careless") return "Recheck the unit, sign, and answer format before selecting.";
    if (diagnosis.type === "time_pressure" || diagnosis.type === "slow_correct") return "Choose a faster route and repeat under target time.";
    if (diagnosis.type === "evidence") return "Do not choose until the proof phrase is written.";
    if (diagnosis.type === "misread_prompt") return "Rewrite the task and reject answers to a different question.";
    if (choiceAnalysis.selectedRationale) return choiceAnalysis.selectedRationale;
    return diagnosis.studentPrompt || "Name why the selected answer is attractive, then state what it fails to prove.";
  }

  function buildHintSteps(question = {}, attempt = {}, diagnosis = {}, choiceAnalysis = {}, lesson = {}, scaffoldDrill = {}) {
    const correct = correctRationale(question);
    return [
      {
        level: 1,
        id: "task",
        title: "Hint 1: Find the task",
        reveal: "before_choices",
        prompt: taskHintFor(question, diagnosis),
      },
      {
        level: 2,
        id: "proof",
        title: "Hint 2: Find the proof",
        reveal: "after_first_attempt",
        prompt: proofHintFor(question, diagnosis),
      },
      {
        level: 3,
        id: "trap",
        title: "Hint 3: Check the trap",
        reveal: "after_selected_answer",
        prompt: trapRepairMove(choiceAnalysis, diagnosis),
      },
      {
        level: 4,
        id: "full_solution",
        title: "Full solution",
        reveal: "after_student_request_or_failed_attempt",
        prompt: correct || lesson.rule || scaffoldDrill.prompt || "Review the explanation, then prove the skill on a fresh item.",
      },
    ];
  }

  function buildSelectedTrapCoaching(question = {}, attempt = {}, diagnosis = {}, choiceAnalysis = {}) {
    const selected = choiceAnalysis.selectedAnswer || attempt.selectedAnswer || "";
    return {
      selectedAnswer: selected,
      trapType: diagnosis.type || normalizeAttemptErrorType(attempt),
      whyAttractive: choiceAnalysis.likelyReason || diagnosis.whyLikely || "The selected answer matched part of the topic.",
      whyWrong: choiceAnalysis.selectedRationale || diagnosis.rootCause || "It does not fully prove the tested task.",
      repairMove: trapRepairMove(choiceAnalysis, diagnosis),
      proofPrompt: diagnosis.proofTarget || "Pass one fresh same-skill proof question without slow_correct pacing.",
    };
  }

  function buildSelectedChoiceAnalysis(question = {}, attempt = {}, diagnosis = {}, helpers = {}) {
    const selectedAnswer = attempt.selectedAnswer || "";
    const correctAnswer = helpers.getCorrectAnswerLabel ? helpers.getCorrectAnswerLabel(question) : question.correctAnswer || "";
    const selectedText = compactText(answerChoiceText(question, selectedAnswer), 220);
    const correctText = compactText(answerChoiceText(question, question.correctAnswer || correctAnswer), 220);
    const rationale = selectedDistractorRationale(question, selectedAnswer);
    const isGridIn = ["student_produced_response", "grid_in", "numeric"].includes(question?.questionType);

    if (!selectedAnswer) {
      return {
        selectedAnswer,
        selectedText,
        correctAnswer,
        correctText,
        likelyReason: "No answer was submitted, so the first fix is an entry strategy before timed work.",
        selectedRationale: "The tutor should ask for the first move: equation, evidence phrase, grammar rule, or diagram setup.",
        correctRationale: correctRationale(question),
      };
    }

    if (rationale) {
      return {
        selectedAnswer,
        selectedText,
        correctAnswer,
        correctText,
        likelyReason: `Choice ${selectedAnswer} was tempting, but it misses the tested proof.`,
        selectedRationale: rationale,
        correctRationale: correctRationale(question),
      };
    }

    if (isGridIn) {
      return {
        selectedAnswer,
        selectedText,
        correctAnswer,
        correctText,
        likelyReason: `The submitted value ${selectedAnswer} did not match the accepted answer ${correctAnswer || "recorded for this item"}.`,
        selectedRationale: diagnosis.rootCause || "Treat this as a setup, calculation, or answer-format check before retrying.",
        correctRationale: correctRationale(question),
      };
    }

    return {
      selectedAnswer,
      selectedText,
      correctAnswer,
      correctText,
      likelyReason: selectedText
        ? `Choice ${selectedAnswer} says "${selectedText}". It likely matched part of the topic, but not the complete task.`
        : `Choice ${selectedAnswer} did not match the verified answer ${correctAnswer || "for this item"}.`,
      selectedRationale: diagnosis.rootCause || "Use the explanation to separate the tempting idea from the required proof.",
      correctRationale: correctRationale(question),
    };
  }

  function tutorDiagnosisForAttempt(question = {}, attempt = {}, helpers = {}) {
    const skill = question.skill || "this skill";
    const domain = question.domain || "SAT";
    const section = question.section || "";
    const isMath = /math/i.test(section);
    const lesson = helpers.lesson || (helpers.getKnowledgeReviewLesson ? helpers.getKnowledgeReviewLesson(question) : null) || {};
    const correctAnswer = helpers.getCorrectAnswerLabel ? helpers.getCorrectAnswerLabel(question) : question.correctAnswer || "";
    const selectedAnswer = attempt.selectedAnswer || "";
    const errorType = normalizeAttemptErrorType(attempt);
    const base = {
      type: errorType,
      label: "Review needed",
      rootCause: `This ${skill} item needs a targeted retry.`,
      whyLikely: "The attempt was flagged for review or did not meet the pass rule.",
      teachFirst: lesson.title || `Review: ${skill}`,
      studentPrompt: `Explain the rule for ${skill}, then solve a fresh item without looking at the choices first.`,
      proofTarget: `Pass one new ${skill} question without slow_correct pacing.`,
      reviewCadence: "Review today, retry tomorrow, then prove transfer within 3 days.",
      severity: "medium",
      evidence: {
        selectedAnswer,
        correctAnswer,
        pacingFlag: attempt.pacingFlag || "",
        markedForReview: Boolean(attempt.markedForReview),
      },
    };

    const map = {
      knowledge_gap: {
        label: "Knowledge gap",
        rootCause: `The underlying rule for ${skill} is not stable yet.`,
        whyLikely: "The answer was wrong or skipped in a way that points to missing prerequisite knowledge.",
        studentPrompt: `Before retrying, write the core rule for ${skill} and solve one scaffold example step by step.`,
        proofTarget: `Pass 2 scaffold questions and 1 transfer question in ${skill}.`,
        reviewCadence: "Lesson now, scaffold proof tomorrow, transfer proof within 3 days.",
        severity: "high",
      },
      calculation: {
        label: "Math execution slip",
        rootCause: isMath ? "The setup is likely close, but an arithmetic or algebra step broke the result." : "The reasoning chain likely drifted after the key evidence.",
        whyLikely: isMath ? "The attempt is tagged as calculation, so the next practice should isolate clean symbolic work." : "The error was tagged calculation-style even outside Math, so verify each inference step.",
        studentPrompt: "Redo the item with every transformation on a separate line, then compare only the final value or answer choice.",
        proofTarget: `Pass a clean-number variant in ${skill} under target time.`,
        reviewCadence: "Redo today, speed proof tomorrow.",
        severity: "medium",
      },
      careless: {
        label: "Careless execution",
        rootCause: "The concept may be known, but the final answer did not match the exact ask.",
        whyLikely: "This is tagged careless, so the blocker is answer discipline rather than a full lesson gap.",
        studentPrompt: "Underline the ask, units, and answer format before solving again.",
        proofTarget: "Pass 3 similar-format questions with no format or unit misses.",
        reviewCadence: "Retry today, then recheck in 2 days.",
        severity: "medium",
      },
      misread_prompt: {
        label: "Prompt misread",
        rootCause: "The selected answer likely solves a different task from the one asked.",
        whyLikely: "The attempt is tagged as a misread, so the next step is task translation before solving.",
        studentPrompt: "Rewrite the question in your own words and circle the constraint that changes the answer.",
        proofTarget: `Pass one transfer item in ${domain} after writing the exact task first.`,
        reviewCadence: "Review today, transfer proof tomorrow.",
        severity: "high",
      },
      trap_answer: {
        label: "Trap answer",
        rootCause: "The selected choice likely matched a tempting partial idea, not the full proof.",
        whyLikely: selectedAnswer ? `The student selected ${selectedAnswer}${correctAnswer ? ` while the verified answer is ${correctAnswer}` : ""}.` : "The wrong answer pattern fits a common distractor.",
        studentPrompt: "Name the trap in the selected answer, then write why each wrong answer is wrong.",
        proofTarget: `Pass a same-skill transfer question and eliminate all wrong choices aloud.`,
        reviewCadence: "Trap review today, transfer proof within 2 days.",
        severity: "medium",
      },
      time_pressure: {
        label: "Time pressure",
        rootCause: "The student may know the material but did not finish within the pacing budget.",
        whyLikely: "The attempt was flagged for time pressure.",
        studentPrompt: "Solve an easier version first, then repeat under a shorter timer.",
        proofTarget: `Pass a ${skill} item within target time, then repeat once at exam pace.`,
        reviewCadence: "Short timed set today, exam-pace proof tomorrow.",
        severity: "high",
      },
      slow_correct: {
        label: "Slow correct",
        rootCause: "Accuracy is present, but the method is too slow for SAT pacing.",
        whyLikely: "The answer was correct but pacing was flagged slow_correct.",
        studentPrompt: "Find the fastest route: use structure, substitution, or elimination before doing long work.",
        proofTarget: `Repeat this form under target time while staying correct.`,
        reviewCadence: "Speed proof within 24 hours.",
        severity: "medium",
      },
      vocab: {
        label: "Vocabulary in context",
        rootCause: "A key word or phrase likely changed the meaning of the answer.",
        whyLikely: "The attempt is tagged vocab, so the fix belongs in both Vocab and Reading practice.",
        studentPrompt: "Add the word and sentence context to flashcards, then explain the word without translating mechanically.",
        proofTarget: "Pass one context-vocabulary item and correctly define the saved word.",
        reviewCadence: "Flashcard today, quiz tomorrow, spaced review in 4 days.",
        severity: "medium",
      },
      evidence: {
        label: "Evidence gap",
        rootCause: "The answer was chosen without enough support from the text, table, or graph.",
        whyLikely: "The attempt is tagged evidence, so the fix is proof discipline.",
        studentPrompt: "Quote or point to the exact evidence before looking at choices.",
        proofTarget: "Pass one evidence item after writing the proof phrase first.",
        reviewCadence: "Evidence drill today, transfer proof within 2 days.",
        severity: "high",
      },
      skipped: {
        label: "Skipped item",
        rootCause: "The student did not have an entry strategy for this item.",
        whyLikely: "No selected answer was recorded.",
        studentPrompt: "Identify the first move only: equation, evidence sentence, or grammar rule.",
        proofTarget: `Complete one untimed foundation item in ${skill}, then one timed transfer item.`,
        reviewCadence: "Foundation today, transfer tomorrow.",
        severity: "high",
      },
      marked: {
        label: "Uncertain correct or marked",
        rootCause: "The answer may be right, but confidence or method is not automatic yet.",
        whyLikely: "The item was marked for review.",
        studentPrompt: "Write what felt uncertain, then compare your reason to the official explanation.",
        proofTarget: `Pass one transfer item in ${skill} without marking it.`,
        reviewCadence: "Light review within 3 days.",
        severity: "low",
      },
    };

    return { ...base, ...(map[errorType] || {}) };
  }

  function buildTutorExplanationLayer(question = {}, attempt = {}, helpers = {}) {
    const lesson = helpers.lesson || (helpers.getKnowledgeReviewLesson ? helpers.getKnowledgeReviewLesson(question) : null) || {};
    const proofQuestion = helpers.proofQuestion || (helpers.chooseProofQuestionForAttempt ? helpers.chooseProofQuestionForAttempt(question, attempt) : null);
    const diagnosis = helpers.tutorDiagnosis || tutorDiagnosisForAttempt(question, attempt, { ...helpers, lesson, proofQuestion });
    const scaffoldDrill = helpers.scaffoldDrill || scaffoldDrillForDiagnosis(diagnosis, question);
    const passCondition = helpers.passCondition || proofPassCondition(diagnosis);
    const choiceAnalysis = buildSelectedChoiceAnalysis(question, attempt, diagnosis, helpers);
    const hintSteps = buildHintSteps(question, attempt, diagnosis, choiceAnalysis, lesson, scaffoldDrill);
    const selectedTrapCoaching = buildSelectedTrapCoaching(question, attempt, diagnosis, choiceAnalysis);

    return {
      version: "tutor-explanation-v2-2026-05-25",
      provider: {
        mode: "local_rule_based",
        interface: "TutorExplanationProvider",
        inputVersion: "tutor-explanation-input-v1",
        outputVersion: "tutor-explanation-output-v2",
        apiReady: true,
      },
      hintPolicy: {
        mode: "progressive_disclosure",
        fullSolutionReveal: "after_student_request_or_failed_attempt",
        requiresFirstMoveBeforeFullSolution: question?.difficulty === "Hard" || diagnosis.severity === "high",
      },
      title: attempt.correct ? "Tutor speed check" : "AI Tutor explanation",
      status: attempt.correct ? "coach_note" : "needs_review",
      errorType: diagnosis.type || normalizeAttemptErrorType(attempt),
      errorLabel: diagnosis.label || "Review needed",
      severity: diagnosis.severity || "medium",
      rootCause: diagnosis.rootCause || "Review needed before another timed attempt.",
      whyLikely: diagnosis.whyLikely || "",
      selectedAnswer: choiceAnalysis.selectedAnswer,
      selectedAnswerText: choiceAnalysis.selectedText,
      correctAnswer: choiceAnalysis.correctAnswer,
      correctAnswerText: choiceAnalysis.correctText,
      choiceAnalysis,
      hintSteps,
      selectedTrapCoaching,
      lesson: {
        title: lesson.title || diagnosis.teachFirst || `Review: ${question?.skill || "SAT skill"}`,
        key: helpers.lessonScopeKey ? helpers.lessonScopeKey(question) : "",
      },
      scaffoldDrill,
      proof: {
        target: diagnosis.proofTarget || passCondition.condition,
        questionId: proofQuestion?.id || "",
        passCondition,
      },
      studentPrompt: diagnosis.studentPrompt || "",
      reviewCadence: diagnosis.reviewCadence || "",
    };
  }

  function tutorPriorityScore(diagnosis = {}, attempt = {}) {
    const severityScore = { high: 90, medium: 60, low: 30 };
    let score = severityScore[diagnosis.severity] || 50;
    if (!attempt.correct) score += 20;
    if (["knowledge_gap", "skipped", "time_pressure", "evidence", "misread_prompt"].includes(diagnosis.type)) score += 10;
    if (attempt.pacingFlag === "slow_correct") score += 5;
    if (attempt.markedForReview) score += 3;
    return score;
  }

  function scaffoldDrillForDiagnosis(diagnosis = {}, question = {}) {
    const skill = question?.skill || "this skill";
    const map = {
      knowledge_gap: {
        kind: "scaffold_drill",
        count: 3,
        title: `Rebuild ${skill}`,
        prompt: `Do 3 scaffold questions in ${skill} with the rule written before each solution.`,
      },
      calculation: {
        kind: "clean_number_drill",
        count: 2,
        title: "Clean execution drill",
        prompt: "Redo the setup with every arithmetic or algebra move on its own line.",
      },
      careless: {
        kind: "format_check_drill",
        count: 3,
        title: "Ask-and-format drill",
        prompt: "Underline the exact ask, unit, and answer format before solving.",
      },
      misread_prompt: {
        kind: "task_translation_drill",
        count: 2,
        title: "Task translation drill",
        prompt: "Rewrite the question in your own words before choosing an answer.",
      },
      trap_answer: {
        kind: "wrong_choice_drill",
        count: 1,
        title: "Trap elimination drill",
        prompt: "Name the trap in the chosen answer and explain why every wrong choice is wrong.",
      },
      time_pressure: {
        kind: "timed_scaffold_drill",
        count: 2,
        title: "Short timed rebuild",
        prompt: "Solve an easier same-skill item, then repeat one item under target time.",
      },
      slow_correct: {
        kind: "speed_route_drill",
        count: 2,
        title: "Speed route drill",
        prompt: "Find the fastest valid route before doing long work.",
      },
      vocab: {
        kind: "vocab_context_drill",
        count: 2,
        title: "Context vocabulary drill",
        prompt: "Save the word, explain it in context, then answer a fresh context item.",
      },
      evidence: {
        kind: "evidence_first_drill",
        count: 2,
        title: "Evidence first drill",
        prompt: "Write the proof phrase or data point before looking at answer choices.",
      },
      skipped: {
        kind: "first_move_drill",
        count: 1,
        title: "First move drill",
        prompt: "Identify only the first move: equation, evidence sentence, grammar rule, or diagram.",
      },
      marked: {
        kind: "confidence_drill",
        count: 1,
        title: "Confidence check",
        prompt: "Write what felt uncertain, then prove the same skill on a fresh item.",
      },
    };
    return map[diagnosis.type] || map.trap_answer;
  }

  function proofPassCondition(diagnosis = {}) {
    return {
      correct: true,
      pacingFlagNot: "slow_correct",
      condition: diagnosis.proofTarget || "Pass one fresh same-skill proof question without slow_correct pacing.",
    };
  }

  function failActionForDiagnosis(diagnosis = {}, question = {}) {
    return {
      route: "deeper_lesson",
      lessonDepth: diagnosis.severity === "high" ? "foundation" : "worked_example",
      action: `If proof fails, return to ${diagnosis.teachFirst || `the ${question?.skill || "target"} lesson`} and do another scaffold drill before retesting.`,
    };
  }

  function buildRemediationV2({ question = {}, attempt = {}, lesson = {}, proofQuestion = null, tutorDiagnosis = {}, assignedAt = "", dueAt = "", lessonKey = "" } = {}) {
    const scaffoldDrill = scaffoldDrillForDiagnosis(tutorDiagnosis, question);
    const passCondition = proofPassCondition(tutorDiagnosis);
    return {
      version: "remediation-v2-2026-05-19",
      state: "assigned",
      rootCause: tutorDiagnosis.rootCause || "Review needed before another timed attempt.",
      errorType: tutorDiagnosis.type || normalizeAttemptErrorType(attempt),
      lesson: {
        key: lessonKey,
        title: lesson.title || `Review: ${question?.skill || "SAT skill"}`,
        section: question?.section || "All",
        domain: question?.domain || "All",
        skill: question?.skill || "All",
      },
      scaffoldDrill,
      proof: {
        questionId: proofQuestion?.id || "",
        dueAt,
        status: "assigned",
        condition: passCondition.condition,
        passCondition,
      },
      schedule: {
        assignedAt,
        dueAt,
      },
      failAction: failActionForDiagnosis(tutorDiagnosis, question),
    };
  }

  function isHighPriorityAttempt(attempt = {}) {
    return !attempt.correct || ["knowledge_gap", "time_pressure", "skipped"].includes(attempt.errorType);
  }

  function reviewDelayDaysForAttempt(question = {}, attempt = {}) {
    const mode = String(attempt.practiceMode || "").toLowerCase();
    const issue = String(attempt.errorType || attempt.pacingFlag || "").toLowerCase();
    if (attempt.correct) {
      if (/maintenance/.test(mode)) return 14;
      if (/proof/.test(mode)) return 7;
      if (issue === "slow_correct") return 1;
      return 3;
    }
    if (question?.difficulty === "Hard" || question?.domain === "Advanced Math") return 3;
    if (/trap|misread|evidence|unsupported|transition|vocab|context/.test(issue)) return 2;
    if (/knowledge|foundation|skipped/.test(issue)) return 1;
    if (/calculation|careless|format|unit|time_pressure|fast_wrong/.test(issue)) return 1;
    return 1;
  }

  function buildAttemptRemediation(question, attempt = {}, helpers = {}) {
    const now = helpers.now instanceof Date ? helpers.now : new Date(helpers.now || Date.now());
    const getKnowledgeReviewLesson = helpers.getKnowledgeReviewLesson || (() => ({ title: `Review: ${question?.skill || "SAT skill"}` }));
    const chooseProofQuestionForAttempt = helpers.chooseProofQuestionForAttempt || (() => null);
    const lessonScopeKey = helpers.lessonScopeKey || ((scope) => `${scope?.section || "All"}|${scope?.domain || "All"}|${scope?.skill || "All"}`);
    const lesson = getKnowledgeReviewLesson(question);
    const proofQuestion = chooseProofQuestionForAttempt(question, attempt);
    const tutorDiagnosis = tutorDiagnosisForAttempt(question, attempt, { ...helpers, lesson, proofQuestion });
    const due = new Date(now);
    due.setDate(due.getDate() + reviewDelayDaysForAttempt(question, attempt));
    const assignedAt = now.toISOString();
    const dueAt = due.toISOString();
    const lessonKey = lessonScopeKey(question);
    const remediationV2 = buildRemediationV2({
      question,
      attempt,
      lesson,
      proofQuestion,
      tutorDiagnosis,
      assignedAt,
      dueAt,
      lessonKey,
    });
    const tutorExplanationLayer = buildTutorExplanationLayer(question, attempt, {
      ...helpers,
      lesson,
      proofQuestion,
      tutorDiagnosis,
      scaffoldDrill: remediationV2.scaffoldDrill,
      passCondition: remediationV2.proof.passCondition,
    });
    return {
      id: `remediation-${attempt.id || now.getTime()}`,
      status: "assigned",
      assignedAt,
      dueAt,
      lessonKey,
      lessonTitle: lesson.title,
      action: remediationActionFor(attempt.errorType || attempt.pacingFlag || "marked", question),
      tutorDiagnosis,
      priorityScore: tutorPriorityScore(tutorDiagnosis, attempt),
      proofRule: tutorDiagnosis.proofTarget || "Pass a new question in the same skill or skeleton without slow_correct pacing.",
      proofQuestionId: proofQuestion?.id || "",
      proofDueAt: dueAt,
      remediationV2,
      tutorExplanationLayer,
      scaffoldDrill: remediationV2.scaffoldDrill,
      passCondition: remediationV2.proof.passCondition,
      failAction: remediationV2.failAction,
    };
  }

  function defaultLessonScopeKey(scope) {
    return `${scope?.section || "All"}|${scope?.domain || "All"}|${scope?.skill || "All"}`;
  }

  function buildAdaptiveRemediationQueue(options = {}, helpers = {}) {
    const profile = options.profile || {};
    const includeFuture = options.includeFuture !== false;
    const includePassed = Boolean(options.includePassed);
    const limit = Number(options.limit) || 50;
    const now = Number(options.nowMs) || Date.now();
    const getQuestionById = helpers.getQuestionById || (() => null);
    const isQuestionVisible = helpers.isQuestionVisible || (() => true);
    const isStudyAvailableQuestion = helpers.isStudyAvailableQuestion || (() => true);
    const chooseProofQuestionForAttempt = helpers.chooseProofQuestionForAttempt || (() => null);
    const getKnowledgeReviewLesson = helpers.getKnowledgeReviewLesson || ((question) => ({ title: `Review: ${question?.skill || "SAT skill"}` }));
    const getCorrectAnswerLabel = helpers.getCorrectAnswerLabel || (() => "");
    const suggestErrorType = helpers.suggestErrorType || (() => "trap_answer");
    const hasLaterProofAttempt = helpers.hasLaterProofAttempt || (() => false);
    const lessonScopeKey = helpers.lessonScopeKey || defaultLessonScopeKey;
    const visibleQuestions = Array.isArray(options.visibleQuestions) ? options.visibleQuestions : [];
    const rows = [];

    (profile.attempts || []).forEach((attempt) => {
      const question = getQuestionById(attempt.questionId);
      if (!question || !isQuestionVisible(question)) return;
      const needsRemediation = !attempt.correct || attempt.errorType || attempt.pacingFlag === "slow_correct" || attempt.markedForReview;
      if (!needsRemediation) return;
      const remediation = attempt.remediation || buildAttemptRemediation(question, attempt, { ...helpers, now: new Date(attempt.at || now) });
      const savedProofQuestion = remediation.proofQuestionId ? getQuestionById(remediation.proofQuestionId) : null;
      const proofQuestion = savedProofQuestion && isQuestionVisible(savedProofQuestion) ? savedProofQuestion : chooseProofQuestionForAttempt(question, attempt);
      const proofPassed = remediation.status === "proof_passed" || hasLaterProofAttempt(attempt, question);
      const proofFailed = remediation.status === "proof_failed";
      if (proofPassed && !includePassed) return;
      const dueAt = remediation.dueAt || attempt.dueAt || attempt.at;
      const due = !dueAt || (Date.parse(dueAt) || 0) <= now;
      if (!includeFuture && !due && !proofPassed) return;
      const lessonReviewed = remediation.status === "reviewed" || remediation.reviewedAt || proofPassed;
      const status = proofPassed ? "proof_passed" : proofFailed ? "lesson_due" : lessonReviewed ? (due ? "proof_due" : "proof_scheduled") : due ? "lesson_due" : "lesson_scheduled";
      const tutorDiagnosis = remediation.tutorDiagnosis || tutorDiagnosisForAttempt(question, attempt, { ...helpers, lesson: getKnowledgeReviewLesson(question) });
      const remediationV2 = remediation.remediationV2 || buildRemediationV2({
        question,
        attempt,
        lesson: getKnowledgeReviewLesson(question),
        proofQuestion,
        tutorDiagnosis,
        assignedAt: remediation.assignedAt || attempt.at,
        dueAt,
        lessonKey: remediation.lessonKey || lessonScopeKey(question),
      });
      const normalizedV2 = {
        ...remediationV2,
        state: proofPassed ? "proof_passed" : proofFailed ? "proof_failed" : status,
        proof: {
          ...(remediationV2.proof || {}),
          questionId: proofQuestion?.id || remediation.proofQuestionId || remediationV2.proof?.questionId || "",
          status: proofPassed ? "proof_passed" : proofFailed ? "proof_failed" : status,
        },
      };
      const tutorExplanationLayer = remediation.tutorExplanationLayer || buildTutorExplanationLayer(question, attempt, {
        ...helpers,
        lesson: getKnowledgeReviewLesson(question),
        proofQuestion,
        tutorDiagnosis,
        scaffoldDrill: remediation.scaffoldDrill || normalizedV2.scaffoldDrill,
        passCondition: remediation.passCondition || normalizedV2.proof?.passCondition,
      });
      rows.push({
        attemptId: attempt.id,
        questionId: question.id,
        section: question.section,
        domain: question.domain,
        skill: question.skill,
        difficulty: question.difficulty,
        errorType: attempt.errorType || attempt.pacingFlag || (!attempt.correct ? suggestErrorType(question, false, { skipped: !attempt.selectedAnswer }) : "marked"),
        taggedBy: attempt.taggedBy || "",
        taggedByRole: attempt.taggedByRole || "",
        taggedAt: attempt.taggedAt || attempt.at || "",
        tagSource: attempt.tagSource || "",
        selectedAnswer: attempt.selectedAnswer || "",
        correctAnswer: getCorrectAnswerLabel(question),
        dueAt,
        assignedAt: remediation.assignedAt || attempt.at,
        reviewedAt: remediation.reviewedAt || "",
        status,
        proofPassed,
        proofQuestionId: proofQuestion?.id || "",
        proofQuestion,
        lessonTitle: remediation.lessonTitle || getKnowledgeReviewLesson(question).title,
        action: remediation.action || remediationActionFor(attempt.errorType || attempt.pacingFlag, question),
        tutorDiagnosis,
        tutorExplanationLayer,
        priorityScore: remediation.priorityScore || tutorPriorityScore(tutorDiagnosis, attempt),
        proofRule: remediation.proofRule || "Pass a new question in the same skill.",
        remediationV2: normalizedV2,
        rootCause: normalizedV2.rootCause,
        scaffoldDrill: remediation.scaffoldDrill || normalizedV2.scaffoldDrill,
        passCondition: remediation.passCondition || normalizedV2.proof?.passCondition,
        failAction: remediation.failAction || normalizedV2.failAction,
        failedProofAt: remediation.proofFailedAt || "",
        failedProofQuestionId: remediation.failedProofQuestionId || "",
      });
    });

    Object.entries(profile.lessonProgress || {}).forEach(([key, task]) => {
      if (!task || task.status === "proof_passed") return;
      const dueAt = task.dueAt || task.assignedAt || new Date(now).toISOString();
      const due = !dueAt || (Date.parse(dueAt) || 0) <= now;
      if (!includeFuture && !due) return;
      const proofQuestion = visibleQuestions.find((question) => lessonScopeKey(question) === key && isStudyAvailableQuestion(question));
      const lessonTitle = `Lesson: ${task.skill || proofQuestion?.skill || "Review"}`;
      const remediationV2 = {
        version: "remediation-v2-2026-05-19",
        state: task.status === "reviewed" ? "proof_due" : due ? "lesson_due" : "lesson_scheduled",
        rootCause: `This lesson was assigned to rebuild ${task.skill || proofQuestion?.skill || "the target skill"}.`,
        errorType: "knowledge_gap",
        lesson: {
          key,
          title: lessonTitle,
          section: task.section || proofQuestion?.section || "All",
          domain: task.domain || proofQuestion?.domain || "All",
          skill: task.skill || proofQuestion?.skill || "All",
        },
        scaffoldDrill: {
          kind: "lesson_scaffold_drill",
          count: 3,
          title: "Lesson scaffold",
          prompt: "Read the lesson, copy one worked example, then solve 3 scaffold items.",
        },
        proof: {
          questionId: proofQuestion?.id || "",
          dueAt,
          status: task.status === "reviewed" ? "proof_due" : "assigned",
          condition: "Pass a scaffold question in this lesson.",
          passCondition: { correct: true, pacingFlagNot: "slow_correct", condition: "Pass a scaffold question in this lesson." },
        },
        schedule: { assignedAt: task.assignedAt || "", dueAt },
        failAction: {
          route: "deeper_lesson",
          lessonDepth: "foundation",
          action: "If proof fails, return to the foundation concept and do another scaffold drill.",
        },
      };
      rows.push({
        attemptId: "",
        questionId: "",
        section: task.section || proofQuestion?.section || "All",
        domain: task.domain || proofQuestion?.domain || "All",
        skill: task.skill || proofQuestion?.skill || "All",
        difficulty: "Lesson",
        errorType: "knowledge_gap",
        taggedBy: task.assignedBy || "roadmap",
        taggedByRole: task.assignedByRole || "system",
        taggedAt: task.assignedAt || "",
        tagSource: task.source || "lesson_progress",
        selectedAnswer: "",
        correctAnswer: "",
        dueAt,
        assignedAt: task.assignedAt || "",
        reviewedAt: task.reviewedAt || "",
        status: task.status === "reviewed" ? "proof_due" : due ? "lesson_due" : "lesson_scheduled",
        proofPassed: false,
        proofQuestionId: proofQuestion?.id || "",
        proofQuestion: proofQuestion || null,
        lessonTitle,
        action: "Read the lesson, then pass a scaffold proof question.",
        tutorDiagnosis: {
          type: "knowledge_gap",
          label: "Assigned lesson",
          rootCause: `This lesson was assigned to rebuild ${task.skill || proofQuestion?.skill || "the target skill"}.`,
          whyLikely: "The roadmap or review flow identified this as a prerequisite before more testing.",
          teachFirst: `Lesson: ${task.skill || proofQuestion?.skill || "Review"}`,
          studentPrompt: "Study the rule, copy one worked example, then solve without looking at answer choices.",
          proofTarget: "Pass a scaffold question in this lesson.",
          reviewCadence: "Lesson now, proof when due.",
          severity: "high",
          evidence: {},
        },
        priorityScore: 95,
        proofRule: "Pass a scaffold question in this lesson.",
        lessonTaskKey: key,
        remediationV2,
        rootCause: remediationV2.rootCause,
        scaffoldDrill: remediationV2.scaffoldDrill,
        passCondition: remediationV2.proof.passCondition,
        failAction: remediationV2.failAction,
      });
    });

    const statusRank = { lesson_due: 0, proof_due: 1, lesson_scheduled: 2, proof_scheduled: 3, proof_passed: 4 };
    return rows
      .sort(
        (a, b) =>
          (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) ||
          (b.priorityScore || 0) - (a.priorityScore || 0) ||
          (Date.parse(a.dueAt || "") || 0) - (Date.parse(b.dueAt || "") || 0),
      )
      .slice(0, limit);
  }

  return {
    buildAdaptiveRemediationQueue,
    buildAttemptRemediation,
    buildHintSteps,
    buildRemediationV2,
    buildSelectedTrapCoaching,
    buildTutorExplanationLayer,
    isHighPriorityAttempt,
    normalizeAttemptErrorType,
    remediationActionFor,
    reviewDelayDaysForAttempt,
    scaffoldDrillForDiagnosis,
    tutorDiagnosisForAttempt,
    tutorPriorityScore,
  };
});
