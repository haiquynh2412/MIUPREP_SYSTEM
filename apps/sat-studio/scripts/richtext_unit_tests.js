const assert = require("node:assert/strict");
const richText = require("../sat_richtext.js");

function run() {
  assert.equal(richText.escapeHtml('<img src=x onerror="bad()">'), "&lt;img src=x onerror=&quot;bad()&quot;&gt;");

  const formatted = richText.renderFormattedText('Choice A is **correct** because "quoted evidence" uses `x + 2`.');
  assert.ok(formatted.includes("<strong>Choice A</strong>"), "keyword should be bolded");
  assert.ok(formatted.includes("<strong>correct</strong>"), "markdown bold should render");
  assert.ok(formatted.includes("<em>&quot;quoted evidence&quot;</em>"), "quoted text should be italicized");
  assert.ok(formatted.includes("<code>x + 2</code>"), "inline code should render");
  assert.equal(formatted.includes("<script>"), false, "formatted text must escape script tags");

  const multiline = richText.renderFormattedText("first\nsecond");
  assert.equal(multiline, "first<br>second");

  const math = richText.renderInlineMath("The equation $y = x^2 - 6x + k$ has one solution. Find $k$.");
  assert.ok(math.includes("math-inline"));
  assert.ok(math.includes("x<sup>2</sup>"));
  assert.ok(math.includes(">k</span>"));
  assert.equal(math.includes("$y"), false);
  assert.equal(math.includes("$k$"), false);

  const bareMath = richText.renderInlineMath("Solve: 2x^2 - 8 = 0. What is P_0 after x^(5/6) years?");
  assert.ok(bareMath.includes("2x<sup>2</sup>"), "bare exponent should render as superscript");
  assert.ok(bareMath.includes("P<sub>0</sub>"), "bare subscript should render as subscript");
  assert.ok(bareMath.includes("x<sup>5/6</sup>"), "parenthesized exponent should render as superscript");
  assert.equal(bareMath.includes("2x^2"), false, "raw caret should not remain visible for simple exponent");

  const inlineInequality = richText.renderInlineMath("$-2x+6 ≥ 0$. Largest integer x?");
  assert.ok(inlineInequality.includes("math-inline"), "inline inequality should render as math");
  assert.equal(inlineInequality.includes("$"), false, "LaTeX dollar delimiters should not be visible");
  assert.ok(inlineInequality.includes("-2x+6"), "inequality content should remain readable");

  const currency = richText.renderFormattedText("A driver earns $48 per day plus $2.25 per package.");
  assert.equal(currency.includes("math-inline"), false, "currency should not be mistaken for inline math");
  assert.ok(currency.includes("$48"), "currency amount should remain readable");

  const fraction = richText.renderFormattedText("Use $\\frac{1}{2}x^2$ and keep prices like $5 unchanged.");
  assert.ok(fraction.includes("math-frac"));
  assert.ok(fraction.includes("x<sup>2</sup>"));
  assert.ok(fraction.includes("$5 unchanged"), "unpaired currency should stay readable");

  const explanation = richText.renderExplanation(
    {
      correct: "Choice B works because it uses the right transition.",
      distractors: {
        A: "A reverses the relationship.",
        C: "C adds an unsupported example.",
      },
    },
    "A",
  );
  assert.ok(explanation.includes("Why the correct answer works"));
  assert.ok(explanation.includes("Why your choice (A) is wrong"));
  assert.ok(explanation.includes("Review other choices"));
  assert.equal(explanation.includes("onerror"), false);
}

run();
console.log("richtext_unit_tests: pass");
