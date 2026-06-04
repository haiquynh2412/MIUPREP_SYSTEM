(function initSatStudioAccountViewRenderers(root, factory) {
  let richText = root?.SatStudioRichText;
  if (!richText && typeof require === "function") {
    richText = require("./sat_richtext.js");
  }
  const accountViewRenderers = factory(richText);
  if (typeof module === "object" && module.exports) {
    module.exports = accountViewRenderers;
  }
  if (root) {
    root.SatStudioAccountViewRenderers = accountViewRenderers;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioAccountViewRenderers(richText) {
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

  function accountInitials(account = {}) {
    const clean = String(account.avatarInitials || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 2);
    if (clean) return clean;
    return (
      String(account.name || account.id || "S")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 2) || "S"
    );
  }

  function avatarColor(account = {}) {
    return ["teal", "blue", "coral", "amber", "slate"].includes(account.avatarColor) ? account.avatarColor : "teal";
  }

  function renderAccountIdentity(account = {}) {
    const email = account.email ? `<span>${escapeHtml(account.email)}</span>` : "";
    const grade = account.gradeLevel ? `<span>${escapeHtml(account.gradeLevel)}</span>` : "";
    return `
      <div class="account-identity-cell">
        <div class="account-avatar small avatar-${escapeHtml(avatarColor(account))}">${escapeHtml(accountInitials(account))}</div>
        <div>
          <strong>${escapeHtml(account.name || account.id)}</strong>
          <span>${escapeHtml(account.id || "")}</span>
          ${email || grade ? `<div class="account-meta-line">${email}${grade}</div>` : ""}
        </div>
      </div>
    `;
  }

  function renderStorageHealthCard(storage = {}) {
    return `
      <article class="account-monitor-card storage-health ${escapeHtml(storage.level || "ok")}">
        <span>Local storage</span>
        <strong>${escapeHtml(storage.label || "Healthy")}</strong>
        <p>${escapeHtml(storage.bytesLabel || "0 B")} stored - ${escapeHtml(storage.chunkLabel || "single record")}</p>
        <p>${escapeHtml(storage.message || "Export periodically for safety.")} Use Export in the top bar for a JSON backup.</p>
        <p>${
          storage.publicApiReady
            ? "Public backend adapter ready: /api/public can sync accounts, progress, and audit logs after server login is enabled."
            : "Public backend adapter not loaded."
        }</p>
      </article>
    `;
  }

  function renderAccountMetric(label, value, caption) {
    return `
      <article class="account-monitor-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value ?? ""))}</strong>
        <p>${escapeHtml(caption || "")}</p>
      </article>
    `;
  }

  function statusTone(status = "active") {
    if (status === "active") return "ok";
    if (status === "suspended") return "warn";
    return "danger";
  }

  function renderMiniMetric(label, value, caption = "") {
    return `
      <article class="account-mini-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value ?? ""))}</strong>
        ${caption ? `<small>${escapeHtml(caption)}</small>` : ""}
      </article>
    `;
  }

  function roleCount(accounts = [], role) {
    return accounts.filter((account) => account.role === role).length;
  }

  function statusCount(accounts = [], status) {
    return accounts.filter((account) => (account.status || "active") === status).length;
  }

  function renderAccountAdminSummary(accounts = []) {
    const students = accounts.filter((account) => account.role === "student");
    const linkedStudents = students.filter((account) => Array.isArray(account.parentIds) && account.parentIds.length);
    return `
      <section class="account-admin-summary" aria-label="Account administration summary">
        ${renderMiniMetric("Total accounts", accounts.length, "local access records")}
        ${renderMiniMetric("Students", roleCount(accounts, "student"), `${linkedStudents.length} linked`)}
        ${renderMiniMetric("Parents", roleCount(accounts, "parent"), "family managers")}
        ${renderMiniMetric("Admins", roleCount(accounts, "admin"), "content/system access")}
        ${renderMiniMetric("Locked", statusCount(accounts, "suspended") + statusCount(accounts, "disabled"), "cannot sign in")}
      </section>
    `;
  }

  function renderAccountStatusBadge(status = "active", labelFor = defaultLabelFor) {
    const normalized = status || "active";
    return `<span class="status-badge ${statusTone(normalized)}">${escapeHtml(labelFor(normalized))}</span>`;
  }

  function renderAccountActions(account = {}, context = {}) {
    const currentAccountId = context.currentAccountId || "";
    const status = account.status || "active";
    const canEdit = context.canEditById ? Boolean(context.canEditById[account.id]) : context.canEdit !== false;
    const canDelete = Boolean(context.canDeleteById?.[account.id]);
    const canChangeStatus = Boolean(context.canChangeStatusById?.[account.id]);
    const nextStatus = status === "active" ? "suspended" : "active";
    const lockLabel = status === "active" ? "Lock" : "Activate";
    return `
      <div class="table-actions">
        <button class="button tiny secondary" type="button" data-account-action="edit" data-account-id="${escapeHtml(account.id)}" ${canEdit ? "" : "disabled"}>Edit</button>
        <button class="button tiny secondary" type="button" data-account-action="status" data-account-status="${escapeHtml(nextStatus)}" data-account-id="${escapeHtml(account.id)}" ${
          canChangeStatus ? "" : "disabled"
        }>${escapeHtml(lockLabel)}</button>
        <button class="button tiny danger" type="button" data-account-action="delete" data-account-id="${escapeHtml(account.id)}" ${
          canDelete && currentAccountId !== account.id ? "" : "disabled"
        }>Delete</button>
      </div>
    `;
  }

  function renderStudentMonitorCard(student = {}, progress = {}) {
    return `
      <article class="account-monitor-card">
        <div>
          <span>${escapeHtml(student.scope === "public" ? "Public student" : "Family student")}</span>
          <strong>${escapeHtml(student.name || "Student")}</strong>
        </div>
        <div class="account-monitor-stats">
          <span>${Number(progress.accuracy || 0)}% accuracy</span>
          <span>${Number(progress.attempts || 0)} attempts</span>
          <span>${escapeHtml(progress.latestBaseline || "No diagnostic")}</span>
        </div>
        <p>${escapeHtml(progress.schedule || "No session scheduled")} - ${Number(progress.weeklyTarget || 0)} sessions/week</p>
        <p>${Number(progress.points || 0)} points - ${Number(progress.streak || 0)} day streak - ${Number(progress.externalMinutes || 0)} outside minutes</p>
      </article>
    `;
  }

  function renderAccountOverview(account = null, context = {}) {
    if (!account) return "";
    const storageHtml = renderStorageHealthCard(context.storageHealth || {});
    const progressById = context.progressById || {};
    const students = Array.isArray(context.students) ? context.students : [];

    if (account.role === "student") {
      const progress = progressById[account.id] || {};
      return `
        <section class="account-overview-grid">
          ${storageHtml}
          ${renderAccountMetric("My Accuracy", `${Number(progress.accuracy || 0)}%`, `${Number(progress.attempts || 0)} attempts`)}
          ${renderAccountMetric("Study Points", Number(progress.points || 0), `${Number(progress.streak || 0)} day streak`)}
          ${renderAccountMetric("Schedule", progress.schedule || "No session scheduled", `${Number(progress.weeklyTarget || 0)} sessions/week`)}
        </section>
      `;
    }

    if (!students.length) {
      return `
        <section class="account-overview-grid">${storageHtml}</section>
        <div class="empty-state">No linked students yet. Create a student account and link it to a parent.</div>
      `;
    }

    return `
      <section class="account-overview-grid">
        ${storageHtml}
        ${students.map((student) => renderStudentMonitorCard(student, progressById[student.id] || {})).join("")}
      </section>
    `;
  }

  function renderAccountList(accounts = [], context = {}) {
    const progressById = context.progressById || {};
    const latestById = context.latestById || {};
    const parentNamesById = context.parentNamesById || {};
    const labelFor = context.labelFor || defaultLabelFor;
    if (!accounts.length) {
      return '<div class="empty-state">No accounts are visible for this role.</div>';
    }
    const rows = accounts
      .map((account) => {
        const progress = progressById[account.id] || {};
        const latest = latestById[account.id] || null;
        const scope = account.scope || "family";
        const parents = parentNamesById[account.id] || [];
        const theme = account.uiTheme === "teen_quest" ? "Teen Quest" : "Focus Studio";
        const status = account.status || "active";
        const parentLine = parents.length ? parents.join(", ") : account.role === "student" ? "No linked parent" : "Not applicable";
        const permissions = account.permissions || {};
        const permissionLine =
          account.role === "parent"
            ? [
                permissions.rewardManager !== false ? "Rewards" : "",
                permissions.questionContributor ? "Authoring" : "",
              ].filter(Boolean).join(", ") || "No extra permissions"
            : account.role === "admin"
              ? "Full system permissions"
              : "Learner";
        return `
          <tr class="account-row status-${escapeHtml(status)}">
            <td>
              ${renderAccountIdentity(account)}
            </td>
            <td>
              <strong>${escapeHtml(labelFor(account.role || "student"))}</strong>
              <span>${escapeHtml(labelFor(scope))}</span>
              <span>${escapeHtml(permissionLine)}</span>
            </td>
            <td>${renderAccountStatusBadge(status, labelFor)}</td>
            <td>
              <strong>${escapeHtml(account.targetScore || "--")}</strong>
              <span>${escapeHtml(theme)}</span>
            </td>
            <td>
              <strong>${Number(progress.accuracy || 0)}%</strong>
              <span>${Number(progress.attempts || 0)} attempts${latest ? ` - baseline ${escapeHtml(latest.scoreEstimate)}` : ""}</span>
            </td>
            <td>
              <strong>${escapeHtml(parentLine)}</strong>
              <span>${escapeHtml(progress.schedule || "No session scheduled")}</span>
            </td>
            <td>
              <span>${escapeHtml(account.passcode ? `${String(account.passcode).length} chars` : "not set")}</span>
            </td>
            <td>${renderAccountActions(account, context)}</td>
          </tr>
        `;
      })
      .join("");
    return `
      ${renderAccountAdminSummary(accounts)}
      <div class="admin-table-wrap">
        <table class="admin-data-table account-management-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Role / scope</th>
              <th>Status</th>
              <th>Target / theme</th>
              <th>Progress</th>
              <th>Parent / schedule</th>
              <th>Passcode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="admin-footnote">Local passcodes are for the browser MVP. Before public release, use backend auth, RBAC, audit logs, and server-side session revocation.</p>
    `;
  }

  return {
    renderAccountAdminSummary,
    renderAccountList,
    renderAccountMetric,
    renderAccountOverview,
    renderStorageHealthCard,
    renderStudentMonitorCard,
  };
});
