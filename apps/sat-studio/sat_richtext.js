(function initSatStudioRichText(root, factory) {
  const richText = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = richText;
  }
  if (root) {
    root.SatStudioRichText = richText;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioRichText() {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function looksLikeInlineMath(content = "") {
    const text = String(content || "").trim();
    if (!text) return false;
    if (/^[A-Za-z]$/.test(text)) return true;
    if (/\\(frac|sqrt|pi|cdot|times|leq|geq|neq|sin|cos|tan)\b/.test(text)) return true;
    if (/[=^_{}]/.test(text)) return true;
    if (/[A-Za-z]\s*[+\-*/]\s*[A-Za-z0-9(]/.test(text)) return true;
    if (/[0-9)]\s*[+\-*/]\s*[A-Za-z(]/.test(text)) return true;
    if (/^[0-9+\-*/().\s]+$/.test(text) && /[+\-*/^]/.test(text)) return true;
    return false;
  }

  function renderMathToken(content = "") {
    let html = escapeHtml(String(content || "").trim());
    html = html
      .replace(/\\pi\b/g, "π")
      .replace(/\\cdot\b/g, "·")
      .replace(/\\times\b/g, "×")
      .replace(/\\leq\b/g, "≤")
      .replace(/\\geq\b/g, "≥")
      .replace(/\\neq\b/g, "≠")
      .replace(/\\approx\b/g, "≈")
      .replace(/\\sqrt\{([^{}]+)\}/g, "√($1)")
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '<span class="math-frac"><span>$1</span><span>$2</span></span>')
      .replace(/([A-Za-z0-9)\]}])\^\{([^{}]+)\}/g, "$1<sup>$2</sup>")
      .replace(/([A-Za-z0-9)\]}])\^\(([^()\n]{1,40})\)/g, "$1<sup>$2</sup>")
      .replace(/([A-Za-z0-9)\]}])\^(-?\d+|[A-Za-z])/g, "$1<sup>$2</sup>")
      .replace(/([A-Za-z0-9)\]}])_\{([^{}]+)\}/g, "$1<sub>$2</sub>")
      .replace(/([A-Za-z0-9)\]}])_(-?\d+|[A-Za-z])/g, "$1<sub>$2</sub>")
      .replace(/\\([A-Za-z]+)/g, "$1");
    return `<span class="math-inline">${html}</span>`;
  }

  function protectBareMath(value, stash) {
    const text = String(value ?? "");
    const latexCommand = /\\(?:frac\{[^{}\n]{1,80}\}\{[^{}\n]{1,80}\}|sqrt\{[^{}\n]{1,120}\}|(?:pi|cdot|times|leq|geq|neq|approx|sin|cos|tan)\b)/g;
    const exponentToken = /(?:\d*[A-Za-z][A-Za-z0-9]*|\d+|\([^()\n]{1,40}\))\^(?:\{[^{}\n]{1,40}\}|\([^()\n]{1,40}\)|[-+]?\d+|[A-Za-z])/g;
    const subscriptToken = /\b[A-Za-z][A-Za-z0-9]*_(?:\{[^{}\n]{1,40}\}|[-+]?\d+)(?=$|[^A-Za-z0-9_])/g;
    return text
      .replace(latexCommand, (match) => stash(renderMathToken(match)))
      .replace(exponentToken, (match) => stash(renderMathToken(match)))
      .replace(subscriptToken, (match) => stash(renderMathToken(match)));
  }

  function protectInlineMath(value, stash) {
    const text = String(value ?? "");
    let html = "";
    let cursor = 0;
    const pattern = /(^|[^\\])\$([^$\n]{1,240})\$/g;
    let match;
    while ((match = pattern.exec(text))) {
      const prefix = match[1] || "";
      const content = match[2] || "";
      const start = match.index + prefix.length;
      const end = pattern.lastIndex;
      html += text.slice(cursor, start);
      if (looksLikeInlineMath(content)) {
        html += stash(renderMathToken(content));
      } else {
        html += text.slice(start, end);
      }
      cursor = end;
    }
    html += text.slice(cursor);
    return html.replace(/\\\$/g, "$");
  }

  function renderInlineMath(value) {
    const tokens = [];
    const stash = (html) => {
      const token = `@@SATMATH${tokens.length}@@`;
      tokens.push([token, html]);
      return token;
    };
    let html = escapeHtml(protectBareMath(protectInlineMath(value, stash), stash));
    for (const [token, replacement] of tokens) {
      html = html.replaceAll(token, replacement);
    }
    return html;
  }

  function renderFormattedText(value) {
    const tokens = [];
    const stash = (html) => {
      const token = `@@SATRICH${tokens.length}@@`;
      tokens.push([token, html]);
      return token;
    };

    let html = escapeHtml(protectBareMath(protectInlineMath(value, stash), stash));

    html = html.replace(/`([^`\n]+)`/g, (_, content) => stash(`<code>${content}</code>`));
    html = html.replace(/\*\*([^*\n]+)\*\*/g, (_, content) => stash(`<strong>${content}</strong>`));
    html = html.replace(/(^|[\s([{])\*([^*\n]+)\*/g, (_, prefix, content) => `${prefix}${stash(`<em>${content}</em>`)}`);
    html = html.replace(/&quot;([^<>\n]{2,220}?)&quot;/g, (_, content) => stash(`<em>&quot;${content}&quot;</em>`));
    html = html.replace(/“([^<>\n]{2,220}?)”/g, (_, content) => stash(`<em>“${content}”</em>`));
    html = html.replace(
      /\b(Choice [A-D]|Correct answer|correct answer|because|therefore|however|linear equation|quadratic|slope|percent|ratio|median|mean|evidence|transition)\b/g,
      "<strong>$1</strong>",
    );
    html = html.replace(/\r?\n/g, "<br>");

    for (const [token, replacement] of tokens) {
      html = html.replaceAll(token, replacement);
    }

    return html;
  }

  function renderExplanation(value, selectedAnswer = "") {
    if (typeof value === "object" && value !== null) {
      let html = `<div class="explanation-block correct-block"><strong>Why the correct answer works:</strong><br>${renderFormattedText(value.correct || "")}</div>`;

      if (selectedAnswer && value.distractors && value.distractors[selectedAnswer]) {
        html += `<div class="explanation-block wrong-block highlight"><strong>Why your choice (${escapeHtml(selectedAnswer)}) is wrong:</strong><br>${renderFormattedText(value.distractors[selectedAnswer])}</div>`;
      }

      html += '<details class="explanation-toggle"><summary>Review other choices</summary><div class="explanation-others">';
      for (const [key, explanation] of Object.entries(value.distractors || {})) {
        if (key !== selectedAnswer) {
          html += `<div><strong>Why ${escapeHtml(key)} is wrong:</strong><br>${renderFormattedText(explanation)}</div>`;
        }
      }
      html += "</div></details>";
      return html;
    }
    return renderFormattedText(value || "No explanation recorded.");
  }

  return {
    escapeHtml,
    renderExplanation,
    renderFormattedText,
    renderInlineMath,
    renderMathToken,
  };
});
