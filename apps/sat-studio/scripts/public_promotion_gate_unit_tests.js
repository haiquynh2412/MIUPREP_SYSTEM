const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const promotion = require("./review_and_promote_public_safe_questions.js");

function baseQuestion(overrides = {}) {
  return {
    id: "q",
    _sourceFile: "antigravity-bank.json",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Easy",
    sourceType: "antigravity",
    sourceName: "Antigravity Testbank",
    licenseNote: "Antigravity-generated original draft from blueprint-only prompt.",
    sourceUsagePolicy: "provenance_only_unified_pool",
    reviewStatus: "reviewed",
    publicationStatus: "private_reviewed",
    visibility: "private_family",
    questionType: "multiple_choice",
    prompt: "If x + 2 = 5, what is x?",
    choices: { A: "1", B: "2", C: "3", D: "5" },
    correctAnswer: "C",
    explanation: { correct: "Subtract 2.", distractors: { A: "Too low.", B: "Too low.", D: "Uses the right side." } },
    contentAudit: { verdict: "pass" },
    ...overrides,
  };
}

function run() {
  assert.equal(promotion.copyrightDecision(baseQuestion()).ok, true);
  assert.equal(promotion.promotionGate(baseQuestion(), "2026-05-26T00:00:00.000Z").ok, true);

  const missingSourceType = baseQuestion({ sourceType: undefined, sourceName: undefined, licenseNote: undefined });
  assert.equal(promotion.sourceTypeForGate(missingSourceType), "sat_studio_original");
  assert.equal(promotion.promotionGate(missingSourceType, "2026-05-26T00:00:00.000Z").ok, true);

  const opensat = baseQuestion({ _sourceFile: "opensat-pinesat.json", sourceType: "opensat", licenseNote: undefined });
  assert.equal(promotion.promotionGate(opensat, "2026-05-26T00:00:00.000Z").reason, "license_unclear_source:opensat");

  const vault = baseQuestion({ sourceType: "private_vault", neverPublic: true });
  assert.equal(promotion.promotionGate(vault, "2026-05-26T00:00:00.000Z").ok, false);

  const incomplete = baseQuestion({ choices: { A: "", B: "2", C: "3", D: "5" } });
  assert.equal(promotion.promotionGate(incomplete, "2026-05-26T00:00:00.000Z").ok, false);

  assert.throws(
    () => promotion.applyPromotion({ apply: true, dataDir: os.tmpdir(), questionFiles: [] }),
    /without explicit --id\/--ids or --all-eligible/
  );

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sat-public-promotion-"));
  const dataDir = path.join(tempRoot, "data");
  const artifactsDir = path.join(tempRoot, "artifacts");
  const bankFile = "sat-studio-foundation-bank.json";
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, bankFile),
    `${JSON.stringify([
      baseQuestion({ id: "unit-promote", sourceType: "foundation", sourceName: "SAT Studio Foundation", visibility: "private_family", publicationStatus: "private_reviewed" }),
      baseQuestion({ id: "unit-hold", sourceType: "private_vault", neverPublic: true }),
    ], null, 2)}\n`,
    "utf8"
  );

  const dryRun = promotion.applyPromotion({
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    ids: ["unit-promote"],
    nowIso: "2026-05-26T00:00:00.000Z",
  });
  assert.equal(dryRun.mode, "dry_run");
  assert.equal(dryRun.promotedCount, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir, bankFile), "utf8"))[0].visibility, "private_family");

  const applied = promotion.applyPromotion({
    apply: true,
    dataDir,
    artifactsDir,
    questionFiles: [bankFile],
    ids: ["unit-promote"],
    nowIso: "2026-05-26T00:00:00.000Z",
    writeDated: false,
  });
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, bankFile), "utf8"));
  assert.equal(applied.mode, "apply");
  assert.equal(applied.changedCount, 1);
  assert.equal(applied.regeneratedPublicArtifacts.contentPackageItems, 1);
  assert.equal(rows[0].visibility, "public_candidate");
  assert.equal(rows[0].publicationStatus, "public_candidate_reviewed");
  assert.equal(rows[0].promotedBy, "sat_studio_admin_workflow");
  assert.equal(rows[1].visibility, "private_family");
  assert.ok(fs.readdirSync(artifactsDir).some((name) => name.includes("before-public-promotion")));
  assert.ok(fs.readFileSync(path.join(dataDir, "public-promotion-audit-log.jsonl"), "utf8").includes("unit-promote"));
  const publicPackage = JSON.parse(fs.readFileSync(path.join(artifactsDir, "sat-studio-public-content-package-latest.json"), "utf8"));
  assert.deepEqual(publicPackage.items.map((item) => item.id), ["unit-promote"]);
}

run();
console.log("public_promotion_gate_unit_tests: pass");
