(function initSatDesignSystem(root, factory) {
  const designSystem = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = designSystem;
  }
  if (root) {
    root.SatDesignSystem = designSystem;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatDesignSystem() {
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function attrsToHtml(attrs = {}) {
    return Object.entries(attrs)
      .filter(([, value]) => value !== false && value !== null && value !== undefined)
      .map(([key, value]) => (value === true ? ` ${escapeHtml(key)}` : ` ${escapeHtml(key)}="${escapeHtml(value)}"`))
      .join("");
  }

  function button({ label = "", variant = "secondary", className = "", type = "button", attrs = {} } = {}) {
    return `<button class="button ${escapeHtml(variant)} ${escapeHtml(className)}" type="${escapeHtml(type)}"${attrsToHtml(attrs)}>${escapeHtml(label)}</button>`;
  }

  function badge(label = "", tone = "") {
    return `<span class="badge ${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
  }

  function skeletonRows(count = 3) {
    return Array.from({ length: Math.max(1, Number(count) || 3) }, () => '<span class="ds-skeleton-line"></span>').join("");
  }

  function loadingPanel({ eyebrow = "Analyzing", title = "Working on your plan", lines = [], skeletonCount = 3 } = {}) {
    const body = Array.isArray(lines) && lines.length ? lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("") : skeletonRows(skeletonCount);
    return `
      <section class="ds-loading-panel" aria-live="polite">
        <div class="ds-loading-spinner"></div>
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
          <div class="ds-loading-lines">${body}</div>
        </div>
      </section>
    `;
  }

  return { badge, button, escapeHtml, loadingPanel, skeletonRows };
});
