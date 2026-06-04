const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const policyPath = path.join(root, "data", "question-study-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const studyPolicyEngine = require(path.join(root, "sat_study_policy_engine.js"));

function run() {
  assert.equal(policy.schemaVersion, "sat_study_policy_v1");
  assert.ok(Array.isArray(policy.suppressedDefaultStudyIds));
  assert.ok(Array.isArray(policy.topicOverflowCandidateIds));
  assert.ok(Array.isArray(policy.rwLongPromptIds));
  assert.equal(policy.counts.suppressedDefaultStudy, policy.suppressedDefaultStudyIds.length);
  assert.equal(policy.counts.topicOverflowCandidates, policy.topicOverflowCandidateIds.length);
  assert.equal(policy.counts.rwLongPrompts, policy.rwLongPromptIds.length);
  assert.ok(policy.counts.suppressedDefaultStudy >= policy.counts.topicOverflowCandidates);
  const normalized = studyPolicyEngine.normalizePolicy(policy);
  assert.ok(normalized.suppressedDefaultStudyIds instanceof Set);
  const sampleId = policy.suppressedDefaultStudyIds[0];
  if (sampleId) {
    const manager = studyPolicyEngine.createManager();
    manager.set(policy);
    assert.equal(manager.isSuppressed({ id: sampleId }), true);
  }
}

run();
console.log("study_policy_unit_tests: pass");
