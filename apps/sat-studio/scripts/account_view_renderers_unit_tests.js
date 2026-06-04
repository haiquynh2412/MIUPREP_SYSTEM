const assert = require("node:assert/strict");
const accountViewRenderers = require("../sat_account_view_renderers.js");

function run() {
  const storage = {
    bytesLabel: "120 KB",
    chunkLabel: "single record",
    label: "Healthy <ok>",
    level: "ok",
    message: "Export <often>.",
    publicApiReady: true,
  };
  const overview = accountViewRenderers.renderAccountOverview(
    { id: "student-1", name: "Student <One>", role: "student", scope: "family" },
    {
      progressById: {
        "student-1": {
          accuracy: 67,
          attempts: 12,
          points: 140,
          schedule: "Monday",
          streak: 3,
          weeklyTarget: 4,
        },
      },
      storageHealth: storage,
    },
  );
  assert.ok(overview.includes("My Accuracy"));
  assert.ok(overview.includes("67%"));
  assert.ok(overview.includes("Healthy &lt;ok&gt;"));
  assert.ok(!overview.includes("<ok>"));

  const parentOverview = accountViewRenderers.renderAccountOverview(
    { id: "parent-1", name: "Parent", role: "parent", scope: "family" },
    {
      progressById: {
        "student-1": {
          accuracy: 80,
          attempts: 20,
          latestBaseline: "1450",
          schedule: "Friday",
          weeklyTarget: 5,
          points: 220,
          streak: 6,
          externalMinutes: 90,
        },
      },
      storageHealth: storage,
      students: [{ id: "student-1", name: "Learner <A>", role: "student", scope: "family" }],
    },
  );
  assert.ok(parentOverview.includes("Learner &lt;A&gt;"));
  assert.ok(parentOverview.includes("80% accuracy"));

  const list = accountViewRenderers.renderAccountList(
    [
      {
        id: "student-1",
        name: "Learner <A>",
        email: "learner@example.com",
        gradeLevel: "Grade 10",
        avatarInitials: "la",
        avatarColor: "coral",
        role: "student",
        scope: "public",
        targetScore: 1500,
        parentIds: ["parent-1"],
        uiTheme: "teen_quest",
      },
      {
        id: "parent-1",
        name: "Parent <B>",
        email: "parent@example.com",
        role: "parent",
        scope: "family",
        permissions: { rewardManager: true, questionContributor: true },
      },
    ],
    {
      canChangeStatusById: { "parent-1": true, "student-1": true },
      canDeleteById: { "parent-1": true, "student-1": true },
      canEditById: { "parent-1": true, "student-1": true },
      currentAccountId: "admin",
      latestById: { "student-1": { scoreEstimate: 1420 } },
      parentNamesById: { "student-1": ["Parent <B>"] },
      progressById: {
        "student-1": {
          accuracy: 75,
          attempts: 8,
          points: 100,
          schedule: "No session",
          streak: 2,
        },
      },
    },
  );
  assert.ok(list.includes("Learner &lt;A&gt;"));
  assert.ok(list.includes("LA"));
  assert.ok(list.includes("avatar-coral"));
  assert.ok(list.includes("learner@example.com"));
  assert.ok(list.includes("Grade 10"));
  assert.ok(list.includes("Parent &lt;B&gt;"));
  assert.ok(list.includes("Rewards, Authoring"));
  assert.ok(list.includes("Teen Quest"));
  assert.ok(list.includes("account-management-table"));
  assert.ok(list.includes('data-account-action="edit"'));
  assert.ok(list.includes('data-account-action="status"'));
  assert.ok(!list.includes("<A>"));
}

run();
console.log("account_view_renderers_unit_tests: pass");
