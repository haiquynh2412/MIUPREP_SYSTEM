const STORAGE_KEY = "sat-studio-state-v2";
const LEGACY_STORAGE_KEY = "sat-studio-state-v1";
const PUBLIC_BACKEND_TOKEN_KEY = "sat-studio-public-backend-token";
const PUBLIC_BACKEND_COOKIE_SESSION = "__sat_studio_http_only_cookie_session__";
const SatCore = window.SatStudioCore || {};
const SatStorage = window.SatStudioStorage || {};
const SatPublicApi = window.SatStudioPublicApi || {};
const SatRichText = window.SatStudioRichText || {};
const SatDesignSystem = window.SatDesignSystem || {};
const SatViewRenderers = window.SatStudioViewRenderers || {};
const SatAdminViewRenderers = window.SatStudioAdminViewRenderers || {};
const SatAccountViewRenderers = window.SatStudioAccountViewRenderers || {};
const SatContentLifecycleEngine = window.SatStudioContentLifecycleEngine || {};
const SatPermissions = window.SatStudioPermissions || {};
const SatRoleBoundaryEngine = window.SatRoleBoundaryEngine || {};
const SatEntryEngine = window.SatEntryEngine || {};
const SatQuestionQueryEngine = window.SatQuestionQueryEngine || {};
const SatContentAdminEngine = window.SatContentAdminEngine || {};
const SatLearnerContentGateway = window.SatLearnerContentGateway || {};
const SatQuestionImport = window.SatStudioQuestionImport || {};
const SatImportEngine = window.SatStudioImportEngine || {};
const SatRouterEngine = window.SatStudioRouterEngine || {};
const SatDashboardEngine = window.SatStudioDashboardEngine || {};
const SatDataLoaders = window.SatStudioDataLoaders || {};
const SatAdaptiveRoutingEngine = window.SatStudioAdaptiveRoutingEngine || {};
const SatDiagnosticEngine = window.SatStudioDiagnosticEngine || {};
const SatLessonEngine = window.SatStudioLessonEngine || {};
const SatRemediationEngine = window.SatStudioRemediationEngine || {};
const SatPracticeEngine = window.SatStudioPracticeEngine || {};
const SatMasteryEngine = window.SatStudioMasteryEngine || {};
const SatRoadmapEngine = window.SatStudioRoadmapEngine || {};
const SatLearningEventEngine = window.SatStudioLearningEventEngine || {};
const SatAccountEngine = window.SatStudioAccountEngine || {};
const SatExamReviewEngine = window.SatStudioExamReviewEngine || {};
const SatQuestionAuditEngine = window.SatQuestionAuditEngine || {};
const SatQualityIntakeEngine = window.SatQualityIntakeEngine || {};
const SatPublicManifestEngine = window.SatPublicManifestEngine || {};
const SatAuthoringEngine = window.SatAuthoringEngine || {};
const SatDuplicateEngine = window.SatDuplicateEngine || {};
const SatStudyPolicyEngine = window.SatStudyPolicyEngine || {};
const sourceLedger = window.SatSourceLedger || {};
const LOCAL_OPEN_SAT_DATA_URL = "data/opensat-pinesat.json";
const QUESTION_INTEGRITY_REPORT_URL = "data/question-integrity-report.json";
const SAT_2026_READINESS_AUDIT_URL = "data/sat-2026-readiness-audit.json";
const REVIEWED_EXPERT_AUDIT_URL = "data/reviewed-question-expert-audit.json";
const LOCAL_OPEN_SAT_MIN_COUNT = 2000;
const LOCAL_OPEN_SAT_REVIEWED_MIN_COUNT = 2000;
const OPEN_SAT_IMPORT_AUDIT_VERSION = "opensat-clean-2026-05-17-math-verified";
const LOCAL_FOUNDATION_DATA_URL = "data/sat-studio-foundation-bank.json";
const LOCAL_FOUNDATION_MIN_COUNT = 70;
const REVIEWED_SOURCE_BANK_MIN_COUNT = 1;
const KAPLAN_AI_MATH_DATA_URL = "data/kaplan-sat-math-ai-bank.json";
const KAPLAN_AI_SOURCE_SIGNAL_ID = "kaplan-sat-math-prep";
const EXTERNAL_RESOURCES_URL = "data/external-resources.json";
const PRIVATE_ARCHIVE_SIGNALS_URL = "data/private-source-signals-from-archive.json";
const PRIVATE_ARCHIVE_REGISTRY_URL = "data/private-source-registry-sat-archive.json";
const ARCHIVE_AI_DATA_URL = "data/archive-source-ai-bank.json";
const SAT_KING_DATA_URL = "data/sat-king-supplemental-ai-bank.json";
const SAT_1590_DATA_URL = "data/sat-1590-elite-ai-bank.json";
const PRIVATE_VAULT_DATA_URL = "data/private-vault-archive-bank.json";
const ANTIGRAVITY_DATA_URL = "data/antigravity-bank.json";
const ANTIGRAVITY_SOURCE_SIGNAL_ID = "antigravity-testbank";
const GENERATED_CONTENT_AUDIT_VERSION = "sat-king-audit-2026-05-17";

const defaultSourceSignals = [
  {
    id: KAPLAN_AI_SOURCE_SIGNAL_ID,
    sourceKind: "commercial_prep",
    sourceReference: "data/SAT-Kaplan Test Prep.pdf",
    section: "Math",
    domain: "Math",
    skill: "Kaplan SAT Math Prep generated bank",
    difficulty: "Medium",
    mistakePattern:
      "Use the Kaplan SAT Math Prep PDF only as a broad Math skill blueprint. Do not copy prompts, answer choices, examples, diagrams, or explanations.",
    learningGoal:
      "Generate original SAT Math practice covering Algebra, Advanced Math, Problem-Solving and Data Analysis, and Geometry/Trigonometry.",
    risk: "high",
    visibility: "admin_only",
    protectedTextExcluded: true,
    createdAt: "2026-05-16T00:00:00.000Z",
    createdBy: "system",
  },
];

const seedQuestions = [
  {
    id: "orig-rw-boundaries-001",
    section: "Reading and Writing",
    domain: "Standard English Conventions",
    skill: "Boundaries",
    difficulty: "Easy",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    visibility: "public_candidate",
    reviewStatus: "needs_review",
    prompt:
      "Researcher Lena Ortiz studied a group of desert plants that bloom after brief rainstorms. Her team found that the plants store energy for months; therefore, they can produce flowers quickly when rain arrives.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
    choices: {
      A: "months therefore, they",
      B: "months, therefore they",
      C: "months; therefore, they",
      D: "months therefore they",
    },
    correctAnswer: "C",
    explanation:
      "The clauses before and after therefore can stand as complete sentences. A semicolon before therefore and a comma after it correctly connect the two independent clauses.",
  },
  {
    id: "orig-rw-transitions-001",
    section: "Reading and Writing",
    domain: "Expression of Ideas",
    skill: "Transitions",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    visibility: "public_candidate",
    reviewStatus: "needs_review",
    prompt:
      "Many early maps exaggerated the size of unfamiliar coastlines. ______ modern satellite images allow cartographers to measure landforms with far greater precision.\n\nWhich choice completes the text with the most logical transition?",
    choices: {
      A: "Similarly,",
      B: "By contrast,",
      C: "For example,",
      D: "In other words,",
    },
    correctAnswer: "B",
    explanation:
      "The first sentence describes an inaccuracy in early maps, while the second describes the precision of modern satellite images. By contrast signals that difference.",
  },
  {
    id: "orig-rw-evidence-001",
    section: "Reading and Writing",
    domain: "Information and Ideas",
    skill: "Command of Evidence",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A city replaced several downtown parking spaces with protected bike lanes. In the year after the change, nearby shops reported a 9 percent increase in weekend sales, and pedestrian counts on those blocks also rose.\n\nWhich finding, if true, would most directly support the claim that the bike lanes helped local businesses?",
    choices: {
      A: "Several shops changed their window displays during the same year.",
      B: "The number of customers arriving by bicycle increased on the blocks with new bike lanes.",
      C: "Some drivers said they preferred parking on streets farther from downtown.",
      D: "Weekend weather was slightly cooler than average during the year after the change.",
    },
    correctAnswer: "B",
    explanation:
      "The claim connects the bike lanes to business gains. Evidence that more customers arrived by bicycle on the affected blocks most directly supports that link.",
  },
  {
    id: "orig-rw-words-001",
    section: "Reading and Writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    difficulty: "Hard",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "The museum's new exhibit does not present history as a single, settled account. Instead, it juxtaposes letters, photographs, and oral histories that sometimes contradict one another, inviting visitors to see the past as ______ rather than fixed.\n\nWhich choice completes the text with the most logical and precise word?",
    choices: {
      A: "lucrative",
      B: "provisional",
      C: "ornamental",
      D: "redundant",
    },
    correctAnswer: "B",
    explanation:
      "Provisional means temporary or subject to revision. It fits the idea that the exhibit presents history as open to interpretation rather than fixed.",
  },
  {
    id: "orig-math-linear-001",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    difficulty: "Easy",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A subscription costs $12 per month plus a one-time setup fee of $18. If Priya paid $90 total, for how many months did she have the subscription?",
    choices: {
      A: "5",
      B: "6",
      C: "7",
      D: "8",
    },
    correctAnswer: "B",
    explanation: "Let m be the number of months. Then 12m + 18 = 90, so 12m = 72 and m = 6.",
  },
  {
    id: "orig-math-function-001",
    section: "Math",
    domain: "Algebra",
    skill: "Linear functions",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt: "The function f is defined by f(x) = 3x - 7. If f(a) = 20, what is the value of a?",
    choices: {
      A: "7",
      B: "8",
      C: "9",
      D: "13",
    },
    correctAnswer: "C",
    explanation: "Set 3a - 7 = 20. Then 3a = 27, so a = 9.",
  },
  {
    id: "orig-math-quadratic-001",
    section: "Math",
    domain: "Advanced Math",
    skill: "Nonlinear equations",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt: "For which value of x is x^2 - 5x + 6 = 0?",
    choices: {
      A: "1",
      B: "2",
      C: "4",
      D: "6",
    },
    correctAnswer: "B",
    explanation:
      "The expression factors as (x - 2)(x - 3). Therefore, x = 2 or x = 3. Among the choices, only 2 appears.",
  },
  {
    id: "orig-math-percent-001",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Percentages",
    difficulty: "Hard",
    sourceType: "original",
    sourceName: "SAT Studio Original Draft",
    licenseNote: "Original draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A store increased the price of a jacket by 25 percent and then discounted the new price by 20 percent. What was the final price as a percent of the original price?",
    choices: {
      A: "80%",
      B: "95%",
      C: "100%",
      D: "105%",
    },
    correctAnswer: "C",
    explanation:
      "A 25 percent increase multiplies the price by 1.25. A 20 percent decrease then multiplies it by 0.80. Since 1.25 x 0.80 = 1, the final price is 100 percent of the original.",
  },
];

const diagnosticSeedQuestions = [
  {
    id: "orig-rw-fss-001",
    section: "Reading and Writing",
    domain: "Standard English Conventions",
    skill: "Form, Structure, and Sense",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "The notebooks of marine biologist Rachel Carson ______ careful observations of ocean life with reflections on the responsibility scientists have to communicate clearly with the public.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
    choices: {
      A: "combines",
      B: "combine",
      C: "has combined",
      D: "was combining",
    },
    correctAnswer: "B",
    explanation:
      "The subject is plural: notebooks. The plural verb combine agrees with that subject.",
  },
  {
    id: "orig-rw-synthesis-001",
    section: "Reading and Writing",
    domain: "Expression of Ideas",
    skill: "Rhetorical Synthesis",
    difficulty: "Hard",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A student is writing about the architect Lina Bo Bardi. The student wants to emphasize that Bo Bardi designed buildings to encourage public gathering.\n\nWhich choice most effectively uses relevant information to accomplish this goal?",
    choices: {
      A: "Lina Bo Bardi was born in Italy in 1914 and later became an influential architect in Brazil.",
      B: "Bo Bardi's work included museums, theaters, furniture, and exhibition spaces.",
      C: "In projects such as SESC Pompeia, Bo Bardi created open areas where visitors could meet, watch performances, and participate in community activities.",
      D: "Some of Bo Bardi's drawings and models are preserved in architectural archives.",
    },
    correctAnswer: "C",
    explanation:
      "Choice C directly supports the goal by showing how one of Bo Bardi's projects created spaces for public gathering.",
  },
  {
    id: "orig-rw-inference-001",
    section: "Reading and Writing",
    domain: "Information and Ideas",
    skill: "Inferences",
    difficulty: "Hard",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A study of urban trees found that young trees planted along narrow streets grew more slowly than young trees planted in parks, even when both groups received the same amount of water. Researchers noted that the street trees had less room for root expansion.\n\nWhich conclusion is best supported by the text?",
    choices: {
      A: "Water access is the only factor that affects how quickly young urban trees grow.",
      B: "Limited underground space may restrict the growth of trees planted along narrow streets.",
      C: "Trees planted in parks require less maintenance than trees planted along streets.",
      D: "Young trees grow more quickly in cities than mature trees do.",
    },
    correctAnswer: "B",
    explanation:
      "The text says the street trees grew more slowly despite equal water and had less root space. That supports the conclusion that limited underground space may restrict growth.",
  },
  {
    id: "orig-rw-purpose-001",
    section: "Reading and Writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A historian first describes how a nineteenth-century newspaper reported a local election. She then compares that report with private letters written by voters during the same week.\n\nWhich choice best describes the function of the second part of the text?",
    choices: {
      A: "It introduces a different type of evidence that can complicate the newspaper's account.",
      B: "It proves that the newspaper report was intentionally false.",
      C: "It explains why local elections were unpopular in the nineteenth century.",
      D: "It shifts from historical analysis to a description of modern journalism.",
    },
    correctAnswer: "A",
    explanation:
      "The second part adds private letters as another source of evidence, which can be compared with and may complicate the newspaper account.",
  },
  {
    id: "orig-math-system-001",
    section: "Math",
    domain: "Algebra",
    skill: "Systems of two linear equations in two variables",
    difficulty: "Hard",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "The system of equations 2x + 3y = 19 and x - y = 2 has solution (x, y). What is the value of x?",
    choices: {
      A: "3",
      B: "4",
      C: "5",
      D: "7",
    },
    correctAnswer: "C",
    explanation:
      "From x - y = 2, x = y + 2. Substitute into 2x + 3y = 19: 2(y + 2) + 3y = 19, so 5y = 15 and y = 3. Therefore x = 5.",
  },
  {
    id: "orig-math-equivalent-001",
    section: "Math",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    difficulty: "Easy",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt: "Which expression is equivalent to 4(x + 3) - 2x?",
    choices: {
      A: "2x + 12",
      B: "2x + 3",
      C: "4x + 10",
      D: "6x + 12",
    },
    correctAnswer: "A",
    explanation:
      "Distribute 4 to get 4x + 12. Then subtract 2x: 4x + 12 - 2x = 2x + 12.",
  },
  {
    id: "orig-math-exponential-001",
    section: "Math",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    difficulty: "Hard",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A population of bacteria doubles every 3 hours. If the initial population is 500, which expression gives the population after t hours?",
    choices: {
      A: "500(2)^t",
      B: "500(2)^(t/3)",
      C: "500(3)^t",
      D: "500(3)^(t/2)",
    },
    correctAnswer: "B",
    explanation:
      "The population doubles once every 3 hours, so after t hours it has doubled t/3 times. The expression is 500(2)^(t/3).",
  },
  {
    id: "orig-math-rates-001",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Ratios, rates, proportional relationships, and units",
    difficulty: "Easy",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A printer produces 48 pages in 6 minutes at a constant rate. At this rate, how many pages does the printer produce in 10 minutes?",
    choices: {
      A: "60",
      B: "72",
      C: "80",
      D: "96",
    },
    correctAnswer: "C",
    explanation:
      "The printer produces 48 / 6 = 8 pages per minute. In 10 minutes, it produces 8 x 10 = 80 pages.",
  },
  {
    id: "orig-math-data-001",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "One-variable data: Distributions and measures of center and spread",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "The numbers 6, 8, 11, 13, and x have a mean of 10. What is the value of x?",
    choices: {
      A: "8",
      B: "10",
      C: "12",
      D: "14",
    },
    correctAnswer: "C",
    explanation:
      "If the mean of five numbers is 10, their sum is 50. The known numbers sum to 38, so x = 50 - 38 = 12.",
  },
  {
    id: "orig-math-lines-001",
    section: "Math",
    domain: "Geometry and Trigonometry",
    skill: "Lines, angles, and triangles",
    difficulty: "Easy",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "Two angles of a triangle measure 42 degrees and 68 degrees. What is the measure, in degrees, of the third angle?",
    choices: {
      A: "60",
      B: "70",
      C: "80",
      D: "90",
    },
    correctAnswer: "B",
    explanation:
      "The angles in a triangle sum to 180 degrees. The third angle is 180 - 42 - 68 = 70 degrees.",
  },
  {
    id: "orig-math-circle-001",
    section: "Math",
    domain: "Geometry and Trigonometry",
    skill: "Circles",
    difficulty: "Medium",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "A circle has radius 5. What is the area of the circle?",
    choices: {
      A: "10pi",
      B: "20pi",
      C: "25pi",
      D: "100pi",
    },
    correctAnswer: "C",
    explanation:
      "The area of a circle is pi r^2. With radius 5, the area is pi(5^2) = 25pi.",
  },
  {
    id: "orig-math-trig-001",
    section: "Math",
    domain: "Geometry and Trigonometry",
    skill: "Right triangles and trigonometry",
    difficulty: "Hard",
    sourceType: "original",
    sourceName: "SAT Studio Original Diagnostic",
    licenseNote: "Original diagnostic draft; safe to publish after review.",
    reviewStatus: "needs_review",
    prompt:
      "In a right triangle, one acute angle has sine 3/5. What is the cosine of the other acute angle?",
    choices: {
      A: "3/5",
      B: "4/5",
      C: "5/3",
      D: "5/4",
    },
    correctAnswer: "A",
    explanation:
      "The two acute angles in a right triangle are complementary. The cosine of one acute angle equals the sine of its complement, so the cosine of the other acute angle is 3/5.",
  },
];

const defaultAccounts = [
  {
    id: "content-admin",
    name: "Content Admin",
    email: "content@satstudio.local",
    gradeLevel: "",
    avatarInitials: "CA",
    avatarColor: "teal",
    permissions: { rewardManager: true, questionContributor: true },
    role: "admin",
    scope: "family",
    status: "active",
    passcode: "9999",
    targetScore: 1600,
    createdAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "parent-admin",
    name: "Parent Admin",
    email: "parent@satstudio.local",
    gradeLevel: "",
    avatarInitials: "PA",
    avatarColor: "blue",
    permissions: { rewardManager: true, questionContributor: false },
    role: "parent",
    scope: "family",
    status: "active",
    passcode: "1234",
    targetScore: 1500,
    createdAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "student-demo",
    name: "Student Demo",
    email: "student@satstudio.local",
    gradeLevel: "Grade 10",
    avatarInitials: "SD",
    avatarColor: "coral",
    permissions: { rewardManager: false, questionContributor: false },
    role: "student",
    scope: "family",
    status: "active",
    passcode: "1111",
    targetScore: 1450,
    uiTheme: "teen_quest",
    parentIds: ["parent-admin"],
    createdAt: "2026-05-01T00:00:00.000Z",
    studyPlan: { weeklyTarget: 4, nextSessionAt: "" },
  },
];

const diagnosticBlueprint = [
  { section: "Reading and Writing", domain: "Information and Ideas", count: 3 },
  { section: "Reading and Writing", domain: "Craft and Structure", count: 3 },
  { section: "Reading and Writing", domain: "Expression of Ideas", count: 2 },
  { section: "Reading and Writing", domain: "Standard English Conventions", count: 2 },
  { section: "Math", domain: "Algebra", count: 3 },
  { section: "Math", domain: "Advanced Math", count: 3 },
  { section: "Math", domain: "Problem-Solving and Data Analysis", count: 2 },
  { section: "Math", domain: "Geometry and Trigonometry", count: 2 },
];

const fullLengthBlueprint = [
  { section: "Reading and Writing", domain: "Information and Ideas", count: 14 },
  { section: "Reading and Writing", domain: "Craft and Structure", count: 13 },
  { section: "Reading and Writing", domain: "Expression of Ideas", count: 12 },
  { section: "Reading and Writing", domain: "Standard English Conventions", count: 15 },
  { section: "Math", domain: "Algebra", count: 13 },
  { section: "Math", domain: "Advanced Math", count: 13 },
  { section: "Math", domain: "Problem-Solving and Data Analysis", count: 9 },
  { section: "Math", domain: "Geometry and Trigonometry", count: 9 },
];

const rwModuleBlueprint = [
  { section: "Reading and Writing", domain: "Information and Ideas", count: 7 },
  { section: "Reading and Writing", domain: "Craft and Structure", count: 6 },
  { section: "Reading and Writing", domain: "Expression of Ideas", count: 6 },
  { section: "Reading and Writing", domain: "Standard English Conventions", count: 8 },
];

const mathModuleBlueprint = [
  { section: "Math", domain: "Algebra", count: 7 },
  { section: "Math", domain: "Advanced Math", count: 6 },
  { section: "Math", domain: "Problem-Solving and Data Analysis", count: 5 },
  { section: "Math", domain: "Geometry and Trigonometry", count: 4 },
];

const testModeMeta = {
  preview: {
    label: "Preview",
    blueprint: diagnosticBlueprint,
    expectedCount: 20,
    timeLimitMinutes: 25,
  },
  full: {
    label: "Full Length Simulated",
    blueprint: fullLengthBlueprint,
    expectedCount: 98,
    timeLimitMinutes: 134,
    modulePlan: [
      { label: "RW Module 1", section: "Reading and Writing", blueprint: rwModuleBlueprint, expectedCount: 27, timeLimitMinutes: 32, route: "standard" },
      { label: "RW Module 2", section: "Reading and Writing", blueprint: rwModuleBlueprint, expectedCount: 27, timeLimitMinutes: 32, adaptiveFromPreviousSection: true },
      { label: "Math Module 1", section: "Math", blueprint: mathModuleBlueprint, expectedCount: 22, timeLimitMinutes: 35, route: "standard" },
      { label: "Math Module 2", section: "Math", blueprint: mathModuleBlueprint, expectedCount: 22, timeLimitMinutes: 35, adaptiveFromPreviousSection: true },
    ],
  },
  adaptive: {
    label: "Adaptive Diagnostic v2",
    expectedCount: 98,
    modulePlan: [
      { label: "RW Module 1", section: "Reading and Writing", blueprint: rwModuleBlueprint, expectedCount: 27, timeLimitMinutes: 32, route: "standard" },
      { label: "RW Module 2", section: "Reading and Writing", blueprint: rwModuleBlueprint, expectedCount: 27, timeLimitMinutes: 32, adaptiveFromPreviousSection: true },
      { label: "Math Module 1", section: "Math", blueprint: mathModuleBlueprint, expectedCount: 22, timeLimitMinutes: 35, route: "standard" },
      { label: "Math Module 2", section: "Math", blueprint: mathModuleBlueprint, expectedCount: 22, timeLimitMinutes: 35, adaptiveFromPreviousSection: true },
    ],
  },
  rw_module: {
    label: "RW Adaptive Module Check",
    expectedCount: 54,
    modulePlan: [
      { label: "RW Module 1", section: "Reading and Writing", blueprint: rwModuleBlueprint, expectedCount: 27, timeLimitMinutes: 32, route: "standard" },
      { label: "RW Module 2", section: "Reading and Writing", blueprint: rwModuleBlueprint, expectedCount: 27, timeLimitMinutes: 32, adaptiveFromPreviousSection: true },
    ],
  },
  math_module: {
    label: "Math Adaptive Module Check",
    expectedCount: 44,
    modulePlan: [
      { label: "Math Module 1", section: "Math", blueprint: mathModuleBlueprint, expectedCount: 22, timeLimitMinutes: 35, route: "standard" },
      { label: "Math Module 2", section: "Math", blueprint: mathModuleBlueprint, expectedCount: 22, timeLimitMinutes: 35, adaptiveFromPreviousSection: true },
    ],
  },
};

const SAT_KNOWLEDGE_STAGES = ["Pre-SAT Grade 10", "SAT Core", "SAT Transfer", "SAT 1550-1600"];

const SAT_KNOWLEDGE_TAXONOMY = [
  {
    id: "rw-central-ideas-details",
    section: "Reading and Writing",
    domain: "Information and Ideas",
    skill: "Central Ideas and Details",
    aliases: ["central ideas", "central ideas and details", "main idea", "details", "central claim"],
    lesson: {
      rule: "Find the claim the text actually proves, not the broad topic. SAT central-idea questions reward the most specific answer that covers the whole passage.",
      steps: [
        ["1. Name the subject", "Say what the passage is mainly about in five words."],
        ["2. Name the claim", "Ask what the author says about that subject."],
        ["3. Check the scope", "Reject choices that are too broad, too narrow, or true for only one detail."],
      ],
      example: "If a passage explains that urban gardens lower heat and improve storm-water absorption, the main idea must include both environmental effects, not just gardening.",
      drill: "Before choices, write: 'The text mainly argues/explains that ...'",
      traps: ["Broad topic answers", "True detail but not central", "Answer that adds a claim the text never makes"],
    },
  },
  {
    id: "rw-inferences",
    section: "Reading and Writing",
    domain: "Information and Ideas",
    skill: "Inferences",
    aliases: ["inference", "inferences", "most reasonably infer", "suggests"],
    lesson: {
      rule: "A SAT inference is a small necessary step from the text. It should feel proven, not merely plausible.",
      steps: [
        ["1. Locate the proof", "Find the sentence or data point that the inference must follow from."],
        ["2. Make the smallest leap", "Choose the answer that requires the fewest assumptions."],
        ["3. Test necessity", "Ask whether the text would still make sense if the answer were false."],
      ],
      example: "If a study found that seedlings grew less in warmer soil than expected, it is reasonable to infer that warmth alone did not explain growth.",
      drill: "Circle the exact clue that forces the inference.",
      traps: ["Answer is interesting but not forced", "Answer reverses cause and effect", "Answer uses outside knowledge"],
    },
  },
  {
    id: "rw-command-evidence",
    section: "Reading and Writing",
    domain: "Information and Ideas",
    skill: "Command of Evidence",
    aliases: ["command of evidence", "evidence", "textual evidence", "quantitative evidence", "data evidence"],
    lesson: {
      rule: "Evidence questions ask which choice best supports or weakens a claim. Match the claim's exact logical job before reading choices.",
      steps: [
        ["1. Label the claim", "Is the task asking for support, weakening, illustration, or data interpretation?"],
        ["2. Match the variable", "For graphs/tables, use the same category and comparison named in the claim."],
        ["3. Avoid near evidence", "Reject choices that mention the topic but do not prove the claim."],
      ],
      example: "If the claim is that one method improved recall more than another, evidence must compare recall outcomes across methods.",
      drill: "Write: 'This evidence proves ___ because ___.'",
      traps: ["Evidence supports a different claim", "Choice reports data without the needed comparison", "Choice overstates correlation as causation"],
    },
  },
  {
    id: "rw-words-context",
    section: "Reading and Writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    aliases: ["words in context", "vocabulary", "context meaning", "most nearly means"],
    lesson: {
      rule: "Use nearby clues to predict the meaning before looking at answer choices. The familiar dictionary meaning is often a trap.",
      steps: [
        ["1. Cover the choices", "Insert a simple word that fits the sentence."],
        ["2. Find tone and contrast", "Use punctuation, transition words, and examples as clues."],
        ["3. Match usage", "Choose the word that fits this context and grammar."],
      ],
      example: "If a theory is 'challenged by later evidence,' challenged means questioned, not invited to compete.",
      drill: "What simple word would you put in the blank before seeing choices?",
      traps: ["Most common meaning", "Same tone but wrong meaning", "Word that fits the topic but not the sentence"],
    },
  },
  {
    id: "rw-text-structure-purpose",
    section: "Reading and Writing",
    domain: "Craft and Structure",
    skill: "Text Structure and Purpose",
    aliases: ["text structure", "purpose", "structure and purpose", "main purpose", "function"],
    lesson: {
      rule: "Purpose questions ask what a part of the text does. Answer with the rhetorical job, not a summary of the content.",
      steps: [
        ["1. Split the text", "Mark where the author introduces claim, evidence, contrast, or example."],
        ["2. Name the move", "Decide whether the sentence defines, contrasts, qualifies, illustrates, or concludes."],
        ["3. Check role not topic", "The correct answer says why the detail is there."],
      ],
      example: "A sentence about a failed experiment may function to qualify an earlier optimistic claim.",
      drill: "This sentence is included to ___, not merely to say ___.",
      traps: ["Content summary instead of purpose", "Wrong relationship between sentences", "Answer ignores a contrast word"],
    },
  },
  {
    id: "rw-cross-text",
    section: "Reading and Writing",
    domain: "Craft and Structure",
    skill: "Cross-Text Connections",
    aliases: ["cross-text", "cross text", "text 1", "text 2", "author of text 2"],
    lesson: {
      rule: "Read each text as a claim. Then classify the relationship: support, challenge, refine, or apply.",
      steps: [
        ["1. Summarize Text 1", "Write its claim in one line."],
        ["2. Summarize Text 2", "Write its claim in one line."],
        ["3. Name the relationship", "Choose the answer that captures how Text 2 would respond to Text 1."],
      ],
      example: "Text 1 says a method is broadly effective; Text 2 says it works only under certain conditions. Text 2 qualifies Text 1.",
      drill: "Does Text 2 agree, disagree, narrow, or extend Text 1?",
      traps: ["Answer describes only one text", "Answer reverses which author holds which view", "Answer exaggerates disagreement"],
    },
  },
  {
    id: "rw-rhetorical-synthesis",
    section: "Reading and Writing",
    domain: "Expression of Ideas",
    skill: "Rhetorical Synthesis",
    aliases: ["rhetorical synthesis", "student notes", "bullet", "notes"],
    lesson: {
      rule: "Use only the notes needed to satisfy the stated goal. True but irrelevant details are traps.",
      steps: [
        ["1. Underline the goal", "Identify whether the sentence must compare, introduce, emphasize, or explain."],
        ["2. Select relevant notes", "Ignore facts that do not serve the goal."],
        ["3. Check sentence logic", "The final sentence must be grammatical and goal-focused."],
      ],
      example: "If the goal is to compare two artists, the answer must mention both artists and a meaningful point of comparison.",
      drill: "Which note directly serves the rhetorical goal?",
      traps: ["True note, wrong goal", "Too much detail", "Sentence mentions only one side of a comparison"],
    },
  },
  {
    id: "rw-transitions",
    section: "Reading and Writing",
    domain: "Expression of Ideas",
    skill: "Transitions",
    aliases: ["transition", "transitions", "logical transition"],
    lesson: {
      rule: "Choose the transition from the relationship between ideas: continuation, contrast, result, example, or concession.",
      steps: [
        ["1. Summarize both sides", "Write the idea before and after the blank."],
        ["2. Classify the relationship", "Same direction, opposite direction, cause/result, or example."],
        ["3. Insert and test", "Read the sentence with the transition aloud mentally."],
      ],
      example: "Prediction says results should improve; actual results do not improve. Use a contrast transition such as however.",
      drill: "Are the two ideas same-direction or opposite-direction?",
      traps: ["Transition has correct tone but wrong logic", "For example used without an example", "Therefore used when no result is shown"],
    },
  },
  {
    id: "rw-boundaries",
    section: "Reading and Writing",
    domain: "Standard English Conventions",
    skill: "Boundaries",
    aliases: ["boundaries", "sentence boundaries", "punctuation", "comma splice", "semicolon"],
    lesson: {
      rule: "First identify independent clauses. Two independent clauses need a period, semicolon, colon, or comma plus a coordinating conjunction.",
      steps: [
        ["1. Find subject and verb", "Check each side of the punctuation."],
        ["2. Classify each side", "Independent clause, dependent clause, phrase, or list item."],
        ["3. Pick legal punctuation", "Avoid comma splices and fragments."],
      ],
      example: "The trial ended in June; the final report appeared in August. A semicolon can join two complete clauses.",
      drill: "Can each side stand alone as a sentence?",
      traps: ["Comma splice", "Colon after an incomplete setup", "Dash used to hide a grammar mismatch"],
    },
  },
  {
    id: "rw-form-structure-sense",
    section: "Reading and Writing",
    domain: "Standard English Conventions",
    skill: "Form, Structure, and Sense",
    aliases: ["form, structure, and sense", "form structure and sense", "verb", "agreement", "modifier", "pronoun"],
    lesson: {
      rule: "Match grammar to meaning: subject-verb agreement, verb tense, pronoun reference, and modifier placement must all fit the sentence.",
      steps: [
        ["1. Strip interrupting phrases", "Find the true subject and verb."],
        ["2. Track time and reference", "Use context to choose tense and pronoun agreement."],
        ["3. Place modifiers next to targets", "Make sure descriptive phrases modify the intended noun."],
      ],
      example: "The list of results is complete. The subject is list, not results.",
      drill: "What word controls the verb or pronoun?",
      traps: ["Nearest noun trap", "Unclear pronoun reference", "Modifier attached to the wrong noun"],
    },
  },
  {
    id: "math-linear-one-variable",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in one variable",
    aliases: ["linear equations in one variable", "linear equation in one variable"],
    lesson: {
      rule: "Isolate the variable using inverse operations, then substitute the answer into the original equation.",
      steps: [["1. Clear constants", "Move constants away from the variable."], ["2. Divide by coefficient", "Use the coefficient attached to the variable."], ["3. Check", "Substitute back into the original equation."]],
      example: "3x + 5 = 17 -> 3x = 12 -> x = 4.",
      drill: "What operation currently blocks the variable?",
      traps: ["Sign error when moving terms", "Answering for 2x instead of x", "Forgetting to distribute"],
    },
  },
  {
    id: "math-linear-functions",
    section: "Math",
    domain: "Algebra",
    skill: "Linear functions",
    aliases: ["linear functions", "linear function", "slope", "linear functions and slope"],
    lesson: {
      rule: "A linear function has constant rate of change. Slope is change in output divided by change in input.",
      steps: [["1. Identify inputs and outputs", "Keep x and y roles separate."], ["2. Compute rate", "Use change in y over change in x."], ["3. Interpret", "Connect slope/intercept to the story."]],
      example: "If y rises from 5 to 13 while x rises from 2 to 6, slope = 8/4 = 2.",
      drill: "What does one unit increase in x do to y?",
      traps: ["Reversing x and y", "Using one point as the rate", "Ignoring units"],
    },
  },
  {
    id: "math-linear-two-variable",
    section: "Math",
    domain: "Algebra",
    skill: "Linear equations in two variables",
    aliases: ["linear equations in two variables", "linear equation in two variables"],
    lesson: {
      rule: "A two-variable linear equation represents a line. Use slope-intercept, standard form, or point substitution depending on the task.",
      steps: [["1. Choose form", "Convert to the form that makes the ask easiest."], ["2. Use points carefully", "Substitute x and y together."], ["3. Interpret constants", "Slope and intercept often carry units."]],
      example: "2x + 3y = 12 can be rearranged to y = -2/3x + 4.",
      drill: "Which form makes the question easiest?",
      traps: ["Treating x-intercept as y-intercept", "Dropping a negative slope", "Mixing coordinate order"],
    },
  },
  {
    id: "math-linear-systems",
    section: "Math",
    domain: "Algebra",
    skill: "Systems of two linear equations in two variables",
    aliases: ["systems of two linear equations", "systems of linear equations", "system of linear equations", "systems"],
    lesson: {
      rule: "The solution to a system is the point where both equations are true. Use substitution, elimination, or graph meaning.",
      steps: [["1. Align equations", "Choose substitution if one variable is isolated; otherwise use elimination."], ["2. Solve one variable", "Keep signs consistent."], ["3. Substitute back", "Find the other coordinate and check both equations."]],
      example: "If y = 2x + 1 and y = x + 5, then 2x + 1 = x + 5, so x = 4 and y = 9.",
      drill: "Which method removes a variable fastest?",
      traps: ["Only finding one coordinate", "Adding equations when signs do not cancel", "Confusing no solution with one solution"],
    },
  },
  {
    id: "math-linear-inequalities",
    section: "Math",
    domain: "Algebra",
    skill: "Linear inequalities in one or two variables",
    aliases: ["linear inequalities", "inequality", "inequalities"],
    lesson: {
      rule: "Solve inequalities like equations, but reverse the inequality when multiplying or dividing by a negative.",
      steps: [["1. Isolate expression", "Use inverse operations."], ["2. Watch negatives", "Flip the symbol only when multiplying/dividing by a negative."], ["3. Interpret region", "For two-variable inequalities, test a point if needed."]],
      example: "-2x < 8 becomes x > -4 after dividing by -2.",
      drill: "Did you multiply or divide by a negative?",
      traps: ["Forgetting to flip", "Using boundary as included when symbol is strict", "Shading the wrong side"],
    },
  },
  {
    id: "math-nonlinear-functions",
    section: "Math",
    domain: "Advanced Math",
    skill: "Nonlinear functions",
    aliases: ["nonlinear functions", "nonlinear equations and functions", "quadratic functions", "exponential functions", "exponential"],
    lesson: {
      rule: "Nonlinear functions change at a nonconstant rate. Identify whether the pattern is quadratic, exponential, rational, or radical before solving.",
      steps: [["1. Classify form", "Look for powers, products of variables, roots, or repeated percent change."], ["2. Use structure", "Vertex, intercept, factor, or growth factor often reveals the answer."], ["3. Check domain", "Roots, denominators, and context can restrict values."]],
      example: "An exponential function with growth factor 1.2 increases by 20% each step.",
      drill: "What feature makes this function nonlinear?",
      traps: ["Treating exponential change as linear", "Ignoring domain restrictions", "Reading vertex as intercept"],
    },
  },
  {
    id: "math-nonlinear-equations",
    section: "Math",
    domain: "Advanced Math",
    skill: "Nonlinear equations in one variable",
    aliases: ["nonlinear equations", "nonlinear equations in one variable", "quadratic equations", "radical equations"],
    lesson: {
      rule: "Move all terms to one side, then solve using factoring, square roots, completing the square, or equivalent transformations.",
      steps: [["1. Standardize", "Put the equation in a recognizable form."], ["2. Solve cleanly", "Factor when possible; otherwise use a reliable method."], ["3. Check extraneous roots", "Especially after squaring or using rational expressions."]],
      example: "x^2 - 5x + 6 = 0 -> (x - 2)(x - 3) = 0 -> x = 2 or 3.",
      drill: "Could any operation have introduced an extraneous solution?",
      traps: ["Selecting the wrong requested root", "Forgetting both roots", "Not checking after squaring"],
    },
  },
  {
    id: "math-nonlinear-systems",
    section: "Math",
    domain: "Advanced Math",
    skill: "Systems of equations in two variables",
    aliases: ["systems of equations in two variables", "linear and nonlinear systems", "nonlinear systems", "line and parabola"],
    lesson: {
      rule: "A nonlinear system asks for intersections of two relationships. Substitute one equation into the other and interpret the resulting solutions.",
      steps: [["1. Isolate one variable", "Use the equation that is easier to substitute."], ["2. Substitute", "Reduce to one-variable equation."], ["3. Interpret intersections", "One, two, or no real solutions may be possible."]],
      example: "If y = x + 1 and y = x^2 - 5, solve x + 1 = x^2 - 5 to find intersection x-values.",
      drill: "After substitution, what does each solution represent?",
      traps: ["Stopping after x only", "Keeping extraneous intersections", "Assuming two solutions without checking discriminant/context"],
    },
  },
  {
    id: "math-equivalent-expressions",
    section: "Math",
    domain: "Advanced Math",
    skill: "Equivalent expressions",
    aliases: ["equivalent expressions", "polynomial", "rational expression", "radical expression", "factoring", "rewrite"],
    lesson: {
      rule: "Equivalent expressions have the same value for all allowed inputs. Use factoring, expansion, common denominators, and structure recognition.",
      steps: [["1. Identify target form", "Factor, expand, complete square, or combine fractions based on the choices."], ["2. Preserve restrictions", "Denominators cannot be zero; radicals have domain limits."], ["3. Verify with substitution", "A quick numeric check can catch algebra slips."]],
      example: "x^2 + 6x + 9 is equivalent to (x + 3)^2.",
      drill: "Which algebra move changes form without changing value?",
      traps: ["Canceling terms across addition", "Losing denominator restrictions", "Expanding with a sign error"],
    },
  },
  {
    id: "math-ratios-rates-units",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Ratios, rates, proportional relationships, and units",
    aliases: ["ratios", "ratio", "rates", "rate", "proportional", "units", "rates and units", "ratios and rates"],
    lesson: {
      rule: "Set up ratios with matching units and labels. In proportional relationships, equivalent ratios stay constant.",
      steps: [["1. Label quantities", "Write units beside every number."], ["2. Build ratio", "Keep order consistent."], ["3. Scale or solve", "Use multiplication, division, or a proportion."]],
      example: "If 3 notebooks cost $12, the unit rate is $4 per notebook.",
      drill: "What are the units of the answer?",
      traps: ["Reversing ratio order", "Mixing units", "Assuming proportionality when fixed fees exist"],
    },
  },
  {
    id: "math-percentages",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Percentages",
    aliases: ["percentage", "percentages", "percent", "percent change"],
    lesson: {
      rule: "Always identify the base. Percent change uses original value as the denominator.",
      steps: [["1. Find base", "Ask percent of what."], ["2. Convert", "Use decimal or fraction form."], ["3. Apply change", "Increase means multiply by 1 + rate; decrease by 1 - rate."]],
      example: "A 15% decrease from 80 gives 80 x 0.85 = 68.",
      drill: "What original total is the percent based on?",
      traps: ["Using final value as base", "Adding percent points as percent change", "Doing two changes as one simple addition"],
    },
  },
  {
    id: "math-one-variable-data",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "One-variable data: distributions and measures of center and spread",
    aliases: ["one-variable data", "statistics", "mean", "median", "range", "standard deviation", "measures of center", "spread"],
    lesson: {
      rule: "Use the measure that matches the question: mean for balance point, median for middle, range/spread for variability.",
      steps: [["1. Sort if needed", "Median and range require ordered values."], ["2. Choose statistic", "Do not compute a mean when the question asks spread."], ["3. Interpret change", "Outliers affect mean and range more than median."]],
      example: "For 2, 4, 9, 10, the median is (4 + 9)/2 = 6.5.",
      drill: "Is the question asking center or spread?",
      traps: ["Using mean instead of median", "Forgetting to reorder data", "Ignoring outliers"],
    },
  },
  {
    id: "math-two-variable-data",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Two-variable data: models and scatterplots",
    aliases: ["two-variable data", "scatterplot", "scatter plot", "models", "line of best fit", "data interpretation"],
    lesson: {
      rule: "Scatterplots and models describe relationships between two variables. Use trend, slope, intercept, and residual meaning carefully.",
      steps: [["1. Identify variables", "Know which variable is input and output."], ["2. Read trend", "Positive, negative, none, linear, or nonlinear."], ["3. Use model only in scope", "Avoid extrapolating far beyond the data."]],
      example: "A line of best fit with positive slope predicts larger y-values as x increases.",
      drill: "What does the slope mean in context?",
      traps: ["Confusing correlation with causation", "Reading x and y backwards", "Extrapolating outside the data range"],
    },
  },
  {
    id: "math-probability",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Probability and conditional probability",
    aliases: ["probability", "conditional probability", "likelihood"],
    lesson: {
      rule: "Probability is favorable outcomes over possible outcomes. Conditional probability changes the sample space.",
      steps: [["1. Define sample space", "Use the condition if one is given."], ["2. Count favorable", "Only count outcomes that satisfy the event."], ["3. Simplify", "Report fraction, decimal, or percent as requested."]],
      example: "If 12 students are juniors and 5 of those juniors play soccer, P(soccer | junior) = 5/12.",
      drill: "Has the condition changed the denominator?",
      traps: ["Using the total group instead of conditioned group", "Double-counting overlap", "Confusing and/or"],
    },
  },
  {
    id: "math-sample-inference-margin-error",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Inference from sample statistics and margin of error",
    aliases: ["inference from sample", "sample statistics", "margin of error", "confidence interval", "random sample"],
    lesson: {
      rule: "A random sample supports inference to a population. Margin of error gives a plausible range around an estimate, not a guarantee for individuals.",
      steps: [["1. Check sampling method", "Random sample is the key condition."], ["2. Build interval", "Estimate plus or minus margin of error."], ["3. Limit conclusion", "Infer to the sampled population only."]],
      example: "A sample estimate of 62% with margin 4% suggests a plausible population range from 58% to 66%.",
      drill: "What population can this sample actually represent?",
      traps: ["Inferring from a biased sample", "Treating margin of error as exact", "Applying the result to a different population"],
    },
  },
  {
    id: "math-statistical-claims",
    section: "Math",
    domain: "Problem-Solving and Data Analysis",
    skill: "Evaluating statistical claims: observational studies and experiments",
    aliases: ["statistical claims", "observational studies", "observational study", "experiments", "experiment", "random assignment"],
    lesson: {
      rule: "Random assignment supports cause-and-effect conclusions; observational studies usually support association, not causation.",
      steps: [["1. Identify design", "Experiment, observational study, survey, or sample."], ["2. Check randomization", "Random assignment is needed for causal claims."], ["3. State valid claim", "Separate association, causation, and population inference."]],
      example: "If students choose their own study method, better scores show association, not proof that the method caused improvement.",
      drill: "Was there random assignment or only observation?",
      traps: ["Causal claim from observation", "Population claim from nonrandom sample", "Confusing random sample with random assignment"],
    },
  },
  {
    id: "math-area-volume",
    section: "Math",
    domain: "Geometry and Trigonometry",
    skill: "Area and volume",
    aliases: ["area and volume", "area", "volume", "surface area"],
    lesson: {
      rule: "Choose the correct geometric measure and track units: length, area, and volume scale differently.",
      steps: [["1. Identify shape", "Circle, triangle, rectangle, prism, cylinder, etc."], ["2. Choose formula", "Use the formula matching the requested measure."], ["3. Check units and scaling", "Area uses square units; volume uses cubic units."]],
      example: "If a square side triples, its area multiplies by 9.",
      drill: "Is the answer length, area, or volume?",
      traps: ["Using diameter as radius", "Confusing area and perimeter", "Scaling area linearly"],
    },
  },
  {
    id: "math-lines-angles-triangles",
    section: "Math",
    domain: "Geometry and Trigonometry",
    skill: "Lines, angles, and triangles",
    aliases: ["lines angles and triangles", "lines, angles, and triangles", "triangles", "angles", "parallel lines"],
    lesson: {
      rule: "Use angle relationships, triangle sums, similarity, and proportional sides to unlock the diagram.",
      steps: [["1. Mark known angles", "Use vertical, supplementary, and parallel-line relationships."], ["2. Use triangle facts", "Angles sum to 180; similar triangles have proportional sides."], ["3. Solve for requested value", "Check whether the question asks angle, length, or ratio."]],
      example: "If two triangles are similar with scale factor 3, corresponding side lengths multiply by 3.",
      drill: "Which angle or side relationship is forced by the diagram?",
      traps: ["Assuming a diagram is to scale", "Using noncorresponding sides", "Forgetting triangle angle sum"],
    },
  },
  {
    id: "math-right-triangles-trig",
    section: "Math",
    domain: "Geometry and Trigonometry",
    skill: "Right triangles and trigonometry",
    aliases: ["right triangles", "right triangles and trigonometry", "trigonometry", "sine", "cosine", "tangent"],
    lesson: {
      rule: "In right triangles, use Pythagorean theorem, special triangles, and SOH-CAH-TOA according to the given sides and angle.",
      steps: [["1. Label sides", "Opposite, adjacent, and hypotenuse depend on the chosen angle."], ["2. Pick relation", "Pythagorean, 30-60-90, 45-45-90, sine, cosine, or tangent."], ["3. Solve and check", "Hypotenuse must be the longest side."]],
      example: "For angle theta, sin(theta) = opposite / hypotenuse.",
      drill: "Relative to the marked angle, which side is opposite?",
      traps: ["Using adjacent instead of opposite", "Treating a leg as hypotenuse", "Mixing degree measure with side ratio"],
    },
  },
  {
    id: "math-circles",
    section: "Math",
    domain: "Geometry and Trigonometry",
    skill: "Circles",
    aliases: ["circles", "circle", "arc", "sector", "tangent"],
    lesson: {
      rule: "Circle problems often turn on radius, diameter, circumference, area, arc length, sector area, or tangent-radius perpendicularity.",
      steps: [["1. Convert diameter/radius", "Many traps begin with using the wrong one."], ["2. Choose circle formula", "Circumference, area, arc, or sector."], ["3. Use angle fraction", "Arc and sector use central angle over 360 degrees."]],
      example: "A 90-degree sector is one fourth of a circle, so its area is one fourth of pi r squared.",
      drill: "Did the problem give radius or diameter?",
      traps: ["Diameter-radius confusion", "Arc length vs sector area", "Forgetting tangent is perpendicular to radius"],
    },
  },
  {
    id: "math-desmos-strategy",
    section: "Math",
    domain: "Calculator Strategy",
    skill: "Desmos Strategy for SAT Math",
    aliases: ["desmos", "graphing calculator", "calculator strategy", "desmos for sat math"],
    moduleType: "minicourse",
    priorityBoost: 75,
    lesson: {
      rule: "Desmos is a decision tool, not a default move. Use it when graphing, intersections, tables, regression, sliders, or verification save time; choose algebra or mental math when structure is faster.",
      steps: [
        ["1. Classify the task", "Decide whether the item asks for a value, intersection, graph feature, model, domain, or answer format."],
        ["2. Choose the workflow", "Use graph/intersection, table, slider, regression, or a quick numeric check only when it is faster than hand algebra."],
        ["3. Verify the answer", "Check units, rounding, window, restrictions, and whether the result answers the exact SAT question."],
      ],
      example: "For a system such as y = 2x + 1 and y = x + 5, graph both equations, tap the intersection, then verify that the x- and y-values satisfy both equations.",
      drill: "Before solving each Math item, label it mental, algebra, Desmos-first, or Desmos-check.",
      traps: [
        "Using Desmos on a one-step item that mental math solves faster",
        "Reading a rounded decimal when the answer requires an exact fraction or integer",
        "Missing a solution because the graph window is too narrow",
        "Graphing an expression when the task requires an equation or restricted domain",
      ],
    },
  },
];

const translations = SatStudioI18n.translations;
const dynamicUiViText = SatStudioI18n.dynamicUiViText;
const dynamicUiViPatterns = SatStudioI18n.dynamicUiViPatterns;

const rewardCatalog = [
  { id: "starter-spark", name: "Starter Spark", icon: "★", requirement: 20, description: "Earn 20 attendance points." },
  { id: "focus-flame", name: "Focus Flame", icon: "◆", requirement: 60, description: "Earn 60 attendance points." },
  { id: "streak-shield", name: "Streak Shield", icon: "⬟", requirement: 120, description: "Earn 120 attendance points." },
  { id: "review-ranger", name: "Review Ranger", icon: "◈", requirement: 220, description: "Earn 220 attendance points." },
  { id: "sat-ace", name: "SAT Ace", icon: "✦", requirement: 360, description: "Earn 360 attendance points." },
];

const achievementCatalog = [
  { id: "diagnostic-starter", name: "Diagnostic Starter", icon: "D", criteria: { pretests: 1 }, description: "Complete one diagnostic." },
  { id: "sprint-starter", name: "Sprint Starter", icon: "5", criteria: { sprintsCompleted: 1 }, description: "Finish a 5-Minute Sprint." },
  { id: "bluebook-logger", name: "Bluebook Logger", icon: "B", criteria: { externalMinutes: 30 }, description: "Log 30 outside study minutes." },
  { id: "review-streaker", name: "Review Streak", icon: "R", criteria: { streak: 3, reviews: 6 }, description: "Keep a 3-day study streak while repairing missed questions." },
  { id: "proof-closer", name: "Proof Closer", icon: "P", criteria: { proofsPassed: 1 }, revealWhen: { proofsPassed: 1 }, secret: true, description: "Pass a remediation proof." },
  { id: "hard-winner", name: "Hard Winner", icon: "H", criteria: { hardCorrect: 2 }, revealWhen: { hardCorrect: 1 }, secret: true, description: "Get hard questions correct." },
];

const defaultRewardPrograms = [
  {
    id: "reward-sprint-choice",
    title: "Choose the next sprint topic",
    description: "Redeem to choose the next 5-minute sprint focus with a parent or tutor.",
    costPoints: 40,
    rewardType: "study_bonus",
    scope: "global",
    status: "active",
    ownerAccountId: "content-admin",
    targetStudentIds: [],
    createdAt: "2026-05-20T00:00:00.000Z",
  },
  {
    id: "reward-family-movie",
    title: "Family movie night",
    description: "Parent-approved reward after consistent SAT practice.",
    costPoints: 90,
    rewardType: "experience",
    scope: "family",
    status: "active",
    ownerAccountId: "parent-admin",
    targetStudentIds: ["student-demo"],
    createdAt: "2026-05-20T00:00:00.000Z",
  },
];

const seedVocab = [
  {
    id: "vocab-mitigate",
    word: "mitigate",
    partOfSpeech: "verb",
    category: "Argument and logic",
    definition: "to make a problem, harm, or difficulty less severe",
    example: "The city planted trees along the avenue to mitigate the heat trapped by concrete.",
  },
  {
    id: "vocab-substantiate",
    word: "substantiate",
    partOfSpeech: "verb",
    category: "Argument and logic",
    definition: "to support a claim with evidence or proof",
    example: "The researcher used survey data to substantiate her claim about study habits.",
  },
  {
    id: "vocab-ambivalent",
    word: "ambivalent",
    partOfSpeech: "adjective",
    category: "Tone and attitude",
    definition: "having mixed or conflicting feelings about something",
    example: "The critic was ambivalent about the film, praising its acting but questioning its pacing.",
  },
  {
    id: "vocab-candid",
    word: "candid",
    partOfSpeech: "adjective",
    category: "Tone and attitude",
    definition: "honest and direct, especially about something difficult",
    example: "In a candid interview, the scientist described both the promise and limits of the study.",
  },
  {
    id: "vocab-nuance",
    word: "nuance",
    partOfSpeech: "noun",
    category: "Reading precision",
    definition: "a subtle difference in meaning, tone, or feeling",
    example: "The translation preserved the nuance of the original poem's final line.",
  },
  {
    id: "vocab-underscore",
    word: "underscore",
    partOfSpeech: "verb",
    category: "Reading precision",
    definition: "to emphasize or make something more noticeable",
    example: "The unexpected result underscores the need for additional experiments.",
  },
  {
    id: "vocab-preclude",
    word: "preclude",
    partOfSpeech: "verb",
    category: "Cause and constraint",
    definition: "to prevent something from happening or make it impossible",
    example: "A lack of reliable records precluded a precise estimate of the population.",
  },
  {
    id: "vocab-constrain",
    word: "constrain",
    partOfSpeech: "verb",
    category: "Cause and constraint",
    definition: "to limit or restrict what someone or something can do",
    example: "Budget limits constrained the design team, but they still produced a useful prototype.",
  },
  {
    id: "vocab-proliferate",
    word: "proliferate",
    partOfSpeech: "verb",
    category: "Change and trend",
    definition: "to increase quickly in number or amount",
    example: "Small online journals proliferated as publishing tools became easier to use.",
  },
  {
    id: "vocab-transient",
    word: "transient",
    partOfSpeech: "adjective",
    category: "Change and trend",
    definition: "lasting only for a short time",
    example: "The artist captured the transient glow of the sky just before sunset.",
  },
  {
    id: "vocab-scrutinize",
    word: "scrutinize",
    partOfSpeech: "verb",
    category: "Research and evidence",
    definition: "to examine something very carefully",
    example: "Reviewers scrutinized the data before accepting the paper's conclusion.",
  },
  {
    id: "vocab-corroborate",
    word: "corroborate",
    partOfSpeech: "verb",
    category: "Research and evidence",
    definition: "to provide additional evidence that supports a statement or finding",
    example: "The second experiment corroborated the pattern observed in the first trial.",
  },
  {
    id: "vocab-disparate",
    word: "disparate",
    partOfSpeech: "adjective",
    category: "Comparison",
    definition: "very different from one another",
    example: "The exhibit brought together disparate objects from science, art, and daily life.",
  },
  {
    id: "vocab-analogous",
    word: "analogous",
    partOfSpeech: "adjective",
    category: "Comparison",
    definition: "similar in a way that makes comparison useful",
    example: "The author argues that coral reefs are analogous to cities because both contain dense networks of activity.",
  },
  {
    id: "vocab-pragmatic",
    word: "pragmatic",
    partOfSpeech: "adjective",
    category: "Decision and method",
    definition: "focused on practical results rather than abstract ideas",
    example: "The committee chose a pragmatic solution that could be implemented within one semester.",
  },
  {
    id: "vocab-arbitrary",
    word: "arbitrary",
    partOfSpeech: "adjective",
    category: "Decision and method",
    definition: "based on personal choice or chance rather than a clear reason",
    example: "The cutoff was not arbitrary; it reflected a threshold used in earlier studies.",
  },
];

const supplementalVocab = vocabRowsToEntries([
  ["aberration", "noun", "Academic Reasoning", "sự lệch chuẩn; điều bất thường so với mẫu chung", "a departure from what is normal or expected"],
  ["abhor", "verb", "Tone and Attitude", "ghê tởm; phản đối rất mạnh", "to strongly hate or reject something"],
  ["abject", "adjective", "Tone and Attitude", "cực kỳ tồi tệ hoặc thấp kém", "extremely bad, low, or hopeless"],
  ["abrasive", "adjective", "Tone and Attitude", "gay gắt; dễ gây khó chịu", "harsh in manner or likely to irritate"],
  ["acute", "adjective", "Academic Reasoning", "sắc bén; nghiêm trọng; có mức độ cao", "sharp, severe, or highly developed"],
  ["adamant", "adjective", "Tone and Attitude", "cứng rắn; không chịu thay đổi ý kiến", "firm and unwilling to change a position"],
  ["adept", "adjective", "Decision and Method", "thành thạo; có kỹ năng tốt", "highly skilled at doing something"],
  ["adjacent", "adjective", "Reading Precision", "liền kề; nằm sát bên", "next to or near something"],
  ["advocate", "verb", "Argument and Logic", "ủng hộ hoặc công khai bênh vực một ý kiến", "to publicly support an idea or policy"],
  ["aesthetic", "adjective", "Literature and Arts", "thuộc về thẩm mỹ hoặc vẻ đẹp", "related to beauty, art, or visual appeal"],
  ["affluent", "adjective", "History and Society", "giàu có; thịnh vượng", "wealthy or having abundant resources"],
  ["ambiguous", "adjective", "Reading Precision", "mơ hồ; có thể hiểu theo nhiều cách", "open to more than one interpretation"],
  ["apathetic", "adjective", "Tone and Attitude", "thờ ơ; thiếu quan tâm", "showing little interest or concern"],
  ["archaic", "adjective", "History and Society", "cổ xưa; không còn phổ biến", "old-fashioned or from an earlier period"],
  ["assert", "verb", "Argument and Logic", "khẳng định một cách chắc chắn", "to state something confidently"],
  ["assess", "verb", "Evidence and Research", "đánh giá; xem xét mức độ hoặc giá trị", "to evaluate the nature or quality of something"],
  ["austere", "adjective", "Tone and Attitude", "khắc khổ; đơn giản nghiêm ngặt", "strict, plain, or lacking comfort"],
  ["benevolent", "adjective", "Tone and Attitude", "nhân từ; có thiện ý", "kind and intending to help"],
  ["bolster", "verb", "Argument and Logic", "củng cố; hỗ trợ làm mạnh hơn", "to strengthen or support"],
  ["brevity", "noun", "Reading Precision", "sự ngắn gọn", "concise use of words or short duration"],
  ["censure", "verb", "Tone and Attitude", "chỉ trích hoặc khiển trách chính thức", "to strongly criticize, often formally"],
  ["chronicle", "noun", "History and Society", "bản ghi chép sự kiện theo thời gian", "a record of events in order"],
  ["circumspect", "adjective", "Decision and Method", "thận trọng; cân nhắc kỹ trước khi làm", "careful to avoid risk or mistakes"],
  ["concise", "adjective", "Reading Precision", "ngắn gọn nhưng đủ ý", "brief while still giving necessary information"],
  ["conclusive", "adjective", "Argument and Logic", "có tính kết luận; đủ để chứng minh", "settling a question or proving a point"],
  ["consensus", "noun", "Argument and Logic", "sự đồng thuận chung", "general agreement among a group"],
  ["conventional", "adjective", "History and Society", "theo thông lệ; truyền thống", "following accepted customs or usual methods"],
  ["cultivate", "verb", "Change and Causality", "nuôi dưỡng; phát triển dần", "to develop or improve through effort"],
  ["debunk", "verb", "Argument and Logic", "bác bỏ bằng cách chỉ ra điều sai", "to expose a claim as false or exaggerated"],
  ["deference", "noun", "Tone and Attitude", "sự kính trọng; thái độ nhường quyền", "respectful submission to someone or something"],
  ["delineate", "verb", "Reading Precision", "mô tả hoặc vạch rõ ranh giới", "to describe or outline clearly"],
  ["diminish", "verb", "Change and Causality", "làm giảm; trở nên ít hơn", "to reduce or become less"],
  ["discern", "verb", "Reading Precision", "nhận ra; phân biệt được", "to perceive or distinguish"],
  ["discrepancy", "noun", "Evidence and Research", "sự chênh lệch; điểm không khớp", "a difference between things that should match"],
  ["dismiss", "verb", "Argument and Logic", "gạt bỏ; cho là không quan trọng", "to reject or treat as unimportant"],
  ["eclectic", "adjective", "Literature and Arts", "kết hợp từ nhiều nguồn/phong cách khác nhau", "drawing ideas or styles from many sources"],
  ["elicit", "verb", "Evidence and Research", "gợi ra; thu được phản ứng hoặc thông tin", "to draw out a response or information"],
  ["eloquent", "adjective", "Literature and Arts", "diễn đạt rõ ràng và thuyết phục", "fluent and persuasive in expression"],
  ["empirical", "adjective", "Evidence and Research", "dựa trên quan sát hoặc dữ liệu thực nghiệm", "based on observation or experiment"],
  ["emulate", "verb", "Decision and Method", "noi theo để đạt kết quả tương tự", "to imitate with the aim of matching or improving"],
  ["ephemeral", "adjective", "Change and Causality", "tồn tại rất ngắn", "lasting for a very short time"],
  ["equivocal", "adjective", "Reading Precision", "mập mờ; không rõ ràng", "unclear or deliberately ambiguous"],
  ["erudite", "adjective", "Academic Reasoning", "uyên bác; có kiến thức rộng", "showing deep knowledge"],
  ["exacerbate", "verb", "Change and Causality", "làm trầm trọng hơn", "to make a problem worse"],
  ["exhaustive", "adjective", "Evidence and Research", "toàn diện; bao quát hết", "covering all possibilities or details"],
  ["explicit", "adjective", "Reading Precision", "rõ ràng; được nói trực tiếp", "clear and directly stated"],
  ["facilitate", "verb", "Decision and Method", "tạo điều kiện; làm cho dễ hơn", "to make an action or process easier"],
  ["feasible", "adjective", "Decision and Method", "khả thi; có thể thực hiện được", "possible and practical to do"],
  ["fluctuate", "verb", "Change and Causality", "dao động; thay đổi lên xuống", "to rise and fall irregularly"],
  ["fortuitous", "adjective", "Change and Causality", "tình cờ nhưng thuận lợi", "happening by chance, often helpfully"],
  ["frugal", "adjective", "Decision and Method", "tiết kiệm; dùng ít tài nguyên", "careful with money or resources"],
  ["galvanize", "verb", "Change and Causality", "kích thích hành động mạnh mẽ", "to spur people into action"],
  ["hypothesis", "noun", "Evidence and Research", "giả thuyết để kiểm chứng", "a proposed explanation that can be tested"],
  ["impartial", "adjective", "Evidence and Research", "không thiên vị", "fair and not favoring one side"],
  ["implicit", "adjective", "Reading Precision", "ngầm hiểu; không nói trực tiếp", "suggested without being directly stated"],
  ["indifferent", "adjective", "Tone and Attitude", "không quan tâm; dửng dưng", "having no particular interest or concern"],
  ["ingenious", "adjective", "Decision and Method", "khéo léo; sáng tạo trong cách giải quyết", "clever, original, and practical"],
  ["inhibit", "verb", "Change and Causality", "cản trở hoặc kìm hãm", "to slow, restrict, or prevent"],
  ["innovate", "verb", "Change and Causality", "đổi mới; tạo cách làm mới", "to introduce a new method or idea"],
  ["integrity", "noun", "Tone and Attitude", "sự chính trực; tính toàn vẹn", "honesty or wholeness"],
  ["interpret", "verb", "Reading Precision", "diễn giải; hiểu ý nghĩa", "to explain or understand meaning"],
  ["intrinsic", "adjective", "Academic Reasoning", "thuộc bản chất bên trong", "belonging naturally to something"],
  ["lament", "verb", "Tone and Attitude", "than tiếc; bày tỏ nỗi buồn", "to express sorrow or regret"],
  ["lucid", "adjective", "Reading Precision", "rõ ràng; dễ hiểu", "clear and easy to understand"],
  ["marginal", "adjective", "Academic Reasoning", "nhỏ; không đáng kể; ở rìa", "minor, limited, or at the edge"],
  ["meticulous", "adjective", "Decision and Method", "tỉ mỉ; chú ý từng chi tiết", "very careful and precise"],
  ["novel", "adjective", "Change and Causality", "mới lạ; chưa từng thấy", "new or unusual"],
  ["obsolete", "adjective", "Change and Causality", "lỗi thời; không còn dùng", "no longer useful or current"],
  ["opaque", "adjective", "Reading Precision", "khó hiểu; không rõ", "hard to understand or not transparent"],
  ["paramount", "adjective", "Academic Reasoning", "quan trọng nhất", "more important than anything else"],
  ["pervasive", "adjective", "Change and Causality", "lan rộng; hiện diện khắp nơi", "spreading widely throughout"],
  ["plausible", "adjective", "Argument and Logic", "có vẻ hợp lý; đáng tin", "seeming reasonable or believable"],
  ["profound", "adjective", "Academic Reasoning", "sâu sắc; có tác động lớn", "deep, intense, or very significant"],
  ["prominent", "adjective", "Academic Reasoning", "nổi bật; quan trọng", "well-known or easily noticed"],
  ["prudent", "adjective", "Decision and Method", "thận trọng và khôn ngoan", "careful and sensible in judgment"],
  ["reconcile", "verb", "Argument and Logic", "hòa giải; làm cho hai ý khớp nhau", "to bring ideas or people into agreement"],
  ["refute", "verb", "Argument and Logic", "phản bác bằng chứng hoặc lý lẽ", "to prove a claim wrong"],
  ["reinforce", "verb", "Argument and Logic", "củng cố; làm mạnh thêm", "to strengthen support for something"],
  ["relevant", "adjective", "Argument and Logic", "có liên quan trực tiếp", "directly connected to the matter"],
  ["resilient", "adjective", "Change and Causality", "có khả năng phục hồi", "able to recover after difficulty"],
  ["rigorous", "adjective", "Evidence and Research", "nghiêm ngặt; chính xác", "thorough, strict, and careful"],
  ["skeptical", "adjective", "Tone and Attitude", "hoài nghi; chưa tin ngay", "inclined to question or doubt"],
  ["subtle", "adjective", "Reading Precision", "tinh tế; khó nhận ra ngay", "delicate or not immediately obvious"],
  ["succinct", "adjective", "Reading Precision", "súc tích; nói ngắn gọn", "brief and clearly expressed"],
  ["undermine", "verb", "Argument and Logic", "làm suy yếu dần", "to weaken gradually or secretly"],
  ["validate", "verb", "Evidence and Research", "xác nhận; chứng thực", "to confirm that something is sound or valid"],
  ["viable", "adjective", "Decision and Method", "khả thi; có khả năng thành công", "capable of working successfully"],
  ["volatile", "adjective", "Change and Causality", "dễ biến động; không ổn định", "likely to change suddenly"],
  ["warrant", "verb", "Argument and Logic", "biện minh; làm cho hợp lý", "to justify or make reasonable"],
  ["alliance", "noun", "History and Society", "liên minh giữa các nhóm hoặc quốc gia", "a partnership formed for mutual support"],
  ["amendment", "noun", "History and Society", "sự sửa đổi văn bản luật hoặc quy định", "a formal change to a law or document"],
  ["annex", "verb", "History and Society", "sáp nhập lãnh thổ hoặc khu vực", "to add territory or property by taking control"],
  ["autonomy", "noun", "History and Society", "quyền tự trị; khả năng tự quản", "self-government or independent control"],
  ["belligerent", "adjective", "History and Society", "hiếu chiến; có thái độ gây hấn", "hostile or ready to fight"],
  ["bureaucracy", "noun", "History and Society", "bộ máy hành chính nhiều thủ tục", "a system of administration with many rules and offices"],
  ["capitulate", "verb", "History and Society", "đầu hàng hoặc chấp nhận điều kiện", "to surrender or give in"],
  ["colonialism", "noun", "History and Society", "chủ nghĩa thực dân", "control of one region by a distant power"],
  ["concession", "noun", "History and Society", "sự nhượng bộ", "something granted in response to pressure or negotiation"],
  ["constitution", "noun", "History and Society", "hiến pháp; bộ nguyên tắc nền tảng", "a set of basic laws or principles"],
  ["diplomacy", "noun", "History and Society", "ngoại giao; xử lý quan hệ bằng thương lượng", "the management of relations through negotiation"],
  ["dynasty", "noun", "History and Society", "triều đại; dòng họ cai trị", "a sequence of rulers from the same family"],
  ["emancipation", "noun", "History and Society", "sự giải phóng khỏi kiểm soát hoặc áp bức", "the act of freeing from control or oppression"],
  ["federalism", "noun", "History and Society", "chế độ phân quyền giữa trung ương và địa phương", "a system sharing power between national and regional governments"],
  ["hegemony", "noun", "History and Society", "sự bá quyền; ưu thế chi phối", "dominance by one group or state"],
  ["indigenous", "adjective", "History and Society", "bản địa; có nguồn gốc tại nơi đó", "native to a particular place"],
  ["mandate", "noun", "History and Society", "nhiệm vụ hoặc quyền được giao chính thức", "official authority or instruction to act"],
  ["monarchy", "noun", "History and Society", "chế độ quân chủ", "a system ruled by a king or queen"],
  ["nationalism", "noun", "History and Society", "chủ nghĩa dân tộc", "strong identification with one's nation"],
  ["ratify", "verb", "History and Society", "phê chuẩn chính thức", "to formally approve an agreement"],
  ["sovereignty", "noun", "History and Society", "chủ quyền; quyền tự quyết tối cao", "supreme authority or independent control"],
  ["treaty", "noun", "History and Society", "hiệp ước chính thức", "a formal agreement between states or groups"],
  ["tyranny", "noun", "History and Society", "sự cai trị độc đoán, áp bức", "cruel or oppressive rule"],
  ["variable", "math term", "Math - Algebra", "biến số; ký hiệu đại diện cho giá trị thay đổi", "a symbol that represents a changing or unknown value"],
  ["constant", "math term", "Math - Algebra", "hằng số; giá trị không đổi", "a value that does not change"],
  ["equation", "math term", "Math - Algebra", "phương trình có dấu bằng", "a statement that two expressions are equal"],
  ["inequality", "math term", "Math - Algebra", "bất phương trình dùng dấu lớn hơn/nhỏ hơn", "a statement comparing expressions with inequality signs"],
  ["expression", "math term", "Math - Algebra", "biểu thức không nhất thiết có dấu bằng", "a mathematical phrase made of numbers, variables, and operations"],
  ["coefficient", "math term", "Math - Algebra", "hệ số nhân với biến", "a number multiplying a variable"],
  ["solution", "math term", "Math - Algebra", "nghiệm; giá trị làm mệnh đề đúng", "a value that makes an equation or inequality true"],
  ["linear", "math term", "Math - Algebra", "tuyến tính; bậc nhất hoặc tạo đường thẳng", "having a constant rate of change or forming a line"],
  ["slope", "math term", "Math - Algebra", "hệ số góc; độ dốc của đường thẳng", "the rate of vertical change over horizontal change"],
  ["function", "math term", "Math - Algebra", "hàm số; quy tắc gán mỗi đầu vào với một đầu ra", "a rule assigning each input exactly one output"],
  ["integer", "math term", "Math - Algebra", "số nguyên", "a positive or negative whole number, including zero"],
  ["factor", "math term", "Math - Algebra", "thừa số; số hoặc biểu thức nhân với cái khác", "a number or expression multiplied to form a product"],
  ["product", "math term", "Math - Algebra", "tích của phép nhân", "the result of multiplication"],
  ["quotient", "math term", "Math - Algebra", "thương của phép chia", "the result of division"],
  ["polynomial", "math term", "Math - Advanced Math", "đa thức gồm các hạng tử biến và hệ số", "an expression with terms made from variables and coefficients"],
  ["quadratic", "math term", "Math - Advanced Math", "bậc hai; có biến mũ 2 là bậc cao nhất", "involving a squared variable as the highest power"],
  ["vertex", "math term", "Math - Advanced Math", "đỉnh của parabol hoặc góc", "a turning point or corner point"],
  ["absolute value", "math term", "Math - Advanced Math", "giá trị tuyệt đối; khoảng cách tới 0", "distance from zero on a number line"],
  ["parabola", "math term", "Math - Advanced Math", "đồ thị hình parabol của hàm bậc hai", "the U-shaped graph of a quadratic relation"],
  ["radius", "math term", "Math - Geometry", "bán kính", "distance from the center of a circle to its edge"],
  ["diameter", "math term", "Math - Geometry", "đường kính", "a line segment across a circle through the center"],
  ["circumference", "math term", "Math - Geometry", "chu vi đường tròn", "the distance around a circle"],
  ["area", "math term", "Math - Geometry", "diện tích bề mặt", "the amount of surface inside a shape"],
  ["perimeter", "math term", "Math - Geometry", "chu vi hình phẳng", "the distance around a polygon"],
  ["median", "math term", "Math - Data Analysis", "trung vị; giá trị ở giữa", "the middle value in an ordered data set"],
  ["mean", "math term", "Math - Data Analysis", "trung bình cộng", "the average found by adding values and dividing by the count"],
  ["range", "math term", "Math - Data Analysis", "khoảng biến thiên; lớn nhất trừ nhỏ nhất", "the difference between the greatest and least values"],
  ["ratio", "math term", "Math - Data Analysis", "tỉ số so sánh hai đại lượng", "a comparison of two quantities"],
  ["proportion", "math term", "Math - Data Analysis", "tỉ lệ; sự bằng nhau giữa hai tỉ số", "an equation showing two ratios are equal"],
  ["probability", "math term", "Math - Data Analysis", "xác suất xảy ra sự kiện", "the likelihood that an event will occur"],
  ["scatterplot", "math term", "Math - Data Analysis", "biểu đồ phân tán", "a graph showing paired data as points"],
  ["sample", "math term", "Math - Data Analysis", "mẫu dữ liệu được chọn từ tổng thể", "a selected subset of a larger population"],
  ["survey", "math term", "Math - Data Analysis", "khảo sát thu thập dữ liệu", "a method of collecting data by asking questions"],
  ["tangent", "math term", "Math - Geometry", "tiếp tuyến; đường chạm đường tròn tại một điểm", "a line touching a circle at exactly one point"],
  ["sine", "math term", "Math - Geometry", "sin; tỉ số cạnh đối trên cạnh huyền", "in a right triangle, opposite side divided by hypotenuse"],
  ["cosine", "math term", "Math - Geometry", "cos; tỉ số cạnh kề trên cạnh huyền", "in a right triangle, adjacent side divided by hypotenuse"],
]);

const state = normalizeState({});
let questionIndex = SatCore.buildQuestionIndex ? SatCore.buildQuestionIndex(state.questions) : new Map();
let questionIndexSource = state.questions;
let questionIndexSize = state.questions.length;
let questionBankRevision = 0;
let visibleQuestionCache = { key: "", questions: [] };
let reviewedContentRepositoryCache = { key: "", repository: null };
let activeView = "dashboard";
let activeAccountTab = "overview";
let activeStudentDashboardTab = "today";
let activeParentDashboardTab = "plan";
let activeStudentRoadmapTab = "today";
let activeEditingNewsId = "";
let expandedPretestResultId = "";
let activePretestResultTab = "overview";
let activeStudentVocabTab = "today";
let filteredQuestions = [];
let currentIndex = 0;
let selectedAnswer = "";
let dueMode = false;
let pretestSelectedAnswer = "";
let activePracticeSkill = "All";
let localOpenSatLoadPromise = null;
let questionIntegrityReport = null;
let questionIntegrityReportPromise = null;
const questionStudyPolicyManager = SatStudyPolicyEngine.createManager ? SatStudyPolicyEngine.createManager() : null;
let sat2026ReadinessReport = null;
let sat2026ReadinessReportPromise = null;
let reviewedExpertAuditReport = null;
let reviewedExpertAuditReportPromise = null;
let openSatIntegrityBlocklist = new Set();
let localFoundationLoadPromise = null;
let localKaplanAiMathLoadPromise = null;
let localArchiveAiLoadPromise = null;
let localSatKingLoadPromise = null;
let localSat1590LoadPromise = null;
let localPrivateVaultLoadPromise = null;
let localAntigravityLoadPromise = null;
let reviewedStudyBankLoadPromise = null;
let antigravityBankLoaded = false;
let lastPdfInspection = null;
let generatedAiDraft = null;
let activeSourceSignalId = null;
let editingStudyNoteId = null;
let notesReviewOnly = false;
let externalResources = [];
let externalResourceLoadPromise = null;
let archiveRegistry = null;
let archiveRegistryLoadPromise = null;
let activeVaultImportSourceReference = "";
let activeVaultImportSourceName = "";
let vocabCardIndex = 0;
let vocabCardFlipped = false;
let vocabQuiz = null;
let quickVocabSelection = null;
let pretestTimerId = null;
let pretestTimeoutAlertShown = false;
let lastPracticeAttemptId = null;
let latestDuplicateScanReport = null;
let activeEditingAccountId = "";
let activeAdminQuestionId = "";
let practiceSessionMode = "standard";
let practiceSessionQuestionIds = null;
let practiceSessionStartedAt = "";
let practiceSessionDeadlineAt = "";
let practiceSessionSummaryText = "";
let practiceSessionExpired = false;
let activePracticeSessionId = "";
let practiceSessionAttemptIds = [];
let practiceSessionContext = {};
let latestPracticeSessionReport = null;
let practiceTimerId = null;
let practiceQuestionStartedAt = 0;
let practiceActiveQuestionId = "";
let practiceHelpTelemetryByQuestionId = {};
let learnerAnalysisState = null;
let learnerAnalysisTimerId = null;
let activeLessonKey = "";
let storageSaveFailureShown = false;
let indexedDbBankSaveTimer = null;
let indexedDbBankSavePending = null;
let indexedDbBankSaveInFlight = false;
let indexedDbBankSaveSignature = "";
let pendingServerProfileRecord = null;
let learningProfileSyncTimer = null;
let learningProfileSyncInFlight = false;
let pendingLearningProfileSyncReason = "";
const templateStatsCache = new Map();
const skeletonStatsCache = new Map();

function rebuildQuestionIndex() {
  questionIndex = SatCore.buildQuestionIndex ? SatCore.buildQuestionIndex(state.questions) : new Map(state.questions.map((question) => [String(question.id), question]));
  questionIndexSource = state.questions;
  questionIndexSize = state.questions.length;
  visibleQuestionCache = { key: "", questions: [] };
  reviewedContentRepositoryCache = { key: "", repository: null };
  return questionIndex;
}

function touchQuestionBank() {
  questionBankRevision += 1;
  visibleQuestionCache = { key: "", questions: [] };
  reviewedContentRepositoryCache = { key: "", repository: null };
}

function questionBankSaveSignature() {
  return `${questionBankRevision}|${state.questions.length}`;
}

function getQuestionById(questionId) {
  if (questionIndexSource !== state.questions || questionIndexSize !== state.questions.length) {
    rebuildQuestionIndex();
  }
  return SatCore.getQuestionById ? SatCore.getQuestionById(questionIndex, questionId) : questionIndex.get(String(questionId)) || null;
}

const errorTagOptions = [
  { value: "unknown", label: "Not tagged yet" },
  { value: "knowledge_gap", label: "Knowledge gap" },
  { value: "misread_prompt", label: "Misread prompt" },
  { value: "trap_answer", label: "Trap answer" },
  { value: "careless", label: "Careless mistake" },
  { value: "calculation", label: "Calculation error" },
  { value: "time_pressure", label: "Time pressure" },
  { value: "vocab", label: "Vocabulary/context" },
  { value: "evidence", label: "Evidence/reasoning" },
  { value: "slow_correct", label: "Correct but slow" },
  { value: "skipped", label: "Skipped/no answer" },
];

const els = {};

async function bootSatStudio() {
  if (window.SAT_STUDIO_READY || window.SAT_STUDIO_BOOTING) return;
  window.SAT_STUDIO_BOOTING = true;
  try {
    await loadState();
    applyEntryRoleGate();

    cacheElements();
    bindEvents();
    hydrateFilters();
    applyEntryLoginChrome();
    renderAuth();
    window.SAT_STUDIO_READY = true;
    document.body.dataset.satStudioReady = "true";
  } finally {
    window.SAT_STUDIO_BOOTING = false;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootSatStudio, { once: true });
} else {
  bootSatStudio();
}

function emptyProfile() {
  return {
    attempts: [],
    notes: {},
    studyNotes: [],
    externalLinks: {
      khan: "",
      bluebook: "https://bluebook.collegeboard.org/students/practice",
    },
    externalStudyLogs: [],
    bookmarks: [],
    officialLogs: [],
    errorTags: [],
    skillMastery: {},
    lessonProgress: {},
    practiceSessionReports: [],
    learningEvents: [],
    learningEventRevision: "",
    learningEventUpdatedAt: "",
    vocabKnown: [],
    vocabQuizAttempts: [],
    pretests: [],
    roadmap: [],
    roadmapLastBuiltAt: "",
    roadmapBuildReason: "",
    currentPretest: null,
    streak: { count: 0, lastPracticeDate: "" },
    attendance: {
      points: 0,
      daily: {},
      stickers: [],
      questRewardsClaimed: [],
      spentPoints: 0,
      rewardRedemptions: [],
      lastRewardAt: "",
    },
  };
}

function normalizeRewardProgram(program = {}) {
  if (!program || typeof program !== "object") return null;
  const title = String(program.title || "").trim();
  if (!title) return null;
  return {
    id: program.id || `reward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description: String(program.description || "").trim(),
    costPoints: Math.max(1, Number(program.costPoints || program.cost || 1)),
    rewardType: ["privilege", "experience", "gift", "study_bonus"].includes(program.rewardType) ? program.rewardType : "privilege",
    scope: program.scope === "global" ? "global" : "family",
    status: program.status === "paused" ? "paused" : "active",
    ownerAccountId: String(program.ownerAccountId || "").trim() || "content-admin",
    targetStudentIds: Array.isArray(program.targetStudentIds) ? program.targetStudentIds.filter(Boolean) : [],
    createdAt: typeof program.createdAt === "string" ? program.createdAt : new Date().toISOString(),
    updatedAt: typeof program.updatedAt === "string" ? program.updatedAt : "",
  };
}

function mergeRewardPrograms(existing = [], seeds = []) {
  const byId = new Map();
  (Array.isArray(seeds) ? seeds : []).map(normalizeRewardProgram).filter(Boolean).forEach((program) => byId.set(program.id, program));
  (Array.isArray(existing) ? existing : []).map(normalizeRewardProgram).filter(Boolean).forEach((program) => byId.set(program.id, { ...(byId.get(program.id) || {}), ...program }));
  return [...byId.values()];
}

function normalizeNewsPost(post = {}) {
  if (!post || typeof post !== "object") return null;
  const title = String(post.title || "").trim();
  const body = String(post.body || post.message || "").trim();
  if (!title || !body) return null;
  const audience = ["all", "student", "parent", "admin"].includes(post.audience) ? post.audience : "all";
  const status = ["draft", "published", "archived"].includes(post.status) ? post.status : "published";
  const createdAt = typeof post.createdAt === "string" && post.createdAt ? post.createdAt : new Date().toISOString();
  const updatedAt = typeof post.updatedAt === "string" ? post.updatedAt : "";
  return {
    id: post.id || `news-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    body,
    audience,
    status,
    pinned: Boolean(post.pinned),
    createdAt,
    updatedAt,
    publishedAt: typeof post.publishedAt === "string" && post.publishedAt ? post.publishedAt : status === "published" ? createdAt : "",
    createdBy: String(post.createdBy || "content-admin"),
    updatedBy: String(post.updatedBy || ""),
  };
}

function normalizeRewardClaim(claim = {}) {
  if (!claim || typeof claim !== "object" || !claim.programId || !claim.studentId) return null;
  return {
    id: claim.id || `reward-claim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    programId: String(claim.programId),
    studentId: String(claim.studentId),
    requestedBy: String(claim.requestedBy || claim.studentId),
    fulfilledBy: String(claim.fulfilledBy || ""),
    costPoints: Math.max(0, Number(claim.costPoints || 0)),
    status: ["pending", "fulfilled", "cancelled"].includes(claim.status) ? claim.status : "pending",
    requestedAt: typeof claim.requestedAt === "string" ? claim.requestedAt : new Date().toISOString(),
    fulfilledAt: typeof claim.fulfilledAt === "string" ? claim.fulfilledAt : "",
    note: String(claim.note || ""),
  };
}

async function loadState() {
  const raw = readStoredStateJson(STORAGE_KEY) || readStoredStateJson(LEGACY_STORAGE_KEY);
  let loadedData = {};
  if (raw) {
    try {
      loadedData = JSON.parse(raw);
    } catch {
      // Ignored
    }
  }
  
  const loaded = normalizeState(loadedData);
  
  let requiresMigration = false;
  if (window.SatStudioIndexedDB) {
    try {
      const savedBank = await SatStudioIndexedDB.loadBank();
      if (savedBank && savedBank.length > 0) {
        loaded.questions = mergeQuestionBanks(savedBank, loaded.questions);
      } else if (loaded.questions.length > 0 && loaded.questions.some(q => !isFileBackedQuestion(q))) {
        requiresMigration = true;
      }
    } catch (err) {
      console.error("Failed to load question bank from IndexedDB:", err);
    }
  }

  // Mutate the global state object
  Object.assign(state, loaded);
  rebuildQuestionIndex();
  indexedDbBankSaveSignature = questionBankSaveSignature();
  
  if (requiresMigration) {
    console.log("Migrating questions from localStorage to IndexedDB...");
    indexedDbBankSaveSignature = "";
    await saveState({ immediate: true, forceBankSave: true });
  }
}

function normalizeState(input) {
  const accounts = mergeAccounts(Array.isArray(input.accounts) && input.accounts.length ? input.accounts : []);
  const profiles = input.profiles && typeof input.profiles === "object" ? input.profiles : {};
  const questionReviews = input.questionReviews && typeof input.questionReviews === "object" ? input.questionReviews : {};
  const questionGovernance = input.questionGovernance && typeof input.questionGovernance === "object" ? input.questionGovernance : {};
  const questionAudits = input.questionAudits && typeof input.questionAudits === "object" ? input.questionAudits : {};
  const qualityIntake = input.qualityIntake && typeof input.qualityIntake === "object" ? input.qualityIntake : {};
  const sourceSignals = mergeSourceSignals(Array.isArray(input.sourceSignals) ? input.sourceSignals : [], defaultSourceSignals);
  const rewardPrograms = mergeRewardPrograms(Array.isArray(input.rewardPrograms) ? input.rewardPrograms : [], defaultRewardPrograms);
  const rewardClaims = (Array.isArray(input.rewardClaims) ? input.rewardClaims : []).map(normalizeRewardClaim).filter(Boolean);
  const newsPosts = (Array.isArray(input.newsPosts) ? input.newsPosts : []).map(normalizeNewsPost).filter(Boolean);
  const vocab = mergeVocabBanks(Array.isArray(input.vocab) ? input.vocab : [], allSeedVocab());
  const questions = mergeQuestionBanks(
    Array.isArray(input.questions) && input.questions.length ? input.questions : [],
    allSeedQuestions(),
  );
  questions.forEach((question) => applyQuestionGovernance(question, questionReviews, questionGovernance));

  accounts.forEach((account) => {
    profiles[account.id] = normalizeProfileRecord(profiles[account.id]);
  });

  if (Array.isArray(input.attempts) || input.notes || Array.isArray(input.bookmarks) || Array.isArray(input.officialLogs)) {
    profiles["student-demo"] = {
      ...emptyProfile(),
      ...profiles["student-demo"],
      attempts: input.attempts || profiles["student-demo"]?.attempts || [],
      notes: input.notes || profiles["student-demo"]?.notes || {},
      studyNotes: input.studyNotes || profiles["student-demo"]?.studyNotes || [],
      externalLinks: input.externalLinks || profiles["student-demo"]?.externalLinks || emptyProfile().externalLinks,
      externalStudyLogs: input.externalStudyLogs || profiles["student-demo"]?.externalStudyLogs || [],
      bookmarks: input.bookmarks || profiles["student-demo"]?.bookmarks || [],
      officialLogs: input.officialLogs || profiles["student-demo"]?.officialLogs || [],
      vocabKnown: input.vocabKnown || profiles["student-demo"]?.vocabKnown || [],
      vocabQuizAttempts: input.vocabQuizAttempts || profiles["student-demo"]?.vocabQuizAttempts || [],
      learningEvents: input.learningEvents || profiles["student-demo"]?.learningEvents || [],
    };
    profiles["student-demo"] = normalizeProfileRecord(profiles["student-demo"]);
  }

  const activeAccountExists = accounts.some((account) => account.id === input.activeAccountId && (account.status || "active") === "active");

  return {
    version: 2,
    language: input.language === "vi" ? "vi" : "en",
    publicBackend: normalizePublicBackendState(input.publicBackend),
    questions,
    questionReviews,
    questionGovernance,
    questionAudits,
    qualityIntake,
    sourceSignals,
    rewardPrograms,
    rewardClaims,
    newsPosts,
    vocab,
    accounts,
    profiles,
    activeAccountId: activeAccountExists ? input.activeAccountId : null,
  };
}

function normalizePublicBackendState(input = {}) {
  const account = input.account && typeof input.account === "object" ? input.account : null;
  return {
    baseUrl: typeof input.baseUrl === "string" && input.baseUrl.trim() ? input.baseUrl.trim() : "/api/public",
    account,
    lastHealth: input.lastHealth && typeof input.lastHealth === "object" ? input.lastHealth : null,
    lastSyncAt: typeof input.lastSyncAt === "string" ? input.lastSyncAt : "",
    lastServerProgressAt: typeof input.lastServerProgressAt === "string" ? input.lastServerProgressAt : "",
    lastProfileSyncAt: typeof input.lastProfileSyncAt === "string" ? input.lastProfileSyncAt : "",
    lastServerProfileAt: typeof input.lastServerProfileAt === "string" ? input.lastServerProfileAt : "",
    lastServerProfileRevision: Number(input.lastServerProfileRevision || 0),
    lastServerProfileSummary: input.lastServerProfileSummary && typeof input.lastServerProfileSummary === "object" ? input.lastServerProfileSummary : null,
    lastLearningSyncAt: typeof input.lastLearningSyncAt === "string" ? input.lastLearningSyncAt : "",
    lastLearningSyncReason: typeof input.lastLearningSyncReason === "string" ? input.lastLearningSyncReason : "",
    lastLearningSyncMode: ["backend", "local"].includes(input.lastLearningSyncMode) ? input.lastLearningSyncMode : "local",
    lastContentPackageAt: typeof input.lastContentPackageAt === "string" ? input.lastContentPackageAt : "",
    lastContentPackageVersion: typeof input.lastContentPackageVersion === "string" ? input.lastContentPackageVersion : "", lastContentPackageCount: Number(input.lastContentPackageCount || 0),
    lastContentPackageScope: typeof input.lastContentPackageScope === "string" ? input.lastContentPackageScope : "", lastContentPackageSource: typeof input.lastContentPackageSource === "string" ? input.lastContentPackageSource : "",
    pendingServerProfileAt: typeof input.pendingServerProfileAt === "string" ? input.pendingServerProfileAt : "",
    pendingServerProfileRevision: Number(input.pendingServerProfileRevision || 0),
    pendingServerProfileLoadedFor: typeof input.pendingServerProfileLoadedFor === "string" ? input.pendingServerProfileLoadedFor : "",
    pendingServerProfileLocalAccountId: typeof input.pendingServerProfileLocalAccountId === "string" ? input.pendingServerProfileLocalAccountId : "",
    pendingServerProfileSummary: input.pendingServerProfileSummary && typeof input.pendingServerProfileSummary === "object" ? input.pendingServerProfileSummary : null,
    pendingServerProfileDiff: input.pendingServerProfileDiff && typeof input.pendingServerProfileDiff === "object" ? input.pendingServerProfileDiff : null,
    lastMonitoring: input.lastMonitoring && typeof input.lastMonitoring === "object" ? input.lastMonitoring : null,
    lastExportAt: typeof input.lastExportAt === "string" ? input.lastExportAt : "",
    sessionExpiresAt: Number(input.sessionExpiresAt || 0),
    autoSync: input.autoSync !== false,
    statusLevel: ["ok", "warning", "error"].includes(input.statusLevel) ? input.statusLevel : "warning",
    statusTitle: typeof input.statusTitle === "string" ? input.statusTitle : "Backend not checked",
    statusMessage: typeof input.statusMessage === "string" ? input.statusMessage : "Check backend health before syncing progress.",
  };
}

function applyQuestionGovernance(question, reviews = state?.questionReviews, governance = state?.questionGovernance) {
  if (!question?.id) return question;
  const reviewStatus = reviews?.[question.id];
  if (reviewStatus) question.reviewStatus = normalizeReviewStatus(reviewStatus);

  const override = governance?.[question.id];
  if (override && typeof override === "object") {
    if (override.reviewStatus) question.reviewStatus = normalizeReviewStatus(override.reviewStatus);
    if (["private_family", "public_candidate", "admin_only"].includes(override.visibility)) question.visibility = override.visibility;
    if (override.publicationStatus) question.publicationStatus = override.publicationStatus;
    if (override.promotedBy) question.promotedBy = override.promotedBy;
    if (override.promotedAt) question.promotedAt = override.promotedAt;
    if (override.publicReviewNote) question.publicReviewNote = override.publicReviewNote;
    if (override.auditStatus) question.auditStatus = override.auditStatus;
    if (override.auditUpdatedAt) question.auditUpdatedAt = override.auditUpdatedAt;
    if (["core_pool", "remedial_pool", "hidden_duplicate"].includes(override.practicePool)) question.practicePool = override.practicePool;
    if (override.topicGovernance && typeof override.topicGovernance === "object") question.topicGovernance = override.topicGovernance;
    if (override.intakeGate && typeof override.intakeGate === "object") question.intakeGate = override.intakeGate;
    if (override.contentAudit && typeof override.contentAudit === "object") question.contentAudit = override.contentAudit;
  }
  if (SatContentLifecycleEngine.applyLifecycleState) {
    SatContentLifecycleEngine.applyLifecycleState(question);
  }
  return question;
}

function mergeAccounts(existing) {
  if (SatAccountEngine.mergeAccounts) return SatAccountEngine.mergeAccounts(existing, defaultAccounts);
  const byId = new Map();
  defaultAccounts.forEach((account) => byId.set(account.id, account));
  existing.forEach((account) => byId.set(account.id, { ...(byId.get(account.id) || {}), ...account }));
  return [...byId.values()].map((account) => ({
    ...account,
    email: typeof account.email === "string" ? account.email.trim() : "",
    gradeLevel: typeof account.gradeLevel === "string" ? account.gradeLevel.trim() : "",
    avatarInitials: normalizeAvatarInitials(account.avatarInitials, account.name || account.id),
    avatarColor: normalizeAvatarColor(account.avatarColor),
    createdAt: typeof account.createdAt === "string" ? account.createdAt : "",
    scope: account.scope === "public" ? "public" : "family",
    role: ["admin", "parent", "student"].includes(account.role) ? account.role : "student",
    status: ["active", "suspended", "disabled"].includes(account.status) ? account.status : "active",
    parentIds: Array.isArray(account.parentIds) ? account.parentIds.filter(Boolean) : [],
    uiTheme: account.uiTheme === "teen_quest" ? "teen_quest" : "studio",
    permissions: normalizeAccountPermissions(account),
    studyPlan: {
      weeklyTarget: Number(account.studyPlan?.weeklyTarget) || 4,
      nextSessionAt: account.studyPlan?.nextSessionAt || "",
    },
  }));
}

function mergeSourceSignals(existing, seeds = []) {
  const byId = new Map();
  seeds.map(normalizeSourceSignal).filter(Boolean).forEach((signal) => byId.set(signal.id, signal));
  existing.map(normalizeSourceSignal).filter(Boolean).forEach((signal) => byId.set(signal.id, signal));
  return [...byId.values()];
}

function normalizeSourceSignal(signal) {
  if (SatAuthoringEngine.normalizeSourceSignal) return SatAuthoringEngine.normalizeSourceSignal(signal);
  if (!signal || typeof signal !== "object") return null;
  const validDifficulty = ["Easy", "Medium", "Hard"].includes(signal.difficulty) ? signal.difficulty : "Medium";
  return {
    id: signal.id || `signal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceKind: signal.sourceKind || "other",
    sourceReference: signal.sourceReference || "",
    section: signal.section || "Reading and Writing",
    domain: signal.domain || "Imported",
    skill: signal.skill || "Imported",
    difficulty: validDifficulty,
    mistakePattern: signal.mistakePattern || "",
    learningGoal: signal.learningGoal || "",
    risk: signal.risk || sourceKindRisk(signal.sourceKind || "other"),
    visibility: signal.visibility === "admin_only" ? "admin_only" : "private_family",
    protectedTextExcluded: Boolean(signal.protectedTextExcluded),
    createdAt: signal.createdAt || new Date().toISOString(),
    createdBy: signal.createdBy || "unknown",
  };
}

function allSeedQuestions() {
  return [...seedQuestions, ...diagnosticSeedQuestions];
}

function allSeedVocab() {
  return [...seedVocab, ...supplementalVocab];
}

function mergeQuestionBanks(existing, seeds) {
  const byId = new Map();
  seeds.forEach((question) => byId.set(question.id, question));
  existing.forEach((question) => byId.set(question.id, question));
  return [...byId.values()];
}

function mergeVocabBanks(existing, seeds = []) {
  const byWord = new Map();
  seeds.map(normalizeVocabEntry).filter(Boolean).forEach((entry) => byWord.set(vocabKey(entry), entry));
  existing.map(normalizeVocabEntry).filter(Boolean).forEach((entry) => byWord.set(vocabKey(entry), entry));
  return [...byWord.values()].sort((a, b) => a.word.localeCompare(b.word));
}

function normalizeVocabEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const word = String(entry.word || entry.term || "").trim();
  const definitionEn = String(entry.definitionEn || entry.meaningEn || entry.definition || entry.meaning || "").trim();
  const definitionVi = String(entry.definitionVi || entry.meaningVi || entry.vi || "").trim();
  const definition = definitionEn || definitionVi;
  if (!word || !definition) return null;
  const category = String(entry.category || entry.group || "General SAT Words").trim() || "General SAT Words";
  const id = String(entry.id || `vocab-${slugify(word)}`).trim();
  return {
    id,
    word,
    category,
    partOfSpeech: String(entry.partOfSpeech || entry.pos || "").trim(),
    definition,
    definitionEn,
    definitionVi,
    example: String(entry.example || entry.sentence || "").trim(),
    sourceName: String(entry.sourceName || entry.source || "SAT Studio Vocab").trim(),
    sourceReference: String(entry.sourceReference || entry.reference || "").trim(),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function vocabRowsToEntries(rows) {
  const sourceReference = [
    "https://prepedu.com/vi/blog/sat-vocabulary-by-topic",
    "https://etest.edu.vn/tong-hop-400-tu-vung-can-nam-de-thi-tot-sat/",
    "https://blog.prepscholar.com/sat-vocabulary-words",
    "https://www.idp.com/vietnam/blog/vocabularies-for-sat-exam/",
    "https://prepedu.com/vi/blog/sat-math-vocabulary",
  ].join(" | ");
  return rows
    .map(([word, partOfSpeech, category, definitionVi, definitionEn]) =>
      normalizeVocabEntry({
        word,
        partOfSpeech,
        category,
        definitionVi,
        definitionEn,
        sourceName: "SAT Studio curated vocab",
        sourceReference,
      }),
    )
    .filter(Boolean);
}

function vocabKey(entry) {
  return slugify(entry?.word || entry?.id || "");
}

async function saveState(options = {}) {
  const persisted = {
    ...state,
    questions: [], // Save questions via IndexedDB to prevent localStorage overflow
  };
  try {
    writeStoredStateJson(STORAGE_KEY, JSON.stringify(persisted));
    storageSaveFailureShown = false;
  } catch (error) {
    console.error("SAT Studio could not save local state.", error);
    if (!storageSaveFailureShown) {
      storageSaveFailureShown = true;
      alert("SAT Studio could not save all local data. Export your state, then reduce imported private/custom content or move this install to a backend database.");
    }
  }

  return scheduleIndexedDbBankSave(options);
}

function scheduleIndexedDbBankSave(options = {}) {
  if (window.SatStudioIndexedDB) {
    const signature = questionBankSaveSignature();
    if (!options.forceBankSave && signature === indexedDbBankSaveSignature) {
      return Promise.resolve(false);
    }
    indexedDbBankSavePending = {
      questions: state.questions.filter((question) => !isFileBackedQuestion(question)),
      signature,
    };
    if (indexedDbBankSaveTimer) {
      window.clearTimeout(indexedDbBankSaveTimer);
      indexedDbBankSaveTimer = null;
    }
    if (options.immediate) {
      return flushIndexedDbBankSave();
    }
    indexedDbBankSaveTimer = window.setTimeout(() => {
      indexedDbBankSaveTimer = null;
      flushIndexedDbBankSave();
    }, 200);
  }
  return Promise.resolve(false);
}

async function flushIndexedDbBankSave() {
  if (!window.SatStudioIndexedDB || indexedDbBankSaveInFlight || !indexedDbBankSavePending) return false;
  const pending = indexedDbBankSavePending;
  indexedDbBankSavePending = null;
  const snapshot = Array.isArray(pending) ? pending : pending.questions;
  const signature = Array.isArray(pending) ? questionBankSaveSignature() : pending.signature;
  indexedDbBankSaveInFlight = true;
  try {
    await SatStudioIndexedDB.saveBank(snapshot);
    indexedDbBankSaveSignature = signature;
  } catch (err) {
    console.error("Failed to save question bank to IndexedDB:", err);
  } finally {
    indexedDbBankSaveInFlight = false;
    if (indexedDbBankSavePending && !indexedDbBankSaveTimer) {
      indexedDbBankSaveTimer = window.setTimeout(() => {
        indexedDbBankSaveTimer = null;
        flushIndexedDbBankSave();
      }, 0);
    }
  }
  return true;
}

function readStoredStateJson(key) {
  if (SatStorage.readStoredStateJson) return SatStorage.readStoredStateJson(localStorage, key);
  return localStorage.getItem(key);
}

function writeStoredStateJson(key, json) {
  if (SatStorage.writeStoredStateJson) return SatStorage.writeStoredStateJson(localStorage, key, json);
  localStorage.setItem(key, json);
  return { chunked: false, chunks: 0, length: json.length };
}

function isFileBackedQuestion(question) {
  const id = String(question?.id || "");
  const sourceBacked = ["opensat", "foundation", "antigravity", "sat_king", "sat_1590"].includes(question?.sourceType);
  const idBacked =
    id.startsWith("kaplan-ai-math-") ||
    id.startsWith("archive-ai-") ||
    id.startsWith("satking-") ||
    id.startsWith("sat1590-") ||
    id.startsWith("vault-") ||
    id.startsWith("antigravity-");
  return sourceBacked || idBacked;
}

function isPublicPromotedQuestion(question) {
  return question?.visibility === "public_candidate" && String(question?.publicationStatus || "").startsWith("public_candidate");
}

const validAvatarColors = new Set(["teal", "blue", "coral", "amber", "slate"]);

function initialsFromName(value = "") {
  const initials = String(value || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return initials.slice(0, 2) || "S";
}

function normalizeAvatarInitials(value = "", name = "") {
  if (SatAccountEngine.normalizeAvatarInitials) return SatAccountEngine.normalizeAvatarInitials(value, name);
  const clean = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 2);
  return clean || initialsFromName(name);
}

function normalizeAvatarColor(value = "") {
  if (SatAccountEngine.normalizeAvatarColor) return SatAccountEngine.normalizeAvatarColor(value);
  return validAvatarColors.has(value) ? value : "teal";
}

function accountAvatar(account = {}) {
  return {
    initials: normalizeAvatarInitials(account.avatarInitials, account.name || account.id),
    color: normalizeAvatarColor(account.avatarColor),
  };
}

function applyAccountAvatar(node, account = {}) {
  if (!node) return;
  const avatar = accountAvatar(account);
  node.textContent = avatar.initials;
  node.className = `account-avatar avatar-${avatar.color}`;
}

function normalizeAccountPermissions(account = {}) {
  const source = account.permissions && typeof account.permissions === "object" ? account.permissions : {};
  if (account.role === "admin") return { rewardManager: true, questionContributor: true };
  if (account.role === "parent") {
    return {
      rewardManager: source.rewardManager !== false,
      questionContributor: Boolean(source.questionContributor),
    };
  }
  return { rewardManager: false, questionContributor: false };
}

function cacheElements() {
  const ids = [
    "login-screen",
    "login-form",
    "login-account",
    "login-account-help",
    "login-passcode",
    "show-signup",
    "signup-form",
    "signup-name",
    "signup-email",
    "signup-grade",
    "signup-passcode",
    "signup-target",
    "signup-avatar-initials",
    "signup-avatar-color",
    "signup-theme",
    "cancel-signup",
    "app-shell",
    "active-account-avatar",
    "active-account-name",
    "active-account-role",
    "logout-button",
    "sidebar-focus",
    "session-count",
    "accuracy-mini",
    "page-title",
    "page-subtitle",
    "quick-pretest",
    "export-state",
    "import-state",
    "metric-baseline",
    "metric-accuracy",
    "metric-due",
    "metric-questions",
    "metric-needs-review",
    "student-home",
    "student-focus-card",
    "parent-home",
    "parent-home-summary",
    "parent-home-plan",
    "parent-open-accounts",
    "parent-open-official",
    "parent-open-guide",
    "next-action-title",
    "next-action-body",
    "next-action-button",
    "attendance-points",
    "attendance-streak",
    "today-answers",
    "level-progress",
    "reward-level",
    "journey-title",
    "sticker-shelf",
    "daily-quests",
    "student-reward-store",
    "reward-board",
    "khan-profile-link",
    "bluebook-link",
    "save-external-links",
    "open-khan-profile",
    "open-bluebook-link",
    "external-link-status",
    "external-log-source",
    "external-log-minutes",
    "external-log-topic",
    "external-log-note",
    "log-external-study",
    "external-study-list",
    "flow-start-pretest",
    "flow-start-sprint",
    "flow-open-topics",
    "dashboard-weak-skills",
    "dashboard-loop",
    "dashboard-tutor-brain",
    "coach-dashboard-panel",
    "admin-center",
    "news-admin-panel",
    "news-form",
    "news-id",
    "news-title",
    "news-audience",
    "news-status",
    "news-pinned",
    "news-body",
    "news-submit",
    "news-cancel-edit",
    "news-list",
    "start-pretest",
    "start-full-test",
    "start-adaptive-diagnostic",
    "start-rw-module",
    "start-math-module",
    "student-pretest-coach",
    "diagnostic-readiness",
    "pretest-card",
    "pretest-counter",
    "pretest-timer",
    "pretest-time-limit",
    "pretest-skill",
    "pretest-badges",
    "pretest-stem",
    "pretest-options",
    "pretest-submit",
    "pretest-cancel",
    "pretest-results",
    "rebuild-roadmap",
    "roadmap-evaluation",
    "elite-readiness-panel",
    "roadmap-list",
    "mastery-ladder",
    "roadmap-diagnostic-review",
    "skill-matrix",
    "lesson-section",
    "lesson-domain",
    "lesson-stage",
    "lesson-search",
    "lesson-list",
    "lesson-detail",
    "student-topic-coach",
    "topic-section",
    "topic-domain",
    "topic-skill",
    "topic-difficulty",
    "topic-source",
    "topic-session-summary",
    "start-topic-practice",
    "topic-cards",
    "filter-section",
    "filter-domain",
    "filter-difficulty",
    "filter-status",
    "filter-source",
    "student-practice-coach",
    "question-counter",
    "question-skill",
    "question-badges",
    "question-stem",
    "practice-mode-label",
    "practice-session-summary",
    "practice-timer",
    "practice-question-nav",
    "start-five-minute-sprint",
    "start-hard-sprint",
    "start-exam-mode",
    "end-practice-session",
    "mark-review",
    "highlight-selection",
    "clear-highlights",
    "answer-options",
    "attempt-evidence-panel",
    "attempt-evidence-summary",
    "attempt-evidence-hint",
    "attempt-first-move-label",
    "attempt-first-move",
    "attempt-student-work-label",
    "attempt-student-work",
    "attempt-evidence-citation-label",
    "attempt-evidence-citation",
    "submit-answer",
    "next-question",
    "bookmark-question",
    "feedback",
    "question-source",
    "question-license",
    "promote-public",
    "publication-status",
    "question-audit-issue",
    "question-audit-severity",
    "question-audit-note",
    "submit-audit-report",
    "audit-mark-pass",
    "audit-block-question",
    "question-audit-log",
    "mistake-note",
    "save-note",
    "error-type-select",
    "error-tag-note",
    "save-error-tag",
    "error-tag-status",
    "practice-resource-links",
    "pacing-analytics",
    "exam-review-report",
    "note-title",
    "note-section",
    "note-domain",
    "note-skill",
    "note-type",
    "note-priority",
    "note-body",
    "note-tags",
    "note-starred",
    "save-study-note",
    "clear-study-note",
    "notes-search",
    "notes-filter-type",
    "notes-filter-priority",
    "notes-total",
    "notes-starred",
    "notes-due",
    "notes-start-review",
    "student-notes-coach",
    "notes-list",
    "vocab-start-quiz",
    "vocab-next-card",
    "student-vocab-coach",
    "vocab-total",
    "vocab-learning",
    "vocab-known",
    "vocab-accuracy",
    "vocab-category",
    "vocab-search",
    "vocab-hide-known",
    "vocab-flashcard",
    "vocab-prev-card",
    "vocab-flip-card",
    "vocab-mark-known",
    "vocab-word-list",
    "vocab-quiz-card",
    "vocab-quiz-feedback",
    "vocab-submit-quiz",
    "vocab-next-quiz",
    "vocab-add-word",
    "vocab-add-category",
    "vocab-add-pos",
    "vocab-add-definition",
    "vocab-add-example",
    "vocab-add-word-button",
    "vocab-json-import",
    "vocab-import-json-button",
    "vocab-import-result",
    "review-list",
    "start-due-review",
    "start-remediation-queue",
    "bank-file-import",
    "bank-private-vault-mode",
    "bank-import-result",
    "duplicate-scan-scope",
    "run-duplicate-scan",
    "apply-duplicate-policy",
    "duplicate-scan-result",
    "question-admin-search",
    "question-admin-section",
    "question-admin-status",
    "question-admin-source",
    "question-admin-pool",
    "question-admin-workspace",
    "vault-summary",
    "start-vault-practice",
    "pdf-file-check",
    "pdf-import-result",
    "source-ledger",
    "load-archive-registry",
    "archive-registry-summary",
    "archive-registry-list",
    "load-integrity-report",
    "question-integrity-summary",
    "question-integrity-blocked",
    "question-integrity-topics",
    "fetch-opensat",
    "json-import",
    "import-json",
    "official-form",
    "student-official-coach",
    "official-student-field",
    "official-student",
    "official-source",
    "official-section",
    "official-total-score",
    "official-rw-score",
    "official-math-score",
    "official-skill",
    "official-ref",
    "official-result",
    "official-note",
    "official-list",
    "author-form",
    "author-section",
    "author-domain",
    "author-skill",
    "author-difficulty",
    "author-prompt",
    "choice-a",
    "choice-b",
    "choice-c",
    "choice-d",
    "author-answer",
    "author-explanation",
    "signal-source-kind",
    "signal-section",
    "signal-difficulty",
    "signal-domain",
    "signal-skill",
    "signal-reference",
    "signal-mistake-pattern",
    "signal-learning-goal",
    "signal-no-protected-text",
    "save-source-signal",
    "use-latest-signal",
    "load-archive-signals",
    "archive-signal-import-result",
    "source-signal-list",
    "ai-section",
    "ai-domain",
    "ai-skill",
    "ai-difficulty",
    "ai-source-risk",
    "ai-source-reference",
    "ai-generation-brief",
    "generate-ai-draft",
    "save-ai-draft",
    "ai-batch-count",
    "generate-ai-batch",
    "open-guide-from-author",
    "ai-draft-output",
    "account-form",
    "reward-admin-panel",
    "reward-program-form",
    "reward-title",
    "reward-cost",
    "reward-scope",
    "reward-target-student",
    "reward-type",
    "reward-status",
    "reward-description",
    "reward-program-submit",
    "reward-admin-list",
    "account-name",
    "account-email",
    "account-grade",
    "account-avatar-initials",
    "account-avatar-color",
    "account-role",
    "account-scope",
    "account-passcode",
    "account-target",
    "account-theme",
    "account-permission-rewards",
    "account-permission-authoring",
    "account-parent-link",
    "account-weekly-target",
    "account-next-session",
    "account-submit",
    "account-cancel-edit",
    "public-backend-url",
    "public-backend-username",
    "public-backend-password",
    "public-backend-auto-sync",
    "public-backend-health",
    "public-backend-bootstrap",
    "public-backend-login",
    "public-backend-refresh",
    "public-backend-sync-progress",
    "public-backend-sync-profile",
    "public-backend-load-profile",
    "public-backend-apply-profile",
    "public-backend-export",
    "public-backend-monitoring",
    "public-backend-logout",
    "public-backend-status",
    "account-overview",
    "account-list",
  ];

  ids.forEach((id) => {
    els[toCamel(id)] = document.getElementById(id);
  });
}

function t(key) {
  const lang = state.language || "en";
  return translations[lang]?.[key] || translations.en[key] || key;
}

function optionalTranslation(key, fallback) {
  const value = t(key);
  return value === key ? fallback : value;
}

function setLanguage(language) {
  state.language = language === "vi" ? "vi" : "en";
  saveState();
  applyLanguage();
  applyRoleNavigation(currentAccount());
  render();
}

function applyLanguage() {
  document.documentElement.lang = state.language === "vi" ? "vi" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll(".language-option").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === state.language);
  });
  renderActiveAccountRole();
}

function localizeDynamicUiText(root = document.body) {
  if (state.language !== "vi" || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = String(node.nodeValue || "").replace(/\s+/g, " ").trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || shouldSkipDynamicTranslation(parent)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const original = node.nodeValue;
    const translated = translateDynamicUiText(original);
    if (translated !== original) node.nodeValue = translated;
  });
}

function shouldSkipDynamicTranslation(element) {
  return Boolean(
    element.closest(
      [
        ".vocab-panel",
        ".vocab-card",
        ".vocab-word-card",
        ".vocab-flashcard",
        ".question-stem",
        ".passage-pane",
        ".question-pane",
        ".question-options",
        ".option-content",
        ".answer-option .choice-text",
        ".answer-choice",
        ".review-prompt",
        ".review-choice .choice-text",
        ".draft-prompt",
        ".draft-choice-list",
        ".admin-question-preview",
        ".admin-question-choice",
        ".admin-question-explanation",
        ".news-user-content",
        ".rich-explanation",
        ".explanation-block",
        ".code-sample",
        ".technical-json",
        "pre",
        "code",
        "textarea",
        "input",
        "select",
      ].join(", "),
    ),
  );
}

function translateDynamicUiText(value) {
  const raw = String(value || "");
  const leading = raw.match(/^\s*/)?.[0] || "";
  const trailing = raw.match(/\s*$/)?.[0] || "";
  const compact = raw.replace(/\s+/g, " ").trim();
  if (!compact) return raw;
  const exact = dynamicUiViText.get(compact);
  if (exact) return `${leading}${exact}${trailing}`;
  for (const [pattern, replacement] of dynamicUiViPatterns) {
    if (pattern.test(compact)) return `${leading}${compact.replace(pattern, replacement)}${trailing}`;
  }
  return raw;
}

function toCamel(id) {
  return id.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function bindEvents() {
  els.loginForm.addEventListener("submit", login);
  els.showSignup?.addEventListener("click", showSignupForm);
  els.signupForm?.addEventListener("submit", createSignupAccount);
  els.cancelSignup?.addEventListener("click", hideSignupForm);
  document.querySelectorAll(".demo-login-button").forEach((button) => {
    button.addEventListener("click", () => demoLogin(button.dataset.demoAccount, button.dataset.demoPasscode));
  });
  els.logoutButton.addEventListener("click", logout);

  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });
  document.querySelectorAll("[data-account-tab]").forEach((button) => {
    button.addEventListener("click", () => switchAccountTab(button.dataset.accountTab));
  });
  document.querySelectorAll("[data-student-dashboard-tab]").forEach((button) => {
    button.addEventListener("click", () => switchStudentDashboardTab(button.dataset.studentDashboardTab));
  });
  document.querySelectorAll("[data-parent-dashboard-tab]").forEach((button) => {
    button.addEventListener("click", () => switchParentDashboardTab(button.dataset.parentDashboardTab));
  });
  document.querySelectorAll(".language-option").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  els.quickPretest.addEventListener("click", () => {
    switchView("pretest");
    startPretest("preview");
  });
  els.nextActionButton.addEventListener("click", handleNextAction);
  els.saveExternalLinks.addEventListener("click", saveExternalLinks);
  els.logExternalStudy.addEventListener("click", logExternalStudy);
  els.flowStartPretest.addEventListener("click", () => {
    switchView("pretest");
    startPretest("preview");
  });
  els.flowStartSprint.addEventListener("click", () => startFiveMinuteSprint());
  els.flowOpenTopics.addEventListener("click", () => switchView("topics"));
  els.parentOpenAccounts?.addEventListener("click", () => switchView("accounts"));
  els.parentOpenOfficial?.addEventListener("click", () => switchView("official"));
  els.parentOpenGuide?.addEventListener("click", () => switchView("guide"));
  els.parentHomePlan?.addEventListener("click", handleParentPlanAction);
  els.newsForm?.addEventListener("submit", saveNewsPost);
  els.newsCancelEdit?.addEventListener("click", cancelNewsEdit);
  els.newsList?.addEventListener("click", handleNewsListAction);
  els.startPretest.addEventListener("click", () => startPretest("preview"));
  els.startFullTest.addEventListener("click", () => startPretest("full"));
  els.startAdaptiveDiagnostic.addEventListener("click", () => startPretest("adaptive"));
  els.startRwModule.addEventListener("click", () => startPretest("rw_module"));
  els.startMathModule.addEventListener("click", () => startPretest("math_module"));
  document.querySelectorAll("[data-pretest-action]").forEach((button) => {
    button.addEventListener("click", () => handlePretestSpecAction(button.dataset.pretestAction));
  });
  els.pretestResults.addEventListener("click", handlePretestResultsAction);
  els.pretestSubmit.addEventListener("click", submitPretestAnswer);
  els.pretestCancel.addEventListener("click", cancelPretest);
  els.rebuildRoadmap.addEventListener("click", rebuildRoadmapFromData);

  ["topicSection", "topicDomain", "topicSkill", "topicDifficulty", "topicSource"].forEach((key) => {
    els[key].addEventListener("change", () => {
      refreshTopicFilters(key);
      renderTopics();
    });
  });
  els.startTopicPractice.addEventListener("click", startTopicPractice);

  ["lessonSection", "lessonDomain", "lessonStage"].forEach((key) => {
    els[key].addEventListener("change", () => {
      refreshLessonFilters(key);
      renderLessons();
    });
  });
  els.lessonSearch.addEventListener("input", renderLessons);

  ["filterSection", "filterDomain", "filterDifficulty", "filterStatus", "filterSource"].forEach((key) => {
    els[key].addEventListener("change", () => {
      clearPracticeSessionState();
      currentIndex = 0;
      dueMode = false;
      activePracticeSkill = "All";
      selectedAnswer = "";
      render();
    });
  });

  els.submitAnswer.addEventListener("click", submitAnswer);
  els.nextQuestion.addEventListener("click", nextQuestion);
  els.bookmarkQuestion.addEventListener("click", toggleBookmark);
  els.startFiveMinuteSprint.addEventListener("click", () => startFiveMinuteSprint());
  els.startHardSprint.addEventListener("click", () => startHardSprint());
  els.startExamMode.addEventListener("click", () => startExamDrill());
  els.endPracticeSession.addEventListener("click", () => finishPracticeSession("ended_by_user"));
  els.markReview.addEventListener("click", toggleBookmark);
  els.highlightSelection.addEventListener("mousedown", (event) => event.preventDefault());
  els.highlightSelection.addEventListener("click", highlightPracticeSelection);
  els.clearHighlights.addEventListener("click", clearPracticeHighlights);
  els.saveNote.addEventListener("click", saveNote);
  els.promotePublic.addEventListener("click", promoteCurrentQuestionToPublic);
  els.submitAuditReport.addEventListener("click", submitQuestionAuditReport);
  els.auditMarkPass.addEventListener("click", markCurrentQuestionAuditPass);
  els.auditBlockQuestion.addEventListener("click", blockCurrentQuestionFromPublic);
  els.saveErrorTag.addEventListener("click", saveErrorTagForCurrentQuestion);
  els.saveStudyNote.addEventListener("click", saveStudyNote);
  els.clearStudyNote.addEventListener("click", clearStudyNoteForm);
  els.notesStartReview.addEventListener("click", startNotesReview);
  ["notesSearch", "notesFilterType", "notesFilterPriority"].forEach((key) => {
    els[key].addEventListener("input", () => {
      notesReviewOnly = false;
      renderStudyNotes();
    });
    els[key].addEventListener("change", () => {
      notesReviewOnly = false;
      renderStudyNotes();
    });
  });
  ["vocabCategory", "vocabSearch", "vocabHideKnown"].forEach((key) => {
    els[key].addEventListener(key === "vocabSearch" ? "input" : "change", () => {
      vocabCardIndex = 0;
      vocabCardFlipped = false;
      vocabQuiz = null;
      renderVocab();
    });
  });
  els.vocabFlashcard.addEventListener("click", flipVocabCard);
  els.vocabFlashcard.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flipVocabCard();
    }
  });
  els.vocabPrevCard.addEventListener("click", () => moveVocabCard(-1));
  els.vocabNextCard.addEventListener("click", () => moveVocabCard(1));
  els.vocabFlipCard.addEventListener("click", flipVocabCard);
  els.vocabMarkKnown.addEventListener("click", markCurrentVocabKnown);
  els.vocabStartQuiz.addEventListener("click", startVocabQuiz);
  els.vocabSubmitQuiz.addEventListener("click", submitVocabQuiz);
  els.vocabNextQuiz.addEventListener("click", startVocabQuiz);
  els.vocabAddWordButton.addEventListener("click", addVocabWord);
  els.vocabImportJsonButton.addEventListener("click", importVocabJson);
  els.startDueReview.addEventListener("click", startDueReview);
  els.startRemediationQueue.addEventListener("click", startAdaptiveRemediationQueue);
  els.bankFileImport.addEventListener("change", importQuestionBankFile);
  els.runDuplicateScan.addEventListener("click", () => runDuplicateSkeletonScan({ apply: false }));
  els.applyDuplicatePolicy.addEventListener("click", () => runDuplicateSkeletonScan({ apply: true }));
  ["questionAdminSearch", "questionAdminSection", "questionAdminStatus", "questionAdminSource", "questionAdminPool"].forEach((key) => {
    const eventName = key === "questionAdminSearch" ? "input" : "change";
    els[key]?.addEventListener(eventName, () => {
      activeAdminQuestionId = "";
      renderQuestionAdminManager();
    });
  });
  els.questionAdminWorkspace?.addEventListener("click", handleQuestionAdminAction);
  els.startVaultPractice.addEventListener("click", startVaultPractice);
  els.pdfFileCheck.addEventListener("change", inspectPdfFile);
  els.exportState.addEventListener("click", exportState);
  els.importState.addEventListener("change", importStateFile);
  if (els.fetchOpensat) {
    els.fetchOpensat.addEventListener("click", fetchOpenSatQuestions);
  }
  els.loadArchiveRegistry.addEventListener("click", () => ensureArchiveRegistry(true));
  els.loadIntegrityReport.addEventListener("click", () => ensureQuestionIntegrityReport(true));
  els.importJson.addEventListener("click", importJsonQuestions);
  els.officialForm.addEventListener("submit", addOfficialLog);
  els.officialStudent?.addEventListener("change", renderOfficialLogs);
  els.authorForm.addEventListener("submit", addQuestionDraft);
  els.saveSourceSignal.addEventListener("click", saveSourceSignal);
  els.useLatestSignal.addEventListener("click", useLatestSourceSignal);
  els.loadArchiveSignals.addEventListener("click", loadArchiveSignals);
  els.generateAiDraft.addEventListener("click", generateAiQuestionDraft);
  els.saveAiDraft.addEventListener("click", saveAiQuestionDraft);
  els.generateAiBatch.addEventListener("click", generateAiBatchDrafts);
  els.openGuideFromAuthor.addEventListener("click", () => switchView("guide"));
  els.accountForm.addEventListener("submit", addAccount);
  els.rewardProgramForm?.addEventListener("submit", addRewardProgram);
  els.rewardAdminList?.addEventListener("click", handleRewardAdminAction);
  els.studentRewardStore?.addEventListener("click", handleStudentRewardAction);
  els.accountCancelEdit.addEventListener("click", cancelAccountEdit);
  els.accountList.addEventListener("click", handleAccountListAction);
  els.accountRole.addEventListener("change", renderAccountFormAccess);
  els.accountScope.addEventListener("change", renderAccountFormAccess);
  els.publicBackendHealth.addEventListener("click", checkPublicBackendHealth);
  els.publicBackendBootstrap.addEventListener("click", bootstrapPublicBackendAdmin);
  els.publicBackendLogin.addEventListener("click", loginPublicBackend);
  els.publicBackendRefresh.addEventListener("click", refreshPublicBackendSession);
  els.publicBackendSyncProgress.addEventListener("click", syncCurrentProgressToPublicBackend);
  els.publicBackendSyncProfile.addEventListener("click", syncFullProfileToPublicBackend);
  els.publicBackendLoadProfile.addEventListener("click", loadPublicBackendProfileSummary);
  els.publicBackendApplyProfile.addEventListener("click", applyPendingServerProfile);
  els.publicBackendExport.addEventListener("click", exportPublicBackendSnapshot);
  els.publicBackendMonitoring.addEventListener("click", checkPublicBackendMonitoring);
  els.publicBackendLogout.addEventListener("click", logoutPublicBackendSession);
  els.publicBackendUrl.addEventListener("change", () => {
    publicBackendState().baseUrl = els.publicBackendUrl.value.trim() || "/api/public";
    saveState();
    renderPublicBackendPanel();
  });
  els.publicBackendAutoSync.addEventListener("change", () => {
    publicBackendState().autoSync = Boolean(els.publicBackendAutoSync.checked);
    saveState();
    renderPublicBackendPanel();
  });

  document.querySelectorAll(".status-button").forEach((button) => {
    button.addEventListener("click", () => updateQuestionStatus(button.dataset.status));
  });

  bindQuickVocabSelection();
}

function renderAuth() {
  applyEntryRoleGate();
  applyLanguage();
  renderLoginOptions();
  applyEntryLoginChrome();
  const account = currentAccount();
  applyAccountTheme(account);

  if (!account) {
    els.loginScreen.hidden = false;
    els.appShell.hidden = true;
    return;
  }

  els.loginScreen.hidden = true;
  els.appShell.hidden = false;
  activeView = SatRouterEngine.normalizeView ? SatRouterEngine.normalizeView(activeView) : activeView;
  applyRoleNavigation(account);
  if (SatRouterEngine.applyViewDom) SatRouterEngine.applyViewDom(activeView, document);
  applyAccountAvatar(els.activeAccountAvatar, account);
  els.activeAccountName.textContent = account.name;
  renderActiveAccountRole(account);
  render();
  if (account.role === "admin") {
    ensureFoundationBank(true);
    ensureLocalOpenSatBank(true);
    ensureKaplanAiMathBank(true);
    ensureArchiveAiBank(true);
    ensureSatKingBank(true);
    ensureSat1590Bank(true);
    ensurePrivateVaultBank(true);
    ensureAntigravityBank(true);
    ensureExternalResources(true);
  } else if (account.role === "student") {
    ensureReviewedStudyBank(true, { account });
  }
  if (account.role === "admin" && activeView === "admin") {
    ensureQuestionIntegrityReport(true);
    ensureSat2026ReadinessReport(true);
    ensureArchiveRegistry(true);
  }
}

function renderActiveAccountRole(account = currentAccount()) {
  if (!els.activeAccountRole || !account) return;
  const roleLabel =
    state.language === "vi"
      ? { admin: "Admin", parent: "Phụ huynh", student: "Học sinh" }[account.role] || capitalize(account.role)
      : capitalize(account.role);
  const accountLabel = state.language === "vi" ? "tài khoản" : "account";
  const targetLabel = state.language === "vi" ? "mục tiêu" : "target";
  els.activeAccountRole.textContent = `${roleLabel} ${accountLabel} · ${targetLabel} ${account.targetScore || "--"}`;
}

function defaultViewForAccount(account) {
  if (SatRouterEngine.defaultViewForAccount) return SatRouterEngine.defaultViewForAccount(account);
  if (account?.role === "admin") return "admin";
  return "dashboard";
}

function allowedViewsForAccount(account) {
  if (SatRouterEngine.allowedViewsForAccount) {
    return SatRouterEngine.allowedViewsForAccount(account, { canAuthorQuestions: canAuthorQuestions(account) });
  }
  const role = account?.role || "student";
  if (role === "admin") return new Set(["admin", "practice", "sources", "bank", "author", "accounts", "official", "news", "guide"]);
  if (role === "parent") {
    const views = new Set(["dashboard", "accounts", "official", "news", "guide"]);
    if (canAuthorQuestions(account)) views.add("author");
    return views;
  }
  return new Set(["dashboard", "pretest", "roadmap", "lessons", "topics", "practice", "review", "notes", "vocab", "official", "news", "guide"]);
}

const STUDENT_STARTER_VIEWS = new Set(["dashboard", "pretest", "guide"]);

function hasStudentBaseline() {
  return Boolean(latestCompositePretest() || latestPretest());
}

function isStudentStarterMode(account = currentAccount()) {
  return account?.role === "student" && !hasStudentBaseline();
}

function allowedViewsForCurrentStudentState(account = currentAccount()) {
  const allowed = allowedViewsForAccount(account);
  if (!isStudentStarterMode(account)) return allowed;
  return new Set([...allowed].filter((view) => STUDENT_STARTER_VIEWS.has(view)));
}

function applyRoleNavigation(account = currentAccount()) {
  let allowed = allowedViewsForCurrentStudentState(account);
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.hidden = !allowed.has(tab.dataset.view);
    if (tab.dataset.view === "dashboard") {
      const parentLabel = SatRouterEngine.parentDashboardLabel
        ? SatRouterEngine.parentDashboardLabel(state.language)
        : state.language === "vi"
          ? "Ph\u1ee5 huynh"
          : "Parent Coach";
      tab.textContent = account?.role === "parent" ? parentLabel : t("navDashboard");
    }
  });
  applyStudentNavigationGroups(account);
  if (!allowed.has(activeView)) activeView = defaultViewForAccount(account);
  if (els.quickPretest) els.quickPretest.hidden = account?.role === "admin" || account?.role === "parent";
  const student = account?.role === "student";
  if (els.exportState) els.exportState.hidden = student;
  const importButton = els.importState?.closest(".file-button");
  if (importButton) importButton.hidden = student;
}

function applyStudentNavigationGroups(account = currentAccount()) {
  const nav = document.querySelector(".nav-tabs");
  if (!nav) return;
  nav.querySelectorAll(".nav-group-label").forEach((node) => node.remove());
  const buttons = new Map([...nav.querySelectorAll(".nav-tab")].map((button) => [button.dataset.view, button]));
  const defaultOrder = SatRouterEngine.navOrderForRole ? SatRouterEngine.navOrderForRole(account?.role || "student") : ["dashboard", "admin", "pretest", "roadmap", "lessons", "topics", "practice", "review", "notes", "vocab", "bank", "sources", "official", "author", "accounts", "news", "guide"];
  if (account?.role !== "student") {
    defaultOrder.forEach((view) => {
      const button = buttons.get(view);
      if (button) {
        const parentLabel = SatRouterEngine.parentDashboardLabel
          ? SatRouterEngine.parentDashboardLabel(state.language)
          : state.language === "vi"
            ? "Ph\u1ee5 huynh"
            : "Parent Coach";
        button.textContent = view === "dashboard" && account?.role === "parent" ? parentLabel : button.dataset.i18n ? t(button.dataset.i18n) : button.textContent;
        nav.appendChild(button);
      }
    });
    return;
  }
  const vi = state.language === "vi";
  const dueCount = getDueQuestionIds().length;
  const notesDue = (profile().studyNotes || []).filter((note) => note.starred || new Date(note.dueAt || note.updatedAt || note.createdAt).getTime() <= Date.now()).length;
  const hasBaseline = Boolean(latestCompositePretest() || latestPretest());
  const labels = SatRouterEngine.studentNavLabels
    ? SatRouterEngine.studentNavLabels(state.language)
    : {
        dashboard: vi ? "Hôm nay" : "Today",
        roadmap: vi ? "Lộ trình" : "Roadmap",
        lessons: vi ? "Bài học" : "Lessons",
        topics: vi ? "Chuyên đề" : "Topics",
        pretest: vi ? "Kiểm tra đầu vào" : "Pretest",
        practice: vi ? "Luyện tập" : "Practice",
        review: vi ? "Ôn lỗi sai" : "Mistake review",
        notes: vi ? "Ghi chú" : "Notes",
        vocab: vi ? "Từ vựng" : "Vocab",
    official: vi ? "Log b\u00e0i ch\u00ednh th\u1ee9c" : "Official log",
        news: vi ? "Tin tức" : "News",
        guide: vi ? "Hướng dẫn" : "Guide",
      };
  const badges = SatRouterEngine.studentNavBadges
    ? SatRouterEngine.studentNavBadges({ language: state.language, hasBaseline, dueCount, notesDue })
    : {
        pretest: hasBaseline ? "" : vi ? "20 câu" : "20 q",
        review: dueCount ? String(dueCount) : "",
        lessons: hasBaseline ? (vi ? "1 bài" : "1 lesson") : "",
        notes: notesDue ? String(notesDue) : "",
      };
  const groups = SatRouterEngine.studentNavGroups
    ? SatRouterEngine.studentNavGroups(state.language)
    : [
        { label: vi ? "Hôm nay" : "Today", views: ["dashboard", "roadmap"] },
        { label: vi ? "Học" : "Learn", views: ["lessons", "topics"] },
        { label: vi ? "Luyện" : "Practice", views: ["pretest", "practice", "review"] },
        { label: vi ? "Công cụ" : "Tools", views: ["notes", "vocab", "official", "news", "guide"] },
      ];
  groups.forEach((group) => {
    const visibleViews = group.views.filter((view) => {
      const button = buttons.get(view);
      return button && !button.hidden;
    });
    if (!visibleViews.length) return;
    const label = document.createElement("div");
    label.className = "nav-group-label";
    label.textContent = group.label;
    nav.appendChild(label);
    visibleViews.forEach((view) => {
      const button = buttons.get(view);
      if (!button) return;
      button.innerHTML = `<span class="nav-tab-content"><span>${escapeHtml(labels[view] || button.textContent)}</span>${badges[view] ? `<em class="nav-badge">${escapeHtml(badges[view])}</em>` : ""}</span>`;
      nav.appendChild(button);
    });
  });
}

function applyAccountTheme(account = currentAccount()) {
  const theme = account?.uiTheme === "teen_quest" ? "teen_quest" : "studio";
  document.body.dataset.theme = theme;
  document.body.dataset.role = account?.role || "guest";
}

function renderLoginOptions() {
  if (!els.loginAccount) return;
  const current = els.loginAccount.value;
  if (!Array.isArray(state.accounts) || !state.accounts.length) {
    state.accounts = mergeAccounts([]);
  }
  const accounts = entryVisibleAccounts();
  els.loginAccount.innerHTML = accounts
    .map((account) => {
      const status = account.status || "active";
      const statusText = status === "active" ? "" : ` - ${labelFor(status)}`;
      return `<option value="${account.id}">${escapeHtml(account.name)} - ${escapeHtml(account.role)}${escapeHtml(statusText)}</option>`;
    })
    .join("");
  els.loginAccount.insertAdjacentHTML("afterbegin", '<option value="">Choose an account...</option>');
  els.loginAccount.value = accounts.some((account) => account.id === current) ? current : "";
}

function login(event) {
  event.preventDefault();
  const selectedAccountId = els.loginAccount.value;
  const passcode = els.loginPasscode.value;
  const accounts = entryVisibleAccounts();
  let account = accounts.find((item) => item.id === selectedAccountId);
  if (!account && passcode) {
    const passcodeMatches = accounts.filter((item) => item.passcode === passcode);
    if (passcodeMatches.length === 1) {
      account = passcodeMatches[0];
      els.loginAccount.value = account.id;
    }
  }
  if (!account || account.passcode !== els.loginPasscode.value) {
    alert("Choose an account from the list, click a demo shortcut, or enter one of the demo passcodes.");
    return;
  }
  if ((account.status || "active") !== "active") {
    alert("This account is locked. Ask the Content Admin to activate it before signing in.");
    return;
  }
  if (!accountAllowedByEntry(account)) {
    alert("This entry point is restricted to a different account role.");
    return;
  }
  state.activeAccountId = account.id;
  activeView = defaultViewForAccount(account);
  els.loginPasscode.value = "";
  saveState();
  renderAuth();
}

function demoLogin(accountId, passcode) {
  if (!els.loginAccount || !els.loginPasscode || !els.loginForm) return;
  renderLoginOptions();
  els.loginAccount.value = accountId || "";
  els.loginPasscode.value = passcode || "";
  if (typeof els.loginForm.requestSubmit === "function") {
    els.loginForm.requestSubmit();
  } else {
    els.loginForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  }
}

function showSignupForm() {
  if (els.signupForm) els.signupForm.hidden = false;
  els.signupName?.focus();
}

function hideSignupForm() {
  if (els.signupForm) els.signupForm.hidden = true;
  els.signupForm?.reset();
  if (els.signupTarget) els.signupTarget.value = 1450;
  if (els.signupAvatarColor) els.signupAvatarColor.value = "coral";
  if (els.signupTheme) els.signupTheme.value = "teen_quest";
}

function isPasscodeInUse(passcode = "", excludeId = "") {
  const clean = String(passcode || "").trim();
  if (!clean) return false;
  return state.accounts.some((account) => account.id !== excludeId && String(account.passcode || "") === clean);
}

function createSignupAccount(event) {
  event.preventDefault();
  const name = els.signupName?.value.trim() || "";
  const passcode = els.signupPasscode?.value.trim() || "";
  if (!name || !passcode) {
    alert("Name and passcode are required.");
    return;
  }
  if (isPasscodeInUse(passcode)) {
    alert("That passcode is already used by another local account. Choose a different passcode.");
    return;
  }

  const nowMs = Date.now();
  const account = SatAccountEngine.normalizeAccount
    ? SatAccountEngine.normalizeAccount({
        id: `account-${slugify(name)}-${nowMs}`,
        name,
        email: els.signupEmail?.value || "",
        gradeLevel: els.signupGrade?.value || "",
        avatarInitials: els.signupAvatarInitials?.value || normalizeAvatarInitials("", name),
        avatarColor: els.signupAvatarColor?.value || "coral",
        role: "student",
        scope: "public",
        status: "active",
        passcode,
        targetScore: Number(els.signupTarget?.value) || 1450,
        uiTheme: els.signupTheme?.value === "studio" ? "studio" : "teen_quest",
        parentIds: [],
        createdAt: new Date(nowMs).toISOString(),
        studyPlan: { weeklyTarget: 4, nextSessionAt: "" },
      })
    : {
        id: `account-${slugify(name)}-${nowMs}`,
        name,
        email: els.signupEmail?.value.trim() || "",
        gradeLevel: els.signupGrade?.value || "",
        avatarInitials: normalizeAvatarInitials(els.signupAvatarInitials?.value, name),
        avatarColor: normalizeAvatarColor(els.signupAvatarColor?.value || "coral"),
        role: "student",
        scope: "public",
        status: "active",
        passcode,
        targetScore: Number(els.signupTarget?.value) || 1450,
        uiTheme: els.signupTheme?.value === "studio" ? "studio" : "teen_quest",
        parentIds: [],
        createdAt: new Date(nowMs).toISOString(),
        studyPlan: { weeklyTarget: 4, nextSessionAt: "" },
      };

  state.accounts.push(account);
  state.profiles[account.id] = emptyProfile();
  state.activeAccountId = account.id;
  activeView = defaultViewForAccount(account);
  hideSignupForm();
  saveState();
  renderLoginOptions();
  renderAuth();
}

function logout() {
  state.activeAccountId = null;
  saveState();
  renderAuth();
}

function currentAccount() {
  if (SatAccountEngine.currentAccount) return SatAccountEngine.currentAccount(state.accounts, state.activeAccountId);
  return state.accounts.find((account) => account.id === state.activeAccountId) || null;
}

function profile() {
  const account = currentAccount();
  if (!account) return emptyProfile();
  if (SatAccountEngine.ensureAccountProfile) return SatAccountEngine.ensureAccountProfile(state.profiles, account.id, emptyProfile);
  return state.profiles[account.id] || emptyProfile();
}

function entryRoleConfig() {
  const config =
    window.SAT_STUDIO_ENTRY_CONFIG ||
    (SatEntryEngine.entryConfigFromLocation ? SatEntryEngine.entryConfigFromLocation(window.location) : null);
  if (!config?.role) return null;
  const allowedRoles = Array.isArray(config.allowedRoles) && config.allowedRoles.length ? config.allowedRoles : [config.role];
  return { ...config, allowedRoles };
}

function accountAllowedByEntry(account, config = entryRoleConfig()) {
  if (!config || !account) return true;
  return config.allowedRoles.includes(account.role);
}

function entryVisibleAccounts(config = entryRoleConfig()) {
  const accounts = Array.isArray(state.accounts) ? state.accounts : [];
  if (!config) return accounts;
  return accounts.filter((account) => accountAllowedByEntry(account, config));
}

function applyEntryRoleGate() {
  const config = entryRoleConfig();
  if (!config) return;
  if (document?.documentElement) {
    document.documentElement.dataset.satEntryRole = config.role;
    document.documentElement.dataset.satEntryBundle = config.bundle || config.role;
  }
  document.body?.setAttribute("data-entry-role", config.role);
  document.body?.setAttribute("data-entry-bundle", config.bundle || config.role);
  const account = currentAccount();
  if (account && accountAllowedByEntry(account, config)) return;
  state.activeAccountId = null;
  activeView = config.defaultView || "dashboard";
}

function applyEntryLoginChrome(config = entryRoleConfig()) {
  if (!config) return;
  document.querySelectorAll(".demo-login-button").forEach((button) => {
    const account = state.accounts.find((item) => item.id === button.dataset.demoAccount);
    button.hidden = !accountAllowedByEntry(account, config);
  });
  if (els.loginAccountHelp) {
    const labels = {
      student: state.language === "vi" ? "Chỉ hiển thị tài khoản học sinh cho entry này." : "This entry only shows student accounts.",
      parent: state.language === "vi" ? "Chỉ hiển thị tài khoản phụ huynh cho entry này." : "This entry only shows parent accounts.",
      admin: state.language === "vi" ? "Chỉ hiển thị tài khoản admin cho entry này." : "This entry only shows admin accounts.",
    };
    els.loginAccountHelp.textContent = labels[config.role] || els.loginAccountHelp.textContent;
  }
}

function runtimeRoleProfile(account = currentAccount()) {
  return SatRoleBoundaryEngine.runtimeProfileForAccount
    ? SatRoleBoundaryEngine.runtimeProfileForAccount(account)
    : { role: account?.role || "student", bundle: account?.role === "admin" ? "content_admin" : account?.role === "parent" ? "family" : "learner" };
}

function roleQuestionForDisplay(question, account = currentAccount()) {
  return SatRoleBoundaryEngine.roleQuestionForDisplay ? SatRoleBoundaryEngine.roleQuestionForDisplay(question, account) : question;
}

function roleScopedQuestionBank(questions, account = currentAccount()) {
  return SatRoleBoundaryEngine.filterQuestionsForRole
    ? SatRoleBoundaryEngine.filterQuestionsForRole(questions, account)
    : questions;
}

function learnerAnalysisCopy(kind = "roadmap") {
  const vi = state.language === "vi";
  const copy = {
    pretest: vi
      ? { eyebrow: "Đang phân tích", title: "Đang xây lộ trình từ bài đầu vào", lines: ["Chấm từng câu và nhóm lỗi yếu.", "Ước lượng mức nền hiện tại.", "Chọn kỹ năng ưu tiên cho buổi học tiếp theo."] }
      : { eyebrow: "Analyzing", title: "Building your roadmap from the pretest", lines: ["Scoring each item and weak pattern.", "Estimating your current baseline.", "Choosing the next priority skills."] },
    pretest_timeout: vi
      ? { eyebrow: "Đang phân tích", title: "Đang xử lý bài hết giờ", lines: ["Ghi nhận câu chưa trả lời.", "Tách lỗi kiến thức và lỗi thời gian.", "Cập nhật lộ trình luyện tiếp."] }
      : { eyebrow: "Analyzing", title: "Processing the timed test", lines: ["Recording unanswered items.", "Separating knowledge gaps from pacing issues.", "Updating the next study path."] },
    roadmap: vi
      ? { eyebrow: "Cá nhân hóa", title: "Đang cập nhật lộ trình học", lines: ["Đọc lại kết quả gần nhất.", "Sắp xếp kỹ năng theo ROI học tập.", "Chuẩn bị bước học kế tiếp."] }
      : { eyebrow: "Personalizing", title: "Updating your study roadmap", lines: ["Reading the latest evidence.", "Ranking skills by study ROI.", "Preparing the next learning step."] },
    practice_review: vi
      ? { eyebrow: "Đang kiểm tra", title: "Đang tìm quy tắc và bẫy cần ôn", lines: ["So sánh đáp án với lời giải.", "Tìm lỗi dễ lặp lại.", "Chuẩn bị phần ôn ngắn trước khi làm tiếp."] }
      : { eyebrow: "Checking", title: "Finding the rule and trap to review", lines: ["Comparing your answer with the solution.", "Detecting repeatable mistakes.", "Preparing a short review before the next item."] },
    practice_correct: vi
      ? { eyebrow: "Đang kiểm tra", title: "Đang xác nhận câu trả lời", lines: ["Đối chiếu đáp án.", "Kiểm tra tốc độ làm bài.", "Cập nhật tiến độ kỹ năng."] }
      : { eyebrow: "Checking", title: "Confirming the answer", lines: ["Matching the answer.", "Checking pacing.", "Updating skill progress."] },
  };
  return copy[kind] || copy.roadmap;
}

function renderLearnerAnalysisPanel(kind = "roadmap") {
  const copy = learnerAnalysisCopy(kind);
  return SatDesignSystem.loadingPanel
    ? SatDesignSystem.loadingPanel(copy)
    : `<section class="ds-loading-panel" aria-live="polite"><div class="ds-loading-spinner"></div><div><p class="eyebrow">${escapeHtml(copy.eyebrow)}</p><h3>${escapeHtml(copy.title)}</h3><div class="ds-loading-lines">${copy.lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</div></div></section>`;
}

function clearLearnerAnalysis() {
  if (learnerAnalysisTimerId) window.clearTimeout(learnerAnalysisTimerId);
  learnerAnalysisTimerId = null;
  learnerAnalysisState = null;
  if (activeView === "roadmap") {
    renderRoadmap();
    applyDynamicVisualState();
  }
}

function startLearnerAnalysis(kind = "roadmap", duration = 1200) {
  if (currentAccount()?.role !== "student") return;
  if (learnerAnalysisTimerId) window.clearTimeout(learnerAnalysisTimerId);
  learnerAnalysisState = { kind, startedAt: Date.now() };
  learnerAnalysisTimerId = window.setTimeout(clearLearnerAnalysis, Math.max(300, Number(duration) || 1200));
}

function isContentAdmin() {
  return SatPermissions.isContentAdmin ? SatPermissions.isContentAdmin(currentAccount()) : currentAccount()?.role === "admin";
}

function isAccountManager() {
  if (SatPermissions.isAccountManager) return SatPermissions.isAccountManager(currentAccount());
  const role = currentAccount()?.role;
  return role === "admin" || role === "parent";
}

function canCreateAnyAccount() {
  return SatPermissions.canCreateAnyAccount ? SatPermissions.canCreateAnyAccount(currentAccount()) : currentAccount()?.role === "admin";
}

function canManageRewards(account = currentAccount()) {
  return SatPermissions.canManageRewards ? SatPermissions.canManageRewards(account) : account?.role === "admin" || (account?.role === "parent" && account.permissions?.rewardManager !== false);
}

function canAuthorQuestions(account = currentAccount()) {
  return SatPermissions.canAuthorQuestions ? SatPermissions.canAuthorQuestions(account) : account?.role === "admin" || (account?.role === "parent" && Boolean(account.permissions?.questionContributor));
}

function isFamilyAccount(account = currentAccount()) {
  return SatPermissions.isFamilyAccount ? SatPermissions.isFamilyAccount(account) : account?.scope !== "public";
}

function canAccessPrivateContent(account = currentAccount()) {
  return SatPermissions.canAccessPrivateContent ? SatPermissions.canAccessPrivateContent(account) : Boolean(account && isFamilyAccount(account));
}

function isQuestionVisible(question, account = currentAccount()) {
  if (SatPermissions.isQuestionVisible) return SatPermissions.isQuestionVisible(question, account);
  if (!question) return false;
  if (question.visibility === "private_family") return canAccessPrivateContent(account);
  if (question.visibility === "admin_only") return ["admin", "parent"].includes(account?.role);
  return true;
}

function canViewSourceSignal(signal, account = currentAccount()) {
  if (SatPermissions.canViewSourceSignal) return SatPermissions.canViewSourceSignal(signal, account);
  if (!signal || !canAccessPrivateContent(account)) return false;
  if (signal.visibility === "admin_only") return account?.role === "admin";
  if (account?.role === "parent") return !signal.createdBy || signal.createdBy === account.id;
  return true;
}

function visibleQuestionBank() {
  const account = currentAccount();
  const roleProfile = runtimeRoleProfile(account);
  const cacheKey = `${account?.id || "anon"}|${roleProfile.bundle}|${questionBankRevision}|${state.questions.length}`;
  if (visibleQuestionCache.key === cacheKey) return visibleQuestionCache.questions;
  const questions = SatQuestionQueryEngine.visibleQuestionBank
    ? SatQuestionQueryEngine.visibleQuestionBank(state.questions, account, { isQuestionVisible })
    : SatPermissions.visibleQuestionBank
      ? SatPermissions.visibleQuestionBank(state.questions, account)
      : state.questions.filter((question) => isQuestionVisible(question, account));
  const scopedQuestions = roleScopedQuestionBank(questions, account);
  const contentQuestions =
    account?.role === "student" && SatQuestionQueryEngine.reviewedStudyQuestions
      ? SatQuestionQueryEngine.reviewedStudyQuestions(scopedQuestions, { predicate: isStudyAvailableQuestion })
      : scopedQuestions;
  visibleQuestionCache = { key: cacheKey, questions: contentQuestions };
  return contentQuestions;
}

function reviewedStudyContentRepository(criteria = {}) {
  const questions = visibleQuestionBank().filter(isStudyAvailableQuestion);
  const account = currentAccount();
  const cacheKey = `${account?.id || "anon"}|${questionBankRevision}|${questions.length}|${questionBankSaveSignature()}`;
  if (reviewedContentRepositoryCache.key === cacheKey && reviewedContentRepositoryCache.repository) {
    return reviewedContentRepositoryCache.repository;
  }
  const repository = SatQuestionQueryEngine.createReviewedContentRepository
    ? SatQuestionQueryEngine.createReviewedContentRepository(questions, {
        predicate: isStudyAvailableQuestion,
        revision: questionBankRevision,
        generatedAt: new Date().toISOString(),
      })
    : null;
  if (!repository) {
    const items = questions.filter((question) => question.reviewStatus === "reviewed");
    const fallbackRepository = {
      version: "reviewed-content-repository-fallback",
      manifest: { total: items.length, revision: questionBankRevision, contentVersion: questionBankSaveSignature() },
      questions: items,
      query: () => ({ items, total: items.length, criteria }),
      topicCards: () => [],
      package: () => ({ items, manifest: { total: items.length } }),
    };
    reviewedContentRepositoryCache = { key: cacheKey, repository: fallbackRepository };
    return fallbackRepository;
  }
  reviewedContentRepositoryCache = { key: cacheKey, repository };
  return repository;
}

function accountProfile(accountId) {
  if (SatAccountEngine.ensureAccountProfile) return SatAccountEngine.ensureAccountProfile(state.profiles, accountId, emptyProfile);
  if (!state.profiles[accountId]) state.profiles[accountId] = emptyProfile();
  return state.profiles[accountId];
}

function linkedStudentAccountsFor(account = currentAccount()) {
  if (SatAccountEngine.linkedStudentAccountsFor) return SatAccountEngine.linkedStudentAccountsFor(state.accounts, account);
  if (SatPermissions.linkedStudentAccountsFor) return SatPermissions.linkedStudentAccountsFor(state.accounts, account);
  if (!account) return [];
  const students = state.accounts.filter((item) => item.role === "student");
  if (account.role === "admin") return students;
  if (account.role === "parent") {
    return students.filter((student) => Array.isArray(student.parentIds) && student.parentIds.includes(account.id));
  }
  return students.filter((student) => student.id === account.id);
}

function switchView(view) {
  const normalizedView = SatRouterEngine.normalizeView ? SatRouterEngine.normalizeView(view) : view;
  activeView = normalizedView;
  applyRoleNavigation(currentAccount());
  if (SatRouterEngine.applyViewDom) {
    SatRouterEngine.applyViewDom(activeView, document);
  } else {
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.view === activeView);
    });
    document.querySelectorAll(".view").forEach((viewNode) => {
      viewNode.classList.toggle("active", viewNode.id === `view-${activeView}`);
    });
  }
  render();
  const basePreloadPlan = SatRouterEngine.buildViewPreloadPlan
    ? SatRouterEngine.buildViewPreloadPlan(activeView)
    : {
        banks: ["topics", "lessons", "sources", "practice", "pretest", "bank"].includes(activeView),
        archiveRegistry: activeView === "sources",
        questionIntegrityReport: activeView === "sources",
        externalResources: ["dashboard", "roadmap", "lessons", "topics", "practice"].includes(activeView),
      };
  const preloadPlan = SatRoleBoundaryEngine.buildRolePreloadPlan
    ? SatRoleBoundaryEngine.buildRolePreloadPlan(activeView, currentAccount(), basePreloadPlan)
    : basePreloadPlan;
  if (preloadPlan.banks) {
    const studentLiteBankView = currentAccount()?.role === "student" && ["pretest", "lessons", "topics", "practice"].includes(activeView);
    if (studentLiteBankView) {
      ensureQuestionStudyPolicy();
      ensureReviewedStudyBank(true);
    } else {
      ensureFoundationBank(true);
      ensureLocalOpenSatBank(true);
      ensureKaplanAiMathBank(true);
      ensureArchiveAiBank(true);
      ensureSatKingBank(true);
      ensureSat1590Bank(true);
      ensurePrivateVaultBank(true);
      ensureAntigravityBank(true);
    }
  }
  if (preloadPlan.archiveRegistry) {
    ensureArchiveRegistry(true);
  }
  if (preloadPlan.questionIntegrityReport) {
    ensureQuestionIntegrityReport(true);
  }
  if (preloadPlan.reviewedExpertAuditReport !== false && activeView === "admin") {
    ensureSat2026ReadinessReport(true);
    ensureReviewedExpertAuditReport(true);
  }
  const skipStudentExternalPreload =
    currentAccount()?.role === "student" && ["dashboard", "roadmap"].includes(activeView);
  if (preloadPlan.externalResources && !skipStudentExternalPreload) {
    ensureExternalResources(true);
  }
}

function setSubviewTabState({ tabSelector, panelSelector, activeValue, tabDatasetKey, panelDatasetKey }) {
  document.querySelectorAll(tabSelector).forEach((button) => {
    const selected = button.dataset[tabDatasetKey] === activeValue;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  document.querySelectorAll(panelSelector).forEach((panel) => {
    panel.hidden = panel.dataset[panelDatasetKey] !== activeValue;
  });
}

function switchAccountTab(tab = activeAccountTab) {
  const valid = new Set(["overview", "list", "form", "rewards", "backend"]);
  activeAccountTab = valid.has(tab) ? tab : "overview";
  setSubviewTabState({
    tabSelector: "[data-account-tab]",
    panelSelector: "[data-account-panel]",
    activeValue: activeAccountTab,
    tabDatasetKey: "accountTab",
    panelDatasetKey: "accountPanel",
  });
}

function switchStudentDashboardTab(tab = activeStudentDashboardTab) {
  const valid = new Set(["today", "rewards", "skills", "tools"]);
  activeStudentDashboardTab = valid.has(tab) ? tab : "today";
  setSubviewTabState({
    tabSelector: "[data-student-dashboard-tab]",
    panelSelector: "[data-student-dashboard-panel]",
    activeValue: activeStudentDashboardTab,
    tabDatasetKey: "studentDashboardTab",
    panelDatasetKey: "studentDashboardPanel",
  });
  applyStudentDashboardBaselineVisibility();
}

function applyStudentDashboardBaselineVisibility(hasBaseline = Boolean(latestPretest() || latestCompositePretest())) {
  if (!els.studentHome || currentAccount()?.role !== "student") return;
  const noBaseline = !hasBaseline;
  els.studentHome.classList.toggle("student-home-onboarding", noBaseline);
  document.querySelectorAll("[data-student-dashboard-tab]").forEach((button) => {
    const key = button.dataset.studentDashboardTab || "";
    button.hidden = noBaseline && key !== "today";
  });
  if (!noBaseline) return;
  [els.dailyQuests, els.dashboardLoop].forEach((node) => {
    const panel = node?.closest("[data-student-dashboard-panel]");
    if (panel) panel.hidden = true;
  });
}

function switchParentDashboardTab(tab = activeParentDashboardTab) {
  const valid = new Set(["plan", "students"]);
  activeParentDashboardTab = valid.has(tab) ? tab : "plan";
  setSubviewTabState({
    tabSelector: "[data-parent-dashboard-tab]",
    panelSelector: "[data-parent-dashboard-panel]",
    activeValue: activeParentDashboardTab,
    tabDatasetKey: "parentDashboardTab",
    panelDatasetKey: "parentDashboardPanel",
  });
}

function handleParentPlanAction(event) {
  const button = event.target.closest("[data-parent-action]");
  if (!button) return;
  const action = button.dataset.parentAction || "";
  if (action === "student-detail") {
    switchView("dashboard");
    switchParentDashboardTab("students");
    localizeDynamicUiText(els.parentHome);
    return;
  }
  if (action === "accounts") {
    switchView("accounts");
    return;
  }
  if (action === "official") {
    switchView("official");
    return;
  }
  if (action === "guide") {
    switchView("guide");
    return;
  }
}

function refreshRoleSubviewTabs() {
  switchAccountTab(activeAccountTab);
  switchStudentDashboardTab(activeStudentDashboardTab);
  switchParentDashboardTab(activeParentDashboardTab);
}

function hydrateFilters() {
  setOptions(els.filterSection, ["All", "Reading and Writing", "Math"], els.filterSection?.value || "All");
  setOptions(els.filterDifficulty, ["All", "Easy", "Medium", "Hard"], els.filterDifficulty?.value || "All");
  setOptions(els.filterStatus, ["All", "needs_review", "reviewed", "rejected"], els.filterStatus?.value || defaultPracticeReviewStatus());
  setOptions(els.questionAdminStatus, ["All", "needs_review", "reviewed", "rejected"], els.questionAdminStatus?.value || "All");
  setOptions(els.questionAdminPool, ["All", "core_pool", "remedial_pool", "hidden_duplicate"], els.questionAdminPool?.value || "All");
  setOptions(els.topicSection, ["All", "Reading and Writing", "Math"], els.topicSection?.value || "All");
  setOptions(els.topicDifficulty, ["All", "Easy", "Medium", "Hard"], els.topicDifficulty?.value || "All");
  setOptions(els.lessonSection, ["All", "Reading and Writing", "Math"], els.lessonSection?.value || "All");
  setOptions(els.lessonStage, ["All", "Pre-SAT Grade 10", "SAT Core", "SAT Transfer", "SAT 1550-1600"], els.lessonStage?.value || "All");
  refreshDynamicFilters();
}

function refreshDynamicFilters() {
  const visibleQuestions = visibleQuestionBank();
  const domains = unique(visibleQuestions.map((q) => q.domain)).sort();
  const sources = unique(visibleQuestions.map((q) => q.sourceType)).sort();
  setOptions(els.filterDomain, ["All", ...domains], els.filterDomain.value);
  setOptions(els.filterSource, ["All", ...sources], els.filterSource.value);
  setOptions(els.questionAdminSection, ["All", "Reading and Writing", "Math"], els.questionAdminSection?.value || "All");
  setOptions(els.questionAdminSource, ["All", ...sources], els.questionAdminSource?.value || "All");
  refreshTopicFilters();
  refreshLessonFilters();
}

function refreshTopicFilters(changedKey = "") {
  const section = changedKey === "topicSection" ? els.topicSection.value : els.topicSection.value || "All";
  const domain = changedKey === "topicDomain" ? els.topicDomain.value : els.topicDomain.value || "All";
  const scopedBySection = visibleQuestionBank().filter((q) => q.reviewStatus !== "rejected" && (section === "All" || q.section === section));
  const domains = unique(scopedBySection.map((q) => q.domain)).sort();
  setOptions(els.topicDomain, ["All", ...domains], domain);

  const effectiveDomain = els.topicDomain.value || "All";
  const scopedByDomain = scopedBySection.filter((q) => effectiveDomain === "All" || q.domain === effectiveDomain);
  const skills = unique(scopedByDomain.map((q) => q.skill)).sort();
  setOptions(els.topicSkill, ["All", ...skills], changedKey === "topicSkill" ? els.topicSkill.value : els.topicSkill.value || "All");

  const sources = unique(scopedByDomain.map((q) => q.sourceType)).sort();
  setOptions(els.topicSource, ["All", ...sources], els.topicSource.value || "All");
}

function refreshLessonFilters(changedKey = "") {
  if (!els.lessonSection || !els.lessonDomain) return;
  const section = changedKey === "lessonSection" ? els.lessonSection.value : els.lessonSection.value || "All";
  const scopedBySection = visibleQuestionBank().filter((q) => q.reviewStatus !== "rejected" && (section === "All" || q.section === section));
  const taxonomyDomains = SAT_KNOWLEDGE_TAXONOMY.filter((item) => section === "All" || item.section === section).map((item) => item.domain);
  const domains = unique([...scopedBySection.map((q) => q.domain), ...taxonomyDomains]).sort();
  setOptions(els.lessonDomain, ["All", ...domains], changedKey === "lessonDomain" ? els.lessonDomain.value : els.lessonDomain.value || "All");
}

function setOptions(select, options, current = "All") {
  if (!select) return;
  select.innerHTML = "";
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option;
    node.textContent = state.language === "vi" ? studentUiLabel(option) : labelFor(option);
    select.appendChild(node);
  });
  select.value = options.includes(current) ? current : "All";
}

function labelFor(value) {
  return SatStudioI18n.labelFor(value);
}

function studentUiLabel(value) {
  return SatStudioI18n.studentUiLabel(value, state.language);
}

function localizeSelectOptions(select) {
  if (!select) return;
  [...select.options].forEach((option) => {
    const originalValue = option.value || option.textContent;
    if (!option.hasAttribute("value")) option.value = originalValue;
    option.textContent = state.language === "vi" ? studentUiLabel(originalValue) : labelFor(originalValue);
  });
}

function render() {
  if (!currentAccount()) return;
  resetStudyAvailabilityCaches();
  refreshDynamicFilters();
  applyStudentSafeVisibility();
  const view = activeView;
  renderHeader();
  renderMetrics();
  renderDashboard();
  if (view === "admin") renderAdminCenter();
  if (view === "news") renderNews();
  if (view === "pretest") renderPretest();
  if (view === "roadmap") renderRoadmap();
  if (view === "lessons") renderLessons();
  if (view === "topics") renderTopics();
  if (view === "practice") renderPractice();
  if (view === "review") renderReview();
  if (view === "notes") renderStudyNotes();
  if (view === "vocab") renderVocab();
  if (view === "sources") {
    renderSources();
    renderQuestionIntegrityReport();
    renderVaultMode();
  }
  if (view === "official") renderOfficialLogs();
  if (view === "author" || !canAccessPrivateContent()) renderSourceSignals();
  if (view === "bank") {
    renderDuplicateScanStatus();
    renderQuestionAdminManager();
  }
  if (view === "accounts") renderAccounts();
  refreshRoleSubviewTabs();
  applyDynamicVisualState();
  localizeDynamicUiText(document.querySelector(`#view-${activeView}`));
  localizeDynamicUiText(document.querySelector(".sidebar"));
  localizeDynamicUiText(document.querySelector(".topbar"));
}

function applyStudentSafeVisibility() {
  const admin = isContentAdmin();
  document.querySelectorAll(".practice-admin-tools, .topic-admin-tools").forEach((node) => {
    node.hidden = !admin;
  });
  document.querySelectorAll(".vocab-import-panel").forEach((node) => {
    node.hidden = currentAccount()?.role === "student";
  });
  applyRoleGuideCopy();
}

function applyRoleGuideCopy() {
  const role = currentAccount()?.role || "student";
  const vi = state.language === "vi";
  const title = document.querySelector("#view-guide .guide-hero h2");
  const eyebrow = document.querySelector("#view-guide .guide-hero .eyebrow");
  const copy = document.querySelector("#view-guide .guide-hero .muted");
  const badges = document.querySelector("#view-guide .guide-badges");
  if (!copy || !badges) return;
  if (eyebrow) eyebrow.textContent = vi ? "H\u01b0\u1edbng d\u1eabn" : "Operating manual";
  if (role === "student") {
    if (title) title.textContent = vi ? "H\u01b0\u1edbng d\u1eabn h\u1ecdc sinh" : "Student guide";
    copy.textContent = vi
      ? "C\u00e1ch d\u00f9ng SAT Studio \u0111\u1ec3 l\u00e0m diagnostic, h\u1ecdc theo l\u1ed9 tr\u00ecnh, luy\u1ec7n \u0111\u00fang k\u1ef9 n\u0103ng y\u1ebfu v\u00e0 \u00f4n l\u1ed7i sai."
      : "How to use SAT Studio for diagnostics, roadmap lessons, targeted practice, and mistake review.";
    badges.innerHTML = vi
      ? '<span class="pill">Lu\u1ed3ng h\u1ecdc</span><span class="pill">H\u1ecdc h\u1eb1ng ng\u00e0y</span><span class="pill">\u00d4n l\u1ed7i sai</span>'
      : '<span class="pill">Student flow</span><span class="pill">Daily study</span><span class="pill">Mistake review</span>';
    applyGuideCardCopy("student", vi);
    return;
  }
  if (role === "parent") {
    if (title) title.textContent = vi ? "H\u01b0\u1edbng d\u1eabn ph\u1ee5 huynh" : "Parent guide";
    copy.textContent = vi
      ? "C\u00e1ch ph\u1ee5 huynh theo d\u00f5i ti\u1ebfn \u0111\u1ed9, l\u1ed7i c\u1ea7n \u00f4n, log b\u00e0i ch\u00ednh th\u1ee9c v\u00e0 l\u1ecbch h\u1ecdc."
      : "How parents track progress, remediation, official logs, and study schedule.";
    badges.innerHTML = vi
      ? '<span class="pill">Theo d\u00f5i ti\u1ebfn \u0111\u1ed9</span><span class="pill">Log b\u00e0i ch\u00ednh th\u1ee9c</span>'
      : '<span class="pill">Parent tracking</span><span class="pill">Official logs</span>';
    applyGuideCardCopy("parent", vi);
    return;
  }
  if (title) title.textContent = vi ? "H\u01b0\u1edbng d\u1eabn v\u1eadn h\u00e0nh SAT Studio" : "SAT Studio operating guide";
  copy.textContent = vi
    ? "App c\u00f3 hai nh\u00f3m vi\u1ec7c ch\u00ednh: h\u1ecdc sinh h\u1ecdc v\u00e0 \u00f4n t\u1eadp; ph\u1ee5 huynh/admin qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n, ngu\u1ed3n d\u1eef li\u1ec7u v\u00e0 c\u00e2u h\u1ecfi an to\u00e0n."
    : "SAT Studio supports student learning, parent tracking, and content-admin source governance.";
  badges.innerHTML = vi
    ? '<span class="pill">Lu\u1ed3ng h\u1ecdc</span><span class="pill">Theo d\u00f5i ph\u1ee5 huynh</span><span class="pill">An to\u00e0n n\u1ed9i dung</span>'
    : '<span class="pill">Student flow</span><span class="pill">Parent tracking</span><span class="pill">Content safety</span>';
  applyGuideCardCopy("admin", vi);
}

function applyGuideCardCopy(role, vi) {
  const studentCard = document.querySelector("#view-guide .student-guide-card");
  const parentCard = document.querySelector("#view-guide .parent-guide-card");
  const adminCard = document.querySelector("#view-guide .admin-guide-card:not(.warning-guide)");
  const safetyCard = document.querySelector("#view-guide .warning-guide");
  if (studentCard) {
    studentCard.innerHTML = guideStepsHtml(
      vi ? "H\u1ecdc sinh" : "Learner",
      vi ? "H\u01b0\u1edbng d\u1eabn nhanh cho h\u1ecdc sinh" : "Student quick guide",
      vi
        ? [
            ["10 ph\u00fat \u0111\u1ea7u.", "L\u00e0m b\u00e0i nhanh 20 c\u00e2u \u0111\u1ec3 l\u1ea5y m\u1ee9c n\u1ec1n v\u00e0 m\u1edf l\u1ed9 tr\u00ecnh."],
            ["T\u0103ng \u0111i\u1ec3m m\u1ed7i ng\u00e0y.", "M\u1edf H\u00f4m nay, l\u00e0m \u0111\u00fang m\u1ed9t vi\u1ec7c ch\u00ednh: \u00f4n l\u1ed7i, h\u1ecdc b\u00e0i, ho\u1eb7c luy\u1ec7n k\u1ef9 n\u0103ng y\u1ebfu."],
            ["Khi sai m\u1ed9t c\u00e2u.", "\u0110\u1ecdc Quy t\u1eafc, B\u1eaby, C\u00e1ch l\u00e0m nhanh; t\u1ea1o ghi ch\u00fa l\u1ed7i v\u00e0 l\u00e0m c\u00e2u proof."],
            ["Khi n\u00e0o l\u00e0m full test.", "Ch\u1ec9 l\u00e0m b\u00e0i d\u00e0i khi c\u00f3 kho\u1ea3ng 2 gi\u1edd y\u00ean t\u0129nh ho\u1eb7c sau m\u1ed9t block h\u1ecdc."],
          ]
        : [
            ["First 10 minutes.", "Take the 20-question quick test to get your baseline and unlock the roadmap."],
            ["Improve every day.", "Open Today and complete one main task: review mistakes, study a lesson, or practice a weak skill."],
            ["When you miss a question.", "Read Rule, Trap, Fast method; create a mistake note and pass a proof question."],
            ["When to take a full test.", "Use the full test only when you have a quiet 2-hour block or after a study block."],
          ],
    );
  }
  if (parentCard) {
    parentCard.innerHTML = guideStepsHtml(
      vi ? "Ph\u1ee5 huynh" : "Parent",
      vi ? "Vi\u1ec7c ph\u1ee5 huynh n\u00ean theo d\u00f5i" : "What parents should track",
      vi
        ? [
            ["Dashboard.", "Xem baseline, \u0111\u1ed9 ch\u00ednh x\u00e1c, l\u1ed7i c\u1ea7n \u00f4n, streak v\u00e0 \u0111i\u1ec3m th\u01b0\u1edfng."],
            ["Roadmap.", "Ki\u1ec3m tra h\u1ecdc sinh c\u00f3 \u0111i theo k\u1ef9 n\u0103ng y\u1ebfu t\u1eeb diagnostic hay kh\u00f4ng."],
            ["Notes.", "Xem h\u1ecdc sinh c\u00f3 ghi l\u1ea1i l\u1ed7i sai, rule v\u00e0 c\u00f4ng th\u1ee9c ch\u01b0a."],
            ["T\u00e0i kho\u1ea3n.", "T\u1ea1o t\u00e0i kho\u1ea3n local cho t\u1eebng con v\u00e0 qu\u1ea3n l\u00fd reward."],
            ["Log b\u00e0i official.", "Ghi k\u1ebft qu\u1ea3 Bluebook/Khan/College Board theo metadata, kh\u00f4ng paste nguy\u00ean c\u00e2u official."],
          ]
        : [
            ["Dashboard.", "Track baseline, accuracy, due reviews, streaks, and reward points."],
            ["Roadmap.", "Check whether the student is following the diagnostic weak-skill plan."],
            ["Notes.", "Review whether the student records mistakes, rules, and formulas."],
            ["Accounts.", "Create local student accounts and manage rewards."],
            ["Official log.", "Record Bluebook/Khan/College Board metadata without pasting official question text."],
          ],
    );
  }
  if (adminCard) {
    adminCard.innerHTML = guideStepsHtml(
      vi ? "Admin n\u1ed9i dung" : "Content Admin",
      vi ? "X\u1eed l\u00fd d\u1eef li\u1ec7u v\u00e0 t\u1ea1o c\u00e2u h\u1ecfi" : "Data and question workflow",
      vi
        ? [
            ["Bank Manager.", "Import JSON c\u00e2u h\u1ecfi an to\u00e0n/original. T\u00e0i li\u1ec7u high-risk ch\u1ec9 d\u00f9ng metadata."],
            ["Authoring.", "T\u1ea1o c\u00e2u h\u1ecfi t\u1ef1 vi\u1ebft ho\u1eb7c AI draft t\u1eeb source signal."],
            ["Archive signals.", "N\u1ea1p metadata t\u1eeb t\u00e0i li\u1ec7u, kh\u00f4ng import nguy\u00ean v\u0103n c\u00e2u h\u1ecfi official."],
            ["Generate.", "D\u00f9ng signal \u0111\u1ec3 t\u1ea1o draft m\u1edbi, kh\u00f4ng sao ch\u00e9p wording."],
            ["Review.", "L\u00e0m th\u1eed, ki\u1ec3m tra \u0111\u00e1p \u00e1n/gi\u1ea3i th\u00edch, r\u1ed3i Reviewed ho\u1eb7c Reject."],
          ]
        : [
            ["Bank Manager.", "Import safe/original JSON questions. High-risk materials stay metadata-only."],
            ["Authoring.", "Create original questions or AI drafts from source signals."],
            ["Archive signals.", "Load metadata without importing official wording."],
            ["Generate.", "Use signals to create new drafts without copying source wording."],
            ["Review.", "Test the item, check answer/explanation, then mark Reviewed or Reject."],
          ],
    );
  }
  if (safetyCard) {
    safetyCard.innerHTML = vi
      ? guideRulesHtml("\u0110\u1ea1o lu\u1eadt ngu\u1ed3n", "Quy t\u1eafc an to\u00e0n n\u1ed9i dung", [
          ["Public candidate", "C\u00e2u t\u1ef1 vi\u1ebft ho\u1eb7c AI-generated t\u1eeb metadata, \u0111\u00e3 review v\u00e0 kh\u00f4ng tr\u00f9ng wording."],
          ["Private family", "T\u00e0i li\u1ec7u high-risk d\u00f9ng n\u1ed9i b\u1ed9 gia \u0111\u00ecnh, kh\u00f4ng xu\u1ea5t public."],
          ["Metadata only", "College Board/Bluebook/official PDF: ch\u1ec9 l\u01b0u test, module, skill, k\u1ebft qu\u1ea3, note l\u1ed7i sai."],
          ["Link out", "Khan/Bluebook n\u00ean m\u1edf b\u1eb1ng link ngo\u00e0i, kh\u00f4ng scrape, kh\u00f4ng l\u01b0u m\u1eadt kh\u1ea9u."],
        ])
      : guideRulesHtml("Copyright safety", "Source data rules", [
          ["Public candidate", "Original or AI-generated from metadata, reviewed, and not wording-similar."],
          ["Private family", "High-risk materials stay internal and are not released publicly."],
          ["Metadata only", "College Board/Bluebook/official PDFs store only test, module, skill, result, and mistake note metadata."],
          ["Link out", "Open Khan/Bluebook externally; do not scrape, store passwords, or copy content."],
        ]);
  }
}

function guideStepsHtml(eyebrow, title, steps) {
  return `
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <h2>${escapeHtml(title)}</h2>
    <ol class="guide-steps">
      ${steps.map(([head, body]) => `<li><strong>${escapeHtml(head)}</strong><span>${escapeHtml(body)}</span></li>`).join("")}
    </ol>
  `;
}

function guideRulesHtml(eyebrow, title, rules) {
  return `
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <h2>${escapeHtml(title)}</h2>
    <div class="guide-rule-grid">
      ${rules.map(([head, body]) => `<div><strong>${escapeHtml(head)}</strong><span>${escapeHtml(body)}</span></div>`).join("")}
    </div>
  `;
}

function applyDynamicVisualState() {
  document.querySelectorAll("[data-score]").forEach((node) => {
    const score = Math.max(0, Math.min(100, Number(node.dataset.score || 0)));
    node.style.setProperty("--score", `${score}%`);
  });
}

function resetStudyAvailabilityCaches() {
  templateStatsCache.clear();
  skeletonStatsCache.clear();
}

function renderHeader() {
  renderActiveAccountRole();
  const viewState = SatRouterEngine.buildViewState
    ? SatRouterEngine.buildViewState(activeView, state.language)
    : { title: activeView, subtitle: "" };
  if (state.language === "vi" && activeView === "vocab") {
    viewState.title = "T\u1eeb v\u1ef1ng SAT";
    viewState.subtitle = "H\u1ecdc t\u1eeb theo nh\u00f3m, flashcard v\u00e0 quiz ch\u1ec9 l\u1ea5y t\u1eeb ch\u01b0a thu\u1ed9c.";
  }
  const roleCopy = roleSpecificViewCopy(activeView, currentAccount());
  els.pageTitle.textContent = roleCopy?.title || viewState.title;
  els.pageSubtitle.textContent = roleCopy?.subtitle || viewState.subtitle;
}

function roleSpecificViewCopy(view, account) {
  if (account?.role === "parent" && view === "dashboard") {
    if (state.language === "vi") {
      return {
        title: "Trung t\u00e2m ph\u1ee5 huynh",
        subtitle: "Theo d\u00f5i h\u1ecdc sinh \u0111\u00e3 li\u00ean k\u1ebft, l\u1ed7i c\u1ea7n \u00f4n, proof pass/fail v\u00e0 log b\u00e0i ch\u00ednh th\u1ee9c.",
      };
    }
    return {
      title: "Parent Coach",
      subtitle: "Track linked students, due remediation, proof pass/fail, and official-practice logs.",
    };
  }
  if (account?.role !== "student" || state.language !== "vi") return null;
  const studentCopy = {
    dashboard: ["Hôm nay học gì", "Làm đúng bước tiếp theo, không mở quá nhiều màn cùng lúc."],
    pretest: ["Kiểm tra đầu vào", "Lấy mức nền và tìm kỹ năng yếu. Đây không phải điểm SAT chính thức."],
    roadmap: ["Lộ trình học", "Xem việc cần làm hôm nay trước, phần chuyên gia để trong mục mở rộng."],
    lessons: ["Bài học", "Đọc quy tắc ngắn, xem bẫy, rồi làm drill dẫn dắt/proof cùng kỹ năng."],
    topics: ["Chuyên đề", "Chỉ dùng khi đã biết rõ kỹ năng muốn luyện."],
    practice: ["Luyện tập", "Chọn đáp án, đọc feedback, ghi lỗi, rồi làm câu kế tiếp."],
    review: ["Ôn lỗi sai", "Sửa lỗi cũ trước khi thêm nhiều câu mới."],
    notes: ["Ghi chú", "Lưu rule, bẫy và lỗi sai cần nhớ."],
    vocab: ["Từ vựng SAT", "Học set nhỏ mỗi ngày, quiz chỉ lấy từ chưa thuộc."],
    official: ["Log b\u00e0i ch\u00ednh th\u1ee9c", "Ch\u1ec9 l\u01b0u metadata v\u00e0 l\u1ed7i sai, kh\u00f4ng copy c\u00e2u h\u1ecfi ch\u00ednh th\u1ee9c."],
    news: ["Tin tức", "Thông báo và nhắc việc từ SAT Studio."],
    guide: ["Hướng dẫn", "Cách dùng SAT Studio theo vai trò học sinh."],
  };
  const copy = studentCopy[view];
  return copy ? { title: copy[0], subtitle: copy[1] } : null;
}

function renderMetrics() {
  const p = profile();
  const visibleQuestions = visibleQuestionBank();
  const due = getDueQuestionIds().length;
  const baseline = latestCompositePretest()?.scoreEstimate || null;
  const metrics = SatDashboardEngine.buildMetricsModel
    ? SatDashboardEngine.buildMetricsModel({
        profile: p,
        visibleQuestions,
        dueCount: due,
        baseline,
        studyQuestionCount: visibleQuestions.filter(isStudyAvailableQuestion).length,
      })
    : {
        baselineLabel: baseline ? String(baseline) : "--",
        accuracyLabel: "0%",
        questionCount: visibleQuestions.length,
        needsReviewCount: 0,
        dueCount: due,
      };

  els.metricBaseline.textContent = metrics.baselineLabel;
  els.metricAccuracy.textContent = metrics.accuracyLabel;
  els.metricQuestions.textContent = metrics.questionCount;
  els.metricNeedsReview.textContent = metrics.needsReviewCount;
  els.metricDue.textContent = metrics.dueCount;
  els.accuracyMini.textContent = metrics.accuracyLabel;
}

function renderDashboard() {
  const account = currentAccount();
  if (account?.role === "parent") {
    renderDashboardHomeShell("parent");
    els.sidebarFocus.textContent = state.language === "vi" ? "Theo d\u00f5i h\u1ecdc sinh" : "Coach review";
    const coachModel = buildCoachDashboardModelForAccount(account);
    renderParentHome(coachModel);
    renderCoachDashboard(coachModel);
    return;
  }
  if (account?.role !== "student") {
    renderDashboardHomeShell("none");
    els.sidebarFocus.textContent = state.language === "vi" ? "Trung t\u00e2m Admin" : "Admin Center";
    if (els.coachDashboardPanel) els.coachDashboardPanel.innerHTML = "";
    return;
  }

  renderDashboardHomeShell("student");
  const p = profile();
  const latest = latestPretest();
  const composite = latestCompositePretest();
  const hasBaseline = Boolean(latest || composite);
  const weakSkills = getWeakSkills();
  const due = getDueQuestionIds().length;
  if (!hasBaseline && activeStudentDashboardTab !== "today") activeStudentDashboardTab = "today";

  const nextAction = SatDashboardEngine.buildNextActionModel
    ? SatDashboardEngine.buildNextActionModel({
        latestPretest: latest,
        dueCount: due,
        weakSkills,
        roadmap: p.roadmap || [],
        runDiagnosticLabel: t("runDiagnostic"),
      })
    : {
        title: "Run the first pretest",
        body: "The app needs a baseline before it can generate a serious study path.",
        button: "Start Pretest",
        sidebarFocus: t("runDiagnostic"),
      };
  const todayFlow = SatDashboardEngine.buildTodayFlowModel
    ? SatDashboardEngine.buildTodayFlowModel({ latestPretest: latest, dueCount: due, weakSkills, roadmap: p.roadmap || [], profile: p })
    : [];
  const dashboardPriorityModel = buildStudentPriorityModel(latest || composite, weakSkills);
  const dashboardPrioritySkills = dashboardPriorityModel.scopes.length ? dashboardPriorityModel.scopes : weakSkills;
  const scoreLadder = SatDashboardEngine.buildScoreLadderModel
    ? SatDashboardEngine.buildScoreLadderModel({ latestPretest: composite || latest, targetScore: account?.targetScore || 1450, weakSkills: dashboardPrioritySkills, dueCount: due })
    : null;
  els.nextActionTitle.textContent = nextAction.title;
  els.nextActionBody.textContent = nextAction.body;
  els.nextActionButton.textContent = nextAction.button;
  els.sidebarFocus.textContent = nextAction.sidebarFocus;
  renderStudentFocusCard(nextAction, { latestPretest: latest, compositePretest: composite, weakSkills, dueCount: due, todayFlow, scoreLadder });
  bindStudentFocusActions();
  applyStudentDashboardCopy({ latestPretest: latest });

  const weakRows = SatDashboardEngine.buildWeakSkillRows ? SatDashboardEngine.buildWeakSkillRows(weakSkills, 5) : weakSkills.slice(0, 5);
  els.dashboardWeakSkills.innerHTML = SatViewRenderers.renderDashboardWeakSkills
    ? SatViewRenderers.renderDashboardWeakSkills(weakRows)
    : '<div class="empty-state">No weak-skill pattern yet.</div>';

  const loopRows = SatDashboardEngine.buildDashboardLoopModel
    ? SatDashboardEngine.buildDashboardLoopModel({ profile: p, latestPretest: latest, compositePretest: composite, weakSkills, diagnosticScoreLabel })
    : [];
  const loopRowsForRender =
    state.language === "vi"
      ? loopRows.map((row) => ({
          ...row,
          title: studentFlowLabel(row.title || "", true),
          body: studentFlowBody(row.body || "", true),
        }))
      : loopRows;
  els.dashboardLoop.innerHTML = SatViewRenderers.renderDashboardLoop ? SatViewRenderers.renderDashboardLoop(loopRowsForRender) : "";

  renderDashboardTutorBrain();
  renderRewards();
  renderExternalLearningDashboard();
  renderCoachDashboard();
  switchStudentDashboardTab(activeStudentDashboardTab);
  applyStudentDashboardBaselineVisibility(hasBaseline);
  applyStudentDashboardCopy({ latestPretest: latest });
}

function dailyQuestLabels() {
  return {
    questFixThree: t("questFixThree"),
    questProofOne: t("questProofOne"),
    questNoteOne: t("questNoteOne"),
    questExternalFifteen: t("questExternalFifteen"),
    questSprintOne: t("questSprintOne"),
    questHardTwo: t("questHardTwo"),
    questVocabFive: t("questVocabFive"),
    questTypeFix: t("questTypeFix"),
    questTypeProof: t("questTypeProof"),
    questTypeReflect: t("questTypeReflect"),
    questTypePractice: t("questTypePractice"),
    questTypeLog: t("questTypeLog"),
    questTypeHard: t("questTypeHard"),
    questTypeVocab: t("questTypeVocab"),
    questActionOpenReview: t("questActionOpenReview"),
    questActionProof: t("questActionProof"),
    questActionNote: t("questActionNote"),
    questActionSprint: t("questActionSprint"),
    questActionExternal: t("questActionExternal"),
    questActionHard: t("questActionHard"),
    questActionVocab: t("questActionVocab"),
    questFixValue: t("questFixValue"),
    questProofValue: t("questProofValue"),
    questNoteValue: t("questNoteValue"),
    questSprintValue: t("questSprintValue"),
    questExternalValue: t("questExternalValue"),
    questHardValue: t("questHardValue"),
    questVocabValue: t("questVocabValue"),
    hiddenQuestTitle: t("hiddenQuestTitle"),
    hiddenQuestHint: t("hiddenQuestHint"),
    pointsShort: t("pointsShort"),
  };
}

function buildStudentDailyMissionSummary(p = profile()) {
  const quests = SatDashboardEngine.buildDailyQuestModel
    ? SatDashboardEngine.buildDailyQuestModel({ attendance: p.attendance || {}, todayKey: todayKey(), labels: dailyQuestLabels() })
    : [];
  const visibleQuests = quests.filter((quest) => !quest.hidden || quest.revealed);
  const completedQuests = visibleQuests.filter((quest) => quest.complete);
  const total = visibleQuests.length;
  const pct = total ? Math.round((completedQuests.length / total) * 100) : 0;
  return {
    quests: visibleQuests,
    complete: completedQuests.length,
    total,
    pct,
    allComplete: total > 0 && completedQuests.length === total,
    nextQuest: visibleQuests.find((quest) => !quest.complete) || visibleQuests[0] || null,
    lastCompleted: completedQuests[completedQuests.length - 1] || null,
  };
}

function renderDailyMissionProgress(summary = {}, vi = false) {
  const pct = Math.max(0, Math.min(100, Number(summary.pct || 0)));
  const pctBucket = Math.max(0, Math.min(100, Math.round(pct / 10) * 10));
  const complete = Number(summary.complete || 0);
  const total = Number(summary.total || 0);
  const allComplete = Boolean(summary.allComplete);
  const nextTitle = summary.nextQuest?.title || (vi ? "Bắt đầu nhiệm vụ học" : "Start a learning mission");
  const lastTitle = summary.lastCompleted?.title || "";
  const body = allComplete
    ? vi
      ? "Đã xong các nhiệm vụ học chính hôm nay."
      : "Core learning missions are complete today."
    : vi
      ? `Tiếp theo: ${nextTitle}`
      : `Next: ${nextTitle}`;
  const foot = lastTitle
    ? vi
      ? `Vừa hoàn thành: ${lastTitle}`
      : `Latest completed: ${lastTitle}`
    : vi
      ? "Ưu tiên sửa lỗi và chứng minh đã nắm trước khi làm thêm câu mới."
      : "Prioritize fixing and proving mastery before adding new volume.";
  return `
    <div class="student-mission-progress ${allComplete ? "complete" : ""}">
      <div class="student-progress-ring pct-${pctBucket}">
        <strong>${pct}%</strong>
      </div>
      <div>
        <p class="eyebrow">${vi ? "Tiến độ hôm nay" : "Today progress"}</p>
        <strong>${total ? `${complete}/${total}` : "0/0"} ${vi ? "nhiệm vụ học" : "learning missions"}</strong>
        <span>${escapeHtml(body)}</span>
        <small>${escapeHtml(foot)}</small>
      </div>
    </div>
  `;
}

function renderStudentSkillStageLadder({ baselineScore = 0, target = 1450, weakSkills = [] } = {}, vi = false) {
  const score = Number(baselineScore || 0);
  const activeIndex = score >= 1450 ? 3 : score >= 1300 ? 2 : score >= 1100 ? 1 : 0;
  const weakSkill = weakSkills[0]?.skill || (vi ? "kỹ năng yếu nhất" : "weakest skill");
  const stages = [
    {
      label: vi ? "Grade 10 nền" : "Grade 10 base",
      range: "<1100",
      detail: vi ? "Đóng lỗ hổng đại số, ngữ pháp và đọc bằng chứng." : "Close algebra, grammar, and evidence gaps.",
    },
    {
      label: "SAT Core",
      range: "1100-1300",
      detail: vi ? "Ổn định câu dễ/trung bình, giảm lỗi trap." : "Stabilize easy/medium items and reduce trap errors.",
    },
    {
      label: vi ? "Hard transfer" : "Hard transfer",
      range: "1300-1450",
      detail: vi ? "Chuyển kỹ năng sang câu khó, có bấm giờ." : "Transfer skills into timed hard questions.",
    },
    {
      label: "1550+",
      range: `${Math.max(1450, Number(target || 1450))}+`,
      detail: vi ? "Proof, pacing và module đầy đủ." : "Proof, pacing, and full-module consistency.",
    },
  ];
  return `
    <div class="student-stage-ladder">
      <div class="student-stage-ladder-head">
        <p class="eyebrow">${vi ? "Ladder kỹ năng" : "Skill ladder"}</p>
        <strong>${vi ? `Nút thắt hiện tại: ${weakSkill}` : `Current blocker: ${weakSkill}`}</strong>
      </div>
      <div class="student-stage-track">
        ${stages
          .map((stage, index) => {
            const status = index < activeIndex ? "done" : index === activeIndex ? "active" : "locked";
            const statusLabel = status === "done" ? (vi ? "Xong" : "Done") : status === "active" ? (vi ? "Đang học" : "Active") : (vi ? "Chờ mở" : "Locked");
            return `
              <div class="student-stage ${status}">
                <span>${escapeHtml(statusLabel)}</span>
                <strong>${escapeHtml(stage.label)}</strong>
                <small>${escapeHtml(stage.range)}</small>
                <p>${escapeHtml(stage.detail)}</p>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderStudentSkillBadges(skillRows = [], weakSkills = [], vi = false) {
  const seen = new Set();
  const rows = [...(Array.isArray(skillRows) ? skillRows : []), ...(Array.isArray(weakSkills) ? weakSkills : [])]
    .filter((item) => item && item.skill && !seen.has(item.skill) && seen.add(item.skill))
    .slice(0, 4);
  if (!rows.length) {
    return `
      <div class="student-skill-badges empty">
        <span>${vi ? "Chưa có badge kỹ năng" : "No skill badge yet"}</span>
        <small>${vi ? "Làm diagnostic hoặc một set luyện để mở badge đầu tiên." : "Take a diagnostic or practice set to unlock the first badge."}</small>
      </div>
    `;
  }
  return `
    <div class="student-skill-badges">
      ${rows
        .map((item) => {
          const mastery = Number(item.mastery || item.accuracy || 0);
          const status = mastery >= 80 ? "unlocked" : mastery >= 60 ? "near" : "repair";
          const statusLabel = status === "unlocked" ? (vi ? "Đã mở" : "Unlocked") : status === "near" ? (vi ? "Sắp mở" : "Near unlock") : (vi ? "Cần sửa" : "Repair");
          const detail = mastery ? `${mastery}% ${vi ? "nắm vững" : "mastery"}` : `${Number(item.wrong || 0)} ${vi ? "lỗi" : "wrong"}`;
          return `
            <div class="student-skill-badge ${status}">
              <span>${escapeHtml(statusLabel)}</span>
              <strong>${escapeHtml(item.skill)}</strong>
              <small>${escapeHtml(detail)}</small>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function mathMicroSkillRoadmapItems() {
  return [
    {
      domain: "Algebra",
      skill: "Linear equations in one variable",
      stage: "Grade 10 foundation",
      level: "Foundation",
      keywords: ["linear equations in one variable", "linear equation in one variable"],
      goal: "Isolate a variable and check the value in context.",
      proof: "Pass 3 one-variable equation items without algebra slips.",
    },
    {
      domain: "Algebra",
      skill: "Linear functions",
      stage: "SAT Core",
      level: "Core",
      keywords: ["linear functions", "linear function", "slope", "rate of change", "y-intercept"],
      goal: "Read slope, intercept, units, and function meaning.",
      proof: "Explain slope/intercept in words and answer a new medium item.",
    },
    {
      domain: "Algebra",
      skill: "Linear equations in two variables",
      stage: "SAT Core",
      level: "Core",
      keywords: ["linear equations in two variables", "linear equation in two variables", "standard form"],
      goal: "Move between equation forms, graph meaning, and point substitution.",
      proof: "Choose the right form for a word problem, not just solve mechanically.",
    },
    {
      domain: "Algebra",
      skill: "Systems of equations in two variables",
      stage: "SAT Transfer",
      level: "Transfer",
      keywords: ["systems of equations", "system of equations", "systems of two linear equations"],
      goal: "Know when to substitute, eliminate, or interpret no/one/infinite solutions.",
      proof: "Pass one system item with a trap answer present.",
    },
    {
      domain: "Algebra",
      skill: "Linear inequalities",
      stage: "1550+ proof",
      level: "Hard",
      keywords: ["linear inequalities", "inequality", "inequalities"],
      goal: "Track inequality direction, interval meaning, and boundary conditions.",
      proof: "Pass a hard inequality item and state why the boundary is included or excluded.",
    },
    {
      domain: "Advanced Math",
      skill: "Nonlinear functions",
      stage: "SAT Core",
      level: "Core",
      keywords: ["nonlinear functions", "nonlinear function", "quadratic functions", "exponential functions"],
      goal: "Identify the function family before solving.",
      proof: "Classify quadratic/exponential/radical behavior from equation, table, or graph.",
    },
    {
      domain: "Advanced Math",
      skill: "Nonlinear equations in one variable",
      stage: "SAT Transfer",
      level: "Transfer",
      keywords: ["nonlinear equations in one variable", "nonlinear equations", "quadratic equations", "radical equations"],
      goal: "Solve quadratic/radical equations and reject extraneous answers.",
      proof: "Show the algebra and verify solutions in the original equation.",
    },
    {
      domain: "Advanced Math",
      skill: "Equivalent expressions",
      stage: "SAT Transfer",
      level: "Transfer",
      keywords: ["equivalent expressions", "polynomial", "factoring", "expanded form", "factored form"],
      goal: "Choose the expression form that reveals the requested feature.",
      proof: "Move between factored, expanded, and vertex-like forms without losing meaning.",
    },
    {
      domain: "Advanced Math",
      skill: "Systems of equations in two variables",
      stage: "1550+ proof",
      level: "Hard",
      keywords: ["systems of equations in two variables", "linear and nonlinear systems", "nonlinear systems", "line and parabola"],
      goal: "Interpret intersections of linear and nonlinear relationships.",
      proof: "Pass a line/parabola system item and explain what each solution means.",
    },
    {
      domain: "Advanced Math",
      skill: "Function notation and parameters",
      stage: "1600 precision",
      level: "Elite",
      keywords: ["function notation", "parameter", "coefficient", "constant", "vertex"],
      goal: "Read parameters as features, not just numbers to plug in.",
      proof: "Explain how changing one parameter changes the graph or solutions.",
    },
  ];
}

function matchesMicroSkill(question = {}, item = {}) {
  if (!question || question.section !== "Math" || question.domain !== item.domain) return false;
  const haystack = normalizeText(`${question.skill || ""} ${question.domain || ""} ${question.prompt || ""}`);
  return (item.keywords || []).some((keyword) => haystack.includes(normalizeText(keyword)));
}

function microSkillMastery(item = {}, skillRows = []) {
  const keywords = (item.keywords || []).map(normalizeText);
  return (skillRows || []).find((row) => {
    if (row.section !== "Math" || row.domain !== item.domain) return false;
    const skill = normalizeText(row.skill || "");
    return skill === normalizeText(item.skill) || keywords.some((keyword) => skill.includes(keyword) || keyword.includes(skill));
  });
}

function buildMathMicroSkillRoadmap(skillRows = []) {
  const questions = visibleQuestionBank().filter(isStudyAvailableQuestion);
  const weakKeys = new Set(getWeakSkills().map((item) => `${item.domain}|${item.skill}`));
  return mathMicroSkillRoadmapItems().map((item) => {
    const masteryRow = microSkillMastery(item, skillRows);
    const count = questions.filter((question) => matchesMicroSkill(question, item)).length;
    const mastery = Number(masteryRow?.mastery ?? masteryRow?.accuracy ?? 0);
    const weak = Boolean(masteryRow && (mastery < 70 || weakKeys.has(`${masteryRow.domain}|${masteryRow.skill}`)));
    const status = mastery >= 82 ? "done" : weak || count ? "active" : "gap";
    return {
      ...item,
      count,
      mastery,
      status,
      attempts: Number(masteryRow?.attempts || 0),
      dominantErrorType: masteryRow?.dominantErrorType || "unknown",
    };
  });
}

function renderMathMicroSkillRoadmap(skillRows = []) {
  const vi = state.language === "vi";
  const rows = buildMathMicroSkillRoadmap(skillRows);
  const grouped = ["Algebra", "Advanced Math"].map((domain) => ({
    domain,
    rows: rows.filter((item) => item.domain === domain),
  }));
  const statusLabel = (status) =>
    status === "done"
      ? vi
        ? "Đã ổn"
        : "Stable"
      : status === "active"
        ? vi
          ? "Đang học"
          : "Active"
        : vi
          ? "Cần bổ sung"
          : "Need content";
  return `
    <section class="math-micro-roadmap">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">${vi ? "Algebra & Advanced Math" : "Algebra & Advanced Math"}</p>
          <h3>${vi ? "Lộ trình vi kỹ năng từ Grade 10 đến 1600" : "Micro-skill path from Grade 10 to 1600"}</h3>
          <p class="muted">${vi ? "Mỗi ô là một đơn vị học nhỏ: học quy tắc, luyện set 10 câu, rồi pass proof trước khi tăng độ khó." : "Each card is a small learning unit: learn the rule, run a 10-question set, then pass proof before increasing difficulty."}</p>
        </div>
      </div>
      ${grouped
        .map(
          (group) => `
            <div class="math-micro-domain">
              <h4>${escapeHtml(group.domain)}</h4>
              <div class="math-micro-grid">
                ${group.rows
                  .map(
                    (item) => `
                      <article class="math-micro-card ${escapeHtml(item.status)}">
                        <div>
                          <span>${escapeHtml(item.stage)}</span>
                          <strong>${escapeHtml(item.skill)}</strong>
                          <small>${escapeHtml(statusLabel(item.status))} · ${Number(item.count || 0)} ${vi ? "câu" : "items"}${item.mastery ? ` · ${Number(item.mastery)}%` : ""}</small>
                        </div>
                        <p>${escapeHtml(vi ? translateMicroGoal(item.goal) : item.goal)}</p>
                        <p class="math-micro-proof">${escapeHtml(vi ? translateMicroGoal(item.proof) : item.proof)}</p>
                        <div class="answer-actions">
                          <button class="button secondary" type="button" data-micro-lesson data-section="Math" data-domain="${escapeHtml(item.domain)}" data-skill="${escapeHtml(item.skill)}">${vi ? "Học" : "Lesson"}</button>
                          <button class="button secondary" type="button" data-micro-practice data-section="Math" data-domain="${escapeHtml(item.domain)}" data-skill="${escapeHtml(item.skill)}">${vi ? "Set 10 câu" : "10-item set"}</button>
                        </div>
                      </article>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          `,
        )
        .join("")}
    </section>
  `;
}

function translateMicroGoal(text = "") {
  const map = {
    "Isolate a variable and check the value in context.": "Cô lập biến và kiểm tra nghiệm trong ngữ cảnh.",
    "Pass 3 one-variable equation items without algebra slips.": "Làm đúng 3 câu phương trình một biến mà không trượt đại số.",
    "Read slope, intercept, units, and function meaning.": "Đọc đúng slope, intercept, đơn vị và ý nghĩa hàm.",
    "Explain slope/intercept in words and answer a new medium item.": "Giải thích slope/intercept bằng lời và làm đúng một câu medium mới.",
    "Move between equation forms, graph meaning, and point substitution.": "Chuyển giữa dạng phương trình, ý nghĩa đồ thị và thế điểm.",
    "Choose the right form for a word problem, not just solve mechanically.": "Chọn đúng dạng cho bài word problem, không chỉ giải máy móc.",
    "Know when to substitute, eliminate, or interpret no/one/infinite solutions.": "Biết khi nào thế, khử, hoặc diễn giải vô nghiệm/một nghiệm/vô số nghiệm.",
    "Pass one system item with a trap answer present.": "Làm đúng một câu hệ phương trình có đáp án bẫy.",
    "Track inequality direction, interval meaning, and boundary conditions.": "Giữ đúng chiều bất đẳng thức, ý nghĩa khoảng và điều kiện biên.",
    "Pass a hard inequality item and state why the boundary is included or excluded.": "Làm đúng một câu bất đẳng thức hard và nói được vì sao lấy/không lấy biên.",
    "Identify the function family before solving.": "Nhận dạng họ hàm trước khi giải.",
    "Classify quadratic/exponential/radical behavior from equation, table, or graph.": "Nhận dạng hành vi bậc hai/mũ/căn từ phương trình, bảng hoặc đồ thị.",
    "Solve quadratic/radical equations and reject extraneous answers.": "Giải phương trình bậc hai/căn và loại nghiệm ngoại lai.",
    "Show the algebra and verify solutions in the original equation.": "Trình bày đại số và kiểm tra nghiệm trong phương trình gốc.",
    "Choose the expression form that reveals the requested feature.": "Chọn dạng biểu thức làm lộ đúng đặc điểm đề hỏi.",
    "Move between factored, expanded, and vertex-like forms without losing meaning.": "Chuyển giữa dạng nhân tử, khai triển và dạng đỉnh mà không mất ý nghĩa.",
    "Interpret intersections of linear and nonlinear relationships.": "Diễn giải giao điểm của quan hệ tuyến tính và phi tuyến.",
    "Pass a line/parabola system item and explain what each solution means.": "Làm đúng một câu hệ đường thẳng/parabol và giải thích ý nghĩa từng nghiệm.",
    "Read parameters as features, not just numbers to plug in.": "Đọc tham số như đặc điểm của mô hình, không chỉ là số để thay.",
    "Explain how changing one parameter changes the graph or solutions.": "Giải thích khi đổi một tham số thì đồ thị hoặc nghiệm đổi thế nào.",
  };
  return map[text] || text;
}

function renderStudentTodayPriorityPlan(context = {}, vi = false) {
  const latest = context.latestPretest || latestPretest();
  if (!latest) return "";
  const plan = Array.isArray(context.priorityPlan) ? context.priorityPlan : buildPretestFixPlan(latest);
  const weak = context.weakSkills?.[0] || null;
  const first = plan[0];
  const second = plan[1] || first;
  const fallbackScope = first?.question || weak || { section: "Math", domain: "Algebra", skill: "Linear equations in one variable" };
  const tasks = [
    {
      label: vi ? "1. Học 3 phút" : "1. Learn 3 min",
      title: first?.question?.skill || fallbackScope.skill || (vi ? "Kỹ năng yếu nhất" : "Weakest skill"),
      body: vi ? "Đọc rule ngắn, xem bẫy hay dính, rồi nói lại bằng lời của mình." : "Read the short rule, name the trap, then restate it in your own words.",
      action: "lesson",
      scope: first?.question || fallbackScope,
    },
    {
      label: vi ? "2. Targeted 10 câu" : "2. Targeted 10",
      title: second?.question?.skill || fallbackScope.skill || (vi ? "Set trọng tâm" : "Focused set"),
      body: vi ? "Làm 10 câu cùng subskill. Dừng sau mỗi câu sai để ghi lỗi." : "Do 10 same-subskill questions. Stop after every miss to tag the error.",
      action: "practice",
      scope: second?.question || fallbackScope,
    },
    {
      label: vi ? "3. Proof 2 câu fresh" : "3. Proof 2 fresh",
      title: vi ? "Chứng minh đã nắm" : "Prove transfer",
      body: vi ? "Pass 2 câu mới cùng skill, không slow_correct; nếu fail thì quay lại rule." : "Pass 2 fresh same-skill items with no slow_correct; if proof fails, return to the rule.",
      action: Number(context.dueCount || 0) ? "review" : "practice",
      scope: fallbackScope,
    },
  ];
  return `
    <section class="student-priority-plan">
      <div class="student-priority-plan-head">
        <p class="eyebrow">${vi ? "3 việc hôm nay" : "Today's 3 tasks"}</p>
        <strong>${vi ? "Học ngắn, luyện đúng, chứng minh đã nắm" : "Learn briefly, practice narrowly, prove mastery"}</strong>
      </div>
      <div class="student-priority-grid">
        ${tasks
          .map(
            (task) => `
              <article>
                <span>${escapeHtml(task.label)}</span>
                <strong>${escapeHtml(task.title)}</strong>
                <p>${escapeHtml(task.body)}</p>
                <button
                  class="button secondary"
                  type="button"
                  data-student-plan-action="${escapeHtml(task.action)}"
                  data-section="${escapeHtml(task.scope?.section || "All")}"
                  data-domain="${escapeHtml(task.scope?.domain || "All")}"
                  data-skill="${escapeHtml(task.scope?.skill || "All")}"
                >${task.action === "lesson" ? (vi ? "Mở bài" : "Open lesson") : task.action === "review" ? (vi ? "Ôn lỗi" : "Review") : (vi ? "Luyện set" : "Start set")}</button>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderStudentFocusCard(nextAction = {}, context = {}) {
  if (!els.studentFocusCard) return;
  const account = currentAccount();
  const p = profile();
  const vi = state.language === "vi";
  const attempts = Array.isArray(p.attempts) ? p.attempts : [];
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const attendance = p.attendance || {};
  const avatar = accountAvatar(account);
  const baseline = context.compositePretest?.scoreEstimate || context.latestPretest?.scoreEstimate || "--";
  const priorityModel = buildStudentPriorityModel(context.latestPretest || context.compositePretest, context.weakSkills || []);
  const studentPrioritySkills = priorityModel.scopes.length ? priorityModel.scopes : context.weakSkills || [];
  const weakSkill = studentPrioritySkills[0]?.skill || "Diagnostic first";
  const due = Number(context.dueCount || 0);
  const points = Number(attendance.points || 0);
  const streak = Number(p.streak?.count || 0);
  const target = Number(account?.targetScore || 1450);
  const nextTitle = nextAction.title || "Start today";
  const nextBody = nextAction.body || "Build a baseline, then SAT Studio will choose the next drill.";
  const nextButton = nextAction.button || (vi ? "Bắt đầu" : "Start");
  const hasBaseline = Boolean(context.latestPretest || context.compositePretest);
  els.studentFocusCard.classList.toggle("no-baseline", !hasBaseline);
  if (!hasBaseline) {
    els.studentFocusCard.classList.remove("missions-complete");
    els.studentFocusCard.innerHTML = `
      <div class="student-focus-identity">
        <div class="account-avatar avatar-${escapeHtml(avatar.color)}">${escapeHtml(avatar.initials)}</div>
        <div>
          <p class="eyebrow">${vi ? "Việc đầu tiên" : "First step"}</p>
          <h2>${vi ? "Làm bài đầu vào 20 câu" : "Take the 20-question baseline"}</h2>
          <p>${vi ? "Bài này chỉ dùng để tìm kỹ năng yếu và dựng lộ trình học, không phải điểm SAT chính thức." : "This is only for finding weak skills and building your study path, not an official SAT score."}</p>
        </div>
      </div>
      <div class="student-focus-stats">
        <div><strong>20</strong><span>${vi ? "câu" : "questions"}</span></div>
        <div><strong>25m</strong><span>${vi ? "dự kiến" : "about"}</span></div>
        <div><strong>+20</strong><span>${vi ? "điểm thưởng" : "points"}</span></div>
      </div>
      <div class="student-focus-action">
        <button class="button primary" type="button" data-student-focus-action>${escapeHtml(studentFlowBody(nextButton, vi))}</button>
        <span>${vi ? "Sau khi nộp sẽ có 3 lỗi cần sửa trước." : "After submission you will get the first 3 fixes."}</span>
      </div>
      <div class="student-focus-chip">${vi ? "Nên làm trước khi luyện tập" : "Do this before practice"}</div>
    `;
    localizeDynamicUiText(els.studentFocusCard);
    return;
  }
  const todayFlow = Array.isArray(context.todayFlow) ? context.todayFlow : [];
  const missionSummary = buildStudentDailyMissionSummary(p);
  const skillRows = buildSkillMatrix().slice(0, 6);
  const missionProgressHtml = renderDailyMissionProgress(missionSummary, vi);
  const skillStageHtml = renderStudentSkillStageLadder({ baselineScore: Number(baseline) || 0, target, weakSkills: studentPrioritySkills, skillRows }, vi);
  const skillBadgesHtml = renderStudentSkillBadges(skillRows, studentPrioritySkills, vi);
  const priorityPlanHtml = renderStudentTodayPriorityPlan(
    {
      latestPretest: context.latestPretest || context.compositePretest,
      priorityPlan: priorityModel.plan,
      weakSkills: studentPrioritySkills,
      dueCount: due,
    },
    vi,
  );
  els.studentFocusCard.classList.toggle("missions-complete", missionSummary.allComplete);
  const flowHtml = todayFlow.length
    ? `
    <div class="student-today-flow" aria-label="Today's study flow">
      ${todayFlow
        .map(
          (item) => `
            <div class="student-today-flow-item ${escapeHtml(item.status || "next")}">
              <span>${escapeHtml(item.step || "")}</span>
              <strong>${escapeHtml(studentFlowLabel(item.title || "", vi))}</strong>
              <small>${escapeHtml(studentFlowBody(item.body || "", vi))}</small>
            </div>
          `,
        )
        .join("")}
    </div>
  `
    : "";
  const ladder = context.scoreLadder || {};
  const ladderProgress = Math.max(0, Math.min(100, Math.round(Number(ladder.progressPct || 0))));
  const blockerHtml = Array.isArray(ladder.blockers) && ladder.blockers.length
    ? ladder.blockers.map((item) => `<span>${escapeHtml(item.skill || "Skill")} &middot; ${Number(item.wrong || 0)} wrong</span>`).join("")
    : `<span>${vi ? "Làm diagnostic để tìm điểm nghẽn" : "Run diagnostic to identify blockers"}</span>`;
  const scoreLadderHtml = context.scoreLadder
    ? `
    <div class="student-score-ladder">
      <div>
        <p class="eyebrow">${vi ? "Thang điểm" : "Score ladder"}</p>
        <strong>${escapeHtml(ladder.currentLabel || "--")} &rarr; ${escapeHtml(String(ladder.targetScore || target))}</strong>
        <small>${escapeHtml(studentFlowBody(ladder.band || "Diagnostic needed", vi))} &middot; ${Number(ladder.pointGap || 0)} ${vi ? "điểm cần tăng" : "point gap"}</small>
      </div>
      <progress class="student-score-progress" max="100" value="${ladderProgress}" aria-label="Score progress">${ladderProgress}%</progress>
      <div class="student-score-blockers">${blockerHtml}</div>
      <p>${escapeHtml(studentFlowBody(ladder.proofCondition || "Finish a proof set to confirm mastery.", vi))}</p>
    </div>
  `
    : "";

  els.studentFocusCard.innerHTML = `
    <div class="student-focus-identity">
      <div class="account-avatar avatar-${escapeHtml(avatar.color)}">${escapeHtml(avatar.initials)}</div>
      <div>
        <p class="eyebrow">${vi ? "Nhiệm vụ hôm nay" : "Today's mission"}</p>
        <h2>${escapeHtml(studentFlowBody(nextTitle, vi))}</h2>
        <p>${escapeHtml(studentFlowBody(nextBody, vi))}</p>
      </div>
    </div>
    <div class="student-focus-stats">
      <div><strong>${escapeHtml(String(target))}</strong><span>${vi ? "mục tiêu" : "target"}</span></div>
      <div><strong>${escapeHtml(String(baseline))}</strong><span>${vi ? "mức nền" : "baseline"}</span></div>
      <div><strong>${accuracy}%</strong><span>${vi ? "độ chính xác" : "accuracy"}</span></div>
      <div><strong>${due}</strong><span>${vi ? "cần ôn" : "due"}</span></div>
      <div><strong>${points}</strong><span>${vi ? "điểm thưởng" : "points"}</span></div>
      <div><strong>${streak}</strong><span>${vi ? "streak" : "streak"}</span></div>
    </div>
    <div class="student-focus-action">
      <button class="button primary" type="button" data-student-focus-action>${escapeHtml(studentFlowBody(nextButton, vi))}</button>
      <span>${vi ? `Hôm nay hoàn thành ${missionSummary.pct}%` : `${missionSummary.pct}% complete today`}</span>
    </div>
    <div class="student-focus-chip">${escapeHtml(studentFlowBody(weakSkill, vi))}</div>
    ${missionProgressHtml}
    ${priorityPlanHtml}
    ${skillStageHtml}
    ${skillBadgesHtml}
    ${scoreLadderHtml}
    ${flowHtml}
  `;
  localizeDynamicUiText(els.studentFocusCard);
}

function bindStudentFocusActions() {
  document.querySelectorAll("[data-student-focus-action]").forEach((button) => {
    button.addEventListener("click", handleNextAction);
  });
  document.querySelectorAll("[data-student-plan-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const scope = {
        section: button.dataset.section || "All",
        domain: button.dataset.domain || "All",
        skill: button.dataset.skill || "All",
        difficulty: "All",
        source: "All",
      };
      if (button.dataset.studentPlanAction === "lesson") {
        activeLessonKey = lessonScopeKey(scope);
        switchView("lessons");
        return;
      }
      if (button.dataset.studentPlanAction === "review") {
        startDueReview();
        return;
      }
      startScopedPractice(scope);
    });
  });
}

function applyStudentDashboardCopy({ latestPretest = null } = {}) {
  if (!els.studentHome || currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  els.studentHome.classList.toggle("has-baseline", Boolean(latestPretest));
  els.studentHome.classList.toggle("no-baseline", !latestPretest);
  document.querySelectorAll("[data-student-dashboard-tab]").forEach((button) => {
    const key = button.dataset.studentDashboardTab;
    const labels = vi
      ? { today: "Hôm nay", rewards: "Thưởng", skills: "Kỹ năng yếu", tools: "Công cụ" }
      : { today: "Today", rewards: "Rewards", skills: "Skill focus", tools: "Tools" };
    button.textContent = labels[key] || button.textContent;
  });
  if (els.externalLogSource) {
    const sourceLabels = vi
      ? { "Khan Academy": "Khan Academy", Bluebook: "Bluebook", "College Board": "College Board", Other: "Kh\u00e1c" }
      : { "Khan Academy": "Khan Academy", Bluebook: "Bluebook", "College Board": "College Board", Other: "Other" };
    [...els.externalLogSource.options].forEach((option) => {
      option.textContent = sourceLabels[option.value] || option.value;
    });
  }
  const hero = els.studentHome.querySelector(".hero-panel");
  if (hero) hero.hidden = true;
  localizeDynamicUiText(els.studentHome);
}

function studentFlowLabel(value, vi) {
  if (!vi) return value;
  const map = {
    Baseline: "Mức nền",
    "Due review": "Ôn lỗi đến hạn",
    "Skill drill": "Luyện kỹ năng yếu",
    "Proof log": "Proof",
  };
  return map[value] || studentFlowBody(value, vi);
}

function studentFlowBody(value, vi) {
  if (!vi) return value;
  let text = String(value || "");
  const map = {
    "Run the first pretest": "Làm bài đầu vào đầu tiên",
    "The app needs a baseline before it can generate a serious study path.": "SAT Studio cần mức nền để chọn đúng kỹ năng yếu.",
    "Start Pretest": "Làm pretest",
    "Practice Due": "Ôn lỗi đến hạn",
    "Open Roadmap": "Mở lộ trình",
    "Review due mistakes": "Ôn lỗi đến hạn",
    "Use filtered practice to attack one weak skill at a time.": "Luyện có lọc để xử lý từng kỹ năng yếu.",
    "Baseline is ready.": "Đã có mức nền.",
    "Run a short diagnostic first.": "Làm diagnostic ngắn trước.",
    "No due mistakes.": "Chưa có lỗi đến hạn.",
    "Targeted practice": "Luyện đúng kỹ năng yếu",
    "Finish one focused set.": "Hoàn thành một set tập trung.",
    "Diagnostic first": "Làm diagnostic trước",
    "Diagnostic needed": "Cần diagnostic",
    "Finish a proof set to confirm mastery.": "Hoàn thành set chứng minh để xác nhận đã nắm vững.",
  };
  if (map[text]) return map[text];
  text = text.replace(/^(\d+) questions? should be reviewed before new practice\.$/, "$1 câu cần ôn trước khi luyện mới.");
  text = text.replace(/^(\d+) mistakes? due now\.$/, "$1 lỗi đang đến hạn.");
  text = text.replace(/^(\d+) answers? today\.$/, "$1 câu hôm nay.");
  return text;
}

function renderDashboardHomeShell(role) {
  if (els.studentHome) els.studentHome.hidden = role !== "student";
  if (els.parentHome) els.parentHome.hidden = role !== "parent";
}

function renderParentHome(coachModel = null) {
  if (!els.parentHomeSummary) return;
  const model = buildParentHomeModel(coachModel || buildCoachDashboardModelForAccount());
  els.parentHomeSummary.innerHTML = SatViewRenderers.renderParentHomeSummary
    ? SatViewRenderers.renderParentHomeSummary(model)
    : "";
  if (els.parentHomePlan) {
    els.parentHomePlan.innerHTML = SatViewRenderers.renderParentHomePlan
      ? SatViewRenderers.renderParentHomePlan(model)
      : "";
  }
}

function buildParentHomeModel(coachModel = {}) {
  const rows = (Array.isArray(coachModel.students) ? coachModel.students : []).map(buildParentHomeStudentRow);
  const nextRows = rows
    .filter((row) => row.nextSessionAt)
    .slice()
    .sort((a, b) => (Date.parse(a.nextSessionAt) || 0) - (Date.parse(b.nextSessionAt) || 0));
  const dueNow = rows.reduce((sum, row) => sum + Number(row.dueRemediation || 0), 0);
  const unscheduled = rows.filter((row) => !row.nextSessionAt).length;
  const needsAction = rows.filter((row) => row.priority !== "steady").length;
  const diagnosticNeeded = rows.filter((row) => row.needsDiagnostic).length;
  const nextSession = nextRows[0] || null;
  const weeklyReport = buildParentWeeklyReport(rows);
  const targetGapRows = rows
    .filter((row) => Number(row.currentScore || 0) > 0 && Number(row.targetScore || 0) > 0)
    .slice()
    .sort((a, b) => Number(b.targetGap || 0) - Number(a.targetGap || 0));
  const targetGapRow = targetGapRows[0] || null;
  const targetGap = targetGapRow ? Math.max(Number(targetGapRow.targetGap || 0), 0) : null;
  const status = !rows.length
    ? {
        label: "No linked students",
        detail: "Create a student account, link it to this parent, then run the 20-question pretest.",
      }
    : diagnosticNeeded
      ? {
          label: "Diagnostic needed",
          detail: `Have ${diagnosticNeeded} student${diagnosticNeeded === 1 ? "" : "s"} complete the 20-question pretest before judging progress.`,
        }
      : dueNow
        ? {
            label: "Parent action needed",
            detail: `Clear ${dueNow} due remediation item${dueNow === 1 ? "" : "s"} before adding new practice volume.`,
          }
        : unscheduled
          ? {
              label: "Schedule needed",
              detail: `Set the next study session for ${unscheduled} student${unscheduled === 1 ? "" : "s"}.`,
            }
          : Number(weeklyReport.proofFailed || 0) > Number(weeklyReport.proofPassed || 0)
            ? {
                label: "Proof quality risk",
                detail: "Ask for one clean proof redo before rewarding more practice volume.",
              }
            : {
                label: "On track this week",
                detail: "Schedule, proof, and official-practice monitoring are ready.",
              };
  return {
    summary: {
      statusLabel: status.label,
      statusDetail: status.detail,
      studentCount: rows.length,
      scheduledStudents: rows.length - unscheduled,
      nextSessionLabel: nextSession?.nextSessionLabel || "Not scheduled",
      nextSessionStudent: nextSession?.name || "",
      dueWork: dueNow,
      openMistakes: rows.reduce((sum, row) => sum + Number(row.openMistakes || 0), 0),
      officialLogs: rows.reduce((sum, row) => sum + Number(row.officialLogCount || 0), 0),
      externalMinutes: coachModel.summary?.externalMinutes || rows.reduce((sum, row) => sum + Number(row.externalMinutes || 0), 0),
      targetGapLabel: targetGapRow ? (targetGap ? `${targetGap} points` : "Target reached") : "Need diagnostic",
      targetGapDetail: targetGapRow
        ? `${targetGapRow.name || "Student"}: ${targetGapRow.currentScore || "--"} -> ${targetGapRow.targetScore || "--"}`
        : "Run a diagnostic or log an official score to calibrate expectations.",
    },
    weeklyReport,
    checklist: buildParentChecklist(rows, weeklyReport, { dueNow, unscheduled, diagnosticNeeded }),
    priority: {
      title: status.label,
      body: status.detail,
      needsAction,
      unscheduled,
      dueNow,
      diagnosticNeeded,
    },
    rows,
  };
}

function buildParentChecklist(rows = [], weeklyReport = {}, counts = {}) {
  const dueNow = Number(counts.dueNow || 0);
  const unscheduled = Number(counts.unscheduled || 0);
  const diagnosticNeeded = Number(counts.diagnosticNeeded || 0);
  const officialLogs = rows.reduce((sum, row) => sum + Number(row.officialLogCount || 0), 0);
  const proofPassed = Number(weeklyReport.proofPassed || 0);
  const proofFailed = Number(weeklyReport.proofFailed || 0);
  const items = [
    {
      label: "Baseline",
      value: diagnosticNeeded ? "Need pretest" : "Ready",
      body: diagnosticNeeded ? `${diagnosticNeeded} student${diagnosticNeeded === 1 ? "" : "s"} still needs a baseline.` : "Every linked student has a score signal.",
      status: diagnosticNeeded ? "todo" : "done",
    },
    {
      label: "Schedule",
      value: unscheduled ? `${unscheduled} missing` : "Ready",
      body: unscheduled ? "Set the next study block so the family can monitor consistency." : "Next study block is visible.",
      status: unscheduled ? "todo" : "done",
    },
    {
      label: "Review debt",
      value: dueNow ? `${dueNow} due` : "Clear",
      body: dueNow ? "Clear due remediation before assigning fresh volume." : "No due remediation is blocking new practice.",
      status: dueNow ? "todo" : "done",
    },
    {
      label: "Proof / official",
      value: officialLogs ? `${officialLogs} log` : "Need log",
      body: proofFailed > proofPassed ? "Proof quality is below target; require a clean proof redo." : officialLogs ? "Official/Khan signal is connected to the plan." : "Log one Bluebook/Khan/official result to calibrate expectations.",
      status: proofFailed > proofPassed || !officialLogs ? "todo" : "done",
    },
  ];
  return items;
}

function buildParentWeeklyReport(rows = []) {
  const totals = rows.reduce(
    (acc, row) => {
      const week = row.week || {};
      acc.questions += Number(week.attempts || 0);
      acc.correct += Number(week.correct || 0);
      acc.practiceMinutes += Number(week.practiceMinutes || 0);
      acc.externalMinutes += Number(week.externalMinutes || 0);
      acc.officialLogs += Number(week.officialLogs || 0);
      acc.proofPassed += Number(week.proofPassed || 0);
      acc.proofFailed += Number(week.proofFailed || 0);
      acc.slowCorrect += Number(week.slowCorrect || 0);
      acc.marked += Number(week.marked || 0);
      return acc;
    },
    { questions: 0, correct: 0, practiceMinutes: 0, externalMinutes: 0, officialLogs: 0, proofPassed: 0, proofFailed: 0, slowCorrect: 0, marked: 0 },
  );
  const accuracy = totals.questions ? Math.round((totals.correct / totals.questions) * 100) : 0;
  const stuckSkills = rows
    .flatMap((row) => (Array.isArray(row.subskills) ? row.subskills : []).map((item) => ({ ...item, studentName: row.name || "Student" })))
    .filter((item) => Number(item.wrong || 0) > 0 || Number(item.accuracy || 0) < 70)
    .sort((a, b) => Number(a.accuracy || 100) - Number(b.accuracy || 100) || Number(b.wrong || 0) - Number(a.wrong || 0))
    .slice(0, 3)
    .map((item) => {
      const accuracy = Number(item.accuracy || 0);
      const wrong = Number(item.wrong || 0);
      const projectedGain = accuracy < 50 ? 35 : accuracy < 70 ? 25 : wrong >= 3 ? 15 : 10;
      return {
        studentName: item.studentName,
        skill: item.skill || "Subskill",
        domain: item.domain || "",
        accuracy,
        wrong,
        projectedGain,
        action: `Learn 3 min -> targeted 10 -> proof 2 fresh on ${item.skill || "the blocker skill"}.`,
      };
    });
  const blockers = stuckSkills.map((item) => `${item.studentName}: ${item.skill} (${item.accuracy}%)`);
  const actions = [];
  const dueTotal = rows.reduce((sum, row) => sum + Number(row.dueRemediation || 0), 0);
  const unscheduled = rows.filter((row) => !row.nextSessionAt).length;
  const diagnosticNeeded = rows.filter((row) => row.needsDiagnostic).length;
  const attemptedRows = rows.filter((row) => Number(row.attempts || 0) > 0 || Number(row.currentScore || 0) > 0);
  if (diagnosticNeeded) actions.push(`Have ${diagnosticNeeded} student${diagnosticNeeded === 1 ? "" : "s"} take the 20-question pretest before setting a score expectation.`);
  if (dueTotal) actions.push(`Start with ${dueTotal} due remediation item${dueTotal === 1 ? "" : "s"} before fresh practice.`);
  if (unscheduled) actions.push(`Schedule the next session for ${unscheduled} student${unscheduled === 1 ? "" : "s"}.`);
  if (stuckSkills.length) actions.push(`${stuckSkills[0].studentName} is stuck on ${stuckSkills[0].skill}; assign learn 3 min -> targeted 10 -> proof 2 fresh this week.`);
  if (!totals.officialLogs && attemptedRows.length) actions.push("Log one Bluebook/official practice result this week.");
  if (totals.proofFailed > totals.proofPassed) actions.push("Ask for one proof redo before rewarding new volume.");
  if (!actions.length) actions.push("Keep the current schedule and check proof quality after the next timed set.");
  const expectation = diagnosticNeeded
    ? {
        label: "Diagnostic first",
        body: "Do not judge progress yet; get a baseline first, then compare the target gap.",
      }
    : dueTotal
      ? {
          label: "Repair before volume",
          body: `${dueTotal} due remediation item${dueTotal === 1 ? "" : "s"} should be cleared before assigning new sets.`,
        }
      : totals.proofFailed > totals.proofPassed
        ? {
            label: "Proof quality low",
            body: "Accuracy is not stable enough yet; require one clean proof on the weak skill.",
          }
        : !totals.questions && !totals.externalMinutes
          ? {
              label: "No activity this week",
              body: "Schedule one focused block, then check whether the student completes review, proof, and notes.",
            }
          : {
              label: "On pace this week",
              body: "Keep the current schedule and inspect proof quality after the next timed set.",
            };
  return {
    questions: totals.questions,
    accuracy,
    studyMinutes: totals.practiceMinutes + totals.externalMinutes,
    practiceMinutes: totals.practiceMinutes,
    externalMinutes: totals.externalMinutes,
    officialLogs: totals.officialLogs,
    proofPassed: totals.proofPassed,
    proofFailed: totals.proofFailed,
    qualitySignals: {
      slowCorrect: totals.slowCorrect,
      marked: totals.marked,
      proofPassRate: totals.proofPassed + totals.proofFailed ? Math.round((totals.proofPassed / (totals.proofPassed + totals.proofFailed)) * 100) : 0,
    },
    blockers,
    stuckSkills,
    expectation,
    parentActions: actions.slice(0, 4),
  };
}

function buildParentHomeStudentRow(row = {}) {
  const attempts = Number(row.attempts || 0);
  const targetScore = Number(row.targetScore || 0);
  const officialScore = Number(row.latestOfficialLog?.totalScore || 0);
  const baselineScore = Number(row.latestBaseline || 0);
  const currentScore = officialScore || baselineScore || 0;
  const targetGap = currentScore && targetScore ? Math.max(targetScore - currentScore, 0) : null;
  const currentScoreSource = officialScore ? "latest official" : baselineScore ? "baseline" : "";
  const needsDiagnostic = !baselineScore && !attempts;
  const due = Number(row.dueRemediation || 0);
  const open = Number(row.openMistakes || 0);
  const unscheduled = !row.nextSessionAt;
  const proofFailed = Number(row.proofFailed || 0);
  const proofRisk = proofFailed > Number(row.proofPassed || 0);
  const priority = needsDiagnostic ? "diagnostic" : due ? "due" : unscheduled ? "schedule" : proofRisk ? "proof" : "steady";
  const actionLabel =
    priority === "diagnostic"
      ? "Start diagnostic"
      : priority === "due"
      ? "Review due remediation"
      : priority === "schedule"
        ? "Set next session"
        : priority === "proof"
          ? "Check failed proof"
          : "Keep current plan";
  const weakFocus = row.topSubskill
    ? `${row.topSubskill.skill || "Subskill"} (${Number(row.topSubskill.accuracy || 0)}%)`
    : "";
  const lastActivityTimes = [row.latestAttemptAt, row.latestExternalLog?.at, row.latestOfficialLog?.at]
    .map((value) => Date.parse(value || ""))
    .filter(Number.isFinite);
  const lastActivityAt = lastActivityTimes.length ? new Date(Math.max(...lastActivityTimes)).toISOString() : "";
  return {
    ...row,
    priority,
    actionLabel,
    attempts,
    targetScore,
    needsDiagnostic,
    currentScore,
    targetGap,
    currentScoreSource,
    targetGapLabel: currentScore && targetScore ? (targetGap ? `${targetGap} points to target` : "Target reached") : "Need baseline",
    scoreLine: currentScore && targetScore ? `Current ${currentScore} -> Target ${targetScore}` : `Target ${targetScore || "--"} - diagnostic needed`,
    lastActivityLabel: lastActivityAt ? formatDateTime(lastActivityAt) : "No activity yet",
    openMistakes: open,
    dueRemediation: due,
    scheduleCaption: row.nextSessionAt ? `${Number(row.weeklyTarget || 0)} sessions/week` : "No next session set",
    weakFocus,
  };
}

function dueQuestionIdsForProfile(item = {}) {
  const now = Date.now();
  const dueIds = new Set();
  (Array.isArray(item.attempts) ? item.attempts : []).forEach((attempt) => {
    if (!attempt?.questionId) return;
    const dueAt = Date.parse(attempt.dueAt || "");
    if (!attempt.correct || (Number.isFinite(dueAt) && dueAt <= now)) {
      dueIds.add(attempt.questionId);
    }
  });
  (Array.isArray(item.bookmarks) ? item.bookmarks : []).forEach((id) => {
    if (id) dueIds.add(id);
  });
  return dueIds;
}

function renderDashboardTutorBrain() {
  if (!els.dashboardTutorBrain) return;
  const p = profile();
  const latest = latestPretest();
  const skillRows = buildSkillMatrix();
  const evaluation = buildRoadmapEvaluation(skillRows, p.roadmap || []);
  const readiness = buildEliteReadiness(skillRows, evaluation);
  const dueQueue = buildAdaptiveRemediationQueue({ includeFuture: false, includePassed: false, limit: 3 });
  const upcomingQueue = dueQueue.length ? dueQueue : buildAdaptiveRemediationQueue({ includeFuture: true, includePassed: false, limit: 1 });
  const report = latestPracticeSessionReport || p.practiceSessionReports?.[0] || null;
  const actions = buildTutorBrainActions({ latest, evaluation, readiness, dueQueue, upcomingQueue, report });
  const sevenDayPlan = SatRoadmapEngine.buildSevenDayStudyPlan({
    evaluation,
    readiness,
    remediationQueue: dueQueue.length ? dueQueue : upcomingQueue,
    latest,
  });

  els.dashboardTutorBrain.innerHTML = `
    <div class="tutor-brain-status">
      <article>
        <span>Readiness</span>
        <strong>${readiness.score}/100</strong>
        <small>${escapeHtml(readiness.band)}</small>
      </article>
      <article>
        <span>Confidence</span>
        <strong>${escapeHtml(evaluation.confidence.label)}</strong>
        <small>${escapeHtml(evaluation.confidence.detail)}</small>
      </article>
      <article>
        <span>Queue</span>
        <strong>${dueQueue.length}</strong>
        <small>${dueQueue.length ? "due now" : "no urgent due item"}</small>
      </article>
    </div>
    <div class="tutor-action-list">
      ${actions.map(renderTutorBrainAction).join("")}
    </div>
    <section class="tutor-week-plan" aria-label="Seven day tutor plan">
      <div class="tutor-week-heading">
        <div>
          <span class="pill">7-day plan</span>
          <h3>Gia sư tuần này</h3>
        </div>
        <p>Built from diagnostic signal, mistake queue, mastery, pacing, and content coverage.</p>
      </div>
      <div class="tutor-week-grid">
        ${sevenDayPlan.map(renderTutorPlanDay).join("")}
      </div>
    </section>
  `;
  bindTutorBrainActions();
}

function buildCoachDashboardModelForAccount(account = currentAccount()) {
  const students = account && ["admin", "parent"].includes(account.role) ? linkedStudentAccountsFor(account) : [];
  const studentProfilesById = {};
  students.forEach((student) => {
    studentProfilesById[student.id] = accountProfile(student.id);
  });
  return SatDashboardEngine.buildCoachDashboardModel
    ? SatDashboardEngine.buildCoachDashboardModel({
        account,
        students,
        studentProfilesById,
        questions: state.questions,
        questionAudits: state.questionAudits,
        integritySummary: questionIntegrityReport,
        nowMs: Date.now(),
        formatDate: formatDateTime,
      })
    : { visible: false };
}

function renderCoachDashboard(modelOverride = null) {
  if (!els.coachDashboardPanel) return;
  const model = modelOverride || buildCoachDashboardModelForAccount();
  const section = els.coachDashboardPanel.closest(".coach-dashboard-grid");
  if (section) section.hidden = !model.visible;
  els.coachDashboardPanel.innerHTML = SatViewRenderers.renderCoachDashboard ? SatViewRenderers.renderCoachDashboard(model) : "";
}

function renderAdminCenter() {
  if (!els.adminCenter) return;
  const model = buildAdminCenterModel();
  els.adminCenter.innerHTML = SatViewRenderers.renderAdminCenter ? SatViewRenderers.renderAdminCenter(model) : "";
  localizeDynamicUiText(els.adminCenter);
  bindAdminCenterActions();
}

function newsAudienceLabel(audience = "all") {
  const vi = state.language === "vi";
  const labels = vi
    ? { all: "Tất cả thành viên", student: "Học sinh", parent: "Phụ huynh", admin: "Admin" }
    : { all: "All members", student: "Students", parent: "Parents", admin: "Admins" };
  return labels[audience] || labels.all;
}

function newsStatusLabel(status = "published") {
  const vi = state.language === "vi";
  const labels = vi
    ? { published: "Đã đăng", draft: "Bản nháp", archived: "Đã lưu trữ" }
    : { published: "Published", draft: "Draft", archived: "Archived" };
  return labels[status] || labels.published;
}

function sortedNewsPosts(posts = []) {
  return [...posts].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return new Date(b.publishedAt || b.updatedAt || b.createdAt || 0) - new Date(a.publishedAt || a.updatedAt || a.createdAt || 0);
  });
}

function visibleNewsPostsForAccount(account = currentAccount()) {
  const posts = (state.newsPosts || []).map(normalizeNewsPost).filter(Boolean);
  if (isContentAdmin()) return sortedNewsPosts(posts);
  const role = account?.role || "student";
  return sortedNewsPosts(posts.filter((post) => post.status === "published" && (post.audience === "all" || post.audience === role)));
}

function renderStudentNewsCoachCards() {
  if (currentAccount()?.role !== "student") return "";
  const vi = state.language === "vi";
  const p = profile();
  const weak = getWeakSkills()[0];
  const missionSummary = buildStudentDailyMissionSummary(p);
  const latest = latestCompositePretest() || latestPretest();
  const score = latest?.scoreEstimate ? String(latest.scoreEstimate) : vi ? "chưa có" : "not set";
  const focusSkill = weak?.skill || (vi ? "làm diagnostic để tìm kỹ năng yếu" : "take a diagnostic to find the weakest skill");
  const focusBody = weak
    ? vi
      ? `Tuần này ưu tiên ${focusSkill}: sửa lỗi cũ, viết rule ngắn, rồi pass ít nhất 1 câu chứng minh cùng kỹ năng. Mức nền hiện tại: ${score}.`
      : `This week, prioritize ${focusSkill}: fix old mistakes, write a short rule, then pass at least 1 proof item in the same skill. Current baseline: ${score}.`
    : vi
      ? "Tuần này hãy lấy mức nền trước, sau đó hệ thống sẽ chọn 3 kỹ năng cần sửa đầu tiên."
      : "This week, get the baseline first; then the system will choose the first 3 skills to repair.";
  const achievementBody = missionSummary.complete
    ? vi
      ? `Hôm nay đã hoàn thành ${missionSummary.complete}/${missionSummary.total} nhiệm vụ học. Mốc tiếp theo là pass proof hoặc làm một sprint đúng kỹ năng yếu.`
      : `Today you completed ${missionSummary.complete}/${missionSummary.total} learning missions. Next milestone: pass a proof item or finish a sprint on the weak skill.`
    : vi
      ? "Chưa có thành tích mới hôm nay. Điểm thưởng chỉ nên đến từ sửa lỗi, proof, note và sprint có mục tiêu."
      : "No new achievement yet today. Reward points should come from fixing, proof, notes, and focused sprint work.";
  return `
    <article class="news-card coach-news pinned">
      <div class="news-card-main">
        <div class="news-meta">
          <span class="pill">${vi ? "Trọng tâm tuần" : "Weekly focus"}</span>
          <span class="pill">${vi ? "Học sinh" : "Students"}</span>
        </div>
        <h3>${escapeHtml(vi ? `Tuần này: ${focusSkill}` : `This week: ${focusSkill}`)}</h3>
        <p>${escapeHtml(focusBody)}</p>
      </div>
    </article>
    <article class="news-card coach-news">
      <div class="news-card-main">
        <div class="news-meta">
          <span class="pill">${vi ? "Thành tích" : "Achievement"}</span>
          <span class="pill">${escapeHtml(`${missionSummary.pct || 0}%`)}</span>
        </div>
        <h3>${escapeHtml(vi ? "Tiến độ học hôm nay" : "Today's learning progress")}</h3>
        <p>${escapeHtml(achievementBody)}</p>
      </div>
    </article>
  `;
}

function renderNews() {
  if (!els.newsList) return;
  const admin = isContentAdmin();
  if (els.newsAdminPanel) els.newsAdminPanel.hidden = !admin;
  if (els.newsSubmit) {
    els.newsSubmit.textContent = activeEditingNewsId
      ? state.language === "vi"
        ? "Lưu cập nhật"
        : "Save update"
      : state.language === "vi"
        ? "Đăng cập nhật"
        : "Publish update";
  }
  if (els.newsCancelEdit) els.newsCancelEdit.hidden = !activeEditingNewsId;
  const posts = visibleNewsPostsForAccount();
  const coachCards = !admin ? renderStudentNewsCoachCards() : "";
  const emptyText = admin
    ? state.language === "vi"
      ? "Chưa có tin tức."
      : "No news yet."
    : currentAccount()?.role === "student"
      ? state.language === "vi"
        ? "Chưa có thông báo. Hôm nay hãy tiếp tục nhiệm vụ trên Dashboard."
        : "No announcements yet. Continue today's task on Dashboard."
    : state.language === "vi"
      ? "Chưa có tin tức đã đăng."
      : "No published news yet.";
  const postHtml = posts.length ? posts.map((post) => renderNewsPost(post, admin)).join("") : "";
  els.newsList.innerHTML = coachCards || postHtml ? `${coachCards}${postHtml}` : `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
}

function renderNewsPost(post, admin = false) {
  const updatedLabel = formatDateTime(post.publishedAt || post.updatedAt || post.createdAt);
  const title = escapeHtml(post.title);
  const body = escapeHtml(post.body).replace(/\n/g, "<br>");
  const pinBadge = post.pinned ? `<span class="pill">${escapeHtml(state.language === "vi" ? "Đã ghim" : "Pinned")}</span>` : "";
  const actions = admin
    ? `
      <div class="news-card-actions">
        <button class="button secondary tiny" type="button" data-news-action="edit" data-news-id="${escapeHtml(post.id)}">${escapeHtml(state.language === "vi" ? "Sửa" : "Edit")}</button>
        <button class="button secondary tiny" type="button" data-news-action="${post.status === "archived" ? "republish" : "archive"}" data-news-id="${escapeHtml(post.id)}">${escapeHtml(post.status === "archived" ? (state.language === "vi" ? "Đăng lại" : "Republish") : (state.language === "vi" ? "Lưu trữ" : "Archive"))}</button>
        <button class="button danger tiny" type="button" data-news-action="delete" data-news-id="${escapeHtml(post.id)}">${escapeHtml(state.language === "vi" ? "Xóa" : "Delete")}</button>
      </div>
    `
    : "";
  return `
    <article class="news-card ${post.pinned ? "pinned" : ""} ${escapeHtml(post.status)}">
      <div class="news-card-main">
        <div class="news-meta">
          ${pinBadge}
          <span class="pill">${escapeHtml(newsStatusLabel(post.status))}</span>
          <span class="pill">${escapeHtml(newsAudienceLabel(post.audience))}</span>
          <span>${escapeHtml(updatedLabel)}</span>
        </div>
        <h3 class="news-user-content">${title}</h3>
        <p class="news-user-content">${body}</p>
      </div>
      ${actions}
    </article>
  `;
}

function saveNewsPost(event) {
  event.preventDefault();
  if (!isContentAdmin()) return;
  const title = els.newsTitle.value.trim();
  const body = els.newsBody.value.trim();
  if (!title || !body) {
    alert(state.language === "vi" ? "Cần nhập tiêu đề và nội dung tin." : "Title and message are required.");
    return;
  }
  const now = new Date().toISOString();
  const existing = activeEditingNewsId ? (state.newsPosts || []).find((post) => post.id === activeEditingNewsId) : null;
  const status = els.newsStatus.value || "published";
  const post = normalizeNewsPost({
    ...(existing || {}),
    id: existing?.id || `news-${Date.now()}`,
    title,
    body,
    audience: els.newsAudience.value || "all",
    status,
    pinned: Boolean(els.newsPinned.checked),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    publishedAt: status === "published" ? existing?.publishedAt || now : existing?.publishedAt || "",
    createdBy: existing?.createdBy || currentAccount()?.id || "content-admin",
    updatedBy: currentAccount()?.id || "",
  });
  if (!post) return;
  state.newsPosts = Array.isArray(state.newsPosts) ? state.newsPosts.filter((item) => item.id !== post.id) : [];
  state.newsPosts.push(post);
  activeEditingNewsId = "";
  resetNewsForm();
  saveState();
  renderNews();
  localizeDynamicUiText(els.newsAdminPanel);
}

function resetNewsForm() {
  if (!els.newsForm) return;
  els.newsForm.reset();
  if (els.newsStatus) els.newsStatus.value = "published";
  if (els.newsAudience) els.newsAudience.value = "all";
  if (els.newsId) els.newsId.value = "";
}

function cancelNewsEdit() {
  activeEditingNewsId = "";
  resetNewsForm();
  renderNews();
  localizeDynamicUiText(els.newsAdminPanel);
}

function beginNewsEdit(newsId) {
  const post = (state.newsPosts || []).find((item) => item.id === newsId);
  if (!post || !els.newsForm) return;
  activeEditingNewsId = post.id;
  els.newsId.value = post.id;
  els.newsTitle.value = post.title || "";
  els.newsAudience.value = post.audience || "all";
  els.newsStatus.value = post.status || "published";
  els.newsPinned.checked = Boolean(post.pinned);
  els.newsBody.value = post.body || "";
  renderNews();
  els.newsTitle.focus();
}

function handleNewsListAction(event) {
  const button = event.target.closest("[data-news-action]");
  if (!button || !isContentAdmin()) return;
  const newsId = button.dataset.newsId || "";
  const action = button.dataset.newsAction;
  const post = (state.newsPosts || []).find((item) => item.id === newsId);
  if (!post) return;
  if (action === "edit") {
    beginNewsEdit(newsId);
    return;
  }
  if (action === "delete") {
    const ok = confirm(state.language === "vi" ? "Xóa tin này?" : "Delete this update?");
    if (!ok) return;
    state.newsPosts = state.newsPosts.filter((item) => item.id !== newsId);
    if (activeEditingNewsId === newsId) activeEditingNewsId = "";
  } else if (action === "archive") {
    post.status = "archived";
    post.updatedAt = new Date().toISOString();
    post.updatedBy = currentAccount()?.id || "";
  } else if (action === "republish") {
    post.status = "published";
    post.publishedAt = new Date().toISOString();
    post.updatedAt = post.publishedAt;
    post.updatedBy = currentAccount()?.id || "";
  }
  saveState();
  renderNews();
  localizeDynamicUiText(els.newsList);
}

function questionAuditEntriesSnapshot() {
  const audits = state.questionAudits && typeof state.questionAudits === "object" ? state.questionAudits : {};
  return Object.entries(audits).flatMap(([questionId, entries]) =>
    (Array.isArray(entries) ? entries : []).map((entry) => ({ questionId, ...entry })),
  );
}

function openQuestionAuditEntriesSnapshot() {
  return questionAuditEntriesSnapshot().filter((entry) => !["resolved", "closed", "passed", "dismissed"].includes(entry.status || "open"));
}

function publicManifestContext(overrides = {}) {
  const summary = questionIntegrityReport?.summary || {};
  const criticalCount = Number(summary.criticalQuestionCount ?? summary.criticalIssueCount ?? 0);
  const openAuditEntries = overrides.openAuditEntries !== undefined ? Number(overrides.openAuditEntries || 0) : openQuestionAuditEntriesSnapshot().length;
  return {
    integrityLoaded: Boolean(questionIntegrityReport),
    criticalCount,
    openAuditEntries,
    questionAudits: state.questionAudits,
    ...overrides,
  };
}

function buildCurrentPublicManifest(overrides = {}) {
  if (!SatPublicManifestEngine.buildPublicManifest) {
    return { releaseGate: { ready: false, label: "Public release blocked", detail: "Public manifest engine is not loaded.", blockers: [] }, manifestReadyCount: 0 };
  }
  return SatPublicManifestEngine.buildPublicManifest(state.questions || [], publicManifestContext(overrides));
}

function buildAdminCenterModel() {
  const { adminReleaseText, buildAdminContentHeatmap, buildAdminQueue, firstAdminCount, isAdminBankHydrated } = SatContentAdminEngine;
  const account = currentAccount();
  const isAdmin = isContentAdmin();
  const summary = questionIntegrityReport?.summary || {};
  const readiness = sat2026ReadinessReport || {};
  const inventory = readiness.inventory || {};
  const questions = state.questions || [];
  const expertInventory = reviewedExpertAuditReport?.inventory || {};
  const reportLoaded = Boolean(questionIntegrityReport?.summary);
  const readinessLoaded = Boolean(sat2026ReadinessReport?.inventory);
  const expertLoaded = Boolean(reviewedExpertAuditReport?.inventory);
  const auditedTotal = firstAdminCount(summary.totalQuestions, inventory.loadedTotal, expertInventory.reviewedTotal);
  const browserLoaded = questions.length;
  const bankHydrated = isAdminBankHydrated(auditedTotal, browserLoaded);
  const accounts = Array.isArray(state.accounts) ? state.accounts : [];
  const profiles = state.profiles && typeof state.profiles === "object" ? state.profiles : {};
  const openAuditEntries = openQuestionAuditEntriesSnapshot();
  const openAuditIds = new Set(openAuditEntries.map((entry) => entry.questionId));

  const reviewedQuestions = questions.filter((q) => q.reviewStatus === "reviewed");
  const pendingReviewQuestions = questions.filter((q) => q.reviewStatus === "needs_review" || !q.reviewStatus);
  const rejectedQuestions = questions.filter((q) => q.reviewStatus === "rejected");
  const blockedQuestions = questions.filter(
    (q) => ["audit_blocked", "rejected", "blocked", "intake_blocked"].includes(q.publicationStatus) || q.auditStatus === "blocked" || q.reviewStatus === "rejected",
  );
  const publicCandidates = questions.filter((q) => q.visibility === "public_candidate");
  const publicReady = publicCandidates.filter(
    (q) => q.reviewStatus === "reviewed" && String(q.publicationStatus || "").startsWith("public_candidate") && q.auditStatus !== "blocked",
  );
  const publicPending = publicCandidates.filter((q) => q.reviewStatus !== "reviewed");
  const privateFamily = questions.filter((q) => q.visibility === "private_family");
  const vaultItems = questions.filter((q) => q.sourceType === "private_vault" || String(q.id || "").startsWith("vault-"));
  const generatedNeedsReview = questions.filter((q) => ["ai_generated", "antigravity"].includes(q.sourceType) && q.reviewStatus !== "reviewed");
  const highRiskPublicCandidates = publicCandidates.filter((q) => {
    const signal = String(q.sourceSignalId || q.sourceReference || q.sourceName || "").toLowerCase();
    return q.sourceType === "private_vault" || signal.includes("archive") || signal.includes("kaplan") || signal.includes("cracksat");
  });
  const fileBackedQuestions = questions.filter((q) => ["opensat", "foundation", "antigravity", "sat_king", "sat_1590"].includes(q.sourceType));
  const localDrafts = questions.filter((q) => ["original", "ai_generated", "private_vault"].includes(q.sourceType));
  const originalDrafts = questions.filter((q) => q.sourceType === "original").length;
  const studentPreview = accounts.find((item) => item.role === "student" && item.id !== account?.id) || null;
  const parentPreview =
    accounts.find(
      (item) =>
        item.role === "parent" &&
        accounts.some((student) => student.role === "student" && Array.isArray(student.parentIds) && student.parentIds.includes(item.id)),
    ) || accounts.find((item) => item.role === "parent") || null;
  const roleCounts = accounts.reduce(
    (counts, item) => {
      counts.total += 1;
      if (item.role === "admin") counts.admins += 1;
      if (item.role === "parent") counts.parents += 1;
      if (item.role === "student") counts.students += 1;
      if (item.scope === "public") counts.publicLearners += 1;
      else counts.familyAccounts += 1;
      if (!profiles[item.id]) counts.missingProfiles += 1;
      if (item.role === "student" && item.scope !== "public" && !(Array.isArray(item.parentIds) && item.parentIds.length)) counts.unlinkedStudents += 1;
      return counts;
    },
    { total: 0, admins: 0, parents: 0, students: 0, publicLearners: 0, familyAccounts: 0, missingProfiles: 0, unlinkedStudents: 0 },
  );
  const criticalCount = Number(summary.criticalQuestionCount ?? summary.criticalIssueCount ?? 0);
  const systemHealthReady = Boolean(questionIntegrityReport) && criticalCount === 0;
  const publicManifest = buildCurrentPublicManifest({ criticalCount, openAuditEntries: openAuditEntries.length });

  const criticalRows = Array.isArray(questionIntegrityReport?.criticalRows) ? questionIntegrityReport.criticalRows : [];
  const blockedRows = Array.isArray(questionIntegrityReport?.blockedRows) ? questionIntegrityReport.blockedRows : [];
  const warningRows = Array.isArray(questionIntegrityReport?.warningRows) ? questionIntegrityReport.warningRows : [];
  const topicPlan = Object.entries(questionIntegrityReport?.topicGovernancePlan || {})
    .map(([topic, data]) => ({
      topic,
      overflowCount: Number(data?.overflowCount || 0),
      visibleCount: Number(data?.visibleCount || 0),
      action: data?.recommendedAction || "review",
      sampleIds: Array.isArray(data?.sampleIds) ? data.sampleIds.slice(0, 3) : [],
    }))
    .sort((a, b) => b.overflowCount - a.overflowCount || b.visibleCount - a.visibleCount)
    .slice(0, 5);
  const domainActionRows = Array.isArray(readiness.balancePlan?.domainActions) ? readiness.balancePlan.domainActions : [];
  const allAttempts = Object.values(profiles).flatMap((profileRow) => (Array.isArray(profileRow?.attempts) ? profileRow.attempts : []));
  const itemAnalytics =
    typeof SatItemAnalyticsEngine !== "undefined" && SatItemAnalyticsEngine.buildItemAnalytics
      ? SatItemAnalyticsEngine.buildItemAnalytics({ attempts: allAttempts, questions })
      : {};
  const queue = buildAdminQueue({
    openAuditEntries,
    openAuditIds,
    pendingReviewQuestions,
    generatedNeedsReview,
    publicPending,
    highRiskPublicCandidates,
    publicManifest,
    criticalRows,
    blockedRows,
    domainActionRows,
    warningRows,
  });
  const curriculum = SatContentAdminEngine.buildContentAdminCommandModel
    ? SatContentAdminEngine.buildContentAdminCommandModel({
        readiness,
        integrityReport: questionIntegrityReport || {},
        expertAudit: reviewedExpertAuditReport || {},
        questions,
        itemAnalytics,
      })
    : null;
  const reportReviewed = firstAdminCount(expertInventory.reviewedTotal, inventory.nonBlockedForStudy, bankHydrated ? reviewedQuestions.length : null);
  const coreReadyReviewed = firstAdminCount(inventory.coreReadyReviewed, expertInventory.reviewedCoreVisible, bankHydrated ? reviewedQuestions.length : null);
  const pendingReviewTotal = reportLoaded || readinessLoaded ? Number(inventory.needsReviewOrContentAuditNotPass || 0) : null;
  const blockedTotal = reportLoaded || readinessLoaded ? Number(inventory.blockedOrRejected || summary.blockedSourceQuestionCount || 0) : null;
  const publicReadyTrusted = bankHydrated ? firstAdminCount(publicManifest.manifestReadyCount, inventory.publicCandidateReadyReviewed) : firstAdminCount(inventory.publicCandidateReadyReviewed, publicManifest.manifestReadyCount);
  const publicBlockedTrusted = bankHydrated ? Number(publicManifest.blockedPublicCandidateCount || 0) : null;
  const dataConfidence = {
    ready: reportLoaded && readinessLoaded,
    bankHydrated,
    source: reportLoaded && readinessLoaded ? "audit_reports" : reportLoaded || readinessLoaded ? "partial_reports" : "browser_loading",
    label:
      reportLoaded && readinessLoaded
        ? "Số liệu report đã tải"
        : reportLoaded || readinessLoaded
          ? "Số liệu report đang tải thêm"
          : "Đang tải report kiểm định",
    detail: bankHydrated
      ? "Browser đã hydrate gần đủ bank; số public có thể kiểm tra trực tiếp."
      : `Browser mới hydrate ${browserLoaded}/${auditedTotal || "--"} câu; không dùng số browser làm tổng hệ thống.`,
  };
  const contentPlanner = buildAdminContentHeatmap(readiness, questions, auditedTotal || 0);

  return {
    visible: isAdmin,
    accountName: account?.name || "",
    release: {
      ready: systemHealthReady,
      label: questionIntegrityReport ? (systemHealthReady ? "Hệ thống sạch blocker" : "Cần xử lý blocker hệ thống") : "Đang tải report admin",
      detail: questionIntegrityReport
        ? `${auditedTotal ?? "--"} câu trong report, ${reportReviewed ?? "--"} đã duyệt, ${pendingReviewTotal ?? 0} cần review, ${roleCounts.total} tài khoản.`
        : "Admin Center đang tải validator, readiness và expert audit trước khi hiển thị tổng bank.",
    },
    publicRelease: {
      ready: Boolean(publicManifest.releaseGate?.ready),
      label: adminReleaseText(publicManifest.releaseGate?.label || "Public release blocked"),
      detail: adminReleaseText(publicManifest.releaseGate?.detail || ""),
      manifestReady: publicReadyTrusted,
      publicCandidates: Number(publicManifest.publicCandidateCount || 0),
      blockedCandidates: publicBlockedTrusted,
      sourceSigned: Number(publicManifest.sourceSignedCount || 0),
      sourceUnsigned: Number(publicManifest.sourceUnsignedCount || 0),
      openAuditEntries: openAuditEntries.length,
      critical: criticalCount,
      blockers: (publicManifest.releaseGate?.blockers || []).map((item) => ({ ...item, label: adminReleaseText(item.label || item.id || "") })),
      checks: (publicManifest.releaseGate?.checks || []).map((item) => ({ ...item, label: adminReleaseText(item.label || item.id || "") })),
    },
    metrics: [
      { label: "Người dùng", value: roleCounts.total, detail: `${roleCounts.students} học sinh, ${roleCounts.parents} phụ huynh`, tone: "neutral" },
      { label: "Toàn bank", value: auditedTotal, detail: dataConfidence.label, tone: dataConfidence.ready ? "ok" : "warn" },
      { label: "Đã duyệt", value: reportReviewed, detail: "scope: reviewed trong expert/integrity report", tone: "ok" },
      { label: "Cần review", value: pendingReviewTotal, detail: "scope: toàn bank, không phải filter hiện tại", tone: pendingReviewTotal ? "warn" : "ok" },
      { label: "Bị chặn", value: blockedTotal, detail: "rejected/audit/intake theo report", tone: blockedTotal ? "warn" : "ok" },
      {
        label: "Sẵn sàng public",
        value: publicReadyTrusted,
        detail: bankHydrated ? `${Number(publicManifest.blockedPublicCandidateCount || 0)} câu public bị chặn` : "scope: readiness report; chờ browser hydrate để export",
        tone: publicManifest.releaseGate?.ready ? "ok" : "warn",
      },
    ],
    queue,
    users: {
      total: roleCounts.total,
      admins: roleCounts.admins,
      parents: roleCounts.parents,
      students: roleCounts.students,
      publicLearners: roleCounts.publicLearners,
      familyAccounts: roleCounts.familyAccounts,
      unlinkedStudents: roleCounts.unlinkedStudents,
      missingProfiles: roleCounts.missingProfiles,
    },
    questions: {
      total: auditedTotal,
      browserLoaded,
      approved: reportReviewed,
      pending: pendingReviewTotal,
      rejected: rejectedQuestions.length,
      blocked: blockedTotal,
      publicCandidates: publicCandidates.length,
      publicReady: publicReadyTrusted,
      publicPending: publicBlockedTrusted,
      generatedNeedsReview: generatedNeedsReview.length,
      openAuditQuestions: openAuditIds.size,
      openAuditEntries: openAuditEntries.length,
      fileBacked: fileBackedQuestions.length,
      localDrafts: localDrafts.length,
      originalDrafts,
    },
    firewall: {
      publicCandidates: publicCandidates.length,
      manifestReady: Number(publicManifest.manifestReadyCount || 0),
      privateFamily: privateFamily.length,
      vaultItems: vaultItems.length,
      blockedAudit: blockedQuestions.length,
      blockedPublicCandidates: Number(publicManifest.blockedPublicCandidateCount || 0),
      sourceUnsigned: Number(publicManifest.sourceUnsignedCount || 0),
      highRiskPublicCandidates: highRiskPublicCandidates.length,
    },
    system: {
      reportLoaded,
      readinessLoaded,
      expertLoaded,
      dataConfidence,
      critical: criticalCount,
      blockedRows: Number(summary.blockedSourceQuestionCount || blockedRows.length || 0),
      warnings: Number(summary.warningQuestionCount || warningRows.length || 0),
      warningIssues: Number(summary.warningIssueCount || 0),
      repeatedTopics: Number(summary.overrepresentedTopicCount || topicPlan.length || 0),
      loadedTotal: auditedTotal,
      coreReadyReviewed,
    },
    curriculum,
    contentPlanner,
    actions: [
      { label: "Duyệt queue", targetView: "bank" },
      { label: "Bank Manager", targetView: "bank" },
      { label: "Tạo câu", targetView: "author" },
      { label: "Tài khoản", targetView: "accounts" },
    ],
    rolePreview: {
      parent: parentPreview
        ? {
            accountId: parentPreview.id,
            name: parentPreview.name || "Parent",
            childCount: accounts.filter((student) => student.role === "student" && Array.isArray(student.parentIds) && student.parentIds.includes(parentPreview.id)).length,
          }
        : null,
      student: studentPreview ? { accountId: studentPreview.id, name: studentPreview.name || "Student" } : null,
    },
  };
}

function bindAdminCenterActions() {
  document.querySelectorAll(".admin-action-button[data-admin-target]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.adminTarget));
  });
  document.querySelectorAll(".admin-impersonate-button[data-admin-account-target]").forEach((button) => {
    button.addEventListener("click", () => switchAdminPreviewAccount(button.dataset.adminAccountTarget));
  });
  document.querySelectorAll(".admin-scroll-button[data-admin-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.adminScrollTarget || "");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    });
  });
  const manifestExport = document.getElementById("admin-export-public-manifest");
  if (manifestExport) {
    manifestExport.addEventListener("click", exportPublicManifestArtifact);
  }
  const reload = document.getElementById("admin-load-reports");
  if (reload) {
    reload.addEventListener("click", () => {
      ensureQuestionIntegrityReport(true);
      ensureSat2026ReadinessReport(true);
      ensureReviewedExpertAuditReport(true);
      ensureArchiveRegistry(true);
    });
  }
}

function downloadJsonPayload(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function savePublicContentPackageToBackend(manifest, context = {}) {
  const backend = publicBackendState();
  const canAdmin = backend.account && ["admin", "content_admin"].includes(backend.account.role);
  if (!publicBackendToken() || !canAdmin || !SatPublicApi.saveContentPackage || typeof SatContentPackageEngine === "undefined") return null;
  if (!manifest?.releaseGate?.ready) {
    setPublicBackendStatus("warning", "Content package not saved", "Public release gate is still blocked; exported the audit artifact only.", { baseUrl: publicBackendBaseUrl() });
    return null;
  }
  const generatedAt = context.exportedAt || context.nowIso || new Date().toISOString();
  const contentPackage = SatContentPackageEngine.buildPublicContentPackage(state.questions || [], { manifest, generatedAt, revision: questionBankRevision });
  if (!contentPackage.items?.length) {
    setPublicBackendStatus("warning", "Content package empty", "No manifest-ready public questions were available to save.", { baseUrl: publicBackendBaseUrl() });
    return null;
  }
  const saved = await SatPublicApi.saveContentPackage(publicBackendToken(), contentPackage, { baseUrl: publicBackendBaseUrl(), scope: "public" });
  setPublicBackendStatus("ok", "Public content package saved", `Saved ${contentPackage.items.length} learner-ready questions to backend.`, {
    baseUrl: publicBackendBaseUrl(), ...SatContentPackageEngine.backendStatusPatch({ ...saved, package: contentPackage }, "admin_export"),
  });
  return saved;
}

async function exportPublicManifestArtifact() {
  if (!isContentAdmin()) return alert("Only Content Admin can export the public manifest artifact.");
  if (!SatPublicManifestEngine.buildPublicManifestArtifact) return alert("Public manifest artifact exporter is not loaded.");
  const exportedAt = new Date().toISOString();
  const context = publicManifestContext({ nowIso: exportedAt, exportedAt });
  const manifest = buildCurrentPublicManifest(context);
  const artifact = SatPublicManifestEngine.buildPublicManifestArtifact(state.questions || [], { ...context, manifest });
  downloadJsonPayload(artifact, `sat-studio-public-manifest-${artifact.exportStatus}-${exportedAt.slice(0, 10)}.json`);
  try {
    await savePublicContentPackageToBackend(manifest, context);
  } catch (error) {
    setPublicBackendStatus("warning", "Content package save failed", error.message || "Manifest artifact downloaded, but backend content package was not saved.", { baseUrl: publicBackendBaseUrl() });
  }
}

function switchAdminPreviewAccount(accountId) {
  const admin = currentAccount();
  if (!isContentAdmin() || !accountId) return;
  const target = state.accounts.find((item) => item.id === accountId);
  if (!target || target.id === admin?.id || !["parent", "student"].includes(target.role)) return;
  state.activeAccountId = target.id;
  activeView = defaultViewForAccount(target);
  // Role preview is intentionally session-only; saving here can serialize the full admin-loaded bank.
  renderAuth();
}

function buildTutorBrainActions({ latest, evaluation, readiness, dueQueue, upcomingQueue, report }) {
  const actions = [];
  if (!latest) {
    actions.push({
      label: "Baseline",
      title: "Run Preview Diagnostic",
      body: "Get the first signal before trusting any roadmap.",
      targetView: "pretest",
      button: "Start",
      priority: "critical",
    });
  }

  const queueItem = dueQueue[0] || upcomingQueue[0];
  if (queueItem) {
    actions.push({
      label: queueItem.status || "Review",
      title: queueItem.lessonTitle || `Review ${queueItem.skill}`,
      body: `${queueItem.action || "Read the lesson, then pass a proof question."} Due ${formatDate(queueItem.dueAt)}.`,
      targetView: "review",
      button: "Open Review",
      priority: dueQueue.length ? "critical" : "normal",
    });
  }

  const priority = evaluation.priorityRows?.[0];
  if (priority) {
    actions.push({
      label: priority.masteryStage || priority.status,
      title: `Teach ${priority.skill}`,
      body: `${priority.action}. Exit: ${masteryStageExit(priority.masteryStage)}.`,
      targetView: "lessons",
      lessonKey: lessonScopeKey(priority),
      button: "Open Lesson",
      priority: "normal",
    });
  }

  if (report?.coachPlan?.nextBestAction) {
    actions.push({
      label: report.mode || "Last session",
      title: "Use last report",
      body: report.coachPlan.nextBestAction,
      targetView: "practice",
      button: "Practice",
      priority: "normal",
    });
  }

  const thinCoverage = readiness.coverage?.thin?.[0];
  if (thinCoverage) {
    actions.push({
      label: "Content gap",
      title: `Strengthen ${thinCoverage.label}`,
      body: `Only ${thinCoverage.count}/${thinCoverage.target} active items. Add reviewed originals before relying on this skill for 1600 prep.`,
      targetView: "sources",
      button: "Sources",
      priority: "normal",
    });
  }

  if (!actions.length) {
    actions.push({
      label: "Maintenance",
      title: "Hard timed proof",
      body: "Run a hard sprint, then review every slow or marked item before fresh practice.",
      targetView: "practice",
      button: "Practice",
      priority: "normal",
    });
  }

  return actions.slice(0, 4);
}

function renderTutorBrainAction(action) {
  return `
    <article class="tutor-action-card ${action.priority === "critical" ? "critical" : ""}">
      <div>
        <span class="pill">${escapeHtml(labelFor(action.label))}</span>
        <h3>${escapeHtml(action.title)}</h3>
        <p>${escapeHtml(action.body)}</p>
      </div>
      <button
        class="button secondary tutor-action-button"
        type="button"
        data-view-target="${escapeHtml(action.targetView || "roadmap")}"
        data-lesson-key="${escapeHtml(action.lessonKey || "")}"
      >${escapeHtml(action.button || "Open")}</button>
    </article>
  `;
}

function renderTutorPlanDay(item) {
  return `
    <article class="tutor-plan-day ${item.priority === "critical" ? "critical" : item.priority === "high" ? "high" : ""}">
      <div>
        <span>Day ${item.day} · ${escapeHtml(formatDate(item.date))} · ${Number(item.minutes) || 20} min</span>
        <strong>${escapeHtml(item.focus)}</strong>
        <p>${escapeHtml(item.action)}</p>
      </div>
      <button class="button secondary tutor-action-button" type="button" data-view-target="${escapeHtml(item.targetView || "roadmap")}">Open</button>
    </article>
  `;
}

function bindTutorBrainActions() {
  document.querySelectorAll(".tutor-action-button").forEach((button) => {
    button.addEventListener("click", () => {
      const targetView = button.dataset.viewTarget || "roadmap";
      const lessonKey = button.dataset.lessonKey || "";
      if (lessonKey) activeLessonKey = lessonKey;
      switchView(targetView);
      if (targetView === "pretest") startPretest("preview");
    });
  });
}

function renderRewards() {
  const p = profile();
  const model = SatDashboardEngine.buildRewardModel
    ? SatDashboardEngine.buildRewardModel({
        profile: p,
        rewardCatalog: [...rewardCatalog, ...achievementCatalog],
        todayKey: todayKey(),
        labels: {
          ...dailyQuestLabels(),
          hiddenAchievement: optionalTranslation("hiddenAchievement", "Hidden achievement"),
          hiddenAchievementHint: optionalTranslation("hiddenAchievementHint", "Keep studying to reveal this badge."),
          unlocked: t("unlocked"),
          pointsToUnlock: t("pointsToUnlock"),
        },
      })
    : { points: 0, streak: 0, todayAnswers: 0, levelLabel: "L1", progress: 0, stickerShelf: [], quests: [], rewardBoard: [] };

  els.attendancePoints.textContent = model.points;
  els.attendanceStreak.textContent = model.streak;
  els.todayAnswers.textContent = model.todayAnswers;
  els.rewardLevel.textContent = model.levelLabel;
  if (els.journeyTitle) els.journeyTitle.textContent = `${model.journeyTitle || "SAT Journey"} - next ${model.nextLevelLabel || "level"}`;
  els.levelProgress.style.width = `${model.progress}%`;
  els.stickerShelf.innerHTML = SatViewRenderers.renderStickerShelf ? SatViewRenderers.renderStickerShelf(model.stickerShelf) : "";
  els.dailyQuests.innerHTML = SatViewRenderers.renderDailyQuests ? SatViewRenderers.renderDailyQuests(model.quests) : "";
  els.rewardBoard.innerHTML = SatViewRenderers.renderRewardBoard ? SatViewRenderers.renderRewardBoard(model.rewardBoard) : "";
  renderStudentRewardStore();
}

function rewardAvailablePoints(accountId = currentAccount()?.id) {
  const p = accountProfile(accountId);
  const attendance = p.attendance || emptyProfile().attendance;
  return Math.max(0, Number(attendance.points || 0) - Number(attendance.spentPoints || 0));
}

function rewardProgramsForStudent(student = currentAccount()) {
  if (!student || student.role !== "student") return [];
  return (state.rewardPrograms || [])
    .map(normalizeRewardProgram)
    .filter(Boolean)
    .filter((program) => {
      if (program.status !== "active") return false;
      if (program.scope === "global") return true;
      if (program.targetStudentIds.length) return program.targetStudentIds.includes(student.id);
      return Array.isArray(student.parentIds) && student.parentIds.includes(program.ownerAccountId);
    })
    .sort((a, b) => a.costPoints - b.costPoints || a.title.localeCompare(b.title));
}

function rewardClaimsForStudent(studentId = currentAccount()?.id) {
  return (state.rewardClaims || []).map(normalizeRewardClaim).filter(Boolean).filter((claim) => claim.studentId === studentId);
}

function renderStudentRewardStore() {
  if (!els.studentRewardStore) return;
  const account = currentAccount();
  if (account?.role !== "student") {
    els.studentRewardStore.innerHTML = "";
    return;
  }
  const available = rewardAvailablePoints(account.id);
  const claims = rewardClaimsForStudent(account.id);
  const pendingIds = new Set(claims.filter((claim) => claim.status === "pending").map((claim) => claim.programId));
  const fulfilled = claims.filter((claim) => claim.status === "fulfilled").slice(-3).reverse();
  const programs = rewardProgramsForStudent(account);
  if (!programs.length) {
    els.studentRewardStore.innerHTML = '<div class="empty-state">No reward program is active yet.</div>';
    return;
  }
  els.studentRewardStore.innerHTML = `
    <div class="reward-store-balance"><strong>${available}</strong><span>available points</span></div>
    <div class="reward-store-grid">
      ${programs
        .map((program) => {
          const affordable = available >= program.costPoints;
          const pending = pendingIds.has(program.id);
          return `
            <article class="reward-program-card ${affordable ? "affordable" : ""}">
              <div>
                <span class="pill">${escapeHtml(labelFor(program.rewardType))}</span>
                <h3>${escapeHtml(program.title)}</h3>
                <p>${escapeHtml(program.description || "Parent/admin reward")}</p>
              </div>
              <div class="reward-program-footer">
                <strong>${Number(program.costPoints)} pts</strong>
                <button class="button tiny ${affordable && !pending ? "primary" : "secondary"}" type="button" data-reward-action="redeem" data-reward-id="${escapeHtml(program.id)}" ${
                  affordable && !pending ? "" : "disabled"
                }>${pending ? "Pending" : affordable ? "Redeem" : "Locked"}</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
    ${
      fulfilled.length
        ? `<div class="reward-claim-history"><strong>Recently fulfilled</strong>${fulfilled
            .map((claim) => {
              const program = (state.rewardPrograms || []).find((item) => item.id === claim.programId);
              return `<span>${escapeHtml(program?.title || claim.programId)} - ${escapeHtml(formatDate(claim.fulfilledAt || claim.requestedAt))}</span>`;
            })
            .join("")}</div>`
        : ""
    }
  `;
  localizeDynamicUiText(els.studentRewardStore);
}

function handleStudentRewardAction(event) {
  const button = event.target.closest("[data-reward-action]");
  if (!button || button.dataset.rewardAction !== "redeem") return;
  redeemRewardProgram(button.dataset.rewardId || "");
}

function redeemRewardProgram(programId = "") {
  const account = currentAccount();
  if (account?.role !== "student") return;
  const program = rewardProgramsForStudent(account).find((item) => item.id === programId);
  if (!program) return;
  const available = rewardAvailablePoints(account.id);
  if (available < program.costPoints) {
    alert("Not enough available points yet.");
    return;
  }
  if ((state.rewardClaims || []).some((claim) => claim.programId === program.id && claim.studentId === account.id && claim.status === "pending")) {
    alert("This reward is already pending parent/admin fulfillment.");
    return;
  }
  const p = accountProfile(account.id);
  const attendance = p.attendance || emptyProfile().attendance;
  attendance.spentPoints = Number(attendance.spentPoints || 0) + Number(program.costPoints || 0);
  const claim = normalizeRewardClaim({
    programId: program.id,
    studentId: account.id,
    requestedBy: account.id,
    costPoints: program.costPoints,
    requestedAt: new Date().toISOString(),
  });
  if (!Array.isArray(state.rewardClaims)) state.rewardClaims = [];
  state.rewardClaims.unshift(claim);
  attendance.rewardRedemptions = Array.isArray(attendance.rewardRedemptions) ? attendance.rewardRedemptions : [];
  attendance.rewardRedemptions.unshift(claim.id);
  p.attendance = attendance;
  saveState();
  renderRewards();
  renderAccounts();
}

function renderExternalLearningDashboard() {
  if (!els.khanProfileLink) return;
  const model = SatDashboardEngine.buildExternalLearningModel
    ? SatDashboardEngine.buildExternalLearningModel(profile())
    : {
        khanInput: "",
        bluebookInput: "",
        khanUrl: "https://www.khanacademy.org/test-prep/digital-sat",
        bluebookUrl: "https://bluebook.collegeboard.org/students/practice",
        logs: [],
      };

  els.khanProfileLink.value = model.khanInput;
  els.bluebookLink.value = model.bluebookInput;
  els.openKhanProfile.href = model.khanUrl;
  els.openBluebookLink.href = model.bluebookUrl;
  els.externalStudyList.innerHTML = renderExternalStudyLogs(model.logs);
}

function renderExternalStudyLogs(logs) {
  if (SatViewRenderers.renderExternalStudyLogs) return SatViewRenderers.renderExternalStudyLogs(logs, { formatDate });
  if (!logs.length) {
    return '<div class="empty-state">No outside study logged yet. Log Khan or Bluebook work to count it toward attendance.</div>';
  }
  return logs
    .slice(0, 5)
    .map(
      (log) => `
        <article class="external-study-item">
          <div>
            <strong>${escapeHtml(log.source)} · ${Number(log.minutes || 0)} min</strong>
            <span>${escapeHtml(log.topic || "General SAT study")} · ${escapeHtml(formatDate(log.at))}</span>
          </div>
          <p>${escapeHtml(log.note || "No note.")}</p>
        </article>
      `,
    )
    .join("");
}

function saveExternalLinks() {
  const p = profile();
  const khan = els.khanProfileLink.value.trim();
  const bluebook = els.bluebookLink.value.trim();
  if ((khan && !isSafeHttpUrl(khan)) || (bluebook && !isSafeHttpUrl(bluebook))) {
    els.externalLinkStatus.innerHTML = "<strong>Links were not saved.</strong><span>Use full http or https URLs only.</span>";
    return;
  }
  p.externalLinks = {
    khan,
    bluebook: bluebook || "https://bluebook.collegeboard.org/students/practice",
  };
  saveState();
  renderExternalLearningDashboard();
  els.externalLinkStatus.innerHTML = "<strong>Saved.</strong><span>These links stay local in this browser profile.</span>";
}

function logExternalStudy() {
  const p = profile();
  const minutes = Math.max(1, Math.min(240, Number(els.externalLogMinutes.value || 0)));
  const topic = els.externalLogTopic.value.trim();
  const source = els.externalLogSource.value;
  const note = els.externalLogNote.value.trim();
  p.externalStudyLogs.unshift({
    id: `external-${Date.now()}`,
    source,
    minutes,
    topic,
    note,
    at: new Date().toISOString(),
  });
  updateStreak();
  awardAttendancePoints({
    externalMinutes: minutes,
    points: Math.min(20, Math.max(3, Math.round(minutes / 5))),
  });
  els.externalLogTopic.value = "";
  els.externalLogNote.value = "";
  saveState();
  renderDashboard();
}

function handleNextAction() {
  const latest = latestPretest();
  if (!latest) {
    switchView("pretest");
    startPretest("preview");
    return;
  }
  if (getDueQuestionIds().length) {
    startDueReview();
    return;
  }
  switchView("roadmap");
}

function latestPretest() {
  return profile().pretests[0] || null;
}

function latestCompositePretest() {
  return (profile().pretests || []).find((test) => test.scoreScope !== "section_only") || null;
}

function diagnosticScoreLabel(test) {
  if (!test) return "--";
  const bandLabel = test.scoreBand?.label || "";
  const confidence = test.scoreBand?.confidence ? ` (${labelFor(test.scoreBand.confidence)})` : "";
  if (test.scoreScope === "section_only") {
    const section = (test.sectionsTested || [])[0] || "Section";
    return `${labelFor(section)} ${bandLabel || test.scoreEstimate || "--"}${bandLabel ? confidence : ""}`;
  }
  return `${state.language === "vi" ? "M\u1ee9c n\u1ec1n" : "Baseline"} ${bandLabel || test.scoreEstimate || "--"}${bandLabel ? confidence : ""}`;
}

function formatSectionScore(value, band = null) {
  if (band?.label) return `${band.label}${band.confidence ? ` (${labelFor(band.confidence)})` : ""}`;
  return value === null || value === undefined ? "--" : String(value);
}

async function startPretest(mode = "preview") {
  const p = profile();
  const meta = testModeMeta[mode] || testModeMeta.preview;
  await ensureDiagnosticBank(meta);
  const firstModule = Array.isArray(meta.modulePlan) ? meta.modulePlan[0] : null;
  const officialStructure = SatDiagnosticEngine.officialDiagnosticStructureForMode
    ? SatDiagnosticEngine.officialDiagnosticStructureForMode(meta)
    : null;
  const firstRoute = SatDiagnosticEngine.normalizeDiagnosticRoute
    ? SatDiagnosticEngine.normalizeDiagnosticRoute(firstModule?.route || "standard")
    : firstModule?.route || "standard";
  const activeTimeLimitMinutes = firstModule?.timeLimitMinutes || meta.timeLimitMinutes || 25;
  const totalTimeLimitSeconds = ((officialStructure?.totalMinutes || meta.timeLimitMinutes || activeTimeLimitMinutes) * 60);
  const questionIds = firstModule
    ? buildDiagnosticModuleSet(firstModule, firstRoute, []).map((q) => q.id)
    : buildDiagnosticQuestionSet(mode).map((q) => q.id);
  if (!questionIds.length) {
    alert("No questions available for pretest.");
    return;
  }
  const expected = firstModule ? firstModule.expectedCount : meta.expectedCount;
  if (questionIds.length < expected) {
    alert(diagnosticShortfallMessage(firstModule || meta, expected, questionIds.length));
    if (mode === "full") return;
  }
  p.currentPretest = {
    id: `pretest-${Date.now()}`,
    mode,
    label: meta.label,
    questionIds,
    modules: firstModule ? meta.modulePlan.map((item) => ({ ...item })) : null,
    moduleIndex: 0,
    moduleResults: [],
    completedQuestionIds: [],
    adaptiveRoutes: firstModule ? [{ moduleIndex: 0, label: firstModule.label, route: firstRoute }] : [],
    activeRoute: firstRoute,
    officialStructure,
    timerRequired: true,
    moduleStartedAt: new Date().toISOString(),
    currentIndex: 0,
    answers: [],
    startedAt: new Date().toISOString(),
    timeLimitSeconds: (activeTimeLimitMinutes * 60),
    totalTimeLimitSeconds,
    deadlineAt: new Date(Date.now() + activeTimeLimitMinutes * 60 * 1000).toISOString(),
    timedOut: false,
  };
  pretestSelectedAnswer = "";
  pretestTimeoutAlertShown = false;
  saveState();
  renderPretest();
  focusActivePretestCard();
}

function handlePretestSpecAction(action) {
  if (["preview", "full", "adaptive", "rw_module", "math_module"].includes(action)) {
    startPretest(action);
    return;
  }
  if (action === "review") {
    focusPretestResults();
    return;
  }
  if (action === "skill-map" || action === "roadmap") {
    switchView("roadmap");
  }
}

function focusActivePretestCard() {
  window.setTimeout(() => {
    if (!els.pretestCard || els.pretestCard.hidden) return;
    els.pretestCard.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }, 0);
}

function focusPretestResults() {
  switchView("pretest");
  window.setTimeout(() => {
    els.pretestResults?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }, 0);
}

function handlePretestResultsAction(event) {
  const noteButton = event.target.closest("[data-pretest-note-question-id]");
  if (noteButton) {
    createMistakeStudyNoteFromPretest(noteButton.dataset.pretestNoteQuestionId || "");
    return;
  }
  const tabButton = event.target.closest("[data-pretest-detail-tab]");
  if (tabButton) {
    activePretestResultTab = tabButton.dataset.pretestDetailTab || "overview";
    renderPretestResults();
    localizeDynamicUiText(els.pretestResults);
    return;
  }
  const actionButton = event.target.closest("[data-pretest-plan-action]");
  if (actionButton) {
    const section = actionButton.dataset.section || "All";
    const domain = actionButton.dataset.domain || "All";
    const skill = actionButton.dataset.skill || "All";
    const difficulty = actionButton.dataset.difficulty || "All";
    const source = actionButton.dataset.source || "All";
    if (actionButton.dataset.pretestPlanAction === "practice") {
      startScopedPractice({ section, domain, skill, difficulty, source });
      return;
    }
    if (actionButton.dataset.pretestPlanAction === "lesson") {
      activeLessonKey = lessonScopeKey({ section, domain, skill });
      switchView("lessons");
      return;
    }
    if (actionButton.dataset.pretestPlanAction === "review") {
      startDueReview();
      return;
    }
  }
  const toggle = event.target.closest("[data-pretest-result-toggle]");
  if (!toggle) return;
  expandedPretestResultId = expandedPretestResultId === toggle.dataset.pretestResultToggle ? "" : toggle.dataset.pretestResultToggle;
  activePretestResultTab = "overview";
  renderPretestResults();
  localizeDynamicUiText(els.pretestResults);
}

async function ensureLocalOpenSatBank(silent = false) {
  const selector = { sourceType: "opensat" };
  const localOpenSat = SatDataLoaders.selectQuestions(state.questions, selector);
  if (
    !SatDataLoaders.shouldReloadOpenSatBank(state.questions, {
      minCount: LOCAL_OPEN_SAT_MIN_COUNT,
      minReviewedCount: LOCAL_OPEN_SAT_REVIEWED_MIN_COUNT,
      auditVersion: OPEN_SAT_IMPORT_AUDIT_VERSION,
    })
  ) {
    return localOpenSat.length;
  }
  if (localOpenSatLoadPromise) return localOpenSatLoadPromise;

  localOpenSatLoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, LOCAL_OPEN_SAT_DATA_URL, "Local OpenSAT/PineSAT data missing");
    await loadQuestionIntegrityBlocklist();
    state.questions = SatDataLoaders.removeBankQuestions(state.questions, selector);
    const imported = importOpenSatArray(data);
    saveState();
    hydrateFilters();
    render();
    if (!silent) alert(`Loaded ${imported} local OpenSAT/PineSAT questions.`);
    return SatDataLoaders.selectQuestions(state.questions, selector).length;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load local OpenSAT/PineSAT data. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localOpenSatLoadPromise = null;
    });

  return localOpenSatLoadPromise;
}

async function ensureQuestionIntegrityReport(renderAfterLoad = false) {
  if (questionIntegrityReport) {
    if (renderAfterLoad) renderQuestionIntegrityReport();
    if (renderAfterLoad && activeView === "admin") renderAdminCenter();
    return questionIntegrityReport;
  }
  if (questionIntegrityReportPromise) return questionIntegrityReportPromise;

  if (renderAfterLoad && els.questionIntegritySummary) {
    els.questionIntegritySummary.className = "integrity-summary import-result";
    els.questionIntegritySummary.innerHTML = "<strong>Loading question integrity report...</strong><span>Reading validator output and blocked source rows.</span>";
  }

  questionIntegrityReportPromise = (async () => {
    try {
      const report = await SatDataLoaders.fetchJson(fetch, QUESTION_INTEGRITY_REPORT_URL, "Question integrity report missing");
      questionIntegrityReport = report || {};
      updateOpenSatIntegrityBlocklist(questionIntegrityReport);
      if (questionIntegrityReport.studyPolicy) questionStudyPolicyManager?.set(questionIntegrityReport.studyPolicy);
      if (renderAfterLoad) renderQuestionIntegrityReport();
      if (renderAfterLoad && activeView === "admin") renderAdminCenter();
      return questionIntegrityReport;
    } catch (error) {
      questionIntegrityReport = null;
      openSatIntegrityBlocklist = new Set();
      if (renderAfterLoad && els.questionIntegritySummary) {
        els.questionIntegritySummary.className = "integrity-summary import-result error";
        els.questionIntegritySummary.innerHTML = `<strong>Could not load question integrity report.</strong><span>${escapeHtml(error.message)}</span>`;
      }
      if (renderAfterLoad && activeView === "admin") renderAdminCenter();
      return null;
    } finally {
      questionIntegrityReportPromise = null;
    }
  })();

  return questionIntegrityReportPromise;
}

async function ensureSat2026ReadinessReport(renderAfterLoad = false) {
  if (sat2026ReadinessReport) {
    if (renderAfterLoad) renderAdminCenter();
    return sat2026ReadinessReport;
  }
  if (sat2026ReadinessReportPromise) return sat2026ReadinessReportPromise;

  sat2026ReadinessReportPromise = (async () => {
    try {
      sat2026ReadinessReport = await SatDataLoaders.fetchJson(fetch, SAT_2026_READINESS_AUDIT_URL, "SAT 2026 readiness audit missing");
      if (renderAfterLoad) renderAdminCenter();
      return sat2026ReadinessReport;
    } catch (error) {
      sat2026ReadinessReport = null;
      console.warn("Could not load SAT 2026 readiness audit:", error);
      if (renderAfterLoad) renderAdminCenter();
      return null;
    } finally {
      sat2026ReadinessReportPromise = null;
    }
  })();

  return sat2026ReadinessReportPromise;
}

async function ensureReviewedExpertAuditReport(renderAfterLoad = false) {
  if (reviewedExpertAuditReport) {
    if (renderAfterLoad) renderAdminCenter();
    return reviewedExpertAuditReport;
  }
  if (reviewedExpertAuditReportPromise) return reviewedExpertAuditReportPromise;

  reviewedExpertAuditReportPromise = (async () => {
    try {
      reviewedExpertAuditReport = await SatDataLoaders.fetchJson(fetch, REVIEWED_EXPERT_AUDIT_URL, "Reviewed expert-quality audit missing");
      if (renderAfterLoad) renderAdminCenter();
      return reviewedExpertAuditReport;
    } catch (error) {
      reviewedExpertAuditReport = null;
      console.warn("Could not load reviewed expert-quality audit:", error);
      if (renderAfterLoad) renderAdminCenter();
      return null;
    } finally {
      reviewedExpertAuditReportPromise = null;
    }
  })();

  return reviewedExpertAuditReportPromise;
}

function updateOpenSatIntegrityBlocklist(report) {
  const rows = [
    ...(Array.isArray(report?.criticalRows) ? report.criticalRows : []),
    ...(Array.isArray(report?.blockedRows) ? report.blockedRows : []),
  ];
  openSatIntegrityBlocklist = new Set(
    rows
      .filter((row) => row.sourceFile === "opensat-pinesat.json")
      .map((row) => `${row.section === "Math" ? "math" : "english"}|${row.id}|${row.sourceIndex}`),
  );
}

async function ensureQuestionStudyPolicy() {
  if (!questionStudyPolicyManager?.load) return null;
  try {
    return await questionStudyPolicyManager.load(SatDataLoaders.fetchJson, fetch);
  } catch (error) {
    console.warn("Could not load question study policy:", error);
    return null;
  }
}

async function loadQuestionIntegrityBlocklist() {
  if (openSatIntegrityBlocklist.size) return openSatIntegrityBlocklist;
  await ensureQuestionIntegrityReport(false);
  return openSatIntegrityBlocklist;
}

async function ensureFoundationBank(silent = false) {
  const selector = { sourceType: "foundation" };
  const localCount = SatDataLoaders.selectQuestions(state.questions, selector).length;
  if (localCount >= LOCAL_FOUNDATION_MIN_COUNT) return localCount;
  if (localFoundationLoadPromise) return localFoundationLoadPromise;

  localFoundationLoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, LOCAL_FOUNDATION_DATA_URL, "Local foundation bank missing");
    const imported = importQuestionRecords(data, { defaultSourceName: "SAT Studio Foundation Bank" });
    saveState();
    hydrateFilters();
    render();
    if (!silent) alert(`Loaded ${imported} SAT Studio foundation questions.`);
    return SatDataLoaders.selectQuestions(state.questions, selector).length;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load foundation bank. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localFoundationLoadPromise = null;
    });

  return localFoundationLoadPromise;
}

async function ensureReviewedStudyBank(silent = true, options = {}) {
  if (reviewedStudyBankLoadPromise) return reviewedStudyBankLoadPromise;
  const account = options.account || currentAccount();
  const includePrivateFamily = canAccessPrivateContent(account);
  const loaders = [
    () => ensureFoundationBank(true),
    () => ensureLocalOpenSatBank(true),
    () => ensureSatKingBank(true),
    () => ensureSat1590Bank(true),
  ];
  if (includePrivateFamily) {
    loaders.push(
      () => ensureKaplanAiMathBank(true),
      () => ensureArchiveAiBank(true),
      () => ensureAntigravityBank(true),
    );
  }

  reviewedStudyBankLoadPromise = SatLearnerContentGateway.loadReviewedStudyBank({
    account,
    token: publicBackendToken(),
    backendAccount: publicBackendState().account,
    backendState: publicBackendState(),
    api: SatPublicApi,
    baseUrl: publicBackendBaseUrl(),
    scope: "public",
    state,
    normalizeQuestionRecord,
    touchQuestionBank,
    saveState,
    hydrateFilters,
    reviewedStudyContentRepository,
    visibleQuestionBank,
    isStudyAvailableQuestion,
    ensureQuestionStudyPolicy,
    loaders,
    silent,
    notify: (message) => alert(message),
    onBackendFallback: (status) => setPublicBackendStatus(status.level, status.title, status.message, status.extra),
  })
    .catch((error) => {
      if (!silent) alert(`Could not prepare reviewed study bank. ${error.message}`);
      return { loadedSources: 0, failedSources: 1, studyQuestionCount: visibleQuestionBank().filter(isStudyAvailableQuestion).length, contentVersion: "" };
    })
    .finally(() => {
      reviewedStudyBankLoadPromise = null;
    });

  return reviewedStudyBankLoadPromise;
}

async function ensureKaplanAiMathBank(silent = false) {
  if (!canAccessPrivateContent()) return 0;
  const selector = { idPrefix: "kaplan-ai-math-" };
  const localQuestions = SatDataLoaders.selectQuestions(state.questions, selector);
  if (
    !SatDataLoaders.shouldReloadReviewedSourceBank(state.questions, {
      selector,
      minReviewedCount: REVIEWED_SOURCE_BANK_MIN_COUNT,
    })
  ) {
    return localQuestions.length;
  }
  if (localKaplanAiMathLoadPromise) return localKaplanAiMathLoadPromise;

  localKaplanAiMathLoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, KAPLAN_AI_MATH_DATA_URL, "Kaplan AI Math bank missing");
    state.questions = SatDataLoaders.removeBankQuestions(state.questions, selector);
    const imported = importQuestionRecords(data, { defaultSourceName: "SAT Studio AI Draft Workspace" });
    saveState();
    hydrateFilters();
    render();
    const after = SatDataLoaders.selectQuestions(state.questions, { sourceSignalId: KAPLAN_AI_SOURCE_SIGNAL_ID }).length;
    if (!silent) alert(`Loaded ${imported} Kaplan SAT Math AI-generated questions (${after} total linked).`);
    return after;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load Kaplan AI Math bank. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localKaplanAiMathLoadPromise = null;
    });

  return localKaplanAiMathLoadPromise;
}

async function ensureArchiveAiBank(silent = false) {
  if (!canAccessPrivateContent()) return 0;
  const selector = { idPrefix: "archive-ai-" };
  const localQuestions = SatDataLoaders.selectQuestions(state.questions, selector);
  if (
    !SatDataLoaders.shouldReloadReviewedSourceBank(state.questions, {
      selector,
      minReviewedCount: REVIEWED_SOURCE_BANK_MIN_COUNT,
    })
  ) {
    return localQuestions.length;
  }
  if (localArchiveAiLoadPromise) return localArchiveAiLoadPromise;

  localArchiveAiLoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, ARCHIVE_AI_DATA_URL, "Archive AI bank missing");
    state.questions = SatDataLoaders.removeBankQuestions(state.questions, selector);
    const imported = importQuestionRecords(data, { defaultSourceName: "SAT Studio AI Draft Workspace" });
    saveState();
    hydrateFilters();
    render();
    renderArchiveRegistry();
    const after = SatDataLoaders.selectQuestions(state.questions, { sourceSignalPrefix: "archive-signal-" }).length;
    if (!silent) alert(`Loaded ${imported} archive AI-generated questions (${after} total linked).`);
    return after;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load archive AI bank. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localArchiveAiLoadPromise = null;
    });

  return localArchiveAiLoadPromise;
}

async function ensureSatKingBank(silent = false) {
  const selector = { idPrefix: "satking-" };
  const localQuestions = SatDataLoaders.selectQuestions(state.questions, selector);
  if (
    !SatDataLoaders.shouldReloadReviewedSourceBank(state.questions, {
      selector,
      minReviewedCount: REVIEWED_SOURCE_BANK_MIN_COUNT,
    })
  ) {
    return localQuestions.length;
  }
  if (localSatKingLoadPromise) return localSatKingLoadPromise;

  localSatKingLoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, SAT_KING_DATA_URL, "SAT King supplemental bank missing");
    state.questions = SatDataLoaders.removeBankQuestions(state.questions, selector);
    const imported = importQuestionRecords(data, { defaultSourceName: "SAT King Supplemental Bank" });
    saveState();
    hydrateFilters();
    render();
    if (!silent) alert(`Loaded ${imported} SAT King supplemental questions.`);
    return SatDataLoaders.selectQuestions(state.questions, selector).length;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load SAT King supplemental bank. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localSatKingLoadPromise = null;
    });

  return localSatKingLoadPromise;
}

async function ensureSat1590Bank(silent = false) {
  const selector = { idPrefix: "sat1590-" };
  const localQuestions = SatDataLoaders.selectQuestions(state.questions, selector);
  if (
    !SatDataLoaders.shouldReloadReviewedSourceBank(state.questions, {
      selector,
      minReviewedCount: REVIEWED_SOURCE_BANK_MIN_COUNT,
    })
  ) {
    return localQuestions.length;
  }
  if (localSat1590LoadPromise) return localSat1590LoadPromise;

  localSat1590LoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, SAT_1590_DATA_URL, "SAT 1590 Elite bank missing");
    state.questions = SatDataLoaders.removeBankQuestions(state.questions, selector);
    const imported = importQuestionRecords(data, { defaultSourceName: "SAT 1590 Elite Bank" });
    saveState();
    hydrateFilters();
    render();
    if (!silent) alert(`Loaded ${imported} SAT 1590 Elite questions.`);
    return SatDataLoaders.selectQuestions(state.questions, selector).length;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load SAT 1590 Elite bank. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localSat1590LoadPromise = null;
    });

  return localSat1590LoadPromise;
}

async function ensurePrivateVaultBank(silent = false) {
  if (!canAccessPrivateContent()) return 0;
  const selector = { idPrefix: "vault-" };
  const localQuestions = SatDataLoaders.selectQuestions(state.questions, selector);
  if (
    !SatDataLoaders.shouldReloadReviewedSourceBank(state.questions, {
      selector,
      minReviewedCount: REVIEWED_SOURCE_BANK_MIN_COUNT,
    })
  ) {
    return localQuestions.length;
  }
  if (localPrivateVaultLoadPromise) return localPrivateVaultLoadPromise;

  localPrivateVaultLoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, PRIVATE_VAULT_DATA_URL, "Private Vault bank missing");
    state.questions = SatDataLoaders.removeBankQuestions(state.questions, selector);
    const imported = importQuestionRecords(data, { defaultSourceName: "Private Family Vault", forcePrivateVault: true });
    saveState();
    hydrateFilters();
    render();
    renderArchiveRegistry();
    const after = SatDataLoaders.selectQuestions(state.questions, { sourceType: "private_vault" }).length;
    if (!silent) alert(`Loaded ${imported} Private Vault questions (${after} total).`);
    return after;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load Private Vault bank. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localPrivateVaultLoadPromise = null;
    });

  return localPrivateVaultLoadPromise;
}

async function ensureAntigravityBank(silent = false) {
  if (!canAccessPrivateContent()) return 0;
  if (antigravityBankLoaded) return SatDataLoaders.selectQuestions(state.questions, { sourceType: "antigravity" }).length;
  if (localAntigravityLoadPromise) return localAntigravityLoadPromise;

  localAntigravityLoadPromise = (async () => {
    const data = await SatDataLoaders.fetchJson(fetch, ANTIGRAVITY_DATA_URL, "Antigravity bank missing");
    const records = SatDataLoaders.extractQuestionRecords(data);
    const selector = { predicate: (q) => q.sourceType === "antigravity" || String(q.id || "").startsWith("antigravity-") };
    const beforeCount = SatDataLoaders.selectQuestions(state.questions, selector).length;
    state.questions = SatDataLoaders.removeBankQuestions(state.questions, selector, {
      keepPublicPromoted: true,
      isPublicPromoted: isPublicPromotedQuestion,
    });
    const imported = records.length
      ? importQuestionRecords(records, {
          defaultSourceName: "Antigravity Testbank",
          defaultSourceReference: ANTIGRAVITY_DATA_URL,
        })
      : 0;
    antigravityBankLoaded = true;
    if (imported || beforeCount) {
      saveState();
      if (imported) {
        hydrateFilters();
        render();
      }
    }
    if (!silent) alert(`Loaded ${imported} Antigravity review candidate${imported === 1 ? "" : "s"}.`);
    return SatDataLoaders.selectQuestions(state.questions, { sourceType: "antigravity" }).length;
  })()
    .catch((error) => {
      if (!silent) alert(`Could not load Antigravity bank. ${error.message}`);
      return 0;
    })
    .finally(() => {
      localAntigravityLoadPromise = null;
    });

  return localAntigravityLoadPromise;
}

async function ensureExternalResources(renderAfterLoad = false) {
  if (externalResources.length) return externalResources;
  if (externalResourceLoadPromise) return externalResourceLoadPromise;

  externalResourceLoadPromise = (async () => {
    const response = await fetch(EXTERNAL_RESOURCES_URL);
    if (!response.ok) throw new Error(`External resource map missing: HTTP ${response.status}`);
    const data = await response.json();
    externalResources = Array.isArray(data.resources) ? data.resources.filter((item) => item.url && item.title) : [];
    if (renderAfterLoad) render();
    return externalResources;
  })()
    .catch((error) => {
      console.warn("External resource map skipped:", error);
      externalResources = [];
      return externalResources;
    })
    .finally(() => {
      externalResourceLoadPromise = null;
    });

  return externalResourceLoadPromise;
}

async function ensureDiagnosticBank(meta = null) {
  const visibleQuestions = visibleQuestionBank();
  const diagnosticSources = ["opensat", "foundation", "ai_generated", "antigravity", "sat_king", "sat_1590", "private_vault"];
  const rwCount = visibleQuestions.filter((q) => q.section === "Reading and Writing" && diagnosticSources.includes(q.sourceType)).length;
  const mathCount = visibleQuestions.filter((q) => q.section === "Math" && diagnosticSources.includes(q.sourceType)).length;
  const readiness = meta ? buildDiagnosticReadinessForMeta(meta) : null;
  const expected = Number(meta?.expectedCount || 0);
  const moduleReady = !meta || (readiness?.selectedCount || 0) >= expected;
  if (rwCount >= 80 && mathCount >= 80 && moduleReady) return;

  els.startPretest.disabled = true;
  els.startFullTest.disabled = true;
  els.startAdaptiveDiagnostic.disabled = true;
  els.startRwModule.disabled = true;
  els.startMathModule.disabled = true;
  els.quickPretest.disabled = true;
  const vi = state.language === "vi";
  els.startPretest.textContent = vi ? "Đang chuẩn bị câu hỏi..." : "Preparing questions...";
  els.startFullTest.textContent = vi ? "Đang chuẩn bị..." : "Preparing...";
  els.startAdaptiveDiagnostic.textContent = vi ? "Đang chuẩn bị..." : "Preparing...";
  els.quickPretest.textContent = vi ? "Đang chuẩn bị..." : "Preparing...";

  try {
    await ensureReviewedStudyBank(true);
  } catch (error) {
    console.warn("Diagnostic bank import skipped:", error);
  } finally {
    els.startPretest.disabled = false;
    els.startFullTest.disabled = false;
    els.startAdaptiveDiagnostic.disabled = false;
    els.startRwModule.disabled = false;
    els.startMathModule.disabled = false;
    els.quickPretest.disabled = false;
    els.startPretest.textContent = "Start Preview";
    els.startFullTest.textContent = "Start Full Length";
    els.startAdaptiveDiagnostic.textContent = "Adaptive v2";
    els.quickPretest.textContent = "Start Pretest";
  }
}

function buildDiagnosticReadinessForMeta(meta = testModeMeta.preview) {
  return SatDiagnosticEngine.buildDiagnosticReadiness
    ? SatDiagnosticEngine.buildDiagnosticReadiness(visibleQuestionBank(), meta)
    : { selectedCount: 0, readyCount: 0 };
}

function diagnosticShortfallMessage(spec = {}, expected = 0, matched = 0) {
  const visible = visibleQuestionBank();
  const ready = visible.filter(isDiagnosticReadyQuestion);
  const section = spec.section || "";
  const sectionReady = section ? ready.filter((question) => question.section === section).length : ready.length;
  const fileMode = window.location.protocol === "file:";
  const label = spec.label || "Diagnostic";
  if (state.language === "vi") {
    const loadedLine = `Đã nạp trong trình duyệt: ${state.questions.length}; hiển thị với tài khoản này: ${visible.length}; đủ chuẩn diagnostic${section ? ` ${section}` : ""}: ${sectionReady}.`;
    const fileLine = fileMode
      ? "Bạn đang mở index.html bằng file:// nên trình duyệt có thể không tải được data/*.json. Hãy dùng http://127.0.0.1:8765/ sau khi bật local server."
      : "Nếu số này quá thấp, hãy reload trang. Content Admin có thể kiểm tra lại nguồn dữ liệu trong khu quản trị.";
    return `${label} cần ${expected} câu, nhưng session hiện tại chỉ ghép được ${matched} câu.\n${loadedLine}\n${fileLine}`;
  }
  const loadedLine = `Loaded in this browser: ${state.questions.length}; visible to this account: ${visible.length}; diagnostic-ready${section ? ` ${section}` : ""}: ${sectionReady}.`;
  const fileLine = fileMode
    ? "You are opening index.html with file://, so browser fetch may not load data/*.json. Use http://127.0.0.1:8765/ after starting the local server."
    : "If this looks too low, reload the page. Content Admin can inspect the source data from the admin workspace.";
  return `${label} needs ${expected} questions, but only ${matched} matched the current browser session.\n${loadedLine}\n${fileLine}`;
}

function buildDiagnosticQuestionSet(mode = "preview") {
  const meta = testModeMeta[mode] || testModeMeta.preview;
  return SatDiagnosticEngine.buildDiagnosticQuestionSet(visibleQuestionBank(), meta);
}

function buildDiagnosticReadiness(mode = "preview") {
  const meta = testModeMeta[mode] || testModeMeta.preview;
  return SatDiagnosticEngine.buildDiagnosticReadiness
    ? SatDiagnosticEngine.buildDiagnosticReadiness(visibleQuestionBank(), meta)
    : { label: meta.label || "Diagnostic", expectedCount: meta.expectedCount || 0, selectedCount: 0, readinessScore: 0, confidence: "low", warnings: [] };
}

function buildDiagnosticModuleSet(moduleSpec, route = "standard", usedIds = []) {
  const attemptedIds = (profile().attempts || []).map((attempt) => attempt.questionId);
  return SatDiagnosticEngine.buildDiagnosticModuleSet(visibleQuestionBank(), moduleSpec, route, usedIds, { attemptedIds });
}

function isDiagnosticReadyQuestion(question) {
  return SatDiagnosticEngine.isDiagnosticReadyQuestion(question);
}

function rankDiagnosticCandidates(questions) {
  return SatDiagnosticEngine.rankDiagnosticCandidates(questions);
}

function rankDiagnosticCandidatesForRoute(questions, route = "standard") {
  const attemptedIds = new Set((profile().attempts || []).map((attempt) => attempt.questionId));
  return SatDiagnosticEngine.rankDiagnosticCandidatesForRoute(questions, route, { attemptedIds });
}

function sourcePriority(question) {
  return SatDiagnosticEngine.sourcePriority(question);
}

function pickDifficultyMix(candidates, count) {
  return SatDiagnosticEngine.pickDifficultyMix(candidates, count);
}

function renderPretest() {
  const p = profile();
  const current = p.currentPretest;
  renderDiagnosticReadiness();
  renderPretestResults();
  renderStudentPretestCoach(current);
  applyStudentPretestCopy(current);

  if (!current) {
    els.pretestCard.hidden = true;
    stopPretestTimer();
    return;
  }

  if (getPretestRemainingSeconds(current) <= 0) {
    window.setTimeout(() => handlePretestTimeout(), 0);
    return;
  }

  const question = getQuestionById(current.questionIds[current.currentIndex]);
  if (!question) {
    finishPretest();
    return;
  }

  els.pretestCard.hidden = false;
  const studentMode = currentAccount()?.role === "student";
  const displayQuestion = roleQuestionForDisplay(question);
  const vi = state.language === "vi";
  const moduleSpec = currentPretestModule(current);
  const routeLabel = current.activeRoute && current.activeRoute !== "standard" ? ` - ${labelFor(current.activeRoute)}` : "";
  els.pretestCounter.textContent = studentMode
    ? vi
      ? `Câu ${current.currentIndex + 1}/${current.questionIds.length}`
      : `Question ${current.currentIndex + 1} of ${current.questionIds.length}`
      : moduleSpec
      ? `${current.label || "Diagnostic"} - ${moduleSpec.label}${routeLabel} - Question ${current.currentIndex + 1} of ${current.questionIds.length}`
      : `${current.label || "Preview"} - Question ${current.currentIndex + 1} of ${current.questionIds.length}`;
  els.pretestSkill.textContent = `${displayQuestion.domain} - ${displayQuestion.skill}`;
  els.pretestBadges.innerHTML = [
    badge(displayQuestion.section),
    badge(displayQuestion.difficulty),
    studentMode ? "" : badge(labelFor(question.sourceType)),
    moduleSpec ? badge(current.activeRoute || "standard") : "",
  ].join("");
  const structure = current.officialStructure || {};
  const structureText = structure.moduleCount > 1
    ? `${Number(structure.totalQuestions || 0)} questions across ${Number(structure.moduleCount || 0)} timed modules`
    : `${Number(structure.totalQuestions || current.questionIds.length || 0)} questions`;
  if (studentMode) {
    const answered = current.answers?.length || 0;
    const total = current.questionIds.length || 1;
    const pct = Math.max(4, Math.min(100, Math.round((answered / total) * 100)));
    const left = Math.max(0, total - answered);
    els.pretestTimeLimit.innerHTML = `
      <div class="pretest-progress-strip" aria-label="${vi ? "Tiến độ bài kiểm tra" : "Test progress"}">
        <div><strong>${answered}/${total}</strong><span>${vi ? `đã trả lời · còn ${left} câu` : `answered · ${left} left`}</span></div>
        <progress max="100" value="${pct}"></progress>
      </div>
      <span>${moduleSpec ? `${escapeHtml(moduleSpec.label)} · ` : ""}${escapeHtml(formatDuration(current.timeLimitSeconds || 0))}${vi ? " cho bài này." : " for this test."}</span>
    `;
  } else {
    els.pretestTimeLimit.textContent = moduleSpec
      ? `${moduleSpec.label} required countdown: ${formatDuration(current.timeLimitSeconds || 0)}. ${structureText}. Module 2 routes easy/standard/hard from Module 1.`
      : `${current.label || "Preview"} required countdown: ${formatDuration(current.timeLimitSeconds || 0)}. ${structureText}.`;
  }
  updatePretestTimerDisplay(current);
  startPretestTimer();
  els.pretestStem.innerHTML = renderQuestionStem(displayQuestion);
  els.pretestStem.classList.toggle("split-stem", Boolean(shouldUseSplitStem(displayQuestion)));

  pretestSelectedAnswer = "";
  renderAnswerInput(displayQuestion, els.pretestOptions, "pretest-answer", (value) => {
    pretestSelectedAnswer = value;
  });
  applyStudentPretestCopy(current);
}

function renderStudentPretestCoach(current = profile().currentPretest) {
  if (!els.studentPretestCoach) return;
  if (currentAccount()?.role !== "student") { els.studentPretestCoach.hidden = true; els.studentPretestCoach.innerHTML = ""; return; }
  const p = profile();
  const latest = latestPretest();
  const latestComposite = latestCompositePretest();
  const baseline = latestComposite?.scoreEstimate || latest?.scoreEstimate || "--";
  const inProgress = Boolean(current);
  const answered = current?.answers?.length || 0;
  const total = current?.questionIds?.length || 0;
  const vi = state.language === "vi";
  const goalContext = p.satGoalContext || {};
  const mode = current?.label || (latest ? (vi ? "Ôn kết quả gần nhất" : "Review latest result") : (vi ? "Pretest nhanh" : "Quick pretest"));
  const recommendation = latest
    ? (vi ? "Đã có mức nền. Chỉ làm lại pretest khi cần đo lại sau một giai đoạn học." : "You already have a baseline. Retake only when you need a fresh measurement after a study block.")
    : (vi ? "Làm bài 20 câu trước để mở lộ trình và bài học ưu tiên." : "Start with the 20-question pretest to unlock your roadmap and priority lessons.");
  const heading = escapeHtml(inProgress ? mode : latest ? (vi ? `Mức nền hiện tại ${baseline}` : `Current baseline ${baseline}`) : (vi ? "Bắt đầu bằng bài nhanh" : "Start with the quick test"));
  const body = escapeHtml(inProgress ? (vi ? "Giữ nhịp làm bài. Câu chưa trả lời sẽ bị tính sai khi hết giờ." : "Keep your pace. Unanswered questions count wrong when time expires.") : recommendation);
  const goalHtml = !latest && !inProgress ? `<div class="student-pretest-profile"><strong>${vi ? "Trước khi làm bài: cho coach biết mục tiêu" : "Before the test: set your goal"}</strong><label>${vi ? "Lớp" : "Grade"}<input data-student-goal-field="grade" value="${escapeHtml(goalContext.grade || "")}" placeholder="10 / 11 / 12"></label><label>${vi ? "Ngày thi dự kiến" : "Test date"}<input data-student-goal-field="testDate" value="${escapeHtml(goalContext.testDate || "")}" placeholder="YYYY-MM-DD"></label><label>${vi ? "Phút học mỗi ngày" : "Minutes/day"}<input data-student-goal-field="dailyMinutes" type="number" min="5" max="240" value="${escapeHtml(goalContext.dailyMinutes || "")}" placeholder="45"></label><small>${vi ? "Không phải để đánh giá giỏi/dở; thông tin này giúp hệ thống chọn nhịp học vừa sức." : "This is not a judgment; it helps the coach set the right pace."}</small></div>` : "";
  const actions = inProgress ? `<strong>${answered}/${total}</strong><span>${vi ? "đã trả lời" : "answered"}</span>` : `<button class="button primary" type="button" data-student-pretest-start="preview">${vi ? "Làm bài nhanh" : "Quick test"}</button><button class="button secondary" type="button" data-student-pretest-start="full">${vi ? "Bài đầy đủ" : "Full test"}</button>`;
  els.studentPretestCoach.hidden = false;
  els.studentPretestCoach.innerHTML = `<section class="student-pretest-coach-inner"><div><p class="eyebrow">${vi ? "Nên làm gì" : "What to do"}</p><h3>${heading}</h3><p>${body}</p></div><div class="student-pretest-steps"><span class="${!latest && !inProgress ? "active" : ""}">1. ${vi ? "Bài nhanh 20 câu" : "20-question quick test"}</span><span class="${latest && !inProgress ? "active" : ""}">2. ${vi ? "Xem lỗi yếu" : "Review weak spots"}</span><span>3. ${vi ? "Học theo lộ trình" : "Study from Roadmap"}</span></div>${goalHtml}<div class="student-pretest-actions">${actions}</div></section>`;
  document.querySelectorAll("[data-student-goal-field]").forEach((input) => ["change", "input"].forEach((eventName) => input.addEventListener(eventName, saveStudentGoalContextFromCoach)));
  document.querySelectorAll("[data-student-pretest-start]").forEach((button) => button.addEventListener("click", () => startPretest(button.dataset.studentPretestStart || "preview")));
}

function saveStudentGoalContextFromCoach() {
  const p = profile();
  p.satGoalContext = {
    ...(p.satGoalContext || {}),
    grade: document.querySelector('[data-student-goal-field="grade"]')?.value.trim() || "",
    testDate: document.querySelector('[data-student-goal-field="testDate"]')?.value.trim() || "",
    dailyMinutes: document.querySelector('[data-student-goal-field="dailyMinutes"]')?.value.trim() || "",
  };
  saveState();
}

function applyStudentPretestCopy(current = profile().currentPretest) {
  if (currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  const launch = document.querySelector(".pretest-launch-panel");
  if (launch) {
    const eyebrow = launch.querySelector(":scope > .eyebrow");
    const title = launch.querySelector(":scope > h2");
    const copy = launch.querySelector(":scope > .muted");
    if (eyebrow) eyebrow.textContent = "Diagnostic";
    if (title) title.textContent = vi ? "Chọn kiểu kiểm tra" : "Choose a test mode";
    if (copy) copy.textContent = vi ? "Bài nhanh để lấy mức nền. Bài đầy đủ dùng khi muốn mô phỏng áp lực thi." : "Use the quick test for a baseline. Use the full test when you want exam pressure.";
  }
  const note = document.querySelector(".pretest-compact-note span");
  if (note) note.textContent = vi ? "Sau khi nộp: điểm ước lượng, số đúng/sai, kỹ năng yếu, review đáp án và roadmap." : "After submission: estimated score, correct/wrong count, weak skills, answer review, and roadmap.";
  const officialNote = document.querySelector(".official-test-note");
  if (officialNote) {
    const strong = officialNote.querySelector("strong");
    const span = officialNote.querySelector("span");
    if (strong) strong.textContent = vi ? "Bài official" : "Official test";
    if (span) {
      span.innerHTML = vi
        ? 'Dùng <a href="https://satsuite.collegeboard.org/practice/practice-tests/bluebook" target="_blank" rel="noreferrer">Bluebook</a> để lấy điểm chính thức. SAT Studio chỉ log kết quả và lỗi sai, không lưu nội dung câu hỏi official.'
        : 'Use <a href="https://satsuite.collegeboard.org/practice/practice-tests/bluebook" target="_blank" rel="noreferrer">Bluebook</a> for official scores. SAT Studio logs results and mistakes only; it does not store official question content.';
    }
  }
  if (current) {
    els.pretestSubmit.textContent = vi ? "Lưu đáp án" : "Save answer";
    els.pretestCancel.textContent = vi ? "Thoát bài" : "Exit test";
    const vocabHint = els.pretestCard.querySelector(".selection-vocab-hint");
    if (vocabHint) vocabHint.hidden = true;
    localizeDynamicUiText(els.pretestCard);
  }
}

function renderDiagnosticReadiness() {
  if (!els.diagnosticReadiness) return;
  const modes = ["preview", "adaptive", "full"];
  const readinessItems = modes.map((mode) => ({ ...buildDiagnosticReadiness(mode), mode }));
  if (currentAccount()?.role === "student") {
    els.diagnosticReadiness.innerHTML = renderStudentDiagnosticReadinessCards(readinessItems);
    applyDynamicVisualState();
    return;
  }
  els.diagnosticReadiness.innerHTML = SatViewRenderers.renderDiagnosticReadinessCards
    ? SatViewRenderers.renderDiagnosticReadinessCards(readinessItems)
    : "";
}

function renderStudentDiagnosticReadinessCards(readinessItems = []) {
  const vi = state.language === "vi";
  return (readinessItems || [])
    .map((item) => {
      const mode = item.mode || "preview";
      const minutes = Number(item.officialStructure?.totalMinutes || testModeMeta[mode]?.timeLimitMinutes || 0);
      const questions = Number(item.expectedCount || testModeMeta[mode]?.expectedCount || 0);
      const canStart = Boolean(item.canStart);
      const score = Math.max(0, Math.min(100, Number(item.readinessScore || 0)));
      const status = canStart ? (vi ? "Sẵn sàng" : "Ready") : vi ? "Cần thêm câu phù hợp" : "Needs more matching questions";
      const tone = canStart ? "high" : score >= 70 ? "medium" : "low";
      const labels = {
        preview: vi ? "Bài nhanh 20 câu" : "20-question quick test",
        adaptive: vi ? "Adaptive v2" : "Adaptive v2",
        full: vi ? "Bài đầy đủ 98 câu" : "98-question full test",
      };
      const tags = {
        preview: vi ? "Nên làm trước" : "Do first",
        adaptive: vi ? "Sau khi có baseline" : "After baseline",
        full: vi ? "Khi có 2 giờ yên tĩnh" : "Quiet 2-hour block",
      };
      const hints = {
        preview: vi ? "Phù hợp để lấy mức nền hôm nay." : "Best for getting today's baseline.",
        adaptive: vi ? "Dùng để mô phỏng nhịp module và nhánh khó/dễ." : "Use this for module pacing and adaptive routing.",
        full: vi ? "Dùng khi muốn mô phỏng áp lực bài dài." : "Use this when you want full-test pressure.",
      };
      return `
        <article class="diagnostic-readiness-card student ${escapeHtml(tone)}">
          <div>
            <strong>${escapeHtml(labels[mode] || item.label || "Diagnostic")}</strong>
            <span>${escapeHtml(status)}</span>
          </div>
          <div class="diagnostic-readiness-meter" data-score="${score}"><span></span></div>
          <p>${escapeHtml(`${questions} ${vi ? "câu" : "questions"} · ${vi ? "khoảng" : "about"} ${minutes || "--"} ${vi ? "phút" : "min"}`)}</p>
          <p>${escapeHtml(canStart ? hints[mode] || "" : vi ? "Tạm thời hãy học bằng Luyện tập hoặc Lộ trình." : "For now, use Practice or Roadmap work.")}</p>
          <small>${escapeHtml(tags[mode] || "")}</small>
        </article>
      `;
    })
    .join("");
}

function currentPretestModule(current = profile().currentPretest) {
  if (!current || !Array.isArray(current.modules)) return null;
  return current.modules[current.moduleIndex || 0] || null;
}

function startPretestTimer() {
  stopPretestTimer();
  if (!profile().currentPretest) return;
  pretestTimerId = window.setInterval(() => {
    const current = profile().currentPretest;
    if (!current) {
      stopPretestTimer();
      return;
    }
    const remaining = updatePretestTimerDisplay(current);
    if (remaining <= 0) handlePretestTimeout();
  }, 1000);
}

function stopPretestTimer() {
  if (!pretestTimerId) return;
  window.clearInterval(pretestTimerId);
  pretestTimerId = null;
}

function getPretestRemainingSeconds(current) {
  if (!current?.deadlineAt) return current?.timeLimitSeconds || 0;
  return Math.max(0, Math.ceil((new Date(current.deadlineAt).getTime() - Date.now()) / 1000));
}

function updatePretestTimerDisplay(current = profile().currentPretest) {
  if (!els.pretestTimer || !current) return 0;
  const remaining = getPretestRemainingSeconds(current);
  els.pretestTimer.textContent = formatCountdown(remaining);
  els.pretestTimer.classList.toggle("urgent", remaining <= 60);
  return remaining;
}

function formatCountdown(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.round((Number(totalSeconds) || 0) / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

function handlePretestTimeout() {
  const p = profile();
  const current = p.currentPretest;
  if (!current) return;
  stopPretestTimer();
  if (Array.isArray(current.modules)) {
    const moduleSpec = currentPretestModule(current);
    const finished = advancePretestModule({ timedOut: true, endedReason: "module_time_expired" });
    if (!pretestTimeoutAlertShown) {
      pretestTimeoutAlertShown = true;
      alert(finished ? "Time is up. The diagnostic has been submitted." : `${moduleSpec?.label || "Module"} time is up. SAT Studio moved to the next module.`);
    }
    return;
  }
  current.timedOut = true;
  current.endedReason = "time_expired";
  finishPretest({ timedOut: true, endedReason: "time_expired" });
  if (!pretestTimeoutAlertShown) {
    pretestTimeoutAlertShown = true;
    alert("Time is up. The diagnostic has been submitted; unanswered questions were marked incorrect.");
  }
}

function submitPretestAnswer() {
  const p = profile();
  const current = p.currentPretest;
  if (!current) return;

  const questionId = current.questionIds[current.currentIndex];
  const question = getQuestionById(questionId);
  if (!question) return;
  const submittedAnswer = pretestSelectedAnswer || currentDisplayedAnswer(question, "pretest-answer", els.pretestOptions);
  if (!submittedAnswer) return;
  pretestSelectedAnswer = submittedAnswer;

  const correct = isAnswerCorrect(question, submittedAnswer);
  const moduleSpec = currentPretestModule(current);
  current.answers.push({
    questionId,
    selectedAnswer: submittedAnswer,
    correct,
    moduleIndex: current.moduleIndex || 0,
    moduleLabel: moduleSpec?.label || "",
    adaptiveRoute: current.activeRoute || "",
  });

  recordAttempt(question, submittedAnswer, correct, true);

  if (current.currentIndex >= current.questionIds.length - 1) {
    if (Array.isArray(current.modules)) advancePretestModule();
    else finishPretest();
  } else {
    current.currentIndex += 1;
    saveState();
    renderPretest();
  }
}

function cancelPretest() {
  const vi = state.language === "vi";
  if (!window.confirm(vi ? "Thoát bài kiểm tra? Các đáp án chưa nộp sẽ không được lưu." : "Exit this diagnostic? Unsaved answers will not be kept.")) return;
  stopPretestTimer();
  profile().currentPretest = null;
  saveState();
  renderPretest();
}

function advancePretestModule(options = {}) {
  const p = profile();
  const current = p.currentPretest;
  if (!current || !Array.isArray(current.modules)) return true;

  completeUnansweredPretest(current, options);
  const moduleResult = summarizeCurrentPretestModule(current, options);
  current.moduleResults = Array.isArray(current.moduleResults) ? current.moduleResults : [];
  current.moduleResults.push(moduleResult);
  current.completedQuestionIds = unique([...(current.completedQuestionIds || []), ...(current.questionIds || [])]);

  const nextIndex = (current.moduleIndex || 0) + 1;
  if (nextIndex >= current.modules.length) {
    current.timedOut = Boolean(options.timedOut || current.moduleResults.some((item) => item.timedOut));
    finishPretest({ skipCompleteCurrent: true, endedReason: options.endedReason || "submitted" });
    return true;
  }

  const nextModule = current.modules[nextIndex];
  const route = diagnosticRouteForNextModule(current, nextModule);
  const nextQuestions = buildDiagnosticModuleSet(nextModule, route, current.completedQuestionIds || []);
  if (!nextQuestions.length) {
    alert(`No questions available for ${nextModule.label}. The diagnostic will be submitted with completed modules.`);
    finishPretest({ skipCompleteCurrent: true, endedReason: "partial_module_bank" });
    return true;
  }

  current.moduleIndex = nextIndex;
  current.questionIds = nextQuestions.map((question) => question.id);
  current.currentIndex = 0;
  current.activeRoute = route;
  current.moduleStartedAt = new Date().toISOString();
  current.timeLimitSeconds = (nextModule.timeLimitMinutes || 25) * 60;
  current.deadlineAt = new Date(Date.now() + (nextModule.timeLimitMinutes || 25) * 60 * 1000).toISOString();
  current.adaptiveRoutes = Array.isArray(current.adaptiveRoutes) ? current.adaptiveRoutes : [];
  current.adaptiveRoutes.push({ moduleIndex: nextIndex, label: nextModule.label, route });
  pretestSelectedAnswer = "";
  pretestTimeoutAlertShown = false;
  saveState();
  renderPretest();
  return false;
}

function summarizeCurrentPretestModule(current, options = {}) {
  const moduleSpec = currentPretestModule(current);
  return SatDiagnosticEngine.summarizeCurrentPretestModule(current, moduleSpec, options);
}

function diagnosticRouteForNextModule(current, nextModule) {
  if (SatAdaptiveRoutingEngine.routeForModule && nextModule?.adaptiveFromPreviousSection) {
    const previous = [...(current?.moduleResults || [])].reverse().find((item) => item.section === nextModule.section);
    if (previous) return SatAdaptiveRoutingEngine.routeForModule(previous, nextModule);
  }
  return SatDiagnosticEngine.routeForNextModule(current?.moduleResults || [], nextModule);
}

function finishPretest(options = {}) {
  const p = profile();
  const current = p.currentPretest;
  if (!current) return;

  stopPretestTimer();
  if (!options.skipCompleteCurrent) completeUnansweredPretest(current, options);
  const result = summarizeDiagnostic(current, options);
  p.pretests.unshift(result);
  recordLearningEvent(options.timedOut ? "diagnostic_timeout" : "diagnostic_completed", {
    entityType: "pretest",
    pretestId: result.id || current.id || "",
    mode: result.mode || current.mode || "",
    scoreEstimate: result.scoreEstimate || result.estimatedScore || result.score || null,
    total: Number(result.total || 0),
    correct: Number(result.correct || 0),
    accuracy: Number(result.accuracy || 0),
    timedOut: Boolean(options.timedOut || result.timedOut),
    weakestSubskill: result.adaptiveInsights?.weakestSubskill?.label || result.weakestSubskill || "",
  }, {
    occurredAt: result.completedAt || new Date().toISOString(),
    entityType: "pretest",
    entityId: result.id || current.id || "",
  });
  p.roadmap = buildRoadmap(result);
  p.roadmapLastBuiltAt = new Date().toISOString();
  p.roadmapBuildReason = options.timedOut ? "diagnostic_timeout" : "diagnostic_completed";
  p.currentPretest = null;
  startLearnerAnalysis(options.timedOut ? "pretest_timeout" : "pretest", 1600);
  saveState();
  requestLearningProfileSync(options.timedOut ? "diagnostic_timeout" : "diagnostic_completed", { immediate: true });
  render();
  switchView("roadmap");
}

function completeUnansweredPretest(pretest, options = {}) {
  captureDisplayedPretestAnswer(pretest, options);
  const answered = new Set(pretest.answers.map((answer) => answer.questionId));
  const moduleSpec = currentPretestModule(pretest);
  pretest.questionIds.forEach((questionId) => {
    if (!answered.has(questionId)) {
      const question = getQuestionById(questionId);
      pretest.answers.push({
        questionId,
        selectedAnswer: "",
        correct: false,
        skipped: true,
        timedOut: Boolean(options.timedOut || pretest.timedOut),
        moduleIndex: pretest.moduleIndex || 0,
        moduleLabel: moduleSpec?.label || "",
        adaptiveRoute: pretest.activeRoute || "",
      });
      if (question) {
        recordAttempt(question, "", false, true, {
          errorType: options.timedOut || pretest.timedOut ? "time_pressure" : "skipped",
          timedOut: Boolean(options.timedOut || pretest.timedOut),
        });
      }
    }
  });
}

function captureDisplayedPretestAnswer(pretest, options = {}) {
  const current = profile().currentPretest;
  if (!pretest || pretest !== current) return;
  const questionId = pretest.questionIds?.[pretest.currentIndex];
  if (!questionId || pretest.answers.some((answer) => answer.questionId === questionId)) return;
  const question = getQuestionById(questionId);
  if (!question) return;
  const displayedAnswer = pretestSelectedAnswer || currentDisplayedAnswer(question, "pretest-answer", els.pretestOptions);
  if (!displayedAnswer) return;
  const correct = isAnswerCorrect(question, displayedAnswer);
  const moduleSpec = currentPretestModule(pretest);
  pretest.answers.push({
    questionId,
    selectedAnswer: displayedAnswer,
    correct,
    timedOut: Boolean(options.timedOut || pretest.timedOut),
    moduleIndex: pretest.moduleIndex || 0,
    moduleLabel: moduleSpec?.label || "",
    adaptiveRoute: pretest.activeRoute || "",
  });
  recordAttempt(question, displayedAnswer, correct, true, {
    errorType: options.timedOut || pretest.timedOut ? "time_pressure" : "",
    timedOut: Boolean(options.timedOut || pretest.timedOut),
  });
}

function summarizeDiagnostic(pretest, options = {}) {
  const summary = SatDiagnosticEngine.summarizeDiagnostic(pretest, {
    difficultyWeight,
    estimateSectionScore,
    estimateSectionScoreBand,
    getCorrectAnswerLabel,
    getQuestionById,
    options,
    testModeMeta,
  });
  if (SatAdaptiveRoutingEngine.buildAdaptiveRoutingProfile) {
    const account = currentAccount();
    const routingProfile = SatAdaptiveRoutingEngine.buildAdaptiveRoutingProfile(summary, {
      targetScore: account?.targetScore,
      nowIso: new Date().toISOString(),
    });
    summary.adaptiveRouting = routingProfile;
    summary.adaptiveInsights = {
      ...(summary.adaptiveInsights || {}),
      routingProfile,
      routingConfidence: routingProfile.routingConfidence,
      scoreSignals: routingProfile.scoreSignals,
      prioritySkills: routingProfile.prioritySkills,
      priorityDomains: routingProfile.priorityDomains,
      nextAction: routingProfile.nextActions?.[0]?.detail || summary.adaptiveInsights?.nextAction || "",
    };
  }
  return summary;
}

function summarizeBy(answers, key) {
  return SatDiagnosticEngine.summarizeBy(answers, key, { difficultyWeight, getQuestionById });
}

function estimateSectionScore(summary) {
  return SatCore.estimateSectionScore
    ? SatCore.estimateSectionScore(summary)
    : Math.round((200 + ((summary?.weightedTotal ? summary.weightedCorrect / summary.weightedTotal : summary?.correct / summary?.total) || 0) * 600) / 10) * 10;
}

function estimateSectionScoreBand(summary) {
  if (SatCore.estimateSectionScoreBand) return SatCore.estimateSectionScoreBand(summary);
  const estimate = estimateSectionScore(summary);
  const low = Math.max(200, Math.round((estimate - 80) / 10) * 10);
  const high = Math.min(800, Math.round((estimate + 80) / 10) * 10);
  return { estimate, low, high, confidence: "low", evidenceCount: Number(summary?.total) || 0, label: `${low}-${high}` };
}

function difficultyWeight(difficulty) {
  return SatCore.difficultyWeight ? SatCore.difficultyWeight(difficulty) : { Easy: 1, Medium: 1.35, Hard: 1.75 }[difficulty] || 1.2;
}

function computeSkillMasteryRows(p = profile()) {
  return SatMasteryEngine.computeSkillMasteryRows(p, {
    difficultyWeight,
    getQuestionById,
    suggestErrorType,
    templateFormId,
  });
}

function refreshStoredSkillMastery() {
  const p = profile();
  const rows = computeSkillMasteryRows(p);
  p.skillMastery = Object.fromEntries(
    rows.map((item) => [
      item.key,
      {
        section: item.section,
        domain: item.domain,
        skill: item.skill,
        attempts: item.attempts,
        accuracy: item.accuracy,
        mastery: item.mastery,
        status: item.status,
        masteryStage: item.masteryStage,
        dominantErrorType: item.dominantErrorType,
        priorityScore: item.priorityScore,
        lastAttemptAt: item.lastAttemptAt,
      },
    ]),
  );
  return rows;
}

function buildSkillMastery() {
  return refreshStoredSkillMastery();
}

function dominantErrorTypeFor(errorTypes = {}) {
  return SatMasteryEngine.dominantErrorTypeFor(errorTypes);
}

function masteryStatus(item, mastery) {
  return SatMasteryEngine.masteryStatus(item, mastery);
}

function masteryStageFor(item, mastery, dominantErrorType = dominantErrorTypeFor(item.errorTypes), repeatedFormWrong = 0) {
  return SatMasteryEngine.masteryStageFor(item, mastery, dominantErrorType, repeatedFormWrong);
}

function masteryStageExit(stage) {
  return SatMasteryEngine.masteryStageExit(stage);
}

function masteryActionFor(errorType, item) {
  return SatMasteryEngine.masteryActionFor(errorType, item);
}

function buildMasteryRoadmap(diagnostic = null) {
  const masteryRows = buildSkillMastery();
  if (!masteryRows.length) return [];

  const weak = masteryRows.filter((item) => item.status !== "Mastered");
  const priority = weak.slice(0, 4);
  if (!priority.length) {
    return [
      {
        title: "Maintain mastered skills",
        source: "Mastery engine",
        detail: "Current tracked skills are mastered. Keep one mixed timed module and one hard-question review each week.",
        action: "Weekly maintenance",
        exitCondition: "No recent wrong attempts for 14 days.",
      },
    ];
  }

  const first = priority[0];
  const second = priority[1];
  const timedTargets = priority.filter((item) => item.mastery >= 65).slice(0, 3);
  const foundationTargets = priority.filter((item) => item.mastery < 65).slice(0, 3);

  return [
    {
      title: `Repair ${first.skill}`,
      source: "Mastery engine from attempts, error tags, and diagnostic data",
      detail: `${first.status}: mastery ${first.mastery}%, ${first.correct}/${first.attempts} correct. Main error: ${errorTagLabel(first.dominantErrorType)}. ${first.action}.`,
      action: "Lesson + targeted set",
      targets: [
        practiceTargetFromSummary(first, {
          label: first.skill,
          section: first.section,
          domain: first.domain,
          skill: first.skill,
          difficulty: first.mastery < 65 ? "Easy" : "All",
        }),
      ],
      exitCondition: "Reach 80%+ on 10 new questions, including at least 2 medium/hard items.",
    },
    {
      title: second ? `Build transfer for ${second.skill}` : "Build transfer across weak forms",
      source: "Tutor-style error log",
      detail: second
        ? `${second.status}: mastery ${second.mastery}%, main error ${errorTagLabel(second.dominantErrorType)}. Do new contexts, not only number-swaps.`
        : "Use mistake notes to name the exact reason before doing another question.",
      action: "15-question transfer set",
      targets: (second ? [second] : priority).slice(0, 2).map((item) =>
        practiceTargetFromSummary(item, {
          label: item.skill,
          section: item.section,
          domain: item.domain,
          skill: item.skill,
        }),
      ),
      exitCondition: "Correct 3 variants without seeing the same template again.",
    },
    {
      title: "Stop repetition after mastery",
      source: "Template-diversity policy",
      detail: "If a template form has been passed, hide near-duplicates. If it has not been passed, keep at most a few useful variants and prefer round-number mental-math versions.",
      action: "Adaptive question pool",
      targets: foundationTargets.map((item) =>
        practiceTargetFromSummary(item, {
          label: item.skill,
          section: item.section,
          domain: item.domain,
          skill: item.skill,
        }),
      ),
      exitCondition: "No easy repeated-form wrong answers remain.",
    },
    {
      title: "Move skills into timed performance",
      source: "Bluebook-style pacing",
      detail: timedTargets.length
        ? `Timed work is ready for ${timedTargets.map((item) => item.skill).join(", ")}.`
        : "Keep work untimed until at least one priority skill reaches 65% mastery.",
      action: "Timed mini-module",
      targets: timedTargets.map((item) =>
        practiceTargetFromSummary(item, {
          label: item.skill,
          section: item.section,
          domain: item.domain,
          skill: item.skill,
          difficulty: "Medium",
        }),
      ),
      exitCondition: "Keep accuracy within 10 points of untimed accuracy.",
    },
    {
      title: "Weekly roadmap review",
      source: "Parent/admin review loop",
      detail: `Auto-refresh runs every 10 practice attempts. Manual review is still useful after a pretest, a full-length test, or a cluster of repeated ${errorTagLabel(first.dominantErrorType)} errors.`,
      action: "Review once per week",
      actionType: "review",
      exitCondition: diagnostic ? `Current diagnostic baseline: ${diagnostic.scoreEstimate || "--"}.` : "Update after next diagnostic or 30 new questions.",
    },
  ];
}

function buildRoadmap(diagnostic) {
  if (SatRoadmapEngine.buildRoadmapV2) {
    const v2 = SatRoadmapEngine.buildRoadmapV2({
      diagnostic,
      skillRows: buildSkillMatrix(),
      remediationQueue: buildAdaptiveRemediationQueue({ includeFuture: true, includePassed: false, limit: 20 }),
      targetScore: currentAccount()?.targetScore,
      profile: profile(),
      account: currentAccount(),
      nowIso: new Date().toISOString(),
    });
    if (v2.length) return v2;
  }

  const masterySteps = buildMasteryRoadmap(diagnostic);
  if (masterySteps.length) return masterySteps;

  return SatRoadmapEngine.buildDiagnosticRoadmap(diagnostic);
}

function practiceTargetFromSummary(item, overrides = {}) {
  return SatRoadmapEngine.practiceTargetFromSummary(item, overrides);
}

function renderPretestResults() {
  const tests = profile().pretests || [];
  const vi = state.language === "vi";
  if (!tests.length) {
    els.pretestResults.innerHTML = `<div class="empty-state">${vi ? "Chưa có kết quả kiểm tra đầu vào." : "No diagnostic result yet."}</div>`;
    return;
  }

  els.pretestResults.innerHTML = `
    <section class="pretest-history-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">${vi ? "Lịch sử kiểm tra" : "Diagnostic history"}</p>
          <h3>${vi ? "Các bài đã làm" : "Completed tests"}</h3>
          <p class="muted">${vi ? "Chỉ mở chi tiết khi cần xem lại đáp án, lỗi sai hoặc kỹ năng yếu." : "Results are summarized here. Open a test only when you need the full answer review."}</p>
        </div>
      </div>
      <div class="pretest-history-list">
        ${tests.slice(0, 12).map((test, index) => renderPretestHistoryCard(test, index)).join("")}
      </div>
    </section>
  `;
}

function renderPretestHistoryCard(test, index) {
  const vi = state.language === "vi";
  const key = pretestResultKey(test, index);
  const open = expandedPretestResultId === key;
  const correct = Number(test.correct || 0);
  const total = Number(test.total || test.reviewItems?.length || 0);
  const wrong = Math.max(0, total - correct);
  const noAnswer = countPretestNoAnswers(test);
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const latestBadge = index === 0 ? `<span class="pill">${vi ? "Gần nhất" : "Latest"}</span>` : "";
  const scoreLabel = diagnosticScoreLabel(test);
  const confidenceNote = diagnosticConfidenceNote(test, vi);
  const confidenceBand = SatStudentExperienceEngine.diagnosticConfidenceBand(test, { vi, noAnswer: countPretestNoAnswers(test) });
  const sections = [
    `RW ${formatSectionScore(test.sectionScores?.["Reading and Writing"], test.sectionScoreBands?.["Reading and Writing"])}`,
    `Math ${formatSectionScore(test.sectionScores?.Math, test.sectionScoreBands?.Math)}`,
  ].join(" - ");
  return `
    <article class="pretest-history-card ${index === 0 ? "is-latest" : ""}">
      <div class="pretest-history-summary">
        <div class="pretest-history-title">
          <div class="pretest-history-kicker">${latestBadge}<span>${escapeHtml(formatDateTime(test.completedAt || test.startedAt))}</span></div>
          <h3>${escapeHtml(test.label || "Preview")}</h3>
          <p>${escapeHtml(scoreLabel)} - ${escapeHtml(sections)}</p>
          <p class="muted">${escapeHtml(confidenceNote)}</p>
        </div>
        <div class="pretest-result-metrics" aria-label="Diagnostic result summary">
          ${renderPretestResultMetric(vi ? "Điểm" : "Score", test.scoreBand?.label || test.scoreEstimate || "--")}
          ${renderPretestResultMetric(vi ? "Đúng" : "Correct", `${correct}/${total}`)}
          ${renderPretestResultMetric(vi ? "Sai" : "Wrong", wrong)}
          ${renderPretestResultMetric(vi ? "Bỏ trống" : "No answer", noAnswer)}
          ${renderPretestResultMetric(vi ? "Độ chính xác" : "Accuracy", `${accuracy}%`)}
          ${renderPretestResultMetric(vi ? "Tin cậy" : "Confidence", confidenceBand.label)}
        </div>
        <button class="button secondary pretest-detail-toggle" type="button" data-pretest-result-toggle="${escapeHtml(key)}" aria-expanded="${open ? "true" : "false"}">
          ${open ? (vi ? "Ẩn chi tiết" : "Hide details") : (vi ? "Xem chi tiết" : "View details")}
        </button>
      </div>
      ${index === 0 && !open ? `${renderPretestCoachSummary(test)}${SatStudentExperienceEngine.renderPretestConfidenceBandCard(test, { vi, noAnswer: countPretestNoAnswers(test) })}${renderPretestActionPlan(test)}` : ""}
      ${open ? renderPretestResultDetail(test) : ""}
    </article>
  `;
}

function renderPretestCoachSummary(test) {
  return SatStudentExperienceEngine.renderPretestCoachSummary(test, { vi: state.language === "vi", noAnswer: countPretestNoAnswers(test), scoreLabel: diagnosticScoreLabel(test), plan: buildPretestFixPlan(test), next: buildPretestNextBestAction(test) });
}

function diagnosticConfidenceNote(test, vi = false) {
  const total = Number(test?.total || test?.reviewItems?.length || 0);
  if (total <= 20) {
    return vi
      ? "\u0110\u00e2y l\u00e0 \u01b0\u1edbc l\u01b0\u1ee3ng s\u00e0ng l\u1ecdc nhanh; l\u00e0m b\u00e0i full/module sau m\u1ed9t block h\u1ecdc \u0111\u1ec3 kh\u00f3a band ch\u1eafc h\u01a1n."
      : "This is a quick screening estimate; use a full/module test after one study block to confirm the band.";
  }
  return vi
    ? "Band n\u00e0y \u0111\u00e1ng tin h\u01a1n v\u00ec d\u1ef1a tr\u00ean b\u00e0i d\u00e0i/module."
    : "This band is more reliable because it comes from a full/module-length diagnostic.";
}

function buildPretestFixPlan(test) {
  const seen = new Set();
  return (test?.reviewItems || [])
    .filter((item) => !item.correct)
    .map((item) => {
      const question = getQuestionById(item.questionId);
      if (!question) return null;
      const key = lessonScopeKey(question);
      if (seen.has(key)) return null;
      seen.add(key);
      const lesson = getKnowledgeReviewLesson(question);
      const errorType = suggestErrorType(question, false, { skipped: !item.selectedAnswer });
      return { item, question, lesson, errorType };
    })
    .filter(Boolean)
    .slice(0, 3);
}

function buildPretestNextBestAction(test) {
  return SatStudentExperienceEngine.buildPretestNextBestAction({ test, plan: buildPretestFixPlan(test), vi: state.language === "vi" });
}

function buildStudentPriorityModel(latest = latestPretest(), weakSkills = []) {
  const plan = buildPretestFixPlan(latest);
  const seen = new Set();
  const scopes = [];
  const pushScope = (scope) => {
    if (!scope) return;
    const key = lessonScopeKey(scope);
    if (!key || seen.has(key)) return;
    seen.add(key);
    scopes.push(scope);
  };
  plan.forEach((item) => pushScope(item.question));
  (Array.isArray(weakSkills) ? weakSkills : []).forEach(pushScope);
  return { plan, scopes };
}

function renderPretestActionPlan(test) {
  const plan = buildPretestFixPlan(test);
  const vi = state.language === "vi";
  const next = buildPretestNextBestAction(test);
  const nextScope = next.scope || {};
  const nextAttrs = `data-section="${escapeHtml(nextScope.section || "All")}" data-domain="${escapeHtml(nextScope.domain || "All")}" data-skill="${escapeHtml(nextScope.skill || "All")}" data-difficulty="${escapeHtml(nextScope.difficulty || "All")}" data-source="${escapeHtml(nextScope.source || "All")}"`;
  if (!plan.length) {
    return `
      <section class="pretest-action-plan is-clear">
        <div>
          <p class="eyebrow">${vi ? "K\u1ebf ho\u1ea1ch sau test" : "Post-test plan"}</p>
          <h4>${vi ? "Kh\u00f4ng c\u00f3 l\u1ed7i \u01b0u ti\u00ean trong b\u00e0i n\u00e0y" : "No priority misses in this test"}</h4>
          <p>${vi ? "Gi\u1eef nh\u1ecbp b\u1eb1ng m\u1ed9t set timed practice ho\u1eb7c l\u00e0m full-length khi c\u00f3 th\u1eddi gian." : "Keep momentum with a timed practice set or a full-length test when you have time."}</p>
        </div>
        <article class="pretest-next-best-action">
          <span>${vi ? "Việc cần làm ngay" : "Next Best Action"}</span>
          <strong>${escapeHtml(next.title)}</strong>
          <p>${escapeHtml(next.body)}</p>
          <button class="button primary" type="button" data-pretest-plan-action="${escapeHtml(next.action)}" ${nextAttrs}>${escapeHtml(next.button)}</button>
        </article>
      </section>
    `;
  }
  return `
    <section class="pretest-action-plan">
      <div class="pretest-action-plan-head">
        <div>
          <p class="eyebrow">${vi ? "K\u1ebf ho\u1ea1ch sau test" : "Post-test plan"}</p>
          <h4>${vi ? "3 l\u1ed7i \u0111ang k\u00e9o \u0111i\u1ec3m" : "3 fixes to do first"}</h4>
          <p>${vi ? "\u0110\u1ecdc quy t\u1eafc ng\u1eafn, luy\u1ec7n c\u00f9ng k\u1ef9 n\u0103ng, r\u1ed3i l\u00e0m c\u00e2u ch\u1ee9ng minh \u0111\u1ec3 x\u00f3a l\u1ed7i." : "Read the short rule, practice the same skill, then pass proof work."}</p>
        </div>
        <button class="button primary" type="button" data-pretest-plan-action="${escapeHtml(next.action)}" ${nextAttrs}>${escapeHtml(next.button)}</button>
      </div>
      <article class="pretest-next-best-action">
        <span>${vi ? "Vi\u1ec7c duy nh\u1ea5t c\u1ea7n l\u00e0m ngay" : "Single Next Best Action"}</span>
        <strong>${escapeHtml(next.title)}</strong>
        <p>${escapeHtml(next.body)}</p>
      </article>
      <div class="pretest-action-plan-grid">
        ${plan
          .map(({ question, lesson, errorType }, index) => {
            const attrs = `data-section="${escapeHtml(question.section)}" data-domain="${escapeHtml(question.domain)}" data-skill="${escapeHtml(question.skill)}"`;
            return `
              <article>
                <span>${index + 1}</span>
                <strong>${escapeHtml(question.skill)}</strong>
                <small>${escapeHtml(question.domain)} - ${escapeHtml(errorTagLabel(errorType))}</small>
                <p>${escapeHtml(vi ? "\u0110\u1ecdc l\u1ea1i quy t\u1eafc c\u1ee7a k\u1ef9 n\u0103ng n\u00e0y, ch\u00fa \u00fd b\u1eaby, r\u1ed3i luy\u1ec7n c\u00e2u c\u00f9ng d\u1ea1ng." : lesson.rule || "Review the rule, then do a same-skill question.")}</p>
                <div class="answer-actions">
                  <button class="button secondary" type="button" data-pretest-plan-action="lesson" ${attrs}>${vi ? "M\u1edf b\u00e0i" : "Open lesson"}</button>
                  <button class="button secondary" type="button" data-pretest-plan-action="practice" ${attrs}>${vi ? "Luy\u1ec7n c\u00f9ng d\u1ea1ng" : "Practice skill"}</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function plainTextSnippet(value, max = 220) {
  const text = String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function selectedAnswerTrapReason(question, item, lesson) {
  if (state.language === "vi") {
    return "Đáp án sai thường hấp dẫn vì có từ/cụm cùng chủ đề nhưng không chứng minh đúng điều kiện đề hỏi.";
  }
  const selected = item?.selectedAnswer || "";
  const explanation = question?.explanation;
  if (selected && explanation && typeof explanation === "object") {
    const distractor = explanation.distractors?.[selected] || explanation.wrongChoices?.[selected] || explanation.choices?.[selected];
    if (distractor) return plainTextSnippet(distractor);
  }
  if (Array.isArray(lesson?.traps) && lesson.traps.length) return lesson.traps[0];
  return state.language === "vi"
    ? "Lựa chọn sai thường hấp dẫn vì có từ/cụm đúng chủ đề nhưng không trả lời đúng điều kiện đề hỏi."
    : "The wrong choice is tempting because it may match the topic while missing the exact condition asked.";
}

function studentLessonRuleText(lesson = {}, vi = state.language === "vi") {
  if (!vi) return lesson.rule || "Review the rule, then prove it with a new same-skill question.";
  return "Đọc lại quy tắc của kỹ năng này, xác định chính xác đề đang hỏi gì, rồi chứng minh đáp án bằng dữ kiện trong câu hỏi.";
}

function studentLessonTrapText(lesson = {}, vi = state.language === "vi", correct = false) {
  if (!vi) {
    if (Array.isArray(lesson.traps) && lesson.traps.length) return lesson.traps[0];
    return correct ? "Do not rush; keep the same proof steps." : "Wrong choices often match the topic but miss a condition.";
  }
  return correct
    ? "Giữ đúng bước giải; đừng tăng tốc đến mức bỏ qua kiểm tra cuối."
    : "Đáp án sai thường trông hợp lý vì giống chủ đề, nhưng thiếu điều kiện hoặc bằng chứng trực tiếp.";
}

function studentLessonStepLines(lesson = {}, vi = state.language === "vi") {
  if (!vi) {
    if (Array.isArray(lesson.steps) && lesson.steps.length) return lesson.steps.map((step) => `${step?.[0] || "Step"}: ${step?.[1] || ""}`.trim());
    return ["Mark the task, find the proof, then choose."];
  }
  return [
    "Gạch đúng yêu cầu đề hỏi.",
    "Tìm dữ kiện, công thức, hoặc bằng chứng trước khi nhìn đáp án.",
    "Sau khi chọn, tự nói vì sao 3 đáp án còn lại sai.",
  ];
}

function studentLessonMethodText(lesson = {}, vi = state.language === "vi") {
  return studentLessonStepLines(lesson, vi).slice(0, 2).join(" ");
}

function studentLessonProofText(lesson = {}, vi = state.language === "vi") {
  if (!vi) return lesson.drill || "Pass one fresh same-skill question.";
  return "Làm đúng một câu mới cùng kỹ năng, đúng nhịp, và tự giải thích được vì sao đáp án đúng.";
}

function renderPretestLearningCard(question, item) {
  const vi = state.language === "vi";
  const lesson = getKnowledgeReviewLesson(question);
  const errorType = suggestErrorType(question, false, { skipped: !item?.selectedAnswer, timedOut: item?.timedOut });
  const proofQuestion = chooseProofQuestionForAttempt(question, {
    questionId: question.id,
    selectedAnswer: item?.selectedAnswer || "",
    correct: false,
    errorType,
    practiceMode: "pretest",
  });
  const attrs = `data-section="${escapeHtml(question.section)}" data-domain="${escapeHtml(question.domain)}" data-skill="${escapeHtml(question.skill)}"`;
  return `
    <section class="pretest-learning-card">
      <div>
        <p class="eyebrow">${vi ? "Bài học rút ra" : "Learning card"}</p>
        <h4>${escapeHtml(errorTagLabel(errorType))}</h4>
      </div>
      <div class="pretest-learning-grid">
        <div><span>${vi ? "Quy tắc" : "Rule"}</span><p>${escapeHtml(studentLessonRuleText(lesson, vi))}</p></div>
        <div><span>${vi ? "Vì sao sai hấp dẫn" : "Why the trap worked"}</span><p>${escapeHtml(selectedAnswerTrapReason(question, item, lesson))}</p></div>
        <div><span>${vi ? "Cách tránh lần sau" : "Next time"}</span><p>${escapeHtml(studentLessonMethodText(lesson, vi))}</p></div>
        <div><span>${vi ? "Chứng minh" : "Proof"}</span><p>${escapeHtml(proofQuestion ? `${studentUiLabel(proofQuestion.difficulty)} - ${proofQuestion.skill}` : studentLessonProofText(lesson, vi))}</p></div>
      </div>
      <div class="answer-actions">
        <button class="button secondary" type="button" data-pretest-plan-action="lesson" ${attrs}>${vi ? "Mở bài học" : "Open lesson"}</button>
        <button class="button secondary" type="button" data-pretest-plan-action="practice" ${attrs}>${vi ? "Làm câu tương tự" : "Practice similar"}</button>
      </div>
    </section>
  `;
}

function renderPretestResultMetric(label, value) {
  return `
    <span>
      <small>${escapeHtml(label)}</small>
      <strong>${escapeHtml(String(value))}</strong>
    </span>
  `;
}

function renderPretestResultDetail(test) {
  const missedCount = (test?.reviewItems || []).filter((item) => !item.correct).length;
  const vi = state.language === "vi";
  const studentMode = currentAccount()?.role === "student";
  const active = ["overview", "fix", "skills", "all"].includes(activePretestResultTab) ? activePretestResultTab : "overview";
  const tabContent = {
    overview: renderPretestOverview(test),
    fix: missedCount
      ? renderDiagnosticReview(test, { onlyMissed: true })
      : `<div class="empty-state">${vi ? "Bài này không có câu sai/bỏ trống." : "This test has no wrong or skipped questions."}</div>`,
    skills: renderPretestWeakSkillSummary(test),
    all: renderDiagnosticReview(test),
  }[active];
  return `
    <div class="pretest-history-detail">
      <div class="pretest-detail-grid">
        ${renderPretestDetailStatus(test)}
        ${studentMode ? "" : renderDiagnosticModuleSummary(test)}
        ${studentMode ? "" : renderDiagnosticRoadmapSeedSummary(test)}
      </div>
      <div class="pretest-review-heading">
        <div>
          <p class="eyebrow">${vi ? "\u00d4n l\u1ed7i sau test" : "Post-test review"}</p>
          <h4>${vi ? "Mở đúng phần cần xem" : "Open only what you need"}</h4>
        </div>
      </div>
      <div class="pretest-result-tabs" role="tablist" aria-label="${vi ? "Tab kết quả pretest" : "Pretest result tabs"}">
        ${renderPretestResultTabButton("overview", vi ? "Tổng quan" : "Overview", active)}
        ${renderPretestResultTabButton("fix", vi ? `Cần sửa (${missedCount})` : `Fix first (${missedCount})`, active)}
        ${renderPretestResultTabButton("skills", vi ? "Kỹ năng yếu" : "Weak skills", active)}
        ${renderPretestResultTabButton("all", vi ? "Toàn bộ câu" : "All questions", active)}
      </div>
      <div class="pretest-result-tab-panel">${tabContent}</div>
    </div>
  `;
}

function renderPretestOverview(test) {
  const vi = state.language === "vi";
  const correct = Number(test?.correct || 0);
  const total = Number(test?.total || test?.reviewItems?.length || 0);
  const wrong = Math.max(0, total - correct);
  const noAnswer = countPretestNoAnswers(test);
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  return `
    <section class="pretest-overview-panel">
      <div class="pretest-overview-metrics">
        ${renderPretestResultMetric(vi ? "Điểm ước lượng" : "Estimated score", diagnosticScoreLabel(test))}
        ${renderPretestResultMetric(vi ? "Đúng" : "Correct", `${correct}/${total}`)}
        ${renderPretestResultMetric(vi ? "Sai" : "Wrong", wrong)}
        ${renderPretestResultMetric(vi ? "Bỏ trống" : "No answer", noAnswer)}
        ${renderPretestResultMetric(vi ? "Độ chính xác" : "Accuracy", `${accuracy}%`)}
      </div>
      ${renderPretestCoachSummary(test)}
      ${SatStudentExperienceEngine.renderPretestConfidenceBandCard(test, { vi, noAnswer: countPretestNoAnswers(test) })}
      ${renderPretestActionPlan(test)}
      <div class="pretest-overview-skills">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">${vi ? "Kỹ năng cần ưu tiên" : "Priority skills"}</p>
            <h4>${vi ? "Top cụm lỗi từ bài này" : "Top error clusters from this test"}</h4>
          </div>
        </div>
        ${renderPretestWeakSkillSummary(test)}
      </div>
    </section>
  `;
}

function renderPretestResultTabButton(tab, label, active) {
  return `
    <button
      class="subview-tab ${active === tab ? "active" : ""}"
      type="button"
      role="tab"
      aria-selected="${active === tab ? "true" : "false"}"
      data-pretest-detail-tab="${escapeHtml(tab)}"
    >${escapeHtml(label)}</button>
  `;
}

function renderPretestWeakSkillSummary(test) {
  const rows = new Map();
  (test?.reviewItems || []).forEach((item) => {
    if (item.correct) return;
    const question = getQuestionById(item.questionId);
    if (!question) return;
    const key = `${question.section}|${question.domain}|${question.skill}`;
    const row = rows.get(key) || {
      section: question.section,
      domain: question.domain,
      skill: question.skill,
      wrong: 0,
      noAnswer: 0,
      hard: 0,
      errorTypes: new Map(),
    };
    row.wrong += 1;
    if (!item.selectedAnswer) row.noAnswer += 1;
    if (question.difficulty === "Hard") row.hard += 1;
    const errorType = suggestErrorType(question, false, { skipped: !item.selectedAnswer, timedOut: item.timedOut });
    row.errorTypes.set(errorType, (row.errorTypes.get(errorType) || 0) + 1);
    rows.set(key, row);
  });
  const vi = state.language === "vi";
  const ranked = [...rows.values()]
    .map((row) => ({
      ...row,
      topError: [...row.errorTypes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown",
    }))
    .sort((a, b) => b.wrong - a.wrong || b.hard - a.hard || a.skill.localeCompare(b.skill))
    .slice(0, 6);
  if (!ranked.length) {
    return `<div class="empty-state">${vi ? "Chưa có cụm kỹ năng yếu trong bài này." : "No weak-skill cluster in this test."}</div>`;
  }
  return `
    <div class="pretest-weak-skill-list">
      ${ranked
        .map(
          (row, index) => `
            <article class="pretest-weak-skill-card">
              <span>${index + 1}</span>
              <div>
                <strong>${escapeHtml(row.skill)}</strong>
                <small>${escapeHtml(row.domain)} · ${escapeHtml(row.section)}</small>
                <p>${vi ? "Ưu tiên ôn" : "Review focus"}: ${escapeHtml(errorTagLabel(row.topError))}. ${vi ? "Sai/bỏ trống" : "Wrong/skipped"} ${Number(row.wrong)}${row.noAnswer ? ` · ${vi ? "bỏ trống" : "no answer"} ${Number(row.noAnswer)}` : ""}.</p>
              </div>
              <button class="button secondary" type="button" data-pretest-plan-action="practice" data-section="${escapeHtml(row.section)}" data-domain="${escapeHtml(row.domain)}" data-skill="${escapeHtml(row.skill)}">${vi ? "Luyện" : "Practice"}</button>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderPretestDetailStatus(test) {
  if (!test?.timeLimitSeconds) return "";
  const vi = state.language === "vi";
  const text = test.timedOut
    ? vi
      ? `Hết giờ sau ${formatDuration(test.timeLimitSeconds || 0)}. Câu bỏ trống được tính sai.`
      : `Time expired after ${formatDuration(test.timeLimitSeconds || 0)}. Unanswered questions were marked incorrect.`
    : vi
      ? `Hoàn thành trong giới hạn ${formatDuration(test.timeLimitSeconds || 0)}.`
      : `Completed within ${formatDuration(test.timeLimitSeconds || 0)} limit.`;
  return `<p class="${test.timedOut ? "pretest-timeout-note" : "muted"}">${escapeHtml(text)}</p>`;
}

function pretestResultKey(test, index) {
  return String(test?.id || test?.completedAt || test?.startedAt || `pretest-${index}`);
}

function countPretestNoAnswers(test) {
  return (test?.reviewItems || []).filter((item) => !item.selectedAnswer).length;
}

function renderDiagnosticModuleSummary(test) {
  const modules = Array.isArray(test?.moduleResults) ? test.moduleResults : [];
  if (!modules.length) return "";
  const insights = Array.isArray(test?.adaptiveInsights?.moduleInsights) ? test.adaptiveInsights.moduleInsights : modules;
  return `
    <div class="diagnostic-module-grid">
      ${insights
        .map(
          (item) => `
            <article>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(labelFor(item.route || "standard"))} route - ${item.correct}/${item.total} - ${item.accuracy}%</span>
              ${item.readinessBand ? `<span>${escapeHtml(labelFor(item.readinessBand))}</span>` : ""}
              ${item.rationale ? `<small>${escapeHtml(item.rationale)}</small>` : ""}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderDiagnosticRoadmapSeedSummary(test) {
  const insights = test?.adaptiveInsights || {};
  const seeds = Array.isArray(insights.roadmapSeeds) ? insights.roadmapSeeds.slice(0, 3) : [];
  if (!seeds.length && !insights.nextAction) return "";
  const seedCards = seeds
    .map(
      (seed) => `
        <article>
          <strong>${escapeHtml(seed.skill && seed.skill !== "All" ? seed.skill : seed.domain || seed.label)}</strong>
          <span>${escapeHtml(seed.rootCause || seed.dueReason || "Diagnostic v2 roadmap seed")}</span>
          <small>${escapeHtml(seed.proofCondition || "Pass a proof item before retest.")}</small>
        </article>
      `,
    )
    .join("");
  const weakest = insights.weakestSubskill?.label || insights.weakestSubskill?.skill || "";
  return `
    <div class="diagnostic-module-grid">
      ${
        weakest
          ? `<article><strong>Weakest subskill</strong><span>${escapeHtml(weakest)}</span><small>${escapeHtml(insights.nextAction || "Roadmap will refresh from diagnostic v2.")}</small></article>`
          : ""
      }
      ${seedCards}
    </div>
  `;
}

function renderDiagnosticReview(test, options = {}) {
  const scopedTest = options.onlyMissed
    ? { ...test, reviewItems: (test?.reviewItems || []).filter((item) => !item.correct) }
    : test;
  return SatViewRenderers.renderDiagnosticReview
    ? SatViewRenderers.renderDiagnosticReview(scopedTest, {
        getQuestionById,
        isGridInQuestion,
        labelFor,
        renderExplanation,
        renderPretestLearningCard,
        language: state.language,
        studentMode: currentAccount()?.role === "student",
      })
    : '<div class="pretest-review-list"></div>';
}

function buildRoadmapEvaluation(skillRows = buildSkillMatrix(), roadmap = []) {
  const p = profile();
  return SatRoadmapEngine.buildRoadmapEvaluation({
    skillRows,
    roadmap,
    profile: p,
    latest: latestPretest(),
    targetScore: currentAccount()?.targetScore,
    errorTagLabel,
  });
}

function roadmapDataConfidence({ latest, attempts, practiceAttempts, taggedErrors, skillRows }) {
  return SatRoadmapEngine.roadmapDataConfidence({ latest, attempts, practiceAttempts, taggedErrors, skillRows });
}

function practiceAttemptsSinceRoadmapBuild(p = profile()) {
  return SatRoadmapEngine.practiceAttemptsSinceRoadmapBuild(p);
}

function topAttemptErrorSummary(attempts = []) {
  return SatRoadmapEngine.topAttemptErrorSummary(attempts, { errorTagLabel });
}

function buildEliteReadiness(skillRows = buildSkillMatrix(), evaluation = buildRoadmapEvaluation(skillRows)) {
  const p = profile();
  return SatRoadmapEngine.buildEliteReadiness({
    skillRows,
    evaluation,
    latest: latestPretest(),
    attempts: p.attempts || [],
    pretests: p.pretests || [],
    visibleStudyQuestions: visibleQuestionBank().filter(isStudyAvailableQuestion),
    allQuestions: state.questions,
    dueReviewCount: getDueQuestionIds().length,
    externalStudyLogs: p.externalStudyLogs || [],
    isGridInQuestion,
  });
}

function buildEliteCoverage(questions = []) {
  return SatRoadmapEngine.buildEliteCoverage(questions, { isGridInQuestion });
}

function readinessBand(score) {
  return SatMasteryEngine.readinessBand(score);
}

function averageNumber(values = []) {
  return SatMasteryEngine.averageNumber(values);
}

function clampNumber(value, min, max) {
  return SatMasteryEngine.clampNumber(value, min, max);
}

function renderRoadmapEvaluationPanel(evaluation) {
  return SatViewRenderers.renderRoadmapEvaluationPanel
    ? SatViewRenderers.renderRoadmapEvaluationPanel(evaluation, { errorTagLabel })
    : "";
}

function renderRoadmapEvalMetric(label, value, caption) {
  return SatViewRenderers.renderRoadmapEvalMetric ? SatViewRenderers.renderRoadmapEvalMetric(label, value, caption) : "";
}

function renderEliteReadinessPanel(readiness) {
  return SatViewRenderers.renderEliteReadinessPanel ? SatViewRenderers.renderEliteReadinessPanel(readiness) : "";
}

function renderMasteryLadder(skillRows = []) {
  const vi = state.language === "vi";
  if (!skillRows.length) return `<div class="empty-state">${vi ? "Bản đồ kỹ năng sẽ hiện sau pretest hoặc một vài lượt luyện tập." : "Mastery ladder will fill after pretest or practice attempts."}</div>`;
  const stageOrder = ["Foundation repair", "Standard SAT", "Trap recognition", "Hard transfer", "Timed mastery", "Maintenance", "Collect evidence"];
  const rowsByStage = new Map();
  skillRows.forEach((row) => {
    const stage = row.masteryStage || "Collect evidence";
    if (!rowsByStage.has(stage)) rowsByStage.set(stage, []);
    rowsByStage.get(stage).push(row);
  });
  return `
    <section class="mastery-ladder-card">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">${vi ? "Thang kỹ năng" : "Mastery ladder"}</p>
          <h2>${vi ? "Điều kiện trước khi test thêm" : "What must happen before more testing"}</h2>
          <p class="muted">${vi ? "Lộ trình 1600 đưa từng kỹ năng qua nền tảng, chuyển dạng, nhận diện bẫy, chứng minh bằng câu khó và làm đúng dưới áp lực thời gian." : "1600 training moves a skill through foundation, transfer, traps, hard proof, and timed mastery."}</p>
        </div>
      </div>
      <div class="mastery-stage-grid">
        ${stageOrder
          .filter((stage) => rowsByStage.has(stage))
          .map((stage) => {
            const rows = rowsByStage.get(stage).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 4);
            return `
              <article class="mastery-stage-card">
                <h3>${escapeHtml(stage)}</h3>
                <p>${escapeHtml(masteryStageExit(stage))}</p>
                <div class="mastery-stage-skills">
                  ${rows
                    .map(
                      (row) => `
                        <span>
                          <strong>${escapeHtml(row.skill)}</strong>
                          ${row.mastery}% &middot; ${escapeHtml(errorTagLabel(row.dominantErrorType))}
                        </span>
                      `,
                    )
                    .join("")}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderStudentRoadmap({ evaluation, readiness, roadmap, latest, skillRows, profileState }) {
  const vi = state.language === "vi";
  const hasRoadmap = Array.isArray(roadmap) && roadmap.length;
  const topStep = roadmap[0] || null;
  const topTargets = topStep ? getRoadmapPracticeTargets(topStep, latest).slice(0, 2) : [];
  const due = getDueQuestionIds().length;
  const baseline = latestCompositePretest()?.scoreEstimate || latest?.scoreEstimate || "--";
  const target = currentAccount()?.targetScore || 1450;
  const gap = Number.isFinite(Number(evaluation?.gap)) ? Number(evaluation.gap) : null;
  const headline = latest
    ? vi
      ? `M\u1ee9c n\u1ec1n ${baseline} -> m\u1ee5c ti\u00eau ${target}`
      : `Baseline ${baseline} -> target ${target}`
    : vi
      ? "L\u00e0m b\u00e0i \u0111\u1ea7u v\u00e0o \u0111\u1ec3 m\u1edf l\u1ed9 tr\u00ecnh"
      : "Take the pretest to unlock your roadmap";
  const nextAction = due
    ? {
        title: vi ? `\u00d4n ${due} c\u00e2u \u0111ang \u0111\u1ebfn h\u1ea1n` : `Review ${due} due items`,
        body: vi ? "S\u1eeda l\u1ed7i c\u0169 tr\u01b0\u1edbc khi luy\u1ec7n th\u00eam c\u00e2u m\u1edbi." : "Fix old mistakes before adding new practice.",
        button: `<button class="button primary roadmap-review-link" type="button">${vi ? "\u00d4n ngay" : "Review now"}</button>`,
      }
    : topStep
      ? {
          title: topStep.title || (vi ? "K\u1ef9 n\u0103ng c\u1ea7n h\u1ecdc ti\u1ebfp" : "Next skill to study"),
          body: topStep.detail || (vi ? "L\u00e0m lesson ng\u1eafn, sau \u0111\u00f3 practice c\u00f9ng subskill." : "Do a short lesson, then practice the same subskill."),
          button: renderPracticeTargetLinks(topTargets),
        }
      : {
          title: vi ? "B\u1eaft \u0111\u1ea7u b\u1eb1ng diagnostic 20 c\u00e2u" : "Start with a 20-question diagnostic",
          body: vi ? "SAT Studio c\u1ea7n m\u1ee9c n\u1ec1n \u0111\u1ec3 ch\u1ecdn \u0111\u00fang k\u1ef9 n\u0103ng y\u1ebfu." : "SAT Studio needs a baseline to choose the right weak skills.",
          button: `<button class="button primary" type="button" data-student-roadmap-pretest>${vi ? "L\u00e0m b\u00e0i \u0111\u1ea7u v\u00e0o" : "Start pretest"}</button>`,
        };
  const weakRows = skillRows
    .filter((row) => Number(row.mastery ?? row.accuracy ?? 100) < 80)
    .slice(0, 3);
  const path1600Panel = SatStudentExperienceEngine.render1600PathPanel({ baseline: Number(baseline) || 0, target, skillRows, readiness, evaluation, vi: state.language === "vi" });

  const roadmapItems = hasRoadmap
    ? roadmap
        .slice(0, 4)
        .map((step, index) => {
          const targets = getRoadmapPracticeTargets(step, latest).slice(0, 2);
          return `
            <article class="roadmap-step student-roadmap-step list-item">
              <div class="step-index">${index + 2}</div>
              <div>
                <h3>${escapeHtml(step.title)}</h3>
                <p>${escapeHtml(step.detail)}</p>
                ${renderPracticeTargetLinks(targets)}
              </div>
              <div class="roadmap-action-cell"><span class="pill">${escapeHtml(step.action || "Practice")}</span></div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state">${vi ? "L\u00e0m diagnostic tr\u01b0\u1edbc, sau \u0111\u00f3 SAT Studio s\u1ebd ch\u1ecdn b\u00e0i h\u1ecdc v\u00e0 set luy\u1ec7n ph\u00f9 h\u1ee3p." : "Take the diagnostic first, then SAT Studio will choose the right lessons and practice sets."}</div>`;
  const todayPanel = `
    <section class="student-roadmap-today">
      <div class="student-roadmap-hero">
        <div>
          <p class="eyebrow">${vi ? "Hôm nay" : "Today"}</p>
          <h3>${escapeHtml(headline)}</h3>
          <p>${!latest ? (vi ? "Hoàn thành diagnostic để tính khoảng cách điểm." : "Complete the diagnostic to calculate the score gap.") : gap === null ? (vi ? "Hoàn thành thêm practice để tăng độ tin cậy." : "Complete more practice to improve confidence.") : gap > 0 ? (vi ? `Còn ${gap} điểm. Tập trung vào lỗi ưu tiên trước.` : `${gap} points left. Focus on the priority mistakes first.`) : (vi ? "Mục tiêu điểm đã đạt; giữ phong độ bằng hard/timed practice." : "Target reached on the latest signal; maintain with hard/timed practice.")}</p>
        </div>
        <span class="confidence-pill confidence-low">${escapeHtml(readiness?.label || "Starter path")}</span>
      </div>
      <article class="student-roadmap-action">
        <span class="step-index">1</span>
        <div>
          <h3>${escapeHtml(nextAction.title)}</h3>
          <p>${escapeHtml(nextAction.body)}</p>
          <div class="roadmap-practice-links">${nextAction.button}</div>
        </div>
      </article>
      ${
        weakRows.length
          ? `<div class="student-roadmap-skills">${weakRows
              .map(
                (row) => `
                  <article>
                    <span>${Number(row.mastery ?? row.accuracy ?? 0)}%</span>
                    <strong>${escapeHtml(row.skill)}</strong>
                    <small>${escapeHtml(row.domain)} - ${escapeHtml(errorTagLabel(row.dominantErrorType))}</small>
                  </article>
                `,
              )
              .join("")}</div>`
          : ""
      }
      ${path1600Panel}
    </section>
  `;
  const weekPanel = `
    <section class="student-roadmap-plan">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">${vi ? "Tuần này" : "This week"}</p>
          <h3>${vi ? "4 việc học ưu tiên" : "4 priority study tasks"}</h3>
        </div>
      </div>
      ${roadmapItems}
    </section>
  `;
  const skillsPanel = `
    ${renderMathMicroSkillRoadmap(skillRows)}
    ${SatStudentExperienceEngine.renderMasteryGatePanel(skillRows, { vi: state.language === "vi", errorTagLabel })}
    ${renderMasteryLadder(skillRows)}
    ${
      skillRows.length
        ? `<details class="student-roadmap-expert">
            <summary>${vi ? "Toàn bộ bản đồ kỹ năng" : "Full skill map"}</summary>
            ${skillRows
              .map(
                (item) => `
                  <div class="skill-row list-item">
                    <div>
                      <h3>${escapeHtml(item.skill)}</h3>
                      <p>${escapeHtml(item.section)} - ${escapeHtml(item.domain)}</p>
                    </div>
                    <span class="pill">${item.mastery ?? item.accuracy}% mastery</span>
                    <span class="pill">${escapeHtml(item.status || "Tracked")}</span>
                  </div>
                `,
              )
              .join("")}
          </details>`
        : ""
    }
  `;
  const detailPanel = `
    <details class="student-roadmap-expert" open>
      <summary>${vi ? "Báo cáo chuyên gia" : "Expert report"}</summary>
      ${renderStudentRoadmapEvaluationSummary(evaluation)}
    </details>
    <details class="student-roadmap-expert">
      <summary>${vi ? "Bản đồ 1600" : "1600 map"}</summary>
      ${renderStudentEliteSummary(readiness)}
    </details>
    ${
      latest
        ? `<details class="student-roadmap-expert diagnostic-review-collapsed">
            <summary>${vi ? "Xem review diagnostic" : "View diagnostic review"}</summary>
            ${renderDiagnosticReview(latest)}
          </details>`
        : ""
    }
  `;
  const activeTab = ["today", "week", "skills", "detail"].includes(activeStudentRoadmapTab) ? activeStudentRoadmapTab : "today";
  const panels = { today: todayPanel, week: weekPanel, skills: skillsPanel, detail: detailPanel };
  const analysisPanel = learnerAnalysisState ? renderLearnerAnalysisPanel(learnerAnalysisState.kind || "roadmap") : "";
  els.roadmapEvaluation.innerHTML = `
    <section class="student-roadmap-shell">
      <div class="subview-tabs" role="tablist" aria-label="Roadmap student tabs">
        ${renderStudentRoadmapTabButton("today", vi ? "Hôm nay" : "Today", activeTab)}
        ${renderStudentRoadmapTabButton("week", vi ? "Tuần này" : "This week", activeTab)}
        ${renderStudentRoadmapTabButton("skills", vi ? "Bản đồ kỹ năng" : "Skill map", activeTab)}
        ${renderStudentRoadmapTabButton("detail", vi ? "Chi tiết" : "Details", activeTab)}
      </div>
      ${analysisPanel}
      <div class="student-roadmap-tab-panel">${panels[activeTab]}</div>
    </section>
  `;
  els.eliteReadinessPanel.innerHTML = "";
  els.roadmapList.innerHTML = "";
  els.masteryLadder.innerHTML = "";
  els.roadmapDiagnosticReview.innerHTML = "";
  els.skillMatrix.innerHTML = "";

  els.roadmapEvaluation.querySelector("[data-student-roadmap-pretest]")?.addEventListener("click", () => {
    switchView("pretest");
    startPretest("preview");
  });
  els.roadmapEvaluation.querySelectorAll("[data-student-roadmap-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStudentRoadmapTab = button.dataset.studentRoadmapTab || "today";
      renderStudentRoadmap({ evaluation, readiness, roadmap, latest, skillRows, profileState });
    });
  });
  bindRoadmapPracticeLinks();
  bindMathMicroSkillActions(els.roadmapEvaluation);
}

function renderStudentRoadmapEvaluationSummary(evaluation = {}) {
  const vi = state.language === "vi";
  const confidence = evaluation.confidence || { label: "Low", detail: "Collect more diagnostic and practice data." };
  const baseline = evaluation.baseline
    ? vi
      ? `Mức nền ${Number(evaluation.baseline)} -> mục tiêu ${Number(evaluation.target || 0)}`
      : `Baseline ${Number(evaluation.baseline)} -> target ${Number(evaluation.target || 0)}`
    : vi
      ? `Mục tiêu ${Number(evaluation.target || 0)}; cần diagnostic để có mức nền`
      : `Target ${Number(evaluation.target || 0)}; diagnostic needed for baseline`;
  const gap =
    evaluation.gap === null || evaluation.gap === undefined
      ? vi
        ? "Làm bài đầu vào để tính khoảng cách điểm."
        : "Take the pretest to calculate the score gap."
      : Number(evaluation.gap)
        ? vi
          ? `Còn ${Number(evaluation.gap)} điểm cần bù.`
          : `${Number(evaluation.gap)} points left to close.`
        : vi
          ? "Đã đạt mục tiêu trên tín hiệu gần nhất; cần proof bằng set khó/timed."
          : "Target reached on the latest signal; prove it with hard/timed work.";
  const priorityRows = Array.isArray(evaluation.priorityRows) ? evaluation.priorityRows.slice(0, 5) : [];
  const actions = Array.isArray(evaluation.actions) && evaluation.actions.length ? evaluation.actions.slice(0, 4) : [vi ? "Giữ một set có bấm giờ và một set ôn lỗi sai trong tuần này." : "Keep one timed set and one mistake-review set this week."];
  const topErrorLabel = evaluation.topError?.label && evaluation.topError.label !== "No tagged pattern yet" ? evaluation.topError.label : (vi ? "Chưa có mẫu lỗi" : "No tagged pattern yet");
  return `
    <section class="roadmap-eval-card student-roadmap-eval">
      <div class="roadmap-eval-hero">
        <div>
          <p class="eyebrow">${vi ? "Đánh giá lộ trình" : "Roadmap evaluation"}</p>
          <h3>${escapeHtml(baseline)}</h3>
          <p>${escapeHtml(gap)}</p>
        </div>
        <span class="confidence-pill confidence-low">${escapeHtml(roadmapConfidenceLabel(confidence.label))}</span>
      </div>
      <div class="roadmap-eval-grid">
        ${renderRoadmapEvalMetric(vi ? "Kỹ năng đang theo dõi" : "Tracked skills", evaluation.skillCount || 0, vi ? `${Number(evaluation.testReadyCount || 0)} sẵn sàng test` : `${Number(evaluation.testReadyCount || 0)} test-ready`)}
        ${renderRoadmapEvalMetric(vi ? "Lượt luyện tập" : "Practice attempts", evaluation.practiceAttempts || 0, vi ? `${Number(evaluation.attemptsSinceBuild || 0)} từ lần build roadmap` : `${Number(evaluation.attemptsSinceBuild || 0)} since roadmap build`)}
        ${renderRoadmapEvalMetric(vi ? "Lỗi đã gắn nhãn" : "Tagged errors", evaluation.taggedErrors || 0, topErrorLabel)}
        ${renderRoadmapEvalMetric(vi ? "Cụm yếu" : "Weak clusters", evaluation.weakCount || 0, vi ? `${Number(evaluation.masteredCount || 0)} đã vững` : `${Number(evaluation.masteredCount || 0)} mastered`)}
      </div>
      <div class="roadmap-eval-split">
        <div>
          <h4>${vi ? "Kỹ năng ưu tiên" : "Priority skills"}</h4>
          <ul class="roadmap-mini-list">
            ${
              priorityRows.length
                ? priorityRows.map((item) => `<li><strong>${escapeHtml(item.skill)}</strong><span>${Number(item.mastery || 0)}% mastery · ${escapeHtml(errorTagLabel(item.dominantErrorType))}</span></li>`).join("")
                : `<li><strong>${vi ? "Chưa có cụm yếu rõ" : "No clear weak cluster yet"}</strong><span>${vi ? "Cần thêm dữ liệu pretest hoặc practice." : "Collect more pretest or practice data."}</span></li>`
            }
          </ul>
        </div>
        <div>
          <h4>${vi ? "Việc nên làm tiếp" : "What to do next"}</h4>
          <ul class="roadmap-mini-list">${actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </div>
    </section>
  `;
}

function roadmapConfidenceLabel(label = "Low") {
  const key = String(label || "Low").toLowerCase();
  if (state.language !== "vi") return `${label || "Low"} confidence`;
  if (key.includes("high")) return "Độ tin cậy cao";
  if (key.includes("medium")) return "Độ tin cậy vừa";
  return "Độ tin cậy thấp";
}

function renderStudentEliteSummary(readiness = {}) {
  const vi = state.language === "vi";
  const coverage = readiness.coverage || {};
  const checks = Array.isArray(coverage.checks) ? coverage.checks.slice(0, 6) : [];
  return `
    <section class="elite-readiness-card">
      <div class="readiness-main">
        <div class="readiness-score" data-score="${Number(readiness.score || 0)}">
          <strong>${Number(readiness.score || 0)}</strong>
          <span>/100</span>
        </div>
        <div>
          <p class="eyebrow">${vi ? "Sẵn sàng 1600" : "1600 readiness"}</p>
          <h3>${escapeHtml(readiness.band || (vi ? "Cần thêm dữ liệu" : "Collect more evidence"))}</h3>
          <p>${vi ? "Mastery trung bình" : "Average mastery"} ${Number(readiness.averageMastery || 0)}%. ${vi ? "Độ chính xác câu khó" : "Hard accuracy"} ${readiness.hardAttempts ? `${Number(readiness.hardAccuracy || 0)}% ${vi ? "trên" : "on"} ${Number(readiness.hardAttempts || 0)} ${vi ? "lượt" : "attempts"}` : (vi ? "chưa đo đủ" : "not measured enough")}.</p>
        </div>
      </div>
      <div class="coverage-list">
        ${
          checks.length
            ? checks
                .map((item) => {
                  const target = Math.max(1, Number(item.target || 1));
                  const count = Number(item.count || 0);
                  const pct = Math.round(Math.min(count / target, 1) * 100);
                  return `<div class="coverage-row"><span>${escapeHtml(item.label)}</span><strong>${count}/${target}</strong><progress class="mini-progress-bar" max="100" value="${pct}"></progress></div>`;
                })
                .join("")
            : `<div class="empty-state">${vi ? "Chưa đủ dữ liệu coverage cho mục tiêu 1600." : "Not enough coverage data for the 1600 target yet."}</div>`
        }
      </div>
    </section>
  `;
}

function renderStudentRoadmapTabButton(tab, label, activeTab) {
  return `
    <button
      class="subview-tab ${activeTab === tab ? "active" : ""}"
      type="button"
      role="tab"
      aria-selected="${activeTab === tab ? "true" : "false"}"
      data-student-roadmap-tab="${escapeHtml(tab)}"
    >${escapeHtml(label)}</button>
  `;
}

function renderRoadmap() {
  const p = profile();
  const latest = latestPretest();
  const roadmap = p.roadmap.length ? p.roadmap : latest ? buildRoadmap(latest) : [];
  const skillRows = buildSkillMatrix();
  const evaluation = buildRoadmapEvaluation(skillRows, roadmap);
  const readiness = buildEliteReadiness(skillRows, evaluation);

  if (currentAccount()?.role === "student") {
    renderStudentRoadmap({ evaluation, readiness, roadmap, latest, skillRows, profileState: p });
    return;
  }

  if (els.roadmapEvaluation) {
    els.roadmapEvaluation.innerHTML = renderRoadmapEvaluationPanel(evaluation);
  }
  if (els.eliteReadinessPanel) {
    els.eliteReadinessPanel.innerHTML = renderEliteReadinessPanel(readiness);
  }
  if (els.masteryLadder) {
    els.masteryLadder.innerHTML = renderMasteryLadder(skillRows);
  }

  if (!roadmap.length) {
    els.roadmapList.innerHTML = '<div class="empty-state">Take the pretest first. The roadmap will be generated from your skill profile.</div>';
  } else {
    const roadmapItems = roadmap
      .map(
        (step, index) => {
          const targets = getRoadmapPracticeTargets(step, latest);
          return `
          <article class="roadmap-step list-item">
            <div class="step-index">${index + 1}</div>
            <div>
              <h3>${escapeHtml(step.title)}</h3>
              <p>${escapeHtml(step.detail)}</p>
              <p>${escapeHtml(step.source)}</p>
              ${step.exitCondition ? `<p><strong>Exit:</strong> ${escapeHtml(step.exitCondition)}</p>` : ""}
              ${renderRoadmapStepV2Meta(step)}
              ${renderPracticeTargetLinks(targets)}
            </div>
            <div class="roadmap-action-cell">
              <span class="pill">${escapeHtml(step.action)}</span>
              ${step.actionType === "review" ? '<button class="button secondary roadmap-review-link" type="button">Open Review</button>' : ""}
            </div>
          </article>
        `;
        },
      )
      .join("");
    const rebuildText = p.roadmapLastBuiltAt
      ? `Last built ${formatDateTime(p.roadmapLastBuiltAt)} (${p.roadmapBuildReason || "manual"}). Auto-refresh runs every 10 practice attempts; use Rebuild Roadmap after a pretest/full test or parent review.`
      : "Auto-refresh runs every 10 practice attempts; use Rebuild Roadmap after a pretest/full test or parent review.";
    els.roadmapList.innerHTML = `${roadmapItems}<article class="roadmap-step list-item roadmap-policy"><div class="step-index">R</div><div><h3>Recalculation rule</h3><p>${escapeHtml(rebuildText)}</p></div></article>`;
  }

  els.roadmapDiagnosticReview.innerHTML = latest
    ? `
      <article class="diagnostic-result list-item">
        <div class="section-heading compact">
          <div>
            <p class="eyebrow">Diagnostic answer review</p>
            <h3>Review before following the roadmap</h3>
            <p>Wrong choices are highlighted in red; correct answers and explanations are shown below each question.</p>
          </div>
        </div>
        ${renderDiagnosticReview(latest)}
      </article>
    `
    : "";

  els.skillMatrix.innerHTML = skillRows.length
    ? skillRows
        .map(
          (item) => `
            <div class="skill-row list-item">
              <div>
                <h3>${escapeHtml(item.skill)}</h3>
                <p>${escapeHtml(item.section)} · ${escapeHtml(item.domain)}</p>
              </div>
              <span class="pill">${item.mastery ?? item.accuracy}% mastery</span>
              <span class="pill">${escapeHtml(item.status || "Tracked")}</span>
              <span class="pill">${escapeHtml(item.masteryStage || "Collect evidence")}</span>
              <span class="pill">${item.attempts} attempts</span>
              <button
                class="button secondary skill-practice-link"
                type="button"
                data-section="${escapeHtml(item.section)}"
                data-domain="${escapeHtml(item.domain)}"
                data-skill="${escapeHtml(item.skill)}"
              >Practice</button>
            </div>
          `,
        )
        .join("")
    : '<div class="empty-state">Skill matrix will fill after pretest or practice attempts.</div>';

  bindRoadmapPracticeLinks();
}

function renderRoadmapStepV2Meta(step = {}) {
  const meta = step.roadmapV2;
  if (!meta) return "";
  const activeTriggers = (meta.refreshTriggers || []).filter((trigger) => trigger.active);
  const triggerText = activeTriggers.length
    ? activeTriggers.map((trigger) => trigger.label).join(", ")
    : "Pretest/full test, 10 attempts, proof pass/fail, or parent/admin rebuild";
  const loop = (meta.learningLoop || [])
    .map((item) => `<li><strong>${escapeHtml(item.label || item.stage)}</strong><span>${escapeHtml(item.detail || "")}</span></li>`)
    .join("");
  return `
    <details class="roadmap-v2-meta">
      <summary>Roadmap v2 evidence</summary>
      <div class="roadmap-v2-grid">
        <div><span>Subskill</span><strong>${escapeHtml(meta.skill || "All skills")}</strong></div>
        <div><span>Assigned by</span><strong>${escapeHtml(`${meta.assignedByRole || "system"} / ${meta.assignedBy || "system"}`)}</strong></div>
        <div><span>Assigned</span><strong>${escapeHtml(meta.assignedAt ? formatDateTime(meta.assignedAt) : "Not recorded")}</strong></div>
        <div><span>Retry</span><strong>${escapeHtml(meta.retryAt ? formatDateTime(meta.retryAt) : "After proof")}</strong></div>
      </div>
      <p><strong>Root cause:</strong> ${escapeHtml(meta.rootCause || "Roadmap signal needs review.")}</p>
      <p><strong>Why relearn:</strong> ${escapeHtml(meta.whyRelearn || "Lesson first, then proof on a fresh item.")}</p>
      <p><strong>Proof:</strong> ${escapeHtml(meta.proofQuestionId || "Auto-select proof")} · ${escapeHtml(meta.proofCondition || "Pass a new same-skill item.")}</p>
      <p><strong>Refresh:</strong> ${escapeHtml(triggerText)}</p>
      ${loop ? `<ol class="roadmap-loop">${loop}</ol>` : ""}
    </details>
  `;
}

function renderPracticeTargetLinks(targets) {
  if (!targets.length) return "";
  return `
    <div class="roadmap-practice-links">
      ${targets
        .map((target) => {
          const resources = getExternalResourcesForScope(target, 2);
          return `
            <button
              class="button secondary roadmap-practice-link"
              type="button"
              data-section="${escapeHtml(target.section)}"
              data-domain="${escapeHtml(target.domain)}"
              data-skill="${escapeHtml(target.skill)}"
              data-difficulty="${escapeHtml(target.difficulty || "All")}"
              data-source="${escapeHtml(target.source || "All")}"
            >Practice: ${escapeHtml(target.label || target.skill || target.domain)}</button>
            ${renderExternalResourceAnchors(resources, true)}
          `;
        })
        .join("")}
    </div>
  `;
}

function getRoadmapPracticeTargets(step, latest) {
  if (Array.isArray(step.targets) && step.targets.length) {
    return uniquePracticeTargets(step.targets).slice(0, 4);
  }

  const text = `${step.title || ""} ${step.detail || ""}`.toLowerCase();
  const diagnosticSkills = Object.values(latest?.bySkill || {});
  const skillTargets = diagnosticSkills
    .filter((item) => item.label && text.includes(item.label.toLowerCase()))
    .map((item) => practiceTargetFromSummary(item));

  if (skillTargets.length) return uniquePracticeTargets(skillTargets).slice(0, 4);

  const topicMap = new Map();
  visibleQuestionBank().forEach((question) => {
    const key = `${question.section}|${question.domain}|${question.skill}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        label: question.skill,
        section: question.section,
        domain: question.domain,
        skill: question.skill,
        difficulty: "All",
        source: "All",
      });
    }
  });

  const bankSkillTargets = [...topicMap.values()].filter((target) => target.skill && text.includes(target.skill.toLowerCase()));
  if (bankSkillTargets.length) return uniquePracticeTargets(bankSkillTargets).slice(0, 4);

  const diagnosticDomains = Object.values(latest?.byDomain || {});
  const domainTargets = diagnosticDomains
    .filter((item) => item.label && text.includes(item.label.toLowerCase()))
    .map((item) => practiceTargetFromSummary(item, { skill: "All" }));
  if (domainTargets.length) return uniquePracticeTargets(domainTargets).slice(0, 4);

  const domainMap = new Map();
  visibleQuestionBank().forEach((question) => {
    if (question.domain && text.includes(question.domain.toLowerCase()) && !domainMap.has(question.domain)) {
      domainMap.set(question.domain, {
        label: question.domain,
        section: question.section,
        domain: question.domain,
        skill: "All",
        difficulty: "All",
        source: "All",
      });
    }
  });
  return uniquePracticeTargets([...domainMap.values()]).slice(0, 4);
}

function uniquePracticeTargets(targets) {
  return SatRoadmapEngine.uniquePracticeTargets(targets);
}

function getExternalResourcesForScope(scope = {}, limit = 4) {
  const normalizedScope = {
    section: scope.section || "All",
    domain: scope.domain || "All",
    skill: scope.skill || "All",
  };
  const scored = externalResources
    .map((resource) => {
      const score = resourceMatchScore(resource, normalizedScope);
      return score > 0 ? { ...resource, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || resourceTypeWeight(b.type) - resourceTypeWeight(a.type) || a.title.localeCompare(b.title));
  return scored.slice(0, limit);
}

function resourceMatchScore(resource, scope) {
  const sectionMatch = matchesResourceField(resource.section, scope.section);
  const domainMatch = matchesResourceField(resource.domain, scope.domain);
  const skillMatch = matchesResourceSkill(resource.skills, scope.skill);
  if (skillMatch === 3) return 100 + sectionMatch + domainMatch;
  if (domainMatch && sectionMatch) return 70 + sectionMatch;
  if (sectionMatch && (resource.domain === "All" || scope.domain === "All")) return 45;
  if (resource.section === "All" && resource.domain === "All") return 20;
  return 0;
}

function matchesResourceField(resourceValue, scopeValue) {
  if (!resourceValue || resourceValue === "All" || scopeValue === "All") return 1;
  return normalizeText(resourceValue) === normalizeText(scopeValue) ? 2 : 0;
}

function matchesResourceSkill(resourceSkills = [], scopeSkill = "All") {
  if (scopeSkill === "All") return resourceSkills.includes("All") ? 1 : 0;
  const normalized = normalizeText(scopeSkill);
  if (resourceSkills.some((skill) => normalizeText(skill) === normalized)) return 3;
  if (resourceSkills.includes("All")) return 1;
  return 0;
}

function resourceTypeWeight(type) {
  return { tool: 5, practice: 4, lesson: 3, "official-tool": 3, unit: 2, course: 1, "official-test": 1 }[type] || 0;
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function renderExternalResourceAnchors(resources, compact = false) {
  const safeResources = resources.filter((resource) => isSafeHttpUrl(resource.url));
  if (!safeResources.length) return "";
  return safeResources
    .map(
      (resource) => `
        <a
          class="external-resource-card ${compact ? "compact" : ""}"
          href="${escapeHtml(resource.url)}"
          target="_blank"
          rel="noreferrer"
          title="${escapeHtml(resource.sourceNote || "")}"
        >
          <span>${escapeHtml(resource.provider || "External")}</span>
          <strong>${escapeHtml(resource.title)}</strong>
          <small>${escapeHtml(labelFor(resource.intent || resource.type || "resource"))}</small>
        </a>
      `,
    )
    .join("");
}

function bindRoadmapPracticeLinks() {
  document.querySelectorAll(".roadmap-practice-link, .skill-practice-link").forEach((button) => {
    button.addEventListener("click", () =>
      startScopedPractice({
        section: button.dataset.section,
        domain: button.dataset.domain,
        skill: button.dataset.skill,
        difficulty: button.dataset.difficulty,
        source: button.dataset.source,
      }),
    );
  });
  document.querySelectorAll(".roadmap-review-link").forEach((button) => {
    button.addEventListener("click", () => switchView("review"));
  });
}

function bindMathMicroSkillActions(root = document) {
  root.querySelectorAll("[data-micro-practice]").forEach((button) => {
    button.addEventListener("click", () =>
      startScopedPractice({
        section: button.dataset.section || "Math",
        domain: button.dataset.domain || "All",
        skill: button.dataset.skill || "All",
        difficulty: "All",
        source: "All",
      }),
    );
  });
  root.querySelectorAll("[data-micro-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      const scope = {
        section: button.dataset.section || "Math",
        domain: button.dataset.domain || "All",
        skill: button.dataset.skill || "All",
      };
      activeLessonKey = lessonScopeKey(scope);
      switchView("lessons");
    });
  });
}

function canonicalKnowledgeFor(scope = {}) {
  if (!scope?.section) return null;
  const scopeSection = scope.section;
  const scopeDomain = normalizeText(scope.domain || "");
  const scopeSkill = normalizeText(scope.skill || "");
  const scopeText = normalizeText(`${scope.skill || ""} ${scope.prompt || ""}`);
  const mixedMathDomain = scopeSection === "Math" && /^math\s*-/.test(scopeDomain);
  let best = null;
  let bestScore = 0;

  SAT_KNOWLEDGE_TAXONOMY.forEach((item) => {
    if (item.section !== scopeSection) return;
    const itemDomain = normalizeText(item.domain);
    const itemSkill = normalizeText(item.skill);
    const aliases = [item.skill, ...(item.aliases || [])].map(normalizeText);
    let score = 0;
    if (scopeDomain === itemDomain) score += 35;
    else if (mixedMathDomain) score += 8;
    else return;

    if (scopeSkill === itemSkill) score += 120;
    else if (aliases.some((alias) => scopeSkill === alias)) score += 105;
    else if (aliases.some((alias) => alias && scopeSkill.includes(alias))) score += 80;
    else if (aliases.some((alias) => alias && scopeText.includes(alias))) score += 55;

    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  });

  return bestScore >= 55 ? best : null;
}

function lessonScopeKey(scope = {}) {
  const canonical = canonicalKnowledgeFor(scope);
  if (canonical) return `canonical:${canonical.id}`;
  return `${scope.section || "All"}|${scope.domain || "All"}|${scope.skill || "All"}`;
}

function lessonScopeFromCanonical(item) {
  return {
    key: `canonical:${item.id}`,
    canonicalId: item.id,
    section: item.section,
    domain: item.domain,
    skill: item.skill,
    canonicalMeta: item,
    moduleType: item.moduleType || "",
    priorityBoost: Number(item.priorityBoost || 0),
  };
}

function normalizeProfileRecord(input = {}) {
  const base = emptyProfile();
  const profileRecord = input && typeof input === "object" ? input : {};
  const normalized = { ...base, ...profileRecord };
  ["attempts", "studyNotes", "externalStudyLogs", "bookmarks", "officialLogs", "errorTags", "practiceSessionReports", "vocabKnown", "vocabQuizAttempts", "pretests", "roadmap"].forEach((key) => {
    normalized[key] = Array.isArray(profileRecord[key]) ? profileRecord[key] : [];
  });
  normalized.learningEvents = SatLearningEventEngine.normalizeLearningEvents
    ? SatLearningEventEngine.normalizeLearningEvents(profileRecord.learningEvents || [])
    : Array.isArray(profileRecord.learningEvents) ? profileRecord.learningEvents : [];
  normalized.learningEventRevision = profileRecord.learningEventRevision || "";
  normalized.learningEventUpdatedAt = profileRecord.learningEventUpdatedAt || "";
  ["notes", "skillMastery", "lessonProgress"].forEach((key) => {
    normalized[key] = profileRecord[key] && typeof profileRecord[key] === "object" ? profileRecord[key] : {};
  });
  normalized.externalLinks = profileRecord.externalLinks && typeof profileRecord.externalLinks === "object" ? profileRecord.externalLinks : base.externalLinks;
  normalized.currentPretest = profileRecord.currentPretest || null;
  normalized.streak = profileRecord.streak && typeof profileRecord.streak === "object" ? profileRecord.streak : base.streak;
  normalized.attendance = profileRecord.attendance && typeof profileRecord.attendance === "object" ? profileRecord.attendance : base.attendance;
  return normalized;
}

function shouldSkipRawLesson(scope = {}) {
  if (canonicalKnowledgeFor(scope)) return false;
  const text = normalizeText(`${scope.domain || ""} ${scope.skill || ""}`);
  return /\bmixed\b|calculator|no calculator|grid[-\s]?in/.test(text);
}

function buildLessonLibrary() {
  const questions = visibleQuestionBank().filter((question) => question.reviewStatus !== "rejected" && question.section && question.domain && question.skill);
  const masteryMap = new Map(buildSkillMastery().map((item) => [lessonScopeKey(item), item]));
  const remediationRows = buildAdaptiveRemediationQueue({ includeFuture: true, includePassed: false, limit: 200 });
  const map = new Map();

  questions.forEach((question) => {
    const canonical = canonicalKnowledgeFor(question);
    const scope = canonical
      ? lessonScopeFromCanonical(canonical)
      : {
          key: lessonScopeKey(question),
          canonicalId: "",
          section: question.section,
          domain: question.domain,
          skill: question.skill,
          canonicalMeta: null,
        };
    if (!canonical && shouldSkipRawLesson(scope)) return;
    const key = scope.key;
    const item = map.get(key) || {
      key,
      canonicalId: scope.canonicalId,
      canonicalMeta: scope.canonicalMeta,
      section: scope.section,
      domain: scope.domain,
      skill: scope.skill,
      questions: [],
      difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
    };
    item.questions.push(question);
    item.difficultyCounts[question.difficulty] = (item.difficultyCounts[question.difficulty] || 0) + 1;
    map.set(key, item);
  });

  SAT_KNOWLEDGE_TAXONOMY.forEach((item) => {
    const scope = lessonScopeFromCanonical(item);
    if (!map.has(scope.key)) {
      map.set(scope.key, {
        ...scope,
        questions: [],
        difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
      });
    }
  });

  return [...map.values()]
    .map((item) => {
      const mastery = masteryMap.get(item.key) || null;
      const sample = item.questions.find((question) => question.reviewStatus === "reviewed") || item.questions[0];
      const base = sample ? getKnowledgeReviewLesson(sample) : lessonFromKnowledgeMeta(item.canonicalMeta, item);
      const queueCount = remediationRows.filter((row) => lessonScopeKey(row) === item.key).length;
      const lesson = {
        ...item,
        title: `${item.skill}`,
        stage: lessonStageForSkill(mastery),
        supportedStages: [...SAT_KNOWLEDGE_STAGES],
        mastery: mastery?.mastery ?? null,
        status: mastery?.status || "Not started",
        dominantErrorType: mastery?.dominantErrorType || "none",
        queueCount,
        priorityScore: (mastery?.priorityScore || 0) + queueCount * 12 + Number(item.priorityBoost || 0),
        lessonV2: null,
        concept: base.rule,
        rule: base.rule,
        steps: base.steps || [],
        drill: base.drill || "",
        example: base.example || lessonExampleFor(item),
        traps: base.traps?.length ? base.traps : [],
        ladder: [],
        subskills: [],
        stagePlaybook: [],
        coverageScore: item.canonicalMeta ? lessonCoverageAudit([item.canonicalMeta]).averageScore : 70,
        scaffold: [],
        scaffoldDrills: [],
        proofDrills: [],
        externalLinkTargets: [],
        externalLinks: [],
      };
      return lesson;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || (a.mastery ?? 101) - (b.mastery ?? 101) || b.questions.length - a.questions.length);
}

function hydrateLessonDetail(lesson = null) {
  if (!lesson) return null;
  const mastery = buildSkillMastery().find((item) => lessonScopeKey(item) === lesson.key) || null;
  const sample = lesson.questions?.find((question) => question.reviewStatus === "reviewed") || lesson.questions?.[0];
  const base = sample ? getKnowledgeReviewLesson(sample) : lessonFromKnowledgeMeta(lesson.canonicalMeta, lesson);
  const lessonV2 = SatLessonEngine.buildLessonV2
    ? SatLessonEngine.buildLessonV2(lesson, mastery, lesson.questions || [], { canonicalKnowledgeFor, isStudyAvailableQuestion, errorTagLabel })
    : null;
  return {
    ...lesson,
    lessonV2,
    concept: lessonV2?.concept || base.rule,
    rule: lessonV2?.concept || base.rule,
    steps: lessonV2?.threeStepMethod || base.steps || [],
    drill: lessonV2?.microCheck || base.drill || "",
    example: lessonV2?.workedExample || base.example || lessonExampleFor(lesson),
    traps: lessonV2?.commonTraps?.length ? lessonV2.commonTraps : base.traps?.length ? base.traps : lessonTrapsFor(lesson, mastery),
    ladder: lessonV2?.ladder || lessonLadderFor(lesson, mastery),
    subskills: lessonV2?.subskills || lessonSubskillsFor(lesson),
    stagePlaybook: lessonV2?.stagePlaybook || lessonStagePlaybookFor(lesson, mastery),
    scaffold: buildLessonScaffold(lesson),
    scaffoldDrills: lessonV2?.scaffoldDrills || [],
    proofDrills: lessonV2?.proofDrills || [],
    externalLinkTargets: lessonV2?.externalLinkTargets || [],
    externalLinks: getExternalResourcesForScope(lesson, 3),
  };
}

function lessonFromKnowledgeMeta(meta, fallback = {}) {
  return SatLessonEngine.lessonFromKnowledgeMeta(meta, fallback);
}

function lessonStageForSkill(mastery = null) {
  return SatLessonEngine.lessonStageForSkill(mastery);
}

function lessonLadderFor(scope, mastery = null) {
  return SatLessonEngine.lessonLadderFor(mastery);
}

function lessonSubskillsFor(scope) {
  return SatLessonEngine.subskillChecklistFor ? SatLessonEngine.subskillChecklistFor(scope) : [];
}

function lessonStagePlaybookFor(scope, mastery = null) {
  return SatLessonEngine.stagePlaybookFor ? SatLessonEngine.stagePlaybookFor(scope, mastery) : [];
}

function lessonCoverageAudit(taxonomy = SAT_KNOWLEDGE_TAXONOMY) {
  return SatLessonEngine.lessonCoverageAudit
    ? SatLessonEngine.lessonCoverageAudit(taxonomy)
    : { total: taxonomy.length, complete: 0, averageScore: 0, missing: [], rows: [] };
}

function lessonTrapsFor(scope, mastery = null) {
  return SatLessonEngine.lessonTrapsFor(scope, mastery, { canonicalKnowledgeFor, errorTagLabel });
}

function lessonExampleFor(scope) {
  return SatLessonEngine.lessonExampleFor(scope, { canonicalKnowledgeFor });
}

function buildLessonScaffold(scope) {
  return SatLessonEngine.buildLessonScaffold(scope, visibleQuestionBank(), { canonicalKnowledgeFor, isStudyAvailableQuestion });
}

function renderLessons() {
  if (!els.lessonList || !els.lessonDetail) return;
  if (activeView !== "lessons") return;
  applyStudentLessonCopy();
  const section = els.lessonSection?.value || "All";
  const domain = els.lessonDomain?.value || "All";
  const stage = els.lessonStage?.value || "All";
  const query = normalizeText(els.lessonSearch?.value || "");
  const lessons = buildLessonLibrary().filter((lesson) => {
    const text = normalizeText(`${lesson.section} ${lesson.domain} ${lesson.skill} ${lesson.stage}`);
    return (
      (section === "All" || lesson.section === section) &&
      (domain === "All" || lesson.domain === domain) &&
      (stage === "All" || lesson.stage === stage || lesson.supportedStages?.includes(stage)) &&
      (!query || text.includes(query))
    );
  });

  if (!activeLessonKey || !lessons.some((lesson) => lesson.key === activeLessonKey)) {
    activeLessonKey = lessons[0]?.key || "";
  }
  const activeLesson = hydrateLessonDetail(lessons.find((lesson) => lesson.key === activeLessonKey) || lessons[0] || null);

  const studentMode = currentAccount()?.role === "student";
  const recommendedHtml = studentMode ? renderStudentLessonRecommendations(lessons, activeLesson?.key || "") : "";
  const listHtml = studentMode
    ? renderStudentLessonList(lessons, activeLesson?.key || "")
    : SatViewRenderers.renderLessonList
      ? SatViewRenderers.renderLessonList(lessons, activeLesson?.key || "")
      : "";
  els.lessonList.innerHTML = `${recommendedHtml}${listHtml}`;
  const resourcesHtml = activeLesson ? renderExternalResourceAnchors(getExternalResourcesForScope(activeLesson, 3), true) : "";
  const lessonDetailHtml = SatViewRenderers.renderLessonDetail
    ? SatViewRenderers.renderLessonDetail(activeLesson, { labelFor, resourcesHtml })
    : '<div class="empty-state">Choose a lesson to begin.</div>';
  const studentCoachLessonHtml = studentMode && activeLesson ? renderStudentMicroLessonCoachCard(activeLesson) : "";
  els.lessonDetail.innerHTML = `${studentCoachLessonHtml}${lessonDetailHtml}${studentMode && activeLesson ? renderStudentLessonCheckpoint(activeLesson) : ""}`;
  if (currentAccount()?.role === "student") {
    localizeDynamicUiText(els.lessonList);
    localizeDynamicUiText(els.lessonDetail);
  }
  bindLessonActions();
}

function renderStudentLessonList(lessons = [], activeLessonKey = "") {
  const vi = state.language === "vi";
  if (!lessons.length) return `<div class="empty-state">${vi ? "Chưa có bài phù hợp với bộ lọc hiện tại." : "No lessons match this filter yet."}</div>`;
  const activeLesson = lessons.find((lesson) => lesson.key === activeLessonKey);
  const seen = new Set();
  const visible = [activeLesson, ...lessons]
    .filter(Boolean)
    .filter((lesson) => {
      const key = lesson.key || `${lesson.section}-${lesson.domain}-${lesson.skill}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
  const visibleKeys = new Set(visible.map((lesson) => lesson.key));
  const hidden = lessons.filter((lesson) => !visibleKeys.has(lesson.key));
  const renderList = (items) => (SatViewRenderers.renderLessonList ? SatViewRenderers.renderLessonList(items, activeLessonKey) : "");
  return `
    <section class="student-curated-list">
      <div class="student-curated-list-head">
        <strong>${vi ? "Danh sách gọn" : "Curated list"}</strong>
        <span>${vi ? "Hiện các bài nên mở nhất; danh sách đầy đủ nằm trong Xem thêm." : "Shows the most useful lessons first; open more only when needed."}</span>
      </div>
      ${renderList(visible)}
      ${
        hidden.length
          ? `<div class="student-more-list"><strong>${vi ? `${hidden.length} bài khác đã ẩn` : `${hidden.length} more lessons hidden`}</strong><span>${vi ? "Dùng bộ lọc hoặc ô tìm kiếm để mở đúng bài cần học, tránh tải cả thư viện." : "Use filters or search to open the exact lesson, without loading the whole library."}</span></div>`
          : ""
      }
    </section>
  `;
}

function bindLessonActions() {
  document.querySelectorAll(".lesson-list-card, .lesson-recommend-card").forEach((button) => {
    button.addEventListener("click", () => {
      activeLessonKey = button.dataset.lessonKey || "";
      renderLessons();
    });
  });
  document.querySelectorAll(".lesson-start-drill").forEach((button) => {
    button.addEventListener("click", () => startLessonScaffoldDrill(button.dataset.lessonKey));
  });
  document.querySelectorAll(".lesson-save-note").forEach((button) => {
    button.addEventListener("click", () => saveLessonNote(button.dataset.lessonKey));
  });
  document.querySelectorAll(".lesson-add-review").forEach((button) => {
    button.addEventListener("click", () => addLessonReviewTask(button.dataset.lessonKey));
  });
  document.querySelectorAll(".student-lesson-understood").forEach((button) => {
    button.addEventListener("click", () => markLessonUnderstoodAndPractice(button.dataset.lessonKey));
  });
  document.querySelectorAll(".student-lesson-practice").forEach((button) => {
    button.addEventListener("click", () => startLessonScopedPractice(button.dataset.lessonKey));
  });
}

function renderStudentMicroLessonCoachCard(lesson) {
  const vi = state.language === "vi";
  return SatStudentExperienceEngine.renderMicroLessonCoachCard({ lesson, vi, rule: studentLessonRuleText(lesson, vi), example: lesson.example || lessonExampleFor(lesson), trap: Array.isArray(lesson.traps) && lesson.traps.length ? lesson.traps[0] : studentLessonTrapText(lesson, vi), proof: studentLessonProofText(lesson, vi) });
}

function renderStudentLessonCheckpoint(lesson) {
  const vi = state.language === "vi";
  const progress = profile().lessonProgress?.[lesson.key] || {};
  const reviewed = Boolean(progress.reviewedAt || progress.status === "reviewed" || progress.status === "understood");
  const scaffoldCount = Array.isArray(lesson.scaffold) ? lesson.scaffold.length : 0;
  const proofCount = Array.isArray(lesson.proofDrills) ? lesson.proofDrills.reduce((total, drill) => total + Number(drill.count || 0), 0) : 0;
  return `
    <section class="student-lesson-checkpoint">
      <div>
        <p class="eyebrow">${vi ? "Checkpoint" : "Checkpoint"}</p>
        <h3>${vi ? "Đọc xong thì luyện ngay cùng kỹ năng" : "After reading, practice this same skill"}</h3>
        <p>${vi ? "Mục tiêu là biến bài học thành hành động: hiểu quy tắc, làm bài dẫn, rồi chứng minh bằng câu mới." : "Turn the lesson into action: understand the rule, do scaffold work, then prove it with a fresh item."}</p>
      </div>
      <div class="student-lesson-check-grid">
        <div class="${reviewed ? "done" : ""}"><strong>1</strong><span>${vi ? "Hiểu quy tắc" : "Understand rule"}</span></div>
        <div><strong>2</strong><span>${vi ? `${Math.max(3, scaffoldCount || 3)} câu dẫn` : `${Math.max(3, scaffoldCount || 3)} scaffold items`}</span></div>
        <div><strong>3</strong><span>${vi ? `${Math.max(1, proofCount || 1)} câu chứng minh` : `${Math.max(1, proofCount || 1)} proof item`}</span></div>
      </div>
      <div class="answer-actions">
        <button class="button primary student-lesson-understood" type="button" data-lesson-key="${escapeHtml(lesson.key)}">${vi ? "Tôi hiểu quy tắc - luyện ngay" : "I understand - practice now"}</button>
        <button class="button secondary lesson-start-drill" type="button" data-lesson-key="${escapeHtml(lesson.key)}">${vi ? "Làm bài dẫn" : "Do scaffold"}</button>
        <button class="button secondary student-lesson-practice" type="button" data-lesson-key="${escapeHtml(lesson.key)}">${vi ? "Luyện cùng kỹ năng" : "Practice same skill"}</button>
      </div>
    </section>
  `;
}

function markLessonUnderstoodAndPractice(key) {
  const lesson = lessonByKey(key);
  if (!lesson) return;
  const p = profile();
  p.lessonProgress[lesson.key] = {
    ...(p.lessonProgress[lesson.key] || {}),
    status: "understood",
    reviewedAt: new Date().toISOString(),
    section: lesson.section,
    domain: lesson.domain,
    skill: lesson.skill,
  };
  saveState();
  startLessonScopedPractice(key);
}

function startLessonScopedPractice(key) {
  const lesson = lessonByKey(key);
  if (!lesson) return;
  startScopedPractice({
    section: lesson.section || "All",
    domain: lesson.domain || "All",
    skill: lesson.skill || "All",
    difficulty: "All",
    source: "All",
  });
}

function applyStudentLessonCopy() {
  const student = currentAccount()?.role === "student";
  const vi = state.language === "vi";
  if (!student) return;
  const heading = document.querySelector("#view-lessons > .section-heading");
  if (heading) {
    const eyebrow = heading.querySelector(".eyebrow");
    const title = heading.querySelector("h2");
    const copy = heading.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = vi ? "Bài học" : "Lessons";
    if (title) title.textContent = vi ? "Học đúng kỹ năng yếu" : "Study the right weak skill";
    if (copy) {
      copy.textContent = vi
        ? "Mở bài được đề xuất trước, đọc quy tắc ngắn, xem bẫy, rồi làm drill dẫn dắt/proof cùng kỹ năng."
        : "Start with the recommended lesson, read the short rule, check traps, then do scaffold/proof work.";
    }
  }
  const filterHeading = document.querySelector("#view-lessons .lesson-filters .section-heading");
  if (filterHeading) {
    const eyebrow = filterHeading.querySelector(".eyebrow");
    const title = filterHeading.querySelector("h2");
    if (eyebrow) eyebrow.textContent = vi ? "Chọn nhanh" : "Find lesson";
    if (title) title.textContent = vi ? "Bài nên học" : "Recommended first";
  }
  const labelMap = vi
    ? {
        "lesson-section": "Phần thi",
        "lesson-domain": "Nhóm kỹ năng",
        "lesson-stage": "Giai đoạn",
        "lesson-search": "Tìm bài",
      }
    : {
        "lesson-section": "Section",
        "lesson-domain": "Domain",
        "lesson-stage": "Stage",
        "lesson-search": "Search",
      };
  Object.entries(labelMap).forEach(([id, text]) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = text;
  });
  if (els.lessonSearch) {
    els.lessonSearch.placeholder = vi ? "linear equations, transition, probability..." : "linear equations, transitions, cross-text...";
  }
  [els.lessonSection, els.lessonDomain, els.lessonStage].forEach(localizeSelectOptions);
}

function renderStudentLessonRecommendations(lessons = [], activeLessonKey = "") {
  const vi = state.language === "vi";
  const recommended = lessons.slice(0, 3);
  if (!recommended.length) {
    return `<div class="student-lesson-recommend empty-state">${vi ? "Chưa có bài phù hợp với bộ lọc hiện tại." : "No recommended lessons match the current filters."}</div>`;
  }
  return `
    <section class="student-lesson-recommend">
      <div>
        <p class="eyebrow">${vi ? "Bài nên học trước" : "Recommended first"}</p>
        <h3>${escapeHtml(recommended[0].skill)}</h3>
        <p>${vi ? "Ưu tiên theo lỗi sai, queue ôn tập và mastery hiện tại." : "Prioritized from mistakes, review queue, and current mastery."}</p>
      </div>
      <div class="student-lesson-recommend-grid">
        ${recommended
          .map(
            (lesson, index) => `
              <button class="lesson-recommend-card ${lesson.key === activeLessonKey ? "active" : ""}" type="button" data-lesson-key="${escapeHtml(lesson.key)}">
                <span>${index + 1}</span>
                <strong>${escapeHtml(lesson.skill)}</strong>
                <small>${escapeHtml(lesson.stage)} - ${Number(lesson.queueCount || 0)} ${vi ? "lỗi cần ôn" : "review task(s)"}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function lessonByKey(key) {
  return hydrateLessonDetail(buildLessonLibrary().find((lesson) => lesson.key === key) || null);
}

function startLessonScaffoldDrill(key) {
  const lesson = lessonByKey(key);
  if (!lesson || !lesson.scaffold.length) {
    alert("No scaffold questions are available for this lesson yet.");
    return;
  }
  startPracticeSession({
    mode: "Lesson Scaffold",
    questions: lesson.scaffold,
    minutes: Math.max(6, lesson.scaffold.length * 2),
    summary: `${lesson.skill}: concept -> core -> trap -> proof.`,
  });
}

function saveLessonNote(key) {
  const lesson = lessonByKey(key);
  if (!lesson) return;
  switchView("notes");
  els.noteTitle.value = `Lesson: ${lesson.skill}`;
  els.noteSection.value = lesson.section === "Math" ? "Math" : "Reading and Writing";
  els.noteDomain.value = lesson.domain;
  els.noteSkill.value = lesson.skill;
  els.noteType.value = "concept";
  els.notePriority.value = lesson.queueCount ? "high" : "medium";
  els.noteBody.value = `${lesson.rule}\n\nExample: ${lesson.example}\n\nSteps:\n${lesson.steps.map((step) => `${step[0]}: ${step[1]}`).join("\n")}\n\nTraps:\n${lesson.traps.map((trap) => `- ${trap}`).join("\n")}\n\nMicro-check: ${lesson.drill}`;
  els.noteTags.value = `lesson,${slugify(lesson.domain)},${slugify(lesson.skill)}`;
  els.noteStarred.checked = Boolean(lesson.queueCount);
}

function addLessonReviewTask(key) {
  const lesson = lessonByKey(key);
  if (!lesson) return;
  const p = profile();
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 1);
  p.lessonProgress[lesson.key] = {
    ...(p.lessonProgress[lesson.key] || {}),
    status: "assigned",
    assignedAt: now.toISOString(),
    dueAt: due.toISOString(),
    section: lesson.section,
    domain: lesson.domain,
    skill: lesson.skill,
  };
  saveState();
  renderLessons();
  alert("Lesson added to the review queue.");
}

function rebuildRoadmapFromData() {
  const p = profile();
  const latest = latestPretest();
  if (latest) {
    p.roadmap = buildRoadmap(latest);
  } else {
    p.roadmap = buildRoadmapFromAttempts();
  }
  p.roadmapLastBuiltAt = new Date().toISOString();
  p.roadmapBuildReason = "manual_rebuild";
  startLearnerAnalysis("roadmap", 1200);
  saveState();
  requestLearningProfileSync("manual_roadmap_rebuild", { immediate: true });
  renderRoadmap();
  applyDynamicVisualState();
}

function buildRoadmapFromAttempts() {
  if (SatRoadmapEngine.buildRoadmapV2) {
    const v2 = SatRoadmapEngine.buildRoadmapV2({
      diagnostic: latestPretest(),
      skillRows: buildSkillMatrix(),
      remediationQueue: buildAdaptiveRemediationQueue({ includeFuture: true, includePassed: false, limit: 20 }),
      targetScore: currentAccount()?.targetScore,
      profile: profile(),
      account: currentAccount(),
      nowIso: new Date().toISOString(),
    });
    if (v2.length) return v2;
  }
  return buildMasteryRoadmap(null);
}

function maybeRefreshRoadmapAfterAttempt(fromPretest, attempt = null) {
  if (fromPretest) return;
  const p = profile();
  const practiceAttempts = (p.attempts || []).filter((attempt) => !attempt.fromPretest).length;
  const signals = SatRoadmapEngine.roadmapRefreshSignals
    ? SatRoadmapEngine.roadmapRefreshSignals({ profile: p, latest: latestPretest() })
    : [];
  const activeSignals = signals.filter((signal) => signal.active && signal.id !== "manual_rebuild");
  const proofRefresh = attempt && /proof/i.test(String(attempt.practiceMode || "")) && activeSignals.some((signal) => ["proof_passed", "proof_failed"].includes(signal.id));
  const tenAttemptRefresh = activeSignals.some((signal) => signal.id === "ten_practice_attempts") || Boolean(practiceAttempts && practiceAttempts % 10 === 0);
  const diagnosticRefresh = activeSignals.some((signal) => signal.id === "diagnostic_or_full_test");
  if (!proofRefresh && !tenAttemptRefresh && !diagnosticRefresh) return;
  const latest = latestPretest();
  p.roadmap = latest ? buildRoadmap(latest) : buildRoadmapFromAttempts();
  p.roadmapLastBuiltAt = new Date().toISOString();
  p.roadmapBuildReason = activeSignals.length
    ? `auto_${activeSignals.map((signal) => signal.id).join("_")}`
    : `auto_after_${practiceAttempts}_practice_attempts`;
}

function buildSkillMatrix() {
  return buildSkillMastery().sort((a, b) => a.mastery - b.mastery || b.priorityScore - a.priorityScore || b.attempts - a.attempts);
}

function templateFormId(question) {
  return question?.templateDiversity?.formId || "";
}

function practicePool(question) {
  return SatDuplicateEngine.practicePool(question);
}

function skeletonId(question) {
  return SatDuplicateEngine.skeletonId(question);
}

function stableSkeletonId(key) {
  return SatDuplicateEngine.stableSkeletonId(key);
}

function questionSkeletonKey(question) {
  return SatDuplicateEngine.questionSkeletonKey(question);
}

function normalizeSkeletonText(prompt = "") {
  return SatDuplicateEngine.normalizeSkeletonText(prompt);
  // Legacy body is intentionally bypassed; duplicate policy lives in sat_duplicate_engine.js.
  return String(prompt || "")
    .toLowerCase()
    .replace(/[≥]/g, ">=")
    .replace(/[≤]/g, "<=")
    .replace(/[−]/g, "-")
    .replace(/\btext\s*1\b/g, "text one")
    .replace(/\btext\s*2\b/g, "text two")
    .replace(/\$?\b\d+(?:,\d{3})*(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?%?/g, "#")
    .replace(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/g, "@month")
    .replace(/\b[a-z]\b(?=\s*[=+\-*/^<>()])/g, "v")
    .replace(/(?<=[=+\-*/^<>()])\s*\b[a-z]\b/g, " v")
    .replace(/\bf\(#\)|g\(#\)|h\(#\)/g, "f(#)")
    .replace(/\b[a-z]\(\s*v\s*\)/g, "f(v)")
    .replace(/\b(point|set|case|site|sample|trial|group|plan|route|project) [a-z]\b/g, "$1 @")
    .replace(/\b[a-z][a-z]+(?:ian|son|ton|ley|man|berg|ez|ski|ova|ov)\b/g, "@name")
    .replace(/\s*([,.;:?!()=+\-*/<>])\s*/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
}

function templateFormStats(formId) {
  if (!formId) return { correct: 0, wrong: 0 };
  const cacheKey = `${state.activeAccountId}|${profile().attempts.length}|${formId}`;
  if (templateStatsCache.has(cacheKey)) return templateStatsCache.get(cacheKey);
  const stats = profile().attempts.reduce(
    (acc, attempt) => {
      const question = getQuestionById(attempt.questionId);
      if (templateFormId(question) !== formId) return acc;
      if (attempt.correct) acc.correct += 1;
      else acc.wrong += 1;
      return acc;
    },
    { correct: 0, wrong: 0 },
  );
  templateStatsCache.set(cacheKey, stats);
  return stats;
}

function isTemplateVariantAvailable(question) {
  const formId = templateFormId(question);
  if (!formId) return true;
  const maxBeforeMastery = Number(question.templateDiversity?.maxVisibleBeforeMastery || 3);
  const formSize = Number(question.templateDiversity?.formSize || maxBeforeMastery);
  const rank = Number(question.templateDiversity?.formRank || 1);
  if (!profile().attempts.length) return rank <= maxBeforeMastery;
  const stats = templateFormStats(formId);
  if (stats.correct > 0) return false;
  const visibleLimit = Math.min(formSize, maxBeforeMastery + stats.wrong * 2);
  return rank <= visibleLimit;
}

function skeletonStats(id) {
  if (!id) return { correct: 0, wrong: 0 };
  const cacheKey = `${state.activeAccountId}|${profile().attempts.length}|${id}`;
  if (skeletonStatsCache.has(cacheKey)) return skeletonStatsCache.get(cacheKey);
  const stats = profile().attempts.reduce(
    (acc, attempt) => {
      const question = getQuestionById(attempt.questionId);
      if (skeletonId(question) !== id) return acc;
      if (attempt.correct) acc.correct += 1;
      else acc.wrong += 1;
      return acc;
    },
    { correct: 0, wrong: 0 },
  );
  skeletonStatsCache.set(cacheKey, stats);
  return stats;
}
function isSkeletonPoolAvailable(question) {
  const pool = practicePool(question);
  if (pool === "hidden_duplicate") return false;
  if (pool !== "remedial_pool") return true;
  if (!profile().attempts.some((attempt) => !attempt.correct)) return false;
  if (!question?.skeletonDiversity?.skeletonId && question?.topicGovernance) {
    const target = `${question?.section || ""}|${question?.domain || ""}|${question?.skill || ""}`;
    return target !== "||" && profile().attempts.some((attempt) => {
      const attempted = getQuestionById(attempt.questionId);
      return !attempt.correct && `${attempted?.section || ""}|${attempted?.domain || ""}|${attempted?.skill || ""}` === target;
    });
  }
  const id = skeletonId(question);
  const stats = skeletonStats(id);
  if (stats.correct > 0 || stats.wrong <= 0) return false;
  const coreLimit = Number(question?.skeletonDiversity?.coreLimit || 5);
  const activeLimit = Number(question?.skeletonDiversity?.activeLimit || 10);
  const rank = Number(question?.skeletonDiversity?.skeletonRank || coreLimit + 1);
  const visibleLimit = Math.min(activeLimit, coreLimit + stats.wrong * 2);
  return rank <= visibleLimit;
}
function isStudyAvailableQuestion(question) {
  const blocked = SatPermissions.isQuestionBlockedForStudy
    ? SatPermissions.isQuestionBlockedForStudy(question)
    : question?.reviewStatus === "rejected" || question?.auditStatus === "blocked" || question?.publicationStatus === "audit_blocked";
  const suppressedByPolicy = currentAccount()?.role === "student" && questionStudyPolicyManager?.isSuppressed(question);
  return !blocked && !suppressedByPolicy && isTrustedPracticeQuestion(question) && isSkeletonPoolAvailable(question) && isTemplateVariantAvailable(question);
}

function defaultPracticeReviewStatus(account = currentAccount()) {
  return account?.role === "student" ? "reviewed" : "All";
}

function isTrustedPracticeQuestion(question, account = currentAccount()) {
  if (account?.role !== "student") return true;
  return question?.reviewStatus === "reviewed";
}

function skeletonPolicyLimits(difficulty) {
  return SatDuplicateEngine.skeletonPolicyLimits(difficulty);
}

function skeletonPolicySortValue(question) {
  const sourcePriority = { sat_1590: 0, sat_king: 1, antigravity: 2, ai_generated: 3, original: 4, foundation: 5, opensat: 6, private_vault: 7 };
  const typePriority = isGridInQuestion(question) ? 0 : 1;
  const explanationWords = String(question?.explanation || "").split(/\s+/).filter(Boolean).length;
  return [
    duplicateCalculationEaseScore(question),
    -Math.min(explanationWords, 160),
    sourcePriority[question?.sourceType] ?? 9,
    typePriority,
    String(question?.id || ""),
  ];
}

function compareSkeletonPolicyQuestions(a, b) {
  return SatDuplicateEngine.compareSkeletonPolicyQuestions(a, b);
}

function duplicateCalculationEaseScore(question) {
  return SatDuplicateEngine.duplicateCalculationEaseScore(question);
}

function numbersInText(text = "") {
  return SatDuplicateEngine.numbersInText(text);
}

function duplicateAnswerRoundnessScore(question) {
  return SatDuplicateEngine.duplicateAnswerRoundnessScore(question);
  // Legacy body is intentionally bypassed; duplicate policy lives in sat_duplicate_engine.js.
  const answer = getCorrectAnswerLabel(question);
  const value = parseStudentNumber(normalizeStudentAnswer(answer));
  if (value === null) {
    if (String(answer).includes("/")) return 2;
    if (/pi|π/i.test(String(answer))) return 1;
    return 3;
  }
  if (Math.abs(value - Math.round(value)) < 1e-9) {
    const n = Math.abs(Math.round(value));
    if (n <= 100 && (n <= 20 || n % 5 === 0)) return 0;
    return n <= 500 ? 1 : 2;
  }
  if (Math.abs(value * 2 - Math.round(value * 2)) < 1e-9) return 1;
  if (Math.abs(value * 4 - Math.round(value * 4)) < 1e-9 || Math.abs(value * 10 - Math.round(value * 10)) < 1e-9) return 2;
  return 4;
}

function duplicateScanQuestionPool(scope = "generated") {
  return SatDuplicateEngine.duplicateScanQuestionPool(visibleQuestionBank(), scope);
}

function topicScanKey(question) {
  return SatDuplicateEngine.topicScanKey(question);
}

function topicScanLabel(key) {
  return SatDuplicateEngine.topicScanLabel(key, labelFor);
}

function buildDuplicateSkeletonScan(scope = "generated", apply = false) {
  return SatDuplicateEngine.buildDuplicateSkeletonScan(visibleQuestionBank(), { scope, apply, labelFor });
  // Legacy body is intentionally bypassed; duplicate policy lives in sat_duplicate_engine.js.
  const questions = duplicateScanQuestionPool(scope);
  const topics = new Map();
  questions.forEach((question) => {
    const topicKey = topicScanKey(question);
    if (!topics.has(topicKey)) topics.set(topicKey, []);
    topics.get(topicKey).push(question);
  });

  const rows = [];
  const poolCounts = { core_pool: 0, remedial_pool: 0, hidden_duplicate: 0 };
  let skeletonCount = 0;

  [...topics.entries()].forEach(([topicKey, topicQuestions]) => {
    const skeletonGroups = new Map();
    topicQuestions.forEach((question) => {
      const key = questionSkeletonKey(question);
      if (!skeletonGroups.has(key)) skeletonGroups.set(key, []);
      skeletonGroups.get(key).push(question);
    });

    skeletonCount += skeletonGroups.size;

    [...skeletonGroups.entries()].forEach(([key, group]) => {
      const ranked = [...group].sort(compareSkeletonPolicyQuestions);
      const sample = ranked[0];
      const { coreLimit, activeLimit } = skeletonPolicyLimits(sample.difficulty || "Medium");
      const id = stableSkeletonId(key);
      ranked.forEach((question, index) => {
        const rank = index + 1;
        const pool = rank <= coreLimit ? "core_pool" : rank <= activeLimit ? "remedial_pool" : "hidden_duplicate";
        poolCounts[pool] += 1;
        if (apply) {
          question.practicePool = pool;
          question.skeletonDiversity = {
            skeletonId: id,
            skeletonRank: rank,
            skeletonSize: ranked.length,
            coreLimit,
            activeLimit,
            practicePool: pool,
            calculationEaseScore: duplicateCalculationEaseScore(question),
            roundAnswerPreferred: duplicateAnswerRoundnessScore(question) <= 1,
            skeletonKey: key.slice(0, 280),
            reason:
              pool === "core_pool"
                ? "Within core diversity cap."
                : pool === "remedial_pool"
                  ? "Repeated skeleton kept only for learners who miss this form."
                  : "Skeleton overflow beyond active cap.",
            policy: "Core pool is visible by default. Remedial pool opens after misses. Hidden duplicates stay out of normal practice.",
          };
          if (pool === "hidden_duplicate") {
            question.publicationStatus = "hidden_duplicate_skeleton_overflow";
          } else if (question.publicationStatus === "hidden_duplicate_skeleton_overflow") {
            question.publicationStatus = question.visibility === "private_family" ? "private_auto_reviewed" : "public_candidate_auto_reviewed";
          }
        }
      });

      if (ranked.length > coreLimit) {
        rows.push({
          skeletonId: id,
          topicKey,
          topic: topicScanLabel(topicKey),
          size: ranked.length,
          coreLimit,
          activeLimit,
          corePool: Math.min(ranked.length, coreLimit),
          remedialPool: Math.max(0, Math.min(ranked.length, activeLimit) - coreLimit),
          hiddenDuplicate: Math.max(0, ranked.length - activeLimit),
          sampleId: sample.id,
          samplePrompt: sample.prompt,
          sourceMix: countBy(ranked, "sourceType"),
        });
      }
    });
  });

  return {
    scope,
    applied: apply,
    scannedAt: new Date().toISOString(),
    topicCount: topics.size,
    questionCount: questions.length,
    skeletonCount,
    poolCounts,
    repeatedGroups: rows.sort((a, b) => b.size - a.size || a.topic.localeCompare(b.topic)),
  };
}

function countBy(items, key) {
  return SatDuplicateEngine.countBy(items, key);
}

function formatCountMapReadable(map = {}) {
  const entries = Object.entries(map && typeof map === "object" ? map : {})
    .filter(([, count]) => Number(count || 0) > 0)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0) || labelFor(a[0]).localeCompare(labelFor(b[0])));
  return entries.length ? entries.map(([key, count]) => `${labelFor(key)}: ${Number(count)}`).join("; ") : "No source mix recorded";
}

function renderTopics() {
  if (activeView !== "topics") return;
  const questions = getTopicQuestions();
  const reviewed = questions.filter((q) => q.reviewStatus === "reviewed").length;
  const needsReview = questions.filter((q) => q.reviewStatus === "needs_review").length;
  const sourceLabels = unique(questions.map((q) => labelFor(q.sourceType))).join(", ") || "No source";
  const studentMode = currentAccount()?.role === "student";
  const skillLabel = els.topicSkill.value === "All" ? (studentMode ? studentUiLabel("All skills") : "All skills") : els.topicSkill.value;
  const cards = buildTopicCards();

  els.topicSessionSummary.innerHTML = studentMode
    ? renderStudentTopicSummary({ questions, skillLabel, cards })
    : SatViewRenderers.renderTopicSummary
      ? SatViewRenderers.renderTopicSummary({ count: questions.length, reviewed, needsReview, skillLabel, sourceLabels })
      : "";
  els.startTopicPractice.disabled = questions.length === 0;
  if (studentMode) {
    const vi = state.language === "vi";
    els.startTopicPractice.textContent = questions.length
      ? vi
        ? `Luyện ${Math.min(10, questions.length)} câu`
        : `Practice ${Math.min(10, questions.length)}`
      : vi
        ? "Chưa có câu phù hợp"
        : "No matching questions";
  }

  renderStudentTopicCoach({ questions, cards });
  els.topicCards.innerHTML = studentMode ? renderStudentTopicCards(cards) : SatViewRenderers.renderTopicCards ? SatViewRenderers.renderTopicCards(cards) : "";
  applyStudentTopicCopy({ questions });

  document.querySelectorAll(".topic-card-button").forEach((button) => {
    button.addEventListener("click", () => {
      els.topicSection.value = button.dataset.section;
      refreshTopicFilters("topicSection");
      els.topicDomain.value = button.dataset.domain;
      refreshTopicFilters("topicDomain");
      els.topicSkill.value = button.dataset.skill;
      renderTopics();
      startTopicPractice();
    });
  });
  bindStudentTopicCoachActions();
}

function renderStudentTopicCards(cards = []) {
  const vi = state.language === "vi";
  if (!cards.length) return `<div class="empty-state">${vi ? "Chưa có chuyên đề phù hợp với bộ lọc hiện tại." : "No topics match the current filters."}</div>`;
  const visible = cards.slice(0, 8);
  const hidden = cards.slice(8);
  const renderCards = renderStudentTopicCardList;
  return `
    ${renderCards(visible)}
    ${
      hidden.length
        ? `<div class="student-more-list topic-more-list"><strong>${vi ? `${hidden.length} chuyên đề khác đã ẩn` : `${hidden.length} more topics hidden`}</strong><span>${vi ? "Dùng bộ lọc hoặc tìm theo kỹ năng để mở đúng phần cần luyện." : "Use filters or search by skill to open the exact area you need."}</span></div>`
        : ""
    }
  `;
}

function renderStudentTopicSummary({ questions = [], skillLabel = "All skills", cards = [] } = {}) {
  const vi = state.language === "vi";
  const hard = questions.filter((question) => question.difficulty === "Hard").length;
  const medium = questions.filter((question) => question.difficulty === "Medium").length;
  const easy = questions.filter((question) => question.difficulty === "Easy").length;
  const total = questions.length;
  const skillCount = cards.length || unique(questions.map((question) => `${question.domain}|${question.skill}`)).length;
  const focus = !skillLabel || skillLabel === "All skills" || skillLabel === studentUiLabel("All skills") ? (vi ? "Tất cả kỹ năng" : "All skills") : skillLabel;
  return `
    <div class="topic-summary-grid student-topic-summary">
      <div><strong>${Number(total || 0)}</strong><span>${vi ? "câu có thể luyện" : "practice-ready questions"}</span></div>
      <div><strong>${Number(skillCount || 0)}</strong><span>${vi ? "chuyên đề nhỏ" : "small topics"}</span></div>
      <div><strong>${Number(hard || 0)}</strong><span>${vi ? "câu khó" : "hard questions"}</span></div>
    </div>
    <p class="muted">${vi ? "Phạm vi" : "Scope"}: ${escapeHtml(focus)} · ${vi ? "Dễ" : "Easy"} ${Number(easy)} / ${vi ? "Trung bình" : "Medium"} ${Number(medium)} / ${vi ? "Khó" : "Hard"} ${Number(hard)}</p>
  `;
}

function renderStudentTopicCardList(cards = []) {
  const vi = state.language === "vi";
  return cards
    .map((card) => {
      const difficultyHint = topicCardDifficultyHint(card);
      return `
        <article class="topic-card student-topic-card">
          <div>
            <p class="eyebrow">${escapeHtml(card.section || "")}</p>
            <h3>${escapeHtml(card.skill || (vi ? "Chuyên đề" : "Topic"))}</h3>
            <p>${escapeHtml(card.domain || "")}</p>
          </div>
          <div class="topic-card-meta">
            <span class="pill">${Number(card.count || 0)} ${vi ? "câu" : "questions"}</span>
            ${difficultyHint ? `<span class="pill">${escapeHtml(difficultyHint)}</span>` : ""}
          </div>
          <button
            class="button secondary topic-card-button"
            type="button"
            data-section="${escapeHtml(card.section || "All")}"
            data-domain="${escapeHtml(card.domain || "All")}"
            data-skill="${escapeHtml(card.skill || "All")}"
          >${vi ? "Luyện tập" : "Practice"}</button>
        </article>
      `;
    })
    .join("");
}

function topicCardDifficultyHint(card = {}) {
  const questions = visibleQuestionBank().filter(
    (question) =>
      isStudyAvailableQuestion(question) &&
      question.section === card.section &&
      question.domain === card.domain &&
      question.skill === card.skill,
  );
  if (!questions.length) return "";
  const hard = questions.filter((question) => question.difficulty === "Hard").length;
  const medium = questions.filter((question) => question.difficulty === "Medium").length;
  const vi = state.language === "vi";
  if (hard) return `${hard} ${vi ? "câu khó" : "hard"}`;
  if (medium) return `${medium} ${vi ? "câu trung bình" : "medium"}`;
  return vi ? "Nền tảng" : "Foundation";
}

function renderStudentTopicCoach({ questions = [], cards = [] } = {}) {
  if (!els.studentTopicCoach) return;
  if (currentAccount()?.role !== "student") {
    els.studentTopicCoach.hidden = true;
    els.studentTopicCoach.innerHTML = "";
    return;
  }
  const weakSkills = getWeakSkills();
  const recommended = weakSkills
    .map((weak) => cards.find((card) => card.skill === weak.skill && card.domain === weak.domain) || {
      section: weak.section,
      domain: weak.domain,
      skill: weak.skill,
      count: questions.filter((question) => question.skill === weak.skill && question.domain === weak.domain).length,
    })
    .filter((item, index, arr) => item && arr.findIndex((other) => other.skill === item.skill && other.domain === item.domain) === index)
    .slice(0, 3);
  const fallback = cards.slice(0, 3);
  const rows = recommended.length ? recommended : fallback;
  const vi = state.language === "vi";
  const currentLabel = els.topicSkill?.value && els.topicSkill.value !== "All" ? els.topicSkill.value : rows[0]?.skill || "diagnostic";
  els.studentTopicCoach.hidden = false;
  els.studentTopicCoach.innerHTML = `
    <section class="student-topic-coach-inner">
      <div>
        <p class="eyebrow">${vi ? "Gợi ý chọn chuyên đề" : "Topic suggestion"}</p>
        <h3>${escapeHtml(currentLabel)}</h3>
        <p>${vi ? "Chọn một kỹ năng nhỏ, làm một set ngắn, sau đó đọc feedback và ghi lại lỗi. Không cần mở toàn bộ bank." : "Pick one small skill, do a short set, then read feedback and log the mistake. You do not need to open the full bank."}</p>
      </div>
      <div class="student-topic-recommendations">
        ${rows
          .map(
            (row, index) => `
              <button
                class="student-topic-recommend-card"
                type="button"
                data-section="${escapeHtml(row.section || "All")}"
                data-domain="${escapeHtml(row.domain || "All")}"
                data-skill="${escapeHtml(row.skill || "All")}"
              >
                <span>${index + 1}</span>
                <strong>${escapeHtml(row.skill || (vi ? "Chuyên đề" : "Topic"))}</strong>
                <small>${escapeHtml(row.domain || row.section || "")} - ${Number(row.count || 0)} ${vi ? "câu" : "questions"}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function bindStudentTopicCoachActions() {
  document.querySelectorAll(".student-topic-recommend-card").forEach((button) => {
    button.addEventListener("click", () => {
      setSelectValueIfExists(els.topicSection, button.dataset.section || "All");
      refreshTopicFilters("topicSection");
      setSelectValueIfExists(els.topicDomain, button.dataset.domain || "All");
      refreshTopicFilters("topicDomain");
      setSelectValueIfExists(els.topicSkill, button.dataset.skill || "All");
      renderTopics();
    });
  });
}

function applyStudentTopicCopy({ questions = [] } = {}) {
  if (currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  const heading = document.querySelector("#view-topics > .section-heading");
  const eyebrow = heading?.querySelector(".eyebrow");
  const title = heading?.querySelector("h2");
  const copy = heading?.querySelector(".muted");
  if (eyebrow) eyebrow.textContent = vi ? "Chuyên đề" : "Topics";
  if (title) title.textContent = vi ? "Chọn đúng kỹ năng để luyện" : "Pick the right skill to practice";
  if (copy) copy.textContent = vi ? "Dùng màn này khi đã biết rõ kỹ năng cần luyện. Nếu chưa chắc, mở Bài học hoặc Lộ trình trước." : "Use this when you know the skill you want to practice. If not, open Lessons or Roadmap first.";
  const builder = document.querySelector("#view-topics .topic-layout > .panel:first-child");
  if (builder) {
    const builderEyebrow = builder.querySelector(".eyebrow");
    const builderTitle = builder.querySelector("h2");
    if (builderEyebrow) builderEyebrow.textContent = vi ? "Tạo set luyện" : "Build a practice set";
    if (builderTitle) builderTitle.textContent = vi ? "Lọc theo kỹ năng nhỏ" : "Filter by small skill";
  }
  const mapHeading = document.querySelector("#view-topics .topic-layout > .panel:last-child .section-heading");
  if (mapHeading) {
    const mapEyebrow = mapHeading.querySelector(".eyebrow");
    const mapTitle = mapHeading.querySelector("h2");
    if (mapEyebrow) mapEyebrow.textContent = vi ? "Gợi ý nhanh" : "Quick picks";
    if (mapTitle) mapTitle.textContent = vi ? "Các chuyên đề có câu" : "Topics with questions";
  }
  [
    ["topic-section", vi ? "Phần thi" : "Section"],
    ["topic-domain", vi ? "Nhóm kỹ năng" : "Domain"],
    ["topic-skill", vi ? "Kỹ năng" : "Skill"],
    ["topic-difficulty", vi ? "Độ khó" : "Difficulty"],
    ["topic-source", vi ? "Nguồn" : "Source"],
  ].forEach(([id, text]) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = text;
  });
  [els.topicSection, els.topicDomain, els.topicSkill, els.topicDifficulty, els.topicSource].forEach(localizeSelectOptions);
  if (els.topicSessionSummary) localizeDynamicUiText(els.topicSessionSummary);
  if (els.topicCards) localizeDynamicUiText(els.topicCards);
}

function getTopicQuestions() {
  const studentMode = currentAccount()?.role === "student";
  const criteria = {
    section: els.topicSection.value || "All",
    domain: els.topicDomain.value || "All",
    skill: els.topicSkill.value || "All",
    difficulty: els.topicDifficulty.value || "All",
    sourceType: studentMode ? "All" : els.topicSource.value || "All",
  };
  if (studentMode) {
    return reviewedStudyContentRepository()
      .query(criteria, { includeContent: true, limit: 200, sort: "difficulty" })
      .items;
  }
  if (SatQuestionQueryEngine.filterQuestions) {
    return SatQuestionQueryEngine.filterQuestions(visibleQuestionBank(), criteria, { predicate: isStudyAvailableQuestion });
  }
  return visibleQuestionBank().filter(
    (q) =>
      isStudyAvailableQuestion(q) &&
      (criteria.section === "All" || q.section === criteria.section) &&
      (criteria.domain === "All" || q.domain === criteria.domain) &&
      (criteria.skill === "All" || q.skill === criteria.skill) &&
      (criteria.difficulty === "All" || q.difficulty === criteria.difficulty) &&
      (criteria.sourceType === "All" || q.sourceType === criteria.sourceType),
  );
}

function buildTopicCards() {
  const studentMode = currentAccount()?.role === "student";
  const criteria = {
    section: els.topicSection.value || "All",
    domain: els.topicDomain.value || "All",
    sourceType: studentMode ? "All" : els.topicSource.value || "All",
  };
  if (studentMode) {
    return reviewedStudyContentRepository().topicCards(criteria, { predicate: isStudyAvailableQuestion }).slice(0, 18);
  }
  if (SatQuestionQueryEngine.buildTopicCards) {
    return SatQuestionQueryEngine.buildTopicCards(visibleQuestionBank(), criteria, { predicate: isStudyAvailableQuestion }).slice(0, 18);
  }
  const map = new Map();
  getTopicQuestions().forEach((q) => {
    const key = `${q.section}|${q.domain}|${q.skill}`;
    const item = map.get(key) || {
      section: q.section,
      domain: q.domain,
      skill: q.skill,
      count: 0,
      reviewed: 0,
      needsReview: 0,
    };
    item.count += 1;
    if (q.reviewStatus === "reviewed") item.reviewed += 1;
    if (q.reviewStatus === "needs_review") item.needsReview += 1;
    map.set(key, item);
  });
  return [...map.values()].sort((a, b) => b.count - a.count || a.section.localeCompare(b.section)).slice(0, 18);
}

function clearPracticeSessionState() {
  stopPracticeTimer();
  practiceSessionMode = "standard";
  practiceSessionQuestionIds = null;
  practiceSessionStartedAt = "";
  practiceSessionDeadlineAt = "";
  practiceSessionSummaryText = "";
  practiceSessionExpired = false;
  activePracticeSessionId = "";
  practiceSessionAttemptIds = [];
  practiceSessionContext = {};
  practiceQuestionStartedAt = 0;
  practiceActiveQuestionId = "";
}

function startFiveMinuteSprint() {
  const questions = buildAdaptiveSprintQuestions(5);
  if (!questions.length) {
    alert("No sprint questions available yet. Take a pretest or answer a few practice questions first.");
    return;
  }
  startPracticeSession({
    mode: "5-Minute Sprint",
    questions,
    minutes: 5,
    summary: "Five high-value questions from due reviews, weak skills, and recent mistakes.",
  });
}

function startHardSprint() {
  const questions = buildHardSprintQuestions(10);
  if (!questions.length) {
    alert("No hard questions are available for the current account.");
    return;
  }
  startPracticeSession({
    mode: "Hard Sprint",
    questions,
    minutes: 12,
    summary: "Hard mixed set for proof work. Use it after the lesson pass, not as the first exposure.",
  });
}

function startExamDrill() {
  const savedSessionIds = practiceSessionQuestionIds;
  practiceSessionQuestionIds = null;
  const pool = getFilteredQuestions();
  practiceSessionQuestionIds = savedSessionIds;
  const questions = buildExamDrillQuestions(pool, 20);
  if (!questions.length) {
    alert("No questions match the current filters for Exam Drill.");
    return;
  }
  startPracticeSession({
    mode: "Exam Drill",
    questions,
    minutes: 25,
    summary: "Timed Bluebook-style drill with mark review, strike-through, highlight, and pacing analytics.",
  });
}

function startPracticeSession({ mode, questions, minutes, summary, context = {} }) {
  clearPracticeSessionState();
  latestPracticeSessionReport = null;
  practiceSessionMode = mode || "standard";
  activePracticeSessionId = `practice-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  practiceSessionAttemptIds = [];
  practiceSessionContext = context || {};
  practiceSessionQuestionIds = questions.map((question) => question.id);
  practiceSessionStartedAt = new Date().toISOString();
  practiceSessionDeadlineAt = minutes ? new Date(Date.now() + minutes * 60 * 1000).toISOString() : "";
  practiceSessionSummaryText = summary || "";
  practiceSessionExpired = false;
  dueMode = false;
  activePracticeSkill = "All";
  currentIndex = 0;
  selectedAnswer = "";
  switchView("practice");
  startPracticeTimer();
  renderPracticeSessionBar();
}

function buildAdaptiveSprintQuestions(limit = 5) {
  const dueIds = new Set(getDueQuestionIds());
  const weakKeys = new Set(getWeakSkills().map((item) => `${item.section}|${item.domain}|${item.skill}`));
  const attemptedIds = new Set((profile().attempts || []).map((attempt) => attempt.questionId));
  return visibleQuestionBank()
    .filter((question) => question.reviewStatus !== "rejected" && isStudyAvailableQuestion(question))
    .map((question) => {
      const skillKey = `${question.section}|${question.domain}|${question.skill}`;
      let score = 0;
      if (dueIds.has(question.id)) score += 100;
      if (weakKeys.has(skillKey)) score += 60;
      if (question.difficulty === "Hard") score += 16;
      if (question.difficulty === "Medium") score += 10;
      if (!attemptedIds.has(question.id)) score += 8;
      if (question.reviewStatus === "reviewed") score += 5;
      return { question, score };
    })
    .sort((a, b) => b.score - a.score || a.question.skill.localeCompare(b.question.skill) || a.question.id.localeCompare(b.question.id))
    .slice(0, limit)
    .map((item) => item.question);
}

function buildHardSprintQuestions(limit = 10) {
  const weakKeys = new Set(getWeakSkills().map((item) => `${item.section}|${item.domain}|${item.skill}`));
  return visibleQuestionBank()
    .filter((question) => question.difficulty === "Hard" && question.reviewStatus !== "rejected" && isStudyAvailableQuestion(question))
    .map((question) => ({
      question,
      score: (weakKeys.has(`${question.section}|${question.domain}|${question.skill}`) ? 80 : 0) + (isGridInQuestion(question) ? 12 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.question.domain.localeCompare(b.question.domain) || a.question.id.localeCompare(b.question.id))
    .slice(0, limit)
    .map((item) => item.question);
}

function buildExamDrillQuestions(pool, limit = 20) {
  const candidates = pool.filter((question) => question.reviewStatus !== "rejected" && isStudyAvailableQuestion(question));
  const sections = ["Reading and Writing", "Math"];
  const balanced = [];
  sections.forEach((section) => {
    balanced.push(...candidates.filter((question) => question.section === section).slice(0, Math.ceil(limit / 2)));
  });
  const remaining = candidates.filter((question) => !balanced.some((item) => item.id === question.id));
  return [...balanced, ...remaining].slice(0, limit);
}

function buildStudentPracticeSet(pool = [], limit = 10) {
  const p = profile();
  const dueIds = new Set(getDueQuestionIds());
  const weakKeys = new Set(getWeakSkills().map((item) => `${item.section}|${item.domain}|${item.skill}`));
  const attemptedIds = new Set((p.attempts || []).map((attempt) => attempt.questionId));
  const candidates = (Array.isArray(pool) ? pool : [])
    .filter((question) => question && question.reviewStatus !== "rejected" && isStudyAvailableQuestion(question))
    .map((question) => {
      const skillKey = `${question.section}|${question.domain}|${question.skill}`;
      let score = 0;
      if (dueIds.has(question.id)) score += 100;
      if (weakKeys.has(skillKey)) score += 70;
      if (!attemptedIds.has(question.id)) score += 18;
      if (question.difficulty === "Medium") score += 12;
      if (question.difficulty === "Hard") score += 10;
      if (question.reviewStatus === "reviewed") score += 8;
      if (isGridInQuestion(question)) score += 3;
      return { question, score, skeleton: skeletonId(question) || question.id };
    })
    .sort((a, b) => b.score - a.score || a.question.domain.localeCompare(b.question.domain) || a.question.id.localeCompare(b.question.id));

  const selected = [];
  const usedSkeletons = new Set();
  candidates.forEach((item) => {
    if (selected.length >= limit) return;
    if (usedSkeletons.has(item.skeleton)) return;
    selected.push(item.question);
    usedSkeletons.add(item.skeleton);
  });
  candidates.forEach((item) => {
    if (selected.length >= limit) return;
    if (selected.some((question) => question.id === item.question.id)) return;
    selected.push(item.question);
  });
  return selected;
}

function startTopicPractice() {
  const questions = getTopicQuestions();
  if (!questions.length) return;
  if (currentAccount()?.role === "student") {
    const set = buildStudentPracticeSet(questions, 10);
    if (!set.length) return;
    const vi = state.language === "vi";
    const skill = els.topicSkill.value === "All" ? (vi ? "kỹ năng được chọn" : "selected skills") : els.topicSkill.value;
    startPracticeSession({
      mode: vi ? "Set chuyên đề" : "Topic Set",
      questions: set,
      minutes: 0,
      summary: vi ? `${skill}: set ${set.length} câu tập trung.` : `${skill}: focused ${set.length}-question set.`,
    });
    return;
  }

  clearPracticeSessionState();
  els.filterSection.value = els.topicSection.value || "All";
  refreshDynamicFilters();
  els.filterDomain.value = els.topicDomain.value || "All";
  els.filterDifficulty.value = els.topicDifficulty.value || "All";
  els.filterSource.value = els.topicSource.value || "All";
  setSelectValueIfExists(els.filterStatus, defaultPracticeReviewStatus());
  activePracticeSkill = els.topicSkill.value || "All";
  dueMode = false;
  currentIndex = 0;
  selectedAnswer = "";
  switchView("practice");
}

function startScopedPractice(scope = {}) {
  clearPracticeSessionState();
  const studentMode = currentAccount()?.role === "student";
  const target = {
    section: scope.section || "All",
    domain: scope.domain || "All",
    skill: scope.skill || "All",
    difficulty: scope.difficulty || "All",
    source: studentMode ? "All" : scope.source || "All",
  };
  if (target.section === "All" && (target.domain !== "All" || target.skill !== "All")) {
    const targetDomain = normalizeText(target.domain);
    const targetSkill = normalizeText(target.skill);
    const taxonomyMatch = SAT_KNOWLEDGE_TAXONOMY.find(
      (item) =>
        (targetDomain === "all" || normalizeText(item.domain) === targetDomain) &&
        (targetSkill === "all" || normalizeText(item.skill) === targetSkill),
    );
    if (taxonomyMatch?.section) target.section = taxonomyMatch.section;
  }
  if (target.section === "All" && (target.domain !== "All" || target.skill !== "All")) {
    const inferred = visibleQuestionBank().find(
      (question) =>
        (target.domain === "All" || question.domain === target.domain) &&
        (target.skill === "All" || question.skill === target.skill),
    );
    if (inferred?.section) target.section = inferred.section;
  }

  setSelectValueIfExists(els.topicSection, target.section);
  refreshTopicFilters("topicSection");
  setSelectValueIfExists(els.topicDomain, target.domain);
  refreshTopicFilters("topicDomain");
  setSelectValueIfExists(els.topicSkill, target.skill);
  setSelectValueIfExists(els.topicDifficulty, target.difficulty);
  setSelectValueIfExists(els.topicSource, target.source);

  setSelectValueIfExists(els.filterSection, target.section);
  refreshDynamicFilters();
  setSelectValueIfExists(els.filterDomain, target.domain);
  setSelectValueIfExists(els.filterDifficulty, target.difficulty);
  setSelectValueIfExists(els.filterSource, target.source);
  setSelectValueIfExists(els.filterStatus, defaultPracticeReviewStatus());
  activePracticeSkill = target.skill;
  dueMode = false;
  currentIndex = 0;
  selectedAnswer = "";
  if (studentMode) {
    const criteria = {
      section: target.section,
      domain: target.domain,
      difficulty: target.difficulty,
      reviewStatus: defaultPracticeReviewStatus(),
      sourceType: "All",
      skill: target.skill,
    };
    const reviewedPool = SatQuestionQueryEngine.filterQuestions
      ? SatQuestionQueryEngine.filterQuestions(visibleQuestionBank(), criteria, { predicate: isStudyAvailableQuestion })
      : visibleQuestionBank().filter(
          (question) =>
            (criteria.section === "All" || question.section === criteria.section) &&
            (criteria.domain === "All" || question.domain === criteria.domain) &&
            (criteria.difficulty === "All" || question.difficulty === criteria.difficulty) &&
            (criteria.reviewStatus === "All" || question.reviewStatus === criteria.reviewStatus) &&
            (criteria.sourceType === "All" || question.sourceType === criteria.sourceType) &&
            (criteria.skill === "All" || question.skill === criteria.skill) &&
            isStudyAvailableQuestion(question),
        );
    const fallbackPool = reviewedPool.length
      ? reviewedPool
      : visibleQuestionBank().filter(
          (question) =>
            question.reviewStatus !== "rejected" &&
            (target.section === "All" || question.section === target.section) &&
            (target.domain === "All" || question.domain === target.domain) &&
            (target.difficulty === "All" || question.difficulty === target.difficulty) &&
            (target.source === "All" || question.sourceType === target.source) &&
            (target.skill === "All" || question.skill === target.skill) &&
            isStudyAvailableQuestion(question),
        );
    const set = buildStudentPracticeSet(fallbackPool, 10);
    if (set.length) {
      const vi = state.language === "vi";
      const label = target.skill === "All" ? (target.domain === "All" ? (vi ? "set luyện tập" : "practice set") : target.domain) : target.skill;
      startPracticeSession({
        mode: vi ? "Set kỹ năng" : "Skill Set",
        questions: set,
        minutes: 0,
        summary: vi ? `${label}: ${set.length} câu trọng tâm.` : `${label}: focused ${set.length}-question set.`,
      });
      return;
    }
  }
  renderTopics();
  switchView("practice");
}

function setSelectValueIfExists(select, value) {
  if (!select) return;
  const normalizedValue = value || "All";
  const optionValues = [...select.options].map((option) => option.value);
  if (optionValues.includes(normalizedValue)) {
    select.value = normalizedValue;
    return;
  }
  if (normalizedValue !== "All") {
    const option = document.createElement("option");
    option.value = normalizedValue;
    option.textContent = labelFor(normalizedValue);
    select.appendChild(option);
    select.value = normalizedValue;
    return;
  }
  select.value = "All";
}

function getFilteredQuestions() {
  const studentMode = currentAccount()?.role === "student";
  if (Array.isArray(practiceSessionQuestionIds)) {
    const visibleMap = new Map(visibleQuestionBank().map((question) => [question.id, question]));
    return practiceSessionQuestionIds
      .map((id) => visibleMap.get(id))
      .filter((question) => question && (isContentAdmin() ? question.reviewStatus !== "rejected" : question.reviewStatus !== "rejected" && isStudyAvailableQuestion(question)));
  }

  if (dueMode) {
    const dueIds = new Set(getDueQuestionIds());
    return SatQuestionQueryEngine.filterQuestions
      ? SatQuestionQueryEngine.filterQuestions(visibleQuestionBank(), { idSet: dueIds }, { predicate: (q) => q.reviewStatus !== "rejected" && isStudyAvailableQuestion(q) })
      : visibleQuestionBank().filter((q) => dueIds.has(q.id) && q.reviewStatus !== "rejected" && isStudyAvailableQuestion(q));
  }

  const criteria = {
    section: els.filterSection.value || "All",
    domain: els.filterDomain.value || "All",
    difficulty: els.filterDifficulty.value || "All",
    reviewStatus: studentMode ? defaultPracticeReviewStatus() : els.filterStatus.value || "All",
    sourceType: studentMode ? "All" : els.filterSource.value || "All",
    skill: activePracticeSkill || "All",
  };
  let pool = [];
  if (SatQuestionQueryEngine.filterQuestions) {
    pool = SatQuestionQueryEngine.filterQuestions(visibleQuestionBank(), criteria, { predicate: isStudyAvailableQuestion });
  } else {
    pool = visibleQuestionBank().filter(
      (q) =>
        (criteria.section === "All" || q.section === criteria.section) &&
        (criteria.domain === "All" || q.domain === criteria.domain) &&
        (criteria.difficulty === "All" || q.difficulty === criteria.difficulty) &&
        (criteria.reviewStatus === "All" || q.reviewStatus === criteria.reviewStatus) &&
        (criteria.sourceType === "All" || q.sourceType === criteria.sourceType) &&
        (criteria.skill === "All" || q.skill === criteria.skill) &&
        isStudyAvailableQuestion(q),
    );
  }
  return studentMode && activeView === "practice" ? buildStudentPracticeSet(pool, 10) : pool;
}

function startPracticeTimer() {
  stopPracticeTimer();
  updatePracticeTimerDisplay();
  if (!practiceSessionDeadlineAt) return;
  practiceTimerId = window.setInterval(() => {
    const remaining = updatePracticeTimerDisplay();
    if (remaining <= 0) finishPracticeSession("time_expired");
  }, 1000);
}

function stopPracticeTimer() {
  if (!practiceTimerId) return;
  window.clearInterval(practiceTimerId);
  practiceTimerId = null;
}

function updatePracticeTimerDisplay() {
  if (!els.practiceTimer) return 0;
  if (!practiceSessionDeadlineAt) {
    els.practiceTimer.textContent = "No timer";
    els.practiceTimer.classList.remove("urgent");
    return 0;
  }
  const remaining = Math.max(0, Math.ceil((Date.parse(practiceSessionDeadlineAt) - Date.now()) / 1000));
  els.practiceTimer.textContent = formatCountdown(remaining);
  els.practiceTimer.classList.toggle("urgent", remaining <= 60);
  return remaining;
}

function renderPracticeSessionBar() {
  if (!els.practiceModeLabel || !els.practiceSessionSummary || !els.practiceTimer) return;
  const isSession = Array.isArray(practiceSessionQuestionIds);
  els.practiceModeLabel.textContent = practiceSessionMode === "standard" ? "Standard practice" : practiceSessionMode;
  els.practiceSessionSummary.textContent = isSession
    ? `${practiceSessionSummaryText || "Focused practice session."} ${practiceSessionQuestionIds.length} question${practiceSessionQuestionIds.length === 1 ? "" : "s"} loaded.`
    : "Use Sprint for short spaced review, or Exam Drill for timed Bluebook-style practice.";
  els.endPracticeSession.disabled = !isSession;
  els.practiceTimer.classList.toggle("active", Boolean(practiceSessionDeadlineAt));
  updatePracticeTimerDisplay();
}

function finishPracticeSession(reason = "ended") {
  const endedByTime = reason === "time_expired";
  const sessionSnapshot = {
    id: activePracticeSessionId,
    mode: practiceSessionMode,
    startedAt: practiceSessionStartedAt,
    endedAt: new Date().toISOString(),
    deadlineAt: practiceSessionDeadlineAt,
    questionIds: Array.isArray(practiceSessionQuestionIds) ? [...practiceSessionQuestionIds] : [],
    attemptIds: [...practiceSessionAttemptIds],
    reason,
  };
  const completedMode = sessionSnapshot.mode;
  const completedCount = sessionSnapshot.questionIds.length;
  const report = buildPracticeSessionReport(sessionSnapshot);
  if (report) savePracticeSessionReport(report);
  if (report && sessionSnapshot.attemptIds.length) awardPracticeSessionCompletion(report);
  stopPracticeTimer();
  clearPracticeSessionState();
  if (endedByTime) {
    alert(`${completedMode} time is up. The timed session has ended.`);
  }
  renderPractice();
  renderExamReviewReport(report);
  if (els.feedback && completedCount) {
    els.feedback.hidden = false;
    els.feedback.className = "feedback";
    els.feedback.innerHTML = SatViewRenderers.renderPracticeSessionEndedFeedback
      ? SatViewRenderers.renderPracticeSessionEndedFeedback({ mode: completedMode, endedByTime, reason })
      : `<strong>${escapeHtml(completedMode)} ended</strong><p>${endedByTime ? "Time expired." : "Session ended."} Review the Exam Review Report before starting another set.</p>`;
  }
}

function awardPracticeSessionCompletion(report = {}) {
  const mode = String(report.mode || "");
  const delta = { points: 0 };
  if (mode === "5-Minute Sprint") {
    delta.sprintsCompleted = 1;
    delta.points = 8;
  } else if (mode === "Hard Sprint") {
    delta.hardSprintsCompleted = 1;
    delta.points = 10;
  } else if (mode === "Exam Drill") {
    delta.examDrillsCompleted = 1;
    delta.points = 12;
  }
  if (!delta.points) return;
  awardAttendancePoints(delta);
}

function markPracticeQuestionStart(questionId) {
  if (practiceActiveQuestionId === questionId && practiceQuestionStartedAt) return;
  practiceActiveQuestionId = questionId || "";
  practiceQuestionStartedAt = Date.now();
}

function currentPracticeElapsedSeconds() {
  if (!practiceQuestionStartedAt) return 0;
  return Math.max(1, Math.round((Date.now() - practiceQuestionStartedAt) / 1000));
}

function targetSecondsForQuestion(question) {
  return SatPracticeEngine.targetSecondsForQuestion(question);
}

function pacingFlagFor(question, correct, seconds) {
  return SatPracticeEngine.pacingFlagFor(question, correct, seconds);
}

function pacingLabel(flag) {
  return SatPracticeEngine.pacingLabel(flag);
}

function buildPracticeSessionReport(session) {
  if (!session?.questionIds?.length) return null;
  if (SatExamReviewEngine.buildPracticeSessionReport) {
    return SatExamReviewEngine.buildPracticeSessionReport(session, {
      profile: profile(),
      getQuestionById,
      getCorrectAnswerLabel,
      targetSecondsForQuestion,
      pacingLabel,
      buildSkillMastery,
      sessionRowRecommendation,
      buildSessionSkillGroups,
      buildSessionCoachPlan,
      buildMistakeLedger,
      mistakeLedgerLimit: 10,
    });
  }
  const p = profile();
  const attemptMap = new Map((p.attempts || []).filter((attempt) => session.attemptIds.includes(attempt.id)).map((attempt) => [attempt.questionId, attempt]));
  const masteryMap = new Map(buildSkillMastery().map((item) => [item.key, item]));
  const rows = session.questionIds.map((questionId, index) => {
    const question = getQuestionById(questionId);
    const attempt = attemptMap.get(questionId) || null;
    const key = question ? `${question.section}|${question.domain}|${question.skill}` : "";
    const mastery = masteryMap.get(key);
    const status = attempt ? (attempt.correct ? "Correct" : "Wrong") : "Skipped";
    const pacingFlag = attempt?.pacingFlag || (!attempt ? "skipped" : "");
    const errorType = attempt?.errorType || (!attempt ? "skipped" : "");
    return {
      index: index + 1,
      questionId,
      attemptId: attempt?.id || "",
      section: question?.section || "Unknown",
      domain: question?.domain || "Unknown",
      skill: question?.skill || "Unknown",
      difficulty: question?.difficulty || "Unknown",
      correct: Boolean(attempt?.correct),
      attempted: Boolean(attempt),
      status,
      selectedAnswer: attempt?.selectedAnswer || "",
      correctAnswer: getCorrectAnswerLabel(question),
      timeSpentSeconds: Number(attempt?.timeSpentSeconds || 0),
      targetSeconds: question ? targetSecondsForQuestion(question) : 0,
      pacingFlag,
      pacingLabel: pacingLabel(pacingFlag),
      markedForReview: Boolean(attempt?.markedForReview || p.bookmarks.includes(questionId)),
      errorType,
      masteryStage: mastery?.masteryStage || "Collect evidence",
      mastery: mastery?.mastery ?? null,
      recommendation: sessionRowRecommendation({ question, attempt, mastery, errorType, pacingFlag }),
    };
  });
  const attemptedRows = rows.filter((row) => row.attempted);
  const correctRows = attemptedRows.filter((row) => row.correct);
  const avgSeconds = Math.round(averageNumber(attemptedRows.map((row) => row.timeSpentSeconds)));
  const totalSeconds = attemptedRows.reduce((sum, row) => sum + row.timeSpentSeconds, 0);
  const stageCounts = countValues(rows.map((row) => row.masteryStage));
  const issueCounts = {
    wrong: rows.filter((row) => row.attempted && !row.correct).length,
    skipped: rows.filter((row) => !row.attempted).length,
    slowCorrect: rows.filter((row) => row.pacingFlag === "slow_correct" || row.errorType === "slow_correct").length,
    fastWrong: rows.filter((row) => row.pacingFlag === "fast_wrong").length,
    timePressure: rows.filter((row) => row.pacingFlag === "time_pressure" || row.errorType === "time_pressure").length,
    marked: rows.filter((row) => row.markedForReview).length,
  };
  const skillGroups = buildSessionSkillGroups(rows);
  const mistakeLedger = buildMistakeLedger({ sessionAttemptIds: session.attemptIds, limit: 10 });
  const coachPlan = buildSessionCoachPlan({ rows, skillGroups, mistakeLedger, issueCounts });
  return {
    id: session.id || `practice-session-${Date.now()}`,
    mode: session.mode || "Practice Session",
    startedAt: session.startedAt || "",
    endedAt: session.endedAt || new Date().toISOString(),
    deadlineAt: session.deadlineAt || "",
    reason: session.reason || "ended",
    totalQuestions: rows.length,
    attempted: attemptedRows.length,
    correct: correctRows.length,
    accuracy: attemptedRows.length ? Math.round((correctRows.length / attemptedRows.length) * 100) : 0,
    avgSeconds,
    totalSeconds,
    issueCounts,
    stageCounts,
    skillGroups,
    mistakeLedger,
    coachPlan,
    rows,
  };
}

function buildMistakeLedger({ sessionAttemptIds = null, limit = 12 } = {}) {
  if (SatExamReviewEngine.buildMistakeLedger) {
    return SatExamReviewEngine.buildMistakeLedger(
      { profile: profile(), sessionAttemptIds, limit },
      {
        getQuestionById,
        getCorrectAnswerLabel,
        suggestErrorType,
        getKnowledgeReviewLesson,
        hasLaterProofAttempt,
        remediationActionFor,
        taggerLabel,
      },
    );
  }
  const p = profile();
  const sessionSet = Array.isArray(sessionAttemptIds) && sessionAttemptIds.length ? new Set(sessionAttemptIds) : null;
  const rows = (p.attempts || [])
    .filter((attempt) => {
      if (sessionSet && !sessionSet.has(attempt.id)) return false;
      return !attempt.correct || attempt.errorType || attempt.pacingFlag === "slow_correct" || attempt.markedForReview;
    })
    .slice()
    .reverse()
    .map((attempt) => {
      const question = getQuestionById(attempt.questionId);
      const tag = (p.errorTags || []).find((item) => item.attemptId === attempt.id);
      const errorType = attempt.errorType || (!attempt.correct ? suggestErrorType(question, false, { skipped: !attempt.selectedAnswer }) : attempt.pacingFlag || "marked");
      const lesson = question ? getKnowledgeReviewLesson(question) : null;
      const remediated = question ? hasLaterProofAttempt(attempt, question) : false;
      return {
        attemptId: attempt.id,
        questionId: attempt.questionId,
        at: attempt.at,
        section: question?.section || "Unknown",
        domain: question?.domain || "Unknown",
        skill: question?.skill || "Unknown",
        difficulty: question?.difficulty || "Unknown",
        selectedAnswer: attempt.selectedAnswer || "",
        correctAnswer: getCorrectAnswerLabel(question),
        errorType,
        pacingFlag: attempt.pacingFlag || "",
        timeSpentSeconds: Number(attempt.timeSpentSeconds || 0),
        taggedBy: taggerLabel(attempt),
        taggedAt: attempt.taggedAt || tag?.taggedAt || attempt.at,
        tagSource: attempt.tagSource || tag?.source || "",
        note: attempt.errorNote || tag?.note || "",
        lessonTitle: lesson?.title || "Review the underlying concept",
        remediationAction: remediationActionFor(errorType, question),
        dueAt: attempt.dueAt || "",
        remediated,
        status: remediated ? "proof_passed" : attempt.remediation?.status || "open",
      };
    });

  return rows.slice(0, limit);
}

function hasLaterProofAttempt(attempt, question) {
  const attemptTime = Date.parse(attempt.at || "") || 0;
  const key = `${question.section}|${question.domain}|${question.skill}`;
  const skeleton = skeletonId(question);
  return (profile().attempts || []).some((candidate) => {
    if (candidate.id === attempt.id || !candidate.correct || candidate.pacingFlag === "slow_correct") return false;
    if ((Date.parse(candidate.at || "") || 0) <= attemptTime) return false;
    const candidateQuestion = getQuestionById(candidate.questionId);
    if (!candidateQuestion) return false;
    const candidateKey = `${candidateQuestion.section}|${candidateQuestion.domain}|${candidateQuestion.skill}`;
    return candidateKey === key || skeletonId(candidateQuestion) === skeleton;
  });
}

function chooseProofQuestionForAttempt(question, attempt = null) {
  if (!question) return null;
  const attemptedIds = new Set((profile().attempts || []).map((item) => item.questionId));
  if (SatLessonEngine.chooseProofQuestionForAttempt) {
    return SatLessonEngine.chooseProofQuestionForAttempt(question, attempt || {}, visibleQuestionBank(), {
      attemptedIds,
      canonicalKnowledgeFor,
      isStudyAvailableQuestion,
      lessonScopeKey,
      skeletonId,
      sourcePriority,
    });
  }
  return null;
}

function markProofForPriorRemediations(proofQuestion, proofAttempt) {
  if (!proofQuestion || !proofAttempt) return { passed: 0, failed: 0 };
  const p = profile();
  const proofTime = Date.parse(proofAttempt.at || "") || Date.now();
  const proofKey = lessonScopeKey(proofQuestion);
  const proofSkeleton = skeletonId(proofQuestion);
  const explicitTargetId = proofAttempt.remediationAttemptId || "";
  const explicitLessonTaskKey = proofAttempt.remediationLessonTaskKey || "";
  const explicitProof = Boolean(explicitTargetId || explicitLessonTaskKey || /proof/i.test(String(proofAttempt.practiceMode || "")));
  const proofPassed = Boolean(proofAttempt.correct && proofAttempt.pacingFlag !== "slow_correct");
  if (!proofPassed && !explicitProof) return { passed: 0, failed: 0 };
  const nextDue = new Date(proofAttempt.at || Date.now());
  nextDue.setDate(nextDue.getDate() + 1);
  let passed = 0;
  let failed = 0;

  if (explicitLessonTaskKey && p.lessonProgress?.[explicitLessonTaskKey]) {
    p.lessonProgress[explicitLessonTaskKey] = {
      ...p.lessonProgress[explicitLessonTaskKey],
      status: proofPassed ? "proof_passed" : "assigned",
      proofStatus: proofPassed ? "proof_passed" : "proof_failed",
      proofAttemptId: proofAttempt.id,
      proofQuestionId: proofQuestion.id,
      proofPassedAt: proofPassed ? proofAttempt.at : p.lessonProgress[explicitLessonTaskKey].proofPassedAt || "",
      proofFailedAt: proofPassed ? p.lessonProgress[explicitLessonTaskKey].proofFailedAt || "" : proofAttempt.at,
      dueAt: proofPassed ? p.lessonProgress[explicitLessonTaskKey].dueAt : nextDue.toISOString(),
      failAction: proofPassed ? p.lessonProgress[explicitLessonTaskKey].failAction || "" : "Return to the foundation lesson, then do another scaffold drill.",
    };
    if (proofPassed) passed += 1;
    else failed += 1;
  }

  (p.attempts || []).forEach((attempt) => {
    if (attempt.id === proofAttempt.id || !attempt.remediation || attempt.remediation.status === "proof_passed") return;
    if ((Date.parse(attempt.at || "") || 0) >= proofTime) return;
    const question = getQuestionById(attempt.questionId);
    if (!question) return;
    const sameSkill = lessonScopeKey(question) === proofKey;
    const sameSkeleton = skeletonId(question) === proofSkeleton;
    const explicitMatch = explicitTargetId && attempt.id === explicitTargetId;
    if (!explicitMatch && (!proofPassed || (!sameSkill && !sameSkeleton))) return;
    const existingV2 = attempt.remediation.remediationV2 || {};
    const existingProof = existingV2.proof || {};
    attempt.remediation = {
      ...attempt.remediation,
      status: proofPassed ? "proof_passed" : "proof_failed",
      proofAttemptId: proofAttempt.id,
      proofQuestionId: proofQuestion.id,
      proofPassedAt: proofPassed ? proofAttempt.at : attempt.remediation.proofPassedAt || "",
      proofFailedAt: proofPassed ? attempt.remediation.proofFailedAt || "" : proofAttempt.at,
      failedProofAttemptId: proofPassed ? attempt.remediation.failedProofAttemptId || "" : proofAttempt.id,
      failedProofQuestionId: proofPassed ? attempt.remediation.failedProofQuestionId || "" : proofQuestion.id,
      dueAt: proofPassed ? attempt.remediation.dueAt : nextDue.toISOString(),
      failAction: proofPassed
        ? attempt.remediation.failAction
        : attempt.remediation.failAction || {
            route: "deeper_lesson",
            lessonDepth: "foundation",
            action: "Return to the deeper lesson and complete another scaffold drill before retesting.",
          },
      remediationV2: {
        ...existingV2,
        state: proofPassed ? "proof_passed" : "proof_failed",
        proof: {
          ...existingProof,
          questionId: proofQuestion.id,
          status: proofPassed ? "proof_passed" : "proof_failed",
          attemptId: proofAttempt.id,
          completedAt: proofAttempt.at,
        },
      },
    };
    if (proofPassed) passed += 1;
    else failed += 1;
  });
  return { passed, failed };
}

function remediationActionFor(errorType, question) {
  return SatRemediationEngine.remediationActionFor(errorType, question);
}

function buildSessionCoachPlan({ rows = [], skillGroups = [], mistakeLedger = [], issueCounts = {} } = {}) {
  return SatPracticeEngine.buildSessionCoachPlan({ rows, skillGroups, mistakeLedger, issueCounts });
}

function coachSummaryForSession({ wrongRows = [], slowRows = [], skippedRows = [], issueCounts = {} } = {}) {
  return SatPracticeEngine.coachSummaryForSession({ wrongRows, slowRows, skippedRows, issueCounts });
}

function sessionRowRecommendation({ question, attempt, mastery, errorType, pacingFlag }) {
  return SatPracticeEngine.sessionRowRecommendation({
    question,
    attempt,
    mastery,
    errorType,
    pacingFlag,
    helpers: { errorTagLabel, masteryStageExit },
  });
}

function buildSessionSkillGroups(rows) {
  return SatPracticeEngine.buildSessionSkillGroups(rows, { masteryStageExit });
}

function sessionSkillRecommendation(item) {
  return SatPracticeEngine.sessionSkillRecommendation(item, { masteryStageExit });
}

function countValues(values = []) {
  return SatPracticeEngine.countValues(values);
}

function savePracticeSessionReport(report) {
  const p = profile();
  if (!Array.isArray(p.practiceSessionReports)) p.practiceSessionReports = [];
  p.practiceSessionReports = SatExamReviewEngine.trimPracticeReports
    ? SatExamReviewEngine.trimPracticeReports(p.practiceSessionReports, report, 20)
    : [report, ...p.practiceSessionReports].slice(0, 20);
  latestPracticeSessionReport = report;
  saveState();
}

function renderExamReviewReport(report = latestPracticeSessionReport || profile().practiceSessionReports?.[0] || null) {
  if (!els.examReviewReport) return;
  if (!report) {
    els.examReviewReport.innerHTML = "";
    return;
  }
  els.examReviewReport.innerHTML = SatViewRenderers.renderExamReviewReport
    ? SatViewRenderers.renderExamReviewReport(report, { formatDateTime, formatDate, errorTagLabel })
    : "";
}

function renderPractice() {
  if (activeView !== "practice") return;
  const p = profile();
  const studentMode = currentAccount()?.role === "student";
  document.body.classList.toggle("content-admin-active", isContentAdmin());
  if (!Array.isArray(practiceSessionQuestionIds) && !dueMode && studentMode && els.filterStatus?.value === "All") {
    setSelectValueIfExists(els.filterStatus, defaultPracticeReviewStatus());
  }
  filteredQuestions = getFilteredQuestions();
  els.sessionCount.textContent = filteredQuestions.length;
  renderPracticeSessionBar();
  renderPracticeNavigator();
  renderExamReviewReport(Array.isArray(practiceSessionQuestionIds) ? null : latestPracticeSessionReport || p.practiceSessionReports?.[0] || null);

  if (currentIndex >= filteredQuestions.length) currentIndex = 0;
  selectedAnswer = "";
  els.feedback.hidden = true;
  els.feedback.className = "feedback";
  els.nextQuestion.textContent = "Next";
  els.submitAnswer.disabled = practiceSessionExpired;

  const question = filteredQuestions[currentIndex];
  renderStudentPracticeCoach(question);
  if (!question) {
    const emptyView = SatViewRenderers.renderPracticeQuestionView ? SatViewRenderers.renderPracticeQuestionView(null, { labelFor, studentMode }) : {};
    els.questionCounter.textContent = emptyView.counterText || "Question 0 of 0";
    els.questionSkill.textContent = emptyView.skillText || "No question matched";
    els.questionBadges.innerHTML = emptyView.badgesHtml || "";
    els.questionStem.innerHTML = emptyView.stemHtml || '<div class="empty-state">No questions match the current filters.</div>';
    els.questionStem.classList.toggle("split-stem", Boolean(emptyView.splitStem));
    els.answerOptions.innerHTML = "";
    renderAttemptEvidencePanel(null);
    els.questionSource.textContent = studentMode ? "" : emptyView.sourceText || "-";
    els.questionLicense.textContent = studentMode ? "" : emptyView.licenseText || "-";
    els.mistakeNote.value = "";
    renderPublicationControls(null);
    renderQuestionAuditPanel(null);
    renderErrorTagControls(null);
    els.practiceResourceLinks.innerHTML = emptyView.resourceLinksHtml || '<div class="empty-state">Choose a question to see Khan and Bluebook links for this skill.</div>';
    renderPacingAnalytics();
    applyStudentPracticeCopy(null);
    return;
  }

  markPracticeQuestionStart(question.id);
  practiceHelpTelemetryByQuestionId[question.id] = practiceHelpTelemetryByQuestionId[question.id] || normalizePracticeHelpTelemetry({}, { source: "practice_panel" });
  const displayQuestion = roleQuestionForDisplay(question);
  const questionView = SatViewRenderers.renderPracticeQuestionView
    ? SatViewRenderers.renderPracticeQuestionView(displayQuestion, { index: currentIndex, total: filteredQuestions.length, labelFor, studentMode, targetSeconds: targetSecondsForQuestion(question) })
    : {};
  els.questionCounter.textContent = questionView.counterText || `Question ${currentIndex + 1} of ${filteredQuestions.length}`;
  els.questionSkill.textContent = questionView.skillText || `${displayQuestion.domain} - ${displayQuestion.skill}`;
  els.questionBadges.innerHTML = studentMode ? renderStudentPracticeBadges(displayQuestion) : questionView.badgesHtml || [badge(question.difficulty), badge(question.reviewStatus, question.reviewStatus), badge(labelFor(question.sourceType))].join("");
  els.questionStem.innerHTML = questionView.stemHtml || renderQuestionStem(displayQuestion);
  els.questionStem.classList.toggle("split-stem", Boolean(questionView.splitStem));
  els.questionSource.textContent = studentMode ? "" : questionView.sourceText || question.sourceName || labelFor(question.sourceType);
  els.questionLicense.textContent = studentMode ? "" : questionView.licenseText || question.licenseNote || "No license note recorded";
  els.mistakeNote.value = p.notes[question.id] || "";
  renderPublicationControls(question);
  renderQuestionAuditPanel(question);
  const isMarked = p.bookmarks.includes(question.id);
  els.bookmarkQuestion.textContent = isMarked ? "Saved" : "Save";
  els.markReview.textContent = isMarked ? "Marked" : "Mark Review";
  els.markReview.classList.toggle("active", isMarked);
  renderErrorTagControls(question);
  renderPracticeResources(question);
  renderPacingAnalytics();

  renderAnswerInput(displayQuestion, els.answerOptions, "answer", (value) => {
    selectedAnswer = value;
  });
  renderAttemptEvidencePanel(question);
  bindAnswerToolEvents();
  applyStudentPracticeCopy(question);
}

function shouldRequireAttemptEvidence(question = null, meta = {}) {
  if (SatPracticeEngine.shouldRequireAttemptEvidence) return SatPracticeEngine.shouldRequireAttemptEvidence(question, meta);
  if (!question) return false;
  const text = normalizeText(`${question.section || ""} ${question.domain || ""} ${question.skill || ""}`);
  return Boolean(meta.evidenceRequired || meta.remediationAttemptId || meta.remediationLessonTaskKey || question.difficulty === "Hard" || hasAny(text, ["advanced math", "nonlinear", "systems of equations", "quadratic", "command of evidence", "inference", "cross-text", "text structure", "central ideas"]));
}

function renderAttemptEvidencePanel(question = null) {
  if (!els.attemptEvidencePanel) return;
  const studentMode = currentAccount()?.role === "student";
  if (!question || !studentMode) {
    els.attemptEvidencePanel.hidden = true;
    [els.attemptFirstMove, els.attemptStudentWork, els.attemptEvidenceCitation].forEach((input) => { if (input) input.value = ""; });
    els.attemptEvidencePanel.dataset.questionId = "";
    return;
  }
  const vi = state.language === "vi";
  const isMath = question.section === "Math";
  const required = shouldRequireAttemptEvidence(question);
  const details = els.attemptEvidencePanel.querySelector("details");
  const previousQuestionId = els.attemptEvidencePanel.dataset.questionId || "";
  if (previousQuestionId && previousQuestionId !== question.id) {
    [els.attemptFirstMove, els.attemptStudentWork, els.attemptEvidenceCitation].forEach((input) => { if (input) input.value = ""; });
  }
  els.attemptEvidencePanel.hidden = false;
  els.attemptEvidencePanel.dataset.questionId = question.id || "";
  els.attemptEvidencePanel.dataset.required = required ? "true" : "false";
  if (details) details.open = required;
  const copy = SatPracticeEngine.attemptEvidenceCopy
    ? SatPracticeEngine.attemptEvidenceCopy(question, { language: state.language, required })
    : { summary: required ? "Required proof note" : "Quick proof note", hint: "", firstMoveLabel: vi ? "Bước đầu tiên" : "First move", workLabel: isMath ? "Equation / calculation" : "Reasoning", evidenceLabel: isMath ? "Verification / Desmos" : "Text evidence", firstPlaceholder: "", workPlaceholder: "", evidencePlaceholder: "" };
  if (els.attemptEvidenceSummary) els.attemptEvidenceSummary.textContent = copy.summary;
  if (els.attemptEvidenceHint) els.attemptEvidenceHint.textContent = copy.hint;
  if (els.attemptFirstMoveLabel) els.attemptFirstMoveLabel.textContent = copy.firstMoveLabel;
  if (els.attemptStudentWorkLabel) els.attemptStudentWorkLabel.textContent = copy.workLabel;
  if (els.attemptEvidenceCitationLabel) els.attemptEvidenceCitationLabel.textContent = copy.evidenceLabel;
  if (els.attemptFirstMove) els.attemptFirstMove.placeholder = copy.firstPlaceholder;
  if (els.attemptStudentWork) els.attemptStudentWork.placeholder = copy.workPlaceholder;
  if (els.attemptEvidenceCitation) els.attemptEvidenceCitation.placeholder = copy.evidencePlaceholder;
}

function normalizePracticeHelpTelemetry(raw = {}, context = {}) {
  if (SatPracticeEngine.normalizeHelpTelemetry) return SatPracticeEngine.normalizeHelpTelemetry(raw, context);
  const hintCount = Math.max(0, Number(raw.hintCount || 0) || 0);
  const hintUsed = Boolean(raw.hintUsed || hintCount > 0);
  const fullSolutionViewed = Boolean(raw.fullSolutionViewed);
  const helpTiming = raw.helpTiming || context.helpTiming || (hintUsed || fullSolutionViewed ? "pre_submit" : "none");
  return {
    schemaVersion: "attempt_help_telemetry_v1",
    hintUsed,
    hintCount,
    fullSolutionViewed,
    fullSolutionRequested: Boolean(raw.fullSolutionRequested),
    helpTiming,
    independentAttempt: !(helpTiming === "pre_submit" && (hintUsed || fullSolutionViewed)),
    source: raw.source || context.source || "",
    capturedAt: raw.capturedAt || context.capturedAt || "",
    updatedAt: raw.updatedAt || context.updatedAt || "",
  };
}

function practiceHelpTelemetryForQuestion(question = null) {
  const questionId = question?.id || practiceActiveQuestionId || "";
  const current = questionId ? practiceHelpTelemetryByQuestionId[questionId] : null;
  return normalizePracticeHelpTelemetry(current || {}, { source: "practice_panel" });
}

function submissionHelpTelemetryForQuestion(question = null) {
  const current = practiceHelpTelemetryForQuestion(question);
  if (current.fullSolutionViewed && current.helpTiming === "post_submit") {
    return updatePracticeHelpTelemetry(question, {
      ...current,
      helpTiming: "pre_submit",
      source: "prior_solution_exposure",
    });
  }
  return current;
}

function updatePracticeHelpTelemetry(question = null, update = {}) {
  const questionId = question?.id || practiceActiveQuestionId || "";
  if (!questionId) return normalizePracticeHelpTelemetry(update, { source: update.source || "practice_panel" });
  const current = practiceHelpTelemetryForQuestion(question);
  const next = SatPracticeEngine.mergeHelpTelemetry
    ? SatPracticeEngine.mergeHelpTelemetry(current, update)
    : normalizePracticeHelpTelemetry({ ...current, ...update }, { source: update.source || current.source || "practice_panel" });
  practiceHelpTelemetryByQuestionId[questionId] = next;
  return next;
}

function markAttemptHelpTelemetry(attempt = null, update = {}, question = null) {
  if (!attempt?.id) return null;
  const existing = attempt.helpTelemetry || attempt.learningEvidence?.helpTelemetry || {};
  const next = SatPracticeEngine.mergeHelpTelemetry
    ? SatPracticeEngine.mergeHelpTelemetry(existing, update)
    : normalizePracticeHelpTelemetry({ ...existing, ...update }, { source: update.source || "practice_feedback" });
  attempt.helpTelemetry = next;
  attempt.hintUsed = next.hintUsed;
  attempt.hintCount = next.hintCount;
  attempt.fullSolutionViewed = next.fullSolutionViewed;
  attempt.independentAttempt = next.independentAttempt;
  attempt.learningEvidence = {
    ...(attempt.learningEvidence || {}),
    helpTelemetry: next,
    hintUsed: next.hintUsed,
    hintCount: next.hintCount,
    fullSolutionViewed: next.fullSolutionViewed,
  };
  recordLearningEvent(
    "coaching_help_viewed",
    {
      entityType: "attempt",
      attemptId: attempt.id,
      questionId: attempt.questionId || question?.id || "",
      hintUsed: next.hintUsed,
      hintCount: next.hintCount,
      fullSolutionViewed: next.fullSolutionViewed,
      helpTiming: next.helpTiming,
      independentAttempt: next.independentAttempt,
      source: next.source || update.source || "practice_feedback",
    },
    { entityType: "attempt", entityId: attempt.id },
  );
  saveState();
  requestLearningProfileSync("coaching_help_viewed");
  return next;
}

function captureAttemptEvidence(question = null, meta = {}) {
  const required = shouldRequireAttemptEvidence(question, meta);
  const helpTelemetry = submissionHelpTelemetryForQuestion(question);
  return {
    required,
    firstMove: els.attemptFirstMove?.value || "",
    studentWork: els.attemptStudentWork?.value || "",
    evidenceCitation: els.attemptEvidenceCitation?.value || "",
    helpTelemetry,
    hintUsed: helpTelemetry.hintUsed,
    hintCount: helpTelemetry.hintCount,
    fullSolutionViewed: helpTelemetry.fullSolutionViewed,
    remediationAttemptId: meta.remediationAttemptId || "",
    remediationLessonTaskKey: meta.remediationLessonTaskKey || "",
    capturedAt: new Date().toISOString(),
    source: "practice_panel",
  };
}

function renderStudentPracticeCoach(question = null) {
  if (!els.studentPracticeCoach) return;
  if (currentAccount()?.role !== "student") {
    els.studentPracticeCoach.hidden = true;
    els.studentPracticeCoach.innerHTML = "";
    return;
  }
  const total = filteredQuestions.length;
  const current = total ? currentIndex + 1 : 0;
  const isSession = Array.isArray(practiceSessionQuestionIds);
  const answered = isSession
    ? new Set(
        (profile().attempts || [])
      .filter((attempt) => attempt.practiceSessionId === activePracticeSessionId || (practiceSessionAttemptIds || []).includes(attempt.id))
      .map((attempt) => attempt.questionId),
      ).size
    : 0;
  const vi = state.language === "vi";
  const mode = isSession ? practiceSessionMode : dueMode ? (vi ? "Ôn lỗi đến hạn" : "Due review") : vi ? "Set luyện tập" : "Practice set";
  const target = question ? targetSecondsForQuestion(question) : 0;
  const desmosMove = SatStudentExperienceEngine.desmosMoveForQuestion(question, vi);
  const desmosMoveHtml = desmosMove
    ? `
      <div class="student-desmos-move">
        <span>${escapeHtml(desmosMove.label)}</span>
        <strong>${escapeHtml(desmosMove.title)}</strong>
        <p>${escapeHtml(desmosMove.body)}</p>
      </div>
    `
    : "";
  els.studentPracticeCoach.hidden = false;
  els.studentPracticeCoach.innerHTML = `
    <section class="student-practice-coach-inner">
      <div>
        <p class="eyebrow">${vi ? "Coach khi luyện" : "Practice coach"}</p>
        <h3>${escapeHtml(question ? question.skill : (vi ? "Chưa có câu phù hợp" : "No matching question"))}</h3>
        <p>${escapeHtml(question ? (vi ? "Làm một câu thật kỹ: chọn đáp án, kiểm tra, đọc quy tắc/bẫy, rồi ghi lỗi nếu cần." : "Work one item carefully: choose, check, read the rule/trap, then log the mistake if needed.") : (vi ? "Hãy đổi bộ lọc hoặc quay lại Chuyên đề để chọn kỹ năng có câu." : "Change filters or return to Topics to choose a skill with questions."))}</p>
      </div>
      <div class="student-practice-mini-stats">
        <div><strong>${current}/${total || 0}</strong><span>${vi ? "Câu" : "Question"}</span></div>
        <div><strong>${escapeHtml(mode)}</strong><span>${vi ? "Chế độ" : "Mode"}</span></div>
        <div><strong>${target ? `${target}s` : "--"}</strong><span>${vi ? "Mốc thời gian" : "Target time"}</span></div>
        <div><strong>${answered}</strong><span>${vi ? "Đã làm trong set" : "Answered in set"}</span></div>
      </div>
      <div class="student-practice-steps" aria-label="Practice steps">
        <span class="active">1. ${vi ? "Chọn đáp án" : "Choose"}</span>
        <span>2. ${vi ? "Kiểm tra quy tắc" : "Check rule"}</span>
        <span>3. ${vi ? "Ghi lỗi / proof" : "Log mistake / proof"}</span>
      </div>
      ${desmosMoveHtml}
    </section>
  `;
}

function recentWrongAttemptsForSkill(question, limit = 8) {
  if (!question) return [];
  return (profile().attempts || [])
    .filter((attempt) => {
      if (attempt.correct) return false;
      const attemptedQuestion = getQuestionById(attempt.questionId);
      return attemptedQuestion && attemptedQuestion.section === question.section && attemptedQuestion.domain === question.domain && attemptedQuestion.skill === question.skill;
    })
    .slice(-limit);
}

function renderRepeatedSkillMiniLesson(question, attempt = null) {
  if (currentAccount()?.role !== "student" || !question || attempt?.correct) return "";
  const misses = recentWrongAttemptsForSkill(question);
  if (misses.length < 2) return "";
  const vi = state.language === "vi";
  const lesson = getKnowledgeReviewLesson(question);
  return `
    <section class="repeated-skill-mini-lesson">
      <div>
        <p class="eyebrow">${vi ? "Sai lặp cùng kỹ năng" : "Repeated miss"}</p>
        <h3>${escapeHtml(question.skill)}</h3>
        <p>${escapeHtml(vi ? `Bạn đã sai ${misses.length} lần ở kỹ năng này. Dừng thêm câu mới: đọc quy tắc, làm bài dẫn, rồi mới làm câu chứng minh.` : `You have missed this skill ${misses.length} times. Pause fresh volume: review the rule, do scaffold, then proof.`)}</p>
      </div>
      <div class="student-review-steps compact">
        <div><strong>1</strong><span>${vi ? "Quy tắc" : "Rule"}</span><p>${escapeHtml(studentLessonRuleText(lesson, vi))}</p></div>
        <div><strong>2</strong><span>${vi ? "Bước dẫn" : "Scaffold"}</span><p>${escapeHtml(studentLessonStepLines(lesson, vi)[0])}</p></div>
        <div><strong>3</strong><span>${vi ? "Chứng minh" : "Proof"}</span><p>${escapeHtml(studentLessonProofText(lesson, vi))}</p></div>
      </div>
    </section>
  `;
}

function applyStudentPracticeCopy(question = null) {
  if (currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  [
    ["filter-section", vi ? "Phần thi" : "Section"],
    ["filter-domain", vi ? "Nhóm kỹ năng" : "Domain"],
    ["filter-difficulty", vi ? "Độ khó" : "Difficulty"],
    ["filter-status", vi ? "Trạng thái duyệt" : "Review status"],
    ["filter-source", vi ? "Nguồn" : "Source"],
  ].forEach(([id, text]) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = text;
  });
  [els.filterSection, els.filterDomain, els.filterDifficulty, els.filterStatus, els.filterSource].forEach(localizeSelectOptions);
  renderStudentErrorTypeOptions(els.errorTypeSelect);
  const mistakeLabel = document.querySelector('label[for="mistake-note"]');
  if (mistakeLabel) mistakeLabel.textContent = vi ? "Ghi chú lỗi sai" : "Mistake note";
  const errorLabel = document.querySelector('label[for="error-type-select"]');
  if (errorLabel) errorLabel.textContent = vi ? "Loại lỗi" : "Mistake type";
  const errorNoteLabel = document.querySelector('label[for="error-tag-note"]');
  if (errorNoteLabel) errorNoteLabel.textContent = vi ? "Ghi chú nguyên nhân" : "Cause note";
  if (els.mistakeNote) els.mistakeNote.placeholder = vi ? "Ví dụ: đọc thiếu điều kiện, chọn bẫy, tính vội, sai công thức..." : "Example: missed a condition, chose a trap, rushed calculation, wrong formula...";
  if (els.errorTagNote) els.errorTagNote.placeholder = vi ? "Vì sao lỗi này xảy ra, và lần sau cần đổi bước nào?" : "Why did this happen, and what step should change next time?";
  if (!Array.isArray(practiceSessionQuestionIds)) {
    els.practiceModeLabel.textContent = dueMode ? (vi ? "Ôn lỗi đến hạn" : "Due review") : vi ? "Set luyện tập" : "Practice set";
    els.practiceSessionSummary.textContent = dueMode
      ? vi
        ? "Làm các câu đến hạn ôn, đọc Quy tắc/Bẫy, rồi pass câu proof nếu cần."
        : "Work due review items, read Rule/Trap, then pass a proof item if needed."
      : vi
        ? `Set ${filteredQuestions.length || 0} câu trọng tâm. Chọn đáp án, kiểm tra, đọc Quy tắc/Bẫy, rồi ghi lỗi nếu cần.`
        : `Focused ${filteredQuestions.length || 0}-question set. Choose, check, read Rule/Trap, then log the mistake if needed.`;
  } else {
    els.practiceModeLabel.textContent = labelFor(practiceSessionMode);
    els.practiceSessionSummary.textContent = `${practiceSessionSummaryText || (vi ? "Set luyện tập tập trung." : "Focused practice set.")} ${practiceSessionQuestionIds.length} ${vi ? "câu đã nạp" : "questions loaded"}.`;
  }
  if (!practiceSessionDeadlineAt) els.practiceTimer.textContent = vi ? "Không bấm giờ" : "Untimed";
  els.startFiveMinuteSprint.textContent = vi ? "Sprint 5 phút" : "5-minute sprint";
  els.startHardSprint.textContent = vi ? "Sprint câu khó" : "Hard sprint";
  els.startExamMode.textContent = vi ? "Luyện như thi" : "Exam drill";
  els.endPracticeSession.textContent = vi ? "Kết thúc" : "End";
  els.submitAnswer.textContent = vi ? "Kiểm tra" : "Check";
  els.nextQuestion.textContent = vi ? "Câu tiếp" : "Next question";
  els.bookmarkQuestion.textContent = profile().bookmarks.includes(question?.id) ? (vi ? "Đã lưu" : "Saved") : (vi ? "Lưu" : "Save");
  els.markReview.textContent = profile().bookmarks.includes(question?.id) ? (vi ? "Đã đánh dấu" : "Marked") : (vi ? "Đánh dấu ôn" : "Mark review");
  els.highlightSelection.textContent = vi ? "Tô sáng" : "Highlight";
  els.clearHighlights.textContent = vi ? "Xóa tô sáng" : "Clear highlight";
  if (els.saveNote) els.saveNote.textContent = vi ? "Lưu ghi chú" : "Save note";
  if (els.saveErrorTag) els.saveErrorTag.textContent = vi ? "Lưu loại lỗi" : "Save mistake type";
  const side = document.querySelector("#view-practice .side-panel");
  if (side) localizeDynamicUiText(side);
  localizeDynamicUiText(els.studentPracticeCoach);
}

function renderStudentErrorTypeOptions(select) {
  if (!select) return;
  const vi = state.language === "vi";
  const current = select.value || "unknown";
  const options = vi
    ? [
        ["unknown", "Chưa chọn"],
        ["knowledge_gap", "Chưa chắc kiến thức"],
        ["trap_answer", "Dính bẫy đáp án"],
        ["careless", "Sai do vội/cẩu thả"],
        ["time_pressure", "Thiếu thời gian"],
      ]
    : [
        ["unknown", "Not selected"],
        ["knowledge_gap", "Knowledge gap"],
        ["trap_answer", "Trap answer"],
        ["careless", "Rushed/careless"],
        ["time_pressure", "Time pressure"],
      ];
  select.innerHTML = options
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
  select.value = options.some(([value]) => value === current) ? current : "unknown";
}

function renderStudentPracticeBadges(question) {
  const vi = state.language === "vi";
  return [
    badge(question.section),
    badge(question.difficulty),
    targetSecondsForQuestion(question) ? badge(`${vi ? "Mốc" : "Target"} ${targetSecondsForQuestion(question)}s`, "target-time") : "",
    question.section === "Math" ? badge("Desmos", "math-tool") : "",
  ].join("");
}

function renderPracticeNavigator() {
  if (!els.practiceQuestionNav) return;
  if (!Array.isArray(practiceSessionQuestionIds) || !filteredQuestions.length) {
    els.practiceQuestionNav.innerHTML = "";
    return;
  }
  const p = profile();
  const activeAttemptIds = new Set(practiceSessionAttemptIds || []);
  const answeredIds = new Set(
    (p.attempts || [])
      .filter((attempt) => attempt.practiceSessionId === activePracticeSessionId || activeAttemptIds.has(attempt.id))
      .map((attempt) => attempt.questionId),
  );
  const markedIds = new Set(p.bookmarks || []);
  const items = filteredQuestions.map((question, index) => ({
    id: question.id,
    index,
    current: index === currentIndex,
    answered: answeredIds.has(question.id),
    marked: markedIds.has(question.id),
    skipped: false,
  }));
  els.practiceQuestionNav.innerHTML = SatViewRenderers.renderPracticeQuestionNavigator
    ? SatViewRenderers.renderPracticeQuestionNavigator(items)
    : "";
  els.practiceQuestionNav.querySelectorAll(".practice-nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.practiceIndex);
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= filteredQuestions.length) return;
      currentIndex = nextIndex;
      renderPractice();
    });
  });
}

function shouldUseSplitStem(question) {
  return SatViewRenderers.shouldUseSplitStem ? SatViewRenderers.shouldUseSplitStem(question) : question?.section === "Reading and Writing";
}

function splitQuestionPrompt(prompt = "") {
  return SatViewRenderers.splitQuestionPrompt ? SatViewRenderers.splitQuestionPrompt(prompt) : { passage: String(prompt || ""), ask: "" };
}

function renderQuestionStem(question) {
  return SatViewRenderers.renderQuestionStem ? SatViewRenderers.renderQuestionStem(question) : escapeHtml(question.prompt || "");
}

function bindAnswerToolEvents() {
  document.querySelectorAll(".eliminate-choice").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const option = button.closest(".answer-option");
      option?.classList.toggle("eliminated");
    });
  });
}

function highlightPracticeSelection() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !isSelectionInsidePracticeText(selection)) return;
  const range = selection.getRangeAt(0);
  const mark = document.createElement("mark");
  mark.className = "practice-highlight";
  try {
    range.surroundContents(mark);
  } catch (error) {
    const contents = range.extractContents();
    mark.appendChild(contents);
    range.insertNode(mark);
  }
  selection.removeAllRanges();
}

function isSelectionInsidePracticeText(selection) {
  const zones = [els.questionStem, els.answerOptions, els.feedback].filter(Boolean);
  return zones.some((zone) => zone.contains(selection.anchorNode) && zone.contains(selection.focusNode));
}

function clearPracticeHighlights() {
  [els.questionStem, els.answerOptions, els.feedback].filter(Boolean).forEach((zone) => {
    zone.querySelectorAll("mark.practice-highlight").forEach((mark) => {
      mark.replaceWith(document.createTextNode(mark.textContent || ""));
    });
  });
}

function renderPacingAnalytics() {
  if (!els.pacingAnalytics) return;
  els.pacingAnalytics.innerHTML = SatViewRenderers.renderPacingAnalyticsPanel
    ? SatViewRenderers.renderPacingAnalyticsPanel(profile().attempts || [], { getQuestionById, pacingLabel })
    : '<div class="empty-state">Pacing appears after timed practice attempts.</div>';
}

function renderPracticeResources(question) {
  const resources = getExternalResourcesForScope(
    {
      section: question.section,
      domain: question.domain,
      skill: question.skill,
    },
    4,
  );
  const links = profile().externalLinks || {};
  const personalLinks = [
    links.khan
      ? {
          provider: "My Khan",
          title: "Open saved Khan account",
          url: links.khan,
          intent: "resource",
          sourceNote: "User-saved link.",
        }
      : null,
    links.bluebook
      ? {
          provider: "My Bluebook",
          title: "Open saved Bluebook link",
          url: links.bluebook,
          intent: "full-length-test",
          sourceNote: "User-saved link.",
        }
      : null,
  ].filter(Boolean);
  const html = renderExternalResourceAnchors([...personalLinks, ...resources], false);
  els.practiceResourceLinks.innerHTML = html || '<div class="empty-state">No mapped external resources yet for this skill.</div>';
}

function badge(text, className = "") {
  const label = labelFor(text);
  return SatDesignSystem.badge ? SatDesignSystem.badge(label, className) : `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

function renderAnswerInput(question, container, name, onChange) {
  if (!container) return;
  if (isGridInQuestion(question)) {
    container.classList.add("grid-response-list");
    container.innerHTML = SatViewRenderers.renderAnswerInputHtml
      ? SatViewRenderers.renderAnswerInputHtml(question, name, { isGridInQuestion })
      : "";
    const input = container.querySelector(`input[name="${name}"]`);
    input?.addEventListener("input", () => onChange(input.value));
    return;
  }

  container.classList.remove("grid-response-list");
  container.innerHTML = SatViewRenderers.renderAnswerInputHtml
    ? SatViewRenderers.renderAnswerInputHtml(question, name, { isGridInQuestion })
    : "";

  container.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener("change", () => onChange(input.value));
  });
}

function submitAnswer() {
  const question = filteredQuestions[currentIndex];
  const submittedAnswer = selectedAnswer || currentDisplayedAnswer(question);
  if (!question || !submittedAnswer) return;
  selectedAnswer = submittedAnswer;
  if (!practiceQuestionStartedAt) markPracticeQuestionStart(question.id);

  const timeSpentSeconds = currentPracticeElapsedSeconds();
  const correct = isAnswerCorrect(question, submittedAnswer);
  const pacingFlag = pacingFlagFor(question, correct, timeSpentSeconds);
  const proofAttemptMap = practiceSessionContext?.remediationProofByQuestionId || {};
  const proofLessonMap = practiceSessionContext?.remediationLessonByQuestionId || {};
  const remediationAttemptId = proofAttemptMap[question.id] || practiceSessionContext?.remediationAttemptId || "";
  const remediationLessonTaskKey = proofLessonMap[question.id] || practiceSessionContext?.remediationLessonTaskKey || "";
  const helpTelemetry = submissionHelpTelemetryForQuestion(question);
  const attempt = recordAttempt(question, submittedAnswer, correct, false, {
    timeSpentSeconds,
    pacingFlag,
    practiceMode: practiceSessionMode,
    practiceSessionId: activePracticeSessionId,
    remediationAttemptId,
    remediationLessonTaskKey,
    markedForReview: profile().bookmarks.includes(question.id),
    errorType: pacingFlag === "slow_correct" ? "slow_correct" : pacingFlag === "time_pressure" ? "time_pressure" : "",
    helpTelemetry,
    learningEvidence: captureAttemptEvidence(question, { remediationAttemptId, remediationLessonTaskKey }),
  });
  lastPracticeAttemptId = attempt?.id || null;
  if (attempt?.id && activePracticeSessionId) practiceSessionAttemptIds.push(attempt.id);
  revealAnswer(question, correct, attempt);
  renderErrorTagControls(question);
  renderPacingAnalytics();
  renderPracticeNavigator();
  renderMetrics();
  els.submitAnswer.disabled = true;
}

function currentDisplayedAnswer(question, name = "answer", container = document) {
  if (!question) return "";
  const scope = container || document;
  if (isGridInQuestion(question)) {
    return (
      scope.querySelector(`input[name="${name}"]`)?.value?.trim()
      || scope.querySelector(".grid-response-input")?.value?.trim()
      || ""
    );
  }
  return scope.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function recordLearningEvent(type, payload = {}, options = {}) {
  const p = profile();
  if (!p) return null;
  const occurredAt = options.occurredAt || new Date().toISOString();
  const context = {
    accountId: currentAccount()?.id || state.activeAccountId || "",
    occurredAt,
    entityType: options.entityType || payload.entityType || "",
    entityId: options.entityId || payload.entityId || payload.attemptId || payload.pretestId || payload.questionId || "",
    source: options.source || "sat_studio_client",
  };
  const event = SatLearningEventEngine.buildLearningEvent
    ? SatLearningEventEngine.buildLearningEvent(type, payload, context)
    : { id: `learning-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, occurredAt, payload };
  if (SatLearningEventEngine.appendLearningEvent) {
    SatLearningEventEngine.appendLearningEvent(p, event, { limit: 750 });
  } else {
    p.learningEvents = Array.isArray(p.learningEvents) ? p.learningEvents : [];
    p.learningEvents.push(event);
    p.learningEvents = p.learningEvents.slice(-750);
  }
  return event;
}

function recordAttempt(question, answer, correct, fromPretest, meta = {}) {
  const p = profile();
  const account = currentAccount();
  const now = new Date();
  const attempt = SatPracticeEngine.buildAttemptRecord
    ? SatPracticeEngine.buildAttemptRecord(question, answer, correct, fromPretest, meta, { account, now, suggestErrorType })
    : {
        id: meta.id || `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        questionId: question.id,
        selectedAnswer: answer,
        correct,
        fromPretest,
        at: now.toISOString(),
        dueAt: now.toISOString(),
        errorType: meta.errorType || "",
        errorNote: meta.errorNote || "",
        timeSpentSeconds: Number(meta.timeSpentSeconds || 0),
        pacingFlag: meta.pacingFlag || "",
        practiceMode: meta.practiceMode || (fromPretest ? "pretest" : "standard"),
        practiceSessionId: meta.practiceSessionId || "",
        remediationAttemptId: meta.remediationAttemptId || "",
        remediationLessonTaskKey: meta.remediationLessonTaskKey || "",
        markedForReview: Boolean(meta.markedForReview),
      };

  if (attempt.errorType || attempt.pacingFlag === "slow_correct" || !correct) {
    attempt.remediation = buildAttemptRemediation(question, attempt, now);
  }

  p.attempts.push(attempt);
  recordLearningEvent(
    fromPretest ? "pretest_attempt" : "practice_attempt",
    { entityType: "attempt", attemptId: attempt.id, questionId: question.id, section: question.section || "", domain: question.domain || "", skill: question.skill || "", difficulty: question.difficulty || "", correct: Boolean(correct), fromPretest: Boolean(fromPretest), errorType: attempt.errorType || "", pacingFlag: attempt.pacingFlag || "", timeSpentSeconds: Number(attempt.timeSpentSeconds || 0), practiceMode: attempt.practiceMode || "", learningEvidenceStatus: attempt.learningEvidence?.status || "", learningEvidenceRequired: Boolean(attempt.learningEvidence?.required), proofQuality: attempt.learningEvidence?.proofQuality || "", hintUsed: Boolean(attempt.helpTelemetry?.hintUsed), hintCount: Number(attempt.helpTelemetry?.hintCount || 0), fullSolutionViewed: Boolean(attempt.helpTelemetry?.fullSolutionViewed), helpTiming: attempt.helpTelemetry?.helpTiming || "none", independentAttempt: attempt.helpTelemetry?.independentAttempt !== false },
    { occurredAt: attempt.at || new Date().toISOString(), entityType: "attempt", entityId: attempt.id },
  );
  const proofProgress = markProofForPriorRemediations(question, attempt);

  if (attempt.errorType) {
    p.errorTags.unshift({
      id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      attemptId: attempt.id,
      questionId: question.id,
      errorType: attempt.errorType,
      note: attempt.errorNote,
      taggedBy: attempt.taggedBy,
      taggedByRole: attempt.taggedByRole,
      taggedAt: attempt.taggedAt,
      source: attempt.tagSource,
    });
  }

  if (!correct && !p.bookmarks.includes(question.id)) {
    p.bookmarks.push(question.id);
  }

  updateStreak();
  awardAttendancePoints({
    attempts: 1,
    correct: correct ? 1 : 0,
    reviews: !correct ? 1 : 0,
    pretests: fromPretest ? 1 : 0,
    proofsPassed: proofProgress.passed || 0,
    hardCorrect: correct && question?.difficulty === "Hard" ? 1 : 0,
    points: (fromPretest ? 3 : 5) + (correct ? 3 : 1),
  });
  refreshStoredSkillMastery();
  maybeRefreshRoadmapAfterAttempt(fromPretest, attempt);
  saveState();
  requestLearningProfileSync(fromPretest ? "pretest_attempt" : p.roadmapBuildReason?.startsWith("auto_") ? "practice_attempt_roadmap_refresh" : "practice_attempt");
  return attempt;
}

function buildAttemptRemediation(question, attempt, now = new Date()) {
  return SatRemediationEngine.buildAttemptRemediation(question, attempt, {
    chooseProofQuestionForAttempt,
    getCorrectAnswerLabel,
    getKnowledgeReviewLesson,
    lessonScopeKey,
    now,
  });
}

function buildTutorExplanationLayer(question, attempt) {
  if (!SatRemediationEngine.buildTutorExplanationLayer) return null;
  return SatRemediationEngine.buildTutorExplanationLayer(question, attempt, {
    chooseProofQuestionForAttempt,
    getCorrectAnswerLabel,
    getKnowledgeReviewLesson,
    lessonScopeKey,
  });
}

function suggestErrorType(question, correct, context = {}) {
  if (correct) return "";
  if (context.skipped) return "skipped";
  const text = `${question?.section || ""} ${question?.domain || ""} ${question?.skill || ""}`.toLowerCase();
  if (question?.section === "Math") {
    if (hasAny(text, ["percent", "ratio", "rate", "mean", "median", "probability", "data"])) return "careless";
    return "calculation";
  }
  if (hasAny(text, ["words in context", "vocabulary"])) return "vocab";
  if (hasAny(text, ["command", "evidence", "inference", "main idea", "cross-text", "text structure"])) return "evidence";
  if (hasAny(text, ["transition", "boundaries", "punctuation", "standard english"])) return "knowledge_gap";
  if (context.timedOut) return "time_pressure";
  return "trap_answer";
}

function errorTagLabel(value) {
  if (state.language === "vi") return studentUiLabel(value || "unknown");
  return errorTagOptions.find((item) => item.value === value)?.label || labelFor(value || "unknown");
}

function latestAttemptForQuestion(questionId) {
  const attempts = profile().attempts || [];
  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    if (attempts[index].questionId === questionId) return attempts[index];
  }
  return null;
}

function renderErrorTagControls(question) {
  if (!els.errorTypeSelect || !els.errorTagNote || !els.saveErrorTag || !els.errorTagStatus) return;
  const vi = state.language === "vi";
  if (!question) {
    els.errorTypeSelect.value = "unknown";
    els.errorTagNote.value = "";
    els.errorTypeSelect.disabled = true;
    els.errorTagNote.disabled = true;
    els.saveErrorTag.disabled = true;
    els.errorTagStatus.textContent = currentAccount()?.role === "student" ? (vi ? "Làm một câu trước, rồi ghi nguyên nhân nếu sai." : "Answer a question first, then note the cause if it is wrong.") : "Answer a question to tag the latest attempt.";
    return;
  }

  const latest = latestAttemptForQuestion(question.id);
  els.errorTypeSelect.disabled = !latest;
  els.errorTagNote.disabled = !latest;
  els.saveErrorTag.disabled = !latest;
  els.errorTypeSelect.value = latest?.errorType || "unknown";
  els.errorTagNote.value = latest?.errorNote || "";

  if (!latest) {
    els.errorTagStatus.textContent = currentAccount()?.role === "student" ? (vi ? "Chưa có lượt làm. Hãy kiểm tra đáp án trước." : "No attempt yet. Check an answer first.") : "No attempt yet. Check an answer first, then tag the mistake.";
    return;
  }

  if (latest.errorType) {
    els.errorTagStatus.textContent =
      currentAccount()?.role === "student"
        ? `${errorTagLabel(latest.errorType)} - ${vi ? "đã ghi lúc" : "logged at"} ${formatDateTime(latest.taggedAt || latest.at)}`
        : `${errorTagLabel(latest.errorType)} - ${taggerLabel(latest)} - ${formatDateTime(latest.taggedAt || latest.at)}`;
  } else {
    els.errorTagStatus.textContent = currentAccount()?.role === "student" ? (vi ? "Lượt làm mới nhất chưa có nguyên nhân lỗi." : "Latest attempt has no mistake cause yet.") : "Latest attempt has no error tag yet.";
  }
}

function taggerLabel(attempt) {
  if (attempt.taggedBy === "system") return "system suggested";
  const account = state.accounts.find((item) => item.id === attempt.taggedBy);
  if (account) return `${account.name} (${account.role})`;
  return attempt.taggedBy || "not recorded";
}

function saveErrorTagForCurrentQuestion() {
  const question = filteredQuestions[currentIndex];
  if (!question) return;
  const p = profile();
  const latest = (lastPracticeAttemptId && p.attempts.find((attempt) => attempt.id === lastPracticeAttemptId && attempt.questionId === question.id)) || latestAttemptForQuestion(question.id);
  if (!latest) {
    alert("Check an answer first, then tag the attempt.");
    return;
  }

  const account = currentAccount();
  const selected = els.errorTypeSelect.value || "unknown";
  const now = new Date().toISOString();
  latest.errorType = selected === "unknown" ? "" : selected;
  latest.errorNote = els.errorTagNote.value.trim();
  latest.taggedBy = latest.errorType ? account?.id || "unknown" : "";
  latest.taggedByRole = latest.errorType ? account?.role || "unknown" : "";
  latest.taggedAt = latest.errorType ? now : "";
  latest.tagSource = latest.errorType ? (["admin", "parent"].includes(account?.role) ? "parent_admin_review" : "student_self") : "";
  if (latest.errorType) {
    const rebuiltRemediation = buildAttemptRemediation(question, latest, new Date(now));
    latest.remediation = {
      ...rebuiltRemediation,
      ...(latest.remediation || {}),
      status: latest.remediation?.status || "assigned",
      assignedAt: latest.remediation?.assignedAt || now,
      lessonTitle: getKnowledgeReviewLesson(question).title,
      action: remediationActionFor(latest.errorType, question),
      tutorDiagnosis: rebuiltRemediation.tutorDiagnosis,
      remediationV2: rebuiltRemediation.remediationV2,
      tutorExplanationLayer: rebuiltRemediation.tutorExplanationLayer,
      scaffoldDrill: rebuiltRemediation.scaffoldDrill,
      passCondition: rebuiltRemediation.passCondition,
      failAction: rebuiltRemediation.failAction,
      reviewedAt: latest.remediation?.reviewedAt || "",
      proofQuestionId: latest.remediation?.proofQuestionId || chooseProofQuestionForAttempt(question, latest)?.id || "",
    };
  } else {
    latest.remediation = null;
  }

  p.errorTags = (p.errorTags || []).filter((tag) => tag.attemptId !== latest.id);
  if (latest.errorType) {
    p.errorTags.unshift({
      id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      attemptId: latest.id,
      questionId: question.id,
      errorType: latest.errorType,
      note: latest.errorNote,
      taggedBy: latest.taggedBy,
      taggedByRole: latest.taggedByRole,
      taggedAt: latest.taggedAt,
      source: latest.tagSource,
    });
  }

  refreshStoredSkillMastery();
  p.roadmap = buildRoadmapFromAttempts();
  p.roadmapLastBuiltAt = now;
  p.roadmapBuildReason = "manual_error_tag";
  saveState();
  renderErrorTagControls(question);
  renderRoadmap();
  renderDashboard();
  applyDynamicVisualState();
}

function isGridInQuestion(question) {
  return ["student_produced_response", "grid_in", "numeric"].includes(question?.questionType);
}

function getCorrectAnswerLabel(question) {
  if (!question) return "";
  if (isGridInQuestion(question)) {
    return String((question.acceptableAnswers || [question.correctAnswer]).filter(Boolean)[0] || question.correctAnswer || "");
  }
  return String(question.correctAnswer || "");
}

function isAnswerCorrect(question, answer) {
  if (!isGridInQuestion(question)) return String(answer || "") === String(question.correctAnswer || "");
  const accepted = (question.acceptableAnswers || [question.correctAnswer]).filter(Boolean);
  return accepted.some((expected) => answersMatch(answer, expected));
}

function answersMatch(actual, expected) {
  if (SatCore.answersMatch) return SatCore.answersMatch(actual, expected);
  const normalizedActual = normalizeStudentAnswer(actual);
  const normalizedExpected = normalizeStudentAnswer(expected);
  if (!normalizedActual || !normalizedExpected) return false;
  if (normalizedActual === normalizedExpected) return true;

  const actualNumber = parseStudentNumber(normalizedActual);
  const expectedNumber = parseStudentNumber(normalizedExpected);
  if (actualNumber === null || expectedNumber === null) return false;
  return Math.abs(actualNumber - expectedNumber) <= 0.0005;
}

function normalizeStudentAnswer(value) {
  if (SatCore.normalizeStudentAnswer) return SatCore.normalizeStudentAnswer(value);
  return String(value ?? "")
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function parseStudentNumber(value) {
  if (SatCore.parseStudentNumber) return SatCore.parseStudentNumber(value);
  if (/^-?\d+\/-?\d+$/.test(value)) {
    const [top, bottom] = value.split("/").map(Number);
    if (!bottom) return null;
    return top / bottom;
  }
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) return Number(value);
  return null;
}

function updateStreak() {
  const p = profile();
  const today = todayKey();
  if (p.streak.lastPracticeDate === today) return;
  p.streak.count = p.streak.lastPracticeDate ? p.streak.count + 1 : 1;
  p.streak.lastPracticeDate = today;
}

function awardAttendancePoints(delta) {
  const p = profile();
  const attendance = p.attendance || emptyProfile().attendance;
  const today = todayKey();
  const daily = attendance.daily[today] || {
    attempts: 0,
    correct: 0,
    reviews: 0,
    pretests: 0,
    externalMinutes: 0,
    points: 0,
    sprintsCompleted: 0,
    hardSprintsCompleted: 0,
    examDrillsCompleted: 0,
    proofsPassed: 0,
    hardCorrect: 0,
    notesSaved: 0,
    vocabKnown: 0,
  };

  daily.attempts += delta.attempts || 0;
  daily.correct += delta.correct || 0;
  daily.reviews += delta.reviews || 0;
  daily.pretests += delta.pretests || 0;
  daily.externalMinutes += delta.externalMinutes || 0;
  daily.sprintsCompleted += delta.sprintsCompleted || 0;
  daily.hardSprintsCompleted += delta.hardSprintsCompleted || 0;
  daily.examDrillsCompleted += delta.examDrillsCompleted || 0;
  daily.proofsPassed += delta.proofsPassed || 0;
  daily.hardCorrect += delta.hardCorrect || 0;
  daily.notesSaved += delta.notesSaved || 0;
  daily.vocabKnown += delta.vocabKnown || 0;
  const basePoints = Number(delta.points || 0);
  daily.points += basePoints;
  attendance.points = (attendance.points || 0) + basePoints;
  attendance.daily[today] = daily;

  if (SatDashboardEngine.evaluateQuestRewards) {
    const questRewards = SatDashboardEngine.evaluateQuestRewards({ attendance, todayKey: today });
    if (questRewards.bonusPoints) {
      daily.points += questRewards.bonusPoints;
      attendance.points = (attendance.points || 0) + questRewards.bonusPoints;
      attendance.lastRewardAt = new Date().toISOString();
    }
    attendance.questRewardsClaimed = questRewards.questRewardsClaimed;
  } else {
    attendance.questRewardsClaimed = attendance.questRewardsClaimed || [];
  }

  const unlocked = new Set(attendance.stickers || []);
  p.attendance = attendance;
  const rewardModel = SatDashboardEngine.buildRewardModel
    ? SatDashboardEngine.buildRewardModel({ profile: p, rewardCatalog: [...rewardCatalog, ...achievementCatalog], todayKey: today })
    : null;
  (rewardModel?.rewardBoard || rewardCatalog).forEach((reward) => {
    if (reward.unlocked || (reward.requirement && attendance.points >= reward.requirement)) unlocked.add(reward.id);
  });
  attendance.stickers = [...unlocked];
  p.attendance = attendance;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function revealAnswer(question, correct, attempt = null) {
  if (isGridInQuestion(question)) {
    document.querySelectorAll(".grid-response-option").forEach((option) => {
      option.classList.toggle("correct", correct);
      option.classList.toggle("wrong", !correct);
    });
  } else {
    document.querySelectorAll(".answer-option").forEach((option) => {
      const choice = option.dataset.choice;
      option.classList.toggle("correct", choice === question.correctAnswer);
      option.classList.toggle("wrong", choice === selectedAnswer && !correct);
    });
  }

  els.feedback.hidden = false;
  els.feedback.className = "feedback";
  els.feedback.classList.toggle("wrong", !correct);
  const studentMode = currentAccount()?.role === "student";
  const displayQuestion = roleQuestionForDisplay(question);
  const lesson = getKnowledgeReviewLesson(displayQuestion);
  const tutorExplanationLayer = !correct && attempt ? attempt.remediation?.tutorExplanationLayer || buildTutorExplanationLayer(question, attempt) : null;
  const repeatedSkillMiniLessonHtml = !correct ? renderRepeatedSkillMiniLesson(question, attempt) : "";
  const feedbackHtml = SatViewRenderers.renderPracticeFeedback
    ? SatViewRenderers.renderPracticeFeedback(
        displayQuestion,
        {
          attempt,
          correct,
          knowledgeReviewHtml: !correct ? `${repeatedSkillMiniLessonHtml}${renderKnowledgeReview(displayQuestion)}` : "",
          lesson,
          selectedAnswer,
          tutorExplanationLayer,
        },
        {
          getCorrectAnswerLabel,
          isGridInQuestion,
          language: state.language,
          pacingLabel,
          renderExplanation,
          studentMode,
          targetSecondsForQuestion,
        },
      )
    : `
      <strong>${correct ? "Correct" : "Needs review"}</strong>
      ${attempt?.timeSpentSeconds ? `<p>${escapeHtml(pacingLabel(attempt.pacingFlag))}: ${Number(attempt.timeSpentSeconds)}s. Target for this item: about ${targetSecondsForQuestion(question)}s.</p>` : ""}
      ${isGridInQuestion(question) ? `<p>Accepted answer: <strong>${escapeHtml(getCorrectAnswerLabel(question))}</strong></p>` : ""}
      <div class="rich-explanation">${renderExplanation(question.explanation, attempt?.selectedAnswer || selectedAnswer)}</div>
      ${!correct ? renderKnowledgeReview(displayQuestion) : ""}
    `;
  if (attempt?.id) {
    const postSubmitHintCount = Array.isArray(tutorExplanationLayer?.hintSteps) ? tutorExplanationLayer.hintSteps.length : 0;
    markAttemptHelpTelemetry(
      attempt,
      {
        hintUsed: postSubmitHintCount > 0,
        hintCount: postSubmitHintCount,
        fullSolutionViewed: true,
        fullSolutionRequested: false,
        helpTiming: "post_submit",
        source: correct ? "practice_feedback_explanation" : "practice_feedback_coaching",
      },
      question,
    );
  }
  const finalNextLabel = correct ? "Next" : "Review then next";
  if (studentMode) {
    const feedbackQuestionId = question.id;
    els.feedback.innerHTML = renderLearnerAnalysisPanel(correct ? "practice_correct" : "practice_review");
    els.nextQuestion.disabled = true;
    window.setTimeout(() => {
      if (filteredQuestions[currentIndex]?.id !== feedbackQuestionId) return;
      els.feedback.innerHTML = feedbackHtml;
      els.nextQuestion.textContent = finalNextLabel;
      els.nextQuestion.disabled = false;
      bindKnowledgeReviewActions(question);
    }, correct ? 450 : 650);
  } else {
    els.feedback.innerHTML = feedbackHtml;
    els.nextQuestion.textContent = finalNextLabel;
    bindKnowledgeReviewActions(question);
  }
}

function renderKnowledgeReview(question) {
  const lesson = getKnowledgeReviewLesson(question);
  const resources = getExternalResourcesForScope(
    {
      section: question.section,
      domain: question.domain,
      skill: question.skill,
    },
    2,
  );
  if (SatViewRenderers.renderKnowledgeReviewCard) {
    return SatViewRenderers.renderKnowledgeReviewCard(question, lesson, {
      language: state.language,
      resourcesHtml: resources.length ? renderExternalResourceAnchors(resources, true) : "",
    });
  }
  return `
    <section class="knowledge-review-card">
      <div>
        <span class="draft-label">Stop and review</span>
        <h3>${escapeHtml(lesson.title)}</h3>
        <p>${escapeHtml(lesson.rule)}</p>
      </div>
      <div class="knowledge-review-grid">
        ${lesson.steps.map((step) => `<div><strong>${escapeHtml(step[0])}</strong><span>${escapeHtml(step[1])}</span></div>`).join("")}
      </div>
      <div class="knowledge-mini-drill">
        <strong>Quick check before continuing</strong>
        <span>${escapeHtml(lesson.drill)}</span>
      </div>
      ${resources.length ? `<div class="knowledge-resource-strip">${renderExternalResourceAnchors(resources, true)}</div>` : ""}
      <div class="answer-actions">
        <button class="button secondary" id="review-same-skill" type="button">Practice same skill</button>
        <button class="button secondary" id="save-concept-note" type="button">Save concept note</button>
        <button class="button primary" id="acknowledge-knowledge-review" type="button">I reviewed this</button>
      </div>
    </section>
  `;
}

function getKnowledgeReviewLesson(question) {
  const canonical = canonicalKnowledgeFor(question);
  if (canonical?.lesson) {
    return {
      title: `Review: ${canonical.skill}`,
      rule: canonical.lesson.rule,
      steps: canonical.lesson.steps,
      drill: canonical.lesson.drill,
      example: canonical.lesson.example,
      traps: canonical.lesson.traps || [],
    };
  }
  const text = `${question.section} ${question.domain} ${question.skill}`.toLowerCase();
  if (hasAny(text, ["linear equation", "equation", "inequality"])) {
    return {
      title: "Ôn lại: giải phương trình tuyến tính",
      rule: "Mục tiêu là cô lập biến. Làm cùng một phép biến đổi cho cả hai vế, sau đó kiểm tra lại bằng cách thay đáp án vào đề.",
      steps: [
        ["1. Gom hằng số", "Chuyển số không chứa biến sang vế còn lại."],
        ["2. Chia hệ số", "Chia cả hai vế cho hệ số của biến."],
        ["3. Thử lại", "Thay kết quả vào phương trình gốc để bắt lỗi dấu."],
      ],
      drill: "Tự hỏi: nếu thay đáp án mình chọn vào đề, hai vế có thật sự bằng nhau không?",
    };
  }
  if (hasAny(text, ["slope", "linear function"])) {
    return {
      title: "Ôn lại: slope và hàm tuyến tính",
      rule: "Slope là tỉ lệ thay đổi của y theo x: change in y / change in x. Đừng đảo tử mẫu.",
      steps: [
        ["1. Tìm delta y", "Lấy y2 - y1."],
        ["2. Tìm delta x", "Lấy x2 - x1 theo cùng thứ tự."],
        ["3. Rút gọn", "Chia delta y cho delta x."],
      ],
      drill: "Nếu x tăng 1 đơn vị thì y tăng/giảm bao nhiêu?",
    };
  }
  if (hasAny(text, ["percent", "ratio", "rate", "probability", "data"])) {
    return {
      title: "Ôn lại: phần trăm, tỉ lệ và dữ liệu",
      rule: "Luôn xác định mẫu số: câu hỏi đang hỏi phần của tổng nào, thay đổi so với giá trị ban đầu nào, hay xác suất trong không gian mẫu nào.",
      steps: [
        ["1. Gạch chân tổng", "Tìm total/base trước khi tính."],
        ["2. Viết phân số", "Đưa phần cần tìm lên tử, tổng/base xuống mẫu."],
        ["3. Đổi đơn vị", "Chỉ đổi sang % sau khi phân số đúng."],
      ],
      drill: "Mẫu số của phép tính này là gì?",
    };
  }
  if (hasAny(text, ["quadratic", "polynomial", "advanced math"])) {
    return {
      title: "Ôn lại: biểu thức bậc hai",
      rule: "Với phương trình bậc hai, thử factor trước. Nếu không factor được, dùng công thức nghiệm hoặc nhận dạng dạng đồ thị.",
      steps: [
        ["1. Đưa về 0", "Chuyển tất cả hạng tử sang một vế."],
        ["2. Tìm nhân tử", "Tìm hai số có tích bằng c và tổng bằng b."],
        ["3. Chọn nghiệm", "Đọc kỹ đề hỏi nghiệm lớn hơn, nhỏ hơn hay giá trị biểu thức."],
      ],
      drill: "Hai nghiệm khi nhân lại có bằng hằng số c không?",
    };
  }
  if (hasAny(text, ["circle", "triangle", "geometry", "area", "volume", "trigonometry"])) {
    return {
      title: "Ôn lại: hình học SAT",
      rule: "Vẽ lại hình và ghi công thức trước khi tính. Nhiều lỗi đến từ nhầm bán kính/đường kính hoặc cạnh/hypotenuse.",
      steps: [
        ["1. Ghi dữ kiện", "Đánh dấu đơn vị, bán kính, cạnh, góc."],
        ["2. Chọn công thức", "Area, circumference, Pythagorean, hoặc trig ratio."],
        ["3. Kiểm tra đơn vị", "Diện tích là đơn vị vuông, thể tích là đơn vị khối."],
      ],
      drill: "Đề cho bán kính hay đường kính?",
    };
  }
  if (hasAny(text, ["transition", "expression of ideas"])) {
    return {
      title: "Ôn lại: transition",
      rule: "Đọc quan hệ giữa hai câu: cùng ý, trái ý, nguyên nhân-kết quả, hay ví dụ. Chọn transition theo quan hệ đó, không theo cảm giác.",
      steps: [
        ["1. Tóm tắt câu trước", "Viết nhẩm ý chính của câu 1."],
        ["2. Tóm tắt câu sau", "Xem câu sau bổ sung, đối lập hay kết luận."],
        ["3. Chọn quan hệ", "Contrast: however; result: therefore; example: for example."],
      ],
      drill: "Hai câu đang cùng hướng hay đối lập?",
    };
  }
  if (hasAny(text, ["boundaries", "punctuation", "standard english"])) {
    return {
      title: "Ôn lại: sentence boundaries",
      rule: "Xác định mỗi vế có phải mệnh đề độc lập không. Hai mệnh đề độc lập không được nối chỉ bằng dấu phẩy.",
      steps: [
        ["1. Tìm chủ ngữ + động từ", "Kiểm tra từng vế có tự đứng được không."],
        ["2. Chọn dấu nối", "Dùng semicolon, period, hoặc comma + FANBOYS."],
        ["3. Loại comma splice", "Một dấu phẩy đơn không nối được hai câu hoàn chỉnh."],
      ],
      drill: "Hai vế có tự đứng thành hai câu riêng được không?",
    };
  }
  if (hasAny(text, ["words in context", "vocabulary", "craft"])) {
    return {
      title: "Ôn lại: words in context",
      rule: "Không chọn nghĩa quen thuộc nhất của từ. Chọn nghĩa khớp với clue ngay trong câu hoặc đoạn.",
      steps: [
        ["1. Che đáp án", "Tự điền một từ đơn giản theo context."],
        ["2. Tìm clue", "Nhìn các từ giải thích hoặc tương phản gần chỗ trống."],
        ["3. So khớp sắc thái", "Đáp án phải đúng nghĩa và đúng tone."],
      ],
      drill: "Clue nào trong câu chứng minh đáp án?",
    };
  }
  return {
    title: `Ôn lại: ${question.skill}`,
    rule: "Trước khi làm tiếp, hãy xác định vì sao đáp án đúng được chứng minh trực tiếp bởi đề và vì sao lựa chọn của mình sai.",
    steps: [
      ["1. Đọc lại yêu cầu", "Xác định đề hỏi gì, không chỉ chủ đề chung."],
      ["2. Chỉ bằng chứng", "Tìm dòng, dữ kiện, hoặc phép tính chứng minh đáp án đúng."],
      ["3. Ghi lỗi", "Lưu một note ngắn để không lặp lại kiểu sai này."],
    ],
    drill: "Một câu ngắn: mình sai vì nhầm kiến thức, đọc thiếu, hay tính toán?",
  };
}

function bindKnowledgeReviewActions(question) {
  document.querySelectorAll("[data-create-mistake-note]").forEach((button) => {
    button.addEventListener("click", () => createMistakeStudyNoteFromAttempt(question));
  });
  const practiceButton = document.getElementById("review-same-skill");
  if (practiceButton) {
    practiceButton.addEventListener("click", () =>
      startScopedPractice({
        section: question.section,
        domain: question.domain,
        skill: question.skill,
        difficulty: "All",
        source: "All",
      }),
    );
  }
  const noteButton = document.getElementById("save-concept-note");
  if (noteButton) {
    noteButton.addEventListener("click", () => prepareConceptNoteFromQuestion(question));
  }
  const reviewedButton = document.getElementById("acknowledge-knowledge-review");
  if (reviewedButton) {
    reviewedButton.addEventListener("click", () => acknowledgeKnowledgeReview(question));
  }
}

function acknowledgeKnowledgeReview(question) {
  const latest = latestAttemptForQuestion(question.id);
  if (!latest) return;
  latest.remediation = {
    ...(latest.remediation || buildAttemptRemediation(question, latest)),
    status: "reviewed",
    reviewedAt: new Date().toISOString(),
    proofQuestionId: latest.remediation?.proofQuestionId || chooseProofQuestionForAttempt(question, latest)?.id || "",
  };
  saveState();
  renderErrorTagControls(question);
  els.feedback.insertAdjacentHTML("beforeend", '<p class="success-line">Review marked. Now do a transfer question before returning to timed work.</p>');
}

function prepareConceptNoteFromQuestion(question) {
  const lesson = getKnowledgeReviewLesson(question);
  const vi = state.language === "vi";
  switchView("notes");
  els.noteTitle.value = lesson.title;
  els.noteSection.value = question.section === "Math" ? "Math" : "Reading and Writing";
  els.noteDomain.value = question.domain;
  els.noteSkill.value = question.skill;
  els.noteType.value = "concept";
  els.notePriority.value = "high";
  els.noteBody.value = vi
    ? [
        `Quy tắc: ${studentLessonRuleText(lesson, vi)}`,
        "",
        "Các bước:",
        ...studentLessonStepLines(lesson, vi).map((line) => `- ${line}`),
        "",
        `Chứng minh: ${studentLessonProofText(lesson, vi)}`,
      ].join("\n")
    : `${studentLessonRuleText(lesson, vi)}\n\n${studentLessonStepLines(lesson, vi).join("\n")}\n\nQuick check: ${studentLessonProofText(lesson, vi)}`;
  els.noteTags.value = "wrong-answer, concept-review";
  els.noteStarred.checked = true;
}

function answerTextForNote(question, answer) {
  if (!answer) return state.language === "vi" ? "Kh\u00f4ng tr\u1ea3 l\u1eddi" : "No answer";
  if (isGridInQuestion(question)) return String(answer);
  const text = question.choices?.[answer] || "";
  return text ? `${answer}. ${text}` : String(answer);
}

function createMistakeStudyNoteFromAttempt(question) {
  const p = profile();
  const latest = latestAttemptForQuestion(question.id);
  if (!latest) return;
  const existing = (p.studyNotes || []).find((note) => note.sourceAttemptId === latest.id);
  if (existing) {
    switchView("notes");
    notesReviewOnly = false;
    renderStudyNotes();
    window.setTimeout(() => document.querySelector(`[data-note-id="${CSS.escape(existing.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    return;
  }
  const lesson = getKnowledgeReviewLesson(question);
  const now = new Date();
  const due = new Date(now);
  due.setDate(now.getDate() + 2);
  const selected = latest.selectedAnswer || selectedAnswer || "";
  const correct = getCorrectAnswerLabel(question);
  const vi = state.language === "vi";
  const trap = studentLessonTrapText(lesson, vi, false);
  const stepLines = studentLessonStepLines(lesson, vi);
  const body =
    vi
      ? [
          `K\u1ef9 n\u0103ng: ${question.domain} - ${question.skill}`,
          `M\u00ecnh ch\u1ecdn: ${answerTextForNote(question, selected)}`,
          `\u0110\u00e1p \u00e1n \u0111\u00fang: ${answerTextForNote(question, correct)}`,
          `Lo\u1ea1i l\u1ed7i: ${errorTagLabel(latest.errorType || suggestErrorType(question, false, { skipped: !selected }))}`,
          "",
          `Quy t\u1eafc: ${studentLessonRuleText(lesson, vi)}`,
          `B\u1eaby c\u1ea7n tr\u00e1nh: ${trap}`,
          "",
          "C\u00e1ch tr\u00e1nh l\u1ea7n sau:",
          ...stepLines.map((line) => `- ${line}`),
          "",
          `Ch\u1ee9ng minh: ${studentLessonProofText(lesson, vi)}`,
        ].join("\n")
      : [
          `Skill: ${question.domain} - ${question.skill}`,
          `Selected: ${answerTextForNote(question, selected)}`,
          `Correct: ${answerTextForNote(question, correct)}`,
          `Error type: ${errorTagLabel(latest.errorType || suggestErrorType(question, false, { skipped: !selected }))}`,
          "",
          `Rule: ${studentLessonRuleText(lesson, vi)}`,
          `Trap to avoid: ${trap}`,
          "",
          "Next time:",
          ...stepLines.map((line) => `- ${line}`),
          "",
          `Proof: ${studentLessonProofText(lesson, vi)}`,
        ].join("\n");
  const note = {
    id: `note-${latest.id}`,
    sourceAttemptId: latest.id,
    sourceQuestionId: question.id,
    title: `${state.language === "vi" ? "L\u1ed7i" : "Mistake"}: ${question.skill}`,
    section: question.section === "Math" ? "Math" : "Reading and Writing",
    domain: question.domain,
    skill: question.skill,
    type: "mistake",
    priority: "high",
    body,
    tags: ["wrong-answer", slugify(question.domain), slugify(question.skill)].filter(Boolean),
    starred: true,
    reviewCount: 0,
    dueAt: due.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  p.studyNotes = p.studyNotes || [];
  p.studyNotes.unshift(note);
  awardAttendancePoints({ notesSaved: 1, points: 3 });
  saveState();
  renderDashboard();
  if (els.feedback) {
    els.feedback.insertAdjacentHTML(
      "beforeend",
      `<p class="success-line">${state.language === "vi" ? "Đã tạo ghi chú lỗi và đưa vào mục Ghi chú." : "Mistake note created and added to Notes."}</p>`,
    );
  }
}

function createMistakeStudyNoteFromPretest(questionId) {
  const question = getQuestionById(questionId);
  if (!question) return;
  const p = profile();
  const test = (p.pretests || []).find((item) => (item.reviewItems || []).some((review) => review.questionId === questionId && !review.correct));
  const reviewItem = test?.reviewItems?.find((item) => item.questionId === questionId) || null;
  const existing = (p.studyNotes || []).find((note) => note.sourcePretestId === test?.id && note.sourceQuestionId === questionId);
  if (existing) {
    switchView("notes");
    notesReviewOnly = false;
    renderStudyNotes();
    window.setTimeout(() => document.querySelector(`[data-note-id="${CSS.escape(existing.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    return;
  }
  const vi = state.language === "vi";
  const lesson = getKnowledgeReviewLesson(question);
  const selected = reviewItem?.selectedAnswer || "";
  const correct = reviewItem?.correctAnswer || getCorrectAnswerLabel(question);
  const errorType = suggestErrorType(question, false, { skipped: !selected, timedOut: reviewItem?.timedOut });
  const due = new Date();
  due.setDate(due.getDate() + 2);
  const trap = studentLessonTrapText(lesson, vi, false);
  const stepLines = studentLessonStepLines(lesson, vi).slice(0, 3);
  const body = [
    vi ? `Kỹ năng: ${question.domain} - ${question.skill}` : `Skill: ${question.domain} - ${question.skill}`,
    vi ? `Mình chọn: ${answerTextForNote(question, selected)}` : `Selected: ${answerTextForNote(question, selected)}`,
    vi ? `Đáp án đúng: ${answerTextForNote(question, correct)}` : `Correct: ${answerTextForNote(question, correct)}`,
    vi ? `Loại lỗi: ${errorTagLabel(errorType)}` : `Error type: ${errorTagLabel(errorType)}`,
    "",
    vi ? `Quy tắc: ${studentLessonRuleText(lesson, vi)}` : `Rule: ${studentLessonRuleText(lesson, vi)}`,
    vi ? `Bẫy: ${trap}` : `Trap: ${trap}`,
    "",
    vi ? "Cách tránh lần sau:" : "Next time:",
    ...stepLines.map((line) => `- ${line}`),
    "",
    vi ? `Chứng minh: ${studentLessonProofText(lesson, vi)}` : `Proof: ${studentLessonProofText(lesson, vi)}`,
  ].join("\n");
  const now = new Date().toISOString();
  const note = {
    id: `note-pretest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourcePretestId: test?.id || "",
    sourceQuestionId: question.id,
    title: `${vi ? "Lỗi pretest" : "Pretest mistake"}: ${question.skill}`,
    section: question.section === "Math" ? "Math" : "Reading and Writing",
    domain: question.domain,
    skill: question.skill,
    type: "mistake",
    priority: "high",
    body,
    tags: ["pretest", "wrong-answer", slugify(question.domain), slugify(question.skill)].filter(Boolean),
    starred: true,
    reviewCount: 0,
    dueAt: due.toISOString(),
    createdAt: now,
    updatedAt: now,
  };
  p.studyNotes = p.studyNotes || [];
  p.studyNotes.unshift(note);
  awardAttendancePoints({ notesSaved: 1, points: 3 });
  saveState();
  renderPretestResults();
  els.pretestResults?.insertAdjacentHTML(
    "afterbegin",
    `<p class="success-line">${vi ? "Đã tạo ghi chú lỗi từ câu pretest." : "Created a mistake note from this pretest item."}</p>`,
  );
}

function renderPublicationControls(question) {
  if (!els.promotePublic || !els.publicationStatus) return;
  const gate = publicPromotionGate(question);
  if (SatAdminViewRenderers.renderPublicationStatus) {
    const rendered = SatAdminViewRenderers.renderPublicationStatus(question, gate, {
      isContentAdmin: isContentAdmin(),
    });
    els.promotePublic.hidden = rendered.buttonHidden;
    els.promotePublic.disabled = rendered.buttonDisabled;
    els.promotePublic.textContent = rendered.buttonText;
    els.publicationStatus.className = rendered.statusClassName;
    els.publicationStatus.textContent = rendered.statusText;
    return;
  }
  const alreadyPublic = question?.visibility === "public_candidate";
  els.promotePublic.hidden = !isContentAdmin() || !question;
  els.promotePublic.disabled = !gate.ok;
  els.promotePublic.textContent = alreadyPublic ? "Public Candidate" : "Promote to Public Candidate";
  els.publicationStatus.className = `publication-status ${alreadyPublic ? "public" : gate.ok ? "ready" : "blocked"}`;
  els.publicationStatus.textContent = question ? gate.reason : "Choose a question to review publication status.";
}

function publicPromotionGate(question) {
  return SatAuthoringEngine.publicPromotionGate(question, {
    isContentAdmin: isContentAdmin(),
    hasOpenQuestionAudits: hasOpenQuestionAudits(question),
    isDiagnosticReadyQuestion: isDiagnosticReadyQuestion(question),
  });
}

function promoteCurrentQuestionToPublic() {
  const question = filteredQuestions[currentIndex];
  const gate = publicPromotionGate(question);
  if (!gate.ok) {
    alert(gate.reason);
    renderPublicationControls(question);
    return;
  }

  const confirmed = window.confirm(
    "Promote this reviewed question to Public Candidate? Confirm that it does not copy protected wording, the answer is correct, and the explanation is suitable for public learners.",
  );
  if (!confirmed) return;

  const account = currentAccount();
  const governance = SatAuthoringEngine.applyPublicPromotion(question, {
    accountId: account?.id || "unknown",
    nowIso: new Date().toISOString(),
  });

  state.questionReviews[question.id] = "reviewed";
  if (!state.questionGovernance || typeof state.questionGovernance !== "object") state.questionGovernance = {};
  state.questionGovernance[question.id] = governance;

  saveState();
  hydrateFilters();
  render();
}

function questionAuditEntries(question) {
  if (SatQuestionAuditEngine.questionAuditEntries) return SatQuestionAuditEngine.questionAuditEntries(state.questionAudits, question);
  if (!question?.id) return [];
  const rows = state.questionAudits?.[question.id];
  return Array.isArray(rows) ? rows : [];
}

function hasOpenQuestionAudits(question) {
  if (SatQuestionAuditEngine.hasOpenQuestionAudits) return SatQuestionAuditEngine.hasOpenQuestionAudits(state.questionAudits, question);
  return questionAuditEntries(question).some((entry) => entry.status !== "resolved" && entry.status !== "dismissed");
}

function canResolveQuestionAudit() {
  if (SatQuestionAuditEngine.canResolveQuestionAudit) return SatQuestionAuditEngine.canResolveQuestionAudit(currentAccount());
  return currentAccount()?.role === "admin";
}

function renderQuestionAuditPanel(question) {
  if (!els.questionAuditLog || !els.submitAuditReport || !els.auditMarkPass || !els.auditBlockQuestion) return;
  const entries = questionAuditEntries(question);
  const openCount = entries.filter((entry) => entry.status !== "resolved" && entry.status !== "dismissed").length;
  const canReport = Boolean(question && currentAccount());
  const canResolve = Boolean(question && canResolveQuestionAudit());
  els.submitAuditReport.disabled = !canReport;
  els.auditMarkPass.hidden = !isContentAdmin();
  els.auditBlockQuestion.hidden = !isContentAdmin();
  els.auditMarkPass.disabled = !canResolve || !entries.length;
  els.auditBlockQuestion.disabled = !canResolve;

  if (SatAdminViewRenderers.renderQuestionAuditLog) {
    const rendered = SatAdminViewRenderers.renderQuestionAuditLog(question, entries, {
      labelFor,
      formatDateTime,
    });
    els.questionAuditLog.className = rendered.className;
    els.questionAuditLog.innerHTML = rendered.html;
    return;
  }

  if (!question) {
    els.questionAuditLog.className = "question-audit-log empty-state";
    els.questionAuditLog.textContent = "Choose a question to view audit history.";
    return;
  }

  if (!entries.length) {
    els.questionAuditLog.className = "question-audit-log empty-state";
    els.questionAuditLog.textContent = "No audit reports yet. Students can report suspected issues; Content Admin resolves them.";
    return;
  }

  els.questionAuditLog.className = "question-audit-log";
  els.questionAuditLog.innerHTML = `
    <div class="audit-summary">
      <strong>${entries.length} audit report${entries.length === 1 ? "" : "s"}</strong>
      <span>${openCount} open</span>
    </div>
    ${entries
      .slice(0, 5)
      .map(
        (entry) => `
          <article class="audit-entry severity-${escapeHtml(entry.severity || "medium")} status-${escapeHtml(entry.status || "open")}">
            <strong>${escapeHtml(labelFor(entry.issueType || "other"))} · ${escapeHtml(labelFor(entry.severity || "medium"))}</strong>
            <span>${escapeHtml(entry.status || "open")} · ${escapeHtml(entry.reportedByName || entry.reportedBy || "unknown")} · ${escapeHtml(formatDateTime(entry.reportedAt))}</span>
            <p>${escapeHtml(entry.note || "No note supplied.")}</p>
            ${entry.resolution ? `<small>${escapeHtml(entry.resolution)} · ${escapeHtml(formatDateTime(entry.resolvedAt))}</small>` : ""}
          </article>
        `,
      )
      .join("")}
  `;
}

function submitQuestionAuditReport() {
  const question = filteredQuestions[currentIndex];
  if (!question) return;
  const account = currentAccount();
  const issueType = els.questionAuditIssue.value || "other";
  const severity = els.questionAuditSeverity.value || "medium";
  const note = els.questionAuditNote.value.trim();
  if (!note) {
    alert("Add an audit note describing the suspected issue.");
    return;
  }

  const entry = SatQuestionAuditEngine.createAuditEntry
    ? SatQuestionAuditEngine.createAuditEntry(question, account, { issueType, severity, note })
    : {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        questionId: question.id,
        issueType,
        severity,
        note,
        status: "open",
        reportedBy: account?.id || "unknown",
        reportedByName: account?.name || "Unknown",
        reportedByRole: account?.role || "unknown",
        reportedAt: new Date().toISOString(),
      };

  if (!state.questionAudits || typeof state.questionAudits !== "object") state.questionAudits = {};
  if (SatQuestionAuditEngine.applyAuditReport) {
    SatQuestionAuditEngine.applyAuditReport(question, state.questionAudits, entry, account);
  } else {
    if (!Array.isArray(state.questionAudits[question.id])) state.questionAudits[question.id] = [];
    state.questionAudits[question.id].unshift(entry);
    question.auditStatus = "open";
    question.auditUpdatedAt = entry.reportedAt;

    if (["admin", "parent"].includes(account?.role) && (severity === "high" || ["wrong_answer", "source_policy"].includes(issueType))) {
      question.reviewStatus = "needs_review";
      if (question.visibility === "public_candidate") question.visibility = "private_family";
      question.publicationStatus = "audit_issue_open";
    }
  }

  persistQuestionGovernance(question);
  els.questionAuditNote.value = "";
  saveState();
  render();
}

function markCurrentQuestionAuditPass() {
  const question = filteredQuestions[currentIndex];
  if (!question || !canResolveQuestionAudit()) return;
  const entries = questionAuditEntries(question);
  if (SatQuestionAuditEngine.applyAuditPass) {
    SatQuestionAuditEngine.applyAuditPass(question, entries, currentAccount());
  } else {
    const now = new Date().toISOString();
    entries.forEach((entry) => {
      if (entry.status !== "resolved" && entry.status !== "dismissed") {
        entry.status = "resolved";
        entry.resolvedBy = currentAccount()?.id || "content-admin";
        entry.resolvedAt = now;
        entry.resolution = "Audit checked: answer, explanation, source policy, and duplicate risk passed.";
      }
    });
    question.auditStatus = "passed";
    question.auditUpdatedAt = now;
    if (question.reviewStatus === "needs_review") question.reviewStatus = "reviewed";
    if (question.publicationStatus === "audit_issue_open" || question.publicationStatus === "audit_blocked") {
      question.publicationStatus = question.visibility === "public_candidate" ? "public_candidate_reviewed" : "private_audit_passed";
    }
  }
  persistQuestionGovernance(question);
  saveState();
  render();
}

function blockCurrentQuestionFromPublic() {
  const question = filteredQuestions[currentIndex];
  if (!question || !canResolveQuestionAudit()) return;
  const confirmed = window.confirm("Block this question from public use and send it back to needs_review?");
  if (!confirmed) return;
  const account = currentAccount();
  if (!state.questionAudits || typeof state.questionAudits !== "object") state.questionAudits = {};
  if (SatQuestionAuditEngine.createAdminBlockEntry && SatQuestionAuditEngine.applyQuestionAuditBlock) {
    const entry = SatQuestionAuditEngine.createAdminBlockEntry(question, account);
    SatQuestionAuditEngine.applyQuestionAuditBlock(question, state.questionAudits, entry);
  } else {
    const now = new Date().toISOString();
    if (!Array.isArray(state.questionAudits[question.id])) state.questionAudits[question.id] = [];
    state.questionAudits[question.id].unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      questionId: question.id,
      issueType: "admin_block",
      severity: "high",
      note: "Content Admin blocked this question from public use pending correction.",
      status: "open",
      reportedBy: account?.id || "content-admin",
      reportedByName: account?.name || "Content Admin",
      reportedByRole: account?.role || "admin",
      reportedAt: now,
    });
    question.reviewStatus = "needs_review";
    question.visibility = "private_family";
    question.publicationStatus = "audit_blocked";
    question.auditStatus = "blocked";
    question.auditUpdatedAt = now;
  }
  persistQuestionGovernance(question);
  saveState();
  hydrateFilters();
  render();
}

function nextQuestion() {
  if (!filteredQuestions.length) return;
  currentIndex = (currentIndex + 1) % filteredQuestions.length;
  renderPractice();
}

function toggleBookmark() {
  const p = profile();
  const question = filteredQuestions[currentIndex];
  if (!question) return;
  if (p.bookmarks.includes(question.id)) {
    p.bookmarks = p.bookmarks.filter((id) => id !== question.id);
  } else {
    p.bookmarks.push(question.id);
  }
  saveState();
  renderPractice();
  renderMetrics();
}

function saveNote() {
  const p = profile();
  const question = filteredQuestions[currentIndex];
  if (!question) return;
  const note = els.mistakeNote.value.trim();
  if (note) {
    p.notes[question.id] = note;
  } else {
    delete p.notes[question.id];
  }
  saveState();
  renderReview();
  renderDashboard();
}

function saveStudyNote() {
  const p = profile();
  const title = els.noteTitle.value.trim();
  const body = els.noteBody.value.trim();
  if (!title || !body) {
    alert("Add a title and note body first.");
    return;
  }

  const now = new Date();
  const due = new Date(now);
  const priority = els.notePriority.value;
  due.setDate(now.getDate() + (priority === "high" ? 1 : priority === "medium" ? 3 : 7));
  const note = {
    id: editingStudyNoteId || `note-${Date.now()}`,
    title,
    section: els.noteSection.value,
    domain: els.noteDomain.value.trim() || "General",
    skill: els.noteSkill.value.trim() || "General",
    type: els.noteType.value,
    priority,
    body,
    tags: els.noteTags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    starred: els.noteStarred.checked,
    createdAt: editingStudyNoteId ? p.studyNotes.find((item) => item.id === editingStudyNoteId)?.createdAt || now.toISOString() : now.toISOString(),
    updatedAt: now.toISOString(),
    dueAt: due.toISOString(),
    reviewCount: editingStudyNoteId ? p.studyNotes.find((item) => item.id === editingStudyNoteId)?.reviewCount || 0 : 0,
  };

  const isNewNote = !editingStudyNoteId;
  if (editingStudyNoteId) {
    p.studyNotes = p.studyNotes.map((item) => (item.id === editingStudyNoteId ? note : item));
  } else {
    p.studyNotes.unshift(note);
  }
  if (isNewNote) {
    updateStreak();
    awardAttendancePoints({ notesSaved: 1, points: 3 });
  }
  clearStudyNoteForm();
  saveState();
  renderStudyNotes();
  renderDashboard();
}

function clearStudyNoteForm() {
  editingStudyNoteId = null;
  els.noteTitle.value = "";
  els.noteDomain.value = "";
  els.noteSkill.value = "";
  els.noteBody.value = "";
  els.noteTags.value = "";
  els.noteType.value = "concept";
  els.notePriority.value = "medium";
  els.noteStarred.checked = false;
  els.saveStudyNote.textContent = state.language === "vi" && currentAccount()?.role === "student" ? "Lưu ghi chú" : "Save Note";
}

function renderStudyNotes() {
  if (!els.notesList) return;
  const p = profile();
  const notes = p.studyNotes || [];
  const studentMode = currentAccount()?.role === "student";
  const noteLabel = studentMode ? studentUiLabel : labelFor;
  const now = Date.now();
  const isDue = (note) => note.starred || new Date(note.dueAt || note.updatedAt || note.createdAt).getTime() <= now;
  const dueCount = notes.filter(isDue).length;
  els.notesTotal.textContent = notes.length;
  els.notesStarred.textContent = notes.filter((note) => note.starred).length;
  els.notesDue.textContent = dueCount;
  els.notesStartReview.textContent = notesReviewOnly ? "Show All Notes" : "Review Starred";

  const query = (els.notesSearch.value || "").toLowerCase();
  const type = els.notesFilterType.value;
  const priority = els.notesFilterPriority.value;
  const filtered = notes
    .filter((note) => {
      const haystack = [note.title, note.body, note.domain, note.skill, ...(note.tags || [])].join(" ").toLowerCase();
      return (
        (!notesReviewOnly || isDue(note)) &&
        (!query || haystack.includes(query)) &&
        (type === "All" || note.type === type) &&
        (priority === "All" || note.priority === priority)
      );
    })
    .sort((a, b) => Number(isDue(b)) - Number(isDue(a)) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  els.notesList.innerHTML = filtered.length
    ? filtered
        .map((note) => {
          const due = new Date(note.dueAt || note.updatedAt || note.createdAt).getTime() <= now;
          return `
            <article class="note-card priority-${escapeHtml(note.priority)} ${note.starred ? "starred" : ""}">
              <div>
                <p class="eyebrow">${escapeHtml(noteLabel(note.type))} · ${escapeHtml(noteLabel(note.priority))}</p>
                <h3>${escapeHtml(note.title)}</h3>
                <p>${escapeHtml(note.body)}</p>
                <div class="note-meta">
                  <span>${escapeHtml(note.section)}</span>
                  <span>${escapeHtml(note.domain)}</span>
                  <span>${escapeHtml(note.skill)}</span>
                  ${due ? "<span>Due now</span>" : `<span>Next: ${escapeHtml(formatDate(note.dueAt || note.updatedAt || note.createdAt))}</span>`}
                  ${note.starred ? "<span>Starred</span>" : ""}
                  <span>${Number(note.reviewCount || 0)} ${studentMode ? "lượt ôn" : "reviews"}</span>
                </div>
                <div class="note-tags">${(note.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
              </div>
              <div class="note-actions">
                <button class="icon-button note-star-toggle" data-note-id="${escapeHtml(note.id)}" type="button">${studentMode ? (note.starred ? "Bỏ sao" : "Gắn sao") : note.starred ? "Unstar" : "Star"}</button>
                <button class="button secondary note-review" data-note-id="${escapeHtml(note.id)}" type="button">${studentMode ? "Đã ôn" : "Reviewed"}</button>
                <button class="button secondary note-edit" data-note-id="${escapeHtml(note.id)}" type="button">${studentMode ? "Sửa" : "Edit"}</button>
                <button class="button secondary note-delete" data-note-id="${escapeHtml(note.id)}" type="button">${studentMode ? "Xóa" : "Delete"}</button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state">${notesReviewOnly ? "No starred or due notes right now." : "No notes match the current filters."}</div>`;
  renderStudentNotesCoach({ notes, filtered, dueCount, isDue });
  applyStudentNotesCopy();

  document.querySelectorAll(".note-star-toggle").forEach((button) => button.addEventListener("click", () => toggleStudyNoteStar(button.dataset.noteId)));
  document.querySelectorAll(".note-review").forEach((button) => button.addEventListener("click", () => markStudyNoteReviewed(button.dataset.noteId)));
  document.querySelectorAll(".note-edit").forEach((button) => button.addEventListener("click", () => editStudyNote(button.dataset.noteId)));
  document.querySelectorAll(".note-delete").forEach((button) => button.addEventListener("click", () => deleteStudyNote(button.dataset.noteId)));
}

function renderStudentNotesCoach({ notes = [], filtered = [], dueCount = 0, isDue = () => false } = {}) {
  if (!els.studentNotesCoach) return;
  if (currentAccount()?.role !== "student") {
    els.studentNotesCoach.hidden = true;
    els.studentNotesCoach.innerHTML = "";
    return;
  }
  const dueNotes = notes.filter(isDue).slice(0, 3);
  const nextNote = dueNotes[0] || filtered[0] || notes[0] || null;
  els.studentNotesCoach.hidden = false;
  els.studentNotesCoach.innerHTML = `
    <section class="student-notes-coach-inner">
      <div>
        <p class="eyebrow">Sổ ghi nhớ</p>
        <h3>${escapeHtml(nextNote?.title || "Ghi lại lỗi sau mỗi câu khó")}</h3>
        <p>${dueCount ? `${dueCount} ghi chú cần ôn. Đọc lại, tự nói rule trong 20 giây, rồi bấm Đã ôn.` : "Khi sai hoặc đoán lâu, ghi một câu: lỗi gì, bẫy là gì, lần sau làm thế nào."}</p>
      </div>
      <div class="student-note-priority-list">
        ${
          dueNotes.length
            ? dueNotes
                .map(
                  (note) => `
                    <button class="student-note-focus" type="button" data-note-id="${escapeHtml(note.id)}">
                      <strong>${escapeHtml(note.title)}</strong>
                      <span>${escapeHtml(studentUiLabel(note.type))} - ${escapeHtml(studentUiLabel(note.priority))}</span>
                    </button>
                  `,
                )
                .join("")
            : '<span class="student-note-empty">Chưa có ghi chú đến hạn.</span>'
        }
      </div>
    </section>
  `;
  document.querySelectorAll(".student-note-focus").forEach((button) => {
    button.addEventListener("click", () => editStudyNote(button.dataset.noteId));
  });
}

function applyStudentNotesCopy() {
  if (currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  const heading = document.querySelector("#view-notes > .section-heading");
  if (heading) {
    const eyebrow = heading.querySelector(".eyebrow");
    const title = heading.querySelector("h2");
    const copy = heading.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = vi ? "Ghi chú" : "Notes";
    if (title) title.textContent = vi ? "Sổ lỗi và quy tắc cần nhớ" : "Mistakes and rules to remember";
    if (copy) copy.textContent = vi ? "Mỗi ghi chú nên ngắn: quy tắc, bẫy, ví dụ tự viết, và lần sau cần làm gì." : "Keep each note short: rule, trap, your own example, and what to do next.";
  }
  const editor = document.querySelector("#view-notes .note-editor .section-heading");
  if (editor) {
    const eyebrow = editor.querySelector(".eyebrow");
    const title = editor.querySelector("h2");
    if (eyebrow) eyebrow.textContent = vi ? "Ghi nhanh" : "Quick note";
    if (title) title.textContent = vi ? "Thêm ghi chú" : "Add note";
    if (!document.querySelector(".student-note-templates")) {
      editor.insertAdjacentHTML(
        "afterend",
        `
          <div class="student-note-templates" aria-label="${vi ? "Mẫu ghi chú nhanh" : "Quick note templates"}">
            <button class="button secondary" type="button" data-note-template="rule">${vi ? "Quy tắc cần nhớ" : "Rule to remember"}</button>
            <button class="button secondary" type="button" data-note-template="trap">${vi ? "Bẫy tôi vừa dính" : "Trap I fell for"}</button>
            <button class="button secondary" type="button" data-note-template="formula">${vi ? "Công thức" : "Formula"}</button>
            <button class="button secondary" type="button" data-note-template="vocab">${vi ? "Từ vựng" : "Vocabulary"}</button>
          </div>
        `,
      );
    } else {
      const labels = vi
        ? { rule: "Quy tắc cần nhớ", trap: "Bẫy tôi vừa dính", formula: "Công thức", vocab: "Từ vựng" }
        : { rule: "Rule to remember", trap: "Trap I fell for", formula: "Formula", vocab: "Vocabulary" };
      document.querySelectorAll("[data-note-template]").forEach((button) => {
        button.textContent = labels[button.dataset.noteTemplate] || button.textContent;
      });
    }
  }
  const sidebar = document.querySelector("#view-notes .notes-sidebar .section-heading");
  if (sidebar) {
    const eyebrow = sidebar.querySelector(".eyebrow");
    const title = sidebar.querySelector("h2");
    if (eyebrow) eyebrow.textContent = vi ? "Ôn lại" : "Review";
    if (title) title.textContent = vi ? "Ưu tiên hôm nay" : "Today's priority";
  }
  [
    ["note-title", vi ? "Tiêu đề" : "Title"],
    ["note-section", vi ? "Phần thi" : "Section"],
    ["note-domain", vi ? "Nhóm kỹ năng" : "Domain"],
    ["note-skill", vi ? "Kỹ năng" : "Skill"],
    ["note-type", vi ? "Loại ghi chú" : "Note type"],
    ["note-priority", vi ? "Mức ưu tiên" : "Priority"],
    ["note-body", vi ? "Nội dung" : "Note"],
    ["note-tags", vi ? "Tag" : "Tags"],
    ["notes-search", vi ? "Tìm kiếm" : "Search"],
    ["notes-filter-type", vi ? "Loại" : "Type"],
    ["notes-filter-priority", vi ? "Ưu tiên" : "Priority"],
  ].forEach(([id, text]) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = text;
  });
  [els.noteSection, els.noteType, els.notePriority, els.notesFilterType, els.notesFilterPriority].forEach(localizeSelectOptions);
  const starredLabel = document.querySelector("#note-starred")?.closest("label")?.querySelector("span");
  if (starredLabel) starredLabel.textContent = vi ? "Gắn sao để ôn" : "Star for review";
  els.saveStudyNote.textContent = editingStudyNoteId ? (vi ? "Cập nhật ghi chú" : "Update note") : vi ? "Lưu ghi chú" : "Save note";
  els.clearStudyNote.textContent = vi ? "Xóa form" : "Clear form";
  els.notesStartReview.textContent = notesReviewOnly ? (vi ? "Xem tất cả" : "Show all") : vi ? "Ôn ghi chú đến hạn" : "Review due notes";
  document.querySelectorAll("[data-note-template]").forEach((button) => {
    button.onclick = () => applyStudentNoteTemplate(button.dataset.noteTemplate || "rule");
  });
  localizeDynamicUiText(document.querySelector("#view-notes"));
}

function applyStudentNoteTemplate(type = "rule") {
  const vi = state.language === "vi";
  const templates = {
    rule: {
      noteType: "concept",
      title: vi ? "Quy tắc cần nhớ" : "Rule to remember",
      body: vi ? "Quy tắc:\n\nVí dụ tự viết:\n\nBẫy cần tránh:\n\nLần sau tôi sẽ:" : "Rule:\n\nMy own example:\n\nTrap to avoid:\n\nNext time I will:",
      tags: "rule,review",
    },
    trap: {
      noteType: "mistake",
      title: vi ? "Bẫy tôi vừa dính" : "Trap I fell for",
      body: vi ? "Tôi đã chọn/hiểu sai:\n\nVì sao bẫy này hấp dẫn:\n\nDấu hiệu nhận ra bẫy:\n\nCách tránh lần sau:" : "What I chose/misread:\n\nWhy the trap was tempting:\n\nSignal that reveals the trap:\n\nHow I will avoid it next time:",
      tags: "trap,mistake",
    },
    formula: {
      noteType: "formula",
      title: vi ? "Công thức cần nhớ" : "Formula to remember",
      body: vi ? "Công thức:\n\nKhi dùng:\n\nĐơn vị/điều kiện:\n\nVí dụ nhanh:" : "Formula:\n\nWhen to use it:\n\nUnits/conditions:\n\nQuick example:",
      tags: "formula,math",
    },
    vocab: {
      noteType: "vocabulary",
      title: vi ? "Từ vựng cần nhớ" : "Vocabulary to remember",
      body: vi ? "Từ/cụm từ:\n\nNghĩa trong SAT context:\n\nClue trong câu:\n\nVí dụ tự viết:" : "Word/phrase:\n\nMeaning in SAT context:\n\nContext clue:\n\nMy own sentence:",
      tags: "vocabulary,context",
    },
  };
  const template = templates[type] || templates.rule;
  els.noteTitle.value = template.title;
  els.noteType.value = template.noteType;
  els.notePriority.value = type === "trap" ? "high" : "medium";
  els.noteBody.value = template.body;
  els.noteTags.value = template.tags;
  els.noteStarred.checked = true;
  els.noteBody.focus();
}

function toggleStudyNoteStar(noteId) {
  const note = profile().studyNotes.find((item) => item.id === noteId);
  if (!note) return;
  note.starred = !note.starred;
  note.updatedAt = new Date().toISOString();
  saveState();
  renderStudyNotes();
  renderDashboard();
}

function markStudyNoteReviewed(noteId) {
  const note = profile().studyNotes.find((item) => item.id === noteId);
  if (!note) return;
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + (note.priority === "high" ? 2 : note.priority === "medium" ? 5 : 10));
  note.reviewCount = (note.reviewCount || 0) + 1;
  note.dueAt = next.toISOString();
  note.updatedAt = now.toISOString();
  note.starred = false;
  saveState();
  renderStudyNotes();
  renderDashboard();
}

function editStudyNote(noteId) {
  const note = profile().studyNotes.find((item) => item.id === noteId);
  if (!note) return;
  editingStudyNoteId = note.id;
  els.noteTitle.value = note.title;
  els.noteSection.value = note.section;
  els.noteDomain.value = note.domain;
  els.noteSkill.value = note.skill;
  els.noteType.value = note.type;
  els.notePriority.value = note.priority;
  els.noteBody.value = note.body;
  els.noteTags.value = (note.tags || []).join(", ");
  els.noteStarred.checked = Boolean(note.starred);
  els.saveStudyNote.textContent = state.language === "vi" && currentAccount()?.role === "student" ? "Cập nhật ghi chú" : "Update Note";
}

function deleteStudyNote(noteId) {
  const p = profile();
  p.studyNotes = p.studyNotes.filter((note) => note.id !== noteId);
  saveState();
  renderStudyNotes();
  renderDashboard();
}

function startNotesReview() {
  switchView("notes");
  notesReviewOnly = !notesReviewOnly;
  els.notesFilterPriority.value = "All";
  els.notesFilterType.value = "All";
  els.notesSearch.value = "";
  renderStudyNotes();
}

function bindQuickVocabSelection() {
  document.addEventListener("mouseup", () => window.setTimeout(showQuickVocabActionFromSelection, 0));
  document.addEventListener("keyup", (event) => {
    if (["Shift", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      showQuickVocabActionFromSelection();
    }
  });
  document.addEventListener("touchend", () => window.setTimeout(showQuickVocabActionFromSelection, 120));
  document.addEventListener("mousedown", (event) => {
    if (!event.target.closest("#quick-vocab-popover")) hideQuickVocabPopover();
  });
  window.addEventListener("scroll", hideQuickVocabPopover, true);
}

function ensureQuickVocabPopover() {
  let node = document.getElementById("quick-vocab-popover");
  if (node) return node;

  node = document.createElement("div");
  node.id = "quick-vocab-popover";
  node.className = "quick-vocab-popover";
  node.hidden = true;
  node.innerHTML = `
    <span class="quick-vocab-term"></span>
    <button class="quick-vocab-add" type="button">Add to Vocab</button>
  `;
  document.body.appendChild(node);
  node.querySelector(".quick-vocab-add").addEventListener("click", addQuickVocabSelection);
  return node;
}

function showQuickVocabActionFromSelection() {
  const selectionData = getQuickVocabSelection();
  if (!selectionData) {
    hideQuickVocabPopover();
    return;
  }

  quickVocabSelection = selectionData;
  const popover = ensureQuickVocabPopover();
  popover.querySelector(".quick-vocab-term").textContent = selectionData.text;
  popover.hidden = false;
  const top = Math.max(12, selectionData.rect.top + window.scrollY - popover.offsetHeight - 10);
  const left = Math.min(
    window.scrollX + document.documentElement.clientWidth - popover.offsetWidth - 12,
    Math.max(12, selectionData.rect.left + window.scrollX + selectionData.rect.width / 2 - popover.offsetWidth / 2),
  );
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}

function hideQuickVocabPopover() {
  const popover = document.getElementById("quick-vocab-popover");
  if (popover) popover.hidden = true;
}

function getQuickVocabSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const text = normalizeQuickVocabText(selection.toString());
  if (!isValidQuickVocabText(text)) return null;

  const range = selection.getRangeAt(0);
  const container =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
  if (!container || container.closest("input, textarea, select, button, #quick-vocab-popover")) return null;

  const studyContainer = container.closest(
    ".question-panel, #pretest-card, #pretest-results, .pretest-review, .draft-readable-card, .knowledge-review-card",
  );
  if (!studyContainer) return null;

  const rect = range.getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) return null;

  return {
    text,
    range: range.cloneRange(),
    rect,
    contextText: studyContainer.innerText || "",
    question: activeSelectionQuestion(),
  };
}

function normalizeQuickVocabText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/^[\s"'“”‘’.,;:!?()[\]{}]+|[\s"'“”‘’.,;:!?()[\]{}]+$/g, "")
    .trim();
}

function isValidQuickVocabText(text) {
  if (!text || text.length < 2 || text.length > 80) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (text.split(/\s+/).length > 8) return false;
  return true;
}

function activeSelectionQuestion() {
  if (activeView === "practice") return filteredQuestions[currentIndex] || null;
  if (activeView === "pretest") {
    const current = profile().currentPretest;
    const questionId = current?.questionIds?.[current.currentIndex];
    return getQuestionById(questionId);
  }
  return null;
}

function addQuickVocabSelection() {
  if (!currentAccount() || !quickVocabSelection) return;
  const selected = quickVocabSelection;
  const existing = (state.vocab || []).find((entry) => vocabKey(entry) === slugify(selected.text));
  const entry =
    existing ||
    normalizeVocabEntry({
      word: selected.text,
      category: quickVocabCategory(selected.question),
      definitionVi: "Cần bổ sung nghĩa.",
      definitionEn: "Add a definition after review.",
      example: quickVocabExample(selected.contextText, selected.text),
      sourceName: "Quick selection from SAT Studio",
      sourceReference: quickVocabSourceReference(selected.question),
    });

  if (!entry) return;

  if (!existing) upsertVocabEntries([entry]);
  profile().vocabKnown = (profile().vocabKnown || []).filter((id) => id !== entry.id);
  markQuickVocabSelection(selected.range);
  hideQuickVocabPopover();
  window.getSelection()?.removeAllRanges();
  saveState();
  renderVocab();
  renderDashboard();
  showQuickVocabToast(existing ? "Already in Vocab. Set back to Learning." : "Added to Vocab.", entry);
}

function quickVocabCategory(question) {
  if (!question) return "Quick Selection";
  if (/math/i.test(`${question.section} ${question.domain}`)) return "Math Terms From Practice";
  if (/words|vocabulary|craft/i.test(`${question.domain} ${question.skill}`)) return "Words in Context From Practice";
  return `${question.section} Practice Words`;
}

function quickVocabSourceReference(question) {
  if (!question) return "Selected text in SAT Studio";
  return [question.id, question.sourceName || labelFor(question.sourceType), question.sourceReference || question.licenseNote || ""]
    .filter(Boolean)
    .join(" | ");
}

function quickVocabExample(contextText, selectedText) {
  const text = String(contextText || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const index = text.toLowerCase().indexOf(selectedText.toLowerCase());
  if (index < 0) return text.slice(0, 220);
  const start = Math.max(0, index - 90);
  const end = Math.min(text.length, index + selectedText.length + 90);
  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`;
}

function markQuickVocabSelection(range) {
  if (!range || range.collapsed) return;
  try {
    const marker = document.createElement("mark");
    marker.className = "quick-vocab-highlight";
    range.surroundContents(marker);
  } catch {
    // Cross-node selections cannot always be wrapped; the vocab item is still saved.
  }
}

function showQuickVocabToast(message, entry) {
  let toast = document.getElementById("quick-vocab-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "quick-vocab-toast";
    toast.className = "quick-vocab-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div>
      <strong>${escapeHtml(message)}</strong>
      <span>${escapeHtml(entry.word)} - ${escapeHtml(vocabPrimaryMeaning(entry))}</span>
    </div>
    <button type="button">Open Vocab</button>
  `;
  toast.querySelector("button").addEventListener("click", () => {
    switchView("vocab");
    els.vocabSearch.value = entry.word;
    els.vocabHideKnown.checked = false;
    vocabCardIndex = 0;
    vocabCardFlipped = false;
    renderVocab();
    toast.hidden = true;
  });
  toast.hidden = false;
  window.clearTimeout(toast.dataset.timerId);
  toast.dataset.timerId = window.setTimeout(() => {
    toast.hidden = true;
  }, 5200);
}

function renderVocab() {
  if (!els.vocabTotal) return;
  state.vocab = mergeVocabBanks(state.vocab || [], allSeedVocab());

  const p = profile();
  const known = knownVocabSet();
  const knownCount = state.vocab.filter((entry) => known.has(entry.id)).length;
  const attempts = p.vocabQuizAttempts || [];
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const currentCategory = els.vocabCategory.value || "All";
  const categories = unique(state.vocab.map((entry) => entry.category)).sort();
  setOptions(els.vocabCategory, ["All", ...categories], currentCategory);

  els.vocabTotal.textContent = state.vocab.length;
  els.vocabKnown.textContent = knownCount;
  els.vocabLearning.textContent = Math.max(state.vocab.length - knownCount, 0);
  els.vocabAccuracy.textContent = `${accuracy}%`;

  const canEdit = isAccountManager();
  const importPanel = document.querySelector(".vocab-import-panel");
  if (importPanel) {
    importPanel.hidden = currentAccount()?.role === "student";
    importPanel.classList.toggle("locked", !canEdit);
  }
  els.vocabImportResult.innerHTML = canEdit
    ? ""
    : '<span class="muted">Only parent/admin accounts can add or import vocabulary.</span>';

  renderVocabFlashcard();
  renderVocabWordList();
  renderVocabQuiz();
  renderStudentVocabCoach({ knownCount, accuracy });
  applyStudentVocabCopy();
}

function renderStudentVocabCoach({ knownCount = 0, accuracy = 0 } = {}) {
  if (!els.studentVocabCoach) return;
  if (currentAccount()?.role !== "student") {
    els.studentVocabCoach.hidden = true;
    els.studentVocabCoach.innerHTML = "";
    return;
  }
  const vi = state.language === "vi";
  const pool = filteredVocab({ hideKnown: true });
  const todayTarget = Math.min(10, pool.length);
  const current = currentVocabEntry();
  els.studentVocabCoach.hidden = false;
  els.studentVocabCoach.innerHTML = `
    <section class="student-vocab-coach-inner">
      <div>
        <p class="eyebrow">${vi ? "Từ vựng hôm nay" : "Today's vocab"}</p>
        <h3>${escapeHtml(current?.word || (vi ? "Chọn một set nhỏ" : "Choose a small set"))}</h3>
        <p>${vi ? "Học tối đa 10 từ, tự đoán nghĩa trước khi lật thẻ, rồi quiz các từ chưa thuộc." : "Study up to 10 words, guess before flipping, then quiz the words still in progress."}</p>
      </div>
      <div class="student-vocab-stats">
        <div><strong>${todayTarget}</strong><span>${vi ? "từ hôm nay" : "today"}</span></div>
        <div><strong>${knownCount}</strong><span>${vi ? "đã thuộc" : "known"}</span></div>
        <div><strong>${accuracy}%</strong><span>${vi ? "quiz đúng" : "quiz correct"}</span></div>
      </div>
      <div class="student-vocab-actions">
        <button class="button primary" type="button" data-student-vocab-action="quiz">${vi ? "Quiz từ chưa thuộc" : "Quiz learning words"}</button>
        <button class="button secondary" type="button" data-student-vocab-action="next">${vi ? "Từ tiếp" : "Next word"}</button>
      </div>
    </section>
  `;
  els.studentVocabCoach.querySelector('[data-student-vocab-action="quiz"]')?.addEventListener("click", startVocabQuiz);
  els.studentVocabCoach.querySelector('[data-student-vocab-action="next"]')?.addEventListener("click", () => moveVocabCard(1));
}

function applyStudentVocabCopy() {
  if (currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  const heading = document.querySelector("#view-vocab > .section-heading");
  if (heading) {
    const eyebrow = heading.querySelector(".eyebrow");
    const title = heading.querySelector("h2");
    const copy = heading.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = vi ? "Từ vựng SAT" : "SAT vocabulary";
    if (title) title.textContent = vi ? "Flashcard và quiz ngắn" : "Flashcards and quick quiz";
    if (copy) copy.textContent = vi ? "Từ đã thuộc sẽ không xuất hiện trong quiz. Mỗi ngày chỉ cần xử lý một set nhỏ." : "Known words stay out of the quiz. Work through one small set each day.";
  }
  const importPanel = document.querySelector(".vocab-import-panel");
  if (importPanel) importPanel.hidden = true;
  [
    ["vocab-category", vi ? "Nhóm từ" : "Category"],
    ["vocab-search", vi ? "Tìm từ" : "Search"],
  ].forEach(([id, text]) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = text;
  });
  localizeSelectOptions(els.vocabCategory);
  const hideKnown = document.querySelector("#vocab-hide-known")?.closest("label")?.querySelector("span");
  if (hideKnown) hideKnown.textContent = vi ? "Ẩn từ đã thuộc" : "Hide known words";
  els.vocabStartQuiz.textContent = vi ? "Bắt đầu quiz" : "Start quiz";
  els.vocabNextCard.textContent = vi ? "Từ tiếp" : "Next word";
  els.vocabPrevCard.textContent = vi ? "Từ trước" : "Previous word";
  els.vocabFlipCard.textContent = vi ? "Lật thẻ" : "Flip card";
  els.vocabSubmitQuiz.textContent = vi ? "Kiểm tra" : "Check";
  els.vocabNextQuiz.textContent = vi ? "Quiz tiếp" : "Next quiz";
  localizeDynamicUiText(document.querySelector("#view-vocab"));
}

function knownVocabSet() {
  return new Set(profile().vocabKnown || []);
}

function filteredVocab(options = {}) {
  const hideKnown = options.hideKnown ?? Boolean(els.vocabHideKnown?.checked);
  const known = knownVocabSet();
  const category = els.vocabCategory?.value || "All";
  const query = String(els.vocabSearch?.value || "").trim().toLowerCase();
  return (state.vocab || []).filter((entry) => {
    const haystack = [entry.word, entry.definition, entry.definitionEn, entry.definitionVi, entry.example, entry.partOfSpeech, entry.category, entry.sourceName]
      .join(" ")
      .toLowerCase();
    return (
      (category === "All" || entry.category === category) &&
      (!query || haystack.includes(query)) &&
      (!hideKnown || !known.has(entry.id))
    );
  });
}

function currentVocabPool() {
  return filteredVocab({ hideKnown: Boolean(els.vocabHideKnown?.checked) });
}

function currentVocabEntry() {
  const pool = currentVocabPool();
  if (!pool.length) return null;
  if (vocabCardIndex < 0) vocabCardIndex = pool.length - 1;
  if (vocabCardIndex >= pool.length) vocabCardIndex = 0;
  return pool[vocabCardIndex];
}

function vocabTermLabel(entry) {
  return `${entry.word}${entry.partOfSpeech ? ` - ${entry.partOfSpeech}` : ""}`;
}

function vocabPrimaryMeaning(entry) {
  const vi = entry.definitionVi || "";
  const en = entry.definitionEn || entry.definition || "";
  return state.language === "vi" ? vi || en : en || vi;
}

function vocabSecondaryMeaning(entry) {
  const vi = entry.definitionVi || "";
  const en = entry.definitionEn || entry.definition || "";
  if (state.language === "vi" && vi && en && vi !== en) return en;
  if (state.language !== "vi" && vi && en && vi !== en) return vi;
  return "";
}

function renderVocabFlashcard() {
  const vi = state.language === "vi";
  const entry = currentVocabEntry();
  if (!entry) {
    els.vocabFlashcard.classList.add("empty-state");
    els.vocabFlashcard.innerHTML = vi ? "Kh\u00f4ng c\u00f3 t\u1eeb n\u00e0o kh\u1edbp b\u1ed9 l\u1ecdc hi\u1ec7n t\u1ea1i." : "No vocabulary matches the current filters.";
    els.vocabMarkKnown.disabled = true;
    els.vocabFlipCard.disabled = true;
    els.vocabPrevCard.disabled = true;
    els.vocabNextCard.disabled = true;
    return;
  }

  const known = knownVocabSet().has(entry.id);
  const primaryMeaning = vocabPrimaryMeaning(entry);
  const secondaryMeaning = vocabSecondaryMeaning(entry);
  els.vocabFlashcard.classList.remove("empty-state");
  els.vocabFlashcard.innerHTML = vocabCardFlipped
    ? `
      <div class="vocab-card-face back">
        <p class="eyebrow">${escapeHtml(entry.category)}</p>
        <h3>${escapeHtml(primaryMeaning)}</h3>
        ${secondaryMeaning ? `<p class="vocab-secondary-meaning">${escapeHtml(secondaryMeaning)}</p>` : ""}
        <p>${escapeHtml(entry.example || (vi ? "C\u1ea7n b\u1ed5 sung v\u00ed d\u1ee5 ki\u1ec3u SAT cho th\u1ebb n\u00e0y." : "Add an SAT-style example to make this card stronger."))}</p>
        <span>${known ? (vi ? "\u0110\u00e3 thu\u1ed9c" : "Already know") : (vi ? "\u0110ang h\u1ecdc" : "Still learning")}</span>
      </div>
    `
    : `
      <div class="vocab-card-face front">
        <p class="eyebrow">${escapeHtml(entry.category)}</p>
        <h3>${escapeHtml(vocabTermLabel(entry))}</h3>
        <p>${vi ? "B\u1ea5m L\u1eadt th\u1ebb \u0111\u1ec3 xem ngh\u0129a, v\u00ed d\u1ee5 v\u00e0 tr\u1ea1ng th\u00e1i h\u1ecdc." : "Click Flip to see the meaning, example, and learning status."}</p>
        <span>${known ? (vi ? "\u0110\u00e3 thu\u1ed9c" : "Already know") : (vi ? "\u0110ang h\u1ecdc" : "Learning")}</span>
      </div>
    `;
  els.vocabMarkKnown.disabled = false;
  els.vocabFlipCard.disabled = false;
  els.vocabPrevCard.disabled = false;
  els.vocabNextCard.disabled = false;
  els.vocabMarkKnown.textContent = known ? (vi ? "Chuy\u1ec3n v\u1ec1 \u0111ang h\u1ecdc" : "Set Learning") : (vi ? "\u0110\u00e3 thu\u1ed9c" : "Already know");
}

function renderVocabWordList() {
  const known = knownVocabSet();
  const vi = state.language === "vi";
  const rows = filteredVocab({ hideKnown: Boolean(els.vocabHideKnown?.checked) });
  const query = String(els.vocabSearch?.value || "").trim();
  const studentDefaultMode = currentAccount()?.role === "student" && (els.vocabCategory?.value || "All") === "All" && !query;
  const studentListMode = studentDefaultMode && activeStudentVocabTab === "all" ? "all" : studentDefaultMode ? "today" : "filtered";
  const visibleRows = studentListMode === "today" ? rows.slice(0, 10) : rows.slice(0, 80);
  const hiddenRows = studentListMode === "all" || studentListMode === "filtered" ? rows.slice(80) : [];
  const tabHtml = studentDefaultMode
    ? `
      <div class="subview-tabs vocab-student-tabs" role="tablist" aria-label="${vi ? "Chế độ danh sách từ" : "Vocabulary list mode"}">
        <button class="subview-tab ${studentListMode === "today" ? "active" : ""}" type="button" role="tab" aria-selected="${studentListMode === "today" ? "true" : "false"}" data-student-vocab-tab="today">${vi ? "Hôm nay" : "Today"}</button>
        <button class="subview-tab ${studentListMode === "all" ? "active" : ""}" type="button" role="tab" aria-selected="${studentListMode === "all" ? "true" : "false"}" data-student-vocab-tab="all">${vi ? "Tất cả từ" : "All words"}</button>
      </div>
    `
    : "";
  const bannerHtml = studentDefaultMode
    ? studentListMode === "today"
      ? `<div class="vocab-daily-banner"><strong>${vi ? "10 từ hôm nay" : "10 words today"}</strong><span>${vi ? "Học set nhỏ trước; chuyển sang Tất cả từ khi cần tra cứu." : "Start with a small set; switch to All words only when you need lookup."}</span></div>`
      : `<div class="vocab-daily-banner"><strong>${vi ? "Tất cả từ" : "All words"}</strong><span>${vi ? "Dùng để tra cứu. Khi học hằng ngày, quay lại tab Hôm nay để tránh quá tải." : "Use this for lookup. For daily study, return to Today to avoid overload."}</span></div>`
    : "";
  els.vocabWordList.innerHTML = rows.length
    ? `
      ${tabHtml}
      ${bannerHtml}
      ${visibleRows.map((entry) => renderVocabWordCard(entry, known)).join("")}
      ${
        hiddenRows.length
          ? `<details class="vocab-all-words"><summary>${vi ? `Xem thêm ${hiddenRows.length} từ khác` : `Show ${hiddenRows.length} more words`}</summary>${hiddenRows
              .map((entry) => renderVocabWordCard(entry, known))
              .join("")}</details>`
          : ""
      }
    `
    : `<div class="empty-state">${state.language === "vi" ? "Kh\u00f4ng c\u00f3 t\u1eeb n\u00e0o kh\u1edbp b\u1ed9 l\u1ecdc. H\u00e3y x\u00f3a t\u00ecm ki\u1ebfm, hi\u1ec7n t\u1eeb \u0111\u00e3 thu\u1ed9c, ho\u1eb7c th\u00eam t\u1eeb m\u1edbi." : "No words match the current filters. Clear search, show known words, or import more vocab."}</div>`;

  document.querySelectorAll(".vocab-known-toggle").forEach((input) => {
    input.addEventListener("change", () => setVocabKnown(input.dataset.vocabId, input.checked));
  });
  document.querySelectorAll("[data-student-vocab-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStudentVocabTab = button.dataset.studentVocabTab === "all" ? "all" : "today";
      renderVocabWordList();
      applyStudentVocabCopy();
    });
  });
}

function renderVocabWordCard(entry, known = knownVocabSet()) {
  const isKnown = known.has(entry.id);
  const vi = state.language === "vi";
  const source = currentAccount()?.role === "student" ? "" : entry.sourceName || entry.sourceReference || "";
  const secondaryMeaning = vocabSecondaryMeaning(entry);
  return `
    <article class="vocab-word-card ${isKnown ? "known" : ""}">
      <div>
        <p class="eyebrow">${escapeHtml(entry.category)}</p>
        <h3>${escapeHtml(vocabTermLabel(entry))}</h3>
        <p>${escapeHtml(vocabPrimaryMeaning(entry))}</p>
        ${secondaryMeaning ? `<small class="vocab-secondary-meaning">${escapeHtml(secondaryMeaning)}</small>` : ""}
        ${entry.example ? `<small>${escapeHtml(entry.example)}</small>` : ""}
        ${source ? `<span class="vocab-source">Source: ${escapeHtml(source)}</span>` : ""}
      </div>
      <label class="checkbox-line compact">
        <input class="vocab-known-toggle" data-vocab-id="${escapeHtml(entry.id)}" type="checkbox" ${isKnown ? "checked" : ""} />
        <span>${vi ? (isKnown ? "\u0110\u00e3 thu\u1ed9c" : "\u0110\u00e1nh d\u1ea5u \u0111\u00e3 thu\u1ed9c") : isKnown ? "Already know" : "Mark known"}</span>
      </label>
    </article>
  `;
}

function renderVocabQuiz() {
  const vi = state.language === "vi";
  if (!vocabQuiz) {
    els.vocabQuizCard.className = "vocab-quiz-card empty-state";
    els.vocabQuizCard.innerHTML = vi ? "B\u1eaft \u0111\u1ea7u quiz \u0111\u1ec3 ki\u1ec3m tra nh\u00f3m t\u1eeb hi\u1ec7n t\u1ea1i." : "Start a quiz to test the current category.";
    els.vocabQuizFeedback.hidden = true;
    els.vocabSubmitQuiz.disabled = true;
    els.vocabNextQuiz.disabled = true;
    return;
  }

  const entry = state.vocab.find((item) => item.id === vocabQuiz.wordId);
  if (!entry) {
    vocabQuiz = null;
    renderVocabQuiz();
    return;
  }

  els.vocabQuizCard.className = "vocab-quiz-card";
  els.vocabQuizCard.innerHTML = `
    <p class="eyebrow">${escapeHtml(entry.category)}</p>
    <h3>${escapeHtml(entry.word)}</h3>
    <p>${vi ? "Ch\u1ecdn \u0111\u1ecbnh ngh\u0129a ph\u00f9 h\u1ee3p nh\u1ea5t." : "Choose the best definition."}</p>
    <div class="vocab-quiz-options">
      ${vocabQuiz.options
        .map((option, index) => {
          const selected = vocabQuiz.selectedIndex === index;
          const correct = vocabQuiz.checked && option.wordId === vocabQuiz.wordId;
          const wrong = vocabQuiz.checked && selected && option.wordId !== vocabQuiz.wordId;
          return `
            <button class="vocab-choice ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" data-choice-index="${index}" type="button" ${
              vocabQuiz.checked ? "disabled" : ""
            }>
              ${escapeHtml(option.definition)}
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  document.querySelectorAll(".vocab-choice").forEach((button) => {
    button.addEventListener("click", () => {
      vocabQuiz.selectedIndex = Number(button.dataset.choiceIndex);
      renderVocabQuiz();
    });
  });

  els.vocabSubmitQuiz.disabled = vocabQuiz.checked;
  els.vocabNextQuiz.disabled = false;

  if (!vocabQuiz.checked) {
    els.vocabQuizFeedback.hidden = true;
    return;
  }

  const selectedOption = vocabQuiz.options[vocabQuiz.selectedIndex];
  const isCorrect = selectedOption?.wordId === vocabQuiz.wordId;
  els.vocabQuizFeedback.hidden = false;
  els.vocabQuizFeedback.classList.toggle("wrong", !isCorrect);
  els.vocabQuizFeedback.innerHTML = `
    <strong>${isCorrect ? (vi ? "\u0110\u00fang" : "Correct") : (vi ? "C\u1ea7n \u00f4n l\u1ea1i" : "Needs review")}</strong>
    <p>${escapeHtml(vocabTermLabel(entry))} = ${escapeHtml(vocabPrimaryMeaning(entry))}</p>
    ${vocabSecondaryMeaning(entry) ? `<p>${escapeHtml(vocabSecondaryMeaning(entry))}</p>` : ""}
    ${entry.example ? `<p>${escapeHtml(entry.example)}</p>` : ""}
    ${
      isCorrect
        ? `<button class="button secondary vocab-known-from-quiz" data-vocab-id="${escapeHtml(entry.id)}" type="button">${vi ? "\u0110\u00e1nh d\u1ea5u \u0111\u00e3 thu\u1ed9c" : "Mark Already know"}</button>`
        : ""
    }
  `;
  document.querySelectorAll(".vocab-known-from-quiz").forEach((button) => {
    button.addEventListener("click", () => setVocabKnown(button.dataset.vocabId, true));
  });
}

function flipVocabCard() {
  if (!currentVocabEntry()) return;
  vocabCardFlipped = !vocabCardFlipped;
  renderVocabFlashcard();
}

function moveVocabCard(delta) {
  const pool = currentVocabPool();
  if (!pool.length) return;
  vocabCardIndex = (vocabCardIndex + delta + pool.length) % pool.length;
  vocabCardFlipped = false;
  renderVocabFlashcard();
}

function markCurrentVocabKnown() {
  const entry = currentVocabEntry();
  if (!entry) return;
  const isKnown = knownVocabSet().has(entry.id);
  setVocabKnown(entry.id, !isKnown);
}

function setVocabKnown(vocabId, known) {
  const p = profile();
  const before = new Set(p.vocabKnown || []);
  if (known) before.add(vocabId);
  else before.delete(vocabId);
  const newlyKnown = known && !(p.vocabKnown || []).includes(vocabId);
  p.vocabKnown = [...before];
  if (newlyKnown) {
    updateStreak();
    awardAttendancePoints({ vocabKnown: 1, points: 2 });
  }
  if (vocabQuiz?.wordId === vocabId && known) vocabQuiz = null;
  saveState();
  renderVocab();
  renderDashboard();
}

function startVocabQuiz() {
  const vi = state.language === "vi";
  const pool = filteredVocab({ hideKnown: false }).filter((entry) => !knownVocabSet().has(entry.id));
  if (!pool.length) {
    vocabQuiz = null;
    els.vocabQuizCard.className = "vocab-quiz-card empty-state";
    els.vocabQuizCard.innerHTML = vi
      ? "Kh\u00f4ng c\u00f3 t\u1eeb ch\u01b0a thu\u1ed9c kh\u1edbp nh\u00f3m/t\u00ecm ki\u1ebfm n\u00e0y. H\u00e3y hi\u1ec7n t\u1eeb \u0111\u00e3 thu\u1ed9c ho\u1eb7c th\u00eam t\u1eeb m\u1edbi."
      : "No unknown words match this category/search. Show known words or import more vocabulary.";
    els.vocabQuizFeedback.hidden = true;
    els.vocabSubmitQuiz.disabled = true;
    els.vocabNextQuiz.disabled = true;
    return;
  }

  const entry = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffleCopy((state.vocab || []).filter((item) => item.id !== entry.id && vocabPrimaryMeaning(item))).slice(0, 3);
  const choices = shuffleCopy([entry, ...distractors].slice(0, 4)).map((item) => ({
    wordId: item.id,
    definition: vocabPrimaryMeaning(item),
  }));
  if (choices.length < 2) {
    vocabQuiz = null;
    els.vocabQuizCard.className = "vocab-quiz-card empty-state";
    els.vocabQuizCard.innerHTML = vi ? "C\u1ea7n \u00edt nh\u1ea5t hai t\u1eeb v\u1ef1ng \u0111\u1ec3 b\u1eaft \u0111\u1ea7u quiz." : "Add at least two vocabulary words before starting a quiz.";
    return;
  }
  vocabQuiz = {
    wordId: entry.id,
    options: choices,
    selectedIndex: null,
    checked: false,
  };
  renderVocabQuiz();
}

function submitVocabQuiz() {
  if (!vocabQuiz || vocabQuiz.selectedIndex === null) return;
  const entry = state.vocab.find((item) => item.id === vocabQuiz.wordId);
  if (!entry) return;
  const selectedOption = vocabQuiz.options[vocabQuiz.selectedIndex];
  const correct = selectedOption?.wordId === entry.id;
  vocabQuiz.checked = true;
  profile().vocabQuizAttempts.unshift({
    id: `vocab-quiz-${Date.now()}`,
    wordId: entry.id,
    category: entry.category,
    selectedWordId: selectedOption?.wordId || "",
    correct,
    at: new Date().toISOString(),
  });
  updateStreak();
  awardAttendancePoints({
    attempts: 1,
    correct: correct ? 1 : 0,
    reviews: correct ? 0 : 1,
    points: correct ? 4 : 2,
  });
  saveState();
  renderVocab();
  renderDashboard();
}

function addVocabWord() {
  if (!isAccountManager()) {
    alert("Only parent or admin accounts can add vocabulary.");
    return;
  }
  const entry = normalizeVocabEntry({
    word: els.vocabAddWord.value,
    category: els.vocabAddCategory.value || "General SAT Words",
    partOfSpeech: els.vocabAddPos.value,
    definition: state.language === "vi" ? "" : els.vocabAddDefinition.value,
    definitionVi: state.language === "vi" ? els.vocabAddDefinition.value : "",
    example: els.vocabAddExample.value,
    sourceName: "Manual Vocab Entry",
  });
  if (!entry) {
    els.vocabImportResult.innerHTML = '<span class="error-line">Add at least a word and definition.</span>';
    return;
  }
  upsertVocabEntries([entry]);
  els.vocabAddWord.value = "";
  els.vocabAddPos.value = "";
  els.vocabAddDefinition.value = "";
  els.vocabAddExample.value = "";
  saveState();
  renderVocab();
  els.vocabImportResult.innerHTML = `<span class="success-line">Added ${escapeHtml(entry.word)}.</span>`;
}

function importVocabJson() {
  if (!isAccountManager()) {
    alert("Only parent or admin accounts can import vocabulary.");
    return;
  }
  try {
    const entries = parseVocabImportText(els.vocabJsonImport.value);
    if (!entries.length) throw new Error("No valid vocab entries found.");
    const imported = upsertVocabEntries(entries);
    els.vocabJsonImport.value = "";
    saveState();
    renderVocab();
    els.vocabImportResult.innerHTML = `<span class="success-line">Imported ${imported} vocab words.</span>`;
  } catch (error) {
    els.vocabImportResult.innerHTML = `<span class="error-line">Invalid vocab JSON: ${escapeHtml(error.message)}</span>`;
  }
}

async function runDuplicateSkeletonScan({ apply = false } = {}) {
  if (!isContentAdmin()) {
    alert("Only Content Admin can run duplicate scans.");
    return;
  }
  els.duplicateScanResult.className = "duplicate-scan-result import-result";
  els.duplicateScanResult.innerHTML = `<strong>${apply ? "Applying" : "Scanning"} duplicate skeleton policy...</strong><span>Loading generated banks and scanning topic by topic.</span>`;
  await Promise.all([
    ensureLocalOpenSatBank(true),
    ensureKaplanAiMathBank(true),
    ensureArchiveAiBank(true),
    ensureSatKingBank(true),
    ensureSat1590Bank(true),
    ensureAntigravityBank(true),
    ensureFoundationBank(true),
  ]);
  const scope = els.duplicateScanScope.value || "generated";
  latestDuplicateScanReport = buildDuplicateSkeletonScan(scope, apply);
  if (apply) {
    resetStudyAvailabilityCaches();
    saveState();
    hydrateFilters();
    render();
  } else {
    renderDuplicateScanStatus();
  }
}

function renderDuplicateScanStatus() {
  if (!els.duplicateScanResult) return;
  if (!isContentAdmin()) {
    els.duplicateScanResult.className = "duplicate-scan-result import-result empty-state";
    els.duplicateScanResult.textContent = "Only Content Admin can run duplicate/skeleton scans.";
    return;
  }
  if (!latestDuplicateScanReport) return;

  const report = latestDuplicateScanReport;
  const topGroups = report.repeatedGroups.slice(0, 10);
  els.duplicateScanResult.className = "duplicate-scan-result import-result";
  els.duplicateScanResult.innerHTML = `
    <strong>${report.applied ? "Policy applied" : "Scan complete"}: ${report.questionCount} questions across ${report.topicCount} topics.</strong>
    <div class="duplicate-summary-grid">
      <div><strong>${report.skeletonCount}</strong><span>skeletons</span></div>
      <div><strong>${report.poolCounts.core_pool || 0}</strong><span>core pool</span></div>
      <div><strong>${report.poolCounts.remedial_pool || 0}</strong><span>remedial pool</span></div>
      <div><strong>${report.poolCounts.hidden_duplicate || 0}</strong><span>hidden duplicates</span></div>
    </div>
    <span>Scan order: group by section/domain/skill/difficulty/answer format, then compare skeletons only inside that topic.</span>
    ${
      topGroups.length
        ? `<div class="duplicate-group-list">
            ${topGroups
              .map(
                (group) => `
                  <article class="duplicate-group-card">
                    <div>
                      <strong>${escapeHtml(group.topic)}</strong>
                      <span>${group.size} items · core ${group.corePool} · remedial ${group.remedialPool} · hidden ${group.hiddenDuplicate}</span>
                      <small>Sample: ${escapeHtml(group.sampleId)} · Sources: ${escapeHtml(formatCountMapReadable(group.sourceMix))}</small>
                      <small>Keep core: ${escapeHtml((group.coreIds || group.preferredIds || []).slice(0, 6).join(", ") || "n/a")}</small>
                      <small>Remedial: ${escapeHtml((group.remedialIds || []).slice(0, 6).join(", ") || "n/a")}</small>
                      <small>Hide: ${escapeHtml((group.hiddenIds || []).slice(0, 6).join(", ") || "n/a")}</small>
                    </div>
                    <p>${escapeHtml(group.samplePrompt)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>`
        : '<span class="success-line">No skeleton group exceeded the core limits.</span>'
    }
  `;
  localizeDynamicUiText(els.duplicateScanResult);
}

function questionAdminPool(question) {
  return practicePool(question);
}

function questionAdminIsBlocked(question) {
  const publicationStatus = String(question?.publicationStatus || "");
  return (
    question?.reviewStatus === "rejected" ||
    question?.auditStatus === "blocked" ||
    publicationStatus === "audit_blocked" ||
    publicationStatus.startsWith("rejected") ||
    publicationStatus.startsWith("hidden_duplicate") ||
    question?.contentAudit?.verdict === "fail" ||
    question?.contentAudit?.verdict === "blocked"
  );
}

function buildQuestionAdminRows() {
  const search = String(els.questionAdminSearch?.value || "").trim().toLowerCase();
  const criteria = {
    section: els.questionAdminSection?.value || "All",
    reviewStatus: els.questionAdminStatus?.value || "All",
    sourceType: els.questionAdminSource?.value || "All",
    practicePool: els.questionAdminPool?.value || "All",
  };
  return visibleQuestionBank().filter((question) => {
    if (criteria.section !== "All" && question.section !== criteria.section) return false;
    if (criteria.reviewStatus !== "All" && question.reviewStatus !== criteria.reviewStatus) return false;
    if (criteria.sourceType !== "All" && question.sourceType !== criteria.sourceType) return false;
    if (criteria.practicePool !== "All" && questionAdminPool(question) !== criteria.practicePool) return false;
    if (!search) return true;
    const haystack = [
      question.id,
      question.section,
      question.domain,
      question.skill,
      question.difficulty,
      question.sourceType,
      question.sourceName,
      question.reviewStatus,
      question.publicationStatus,
      question.prompt,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(search);
  });
}

function buildQuestionAdminGroups(questions = []) {
  const groups = new Map();
  questions.forEach((question) => {
    const key = [question.section || "Unknown", question.domain || "Unknown", question.skill || "Unknown"].join("|");
    const group = groups.get(key) || {
      section: question.section || "Unknown",
      domain: question.domain || "Unknown",
      skill: question.skill || "Unknown",
      total: 0,
      needsReview: 0,
      blocked: 0,
      hiddenDuplicate: 0,
    };
    group.total += 1;
    if (question.reviewStatus === "needs_review") group.needsReview += 1;
    if (questionAdminIsBlocked(question)) group.blocked += 1;
    if (questionAdminPool(question) === "hidden_duplicate") group.hiddenDuplicate += 1;
    groups.set(key, group);
  });
  return [...groups.values()]
    .sort((a, b) => b.needsReview - a.needsReview || b.blocked - a.blocked || b.hiddenDuplicate - a.hiddenDuplicate || b.total - a.total)
    .slice(0, 12);
}

function renderQuestionAdminManager() {
  if (!els.questionAdminWorkspace) return;
  if (!isContentAdmin()) {
    els.questionAdminWorkspace.className = "question-admin-workspace empty-state";
    els.questionAdminWorkspace.textContent = "Only Content Admin can manage question governance.";
    return;
  }
  const allRows = buildQuestionAdminRows();
  const allVisible = visibleQuestionBank();
  if (activeAdminQuestionId && !allRows.some((question) => question.id === activeAdminQuestionId)) {
    activeAdminQuestionId = "";
  }
  if (!activeAdminQuestionId && allRows.length) activeAdminQuestionId = allRows[0].id;
  const selectedQuestion = activeAdminQuestionId ? getQuestionById(activeAdminQuestionId) : null;
  const model = {
    filteredCount: allRows.length,
    groups: buildQuestionAdminGroups(allRows),
    rows: allRows.slice(0, 80),
    selectedQuestion,
    selectedQuestionId: activeAdminQuestionId,
    summary: {
      total: allVisible.length,
      reviewed: allVisible.filter((question) => question.reviewStatus === "reviewed").length,
      needsReview: allVisible.filter((question) => question.reviewStatus === "needs_review").length,
      blocked: allVisible.filter(questionAdminIsBlocked).length,
      hiddenDuplicate: allVisible.filter((question) => questionAdminPool(question) === "hidden_duplicate").length,
      publicReady: allVisible.filter((question) => isPublicPromotedQuestion(question)).length,
    },
  };
  els.questionAdminWorkspace.className = "question-admin-workspace";
  els.questionAdminWorkspace.innerHTML = SatAdminViewRenderers.renderQuestionAdminManager
    ? SatAdminViewRenderers.renderQuestionAdminManager(model, { labelFor, renderExplanation })
    : "";
  localizeDynamicUiText(els.questionAdminWorkspace);
}

function handleQuestionAdminAction(event) {
  const groupButton = event.target.closest("[data-question-group-action]");
  if (groupButton) {
    els.questionAdminSection.value = groupButton.dataset.section || "All";
    els.questionAdminSearch.value = [groupButton.dataset.domain, groupButton.dataset.skill].filter(Boolean).join(" ");
    activeAdminQuestionId = "";
    renderQuestionAdminManager();
    return;
  }
  const button = event.target.closest("[data-question-action]");
  if (!button) return;
  const questionId = button.dataset.questionId || "";
  const action = button.dataset.questionAction || "";
  const question = getQuestionById(questionId);
  if (!question || !isContentAdmin()) return;
  if (action === "select") {
    activeAdminQuestionId = question.id;
    renderQuestionAdminManager();
    return;
  }
  applyQuestionAdminAction(question, action);
}

function applyQuestionAdminAction(question, action) {
  if (!question) return;
  if (action === "reviewed") {
    question.reviewStatus = "reviewed";
    if (question.auditStatus === "blocked") question.auditStatus = "passed";
    if (!question.publicationStatus || question.publicationStatus === "audit_blocked") {
      question.publicationStatus = question.visibility === "public_candidate" ? "public_candidate_reviewed" : "private_auto_reviewed";
    }
  } else if (action === "needs_review") {
    question.reviewStatus = "needs_review";
    if (question.visibility === "public_candidate") question.visibility = "private_family";
    if (!String(question.publicationStatus || "").startsWith("hidden_duplicate")) {
      question.publicationStatus = "private_similarity_review";
    }
  } else if (["core_pool", "remedial_pool", "hidden_duplicate"].includes(action)) {
    question.practicePool = action;
    if (action === "hidden_duplicate") {
      question.publicationStatus = "hidden_duplicate_admin";
    } else if (String(question.publicationStatus || "").startsWith("hidden_duplicate")) {
      question.publicationStatus = question.visibility === "public_candidate" ? "public_candidate_reviewed" : "private_auto_reviewed";
    }
  } else if (action === "block") {
    const confirmed = window.confirm("Block this question from study/public use and send it back to needs_review?");
    if (!confirmed) return;
    if (!state.questionAudits || typeof state.questionAudits !== "object") state.questionAudits = {};
    if (SatQuestionAuditEngine.createAdminBlockEntry && SatQuestionAuditEngine.applyQuestionAuditBlock) {
      const entry = SatQuestionAuditEngine.createAdminBlockEntry(question, currentAccount());
      SatQuestionAuditEngine.applyQuestionAuditBlock(question, state.questionAudits, entry);
    } else {
      question.reviewStatus = "needs_review";
      question.visibility = "private_family";
      question.publicationStatus = "audit_blocked";
      question.auditStatus = "blocked";
      question.auditUpdatedAt = new Date().toISOString();
    }
  }
  persistQuestionGovernance(question);
  resetStudyAvailabilityCaches();
  saveState();
  hydrateFilters();
  renderQuestionAdminManager();
  renderMetrics();
  renderAdminCenter();
}

function summarizeLocalDuplicatePolicy() {
  return SatDuplicateEngine.summarizeDuplicatePolicy(visibleQuestionBank());
}

function parseVocabImportText(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed.words) ? parsed.words : Array.isArray(parsed.vocab) ? parsed.vocab : [];
    return rows.map(normalizeVocabEntry).filter(Boolean);
  } catch {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(parseVocabLine)
      .filter(Boolean);
  }
}

function parseVocabLine(line) {
  const parts = line
    .split(/\s+\|\s+|\t|\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;

  if (parts.length === 2) {
    const match = parts[0].match(/^(.+?)\s+\(([^)]+)\)$/);
    return normalizeVocabEntry({
      word: match ? match[1] : parts[0],
      partOfSpeech: match ? match[2] : "",
      category: "Imported SAT Vocab",
      definitionVi: parts[1],
      sourceName: "Manual Vocab Import",
    });
  }

  if (parts.length === 3) {
    return normalizeVocabEntry({
      word: parts[0],
      partOfSpeech: parts[1],
      category: "Imported SAT Vocab",
      definitionVi: parts[2],
      sourceName: "Manual Vocab Import",
    });
  }

  return normalizeVocabEntry({
    word: parts[0],
    partOfSpeech: parts[1],
    category: parts[2],
    definitionVi: parts[3],
    definitionEn: parts.slice(4).join(" - "),
    sourceName: "Manual Vocab Import",
  });
}

function upsertVocabEntries(entries) {
  const byWord = new Map((state.vocab || []).map((entry) => [vocabKey(entry), entry]));
  entries.forEach((entry) => byWord.set(vocabKey(entry), entry));
  state.vocab = [...byWord.values()].sort((a, b) => a.word.localeCompare(b.word));
  return entries.length;
}

function shuffleCopy(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function updateQuestionStatus(status) {
  const question = filteredQuestions[currentIndex];
  if (!question) return;
  question.reviewStatus = status;
  if (status !== "reviewed" && question.visibility === "public_candidate") {
    question.visibility = question.sourceType === "private_vault" ? "private_family" : "private_family";
    question.publicationStatus = status === "rejected" ? "rejected_after_public_review" : "private_similarity_review";
  }
  persistQuestionGovernance(question);
  saveState();
  render();
}

function persistQuestionGovernance(question) {
  if (!question?.id) return;
  touchQuestionBank();
  state.questionReviews[question.id] = normalizeReviewStatus(question.reviewStatus);
  if (!state.questionGovernance || typeof state.questionGovernance !== "object") state.questionGovernance = {};
  state.questionGovernance[question.id] = {
    reviewStatus: normalizeReviewStatus(question.reviewStatus),
    visibility: question.visibility || inferQuestionVisibility(question),
    publicationStatus: question.publicationStatus || "",
    promotedBy: question.promotedBy || "",
    promotedAt: question.promotedAt || "",
    publicReviewNote: question.publicReviewNote || "",
    auditStatus: question.auditStatus || "",
    auditUpdatedAt: question.auditUpdatedAt || "",
    practicePool: practicePool(question),
    topicGovernance: question.topicGovernance || null,
    intakeGate: question.intakeGate || null,
    contentAudit: question.contentAudit || null,
  };
}

function buildAdaptiveRemediationQueue({ includeFuture = true, includePassed = false, limit = 50 } = {}) {
  if (SatRemediationEngine.buildAdaptiveRemediationQueue) {
    return SatRemediationEngine.buildAdaptiveRemediationQueue(
      {
        profile: profile(),
        visibleQuestions: visibleQuestionBank(),
        includeFuture,
        includePassed,
        limit,
      },
      {
        getQuestionById,
        getCorrectAnswerLabel,
        suggestErrorType,
        getKnowledgeReviewLesson,
        hasLaterProofAttempt,
        chooseProofQuestionForAttempt,
        lessonScopeKey,
        isQuestionVisible,
        isStudyAvailableQuestion,
      },
    );
  }
  const now = Date.now();
  const p = profile();
  const rows = [];

  (p.attempts || []).forEach((attempt) => {
    const question = getQuestionById(attempt.questionId);
    if (!question || !isQuestionVisible(question)) return;
    const needsRemediation = !attempt.correct || attempt.errorType || attempt.pacingFlag === "slow_correct" || attempt.markedForReview;
    if (!needsRemediation) return;
    const remediation = attempt.remediation || buildAttemptRemediation(question, attempt, new Date(attempt.at || Date.now()));
    const savedProofQuestion = remediation.proofQuestionId ? getQuestionById(remediation.proofQuestionId) : null;
    const proofQuestion = savedProofQuestion && isQuestionVisible(savedProofQuestion)
      ? savedProofQuestion
      : chooseProofQuestionForAttempt(question, attempt);
    const proofPassed = remediation.status === "proof_passed" || hasLaterProofAttempt(attempt, question);
    if (proofPassed && !includePassed) return;
    const dueAt = remediation.dueAt || attempt.dueAt || attempt.at;
    const due = !dueAt || (Date.parse(dueAt) || 0) <= now;
    if (!includeFuture && !due && !proofPassed) return;
    const lessonReviewed = remediation.status === "reviewed" || remediation.reviewedAt || proofPassed;
    const status = proofPassed ? "proof_passed" : lessonReviewed ? (due ? "proof_due" : "proof_scheduled") : due ? "lesson_due" : "lesson_scheduled";
    rows.push({
      attemptId: attempt.id,
      questionId: question.id,
      section: question.section,
      domain: question.domain,
      skill: question.skill,
      difficulty: question.difficulty,
      errorType: attempt.errorType || attempt.pacingFlag || (!attempt.correct ? suggestErrorType(question, false, { skipped: !attempt.selectedAnswer }) : "marked"),
      selectedAnswer: attempt.selectedAnswer || "",
      correctAnswer: getCorrectAnswerLabel(question),
      dueAt,
      assignedAt: remediation.assignedAt || attempt.at,
      reviewedAt: remediation.reviewedAt || "",
      status,
      proofPassed,
      proofQuestionId: proofQuestion?.id || "",
      proofQuestion,
      lessonTitle: remediation.lessonTitle || getKnowledgeReviewLesson(question).title,
      action: remediation.action || remediationActionFor(attempt.errorType, question),
      proofRule: remediation.proofRule || "Pass a new question in the same skill.",
    });
  });

  Object.entries(p.lessonProgress || {}).forEach(([key, task]) => {
    if (!task || task.status === "proof_passed") return;
    const dueAt = task.dueAt || task.assignedAt || new Date().toISOString();
    const due = !dueAt || (Date.parse(dueAt) || 0) <= now;
    if (!includeFuture && !due) return;
    const proofQuestion = visibleQuestionBank().find((question) => lessonScopeKey(question) === key && isStudyAvailableQuestion(question));
    rows.push({
      attemptId: "",
      questionId: "",
      section: task.section || proofQuestion?.section || "All",
      domain: task.domain || proofQuestion?.domain || "All",
      skill: task.skill || proofQuestion?.skill || "All",
      difficulty: "Lesson",
      errorType: "knowledge_gap",
      selectedAnswer: "",
      correctAnswer: "",
      dueAt,
      assignedAt: task.assignedAt || "",
      reviewedAt: task.reviewedAt || "",
      status: task.status === "reviewed" ? "proof_due" : due ? "lesson_due" : "lesson_scheduled",
      proofPassed: false,
      proofQuestionId: proofQuestion?.id || "",
      proofQuestion: proofQuestion || null,
      lessonTitle: `Lesson: ${task.skill || proofQuestion?.skill || "Review"}`,
      action: "Read the lesson, then pass a scaffold proof question.",
      proofRule: "Pass a scaffold question in this lesson.",
      lessonTaskKey: key,
    });
  });

  const statusRank = { lesson_due: 0, proof_due: 0, proof_failed: 0, lesson_scheduled: 2, proof_scheduled: 3, proof_passed: 4 };
  return rows
    .sort((a, b) => (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) || (Date.parse(a.dueAt || "") || 0) - (Date.parse(b.dueAt || "") || 0))
    .slice(0, limit);
}

function getDueQuestionIds() {
  const p = profile();
  const now = Date.now();
  const dueIds = new Set();

  p.attempts.forEach((attempt) => {
    if (!attempt.correct || new Date(attempt.dueAt).getTime() <= now) {
      dueIds.add(attempt.questionId);
    }
  });

  p.bookmarks.forEach((id) => dueIds.add(id));
  buildAdaptiveRemediationQueue({ includeFuture: false, includePassed: false, limit: 100 }).forEach((row) => {
    if (row.proofQuestionId) dueIds.add(row.proofQuestionId);
    else if (row.questionId) dueIds.add(row.questionId);
  });
  return [...dueIds];
}

function renderReview() {
  const p = profile();
  const remediationQueue = buildAdaptiveRemediationQueue({ includeFuture: true, includePassed: false, limit: 20 });
  const dueIds = new Set(getDueQuestionIds());
  const dueQuestions = visibleQuestionBank().filter((q) => dueIds.has(q.id));
  const weakSkills = getWeakSkills();
  applyStudentReviewCopy();

  if (!remediationQueue.length && !dueQuestions.length && !weakSkills.length) {
    els.reviewList.innerHTML =
      state.language === "vi"
        ? '<div class="empty-state">Chưa có lỗi đến hạn ôn. Câu sai và câu đã lưu sẽ xuất hiện ở đây.</div>'
        : '<div class="empty-state">No due reviews yet. Wrong answers and bookmarks will appear here.</div>';
    return;
  }

  if (currentAccount()?.role === "student") {
    renderStudentReviewQueue({ remediationQueue, dueQuestions, weakSkills });
    return;
  }

  const queueHtml = renderRemediationQueue(remediationQueue);
  const skillItems = weakSkills
    .map(
      (skill) => `
        <div class="list-item">
          <h3>${escapeHtml(skill.skill)}</h3>
          <p>${skill.wrong} wrong attempt${skill.wrong > 1 ? "s" : ""} · ${escapeHtml(skill.section)}</p>
        </div>
      `,
    )
    .join("");

  const questionItems = dueQuestions
    .map(
      (q) => `
        <div class="list-item">
          <h3>${escapeHtml(q.domain)} · ${escapeHtml(q.skill)}</h3>
          <p>${escapeHtml(q.difficulty)} · ${escapeHtml(labelFor(q.sourceType))} · ${escapeHtml(labelFor(q.reviewStatus))}</p>
          <p>${escapeHtml(p.notes[q.id] || "No note saved.")}</p>
        </div>
      `,
    )
    .join("");

  els.reviewList.innerHTML = `${queueHtml}${skillItems}${questionItems}`;
  bindRemediationQueueActions();
}

function applyStudentReviewCopy() {
  if (currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  const heading = document.querySelector("#view-review > .section-heading");
  if (heading) {
    const eyebrow = heading.querySelector(".eyebrow");
    const title = heading.querySelector("h2");
    const copy = heading.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = vi ? "Ôn lỗi sai" : "Mistake review";
    if (title) title.textContent = vi ? "Việc cần ôn hôm nay" : "Today's review work";
    if (copy) copy.textContent = vi ? "Câu sai, câu chậm, câu bỏ qua và câu đã lưu sẽ thành nhiệm vụ ôn theo hạn." : "Wrong, slow, skipped, and saved items become spaced review tasks.";
  }
  if (els.startRemediationQueue) els.startRemediationQueue.textContent = vi ? "Làm proof đến hạn" : "Start due proof";
  if (els.startDueReview) els.startDueReview.textContent = vi ? "Ôn câu đến hạn" : "Review due items";
}

function renderStudentReviewQueue({ remediationQueue = [], dueQuestions = [], weakSkills = [] } = {}) {
  const vi = state.language === "vi";
  const queueCards = remediationQueue.map((row, index) => renderStudentReviewTask(row, index)).join("");
  const coveredQuestionIds = new Set(remediationQueue.map((row) => row.questionId).filter(Boolean));
  const fallbackCards = dueQuestions
    .filter((question) => !coveredQuestionIds.has(question.id))
    .slice(0, 6)
    .map((question, index) => renderStudentDueQuestionTask(question, index + remediationQueue.length))
    .join("");
  const skillCards = weakSkills
    .slice(0, 3)
    .map(
      (skill) => `
        <article class="student-review-skill">
          <span>${escapeHtml(skill.priority)}</span>
          <strong>${escapeHtml(skill.skill)}</strong>
          <small>${escapeHtml(skill.section)} - ${escapeHtml(skill.domain || "")}</small>
        </article>
      `,
    )
    .join("");

  els.reviewList.innerHTML = `
    <section class="student-review-panel">
      <div class="student-review-head">
        <div>
          <p class="eyebrow">${vi ? "\u00d4n l\u1ed7i sai" : "Mistake review"}</p>
          <h2>${vi ? "L\u00e0m t\u1eebng l\u1ed7i, kh\u00f4ng \u00f4m t\u1ea5t c\u1ea3" : "Fix one mistake at a time"}</h2>
          <p>${vi ? "M\u1edf m\u1ed9t m\u1ee5c, \u0111\u1ecdc quy t\u1eafc, \u0111\u00e1nh d\u1ea5u \u0111\u00e3 \u00f4n, r\u1ed3i l\u00e0m c\u00e2u ch\u1ee9ng minh." : "Open one item, read the rule, mark the lesson reviewed, then pass proof."}</p>
        </div>
        <button id="student-start-proof-queue" class="button primary" type="button">${vi ? "L\u00e0m c\u00e2u ch\u1ee9ng minh \u0111\u1ebfn h\u1ea1n" : "Start due proof"}</button>
      </div>
      ${skillCards ? `<div class="student-review-skills">${skillCards}</div>` : ""}
      <div class="student-review-list">
        ${queueCards}${fallbackCards}
      </div>
    </section>
  `;
  document.getElementById("student-start-proof-queue")?.addEventListener("click", startDueReview);
  bindRemediationQueueActions();
  document.querySelectorAll(".student-review-practice").forEach((button) => {
    button.addEventListener("click", () => {
      startScopedPractice({
        section: button.dataset.section || "All",
        domain: button.dataset.domain || "All",
        skill: button.dataset.skill || "All",
        difficulty: "All",
        source: "All",
      });
    });
  });
  document.querySelectorAll(".student-review-task").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".student-review-task").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
}

function renderStudentReviewTask(row = {}, index = 0) {
  const vi = state.language === "vi";
  const proofLabel = vi ? "Làm đúng 2 câu mới cùng kỹ năng, đúng nhịp." : row.proofQuestion ? `${row.proofQuestion.difficulty} ${row.proofQuestion.domain}` : row.proofRule;
  let statusLabel = {
    lesson_due: vi ? "Sửa ngay" : "Fix now",
    proof_due: vi ? "Sửa ngay" : "Fix now",
    lesson_scheduled: vi ? "Sắp đến hạn" : "Due soon",
    proof_scheduled: vi ? "Chờ proof" : "Proof scheduled",
    proof_failed: vi ? "Sửa ngay" : "Fix now",
    reviewed: vi ? "Chờ proof" : "Waiting for proof",
    proof_passed: vi ? "\u0110\u00e3 s\u1eeda l\u1ed7i" : "Fixed",
  }[row.status] || labelFor(row.status || "review");
  const assignedAtMs = Date.parse(row.assignedAt || row.taggedAt || "");
  const freshOpen = !row.reviewedAt && !row.proofPassed && Number.isFinite(assignedAtMs) && Date.now() - assignedAtMs < 24 * 60 * 60 * 1000;
  if (freshOpen && ["lesson_scheduled", "lesson_due", "proof_scheduled", "proof_due"].includes(row.status)) {
    statusLabel = vi ? "Sửa ngay" : "Fix now";
  }
  const whyWrong = row.tutorDiagnosis?.rootCause || row.rootCause || row.whyLikely || row.action || (vi ? "Lỗi này cho thấy quy tắc hoặc bước kiểm tra chưa ổn định." : "This miss shows that the rule or checking step is not stable yet.");
  const ruleText = row.tutorDiagnosis?.teachFirst || row.lessonTitle || row.action || (vi ? "Đọc lại quy tắc của skill này trước khi làm thêm câu mới." : "Review the target skill rule before adding new volume.");
  const attrs = `data-section="${escapeHtml(row.section || "All")}" data-domain="${escapeHtml(row.domain || "All")}" data-skill="${escapeHtml(row.skill || "All")}"`;
  return `
    <details class="student-review-task" ${index === 0 ? "open" : ""}>
      <summary>
        <span>${index + 1}</span>
        <div>
          <strong>${escapeHtml(row.skill || row.lessonTitle || (vi ? "L\u1ed7i c\u1ea7n \u00f4n" : "Review item"))}</strong>
          <small>${escapeHtml(row.domain || row.section || "")} - ${escapeHtml(errorTagLabel(row.errorType))}</small>
        </div>
        <em>${escapeHtml(statusLabel)}</em>
      </summary>
      <div class="student-review-steps">
        <div><strong>1</strong><span>${vi ? "Sai vì gì" : "Why wrong"}</span><p>${escapeHtml(whyWrong)}</p></div>
        <div><strong>2</strong><span>${vi ? "Quy tắc" : "Rule"}</span><p>${escapeHtml(ruleText)}</p></div>
        <div><strong>3</strong><span>${vi ? "Câu proof" : "Proof item"}</span><p>${escapeHtml(proofLabel || (vi ? "Làm đúng 2 câu mới cùng kỹ năng, đúng nhịp." : "Pass 2 fresh same-skill items on pace."))}</p></div>
      </div>
      <div class="student-self-explain">
        <strong>${vi ? "Em tự gọi tên lỗi trước khi làm lại" : "Name the mistake before retrying"}</strong>
        <div>
          ${[
            ["misread_prompt", vi ? "Đọc thiếu" : "Misread"],
            ["knowledge_gap", vi ? "Chưa biết rule" : "Rule gap"],
            ["trap_answer", vi ? "Chọn bẫy" : "Trap choice"],
            ["calculation", vi ? "Tính sai" : "Calculation"],
            ["time_pressure", vi ? "Quá chậm" : "Too slow"],
          ].map(([value, label]) => `<button class="button ghost student-self-error" type="button" data-attempt-id="${escapeHtml(row.attemptId || "")}" data-error-type="${escapeHtml(value)}">${escapeHtml(label)}</button>`).join("")}
        </div>
      </div>
      <div class="answer-actions">
        <button class="button secondary remediation-open-lesson" type="button" data-scope-key="${escapeHtml(lessonScopeKey(row))}">${vi ? "M\u1edf b\u00e0i" : "Open lesson"}</button>
        <button class="button secondary remediation-reviewed" type="button" data-attempt-id="${escapeHtml(row.attemptId || "")}" data-lesson-task-key="${escapeHtml(row.lessonTaskKey || "")}">${vi ? "\u0110\u00e3 \u0111\u1ecdc quy t\u1eafc" : "Lesson reviewed"}</button>
        <button class="button secondary remediation-relearn" type="button" data-attempt-id="${escapeHtml(row.attemptId || "")}" data-lesson-task-key="${escapeHtml(row.lessonTaskKey || "")}">${vi ? "C\u1ea7n h\u1ecdc l\u1ea1i" : "Need relearn"}</button>
        <button class="button secondary student-review-practice" type="button" ${attrs}>${vi ? "Luy\u1ec7n c\u00f9ng d\u1ea1ng" : "Practice skill"}</button>
        <button class="button primary remediation-proof" type="button" data-attempt-id="${escapeHtml(row.attemptId || "")}" data-proof-question-id="${escapeHtml(row.proofQuestionId || "")}" ${row.proofQuestionId ? "" : "disabled"}>${vi ? "L\u00e0m c\u00e2u ch\u1ee9ng minh" : "Proof now"}</button>
      </div>
      <p class="muted">${vi ? "\u0110\u1ebfn h\u1ea1n" : "Due"}: ${escapeHtml(formatDate(row.dueAt || row.assignedAt || new Date().toISOString()))}</p>
    </details>
  `;
}

function renderStudentDueQuestionTask(question, index = 0) {
  const vi = state.language === "vi";
  const attrs = `data-section="${escapeHtml(question.section || "All")}" data-domain="${escapeHtml(question.domain || "All")}" data-skill="${escapeHtml(question.skill || "All")}"`;
  const note = profile().notes?.[question.id] || "";
  return `
    <details class="student-review-task" ${index === 0 ? "open" : ""}>
      <summary>
        <span>${index + 1}</span>
        <div>
          <strong>${escapeHtml(question.skill)}</strong>
          <small>${escapeHtml(question.domain)} - ${escapeHtml(question.difficulty)}</small>
        </div>
        <em>${vi ? "C\u00e2u \u0111\u00e3 l\u01b0u" : "Saved item"}</em>
      </summary>
      <p>${escapeHtml(note || (vi ? "L\u00e0m l\u1ea1i c\u00e2u n\u00e0y v\u00e0 ghi l\u1ed7i n\u1ebfu v\u1eabn sai." : "Redo this item and add a mistake note if it is still wrong."))}</p>
      <div class="answer-actions">
        <button class="button primary student-review-practice" type="button" ${attrs}>${vi ? "\u00d4n ngay" : "Review now"}</button>
      </div>
    </details>
  `;
}

function renderRemediationQueue(rows = []) {
  return SatViewRenderers.renderRemediationQueue
    ? SatViewRenderers.renderRemediationQueue(rows, { errorTagLabel, formatDate, labelFor, lessonScopeKey })
    : "";
}

function bindRemediationQueueActions() {
  document.querySelectorAll(".remediation-open-lesson").forEach((button) => {
    button.addEventListener("click", () => {
      activeLessonKey = button.dataset.scopeKey || "";
      switchView("lessons");
    });
  });
  document.querySelectorAll(".remediation-reviewed").forEach((button) => {
    button.addEventListener("click", () => markRemediationLessonReviewed(button.dataset.attemptId, button.dataset.lessonTaskKey));
  });
  document.querySelectorAll(".remediation-relearn").forEach((button) => {
    button.addEventListener("click", () => markRemediationNeedsRelearn(button.dataset.attemptId, button.dataset.lessonTaskKey));
  });
  document.querySelectorAll(".remediation-proof").forEach((button) => {
    button.addEventListener("click", () => startRemediationProof(button.dataset.attemptId, button.dataset.proofQuestionId));
  });
  document.querySelectorAll(".student-self-error").forEach((button) => {
    button.addEventListener("click", () => markStudentSelfExplainedError(button.dataset.attemptId, button.dataset.errorType));
  });
}

function markStudentSelfExplainedError(attemptId, errorType) {
  if (!attemptId || !errorType) return;
  const p = profile();
  const attempt = p.attempts.find((item) => item.id === attemptId);
  if (!attempt) return;
  const question = getQuestionById(attempt.questionId);
  attempt.errorType = errorType;
  attempt.tagSource = "student_self_explanation";
  attempt.selfExplainedAt = new Date().toISOString();
  if (question) {
    attempt.remediation = {
      ...(attempt.remediation || buildAttemptRemediation(question, attempt)),
      status: "lesson_due",
      errorType,
      selfExplanation: errorType,
      dueAt: new Date().toISOString(),
    };
  }
  saveState();
  renderReview();
}

function markRemediationLessonReviewed(attemptId, lessonTaskKey = "") {
  const p = profile();
  const now = new Date().toISOString();
  if (attemptId) {
    const attempt = p.attempts.find((item) => item.id === attemptId);
    if (attempt) {
      const question = getQuestionById(attempt.questionId);
      attempt.remediation = {
        ...(attempt.remediation || (question ? buildAttemptRemediation(question, attempt) : {})),
        status: "reviewed",
        reviewedAt: now,
      };
    }
  }
  if (lessonTaskKey && p.lessonProgress?.[lessonTaskKey]) {
    p.lessonProgress[lessonTaskKey] = {
      ...p.lessonProgress[lessonTaskKey],
      status: "reviewed",
      reviewedAt: now,
    };
  }
  saveState();
  renderReview();
}

function markRemediationNeedsRelearn(attemptId, lessonTaskKey = "") {
  const p = profile();
  const now = new Date().toISOString();
  if (attemptId) {
    const attempt = p.attempts.find((item) => item.id === attemptId);
    if (attempt) {
      const question = getQuestionById(attempt.questionId);
      const rebuilt = question ? buildAttemptRemediation(question, attempt) : {};
      attempt.remediation = {
        ...rebuilt,
        ...(attempt.remediation || {}),
        status: "proof_failed",
        proofStatus: "proof_failed",
        dueAt: now,
        reviewedAt: "",
        needsRelearnAt: now,
      };
    }
  }
  if (lessonTaskKey && p.lessonProgress?.[lessonTaskKey]) {
    p.lessonProgress[lessonTaskKey] = {
      ...p.lessonProgress[lessonTaskKey],
      status: "assigned",
      dueAt: now,
      reviewedAt: "",
      needsRelearnAt: now,
    };
  }
  saveState();
  renderReview();
}

function startRemediationProof(attemptId, proofQuestionId = "") {
  const question = getQuestionById(proofQuestionId);
  if (!question) {
    alert("No proof question is available for this remediation item.");
    return;
  }
  startPracticeSession({
    mode: "Remediation Proof",
    questions: [question],
    minutes: Math.max(3, Math.ceil(targetSecondsForQuestion(question) / 60) + 1),
    summary: `Proof question for ${question.skill}. Pass it without slow_correct pacing.`,
    context: { remediationAttemptId: attemptId },
  });
}

function getWeakSkills() {
  return buildSkillMastery()
    .filter((item) => item.wrong > 0 || item.mastery < 75)
    .map((item) => ({
      section: item.section,
      domain: item.domain,
      skill: item.skill,
      wrong: item.wrong,
      mastery: item.mastery,
      errorType: item.dominantErrorType,
      priority: item.priorityScore >= 85 ? "High" : item.priorityScore >= 55 ? "Medium" : "Low",
    }))
    .slice(0, 6);
}

function startDueReview() {
  clearPracticeSessionState();
  dueMode = true;
  currentIndex = 0;
  switchView("practice");
}

function startAdaptiveRemediationQueue() {
  const rows = buildAdaptiveRemediationQueue({ includeFuture: false, includePassed: false, limit: 12 });
  const questions = [];
  const used = new Set();
  const remediationProofByQuestionId = {};
  const remediationLessonByQuestionId = {};
  rows.forEach((row) => {
    const question = row.proofQuestionId ? getQuestionById(row.proofQuestionId) : null;
    if (question && !used.has(question.id) && isQuestionVisible(question) && isStudyAvailableQuestion(question)) {
      questions.push(question);
      used.add(question.id);
      if (row.attemptId) remediationProofByQuestionId[question.id] = row.attemptId;
      if (row.lessonTaskKey) remediationLessonByQuestionId[question.id] = row.lessonTaskKey;
    }
  });
  if (!questions.length) {
    alert("No due proof questions are ready. Open the lesson cards first or answer more practice questions.");
    return;
  }
  startPracticeSession({
    mode: "Remediation Proof Queue",
    questions: questions.slice(0, 8),
    minutes: Math.max(8, questions.slice(0, 8).length * 2),
    summary: "Proof questions selected from due mistakes. Pass them to clear remediation.",
    context: { remediationProofByQuestionId, remediationLessonByQuestionId },
  });
}

function renderSources() {
  const visibleQuestions = visibleQuestionBank();
  const ledgerStats = SatQuestionQueryEngine.sourceLedgerStats
    ? SatQuestionQueryEngine.sourceLedgerStats(visibleQuestions, Object.keys(sourceLedger))
    : {};
  if (SatAdminViewRenderers.renderSourceLedgerCards) {
    els.sourceLedger.innerHTML = SatAdminViewRenderers.renderSourceLedgerCards(sourceLedger, ledgerStats);
  } else {
    els.sourceLedger.innerHTML = "";
  }
  renderArchiveRegistry();
}

function buildGenerationIntakeReport() {
  if (!SatQualityIntakeEngine.buildGenerationIntakeReport) return null;
  return SatQualityIntakeEngine.buildGenerationIntakeReport(
    state.questions,
    {
      maxActivePerTopic: 35,
    },
    {
      answersMatch,
      looksLikeProtectedQuestionText,
      normalizePrompt: normalizePromptForImport,
      textSimilarity,
    },
  );
}

function renderGenerationIntakePanel(report) {
  if (!report || !SatAdminViewRenderers.renderGenerationIntakePanel) return "";
  return SatAdminViewRenderers.renderGenerationIntakePanel(report, {
    labelFor,
    lastApplied: state.qualityIntake?.lastApplied,
  });
}

function renderQuestionIntegrityReport() {
  if (!els.questionIntegritySummary || !els.questionIntegrityBlocked || !els.questionIntegrityTopics) return;
  if (!isContentAdmin()) {
    els.questionIntegritySummary.className = "integrity-summary empty-state";
    els.questionIntegritySummary.textContent = "Question integrity report is visible only to Content Admin.";
    els.questionIntegrityBlocked.className = "integrity-list empty-state";
    els.questionIntegrityBlocked.textContent = "Blocked source rows are hidden for this account.";
    els.questionIntegrityTopics.className = "integrity-list empty-state";
    els.questionIntegrityTopics.textContent = "Topic repetition data is hidden for this account.";
    return;
  }
  if (!questionIntegrityReport) {
    const generationIntakeReport = buildGenerationIntakeReport();
    const generationIntakePanel = renderGenerationIntakePanel(generationIntakeReport);
    els.questionIntegritySummary.className = "integrity-summary empty-state";
    els.questionIntegritySummary.textContent = "Load the integrity report to see data quality status.";
    els.questionIntegrityBlocked.className = "integrity-list";
    els.questionIntegrityBlocked.innerHTML = generationIntakePanel || "Blocked source rows will appear here.";
    els.questionIntegrityTopics.className = "integrity-list empty-state";
    els.questionIntegrityTopics.textContent = "Overrepresented topics will appear here.";
    bindIntegrityGovernanceActions();
    return;
  }

  const summary = questionIntegrityReport.summary || {};
  const sectionCounts = summary.sectionCounts || {};
  const sourceFiles = summary.sourceFiles || {};
  const blockedRows = [
    ...(Array.isArray(questionIntegrityReport.criticalRows) ? questionIntegrityReport.criticalRows : []),
    ...(Array.isArray(questionIntegrityReport.blockedRows) ? questionIntegrityReport.blockedRows : []),
  ];
  const warningRows = Array.isArray(questionIntegrityReport.warningRows) ? questionIntegrityReport.warningRows : [];
  const topics = Object.entries(questionIntegrityReport.overrepresentedTopics || {})
    .map(([topic, data]) => ({
      topic,
      count: Number(data?.count || 0),
      sampleIds: Array.isArray(data?.sampleIds) ? data.sampleIds.slice(0, 5) : [],
    }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
  const topicPlan = Object.entries(questionIntegrityReport.topicGovernancePlan || {})
    .map(([topic, data]) => ({
      topic,
      count: Number(data?.count || 0),
      visibleCount: Number(data?.visibleCount || 0),
      hiddenDuplicateCount: Number(data?.hiddenDuplicateCount || 0),
      remedialPoolCount: Number(data?.remedialPoolCount || 0),
      rejectedCount: Number(data?.rejectedCount || 0),
      keepTarget: Number(data?.keepTarget || 0),
      overflowCount: Number(data?.overflowCount || 0),
      recommendedAction: data?.recommendedAction || "monitor",
      candidateIds: Array.isArray(data?.candidateIds) ? data.candidateIds.slice(0, 6) : [],
      sampleIds: Array.isArray(data?.sampleIds) ? data.sampleIds.slice(0, 4) : [],
    }))
    .sort((a, b) => b.overflowCount - a.overflowCount || b.visibleCount - a.visibleCount || a.topic.localeCompare(b.topic));

  const status = Number(summary.criticalIssueCount || 0)
    ? { label: "Critical", className: "block" }
    : Number(summary.blockedSourceQuestionCount || 0)
      ? { label: "Guarded", className: "warn" }
      : { label: "Clean", className: "ok" };
  const generationIntakeReport = buildGenerationIntakeReport();
  const generationIntakePanel = renderGenerationIntakePanel(generationIntakeReport);

  els.questionIntegritySummary.className = "integrity-summary";
  els.questionIntegritySummary.innerHTML = `
    <div class="integrity-status ${status.className}">
      <strong>${escapeHtml(status.label)}</strong>
      <span>current bank status</span>
    </div>
    <div><strong>${Number(summary.totalQuestions || 0)}</strong><span>questions audited</span></div>
    <div><strong>${Number(sectionCounts["Reading and Writing"] || 0)}</strong><span>Reading & Writing</span></div>
    <div><strong>${Number(sectionCounts.Math || 0)}</strong><span>Math</span></div>
    <div><strong>${Number(summary.criticalIssueCount || 0)}</strong><span>critical issues</span></div>
    <div><strong>${Number(summary.blockedSourceQuestionCount || 0)}</strong><span>blocked source rows</span></div>
    <div><strong>${Number(summary.warningIssueCount || 0)}</strong><span>warnings</span></div>
    <div><strong>${Number(summary.overrepresentedTopicCount || topics.length)}</strong><span>repeated topics</span></div>
    <div><strong>${Number(summary.topicGovernancePlanCount || topicPlan.length)}</strong><span>topic plans</span></div>
  `;

  const sourceFileHtml = Object.entries(sourceFiles)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([file, count]) => `<span>${escapeHtml(file)}: ${Number(count || 0)}</span>`)
    .join("");

  els.questionIntegrityBlocked.className = "integrity-list";
  els.questionIntegrityBlocked.innerHTML = `
    ${generationIntakePanel}
    <div class="integrity-section-title">
      <div>
        <strong>Blocked / critical rows</strong>
        <span>${blockedRows.length} blocked from raw source import. Warning row preview is capped at ${warningRows.length} rows.</span>
      </div>
      ${
        blockedRows.length
          ? '<button class="button secondary integrity-quarantine-blocked" type="button">Quarantine loaded blocked rows</button>'
          : ""
      }
    </div>
    ${
      blockedRows.length
        ? blockedRows
            .slice(0, 12)
            .map(
              (row) => `
                <article class="integrity-row block">
                  <div>
                    <strong>${escapeHtml(row.id || "unknown id")}</strong>
                    <span>${escapeHtml(row.sourceFile || "unknown source")} #${Number(row.sourceIndex ?? 0)} - ${escapeHtml(row.section || "Unknown")} / ${escapeHtml(row.skill || row.domain || "Unknown")}</span>
                  </div>
                  <p>${escapeHtml([...(row.issues || []), ...(row.warnings || []).slice(0, 2)].join("; ") || "Blocked by validator.")}</p>
                </article>
              `,
            )
            .join("")
        : '<div class="success-line">No blocked or critical source rows.</div>'
    }
    <div class="integrity-source-files">${sourceFileHtml}</div>
  `;

  els.questionIntegrityTopics.className = "integrity-list";
  els.questionIntegrityTopics.innerHTML = `
    <div class="integrity-section-title">
      <strong>Top repeated topics</strong>
      <span>Use this list with Bank Manager duplicate scan. Keep repeated hard forms for remediation; hide easy/medium clones.</span>
    </div>
    ${
      topics.length
        ? `<div class="integrity-topic-grid">
            ${topics
              .slice(0, 12)
              .map(
                (topic) => `
                  <article class="integrity-topic-card">
                    <strong>${escapeHtml(topic.topic)}</strong>
                    <span>${topic.count} matching questions</span>
                    <small>${escapeHtml(topic.sampleIds.join(", ") || "No samples")}</small>
                  </article>
                `,
              )
              .join("")}
          </div>`
        : '<div class="success-line">No overrepresented topics detected.</div>'
    }
    <div class="integrity-section-title">
      <strong>Topic governance plan</strong>
      <span>Visible count excludes rejected and hidden duplicates. Candidate IDs are the safest first pass for admin review.</span>
    </div>
    ${
      topicPlan.length
        ? `<div class="integrity-topic-grid">
            ${topicPlan
              .slice(0, 12)
              .map(
                (item) => `
                  <article class="integrity-topic-card">
                    <strong>${escapeHtml(item.topic)}</strong>
                    <span>${item.visibleCount}/${item.count} visible - target ${item.keepTarget || "n/a"} - overflow ${item.overflowCount}</span>
                    <small>${escapeHtml(item.recommendedAction.replace(/_/g, " "))}</small>
                    <small>Remedial ${item.remedialPoolCount}; hidden ${item.hiddenDuplicateCount}; rejected ${item.rejectedCount}</small>
                    <small>Review: ${escapeHtml(item.candidateIds.join(", ") || item.sampleIds.join(", ") || "No candidates")}</small>
                    ${
                      item.candidateIds.length
                        ? `<div class="integrity-actions">
                            <button class="button secondary integrity-remedial-candidates" type="button" data-topic="${escapeHtml(item.topic)}" data-candidate-ids="${escapeHtml(item.candidateIds.join("|"))}">Move candidates to remedial</button>
                            <button class="button secondary integrity-hide-candidates" type="button" data-topic="${escapeHtml(item.topic)}" data-candidate-ids="${escapeHtml(item.candidateIds.join("|"))}">Hide candidates</button>
                          </div>`
                        : ""
                    }
                  </article>
                `,
              )
              .join("")}
          </div>`
        : '<div class="success-line">No topic governance action needed.</div>'
    }
  `;
  bindIntegrityGovernanceActions();
}

function bindIntegrityGovernanceActions() {
  document.querySelectorAll(".integrity-apply-intake").forEach((button) => {
    button.addEventListener("click", applyGenerationIntakePolicy);
  });
  document.querySelectorAll(".integrity-quarantine-blocked").forEach((button) => {
    button.addEventListener("click", quarantineIntegrityBlockedRows);
  });
  document.querySelectorAll(".integrity-remedial-candidates").forEach((button) => {
    button.addEventListener("click", () => {
      applyIntegrityCandidatePolicy(button.dataset.topic || "", button.dataset.candidateIds || "", "remedial_pool");
    });
  });
  document.querySelectorAll(".integrity-hide-candidates").forEach((button) => {
    button.addEventListener("click", () => {
      applyIntegrityCandidatePolicy(button.dataset.topic || "", button.dataset.candidateIds || "", "hidden_duplicate");
    });
  });
}

function applyGenerationIntakePolicy() {
  if (!isContentAdmin()) {
    alert("Only Content Admin can apply generated-bank intake policy.");
    return;
  }
  if (!SatQualityIntakeEngine.applyGenerationIntakePolicy) {
    alert("Generated-bank intake engine is not available.");
    return;
  }
  const report = buildGenerationIntakeReport();
  if (!report || !Array.isArray(report.rows) || !report.rows.length) {
    alert("No generated candidates found for intake.");
    return;
  }
  const result = SatQualityIntakeEngine.applyGenerationIntakePolicy(state.questions, report, {
    reviewer: currentAccount()?.id || "content-admin",
  });
  state.questions.forEach((question) => {
    if (question.intakeGate?.version === (result.version || report.version)) persistQuestionGovernance(question);
  });
  state.qualityIntake = {
    ...(state.qualityIntake || {}),
    lastApplied: {
      appliedAt: result.appliedAt,
      changedCount: result.changedCount,
      summary: report.summary,
      version: result.version,
    },
  };
  resetStudyAvailabilityCaches();
  saveState();
  hydrateFilters();
  render();
  alert(
    `Generated-bank intake applied: ${result.changedCount} question${result.changedCount === 1 ? "" : "s"} updated. Blocked ${Number(report.summary?.blocked || 0)}, needs review ${Number(report.summary?.needsReview || 0)}, remedial ${Number(report.summary?.remedial || 0)}, ready ${Number(report.summary?.ready || 0)}.`,
  );
}

function applyIntegrityCandidatePolicy(topic, rawIds, pool) {
  if (!isContentAdmin()) {
    alert("Only Content Admin can apply integrity governance actions.");
    return;
  }
  const ids = String(rawIds || "")
    .split("|")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!ids.length || !["remedial_pool", "hidden_duplicate"].includes(pool)) return;
  const idSet = new Set(ids);
  const now = new Date().toISOString();
  let updated = 0;
  state.questions.forEach((question) => {
    if (!idSet.has(String(question.id))) return;
    question.practicePool = pool;
    question.topicGovernance = {
      ...(question.topicGovernance || {}),
      topic,
      action: pool === "hidden_duplicate" ? "hide_candidate_clone" : "remedial_candidate_clone",
      updatedAt: now,
      updatedBy: currentAccount()?.id || "content-admin",
    };
    if (pool === "hidden_duplicate") {
      question.publicationStatus = "hidden_duplicate_topic_overflow";
    } else if (question.publicationStatus === "hidden_duplicate_topic_overflow") {
      question.publicationStatus = question.visibility === "private_family" ? "private_auto_reviewed" : "public_candidate_auto_reviewed";
    }
    persistQuestionGovernance(question);
    updated += 1;
  });
  resetStudyAvailabilityCaches();
  saveState();
  hydrateFilters();
  render();
  alert(`${updated} candidate question${updated === 1 ? "" : "s"} moved to ${labelFor(pool)} for topic "${topic}".`);
}

function integrityRowToNormalizedQuestionId(row = {}) {
  if (row.sourceFile !== "opensat-pinesat.json" || row.sourceIndex === undefined || row.sourceIndex === null || !row.id) return "";
  const sourceSection = row.section === "Math" ? "math" : "english";
  return `opensat-${sourceSection}-${Number(row.sourceIndex)}-${row.id}`;
}

function quarantineIntegrityBlockedRows() {
  if (!isContentAdmin()) {
    alert("Only Content Admin can quarantine blocked source rows.");
    return;
  }
  const blockedRows = [
    ...(Array.isArray(questionIntegrityReport?.criticalRows) ? questionIntegrityReport.criticalRows : []),
    ...(Array.isArray(questionIntegrityReport?.blockedRows) ? questionIntegrityReport.blockedRows : []),
  ];
  const blockedIds = new Set(blockedRows.map(integrityRowToNormalizedQuestionId).filter(Boolean));
  const account = currentAccount();
  const now = new Date().toISOString();
  let updated = 0;
  state.questions.forEach((question) => {
    if (!blockedIds.has(String(question.id))) return;
    const entry = SatQuestionAuditEngine.createAdminBlockEntry
      ? SatQuestionAuditEngine.createAdminBlockEntry(question, account, {
          id: `audit-integrity-${question.id}`,
          note: "Question integrity report blocked this OpenSAT row. Keep it out of practice until answer and explanation are corrected.",
          nowIso: now,
        })
      : null;
    if (entry && SatQuestionAuditEngine.applyQuestionAuditBlock) {
      SatQuestionAuditEngine.applyQuestionAuditBlock(question, state.questionAudits, entry);
    } else {
      question.reviewStatus = "needs_review";
      question.visibility = "private_family";
      question.publicationStatus = "audit_blocked";
      question.auditStatus = "blocked";
      question.auditUpdatedAt = now;
    }
    question.practicePool = "hidden_duplicate";
    question.contentAudit = {
      ...(question.contentAudit || {}),
      verdict: "blocked",
      blockedBy: "question-integrity-report",
      checkedAt: now,
      notes: "Blocked by SAT Studio integrity report; verify answer and explanation before use.",
    };
    persistQuestionGovernance(question);
    updated += 1;
  });
  resetStudyAvailabilityCaches();
  saveState();
  hydrateFilters();
  render();
  alert(
    updated
      ? `${updated} loaded blocked source question${updated === 1 ? "" : "s"} quarantined from practice.`
      : "No loaded copies of the blocked source rows were found. The import blocklist is already preventing them from entering practice.",
  );
}

async function ensureArchiveRegistry(renderAfterLoad = false) {
  if (!canAccessPrivateContent()) {
    archiveRegistry = null;
    renderArchiveRegistry();
    return null;
  }
  if (archiveRegistry) {
    if (renderAfterLoad) renderArchiveRegistry();
    return archiveRegistry;
  }
  if (archiveRegistryLoadPromise) return archiveRegistryLoadPromise;

  if (els.archiveRegistrySummary) {
    els.archiveRegistrySummary.className = "archive-registry-summary import-result";
    els.archiveRegistrySummary.innerHTML = "<strong>Loading SAT archive registry...</strong><span>No source document text will be imported.</span>";
  }

  archiveRegistryLoadPromise = (async () => {
    const response = await fetch(PRIVATE_ARCHIVE_REGISTRY_URL);
    if (!response.ok) throw new Error(`Archive registry returned HTTP ${response.status}`);
    archiveRegistry = await response.json();
    if (renderAfterLoad) renderArchiveRegistry();
    return archiveRegistry;
  })()
    .catch((error) => {
      if (els.archiveRegistrySummary) {
        els.archiveRegistrySummary.className = "archive-registry-summary import-result error";
        els.archiveRegistrySummary.innerHTML = `<strong>Could not load SAT archive registry.</strong><span>${escapeHtml(error.message)}</span>`;
      }
      return null;
    })
    .finally(() => {
      archiveRegistryLoadPromise = null;
    });

  return archiveRegistryLoadPromise;
}

function renderArchiveRegistry() {
  if (!els.archiveRegistrySummary || !els.archiveRegistryList) return;
  if (!canAccessPrivateContent()) {
    els.archiveRegistrySummary.className = "archive-registry-summary empty-state";
    els.archiveRegistrySummary.textContent = "Private archive metadata is hidden from public accounts.";
    els.archiveRegistryList.className = "archive-registry-list empty-state";
    els.archiveRegistryList.textContent = "Public accounts cannot view private SAT archive files.";
    return;
  }
  if (!archiveRegistry) {
    els.archiveRegistrySummary.className = "archive-registry-summary empty-state";
    els.archiveRegistrySummary.textContent = "Load the archive registry to see the 35 source files.";
    els.archiveRegistryList.className = "archive-registry-list empty-state";
    els.archiveRegistryList.textContent = "No archive files loaded yet.";
    return;
  }

  const docs = Array.isArray(archiveRegistry.documents) ? archiveRegistry.documents : [];
  const summary = archiveRegistry.summary || {};
  const highRisk = summary.riskCounts?.High || docs.filter((doc) => doc.risk === "High").length;
  const mediumRisk = summary.riskCounts?.Medium || docs.filter((doc) => doc.risk === "Medium").length;
  const generatedTotal = docs.reduce((total, doc) => total + getDraftsForSourceReference(doc.path).length, 0);
  const vaultTotal = docs.reduce((total, doc) => total + getVaultQuestionsForSourceReference(doc.path).length, 0);
  const docsWithStats = docs.map((doc) => ({
    ...doc,
    fileName: fileNameFromPath(doc.path),
    stats: getSourceReferenceDraftStats(doc.path),
    vaultCount: getVaultQuestionsForSourceReference(doc.path).length,
  }));

  els.archiveRegistrySummary.className = "archive-registry-summary";
  els.archiveRegistrySummary.innerHTML = SatAdminViewRenderers.renderArchiveRegistrySummary
    ? SatAdminViewRenderers.renderArchiveRegistrySummary(archiveRegistry, { generatedTotal, highRisk, mediumRisk, vaultTotal })
    : "";

  els.archiveRegistryList.className = "archive-registry-list";
  els.archiveRegistryList.innerHTML = SatAdminViewRenderers.renderArchiveRegistryList
    ? SatAdminViewRenderers.renderArchiveRegistryList(docsWithStats, { labelFor })
    : "";

  document.querySelectorAll(".archive-use-signal").forEach((button) => {
    button.addEventListener("click", async () => {
      const signal = await ensureArchiveSignalForReference(button.dataset.sourceReference);
      if (!signal) return;
      switchView("author");
      useSignalForDraft(signal);
    });
  });
  document.querySelectorAll(".archive-vault-intake").forEach((button) => {
    button.addEventListener("click", () => {
      const doc = docs.find((item) => item.path === button.dataset.sourceReference);
      startVaultIntakeForDocument(doc || { path: button.dataset.sourceReference });
    });
  });
}

function fileNameFromPath(path = "") {
  if (SatImportEngine.fileNameFromPath) return SatImportEngine.fileNameFromPath(path);
  return String(path).split(/[\\/]/).filter(Boolean).pop() || "Archive source";
}

function getDraftsForSourceReference(sourceReference) {
  if (SatAuthoringEngine.draftsForSourceReference) return SatAuthoringEngine.draftsForSourceReference(sourceReference, state.questions);
  if (!sourceReference) return [];
  return state.questions.filter((question) => question.sourceType === "ai_generated" && question.sourceReference === sourceReference);
}

function getVaultQuestionsForSourceReference(sourceReference) {
  if (SatImportEngine.vaultQuestionsForSourceReference) return SatImportEngine.vaultQuestionsForSourceReference(sourceReference, state.questions);
  if (!sourceReference) return [];
  return state.questions.filter((question) => question.sourceType === "private_vault" && question.sourceReference === sourceReference);
}

function getSourceReferenceDraftStats(sourceReference) {
  if (SatAuthoringEngine.sourceReferenceDraftStats) return SatAuthoringEngine.sourceReferenceDraftStats(sourceReference, state.questions);
  const linked = getDraftsForSourceReference(sourceReference);
  return {
    total: linked.length,
    needsReview: linked.filter((question) => question.reviewStatus === "needs_review").length,
    reviewed: linked.filter((question) => question.reviewStatus === "reviewed").length,
    rejected: linked.filter((question) => question.reviewStatus === "rejected").length,
  };
}

async function ensureArchiveSignalForReference(sourceReference) {
  if (!sourceReference) return null;
  const existing = (state.sourceSignals || []).find((signal) => signal.sourceReference === sourceReference);
  if (existing) return existing;

  const response = await fetch(PRIVATE_ARCHIVE_SIGNALS_URL);
  if (!response.ok) {
    alert(`Could not load archive signals: HTTP ${response.status}`);
    return null;
  }
  const data = await response.json();
  const rawSignal = (Array.isArray(data.signals) ? data.signals : []).find((signal) => signal.sourceReference === sourceReference);
  if (!rawSignal) {
    alert("No source signal was found for this archive file.");
    return null;
  }
  const signal = normalizeSourceSignal({
    ...rawSignal,
    protectedTextExcluded: true,
    risk: sourceKindRisk(rawSignal.sourceKind || "other"),
    createdBy: currentAccount()?.id || "content-admin",
  });
  if (!Array.isArray(state.sourceSignals)) state.sourceSignals = [];
  state.sourceSignals.unshift(signal);
  saveState();
  renderSourceSignals();
  renderArchiveRegistry();
  return signal;
}

async function fetchOpenSatQuestions() {
  if (els.fetchOpensat) {
    els.fetchOpensat.disabled = true;
    els.fetchOpensat.textContent = "Loading local data...";
  }
  try {
    const before = state.questions.filter((q) => q.sourceType === "opensat").length;
    const after = await ensureLocalOpenSatBank(false);
    alert(`OpenSAT/PineSAT local bank ready: ${after} questions (${Math.max(after - before, 0)} newly loaded).`);
  } catch (error) {
    alert(`Local OpenSAT/PineSAT import failed. Paste JSON manually instead. ${error.message}`);
  } finally {
    if (els.fetchOpensat) {
      els.fetchOpensat.disabled = false;
      els.fetchOpensat.textContent = "Load Local OpenSAT";
    }
    saveState();
    render();
  }
}

function importJsonQuestions() {
  if (!isContentAdmin()) {
    alert("Only Content Admin can import question banks.");
    return;
  }
  try {
    const data = JSON.parse(els.jsonImport.value);
    const imported = importQuestionRecords(data, { defaultSourceName: "Manual JSON Import" });
    els.jsonImport.value = "";
    saveState();
    render();
    alert(`Imported ${imported} questions.`);
  } catch (error) {
    alert(`Invalid JSON: ${error.message}`);
  }
}

function importQuestionBankFile(event) {
  if (!isContentAdmin()) {
    alert("Only Content Admin can import question bank files.");
    event.target.value = "";
    return;
  }

  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const forcePrivateVault = Boolean(els.bankPrivateVaultMode?.checked);
      const importOptions = SatImportEngine.buildBankImportOptions({
        fileName: file.name,
        forcePrivateVault,
        activeVaultSourceName: activeVaultImportSourceName,
        activeVaultSourceReference: activeVaultImportSourceReference,
      });
      const imported = importQuestionRecords(data, importOptions);
      saveState();
      render();
      const result = SatImportEngine.buildBankImportResult({
        imported,
        fileName: file.name,
        forcePrivateVault,
        activeVaultSourceReference: activeVaultImportSourceReference,
      });
      els.bankImportResult.className = "import-result";
      els.bankImportResult.innerHTML = SatAdminViewRenderers.renderBankImportResult(result);
    } catch (error) {
      els.bankImportResult.className = "import-result error";
      els.bankImportResult.textContent = `Import failed: ${error.message}`;
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function startVaultIntakeForDocument(doc = {}) {
  if (!isContentAdmin()) {
    alert("Only Content Admin can prepare Vault intake.");
    return;
  }
  const intake = SatImportEngine.buildVaultIntakeState(doc);
  activeVaultImportSourceReference = intake.sourceReference || "";
  activeVaultImportSourceName = intake.sourceName || "Private Vault Source";
  switchView("bank");
  if (els.bankPrivateVaultMode) els.bankPrivateVaultMode.checked = true;
  if (els.bankImportResult) {
    els.bankImportResult.className = "import-result";
    els.bankImportResult.innerHTML = SatAdminViewRenderers.renderVaultIntakeReady(intake);
  }
  renderVaultMode();
}

function renderVaultMode() {
  if (!els.vaultSummary || !els.startVaultPractice) return;
  const vaultQuestions = canAccessPrivateContent() ? visibleQuestionBank().filter((question) => question.sourceType === "private_vault") : [];
  const summary = SatImportEngine.buildVaultSummary(vaultQuestions, {
    canAccessPrivateContent: canAccessPrivateContent(),
    activeVaultSourceReference: activeVaultImportSourceReference,
  });
  els.vaultSummary.className = summary.className;
  els.vaultSummary.innerHTML = SatAdminViewRenderers.renderVaultSummary(summary);
  els.startVaultPractice.disabled = summary.startDisabled;
}

function startVaultPractice() {
  const vaultQuestions = visibleQuestionBank().filter((question) => question.sourceType === "private_vault" && question.reviewStatus !== "rejected");
  if (!vaultQuestions.length) {
    alert("No Private Family Vault questions are available yet.");
    return;
  }
  startScopedPractice({ section: "All", domain: "All", skill: "All", difficulty: "All", source: "private_vault" });
}

async function inspectPdfFile(event) {
  if (!isContentAdmin()) {
    alert("Only Content Admin can inspect PDF question sources.");
    event.target.value = "";
    return;
  }

  const file = event.target.files?.[0];
  if (!file) return;
  const pendingModel = SatImportEngine.buildPdfInspectPending(file);
  els.pdfImportResult.className = "pdf-workflow";
  els.pdfImportResult.innerHTML = SatAdminViewRenderers.renderPdfInspectPending(pendingModel);

  try {
    const response = await fetch("/api/pdf-inspect", {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
        "X-Filename": encodeURIComponent(file.name),
      },
      body: file,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `PDF inspection returned ${response.status}`);
    lastPdfInspection = data;
    renderPdfInspection(data);
  } catch (error) {
    lastPdfInspection = null;
    const errorModel = SatImportEngine.buildPdfInspectError(file, error);
    els.pdfImportResult.className = "pdf-workflow warning";
    els.pdfImportResult.innerHTML = SatAdminViewRenderers.renderPdfInspectError(errorModel);
  } finally {
    event.target.value = "";
  }
}

function renderPdfInspection(data) {
  const model = SatImportEngine.buildPdfInspectionModel(data);
  els.pdfImportResult.className = model.className;
  els.pdfImportResult.innerHTML = SatAdminViewRenderers.renderPdfInspection(model);
  const logButton = document.getElementById("log-pdf-metadata");
  if (logButton) logButton.addEventListener("click", logPdfMetadataOnly);
}

function logPdfMetadataOnly() {
  if (!lastPdfInspection) return;
  const p = profile();
  const log = SatImportEngine.buildOfficialPdfLog(lastPdfInspection, {
    nowMs: Date.now(),
    nowIso: new Date().toISOString(),
  });
  p.officialLogs.unshift(log);
  saveState();
  renderOfficialLogs();
  renderDashboard();
  els.pdfImportResult.insertAdjacentHTML("beforeend", '<span class="success-line">Saved to Official Log as metadata only.</span>');
}

function importQuestionRecords(data, options = {}) {
  const importer = typeof SatQuestionImport !== "undefined" ? SatQuestionImport : null;
  const records = importer?.extractQuestionRecords
    ? importer.extractQuestionRecords(data)
    : Array.isArray(data) ? data : Array.isArray(data.questions) ? data.questions : [];
  if (!records.length) throw new Error("Expected an array or an object with a questions array.");

  const existingIds = new Set(state.questions.map((q) => q.id));
  let imported = 0;

  records.forEach((record, index) => {
    const normalized = normalizeQuestionRecord(record, index, options);
    if (!normalized || existingIds.has(normalized.id)) return;
    applyQuestionGovernance(normalized);
    state.questions.push(normalized);
    existingIds.add(normalized.id);
    imported += 1;
  });

  if (imported) touchQuestionBank();
  return imported;
}

function normalizeReviewStatus(value) {
  const importer = typeof SatQuestionImport !== "undefined" ? SatQuestionImport : null;
  if (importer?.normalizeReviewStatus) return importer.normalizeReviewStatus(value);
  if (["needs_review", "reviewed", "rejected"].includes(value)) return value;
  if (value === "ready" || value === "approved") return "needs_review";
  return "needs_review";
}

function normalizeQuestionRecord(record, index, options = {}) {
  const importer = typeof SatQuestionImport !== "undefined" ? SatQuestionImport : null;
  if (importer?.normalizeQuestionRecord) {
    return importer.normalizeQuestionRecord(record, index, {
      ...options,
      antigravitySourceSignalId: ANTIGRAVITY_SOURCE_SIGNAL_ID,
      generatedContentAuditVersion: GENERATED_CONTENT_AUDIT_VERSION,
      openSatImportAuditVersion: OPEN_SAT_IMPORT_AUDIT_VERSION,
      questionReviews: state.questionReviews,
    });
  }
  if (record.question && typeof record.question === "object") {
    return normalizeOpenSatQuestion(record, index);
  }

  const choices = record.choices || {};
  const correctAnswer = record.correctAnswer || record.correct_answer;
  const questionType = normalizeQuestionType(record);
  const gridIn = questionType === "student_produced_response";
  if (!record.prompt || !correctAnswer) return null;
  if (!gridIn && !choices) return null;
  const forcePrivateVault = Boolean(options.forcePrivateVault || record.sourceType === "private_vault");
  const sourceType = forcePrivateVault ? "private_vault" : record.sourceType === "antigravity" ? "antigravity" : record.sourceType || "original";
  const antigravityRecord = sourceType === "antigravity";
  const normalizedChoices = gridIn
    ? {}
    : {
        A: choices.A,
        B: choices.B,
        C: choices.C,
        D: choices.D,
      };

  return {
    id: record.id || `bank-${Date.now()}-${index}`,
    section: record.section || inferSection(record.domain),
    domain: record.domain || "Imported",
    skill: record.skill || record.domain || "Imported",
    difficulty: record.difficulty || "Medium",
    sourceType,
    sourceName: record.sourceName || options.defaultSourceName || "Imported Question Bank",
    sourceReference: record.sourceReference || options.defaultSourceReference || "",
    sourceSignalId: record.sourceSignalId || (antigravityRecord ? ANTIGRAVITY_SOURCE_SIGNAL_ID : null),
    sourceQuestionIndex: record.sourceQuestionIndex || null,
    generationEngine: record.generationEngine || (antigravityRecord ? "antigravity" : ""),
    generationBrief: record.generationBrief || "",
    licenseNote: forcePrivateVault
      ? record.licenseNote || "Private family study copy. Do not publish, share, or include in public release/export."
      : antigravityRecord
        ? record.licenseNote || "Antigravity-generated draft; private review candidate until SAT Studio schema, answer, and duplicate checks pass."
      : record.licenseNote || "Imported content; needs source/license review before public use.",
    reviewStatus: normalizeReviewStatus(record.reviewStatus),
    publicationStatus: forcePrivateVault ? "private_family_only" : antigravityRecord ? record.publicationStatus || "private_similarity_review" : record.publicationStatus || "",
    autoCheck: record.autoCheck || null,
    contentAudit: record.contentAudit || (antigravityRecord
      ? {
          version: GENERATED_CONTENT_AUDIT_VERSION,
          verdict: "needs_review",
          checkedAt: "2026-05-17",
          notes: "Imported from Antigravity worker. SAT Studio requires human answer review plus duplicate/similarity scan before broader use.",
        }
      : null),
    templateDiversity: record.templateDiversity || null,
    practicePool: record.practicePool || record.skeletonDiversity?.practicePool || "core_pool",
    skeletonDiversity: record.skeletonDiversity || null,
    validator: record.validator || null,
    expectedAnswer: record.expectedAnswer || record.autoCheck?.expectedAnswer || null,
    questionType,
    acceptableAnswers: gridIn ? normalizeAcceptableAnswers(record.acceptableAnswers || record.acceptedAnswers || record.answers || correctAnswer) : [],
    answerFormat: gridIn ? record.answerFormat || "numeric" : "multiple_choice",
    visibility: forcePrivateVault ? "private_family" : antigravityRecord ? "private_family" : record.visibility || inferQuestionVisibility(record),
    neverPublic: forcePrivateVault ? true : antigravityRecord ? Boolean(record.neverPublic) : Boolean(record.neverPublic),
    prompt: record.prompt,
    choices: normalizedChoices,
    correctAnswer,
    explanation: record.explanation || "No explanation provided.",
  };
}

function normalizeQuestionType(record = {}) {
  if (SatQuestionImport.normalizeQuestionType) return SatQuestionImport.normalizeQuestionType(record);
  const raw = String(record.questionType || record.responseType || record.answerFormat || "").toLowerCase();
  if (["student_produced_response", "student-produced-response", "grid_in", "grid-in", "numeric"].includes(raw)) {
    return "student_produced_response";
  }
  return "multiple_choice";
}

function normalizeAcceptableAnswers(value) {
  if (SatQuestionImport.normalizeAcceptableAnswers) return SatQuestionImport.normalizeAcceptableAnswers(value);
  const rows = Array.isArray(value) ? value : [value];
  return rows.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function inferQuestionVisibility(record) {
  if (SatQuestionImport.inferQuestionVisibility) return SatQuestionImport.inferQuestionVisibility(record);
  const sourceType = record.sourceType || "";
  if (["private_vault", "antigravity", "college_board", "cracksat_reference"].includes(sourceType)) return "private_family";
  return record.visibility || "public_candidate";
}

function importOpenSatArray(data) {
  if (!Array.isArray(data)) throw new Error("Expected a JSON array.");
  const existingIds = new Set(state.questions.map((q) => q.id));
  const existingPrompts = new Set(state.questions.map((q) => normalizePromptForImport(q.prompt || "")));
  let imported = 0;

  data.forEach((item, index) => {
    const rawKey = `${item?._satStudioSourceSection || ""}|${item?.id || ""}|${index}`;
    if (openSatIntegrityBlocklist.has(rawKey)) return;
    const normalized = normalizeOpenSatQuestion(item, index);
    if (!normalized || existingIds.has(normalized.id)) return;
    const promptKey = normalizePromptForImport(normalized.prompt);
    if (existingPrompts.has(promptKey)) return;
    applyQuestionGovernance(normalized);
    state.questions.push(normalized);
    existingIds.add(normalized.id);
    existingPrompts.add(promptKey);
    imported += 1;
  });

  if (imported) touchQuestionBank();
  return imported;
}

function normalizeOpenSatQuestion(item, index) {
  if (SatQuestionImport.normalizeOpenSatQuestion) {
    return SatQuestionImport.normalizeOpenSatQuestion(item, index, {
      openSatImportAuditVersion: OPEN_SAT_IMPORT_AUDIT_VERSION,
      questionReviews: state.questionReviews,
    });
  }
  const q = item.question || {};
  const choices = q.choices || item.choices;
  const correctAnswer = q.correct_answer || q.correctAnswer || item.correct_answer || item.correctAnswer;
  const sourceSection = item._satStudioSourceSection || item.section || "";
  const normalizedId = `opensat-${sourceSection || "unknown"}-${index}-${item.id || "item"}`;
  const promptParts = [q.paragraph, q.question || item.prompt || item.question].filter(
    (part) => part && part !== "null",
  );

  if (!choices || !correctAnswer || !promptParts.length) return null;
  if (!["A", "B", "C", "D"].every((key) => String(choices[key] || "").trim())) return null;
  const choiceValues = ["A", "B", "C", "D"].map((key) => String(choices[key]).trim().toLowerCase());
  if (new Set(choiceValues).size < 4) return null;

  const reviewStatus = state.questionReviews?.[normalizedId] || normalizeReviewStatus(item.reviewStatus);
  return {
    id: normalizedId,
    section: sourceSection === "math" ? "Math" : sourceSection === "english" ? "Reading and Writing" : inferSection(item.domain || item.section),
    domain: item.domain || "Imported",
    skill: item.skill || inferOpenSatSkill(item),
    difficulty: item.difficulty || "Medium",
    sourceType: "opensat",
    sourceName: "OpenSAT / PineSAT local snapshot",
    licenseNote: "Local OpenSAT/PineSAT snapshot; needs review before public use.",
    reviewStatus,
    publicationStatus: item.publicationStatus || "",
    contentAudit: item.contentAudit || {
      version: OPEN_SAT_IMPORT_AUDIT_VERSION,
      verdict: "needs_review",
      checkedAt: "2026-05-17",
      notes: "Duplicate prompts and duplicate A-D choices filtered during local import. External dataset still needs human review before public use.",
    },
    practicePool: item.practicePool || item.skeletonDiversity?.practicePool || "core_pool",
    skeletonDiversity: item.skeletonDiversity || null,
    prompt: promptParts.join("\n\n"),
    choices: {
      A: choices.A,
      B: choices.B,
      C: choices.C,
      D: choices.D,
    },
    correctAnswer,
    explanation: q.explanation || item.explanation || "No explanation provided.",
  };
}

function normalizePromptForImport(prompt = "") {
  if (SatQuestionImport.normalizePromptForImport) return SatQuestionImport.normalizePromptForImport(prompt);
  return String(prompt).toLowerCase().replace(/\s+/g, " ").trim();
}

function inferSection(domain = "") {
  if (SatQuestionImport.inferSection) return SatQuestionImport.inferSection(domain);
  const mathDomains = ["Algebra", "Advanced Math", "Problem-Solving", "Geometry", "Trigonometry"];
  return mathDomains.some((term) => String(domain).toLowerCase().includes(term.toLowerCase()))
    ? "Math"
    : "Reading and Writing";
}

function inferOpenSatSkill(item) {
  if (SatQuestionImport.inferOpenSatSkill) return SatQuestionImport.inferOpenSatSkill(item);
  const domain = item.domain || "Imported";
  const q = item.question || {};
  const text = [domain, q.paragraph, q.question, q.explanation, Object.values(q.choices || {}).join(" ")]
    .join(" ")
    .toLowerCase();

  if (domain === "Standard English Conventions") {
    if (hasAny(text, ["comma", "semicolon", "colon", "dash", "punctuation", "independent clause", "clauses"])) return "Boundaries";
    if (hasAny(text, ["verb", "subject", "pronoun", "modifier", "possessive", "plural", "singular", "tense"])) return "Form, structure, and sense";
    return "Standard English conventions mixed";
  }
  if (domain === "Expression of Ideas") {
    if (hasAny(text, ["transition", "logical", "however", "therefore", "nevertheless", "similarly", "consequently"])) return "Transitions";
    if (hasAny(text, ["student wants", "notes", "synthesize", "accomplish this goal", "relevant information"])) return "Rhetorical Synthesis";
    return "Expression of ideas mixed";
  }
  if (domain === "Information and Ideas") {
    if (hasAny(text, ["main idea", "central", "best states", "summarizes", "primarily"])) return "Central Ideas and Details";
    if (hasAny(text, ["inference", "infer", "suggests", "implies", "most likely"])) return "Inferences";
    if (hasAny(text, ["support", "evidence", "claim", "finding", "data", "table", "graph"])) return "Command of Evidence";
    return "Information and ideas mixed";
  }
  if (domain === "Craft and Structure") {
    if (hasAny(text, ["word", "phrase", "meaning", "context", "most nearly", "precise", "complete the text"])) return "Words in Context";
    if (hasAny(text, ["function", "purpose", "structure", "overall", "paragraph"])) return "Text Structure and Purpose";
    if (hasAny(text, ["text 1", "text 2", "would respond", "both texts"])) return "Cross-Text Connections";
    return "Craft and structure mixed";
  }
  if (domain === "Algebra") {
    if (hasAny(text, ["system", "simultaneous"])) return "Systems of linear equations";
    if (hasAny(text, ["slope", "linear function", "line", "y-intercept", "intercept"])) return "Linear functions and slope";
    if (hasAny(text, ["inequality", "less than", "greater than", "at least", "at most"])) return "Linear inequalities";
    return "Linear equations in one variable";
  }
  if (domain === "Advanced Math") {
    if (hasAny(text, ["quadratic", "parabola", "vertex", "x^2", "x²"])) return "Quadratic equations";
    if (hasAny(text, ["exponential", "growth", "decay", "doubles", "halves"])) return "Exponential functions";
    if (hasAny(text, ["equivalent", "factor", "polynomial", "rational expression", "simplify"])) return "Equivalent expressions";
    return "Nonlinear equations and functions";
  }
  if (domain === "Problem-Solving and Data Analysis") {
    if (hasAny(text, ["percent", "%", "increase", "decrease", "discount"])) return "Percentages";
    if (hasAny(text, ["rate", "unit", "per", "ratio", "proportion"])) return "Rates and units";
    if (hasAny(text, ["mean", "median", "range", "standard deviation", "survey", "sample"])) return "Statistics";
    if (hasAny(text, ["probability", "random", "chance"])) return "Probability";
    return "Data interpretation";
  }
  if (domain === "Geometry and Trigonometry") {
    if (hasAny(text, ["circle", "radius", "diameter", "arc", "circumference"])) return "Circles";
    if (hasAny(text, ["right triangle", "sine", "cosine", "tangent", "hypotenuse"])) return "Right triangles and trigonometry";
    if (hasAny(text, ["area", "volume", "surface area"])) return "Area and volume";
    if (hasAny(text, ["angle", "triangle", "parallel", "similar"])) return "Lines, angles, and triangles";
    return "Geometry mixed";
  }
  return domain || "Imported";
}

function hasAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function officialLogTargetAccounts() {
  const account = currentAccount();
  if (!account) return [];
  if (["admin", "parent"].includes(account.role)) return linkedStudentAccountsFor(account);
  return [account];
}

function selectedOfficialLogAccount() {
  const targets = officialLogTargetAccounts();
  if (!targets.length) return currentAccount();
  const selectedId = els.officialStudent?.value || "";
  return targets.find((item) => item.id === selectedId) || targets[0];
}

function renderOfficialLogStudentPicker() {
  if (!els.officialStudent || !els.officialStudentField) return;
  const account = currentAccount();
  const targets = officialLogTargetAccounts();
  const shouldShow = Boolean(account && ["admin", "parent"].includes(account.role));
  els.officialStudentField.hidden = !shouldShow;
  if (!shouldShow) return;
  const current = els.officialStudent.value;
  els.officialStudent.innerHTML = targets.length
    ? targets.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name || item.id)}</option>`).join("")
    : '<option value="">No linked student</option>';
  els.officialStudent.value = targets.some((item) => item.id === current) ? current : targets[0]?.id || "";
}

function addOfficialLog(event) {
  event.preventDefault();
  const target = selectedOfficialLogAccount();
  if (!target) {
    alert("No linked student is available for this official practice log.");
    return;
  }
  const p = accountProfile(target.id);
  const totalScore = Number(els.officialTotalScore?.value || 0);
  const rwScore = Number(els.officialRwScore?.value || 0);
  const mathScore = Number(els.officialMathScore?.value || 0);
  p.officialLogs.unshift({
    id: `official-${Date.now()}`,
    studentId: target.id,
    studentName: target.name || target.id,
    source: els.officialSource.value,
    section: els.officialSection.value,
    totalScore: totalScore > 0 ? totalScore : 0,
    rwScore: rwScore > 0 ? rwScore : 0,
    mathScore: mathScore > 0 ? mathScore : 0,
    skill: els.officialSkill.value.trim(),
    reference: els.officialRef.value.trim(),
    result: els.officialResult.value,
    note: els.officialNote.value.trim(),
    at: new Date().toISOString(),
  });
  const selectedTargetId = els.officialStudent?.value || "";
  els.officialForm.reset();
  if (els.officialStudent && selectedTargetId) els.officialStudent.value = selectedTargetId;
  saveState();
  renderOfficialLogs();
  renderDashboard();
}

function renderOfficialLogs() {
  renderOfficialLogStudentPicker();
  renderStudentOfficialCoach();
  applyStudentOfficialCopy();
  const target = selectedOfficialLogAccount();
  const logs = target ? accountProfile(target.id).officialLogs : [];
  if (!logs.length) {
    els.officialList.innerHTML =
      currentAccount()?.role === "student" && state.language === "vi"
        ? '<div class="empty-state">Chưa có log bài official. Chỉ ghi test/module/kỹ năng/kết quả, không paste câu hỏi official.</div>'
        : '<div class="empty-state">No official practice logs yet. Add metadata only, not official question text.</div>';
    return;
  }

  els.officialList.innerHTML = logs
    .map(
      (log) => {
        const scoreLine = officialScoreLine(log);
        return `
        <div class="list-item">
          <h3>${escapeHtml(log.source)} · ${escapeHtml(studentUiLabel(log.result))}</h3>
          <p>${escapeHtml(log.section)} · ${escapeHtml(log.skill || (state.language === "vi" ? "Chưa ghi kỹ năng" : "No skill"))} · ${escapeHtml(log.reference || (state.language === "vi" ? "Chưa ghi mã bài" : "No reference"))}</p>
          <p>${escapeHtml(log.note || (state.language === "vi" ? "Chưa có ghi chú." : "No note."))}</p>
          ${scoreLine ? `<p class="official-score-line">${escapeHtml(scoreLine)}</p>` : ""}
        </div>
      `;
      },
    )
    .join("");
}

function officialScoreLine(log = {}) {
  const totalScore = Number(log.totalScore || 0);
  const rwScore = Number(log.rwScore || 0);
  const mathScore = Number(log.mathScore || 0);
  const parts = [];
  if (totalScore > 0) parts.push(`Total ${totalScore}`);
  if (rwScore > 0) parts.push(`RW ${rwScore}`);
  if (mathScore > 0) parts.push(`Math ${mathScore}`);
  return parts.join(" · ");
}

function officialTrendModel(logs = []) {
  const scored = (Array.isArray(logs) ? logs : [])
    .map((log) => {
      const rwScore = Number(log.rwScore || 0);
      const mathScore = Number(log.mathScore || 0);
      const totalScore = Number(log.totalScore || 0) || (rwScore > 0 && mathScore > 0 ? rwScore + mathScore : 0);
      return {
        ...log,
        totalScore,
        rwScore,
        mathScore,
      };
    })
    .filter((log) => Number(log.totalScore || 0) > 0)
    .sort((a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0));
  const latest = scored[0] || null;
  const previous = scored[1] || null;
  const delta = latest && previous ? Number(latest.totalScore || 0) - Number(previous.totalScore || 0) : null;
  return { latest, previous, delta, scoredCount: scored.length };
}

function renderStudentOfficialCoach() {
  if (!els.studentOfficialCoach) return;
  if (currentAccount()?.role !== "student") {
    els.studentOfficialCoach.hidden = true;
    els.studentOfficialCoach.innerHTML = "";
    return;
  }
  const vi = state.language === "vi";
  const logs = profile().officialLogs || [];
  const wrong = logs.filter((log) => log.result === "wrong" || log.result === "uncertain").length;
  const trend = officialTrendModel(logs);
  const latestScore = trend.latest ? String(trend.latest.totalScore) : "--";
  const trendLabel =
    trend.delta === null ? (vi ? "Cần 2 lần" : "Need 2") : trend.delta > 0 ? `+${trend.delta}` : String(trend.delta);
  const trendText = trend.latest
    ? vi
      ? `Mốc mới nhất: ${trend.latest.totalScore}. ${
          trend.delta === null ? "Thêm một lần nữa để thấy xu hướng." : `So với lần trước: ${trendLabel}.`
        }`
      : `Latest score: ${trend.latest.totalScore}. ${
          trend.delta === null ? "Add one more score to see the trend." : `Change from previous: ${trendLabel}.`
        }`
    : vi
      ? "Chưa có điểm official. Ghi điểm tổng/RW/Math sau mỗi Bluebook hoặc Khan full test."
      : "No official score yet. Log total/RW/Math after each Bluebook or Khan full test.";
  els.studentOfficialCoach.hidden = false;
  els.studentOfficialCoach.innerHTML = `
    <section class="student-official-coach-inner">
      <div>
        <p class="eyebrow">${vi ? "Bài official" : "Official practice"}</p>
        <h3>${logs.length ? (vi ? `${logs.length} log đã lưu` : `${logs.length} saved log(s)`) : (vi ? "Ghi kết quả Bluebook/Khan" : "Log Bluebook/Khan results")}</h3>
        <p>${vi ? "Chọn một trong hai cách: log điểm bài thi hoặc log lỗi theo skill. Chỉ lưu metadata, không copy nguyên văn câu hỏi official." : "Use one of two modes: log a test score or log a skill mistake. Save metadata only; do not copy official question text."}</p>
      </div>
      <div class="student-official-stats">
        <div><strong>${logs.length}</strong><span>log</span></div>
        <div><strong>${wrong}</strong><span>${vi ? "cần ôn" : "to review"}</span></div>
        <div><strong>${escapeHtml(latestScore)}</strong><span>${vi ? "điểm mới nhất" : "latest score"}</span></div>
        <div><strong>${escapeHtml(trendLabel)}</strong><span>${vi ? "xu hướng" : "trend"}</span></div>
      </div>
      <div class="student-official-trend">
        <strong>${vi ? "Theo dõi tiến bộ" : "Progress trend"}</strong>
        <span>${escapeHtml(trendText)}</span>
      </div>
      <div class="student-official-modes">
        <span><strong>${vi ? "Log điểm bài thi" : "Log test score"}</strong><small>${vi ? "Ghi nguồn, dạng bài, điểm tổng/RW/Math." : "Record source, test type, and total/RW/Math scores."}</small></span>
        <span><strong>${vi ? "Log lỗi theo skill" : "Log skill mistake"}</strong><small>${vi ? "Ghi skill, kết quả, nguyên nhân sai." : "Record skill, result, and mistake cause."}</small></span>
      </div>
    </section>
  `;
}

function applyStudentOfficialCopy() {
  if (currentAccount()?.role !== "student") return;
  const vi = state.language === "vi";
  const heading = document.querySelector("#view-official > .section-heading");
  if (heading) {
    const eyebrow = heading.querySelector(".eyebrow");
    const title = heading.querySelector("h2");
    if (eyebrow) eyebrow.textContent = vi ? "Không copy đề official" : "Do not copy official questions";
    if (title) title.textContent = vi ? "Nhật ký bài official" : "Official practice log";
  }
  [
    ["official-source", vi ? "Nguồn" : "Source"],
    ["official-section", vi ? "Phần thi" : "Section"],
    ["official-total-score", vi ? "Điểm tổng" : "Total score"],
    ["official-rw-score", vi ? "Điểm RW" : "RW score"],
    ["official-math-score", vi ? "Điểm Math" : "Math score"],
    ["official-skill", vi ? "Kỹ năng" : "Skill"],
    ["official-ref", vi ? "Mã bài / module" : "Test / module reference"],
    ["official-result", vi ? "Kết quả" : "Result"],
    ["official-note", vi ? "Ghi chú lỗi sai" : "Mistake note"],
  ].forEach(([id, text]) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = text;
  });
  localizeSelectOptions(els.officialSource);
  localizeSelectOptions(els.officialSection);
  localizeSelectOptions(els.officialResult);
  const submit = els.officialForm?.querySelector('button[type="submit"]');
  if (submit) submit.textContent = vi ? "Lưu log" : "Save log";
  if (els.officialTotalScore) els.officialTotalScore.placeholder = vi ? "Ví dụ: 1320" : "e.g. 1320";
  if (els.officialRwScore) els.officialRwScore.placeholder = vi ? "Ví dụ: 650" : "e.g. 650";
  if (els.officialMathScore) els.officialMathScore.placeholder = vi ? "Ví dụ: 670" : "e.g. 670";
  els.officialSkill.placeholder = vi ? "Boundaries, Linear functions..." : "Boundaries, linear functions...";
  els.officialRef.placeholder = vi ? "Bluebook Test 4, Module 1, Q12" : "Bluebook Test 4, Module 1, Q12";
  els.officialNote.placeholder = vi ? "Không paste đề. Ghi lỗi: đọc thiếu điều kiện, chọn bẫy, sai công thức..." : "Do not paste the question. Note the issue: missed condition, trap answer, wrong formula...";
}

function saveSourceSignal() {
  const result = SatAuthoringEngine.buildSourceSignalDraft
    ? SatAuthoringEngine.buildSourceSignalDraft(
        {
          sourceKind: els.signalSourceKind.value,
          sourceReference: els.signalReference.value,
          section: els.signalSection.value,
          domain: els.signalDomain.value,
          skill: els.signalSkill.value,
          difficulty: els.signalDifficulty.value,
          mistakePattern: els.signalMistakePattern.value,
          learningGoal: els.signalLearningGoal.value,
          protectedTextExcluded: els.signalNoProtectedText.checked,
        },
        {
          accountId: currentAccount()?.id || "unknown",
          canAccessPrivateContent: canAccessPrivateContent(),
          canAuthorQuestions: canAuthorQuestions(),
          isContentAdmin: isContentAdmin(),
          nowMs: Date.now(),
          nowIso: new Date().toISOString(),
        },
      )
    : null;
  if (result && !result.ok) {
    alert(result.reason);
    return;
  }

  const signal =
    result?.signal ||
    normalizeSourceSignal({
      id: `signal-${Date.now()}`,
      sourceKind: els.signalSourceKind.value,
      sourceReference: els.signalReference.value.trim(),
      section: els.signalSection.value,
      domain: els.signalDomain.value.trim() || (els.signalSection.value === "Math" ? "Algebra" : "Information and Ideas"),
      skill: els.signalSkill.value.trim() || (els.signalSection.value === "Math" ? "Linear equations in one variable" : "Inferences"),
      difficulty: els.signalDifficulty.value,
      mistakePattern: els.signalMistakePattern.value.trim(),
      learningGoal: els.signalLearningGoal.value.trim(),
      risk: sourceKindRisk(els.signalSourceKind.value),
      protectedTextExcluded: els.signalNoProtectedText.checked,
      createdBy: currentAccount()?.id || "unknown",
    });

  if (!Array.isArray(state.sourceSignals)) state.sourceSignals = [];
  state.sourceSignals.unshift(signal);
  activeSourceSignalId = signal.id;
  applySignalToAiForm(signal);
  saveState();
  renderSourceSignals();
}

function renderSourceSignals() {
  if (!els.sourceSignalList) return;
  const privateAccess = canAccessPrivateContent();
  if (!privateAccess && SatAdminViewRenderers.renderSourceSignalList) {
    const rendered = SatAdminViewRenderers.renderSourceSignalList([], { canAccessPrivateContent: false });
    els.sourceSignalList.className = rendered.className;
    els.sourceSignalList.innerHTML = rendered.html;
    localizeDynamicUiText(els.sourceSignalList);
    return;
  }
  if (!privateAccess) {
    els.sourceSignalList.className = "signal-list empty-state";
    els.sourceSignalList.textContent = "Public accounts cannot view private source signals.";
    return;
  }
  const signals = (state.sourceSignals || []).filter((signal) => canViewSourceSignal(signal));
  if (SatAdminViewRenderers.renderSourceSignalList) {
    const rendered = SatAdminViewRenderers.renderSourceSignalList(signals, {
      canAccessPrivateContent: true,
      getSignalDraftStats,
      labelFor,
    });
    els.sourceSignalList.className = rendered.className;
    els.sourceSignalList.innerHTML = rendered.html;
    document.querySelectorAll(".use-signal").forEach((button) => {
      button.addEventListener("click", () => {
        const signal = state.sourceSignals.find((item) => item.id === button.dataset.signalId);
        if (signal) useSignalForDraft(signal);
      });
    });
    localizeDynamicUiText(els.sourceSignalList);
    return;
  }
  if (!signals.length) {
    els.sourceSignalList.className = "signal-list empty-state";
    els.sourceSignalList.textContent = "No source signals saved yet.";
    localizeDynamicUiText(els.sourceSignalList);
    return;
  }

  els.sourceSignalList.className = "signal-list";
  els.sourceSignalList.innerHTML = `
    <div class="signal-list-summary">
      <strong>${signals.length} source signals ready</strong>
      <span>${signals.filter((signal) => String(signal.id || "").startsWith("archive-signal-")).length} from SAT archive. These are metadata only, not imported questions.</span>
    </div>
  ` +
    signals
    .map((signal) => {
      const stats = getSignalDraftStats(signal);
      return `
        <div class="signal-card">
          <div class="signal-card-main">
            <strong>${escapeHtml(signal.skill)} · ${escapeHtml(signal.difficulty)}</strong>
            <span>${escapeHtml(labelFor(signal.sourceKind))} · ${escapeHtml(signal.domain)} · ${escapeHtml(signal.sourceReference || "No reference")}</span>
            <span>${escapeHtml(signal.mistakePattern || signal.learningGoal || "No pattern recorded.")}</span>
          </div>
          <div class="signal-stats" aria-label="Generated draft status">
            <div><strong>${stats.total}</strong><span>generated</span></div>
            <div><strong>${stats.needsReview}</strong><span>need review</span></div>
            <div><strong>${stats.reviewed}</strong><span>reviewed</span></div>
            <div><strong>${stats.rejected}</strong><span>rejected</span></div>
          </div>
          ${stats.total ? `<span class="signal-warning">Already generated ${stats.total} draft${stats.total > 1 ? "s" : ""} from this file/signal. Review existing drafts before generating more.</span>` : ""}
          <button class="button secondary use-signal" type="button" data-signal-id="${escapeHtml(signal.id)}">Use + Generate</button>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".use-signal").forEach((button) => {
    button.addEventListener("click", () => {
      const signal = state.sourceSignals.find((item) => item.id === button.dataset.signalId);
      if (signal) useSignalForDraft(signal);
    });
  });
  localizeDynamicUiText(els.sourceSignalList);
}

function getSignalDraftStats(signal) {
  if (SatAuthoringEngine.sourceSignalDraftStats) return SatAuthoringEngine.sourceSignalDraftStats(signal, state.questions);
  const linked = getDraftsForSignal(signal);
  return {
    total: linked.length,
    needsReview: linked.filter((question) => question.reviewStatus === "needs_review").length,
    reviewed: linked.filter((question) => question.reviewStatus === "reviewed").length,
    rejected: linked.filter((question) => question.reviewStatus === "rejected").length,
  };
}

function getDraftsForSignal(signal) {
  if (SatAuthoringEngine.draftsForSourceSignal) return SatAuthoringEngine.draftsForSourceSignal(signal, state.questions);
  if (!signal) return [];
  return state.questions.filter((question) => {
    if (question.sourceType !== "ai_generated") return false;
    if (signal.id && question.sourceSignalId === signal.id) return true;
    return Boolean(signal.sourceReference && question.sourceReference === signal.sourceReference);
  });
}

function useLatestSourceSignal() {
  const signal = (state.sourceSignals || []).find((item) => canViewSourceSignal(item));
  if (!signal) {
    alert("No source signal saved yet.");
    return;
  }
  useSignalForDraft(signal);
}

function useSignalForDraft(signal) {
  applySignalToAiForm(signal);
  generateAiQuestionDraft({ scrollToDraft: true });
}

async function loadArchiveSignals() {
  if (!isContentAdmin()) {
    alert("Only Content Admin can load archive source signals.");
    return;
  }
  els.archiveSignalImportResult.innerHTML = "<strong>Loading SAT archive signals...</strong><span>No question text will be imported.</span>";
  try {
    const response = await fetch(PRIVATE_ARCHIVE_SIGNALS_URL);
    if (!response.ok) throw new Error(`Archive signal file returned HTTP ${response.status}`);
    const data = await response.json();
    const incoming = Array.isArray(data.signals) ? data.signals : [];
    const existingIds = new Set((state.sourceSignals || []).map((signal) => signal.id));
    const account = currentAccount();
    const imported = incoming
      .map((signal) =>
        normalizeSourceSignal({
          ...signal,
          protectedTextExcluded: true,
          risk: sourceKindRisk(signal.sourceKind || "other"),
          createdBy: account?.id || "content-admin",
        }),
      )
      .filter((signal) => signal && !existingIds.has(signal.id));

    if (!Array.isArray(state.sourceSignals)) state.sourceSignals = [];
    state.sourceSignals.unshift(...imported);
    const existingArchiveSignal = (state.sourceSignals || []).find((signal) => incoming.some((item) => item.id === signal.id));
    if (imported[0]) applySignalToAiForm(imported[0], { showReadyMessage: true, scrollToDraft: true });
    else if (existingArchiveSignal) applySignalToAiForm(existingArchiveSignal, { showReadyMessage: true, scrollToDraft: true });
    saveState();
    renderSourceSignals();
    renderArchiveRegistry();
    els.archiveSignalImportResult.innerHTML = `
      <strong>${incoming.length} archive signals ready</strong>
      <span>${imported.length} newly loaded; ${incoming.length - imported.length} already existed. These are admin-only metadata signals, not imported questions.</span>
    `;
  } catch (error) {
    els.archiveSignalImportResult.innerHTML = `<strong>Could not load archive signals.</strong><span>${escapeHtml(error.message)}</span>`;
  }
}

function applySignalToAiForm(signal, options = {}) {
  activeSourceSignalId = signal.id;
  els.aiSection.value = ["Reading and Writing", "Math"].includes(signal.section) ? signal.section : "Reading and Writing";
  els.aiDomain.value = signal.domain;
  els.aiSkill.value = signal.skill;
  els.aiDifficulty.value = ["Easy", "Medium", "Hard"].includes(signal.difficulty) ? signal.difficulty : "Medium";
  els.aiSourceRisk.value = signal.risk || "high";
  els.aiSourceReference.value = signal.sourceReference || labelFor(signal.sourceKind);
  els.aiGenerationBrief.value = [signal.learningGoal, signal.mistakePattern]
    .filter(Boolean)
    .join("\n");
  if (options.showReadyMessage) {
    const stats = getSignalDraftStats(signal);
    els.aiDraftOutput.className = "import-result";
    els.aiDraftOutput.innerHTML = `
      <strong>Signal loaded: ${escapeHtml(signal.skill)}</strong>
      <span>The draft builder is ready. Click Generate Safe Draft, or use a signal card's Use + Generate button.</span>
      <span>Reference: ${escapeHtml(signal.sourceReference || labelFor(signal.sourceKind))}</span>
      <span>Existing saved drafts from this file/signal: ${stats.total} generated, ${stats.reviewed} reviewed, ${stats.rejected} rejected.</span>
    `;
  }
  if (options.scrollToDraft) {
    els.aiDraftOutput.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  localizeDynamicUiText(els.aiDraftOutput);
}

function sourceKindRisk(kind) {
  if (SatAuthoringEngine.sourceKindRisk) return SatAuthoringEngine.sourceKindRisk(kind);
  return ["cracksat", "college_board", "private_pdf", "satpanda", "khan_college_board", "commercial_prep", "third_party_prep", "other"].includes(kind)
    ? "high"
    : "medium";
}

function generateAiQuestionDraft(options = {}) {
  if (!canAuthorQuestions()) {
    alert("This account cannot generate question drafts.");
    return;
  }

  const section = els.aiSection.value;
  const domain = els.aiDomain.value.trim() || (section === "Math" ? "Algebra" : "Expression of Ideas");
  const skill = els.aiSkill.value.trim() || (section === "Math" ? "Linear equations in one variable" : "Transitions");
  const difficulty = els.aiDifficulty.value;
  const risk = els.aiSourceRisk.value;
  const sourceReference = els.aiSourceReference.value.trim() || "No source reference recorded";
  const brief = els.aiGenerationBrief.value.trim() || "Generate a new SAT-style question targeting this skill without copying any source wording.";

  const sourceSignal = state.sourceSignals?.find((signal) => signal.id === activeSourceSignalId) || null;
  const signalStats = getSignalDraftStats(sourceSignal);
  generatedAiDraft = buildSafeAiDraft({ section, domain, skill, difficulty, risk, sourceReference, brief, sourceSignal });
  generatedAiDraft.safetyReport = runDraftSafetyChecks(generatedAiDraft, { brief, sourceReference, sourceSignal });
  els.saveAiDraft.disabled = generatedAiDraft.safetyReport.blocked;
  els.aiDraftOutput.className = "import-result";
  els.aiDraftOutput.innerHTML = `
    <strong>Generated draft: ${escapeHtml(generatedAiDraft.skill)}</strong>
    <span>Visibility: ${escapeHtml(labelFor(generatedAiDraft.visibility))} &middot; Source risk: ${escapeHtml(labelFor(risk))}</span>
    <span>Reference: ${escapeHtml(sourceReference)}</span>
    <span>Signal: ${escapeHtml(sourceSignal ? sourceSignal.id : "manual brief")}</span>
    ${
      sourceSignal
        ? `<span class="${signalStats.total ? "warn" : "success-line"}">This source currently has ${signalStats.total} saved draft${signalStats.total === 1 ? "" : "s"}: ${signalStats.needsReview} need review, ${signalStats.reviewed} reviewed, ${signalStats.rejected} rejected.</span>`
        : ""
    }
    ${renderGeneratedDraftReviewCard(generatedAiDraft)}
    ${renderSafetyReport(generatedAiDraft.safetyReport)}
    <span><strong>Next:</strong> review the question card above, verify the answer and explanation, then Save AI Draft only if the item is original, accurate, and useful. Saved high-risk drafts stay private_family until reviewed.</span>
    ${renderDraftAdminSummary(generatedAiDraft)}
    <span>Review checklist: no copied prompt/choices, correct answer verified, explanation checked, source policy confirmed.</span>
  `;
  if (options.scrollToDraft) {
    els.aiDraftOutput.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderDraftAdminSummary(draft = {}) {
  const safety = draft.safetyReport || {};
  const skeleton = safety.skeleton || {};
  const rows = [
    ["Review status", labelFor(draft.reviewStatus || "needs_review")],
    ["Visibility", labelFor(draft.visibility || "private_family")],
    ["Publication status", labelFor(draft.publicationStatus || "private_similarity_review")],
    ["Practice pool", labelFor(practicePool(draft))],
    ["Source policy", draft.licenseNote || "Needs admin source review before public release."],
    ["Input similarity", `${Math.round(Number(safety.inputSimilarity || 0) * 100)}%`],
    ["Existing bank similarity", `${Math.round(Number(safety.existingSimilarity || 0) * 100)}%`],
    skeleton.existingCount != null ? ["Duplicate skeleton", `${Number(skeleton.existingCount || 0)} similar local item(s); next pool ${labelFor(skeleton.nextPool || practicePool(draft))}`] : null,
  ].filter(Boolean);
  const issues = [...(safety.blocks || []), ...(safety.warnings || [])].filter(Boolean);
  return `
    <section class="admin-readable-summary">
      <strong>Admin-readable metadata</strong>
      <div class="admin-readable-grid">
        ${rows.map(([label, value]) => `<span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b>`).join("")}
      </div>
      <p>${issues.length ? `Needs attention: ${escapeHtml(issues.join("; "))}` : "No blocking safety issue detected. Continue with human review."}</p>
    </section>
  `;
}

function generateAiBatchDrafts() {
  if (!canAuthorQuestions()) {
    alert("This account cannot batch-generate question drafts.");
    return;
  }

  const count = Math.max(1, Math.min(400, Number(els.aiBatchCount.value || 10)));
  const sourceSignal = state.sourceSignals?.find((signal) => signal.id === activeSourceSignalId) || null;
  const section = els.aiSection.value;
  const domain = els.aiDomain.value.trim() || (section === "Math" ? "Algebra" : "Expression of Ideas");
  const skill = els.aiSkill.value.trim() || (section === "Math" ? "Linear equations in one variable" : "Transitions");
  const difficulty = els.aiDifficulty.value;
  const risk = els.aiSourceRisk.value;
  const sourceReference = els.aiSourceReference.value.trim() || "No source reference recorded";
  const brief = els.aiGenerationBrief.value.trim() || "Generate original SAT-style questions from metadata only.";
  const existing = sourceSignal ? getDraftsForSignal(sourceSignal) : getDraftsForSourceReference(sourceReference);
  const remaining = Math.max(count - existing.length, 0);

  if (!remaining) {
    els.aiDraftOutput.className = "import-result";
    els.aiDraftOutput.innerHTML = `
      <strong>No new drafts needed.</strong>
      <span>This source already has ${existing.length} saved draft${existing.length === 1 ? "" : "s"} for target ${count}.</span>
      <span>Raise Target drafts if you want more original items, or review existing drafts first.</span>
    `;
    return;
  }

  const created = [];
  let skippedBlocked = 0;
  for (let offset = 0; offset < remaining; offset += 1) {
    const questionIndex = existing.length + offset + 1;
    const blueprint = batchBlueprintForIndex({ sourceSignal, section, domain, skill, difficulty, index: questionIndex - 1 });
    const draft = buildSafeAiDraft({
      ...blueprint,
      risk,
      sourceReference,
      brief: `${brief}\nBatch source question signal #${questionIndex}. Generate a fresh original item; do not copy source wording.`,
      sourceSignal,
      variantIndex: questionIndex - 1,
      questionIndex,
    });
    draft.safetyReport = runDraftSafetyChecks(draft, { brief: draft.generationBrief, sourceReference, sourceSignal });
    const autoCheck = autoValidateGeneratedDraft(draft);
    draft.autoCheck = autoCheck;
    if (isContentAdmin() && autoCheck.status === "passed" && draft.visibility === "private_family") {
      draft.reviewStatus = "reviewed";
      draft.publicationStatus = "private_auto_reviewed";
    }
    if (draft.safetyReport.blocked) {
      skippedBlocked += 1;
    } else if (!state.questions.some((question) => question.id === draft.id)) {
      state.questions.unshift(draft);
      state.questionReviews[draft.id] = draft.reviewStatus;
      created.push(draft);
    }
  }

  saveState();
  hydrateFilters();
  render();
  renderSourceSignals();
  renderArchiveRegistry();
  els.aiDraftOutput.className = "import-result";
  els.aiDraftOutput.innerHTML = `
    <strong>Batch generated ${created.length} original draft${created.length === 1 ? "" : "s"}.</strong>
    <span>Target: ${count}. Existing before batch: ${existing.length}. Source risk: ${escapeHtml(risk)}.</span>
    <span>${skippedBlocked} duplicate/similarity-blocked draft${skippedBlocked === 1 ? "" : "s"} skipped.</span>
    <span>Auto-passed Math drafts are marked reviewed but stay private_family. Other drafts remain needs_review.</span>
    <span>Reference: ${escapeHtml(sourceReference)}</span>
    ${
      created.length
        ? `<div class="batch-preview-grid"><strong>Newest questions to review</strong>${created
            .slice(0, 3)
            .map((draft) => renderGeneratedDraftReviewCard(draft, { compact: true }))
            .join("")}</div>`
        : ""
    }
  `;
  localizeDynamicUiText(els.aiDraftOutput);
}

function batchBlueprintForIndex({ sourceSignal, section, domain, skill, difficulty, index }) {
  const isFullSource = sourceSignal && (sourceSignal.section === "All" || /full practice test/i.test(sourceSignal.skill || ""));
  if (!isFullSource) return { section, domain, skill, difficulty };

  const cycle = [
    ["Reading and Writing", "Information and Ideas", "Inferences", "Medium"],
    ["Reading and Writing", "Information and Ideas", "Command of Evidence", "Medium"],
    ["Reading and Writing", "Craft and Structure", "Words in Context", "Medium"],
    ["Reading and Writing", "Craft and Structure", "Text Structure and Purpose", "Hard"],
    ["Reading and Writing", "Expression of Ideas", "Transitions", "Easy"],
    ["Reading and Writing", "Standard English Conventions", "Boundaries", "Medium"],
    ["Math", "Algebra", "Linear equations in one variable", "Easy"],
    ["Math", "Algebra", "Linear functions and slope", "Medium"],
    ["Math", "Advanced Math", "Quadratic equations", "Medium"],
    ["Math", "Problem-Solving and Data Analysis", "Percentages", "Medium"],
    ["Math", "Problem-Solving and Data Analysis", "Statistics", "Hard"],
    ["Math", "Geometry and Trigonometry", "Circles", "Medium"],
  ];
  const [nextSection, nextDomain, nextSkill, nextDifficulty] = cycle[index % cycle.length];
  return { section: nextSection, domain: nextDomain, skill: nextSkill, difficulty: nextDifficulty || difficulty };
}

function buildSafeAiDraft({ section, domain, skill, difficulty, risk, sourceReference, brief, sourceSignal, variantIndex = 0, questionIndex = null }) {
  const isMath = section === "Math";
  const id = `ai-${Date.now()}-${variantIndex}`;
  const author = currentAccount();
  const visibility = !isContentAdmin() || risk === "high" ? "private_family" : "public_candidate";
  const licenseNote = risk === "high"
    ? "AI-generated original draft from protected-source metadata only. Keep private_family until admin similarity review confirms no copied wording."
    : "AI-generated original draft. Needs admin review for accuracy, originality, and source policy before public release.";
  const body = isMath ? buildMathAiDraftBody({ skill, difficulty, variantIndex }) : buildReadingWritingAiDraftBody({ skill, difficulty, variantIndex });

  return {
    id,
    section,
    domain,
    skill,
    difficulty,
    sourceType: "ai_generated",
    sourceName: "SAT Studio AI Draft Workspace",
    sourceReference,
    sourceSignalId: sourceSignal?.id || null,
    sourceQuestionIndex: questionIndex,
    createdBy: author?.id || "unknown",
    createdByRole: author?.role || "unknown",
    generationBrief: brief,
    licenseNote,
    visibility,
    reviewStatus: "needs_review",
    publicationStatus: !isContentAdmin() ? "parent_contribution_needs_review" : visibility === "private_family" ? "private_similarity_review" : "public_candidate_review",
    prompt: body.prompt,
    choices: body.choices,
    correctAnswer: body.correctAnswer,
    explanation: body.explanation,
    validator: body.validator || null,
    expectedAnswer: body.expectedAnswer || null,
  };
}

function buildMathAiDraftBody({ skill, difficulty, variantIndex = 0 }) {
  const key = skill.toLowerCase();
  if (hasAny(key, ["quadratic", "parabola"])) {
    const low = difficulty === "Hard" ? 3 + (variantIndex % 5) : difficulty === "Medium" ? 2 + (variantIndex % 4) : 1 + (variantIndex % 3);
    const high = low + (difficulty === "Hard" ? 5 : difficulty === "Medium" ? 4 : 3);
    const roots = [low, high];
    const b = -(roots[0] + roots[1]);
    const c = roots[0] * roots[1];
    return {
      prompt: `The equation x^2 ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x + ${c} = 0 has two solutions. What is the greater solution?`,
      choices: { A: String(roots[0]), B: String(roots[1]), C: String(c), D: String(roots[1] + 1) },
      correctAnswer: "B",
      explanation: `The equation factors as (x - ${roots[0]})(x - ${roots[1]}) = 0, so the greater solution is ${roots[1]}.`,
      validator: "quadratic_roots",
      expectedAnswer: String(roots[1]),
    };
  }
  if (hasAny(key, ["percent", "percentage"])) {
    const base = (difficulty === "Hard" ? 220 : difficulty === "Medium" ? 140 : 80) + 10 * (variantIndex % 9);
    const pct = (difficulty === "Hard" ? 30 : difficulty === "Medium" ? 20 : 10) + 5 * (variantIndex % 5);
    const change = (base * pct) / 100;
    return {
      prompt: `A value of ${base} is increased by ${pct}%. What is the new value?`,
      choices: { A: String(change), B: String(base - change), C: String(base + change), D: String(base + pct) },
      correctAnswer: "C",
      explanation: `${pct}% of ${base} is ${change}. Add this to ${base} to get ${base + change}.`,
      validator: "percent_increase",
      expectedAnswer: String(base + change),
    };
  }
  if (hasAny(key, ["slope", "linear function"])) {
    const x1 = 1 + (variantIndex % 4);
    const y1 = 3 + (variantIndex % 5);
    const slope = 2 + (variantIndex % 4);
    const x2 = x1 + 6;
    const y2 = y1 + slope * (x2 - x1);
    return {
      prompt: `A line passes through the points (${x1}, ${y1}) and (${x2}, ${y2}). What is the slope of the line?`,
      choices: { A: String(slope), B: String(slope + 1), C: String(x2 - x1), D: String(y2 - y1) },
      correctAnswer: "A",
      explanation: `Slope is change in y divided by change in x: (${y2} - ${y1}) / (${x2} - ${x1}) = ${y2 - y1} / ${x2 - x1} = ${slope}.`,
      validator: "slope",
      expectedAnswer: String(slope),
    };
  }
  if (hasAny(key, ["circle", "radius"])) {
    const radius = 3 + (variantIndex % 8);
    return {
      prompt: `A circle has radius ${radius}. What is the area of the circle?`,
      choices: { A: `${2 * radius}π`, B: `${3 * radius}π`, C: `${radius * radius}π`, D: `${2 * radius * radius}π` },
      correctAnswer: "C",
      explanation: `The area of a circle is πr^2. With r = ${radius}, the area is ${radius * radius}π.`,
      validator: "circle_area",
      expectedAnswer: `${radius * radius}π`,
    };
  }

  const a = (difficulty === "Hard" ? 6 : difficulty === "Medium" ? 4 : 2) + (variantIndex % 4);
  const x = (difficulty === "Hard" ? 7 : difficulty === "Medium" ? 5 : 3) + (variantIndex % 5);
  const b = (difficulty === "Hard" ? -8 : difficulty === "Medium" ? 7 : 4) + (variantIndex % 6);
  const c = a * x + b;
  return {
    prompt: `If ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${c}, what is the value of x?`,
    choices: { A: String(x - 1), B: String(x), C: String(x + 2), D: String(c) },
    correctAnswer: "B",
    explanation: `${b >= 0 ? `Subtract ${b}` : `Add ${Math.abs(b)}`} on both sides, then divide by ${a}. The value of x is ${x}.`,
    validator: "linear_equation",
    expectedAnswer: String(x),
  };
}

function buildReadingWritingAiDraftBody({ skill, variantIndex = 0 }) {
  const key = skill.toLowerCase();
  if (hasAny(key, ["transition"])) {
    const contexts = [
      ["The first trial suggested that the material could withstand high temperatures", "the second trial showed that the material became brittle after repeated heating"],
      ["The city expected the new bus route to reduce traffic downtown", "traffic counts were almost unchanged during the first month"],
      ["Researchers predicted that the seeds would germinate quickly in warmer soil", "the warmest soil samples produced the fewest seedlings"],
      ["The museum planned to display the sculpture outdoors", "conservation staff warned that rain could damage its surface"],
    ];
    const [first, second] = contexts[variantChoiceIndex(contexts, variantIndex)];
    return {
      prompt:
        `${first}. ______ ${second}.\n\nWhich choice completes the text with the most logical transition?`,
      choices: { A: "However,", B: "Therefore,", C: "For example,", D: "Similarly," },
      correctAnswer: "A",
      explanation: "The second sentence contrasts with the first, so However is the most logical transition.",
    };
  }
  if (hasAny(key, ["boundaries", "punctuation"])) {
    const rows = [
      ["The research team finished collecting samples in July", "the laboratory analysis began in August"],
      ["The archive opened to visitors on Monday", "the first lecture was scheduled for Thursday"],
      ["The student revised the introduction twice", "her final draft was much clearer"],
      ["The committee reviewed the proposal in April", "the pilot program began in June"],
    ];
    const [first, second] = rows[variantChoiceIndex(rows, variantIndex)];
    return {
      prompt:
        `${first} ______ ${second}.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?`,
      choices: { A: ", the", B: "; the", C: " the", D: ", and, the" },
      correctAnswer: "B",
      explanation: "Two independent clauses can be joined by a semicolon.",
    };
  }
  if (hasAny(key, ["words", "context", "vocabulary"])) {
    const rows = [
      ["engineer's summary", "explained a complex design in language that nonexperts could understand", "lucid", "erratic", "ornate", "scarce"],
      ["historian's account", "used exact dates and quotations to make the sequence of events easy to follow", "precise", "volatile", "redundant", "evasive"],
      ["teacher's diagram", "made a difficult geometry idea visible at a glance", "illuminating", "arbitrary", "hostile", "peripheral"],
      ["editor's note", "reduced a long argument to its essential claim", "succinct", "extraneous", "ambivalent", "obsolete"],
    ];
    const row = rows[variantChoiceIndex(rows, variantIndex)];
    return {
      prompt:
        `The ${row[0]} was unusually ______: it ${row[1]}.\n\nWhich choice completes the text with the most logical and precise word?`,
      choices: { A: row[2], B: row[3], C: row[4], D: row[5] },
      correctAnswer: "A",
      explanation: `${row[2]} best matches the context clue in the second part of the sentence.`,
    };
  }
  if (hasAny(key, ["inference"])) {
    const rows = [
      ["After the city added protected bike lanes downtown, bicycle counts increased and several nearby stores reported more weekend customers", "Some customers may have reached the stores by using the new bike lanes"],
      ["A library extended its evening hours, and attendance at student study groups doubled during the next semester", "Some students may have used the later hours for group study"],
      ["A garden replaced part of its lawn with native plants, and the number of observed pollinators rose by midsummer", "The native plants may have attracted additional pollinators"],
      ["A school posted assignment checklists online, and late homework submissions decreased the following month", "The checklists may have helped some students track deadlines"],
    ];
    const row = rows[variantChoiceIndex(rows, variantIndex)];
    return {
      prompt:
        `${row[0]}.\n\nWhich inference is best supported by the text?`,
      choices: {
        A: row[1],
        B: "All downtown parking spaces were removed.",
        C: "The stores stopped serving weekday customers.",
        D: "Bicycle counts decreased after the lanes were added.",
      },
      correctAnswer: "A",
      explanation: "The increased bicycle counts and store customers support the idea that some customers arrived by bike.",
    };
  }
  return {
    prompt:
      "A student is writing about a community science project. The student wants to show that careful planning improved the project's results.\n\nWhich choice most effectively uses relevant information to accomplish this goal?",
    choices: {
      A: "The project took place during the spring and included several volunteers.",
      B: "Before collecting data, the team created a shared procedure, which helped volunteers record observations consistently.",
      C: "Some volunteers had participated in community events before the project began.",
      D: "The final report was posted online after the project ended.",
    },
    correctAnswer: "B",
    explanation: "Choice B directly connects planning with improved results by explaining that the shared procedure made data collection more consistent.",
  };
}

function variantChoiceIndex(items, variantIndex) {
  return (variantIndex + Math.floor(variantIndex / 12)) % items.length;
}

function runDraftSafetyChecks(draft, context) {
  return SatAuthoringEngine.runDraftSafetyChecks(draft, context, {
    existingQuestions: visibleQuestionBank(),
    textSimilarity,
    normalizePrompt: normalizePromptForImport,
    looksLikeProtectedQuestionText,
  });
  // Legacy body is intentionally bypassed; authoring policy lives in sat_authoring_engine.js.
  const warnings = [];
  const blocks = [];
  const skeletonReport = analyzeDraftSkeleton(draft);
  applySkeletonMetadataToDraft(draft, skeletonReport);
  const sourceText = [context.brief, context.sourceSignal?.mistakePattern, context.sourceSignal?.learningGoal]
    .filter(Boolean)
    .join(" ");
  const protectedPatternRisk = looksLikeProtectedQuestionText(sourceText);
  const inputSimilarity = textSimilarity(draft.prompt, sourceText);
  const existingSimilarity = Math.max(
    0,
    ...visibleQuestionBank()
      .filter((question) => question.id !== draft.id)
      .map((question) => textSimilarity(draft.prompt, question.prompt || "")),
  );
  const duplicatePrompt = visibleQuestionBank().some(
    (question) => question.id !== draft.id && normalizePromptForImport(question.prompt || "") === normalizePromptForImport(draft.prompt || ""),
  );

  if (protectedPatternRisk) {
    warnings.push("Input looks long or question-like. Confirm it is only a summary, not copied protected text.");
  }
  if (inputSimilarity > 0.38) {
    warnings.push(`Draft prompt is ${Math.round(inputSimilarity * 100)}% similar to the source brief. Rewrite before public use if protected text was pasted.`);
  }
  if (duplicatePrompt) {
    blocks.push("Draft prompt exactly matches an existing local question. Generate a new variant before saving.");
  } else if (existingSimilarity > 0.92) {
    blocks.push(`Draft is ${Math.round(existingSimilarity * 100)}% similar to an existing local question. Generate a new variant before saving.`);
  }
  if (existingSimilarity > 0.72) {
    warnings.push(`Draft is ${Math.round(existingSimilarity * 100)}% similar to an existing local question. Review originality.`);
  }
  if (skeletonReport.existingCount >= skeletonReport.activeLimit) {
    blocks.push(
      `Skeleton ${skeletonReport.skeletonId} already has ${skeletonReport.existingCount} local item${skeletonReport.existingCount === 1 ? "" : "s"}; generate a different context/representation/reasoning path before saving.`,
    );
  } else if (skeletonReport.existingCount >= skeletonReport.coreLimit) {
    warnings.push(
      `Skeleton ${skeletonReport.skeletonId} already has ${skeletonReport.existingCount} item${skeletonReport.existingCount === 1 ? "" : "s"}. This draft will be remedial-only unless the context and reasoning path are genuinely different.`,
    );
  }
  if (draft.visibility === "public_candidate" && protectedPatternRisk && inputSimilarity > 0.45) {
    blocks.push("Public candidate blocked until the source brief is rewritten as metadata only.");
  }

  return {
    blocked: blocks.length > 0,
    warnings,
    blocks,
    inputSimilarity: Number(inputSimilarity.toFixed(3)),
    existingSimilarity: Number(existingSimilarity.toFixed(3)),
    skeleton: skeletonReport,
    checklist: [
      "No protected prompt, passage, choices, or explanation stored.",
      "Generated prompt uses a new scenario and wording.",
      "Skeleton was checked against the existing local bank before save.",
      "Correct answer and explanation require admin review.",
      "Visibility remains private_family for high-risk sources.",
    ],
  };
}

function analyzeDraftSkeleton(draft) {
  return SatAuthoringEngine.analyzeDraftSkeleton(draft, state.questions);
}

function applySkeletonMetadataToDraft(draft, report) {
  return SatAuthoringEngine.applySkeletonMetadataToDraft(draft, report);
}

function validationExplanationText(explanation) {
  return SatAuthoringEngine.validationExplanationText(explanation);
}

function normalizedAnswerText(value) {
  return SatAuthoringEngine.normalizedAnswerText(value);
}

function answerTextEquivalent(a, b) {
  return SatAuthoringEngine.answerTextEquivalent(a, b, { answersMatch });
}

function extractFinalEqualsAnswer(text = "") {
  return SatAuthoringEngine.extractFinalEqualsAnswer(text);
}

function explanationMentionsAnswerText(explanation = "", answerText = "") {
  return SatAuthoringEngine.explanationMentionsAnswerText(explanation, answerText, { answersMatch });
}

function extractNumericTokens(text = "") {
  return SatAuthoringEngine.extractNumericTokens(text);
}

function verifyMathDraftAnswer(draft) {
  return SatAuthoringEngine.verifyMathDraftAnswer(draft, { answersMatch });
}

function autoValidateGeneratedDraft(draft) {
  return SatAuthoringEngine.autoValidateGeneratedDraft(draft, { answersMatch });
}

function renderGeneratedDraftReviewCard(draft, options = {}) {
  if (!draft) return "";
  if (SatAdminViewRenderers.renderGeneratedDraftReviewCard) {
    return SatAdminViewRenderers.renderGeneratedDraftReviewCard(draft, {
      ...options,
      getCorrectAnswerLabel,
      isGridInQuestion,
      labelFor,
      practicePool,
      renderExplanation,
    });
  }
  const choices = draft.choices || {};
  const correctAnswer = draft.correctAnswer || "";
  const correctText = choices[correctAnswer] || "";
  const gridIn = isGridInQuestion(draft);
  const metadata = [
    `${draft.section || "Section"} / ${draft.domain || "Domain"}`,
    draft.skill || "Skill",
    draft.difficulty || "Difficulty",
  ];
  const sourceIndex = draft.sourceQuestionIndex ? `#${draft.sourceQuestionIndex}` : "";
  const status = draft.autoCheck?.status === "passed" ? "Auto-check passed" : labelFor(draft.reviewStatus || "needs_review");
  const compactClass = options.compact ? " compact" : "";

  return `
    <article class="generated-draft-card${compactClass}">
      <div class="draft-card-header">
        <div>
          <p class="eyebrow">Readable review</p>
          <h3>${escapeHtml(draft.skill || "Generated question")}</h3>
          <p>${metadata.map(escapeHtml).join(" &middot; ")}</p>
        </div>
        <div class="draft-card-badges">
          <span class="badge">${escapeHtml(labelFor(draft.sourceType || "ai_generated"))}</span>
          <span class="badge ${escapeHtml(draft.reviewStatus || "")}">${escapeHtml(status)}</span>
          <span class="badge">${escapeHtml(labelFor(draft.visibility || "private_family"))}</span>
          <span class="badge">${escapeHtml(labelFor(practicePool(draft)))}</span>
        </div>
      </div>

      <section class="draft-question-box">
        <span class="draft-label">Question</span>
        <p class="draft-prompt">${escapeHtml(draft.prompt || "No prompt generated.")}</p>
      </section>

      ${
        gridIn
          ? `<div class="draft-grid-answer"><strong>Student-produced response</strong><span>Accepted: ${escapeHtml(getCorrectAnswerLabel(draft))}</span></div>`
          : `<div class="draft-choice-list" aria-label="Answer choices">
              ${["A", "B", "C", "D"]
                .map((key) => {
                  const isCorrect = key === correctAnswer;
                  return `
                    <div class="draft-choice ${isCorrect ? "correct" : ""}">
                      <span class="choice-key">${key}</span>
                      <span class="choice-text">${escapeHtml(choices[key] || "")}</span>
                    </div>
                  `;
                })
                .join("")}
            </div>`
      }

      <section class="draft-answer-panel">
        <div>
          <span class="draft-label">Correct answer</span>
          <strong>${escapeHtml(gridIn ? getCorrectAnswerLabel(draft) : correctAnswer)}${correctText ? `. ${escapeHtml(correctText)}` : ""}</strong>
        </div>
        <div>
          <span class="draft-label">Explanation</span>
          <div class="rich-explanation">${renderExplanation(draft.explanation || "No explanation generated.", draft.correctAnswer)}</div>
        </div>
      </section>

      <div class="draft-source-grid">
        <span><strong>Source reference:</strong> ${escapeHtml(draft.sourceReference || "None")}</span>
        <span><strong>Signal:</strong> ${escapeHtml(draft.sourceSignalId || "manual brief")} ${escapeHtml(sourceIndex)}</span>
      </div>
    </article>
  `;
}

function renderSafetyReport(report) {
  const rows = [
    `<span>Input similarity: ${Math.round((report.inputSimilarity || 0) * 100)}%</span>`,
    `<span>Existing-bank similarity: ${Math.round((report.existingSimilarity || 0) * 100)}%</span>`,
    report.skeleton
      ? `<span>Skeleton check: ${report.skeleton.existingCount} existing &middot; next pool ${escapeHtml(labelFor(report.skeleton.nextPool))}</span>`
      : "",
    ...report.warnings.map((warning) => `<span class="warn">${escapeHtml(warning)}</span>`),
    ...report.blocks.map((block) => `<span class="block">${escapeHtml(block)}</span>`),
  ].filter(Boolean);
  return `<div class="safety-report">${rows.join("")}</div>`;
}

function looksLikeProtectedQuestionText(text = "") {
  const compact = text.trim();
  if (compact.length > 650) return true;
  return /(^|\n)\s*[A-D][\).:]/.test(compact) || /which choice|which of the following|complete the text/i.test(compact);
}

function textSimilarity(a = "", b = "") {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (!aTokens.size || !bTokens.size) return 0;
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3 && !["which", "choice", "what", "value", "with", "from", "that", "this"].includes(token));
}

function saveAiQuestionDraft() {
  if (!generatedAiDraft) return;
  if (!canAuthorQuestions()) {
    alert("This account cannot save AI drafts.");
    return;
  }
  if (generatedAiDraft.safetyReport?.blocked) {
    alert("This draft is blocked by the safety check. Rewrite the source signal as metadata only, then generate again.");
    return;
  }
  if (state.questions.some((question) => question.id === generatedAiDraft.id)) return;
  state.questions.unshift(generatedAiDraft);
  state.questionReviews[generatedAiDraft.id] = generatedAiDraft.reviewStatus;
  generatedAiDraft = null;
  els.saveAiDraft.disabled = true;
  saveState();
  hydrateFilters();
  render();
  renderSourceSignals();
  els.aiDraftOutput.insertAdjacentHTML("beforeend", '<span class="success-line">Saved as AI Generated draft. Review before public release.</span>');
}

function addQuestionDraft(event) {
  event.preventDefault();
  const result = SatAuthoringEngine.buildManualQuestionDraft
    ? SatAuthoringEngine.buildManualQuestionDraft(
        {
          section: els.authorSection.value,
          domain: els.authorDomain.value,
          skill: els.authorSkill.value,
          difficulty: els.authorDifficulty.value,
          prompt: els.authorPrompt.value,
          choiceA: els.choiceA.value,
          choiceB: els.choiceB.value,
          choiceC: els.choiceC.value,
          choiceD: els.choiceD.value,
          correctAnswer: els.authorAnswer.value,
          explanation: els.authorExplanation.value,
        },
        {
          isContentAdmin: isContentAdmin(),
          canAuthorQuestions: canAuthorQuestions(),
          nowMs: Date.now(),
        },
      )
    : null;
  if (result && !result.ok) {
    alert(result.reason);
    return;
  }
  if (!canAuthorQuestions()) {
    alert("This account cannot add question drafts.");
    return;
  }
  const draft =
    result?.draft || {
      id: `orig-${Date.now()}`,
      section: els.authorSection.value,
      domain: els.authorDomain.value.trim(),
      skill: els.authorSkill.value.trim(),
      difficulty: els.authorDifficulty.value,
      sourceType: "original",
      sourceName: "SAT Studio Original Draft",
      licenseNote: "Original draft; safe to publish after review.",
      reviewStatus: "needs_review",
      prompt: els.authorPrompt.value.trim(),
      choices: {
        A: els.choiceA.value.trim(),
        B: els.choiceB.value.trim(),
        C: els.choiceC.value.trim(),
        D: els.choiceD.value.trim(),
      },
      correctAnswer: els.authorAnswer.value,
      explanation: els.authorExplanation.value.trim(),
    };
  const author = currentAccount();
  draft.createdBy = author?.id || "unknown";
  draft.createdByRole = author?.role || "unknown";
  if (!isContentAdmin()) {
    draft.visibility = "private_family";
    draft.reviewStatus = "needs_review";
    draft.publicationStatus = "parent_contribution_needs_review";
  }

  draft.safetyReport = runDraftSafetyChecks(draft, {
    brief: `Manual original draft entered by ${isContentAdmin() ? "Content Admin" : "Parent Contributor"}.`,
    sourceReference: "manual_authoring",
    sourceSignal: null,
  });
  if (draft.safetyReport.blocked) {
    alert(`This draft is blocked by the duplicate/skeleton check: ${draft.safetyReport.blocks.join(" ")}`);
    return;
  }
  state.questions.unshift(draft);

  els.authorForm.reset();
  saveState();
  currentIndex = 0;
  switchView("practice");
}

function rewardManagerStudents(account = currentAccount()) {
  return linkedStudentAccountsFor(account).filter((student) => student.role === "student");
}

function visibleRewardProgramsForManager(account = currentAccount()) {
  if (!account) return [];
  const students = rewardManagerStudents(account);
  const studentIds = new Set(students.map((student) => student.id));
  return (state.rewardPrograms || [])
    .map(normalizeRewardProgram)
    .filter(Boolean)
    .filter((program) => {
      if (account.role === "admin") return true;
      if (program.ownerAccountId === account.id) return true;
      return program.targetStudentIds.some((id) => studentIds.has(id));
    })
    .sort((a, b) => (a.status === b.status ? a.title.localeCompare(b.title) : a.status === "active" ? -1 : 1));
}

function visibleRewardClaimsForManager(account = currentAccount()) {
  const studentIds = new Set(rewardManagerStudents(account).map((student) => student.id));
  return (state.rewardClaims || [])
    .map(normalizeRewardClaim)
    .filter(Boolean)
    .filter((claim) => studentIds.has(claim.studentId))
    .sort((a, b) => Date.parse(b.requestedAt || "") - Date.parse(a.requestedAt || ""));
}

function renderRewardAdminPanel() {
  if (!els.rewardAdminPanel) return;
  const account = currentAccount();
  const allowed = canManageRewards(account);
  els.rewardAdminPanel.hidden = !allowed;
  if (!allowed) return;
  const students = rewardManagerStudents(account);
  if (els.rewardScope) {
    const admin = isContentAdmin();
    els.rewardScope.disabled = !admin;
    if (!admin) els.rewardScope.value = "family";
  }
  if (els.rewardTargetStudent) {
    els.rewardTargetStudent.innerHTML =
      '<option value="">All linked students</option>' +
      students.map((student) => `<option value="${escapeHtml(student.id)}">${escapeHtml(student.name || student.id)}</option>`).join("");
  }
  const programs = visibleRewardProgramsForManager(account);
  const claims = visibleRewardClaimsForManager(account);
  const programById = new Map((state.rewardPrograms || []).map((program) => [program.id, program]));
  const studentById = new Map(students.map((student) => [student.id, student]));
  els.rewardAdminList.innerHTML = `
    <div class="reward-admin-summary">
      <div><strong>${programs.length}</strong><span>programs</span></div>
      <div><strong>${programs.filter((program) => program.status === "active").length}</strong><span>active</span></div>
      <div><strong>${claims.filter((claim) => claim.status === "pending").length}</strong><span>pending claims</span></div>
      <div><strong>${students.length}</strong><span>eligible students</span></div>
    </div>
    <div class="reward-admin-grid">
      <section>
        <h3>Programs</h3>
        ${
          programs.length
            ? programs
                .map((program) => {
                  const targetNames = program.scope === "global"
                    ? "All students"
                    : program.targetStudentIds.length
                      ? program.targetStudentIds.map((id) => state.accounts.find((item) => item.id === id)?.name || id).join(", ")
                      : "Linked students";
                  const nextStatus = program.status === "active" ? "paused" : "active";
                  return `
                    <article class="reward-admin-card">
                      <div>
                        <span class="pill">${escapeHtml(labelFor(program.scope))} - ${escapeHtml(labelFor(program.status))}</span>
                        <h4>${escapeHtml(program.title)}</h4>
                        <p>${escapeHtml(program.description || "")}</p>
                        <small>${Number(program.costPoints)} pts - ${escapeHtml(labelFor(program.rewardType))} - ${escapeHtml(targetNames)}</small>
                      </div>
                      <div class="table-actions">
                        <button class="button tiny secondary" type="button" data-reward-admin-action="status" data-reward-id="${escapeHtml(program.id)}" data-reward-status="${escapeHtml(nextStatus)}">${program.status === "active" ? "Pause" : "Activate"}</button>
                        <button class="button tiny danger" type="button" data-reward-admin-action="delete" data-reward-id="${escapeHtml(program.id)}">Delete</button>
                      </div>
                    </article>
                  `;
                })
                .join("")
            : '<div class="empty-state">No reward program yet.</div>'
        }
      </section>
      <section>
        <h3>Claims</h3>
        ${
          claims.length
            ? claims
                .map((claim) => {
                  const program = programById.get(claim.programId);
                  const student = studentById.get(claim.studentId) || state.accounts.find((item) => item.id === claim.studentId);
                  return `
                    <article class="reward-admin-card claim-${escapeHtml(claim.status)}">
                      <div>
                        <span class="pill">${escapeHtml(labelFor(claim.status))}</span>
                        <h4>${escapeHtml(program?.title || claim.programId)}</h4>
                        <p>${escapeHtml(student?.name || claim.studentId)} - ${Number(claim.costPoints)} pts - ${escapeHtml(formatDateTime(claim.requestedAt))}</p>
                      </div>
                      <div class="table-actions">
                        <button class="button tiny primary" type="button" data-reward-admin-action="fulfill" data-claim-id="${escapeHtml(claim.id)}" ${claim.status === "pending" ? "" : "disabled"}>Fulfill</button>
                        <button class="button tiny secondary" type="button" data-reward-admin-action="cancel-claim" data-claim-id="${escapeHtml(claim.id)}" ${claim.status === "pending" ? "" : "disabled"}>Cancel</button>
                      </div>
                    </article>
                  `;
                })
                .join("")
            : '<div class="empty-state">No redemption requests yet.</div>'
        }
      </section>
    </div>
  `;
  localizeDynamicUiText(els.rewardAdminPanel);
}

function addRewardProgram(event) {
  event.preventDefault();
  const account = currentAccount();
  if (!canManageRewards(account)) {
    alert("This account cannot manage rewards.");
    return;
  }
  const title = els.rewardTitle.value.trim();
  if (!title) {
    alert("Reward title is required.");
    return;
  }
  const targetStudentId = els.rewardTargetStudent.value || "";
  const program = normalizeRewardProgram({
    title,
    description: els.rewardDescription.value,
    costPoints: els.rewardCost.value,
    rewardType: els.rewardType.value,
    scope: isContentAdmin() && els.rewardScope.value === "global" ? "global" : "family",
    status: els.rewardStatus.value,
    ownerAccountId: account.id,
    targetStudentIds: targetStudentId ? [targetStudentId] : [],
    createdAt: new Date().toISOString(),
  });
  if (!Array.isArray(state.rewardPrograms)) state.rewardPrograms = [];
  state.rewardPrograms.unshift(program);
  els.rewardProgramForm.reset();
  els.rewardCost.value = 60;
  els.rewardStatus.value = "active";
  if (!isContentAdmin()) els.rewardScope.value = "family";
  saveState();
  renderRewardAdminPanel();
  renderStudentRewardStore();
}

function handleRewardAdminAction(event) {
  const button = event.target.closest("[data-reward-admin-action]");
  if (!button || !canManageRewards()) return;
  const action = button.dataset.rewardAdminAction;
  if (action === "status") {
    const visibleIds = new Set(visibleRewardProgramsForManager().map((item) => item.id));
    if (!visibleIds.has(button.dataset.rewardId)) return;
    const program = (state.rewardPrograms || []).find((item) => item.id === button.dataset.rewardId);
    if (program) {
      program.status = button.dataset.rewardStatus === "paused" ? "paused" : "active";
      program.updatedAt = new Date().toISOString();
    }
  } else if (action === "delete") {
    const visibleIds = new Set(visibleRewardProgramsForManager().map((program) => program.id));
    if (visibleIds.has(button.dataset.rewardId)) {
      state.rewardPrograms = (state.rewardPrograms || []).filter((program) => program.id !== button.dataset.rewardId);
    }
  } else if (action === "fulfill" || action === "cancel-claim") {
    const visibleClaimIds = new Set(visibleRewardClaimsForManager().map((claim) => claim.id));
    if (!visibleClaimIds.has(button.dataset.claimId)) return;
    const claim = (state.rewardClaims || []).find((item) => item.id === button.dataset.claimId);
    if (claim && claim.status === "pending") {
      claim.status = action === "fulfill" ? "fulfilled" : "cancelled";
      claim.fulfilledBy = currentAccount()?.id || "";
      claim.fulfilledAt = new Date().toISOString();
      if (action === "cancel-claim") {
        const p = accountProfile(claim.studentId);
        const attendance = p.attendance || emptyProfile().attendance;
        attendance.spentPoints = Math.max(0, Number(attendance.spentPoints || 0) - Number(claim.costPoints || 0));
        p.attendance = attendance;
      }
    }
  }
  saveState();
  renderRewardAdminPanel();
  renderStudentRewardStore();
}

function addAccount(event) {
  event.preventDefault();
  const manager = currentAccount();
  if (!isAccountManager()) {
    alert("Only parent or admin accounts can create new accounts in this MVP.");
    return;
  }

  if (activeEditingAccountId) {
    saveAccountEdit();
    return;
  }

  const draft = SatAccountEngine.buildAccountDraft
    ? SatAccountEngine.buildAccountDraft(
        {
          name: els.accountName.value,
          email: els.accountEmail?.value || "",
          gradeLevel: els.accountGrade?.value || "",
          avatarInitials: els.accountAvatarInitials?.value || "",
          avatarColor: els.accountAvatarColor?.value || "",
          passcode: els.accountPasscode.value,
          scope: els.accountScope.value,
          role: els.accountRole.value,
          parentId: els.accountParentLink.value,
          targetScore: els.accountTarget.value,
          uiTheme: els.accountTheme.value,
          permissionRewards: Boolean(els.accountPermissionRewards?.checked),
          permissionAuthoring: Boolean(els.accountPermissionAuthoring?.checked),
          weeklyTarget: els.accountWeeklyTarget.value,
          nextSessionLocal: els.accountNextSession.value,
        },
        manager,
        { slugify },
      )
    : null;

  if (draft && !draft.ok) {
    alert(draft.reason || "Could not create account.");
    return;
  }

  const account = draft?.account || {
    id: `account-${slugify(els.accountName.value)}-${Date.now()}`,
    name: els.accountName.value.trim(),
    email: els.accountEmail?.value.trim() || "",
    gradeLevel: els.accountGrade?.value || "",
    avatarInitials: normalizeAvatarInitials(els.accountAvatarInitials?.value, els.accountName.value),
    avatarColor: normalizeAvatarColor(els.accountAvatarColor?.value),
    role: "student",
    scope: "family",
    passcode: els.accountPasscode.value.trim(),
    targetScore: Number(els.accountTarget.value) || 1450,
    uiTheme: els.accountTheme.value === "teen_quest" ? "teen_quest" : "studio",
    permissions: {
      rewardManager: Boolean(els.accountPermissionRewards?.checked),
      questionContributor: Boolean(els.accountPermissionAuthoring?.checked),
    },
    parentIds: [],
    studyPlan: {
      weeklyTarget: Number(els.accountWeeklyTarget.value) || 4,
      nextSessionAt: els.accountNextSession.value ? new Date(els.accountNextSession.value).toISOString() : "",
    },
  };
  if (!account.name || !account.passcode) {
    alert("Name and passcode are required.");
    return;
  }
  if (isPasscodeInUse(account.passcode)) {
    alert("That passcode is already used by another local account. Choose a different passcode.");
    return;
  }

  state.accounts.push(account);
  state.profiles[account.id] = emptyProfile();
  els.accountForm.reset();
  activeAccountTab = "list";
  renderAccountFormAccess();
  saveState();
  renderLoginOptions();
  renderAccounts();
}

function activeAdminCount(excludeId = "") {
  return state.accounts.filter((account) => account.role === "admin" && (account.status || "active") === "active" && account.id !== excludeId).length;
}

function canEditLocalAccount(target) {
  if (SatAccountEngine.canEditAccount) return SatAccountEngine.canEditAccount(state.accounts, currentAccount(), target);
  if (!target || !isAccountManager()) return false;
  if (canCreateAnyAccount()) return true;
  return target.role === "student" && Array.isArray(target.parentIds) && target.parentIds.includes(currentAccount()?.id);
}

function canDeleteLocalAccount(target) {
  if (SatAccountEngine.canDeleteAccount) return SatAccountEngine.canDeleteAccount(state.accounts, currentAccount(), target);
  if (!target || !canCreateAnyAccount() || target.id === currentAccount()?.id) return false;
  if (target.role === "admin" && activeAdminCount(target.id) < 1) return false;
  return true;
}

function canChangeLocalAccountStatus(target, nextStatus = "active") {
  if (SatAccountEngine.canChangeAccountStatus) return SatAccountEngine.canChangeAccountStatus(state.accounts, currentAccount(), target, nextStatus);
  if (!target || !canCreateAnyAccount()) return false;
  if (target.id === currentAccount()?.id && nextStatus !== "active") return false;
  if (target.role === "admin" && nextStatus !== "active" && activeAdminCount(target.id) < 1) return false;
  return true;
}

function datetimeLocalValue(isoValue = "") {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function beginAccountEdit(accountId) {
  const target = state.accounts.find((account) => account.id === accountId);
  if (!target || !canEditLocalAccount(target)) return;
  activeAccountTab = "form";
  activeEditingAccountId = target.id;
  els.accountName.value = target.name || "";
  if (els.accountEmail) els.accountEmail.value = target.email || "";
  if (els.accountGrade) els.accountGrade.value = target.gradeLevel || "";
  if (els.accountAvatarInitials) els.accountAvatarInitials.value = normalizeAvatarInitials(target.avatarInitials, target.name || target.id);
  if (els.accountAvatarColor) els.accountAvatarColor.value = normalizeAvatarColor(target.avatarColor);
  if (els.accountPermissionRewards) els.accountPermissionRewards.checked = target.permissions?.rewardManager !== false;
  if (els.accountPermissionAuthoring) els.accountPermissionAuthoring.checked = Boolean(target.permissions?.questionContributor);
  els.accountRole.value = target.role || "student";
  els.accountScope.value = target.scope || "family";
  els.accountPasscode.value = target.passcode || "";
  els.accountTarget.value = target.targetScore || 1450;
  els.accountTheme.value = target.uiTheme === "teen_quest" ? "teen_quest" : "studio";
  els.accountWeeklyTarget.value = Number(target.studyPlan?.weeklyTarget || 4);
  els.accountNextSession.value = datetimeLocalValue(target.studyPlan?.nextSessionAt || "");
  renderAccountFormAccess();
  if (els.accountParentLink) {
    els.accountParentLink.value = target.parentIds?.[0] || "";
  }
  renderAccounts();
  switchAccountTab("form");
}

function cancelAccountEdit() {
  activeEditingAccountId = "";
  activeAccountTab = "list";
  els.accountForm.reset();
  renderAccountFormAccess();
  renderAccounts();
}

function saveAccountEdit() {
  const target = state.accounts.find((account) => account.id === activeEditingAccountId);
  if (!target || !canEditLocalAccount(target)) {
    cancelAccountEdit();
    return;
  }
  const name = els.accountName.value.trim();
  const passcode = els.accountPasscode.value.trim();
  if (!name || !passcode) {
    alert("Name and passcode are required.");
    return;
  }
  if (isPasscodeInUse(passcode, target.id)) {
    alert("That passcode is already used by another local account. Choose a different passcode.");
    return;
  }
  const admin = canCreateAnyAccount();
  const nextRole = admin ? els.accountRole.value : target.role;
  const nextScope = admin ? els.accountScope.value : target.scope;
  if (target.id === currentAccount()?.id && nextRole !== "admin") {
    alert("You cannot remove admin access from the account you are currently using.");
    return;
  }
  if (target.role === "admin" && nextRole !== "admin" && activeAdminCount(target.id) < 1) {
    alert("At least one active Content Admin account is required.");
    return;
  }
  target.name = name;
  target.email = els.accountEmail?.value.trim() || "";
  target.gradeLevel = els.accountGrade?.value || "";
  target.avatarInitials = normalizeAvatarInitials(els.accountAvatarInitials?.value, name);
  target.avatarColor = normalizeAvatarColor(els.accountAvatarColor?.value);
  target.passcode = passcode;
  target.role = ["admin", "parent", "student"].includes(nextRole) ? nextRole : "student";
  target.scope = nextScope === "public" ? "public" : "family";
  target.targetScore = Number(els.accountTarget.value) || 1450;
  target.uiTheme = els.accountTheme.value === "teen_quest" ? "teen_quest" : "studio";
  target.permissions = normalizeAccountPermissions({
    ...target,
    role: target.role,
    permissions: {
      rewardManager: Boolean(els.accountPermissionRewards?.checked),
      questionContributor: Boolean(els.accountPermissionAuthoring?.checked),
    },
  });
  target.studyPlan = {
    weeklyTarget: Number(els.accountWeeklyTarget.value) || 4,
    nextSessionAt: els.accountNextSession.value ? new Date(els.accountNextSession.value).toISOString() : "",
  };
  target.parentIds = target.role === "student" && target.scope !== "public" ? [els.accountParentLink.value].filter(Boolean) : [];
  state.profiles[target.id] = accountProfile(target.id);
  activeEditingAccountId = "";
  activeAccountTab = "list";
  els.accountForm.reset();
  saveState();
  renderLoginOptions();
  renderAccountFormAccess();
  renderAccounts();
}

function updateLocalAccountStatus(accountId, status) {
  const target = state.accounts.find((account) => account.id === accountId);
  const nextStatus = ["active", "suspended", "disabled"].includes(status) ? status : "active";
  if (!target || !canChangeLocalAccountStatus(target, nextStatus)) return;
  target.status = nextStatus;
  if (state.activeAccountId === target.id && nextStatus !== "active") {
    state.activeAccountId = null;
  }
  saveState();
  renderLoginOptions();
  renderAuth();
}

function deleteLocalAccount(accountId) {
  const target = state.accounts.find((account) => account.id === accountId);
  if (!target || !canDeleteLocalAccount(target)) return;
  const confirmed = window.confirm(`Delete ${target.name || target.id}? This removes the local account and profile from this browser.`);
  if (!confirmed) return;
  state.accounts = state.accounts.filter((account) => account.id !== target.id);
  delete state.profiles[target.id];
  state.accounts.forEach((account) => {
    if (Array.isArray(account.parentIds)) account.parentIds = account.parentIds.filter((id) => id !== target.id);
  });
  if (activeEditingAccountId === target.id) activeEditingAccountId = "";
  activeAccountTab = "list";
  saveState();
  renderLoginOptions();
  renderAccountFormAccess();
  renderAccounts();
}

function handleAccountListAction(event) {
  const button = event.target.closest("[data-account-action]");
  if (!button) return;
  const accountId = button.dataset.accountId || "";
  const action = button.dataset.accountAction || "";
  if (action === "edit") beginAccountEdit(accountId);
  else if (action === "status") updateLocalAccountStatus(accountId, button.dataset.accountStatus || "active");
  else if (action === "delete") deleteLocalAccount(accountId);
}

function renderAccounts() {
  const account = currentAccount();
  const canManage = isAccountManager();
  renderAccountFormAccess();
  renderPublicBackendPanel();
  renderRewardAdminPanel();
  els.accountForm.classList.toggle("locked", !canManage);
  if (els.accountSubmit) els.accountSubmit.textContent = activeEditingAccountId ? "Save Account" : "Create Account";
  if (els.accountCancelEdit) els.accountCancelEdit.hidden = !activeEditingAccountId;

  els.accountOverview.innerHTML = renderAccountOverview(account);

  const visibleAccounts =
    SatAccountEngine.visibleAccountsFor
      ? SatAccountEngine.visibleAccountsFor(state.accounts, account)
      : account?.role === "admin"
        ? state.accounts
        : account?.role === "parent"
          ? [account, ...linkedStudentAccountsFor(account)]
          : account
            ? [account]
            : [];

  els.accountList.innerHTML = visibleAccounts
    .map((item) => {
      const p = accountProfile(item.id);
      const latest = p.pretests?.[0];
      const scope = item.scope || "family";
      const progress = accountProgressSummary(item);
      const parents = (item.parentIds || []).map((id) => state.accounts.find((parent) => parent.id === id)?.name).filter(Boolean);
      const theme = item.uiTheme === "teen_quest" ? "Teen Quest" : "Focus Studio";
      return `
        <div class="list-item">
          <h3>${escapeHtml(item.name)} · ${escapeHtml(item.role)} · ${escapeHtml(labelFor(scope))}</h3>
          <p>Target ${item.targetScore || "--"} · ${p.attempts?.length || 0} attempts · ${
            latest ? `baseline ${latest.scoreEstimate}` : "no diagnostic"
          }</p>
          <p>Interface theme: ${escapeHtml(theme)}</p>
          <p>Accuracy ${progress.accuracy}% · Study points ${progress.points} · Streak ${progress.streak} days · ${escapeHtml(progress.schedule)}</p>
          ${parents.length ? `<p>Linked parent: ${escapeHtml(parents.join(", "))}</p>` : ""}
          <p>${scope === "public" ? "Public learner: private family vault is hidden." : "Family account: can access private family materials on this local app."}</p>
          <p>Local passcode access only. Public release needs real authentication and server-side permissions.</p>
        </div>
      `;
    })
    .join("");

  const progressById = Object.fromEntries(visibleAccounts.map((item) => [item.id, accountProgressSummary(item)]));
  const latestById = Object.fromEntries(visibleAccounts.map((item) => [item.id, accountProfile(item.id).pretests?.[0] || null]));
  const parentNameById = new Map(state.accounts.map((item) => [item.id, item.name]));
  const parentNamesById = Object.fromEntries(
    visibleAccounts.map((item) => [
      item.id,
      (item.parentIds || []).map((id) => parentNameById.get(id)).filter(Boolean),
    ]),
  );
  const canDeleteById = Object.fromEntries(visibleAccounts.map((item) => [item.id, canDeleteLocalAccount(item)]));
  const canEditById = Object.fromEntries(visibleAccounts.map((item) => [item.id, canEditLocalAccount(item)]));
  const canChangeStatusById = Object.fromEntries(visibleAccounts.map((item) => [item.id, canChangeLocalAccountStatus(item, (item.status || "active") === "active" ? "suspended" : "active")]));
  els.accountOverview.innerHTML = renderAccountOverview(account, { progressById });
  if (SatAccountViewRenderers.renderAccountList) {
    els.accountList.innerHTML = SatAccountViewRenderers.renderAccountList(visibleAccounts, {
      canChangeStatusById,
      canDeleteById,
      canEditById,
      canEdit: canManage,
      currentAccountId: account?.id || "",
      labelFor,
      latestById,
      parentNamesById,
      progressById,
    });
  }
  switchAccountTab(activeAccountTab);
}

function renderAccountFormAccess() {
  if (!els.accountForm || !els.accountParentLink) return;
  const account = currentAccount();
  const access = SatAccountEngine.buildAccountFormAccess
    ? SatAccountEngine.buildAccountFormAccess({
        accounts: state.accounts,
        manager: account,
        selectedScope: els.accountScope.value,
        selectedRole: els.accountRole.value,
      })
    : null;
  const canManage = access ? access.canManage : isAccountManager();
  const admin = access ? access.admin : canCreateAnyAccount();

  els.accountForm.querySelectorAll("input, select, button").forEach((node) => {
    node.disabled = !canManage;
  });
  if (!canManage) return;

  if (access) {
    els.accountScope.value = access.scope;
    els.accountRole.value = access.role;
    els.accountRole.disabled = access.roleDisabled;
    els.accountScope.disabled = access.scopeDisabled;
  } else if (admin && els.accountScope.value === "public") {
    els.accountRole.value = "student";
    els.accountRole.disabled = true;
  } else if (!admin) {
    els.accountRole.value = "student";
    els.accountScope.value = "family";
    els.accountRole.disabled = true;
    els.accountScope.disabled = true;
  } else {
    els.accountRole.disabled = false;
    els.accountScope.disabled = false;
  }

  const scope = access ? access.scope : admin && els.accountScope.value === "public" ? "public" : "family";
  const role = access ? access.role : admin ? els.accountRole.value : "student";
  [els.accountPermissionRewards, els.accountPermissionAuthoring].forEach((node) => {
    if (!node) return;
    node.disabled = !admin || role !== "parent";
  });
  const parents = state.accounts.filter((item) => item.role === "parent" && item.scope !== "public");
  const allowedParents = access?.allowedParents || (account?.role === "parent" && !admin ? parents.filter((item) => item.id === account.id) : parents);
  els.accountParentLink.innerHTML =
    '<option value="">No linked parent</option>' +
    allowedParents.map((parent) => `<option value="${parent.id}">${escapeHtml(parent.name)}</option>`).join("");

  if (access?.forcedParentId) els.accountParentLink.value = access.forcedParentId;
  else if (account?.role === "parent" && !admin) els.accountParentLink.value = account.id;
  els.accountParentLink.disabled = access ? access.parentLinkDisabled : !canManage || role !== "student" || scope === "public" || (account?.role === "parent" && !admin);
}

function publicBackendState() {
  if (!state.publicBackend || typeof state.publicBackend !== "object") {
    state.publicBackend = normalizePublicBackendState({});
  }
  state.publicBackend = normalizePublicBackendState(state.publicBackend);
  return state.publicBackend;
}

function publicBackendToken() {
  try {
    sessionStorage.removeItem(PUBLIC_BACKEND_TOKEN_KEY);
  } catch {
    // Session storage can be disabled; HttpOnly cookie auth remains the source of truth.
  }
  try {
    return publicBackendState().account ? PUBLIC_BACKEND_COOKIE_SESSION : "";
  } catch {
    return "";
  }
}

function setPublicBackendToken(token = "") {
  try {
    sessionStorage.removeItem(PUBLIC_BACKEND_TOKEN_KEY);
  } catch {
    // Session storage can be disabled in hardened browsers; the app still works with cookie auth.
  }
}

function publicBackendBaseUrl() {
  const backend = publicBackendState();
  return (els.publicBackendUrl?.value || backend.baseUrl || "/api/public").trim() || "/api/public";
}

function setPublicBackendStatus(level, title, message, extra = {}) {
  const backend = publicBackendState();
  backend.statusLevel = ["ok", "warning", "error"].includes(level) ? level : "warning";
  backend.statusTitle = title || "Backend status";
  backend.statusMessage = message || "";
  Object.assign(backend, extra);
  saveState();
  renderPublicBackendPanel();
}

function renderPublicBackendPanel() {
  if (!els.publicBackendStatus) return;
  const backend = publicBackendState();
  const token = publicBackendToken();
  if (els.publicBackendUrl && !els.publicBackendUrl.value) {
    els.publicBackendUrl.value = backend.baseUrl || "/api/public";
  }
  if (els.publicBackendAutoSync) {
    els.publicBackendAutoSync.checked = backend.autoSync !== false;
  }
  const loggedIn = Boolean(token && backend.account);
  const canAdmin = backend.account && ["admin", "content_admin"].includes(backend.account.role);
  els.publicBackendRefresh.disabled = !loggedIn;
  els.publicBackendSyncProgress.disabled = !loggedIn || !currentAccount();
  els.publicBackendSyncProfile.disabled = !loggedIn || !currentAccount();
  els.publicBackendLoadProfile.disabled = !loggedIn || !currentAccount();
  els.publicBackendApplyProfile.disabled =
    !loggedIn ||
    !currentAccount() ||
    !pendingServerProfileRecord ||
    backend.pendingServerProfileLoadedFor !== backend.account?.id ||
    backend.pendingServerProfileLocalAccountId !== currentAccount()?.id;
  els.publicBackendExport.disabled = !loggedIn || !canAdmin;
  els.publicBackendMonitoring.disabled = !loggedIn || !canAdmin;
  els.publicBackendLogout.disabled = !loggedIn;
  els.publicBackendBootstrap.disabled = !canCreateAnyAccount();
  const rendered = SatViewRenderers.renderPublicBackendStatus
    ? SatViewRenderers.renderPublicBackendStatus(backend, {
        formatDateTime,
        formatBytes,
        hasPendingProfileRecord: Boolean(pendingServerProfileRecord),
      })
    : { className: `public-backend-status ${escapeHtml(backend.statusLevel || "warning")}`, html: escapeHtml(backend.statusMessage || "") };
  els.publicBackendStatus.className = rendered.className;
  els.publicBackendStatus.innerHTML = rendered.html;
}

async function checkPublicBackendHealth() {
  const baseUrl = publicBackendBaseUrl();
  try {
    const health = await SatPublicApi.health({ baseUrl });
    setPublicBackendStatus("ok", "Backend reachable", `${health.service || "SAT Studio backend"} is responding.`, {
      baseUrl,
      lastHealth: health,
    });
  } catch (error) {
    setPublicBackendStatus("error", "Backend unreachable", error.message || "Could not reach /api/public/health.", { baseUrl });
  }
}

function publicBackendCredentials() {
  return {
    username: (els.publicBackendUsername?.value || "").trim(),
    password: els.publicBackendPassword?.value || "",
  };
}

async function bootstrapPublicBackendAdmin() {
  if (!canCreateAnyAccount()) {
    alert("Only a local content admin can bootstrap the public backend admin.");
    return;
  }
  const baseUrl = publicBackendBaseUrl();
  const credentials = publicBackendCredentials();
  if (!credentials.username || !credentials.password) {
    alert("Enter a backend username and password first.");
    return;
  }
  try {
    const result = await SatPublicApi.bootstrapAdmin(
      {
        username: credentials.username,
        password: credentials.password,
        displayName: currentAccount()?.name || credentials.username,
      },
      { baseUrl },
    );
    setPublicBackendStatus("ok", "Backend admin created", `Created ${result.account?.username || credentials.username}. You can now login.`, {
      baseUrl,
      account: result.account || null,
    });
  } catch (error) {
    setPublicBackendStatus("error", "Bootstrap failed", error.message || "Could not bootstrap admin.", { baseUrl });
  }
}

async function loginPublicBackend() {
  const baseUrl = publicBackendBaseUrl();
  const credentials = publicBackendCredentials();
  if (!credentials.username || !credentials.password) {
    alert("Enter a backend username and password first.");
    return;
  }
  try {
    const result = await SatPublicApi.login(credentials, { baseUrl });
    setPublicBackendToken(result.token || "");
    if (els.publicBackendPassword) els.publicBackendPassword.value = "";
    clearPendingServerProfile(publicBackendState());
    setPublicBackendStatus("ok", "Backend session active", `Logged in as ${result.account?.username || credentials.username}.`, {
      baseUrl,
      account: result.account || null,
      sessionExpiresAt: Number(result.expiresAt || 0),
    });
    if (publicBackendState().autoSync !== false) {
      await syncCurrentProgressToPublicBackend({ silent: true });
    }
  } catch (error) {
    setPublicBackendToken("");
    setPublicBackendStatus("error", "Backend login failed", error.message || "Invalid backend credentials.", {
      baseUrl,
      account: null,
      sessionExpiresAt: 0,
    });
  }
}

async function refreshPublicBackendSession() {
  const token = publicBackendToken();
  if (!token) {
    alert("Login to the public backend before refreshing the session.");
    return;
  }
  const baseUrl = publicBackendBaseUrl();
  try {
    const result = await SatPublicApi.refreshSession(token, { baseUrl });
    setPublicBackendToken(result.token || "");
    setPublicBackendStatus("ok", "Backend session refreshed", `Session rotated for ${result.account?.username || "backend account"}.`, {
      baseUrl,
      account: result.account || publicBackendState().account,
      sessionExpiresAt: Number(result.expiresAt || 0),
    });
  } catch (error) {
    setPublicBackendToken("");
    setPublicBackendStatus("error", "Session refresh failed", error.message || "Login again to continue syncing.", {
      baseUrl,
      account: null,
      sessionExpiresAt: 0,
    });
  }
}

async function syncCurrentProgressToPublicBackend(options = {}) {
  const token = publicBackendToken();
  const backend = publicBackendState();
  const account = currentAccount();
  if (!token || !backend.account || !account) {
    if (!options.silent) alert("Login to the public backend before syncing progress.");
    return;
  }
  const baseUrl = publicBackendBaseUrl();
  try {
    const snapshot = SatPublicApi.buildProgressSnapshot(profile(), account);
    const saved = await SatPublicApi.saveProgress(token, backend.account.id, snapshot, { baseUrl });
    setPublicBackendStatus("ok", options.silent ? "Backend session active" : "Progress synced", `Synced ${account.name} to backend account ${backend.account.username || backend.account.id}.`, {
      baseUrl,
      lastSyncAt: new Date().toISOString(),
      lastServerProgressAt: saved.updatedAt || "",
    });
  } catch (error) {
    setPublicBackendStatus(options.silent ? "warning" : "error", options.silent ? "Backend login ok; sync skipped" : "Progress sync failed", error.message || "Could not sync progress.", { baseUrl });
  }
}

function canAutoSyncLearningProfile() {
  const backend = publicBackendState();
  return Boolean(
    backend.autoSync !== false &&
      publicBackendToken() &&
      backend.account &&
      SatPublicApi.buildFullProfileSnapshot &&
      SatPublicApi.saveProfile &&
      currentAccount(),
  );
}

function markLearningProfileLocalOnly(reason = "local_save") {
  const backend = publicBackendState();
  backend.lastLearningSyncMode = "local";
  backend.lastLearningSyncReason = reason;
  backend.lastLearningSyncAt = new Date().toISOString();
}

function requestLearningProfileSync(reason = "learning_update", options = {}) {
  const normalizedReason = String(reason || "learning_update");
  if (!canAutoSyncLearningProfile()) {
    markLearningProfileLocalOnly(normalizedReason);
    return Promise.resolve(false);
  }
  pendingLearningProfileSyncReason = normalizedReason;
  if (learningProfileSyncTimer) {
    window.clearTimeout(learningProfileSyncTimer);
    learningProfileSyncTimer = null;
  }
  if (options.immediate) return flushLearningProfileSync();
  learningProfileSyncTimer = window.setTimeout(() => {
    learningProfileSyncTimer = null;
    flushLearningProfileSync();
  }, Number(options.delayMs || 900));
  return Promise.resolve(true);
}

async function flushLearningProfileSync() {
  if (learningProfileSyncInFlight) return false;
  if (!canAutoSyncLearningProfile()) {
    markLearningProfileLocalOnly(pendingLearningProfileSyncReason || "local_save");
    pendingLearningProfileSyncReason = "";
    return false;
  }
  const reason = pendingLearningProfileSyncReason || "learning_update";
  pendingLearningProfileSyncReason = "";
  learningProfileSyncInFlight = true;
  try {
    await syncFullProfileToPublicBackend({ silent: true, reason });
    const backend = publicBackendState();
    backend.lastLearningSyncMode = "backend";
    backend.lastLearningSyncReason = reason;
    backend.lastLearningSyncAt = new Date().toISOString();
    saveState();
    return true;
  } finally {
    learningProfileSyncInFlight = false;
    if (pendingLearningProfileSyncReason) requestLearningProfileSync(pendingLearningProfileSyncReason);
  }
}

function serverProfileSummary(record = {}) {
  const profileBody = record.profile?.profile || record.profile || {};
  const summary = record.profile?.summary || {};
  const attempts = summary.attempts ?? (Array.isArray(profileBody.attempts) ? profileBody.attempts.length : 0);
  const pretests = summary.pretests ?? (Array.isArray(profileBody.pretests) ? profileBody.pretests.length : 0);
  return {
    attempts: Number(attempts || 0),
    pretests: Number(pretests || 0),
    targetScore: Number(summary.targetScore || record.profile?.account?.targetScore || 0),
  };
}

function serverProfileBody(record = {}) {
  const snapshot = record.profile && typeof record.profile === "object" ? record.profile : {};
  if (snapshot.profile && typeof snapshot.profile === "object") return snapshot.profile;
  return {};
}

function profileCounter(profileBody = {}) {
  return {
    attempts: Array.isArray(profileBody.attempts) ? profileBody.attempts.length : 0,
    pretests: Array.isArray(profileBody.pretests) ? profileBody.pretests.length : 0,
    studyNotes: Array.isArray(profileBody.studyNotes) ? profileBody.studyNotes.length : 0,
    vocabKnown: Array.isArray(profileBody.vocabKnown) ? profileBody.vocabKnown.length : 0,
    lessonProgress: profileBody.lessonProgress && typeof profileBody.lessonProgress === "object" ? Object.keys(profileBody.lessonProgress).length : 0,
    practiceReports: Array.isArray(profileBody.practiceSessionReports) ? profileBody.practiceSessionReports.length : 0,
    learningEvents: Array.isArray(profileBody.learningEvents) ? profileBody.learningEvents.length : 0,
  };
}

function buildProfileDiffSummary(serverRecord = {}, localProfile = {}) {
  const local = profileCounter(localProfile);
  const server = profileCounter(serverProfileBody(serverRecord));
  const changedKeys = Object.keys(local).filter((key) => Number(local[key] || 0) !== Number(server[key] || 0));
  return {
    local,
    server,
    changedKeys,
    changedCount: changedKeys.length,
  };
}

function clearPendingServerProfile(backend = publicBackendState()) {
  pendingServerProfileRecord = null;
  backend.pendingServerProfileAt = "";
  backend.pendingServerProfileRevision = 0;
  backend.pendingServerProfileLoadedFor = "";
  backend.pendingServerProfileLocalAccountId = "";
  backend.pendingServerProfileSummary = null;
  backend.pendingServerProfileDiff = null;
}

async function syncFullProfileToPublicBackend(options = {}) {
  const token = publicBackendToken();
  const backend = publicBackendState();
  const account = currentAccount();
  if (!token || !backend.account || !account) {
    if (!options.silent) alert("Login to the public backend before syncing the full profile.");
    return;
  }
  const baseUrl = publicBackendBaseUrl();
  try {
    const snapshot = SatPublicApi.buildFullProfileSnapshot(profile(), account);
    const saved = await SatPublicApi.saveProfile(token, backend.account.id, snapshot, {
      baseUrl,
      baseServerRevision: backend.lastServerProfileRevision || undefined,
      clientRevision: Date.now(),
      mergeStrategy: "reject_conflict",
    });
    setPublicBackendStatus("ok", options.silent ? "Learning profile synced" : "Full profile synced", `Saved full learner profile revision ${saved.serverRevision || 0} for ${account.name}.`, {
      baseUrl,
      lastProfileSyncAt: saved.updatedAt || new Date().toISOString(),
      lastServerProfileAt: saved.updatedAt || "",
      lastServerProfileRevision: Number(saved.serverRevision || 0),
      lastServerProfileSummary: serverProfileSummary(saved),
      lastLearningSyncAt: saved.updatedAt || new Date().toISOString(),
      lastLearningSyncReason: options.reason || "manual_profile_sync",
      lastLearningSyncMode: "backend",
      pendingServerProfileAt: "",
      pendingServerProfileRevision: 0,
      pendingServerProfileLoadedFor: "",
      pendingServerProfileLocalAccountId: "",
      pendingServerProfileSummary: null,
      pendingServerProfileDiff: null,
    });
    pendingServerProfileRecord = null;
  } catch (error) {
    const payload = error.payload || {};
    if (payload.serverProfile) {
      pendingServerProfileRecord = {
        accountId: payload.accountId || backend.account.id,
        source: payload.source || "sat_studio_profile",
        profile: payload.serverProfile,
        serverRevision: Number(payload.serverRevision || 0),
        updatedAt: payload.updatedAt || "",
      };
    }
    const extra = payload.serverRevision
      ? {
          lastServerProfileAt: payload.updatedAt || "",
          lastServerProfileRevision: Number(payload.serverRevision || 0),
          lastServerProfileSummary: serverProfileSummary({ profile: payload.serverProfile || {} }),
          pendingServerProfileAt: payload.updatedAt || new Date().toISOString(),
          pendingServerProfileRevision: Number(payload.serverRevision || 0),
          pendingServerProfileLoadedFor: backend.account.id,
          pendingServerProfileLocalAccountId: account.id,
          pendingServerProfileSummary: serverProfileSummary({ profile: payload.serverProfile || {} }),
          pendingServerProfileDiff: buildProfileDiffSummary(pendingServerProfileRecord || {}, profile()),
        }
      : {};
    setPublicBackendStatus(error.status === 409 ? "warning" : "error", options.silent ? "Learning profile sync queued locally" : error.status === 409 ? "Profile conflict detected" : "Full profile sync failed", error.message || "Could not sync full profile.", {
      baseUrl,
      lastLearningSyncAt: new Date().toISOString(),
      lastLearningSyncReason: options.reason || "profile_sync_failed",
      lastLearningSyncMode: "local",
      ...extra,
    });
  }
}

async function loadPublicBackendProfileSummary() {
  const token = publicBackendToken();
  const backend = publicBackendState();
  const account = currentAccount();
  if (!token || !backend.account) {
    alert("Login to the public backend before loading the server profile.");
    return;
  }
  const baseUrl = publicBackendBaseUrl();
  try {
    const loaded = await SatPublicApi.getProfile(token, backend.account.id, { baseUrl });
    pendingServerProfileRecord = loaded;
    setPublicBackendStatus("ok", "Server profile loaded", `Server revision ${loaded.serverRevision || 0} loaded for review. Local profile was not overwritten.`, {
      baseUrl,
      lastServerProfileAt: loaded.updatedAt || new Date().toISOString(),
      lastServerProfileRevision: Number(loaded.serverRevision || 0),
      lastServerProfileSummary: serverProfileSummary(loaded),
      pendingServerProfileAt: loaded.updatedAt || new Date().toISOString(),
      pendingServerProfileRevision: Number(loaded.serverRevision || 0),
      pendingServerProfileLoadedFor: backend.account.id,
      pendingServerProfileLocalAccountId: account?.id || "",
      pendingServerProfileSummary: serverProfileSummary(loaded),
      pendingServerProfileDiff: buildProfileDiffSummary(loaded, profile()),
    });
  } catch (error) {
    setPublicBackendStatus("error", "Server profile load failed", error.message || "Could not load server profile.", { baseUrl });
  }
}

async function applyPendingServerProfile() {
  const backend = publicBackendState();
  const account = currentAccount();
  if (!pendingServerProfileRecord || !account || !backend.account) {
    alert("Load a server profile first, then review the comparison before applying it.");
    return;
  }
  if (backend.pendingServerProfileLoadedFor !== backend.account.id || backend.pendingServerProfileLocalAccountId !== account.id) {
    alert("This pending server profile belongs to a different backend/local account pairing. Load it again before applying.");
    return;
  }
  const incomingProfile = serverProfileBody(pendingServerProfileRecord);
  if (!Object.keys(incomingProfile).length) {
    alert("The server profile is empty. Nothing was applied.");
    return;
  }
  const ok = confirm(
    `Apply server profile revision ${pendingServerProfileRecord.serverRevision || 0} to ${account.name}? This replaces the current local learner profile for this account.`,
  );
  if (!ok) return;

  state.profiles[account.id] = normalizeProfileRecord({
    ...JSON.parse(JSON.stringify(incomingProfile)),
    currentPretest: null,
  });
  accountProfile(account.id);
  clearPendingServerProfile(backend);
  setPublicBackendStatus("ok", "Server profile applied", `Applied server revision ${pendingServerProfileRecord?.serverRevision || 0} to ${account.name}.`, {
    baseUrl: publicBackendBaseUrl(),
    lastServerProfileAt: pendingServerProfileRecord?.updatedAt || new Date().toISOString(),
    lastServerProfileRevision: Number(pendingServerProfileRecord?.serverRevision || 0),
    lastServerProfileSummary: serverProfileSummary(pendingServerProfileRecord || {}),
  });
  pendingServerProfileRecord = null;
  render();
}

async function checkPublicBackendMonitoring() {
  const token = publicBackendToken();
  const backend = publicBackendState();
  if (!token || !backend.account) {
    alert("Login as a backend admin before checking monitoring.");
    return;
  }
  const baseUrl = publicBackendBaseUrl();
  try {
    const monitoring = await SatPublicApi.monitoring(token, { baseUrl });
    setPublicBackendStatus("ok", "Backend monitoring checked", `${monitoring.counts?.accounts || 0} accounts, ${monitoring.counts?.openQuestionAudits || 0} open audits.`, {
      baseUrl,
      lastMonitoring: monitoring,
    });
  } catch (error) {
    setPublicBackendStatus("error", "Backend monitoring failed", error.message || "Could not read monitoring data.", { baseUrl });
  }
}

async function exportPublicBackendSnapshot() {
  const token = publicBackendToken();
  const backend = publicBackendState();
  if (!token || !backend.account) {
    alert("Login to the public backend before exporting.");
    return;
  }
  const baseUrl = publicBackendBaseUrl();
  try {
    const snapshot = await SatPublicApi.exportSnapshot(token, { baseUrl });
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sat-studio-public-backend-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setPublicBackendStatus("ok", "Server snapshot exported", `${snapshot.accounts?.length || 0} accounts and ${snapshot.progressRecords?.length || 0} progress records exported.`, {
      baseUrl,
      lastExportAt: new Date().toISOString(),
    });
  } catch (error) {
    setPublicBackendStatus("error", "Server export failed", error.message || "Could not export backend snapshot.", { baseUrl });
  }
}

async function logoutPublicBackendSession() {
  const token = publicBackendToken();
  const baseUrl = publicBackendBaseUrl();
  if (token && SatPublicApi.logout) {
    try {
      await SatPublicApi.logout(token, { baseUrl });
    } catch {
      // Clear the browser copy even if the server session has already expired.
    }
  }
  setPublicBackendToken("");
  const backend = publicBackendState();
  clearPendingServerProfile(backend);
  backend.account = null;
  backend.sessionExpiresAt = 0;
  backend.statusLevel = "warning";
  backend.statusTitle = "Backend session cleared";
  backend.statusMessage = "Backend session was revoked or cleared from this browser tab.";
  saveState();
  renderPublicBackendPanel();
}

function renderAccountOverview(account, context = {}) {
  const students = linkedStudentAccountsFor(account);
  if (!account) return "";
  if (SatAccountViewRenderers.renderAccountOverview) {
    const progressById =
      context.progressById ||
      Object.fromEntries([account, ...students].filter(Boolean).map((item) => [item.id, accountProgressSummary(item)]));
    return SatAccountViewRenderers.renderAccountOverview(account, {
      progressById,
      storageHealth: buildStorageHealthSummary(),
      students,
    });
  }

  if (account.role === "student") {
    const progress = accountProgressSummary(account);
    return `
      <section class="account-overview-grid">
        ${renderStorageHealthCard()}
        ${renderAccountMetric("My Accuracy", `${progress.accuracy}%`, `${progress.attempts} attempts`)}
        ${renderAccountMetric("Study Points", progress.points, `${progress.streak} day streak`)}
        ${renderAccountMetric("Schedule", progress.schedule, `${progress.weeklyTarget} sessions/week`)}
      </section>
    `;
  }

  if (!students.length) {
    return `
      <section class="account-overview-grid">${renderStorageHealthCard()}</section>
      <div class="empty-state">No linked students yet. Create a student account and link it to a parent.</div>
    `;
  }

  return `
    <section class="account-overview-grid">
      ${renderStorageHealthCard()}
      ${students.map((student) => renderStudentMonitorCard(student)).join("")}
    </section>
  `;
}

function renderStudentMonitorCard(student) {
  const progress = accountProgressSummary(student);
  if (SatAccountViewRenderers.renderStudentMonitorCard) {
    return SatAccountViewRenderers.renderStudentMonitorCard(student, progress);
  }
  return `
    <article class="account-monitor-card">
      <div>
        <span>${escapeHtml(student.scope === "public" ? "Public student" : "Family student")}</span>
        <strong>${escapeHtml(student.name)}</strong>
      </div>
      <div class="account-monitor-stats">
        <span>${progress.accuracy}% accuracy</span>
        <span>${progress.attempts} attempts</span>
        <span>${progress.latestBaseline}</span>
      </div>
      <p>${escapeHtml(progress.schedule)} · ${progress.weeklyTarget} sessions/week</p>
      <p>${progress.points} points · ${progress.streak} day streak · ${progress.externalMinutes} outside minutes</p>
    </article>
  `;
}

function renderAccountMetric(label, value, caption) {
  if (SatAccountViewRenderers.renderAccountMetric) {
    return SatAccountViewRenderers.renderAccountMetric(label, value, caption);
  }
  return `
    <article class="account-monitor-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(caption || "")}</p>
    </article>
  `;
}

function buildStorageHealthSummary() {
  const snapshot = SatStorage.storedStateSnapshot
    ? SatStorage.storedStateSnapshot(localStorage, STORAGE_KEY)
    : { approximateBytes: JSON.stringify(state).length, chunked: false, chunks: 0, missingChunks: [] };
  const health = SatStorage.storageHealth ? SatStorage.storageHealth(snapshot) : { level: "ok", label: "Healthy", message: "Export periodically for safety." };
  const chunkLabel = snapshot.chunked ? `${snapshot.chunks} chunks` : "single record";
  const publicApiReady = Boolean(SatPublicApi.buildProgressSnapshot);
  return {
    bytesLabel: formatBytes(snapshot.approximateBytes || 0),
    chunkLabel,
    label: health.label,
    level: health.level,
    message: health.message,
    publicApiReady,
  };
}

function renderStorageHealthCard() {
  const storage = buildStorageHealthSummary();
  if (SatAccountViewRenderers.renderStorageHealthCard) {
    return SatAccountViewRenderers.renderStorageHealthCard(storage);
  }
  return `
    <article class="account-monitor-card storage-health ${escapeHtml(storage.level)}">
      <span>Local storage</span>
      <strong>${escapeHtml(storage.label)}</strong>
      <p>${escapeHtml(storage.bytesLabel)} stored - ${escapeHtml(storage.chunkLabel)}</p>
      <p>${escapeHtml(storage.message)} Use Export in the top bar for a JSON backup.</p>
      <p>${storage.publicApiReady ? "Public backend adapter ready: /api/public can sync accounts, progress, and audit logs after server login is enabled." : "Public backend adapter not loaded."}</p>
    </article>
  `;
}

function accountProgressSummary(account) {
  if (SatAccountEngine.accountProgressSummary) {
    return SatAccountEngine.accountProgressSummary(account, accountProfile(account.id), { emptyProfile, formatDateTime });
  }
  const p = accountProfile(account.id);
  const attempts = p.attempts.length;
  const correct = p.attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
  const latest = p.pretests?.[0];
  const attendance = p.attendance || emptyProfile().attendance;
  const externalMinutes = (p.externalStudyLogs || []).reduce((sum, log) => sum + (Number(log.minutes) || 0), 0);
  const weeklyTarget = Number(account.studyPlan?.weeklyTarget) || 4;
  const nextSession = account.studyPlan?.nextSessionAt ? formatDateTime(account.studyPlan.nextSessionAt) : "No session scheduled";
  return {
    attempts,
    accuracy,
    latestBaseline: latest ? `Baseline ${latest.scoreEstimate}` : "No diagnostic",
    points: attendance.points || 0,
    streak: p.streak?.count || 0,
    externalMinutes,
    weeklyTarget,
    schedule: nextSession,
  };
}

function exportState() {
  const exportPayload = canAccessPrivateContent()
    ? state
    : {
        ...state,
        sourceSignals: [],
        questions: visibleQuestionBank(),
      };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sat-studio-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importStateFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = normalizeState(JSON.parse(String(reader.result)));
      Object.assign(state, imported);
      saveState();
      hydrateFilters();
      renderAuth();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function formatDate(value) {
  if (!value) return "";
  const locale = state.language === "vi" ? "vi-VN" : undefined;
  return new Date(value).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "";
  const locale = state.language === "vi" ? "vi-VN" : undefined;
  return new Date(value).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${Math.round(value)} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  if (SatRichText.escapeHtml) return SatRichText.escapeHtml(value);
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderExplanation(value, selectedAnswer) {
  if (SatRichText.renderExplanation) return SatRichText.renderExplanation(value, selectedAnswer);
  if (typeof value === "object" && value !== null) {
    let html = `<div class="explanation-block correct-block"><strong>Tại sao đáp án đúng:</strong><br>${renderFormattedText(value.correct || "")}</div>`;
    
    if (selectedAnswer && value.distractors && value.distractors[selectedAnswer]) {
      html += `<div class="explanation-block wrong-block highlight"><strong>🔥 Tại sao lựa chọn của bạn (${selectedAnswer}) sai:</strong><br>${renderFormattedText(value.distractors[selectedAnswer])}</div>`;
    }
    
    html += `<details class="explanation-toggle"><summary>Xem giải thích các phương án khác</summary><div class="explanation-others">`;
    for (const [key, exp] of Object.entries(value.distractors || {})) {
      if (key !== selectedAnswer) {
        html += `<div><strong>Tại sao ${key} sai:</strong><br>${renderFormattedText(exp)}</div>`;
      }
    }
    html += `</div></details>`;
    return html;
  }
  return renderFormattedText(value || "No explanation recorded.");
}

function renderFormattedText(value) {
  if (SatRichText.renderFormattedText) return SatRichText.renderFormattedText(value);
  const tokens = [];
  const stash = (html) => {
    const token = `@@SAT_RICH_${tokens.length}@@`;
    tokens.push([token, html]);
    return token;
  };

  let html = escapeHtml(value);

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
