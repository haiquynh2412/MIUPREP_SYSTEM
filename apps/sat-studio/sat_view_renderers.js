(function initSatStudioViewRenderers(root, factory) {
  let richText = root?.SatStudioRichText;
  if (!richText && typeof require === "function") {
    richText = require("./sat_richtext.js");
  }
  const viewRenderers = factory(richText);
  if (typeof module === "object" && module.exports) {
    module.exports = viewRenderers;
  }
  if (root) {
    root.SatStudioViewRenderers = viewRenderers;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioViewRenderers(richText) {
  function escapeHtml(value) {
    if (richText?.escapeHtml) return richText.escapeHtml(value);
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderInlineText(value) {
    return richText?.renderInlineMath ? richText.renderInlineMath(value) : escapeHtml(value);
  }

  function confidenceClass(value) {
    return String(value || "low")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "") || "low";
  }

  function boundedPercent(value) {
    const number = Number(value || 0);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function renderDiagnosticReadinessCard(readiness = {}) {
    const warnings = (readiness.warnings || []).slice(0, 2);
    const statusText = readiness.canStart ? "Ready" : "Needs more coverage";
    const confidence = readiness.confidence || "low";
    const structure = readiness.officialStructure || {};
    const structureText = structure.moduleCount > 1
      ? `${Number(structure.moduleCount || 0)} modules - ${Number(structure.totalMinutes || 0)} min timer required`
      : `${Number(structure.totalMinutes || 0)} min timer required`;
    return `
      <article class="diagnostic-readiness-card ${escapeHtml(confidenceClass(confidence))}">
        <div>
          <strong>${escapeHtml(readiness.label || "Diagnostic")}</strong>
          <span>${escapeHtml(statusText)} - confidence ${escapeHtml(confidence)}</span>
        </div>
        <div class="diagnostic-readiness-meter" data-score="${boundedPercent(readiness.readinessScore)}"><span></span></div>
        <p>${Number(readiness.selectedCount || 0)}/${Number(readiness.expectedCount || 0)} assembled from ${Number(readiness.readyCount || 0)} eligible questions.</p>
        <p class="muted">${escapeHtml(structureText)}</p>
        ${warnings.length ? `<small>${escapeHtml(warnings.join(" "))}</small>` : "<small>Coverage looks balanced enough for a roadmap signal.</small>"}
      </article>
    `;
  }

  function renderDiagnosticReadinessCards(readinessItems = []) {
    return (readinessItems || []).map(renderDiagnosticReadinessCard).join("");
  }

  function renderReviewChoice(key, text, selected, correct) {
    const classes = ["review-choice"];
    if (key === correct && key === selected) classes.push("selected-correct");
    else if (key === correct) classes.push("correct-answer");
    else if (key === selected) classes.push("selected-wrong");

    return `
      <div class="${classes.join(" ")}">
        <span class="choice-key">${escapeHtml(key)}</span>
        <span class="choice-text">${renderInlineText(text)}</span>
      </div>
    `;
  }

  function renderReviewChoices(question = {}, selected, correct) {
    return `
      <div class="review-choices">
        ${Object.entries(question.choices || {})
          .map(([key, text]) => renderReviewChoice(key, text, selected, correct))
          .join("")}
      </div>
    `;
  }

  function renderReviewGridIn(selected, correct) {
    return `
      <div class="grid-review-response">
        <span>Your answer: <strong class="${selected === correct ? "review-correct" : "review-wrong"}">${escapeHtml(selected || "No answer")}</strong></span>
        <span>Accepted answer: <strong>${escapeHtml(correct)}</strong></span>
      </div>
    `;
  }

  function renderDiagnosticReview(test = {}, context = {}) {
    const getQuestionById = context.getQuestionById || (() => null);
    const isGridInQuestion = context.isGridInQuestion || (() => false);
    const renderExplanation = context.renderExplanation || richText?.renderExplanation || ((value) => escapeHtml(value || "No explanation recorded."));
    const labelFor = context.labelFor || ((value) => value || "Unknown");
    const vi = context.language === "vi";
    const studentMode = Boolean(context.studentMode);
    const items = (test.reviewItems || []).map((item, index) => {
      const question = getQuestionById(item.questionId);
      if (!question) return "";
      const selected = item.selectedAnswer || (vi ? "Không trả lời" : "No answer");
      const correct = item.correctAnswer || question.correctAnswer || "";
      const route = item.adaptiveRoute ? ` - ${escapeHtml(labelFor(item.adaptiveRoute))}` : "";
      const resultText = item.correct
        ? (vi ? "Đúng" : "Correct")
        : item.selectedAnswer
          ? `${vi ? "Sai: đã chọn" : "Wrong: chose"} ${escapeHtml(selected)}`
          : (vi ? "Sai: bỏ trống" : "Wrong: no answer");
      const studentLearningCard = studentMode && !item.correct && typeof context.renderPretestLearningCard === "function"
        ? context.renderPretestLearningCard(question, item, index)
        : "";
      return `
        <article class="pretest-review ${item.correct ? "is-correct" : "is-wrong"}">
          <div class="review-heading">
            <div>
              <span class="pill">${vi ? "Câu" : "Question"} ${index + 1}</span>
              <span class="pill">${escapeHtml(question.section)}</span>
              <span class="pill">${escapeHtml(question.domain)}</span>
              <span class="pill">${escapeHtml(question.difficulty)}</span>
              ${item.moduleLabel ? `<span class="pill">${escapeHtml(item.moduleLabel)}${route}</span>` : ""}
            </div>
            <strong class="${item.correct ? "review-correct" : "review-wrong"}">
              ${resultText}
            </strong>
          </div>
          <p class="review-prompt">${renderInlineText(question.prompt)}</p>
          ${isGridInQuestion(question) ? renderReviewGridIn(selected, correct) : renderReviewChoices(question, selected, correct)}
          <div class="review-explanation">
            <strong>${vi ? "Đáp án đúng" : "Correct answer"}: ${escapeHtml(correct)}</strong>
            ${studentLearningCard}
            <p class="rich-explanation">${renderExplanation(question.explanation || "No explanation recorded.", item.selectedAnswer || "")}</p>
            ${
              studentMode && !item.correct
                ? `<div class="answer-actions pretest-review-actions"><button class="button secondary" type="button" data-pretest-note-question-id="${escapeHtml(question.id)}">${vi ? "Tạo ghi chú lỗi" : "Create mistake note"}</button></div>`
                : ""
            }
            ${studentMode ? "" : `<p class="muted">Source: ${escapeHtml(question.sourceName || labelFor(question.sourceType))} · ${escapeHtml(question.licenseNote || "No license note recorded")}</p>`}
          </div>
        </article>
      `;
    });

    return `<div class="pretest-review-list">${items.join("")}</div>`;
  }

  function renderRoadmapEvalMetric(label, value, caption) {
    return `
      <article>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
        <small>${escapeHtml(caption || "")}</small>
      </article>
    `;
  }

  function renderRoadmapEvaluationPanel(evaluation = {}, context = {}) {
    const errorTagLabel = context.errorTagLabel || ((value) => value || "Unknown");
    const confidence = evaluation.confidence || { label: "Low", detail: "Collect more diagnostic and practice data." };
    const confidenceClass = `confidence-${confidenceClassName(confidence.label)}`;
    const priorityRows = Array.isArray(evaluation.priorityRows) ? evaluation.priorityRows : [];
    const priorityList = priorityRows.length
      ? priorityRows
          .map(
            (item) => `
              <li>
                <strong>${escapeHtml(item.skill)}</strong>
                <span>${escapeHtml(item.status)} &middot; ${Number(item.mastery || 0)}% mastery &middot; ${escapeHtml(errorTagLabel(item.dominantErrorType))}</span>
              </li>
            `,
          )
          .join("")
      : "<li><strong>No weak skill cluster yet</strong><span>Collect more diagnostic or practice data.</span></li>";
    const risks = Array.isArray(evaluation.risks) && evaluation.risks.length
      ? evaluation.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "<li>Roadmap evidence is currently clean enough for the next weekly block.</li>";
    const actions = Array.isArray(evaluation.actions) && evaluation.actions.length
      ? evaluation.actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "<li>Keep one timed mixed set and one hard review set this week.</li>";
    const baselineLine = evaluation.baseline
      ? `Baseline ${Number(evaluation.baseline)} -> target ${Number(evaluation.target || 0)}`
      : `Target ${Number(evaluation.target || 0)}, baseline needed`;
    const gapLine =
      evaluation.gap === null || evaluation.gap === undefined
        ? "Take a diagnostic to calculate the target gap."
        : Number(evaluation.gap)
          ? `${Number(evaluation.gap)} points to close.`
          : "Target reached on the latest diagnostic estimate; now prove it with hard/timed work.";

    return `
      <section class="roadmap-eval-card">
        <div class="roadmap-eval-hero">
          <div>
            <p class="eyebrow">Roadmap evaluation</p>
            <h3>${escapeHtml(baselineLine)}</h3>
            <p>${escapeHtml(gapLine)}</p>
          </div>
          <span class="confidence-pill ${escapeHtml(confidenceClass)}">${escapeHtml(confidence.label)} confidence</span>
        </div>
        <div class="roadmap-eval-grid">
          ${renderRoadmapEvalMetric("Tracked skills", evaluation.skillCount || 0, `${Number(evaluation.testReadyCount || 0)} test-ready`)}
          ${renderRoadmapEvalMetric("Practice attempts", evaluation.practiceAttempts || 0, `${Number(evaluation.attemptsSinceBuild || 0)} since rebuild`)}
          ${renderRoadmapEvalMetric("Tagged errors", evaluation.taggedErrors || 0, evaluation.topError?.label || "No dominant error yet")}
          ${renderRoadmapEvalMetric("Weak clusters", evaluation.weakCount || 0, `${Number(evaluation.masteredCount || 0)} mastered`)}
        </div>
        <div class="roadmap-eval-split">
          <div>
            <h4>Priority skills</h4>
            <ul class="roadmap-mini-list">${priorityList}</ul>
          </div>
          <div>
            <h4>Next review rule</h4>
            <p>${escapeHtml(evaluation.nextReview || "Review after the next meaningful practice block.")}</p>
            <p class="muted">${escapeHtml(confidence.detail || "")}</p>
          </div>
        </div>
        <div class="roadmap-eval-split">
          <div>
            <h4>Risks</h4>
            <ul class="roadmap-mini-list">${risks}</ul>
          </div>
          <div>
            <h4>What to do next</h4>
            <ul class="roadmap-mini-list">${actions}</ul>
          </div>
        </div>
      </section>
    `;
  }

  function confidenceClassName(value) {
    return String(value || "low").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "low";
  }

  function renderEliteReadinessPanel(readiness = {}) {
    const coverage = readiness.coverage || {};
    const checks = (coverage.checks || [])
      .map((item) => {
        const target = Math.max(1, Number(item.target || 1));
        const count = Number(item.count || 0);
        const pct = Math.round(Math.min(count / target, 1) * 100);
        return `
          <div class="coverage-row">
            <span>${escapeHtml(item.label)}</span>
            <strong>${count}/${target}</strong>
            <progress class="mini-progress-bar" max="100" value="${pct}" aria-label="${escapeHtml(item.label)} coverage"></progress>
          </div>
        `;
      })
      .join("");
    const missions = Array.isArray(readiness.missions) && readiness.missions.length
      ? readiness.missions
          .map(
            (mission) => `
              <article class="mission-card">
                <strong>${escapeHtml(mission.title)}</strong>
                <p>${escapeHtml(mission.body)}</p>
              </article>
            `,
          )
          .join("")
      : '<article class="mission-card"><strong>Maintain elite mode</strong><p>Keep weekly hard mixed practice, timed modules, and error-log review.</p></article>';

    return `
      <section class="elite-readiness-card">
        <div class="readiness-main">
          <div class="readiness-score" data-score="${Number(readiness.score || 0)}">
            <strong>${Number(readiness.score || 0)}</strong>
            <span>/100</span>
          </div>
          <div>
            <p class="eyebrow">1600 readiness</p>
            <h3>${escapeHtml(readiness.band || "Collect evidence")}</h3>
            <p>Mastery ${Number(readiness.averageMastery || 0)}% &middot; hard accuracy ${readiness.hardAttempts ? `${Number(readiness.hardAccuracy || 0)}% on ${Number(readiness.hardAttempts || 0)}` : "not measured"} &middot; ${Number(readiness.fullDiagnostics || 0)} full diagnostic${Number(readiness.fullDiagnostics || 0) === 1 ? "" : "s"}.</p>
          </div>
        </div>
        <div class="readiness-grid">
          <div>
            <h4>Coverage check</h4>
            <div class="coverage-list">${checks}</div>
          </div>
          <div>
            <h4>Weekly missions</h4>
            <div class="mission-list">${missions}</div>
          </div>
        </div>
      </section>
    `;
  }

  function renderRemediationQueue(rows = [], context = {}) {
    if (!rows.length) return "";
    const labelFor = context.labelFor || ((value) => value || "Unknown");
    const errorTagLabel = context.errorTagLabel || ((value) => value || "Unknown");
    const formatDate = context.formatDate || ((value) => value || "");
    const lessonScopeKey = context.lessonScopeKey || (() => "");
    return `
      <section class="remediation-queue">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Teach before retest</p>
            <h2>What to relearn, when, and proof item</h2>
          </div>
        </div>
        ${rows
          .map((row) => {
            const proofLabel = row.proofQuestion ? `${row.proofQuestion.difficulty} ${row.proofQuestion.domain}` : row.proofRule;
            const diagnosis = row.tutorDiagnosis || {};
            const scaffold = row.scaffoldDrill || row.remediationV2?.scaffoldDrill || null;
            const passCondition = row.passCondition || row.remediationV2?.proof?.passCondition || null;
            const failAction = row.failAction || row.remediationV2?.failAction || null;
            return `
              <article class="remediation-card status-${escapeHtml(row.status)}">
                <div>
                  <span class="pill">${escapeHtml(labelFor(row.status))}</span>
                  <span class="pill">${escapeHtml(errorTagLabel(row.errorType))}</span>
                  <span class="pill">Due ${escapeHtml(formatDate(row.dueAt))}</span>
                  ${diagnosis.severity ? `<span class="pill">Tutor: ${escapeHtml(diagnosis.severity)}</span>` : ""}
                </div>
                <h3>${escapeHtml(row.skill)}</h3>
                <p>${escapeHtml(row.domain)} - ${escapeHtml(row.difficulty)} - ${escapeHtml(row.lessonTitle)}</p>
                ${
                  diagnosis.label
                    ? `
                      <div class="tutor-diagnosis">
                        <strong>${escapeHtml(diagnosis.label)}</strong>
                        <span>${escapeHtml(diagnosis.rootCause || "")}</span>
                        <span>Teach first: ${escapeHtml(diagnosis.teachFirst || row.lessonTitle)}</span>
                        ${scaffold ? `<span>Scaffold: ${escapeHtml(scaffold.title || scaffold.kind)} - ${escapeHtml(scaffold.prompt || "")}</span>` : ""}
                        <span>Proof target: ${escapeHtml(diagnosis.proofTarget || row.proofRule)}</span>
                        ${passCondition ? `<span>Pass condition: ${escapeHtml(passCondition.condition || "")}</span>` : ""}
                        ${failAction ? `<span>Fail route: ${escapeHtml(failAction.action || "")}</span>` : ""}
                      </div>
                    `
                    : ""
                }
                <p>${escapeHtml(row.action)}</p>
                <p class="muted">Proof: ${escapeHtml(proofLabel)}</p>
                <div class="answer-actions">
                  <button class="button secondary remediation-open-lesson" type="button" data-scope-key="${escapeHtml(lessonScopeKey(row))}">Open Lesson</button>
                  <button class="button secondary remediation-reviewed" type="button" data-attempt-id="${escapeHtml(row.attemptId)}" data-lesson-task-key="${escapeHtml(row.lessonTaskKey || "")}">Lesson Reviewed</button>
                  <button class="button primary remediation-proof" type="button" data-attempt-id="${escapeHtml(row.attemptId)}" data-proof-question-id="${escapeHtml(row.proofQuestionId || "")}" ${row.proofQuestionId ? "" : "disabled"}>Proof Now</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </section>
    `;
  }

  function splitQuestionPrompt(prompt = "") {
    const normalized = String(prompt || "").trim();
    const parts = normalized.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return {
        passage: parts.slice(0, -1).join("\n\n"),
        ask: parts[parts.length - 1],
      };
    }
    const match = normalized.match(/([\s\S]+?)(Which choice[\s\S]+)$/i);
    if (match) {
      return { passage: match[1].trim(), ask: match[2].trim() };
    }
    return { passage: normalized, ask: "" };
  }

  function shouldUseSplitStem(question = {}) {
    return question?.section === "Reading and Writing" && splitQuestionPrompt(question.prompt).passage.length >= 80;
  }

  function renderQuestionStem(question = {}) {
    if (!shouldUseSplitStem(question)) return renderInlineText(question.prompt || "");
    const parts = splitQuestionPrompt(question.prompt);
    return `
      <div class="split-question-layout">
        <div class="passage-pane">${renderInlineText(parts.passage)}</div>
        <div class="question-pane">${renderInlineText(parts.ask || "Choose the best answer.")}</div>
      </div>
    `;
  }

  function renderAnswerInputHtml(question = {}, name = "answer", context = {}) {
    const isGridInQuestion = context.isGridInQuestion || ((item) => ["student_produced_response", "grid_in", "numeric"].includes(item?.questionType));
    if (isGridInQuestion(question)) {
      return `
        <label class="grid-response-option">
          <span class="choice-key">#</span>
          <span class="grid-response-body">
            <strong>Enter your answer</strong>
            <input class="grid-response-input" name="${escapeHtml(name)}" type="text" inputmode="decimal" autocomplete="off" placeholder="Example: 7, 3/4, or 0.75" />
            <small>Student-produced response. Fractions and equivalent decimals are accepted when listed.</small>
          </span>
        </label>
      `;
    }

    return Object.entries(question.choices || {})
      .map(
        ([key, text]) => `
          <label class="answer-option" data-choice="${escapeHtml(key)}">
            <input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(key)}">
            <span class="choice-key">${escapeHtml(key)}</span>
            <span class="choice-text">${renderInlineText(text)}</span>
            <button class="eliminate-choice" type="button" data-choice="${escapeHtml(key)}" title="Strike through ${escapeHtml(key)}" aria-label="Strike through ${escapeHtml(key)}">x</button>
          </label>
        `,
      )
      .join("");
  }

  function defaultRenderExplanation(value) {
    if (richText?.renderExplanation) return richText.renderExplanation(value);
    return escapeHtml(value || "No explanation recorded.");
  }

  function renderPracticeSessionEndedFeedback(session = {}) {
    const mode = session.mode || "Practice session";
    const endedByTime = session.reason === "time_expired" || session.endedByTime;
    return `
      <strong>${escapeHtml(mode)} ended</strong>
      <p>${endedByTime ? "Time expired." : "Session ended."} Review the Exam Review Report before starting another set.</p>
    `;
  }

  function studentLessonRuleText(lesson = {}, vi = false) {
    if (!vi) return lesson.rule || "Review the rule, then prove the skill with a transfer question.";
    return "Đọc lại quy tắc của kỹ năng này, xác định chính xác đề đang hỏi gì, rồi chứng minh đáp án bằng dữ kiện trong câu hỏi.";
  }

  function studentLessonTrapText(lesson = {}, vi = false, correct = false) {
    if (!vi) {
      if (Array.isArray(lesson.traps) && lesson.traps.length) return lesson.traps[0];
      return correct ? "Do not rush; keep the same proof steps." : "Wrong choices often match the topic but miss a condition.";
    }
    return correct
      ? "Giữ đúng bước giải; đừng tăng tốc đến mức bỏ qua kiểm tra cuối."
      : "Đáp án sai thường trông hợp lý vì giống chủ đề, nhưng thiếu điều kiện hoặc bằng chứng trực tiếp.";
  }

  function studentLessonStepLines(lesson = {}, vi = false) {
    if (!vi) {
      if (Array.isArray(lesson.steps) && lesson.steps.length) return lesson.steps.map((step) => `${step?.[0] || "Step"}: ${step?.[1] || ""}`.trim());
      return ["Mark the task, find the proof, then choose."];
    }
    return [
      "Gạch đúng yêu cầu đề hỏi.",
      "Tìm dữ kiện, công thức, hoặc bằng chứng trước khi nhìn đáp án.",
      "Sau khi chọn, tự nói vì sao 3 đáp án còn lại sai.",
    ];
  }

  function studentLessonProofText(lesson = {}, vi = false) {
    if (!vi) return lesson.drill || "Pass one fresh same-skill question.";
    return "Làm đúng một câu mới cùng kỹ năng, đúng nhịp, và tự giải thích được vì sao đáp án đúng.";
  }

  function renderKnowledgeReviewCard(question = {}, lesson = {}, context = {}) {
    const resourcesHtml = context.resourcesHtml || "";
    const vi = context.language === "vi";
    const stepLines = studentLessonStepLines(lesson, vi);
    return `
      <section class="knowledge-review-card">
        <div>
          <span class="draft-label">${vi ? "Ôn quy tắc" : "Stop and review"}</span>
          <h3>${escapeHtml(lesson.title || `Review: ${question.skill || "this skill"}`)}</h3>
          <p>${escapeHtml(studentLessonRuleText(lesson, vi))}</p>
        </div>
        <div class="knowledge-review-grid">
          ${stepLines
            .map((line, index) => `<div><strong>${vi ? `Bước ${index + 1}` : `Step ${index + 1}`}</strong><span>${escapeHtml(line)}</span></div>`)
            .join("")}
        </div>
        <div class="knowledge-mini-drill">
          <strong>${vi ? "Check nhanh trước khi làm tiếp" : "Quick check before continuing"}</strong>
          <span>${escapeHtml(studentLessonProofText(lesson, vi))}</span>
        </div>
        ${resourcesHtml ? `<div class="knowledge-resource-strip">${resourcesHtml}</div>` : ""}
        <div class="answer-actions">
          <button class="button secondary" id="review-same-skill" type="button">${vi ? "Luyện cùng kỹ năng" : "Practice same skill"}</button>
          <button class="button secondary" id="save-concept-note" type="button">${vi ? "Lưu ghi chú quy tắc" : "Save concept note"}</button>
          <button class="button primary" id="acknowledge-knowledge-review" type="button">${vi ? "Đã ôn quy tắc" : "I reviewed this"}</button>
        </div>
      </section>
    `;
  }

  function renderPracticeFeedback(question = {}, result = {}, context = {}) {
    const correct = Boolean(result.correct);
    const attempt = result.attempt || {};
    const vi = context.language === "vi";
    const studentMode = Boolean(context.studentMode);
    const lesson = result.lesson || {};
    const selectedAnswer = result.selectedAnswer || attempt.selectedAnswer || "";
    const isGridInQuestion = context.isGridInQuestion || ((item) => ["student_produced_response", "grid_in", "numeric"].includes(item?.questionType));
    const getCorrectAnswerLabel = context.getCorrectAnswerLabel || ((item) => item?.correctAnswer || "");
    const pacingLabel = context.pacingLabel || ((value) => value || "Pacing");
    const targetSecondsForQuestion = context.targetSecondsForQuestion || (() => 0);
    const renderExplanation = context.renderExplanation || defaultRenderExplanation;
    const knowledgeReviewHtml = result.knowledgeReviewHtml || "";
    const tutorExplanationHtml = result.tutorExplanationLayer ? renderTutorExplanationLayer(result.tutorExplanationLayer, { vi }) : "";
    const pacingText = pacingLabelForFeedback(attempt.pacingFlag, vi, pacingLabel);
    const pacingHtml = attempt.timeSpentSeconds
      ? `<p>${escapeHtml(pacingText)}: ${Number(attempt.timeSpentSeconds)}s. ${vi ? "Mục tiêu câu này: khoảng" : "Target for this item: about"} ${Number(targetSecondsForQuestion(question))}s.</p>`
      : "";
    const gridHtml = isGridInQuestion(question)
      ? `<p>${vi ? "Đáp án được chấp nhận" : "Accepted answer"}: <strong>${escapeHtml(getCorrectAnswerLabel(question))}</strong></p>`
      : "";
    const learningHtml = renderPracticeLearningSummary({ correct, lesson, studentMode, vi });
    const noteActionHtml =
      !correct && studentMode
        ? `<div class="answer-actions feedback-next-actions"><button class="button secondary" type="button" data-create-mistake-note>${vi ? "Tạo ghi chú từ lỗi này" : "Create mistake note"}</button></div>`
        : "";

    return `
      <strong>${correct ? (vi ? "Đúng" : "Correct") : (vi ? "Cần ôn lại" : "Needs review")}</strong>
      ${pacingHtml}
      ${gridHtml}
      ${learningHtml}
      ${tutorExplanationHtml}
      <div class="rich-explanation">${renderExplanation(question.explanation, selectedAnswer)}</div>
      ${noteActionHtml}
      ${!correct ? knowledgeReviewHtml : ""}
    `;
  }

  function renderPracticeLearningSummary({ correct, lesson = {}, studentMode = false, vi = false } = {}) {
    if (!studentMode) return "";
    const rule = studentLessonRuleText(lesson, vi);
    const trap = studentLessonTrapText(lesson, vi, correct);
    const method = studentLessonStepLines(lesson, vi).slice(0, 2).join(" ");
    const next = correct
      ? (vi ? "Tiếp tục câu kế tiếp hoặc tăng độ khó nếu làm đúng đúng nhịp." : "Continue to the next item or raise difficulty if on pace.")
      : (vi ? "Tạo ghi chú lỗi, đọc quy tắc, rồi làm một câu chứng minh cùng kỹ năng." : "Create a mistake note, review the rule, then pass a same-skill proof.");
    return `
      <section class="feedback-learning-summary">
        <div><span>${vi ? "Quy tắc" : "Rule"}</span><p>${escapeHtml(rule)}</p></div>
        <div><span>${vi ? "Bẫy" : "Trap"}</span><p>${escapeHtml(trap)}</p></div>
        <div><span>${vi ? "Cách làm nhanh" : "Fast method"}</span><p>${escapeHtml(method)}</p></div>
        <div><span>${vi ? "Tiếp theo" : "Next"}</span><p>${escapeHtml(next)}</p></div>
      </section>
    `;
  }

  function pacingLabelForFeedback(value, vi, pacingLabel) {
    const raw = pacingLabel(value);
    if (!vi) return raw;
    const map = {
      on_pace: "Đúng nhịp",
      slow_correct: "Đúng nhưng chậm",
      fast_wrong: "Sai do vội",
      time_pressure: "Áp lực thời gian",
      skipped: "Bỏ trống",
    };
    return map[value] || map[String(raw || "").toLowerCase().replace(/\s+/g, "_")] || raw;
  }

  function renderTutorExplanationLayer(layer = {}, options = {}) {
    if (!layer || !layer.title) return "";
    const vi = Boolean(options.vi);
    const choice = layer.choiceAnalysis || {};
    const scaffold = layer.scaffoldDrill || {};
    const proof = layer.proof || {};
    const lesson = layer.lesson || {};
    const hints = Array.isArray(layer.hintSteps) ? layer.hintSteps : [];
    const trapCoaching = layer.selectedTrapCoaching || {};
    const selectedText = layer.selectedAnswerText ? `: ${layer.selectedAnswerText}` : "";
    const correctText = layer.correctAnswerText ? `: ${layer.correctAnswerText}` : "";
    return `
      <section class="ai-tutor-layer" data-tutor-provider="${escapeHtml(layer.provider?.mode || "local_rule_based")}">
        <div class="ai-tutor-layer-header">
          <span class="draft-label">${vi ? "Trợ giảng" : "AI Tutor"}</span>
          <strong>${escapeHtml(layer.title)}</strong>
          <span class="confidence-pill">${escapeHtml(layer.errorLabel || layer.errorType || (vi ? "Cần ôn" : "Review"))}</span>
        </div>
        <div class="ai-tutor-choice-grid">
          <div>
            <span>${vi ? "Mình chọn" : "Selected answer"}</span>
            <strong>${escapeHtml(layer.selectedAnswer || (vi ? "Không trả lời" : "No answer"))}${escapeHtml(selectedText)}</strong>
          </div>
          <div>
            <span>${vi ? "Đáp án đúng" : "Verified answer"}</span>
            <strong>${escapeHtml(layer.correctAnswer || (vi ? "Đáp án đã ghi" : "Recorded answer"))}${escapeHtml(correctText)}</strong>
          </div>
        </div>
        <div class="ai-tutor-explain">
          <strong>${vi ? "Vì sao dễ chọn sai" : "Why this was tempting"}</strong>
          <p>${escapeHtml(choice.likelyReason || layer.whyLikely || (vi ? "Lựa chọn này cần kiểm tra lại bằng proof." : "This choice needs a proof check."))}</p>
          ${choice.selectedRationale ? `<p>${escapeHtml(choice.selectedRationale)}</p>` : ""}
          ${trapCoaching.repairMove ? `<p><strong>${vi ? "Bước sửa" : "Repair move"}:</strong> ${escapeHtml(trapCoaching.repairMove)}</p>` : ""}
        </div>
        ${
          hints.length
            ? `<div class="ai-tutor-hints">
                <strong>${vi ? "Gợi ý từng bước" : "Progressive hints"}</strong>
                <ol>
                  ${hints
                    .map((hint) => `<li><span>${escapeHtml(hint.title || "")}</span><p>${escapeHtml(hint.prompt || "")}</p></li>`)
                    .join("")}
                </ol>
              </div>`
            : ""
        }
        <div class="ai-tutor-next-grid">
          <div>
            <span>${vi ? "Gốc lỗi" : "Root cause"}</span>
            <strong>${escapeHtml(layer.rootCause || (vi ? "Cần ôn lại." : "Review needed."))}</strong>
          </div>
          <div>
            <span>${vi ? "Bài cần ôn" : "Lesson"}</span>
            <strong>${escapeHtml(lesson.title || (vi ? "Ôn kỹ năng mục tiêu." : "Review the target skill."))}</strong>
          </div>
          <div>
            <span>${vi ? "Bài dẫn" : "Scaffold"}</span>
            <strong>${escapeHtml(vi ? "Luyện lại từng bước" : scaffold.title || "Scaffold drill")}</strong>
            <p>${escapeHtml(scaffold.prompt || layer.studentPrompt || (vi ? "Làm một bước dựng lại ngắn trước khi retest." : "Do a short rebuild before retesting."))}</p>
          </div>
          <div>
            <span>${vi ? "Chứng minh" : "Proof"}</span>
            <strong>${escapeHtml(vi ? "Làm đúng một câu mới cùng kỹ năng." : proof.target || proof.passCondition?.condition || "Pass one fresh proof question.")}</strong>
            ${proof.questionId ? `<p>${vi ? "Câu chứng minh" : "Proof question"}: ${escapeHtml(proof.questionId)}</p>` : ""}
          </div>
        </div>
      </section>
    `;
  }

  function renderPracticeBadge(text, className = "", context = {}) {
    const labelFor = context.labelFor || ((value) => value || "Unknown");
    return `<span class="badge ${escapeHtml(className)}">${escapeHtml(labelFor(text))}</span>`;
  }

  function renderPracticeQuestionNavigator(items = []) {
    if (!Array.isArray(items) || !items.length) return "";
    return `
      <section class="practice-nav-shell" aria-label="Practice question navigator">
        <div class="practice-nav-grid">
          ${items
            .map((item) => {
              const classes = ["practice-nav-button"];
              if (item.current) classes.push("current");
              if (item.answered) classes.push("answered");
              if (item.marked) classes.push("marked");
              if (item.skipped) classes.push("skipped");
              const status = [
                item.current ? "current" : "",
                item.answered ? "answered" : "",
                item.marked ? "marked" : "",
                item.skipped ? "skipped" : "",
              ]
                .filter(Boolean)
                .join(", ");
              return `
                <button class="${classes.join(" ")}" type="button" data-practice-index="${Number(item.index || 0)}" aria-label="Question ${Number(item.index || 0) + 1}${status ? `, ${escapeHtml(status)}` : ""}">
                  <span>${Number(item.index || 0) + 1}</span>
                  ${item.marked ? "<small>M</small>" : ""}
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function renderPracticeQuestionView(question = null, context = {}) {
    const index = Number(context.index || 0);
    const total = Number(context.total || 0);
    const labelFor = context.labelFor || ((value) => value || "Unknown");
    const studentMode = Boolean(context.studentMode);
    if (!question) {
      return {
        empty: true,
        counterText: "Question 0 of 0",
        skillText: "No question matched",
        badgesHtml: "",
        stemHtml: '<div class="empty-state">No questions match the current filters.</div>',
        splitStem: false,
        sourceText: "-",
        licenseText: "-",
        resourceLinksHtml: '<div class="empty-state">Choose a question to see Khan and Bluebook links for this skill.</div>',
      };
    }
    const badgesHtml = studentMode
      ? [
          renderPracticeBadge(question.section, "", { labelFor }),
          renderPracticeBadge(question.difficulty, "", { labelFor }),
          context.targetSeconds ? renderPracticeBadge(`Target ${Number(context.targetSeconds)}s`, "target-time", { labelFor: (value) => value }) : "",
          question.section === "Math" ? renderPracticeBadge("Desmos", "math-tool", { labelFor: (value) => value }) : "",
        ].join("")
      : [
          renderPracticeBadge(question.difficulty, "", { labelFor }),
          renderPracticeBadge(question.reviewStatus, question.reviewStatus, { labelFor }),
          renderPracticeBadge(labelFor(question.sourceType), "", { labelFor: (value) => value }),
          context.targetSeconds ? renderPracticeBadge(`Target ${Number(context.targetSeconds)}s`, "target-time", { labelFor: (value) => value }) : "",
          question.section === "Math" ? renderPracticeBadge("Desmos", "math-tool", { labelFor: (value) => value }) : "",
        ].join("");
    return {
      empty: false,
      counterText: `Question ${index + 1} of ${total}`,
      skillText: [question.domain, question.skill].filter(Boolean).join(" - "),
      badgesHtml,
      stemHtml: renderQuestionStem(question),
      splitStem: shouldUseSplitStem(question),
      sourceText: studentMode ? "" : question.sourceName || labelFor(question.sourceType),
      licenseText: studentMode ? "" : question.licenseNote || "No license note recorded",
      resourceLinksHtml: "",
    };
  }

  function averageNumber(values = []) {
    const clean = values.map(Number).filter(Number.isFinite);
    if (!clean.length) return 0;
    return clean.reduce((sum, value) => sum + value, 0) / clean.length;
  }

  function renderPacingAnalyticsPanel(attempts = [], context = {}) {
    const getQuestionById = context.getQuestionById || (() => null);
    const pacingLabel = context.pacingLabel || ((value) => value || "Pacing");
    const rows = (attempts || []).filter((attempt) => !attempt.fromPretest && Number(attempt.timeSpentSeconds));
    if (!rows.length) return '<div class="empty-state">Pacing appears after timed practice attempts.</div>';
    const last = rows[rows.length - 1];
    const avg = Math.round(averageNumber(rows.map((attempt) => Number(attempt.timeSpentSeconds) || 0)));
    const slowCorrect = rows.filter((attempt) => attempt.pacingFlag === "slow_correct" || attempt.errorType === "slow_correct").length;
    const fastWrong = rows.filter((attempt) => attempt.pacingFlag === "fast_wrong").length;
    const timePressure = rows.filter((attempt) => attempt.pacingFlag === "time_pressure" || attempt.errorType === "time_pressure").length;
    const lastQuestion = getQuestionById(last.questionId);
    return `
      <div class="pacing-grid">
        <div><strong>${avg}s</strong><span>average</span></div>
        <div><strong>${slowCorrect}</strong><span>slow correct</span></div>
        <div><strong>${fastWrong}</strong><span>fast wrong</span></div>
        <div><strong>${timePressure}</strong><span>time pressure</span></div>
      </div>
      <p class="muted">Last: ${escapeHtml(lastQuestion?.skill || "Question")} &middot; ${Number(last.timeSpentSeconds || 0)}s &middot; ${escapeHtml(pacingLabel(last.pacingFlag))}</p>
    `;
  }

  function renderLessonList(lessons = [], activeLessonKey = "") {
    if (!lessons.length) return '<div class="empty-state">No lessons match this filter yet.</div>';
    return lessons
      .slice(0, 40)
      .map(
        (lesson) => `
          <button class="lesson-list-card ${lesson.key === activeLessonKey ? "active" : ""}" type="button" data-lesson-key="${escapeHtml(lesson.key)}">
            <span>Current: ${escapeHtml(lesson.stage)} - Path: Pre-SAT -> 1600</span>
            <strong>${escapeHtml(lesson.skill)}</strong>
            <small>${escapeHtml(lesson.domain)} - ${(lesson.questions || []).length} questions - ${Number(lesson.queueCount || 0)} queue</small>
          </button>
        `,
      )
      .join("");
  }

  function renderLessonDetail(lesson = null, context = {}) {
    if (!lesson) return '<div class="empty-state">Choose a lesson to begin.</div>';
    const labelFor = context.labelFor || ((value) => value || "Unknown");
    const resourcesHtml = context.resourcesHtml || "";
    const ladder = (lesson.ladder || [])
      .map(
        (row) => `
          <article class="${row.active ? "active" : ""}">
            <strong>${escapeHtml(row.stage)}</strong>
            <span>${escapeHtml(row.goal)}</span>
            <small>Exit: ${escapeHtml(row.exit)}</small>
          </article>
        `,
      )
      .join("");
    const steps = (lesson.steps || []).map((step) => `<div><strong>${escapeHtml(step?.[0] || "")}</strong><span>${escapeHtml(step?.[1] || "")}</span></div>`).join("");
    const traps = (lesson.traps || []).map((trap) => `<li>${escapeHtml(trap)}</li>`).join("");
    const scaffold = (lesson.scaffold || []).length
      ? lesson.scaffold
          .map((question, index) => `<span>${index + 1}. ${escapeHtml(question.difficulty)} - ${escapeHtml(labelFor(question.sourceType))}</span>`)
          .join("")
      : "<span>No scaffold questions available yet for this exact skill.</span>";
    const subskills = (lesson.subskills || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    const drillCards = (lesson.scaffoldDrills || [])
      .map(
        (drill) => `
          <article>
            <strong>${escapeHtml(drill.title || drill.id || "Scaffold drill")}</strong>
            <span>${escapeHtml(drill.instructions || "")}</span>
            <small>${Number(drill.count || 0)} item target${drill.questionIds?.length ? ` - ${Number(drill.questionIds.length)} linked` : ""}</small>
          </article>
        `,
      )
      .join("");
    const proofCards = (lesson.proofDrills || [])
      .map(
        (drill) => `
          <article>
            <strong>${escapeHtml(drill.title || drill.id || "Proof drill")}</strong>
            <span>${escapeHtml(drill.passCondition || drill.instructions || "")}</span>
            <small>${Number(drill.count || 0)} proof target${drill.questionIds?.length ? ` - ${Number(drill.questionIds.length)} linked` : ""}</small>
          </article>
        `,
      )
      .join("");
    const externalTargets = (lesson.externalLinkTargets || [])
      .map((target) => `<span>${escapeHtml(target.provider || "External")} - ${escapeHtml(target.intent || "")}: ${escapeHtml(target.match || "")}</span>`)
      .join("");
    const stagePlaybook = (lesson.stagePlaybook || [])
      .map(
        (row) => `
          <article class="${row.active ? "active" : ""}">
            <strong>${escapeHtml(row.stage)}</strong>
            <span>${escapeHtml(row.focus)}</span>
            <small>Drill: ${escapeHtml(row.drill)}</small>
            <small>Pass: ${escapeHtml(row.pass)}</small>
          </article>
        `,
      )
      .join("");
    return `
      <div class="lesson-detail-hero">
        <div>
          <p class="eyebrow">${escapeHtml(lesson.section)} - ${escapeHtml(lesson.domain)}</p>
          <h2>${escapeHtml(lesson.skill)}</h2>
          <p>${escapeHtml(lesson.stage)} - ${lesson.mastery === null || lesson.mastery === undefined ? "no mastery data yet" : `${Number(lesson.mastery)}% mastery`} - ${escapeHtml(lesson.status)}</p>
        </div>
        <div class="lesson-hero-pills">
          <span class="confidence-pill">${Number(lesson.queueCount || 0)} remediation task${Number(lesson.queueCount || 0) === 1 ? "" : "s"}</span>
          <span class="confidence-pill">${Number(lesson.coverageScore || 0)}% lesson depth</span>
        </div>
      </div>
      <div class="lesson-ladder">${ladder}</div>
      <section class="lesson-subskill-card">
        <h3>Subskill map</h3>
        <div class="lesson-chip-grid">${subskills}</div>
      </section>
      <section class="lesson-stage-card">
        <h3>Stage playbook</h3>
        <div class="lesson-stage-grid">${stagePlaybook}</div>
      </section>
      <section class="lesson-rule-card">
        <h3>Concept</h3>
        <p>${escapeHtml(lesson.rule)}</p>
        <div class="knowledge-review-grid">${steps}</div>
      </section>
      <section class="lesson-example-card">
        <h3>Worked example pattern</h3>
        <p>${escapeHtml(lesson.example)}</p>
        <strong>Micro-check</strong>
        <span>${escapeHtml(lesson.drill)}</span>
      </section>
      <section class="lesson-trap-card">
        <h3>Likely traps</h3>
        <ul>${traps}</ul>
      </section>
      <section class="lesson-scaffold-card">
        <h3>Scaffold drill</h3>
        ${drillCards ? `<div class="lesson-stage-grid">${drillCards}</div>` : ""}
        <div>${scaffold}</div>
        <div class="answer-actions">
          <button class="button primary lesson-start-drill" type="button" data-lesson-key="${escapeHtml(lesson.key)}">Start Scaffold Drill</button>
          <button class="button secondary lesson-save-note" type="button" data-lesson-key="${escapeHtml(lesson.key)}">Save Lesson Note</button>
          <button class="button secondary lesson-add-review" type="button" data-lesson-key="${escapeHtml(lesson.key)}">Add To Review</button>
        </div>
      </section>
      ${proofCards ? `<section class="lesson-stage-card"><h3>Proof drills</h3><div class="lesson-stage-grid">${proofCards}</div></section>` : ""}
      ${externalTargets ? `<section class="lesson-resource-card"><h3>External link targets</h3><div class="lesson-chip-grid">${externalTargets}</div></section>` : ""}
      ${resourcesHtml ? `<section class="lesson-resource-card"><h3>Related learning</h3>${resourcesHtml}</section>` : ""}
    `;
  }

  function renderTopicSummary(summary = {}) {
    return `
      <div class="topic-summary-grid">
        <div><strong>${Number(summary.count || 0)}</strong><span>questions matched</span></div>
        <div><strong>${Number(summary.reviewed || 0)}</strong><span>reviewed</span></div>
        <div><strong>${Number(summary.needsReview || 0)}</strong><span>need review</span></div>
      </div>
      <p class="muted">Scope: ${escapeHtml(summary.skillLabel || "All skills")} &middot; Source: ${escapeHtml(summary.sourceLabels || "No source")}</p>
    `;
  }

  function renderTopicCards(cards = []) {
    if (!cards.length) return '<div class="empty-state">No topics match the current scope.</div>';
    return cards
      .map(
        (card) => `
          <article class="topic-card">
            <div>
              <p class="eyebrow">${escapeHtml(card.section)}</p>
              <h3>${escapeHtml(card.skill)}</h3>
              <p>${escapeHtml(card.domain)}</p>
            </div>
            <div class="topic-card-meta">
              <span class="pill">${Number(card.count || 0)} questions</span>
              <span class="pill">${Number(card.reviewed || 0)} reviewed</span>
              <span class="pill">${Number(card.needsReview || 0)} need review</span>
            </div>
            <button
              class="button secondary topic-card-button"
              type="button"
              data-section="${escapeHtml(card.section)}"
              data-domain="${escapeHtml(card.domain)}"
              data-skill="${escapeHtml(card.skill)}"
            >Practice</button>
          </article>
        `,
      )
      .join("");
  }

  function renderExamMetric(label, value) {
    return `<article><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></article>`;
  }

  function renderExamReadinessSignal(signal = null) {
    if (!signal) return "";
    return `
      <section class="exam-readiness-signal">
        <div>
          <p class="eyebrow">Readiness signal</p>
          <h3>${escapeHtml(signal.label || "Targeted practice next")}</h3>
          <p>${escapeHtml(signal.detail || "")}</p>
        </div>
        <strong>${escapeHtml(signal.nextAction || "")}</strong>
      </section>
    `;
  }

  function renderExamPacingProfile(profile = null) {
    if (!profile) return "";
    const delta = Number(profile.budgetDelta || 0);
    return `
      <section class="exam-pacing-profile">
        <div>
          <p class="eyebrow">Pacing profile</p>
          <h3>${escapeHtml(profile.label || "Pacing")}</h3>
          <p>${delta >= 0 ? `${delta}s under target budget` : `${Math.abs(delta)}s over target budget`} &middot; ${Number(profile.onPaceRate || 0)}% on pace</p>
        </div>
        <div class="exam-mini-metrics">
          ${renderExamMetric("Over target", profile.overTarget || 0)}
          ${renderExamMetric("Fast wrong", profile.fastWrong || 0)}
          ${renderExamMetric("Slow correct", profile.slowCorrect || 0)}
        </div>
      </section>
    `;
  }

  function renderExamDomainBreakdown(rows = []) {
    if (!rows.length) return "";
    return `
      <section class="exam-domain-breakdown">
        <h3>Domain breakdown</h3>
        <div class="exam-domain-grid">
          ${rows
            .slice(0, 6)
            .map(
              (row) => `
                <article>
                  <strong>${escapeHtml(row.domain)}</strong>
                  <span>${escapeHtml(row.section)} &middot; ${Number(row.correct || 0)}/${Number(row.attempted || row.total || 0)} correct &middot; ${Number(row.accuracy || 0)}%</span>
                  <small>Avg ${Number(row.avgSeconds || 0)}s &middot; skipped ${Number(row.skipped || 0)} &middot; pacing ${Number(row.pacingDelta || 0) >= 0 ? "+" : ""}${Number(row.pacingDelta || 0)}s</small>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderExamPriorityQueue(rows = [], context = {}) {
    if (!rows.length) return "";
    const errorTagLabel = context.errorTagLabel || ((value) => value || "Pacing");
    return `
      <section class="exam-priority-queue">
        <h3>Review priority queue</h3>
        <div class="exam-priority-list">
          ${rows
            .map(
              (row) => `
                <article>
                  <strong>#${Number(row.index || 0)} ${escapeHtml(row.skill)}</strong>
                  <span>${escapeHtml(row.reviewPriority?.reason || "Review this item.")}</span>
                  <small>${escapeHtml(row.domain)} &middot; ${escapeHtml(row.errorType ? errorTagLabel(row.errorType) : row.pacingLabel)}</small>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderExamCoachPlan(plan = null) {
    if (!plan) return "";
    const weekly = (plan.weeklyPlan || [])
      .map(
        (item) => `
          <article>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.action)}</span>
          </article>
        `,
      )
      .join("");
    return `
      <section class="exam-coach-plan">
        <div>
          <p class="eyebrow">Tutor brain</p>
          <h3>${escapeHtml(plan.summary || "Review this session before more practice.")}</h3>
          <p>${escapeHtml(plan.nextBestAction || "Choose one concrete follow-up action.")}</p>
        </div>
        <div class="coach-plan-grid">${weekly}</div>
      </section>
    `;
  }

  function renderExamMistakeLedger(rows = [], context = {}) {
    const errorTagLabel = context.errorTagLabel || ((value) => value || "Unknown");
    const formatDate = context.formatDate || ((value) => value || "");
    const formatDateTime = context.formatDateTime || ((value) => value || "");
    if (!rows.length) {
      return `
        <section class="mistake-ledger-card">
          <h3>Mistake ledger</h3>
          <p class="muted">No wrong, slow, skipped, or marked attempts in this session.</p>
        </section>
      `;
    }
    const items = rows
      .map(
        (row) => `
          <article class="mistake-ledger-row status-${escapeHtml(row.status || "open")}">
            <div>
              <strong>${escapeHtml(row.skill)}</strong>
              <span>${escapeHtml(row.domain)} &middot; ${escapeHtml(row.difficulty)} &middot; ${escapeHtml(errorTagLabel(row.errorType))}</span>
            </div>
            <div>
              <span>Chose ${escapeHtml(row.selectedAnswer || "none")} / correct ${escapeHtml(row.correctAnswer || "--")}</span>
              <span>${row.timeSpentSeconds ? `${Number(row.timeSpentSeconds)}s &middot; ` : ""}${escapeHtml(row.taggedBy)} &middot; ${escapeHtml(formatDateTime(row.taggedAt))}</span>
            </div>
            <p>${escapeHtml(row.remediationAction)}</p>
            <small>${row.remediated ? "Proof passed on a later attempt." : `Due ${escapeHtml(formatDate(row.dueAt || row.at))}.`}</small>
          </article>
        `,
      )
      .join("");
    return `
      <section class="mistake-ledger-card">
        <div class="mistake-ledger-heading">
          <div>
            <p class="eyebrow">Mistake ledger</p>
            <h3>Who tagged the issue, when, and what must happen next</h3>
          </div>
        </div>
        <div class="mistake-ledger-list">${items}</div>
      </section>
    `;
  }

  function renderExamReviewRow(row = {}, context = {}) {
    const errorTagLabel = context.errorTagLabel || ((value) => value || "Pacing");
    const resultClass = !row.attempted ? "skipped" : row.correct ? "correct" : "wrong";
    const result = !row.attempted ? "Skipped" : row.correct ? "Correct" : "Wrong";
    const time = row.attempted ? `${Number(row.timeSpentSeconds || 0)}s / ${Number(row.targetSeconds || 0)}s` : "--";
    const marked = row.markedForReview ? " / marked" : "";
    return `
      <div class="exam-review-row ${resultClass}" role="row">
        <span>${Number(row.index || 0)}</span>
        <span><strong>${escapeHtml(result)}</strong>${escapeHtml(marked)}</span>
        <span>${escapeHtml(time)}<small>${escapeHtml(row.pacingLabel)}</small></span>
        <span>${escapeHtml(row.skill)}<small>${escapeHtml(row.domain)}</small></span>
        <span>${escapeHtml(row.errorType ? errorTagLabel(row.errorType) : row.pacingLabel)}</span>
        <span>${escapeHtml(row.masteryStage)}${row.mastery === null || row.mastery === undefined ? "" : `<small>${Number(row.mastery)}% mastery</small>`}</span>
        <span>${escapeHtml(row.recommendation)}</span>
      </div>
    `;
  }

  function renderExamSkillFocus(skillGroups = []) {
    const topSkills = (skillGroups || []).slice(0, 4);
    if (!topSkills.length) {
      return '<article><strong>No skill focus yet</strong><span>Answer at least one item to generate recommendations.</span></article>';
    }
    return topSkills
      .map(
        (skill) => `
          <article>
            <strong>${escapeHtml(skill.skill)}</strong>
            <span>${escapeHtml(skill.masteryStage)} &middot; ${Number(skill.correct || 0)}/${Number(skill.total || 0)} correct &middot; avg ${Number(skill.avgSeconds || 0)}s</span>
            <p>${escapeHtml(skill.recommendation)}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderExamReviewReport(report = null, context = {}) {
    if (!report) return "";
    const formatDateTime = context.formatDateTime || ((value) => value || "");
    const issue = report.issueCounts || {};
    const rows = (report.rows || []).map((row) => renderExamReviewRow(row, context)).join("");
    const coachPlan = renderExamCoachPlan(report.coachPlan);
    const readiness = renderExamReadinessSignal(report.readinessSignal);
    const pacing = renderExamPacingProfile(report.pacingProfile);
    const domainBreakdown = renderExamDomainBreakdown(report.domainBreakdown || []);
    const priorityQueue = renderExamPriorityQueue(report.reviewPriorityQueue || [], context);
    const mistakeLedger = renderExamMistakeLedger(report.mistakeLedger || [], context);
    return `
      <section class="exam-report-card">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Exam Review Report</p>
            <h2>${escapeHtml(report.mode)} &middot; ${Number(report.correct || 0)}/${Number(report.totalQuestions || 0)} correct &middot; ${Number(report.accuracy || 0)}%</h2>
            <p class="muted">Ended ${escapeHtml(formatDateTime(report.endedAt))}. Attempted ${Number(report.attempted || 0)}/${Number(report.totalQuestions || 0)}; average ${Number(report.avgSeconds || 0)}s per answered item.</p>
          </div>
        </div>
        <div class="exam-report-metrics">
          ${renderExamMetric("Wrong", issue.wrong || 0)}
          ${renderExamMetric("Skipped", issue.skipped || 0)}
          ${renderExamMetric("Slow correct", issue.slowCorrect || 0)}
          ${renderExamMetric("Time pressure", issue.timePressure || 0)}
          ${renderExamMetric("Marked", issue.marked || 0)}
        </div>
        ${readiness}
        ${pacing}
        ${coachPlan}
        ${priorityQueue}
        ${domainBreakdown}
        <div class="exam-report-focus">
          <h3>Next study focus</h3>
          <div class="exam-skill-focus">
            ${renderExamSkillFocus(report.skillGroups || [])}
          </div>
        </div>
        ${mistakeLedger}
        <div class="exam-review-table" role="table" aria-label="Exam review rows">
          <div class="exam-review-row header" role="row">
            <span>#</span>
            <span>Result</span>
            <span>Time</span>
            <span>Skill</span>
            <span>Error</span>
            <span>Mastery</span>
            <span>Action</span>
          </div>
          ${rows}
        </div>
      </section>
    `;
  }

  function renderProfileDiff(diff = {}) {
    const labels = {
      attempts: "Attempts",
      pretests: "Diagnostics",
      studyNotes: "Study notes",
      vocabKnown: "Known vocab",
      lessonProgress: "Lessons",
      practiceReports: "Reports",
    };
    const keys = Object.keys(labels);
    if (!diff || !diff.local || !diff.server) return "";
    const rows = keys
      .map((key) => {
        const changed = Number(diff.local?.[key] || 0) !== Number(diff.server?.[key] || 0);
        return `
          <span class="${changed ? "changed" : ""}">
            <strong>${escapeHtml(labels[key])}</strong>
            Local ${escapeHtml(String(diff.local?.[key] || 0))} -> Server ${escapeHtml(String(diff.server?.[key] || 0))}
          </span>
        `;
      })
      .join("");
    return `<div class="profile-diff-grid">${rows}</div>`;
  }

  function renderPublicBackendStatus(backend = {}, context = {}) {
    const formatDateTime = context.formatDateTime || ((value) => value || "");
    const formatBytes = context.formatBytes || ((value) => `${Number(value || 0)} B`);
    const level = ["ok", "warning", "error"].includes(backend.statusLevel) ? backend.statusLevel : "warning";
    const health = backend.lastHealth || null;
    const hasPendingProfileRecord = Boolean(context.hasPendingProfileRecord);
    const accountLine = backend.account
      ? `${backend.account.displayName || backend.account.username || backend.account.id} - ${backend.account.role}`
      : "No backend session";
    const healthLine = health
      ? `${health.service || "Backend"} - admin count ${Number(health.adminCount || 0)}`
      : "Health has not been checked.";
    const sessionExpires = backend.sessionExpiresAt
      ? `<span>Session expires: ${escapeHtml(formatDateTime(new Date(Number(backend.sessionExpiresAt) * 1000).toISOString()))}</span>`
      : "";
    const profileSync = backend.lastProfileSyncAt
      ? `<span>Profile sync: ${escapeHtml(formatDateTime(backend.lastProfileSyncAt))} - revision ${escapeHtml(String(backend.lastServerProfileRevision || 0))}</span>`
      : "";
    const serverProfile = backend.lastServerProfileAt
      ? `<span>Server profile: ${escapeHtml(formatDateTime(backend.lastServerProfileAt))}${backend.lastServerProfileSummary ? ` - ${escapeHtml(String(backend.lastServerProfileSummary.attempts || 0))} attempts` : ""}</span>`
      : "";
    const monitoring = backend.lastMonitoring
      ? `<span>Monitoring: ${escapeHtml(String(backend.lastMonitoring.counts?.accounts || 0))} accounts - ${escapeHtml(String(backend.lastMonitoring.counts?.activeSessions || 0))} active sessions - ${escapeHtml(formatBytes(backend.lastMonitoring.database?.sizeBytes || 0))}</span>`
      : "";
    const contentPackage = backend.lastContentPackageAt
      ? `<span>Content package: ${escapeHtml(String(backend.lastContentPackageCount || 0))} questions - ${escapeHtml(backend.lastContentPackageVersion || "version pending")} - ${escapeHtml(formatDateTime(backend.lastContentPackageAt))}</span>`
      : "";
    const pendingProfile = backend.pendingServerProfileSummary
      ? `
        <div class="profile-merge-review">
          <strong>Server profile pending review</strong>
          <span>Revision ${escapeHtml(String(backend.pendingServerProfileRevision || 0))} - ${escapeHtml(String(backend.pendingServerProfileSummary.attempts || 0))} attempts - ${hasPendingProfileRecord ? "ready to apply" : "load again before applying"}</span>
          ${renderProfileDiff(backend.pendingServerProfileDiff || {})}
        </div>
      `
      : "";

    return {
      className: `public-backend-status ${escapeHtml(level)}`,
      html: `
        <strong>${escapeHtml(backend.statusTitle || "Backend not checked")}</strong>
        <span>${escapeHtml(backend.statusMessage || "Check backend health before syncing progress.")}</span>
        <span>${escapeHtml(accountLine)}</span>
        <span>${escapeHtml(healthLine)}</span>
        ${sessionExpires}
        ${backend.lastSyncAt ? `<span>Last sync: ${escapeHtml(formatDateTime(backend.lastSyncAt))}</span>` : ""}
        ${backend.lastServerProgressAt ? `<span>Server progress: ${escapeHtml(formatDateTime(backend.lastServerProgressAt))}</span>` : ""}
        ${profileSync}
        ${serverProfile}
        ${monitoring}
        ${contentPackage}
        ${pendingProfile}
        ${backend.lastExportAt ? `<span>Last export: ${escapeHtml(formatDateTime(backend.lastExportAt))}</span>` : ""}
      `,
    };
  }

  function renderDashboardWeakSkills(rows = []) {
    if (!Array.isArray(rows) || !rows.length) {
      return '<div class="empty-state">No weak-skill pattern yet. Take the pretest or answer more practice questions.</div>';
    }
    return rows
      .map(
        (skill) => `
          <div class="list-item">
            <h3>${escapeHtml(skill.skill)}</h3>
            <p>${escapeHtml(skill.section)} &middot; ${Number(skill.wrong || 0)} wrong &middot; priority ${escapeHtml(skill.priority)}</p>
          </div>
        `,
      )
      .join("");
  }

  function renderDashboardLoop(rows = []) {
    return (Array.isArray(rows) ? rows : [])
      .map((item) => `<div class="loop-item"><strong>${escapeHtml(item.step)}. ${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.body)}</span></div>`)
      .join("");
  }

  function renderStickerShelf(stickers = []) {
    return (Array.isArray(stickers) ? stickers : [])
      .map((reward) => `<span class="sticker-mini ${reward.unlocked ? "unlocked" : ""} ${reward.hidden ? "hidden" : ""}" title="${escapeHtml(reward.name)}">${escapeHtml(reward.icon)}</span>`)
      .join("");
  }

  function renderDailyQuests(quests = []) {
    return (Array.isArray(quests) ? quests : [])
      .map((quest) => {
        const pct = boundedPercent(quest.pct);
        const hidden = quest.hidden && !quest.revealed;
        const title = hidden ? quest.hiddenTitle || "Hidden SAT mission" : quest.title;
        const reward = hidden ? "locked" : quest.reward;
        const detail = hidden ? escapeHtml(quest.hiddenHint || "Make progress to reveal") : `${Number(quest.current || 0)}/${Number(quest.target || 0)} &middot; ${escapeHtml(reward)}`;
        const meta = hidden
          ? ""
          : [quest.typeLabel, quest.actionLabel]
              .filter(Boolean)
              .map((item) => `<span class="quest-meta-pill">${escapeHtml(item)}</span>`)
              .join("");
        const learningValue = !hidden && quest.learningValue ? `<small class="quest-learning-value">${escapeHtml(quest.learningValue)}</small>` : "";
        return `
          <div class="quest-item ${pct >= 100 ? "complete" : ""} ${hidden ? "hidden" : ""} ${quest.claimed ? "claimed" : ""}">
            <div>
              <strong>${escapeHtml(title)}</strong>
              <span>${detail}</span>
            </div>
            ${meta ? `<div class="quest-meta">${meta}</div>` : ""}
            ${learningValue}
            <progress class="mini-progress-bar" max="100" value="${hidden ? 0 : pct}" aria-label="${escapeHtml(title)} progress"></progress>
          </div>
        `;
      })
      .join("");
  }

  function renderRewardBoard(rewards = []) {
    return (Array.isArray(rewards) ? rewards : [])
      .map(
        (reward) => {
          const lockLabel = reward.unlocked
            ? reward.unlockedLabel
            : reward.hidden || !reward.remaining
              ? reward.description || reward.pointsToUnlockLabel
              : `${Number(reward.remaining || 0)} ${reward.pointsToUnlockLabel}`;
          return `
            <div class="reward-sticker ${reward.unlocked ? "unlocked" : "locked"} ${reward.hidden ? "hidden" : ""}">
              <span>${escapeHtml(reward.icon)}</span>
              <div>
                <strong>${escapeHtml(reward.name)}</strong>
                <small>${escapeHtml(lockLabel || "")}</small>
                ${reward.description && reward.description !== lockLabel ? `<small>${escapeHtml(reward.description)}</small>` : ""}
              </div>
            </div>
          `;
        },
      )
      .join("");
  }

  function renderExternalStudyLogs(logs = [], context = {}) {
    const formatDate = context.formatDate || ((value) => value || "");
    if (!Array.isArray(logs) || !logs.length) {
      return '<div class="empty-state">No outside study logged yet. Log Khan or Bluebook work to count it toward attendance.</div>';
    }
    return logs
      .slice(0, 5)
      .map(
        (log) => `
          <article class="external-study-item">
            <div>
              <strong>${escapeHtml(log.source)} &middot; ${Number(log.minutes || 0)} min</strong>
              <span>${escapeHtml(log.topic || "General SAT study")} &middot; ${escapeHtml(formatDate(log.at))}</span>
            </div>
            <p>${escapeHtml(log.note || "No note.")}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderParentHomeMetric(label, value, caption = "") {
    return `
      <article class="parent-home-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value ?? ""))}</strong>
        ${caption ? `<small>${escapeHtml(caption)}</small>` : ""}
      </article>
    `;
  }

  function renderParentHomeSummary(model = {}) {
    const summary = model.summary || {};
    return [
      renderParentHomeMetric("Parent status", summary.statusLabel || "Needs data", summary.statusDetail || "Use the weekly plan to decide the next parent action."),
      renderParentHomeMetric("Target gap", summary.targetGapLabel || "Need diagnostic", summary.targetGapDetail || "Run a diagnostic or log an official score."),
      renderParentHomeMetric("Linked students", Number(summary.studentCount || 0), `${Number(summary.scheduledStudents || 0)} with schedule`),
      renderParentHomeMetric("Next session", summary.nextSessionLabel || "Not scheduled", summary.nextSessionStudent || "Set the next study block"),
      renderParentHomeMetric("Due work", Number(summary.dueWork || 0), `${Number(summary.openMistakes || 0)} open mistake(s)`),
      renderParentHomeMetric("Official logs", Number(summary.officialLogs || 0), `${Number(summary.externalMinutes || 0)} Khan/Bluebook minutes`),
    ].join("");
  }

  function renderParentActionButton(action, label, tone = "secondary") {
    return `<button class="button ${escapeHtml(tone)} parent-plan-action-button" type="button" data-parent-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
  }

  function renderParentPlanRow(row = {}) {
    const latestOfficial = row.latestOfficialLog
      ? `${row.latestOfficialLog.label || "Official practice"}${row.latestOfficialLog.reference ? ` - ${row.latestOfficialLog.reference}` : ""}`
      : "No official log yet";
    const latestExternal = row.latestExternalLog
      ? `${row.latestExternalLog.label || "Outside study"} - ${row.latestExternalLog.topic || "General SAT study"}`
      : "No Khan/Bluebook log yet";
    const scoreLine = row.scoreLine || `Target ${escapeHtml(row.targetScore || "--")} - diagnostic needed`;
    const targetGap = row.targetGapLabel || "Need baseline";
    return `
      <article class="parent-plan-row ${escapeHtml(row.priority || "steady")}" data-student-id="${escapeHtml(row.id || "")}">
        <div class="parent-plan-main">
          <span class="pill">${escapeHtml(row.actionLabel || "Keep current plan")}</span>
          <div>
            <h3>${escapeHtml(row.name || "Student")}</h3>
            <p>${escapeHtml(scoreLine)} &middot; ${escapeHtml(targetGap)} &middot; ${Number(row.weeklyTarget || 0)} sessions/week</p>
          </div>
        </div>
        <div class="parent-plan-grid">
          ${renderParentHomeMetric("Schedule", row.nextSessionLabel || "Not scheduled", row.scheduleCaption || "Set next session")}
          ${renderParentHomeMetric("Due remediation", Number(row.dueRemediation || 0), `${Number(row.openMistakes || 0)} open mistake(s)`)}
          ${renderParentHomeMetric("Proof", `${Number(row.proofPassed || 0)} / ${Number(row.proofFailed || 0)}`, "passed / failed")}
          ${renderParentHomeMetric("Official", Number(row.officialLogCount || 0), latestOfficial)}
          ${renderParentHomeMetric("Last activity", row.lastActivityLabel || "No activity yet", row.currentScoreSource || "waiting for first signal")}
        </div>
        <div class="parent-plan-foot">
          <span>Weak focus: ${escapeHtml(row.weakFocus || "No weak pattern yet")}</span>
          <span>Outside practice: ${escapeHtml(latestExternal)}</span>
        </div>
        <div class="parent-plan-actions">
          ${renderParentActionButton("student-detail", "View student detail", "secondary")}
          ${renderParentActionButton("accounts", row.priority === "schedule" ? "Set schedule" : "Manage schedule", "secondary")}
          ${renderParentActionButton("official", "Log official", "secondary")}
        </div>
      </article>
    `;
  }

  function renderParentWeeklyReport(report = {}) {
    const blockers = Array.isArray(report.blockers) ? report.blockers : [];
    const stuckSkills = Array.isArray(report.stuckSkills) ? report.stuckSkills : [];
    const actions = Array.isArray(report.parentActions) ? report.parentActions : [];
    const quality = report.qualitySignals || {};
    const expectation = report.expectation || {};
    return `
      <article class="panel parent-weekly-report">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Weekly report</p>
            <h2>What changed this week</h2>
            <p class="muted">Study volume, proof quality, blockers, and parent actions in one coaching view.</p>
          </div>
        </div>
        <div class="parent-expectation-card">
          <strong>${escapeHtml(expectation.label || "Weekly expectation")}</strong>
          <span>${escapeHtml(expectation.body || "Check whether the student completed review, proof, notes, and one focused practice block.")}</span>
        </div>
        <div class="parent-weekly-metrics">
          ${renderParentHomeMetric("Study minutes", Number(report.studyMinutes || 0), `${Number(report.practiceMinutes || 0)} practice + ${Number(report.externalMinutes || 0)} outside`)}
          ${renderParentHomeMetric("Questions", Number(report.questions || 0), `${Number(report.accuracy || 0)}% accuracy`)}
          ${renderParentHomeMetric("Proof", `${Number(report.proofPassed || 0)} / ${Number(report.proofFailed || 0)}`, `${Number(quality.proofPassRate || 0)}% pass rate`)}
          ${renderParentHomeMetric("Official logs", Number(report.officialLogs || 0), "Bluebook / official")}
        </div>
        <div class="parent-weekly-grid">
          <div>
            <strong>Top blockers</strong>
            ${
              stuckSkills.length
                ? stuckSkills
                    .map(
                      (item) => `
                        <span>
                          ${escapeHtml(item.studentName || "Student")}: ${escapeHtml(item.skill || "Subskill")} · ${Number(item.accuracy || 0)}%
                          · +${Number(item.projectedGain || 0)} point potential
                        </span>
                        <small>${escapeHtml(item.action || "Learn 3 min -> targeted 10 -> proof 2 fresh.")}</small>
                      `,
                    )
                    .join("")
                : blockers.length
                  ? blockers.map((item) => `<span>${escapeHtml(item)}</span>`).join("")
                  : "<span>No blocker pattern yet.</span>"
            }
          </div>
          <div>
            <strong>Parent actions</strong>
            ${actions.length ? actions.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : "<span>Keep monitoring the current plan.</span>"}
          </div>
          <div>
            <strong>Quality signals</strong>
            <span>${Number(quality.slowCorrect || 0)} slow correct</span>
            <span>${Number(quality.marked || 0)} marked for review</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderParentChecklist(items = []) {
    const rows = Array.isArray(items) ? items : [];
    if (!rows.length) return "";
    return `
      <section class="parent-checklist" aria-label="Parent weekly checklist">
        ${rows
          .map(
            (item) => `
              <article class="parent-checklist-item ${escapeHtml(item.status || "todo")}">
                <span>${escapeHtml(item.label || "Checklist")}</span>
                <strong>${escapeHtml(item.value || "")}</strong>
                <small>${escapeHtml(item.body || "")}</small>
              </article>
            `,
          )
          .join("")}
      </section>
    `;
  }

  function renderParentHomePlan(model = {}) {
    const rows = Array.isArray(model.rows) ? model.rows : [];
    const priority = model.priority || {};
    return `
      <article class="panel parent-priority-panel">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Schedule and parent action</p>
            <h2>${escapeHtml(priority.title || "This week's parent focus")}</h2>
            <p class="muted">${escapeHtml(priority.body || "Review schedule, due work, proof status, and official/outside practice in one view.")}</p>
          </div>
        </div>
        <div class="parent-priority-strip">
          ${renderParentHomeMetric("Needs action", Number(priority.needsAction || 0), "students requiring a parent decision")}
          ${renderParentHomeMetric("Unscheduled", Number(priority.unscheduled || 0), "students without next session")}
          ${renderParentHomeMetric("Due now", Number(priority.dueNow || 0), "remediation items")}
        </div>
        ${renderParentChecklist(model.checklist || [])}
      </article>
      ${renderParentWeeklyReport(model.weeklyReport || {})}
      <section class="parent-plan-list" aria-label="Parent student plan">
        ${
          rows.length
            ? rows.map(renderParentPlanRow).join("")
            : '<div class="empty-state">No linked students yet. Create a student account, link it to this parent, then ask the student to complete the 20-question pretest.</div>'
        }
      </section>
    `;
  }

  function renderCoachMetric(label, value, caption = "") {
    return `
      <div class="coach-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        ${caption ? `<small>${escapeHtml(caption)}</small>` : ""}
      </div>
    `;
  }

  function renderCoachStudentSubskills(row = {}) {
    const subskills = Array.isArray(row.subskills) ? row.subskills : [];
    if (!subskills.length) return '<span class="coach-subskill-pill empty">No weak subskill yet</span>';
    return subskills
      .map(
        (item) => `
          <span class="coach-subskill-pill">
            ${escapeHtml(item.skill || "Subskill")} &middot; ${Number(item.accuracy || 0)}% &middot; ${Number(item.wrong || 0)} wrong
          </span>
        `,
      )
      .join("");
  }

  function renderCoachStudentRow(row = {}) {
    const proofLine = `${Number(row.proofPassed || 0)} passed / ${Number(row.proofFailed || 0)} failed`;
    const latestExternal = row.latestExternalLog
      ? `${row.latestExternalLog.label || "Outside study"} - ${row.latestExternalLog.topic || "General SAT study"}`
      : "No Khan/Bluebook log yet";
    const latestOfficial = row.latestOfficialLog
      ? `${row.latestOfficialLog.label || "Official practice"} - ${row.latestOfficialLog.skill || "General SAT"}`
      : "No official log yet";
    const topSubskill = row.topSubskill
      ? `${row.topSubskill.skill || "Subskill"} (${Number(row.topSubskill.accuracy || 0)}%)`
      : "No weak pattern yet";
    return `
      <div class="coach-student-row" data-student-id="${escapeHtml(row.id || "")}">
        <div class="coach-student-main">
          <div>
            <strong>${escapeHtml(row.name || "Student")}</strong>
            <span>Target ${Number(row.targetScore || 0) || "--"} &middot; baseline ${escapeHtml(row.latestBaseline || "--")}</span>
          </div>
          <div class="coach-subskill-list" aria-label="Subskill accuracy">${renderCoachStudentSubskills(row)}</div>
        </div>
        <div class="coach-student-metrics">
          ${renderCoachMetric("Subskill accuracy", `${Number(row.accuracy || 0)}%`, topSubskill)}
          ${renderCoachMetric("Avg sec/question", row.avgSeconds ? `${Number(row.avgSeconds)}s` : "--", `${Number(row.attempts || 0)} attempts`)}
          ${renderCoachMetric("Open mistakes", Number(row.openMistakes || 0), "active errors")}
          ${renderCoachMetric("Remediation due", Number(row.dueRemediation || 0), "lesson/proof")}
          ${renderCoachMetric("Proof pass/fail", proofLine, "proof status")}
          ${renderCoachMetric("Khan/Bluebook", `${Number(row.externalMinutes || 0)} min`, `${Number(row.externalLogCount || 0)} logs`)}
          ${renderCoachMetric("Official logs", Number(row.officialLogCount || 0), "metadata only")}
        </div>
        <div class="coach-student-foot">
          <span>Next session: ${escapeHtml(row.nextSessionLabel || "No session scheduled")} &middot; ${Number(row.weeklyTarget || 0)} sessions/week</span>
          <span>Latest official log: ${escapeHtml(latestOfficial)}</span>
          <span>Latest outside log: ${escapeHtml(latestExternal)}</span>
        </div>
      </div>
    `;
  }

  function renderCoachAdminAudit(audit = {}) {
    if (!audit) return "";
    const firewallMessage = Number(audit.firewallRiskCount || 0)
      ? `${Number(audit.firewallRiskCount || 0)} high-risk public candidate(s) need review.`
      : "No high-risk public candidates detected.";
    return `
      <section class="coach-dashboard-section coach-admin-audit">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Admin audit</p>
            <h3>Question audit</h3>
          </div>
        </div>
        <div class="coach-audit-grid">
          ${renderCoachMetric("Open reports", Number(audit.openAuditCount || 0), `${Number(audit.openAuditEntries || 0)} entries`)}
          ${renderCoachMetric("Needs review", Number(audit.needsReviewCount || 0), "question bank")}
          ${renderCoachMetric("Blocked", Number(audit.blockedCount || 0), "audit/rejected")}
          ${renderCoachMetric("Generated review", Number(audit.generatedNeedsReviewCount || 0), "AI drafts")}
          ${renderCoachMetric("Integrity blocked", Number(audit.integrityBlockedCount || 0), `${Number(audit.integrityCriticalCount || 0)} critical`)}
          ${renderCoachMetric("Repeated topics", Number(audit.overrepresentedTopicCount || 0), "validator signal")}
        </div>
        <div class="coach-firewall-status">
          <strong>Public/private/vault firewall</strong>
          <span>
            ${Number(audit.publicCandidateCount || 0)} public candidates &middot;
            ${Number(audit.privateFamilyCount || 0)} private family &middot;
            ${Number(audit.adminOnlyCount || 0)} admin only &middot;
            ${Number(audit.vaultCount || 0)} vault items.
            ${escapeHtml(firewallMessage)}
          </span>
        </div>
      </section>
    `;
  }

  function renderCoachDashboard(model = {}) {
    if (!model.visible) return "";
    const summary = model.summary || {};
    const students = Array.isArray(model.students) ? model.students : [];
    return `
      <div class="coach-dashboard-shell">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Coach dashboard</p>
            <h2>${escapeHtml(model.title || "Coach Dashboard")}</h2>
            <p class="muted">${escapeHtml(model.subtitle || "")}</p>
          </div>
        </div>
        <div class="coach-summary-grid">
          ${renderCoachMetric("Students", Number(summary.studentCount || 0), `${Number(summary.attemptedStudentCount || 0)} active`)}
          ${renderCoachMetric("Subskill accuracy", `${Number(summary.accuracy || 0)}%`, "all linked attempts")}
          ${renderCoachMetric("Avg sec/question", summary.avgSeconds ? `${Number(summary.avgSeconds)}s` : "--", "timed practice")}
          ${renderCoachMetric("Open mistakes", Number(summary.openMistakes || 0), "active errors")}
          ${renderCoachMetric("Remediation due", Number(summary.dueRemediation || 0), "lesson/proof due")}
          ${renderCoachMetric("Proof pass/fail", `${Number(summary.proofPassed || 0)} / ${Number(summary.proofFailed || 0)}`, "proof outcomes")}
          ${renderCoachMetric("Khan/Bluebook minutes", Number(summary.externalMinutes || 0), "outside study")}
          ${renderCoachMetric("Official logs", Number(summary.officialLogs || 0), "metadata only")}
        </div>
        <section class="coach-dashboard-section">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">Students</p>
              <h3>Accuracy, time, remediation, and schedule</h3>
            </div>
          </div>
          <div class="coach-student-list">
            ${students.length ? students.map(renderCoachStudentRow).join("") : '<div class="empty-state">No linked students for this account.</div>'}
          </div>
        </section>
        ${renderCoachAdminAudit(model.adminAudit)}
      </div>
    `;
  }

  function adminUiText(value = "") {
    return String(value ?? "")
      .replace(/Keep warnings visible but separate from launch blockers\./g, "Giữ cảnh báo tách riêng với blocker phát hành.")
      .replace(/reviewed_pool_ready_for_high_quality_practice/g, "reviewed pool sẵn sàng cho luyện tập chất lượng cao")
      .replace(/must remain zero before any publish gate/g, "phải bằng 0 trước khi phát hành")
      .replace(/items that need stronger teaching value/g, "câu cần tăng giá trị tự học")
      .replace(/MC explanations with weak distractor teaching/g, "MC có phân tích bẫy còn yếu")
      .replace(/hard Math that looks context-rich and multi-step/g, "Hard Math có context và nhiều bước")
      .replace(/Expert score/g, "Điểm expert")
      .replace(/Accuracy blockers/g, "Blocker độ chính xác")
      .replace(/Depth gaps/g, "Gap độ sâu")
      .replace(/Generic traps/g, "Trap chung chung")
      .replace(/Hard Math depth/g, "Độ sâu Hard Math")
      .replace(/Core-ready reviewed/g, "Core-ready đã duyệt")
      .replace(/Content priority/g, "Ưu tiên nội dung")
      .replace(/Next upload contract/g, "Hợp đồng batch tiếp theo")
      .replace(/High-ROI upload gate for Algebra and Advanced Math only\./g, "Batch ROI cao cho Algebra và Advanced Math.")
      .replace(/Blueprint gap is within tolerance or report is missing\./g, "Gap blueprint đang trong ngưỡng hoặc report chưa tải.")
      .replace(/Quality suite/g, "Bộ kiểm tra chất lượng")
      .replace(/Syntax, unit, backend, integrity, and readiness checks\./g, "Kiểm tra syntax, unit, backend, integrity và readiness.")
      .replace(/Expert reviewed-pool audit/g, "Audit expert cho reviewed pool")
      .replace(/Answer accuracy, explanation depth, distractor teaching, and breadth\./g, "Kiểm tra đáp án, độ sâu explanation, bẫy sai và độ rộng.")
      .replace(/Algebra and Advanced Math blueprint/g, "Blueprint Algebra và Advanced Math")
      .replace(/Confirms the upload improves the intended SAT Math gaps\./g, "Xác nhận batch cải thiện đúng gap SAT Math.")
      .replace(/Browser smoke/g, "Smoke test trình duyệt")
      .replace(/study-visible excluding hidden/g, "study-visible, không tính hidden")
      .replace(/independent calibration attempts/g, "lượt calibration độc lập")
      .replace(/low-quality item flag\(s\)/g, "flag câu chất lượng thấp");
  }

  function renderAdminMetric(metric = {}) {
    const tone = metric.tone || "neutral";
    const value = metric.value === null || metric.value === undefined || metric.value === "" ? "--" : metric.value;
    return `
      <article class="admin-metric ${escapeHtml(tone)}">
        <span>${escapeHtml(adminUiText(metric.label || ""))}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(adminUiText(metric.detail || ""))}</small>
      </article>
    `;
  }

  function adminTargetLabel(target = "sources") {
    const labels = { admin: "Mở Admin", bank: "Mở Bank", sources: "Mở Sources", author: "Mở tạo câu", accounts: "Mở tài khoản", official: "Mở log điểm" };
    return labels[target] || "Mở xử lý";
  }

  function renderAdminQueueItem(item = {}) {
    const gates = Array.isArray(item.gates) ? item.gates : [];
    return `
      <article class="admin-queue-item ${escapeHtml(item.priority || "neutral")}">
        <div>
          <span class="admin-queue-meta"><b>${escapeHtml(item.priorityLabel || item.priority || "P2")}</b>${escapeHtml(item.eyebrow || item.priority || "Review")}</span>
          <strong>${escapeHtml(item.title || "Queue item")}</strong>
          <p>${escapeHtml(item.body || "")}</p>
          ${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ""}
          ${item.qualityScore !== undefined ? `<small class="admin-quality-score">Quality score: ${escapeHtml(item.qualityScore)}/100</small>` : ""}
          ${gates.length ? `<div class="admin-mini-gates">${gates.map((gate) => `<span class="${escapeHtml(gate.status || "warn")}">${escapeHtml(gate.label || gate)}</span>`).join("")}</div>` : ""}
        </div>
        <button class="button secondary admin-action-button" type="button" data-admin-target="${escapeHtml(item.targetView || "sources")}">${escapeHtml(item.actionLabel || adminTargetLabel(item.targetView || "sources"))}</button>
      </article>
    `;
  }

  function renderAdminStatusRow(item = {}) {
    const value = item.value === null || item.value === undefined || item.value === "" ? "--" : item.value;
    return `
      <article class="admin-status-row ${escapeHtml(item.tone || "neutral")}">
        <div>
          <strong>${escapeHtml(item.label || "")}</strong>
          <span>${escapeHtml(item.detail || "")}</span>
        </div>
        <b>${escapeHtml(value)}</b>
      </article>
    `;
  }

  function renderAdminDomainAction(action = {}) {
    const sign = Number(action.deltaPctPoints || 0) > 0 ? "+" : "";
    return `
      <article class="admin-domain-action">
        <strong>${escapeHtml(action.section || "")} / ${escapeHtml(action.domain || "")}</strong>
        <span>${escapeHtml(action.balance || "monitor")} - ${sign}${escapeHtml(action.deltaPctPoints ?? "--")} pp vs official</span>
        <small>${escapeHtml(action.recommendedAction || "")}</small>
      </article>
    `;
  }

  function renderAdminWorkflowTabs() {
    const tabs = [
      ["admin-priority-inbox", "Hôm nay"],
      ["admin-content-heatmap", "Heatmap"],
      ["admin-curriculum-command", "Kế hoạch"],
      ["admin-quality-lab", "Kiểm định"],
      ["admin-public-release", "Phát hành"],
    ];
    return `
      <nav class="admin-workflow-tabs" aria-label="Content admin workflow">
        ${tabs
          .map(([target, label]) => `<button class="admin-scroll-button" type="button" data-admin-scroll-target="${escapeHtml(target)}">${escapeHtml(label)}</button>`)
          .join("")}
      </nav>
    `;
  }

  function renderAdminContentPriority(item = {}) {
    return `
      <article class="admin-content-priority">
        <span>${escapeHtml(item.priority || "P2")}</span>
        <div>
          <strong>${escapeHtml(adminUiText(item.label || "Content priority"))}</strong>
          <small>${escapeHtml(adminUiText(item.detail || ""))}</small>
        </div>
        ${item.target ? `<button class="button tiny secondary admin-action-button" type="button" data-admin-target="${escapeHtml(item.target)}">${escapeHtml(adminTargetLabel(item.target))}</button>` : ""}
      </article>
    `;
  }

  function renderAdminCockpit(model = {}) {
    const queue = Array.isArray(model.queue) ? model.queue : [];
    const first = queue[0] || null;
    const publicRelease = model.publicRelease || {};
    const questions = model.questions || {};
    const system = model.system || {};
    const curriculum = model.curriculum || {};
    const nextPriority = first
      ? { title: first.title, body: first.body, detail: first.detail, target: first.targetView || "bank", label: first.actionLabel || adminTargetLabel(first.targetView || "bank") }
      : publicRelease.ready
        ? { title: "Không có blocker P0", body: "Cổng phát hành đang sạch; chuyển sang gap nội dung hoặc review định kỳ.", detail: "Ưu tiên batch có ROI cao nhất trước khi tạo thêm volume.", target: "author", label: "Mở tạo câu" }
        : { title: publicRelease.label || "Phát hành đang bị chặn", body: publicRelease.detail || "Kiểm tra blocker trước khi public.", detail: "Không export public nếu còn blocker.", target: "sources", label: "Mở Sources" };
    const contentPriority = Array.isArray(curriculum.topPriorities) && curriculum.topPriorities.length ? curriculum.topPriorities[0] : null;
    const scopeRows = [
      ["Toàn bank", questions.total || system.loadedTotal || null, "scope: audit/readiness report"],
      ["Đã tải trong browser", questions.browserLoaded || 0, system.dataConfidence?.bankHydrated ? "đã gần đủ bank" : "không dùng làm tổng hệ thống"],
      ["Core-ready", system.coreReadyReviewed || questions.approved || null, "đã reviewed cho study pool"],
      ["Sẵn sàng public", publicRelease.manifestReady || questions.publicReady || null, "đủ điều kiện export khi browser hydrate"],
    ];
    return `
      <section class="admin-cockpit" aria-label="Bảng điều phối admin">
        <article class="admin-cockpit-primary">
          <p class="eyebrow">Bảng điều phối admin</p>
          <h3>${escapeHtml(nextPriority.title || "Việc cần làm ngay")}</h3>
          <p>${escapeHtml(nextPriority.body || "")}</p>
          ${nextPriority.detail ? `<small>${escapeHtml(nextPriority.detail)}</small>` : ""}
          <button class="button primary admin-action-button" type="button" data-admin-target="${escapeHtml(nextPriority.target)}">${escapeHtml(nextPriority.label)}</button>
        </article>
        <article class="admin-cockpit-card">
          <span>Độ tin cậy phát hành</span>
          <strong>${escapeHtml(publicRelease.ready ? "Sẵn sàng public" : "Chưa public")}</strong>
          <small>${escapeHtml(`${publicRelease.blockedCandidates ?? "--"} câu bị chặn · ${Number(publicRelease.openAuditEntries || 0)} report mở · ${Number(publicRelease.sourceUnsigned || 0)} nguồn chưa ký`)}</small>
        </article>
        <article class="admin-cockpit-card">
          <span>ROI nội dung</span>
          <strong>${escapeHtml(adminUiText(contentPriority?.label || "Không có gap P0/P1"))}</strong>
          <small>${escapeHtml(adminUiText(contentPriority?.detail || "Nếu không có gap, chỉ tạo batch theo chiến lược audit mới nhất."))}</small>
        </article>
        <article class="admin-scope-ledger">
          <strong>Scope số liệu</strong>
          <em>${escapeHtml(system.dataConfidence?.detail || "")}</em>
          ${scopeRows.map(([label, value, detail]) => `<span><b>${escapeHtml(label)}: ${escapeHtml(value ?? "--")}</b><small>${escapeHtml(detail)}</small></span>`).join("")}
        </article>
      </section>
    `;
  }

  function renderAdminReviewSop() {
    const checks = [
      ["Format", "đủ stem/choice/answer"],
      ["Blueprint", "đúng domain-skill-difficulty"],
      ["Answer", "đáp án đáng tin"],
      ["Explanation", "đủ bước tự học"],
      ["Traps", "phân tích sai lầm từng choice"],
      ["Tags", "calculator/source/pool rõ"],
    ];
    return `<section class="admin-review-sop"><p class="eyebrow">Review SOP</p><h3>Chỉ duyệt khi qua đủ 6 cửa</h3><div>${checks.map(([label, body]) => `<span><b>${escapeHtml(label)}</b><small>${escapeHtml(body)}</small></span>`).join("")}</div></section>`;
  }

  function renderAdminContentHeatmap(planner = {}) {
    const heatmap = Array.isArray(planner.heatmap) ? planner.heatmap : [];
    const targets = Array.isArray(planner.targets) ? planner.targets : [];
    const bandRows = Array.isArray(planner.bandRows) ? planner.bandRows : [];
    const domainRows = heatmap.length
      ? heatmap
          .map((row) => {
            const difficulty = row.difficulty || {};
            const needed = Number(row.needed || 0);
            const tone = needed > 80 ? "danger" : needed > 0 ? "warn" : "ok";
            return `
              <article class="admin-heatmap-row ${tone}">
                <div>
                  <strong>${escapeHtml(row.domain || "")}</strong>
                  <span>${escapeHtml(row.section || "")} · ${escapeHtml(row.actualPct ?? "--")}% / target ${escapeHtml(row.officialPct ?? "--")}%</span>
                </div>
                <b>${needed ? `+${needed}` : "OK"}</b>
                <small>${planner.hydrated ? `Easy ${Number(difficulty.Easy || 0)} · Medium ${Number(difficulty.Medium || 0)} · Hard ${Number(difficulty.Hard || 0)}` : "Difficulty mix: đang hydrate bank trong browser"}</small>
              </article>
            `;
          })
          .join("")
      : '<div class="empty-state">Chưa có heatmap. Refresh reports để lấy readiness audit.</div>';
    return `
      <section id="admin-content-heatmap" class="admin-content-heatmap panel">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Content heatmap</p>
            <h3>Thiếu gì để bank cân bằng SAT?</h3>
            <p class="muted">Đọc theo report toàn hệ thống; difficulty mix chỉ hiện khi browser đã hydrate gần đủ bank.</p>
          </div>
        </div>
        <div class="admin-heatmap-grid">${domainRows}</div>
        <div class="admin-band-grid">
          ${bandRows.map((row) => `<span><b>${escapeHtml(row.band)}</b><small>${escapeHtml(row.focus)} · ${Number(row.ready || 0)} ready</small></span>`).join("")}
        </div>
        ${
          targets.length
            ? `<div class="admin-next-batch-list">${targets
                .slice(0, 5)
                .map((target) => `<article><strong>${escapeHtml(target.section)} / ${escapeHtml(target.domain)}</strong><span>${escapeHtml((target.skills || []).join(", "))}</span><small>${escapeHtml(target.guidance || "")}</small></article>`)
                .join("")}</div>`
            : ""
        }
      </section>
    `;
  }

  function renderAdminPublishGuardrails(model = {}) {
    const publicRelease = model.publicRelease || {};
    const system = model.system || {};
    const ready = Boolean(publicRelease.ready && system.dataConfidence?.bankHydrated);
    const rows = [
      ["Preview", ready ? "Sẽ export manifest thật" : "Chỉ export artifact kiểm tra", ready ? "ok" : "warn"],
      ["Blocker", Number(publicRelease.blockedCandidates || 0) ? `${publicRelease.blockedCandidates} câu bị chặn` : "Không có blocker public", Number(publicRelease.blockedCandidates || 0) ? "danger" : "ok"],
      ["Source risk", Number(publicRelease.sourceUnsigned || 0) ? `${publicRelease.sourceUnsigned} nguồn chưa ký` : "Nguồn public đã ký", Number(publicRelease.sourceUnsigned || 0) ? "danger" : "ok"],
      ["Audit trail", "Artifact ghi rõ checks/blockers", "ok"],
    ];
    return `
      <section class="admin-publish-guardrails">
        <div>
          <p class="eyebrow">One-click confidence</p>
          <h4>${ready ? "Có thể xuất public an toàn" : "Chưa nên xuất public thật"}</h4>
          <p>${escapeHtml(system.dataConfidence?.detail || "Đợi report và bank hydrate trước khi publish.")}</p>
        </div>
        <div class="admin-mini-gates">
          ${rows.map(([label, detail, status]) => `<span class="${escapeHtml(status)}"><b>${escapeHtml(label)}</b> ${escapeHtml(detail)}</span>`).join("")}
        </div>
      </section>
    `;
  }

  function renderAdminGapCard(row = {}) {
    const delta = Number(row.deltaPctPoints || 0);
    const sign = delta > 0 ? "+" : "";
    return `
      <article class="admin-gap-card ${escapeHtml(row.tone || "neutral")}">
        <span>${escapeHtml(row.priority || "P2")}</span>
        <strong>${escapeHtml(row.section || "")} / ${escapeHtml(row.domain || "")}</strong>
        <b>${escapeHtml(`${row.actualPct ?? "--"}%`)} <small>vs ${escapeHtml(`${row.officialPct ?? "--"}%`)}</small></b>
        <p>${escapeHtml(`${sign}${row.deltaPctPoints ?? "--"} pp - ${row.action || ""}`)}</p>
        ${Number(row.additionalNeededIfOnlyAddingThisDomain || 0) ? `<small>Add-only need: ${Number(row.additionalNeededIfOnlyAddingThisDomain || 0)}</small>` : ""}
      </article>
    `;
  }

  function renderAdminPlanDomain(domain = {}) {
    const familyRows = Array.isArray(domain.familyAllocation) ? domain.familyAllocation : [];
    const mix = (data = {}) => Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(" / ");
    return `
      <article class="admin-plan-domain">
        <div>
          <strong>${escapeHtml(domain.domain || "")}</strong>
          <span>${Number(domain.total || 0)} items</span>
        </div>
        <p>${escapeHtml(familyRows.map(([label, count]) => `${label} ${count}`).join("; "))}</p>
        <small>${escapeHtml(`Difficulty: ${mix(domain.difficulty)} | Format: ${mix(domain.format)} | Band: ${mix(domain.bands)}`)}</small>
      </article>
    `;
  }

  function renderAdminGateRow(row = {}) {
    return `
      <article class="admin-gate-row ${escapeHtml(row.status || "required")}">
        <div>
          <strong>${escapeHtml(adminUiText(row.label || ""))}</strong>
          <span>${escapeHtml(adminUiText(row.detail || ""))}</span>
        </div>
        <b>${escapeHtml(row.status || "required")}</b>
      </article>
    `;
  }

  function renderAdminCommandCheck(check = {}) {
    return `
      <article class="admin-command-check">
        <strong>${escapeHtml(adminUiText(check.label || ""))}</strong>
        <code>${escapeHtml(check.command || "")}</code>
        <span>${escapeHtml(adminUiText(check.purpose || ""))}</span>
      </article>
    `;
  }

  function renderAdminQualityFlag(flag = {}) {
    return `
      <article class="admin-quality-flag">
        <span>${escapeHtml(flag.priority || "P2")}</span>
        <strong>${escapeHtml(adminUiText(flag.label || ""))}</strong>
        ${flag.target ? `<button class="button tiny secondary admin-action-button" type="button" data-admin-target="${escapeHtml(flag.target)}">${escapeHtml(adminTargetLabel(flag.target))}</button>` : ""}
      </article>
    `;
  }

  function renderAdminItemAnalyticsRow(row = {}) {
    const flags = Array.isArray(row.flags) ? row.flags : [];
    const pValue = row.pValue === null || row.pValue === undefined ? "--" : Number(row.pValue).toFixed(3);
    const discrimination = row.discriminationIndex === null || row.discriminationIndex === undefined ? "--" : Number(row.discriminationIndex).toFixed(3);
    return `
      <article class="admin-quality-flag item-analytics-row">
        <span>${escapeHtml(flags[0] || "analytics")}</span>
        <strong>${escapeHtml(row.questionId || "unknown item")}</strong>
        <small>${escapeHtml([row.section, row.domain, row.skill, row.difficulty].filter(Boolean).join(" / "))}</small>
        <small>${Number(row.calibrationResponseCount || 0)}/${Number(row.responseCount || 0)} calibration responses - p=${escapeHtml(pValue)} - d=${escapeHtml(discrimination)} - helped ${Number(row.helpedResponseCount || 0)}</small>
      </article>
    `;
  }

  function renderAdminSurplusTopic(topic = {}) {
    return `
      <article class="admin-surplus-topic">
        <strong>${escapeHtml(topic.topic || "")}</strong>
        <span>${Number(topic.visibleCount || 0)}/${Number(topic.totalCount || 0)} visible - overflow ${Number(topic.overflowCount || 0)}</span>
        <small>${escapeHtml(topic.recommendedAction || "")}</small>
      </article>
    `;
  }

  function renderAdminCurriculumCommand(curriculum = {}) {
    const priorities = Array.isArray(curriculum.topPriorities) ? curriculum.topPriorities : [];
    const domainGaps = Array.isArray(curriculum.domainGaps) ? curriculum.domainGaps : [];
    const quality = curriculum.quality || {};
    const itemAnalytics = quality.itemAnalytics || {};
    const uploadGate = curriculum.uploadGate || {};
    const phase = uploadGate.phase || curriculum.phaseA || {};
    const checks = Array.isArray(uploadGate.postUploadChecks) ? uploadGate.postUploadChecks : [];
    const gates = Array.isArray(uploadGate.gates) ? uploadGate.gates : [];
    const thinSkills = Array.isArray(curriculum.thinSkills) ? curriculum.thinSkills : [];
    const surplusTopics = Array.isArray(curriculum.surplusTopics) ? curriculum.surplusTopics : [];
    return `
      <section id="admin-curriculum-command" class="admin-curriculum-command panel">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Trung tâm kế hoạch nội dung</p>
            <h3>Chiến lược bổ sung câu hỏi</h3>
            <p class="muted">Dùng panel này để quyết định batch tiếp theo, rồi chạy kiểm định sau khi import bank mới.</p>
          </div>
        </div>

        <div class="admin-curriculum-grid">
          <article class="admin-curriculum-panel">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Ưu tiên nội dung</p>
                <h4>Làm trước</h4>
              </div>
            </div>
            <div class="admin-content-priority-list">
              ${priorities.length ? priorities.map(renderAdminContentPriority).join("") : '<div class="empty-state">No active content priority found. Refresh reports after upload.</div>'}
            </div>
          </article>

          <article class="admin-curriculum-panel">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Gap blueprint</p>
                <h4>Cân bằng domain SAT</h4>
              </div>
            </div>
            <div class="admin-gap-grid">
              ${domainGaps.length ? domainGaps.slice(0, 6).map(renderAdminGapCard).join("") : '<div class="empty-state">Gap blueprint đang trong ngưỡng hoặc report chưa tải.</div>'}
            </div>
          </article>
        </div>

        <section id="admin-upload-gate" class="admin-upload-gate">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">${escapeHtml(adminUiText(uploadGate.title || "Hợp đồng batch tiếp theo"))}</p>
              <h4>${escapeHtml(`${phase.label || "Phase A"} - ${Number(phase.total || 0)} item target`)}</h4>
              <p class="muted">${escapeHtml(adminUiText(phase.purpose || ""))}</p>
            </div>
          </div>
          <div class="admin-plan-grid">
            ${Array.isArray(phase.domains) && phase.domains.length ? phase.domains.map(renderAdminPlanDomain).join("") : '<div class="empty-state">No upload allocation loaded.</div>'}
          </div>
          <div class="admin-gate-list">
            ${gates.map(renderAdminGateRow).join("")}
          </div>
        </section>

        <section id="admin-quality-lab" class="admin-quality-lab">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">Phòng kiểm định chất lượng</p>
              <h4>Giá trị đào tạo và check sau upload</h4>
            </div>
          </div>
          <div class="admin-quality-card-grid">
            ${Array.isArray(quality.cards) ? quality.cards.map(renderAdminMetric).join("") : ""}
          </div>
          <div class="admin-quality-split">
            <div class="admin-quality-flag-list">
              ${Array.isArray(quality.flags) && quality.flags.length ? quality.flags.map(renderAdminQualityFlag).join("") : '<div class="empty-state">No expert-quality warning loaded.</div>'}
              ${thinSkills.length ? `<div class="admin-thin-skill-list">${thinSkills.map((skill) => `<span>${escapeHtml(skill.skill)}: ${Number(skill.count || 0)} items, ${Number(skill.hardCount || 0)} hard</span>`).join("")}</div>` : ""}
            </div>
            <div class="admin-command-check-list">
              ${checks.map(renderAdminCommandCheck).join("")}
            </div>
          </div>
          <div class="admin-quality-flag-list">
            ${Array.isArray(itemAnalytics.flaggedRows) && itemAnalytics.flaggedRows.length ? itemAnalytics.flaggedRows.map(renderAdminItemAnalyticsRow).join("") : '<div class="empty-state">No calibrated item-quality flags yet. Keep collecting independent attempts.</div>'}
          </div>
          ${surplusTopics.length ? `<div class="admin-surplus-topic-list">${surplusTopics.map(renderAdminSurplusTopic).join("")}</div>` : ""}
        </section>
      </section>
    `;
  }

  function renderAdminCenter(model = {}) {
    if (!model.visible) {
      return `
        <section class="admin-center-empty empty-state">
          <strong>Admin Center is for Content Admin.</strong>
          <span>Use the Content Admin account to view release readiness, source queues, and public firewall status.</span>
        </section>
      `;
    }
    const releaseClass = model.release?.ready ? "ok" : "danger";
    const queue = Array.isArray(model.queue) ? model.queue : [];
    const metrics = Array.isArray(model.metrics) ? model.metrics : [];
    const actions = Array.isArray(model.actions) ? model.actions : [];
    const users = model.users || {};
    const questionSystem = model.questions || {};
    const firewall = model.firewall || {};
    const system = model.system || {};
    const publicRelease = model.publicRelease || {};
    const rolePreview = model.rolePreview || {};
    const parentPreview = rolePreview.parent || null;
    const studentPreview = rolePreview.student || null;
    return `
      <div class="admin-center">
        <section class="admin-hero ${releaseClass}">
          <div>
            <p class="eyebrow">Tổng quan vận hành admin</p>
            <h2>${escapeHtml(model.release?.label || "Admin Center")}</h2>
            <p>${escapeHtml(model.release?.detail || "")}</p>
          </div>
          <div class="admin-hero-actions">
            <button id="admin-load-reports" class="button primary" type="button">Cập nhật report</button>
            ${actions.map((action) => `<button class="button secondary admin-action-button" type="button" data-admin-target="${escapeHtml(action.targetView)}">${escapeHtml(action.label)}</button>`).join("")}
          </div>
        </section>

        <section class="admin-preview-tabs" aria-label="Role preview">
          <span>Xem thử vai trò</span>
          <button
            class="admin-impersonate-button"
            type="button"
            ${parentPreview ? `data-admin-account-target="${escapeHtml(parentPreview.accountId)}"` : "disabled"}
            title="${escapeHtml(parentPreview ? `Switch to ${parentPreview.name}` : "No parent account with a linked child")}"
          >Parent${parentPreview?.childCount ? ` (${Number(parentPreview.childCount)} child)` : ""}</button>
          <button
            class="admin-impersonate-button"
            type="button"
            ${studentPreview ? `data-admin-account-target="${escapeHtml(studentPreview.accountId)}"` : "disabled"}
            title="${escapeHtml(studentPreview ? `Switch to ${studentPreview.name}` : "No student account")}"
          >Student</button>
        </section>

        ${renderAdminCockpit(model)}

        <section class="admin-metric-grid">
          ${metrics.map(renderAdminMetric).join("")}
        </section>

        ${renderAdminWorkflowTabs()}
        ${renderAdminContentHeatmap(model.contentPlanner || {})}
        ${renderAdminCurriculumCommand(model.curriculum || {})}

        <section id="admin-public-release" class="admin-public-release-panel ${publicRelease.ready ? "ok" : "danger"}">
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">Cổng phát hành public</p>
              <h3>${escapeHtml(publicRelease.label || "Phát hành đang bị chặn")}</h3>
              <p>${escapeHtml(publicRelease.detail || "Cần manifest có chữ ký nguồn trước khi launch.")}</p>
            </div>
            <button id="admin-export-public-manifest" class="button secondary" type="button">Xuất artifact manifest</button>
          </div>
          <div class="admin-release-metrics">
            ${renderAdminStatusRow({ label: "Sẵn sàng public", value: publicRelease.manifestReady, detail: "scope: câu public đã ký nguồn", tone: publicRelease.ready ? "ok" : "warn" })}
            ${renderAdminStatusRow({ label: "Câu public bị chặn", value: publicRelease.blockedCandidates, detail: "phải xử lý trước phát hành", tone: Number(publicRelease.blockedCandidates || 0) ? "danger" : "ok" })}
            ${renderAdminStatusRow({ label: "Report lỗi mở", value: Number(publicRelease.openAuditEntries || 0), detail: "phải resolve trước phát hành", tone: Number(publicRelease.openAuditEntries || 0) ? "danger" : "ok" })}
            ${renderAdminStatusRow({ label: "Nguồn chưa ký", value: Number(publicRelease.sourceUnsigned || 0), detail: "cần xác nhận source", tone: Number(publicRelease.sourceUnsigned || 0) ? "danger" : "ok" })}
          </div>
          ${renderAdminPublishGuardrails(model)}
          ${
            Array.isArray(publicRelease.blockers) && publicRelease.blockers.length
              ? `<div class="admin-release-blockers">${publicRelease.blockers
                  .slice(0, 4)
                  .map((item) => `<span>${escapeHtml(item.label || item.id || "Release blocker")}</span>`)
                  .join("")}</div>`
              : '<div class="success-line">Cổng phát hành public đang sạch.</div>'
          }
        </section>

        <section class="admin-center-grid">
          <article id="admin-priority-inbox" class="admin-panel admin-review-panel">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Hộp việc ưu tiên</p>
                <h3>Việc có ROI cao nhất trước</h3>
              </div>
            </div>
            <div class="admin-queue-list">
              ${queue.length ? queue.map(renderAdminQueueItem).join("") : '<div class="empty-state">No urgent admin queue items. Use Bank Manager for routine review.</div>'}
            </div>
            ${renderAdminReviewSop()}
          </article>

          <article class="admin-panel">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Quản lý người dùng</p>
                <h3>Tài khoản và quyền truy cập</h3>
              </div>
            </div>
            <div class="admin-firewall-list">
              ${renderAdminMetric({ label: "Tổng tài khoản", value: Number(users.total || 0), detail: "người dùng local", tone: "neutral" })}
              ${renderAdminMetric({ label: "Admin content", value: Number(users.admins || 0), detail: "có quyền quản trị nội dung", tone: "neutral" })}
              ${renderAdminMetric({ label: "Phụ huynh", value: Number(users.parents || 0), detail: "quản lý gia đình", tone: "neutral" })}
              ${renderAdminMetric({ label: "Học sinh", value: Number(users.students || 0), detail: `${Number(users.publicLearners || 0)} public`, tone: "neutral" })}
            </div>
            <div class="admin-domain-list">
              ${renderAdminStatusRow({ label: "Học sinh chưa nối phụ huynh", value: Number(users.unlinkedStudents || 0), detail: "family student thiếu parent link", tone: Number(users.unlinkedStudents || 0) ? "warn" : "ok" })}
              ${renderAdminStatusRow({ label: "Thiếu hồ sơ học tập", value: Number(users.missingProfiles || 0), detail: "có account nhưng chưa init profile", tone: Number(users.missingProfiles || 0) ? "warn" : "ok" })}
            </div>
          </article>

          <article class="admin-panel">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Ngân hàng câu hỏi</p>
                <h3>Tồn kho và trạng thái duyệt</h3>
              </div>
            </div>
            <div class="admin-readiness-strip">
              ${renderAdminMetric({ label: "Toàn bank audit", value: questionSystem.total, detail: "scope: system report", tone: "neutral" })}
              ${renderAdminMetric({ label: "Đã duyệt", value: questionSystem.approved, detail: "reviewed", tone: "ok" })}
              ${renderAdminMetric({ label: "Cần review", value: questionSystem.pending, detail: "needs review", tone: Number(questionSystem.pending || 0) ? "warn" : "ok" })}
              ${renderAdminMetric({ label: "Bị chặn", value: questionSystem.blocked, detail: "rejected/audit/intake", tone: Number(questionSystem.blocked || 0) ? "warn" : "ok" })}
            </div>
            <div class="admin-domain-list">
              ${renderAdminStatusRow({ label: "Đã tải trong browser", value: Number(questionSystem.browserLoaded || 0), detail: "chỉ là trạng thái hydrate hiện tại", tone: "neutral" })}
              ${renderAdminStatusRow({ label: "Original Draft source", value: Number(questionSystem.originalDrafts || 0), detail: "this is one source card, not total system bank", tone: "neutral" })}
              ${renderAdminStatusRow({ label: "Sẵn sàng public", value: questionSystem.publicReady, detail: `${questionSystem.publicPending ?? "--"} câu public bị chặn`, tone: Number(questionSystem.publicPending || 0) ? "warn" : "ok" })}
              ${renderAdminStatusRow({ label: "Draft AI cần duyệt", value: Number(questionSystem.generatedNeedsReview || 0), detail: "AI/Antigravity chờ review", tone: Number(questionSystem.generatedNeedsReview || 0) ? "warn" : "ok" })}
              ${renderAdminStatusRow({ label: "Report lỗi mở", value: Number(questionSystem.openAuditQuestions || 0), detail: `${Number(questionSystem.openAuditEntries || 0)} entry chưa xử lý`, tone: Number(questionSystem.openAuditQuestions || 0) ? "warn" : "ok" })}
              ${renderAdminStatusRow({ label: "File-backed / local", value: `${Number(questionSystem.fileBacked || 0)} / ${Number(questionSystem.localDrafts || 0)}`, detail: "imported banks vs local drafts", tone: "neutral" })}
            </div>
          </article>

          <article class="admin-panel">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Tường an toàn public</p>
                <h3>Phát hành và vault riêng</h3>
              </div>
            </div>
            <div class="admin-firewall-list">
              ${renderAdminMetric({ label: "Ứng viên public", value: Number(firewall.publicCandidates || 0), detail: "candidate pool", tone: "ok" })}
              ${renderAdminMetric({ label: "Sẵn sàng public", value: firewall.manifestReady, detail: "có thể export khi gate sạch", tone: publicRelease.ready ? "ok" : "warn" })}
              ${renderAdminMetric({ label: "Private family", value: Number(firewall.privateFamily || 0), detail: "not public", tone: "neutral" })}
              ${renderAdminMetric({ label: "Vault items", value: Number(firewall.vaultItems || 0), detail: "private only", tone: "warn" })}
              ${renderAdminMetric({ label: "Bị chặn", value: Number(firewall.blockedAudit || 0), detail: "phải giữ ngoài public", tone: Number(firewall.blockedAudit || 0) ? "warn" : "ok" })}
              ${renderAdminMetric({ label: "Nguồn chưa ký", value: Number(firewall.sourceUnsigned || 0), detail: "cần source signature", tone: Number(firewall.sourceUnsigned || 0) ? "warn" : "ok" })}
            </div>
          </article>

          <article class="admin-panel">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Sức khỏe hệ thống</p>
                <h3>Validator và cổng phát hành</h3>
              </div>
            </div>
            <div class="admin-domain-list">
              ${renderAdminStatusRow({ label: "Báo cáo kiểm định", value: system.reportLoaded ? "Đã tải" : "Đang tải", detail: `${Number(system.critical || 0)} blocker nghiêm trọng`, tone: Number(system.critical || 0) ? "danger" : "ok" })}
              ${renderAdminStatusRow({ label: "Nguồn bị chặn", value: Number(system.blockedRows || 0), detail: "source/intake bị loại khỏi release", tone: Number(system.blockedRows || 0) ? "warn" : "ok" })}
              ${renderAdminStatusRow({ label: "Cảnh báo", value: Number(system.warnings || 0), detail: `${Number(system.warningIssues || 0)} issue validator`, tone: Number(system.warnings || 0) ? "warn" : "ok" })}
              ${renderAdminStatusRow({ label: "Readiness report", value: system.readinessLoaded ? "Đã tải" : "Đang tải", detail: `${system.loadedTotal ?? "--"} toàn bank, ${system.coreReadyReviewed ?? "--"} core-ready`, tone: system.readinessLoaded ? "ok" : "warn" })}
            </div>
          </article>
        </section>
      </div>
    `;
  }

  return {
    renderAdminCenter,
    renderCoachDashboard,
    renderDashboardLoop,
    renderDashboardWeakSkills,
    renderDiagnosticReview,
    renderDiagnosticReadinessCard,
    renderDiagnosticReadinessCards,
    renderDailyQuests,
    renderAnswerInputHtml,
    renderEliteReadinessPanel,
    renderExternalStudyLogs,
    renderParentHomePlan,
    renderParentHomeSummary,
    renderExamCoachPlan,
    renderExamDomainBreakdown,
    renderExamMetric,
    renderExamMistakeLedger,
    renderExamPacingProfile,
    renderExamPriorityQueue,
    renderExamReadinessSignal,
    renderExamReviewReport,
    renderExamReviewRow,
    renderKnowledgeReviewCard,
    renderLessonDetail,
    renderLessonList,
    renderPacingAnalyticsPanel,
    renderPracticeFeedback,
    renderPracticeQuestionNavigator,
    renderPracticeQuestionView,
    renderPracticeSessionEndedFeedback,
    renderQuestionStem,
    renderTutorExplanationLayer,
    renderPublicBackendStatus,
    renderProfileDiff,
    renderRemediationQueue,
    renderRoadmapEvalMetric,
    renderRoadmapEvaluationPanel,
    renderReviewChoice,
    renderReviewChoices,
    renderReviewGridIn,
    renderRewardBoard,
    renderStickerShelf,
    renderTopicCards,
    renderTopicSummary,
    shouldUseSplitStem,
    splitQuestionPrompt,
  };
});
