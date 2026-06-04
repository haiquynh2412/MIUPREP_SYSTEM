const fs = require("node:fs");
const path = require("node:path");

const manifestEngine = require("../sat_public_manifest_engine.js");
const contentPackageEngine = require("../sat_content_package_engine.js");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const ARTIFACTS_DIR = path.join(ROOT, "artifacts");
const INTEGRITY_REPORT = path.join(DATA_DIR, "question-integrity-report.json");

const QUESTION_FILES = Object.freeze([
  "antigravity-bank.json",
  "archive-source-ai-bank.json",
  "kaplan-sat-math-ai-bank.json",
  "opensat-pinesat.json",
  "private-vault-archive-bank.json",
  "sat-1590-elite-ai-bank.json",
  "sat-king-supplemental-ai-bank.json",
  "sat-studio-foundation-bank.json",
]);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function normalizeRawQuestion(item, filename, index) {
  if (!item || typeof item !== "object") return null;
  const question = { ...item };
  if (question.prompt) {
    question._sourceFile = filename;
    question._sourceIndex = index;
    return question;
  }
  const nested = question.question;
  if (nested && typeof nested === "object") {
    const promptParts = [nested.paragraph, nested.question]
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    question.prompt = promptParts.join("\n\n");
    question.choices = nested.choices || question.choices || {};
    question.correctAnswer = nested.correct_answer || nested.correctAnswer || question.correctAnswer;
    question.explanation = nested.explanation || question.explanation;
    const sourceSection = String(question._satStudioSourceSection || question.section || "").toLowerCase();
    question.section = sourceSection === "math" ? "Math" : "Reading and Writing";
    question.skill = question.skill || question.domain || "OpenSAT imported skill";
    question.sourceType = question.sourceType || "opensat";
  }
  question._sourceFile = filename;
  question._sourceIndex = index;
  return question.prompt ? question : null;
}

function recordsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray(payload.questions)) return payload.questions;
  return [];
}

function loadQuestions(options = {}) {
  const dataDir = options.dataDir || DATA_DIR;
  const questionFiles = options.questionFiles || QUESTION_FILES;
  const questions = [];
  const loadedFiles = [];
  for (const filename of questionFiles) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) continue;
    const records = recordsFromPayload(readJson(filePath));
    loadedFiles.push({ filename, count: records.length });
    records.forEach((item, index) => {
      const question = normalizeRawQuestion(item, filename, index);
      if (question) questions.push(question);
    });
  }
  return { questions, loadedFiles };
}

function criticalCountFromIntegrity(integrity) {
  const summary = integrity?.summary || {};
  return Number(summary.criticalQuestionCount ?? summary.criticalIssueCount ?? 0);
}

function publicContentVersion(manifestArtifact) {
  return [
    "sat-studio-public",
    manifestArtifact.gateVersion || "manifest",
    manifestArtifact.stableContentChecksum || "checksum-missing",
  ].join(":");
}

function buildReleaseArtifacts(questions, options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const integrity = options.integrity || {};
  const manifestContext = {
    integrityLoaded: options.integrityLoaded ?? Boolean(integrity?.summary),
    criticalCount: options.criticalCount ?? criticalCountFromIntegrity(integrity),
    openAuditEntries: options.openAuditEntries ?? 0,
    nowIso,
    exportedAt: nowIso,
  };
  const manifest = manifestEngine.buildPublicManifest(questions, manifestContext);
  const manifestArtifact = manifestEngine.buildPublicManifestArtifact(questions, {
    ...manifestContext,
    manifest,
  });
  const contentPackage = contentPackageEngine.buildPublicContentPackage(questions, {
    generatedAt: nowIso,
    manifest: { ...manifest, contentVersion: publicContentVersion(manifestArtifact) },
    contentVersion: publicContentVersion(manifestArtifact),
    revision: options.revision || 1,
  });
  return {
    manifest,
    manifestArtifact,
    contentPackage,
    summary: {
      ready: Boolean(manifest.releaseGate?.ready),
      manifestReadyCount: manifestArtifact.counts.manifestReady,
      contentPackageItems: Array.isArray(contentPackage.items) ? contentPackage.items.length : 0,
      blockedPublicCandidateCount: manifestArtifact.counts.blockedPublicCandidates,
      sourceUnsignedCount: manifestArtifact.counts.sourceUnsigned,
      stableContentChecksum: manifestArtifact.stableContentChecksum,
      contentVersion: contentPackage.contentVersion,
    },
  };
}

function parseArgs(argv) {
  const args = {
    check: false,
    allowBlocked: false,
    json: false,
    writeDated: true,
    manifestOut: path.join(ARTIFACTS_DIR, "sat-studio-public-manifest-latest.json"),
    packageOut: path.join(ARTIFACTS_DIR, "sat-studio-public-content-package-latest.json"),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") args.check = true;
    else if (arg === "--allow-blocked") args.allowBlocked = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--no-dated") args.writeDated = false;
    else if (arg === "--manifest-out") args.manifestOut = path.resolve(argv[++index]);
    else if (arg === "--package-out") args.packageOut = path.resolve(argv[++index]);
  }
  return args;
}

function datedArtifactPath(basePath, artifact, kind) {
  const date = String(artifact.exportedAt || new Date().toISOString()).slice(0, 10);
  const checksum = String(artifact.stableContentChecksum || "checksum").replace(/[^a-zA-Z0-9]+/g, "-");
  return path.join(path.dirname(basePath), `sat-studio-public-${kind}-ready-${date}-${checksum}.json`);
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const { questions, loadedFiles } = loadQuestions();
  const integrity = readJson(INTEGRITY_REPORT) || {};
  const artifacts = buildReleaseArtifacts(questions, { integrity });
  const manifestReady = artifacts.manifest.releaseGate?.ready === true;
  const contentCount = Array.isArray(artifacts.contentPackage.items) ? artifacts.contentPackage.items.length : 0;
  const paths = {
    manifestLatest: args.manifestOut,
    packageLatest: args.packageOut,
    manifestDated: datedArtifactPath(args.manifestOut, artifacts.manifestArtifact, "manifest"),
    packageDated: datedArtifactPath(args.packageOut, artifacts.manifestArtifact, "content-package"),
  };

  if (!args.check) {
    writeJson(args.manifestOut, artifacts.manifestArtifact);
    writeJson(args.packageOut, artifacts.contentPackage);
    if (args.writeDated) {
      writeJson(paths.manifestDated, artifacts.manifestArtifact);
      writeJson(paths.packageDated, artifacts.contentPackage);
    }
  }

  const report = {
    ok: manifestReady && contentCount > 0,
    checkOnly: args.check,
    loadedFiles,
    paths: args.check ? {} : paths,
    ...artifacts.summary,
  };
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      [
        `Public manifest ready: ${report.ok ? "YES" : "NO"}`,
        `Manifest-ready questions: ${report.manifestReadyCount}`,
        `Content package items: ${report.contentPackageItems}`,
        `Blocked public candidates: ${report.blockedPublicCandidateCount}`,
        `Unsigned source rows: ${report.sourceUnsignedCount}`,
        `Content version: ${report.contentVersion}`,
      ].join("\n")
    );
  }
  if (!args.allowBlocked && !report.ok) {
    process.exitCode = 1;
  }
  return report;
}

if (require.main === module) {
  run();
}

module.exports = {
  QUESTION_FILES,
  buildReleaseArtifacts,
  loadQuestions,
  normalizeRawQuestion,
  parseArgs,
  publicContentVersion,
  run,
};
