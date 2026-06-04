const assert = require("node:assert/strict");

const designSystem = require("../sat_design_system.js");

function run() {
  const badge = designSystem.badge("<Admin>", "primary");
  assert.ok(badge.includes("&lt;Admin&gt;"));
  assert.ok(badge.includes("badge primary"));

  const button = designSystem.button({
    label: "Start <test>",
    variant: "primary",
    attrs: { "data-action": "go", disabled: false },
  });
  assert.ok(button.includes("Start &lt;test&gt;"));
  assert.ok(button.includes('data-action="go"'));
  assert.ok(!button.includes("disabled"));

  const skeleton = designSystem.skeletonRows(2);
  assert.equal((skeleton.match(/ds-skeleton-line/g) || []).length, 2);

  const loading = designSystem.loadingPanel({
    eyebrow: "Analyzing",
    title: "Building plan",
    lines: ["One", "Two"],
  });
  assert.ok(loading.includes("ds-loading-panel"));
  assert.ok(loading.includes("Building plan"));
  assert.ok(loading.includes("<span>One</span>"));
}

run();
console.log("design system unit tests passed");
