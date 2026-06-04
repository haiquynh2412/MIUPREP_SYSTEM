const assert = require("node:assert/strict");
const audit = require("../sat_question_audit_engine.js");

function run() {
  const admin = { id: "admin", name: "Admin", role: "admin" };
  const parent = { id: "parent", name: "Parent", role: "parent" };
  const student = { id: "student", name: "Student", role: "student" };
  const question = {
    id: "q1",
    visibility: "public_candidate",
    reviewStatus: "reviewed",
    publicationStatus: "public_candidate_reviewed",
  };
  const questionAudits = {};

  assert.equal(audit.canResolveQuestionAudit(admin), true);
  assert.equal(audit.canResolveQuestionAudit(parent), false);
  assert.deepEqual(audit.questionAuditEntries(questionAudits, question), []);
  assert.equal(audit.hasOpenQuestionAudits(questionAudits, question), false);

  const studentEntry = audit.createAuditEntry(question, student, { issueType: "other", severity: "high", note: "Looks odd." }, { id: "audit-1", nowIso: "2026-05-17T00:00:00.000Z" });
  assert.equal(studentEntry.reportedByRole, "student");
  assert.equal(audit.shouldEscalateAudit(studentEntry, student), false);
  const studentResult = audit.applyAuditReport(question, questionAudits, studentEntry, student);
  assert.equal(studentResult.escalated, false);
  assert.equal(question.visibility, "public_candidate");
  assert.equal(question.auditStatus, "open");
  assert.equal(audit.hasOpenQuestionAudits(questionAudits, question), true);

  const parentEntry = audit.createAuditEntry(
    question,
    parent,
    { issueType: "wrong_answer", severity: "medium", note: "Answer key may be wrong." },
    { id: "audit-2", nowIso: "2026-05-17T01:00:00.000Z" },
  );
  const parentResult = audit.applyAuditReport(question, questionAudits, parentEntry, parent);
  assert.equal(parentResult.escalated, true);
  assert.equal(question.reviewStatus, "needs_review");
  assert.equal(question.visibility, "private_family");
  assert.equal(question.publicationStatus, "audit_issue_open");
  assert.equal(questionAudits.q1[0].id, "audit-2");

  audit.applyAuditPass(question, questionAudits.q1, admin, { nowIso: "2026-05-17T02:00:00.000Z" });
  assert.equal(question.auditStatus, "passed");
  assert.equal(question.reviewStatus, "reviewed");
  assert.equal(question.publicationStatus, "private_audit_passed");
  assert.equal(audit.hasOpenQuestionAudits(questionAudits, question), false);
  assert.equal(questionAudits.q1.every((entry) => entry.status === "resolved"), true);
  assert.equal(questionAudits.q1[0].resolvedBy, "admin");

  const blockEntry = audit.createAdminBlockEntry(question, admin, { id: "audit-block", nowIso: "2026-05-17T03:00:00.000Z" });
  audit.applyQuestionAuditBlock(question, questionAudits, blockEntry);
  assert.equal(question.reviewStatus, "needs_review");
  assert.equal(question.visibility, "private_family");
  assert.equal(question.publicationStatus, "audit_blocked");
  assert.equal(question.auditStatus, "blocked");
  assert.equal(questionAudits.q1[0].issueType, "admin_block");
}

run();
console.log("question_audit_engine_unit_tests: pass");
