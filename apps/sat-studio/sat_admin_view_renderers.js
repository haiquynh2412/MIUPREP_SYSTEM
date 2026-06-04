(function initSatStudioAdminViewRenderers(root, factory) {
  let richText = root?.SatStudioRichText;
  if (!richText && typeof require === "function") {
    richText = require("./sat_richtext.js");
  }
  const adminViewRenderers = factory(richText);
  if (typeof module === "object" && module.exports) {
    module.exports = adminViewRenderers;
  }
  if (root) {
    root.SatStudioAdminViewRenderers = adminViewRenderers;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioAdminViewRenderers(richText) {
  function escapeHtml(value) {
    if (richText?.escapeHtml) return richText.escapeHtml(value);
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function defaultLabelFor(value) {
    return String(value || "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function metric(label, value, caption = "") {
    return `
      <div>
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(label)}</span>
        ${caption ? `<small>${escapeHtml(caption)}</small>` : ""}
      </div>
    `;
  }

  function renderGenerationIntakePanel(report = {}, context = {}) {
    const summary = report.summary || {};
    const rows = Array.isArray(report.rows) ? report.rows : [];
    const labelFor = context.labelFor || defaultLabelFor;
    const lastApplied = context.lastApplied || null;
    const sourceCounts = Object.entries(summary.bySource || {})
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([source, count]) => `<span>${escapeHtml(labelFor(source))}: ${Number(count || 0)}</span>`)
      .join("");
    const topRows = rows.slice(0, Number(context.rowLimit || 12));
    const appliedLine = lastApplied?.appliedAt
      ? `<span>Last applied: ${escapeHtml(lastApplied.appliedAt)} - changed ${Number(lastApplied.changedCount || 0)}</span>`
      : `<span>Not applied in this browser yet.</span>`;

    return `
      <section class="quality-intake-panel">
        <div class="integrity-section-title">
          <div>
            <strong>Generated bank intake gate</strong>
            <span>Checks AI-generated and Antigravity rows before they become normal practice material.</span>
            ${appliedLine}
          </div>
          ${
            rows.length
              ? '<button class="button secondary integrity-apply-intake" type="button">Apply intake policy</button>'
              : ""
          }
        </div>
        <div class="quality-intake-grid">
          ${metric("generated candidates", Number(summary.total || 0), `max ${Number(report.maxActivePerTopic || 35)} active/topic`)}
          ${metric("blocked", Number(summary.blocked || 0), "hide + admin review")}
          ${metric("needs review", Number(summary.needsReview || 0), "hold before publish")}
          ${metric("remedial", Number(summary.remedial || 0), "practice only after weakness")}
          ${metric("ready", Number(summary.ready || 0), "private passed")}
        </div>
        <div class="quality-intake-source-strip">${sourceCounts || "<span>No generated source counts.</span>"}</div>
        ${
          topRows.length
            ? `<div class="quality-intake-rows">
                ${topRows
                  .map((row) => {
                    const notes = [...(row.issues || []), ...(row.warnings || [])].slice(0, 4);
                    return `
                      <article class="quality-intake-row ${escapeHtml(row.status || "ready")}">
                        <div>
                          <strong>${escapeHtml(row.id || "unknown id")}</strong>
                          <span>${escapeHtml(labelFor(row.status || "ready"))} - ${escapeHtml(row.section || "Unknown")} / ${escapeHtml(row.skill || row.domain || "Unknown")}</span>
                        </div>
                        <p>${escapeHtml(row.promptPreview || "No prompt preview")}</p>
                        <small>${escapeHtml(notes.join("; ") || row.action || "No intake issues.")}</small>
                      </article>
                    `;
                  })
                  .join("")}
              </div>`
            : '<div class="success-line">No generated candidates found.</div>'
        }
      </section>
    `;
  }

  function renderSourceLedgerCards(sourceLedger = {}, statsBySource = {}, context = {}) {
    return Object.entries(sourceLedger)
      .map(([key, source]) => {
        const stats = statsBySource[key] || {};
        const count = Number(stats.count || 0);
        const rejectedTemplate = Number(stats.rejectedTemplate || 0);
        const hiddenSkeleton = Number(stats.hiddenSkeleton || 0);
        const loadingHint =
          key === "opensat" && count === 0
            ? `<div class="source-load-hint">Local bank is not loaded yet. Use "Load Local OpenSAT" or open Practice/Topics to load it automatically.</div>`
            : "";
        const overflowPill = rejectedTemplate ? `<span class="pill">${rejectedTemplate} template variants hidden</span>` : "";
        const skeletonPill = hiddenSkeleton ? `<span class="pill">${hiddenSkeleton} skeleton duplicates hidden</span>` : "";
        return `
          <article class="source-card">
            <h3>${escapeHtml(source.name)}</h3>
            <p>${escapeHtml(source.note)}</p>
            <div class="source-meta">
              <span class="pill">${count} questions in this source</span>
              ${overflowPill}
              ${skeletonPill}
              <span class="pill">${escapeHtml(source.use)}</span>
              <span class="pill">Risk: ${escapeHtml(source.risk)}</span>
            </div>
            ${loadingHint}
          </article>
        `;
      })
      .join("");
  }

  function fileNameFromPath(path = "") {
    return String(path).split(/[\\/]/).filter(Boolean).pop() || "Archive source";
  }

  function renderArchiveRegistrySummary(registry = {}, context = {}) {
    const docs = Array.isArray(registry.documents) ? registry.documents : [];
    const summary = registry.summary || {};
    const highRisk = Number(context.highRisk ?? summary.riskCounts?.High ?? docs.filter((doc) => doc.risk === "High").length);
    const mediumRisk = Number(context.mediumRisk ?? summary.riskCounts?.Medium ?? docs.filter((doc) => doc.risk === "Medium").length);
    const generatedTotal = Number(context.generatedTotal || 0);
    const vaultTotal = Number(context.vaultTotal || 0);
    return `
      <div><strong>${Number(summary.totalFiles || docs.length)}</strong><span>source files in ZIP</span></div>
      <div><strong>${Number(summary.fileTypes?.pdf || docs.filter((doc) => doc.fileType === "pdf").length)}</strong><span>PDF files</span></div>
      <div><strong>${highRisk}</strong><span>high-risk sources</span></div>
      <div><strong>${mediumRisk}</strong><span>medium-risk sources</span></div>
      <div><strong>${generatedTotal}</strong><span>AI drafts linked</span></div>
      <div><strong>${vaultTotal}</strong><span>vault originals linked</span></div>
    `;
  }

  function renderArchiveRegistryList(docs = [], context = {}) {
    const labelFor = context.labelFor || defaultLabelFor;
    return docs
      .map((doc) => {
        const stats = doc.stats || {};
        const sizeMb = doc.sizeBytes ? `${(Number(doc.sizeBytes) / 1024 / 1024).toFixed(1)} MB` : "--";
        return `
          <article class="archive-doc-card risk-${escapeHtml(String(doc.risk || "Unknown").toLowerCase())}">
            <div class="archive-doc-main">
              <strong>${escapeHtml(doc.fileName || fileNameFromPath(doc.path))}</strong>
              <span>${escapeHtml(doc.path)}</span>
              <div class="archive-doc-meta">
                <span>${escapeHtml(labelFor(doc.sourceType || "other"))}</span>
                <span>Risk: ${escapeHtml(doc.risk || "Unknown")}</span>
                <span>${escapeHtml(doc.role || "source")}</span>
                <span>${Number(doc.pageCount || 0) || "--"} pages</span>
                <span>${sizeMb}</span>
                <span>${escapeHtml(doc.recommendation || "review")}</span>
                <span>${Number(doc.vaultCount || 0)} vault</span>
              </div>
            </div>
            <div class="signal-stats compact" aria-label="Generated draft status for source file">
              <div><strong>${Number(stats.total || 0)}</strong><span>generated</span></div>
              <div><strong>${Number(stats.needsReview || 0)}</strong><span>need review</span></div>
              <div><strong>${Number(stats.reviewed || 0)}</strong><span>reviewed</span></div>
              <div><strong>${Number(stats.rejected || 0)}</strong><span>rejected</span></div>
            </div>
            <div class="archive-doc-actions">
              <button class="button secondary archive-vault-intake" type="button" data-source-reference="${escapeHtml(doc.path)}">Vault Intake</button>
              <button class="button secondary archive-use-signal" type="button" data-source-reference="${escapeHtml(doc.path)}">Use + Generate</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderPublicationStatus(question, gate = {}, context = {}) {
    const isContentAdmin = Boolean(context.isContentAdmin);
    const alreadyPublic = question?.visibility === "public_candidate";
    const statusClass = alreadyPublic ? "public" : gate?.ok ? "ready" : "blocked";
    return {
      buttonHidden: !isContentAdmin || !question,
      buttonDisabled: !gate?.ok,
      buttonText: alreadyPublic ? "Public Candidate" : "Promote to Public Candidate",
      statusClassName: `publication-status ${statusClass}`,
      statusText: question ? gate?.reason || "" : "Choose a question to review publication status.",
    };
  }

  function renderQuestionAuditLog(question, entries = [], context = {}) {
    const labelFor = context.labelFor || defaultLabelFor;
    const formatDateTime = context.formatDateTime || ((value) => String(value || ""));
    const rows = Array.isArray(entries) ? entries : [];

    if (!question) {
      return {
        className: "question-audit-log empty-state",
        html: "Choose a question to view audit history.",
      };
    }

    if (!rows.length) {
      return {
        className: "question-audit-log empty-state",
        html: "No audit reports yet. Students can report suspected issues; Content Admin resolves them.",
      };
    }

    const openCount = rows.filter((entry) => entry.status !== "resolved" && entry.status !== "dismissed").length;
    const html = `
      <div class="audit-summary">
        <strong>${rows.length} audit report${rows.length === 1 ? "" : "s"}</strong>
        <span>${openCount} open</span>
      </div>
      ${rows
        .slice(0, 5)
        .map(
          (entry) => `
            <article class="audit-entry severity-${escapeHtml(entry.severity || "medium")} status-${escapeHtml(entry.status || "open")}">
              <strong>${escapeHtml(labelFor(entry.issueType || "other"))} &middot; ${escapeHtml(labelFor(entry.severity || "medium"))}</strong>
              <span>${escapeHtml(entry.status || "open")} &middot; ${escapeHtml(entry.reportedByName || entry.reportedBy || "unknown")} &middot; ${escapeHtml(formatDateTime(entry.reportedAt))}</span>
              <p>${escapeHtml(entry.note || "No note supplied.")}</p>
              ${entry.resolution ? `<small>${escapeHtml(entry.resolution)} &middot; ${escapeHtml(formatDateTime(entry.resolvedAt))}</small>` : ""}
            </article>
          `,
        )
        .join("")}
    `;

    return {
      className: "question-audit-log",
      html,
    };
  }

  function defaultIsGridInQuestion(question) {
    return ["student_produced_response", "grid_in", "numeric"].includes(question?.questionType);
  }

  function defaultGetCorrectAnswerLabel(question) {
    if (!question) return "";
    if (defaultIsGridInQuestion(question)) {
      return String((question.acceptableAnswers || [question.correctAnswer]).filter(Boolean)[0] || question.correctAnswer || "");
    }
    return String(question.correctAnswer || "");
  }

  function defaultPracticePool(question) {
    return question?.practicePool || question?.skeletonDiversity?.practicePool || "core_pool";
  }

  function defaultRenderExplanation(value, selectedAnswer) {
    if (richText?.renderExplanation) return richText.renderExplanation(value, selectedAnswer);
    return escapeHtml(value || "No explanation generated.");
  }

  function renderGeneratedDraftReviewCard(draft, context = {}) {
    if (!draft) return "";
    const choices = draft.choices || {};
    const correctAnswer = draft.correctAnswer || "";
    const correctText = choices[correctAnswer] || "";
    const isGridInQuestion = context.isGridInQuestion || defaultIsGridInQuestion;
    const getCorrectAnswerLabel = context.getCorrectAnswerLabel || defaultGetCorrectAnswerLabel;
    const practicePool = context.practicePool || defaultPracticePool;
    const renderExplanation = context.renderExplanation || defaultRenderExplanation;
    const labelFor = context.labelFor || defaultLabelFor;
    const gridIn = isGridInQuestion(draft);
    const metadata = [
      `${draft.section || "Section"} / ${draft.domain || "Domain"}`,
      draft.skill || "Skill",
      draft.difficulty || "Difficulty",
    ];
    const sourceIndex = draft.sourceQuestionIndex ? `#${draft.sourceQuestionIndex}` : "";
    const status = draft.autoCheck?.status === "passed" ? "Auto-check passed" : labelFor(draft.reviewStatus || "needs_review");
    const compactClass = context.compact ? " compact" : "";

    return `
      <article class="generated-draft-card${compactClass}">
        <div class="draft-card-header">
          <div>
            <p class="eyebrow">Readable review</p>
            <h3>${escapeHtml(draft.skill || "Generated question")}</h3>
            <p>${metadata.map(escapeHtml).join(" &middot; ")}</p>
          </div>
          <div class="draft-card-badges">
            <span class="badge">${escapeHtml(labelFor(draft.sourceType || "ai_generated"))}</span>
            <span class="badge ${escapeHtml(draft.reviewStatus || "")}">${escapeHtml(status)}</span>
            <span class="badge">${escapeHtml(labelFor(draft.visibility || "private_family"))}</span>
            <span class="badge">${escapeHtml(labelFor(practicePool(draft)))}</span>
          </div>
        </div>

        <section class="draft-question-box">
          <span class="draft-label">Question</span>
          <p class="draft-prompt">${escapeHtml(draft.prompt || "No prompt generated.")}</p>
        </section>

        ${
          gridIn
            ? `<div class="draft-grid-answer"><strong>Student-produced response</strong><span>Accepted: ${escapeHtml(getCorrectAnswerLabel(draft))}</span></div>`
            : `<div class="draft-choice-list" aria-label="Answer choices">
                ${["A", "B", "C", "D"]
                  .map((key) => {
                    const isCorrect = key === correctAnswer;
                    return `
                      <div class="draft-choice ${isCorrect ? "correct" : ""}">
                        <span class="choice-key">${key}</span>
                        <span class="choice-text">${escapeHtml(choices[key] || "")}</span>
                      </div>
                    `;
                  })
                  .join("")}
              </div>`
        }

        <section class="draft-answer-panel">
          <div>
            <span class="draft-label">Correct answer</span>
            <strong>${escapeHtml(gridIn ? getCorrectAnswerLabel(draft) : correctAnswer)}${correctText ? `. ${escapeHtml(correctText)}` : ""}</strong>
          </div>
          <div>
            <span class="draft-label">Explanation</span>
            <div class="rich-explanation">${renderExplanation(draft.explanation || "No explanation generated.", draft.correctAnswer)}</div>
          </div>
        </section>

        <div class="draft-source-grid">
          <span><strong>Source reference:</strong> ${escapeHtml(draft.sourceReference || "None")}</span>
          <span><strong>Signal:</strong> ${escapeHtml(draft.sourceSignalId || "manual brief")} ${escapeHtml(sourceIndex)}</span>
        </div>
      </article>
    `;
  }

  function renderSourceSignalList(signals = [], context = {}) {
    const labelFor = context.labelFor || defaultLabelFor;
    const getSignalDraftStats = context.getSignalDraftStats || (() => ({ total: 0, needsReview: 0, reviewed: 0, rejected: 0 }));
    if (!context.canAccessPrivateContent) {
      return {
        className: "signal-list empty-state",
        html: "Public accounts cannot view private source signals.",
      };
    }
    const rows = Array.isArray(signals) ? signals : [];
    if (!rows.length) {
      return {
        className: "signal-list empty-state",
        html: "No source signals saved yet.",
      };
    }

    const html =
      `
        <div class="signal-list-summary">
          <strong>${rows.length} source signals ready</strong>
          <span>${rows.filter((signal) => String(signal.id || "").startsWith("archive-signal-")).length} from SAT archive. These are metadata only, not imported questions.</span>
        </div>
      ` +
      rows
        .map((signal) => {
          const stats = getSignalDraftStats(signal) || {};
          const total = Number(stats.total || 0);
          return `
            <div class="signal-card">
              <div class="signal-card-main">
                <strong>${escapeHtml(signal.skill)} &middot; ${escapeHtml(signal.difficulty)}</strong>
                <span>${escapeHtml(labelFor(signal.sourceKind))} &middot; ${escapeHtml(signal.domain)} &middot; ${escapeHtml(signal.sourceReference || "No reference")}</span>
                <span>${escapeHtml(signal.mistakePattern || signal.learningGoal || "No pattern recorded.")}</span>
              </div>
              <div class="signal-stats" aria-label="Generated draft status">
                <div><strong>${total}</strong><span>generated</span></div>
                <div><strong>${Number(stats.needsReview || 0)}</strong><span>need review</span></div>
                <div><strong>${Number(stats.reviewed || 0)}</strong><span>reviewed</span></div>
                <div><strong>${Number(stats.rejected || 0)}</strong><span>rejected</span></div>
              </div>
              ${total ? `<span class="signal-warning">Already generated ${total} draft${total > 1 ? "s" : ""} from this file/signal. Review existing drafts before generating more.</span>` : ""}
              <button class="button secondary use-signal" type="button" data-signal-id="${escapeHtml(signal.id)}">Use + Generate</button>
            </div>
          `;
        })
        .join("");

    return {
      className: "signal-list",
      html,
    };
  }

  function renderBankImportResult(result = {}) {
    return `
      <strong>${Number(result.imported || 0)} questions imported</strong>
      <span>${escapeHtml(result.fileName || "question bank")} &middot; ${result.forcePrivateVault ? "locked to Private Family Vault" : "imported as needs_review where status was missing"}.</span>
      ${result.forcePrivateVault && result.activeVaultSourceReference ? `<span>Vault source: ${escapeHtml(result.activeVaultSourceReference)}</span>` : ""}
      ${result.forcePrivateVault ? "<span>Public accounts cannot see these questions; keep them out of public exports/releases.</span>" : ""}
    `;
  }

  function renderVaultIntakeReady(intake = {}) {
    return `
      <strong>Vault intake ready</strong>
      <span>Selected source: ${escapeHtml(intake.sourceReference || "Manual private source")}</span>
      <span>Convert this source to SAT Studio JSON, then choose the JSON file here. Imported questions will be private_family only.</span>
    `;
  }

  function renderVaultSummary(summary = {}) {
    if (summary.hidden) return "Vault Mode is hidden from public accounts.";
    if (!summary.total) {
      return `
        <strong>No Private Family Vault questions imported yet.</strong>
        <span>Use Vault Intake from SAT Archive Registry, convert that file to SAT Studio JSON, then import it with Vault mode enabled.</span>
      `;
    }
    return `
      <div><strong>${Number(summary.total || 0)}</strong><span>private vault questions</span></div>
      <div><strong>${Number(summary.reviewed || 0)}</strong><span>reviewed</span></div>
      <div><strong>${Number(summary.needsReview || 0)}</strong><span>need review</span></div>
      <div><strong>${Number(summary.sources || 0)}</strong><span>source files</span></div>
      <p>Active intake: ${escapeHtml(summary.activeVaultSourceReference || "manual JSON import")}</p>
    `;
  }

  function renderPdfInspectPending(model = {}) {
    return `
      <strong>${escapeHtml(model.fileName || "uploaded.pdf")} selected &middot; ${escapeHtml(model.sizeMb || "--")} MB</strong>
      <span>Inspecting the PDF locally. No question text will be imported at this step.</span>
    `;
  }

  function renderPdfInspectError(model = {}) {
    return `
      <strong>${escapeHtml(model.fileName || "uploaded.pdf")} selected &middot; ${escapeHtml(model.sizeMb || "--")} MB</strong>
      <span>PDF upload UI is ready, but the local Python server needs the new /api/pdf-inspect endpoint running.</span>
      <span>Restart server.py, then select the PDF again. For official PDFs, keep metadata only and do not import prompts or answer choices.</span>
      <span>${escapeHtml(model.message || "Unknown PDF inspection error.")}</span>
    `;
  }

  function renderPdfInspection(model = {}) {
    const warningItems = (model.warnings || []).map((warning) => `<span>${escapeHtml(warning)}</span>`).join("");
    return `
      <strong>${escapeHtml(model.title || "PDF inspected")}</strong>
      <span>File: ${escapeHtml(model.filename || "uploaded.pdf")} &middot; ${escapeHtml(model.sizeMb || "--")} MB</span>
      <span>Pages: ${escapeHtml(model.pageCount || "--")} &middot; Extractable text: ${Number(model.extractablePagesSampled || 0)} sampled pages &middot; Risk: ${escapeHtml(model.risk || "Unknown")}</span>
      <span>${escapeHtml(model.recommendation || "")}</span>
      ${warningItems}
      ${
        model.metadataOnly
          ? '<div class="pdf-actions"><button id="log-pdf-metadata" class="button secondary" type="button">Log metadata only</button></div>'
          : "<span>Next step: convert to SAT Studio JSON outside the bank, keep source/license fields, then import the JSON file above.</span>"
      }
    `;
  }

  function statusTone(value = "") {
    const text = String(value || "").toLowerCase();
    if (["reviewed", "public_candidate_reviewed", "core_pool", "active", "passed"].some((item) => text.includes(item))) return "ok";
    if (["needs_review", "pending", "private_similarity_review", "remedial_pool", "open"].some((item) => text.includes(item))) return "warn";
    if (["rejected", "blocked", "hidden_duplicate", "fail"].some((item) => text.includes(item))) return "danger";
    return "neutral";
  }

  function renderStatusBadge(value = "", labelFor = defaultLabelFor) {
    return `<span class="status-badge ${statusTone(value)}">${escapeHtml(labelFor(value || "unknown"))}</span>`;
  }

  function renderQuestionAdminSummary(summary = {}) {
    const metric = (label, value, detail = "", tone = "neutral") => `
      <article class="account-mini-metric tone-${escapeHtml(tone)}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value ?? 0))}</strong>
        ${detail ? `<small>${escapeHtml(detail)}</small>` : ""}
      </article>
    `;
    return `
      <section class="account-admin-summary question-admin-summary" aria-label="Question administration summary">
        ${metric("Loaded questions", summary.total, "visible to admin")}
        ${metric("Reviewed", summary.reviewed, "approved for study", "ok")}
        ${metric("Needs review", summary.needsReview, "human decision required", summary.needsReview ? "warn" : "ok")}
        ${metric("Blocked/rejected", summary.blocked, "excluded from study", summary.blocked ? "danger" : "ok")}
        ${metric("Hidden duplicates", summary.hiddenDuplicate, "kept out of normal practice", summary.hiddenDuplicate ? "warn" : "neutral")}
        ${metric("Public-ready", summary.publicReady, "safe candidates", "ok")}
      </section>
    `;
  }

  function renderQuestionGroupList(groups = []) {
    if (!groups.length) return '<div class="empty-state">No question groups match the current filters.</div>';
    return `
      <div class="question-group-list">
        ${groups
          .map(
            (group) => `
              <article class="question-group-row">
                <div>
                  <strong>${escapeHtml(group.skill || "Unknown skill")}</strong>
                  <span>${escapeHtml([group.section, group.domain].filter(Boolean).join(" / ") || "Unknown section")}</span>
                </div>
                <div class="question-group-stats">
                  <span>${Number(group.total || 0)} total</span>
                  <span>${Number(group.needsReview || 0)} pending</span>
                  <span>${Number(group.blocked || 0)} blocked</span>
                  <span>${Number(group.hiddenDuplicate || 0)} hidden</span>
                </div>
                <button class="button tiny secondary" type="button" data-question-group-action="open" data-section="${escapeHtml(group.section || "")}" data-domain="${escapeHtml(
                  group.domain || "",
                )}" data-skill="${escapeHtml(group.skill || "")}">Open group</button>
              </article>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderQuestionAdminRows(rows = [], context = {}) {
    const labelFor = context.labelFor || defaultLabelFor;
    if (!rows.length) return '<div class="empty-state">No questions match the current filters.</div>';
    return `
      <div class="admin-table-wrap question-admin-table-wrap">
        <table class="admin-data-table question-management-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Taxonomy</th>
              <th>Source</th>
              <th>Review</th>
              <th>Pool</th>
              <th>Audit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (question) => `
                  <tr class="${question.id === context.selectedQuestionId ? "selected" : ""}">
                    <td>
                      <strong>${escapeHtml(question.id || "question")}</strong>
                      <span>${escapeHtml(String(question.prompt || "No prompt").slice(0, 120))}${String(question.prompt || "").length > 120 ? "..." : ""}</span>
                    </td>
                    <td>
                      <strong>${escapeHtml(question.skill || "Unknown skill")}</strong>
                      <span>${escapeHtml([question.section, question.domain, question.difficulty].filter(Boolean).join(" / "))}</span>
                    </td>
                    <td>
                      <strong>${escapeHtml(labelFor(question.sourceType || "unknown"))}</strong>
                      <span>${escapeHtml(question.sourceName || question.licenseNote || "No source note")}</span>
                    </td>
                    <td>${renderStatusBadge(question.reviewStatus || "needs_review", labelFor)}</td>
                    <td>${renderStatusBadge(question.practicePool || question.skeletonDiversity?.practicePool || "core_pool", labelFor)}</td>
                    <td>
                      ${renderStatusBadge(question.auditStatus || question.publicationStatus || "not_flagged", labelFor)}
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="button tiny secondary" type="button" data-question-action="select" data-question-id="${escapeHtml(question.id)}">Details</button>
                        <button class="button tiny secondary" type="button" data-question-action="reviewed" data-question-id="${escapeHtml(question.id)}">Approve</button>
                        <button class="button tiny secondary" type="button" data-question-action="needs_review" data-question-id="${escapeHtml(question.id)}">Needs review</button>
                        <button class="button tiny danger" type="button" data-question-action="block" data-question-id="${escapeHtml(question.id)}">Block</button>
                      </div>
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderQuestionChoices(question = {}, context = {}) {
    const labelFor = context.labelFor || defaultLabelFor;
    const correct = question.correctAnswer || "";
    if (defaultIsGridInQuestion(question)) {
      const accepted = (question.acceptableAnswers || [correct]).filter(Boolean).join(", ");
      return `<div class="draft-grid-answer admin-question-choice"><strong>Student-produced response</strong><span>Accepted: ${escapeHtml(accepted || correct || "--")}</span></div>`;
    }
    return `
      <div class="draft-choice-list admin-question-choice" aria-label="Answer choices">
        ${["A", "B", "C", "D"]
          .map(
            (key) => `
              <div class="draft-choice ${key === correct ? "correct" : ""}">
                <span class="choice-key">${key}</span>
                <span class="choice-text">${escapeHtml(question.choices?.[key] || "")}</span>
              </div>
            `,
          )
          .join("")}
      </div>
      <p class="muted">Correct answer: ${escapeHtml(labelFor(correct || "--"))}</p>
    `;
  }

  function adminQuestionQualityGates(question = {}) {
    const prompt = String(question.prompt || "");
    const explanation = String(question.explanation || "");
    const choices = question.choices || {};
    const isGrid = defaultIsGridInQuestion(question);
    const hasChoices = isGrid || ["A", "B", "C", "D"].every((key) => String(choices[key] || "").trim());
    const issueText = `${question.auditStatus || ""} ${question.publicationStatus || ""} ${question.licenseNote || ""}`.toLowerCase();
    const gates = [
      { label: "Format", ok: Boolean(prompt.trim() && hasChoices && (question.correctAnswer || question.expectedAnswer || question.acceptableAnswers?.length)) },
      { label: "Blueprint", ok: Boolean(question.section && question.domain && question.skill && question.difficulty) },
      { label: "Answer", ok: Boolean(question.correctAnswer || question.expectedAnswer || question.acceptableAnswers?.length) && !/answer|invalid|mismatch/.test(issueText) },
      { label: "Explanation", ok: explanation.length >= 80 || /step|because|therefore|so|do đó|vì/.test(explanation.toLowerCase()) },
      { label: "Trap", ok: isGrid || /trap|distractor|choice [abcd]|option [abcd]|why [abcd]|sai|nhầm|wrong/.test(explanation.toLowerCase()) },
      { label: "Tags", ok: Boolean(question.sourceType && (question.section !== "Math" || question.calculatorUse || question.calculatorStrategy || question.calculatorTags || question.mathToolTags)) },
    ];
    const passed = gates.filter((gate) => gate.ok).length;
    return { gates, score: Math.round((passed / gates.length) * 100), passed };
  }

  function renderQuestionQualityGate(question = {}) {
    const summary = adminQuestionQualityGates(question);
    return `
      <section class="admin-question-quality-gate">
        <div>
          <span class="draft-label">Quality gate</span>
          <strong>${summary.score}/100</strong>
          <small>${summary.passed}/6 cửa đạt trước khi duyệt/public</small>
        </div>
        <div class="admin-mini-gates">
          ${summary.gates.map((gate) => `<span class="${gate.ok ? "ok" : "warn"}">${escapeHtml(gate.label)}</span>`).join("")}
        </div>
      </section>
    `;
  }

  function renderQuestionAdminDetail(question = null, context = {}) {
    const labelFor = context.labelFor || defaultLabelFor;
    if (!question) {
      return `
        <article class="admin-question-detail empty-state">
          Select a question to inspect prompt, answer, source policy, audit status, and available admin actions.
        </article>
      `;
    }
    const metaRows = [
      ["Review", labelFor(question.reviewStatus || "needs_review")],
      ["Visibility", labelFor(question.visibility || "private_family")],
      ["Publication", labelFor(question.publicationStatus || "not_set")],
      ["Practice pool", labelFor(question.practicePool || question.skeletonDiversity?.practicePool || "core_pool")],
      ["Source", labelFor(question.sourceType || "unknown")],
      ["Audit", labelFor(question.auditStatus || "not_flagged")],
    ];
    return `
      <article class="admin-question-detail">
        <div class="draft-card-header">
          <div>
            <p class="eyebrow">Question detail</p>
            <h3>${escapeHtml(question.skill || question.id || "Question")}</h3>
            <p>${escapeHtml([question.section, question.domain, question.difficulty].filter(Boolean).join(" / "))}</p>
          </div>
          <div class="draft-card-badges">
            ${renderStatusBadge(question.reviewStatus || "needs_review", labelFor)}
            ${renderStatusBadge(question.practicePool || question.skeletonDiversity?.practicePool || "core_pool", labelFor)}
            ${renderStatusBadge(question.visibility || "private_family", labelFor)}
          </div>
        </div>
        <section class="draft-question-box admin-question-preview">
          <span class="draft-label">Prompt</span>
          <p class="draft-prompt">${escapeHtml(question.prompt || "No prompt recorded.")}</p>
        </section>
        ${renderQuestionChoices(question, context)}
        ${renderQuestionQualityGate(question)}
        <section class="draft-answer-panel admin-question-explanation">
          <div>
            <span class="draft-label">Explanation</span>
            <div class="rich-explanation">${context.renderExplanation ? context.renderExplanation(question.explanation || "No explanation recorded.", question.correctAnswer) : escapeHtml(question.explanation || "")}</div>
          </div>
        </section>
        <div class="admin-readable-grid">
          ${metaRows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "--")}</strong></div>`).join("")}
        </div>
        <div class="draft-source-grid">
          <span><strong>Question ID:</strong> ${escapeHtml(question.id || "")}</span>
          <span><strong>Source name:</strong> ${escapeHtml(question.sourceName || "No source name")}</span>
          <span><strong>License/source note:</strong> ${escapeHtml(question.licenseNote || "No license note")}</span>
          <span><strong>Skeleton:</strong> ${escapeHtml(question.skeletonDiversity?.skeletonId || question.skeletonId || "not recorded")}</span>
        </div>
        <div class="answer-actions">
          <button class="button secondary" type="button" data-question-action="reviewed" data-question-id="${escapeHtml(question.id)}">Approve</button>
          <button class="button secondary" type="button" data-question-action="needs_review" data-question-id="${escapeHtml(question.id)}">Send to review</button>
          <button class="button secondary" type="button" data-question-action="remedial_pool" data-question-id="${escapeHtml(question.id)}">Use for remediation only</button>
          <button class="button secondary" type="button" data-question-action="hidden_duplicate" data-question-id="${escapeHtml(question.id)}">Hide duplicate</button>
          <button class="button danger" type="button" data-question-action="block" data-question-id="${escapeHtml(question.id)}">Block</button>
        </div>
      </article>
    `;
  }

  function renderQuestionAdminManager(model = {}, context = {}) {
    return `
      ${renderQuestionAdminSummary(model.summary || {})}
      <section class="question-admin-layout">
        <div>
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">Question groups</p>
              <h3>Groups needing admin attention</h3>
            </div>
          </div>
          ${renderQuestionGroupList(model.groups || [])}
        </div>
        <div>
          <div class="section-heading compact">
            <div>
              <p class="eyebrow">Question rows</p>
              <h3>${Number(model.filteredCount || 0)} matching questions</h3>
              <p class="muted">Showing first ${Number(model.rows?.length || 0)}. Use filters or search by ID/skill/source to narrow the list.</p>
            </div>
          </div>
          ${renderQuestionAdminRows(model.rows || [], { ...context, selectedQuestionId: model.selectedQuestionId })}
        </div>
      </section>
      ${renderQuestionAdminDetail(model.selectedQuestion || null, context)}
    `;
  }

  return {
    renderArchiveRegistryList,
    renderArchiveRegistrySummary,
    renderBankImportResult,
    renderGeneratedDraftReviewCard,
    renderGenerationIntakePanel,
    renderPdfInspectError,
    renderPdfInspectPending,
    renderPdfInspection,
    renderPublicationStatus,
    renderQuestionAdminManager,
    renderQuestionAuditLog,
    renderSourceLedgerCards,
    renderSourceSignalList,
    renderVaultIntakeReady,
    renderVaultSummary,
  };
});
